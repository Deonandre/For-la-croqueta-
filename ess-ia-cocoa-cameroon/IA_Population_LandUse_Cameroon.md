## 1. Introduction and Environmental Context

### 1.1 Deforestation as an Environmental Issue

Deforestation is one of the clearest cases of human activity altering an environmental system faster
than that system can recover. Removing closed-canopy tropical forest reduces at once the carbon held
in biomass, the habitat supporting high species richness, the regulation of local rainfall and the
binding of soil against erosion. Forest is a store of natural capital and the services it provides
are natural income. Clearing it replaces a largely self-regulating system, held near a steady state
by internal negative feedback, with a simplified agricultural system that stays productive only
through continuous human input. Recovery is slow and incomplete.

### 1.2 Cameroon and the Congo Basin

Cameroon lies at the north-western edge of the Congo Basin, the world's second largest block of
tropical rainforest. Clearing forest releases the carbon stored in trees and soil, so deforestation
appears in national greenhouse-gas accounts as CO₂ emissions from land-use change. For Cameroon this
flow is not a minor category: in {{LUC_MAX_YR}} it reached {{LUC_MAX}} Mt CO₂, and even in 2023 it
was {{LUC_2023}} Mt, roughly {{LUC_VS_FOSSIL}} times the country's fossil-fuel emissions of
{{FOSSIL_2023}} Mt. Cameroon's climate impact is therefore mainly a land-use story rather than an energy one, which makes land-use-change emissions a useful measure of how heavily forests are being converted.

### 1.3 Agricultural Expansion and the Population-Pressure Hypothesis

What drives that conversion is contested. Tyukavina et al. (2018) found that forest disturbance
across the Congo Basin between 2000 and 2014 was dominated by small-scale, largely manual clearing
for agriculture rather than by industrial logging, and that the annual rate of this clearing almost
doubled. Because smallholder clearing is carried out by households, the common explanation is
population pressure: more people require more farmland, and farmland comes from forest. Cocoa, the
region's leading export tree crop, is often named as the driver — Ordway et al. (2017) identified
cocoa as the fastest-expanding export crop in sub-Saharan Africa, with most expansion occurring
outside industrial plantations. The population-pressure argument is intuitive and widely repeated,
but it is an empirical claim, and it can be tested against national data rather than assumed.
Figure 1 sets out that claimed chain of causation and shows which of its links this investigation
can actually observe.

![FIG|output/figA_pathway.png|6.1|Figure 1. The hypothesised pathway from population growth to land-use-change emissions, the competing drivers acting on the same step, and the two points in the chain that are measured.](x)

## 2. Research Question and Rationale

### 2.1 Research Question

**To what extent is population growth associated with CO₂ emissions from land-use change in Cameroon
between 1961 and 2023?**

The answer shapes policy. If forest loss tracks population, the response is to raise yields so that a growing population needs less new land. If it does not, attention belongs with export markets, roads, logging and governance, and blaming population growth misdirects effort onto the households least able to change.

### 2.2 Variables and Operationalisation

The **independent variable** is the annual increase in Cameroon's population, in people per year.
The **dependent variable** is annual CO₂ emissions from land-use change in Cameroon, in million
tonnes (Mt CO₂) per year. Held constant across the investigation are the country, the dataset
version, the calendar years matched between the two series, and the statistical test applied.

Population is used as a flow rather than a level for a specific reason. Total population is a
*stock* — the number of people alive in a given year — whereas land-use-change emissions are a
*flow*, the carbon released during that year. Correlating a stock against a flow across six decades
would mostly measure whether two series happen to trend together over time. Defining population
growth as the **annual increase** puts both variables on a per-year basis, which is the defensible
comparison. The levels correlation is still reported, but as a check on that reasoning rather than
as the main result.

### 2.3 Scope and Boundaries

Cameroon is the spatial unit because both variables are reported to consistent national boundaries.
The period begins in 1961, the first year after independence and the start of continuous modern
statistics, and ends in 2023, the last complete year in the emissions dataset.

## 3. Strategy and Perspectives

