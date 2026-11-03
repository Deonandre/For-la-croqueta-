#!/usr/bin/env python3
"""IB ESS word counter.

Excludes, per IB requirements: charts/diagrams, data tables, equations/formulae/
calculations, citations and references, bibliography and headers.
Blocks wrapped in <!--NOCOUNT--> ... <!--/NOCOUNT--> are excluded wholesale
(title page, contents, tables, figure captions, references, appendices).
"""
import re
import sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "IA_Cocoa_Deforestation_Cameroon.md")
text = path.read_text(encoding="utf-8")

# 1. Remove explicitly excluded blocks (tables, captions, references, appendices...)
text = re.sub(r"<!--NOCOUNT-->.*?<!--/NOCOUNT-->", " ", text, flags=re.S)
# 2. Remove any remaining HTML comments
text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
# 3. Remove headers (markdown headings) -- excluded by IB
text = re.sub(r"(?m)^\s{0,3}#{1,6}\s.*$", " ", text)
# 4. Remove markdown table rows -- data tables excluded
text = re.sub(r"(?m)^\s*\|.*$", " ", text)
# 5. Remove blockquote status notes
text = re.sub(r"(?m)^\s*>.*$", " ", text)

prose = text

# 6. Remove in-text citations: any parenthetical containing a 4-digit year
cite_pat = r"\([^()]*\b(?:19|20)\d{2}[a-z]?\b[^()]*\)"
no_cites = re.sub(cite_pat, " ", prose)

# 7. Remove statistical results / calculations (IB excludes equations & calculations)
calc_pat = (
    r"\([^()]*(?:=|≈|<|>|±|%)[^()]*\)"      # parenthetical containing an operator
    r"|(?:r|rₛ|p|n|α)\s*[=≈]\s*[^\s,;.)]+"  # inline statistic like  r = 0.45
    r"|\{\{[^}]*\}\}"                        # unfilled placeholders
    r"|Δ\s*[A-Za-z]?[ₜ\d]*\s*=\s*[^.;]*"     # formulae
)
no_calc = re.sub(calc_pat, " ", no_cites)


def count(s: str) -> int:
    s = re.sub(r"[*_`>#]", " ", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)  # links -> link text
    return len([w for w in re.split(r"\s+", s) if re.search(r"[A-Za-zÀ-ÿ0-9]", w)])


raw = count(prose)
wo_cites = count(no_cites)
strict = count(no_calc)

print(f"{'Raw body prose (headers/tables/refs already removed)':<56}{raw:>7}")
print(f"{'  minus in-text citations':<56}{wo_cites:>7}")
print(f"{'  minus citations AND equations/calculations':<56}{strict:>7}   <-- IB count")
print()
print(f"IB maximum: 3000   |   target band: 2700-2900")
status = "OK" if 2700 <= strict <= 2900 else ("UNDER" if strict < 2700 else "OVER")
print(f"Status: {status}  (IB count = {strict})")
