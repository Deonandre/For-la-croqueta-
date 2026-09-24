"""Build labelled training documents from human essays (Pangram-style "mirrors", plus mixed documents).

For every human document we produce several variants, each a list of sentences with a label:

* ``human``        the original, all HUMAN
* ``mirror``       an AI essay on the same topic and length, all AI
* ``humanized_ai`` a mirror passed through a "humanizer" rewrite, all AI
* ``mosaic``       some passages replaced by AI-written text that fits the context -> AI spans
* ``rephrase``     some passages (or all) reworded by an AI in varied styles -> REPHRASED spans
* ``polish``       grammar/spelling fixes only; REPHRASED only if the edit is substantial
* ``translation``  the whole text machine-translated FR<->EN -> all REPHRASED

Documents are assigned to train/val/test *before* generation, and held-out generator models are only
used for test documents, so the test set measures generalisation to unseen models.
"""

from __future__ import annotations

import difflib
import hashlib
import json
import logging
import random
import re
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass, field
from pathlib import Path

from ..labels import AI, HUMAN, REPHRASED
from ..textproc import segment_document, word_count
from . import ib
from .human import HumanDoc
from .llm import BudgetExceeded

log = logging.getLogger(__name__)

Paragraphs = list[list[tuple[str, int]]]  # paragraphs -> (sentence, label)


@dataclass
class Example:
    id: str
    doc_id: str
    split: str
    lang: str
    variant: str
    source: str
    task: str | None
    subject: str | None
    generators: list[str]
    sentences: list[str]
    para_starts: list[bool]
    labels: list[int]
    meta: dict = field(default_factory=dict)

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)


@dataclass
class BuildConfig:
    variants: dict = field(default_factory=lambda: {"human": 1.0, "mirror": 1.0, "mosaic": 1.0, "rephrase": 1.0,
                                                    "polish": 0.4, "translation": 0.2, "humanized_ai": 0.3})
    max_doc_words: int = 1200
    mirror_max_words: int = 900
    polish_threshold: float = 0.12
    val_fraction: float = 0.1
    test_fraction: float = 0.1
    seed: int = 13


def assign_split(doc_id: str, val: float, test: float, seed: int) -> str:
    h = int(hashlib.sha1(f"{seed}:{doc_id}".encode()).hexdigest(), 16) % 10_000 / 10_000
    return "test" if h < test else "val" if h < test + val else "train"


# ---- text helpers -------------------------------------------------------------------------------

_REFUSAL = re.compile(r"^\s*(I'm sorry|I am sorry|I can't|I cannot|As an AI|Je suis désolé|Je ne peux pas|En tant qu'IA)", re.I)
_PREAMBLE = re.compile(r"^\s*(here is|here's|sure|certainly|of course|voici|bien sûr|certainement|d'accord)\b[^\n]*[:.!]\s*\n", re.I)


def clean_llm_output(text: str) -> str | None:
    text = re.sub(r"```[a-z]*\n?|```", "", text)
    text = _PREAMBLE.sub("", text, count=1)
    text = re.sub(r"\[(MISSING PASSAGE|PASSAGE MANQUANT)\]", "", text)
    text = re.sub(r"(\*\*|__)(.+?)\1", r"\2", text)
    lines = []
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("#"):
            lines.append("")
            continue
        s = re.sub(r"^[-*•]\s+", "", s)
        lines.append(s)
    text = "\n".join(lines).strip().strip("«»\"“” ")
    if not text or _REFUSAL.match(text) or word_count(text) < 5:
        return None
    return re.sub(r"\n{3,}", "\n\n", text)


def to_paragraphs(text: str, lang: str, label: int) -> Paragraphs:
    doc = segment_document(text, lang)
    paras: Paragraphs = []
    last = None
    for seg, sent in zip(doc.sentences(), doc.sentence_texts()):
        if seg.paragraph != last:
            paras.append([])
            last = seg.paragraph
        paras[-1].append((sent, label))
    return paras


def flatten(paras: Paragraphs) -> tuple[list[str], list[bool], list[int]]:
    sents, starts, labels = [], [], []
    for p in paras:
        for j, (s, lab) in enumerate(p):
            sents.append(s)
            starts.append(j == 0)
            labels.append(lab)
    return sents, starts, labels


def excerpt(paras: Paragraphs, max_words: int, rng: random.Random) -> Paragraphs:
    total = sum(word_count(s) for p in paras for s, _ in p)
    if total <= max_words:
        return paras
    start = rng.randrange(len(paras))
    out, n = [], 0
    for p in paras[start:] + paras[:start]:
        out.append(p)
        n += sum(word_count(s) for s, _ in p)
        if n >= max_words:
            break
    return out


