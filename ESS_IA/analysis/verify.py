"""Independent re-check of the key statistics using different routes from analysis.py."""
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats

ROOT = Path(__file__).resolve().parents[1]
df = pd.read_csv(ROOT / "data" / "processed" / "cameroon_2001_2024_matched.csv")
x, y, u = df.tree_cover_loss_ha.to_numpy(float), df.co2_excl_luc_Mt.to_numpy(float), df.co2_land_use_change_Mt.to_numpy(float)

# 1. Spearman = Pearson correlation of the ranks (pandas rank, not scipy)
rs_ranks = np.corrcoef(pd.Series(x).rank(), pd.Series(y).rank())[0, 1]
print(f"Spearman via Pearson-on-ranks: {rs_ranks:.6f}")

# 2. Pandas built-in Spearman
print(f"Spearman via pandas:           {pd.Series(x).corr(pd.Series(y), method='spearman'):.6f}")

# 3. Regression via statsmodels OLS
ols = sm.OLS(y, sm.add_constant(x)).fit()
print(f"OLS intercept {ols.params[0]:.4f}, slope {ols.params[1]:.4e}, R2 {ols.rsquared:.4f}")

# 4. Monte-Carlo permutation check of the 2015-2024 exact p-value
rng = np.random.default_rng(1)
sub = df.year >= 2015
xs, ys = x[sub], y[sub]
obs = stats.spearmanr(xs, ys)[0]
perm = np.array([stats.spearmanr(xs, rng.permutation(ys))[0] for _ in range(20000)])
print(f"2015-2024 rs {obs:.4f}; Monte-Carlo p = {np.mean(np.abs(perm) >= abs(obs) - 1e-12):.4f} (exact 0.0347)")

# 5. First differences with pandas
d = df[["tree_cover_loss_ha", "co2_excl_luc_Mt"]].diff().dropna()
print(f"First-difference Spearman (pandas): {d.corr(method='spearman').iloc[0, 1]:.6f}")

# 6. Land-use-change CO2
print(f"Loss vs LUC Spearman (pandas): {pd.Series(x).corr(pd.Series(u), method='spearman'):.6f}")

# 7. Critical value check: t-based vs large-sample approximation 1.96/sqrt(n-1)
print(f"rs crit (t, n=24): {stats.t.ppf(0.975, 22) / np.sqrt(stats.t.ppf(0.975, 22) ** 2 + 22):.4f}; "
      f"normal approx: {1.96 / np.sqrt(23):.4f}")
