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

I chose South Africa and Norway because they are structural opposites on the inequality spectrum. South Africa has a very high concentration of consumption: its published 2022 Gini coefficient is «f(Z.gini_official,4)», and the richest tenth of the population accounts for «f(DZ.top10*100,1)»% of all consumption. Norway has a much more equal income distribution: its published 2022 Gini coefficient is «f(N.gini_official,4)», and the richest tenth receives «f(DN.top10*100,1)»% of all income. Comparing the two lets me test the same method on two very different shapes of curve.

## 1.3 Hypothesis

In a very unequal country, the Lorenz curve (explained in Section 3) stays almost flat for the lower deciles and then turns steeply upward for the top decile. A cubic polynomial can only bend in a limited way, so I suspected it would not be flexible enough to follow such a sudden change. My hypothesis before doing any calculations was: **a cubic model will estimate the Gini coefficient less accurately for South Africa than for Norway, because South Africa's Lorenz curve bends too sharply for a single cubic to follow.**

## 1.4 What "accurately" means

Nobody knows the true level of inequality in a country exactly, so "accurately" cannot mean "equal to the truth". In this exploration it means how close my estimate is to the Gini coefficient that the World Bank published for the same survey, which I call $G_{\text{WB}}$. For any estimate $G_{\text{est}}$, I measure this with the absolute error, the size of the difference between $G_{\text{est}}$ and $G_{\text{WB}}$, and the relative percentage error, which is the absolute error divided by $G_{\text{WB}}$ and multiplied by 100%. I also wanted a fair standard to compare against, so I used a benchmark that needs no model at all: joining the data points with straight lines and applying the trapezium rule. If a cubic model does not get closer to $G_{\text{WB}}$ than simply joining the dots, then fitting it has not made the estimate more accurate.

# 2. Data collection and methodological caveats

## 2.1 Source and checks

I downloaded the data from the World Bank's Poverty and Inequality Platform (PIP) as one CSV file containing every survey year for South Africa and Norway (World Bank, 2026). The file only contains years in which a survey actually took place, and I used only the 2022 row for each country. Before doing any mathematics, I checked the information in Table 1.

«T_meta()»

Table: Table 1. Information in the 2022 rows of the PIP file.

Both rows come from national surveys, are not interpolated, and were calculated by the World Bank from individual household records. South Africa's data come from its Income and Expenditure Survey (IES), which collected information from November 2022 to November 2023 (Statistics South Africa, 2025), while Norway's come from EU-SILC, the European survey of income and living conditions. The mean is «f(DZ.mean_median,2)» times the median in South Africa, but only «f(DN.mean_median,2)» times the median in Norway. A mean far above the median means that a small group at the top has very high values that pull the average up.

## 2.2 Decile shares and cumulative shares

Each decile is one tenth of the population, ranked from poorest to richest. For $k = 1, 2, \dots, 10$, I write $s_k$ for the share of total welfare received by decile $k$, where decile 1 is the poorest 10%. The ten shares add up to 1. To turn them into points on a Lorenz curve, I need running totals. For $k = 0, 1, \dots, 10$, let $x_k$ be the cumulative share of the population and $L_k$ the cumulative share of welfare:
$$x_k = \frac{k}{10}, \qquad L_k = s_1 + s_2 + \dots + s_k, \qquad L_0 = 0 .$$
The point $(x_k, L_k)$ means "the poorest $100x_k$% of the population receive $100L_k$% of total welfare".

<!--calc-->
For example, for South Africa $L_1 = s_1 = «f(Z.L[1])»$ and $L_2 = L_1 + s_2 = «f(Z.L[1])» + «f(Z.shares[1])» = «f(Z.L[2])»$.
<!--/calc-->

Continuing in the same way for both countries gives Table 2. For both countries the last value is $L_{10} = 1$, which confirms that the shares add up to 1. Together with $(0, 0)$ this gives 11 points from $(0, 0)$ to $(1, 1)$.

