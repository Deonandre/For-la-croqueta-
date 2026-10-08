const fs = require('fs');
const d = require('docx');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, Footer, PageNumber, SectionType, convertInchesToTwip,
  Tab, TabStopType, LeaderType
} = d;

const FONT = "Times New Roman", SZ = 24, LINE = 480;
const pagesFile = 'toc_pages.json';
const pageMap = fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, 'utf8')) : null;

// inline **bold** and *italic*
function runs(text, opts = {}) {
  const out = [];
  for (const part of text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)) {
    if (!part) continue;
    let t = part, bold = !!opts.bold, ital = !!opts.italics;
    if (/^\*\*.+\*\*$/.test(part)) { t = part.slice(2, -2); bold = true; }
    else if (/^\*[^*].*\*$/.test(part)) { t = part.slice(1, -1); ital = true; }
    out.push(new TextRun({ text: t, bold, italics: ital, font: FONT, size: opts.size || SZ }));
  }
  return out;
}
const body = (text) => new Paragraph({
  children: runs(text), spacing: { line: LINE, after: 0 },
  alignment: AlignmentType.JUSTIFIED, indent: { firstLine: convertInchesToTwip(0.5) },
});
const centered = (text, opts = {}) => new Paragraph({
  children: runs(text, opts), alignment: AlignmentType.CENTER,
  spacing: { line: LINE, after: opts.after === undefined ? 240 : opts.after },
});
const blank = (n = 1) => Array.from({ length: n }, () =>
  new Paragraph({ children: [new TextRun({ text: "", font: FONT, size: SZ })], spacing: { line: LINE } }));

