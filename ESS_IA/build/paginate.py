"""Measure the page on which every heading starts in the rendered PDF.

  python3 build/paginate.py            -> writes build/toc_pages.json
  python3 build/paginate.py --check    -> verifies the numbers printed in the TOC match the real pages

Page numbers are the physical page numbers of the PDF (the cover is page 1), which is what the
document footer prints.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import pymupdf

BUILD = Path(__file__).resolve().parent
PDF = BUILD.parent / "ESS_IA_Cameroon_TreeCoverLoss_CO2.pdf"


def norm(s):
    s = unicodedata.normalize("NFKC", s).replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", s).strip()


entries = json.loads((BUILD / "toc_entries.json").read_text())
doc = pymupdf.open(PDF)

# find the page(s) holding the table of contents
toc_pages = [i for i, p in enumerate(doc) if "TABLE OF CONTENTS" in p.get_text()]
assert toc_pages, "TOC page not found"
first_body = max(toc_pages) + 1

# collect bold heading lines (font size >= 11 pt) on body pages
heading_page = {}
for i in range(first_body, doc.page_count):
    for block in doc[i].get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = [s for s in line["spans"] if s["text"].strip()]
            if not spans:
                continue
            text = norm("".join(s["text"] for s in line["spans"]))
            bold = all((s["flags"] & 16) or "Bold" in s["font"] for s in spans)
            big = max(s["size"] for s in spans) >= 11
            if bold and big and text not in heading_page:
                heading_page[text] = i + 1  # physical page number

result, missing = {}, []
for e in entries:
    key = norm(e["text"])
    if key in heading_page:
        result[e["anchor"]] = heading_page[key]
    else:
        missing.append(e["text"])
if missing:
    sys.exit(f"Headings not found in PDF: {missing}")

# page order must follow document order
pages = [result[e["anchor"]] for e in entries]
assert pages == sorted(pages), f"pages not monotonic: {pages}"

if "--check" in sys.argv:
    expected = json.loads((BUILD / "toc_pages.json").read_text())
    toc_text = "\n".join(doc[i].get_text() for i in toc_pages)
    problems = [e["text"] for e in entries if result[e["anchor"]] != expected[e["anchor"]]]
    # also confirm each TOC line shows the right number
    for e in entries:
        line = norm(e["text"])
        m = re.search(re.escape(line) + r"[ .…]*\s*(\d+)", norm(toc_text))
        if not m or int(m.group(1)) != result[e["anchor"]]:
            problems.append(f"TOC line: {e['text']} -> {m.group(1) if m else 'not found'} vs {result[e['anchor']]}")
    if problems:
        sys.exit("MISMATCH: " + "; ".join(problems))
    print(f"TOC check passed: {len(entries)} entries, pages {pages[0]}–{pages[-1]}, "
          f"document has {doc.page_count} pages (TOC on page {toc_pages[0] + 1}).")
else:
    (BUILD / "toc_pages.json").write_text(json.dumps(result, indent=2))
    for e in entries:
        print(f"{'  ' if e['level'] == 2 else ''}{e['text']} .... {result[e['anchor']]}")
