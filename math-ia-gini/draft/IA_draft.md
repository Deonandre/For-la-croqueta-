---
title: "How accurately can a cubic model of the Lorenz curve estimate the Gini coefficient? South Africa and Norway, 2022"
subtitle: "IB Mathematics: Analysis and Approaches SL, Internal Assessment (working draft)"
---

> **Draft status.** This file has only the sections that do not depend on the
> data: the theory, the derivations and the proofs (Sections 3 to 6). The
> sections that use numbers (introduction, data, results, accuracy, evaluation,
> conclusion, references) will be written from the verified 2022 World Bank PIP
> file. The worked values for each country will then go at the end of
> Sections 4 to 6. No number in this file comes from real data yet.

**Research question (provisional; final wording after the data check):**
To what extent can cubic polynomial regression models and definite integration
of Lorenz curves accurately estimate the Gini coefficient of inequality in South
Africa compared to Norway, using 2022 World Bank distribution data?

---

# 3. The Lorenz curve and the Gini coefficient

## 3.1 From decile shares to points

The World Bank data give the share of total welfare (income or consumption)
received by each tenth of the population, from the poorest tenth to the richest
tenth. I write $s_k$ for the share received by decile $k$, where decile 1 is the
poorest 10% of people and decile 10 is the richest 10%. The shares are
proportions, so $s_1 + s_2 + \dots + s_{10} = 1$.

To build a Lorenz curve I need cumulative values. For $k = 0, 1, \dots, 10$ let

$$x_k = \frac{k}{10}, \qquad L_k = s_1 + s_2 + \dots + s_k, \qquad L_0 = 0 .$$

The point $(x_k, L_k)$ means: *the poorest $100x_k\%$ of the population receive
$100L_k\%$ of total welfare.* For example, $(0.4, L_4)$ gives the share held by
the poorest 40%. This gives 11 points from $(0,0)$ to $(1,1)$. The two end
points are not measurements: they are true for every country, because nobody
holds nothing and everybody holds everything.

## 3.2 What any Lorenz curve must look like

Before fitting any model, I need to know what a genuine Lorenz curve looks
like, because a model that breaks these rules cannot describe a real
distribution, however well it fits the points.

1. **End points:** $L(0) = 0$ and $L(1) = 1$.
2. **Increasing:** from one point to the next, $L$ rises by $s_k$, and a share
   cannot be negative. So $L$ never decreases: $L'(x) \ge 0$.
3. **Concave up:** the gradient of the segment joining two neighbouring points is
   $$m_k = \frac{L_k - L_{k-1}}{x_k - x_{k-1}} = \frac{s_k}{0.1} = 10\,s_k .$$
   If the population is $N$ people with mean welfare $\mu$, and decile $k$ has
   mean welfare $\mu_k$, then $s_k = \dfrac{0.1N\mu_k}{N\mu}$, so
   $m_k = \dfrac{\mu_k}{\mu}$. The gradient of the Lorenz curve is the welfare
   of that group compared with the national average. The deciles are ordered
   from poorest to richest, so $\mu_1 \le \mu_2 \le \dots \le \mu_{10}$ and the
   gradients increase. A curve whose gradient keeps increasing is concave up:
   $L''(x) \ge 0$.
4. **Below the line of equality:** a concave-up curve lies below the chord
   joining its end points. Here that chord is $y = x$, so $L(x) \le x$.

These four properties are my checklist for judging the models in Sections 5
and 6. Property 3 also explains the shape: in a very unequal country the
gradient stays small for most of the population and becomes very large for the
richest group, so the curve sags far below $y = x$ and then rises steeply
near $x = 1$.

## 3.3 Deriving the Gini coefficient from an area

If everyone had the same welfare, every group of $x\%$ of people would hold
$x\%$ of welfare, so the Lorenz curve would be the **line of equality**
$y = x$. The Gini coefficient $G$ measures how far the real curve is from this
line. It compares the area between the line of equality and the Lorenz curve
with the whole area under the line of equality.

Let $A$ be the area under the Lorenz curve:
$$A = \int_0^1 L(x)\,dx .$$

