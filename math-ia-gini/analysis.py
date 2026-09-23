"""Gini coefficient from World Bank PIP decile shares (IB Maths AA SL IA).

Every number in the IA comes from this script, using methods an AA SL student
can do by hand or on a GDC:
  1. cumulative (Lorenz) points from the decile shares
  2. trapezium-rule Gini (benchmark, no model)
  3. unconstrained cubic L(x) = ax^3 + bx^2 + cx + d (GDC CubicReg equivalent)
  4. constrained cubic with L(0) = 0 and L(1) = 1, written as
         L(x) = x + beta*v(x) + alpha*w(x),
         v(x) = x^2 - x,  w(x) = (x - 1/2)(x^2 - x),
     fitted by two one-variable least-squares problems because sum(v_k w_k) = 0
  5. constrained quadratic L(x) = x + beta*v(x) (same beta, so same Gini)
  6. validity checks with L' and L'', exact integrals, errors vs reported Gini
The one-variable results are cross-checked against a general least-squares
solver, so the hand method is verified rather than assumed.

Usage:
  python3 analysis.py <pip.csv> <year> <ISO3> [<ISO3> ...] [--out DIR]
  python3 analysis.py --selftest
"""

import csv
import json
import os
import sys

import numpy as np

NAMES = {"ZAF": "South Africa", "NOR": "Norway"}
X = np.round(np.linspace(0, 1, 11), 10)


def load_row(path, year, iso3):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    match = [r for r in rows
             if r.get("country_code") == iso3
             and str(int(float(r["reporting_year"]))) == str(year)
             and r.get("reporting_level", "national") == "national"]
    if not match:
        raise SystemExit(f"No national {year} row for {iso3} in {path}")
    if len(match) > 1:
        raise SystemExit(f"{len(match)} national {year} rows for {iso3}: check the file")
    r = match[0]
    shares = np.array([float(r[f"decile{k}"]) for k in range(1, 11)])
    meta = {k: r[k] for k in ("country_name", "country_code", "reporting_year", "survey_year",
                              "survey_acronym", "survey_coverage", "welfare_type",
                              "distribution_type", "survey_comparability", "comparable_spell",
                              "is_interpolated", "estimation_type") if k in r}
    return shares, float(r["gini"]), meta


def cubic_checks(a, b, c, d):
    """Properties a Lorenz curve must have on [0, 1]."""
    L = lambda x: a * x**3 + b * x**2 + c * x + d
    dL = lambda x: 3 * a * x**2 + 2 * b * x + c
    # L'(x) is a quadratic, so its least value on [0, 1] is at an end or at its vertex
    cands = [0.0, 1.0]
    if a != 0 and 0 < -b / (3 * a) < 1:
        cands.append(-b / (3 * a))
    xmin = min(cands, key=dL)
    # where L'(x) < 0 on [0, 1] (the curve decreases there): split [0, 1] at the
    # roots of L'(x) = 0 (quadratic formula) and test the sign on each piece
    roots = []
    if a != 0:
        disc = (2 * b) ** 2 - 4 * (3 * a) * c
        if disc > 0:
            roots = [(-2 * b - disc**0.5) / (6 * a), (-2 * b + disc**0.5) / (6 * a)]
    elif b != 0:
        roots = [-c / (2 * b)]
    cuts = [0.0] + sorted(r for r in roots if 0 < r < 1) + [1.0]
    dec = [[lo, hi] for lo, hi in zip(cuts, cuts[1:]) if dL((lo + hi) / 2) < 0] or None
    grid = np.linspace(0, 1, 100001)
    Lg = L(grid)
    neg = grid[Lg < 0]
    return {
        "L0": d, "L1": a + b + c + d,
        "dL0": dL(0.0), "dL1": dL(1.0), "dL_min": dL(xmin), "dL_min_at": xmin,
        "decreasing_on": dec,
        "d2L0": 2 * b, "d2L1": 6 * a + 2 * b,
        "inflection_x": (-b / (3 * a)) if a != 0 else None,
        "negative_on": [float(neg.min()), float(neg.max())] if neg.size else None,
        "max_L_minus_x": float((Lg - grid).max()),
    }


def r_squared(y, fitted):
    ss_res = float(((y - fitted) ** 2).sum())
    ss_tot = float(((y - y.mean()) ** 2).sum())
    return ss_res, ss_tot, 1 - ss_res / ss_tot


def errors(g, official):
    return {"signed_err": g - official, "abs_err": abs(g - official),
            "pct_err": abs(g - official) / official * 100}


