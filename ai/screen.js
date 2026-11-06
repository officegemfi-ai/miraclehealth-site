// The screen beside Ask Sig (miraclehealth.us/ai): what Sig is talking about, laid out like a code
// editor. For the compounds in the conversation it shows, top to bottom:
//   1. one plain sentence: where they meet in the body (or that they don't), and a row of checks:
//      the fact sheets, the community's reports of taking them together, what Sig's Synergy
//      auditor found, the cautions, the blood markers and where they meet; each jumps to its part;
//   2. how they work, written like code. "together" lines them up place by place, head to toe,
//      with where they meet lit; each compound's own tab has its lines. Every line comes from its
//      fact sheet (library/data/body.json, written from the sheets), with its source. On a phone
//      the rows that matter come first (where they meet, and the cautions), the rest a tap away;
//   3. panels: what the community reports, what the auditor found, the blood markers that may
//      move (pick one to light the lines that move it), and what Sig's agents did;
//   4. what to take to a clinician: questions to copy, and the stack to keep in My Miracle.
// The chat (ai/ai.js) tells the screen what's being discussed. Nothing here is written by the AI
// except the auditor's notes and the agents' step lines, which the Safety agent has cleared;
// they're placed as text, never markup. Beside the chat on wide screens; on phones and narrow
// windows it's a sheet that pulls up over the chat (ai.js opens and closes it), and a bar above
// the box to write in says what's on it. window.MHScreen is the whole interface.
import { COMMUNITY, draftLink, signalHtml, catColor, node as fromKit } from '/kit/kit.js?v=f08d778478';
import { sealSvg } from '/library/signalviz.js?v=d8ffb3d8c3';

const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
// Narrow windows: the screen is a sheet over the chat, and it opens on the rows that matter
const narrow = matchMedia('(max-width: 1100px)');
const OP = {
  is: ['─▶', 'is'], up: ['─▲', 'raises'], block: ['─┤', 'blocks'], watch: ['─◆', 'check'], warn: ['─!', 'caution'],
};
const DIR = { up: ['▲', 'may rise'], watch: ['◆', 'worth checking'] };
const LEVEL = { avoid: 'Avoid together', caution: 'Caution', info: 'Good to know' };
const RANK = { avoid: 3, caution: 2, info: 1 };
const GRADE = { strong: 'strong evidence', moderate: 'moderate evidence', limited: 'limited evidence', preclinical: 'animal and lab studies only', anecdotal: 'user reports only' };
const AGENT = { safety: 'Safety agent', review: 'Safety agent', recommender: 'Recommender', community: 'The community', synergy: 'Synergy auditor', builder: 'Stack builder' };
// Not approved in the US for anything, or not yet: worth asking a clinician about an approved option
const UNAPPROVED = new Set(['not_approved', 'compounded', 'investigational', 'category2', 'under_review', 'restricted', 'unclear']);
// The example on the empty screen: it asks Sig, like any question
const EXAMPLE = { ids: ['somatropin', 'enclomiphene'], label: 'HGH + enclomiphene', ask: 'What do HGH and enclomiphene do together, according to the community and the studies?' };

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
const SVGNS = 'http://www.w3.org/2000/svg';
function icon(d, size = 18) {
  const s = document.createElementNS(SVGNS, 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) s.setAttribute(k, String(v));
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', d);
  s.append(p);
  return s;
}
const clean = (s, max = 200) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
const listOf = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const lower = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
// A name inside a sentence: "Enclomiphene" becomes "enclomiphene"; HGH, HbA1c, IGF-1 and LH stay as they are
const mid = (s) => (/^[A-Z][a-z]+(?:\s|$)/.test(s) ? lower(s) : s);
const pad = (n) => String(n).padStart(2, '0');
const colored = (el, c) => { el.style.setProperty('--c', c); return el; };
const okId = (id) => typeof id === 'string' && /^[a-z0-9]{1,40}$/.test(id);

// ---------------------------------------------------------------------------
// What it draws from: the Library's index (names, status, labs), the body pathways and the
// community's public totals. Each loads once; the screen draws with whatever has arrived.
// ---------------------------------------------------------------------------
const S = {
  lib: new Map(), body: { markers: {}, compounds: {}, places: [] }, snap: null, subject: null, f: null, checking: false,
  onAsk: null, onSave: null, isSaved: null, onOpen: null, onClose: null, root: null, peek: null,
  seen: '', marker: '', markerFrom: 'code', file: '', panel: '', all: false, loaded: false, pending: false,
};
const json = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const ready = Promise.all([
  json('/library/data/index.json').then((ix) => { for (const it of ix?.items || []) if (okId(it.id)) S.lib.set(it.id, it); }),
  json('/library/data/body.json').then((b) => { if (b?.compounds) S.body = { places: [], ...b }; }),
  json(`${COMMUNITY}/snapshot.json`).then((s) => { S.snap = s && typeof s === 'object' ? s : null; }),
]).then(() => { S.loaded = true; const fresh = S.pending; S.pending = false; draw(fresh); });

const item = (id) => S.lib.get(id) || { id, name: id, family: '', category: '' };
const nameOf = (id) => clean(item(id).name, 60) || id;
// The name people use: "Somatropin (HGH)" is HGH
const shortOf = (id) => { const n = nameOf(id); const m = /\(([^()]{2,14})\)\s*$/.exec(n); return m ? m[1] : n; };
const tokOf = (id) => shortOf(id).toLowerCase();
const codeOf = (id) => nameOf(id).toLowerCase();
const colorOf = (id) => catColor(item(id).category);
const sigOf = (id) => S.snap?.signals?.[id] || null;
const drawn = (id) => !!S.body.compounds?.[id]?.lines?.length;
const markerName = (m) => S.body.markers?.[m]?.name || m;
const placeSay = (at) => clean((S.body.places || []).find((p) => p && p.at === at)?.say, 60) || `the ${at}`;
const gradeSay = (g) => GRADE[g] || g;
// A stack's own Signal: the community names a stack after its parts, joined with " + " in
// alphabetical order; any order is tried, so nothing depends on how a database sorts names
function stackSig(ids) {
  const sigs = S.snap?.signals;
  if (!sigs || ids.length < 2 || ids.length > 5) return null;
  const want = new Set();
  const names = ids.map((id) => item(id).name);
  const perm = (xs, pre = []) => (xs.length ? xs.forEach((x, i) => perm([...xs.slice(0, i), ...xs.slice(i + 1)], [...pre, x])) : want.add(pre.join(' + ').toLowerCase()));
  perm(names);
  return Object.values(sigs).find((s) => s && s.kind === 'stack' && want.has(String(s.name || '').toLowerCase())) || null;
}
// The most serious thing the Synergy auditor found, once it has checked
function topFinding(sub) {
  if (!sub?.ok) return '';
  let top = '';
  for (const f of sub.findings || []) if (f && RANK[f.level] > (RANK[top] || 0)) top = f.level;
  return top;
}