«T_cum()»

Table: Table 2. Decile shares $s_k$ and cumulative shares $L_k$, 2022 (6 decimal places).

All calculations use the unrounded values from the file (Appendix A), and I discuss Gini coefficients and errors to 4 decimal places.

![Figure 1. Lorenz points for South Africa (circles, solid line) and Norway (squares, dotted line), 2022. The dashed line is the line of equality.](output/fig1_lorenz_data.png){width=7.5cm}

Figure 1 shows the difference straight away. The poorest 40% of South Africans receive only «f(DZ.bottom40*100,1)»% of total consumption, while the poorest 40% of Norwegians receive «f(DN.bottom40*100,1)»% of total income. South Africa's curve stays low and flat for longer and then rises much more steeply at the end.

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
So the gradient of a Lorenz curve tells us how well off each part of the population is compared with the average. Since people are ranked from poorest to richest, the gradient keeps increasing, which means the curve is convex. The data agree: in South Africa the gradient rises from «f(10*Z.shares[0],2)» for the poorest tenth to «f(10*Z.shares[9],2)» for the richest tenth, and in Norway from «f(10*N.shares[0],2)» to «f(10*N.shares[9],2)».

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
| South Africa | «f(Z.trap.sum_interior_L)» | «f(Z.trap.area)» | «f(Z.trap.gini)» | «f(Z.gini_official)» |
| Norway | «f(N.trap.sum_interior_L)» | «f(N.trap.area)» | «f(N.trap.gini)» | «f(N.gini_official)» |

Table: Table 3. Trapezium-rule estimates.

<!--calc-->
For South Africa, $A_T = 0.05 + 0.1 \times «f(Z.trap.sum_interior_L)» = «f(Z.trap.area)»$, so $G_T = 1 - 2 \times «f(Z.trap.area)» = «f(Z.trap.gini)»$.
<!--/calc-->

Before comparing with the published values, I worked out which way the error had to go. Because the true Lorenz curve is convex (Condition 3), it bends *below* the straight line joining any two neighbouring points. Each trapezium therefore contains a thin sliver of extra area above the true curve, so the trapezium rule overestimates the area. Since $G = 1 - 2A$, a larger area gives a smaller Gini coefficient, so the trapezium rule must underestimate $G$. My results agree for both countries: «f(Z.trap.gini,4)» is below «f(Z.gini_official,4)», and «f(N.trap.gini,4)» is below «f(N.gini_official,4)».

There is another way to understand this gap. If everyone *inside* each decile had exactly the same welfare, the Lorenz curve would be made of straight segments and its Gini coefficient would be exactly the trapezium estimate. So the difference between the trapezium estimate and the published value measures the inequality *within* the deciles, which ten shares cannot show. I call it the **grouping error**. It is «f(-DZ.grouping,4)» for South Africa and «f(-DN.grouping,4)» for Norway: about twice as large for South Africa, but almost the same as a percentage («pct(Z.trap.pct_err)» and «pct(N.trap.pct_err)»). This told me what a cubic model would have to do to beat the benchmark: bend below the straight lines, as the true curve does, and recover some of the missing inequality.

# 5. Model 1: unconstrained least-squares cubic

## 5.1 Fitting the model

Model 1 is the general cubic $\hat L(x) = ax^3 + bx^2 + cx + d$, where the hat shows that it is a model of $L$. For each data point, the residual $e_k = L_k - \hat L(x_k)$ is the vertical gap between the data and the model. Least-squares regression chooses the coefficients $a$, $b$, $c$ and $d$ that make the sum of the squared residuals as small as possible:
$$SS_{res} = \sum_{k=0}^{10} e_k^{\,2} .$$
I used cubic regression on all 11 points, which is the same calculation as the cubic regression function on a GDC, and got
$$\text{South Africa:}\quad \hat L(x) = «poly(Z.cubic.a, Z.cubic.b, Z.cubic.c, Z.cubic.d)»$$
$$\text{Norway:}\quad \hat L(x) = «poly(N.cubic.a, N.cubic.b, N.cubic.c, N.cubic.d)»$$

