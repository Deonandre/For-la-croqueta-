---
title: "Estimating the Gini Coefficient with Cubic Lorenz Curves: South Africa and Norway, 2022"
subtitle: "IB Mathematics: Analysis and Approaches SL, Mathematical Exploration"
---

**Research question**

*To what extent can cubic polynomial regression models and definite calculus integration of Lorenz curves accurately estimate the Gini coefficient of inequality in South Africa compared to Norway, using 2022 World Bank income and consumption distribution data?*

# 1. Introduction

## 1.1 Rationale

I first came across the Gini coefficient when we were studying global wealth and living standards. It appeared in almost every comparison of countries: one country had a Gini coefficient of 0.3, another of 0.6, and the higher number meant "more unequal". What bothered me was that the number was always quoted but never explained. Nobody showed where it came from or how it was calculated. When I looked up its definition, I found that the Gini coefficient is based on the area between two curves on a graph. That was the moment this became a mathematics question for me, because finding the area between two curves is exactly what definite integration is for.

The World Bank calculates each country's Gini coefficient from thousands of individual household records, but the data it publishes are much shorter: the share of total income (or spending) received by each tenth of the population. This gave me my question. If I fit a cubic polynomial to those ten shares and integrate it, how close do I get to the World Bank's own value?

## 1.2 Choice of countries

I chose South Africa and Norway because they are structural opposites on the inequality spectrum. South Africa has a very high concentration of consumption: its published 2022 Gini coefficient is 0.5405, and the richest tenth of the population accounts for 42.1% of all consumption. Norway has a much more equal income distribution: its published 2022 Gini coefficient is 0.2695, and the richest tenth receives 22.0% of all income. Comparing the two lets me test the same method on two very different shapes of curve.

## 1.3 Hypothesis

In a very unequal country, the Lorenz curve (explained in Section 3) stays almost flat for the lower deciles and then turns steeply upward for the top decile. A cubic polynomial can only bend in a limited way, so I suspected it would not be flexible enough to follow such a sudden change. My hypothesis before doing any calculations was: **a cubic model will estimate the Gini coefficient less accurately for South Africa than for Norway, because South Africa's Lorenz curve bends too sharply for a single cubic to follow.**

## 1.4 What "accurately" means

Nobody knows the true level of inequality in a country exactly, so "accurately" cannot mean "equal to the truth". In this exploration it means how close my estimate is to the Gini coefficient that the World Bank published for the same survey, which I call $G_{\text{WB}}$. For any estimate $G_{\text{est}}$, I measure this with the absolute error, the size of the difference between $G_{\text{est}}$ and $G_{\text{WB}}$, and the relative percentage error, which is the absolute error divided by $G_{\text{WB}}$ and multiplied by 100%. I also wanted a fair standard to compare against, so I used a benchmark that needs no model at all: joining the data points with straight lines and applying the trapezium rule. If a cubic model does not get closer to $G_{\text{WB}}$ than simply joining the dots, then fitting it has not made the estimate more accurate.

# 2. Data collection and methodological caveats

## 2.1 Source and checks

I downloaded the data from the World Bank's Poverty and Inequality Platform (PIP) as one CSV file containing every survey year for South Africa and Norway (World Bank, 2026). The file only contains years in which a survey actually took place, and I used only the 2022 row for each country. Before doing any mathematics, I checked the information in Table 1.

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

Both rows come from national surveys, are not interpolated, and were calculated by the World Bank from individual household records. South Africa's data come from its Income and Expenditure Survey (IES), which collected information from November 2022 to November 2023 (Statistics South Africa, 2025), while Norway's come from EU-SILC, the European survey of income and living conditions. The mean is 1.87 times the median in South Africa, but only 1.12 times the median in Norway. A mean far above the median means that a small group at the top has very high values that pull the average up.

## 2.2 Decile shares and cumulative shares

Each decile is one tenth of the population, ranked from poorest to richest. For $k = 1, 2, \dots, 10$, I write $s_k$ for the share of total welfare received by decile $k$, where decile 1 is the poorest 10%. The ten shares add up to 1. To turn them into points on a Lorenz curve, I need running totals. For $k = 0, 1, \dots, 10$, let $x_k$ be the cumulative share of the population and $L_k$ the cumulative share of welfare:
$$x_k = \frac{k}{10}, \qquad L_k = s_1 + s_2 + \dots + s_k, \qquad L_0 = 0 .$$
The point $(x_k, L_k)$ means "the poorest $100x_k$% of the population receive $100L_k$% of total welfare".

