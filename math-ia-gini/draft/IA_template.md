---
title: "Estimating the Gini Coefficient with Cubic Lorenz Curves: South Africa and Norway, 2022"
subtitle: "IB Mathematics: Analysis and Approaches SL, Mathematical Exploration"
---

**Research question**

*To what extent can cubic polynomial regression models and definite calculus integration of Lorenz curves accurately estimate the Gini coefficient of inequality in South Africa compared to Norway, using 2022 World Bank income and consumption distribution data?*

# 1. Introduction

## 1.1 Rationale

I first came across the Gini coefficient when we were studying global wealth and living standards. It appeared in almost every comparison of countries: one country had a Gini coefficient of 0.3, another of 0.6, and the higher number meant "more unequal". What bothered me was that the number was always quoted but never explained. Nobody showed where it came from or how it was calculated. When I looked up its definition, I found that the Gini coefficient is the area between two curves on a graph, compared with the area of a triangle. That was the moment this became a mathematics question for me, because finding the area between two curves is exactly what definite integration is for.

The World Bank calculates each country's Gini coefficient from thousands of individual household records, but the data it publishes are much shorter: the share of total income (or spending) received by each tenth of the population. This gave me my question. If I fit a cubic polynomial to those ten shares and integrate it, how close do I get to the World Bank's own value?

## 1.2 Choice of countries

I chose South Africa and Norway because they are structural opposites on the inequality spectrum. South Africa has a very high concentration of consumption: its published 2022 Gini coefficient is «f(Z.gini_official,4)», and the richest tenth of the population accounts for «f(DZ.top10*100,1)»% of all consumption. Norway has a much more equal income distribution: its published 2022 Gini coefficient is «f(N.gini_official,4)», and the richest tenth receives «f(DN.top10*100,1)»% of all income. Comparing the two lets me test the same method on two very different shapes of curve.

## 1.3 Hypothesis

In a very unequal country, the Lorenz curve (defined in Section 3) stays almost flat for the lower deciles and then turns steeply upward for the top decile. A single cubic polynomial has only one point of inflection and a second derivative that is a straight line, so I suspected it would not be flexible enough to follow such a sudden change. My hypothesis before doing any calculations was therefore: **a cubic model will estimate the Gini coefficient less accurately for South Africa than for Norway, because South Africa's Lorenz curve tests the inflection limits of a single cubic polynomial.**

## 1.4 What "accurately" means

Nobody knows the true level of inequality in a country exactly, so "accurately" cannot mean "equal to the truth". In this exploration it means **how close my estimate is to the Gini coefficient that the World Bank published for the same survey**, which I call $G_{\text{WB}}$. I measure this with the absolute error $\left|G_{\text{est}} - G_{\text{WB}}\right|$ and the relative percentage error $\dfrac{\left|G_{\text{est}} - G_{\text{WB}}\right|}{G_{\text{WB}}} \times 100\%$, where $G_{\text{est}}$ is any estimate. I also wanted a fair standard to compare against, so I used a benchmark that needs no model at all: joining the data points with straight lines and applying the trapezium rule. If a cubic model does not get closer to $G_{\text{WB}}$ than simply joining the dots, then fitting it has not made the estimate more accurate.

# 2. Data collection and methodological caveats

## 2.1 Source and checks

I downloaded the data from the World Bank's Poverty and Inequality Platform (PIP) as one CSV file containing every survey year for South Africa (ZAF) and Norway (NOR) (World Bank, 2026). I used the setting `fill_gaps=false`, so the file only contains years in which a survey actually took place, and not values estimated between surveys. The file has «n_rows» rows: «n_nor» survey years for Norway (1979 to 2023) and «n_zaf» for South Africa (1993 to 2022). I used only the 2022 row for each country. Before doing any mathematics, I checked the information in Table 1.

«T_meta()»

Table: Table 1. Information in the 2022 rows of the PIP file.

Both rows come from national surveys and are not interpolated, and in both cases the World Bank calculated the figures from individual household records (`micro`). South Africa's data come from its Income and Expenditure Survey (IES), which collected information from November 2022 to November 2023 (Statistics South Africa, 2025); this is why its survey year is listed as 2022.85, and PIP reports it under 2022. Norway's data come from EU-SILC, the European survey of income and living conditions. The row "mean ÷ median" already hints at the difference between the countries: in South Africa the mean is «f(DZ.mean_median,2)» times the median, compared with only «f(DN.mean_median,2)» in Norway. A mean far above the median means that a small group at the top has very high values that pull the average up.

## 2.2 Decile shares and cumulative shares

Each decile is one tenth of the population, ranked from poorest to richest. For $k = 1, 2, \dots, 10$, let $s_k$ be the share of total welfare received by decile $k$, where decile 1 is the poorest 10% and decile 10 the richest 10%. The shares are proportions, so $\sum_{k=1}^{10} s_k = 1$. I checked that, for both countries, all ten shares are positive, that they increase from decile 1 to decile 10, and that they add up to 1.

To turn the shares into points on a Lorenz curve, I need running totals. For $k = 0, 1, \dots, 10$, let $x_k$ be the cumulative share of the population and $L_k$ the cumulative share of welfare:
$$x_k = \frac{k}{10}, \qquad L_k = \sum_{i=1}^{k} s_i, \qquad L_0 = 0 .$$
The point $(x_k, L_k)$ means "the poorest $100x_k\%$ of the population receive $100L_k\%$ of total welfare". For South Africa the first three values are
$$L_1 = s_1 = «f(Z.L[1])», \qquad L_2 = L_1 + s_2 = «f(Z.L[1])» + «f(Z.shares[1])» = «f(Z.L[2])»,$$
$$L_3 = L_2 + s_3 = «f(Z.L[2])» + «f(Z.shares[2])» = «f(Z.L[3])»,$$
and the Norwegian values are found in the same way. Continuing gives Table 2. For both countries $L_{10} = 1$, which confirms that the shares add up to 1. Together with $(0,0)$ this gives 11 points from $(0,0)$ to $(1,1)$ in steps of 0.1. The two end points are not measurements; they hold for every country, as explained in Section 3.

«T_cum()»

Table: Table 2. Decile shares $s_k$ and cumulative shares $L_k$, 2022.

All my calculations use the unrounded values from the file (Appendix A). Tables and working show 6 decimal places (d.p.), so where a value was worked out at full precision, adding rounded table entries can change its last digit by 1 or 2. I discuss Gini coefficients and errors to 4 d.p.

![Figure 1. Lorenz points for South Africa (circle markers, solid line) and Norway (square markers, dotted line), 2022, joined with straight lines. The dashed line is the line of equality $y = x$.](output/fig1_lorenz_data.png){width=7.5cm}

Figure 1 shows the difference straight away. The poorest 40% of South Africans receive $L_4 = «f(DZ.bottom40,4)»$ of total consumption, while the poorest 40% of Norwegians receive $L_4 = «f(DN.bottom40,4)»$ of total income. South Africa's curve stays low and flat for longer and then rises much more steeply at the end.

## 2.3 Why "income" became "consumption"

