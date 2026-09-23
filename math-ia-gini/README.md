# Maths IA: Gini coefficient from cubic Lorenz-curve models

`analysis.py` does every calculation in the IA from one World Bank PIP download:
cumulative Lorenz points, the trapezium-rule benchmark, the unconstrained and
constrained least-squares cubics (with the normal equations), R², residuals,
Lorenz-validity checks (L(0), L(1), L′ ≥ 0, L″ ≥ 0, L(x) ≤ x), exact integrals,
Gini estimates, and absolute/percentage errors against the reported Gini.
It also saves the Lorenz-curve and residual figures.

## Data

No data are committed yet. The IA needs the PIP rows for South Africa (ZAF) and
Norway (NOR), reporting year 2022, downloaded from:

    https://api.worldbank.org/pip/v1/pip?country=ZAF,NOR&year=2022&povline=3&fill_gaps=false&format=csv

Save it as `data/pip_2022.csv` and record the access date and PIP data version.

## Run

    pip install numpy matplotlib
    python3 analysis.py data/pip_2022.csv 2022 ZAF NOR --out output
