// The Library as one graph, for the front page's hero: laid out from the Library's own data each
// time scripts/build_library.mjs runs, so it changes when the Library does. Writes
//   library/data/graph.json  what lib/graph.js draws (and turns, traces, lights up)
//   img/library-graph.svg    the same graph standing still, shown until the script starts (and
//                            without scripts); drawn with lib/graph.js's own camera so they line up
// and, for the front page, its legend, the count of what its lines say, and the same graph as text
// for screen readers and search engines.
//
// The body is an axis through the middle: its places in the Library's head-to-toe order (body.json),
// top to bottom. The four families of compounds gather in clusters around it (higher in a cluster =
// acts higher in the body); each fact-sheet line is a small dot beside its compound with a thread
// to its place on the axis. The blood markers sit to one side in their lab panels, and Sig at the
// top of the axis. Laid out once by a force simulation from a fixed seed, with only arithmetic and
// square roots inside the loop, so the same Library always gives the same file.
import { camera, projectCloud, POSE, FAM } from '../lib/graph.js';

const FAMS = ['Peptides', 'Hormones', 'Medications', 'Supplements'];
const OPS = ['is', 'up', 'down', 'block', 'watch', 'warn'];
// Blood markers by lab panel, as a lab report groups them
const PANELS = [
  ['hormones', ['lh', 'fsh', 'prolactin', 'testosterone', 'estradiol', 'cortisol', 'igf1', 'thyroid', 'pth']],
  ['blood sugar', ['glucose', 'hba1c', 'insulin', 'ketones']],
  ['lipids', ['lipids', 'triglycerides']],
  ['liver', ['liver', 'alp', 'inr']],
  ['kidneys and salts', ['kidney', 'urineprotein', 'uricacid', 'sodium', 'potassium', 'magnesium', 'calcium', 'phosphate']],
  ['blood count', ['cbc', 'hematocrit', 'eosinophils', 'ferritin']],
  ['vitamins', ['b12', 'mma', 'homocysteine', 'vitd', 'copper']],
  ['prostate and fertility', ['psa', 'semen']],
];
// Short names for the markers on the graph, as a lab report prints them
const SHORT = { glucose: 'glucose', thyroid: 'TSH/T4', alp: 'ALP', pth: 'PTH', testosterone: 'testosterone', semen: 'semen', eosinophils: 'eosinophils', kidney: 'eGFR', lipids: 'lipids', liver: 'ALT/AST', uricacid: 'uric acid', cbc: 'CBC', b12: 'B12', mma: 'MMA', vitd: 'vitamin D', urineprotein: 'urine protein', insulin: 'insulin', inr: 'INR' };
// The four on the front page's "Jump to" chips go first on Sig's tour, then the Wolverine blend
const FIRST = ['semaglutide', 'bpc157', 'tirzepatide', 'tb500'];
const FIRST_BLEND = 'wolverine';
// The still picture's square, in the graph's own units around its centre (the front page's styles
// size it to match: 2 × POSTER_R × the graph's unit)
export const POSTER_R = 1.6;

const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => Number(n).toLocaleString('en-US');

