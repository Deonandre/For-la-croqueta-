# ESS Individual Investigation — Population growth and deforestation emissions in Cameroon (1961–2023)

**Research question:** To what extent is population growth associated with CO₂ emissions from
land-use change in Cameroon between 1961 and 2023?

**Status: complete and based entirely on real, verified data.** Every number traces to a file the
script downloads. Nothing is estimated, interpolated or invented.

## What to submit

`output/IA_FINAL.docx` — or `IA_FINAL.md` if you prefer to edit the text first and rebuild.

Before submitting, fill in three things: your **candidate code**, the **access date** in the Our
World in Data reference, and the **page numbers** in the contents table.

## Files

| File | What it is |
|---|---|
| `IA_FINAL.md` / `output/IA_FINAL.docx` / `.pdf` | **The report**, all numbers filled in. 2,877 countable words. |
| `IA_Population_LandUse_Cameroon.md` | Source template with `{{placeholders}}`; regenerate `IA_FINAL.md` from it. |
| `DATA_VERIFICATION_REPORT.md` | Every dataset tested, what was rejected and why, and the full provenance trail. |
| `analysis/ess_analysis.py` | Downloads the data and produces every table, figure and statistic. |
| `scripts/wordcount.py` | IB-rules word counter. |
| `scripts/build_docx.sh` | Builds `.docx` and `.pdf`. |
| `output/` | Tables 1–3, Figures 1–6, `appendix_b_spearman.md`, `results.json`. |

Reproduce everything from scratch:

```bash
python3 analysis/ess_analysis.py && bash scripts/build_docx.sh IA_FINAL.md
```

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
negative correlation **disappears entirely once both series are detrended**, and the sub-periods
have opposite signs — so the honest answer is that there is no stable year-to-year relationship,
and the population-pressure hypothesis is not supported at national scale.

That is a more interesting result than a tidy positive correlation, and it is defensible because
the analysis shows *why* the headline coefficient is misleading.

## Word count

`python3 scripts/wordcount.py IA_FINAL.md` → **2,877** against the IB maximum of 3,000. Even the
most conservative count — keeping in-text citations *and* inline statistics, both of which IB
excludes — is 2,945, so there is margin under either reading.

## Criterion-by-criterion self-assessment

My judgement of where the report stands, not a predicted grade.

| Criterion | Marks | State | Comment |
|---|---|---|---|
| **A** Research question and inquiry | 4 | Complete | Focused and genuinely answerable; variables defined with units; boundaries justified by data availability rather than asserted; the question is framed so that a negative result is still informative. |
| **B** Strategy | 4 | Complete | Four perspectives tied to environmental value systems; three strategies each given a real drawback. Two stronger elements: the land-sparing/land-sharing tension (intensification may spare forest while reducing on-farm biodiversity), and the point that a population-pressure framing is itself a value position that shifts blame onto poor households. |
| **C** Method | 4 | Complete | Fully reproducible from one command. Dataset *selection* is documented, including the rejection of the World Bank cropland series with the zero-change counts that justified it. Choice of Spearman is justified empirically by Shapiro–Wilk, not asserted. |
| **D** Treatment of data | 6 | Complete | Complete 63-year series, decade means, per-capita derivation, six figures, Spearman and Pearson with *n*, *p* and critical values, normality testing, and a worked hand calculation in Appendix B. Figure 1 deliberately avoids a dual axis. |
| **E** Analysis and conclusion | 6 | Complete | The analysis explains why the headline coefficient is misleading rather than reporting it uncritically: detrending removes it, the sign reverses between sub-periods, and Pearson and Spearman disagree because the relationship is monotonic but not linear. Conclusion answers the question directly and claims no causation. |
| **F** Evaluation | 6 | Complete | Limitations specific to *these* data: emissions are bookkeeping-model output rather than measurement; the variable is a net flux so a fall has three different possible meanings; total population is a crude stand-in for rural population; national aggregation risks the ecological fallacy; thirteen correlations were run, so marginal p-values are discounted. Improvements are concrete and ranked. |

### Remaining weaknesses

- The dependent variable is **modelled, not measured**. This is stated plainly in §8, but it is a
  real ceiling on how strong any conclusion can be.
- **Total** population rather than rural population is the weakest methodological choice. It is
  named in §8 as the single clearest improvement.
- Correlational and national-scale, so it cannot attribute forest loss to any driver.
- Candidate code, access date and page numbers still to be filled in by you.

## Academic integrity checklist

- [x] No fabricated data, statistics or observations — every figure comes from the downloaded file.
- [x] No invented references; all nine verified against indexing records (DOIs below).
- [x] All prose written originally; nothing copied from any website, article or past IA.
- [x] APA 7 in-text citations match the reference list one-to-one.
- [x] Only sources actually used are listed.
- [x] Land-use-change CO₂ and deforestation kept distinct throughout.
- [x] Correlation never presented as causation.
- [x] Every test run is reported, including the ones that weaken the headline result.
- [ ] Final similarity check — run your school's tool. No one can guarantee a similarity score.

### Reference verification

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

## Figures

Series colours are `#1f6fb2` and `#d95f02`, checked with a colour-vision-deficiency validator
(ΔE 22.3 protanopia, 31.3 normal vision, contrast ≥ 3:1), so the figures survive colourblind readers
and greyscale printing. Figure 1 uses two stacked panels rather than a dual y-axis: two scales on
one axis can be rescaled to suggest almost any relationship.