To measure how well each model fits, I used the coefficient of determination $R^2 = 1 - SS_{res} / SS_{tot}$, where $SS_{tot}$ is the sum of the squared differences between each $L_k$ and their mean $\bar L$. I did not want to just trust the output, so I recalculated every residual myself (Tables 4 and 5).

«T_m1('ZAF')»

Table: Table 4. Residuals of Model 1 for South Africa ($\bar L = «f(DZ.Lbar)»$).

«T_m1('NOR')»

Table: Table 5. Residuals of Model 1 for Norway ($\bar L = «f(DN.Lbar)»$).

<!--calc-->
For South Africa $R^2 = 1 - \dfrac{«f(Z.cubic.ss_res,7)»}{«f(Z.cubic.ss_tot,7)»} = «f(Z.cubic.r2,4)»$, and for Norway $R^2 = 1 - \dfrac{«f(N.cubic.ss_res,7)»}{«f(N.cubic.ss_tot,7)»} = «f(N.cubic.r2,4)»$.
<!--/calc-->

So Model 1 explains «f(Z.cubic.r2*100,1)»% of the variation in the data for South Africa and «f(N.cubic.r2*100,1)»% for Norway. At first these looked like excellent fits, but the graphs told a different story.

![Figure 2. The decile points (dots), Model 1 (solid line), Model 2 (dash-dot line, see Section 6) and the line of equality (dotted line).](output/fig2_models.png){width=15cm}

![Figure 3. Residuals of Model 1 (filled circles, solid line) and Model 2 (open squares, dash-dot line), on the same scale for both countries.](output/fig3_residuals.png){width=15cm}

I noticed that in both countries the residuals of Model 1 follow the same pattern of signs (Figure 3): positive, then negative, then positive, then negative, then positive again. This is a wave, not random scatter. My data points are exact summaries of each survey, not noisy measurements, so the residuals show **where the shape of the cubic is wrong**. The largest residual in both countries is at $x = 0.9$, where the model lies above the data because it cannot rise steeply enough for the richest group. The South African residuals are about three times as large as the Norwegian ones.

## 5.2 Definite integration

Integrating term by term,
$$\int_0^1 \big(ax^3 + bx^2 + cx + d\big)\,dx = \left[\frac{a}{4}x^4 + \frac{b}{3}x^3 + \frac{c}{2}x^2 + dx\right]_0^1 = \frac a4 + \frac b3 + \frac c2 + d .$$
Calling this area $A_1$, the Gini estimate is $G_1 = 1 - 2A_1$.

<!--calc-->
South Africa: $$A_1 = «f(Z.cubic.a/4,7)»«signed(Z.cubic.b/3,7)»«signed(Z.cubic.c/2,7)»«signed(Z.cubic.d,7)» = «f(Z.cubic.area,7)», \qquad G_1 = 1 - 2(«f(Z.cubic.area,7)») = «f(Z.cubic.gini)»$$
Norway: $$A_1 = «f(N.cubic.a/4,7)»«signed(N.cubic.b/3,7)»«signed(N.cubic.c/2,7)»«signed(N.cubic.d,7)» = «f(N.cubic.area,7)», \qquad G_1 = 1 - 2(«f(N.cubic.area,7)») = «f(N.cubic.gini)»$$
<!--/calc-->

Both estimates are below the published values: «f(Z.cubic.gini,4)» instead of «f(Z.gini_official,4)» for South Africa, and «f(N.cubic.gini,4)» instead of «f(N.gini_official,4)» for Norway.

## 5.3 Testing Model 1 against the conditions

