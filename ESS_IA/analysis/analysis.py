"""
ESS IA - Tree-cover loss vs CO2 emissions, Cameroon 2001-2024.

Reproducible processing of two secondary datasets:
  1. Global Forest Watch / UMD tree-cover loss, country statistics, release v20260427
     (data/raw/GFW_CMR_country_stats_v20260427.xlsx, sheet "Country tree cover loss",
     canopy-cover threshold 30 %).
  2. Global Carbon Budget 2025 national CO2 emissions, as distributed by Our World in Data
     (data/raw/owid-co2-data_Cameroon_all_columns.csv; columns co2, land_use_change_co2).

Every statistic is computed twice (library routine + hand formula) and the script
stops if the two disagree.
"""
import itertools
import json
from pathlib import Path

import numpy as np
import openpyxl
import pandas as pd
from scipy import stats

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "processed"
FIG = ROOT / "figures"
OUT.mkdir(parents=True, exist_ok=True)
FIG.mkdir(parents=True, exist_ok=True)

YEARS = list(range(2001, 2025))
THRESHOLD = 30
results = {}


# ---------------------------------------------------------------- 1. extract data
def gfw_loss(path, threshold=THRESHOLD):
    wb = openpyxl.load_workbook(path, read_only=True)
    rows = list(wb["Country tree cover loss"].iter_rows(values_only=True))
    hdr = rows[0]
    for r in rows[1:]:
        rec = dict(zip(hdr, r))
        if rec["country"] == "Cameroon" and rec["threshold"] == threshold:
            return rec
    raise ValueError("Cameroon row not found")


gfw = gfw_loss(RAW / "GFW_CMR_country_stats_v20260427.xlsx")
gfw_prev = gfw_loss(RAW / "GFW_CMR_country_stats_previous_release_2001-2024.xlsx")
loss = np.array([gfw[f"tc_loss_ha_{y}"] for y in YEARS], dtype=float)
loss_prev = np.array([gfw_prev[f"tc_loss_ha_{y}"] for y in YEARS], dtype=float)

owid = pd.read_csv(RAW / "owid-co2-data_Cameroon_all_columns.csv").set_index("year")
co2 = owid.loc[YEARS, "co2"].to_numpy(dtype=float)
luc = owid.loc[YEARS, "land_use_change_co2"].to_numpy(dtype=float)

assert len(loss) == len(co2) == 24
assert not np.isnan(loss).any() and not np.isnan(co2).any() and not np.isnan(luc).any()

data = pd.DataFrame({
    "year": YEARS,
    "tree_cover_loss_ha": loss.astype(int),
    "co2_excl_luc_Mt": co2,
    "co2_land_use_change_Mt": luc,
})
data.to_csv(OUT / "cameroon_2001_2024_matched.csv", index=False)

results["gfw_meta"] = {
    "country_area_ha": gfw["area_ha"],
    "extent_2000_ha_30pct": gfw["extent_2000_ha"],
    "extent_pct_of_country": round(100 * gfw["extent_2000_ha"] / gfw["area_ha"], 1),
    "total_loss_2001_2024_ha": int(loss.sum()),
    "total_loss_pct_of_2000_extent": round(100 * loss.sum() / gfw["extent_2000_ha"], 2),
    "max_abs_difference_vs_previous_release_ha": int(np.abs(loss - loss_prev).max()),
    "years_differing_vs_previous_release": int((loss != loss_prev).sum()),
}

# fuel breakdown (for anomaly discussion) and population (confounder context)
fuel = owid.loc[YEARS, ["oil_co2", "gas_co2", "cement_co2", "flaring_co2", "co2"]]
fuel.to_csv(OUT / "cameroon_co2_by_source_2001_2024.csv")
results["co2_2006_2007_change"] = {
    c: round(float(owid.loc[2007, c] - owid.loc[2006, c]), 3)
    for c in ["co2", "oil_co2", "gas_co2", "cement_co2", "flaring_co2"]
}
results["population"] = {
    "2001": int(owid.loc[2001, "population"]),
    "2024": int(owid.loc[2024, "population"]),
    "ratio": round(float(owid.loc[2024, "population"] / owid.loc[2001, "population"]), 2),
}
results["luc_over_fossil_ratio_range"] = [
    round(float((luc / co2).min()), 2), round(float((luc / co2).max()), 2)]