The area under $y = x$ from 0 to 1 is $\int_0^1 x\,dx = \left[\tfrac{x^2}{2}\right]_0^1 = \tfrac12$.
So the area between the two curves is
$$\int_0^1 \big(x - L(x)\big)\,dx = \frac12 - A ,$$
and
$$G = \frac{\tfrac12 - A}{\tfrac12} = 1 - 2A = 1 - 2\int_0^1 L(x)\,dx .$$

**Checking the formula at the extremes.** With perfect equality,
$L(x) = x$, so $A = \tfrac12$ and $G = 0$. If one person held all welfare,
$L(x)$ would be 0 until the very last person, so $A$ would be close to 0 and
$G$ close to 1. So $0 \le G \le 1$, and a larger $G$ means more inequality.

**Why the limits are 0 and 1.** The variable $x$ runs from none of the
population to all of it. Integrating over a smaller interval would leave some
people out. For example, stopping at $x = 0.9$ would ignore the richest 10%,
who hold the largest share. The Gini coefficient is meant to describe the
whole distribution, so the integral must cover all of $[0, 1]$.

The World Bank publishes the Gini coefficient as a number between 0 and 1 in
PIP, and multiplied by 100 (the "Gini index") in other tables. I use the 0 to 1
scale throughout.

**The problem.** I only know $L$ at 11 points, so I cannot integrate it
directly. I compare two ways of finding $A$:

- joining the points with straight lines (the trapezium rule), which needs no
  model (Section 4);
- fitting a cubic function to the points and integrating it exactly, which is
  the method in my research question (Sections 5 and 6).

# 4. Benchmark: the trapezium rule

Joining neighbouring points with straight lines splits the area under the
Lorenz curve into 10 trapezia of width $h = 0.1$:
$$A_T = \frac{h}{2}\Big[L_0 + 2(L_1 + L_2 + \dots + L_9) + L_{10}\Big].$$
With $L_0 = 0$, $L_{10} = 1$ and $h = 0.1$:
$$A_T = 0.05\Big(2\sum_{k=1}^{9} L_k + 1\Big) = 0.05 + 0.1\sum_{k=1}^{9} L_k ,$$
$$G_T = 1 - 2A_T = 0.9 - 0.2\sum_{k=1}^{9} L_k .$$

**A prediction I can test.** By Property 3 the true Lorenz curve is concave
up, so between two neighbouring points it bends *below* the straight segment
joining them. Each trapezium therefore contains a small extra area above the
true curve, so $A_T \ge A$ and
$$G_T \le G .$$
The trapezium rule can only **underestimate** the Gini coefficient. If the
World Bank's Gini is calculated from the same survey as its decile shares, my
$G_T$ must come out slightly below it. If it did not, the published shares and
Gini would not be consistent with each other. So this is a first check on the
data as well as a benchmark.

**Why I use a benchmark.** The trapezium rule uses exactly the same 11 points
as the cubic models but assumes nothing about the shape between them. A cubic
model is only worth using if it estimates the Gini coefficient at least as well
as this simple method. This is how I decide what "accurately" means in my
research question, rather than choosing an arbitrary cut-off.

# 5. Model 1: the least-squares cubic

## 5.1 Least squares

For a model $\hat L(x)$, the **residual** at each point is the vertical
distance between the data and the model:
$$e_k = L_k - \hat L(x_k) .$$
Least-squares regression chooses the coefficients that make the sum of squared
residuals
$$S = \sum_{k=0}^{10} e_k^{\,2}$$
as small as possible. I square the residuals for three reasons:

- positive and negative residuals then cannot cancel out;
- large errors count for more than small ones;
- $S$ becomes a smooth function of the coefficients, so its minimum can be
  found with differentiation. I do this by hand for Model 2 in Section 6.

## 5.2 The model

