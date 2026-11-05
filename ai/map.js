// The interaction map on Ask Sig (miraclehealth.us/ai): how the compounds in a stack interact,
// as Sig's Synergy auditor found when it checked them together (the Library's fact sheets and
// established pharmacology, read with the medicines and conditions the member mentions; the
// Safety agent clears every note before it's shown).
//
// You sit in the centre, your compounds on a ring around you. Each pair is a line in the colour
// of what the auditor found: avoid, caution or good to know. Dashed where it found nothing (no
// known clash: an absence of data, not a green light); dotted where nothing has checked the pair
// yet. A finding about one compound and your own medicines or conditions runs to you, in the
// centre. Around it all, the whole Library: every compound, grouped by what it's taken for, the
// brighter the stronger its evidence; on wide screens, tap one to add it.
//
// Nothing here decides anything or gives doses: the auditor's notes are placed as text (never
// markup), and the member's own clinician has the final say. The page (ai/ai.js) feeds the map
// what the chat found; the map hands back the compounds someone wants checked, as a question
// for Sig. window.MHMap is the whole interface.

const NS = 'http://www.w3.org/2000/svg';
const MAX = 6;                              // as many as Sig lays out in one stack
const KEY = 'mh-ai-map-v1';                 // the visitor's own picks, in this tab only
const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// What each compound is taken for: the Library's categories, in an order that runs round the
// body (metabolism and gut, heart and energy, muscle and hormones, skin and healing, then the
// mind)
const CATS = ['Metabolic & weight', 'Gut & digestion', 'Liver & detox', 'Heart & circulation', 'Energy & mitochondria',
  'Muscle & performance', 'Growth-hormone axis', 'Hormone balance', 'Sexual health', 'Skin & hair', 'Healing & recovery',
  'Joints & bones', 'Immune & inflammation', 'Longevity', 'Vitamins & minerals', 'Sleep', 'Mood & stress', 'Cognition & focus'];
const FAM = { Peptides: ['pep', 'Peptide'], Hormones: ['hor', 'Hormone'], Supplements: ['sup', 'Supplement'], Medications: ['med', 'Medication'], Blends: ['bln', 'Blend'] };
const FAM_ORDER = { Peptides: 0, Hormones: 1, Medications: 2, Supplements: 3, Blends: 4 };
const GRADE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence', preclinical: 'Animal and lab studies', anecdotal: 'Anecdotal' };
const GRADE_N = { strong: 4, moderate: 3, limited: 2, preclinical: 1, anecdotal: 0 };
const LEVEL = { avoid: 'Avoid together', caution: 'Caution', info: 'Good to know' };
const LEVEL_ONE = { avoid: 'Avoid', caution: 'Caution', info: 'Good to know' };
const KIND = { overlap: 'Same pathway', additive: 'Effects add up', interaction: 'Interaction', member: 'With your medicines or conditions' };
const RANK = { avoid: 3, caution: 2, info: 1 };
// Pairs to try on an empty map, chosen to show what a check finds rather than to suggest
// anything (two GLP-1 medicines together, a GLP-1 with a well-studied supplement, two sleep and
// stress supplements). Each one only fills the map; nothing is asked until they say so.
const TRY = [['semaglutide', 'tirzepatide'], ['tirzepatide', 'creatine'], ['melatonin', 'ashwagandha']];

// Two sizes of drawing: compact (the panel beside the chat, phones) and wide (the full screen
// on a computer, with the Library's categories named round the edge). Units are the viewBox's.
const GEO = {
  compact: { key: 'compact', size: 600, ring: 164, node: 31, hub: 52, lib: [257, 267, 277, 287], dot: 3, hit: 0, cats: false, label: 24, lh: 26, band: 10 },
  wide: { key: 'wide', size: 1200, ring: 290, node: 40, hub: 68, lib: [438, 453, 468, 483], dot: 4.3, hit: 9, cats: true, label: 27, lh: 30, band: 16 },
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function el(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) n.setAttribute(k, String(v));
  for (const k of kids.flat()) if (k != null && k !== false) n.append(k);
  return n;
}
function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== '') n.append(k instanceof Node ? k : String(k));
  return n;
}
const r2 = (n) => Math.round(n * 100) / 100;
const pairKey = (a, b) => (a < b ? `${a}+${b}` : `${b}+${a}`);
const listOf = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const clean = (s, max = 80) => String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
const area = () => { try { return window.sessionStorage; } catch { return null; } };
const keep = {
  get() { try { return JSON.parse(area()?.getItem(KEY) || 'null'); } catch { return null; } },
  set(v) { try { area()?.setItem(KEY, JSON.stringify(v)); } catch { /* full or blocked */ } },
  del() { try { area()?.removeItem(KEY); } catch { /* blocked */ } },
};

// A name on two short lines at most, under its node
function nameLines(name, max) {
  const words = clean(name, 60).replace(/\s*\([^)]*\)\s*/g, ' ').trim().split(/\s+/).filter(Boolean);
  const out = [];
  for (const w of words) {
    const cur = out[out.length - 1];
    if (cur != null && `${cur} ${w}`.length <= max) out[out.length - 1] = `${cur} ${w}`;
    else out.push(w);
  }
  if (out.length > 2) out.splice(1, out.length - 1, `${out.slice(1).join(' ')}`);
  return out.slice(0, 2).map((l) => (l.length > max + 1 ? `${l.slice(0, max - 1).trimEnd()}…` : l));
}