### 3.1 Competing Perspectives on the Same Forest

The issue sits inside a genuine conflict, and the groups involved hold different environmental value
systems that lead them to read the same forest differently.

**Smallholder farmers.** For rural households, forest is a land reserve and cash crops are one of
the few reliable sources of income. Clearing a hectare is rational for a household with limited
capital: forest soils are fertile, the land is often effectively free to occupy, and a cocoa or oil
palm plot yields income for decades. This anthropocentric position reflects real constraints, not indifference to forests.

**The national economy.** Agricultural exports earn foreign exchange and employ a large share of the
workforce, so the state has an interest in sustained output. This creates a tension within government,
since the same state holds forest-protection commitments. Restricting expansion carries a measurable
economic cost, which is why forest policy is often weakly enforced.

**Conservation interests.** From an ecocentric standpoint, Congo Basin forest has value as habitat,
as a carbon store and as a regulator of regional hydrology — value largely non-monetised and
accruing globally rather than locally. That asymmetry is central: the benefits of clearing are local and immediate, the costs global and deferred. This externality explains why the issue is not resolved by farmers simply choosing better.

**Where responsibility is placed.** A population-pressure framing is itself a perspective with
consequences. It locates the cause in the fertility of poor rural households rather than in
consumption elsewhere, and it has historically been used to justify coercive policy. Testing the
claim rather than assuming it is therefore an ethical question as well as a scientific one.

### 3.2 Strategies and the Tensions Between Them

**Agroforestry.** Growing cocoa under shade retains part of the canopy, supports more biodiversity than full-sun monoculture and stores more carbon. It is already dominant in Cameroon. Its weakness is yield: shaded cocoa produces less per hectare, so if demand is fixed,
lower yields require *more* land. This is the land-sharing versus land-sparing tension. Gockowski and
Sonwa (2011) modelled the alternative and estimated that if intensified cocoa technology had been
adopted from the 1960s across Côte d'Ivoire, Ghana, Nigeria and Cameroon, more than 21,000 km² of
deforestation and degradation and roughly 1.4 billion tonnes of CO₂ emissions could have been
avoided. Their conclusion is uncomfortable for conservation thinking: intensification, though it
reduces on-farm biodiversity, may spare more forest overall. Which strategy is "better" depends on
whether value is placed on biodiversity within the farm or on total forest left standing.

**Certification.** Schemes such as Rainforest Alliance and Fairtrade reward deforestation-free
production with price premiums. They give consumers leverage and can transfer income, but depend on audit quality, cover only part of production, and leak: if certified farms stop expanding while demand continues, clearing moves elsewhere.

**Regulation.** The EU Deforestation Regulation (European Union, 2023) requires importers to show
that commodities including cocoa were not grown on land deforested after 2020. It is the strongest
instrument available, but places the compliance burden on smallholders least able to carry it,
raising a question of equity: who pays to protect a global public good?

These perspectives shape outcomes directly: because the most economically rational household choice
removes forest, and the resulting costs fall largely outside Cameroon, forest loss continues even
where all parties agree it is undesirable.

## 4. Methodology

### 4.1 Source Selection, Including a Rejected Dataset

This investigation uses **exclusively secondary quantitative data**: no fieldwork, interviews,
questionnaires or experiments were involved. It is a reproducible desk-based correlational analysis.

All variables come from the CO₂ and Greenhouse Gas Emissions dataset published by Our World in Data,
which distributes a single compiled file through its own public repository. The underlying sources
are the Global Carbon Budget (Friedlingstein et al., 2025) for emissions and the Maddison Project
Database (Bolt & van Zanden, 2025) for GDP.

An agricultural land-area variable would have matched the research question more directly, so World
Bank *agricultural land* and *permanent cropland* series for Cameroon were examined first and
**rejected**. In those series 37% and 46% of years respectively showed exactly zero change from the
previous year, and permanent cropland was identical in all eight years from 2011 to 2018. Values
repeated to that degree are carried forward rather than measured, and correlating them would produce
a coefficient describing a reporting convention rather than the environment. Land-use-change CO₂ was
used instead: it has {{N_PRIMARY}} usable years with no repeated consecutive values.