def analyse(shares, gini_official):
    L = np.concatenate([[0.0], np.cumsum(shares)])
    out = {"x": X.tolist(), "shares": shares.tolist(), "share_sum": float(shares.sum()),
           "L": L.tolist(), "gini_official": gini_official}

    # 1. trapezium rule with h = 0.1
    area_T = 0.1 * ((L[0] + L[10]) / 2 + L[1:10].sum())
    out["trap"] = {"sum_interior_L": float(L[1:10].sum()), "area": float(area_T),
                   "gini": float(1 - 2 * area_T), **errors(1 - 2 * area_T, gini_official)}
    out["trap"]["lower_bound_holds"] = out["trap"]["gini"] <= gini_official

    # 2. unconstrained cubic (what CubicReg on a GDC returns) and quadratic
    fits = {}
    for key, deg in (("cubic", 3), ("quad", 2)):
        coef = np.polyfit(X, L, deg)                       # highest power first
        fitted = np.polyval(coef, X)
        anti = np.polyint(coef)
        area = float(np.polyval(anti, 1) - np.polyval(anti, 0))
        ss_res, ss_tot, r2 = r_squared(L, fitted)
        fits[key] = {"coef": coef.tolist(), "fitted": fitted.tolist(),
                     "residuals": (L - fitted).tolist(), "ss_res": ss_res, "ss_tot": ss_tot,
                     "r2": r2, "area": area, "gini": 1 - 2 * area,
                     **errors(1 - 2 * area, gini_official)}
    a, b, c, d = fits["cubic"]["coef"]
    fits["cubic"].update({"a": a, "b": b, "c": c, "d": d, "checks": cubic_checks(a, b, c, d)})
    out.update(fits)

    # 3. constrained models: z = L - x = beta*v + alpha*w
    z = L - X
    v = X**2 - X
    w = (X - 0.5) * (X**2 - X)
    S = {"vz": float(v @ z), "vv": float(v @ v), "wz": float(w @ z), "ww": float(w @ w),
         "vw": float(v @ w)}
    beta = S["vz"] / S["vv"]
    alpha = S["wz"] / S["ww"]
    # standard form: x + beta(x^2 - x) + alpha(x^3 - 1.5x^2 + 0.5x)
    ca, cb, cc = alpha, beta - 1.5 * alpha, 1 - beta + 0.5 * alpha
    cfit = ca * X**3 + cb * X**2 + cc * X
    css_res, css_tot, cr2 = r_squared(L, cfit)
    carea = ca / 4 + cb / 3 + cc / 2
    # cross-check with a general two-parameter least-squares solve
    A = np.column_stack([X**3 - X, X**2 - X])
    gen, *_ = np.linalg.lstsq(A, z, rcond=None)
    out["table"] = {"z": z.tolist(), "v": v.tolist(), "w": w.tolist(),
                    "vz": (v * z).tolist(), "vv": (v * v).tolist(),
                    "wz": (w * z).tolist(), "ww": (w * w).tolist(), "vw": (v * w).tolist()}
    out["sums"] = S
    out["ccubic"] = {"beta": beta, "alpha": alpha, "a": ca, "b": cb, "c": cc,
                     "fitted": cfit.tolist(), "residuals": (L - cfit).tolist(),
                     "ss_res": css_res, "ss_tot": css_tot, "r2": cr2,
                     "area": carea, "gini": 1 - 2 * carea, "gini_beta_over_3": beta / 3,
                     "general_solver_ab": gen.tolist(),
                     "checks": cubic_checks(ca, cb, cc, 0.0),
                     **errors(1 - 2 * carea, gini_official)}
    qfit = X + beta * v
    qss_res, _, qr2 = r_squared(L, qfit)
    out["cquad"] = {"b": beta, "c": 1 - beta, "fitted": qfit.tolist(),
                    "residuals": (L - qfit).tolist(), "ss_res": qss_res, "r2": qr2,
                    "gini": beta / 3, "checks": cubic_checks(0.0, beta, 1 - beta, 0.0),
                    **errors(beta / 3, gini_official)}

    # 4. the claims the IA relies on, verified on this data
    out["verify"] = {
        "sum_vw_is_zero": abs(S["vw"]) < 1e-12,
        "integral_w": float(np.polyval(np.polyint([1, -1.5, 0.5, 0]), 1)),   # int_0^1 w dx
        "integral_v": float(np.polyval(np.polyint([1, -1, 0]), 1)),          # int_0^1 v dx
        "hand_matches_general_solver": bool(np.allclose(gen, [ca, cb], atol=1e-10)),
        "ccubic_gini_equals_cquad": abs(out["ccubic"]["gini"] - out["cquad"]["gini"]) < 1e-12,
        "cubic_gini_equals_quad": abs(out["cubic"]["gini"] - out["quad"]["gini"]) < 1e-12,
        "ccubic_ss_res_le_cquad": css_res <= qss_res + 1e-15,
    }
    return out


