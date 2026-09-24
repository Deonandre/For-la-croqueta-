"""OpenRouter client (one API key -> many model families) with disk cache, retries and spend tracking."""

from __future__ import annotations

import hashlib
import json
import os
import random
import re
import threading
import time
from pathlib import Path

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1"


class BudgetExceeded(RuntimeError):
    pass


class LLMClient:
    def __init__(self, api_key: str | None = None, base_url: str = OPENROUTER_URL, cache_dir: str | Path = ".cache/llm",
                 budget_usd: float = 50.0, timeout: float = 180.0, max_retries: int = 6):
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        if not self.api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not set (add it to the environment's settings).")
        self.base_url = base_url.rstrip("/")
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.budget_usd = budget_usd
        self.max_retries = max_retries
        self.http = httpx.Client(timeout=timeout, headers={
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://github.com/Deonandre/ai-detector",
            "X-Title": "Plume AI detector (training data)",
        })
        self._lock = threading.Lock()
        self.spent_usd = 0.0
        self._prices: dict[str, tuple[float, float]] | None = None

    # ---- model catalogue -----------------------------------------------------------------
    def models(self) -> list[dict]:
        r = self.http.get(f"{self.base_url}/models")
        r.raise_for_status()
        return r.json()["data"]

    def _price(self, model: str) -> tuple[float, float]:
        if self._prices is None:
            self._prices = {}
            for m in self.models():
                p = m.get("pricing") or {}
                self._prices[m["id"]] = (float(p.get("prompt") or 0), float(p.get("completion") or 0))
        return self._prices.get(model, (0.0, 0.0))

    # ---- completions ---------------------------------------------------------------------
    def complete(self, model: str, messages: list[dict], temperature: float = 0.8, max_tokens: int = 2500) -> str:
        key = hashlib.sha256(json.dumps([model, messages, temperature, max_tokens], sort_keys=True).encode()).hexdigest()
        path = self.cache_dir / f"{key}.json"
        if path.exists():
            return json.loads(path.read_text())["text"]
        with self._lock:
            if self.spent_usd >= self.budget_usd:
                raise BudgetExceeded(f"budget of ${self.budget_usd:.2f} reached")
        body = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
        for attempt in range(self.max_retries):
            try:
                r = self.http.post(f"{self.base_url}/chat/completions", json=body)
                if r.status_code in (429, 500, 502, 503, 504):
                    raise httpx.HTTPStatusError("retryable", request=r.request, response=r)
                r.raise_for_status()
                data = r.json()
                text = data["choices"][0]["message"]["content"] or ""
                usage = data.get("usage") or {}
                pin, pout = self._price(model)
                cost = usage.get("prompt_tokens", 0) * pin + usage.get("completion_tokens", 0) * pout
                with self._lock:
                    self.spent_usd += cost
                path.write_text(json.dumps({"model": model, "text": text, "usage": usage, "cost": cost}))
                return text
            except (httpx.HTTPError, KeyError, IndexError) as e:
                if attempt == self.max_retries - 1:
                    raise RuntimeError(f"{model}: request failed after {self.max_retries} attempts: {e}") from e
                time.sleep(min(60, 2 ** attempt + random.random()))
        raise AssertionError("unreachable")


_SKIP_MODEL = re.compile(r"embed|guard|moderation|audio|tts|whisper|image|vision|search|online|:free|:extended|coder|math|instruct-beta", re.I)


def discover_generators(models: list[dict], providers: list[str], max_completion_price_per_mtok: float) -> list[str]:
    """Pick the newest affordable chat model for each provider (e.g. openai, anthropic, google...)."""
    chosen = []
    for prov in providers:
        cands = []
        for m in models:
            mid = m.get("id", "")
            if not mid.startswith(prov + "/") or _SKIP_MODEL.search(mid):
                continue
            arch = (m.get("architecture") or {}).get("modality", "text->text")
            if not arch.endswith("->text"):
                continue
            price = float((m.get("pricing") or {}).get("completion") or 0) * 1e6
            if price <= 0 or price > max_completion_price_per_mtok:
                continue
            cands.append((m.get("created", 0), mid))
        if cands:
            chosen.append(max(cands)[1])
    return chosen


class FakeLLM:
    """Deterministic offline stand-in used by tests and the smoke pipeline."""

    spent_usd = 0.0
    _EN = [
        "Furthermore, it is important to note that {w} plays a crucial role in this context.",
        "This highlights the complex interplay between {w} and the broader framework of the investigation.",
        "Ultimately, a nuanced understanding of {w} provides valuable insights into the research question.",
        "In conclusion, the evidence suggests that {w} significantly shapes the observed outcomes.",
    ]
    _FR = [
        "Par ailleurs, il est essentiel de souligner que {w} joue un rôle crucial dans ce contexte.",
        "Cela met en lumière l'interaction complexe entre {w} et le cadre plus large de l'étude.",
        "En définitive, une compréhension nuancée de {w} offre un éclairage précieux sur la question de recherche.",
        "En conclusion, les éléments recueillis suggèrent que {w} influence nettement les résultats observés.",
    ]

    def complete(self, model: str, messages: list[dict], temperature: float = 0.8, max_tokens: int = 2500) -> str:
        prompt = messages[-1]["content"]
        rng = random.Random(hashlib.md5((model + prompt).encode()).hexdigest())
        fr = bool(re.search(r"\b(Rédige|Écris|Réécris|Paraphrase le|Corrige|Traduis le texte suivant en français|Rends|Améliore)\b", prompt))
        if "Translate the following text into English" in prompt:
            fr = False
        words = re.findall(r"[A-Za-zÀ-ÿ]{6,}", prompt) or ["analysis"]
        tmpl = self._FR if fr else self._EN
        n = rng.randint(3, 6)
        return " ".join(rng.choice(tmpl).format(w=rng.choice(words).lower()) for _ in range(n))