My original research question talked about "income inequality" in both countries. When I inspected the PIP metadata in Table 1, I found that this was not correct: the `welfare_type` field says **consumption** for South Africa and **income** for Norway. The PIP database tends to use consumption surveys for poorer countries and income surveys for richer ones (Hasell & Arriagada, n.d.), and the file had only one 2022 row per country, so there was no 2022 income distribution for South Africa to use instead. I therefore changed my research question to "income and consumption distribution data", and from here on I use **welfare** to mean consumption for South Africa and income for Norway.

This is more than a change of words. Consumption is usually shared out more equally than income, because richer households save part of their income while poorer households can spend more than they earn for a while, and consumption can never be zero while income can (Hasell & Arriagada, n.d.). South Africa's income Gini would therefore probably be even higher, and the surveys also cover slightly different periods, since EU-SILC income usually refers to the previous calendar year (World Bank, 2022). So the gap between «f(Z.gini_official,4)» and «f(N.gini_official,4)» is not an exact measure of how much more unequal South Africa is. My question, however, is about *accuracy*, and for that the comparison is still valid: within each country I only compare my estimate with the Gini coefficient that the World Bank calculated from **the same survey** as the decile shares, so each comparison is like with like. Looking back, checking the metadata before starting was one of the most important decisions I made; without it, my research question would have described the data wrongly.

# 3. Theoretical foundations

## 3.1 Conditions for a valid Lorenz curve

The Lorenz curve (Lorenz, 1905) is the graph of $L(x)$ for $0 \le x \le 1$, where $x$ is the cumulative share of the population, ranked from poorest to richest, and $L(x)$ is the share of total welfare held by that poorest fraction $x$. The points $(x_k, L_k)$ from Table 2 lie on this curve. Before fitting any model, I wrote down the conditions that every Lorenz curve must satisfy, so that I could test my models against them later.

**Condition 1: boundary conditions.** $L(0) = 0$ and $L(1) = 1$, because none of the population holds none of the welfare, and all of the population holds all of it.

**Condition 2: monotonicity.** $L'(x) \ge 0$ for $x \in [0, 1]$. Adding more people can never reduce the total welfare they hold, because no share is negative.

**Condition 3: convexity.** $L''(x) \ge 0$ for $x \in [0, 1]$. To see why, consider the gradient of the segment joining two neighbouring points:
$$m_k = \frac{L_k - L_{k-1}}{x_k - x_{k-1}} = \frac{s_k}{0.1} = 10\,s_k .$$
Suppose the population has $P$ people with mean welfare $\mu$, and decile $k$ has mean welfare $\mu_k$. The decile contains $0.1P$ people, so its share of the total is $s_k = \dfrac{0.1P\,\mu_k}{P\,\mu}$, and therefore
$$m_k = \frac{10 \times 0.1P\,\mu_k}{P\,\mu} = \frac{\mu_k}{\mu} .$$
This was the most useful thing I found while studying Lorenz curves: **the gradient of the curve is the mean welfare of that part of the population divided by the national mean.** Since people are ranked from poorest to richest, $\mu_1 \le \mu_2 \le \dots \le \mu_{10}$, so the gradient never decreases and the curve is convex (concave up).

**Condition 4: non-exceedance.** $L(x) \le x$. A convex curve lies below the chord joining its end points, and by Condition 1 that chord is the line $y = x$.

Table 3 checks Condition 3 on the real data.

«T_grad()»

Table: Table 3. Gradients $10s_k = \mu_k/\mu$ of the segments between neighbouring Lorenz points.

In both countries the gradients increase with every decile, so the data satisfy Condition 3. The gradients also give a concrete picture of inequality: the richest tenth of South Africans consume on average «f(10*Z.shares[9],2)» times the national mean, and the poorest tenth only «f(10*Z.shares[0],2)» times it. In Norway the same two numbers are «f(10*N.shares[9],2)» and «f(10*N.shares[0],2)».

## 3.2 From area to the Gini formula

If everyone had exactly the same welfare, every fraction $x$ of the population would hold the same fraction $x$ of the total, and the Lorenz curve would be the **line of perfect equality** $y = x$. The Gini coefficient $G$ measures how far the real curve sags below this line. It is defined as the area between $y = x$ and $L(x)$, divided by the whole area under $y = x$:
$$G = \frac{\int_0^1 \big(x - L(x)\big)\,dx}{\int_0^1 x\,dx} .$$
The denominator is
$$\int_0^1 x\,dx = \left[\frac{x^2}{2}\right]_0^1 = \frac12 - 0 = \frac12 ,$$
and, splitting the integral in the numerator,
$$\int_0^1 \big(x - L(x)\big)\,dx = \int_0^1 x\,dx - \int_0^1 L(x)\,dx = \frac12 - \int_0^1 L(x)\,dx .$$
Therefore
$$G = \frac{\frac12 - \int_0^1 L(x)\,dx}{\frac12} = 1 - 2\int_0^1 L(x)\,dx .$$
In the rest of this exploration I write $A = \int_0^1 L(x)\,dx$ for the area under the Lorenz curve, so that $G = 1 - 2A$.

I checked that this formula behaves sensibly. With perfect equality, $L(x) = x$, so $A = \frac12$ and $G = 0$. If one person held all the welfare, $L(x)$ would be 0 until the very last person, so $A$ would be close to 0 and $G$ close to 1. So $0 \le G \le 1$, and a larger $G$ means more inequality. The limits of integration must be 0 and 1 because $x$ runs from none of the population to all of it. If I stopped at $x = 0.9$, I would ignore the richest 10%, who hold the largest share of all. PIP gives $G$ on the scale 0 to 1, and I use that scale throughout.

Since I only know $L$ at 11 points, I cannot integrate it directly. I compare two ways of finding $A$: joining the points with straight lines (Section 4), and fitting a cubic polynomial and integrating it exactly (Sections 5 and 6).

# 4. Discrete benchmark: the trapezium rule

## 4.1 Calculation

The simplest way to estimate $A$ is to join neighbouring points with straight lines and add up the areas of the 10 trapezia underneath. Each has width $h = 0.1$, so the trapezium rule gives
$$A_T = \frac{h}{2}\left[L(0) + 2\sum_{k=1}^{9} L(x_k) + L(1)\right] = 0.05\left(0 + 2\sum_{k=1}^{9} L_k + 1\right) = 0.05 + 0.1\sum_{k=1}^{9} L_k ,$$
and the corresponding Gini estimate is
$$G_T = 1 - 2A_T = 1 - 0.1 - 0.2\sum_{k=1}^{9} L_k = 0.9 - 0.2\sum_{k=1}^{9} L_k .$$
Adding the values of $L_1$ to $L_9$ in Table 2:

| | $\sum_{k=1}^{9} L_k$ | $A_T = 0.05 + 0.1\sum L_k$ | $G_T = 1 - 2A_T$ | Published $G_{\text{WB}}$ |
|---|---:|---:|---:|---:|
| South Africa | «f(Z.trap.sum_interior_L)» | «f(Z.trap.area)» | «f(Z.trap.gini)» | «f(Z.gini_official)» |
| Norway | «f(N.trap.sum_interior_L)» | «f(N.trap.area)» | «f(N.trap.gini)» | «f(N.gini_official)» |

Table: Table 4. Trapezium-rule estimates.

