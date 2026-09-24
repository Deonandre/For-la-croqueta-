"""Load human-written documents from several sources into a common ``HumanDoc`` format.

Human text must predate ChatGPT (Nov. 2022) to be trusted as human. The most valuable source is a
school's own archive of IAs / Extended Essays written before 2023, placed in ``data/human/local``
(never committed to git: it is personal data).
"""

from __future__ import annotations

import csv
import hashlib
import json
import logging
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterator

from ..extract import extract_text
from ..textproc import detect_language, word_count

log = logging.getLogger(__name__)


@dataclass
class HumanDoc:
    id: str
    text: str
    lang: str
    source: str
    task: str | None = None
    subject: str | None = None
    year: int | None = None

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)


def _doc_id(source: str, key: str) -> str:
    return hashlib.sha1(f"{source}:{key}".encode()).hexdigest()[:16]


def chunk_text(text: str, min_words: int = 250, max_words: int = 1200) -> list[str]:
    """Cut long texts on paragraph boundaries into essay-sized chunks."""
    chunks, cur, n = [], [], 0
    for para in re.split(r"\n\s*\n|\n", text):
        w = word_count(para)
        if not para.strip():
            continue
        if n + w > max_words and n >= min_words:
            chunks.append("\n\n".join(cur))
            cur, n = [], 0
        cur.append(para.strip())
        n += w
    if n >= min_words:
        chunks.append("\n\n".join(cur))
    return chunks


def load_local(path: str | Path, min_words: int = 150) -> Iterator[HumanDoc]:
    """.txt/.md/.docx/.pdf files; optional ``meta.csv`` with columns file,task,subject,year,lang."""
    root = Path(path)
    if not root.exists():
        return
    meta = {}
    if (root / "meta.csv").exists():
        with open(root / "meta.csv", newline="", encoding="utf-8") as f:
            meta = {row["file"]: row for row in csv.DictReader(f)}
    for f in sorted(root.rglob("*")):
        if f.suffix.lower() not in {".txt", ".md", ".docx", ".pdf"}:
            continue
        text = extract_text(f.read_bytes(), f.name)
        if word_count(text) < min_words:
            continue
        m = meta.get(f.name, {})
        year = int(m["year"]) if m.get("year") else None
        if year and year >= 2023:
            continue  # could contain AI text: never use as "human"
        yield HumanDoc(
            id=_doc_id("local", str(f.relative_to(root))),
            text=text,
            lang=m.get("lang") or detect_language(text),
            source="local",
            task=m.get("task") or None,
            subject=m.get("subject") or None,
            year=year,
        )


def load_jsonl(path: str | Path, source: str = "jsonl") -> Iterator[HumanDoc]:
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f):
            d = json.loads(line)
            text = d["text"]
            yield HumanDoc(
                id=d.get("id") or _doc_id(source, str(i)),
                text=text,
                lang=d.get("lang") or detect_language(text),
                source=d.get("source", source),
                task=d.get("task"),
                subject=d.get("subject"),
                year=d.get("year"),
            )


def load_hf(dataset: str, lang: str, config: str | None = None, split: str = "train", text_field: str = "text",
            limit: int = 1000, min_words: int = 250, max_words: int = 1200) -> Iterator[HumanDoc]:
    """Any Hugging Face text dataset (streamed); long texts are cut into essay-sized chunks."""
    from datasets import load_dataset

    ds = load_dataset(dataset, config, split=split, streaming=True)
    n = 0
    for i, row in enumerate(ds):
        for j, chunk in enumerate(chunk_text(row[text_field], min_words, max_words)):
            yield HumanDoc(id=_doc_id(f"{dataset}/{config}", f"{i}:{j}"), text=chunk, lang=lang, source=f"hf:{dataset}")
            n += 1
            if n >= limit:
                return


def load_hal(lang: str = "fr", limit: int = 2000, years: tuple[int, int] = (2005, 2021), doc_types: str = "(THESE OR MEM OR ART)") -> Iterator[HumanDoc]:
    """Abstracts from HAL, the French open archive (theses, master's dissertations, articles)."""
    import httpx

    field = f"{lang}_abstract_s"
    params = {
        "q": "*:*",
        "fq": [f"producedDateY_i:[{years[0]} TO {years[1]}]", f"docType_s:{doc_types}", f"{field}:[* TO *]"],
        "fl": f"halId_s,{field},producedDateY_i",
        "rows": 500,
        "sort": "docid asc",
        "cursorMark": "*",
        "wt": "json",
    }
    n = 0
    with httpx.Client(timeout=60) as http:
        while n < limit:
            r = http.get("https://api.archives-ouvertes.fr/search/", params=params)
            r.raise_for_status()
            data = r.json()
            for d in data["response"]["docs"]:
                abstract = d[field][0] if isinstance(d[field], list) else d[field]
                if word_count(abstract) < 120:
                    continue
                yield HumanDoc(id=_doc_id("hal", d["halId_s"]), text=abstract, lang=lang, source="hal", year=d.get("producedDateY_i"))
                n += 1
                if n >= limit:
                    return
            nxt = data.get("nextCursorMark")
            if not nxt or nxt == params["cursorMark"]:
                return
            params["cursorMark"] = nxt


def load_sources(sources: list[dict]) -> Iterator[HumanDoc]:
    """All local documents first (the most valuable), then the other sources in turn, one document each.

    Interleaving means ``build --max-docs 200`` gets a French/English, academic/encyclopaedic mix instead
    of 200 documents from whichever source is listed first. Remote sources are opened lazily.
    """
    loaders = {"local": load_local, "jsonl": load_jsonl, "hf": load_hf, "hal": load_hal}
    iters = []
    for src in sources:
        src = dict(src)
        kind = src.pop("type")
        if kind == "local":
            yield from loaders[kind](**src)
        else:
            iters.append(loaders[kind](**src))
    while iters:
        for it in list(iters):
            try:
                yield next(it)
            except StopIteration:
                iters.remove(it)
            except Exception as e:  # e.g. a host blocked by the network: keep the other sources going
                log.warning("human source dropped after an error: %s", e)
                iters.remove(it)