For example, for South Africa $L_1 = s_1 = 0.013994$ and $L_2 = L_1 + s_2 = 0.013994 + 0.022703 = 0.036697$.

Continuing in the same way for both countries gives Table 2. For both countries the last value is $L_{10} = 1$, which confirms that the shares add up to 1. Together with $(0, 0)$ this gives 11 points from $(0, 0)$ to $(1, 1)$.

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

Table: Table 2. Decile shares $s_k$ and cumulative shares $L_k$, 2022 (6 decimal places).

All calculations use the unrounded values from the file (Appendix A), and I discuss Gini coefficients and errors to 4 decimal places.

![Figure 1. Lorenz points for South Africa (circles, solid line) and Norway (squares, dotted line), 2022. The dashed line is the line of equality.](output/fig1_lorenz_data.png){width=7.5cm}

Figure 1 shows the difference straight away. The poorest 40% of South Africans receive only 10.5% of total consumption, while the poorest 40% of Norwegians receive 23.3% of total income. South Africa's curve stays low and flat for longer and then rises much more steeply at the end.

## 2.3 Why "income" became "consumption"

My original research question talked about "income inequality" in both countries. When I inspected the PIP metadata in Table 1, I found that this was not correct: the data measure **consumption** for South Africa and **income** for Norway. The PIP database tends to use consumption surveys for poorer countries and income surveys for richer ones (Hasell & Arriagada, n.d.), and the file had only one 2022 row per country, so there was no 2022 income distribution for South Africa to use instead. I therefore changed my research question to "income and consumption distribution data", and from here on I use **welfare** to mean consumption for South Africa and income for Norway.

This is more than a change of words. Consumption is usually shared out more equally than income, because richer households save part of their income while poorer households can spend more than they earn for a while (Hasell & Arriagada, n.d.). South Africa's income Gini would therefore probably be even higher, and the two surveys also cover slightly different periods (World Bank, 2022). So the gap between the two published values is not an exact measure of how much more unequal South Africa is. My question, however, is about *accuracy*, and for that the comparison is still valid: within each country I only compare my estimate with the Gini coefficient that the World Bank calculated from the same survey as the decile shares, so each comparison is like with like. Looking back, checking the metadata before starting was one of the most important decisions I made; without it, my research question would have described the data wrongly.

# 3. Theoretical foundations

## 3.1 Conditions for a valid Lorenz curve

The Lorenz curve (Lorenz, 1905) is the graph of $L(x)$ for $0 \le x \le 1$, where $x$ is the cumulative share of the population, ranked from poorest to richest, and $L(x)$ is the share of total welfare held by that poorest fraction $x$. Before fitting any model, I wrote down four conditions that every Lorenz curve must satisfy, so that I could test my models against them later.

**Condition 1 (end points).** $L(0) = 0$ and $L(1) = 1$: none of the population holds none of the welfare, and all of the population holds all of it.

**Condition 2 (increasing).** $L'(x) \ge 0$, because adding more people can never reduce the total welfare they hold.

**Condition 3 (convex).** $L''(x) \ge 0$. Between two neighbouring points, the gradient of the curve is the share of that decile divided by 0.1, which works out as the decile's mean welfare $\mu_k$ divided by the national mean $\mu$:
$$\text{gradient} = \frac{s_k}{0.1} = 10\,s_k = \frac{\mu_k}{\mu} .$$
So the gradient of a Lorenz curve tells us how well off each part of the population is compared with the average. Since people are ranked from poorest to richest, the gradient keeps increasing, which means the curve is convex. The data agree: in South Africa the gradient rises from 0.14 for the poorest tenth to 4.21 for the richest tenth, and in Norway from 0.35 to 2.20.

**Condition 4 (below the line of equality).** $L(x) \le x$, because a convex curve lies below the straight line joining its end points, which here is $y = x$.

## 3.2 From area to the Gini formula

If everyone had exactly the same welfare, the Lorenz curve would be the **line of perfect equality** $y = x$. The Gini coefficient $G$ is the area between $y = x$ and $L(x)$, divided by the whole area under $y = x$. The area under $y = x$ from 0 to 1 is a triangle with area $1/2$, so
$$G = \frac{\int_0^1 \big(x - L(x)\big)\,dx}{\int_0^1 x\,dx} = \frac{\frac12 - \int_0^1 L(x)\,dx}{\frac12} = 1 - 2\int_0^1 L(x)\,dx .$$
I write $A$ for the area under the Lorenz curve, so that $G = 1 - 2A$. With perfect equality, $A$ is one half and $G = 0$; if one person held everything, $A$ would be close to 0 and $G$ close to 1. The limits of integration are 0 and 1 because $x$ runs from none of the population to all of it. Since I only know $L$ at 11 points, I cannot integrate it directly. I compare two ways of finding $A$: joining the points with straight lines (Section 4), and fitting a cubic polynomial and integrating it (Sections 5 and 6).

