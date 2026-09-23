"""Build the IA (Markdown and Word) from draft/IA_template.md and output/results.json.

Every number in the text is written as «expression» in the template and filled
in from the results, so nothing is copied by hand. Worked calculations shown
in the text are re-done from their rounded, displayed values; the build stops
if any of them would not add up at the precision shown.

Usage: python3 build_ia.py
"""

import csv
import json
import os
import re
import subprocess

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PANDOC = "/usr/local/lib/python3.11/dist-packages/pypandoc/files/pandoc"


class A(dict):
    """Dictionary with attribute access, so the template can write Z.cubic.a."""

    def __getattr__(self, k):
        v = self[k]
        return A(v) if isinstance(v, dict) else v


def f(x, d=6):
    s = f"{x:.{d}f}"
    return s[1:] if s.startswith("-") and float(s) == 0 else s


def pct(x, d=2):
    return f"{x:.{d}f}%"


def signed(x, d=6):
    """' + 0.123' or ' - 0.123' for writing polynomials."""
    return f" - {f(-x, d)}" if x < 0 else f" + {f(x, d)}"


def poly(a, b, c, d=None, dp=6):
    s = f"{f(a, dp)}x^3{signed(b, dp)}x^2{signed(c, dp)}x"
    return s + (signed(d, dp) if d is not None else "")


def check(label, shown, exact, dp, tol=0):
    """The displayed working must give the displayed result (within tol units of the last digit,
    used only where the text says values were added at full precision)."""
    if abs(round(shown, dp) - round(exact, dp)) > (tol + 0.5) * 10 ** -dp:
        raise SystemExit(f"Rounding check failed: {label}: {f(shown, dp)} vs {f(exact, dp)}")
    CHECKS.append(label)


CHECKS = []
R = json.load(open(os.path.join(HERE, "output", "results.json")))
Z, N = A(R["ZAF"]), A(R["NOR"])
ROWS = list(csv.DictReader(open(os.path.join(HERE, "data", "pip_ZAF_NOR_all_years.csv"))))
ROW = {r["country_code"]: r for r in ROWS if r["reporting_year"] == "2022"}
C = {"ZAF": Z, "NOR": N}


def r6(x):
    return round(x, 6)


# ---------------------------------------------------------------- derived values
def g_stationary(c):
    """Stationary points of g(x) = L(x) - x in [0, 1] and the value of g''."""
    a, b, cc = c["a"], c["b"], c["c"]
    A2, B2, C2 = 3 * a, 2 * b, cc - 1
    disc = B2**2 - 4 * A2 * C2
    roots = sorted([(-B2 - disc**0.5) / (2 * A2), (-B2 + disc**0.5) / (2 * A2)])
    inside = [x for x in roots if 0 <= x <= 1]
    return {"disc": disc, "roots": roots, "inside": inside,
            "g2": [6 * a * x + 2 * b for x in inside]}


def root_L(c):
    rts = np.roots([c["a"], c["b"], c["c"], c.get("d", 0.0)])
    real = [r.real for r in rts if abs(r.imag) < 1e-12 and 0 < r.real < 1]
    return real[0] if real else None


D = {}
for iso, r in C.items():
    d = {}
    L = np.array(r["L"])
    d["n_neg"] = root_L(r["cubic"])
    d["gs1"] = g_stationary(r["cubic"])
    for key in ("cubic", "ccubic"):
        c = r[key]
        d[key + "_disc"] = (2 * c["b"]) ** 2 - 4 * (3 * c["a"]) * c["c"]
    d["Lbar"] = float(L.mean())
    d["grouping"] = r["trap"]["gini"] - r["gini_official"]
    d["m1_model"] = r["cubic"]["gini"] - r["trap"]["gini"]
    d["m2_model"] = r["ccubic"]["gini"] - r["trap"]["gini"]
    d["area_gap"] = r["cubic"]["area"] - r["ccubic"]["area"]
    d["mean_median"] = float(ROW[iso]["mean"]) / float(ROW[iso]["median"])
    d["pop_m"] = float(ROW[iso]["reporting_pop"]) / 1e6
    d["bottom40"] = r["L"][4]
    d["top10"] = r["shares"][9]
    d["m2_min_slope_factor"] = r["ccubic"]["beta"] - r["ccubic"]["alpha"] / 2
    D[iso] = A(d)
