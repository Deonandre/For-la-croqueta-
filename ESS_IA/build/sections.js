// Body text of the IA (Sections 1-6). Loaded by build_ia.js, which supplies the helpers.
module.exports = function body(h) {
  const { H1, H2, P, Bullet, Num, Eq, Work, Caption, Figure, Tbl, AlignmentType, data, raw, ranks,
    f0, f3, pfmt } = h;
  const sp = data.spearman_loss_co2, fd = data.spearman_first_differences;
  const sub = data.spearman_2015_2024, lucT = data.spearman_loss_luc;
  const dl = data.describe_loss, dc = data.describe_co2, du = data.describe_luc;
  const g = data.gfw_meta, reg = data.regression_co2_on_loss, pr = data.pearson_loss_co2;
  const drvs = data.drivers_2001_2024_pct;
  const agri = (drvs["Shifting cultivation"] + drvs["Permanent agriculture"]).toFixed(0);
  const shw = data.shapiro;

  // ================================================================ 1. RESEARCH QUESTION AND INQUIRY
  H1("1. Research question and inquiry");
  H2("1.1 The environmental issue");
  P("Forests store carbon: trees absorb CO_{2} by photosynthesis, and part of this carbon returns to the atmosphere when tree cover is cleared, burned or decomposes. Between 2001 and 2019, the world’s forests were a net sink of 7.6 GtCO_{2}e yr^{−1}, although disturbances such as deforestation still released 8.1 GtCO_{2}e yr^{−1} (Harris et al., 2021). Globally, fossil fuels dominate: in 2024, fossil fuels and industry released 10.3 GtC, compared with 1.3 GtC from land-use change (Friedlingstein et al., 2026).");
  P(`Cameroon is a useful case study because the balance there is different. In 2000, 31.5 million ha (${g.extent_pct_of_country}% of the country) had more than 30% tree-canopy cover, and 2.23 million ha of it (${g.total_loss_pct_of_2000_extent.toFixed(1)}%) was lost between 2001 and 2024 (calculated from Global Forest Watch, 2026). In every year of this period, Cameroon’s estimated CO_{2} emissions from land-use change were ${data.luc_over_fossil_ratio_range[0].toFixed(1)} to ${data.luc_over_fossil_ratio_range[1].toFixed(1)} times its fossil-fuel and industrial emissions (calculated from Our World in Data, 2026). Forest loss is therefore central to both SDG 13 (Climate Action) and SDG 15 (Life on Land) (United Nations, 2015).`);
  P("However, headline national CO_{2} figures, such as the World Bank’s indicator, exclude land use, land-use change and forestry (LULUCF) (World Bank, n.d.). This raises the question of whether years with more tree-cover loss are also years of higher national CO_{2} emissions, or whether the two follow separate patterns.");

  H2("1.2 Research question");
  P("*To what extent is annual tree-cover loss associated with annual CO_{2} emissions in Cameroon from 2001 to 2024?*", { align: AlignmentType.CENTER });
  P("Here, “annual CO_{2} emissions” means Cameroon’s total CO_{2} from fossil fuels and industry, excluding land-use change, from the Global Carbon Budget 2025 (Friedlingstein et al., 2026), because this is the standard headline measure. As it leaves out CO_{2} released directly by forest clearance, land-use-change CO_{2} was analysed as a supplementary check. “Associated” means a monotonic statistical relationship; the design cannot establish causation.");

  H2("1.3 Variables");
  Caption("**Table 1.** Variables", true);
  Tbl(["Type", "Variable and unit", "Source / treatment"], [
    ["Independent", "Annual tree-cover loss (ha yr^{−1}), areas with >30% canopy cover in 2000", "Global Forest Watch (2026)"],
    ["Dependent", "Annual CO_{2} emissions excluding land-use change (Mt CO_{2} yr^{−1})", "Friedlingstein et al. (2026), via Our World in Data (2026)"],
    ["Controlled in processing", "Same national boundary; values matched by calendar year; one canopy threshold (30%); one release of each dataset", "Section 3.3"],
    ["Possible confounders (not controlled)", "Fossil-fuel use; economic and industrial growth; population (15.3 million in 2001, 29.1 million in 2024: Our World in Data, 2026); agricultural expansion; logging and fire; satellite method changes", "Sections 5.3 and 6"],
  ], [1700, 5126, 2200], { count: true, size: 18 });

  H2("1.4 Hypotheses");
  P("H_{0}: there is no monotonic association between annual tree-cover loss and annual CO_{2} emissions (ρ_{s} = 0).");
  P("H_{1}: there is a monotonic association (ρ_{s} ≠ 0), tested two-tailed at α = 0.05.");
  P("I expected a positive association, because land clearing and fossil-fuel use are both likely to grow with Cameroon’s population and economy. Such an association would not show that tree-cover loss produces the emissions in the dependent variable.");

  // ================================================================ 2. STRATEGY
  H1("2. Strategy: REDD+ in Cameroon");
  P("REDD+ (reducing emissions from deforestation and forest degradation, plus conservation and enhancement of forest carbon stocks) allows forest countries to receive international payments for verified reductions in forest emissions (Dkamela, 2011). Cameroon began REDD+ readiness work in 2008, and stakeholders validated a national REDD+ strategy in June 2018 (Republic of Cameroon, 2019). Its updated Nationally Determined Contribution (2021) targets a 35% cut in greenhouse-gas emissions by 2030, 12% of it unconditional, with forestry having the largest reduction potential (World Bank Group, 2022).");
  P("The outcome of REDD+ depends on tensions between groups with different goals:");
  Bullet(`**Smallholder farmers.** ${agri}% of Cameroon’s tree-cover loss with an identified driver came from agriculture: shifting cultivation (${drvs["Shifting cultivation"]}%) and permanent agriculture (${drvs["Permanent agriculture"]}%) (Sims et al., 2025, via Global Forest Watch, 2026). Clearing provides food and income, so restrictions without fair benefit-sharing could reduce support for REDD+ or move clearing elsewhere.`);
  Bullet("**Government and investors.** New investments in oil-palm plantations, oil and mineral extraction, infrastructure and energy are likely to increase forest loss (Dkamela, 2011), which conflicts with REDD+ commitments. The REDD+ process also repeated weaknesses of the 1994 forestry-law reform, including low inclusiveness of domestic actors and no national coalition supporting REDD+ (Dkamela et al., 2014).");
  Bullet("**International donors and NGOs.** Payments require reductions to be measured, reported and verified (MRV), but weak MRV, weak financing, no legal framework and inadequate stakeholder participation have constrained REDD+ in Cameroon (Alemagi et al., 2014).");
  P("These tensions affect the environmental outcome: if the farmers and ministries behind most clearing are not involved, and reductions cannot be measured reliably, payments may not be made and forest loss may continue. This links to my investigation. REDD+ is judged on forest emissions, which the headline national CO_{2} total leaves out. If national CO_{2} does not follow tree-cover loss from year to year, the headline total cannot show whether forest strategies work, and forest-specific monitoring is needed.");

  // ================================================================ 3. METHOD
  H1("3. Method");
  H2("3.1 Why secondary data were used");
  P("National annual forest loss can only be measured by satellite remote sensing, and national CO_{2} emissions are estimates built from energy and land-use statistics, so neither could be measured through fieldwork. Secondary data also give 24 years of consistently processed observations. The period 2001–2024 was chosen because the GFW loss record starts in 2001 and 2024 is the latest year in both datasets.");

  H2("3.2 Datasets");
  Caption("**Table 2.** Secondary datasets used", true);
  Tbl(["Feature", "Tree-cover loss (independent variable)", "CO_{2} emissions (dependent variable)"], [
    ["Producer", "University of Maryland GLAD laboratory and Google (Hansen et al., 2013); distributed by Global Forest Watch (GFW)", "Global Carbon Project (Friedlingstein et al., 2026); distributed by Our World in Data"],
    ["File and version", "Cameroon country-statistics workbook, release v20260427", "owid-co2-data.csv, updated 1 June 2026"],
    ["Variable", "tc_loss_ha_2001 to _2024, threshold 30", "co2 (supplementary: land_use_change_co2)"],
    ["Unit and precision", "Hectares, whole numbers", "Million tonnes CO_{2} (Mt), 3 decimal places"],
    ["Years available", "2001–2025", "1950–2024"],
    ["Method", "Landsat images at 30 m resolution; “tree cover” is vegetation over 5 m tall; “loss” is removal of at least half the tree cover in a pixel (Global Forest Watch, 2026)", "Fossil CO_{2} from energy and cement data; land-use-change CO_{2} from bookkeeping models using land-use data (Friedlingstein et al., 2026); converted from carbon to CO_{2} (× 3.664)"],
  ], [1700, 3663, 3663], { count: true, size: 17 });

  H2("3.3 Data extraction and processing");
  Num("Secondary data were obtained from the GFW workbook for Cameroon (accessed 23 September 2026), and its “ReadMe” sheet was read for definitions and cautions.");
  Num("On the “Country tree cover loss” sheet, the 30% canopy-threshold row was selected, because this is GFW’s default and one threshold must be used throughout (Global Forest Watch, 2026). Values for 2001–2024 were copied; 2025 has no matching CO_{2} value.");
  Num("The Our World in Data file was filtered for Cameroon, 2001–2024, and the columns “co2” and “land_use_change_co2” were copied.");
  Num("The series were matched by calendar year (Table 3) and checked for missing values: none of the 24 years was missing. (Coal and “other industry” components are not reported for Cameroon, which affects no year.)");
  Num("Raw values were kept at published precision. Processed statistics are given to 3 decimal places, or whole hectares for loss.");
  Num("Calculations were scripted in Python (pandas, SciPy) and checked against the hand formulae in Section 4. The unmodified source files and script were saved so the analysis can be repeated.");

  H2("3.4 Reliability, validity and ethics");
  P(`Both datasets come from established research groups and are peer-reviewed and openly documented (Hansen et al., 2013; Friedlingstein et al., 2026). To check consistency, I compared the loss data with the previous GFW release: the 2001–2024 values differed by at most ${g.max_abs_difference_vs_previous_release_ha} ha in any year.`);
  P("Three validity issues, evaluated in Section 6, were identified in advance: “loss” includes harvesting, fire and other disturbances, so it does not equal deforestation (Global Forest Watch, 2026); method and sensor changes in 2011–2015 may make recent loss appear higher (Global Forest Watch, 2024); and the dependent variable excludes land-use emissions. The investigation uses only public, national-level data with no human participants; all sources are credited, as Our World in Data’s licence requires (Our World in Data, 2026), and no values were altered or removed.");

  // ================================================================ 4. TREATMENT OF DATA
  H1("4. Treatment of data");
  H2("4.1 Raw data");
  Caption("**Table 3.** Raw data for Cameroon, 2001–2024, as published", true);
  Tbl(["Year", "Annual tree-cover loss (ha)", "Annual CO_{2} emissions excl. land-use change (Mt CO_{2})", "CO_{2} from land-use change (Mt CO_{2}) – supplementary", "Source"],
    raw.map((r) => [r[0], f0(+r[1]), f3(+r[2]), f3(+r[3]), "GFW; GCB via OWID"]),
    [750, 1700, 2150, 2150, 2276], { alignRight: [1, 2, 3], center: [0], size: 17 });
  P("Sources: GFW = Global Forest Watch (2026); GCB = Global Carbon Budget 2025 (Friedlingstein et al., 2026), via OWID = Our World in Data (2026). Loss at >30% canopy cover; no values are missing.", { size: 18, count: false, cat: "Data tables" });

  H2("4.2 Processed data: descriptive statistics");
  Caption("**Table 4.** Descriptive statistics, 2001–2024 (n = 24)", true);
  Tbl(["Statistic", "Tree-cover loss (ha)", "CO_{2} excl. land-use change (Mt)", "Land-use-change CO_{2} (Mt)"], [
    ["Mean", f0(dl.mean), f3(dc.mean), f3(du.mean)],
    ["Median", f0(dl.median), f3(dc.median), f3(du.median)],
    ["Standard deviation (sample)", f0(dl.sd_sample), f3(dc.sd_sample), f3(du.sd_sample)],
    ["Minimum (year)", `${f0(dl.min)} (2004)`, `${f3(dc.min)} (2002)`, `${f3(du.min)} (2005)`],
    ["Maximum (year)", `${f0(dl.max)} (2023)`, `${f3(dc.max)} (2016)`, `${f3(du.max)} (2009)`],
    ["Interquartile range (linear interpolation)", f0(dl.iqr), f3(dc.iqr), f3(du.iqr)],
    ["Coefficient of variation", `${dl.cv_pct.toFixed(1)}%`, `${dc.cv_pct.toFixed(1)}%`, `${du.cv_pct.toFixed(1)}%`],
    ["Mean 2001–2012", f0(data.period_mean_loss["2001_2012"]), f3(data.period_mean_co2["2001_2012"]), f3(data.period_mean_luc["2001_2012"])],
    ["Mean 2013–2024", f0(data.period_mean_loss["2013_2024"]), f3(data.period_mean_co2["2013_2024"]), f3(data.period_mean_luc["2013_2024"])],
    ["Shapiro–Wilk W (p)", `${shw.loss.W.toFixed(3)} (${shw.loss.p.toFixed(3)})`, `${shw.co2.W.toFixed(3)} (${shw.co2.p.toFixed(3)})`, `${shw.luc.W.toFixed(3)} (<0.001)`],
  ], [2826, 2000, 2100, 2100], { alignRight: [1, 2, 3], size: 18 });
  const lossRatio = data.period_mean_loss["2013_2024"] / data.period_mean_loss["2001_2012"];
  const co2Rise = 100 * (data.period_mean_co2["2013_2024"] / data.period_mean_co2["2001_2012"] - 1);
  P(`Loss was far more variable than CO_{2} (coefficient of variation ${dl.cv_pct.toFixed(1)}% compared with ${dc.cv_pct.toFixed(1)}%). Mean annual loss in 2013–2024 was ${lossRatio.toFixed(1)} times that of 2001–2012, while mean CO_{2} rose by ${co2Rise.toFixed(1)}%.`);

  H2("4.3 Trends over time");
  Figure("fig1_tree_cover_loss.png", 3.3, "**Figure 1.** Annual tree-cover loss, Cameroon (Global Forest Watch, 2026).");
  P("Loss stayed between 23,003 and 57,992 ha until 2012, then rose, with peaks in 2014, 2017, 2020 and 2023 (the maximum, 204,198 ha). The 3-year moving average, which GFW recommends to smooth detection effects between years (Global Forest Watch, 2024), rises almost continuously after 2011.");
  Figure("fig2_co2_emissions.png", 3.1, "**Figure 2.** Annual CO_{2} emissions excluding land-use change, Cameroon (Friedlingstein et al., 2026).");
  P("CO_{2} rose in two steps (2006–2007 and 2013–2015) and then levelled off between 9.582 and 9.965 Mt from 2015.");

  H2("4.4 Choice of statistical test");
  P(`Pearson’s r assumes a linear relationship between normally distributed variables. Shapiro–Wilk tests rejected normality for loss (W = ${shw.loss.W.toFixed(3)}, p = ${shw.loss.p.toFixed(3)}) and CO_{2} (W = ${shw.co2.W.toFixed(3)}, p = ${shw.co2.p.toFixed(3)}), and Figure 3 shows CO_{2} levelling off at high loss, so the relationship is not linear. Spearman’s rank correlation coefficient (*r*_{s}), which only needs ranked data and a monotonic relationship, was therefore the main test. There were no tied values, so the standard formula applies.`);

  H2("4.5 Spearman’s rank correlation");
  Eq("*r*_{s} = 1 − 6Σ*d*^{2} / [*n*(*n*^{2} − 1)]");
  P("where *d* is the difference between the two ranks for each year (rank 1 = smallest) and *n* = 24.");
  Caption("**Table 5.** Ranks for Spearman’s rank correlation", true);
  Tbl(["Year", "Loss (ha)", "Rank loss", "CO_{2} (Mt)", "Rank CO_{2}", "*d*", "*d*^{2}"],
    ranks.map((r) => [r[0], f0(+r[1]), r[2], f3(+r[3]), r[4], r[5].replace("-", "−"), r[6]]),
    [1100, 1500, 1200, 1400, 1300, 1200, 1326], { center: [0, 2, 4, 5, 6], alignRight: [1, 3], size: 17 });
  Work(`Σ*d*^{2} = ${sp.sum_d2}`);
  Work("*n*(*n*^{2} − 1) = 24 × (576 − 1) = 13,800");
  Work(`*r*_{s} = 1 − (6 × ${sp.sum_d2}) / 13,800 = 1 − 3,408 / 13,800 = 1 − 0.247 = **${sp.rs.toFixed(3)}**`);
  Work(`*t* = *r*_{s} √[(*n* − 2) / (1 − *r*_{s}^{2})] = 0.753 × √(22 / 0.433) = ${sp.t.toFixed(2)}   (df = 22)`);
  Work(`Critical *r*_{s} (α = 0.05, two-tailed, *n* = 24) = ${sp["rs_crit_0.05"].toFixed(3)};   *p* = ${pfmt(sp.p_two_tailed)}`);
  P(`As ${sp.rs.toFixed(3)} > ${sp["rs_crit_0.05"].toFixed(3)}, H_{0} is rejected: there is a strong, positive, statistically significant monotonic association. The critical value comes from the t-distribution (df = 22), and SciPy’s spearmanr function gave the same *r*_{s} and p-value.`);

  H2("4.6 Further tests of the association");
  P("One coefficient can mislead when both variables change over time, so further tests were made (Table 6).");
  Figure("fig3_scatter_loss_co2.png", 3.9, "**Figure 3.** CO_{2} emissions against tree-cover loss, with a descriptive least-squares line.");
  P(`**Least-squares line.** The line (R^{2} = ${reg.r2.toFixed(3)}; Pearson’s r = ${pr.r.toFixed(3)}) suggests about ${reg.slope_Mt_per_100000ha.toFixed(2)} Mt more CO_{2} per extra 100,000 ha of loss, but it only describes the trend. Its residuals follow a pattern (all five highest-loss years lie below the line), so it was not used for prediction.`);
  P(`**Time trend.** Both variables rise strongly with year (*r*_{s} = ${data.spearman_year_loss.toFixed(3)} for loss; ${data.spearman_year_co2.toFixed(3)} for CO_{2}).`);
  Figure("fig4_first_differences.png", 3.6, "**Figure 4.** Year-on-year changes in tree-cover loss and CO_{2} emissions.");
  P(`**First differences.** Subtracting each year’s value from the next removes the long-term trend (e.g. Δloss_{2002} = 28,767 − 39,204 = −10,437 ha). If the variables were linked from year to year, their changes should share a direction, but only ${data.same_direction_years} of 23 did (*r*_{s} = ${fd.rs.toFixed(3)}).`);
  P("**Consistent-method period.** GFW’s method changed little after 2015 (Global Forest Watch, 2024), so 2015–2024 was tested alone. As n = 10, an exact permutation test (all 3,628,800 rank orders) replaced the t-approximation.");
  Figure("fig5_scatter_loss_luc.png", 3.6, "**Figure 5.** Supplementary: land-use-change CO_{2} against tree-cover loss.");
  P("**Supplementary test.** Loss was compared with land-use-change CO_{2}, which includes CO_{2} from forest clearance (Figure 5).");
  Caption("**Table 6.** Summary of statistical tests", true);
  Tbl(["Test", "n", "Result", "p (two-tailed)", "Significant at α = 0.05?"], [
    ["Spearman: loss vs CO_{2} (main test)", "24", `*r*_{s} = ${sp.rs.toFixed(3)}`, pfmt(sp.p_two_tailed), `Yes (critical ${sp["rs_crit_0.05"].toFixed(3)})`],
    ["Least-squares line (descriptive)", "24", `R^{2} = ${reg.r2.toFixed(3)}`, "–", "Not tested"],
    ["Spearman: loss vs year", "24", `*r*_{s} = ${data.spearman_year_loss.toFixed(3)}`, "< 0.001", "Yes"],
    ["Spearman: CO_{2} vs year", "24", `*r*_{s} = ${data.spearman_year_co2.toFixed(3)}`, "< 0.001", "Yes"],
    ["Spearman: first differences", "23", `*r*_{s} = ${fd.rs.toFixed(3)}`, fd.p_two_tailed.toFixed(3), `No (critical ${fd["rs_crit_0.05"].toFixed(3)})`],
    ["Spearman: 2015–2024 only (exact)", "10", `*r*_{s} = ${sub.rs.toFixed(3)}`, sub.p_exact.toFixed(3), `Yes (critical ${sub["rs_crit_exact_0.05"].toFixed(3)})`],
    ["Spearman: loss vs land-use-change CO_{2}", "24", `*r*_{s} = ${lucT.rs.toFixed(3)}`, lucT.p_two_tailed.toFixed(3), `No (critical ${lucT["rs_crit_0.05"].toFixed(3)})`],
  ], [3000, 600, 1650, 1500, 2276], { center: [1, 3], size: 17 });

  // ================================================================ 5. ANALYSIS AND CONCLUSION
  H1("5. Analysis and conclusion");
  H2("5.1 Direction and strength of the association");
  P(`The main result is a strong positive association (*r*_{s} = ${sp.rs.toFixed(3)}, p < 0.001). However, Figure 3 shows two groups: 2001–2012 with low loss and low emissions, and 2013–2024 with high loss and high emissions. Within each group there is no clear upward pattern, so the association is mainly a difference between two periods, not a year-to-year link.`);
  P(`The further tests support this. Once the shared time trend is removed, the association disappears (*r*_{s} = ${fd.rs.toFixed(3)}, p = ${fd.p_two_tailed.toFixed(3)}). In 2015–2024, when CO_{2} varied by only 0.383 Mt (about 4%), the association was negative (*r*_{s} = ${sub.rs.toFixed(3)}, p = ${sub.p_exact.toFixed(3)}); the two highest-loss years, 2020 and 2023, did not have higher emissions. As four loss–CO_{2} tests were made, a Bonferroni threshold (0.05 / 4 = 0.0125) is safer, and by this standard the negative result is not significant. It shows only that the positive association does not hold within the latest decade.`);

  H2("5.2 Notable years and anomalies");
  Bullet("**2014–2015:** loss more than doubled in 2014 (to 181,851 ha) and then fell by 102,881 ha, while CO_{2} rose in both years. Landsat 8 data improved loss detection from 2013 (Global Forest Watch, 2024), so part of the 2014 peak may reflect better detection rather than more clearing.");
  Bullet(`**2007:** CO_{2} rose by ${f3(data.co2_2006_2007_change.co2)} Mt, the largest increase in the series, mainly from oil (+${f3(data.co2_2006_2007_change.oil_co2)} Mt) and gas (+${f3(data.co2_2006_2007_change.gas_co2)} Mt), while loss rose by only 9,931 ha. This was an energy-sector change.`);
  Bullet("**2008–2010:** land-use-change CO_{2} peaked (54.9, 81.9 and 51.2 Mt) when satellite-detected loss was low (35,141–57,992 ha), so the two forest-related datasets disagree about when forest carbon was lost.");

  H2("5.3 Environmental explanation and confounding variables");
  P(`The dependent variable consists of CO_{2} from oil, gas, cement and flaring, while ${agri}% of loss with an identified driver came from agriculture and only ${drvs["Logging"]}% from logging (Sims et al., 2025, via Global Forest Watch, 2026). As these are separate processes, the overall association most likely reflects shared drivers: Cameroon’s population grew ${data.population.ratio.toFixed(1)} times between 2001 and 2024 (Our World in Data, 2026), raising demand for both farmland and fuel. This is confounding, not evidence of causation. The 2011–2015 method change may also have added an artificial upward trend to loss, strengthening the correlation.`);
  P(`The rationale assumed that tree-cover loss contributes to CO_{2} emissions, but the main dependent variable excludes forest emissions, so the strong *r*_{s} cannot support that mechanism. Using land-use-change CO_{2} instead gave no significant association (*r*_{s} = ${lucT.rs.toFixed(3)}, p = ${lucT.p_two_tailed.toFixed(3)}). This does not mean forest loss releases no CO_{2}: the Global Carbon Budget models land-use emissions from land-use statistics, not satellite-detected loss (Friedlingstein et al., 2026). GFW’s model, which combines loss with carbon density, gives mean gross forest emissions of ${data.gfw_gross_forest_emissions_MtCO2e_mean_2001_2024} Mt CO_{2}e yr^{−1}, about seven times Cameroon’s mean fossil CO_{2} (Gibbs et al., 2025; Global Forest Watch, 2026), but it is derived from the loss data, so it cannot test the association independently.`);

  H2("5.4 Conclusion");
  P(`From 2001 to 2024, annual tree-cover loss in Cameroon had a strong, positive, statistically significant association with annual CO_{2} emissions excluding land-use change (*r*_{s} = ${sp.rs.toFixed(3)}, n = 24, p < 0.001), so H_{0} is rejected. However, the extent of a genuine association is limited. The correlation comes from both variables rising over time: it disappears when the trend is removed (*r*_{s} = ${fd.rs.toFixed(3)}), is absent in 2015–2024, and loss was not significantly associated with land-use-change CO_{2} (*r*_{s} = ${lucT.rs.toFixed(3)}). Years with more tree-cover loss were therefore not reliably years with higher CO_{2} emissions. The association most likely reflects shared drivers such as population and economic growth, and correlation alone cannot show that tree-cover loss causes CO_{2} emissions.`);
  Bullet(`**Reliability** is high: both sources are peer-reviewed, and loss values changed by no more than ${g.max_abs_difference_vs_previous_release_ha} ha between releases.`);
  Bullet("**Validity** is limited: the independent variable measures gross canopy loss, not permanent deforestation, and the dependent variable excludes land-use emissions.");
  Bullet("**Bias:** the 2011–2015 method change may systematically raise later loss estimates, inflating *r*_{s}.");
  Bullet("**Uncertainty:** no country-level CO_{2} uncertainty is given. Globally, the Global Carbon Budget gives ±0.5 GtC for fossil emissions (about 5%) but ±0.7 GtC for land-use change (about 54%) (Friedlingstein et al., 2026), and the loss map has global false-positive and false-negative rates of about 13% and 12% (Hansen et al., 2013).");
  P("For REDD+, Cameroon’s headline CO_{2} total cannot show whether forest policy is working; progress needs forest-specific data, supporting the importance of MRV (Alemagi et al., 2014).");

  // ================================================================ 6. EVALUATION
  H1("6. Evaluation");
  H2("6.1 Strengths");
  Bullet("A complete 24-year series with no missing years, from peer-reviewed sources with published methods.");
  Bullet("One definition and one release of each dataset were used throughout, and the loss data were stable between releases.");
  Bullet("Spearman’s rank was chosen using normality tests, and the hand calculation matched the software result.");
  Bullet("Sensitivity tests (trend removal, a consistent-method period, an alternative CO_{2} measure) checked whether the main result holds.");
  Bullet("The investigation is repeatable: source files, extraction steps and script were saved.");

  H2("6.2 Limitations and improvements");
  Caption("**Table 7.** Limitations, their effect and improvements", true);
  Tbl(["Limitation", "Effect on the conclusion", "Realistic improvement"], [
    ["**Dataset compatibility:** the independent variable is satellite-detected canopy loss; the dependent variable excludes land-use change.", "The main test compares different processes, so the strong *r*_{s} mostly reflects a shared trend.", "Use an independent estimate of forest emissions, such as the land-use sector of Cameroon’s national inventory reported to the UNFCCC, if it covers enough years."],
    ["**Loss is not deforestation:** about half of the loss came from shifting cultivation, which is followed by regrowth.", "Annual loss overstates permanent carbon loss, reducing validity.", "Repeat the analysis with GFW’s humid tropical primary forest loss (2002–2025), in the same workbook, which excludes previously cleared land."],
    ["**Temporal inconsistency:** detection improved in 2011–2015 (Global Forest Watch, 2024).", "Later loss may be over-estimated, inflating the positive *r*_{s}.", "Use 3-year moving averages, and analyse only the consistent period once more years exist (2025 loss data are already published)."],
    ["**Confounding variables** and a shared time trend.", "The correlation is inflated; causation cannot be inferred.", "Use partial correlation or multiple regression controlling for population and primary energy consumption, both in the Our World in Data file."],
    ["**National scale.**", "Loss occurs in forested regions, while fuel emissions occur where fuel is burnt, so national totals hide regional patterns.", "Combine the regional loss data in the GFW workbook with regional or gridded emission estimates, where available."],
    ["**Small sample and several tests:** n = 24, and n = 10 for 2015–2024.", "The 2015–2024 result is not significant after correction for multiple tests.", "Extend the series as new releases add years, and choose one main test in advance."],
    ["**Uncertainty of the dependent variable:** no country-level uncertainty is given.", "Changes of about 4% in 2015–2024 may be within error.", "Compare with an independent inventory, such as the World Bank’s EDGAR-based series (World Bank, n.d.), to estimate the spread between estimates."],
  ], [3000, 2800, 3226], { count: true, size: 17 });
};