# 4. Discrete benchmark: the trapezium rule

The simplest way to estimate $A$ is to join neighbouring points with straight lines and add up the areas of the 10 trapezia underneath, each of width $h = 0.1$:
$$A_T = \frac{h}{2}\left[L(0) + 2\sum_{k=1}^{9} L_k + L(1)\right] = 0.05 + 0.1\sum_{k=1}^{9} L_k , \qquad G_T = 1 - 2A_T .$$

| | $\sum_{k=1}^{9} L_k$ | $A_T$ | $G_T$ | Published $G_{\text{WB}}$ |
|---|---:|---:|---:|---:|
| South Africa | 1.865822 | 0.236582 | 0.526836 | 0.540539 |
| Norway | 3.184940 | 0.368494 | 0.263012 | 0.269463 |

Table: Table 3. Trapezium-rule estimates.

For South Africa, $A_T = 0.05 + 0.1 \times 1.865822 = 0.236582$, so $G_T = 1 - 2 \times 0.236582 = 0.526836$.

Before comparing with the published values, I worked out which way the error had to go. Because the true Lorenz curve is convex (Condition 3), it bends *below* the straight line joining any two neighbouring points. Each trapezium therefore contains a thin sliver of extra area above the true curve, so the trapezium rule overestimates the area. Since $G = 1 - 2A$, a larger area gives a smaller Gini coefficient, so the trapezium rule must underestimate $G$. My results agree for both countries: 0.5268 is below 0.5405, and 0.2630 is below 0.2695.

There is another way to understand this gap. If everyone *inside* each decile had exactly the same welfare, the Lorenz curve would be made of straight segments and its Gini coefficient would be exactly the trapezium estimate. So the difference between the trapezium estimate and the published value measures the inequality *within* the deciles, which ten shares cannot show. I call it the **grouping error**. It is 0.0137 for South Africa and 0.0065 for Norway: about twice as large for South Africa, but almost the same as a percentage (2.54% and 2.39%). This told me what a cubic model would have to do to beat the benchmark: bend below the straight lines, as the true curve does, and recover some of the missing inequality.

# 5. Model 1: unconstrained least-squares cubic

## 5.1 Fitting the model

Model 1 is the general cubic $\hat L(x) = ax^3 + bx^2 + cx + d$, where the hat shows that it is a model of $L$. For each data point, the residual $e_k = L_k - \hat L(x_k)$ is the vertical gap between the data and the model. Least-squares regression chooses the coefficients $a$, $b$, $c$ and $d$ that make the sum of the squared residuals as small as possible:
$$SS_{res} = \sum_{k=0}^{10} e_k^{\,2} .$$
I used cubic regression on all 11 points, which is the same calculation as the cubic regression function on a GDC, and got
$$\text{South Africa:}\quad \hat L(x) = 2.293642x^3 - 2.093904x^2 + 0.776525x - 0.025619$$
$$\text{Norway:}\quad \hat L(x) = 0.519969x^3 - 0.066764x^2 + 0.540877x - 0.009613$$

To measure how well each model fits, I used the coefficient of determination $R^2 = 1 - SS_{res} / SS_{tot}$, where $SS_{tot}$ is the sum of the squared differences between each $L_k$ and their mean $\bar L$. I did not want to just trust the output, so I recalculated every residual myself (Tables 4 and 5).

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

Table: Table 4. Residuals of Model 1 for South Africa ($\bar L = 0.260529$).

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

Table: Table 5. Residuals of Model 1 for Norway ($\bar L = 0.380449$).

For South Africa $R^2 = 1 - \dfrac{0.0120732}{0.9238556} = 0.9869$, and for Norway $R^2 = 1 - \dfrac{0.0012347}{1.0532298} = 0.9988$.

So Model 1 explains 98.7% of the variation in the data for South Africa and 99.9% for Norway. At first these looked like excellent fits, but the graphs told a different story.

![Figure 2. The decile points (dots), Model 1 (solid line), Model 2 (dash-dot line, see Section 6) and the line of equality (dotted line).](output/fig2_models.png){width=15cm}

![Figure 3. Residuals of Model 1 (filled circles, solid line) and Model 2 (open squares, dash-dot line), on the same scale for both countries.](output/fig3_residuals.png){width=15cm}