**Condition 1.** Model 1 does not pass through the end points. For South Africa, $\hat L(0) = d = «f(Z.cubic.d,4)»$ and $\hat L(1) = a + b + c + d = «f(Z.cubic.checks.L1,4)»$, so the model describes a population that holds only «f(Z.cubic.checks.L1*100,1)»% of its own welfare. Norway has the same problem on a smaller scale. This also undermines the Gini estimate itself, because the Gini formula assumes that $L(1) = 1$.

**Condition 2.** The derivative $\hat L'(x) = 3ax^2 + 2bx + c$ is a quadratic with no real roots in both countries (its discriminant is negative) and a positive leading coefficient, so it is always positive and Model 1 is increasing. Model 1 passes this condition.

**Negative values.** Because the model starts below zero, it predicts **negative cumulative shares** for the poorest «f(DZ.n_neg*100,1)»% of South Africans and the poorest «f(DN.n_neg*100,1)»% of Norwegians, which is impossible.

**Condition 3.** The second derivative is $\hat L''(x) = 6ax + 2b$, which is negative at $x = 0$ in both countries because $b < 0$. Solving $\hat L''(x) = 0$ gives the point of inflection $x = -b/(3a)$, which is «f(Z.cubic.checks.inflection_x,2)» for South Africa. So the model is concave *down* for the poorest «f(Z.cubic.checks.inflection_x*100,0)»% of South Africans. Using the meaning of the gradient from Section 3.1, this says that South Africans around the 30th percentile have *less* than the very poorest people, which contradicts the ranking of the population. For Norway this wrong section only covers the poorest «f(N.cubic.checks.inflection_x*100,0)»%.

**Condition 4.** Checking the values of $\hat L(x) - x$ on the interval from 0 to 1 shows that its largest value is at $x = 0$, where it equals «f(Z.cubic.d,4)» for South Africa and «f(N.cubic.d,4)» for Norway. Both are negative, so Model 1 stays below the line of equality and passes this condition.

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

<!--calc-->
South Africa: $$\beta = \frac{«f(Z.sums.vz,7)»}{0.3333} = «f(Z.ccubic.beta)», \qquad \alpha = \frac{«f(Z.sums.wz,8)»}{0.01188} = «f(Z.ccubic.alpha)»$$
Norway: $$\beta = \frac{«f(N.sums.vz,7)»}{0.3333} = «f(N.ccubic.beta)», \qquad \alpha = \frac{«f(N.sums.wz,8)»}{0.01188} = «f(N.ccubic.alpha)»$$
<!--/calc-->

Converting back with $a = \alpha$, $b = \beta - 1.5\alpha$ and $c = 1 - \beta + 0.5\alpha$ gives the two models:
$$\text{South Africa:}\quad \hat L(x) = «poly(Z.ccubic.a, Z.ccubic.b, Z.ccubic.c)», \qquad R^2 = «f(Z.ccubic.r2,4)»$$
$$\text{Norway:}\quad \hat L(x) = «poly(N.ccubic.a, N.ccubic.b, N.ccubic.c)», \qquad R^2 = «f(N.ccubic.r2,4)»$$
I checked my hand method against a general least-squares calculation of the same model, and the coefficients agreed to at least 12 decimal places. Both values of α are positive, which means that in both countries the inequality is concentrated in the upper half of the population, and much more strongly in South Africa.

<!--calc-->
The Gini estimates are $G_2 = \beta / 3 = «f(Z.ccubic.beta)» / 3 = «f(Z.ccubic.gini)»$ for South Africa and $G_2 = «f(N.ccubic.beta)» / 3 = «f(N.ccubic.gini)»$ for Norway. Integrating the usual form of each cubic gives exactly the same values.
<!--/calc-->

## 6.4 Testing Model 2 against the conditions