// ---------------------------------------------------------------------------
// The facts, worked out once per subject: the places in the body, head to toe, with what each
// compound does there; where they meet; the cautions; the blood markers
// ---------------------------------------------------------------------------
// One compound's lines: from body.json, or (for a compound not drawn yet) its sheet's summary
function linesOf(id) {
  const b = S.body.compounds?.[id];
  if (b?.lines?.length) return b.lines;
  return [{ at: 'what it is', op: 'is', say: clean(item(id).summary, 220) || 'No fact sheet yet.', src: [] }];
}
function facts(ids) {
  const order = new Map((S.body.places || []).map((p, i) => [p?.at, i]));
  const rows = new Map();
  const seenAt = [];
  for (const id of ids) {
    for (const ln of S.body.compounds?.[id]?.lines || []) {
      let r = rows.get(ln.at);
      if (!r) { r = { at: ln.at, cells: new Map() }; rows.set(ln.at, r); seenAt.push(ln.at); }
      if (!r.cells.has(id)) r.cells.set(id, []);
      r.cells.get(id).push(ln);
    }
  }
  const rank = (at) => (order.has(at) ? order.get(at) : 1000 + seenAt.indexOf(at));
  const list = [...rows.values()].sort((a, b) => rank(a.at) - rank(b.at));
  for (const r of list) {
    const lines = [...r.cells.values()].flat();
    r.meet = r.cells.size > 1;
    r.warn = lines.some((l) => l.op === 'warn');
    r.watch = lines.some((l) => l.op === 'watch');
    r.markers = [...new Set(lines.flatMap((l) => l.markers || []).filter((m) => S.body.markers?.[m]))];
  }
  const cautions = [];
  for (const id of ids) for (const ln of S.body.compounds?.[id]?.lines || []) if (ln.op === 'warn') cautions.push({ id, ln });
  // The markers: each drawn compound's own, and an undrawn one's fact-sheet lab list as it stands
  const markers = new Map();
  for (const id of ids) {
    for (const [m, d] of Object.entries(S.body.compounds?.[id]?.dirs || {})) {
      if (!S.body.markers?.[m]) continue;
      if (!markers.has(m)) markers.set(m, []);
      markers.get(m).push({ id, dir: d });
    }
  }
  const labs = new Map();
  for (const id of ids) {
    if (drawn(id)) continue;
    const it = item(id);
    labs.set(id, [...new Set([...(it.labs?.before || []), ...(it.labs?.during || [])].map((x) => clean(x, 80)).filter(Boolean))].slice(0, 8));
  }
  const all = ids.every(drawn);
  const shared = all && ids.length > 1 ? [...markers].filter(([, xs]) => xs.length > 1).map(([m]) => m) : [];
  const count = markers.size + [...labs.values()].reduce((n, xs) => n + xs.length, 0);
  return { rows: list, meet: list.filter((r) => r.meet), cautions, markers, labs, all, shared, count };
}

// The sentence at the top: what the screen shows, in plain words
function headline(ids, f, sub) {
  const first = ids.map((id, i) => (i ? mid(shortOf(id)) : shortOf(id)));
  const inside = ids.map((id) => mid(shortOf(id)));
  if (topFinding(sub) === 'avoid') return `${listOf(first)}: Sig’s Synergy auditor says to avoid taking them together.`;
  if (ids.length === 1) {
    if (!drawn(ids[0])) return `How ${inside[0]} works in the body isn’t drawn yet. Here it is from its fact sheet.`;
    const places = f.rows.map((r) => r.at);
    return places.length > 1
      ? `${first[0]} works in ${places.length} places in the body, from ${placeSay(places[0])} to ${placeSay(places[places.length - 1])}.`
      : `${first[0]} works in one place in the body: ${placeSay(places[0])}.`;
  }
  if (!f.all) {
    const missing = ids.filter((id) => !drawn(id)).map((id) => mid(shortOf(id)));
    return `Where ${listOf(inside)} meet isn’t drawn yet: ${listOf(missing)} ${missing.length === 1 ? 'is' : 'are'} still to be added.`;
  }
  const where = f.meet.map((r) => placeSay(r.at));
  if (!where.length) return `${listOf(first)} work in different places in the body, with none in common.`;
  if (ids.length === 2) return where.length === 1 ? `${listOf(first)} meet in one place: ${where[0]}.` : `${listOf(first)} meet in ${where.length} places: ${listOf(where)}.`;
  return `Where they meet: ${listOf(f.meet.map((r) => `${placeSay(r.at)} (${listOf([...r.cells.keys()].map((id) => mid(shortOf(id))))})`))}.`;
}
// The last line of "together": where they meet, and the markers on more than one list
function sumLine(ids, f) {
  if (!f.all) return 'where they meet comes as each one is drawn';
  const one = ids.length === 2 ? 'both lists' : 'more than one list';
  const where = f.meet.length ? `they meet at ${listOf(f.meet.map((r) => placeSay(r.at)))}` : 'no place in the body is on both of their fact sheets';
  const mk = f.shared.length ? `${listOf(f.shared.map(markerName))} ${f.shared.length === 1 ? 'is' : 'are'} on ${one}` : `no blood marker is on ${one}`;
  return `${where}, and ${mk}`;
}