DZ, DN = D["ZAF"], D["NOR"]

# ------------------------------------------------------ worked-calculation checks
for iso, r in C.items():
    L = r["L"]
    # cumulative sums: L_k = L_{k-1} + s_k at 6 d.p.
    for k in range(1, 11):
        check(f"{iso} L{k}", r6(L[k - 1]) + r6(r["shares"][k - 1]), L[k], 6, tol=2)
    # trapezium
    S = r6(r["trap"]["sum_interior_L"])
    check(f"{iso} sum L", sum(r6(v) for v in L[1:10]), r["trap"]["sum_interior_L"], 6, tol=2)
    check(f"{iso} A_T", 0.05 + 0.1 * S, r["trap"]["area"], 6)
    check(f"{iso} G_T", 0.9 - 0.2 * S, r["trap"]["gini"], 6)
    # Model 1 integral with 7 d.p. terms
    c = r["cubic"]
    terms = [round(c["a"] / 4, 7), round(c["b"] / 3, 7), round(c["c"] / 2, 7), round(c["d"], 7)]
    check(f"{iso} M1 area", sum(terms), c["area"], 7)
    check(f"{iso} M1 G", 1 - 2 * round(c["area"], 7), c["gini"], 6)
    check(f"{iso} M1 R2", 1 - round(c["ss_res"], 7) / round(c["ss_tot"], 7), c["r2"], 4)
    check(f"{iso} M1 SSres", sum(round(e * e, 8) for e in c["residuals"]), c["ss_res"], 7, tol=1)
    check(f"{iso} SStot", sum(round((v - D[iso]["Lbar"]) ** 2, 7) for v in L), c["ss_tot"], 7, tol=1)
    # Model 2 sums, beta, alpha and conversion
    m, t, s = r["ccubic"], r["table"], r["sums"]
    check(f"{iso} sum vz", sum(round(v, 7) for v in t["vz"]), s["vz"], 7, tol=1)
    check(f"{iso} sum wz", sum(round(v, 8) for v in t["wz"]), s["wz"], 8, tol=1)
    check(f"{iso} beta", round(s["vz"], 7) / 0.3333, m["beta"], 6)
    check(f"{iso} alpha", round(s["wz"], 8) / 0.01188, m["alpha"], 6)
    B7, A7 = round(m["beta"], 7), round(m["alpha"], 7)
    check(f"{iso} M2 b", B7 - 1.5 * A7, m["b"], 6)
    check(f"{iso} M2 c", 1 - B7 + 0.5 * A7, m["c"], 6)
    check(f"{iso} M2 G=beta/3", round(m["beta"], 6) / 3, m["gini"], 6)
    terms = [round(m["a"] / 4, 7), round(m["b"] / 3, 7), round(m["c"] / 2, 7)]
    check(f"{iso} M2 area", sum(terms), m["area"], 7)
    check(f"{iso} M2 G", 1 - 2 * round(m["area"], 7), m["gini"], 6)
    check(f"{iso} M2 R2", 1 - round(m["ss_res"], 7) / round(m["ss_tot"], 7), m["r2"], 4)
    # errors and decomposition at 4 d.p.
    for key in ("trap", "cubic", "ccubic"):
        check(f"{iso} {key} err", round(r[key]["gini"], 6) - round(r["gini_official"], 6),
              r[key]["signed_err"], 4)
        check(f"{iso} {key} pct", round(r[key]["abs_err"], 6) / round(r["gini_official"], 6) * 100,
              r[key]["pct_err"], 2)
    check(f"{iso} decomposition M1", round(D[iso]["grouping"], 4) + round(D[iso]["m1_model"], 4),
          r["cubic"]["signed_err"], 4)
    check(f"{iso} decomposition M2", round(D[iso]["grouping"], 4) + round(D[iso]["m2_model"], 4),
          r["ccubic"]["signed_err"], 4)