I noticed that in both countries the residuals of Model 1 follow the same pattern of signs (Figure 3): positive, then negative, then positive, then negative, then positive again. This is a wave, not random scatter. My data points are exact summaries of each survey, not noisy measurements, so the residuals show **where the shape of the cubic is wrong**. The largest residual in both countries is at $x = 0.9$, where the model lies above the data because it cannot rise steeply enough for the richest group. The South African residuals are about three times as large as the Norwegian ones.

## 5.2 Definite integration

Integrating term by term,
$$\int_0^1 \big(ax^3 + bx^2 + cx + d\big)\,dx = \left[\frac{a}{4}x^4 + \frac{b}{3}x^3 + \frac{c}{2}x^2 + dx\right]_0^1 = \frac a4 + \frac b3 + \frac c2 + d .$$
Calling this area $A_1$, the Gini estimate is $G_1 = 1 - 2A_1$.

South Africa: $$A_1 = 0.5734104 - 0.6979679 + 0.3882626 - 0.0256185 = 0.2380866, \qquad G_1 = 1 - 2(0.2380866) = 0.523827$$
Norway: $$A_1 = 0.1299923 - 0.0222548 + 0.2704383 - 0.0096132 = 0.3685626, \qquad G_1 = 1 - 2(0.3685626) = 0.262875$$

Both estimates are below the published values: 0.5238 instead of 0.5405 for South Africa, and 0.2629 instead of 0.2695 for Norway.

## 5.3 Testing Model 1 against the conditions

**Condition 1.** Model 1 does not pass through the end points. For South Africa, $\hat L(0) = d = -0.0256$ and $\hat L(1) = a + b + c + d = 0.9506$, so the model describes a population that holds only 95.1% of its own welfare. Norway has the same problem on a smaller scale. This also undermines the Gini estimate itself, because the Gini formula assumes that $L(1) = 1$.

**Condition 2.** The derivative $\hat L'(x) = 3ax^2 + 2bx + c$ is a quadratic with no real roots in both countries (its discriminant is negative) and a positive leading coefficient, so it is always positive and Model 1 is increasing. Model 1 passes this condition.

**Negative values.** Because the model starts below zero, it predicts **negative cumulative shares** for the poorest 3.6% of South Africans and the poorest 1.8% of Norwegians, which is impossible.

**Condition 3.** The second derivative is $\hat L''(x) = 6ax + 2b$, which is negative at $x = 0$ in both countries because $b < 0$. Solving $\hat L''(x) = 0$ gives the point of inflection $x = -b/(3a)$, which is 0.30 for South Africa. So the model is concave *down* for the poorest 30% of South Africans. Using the meaning of the gradient from Section 3.1, this says that South Africans around the 30th percentile have *less* than the very poorest people, which contradicts the ranking of the population. For Norway this wrong section only covers the poorest 4%.

**Condition 4.** Checking the values of $\hat L(x) - x$ on the interval from 0 to 1 shows that its largest value is at $x = 0$, where it equals -0.0256 for South Africa and -0.0096 for Norway. Both are negative, so Model 1 stays below the line of equality and passes this condition.

So Model 1 fails Condition 1, gives negative values near $x = 0$, and fails Condition 3 near the origin in both countries. It only passes Conditions 2 and 4.

## 5.4 Reflection on $R^2$

This was the point where I stopped trusting $R^2$. I had expected an $R^2$ above 0.98 to mean that the model was essentially correct. Instead, the model with that $R^2$ predicts negative consumption shares for the poorest South Africans, misses both end points, and bends the wrong way for almost a third of the population. When I thought about why, I realised that the 11 points rise so smoothly that almost *any* smooth increasing curve would score close to 1. $R^2$ only measures vertical distances at the 11 points; it says nothing about the conditions a Lorenz curve must satisfy, or about the area between the points, which is what the Gini coefficient actually depends on. A near-perfect $R^2$ does not guarantee that a model is valid or meaningful. This led to my next decision: instead of hoping that the regression would pass through $(0, 0)$ and $(1, 1)$, I would force it to.

# 6. Model 2: constrained cubic through (0, 0) and (1, 1)

## 6.1 Applying the constraints

Condition 1 gives $\hat L(0) = 0$, so $d = 0$, and $\hat L(1) = 1$, so $a + b + c = 1$ and $c = 1 - a - b$. Substituting,
$$\hat L(x) = ax^3 + bx^2 + (1 - a - b)x = x + a(x^3 - x) + b(x^2 - x).$$
A GDC cannot fit a cubic with conditions like these, so I had to fit it by hand. To make this possible, I used the identity $x^3 - x = (x - 0.5)(x^2 - x) + 1.5(x^2 - x)$, which can be checked by expanding the right-hand side. This lets me rewrite the model as
$$\hat L(x) = x + \beta\,v(x) + \alpha\,w(x), \qquad v(x) = x^2 - x, \quad w(x) = (x - 0.5)(x^2 - x),$$
where $\beta = b + 1.5a$ and $\alpha = a$. It is the same family of cubics, just described with different coefficients.

