# ESS IA – Verification report and methodology plan

**Research question (unchanged):** *To what extent is annual tree-cover loss associated with annual CO₂ emissions in Cameroon from 2001 to 2024?*

Prepared 23 September 2026. This report records what was verified before the IA was drafted, what could **not** be verified, and what you still need to supply or check yourself.

---

## 1. IB ESS internal assessment requirements (first assessment 2026 guide)

| Item | What was found | How it was verified |
|---|---|---|
| Criteria | A Research question and inquiry (4) · B Strategy (4) · C Method (4) · D Treatment of data (6) · E Analysis and conclusion (6) · F Evaluation (6) = **30 marks** | Several independent teacher/tutor summaries agreed (Clastify, RevisionDojo, Mr Kremer Science, esstutor). |
| Word limit | **3,000 words** maximum (was 2,250 in the old course) | Same sources, plus ibo.org course summary snippets. |
| Weighting | 25% SL, 20% HL; about 10 hours of class time | Same sources. |
| Secondary data | Allowed. Criterion C says data may be "primary or secondary, qualitative or quantitative". | Same sources. |
| Strategy criterion (B) | Describe an existing strategy linked to the issue and how **tensions between perspectives** affect its outcome. | Same sources. |
| Word-count exclusions | Commonly listed: headings, data tables, equations/calculations, graphs, in-text citations, bibliography. Sources disagree on captions and text-based tables. | Third-party sources only. |

⚠️ **Not verified:** I could not open the official *ESS guide (first assessment 2026)*. It is behind the IB Programme Resource Centre login, and ibo.org was blocked from this environment. **Ask your teacher to confirm the criteria and the word-count rules against the official guide.** To be safe, the word count reported below includes captions, in-text citations and text-based tables.

## 2. Dataset 1: tree-cover loss (independent variable) ✅ verified

