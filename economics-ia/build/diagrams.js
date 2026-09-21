const fs = require('fs');
const path = require('path');

// ---- Mapping from the ORIGINAL Word shape coordinate space (EMU, 2108447 x 1883397)
//      into the new, larger SVG canvas. Curves, intersections and proportions are
//      taken directly from the original document so the economics is unchanged.
const X = e => 140 + (e - 27000) * 0.00040357;
const Y = e => 71.8 + e * 0.00037;
const r = n => Math.round(n * 10) / 10;

const VW = 1240, VH = 880;
const AX_Y = 760;            // x-axis
const AX_X = 140;            // y-axis
const AX_RIGHT = 980;        // x-axis arrow tip
const AX_TOP = 55;           // y-axis arrow tip

const FS = 29;               // curve / axis label size
const FSQ = 27;              // quantity tick label size
const FONT = "Liberation Sans, Arial, Helvetica, sans-serif";

const defs = `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#000"/>
    </marker>
    <pattern id="dwl" width="14" height="14" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#000" stroke-width="2"/>
    </pattern>
    <pattern id="rev" width="16" height="16" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="16" stroke="#000" stroke-width="2"/>
    </pattern>
  </defs>`;

const axes = `
  <line x1="${AX_X}" y1="${AX_Y}" x2="${AX_X}" y2="${AX_TOP}" stroke="#000" stroke-width="3" marker-end="url(#arrow)"/>
  <line x1="${AX_X}" y1="${AX_Y}" x2="${AX_RIGHT}" y2="${AX_Y}" stroke="#000" stroke-width="3" marker-end="url(#arrow)"/>
  <text x="${AX_X}" y="38" font-family="${FONT}" font-size="${FS}" text-anchor="middle">Price</text>
  <text x="${AX_RIGHT + 14}" y="${AX_Y + 10}" font-family="${FONT}" font-size="${FS}">Quantity</text>`;

const L  = (x1,y1,x2,y2,w=3) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="#000" stroke-width="${w}"/>`;
const DL = (x1,y1,x2,y2) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="#000" stroke-width="2" stroke-dasharray="14 5 3 5"/>`;
const T  = (x,y,s,{anchor='start',size=FS,weight='normal'}={}) =>
  `<text x="${r(x)}" y="${r(y)}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${s}</text>`;

// The key sits in the empty band above every curve, identical in both figures.
function keyBlock(patternId, label) {
  return `
  ${T(300, 96, 'KEY', {weight:'bold'})}
  <rect x="376" y="60" width="90" height="46" fill="url(#${patternId})" stroke="#000" stroke-width="2.5"/>
  ${T(480, 96, label, {weight:'bold'})}`;
}