def _text(paras: Paragraphs) -> str:
    return "\n\n".join(" ".join(s for s, _ in p) for p in paras)


def edit_ratio(a: str, b: str) -> float:
    return 1.0 - difflib.SequenceMatcher(None, a.split(), b.split(), autojunk=False).ratio()


def choose_spans(paras: Paragraphs, rng: random.Random, max_spans: int = 3) -> list[tuple[int, int, int]]:
    """Non-overlapping (paragraph, first sentence, end sentence) spans leaving most text untouched."""
    total = sum(len(p) for p in paras)
    budget = max(1, int(total * rng.uniform(0.15, 0.6)))
    spans, used = [], 0
    order = list(range(len(paras)))
    rng.shuffle(order)
    for pi in order[: max(1, max_spans)]:
        p = paras[pi]
        if rng.random() < 0.5 or len(p) <= 2:
            a, b = 0, len(p)
        else:
            a = rng.randrange(len(p))
            b = min(len(p), a + rng.randint(1, 4))
        if used + (b - a) > budget and spans:
            continue
        spans.append((pi, a, b))
        used += b - a
    return sorted(spans)


# ---- builder ------------------------------------------------------------------------------------


class Builder:
    def __init__(self, llm, train_generators: list[str], heldout_generators: list[str], cfg: BuildConfig | None = None):
        if not train_generators:
            raise ValueError("at least one training generator is required")
        self.llm = llm
        self.train_generators = train_generators
        self.heldout_generators = heldout_generators
        self.cfg = cfg or BuildConfig()

    def _gen(self, split: str, rng: random.Random) -> str:
        if split == "test" and self.heldout_generators and rng.random() < 0.5:
            return rng.choice(self.heldout_generators)
        return rng.choice(self.train_generators)

    def _ask(self, gen: str, messages: list[dict], rng: random.Random, words: int) -> str | None:
        raw = self.llm.complete(gen, messages, temperature=round(rng.uniform(0.5, 1.1), 2), max_tokens=int(words * 3 + 200))
        return clean_llm_output(raw)

    def _replace(self, paras: Paragraphs, spans, rng, lang, make) -> tuple[Paragraphs, bool]:
        """Replace each span with ``make(span_text, before, after, words)`` -> (text, label) or None."""
        out: Paragraphs = [list(p) for p in paras]
        changed = False
        for pi, a, b in reversed(spans):  # right to left keeps indices valid
            span_text = " ".join(s for s, _ in out[pi][a:b])
            before = " ".join(s for p in out[:pi] for s, _ in p).split()[-150:]
            before = " ".join(before + [s for s, _ in out[pi][:a]])
            after = " ".join([s for s, _ in out[pi][b:]] + [s for p in out[pi + 1 :] for s, _ in p]).split()[:100]
            res = make(span_text, before, " ".join(after), max(20, word_count(span_text)))
            if res is None:
                continue
            new_text, label = res
            new_paras = to_paragraphs(new_text, lang, label)
            if not new_paras:
                continue
            if a == 0 and b == len(out[pi]):
                out[pi : pi + 1] = new_paras
            else:
                out[pi][a:b] = [x for p in new_paras for x in p]
            changed = True
        return out, changed

    def build_doc(self, doc: HumanDoc) -> list[Example]:
        cfg = self.cfg
        rng = random.Random(f"{cfg.seed}:{doc.id}")
        split = assign_split(doc.id, cfg.val_fraction, cfg.test_fraction, cfg.seed)
        lang = doc.lang if doc.lang in ("fr", "en") else "en"
        base = excerpt(to_paragraphs(doc.text, lang, HUMAN), cfg.max_doc_words, rng)
        if sum(len(p) for p in base) < 3:
            return []
        task, subject = (doc.task, doc.subject) if doc.task else ib.random_task(rng)
        examples: list[Example] = []

        def add(variant: str, paras: Paragraphs, gens: list[str], ex_lang: str = lang, **meta):
            sents, starts, labels = flatten(paras)
            if len(sents) < 3:
                return
            meta["heldout"] = any(g in self.heldout_generators for g in gens)
            examples.append(Example(
                id=f"{doc.id}-{variant}-{len(examples)}", doc_id=doc.id, split=split, lang=ex_lang, variant=variant,
                source=doc.source, task=task, subject=subject, generators=gens, sentences=sents,
                para_starts=starts, labels=labels, meta=meta,
            ))

        for variant, p in cfg.variants.items():
            count = int(p) + (rng.random() < p - int(p))
            for _ in range(count):
                gen = self._gen(split, rng)
                try:
                    if variant == "human":
                        add("human", base, [])
                    elif variant in ("mirror", "humanized_ai"):
                        words = min(cfg.mirror_max_words, max(150, int(word_count(_text(base)) * rng.uniform(0.6, 1.0))))
                        hint = " ".join(_text(base).split()[:60])
                        text = self._ask(gen, ib.mirror_messages(task, subject, lang, hint, words, rng), rng, words)
                        gens = [gen]
                        if text and variant == "humanized_ai":
                            gen2 = self._gen(split, rng)
                            text = self._ask(gen2, ib.rephrase_messages(text, lang, "humanize", rng), rng, words)
                            gens.append(gen2)
                        if text:
                            add(variant, to_paragraphs(text, lang, AI), gens)
                    elif variant == "mosaic":
                        def fill(span, before, after, words):
                            t = self._ask(gen, ib.fill_messages(before, after, lang, words, rng), rng, words)
                            return (t, AI) if t else None
                        paras, ok = self._replace(base, choose_spans(base, rng), rng, lang, fill)
                        if ok:
                            add("mosaic", paras, [gen])
                    elif variant == "rephrase":
                        style = rng.choice(list(ib.REPHRASE_STYLES))
                        def reph(span, before, after, words):
                            t = self._ask(gen, ib.rephrase_messages(span, lang, style, rng), rng, words)
                            return (t, REPHRASED) if t else None
                        spans = [(i, 0, len(p)) for i, p in enumerate(base)] if rng.random() < 0.25 else choose_spans(base, rng)
                        paras, ok = self._replace(base, spans, rng, lang, reph)
                        if ok:
                            add("rephrase", paras, [gen], style=style)
                    elif variant == "polish":
                        def pol(span, before, after, words):
                            t = self._ask(gen, ib.polish_messages(span, lang), rng, words)
                            if not t:
                                return None
                            return (t, HUMAN if edit_ratio(span, t) < cfg.polish_threshold else REPHRASED)
                        spans = [(i, 0, len(p)) for i, p in enumerate(base)] if rng.random() < 0.5 else choose_spans(base, rng)
                        paras, ok = self._replace(base, spans, rng, lang, pol)
                        if ok:
                            add("polish", paras, [gen])
                    elif variant == "translation":
                        tgt = "en" if lang == "fr" else "fr"
                        src_text = _text(excerpt(base, min(cfg.max_doc_words, 900), rng))
                        text = self._ask(gen, ib.translate_messages(src_text, lang, tgt), rng, word_count(src_text))
                        if text:
                            add("translation", to_paragraphs(text, tgt, REPHRASED), [gen], ex_lang=tgt)
                except BudgetExceeded:
                    raise
                except Exception as e:  # one bad generation must not stop the whole build
                    log.warning("doc %s variant %s with %s failed: %s", doc.id, variant, gen, e)
        return examples


