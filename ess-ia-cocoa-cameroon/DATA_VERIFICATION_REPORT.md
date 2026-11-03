# Data Verification Report
## ESS Individual Investigation — Cameroon

You asked me to verify datasets *before* writing, and never to invent a number. This records every
dataset I tested, what I found, and why the investigation ended up where it did. The trail matters:
rejecting a dataset for a stated reason is itself evidence of method quality (Criteria C and F).

---

## 1. The original plan, and why it failed

The first design was **cocoa harvested area (FAOSTAT) vs annual tree-cover loss (Global Forest
Watch), 2001–2023**. I could not obtain either series. This session's network policy uses a strict
allow-list, tested directly:

| Host | Needed for | Result |
|---|---|---|
| `faostatservices.fao.org` | FAOSTAT API | **Blocked** — proxy returned 403 to CONNECT |
| `www.fao.org` | FAOSTAT interface | **Blocked** — DNS not resolvable |
| `data-api.globalforestwatch.org` | GFW tree-cover loss | **Blocked** — 403 |
| `api.worldbank.org` | World Bank indicators | **Blocked** — 403 |
| `ourworldindata.org` | FAOSTAT mirror | **Blocked** — 403 |
| `github.com`, `raw.githubusercontent.com`, `pypi.org` | code, data repositories | Reachable |

Web *search* works (it runs server-side) and I used it to verify dataset structure and every
literature reference, but search returns prose, not annual series. Rather than fabricate values, the
investigation was rebuilt on data I could actually obtain and you can re-obtain.

**What I verified about FAOSTAT and GFW anyway**, in case you later unblock those hosts:

- FAOSTAT QCL: Cameroon = area **32**; Cocoa beans = item **661**; Area harvested = element
  **5312** (ha); Production = element **5510** (t). Coverage 1961–2024.
  FAO defines *area harvested* as the area actually gathered, so for a perennial tree crop it
  **excludes immature plantings** — forest clearing precedes the statistic by the 3–5 years cocoa
  takes to bear. A zero-lag correlation would be the wrong test.
- Global Forest Watch: annual tree-cover loss in hectares at a selectable canopy-density threshold.
  **The 2011-onward data use a different, more sensitive algorithm** than 2001–2010 (reprocessing
  raised 2011 loss ~6% and 2012 ~22%), so the full period is not internally consistent. Also,
  tree-cover loss is **not** deforestation: Curtis et al. (2018) attribute only ~27% of global
  forest loss to permanent commodity conversion.

---

## 2. Datasets evaluated and rejected

**World Bank *Agricultural land* and *Permanent cropland*, Cameroon (via a GitHub mirror of the
World Development Indicators).** Reachable, and permanent cropland is exactly the category cocoa
belongs to — so this looked like the closest substitute. I rejected it on inspection:

| Series | Years | Zero-change years | Distinct values |
|---|---|---|---|
| Agricultural land (sq. km) | 1961–2018 (n = 58) | 21 (37%) | 35 |
| Permanent cropland (% land area) | 1961–2018 (n = 58) | 26 (46%) | 28 |

Permanent cropland is **identical in all eight years from 2011 to 2018**. Values repeated like that
are carried forward, not measured. Correlating them would describe a reporting convention rather
than the environment, and would quietly destroy the year-to-year variation the whole analysis
depends on. A second objection: the file is a personal mirror, not an official distribution
channel, so its fidelity to the World Bank original cannot be checked from here.

---

## 3. Dataset adopted — verified

**Our World in Data, CO₂ and Greenhouse Gas Emissions dataset**, from its official public
repository `github.com/owid/co2-data`. This is OWID's own distribution channel, not a third-party
copy, so provenance is clean and citable.

| Variable | Column | Unit | Original source | Cameroon coverage |
|---|---|---|---|---|
| CO₂ from land-use change | `land_use_change_co2` | Mt CO₂ yr⁻¹ | Global Carbon Budget (2025) | **1961–2023 complete** |
| Population | `population` | people | OWID population series (2024) | **1961–2023 complete** |
| GDP | `gdp` | int-$ 2011 prices | Maddison Project Database 2023 | 1961–2022 (2023 missing) |
| Fossil CO₂ | `co2` | Mt CO₂ yr⁻¹ | Global Carbon Budget (2025) | **1961–2023 complete** |

Quality check on the dependent variable: **63 distinct values across 63 years, zero repeated
consecutive values** — the opposite of the cropland series. Mean 33.5 Mt, SD 11.6, range 14.7–81.9.

**Known limitation, stated in the report:** land-use-change emissions are **bookkeeping-model
output, not measurement**, and carry the largest uncertainty in the global carbon budget. They are a
proxy for deforestation, not a measure of it.

---

## 4. The research question, and why it changed

Original: *To what extent is the expansion of cocoa cultivation associated with annual tree-cover
loss in Cameroon between 2001 and 2023?*

Adopted: **To what extent is population growth associated with CO₂ emissions from land-use change in
Cameroon between 1961 and 2023?**

This keeps the country, the environmental issue (deforestation in the Congo Basin) and the driver
question (does agricultural expansion by households clear forest?). What changes is the
measurement: population growth stands in for smallholder agricultural pressure — the mechanism
Tyukavina et al. (2018) identified for the Congo Basin — and land-use-change CO₂ stands in for
forest conversion. The period lengthens to 63 years, which more than triples the sample.

The stock/flow correction from the original design is retained: population is used as an **annual
increase**, not a level, so both variables are per-year flows.

---

## 5. If you unblock the network later

Add `fao.org`, `globalforestwatch.org` and `worldbank.org` under **Allowed domains** (cloud
environment menu in the session title bar → Edit → Network access, keeping "Allow package managers"
ticked): <https://code.claude.com/docs/en/cloud-environments#network-access>

The original cocoa/tree-cover-loss design is then recoverable, and §1 above has the exact query
parameters. Say the word and I will rebuild it — the analysis pipeline is structured to take a
different pair of variables.