// Each family's mark, drawn in a box of ±s around 0,0: a chain of amino acids, a steroid ring,
// a capsule, a tablet, two together
function glyph(fam, s) {
  const u = s / 12;
  const g = el('g', { class: 'mx-glyph', 'stroke-width': r2(1.7 * u) });
  if (fam === 'pep') {
    g.append(el('path', { d: `M${r2(-7 * u)} 0H${r2(7 * u)}` }));
    for (const x of [-7, 0, 7]) g.append(el('circle', { cx: r2(x * u), cy: 0, r: r2(2.7 * u) }));
  } else if (fam === 'hor') {
    const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${r2(Math.cos(a) * 7.4 * u)},${r2(Math.sin(a) * 7.4 * u)}`; });
    g.append(el('polygon', { points: pts.join(' ') }));
  } else if (fam === 'sup') {
    const cap = el('g', { transform: 'rotate(-38)' });
    cap.append(el('rect', { x: r2(-8.6 * u), y: r2(-4 * u), width: r2(17.2 * u), height: r2(8 * u), rx: r2(4 * u) }));
    cap.append(el('path', { d: `M0 ${r2(-4 * u)}V${r2(4 * u)}` }));
    g.append(cap);
  } else if (fam === 'med') {
    g.append(el('circle', { r: r2(7 * u) }));
    g.append(el('path', { d: `M${r2(-4.9 * u)} ${r2(4.9 * u)}L${r2(4.9 * u)} ${r2(-4.9 * u)}` }));
  } else {
    g.append(el('circle', { cx: r2(-3.3 * u), r: r2(5.3 * u) }));
    g.append(el('circle', { cx: r2(3.3 * u), r: r2(5.3 * u) }));
  }
  return g;
}
// A line sample for the legend
function sample(kind) {
  const s = el('svg', { viewBox: '0 0 30 10', width: 30, height: 10, 'aria-hidden': 'true', class: `mx-sample e-${kind}` });
  s.append(el('path', { class: 'mx-e-line', d: 'M1 5H29' }));
  return s;
}
const ICON = {
  expand: '<path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9"/>',
  close: '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>',
  add: '<path d="M8 3v10M3 8h10"/>',
  x: '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>',
};
function icon(name, size = 16) {
  const s = el('svg', { viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': 'true' });
  const g = el('g', { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const d = new DOMParser().parseFromString(`<svg xmlns="${NS}">${ICON[name] || ''}</svg>`, 'image/svg+xml').documentElement;
  for (const k of [...d.childNodes]) g.append(document.importNode(k, true));
  s.append(g);
  return s;
}

// ---------------------------------------------------------------------------
// Where things sit
// ---------------------------------------------------------------------------
// The Library round the edge: each category gets an equal slice, its compounds in staggered
// rows (peptides first, then hormones, medications, supplements, blends)
function libLayout(items, g) {
  const c = g.size / 2;
  const per = 360 / CATS.length;
  const gap = 3.4;
  const groups = CATS.map(() => []);
  for (const it of items) {
    const i = CATS.indexOf(it.category);
    if (i >= 0) groups[i].push(it);
  }
  const pos = new Map();
  const arcs = [];
  const rows = g.lib.length;
  groups.forEach((list, ci) => {
    list.sort((a, b) => (FAM_ORDER[a.family] ?? 9) - (FAM_ORDER[b.family] ?? 9) || a.name.localeCompare(b.name));
    const a0 = -90 + ci * per + gap / 2;
    const span = per - gap;
    arcs.push({ cat: CATS[ci], a0, a1: a0 + span, n: list.length });
    list.forEach((it, k) => {
      const row = k % rows;
      const col = Math.floor(k / rows);
      const inRow = Math.floor((list.length - 1 - row) / rows) + 1;
      const t = inRow > 1 ? col / (inRow - 1) : 0.5;
      const a = ((a0 + span * (0.06 + 0.88 * t)) * Math.PI) / 180;
      const r = g.lib[row];
      pos.set(it.id, { x: c + r * Math.cos(a), y: c + r * Math.sin(a), a });
    });
  });
  return { pos, arcs };
}
// Your compounds on the ring: each one turned towards its own place in the Library (so its
// thread out to the edge is short), then eased apart until no two crowd each other. Before the
// Library has loaded, evenly round you.
function ringLayout(ids, g, lib) {
  const c = g.size / 2;
  const n = ids.length;
  let degs = ids.map((_, i) => (n === 2 ? 180 : -90) + (i * 360) / n);
  const home = lib ? ids.map((id) => lib.pos.get(id)) : [];
  if (n && home.length && home.every(Boolean)) degs = spread(home.map((p) => (p.a * 180) / Math.PI), Math.min((360 / n) * 0.66, 120));
  return new Map(ids.map((id, i) => {
    const deg = ((degs[i] % 360) + 360) % 360;
    const a = (deg * Math.PI) / 180;
    return [id, { x: c + g.ring * Math.cos(a), y: c + g.ring * Math.sin(a), deg }];
  }));
}
// Angles (degrees) moved as little as possible until every neighbour is at least sep apart
function spread(angles, sep) {
  const n = angles.length;
  if (n < 2) return angles;
  const a = angles.map((x, i) => ({ i, x: ((x % 360) + 360) % 360 })).sort((p, q) => p.x - q.x);
  // Two (or more) in exactly the same place are told apart by their order
  for (let k = 1; k < n; k++) if (a[k].x - a[k - 1].x < 0.01) a[k].x = a[k - 1].x + 0.01;
  for (let it = 0; it < 400; it++) {
    let moved = false;
    for (let k = 0; k < n; k++) {
      const p = a[k];
      const q = a[(k + 1) % n];
      const gap = q.x - p.x + (k === n - 1 ? 360 : 0);
      if (gap < sep - 0.05) {
        const push = (sep - gap) / 2;
        p.x -= push;
        q.x += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return a.sort((p, q) => p.i - q.i).map((p) => p.x);
}
// A pair's line: drawn in towards you, but always round you, never through
function chord(p, q, g) {
  const c = g.size / 2;
  let dx = (p.x + q.x) / 2 - c;
  let dy = (p.y + q.y) / 2 - c;
  let d = Math.hypot(dx, dy);
  if (d < 0.5) {
    dx = p.y - q.y;
    dy = q.x - p.x;
    if (dy > 0) { dx = -dx; dy = -dy; }
    d = Math.hypot(dx, dy) || 1;
  }
  const pull = Math.max(d * 0.36, g.hub + g.node * 0.9);
  const k = { x: c + (dx / d) * pull, y: c + (dy / d) * pull };
  return {
    d: `M${r2(p.x)} ${r2(p.y)}Q${r2(k.x)} ${r2(k.y)} ${r2(q.x)} ${r2(q.y)}`,
    mid: { x: 0.25 * p.x + 0.5 * k.x + 0.25 * q.x, y: 0.25 * p.y + 0.5 * k.y + 0.25 * q.y },
  };
}
// A slice of a ring, as a path (for the evidence meter round each node, and the category labels)
function arcPath(r, a0, a1, sweep = 1) {
  const p = (a) => ({ x: r * Math.cos((a * Math.PI) / 180), y: r * Math.sin((a * Math.PI) / 180) });
  const s = p(sweep ? a0 : a1);
  const e = p(sweep ? a1 : a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${r2(s.x)} ${r2(s.y)}A${r2(r)} ${r2(r)} 0 ${large} ${sweep} ${r2(e.x)} ${r2(e.y)}`;
}

// ---------------------------------------------------------------------------
// The state everything draws from
// ---------------------------------------------------------------------------
// ids: the compounds on the map, in order. findings: the auditor's, as the chat gave them.
// covered: the compounds the auditor checked together (every pair among them was checked).
// ok: true (checked), false (the check couldn't run), null (nothing checked).
// source: 'chat' (from Sig's answer), 'picks' (the visitor's own), 'saved' (their saved stack).
function blank() {
  return { ids: [], findings: [], covered: [], ok: null, meds: [], source: 'none', at: -1, title: '' };
}
function derive(s) {
  const pairs = new Map();
  const singles = new Map();
  for (const f of s.findings) {
    const ids = (f.ids || []).filter((i) => s.ids.includes(i));
    if (!ids.length || ids.length !== (f.ids || []).length) continue;
    if (ids.length === 2) {
      const k = pairKey(ids[0], ids[1]);
      if (!pairs.has(k) || RANK[f.level] > RANK[pairs.get(k).level]) pairs.set(k, f);
    } else {
      const list = singles.get(ids[0]) || [];
      list.push(f);
      list.sort((a, b) => RANK[b.level] - RANK[a.level]);
      singles.set(ids[0], list);
    }
  }
  const covered = new Set(s.covered);
  const edges = [];
  for (let i = 0; i < s.ids.length; i++) {
    for (let j = i + 1; j < s.ids.length; j++) {
      const a = s.ids[i];
      const b = s.ids[j];
      const f = pairs.get(pairKey(a, b));
      const both = covered.has(a) && covered.has(b);
      const kind = f ? f.level : both ? (s.ok === false ? 'failed' : s.ok ? 'clear' : 'unchecked') : 'unchecked';
      edges.push({ a, b, key: pairKey(a, b), kind, f });
    }
  }
  const worst = new Map();
  const touch = (id, lv) => { if (lv && (!worst.has(id) || RANK[lv] > RANK[worst.get(id)])) worst.set(id, lv); };
  for (const e of edges) if (e.f) { touch(e.a, e.f.level); touch(e.b, e.f.level); }
  for (const [id, list] of singles) touch(id, list[0].level);
  const count = (k) => edges.filter((e) => e.kind === k).length;
  return {
    edges, singles, worst,
    n: { avoid: count('avoid') + [...singles.values()].filter((l) => l[0].level === 'avoid').length,
      caution: count('caution') + [...singles.values()].filter((l) => l[0].level === 'caution').length,
      info: count('info') + [...singles.values()].filter((l) => l[0].level === 'info').length,
      clear: count('clear'), unchecked: count('unchecked'), failed: count('failed'), pairs: edges.length },
  };
}

// ---------------------------------------------------------------------------
// The map: one state, drawn in every view of it (the panel beside the chat, the full screen)
// ---------------------------------------------------------------------------
class InteractionMap {
  constructor() {
    this.s = blank();
    this.d = derive(this.s);
    this.items = [];
    this.byId = new Map();
    this.views = new Set();
    this.sel = null;                // {t: 'node'|'edge'|'hub', key}
    this.checking = false;
    this.waiting = '';
    this.busy = false;
    this.onCheck = null;
    this.saved = null;
    this.chatLen = 0;
    this.lenFn = null;              // the page's own count of messages, when it gives one
    this.libReady = fetch('/library/data/index.json').then((r) => (r.ok ? r.json() : null)).then((ix) => {
      this.items = (ix?.items || []).filter((it) => it && /^[a-z0-9]{1,40}$/.test(it.id) && it.name);
      this.byId = new Map(this.items.map((it) => [it.id, it]));
      // Drawn again from scratch: each compound's mark, evidence and place come from the Library
      this.redraw({ geo: true, lib: true });
    }).catch(() => {});
    const kept = keep.get();
    if (kept && Array.isArray(kept.ids)) this.adopt({ ...blank(), ...kept, source: 'picks' }, { quiet: true });
  }
  // How many messages the chat has now: picks made after an answer stand until a newer one
  get len() { return this.lenFn ? this.lenFn() : this.chatLen; }
  item(id) { return this.byId.get(id) || { id, name: id, family: '', category: '' }; }
  name(id) { return clean(this.item(id).name, 60) || id; }

  mount(root, kind) {
    const v = new View(this, root, kind);
    this.views.add(v);
    return v;
  }
  redraw(opts = {}) { for (const v of this.views) v.render(opts); }

  adopt(s, { quiet = false } = {}) {
    const ids = [...new Set((s.ids || []).filter((i) => /^[a-z0-9]{1,40}$/.test(i)))].slice(0, MAX);
    const findings = (Array.isArray(s.findings) ? s.findings : []).slice(0, 16).map((f) => ({
      ids: (Array.isArray(f.ids) ? f.ids : []).filter((i) => typeof i === 'string').slice(0, 2),
      names: Array.isArray(f.names) ? f.names.map((n) => clean(n, 60)) : [],
      kind: KIND[f.kind] ? f.kind : 'info', level: LEVEL[f.level] ? f.level : 'info', note: clean(f.note, 240),
    })).filter((f) => f.ids.length && f.note);
    const before = this.s;
    this.s = {
      ids, findings, covered: (s.covered || []).filter((i) => ids.includes(i)), ok: s.ok === true ? true : s.ok === false ? false : null,
      meds: (s.meds || []).map((m) => clean(m, 40)).filter(Boolean).slice(0, 6), source: s.source || 'picks', at: Number.isFinite(s.at) ? s.at : -1,
      title: clean(s.title, 80),
    };
    this.d = derive(this.s);
    if (this.sel && !this.stillThere(this.sel)) this.sel = null;
    if (this.s.source === 'picks') keep.set({ ids: this.s.ids, findings: this.s.findings, covered: this.s.covered, ok: this.s.ok, meds: this.s.meds, at: this.s.at });
    if (!quiet) {
      // A check that just came back draws itself in, pair by pair
      const same = before.ids.join() === this.s.ids.join() && before.findings.length === this.s.findings.length && before.ok === this.s.ok;
      const resolved = !same && this.s.ok != null && this.s.ids.length > 1;
      this.redraw({ resolve: resolved });
    }
  }
  stillThere(sel) {
    if (sel.t === 'hub') return true;
    if (sel.t === 'node') return this.s.ids.includes(sel.key);
    if (sel.t === 'single') return this.d.singles.has(sel.key);
    return this.d.edges.some((e) => e.key === sel.key);
  }

  // What the chat found last: the page calls this after each answer and on load
  fromChat(set, chatLen) {
    this.chatLen = chatLen;
    // Picks from a conversation that's since been cleared count as made at its start
    if (this.s.source === 'picks' && this.s.at > chatLen) this.s.at = chatLen;
    // The answer to what's on the map (the same compounds) is always shown, whenever it came
    const same = set && this.s.source === 'picks' && set.ids.length === this.s.ids.length && set.ids.every((i) => this.s.ids.includes(i));
    if (set && (same || set.at >= (this.s.source === 'picks' ? this.s.at : -1))) {
      if (set.ok != null) this.waiting = '';
      this.adopt({ ...set, source: 'chat' });
      return;
    }
    if (!set && this.s.source === 'chat') this.adopt(blank());
    if (!this.s.ids.length && this.saved?.items?.length) this.showSaved();
    else this.redraw();
  }
  setSaved(st) {
    this.saved = st;
    if (!this.s.ids.length && st?.items?.length) this.showSaved();
  }
  showSaved() {
    const st = this.saved;
    this.adopt({ ...blank(), ids: st.items.map((i) => i.id), meds: st.meds || [], source: 'saved' }, { quiet: true });
    this.redraw({ enter: true });
  }
  // The visitor's own changes: a compound in or out. Pairs the auditor already checked keep
  // what it found; a new compound's pairs are unchecked until Sig checks them.
  add(id) {
    if (this.s.ids.includes(id) || this.s.ids.length >= MAX || !this.byId.has(id)) return false;
    this.waiting = '';
    this.adopt({ ...this.s, ids: [...this.s.ids, id], source: 'picks', at: this.len });
    return true;
  }
  remove(id) {
    this.waiting = '';
    this.adopt({ ...this.s, ids: this.s.ids.filter((i) => i !== id), source: 'picks', at: this.len });
  }
  clear() {
    this.waiting = '';
    keep.del();
    this.adopt({ ...blank(), source: 'picks', at: this.len });
  }
  reset() {
    keep.del();
    this.chatLen = 0;
    this.waiting = '';
    this.checking = false;
    this.adopt(blank(), { quiet: true });
    if (this.saved?.items?.length) this.showSaved(); else this.redraw();
  }
  setChecking(on) {
    if (this.checking === on) return;
    this.checking = on;
    for (const v of this.views) v.setChecking(on);
  }
  setBusy(on) {
    this.busy = on;
    for (const v of this.views) v.renderPanel();
  }
  setWaiting(text) {
    this.waiting = text || '';
    for (const v of this.views) v.renderPanel();
  }
  select(sel) {
    this.sel = sel && this.sel && this.sel.t === sel.t && this.sel.key === sel.key ? null : sel;
    for (const v of this.views) v.renderSelection();
  }
  check() {
    if (this.s.ids.length < 2 || this.busy || !this.onCheck) return;
    this.onCheck(this.s.ids.map((id) => ({ id, name: this.name(id) })));
  }

  // The words above the map: what's on it, and what's known
  status() {
    const { n } = this.d;
    const k = this.s.ids.length;
    if (!k) return 'Pick two or more to see how they interact';
    if (k === 1) return this.s.ok ? 'Checked with what you told Sig. Add another to see how they interact.' : 'Add one more to see how they interact';
    if (this.checking) return `Synergy auditor: checking ${plural(n.pairs, 'pair')}…`;
    if (this.waiting) return this.waiting;
    if (n.failed && !n.clear && !n.avoid && !n.caution && !n.info) return 'The Synergy auditor couldn’t check these just now';
    const checked = n.pairs - n.unchecked - n.failed;
    if (!checked) return `${plural(k, 'compound')} · ${plural(n.pairs, 'pair')}, not checked yet`;
    const bits = [n.avoid ? `${n.avoid} to avoid` : '', n.caution ? plural(n.caution, 'caution') : '', n.info ? `${n.info} good to know` : ''].filter(Boolean);
    const head = checked === n.pairs ? `${plural(n.pairs, 'pair')} checked` : `${checked} of ${n.pairs} pairs checked`;
    return bits.length ? `${head} · ${bits.join(' · ')}` : `${head} · no known clashes`;
  }
  summary() {
    const names = this.s.ids.map((id) => this.name(id));
    if (!names.length) return 'Interaction map: the whole Library around you, grouped by what each compound is taken for. Nothing picked yet.';
    return `Interaction map of ${listOf(names)}. ${this.status()}.`;
  }
}

// ---------------------------------------------------------------------------
// A view: the drawing, and the panel of words beside or below it
// ---------------------------------------------------------------------------
let views = 0;
class View {
  constructor(map, root, kind) {
    this.m = map;
    this.kind = kind;
    this.n = ++views;
    this.g = GEO.compact;
    this.nodes = new Map();
    this.root = root;
    root.classList.add('mx', `mx-${kind}`);
    root.replaceChildren(...this.build());
    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(this.stage);
    this.fit(true);
  }

  build() {
    const id = (s) => `mx${this.n}-${s}`;
    this.statusEl = h('p', { class: 'mx-status', 'aria-live': 'polite' });
    this.svg = el('svg', { class: 'mx-svg', role: 'group', 'aria-labelledby': id('t'), tabindex: -1 });
    this.stage = h('div', { class: 'mx-stage' }, this.svg);
    this.tip = h('div', { class: 'mx-tip', hidden: true, 'aria-hidden': 'true' });
    this.stage.append(this.tip);
    this.legend = h('ul', { class: 'mx-legend', 'aria-label': 'What the lines mean' },
      ...[['avoid', 'Avoid together'], ['caution', 'Caution'], ['info', 'Good to know'], ['clear', 'No known clash'], ['unchecked', 'Not checked yet']]
        .map(([k, t]) => h('li', { class: `lg-${k}` }, sample(k), h('span', { text: t }))));
    // Adding from the Library by name: a combobox
    this.input = h('input', {
      id: id('q'), class: 'mx-input', type: 'text', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false',
      'aria-controls': id('opts'), autocomplete: 'off', spellcheck: 'false', placeholder: 'Add a compound from the Library', maxlength: 60,
    });
    this.opts = h('ul', { id: id('opts'), class: 'mx-opts', role: 'listbox', 'aria-label': 'Compounds in the Library', hidden: true });
    this.pick = h('div', { class: 'mx-pick' }, h('label', { class: 'sr', for: id('q'), text: 'Add a compound from the Library' }),
      h('span', { class: 'mx-input-ico', 'aria-hidden': 'true' }, icon('add', 15)), this.input, this.opts);
    this.chips = h('ul', { class: 'mx-chips', 'aria-label': 'On the map' });
    this.tryRow = h('div', { class: 'mx-try' });
    this.checkBtn = h('button', { class: 'mx-check', type: 'button', text: 'Check how they interact' });
    this.checkNote = h('p', { class: 'mx-check-note', text: 'Sig checks them together with the medicines and conditions you mention. Never doses.' });
    this.detail = h('div', { class: 'mx-detail', 'aria-live': 'polite' });
    this.list = h('div', { class: 'mx-list' });
    this.fine = h('p', { class: 'mx-fine', text: 'Lines come from Sig’s Synergy auditor: the Library’s fact sheets and established pharmacology, read with what you tell Sig. A dashed line means nothing is known about the pair, not that it’s safe. Your clinician has the final say.' });
    this.wire();
    const panel = h('div', { class: 'mx-panel' }, this.legend, this.pick, this.chips, this.tryRow, this.checkBtn, this.checkNote, this.detail, this.list, this.fine);
    return [this.statusEl, this.stage, panel];
  }

  wire() {
    // The drawing: tap a compound, a line or you for what's known
    this.svg.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sel]');
      if (t) { this.m.select(JSON.parse(t.dataset.sel)); return; }
      const dot = e.target.closest('[data-lib]');
      if (dot && this.g.hit) {
        const id = dot.dataset.lib;
        if (this.m.s.ids.includes(id)) { this.m.select({ t: 'node', key: id }); return; }
        if (!this.m.add(id)) this.flash(this.m.s.ids.length >= MAX ? `The map holds ${MAX} at a time` : '');
        return;
      }
      if (this.m.sel) this.m.select(null);
    });
    this.svg.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target.closest('[data-sel]');
      if (!t) return;
      e.preventDefault();
      this.m.select(JSON.parse(t.dataset.sel));
    });
    // Hovering a compound or a line lights up what it touches
    const hover = (e) => {
      const t = e.target.closest('[data-sel]');
      this.focus(t ? JSON.parse(t.dataset.sel) : null);
      const dot = this.g.hit ? e.target.closest('[data-lib]') : null;
      if (dot) this.showTip(dot.dataset.lib); else this.tip.hidden = true;
    };
    this.svg.addEventListener('pointerover', hover);
    this.svg.addEventListener('pointerleave', () => { this.focus(null); this.tip.hidden = true; });
    this.svg.addEventListener('focusin', hover);
    this.svg.addEventListener('focusout', () => this.focus(null));
    this.checkBtn.addEventListener('click', () => this.m.check());
    // The combobox
    let active = -1;
    const options = () => [...this.opts.querySelectorAll('[role="option"]')];
    const setActive = (i) => {
      const os = options();
      active = os.length ? (i + os.length) % os.length : -1;
      os.forEach((o, k) => o.setAttribute('aria-selected', String(k === active)));
      if (active >= 0) { this.input.setAttribute('aria-activedescendant', os[active].id); os[active].scrollIntoView({ block: 'nearest' }); } else this.input.removeAttribute('aria-activedescendant');
    };
    const close = () => { this.opts.hidden = true; this.input.setAttribute('aria-expanded', 'false'); this.input.removeAttribute('aria-activedescendant'); active = -1; };
    const choose = (id) => {
      if (!id) return;
      const ok = this.m.add(id);
      this.input.value = '';
      close();
      if (!ok && this.m.s.ids.length >= MAX) this.flash(`The map holds ${MAX} at a time`);
    };
    this.input.addEventListener('input', () => {
      const found = this.search(this.input.value);
      this.opts.replaceChildren(...found.map((it, k) => h('li', {
        id: `mx${this.n}-o${k}`, role: 'option', 'aria-selected': 'false', 'data-id': it.id, class: 'mx-opt',
      }, h('span', { class: `mx-dot fam-${(FAM[it.family] || ['sup'])[0]}`, 'aria-hidden': 'true' }), h('span', { class: 'mx-opt-name', text: clean(it.name, 60) }),
      h('span', { class: 'mx-opt-cat', text: it.category || '' }))));
      const show = found.length > 0;
      this.opts.hidden = !show;
      this.input.setAttribute('aria-expanded', String(show));
      setActive(show ? 0 : -1);
    });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (this.opts.hidden) this.input.dispatchEvent(new Event('input')); else setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(options()[active]?.dataset.id); }
      else if (e.key === 'Escape') { if (!this.opts.hidden) { e.preventDefault(); e.stopPropagation(); close(); } }
    });
    this.input.addEventListener('blur', () => setTimeout(close, 120));
    this.opts.addEventListener('pointerdown', (e) => {
      const o = e.target.closest('[role="option"]');
      if (!o) return;
      e.preventDefault();
      choose(o.dataset.id);
    });
  }

  search(q) {
    const s = clean(q, 60).toLowerCase();
    if (!s) return [];
    const on = new Set(this.m.s.ids);
    const scored = [];
    for (const it of this.m.items) {
      if (on.has(it.id)) continue;
      const name = it.name.toLowerCase();
      const al = (it.aliases || []).map((a) => String(a).toLowerCase());
      const sc = name.startsWith(s) ? 4 : al.some((a) => a.startsWith(s)) ? 3 : name.includes(s) ? 2 : al.some((a) => a.includes(s)) ? 1 : 0;
      if (sc) scored.push([sc + (it.sheet ? 0.5 : 0), it]);
    }
    return scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).slice(0, 7).map((x) => x[1]);
  }

  // The drawing's size follows the space it has
  fit(first = false) {
    const w = this.stage.clientWidth;
    const g = w >= 600 ? GEO.wide : GEO.compact;
    if (g !== this.g || first) {
      this.g = g;
      this.render({ geo: true, lib: true });
    }
  }

  flash(text) {
    if (!text) return;
    this.statusEl.textContent = text;
    clearTimeout(this.flashT);
    this.flashT = setTimeout(() => this.renderStatus(), 2200);
  }

  showTip(id) {
    const it = this.m.byId.get(id);
    const p = this.lib?.pos.get(id);
    if (!it || !p) { this.tip.hidden = true; return; }
    const k = this.stage.clientWidth / this.g.size;
    const on = this.m.s.ids.includes(id);
    this.tip.replaceChildren(h('b', { text: clean(it.name, 60) }), h('span', { text: `${it.category}${it.grade ? ` · ${GRADE[it.grade]}` : ' · no fact sheet yet'}` }),
      h('span', { class: 'mx-tip-do', text: on ? 'On your map' : this.m.s.ids.length >= MAX ? `The map holds ${MAX}` : 'Tap to add it' }));
    this.tip.hidden = false;
    const x = p.x * k;
    const y = p.y * k;
    this.tip.classList.toggle('left', x > this.stage.clientWidth * 0.6);
    this.tip.classList.toggle('up', y > this.stage.clientHeight * 0.6);
    this.tip.style.setProperty('--x', `${r2(x)}px`);
    this.tip.style.setProperty('--y', `${r2(y)}px`);
  }

  // ---------------------------------------------------------------- drawing
  render(opts = {}) {
    if (!this.svg.isConnected) return;
    const g = this.g;
    const m = this.m;
    if (opts.geo || !this.layers) this.scaffold();
    if (opts.lib || opts.geo) this.drawLib();
    this.svg.classList.toggle('has-picks', m.s.ids.length > 0);
    this.titleEl.textContent = m.summary();
    this.ring = ringLayout(m.s.ids, g, this.lib);
    // Compounds glide to their places; a new one comes from its place in the Library (or from
    // you, in the centre); edges draw in once they've arrived
    const c = g.size / 2;
    const animate = !motionOff() && !opts.geo;
    const seen = new Set();
    let entered = false;
    m.s.ids.forEach((id) => {
      seen.add(id);
      const p = this.ring.get(id);
      let node = this.nodes.get(id);
      if (!node) {
        node = this.makeNode(id);
        this.nodes.set(id, node);
        this.layers.nodes.append(node);
        if (animate) {
          // From its own place in the Library (in this view's drawing), or out of you
          const home = this.lib?.pos.get(id);
          const from = home || { x: c, y: c };
          node.style.transition = 'none';
          node.style.transform = `translate(${r2(from.x)}px, ${r2(from.y)}px) scale(${home ? 0.2 : 0.3})`;
          node.getBoundingClientRect();
          node.style.transition = '';
          entered = true;
        }
      }
      this.placeNode(node, id, p);
    });
    for (const [id, node] of this.nodes) {
      if (seen.has(id)) continue;
      this.nodes.delete(id);
      if (animate) {
        node.classList.add('leaving');
        node.style.transform = `translate(${c}px, ${c}px) scale(.2)`;
        setTimeout(() => node.remove(), 450);
      } else node.remove();
    }
    this.drawEdges({ draw: animate && (opts.resolve || entered || opts.enter), delay: entered ? 420 : 0 });
    this.drawHub();
    this.markLib();
    this.setChecking(m.checking);
    this.renderSelection();
    this.renderPanel();
  }

  scaffold() {
    const g = this.g;
    const id = (s) => `mx${this.n}-${s}`;
    this.svg.replaceChildren();
    this.nodes.clear();
    this.svg.setAttribute('viewBox', `0 0 ${g.size} ${g.size}`);
    this.svg.classList.remove('g-compact', 'g-wide');
    this.svg.classList.add(`g-${g.key}`);
    this.titleEl = el('title', { id: id('t') });
    const defs = el('defs');
    const glow = el('radialGradient', { id: id('glow') });
    glow.append(el('stop', { offset: '0', 'stop-color': '#D8FF3D', 'stop-opacity': '.30' }), el('stop', { offset: '.55', 'stop-color': '#D8FF3D', 'stop-opacity': '.07' }), el('stop', { offset: '1', 'stop-color': '#D8FF3D', 'stop-opacity': '0' }));
    const halo = el('filter', { id: id('blur'), x: '-50%', y: '-50%', width: '200%', height: '200%' });
    halo.append(el('feGaussianBlur', { stdDeviation: g.key === 'wide' ? 11 : 8 }));
    // A compound's disc: lit a little from above, like glass
    const disc = el('radialGradient', { id: id('disc'), cx: '.38', cy: '.3', r: '.85' });
    disc.append(el('stop', { offset: '0', 'stop-color': '#2A3D3B' }), el('stop', { offset: '.6', 'stop-color': '#152321' }), el('stop', { offset: '1', 'stop-color': '#0E1716' }));
    const you = el('radialGradient', { id: id('you'), cx: '.5', cy: '.42', r: '.7' });
    you.append(el('stop', { offset: '0', 'stop-color': '#2C3A12' }), el('stop', { offset: '1', 'stop-color': '#0F1A0F' }));
    this.catDefs = el('g');
    defs.append(glow, halo, disc, you, this.catDefs);
    const c = g.size / 2;
    // The quiet structure: your ring, and faint spokes for each of the Library's slices
    const bg = el('g', { class: 'mx-bg', 'aria-hidden': 'true' });
    bg.append(el('circle', { class: 'mx-bg-glow', cx: c, cy: c, r: g.ring * 1.25, fill: `url(#${id('glow')})` }));
    bg.append(el('circle', { class: 'mx-bg-ring', cx: c, cy: c, r: g.ring }));
    bg.append(el('circle', { class: 'mx-bg-ring faint', cx: c, cy: c, r: (g.ring + g.lib[0]) / 2 }));
    for (let i = 0; i < CATS.length; i++) {
      const a = ((-90 + (i * 360) / CATS.length) * Math.PI) / 180;
      bg.append(el('path', { class: 'mx-bg-spoke', d: `M${r2(c + (g.hub + 18) * Math.cos(a))} ${r2(c + (g.hub + 18) * Math.sin(a))}L${r2(c + g.lib[0] * 0.94 * Math.cos(a))} ${r2(c + g.lib[0] * 0.94 * Math.sin(a))}` }));
    }
    this.layers = {
      lib: el('g', { class: 'mx-lib' }), cats: el('g', { class: 'mx-cats', 'aria-hidden': 'true' }), teth: el('g', { class: 'mx-teth', 'aria-hidden': 'true' }),
      spokes: el('g', { class: 'mx-spokes' }), edges: el('g', { class: 'mx-edges' }), hub: el('g', { class: 'mx-hubg' }), nodes: el('g', { class: 'mx-nodes' }),
    };
    this.defs = defs;
    this.svg.append(this.titleEl, defs, bg, this.layers.lib, this.layers.cats, this.layers.teth, this.layers.spokes, this.layers.edges, this.layers.hub, this.layers.nodes);
  }

  drawLib() {
    const g = this.g;
    const items = this.m.items;
    this.layers.lib.replaceChildren();
    this.layers.cats.replaceChildren();
    this.catDefs.replaceChildren();
    this.lib = items.length ? libLayout(items, g) : null;
    if (!this.lib) return;
    const c = g.size / 2;
    const frag = document.createDocumentFragment();
    for (const it of items) {
      const p = this.lib.pos.get(it.id);
      if (!p) continue;
      const lit = it.sheet ? `ev${GRADE_N[it.grade] ?? 0}` : 'ev-none';
      const dot = el('g', { class: `mx-libdot ${lit}`, 'data-lib': it.id, transform: `translate(${r2(p.x)} ${r2(p.y)})` });
      if (g.hit) dot.append(el('circle', { class: 'mx-hit', r: g.hit }));
      dot.append(el('circle', { class: 'mx-dotc', r: g.dot }));
      frag.append(dot);
    }
    // Each category's slice, as a thin arc just inside its compounds (lit where yours live)
    const bands = el('g', { class: 'mx-bands', 'aria-hidden': 'true' });
    for (const a of this.lib.arcs) bands.append(el('path', { class: 'mx-band', 'data-cat': a.cat, d: arcPath(g.lib[0] - g.band, a.a0 + 0.6, a.a1 - 0.6), transform: `translate(${c} ${c})` }));
    this.layers.lib.append(bands, frag);
    // The categories, named along the edge on wide screens (bottom half written the other way
    // round, so every name reads left to right)
    if (g.cats) {
      const r = g.lib[g.lib.length - 1] + 34;
      for (const a of this.lib.arcs) {
        const mid = (a.a0 + a.a1) / 2;
        const bottom = Math.sin((mid * Math.PI) / 180) > 0.05;
        const pid = `mx${this.n}-cat${CATS.indexOf(a.cat)}`;
        const d = arcPath(r + (bottom ? 12 : 0), a.a0 - 2, a.a1 + 2, bottom ? 0 : 1);
        const path = el('path', { id: pid, d, transform: `translate(${c} ${c})`, fill: 'none', stroke: 'none' });
        this.catDefs.append(path);
        const t = el('text', { class: 'mx-cat', 'data-cat': a.cat });
        const tp = el('textPath', { href: `#${pid}`, startOffset: '50%', 'text-anchor': 'middle' });
        tp.textContent = a.cat;
        t.append(tp);
        this.layers.cats.append(t);
      }
    }
  }
  markLib() {
    if (!this.lib) return;
    const on = new Set(this.m.s.ids);
    this.layers.lib.querySelectorAll('.mx-libdot').forEach((d) => d.classList.toggle('on', on.has(d.dataset.lib)));
    const cats = new Set(this.m.s.ids.map((id) => this.m.item(id).category));
    this.svg.querySelectorAll('.mx-band, .mx-cat').forEach((b) => b.classList.toggle('on', cats.has(b.dataset.cat)));
    // Thin threads from your compounds back to their place in the Library
    this.layers.teth.replaceChildren();
    if (!this.g.cats) return;
    for (const id of this.m.s.ids) {
      const p = this.lib.pos.get(id);
      const q = this.ring?.get(id);
      if (!p || !q) continue;
      this.layers.teth.append(el('path', { class: 'mx-tether', d: `M${r2(q.x)} ${r2(q.y)}L${r2(p.x)} ${r2(p.y)}` }));
    }
  }

  makeNode(id) {
    const g = this.g;
    const it = this.m.item(id);
    const fam = (FAM[it.family] || ['sup'])[0];
    const node = el('g', { class: `mx-node fam-${fam}`, 'data-id': id, 'data-sel': JSON.stringify({ t: 'node', key: id }), tabindex: 0, role: 'button' });
    node.append(el('circle', { class: 'mx-halo', r: g.node + 16, filter: `url(#mx${this.n}-blur)` }));
    // The evidence meter, as four arcs round the node (lit: how strong the evidence is)
    const lit = it.sheet ? GRADE_N[it.grade] ?? 0 : -1;
    const meter = el('g', { class: 'mx-meter', 'aria-hidden': 'true' });
    for (let i = 0; i < 4; i++) {
      const a0 = 140 + i * 66;
      meter.append(el('path', { class: i < lit ? 'on' : '', d: arcPath(g.node + 7, a0, a0 + 52) }));
    }
    node.append(meter);
    node.append(el('circle', { class: 'mx-disc', r: g.node, fill: `url(#mx${this.n}-disc)` }));
    node.append(glyph(fam, g.node * 0.62));
    node.append(el('text', { class: 'mx-label' }));
    return node;
  }
  placeNode(node, id, p) {
    const g = this.g;
    const it = this.m.item(id);
    node.style.transform = `translate(${r2(p.x)}px, ${r2(p.y)}px)`;
    node.classList.remove('lvl-avoid', 'lvl-caution', 'lvl-info');
    const worst = this.m.d.worst.get(id);
    if (worst) node.classList.add(`lvl-${worst}`);
    const fam = (FAM[it.family] || ['', 'Compound'])[1];
    node.setAttribute('aria-label', `${this.m.name(id)}: ${fam.toLowerCase()}${it.grade ? `, ${GRADE[it.grade].toLowerCase()}` : ''}. Show what’s known`);
    // The name above the top half's nodes and below the bottom half's, away from you
    const top = p.deg > 180 && p.deg < 360;
    const lines = nameLines(this.m.name(id), g.key === 'wide' ? 16 : 13);
    const text = node.querySelector('.mx-label');
    text.replaceChildren();
    const first = top ? -(g.node + 16 + (lines.length - 1) * g.lh) : g.node + 16 + g.label * 0.8;
    lines.forEach((l, i) => {
      const ts = el('tspan', { x: 0, y: r2(first + i * g.lh) });
      ts.textContent = l;
      text.append(ts);
    });
  }

  drawEdges({ draw = false, delay = 0 } = {}) {
    const g = this.g;
    const c = g.size / 2;
    const { edges, singles } = this.m.d;
    this.layers.edges.replaceChildren();
    this.layers.spokes.replaceChildren();
    const order = { unchecked: 0, failed: 0, clear: 1, info: 2, caution: 3, avoid: 4 };
    const sorted = [...edges].sort((a, b) => order[a.kind] - order[b.kind]);
    let i = 0;
    for (const e of sorted) {
      const p = this.ring.get(e.a);
      const q = this.ring.get(e.b);
      if (!p || !q) continue;
      const { d, mid } = chord(p, q, g);
      // Lines answer a tap or a pointer; from the keyboard, each one is reached through the list
      // of findings and each compound's own details
      const grp = el('g', { class: `mx-edge e-${e.kind}${e.f ? ` k-${e.f.kind}` : ''}`, 'data-a': e.a, 'data-b': e.b, 'data-sel': JSON.stringify({ t: 'edge', key: e.key }), role: 'img' });
      grp.setAttribute('aria-label', `${this.m.name(e.a)} and ${this.m.name(e.b)}: ${e.f ? `${LEVEL[e.f.level]}, ${KIND[e.f.kind] || ''}` : e.kind === 'clear' ? 'no known clash in the data' : e.kind === 'failed' ? 'couldn’t be checked' : 'not checked yet'}`);
      grp.append(el('path', { class: 'mx-e-hit', d }));
      const solid = !!e.f;
      grp.append(el('path', { class: 'mx-e-line', d, ...(solid ? { pathLength: 1 } : {}) }));
      if (e.f?.kind === 'overlap') grp.append(el('path', { class: 'mx-e-gap', d, pathLength: 1 }));
      if (e.f?.kind === 'interaction') {
        const s = g.key === 'wide' ? 9 : 6;
        grp.append(el('path', { class: 'mx-e-mark', d: `M${r2(mid.x)} ${r2(mid.y - s)}L${r2(mid.x + s)} ${r2(mid.y)}L${r2(mid.x)} ${r2(mid.y + s)}L${r2(mid.x - s)} ${r2(mid.y)}Z` }));
      }
      if (draw) {
        grp.classList.add(solid ? 'mx-draw' : 'mx-fade');
        grp.style.setProperty('--i', String(i));
        grp.style.setProperty('--d', `${delay}ms`);
        i += 1;
      }
      this.layers.edges.append(grp);
    }
    // To you: a finding about one compound with your medicines or conditions; faint threads for
    // the ones checked with what you said
    const covered = new Set(this.m.s.covered);
    for (const id of this.m.s.ids) {
      const p = this.ring.get(id);
      if (!p) continue;
      const list = singles.get(id);
      const f = list?.[0];
      if (!f && !(covered.has(id) && this.m.s.ok)) continue;
      const d = `M${r2(p.x)} ${r2(p.y)}L${r2(c)} ${r2(c)}`;
      const grp = el('g', { class: `mx-spoke ${f ? `e-${f.level}` : 'e-quiet'}`, 'data-a': id });
      if (f) {
        grp.setAttribute('data-sel', JSON.stringify({ t: 'single', key: id }));
        grp.setAttribute('role', 'img');
        grp.setAttribute('aria-label', `${this.m.name(id)} and you: ${LEVEL_ONE[f.level]}`);
        grp.append(el('path', { class: 'mx-e-hit', d }));
      }
      grp.append(el('path', { class: 'mx-e-line', d, ...(f ? { pathLength: 1 } : {}) }));
      // Where it meets you: a small mark on your ring, so it reads as "to you"
      if (f) {
        const len = Math.hypot(p.x - c, p.y - c) || 1;
        grp.append(el('circle', { class: 'mx-plug', cx: r2(c + ((p.x - c) / len) * g.hub), cy: r2(c + ((p.y - c) / len) * g.hub), r: g.key === 'wide' ? 7.5 : 6.5 }));
      }
      if (f && draw) {
        grp.classList.add('mx-draw');
        grp.style.setProperty('--i', String(i));
        grp.style.setProperty('--d', `${delay}ms`);
        i += 1;
      }
      this.layers.spokes.append(grp);
    }
  }

  drawHub() {
    const g = this.g;
    const c = g.size / 2;
    const m = this.m;
    const hub = this.layers.hub;
    hub.replaceChildren();
    hub.setAttribute('transform', `translate(${c} ${c})`);
    hub.setAttribute('data-sel', JSON.stringify({ t: 'hub', key: 'you' }));
    hub.setAttribute('tabindex', '0');
    hub.setAttribute('role', 'button');
    hub.setAttribute('aria-label', 'You: the medicines and conditions you tell Sig about. Show what was checked');
    hub.append(el('circle', { class: 'mx-hub-pulse', r: g.hub }));
    hub.append(el('circle', { class: 'mx-hub-disc', r: g.hub, fill: `url(#mx${this.n}-you)` }));
    const you = el('text', { class: 'mx-hub-you', y: m.s.meds.length ? r2(-g.hub * 0.17) : 0 });
    you.textContent = 'You';
    hub.append(you);
    if (m.s.meds.length) {
      const sub = el('text', { class: 'mx-hub-sub', y: r2(g.hub * 0.34) });
      sub.textContent = plural(m.s.meds.length, 'medicine');
      hub.append(sub);
    }
  }

  setChecking(on) {
    this.svg.classList.toggle('is-checking', !!on && this.m.s.ids.length > 1);
    this.renderStatus();
    this.renderPanel();
  }

  // Lighting up what a compound or line touches, dimming the rest
  focus(sel) {
    const s = sel || this.m.sel;
    this.svg.classList.toggle('has-focus', !!s);
    this.svg.querySelectorAll('.is-on').forEach((n) => n.classList.remove('is-on'));
    if (!s) return;
    const on = (n) => n?.classList.add('is-on');
    if (s.t === 'node') {
      on(this.nodes.get(s.key));
      this.svg.querySelectorAll(`.mx-edge[data-a="${s.key}"], .mx-edge[data-b="${s.key}"], .mx-spoke[data-a="${s.key}"]`).forEach((e) => {
        on(e);
        on(this.nodes.get(e.dataset.a));
        on(this.nodes.get(e.dataset.b));
      });
      on(this.layers.hub);
    } else if (s.t === 'edge') {
      const [a, b] = s.key.split('+');
      this.svg.querySelectorAll('.mx-edge').forEach((e) => { if (pairKey(e.dataset.a, e.dataset.b) === s.key) on(e); });
      on(this.nodes.get(a));
      on(this.nodes.get(b));
    } else if (s.t === 'single') {
      on(this.svg.querySelector(`.mx-spoke[data-a="${s.key}"]`));
      on(this.nodes.get(s.key));
      on(this.layers.hub);
    } else if (s.t === 'hub') {
      on(this.layers.hub);
      this.svg.querySelectorAll('.mx-spoke').forEach((e) => { on(e); on(this.nodes.get(e.dataset.a)); });
    }
  }
  renderSelection() {
    const sel = this.m.sel;
    this.svg.querySelectorAll('.is-sel').forEach((n) => n.classList.remove('is-sel'));
    if (sel?.t === 'node') this.nodes.get(sel.key)?.classList.add('is-sel');
    if (sel?.t === 'edge') this.svg.querySelectorAll('.mx-edge').forEach((e) => { if (pairKey(e.dataset.a, e.dataset.b) === sel.key) e.classList.add('is-sel'); });
    if (sel?.t === 'hub') this.layers.hub.classList.add('is-sel');
    this.focus(null);
    this.renderDetail();
  }

  // ---------------------------------------------------------------- the words
  renderStatus() {
    this.statusEl.textContent = this.m.status();
    this.statusEl.classList.toggle('busy', this.m.checking && this.m.s.ids.length > 1);
  }
  renderPanel() {
    const m = this.m;
    const k = m.s.ids.length;
    this.renderStatus();
    if (this.titleEl) this.titleEl.textContent = m.summary();
    // On the map, each with a way off it
    this.chips.replaceChildren(...m.s.ids.map((id) => {
      const it = m.item(id);
      const name = m.name(id);
      return h('li', { class: 'mx-chip' }, h('span', { class: `mx-dot fam-${(FAM[it.family] || ['sup'])[0]}`, 'aria-hidden': 'true' }),
        h('button', { class: 'mx-chip-name', type: 'button', text: name, onclick: () => m.select({ t: 'node', key: id }) }),
        h('button', { class: 'mx-chip-x', type: 'button', 'aria-label': `Take ${name} off the map`, onclick: () => m.remove(id) }, icon('x', 13)));
    }));
    this.chips.hidden = !k;
    // An empty map: a few pairs to try
    this.tryRow.hidden = k > 0 || !m.items.length;
    if (!this.tryRow.hidden && !this.tryRow.childElementCount) {
      this.tryRow.append(h('span', { class: 'mx-try-k', text: 'Try a pair' }), ...TRY.filter((p) => p.every((id) => m.byId.has(id))).map((p) => h('button', {
        type: 'button', class: 'mx-try-b', text: p.map((id) => m.name(id).replace(/\s*\([^)]*\)/g, '')).join(' + '),
        onclick: () => { p.forEach((id) => m.add(id)); },
      })));
    }
    const n = m.d.n;
    const open = k > 1 && (n.unchecked + n.failed > 0);
    this.checkBtn.hidden = !open;
    this.checkNote.hidden = !open;
    this.checkBtn.disabled = m.busy;
    this.checkBtn.textContent = m.checking ? 'Sig is checking…' : n.unchecked < n.pairs ? 'Check the new pairs with Sig' : 'Check how they interact';
    this.pick.classList.toggle('full', k >= MAX);
    this.input.disabled = k >= MAX;
    this.input.placeholder = k >= MAX ? `The map holds ${MAX} at a time` : k ? 'Add another compound' : 'Add a compound from the Library';
    this.renderDetail();
  }

  // What's known about the selected compound, line or you; otherwise every finding, most
  // serious first
  renderDetail() {
    const m = this.m;
    const sel = m.sel;
    this.detail.replaceChildren();
    this.list.replaceChildren();
    if (sel?.t === 'node') this.detail.append(this.nodeCard(sel.key));
    else if (sel?.t === 'edge') this.detail.append(this.edgeCard(sel.key));
    else if (sel?.t === 'single') this.detail.append(this.singleCard(sel.key));
    else if (sel?.t === 'hub') this.detail.append(this.hubCard());
    this.detail.hidden = !this.detail.childElementCount;
    if (sel) return;
    const { edges, singles, n } = m.d;
    const rows = [];
    for (const e of edges.filter((x) => x.f)) rows.push({ f: e.f, names: [m.name(e.a), m.name(e.b)], sel: { t: 'edge', key: e.key } });
    for (const [id, list] of singles) rows.push({ f: list[0], names: [m.name(id), 'you'], sel: { t: 'single', key: id } });
    rows.sort((a, b) => RANK[b.f.level] - RANK[a.f.level]);
    if (!rows.length && !n.clear && !n.unchecked) return;
    const ul = h('ul', { class: 'mx-finds' }, rows.map((r) => h('li', {}, h('button', { type: 'button', class: `mx-find lvl-${r.f.level}`, onclick: () => m.select(r.sel) },
      h('span', { class: `mx-pill lvl-${r.f.level}`, text: LEVEL_ONE[r.f.level] }),
      h('span', { class: 'mx-find-text' }, h('b', { text: r.names.join(' + ') }), h('span', { text: r.f.note }))))));
    const quiet = [];
    if (n.clear) quiet.push(h('li', { class: 'mx-quiet' }, sample('clear'), h('span', { text: `${plural(n.clear, 'pair')}: no known clash in the data. That’s an absence of data, not a green light.` })));
    // Unchecked pairs are worth a line only beside pairs that were checked (otherwise the line
    // above the map says it)
    if (n.unchecked && n.unchecked < n.pairs) quiet.push(h('li', { class: 'mx-quiet' }, sample('unchecked'), h('span', { text: `${plural(n.unchecked, 'pair')} not checked yet.` })));
    if (n.failed) quiet.push(h('li', { class: 'mx-quiet' }, sample('unchecked'), h('span', { text: `${plural(n.failed, 'pair')} couldn’t be checked just now.` })));
    this.list.append(...[rows.length ? h('h3', { class: 'mx-h', text: 'What the auditor found' }) : null, rows.length ? ul : null,
      quiet.length ? h('ul', { class: 'mx-quiets' }, quiet) : null].filter(Boolean));
  }

  nodeCard(id) {
    const m = this.m;
    const it = m.item(id);
    const fam = (FAM[it.family] || ['', 'Compound'])[1];
    const lit = GRADE_N[it.grade] ?? 0;
    const meter = h('span', { class: 'mx-meter-h', 'aria-hidden': 'true' }, [0, 1, 2, 3].map((i) => h('i', { class: it.sheet && i < lit ? 'on' : '' })));
    const card = h('div', { class: 'mx-card' },
      h('p', { class: 'mx-card-kick', text: `${fam}${it.category ? ` · ${it.category}` : ''}` }),
      h('h3', { text: m.name(id) }),
      it.sheet ? h('p', { class: 'mx-ev' }, meter, h('span', { text: GRADE[it.grade] || 'Evidence not graded' })) : h('p', { class: 'mx-ev', text: 'No fact sheet yet' }),
      it.status_label ? h('p', { class: 'mx-stat', text: clean(it.status_label, 140) }) : null,
      it.summary ? h('p', { class: 'mx-sum', text: clean(it.summary, 320) }) : null);
    const what = [];
    for (const e of m.d.edges) if (e.a === id || e.b === id) what.push(e);
    if (what.length) {
      card.append(h('ul', { class: 'mx-ties' }, what.map((e) => {
        const other = e.a === id ? e.b : e.a;
        return h('li', {}, h('button', { type: 'button', class: `mx-tie e-${e.kind}`, onclick: () => m.select({ t: 'edge', key: e.key }) },
          sample(e.kind), h('span', { text: `With ${m.name(other)}: ${e.f ? LEVEL_ONE[e.f.level].toLowerCase() : e.kind === 'clear' ? 'no known clash' : 'not checked yet'}` })));
      })));
    }
    card.append(h('div', { class: 'mx-acts' },
      it.sheet ? h('a', { class: 'mx-act', href: `/library/${id}/`, text: 'Open the fact sheet' }) : null,
      h('button', { class: 'mx-act ghost', type: 'button', text: 'Take it off the map', onclick: () => m.remove(id) }),
      h('button', { class: 'mx-act ghost', type: 'button', text: 'Close', onclick: () => m.select(null) })));
    return card;
  }
  edgeCard(key) {
    const m = this.m;
    const e = m.d.edges.find((x) => x.key === key);
    if (!e) return h('div');
    const title = `${m.name(e.a)} + ${m.name(e.b)}`;
    const body = e.f
      ? [h('p', { class: `mx-pill lvl-${e.f.level}`, text: `${LEVEL[e.f.level]} · ${KIND[e.f.kind] || 'Good to know'}` }), h('h3', { text: title }), h('p', { class: 'mx-note', text: e.f.note }),
        h('p', { class: 'mx-src', text: 'From Sig’s Synergy auditor, cleared by the Safety agent. Ask your clinician before you combine anything.' })]
      : [h('p', { class: `mx-pill e-${e.kind}`, text: e.kind === 'clear' ? 'No known clash' : e.kind === 'failed' ? 'Couldn’t check' : 'Not checked yet' }), h('h3', { text: title }),
        h('p', { class: 'mx-note', text: e.kind === 'clear' ? 'The auditor found nothing about this pair in the Library’s notes or established pharmacology. They haven’t been studied together, so that’s an absence of data, not a green light.'
          : e.kind === 'failed' ? 'The Synergy auditor couldn’t check this pair just now. Ask again in a moment.'
            : 'Nothing has checked this pair yet. Ask Sig to check them together, with your medicines and conditions.' })];
    return h('div', { class: `mx-card e-${e.f ? e.f.level : e.kind}` }, ...body,
      h('div', { class: 'mx-acts' }, h('button', { class: 'mx-act ghost', type: 'button', text: 'Close', onclick: () => m.select(null) })));
  }
  singleCard(id) {
    const m = this.m;
    const f = m.d.singles.get(id)?.[0];
    if (!f) return h('div');
    return h('div', { class: `mx-card e-${f.level}` },
      h('p', { class: `mx-pill lvl-${f.level}`, text: `${LEVEL_ONE[f.level]} · ${KIND[f.kind] || 'Good to know'}` }),
      h('h3', { text: `${m.name(id)} and you` }), h('p', { class: 'mx-note', text: f.note }),
      h('p', { class: 'mx-src', text: 'From Sig’s Synergy auditor, cleared by the Safety agent. Don’t stop or change a medicine on your own; ask your prescriber.' }),
      h('div', { class: 'mx-acts' }, h('button', { class: 'mx-act ghost', type: 'button', text: 'Close', onclick: () => m.select(null) })));
  }
  hubCard() {
    const m = this.m;
    const meds = m.s.meds;
    return h('div', { class: 'mx-card' },
      h('p', { class: 'mx-card-kick', text: 'In the centre' }), h('h3', { text: 'You' }),
      h('p', { class: 'mx-note', text: 'Sig checks each compound against the medicines and conditions you tell it about. A line to you is something it found about one compound and you.' }),
      meds.length ? h('p', { class: 'mx-stat', text: `Checked with what you said you take: ${meds.join(', ')}.` })
        : h('p', { class: 'mx-stat', text: 'No medicines mentioned yet. Tell Sig what you take, and it checks against those too.' }),
      h('div', { class: 'mx-acts' }, h('button', { class: 'mx-act ghost', type: 'button', text: 'Close', onclick: () => m.select(null) })));
  }
}

