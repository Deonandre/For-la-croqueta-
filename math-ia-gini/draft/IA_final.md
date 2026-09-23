---
title: "Estimating the Gini coefficient with cubic models of the Lorenz curve: South Africa and Norway, 2022"
subtitle: "IB Mathematics: Analysis and Approaches SL, Internal Assessment"
---

**Research question**

*To what extent can cubic polynomial regression models and definite integration of Lorenz curves accurately estimate the Gini coefficient of inequality in South Africa compared to Norway, using 2022 World Bank income and consumption distribution data?*

My first version of this question said "income inequality" and "income distribution data". The World Bank file showed that South Africa's 2022 data measure consumption, not income (Section 2.2), so I changed those words. I also removed "calculus", because "definite integration" already says this. The mathematical aim did not change.

# 1. Introduction

## 1.1 Why I chose this topic

**[PERSONALIZE THIS SECTION IN MY OWN WORDS]**

*Answer honestly and do not invent experiences: Why am I interested in inequality? Where did I first meet the Gini coefficient or the Lorenz curve? Why South Africa and Norway? What did I expect to find?*

The Gini coefficient is the number most often used to compare inequality between countries, but it is usually reported without showing where it comes from. It is defined by an area on a graph, so calculating it is a natural use of integration.

## 1.2 Aim, and what "accurately" means

For both countries, the World Bank calculated the Gini coefficient from thousands of household records, but it publishes much less: the share of total welfare received by each tenth of the population. My aim is to find out whether a cubic regression model, fitted to these ten shares and integrated, gives back the published Gini coefficient.

"Accurately" cannot mean "equal to the true level of inequality", because nobody knows that exactly. Here it means **how close my estimate is to the Gini coefficient that the World Bank published for the same survey**. I judge this in two ways:

1. by the absolute and percentage error compared with the published value;

2. against a **benchmark** that uses no model: joining the data points with straight lines (the trapezium rule). If the cubic is not closer to the published value than simply joining the dots, fitting it has not improved the estimate.

## 1.3 Why compare South Africa and Norway

The two countries are at opposite ends of the inequality range, with published 2022 Gini coefficients of 0.5405 and 0.2695. The reason for comparing them is mathematical. In a very unequal country the Lorenz curve stays flat for most of the population and then rises steeply for the richest group, which a smooth cubic may find hard to follow. Before calculating anything, my prediction was: **the cubic method will be less accurate for South Africa than for Norway.**

**[PERSONALIZE THIS SECTION IN MY OWN WORDS]**

*Why did I make this prediction? Did I expect the Norwegian estimate to be almost exact?*

# 2. Data

## 2.1 Source and checks

The data come from the World Bank's Poverty and Inequality Platform (PIP) (World Bank, 2026). I downloaded one CSV file from the PIP data service with every survey year for South Africa (ZAF) and Norway (NOR), using the setting `fill_gaps=false` so that it contains only years with a real survey. The file has 33 rows: Norway 1979, 1986, 1991, 1995, 2000, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, and South Africa 1993, 2000, 2005, 2008, 2010, 2014, 2022. I use only the 2022 row for each country (Table 1).

|  | South Africa | Norway |
| --- | --- | --- |
| Country code | ZAF | NOR |
| Reporting year | 2022 | 2022 |
| Survey | IES (Income and Expenditure Survey) | EU-SILC (EU Statistics on Income and Living Conditions) |
| Survey year in the file | 2022.85 | 2022 |
| Welfare measure | consumption | income |
| Coverage | national | national |
| Distribution type | micro | micro |
| Interpolated? | no | no |
| Comparable spell | 2005–2022 | 2022–2023 |
| Population (millions) | 63.1 | 5.46 |
| Mean ÷ median welfare | 1.87 | 1.12 |
| Published Gini coefficient | 0.540539 | 0.269463 |

Table: Table 1. Information in the 2022 rows of the PIP file.

Both 2022 rows come from a real national survey (not interpolated) and were calculated by the World Bank from household records (`micro`). Both give all ten decile shares, and for each country the shares are positive, increase from decile 1 to decile 10, and add up to 1. South Africa's survey year is 2022.85: its Income and Expenditure Survey collected data from November 2022 to November 2023 (Statistics South Africa, 2025), and PIP reports it under 2022.

The mean ÷ median row already shows the difference between the countries. In South Africa the mean is 1.87 times the median, compared with 1.12 in Norway, so a small group at the top has very high values.

## 2.2 Are the two countries comparable?

1. **Welfare measure.** South Africa's data measure **consumption** (spending), while Norway's measure **income**. Consumption inequality is usually lower than income inequality, because richer households save part of their income and poorer households may spend more than they earn (Hasell & Arriagada, n.d.).

2. **Survey and timing.** South Africa's survey covers spending from November 2022 to November 2023, while EU-SILC income usually refers to the previous calendar year (World Bank, 2022), so the two reference periods do not match exactly.

These differences matter when comparing the *level* of inequality in the two countries, but not for my main question. I compare each estimate with the published Gini coefficient calculated from **the same survey** as its decile shares, so within each country the comparison is like with like. The file has only one 2022 row for each country, so there is no 2022 income distribution for South Africa to switch to. The most defensible choice is to keep both 2022 datasets, state the welfare measure every time, and change the wording of the research question. From now on, **welfare** means consumption for South Africa and income for Norway.

**Reflection.** I had assumed "World Bank income data" existed for both countries, and checking the file showed that it did not. This changed what I can conclude: I can compare how *accurate* the method is in the two countries, but I must be careful when comparing their *levels* of inequality.

## 2.3 From decile shares to Lorenz points

Each decile is a tenth of the population, ranked from poorest to richest. Let $s_k$ be the share of total welfare received by decile $k$ (decile 1 is the poorest 10%), so $s_1 + \dots + s_{10} = 1$. For $k = 0, 1, \dots, 10$ let

$$x_k = \frac{k}{10}, \qquad L_k = s_1 + s_2 + \dots + s_k, \qquad L_0 = 0 .$$

The point $(x_k, L_k)$ means: *the poorest $100x_k\%$ of the population receive $100L_k\%$ of total welfare.* For South Africa:

$$L_1 = s_1 = 0.013994, \qquad L_2 = L_1 + s_2 = 0.013994 + 0.022703 = 0.036697,$$
$$L_3 = L_2 + s_3 = 0.036697 + 0.030240 = 0.066937, \quad\text{and so on,}$$

and in the same way for Norway (Table 2). For both countries $L_{10} = 1$, which confirms that the shares add up to 1. The end points $(0,0)$ and $(1,1)$ are not measurements: they are true for every country.

| $k$ | $x_k$ | $s_k$ South Africa | $L_k$ South Africa | $s_k$ Norway | $L_k$ Norway |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | – | 0.000000 | – | 0.000000 |
| 1 | 0.1 | 0.013994 | 0.013994 | 0.035404 | 0.035404 |
| 2 | 0.2 | 0.022703 | 0.036697 | 0.055638 | 0.091043 |
| 3 | 0.3 | 0.030240 | 0.066937 | 0.066700 | 0.157742 |
| 4 | 0.4 | 0.038322 | 0.105259 | 0.075406 | 0.233149 |
| 5 | 0.5 | 0.048064 | 0.153324 | 0.084545 | 0.317694 |
| 6 | 0.6 | 0.060239 | 0.213563 | 0.094846 | 0.412539 |
| 7 | 0.7 | 0.079290 | 0.292853 | 0.105995 | 0.518534 |
| 8 | 0.8 | 0.111657 | 0.404510 | 0.119957 | 0.638491 |
| 9 | 0.9 | 0.174173 | 0.578683 | 0.141852 | 0.780344 |
| 10 | 1.0 | 0.421317 | 1.000000 | 0.219656 | 1.000000 |

