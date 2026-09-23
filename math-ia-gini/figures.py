"""Figures for the IA, drawn from output/results.json (run analysis.py first).

Black and grey only; series are told apart by line style and marker.

Usage: python3 figures.py output
"""

import json
import os
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

INK, INK2, MUTED, GRID = "#000000", "#4a4a4a", "#8c8c8c", "#e3e3e3"

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


def fig_models(res, out):
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.6))
    for ax, iso in zip(axes, ("ZAF", "NOR")):
        r = res[iso]
        cu, cc = r["cubic"], r["ccubic"]
        ax.plot([0, 1], [0, 1], color=MUTED, lw=1.1, ls=":", label="Line of equality $y = x$")
        ax.plot(XS, cubic(cu, XS), color=INK, lw=1.6, ls="-", label="Model 1 (unconstrained cubic)")
        ax.plot(XS, cubic(cc, XS), color=INK2, lw=1.6, ls="-.", label="Model 2 (constrained cubic)")
        ax.scatter(r["x"], r["L"], s=26, color=INK, marker="o", zorder=5, label="Decile points $(x_k, L_k)$")
        ax.axhline(0, color=INK2, lw=0.7)
        ax.set_xlim(0, 1)
        ax.set_ylim(min(-0.05, cu["d"] - 0.02), 1.03)
        ax.set_title(r["name"])
        ax.set_xlabel("Cumulative share of population, $x$")
    axes[0].set_ylabel("Cumulative share, $L(x)$")
    axes[0].legend(loc="upper left", fontsize=8.5)
    fig.tight_layout()
    fig.savefig(os.path.join(out, "fig2_models.png"))
    plt.close(fig)


def fig_residuals(res, out):
    fig, axes = plt.subplots(1, 2, figsize=(10, 3.9), sharey=True)
    for ax, iso in zip(axes, ("ZAF", "NOR")):
        r = res[iso]
        ax.axhline(0, color=INK2, lw=0.9)
        ax.plot(r["x"], r["cubic"]["residuals"], "o-", color=INK, lw=1.5, ms=5, label="Model 1")
        ax.plot(r["x"], r["ccubic"]["residuals"], "s-.", color=INK2, lw=1.5, ms=5, mfc="white",
                label="Model 2")
        ax.set_title(r["name"])
        ax.set_xlabel("Cumulative share of population, $x$")
    axes[0].set_ylabel("Residual  $L_k - \\hat L(x_k)$")
    axes[0].legend(loc="lower left", fontsize=9)
    fig.tight_layout()
    fig.savefig(os.path.join(out, "fig3_residuals.png"))
    plt.close(fig)


def main(outdir):
    with open(os.path.join(outdir, "results.json")) as f:
        res = json.load(f)
    for old in ("fig2_models_ZAF.png", "fig3_models_NOR.png", "fig4_residuals.png",
                "fig5_symmetry.png", "fig6_gradients.png"):
        path = os.path.join(outdir, old)
        if os.path.exists(path):
            os.remove(path)
    fig_data(res, outdir)
    fig_models(res, outdir)
    fig_residuals(res, outdir)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "output")
