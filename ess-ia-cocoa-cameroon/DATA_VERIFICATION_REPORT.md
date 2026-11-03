# Pre-Writing Data Verification Report
## ESS Individual Investigation — Cocoa cultivation and tree-cover loss in Cameroon

**Purpose.** You asked me to verify the datasets *before* writing, and to tell you exactly what to
download if I could not reach them. This document does that. No figure anywhere in this project has
been estimated, interpolated or invented.

---

## 1. What I could and could not access

This Claude Code session runs in a cloud container whose network policy uses a strict allow-list.
I tested every relevant host directly:

| Host | Needed for | Result |
|---|---|---|
| `faostatservices.fao.org` | FAOSTAT API (cocoa area/production) | **Blocked** — proxy returned 403 to CONNECT |
| `www.fao.org` | FAOSTAT web interface | **Blocked** — DNS not resolvable |
| `data-api.globalforestwatch.org` | GFW tree-cover-loss API | **Blocked** — 403 |
| `api.worldbank.org` | World Bank indicators | **Blocked** — 403 |
| `ourworldindata.org` | FAOSTAT mirror | **Blocked** — 403 |
| `github.com`, `pypi.org` | code / packages | Reachable |

Web *search* works (it runs server-side), and I used it to verify dataset structure and references.
But search returns prose summaries, not full annual series. **I therefore do not have the 2001–2023
annual values, and I have not written any into the report.**

### What this means for you
Two options, either is fine:

- **Option A (no work for you):** add `fao.org`, `globalforestwatch.org` and `worldbank.org` to this
  environment's **Allowed domains** (cloud environment menu in the session title bar → Edit →
  Network access; keep "Allow package managers" ticked). Then I fetch and complete everything myself.
  Steps: <https://code.claude.com/docs/en/cloud-environments#network-access>
- **Option B:** download the two files yourself using §3 below and drop them in
  `ess-ia-cocoa-cameroon/data/`. The analysis script then does the rest automatically.

---

## 2. Dataset suitability — verified structure

### 2.1 FAOSTAT — cocoa (independent variable)
Confirmed via FAOSTAT metadata mirrored by Our World in Data:

| Property | Value |
|---|---|
| Domain | Crops and livestock products (**QCL**) |
| Country | Cameroon (area code **32**) |
| Item | Cocoa beans (item code **00000661**; HS 2007 heading 1801) |
| Element 1 | Area harvested (code **005312**), unit **hectares (ha)** |
| Element 2 | Production (code **005510**), unit **tonnes (t)** |
| Element 3 | Yield (code **005419**), unit kg/ha |
| Temporal coverage | **1961–2024** — so 2001–2023 is fully covered |
| Flags | `A` official, `E` estimated, `I` imputed, `M` missing — **must be recorded per year** |

**Critical definitional finding.** FAO defines *area harvested* as "area from which a crop is
gathered". For a **perennial tree crop** this is the area of **mature, bearing** trees — it
**excludes young plantings that are not yet productive**. Cocoa takes roughly 3–5 years from planting
to first harvest. Therefore forest cleared in year *t* only enters the FAOSTAT harvested-area series
around year *t*+4. **A zero-lag correlation is the wrong test.** This is a real finding, and it
drives the lagged analysis in the method.

Note also: *area harvested* ≠ *area planted*, and production (t) ≠ cultivation extent. Production
responds to rainfall, disease (black pod), farmgate price and input use, not only to land area. The
land-use variable must be **area harvested**, not production.

### 2.2 Global Forest Watch / UMD — tree-cover loss (dependent variable)
Confirmed via the GFW dataset documentation:

| Property | Value |
|---|---|
| Dataset | UMD/Hansen Global Forest Change — annual tree-cover loss |
| Unit | **hectares (ha)**, 30 m Landsat pixels |
| Coverage | 2001 onward (current release GFC-2025-v1.13 runs to 2025) |
| Key parameter | **tree-canopy-density threshold** — 10%, 30% or 75%. Must be fixed and stated. |
| Source paper | Hansen et al. (2013), *Science* 342(6160), 850–853 |

**Two caveats that are not optional — they change how the data may be used:**

1. **Series break at 2011.** GFW states the 2011-onward data were produced with an **updated
   methodology**, and that comparison with the original 2001–2010 data "should be done with
   caution". One algorithm covers 2001–2010 and another 2011 onward. The newer algorithm is **more
   sensitive**: reprocessing raised 2011 loss by ~6% and 2012 loss by ~22%. So part of any apparent
   upward trend across 2001–2023 is **methodological, not ecological**. The analysis must therefore
   also be run on the internally consistent **2011–2023** sub-period.
2. **Tree-cover loss is not deforestation.** It is *any* removal of canopy within a pixel —
   including plantation harvest, fire, disease, storm damage and shifting cultivation with later
   regrowth. Curtis et al. (2018) attribute only about **27%** of global forest loss to permanent
   conversion for commodity production. The two terms are kept strictly separate throughout the
   report.

### 2.3 Can the research question actually be answered?
**Partly — and it needs one small, scientifically necessary adjustment.**

The question as written compares "expansion of cocoa cultivation" with "annual tree-cover loss".
As literally operationalised, that would correlate **cocoa harvested area (a stock,** ha standing in
year *t*) against **annual tree-cover loss (a flow,** ha lost during year *t*). Correlating a stock
against a flow when both trend upward over 23 years produces a large but **largely spurious**
coefficient driven by shared time trend, not by any real link.

**Smallest necessary adjustment — keep the question, change the operationalisation:**
use the **annual change** in cocoa harvested area (Δ ha, a flow) as the independent variable, so that
both variables are flows measured in ha yr⁻¹ over the same year. The research question wording is
unchanged; "expansion" is simply defined as annual change. The levels-vs-levels correlation is still
reported, but explicitly as a trend-confounded comparison, not as the main result.

---

## 3. Exact download instructions

### 3.1 FAOSTAT
1. Go to <https://www.fao.org/faostat/en/#data/QCL>
2. **Countries:** Cameroon · **Elements:** *Area harvested* **and** *Production*
   · **Items:** *Cocoa beans* · **Years:** 2001 → 2023
3. Tick **Show Flags** and **Show Unit** (the flags are needed for Criterion F).
4. Download → **CSV**. Save as:
   `ess-ia-cocoa-cameroon/data/faostat_cocoa_cameroon.csv`
5. Note the **"Last updated"** date shown on the page — I need it for the citation.

### 3.2 Global Forest Watch
1. Go to <https://www.globalforestwatch.org/dashboards/country/CMR/>
2. Find the **"Annual tree cover loss"** / "Tree cover loss in Cameroon" widget.
3. **Set the tree-cover-density threshold to 30%** and leave it there (this is the GFW default and
   the most widely reported; whatever you choose must be stated in the report).
4. Use the widget's download icon → CSV. Save as:
   `ess-ia-cocoa-cameroon/data/gfw_treecoverloss_cameroon.csv`
5. Note the **dataset version string** (e.g. `GFC-2024-v1.12`) and the canopy threshold you used.

### 3.3 Also tell me
- Your **IB candidate code** (currently a placeholder in the report).
- Whether your teacher requires a specific canopy threshold.

Once those two CSVs are in `data/`, run:

    python3 ess-ia-cocoa-cameroon/analysis/ess_analysis.py

It outputs every table, figure and statistic, and writes the exact sentences with the real numbers
substituted in.
