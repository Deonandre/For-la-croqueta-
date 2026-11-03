# ESS Individual Investigation — Population growth and deforestation emissions in Cameroon (1961–2023)

**Research question:** To what extent is population growth associated with CO₂ emissions from
land-use change in Cameroon between 1961 and 2023?

Complete, formatted to IB presentation conventions, and based entirely on real verified data.
Nothing is estimated, interpolated or invented.

## What to submit

**`output/IA_Cameroon.docx`** (or the matching `.pdf`) — 23 pages, 2,871 countable words,
8 figures and 3 tables.

Document structure:

| Page | Content |
|---|---|
| 1 | Title page — candidate code, subject, level, session, title, research question, word count |
| 2 | Table of contents, dot leaders, real page numbers |
| 3–19 | Body, sections 1–8, with figures and tables placed inline |
| 19–20 | References (APA 7, hanging indent) |
| 21–23 | Appendices A–D, including the complete 63-year dataset |

Times New Roman 12 pt, double-spaced, justified, first-line indents, 1-inch margins, page numbers
centred in the footer. **Page numbers in the contents are generated, not typed:** the builder lays
the document out once, reads which page each heading landed on, then rebuilds with those numbers.
Change the text and they update themselves.

**Three things still to fill in:** your **candidate code** (currently `[INSERT CANDIDATE CODE]` on
the title page), the **access date** in the Our World in Data reference, and a check that your
school wants May 2026 as the session.

## Figures

| # | Figure | Type |
|---|---|---|
| 1 | Hypothesised pathway from population growth to emissions, with confounders | conceptual systems diagram |
| 2 | Data selection, processing and the five statistical tests | methodology flowchart |
| 3 | Population and land-use-change emissions, each on its own scale | time series |
| 4 | Land-use-change emissions per person | time series |
| 5 | Emissions against annual population increase | scatter + regression |
| 6 | Spearman's rₛ against lag, with significance threshold | line |
| 7 | The relationship computed separately for 1961–1990 and 1991–2023 | paired scatter |
| 8 | Cameroon against five regional neighbours | multi-series line |

Series colours `#1f6fb2` and `#d95f02` were checked with a colour-vision-deficiency validator
(ΔE 22.3 protanopia, 31.3 normal vision, contrast ≥ 3:1), so the figures survive colourblind readers
and greyscale printing. Figure 3 uses two stacked panels rather than a dual y-axis: two scales on one
axis can be rescaled to suggest almost any relationship.

## Rebuilding everything

```bash
python3 analysis/make_diagrams.py && python3 analysis/ess_analysis.py && python3 scripts/build_document.py
```

That downloads the source data, recomputes every statistic, redraws all eight figures, substitutes
the numbers into the text and produces `output/IA_Cameroon.docx` and `.pdf`.

| File | What it is |
|---|---|
| `IA_Population_LandUse_Cameroon.md` | Editable source, with `{{placeholders}}` for every number |
| `IA_FINAL.md` | The same text with the real values substituted in |
| `analysis/ess_analysis.py` | Downloads data, runs the statistics, draws Figures 3–8 |
| `analysis/make_diagrams.py` | Draws Figures 1–2 |
| `scripts/build_document.py` | Builds the paginated DOCX and PDF |
| `scripts/wordcount.py` | IB-rules word counter |
| `DATA_VERIFICATION_REPORT.md` | Every dataset tested, adopted or rejected, and why |

## Headline findings

| Test | n | Spearman rₛ | p | Significant |
|---|---|---|---|---|
| Annual population growth vs land-use-change CO₂ | 62 | **−0.354** | 0.005 | yes |
| Population (levels) vs land-use-change CO₂ | 63 | −0.386 | 0.002 | yes |
| **First differences (both detrended)** | 62 | **−0.006** | 0.964 | **no** |
| 1961–1990 only | 29 | −0.444 | 0.016 | yes |
| 1991–2023 only | 33 | +0.324 | 0.066 | no |