Table: Table 2. Decile shares $s_k$ and cumulative shares $L_k$, 2022.

**Rounding.** All calculations use the unrounded values from the file. Tables and working show 6 decimal places (d.p.); where a value was calculated at full precision, adding rounded table entries can change its last digit by 1 or 2. Gini coefficients and errors are discussed to 4 d.p.

![Figure 1. Lorenz points for South Africa (consumption) and Norway (income), 2022, joined with straight lines.](output/fig1_lorenz_data.png){width=55%}

The poorest 40% of South Africans receive $L_4 = 0.1053$ of total consumption, compared with $0.2331$ of total income in Norway. The richest 10% receive 42.1% in South Africa and 22.0% in Norway.

# 3. The Lorenz curve and the Gini coefficient

## 3.1 What any Lorenz curve must look like

The Lorenz curve (Lorenz, 1905) shows, for every $x$ from 0 to 1, the share $L(x)$ of total welfare held by the poorest fraction $x$ of the population. A model that breaks the following properties cannot describe a real distribution, however well it fits the points.

1. **End points:** $L(0) = 0$ and $L(1) = 1$.

2. **Increasing:** shares cannot be negative, so $L$ never decreases: $L'(x) \ge 0$.

3. **Concave up:** the gradient of the segment between neighbouring points is
   $$m_k = \frac{L_k - L_{k-1}}{x_k - x_{k-1}} = \frac{s_k}{0.1} = 10\,s_k .$$
   If $P$ people have mean welfare $\mu$ and decile $k$ has mean welfare $\mu_k$, then $s_k = \dfrac{0.1P\mu_k}{P\mu}$, so $m_k = \dfrac{\mu_k}{\mu}$. **The gradient of the Lorenz curve is a group's welfare divided by the national mean.** People are ranked from poorest to richest, so the gradients increase and the curve is concave up: $L''(x) \ge 0$.

4. **Below the line of equality:** a concave-up curve lies below the straight line joining its end points, so $L(x) \le x$.

| Decile $k$ | $10s_k$ South Africa | $10s_k$ Norway |
|-----------|----------------:|----------------:|
| 1 | 0.140 | 0.354 |
| 2 | 0.227 | 0.556 |
| 3 | 0.302 | 0.667 |
| 4 | 0.383 | 0.754 |
| 5 | 0.481 | 0.845 |
| 6 | 0.602 | 0.948 |
| 7 | 0.793 | 1.060 |
| 8 | 1.117 | 1.200 |
| 9 | 1.742 | 1.419 |
| 10 | 4.213 | 2.197 |

Table: Table 3. Gradients $10s_k$ of the segments between neighbouring points.

In both countries the gradients increase with every decile, so the data agree with Property 3. They also have a clear meaning: in South Africa the richest tenth consume on average 4.21 times the national mean and the poorest tenth only 0.14 times; in Norway the values are 2.20 and 0.35.

## 3.2 Deriving the Gini coefficient from an area

If everyone had the same welfare, the Lorenz curve would be the **line of equality** $y = x$. The Gini coefficient $G$ compares the area between $y = x$ and the Lorenz curve with the whole area under $y = x$. Let
$$A = \int_0^1 L(x)\,dx .$$
The area under $y = x$ is $\displaystyle\int_0^1 x\,dx = \left[\frac{x^2}{2}\right]_0^1 = \frac12$, so the area between the curves is $\displaystyle\int_0^1 \big(x - L(x)\big)\,dx = \frac12 - A$, and
$$G = \frac{\frac12 - A}{\frac12} = 1 - 2A = 1 - 2\int_0^1 L(x)\,dx .$$

With perfect equality $A = \frac12$ and $G = 0$; if one person held everything, $A$ would be close to 0 and $G$ close to 1. The limits must be 0 and 1 because $x$ runs from none of the population to all of it: stopping at $x = 0.9$, for example, would leave out the richest 10%, who hold the largest share. PIP publishes $G$ on the scale 0 to 1, and I use this scale throughout.

Since I only know $L$ at 11 points, I cannot integrate it directly. I compare two ways of finding $A$: joining the points with straight lines (Section 4), and fitting a cubic and integrating it exactly (Sections 5 and 6).

# 4. Benchmark: the trapezium rule

Joining neighbouring points gives 10 trapezia of width $h = 0.1$:
$$A_T = \frac{h}{2}\Big[L_0 + 2(L_1 + \dots + L_9) + L_{10}\Big] = 0.05\Big(2\sum_{k=1}^{9} L_k + 1\Big) = 0.05 + 0.1\sum_{k=1}^{9} L_k ,$$
$$G_T = 1 - 2A_T = 0.9 - 0.2\sum_{k=1}^{9} L_k .$$

| | $\sum_{k=1}^{9} L_k$ | $A_T$ | $G_T$ | Published $G$ |
|---|---:|---:|---:|---:|
| South Africa | 1.865822 | 0.236582 | 0.526836 | 0.540539 |
| Norway | 3.184940 | 0.368494 | 0.263012 | 0.269463 |

Table: Table 4. Trapezium-rule estimates.

For example, for South Africa $G_T = 0.9 - 0.2 \times 1.865822 = 0.526836$.

**A prediction I can test.** By Property 3 the true curve is concave up, so between two points it bends *below* the straight segment joining them. Each trapezium includes a little extra area, so $A_T \ge A$ and **$G_T \le G$: the trapezium rule can only underestimate the Gini coefficient.** This is true for both countries ($0.5268 < 0.5405$ and $0.2630 < 0.2695$), which also confirms that the published shares and Gini coefficients are consistent.

If everyone inside a decile had the same welfare, the Lorenz curve would be exactly these straight segments and its Gini coefficient would be $G_T$. So the gap $G - G_T$ (0.0137 for South Africa, 0.0065 for Norway) measures the inequality **inside** the deciles, which ten shares cannot show. I call it the **grouping error**.

**Reflection.** South Africa's grouping error is about 2.1 times Norway's, but as a percentage of $G$ the two are similar (2.54% and 2.39%). To beat this benchmark, a cubic model would have to recover some of the missing inequality by bending *below* the straight segments.

# 5. Model 1: the least-squares cubic

## 5.1 Least squares

For a model $\hat L(x)$ the **residual** at each point is $e_k = L_k - \hat L(x_k)$. Least-squares regression chooses the coefficients that make
$$SS_{res} = \sum_{k=0}^{10} e_k^{\,2}$$
as small as possible. Squaring stops positive and negative residuals cancelling, gives large errors more weight, and makes $SS_{res}$ a smooth function of the coefficients, so its minimum can be found by differentiation (Section 6.3).

## 5.2 Fitting Model 1

Model 1 is the general cubic $\hat L(x) = ax^3 + bx^2 + cx + d$. Minimising $SS_{res}$ with four unknowns at once is beyond AA SL, so I used cubic regression on all 11 points, the same least-squares calculation as a GDC's cubic regression (e.g. CubicReg):