# claims that the text states as facts
for iso, r in C.items():
    v = r["verify"]
    assert v["sum_vw_is_zero"] and v["hand_matches_general_solver"]
    assert v["ccubic_gini_equals_cquad"] and v["cubic_gini_equals_quad"]
    assert r["trap"]["lower_bound_holds"]
    assert r["cubic"]["checks"]["decreasing_on"] is None and r["ccubic"]["checks"]["decreasing_on"] is None
    assert D[iso]["cubic_disc"] < 0 and D[iso]["ccubic_disc"] < 0
    assert len(D[iso]["gs1"]["inside"]) == 1 and D[iso]["gs1"]["g2"][0] > 0
    assert r["ccubic"]["alpha"] > 0 and D[iso]["m2_min_slope_factor"] > 0
    assert all(e < 0 for e in (r["trap"]["signed_err"], r["cubic"]["signed_err"], r["ccubic"]["signed_err"]))
    s = r["shares"]
    assert all(s[i] < s[i + 1] for i in range(9)) and abs(sum(s) - 1) < 1e-9
assert Z.cquad.c < 0 and N.cquad.c > 0

# claims made in the prose
for iso, r in C.items():
    off = r["gini_official"]
    for key in ("trap", "cubic", "ccubic"):
        g = r[key]["gini"]
        assert round(g, 1) == round(off, 1) and round(g, 2) != round(off, 2)   # right to 1 d.p., not 2
    assert r["trap"]["abs_err"] < r["cubic"]["abs_err"] < r["ccubic"]["abs_err"]  # ranking of methods
    assert r["cubic"]["checks"]["dL0"] > 10 * r["shares"][0] and r["ccubic"]["checks"]["dL0"] > 10 * r["shares"][0]
    assert r["cubic"]["checks"]["dL1"] < 10 * r["shares"][9] and r["ccubic"]["checks"]["dL1"] < 10 * r["shares"][9]
    for key in ("cubic", "ccubic"):
        e = r[key]["residuals"]
        assert all(e[k] < 0 for k in (1, 2, 8, 9)) and np.argmax(np.abs(e)) == 9
        assert r[key]["r2"] > 0.98 and r[key]["b"] < 0 and r[key]["checks"]["d2L0"] < 0
    assert [np.sign(v) for v in r["cubic"]["residuals"]] == [1, -1, -1, -1, 1, 1, 1, 1, -1, -1, 1]
    assert abs(r["cubic"]["gini"] - r["quad"]["gini"]) < 5e-15 and abs(r["ccubic"]["gini"] - r["cquad"]["gini"]) < 5e-15
    assert max(abs(np.array(r["ccubic"]["general_solver_ab"]) - [r["ccubic"]["a"], r["ccubic"]["b"]])) < 5e-13
    assert D[iso]["m1_model"] < 0 and D[iso]["m2_model"] < 0
cubic_pcts = [C[i][k]["pct_err"] for i in C for k in ("cubic", "ccubic")]
assert f(min(cubic_pcts), 1) == "2.4" and f(max(cubic_pcts), 1) == "5.5"
assert all(2 <= Z[k]["abs_err"] / N[k]["abs_err"] <= 3 for k in ("trap", "cubic", "ccubic"))
assert abs(D["ZAF"]["m2_model"]) > abs(D["ZAF"]["grouping"])
assert Z.cubic.pct_err > N.cubic.pct_err and Z.ccubic.pct_err > N.ccubic.pct_err
assert 2.8 < max(abs(v) for v in Z.cubic.residuals) / max(abs(v) for v in N.cubic.residuals) < 3.5
assert N.cubic.r2 > Z.cubic.r2 and N.cubic.abs_err < Z.cubic.abs_err
assert N.cquad.checks.d2L0 > 0 and Z.cquad.checks.d2L0 > 0
assert N.cquad.r2 < N.ccubic.r2 and all(C[i]['cubic']['r2'] > max(C[i][k]['r2'] for k in ('quad', 'cquad', 'ccubic')) for i in C)
assert N.cquad.checks.negative_on is None and N.cquad.checks.decreasing_on is None and N.ccubic.checks.d2L0 < 0