Model 2 passes Condition 1 by construction. Its derivative has a negative discriminant in both countries, so it is increasing, and since it rises from 0 to 1 it never predicts negative shares. It also stays below the line of equality, because $\hat L(x) - x = (x^2 - x)\big(\beta + \alpha(x - 0.5)\big)$, where the first bracket is negative and the second is positive for $0 < x < 1$. However, Model 2 still fails Condition 3: its second derivative is negative at $x = 0$, with a point of inflection at $x = «f(Z.ccubic.checks.inflection_x,2)»$ for South Africa and $x = «f(N.ccubic.checks.inflection_x,2)»$ for Norway. The model's gradient at $x = 0$ says that the poorest South African consumes about «round(Z.ccubic.checks.dL0*100)»% of the national mean, while the data say the poorest tenth consume on average only «round(10*Z.shares[0]*100)»%.

I expected Model 2 to be more accurate than Model 1, since it is a better Lorenz function. It was not: its Gini estimates («f(Z.ccubic.gini,4)» and «f(N.ccubic.gini,4)») are *further* from the published values. Comparing the two curves in Figure 2, I saw that they are almost the same in the middle and only differ near the ends. Model 1 is allowed to drop below $(0, 0)$ and $(1, 1)$, which lowers its area and raises its Gini estimate by «f(-2*DZ.area_gap,4)» for South Africa. So part of Model 1's better accuracy comes from breaking Condition 1; its answer is closer partly for the wrong reason.

## 6.5 Reflection: the constrained cubic equals the constrained quadratic

Sections 6.2 and 6.3 together led me to the most surprising result of the exploration. The constrained *quadratic* $\hat L(x) = bx^2 + (1 - b)x$ is simply Model 2 without the cubic part. Least squares gives it exactly the same coefficient β, so its Gini coefficient is also β divided by 3. In plain terms: because the decile points are spaced symmetrically around $x = 0.5$, the cubic part of the model pushes the curve up on one side and down on the other by the same amount, so it cancels out of the area integral completely. **With equally spaced deciles, the best-fitting constrained cubic always gives exactly the same Gini coefficient as the best-fitting constrained quadratic.** The same idea shows that Model 1 gives the same Gini estimate as an ordinary quadratic. Because this seemed almost too neat, I checked it with the 2022 data (Table 6).

«T_symm()»

Table: Table 6. Cubic and quadratic models fitted to the same data.

Each cubic gives the same Gini estimate as its quadratic, to at least 14 decimal places. South Africa shows the effect most clearly: adding the cubic term raises $R^2$ from «f(Z.cquad.r2,4)» to «f(Z.ccubic.r2,4)» and turns a curve that goes negative into one that never does, yet the Gini estimate does not change at all. For Norway, the constrained quadratic is actually the only one of the four models that passes every condition, and it gives exactly the same Gini estimate as Model 2.

This changed how I understand my own research question. The word "cubic" suggests that the cubic term should make the estimate better, but for decile data it cannot affect the Gini estimate at all; it only improves the *shape* of the curve. It also proved something I had only suspected in Section 5.4: $R^2$ does not measure how accurate the Gini estimate is, because $R^2$ went from «f(Z.cquad.r2,2)» to «f(Z.ccubic.r2,2)» without the Gini estimate changing.

# 7. Comparative error analysis and synthesis

## 7.1 Summary of results

«T_summary()»

Table: Table 7. Published Gini coefficients and the three estimates.

«T_err_compare()»

Table: Table 8. Absolute and relative percentage errors of each method.

Every estimate is *below* the published value, so all three methods underestimate inequality in both countries. The trapezium rule is the most accurate method in both countries, followed by Model 1 and then Model 2. For Norway, Model 1 is almost as good as the benchmark, but for South Africa it is clearly worse. Rounded to one decimal place, every estimate matches the published value (0.5 and 0.3), but rounded to two decimal places none of them does. All methods do keep the right order and roughly the right ratio: the published South African value is «f(Z.gini_official/N.gini_official,2)» times the Norwegian one, and the estimates give «f(Z.trap.gini/N.trap.gini,2)», «f(Z.cubic.gini/N.cubic.gini,2)» and «f(Z.ccubic.gini/N.ccubic.gini,2)».