$$\text{South Africa:}\quad \hat L(x) = 2.293642x^3 - 2.093904x^2 + 0.776525x - 0.025619, \qquad R^2 = 0.9869$$
$$\text{Norway:}\quad \hat L(x) = 0.519969x^3 - 0.066764x^2 + 0.540877x - 0.009613, \qquad R^2 = 0.9988$$

I checked this output myself by recalculating the residuals, $SS_{res}$ and
$$R^2 = 1 - \frac{SS_{res}}{SS_{tot}}, \qquad SS_{tot} = \sum_{k=0}^{10}\big(L_k - \bar L\big)^2 ,$$
where $\bar L$ is the mean of the 11 values of $L_k$ (0.260529 for South Africa). Table 5 shows South Africa; Norway is in Table B1 (Appendix B).

| $x_k$ | $L_k$ | $\hat L(x_k)$ | $e_k$ | $e_k^{\,2}$ | $(L_k - \bar L)^2$ |
|-------|------------:|------------:|------------:|-------------:|-------------:|
| 0.0 | 0.000000 | −0.025619 | 0.025619 | 0.00065631 | 0.0678755 |
| 0.1 | 0.013994 | 0.033389 | −0.019394 | 0.00037614 | 0.0607796 |
| 0.2 | 0.036697 | 0.064279 | −0.027582 | 0.00076079 | 0.0501008 |
| 0.3 | 0.066937 | 0.080816 | −0.013879 | 0.00019262 | 0.0374778 |
| 0.4 | 0.105259 | 0.096760 | 0.008499 | 0.00007224 | 0.0241087 |
| 0.5 | 0.153324 | 0.125873 | 0.027450 | 0.00075352 | 0.0114930 |
| 0.6 | 0.213563 | 0.181918 | 0.031645 | 0.00100142 | 0.0022058 |
| 0.7 | 0.292853 | 0.278655 | 0.014198 | 0.00020157 | 0.0010448 |
| 0.8 | 0.404510 | 0.429848 | −0.025338 | 0.00064200 | 0.0207305 |
| 0.9 | 0.578683 | 0.649257 | −0.070574 | 0.00498062 | 0.1012221 |
| 1.0 | 1.000000 | 0.950645 | 0.049355 | 0.00243595 | 0.5468170 |
| **Sum** |  |  |  | **0.0120732** | **0.9238556** |

Table: Table 5. Residuals of Model 1 for South Africa.

South Africa: $$R^2 = 1 - \frac{0.0120732}{0.9238556} = 0.9869$$ Norway: $$R^2 = 1 - \frac{0.0012347}{1.0532298} = 0.9988$$

So Model 1 explains 98.7% and 99.9% of the variation in $L_k$. Judged by $R^2$ alone both fits look excellent, but $R^2$ is a weak test here. The points follow a smooth increasing pattern with no random scatter, so almost any smooth increasing curve scores close to 1. $R^2$ also says nothing about the Lorenz properties or about the *area*, which is what the Gini coefficient depends on.

![Figure 2. South Africa: data points, Model 1 and Model 2 (Model 2 is introduced in Section 6). The right-hand panel zooms in on $0 \le x \le 0.4$.](output/fig2_models_ZAF.png)

![Figure 3. Norway: data points, Model 1 and Model 2. The right-hand panel zooms in on $0 \le x \le 0.4$.](output/fig3_models_NOR.png)

![Figure 4. Residuals of both models, on the same vertical scale for both countries.](output/fig4_residuals.png)

**Residual pattern.** In both countries the residuals of Model 1 have the signs (+, −, −, −, +, +, +, +, −, −, +) (Figure 4): a wave, not random scatter. The data are exact summaries of the survey, not noisy measurements, so the residuals show **where the shape of the cubic is wrong**. The largest is at $x = 0.9$ ($-0.0706$ for South Africa, $-0.0218$ for Norway), where the model lies above the data because it cannot rise steeply enough for the richest group. The South African residuals are about three times the Norwegian ones.

## 5.3 Is Model 1 a Lorenz curve?

- **End points:** $\hat L(0) = d$ and $\hat L(1) = a + b + c + d$.

- **Increasing:** $\hat L'(x) = 3ax^2 + 2bx + c$. For South Africa $\hat L'(x) = 6.880925x^2 - 4.187807x + 0.776525$ has discriminant $(2b)^2 - 4(3a)c = -3.835 < 0$ and a positive leading coefficient, so $\hat L'(x) > 0$ for every $x$. For Norway the discriminant is $-3.357$, so the same holds. Because the model is increasing, its least and greatest values on $[0,1]$ are $\hat L(0)$ and $\hat L(1)$.

- **Concave up:** $\hat L''(x) = 6ax + 2b$. For South Africa $\hat L''(x) = 13.761850x - 4.187807$, which is negative until the point of inflection at $x = -\dfrac{b}{3a} = 0.3043$.

