# Maths IA (AA SL): Gini coefficient from cubic Lorenz-curve models

`analysis.py` does every calculation in the IA from one World Bank PIP download,
using only methods that can be done by hand or on a GDC at AA SL:

- cumulative Lorenz points and the trapezium-rule benchmark
- Model 1: unconstrained least-squares cubic (the GDC's CubicReg)
- Model 2: cubic with L(0) = 0 and L(1) = 1, written as
  `L(x) = x + β(x² − x) + α(x − ½)(x² − x)` and fitted by two one-variable
  least-squares problems (possible because Σ v_k w_k = 0 for deciles)
- R², residuals, validity checks with L′ and L″, exact integrals, Gini estimates,
  absolute and percentage errors against the reported Gini
- checks that the one-variable method agrees with a general solver and that the
  cubic and quadratic models give the same Gini

`python3 analysis.py --selftest` checks the method on curves with known answers.

## Data

No data are committed yet. The IA uses the PIP rows for South Africa (ZAF) and
Norway (NOR), reporting year 2022:

    https://api.worldbank.org/pip/v1/pip?country=ZAF,NOR&year=2022&povline=3&fill_gaps=false&format=csv

Save it as `data/pip_2022.csv` and record the access date and PIP data version.

## Run

    pip install numpy matplotlib
    python3 analysis.py data/pip_2022.csv 2022 ZAF NOR --out output
