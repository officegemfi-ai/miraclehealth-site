// A compound's print: its fact sheet drawn as one mark, so two compounds can be told apart, and
// compared, at a glance. Nothing in it is decoration; every line is a line of the sheet.
//   - Round the outside, the body's 38 places, head to toe, clockwise from the top. A spoke runs
//     out to each place the sheet names, with a bead at its end for each thing it says happens
//     there, coloured by what it does: acts (white), raises (yellow), lowers (cyan), blocks
//     (violet), worth checking on a blood test (teal), a caution (coral, outermost).
//   - In the middle, the family's shape (peptide a circle, hormone a hexagon, medication a
//     capsule, supplement a leaf) and inside it the evidence, as rungs: one ring for animal and
//     lab studies, up to four for strong evidence, in the Evidence librarian's blue.
//   - Round the very edge, the Community Signal, in lime, once it's known (the page fills it in).
// The same function draws it in the library build and in the browser. Only numbers and our own
// markup go into it.

export const OPS = ['is', 'up', 'down', 'block', 'watch', 'warn'];
export const OP_COLOR = { is: '#EEECE6', up: '#F2C94C', down: '#55D3FF', block: '#B98CFF', watch: '#3FE0C5', warn: '#FF6B5B' };
export const OP_SAY = { is: 'acts', up: 'raises', down: 'lowers', block: 'blocks', watch: 'worth a blood test', warn: 'a caution' };
const GRADES = ['anecdotal', 'preclinical', 'limited', 'moderate', 'strong'];
const n2 = (x) => Number(x.toFixed(2));

function familyShape(family, r) {
  const f = String(family || '').toLowerCase();
  if (f.startsWith('hormone')) {
    const pts = [0, 1, 2, 3, 4, 5].map((k) => { const a = (Math.PI / 3) * k - Math.PI / 2; return `${n2(100 + r * Math.cos(a))},${n2(100 + r * Math.sin(a))}`; });
    return `<polygon points="${pts.join(' ')}"/>`;
  }
  if (f.startsWith('medication')) return `<rect x="${n2(100 - r * 0.78)}" y="${n2(100 - r)}" width="${n2(r * 1.56)}" height="${n2(r * 2)}" rx="${n2(r * 0.78)}"/>`;
  if (f.startsWith('supplement')) return `<path d="M100 ${n2(100 - r)}C${n2(100 + r * 1.05)} ${n2(100 - r * 0.45)} ${n2(100 + r * 0.6)} ${n2(100 + r * 0.8)} 100 ${n2(100 + r)}C${n2(100 - r * 0.6)} ${n2(100 + r * 0.8)} ${n2(100 - r * 1.05)} ${n2(100 - r * 0.45)} 100 ${n2(100 - r)}Z"/>`;
  return `<circle cx="100" cy="100" r="${n2(r)}"/>`;
}

// places: the body's places in order (body.json's places, by their "at"); lines: the sheet's
// lines in the body ({ at, op }); grade: its evidence grade; signal: 0 to 100, or null
export function printSvg({ id = '', name = '', family = '', grade = '', lines = [], places = [], signal = null }, { size = 120, cls = '', title = true, legend = false } = {}) {
  const slots = places.length || 38;
  const at = new Map(places.map((p, i) => [p, i]));
  const byPlace = new Map();
  for (const l of lines) {
    if (!at.has(l.at)) continue;
    if (!byPlace.has(l.at)) byPlace.set(l.at, []);
    byPlace.get(l.at).push(OPS.includes(l.op) ? l.op : 'is');
  }
  // spokes run from the core to the edge; the beads sit at the edge end, the caution outermost
  const RIN = 34, ROUT = 86, STEP = 8.6, MAXB = 6;
  const ticks = [];
  const spokes = [];
  for (let i = 0; i < slots; i++) {
    const a = (2 * Math.PI * i) / slots - Math.PI / 2;
    const c = Math.cos(a), s = Math.sin(a);
    ticks.push(`M${n2(100 + 92 * c)} ${n2(100 + 92 * s)}L${n2(100 + 95 * c)} ${n2(100 + 95 * s)}`);
    const ops = byPlace.get(places[i]);
    if (!ops) continue;
    const order = [...ops].sort((x, y) => OPS.indexOf(y) - OPS.indexOf(x)).slice(0, MAXB);
    spokes.push(`<path class="pr-spoke" d="M${n2(100 + RIN * c)} ${n2(100 + RIN * s)}L${n2(100 + ROUT * c)} ${n2(100 + ROUT * s)}"/>`);
    order.forEach((op, k) => {
      const r = ROUT - STEP * k;
      spokes.push(`<circle cx="${n2(100 + r * c)}" cy="${n2(100 + r * s)}" r="${op === 'warn' ? 3.7 : 3.1}" fill="${OP_COLOR[op]}"${op === 'warn' ? ' class="pr-warn"' : ''}/>`);
    });
  }
  const g = Math.max(0, GRADES.indexOf(grade));
  const rungs = [1, 2, 3, 4].map((k) => `<circle cx="100" cy="100" r="${4 + k * 4.2}" class="${k <= g ? 'pr-rung on' : 'pr-rung'}"/>`).join('');
  const sig = Number.isFinite(Number(signal)) && signal != null ? Math.max(0, Math.min(100, Number(signal))) : null;
  const C = 2 * Math.PI * 97;
  const label = `${name || id}: ${byPlace.size} of the body's ${slots} places, ${lines.length} lines; ${GRADES[g] === 'preclinical' ? 'animal and lab studies' : `${GRADES[g] || 'no'} evidence`}${sig != null ? `; Community Signal ${sig.toFixed(1)}` : ''}`;
  return `<svg class="print${sig != null ? ' has-sig' : ''}${cls ? ` ${cls}` : ''}" data-print="${id}" width="${size}" height="${size}" viewBox="0 0 200 200"${title ? ` role="img" aria-label="${label.replace(/[&<>"]/g, '')}"` : ' aria-hidden="true" focusable="false"'}>`
    + `<circle cx="100" cy="100" r="97" class="pr-track"/>`
    + `<circle cx="100" cy="100" r="97" class="pr-sig" stroke-dasharray="${sig != null ? `${n2((C * sig) / 100)} ${n2(C)}` : `0 ${n2(C)}`}" transform="rotate(-90 100 100)"/>`
    + `<path class="pr-ticks" d="${ticks.join('')}"/>`
    + `<circle cx="100" cy="100" r="${RIN}" class="pr-core"/>`
    + `<g class="pr-fam">${familyShape(family, 25)}</g>`
    + `<g class="pr-rungs">${rungs}</g>`
    + spokes.join('')
    + `</svg>`;
}

// The page fills in the Signal once it's loaded: the lime arc round the edge
export function setPrintSignal(svg, signal) {
  const arc = svg?.querySelector?.('.pr-sig');
  if (!arc || signal == null || !Number.isFinite(Number(signal))) return;
  const C = 2 * Math.PI * 97;
  const v = Math.max(0, Math.min(100, Number(signal)));
  arc.setAttribute('stroke-dasharray', `${n2((C * v) / 100)} ${n2(C)}`);
  svg.classList.add('has-sig');
}