# ------------------------------------------------------------------------ tables
def text_minus(cell):
    """Proper minus signs in table cells that are not typeset as maths."""
    cell = str(cell)
    return cell if "$" in cell else re.sub(r"(?<![\w.])-(?=\d)", "\u2212", cell)


def row(*cells):
    return "| " + " | ".join(text_minus(c) for c in cells) + " |"


def sep(*widths, right=True):
    """Header separator; the number of dashes sets each column's relative width."""
    return "|" + "|".join("-" * w + (":" if right and i else "-") for i, w in enumerate(widths)) + "|"


def T_meta():
    z, n = ROW["ZAF"], ROW["NOR"]
    lines = [row("", "South Africa", "Norway"), row("---", "---", "---"),
             row("Country code", z["country_code"], n["country_code"]),
             row("Reporting year", z["reporting_year"], n["reporting_year"]),
             row("Survey", "IES (Income and Expenditure Survey)",
                 "EU-SILC (EU Statistics on Income and Living Conditions)"),
             row("Survey year in the file", z["survey_year"], n["survey_year"]),
             row("Welfare measure", z["welfare_type"], n["welfare_type"]),
             row("Coverage", z["survey_coverage"], n["survey_coverage"]),
             row("Distribution type", z["distribution_type"], n["distribution_type"]),
             row("Interpolated?", "no" if z["is_interpolated"] == "FALSE" else "yes",
                 "no" if n["is_interpolated"] == "FALSE" else "yes"),
             row("Comparable spell", z["comparable_spell"].replace(" - ", "–"),
                 n["comparable_spell"].replace(" - ", "–")),
             row("Population (millions)", f(DZ.pop_m, 1), f(DN.pop_m, 2)),
             row("Mean ÷ median welfare", f(DZ.mean_median, 2), f(DN.mean_median, 2)),
             row("Published Gini coefficient", f(Z.gini_official), f(N.gini_official))]
    return "\n".join(lines)


def T_cum():
    lines = [row("$k$", "$x_k$", "$s_k$ South Africa", "$L_k$ South Africa",
                  "$s_k$ Norway", "$L_k$ Norway"),
             row(*["---:"] * 6),
             row(0, "0", "–", f(0), "–", f(0))]
    for k in range(1, 11):
        lines.append(row(k, f(k / 10, 1), f(Z.shares[k - 1]), f(Z.L[k]),
                         f(N.shares[k - 1]), f(N.L[k])))
    return "\n".join(lines)


def T_grad():
    lines = [row("Decile $k$", "$10s_k$ South Africa", "$10s_k$ Norway"), sep(10, 16, 16)]
    for k in range(10):
        lines.append(row(k + 1, f(10 * Z.shares[k], 3), f(10 * N.shares[k], 3)))
    return "\n".join(lines)


def T_m1(iso):
    r, d = C[iso], D[iso]
    c = r["cubic"]
    lines = [row("$x_k$", "$L_k$", "$\\hat L(x_k)$", "$e_k$", "$e_k^{\\,2}$",
                 "$(L_k - \\bar L)^2$"), sep(6, 12, 12, 12, 13, 13)]
    for k in range(11):
        e = c["residuals"][k]
        lines.append(row(f(k / 10, 1), f(r["L"][k]), f(c["fitted"][k]), f(e),
                         f(e * e, 8), f((r["L"][k] - d["Lbar"]) ** 2, 7)))
    lines.append(row("**Sum**", "", "", "", f"**{f(c['ss_res'], 7)}**", f"**{f(c['ss_tot'], 7)}**"))
    return "\n".join(lines)


