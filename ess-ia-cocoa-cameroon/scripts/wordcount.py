#!/usr/bin/env python3
"""IB ESS word counter.

Excludes, per IB requirements: charts and diagrams, data tables, equations,
formulae and calculations, citations and references, the bibliography, and
headers. Blocks wrapped in <!--NOCOUNT--> ... <!--/NOCOUNT--> are dropped
whole, as are figure directives, table markers, the reference list and the
appendices.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

CITE = r"\([^()]*\b(?:19|20)\d{2}[a-z]?\b[^()]*\)"
CALC = (
    r"\([^()]*(?:=|≈|<|>|±|%)[^()]*\)"       # parenthetical holding an operator
    r"|(?:r|rₛ|p|n|α)\s*[=≈]\s*[^\s,;.)]+"   # inline statistic, e.g. r = 0.45
    r"|\{\{[^}]*\}\}"                         # unfilled placeholders
    r"|Δ\s*[A-Za-z]?[ₜ\d]*\s*=\s*[^.;]*"      # formulae
)


def _words(s: str) -> int:
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)   # links -> link text
    s = re.sub(r"[*_`>#]", " ", s)
    return len([w for w in re.split(r"\s+", s) if re.search(r"[A-Za-zÀ-ÿ0-9]", w)])


def counts(text: str) -> tuple[int, int, int]:
    """Return (raw prose, prose minus citations, IB countable total)."""
    t = re.sub(r"<!--NOCOUNT-->.*?<!--/NOCOUNT-->", " ", text, flags=re.S)
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    t = re.sub(r"(?m)^\s{0,3}#{1,6}\s.*$", " ", t)      # headers
    t = re.sub(r"(?m)^\s*\|.*$", " ", t)                 # tables
    t = re.sub(r"(?m)^\s*>.*$", " ", t)                  # block quotes
    t = re.sub(r"(?m)^!\[FIG\|.*$", " ", t)              # figures and captions
    t = re.sub(r"\{\{TABLE[A-Z_0-9]*\}\}|\{\{APPENDIX_B\}\}", " ", t)
    t = re.sub(r"(?m)^@REF@.*$", " ", t)                 # reference entries
    t = re.sub(r"(?s)^.*?\n(?=##\s*1\.)", " ", t, count=1)   # front matter
    t = re.sub(r"(?s)##\s*9\.\s*References.*$", " ", t)      # refs + appendices

    raw = _words(t)
    no_cites = re.sub(CITE, " ", t)
    return raw, _words(no_cites), _words(re.sub(CALC, " ", no_cites))


def main() -> None:
    p = Path(sys.argv[1] if len(sys.argv) > 1 else "IA_Population_LandUse_Cameroon.md")
    raw, wo_cites, strict = counts(p.read_text(encoding="utf-8"))
    print(f"{'Raw body prose (headers/tables/refs already removed)':<56}{raw:>7}")
    print(f"{'  minus in-text citations':<56}{wo_cites:>7}")
    print(f"{'  minus citations AND equations/calculations':<56}{strict:>7}   <-- IB count")
    print(f"\nIB maximum: 3000   |   target band: 2700-2900")
    status = "OK" if 2700 <= strict <= 2900 else ("UNDER" if strict < 2700 else "OVER")
    print(f"Status: {status}  (IB count = {strict})")


if __name__ == "__main__":
    main()
