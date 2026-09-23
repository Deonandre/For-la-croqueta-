# ESS IA – Verification report (version 2)

**Research question (unchanged):** *To what extent is annual tree-cover loss associated with annual CO₂ emissions in Cameroon from 2001 to 2024?*

Prepared 23 September 2026. This report records what was verified before the IA was written, what could **not** be verified, and what you still need to check or supply.

---

## Step 1 – IB ESS internal assessment requirements

| Requirement | Finding | Source status |
|---|---|---|
| Word limit | **3,000 words** maximum | ✅ Official: ibo.org ESS subject brief and curriculum-update page |
| Strategy / perspectives | Students must explore tensions between perspectives and explain how they affect the outcomes of a strategy addressing an issue central to the investigation | ✅ Official: ibo.org curriculum-update page |
| Collaboration rule | Methods may be shared in small groups if variables differ and each student's data are unique | ✅ Official: ibo.org |
| Criteria and marks | A Research question and inquiry (4) · B Strategy (4) · C Method (4) · D Treatment of data (6) · E Analysis and conclusion (6) · F Evaluation (6) = 30 | ⚠️ Consistent across several teacher and tutor sites, but **not seen in the official guide** |
| Primary or secondary data | Criterion C allows "primary or secondary" data | ⚠️ Same third-party sources |
| Word-count exclusions | Commonly: headings, data tables, equations/calculations, graphs, citations, bibliography | ⚠️ Third-party only; sources disagree on captions |

**Not verified:** the full *ESS guide (first assessment 2026)* is behind the IB Programme Resource Centre login, and ibo.org itself was blocked from this environment. Only search-engine extracts of official ibo.org pages could be read. **Ask your teacher to confirm the criteria and word-count rules in the official guide.** To be safe:

- the IA follows the section order you asked for, and every criterion is covered (map below);
- the word count is conservative: it includes captions, in-text citations and text-based tables.

| Your requested section | IA section | Criterion it serves (as reported) |
|---|---|---|
| Introduction / context | 1.1–1.2 | A |
| (Strategy, reported as required) | 1.3 REDD+ and competing perspectives; 7.4 | B |
| Scientific rationale | 2 | A |
| Research question | 3 | A |
| Methodology | 4 | C |
| Data presentation and processing | 5 | D |
| Statistical analysis | 6 | D |
| Analysis and discussion | 7 | E |
| Conclusion | 8 | E |
| Evaluation | 9 | F |
| References, appendix | after 9 | – |

## Steps 2–8 – Datasets

Both files were downloaded again for this version. Their SHA-256 checksums are **identical** to the first download, so the data are unchanged and still the latest release (GFW has not published a newer file).

### Tree-cover loss (independent variable) ✅

| Field | Value |
|---|---|
| Organisation | University of Maryland GLAD lab and Google; distributed by Global Forest Watch (World Resources Institute) |
| Title / version | GFW country statistics, Cameroon (`CMR.xlsx`), **v20260427**, covering 2001–2025 |
| URL | https://gfw2-data.s3.amazonaws.com/country-pages/country_stats/download/2025/CMR.xlsx |
| Coverage | National and regional (Cameroon) |
| Variable / unit | `tc_loss_ha_2001` … `tc_loss_ha_2024` at the 30% canopy threshold; **hectares** (whole numbers) |
| Definition | Tree cover = vegetation taller than 5 m; loss = stand-replacing disturbance (at least half the tree cover removed in a 30 m pixel). **Loss ≠ deforestation.** |
| Limitations | Method and sensor changes in 2011–2015; loss is recorded in the year of detection |
| Missing values 2001–2024 | **None** |

### CO₂ emissions (dependent variable) ✅, with the World Bank replaced

