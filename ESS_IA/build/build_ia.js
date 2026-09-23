// Builds the ESS IA as a .docx. Run: NODE_PATH=<dir with docx> node build/build_ia.js
// Inline markup: **bold**, *italic*, _{subscript}, ^{superscript}
// Every block is tagged as counted / not counted so the word count can be reported.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, ShadingType, BorderStyle, LevelFormat,
  Header, Footer, PageNumber, PageBreak, TableLayoutType, VerticalAlign, LineRuleType,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data/processed/results.json"), "utf8"));
const raw = fs.readFileSync(path.join(ROOT, "data/processed/cameroon_2001_2024_matched.csv"), "utf8")
  .trim().split("\n").slice(1).map((l) => l.split(","));
const ranks = fs.readFileSync(path.join(ROOT, "data/processed/spearman_rank_table.csv"), "utf8")
  .trim().split("\n").slice(1).map((l) => l.split(","));

const FONT = "Arial";
const TEXT_W = 9026; // A4 width minus 2 x 1440 margins (DXA)
const counted = []; // text that counts towards the word limit
const excluded = {}; // category -> word total (for the statement)
const children = [];
let section = "Cover";
const bySection = {};

// ------------------------------------------------------------------ inline markup
function runs(text, o = {}) {
  const out = [];
  let buf = "", bold = false, ital = false, i = 0;
  const mk = (t, extra = {}) => new TextRun({
    // proper minus sign for negative numbers (e.g. "= -0.069" -> "= −0.069")
    text: t.replace(/(^|[\s(=])-(\d)/g, "$1\u2212$2"), font: FONT,
    bold: bold || o.bold ? true : undefined, italics: ital || o.italics ? true : undefined,
    size: o.size, color: o.color, ...extra,
  });
  const flush = () => { if (buf) { out.push(mk(buf)); buf = ""; } };
  while (i < text.length) {
    if (text.startsWith("**", i)) { flush(); bold = !bold; i += 2; continue; }
    if (text[i] === "*") { flush(); ital = !ital; i += 1; continue; }
    if ((text[i] === "_" || text[i] === "^") && text[i + 1] === "{") {
      flush();
      const j = text.indexOf("}", i);
      const t = text.slice(i + 2, j);
      out.push(mk(t, text[i] === "_" ? { subScript: true } : { superScript: true }));
      i = j + 1; continue;
    }
    buf += text[i]; i += 1;
  }
  flush();
  return out;
}
const plain = (t) => t.replace(/\*\*/g, "").replace(/\*/g, "").replace(/[_^]\{([^}]*)\}/g, "$1");
const words = (t) => plain(t).split(/\s+/).filter((w) => w.length > 0).length;
function tally(text, isCounted, category) {
  if (isCounted) { counted.push(plain(text)); bySection[section] = (bySection[section] || 0) + words(text); }
  else excluded[category] = (excluded[category] || 0) + words(text);
}