def build_dataset(docs, builder: Builder, out_path: str | Path, concurrency: int = 8, max_docs: int | None = None) -> int:
    """Generate examples for all docs, appending to ``out_path`` (resumable). Returns examples written."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    done = set()
    if out_path.exists():
        with open(out_path, encoding="utf-8") as f:
            done = {json.loads(line)["doc_id"] for line in f if line.strip()}
    lock = threading.Lock()
    written = 0
    stop = threading.Event()

    def work(doc):
        if stop.is_set():
            return []
        try:
            return builder.build_doc(doc)
        except BudgetExceeded as e:
            log.warning("stopping: %s", e)
            stop.set()
            return []
        except Exception as e:
            log.warning("doc %s failed: %s", doc.id, e)
            return []

    with open(out_path, "a", encoding="utf-8") as f, ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = []
        for i, doc in enumerate(docs):
            if max_docs is not None and i >= max_docs:
                break
            if doc.id in done:
                continue
            futures.append(pool.submit(work, doc))
        for fut in as_completed(futures):
            exs = fut.result()
            with lock:
                for ex in exs:
                    f.write(ex.to_json() + "\n")
                f.flush()
                written += len(exs)
    return written


def load_examples(path: str | Path, split: str | None = None) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        rows = [json.loads(line) for line in f if line.strip()]
    return [r for r in rows if split is None or r["split"] == split]