| Field | Value |
|---|---|
| Producer | University of Maryland GLAD lab and Google (Hansen et al., 2013); distributed by Global Forest Watch / WRI |
| File | `CMR.xlsx`, Cameroon country statistics, **version v20260427** (covers 2001–2025) |
| URL | https://gfw2-data.s3.amazonaws.com/country-pages/country_stats/download/2025/CMR.xlsx |
| Sheet / row used | "Country tree cover loss", country = Cameroon, **threshold = 30** (GFW default) |
| Variable | `tc_loss_ha_2001` … `tc_loss_ha_2024` |
| Unit | hectares (whole numbers) |
| Definition | Tree cover = vegetation > 5 m tall. Loss = stand-replacing disturbance (at least half the tree cover in a 30 m pixel removed). **"Loss" ≠ deforestation.** |
| Caution (from the file's ReadMe) | Method and data changes 2011–2015 may give higher loss in recent years. |
| Missing values 2001–2024 | None |
| Consistency check | Compared with the previous release (2001–2024): largest difference 1 ha. |
| Local copy | `data/raw/GFW_CMR_country_stats_v20260427.xlsx` (SHA-256 in `data/raw/SHA256SUMS.txt`) |

## 3. Dataset 2: CO₂ emissions (dependent variable) ✅ verified, with one substitution

| Field | Value |
|---|---|
| Producer | Global Carbon Project, **Global Carbon Budget 2025** (Friedlingstein et al., 2026, *ESSD* 18, 3211–3288) |
| Distributed by | Our World in Data, `owid-co2-data.csv`, updated 1 June 2026 (GitHub `owid/co2-data`) |
| Variable (DV) | `co2`: annual total CO₂ **excluding land-use change** (fossil fuels, cement, flaring) |
| Supplementary | `land_use_change_co2`: annual CO₂ from land-use change (bookkeeping models) |
| Unit | million tonnes CO₂ (Mt), 3 decimal places (OWID converts from carbon using × 3.664) |
| Coverage for Cameroon | 1950–2024 (`co2`); 1850–2024 (land-use change) |
| Missing values 2001–2024 | None (coal and "other industry" components are not reported for Cameroon, which affects no year) |

**Why not the World Bank?** The World Bank data servers (api.worldbank.org, data.worldbank.org) were **blocked by this environment's network policy**, so their values could not be downloaded or checked. The World Bank's current headline indicator (`EN.GHG.CO2.MT.CE.AR5`, EDGAR-based, *excluding LULUCF*) measures the same concept as GCB's `co2`. The Global Carbon Budget is an equally authoritative, peer-reviewed source. It also has two practical advantages here: it covers all of 2001–2024 in one release, and it reports land-use-change CO₂ separately, which made the supplementary validity test possible. *Optional:* download the World Bank series for Cameroon yourself and compare a few years to show agreement between independent inventories. That is Improvement 7 in the IA.

## 4. Is the research question scientifically sound?

The wording was **kept exactly**. One genuine issue was found and handled through an operational definition, not by rewording:

- "Annual CO₂ emissions" is ambiguous. National totals are normally reported **excluding** land-use change, and that total does **not** contain the CO₂ released by forest clearance. For Cameroon, land-use-change CO₂ was 2.4–9.6 times larger than fossil CO₂ in every year.
- **Solution used:** the DV is defined as CO₂ excluding land-use change (the standard headline measure). Land-use-change CO₂ is analysed as a supplementary check. Both choices are stated explicitly in Section 1.2 of the IA.
- *If your teacher prefers the definition inside the RQ*, the smallest modification would be: "…associated with annual CO₂ emissions **(excluding land-use change)** in Cameroon…". This is optional.

## 5. Methodology plan (as carried out)

1. Download both files; record version, date and SHA-256 checksum.
2. Extract Cameroon, 30% threshold, 2001–2024 (GFW) and Cameroon `co2` and `land_use_change_co2` for 2001–2024 (OWID).
3. Match by calendar year; check for missing values; keep published precision.
4. Descriptive statistics, and Shapiro–Wilk normality tests (both variables non-normal, p < 0.01).
5. Main test: **Spearman's rank** (justified by non-normality and non-linearity; no ties). Hand working uses rₛ = 1 − 6Σd²/[n(n²−1)]. Significance by t-distribution (df = 22).
6. Sensitivity tests: descriptive least-squares line; correlation of each variable with year; **first differences** (trend removed); **2015–2024 only** (consistent satellite method, exact permutation test); **land-use-change CO₂** (supplementary).
7. Independent re-check of every statistic (`analysis/verify.py`).

## 6. Key results (all computed from the real data)

| Test | n | Result | p |
|---|---|---|---|
| Spearman loss vs CO₂ (main) | 24 | rₛ = 0.753 (Σd² = 568) | 2.2 × 10⁻⁵ |
| Least-squares line (descriptive) | 24 | CO₂ = 2.048×10⁻⁵·loss + 6.210, R² = 0.612 | – |
| Spearman loss vs year / CO₂ vs year | 24 | 0.872 / 0.864 | < 0.001 |
| Spearman, first differences | 23 | rₛ = −0.069 | 0.754 |
| Spearman, 2015–2024 (exact) | 10 | rₛ = −0.685 | 0.035 |
| Spearman loss vs land-use-change CO₂ | 24 | rₛ = −0.191 | 0.371 |

**Answer in one line:** there is a strong, significant positive association overall. It is produced by both variables rising over time (shared drivers such as population growth) and disappears once the trend is removed, so causation cannot be inferred.

## 7. Things you must supply or double-check ⚠️

| # | Item | Where |
|---|---|---|
| 1 | Your name, candidate number, school, session. **Check with your IB coordinator whether names may appear on the uploaded IA**; moderated coursework is often anonymised. | Cover page |
| 2 | Confirm the criteria and word-count rules against the **official ESS guide** | Sections 1–6 |
| 3 | NDC figures (35% by 2030, 12% unconditional; forestry = largest reduction potential). The sources I found were consistent on 35% / 12% but disagreed on the baseline, so the IA does not state one. | Section 2 → World Bank Group (2022) |
| 4 | REDD+ timeline (readiness from 2008; strategy validated June 2018) and the author/year of the FCPF R-Package report | Section 2 → Republic of Cameroon (2019) |
| 5 | Hansen et al. (2013) global loss error rates (~13% false positive, ~12% false negative). Check them in the paper's supplementary accuracy table. | Section 5.4 |
| 6 | World Bank indicator definition (confirmed only through a search-result summary, because the site was blocked) | Section 1.1 → World Bank (n.d.) |
| 7 | **Declaration of AI assistance.** Complete it truthfully. | End of IA |

All other values come directly from the downloaded files or the analysis output (`data/processed/results.json`).

## 8. Academic integrity: please read

The IB's academic integrity policy (Appendix 6, AI tools) states that work produced by AI, even in part, is **not** regarded as the student's own. Any AI-generated text, graph or analysis must be cited, with the tool, prompt and date. Use this document as a **worked model and data package**. Re-do the analysis yourself (the spreadsheet formulae in Section 4.5 and the data in Table 3 make this straightforward), write the final text in your own words, cite the AI assistance, and discuss it with your supervising teacher before submission.

## 9. Word count

- **Approximate word count: 2,879 words.** This counts all prose in Sections 1–6, including in-text citations, figure/table captions and the text-based Tables 1, 2 and 7.
- **Not counted:** cover page (45), headings (111), data tables 3–6 and notes (595), equations and calculation lines (81), references (400), AI declaration and word-count statement.
- If your school follows the rule that captions and citations are excluded, the true count is lower, which leaves a larger safety margin.

## 10. Final quality-control checklist

- [x] RQ is focused and measurable (DV operationally defined).
- [x] Investigation uses secondary data only; no primary data claimed.
- [x] Every numerical value is traceable to a downloaded file or computed from one (`results.json`).
- [x] No data fabricated; World Bank values were **not** used because they could not be accessed.
- [x] No existing IA copied; all text written for this investigation.
- [x] External claims cited; 15 references, all cited in the text and all cited works listed (checked automatically).
- [x] Dataset definitions, units and methodological differences explained.
- [x] 2001–2024 complete for both variables (no missing years).
- [x] Raw (Table 3) and processed (Tables 4–6) data distinguished.
- [x] Statistical method justified (Shapiro–Wilk → Spearman); calculations shown and independently verified.
- [x] Graphs generated from the actual data (`analysis/figures.py`).
- [x] Correlation not presented as causation; confounders discussed.
- [x] Limitations specific, with their effect on the conclusion; improvements realistic.
- [x] Conclusion answers the RQ using only the calculated results.
- [x] References complete and consistent (Harvard style).
- [x] Word count within limit (2,879 counted conservatively, limit 3,000).
- [x] Cover page included (placeholders only; no personal data invented).
- [ ] **Official IB guide check and items in Section 7: to be done by you.**

## 11. Files and how to reproduce

```
ESS_IA/
├── ESS_IA_Cameroon_TreeCoverLoss_CO2.docx   ← the IA (Word)
├── ESS_IA_Cameroon_TreeCoverLoss_CO2.pdf    ← the IA (PDF)
├── VERIFICATION_REPORT.md                   ← this file
├── data/raw/          unmodified source files + SHA256SUMS.txt
├── data/processed/    matched table, rank table, first differences, drivers, results.json
├── analysis/          analysis.py (all statistics), figures.py (graphs), verify.py (independent checks)
├── figures/           fig1–fig5 (PNG, 300 dpi)
└── build/             build_ia.js + sections.js (document generator), wordcount.json
```

Reproduce: `python3 analysis/analysis.py && python3 analysis/figures.py && python3 analysis/verify.py`, then `node build/build_ia.js` (needs the `docx` npm package).