For South Africa, $A_T = 0.05 + 0.1 \times «f(Z.trap.sum_interior_L)» = «f(Z.trap.area)»$ and $G_T = 1 - 2 \times «f(Z.trap.area)» = «f(Z.trap.gini)»$. For Norway, $A_T = 0.05 + 0.1 \times «f(N.trap.sum_interior_L)» = «f(N.trap.area)»$ and $G_T = 1 - 2 \times «f(N.trap.area)» = «f(N.trap.gini)»$.

## 4.2 Why the trapezium rule underestimates $G$

Before comparing with the published values, I worked out which way the error had to go. By Condition 3, the true Lorenz curve is convex, since $L''(x) \ge 0$. For a convex function, the straight chord joining two points on the graph lies on or above the graph between them. Each trapezium therefore contains a thin sliver of extra area above the true curve, so the trapezium rule overestimates the area: $A_T \ge A$. Since $G = 1 - 2A$, a larger area gives a smaller Gini coefficient, so
$$G_T \le G_{\text{WB}} .$$
My results agree for both countries: $«f(Z.trap.gini,4)» < «f(Z.gini_official,4)»$ and $«f(N.trap.gini,4)» < «f(N.gini_official,4)»$. This also reassured me that the published shares and the published Gini coefficients are consistent with each other.

There is a second way to understand the gap. If everyone *inside* each decile had exactly the same welfare, the Lorenz curve would be made of straight segments, and its Gini coefficient would be exactly $G_T$. So the difference $G_T - G_{\text{WB}}$ measures the inequality *within* the deciles, which ten shares cannot show. I call it the **grouping error**. It is $«f(DZ.grouping,4)»$ for South Africa and $«f(DN.grouping,4)»$ for Norway. South Africa's grouping error is about «f(DZ.grouping/DN.grouping,1)» times Norway's, but as a percentage of $G_{\text{WB}}$ the two are almost the same («pct(Z.trap.pct_err)» and «pct(N.trap.pct_err)»). This told me what a cubic model would have to do to beat the benchmark: bend *below* the chords, as the true curve does, and so recover some of the missing inequality.

# 5. Model 1: unconstrained least-squares cubic

## 5.1 Least-squares regression

Model 1 is the general cubic
$$\hat L(x) = ax^3 + bx^2 + cx + d ,$$
where $a$, $b$, $c$ and $d$ are constants and the hat shows that $\hat L$ is a model of $L$. For each data point, the residual $e_k = L_k - \hat L(x_k)$ is the vertical gap between the data and the model. Least-squares regression chooses the coefficients that make the residual sum of squares
$$SS_{res} = \sum_{k=0}^{10} e_k^{\,2}$$
as small as possible. Squaring stops positive and negative residuals from cancelling out and makes $SS_{res}$ a smooth function of the coefficients that can be minimised by differentiation. Minimising with four unknowns at once goes beyond AA SL, so I used cubic regression on all 11 points, the same calculation as the CubicReg function of a GDC.

## 5.2 Fitted equations, $R^2$ and residuals

$$\text{South Africa:}\quad \hat L(x) = «poly(Z.cubic.a, Z.cubic.b, Z.cubic.c, Z.cubic.d)»$$
$$\text{Norway:}\quad \hat L(x) = «poly(N.cubic.a, N.cubic.b, N.cubic.c, N.cubic.d)»$$

I did not want to just trust the output, so I recalculated every residual and the coefficient of determination
$$R^2 = 1 - \frac{SS_{res}}{SS_{tot}}, \qquad SS_{tot} = \sum_{k=0}^{10}\big(L_k - \bar L\big)^2 ,$$
where $\bar L$ is the mean of the 11 values of $L_k$. $R^2$ is the proportion of the variation in $L_k$ that the model explains. For South Africa $\bar L = «f(DZ.Lbar)»$, and for Norway $\bar L = «f(DN.Lbar)»$.

«T_m1('ZAF')»

Table: Table 5. Residuals of Model 1 for South Africa.

«T_m1('NOR')»

Table: Table 6. Residuals of Model 1 for Norway.

South Africa: $$R^2 = 1 - \frac{«f(Z.cubic.ss_res,7)»}{«f(Z.cubic.ss_tot,7)»} = «f(Z.cubic.r2,4)»$$ Norway: $$R^2 = 1 - \frac{«f(N.cubic.ss_res,7)»}{«f(N.cubic.ss_tot,7)»} = «f(N.cubic.r2,4)»$$

So Model 1 explains «f(Z.cubic.r2*100,1)»% of the variation in $L_k$ for South Africa and «f(N.cubic.r2*100,1)»% for Norway. At first these looked like excellent fits. The graphs and the residuals, however, told a different story.

![Figure 2. South Africa: decile points (dots), Model 1 (solid line), Model 2 (dash-dot line, introduced in Section 6) and the line of equality (dashed line). The right-hand panel zooms in on $0 \le x \le 0.4$.](output/fig2_models_ZAF.png){width=13.5cm}

![Figure 3. Norway: decile points (dots), Model 1 (solid line), Model 2 (dash-dot line) and the line of equality (dashed line). The right-hand panel zooms in on $0 \le x \le 0.4$.](output/fig3_models_NOR.png){width=13.5cm}

![Figure 4. Residuals of Model 1 (circle markers, solid line) and Model 2 (square markers, dash-dot line), on the same vertical scale for both countries.](output/fig4_residuals.png){width=13.5cm}

I noticed that in both countries the residuals of Model 1 follow exactly the same sign pattern, (+, −, −, −, +, +, +, +, −, −, +) (Figure 4). This is a wave, not random scatter. My data points are not noisy measurements; they are exact summaries of each survey. So the residuals are not "error" in the usual statistical sense. Instead, they show **where the shape of the cubic is wrong**. The largest residual in both countries is at $x = 0.9$ ($«f(Z.cubic.residuals[9],4)»$ for South Africa and $«f(N.cubic.residuals[9],4)»$ for Norway), where the model lies above the data because it cannot rise steeply enough for the richest group. The South African residuals are about three times as large as the Norwegian ones.

## 5.3 Definite integration and $G_1$

Integrating term by term,
$$\int_0^1 \big(ax^3 + bx^2 + cx + d\big)\,dx = \left[\frac{a}{4}x^4 + \frac{b}{3}x^3 + \frac{c}{2}x^2 + dx\right]_0^1 = \frac a4 + \frac b3 + \frac c2 + d ,$$
because every term is 0 at $x = 0$. Calling this area $A_1$, the Gini estimate is $G_1 = 1 - 2A_1$.

South Africa: $$A_1 = «f(Z.cubic.a/4,7)»«signed(Z.cubic.b/3,7)»«signed(Z.cubic.c/2,7)»«signed(Z.cubic.d,7)» = «f(Z.cubic.area,7)»,$$ $$G_1 = 1 - 2(«f(Z.cubic.area,7)») = «f(Z.cubic.gini)»$$
Norway: $$A_1 = «f(N.cubic.a/4,7)»«signed(N.cubic.b/3,7)»«signed(N.cubic.c/2,7)»«signed(N.cubic.d,7)» = «f(N.cubic.area,7)»,$$ $$G_1 = 1 - 2(«f(N.cubic.area,7)») = «f(N.cubic.gini)»$$

Both estimates are below the published values, by «f(Z.cubic.abs_err,4)» for South Africa and «f(N.cubic.abs_err,4)» for Norway.

## 5.4 Testing Model 1 against the conditions