I used both types of error on purpose. The absolute error is better for judging a single estimate, because the Gini coefficient is already a proportion and countries are compared by the difference between their values. The relative error is fairer for comparing the method between the two countries, because Norway's Gini coefficient is only about half of South Africa's.

## 7.2 Grouping error and model error

To see *why* the models are wrong, I split each total error into two parts using the trapezium estimate:
$$G_{\text{model}} - G_{\text{WB}} = (G_T - G_{\text{WB}}) + (G_{\text{model}} - G_T).$$
The first part is the grouping error from Section 4, which is the same for every method. The second part, which I call the model error, is caused by the shape of the model compared with straight lines.

«T_decomp()»

Table: Table 9. Splitting each total error into grouping error and model error.

For Norway, Model 1's model error is almost zero, so nearly all of its error comes from only having ten groups. For South Africa, Model 2's model error is even larger than the grouping error. All four model errors are negative, which means that on average the cubics lie *above* the straight lines, the opposite of what they needed to do to recover the missing inequality.

## 7.3 Why both cubic models underestimate

The gradients at the two ends of the curve explain the pattern. Because a real Lorenz curve is convex, its gradient at $x = 0$ cannot be larger than the average gradient of the first decile, and its gradient at $x = 1$ cannot be smaller than the average gradient of the last decile. Both models break both rules in both countries. For South Africa, the data allow a gradient of at most «f(10*Z.shares[0],2)» at $x = 0$, but Model 1 has «f(Z.cubic.checks.dL0,2)» and Model 2 has «f(Z.ccubic.checks.dL0,2)»; at $x = 1$ the gradient should be at least «f(10*Z.shares[9],2)», but the models only reach «f(Z.cubic.checks.dL1,2)» and «f(Z.ccubic.checks.dL1,2)». In everyday terms, **the cubics make the poorest people look better off, and the richest people look less rich, than the data show.** A curve that rises too fast at the start and too slowly at the end lies above the data near both ends, which is visible in the negative residuals at $x = 0.1$, 0.2, 0.8 and 0.9 in Figure 3. The area under the model is therefore too large, and its Gini estimate too small.

## 7.4 Testing the hypothesis

This is exactly where South Africa and Norway differ. South Africa's distribution is extremely skewed, and the richest tenth hold «f(DZ.top10*100,1)»% of all consumption. A cubic's second derivative is only a straight line, so its gradient cannot change fast enough to follow a curve that is nearly flat for most of the population and then almost vertical at the end. Norway's gentler curve is much easier to follow. The numbers support my hypothesis. South Africa's absolute errors are «f(Z.trap.abs_err/N.trap.abs_err,1)» times Norway's for the trapezium rule, «f(Z.cubic.abs_err/N.cubic.abs_err,1)» times for Model 1 and «f(Z.ccubic.abs_err/N.ccubic.abs_err,1)» times for Model 2. The relative errors of both cubic models are also larger for South Africa («pct(Z.cubic.pct_err)» against «pct(N.cubic.pct_err)» for Model 1, and «pct(Z.ccubic.pct_err)» against «pct(N.ccubic.pct_err)» for Model 2), while for the trapezium rule they are almost equal. So the grouping error grows roughly in proportion to the Gini coefficient, but the model error grows much faster as the curve becomes more strongly bent. This is the limit of a single cubic that I expected in my hypothesis.

# 8. Critical evaluation, extensions and conclusion

## 8.1 Strengths

Every integral was calculated exactly, and every worked calculation was checked. The trapezium benchmark gave a fair, model-free meaning to "accurately", and my prediction that it would underestimate the Gini coefficient followed from convexity and was confirmed. Model 2 was fitted by hand with AA SL methods and checked against a general calculation. Most importantly, I tested every model against the conditions for a Lorenz curve instead of judging it by $R^2$, which is what revealed the real weaknesses of the cubic models.

## 8.2 Limitations