export function buildGraph({ body, catalog }) {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  let seed = 20261109;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;

  const ids = Object.keys(body.compounds).filter((id) => byId.has(id))
    .sort((a, b) => FAMS.indexOf(byId.get(a).family) - FAMS.indexOf(byId.get(b).family) || a.localeCompare(b));
  const famOf = ids.map((id) => Math.max(0, FAMS.indexOf(byId.get(id).family)));
  const places = body.places.map((p) => p.at);
  const markers = Object.keys(body.markers);
  const P = Object.fromEntries(places.map((p, i) => [p, i]));
  const M = Object.fromEntries(markers.map((m, i) => [m, i]));

  // Lines, and which blood markers each names
  const lineC = [], lineP = [], lineOp = [], lineSrc = [], lm = [];
  const pm = new Map();
  ids.forEach((id, c) => {
    const e = body.compounds[id];
    for (const ln of e.lines) {
      if (!(ln.at in P)) throw new Error(`${id}: a line at "${ln.at}", which isn't a place on the body`);
      const l = lineC.length;
      lineC.push(c); lineP.push(P[ln.at]); lineOp.push(Math.max(0, OPS.indexOf(ln.op)));
      // how many of the sheet's sources the line cites: brighter threads cite more
      lineSrc.push(Math.min(4, (ln.src || []).length));
      for (const m of ln.markers || []) {
        if (!(m in M)) continue;
        const d = e.dirs?.[m];
        lm.push(l, M[m], d === 'up' ? 1 : d === 'down' ? -1 : 0);
        const key = `${P[ln.at]}|${M[m]}`;
        pm.set(key, (pm.get(key) || 0) + 1);
      }
    }
  });
  const nC = ids.length, nP = places.length, nM = markers.length, nL = lineC.length;
  const P0 = nC, M0 = nC + nP, L0 = M0 + nM, SIG = L0 + nL, N = SIG + 1;

  const panelOf = new Array(nM).fill(-1);
  PANELS.forEach(([, ms], k) => ms.forEach((m) => { if (m in M) panelOf[M[m]] = k; }));
  if (panelOf.some((k) => k < 0)) throw new Error('a blood marker in no lab panel (scripts/graph.mjs, PANELS): ' + markers.filter((_, i) => panelOf[i] < 0).join(', '));

  // Where things go. The body: a straight axis, head at the top. Sig: just above it
  const AX = 0.62;
  const target = new Float64Array(N * 3), pull = new Float64Array(N), weight = new Float64Array(N), fixed = new Uint8Array(N);
  const setTarget = (i, v, k, w) => { target[i * 3] = v[0]; target[i * 3 + 1] = v[1]; target[i * 3 + 2] = v[2]; pull[i] = k; weight[i] = w; };
  places.forEach((p, i) => { setTarget(P0 + i, [0, AX - (2 * AX * i) / (nP - 1), 0], 1, 1.6); fixed[P0 + i] = 1; });
  setTarget(SIG, [0, AX + 0.13, 0], 1, 2); fixed[SIG] = 1;
  // five groups on a ring around the axis, 72 degrees apart, at different heights: the families and
  // the blood markers (a small group per panel), each well clear of the axis
  const ring = (deg, y, r) => [Math.cos((deg * Math.PI) / 180) * r, y, Math.sin((deg * Math.PI) / 180) * r];
  const MC = ring(324, 0.02, 0.7);
  const fib = (k, n) => { const y = n === 1 ? 0 : 1 - (2 * (k + 0.5)) / n, r = Math.sqrt(1 - y * y), th = k * 2.399963; return [Math.cos(th) * r, y, Math.sin(th) * r]; };
  PANELS.forEach(([, ms], k) => {
    const pc = fib(k, PANELS.length).map((v, d) => MC[d] + v * 0.17);
    const list = ms.filter((m) => m in M);
    list.forEach((m, j) => { const v = fib(j, list.length); setTarget(M0 + M[m], pc.map((c, d) => c + v[d] * (0.026 + 0.006 * list.length)), 1, 1.2); fixed[M0 + M[m]] = 1; });
  });
  // the families around the axis; within each, higher = acts higher in the body
  const CENTRE = [ring(180, 0.1, 0.64), ring(252, 0.4, 0.62), ring(36, -0.34, 0.62), ring(108, -0.36, 0.62)];
  const axisY = (l) => target[(P0 + lineP[l]) * 3 + 1];
  const actH = ids.map((_, c) => { let s = 0, n = 0; for (let l = 0; l < nL; l++) if (lineC[l] === c) { s += axisY(l); n++; } return n ? s / n : 0; });
  const famMean = [0, 1, 2, 3].map((f) => { const hs = actH.filter((_, c) => famOf[c] === f); return hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 0; });
  for (let c = 0; c < nC; c++) { const f = famOf[c]; setTarget(c, [CENTRE[f][0], CENTRE[f][1] + (actH[c] - famMean[f]) * 0.45, CENTRE[f][2]], 0.08, 1); }
  for (let l = 0; l < nL; l++) setTarget(L0 + l, CENTRE[famOf[lineC[l]]], 0.045, 0.35);

  // Relatives: compounds in the same Library category, each joined to two others in it
  const cc = [];
  const byCat = new Map();
  ids.forEach((id, c) => { const k = byId.get(id).category || '?'; if (!byCat.has(k)) byCat.set(k, []); byCat.get(k).push(c); });
  for (const list of byCat.values()) {
    if (list.length < 2) continue;
    list.forEach((c, j) => { for (const step of [1, 2]) { const d = list[(j + step) % list.length]; if (d !== c && (step === 1 || list.length > 2)) cc.push(c, d); } });
  }
  const links = [];
  for (let l = 0; l < nL; l++) { links.push([lineC[l], L0 + l, 0.08, 0.25]); links.push([L0 + l, P0 + lineP[l], 0.3, 0.025]); }
  for (let k = 0; k < cc.length; k += 2) links.push([cc[k], cc[k + 1], 0.1, 0.05]);

  const pos = new Float64Array(N * 3), vel = new Float64Array(N * 3), Fo = new Float64Array(N * 3);
  for (let i = 0; i < N; i++) for (let d = 0; d < 3; d++) pos[i * 3 + d] = target[i * 3 + d] + (fixed[i] ? 0 : jit(0.18));
  for (let l = 0; l < nL; l++) { const a = lineC[l], b = P0 + lineP[l]; for (let d = 0; d < 3; d++) pos[(L0 + l) * 3 + d] = (pos[a * 3 + d] + pos[b * 3 + d]) / 2 + jit(0.06); }

  // Each point pushes away the others within reach; a grid of cells keeps that to the near ones
  const REP = 0.000022, ITER = 420, REACH = 0.6, R2 = REACH * REACH;
  const cell = new Int32Array(N), head = new Map(), next = new Int32Array(N);
  for (let it = 0; it < ITER; it++) {
    const cool = 1 - it / ITER;
    Fo.fill(0);
    head.clear();
    for (let i = 0; i < N; i++) {
      const k = (Math.floor(pos[i * 3] / REACH) + 64) * 16384 + (Math.floor(pos[i * 3 + 1] / REACH) + 64) * 128 + (Math.floor(pos[i * 3 + 2] / REACH) + 64);
      cell[i] = k; next[i] = head.has(k) ? head.get(k) : -1; head.set(k, i);
    }
    for (let i = 0; i < N; i++) {
      const xi = pos[i * 3], yi = pos[i * 3 + 1], zi = pos[i * 3 + 2], wi = weight[i], k0 = cell[i];
      for (let dx0 = -1; dx0 <= 1; dx0++) for (let dy0 = -1; dy0 <= 1; dy0++) for (let dz0 = -1; dz0 <= 1; dz0++) {
        let j = head.get(k0 + dx0 * 16384 + dy0 * 128 + dz0);
        for (; j !== undefined && j >= 0; j = next[j]) {
          if (j <= i) continue;
          const dx = xi - pos[j * 3], dy = yi - pos[j * 3 + 1], dz = zi - pos[j * 3 + 2];
          const d2 = dx * dx + dy * dy + dz * dz + 0.0009;
          if (d2 > R2) continue;
          const f = (REP * wi * weight[j]) / (d2 * Math.sqrt(d2));
          Fo[i * 3] += f * dx; Fo[i * 3 + 1] += f * dy; Fo[i * 3 + 2] += f * dz;
          Fo[j * 3] -= f * dx; Fo[j * 3 + 1] -= f * dy; Fo[j * 3 + 2] -= f * dz;
        }
      }
    }
    for (const [a, b, len, k] of links) {
      const dx = pos[b * 3] - pos[a * 3], dy = pos[b * 3 + 1] - pos[a * 3 + 1], dz = pos[b * 3 + 2] - pos[a * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const f = (k * (d - len)) / d;
      Fo[a * 3] += f * dx; Fo[a * 3 + 1] += f * dy; Fo[a * 3 + 2] += f * dz;
      Fo[b * 3] -= f * dx; Fo[b * 3 + 1] -= f * dy; Fo[b * 3 + 2] -= f * dz;
    }
    for (let i = 0; i < N; i++) for (let d = 0; d < 3; d++) Fo[i * 3 + d] += pull[i] * (target[i * 3 + d] - pos[i * 3 + d]);
    for (let i = 0; i < N; i++) {
      if (fixed[i]) continue;
      for (let d = 0; d < 3; d++) {
        const v = (vel[i * 3 + d] + Fo[i * 3 + d] / weight[i]) * 0.55;
        vel[i * 3 + d] = Math.max(-0.05, Math.min(0.05, v)) * (0.3 + 0.7 * cool);
        pos[i * 3 + d] += vel[i * 3 + d];
      }
    }
  }

  // Scale so nearly everything sits inside a radius of 1, a little wider than tall like a panel
  const rad = [];
  for (let i = 0; i < N; i++) rad.push(Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2));
  const r97 = [...rad].sort((a, b) => a - b)[Math.floor(N * 0.97)];
  const squash = [1, 0.86, 1];
  const nodes = [];
  for (let i = 0; i < N; i++) for (let d = 0; d < 3; d++) nodes.push(Math.round((pos[i * 3 + d] / r97) * squash[d] * 1000));

  // Labels: each family at the middle of its members; the markers too; the body's below its axis
  const mean = (members) => [0, 1, 2].map((d) => Math.round(members.reduce((s, i) => s + nodes[i * 3 + d], 0) / members.length));
  const fam = (f) => ids.map((_, c) => c).filter((c) => famOf[c] === f);
  const bottom = nodes[(P0 + nP - 1) * 3 + 1];
  const anchors = [
    [...mean(fam(0)), 'peptides', 0],
    [...mean(fam(1)), 'hormones', 1],
    [...mean(fam(2)), 'medications', 2],
    [...mean(fam(3)), 'supplements', 3],
    [0, bottom - 70, 0, 'the body, head to toe', 4],
    [...mean(markers.map((_, i) => M0 + i)), 'blood markers', 5],
  ];

  // Blends whose every part is drawn: Sig traces their parts together
  const C = new Map(ids.map((id, c) => [id, c]));
  const stacks = catalog.filter((b) => b.kind === 'blend' && (b.parts || []).length > 1 && b.parts.every((p) => C.has(p))).map((b) => ({
    id: b.id,
    name: b.name.replace(/\s*\(.*\)\s*$/, '').replace(/\s+blend$/i, ''),
    full: b.name,
    parts: b.parts.map((p) => C.get(p)),
    find: fold([b.name, ...(b.aliases || [])].join(' ')),
  }));

  // The order Sig traces in: the front page's four, the Wolverine blend, then the rest (with three
  // or more places) shuffled once, with the other blends among them
  const stopsOf = (c) => new Set(lineP.filter((_, l) => lineC[l] === c)).size;
  const first = FIRST.map((id) => C.get(id)).filter((c) => c != null);
  const rest = ids.map((_, c) => c).filter((c) => !first.includes(c) && stopsOf(c) >= 3);
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
  const blendTurns = stacks.map((_, k) => k);
  const w = blendTurns.findIndex((k) => stacks[k].id === FIRST_BLEND);
  const tour = [...first];
  if (w >= 0) tour.push(-(blendTurns.splice(w, 1)[0] + 1));
  rest.forEach((c, j) => { tour.push(c); if ((j + 1) % 6 === 0 && blendTurns.length) tour.push(-(blendTurns.shift() + 1)); });
  for (const k of blendTurns) tour.push(-(k + 1));

  const markerW = markers.map((m) => ids.filter((id) => body.compounds[id].dirs?.[m]).length);
  const ops = Object.fromEntries(OPS.map((o, i) => [o, lineOp.filter((x) => x === i).length]));
  const pmFlat = [...pm.keys()].flatMap((key) => key.split('|').map(Number));
  const linkCount = nL * 2 + pm.size + cc.length / 2;
  const names = { c: ids.map((id) => byId.get(id).name), p: places, m: markers.map((m) => SHORT[m] || body.markers[m].name) };
  const data = {
    v: 4,
    updated: body.updated,
    counts: { compounds: nC, places: nP, markers: nM, lines: nL, sig: 1, nodes: N, links: linkCount },
    famCounts: FAMS.map((_, f) => famOf.filter((x) => x === f).length),
    ops, nodes, famOf, lineC, lineP, lineOp, lineSrc, lm, pm: pmFlat, cc, markerW, anchors, names, ids,
    // what the search box matches, folded as the Library's search folds it (name, other names,
    // category and family)
    find: ids.map((id) => { const c = byId.get(id); return fold([c.name, ...(c.aliases || []), c.category, c.family].join(' ')); }),
    stacks, tour,
  };
  const json = JSON.stringify(data) + '\n';
  return {
    data, json,
    svg: posterSvg(data),
    legend: legendHtml(data, catalog),
    foot: footHtml(data),
    text: textHtml(data, catalog, panelOf),
  };
}