// ------------------------------------------------------------------ block helpers
function H1(t) {
  section = t;
  tally(t, false, "Headings");
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(t) }));
}
function H2(t) {
  tally(t, false, "Headings");
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(t) }));
}
function P(t, opts = {}) {
  tally(t, opts.count !== false, opts.cat || "Other");
  children.push(new Paragraph({
    children: runs(t, opts), alignment: opts.align,
    spacing: opts.spacing, keepNext: opts.keepNext,
  }));
}
function Bullet(t, opts = {}) {
  tally(t, opts.count !== false, opts.cat || "Other");
  children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: runs(t) }));
}
function Num(t, ref = "steps") {
  tally(t, true);
  children.push(new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t) }));
}
function Eq(t) { // equations / calculations: excluded from word count
  tally(t, false, "Equations and calculations");
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 },
    children: runs(t) }));
}
function Work(t) { // lines of working: excluded
  tally(t, false, "Equations and calculations");
  children.push(new Paragraph({ indent: { left: 720 }, spacing: { after: 40 }, children: runs(t) }));
}
function Caption(t, above = false) { // captions: counted (conservative)
  tally(t, true);
  children.push(new Paragraph({
    keepNext: above, spacing: { before: above ? 160 : 60, after: above ? 60 : 200 },
    children: runs(t, { size: 18, italics: false, color: "333333" }),
  }));
}
function Figure(file, hIn, caption) {
  const img = fs.readFileSync(path.join(ROOT, "figures", file));
  const w = 600, h = Math.round(600 * hIn / 6.3);
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 0, line: 240, lineRule: LineRuleType.AUTO },
    children: [new ImageRun({ type: "png", data: img, transformation: { width: w, height: h },
      altText: { title: file, description: plain(caption), name: file } })] }));
  Caption(caption);
}
const border = { style: BorderStyle.SINGLE, size: 4, color: "A6A6A6" };
const borders = { top: border, bottom: border, left: border, right: border };
function Tbl(headers, rows, widths, o = {}) {
  const size = o.size || 18;
  const isCounted = !!o.count;
  const keep = rows.length <= 12; // keep short tables on one page
  const cell = (t, w, head, align, last) => {
    tally(t, isCounted, o.cat || "Data tables");
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, borders,
      verticalAlign: VerticalAlign.CENTER,
      shading: head ? { fill: "E8E7E3", type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 40, bottom: 40, left: 90, right: 90 },
      children: [new Paragraph({ alignment: align, keepNext: keep && !last, spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: runs(t, { size, bold: head }) })],
    });
  };
  const align = (j) => (o.alignRight && o.alignRight.includes(j) ? AlignmentType.RIGHT
    : o.center && o.center.includes(j) ? AlignmentType.CENTER : AlignmentType.LEFT);
  const trs = [new TableRow({ tableHeader: true, cantSplit: true,
    children: headers.map((h, j) => cell(h, widths[j], true, align(j))) })];
  rows.forEach((r, i) => trs.push(new TableRow({ cantSplit: true,
    children: r.map((c, j) => cell(String(c), widths[j], false, align(j), i === rows.length - 1)) })));
  children.push(new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths, layout: TableLayoutType.FIXED, rows: trs }));
  children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
}
const pageBreak = () => children.push(new Paragraph({ children: [new PageBreak()] }));

// ------------------------------------------------------------------ number formatting
const f0 = (x) => Math.round(x).toLocaleString("en-GB");
const f3 = (x) => Number(x).toFixed(3);
const sp = data.spearman_loss_co2, fd = data.spearman_first_differences;
const sub = data.spearman_2015_2024, lucT = data.spearman_loss_luc;
const dl = data.describe_loss, dc = data.describe_co2, du = data.describe_luc;
const g = data.gfw_meta, reg = data.regression_co2_on_loss, pr = data.pearson_loss_co2;
const drvs = data.drivers_2001_2024_pct;
const pfmt = (p) => (p < 0.001 ? p.toExponential(1).replace("e-", " × 10^{−").concat("}") : p.toFixed(3));

// ================================================================== COVER PAGE
const cover = (t, o = {}) => {
  tally(t, false, "Cover page");
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after || 200, before: o.before || 0 },
    children: runs(t, { size: o.size || 24, bold: o.bold }) }));
};
cover("Environmental Systems and Societies", { size: 36, bold: true, before: 2200 });
cover("Internal Assessment", { size: 32, bold: true, after: 900 });
cover("**Research question:**", { size: 24, after: 120 });
cover("*To what extent is annual tree-cover loss associated with annual CO_{2} emissions in Cameroon from 2001 to 2024?*", { size: 26, after: 1200 });
cover("**Candidate:** [MY NAME]");
cover("**Candidate number:** [MY CANDIDATE NUMBER]");
cover("**School:** [MY SCHOOL]");
cover("**Examination session:** [MY SESSION]");
cover("**Word count:** WORDCOUNT_PLACEHOLDER words", { before: 400 });
pageBreak();

