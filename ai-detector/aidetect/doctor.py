"""Pre-flight check: is this machine ready to build, train and serve? Says exactly what is missing."""

from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from pathlib import Path

import httpx

from .data.llm import OPENROUTER_URL

# A CPU-friendly multilingual encoder (12 layers, 384 wide) for runs without a GPU.
CPU_BASE_MODEL = "intfloat/multilingual-e5-small"


@dataclass
class Check:
    name: str
    ok: bool
    detail: str
    blocks: tuple[str, ...]  # pipeline steps that cannot run while this check fails
    fix: str = ""


def _reach(url: str, client: httpx.Client) -> tuple[bool, str]:
    try:
        # streamed and closed unread: probing a model-weights URL must not download the file
        with client.stream("GET", url, headers={"Range": "bytes=0-0"}) as r:
            return r.status_code < 500 and r.status_code != 403, f"HTTP {r.status_code}"
    except httpx.ProxyError as e:
        return False, f"blocked by the network proxy ({e})"
    except httpx.HTTPError as e:
        return False, f"{type(e).__name__}: {e}"


def _hf_weights_url(base_model: str, client: httpx.Client) -> str | None:
    """Model weights are served from a CDN host that must be allowed too; find it from the redirect."""
    for name in ("model.safetensors", "pytorch_model.bin"):
        try:
            r = client.head(f"https://huggingface.co/{base_model}/resolve/main/{name}")
        except httpx.HTTPError:
            return None
        if r.status_code in (301, 302, 303, 307, 308) and "location" in r.headers:
            return r.headers["location"]
    return None


def run_checks(cfg: dict) -> list[Check]:
    checks: list[Check] = []
    key = os.environ.get("OPENROUTER_API_KEY")
    base_model = cfg.get("training", {}).get("base_model", "FacebookAI/xlm-roberta-base")
    kinds = {s.get("type") for s in cfg.get("human_sources", [])}

    with httpx.Client(timeout=20, follow_redirects=False) as client:
        ok, detail = _reach(f"{OPENROUTER_URL}/models", client)
        checks.append(Check("network: openrouter.ai", ok, detail, ("build",),
                            "allow openrouter.ai in the environment's network access"))
        if not key:
            checks.append(Check("OPENROUTER_API_KEY", False, "not set", ("build",),
                                "add OPENROUTER_API_KEY as an environment variable in the environment's settings"))
        elif ok:
            try:
                r = client.get(f"{OPENROUTER_URL}/key", headers={"Authorization": f"Bearer {key}"})
                if r.status_code == 200:
                    d = r.json().get("data", {})
                    limit = d.get("limit")
                    left = f"${limit - d.get('usage', 0):.2f} left" if limit is not None else "no spending limit"
                    checks.append(Check("OPENROUTER_API_KEY", True, f"valid ({left})", ("build",)))
                else:
                    checks.append(Check("OPENROUTER_API_KEY", False, f"rejected (HTTP {r.status_code})", ("build",),
                                        "create a new key at openrouter.ai/keys and add credit"))
            except httpx.HTTPError as e:
                checks.append(Check("OPENROUTER_API_KEY", False, f"could not verify: {e}", ("build",)))
        else:
            checks.append(Check("OPENROUTER_API_KEY", True, "set (not verified: openrouter.ai unreachable)", ("build",)))

        ok, detail = _reach(f"https://huggingface.co/api/models/{base_model}", client)
        checks.append(Check("network: huggingface.co", ok, detail, ("build", "train"),
                            "allow huggingface.co and hf.co (with subdomains) in the environment's network access"))
        if ok:
            url = _hf_weights_url(base_model, client)
            if url:
                host = httpx.URL(url).host
                ok2, detail2 = _reach(url, client)
                checks.append(Check(f"network: {host}", ok2, detail2, ("train",),
                                    f"allow {host} (or *.hf.co) in the environment's network access"))
        if "hal" in kinds:
            ok, detail = _reach("https://api.archives-ouvertes.fr/search/?q=*:*&rows=0&wt=json", client)
            checks.append(Check("network: api.archives-ouvertes.fr", ok, detail, ("build",),
                                "allow api.archives-ouvertes.fr in the environment's network access"))

    try:
        import torch

        if torch.cuda.is_available():
            checks.append(Check("GPU", True, torch.cuda.get_device_name(0), ()))
        else:
            checks.append(Check("GPU", False, f"none: CPU only ({os.cpu_count()} cores)", (),
                                f"train on a GPU machine, or a small CPU run: train --base-model {CPU_BASE_MODEL}"))
    except ImportError:
        checks.append(Check("PyTorch", False, "not installed", ("train", "serve"), "pip install -r requirements.txt"))

    free_gb = shutil.disk_usage(".").free / 1e9
    checks.append(Check("disk", free_gb > 10, f"{free_gb:.0f} GB free", ("train",), "free up space (10 GB+ recommended)"))

    local = [s for s in cfg.get("human_sources", []) if s.get("type") == "local"]
    n = sum(1 for s in local for f in Path(s["path"]).rglob("*")
            if f.suffix.lower() in {".txt", ".md", ".docx", ".pdf"}) if local and Path(local[0]["path"]).exists() else 0
    checks.append(Check("local IB essays (pre-2023)", n > 0, f"{n} files in {local[0]['path'] if local else 'n/a'}",
                        (), "optional, but the best data: add a school's pre-2023 IAs / EEs / TOK essays there"))

    models = Path("models")
    trained = [p for p in (models / "plume", models / "baseline.joblib") if p.exists()]
    checks.append(Check("trained model", bool(trained), ", ".join(map(str, trained)) or "none yet", ("serve",),
                        "run build then baseline / train"))
    return checks


STEPS = ("build", "train", "serve")


def report(checks: list[Check]) -> tuple[str, dict[str, bool]]:
    lines = []
    for c in checks:
        lines.append(f"[{'ok  ' if c.ok else 'MISS'}] {c.name}: {c.detail}"
                     + (f"  (blocks: {', '.join(c.blocks)})" if not c.ok and c.blocks else ""))
        if not c.ok and c.fix:
            lines.append(f"       -> {c.fix}")
    ready = {step: all(c.ok for c in checks if step in c.blocks) for step in STEPS}
    lines.append("")
    lines.append("   ".join(f"{step}: {'ready' if ok else 'BLOCKED'}" for step, ok in ready.items()))
    return "\n".join(lines), ready
