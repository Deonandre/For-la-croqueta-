"""Turn a raw essay into scored sentences and excluded regions, keeping exact character offsets.

Only the student's own prose is scored. Everything that is formulaic by nature, and would cause
false positives, is excluded and shown greyed out in the UI: headings, table of contents,
bibliography and appendices, reference entries, quotations, tables, figure captions and equations.
"""

from __future__ import annotations

import bisect
import re
from dataclasses import dataclass, field

# --------------------------------------------------------------------------------------------
# Language detection (French / English only, stopword vote)
# --------------------------------------------------------------------------------------------

_FR_STOP = set(
    """le la les de des du un une et est en que qui dans pour pas sur au aux ce cette ces il elle
    ils elles nous vous on ne se sont par plus avec son sa ses leur leurs mais ou donc car comme
    être été aussi très sans sous entre dont où ainsi alors lors chez peut fait faire tout tous
    cela ceci été était sont ont avait lui y l d qu n s c j m t""".split()
)
_EN_STOP = set(
    """the of and to in is that it for as with was on be by this are which from at or an not have
    has were but their its can these also been would there they we our than more other such into
    only may will should could when while what how however therefore i you he she""".split()
)
_WORD_RE = re.compile(r"[a-zàâäçéèêëîïôöùûüÿœæ]+")


def detect_language(text: str) -> str:
    """Return "fr" or "en" for the dominant language of ``text``."""
    words = _WORD_RE.findall(text.lower())
    fr = sum(w in _FR_STOP for w in words)
    en = sum(w in _EN_STOP for w in words)
    return "fr" if fr > en else "en"


def word_count(text: str) -> int:
    return len(re.findall(r"\w+", text))


def normalize_ws(text: str) -> str:
    return " ".join(text.split())


# --------------------------------------------------------------------------------------------
# Sentence splitting with offsets
# --------------------------------------------------------------------------------------------

_ABBREVIATIONS = {
    # English
    "e.g", "i.e", "etc", "al", "dr", "mr", "mrs", "ms", "prof", "fig", "figs", "vs", "approx", "p",
    "pp", "no", "vol", "ch", "ed", "eds", "st", "jr", "sr", "inc", "ltd", "co", "cf", "ca", "c",
    "est", "dept", "univ", "u.s", "u.k", "a.m", "p.m", "min", "max", "sq", "eq", "resp", "viz",
    # French
    "m", "mm", "mme", "mmes", "mlle", "pr", "ex", "env", "art", "chap", "éd", "n°", "av", "apr",
    "j.-c", "ste", "c.-à-d", "coll", "op", "cit", "ibid", "réf", "tab", "hab", "cad", "ss", "suiv",
}
_BOUNDARY_RE = re.compile(r"([.!?…]+)([\"”»’')\]]*)(\s+)")
_PREV_TOKEN_RE = re.compile(r"([\w.\-°]+)$")


def _is_boundary(text: str, punct_start: int, punct: str, next_pos: int) -> bool:
    nxt = text[next_pos] if next_pos < len(text) else ""
    if not punct.startswith(".") or len(punct) > 1:
        # "!", "?", "…" or "..." end a sentence unless the next word continues it in lowercase.
        return not nxt.islower()
    m = _PREV_TOKEN_RE.search(text, 0, punct_start)
    prev = m.group(1) if m else ""
    low = prev.lower().strip(".")
    if low in _ABBREVIATIONS:
        return False
    if len(prev) == 1 and prev.isupper():  # initial, e.g. "J. Smith"
        return False
    if nxt and (nxt.islower() or nxt in ",;:"):
        return False
    return True


def split_sentences(text: str, offset: int = 0) -> list[tuple[int, int]]:
    """Split ``text`` into sentences; returns (start, end) spans shifted by ``offset``."""
    spans: list[tuple[int, int]] = []
    start = 0
    for m in _BOUNDARY_RE.finditer(text):
        if _is_boundary(text, m.start(1), m.group(1), m.end()):
            end = m.end(2)
            if text[start:end].strip():
                spans.append((start, end))
            start = m.end()
    if text[start:].strip():
        spans.append((start, len(text)))
    out = []
    for s, e in spans:
        while s < e and text[s].isspace():
            s += 1
        while e > s and text[e - 1].isspace():
            e -= 1
        if e > s:
            out.append((s + offset, e + offset))
    return out