// ---------------------------------------------------------------------------
// The full screen: the same map, as big as the screen allows
// ---------------------------------------------------------------------------
let screen = null;
function openScreen(map) {
  if (!screen) {
    const body = h('div', { class: 'mxs-body' });
    const close = h('button', { class: 'mxs-close', type: 'button', 'aria-label': 'Close the map' }, icon('close', 18));
    const dlg = h('dialog', { class: 'mxs', 'aria-labelledby': 'mxs-h' },
      h('div', { class: 'mxs-bar' }, h('div', {}, h('h2', { id: 'mxs-h', text: 'How they interact' }),
        h('p', { text: 'What Sig’s Synergy auditor found, pair by pair, with you in the centre and the whole Library around you.' })), close),
      body);
    document.body.append(dlg);
    close.addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => document.documentElement.classList.remove('mxs-open'));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    screen = { dlg, view: map.mount(body, 'screen') };
  }
  document.documentElement.classList.add('mxs-open');
  screen.dlg.showModal();
  screen.view.fit();
  screen.view.render({ enter: true });
}

const map = new InteractionMap();
window.MHMap = {
  map,
  mount: (root, kind = 'rail') => map.mount(root, kind),
  open: () => openScreen(map),
  fromChat: (set, chatLen) => map.fromChat(set, chatLen),
  show: (set) => map.adopt({ ...set, source: set.source || 'chat' }),
  setSaved: (st) => map.setSaved(st),
  checking: (on) => map.setChecking(on),
  busy: (on) => map.setBusy(on),
  waiting: (text) => map.setWaiting(text),
  reset: () => map.reset(),
  onCheck: (fn) => { map.onCheck = fn; },
  bindChat: (fn) => { map.lenFn = fn; },
  ready: map.libReady,
};