| Field | Value |
|---|---|
| Organisation | Global Carbon Project; distributed by Our World in Data (OWID) |
| Title / version | **Global Carbon Budget 2025** (Friedlingstein et al., 2026, *ESSD* 18: 3211–3288), in `owid-co2-data.csv`, updated 1 June 2026 |
| URL | https://github.com/owid/co2-data |
| Coverage | National; 1950–2024 (`co2`), 1850–2024 (`land_use_change_co2`) |
| Variable / unit | `co2` = CO₂ excluding land-use change (for Cameroon: oil, gas, cement, flaring); **million tonnes CO₂ (Mt)**, 3 d.p. |
| Supplementary | `land_use_change_co2`, from bookkeeping models (Mt CO₂) |
| Missing values 2001–2024 | **None** |

**Why not the World Bank?** api.worldbank.org and data.worldbank.org are **blocked by this environment's network policy** (re-tested in this session), so no World Bank values could be downloaded or checked. Your brief allowed "another highly reliable international dataset", and the peer-reviewed Global Carbon Budget qualifies. It also has an advantage here: one release gives both fossil and land-use-change CO₂ for all 24 years. The IA suggests comparing it with the World Bank series as an improvement.

**Dataset compatibility:** the two variables are **not directly comparable**. The independent variable is satellite-detected gross canopy loss. The dependent variable is fossil and industrial CO₂, which excludes the CO₂ released by forest clearance. This is explained in Sections 3.1, 4.5 and 9 of the IA and tested with the supplementary land-use-change series. The research question itself was kept exactly as given.

## Step 9 – Results (all computed from the real data; each checked independently)

| Test | n | Result | p |
|---|---|---|---|
| Shapiro–Wilk: loss / CO₂ | 24 | W = 0.852 / 0.838 → not normal | 0.002 / 0.001 |
| **Spearman, loss vs CO₂ (main)** | 24 | **rₛ = 0.753** (Σd² = 568) | 2.2 × 10⁻⁵ |
| Least-squares line (descriptive) | 24 | CO₂ = 2.048×10⁻⁵ × loss + 6.210; R² = 0.612 | – |
| Spearman vs year (loss / CO₂) | 24 | 0.872 / 0.864 | < 0.001 |
| Spearman, first differences | 23 | rₛ = −0.069 | 0.754 |
| Spearman, 2015–2024 (exact test) | 10 | rₛ = −0.685 | 0.035 |
| Spearman, loss vs land-use-change CO₂ | 24 | rₛ = −0.191 | 0.371 |

**Answer to the RQ:** a strong, significant positive association exists over the whole period, but it comes from both variables rising over time (likely shared drivers such as population growth). It disappears once the trend is removed, so the extent of a genuine association is limited and causation cannot be inferred.

## Things you must supply or check ⚠️

| # | Item | Where in the IA |
|---|---|---|
| 1 | Your name, candidate number, school and session. **Ask your coordinator whether names may appear on the uploaded IA** (moderated work is often anonymised). | Cover page |
| 2 | Criteria and word-count rules in the **official ESS guide** | whole IA |
| 3 | Author and year of the FCPF "R-Package" self-assessment report. I cited it as Republic of Cameroon (2019) from its title and file date. Its content (readiness since 2008; strategy validated 6 June 2018) was confirmed. | 1.3, References |
| 4 | World Bank indicator definition (seen only in search results because the site was blocked) | 1.2, References |
| 5 | **Declaration of AI assistance.** Complete it truthfully. | after References |

Now verified, unlike in version 1:
- Hansen et al. (2013) accuracy: 87% user's accuracy and 88% producer's accuracy.
- The REDD+ strategy validation date.
- The Millennium Ecosystem Assessment (2005) reference.

The NDC percentage figures were **removed** because the sources disagreed on the baseline.

## Table of contents and page numbers

- Built as a **real Word TOC field**, based on Heading 1 and Heading 2, with links to each heading.
- It was generated **after** final formatting, in two passes: render to PDF, measure the page on which each of the 38 headings starts, rebuild, then verify every TOC line against the final PDF (`build/paginate.py --check` passed).
- The cover is page 1 (number hidden), the TOC is page 2, and the body starts on page 3. The document has 16 pages.
- **In Word:** when you open the file, Word asks whether to update fields. Click **Yes** so the TOC uses Word's own pagination; Word's line breaks can differ slightly from the PDF. After any edit, right-click the TOC and choose **Update Field → Update entire table**.