# --------------------------------------------------------------------------------------------
# Line classification
# --------------------------------------------------------------------------------------------

_BIB_RE = re.compile(
    r"^\s*(?:\d+[.)]?\s*)?(?:bibliograph(?:y|ie)|references?|références|works cited|ouvrages cités|"
    r"sources(?: consultées| citées)?|sitographie|webographie|reference list|liste des références)"
    r"\s*:?\s*$",
    re.IGNORECASE,
)
_APPENDIX_RE = re.compile(r"^\s*(?:\d+[.)]?\s*)?(?:appendi(?:x|ces)|annexes?)\b", re.IGNORECASE)
_TOC_RE = re.compile(r"(?:\.{4,}|…{2,}|\s{2,}|\t)\s*\d{1,3}\s*$")
_CAPTION_RE = re.compile(
    r"^\s*(?:figure|fig\.|table|tableau|graph|graphique|chart|image|illustration|diagram|diagramme|"
    r"photo|map|carte|source)\s*[\dIVX]*[a-z]?\s*[:.\-–—]",
    re.IGNORECASE,
)
_NUMBERED_RE = re.compile(r"^\s*(?:\d+(?:\.\d+)*|[IVX]+|[A-H])[.)]?\s+\S")
_URL_RE = re.compile(r"https?://|www\.|doi\.org|doi:", re.IGNORECASE)
_REF_ENTRY_RE = re.compile(r"^[A-ZÀ-Ý][\w'’\-]+,\s+(?:[A-ZÀ-Ý]\.|[A-ZÀ-Ý][a-zà-ÿ]+)")
_YEAR_RE = re.compile(r"\b(?:1[5-9]|20)\d{2}\b|\bn\.d\.|\bs\.d\.")
_TERMINAL = tuple(".!?…:;\"”»)")
_MATH_CHARS = set("=+×÷^√∑∫≤≥±∆Δπ∞≈≠<>")


def _alpha_words(line: str) -> int:
    return len(re.findall(r"[^\W\d_]{3,}", line))


def classify_line(line: str, continuing_paragraph: bool = False, next_line: str = "") -> str | None:
    """Return an excluded kind for a non-prose line, or None if the line is prose.

    ``next_line`` is the line directly below (no blank line in between): if it starts in lowercase,
    this line is the start of a hard-wrapped paragraph (PDF text), not a heading.
    """
    s = line.strip()
    words = s.split()
    n = len(words)
    if not s:
        return None
    if s.startswith("#"):
        return "heading"
    if s.count("\t") >= 2 or s.count("|") >= 2:
        return "table"
    if _TOC_RE.search(s) and n <= 15:
        return "toc"
    if _CAPTION_RE.match(s) and (n <= 30 or not s.endswith(".")):
        return "caption"
    non_space = [c for c in s if not c.isspace()]
    numeric = sum(c.isdigit() or c in "%±.,/-()" for c in non_space)
    if non_space and numeric / len(non_space) > 0.4 and _alpha_words(s) < 6:
        return "table"
    if sum(c in _MATH_CHARS for c in s) >= 2 and _alpha_words(s) < 6:
        return "equation"
    if _URL_RE.search(s) and n <= 40:
        return "reference"
    if _REF_ENTRY_RE.match(s) and _YEAR_RE.search(s) and n <= 60:
        return "reference"
    if continuing_paragraph or next_line[:1].islower():
        return None
    if n <= 12 and not s.endswith(_TERMINAL[:-1]) and not s.endswith(","):
        if _NUMBERED_RE.match(s) or s[0].isupper() or s.isupper():
            return "heading"
    return None


# --------------------------------------------------------------------------------------------
# Document segmentation
# --------------------------------------------------------------------------------------------

EXCLUDED_KINDS = (
    "heading", "toc", "bibliography", "appendix", "reference", "quote", "table", "caption",
    "equation", "other",
)


@dataclass
class Segment:
    start: int
    end: int
    kind: str  # "sentence" or one of EXCLUDED_KINDS
    paragraph: int
    section: str | None = None

    @property
    def scored(self) -> bool:
        return self.kind == "sentence"


@dataclass
class Document:
    text: str
    language: str
    segments: list[Segment] = field(default_factory=list)

    def sentences(self) -> list[Segment]:
        return [s for s in self.segments if s.scored]

    def sentence_texts(self) -> list[str]:
        return [normalize_ws(self.text[s.start : s.end]) for s in self.sentences()]

    def paragraph_starts(self) -> list[bool]:
        sents = self.sentences()
        return [i == 0 or s.paragraph != sents[i - 1].paragraph for i, s in enumerate(sents)]