**The rigid shape of a cubic.** A cubic can only have one point of inflection, so it cannot be very steep at the top and correctly curved at the bottom at the same time. All four fitted cubics bent the wrong way near $x = 0$, which produced the model errors in Table 9.

**No detail within the top decile.** Ten shares cannot show inequality inside each decile, which matters most at the top: the richest 10% of South Africans hold «f(DZ.top10*100,1)»% of consumption, but the data give only one number for this whole group. No method that uses only these 11 points can be sure of recovering the grouping error.

**Other limitations.** Least squares treats the 11 points as separate pieces of information, although each cumulative share contains all the earlier shares, and a smaller residual sum of squares does not mean a smaller error in area. The published Gini coefficient is itself an estimate from a sample survey, so "accurate" here means close to the published value, not to the true inequality of the whole population. South Africa's consumption data and Norway's income data measure different things, which does not affect my accuracy comparison but does mean the two published values should not be compared as if they measured the same thing. Finally, PIP is updated regularly, and its September 2026 update revised one earlier estimate (PIP Technical Team, 2026), so my results apply to the version of the data I downloaded.

## 8.3 Extensions

The main weakness of the cubic is its shape, so a natural next step would be to use a function that can become very steep near $x = 1$. The simplest is the power function $L(x) = x^p$ with $p > 1$. It automatically satisfies all four conditions, and its Gini coefficient is easy to find:
$$G = 1 - 2\int_0^1 x^p\,dx = 1 - \frac{2}{p+1} = \frac{p-1}{p+1} .$$
The value of $p$ could be found using logarithms. A second idea would be a spline: separate cubic pieces between neighbouring points that pass through every data point and join smoothly. If each piece were kept convex, the spline would lie below the straight lines, so its Gini estimate would be at least as large as the trapezium estimate, and it could recover part of the grouping error instead of adding to it.

## 8.4 Conclusion

My research question asked to what extent cubic polynomial regression models and definite calculus integration of Lorenz curves can accurately estimate the Gini coefficient of inequality in South Africa compared to Norway. My answer is: **to a limited extent.**

The method gives the right general picture. The cubic estimates are within 2.4% to 5.5% of the published values, they are correct to one decimal place, and they correctly show that South Africa's Gini coefficient is about twice Norway's. For South Africa (consumption, published value «f(Z.gini_official,4)»), Model 1 gave «f(Z.cubic.gini,4)» («pct(Z.cubic.pct_err)» error) and Model 2 gave «f(Z.ccubic.gini,4)» («pct(Z.ccubic.pct_err)» error). For Norway (income, published value «f(N.gini_official,4)»), Model 1 gave «f(N.cubic.gini,4)» («pct(N.cubic.pct_err)» error) and Model 2 gave «f(N.ccubic.gini,4)» («pct(N.ccubic.pct_err)» error).

However, the method is not accurate to two decimal places, every estimate is too low, and neither cubic did better than simply joining the points with straight lines: the trapezium rule had the smallest errors in both countries («pct(Z.trap.pct_err)» and «pct(N.trap.pct_err)»). Every cubic had an $R^2$ above 0.98, but Model 1 is not a valid Lorenz curve, and both models bend the wrong way for the poorest part of the population. As I predicted, the method is clearly less accurate for South Africa, with errors 2 to 3 times larger than Norway's, because South Africa's Lorenz curve turns so sharply at the top.

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

<!--calc-->
# Appendix A. The 2022 data

These are the unrounded values exactly as they appear in the PIP file, as proportions of total welfare.

«T_raw()»

Table: Table A1. Decile shares and published Gini coefficients, 2022.

# Appendix B. Model 2 working

«T_m2_sums('ZAF')»

Table: Table B1. Sums for Model 2, South Africa ($z_k = L_k - x_k$).

«T_m2_sums('NOR')»

Table: Table B2. Sums for Model 2, Norway.

«T_m2_resid()»

Table: Table B3. Fitted values and residuals of Model 2.
<!--/calc-->
