"""Figures for the ESS IA, drawn only from data/processed/cameroon_2001_2024_matched.csv."""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
FIG = ROOT / "figures"
df = pd.read_csv(ROOT / "data" / "processed" / "cameroon_2001_2024_matched.csv")
yr = df.year.to_numpy()
loss = df.tree_cover_loss_ha.to_numpy(float)
co2 = df.co2_excl_luc_Mt.to_numpy(float)
luc = df.co2_land_use_change_Mt.to_numpy(float)

# validated categorical slots (dataviz reference palette, light mode)
BLUE, ORANGE, AQUA = "#2a78d6", "#eb6834", "#1baf7a"
INK, INK2, GRID, SURF = "#0b0b0b", "#52514e", "#e4e3df", "#ffffff"

plt.rcParams.update({
    "font.family": "Liberation Sans", "font.size": 9.5,
    "axes.edgecolor": INK2, "axes.linewidth": 0.6, "axes.labelcolor": INK,
    "axes.titlesize": 10.5, "axes.titleweight": "bold", "axes.titlecolor": INK,
    "xtick.color": INK2, "ytick.color": INK2, "xtick.major.width": 0.6,
    "ytick.major.width": 0.6, "axes.grid": True, "grid.color": GRID,
    "grid.linewidth": 0.6, "grid.linestyle": "-", "axes.axisbelow": True,
    "legend.frameon": False, "figure.facecolor": SURF, "axes.facecolor": SURF,
    "axes.spines.top": False, "axes.spines.right": False,
})
W = 6.3  # inches, fits A4 text width


def save(fig, name):
    fig.tight_layout()
    fig.savefig(FIG / name, dpi=300)
    plt.close(fig)


thousands = matplotlib.ticker.FuncFormatter(lambda v, p: f"{int(v):,}".replace("-", "\u2212"))

# ---- Figure 1: tree-cover loss vs year
fig, ax = plt.subplots(figsize=(W, 3.3))
ax.axvspan(2010.5, 2015.5, color="#f0efec", zorder=0)
ax.text(2013, 222000, "method & sensor\nchanges (2011–2015)", ha="center", va="top",
        fontsize=8, color=INK2)
ma = pd.Series(loss).rolling(3, center=True).mean().to_numpy()
ax.plot(yr, loss, color=BLUE, lw=1.6, marker="o", ms=4.5, mec=SURF, mew=1,
        label="Annual tree-cover loss")
ax.plot(yr, ma, color=INK2, lw=1.2, label="3-year centred moving average")
ax.set_xlim(2000.3, 2024.7)
ax.set_ylim(0, 230000)
ax.yaxis.set_major_formatter(thousands)
ax.set_xticks(range(2001, 2025, 2))
ax.set_xlabel("Year")
ax.set_ylabel("Tree-cover loss (ha yr$^{-1}$)")
ax.set_title("Annual tree-cover loss in Cameroon, 2001–2024 (>30% canopy cover)", loc="left")
ax.legend(loc="upper left", fontsize=8.5)
save(fig, "fig1_tree_cover_loss.png")

# ---- Figure 2: CO2 (excl. land-use change) vs year
fig, ax = plt.subplots(figsize=(W, 3.1))
ax.plot(yr, co2, color=ORANGE, lw=1.6, marker="o", ms=4.5, mec=SURF, mew=1)
ax.set_xlim(2000.3, 2024.7)
ax.set_ylim(0, 11)
ax.set_xticks(range(2001, 2025, 2))
ax.set_xlabel("Year")
ax.set_ylabel("CO$_2$ emissions (Mt CO$_2$ yr$^{-1}$)")
ax.set_title("Annual CO$_2$ emissions in Cameroon excluding land-use change, 2001–2024",
             loc="left")