// ---------------------------------------------------------------------------
// The top: the command, the sentence, the checks
// ---------------------------------------------------------------------------
function cmdNode(ids) {
  return h('p', { class: 'sc-cmd', 'aria-hidden': 'true' }, h('span', { class: 'tk-prompt', text: '$' }), ' sig check ',
    ids.length ? ids.map((id, i) => [i ? ' + ' : '', colored(h('span', { class: 'tk-who', text: tokOf(id) }), colorOf(id))]) : h('span', { class: 'sc-caret' }));
}
function barNode(ids, sub) {
  const copy = h('button', { class: 'sc-btn line', type: 'button', 'data-key': 'bar-copy' }, h('span', { text: 'Copy for my clinician' }));
  copy.addEventListener('click', () => copyText(clinicianText(ids, S.f, sub), copy));
  const close = h('button', { class: 'sc-close', type: 'button', 'aria-label': 'Back to the chat', 'data-key': 'close' }, icon('M6 6l12 12M18 6 6 18', 20));
  close.addEventListener('click', () => S.onClose?.());
  const busy = sub.asking || S.checking;
  return h('div', { class: 'sc-bar' }, cmdNode(ids),
    busy ? h('span', { class: 'sc-busy', role: 'status' }, h('i', { 'aria-hidden': 'true' }), 'Sig is working') : null,
    h('div', { class: 'sc-acts' }, copy, close));
}
function chipsNode(ids, f, sub) {
  const chips = [];
  const add = (key, mark, text, tone = '') => chips.push(h('li', { class: `k-${key}` }, h('button', {
    class: `sc-chip${tone ? ` t-${tone}` : ''}`, type: 'button', 'data-key': `chip:${key}`, onclick: () => jump(key),
  }, mark ? h('span', { class: 'sc-chip-mark', 'aria-hidden': 'true', text: mark }) : null, text)));
  const sheets = ids.filter((id) => item(id).sheet).length;
  add('code', sheets === ids.length ? '✓' : '○', ids.length === 1 ? (sheets ? 'Fact sheet' : 'No fact sheet yet') : plural(sheets, 'fact sheet'));
  if (ids.length > 1) {
    const st = stackSig(ids);
    const n = Number(st?.first_hand) || 0;
    add('community', n ? '✓' : '○', n ? `${plural(n, 'report')} together` : st ? 'Forum data together' : '0 reports together');
  }
  const top = topFinding(sub);
  if (S.checking && sub.ok == null) add('check', '…', 'Checking together', 'busy');
  else if (sub.ok === false) add('check', '○', 'Couldn’t check just now');
  else if (top === 'avoid') add('check', '✕', 'Auditor: avoid together', 'avoid');
  else if (top === 'caution') add('check', '!', 'Auditor: caution', 'caution');
  else if (sub.ok) add('check', '✓', ids.length > 1 ? 'No clash found' : 'Checked for you');
  else if (sub.asked) add('check', '○', 'Check comes with the answer');
  else if (ids.length > 1) add('check', '○', 'Not checked together');
  if (f.cautions.length) add('caution', '!', plural(f.cautions.length, 'caution'), 'warn');
  if (f.count) add('markers', '', plural(f.count, 'marker'));
  if (ids.length > 1 && f.all) add('meet', '∩', f.meet.length ? `Meet: ${f.meet.map((r) => r.at).join(', ')}` : 'No place in common', f.meet.length ? 'meet' : '');
  return h('ul', { class: 'sc-chips', 'aria-label': 'At a glance' }, chips);
}
function headNode(ids, f, sub) {
  return h('div', { class: 'sc-head' }, h('h2', { class: 'sc-headline', id: 'sc-title', text: headline(ids, f, sub) }), chipsNode(ids, f, sub));
}

// ---------------------------------------------------------------------------
// How they work, written like code
// ---------------------------------------------------------------------------
const srcLink = (id, src) => h('a', { class: 'tk-cmt', href: `/library/${id}/#src-${src[0]}`, 'aria-label': `Source${src.length > 1 ? 's' : ''} ${src.join(', ')} on the fact sheet`, text: `// [${src.join(', ')}]` });
function mkChip(m, d, id) {
  const [g, say] = DIR[d] || DIR.watch;
  return colored(h('button', {
    class: `tk-mk d-${d in DIR ? d : 'watch'}`, type: 'button', 'data-mk': m, 'data-key': `mk:${m}:${id}`, 'aria-pressed': 'false',
    'aria-label': `${markerName(m)}: ${say}. Show what it is`,
  }, markerName(m), h('span', { class: 'tk-dir', 'aria-hidden': 'true', text: g })), colorOf(id));
}
// One compound's lines at one place
function cellNode(id, lines) {
  const cell = colored(h('div', { class: 'sc-cell', role: 'cell' }), colorOf(id));
  const dirs = S.body.compounds?.[id]?.dirs || {};
  for (const ln of lines) {
    const op = ln.op in OP ? ln.op : 'is';
    const [glyph, verb] = OP[op];
    const markers = (ln.markers || []).filter((m) => S.body.markers?.[m]);
    cell.append(h('div', { class: `sc-ln op-${op}` },
      h('span', { class: 'sc-who', text: tokOf(id) }),
      h('span', { class: 'tk-tree', 'aria-hidden': 'true', text: `${glyph} ` }),
      h('span', { class: 'sr', text: `${verb}: ` }),
      h('span', { class: 'tk-say', text: ln.say }),
      (ln.src || []).length ? [' ', srcLink(id, ln.src)] : null,
      markers.length ? h('span', { class: 'sc-mks' }, markers.map((m) => mkChip(m, dirs[m] || 'watch', id))) : null));
  }
  return cell;
}
// "together": every place any of them works, head to toe, one column each
function togetherNode(ids, f, animate) {
  const grid = h('div', { class: `sc-grid${ids.length > 3 ? ' many' : ''}`, role: 'table', 'aria-label': `How ${listOf(ids.map(nameOf))} work in the body, place by place, head to toe` });
  grid.style.setProperty('--n', String(ids.length));
  const num = (x = '') => h('span', { class: 'ln', 'aria-hidden': 'true', text: x });
  grid.append(h('div', { class: 'sc-tr sc-th', role: 'row' }, num(), h('span', { class: 'sc-place', role: 'columnheader', text: 'place' }),
    ids.map((id) => {
      const b = S.body.compounds?.[id];
      const it = item(id);
      return colored(h('span', { class: 'sc-cell', role: 'columnheader' },
        it.sheet ? h('a', { class: 'tk-name', href: `/library/${id}/`, text: codeOf(id) }) : h('b', { class: 'tk-name', text: codeOf(id) }),
        b?.route ? h('span', { class: 'tk-route', text: ` · ${b.route}` }) : null,
        it.grade ? h('span', { class: 'tk-grade', text: ` // ${gradeSay(it.grade)}` }) : null), colorOf(id));
    })));
  // A compound not drawn yet: its fact sheet in short, on a row of its own at the top
  const rows = [...ids.filter((id) => !drawn(id)).map((id) => ({ at: 'what it is', cells: new Map([[id, linesOf(id)]]), meet: false, warn: false, watch: false, markers: [] })), ...f.rows];
  const matters = (r) => r.meet || r.warn;
  const fold = rows.some(matters) && rows.some((r) => !matters(r));
  let n = 0;
  for (const r of rows) {
    n += 1;
    const tr = h('div', {
      class: `sc-tr${r.meet ? ' meet' : ''}${r.warn ? ' warn' : ''}${r.watch ? ' watch' : ''}${matters(r) ? '' : ' other'}`, role: 'row', 'data-mk': r.markers.join(' '),
    }, num(pad(n)),
    h('span', { class: 'sc-place', role: 'rowheader' }, r.at,
      r.meet ? h('span', { class: 'tk-meet' }, h('span', { 'aria-hidden': 'true', text: ' ∩' }), h('span', { class: 'tk-meet-say', text: ' where they meet' })) : null),
    ids.map((id) => cellNode(id, r.cells.get(id) || [])));
    if (animate) tr.style.setProperty('--i', String(n));
    grid.append(tr);
  }
  n += 1;
  const sum = h('div', { class: 'sc-tr sc-sum', role: 'row' }, num(pad(n)), h('span', { class: 'tk-cmt', role: 'cell', text: `// ${sumLine(ids, f)}` }));
  if (animate) sum.style.setProperty('--i', String(n));
  grid.append(sum);
  const box = h('div', { class: `sc-code${fold && !S.all ? ' folded' : ''}${animate ? ' typing' : ''}` }, grid, h('div', { class: 'sc-map', 'aria-hidden': 'true' }));
  if (fold) {
    const more = h('button', { class: 'sc-more', type: 'button', 'data-key': 'more', 'aria-expanded': String(S.all) },
      S.all ? 'Show just the rows that matter' : `Show all ${plural(rows.length, 'place')}`);
    more.addEventListener('click', () => { S.all = !S.all; redraw('code'); });
    box.append(more);
  }
  return box;
}
// One compound on its own: its lines in the order its fact sheet tells them
function fileNode(id, animate) {
  const it = item(id);
  const b = S.body.compounds?.[id];
  const box = h('div', { class: `sc-code sc-one${animate ? ' typing' : ''}`, role: 'list', 'aria-label': `How ${nameOf(id)} works in the body` });
  let n = 0;
  const row = (cls, ...kids) => {
    n += 1;
    const r = colored(h('div', { class: `cl ${cls}`, role: 'listitem' }, h('span', { class: 'ln', 'aria-hidden': 'true', text: pad(n) }), h('span', { class: 'cx' }, ...kids)), colorOf(id));
    if (animate) r.style.setProperty('--i', String(n));
    box.append(r);
    return r;
  };
  row('head', it.sheet ? h('a', { class: 'tk-name', href: `/library/${id}/`, text: codeOf(id) }) : h('b', { class: 'tk-name', text: codeOf(id) }),
    b?.route ? h('span', { class: 'tk-route', text: ` · ${b.route}` }) : null,
    it.sheet ? h('a', { class: 'tk-cmt', href: `/library/${id}/`, text: ' // fact sheet' }) : h('span', { class: 'tk-cmt', text: ' // no fact sheet yet' }));
  if (it.status_label) row('cmt', h('span', { class: 'tk-cmt', text: `// ${clean(it.status_label, 140)}` }));
  if (it.grade) row('cmt', h('span', { class: 'tk-cmt', text: `// evidence: ${gradeSay(it.grade)}` }));
  const lines = linesOf(id);
  const dirs = b?.dirs || {};
  lines.forEach((ln, j) => {
    const op = ln.op in OP ? ln.op : 'is';
    const [glyph, verb] = OP[op];
    const markers = (ln.markers || []).filter((m) => S.body.markers?.[m]);
    const r = row(`op-${op}`, h('span', { class: 'tk-tree', 'aria-hidden': 'true', text: `${j === lines.length - 1 ? '└' : '├'}${glyph} ` }),
      h('span', { class: 'sr', text: `${verb}: ` }), h('span', { class: 'tk-at', text: ln.at }), ' ', h('span', { class: 'tk-say', text: ln.say }),
      (ln.src || []).length ? [' ', srcLink(id, ln.src)] : null,
      markers.length ? [' ', h('span', { class: 'sc-mks' }, markers.map((m) => mkChip(m, dirs[m] || 'watch', id)))] : null);
    r.dataset.mk = markers.join(' ');
  });
  if (animate) box.append(h('span', { class: 'sc-caret', 'aria-hidden': 'true' }));
  return box;
}
function codeSection(ids, f, animate) {
  const many = ids.length > 1;
  if (!many) S.file = ids[0];
  else if (S.file !== 'together' && !ids.includes(S.file)) S.file = 'together';
  const tabs = many ? h('div', { class: 'sc-files', role: 'group', 'aria-label': 'Together, or one at a time' },
    [['together', 'together', 'var(--lime)'], ...ids.map((id) => [id, tokOf(id), colorOf(id)])].map(([k, label, c]) => colored(h('button', {
      class: 'sc-file', type: 'button', 'aria-pressed': String(S.file === k), 'data-key': `file:${k}`,
      onclick: () => { if (S.file !== k) { S.file = k; redraw('code'); } },
    }, h('i', { 'aria-hidden': 'true' }), label), c)),
    S.file === 'together' ? h('span', { class: 'sc-files-note', text: 'by place, head to toe' }) : null) : null;
  return h('section', { class: 'sc-codebox', 'aria-labelledby': 'sc-code-h' },
    h('h3', { class: 'sr', id: 'sc-code-h', text: many ? 'How they work in the body' : 'How it works in the body' }),
    tabs, S.file === 'together' ? togetherNode(ids, f, animate) : fileNode(S.file, animate),
    h('p', { class: 'mk-def', 'data-at': 'code', 'aria-live': 'polite', hidden: true }));
}

