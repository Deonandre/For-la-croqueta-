#!/usr/bin/env python3
"""Conceptual diagrams for the ESS investigation (not data plots).

Figure 1: the hypothesised causal pathway, showing what is measured and what is not.
Figure 2: the methodology, including the dataset that was tested and rejected.
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.patheffects as pe
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

OUT = Path(__file__).resolve().parent.parent / "output"
OUT.mkdir(exist_ok=True)

BLUE, ORANGE = "#1f6fb2", "#d95f02"
INK, MUTED, GRID = "#0b0b0b", "#52514e", "#d9d8d4"
plt.rcParams.update({"font.family": "serif", "font.size": 9})


def box(ax, x, y, w, h, text, fc="white", ec=MUTED, tc=INK, lw=1.2, fs=8.6, bold=False):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h,
                                boxstyle="round,pad=0.012,rounding_size=0.02",
                                fc=fc, ec=ec, lw=lw, zorder=2))
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=tc,
            zorder=3, fontweight="bold" if bold else "normal", linespacing=1.35)


def arrow(ax, p0, p1, color=MUTED, ls="-", lw=1.4, rad=0.0):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", mutation_scale=11,
                                 color=color, lw=lw, linestyle=ls, zorder=1,
                                 connectionstyle=f"arc3,rad={rad}",
                                 shrinkA=2, shrinkB=3))


# ---------------------------------------------------------------- Figure 1
fig, ax = plt.subplots(figsize=(7.2, 4.6))
ax.set_xlim(0, 10); ax.set_ylim(0, 7.1); ax.axis("off")
CY = 4.5

# shaded panel marking the unobserved middle of the chain (drawn behind the boxes)
ax.add_patch(FancyBboxPatch((2.70, CY - 0.80), 4.80, 1.60,
                            boxstyle="round,pad=0.02,rounding_size=0.04",
                            fc="#f2f1ee", ec="none", zorder=0))
ax.text(5.10, CY - 1.02, "not observed in this investigation", ha="center",
        fontsize=7.8, color=MUTED, style="italic")

box(ax, 1.35, CY, 2.0, 0.95, "Population\ngrowth", fc="#eaf2fb", ec=BLUE, lw=1.7, bold=True)
box(ax, 3.85, CY, 2.0, 0.95, "Demand for\nnew farmland")
box(ax, 6.35, CY, 2.0, 0.95, "Forest cleared\nand burned")
box(ax, 8.75, CY, 2.0, 0.95, "CO$_2$ released\nfrom biomass",
    fc="#fdeee4", ec=ORANGE, lw=1.7, bold=True)
for a, b in ((2.40, 2.80), (4.90, 5.30), (7.40, 7.70)):
    arrow(ax, (a, CY), (b, CY), color=INK, lw=1.7)
ax.text(1.35, CY + 0.74, "MEASURED", ha="center", fontsize=7.4, color=BLUE,
        fontweight="bold", path_effects=[pe.withStroke(linewidth=2.5, foreground="white")])
ax.text(8.75, CY + 0.74, "MEASURED", ha="center", fontsize=7.4, color=ORANGE,
        fontweight="bold", path_effects=[pe.withStroke(linewidth=2.5, foreground="white")])

# one weakening pathway, one arrow, no crossings
box(ax, 4.30, 6.45, 7.4, 0.80,
    "What weakens the link:  population growth absorbed by cities  \u00b7  "
    "higher yields on existing land",
    ec=GRID, tc=MUTED, lw=1.1, fs=7.9)
arrow(ax, (2.60, 6.05), (2.60, CY + 0.52), color=MUTED, ls=(0, (3, 2)), lw=1.3)

# confounders feeding the clearing step
ax.text(5.00, 2.86, "Other drivers acting on the same step", fontsize=8.2,
        color=INK, ha="center", fontweight="bold")
for i, t_ in enumerate(["Commodity prices\nand export demand",
                        "Roads, logging\nconcessions, mining",
                        "Fuelwood, fire,\noil palm"]):
    x = 2.30 + i * 2.70
    box(ax, x, 1.80, 2.35, 0.90, t_, ec=GRID, tc=MUTED, lw=1.0, fs=7.8)
    arrow(ax, (x, 2.27), (6.35 + (i - 1) * 0.42, CY - 0.52), color=GRID, lw=1.1, rad=0.10)

ax.text(5.00, 0.42,
        "Only the two end boxes are measured, so a correlation between them cannot show\n"
        "which pathway produced it \u2014 or whether any of them did.",
        ha="center", fontsize=7.9, color=MUTED, style="italic", linespacing=1.5)
fig.tight_layout()
fig.savefig(OUT / "figA_pathway.png", dpi=220, bbox_inches="tight")
plt.close(fig)

# ---------------------------------------------------------------- Figure 2
fig, ax = plt.subplots(figsize=(7.1, 5.0))
ax.set_xlim(0, 10); ax.set_ylim(0, 8.4); ax.axis("off")

box(ax, 3.1, 7.8, 5.2, 0.8, "Our World in Data — CO$_2$ and Greenhouse Gas Emissions\n"
                            "(Global Carbon Budget 2025; Maddison Project 2023)",
    fc="#eaf2fb", ec=BLUE, lw=1.5, fs=8.0)
box(ax, 8.4, 7.8, 3.0, 0.8, "World Bank cropland series\nTESTED AND REJECTED",
    ec=GRID, tc=MUTED, lw=1.2, fs=7.7)
ax.text(8.4, 6.95, "46% of years showed\nzero change", ha="center", fontsize=7.3,
        color=MUTED, style="italic", linespacing=1.4)

steps = [
    (6.55, "Filter: Cameroon, 1961–2023"),
    (5.45, "Retain land-use-change CO$_2$, population, GDP, fossil CO$_2$"),
    (4.35, "Derive  ΔP$_t$ = P$_t$ − P$_{t-1}$   and   emissions per person"),
]
for y, t in steps:
    box(ax, 3.1, y, 6.0, 0.72, t, fs=8.2)
arrow(ax, (3.1, 7.38), (3.1, 6.93), color=INK)
arrow(ax, (3.1, 6.17), (3.1, 5.83), color=INK)
arrow(ax, (3.1, 5.07), (3.1, 4.73), color=INK)
arrow(ax, (3.1, 3.97), (3.1, 3.33), color=INK)

box(ax, 3.1, 2.95, 6.0, 0.72, "Shapiro–Wilk: both variables non-normal\n"
                              "→ Spearman's $r_s$ as the primary test",
    fc="#fdeee4", ec=ORANGE, lw=1.5, fs=8.2)

tests = ["Levels\n(trend check)", "Annual change\nPRIMARY",
         "First differences\n(detrended)", "Lags 0–6", "Sub-periods\nat 1990"]
for i, t in enumerate(tests):
    x = 1.05 + i * 1.98
    box(ax, x, 1.45, 1.82, 0.84, t, ec=ORANGE if "PRIMARY" in t else GRID,
        lw=1.5 if "PRIMARY" in t else 1.0,
        tc=INK if "PRIMARY" in t else MUTED, fs=7.6,
        bold="PRIMARY" in t)
    arrow(ax, (3.1, 2.57), (x, 1.92), color=GRID, lw=1.0, rad=0.08)
ax.text(5.0, 0.52, "Every test is reported in the correlation table, including those that weaken the result.",
        ha="center", fontsize=7.8, color=MUTED, style="italic")
fig.tight_layout()
fig.savefig(OUT / "figB_method.png", dpi=220, bbox_inches="tight")
plt.close(fig)
print("wrote figA_pathway.png and figB_method.png")