**Condition 1.** $\hat L(0) = d$ and $\hat L(1) = a + b + c + d$. For South Africa these are $«f(Z.cubic.d,4)»$ and $«f(Z.cubic.checks.L1,4)»$ instead of 0 and 1, so the model describes a population that holds only «f(Z.cubic.checks.L1*100,1)»% of its own welfare. Norway has the same problem on a smaller scale. This also undermines $G_1$ itself, because the formula $G = 1 - 2A$ assumes that $L(1) = 1$.

**Condition 2.** $\hat L'(x) = 3ax^2 + 2bx + c$ is a quadratic. For South Africa,
$$\hat L'(x) = «f(3*Z.cubic.a)»x^2«signed(2*Z.cubic.b)»x«signed(Z.cubic.c)»,$$
with discriminant $(2b)^2 - 4(3a)c = «f(DZ.cubic_disc,3)» < 0$. A quadratic with a negative discriminant and a positive leading coefficient is positive for every $x$, so the model is increasing. Norway's discriminant is $«f(DN.cubic_disc,3)»$, so the same is true. Model 1 passes this condition.

**Values between 0 and 1.** Since the model is increasing, its least and greatest values on $[0,1]$ are $\hat L(0)$ and $\hat L(1)$. $\hat L(0) < 0$, so the model starts below zero. Solving $\hat L(x) = 0$ shows that it predicts **negative cumulative shares** for $0 \le x < «f(DZ.n_neg,4)»$ in South Africa and $0 \le x < «f(DN.n_neg,4)»$ in Norway, which is impossible.

**Condition 3.** $\hat L''(x) = 6ax + 2b$. For South Africa $\hat L''(x) = «f(6*Z.cubic.a)»x«signed(2*Z.cubic.b)»$, so $\hat L''(0) = «f(2*Z.cubic.b,3)» < 0$, and $\hat L''(x) = 0$ at the point of inflection $x = -\dfrac{b}{3a} = «f(Z.cubic.checks.inflection_x,4)»$. The model is therefore concave *down* for the poorest «f(Z.cubic.checks.inflection_x*100,0)»% of South Africans. Using the meaning of the gradient from Section 3.1, this says that South Africans around the 30th percentile have *less* than the very poorest people, which contradicts the ranking of the population. For Norway, $\hat L''(0) = «f(2*N.cubic.b,3)»$ and the wrong section only covers the poorest «f(N.cubic.checks.inflection_x*100,0)»%.

**Condition 4.** Let $g(x) = \hat L(x) - x$. Solving $g'(x) = 3ax^2 + 2bx + (c - 1) = 0$ gives only one solution in $[0,1]$: $x = «f(DZ.gs1.inside[0],3)»$ for South Africa and $x = «f(DN.gs1.inside[0],3)»$ for Norway. There $g''(x) = 6ax + 2b > 0$, so it is a minimum, and the largest value of $g$ on $[0,1]$ must be at an end point. For South Africa, $g(0) = «f(Z.cubic.d,4)»$ and $g(1) = «f(Z.cubic.checks.L1 - 1,4)»$ are both negative, so $\hat L(x) < x$ on the whole interval. The same holds for Norway, so Model 1 passes this condition.

Model 1 therefore fails Condition 1, gives negative values near $x = 0$, and fails Condition 3 near the origin, in both countries. It only passes Conditions 2 and 4.

## 5.5 Reflection on $R^2$

This was the point where I stopped trusting $R^2$. I had expected an $R^2$ above 0.98 to mean that the model was essentially correct. Instead, the model with that $R^2$ predicts negative consumption shares for the poorest South Africans, misses both end points, and bends the wrong way for almost a third of the population. When I thought about why, I realised that the 11 points rise so smoothly that almost *any* smooth increasing curve would score close to 1. $R^2$ only measures vertical distances at 11 points; it says nothing about the conditions a Lorenz curve must satisfy, or about the area between the points, which is what the Gini coefficient actually depends on. A near-perfect $R^2$ does not guarantee that a model is valid or meaningful. This led to my next decision: instead of hoping that the regression would pass through $(0,0)$ and $(1,1)$, I would force it to.

# 6. Model 2: constrained cubic through $(0, 0)$ and $(1, 1)$

## 6.1 Applying the boundary constraints

Starting again from $\hat L(x) = ax^3 + bx^2 + cx + d$, Condition 1 gives
$$\hat L(0) = 0 \implies d = 0, \qquad \hat L(1) = 1 \implies a + b + c = 1 \implies c = 1 - a - b .$$
Substituting,
$$\hat L(x) = ax^3 + bx^2 + (1 - a - b)x = x + a(x^3 - x) + b(x^2 - x).$$
The regression functions on a GDC cannot fit a cubic with conditions like these, so I had to fit this model by hand. To do that, I rewrote it in a more useful form.

## 6.2 Symmetric and antisymmetric components

Since $x^3 - x = (x^2 - x)(x + 1)$ and $x + 1 = \left(x - 0.5\right) + 1.5$,
$$x^3 - x = (x - 0.5)(x^2 - x) + 1.5(x^2 - x).$$
Substituting into $\hat L(x) = x + a(x^3 - x) + b(x^2 - x)$ and collecting the $(x^2 - x)$ terms gives
$$\hat L(x) = x + (b + 1.5a)(x^2 - x) + a\,(x - 0.5)(x^2 - x).$$
I define
$$v(x) = x^2 - x, \qquad w(x) = (x - 0.5)(x^2 - x), \qquad \beta = b + 1.5a, \qquad \alpha = a ,$$
so that
$$\hat L(x) = x + \beta\,v(x) + \alpha\,w(x).$$
This is exactly the same family of cubics, described with different coefficients. To return to the usual form, $a = \alpha$, $b = \beta - 1.5\alpha$ and $c = 1 - \beta + 0.5\alpha$.

I centred the second function at $x = 0.5$ on purpose, because of what happens when $x$ is replaced by $1 - x$:
$$v(1 - x) = (1-x)^2 - (1-x) = 1 - 2x + x^2 - 1 + x = x^2 - x = v(x),$$
$$w(1 - x) = (1 - x - 0.5)\,v(1-x) = (0.5 - x)\,v(x) = -w(x).$$
So $v$ is symmetric about $x = 0.5$, while $w$ is antisymmetric: it is positive on $(0, 0.5)$ and negative on $(0.5, 1)$, with the same shape reflected (Figure 5).

![Figure 5. The two building blocks of Model 2: $v(x)$ (dashed line) and $w(x)$ (solid line). The shaded areas under $w(x)$ are equal in size and opposite in sign, and the dots mark $w(x)$ at $x = 0, 0.1, \dots, 1$.](output/fig5_symmetry.png){width=9cm}

## 6.3 Why the cubic term has no effect on the area