The two parts have a useful symmetry about $x = 0.5$. Replacing $x$ by $1 - x$ leaves $v$ unchanged but changes the sign of $w$, so $v$ is symmetric about $x = 0.5$, while $w$ is positive on one side and negative on the other by exactly the same amount.

## 6.2 Why the cubic term has no effect on the area

$$\int_0^1 (x^2 - x)\,dx = \left[\frac{x^3}{3} - \frac{x^2}{2}\right]_0^1 = -\frac16 , \qquad \int_0^1 (x - 0.5)(x^2 - x)\,dx = \left[\frac{x^4}{4} - \frac{x^3}{2} + \frac{x^2}{4}\right]_0^1 = 0 .$$
Since $\int_0^1 x\,dx = 1/2$, the area under Model 2 is $A_2 = 1/2 - \beta/6$, and so
$$G_2 = 1 - 2A_2 = 1 - 2\left(\frac12 - \frac{\beta}{6}\right) = \frac{\beta}{3} .$$
**The Gini coefficient of Model 2 depends only on β.** Whatever value α takes, the cubic part adds exactly as much area on one side of $x = 0.5$ as it removes on the other, so it has no effect on the definite integral.

## 6.3 Fitting Model 2 by hand

Let $z_k = L_k - x_k$, the gap between the data and the line of equality, and write $v_k = v(x_k)$ and $w_k = w(x_k)$. The residuals are $z_k - \beta v_k - \alpha w_k$. The key fact is that the sum of the products $v_k w_k$ is zero: because the decile points are symmetric about 0.5, these products cancel in pairs ($x = 0.1$ with $x = 0.9$, $x = 0.2$ with $x = 0.8$, and so on). This means the sum of squared residuals splits into one part that contains only β and another that contains only α. Each part is a quadratic, so I minimised it by differentiating and setting the derivative equal to zero, which gives
$$\beta = \frac{\sum v_k z_k}{\sum v_k^2}, \qquad \alpha = \frac{\sum w_k z_k}{\sum w_k^2} .$$
The sums $\sum v_k^2 = 0.3333$ and $\sum w_k^2 = 0.01188$ depend only on the $x$-values, so they are the same for both countries. The other two sums are worked out in Appendix B.

South Africa: $$\beta = \frac{0.5106615}{0.3333} = 1.532138, \qquad \alpha = \frac{0.02912842}{0.01188} = 2.451887$$
Norway: $$\beta = \frac{0.2584506}{0.3333} = 0.775429, \qquad \alpha = \frac{0.00664599}{0.01188} = 0.559427$$

Converting back with $a = \alpha$, $b = \beta - 1.5\alpha$ and $c = 1 - \beta + 0.5\alpha$ gives the two models:
$$\text{South Africa:}\quad \hat L(x) = 2.451887x^3 - 2.145693x^2 + 0.693806x, \qquad R^2 = 0.9823$$
$$\text{Norway:}\quad \hat L(x) = 0.559427x^3 - 0.063711x^2 + 0.504284x, \qquad R^2 = 0.9984$$
I checked my hand method against a general least-squares calculation of the same model, and the coefficients agreed to at least 12 decimal places. Both values of α are positive, which means that in both countries the inequality is concentrated in the upper half of the population, and much more strongly in South Africa.

The Gini estimates are $G_2 = \beta / 3 = 1.532138 / 3 = 0.510713$ for South Africa and $G_2 = 0.775429 / 3 = 0.258476$ for Norway. Integrating the usual form of each cubic gives exactly the same values.

## 6.4 Testing Model 2 against the conditions

Model 2 passes Condition 1 by construction. Its derivative has a negative discriminant in both countries, so it is increasing, and since it rises from 0 to 1 it never predicts negative shares. It also stays below the line of equality, because $\hat L(x) - x = (x^2 - x)\big(\beta + \alpha(x - 0.5)\big)$, where the first bracket is negative and the second is positive for $0 < x < 1$. However, Model 2 still fails Condition 3: its second derivative is negative at $x = 0$, with a point of inflection at $x = 0.29$ for South Africa and $x = 0.04$ for Norway. The model's gradient at $x = 0$ says that the poorest South African consumes about 69% of the national mean, while the data say the poorest tenth consume on average only 14%.