def T_checks(key):
    def cells(iso):
        r, d = C[iso], D[iso]
        c = r[key]
        ch = c["checks"]
        neg = f"negative for $0 \\le x < {f(d['n_neg'], 4)}$" if key == "cubic" else "never negative"
        return {
            "L0": f"${f(ch['L0'])}$", "L1": f"${f(ch['L1'])}$",
            "range": (f"${f(ch['L0'], 4)} \\le \\hat L(x) \\le {f(ch['L1'], 4)}$; " + neg),
            "inc": f"discriminant of $\\hat L'$ is ${f(d[key + '_disc'], 3)} < 0$: increasing",
            "conc": (f"$\\hat L''(0) = {f(ch['d2L0'], 3)} < 0$: concave down for "
                     f"$0 \\le x < {f(ch['inflection_x'], 4)}$"),
        }
    z, n = cells("ZAF"), cells("NOR")
    below = ("largest value of $\\hat L(x) - x$ is ${}$ (at $x = 0$): below $y = x$"
             if key == "cubic" else "$\\hat L(x) - x < 0$ for $0 < x < 1$: below $y = x$")
    lines = [row("Property", "Required", "South Africa", "Norway"), sep(14, 14, 34, 34, right=False),
             row("$\\hat L(0)$", "$0$", z["L0"], n["L0"]),
             row("$\\hat L(1)$", "$1$", z["L1"], n["L1"]),
             row("Values on $[0, 1]$", "$0 \\le \\hat L(x) \\le 1$", z["range"], n["range"]),
             row("Increasing", "$\\hat L'(x) \\ge 0$", z["inc"], n["inc"]),
             row("Concave up", "$\\hat L''(x) \\ge 0$", z["conc"], n["conc"])]
    if key == "cubic":
        lines.append(row("Below the line of equality", "$\\hat L(x) \\le x$",
                         below.format(f(Z.cubic.checks.L0, 4)), below.format(f(N.cubic.checks.L0, 4))))
    else:
        lines.append(row("Below the line of equality", "$\\hat L(x) \\le x$", below, below))
    return "\n".join(lines)


def T_m2_sums(iso):
    r = C[iso]
    t = r["table"]
    lines = [row("$x_k$", "$z_k = L_k - x_k$", "$v_k z_k$", "$w_k z_k$"), sep(8, 16, 16, 16)]
    for k in range(11):
        lines.append(row(f(k / 10, 1), f(t["z"][k]), f(t["vz"][k], 7), f(t["wz"][k], 8)))
    lines.append(row("**Sum**", "", f"**{f(r['sums']['vz'], 7)}**", f"**{f(r['sums']['wz'], 8)}**"))
    return "\n".join(lines)


def T_symm():
    def valid(ch):
        bad = []
        if ch["negative_on"]:
            bad.append("negative near 0")
        if ch["decreasing_on"]:
            bad.append("decreasing near 0")
        if abs(ch["L0"]) > 1e-12 or abs(ch["L1"] - 1) > 1e-12:
            bad.append("misses end points")
        if ch["d2L0"] < 0:
            bad.append("concave down near 0")
        return "no: " + ", ".join(bad) if bad else "yes: end points, increasing, concave up"

    lines = [row("Country", "Model", "$R^2$", "Valid Lorenz curve?", "Gini estimate"),
             "|" + "-" * 12 + "|" + "-" * 26 + "|" + "-" * 10 + ":|" + "-" * 36 + "|" + "-" * 11 + ":|"]
    for iso, name in (("ZAF", "South Africa"), ("NOR", "Norway")):
        r = C[iso]
        for key, mname in (("cquad", "Constrained quadratic"), ("ccubic", "Model 2 (constrained cubic)"),
                           ("quad", "Unconstrained quadratic"), ("cubic", "Model 1 (unconstrained cubic)")):
            m = r[key]
            ch = m.get("checks") or cubic_checks_quad(m)
            lines.append(row(name, mname, f(m["r2"], 4), valid(ch), f(m["gini"])))
    return "\n".join(lines)


def cubic_checks_quad(m):
    a2, b1, c0 = m["coef"]
    grid = np.linspace(0, 1, 100001)
    L = a2 * grid**2 + b1 * grid + c0
    dL = 2 * a2 * grid + b1
    return {"negative_on": (L < 0).any() or None, "decreasing_on": (dL < 0).any() or None,
            "L0": c0, "L1": a2 + b1 + c0, "d2L0": 2 * a2}


