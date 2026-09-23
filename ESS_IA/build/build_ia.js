// Builds the ESS IA as a .docx.
//   NODE_PATH=<dir containing docx + jszip> node build/build_ia.js
// Inline markup: **bold**, *italic*, _{subscript}, ^{superscript}
// Every block is tagged as counted / not counted so the word count can be reported.
// Table of contents: a real Word TOC field whose cached entries carry the page numbers measured
// from the rendered PDF (build/toc_pages.json, written by build/paginate.py).
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, ShadingType, BorderStyle, LevelFormat,
  Header, Footer, PageNumber, PageBreak, TableLayoutType, VerticalAlign, LineRuleType,
  Bookmark, InternalHyperlink, Tab, TabStopType, LeaderType,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const readCsv = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").trim().split("\n").slice(1).map((l) => l.split(","));
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data/processed/results.json"), "utf8"));
const raw = readCsv("data/processed/cameroon_2001_2024_matched.csv");
const ranks = readCsv("data/processed/spearman_rank_table.csv");
const tocPagesFile = path.join(__dirname, "toc_pages.json");
const tocPages = fs.existsSync(tocPagesFile) ? JSON.parse(fs.readFileSync(tocPagesFile, "utf8")) : {};

const FONT = "Arial";
const TEXT_W = 9026; // A4 width minus 2 x 1440 margins (DXA)
const counted = [];
const excluded = {};
const children = [];
const tocEntries = [];
let section = "Cover";
const bySection = {};

// ------------------------------------------------------------------ inline markup
function runs(text, o = {}) {
  const out = [];
  let buf = "", bold = false, ital = false, i = 0;
  const mk = (t, extra = {}) => new TextRun({
    text: t.replace(/(^|[\s(=])-(\d)/g, "$1−$2"), font: FONT, // proper minus sign
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
      out.push(mk(text.slice(i + 2, j), text[i] === "_" ? { subScript: true } : { superScript: true }));
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
function heading(t, level) {
  const anchor = `_Toc_${String(tocEntries.length + 1).padStart(2, "0")}`;
  tocEntries.push({ anchor, level, text: t, plain: plain(t) });
  tally(t, false, "Headings");
  children.push(new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    children: [new Bookmark({ id: anchor, children: runs(t) })],
  }));
}
function H1(t) { section = t; heading(t, 1); }
function H2(t) { heading(t, 2); }
function P(t, opts = {}) {
  tally(t, opts.count !== false, opts.cat || "Other");
  children.push(new Paragraph({ children: runs(t, opts), alignment: opts.align, spacing: opts.spacing, keepNext: opts.keepNext }));
}
function Bullet(t, opts = {}) {
  tally(t, opts.count !== false, opts.cat || "Other");
  children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: runs(t) }));
}
function Num(t) {
  tally(t, true);
  children.push(new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs(t) }));
}
function Eq(t) {
  tally(t, false, "Equations and calculations");
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: runs(t) }));
}
function Work(t) {
  tally(t, false, "Equations and calculations");
  children.push(new Paragraph({ indent: { left: 720 }, spacing: { after: 40 }, children: runs(t) }));
}
const captionTexts = [];
function Caption(t, above = false) { // captions: counted (conservative)
  tally(t, true);
  captionTexts.push(plain(t));
  children.push(new Paragraph({ keepNext: above, spacing: { before: above ? 160 : 60, after: above ? 60 : 200 },
    children: runs(t, { size: 18, color: "333333" }) }));
}
function Figure(file, hIn, caption) {
  const img = fs.readFileSync(path.join(ROOT, "figures", file));
  const w = 600, h = Math.round(600 * hIn / 6.3);
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true,
    spacing: { before: 120, after: 0, line: 240, lineRule: LineRuleType.AUTO },
    children: [new ImageRun({ type: "png", data: img, transformation: { width: w, height: h },
      altText: { title: file, description: plain(caption), name: file } })] }));
  Caption(caption);
}
const border = { style: BorderStyle.SINGLE, size: 4, color: "A6A6A6" };
const borders = { top: border, bottom: border, left: border, right: border };
function Tbl(headers, rows, widths, o = {}) {
  const size = o.size || 18;
  const keep = rows.length <= 12; // keep short tables on one page
  const cell = (t, w, head, align, last) => {
    tally(t, !!o.count, o.cat || "Data tables");
    return new TableCell({
      width: { size: w, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
      shading: head ? { fill: "E8E7E3", type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 40, bottom: 40, left: 90, right: 90 },
      children: [new Paragraph({ alignment: align, keepNext: keep && !last,
        spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: runs(t, { size, bold: head }) })],
    });
  };
  const align = (j) => (o.alignRight && o.alignRight.includes(j) ? AlignmentType.RIGHT
    : o.center && o.center.includes(j) ? AlignmentType.CENTER : AlignmentType.LEFT);
  const trs = [new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((hd, j) => cell(hd, widths[j], true, align(j))) })];
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
const pfmt = (p) => (p < 0.001 ? p.toExponential(1).replace("e-", " × 10^{−").concat("}") : p.toFixed(3));