def plot(results, outdir):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    xs = np.linspace(0, 1, 400)
    for iso, res in results.items():
        cu, cc = res["cubic"], res["ccubic"]
        fig, ax = plt.subplots(figsize=(6, 6))
        ax.plot([0, 1], [0, 1], color="0.45", lw=1, ls="--", label="Line of equality $y = x$")
        ax.plot(xs, np.polyval(cu["coef"], xs), color="#1f5fa8", lw=1.8,
                label="Model 1: unconstrained cubic")
        ax.plot(xs, cc["a"] * xs**3 + cc["b"] * xs**2 + cc["c"] * xs, color="#c0392b",
                lw=1.8, ls="-.", label="Model 2: constrained cubic")
        ax.scatter(res["x"], res["L"], color="black", zorder=5, s=24, label="Decile data points")
        low = min(-0.02, min(np.polyval(cu["coef"], xs)) - 0.02)
        ax.set_xlim(0, 1)
        ax.set_ylim(low, 1.02)
        ax.set_xlabel("Cumulative share of population, $x$")
        ax.set_ylabel("Cumulative share of total welfare, $L(x)$")
        ax.set_title(f"{res['name']}, {res['year']}")
        ax.grid(alpha=0.3)
        ax.legend(loc="upper left", fontsize=9)
        fig.tight_layout()
        fig.savefig(os.path.join(outdir, f"lorenz_{iso}.png"), dpi=200)
        plt.close(fig)

    fig, axes = plt.subplots(1, len(results), figsize=(5.2 * len(results), 4))
    for ax, (iso, res) in zip(np.atleast_1d(axes), results.items()):
        ax.axhline(0, color="0.45", lw=1)
        ax.plot(res["x"], res["cubic"]["residuals"], "o-", color="#1f5fa8", label="Model 1")
        ax.plot(res["x"], res["ccubic"]["residuals"], "s--", color="#c0392b", label="Model 2")
        ax.set_title(f"Residuals, {res['name']}")
        ax.set_xlabel("Cumulative share of population, $x$")
        ax.set_ylabel("Residual $L_k - \\hat{L}(x_k)$")
        ax.grid(alpha=0.3)
        ax.legend(fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, "residuals.png"), dpi=200)
    plt.close(fig)


def selftest():
    """Synthetic curves with known answers; no real data involved."""
    # exact Lorenz curve L = x^3: constrained cubic fits exactly, G = 1 - 2(1/4) = 0.5
    s = np.diff(X**3)
    r = analyse(s, 0.5)
    assert abs(r["ccubic"]["a"] - 1) < 1e-10 and abs(r["ccubic"]["b"]) < 1e-10
    assert abs(r["ccubic"]["gini"] - 0.5) < 1e-12
    assert r["trap"]["gini"] < 0.5          # convex curve: trapezium underestimates G
    # exact Lorenz curve L = x^2: constrained quadratic fits exactly, G = 1/3
    r = analyse(np.diff(X**2), 1 / 3)
    assert abs(r["cquad"]["gini"] - 1 / 3) < 1e-12
    assert all(val for val in r["verify"].values() if isinstance(val, bool))
    assert abs(r["verify"]["integral_w"]) < 1e-15 and abs(r["verify"]["integral_v"] + 1 / 6) < 1e-15
    # a curve that decreases on part of [0, 1]: L'(x) = 3x^2 - 2x + 0.3 < 0 between its roots
    chk = cubic_checks(1.0, -1.0, 0.3, 0.0)
    lo, hi = (2 - 0.4**0.5) / 6, (2 + 0.4**0.5) / 6
    assert np.allclose(chk["decreasing_on"], [[lo, hi]])
    print("selftest passed")


def main(argv):
    if argv == ["--selftest"]:
        return selftest()
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
        res.update({"meta": meta, "name": NAMES.get(iso, iso), "year": year})
        results[iso] = res
    with open(os.path.join(outdir, "results.json"), "w") as f:
        json.dump(results, f, indent=2, default=float)
    plot(results, outdir)
    for iso, r in results.items():
        print(f"{iso}: reported {r['gini_official']:.4f} | trapezium {r['trap']['gini']:.4f} | "
              f"model 1 {r['cubic']['gini']:.4f} | model 2 {r['ccubic']['gini']:.4f} | "
              f"checks {r['verify']}")


if __name__ == "__main__":
    main(sys.argv[1:])