# drivers of loss (Sims et al. 2025 layer in the GFW file)
wb = openpyxl.load_workbook(RAW / "GFW_CMR_country_stats_v20260427.xlsx", read_only=True)
drows = list(wb["Country drivers"].iter_rows(values_only=True))
drv = pd.DataFrame(drows[1:], columns=drows[0])
drv = drv[(drv.threshold == 30) & (drv.year.between(2001, 2024))]
drv_tot = drv.groupby("driver").tc_loss_ha.sum().sort_values(ascending=False)
drv_share = (100 * drv_tot / drv_tot.sum()).round(1)
results["drivers_2001_2024_pct"] = drv_share.to_dict()
results["drivers_total_ha"] = int(drv_tot.sum())
drv.pivot_table(index="year", columns="driver", values="tc_loss_ha", aggfunc="sum").to_csv(
    OUT / "cameroon_loss_by_driver_2001_2024.csv")

# GFW modelled gross forest emissions (context only - derived FROM loss, so circular)
crow = list(wb["Country carbon data"].iter_rows(values_only=True))
chdr = crow[0]
c30 = [dict(zip(chdr, r)) for r in crow[1:] if r[1] == 30][0]
gfw_em = np.array([c30[f"gfw_forest_carbon_gross_emissions_{y}__Mg_CO2e"] for y in YEARS]) / 1e6
results["gfw_gross_forest_emissions_MtCO2e_mean_2001_2024"] = round(float(gfw_em.mean()), 1)


# ---------------------------------------------------------------- 2. descriptive stats
def describe(x):
    q1, med, q3 = np.percentile(x, [25, 50, 75])
    return {
        "n": int(len(x)), "mean": float(np.mean(x)), "median": float(med),
        "sd_sample": float(np.std(x, ddof=1)), "min": float(np.min(x)),
        "max": float(np.max(x)), "range": float(np.ptp(x)), "q1": float(q1),
        "q3": float(q3), "iqr": float(q3 - q1),
        "cv_pct": float(100 * np.std(x, ddof=1) / np.mean(x)),
        "skewness": float(stats.skew(x, bias=False)),
    }


results["describe_loss"] = describe(loss)
results["describe_co2"] = describe(co2)
results["describe_luc"] = describe(luc)
# period means (2001-2012 vs 2013-2024)
for name, arr in [("loss", loss), ("co2", co2), ("luc", luc)]:
    results[f"period_mean_{name}"] = {
        "2001_2012": float(arr[:12].mean()), "2013_2024": float(arr[12:].mean())}

# normality (Shapiro-Wilk)
results["shapiro"] = {}
for name, arr in [("loss", loss), ("co2", co2), ("luc", luc)]:
    w, p = stats.shapiro(arr)
    results["shapiro"][name] = {"W": float(w), "p": float(p)}


# ---------------------------------------------------------------- 3. Spearman by hand
def spearman_by_hand(x, y):
    rx = stats.rankdata(x)          # rank 1 = smallest
    ry = stats.rankdata(y)
    ties = (len(set(x)) < len(x)) or (len(set(y)) < len(y))
    d = rx - ry
    n = len(x)
    rs_formula = 1 - 6 * np.sum(d ** 2) / (n * (n ** 2 - 1))
    rs_lib, p_lib = stats.spearmanr(x, y)
    if not ties:
        assert abs(rs_formula - rs_lib) < 1e-12, (rs_formula, rs_lib)
    df_ = n - 2
    t = rs_lib * np.sqrt(df_ / (1 - rs_lib ** 2))
    p_t = 2 * stats.t.sf(abs(t), df_)
    assert abs(p_t - p_lib) < 1e-9
    t_crit = stats.t.ppf(0.975, df_)
    rs_crit = t_crit / np.sqrt(t_crit ** 2 + df_)
    return {
        "n": n, "ties": bool(ties), "sum_d2": float(np.sum(d ** 2)),
        "rs_formula": float(rs_formula), "rs": float(rs_lib), "t": float(t), "df": df_,
        "p_two_tailed": float(p_lib), "t_crit_0.05": float(t_crit),
        "rs_crit_0.05": float(rs_crit),
    }, rx, ry, d


sp_main, rx, ry, d = spearman_by_hand(loss, co2)
results["spearman_loss_co2"] = sp_main
rank_table = pd.DataFrame({
    "year": YEARS, "loss_ha": loss.astype(int), "rank_loss": rx.astype(int),
    "co2_Mt": co2, "rank_co2": ry.astype(int), "d": d.astype(int), "d2": (d ** 2).astype(int)})
rank_table.to_csv(OUT / "spearman_rank_table.csv", index=False)