## Final quality-control checklist

- [x] Current IB requirements checked. Official ibo.org statements used where available; the full guide was **not accessible**, so see item 2.
- [x] RQ focused, measurable and unchanged.
- [x] Only secondary data; no primary data claimed ("Secondary data were obtained…").
- [x] All numbers real and traceable. `build/qc.py` re-derives every hand-typed number from the data: 21/21 pass.
- [x] No fabricated data, statistics, sources, DOIs or dates.
- [x] Dataset definitions, units, coverage and limitations stated (Table 2).
- [x] 2001–2024 complete; no missing values (stated explicitly).
- [x] Raw (Table 3), processed (Table 4) and calculated statistics (Tables 5–6) distinguished.
- [x] Statistical methods justified. Each test gives its purpose, formula, working, result, interpretation and limitation.
- [x] Calculations accurate. Hand formulae match SciPy and a second independent method (Appendix A).
- [x] Graphs 1–5 drawn from the actual data; trendline, equation and R² shown only where appropriate.
- [x] Correlation not presented as causation (Section 7.3, "What cannot be concluded").
- [x] Confounding variables and environmental implications discussed (carbon cycle, ecosystem services, SDGs, REDD+).
- [x] Specific limitations; improvements state what, how and why (Table 7).
- [x] Conclusion answers the RQ using only calculated results; no new evidence.
- [x] 16 references, all cited; all citations listed (automated check).
- [x] No existing IA copied. All text was written for this investigation.
- [x] Cover page, then the TOC with verified final page numbers.
- [x] Consistent page numbering ("Page n" footer; cover counted as page 1).
- [x] Word count **2,884**, counted conservatively (limit 3,000).
- [x] Proofread; Word file passes schema validation.

## Word count

- **Approximate word count: 2,884 words.** This counts all prose in Sections 1–9, including in-text citations, captions, and the text-based Tables 1, 2 and 7.
- **Excluded:**
  - cover page (42 words);
  - table of contents;
  - headings (158);
  - data tables 3–6 and notes (595);
  - equations and calculation lines (153);
  - text inside graphs;
  - references (413);
  - AI declaration (32);
  - Appendix A (141);
  - the word-count statement.
- If captions and in-text citations are excluded, as many schools do, the count is **2,646 words** (computed by the build script).

## Academic integrity – please read

The IB's academic integrity policy (Appendix 6 on AI tools) states that work produced by AI, even in part, is not regarded as the student's own, and that any AI-generated content must be cited with the tool, prompt and date.

Use this document as a worked model and verified data package. Redo the calculations yourself using Table 3 and the formulae in Section 6, write the final text in your own words, complete the AI declaration honestly, and discuss your use of AI with your supervising teacher before submission.

## Files and how to rebuild

```
ESS_IA/
├── ESS_IA_Cameroon_TreeCoverLoss_CO2.docx / .pdf   ← the IA
├── VERIFICATION_REPORT.md                          ← this file
├── data/raw/        unmodified source files + SHA256SUMS.txt
├── data/processed/  matched data, rank table, first differences, drivers, results.json
├── analysis/        analysis.py · figures.py · verify.py
├── figures/         Graphs 1–5 (PNG, 300 dpi)
└── build/           sections.js (IA text) · build_ia.js · build_all.sh (two-pass TOC build)
                     paginate.py (TOC page check) · qc.py (fact and citation check)
```

Rebuild with:

```
python3 analysis/analysis.py && python3 analysis/figures.py && python3 analysis/verify.py > build/verification_output.txt
NODE_MODULES=… SOFFICE_PY=… build/build_all.sh && python3 build/qc.py
```
