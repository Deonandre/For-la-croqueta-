#!/usr/bin/env python3
"""
ESS Individual Investigation -- reproducible analysis pipeline.

Cocoa cultivation and annual tree-cover loss in Cameroon, 2001-2023.

Inputs  (place in ../data/):
    faostat_cocoa_cameroon.csv      FAOSTAT QCL: Cameroon, Cocoa beans (661),
                                    Area harvested (5312) + Production (5510),
                                    2001-2023, flags shown.
    gfw_treecoverloss_cameroon.csv  Global Forest Watch: Cameroon annual
                                    tree-cover loss (ha), 30% canopy threshold.

Outputs (written to ../output/):
    table1_merged.csv / .md     table2_summary.md     table3_correlations.md
    fig1_timeseries.png         fig1b_indexed.png
    fig2_scatter.png            fig3_lag.png
    appendix_b_spearman.md      results.json
    ../IA_FINAL.md              the report with every {{placeholder}} substituted

This script invents nothing. Any year absent from a source file stays absent and
is reported as missing.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DATA = ROOT / "data"
OUT = ROOT / "output"
OUT.mkdir(exist_ok=True)

YEAR_MIN, YEAR_MAX = 2001, 2023
CANOPY_THRESHOLD = 30          # %  -- must match what was downloaded
ALPHA = 0.05

# Validated colourblind-safe pair (see project README for validator output)
C_COCOA = "#1f6fb2"   # blue
C_LOSS = "#d95f02"    # orange
C_INK = "#0b0b0b"
C_MUTED = "#52514e"
C_GRID = "#d9d8d4"

FAO_FILE = DATA / "faostat_cocoa_cameroon.csv"
GFW_FILE = DATA / "gfw_treecoverloss_cameroon.csv"


# ----------------------------------------------------------------- utilities
def die(msg: str) -> None:
    print(f"\nERROR: {msg}\n", file=sys.stderr)
    sys.exit(1)


def md_table(df: pd.DataFrame, index: bool = False, floatfmt: str = ",.2f") -> str:
    """Markdown table with no third-party dependency (pandas needs `tabulate`)."""
    d = df.reset_index() if index else df

    def cell(v) -> str:
        if v is None or (isinstance(v, float) and pd.isna(v)):
            return ""
        if isinstance(v, (int, np.integer)):
            return f"{v:,}"
        if isinstance(v, (float, np.floating)):
            return format(v, floatfmt)
        return str(v)

    head = [str(c) for c in d.columns]
    body = [[cell(v) for v in row] for row in d.itertuples(index=False)]
    lines = ["| " + " | ".join(head) + " |",
             "|" + "|".join("---" for _ in head) + "|"]
    lines += ["| " + " | ".join(r) + " |" for r in body]
    return "\n".join(lines)


def find_col(df: pd.DataFrame, *needles: str) -> str | None:
    """Column whose name contains all needles (case-insensitive).

    Prefers an exact match on the first needle, then the shortest matching name.
    This matters for FAOSTAT, which ships both 'Element' (text labels) and
    'Element Code' (numeric) -- a naive first-match picks the wrong one.
    """
    hits = [c for c in df.columns
            if all(n.lower() in str(c).lower() for n in needles)]
    if not hits:
        return None
    target = needles[0].strip().lower()
    for c in hits:
        if str(c).strip().lower() == target:
            return c
    return min(hits, key=lambda c: len(str(c)))


def read_csv_any(path: Path) -> pd.DataFrame:
    for enc in ("utf-8-sig", "utf-8", "latin-1"):
        for sep in (",", ";", "\t"):
            try:
                df = pd.read_csv(path, encoding=enc, sep=sep)
                if df.shape[1] > 1:
                    return df
            except Exception:
                continue
    die(f"could not parse {path.name} as CSV")


# ------------------------------------------------------------------- loaders
def load_faostat(path: Path) -> pd.DataFrame:
    df = read_csv_any(path)
    c_el = find_col(df, "element")
    c_yr = find_col(df, "year")
    c_val = find_col(df, "value")
    c_flag = find_col(df, "flag")
    c_unit = find_col(df, "unit")
    if not all([c_el, c_yr, c_val]):
        die(
            f"{path.name}: expected FAOSTAT columns Element / Year / Value.\n"
            f"       found: {list(df.columns)}\n"
            "       Re-download from https://www.fao.org/faostat/en/#data/QCL "
            "with 'Show Flags' and 'Show Unit' ticked."
        )
    df[c_yr] = pd.to_numeric(df[c_yr].astype(str).str.extract(r"(\d{4})")[0], errors="coerce")
    df[c_val] = pd.to_numeric(
        df[c_val].astype(str).str.replace(r"[^0-9eE\.\-+]", "", regex=True), errors="coerce"
    )

    def pick(keyword: str, label: str) -> pd.DataFrame:
        m = df[df[c_el].astype(str).str.contains(keyword, case=False, na=False)]
        if m.empty:
            return pd.DataFrame(columns=["year", label])
        unit = str(m[c_unit].iloc[0]) if c_unit else "?"
        print(f"  FAOSTAT {label:<12} element='{m[c_el].iloc[0]}'  unit={unit}  rows={len(m)}")
        cols = {c_yr: "year", c_val: label}
        if c_flag:
            cols[c_flag] = f"{label}_flag"
        return m[list(cols)].rename(columns=cols)

    area = pick("area harvested", "area_ha")
    prod = pick("production", "production_t")
    if area.empty:
        die(f"{path.name}: no 'Area harvested' rows found -- this is the key variable.")
    out = area.merge(prod, on="year", how="outer") if not prod.empty else area
    return out.sort_values("year").reset_index(drop=True)


def load_gfw(path: Path) -> pd.DataFrame:
    df = read_csv_any(path)
    c_thr = find_col(df, "threshold")
    if c_thr is not None:
        thr = pd.to_numeric(df[c_thr], errors="coerce")
        if (thr == CANOPY_THRESHOLD).any():
            df = df[thr == CANOPY_THRESHOLD]
            print(f"  GFW filtered to canopy threshold = {CANOPY_THRESHOLD}%")
        else:
            print(f"  WARNING: threshold {CANOPY_THRESHOLD}% not in file; "
                  f"present: {sorted(thr.dropna().unique())}")
    c_yr = find_col(df, "year")
    c_val = (
        find_col(df, "loss", "ha")
        or find_col(df, "tc_loss")
        or find_col(df, "loss")
        or find_col(df, "area", "ha")
    )
    if not c_yr or not c_val:
        die(
            f"{path.name}: expected a year column and a tree-cover-loss column.\n"
            f"       found: {list(df.columns)}\n"
            "       Re-download the 'Annual tree cover loss' widget CSV from "
            "https://www.globalforestwatch.org/dashboards/country/CMR/"
        )
    print(f"  GFW year col='{c_yr}'  loss col='{c_val}'  rows={len(df)}")
    out = pd.DataFrame({
        "year": pd.to_numeric(df[c_yr].astype(str).str.extract(r"(\d{4})")[0], errors="coerce"),
        "loss_ha": pd.to_numeric(
            df[c_val].astype(str).str.replace(r"[^0-9eE\.\-+]", "", regex=True), errors="coerce"
        ),
    }).dropna(subset=["year"])
    out = out.groupby("year", as_index=False)["loss_ha"].sum()
    return out.sort_values("year").reset_index(drop=True)


# ------------------------------------------------------------------ analysis
def rho_critical(n: int, alpha: float = ALPHA) -> float:
    """Critical |r| for a two-tailed test at given alpha, via the t approximation."""
    from scipy import stats
    if n < 4:
        return float("nan")
    tc = stats.t.ppf(1 - alpha / 2, n - 2)
    return float(tc / np.sqrt(tc**2 + n - 2))


def correlate(x: pd.Series, y: pd.Series, label: str) -> dict:
    from scipy import stats
    d = pd.DataFrame({"x": x, "y": y}).dropna()
    n = len(d)
    if n < 4:
        return {"label": label, "n": n, "note": "too few paired observations"}
    rs, ps = stats.spearmanr(d.x, d.y)
    rp, pp = stats.pearsonr(d.x, d.y)
    res = {
        "label": label, "n": n,
        "spearman_rho": round(float(rs), 3), "spearman_p": float(ps),
        "pearson_r": round(float(rp), 3), "pearson_p": float(pp),
        "crit": round(rho_critical(n), 3),
        "significant": bool(ps < ALPHA),
    }
    if n >= 3:
        res["shapiro_x_p"] = float(stats.shapiro(d.x).pvalue)
        res["shapiro_y_p"] = float(stats.shapiro(d.y).pvalue)
    return res


def strength(r: float) -> str:
    a = abs(r)
    if a < 0.20: return "negligible"
    if a < 0.40: return "weak"
    if a < 0.60: return "moderate"
    if a < 0.80: return "strong"
    return "very strong"


def fmt_p(p: float) -> str:
    return "< 0.001" if p < 0.001 else f"{p:.3f}"


# ------------------------------------------------------------------- figures
def figures(df: pd.DataFrame, lags: list[dict], primary: dict) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.patheffects as pe
    import matplotlib.pyplot as plt

    plt.rcParams.update({
        "font.size": 9, "axes.titlesize": 10, "axes.labelsize": 9,
        "axes.edgecolor": C_MUTED, "axes.labelcolor": C_INK,
        "text.color": C_INK, "xtick.color": C_MUTED, "ytick.color": C_MUTED,
        "axes.grid": True, "grid.color": C_GRID, "grid.linewidth": 0.6,
        "axes.spines.top": False, "axes.spines.right": False,
        "figure.facecolor": "white", "axes.facecolor": "white",
    })
    thousands = matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}")

    # --- Figure 1: two stacked panels sharing the year axis (NOT a dual axis) ---
    fig, (a1, a2) = plt.subplots(2, 1, figsize=(7.0, 5.4), sharex=True)
    a1.plot(df.year, df.area_ha, color=C_COCOA, lw=2, marker="o", ms=4)
    a1.set_title("Cocoa harvested area, Cameroon", loc="left", color=C_INK)
    a1.set_ylabel("hectares")
    a2.plot(df.year, df.loss_ha, color=C_LOSS, lw=2, marker="o", ms=4)
    a2.set_title("Annual tree-cover loss, Cameroon "
                 f"({CANOPY_THRESHOLD}% canopy threshold)", loc="left", color=C_INK)
    a2.set_ylabel("hectares per year")
    a2.set_xlabel("Year")
    for ax in (a1, a2):
        ax.yaxis.set_major_formatter(thousands)
        if (df.year >= 2011).any():
            ax.axvline(2010.5, color=C_MUTED, lw=1, ls=(0, (4, 3)), alpha=0.8)
    a2.annotate("GFW algorithm change \u2192", xy=(2010.5, a2.get_ylim()[1]),
                xytext=(-5, -9), textcoords="offset points", ha="right",
                fontsize=7.5, color=C_MUTED, va="top",
                path_effects=[pe.withStroke(linewidth=2.5, foreground="white")])
    fig.suptitle("Figure 1  Both variables plotted on their own scales",
                 x=0.012, ha="left", fontsize=10.5, color=C_INK)
    fig.tight_layout(rect=(0, 0, 1, 0.96))
    fig.savefig(OUT / "fig1_timeseries.png", dpi=200)
    plt.close(fig)

    # --- Figure 1b: indexed to first available year = 100, single shared axis ---
    d = df.dropna(subset=["area_ha", "loss_ha"])
    if len(d) > 2:
        base_a, base_l = d.area_ha.iloc[0], d.loss_ha.iloc[0]
        fig, ax = plt.subplots(figsize=(7.0, 3.6))
        ax.axhline(100, color=C_GRID, lw=1)
        ax.plot(d.year, d.area_ha / base_a * 100, color=C_COCOA, lw=2,
                marker="o", ms=4, label="Cocoa harvested area")
        ax.plot(d.year, d.loss_ha / base_l * 100, color=C_LOSS, lw=2,
                marker="o", ms=4, label="Annual tree-cover loss")
        for s, col, lab in ((d.area_ha / base_a * 100, C_COCOA, "Cocoa area"),
                            (d.loss_ha / base_l * 100, C_LOSS, "Tree-cover loss")):
            ax.annotate(lab, xy=(d.year.iloc[-1], s.iloc[-1]), xytext=(5, 0),
                        textcoords="offset points", color=col, fontsize=8,
                        va="center", fontweight="bold")
        ax.set_title(f"Figure 1b  Indexed comparison ({int(d.year.iloc[0])} = 100)",
                     loc="left", color=C_INK)
        ax.set_ylabel(f"index ({int(d.year.iloc[0])} = 100)")
        ax.set_xlabel("Year")
        ax.legend(frameon=False, loc="upper left", fontsize=8)
        ax.set_xlim(d.year.min() - 0.5, d.year.max() + 2.6)
        fig.tight_layout()
        fig.savefig(OUT / "fig1b_indexed.png", dpi=200)
        plt.close(fig)

    # --- Figure 2: scatter, delta cocoa area vs tree-cover loss ---
    s = df.dropna(subset=["area_delta", "loss_ha"])
    if len(s) > 2:
        fig, ax = plt.subplots(figsize=(6.0, 4.6))
        ax.axvline(0, color=C_GRID, lw=1)
        ax.scatter(s.area_delta, s.loss_ha, s=42, color=C_COCOA,
                   edgecolor="white", linewidth=1.2, zorder=3)
        m, b = np.polyfit(s.area_delta, s.loss_ha, 1)
        xs = np.linspace(s.area_delta.min(), s.area_delta.max(), 50)
        ax.plot(xs, m * xs + b, color=C_LOSS, lw=2, zorder=2)
        for _, r in s.iterrows():   # label extremes only, never every point
            if r.area_delta in (s.area_delta.min(), s.area_delta.max()) or \
               r.loss_ha in (s.loss_ha.min(), s.loss_ha.max()):
                ax.annotate(f"{int(r.year)}", xy=(r.area_delta, r.loss_ha),
                            xytext=(7, 5), textcoords="offset points",
                            fontsize=7.5, color=C_MUTED, zorder=5,
                            path_effects=[pe.withStroke(linewidth=2.5, foreground="white")])
        ax.set_title("Figure 2  Tree-cover loss against annual change in cocoa area",
                     loc="left", color=C_INK)
        ax.set_xlabel("Annual change in cocoa harvested area (ha yr$^{-1}$)")
        ax.set_ylabel("Tree-cover loss (ha yr$^{-1}$)")
        ax.xaxis.set_major_formatter(thousands)
        ax.yaxis.set_major_formatter(thousands)
        txt = (f"Spearman $r_s$ = {primary['spearman_rho']}  "
               f"(p = {fmt_p(primary['spearman_p'])}, n = {primary['n']})\n"
               f"Pearson $r$ = {primary['pearson_r']}   "
               f"critical |r| = {primary['crit']}")
        ax.text(0.03, 0.97, txt, transform=ax.transAxes, va="top", ha="left",
                fontsize=8, color=C_INK,
                bbox=dict(boxstyle="round,pad=0.45", fc="white",
                          ec=C_GRID, lw=0.8))
        fig.tight_layout()
        fig.savefig(OUT / "fig2_scatter.png", dpi=200)
        plt.close(fig)

    # --- Figure 3: lag profile ---
    if lags:
        fig, ax = plt.subplots(figsize=(6.0, 3.6))
        L = [l["lag"] for l in lags]
        R = [l["spearman_rho"] for l in lags]
        crit = lags[0].get("crit", float("nan"))
        ax.axhline(0, color=C_MUTED, lw=1)
        for c, ls in ((crit, (0, (5, 3))), (-crit, (0, (5, 3)))):
            ax.axhline(c, color=C_LOSS, lw=1.2, ls=ls)
        ax.text(max(L), crit, f"  significance threshold (α = {ALPHA})",
                color=C_LOSS, fontsize=7.5, va="bottom", ha="right")
        ax.plot(L, R, color=C_COCOA, lw=2, marker="o", ms=7,
                markeredgecolor="white", markeredgewidth=1.4)
        best = max(lags, key=lambda d: abs(d["spearman_rho"]))
        ax.annotate(f"peak: lag {best['lag']} yr, $r_s$ = {best['spearman_rho']}",
                    xy=(best["lag"], best["spearman_rho"]), xytext=(0, 12),
                    textcoords="offset points", ha="center", fontsize=8,
                    color=C_INK, fontweight="bold",
                    path_effects=[pe.withStroke(linewidth=2.5, foreground="white")])
        ax.set_title("Figure 3  Lagged correlation: cocoa expansion leading tree-cover loss",
                     loc="left", color=C_INK)
        ax.set_xlabel("Lag applied to cocoa expansion (years)")
        ax.set_ylabel("Spearman $r_s$")
        ax.set_xticks(L)
        ax.set_ylim(-1.05, 1.05)
        fig.tight_layout()
        fig.savefig(OUT / "fig3_lag.png", dpi=200)
        plt.close(fig)
    print(f"  figures written to {OUT}")


# ---------------------------------------------------------------------- main
def main() -> None:
    print("\nESS IA analysis -- cocoa and tree-cover loss, Cameroon\n" + "=" * 58)

    missing = [f.name for f in (FAO_FILE, GFW_FILE) if not f.exists()]
    if missing:
        print("\nMissing input file(s): " + ", ".join(missing))
        print(f"\nExpected in: {DATA}\n")
        print("Download instructions are in DATA_VERIFICATION_REPORT.md section 3.")
        print("Nothing has been estimated or generated in their place.\n")
        sys.exit(2)

    print("\nLoading sources:")
    fao = load_faostat(FAO_FILE)
    gfw = load_gfw(GFW_FILE)

    df = fao.merge(gfw, on="year", how="outer").sort_values("year")
    df = df[(df.year >= YEAR_MIN) & (df.year <= YEAR_MAX)].reset_index(drop=True)

    gaps = []
    for col, name in (("area_ha", "cocoa harvested area"), ("loss_ha", "tree-cover loss")):
        if col in df:
            miss = sorted(set(range(YEAR_MIN, YEAR_MAX + 1)) - set(df.loc[df[col].notna(), "year"]))
            if miss:
                gaps.append(f"{name}: missing {miss}")
    print("\nCompleteness:")
    print("  " + ("; ".join(gaps) if gaps else "both series complete for 2001-2023"))

    df["area_delta"] = df["area_ha"].diff()
    df["area_pct"] = df["area_ha"].pct_change() * 100
    df["loss_pct"] = df["loss_ha"].pct_change() * 100

    # ---- correlations
    primary = correlate(df.area_delta, df.loss_ha, "Δ cocoa area vs tree-cover loss")
    levels = correlate(df.area_ha, df.loss_ha, "cocoa area (levels) vs tree-cover loss")
    diffs = correlate(df.area_delta, df.loss_ha.diff(), "Δ cocoa area vs Δ tree-cover loss")
    recent = df[df.year >= 2011]
    sub = correlate(recent.area_delta, recent.loss_ha, "Δ cocoa area vs loss, 2011-2023")

    lags = []
    for k in range(6):
        r = correlate(df.area_delta.shift(k), df.loss_ha, f"lag {k}")
        if "spearman_rho" in r:
            r["lag"] = k
            lags.append(r)
    best = max(lags, key=lambda d: abs(d["spearman_rho"])) if lags else {}

    # ---- flags
    flag_summary = "no flag column was present in the download"
    fc = find_col(df, "area_ha_flag")
    if fc:
        vc = df[fc].dropna().astype(str).value_counts()
        tot = int(vc.sum())
        nonoff = int(sum(v for k, v in vc.items() if k.strip().upper() != "A"))
        flag_summary = (f"{nonoff} of {tot}" if tot else "an unknown number of")
        print(f"\nFAOSTAT flags: {dict(vc)}  -> {nonoff}/{tot} non-official")

    # ---- tables
    df.to_csv(OUT / "table1_merged.csv", index=False)
    (OUT / "table1_merged.md").write_text(md_table(df, floatfmt=",.0f"))

    summary = df[["area_ha", "production_t", "loss_ha", "area_delta"]].describe().T
    (OUT / "table2_summary.md").write_text(
        "**Table 2.** Summary statistics, 2001-2023.\n\n"
        + md_table(summary, index=True, floatfmt=",.1f")
        + "\n\n**Sub-period mean annual tree-cover loss (ha):**\n\n"
        + f"- 2001-2010: {df[df.year <= 2010].loss_ha.mean():,.0f}\n"
        + f"- 2011-2023: {df[df.year >= 2011].loss_ha.mean():,.0f}\n"
    )

    rows = [primary, levels, diffs, sub] + lags
    t3 = pd.DataFrame([{
        "Test": r["label"], "n": r["n"],
        "Spearman rs": r.get("spearman_rho"), "p (rs)": fmt_p(r["spearman_p"]) if "spearman_p" in r else "-",
        "Pearson r": r.get("pearson_r"), "p (r)": fmt_p(r["pearson_p"]) if "pearson_p" in r else "-",
        "critical |r|": r.get("crit"),
        "significant at 0.05": "yes" if r.get("significant") else "no",
    } for r in rows])
    (OUT / "table3_correlations.md").write_text(
        "**Table 3.** Correlation results.\n\n" + md_table(t3, floatfmt=",.3f"))

    # ---- Appendix B worked Spearman
    s = pd.DataFrame({"x": df.area_delta, "y": df.loss_ha, "year": df.year}).dropna()
    s["rank_x"] = s.x.rank(); s["rank_y"] = s.y.rank()
    s["d"] = s.rank_x - s.rank_y; s["d2"] = s.d**2
    n = len(s); sd2 = s.d2.sum()
    (OUT / "appendix_b_spearman.md").write_text(
        "**Appendix B -- worked Spearman calculation (primary test)**\n\n"
        + md_table(s[["year", "x", "y", "rank_x", "rank_y", "d", "d2"]], floatfmt=",.1f")
        + f"\n\nn = {n}   Σd² = {sd2:,.1f}\n\n"
        + f"rs = 1 − (6 × {sd2:,.1f}) / ({n} × ({n}² − 1)) "
        + f"= {1 - (6*sd2)/(n*(n**2-1)):.3f}\n\n"
        + f"scipy tie-corrected value: {primary['spearman_rho']}  "
        + f"(the hand formula is exact only without ties)\n\n"
        + f"Critical |r| at α = {ALPHA}, n = {n}: {primary['crit']}\n"
    )

    figures(df, lags, primary)

    # ---- fill the report placeholders
    first = df.dropna(subset=["area_ha"]).iloc[0]
    last = df.dropna(subset=["area_ha"]).iloc[-1]
    lf = df.dropna(subset=["loss_ha"]).iloc[0]
    ll = df.dropna(subset=["loss_ha"]).iloc[-1]
    sw = strength(primary["spearman_rho"])
    sig = primary["significant"]

    repl = {
        "AREA_2001": f"{first.area_ha:,.0f}", "AREA_2023": f"{last.area_ha:,.0f}",
        "AREA_PCT": f"{(last.area_ha/first.area_ha-1)*100:+.1f}",
        "LOSS_2001": f"{lf.loss_ha:,.0f}", "LOSS_2023": f"{ll.loss_ha:,.0f}",
        "LOSS_PCT": f"{(ll.loss_ha/lf.loss_ha-1)*100:+.1f}",
        "LOSS_MEAN_0110": f"{df[df.year<=2010].loss_ha.mean():,.0f}",
        "LOSS_MEAN_1123": f"{df[df.year>=2011].loss_ha.mean():,.0f}",
        "RHO_DIFF": f"{primary['spearman_rho']}", "P_DIFF": fmt_p(primary["spearman_p"]),
        "N_DIFF": f"{primary['n']}", "R_DIFF": f"{primary['pearson_r']}",
        "RHO_LEVEL": f"{levels['spearman_rho']}", "P_LEVEL": fmt_p(levels["spearman_p"]),
        "BEST_LAG": f"{best.get('lag','-')}",
        "BEST_LAG_RHO": f"{best.get('spearman_rho','-')}",
        "BEST_LAG_P": fmt_p(best["spearman_p"]) if best else "-",
        "STRENGTH_WORD": sw,
        "SIG_PHRASE": "which is statistically significant" if sig
                      else "which is not statistically significant",
        "LEVEL_DESCRIPTOR": strength(levels["spearman_rho"]),
        "SIGNAL_DESCRIPTOR": "detectable but modest" if sig else "not separable from other drivers",
        "FLAG_SUMMARY": flag_summary,
        "VERDICT_SENTENCE": (
            f"Taken together the tests indicate a {sw} association: the primary "
            f"first-differenced test is "
            f"{'significant' if sig else 'not significant'} at α = {ALPHA} "
            f"(rs = {primary['spearman_rho']}, p = {fmt_p(primary['spearman_p'])}, "
            f"n = {primary['n']}), and the 2011–2023 sub-period gives "
            f"rs = {sub.get('spearman_rho','n/a')}."
        ),
    }

    src = ROOT / "IA_Cocoa_Deforestation_Cameroon.md"
    text = src.read_text()
    for k, v in repl.items():
        text = text.replace("{{" + k + "}}", str(v))
    left = re.findall(r"\{\{(\w+)\}\}", text)
    (ROOT / "IA_FINAL.md").write_text(text)

    (OUT / "results.json").write_text(json.dumps(
        {"primary": primary, "levels": levels, "diffs": diffs,
         "subperiod_2011_2023": sub, "lags": lags, "gaps": gaps}, indent=2, default=str))

    print("\n" + "=" * 58)
    print(f"PRIMARY TEST  rs = {primary['spearman_rho']}  p = {fmt_p(primary['spearman_p'])}"
          f"  n = {primary['n']}  critical |r| = {primary['crit']}")
    print(f"              -> {sw}, {'SIGNIFICANT' if sig else 'NOT significant'} at α = {ALPHA}")
    print(f"LEVELS (confounded)  rs = {levels['spearman_rho']}  p = {fmt_p(levels['spearman_p'])}")
    print(f"BEST LAG      {best.get('lag')} yr  rs = {best.get('spearman_rho')}")
    print(f"\nWrote IA_FINAL.md" + (f"  [UNFILLED: {set(left)}]" if left else "  [all placeholders filled]"))
    print("Run: python3 scripts/wordcount.py IA_FINAL.md\n")


if __name__ == "__main__":
    main()