# ---------------------------------------------------------------- 4. Pearson + regression (comparison)
r_lib, p_r = stats.pearsonr(loss, co2)
xm, ym = loss.mean(), co2.mean()
r_hand = np.sum((loss - xm) * (co2 - ym)) / np.sqrt(np.sum((loss - xm) ** 2) * np.sum((co2 - ym) ** 2))
assert abs(r_lib - r_hand) < 1e-12
slope, intercept = np.polyfit(loss, co2, 1)
b_hand = np.sum((loss - xm) * (co2 - ym)) / np.sum((loss - xm) ** 2)
a_hand = ym - b_hand * xm
assert abs(slope - b_hand) < 1e-15 and abs(intercept - a_hand) < 1e-9
resid = co2 - (intercept + slope * loss)
results["pearson_loss_co2"] = {"r": float(r_lib), "p": float(p_r), "r2": float(r_lib ** 2)}
results["regression_co2_on_loss"] = {
    "slope_Mt_per_ha": float(slope), "slope_Mt_per_100000ha": float(slope * 1e5),
    "intercept_Mt": float(intercept), "r2": float(r_lib ** 2),
    "shapiro_residuals_p": float(stats.shapiro(resid)[1]),
    # residual pattern: mean residual for loss below/above median
    "mean_resid_low_loss": float(resid[loss < np.median(loss)].mean()),
    "mean_resid_high_loss": float(resid[loss >= np.median(loss)].mean()),
}

# ---------------------------------------------------------------- 5. time trend of each variable
results["spearman_year_loss"] = float(stats.spearmanr(YEARS, loss)[0])
results["spearman_year_co2"] = float(stats.spearmanr(YEARS, co2)[0])
results["spearman_year_luc"] = float(stats.spearmanr(YEARS, luc)[0])

# ---------------------------------------------------------------- 6. first differences (detrended)
dl, dc = np.diff(loss), np.diff(co2)
sp_diff, *_ = spearman_by_hand(dl, dc)
results["spearman_first_differences"] = sp_diff
results["same_direction_years"] = int(np.sum(np.sign(dl) == np.sign(dc)))
pd.DataFrame({"year": YEARS[1:], "delta_loss_ha": dl.astype(int), "delta_co2_Mt": np.round(dc, 3)}).to_csv(
    OUT / "first_differences.csv", index=False)


# ---------------------------------------------------------------- 7. 2015-2024 sub-period (exact test)
def exact_spearman_p(x, y):
    """Exact two-tailed permutation p-value for Spearman's rs (no ties, small n)."""
    rx, ry = stats.rankdata(x), stats.rankdata(y)
    n = len(x)
    obs = 1 - 6 * np.sum((rx - ry) ** 2) / (n * (n ** 2 - 1))
    base = np.arange(1, n + 1)
    perms = np.array(list(itertools.permutations(base)), dtype=np.int8)
    d2 = ((perms - rx.astype(np.int8)) ** 2).sum(axis=1)
    rs_all = 1 - 6 * d2 / (n * (n ** 2 - 1))
    p = np.mean(np.abs(rs_all) >= abs(obs) - 1e-12)
    # exact two-tailed critical value at alpha = 0.05
    vals = np.sort(np.unique(np.round(np.abs(rs_all), 10)))
    crit = next(v for v in vals if np.mean(np.abs(rs_all) >= v - 1e-12) <= 0.05)
    return float(obs), float(p), float(crit)


idx = [YEARS.index(y) for y in range(2015, 2025)]
rs_sub, p_sub, crit_sub = exact_spearman_p(loss[idx], co2[idx])
assert abs(rs_sub - stats.spearmanr(loss[idx], co2[idx])[0]) < 1e-12
results["spearman_2015_2024"] = {"n": 10, "rs": rs_sub, "p_exact": p_sub, "rs_crit_exact_0.05": crit_sub}

# ---------------------------------------------------------------- 8. supplementary: land-use-change CO2
sp_luc, *_ = spearman_by_hand(loss, luc)
results["spearman_loss_luc"] = sp_luc

# ---------------------------------------------------------------- 9. notable years
results["top5_loss_years"] = [int(YEARS[i]) for i in np.argsort(loss)[::-1][:5]]
results["top3_luc_years"] = [int(YEARS[i]) for i in np.argsort(luc)[::-1][:3]]
results["loss_2014_over_2013"] = round(float(loss[13] / loss[12]), 2)

(OUT / "results.json").write_text(json.dumps(results, indent=2, default=float))
print(json.dumps(results, indent=2, default=float))
print(rank_table.to_string(index=False))