// ----- The still picture: the graph at lib/graph.js's starting pose, as an SVG -----
function posterSvg(g) {
  const nC = g.counts.compounds, nP = g.counts.places, nM = g.counts.markers, nL = g.counts.lines;
  const P0 = nC, M0 = nC + nP, L0 = M0 + nM, SIG = L0 + nL, N = SIG + 1, A0 = N, NA = N + g.anchors.length;
  const base = new Float64Array(NA * 3);
  for (let i = 0; i < N * 3; i++) base[i] = g.nodes[i] / 1000;
  g.anchors.forEach((a, k) => { for (let d = 0; d < 3; d++) base[(A0 + k) * 3 + d] = a[d] / 1000; });
  const o = { x: new Float64Array(NA), y: new Float64Array(NA), z: new Float64Array(NA), s: new Float64Array(NA) };
  projectCloud(base, NA, POSE.t, camera(POSE.t, POSE.yaw0), 1, (i) => i < nC || (i >= L0 && i < SIG), (i) => (i >= P0 && i < M0) || i === SIG, o);
  // one pixel of lib/graph.js's drawing, in the graph's units, at its usual size (330 px to a unit)
  const PX = 1 / 330;
  const n = (v) => { const s = String(Math.round(v * 1000) / 1000); return s.replace(/^(-?)0\./, '$1.'); };
  const xy = (i) => `${n(o.x[i])} ${n(o.y[i])}`;
  const near = (i) => Math.max(0.28, Math.min(1, 0.66 - o.z[i] * 0.42));
  const col = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const BODY = [230, 237, 247], AMBER = [245, 181, 68], LIME = [216, 255, 61], WHITE = [240, 248, 255];
  const GROUP = [...FAM, BODY, AMBER];
  const glow = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${col(c)}"/><stop offset=".16" stop-color="${col(c)}" stop-opacity=".6"/><stop offset=".42" stop-color="${col(c)}" stop-opacity=".13"/><stop offset="1" stop-color="${col(c)}" stop-opacity="0"/></radialGradient>`;
  const haze = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${col(c)}" stop-opacity=".5"/><stop offset=".5" stop-color="${col(c)}" stop-opacity=".16"/><stop offset="1" stop-color="${col(c)}" stop-opacity="0"/></radialGradient>`;
  const defs = [...FAM.map((c, f) => glow('g' + f, c)), glow('gb', BODY), glow('ga', AMBER), glow('gl', LIME), glow('gw', WHITE), ...GROUP.map((c, k) => haze('h' + k, c))].join('');
  const out = [];
  const thin = (d, c, a, w) => { if (d) out.push(`<path d="${d}" stroke="${col(c)}" stroke-opacity="${n(a)}" stroke-width="${w}" vector-effect="non-scaling-stroke"/>`); };
  // the haze behind each group
  g.anchors.forEach((an, k) => { if (an[4] !== 4) out.push(`<circle cx="${n(o.x[A0 + k])}" cy="${n(o.y[A0 + k])}" r="${n(0.34 * o.s[A0 + k])}" fill="url(#h${an[4]})" opacity="${n(0.16 * near(A0 + k))}"/>`); });
  // threads, front and back, plain and (citing two or more sources) bright
  for (let f = 0; f < 4; f++) {
    for (const front of [true, false]) {
      let segs = '';
      const th = ['', ''];
      for (let l = 0; l < nL; l++) {
        const c = g.lineC[l], L = L0 + l, p = P0 + g.lineP[l];
        if (g.famOf[c] !== f || (o.z[L] < 0) !== front) continue;
        segs += `M${xy(c)}L${xy(L)}`;
        th[g.lineSrc[l] >= 2 ? 1 : 0] += `M${xy(L)}Q${n(o.x[L] + (o.x[p] - o.x[L]) * 0.7)} ${n(o.y[L] + (o.y[p] - o.y[L]) * 0.2)} ${xy(p)}`;
      }
      thin(segs, FAM[f], front ? 0.16 : 0.08, 0.6);
      thin(th[0], FAM[f], front ? 0.07 : 0.033, 0.6);
      thin(th[1], FAM[f], (front ? 0.07 : 0.033) * 2.3, 0.95);
    }
    let rel = '';
    for (let k = 0; k < g.cc.length; k += 2) if (g.famOf[g.cc[k]] === f) rel += `M${xy(g.cc[k])}L${xy(g.cc[k + 1])}`;
    thin(rel, FAM[f], 0.2, 0.6);
  }
  let pmd = '';
  for (let k = 0; k < g.pm.length; k += 2) pmd += `M${xy(P0 + g.pm[k])}L${xy(M0 + g.pm[k + 1])}`;
  thin(pmd, AMBER, 0.16, 0.8);
  let axis = `M${xy(P0)}`;
  for (let p = 1; p < nP; p++) axis += `L${xy(P0 + p)}`;
  thin(axis, BODY, 0.05, 4);
  thin(axis, BODY, 0.32, 1.1);
  thin(`M${xy(SIG)}L${xy(P0)}`, LIME, 0.45, 1);
  // the lines' dots, nearer ones brighter
  for (let f = 0; f < 4; f++) for (const front of [true, false]) {
    let d = '';
    for (let l = 0; l < nL; l++) if (g.famOf[g.lineC[l]] === f && (o.z[L0 + l] < 0) === front) d += `M${xy(L0 + l)}h0`;
    if (d) out.push(`<path d="${d}" stroke="${col(FAM[f])}" stroke-opacity="${front ? '.55' : '.24'}" stroke-width="${n(2.1 * PX * (front ? 1.1 : 1.15))}" stroke-linecap="round"/>`);
  }
  const wP = new Array(nP).fill(0), wC = new Array(nC).fill(0);
  for (let l = 0; l < nL; l++) { wP[g.lineP[l]]++; wC[g.lineC[l]]++; }
  const node = (i, r, grad, a, core) => {
    out.push(`<circle cx="${n(o.x[i])}" cy="${n(o.y[i])}" r="${n(r * 3)}" fill="url(#${grad})" opacity="${n(a)}"/>`);
    out.push(`<circle cx="${n(o.x[i])}" cy="${n(o.y[i])}" r="${n(r * core)}" fill="url(#gw)" opacity="${n(Math.min(1, a * 1.1))}"/>`);
  };
  for (let p = 0; p < nP; p++) node(P0 + p, (1.8 + Math.sqrt(wP[p]) * 0.36) * o.s[P0 + p] * PX, 'gb', 0.6 * near(P0 + p), 0.6);
  for (let m = 0; m < nM; m++) node(M0 + m, (2 + Math.sqrt(g.markerW[m]) * 0.45) * o.s[M0 + m] * PX, 'ga', 0.8 * near(M0 + m), 0.55);
  for (let c = 0; c < nC; c++) node(c, (2 + wC[c] * 0.2) * o.s[c] * PX, 'g' + g.famOf[c], 0.85 * near(c), 0.55);
  const hr = 6 * o.s[SIG] * PX;
  out.push(`<circle cx="${n(o.x[SIG])}" cy="${n(o.y[SIG])}" r="${n(hr * 4)}" fill="url(#gl)" opacity=".9"/>`);
  out.push(`<circle cx="${n(o.x[SIG])}" cy="${n(o.y[SIG])}" r="${n(hr * 1.5)}" fill="none" stroke="${col(LIME)}" stroke-opacity=".95" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`);
  out.push(`<circle cx="${n(o.x[SIG])}" cy="${n(o.y[SIG])}" r="${n(hr * 0.7)}" fill="${col(LIME)}"/>`);
  const R = POSTER_R;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-R} ${-R} ${2 * R} ${2 * R}" width="1600" height="1600">`
    + `<style>.l{isolation:isolate}.l>*{mix-blend-mode:plus-lighter}path{fill:none}</style><defs>${defs}</defs><g class="l">${out.join('')}</g></svg>\n`;
}