Model 1 is the general cubic
$$\hat L(x) = ax^3 + bx^2 + cx + d .$$
It has four coefficients. Finding them by hand would mean minimising $S$ with
respect to four variables at once, which is beyond AA SL. So I used the cubic
regression function of my GDC, which carries out exactly this least-squares
minimisation on the 11 points. I did not simply accept the output: I checked it
myself by recalculating every residual, $S$ and $R^2$, and by testing the
function against the checklist in Section 3.2.

**Coefficient of determination.** With $\bar L$ the mean of the 11 values
$L_k$,
$$R^2 = 1 - \frac{SS_{res}}{SS_{tot}}, \qquad SS_{res} = \sum e_k^{\,2}, \qquad SS_{tot} = \sum \big(L_k - \bar L\big)^2 .$$
$R^2$ is the proportion of the variation in the $L_k$ values that the model
explains. I have three reasons not to rely on it alone:

- the points follow a smooth increasing pattern with almost no random
  scatter, so almost any smooth increasing curve gives $R^2$ close to 1;
- $R^2$ says nothing about whether the model satisfies the Lorenz properties;
- my aim is the area under the curve, and $R^2$ does not measure errors in area
  directly.

The points are not random measurements either: they are exact summaries of the
survey, apart from rounding, and each $L_k$ contains all the shares before it.
So the residuals show *where the shape of the cubic is wrong*, not random
error. This is why I look at the residual plot and not only at $R^2$.

## 5.3 Checking that Model 1 is a Lorenz curve

For $\hat L(x) = ax^3 + bx^2 + cx + d$:

- **End points:** $\hat L(0) = d$ and $\hat L(1) = a + b + c + d$. These should be
  0 and 1.
- **Increasing:** $\hat L'(x) = 3ax^2 + 2bx + c$. Solving $\hat L'(x) = 0$ with
  the quadratic formula shows any interval of $[0, 1]$ where the model
  decreases, which a real Lorenz curve can never do.
- **Concave up:** $\hat L''(x) = 6ax + 2b$ is linear, so it is non-negative on
  $[0, 1]$ exactly when it is non-negative at both ends:
  $\hat L''(0) = 2b \ge 0$ and $\hat L''(1) = 6a + 2b \ge 0$. If the sign
  changes, the point of inflection is at $x = -\dfrac{b}{3a}$.

## 5.4 Integrating Model 1

$$\int_0^1 \big(ax^3 + bx^2 + cx + d\big)\,dx = \left[\frac{ax^4}{4} + \frac{bx^3}{3} + \frac{cx^2}{2} + dx\right]_0^1 = \frac a4 + \frac b3 + \frac c2 + d ,$$
because every term is 0 at $x = 0$. So
$$G_1 = 1 - 2\left(\frac a4 + \frac b3 + \frac c2 + d\right).$$

This formula depends on $\hat L(1) = 1$. If the model gives $\hat L(1) \ne 1$,
it describes a population that holds more or less than 100% of its welfare, and
$G_1$ is no longer a proper Gini coefficient. This is the main reason for
Model 2.

# 6. Model 2: a cubic that passes through (0, 0) and (1, 1)

## 6.1 Building the constraints into the model

Every Lorenz curve passes through $(0,0)$ and $(1,1)$, so I decided to build
this into the cubic instead of hoping the regression finds it.

- $\hat L(0) = 0$ gives $d = 0$.
- $\hat L(1) = 1$ gives $a + b + c = 1$, so $c = 1 - a - b$.

Therefore
$$\hat L(x) = ax^3 + bx^2 + (1 - a - b)x = x + a(x^3 - x) + b(x^2 - x).$$

A GDC cannot fit a model with these conditions, so I rewrote it in a form I
can fit by hand. Since $x^3 - x = (x^2 - x)(x + 1)$ and
$x + 1 = \left(x - \tfrac12\right) + \tfrac32$,
$$x^3 - x = \left(x - \tfrac12\right)(x^2 - x) + \tfrac32\,(x^2 - x).$$
Substituting, and writing
$$v(x) = x^2 - x, \qquad w(x) = \left(x - \tfrac12\right)(x^2 - x), \qquad \beta = b + \tfrac32 a, \qquad \alpha = a ,$$
gives
$$\boxed{\hat L(x) = x + \beta\, v(x) + \alpha\, w(x)} .$$
This is the same family of cubics, described by different coefficients. To
return to the usual form:
$$a = \alpha, \qquad b = \beta - \tfrac32\alpha, \qquad c = 1 - \beta + \tfrac12\alpha .$$

