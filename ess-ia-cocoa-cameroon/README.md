# ESS Individual Investigation — Cocoa cultivation and tree-cover loss in Cameroon (2001–2023)

Everything needed to finish and submit this IA. **No data has been invented anywhere in this
project.** Where a number is not yet known, a `{{placeholder}}` is left visible.

## Files

| File | What it is |
|---|---|
| `IA_Cocoa_Deforestation_Cameroon.md` | The report. Sections 1–4, 8, 9 are **finished**. Sections 5–7 hold `{{placeholders}}`. |
| `DATA_VERIFICATION_REPORT.md` | Dataset verification, caveats, and exact download instructions. **Read this first.** |
| `analysis/ess_analysis.py` | Runs every table, figure and statistic, then writes `IA_FINAL.md` with the numbers filled in. |
| `scripts/wordcount.py` | IB-rules word counter (excludes headers, tables, figures, calculations, citations, references, appendices). |
| `scripts/build_docx.sh` | Builds `.docx` and `.pdf`. |
| `output/` | Generated tables, figures and documents. |
| `data/` | **Put the two downloaded CSVs here.** |

## Three steps to finish

1. Download the two CSVs — exact click-path in `DATA_VERIFICATION_REPORT.md` §3 — into `data/`.
2. `python3 analysis/ess_analysis.py`  → writes `IA_FINAL.md` plus all tables and figures.
3. `bash scripts/build_docx.sh IA_FINAL.md` → submission-ready document.

Then fill in: candidate code, access dates, GFW dataset version, and the page numbers in the
contents table.

## Word count

`python3 scripts/wordcount.py` currently reports **2,884** against the IB maximum of 3,000.
Even the most conservative count — keeping in-text citations *and* inline statistics, both of which
IB excludes — is **2,970**, so there is margin either way. Adding the real numbers changes the count
by only a few words, because figures and calculations are themselves excluded.

## Criterion-by-criterion self-assessment

Honest assessment of where the report stands now. This is my judgement, not a predicted grade.

| Criterion | Marks | State | Comment |
|---|---|---|---|
| **A** Research question and inquiry | 4 | **Complete** | Question is focused and answerable; independent/dependent variables defined with units; spatial and temporal boundaries justified by data availability rather than asserted. Context establishes why the answer is not obvious in advance. |
| **B** Strategy | 4 | **Complete** | Four perspectives (smallholders, state, conservation, consumers/regulators) are tied to environmental value systems, and three strategies are each given a genuine drawback. The land-sharing/land-sparing tension via Gockowski & Sonwa is the strongest element — it shows a conservation strategy that may be counterproductive. |
| **C** Method | 4 | **Complete** | Reproducible: exact FAOSTAT codes, GFW widget settings, canopy threshold, scripted processing. Another student could repeat it exactly. Choice of Spearman over Pearson is justified from the data's properties, not asserted. |
| **D** Treatment of data | 6 | **Framework only** | Tables, percentage changes, graphs, scatter and correlation are all built and tested, but **cannot be completed without the two CSVs**. This is the main outstanding gap. |
| **E** Analysis and conclusion | 6 | **Reasoning complete, values pending** | Confounders, alternative explanations, the correlation-is-not-causation limit and the agroforestry detection problem are all argued. The conclusion sentence structure is written but needs real coefficients. |
| **F** Evaluation | 6 | **Complete** | Limitations are specific to *these* datasets rather than generic: the 2011 GFW algorithm break, FAO imputation smoothing the series, national aggregation causing the ecological fallacy, low power at n ≈ 22, and the harvested-area/planted-area lag. Improvements are concrete and proportionate. |

### What is still weak

- **D and E cannot be finished without the data.** Nothing else in the report is blocking.
- The design is correlational at national scale, which **cannot** attribute loss to cocoa. The report
  says so plainly rather than overclaiming — this protects E and F, but it does cap how strong the
  conclusion can be. A sub-national design would be stronger; that is stated under Improvements.
- Candidate code, access dates, GFW version string and page numbers are placeholders.

## Academic integrity checklist

- [x] No fabricated data, statistics or observations.
- [x] No invented references — every source below was verified during preparation.
- [x] All explanations written originally; no text copied from any website, article or past IA.
- [x] APA 7 in-text citations match the reference list one-to-one.
- [x] Only sources actually consulted are listed.
- [x] Tree-cover loss and deforestation kept strictly distinct throughout.
- [x] Cocoa production and harvested area kept strictly distinct throughout.
- [x] No causal claim made from correlation.
- [ ] Final similarity check — run your school's tool. No one can guarantee a similarity percentage.

### Reference verification status

Each was checked against indexing records during preparation:

| Source | Status |
|---|---|
| Hansen et al. (2013) *Science* 342(6160), 850–853 | verified · doi:10.1126/science.1244693 |
| Curtis et al. (2018) *Science* 361(6407), 1108–1111 | verified · doi:10.1126/science.aau3445 |
| Tyukavina et al. (2018) *Science Advances* 4(11), eaat2993 | verified · doi:10.1126/sciadv.aat2993 |
| Ordway, Asner & Lambin (2017) *ERL* 12(4), 044015 | verified · doi:10.1088/1748-9326/aa6509 |
| Gockowski & Sonwa (2011) *Environmental Management* 48(2), 307–321 | verified · doi:10.1007/s00267-010-9602-3 |
| FAO (2020) *Global Forest Resources Assessment 2020* | verified · doi:10.4060/ca9825en |
| Regulation (EU) 2023/1115 | verified · EUR-Lex |
| FAOSTAT QCL; Global Forest Watch; World Bank Open Data | datasets — **you must add your own access date** |

## Figures

Colours are `#1f6fb2` / `#d95f02`, checked with a colour-vision-deficiency validator
(ΔE 22.3 protanopia, 31.3 normal vision, contrast ≥ 3:1) so the figures survive both colourblind
readers and greyscale printing. Figure 1 deliberately uses **two stacked panels rather than a
dual y-axis**, because two different scales on one axis can be made to show any relationship you
like; Figure 1b indexes both series to a common base for honest visual comparison.