I expected Model 2 to be more accurate than Model 1, since it is a better Lorenz function. It was not: its Gini estimates (0.5107 and 0.2585) are *further* from the published values. Comparing the two curves in Figure 2, I saw that they are almost the same in the middle and only differ near the ends. Model 1 is allowed to drop below $(0, 0)$ and $(1, 1)$, which lowers its area and raises its Gini estimate by 0.0131 for South Africa. So part of Model 1's better accuracy comes from breaking Condition 1; its answer is closer partly for the wrong reason.

## 6.5 Reflection: the constrained cubic equals the constrained quadratic

Sections 6.2 and 6.3 together led me to the most surprising result of the exploration. The constrained *quadratic* $\hat L(x) = bx^2 + (1 - b)x$ is simply Model 2 without the cubic part. Least squares gives it exactly the same coefficient β, so its Gini coefficient is also β divided by 3. In plain terms: because the decile points are spaced symmetrically around $x = 0.5$, the cubic part of the model pushes the curve up on one side and down on the other by the same amount, so it cancels out of the area integral completely. **With equally spaced deciles, the best-fitting constrained cubic always gives exactly the same Gini coefficient as the best-fitting constrained quadratic.** The same idea shows that Model 1 gives the same Gini estimate as an ordinary quadratic. Because this seemed almost too neat, I checked it with the 2022 data (Table 6).

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

Table: Table 6. Cubic and quadratic models fitted to the same data.

Each cubic gives the same Gini estimate as its quadratic, to at least 14 decimal places. South Africa shows the effect most clearly: adding the cubic term raises $R^2$ from 0.9050 to 0.9823 and turns a curve that goes negative into one that never does, yet the Gini estimate does not change at all. For Norway, the constrained quadratic is actually the only one of the four models that passes every condition, and it gives exactly the same Gini estimate as Model 2.

This changed how I understand my own research question. The word "cubic" suggests that the cubic term should make the estimate better, but for decile data it cannot affect the Gini estimate at all; it only improves the *shape* of the curve. It also proved something I had only suspected in Section 5.4: $R^2$ does not measure how accurate the Gini estimate is, because $R^2$ went from 0.90 to 0.98 without the Gini estimate changing.

# 7. Comparative error analysis and synthesis

## 7.1 Summary of results

| Country | Published $G_{\text{WB}}$ | Trapezium $G_T$ | Model 1 $G_1$ | Model 2 $G_2$ |
|---------------|--------------:|--------------:|--------------:|--------------:|
| South Africa | 0.5405 | 0.5268 | 0.5238 | 0.5107 |
| Norway | 0.2695 | 0.2630 | 0.2629 | 0.2585 |

Table: Table 7. Published Gini coefficients and the three estimates.

| Country | Method | Estimated Gini | Absolute error $\left|G_{\text{est}} - G_{\text{WB}}\right|$ | Relative percentage error |
|------------|------------------------|------------:|------------------------:|----------------:|
| South Africa | World Bank (published) | 0.5405 | – | – |
| South Africa | Trapezoidal rule | 0.5268 | 0.0137 | 2.54% |
| South Africa | Model 1 (unconstrained cubic) | 0.5238 | 0.0167 | 3.09% |
| South Africa | Model 2 (constrained cubic) | 0.5107 | 0.0298 | 5.52% |
| Norway | World Bank (published) | 0.2695 | – | – |
| Norway | Trapezoidal rule | 0.2630 | 0.0065 | 2.39% |
| Norway | Model 1 (unconstrained cubic) | 0.2629 | 0.0066 | 2.44% |
| Norway | Model 2 (constrained cubic) | 0.2585 | 0.0110 | 4.08% |

Table: Table 8. Absolute and relative percentage errors of each method.

Every estimate is *below* the published value, so all three methods underestimate inequality in both countries. The trapezium rule is the most accurate method in both countries, followed by Model 1 and then Model 2. For Norway, Model 1 is almost as good as the benchmark, but for South Africa it is clearly worse. Rounded to one decimal place, every estimate matches the published value (0.5 and 0.3), but rounded to two decimal places none of them does. All methods do keep the right order and roughly the right ratio: the published South African value is 2.01 times the Norwegian one, and the estimates give 2.00, 1.99 and 1.98.

I used both types of error on purpose. The absolute error is better for judging a single estimate, because the Gini coefficient is already a proportion and countries are compared by the difference between their values. The relative error is fairer for comparing the method between the two countries, because Norway's Gini coefficient is only about half of South Africa's.

## 7.2 Grouping error and model error