**Why this form helps: symmetry about $x = \tfrac12$.**
$$v(1 - x) = (1-x)^2 - (1-x) = x^2 - x = v(x),$$
$$w(1 - x) = \left(\tfrac12 - x\right)v(1-x) = -\left(x - \tfrac12\right)v(x) = -w(x).$$
So $v$ is symmetric about $x = \tfrac12$ and $w$ is antisymmetric: $w$ is
positive on $\left(0, \tfrac12\right)$ and negative on $\left(\tfrac12, 1\right)$
with the same shape reflected. The cubic term $\alpha w(x)$ therefore lifts one
half of the curve and lowers the other half by the same amount.

## 6.2 The Gini coefficient of Model 2 depends only on $\beta$

$$\int_0^1 v(x)\,dx = \int_0^1 (x^2 - x)\,dx = \frac13 - \frac12 = -\frac16 ,$$
$$\int_0^1 w(x)\,dx = \int_0^1 \left(x^3 - \tfrac32 x^2 + \tfrac12 x\right)dx = \frac14 - \frac12 + \frac14 = 0 .$$
Therefore
$$\int_0^1 \hat L(x)\,dx = \frac12 + \beta\left(-\frac16\right) + \alpha(0) = \frac12 - \frac{\beta}{6},
\qquad
G_2 = 1 - 2\left(\frac12 - \frac\beta6\right) = \frac{\beta}{3} .$$
Whatever the value of $\alpha$, the cubic term adds as much area on one side of
$x = \tfrac12$ as it removes on the other, so it cannot change the Gini
coefficient.

## 6.3 Fitting Model 2 by least squares, by hand

Let $z_k = L_k - x_k$ (the gap between the data and the line of equality, which
is negative) and $v_k = v(x_k)$, $w_k = w(x_k)$. The residual is
$e_k = z_k - \beta v_k - \alpha w_k$, so
$$S(\alpha, \beta) = \sum_{k=0}^{10}\big(z_k - \beta v_k - \alpha w_k\big)^2 .$$
Expanding the bracket and adding term by term:
$$S = \sum z_k^2 - 2\beta\sum v_k z_k - 2\alpha\sum w_k z_k + \beta^2\sum v_k^2 + 2\alpha\beta\sum v_k w_k + \alpha^2\sum w_k^2 .$$

**The mixed term is zero.** The $x$-values are symmetric about $\tfrac12$:
$x_{10-k} = 1 - x_k$. By Section 6.1, $v_{10-k} = v_k$ and $w_{10-k} = -w_k$, so
$$v_k w_k + v_{10-k}w_{10-k} = v_k w_k - v_k w_k = 0 .$$
The terms cancel in the pairs $(1,9), (2,8), (3,7), (4,6)$. The remaining terms
are zero because $v_0 = v_{10} = 0$ and $w_5 = 0$. So $\sum v_k w_k = 0$, and
$$S(\alpha, \beta) = \underbrace{\Big(\beta^2\sum v_k^2 - 2\beta\sum v_k z_k\Big)}_{\text{depends only on }\beta}
+ \underbrace{\Big(\alpha^2\sum w_k^2 - 2\alpha\sum w_k z_k\Big)}_{\text{depends only on }\alpha}
+ \sum z_k^2 .$$
Because the two brackets do not share a variable, $S$ is smallest when each
bracket is as small as possible. Each bracket is a quadratic with a positive
leading coefficient, so its minimum is where its derivative is zero:
$$\frac{d}{d\beta}\Big(\beta^2\sum v_k^2 - 2\beta\sum v_k z_k\Big) = 2\beta\sum v_k^2 - 2\sum v_k z_k = 0
\quad\Longrightarrow\quad \beta = \frac{\sum v_k z_k}{\sum v_k^2},$$
$$\alpha = \frac{\sum w_k z_k}{\sum w_k^2}.$$
The second derivatives, $2\sum v_k^2$ and $2\sum w_k^2$, are positive, so these
are minimum points.

