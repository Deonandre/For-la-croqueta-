# Maths IA (AA SL): Gini coefficient from cubic Lorenz-curve models

**The IA draft:** `IA_Gini_Lorenz_South_Africa_Norway.docx` (Word, editable equations).
`IA_Gini_Lorenz_South_Africa_Norway_preview.pdf` is a quick preview of the same file.

## Files

| File | What it is |
|---|---|
| `data/pip_ZAF_NOR_all_years.csv` | World Bank PIP download (all survey years, ZAF and NOR); the 2022 rows are used |
| `analysis.py` | Every calculation: Lorenz points, trapezium rule, Model 1, Model 2 (hand method), checks, integrals, errors |
| `figures.py` | Figures 1–6 from `output/results.json` |
| `build_ia.py` | Fills `draft/IA_template.md` with the results and builds the Word file; re-checks every worked calculation and every numerical claim in the text |
| `draft/IA_template.md` | The IA text, with every number written as a «formula» |
| `draft/IA_final.md` | The IA text with the numbers filled in |
| `draft/reference.docx` | Word styles (A4, Calibri 11 pt, 2 cm margins, 9 pt tables) |

## Rebuild

    pip install numpy matplotlib pypandoc_binary
    python3 analysis.py --selftest
    python3 analysis.py data/pip_ZAF_NOR_all_years.csv 2022 ZAF NOR --out output
    python3 figures.py output
    python3 build_ia.py