// ================================================================== SECTIONS 1-6
require('./sections.js')({ H1, H2, P, Bullet, Num, Eq, Work, Caption, Figure, Tbl, AlignmentType,
  data, raw, ranks, f0, f3, pfmt });

// ================================================================== REFERENCES
pageBreak();
H1("References");
const refs = [
  "Alemagi, D., Minang, P.A., Feudjio, M. and Duguma, L. (2014) ‘REDD+ readiness process in Cameroon: an analysis of multi-stakeholder perspectives’, *Climate Policy*, 14(6), pp. 709–733. doi:10.1080/14693062.2014.905439.",
  "Dkamela, G.P. (2011) *The context of REDD+ in Cameroon: drivers, agents and institutions*. Occasional Paper 57. Bogor: Center for International Forestry Research (CIFOR). Available at: https://www.cifor-icraf.org/publications/pdf_files/OccPapers/OP-57.pdf",
  "Dkamela, G.P., Brockhaus, M., Kengoum Djiegni, F., Schure, J. and Assembe Mvondo, S. (2014) ‘Lessons for REDD+ from Cameroon’s past forestry law reform: a political economy analysis’, *Ecology and Society*, 19(3), art. 30. doi:10.5751/ES-06839-190330.",
  "Friedlingstein, P., O’Sullivan, M., Jones, M.W., Andrew, R.M. et al. (2026) ‘Global Carbon Budget 2025’, *Earth System Science Data*, 18(5), pp. 3211–3288. doi:10.5194/essd-18-3211-2026.",
  "Gibbs, D.A., Rose, M. et al. (2025) ‘Revised and updated geospatial monitoring of 21st century forest carbon fluxes’, *Earth System Science Data*, 17(3), pp. 1217–1243. Available at: https://essd.copernicus.org/articles/17/1217/2025/",
  "Global Forest Watch (2024) *How tree cover loss data has changed over time*. GFW Blog, 20 March. Available at: https://www.globalforestwatch.org/blog/data-and-tools/tree-cover-loss-satellite-data-trend-analysis/ (Accessed: 23 September 2026).",
  "Global Forest Watch (2026) *Cameroon country statistics: tree cover loss, drivers and carbon data* [dataset, CMR.xlsx], version v20260427. World Resources Institute. Available at: https://gfw2-data.s3.amazonaws.com/country-pages/country_stats/download/2025/CMR.xlsx (Accessed: 23 September 2026).",
  "Hansen, M.C., Potapov, P.V., Moore, R., Hancher, M., Turubanova, S.A., Tyukavina, A., Thau, D., Stehman, S.V., Goetz, S.J., Loveland, T.R. et al. (2013) ‘High-resolution global maps of 21st-century forest cover change’, *Science*, 342(6160), pp. 850–853. doi:10.1126/science.1244693.",
  "Harris, N.L., Gibbs, D.A., Baccini, A. et al. (2021) ‘Global maps of twenty-first century forest carbon fluxes’, *Nature Climate Change*, 11, pp. 234–240. doi:10.1038/s41558-020-00976-6.",
  "Our World in Data (2026) *CO₂ and greenhouse gas emissions dataset* [dataset, owid-co2-data.csv and codebook], compiled by Rosado, P., Ritchie, H., Roser, M., Mathieu, E. and Macdonald, B.; last updated 1 June 2026; CO₂ data from the Global Carbon Budget (2025). Available at: https://github.com/owid/co2-data (Accessed: 23 September 2026).",
  "Republic of Cameroon (2019) *Self-assessment of the REDD+ readiness phase by stakeholders report* [R-Package]. Forest Carbon Partnership Facility. Available at: https://www.forestcarbonpartnership.org/system/files/documents/Cameroon%20R-Package%20%20%20review_25-2-19.pdf",
  "Sims, M., Stanimirova, R., Raichuk, A., Neumann, M. et al. (2025) ‘Global drivers of forest loss at 1 km resolution’, *Environmental Research Letters*, 20(7), 074027. doi:10.1088/1748-9326/add606.",
  "United Nations (2015) *Transforming our world: the 2030 Agenda for Sustainable Development* (A/RES/70/1). New York: United Nations.",
  "World Bank (n.d.) *Carbon dioxide (CO₂) emissions (total) excluding LULUCF (Mt CO₂e)* [indicator EN.GHG.CO2.MT.CE.AR5]. World Development Indicators. Available at: https://data.worldbank.org/indicator/EN.GHG.CO2.MT.CE.AR5",
  "World Bank Group (2022) *Cameroon Country Climate and Development Report*. CCDR Series. Washington, DC: World Bank. Available at: https://documents1.worldbank.org/curated/en/099950111012212064/pdf/P1772970d596ef0c1099f50769d4371d04b.pdf",
];
refs.forEach((r) => {
  tally(r, false, "References");
  children.push(new Paragraph({ indent: { left: 567, hanging: 567 }, spacing: { after: 100 },
    children: runs(r, { size: 20 }) }));
});
H2("Declaration of AI assistance");
const aiDecl = "[Complete according to your school’s academic integrity policy and IB guidance on AI tools. State which tool was used, for what, the prompt(s) and the date, e.g. Anthropic (2026) Claude [AI assistant], 23 September 2026.]";
tally(aiDecl, false, "Declaration");
children.push(new Paragraph({ children: runs(aiDecl, { size: 20, italics: true }) }));