To see *why* the models are wrong, I split each total error into two parts using the trapezium estimate:
$$G_{\text{model}} - G_{\text{WB}} = (G_T - G_{\text{WB}}) + (G_{\text{model}} - G_T).$$
The first part is the grouping error from Section 4, which is the same for every method. The second part, which I call the model error, is caused by the shape of the model compared with straight lines.

| Country | Method | Grouping error $G_T - G$ | Model error $G_{\text{model}} - G_T$ | Total error $G_{\text{model}} - G$ |
|-------------|----------:|------------------:|----------------------:|--------------------:|
| South Africa | Model 1 | −0.0137 | −0.0030 | −0.0167 |
| South Africa | Model 2 | −0.0137 | −0.0161 | −0.0298 |
| Norway | Model 1 | −0.0065 | −0.0001 | −0.0066 |
| Norway | Model 2 | −0.0065 | −0.0045 | −0.0110 |

Table: Table 9. Splitting each total error into grouping error and model error.

For Norway, Model 1's model error is almost zero, so nearly all of its error comes from only having ten groups. For South Africa, Model 2's model error is even larger than the grouping error. All four model errors are negative, which means that on average the cubics lie *above* the straight lines, the opposite of what they needed to do to recover the missing inequality.

## 7.3 Why both cubic models underestimate

The gradients at the two ends of the curve explain the pattern. Because a real Lorenz curve is convex, its gradient at $x = 0$ cannot be larger than the average gradient of the first decile, and its gradient at $x = 1$ cannot be smaller than the average gradient of the last decile. Both models break both rules in both countries. For South Africa, the data allow a gradient of at most 0.14 at $x = 0$, but Model 1 has 0.78 and Model 2 has 0.69; at $x = 1$ the gradient should be at least 4.21, but the models only reach 3.47 and 3.76. In everyday terms, **the cubics make the poorest people look better off, and the richest people look less rich, than the data show.** A curve that rises too fast at the start and too slowly at the end lies above the data near both ends, which is visible in the negative residuals at $x = 0.1$, 0.2, 0.8 and 0.9 in Figure 3. The area under the model is therefore too large, and its Gini estimate too small.

## 7.4 Testing the hypothesis

This is exactly where South Africa and Norway differ. South Africa's distribution is extremely skewed, and the richest tenth hold 42.1% of all consumption. A cubic's second derivative is only a straight line, so its gradient cannot change fast enough to follow a curve that is nearly flat for most of the population and then almost vertical at the end. Norway's gentler curve is much easier to follow. The numbers support my hypothesis. South Africa's absolute errors are 2.1 times Norway's for the trapezium rule, 2.5 times for Model 1 and 2.7 times for Model 2. The relative errors of both cubic models are also larger for South Africa (3.09% against 2.44% for Model 1, and 5.52% against 4.08% for Model 2), while for the trapezium rule they are almost equal. So the grouping error grows roughly in proportion to the Gini coefficient, but the model error grows much faster as the curve becomes more strongly bent. This is the limit of a single cubic that I expected in my hypothesis.

# 8. Critical evaluation, extensions and conclusion

## 8.1 Strengths

Every integral was calculated exactly, and every worked calculation was checked. The trapezium benchmark gave a fair, model-free meaning to "accurately", and my prediction that it would underestimate the Gini coefficient followed from convexity and was confirmed. Model 2 was fitted by hand with AA SL methods and checked against a general calculation. Most importantly, I tested every model against the conditions for a Lorenz curve instead of judging it by $R^2$, which is what revealed the real weaknesses of the cubic models.

## 8.2 Limitations

**The rigid shape of a cubic.** A cubic can only have one point of inflection, so it cannot be very steep at the top and correctly curved at the bottom at the same time. All four fitted cubics bent the wrong way near $x = 0$, which produced the model errors in Table 9.

**No detail within the top decile.** Ten shares cannot show inequality inside each decile, which matters most at the top: the richest 10% of South Africans hold 42.1% of consumption, but the data give only one number for this whole group. No method that uses only these 11 points can be sure of recovering the grouping error.

**Other limitations.** Least squares treats the 11 points as separate pieces of information, although each cumulative share contains all the earlier shares, and a smaller residual sum of squares does not mean a smaller error in area. The published Gini coefficient is itself an estimate from a sample survey, so "accurate" here means close to the published value, not to the true inequality of the whole population. South Africa's consumption data and Norway's income data measure different things, which does not affect my accuracy comparison but does mean the two published values should not be compared as if they measured the same thing. Finally, PIP is updated regularly, and its September 2026 update revised one earlier estimate (PIP Technical Team, 2026), so my results apply to the version of the data I downloaded.