- **Below $y = x$:** $g(x) = \hat L(x) - x$ has one stationary point in $[0,1]$ (solving $g'(x) = 3ax^2 + 2bx + c - 1 = 0$), at $x = 0.658$ for South Africa and $x = 0.587$ for Norway. There $g''(x) = 6ax + 2b > 0$, so it is a minimum, and the greatest value of $g$ is at an end point. For South Africa $g(0) = -0.0256$ and $g(1) = -0.0494$ are both negative, so $\hat L(x) < x$ on $[0,1]$. The same holds for Norway.

| Property | Required | South Africa | Norway |
|---------------|---------------|-----------------------------------|-----------------------------------|
| $\hat L(0)$ | $0$ | $-0.025619$ | $-0.009613$ |
| $\hat L(1)$ | $1$ | $0.950645$ | $0.984468$ |
| Values on $[0, 1]$ | $0 \le \hat L(x) \le 1$ | $-0.0256 \le \hat L(x) \le 0.9506$; negative for $0 \le x < 0.0364$ | $-0.0096 \le \hat L(x) \le 0.9845$; negative for $0 \le x < 0.0178$ |
| Increasing | $\hat L'(x) \ge 0$ | discriminant of $\hat L'$ is $-3.835 < 0$: increasing | discriminant of $\hat L'$ is $-3.357 < 0$: increasing |
| Concave up | $\hat L''(x) \ge 0$ | $\hat L''(0) = -4.188 < 0$: concave down for $0 \le x < 0.3043$ | $\hat L''(0) = -0.134 < 0$: concave down for $0 \le x < 0.0428$ |
| Below the line of equality | $\hat L(x) \le x$ | largest value of $\hat L(x) - x$ is $-0.0256$ (at $x = 0$): below $y = x$ | largest value of $\hat L(x) - x$ is $-0.0096$ (at $x = 0$): below $y = x$ |

Table: Table 6. Model 1 compared with the properties of a Lorenz curve.

Model 1 fails three of the five tests in both countries.

1. It misses $(0,0)$ and $(1,1)$. For South Africa $\hat L(1) = 0.9506$, so the model's population holds only 95.1% of its own welfare.

2. It is negative for the poorest 3.6% of South Africans and the poorest 1.8% of Norwegians, which is impossible.

3. It is concave down at the start. Since $\hat L'(x)$ is the welfare of the person at $x$ divided by the mean, a falling gradient says that South Africans around the 30th percentile have *less* than the very poorest people, which contradicts the ranking. This wrong section covers the poorest 30% of South Africans but only the poorest 4% of Norwegians.

## 5.4 Integrating Model 1

$$\int_0^1 \big(ax^3 + bx^2 + cx + d\big)\,dx = \left[\frac{ax^4}{4} + \frac{bx^3}{3} + \frac{cx^2}{2} + dx\right]_0^1 = \frac a4 + \frac b3 + \frac c2 + d ,$$
because every term is 0 at $x = 0$. So
$$G_1 = 1 - 2\left(\frac a4 + \frac b3 + \frac c2 + d\right).$$

South Africa: $$A_1 = 0.5734104 - 0.6979679 + 0.3882626 - 0.0256185 = 0.2380866,$$ $$G_1 = 1 - 2(0.2380866) = 0.523827$$
Norway: $$A_1 = 0.1299923 - 0.0222548 + 0.2704383 - 0.0096132 = 0.3685626,$$ $$G_1 = 1 - 2(0.3685626) = 0.262875$$

Both estimates are below the published values, by 0.0167 and 0.0066. However, $G = 1 - 2A$ assumes $L(1) = 1$, and Model 1 has $\hat L(1) < 1$, so $G_1$ is not really the Gini coefficient of the curve it describes.

**Reflection.** Model 1 has a high $R^2$ and gives a Gini estimate close to the benchmark, but it is not a Lorenz curve: it goes below zero, misses both end points and is concave down where it should be concave up. A good fit to 11 points does not make a valid Lorenz curve, so I decided to build the end points into the model.

**[PERSONALIZE THIS SECTION IN MY OWN WORDS]**

*What did I think when the model went below zero even though $R^2$ was so high? Did this change how I think about $R^2$?*

# 6. Model 2: a cubic through (0, 0) and (1, 1)

## 6.1 Building in the end points

$\hat L(0) = 0$ gives $d = 0$, and $\hat L(1) = 1$ gives $a + b + c = 1$, so $c = 1 - a - b$ and
$$\hat L(x) = ax^3 + bx^2 + (1 - a - b)x = x + a(x^3 - x) + b(x^2 - x).$$
The regression functions on a GDC cannot fit a cubic with these conditions, so I fitted it by hand. The key step is a rewrite. Since $x^3 - x = (x^2 - x)(x + 1)$ and $x + 1 = \left(x - \frac12\right) + \frac32$,
$$x^3 - x = \left(x - \tfrac12\right)(x^2 - x) + \tfrac32(x^2 - x).$$
With
$$v(x) = x^2 - x, \qquad w(x) = \left(x - \tfrac12\right)(x^2 - x), \qquad \beta = b + \tfrac32 a, \qquad \alpha = a ,$$
the model becomes
$$\hat L(x) = x + \beta\, v(x) + \alpha\, w(x).$$
This is the same family of cubics with different coefficients. To return to the usual form,
$$a = \alpha, \qquad b = \beta - \tfrac32\alpha, \qquad c = 1 - \beta + \tfrac12\alpha .$$

**Symmetry about $x = \frac12$.** $v(1 - x) = (1-x)^2 - (1-x) = x^2 - x = v(x)$, and $w(1-x) = \left(\frac12 - x\right)v(1-x) = -w(x)$. So $v$ is symmetric about $x = \frac12$, and $w$ is antisymmetric: positive on $\left(0, \frac12\right)$ and negative on $\left(\frac12, 1\right)$ with the same shape (Figure 5).

![Figure 5. The two building blocks of Model 2. The shaded areas under $w(x)$ are equal in size and opposite in sign; the dots mark $x = 0, 0.1, \dots, 1$.](output/fig5_symmetry.png){width=62%}

## 6.2 The Gini coefficient of Model 2 depends only on $\beta$

$$\int_0^1 v(x)\,dx = \int_0^1 (x^2 - x)\,dx = \frac13 - \frac12 = -\frac16 ,$$
$$\int_0^1 w(x)\,dx = \int_0^1 \left(x^3 - \tfrac32 x^2 + \tfrac12 x\right)dx = \frac14 - \frac12 + \frac14 = 0 ,$$
so
$$\int_0^1 \hat L(x)\,dx = \frac12 + \beta\left(-\frac16\right) + \alpha(0) = \frac12 - \frac{\beta}{6}, \qquad G_2 = 1 - 2\left(\frac12 - \frac\beta6\right) = \frac{\beta}{3} .$$
Whatever the value of $\alpha$, the cubic term $\alpha w(x)$ adds as much area on one side of $x = \frac12$ as it removes on the other, so **it cannot change the Gini coefficient**.

## 6.3 Least squares by hand

Let $z_k = L_k - x_k$ (the gap below the line of equality), $v_k = v(x_k)$ and $w_k = w(x_k)$. Then $e_k = z_k - \beta v_k - \alpha w_k$, so $SS_{res} = \sum \big(z_k - \beta v_k - \alpha w_k\big)^2$. Expanding the bracket and adding term by term:
$$SS_{res} = \sum z_k^2 - 2\beta\sum v_k z_k - 2\alpha\sum w_k z_k + \beta^2\sum v_k^2 + 2\alpha\beta\sum v_k w_k + \alpha^2\sum w_k^2 .$$

**The mixed term is zero.** The $x$-values are symmetric about $\frac12$ ($x_{10-k} = 1 - x_k$), so $v_{10-k} = v_k$ and $w_{10-k} = -w_k$, and therefore $v_k w_k + v_{10-k}w_{10-k} = 0$. The terms cancel in the pairs $(1,9), (2,8), (3,7), (4,6)$, and the rest are zero because $v_0 = v_{10} = w_5 = 0$ (Table 7). So
$$SS_{res} = \Big(\beta^2\sum v_k^2 - 2\beta\sum v_k z_k\Big) + \Big(\alpha^2\sum w_k^2 - 2\alpha\sum w_k z_k\Big) + \sum z_k^2 .$$
The first bracket contains only $\beta$ and the second only $\alpha$. The brackets share no variable, so $SS_{res}$ is smallest when each bracket is smallest. Each is a quadratic with positive leading coefficient, so its minimum is where its derivative is zero:
$$\frac{d}{d\beta}\Big(\beta^2\sum v_k^2 - 2\beta\sum v_k z_k\Big) = 2\beta\sum v_k^2 - 2\sum v_k z_k = 0 \quad\Longrightarrow\quad \beta = \frac{\sum v_k z_k}{\sum v_k^2},$$
and in the same way
$$\alpha = \frac{\sum w_k z_k}{\sum w_k^2}.$$
The second derivatives $2\sum v_k^2$ and $2\sum w_k^2$ are positive, confirming minimum points. $\sum v_k^2$ and $\sum w_k^2$ depend only on the $x$-values:

| $x_k$ | $v_k$ | $w_k$ | $v_k^2$ | $w_k^2$ | $v_k w_k$ |
|---:|---:|---:|---:|---:|---:|
| 0   | 0     | 0      | 0      | 0        | 0 |
| 0.1 | −0.09 | 0.036  | 0.0081 | 0.001296 | −0.00324 |
| 0.2 | −0.16 | 0.048  | 0.0256 | 0.002304 | −0.00768 |
| 0.3 | −0.21 | 0.042  | 0.0441 | 0.001764 | −0.00882 |
| 0.4 | −0.24 | 0.024  | 0.0576 | 0.000576 | −0.00576 |
| 0.5 | −0.25 | 0      | 0.0625 | 0        | 0 |
| 0.6 | −0.24 | −0.024 | 0.0576 | 0.000576 | 0.00576 |
| 0.7 | −0.21 | −0.042 | 0.0441 | 0.001764 | 0.00882 |
| 0.8 | −0.16 | −0.048 | 0.0256 | 0.002304 | 0.00768 |
| 0.9 | −0.09 | −0.036 | 0.0081 | 0.001296 | 0.00324 |
| 1   | 0     | 0      | 0      | 0        | 0 |
| **Sum** | | | **0.3333** | **0.01188** | **0** |

Table: Table 7. Exact values of $v_k$ and $w_k$, the same for both countries.

So $\beta = \dfrac{\sum v_k z_k}{0.3333}$, $\alpha = \dfrac{\sum w_k z_k}{0.01188}$ and $G_2 = \dfrac{\beta}{3}$. At every interior point $v_k < 0$ and $z_k < 0$, so $\beta > 0$ and $G_2 > 0$, as it should be. Because $w$ is positive for $x < \frac12$ and negative for $x > \frac12$, $\alpha > 0$ when the data sag further below $y = x$ in the upper half. So **$\beta$ measures how much inequality there is, and $\alpha$ measures where it is concentrated.** These sums can be found on a GDC with lists, using sum($v$ list × $z$ list).

## 6.4 Results for Model 2

| $x_k$ | $z_k = L_k - x_k$ | $v_k z_k$ | $w_k z_k$ |
|---------|----------------:|----------------:|----------------:|
| 0.0 | 0.000000 | 0.0000000 | 0.00000000 |
| 0.1 | −0.086006 | 0.0077405 | −0.00309621 |
| 0.2 | −0.163303 | 0.0261285 | −0.00783854 |
| 0.3 | −0.233063 | 0.0489431 | −0.00978863 |
| 0.4 | −0.294741 | 0.0707377 | −0.00707377 |
| 0.5 | −0.346676 | 0.0866691 | 0.00000000 |
| 0.6 | −0.386437 | 0.0927449 | 0.00927449 |
| 0.7 | −0.407147 | 0.0855009 | 0.01710017 |
| 0.8 | −0.395490 | 0.0632784 | 0.01898352 |
| 0.9 | −0.321317 | 0.0289185 | 0.01156740 |
| 1.0 | 0.000000 | 0.0000000 | 0.00000000 |
| **Sum** |  | **0.5106615** | **0.02912842** |

Table: Table 8. Sums for Model 2, South Africa (Norway: Table B2).

$$\text{South Africa:}\quad \beta = \frac{0.5106615}{0.3333} = 1.532138, \qquad \alpha = \frac{0.02912842}{0.01188} = 2.451887$$
$$\text{Norway:}\quad \beta = \frac{0.2584506}{0.3333} = 0.775429, \qquad \alpha = \frac{0.00664599}{0.01188} = 0.559427$$

For South Africa, $a = \alpha$, $b = \beta - 1.5\alpha = 1.5321378 - 1.5(2.4518870) = -2.145693$ and $c = 1 - \beta + 0.5\alpha = 0.693806$. Doing the same for Norway:

$$\text{South Africa:}\quad \hat L(x) = 2.451887x^3 - 2.145693x^2 + 0.693806x, \qquad R^2 = 0.9823$$
$$\text{Norway:}\quad \hat L(x) = 0.559427x^3 - 0.063711x^2 + 0.504284x, \qquad R^2 = 0.9984$$

I checked the hand method against a general least-squares calculation that does not use $\sum v_k w_k = 0$ (Appendix D). The coefficients agreed to at least 12 d.p.

**Gini coefficient.**
South Africa: $$G_2 = \frac{\beta}{3} = \frac{1.532138}{3} = 0.510713$$ Norway: $$G_2 = \frac{0.775429}{3} = 0.258476$$
Integrating the usual form gives the same result. For South Africa, $A_2 = \frac a4 + \frac b3 + \frac c2 = 0.6129717 - 0.7152309 + 0.3469029 = 0.2446437$, so $G_2 = 1 - 2(0.2446437) = 0.510713$. For Norway, $A_2 = 0.1398567 - 0.0212369 + 0.2521420 = 0.3707618$, so $G_2 = 0.258476$.

## 6.5 Is Model 2 a Lorenz curve?

- **End points:** correct by construction.

- **Increasing:** for South Africa $\hat L'(x) = 7.355661x^2 - 4.291385x + 0.693806$ has discriminant $-1.998 < 0$ (Norway: $-3.369$), so $\hat L'(x) > 0$. Rising from 0 to 1, the model stays between 0 and 1.

- **Below $y = x$:** $\hat L(x) - x = (x^2 - x)\left[\beta + \alpha\left(x - \frac12\right)\right]$. For $0 < x < 1$, $x^2 - x < 0$, and since $\alpha > 0$ the square bracket is always greater than $\beta - \frac\alpha2$, which is $0.3062$ for South Africa and $0.4957$ for Norway. Both are positive, so $\hat L(x) < x$.

- **Concave up:** $\hat L''(0) = 2b < 0$ in both countries, so the model is concave down until the point of inflection $x = -\frac{b}{3a}$.

| Property | Required | South Africa | Norway |
|---------------|---------------|-----------------------------------|-----------------------------------|
| $\hat L(0)$ | $0$ | $0.000000$ | $0.000000$ |
| $\hat L(1)$ | $1$ | $1.000000$ | $1.000000$ |
| Values on $[0, 1]$ | $0 \le \hat L(x) \le 1$ | $0.0000 \le \hat L(x) \le 1.0000$; never negative | $0.0000 \le \hat L(x) \le 1.0000$; never negative |
| Increasing | $\hat L'(x) \ge 0$ | discriminant of $\hat L'$ is $-1.998 < 0$: increasing | discriminant of $\hat L'$ is $-3.369 < 0$: increasing |
| Concave up | $\hat L''(x) \ge 0$ | $\hat L''(0) = -4.291 < 0$: concave down for $0 \le x < 0.2917$ | $\hat L''(0) = -0.127 < 0$: concave down for $0 \le x < 0.0380$ |
| Below the line of equality | $\hat L(x) \le x$ | $\hat L(x) - x < 0$ for $0 < x < 1$: below $y = x$ | $\hat L(x) - x < 0$ for $0 < x < 1$: below $y = x$ |

Table: Table 9. Model 2 compared with the properties of a Lorenz curve.

Model 2 passes four of the five tests, but for South Africa it is concave down for the poorest 29% of the population. Its gradient at $x = 0$ is $0.694$: it says the poorest person consumes about 69% of the national mean, while the data say the poorest tenth consume on average only 14% of the national mean (Table 3).

**Reflection.** Model 2 is a better Lorenz function than Model 1, yet its Gini estimates (0.5107 and 0.2585) are *further* from the published values. The two curves are almost identical in the middle and differ near the ends (Figures 2 and 3). There, Model 1 is free to drop below $(0,0)$ and $(1,1)$, which lowers its area by 0.0066 for South Africa and raises its Gini estimate by 0.0131. So part of Model 1's better accuracy comes from **breaking** the end-point conditions: its closer answer is partly right for the wrong reason.

## 6.6 Discovery: the cubic term cannot change the Gini estimate

The constrained quadratic $\hat L(x) = x + b\,v(x) = bx^2 + (1 - b)x$ is Model 2 with $\alpha = 0$. Its $SS_{res}$ is just the $\beta$ bracket plus $\sum z_k^2$, so least squares gives exactly $b = \dfrac{\sum v_k z_k}{\sum v_k^2} = \beta$, and its Gini coefficient is $1 - 2\int_0^1 (x + \beta v)\,dx = \dfrac\beta3 = G_2$.

**With equally spaced deciles, the least-squares constrained cubic and the least-squares constrained quadratic always give exactly the same Gini coefficient.** The proof uses only the symmetry of the $x$-values and $\int_0^1 w(x)\,dx = 0$, so it does not depend on the country. The same idea shows that Model 1 gives the same Gini estimate as an unconstrained quadratic (Appendix C).

I checked this with the 2022 data. The constrained quadratics are $\hat L = 1.532138x^2 - 0.532138x$ (South Africa) and $\hat L = 0.775429x^2 + 0.224571x$ (Norway). The unconstrained quadratics are $\hat L = 1.346559x^2 - 0.535438x + 0.056953$ and $\hat L = 0.713189x^2 + 0.243454x + 0.009106$.

| Country | Model | $R^2$ | Valid Lorenz curve? | Gini estimate |
|------------|--------------------------|----------:|------------------------------------|-----------:|
| South Africa | Constrained quadratic | 0.9050 | no: negative near 0, decreasing near 0 | 0.510713 |
| South Africa | Model 2 (constrained cubic) | 0.9823 | no: concave down near 0 | 0.510713 |
| South Africa | Unconstrained quadratic | 0.9518 | no: decreasing near 0, misses end points | 0.523827 |
| South Africa | Model 1 (unconstrained cubic) | 0.9869 | no: negative near 0, misses end points, concave down near 0 | 0.523827 |
| Norway | Constrained quadratic | 0.9949 | yes: end points, increasing, concave up | 0.258476 |
| Norway | Model 2 (constrained cubic) | 0.9984 | no: concave down near 0 | 0.258476 |
| Norway | Unconstrained quadratic | 0.9972 | no: misses end points | 0.262875 |
| Norway | Model 1 (unconstrained cubic) | 0.9988 | no: negative near 0, misses end points, concave down near 0 | 0.262875 |

Table: Table 10. Cubic and quadratic models fitted to the same data.

Each cubic gives the same Gini estimate as its quadratic, to at least 14 d.p. (the remaining difference is rounding in the computer). South Africa shows this most clearly. Adding the cubic term raises $R^2$ from 0.9050 to 0.9823 and turns a curve that is negative for $0 < x < 0.3473$ into one that is never negative, but the Gini estimate does not change at all. For Norway, the constrained quadratic is the only one of the four models that passes every test, and it gives exactly the same Gini estimate as Model 2.

**Reflection.** This changed how I understand my research question. The word "cubic" suggests that the cubic term improves the estimate, but for decile data it cannot affect the Gini estimate: the estimate is decided entirely by the symmetric part $\beta v(x)$. The cubic term only improves the *shape*. It also proves that $R^2$ does not measure the accuracy of the Gini estimate, because $R^2$ changed from 0.90 to 0.98 with no change in $G$.

**[PERSONALIZE THIS SECTION IN MY OWN WORDS]**

*What did I expect before comparing the quadratic and the cubic? What did I think when the two estimates came out identical?*

# 7. Accuracy of the estimates

## 7.1 Errors compared with the published values

| Method | SA estimate | SA error | SA % error | Norway estimate | Norway error | Norway % error |
|-----------------------|-----------:|-----------:|----------:|-----------:|-----------:|----------:|
| Published (PIP) | 0.5405 | – | – | 0.2695 | – | – |
| Trapezium rule | 0.5268 | −0.0137 | 2.54% | 0.2630 | −0.0065 | 2.39% |
| Model 1 | 0.5238 | −0.0167 | 3.09% | 0.2629 | −0.0066 | 2.44% |
| Model 2 | 0.5107 | −0.0298 | 5.52% | 0.2585 | −0.0110 | 4.08% |

Table: Table 11. Gini estimates and errors (error = estimate − published value; % error = |error| ÷ published value × 100%).

For example, for Model 1 in South Africa the error is $0.523827 - 0.540539 = -0.0167$, and the percentage error is $\dfrac{0.016713}{0.540539} \times 100\%$, which is 3.09%.

1. **Every estimate is too low**, in both countries and for all three methods.

2. **The trapezium rule is the most accurate**, then Model 1, then Model 2, in both countries. For Norway, Model 1 is almost as good as the benchmark (the difference is only 0.0001).

3. **Every method keeps the order and roughly the same ratio.** The published South African value is 2.01 times the Norwegian one; the estimates give 2.00, 1.99 and 1.98.

4. **Every estimate is correct to 1 d.p.** (0.5 and 0.3), **but none is correct to 2 d.p.**

**Which error measure is more meaningful?** The absolute error is better for judging a single estimate, because $G$ is already a proportion and countries are compared by differences in $G$. The percentage error is better for comparing the *method* between the two countries, since the same absolute error is about twice as serious for Norway's smaller $G$. I therefore use both.

## 7.2 Where the errors come from

Each total error splits into two parts:
$$G_{\text{model}} - G = (G_T - G) + (G_{\text{model}} - G_T),$$
where the left-hand side is the total error, the first bracket is the grouping error (the same for every method) and the second bracket is the model error (caused by the shape of the model, compared with straight segments).

| Country | Method | Grouping error $G_T - G$ | Model error $G_{\text{model}} - G_T$ | Total error $G_{\text{model}} - G$ |
|-------------|----------:|------------------:|----------------------:|--------------------:|
| South Africa | Model 1 | −0.0137 | −0.0030 | −0.0167 |
| South Africa | Model 2 | −0.0137 | −0.0161 | −0.0298 |
| Norway | Model 1 | −0.0065 | −0.0001 | −0.0066 |
| Norway | Model 2 | −0.0065 | −0.0045 | −0.0110 |

Table: Table 12. Grouping error and model error.

For Norway, Model 1's model error is almost zero, so nearly all its error comes from the grouped data. For South Africa, Model 2's model error is even larger than the grouping error. All the model errors are negative: on average the cubics lie *above* the straight segments, the opposite of what was needed to recover the missing inequality (Section 4).

## 7.3 Why the cubic models underestimate

Because the true curve is concave up, its gradient at $x = 0$ cannot be larger than the average gradient of the first segment, and its gradient at $x = 1$ cannot be smaller than the average gradient of the last segment: $L'(0) \le 10s_1$ and $L'(1) \ge 10s_{10}$.

|  | South Africa | Norway |
|-----------------------------------------|------------:|------------:|
| Data: average gradient of first segment, $10s_1$ | 0.1399 | 0.3540 |
| Model 1: $\hat L'(0)$ | 0.7765 | 0.5409 |
| Model 2: $\hat L'(0)$ | 0.6938 | 0.5043 |
| Data: average gradient of last segment, $10s_{10}$ | 4.2132 | 2.1966 |
| Model 1: $\hat L'(1)$ | 3.4696 | 1.9673 |
| Model 2: $\hat L'(1)$ | 3.7581 | 2.0551 |

Table: Table 13. Gradients at the ends of the curve.

![Figure 6. The gradient of each model, $d\hat L/dx$, compared with the average gradient $10s_k$ of each data segment.](output/fig6_gradients.png)

Both models break **both** conditions in both countries. For South Africa, Model 1's gradient at $x = 0$ is 5.5 times the largest value it could have, and both models are too flat at $x = 1$. In words, **the cubics make the poorest people look better off, and the richest less rich, than the data show.** A curve that rises too fast at the start and too slowly at the end lies above the data near both ends (the negative residuals at $x = 0.1, 0.2, 0.8, 0.9$ in Figure 4), so its area is too large and its Gini estimate too small.

This comes from the shape of a cubic. $\hat L''(x) = 6ax + 2b$ is linear, so a cubic's gradient can only change in a limited way. A real Lorenz curve, especially South Africa's, is almost flat for most of the population and very steep for the last 10%: the richest decile holds 42.1% of consumption, and inside that decile the curve is steeper still. A cubic cannot follow this.

## 7.4 South Africa compared with Norway

My prediction was that the method would be less accurate for South Africa, and the results support it.

- South Africa's absolute errors are 2.1 (trapezium), 2.5 (Model 1) and 2.7 (Model 2) times Norway's.

- The percentage errors of both cubic models are also larger for South Africa (3.09% against 2.44% for Model 1, 5.52% against 4.08% for Model 2), while for the trapezium rule they are almost equal.

- The choice of method matters more: the three South African estimates span 0.0161, compared with 0.0045 for Norway.

So the grouping error grows roughly in proportion to $G$, while the model error grows much faster: a more strongly curved Lorenz curve is harder for a cubic to follow. Model 1 also had a higher $R^2$ for Norway (0.9988) than for South Africa (0.9869) and was more accurate there, but Section 6.6 showed that this link is not reliable. A high $R^2$ is needed for a good estimate but does not guarantee one.

# 8. Evaluation and limitations

**Strengths.** Every integral was calculated exactly. Model 2 was derived and fitted entirely with AA SL methods (expanding a sum and minimising a quadratic) and checked against a general calculation. The trapezium benchmark gave a fair meaning to "accurately", and its prediction $G_T \le G$ was confirmed. Every model was tested against the properties of a Lorenz curve instead of being judged by $R^2$.

**Limitations and their effect on the results.**

1. **Only 11 points.** Ten shares cannot show inequality inside each decile, so any estimate built only from straight segments is too low, by 0.0137 (South Africa) and 0.0065 (Norway). A smooth model can only do better by bending the right way between the points, and the cubics bent the wrong way.

2. **The top decile.** The largest residuals are at $x = 0.9$, and the models are too flat at $x = 1$. This is where the models fit worst, and since the richest 10% hold 42.1% of South African consumption, the effect is much larger for South Africa.

3. **The limited shape of a cubic.** $\hat L''$ is linear, so a cubic has at most one point of inflection and cannot be very steep at the top while also curving correctly at the bottom. All four fitted cubics were concave down near $x = 0$.

4. **What least squares measures.** It minimises vertical distances at 11 points and treats them as independent, but each $L_k$ contains all earlier shares, so one error affects every later point. The smallest $SS_{res}$ is also not the smallest error in *area* (Section 6.6).

5. **Symmetric data.** With equally spaced deciles the cubic term cannot change the Gini estimate, so for this kind of data the "cubic" part of the method affects only the shape.

6. **The published value is an estimate too.** The World Bank's $G$ comes from a sample survey, so "accurate" here means close to the published value, not to the true population value.

7. **Different welfare measures.** Consumption and income are different (Section 2.2). This does not affect the accuracy comparison, but the two published Gini coefficients should not be treated as measuring the same thing.

8. **Rounding.** The file gives shares to 12 d.p. and I kept full precision, so rounding affects only the 6th or 7th d.p., far below the errors being studied.

9. **Data revisions.** PIP is updated regularly; the September 2026 update revised one earlier estimate (PIP Technical Team, 2026). My results apply to the data I downloaded.

**Possible extension.** A model that can become very steep near $x = 1$ might suit South Africa better, for example $L(x) = x^p$ with $p > 1$. It passes through $(0,0)$ and $(1,1)$, is increasing and concave up, has $G = 1 - 2\int_0^1 x^p\,dx = \frac{p-1}{p+1}$, and could be fitted with logarithms ($\ln L = p\ln x$). I did not do this because my question is about cubic models.

# 9. Conclusion

**To what extent can cubic polynomial regression models and definite integration of Lorenz curves accurately estimate the Gini coefficient of inequality in South Africa compared to Norway?**

**To a limited extent.** The method gives the right general picture: the cubic estimates are within 2.4% to 5.5% of the published values, correct to 1 d.p., and they show that South Africa's Gini coefficient is about twice Norway's. They are not correct to 2 d.p., and they do not beat a simpler method.

- **South Africa (consumption):** published $G = 0.5405$. Model 1 gave 0.5238 (error $-0.0167$, 3.09%) and Model 2 gave 0.5107 (error $-0.0298$, 5.52%).

- **Norway (income):** published $G = 0.2695$. Model 1 gave 0.2629 (error $-0.0066$, 2.44%) and Model 2 gave 0.2585 (error $-0.0110$, 4.08%).

- **Model fit:** every cubic had $R^2 > 0.98$, but Model 1 is not a valid Lorenz curve, and both models are concave down for the poorest part of the population.

- **Against the benchmark:** the trapezium rule, using the same data and no model, was more accurate than both cubics in both countries (2.54% and 2.39%).

- **Between the countries:** as predicted, the method is less accurate for South Africa, with errors 2 to 3 times larger than Norway's, because its Lorenz curve is much more strongly curved.

Three things limit the accuracy. The grouped data hide inequality inside each decile, which makes every estimate too low. A cubic cannot be steep enough at the top or flat enough at the bottom, which adds a further underestimate that grows with inequality. And with equally spaced deciles the cubic term has no effect on the Gini estimate at all, which I proved and then confirmed with the data. The most important thing I learned is that a model can fit the points very well and still describe something impossible, so the mathematical properties of a model matter more than its $R^2$. These results come from one year and two countries with different welfare measures, so I would not claim that they hold for every country. They do suggest that a cubic model of decile data will underestimate the Gini coefficient, especially in very unequal countries.

**[PERSONALIZE THIS SECTION IN MY OWN WORDS]**

*What did I learn about inequality or about modelling that I did not know before? What would I investigate next?*

# References

Hasell, J., & Arriagada, P. (n.d.). *Data on poverty by the World Bank Poverty and Inequality Platform* [Dataset documentation]. Our World in Data. https://github.com/owid/poverty-data/blob/main/datasets/pip_README.md

Lorenz, M. O. (1905). Methods of measuring the concentration of wealth. *Publications of the American Statistical Association, 9*(70), 209–219. https://doi.org/10.2307/2276207

PIP Technical Team. (2026, September 22). *PIP data update on September 22, 2026*. World Bank. https://worldbank.github.io/PIP_data_updates/posts/2026-09-22-pip-data-update/

Statistics South Africa. (2025). *Income & Expenditure Survey (IES) 2022/2023*. https://www.statssa.gov.za/?p=17995

World Bank. (2022). *Poverty and Inequality Platform methodology handbook* (Version 2022-04). https://worldbank.github.io/PIP-Methodology-2022-04/

World Bank. (2026). *Poverty and Inequality Platform* (Version September 2026) [Data set]. Retrieved September 23, 2026, from https://api.worldbank.org/pip/v1/pip?country=ZAF,NOR&year=all&povline=3&fill_gaps=false&format=csv

# Appendix A. The 2022 data

Unrounded values exactly as they appear in the PIP file (proportions of total welfare).

| Decile | South Africa (consumption share) | Norway (income share) |
| --- | ---: | ---: |
| 1 | 0.013994143657 | 0.035404242774 |
| 2 | 0.022702991814 | 0.055638274951 |
| 3 | 0.030240249515 | 0.06669976611 |
| 4 | 0.038322059254 | 0.075406325589 |
| 5 | 0.048064304483 | 0.084545222233 |
| 6 | 0.060239368747 | 0.094845614624 |
| 7 | 0.079289977086 | 0.105994668818 |
| 8 | 0.111656972678 | 0.119957373992 |
| 9 | 0.174173363258 | 0.141852274705 |
| 10 | 0.421316569508 | 0.219656236204 |
| Gini | 0.540539467389 | 0.269462535375 |

Table: Table A1. Decile shares and published Gini coefficients, 2022.

# Appendix B. Norway working and Model 2 residuals

| $x_k$ | $L_k$ | $\hat L(x_k)$ | $e_k$ | $e_k^{\,2}$ | $(L_k - \bar L)^2$ |
|-------|------------:|------------:|------------:|-------------:|-------------:|
| 0.0 | 0.000000 | −0.009613 | 0.009613 | 0.00009241 | 0.1447415 |
| 0.1 | 0.035404 | 0.044327 | −0.008923 | 0.00007961 | 0.1190560 |
| 0.2 | 0.091043 | 0.100051 | −0.009009 | 0.00008116 | 0.0837562 |
| 0.3 | 0.157742 | 0.160680 | −0.002938 | 0.00000863 | 0.0495983 |
| 0.4 | 0.233149 | 0.229333 | 0.003815 | 0.00001456 | 0.0216974 |
| 0.5 | 0.317694 | 0.309130 | 0.008564 | 0.00007334 | 0.0039382 |
| 0.6 | 0.412539 | 0.403191 | 0.009348 | 0.00008739 | 0.0010298 |
| 0.7 | 0.518534 | 0.514635 | 0.003899 | 0.00001520 | 0.0190675 |
| 0.8 | 0.638491 | 0.646583 | −0.008092 | 0.00006547 | 0.0665859 |
| 0.9 | 0.780344 | 0.802154 | −0.021810 | 0.00047569 | 0.1599157 |
| 1.0 | 1.000000 | 0.984468 | 0.015532 | 0.00024124 | 0.3838433 |
| **Sum** |  |  |  | **0.0012347** | **1.0532298** |

Table: Table B1. Residuals of Model 1 for Norway ($\bar L = 0.380449$).

| $x_k$ | $z_k = L_k - x_k$ | $v_k z_k$ | $w_k z_k$ |
|---------|----------------:|----------------:|----------------:|
| 0.0 | 0.000000 | 0.0000000 | 0.00000000 |
| 0.1 | −0.064596 | 0.0058136 | −0.00232545 |
| 0.2 | −0.108957 | 0.0174332 | −0.00522996 |
| 0.3 | −0.142258 | 0.0298741 | −0.00597482 |
| 0.4 | −0.166851 | 0.0400443 | −0.00400443 |
| 0.5 | −0.182306 | 0.0455765 | 0.00000000 |
| 0.6 | −0.187461 | 0.0449905 | 0.00449905 |
| 0.7 | −0.181466 | 0.0381078 | 0.00762157 |
| 0.8 | −0.161509 | 0.0258414 | 0.00775241 |
| 0.9 | −0.119656 | 0.0107691 | 0.00430762 |
| 1.0 | 0.000000 | 0.0000000 | 0.00000000 |
| **Sum** |  | **0.2584506** | **0.00664599** |

Table: Table B2. Sums for Model 2, Norway.

| $x_k$ | $\hat L(x_k)$ SA | $e_k$ SA | $\hat L(x_k)$ Norway | $e_k$ Norway |
| ---: | ---: | ---: | ---: | ---: |
| 0.0 | 0.000000 | 0.000000 | 0.000000 | 0.000000 |
| 0.1 | 0.050376 | −0.036381 | 0.050351 | −0.014946 |
| 0.2 | 0.072549 | −0.035851 | 0.102784 | −0.011741 |
| 0.3 | 0.081230 | −0.014293 | 0.160656 | −0.002913 |
| 0.4 | 0.091132 | 0.014127 | 0.227323 | 0.005825 |
| 0.5 | 0.116966 | 0.036358 | 0.306143 | 0.011551 |
| 0.6 | 0.173442 | 0.040121 | 0.400471 | 0.012069 |
| 0.7 | 0.275272 | 0.017581 | 0.513664 | 0.004870 |
| 0.8 | 0.437167 | −0.032657 | 0.649079 | −0.010587 |
| 0.9 | 0.673840 | −0.095156 | 0.810072 | −0.029728 |
| 1.0 | 1.000000 | 0.000000 | 1.000000 | 0.000000 |
| $SS_{res}$ |  | 0.0163748 |  | 0.0017023 |

Table: Table B3. Fitted values and residuals of Model 2.

# Appendix C. Model 1 and the unconstrained quadratic give the same Gini estimate

Write $t = x - \frac12$, so the $t$-values $-0.5, -0.4, \dots, 0.5$ are symmetric about 0, and write any cubic as $\hat L = p + qt + rt^2 + st^3$. Then
$$\int_0^1 \hat L\,dx = \int_{-1/2}^{1/2}\big(p + qt + rt^2 + st^3\big)\,dt = p + \frac{r}{12},$$
because $\displaystyle\int_{-1/2}^{1/2} t\,dt = \left[\frac{t^2}{2}\right]_{-1/2}^{1/2} = 0$, $\displaystyle\int_{-1/2}^{1/2} t^2\,dt = \left[\frac{t^3}{3}\right]_{-1/2}^{1/2} = \frac1{12}$ and $\displaystyle\int_{-1/2}^{1/2} t^3\,dt = \left[\frac{t^4}{4}\right]_{-1/2}^{1/2} = 0$. So the Gini estimate depends only on $p$ and $r$.

In $SS_{res} = \sum\big(L_k - (p + rt_k^2) - (qt_k + st_k^3)\big)^2$, the only terms that mix $(p, r)$ with $(q, s)$ are $2\sum (p + rt_k^2)(qt_k + st_k^3)$. Every product here contains an odd power of $t_k$, and these cancel in the pairs $t_k$ and $-t_k$. So $SS_{res}$ splits into a part with only $(p, r)$ and a part with only $(q, s)$. The same $p$ and $r$ minimise the first part whether or not the $t^3$ term is included, so the least-squares cubic and quadratic have the same $p$ and $r$, and therefore the same Gini estimate (confirmed in Table 10).

# Appendix D. How the calculations were done and checked

The coefficients, sums, residuals and integrals were calculated with a short Python program (NumPy), which also drew the graphs (Matplotlib). Model 1 uses the same least-squares calculation as a GDC's cubic regression, so it can be reproduced on a GDC from Table 2. The hand method for Model 2 was checked against a general least-squares calculation that does not assume $\sum v_k w_k = 0$; the coefficients agreed to at least 12 d.p. Every worked calculation in the text was re-done from its rounded values to make sure the displayed working gives the displayed answer.

**[PERSONALIZE THIS SECTION IN MY OWN WORDS]**

*State honestly which tools I used (GDC model, spreadsheet, Python) and how I used an AI assistant, as required by the IB academic integrity policy and my school.*