// ---- parse markdown into structure ----
const md = fs.readFileSync('EE_Revised.md', 'utf8');
const items = [];
for (const raw of md.split('\n')) {
  const line = raw.trim(); if (!line) continue;
  let m;
  if ((m = line.match(/^>\s+(.*)$/))) items.push({ k: 'q', t: m[1] });
  else if ((m = line.match(/^##\s+(.*)$/))) items.push({ k: 'h2', t: m[1] });
  else if ((m = line.match(/^#\s+(.*)$/))) items.push({ k: 'h1', t: m[1] });
  else items.push({ k: 'p', t: line });
}
// references appended as structured items
const refItems = [
  { k: 'h1', t: '7. References' },
  { k: 'h2', t: 'Primary Sources' },
  { k: 'r', t: "Bryant, K. (2015, November 29). Dear basketball. The Players\u2019 Tribune. https://www.theplayerstribune.com/articles/dear-basketball" },
  { k: 'r', t: "Bryant, K., & Bernstein, A. D. (2018). The mamba mentality: How I play. MCD/Farrar, Straus and Giroux." },
  { k: 'r', t: "Chopra, G. (Director). (2015). Kobe Bryant\u2019s muse [Film]. Showtime Networks." },
  { k: 'r', t: "Jimmy Kimmel Live! (2015, February 23). Season 13, Episode 28 [TV series episode]. ABC." },
  { k: 'r', t: "Klosterman, C. (2015, February 17). Kobe Bryant will always be an all-star of talking [Interview with K. Bryant]. GQ. [VERIFY exact headline, online date and print-issue date against GQ, and check each quotation against the original text.]" },
  { k: 'h2', t: 'Reported Accounts of Primary Events' },
  { k: 'r', t: "CNBC. (2018, September 14). Retired NBA star Kobe Bryant still wakes up at 4 a.m. every day to work out [Report of Bryant\u2019s remarks on The School of Greatness podcast]. https://www.cnbc.com/2018/09/14/kobe-bryant-still-wakes-up-at-4-am-every-day-to-work-out.html [VERIFY byline.]" },
  { k: 'r', t: "CNN. (2015, November 30). Kobe Bryant: NBA great to retire at end of season [Report of the 29 November 2015 press conference]. https://www.cnn.com/2015/11/30/sport/kobe-bryant-la-lakers-retirement/index.html [VERIFY byline.]" },
  { k: 'r', t: "Deadline. (2014, July). Kobe Bryant says Showtime\u2019s \u201CKobe Bryant\u2019s Muse\u201D came out of Nike campaign [Report of Showtime\u2019s Television Critics Association panel]. https://deadline.com/2014/07/tca-kobe-bryant-says-showtimes-kobe-bryants-muse-came-out-of-nike-campaign-mulling-806378/ [VERIFY byline and exact date.]" },
  { k: 'r', t: "Yahoo Finance. (2015, March). Kobe Bryant scrapped his original documentary and started from scratch [Report of Bryant\u2019s remarks on The Grantland Basketball Hour, February 2015]. https://finance.yahoo.com/news/kobe-bryant-scrapped-original-documentary-165426263.html [VERIFY byline and exact date. The underlying source is the broadcast itself, archived by The Ringer; cite that directly if you can access it.]" },
  { k: 'h2', t: 'Secondary Sources' },
  { k: 'r', t: "Barthes, R. (1972). Mythologies (A. Lavers, Trans.). Hill and Wang. (Original work published 1957)" },
  { k: 'r', t: "Chion, M. (1994). Audio-vision: Sound on screen (C. Gorbman, Ed. & Trans.). Columbia University Press." },
  { k: 'r', t: "Chopra, G. (2021). What Kobe Bryant taught me. Religion of Sports. https://religionofsports.substack.com/p/what-kobe-bryant-taught-me [VERIFY exact publication date.]" },
  { k: 'r', t: "Dyer, R. (1998). Stars (New ed., with a supplementary chapter by P. McDonald). British Film Institute. (Original work published 1979)" },
  { k: 'r', t: "Hall, S. (Ed.). (1997). Representation: Cultural representations and signifying practices. Sage." },
  { k: 'r', t: "Lowry, B. (2015, February 26). TV review: \u201CKobe Bryant\u2019s Muse.\u201D Variety. https://variety.com/2015/tv/reviews/tv-review-kobe-bryants-muse-1201432799/ [VERIFY exact publication date.]" },
  { k: 'r', t: "Nichols, B. (2001). Introduction to documentary. Indiana University Press." },
];
const all = [...items, ...refItems];
const headings = all.filter(i => i.k === 'h1' || i.k === 'h2');
fs.writeFileSync('toc_headings.json', JSON.stringify(headings.map(h => ({ level: h.k, text: h.t })), null, 1));

// ---- build body paragraphs ----
const content = [];
let firstH1AfterRefs = true;
for (const it of all) {
  if (it.k === 'h1') {
    content.push(new Paragraph({
      children: runs(it.t, { bold: true }), heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 200, line: LINE },
      ...(it.t.startsWith('7.') ? { pageBreakBefore: true } : {}),
    }));
  } else if (it.k === 'h2') {
    content.push(new Paragraph({
      children: runs(it.t, { bold: true }), heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 160, line: LINE },
    }));
  } else if (it.k === 'q') {
    content.push(new Paragraph({
      children: runs(it.t),
      spacing: { line: LINE, before: 120, after: 120 },
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: convertInchesToTwip(0.5) },
    }));
  } else if (it.k === 'r') {
    content.push(new Paragraph({
      children: runs(it.t), spacing: { line: LINE, after: 0 },
      indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
    }));
  } else content.push(body(it.t));
}

// ---- TOC entries (dot leaders, measured page numbers) ----
function tocLine(h, pageNo) {
  const indent = h.level === 'h2' ? convertInchesToTwip(0.3) : 0;
  const bold = h.level === 'h1';
  return new Paragraph({
    indent: { left: indent, right: 0 },
    spacing: { line: 276, after: 80 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360, leader: LeaderType.DOT }],
    children: [
      ...runs(h.text, { bold }),
      new TextRun({ children: [new Tab()], font: FONT, size: SZ, bold }),
      new TextRun({ text: pageNo === null ? "" : String(pageNo), font: FONT, size: SZ, bold }),
    ],
  });
}
const tocEntries = headings.map((h, i) =>
  tocLine({ level: h.k, text: h.t }, pageMap ? (pageMap[h.t] ?? '?') : null));

const tocPage = [
  new Paragraph({ children: runs("Table of Contents", { bold: true }), alignment: AlignmentType.CENTER, spacing: { after: 300, line: LINE } }),
  ...tocEntries,
  new Paragraph({ children: [new PageBreak()] }),
];

const WORDS = fs.existsSync('wordcount.txt') ? fs.readFileSync('wordcount.txt', 'utf8').trim() : '3,846';
const cover = [
  ...blank(3),
  centered("Extended Essay", { bold: true }), ...blank(1),
  centered("Subject: English A: Language and Literature"),
  centered("Category 3"), ...blank(2),
  centered("Title", { bold: true }),
  centered("Constructing the “Mamba Mentality”: Self-Definition and Documentary Mediation in Kobe Bryant’s Interviews and Kobe Bryant’s Muse"),
  ...blank(2),
  centered("Research Question", { bold: true }),
  centered("To what extent do selected interviews and Kobe Bryant’s Muse contribute to constructing the public image of the “Mamba Mentality”?"),
  ...blank(3),
  centered(`Word Count: ${WORDS} words`, { bold: true, after: 0 }),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FONT, size: SZ } },
      heading1: { run: { font: FONT, size: 28, bold: true, color: "000000" }, paragraph: { spacing: { before: 360, after: 200, line: LINE } } },
      heading2: { run: { font: FONT, size: SZ, bold: true, color: "000000" }, paragraph: { spacing: { before: 280, after: 160, line: LINE } } },
    },
  },
  sections: [{
    properties: {
      type: SectionType.CONTINUOUS,
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })],
      }),
    },
    children: [...cover, ...tocPage, ...content],
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync('EE_Revised.docx', b); console.log('WROTE EE_Revised.docx', b.length, 'bytes; TOC entries:', headings.length, '; pageMap:', pageMap ? 'measured' : 'PLACEHOLDER'); });