### 4.2 Variables, Units and Extraction

{{TABLE_SOURCES}}

The compiled file was downloaded, filtered to Cameroon and to 1961–2023, and the four columns above
were retained. Annual population increase was computed as ΔPₜ = Pₜ − Pₜ₋₁, which necessarily loses
the first year. Land-use-change emissions per person were computed to separate total from per-head
intensity. All steps are scripted, so every figure in this report traces back to the unmodified
download.

### 4.3 Statistical Treatment

**Spearman's rank correlation (rₛ)** is the primary test. Shapiro–Wilk tests reject normality for
both land-use-change emissions (*p* = {{SW_LUC_P}}) and annual population increase
(*p* = {{SW_POP_P}}), so Pearson's assumption of bivariate normality does not hold; Spearman requires
only a monotonic relationship and resists outliers. Pearson's *r* is reported alongside for
comparison. For every coefficient the sample size, two-tailed *p*-value and the critical value at
α = 0.05 are given. Four further tests address specific threats to validity: a **levels comparison**,
to show how much apparent association comes from shared time trend; **first differences**, removing
any common trend; **lagged correlations** over 0–6 years, since clearing may precede the accounting;
and a **sub-period split at 1990**, testing whether one relationship holds across six decades of very
different economic conditions. Figure 2 summarises the whole procedure.

![FIG|output/figB_method.png|5.9|Figure 2. Data selection, processing and the five statistical tests applied, including the dataset rejected at the selection stage.](x)

## 5. Data Presentation and Processing

### 5.1 The Two Variables Over Time

The full dataset is in Appendix A. Figure 3 plots the two variables on separate scales rather than a shared dual axis, which would let the apparent relationship be changed by rescaling.

![FIG|output/fig1_series.png|6.0|Figure 3. Population and CO₂ emissions from land-use change, Cameroon, 1961–2023, each on its own scale.](x)

### 5.2 Derived Quantities

Dividing emissions by population gives carbon released per person, separating population size from the intensity of land conversion.

![FIG|output/fig3_percapita.png|6.0|Figure 4. CO₂ emissions from land-use change per person, Cameroon, 1961–2023.](x)

## 6. Analysis and Discussion

### 6.1 Trends and the Primary Correlation

Between 1961 and 2023 Cameroon's population rose from {{POP_1961}} million to {{POP_2023}} million,
a factor of {{POP_FACTOR}}, increasing in every single year. Land-use-change emissions did not
follow. They moved from {{LUC_1961}} Mt to {{LUC_2023}} Mt, a change of {{LUC_PCT}}%, fluctuating
around a mean of {{LUC_MEAN}} Mt with a standard deviation of {{LUC_SD}} Mt and no steady direction:
decade means fell from {{DEC_1970S}} Mt in the 1970s to {{DEC_1990S}} Mt in the 1990s, then rose
again to {{DEC_2000S}} Mt in the 2000s. One variable grows monotonically; the other oscillates. That
alone makes a strong positive association unlikely.

Annual population increase against land-use-change emissions gives rₛ = {{RHO_PRIMARY}}
(*p* = {{P_PRIMARY}}, *n* = {{N_PRIMARY}}, critical |r| = {{CRIT_PRIMARY}}) — a {{STRENGTH}} and
{{SIG_WORD}} association, but **negative**. Years of faster population growth were, if anything,
years of *lower* deforestation emissions. The levels comparison agrees (rₛ = {{RHO_LEVELS}},
*p* = {{P_LEVELS}}). Pearson's *r* = {{R_PRIMARY}} (*p* = {{PP_PRIMARY}}) is much weaker and not
significant. The two tests disagreeing is informative rather than awkward: it indicates a
relationship that is monotonic in rank but not linear, with extreme years — including an outlier of
{{LUC_MAX}} Mt in {{LUC_MAX_YR}} — pulling the least-squares line while barely affecting the ranks.
Reporting Pearson alone would have concealed the pattern.

