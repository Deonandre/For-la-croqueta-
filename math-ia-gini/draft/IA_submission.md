---
title: "Estimating the Gini Coefficient with Cubic Lorenz Curves: South Africa and Norway, 2022"
subtitle: "IB Mathematics: Analysis and Approaches SL, Mathematical Exploration"
abstract-title: "Research question"
abstract: "*To what extent can cubic polynomial regression models and definite calculus integration of Lorenz curves accurately estimate the Gini coefficient of inequality in South Africa compared to Norway, using 2022 World Bank income and consumption distribution data?*"
toc-title: "Table of contents"
---
```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

**Research question**

*To what extent can cubic polynomial regression models and definite calculus integration of Lorenz curves accurately estimate the Gini coefficient of inequality in South Africa compared to Norway, using 2022 World Bank income and consumption distribution data?*

# 1. Introduction

## 1.1 Rationale

The concept of the Gini coefficient was introduced to me while studying international comparisons of wealth and quality of life. Every single comparison made would use terms like "Gini coefficient of 0.3" and "Gini coefficient of 0.6", whereby the larger numerical figure indicated greater inequality. However, no explanation for how such figures were determined was ever given, and nobody ever showed how these numbers were arrived at. Rather frustratingly, upon checking the definition of the Gini coefficient online, I learned that it is calculated from the area between two curves on a graph. Instantly, this turned into a question regarding definite integrals!

The methodology utilized by the World Bank involves analyzing detailed household surveys in order to assess the overall inequality level of each country according to the Lorenz curve approach and the corresponding Gini coefficient measurement. Nonetheless, the published information contains much less detail than the raw data. Instead, percentages of total national income or spending are presented for each decile group. From this information comes my investigation. If I use a cubic polynomial regression function to fit these points, how close will my definite integral be to the official World Bank figure?

## 1.2 Choice of countries

I decided to use South Africa and Norway in tandem with each other since both nations represent opposite ends of the inequality spectrum. Specifically speaking, according to the World Bank, South Africa has a 2022 Gini coefficient of 0.5405, where the wealthiest decile accounts for 42.1 percent of all consumption expenditure. Contrastingly, in Norway, the corresponding figures are 0.2695 and 22.0 percent of all income.

## 1.3 Hypothesis

In a highly unequal society like South Africa, the Lorenz curve (see Section 3 for an explanation) maintains an almost horizontal trend until reaching the top decile, at which point it sharply curves upwards towards the point (1, 1). As a cubic polynomial function has only a limited capacity to curve, my initial guess was that it would be unable to represent the drastic change in gradient. Therefore, my working hypothesis before the mathematical computation process was: **the cubic model's estimate of the Gini coefficient will be less accurate for South Africa than for Norway, due to the sharp bend in the South African curve.**

## 1.4 What "accurately" means

When calculating the level of inequality within a country, one must acknowledge that it will never be completely determined. What we define as accurate does not mean absolutely exact compared with objective reality. Instead, accuracy is defined with regard to our selected reference value: the Gini coefficient officially published by the World Bank for the same survey, which I call $G_{\text{WB}}$. In each of our estimation attempts, accuracy is assessed by applying two standards: the first is the absolute error, which quantifies the size of the gap between the published value ($G_{\text{WB}}$) and the estimate ($G_{\text{est}}$). The second standard is the relative percentage error, which is the absolute error divided by the published value ($G_{\text{WB}}$) and multiplied by 100%.

With the intention of developing a fair benchmark based on linear interpolation, I used the simple trapezium rule, so that a cubic model only counts as more accurate if it gets closer to $G_{\text{WB}}$ than simply joining the data points with straight lines.

# 2. Data collection and methodological caveats

## 2.1 Source and checks

For this investigation, I downloaded the primary dataset from the World Bank Poverty and Inequality Platform (PIP) for South Africa and Norway. These two countries' records were compiled together in a single CSV file for ease of comparative calculations (World Bank, 2026). In selecting our data sample, the constraint was that all selected entries had to include a valid national household survey record. Therefore, we will compare the 2022 survey figures alone in this comparison investigation. Before performing our calculations, however, it is important that we critically examine whether the data presented within Table 1 is trustworthy and reliable.

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

Both nations' surveys were carried out by national governments themselves without interpolation, and were subsequently analyzed by the World Bank from raw microdata. The South African numbers originate from the national government agency's survey known as the Income and Expenditure Survey (IES), conducted between November 2022 and November 2023 (Statistics South Africa, 2025). Norway utilizes the European Union Statistics on Income and Living Conditions (EU-SILC). Notably, the mean-to-median ratio of consumption in South Africa reaches 1.87, whereas the comparable figure for income in Norway stands at just 1.12.

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

The initial research question contained the term "income inequality" for both countries. After I checked the PIP metadata in Table 1, I realized that this was not correct: the database has consumption data for South Africa and income data for Norway. Usually, the PIP database has consumption surveys in poorer countries and income surveys in wealthier countries (Hasell & Arriagada, n.d.). In addition, the file contained only one row per country with the year 2022, which meant that I could not find the income distribution of South Africa for 2022. Therefore, I modified my research question to "income and consumption distribution data", and now I will consider welfare as consumption for South Africa and income for Norway.

This change goes beyond replacing words. The share of consumption is generally more evenly distributed than the share of income since rich households save some part of income, and poor households can spend more than they earn for some time (Hasell & Arriagada, n.d.). This means that the income Gini of South Africa would probably be even higher. In addition, these two surveys cover somewhat different periods (World Bank, 2022). Thus, the difference between the two published values cannot be considered an accurate indicator of the extent to which inequality is more acute in South Africa. However, my research question is about accuracy, and the comparison remains fair since in each country, I compare my result with the Gini coefficient estimated by the World Bank using the same survey as the deciles. In retrospect, it turned out to be one of the most important steps to check the metadata first.

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

If everyone had exactly the same welfare, the Lorenz curve would be the **line of perfect equality** $y = x$. The Gini coefficient $G$ is the area between $y = x$ and $L(x)$, divided by the whole area under $y = x$. The area under $y = x$ from 0 to 1 is a triangle with area $1/2$, so the Gini coefficient is one minus twice the area under the Lorenz curve:
$$G = \frac{\int_0^1 \big(x - L(x)\big)\,dx}{\int_0^1 x\,dx} = \frac{\frac12 - \int_0^1 L(x)\,dx}{\frac12} = 1 - 2\int_0^1 L(x)\,dx .$$
I write $A$ for the area under the Lorenz curve, so that $G = 1 - 2A$. With perfect equality, $A$ is one half and $G = 0$; if one person held everything, $A$ would be close to 0 and $G$ close to 1. The limits of integration are 0 and 1 because $x$ runs from none of the population to all of it. Since I only know $L$ at 11 points, I cannot integrate it directly. I compare two ways of finding $A$: joining the points with straight lines (Section 4), and fitting a cubic polynomial and integrating it (Sections 5 and 6).

# 4. Discrete benchmark: the trapezium rule

One simple approach to calculate $A$ is through linear interpolation of adjacent points followed by summation of all 10 trapezoidal regions, each with base width $h = 0.1$:
$$A_T = \frac{h}{2}\left[L(0) + 2\sum_{k=1}^{9} L_k + L(1)\right] = 0.05 + 0.1\sum_{k=1}^{9} L_k , \qquad G_T = 1 - 2A_T .$$

| | $\sum_{k=1}^{9} L_k$ | $A_T$ | $G_T$ | Published $G_{\text{WB}}$ |
|---|---:|---:|---:|---:|
| South Africa | 1.865822 | 0.236582 | 0.526836 | 0.540539 |
| Norway | 3.184940 | 0.368494 | 0.263012 | 0.269463 |

Table: Table 3. Trapezium-rule estimates.

For South Africa, $A_T = 0.05 + 0.1 \times 1.865822 = 0.236582$, so $G_T = 1 - 2 \times 0.236582 = 0.526836$.

Before comparing to published figures, it was essential to determine the nature of the bias introduced. Given that the true Lorenz curve satisfies Condition 3 (it is convex), the straight line joining any pair of adjacent points lies above the curve. In each case, therefore, there will be slight additional areas bounded above the actual graph and below each straight line, causing the method of calculating areas to overestimate true areas. Hence, since $G = 1 - 2A$, any greater area value implies a smaller G-value; the trapezium approach will systematically underestimate the G-value in each situation. My results concur on these grounds: 0.5268 is less than 0.5405 for South Africa, while 0.2630 is less than 0.2695 for Norway.

However, this bias offers further insights into the discrepancy with published G-values. Assuming perfect welfare homogeneity within each decile band – such that each segment of the Lorenz graph takes on straight lines connecting successive deciles – then the G-value of this hypothetical scenario equals exactly the G-value computed by trapezium approximation. Accordingly, the difference between the trapezium estimate and the published G-value reflects precisely the degree of internal inequality within the deciles. I call this value the **grouping error**. For South Africa the value stands at 0.0137, and for Norway 0.0065; twice the magnitude in South Africa, yet roughly equal in percentage terms (2.54% vs 2.39%). These results indicated how a polynomial model should approach the problem. Namely, the cubic equation should fit curves lying below each straight line segment generated from the trapezium approach, recovering lost inequality.

# 5. Model 1: unconstrained least-squares cubic

## 5.1 Fitting the model

Model 1 is the general cubic $\hat L(x) = ax^3 + bx^2 + cx + d$, with the hat indicating that it is a model of $L$. The residual $e_k = L_k - \hat L(x_k)$ is the vertical distance between each data point and its projection on the model. Least-squares regression selects the parameters $a$, $b$, $c$, and $d$ such that the sum of squared residuals is minimized:
$$SS_{res} = \sum_{k=0}^{10} e_k^{\,2} .$$
I used cubic regression on all 11 points; it gives exactly the same results as the cubic regression feature of a GDC. The fitted models were:
$$\text{South Africa:}\quad \hat L(x) = 2.293642x^3 - 2.093904x^2 + 0.776525x - 0.025619$$
$$\text{Norway:}\quad \hat L(x) = 0.519969x^3 - 0.066764x^2 + 0.540877x - 0.009613$$

The goodness of fit was calculated with the help of the coefficient of determination $R^2 = 1 - SS_{res} / SS_{tot}$, where $SS_{tot}$ is the sum of squared differences between each value of $L_k$ and their average $\bar L$. However, I did not want to take the output blindly, so I have recalculated every residual (Tables 4 and 5).

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

Thus, Model 1 describes 98.7% of the variability in the South African data and 99.9% of the Norwegian one. At first sight, these numbers seemed to indicate a good fit.

However, when I plotted these models, the graphs revealed a completely different picture.

![Figure 2. The decile points (dots), Model 1 (solid line), Model 2 (dash-dot line, see Section 6) and the line of equality (dotted line).](output/fig2_models.png){width=15cm}

![Figure 3. Residuals of Model 1 (filled circles, solid line) and Model 2 (open squares, dash-dot line), on the same scale for both countries.](output/fig3_residuals.png){width=15cm}

Namely, I observed that for both countries the residuals of Model 1 exhibit the same sequence of signs (Figure 3): +, −, +, −, +. It is a wave, not random scatter. Since my data points are accurate descriptions of each survey result, the residuals reveal the shape error of the cubic model. The largest residual in both countries is at $x = 0.9$, where the model deviates from the data upwards as it cannot ascend quickly enough for the richest category. The South African residuals are about three times as large as those of Norway.

## 5.2 Definite integration

Integrating term by term gives the area under the cubic:
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

This was where I started doubting $R^2$ as adequate proof. Initially, I imagined that having an $R^2$ greater than 0.98 meant that the model was accurate. Yet, the model itself with an $R^2$ score of 0.987 predicts negative percentages of consumption for the very poorest South Africans, fails to reproduce either endpoint and bends in the reverse direction for almost 30 percent of the society. After considering the root causes, I understood how the gentle slope increase between each point allowed almost any kind of rising smooth curve to get an $R^2$ score close to 1. $R^2$ calculates solely vertical distances from those eleven dots, but says absolutely nothing regarding the requirements of the Lorenz curve and the area underneath it that determines the Gini coefficient. High $R^2$ scores do not imply valid models. In light of the above, my new strategy became to explicitly require the model to pass through the points (0, 0) and (1, 1), instead of hoping that the regression would do so.

# 6. Model 2: constrained cubic through (0, 0) and (1, 1)

## 6.1 Applying the constraints

Condition 1 gives $\hat L(0) = 0$, so $d = 0$, and $\hat L(1) = 1$, so $a + b + c = 1$ and $c = 1 - a - b$. Substituting these into the cubic gives:
$$\hat L(x) = ax^3 + bx^2 + (1 - a - b)x = x + a(x^3 - x) + b(x^2 - x).$$
A GDC cannot fit a cubic with conditions like these, so I had to fit it by hand. To make this possible, I used the identity $x^3 - x = (x - 0.5)(x^2 - x) + 1.5(x^2 - x)$, which can be checked by expanding the right-hand side. This lets me rewrite the model in the following form:
$$\hat L(x) = x + \beta\,v(x) + \alpha\,w(x), \qquad v(x) = x^2 - x, \quad w(x) = (x - 0.5)(x^2 - x),$$
Here $\beta = b + 1.5a$ and $\alpha = a$. It is the same family of cubics, just described with different coefficients.

The two parts have a useful symmetry about $x = 0.5$. Replacing $x$ by $1 - x$ leaves $v$ unchanged but changes the sign of $w$, so $v$ is symmetric about $x = 0.5$, while $w$ is positive on one side and negative on the other by exactly the same amount.

## 6.2 Why the cubic term has no effect on the area

$$\int_0^1 (x^2 - x)\,dx = \left[\frac{x^3}{3} - \frac{x^2}{2}\right]_0^1 = -\frac16 , \qquad \int_0^1 (x - 0.5)(x^2 - x)\,dx = \left[\frac{x^4}{4} - \frac{x^3}{2} + \frac{x^2}{4}\right]_0^1 = 0 .$$
Since $\int_0^1 x\,dx = 1/2$, the area under Model 2 is $A_2 = 1/2 - \beta/6$, and so
$$G_2 = 1 - 2A_2 = 1 - 2\left(\frac12 - \frac{\beta}{6}\right) = \frac{\beta}{3} .$$
**The Gini coefficient of Model 2 depends only on β.** Whatever value α takes, the cubic part adds exactly as much area on one side of $x = 0.5$ as it removes on the other, so it has no effect on the definite integral.

## 6.3 Fitting Model 2 by hand

Let $z_k = L_k - x_k$, the gap between the data and the line of equality, and write $v_k = v(x_k)$ and $w_k = w(x_k)$. The residuals are $z_k - \beta v_k - \alpha w_k$. The key fact is that the sum of the products $v_k w_k$ is zero: because the decile points are symmetric about 0.5, these products cancel in pairs ($x = 0.1$ with $x = 0.9$, $x = 0.2$ with $x = 0.8$, and so on). This means the sum of squared residuals splits into one part that contains only β and another that contains only α. Each part is a quadratic, so I minimised it by differentiating and setting the derivative equal to zero. This gives the two coefficients:
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

The structure of Model 2 satisfies Condition 1 automatically. Its derivative has a negative discriminant value in both countries, meaning the function is strictly increasing. Furthermore, since the function goes from 0 to 1 there will be no predictions outside of that range. Moreover, the line of equality will never cross the curve, since the difference $\hat L(x) - x = (x^2 - x)\big(\beta + \alpha(x - 0.5)\big)$ shows how the first bracket factor will be negative for all $0 < x < 1$, whilst the second bracket will be positive within the domain, ensuring the product remains strictly negative. Unfortunately, Model 2 does not satisfy Condition 3, as the second derivative is negative at $x = 0$; the point of inflection occurs at 0.29 for South Africa and 0.04 for Norway. Interpreting the gradient of Model 2 at $x = 0$ in South Africa shows that the consumption of the poorest person is 69% of the mean, yet the data show the bottom decile actually spends on average just 14% of the average amount.

When looking at Model 2's predicted Lorenz curve versus Model 1, I expected greater accuracy based on the validity of its mathematical form. Yet when comparing the numerical outputs, the estimated Gini coefficients (0.5107 and 0.2585) are less close to the published figures. When viewing the graphs side by side (Figure 2), the two functions appear virtually identical except at the extreme end points. Model 1 is able to dip beneath the coordinates (0, 0) and (1, 1), thereby lowering its total enclosed area and increasing its Gini coefficient by 0.0131 for South Africa. Therefore, part of Model 1's better accuracy comes from violating Condition 1.

## 6.5 Reflection: the constrained cubic equals the constrained quadratic

Together, Sections 6.2 and 6.3 provide us with the clearest finding of the entire investigation. The constrained quadratic estimator $\hat L(x) = bx^2 + (1 - b)x$ is exactly Model 2 but with the exclusion of the cubic part. From least squares, the β coefficient for this quadratic formula will be identical, hence its Gini coefficient also equals β/3. In essence: due to the symmetrical distribution of decile points about $x = 0.5$, the positive effect of the cubic component elevating one half of the graph cancels out with an equal and opposite depression effect on the other half of the graph. **For uniformly spaced deciles, the best-fitting constrained cubic estimator is going to provide identical Gini coefficients to the best-fitting constrained quadratic estimator.** Similar logic applies to Model 1, where we see a Gini estimate identical to that of the ordinary quadratic. Due to the surprising elegance behind the result, I validated it with the 2022 data (Table 6).

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

As demonstrated, every cubic specification provides an estimated Gini value equal to its quadratic counterpart to at least 14 decimal places. This phenomenon is especially obvious for South Africa: the inclusion of the cubic component improves $R^2$ from 0.9050 to 0.9823 and transforms a graph that goes negative into a non-negative one. Despite all of this, there is absolutely no difference in terms of the estimated Gini coefficient compared to the quadratic counterpart. For the Norwegian distribution, the constrained quadratic is actually the only model among all four that satisfies every condition, with a Gini estimate identical to Model 2's.

Due to these findings, we need to reconsider our research question once again. Although "cubic" sounds like a fancy name for improving the estimation process, for decile data the cubic term exerts zero effect on the estimated Gini coefficient. Instead, the cubic term only changes the shape of the curve and allows a better fit. This finding confirms what I suspected in Section 5.4: $R^2$ cannot evaluate a Gini coefficient's estimation accuracy, since $R^2$ goes from 0.90 to 0.98 while the Gini coefficient stays constant.

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

Every approximation is below the published figure, showing that each method underestimates inequality in both countries. Comparatively analyzing every estimation technique used, the trapezium rule proves to be more accurate in estimating the Gini coefficient than Models 1 and 2 in both countries. Nonetheless, though Model 1 approximates Norway's benchmark estimate nearly perfectly (0.2629 against 0.2630), it is clearly less accurate than the benchmark for South Africa (3.09% error against 2.54%). Rounding off the estimates to one decimal place, they all align perfectly with the official values (0.5 and 0.3), but rounded to two decimal places none of them does. However, it should be highlighted that every method keeps roughly the right ratio between the two countries: the published South African value is 2.01 times the Norwegian one, and the estimates give 2.00, 1.99 and 1.98.

Additionally, it must be stated that absolute error and relative error calculations were consciously applied to compare the accuracy of the different estimation approaches. First off, the absolute error is the better measure for judging a single estimate, since the Gini coefficient is itself already a proportion. Countries are compared by the difference between their coefficients, meaning that smaller absolute errors equate to greater proximity to the published value. Secondly, the relative error is the fairer criterion for comparing the method between the two countries, considering that Norway's Gini coefficient is only about half of South Africa's (0.2695 against 0.5405).

## 7.2 Grouping error and model error

To understand the origin of these deviations in the accuracy of the models, the total error of estimation was divided into two distinct types according to the trapezoidal approximation:
$$G_{\text{model}} - G_{\text{WB}} = (G_T - G_{\text{WB}}) + (G_{\text{model}} - G_T).$$
The grouping error defined in Section 4 is identical for both models. However, the model error is caused exclusively by differences between the shape of each respective model and its linear counterpart.

| Country | Method | Grouping error $G_T - G$ | Model error $G_{\text{model}} - G_T$ | Total error $G_{\text{model}} - G$ |
|-------------|----------:|------------------:|----------------------:|--------------------:|
| South Africa | Model 1 | −0.0137 | −0.0030 | −0.0167 |
| South Africa | Model 2 | −0.0137 | −0.0161 | −0.0298 |
| Norway | Model 1 | −0.0065 | −0.0001 | −0.0066 |
| Norway | Model 2 | −0.0065 | −0.0045 | −0.0110 |

Table: Table 9. Splitting each total error into grouping error and model error.

In Norway, it turns out that Model 1 has virtually zero model error, meaning that virtually the entirety of the total error comes from the limitation of having only ten groups. South Africa presents an opposite example, whereby the model error of Model 2 is actually greater than the grouping error. Across both nations and both models (four cases altogether), the model error proves to be consistently negative, suggesting that the cubic functions on average lie above the linear approximations, whereas they needed to lie below them to restore the missing inequality.

## 7.3 Why both cubic models underestimate

The gradients at the two ends of the curve explain the pattern. Because a real Lorenz curve is convex, its gradient at $x = 0$ cannot be larger than the average gradient of the first decile, and its gradient at $x = 1$ cannot be smaller than the average gradient of the last decile. Both models break both rules in both countries. For South Africa, the data allow a gradient of at most 0.14 at $x = 0$, but Model 1 has 0.78 and Model 2 has 0.69; at $x = 1$ the gradient should be at least 4.21, but the models only reach 3.47 and 3.76. In everyday terms, **the cubics make the poorest people look better off, and the richest people look less rich, than the data show.** A curve that rises too fast at the start and too slowly at the end lies above the data near both ends, which is visible in the negative residuals at $x = 0.1$, 0.2, 0.8 and 0.9 in Figure 3. The area under the model is therefore too large, and its Gini estimate too small.

## 7.4 Testing the hypothesis

The comparison between these two countries demonstrates how distinct these situations actually are. With a high degree of inequality, South Africa shows a strong skewness toward upper-end spending, where the wealthiest 10 percent of the population accounts for 42.1% of national expenditure. Using the mathematics behind the second derivative of a cubic polynomial function (which is only a linear function), one discovers that a cubic cannot follow such rapid changes, where the curve remains nearly horizontal before a nearly vertical spike in the richest decile. Such is not the case in Norway, with its smoother and much gentler graph line. Indeed, this empirical evidence confirms what the theory suggested before. As predicted, South Africa displays greater absolute errors: 2.1 times Norway's error for the trapezoidal approach, 2.5 times for Model 1 and 2.7 times for Model 2. The relative errors generated by both sets of cubic estimations are greater in South Africa (3.09% compared to 2.44% in Model 1; 5.52% vs. 4.08% in Model 2). The relative errors generated in the trapezoidal approximation remain relatively steady (2.54% and 2.39%). Hence, it appears that the grouping errors rise roughly in proportion to the Gini coefficient, while the model errors greatly increase with the level of curvature.

# 8. Critical evaluation, extensions and conclusion

## 8.1 Strengths

All integrals were calculated exactly, and every computation was double-checked. The trapezium estimate gave a quantitative benchmark for how "accurate" the models were, with a correctly predicted result that this method would underestimate the Gini coefficient due to convexity properties. The manual fitting process used for Model 2 was done using AA SL methods and independently verified against a general least-squares calculation. Most importantly, however, both models were judged based on their validity within the conditions of the Lorenz curve, not only by $R^2$.

## 8.2 Limitations

**The rigid shape of a cubic.** A cubic can only have one point of inflection, so it cannot be very steep at the top and correctly curved at the bottom at the same time. All four fitted cubics bent the wrong way near $x = 0$, which produced the model errors in Table 9.

**No detail within the top decile.** Ten shares cannot show inequality inside each decile, which matters most at the top: the richest 10% of South Africans hold 42.1% of consumption, but the data give only one number for this whole group. No method that uses only these 11 points can be sure of recovering the grouping error.

**Other limitations.** The least squares method takes each of the 11 points independently, despite the fact that each cumulative fraction includes all previous fractions. A lower residual sum of squares will not automatically result in a smaller error in area. The official Gini coefficient is a statistic taken from a sample survey, meaning that the accuracy considered within this study relates to how close our calculation gets to the published figure rather than an accurate representation of inequality in the overall population. Consumption statistics for South Africa vs income statistics for Norway refer to different measurements – however, this does not invalidate the accuracy test comparison, since each estimate is compared with the published Gini coefficient from the same survey. In fact, the two published values shouldn't even be compared against one another as if they measured the same thing. The PIP database regularly receives revisions; this paper utilizes the September 2026 update, which revised an earlier estimate (PIP Technical Team, 2026).

## 8.3 Extensions

There is an obvious mathematical flaw with the use of the cubic regression model: cubic models are geometrically unable to achieve sharp curvature around the point $x = 1$. A logical step forward would be to consider functions which are able to become very steep close to $x = 1$. The simplest example would be the power function $L(x) = x^p$ with $p > 1$. For $p > 1$, the power function will satisfy the four required conditions without needing further adjustment, while computing its Gini index requires little work:
$$G = 1 - 2\int_0^1 x^p\,dx = 1 - \frac{2}{p+1} = \frac{p-1}{p+1} .$$
The parameter $p$ within $L(x)$ may be estimated with simple log transformations. Alternatively, it would be possible to implement a spline approximation procedure where separate cubic polynomials connect each neighboring data pair and interpolate all measured values in a smooth fashion. Provided each section remains convex, the final spline estimation will lie beneath any straight line joining two subsequent observations, therefore creating a Gini score at least as large as the trapezium estimate, which could recover some of the original grouping error.

## 8.4 Conclusion

My research question focused on determining to what extent cubic polynomial regression modeling and integration of Lorenz curves using definite calculus would yield accurate estimations of the Gini coefficient of inequality in South Africa compared to Norway. The result shows limited success.

On a basic overview of the methodology employed, this technique provides the proper general results. The cubic regressions provided predictions falling within 2.4% to 5.5% of the published figures, giving estimates correct to one decimal place, and properly identifying that South Africa's Gini coefficient is approximately double Norway's. For South Africa (consumption expenditure, published figure: 0.5405), Model 1 gave 0.5238 (error of 3.09%) and Model 2 gave 0.5107 (error of 5.52%). On the other hand, for Norway (income distribution, published figure: 0.2695), Model 1 gave 0.2629 (error of 2.44%), while Model 2 gave 0.2585 (error of 4.08%).

However, this methodology failed to obtain accuracy to two decimal places; all estimates are underestimates, while neither of the cubic models performs better than the elementary piecewise linear interpolation used. The trapezium rule had the lowest error percentages in both countries at 2.54% and 2.39%. Despite obtaining exceedingly high $R^2$ values (all exceeding 0.98), Model 1 fails to qualify as a valid Lorenz curve, and both models tend to curve improperly downwards for the poorest part of the population. Predictably, this approach proved considerably less effective in estimating the South African Lorenz curve due to its steep upward curvature at the high end – resulting in errors roughly 2 to 3 times larger.

What constrains this estimation ability is the existence of three critical limitations to this approach. Firstly, grouping data points into deciles tends to hide the true inequalities existing within each individual group, causing underestimations. Secondly, the fixed shape of cubic polynomial regression causes further bias towards underestimation according to how pronounced the inequality may be. Finally, when the deciles are equidistant from each other, the cubic component in a regression equation will have no influence whatsoever on the estimation of the Gini coefficient. All these findings apply specifically to the data collected from one year and two separate countries using two distinct welfare measurements; hence they do not necessarily hold universally. Nonetheless, these calculations reveal some insightful information about this technique – that a good fit of a model does not necessarily guarantee proper validity in describing an actual phenomenon mathematically – making validation extremely crucial.

## 8.5 Declaration of tools used

The dataset has been acquired from the World Bank's PIP database resource online. Coefficients, summations, errors, and integral evaluations were all performed through a custom built Python script, additionally utilized to produce all graphical representations. The regression coefficients for Model 1 can be precisely reproduced using the cubic regression function of a GDC: with reference to the data set in Table 2, one may verify that indeed the coefficient values are an exact match of the output given by a GDC cubic regression. An artificial intelligence assistant, Claude (Anthropic), was employed throughout the completion process in tasks such as World Bank database cross-referencing, code writing, document typesetting and written explanation.

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