// =====================================================================
// FIGURE 1 — Negative externalities of consumption of tobacco
// =====================================================================
const f1 = (() => {
  const MPB = [X(363984), Y(128726), X(1935332), Y(1522521)];
  const MSB = [X(173115), Y(395057), X(1642369), Y(1704513)];
  const S   = [X(1890944), Y(332913), X(173115), Y(1636956)];
  const Qs = X(925617),  Ps = Y(1065688);
  const Qm = X(1192203), Pm = Y(863356);
  const MSBatQm = Y(1303308);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}">
  <rect width="${VW}" height="${VH}" fill="#ffffff"/>
  ${defs}
  ${axes}

  <!-- deadweight welfare loss triangle -->
  <polygon points="${r(Qs)},${r(Ps)} ${r(Qm)},${r(Pm)} ${r(Qm)},${r(MSBatQm)}" fill="url(#dwl)" stroke="#000" stroke-width="2"/>

  <!-- curves -->
  ${L(...S)}
  ${L(...MPB)}
  ${L(...MSB)}

  <!-- guide lines -->
  ${DL(AX_X, Pm, Qm, Pm)}
  ${DL(AX_X, Ps, Qs, Ps)}
  ${DL(Qm, Pm, Qm, AX_Y)}
  ${DL(Qs, Ps, Qs, AX_Y)}

  <!-- curve labels -->
  ${T(S[0] + 12, S[1] + 6, 'S = MPC = MSC')}
  ${T(MPB[2] + 12, MPB[3] + 8, 'MPB')}
  ${T(MSB[2] + 12, MSB[3] + 12, 'MSB')}

  <!-- axis value labels -->
  ${T(AX_X - 12, Pm + 9, 'Pm', {anchor:'end'})}
  ${T(AX_X - 12, Ps + 9, 'Ps', {anchor:'end'})}
  ${T(Qs, AX_Y + 38, 'Qs', {anchor:'middle', size:FSQ})}
  ${T(Qm, AX_Y + 38, 'Qm', {anchor:'middle', size:FSQ})}

  ${keyBlock('dwl', 'Deadweight welfare loss')}
</svg>`;
})();

// =====================================================================
// FIGURE 2 — Indirect tax internalising the negative externality
// =====================================================================
const f2 = (() => {
  const MPB = [X(355107), Y(128726), X(1926455), Y(1522521)];
  const MSB = [X(164237), Y(395056), X(1633491), Y(1704512)];
  const TAX = [X(1775380), Y(155359), X(173115), Y(1336089)];   // MPC + tax
  const S   = [X(1882066), Y(363984), X(164237), Y(1668027)];   // MPC = MSC
  const Qt = X(1015890), Pc = Y(714840);
  const Qm = X(1202194), Pm = Y(880092);
  const Pp = Y(1021517);
  const Qs = X(935568),  Ps = Y(1082470);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}">
  <rect width="${VW}" height="${VH}" fill="#ffffff"/>
  ${defs}
  ${axes}

  <!-- government tax revenue: (Pc - Pp) x Qt -->
  <rect x="${r(AX_X)}" y="${r(Pc)}" width="${r(Qt - AX_X)}" height="${r(Pp - Pc)}" fill="url(#rev)" stroke="#000" stroke-width="2"/>

  <!-- curves -->
  ${L(...TAX)}
  ${L(...S)}
  ${L(...MPB)}
  ${L(...MSB)}

  <!-- guide lines -->
  ${DL(AX_X, Pc, Qt, Pc)}
  ${DL(AX_X, Pm, Qm, Pm)}
  ${DL(AX_X, Pp, Qt, Pp)}
  ${DL(Qt, Pc, Qt, AX_Y)}
  ${DL(Qm, Pm, Qm, AX_Y)}
  ${DL(Qs, Ps, Qs, AX_Y)}

  <!-- curve labels -->
  ${T(TAX[0] + 12, TAX[1] + 2, 'MPC + tax')}
  ${T(S[0] + 12, S[1] + 8, 'S = MPC = MSC')}
  ${T(MPB[2] + 12, MPB[3] + 8, 'MPB')}
  ${T(MSB[2] + 12, MSB[3] + 12, 'MSB')}

  <!-- axis value labels -->
  ${T(AX_X - 12, Pc + 9, 'Pc', {anchor:'end'})}
  ${T(AX_X - 12, Pm + 9, 'Pm', {anchor:'end'})}
  ${T(AX_X - 12, Pp + 9, 'Pp', {anchor:'end'})}
  ${T(494, AX_Y + 38, 'Qs', {anchor:'middle', size:FSQ})}
  ${T(546, AX_Y + 38, 'Qt', {anchor:'middle', size:FSQ})}
  ${T(618, AX_Y + 38, 'Qm', {anchor:'middle', size:FSQ})}

  ${keyBlock('rev', 'Government revenue')}
</svg>`;
})();

const out = path.join(__dirname, 'assets');
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'figure1.svg'), f1);
fs.writeFileSync(path.join(out, 'figure2.svg'), f2);
console.log('wrote figure1.svg, figure2.svg');