$$\int_0^1 v(x)\,dx = \int_0^1 (x^2 - x)\,dx = \left[\frac{x^3}{3} - \frac{x^2}{2}\right]_0^1 = \frac13 - \frac12 = -\frac16 ,$$
$$\int_0^1 w(x)\,dx = \int_0^1 \left(x^3 - 1.5x^2 + 0.5x\right)dx = \left[\frac{x^4}{4} - \frac{x^3}{2} + \frac{x^2}{4}\right]_0^1 = \frac14 - \frac12 + \frac14 = 0 .$$
Since $\int_0^1 x\,dx = \frac12$, the area under Model 2 is
$$A_2 = \int_0^1 \hat L(x)\,dx = \frac12 + \beta\left(-\frac16\right) + \alpha(0) = \frac12 - \frac{\beta}{6},$$
and so
$$G_2 = 1 - 2A_2 = 1 - 2\left(\frac12 - \frac{\beta}{6}\right) = \frac{\beta}{3} .$$
**The Gini coefficient of Model 2 depends only on $\beta$.** Whatever value $\alpha$ takes, the cubic part $\alpha\,w(x)$ adds exactly as much area on one side of $x = 0.5$ as it removes on the other, so it has zero effect on the definite integral.

## 6.4 Least-squares derivation by hand

Let $z_k = L_k - x_k$ (the gap between the data and the line of equality, which is negative), $v_k = v(x_k)$ and $w_k = w(x_k)$. The residuals are $e_k = L_k - \hat L(x_k) = z_k - \beta v_k - \alpha w_k$, so
$$SS_{res}(\beta, \alpha) = \sum_{k=0}^{10}\big(z_k - \beta v_k - \alpha w_k\big)^2 .$$
Expanding the bracket and adding term by term:
$$SS_{res} = \sum z_k^2 - 2\beta\sum v_k z_k - 2\alpha\sum w_k z_k + \beta^2\sum v_k^2 + 2\alpha\beta\sum v_k w_k + \alpha^2\sum w_k^2 .$$

The key step is the mixed term $2\alpha\beta\sum v_k w_k$. The decile points are spaced symmetrically about $0.5$, because $x_{10-k} = 1 - x_k$. By Section 6.2, $v_{10-k} = v_k$ and $w_{10-k} = -w_k$, so
$$v_k w_k + v_{10-k}\,w_{10-k} = v_k w_k - v_k w_k = 0 .$$
The terms cancel in the pairs $(1,9)$, $(2,8)$, $(3,7)$ and $(4,6)$, and the remaining terms are zero because $v_0 = v_{10} = 0$ and $w_5 = 0$. Table 7 confirms that $\sum v_k w_k = 0$. So
$$SS_{res} = \Big(\beta^2\sum v_k^2 - 2\beta\sum v_k z_k\Big) + \Big(\alpha^2\sum w_k^2 - 2\alpha\sum w_k z_k\Big) + \sum z_k^2 .$$
The first bracket contains only $\beta$ and the second contains only $\alpha$, and $\sum z_k^2$ is a constant. Because the brackets share no variable, $SS_{res}$ is as small as possible when each bracket is as small as possible. This splits the problem into two separate one-variable problems. Differentiating the first bracket with respect to $\beta$ and setting the derivative equal to zero:
$$\frac{d}{d\beta}\Big(\beta^2\sum v_k^2 - 2\beta\sum v_k z_k\Big) = 2\beta\sum v_k^2 - 2\sum v_k z_k = 0 \quad\Longrightarrow\quad \beta = \frac{\sum v_k z_k}{\sum v_k^2} .$$
Differentiating the second bracket with respect to $\alpha$ in the same way:
$$\frac{d}{d\alpha}\Big(\alpha^2\sum w_k^2 - 2\alpha\sum w_k z_k\Big) = 2\alpha\sum w_k^2 - 2\sum w_k z_k = 0 \quad\Longrightarrow\quad \alpha = \frac{\sum w_k z_k}{\sum w_k^2} .$$
The second derivatives, $2\sum v_k^2$ and $2\sum w_k^2$, are positive, so both stationary points are minima. The sums $\sum v_k^2$ and $\sum w_k^2$ depend only on the $x$-values, so they are the same for both countries (Table 7).

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

So $\beta = \dfrac{\sum v_k z_k}{0.3333}$ and $\alpha = \dfrac{\sum w_k z_k}{0.01188}$. At every interior point $v_k < 0$ and $z_k < 0$, so $\sum v_k z_k > 0$. This gives $\beta > 0$ and $G_2 = \frac{\beta}{3} > 0$, as a Gini coefficient should be. I also realised what $\alpha$ means. Since $w$ is positive for $x < 0.5$ and negative for $x > 0.5$, $\alpha$ is positive when the data sag further below $y = x$ in the upper half than in the lower half. So **$\beta$ measures how much inequality there is, and $\alpha$ measures where it is concentrated.**

## 6.5 Fitting Model 2 for both countries

«T_m2_sums('ZAF')»

