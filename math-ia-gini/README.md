# Maths IA (AA SL): Gini coefficient from cubic Lorenz-curve models

**Submit `IA_Final_Submission.docx`.** It is the complete IA in your own words: cover page, table of contents, your text (from `draft/student_rewrite.docx`, with only word-level corrections), tables, formulas, 3 figures, references and appendices (preview: `IA_Final_Submission_preview.pdf`).

- `Corrections_to_your_text.docx`: every paragraph where a word was changed, with the removed words struck through and the added words underlined.
- `IA_Complete_Gini_Lorenz_South_Africa_Norway.docx` and `IA_Written_Text_Only.docx`: the earlier drafts, before your rewrite.

## Files

| File | What it is |
|---|---|
| `data/pip_ZAF_NOR_all_years.csv` | World Bank PIP download (all survey years, ZAF and NOR); the 2022 rows are used |
| `analysis.py` | Every calculation: Lorenz points, trapezium rule, Model 1, Model 2 (hand method), checks, integrals, errors |
| `figures.py` | Figures 1–3 (black and grey) from `output/results.json` |
| `build_submission.py` | Builds `IA_Final_Submission.docx` from `draft/IA_submission.md` and the corrections document |
| `draft/IA_submission.md` | The final IA: your text with the tables, formulas and figures |
| `draft/student_rewrite.docx` | Your rewritten text, as you sent it |
| `build_ia.py` | Fills `draft/IA_template.md` with the results and builds the Word file; re-checks every worked calculation and every numerical claim in the text |
| `draft/IA_template.md` | The IA text, with every number written as a «formula» |
| `draft/IA_final.md` | The complete IA text with the numbers filled in |
| `draft/IA_written_text_only.md` | The written-only version |
| `draft/reference.docx` | Word styles (A4, Calibri 11 pt, black only, 2 cm margins, page numbers, 9 pt tables) |
| `draft/math2text.lua` | Turns inline formulas into plain text for the written-only version |

## Rebuild

    pip install numpy matplotlib pypandoc_binary
    python3 analysis.py --selftest
    python3 analysis.py data/pip_ZAF_NOR_all_years.csv 2022 ZAF NOR --out output
    python3 figures.py output
    python3 build_ia.py
    python3 build_submission.py