// ------------------------------------------------------------------ word count statement
const total = counted.reduce((a, t) => a + words(t), 0);
H2("Word-count statement");
const stmt = [
  `Approximate word count: **${total.toLocaleString("en-GB")} words**, counting all prose in Sections 1–6, including in-text citations, figure and table captions, and the text-based Tables 1, 2 and 7.`,
  `Not counted: the cover page; headings; data tables (Tables 3–6); equations and lines of calculation; text inside graphs; the reference list; this statement and the AI declaration.`,
];
stmt.forEach((t) => {
  tally(t, false, "Statement");
  children.push(new Paragraph({ children: runs(t, { size: 20 }) }));
});


// ------------------------------------------------------------------ document
const doc = new Document({
  creator: "ESS IA",
  title: "ESS Internal Assessment: tree-cover loss and CO2 emissions in Cameroon",
  styles: {
    default: {
      document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { after: 140, line: 276, lineRule: LineRuleType.AUTO } } },
      heading1: { run: { font: FONT, size: 28, bold: true, color: "1F1F1F" },
        paragraph: { spacing: { before: 300, after: 140, line: 276, lineRule: LineRuleType.AUTO }, keepNext: true } },
      heading2: { run: { font: FONT, size: 23, bold: true, color: "333333" },
        paragraph: { spacing: { before: 200, after: 100, line: 276, lineRule: LineRuleType.AUTO }, keepNext: true } },
    },
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    { reference: "steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: {
      titlePage: true,
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: runs("ESS Internal Assessment – Tree-cover loss and CO_{2} emissions in Cameroon", { size: 16, color: "666666" }) })] }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "666666" })] })] }),
    },
    children,
  }],
});

const out = path.join(ROOT, "ESS_IA_Cameroon_TreeCoverLoss_CO2.docx");
Packer.toBuffer(doc).then(async (buf) => {
  // replace the cover-page placeholder with the final count
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file("word/document.xml").async("string");
  if (!xml.includes("WORDCOUNT_PLACEHOLDER")) throw new Error("placeholder not found");
  zip.file("word/document.xml", xml.replace("WORDCOUNT_PLACEHOLDER", total.toLocaleString("en-GB")));
  fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  const report = { counted_words: total, counted_by_section: bySection, excluded_words_by_category: excluded };
  fs.writeFileSync(path.join(ROOT, "build", "wordcount.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
});
