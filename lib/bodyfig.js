// Where it acts: a compound's lines in the body, drawn on a figure. Each place its fact sheet
// names is a dot on the body, joined by a line to its name and the marks of what happens there
// (the same marks as the sheet's "In the body": ▶ acts, ▲ raises, ▼ lowers, × blocks, ◊ worth
// checking, ! caution); places that are the whole body (the blood, blood sugar, the immune system,
// the mitochondria, the whole body) are listed under it instead. Every name is a link to that part
// of the sheet, and its tooltip says the lines. Nothing is drawn that the sheet doesn't say.
// The build draws it into the static page; only our own markup and escaped text go into it.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n1 = (x) => Math.round(x * 10) / 10;
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);

export const MARK = { is: '▶', up: '▲', down: '▼', block: '×', watch: '◊', warn: '!' };
export const MARK_SAY = { is: 'acts', up: 'raises', down: 'lowers', block: 'blocks', watch: 'worth checking', warn: 'caution' };
const ORDER = ['is', 'up', 'down', 'block', 'watch', 'warn'];

// The figure, front on, in a 200 x 420 box: the head, then one outline for the rest (its right
// half mirrored)
const HALF = [
  [111, 58], ['C', 111, 64, 111, 70, 112, 73], ['C', 119, 79, 139, 78, 149, 86], ['C', 159, 93, 162, 104, 162, 117],
  ['C', 163, 140, 166, 164, 167, 182], ['C', 169, 203, 173, 224, 175, 241], ['C', 177, 252, 177, 263, 171, 267],
  ['C', 165, 270, 162, 262, 162, 252], ['C', 160, 236, 155, 213, 153, 196], ['C', 151, 175, 150, 150, 147, 128],
  ['C', 144, 120, 141, 115, 139, 113], ['C', 140, 140, 137, 165, 134, 188], ['C', 132, 205, 140, 222, 141, 241],
  ['C', 142, 281, 137, 311, 134, 331], ['C', 132, 353, 131, 380, 129, 395], ['C', 131, 404, 136, 410, 129, 413],
  ['L', 107, 413], ['C', 104, 408, 106, 400, 107, 394], ['C', 108, 360, 109, 321, 110, 300], ['C', 110, 275, 106, 255, 100, 249],
];
function outline() {
  // the right half as written, then the left half mirrored and reversed, back up to the neck
  const pts = [];
  let cur = HALF[0];
  const segs = [];
  for (const s of HALF.slice(1)) {
    if (s[0] === 'C') { segs.push({ c1: [s[1], s[2]], c2: [s[3], s[4]], to: [s[5], s[6]], from: cur }); cur = [s[5], s[6]]; }
    else { segs.push({ line: true, to: [s[1], s[2]], from: cur }); cur = [s[1], s[2]]; }
  }
  const m = ([x, y]) => [200 - x, y];
  let d = `M${HALF[0][0]} ${HALF[0][1]}`;
  for (const s of segs) d += s.line ? `L${s.to[0]} ${s.to[1]}` : `C${s.c1[0]} ${s.c1[1]} ${s.c2[0]} ${s.c2[1]} ${s.to[0]} ${s.to[1]}`;
  for (const s of [...segs].reverse()) {
    const [fx, fy] = m(s.from);
    d += s.line ? `L${fx} ${fy}` : `C${m(s.c2).join(' ')} ${m(s.c1).join(' ')} ${fx} ${fy}`;
  }
  pts.length = 0;
  return `${d}Z`;
}
export const FIGURE = outline();

// Where each place sits on the figure (the figure's left is on the viewer's right)
export const AT = {
  hair: [100, 11], brain: [100, 24], hypothalamus: [104, 33], pituitary: [100, 40], eyes: [91, 34], ears: [80, 37], nose: [100, 47],
  thyroid: [100, 69], breast: [84, 108], heart: [108, 111], lungs: [88, 120],
  stomach: [113, 146], liver: [85, 146], gallbladder: [89, 160], pancreas: [102, 162], adrenals: [121, 157], kidneys: [122, 172],
  gut: [100, 192], fat: [131, 200], 'urinary · genital': [100, 229], uterus: [100, 216], ovaries: [114, 218], prostate: [100, 239], testes: [100, 250],
  nerves: [40, 150], muscle: [158, 142], 'blood vessels': [39, 196], veins: [163, 214], skin: [44, 228],
  bone: [84, 286], 'joints · fluid': [117, 326], tendons: [86, 373], feet: [118, 404],
};
// Places that are the whole body: listed under the figure
export const WIDE = ['whole body', 'blood', 'blood sugar', 'immune system', 'mitochondria'];
// a place's tooltip: its name, then what the sheet says happens there
export const tipOf = (p) => `${cap(p.at)}: ${p.says.join('; ')}`;
export const ORDER_OPS = ORDER;

/**
 * @param {object} c       { id, name, lines: [{ at, op, say }], route }
 * @param {object} [o]
 * @param {boolean} [o.labels] names beside the figure (true) or the dots alone (a small one)
 * @param {string} [o.href] where a name links to (the sheet's "In the body")
 * @returns {{ svg: string, wide: Array<{at, ops, says}>, places: number, lines: number }}
 */
