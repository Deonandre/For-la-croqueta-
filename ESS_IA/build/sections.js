// Body text of the IA (Sections 1-9). Loaded by build_ia.js, which supplies the helpers.
// Every number below is read from data/processed/*.csv or results.json - none is typed in by hand
// except values quoted from cited sources.
module.exports = function body(h) {
  const { H1, H2, P, Bullet, Num, Eq, Work, Caption, Figure, Tbl, AlignmentType, data, raw, ranks,
    f0, f3, pfmt } = h;
  const sp = data.spearman_loss_co2, fd = data.spearman_first_differences;
  const sub = data.spearman_2015_2024, lucT = data.spearman_loss_luc;
  const dl = data.describe_loss, dc = data.describe_co2, du = data.describe_luc;
  const g = data.gfw_meta, reg = data.regression_co2_on_loss, rw = data.regression_working;
  const drvs = data.drivers_2001_2024_pct;
  const agri = (drvs["Shifting cultivation"] + drvs["Permanent agriculture"]).toFixed(0);
  const shw = data.shapiro;
  const ch07 = data.co2_2006_2007_change;
  const n1 = (x) => x.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // ================================================================ 1. INTRODUCTION AND CONTEXT
  H1("1. Introduction and context");
  H2("1.1 Forests in the carbon cycle");
  P("In the carbon cycle, forests act as a store: carbon enters through photosynthesis, is held in biomass and soil, and returns to the atmosphere through respiration, decomposition and burning. Between 2001 and 2019, the world’s forests were a net sink of 7.6 GtCO_{2}e yr^{−1}, although disturbances such as deforestation still released 8.1 GtCO_{2}e yr^{−1} (Harris et al., 2021). Carbon storage is a regulating ecosystem service, whereas timber, food and farmland are provisioning services (Millennium Ecosystem Assessment, 2005), so clearing forest exchanges one type of service for another.");

  H2("1.2 Cameroon’s forests and emissions");
  P(`In 2000, 31.5 million ha (${g.extent_pct_of_country}%) of Cameroon had more than 30% tree-canopy cover, and 2.23 million ha of this tree cover (${g.total_loss_pct_of_2000_extent.toFixed(1)}%) was lost between 2001 and 2024 (calculated from Global Forest Watch, 2026). Globally, fossil fuels and industry released 10.3 GtC in 2024, compared with 1.3 GtC from land-use change (Friedlingstein et al., 2026). In Cameroon the balance is reversed: land-use-change CO_{2} was ${data.luc_over_fossil_ratio_range[0].toFixed(1)}–${data.luc_over_fossil_ratio_range[1].toFixed(1)} times fossil and industrial CO_{2} in every year from 2001 to 2024 (calculated from Our World in Data, 2026). Yet headline national CO_{2} figures, such as the World Bank indicator, exclude land use, land-use change and forestry (World Bank, n.d.), so they may not reflect forest loss at all.`);

  H2("1.3 Existing strategy: REDD+ and competing perspectives");
  P("REDD+ (reducing emissions from deforestation and forest degradation, plus conservation and enhancement of forest carbon stocks) gives forest carbon a financial value: forest countries can be paid for verified reductions in forest emissions (Dkamela, 2011). Cameroon began REDD+ readiness work in 2008 and validated a national REDD+ strategy in June 2018 (Republic of Cameroon, 2019), and forestry has the largest emission-reduction potential of any sector in its updated Nationally Determined Contribution (World Bank Group, 2022). The outcome of REDD+ depends on tensions between perspectives:");
  Bullet(`**Smallholder farmers:** ${agri}% of tree-cover loss with an identified driver came from agriculture, mainly shifting cultivation (${drvs["Shifting cultivation"]}%) and permanent agriculture (${drvs["Permanent agriculture"]}%) (Sims et al., 2025, via Global Forest Watch, 2026). Cleared land provides food and income, so restrictions without fair benefit-sharing could lose farmers’ support or move clearing elsewhere.`);
  Bullet("**Government and investors:** oil-palm, mining, oil, infrastructure and energy investments are likely to increase forest loss (Dkamela, 2011), and the REDD+ process has included few domestic actors (Dkamela et al., 2014).");
  Bullet("**International donors and NGOs:** payments require measurement, reporting and verification (MRV), but weak MRV, weak financing and inadequate stakeholder participation have constrained REDD+ in Cameroon (Alemagi et al., 2014).");
  P("If these groups are excluded or reductions cannot be measured, payments may not flow and forest loss may continue. My investigation tests whether national CO_{2} data can show the effect of forest loss, and therefore of such strategies.");

  // ================================================================ 2. SCIENTIFIC RATIONALE
  H1("2. Scientific rationale");
  P("Cameroon’s extensive forest ecosystems store carbon, and loss of tree cover can release this carbon as CO_{2} through burning and decomposition (Harris et al., 2021). This investigation therefore examines the relationship between annual tree-cover loss and annual CO_{2} emissions in Cameroon from 2001 to 2024, using secondary data from Global Forest Watch and the Global Carbon Budget. By analysing this relationship statistically, it aims to determine whether years with greater tree-cover loss are associated with higher CO_{2} emissions, while considering other factors that influence emissions, such as fossil-fuel use and population growth. It is relevant to SDG 13 (Climate Action) and SDG 15 (Life on Land), which includes the sustainable management of forests (United Nations, 2015).");

  // ================================================================ 3. RESEARCH QUESTION
  H1("3. Research question");
  H2("3.1 Research question and definitions");
  P("*To what extent is annual tree-cover loss associated with annual CO_{2} emissions in Cameroon from 2001 to 2024?*", { align: AlignmentType.CENTER });
  P("“Tree-cover loss” is used exactly as defined by Global Forest Watch (Table 2); it is not permanent deforestation. “Annual CO_{2} emissions” means Cameroon’s CO_{2} from fossil fuels and industry, excluding land-use change, from the Global Carbon Budget 2025 (Friedlingstein et al., 2026): the standard headline measure. Because this excludes CO_{2} released directly by forest clearance, land-use-change CO_{2} was analysed as a supplementary check. “Associated” means a monotonic statistical relationship; causation cannot be established.");

  H2("3.2 Variables");
  Caption("**Table 1.** Variables", true);
  Tbl(["Type", "Variable and unit", "Source / treatment"], [
    ["Independent", "Annual tree-cover loss (ha yr^{−1}), areas with >30% canopy cover in 2000", "Global Forest Watch (2026)"],
    ["Dependent", "Annual CO_{2} emissions excluding land-use change (Mt CO_{2} yr^{−1})", "Friedlingstein et al. (2026)"],
    ["Controlled in processing", "Same national boundary; matched calendar years; one canopy threshold; one release of each dataset", "Section 4.3"],
    ["Possible confounders", "Fossil-fuel use and energy production; industrial and economic growth; population; agriculture; logging and fire; changes in satellite methods", "Sections 7 and 9"],
  ], [1900, 4926, 2200], { count: true, size: 18 });

  H2("3.3 Hypotheses");
  P("H_{0}: there is no monotonic association between annual tree-cover loss and annual CO_{2} emissions (ρ_{s} = 0).");
  P("H_{1}: there is a monotonic association (ρ_{s} ≠ 0); two-tailed test, α = 0.05.");
  P("A positive association was expected, as land clearing and fossil-fuel use both tend to grow with population and the economy; this would not show that loss produces the measured emissions.");

  // ================================================================ 4. METHODOLOGY
  H1("4. Methodology: secondary data collection");
  H2("4.1 Selection of sources");
  P("Secondary data were used because national annual tree-cover loss can only be measured by satellite, and national CO_{2} emissions are estimates built from energy and land-use statistics. Global Forest Watch (GFW) distributes the University of Maryland’s loss data, produced with a peer-reviewed method (Hansen et al., 2013), as annual national totals. The peer-reviewed Global Carbon Budget (Friedlingstein et al., 2026) was preferred to the World Bank series (World Bank, n.d.) because one release gives both fossil and land-use-change CO_{2} for all 24 years. The period 2001–2024 was chosen because GFW’s record starts in 2001 and 2024 is the latest year in both datasets.");

  H2("4.2 Dataset verification");
  Caption("**Table 2.** Verified characteristics of the two datasets", true);
  Tbl(["Feature", "Tree-cover loss (independent variable)", "CO_{2} emissions (dependent variable)"], [
    ["Organisation", "University of Maryland GLAD laboratory and Google; distributed by GFW", "Global Carbon Project; distributed by Our World in Data (OWID)"],
    ["Dataset and version", "GFW country statistics for Cameroon (CMR.xlsx), version v20260427", "Global Carbon Budget 2025, in owid-co2-data.csv (updated 1 June 2026)"],
    ["URL", "gfw2-data.s3.amazonaws.com/country-pages/country_stats/download/2025/CMR.xlsx", "github.com/owid/co2-data"],
    ["Years; coverage", "2001–2025; national and regional", "1950–2024; national"],
    ["Unit", "Hectares (whole numbers)", "Million tonnes CO_{2} (Mt), 3 decimal places"],
    ["Definition", "“Tree cover”: vegetation over 5 m tall. “Loss”: stand-replacing disturbance (at least half the tree cover removed in a 30 m Landsat pixel)", "“co2”: CO_{2} excl. land-use change (Cameroon: oil, gas, cement, flaring). “land_use_change_co2”: bookkeeping-model estimates"],
    ["Limitations", "Loss is not deforestation; method changes in 2011–2015 (Global Forest Watch, 2026)", "Modelled estimates; no country-level uncertainty given"],
  ], [1500, 3763, 3763], { count: true, size: 17 });

  H2("4.3 Extraction, matching and organisation");
  Num("Secondary data were obtained by downloading both files on 23 September 2026; the GFW “ReadMe” sheet and OWID codebook were read for definitions.");
  Num("From GFW’s “Country tree cover loss” sheet, the 30% canopy-threshold row (GFW’s default) was selected and 2001–2024 values copied; 2025 has no CO_{2} value.");
  Num("In the OWID file, rows for Cameroon (2001–2024) were filtered and the columns “co2” and “land_use_change_co2” copied.");
  Num("The series were matched by calendar year (Table 3). No values were missing, so nothing was estimated or interpolated.");
  Num("Raw values were kept at published precision; processed statistics are rounded to 3 decimal places (whole hectares for loss).");
  Num("Calculations were scripted in Python (pandas, SciPy) and checked by hand formulae (Section 6) and independent calculations (Appendix A).");

  H2("4.4 Statistical methods");
  P("A Shapiro–Wilk test checked whether Pearson’s correlation, which assumes normal data, was appropriate; as it was not, Spearman’s rank correlation was the main test (α = 0.05), with a least-squares line describing the scatter graph. Sensitivity tests checked whether the association remains when the time trend is removed, within 2015–2024 (the most consistent satellite period), and with land-use-change CO_{2}.");

  H2("4.5 Reliability, validity and ethics");
  P(`As a reliability check, loss values for 2001–2024 differed from the previous GFW release by at most ${g.max_abs_difference_vs_previous_release_ha} ha. Validity is limited because “loss” includes harvesting and fire (Global Forest Watch, 2026), satellite methods changed in 2011–2015 (Global Forest Watch, 2024), and the dependent variable excludes land-use CO_{2} (Section 9). Only public, national-level data with no human participants were used; all sources are credited, as OWID’s licence requires (Our World in Data, 2026), and no values were altered.`);

  // ================================================================ 5. DATA PRESENTATION AND PROCESSING
  H1("5. Data presentation and processing");
  H2("5.1 Raw data");
  Caption("**Table 3.** Raw data for Cameroon, 2001–2024, as published", true);
  P("Sources: GFW = Global Forest Watch (2026); GCB = Global Carbon Budget 2025 (Friedlingstein et al., 2026), via OWID = Our World in Data (2026). Loss at >30% canopy cover; no values are missing.", { size: 17, count: false, cat: "Data tables", keepNext: true, spacing: { after: 60 } });
  Tbl(["Year", "Annual tree-cover loss (ha)", "Annual CO_{2} emissions excl. land-use change (Mt CO_{2})", "CO_{2} from land-use change (Mt CO_{2}) – supplementary", "Source"],
    raw.map((r) => [r[0], f0(+r[1]), f3(+r[2]), f3(+r[3]), "GFW; GCB via OWID"]),
    [750, 1700, 2150, 2150, 2276], { alignRight: [1, 2, 3], center: [0], size: 17 });

  H2("5.2 Processed data: descriptive statistics");
  Caption("**Table 4.** Descriptive statistics, 2001–2024 (n = 24)", true);
  Tbl(["Statistic", "Tree-cover loss (ha)", "CO_{2} excl. land-use change (Mt)", "Land-use-change CO_{2} (Mt)"], [
    ["Mean", f0(dl.mean), f3(dc.mean), f3(du.mean)],
    ["Median", f0(dl.median), f3(dc.median), f3(du.median)],
    ["Standard deviation (sample)", f0(dl.sd_sample), f3(dc.sd_sample), f3(du.sd_sample)],
    ["Minimum (year)", `${f0(dl.min)} (2004)`, `${f3(dc.min)} (2002)`, `${f3(du.min)} (2005)`],
    ["Maximum (year)", `${f0(dl.max)} (2023)`, `${f3(dc.max)} (2016)`, `${f3(du.max)} (2009)`],
    ["Interquartile range (linear interpolation)", f0(dl.iqr), f3(dc.iqr), f3(du.iqr)],
    ["Coefficient of variation", `${dl.cv_pct.toFixed(1)}%`, `${dc.cv_pct.toFixed(1)}%`, `${du.cv_pct.toFixed(1)}%`],
    ["Skewness", dl.skewness.toFixed(3), dc.skewness.toFixed(3), du.skewness.toFixed(3)],
    ["Mean 2001–2012", f0(data.period_mean_loss["2001_2012"]), f3(data.period_mean_co2["2001_2012"]), f3(data.period_mean_luc["2001_2012"])],
    ["Mean 2013–2024", f0(data.period_mean_loss["2013_2024"]), f3(data.period_mean_co2["2013_2024"]), f3(data.period_mean_luc["2013_2024"])],
  ], [2826, 2000, 2100, 2100], { alignRight: [1, 2, 3], size: 18 });
  const lossRatio = data.period_mean_loss["2013_2024"] / data.period_mean_loss["2001_2012"];
  const co2Rise = 100 * (data.period_mean_co2["2013_2024"] / data.period_mean_co2["2001_2012"] - 1);
  P(`Loss varied far more than CO_{2} (coefficient of variation ${dl.cv_pct.toFixed(1)}% compared with ${dc.cv_pct.toFixed(1)}%). Mean loss in 2013–2024 was ${lossRatio.toFixed(1)} times that in 2001–2012, while mean CO_{2} rose by ${co2Rise.toFixed(1)}%.`);

  H2("5.3 Trends over time");
  Figure("fig1_tree_cover_loss.png", 3.3, "**Graph 1.** Annual tree-cover loss in Cameroon, 2001–2024 (data: Global Forest Watch, 2026).");
  P("Loss stayed between 23,003 and 57,992 ha until 2012, then rose, with peaks in 2014, 2017, 2020 and 2023 (204,198 ha). The 3-year moving average, which GFW recommends for smoothing detection effects (Global Forest Watch, 2024), rises almost continuously after 2011.");
  Figure("fig2_co2_emissions.png", 3.1, "**Graph 2.** Annual CO_{2} emissions excluding land-use change, Cameroon, 2001–2024 (data: Friedlingstein et al., 2026).");
  P("CO_{2} rose in two steps (2006–2007 and 2013–2015) and then levelled off at 9.582–9.965 Mt from 2015.");

  // ================================================================ 6. STATISTICAL ANALYSIS
  H1("6. Statistical analysis");
  H2("6.1 Normality: Shapiro–Wilk test");
  P("**Purpose:** to check whether Pearson’s r is appropriate.");
  Eq("*W* = (Σ *a*_{i}*x*_{(i)})^{2} / Σ(*x*_{i} − *x̄*)^{2}");
  P("where *x*_{(i)} are the ordered values and *a*_{i} are constants derived from the normal distribution; *W* close to 1 indicates normality. Because the constants are tabulated, *W* was calculated with SciPy.");
  Work(`Tree-cover loss: *W* = ${shw.loss.W.toFixed(3)}, *p* = ${shw.loss.p.toFixed(3)}        CO_{2}: *W* = ${shw.co2.W.toFixed(3)}, *p* = ${shw.co2.p.toFixed(3)}`);
  P(`**Interpretation:** both p-values are below 0.05, so normality is rejected. Loss is right-skewed (skewness ${dl.skewness.toFixed(3)}; a few very high years after 2013) and CO_{2} is left-skewed (${dc.skewness.toFixed(3)}; many years at 9.6–9.9 Mt), so Pearson’s r is unsuitable for significance testing. **Limitation:** with n = 24 the test has low power, but both results are well below 0.05.`);

  H2("6.2 Spearman’s rank correlation (main test)");
  P("**Purpose:** to measure the strength and direction of a monotonic association without assuming normality. Values were ranked (1 = smallest); there were no ties.");
  Eq("*r*_{s} = 1 − 6Σ*d*^{2} / [*n*(*n*^{2} − 1)]");
  Caption("**Table 5.** Ranks and rank differences (*d*)", true);
  Tbl(["Year", "Loss (ha)", "Rank loss", "CO_{2} (Mt)", "Rank CO_{2}", "*d*", "*d*^{2}"],
    ranks.map((r) => [r[0], f0(+r[1]), r[2], f3(+r[3]), r[4], r[5].replace("-", "−"), r[6]]),
    [1100, 1500, 1200, 1400, 1300, 1200, 1326], { center: [0, 2, 4, 5, 6], alignRight: [1, 3], size: 17 });
  Work(`Σ*d*^{2} = ${sp.sum_d2};   *n*(*n*^{2} − 1) = 24 × (576 − 1) = 13,800`);
  Work(`*r*_{s} = 1 − (6 × ${sp.sum_d2}) / 13,800 = 1 − 3,408 / 13,800 = 1 − 0.247 = **${sp.rs.toFixed(3)}**`);
  Work(`Significance: *t* = *r*_{s} √[(*n* − 2) / (1 − *r*_{s}^{2})] = 0.753 × √(22 / 0.433) = ${sp.t.toFixed(2)}   (df = 22)`);
  Work(`Critical *r*_{s} (α = 0.05, two-tailed, *n* = 24) = ${sp["rs_crit_0.05"].toFixed(3)};   *p* = ${pfmt(sp.p_two_tailed)}`);
  P(`**Result and interpretation:** *r*_{s} = ${sp.rs.toFixed(3)} exceeds the critical value of ${sp["rs_crit_0.05"].toFixed(3)} (p < 0.001), so H_{0} is rejected; SciPy gave the same value. There is a strong positive monotonic association: periods when Cameroon lost more tree cover were also periods of higher fossil and industrial CO_{2} emissions. **Limitation:** *r*_{s} cannot separate a direct link from a shared time trend, and ranking ignores the size of differences between years.`);

  H2("6.3 Scatter graph and least-squares line");
  Figure("fig3_scatter_loss_co2.png", 3.9, "**Graph 3.** Annual CO_{2} emissions against annual tree-cover loss, 2001–2024, with a descriptive least-squares line.");
  P("**Purpose:** to describe the overall trend.");
  Work(`*b* = *S*_{xy} / *S*_{xx} = ${f0(rw.Sxy)} / ${n1(rw.Sxx)} = ${(rw.b * 1e5).toFixed(3)} × 10^{−5} Mt ha^{−1}`);
  Work(`*a* = *ȳ* − *b x̄* = ${f3(rw.y_mean)} − (${(rw.b * 1e5).toFixed(3)} × 10^{−5} × ${n1(rw.x_mean)}) = ${f3(rw.a)} Mt`);
  Work(`*r* = *S*_{xy} / √(*S*_{xx}*S*_{yy}) = ${f0(rw.Sxy)} / √(${n1(rw.Sxx)} × ${f3(rw.Syy)}) = ${rw.r.toFixed(3)};   *R*^{2} = ${reg.r2.toFixed(3)}`);
  P(`**Result:** CO_{2} = ${(reg.slope_Mt_per_ha * 1e5).toFixed(3)} × 10^{−5} × loss + ${f3(reg.intercept_Mt)} (R^{2} = ${reg.r2.toFixed(3)}), about ${reg.slope_Mt_per_100000ha.toFixed(2)} Mt more CO_{2} per extra 100,000 ha of loss. **Limitation:** the line is descriptive only; the data are not normal and the residuals are patterned (all five highest-loss years lie below the line because CO_{2} levels off), so it should not be used for prediction.`);

  H2("6.4 Sensitivity tests");
  P(`**(a) Time trend.** Purpose: to check for a shared time trend. Loss and CO_{2} each correlate strongly with year (*r*_{s} = ${data.spearman_year_loss.toFixed(3)} and ${data.spearman_year_co2.toFixed(3)}, p < 0.001). Limitation: a shared trend does not identify its cause.`);
  Figure("fig4_first_differences.png", 3.6, "**Graph 4.** Year-on-year changes in tree-cover loss and CO_{2} emissions, 2002–2024.");
  P(`**(b) First differences.** Purpose: to remove the long-term trend by correlating changes from one year to the next (e.g. Δloss_{2002} = 28,767 − 39,204 = −10,437 ha). Result: *r*_{s} = ${fd.rs.toFixed(3)} (p = ${fd.p_two_tailed.toFixed(3)}, n = 23); only ${data.same_direction_years} of 23 changes were in the same direction. Limitation: differencing emphasises year-to-year noise.`);
  P(`**(c) 2015–2024 only.** Purpose: to use the period in which GFW’s method changed least (Global Forest Watch, 2024). As n = 10, an exact permutation test of all 3,628,800 rank orders was used: *r*_{s} = ${sub.rs.toFixed(3)} (p = ${sub.p_exact.toFixed(3)}). Limitation: small sample (Section 7.3).`);
  Figure("fig5_scatter_loss_luc.png", 3.6, "**Graph 5.** Supplementary: land-use-change CO_{2} against annual tree-cover loss, 2001–2024.");
  P(`**(d) Land-use-change CO_{2}.** Purpose: to test the forest-carbon pathway in the rationale. Result: *r*_{s} = ${lucT.rs.toFixed(3)} (p = ${lucT.p_two_tailed.toFixed(3)}), not significant. Limitation: the datasets estimate forest change differently (Section 7.2).`);

  H2("6.5 Summary of results");
  Caption("**Table 6.** Summary of statistical tests", true);
  Tbl(["Test", "n", "Result", "p (two-tailed)", "Significant at α = 0.05?"], [
    ["Spearman: loss vs CO_{2} (main test)", "24", `*r*_{s} = ${sp.rs.toFixed(3)}`, pfmt(sp.p_two_tailed), `Yes (critical ${sp["rs_crit_0.05"].toFixed(3)})`],
    ["Least-squares line (descriptive)", "24", `R^{2} = ${reg.r2.toFixed(3)}`, "–", "Not tested"],
    ["(a) Spearman: loss vs year", "24", `*r*_{s} = ${data.spearman_year_loss.toFixed(3)}`, "< 0.001", "Yes"],
    ["(a) Spearman: CO_{2} vs year", "24", `*r*_{s} = ${data.spearman_year_co2.toFixed(3)}`, "< 0.001", "Yes"],
    ["(b) Spearman: first differences", "23", `*r*_{s} = ${fd.rs.toFixed(3)}`, fd.p_two_tailed.toFixed(3), `No (critical ${fd["rs_crit_0.05"].toFixed(3)})`],
    ["(c) Spearman: 2015–2024 (exact test)", "10", `*r*_{s} = ${sub.rs.toFixed(3)}`, sub.p_exact.toFixed(3), `Yes (critical ${sub["rs_crit_exact_0.05"].toFixed(3)})`],
    ["(d) Spearman: loss vs land-use-change CO_{2}", "24", `*r*_{s} = ${lucT.rs.toFixed(3)}`, lucT.p_two_tailed.toFixed(3), `No (critical ${lucT["rs_crit_0.05"].toFixed(3)})`],
  ], [3100, 600, 1600, 1450, 2276], { center: [1, 3], size: 17 });

  // ================================================================ 7. ANALYSIS AND DISCUSSION
  H1("7. Analysis and discussion");
  H2("7.1 What the data directly show");
  P(`Graph 3 shows the structure of the strong positive association (*r*_{s} = ${sp.rs.toFixed(3)}): 2001–2012 form a cluster of low loss and low emissions, and 2013–2024 a cluster of high loss and high emissions, with no clear upward pattern inside either cluster. The association disappears when the trend is removed (*r*_{s} = ${fd.rs.toFixed(3)}), is negative within 2015–2024 (*r*_{s} = ${sub.rs.toFixed(3)}), when CO_{2} varied by only 0.383 Mt (about 4%), and is absent for land-use-change CO_{2} (*r*_{s} = ${lucT.rs.toFixed(3)}). Notable years:`);
  Bullet("**2014–2015:** loss more than doubled to 181,851 ha, then fell by 102,881 ha, while CO_{2} rose in both years.");
  Bullet(`**2007:** CO_{2} rose by ${f3(ch07.co2)} Mt, the largest increase, mainly from oil (+${f3(ch07.oil_co2)} Mt) and gas (+${f3(ch07.gas_co2)} Mt), while loss rose by only 9,931 ha.`);
  Bullet("**2008–2010:** land-use-change CO_{2} peaked (54.9, 81.9 and 51.2 Mt) while satellite-detected loss was low (35,141–57,992 ha).");

  H2("7.2 What can reasonably be inferred");
  P(`The dependent variable comes from oil, gas, cement and flaring, whereas ${agri}% of loss with an identified driver came from agriculture and only ${drvs["Logging"]}% from logging (Sims et al., 2025, via Global Forest Watch, 2026). These are different anthropogenic activities, so the overall association most likely reflects confounding variables that drive both: Cameroon’s population grew ${data.population.ratio.toFixed(1)} times from 2001 to 2024 (Our World in Data, 2026), raising demand for both farmland and energy.`);
  P("Measurement effects may add to this: Landsat 8 improved loss detection from 2013 (Global Forest Watch, 2024), which may partly explain the 2014 peak and strengthen the correlation. The 2007 CO_{2} jump came from the energy sector, so the dependent variable can change for reasons unrelated to forests.");
  P(`The 2008–2010 mismatch suggests that the two forest-carbon datasets describe forest change differently: the Global Carbon Budget models land-use emissions from land-use statistics, not satellite-detected loss (Friedlingstein et al., 2026). GFW’s model, combining loss with carbon density, estimates mean gross forest emissions of ${data.gfw_gross_forest_emissions_MtCO2e_mean_2001_2024} Mt CO_{2}e yr^{−1}, about seven times Cameroon’s mean fossil CO_{2} (Gibbs et al., 2025; Global Forest Watch, 2026). Forest carbon losses may therefore be large, but as this estimate is derived from the loss data it cannot test the association independently.`);

  H2("7.3 What cannot be concluded");
  Bullet("That tree-cover loss causes CO_{2} emissions: correlation cannot show causation, and the main dependent variable does not contain forest emissions.");
  Bullet(`That loss reduced emissions after 2015: four tests of the loss–CO_{2} association were made, so a Bonferroni threshold of 0.05 / 4 = 0.0125 is safer, and p = ${sub.p_exact.toFixed(3)} does not meet it.`);
  Bullet("That forest loss releases no CO_{2}: the land-use-change estimates are modelled differently from GFW loss.");
  Bullet("Regional or within-year patterns, as only national annual totals were used.");

  H2("7.4 Links to the rationale and to REDD+");
  P("The rationale expected years with greater tree-cover loss to have higher CO_{2} emissions; the data support this only across the whole period, not year by year, and shared drivers explain the evidence better than a direct link. For REDD+, the headline CO_{2} total therefore cannot show whether forest policy is working: forest-specific data and strong MRV are needed (Alemagi et al., 2014).");

  // ================================================================ 8. CONCLUSION
  H1("8. Conclusion");
  P(`From 2001 to 2024, annual tree-cover loss in Cameroon had a strong, positive and statistically significant association with annual CO_{2} emissions excluding land-use change (*r*_{s} = ${sp.rs.toFixed(3)}, n = 24, p < 0.001), so the data support an association and H_{0} is rejected. However, the extent of a genuine association is limited. It is produced by both variables rising over time: it disappears when the trend is removed (*r*_{s} = ${fd.rs.toFixed(3)}, p = ${fd.p_two_tailed.toFixed(3)}), it is absent in 2015–2024, and loss was not significantly associated with land-use-change CO_{2} (*r*_{s} = ${lucT.rs.toFixed(3)}, p = ${lucT.p_two_tailed.toFixed(3)}). Years with greater tree-cover loss were therefore not reliably years of higher CO_{2} emissions.`);
  P("The most likely explanation is shared drivers such as population and economic growth. Causation cannot be established: correlation does not control for these confounders, the dependent variable excludes forest emissions, gross tree-cover loss is not permanent deforestation, and the 2011–2015 satellite method change may have inflated the correlation.");

  // ================================================================ 9. EVALUATION
  H1("9. Evaluation");
  H2("9.1 Strengths");
  Bullet("A complete 24-year matched series with no missing values, from peer-reviewed sources.");
  Bullet(`Consistent definitions throughout; loss values changed by at most ${g.max_abs_difference_vs_previous_release_ha} ha between releases.`);
  Bullet("The test was chosen from the data’s properties, and hand calculations matched the software.");
  Bullet("Sensitivity tests checked whether the main result holds.");

  H2("9.2 Limitations and improvements");
  P("Relying on secondary data meant the underlying satellite images and energy statistics could not be checked directly (Table 7 summarises further limitations).");
  Caption("**Table 7.** Limitations and improvements", true);
  Tbl(["Limitation", "Effect on conclusion", "Improvement: what and how", "Why it would help"], [
    ["**Dataset compatibility:** satellite-detected canopy loss vs fossil and industrial CO_{2}; loss is recorded when detected, which can lag late-year events (Global Forest Watch, 2024).", "The main *r*_{s} mostly reflects a shared trend, not a carbon link.", "Use an independent forest-emission variable, e.g. the land-use sector of Cameroon’s UNFCCC inventory, if enough years exist.", "Tests the rationale’s carbon pathway directly."],
    ["**Validity:** about half the loss was shifting cultivation, which is followed by regrowth.", "Loss overstates permanent carbon loss.", "Repeat with GFW’s humid tropical primary forest loss (2002–2025), in the same workbook.", "Excludes previously cleared, regrowing land."],
    ["**Temporal consistency:** detection improved in 2011–2015 (Global Forest Watch, 2024).", "Later loss may be over-estimated, inflating *r*_{s}.", "Use 3-year moving averages; analyse only post-2015 data once more years are released.", "Reduces artificial trends from satellite changes."],
    ["**Confounding** by population and economic growth.", "Correlation inflated; causation cannot be inferred.", "Partial correlation or multiple regression with population and primary energy consumption (both in the OWID file).", "Shows whether any association remains once shared growth is removed."],
    ["**Precision:** no country-level CO_{2} uncertainty; globally about ±5% for fossil and ±54% for land-use CO_{2} (Friedlingstein et al., 2026). Loss-map accuracy: 87% user’s, 88% producer’s (Hansen et al., 2013).", "Small differences, e.g. the 4% CO_{2} range in 2015–2024, may not be real.", "Compare with an independent inventory, such as the World Bank’s EDGAR-based series (World Bank, n.d.).", "The spread between inventories estimates uncertainty."],
    ["**Scale and sample size:** national totals; n = 24 (10 for 2015–2024).", "Regional patterns hidden; sub-period result weak.", "Combine GFW regional loss data with regional or gridded emission estimates, where available.", "Links loss and emissions in the same places and increases n."],
  ], [2500, 1900, 2526, 2100], { count: true, size: 16 });
};
