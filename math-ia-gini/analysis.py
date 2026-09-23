"""Gini coefficient from World Bank PIP decile shares.

Reproducible calculations for the IB Mathematics IA:
  1. cumulative (Lorenz) points from decile shares
  2. trapezium-rule Gini (benchmark, no model)
  3. unconstrained least-squares cubic  L(x) = ax^3 + bx^2 + cx + d
  4. constrained cubic                  L(x) = ax^3 + bx^2 + (1-a-b)x
  5. constrained quadratic (sensitivity) L(x) = bx^2 + (1-b)x
  6. validity checks, exact integrals, errors against the reported Gini

Usage:
  python3 analysis.py <pip.csv> <year> <ISO3> [<ISO3> ...] [--out DIR]

The CSV can be a PIP API download (columns country_code, reporting_year,
decile1..decile10, gini, ...) or the Our World in Data PIP mirror
(columns country, year, decile1_share..decile10_share, gini, ...).
"""

import csv
import json
import os
import sys

import numpy as np

OWID_NAMES = {"ZAF": "South Africa", "NOR": "Norway"}
X = np.linspace(0, 1, 11)


def load_row(path, year, iso3):
    with open(path, newline="") as f:
        rows = list(csv.DictReader(f))
    if "country_code" in rows[0]:
        match = [r for r in rows
                 if r["country_code"] == iso3
                 and str(int(float(r["reporting_year"]))) == str(year)
                 and r.get("reporting_level", "national") == "national"]
        deciles = [f"decile{k}" for k in range(1, 11)]
    else:
        match = [r for r in rows
                 if r["country"] == OWID_NAMES[iso3]
                 and r["year"] == str(year)
                 and r["reporting_level"] == "national"]
        deciles = [f"decile{k}_share" for k in range(1, 11)]
    if not match:
        raise SystemExit(f"No national {year} row for {iso3} in {path}")
    r = match[-1]  # OWID lists the latest PPP version last
    shares = np.array([float(r[c]) for c in deciles])
    if shares.sum() > 1.5:  # OWID stores percentages
        shares = shares / 100
    meta = {k: r.get(k) for k in ("country_code", "country", "reporting_year", "year",
                                  "survey_year", "survey_acronym", "welfare_type",
                                  "distribution_type", "survey_comparability",
                                  "ppp_version") if r.get(k) is not None}
    return shares, float(r["gini"]), meta


def cubic_checks(a, b, c, d):
    """Values needed to decide whether a cubic is a valid Lorenz curve on [0, 1]."""
    L = lambda x: a * x**3 + b * x**2 + c * x + d
    dL = lambda x: 3 * a * x**2 + 2 * b * x + c
    # L' is quadratic: its minimum on [0, 1] is at an endpoint or at x = -b/(3a)
    cands = [0.0, 1.0]
    if a != 0 and 0 < -b / (3 * a) < 1:
        cands.append(-b / (3 * a))
    dmin_x = min(cands, key=dL)
    # L'' = 6ax + 2b is linear, so its minimum is at an endpoint
    d2 = {0.0: 2 * b, 1.0: 6 * a + 2 * b}
    grid = np.linspace(0, 1, 100001)
    gap = L(grid) - grid  # L(x) - x must be <= 0
    return {
        "L0": L(0.0), "L1": L(1.0),
        "Ldash_min": dL(dmin_x), "Ldash_min_at": dmin_x,
        "Ldash0": dL(0.0), "Ldash1": dL(1.0),
        "L2dash0": d2[0.0], "L2dash1": d2[1.0],
        "inflection_x": (-b / (3 * a)) if a != 0 else None,
        "L_min": float(L(grid).min()), "L_min_at": float(grid[L(grid).argmin()]),
        "max_L_minus_x": float(gap.max()), "max_L_minus_x_at": float(grid[gap.argmax()]),
        "L_neg_interval": [float(grid[L(grid) < 0].min()), float(grid[L(grid) < 0].max())]
        if (L(grid) < 0).any() else None,
    }


def r_squared(y, fitted):
    ss_res = float(((y - fitted) ** 2).sum())
    ss_tot = float(((y - y.mean()) ** 2).sum())
    return ss_res, ss_tot, 1 - ss_res / ss_tot