## 8.3 Extensions

The main weakness of the cubic is its shape, so a natural next step would be to use a function that can become very steep near $x = 1$. The simplest is the power function $L(x) = x^p$ with $p > 1$. It automatically satisfies all four conditions, and its Gini coefficient is easy to find:
$$G = 1 - 2\int_0^1 x^p\,dx = 1 - \frac{2}{p+1} = \frac{p-1}{p+1} .$$
The value of $p$ could be found using logarithms. A second idea would be a spline: separate cubic pieces between neighbouring points that pass through every data point and join smoothly. If each piece were kept convex, the spline would lie below the straight lines, so its Gini estimate would be at least as large as the trapezium estimate, and it could recover part of the grouping error instead of adding to it.

## 8.4 Conclusion

My research question asked to what extent cubic polynomial regression models and definite calculus integration of Lorenz curves can accurately estimate the Gini coefficient of inequality in South Africa compared to Norway. My answer is: **to a limited extent.**

The method gives the right general picture. The cubic estimates are within 2.4% to 5.5% of the published values, they are correct to one decimal place, and they correctly show that South Africa's Gini coefficient is about twice Norway's. For South Africa (consumption, published value 0.5405), Model 1 gave 0.5238 (3.09% error) and Model 2 gave 0.5107 (5.52% error). For Norway (income, published value 0.2695), Model 1 gave 0.2629 (2.44% error) and Model 2 gave 0.2585 (4.08% error).

However, the method is not accurate to two decimal places, every estimate is too low, and neither cubic did better than simply joining the points with straight lines: the trapezium rule had the smallest errors in both countries (2.54% and 2.39%). Every cubic had an $R^2$ above 0.98, but Model 1 is not a valid Lorenz curve, and both models bend the wrong way for the poorest part of the population. As I predicted, the method is clearly less accurate for South Africa, with errors 2 to 3 times larger than Norway's, because South Africa's Lorenz curve turns so sharply at the top.

Three things limit the accuracy: the grouped data hide inequality within each decile, which pushes every estimate down; the rigid shape of a cubic adds a further underestimate that grows with inequality; and with equally spaced deciles the cubic term has no effect on the Gini estimate at all, which I showed and then confirmed with the data. These conclusions come from one year and two countries with different welfare measures, so I would not claim that they hold everywhere, but they suggest that a cubic model of decile data will tend to underestimate the Gini coefficient, especially in very unequal countries. The most valuable thing this exploration taught me is that a model can fit the data almost perfectly and still describe something impossible, so checking a model against the mathematics of what it represents matters far more than its $R^2$.

## 8.5 Declaration of tools used

The data were downloaded from the World Bank PIP data service. The regression coefficients, sums, residuals and integrals were calculated with a short Python program, which also drew the graphs. The coefficients of Model 1 are the same as those given by the cubic regression function of a GDC, which can be used to reproduce them from the data in Table 2. An AI assistant (Claude, made by Anthropic) was used during this exploration to help check the World Bank data, write the Python calculations, typeset the document and draft parts of the written explanation. This use is acknowledged here in line with the IB academic integrity policy.

# References

Hasell, J., & Arriagada, P. (n.d.). *Data on poverty by the World Bank Poverty and Inequality Platform* [Dataset documentation]. Our World in Data. https://github.com/owid/poverty-data/blob/main/datasets/pip_README.md

Lorenz, M. O. (1905). Methods of measuring the concentration of wealth. *Publications of the American Statistical Association, 9*(70), 209–219. https://doi.org/10.2307/2276207

PIP Technical Team. (2026, September 22). *PIP data update on September 22, 2026*. World Bank. https://worldbank.github.io/PIP_data_updates/posts/2026-09-22-pip-data-update/

Statistics South Africa. (2025). *Income & Expenditure Survey (IES) 2022/2023*. https://www.statssa.gov.za/?p=17995

World Bank. (2022). *Poverty and Inequality Platform methodology handbook* (Version 2022-04). https://worldbank.github.io/PIP-Methodology-2022-04/

World Bank. (2026). *Poverty and Inequality Platform* (Version September 2026) [Data set]. Retrieved September 23, 2026, from https://api.worldbank.org/pip/v1/pip?country=ZAF,NOR&year=all&povline=3&fill_gaps=false&format=csv

# Appendix A. The 2022 data

These are the unrounded values exactly as they appear in the PIP file, as proportions of total welfare.

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

# Appendix B. Model 2 working

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

Table: Table B1. Sums for Model 2, South Africa ($z_k = L_k - x_k$).

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