def T_errors():
    lines = [row("Method", "SA estimate", "SA error", "SA % error", "Norway estimate", "Norway error",
                 "Norway % error"), sep(22, 11, 11, 10, 11, 11, 10),
             row("Published (PIP)", f(Z.gini_official, 4), "–", "–", f(N.gini_official, 4), "–", "–")]
    for key, name in (("trap", "Trapezium rule"), ("cubic", "Model 1"), ("ccubic", "Model 2")):
        z, n = C["ZAF"][key], C["NOR"][key]
        lines.append(row(name, f(z["gini"], 4), f(z["signed_err"], 4), pct(z["pct_err"]),
                         f(n["gini"], 4), f(n["signed_err"], 4), pct(n["pct_err"])))
    return "\n".join(lines)


def T_summary():
    lines = [row("Country", "Published $G_{\\text{WB}}$", "Trapezium $G_T$", "Model 1 $G_1$", "Model 2 $G_2$"),
             sep(14, 14, 14, 14, 14)]
    for iso, name in (("ZAF", "South Africa"), ("NOR", "Norway")):
        r = C[iso]
        lines.append(row(name, f(r["gini_official"], 4), f(r["trap"]["gini"], 4), f(r["cubic"]["gini"], 4),
                         f(r["ccubic"]["gini"], 4)))
    return "\n".join(lines)


def T_err_compare():
    lines = [row("Country", "Method", "Estimated Gini", "Absolute error $\\left|G_{\\text{est}} - G_{\\text{WB}}\\right|$",
                 "Relative percentage error"),
             "|" + "-" * 12 + "|" + "-" * 24 + "|" + "-" * 12 + ":|" + "-" * 24 + ":|" + "-" * 16 + ":|"]
    for iso, name in (("ZAF", "South Africa"), ("NOR", "Norway")):
        r = C[iso]
        lines.append(row(name, "World Bank (published)", f(r["gini_official"], 4), "–", "–"))
        for key, mname in (("trap", "Trapezoidal rule"), ("cubic", "Model 1 (unconstrained cubic)"),
                           ("ccubic", "Model 2 (constrained cubic)")):
            m = r[key]
            lines.append(row(name, mname, f(m["gini"], 4), f(m["abs_err"], 4), pct(m["pct_err"])))
    return "\n".join(lines)


def T_decomp():
    lines = [row("Country", "Method", "Grouping error $G_T - G$", "Model error $G_{\\text{model}} - G_T$",
                 "Total error $G_{\\text{model}} - G$"), sep(12, 10, 18, 22, 20)]
    for iso, name in (("ZAF", "South Africa"), ("NOR", "Norway")):
        r, d = C[iso], D[iso]
        for key, mname, me in (("cubic", "Model 1", d["m1_model"]), ("ccubic", "Model 2", d["m2_model"])):
            lines.append(row(name, mname, f(d["grouping"], 4), f(me, 4), f(r[key]["signed_err"], 4)))
    return "\n".join(lines)


def T_ends():
    lines = [row("", "South Africa", "Norway"), sep(40, 12, 12)]
    items = [("Data: average gradient of first segment, $10s_1$", lambda r: 10 * r["shares"][0]),
             ("Model 1: $\\hat L'(0)$", lambda r: r["cubic"]["checks"]["dL0"]),
             ("Model 2: $\\hat L'(0)$", lambda r: r["ccubic"]["checks"]["dL0"]),
             ("Data: average gradient of last segment, $10s_{10}$", lambda r: 10 * r["shares"][9]),
             ("Model 1: $\\hat L'(1)$", lambda r: r["cubic"]["checks"]["dL1"]),
             ("Model 2: $\\hat L'(1)$", lambda r: r["ccubic"]["checks"]["dL1"])]
    for label, fn in items:
        lines.append(row(label, f(fn(C["ZAF"]), 4), f(fn(C["NOR"]), 4)))
    return "\n".join(lines)


def T_raw():
    cols = ["decile%d" % k for k in range(1, 11)]
    lines = [row("Decile", "South Africa (consumption share)", "Norway (income share)"),
             row("---", "---:", "---:")]
    for k, c in enumerate(cols, 1):
        lines.append(row(k, ROW["ZAF"][c], ROW["NOR"][c]))
    lines.append(row("Gini", ROW["ZAF"]["gini"], ROW["NOR"]["gini"]))
    return "\n".join(lines)