def analyse(shares, gini_official):
    L = np.concatenate([[0.0], np.cumsum(shares)])
    out = {"shares": shares.tolist(), "share_sum": float(shares.sum()),
           "L": L.tolist(), "x": X.tolist(), "gini_official": gini_official}

    # trapezium rule, h = 0.1
    area_T = float(sum(0.1 * (L[k - 1] + L[k]) / 2 for k in range(1, 11)))
    out["trap"] = {"area": area_T, "gini": 1 - 2 * area_T,
                   "sum_interior_L": float(L[1:10].sum())}

    # unconstrained cubic through normal equations (X^T X) beta = X^T y
    V = np.column_stack([X**3, X**2, X, np.ones_like(X)])
    XtX, Xty = V.T @ V, V.T @ L
    a, b, c, d = np.linalg.solve(XtX, Xty)
    fit = V @ np.array([a, b, c, d])
    ss_res, ss_tot, r2 = r_squared(L, fit)
    area = a / 4 + b / 3 + c / 2 + d
    out["cubic"] = {"a": a, "b": b, "c": c, "d": d, "XtX": XtX.tolist(), "Xty": Xty.tolist(),
                    "fitted": fit.tolist(), "residuals": (L - fit).tolist(),
                    "ss_res": ss_res, "ss_tot": ss_tot, "r2": r2,
                    "area": area, "gini": 1 - 2 * area, "checks": cubic_checks(a, b, c, d)}

    # constrained cubic: L - x = a(x^3 - x) + b(x^2 - x)
    z, u, v = L - X, X**3 - X, X**2 - X
    M = np.array([[u @ u, u @ v], [u @ v, v @ v]])
    rhs = np.array([u @ z, v @ z])
    ca, cb = np.linalg.solve(M, rhs)
    cc = 1 - ca - cb
    cfit = ca * X**3 + cb * X**2 + cc * X
    css_res, css_tot, cr2 = r_squared(L, cfit)
    carea = ca / 4 + cb / 3 + cc / 2
    out["ccubic"] = {"a": ca, "b": cb, "c": cc, "M": M.tolist(), "rhs": rhs.tolist(),
                     "fitted": cfit.tolist(), "residuals": (L - cfit).tolist(),
                     "ss_res": css_res, "ss_tot": css_tot, "r2": cr2,
                     "area": carea, "gini": 1 - 2 * carea, "gini_short": ca / 2 + cb / 3,
                     "checks": cubic_checks(ca, cb, cc, 0.0)}

    # constrained quadratic: L - x = b(x^2 - x)
    qb = float(v @ z / (v @ v))
    qfit = qb * X**2 + (1 - qb) * X
    qss_res, _, qr2 = r_squared(L, qfit)
    out["cquad"] = {"b": qb, "c": 1 - qb, "sum_vz": float(v @ z), "sum_vv": float(v @ v),
                    "ss_res": qss_res, "r2": qr2, "gini": qb / 3,
                    "residuals": (L - qfit).tolist()}

    # unconstrained quadratic: with symmetric x-values its Gini should equal the
    # unconstrained cubic's, because the odd part of the fit integrates to zero
    Q = np.column_stack([X**2, X, np.ones_like(X)])
    qa, qb2, qc = np.linalg.solve(Q.T @ Q, Q.T @ L)
    qarea = qa / 3 + qb2 / 2 + qc
    out["quad"] = {"a": qa, "b": qb2, "c": qc, "r2": r_squared(L, Q @ np.array([qa, qb2, qc]))[2],
                   "area": qarea, "gini": 1 - 2 * qarea}

    for key in ("trap", "cubic", "ccubic", "cquad", "quad"):
        g = out[key]["gini"]
        out[key]["abs_err"] = abs(g - gini_official)
        out[key]["signed_err"] = g - gini_official
        out[key]["pct_err"] = abs(g - gini_official) / gini_official * 100
    return out


def plot(results, outdir):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    xs = np.linspace(0, 1, 400)
    for iso, res in results.items():
        fig, ax = plt.subplots(figsize=(6, 6))
        ax.plot([0, 1], [0, 1], color="0.5", lw=1, ls="--", label="Line of equality $y = x$")
        cu, cc = res["cubic"], res["ccubic"]
        ax.plot(xs, cu["a"] * xs**3 + cu["b"] * xs**2 + cu["c"] * xs + cu["d"],
                color="#1f77b4", lw=1.6, label="Unconstrained cubic")
        ax.plot(xs, cc["a"] * xs**3 + cc["b"] * xs**2 + cc["c"] * xs,
                color="#d62728", lw=1.6, ls="-.", label="Constrained cubic")
        ax.scatter(res["x"], res["L"], color="black", zorder=5, s=22, label="PIP decile points")
        ax.set_xlim(0, 1)
        ax.set_ylim(min(-0.05, min(cu["fitted"]) - 0.02), 1.02)
        ax.set_xlabel("Cumulative population share, $x$")
        ax.set_ylabel("Cumulative share of welfare, $L(x)$")
        ax.set_title(f"Lorenz curve models: {res['name']}")
        ax.grid(alpha=0.3)
        ax.legend(loc="upper left", fontsize=9)
        fig.tight_layout()
        fig.savefig(os.path.join(outdir, f"lorenz_{iso}.png"), dpi=200)
        plt.close(fig)

    fig, axes = plt.subplots(1, len(results), figsize=(5 * len(results), 4), sharey=True)
    axes = np.atleast_1d(axes)
    for ax, (iso, res) in zip(axes, results.items()):
        ax.axhline(0, color="0.5", lw=1)
        ax.plot(res["x"], res["cubic"]["residuals"], "o-", color="#1f77b4", label="Unconstrained cubic")
        ax.plot(res["x"], res["ccubic"]["residuals"], "s--", color="#d62728", label="Constrained cubic")
        ax.set_title(f"Residuals: {res['name']}")
        ax.set_xlabel("Cumulative population share, $x$")
        ax.grid(alpha=0.3)
    axes[0].set_ylabel("Residual $L_k - \\hat{L}(x_k)$")
    axes[0].legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, "residuals.png"), dpi=200)
    plt.close(fig)


def main(argv):
    outdir = "."
    if "--out" in argv:
        i = argv.index("--out")
        outdir = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    path, year, isos = argv[0], argv[1], argv[2:]
    os.makedirs(outdir, exist_ok=True)
    results = {}
    for iso in isos:
        shares, gini, meta = load_row(path, year, iso)
        res = analyse(shares, gini)
        res["meta"] = meta
        res["name"] = OWID_NAMES.get(iso, iso)
        results[iso] = res
    with open(os.path.join(outdir, "results.json"), "w") as f:
        json.dump(results, f, indent=2, default=float)
    plot(results, outdir)
    for iso, r in results.items():
        print(f"{iso}: official {r['gini_official']:.4f} | trap {r['trap']['gini']:.4f} | "
              f"cubic {r['cubic']['gini']:.4f} (R2 {r['cubic']['r2']:.5f}) | "
              f"constrained {r['ccubic']['gini']:.4f} | quad {r['cquad']['gini']:.4f}")


if __name__ == "__main__":
    main(sys.argv[1:])