Table: Table 8. Calculation of $\sum v_k z_k$ and $\sum w_k z_k$ for South Africa (Norway's are in Appendix B).

$$\text{South Africa:}\quad \beta = \frac{«f(Z.sums.vz,7)»}{0.3333} = «f(Z.ccubic.beta)», \qquad \alpha = \frac{«f(Z.sums.wz,8)»}{0.01188} = «f(Z.ccubic.alpha)»$$
$$\text{Norway:}\quad \beta = \frac{«f(N.sums.vz,7)»}{0.3333} = «f(N.ccubic.beta)», \qquad \alpha = \frac{«f(N.sums.wz,8)»}{0.01188} = «f(N.ccubic.alpha)»$$

Both values of $\alpha$ are positive, so in both countries inequality is concentrated in the upper half, and much more strongly in South Africa. Converting back to the usual form for South Africa: $a = \alpha = «f(Z.ccubic.alpha)»$, $b = \beta - 1.5\alpha = «f(Z.ccubic.beta,7)» - 1.5(«f(Z.ccubic.alpha,7)») = «f(Z.ccubic.b)»$ and $c = 1 - \beta + 0.5\alpha = 1 - «f(Z.ccubic.beta,7)» + 0.5(«f(Z.ccubic.alpha,7)») = «f(Z.ccubic.c)»$. For Norway: $a = «f(N.ccubic.alpha)»$, $b = «f(N.ccubic.beta,7)» - 1.5(«f(N.ccubic.alpha,7)») = «f(N.ccubic.b)»$ and $c = 1 - «f(N.ccubic.beta,7)» + 0.5(«f(N.ccubic.alpha,7)») = «f(N.ccubic.c)»$. The two models are

$$\text{South Africa:}\quad \hat L(x) = «poly(Z.ccubic.a, Z.ccubic.b, Z.ccubic.c)», \qquad R^2 = «f(Z.ccubic.r2,4)»$$
$$\text{Norway:}\quad \hat L(x) = «poly(N.ccubic.a, N.ccubic.b, N.ccubic.c)», \qquad R^2 = «f(N.ccubic.r2,4)»$$

To make sure my hand method was right, I compared these coefficients with a general least-squares calculation of the same model that does not use $\sum v_k w_k = 0$. They agreed to at least 12 d.p. The fitted values and residuals are listed in Appendix B and drawn in Figure 4.

The Gini estimates are

South Africa: $$G_2 = \frac{\beta}{3} = \frac{«f(Z.ccubic.beta)»}{3} = «f(Z.ccubic.gini)»$$ Norway: $$G_2 = \frac{«f(N.ccubic.beta)»}{3} = «f(N.ccubic.gini)»$$

As a check, I also integrated the usual form, $A_2 = \frac a4 + \frac b3 + \frac c2$. For South Africa, $A_2 = «f(Z.ccubic.a/4,7)»«signed(Z.ccubic.b/3,7)»«signed(Z.ccubic.c/2,7)» = «f(Z.ccubic.area,7)»$, so $G_2 = 1 - 2(«f(Z.ccubic.area,7)») = «f(Z.ccubic.gini)»$. For Norway, $A_2 = «f(N.ccubic.a/4,7)»«signed(N.ccubic.b/3,7)»«signed(N.ccubic.c/2,7)» = «f(N.ccubic.area,7)»$, so $G_2 = 1 - 2(«f(N.ccubic.area,7)») = «f(N.ccubic.gini)»$. Both methods give the same answer.

## 6.6 Testing Model 2 against the conditions

**Condition 1** holds by construction.

**Condition 2.** For South Africa, $\hat L'(x) = «f(3*Z.ccubic.a)»x^2«signed(2*Z.ccubic.b)»x«signed(Z.ccubic.c)»$, with discriminant $«f(DZ.ccubic_disc,3)»$; for Norway, $\hat L'(x) = «f(3*N.ccubic.a)»x^2«signed(2*N.ccubic.b)»x«signed(N.ccubic.c)»$, with discriminant $«f(DN.ccubic_disc,3)»$. Both are negative with positive leading coefficients, so both models are increasing. Since they increase from $\hat L(0) = 0$ to $\hat L(1) = 1$, they never leave the interval $[0,1]$, so they never predict negative shares.

**Condition 4.** Factorising,
$$\hat L(x) - x = \beta v(x) + \alpha w(x) = (x^2 - x)\big[\beta + \alpha(x - 0.5)\big].$$
For $0 < x < 1$ the factor $x^2 - x$ is negative. Since $\alpha > 0$, the square bracket is always greater than its value at $x = 0$, which is $\beta - 0.5\alpha$: this equals $«f(DZ.m2_min_slope_factor,4)»$ for South Africa and $«f(DN.m2_min_slope_factor,4)»$ for Norway. Both are positive, so $\hat L(x) - x < 0$ and the model stays below the line of equality.

**Condition 3.** $\hat L''(x) = 6ax + 2b$, so $\hat L''(0) = 2b$, which is negative in both countries: $«f(2*Z.ccubic.b,3)»$ for South Africa and $«f(2*N.ccubic.b,3)»$ for Norway. The point of inflection is at $x = -\frac{b}{3a} = «f(Z.ccubic.checks.inflection_x,4)»$ for South Africa and $«f(N.ccubic.checks.inflection_x,4)»$ for Norway, so Model 2 is still concave down near the origin.

So Model 2 passes Conditions 1, 2 and 4 and never predicts negative shares, but it still fails Condition 3. For South Africa the concave-down section covers the poorest «f(Z.ccubic.checks.inflection_x*100,0)»% of the population. The model's gradient at $x = 0$ is $«f(Z.ccubic.checks.dL0,3)»$, which says that the poorest South African consumes about «round(Z.ccubic.checks.dL0*100)»% of the national mean, whereas the data say the poorest tenth consume on average only «round(10*Z.shares[0]*100)»% (Table 3).

I expected Model 2 to be more accurate than Model 1, since it is a better Lorenz function. It was not: its Gini estimates («f(Z.ccubic.gini,4)» and «f(N.ccubic.gini,4)») are *further* from the published values. Comparing Figures 2 and 3, I saw that the two curves are almost the same in the middle and only differ near the ends. Model 1 is allowed to drop below $(0,0)$ and $(1,1)$, and in South Africa this lowers its area by «f(-DZ.area_gap,4)» and raises its Gini estimate by «f(-2*DZ.area_gap,4)». So part of Model 1's better accuracy comes from breaking Condition 1. Its answer is closer partly for the wrong reason.

## 6.7 Reflection: the constrained cubic equals the constrained quadratic

Sections 6.3 and 6.4 together led me to the most surprising result of the exploration. The constrained *quadratic* $\hat L(x) = x + b\,v(x) = bx^2 + (1 - b)x$ is simply Model 2 with $\alpha = 0$. Its residual sum of squares is the $\beta$ bracket plus $\sum z_k^2$, so least squares gives exactly $b = \dfrac{\sum v_k z_k}{\sum v_k^2} = \beta$, and its Gini coefficient is also $\dfrac{\beta}{3}$. In plain terms: because the decile points are spaced symmetrically around $x = 0.5$, the cubic part is antisymmetric, pushing the curve up on one side and down on the other by the same amount, so it cancels out of the area integral completely. **With equally spaced deciles, the best-fitting constrained cubic always gives exactly the same Gini coefficient as the best-fitting constrained quadratic.** The proof only uses the symmetry of the $x$-values and $\int_0^1 w(x)\,dx = 0$, so it holds for any country. The same idea also shows that Model 1 gives the same Gini estimate as an unconstrained quadratic (Appendix C).

Because this seemed almost too neat, I checked it with the 2022 data. The constrained quadratics are $\hat L(x) = «f(Z.cquad.b)»x^2«signed(Z.cquad.c)»x$ for South Africa and $\hat L(x) = «f(N.cquad.b)»x^2«signed(N.cquad.c)»x$ for Norway. The unconstrained quadratics are $\hat L(x) = «f(Z.quad.coef[0])»x^2«signed(Z.quad.coef[1])»x«signed(Z.quad.coef[2])»$ and $\hat L(x) = «f(N.quad.coef[0])»x^2«signed(N.quad.coef[1])»x«signed(N.quad.coef[2])»$.

«T_symm()»

Table: Table 9. Cubic and quadratic models fitted to the same data.

Each cubic gives the same Gini estimate as its quadratic to at least 14 d.p.; the tiny remaining difference is rounding inside the computer. South Africa shows the effect most clearly. Adding the cubic term raises $R^2$ from «f(Z.cquad.r2,4)» to «f(Z.ccubic.r2,4)», and it turns a curve that is negative for $0 < x < «f(-Z.cquad.c/Z.cquad.b,4)»$ into one that is never negative. Yet the Gini estimate does not change at all. For Norway, the constrained quadratic is actually the only one of the four models that passes every condition, and it gives exactly the same Gini estimate as Model 2.

This changed how I understand my own research question. The word "cubic" suggests that the cubic term should make the estimate better. For decile data it cannot affect the Gini estimate at all: the estimate is decided entirely by the symmetric part $\beta\,v(x)$, and the cubic term only improves the *shape* of the curve. It also proved something I had only suspected in Section 5.5: $R^2$ does not measure how accurate the Gini estimate is, because $R^2$ went from «f(Z.cquad.r2,2)» to «f(Z.ccubic.r2,2)» without $G$ changing.

# 7. Comparative error analysis and synthesis

## 7.1 Summary of results

«T_summary()»

Table: Table 10. Published Gini coefficients and the three estimates.

«T_err_compare()»

Table: Table 11. Absolute and relative percentage errors of each method.

For example, for Model 1 in South Africa the absolute error is $\left|«f(Z.cubic.gini)» - «f(Z.gini_official)»\right| = «f(Z.cubic.abs_err,4)»$, and the relative percentage error is $\dfrac{«f(Z.cubic.abs_err)»}{«f(Z.gini_official)»} \times 100\%$, which is «pct(Z.cubic.pct_err)».

Every estimate in Table 10 is *below* the published value, so all three methods underestimate inequality in both countries. The trapezium rule is the most accurate method in both countries, followed by Model 1 and then Model 2. For Norway, Model 1 is almost as good as the benchmark (the two differ by only «f(abs(N.cubic.gini - N.trap.gini),4)»), but for South Africa it is clearly worse. Rounded to 1 d.p., every estimate matches the published value (0.5 and 0.3), but rounded to 2 d.p. none of them does. All methods do keep the right order and roughly the right ratio: the published South African value is «f(Z.gini_official/N.gini_official,2)» times the Norwegian one, and the estimates give «f(Z.trap.gini/N.trap.gini,2)» (trapezium rule), «f(Z.cubic.gini/N.cubic.gini,2)» (Model 1) and «f(Z.ccubic.gini/N.ccubic.gini,2)» (Model 2).

I used both types of error on purpose. The absolute error is better for judging a single estimate, because the Gini coefficient is already a proportion and countries are compared by the difference between their values. The relative error is fairer for comparing the method between the countries, because Norway's Gini coefficient is only about half of South Africa's.

## 7.2 Grouping error and model error

To see *why* the models are wrong, I split each total error into two parts using the trapezium estimate $G_T$:
$$G_{\text{model}} - G_{\text{WB}} = (G_T - G_{\text{WB}}) + (G_{\text{model}} - G_T),$$
where $G_{\text{model}}$ is $G_1$ or $G_2$. The first bracket is the grouping error from Section 4.2, which is the same for every method. The second bracket, which I call the model error, is caused by the *shape* of the model compared with straight chords.

«T_decomp()»

Table: Table 12. Splitting each total error into grouping error and model error.

For Norway, Model 1's model error is almost zero, so nearly all of its error comes from only having ten groups. For South Africa, Model 2's model error is even larger than the grouping error. All four model errors are negative. This means that, on average, the cubics lie *above* the straight chords, which is the opposite of what they needed to do to recover the missing inequality (Section 4.2).

## 7.3 End-point derivatives

The derivative explains why both cubic models underestimate the Gini coefficient. Since a true Lorenz curve is convex, its gradient increases, so the gradient at $x = 0$ cannot be larger than the average gradient over the first segment, and the gradient at $x = 1$ cannot be smaller than the average gradient over the last segment:
$$L'(0) \le 10s_1 \qquad\text{and}\qquad L'(1) \ge 10s_{10} .$$

«T_ends()»

Table: Table 13. Gradients at the ends of the curve: data compared with the models.

![Figure 6. The gradient of each model, $d\hat L/dx$, compared with the average gradient $10s_k$ of each data segment (thick horizontal segments). Model 1 is the solid line and Model 2 the dash-dot line.](output/fig6_gradients.png){width=13.5cm}

Both models break **both** conditions in both countries (Table 13 and Figure 6). For South Africa, Model 1's gradient at $x = 0$ is «f(Z.cubic.checks.dL0/(10*Z.shares[0]),1)» times the largest value it could have, and both models are too flat at $x = 1$. In everyday terms, **the cubics make the poorest people look better off, and the richest people look less rich, than the data show.** A curve that rises too fast at the start and too slowly at the end lies above the data near both ends, which is visible in the negative residuals at $x = 0.1, 0.2, 0.8$ and $0.9$ in Figure 4. The area under the model is therefore too large, and its Gini estimate too small.

## 7.4 Testing the hypothesis

This is exactly where the two countries differ. South Africa's distribution is extremely skewed: the mean is «f(DZ.mean_median,2)» times the median, and the richest tenth hold «f(DZ.top10*100,1)»% of all consumption, with an average gradient of «f(10*Z.shares[9],2)» on the last segment compared with «f(10*N.shares[9],2)» in Norway, and inside that decile the true curve is steeper still. Since $\hat L''(x) = 6ax + 2b$ is only linear, a cubic's gradient cannot change fast enough to follow a curve that is nearly flat for most of the population and almost vertical at the end, whereas Norway's gentler bend is much easier to follow. This is why the South African residuals are about three times the Norwegian ones.

The numbers support my hypothesis from Section 1.3. South Africa's absolute errors are «f(Z.trap.abs_err/N.trap.abs_err,1)» (trapezium rule), «f(Z.cubic.abs_err/N.cubic.abs_err,1)» (Model 1) and «f(Z.ccubic.abs_err/N.ccubic.abs_err,1)» (Model 2) times Norway's. The relative errors of both cubic models are also larger for South Africa («pct(Z.cubic.pct_err)» against «pct(N.cubic.pct_err)» for Model 1, and «pct(Z.ccubic.pct_err)» against «pct(N.ccubic.pct_err)» for Model 2), while for the trapezium rule they are almost equal. The choice of method also matters much more for South Africa: its three estimates span «f(Z.trap.gini - Z.ccubic.gini,4)», compared with «f(N.trap.gini - N.ccubic.gini,4)» for Norway. So the grouping error grows roughly in proportion to $G$, but the model error grows much faster as the Lorenz curve becomes more strongly curved. That is what I meant by the inflection limits of a single cubic.

# 8. Critical evaluation, extensions and conclusion

## 8.1 Strengths

Every integral was calculated exactly, and every worked calculation was checked. The trapezium benchmark gave a fair, model-free meaning to "accurately", and its prediction $G_T \le G_{\text{WB}}$ followed from convexity and was confirmed. Model 2 was derived and fitted entirely with AA SL methods and checked against a general least-squares calculation. Most importantly, I tested every model against the conditions for a Lorenz curve instead of judging it by $R^2$, which is what revealed the real weaknesses of the cubic models.

## 8.2 Limitations

**The rigid shape of a cubic.** A cubic has a linear second derivative and so at most one point of inflection: it cannot be very steep at the top and correctly curved at the bottom at the same time. All four fitted cubics were concave down near $x = 0$, which produced the model errors in Table 12.

**No detail within the top decile.** Ten shares cannot show inequality inside each decile, which matters most at the top: the richest 10% of South Africans hold «f(DZ.top10*100,1)»% of consumption, but the data give only one number for this whole group. No method using only these 11 points can be sure of recovering the grouping error of «f(-DZ.grouping,4)» (South Africa) or «f(-DN.grouping,4)» (Norway).

**Other limitations.** Least squares minimises vertical distances at 11 points and treats them as separate pieces of information, although each $L_k$ contains all the earlier shares, and a smaller $SS_{res}$ does not mean a smaller error in area (Section 6.7). The published Gini coefficient is itself an estimate from a sample survey, so "accurate" here means close to the published value, not to the true inequality of the whole population. South Africa's consumption data and Norway's income data measure different things (Section 2.3), which does not affect my accuracy comparison but does mean the two published values should not be compared as if they measured the same thing. Rounding is negligible, because I kept the 12 d.p. of the file throughout, so it only affects the 6th or 7th decimal place. Finally, PIP is updated regularly, and its September 2026 update revised one earlier estimate (PIP Technical Team, 2026), so my results apply to the version of the data I downloaded.

## 8.3 Extensions

The main weakness of the cubic is its shape, so a natural next step would be to use functions that can become very steep near $x = 1$. The simplest is the fractional power function $L(x) = x^p$ with $p > 1$. It automatically satisfies all four conditions: $L(0) = 0$ and $L(1) = 1$, $L'(x) = px^{p-1} \ge 0$, and $L''(x) = p(p-1)x^{p-2} \ge 0$. Its Gini coefficient is easy to find:
$$G = 1 - 2\int_0^1 x^p\,dx = 1 - 2\left[\frac{x^{p+1}}{p+1}\right]_0^1 = 1 - \frac{2}{p+1} = \frac{p-1}{p+1} .$$
The parameter $p$ could be fitted with logarithms, since $\ln L = p\ln x$ is a straight line through the origin. A second idea would be a piecewise cubic spline: separate cubic pieces on each interval $[x_{k-1}, x_k]$ that pass through every data point and join smoothly. The whole question would then be how the curve bends *between* the points. If each piece were kept convex, the spline would lie below the chords, so its Gini estimate would be at least $G_T$. It could therefore recover part of the grouping error instead of adding to it.

## 8.4 Conclusion

My research question asked to what extent cubic polynomial regression models and definite calculus integration of Lorenz curves can accurately estimate the Gini coefficient of inequality in South Africa compared to Norway. My answer is: **to a limited extent.**

The method gives the right general picture. The cubic estimates are within 2.4% to 5.5% of the published values, they are correct to 1 decimal place, and they correctly show that South Africa's Gini coefficient is about twice Norway's. For South Africa (consumption, $G_{\text{WB}} = «f(Z.gini_official,4)»$), Model 1 gave «f(Z.cubic.gini,4)», an absolute error of «f(Z.cubic.abs_err,4)» («pct(Z.cubic.pct_err)»), and Model 2 gave «f(Z.ccubic.gini,4)», an error of «f(Z.ccubic.abs_err,4)» («pct(Z.ccubic.pct_err)»). For Norway (income, $G_{\text{WB}} = «f(N.gini_official,4)»$), Model 1 gave «f(N.cubic.gini,4)», an error of «f(N.cubic.abs_err,4)» («pct(N.cubic.pct_err)»), and Model 2 gave «f(N.ccubic.gini,4)», an error of «f(N.ccubic.abs_err,4)» («pct(N.ccubic.pct_err)»).

However, the method is not accurate to 2 decimal places, every estimate is too low, and neither cubic did better than simply joining the points with straight lines: the trapezium rule had the smallest errors in both countries («pct(Z.trap.pct_err)» and «pct(N.trap.pct_err)»). Every cubic had $R^2 > 0.98$, but Model 1 is not a valid Lorenz curve, and both models bend the wrong way for the poorest part of the population. As I predicted, the method is clearly less accurate for South Africa, with errors 2 to 3 times larger than Norway's, because South Africa's Lorenz curve turns so sharply at the top.

Three things limit the accuracy: the grouped data hide inequality within each decile, which pushes every estimate down; the rigid shape of a cubic adds a further underestimate that grows with inequality; and with equally spaced deciles the cubic term has no effect on the Gini estimate at all, which I proved and then confirmed with the data. These conclusions come from one year and two countries with different welfare measures, so I would not claim that they hold everywhere, but they suggest that a cubic model of decile data will tend to underestimate the Gini coefficient, especially in very unequal countries. The most valuable thing this exploration taught me is that a model can fit the data almost perfectly and still describe something impossible, so checking a model against the mathematics of what it represents matters far more than its $R^2$.

## 8.5 Declaration of tools used

The data were downloaded from the World Bank PIP data service. The regression coefficients, sums, residuals and integrals were calculated with a short Python program (NumPy), which also drew the graphs (Matplotlib). The coefficients of Model 1 are the same as those given by the cubic regression function (CubicReg) of a GDC, which can be used to reproduce them from the data in Table 2. The hand method for Model 2 was checked against a general least-squares calculation that does not assume $\sum v_k w_k = 0$, and every worked calculation in the text was recalculated from its rounded values to make sure that the working shown gives the answer shown. An AI assistant (Claude, made by Anthropic) was used during this exploration to help check the World Bank data, write the Python calculations, typeset the document and draft parts of the written explanation. This use is acknowledged here in line with the IB academic integrity policy.

# References

Hasell, J., & Arriagada, P. (n.d.). *Data on poverty by the World Bank Poverty and Inequality Platform* [Dataset documentation]. Our World in Data. https://github.com/owid/poverty-data/blob/main/datasets/pip_README.md

Lorenz, M. O. (1905). Methods of measuring the concentration of wealth. *Publications of the American Statistical Association, 9*(70), 209–219. https://doi.org/10.2307/2276207

PIP Technical Team. (2026, September 22). *PIP data update on September 22, 2026*. World Bank. https://worldbank.github.io/PIP_data_updates/posts/2026-09-22-pip-data-update/

Statistics South Africa. (2025). *Income & Expenditure Survey (IES) 2022/2023*. https://www.statssa.gov.za/?p=17995

World Bank. (2022). *Poverty and Inequality Platform methodology handbook* (Version 2022-04). https://worldbank.github.io/PIP-Methodology-2022-04/

World Bank. (2026). *Poverty and Inequality Platform* (Version September 2026) [Data set]. Retrieved September 23, 2026, from https://api.worldbank.org/pip/v1/pip?country=ZAF,NOR&year=all&povline=3&fill_gaps=false&format=csv

# Appendix A. The 2022 data

These are the unrounded values exactly as they appear in the PIP file, as proportions of total welfare.

«T_raw()»

Table: Table A1. Decile shares and published Gini coefficients, 2022.

# Appendix B. Model 2 working for Norway and residuals

«T_m2_sums('NOR')»

Table: Table B1. Calculation of $\sum v_k z_k$ and $\sum w_k z_k$ for Norway.

«T_m2_resid()»

Table: Table B2. Fitted values and residuals of Model 2.

# Appendix C. Model 1 and the unconstrained quadratic give the same Gini estimate

Let $t = x - 0.5$, so the $t$-values $-0.5, -0.4, \dots, 0.5$ are symmetric about 0, and write any cubic as $\hat L = p + qt + rt^2 + st^3$, where $p$, $q$, $r$ and $s$ are constants. Then
$$\int_0^1 \hat L\,dx = \int_{-0.5}^{0.5}\big(p + qt + rt^2 + st^3\big)\,dt = p + \frac{r}{12},$$
because $\displaystyle\int_{-0.5}^{0.5} t\,dt = \left[\frac{t^2}{2}\right]_{-0.5}^{0.5} = 0$, $\displaystyle\int_{-0.5}^{0.5} t^2\,dt = \left[\frac{t^3}{3}\right]_{-0.5}^{0.5} = \frac1{12}$ and $\displaystyle\int_{-0.5}^{0.5} t^3\,dt = \left[\frac{t^4}{4}\right]_{-0.5}^{0.5} = 0$. So the Gini estimate depends only on $p$ and $r$.

In $SS_{res} = \sum\big(L_k - (p + rt_k^2) - (qt_k + st_k^3)\big)^2$, the only terms that mix $(p, r)$ with $(q, s)$ are $2\sum (p + rt_k^2)(qt_k + st_k^3)$. Every product in this sum contains an odd power of $t_k$, and these cancel in the pairs $t_k$ and $-t_k$. So $SS_{res}$ splits into a part that contains only $p$ and $r$ and a part that contains only $q$ and $s$. The same $p$ and $r$ minimise the first part whether or not the $t^3$ term is included, so the least-squares cubic and the least-squares quadratic have the same $p$ and $r$, and therefore the same Gini estimate (confirmed in Table 9).