def T_m2_resid():
    lines = [row("$x_k$", "$\\hat L(x_k)$ SA", "$e_k$ SA", "$\\hat L(x_k)$ Norway", "$e_k$ Norway"),
             row(*["---:"] * 5)]
    for k in range(11):
        lines.append(row(f(k / 10, 1), f(Z.ccubic.fitted[k]), f(Z.ccubic.residuals[k]),
                         f(N.ccubic.fitted[k]), f(N.ccubic.residuals[k])))
    lines.append(row("$SS_{res}$", "", f(Z.ccubic.ss_res, 7), "", f(N.ccubic.ss_res, 7)))
    return "\n".join(lines)


def years(iso):
    ys = [r["reporting_year"] for r in ROWS if r["country_code"] == iso]
    return ", ".join(ys)


CTX = dict(Z=Z, N=N, DZ=DZ, DN=DN, f=f, pct=pct, signed=signed, poly=poly, round=round, abs=abs,
           T_meta=T_meta, T_cum=T_cum, T_grad=T_grad, T_m1=T_m1, T_checks=T_checks,
           T_m2_sums=T_m2_sums, T_symm=T_symm, T_errors=T_errors, T_err_compare=T_err_compare, T_summary=T_summary, T_decomp=T_decomp, T_ends=T_ends,
           T_raw=T_raw, T_m2_resid=T_m2_resid, years=years, n_rows=len(ROWS),
           n_nor=sum(r["country_code"] == "NOR" for r in ROWS),
           n_zaf=sum(r["country_code"] == "ZAF" for r in ROWS))


CALC = re.compile(r"<!--calc-->.*?<!--/calc-->\n?", re.S)


def full_version(md):
    """Everything, with the calculation markers removed."""
    return re.sub(r"^<!--/?calc-->\n", "", md, flags=re.M)


def written_version(md):
    """Only the prose: no calculations, display maths, tables or figures."""
    md = CALC.sub("", md)
    md = re.sub(r"\$\$.*?\$\$", "", md, flags=re.S)
    keep = []
    for line in md.split("\n"):
        s = line.strip()
        if s.startswith("|") or s.startswith("Table:") or s.startswith("!["):
            continue
        keep.append(line)
    md = "\n".join(keep)
    md = md.replace('subtitle: "IB Mathematics: Analysis and Approaches SL, Mathematical Exploration"',
                    'subtitle: "IB Mathematics: Analysis and Approaches SL, Mathematical Exploration (written text only)"')
    md = re.sub(r"\n{3,}", "\n\n", md)
    # turn the remaining inline maths into ordinary text, so the document has no equation objects
    plain = subprocess.run([PANDOC, "-f", "markdown", "-s", "-t",
                            "markdown-tex_math_dollars-tex_math_single_backslash-raw_tex-raw_html"],
                           input=md, capture_output=True, text=True, check=True).stdout
    return plain


def to_docx(md_path, docx_path):
    subprocess.run([PANDOC, md_path, "-o", docx_path, "--resource-path", HERE,
                    "--reference-doc", os.path.join(HERE, "draft", "reference.docx")], check=True)


def main():
    src = open(os.path.join(HERE, "draft", "IA_template.md"), encoding="utf-8").read()
    out = re.sub("«(.+?)»", lambda m: str(eval(m.group(1), CTX)), src)
    assert "«" not in out and "»" not in out
    full_md = os.path.join(HERE, "draft", "IA_final.md")
    open(full_md, "w", encoding="utf-8").write(full_version(out))
    to_docx(full_md, os.path.join(HERE, "IA_Complete_Gini_Lorenz_South_Africa_Norway.docx"))
    text_md = os.path.join(HERE, "draft", "IA_written_text_only.md")
    text = written_version(out)
    assert "$" not in text and "<!--" not in text and "\\frac" not in text
    open(text_md, "w", encoding="utf-8").write(text)
    to_docx(text_md, os.path.join(HERE, "IA_Written_Text_Only.docx"))
    print(f"{len(CHECKS)} worked calculations checked; wrote the complete IA and the written-text-only version")


if __name__ == "__main__":
    main()