// ================================================================== COVER PAGE
const cover = (t, o = {}) => {
  tally(t, false, "Cover page");
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after || 200, before: o.before || 0 },
    children: runs(t, { size: o.size || 24, bold: o.bold }) }));
};
cover("ENVIRONMENTAL SYSTEMS AND SOCIETIES", { size: 36, bold: true, before: 2400 });
cover("INTERNAL ASSESSMENT", { size: 32, bold: true, after: 1000 });
cover("**Research Question:**", { after: 120 });
cover("*“To what extent is annual tree-cover loss associated with annual CO_{2} emissions in Cameroon from 2001 to 2024?”*", { size: 26, after: 1400 });
cover("**Candidate:** [MY NAME]");
cover("**Candidate Number:** [MY CANDIDATE NUMBER]");
cover("**School:** [MY SCHOOL]");
cover("**Examination Session:** [MY EXAMINATION SESSION]");
pageBreak();
const tocIndex = children.length; // table of contents is inserted here once all headings are known

// ================================================================== SECTIONS 1-9
require("./sections.js")({ H1, H2, P, Bullet, Num, Eq, Work, Caption, Figure, Tbl, AlignmentType,
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
  "Millennium Ecosystem Assessment (2005) *Ecosystems and human well-being: synthesis*. Washington, DC: Island Press.",
  "Our World in Data (2026) *CO₂ and greenhouse gas emissions dataset* [dataset, owid-co2-data.csv and codebook], compiled by Rosado, P., Ritchie, H., Roser, M., Mathieu, E. and Macdonald, B.; last updated 1 June 2026; CO₂ data from the Global Carbon Budget (2025). Available at: https://github.com/owid/co2-data (Accessed: 23 September 2026).",
  "Republic of Cameroon (2019) *Self-assessment of the REDD+ readiness phase by stakeholders report* [R-Package]. Forest Carbon Partnership Facility. Available at: https://www.forestcarbonpartnership.org/system/files/documents/Cameroon%20R-Package%20%20%20review_25-2-19.pdf",
  "Sims, M., Stanimirova, R., Raichuk, A., Neumann, M. et al. (2025) ‘Global drivers of forest loss at 1 km resolution’, *Environmental Research Letters*, 20(7), 074027. doi:10.1088/1748-9326/add606.",
  "United Nations (2015) *Transforming our world: the 2030 Agenda for Sustainable Development* (A/RES/70/1). New York: United Nations.",
  "World Bank (n.d.) *Carbon dioxide (CO₂) emissions (total) excluding LULUCF (Mt CO₂e)* [indicator EN.GHG.CO2.MT.CE.AR5]. World Development Indicators. Available at: https://data.worldbank.org/indicator/EN.GHG.CO2.MT.CE.AR5",
  "World Bank Group (2022) *Cameroon Country Climate and Development Report*. CCDR Series. Washington, DC: World Bank. Available at: https://documents1.worldbank.org/curated/en/099950111012212064/pdf/P1772970d596ef0c1099f50769d4371d04b.pdf",
];
refs.forEach((r) => {
  tally(r, false, "References");
  children.push(new Paragraph({ indent: { left: 567, hanging: 567 }, spacing: { after: 100 }, children: runs(r, { size: 20 }) }));
});

H1("Declaration of AI assistance");
const aiDecl = "[To be completed by the candidate according to the school’s academic integrity policy and IB guidance on AI tools: state which tool was used, for what purpose, the prompt(s) and the date.]";
tally(aiDecl, false, "Declaration of AI assistance");
children.push(new Paragraph({ children: runs(aiDecl, { size: 20, italics: true }) }));

// ================================================================== APPENDIX A
H1("Appendix A: Data provenance and independent checks");
const apx = (t) => { tally(t, false, "Appendix A"); children.push(new Paragraph({ children: runs(t, { size: 20 }) })); };
apx("All raw files are kept unmodified with SHA-256 checksums so the extraction can be repeated exactly.");
Tbl(["File", "Version / date", "Content used"], [
  ["CMR.xlsx (GFW)", "v20260427; downloaded 23 Sep 2026", "“Country tree cover loss” (threshold 30); “Country drivers”; “Country carbon data”"],
  ["CMR.xlsx, previous GFW release", "2001–2024 release; downloaded 23 Sep 2026", "Reliability check only (maximum difference 1 ha)"],
  ["owid-co2-data.csv and codebook (OWID)", "updated 1 June 2026; downloaded 23 Sep 2026", "co2, land_use_change_co2, oil_co2, gas_co2, cement_co2, flaring_co2, population"],
], [2600, 2800, 3626], { size: 17, cat: "Appendix A" });
const vtxt = fs.readFileSync(path.join(__dirname, "verification_output.txt"), "utf8");
const grab = (re) => { const m = vtxt.match(re); if (!m) throw new Error("verification value missing: " + re); return m[1]; };
Tbl(["Statistic", "Main calculation (Sections 6.2–6.4)", "Independent check"], [
  ["*r*_{s}, loss vs CO_{2}", `${data.spearman_loss_co2.rs.toFixed(3)} (hand formula and SciPy)`, `${Number(grab(/Pearson-on-ranks:\s*([\d.]+)/)).toFixed(3)} (Pearson correlation of ranks, pandas)`],
  ["Least-squares line", `a = ${f3(data.regression_co2_on_loss.intercept_Mt)}, R^{2} = ${data.regression_co2_on_loss.r2.toFixed(3)} (NumPy)`, `a = ${Number(grab(/OLS intercept ([\d.]+)/)).toFixed(3)}, R^{2} = ${Number(grab(/R2 ([\d.]+)/)).toFixed(3)} (statsmodels)`],
  ["*r*_{s}, first differences", data.spearman_first_differences.rs.toFixed(3), `${Number(grab(/First-difference Spearman \(pandas\): ([-\d.]+)/)).toFixed(3)} (pandas)`],
  ["p, 2015–2024", `${data.spearman_2015_2024.p_exact.toFixed(3)} (all 3,628,800 permutations)`, `${Number(grab(/Monte-Carlo p = ([\d.]+)/)).toFixed(3)} (20,000 random permutations)`],
  ["Critical *r*_{s}, n = 24", `${data.spearman_loss_co2["rs_crit_0.05"].toFixed(3)} (t-distribution)`, `${Number(grab(/normal approx: ([\d.]+)/)).toFixed(3)} (normal approximation, 1.96/√23)`],
], [2300, 3200, 3526], { size: 17, cat: "Appendix A" });

// ================================================================== WORD-COUNT STATEMENT
const total = counted.reduce((a, t) => a + words(t), 0);
// alternative count: without captions and without parenthetical author-date citations
const citeRe = /\((?:[^()]*?[A-Z][A-Za-z’'.& -]+(?:et al\.)?,? (?:\d{4}|n\.d\.)[^()]*?)\)/g;
const capSet = new Set(captionTexts);
const alt = counted.filter((t) => !capSet.has(t)).reduce((a, t) => a + words(t.replace(citeRe, "")), 0);
H1("Word-count statement");
const ex = (k) => (excluded[k] || 0).toLocaleString("en-GB");
const stmt = [
  `Approximate word count: **${total.toLocaleString("en-GB")} words**.`,
  `Counted: all prose in Sections 1–9, counted conservatively to include in-text citations, table and graph captions, and the text-based Tables 1, 2 and 7 (excluding captions and in-text citations, the count is ${alt.toLocaleString("en-GB")} words).`,
  `Excluded: cover page (${ex("Cover page")} words); table of contents; headings (${ex("Headings")}); data tables 3–6 and table notes (${ex("Data tables")}); equations and lines of calculation (${ex("Equations and calculations")}); text inside graphs; references (${ex("References")}); declaration of AI assistance (${ex("Declaration of AI assistance")}); Appendix A (${ex("Appendix A")}); this statement.`,
];
stmt.forEach((t) => { children.push(new Paragraph({ children: runs(t, { size: 20 }) })); });

// ================================================================== TABLE OF CONTENTS
const tocChildren = [new Paragraph({ spacing: { after: 240 }, children: runs("TABLE OF CONTENTS", { size: 28, bold: true }) })];
tocEntries.forEach((e, i) => {
  const page = tocPages[e.anchor] !== undefined ? String(tocPages[e.anchor]) : "0";
  const kids = [];
  if (i === 0) kids.push(new TextRun("§TOCBEGIN§"));
  kids.push(new InternalHyperlink({ anchor: e.anchor,
    children: [...runs(e.text, { bold: e.level === 1 }), new TextRun({ children: [new Tab(), page], font: FONT, bold: e.level === 1 ? true : undefined })] }));
  if (i === tocEntries.length - 1) kids.push(new TextRun("§TOCEND§"));
  tocChildren.push(new Paragraph({
    style: e.level === 1 ? "TOC1" : "TOC2",
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W, leader: LeaderType.DOT }],
    children: kids,
  }));
});
tocChildren.push(new Paragraph({ children: [new PageBreak()] }));
children.splice(tocIndex, 0, ...tocChildren);

// ------------------------------------------------------------------ document
const doc = new Document({
  creator: "ESS IA",
  title: "ESS Internal Assessment: tree-cover loss and CO2 emissions in Cameroon",
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { after: 140, line: 276, lineRule: LineRuleType.AUTO } } },
      heading1: { run: { font: FONT, size: 28, bold: true, color: "1F1F1F" },
        paragraph: { spacing: { before: 300, after: 140, line: 276, lineRule: LineRuleType.AUTO }, keepNext: true } },
      heading2: { run: { font: FONT, size: 23, bold: true, color: "333333" },
        paragraph: { spacing: { before: 200, after: 100, line: 276, lineRule: LineRuleType.AUTO }, keepNext: true } },
    },
    paragraphStyles: [
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", uiPriority: 39,
        run: { font: FONT, size: 22 }, paragraph: { spacing: { before: 120, after: 40 } } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", uiPriority: 39,
        run: { font: FONT, size: 21 }, paragraph: { indent: { left: 400 }, spacing: { before: 0, after: 30 } } },
    ],
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    { reference: "steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: {
      titlePage: true, // cover = page 1, number hidden; numbering continues from page 2
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        pageNumbers: { start: 1 } },
    },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: runs("ESS Internal Assessment – Tree-cover loss and CO_{2} emissions in Cameroon", { size: 16, color: "666666" }) })] }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: ["Page ", PageNumber.CURRENT], font: FONT, size: 18, color: "666666" })] })] }),
    },
    children,
  }],
});

