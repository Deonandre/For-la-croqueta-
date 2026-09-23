"""Quality control for the rendered IA (PDF):
1. every data-derived number that is typed into the prose is recomputed from the processed data;
2. every in-text citation has a reference entry and every reference is cited;
3. no stray formatting markup is left in the text.
"""
import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
df = pd.read_csv(ROOT / "data/processed/cameroon_2001_2024_matched.csv").set_index("year")
res = json.loads((ROOT / "data/processed/results.json").read_text())
loss, co2, luc = df.tree_cover_loss_ha, df.co2_excl_luc_Mt, df.co2_land_use_change_Mt
text = re.sub(r"\s+", " ", " ".join(p.get_text() for p in pymupdf.open(ROOT / "ESS_IA_Cameroon_TreeCoverLoss_CO2.pdf")))
body, refs = text.split(" References ", 1)
refs = refs.split("Declaration of AI assistance")[0]

fmt = lambda x: f"{int(round(x)):,}"
checks = {
    "min loss 2001-2012 (23,003)": fmt(loss.loc[2001:2012].min()) == "23,003",
    "max loss 2001-2012 (57,992)": fmt(loss.loc[2001:2012].max()) == "57,992",
    "max loss (204,198 in 2023)": fmt(loss.max()) == "204,198" and loss.idxmax() == 2023,
    "2014 loss 181,851": fmt(loss[2014]) == "181,851",
    "2014 more than doubled": loss[2014] > 2 * loss[2013],
    "2015 fall 102,881": fmt(loss[2014] - loss[2015]) == "102,881",
    "2014 and 2015 CO2 rose": co2[2014] > co2[2013] and co2[2015] > co2[2014],
    "2007 loss rise 9,931": fmt(loss[2007] - loss[2006]) == "9,931",
    "LUC 2008-10 = 54.9/81.9/51.2": [round(luc[y], 1) for y in (2008, 2009, 2010)] == [54.9, 81.9, 51.2],
    "loss 2008-10 range 35,141-57,992": (fmt(loss.loc[2008:2010].min()), fmt(loss.loc[2008:2010].max())) == ("35,141", "57,992"),
    "CO2 2015-2024 range 9.582-9.965": (f"{co2.loc[2015:2024].min():.3f}", f"{co2.loc[2015:2024].max():.3f}") == ("9.582", "9.965"),
    "CO2 2015-2024 spread 0.383 (~4%)": f"{co2.loc[2015:2024].max() - co2.loc[2015:2024].min():.3f}" == "0.383"
        and round(100 * 0.383 / co2.loc[2015:2024].mean()) == 4,
    "Δloss 2002 = −10,437": fmt(loss[2002] - loss[2001]) == "-10,437" and fmt(loss[2002]) == "28,767" and fmt(loss[2001]) == "39,204",
    "10! = 3,628,800": int(np.prod(range(1, 11))) == 3628800,
    "Σd² 568 → 3,408 / 13,800": 6 * res["spearman_loss_co2"]["sum_d2"] == 3408 and 24 * (24 ** 2 - 1) == 13800,
    "1 − rs² ≈ 0.433": f"{1 - res['spearman_loss_co2']['rs'] ** 2:.3f}" == "0.433",
    "five highest-loss years below line": all(
        co2[y] < res["regression_co2_on_loss"]["intercept_Mt"] + res["regression_co2_on_loss"]["slope_Mt_per_ha"] * loss[y]
        for y in loss.sort_values().index[-5:]) and sorted(loss.sort_values().index[-5:]) == [2014, 2017, 2020, 2023, 2024],
    "GFW emissions ≈ 7 × mean fossil CO2": round(res["gfw_gross_forest_emissions_MtCO2e_mean_2001_2024"] / co2.mean()) == 7,
    "31.5 Mha extent, 2.23 Mha loss": round(res["gfw_meta"]["extent_2000_ha_30pct"] / 1e6, 1) == 31.5
        and round(res["gfw_meta"]["total_loss_2001_2024_ha"] / 1e6, 2) == 2.23,
    "±0.5/10.3 ≈ 5%, ±0.7/1.3 ≈ 54%": round(100 * 0.5 / 10.3) == 5 and round(100 * 0.7 / 1.3) == 54,
    "two CO2 steps 2006-07 and 2013-15": (co2[2007] - co2[2006]) > 1.5 and (co2[2015] - co2[2013]) > 1.5,
}
for name, ok in checks.items():
    print(("PASS " if ok else "FAIL ") + name)

keys = [("Alemagi et al.", "2014", "Alemagi, D."), ("Dkamela", "2011", "Dkamela, G.P. (2011)"),
        ("Dkamela et al.", "2014", "Dkamela, G.P., Brockhaus"), ("Friedlingstein et al.", "2026", "Friedlingstein, P."),
        ("Gibbs et al.", "2025", "Gibbs, D.A."), ("Global Forest Watch", "2024", "Global Forest Watch (2024)"),
        ("Global Forest Watch", "2026", "Global Forest Watch (2026)"), ("Hansen et al.", "2013", "Hansen, M.C."),
        ("Harris et al.", "2021", "Harris, N.L."), ("Millennium Ecosystem Assessment", "2005", "Millennium Ecosystem Assessment (2005)"),
        ("Our World in Data", "2026", "Our World in Data (2026)"), ("Republic of Cameroon", "2019", "Republic of Cameroon (2019)"),
        ("Sims et al.", "2025", "Sims, M."), ("United Nations", "2015", "United Nations (2015)"),
        ("World Bank", "n.d.", "World Bank (n.d.)"), ("World Bank Group", "2022", "World Bank Group (2022)")]
src = (ROOT / "build/build_ia.js").read_text()
ref_block = src[src.index("const refs = ["):src.index("];", src.index("const refs = ["))]
n_refs = len(re.findall(r'^\s*"', ref_block, flags=re.M))
for name, yr, start in keys:
    cited = bool(re.search(re.escape(name) + r",? \(?" + re.escape(yr), body))
    listed = start in refs
    print(("PASS " if cited and listed else "FAIL ") + f"citation {name} {yr}: cited={cited} listed={listed}")
print(("PASS " if n_refs == len(keys) else "FAIL ") + f"reference list has {n_refs} entries, {len(keys)} expected")
stray = re.findall(r"[_^]\{|\*\*|[A-Za-z]\*[A-Za-z]|§TOC", text)
print(("PASS " if not stray else "FAIL ") + f"stray markup: {stray[:5]}")