_QUOTE_PAIRS = [("“", "”"), ("«", "»"), ("„", "“")]


def _quoted_ranges(text: str) -> list[tuple[int, int]]:
    ranges = []
    for open_q, close_q in _QUOTE_PAIRS:
        for m in re.finditer(re.escape(open_q) + r"[^" + re.escape(close_q) + r"]{3,}" + re.escape(close_q), text):
            ranges.append((m.start(), m.end()))
    for m in re.finditer(r"\"[^\"]{3,}\"", text):
        ranges.append((m.start(), m.end()))
    return ranges


def _overlap(span: tuple[int, int], ranges: list[tuple[int, int]]) -> int:
    s, e = span
    return sum(max(0, min(e, re_) - max(s, rs)) for rs, re_ in ranges)


def _lines(text: str):
    for m in re.finditer(r"[^\n]*(?:\n|$)", text):
        if m.start() == m.end():
            continue
        raw = m.group(0)
        content = raw.rstrip("\r\n")
        lstrip = len(content) - len(content.lstrip())
        stripped = content.strip()
        start = m.start() + lstrip
        yield start, start + len(stripped), stripped


def segment_document(text: str, language: str | None = None) -> Document:
    """Split an essay into sentences (scored) and excluded regions, with exact offsets."""
    lang = language or detect_language(text)
    doc = Document(text=text, language=lang)
    n_chars = max(len(text), 1)

    # 1) group lines into paragraphs or excluded blocks
    blocks: list[tuple[int, int, str | None]] = []  # (start, end, kind or None for prose)
    cur: list[int] | None = None
    prev_prose = ""
    tail_mode: str | None = None  # "bibliography"/"appendix" once reached near the end

    def close():
        nonlocal cur
        if cur is not None:
            blocks.append((cur[0], cur[1], None))
            cur = None

    lines = list(_lines(text))
    for li, (ls, le, content) in enumerate(lines):
        next_line = lines[li + 1][2] if li + 1 < len(lines) else ""
        if not content:
            close()
            prev_prose = ""
            continue
        if _BIB_RE.match(content) and ls > 0.4 * n_chars:
            close()
            tail_mode = "bibliography"
            blocks.append((ls, le, "heading"))
            continue
        if _APPENDIX_RE.match(content) and len(content.split()) <= 8 and ls > 0.4 * n_chars:
            close()
            tail_mode = "appendix"
            blocks.append((ls, le, "heading"))
            continue
        if tail_mode:
            close()
            blocks.append((ls, le, tail_mode))
            continue
        continuing = cur is not None and bool(prev_prose) and not prev_prose.endswith(_TERMINAL)
        kind = classify_line(content, continuing_paragraph=continuing, next_line=next_line)
        if kind is not None:
            close()
            blocks.append((ls, le, kind))
            prev_prose = ""
            continue
        if continuing:
            cur[1] = le
        else:
            close()
            cur = [ls, le]
        prev_prose = content
    close()

    # 2) split prose blocks into sentences, mark quotations
    section: str | None = None
    for p_idx, (bs, be, kind) in enumerate(blocks):
        if kind == "heading":
            section = normalize_ws(text[bs:be]).lstrip("#").strip()[:80] or section
        if kind is not None:
            doc.segments.append(Segment(bs, be, kind, p_idx, section))
            continue
        block = text[bs:be]
        quotes = [(a + bs, b + bs) for a, b in _quoted_ranges(block)]
        for ss, se in split_sentences(block, offset=bs):
            s_text = text[ss:se]
            if not re.search(r"[^\W\d_]{2,}", s_text):
                k = "other"
            elif quotes and _overlap((ss, se), quotes) > 0.6 * (se - ss):
                k = "quote"
            else:
                k = "sentence"
            doc.segments.append(Segment(ss, se, k, p_idx, section))
    return doc


def sentence_index_for_offsets(spans: list[tuple[int, int]], positions: list[int]) -> list[int]:
    """Map character positions to the index of the span containing them (-1 if none)."""
    starts = [s for s, _ in spans]
    out = []
    for pos in positions:
        i = bisect.bisect_right(starts, pos) - 1
        out.append(i if i >= 0 and pos < spans[i][1] else -1)
    return out