const out = path.join(ROOT, "ESS_IA_Cameroon_TreeCoverLoss_CO2.docx");
Packer.toBuffer(doc).then(async (buf) => {
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(buf);
  let xml = await zip.file("word/document.xml").async("string");
  // wrap the pre-filled TOC entries in a genuine Word TOC field (updatable with F9 / "Update field")
  const begin = /<w:r>(?:(?!<\/w:r>).)*?§TOCBEGIN§<\/w:t><\/w:r>/s;
  const end = /<w:r>(?:(?!<\/w:r>).)*?§TOCEND§<\/w:t><\/w:r>/s;
  if (!begin.test(xml) || !end.test(xml)) throw new Error("TOC markers not found");
  xml = xml.replace(begin, '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>')
           .replace(end, '<w:r><w:fldChar w:fldCharType="end"/></w:r>');
  // docx-js gives every bookmark w:id="1"; renumber so each start/end pair has a unique id
  let nextId = 0;
  const open = [];
  xml = xml.replace(/<w:bookmark(Start|End) ([^>]*?)w:id="\d+"/g, (m, kind, pre) => {
    if (kind === "Start") { nextId += 1; open.push(nextId); return `<w:bookmarkStart ${pre}w:id="${nextId}"`; }
    return `<w:bookmarkEnd ${pre}w:id="${open.shift()}"`;
  });
  if (open.length) throw new Error("unbalanced bookmarks");
  zip.file("word/document.xml", xml);
  fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  fs.writeFileSync(path.join(__dirname, "toc_entries.json"),
    JSON.stringify(tocEntries.map(({ anchor, level, plain: p }) => ({ anchor, level, text: p })), null, 2));
  const report = { counted_words: total, count_without_captions_and_citations: alt,
    counted_by_section: bySection, excluded_words_by_category: excluded,
    toc_pages_used: Object.keys(tocPages).length > 0 };
  fs.writeFileSync(path.join(__dirname, "wordcount.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
});