Population grew 5.4× (5.24 → 28.37 million) while land-use-change emissions *fell* 48%
(44.7 → 23.1 Mt). Emissions per person dropped 90%, from 8.54 to 0.81 t CO₂. The significant
negative correlation disappears once both series are detrended, and the sub-periods carry opposite
signs — so the honest answer is that there is no stable year-to-year relationship, and the
population-pressure hypothesis is not supported at national scale.

## Word count

`python3 scripts/wordcount.py` → **2,871** against the IB maximum of 3,000. Even the most
conservative count — keeping in-text citations *and* inline statistics, both of which IB excludes —
is 3,038, so the submitted figure has margin. Figures, captions, tables, headings, references and
appendices are excluded, as IB requires.

## Criterion-by-criterion self-assessment

My judgement of where the report stands, not a predicted grade.

| Criterion | Marks | State | Comment |
|---|---|---|---|
| **A** Research question and inquiry | 4 | Complete | Focused and answerable; variables defined with units; boundaries justified by data availability rather than asserted; framed so a negative result is still informative. |
| **B** Strategy | 4 | Complete | Four perspectives tied to environmental value systems; three strategies each given a real drawback. Strongest elements: the land-sparing/land-sharing tension, and the point that a population-pressure framing is itself a value position that shifts blame onto poor households. |
| **C** Method | 4 | Complete | Reproducible from one command, and Figure 2 makes the procedure visible. Dataset *selection* is documented, including the World Bank cropland series rejected with the zero-change counts that justified it. Spearman is justified empirically by Shapiro–Wilk. |
| **D** Treatment of data | 6 | Complete | Complete 63-year dataset in Appendix A, decade means, per-capita derivation, eight figures, all thirteen correlations tabulated with *n*, *p* and critical values, and a worked hand calculation in Appendix B. |
| **E** Analysis and conclusion | 6 | Complete | Explains why the headline coefficient is misleading rather than reporting it uncritically: detrending removes it, the sign reverses between sub-periods, and Pearson and Spearman disagree because the relationship is monotonic but not linear. No causal claim. |
| **F** Evaluation | 6 | Complete | Limitations specific to *these* data: emissions are bookkeeping-model output not measurement; the variable is a net flux so a fall has three possible meanings; total population is a crude stand-in for rural population; national aggregation risks the ecological fallacy; thirteen tests run, so marginal p-values are discounted. |

### Remaining weaknesses

- The dependent variable is **modelled, not measured** — stated plainly in §8.1, but a real ceiling
  on how strong any conclusion can be.
- **Total** population rather than rural population is the weakest methodological choice, named in
  §8.2 as the clearest single improvement.
- Correlational and national in scale, so it cannot attribute forest loss to any driver.

## Academic integrity

- [x] No fabricated data, statistics or observations — every figure regenerates from the download.
- [x] No invented references; all nine verified against indexing records.
- [x] All prose original; nothing copied from any website, article or past IA.
- [x] APA 7 in-text citations match the reference list one-to-one.
- [x] Land-use-change CO₂ and deforestation kept distinct throughout.
- [x] Correlation never presented as causation.
- [x] Every test run is reported, including those that weaken the headline result.
- [ ] Final similarity check — run your school's tool. No one can guarantee a similarity score.

| Source | DOI |
|---|---|
| Friedlingstein et al. (2025) *ESSD* 17(3), 965–1039 | 10.5194/essd-17-965-2025 |
| Bolt & van Zanden (2025) *J. Econ. Surveys* 39(2), 631–671 | 10.1111/joes.12618 |
| Hansen et al. (2013) *Science* 342(6160), 850–853 | 10.1126/science.1244693 |
| Curtis et al. (2018) *Science* 361(6407), 1108–1111 | 10.1126/science.aau3445 |
| Tyukavina et al. (2018) *Science Advances* 4(11), eaat2993 | 10.1126/sciadv.aat2993 |
| Ordway, Asner & Lambin (2017) *ERL* 12(4), 044015 | 10.1088/1748-9326/aa6509 |
| Gockowski & Sonwa (2011) *Env. Management* 48(2), 307–321 | 10.1007/s00267-010-9602-3 |
| FAO (2020) *Global Forest Resources Assessment 2020* | 10.4060/ca9825en |
| Regulation (EU) 2023/1115 | EUR-Lex |