export function bodyFigure({ name = '', lines = [], route = '' }, { labels = true, href = '#body', width = 480, scale = .9 } = {}) {
  const byAt = new Map();
  for (const l of Array.isArray(lines) ? lines : []) {
    if (!l || typeof l.at !== 'string') continue;
    if (!byAt.has(l.at)) byAt.set(l.at, { at: l.at, ops: new Set(), says: [] });
    const p = byAt.get(l.at);
    const op = ORDER.includes(l.op) ? l.op : 'is';
    p.ops.add(op);
    p.says.push(`${MARK_SAY[op]}: ${l.say || ''}`.trim());
  }
  const all = [...byAt.values()].map((p) => ({ ...p, ops: ORDER.filter((o) => p.ops.has(o)) }));
  const onFig = all.filter((p) => AT[p.at]);
  const wide = all.filter((p) => !AT[p.at]);
  const H = labels ? Math.round(420 * scale + 16) : Math.round(420 * scale + 8);
  const W = labels ? width : Math.round(200 * scale + 16);
  const fx = (W - 200 * scale) / 2, fy = 8;
  const X = (x) => n1(fx + x * scale), Y = (y) => n1(fy + y * scale);
  // the names in two columns, in the order of the body, pushed apart so they never touch
  const GAP = 22, TOP = 10, BOT = H - 6;
  const sides = { L: [], R: [] };
  const mid = onFig.filter((p) => AT[p.at][0] === 100);
  for (const p of onFig) if (AT[p.at][0] !== 100) sides[AT[p.at][0] < 100 ? 'L' : 'R'].push(p);
  for (const p of mid.sort((a, b) => AT[a.at][1] - AT[b.at][1])) (sides.L.length <= sides.R.length ? sides.L : sides.R).push(p);
  const place = (list) => {
    const s = list.sort((a, b) => AT[a.at][1] - AT[b.at][1]).map((p) => ({ p, y: Y(AT[p.at][1]) }));
    for (let i = 0; i < s.length; i++) s[i].y = Math.max(s[i].y, i ? s[i - 1].y + GAP : TOP);
    for (let i = s.length - 1; i >= 0; i--) s[i].y = Math.min(s[i].y, i < s.length - 1 ? s[i + 1].y - GAP : BOT);
    return s;
  };
  const tip = tipOf;
  const marks = (p) => p.ops.map((o) => `<tspan class="bf-m${o === 'warn' ? ' warn' : o === 'watch' ? ' watch' : ''}">${MARK[o]}</tspan>`).join(' ');
  const dot = (p) => { const w = p.ops.includes('warn') ? ' warn' : ''; const cx = X(AT[p.at][0]), cy = Y(AT[p.at][1]); return `<circle class="bf-halo${w}" cx="${cx}" cy="${cy}" r="${labels ? 10 : 7}"/><circle class="bf-dot${w}" cx="${cx}" cy="${cy}" r="${labels ? 4.2 : 3.6}"/>`; };
  let marksDrawn = '';
  if (labels) {
    const colL = fx - 14, colR = fx + 200 * scale + 14;
    for (const [side, list] of Object.entries(sides)) {
      for (const { p, y } of place(list)) {
        const [ax, ay] = AT[p.at];
        const tx = side === 'L' ? colL : colR;
        const lx = side === 'L' ? colL + 6 : colR - 6;
        marksDrawn += `<a class="bf-pl" href="${esc(href)}" aria-label="${esc(tip(p))}"><title>${esc(tip(p))}</title>`
          + `<path class="bf-ln" d="M${X(ax)} ${Y(ay)}L${n1(lx)} ${n1(y)}"/>${dot(p)}`
          + `<text x="${n1(tx)}" y="${n1(y + 4.5)}" text-anchor="${side === 'L' ? 'end' : 'start'}">${side === 'L' ? `${marks(p)} <tspan class="bf-nm">${esc(cap(p.at))}</tspan>` : `<tspan class="bf-nm">${esc(cap(p.at))}</tspan> ${marks(p)}`}</text></a>`;
      }
    }
  } else {
    marksDrawn = onFig.map(dot).join('');
  }
  const head = `<ellipse class="bf-body" cx="${X(100)}" cy="${Y(36)}" rx="${n1(20 * scale)}" ry="${n1(25 * scale)}"/>`;
  const body = `<path class="bf-body" d="${FIGURE}" transform="translate(${n1(fx)} ${fy}) scale(${scale})"/>`;
  const label = `Where ${name} acts: ${all.length ? `${all.length} place${all.length === 1 ? '' : 's'} in the body` : 'nothing drawn yet'}`;
  const svg = `<svg class="bf${labels ? '' : ' bf-mini'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${labels ? `aria-label="${esc(label)}" role="group"` : `role="img" aria-label="${esc(label)}"`}>${head}${body}${marksDrawn}</svg>`;
  return { svg, wide, places: all.length, lines: (lines || []).length, route };
}