$\sum v_k^2$ and $\sum w_k^2$ depend only on the $x$-values, so they are the same
for both countries:

| $x_k$ | $v_k = x_k^2 - x_k$ | $w_k = (x_k - 0.5)v_k$ | $v_k^2$ | $w_k^2$ | $v_k w_k$ |
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

So
$$\beta = \frac{\sum v_k z_k}{0.3333}, \qquad \alpha = \frac{\sum w_k z_k}{0.01188}, \qquad G_2 = \frac{\beta}{3}.$$
For every interior point $v_k < 0$ and $z_k < 0$, so $\sum v_k z_k > 0$. This
gives $\beta > 0$ and therefore $G_2 > 0$, as a Gini coefficient should be.

**Meaning of $\alpha$.** $w$ is positive for $x < \tfrac12$ and negative for
$x > \tfrac12$. If the data sag further below $y = x$ in the upper half (the gap
between the richest groups and the rest is larger), then $\sum w_k z_k > 0$ and
$\alpha > 0$. So $\alpha$ describes *where* the inequality is concentrated,
while $\beta$ describes *how much* inequality there is.

## 6.4 Discovery: the cubic term cannot change the Gini estimate

A simpler model is the constrained quadratic
$\hat L(x) = x + b\,v(x) = bx^2 + (1-b)x$, which is Model 2 with $\alpha = 0$.
Its sum of squares is the first bracket above plus $\sum z_k^2$, so least
squares gives exactly the same value, $b = \dfrac{\sum v_k z_k}{\sum v_k^2} = \beta$.
Its Gini coefficient is
$$1 - 2\int_0^1 \big(x + \beta v(x)\big)dx = \frac\beta3 = G_2 .$$

**With equally spaced deciles, the best-fitting constrained cubic and the
best-fitting constrained quadratic give exactly the same Gini coefficient.**
The cubic term improves the fit, since it can only lower $S$, but it only moves
area from one side of $x = \tfrac12$ to the other. The result uses two facts:
the $x$-values are symmetric about $\tfrac12$, and $\int_0^1 w(x)\,dx = 0$. It
does not depend on the country's data. The same idea also applies to Model 1
(Appendix).

<!-- Worked values for South Africa and Norway, the numerical check of
     sum(v_k w_k) = 0 with the real z_k, and the comparison G_2 = β/3 with the
     cubic and quadratic fits are added from the verified 2022 data. -->

# Appendix (theory part): the same result for Model 1

Write $t = x - \tfrac12$, so the $t$-values $-0.5, -0.4, \dots, 0.5$ are
symmetric about 0. Any cubic can be written $\hat L = p + qt + rt^2 + st^3$.
Then
$$\int_0^1 \hat L\,dx = \int_{-1/2}^{1/2}\big(p + qt + rt^2 + st^3\big)\,dt = p + \frac{r}{12},$$
because
$$\int_{-1/2}^{1/2} t\,dt = \left[\frac{t^2}{2}\right]_{-1/2}^{1/2} = \frac18 - \frac18 = 0 ,
\qquad
\int_{-1/2}^{1/2} t^3\,dt = \left[\frac{t^4}{4}\right]_{-1/2}^{1/2} = \frac1{64} - \frac1{64} = 0 .$$
So $G_1$ depends only on $p$ and $r$.

In $S = \sum\big(L_k - (p + rt_k^2) - (qt_k + st_k^3)\big)^2$, every product of
a $(p, r)$ term with a $(q, s)$ term contains an odd power of $t_k$, and odd
powers cancel in the pairs $t_k, -t_k$. So $S$ splits into a part that depends
only on $(p, r)$ and a part that depends only on $(q, s)$. The same $(p, r)$
minimise the first part whether or not the $t^3$ term is in the model, so the
least-squares cubic and the least-squares quadratic have the same $p$ and $r$,
and therefore the same Gini estimate.