ax.annotate("2006→2007: +1.92 Mt", xy=(2007, co2[6]), xytext=(2008.3, 4.6),
            fontsize=8, color=INK2, arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
save(fig, "fig2_co2_emissions.png")

# ---- Figure 3: scatter loss vs CO2 with least-squares line
b, a = np.polyfit(loss, co2, 1)
r2 = np.corrcoef(loss, co2)[0, 1] ** 2
fig, ax = plt.subplots(figsize=(W, 3.9))
early = yr <= 2012
ax.scatter(loss[early], co2[early], s=34, color=BLUE, marker="o", edgecolor=SURF,
           linewidth=1, zorder=3, label="2001–2012")
ax.scatter(loss[~early], co2[~early], s=40, color=ORANGE, marker="^", edgecolor=SURF,
           linewidth=1, zorder=3, label="2013–2024")
xs = np.linspace(0, 215000, 50)
ax.plot(xs, a + b * xs, color=INK2, lw=1.1, zorder=2, label="Least-squares line (descriptive)")
ax.text(118000, 6.55, f"y = {b*1e5:.3f}×10$^{{-5}}$x + {a:.3f}\nR$^2$ = {r2:.3f}   (n = 24)",
        fontsize=8.5, color=INK)
for x, y, t in zip(loss, co2, yr):
    if t in (2001, 2011, 2014, 2016, 2023):
        ax.annotate(str(t), (x, y), xytext=(4, -9 if t != 2016 else 4),
                    textcoords="offset points", fontsize=7.5, color=INK2)
ax.set_xlim(0, 215000)
ax.set_ylim(0, 11)
ax.xaxis.set_major_formatter(thousands)
ax.set_xlabel("Annual tree-cover loss (ha yr$^{-1}$)")
ax.set_ylabel("CO$_2$ emissions excl. land-use change\n(Mt CO$_2$ yr$^{-1}$)")
ax.set_title("Annual CO$_2$ emissions against annual tree-cover loss, Cameroon 2001–2024",
             loc="left")
ax.legend(loc="lower right", fontsize=8.5)
save(fig, "fig3_scatter_loss_co2.png")

# ---- Figure 4: first differences
dl, dc = np.diff(loss), np.diff(co2)
fig, ax = plt.subplots(figsize=(W, 3.6))
ax.axhline(0, color=INK2, lw=0.7)
ax.axvline(0, color=INK2, lw=0.7)
ax.scatter(dl, dc, s=34, color=BLUE, edgecolor=SURF, linewidth=1, zorder=3)
for x, y, t in zip(dl, dc, yr[1:]):
    if t in (2007, 2009, 2014, 2015, 2017, 2020):
        ax.annotate(str(t), (x, y), xytext=(4, 3), textcoords="offset points",
                    fontsize=7.5, color=INK2)
ax.xaxis.set_major_formatter(thousands)
ax.set_xlabel("Change in tree-cover loss from previous year (ha)")
ax.set_ylabel("Change in CO$_2$ from\nprevious year (Mt CO$_2$)")
ax.set_title("Year-on-year changes in tree-cover loss and CO$_2$ emissions (n = 23)", loc="left")
save(fig, "fig4_first_differences.png")

# ---- Figure 5: supplementary - loss vs land-use-change CO2
fig, ax = plt.subplots(figsize=(W, 3.6))
ax.scatter(loss, luc, s=34, color=AQUA, edgecolor=SURF, linewidth=1, zorder=3)
for x, y, t in zip(loss, luc, yr):
    if t in (2008, 2009, 2010, 2020, 2023):
        ax.annotate(str(t), (x, y), xytext=(5, 2), textcoords="offset points",
                    fontsize=7.5, color=INK2)
ax.set_xlim(0, 215000)
ax.set_ylim(0, 90)
ax.xaxis.set_major_formatter(thousands)
ax.set_xlabel("Annual tree-cover loss (ha yr$^{-1}$)")
ax.set_ylabel("CO$_2$ from land-use change\n(Mt CO$_2$ yr$^{-1}$)")
ax.set_title("Supplementary: land-use-change CO$_2$ against tree-cover loss, 2001–2024",
             loc="left")
save(fig, "fig5_scatter_loss_luc.png")

# residual pattern of the descriptive line (reported in text)
res = co2 - (a + b * loss)
order = np.argsort(loss)
print("residuals by increasing loss:")
for i in order:
    print(yr[i], int(loss[i]), round(res[i], 3))
