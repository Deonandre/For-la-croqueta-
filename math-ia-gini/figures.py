"""Figures for the IA, drawn from output/results.json (run analysis.py first).

Usage: python3 figures.py output
"""

import json
import os
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

INK, INK2, MUTED, GRID = "#0b0b0b", "#52514e", "#8a8984", "#e4e3df"
M1, M2 = "#2a78d6", "#eb6834"          # categorical slots 1 and 2 (validated pair)
SHADE = "#cde2fb"                      # sequential blue 100

plt.rcParams.update({
    "font.size": 10, "axes.edgecolor": MUTED, "axes.labelcolor": INK2,
    "xtick.color": INK2, "ytick.color": INK2, "axes.titlesize": 11,
    "axes.titlecolor": INK, "axes.grid": True, "grid.color": GRID,
    "grid.linewidth": 0.8, "axes.spines.top": False, "axes.spines.right": False,
    "legend.frameon": False, "savefig.dpi": 220,
})
XS = np.linspace(0, 1, 801)


def cubic(c, x):
    return c["a"] * x**3 + c["b"] * x**2 + c["c"] * x + c.get("d", 0.0)


def dcubic(c, x):
    return 3 * c["a"] * x**2 + 2 * c["b"] * x + c["c"]


def fig_data(res, out):
    fig, ax = plt.subplots(figsize=(5.6, 5.2))
    ax.plot([0, 1], [0, 1], color=MUTED, lw=1.2, ls="--")
    ax.text(0.62, 0.66, "line of equality  $y = x$", color=INK2, rotation=41, fontsize=9)
    for iso, style in (("NOR", dict(marker="s", ls=":", color=INK2)),
                       ("ZAF", dict(marker="o", ls="-", color=INK))):
        r = res[iso]
        ax.plot(r["x"], r["L"], lw=1.5, ms=5, **style)
        ax.annotate(r["name"], (r["x"][7], r["L"][7]), xytext=(8, -14) if iso == "ZAF" else (-60, 12),
                    textcoords="offset points", color=style["color"], fontsize=9.5)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_xlabel("Cumulative share of population, $x$")
    ax.set_ylabel("Cumulative share of income/consumption, $L$")
    fig.tight_layout()
    fig.savefig(os.path.join(out, "fig1_lorenz_data.png"))
    plt.close(fig)


def fig_models(r, num, out):
    cu, cc = r["cubic"], r["ccubic"]
    fig, (ax, az) = plt.subplots(1, 2, figsize=(10, 4.6), gridspec_kw={"width_ratios": [1.15, 1]})
    for a in (ax, az):
        a.plot([0, 1], [0, 1], color=MUTED, lw=1.2, ls="--", label="Line of equality $y = x$")
        a.plot(XS, cubic(cu, XS), color=M1, lw=1.6, label="Model 1: unconstrained cubic")
        a.plot(XS, cubic(cc, XS), color=M2, lw=1.6, ls="-.", label="Model 2: cubic through (0,0) and (1,1)")
        a.scatter(r["x"], r["L"], s=26, color=INK, zorder=5, label="Decile data points $(x_k, L_k)$")
        a.axhline(0, color=INK2, lw=0.8)
        a.set_xlabel("Cumulative share of population, $x$")
    ax.set_xlim(0, 1)
    ax.set_ylim(min(-0.05, cu["d"] - 0.02), 1.03)
    ax.set_ylabel("Cumulative share, $L(x)$")
    ax.set_title("Whole curve")
    ax.legend(loc="upper left", fontsize=8.5)
    top = r["L"][4] + 0.03
    az.set_xlim(0, 0.4)
    az.set_ylim(min(-0.035, cu["d"] - 0.01), top)
    az.set_ylabel("Cumulative share, $L(x)$")
    az.set_title("Zoom: $0 \\leq x \\leq 0.4$")
    fig.tight_layout()
    fig.savefig(os.path.join(out, f"fig{num}_models_{r['iso']}.png"))
    plt.close(fig)


def fig_residuals(res, out):
    fig, axes = plt.subplots(1, 2, figsize=(10, 3.9), sharey=True)
    for ax, iso in zip(axes, ("ZAF", "NOR")):
        r = res[iso]
        ax.axhline(0, color=INK2, lw=0.9)
        ax.plot(r["x"], r["cubic"]["residuals"], "o-", color=M1, lw=1.5, ms=5, label="Model 1")
        ax.plot(r["x"], r["ccubic"]["residuals"], "s-.", color=M2, lw=1.5, ms=5, label="Model 2")
        ax.set_title(r["name"])
        ax.set_xlabel("Cumulative share of population, $x$")
    axes[0].set_ylabel("Residual  $L_k - \\hat L(x_k)$")
    axes[0].legend(loc="lower left", fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(out, "fig4_residuals.png"))
    plt.close(fig)


def fig_gradients(res, out):
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.1))
    for ax, iso in zip(axes, ("ZAF", "NOR")):
        r = res[iso]
        grads = [10 * s for s in r["shares"]]
        for k, g in enumerate(grads):
            ax.hlines(g, k / 10, (k + 1) / 10, color=INK, lw=2.2,
                      label="Data: gradient $10s_k$ of each segment" if k == 0 else None)
        ax.plot(XS, dcubic(r["cubic"], XS), color=M1, lw=1.6, label="Model 1: $d\\hat{L}/dx$")
        ax.plot(XS, dcubic(r["ccubic"], XS), color=M2, lw=1.6, ls="-.", label="Model 2: $d\\hat{L}/dx$")
        ax.set_xlim(0, 1)
        ax.set_ylim(0, max(grads) * 1.08)
        ax.set_title(r["name"])
        ax.set_xlabel("Cumulative share of population, $x$")
    axes[0].set_ylabel("Gradient (group welfare ÷ national mean)")
    axes[0].legend(loc="upper left", fontsize=8.5)
    fig.tight_layout()
    fig.savefig(os.path.join(out, "fig6_gradients.png"))
    plt.close(fig)


def fig_symmetry(out):
    v = XS**2 - XS
    w = (XS - 0.5) * (XS**2 - XS)
    fig, ax = plt.subplots(figsize=(6.2, 3.8))
    ax.axhline(0, color=INK2, lw=0.9)
    ax.axvline(0.5, color=MUTED, lw=1, ls=":")
    ax.fill_between(XS, w, 0, color=SHADE)
    ax.plot(XS, v, color=INK, lw=1.6, label="$v(x) = x^2 - x$ (symmetric about $x = 0.5$)")
    ax.plot(XS, w, color=M1, lw=1.6, label="$w(x) = (x - 0.5)(x^2 - x)$ (antisymmetric)")
    k = np.linspace(0, 1, 11)
    ax.scatter(k, (k - 0.5) * (k**2 - k), color=M1, s=22, zorder=5)
    ax.text(0.19, 0.012, "+ area", color=INK2, fontsize=9)
    ax.text(0.70, -0.022, "− area", color=INK2, fontsize=9)
    ax.set_xlim(0, 1)
    ax.set_xlabel("$x$")
    ax.legend(loc="lower left", fontsize=8.5)
    fig.tight_layout()
    fig.savefig(os.path.join(out, "fig5_symmetry.png"))
    plt.close(fig)


def main(outdir):
    with open(os.path.join(outdir, "results.json")) as f:
        res = json.load(f)
    for iso in res:
        res[iso]["iso"] = iso
    fig_data(res, outdir)
    fig_models(res["ZAF"], 2, outdir)
    fig_models(res["NOR"], 3, outdir)
    fig_residuals(res, outdir)
    fig_gradients(res, outdir)
    fig_symmetry(outdir)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "output")