![FIG|output/fig2_scatter.png|5.4|Figure 5. CO₂ emissions from land-use change against annual population increase, 1962–2023, with least-squares line.](x)

{{TABLE3}}

### 6.2 The Association Does Not Survive Detrending

With both variables expressed as year-on-year changes, rₛ falls to {{RHO_DIFFS}}
(*p* = {{P_DIFFS}}, *n* = {{N_DIFFS}}) — {{DIFFS_SIG_WORD}}, and essentially zero. This is the single
most important result. It shows that the negative coefficient belongs to the two long-run trajectories, not to any year-to-year link: population rose steadily while emissions drifted down, so ranking them produces a negative coefficient even though a year of fast population growth tells us nothing about that year's emissions. The lag tests point the same way,
with the strongest coefficient at lag {{BEST_LAG}} ({{BEST_LAG_RHO}}) and no peak at any plausible
delay.

![FIG|output/fig5_lag.png|5.4|Figure 6. Spearman's rₛ against the lag applied to population growth, with the α = 0.05 significance threshold marked.](x)

### 6.3 The Relationship Reverses Between Sub-periods

For 1961–1990, rₛ = {{RHO_EARLY}} (*p* = {{P_EARLY}}, *n* = {{N_EARLY}}); for 1991–2023 it is
{{RHO_LATE}} (*p* = {{P_LATE}}, *n* = {{N_LATE}}). The sign flips. A single coefficient for the whole period averages two opposite patterns, so the headline answer depends on where the boundaries are drawn — a correlation over an arbitrary span can be an artefact of that span.

![FIG|output/fig4_subperiods.png|6.2|Figure 7. The same relationship computed separately for 1961–1990 and 1991–2023.](x)

### 6.4 Decoupling of Emissions from Population

The clearest finding is in intensity. Land-use-change emissions per person fell from {{PC_1961}} t
CO₂ in 1961 to {{PC_2023}} t in 2023, a decline of {{PC_DROP}}%. Cameroon added roughly
{{POP_FACTOR}} times its 1961 population while the carbon released per head from land conversion
fell by an order of magnitude. This is relative decoupling: forest is still being converted, but far
less per additional person. Figure 8 shows the same downward path across the region, so this is not
unique to Cameroon.

![FIG|output/fig6_peers.png|6.0|Figure 8. Land-use-change emissions per person, Cameroon and five regional neighbours, 1961–2023.](x)

### 6.5 Alternative Explanations

Several mechanisms fit the data. Much population growth has been absorbed by cities rather than new farms, so extra people do not mean proportionally more cleared land; yields on existing land have risen; and the most accessible forest near roads was converted early, so later clearing costs more. Economic conditions matter independently of population: the commodity-price collapse and structural adjustment of the late 1980s and 1990s coincide with the lowest emissions decade in the series, suggesting that the ability to invest in new plantations constrains clearing more than the number of people does. Consistent with
this, GDP per capita also correlates negatively with emissions (rₛ = {{RHO_GDPPC}},
*p* = {{P_GDPPC}}), so affluence is not substituting for population as an explanation either.

Land-use-change emissions aggregate every cause of carbon loss from land: smallholder clearing,
logging, oil palm, fuelwood, fire and peat, minus regrowth uptake. A fall could reflect less
clearing, or clearing of land holding less carbon, or stronger regrowth. These cannot be separated
here. Crucially, this variable is **modelled rather than measured**, so part of its year-to-year
movement reflects model assumptions. For all these reasons **no causal claim is made**: the analysis
shows that population growth and deforestation emissions in Cameroon have not moved together, not
that population growth has no effect on forests.

## 7. Conclusion

Answering the research question directly: population growth is associated with CO₂ emissions from
land-use change in Cameroon between 1961 and 2023 only to a {{STRENGTH}} extent, and in the
**opposite direction** to the population-pressure hypothesis. The primary test gives
rₛ = {{RHO_PRIMARY}} (*p* = {{P_PRIMARY}}, *n* = {{N_PRIMARY}}), which is {{SIG_WORD}} and negative.
That association does not survive detrending — first differences give rₛ = {{RHO_DIFFS}}
(*p* = {{P_DIFFS}}), {{DIFFS_SIG_WORD}} — and it reverses sign between the two sub-periods. The
defensible conclusion is that at national scale there is **no stable year-to-year relationship**
between how fast Cameroon's population grew and how much carbon its land-use change released, while
emissions per person fell by {{PC_DROP}}%.

The objectives were largely achieved: two complete annual series were assembled, tested with
appropriate non-parametric statistics, and checked against three separate threats to validity. The
investigation did not, and at national resolution could not, identify what does drive Cameroon's
deforestation. Every statement here rests on the data presented.

## 8. Evaluation

### 8.1 Reliability of the Data

The Global Carbon Budget is peer-reviewed, revised annually and transparently documented, and
population coverage is complete for every year. The serious qualification is that land-use-change
emissions are **output of bookkeeping models**, not measurements. They combine land-use statistics
with assumed carbon densities, and this term carries the largest uncertainty in the entire global
carbon budget. Treating these figures as observations would overstate their precision, and because
estimates are revised when the models change, a later release could alter the correlations reported
here. GDP is also missing for 2023.

### 8.2 Validity of the Measures

Land-use-change CO₂ is a proxy for deforestation, not a measure of it. It is a *net* flux that
includes degradation and peat and subtracts regrowth uptake, and it depends on the carbon density of
the land cleared. A fall in emissions is therefore consistent with less clearing, with clearing of
lower-carbon land, or with greater regrowth — three environmentally different outcomes that the data
cannot distinguish. The independent variable is also crude: **total** population counts urban
residents, whose land demand differs completely from that of farming households. Rural population
would have been the better variable and is the clearest single improvement available.

Aggregating nationally averages the forested south, where clearing occurs, with the drier north, where little forest remains, and inferring household behaviour from national aggregates risks the ecological fallacy.

### 8.3 Statistical Limitations

With *n* = {{N_PRIMARY}}, a coefficient must exceed {{CRIT_PRIMARY}} to reach significance, so only a
fairly strong relationship is detectable. More importantly, thirteen correlations were computed; at
α = 0.05 roughly one in twenty would be expected to appear significant by chance, so marginal results
such as the 1991–2023 sub-period (*p* = {{P_LATE}}) should not be read as findings. Correlation
cannot establish causal direction or exclude a third variable. The sign reversal between sub-periods
shows directly that the whole-period coefficient is unstable. Confounding variables not controlled
include urbanisation rate, world commodity prices, structural adjustment and debt, oil revenue,
timber concession activity, road construction, fuelwood demand and conflict-driven displacement —
several of which plausibly affect both variables.

### 8.4 Improvements and Further Research

Substituting rural for total population would sharpen the test immediately. Using a directly observed measure of forest area — FAO Forest Resources Assessment figures or satellite tree-cover-loss data — would remove dependence on modelled emissions, and working regionally would remove most of the aggregation problem. A multiple regression including population, income and commodity prices would begin to separate drivers that correlation cannot.

The attribution question is better answered by spatial overlay than by national correlation:
combining district-level population with satellite forest-loss maps would show directly whether
clearing happens where people are increasing. Comparing Cameroon with Côte d'Ivoire and Ghana, where
cocoa is mainly full-sun and forest loss has been heavier, would test whether shaded cultivation
genuinely reduces forest loss per tonne produced.

## 9. References

@REF@Bolt, J., & van Zanden, J. L. (2025). Maddison style estimates of the evolution of the world economy: A new 2023 update. *Journal of Economic Surveys, 39*(2), 631–671. https://doi.org/10.1111/joes.12618

@REF@Curtis, P. G., Slay, C. M., Harris, N. L., Tyukavina, A., & Hansen, M. C. (2018). Classifying drivers of global forest loss. *Science, 361*(6407), 1108–1111. https://doi.org/10.1126/science.aau3445

@REF@European Union. (2023). *Regulation (EU) 2023/1115 of the European Parliament and of the Council of 31 May 2023 on the making available on the Union market and the export from the Union of certain commodities and products associated with deforestation and forest degradation*. Official Journal of the European Union. https://eur-lex.europa.eu/eli/reg/2023/1115/oj

@REF@Food and Agriculture Organization of the United Nations. (2020). *Global Forest Resources Assessment 2020: Main report*. FAO. https://doi.org/10.4060/ca9825en

@REF@Friedlingstein, P., O'Sullivan, M., Jones, M. W., Andrew, R. M., Hauck, J., Landschützer, P., Le Quéré, C., Li, H., Luijkx, I. T., Olsen, A., Peters, G. P., Peters, W., Pongratz, J., Schwingshackl, C., Sitch, S., Canadell, J. G., Ciais, P., Jackson, R. B., Alin, S. R., … Zheng, B. (2025). Global Carbon Budget 2024. *Earth System Science Data, 17*(3), 965–1039. https://doi.org/10.5194/essd-17-965-2025

@REF@Gockowski, J., & Sonwa, D. (2011). Cocoa intensification scenarios and their predicted impact on CO₂ emissions, biodiversity conservation, and rural livelihoods in the Guinea rain forest of West Africa. *Environmental Management, 48*(2), 307–321. https://doi.org/10.1007/s00267-010-9602-3

@REF@Hansen, M. C., Potapov, P. V., Moore, R., Hancher, M., Turubanova, S. A., Tyukavina, A., Thau, D., Stehman, S. V., Goetz, S. J., Loveland, T. R., Kommareddy, A., Egorov, A., Chini, L., Justice, C. O., & Townshend, J. R. G. (2013). High-resolution global maps of 21st-century forest cover change. *Science, 342*(6160), 850–853. https://doi.org/10.1126/science.1244693

@REF@Ordway, E. M., Asner, G. P., & Lambin, E. F. (2017). Deforestation risk due to commodity crop expansion in sub-Saharan Africa. *Environmental Research Letters, 12*(4), 044015. https://doi.org/10.1088/1748-9326/aa6509

@REF@Our World in Data. (2025). *CO₂ and greenhouse gas emissions dataset* [Data set]. GitHub. Retrieved `[ACCESS DATE]`, from https://github.com/owid/co2-data

@REF@Tyukavina, A., Hansen, M. C., Potapov, P., Parker, D., Okpa, C., Stehman, S. V., Kommareddy, I., & Turubanova, S. (2018). Congo Basin forest loss dominated by increasing smallholder clearing. *Science Advances, 4*(11), eaat2993. https://doi.org/10.1126/sciadv.aat2993

## 10. Appendices

### Appendix A: Complete Dataset

All 63 annual observations for Cameroon, 1961–2023, exactly as extracted: year, population, annual
population increase, CO₂ from land-use change, land-use-change CO₂ per person, fossil CO₂ and GDP
per capita.

{{TABLE_APPENDIX}}

### Appendix B: Worked Spearman Calculation

The primary test computed by hand, to show the method rather than only the software output. Full
ranking table in `output/appendix_b_spearman.md`.

{{APPENDIX_B}}

### Appendix C: Extraction and Processing Record

Source file: `owid-co2-data.csv`, downloaded from https://github.com/owid/co2-data (14.4 MB).
Rows filtered to `country == "Cameroon"` and `1961 ≤ year ≤ 2023`. Columns retained:
`land_use_change_co2`, `population`, `gdp`, `co2`. Derived columns: annual population increase,
land-use-change CO₂ per person, GDP per capita. The complete analysis script is
`analysis/ess_analysis.py`; running it reproduces every number, table and figure in this report.

### Appendix D: Rejected Datasets

World Bank *agricultural land* (sq. km) and *permanent cropland* (% of land area) for Cameroon,
1961–2018. Agricultural land showed zero change in 21 of 57 year-on-year steps (37%) with only 35
distinct values; permanent cropland showed zero change in 26 of 57 steps (46%) with 28 distinct
values and was identical across 2011–2018. Both were rejected as carried-forward rather than
measured data.