// ----- What goes on the front page around the graph -----
const FAMILY = ['peptides', 'hormones', 'medications', 'supplements'];
const KEYS = ['pep', 'hor', 'med', 'sup'];
function legendHtml(g, catalog) {
  const row = (key, label, count) => `<li><i class="k-${key}"></i>${label}${count != null ? `<b>${fmt(count)}</b>` : ''}</li>`;
  // two columns: peptides, medications / supplements, hormones (as the cloud has them, round the axis)
  const fams = [0, 2, 3, 1].map((f) => row(KEYS[f], FAMILY[f], g.famCounts[f])).join('');
  return `<p class="nk-cap">${fmt(g.counts.compounds)} of the ${fmt(catalog.length)} have full fact sheets</p>`
    + `<ul class="nk-fams">${fams}</ul>`
    + `<ul>${row('body', 'body places, head to toe', g.counts.places)}${row('mark', `blood markers, ${PANELS.length} panels`, g.counts.markers)}`
    + `${row('sig', 'Sig, tracing one sheet')}${row('thread', 'bright threads: 2+ sources')}${row('signal', 'Community Signal, 0–100')}</ul>`;
}
const SAYS = [['up', '▲', 'raise'], ['down', '▼', 'lower'], ['block', '┤', 'block'], ['is', '▶', 'act'], ['watch', '◆', 'to check'], ['warn', '!', 'caution']];
function footHtml(g) {
  return `<span>What the ${fmt(g.counts.lines)} lines say:</span>`
    + SAYS.map(([k, mark, label]) => `<span><i>${mark}</i> <b>${fmt(g.ops[k])}</b> ${label}</span>`).join('')
    + (g.updated ? `<span class="nf-date">Library data, ${new Date(g.updated + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>` : '');
}
// The graph as text: what it shows, the places the sheets name most, the blends drawn in full
function textHtml(g, catalog, panelOf) {
  const nL = g.counts.lines;
  const wP = new Array(g.counts.places).fill(0), cP = g.names.p.map(() => new Set());
  for (let l = 0; l < nL; l++) { wP[g.lineP[l]]++; cP[g.lineP[l]].add(g.lineC[l]); }
  const top = g.names.p.map((p, i) => [p, wP[i], cP[i].size]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
  const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  const fams = list(g.famCounts.map((n, f) => `${n} ${FAMILY[f]}`));
  const o = (k) => fmt(g.ops[k]);
  const says = `${o('is')} say how a compound acts, ${o('up')} what it may raise, ${o('down')} what it may lower, ${o('block')} what it may block, ${o('watch')} what to check, and ${o('warn')} are cautions`;
  const panels = new Set(panelOf).size;
  return `<p>The Library as one graph, drawn from every fact sheet. ${fmt(g.counts.compounds)} of the ${fmt(catalog.length)} compounds have full fact sheets: ${fams}. `
    + `Their ${fmt(nL)} lines join each compound to the places in the body its sheet names (${g.counts.places} of them, head to toe) and to the ${g.counts.markers} blood markers, in ${panels} lab panels, that it may move. `
    + `Of the lines, ${says}.</p>`
    + `<p>The places named most: ${list(top.map(([p, n2, c]) => `${p} (${n2} lines from ${c} compounds)`))}.</p>`
    + `<p>Blends traced part by part: ${g.stacks.map((s) => `${esc(s.name)}, ${list(s.parts.map((c) => esc(g.names.c[c])))}`).join('; ')}.</p>`;
}
