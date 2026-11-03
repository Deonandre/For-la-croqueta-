#!/usr/bin/env python3
"""Build the submission-ready IA document: title page, paginated table of
contents, embedded figures, real page numbers in the footer.

Two passes: the document is rendered once to discover which page each heading
lands on, then rebuilt with those page numbers written into the contents table.

Usage:  python3 scripts/build_document.py [source.md]
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import pandas as pd
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wordcount import counts  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output"
OUT.mkdir(exist_ok=True)

FONT = "Times New Roman"
SIZE = Pt(12)
CANDIDATE = "[INSERT CANDIDATE CODE]"
SESSION = "May 2026"
TITLE = "Population Growth and Deforestation Emissions in Cameroon, 1961–2023"
RQ = ("To what extent is population growth associated with CO₂ emissions from "
      "land-use change in Cameroon between 1961 and 2023?")


# ------------------------------------------------------------------ helpers
def field(paragraph, code: str) -> None:
    """Insert a Word field (used for the PAGE number in the footer)."""
    run = paragraph.add_run()
    a = OxmlElement("w:fldChar"); a.set(qn("w:fldCharType"), "begin")
    b = OxmlElement("w:instrText"); b.set(qn("xml:space"), "preserve"); b.text = code
    c = OxmlElement("w:fldChar"); c.set(qn("w:fldCharType"), "end")
    for el in (a, b, c):
        run._r.append(el)
    run.font.name = FONT
    run.font.size = SIZE


INLINE = re.compile(r"(\*\*.+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)", re.S)


def write_inline(par, text: str, italic_all: bool = False) -> None:
    """Render **bold**, *italic* and `code` into runs."""
    for part in INLINE.split(text):
        if not part:
            continue
        bold = italic = False
        if part.startswith("**") and part.endswith("**"):
            part, bold = part[2:-2], True
        elif part.startswith("*") and part.endswith("*"):
            part, italic = part[1:-1], True
        elif part.startswith("`") and part.endswith("`"):
            part = part[1:-1]
        run = par.add_run(part.replace("\n", " "))
        run.bold = bold
        run.italic = italic or italic_all
        run.font.name = FONT
        run.font.size = SIZE


def body_par(doc, text, indent=True, spacing=2.0, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.line_spacing = spacing
    pf.space_after = Pt(0)
    pf.first_line_indent = Inches(0.5) if indent else Inches(0)
    p.alignment = align
    write_inline(p, text)
    return p


def heading(doc, text, level=1):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.line_spacing = 2.0
    pf.space_before = Pt(12 if level == 1 else 8)
    pf.space_after = Pt(0)
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = FONT
    r.font.size = SIZE
    return p


def caption(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.line_spacing = 1.0
    pf.space_before = Pt(4)
    pf.space_after = Pt(14)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    m = re.match(r"(Figure \d+\.|Table \d+\.)\s*(.*)", text, re.S)
    if m:
        r = p.add_run(m.group(1) + " ")
        r.bold = True; r.font.name = FONT; r.font.size = Pt(10)
        r2 = p.add_run(m.group(2).replace("\n", " "))
        r2.font.name = FONT; r2.font.size = Pt(10)
    else:
        r = p.add_run(text); r.font.name = FONT; r.font.size = Pt(10)


def add_table(doc, header, rows, widths=None, font_size=9, caption_text=None):
    if caption_text:
        caption(doc, caption_text)
    t = doc.add_table(rows=1, cols=len(header))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(header):
        cell = t.rows[0].cells[i]
        cell.text = ""
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(str(h)); r.bold = True
        r.font.name = FONT; r.font.size = Pt(font_size)
    for row in rows:
        cells = t.add_row().cells
        for i, v in enumerate(row):
            cells[i].text = ""
            p = cells[i].paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run("" if v is None else str(v))
            r.font.name = FONT; r.font.size = Pt(font_size)
    # repeat the header row when the table breaks across pages
    trPr = t.rows[0]._tr.get_or_add_trPr()
    th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true")
    trPr.append(th)
    if widths:
        # Word/LibreOffice honour column widths only with a fixed table layout,
        # and w:tblLayout must sit before w:tblLook in tblPr to be read at all.
        t.autofit = False
        tblPr = t._tbl.tblPr
        for el in tblPr.findall(qn("w:tblLayout")):
            tblPr.remove(el)
        layout = OxmlElement("w:tblLayout")
        layout.set(qn("w:type"), "fixed")
        look = tblPr.find(qn("w:tblLook"))
        if look is not None:
            look.addprevious(layout)
        else:
            tblPr.append(layout)
        # the grid is what actually fixes the columns
        for i, w in enumerate(widths):
            t.columns[i].width = Inches(w)
        for row in t.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Inches(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return t


# ------------------------------------------------------------- table content
SOURCES_HEADER = ["Variable used", "Column", "Unit", "Original source", "Coverage obtained"]
SOURCES_ROWS = [
    ["CO₂ from land-use change", "land_use_change_co2", "Mt CO₂ yr⁻¹",
     "Global Carbon Budget (2025)", "1961–2023, complete"],
    ["Population", "population", "people",
     "Our World in Data population series (2024)", "1961–2023, complete"],
    ["GDP", "gdp", "int-$, 2011 prices",
     "Maddison Project Database 2023", "1961–2022 (2023 missing)"],
    ["Fossil CO₂ (context)", "co2", "Mt CO₂ yr⁻¹",
     "Global Carbon Budget (2025)", "1961–2023, complete"],
]


def table3_rows():
    res = json.loads((OUT / "results.json").read_text())
    order = [("primary", "Annual population growth vs emissions (primary)"),
             ("levels", "Population (levels) vs emissions"),
             ("first_differences", "First differences (both detrended)"),
             ("gdp_per_capita", "GDP per capita vs emissions"),
             ("trend", "Year vs emissions (trend test)"),
             ("early_1961_1990", "Annual population growth vs emissions, 1961–1990"),
             ("late_1991_2023", "Annual population growth vs emissions, 1991–2023")]
    rows = []
    for k, lab in order:
        r = res[k]
        rows.append([lab, r["n"], f"{r['spearman_rho']:+.3f}",
                     "< 0.001" if r["spearman_p"] < 0.001 else f"{r['spearman_p']:.3f}",
                     f"{r['pearson_r']:+.3f}", f"{r['crit']:.3f}",
                     "yes" if r["significant"] else "no"])
    for r in res["lags"]:
        rows.append([f"Lag {r['lag']} year(s)", r["n"], f"{r['spearman_rho']:+.3f}",
                     "< 0.001" if r["spearman_p"] < 0.001 else f"{r['spearman_p']:.3f}",
                     f"{r['pearson_r']:+.3f}", f"{r['crit']:.3f}",
                     "yes" if r["significant"] else "no"])
    return rows


def appendix_rows():
    df = pd.read_csv(OUT / "table1_cameroon.csv")
    rows = []
    for _, r in df.iterrows():
        rows.append([
            int(r.year),
            f"{r.population:,.0f}",
            "" if pd.isna(r.pop_delta) else f"{r.pop_delta:,.0f}",
            f"{r.land_use_change_co2:,.2f}",
            f"{r.luc_per_capita:,.2f}",
            f"{r.co2:,.2f}" if not pd.isna(r.co2) else "",
            f"{r.gdp_per_capita:,.0f}" if not pd.isna(r.gdp_per_capita) else ""])
    return rows


def appendix_b_lines():
    txt = (OUT / "appendix_b_spearman.md").read_text().splitlines()
    return [l for l in txt if l.strip().startswith(("n =", "rs =", "Tie-corrected", "Critical"))]


# --------------------------------------------------------------- the builder
def build(src: Path, page_of: dict[str, int] | None, dest: Path) -> list[str]:
    md = src.read_text()
    doc = Document()

    st = doc.styles["Normal"]
    st.font.name = FONT
    st.font.size = SIZE
    st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    for s in doc.sections:
        s.top_margin = s.bottom_margin = s.left_margin = s.right_margin = Inches(1)
        fp = s.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fp.paragraph_format.space_before = Pt(0)
        field(fp, "PAGE")

    def centred(text, bold=False, size=SIZE, before=0, after=0, italic=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        pf = p.paragraph_format
        pf.line_spacing = 2.0
        pf.space_before = Pt(before)
        pf.space_after = Pt(after)
        r = p.add_run(text)
        r.bold = bold; r.italic = italic
        r.font.name = FONT; r.font.size = size
        return p

    # ---------------- page 1: title page
    centred("Environmental Systems and Societies", bold=True, before=72)
    centred("Individual Investigation", before=6)
    centred("Standard Level")
    centred("Candidate Code", bold=True, before=30)
    centred(CANDIDATE)
    centred("Examination Session: " + SESSION, before=6)
    centred("Title", bold=True, before=30)
    centred(TITLE)
    centred("Research Question", bold=True, before=24)
    centred(RQ)
    centred(f"Word Count: {counts(md)[2]:,} words", bold=True, before=30)
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

    # ---------------- page 2: table of contents
    toc_title = centred("Table of Contents", bold=True, after=8)
    toc_title.paragraph_format.line_spacing = 1.0
    toc_entries: list[tuple[str, int]] = []
    for line in md.splitlines():
        if line.startswith("## "):
            toc_entries.append((line[3:].strip(), 1))
        elif line.startswith("### "):
            toc_entries.append((line[4:].strip(), 2))
    for text, lvl in toc_entries:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.line_spacing = 1.0
        pf.space_after = Pt(1.5)
        pf.left_indent = Inches(0.0 if lvl == 1 else 0.35)
        pf.tab_stops.add_tab_stop(Inches(6.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
        r = p.add_run(text); r.bold = (lvl == 1)
        r.font.name = FONT; r.font.size = SIZE
        num = page_of.get(text, "") if page_of else ""
        r2 = p.add_run("\t" + str(num)); r2.bold = (lvl == 1)
        r2.font.name = FONT; r2.font.size = SIZE
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

    # ---------------- page 3+: body
    fig_re = re.compile(r"^!\[FIG\|([^|]+)\|([\d.]+)\|(.+?)\]\(x\)$")
    buf: list[str] = []

    def flush(ref=False):
        nonlocal buf
        if buf:
            text = " ".join(buf).strip()
            if text:
                if ref:
                    p = body_par(doc, text, indent=False, spacing=2.0,
                                 align=WD_ALIGN_PARAGRAPH.LEFT)
                    p.paragraph_format.left_indent = Inches(0.5)
                    p.paragraph_format.first_line_indent = Inches(-0.5)
                else:
                    body_par(doc, text)
            buf = []

    in_refs = False
    for raw in md.splitlines():
        line = raw.rstrip()
        if line.startswith("## "):
            flush(in_refs); in_refs = line[3:].strip().startswith("9.")
            heading(doc, line[3:].strip(), 1); continue
        if line.startswith("### "):
            flush(in_refs); heading(doc, line[4:].strip(), 2); continue
        m = fig_re.match(line)
        if m:
            flush(in_refs)
            path, width, cap = ROOT / m.group(1), float(m.group(2)), m.group(3)
            if path.exists():
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(10)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.keep_with_next = True
                p.add_run().add_picture(str(path), width=Inches(width))
                caption(doc, cap)
            continue
        if line.startswith("@REF@"):
            flush(True); buf = [line[5:].strip()]; flush(True); continue
        if line.strip() == "{{TABLE_SOURCES}}":
            flush(in_refs)
            add_table(doc, SOURCES_HEADER, SOURCES_ROWS, widths=[1.45, 1.35, 0.95, 1.5, 1.25],
                      caption_text="Table 1. Variables, units, original sources and the coverage "
                                   "actually obtained for Cameroon.")
            continue
        if line.strip() == "{{TABLE3}}":
            flush(in_refs)
            add_table(doc, ["Test", "n", "rₛ", "p (rₛ)", "Pearson r",
                            "critical |r|", "sig."],
                      table3_rows(), widths=[2.55, 0.38, 0.62, 0.68, 0.78, 0.85, 0.46],
                      font_size=8.5,
                      caption_text="Table 2. Every correlation computed, including the tests that "
                                   "weaken the headline result.")
            continue
        if line.strip() == "{{TABLE_APPENDIX}}":
            flush(in_refs)
            add_table(doc, ["Year", "Population", "Δ Population", "LUC CO₂ (Mt)",
                            "LUC CO₂ per person (t)", "Fossil CO₂ (Mt)",
                            "GDP per capita"],
                      appendix_rows(), widths=[0.55, 1.05, 0.95, 0.85, 1.05, 0.85, 0.95],
                      font_size=8,
                      caption_text="Table 3. Complete extracted dataset, Cameroon, 1961–2023.")
            continue
        if line.strip() == "{{APPENDIX_B}}":
            flush(in_refs)
            for l in appendix_b_lines():
                p = body_par(doc, l, indent=False, spacing=1.0,
                             align=WD_ALIGN_PARAGRAPH.LEFT)
                p.paragraph_format.left_indent = Inches(0.5)
                p.paragraph_format.space_after = Pt(4)
            continue
        if not line.strip():
            flush(in_refs); continue
        buf.append(line.strip())
    flush(in_refs)

    doc.save(dest)
    first_body = ""
    for ln in md.splitlines():
        s = ln.strip()
        if s and not s.startswith(("#", "!", "{", "@")):
            first_body = s
            break
    return [t for t, _ in toc_entries], re.sub(r"\s+", "", first_body)[:40]


def to_pdf(docx: Path) -> Path:
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf",
                    "--outdir", str(docx.parent), str(docx)],
                   check=True, capture_output=True, timeout=300)
    return docx.with_suffix(".pdf")


def page_map(pdf: Path, headings: list[str], body_marker: str) -> dict[str, int]:
    """Map each heading to the page it appears on, ignoring the contents pages.

    The contents page lists every heading, so searching from page 1 would match
    there. The first page carrying real body text marks where to start looking.
    """
    from pypdf import PdfReader
    pages = [re.sub(r"\s+", "", (p.extract_text() or ""))
             for p in PdfReader(str(pdf)).pages]
    body_start = next((i for i, txt in enumerate(pages) if body_marker in txt), 2)
    out: dict[str, int] = {}
    for h in headings:
        key = re.sub(r"\s+", "", h)
        for i in range(body_start, len(pages)):
            if key in pages[i]:
                out[h] = i + 1
                break
    return out


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "IA_FINAL.md"
    if not src.exists():
        print(f"ERROR: {src} not found. Run analysis/ess_analysis.py first.", file=sys.stderr)
        sys.exit(1)
    tmp = OUT / "_pass1.docx"
    print("pass 1: laying out to discover page numbers")
    heads, marker = build(src, None, tmp)
    pm = page_map(to_pdf(tmp), heads, marker)
    missing = [h for h in heads if h not in pm]
    if missing:
        print(f"  warning: no page found for {missing}")
    print(f"  located {len(pm)}/{len(heads)} headings")
    dest = OUT / "IA_Cameroon.docx"
    print("pass 2: writing final document")
    build(src, pm, dest)
    pdf = to_pdf(dest)
    for f in (tmp, tmp.with_suffix(".pdf")):
        f.unlink(missing_ok=True)
    from pypdf import PdfReader
    print(f"\nwrote {dest}")
    print(f"wrote {pdf}  ({len(PdfReader(str(pdf)).pages)} pages)")


if __name__ == "__main__":
    main()
