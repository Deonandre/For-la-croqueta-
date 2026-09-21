const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType, PageBreak,
  VerticalAlign, convertInchesToTwip,
} = require('docx');

// ---------------------------------------------------------------------------
// Source text is read straight out of the original WHO .docx so that no wording
// is re-typed. Only whitespace/typographic normalisation is applied.
// ---------------------------------------------------------------------------
const src = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'who_runs.json'), 'utf8'));
const raw = i => {
  const p = src.find(p => p.i === i);
  if (!p) throw new Error('missing paragraph ' + i);
  return p.runs.map(r => r.t).join('');
};
// collapse tabs / NBSP / repeated spaces, trim
const clean = s => s.replace(/ /g, ' ').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
const P = i => clean(raw(i));
// join paragraphs that the original split mid-sentence to flow round a floating image
const joinP = (...ids) => ids.map(i => clean(raw(i))).join(' ').replace(/[ ]{2,}/g, ' ');

const FONT = 'Times New Roman';
const SZ = 24;        // 12 pt body
const SZ_SMALL = 22;  // 11 pt captions

const body = (text, opts = {}) => new Paragraph({
  alignment: opts.alignment || AlignmentType.JUSTIFIED,
  spacing: { line: 252, lineRule: 'auto', after: opts.after === undefined ? 120 : opts.after },
  indent: opts.indent,
  children: [new TextRun({ text, font: FONT, size: opts.size || SZ, bold: !!opts.bold, italics: !!opts.italics })],
});

const sectionHeading = text => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 180 },
  keepNext: true,
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: '000000' })],
});

const subHeading = text => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: { before: 200, after: 110 },
  keepNext: true,
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: FONT, size: SZ, bold: true, color: '000000' })],
});

const figureCaption = text => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 100 },
  keepNext: true,
  children: [new TextRun({ text, font: FONT, size: SZ_SMALL, bold: true })],
});

const IMG_W = Number(process.env.IMG_W || 540);     // px @96dpi  ≈ 5.62 in
const IMG_H = Math.round(IMG_W * 880 / 1240);       // keep the exact aspect ratio
const figure = file => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 160 },
  children: [new ImageRun({
    type: 'png',
    data: fs.readFileSync(path.join(__dirname, 'assets', file)),
    transformation: { width: IMG_W, height: IMG_H },
  })],
});

// ---------------------------------------------------------------------------
// Cover table
// ---------------------------------------------------------------------------
const COL_L = 3200, COL_R = 5826;   // sums to the 9026-twip text width
const NOT_GIVEN = '[Not stated in the original document — please complete]';

const cellBorders = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: '7F7F7F' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '7F7F7F' },
  left:   { style: BorderStyle.SINGLE, size: 4, color: '7F7F7F' },
  right:  { style: BorderStyle.SINGLE, size: 4, color: '7F7F7F' },
};

const infoRow = (label, value, missing = false) => new TableRow({
  children: [
    new TableCell({
      width: { size: COL_L, type: WidthType.DXA },
      borders: cellBorders,
      shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        spacing: { after: 0, line: 240, lineRule: 'auto' },
        children: [new TextRun({ text: label, font: FONT, size: SZ, bold: true })],
      })],
    }),
    new TableCell({
      width: { size: COL_R, type: WidthType.DXA },
      borders: cellBorders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        spacing: { after: 0, line: 240, lineRule: 'auto' },
        children: [new TextRun({ text: value, font: FONT, size: SZ, italics: missing })],
      })],
    }),
  ],
});

const infoTable = new Table({
  width: { size: COL_L + COL_R, type: WidthType.DXA },
  columnWidths: [COL_L, COL_R],
  rows: [
    infoRow('Title of the article', 'Tobacco use falls fastest in South-East Asia, yet 322 million people still at risk'),
    infoRow('Source of the article', 'World Health Organization (WHO)'),
    infoRow('Link to the article', NOT_GIVEN, true),
    infoRow('Date the article was published', '8 October 2025'),
    infoRow('Date the commentary was written', NOT_GIVEN, true),
    infoRow('Date the article was accessed', '26 January 2026'),
    infoRow('Section of the syllabus', 'Microeconomics'),
    infoRow('Key concept', NOT_GIVEN, true),
    infoRow('Word count (maximum 800)', '635'),
  ],
});

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------
const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 80 },
    children: [new TextRun({ text: 'Economics Internal Assessment — Commentary', font: FONT, size: 32, bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: 'Microeconomics', font: FONT, size: SZ, italics: true })],
  }),
  infoTable,
  new Paragraph({ children: [new PageBreak()] }),

  // ---------------- Article ----------------
  sectionHeading('Article'),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: 'Tobacco use falls fastest in South-East Asia, yet 322 million people still at risk', font: FONT, size: SZ, bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: 'World Health Organization (WHO), 8 October 2025', font: FONT, size: SZ, italics: true })],
  }),
  ...[4, 5, 6, 7, 8, 9, 10, 11].map(i => body(P(i))),
  new Paragraph({ children: [new PageBreak()] }),

  // ---------------- Commentary ----------------
  sectionHeading('Commentary'),

  subHeading('Introduction'),
  body(P(14)),
  body(P(15)),

  subHeading('Diagram Analysis'),
  body(P(23)),
  figureCaption('Figure 1: Negative externalities of consumption of tobacco'),
  figure('figure1.png'),
  body(P(24)),
  body(P(31)),
  body(joinP(39, 40, 41, 42, 43, 44, 45, 46, 47)),
  figureCaption('Figure 2: Indirect tax internalising the negative externality of tobacco consumption'),
  figure('figure2.png'),

  subHeading('Evaluation of the policy response'),
  body(P(50)),
  body(P(51)),

  subHeading('Conclusion'),
  body(P(52) + '.'),          // the original sentence ends without a full stop
  body(P(53)),

  // ---------------- Works cited ----------------
  sectionHeading('Works Cited'),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 252, lineRule: 'auto', after: 120 },
    indent: { left: 480, hanging: 480 },
    children: [
      new TextRun({ text: '“Tobacco use falls fastest in South-East Asia, yet 322 million people still at risk.” ', font: FONT, size: SZ }),
      new TextRun({ text: 'World Health Organization', font: FONT, size: SZ, italics: true }),
      new TextRun({ text: ', 8 October 2025. Accessed 26 January 2026. ', font: FONT, size: SZ }),
      new TextRun({ text: '[URL not stated in the original document — please insert]', font: FONT, size: SZ, italics: true }),
    ],
  }),
];

const doc = new Document({
  creator: 'Economics Internal Assessment',
  title: 'Economics Internal Assessment — Commentary (Microeconomics)',
  styles: {
    default: {
      document: { run: { font: FONT, size: SZ }, paragraph: { spacing: { line: 252, lineRule: 'auto' } } },
      heading1: { run: { font: FONT, size: 28, bold: true, color: '000000' } },
      heading2: { run: { font: FONT, size: SZ, bold: true, color: '000000' } },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },                       // A4, as in the original
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, '..', 'out', process.env.OUTNAME || 'Economics_IA_Commentary_WHO_Tobacco.docx');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log('wrote', out, buf.length, 'bytes');
});