// A marker picked: what it is, and the lines that move it light up
function pickMarker(m, from) {
  S.marker = S.marker === m ? '' : m;
  S.markerFrom = from;
  // Its row may be folded away on a phone: then show them all
  if (S.marker && narrow.matches && !S.all && S.root?.querySelector(`.sc-code.folded .sc-tr.other[data-mk~="${CSS.escape(S.marker)}"]`)) {
    S.all = true;
    redraw('code');
    return;
  }
  applyMarker();
}
function applyMarker() {
  const root = S.root;
  if (!root) return;
  root.querySelectorAll('button[data-mk]').forEach((b) => {
    const on = b.dataset.mk === S.marker;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  root.querySelectorAll('.sc-tr[data-mk], .cl[data-mk]').forEach((l) => l.classList.toggle('lit', !!S.marker && l.dataset.mk.split(' ').includes(S.marker)));
  const mk = S.body.markers?.[S.marker];
  const who = (S.subject?.ids || []).filter((id) => S.body.compounds?.[id]?.dirs?.[S.marker]);
  root.querySelectorAll('.mk-def').forEach((def) => {
    if (!mk || def.dataset.at !== S.markerFrom) { def.replaceChildren(); def.hidden = true; return; }
    def.hidden = false;
    def.replaceChildren(h('b', { text: mk.name }), ` ${mk.what} `,
      who.length ? h('span', { class: 'mk-from', text: `${cap(who.map((id) => `${(DIR[S.body.compounds[id].dirs[S.marker]] || DIR.watch)[1]} with ${mid(shortOf(id))}`).join('; '))}.` }) : null);
  });
}

// ---------------------------------------------------------------------------
// The panels: the community, the check, the markers, the log
// ---------------------------------------------------------------------------
function seal(sig) {
  const lvl = sig.certification || 'forum';
  return fromKit(signalHtml(sig.score, { seal: sealSvg(lvl, 18), level: sig.summary_label || '' }));
}
const FROM = (sig) => (Number(sig.first_hand) > 0 ? `${plural(Number(sig.first_hand), 'first-hand report')} from members, with public forum data` : 'from the public forums so far');
const themesOf = (sig) => (sig.themes || []).slice(0, 4).map((t) => `${lower(clean(t.theme, 60))} (${clean(t.label, 30).toLowerCase()})`);
function communityNode(ids) {
  const box = h('div', { class: 'sc-cm' }, h('h3', { class: 'sr', text: 'What the community reports' }));
  if (!S.snap) {
    box.append(h('p', { class: 'cm-none', text: 'The community’s numbers couldn’t be loaded just now.' }));
    return box;
  }
  const rows = [];
  const row = (label, color, ...kids) => rows.push(colored(h('dt', { class: 'cm-k', text: label }), color), h('dd', { class: 'cm-v' }, ...kids));
  if (ids.length > 1) {
    const st = stackSig(ids);
    const th = st ? themesOf(st) : [];
    row('together', 'var(--lime)', ...(st
      ? [h('p', { class: 'cm-main' }, seal(st), ` ${st.summary_label || 'Community Signal'}, ${FROM(st)}.`), th.length ? h('p', { class: 'cm-what', text: `What members describe most: ${th.join(', ')}.` }) : null]
      : [h('p', { class: 'cm-main', text: 'No first-hand reports of taking them together yet.' }),
        h('a', { class: 'cm-first', href: draftLink(ids, { title: `How ${listOf(ids.map(nameOf))} went for me`, body: '' }), target: '_blank', rel: 'noopener', text: 'Taken them together? Add the first report' })]));
  }
  for (const id of ids) {
    const sig = sigOf(id);
    const th = sig ? themesOf(sig) : [];
    row(tokOf(id), colorOf(id), ...(sig
      ? [h('p', { class: 'cm-main' }, seal(sig), ` Community Signal, ${lower(sig.summary_label || '')}, ${FROM(sig)}.`), th.length ? h('p', { class: 'cm-what', text: `People describe ${th.join(', ')}.` }) : null]
      : [h('p', { class: 'cm-what', text: 'No Community Signal yet: no member reports, and the public forums haven’t been read for it.' })]));
  }
  box.append(h('dl', { class: 'cm-rows' }, rows), h('p', { class: 'sc-small', text: 'What people report is experience, not evidence, and never a reason to take something.' }));
  return box;
}
function checkNode(sub) {
  const box = h('div', { class: 'sc-ck' }, h('h3', { class: 'sr', text: sub.ids.length > 1 ? 'Checked together' : 'Checked for you' }));
  const findings = (sub.findings || []).filter((f) => f && LEVEL[f.level] && f.note).sort((a, b) => RANK[b.level] - RANK[a.level]);
  if (S.checking && sub.ok == null) box.append(h('p', { class: 'ck-busy', text: 'Sig’s Synergy auditor is checking them now…' }));
  else if (sub.ok === false) box.append(h('p', { class: 'ck-none', text: 'The Synergy auditor couldn’t check these just now.' }));
  else if (sub.ok && findings.length) {
    box.append(h('ul', { class: 'ck-list' }, findings.map((f) => h('li', { class: `lvl-${f.level}` },
      h('span', { class: `ck-pill lvl-${f.level}`, text: LEVEL[f.level] }),
      h('span', {}, h('b', { text: (f.names?.length ? f.names : (f.ids || []).map(nameOf)).join(' + ') }), h('span', { text: ` ${clean(f.note, 240)}` }))))));
  } else if (sub.ok) box.append(h('p', { class: 'ck-none', text: 'No known clash in the data. That’s an absence of data, not a green light.' }));
  else if (sub.asked) box.append(h('p', { class: 'ck-none', text: 'Sig asked you a few questions first. The check comes with its answer, with your medicines and conditions in it.' }));
  else box.append(h('p', { class: 'ck-none', text: 'Not checked together yet. Ask Sig about taking them together, and its Synergy auditor checks them with your medicines and conditions.' }));
  if (sub.meds?.length) box.append(h('p', { class: 'sc-small', text: `Checked with what you told Sig you take: ${sub.meds.map((m) => clean(m, 40)).join(', ')}.` }));
  return box;
}
function markersNode(ids, f) {
  const box = h('div', { class: 'sc-mk' }, h('h3', { class: 'sr', text: 'Blood markers that may move' }));
  for (const id of ids) {
    const dirs = Object.entries(S.body.compounds?.[id]?.dirs || {}).filter(([m]) => S.body.markers?.[m]);
    const chips = dirs.length
      ? dirs.map(([m, d]) => h('li', {}, h('button', { class: `mk d-${d in DIR ? d : 'watch'}`, type: 'button', 'data-mk': m, 'data-key': `mkp:${m}`, 'aria-pressed': 'false' },
        h('span', { class: 'mk-dir', 'aria-hidden': 'true', text: (DIR[d] || DIR.watch)[0] }), markerName(m), h('span', { class: 'sr', text: `, ${(DIR[d] || DIR.watch)[1]}` }))))
      : (f.labs.get(id) || []).map((x) => h('li', {}, h('span', { class: 'mk plain', text: x })));
    box.append(colored(h('div', { class: 'mk-group' },
      h('p', { class: 'mk-who' }, h('i', { 'aria-hidden': 'true' }), nameOf(id), h('span', { text: chips.length ? ' · its fact sheet lists these to check' : ' · no lab list on its fact sheet yet' })),
      chips.length ? h('ul', { class: 'mk-list' }, chips) : null), colorOf(id)));
  }
  box.append(h('p', { class: 'mk-def', 'data-at': 'panel', 'aria-live': 'polite', hidden: true }),
    h('p', { class: 'sc-small', text: '▲ may rise · ◆ worth checking. Your clinician decides what to test, and when.' }));
  return box;
}
function logNode(sub) {
  const box = h('div', { class: 'sc-lg' }, h('h3', { class: 'sr', text: 'What Sig’s agents did' }));
  const steps = (sub.log || []).filter((s) => s && s.title && s.agent !== 'clinician');
  if (!steps.length) {
    box.append(h('p', { class: 'ck-none', text: 'What each of Sig’s agents did shows here once it has answered.' }));
    return box;
  }
  const flagged = (s) => s.flag && s.flag !== 'none';
  box.append(h('ol', { class: 'lg-list' }, steps.map((s) => h('li', { class: flagged(s) ? 'flag' : '' },
    h('span', { class: 'lg-mark', 'aria-hidden': 'true', text: flagged(s) ? '!' : '✓' }),
    h('span', {}, h('b', { text: AGENT[s.agent] || clean(s.agent, 30) }), ` ${clean(s.title, 180)}`)))));
  if (sub.ms) box.append(h('p', { class: 'sc-small', text: `${(sub.ms / 1000).toFixed(1)} seconds from your message to the checked answer.` }));
  return box;
}
const PANELS = [['community', 'Community'], ['check', 'Check'], ['markers', 'Markers'], ['log', 'Log']];
function panelsNode(ids, f, sub) {
  if (!S.panel) S.panel = ['avoid', 'caution'].includes(topFinding(sub)) ? 'check' : 'community';
  const cur = S.panel;
  const tabs = h('div', { class: 'sc-ptabs', role: 'group', 'aria-label': 'Details' }, PANELS.map(([k, label]) => h('button', {
    class: 'sc-ptab', type: 'button', 'aria-pressed': String(cur === k), 'data-key': `panel:${k}`,
    onclick: () => { if (S.panel !== k) { S.panel = k; redraw('panels'); } },
  }, label, k === 'markers' && f.count ? h('span', { class: 'n', text: ` ${f.count}` }) : null)));
  const body = cur === 'check' ? checkNode(sub) : cur === 'markers' ? markersNode(ids, f) : cur === 'log' ? logNode(sub) : communityNode(ids);
  return h('section', { class: 'sc-panels', 'aria-label': 'Details' }, tabs, h('div', { class: 'sc-panel' }, body));
}

// ---------------------------------------------------------------------------
// What to take to a clinician
// ---------------------------------------------------------------------------
function questions(ids, f, sub) {
  const qs = [];
  const tests = [];
  for (const id of ids) {
    const ups = Object.entries(S.body.compounds?.[id]?.dirs || {}).filter(([m, d]) => d === 'up' && S.body.markers?.[m]).map(([m]) => markerName(m));
    tests.push(...(ups.length ? ups.slice(0, 3) : (f.labs.get(id) || []).slice(0, 2)));
  }
  const t = [...new Set(tests)].slice(0, 7).map(mid);
  qs.push(t.length ? `Which baseline tests make sense for me, such as ${listOf(t)}?` : 'Which baseline tests make sense for me?');
  const risks = ids.map((id) => {
    const rs = (S.body.compounds?.[id]?.lines || []).filter((l) => l.op === 'warn').map((l) => clean(l.risk || l.say, 60));
    return rs.length ? `${mid(shortOf(id))}’s ${listOf(rs)}` : '';
  }).filter(Boolean);
  if (risks.length === 1) qs.push(`How would we weigh ${risks[0]} for me?`);
  else if (risks.length > 1) qs.push(`How would we weigh ${risks.slice(0, -1).join(', ')}, and ${risks[risks.length - 1]}, for me?`);
  const top = topFinding(sub);
  if (top === 'avoid') qs.push('Sig’s Synergy auditor says to avoid taking these together. Does that apply to me?');
  else if (top === 'caution') qs.push('Sig’s Synergy auditor found a caution for taking these together. Does it apply to me?');
  if (ids.some((id) => UNAPPROVED.has(item(id).status))) qs.push('Is there an approved option for what I’m hoping to address?');
  return qs;
}
function clinicianText(ids, f, sub) {
  if (!f) return '';
  const L = [headline(ids, f, sub), ''];
  for (const id of ids) {
    const it = item(id);
    L.push(`${nameOf(id)}: ${[it.status_label ? clean(it.status_label, 140) : '', it.grade ? `evidence: ${gradeSay(it.grade)}` : ''].filter(Boolean).join('. ') || 'no fact sheet yet'}.`);
  }
  L.push('', 'How they work in the body, from the Miracle Health Library’s fact sheets (source numbers in brackets):');
  for (const id of ids) if (!drawn(id)) L.push(`- ${nameOf(id)}: ${linesOf(id)[0].say}`);
  for (const r of f.rows) {
    for (const [id, lines] of r.cells) {
      for (const ln of lines) L.push(`- ${r.at}, ${nameOf(id)}: ${ln.op === 'warn' ? 'caution, ' : ''}${ln.say}${(ln.src || []).length ? ` [${ln.src.join(', ')}]` : ''}`);
    }
  }
  if (ids.length > 1) L.push(`${cap(sumLine(ids, f))}.`);
  L.push('', 'Blood markers their fact sheets list:');
  for (const id of ids) {
    const dirs = Object.entries(S.body.compounds?.[id]?.dirs || {}).filter(([m]) => S.body.markers?.[m]);
    const xs = dirs.length ? dirs.map(([m, d]) => `${markerName(m)} (${(DIR[d] || DIR.watch)[1]})`) : (f.labs.get(id) || []);
    if (xs.length) L.push(`- ${nameOf(id)}: ${xs.join(', ')}`);
  }
  const findings = (sub.findings || []).filter((x) => x && LEVEL[x.level] && x.note);
  L.push('', `Checked by Sig’s Synergy auditor: ${sub.ok === true
    ? (findings.length ? findings.map((x) => `${LEVEL[x.level]}: ${clean(x.note, 240)}`).join(' ') : 'no known clash in the data (an absence of data, not a green light).')
    : 'not checked together yet.'}`);
  const st = ids.length > 1 ? stackSig(ids) : null;
  const cm = [];
  if (ids.length > 1) cm.push(st ? `Together: Community Signal ${st.score}, ${lower(st.summary_label || '')}, ${FROM(st)}.` : 'Together: no first-hand reports yet.');
  for (const id of ids) {
    const sig = sigOf(id);
    cm.push(sig ? `${nameOf(id)}: Community Signal ${sig.score}, ${lower(sig.summary_label || '')}, ${FROM(sig)}.` : `${nameOf(id)}: no Community Signal yet.`);
  }
  L.push('', 'What the community reports (experience, not evidence):', ...cm.map((x) => `- ${x}`));
  L.push('', 'Questions for my clinician:', ...questions(ids, f, sub).map((q) => `- ${q}`));
  L.push('', `From Ask Sig at miraclehealth.us/ai, ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Education, not medical advice: no doses. My clinician decides.`);
  return L.join('\n');
}
async function copyText(text, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = h('textarea', { class: 'sr', 'aria-hidden': 'true' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
  }
  const label = btn?.querySelector('span');
  if (!label) return;
  const was = label.textContent;
  label.textContent = ok ? 'Copied' : 'Couldn’t copy';
  btn.classList.add('done');
  setTimeout(() => { label.textContent = was; btn.classList.remove('done'); }, 1800);
}
const stackItems = (ids) => ids.map((id) => ({ id, name: nameOf(id), status: clean(item(id).status_label, 80), grade: item(id).grade || '' }));
function clinicianNode(ids, f, sub) {
  const qs = questions(ids, f, sub);
  const copy = h('button', { class: 'sc-btn lime', type: 'button', 'data-key': 'clin-copy' }, h('span', { text: 'Copy' }));
  copy.addEventListener('click', () => copyText(clinicianText(ids, f, sub), copy));
  const acts = h('div', { class: 'clin-acts' }, copy);
  if (S.onSave) {
    const saved = !!S.isSaved?.(stackItems(ids), sub.meds || []);
    const save = h('button', { class: 'sc-btn ghost', type: 'button', 'data-key': 'clin-save' }, h('span', { text: saved ? 'Saved to My Miracle' : 'Save to My Miracle' }));
    save.addEventListener('click', () => {
      const ok = S.onSave(stackItems(ids), sub.meds || []);
      save.querySelector('span').textContent = ok ? 'Saved to My Miracle' : 'This browser isn’t keeping anything';
      if (ok && !acts.querySelector('.clin-open')) acts.append(h('a', { class: 'sc-btn ghost clin-open', href: '/my/', text: 'Open My Miracle' }));
    });
    acts.append(save);
    if (saved) acts.append(h('a', { class: 'sc-btn ghost clin-open', href: '/my/', text: 'Open My Miracle' }));
  }
  return h('section', { class: 'sc-clin', 'aria-labelledby': 'sc-clin-h' },
    h('div', { class: 'clin-top' }, h('h3', { id: 'sc-clin-h', text: 'Take this to your clinician' }), acts),
    h('ul', { class: 'clin-qs' }, qs.map((q) => h('li', { text: q }))),
    h('p', { class: 'sc-small', text: `Copy brings these questions with ${f.count ? `the ${plural(f.count, 'blood marker')}, ` : ''}each line’s source and the checks. My Miracle keeps the stack on this device only. Nothing here reads your own results.` }));
}

// What Sig's agents did, in one line, as a build log ends
function buildLine(sub) {
  const steps = sub.log || [];
  if (!steps.length) return null;
  const bits = [];
  const flagged = (s) => s && s.flag && s.flag !== 'none';
  const safety = steps.find((s) => s.agent === 'safety');
  if (safety) bits.push(flagged(safety) ? '! safety screen' : '✓ safety screen');
  if (sub.src?.studies?.sheets) bits.push(`✓ ${plural(Number(sub.src.studies.sheets), 'fact sheet')}`);
  if (sub.src?.community?.signals) bits.push(`✓ ${plural(Number(sub.src.community.signals), 'Community Signal')}${sub.src.community.forum ? ', forum data' : ''}`);
  else if (steps.some((s) => s.agent === 'community')) bits.push('✓ community read');
  const syn = steps.find((s) => s.agent === 'synergy');
  if (syn) {
    const m = /(\d+) pairs? checked/i.exec(syn.title || '');
    bits.push(`✓ auditor${m ? `: ${plural(Number(m[1]), 'pair')}` : ''}${/no known clash/i.test(syn.title || '') ? ', no clash' : ''}`);
  }
  const rv = steps.find((s) => s.agent === 'review');
  if (rv) {
    const e = /edited (\d+)/i.exec(rv.title || '');
    bits.push(`✓ checked before you saw it${e ? `, ${plural(Number(e[1]), 'part')} edited` : ''}`);
  }
  if (sub.ms) bits.push(`${(sub.ms / 1000).toFixed(1)} s`);
  return h('p', { class: 'sc-build' }, h('span', { class: 'sr', text: 'What Sig’s agents did: ' }), bits.map((b) => h('span', { text: b })));
}

// ---------------------------------------------------------------------------
// The whole screen, and the bar that says what's on it on a phone
// ---------------------------------------------------------------------------
function emptyNode() {
  const go = h('button', { class: 'sc-btn lime sc-example', type: 'button', 'data-key': 'example', text: `Try it: ${EXAMPLE.label}` });
  go.addEventListener('click', () => {
    show({ ids: EXAMPLE.ids, ok: null, findings: [], asking: true });
    S.onAsk?.(EXAMPLE.ask);
  });
  const ghost = h('div', { class: 'sc-ghost', 'aria-hidden': 'true' },
    ...['place          hgh                         enclomiphene', 'hypothalamus                               ─┤ blocks estrogen’s feedback', 'pituitary ∩    ─▶ the hormone, from outside  ─▲ LH and FSH rise', 'liver          ─▲ IGF-1 rises', 'testes                                     ─▲ testosterone rises']
      .map((t, i) => h('div', { class: 'cl' }, h('span', { class: 'ln', text: i ? pad(i) : '' }), h('span', { class: 'cx', text: t }))));
  return h('div', { class: 'sc-empty' },
    h('div', { class: 'sc-bar' }, cmdNode([])),
    h('div', { class: 'sc-head' },
      h('h2', { class: 'sc-headline', text: 'See what Sig is talking about' }),
      h('p', { class: 'sc-lede', text: 'Ask about a compound or a combination. The screen lines up where each one works in the body, head to toe, which blood markers may move, and what the community reports.' })),
    ghost, h('div', { class: 'sc-go' }, go));
}
// Keep the keyboard where it was when a part is drawn again
const focusKey = () => { const a = document.activeElement; return a && S.root?.contains(a) ? a.dataset?.key || '' : ''; };
const refocus = (key) => { if (key) S.root?.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus({ preventScroll: true }); };
function draw(fresh) {
  const root = S.root;
  if (!root) return;
  const sub = S.subject;
  if (!sub || !sub.ids?.length) {
    S.f = null;
    root.replaceChildren(emptyNode());
    root.classList.add('is-empty');
    drawPeek(false);
    return;
  }
  root.classList.remove('is-empty');
  const ids = sub.ids;
  // Until the Library and the pathways have loaded, just say what's coming
  if (!S.loaded) {
    S.pending = S.pending || fresh;
    root.replaceChildren(h('div', { class: 'sc-empty' }, h('div', { class: 'sc-bar' }, cmdNode(ids)), h('p', { class: 'sc-lede sc-wait', text: 'Drawing it…' })));
    return;
  }
  const key = ids.join('+');
  const isNew = fresh && key !== S.seen;
  const animate = isNew && !motionOff();
  if (fresh) S.seen = key;
  if (isNew) { S.file = ''; S.panel = ''; S.all = false; }
  if (S.marker && !ids.some((id) => S.body.compounds?.[id]?.dirs?.[S.marker])) S.marker = '';
  const was = focusKey();
  S.f = facts(ids);
  root.replaceChildren(
    h('span', { class: 'sc-handle', 'aria-hidden': 'true' }),
    barNode(ids, sub), headNode(ids, S.f, sub), codeSection(ids, S.f, animate),
    panelsNode(ids, S.f, sub), clinicianNode(ids, S.f, sub), buildLine(sub),
    h('p', { class: 'sc-fine', text: 'From the Library’s fact sheets, each line with its source, and the community’s public totals. Education, not medical advice: no doses, and your clinician has the final say.' }));
  applyMarker();
  refocus(was);
  minimap();
  drawPeek(isNew);
}
function redraw(part) {
  const root = S.root;
  const sub = S.subject;
  if (!root || !sub || !S.f) return;
  const was = focusKey();
  if (part === 'code') root.querySelector('.sc-codebox')?.replaceWith(codeSection(sub.ids, S.f, false));
  if (part === 'panels') root.querySelector('.sc-panels')?.replaceWith(panelsNode(sub.ids, S.f, sub));
  applyMarker();
  refocus(was);
  minimap();
}
// A chip at the top: to its part, which flashes once to say "here"
function jump(where) {
  const root = S.root;
  const sub = S.subject;
  if (!root || !sub) return;
  let target = null;
  if (where === 'community' || where === 'check' || where === 'markers') {
    if (S.panel !== where) { S.panel = where; redraw('panels'); }
    target = root.querySelector('.sc-panels');
  } else {
    if ((where === 'meet' || where === 'caution') && sub.ids.length > 1 && S.file !== 'together') { S.file = 'together'; redraw('code'); }
    target = (where === 'meet' && root.querySelector('.sc-tr.meet')) || (where === 'caution' && root.querySelector('.sc-tr.warn, .cl.op-warn')) || root.querySelector('.sc-codebox');
  }
  if (!target) return;
  target.scrollIntoView({ block: target.matches('.sc-tr, .cl') ? 'center' : 'start', behavior: motionOff() ? 'auto' : 'smooth' });
  target.classList.remove('flash');
  void target.offsetWidth;
  target.classList.add('flash');
}
// The strip beside "together": where they meet, what to check and the cautions, at a glance
let mapWatch = null;
function minimap() {
  const box = S.root?.querySelector('.sc-code');
  const map = box?.querySelector('.sc-map');
  const grid = box?.querySelector('.sc-grid');
  mapWatch?.disconnect();
  if (!map || !grid) return;
  const place = () => {
    const H = grid.offsetHeight;
    if (!H) return;
    map.style.top = `${grid.offsetTop}px`;
    map.style.height = `${H}px`;
    map.replaceChildren(...[...grid.querySelectorAll('.sc-tr.meet, .sc-tr.warn, .sc-tr.watch')].filter((r) => r.offsetHeight).map((r) => {
      const t = h('i', { class: r.classList.contains('meet') ? 'm-meet' : r.classList.contains('warn') ? 'm-warn' : 'm-watch' });
      t.style.top = `${(r.offsetTop / H) * 100}%`;
      t.style.height = `${Math.max(1.5, (r.offsetHeight / H) * 100)}%`;
      return t;
    }));
  };
  requestAnimationFrame(place);
  if ('ResizeObserver' in window) { mapWatch = new ResizeObserver(place); mapWatch.observe(grid); }
}
// On a phone: the bar above the box to write in, with what's on the screen; a tap or a swipe up opens it
function drawPeek(isNew) {
  const host = S.peek;
  if (!host) return;
  const sub = S.subject;
  const f = S.f;
  if (!sub?.ids?.length || !f) { host.replaceChildren(); host.hidden = true; return; }
  const ids = sub.ids;
  const chips = [];
  const top = topFinding(sub);
  if (ids.length > 1 && f.all) chips.push(['meet', '∩', f.meet.length ? f.meet.map((r) => r.at).join(', ') : 'no place in common']);
  if (top === 'avoid') chips.push(['avoid', '✕', 'avoid together']);
  else if (top === 'caution') chips.push(['caution', '!', 'auditor: caution']);
  if (f.cautions.length) chips.push(['warn', '!', plural(f.cautions.length, 'caution')]);
  if (f.count) chips.push(['', '', plural(f.count, 'marker')]);
  const btn = h('button', { class: `sc-peek${isNew && !motionOff() ? ' new' : ''}`, type: 'button', 'aria-label': `Open the screen. ${headline(ids, f, sub)}` },
    h('span', { class: 'pk-grip', 'aria-hidden': 'true' }),
    h('span', { class: 'pk-top', 'aria-hidden': 'true' }, cmdNode(ids), h('span', { class: 'pk-hint', text: coarse ? 'Swipe up' : 'Open' })),
    chips.length ? h('span', { class: 'pk-chips', 'aria-hidden': 'true' }, chips.map(([tone, mark, text]) => h('span', { class: `pk-chip${tone ? ` t-${tone}` : ''}` }, mark ? h('span', { class: 'pk-mark', text: mark }) : null, text))) : null);
  btn.addEventListener('click', () => S.onOpen?.());
  let y0 = null;
  btn.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  btn.addEventListener('touchmove', (e) => { if (y0 != null && y0 - e.touches[0].clientY > 24) { y0 = null; S.onOpen?.(); } }, { passive: true });
  host.replaceChildren(btn);
  host.hidden = false;
}

// What the chat is about: shown at once; the same subject again only refreshes what's known
function show(sub) {
  const ids = [...new Set((sub?.ids || []).filter(okId))].slice(0, 6);
  if (!ids.length) return;
  const prev = S.subject;
  const same = prev && prev.ids.join('+') === ids.join('+');
  S.subject = {
    ids, findings: Array.isArray(sub.findings) ? sub.findings : [], ok: sub.ok === true ? true : sub.ok === false ? false : null,
    meds: Array.isArray(sub.meds) ? sub.meds : [], asked: !!sub.asked, asking: !!sub.asking, at: Number.isFinite(sub.at) ? sub.at : -1,
    log: Array.isArray(sub.log) ? sub.log.slice(0, 24) : [], ms: Number(sub.ms) || 0, src: sub.src && typeof sub.src === 'object' ? sub.src : null,
  };
  draw(!same);
  for (const fn of listeners) fn(S.subject, !same);
}
const listeners = new Set();
window.MHScreen = {
  mount(root) {
    S.root = root;
    // A marker picked anywhere on the screen, and a swipe down on a phone's sheet closes it
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-mk]');
      if (b && root.contains(b)) pickMarker(b.dataset.mk, b.closest('.sc-panels') ? 'panel' : 'code');
    });
    let y0 = null;
    root.addEventListener('touchstart', (e) => { y0 = e.target.closest('.sc-handle, .sc-bar') ? e.touches[0].clientY : null; }, { passive: true });
    root.addEventListener('touchmove', (e) => { if (y0 != null && e.touches[0].clientY - y0 > 70) { y0 = null; S.onClose?.(); } }, { passive: true });
    draw(false);
  },
  peek(host) { S.peek = host; drawPeek(false); },
  show,
  clear() { S.subject = null; S.f = null; S.seen = ''; S.marker = ''; S.checking = false; S.file = ''; S.panel = ''; S.all = false; draw(false); for (const fn of listeners) fn(null, true); },
  checking(on) { if (S.checking === !!on) return; S.checking = !!on; if (S.subject) draw(false); },
  onAsk(fn) { S.onAsk = fn; },
  onOpen(fn) { S.onOpen = fn; },
  onClose(fn) { S.onClose = fn; },
  onSave(save, isSaved) { S.onSave = save; S.isSaved = isSaved; if (S.subject) draw(false); },
  onChange(fn) { listeners.add(fn); },
  subject: () => S.subject,
  title: () => (S.subject ? S.subject.ids.map(nameOf).join(' + ') : ''),
  // In short, for the line under an answer: the sentence and the checks
  summary() {
    const sub = S.subject;
    if (!sub || !S.f) return null;
    return { headline: headline(sub.ids, S.f, sub), top: topFinding(sub), ok: sub.ok, cautions: S.f.cautions.length, markers: S.f.count, meet: S.f.meet.map((r) => r.at) };
  },
  ready,
};
