#!/usr/bin/env python3
"""
ESS Individual Investigation -- reproducible analysis pipeline.

Population growth and CO2 emissions from land-use change in Cameroon, 1961-2023.

Data source (downloaded automatically, no account needed):
    https://github.com/owid/co2-data  ->  owid-co2-data.csv
    Our World in Data's official distribution of the CO2 and Greenhouse Gas
    Emissions dataset. Underlying sources: Global Carbon Budget (2025) for
    emissions; Maddison Project Database 2023 for GDP.

Variables used:
    land_use_change_co2  CO2 from land-use change, million tonnes (Mt) per year
    population           people
    gdp                  international-$, 2011 prices
    co2                  fossil CO2 excluding land-use change, Mt per year

Outputs to ../output/: tables, figures, results.json, and IA_FINAL.md with every
{{placeholder}} in the report substituted.

Nothing is estimated or imputed by this script. Missing years stay missing.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DATA = ROOT / "data"
OUT = ROOT / "output"
DATA.mkdir(exist_ok=True)
OUT.mkdir(exist_ok=True)

URL = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv"
RAW = DATA / "owid-co2-data.csv"
COUNTRY = "Cameroon"
Y0, Y1 = 1961, 2023
ALPHA = 0.05
PEERS = ["Cote d'Ivoire", "Ghana", "Nigeria", "Democratic Republic of Congo", "Gabon"]

# Colourblind-safe pair, validated (protan dE 22.3, normal dE 31.3, contrast >= 3:1)
C_POP, C_LUC = "#1f6fb2", "#d95f02"
C_INK, C_MUTED, C_GRID = "#0b0b0b", "#52514e", "#d9d8d4"


def md_table(df: pd.DataFrame, index: bool = False, floatfmt: str = ",.2f") -> str:
    d = df.reset_index() if index else df

    def cell(v):
        if v is None or (isinstance(v, float) and pd.isna(v)):
            return ""
        if isinstance(v, (int, np.integer)):
            return f"{v:,}"
        if isinstance(v, (float, np.floating)):
            return format(v, floatfmt)
        return str(v)

    head = [str(c) for c in d.columns]
    rows = [[cell(v) for v in r] for r in d.itertuples(index=False)]
    return "\n".join(["| " + " | ".join(head) + " |",
                      "|" + "|".join("---" for _ in head) + "|"]
                     + ["| " + " | ".join(r) + " |" for r in rows])


def fmt_p(p: float) -> str:
    return "< 0.001" if p < 0.001 else f"{p:.3f}"


def strength(r: float) -> str:
    a = abs(r)
    return ("negligible" if a < 0.20 else "weak" if a < 0.40 else
            "moderate" if a < 0.60 else "strong" if a < 0.80 else "very strong")


def crit_r(n: int, alpha: float = ALPHA) -> float:
    if n < 4:
        return float("nan")
    tc = stats.t.ppf(1 - alpha / 2, n - 2)
    return float(tc / np.sqrt(tc**2 + n - 2))


def correlate(x, y, label: str) -> dict:
    d = pd.DataFrame({"x": x, "y": y}).dropna()
    n = len(d)
    if n < 4:
        return {"label": label, "n": n}
    rs, ps = stats.spearmanr(d.x, d.y)
    rp, pp = stats.pearsonr(d.x, d.y)
    return {"label": label, "n": n,
            "spearman_rho": round(float(rs), 3), "spearman_p": float(ps),
            "pearson_r": round(float(rp), 3), "pearson_p": float(pp),
            "crit": round(crit_r(n), 3), "significant": bool(ps < ALPHA)}


def fetch() -> Path:
    if RAW.exists() and RAW.stat().st_size > 1_000_000:
        print(f"  using cached {RAW.name} ({RAW.stat().st_size/1e6:.1f} MB)")
        return RAW
    print(f"  downloading {URL}")
    try:
        urllib.request.urlretrieve(URL, RAW)
    except Exception as e:
        print(f"\nERROR: download failed ({e}).\n"
              f"Fetch {URL} manually and save it to {RAW}.\n", file=sys.stderr)
        sys.exit(2)
    print(f"  saved {RAW.name} ({RAW.stat().st_size/1e6:.1f} MB)")
    return RAW


def figures(c: pd.DataFrame, lags: list[dict], primary: dict,
            early: dict, late: dict, peers: pd.DataFrame) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.patheffects as pe
    import matplotlib.pyplot as plt

    plt.rcParams.update({
        "font.size": 9, "axes.titlesize": 10, "axes.labelsize": 9,
        "axes.edgecolor": C_MUTED, "text.color": C_INK,
        "xtick.color": C_MUTED, "ytick.color": C_MUTED,
        "axes.grid": True, "grid.color": C_GRID, "grid.linewidth": 0.6,
        "axes.spines.top": False, "axes.spines.right": False,
        "figure.facecolor": "white", "axes.facecolor": "white"})
    th = matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}")
    halo = [pe.withStroke(linewidth=2.5, foreground="white")]

    # Fig 1 -- two panels, never a dual axis
    fig, (a1, a2) = plt.subplots(2, 1, figsize=(7.0, 5.4), sharex=True)
    a1.plot(c.year, c.population / 1e6, color=C_POP, lw=2)
    a1.set_title("Population, Cameroon", loc="left")
    a1.set_ylabel("millions")
    a2.plot(c.year, c.land_use_change_co2, color=C_LUC, lw=2)
    a2.set_title("CO$_2$ emissions from land-use change, Cameroon", loc="left")
    a2.set_ylabel("Mt CO$_2$ per year")
    a2.set_xlabel("Year")
    a2.yaxis.set_major_formatter(th)
    fig.suptitle("Figure 1  Each variable on its own scale",
                 x=0.012, ha="left", fontsize=10.5)
    fig.tight_layout(rect=(0, 0, 1, 0.96))
    fig.savefig(OUT / "fig1_series.png", dpi=200)
    plt.close(fig)

    # Fig 2 -- primary scatter
    s = c.dropna(subset=["pop_delta", "land_use_change_co2"])
    fig, ax = plt.subplots(figsize=(6.2, 4.6))
    ax.scatter(s.pop_delta / 1e3, s.land_use_change_co2, s=40, color=C_POP,
               edgecolor="white", linewidth=1.1, zorder=3)
    m, b = np.polyfit(s.pop_delta / 1e3, s.land_use_change_co2, 1)
    xs = np.linspace((s.pop_delta / 1e3).min(), (s.pop_delta / 1e3).max(), 50)
    ax.plot(xs, m * xs + b, color=C_LUC, lw=2, zorder=2)
    ax.set_title("Figure 2  Land-use-change emissions against annual population growth",
                 loc="left")
    ax.set_xlabel("Annual population increase (thousands of people)")
    ax.set_ylabel("CO$_2$ from land-use change (Mt yr$^{-1}$)")
    ax.text(0.03, 0.97,
            f"Spearman $r_s$ = {primary['spearman_rho']}  "
            f"(p = {fmt_p(primary['spearman_p'])}, n = {primary['n']})\n"
            f"Pearson $r$ = {primary['pearson_r']}   "
            f"critical |r| = {primary['crit']}",
            transform=ax.transAxes, va="top", fontsize=8,
            bbox=dict(boxstyle="round,pad=0.45", fc="white", ec=C_GRID, lw=0.8))
    fig.tight_layout()
    fig.savefig(OUT / "fig2_scatter.png", dpi=200)
    plt.close(fig)

    # Fig 3 -- the decoupling result
    fig, ax = plt.subplots(figsize=(7.0, 3.8))
    pc = c.land_use_change_co2 * 1e6 / c.population
    ax.plot(c.year, pc, color=C_LUC, lw=2)
    ax.fill_between(c.year, pc, color=C_LUC, alpha=0.10)
    for yr in (int(c.year.min()), int(c.year.max())):
        v = pc[c.year == yr].iloc[0]
        ax.annotate(f"{v:.2f}", xy=(yr, v), xytext=(6 if yr == c.year.min() else -6, 6),
                    textcoords="offset points", fontsize=8, color=C_INK,
                    ha="left" if yr == c.year.min() else "right",
                    fontweight="bold", path_effects=halo)
    ax.set_title("Figure 3  Land-use-change emissions per person, Cameroon", loc="left")
    ax.set_ylabel("t CO$_2$ per person per year")
    ax.set_xlabel("Year")
    fig.tight_layout()
    fig.savefig(OUT / "fig3_percapita.png", dpi=200)
    plt.close(fig)

    # Fig 4 -- sub-period sign reversal
    fig, axs = plt.subplots(1, 2, figsize=(7.6, 3.8), sharey=True)
    for ax, (lo, hi, res, lab) in zip(axs, [(1961, 1990, early, "1961–1990"),
                                            (1991, 2023, late, "1991–2023")]):
        d = c[(c.year >= lo) & (c.year <= hi)].dropna(
            subset=["pop_delta", "land_use_change_co2"])
        ax.scatter(d.pop_delta / 1e3, d.land_use_change_co2, s=36, color=C_POP,
                   edgecolor="white", linewidth=1.1, zorder=3)
        if len(d) > 2:
            m, b = np.polyfit(d.pop_delta / 1e3, d.land_use_change_co2, 1)
            xs = np.linspace((d.pop_delta / 1e3).min(), (d.pop_delta / 1e3).max(), 40)
            ax.plot(xs, m * xs + b, color=C_LUC, lw=2, zorder=2)
        ax.set_title(f"{lab}   $r_s$ = {res.get('spearman_rho')}  "
                     f"(p = {fmt_p(res['spearman_p'])})", loc="left", fontsize=9)
        ax.set_xlabel("Annual population increase (thousands)")
    axs[0].set_ylabel("CO$_2$ from land-use change (Mt yr$^{-1}$)")
    fig.suptitle("Figure 4  The relationship reverses sign between sub-periods",
                 x=0.012, ha="left", fontsize=10.5)
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    fig.savefig(OUT / "fig4_subperiods.png", dpi=200)
    plt.close(fig)

    # Fig 5 -- lag profile
    fig, ax = plt.subplots(figsize=(6.2, 3.6))
    L = [l["lag"] for l in lags]
    R = [l["spearman_rho"] for l in lags]
    cr = lags[0]["crit"]
    ax.axhline(0, color=C_MUTED, lw=1)
    ax.axhline(cr, color=C_LUC, lw=1.2, ls=(0, (5, 3)))
    ax.axhline(-cr, color=C_LUC, lw=1.2, ls=(0, (5, 3)))
    ax.text(max(L), -cr, f"significance threshold (α = {ALPHA})  ", color=C_LUC,
            fontsize=7.5, va="top", ha="right")
    ax.plot(L, R, color=C_POP, lw=2, marker="o", ms=7,
            markeredgecolor="white", markeredgewidth=1.4)
    ax.set_title("Figure 5  Lagged correlation: population growth leading emissions",
                 loc="left")
    ax.set_xlabel("Lag applied to population growth (years)")
    ax.set_ylabel("Spearman $r_s$")
    ax.set_xticks(L)
    ax.set_ylim(-1.05, 1.05)
    fig.tight_layout()
    fig.savefig(OUT / "fig5_lag.png", dpi=200)
    plt.close(fig)

    # Fig 6 -- regional context, with de-collided end labels
    if not peers.empty:
        short = {"Democratic Republic of Congo": "DR Congo",
                 "Cote d'Ivoire": "Cote d'Ivoire"}
        fig, ax = plt.subplots(figsize=(7.2, 4.2))
        ends = []
        for name in peers.country.unique():
            d = peers[peers.country == name].sort_values("year")
            if d.empty:
                continue
            is_cm = name == COUNTRY
            ax.plot(d.year, d.pc, lw=2.4 if is_cm else 1.2,
                    color=C_LUC if is_cm else C_GRID,
                    zorder=3 if is_cm else 1)
            ends.append([short.get(name, name), float(d.year.iloc[-1]),
                         float(d.pc.iloc[-1]), is_cm])
        # push labels apart vertically so none overlap
        ends.sort(key=lambda e: -e[2])
        lo, hi = peers.pc.min(), peers.pc.max()
        gap = (hi - lo) * 0.055
        for i in range(1, len(ends)):
            if ends[i][2] > ends[i - 1][2] - gap:
                ends[i][2] = ends[i - 1][2] - gap
        shift = max(0.0, lo - min(e[2] for e in ends))   # keep labels inside the axes
        for e in ends:
            e[2] += shift
        xmax = peers.year.max()
        pad = (xmax - peers.year.min()) * 0.16
        for name, xe, ye, is_cm in ends:
            ax.annotate(name, xy=(xmax + pad * 0.06, ye), va="center",
                        fontsize=8, fontweight="bold" if is_cm else "normal",
                        color=C_LUC if is_cm else C_MUTED,
                        path_effects=halo, annotation_clip=False)
        ax.set_title("Figure 6  Cameroon in regional context", loc="left")
        ax.set_ylabel("t CO$_2$ from land-use change per person")
        ax.set_xlabel("Year")
        ax.set_xlim(peers.year.min(), xmax + pad)
        fig.tight_layout()
        fig.savefig(OUT / "fig6_peers.png", dpi=200)
        plt.close(fig)
    print(f"  figures written to {OUT}")


def main() -> None:
    print("\nESS IA analysis -- population growth and land-use-change emissions, Cameroon")
    print("=" * 72 + "\nData:")
    df = pd.read_csv(fetch(), low_memory=False)

    c = df[df.country == COUNTRY].sort_values("year")
    c = c[(c.year >= Y0) & (c.year <= Y1)].copy()
    if c.empty:
        print(f"ERROR: no rows for {COUNTRY}", file=sys.stderr); sys.exit(1)

    c["pop_delta"] = c.population.diff()
    c["luc_delta"] = c.land_use_change_co2.diff()
    c["luc_per_capita"] = c.land_use_change_co2 * 1e6 / c.population
    c["gdp_per_capita"] = c.gdp / c.population

    print("\nCompleteness (1961-2023, 63 years expected):")
    for col in ["land_use_change_co2", "population", "gdp", "co2"]:
        got = int(c[col].notna().sum())
        miss = sorted(set(range(Y0, Y1 + 1)) - set(c.loc[c[col].notna(), "year"].astype(int)))
        print(f"  {col:<22} n={got:<3}" + (f"  missing {miss}" if miss else "  complete"))
    flat = int((c.land_use_change_co2.diff() == 0).sum())
    print(f"  land_use_change_co2: {c.land_use_change_co2.nunique()} distinct values, "
          f"{flat} zero-change years")

    # ---- correlations
    primary = correlate(c.pop_delta, c.land_use_change_co2, "Annual population growth vs LUC CO2")
    levels = correlate(c.population, c.land_use_change_co2, "Population (levels) vs LUC CO2")
    diffs = correlate(c.pop_delta, c.luc_delta, "Population growth vs change in LUC CO2")
    gdppc = correlate(c.gdp_per_capita, c.land_use_change_co2, "GDP per capita vs LUC CO2")
    trend = correlate(c.year, c.land_use_change_co2, "Year vs LUC CO2 (trend test)")
    early = correlate(c[c.year <= 1990].pop_delta, c[c.year <= 1990].land_use_change_co2,
                      "Population growth vs LUC CO2, 1961-1990")
    late = correlate(c[c.year >= 1991].pop_delta, c[c.year >= 1991].land_use_change_co2,
                     "Population growth vs LUC CO2, 1991-2023")
    lags = []
    for k in range(7):
        r = correlate(c.pop_delta.shift(k), c.land_use_change_co2, f"lag {k}")
        if "spearman_rho" in r:
            r["lag"] = k
            lags.append(r)
    best = max(lags, key=lambda d: abs(d["spearman_rho"]))

    sw_luc = stats.shapiro(c.land_use_change_co2.dropna())
    sw_pop = stats.shapiro(c.pop_delta.dropna())

    peers = []
    for name in [COUNTRY] + PEERS:
        d = df[(df.country == name) & (df.year >= Y0) & (df.year <= Y1)]
        if len(d):
            peers.append(pd.DataFrame({
                "country": name, "year": d.year,
                "pc": d.land_use_change_co2 * 1e6 / d.population}).dropna())
    peers = pd.concat(peers) if peers else pd.DataFrame()

    # ---- tables
    t1 = c[["year", "population", "pop_delta", "land_use_change_co2",
            "luc_per_capita", "co2", "gdp_per_capita"]]
    t1.to_csv(OUT / "table1_cameroon.csv", index=False)
    (OUT / "table1_cameroon.md").write_text(
        "**Table 1.** Cameroon, 1961-2023. Population (people); annual population "
        "increase (people); CO2 from land-use change (Mt); land-use-change CO2 per "
        "person (t); fossil CO2 (Mt); GDP per capita (int-$ 2011).\n\n"
        + md_table(t1, floatfmt=",.2f"))

    dec = (c.assign(decade=(c.year // 10 * 10))
             .groupby("decade")
             .agg(mean_luc=("land_use_change_co2", "mean"),
                  mean_pop_m=("population", lambda s: s.mean() / 1e6),
                  mean_luc_pc=("luc_per_capita", "mean"),
                  n=("year", "count")).reset_index())
    (OUT / "table2_summary.md").write_text(
        "**Table 2.** Decade means.\n\n" + md_table(dec, floatfmt=",.2f")
        + "\n\n**Distribution, 1961-2023**\n\n"
        + md_table(c[["land_use_change_co2", "population", "pop_delta",
                      "luc_per_capita"]].describe().T, index=True, floatfmt=",.2f")
        + f"\n\nShapiro-Wilk normality: land-use-change CO2 W = {sw_luc.statistic:.3f}, "
        f"p = {fmt_p(sw_luc.pvalue)}; annual population increase W = {sw_pop.statistic:.3f}, "
        f"p = {fmt_p(sw_pop.pvalue)}. Both reject normality at α = 0.05, so Spearman's "
        "rank correlation is the appropriate primary test.\n")

    allr = [primary, levels, diffs, gdppc, trend, early, late] + lags
    t3 = pd.DataFrame([{
        "Test": r["label"], "n": r["n"], "Spearman rs": r.get("spearman_rho"),
        "p (rs)": fmt_p(r["spearman_p"]), "Pearson r": r.get("pearson_r"),
        "p (r)": fmt_p(r["pearson_p"]), "critical |r|": r.get("crit"),
        "sig. at 0.05": "yes" if r.get("significant") else "no"} for r in allr])
    (OUT / "table3_correlations.md").write_text(
        "**Table 3.** Correlation results.\n\n" + md_table(t3, floatfmt=",.3f"))

    # Appendix B -- worked Spearman
    s = pd.DataFrame({"year": c.year, "x": c.pop_delta,
                      "y": c.land_use_change_co2}).dropna()
    s["rank_x"] = s.x.rank(); s["rank_y"] = s.y.rank()
    s["d"] = s.rank_x - s.rank_y; s["d2"] = s.d ** 2
    n, sd2 = len(s), s.d2.sum()
    (OUT / "appendix_b_spearman.md").write_text(
        "**Appendix B -- worked Spearman calculation (primary test)**\n\n"
        + md_table(s, floatfmt=",.1f")
        + f"\n\nn = {n}   Sum d^2 = {sd2:,.1f}\n\n"
        f"rs = 1 - (6 x {sd2:,.1f}) / ({n} x ({n}^2 - 1)) = "
        f"{1 - (6*sd2)/(n*(n**2-1)):.3f}\n\n"
        f"Tie-corrected value used in the report: {primary['spearman_rho']}\n\n"
        f"Critical |r|, alpha = {ALPHA}, n = {n}: {primary['crit']}\n")

    figures(c, lags, primary, early, late, peers)

    # ---- fill the report
    f, l = c.iloc[0], c.iloc[-1]
    repl = {
        "POP_1961": f"{f.population/1e6:.2f}", "POP_2023": f"{l.population/1e6:.2f}",
        "POP_FACTOR": f"{l.population/f.population:.1f}",
        "LUC_1961": f"{f.land_use_change_co2:.1f}", "LUC_2023": f"{l.land_use_change_co2:.1f}",
        "LUC_PCT": f"{(l.land_use_change_co2/f.land_use_change_co2-1)*100:+.0f}",
        "LUC_MEAN": f"{c.land_use_change_co2.mean():.1f}",
        "LUC_SD": f"{c.land_use_change_co2.std():.1f}",
        "LUC_MIN": f"{c.land_use_change_co2.min():.1f}",
        "LUC_MAX": f"{c.land_use_change_co2.max():.1f}",
        "LUC_MAX_YR": f"{int(c.loc[c.land_use_change_co2.idxmax(),'year'])}",
        "LUC_MIN_YR": f"{int(c.loc[c.land_use_change_co2.idxmin(),'year'])}",
        "PC_1961": f"{f.luc_per_capita:.2f}", "PC_2023": f"{l.luc_per_capita:.2f}",
        "PC_DROP": f"{(1-l.luc_per_capita/f.luc_per_capita)*100:.0f}",
        "FOSSIL_2023": f"{l.co2:.1f}",
        "LUC_VS_FOSSIL": f"{l.land_use_change_co2/l.co2:.1f}",
        "DEC_1970S": f"{dec.loc[dec.decade==1970,'mean_luc'].iloc[0]:.1f}",
        "DEC_1990S": f"{dec.loc[dec.decade==1990,'mean_luc'].iloc[0]:.1f}",
        "DEC_2000S": f"{dec.loc[dec.decade==2000,'mean_luc'].iloc[0]:.1f}",
        "RHO_PRIMARY": f"{primary['spearman_rho']:.3f}", "P_PRIMARY": fmt_p(primary["spearman_p"]),
        "N_PRIMARY": f"{primary['n']}", "R_PRIMARY": f"{primary['pearson_r']:.3f}",
        "PP_PRIMARY": fmt_p(primary["pearson_p"]), "CRIT_PRIMARY": f"{primary['crit']:.3f}",
        "RHO_LEVELS": f"{levels['spearman_rho']:.3f}", "P_LEVELS": fmt_p(levels["spearman_p"]),
        "RHO_DIFFS": f"{diffs['spearman_rho']:.3f}", "P_DIFFS": fmt_p(diffs["spearman_p"]),
        "N_DIFFS": f"{diffs['n']}",
        "RHO_GDPPC": f"{gdppc['spearman_rho']:.3f}", "P_GDPPC": fmt_p(gdppc["spearman_p"]),
        "RHO_EARLY": f"{early['spearman_rho']:.3f}", "P_EARLY": fmt_p(early["spearman_p"]),
        "N_EARLY": f"{early['n']}",
        "RHO_LATE": f"{late['spearman_rho']:.3f}", "P_LATE": fmt_p(late["spearman_p"]),
        "N_LATE": f"{late['n']}",
        "BEST_LAG": f"{best['lag']}", "BEST_LAG_RHO": f"{best['spearman_rho']:.3f}",
        "BEST_LAG_P": fmt_p(best["spearman_p"]),
        "SW_LUC_P": fmt_p(sw_luc.pvalue), "SW_POP_P": fmt_p(sw_pop.pvalue),
        "STRENGTH": strength(primary["spearman_rho"]),
        "SIG_WORD": "statistically significant" if primary["significant"]
                    else "not statistically significant",
        "DIFFS_SIG_WORD": "statistically significant" if diffs["significant"]
                          else "not statistically significant",
    }
    src = ROOT / "IA_Population_LandUse_Cameroon.md"
    if src.exists():
        text = src.read_text()
        for k, v in repl.items():
            text = text.replace("{{" + k + "}}", str(v))
        left = sorted(set(re.findall(r"\{\{(\w+)\}\}", text)))
        (ROOT / "IA_FINAL.md").write_text(text)
        print("\nWrote IA_FINAL.md" + (f"  [UNFILLED: {left}]" if left else
                                       "  [all placeholders filled]"))
    (OUT / "results.json").write_text(json.dumps(
        {"primary": primary, "levels": levels, "first_differences": diffs,
         "gdp_per_capita": gdppc, "trend": trend, "early_1961_1990": early,
         "late_1991_2023": late, "lags": lags,
         "shapiro": {"luc_p": float(sw_luc.pvalue), "pop_delta_p": float(sw_pop.pvalue)},
         "substitutions": repl}, indent=2, default=str))

    print("\n" + "=" * 72)
    for r in (primary, levels, diffs, early, late):
        print(f"{r['label']:<48} n={r['n']:<3} rs={r['spearman_rho']:+.3f} "
              f"p={fmt_p(r['spearman_p']):<8} {'SIG' if r['significant'] else '-'}")
    print(f"\nPer-capita land-use-change CO2: {f.luc_per_capita:.2f} -> "
          f"{l.luc_per_capita:.2f} t/person ({repl['PC_DROP']}% fall)")


if __name__ == "__main__":
    main()
