// The front page, in the Sig system: the prompt and the Library's graph (the hero), the Community
// Signal like top, Ask Sig's twelve agents in an example run, and the real compound in "Popular
// isn't the same as proven". What the studies show is published with the page, word for word from
// the compound's fact sheet (caveats included). What changes as reports come in is read here from the
// community's public files (totals only: no posts, no names): the Community Signal, what people
// report for each use and the placebo figures beside them. If the files can't load, the page keeps
// what it was published with.
import { sealSvg, levelOf } from '/library/signalviz.js?v=f388629295';
import { COMMUNITY, node, askLink, askAboutCompound } from '/kit/kit.js?v=34d9695824';
import { h, getJson, getSignal, calm, SIGNAL_URL } from '/lib/dom.js?v=cef2a56736';

const card = document.querySelector('[data-live="example"]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(m) || m < 0) return '';
  if (m < 2) return 'just now';
  if (m < 90) return `${m} minutes ago`;
  const hrs = Math.round(m / 60);
  return hrs < 36 ? `${hrs} hours ago` : `${Math.round(hrs / 24)} days ago`;
}
const bar = (value, cls) => node(`<svg class="vs-bar ${cls}" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true"><rect class="tr" width="100" height="6"/><rect class="fi" width="${clamp(value).toFixed(1)}" height="6"/></svg>`);

// What people report for one use: members' rating once there is one, otherwise how often the
// forums mention it
function reportCell(c) {
  const cu = c?.use;
  let said;
  if (cu?.rating != null) {
    said = [h('p', { class: 'vs-v' }, `Members rate it ${cu.rating} of 100`), bar(cu.rating, 'rate-bar'),
      h('p', { class: 'vs-sub' }, `${cu.low != null ? `Likely ${cu.low} to ${cu.high}, from` : 'From'} ${fmt(cu.reports)} first-hand reports`)];
  } else if (cu?.forum) {
    said = [h('p', { class: 'vs-v' }, `${cu.forum} on the forums`),
      h('p', { class: 'vs-sub' }, cu.reports ? `${fmt(cu.reports)} member report${cu.reports === 1 ? '' : 's'} so far; rated after 3` : 'No member ratings yet')];
  } else if (c?.near) {
    said = h('p', { class: 'vs-v' }, `Closest use reported: ${String(c.near.label).toLowerCase()}`);
  } else {
    said = h('p', { class: 'vs-v' }, 'Nothing reported yet');
  }
  return h('div', { class: 'vs-cell rep' }, h('p', { class: 'vs-lbl' }, 'What people report'), said);
}
// How many get better on a placebo, for that use (or the closest one, said so)
function placeboCell(c, use) {
  const b = c?.baseline;
  return h('div', { class: 'vs-cell pl' }, h('p', { class: 'vs-lbl' }, 'Got better on a placebo'),
    b?.pct != null
      ? [h('p', { class: 'vs-v' }, h('b', {}, `${b.pct}%`)), bar(b.pct, 'pl-bar'),
        h('p', { class: 'vs-sub' }, b.use !== use ? `For context, on ${String(c.near?.label || b.use).toLowerCase()}: ${b.says}` : b.says)]
      : h('p', { class: 'vs-sub' }, 'No placebo figures for this use yet'));
}

const animate = !!card && !reduceMotion && 'IntersectionObserver' in window;
let target = null;   // while the count-up hasn't played: the number it will count up to
const v = (k) => card.querySelector(`[data-v="${k}"]`);
function setScore(text) {
  if (animate && !card.classList.contains('on')) target = text; else v('score').textContent = text;
}
// The level's seal sits beside its name, so it's only a picture
function seal(key) {
  const s = node(sealSvg(key, 22));
  s.removeAttribute('role');
  s.removeAttribute('aria-label');
  s.setAttribute('aria-hidden', 'true');
  return s;
}

function update(ev, snap) {
  const id = card.dataset.id;
  if (ev && ev.id === id) {
    if (ev.status?.label) v('status').textContent = ev.status.label;
    for (const u of ev.uses || []) {
      const row = u?.use && card.querySelector(`.vs-row[data-use="${CSS.escape(u.use)}"]`);
      if (!row || !u.community) continue;
      row.querySelector('.vs-cell.rep')?.replaceWith(reportCell(u.community));
      row.querySelector('.vs-cell.pl')?.replaceWith(placeboCell(u.community, u.use));
    }
  }
  const sig = snap?.signals?.[id];
  if (sig && sig.score != null && Number.isFinite(Number(sig.score))) {
    const score = Number(sig.score).toFixed(1);
    setScore(score);
    v('score-sr').textContent = `${score} out of 100.`;
    v('bar').querySelector('.fi').setAttribute('width', clamp(sig.score).toFixed(1));
    const lvl = levelOf(sig.certification || 'forum');
    v('level').replaceChildren(seal(lvl.key), h('span', {}, lvl.name));
    v('cap').textContent = [sig.summary_label, sig.confidence_label ? `${sig.confidence_label} confidence` : null,
      Number(sig.internal_share) > 0 ? `${sig.internal_share}% from members` : 'From public forums so far'].filter(Boolean).join(' · ');
  }
  const at = snap?.checked_at || snap?.generated_at;
  if (at && ago(at)) v('when').textContent = `Live from the Library, updated ${ago(at)}`;
}

// The one moment of motion on the page: the Signal counts up and the bars fill, once
function play() {
  const el = v('score');
  const end = Number(target ?? el.textContent) || 0;
  card.classList.add('on');
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1100);
    el.textContent = (end * (1 - (1 - k) ** 3)).toFixed(1);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (card) {
  if (animate) {
    // Until it plays, the number waits at zero and the bars are folded away
    card.classList.add('js-anim');
    target = v('score').textContent;
    v('score').textContent = '0.0';
  }
  const loaded = Promise.all([getJson(`${COMMUNITY}/evidence/${encodeURIComponent(card.dataset.id)}.json`), getSignal()])
    .then(([ev, snap]) => update(ev, snap));
  if (animate) {
    // Wait for the live numbers, but not for long, so the card never sits empty
    Promise.race([loaded, new Promise((r) => { setTimeout(r, 2500); })]).then(() => {
      const io = new IntersectionObserver((seen) => {
        if (!seen.some((e) => e.isIntersecting)) return;
        io.disconnect();
        play();
      }, { threshold: 0.2 });
      io.observe(card);
    });
  }
}

// ---------------------------------------------------------------------------------------------
// The hero: the Library as one graph (lib/graph.js; its data, and the still picture shown until it
// starts, by scripts/graph.mjs), in its own pane beside the prompt. Its script and data load after
// the page; if either can't, the still picture stays. Pointing at a dot traces it and clicking it
// opens its fact sheet; pointing at a row under the prompt traces what it names; what's typed lights
// up. The pane's bar says what's being traced.
const net = document.querySelector('.fp .net[data-graph]');
const fig = net && net.closest('.fp-fig');
if (net) startNet(net);
async function startNet(net) {
  const [mod, data] = await Promise.all([import('/lib/graph.js?v=342f35b5c5').catch(() => null), getJson(net.dataset.graph)]);
  if (data && data.counts) promptFrom(data);
  if (!mod || !data || !data.counts) return;
  const css = () => {
    const cs = getComputedStyle(net);
    const v = (k, d) => { const x = parseFloat(cs.getPropertyValue(k)); return Number.isFinite(x) ? x : d; };
    return { cx: v('--gx', 0.5), cy: v('--gy', 0.5), unit: v('--gu', 0.22), unitH: v('--guh', 0), caption: v('--gcap', 0) > 0, callouts: 3, top: 6, bottom: 6 };
  };
  const ask = net.querySelector('.net-ask');
  const question = (s) => (s.kind === 'c' ? askAboutCompound(s.name)
    : s.kind === 's' ? `What may the ${s.name} blend (${s.parts.join(' + ')}) do for me? What does the evidence say about each part, and what do members report?`
      : s.kind === 'p' ? `In the Library, which compounds act on ${s.label}, and what do their fact sheets say?`
        : `In the Library, which compounds may change ${s.name} on a blood test, and what do their fact sheets say?`);
  // the pane's bar: what's traced, and for a compound (or a blend, its parts together) how many
  // places its sheet names and how many of its lines are the Safety agent's notes
  const tracedEl = document.getElementById('fp-traced'), countEl = document.getElementById('fp-trace-n');
  const WARN = Object.keys(data.ops || {}).indexOf('warn');
  const idxOf = new Map((data.ids || []).map((id, i) => [id, i]));
  const placesOf = new Map(), notesOf = new Map();
  (data.lineC || []).forEach((c, k) => {
    if (!placesOf.has(c)) placesOf.set(c, new Set());
    placesOf.get(c).add(data.lineP[k]);
    if (data.lineOp[k] === WARN) notesOf.set(c, (notesOf.get(c) || 0) + 1);
  });
  const plural = (n, one) => `${n} ${one}${n === 1 ? '' : 's'}`;
  let typing = false, counts = '';
  const bar = () => {
    const sizeEl = fig.querySelector('.net-size'), foundEl = fig.querySelector('.net-found');
    countEl.hidden = typing || !counts; countEl.textContent = counts;
    sizeEl.hidden = typing || !!counts; foundEl.hidden = !typing;
  };
  const traced = (s) => {
    if (tracedEl) tracedEl.textContent = s ? String(s.label || s.name).toLowerCase() : 'the library';
    const cs = !s ? [] : s.kind === 'c' ? [idxOf.get(s.id)] : s.kind === 's' ? (data.stacks.find((x) => x.id === s.id)?.parts || []) : [];
    const places = new Set(), notes = cs.reduce((n, c) => { for (const p of placesOf.get(c) || []) places.add(p); return n + (notesOf.get(c) || 0); }, 0);
    counts = cs.length && places.size ? `${plural(places.size, 'place')}${notes ? ` · ${plural(notes, 'safety note')}` : ''}` : '';
    bar();
  };
  let g;
  try {
    g = mod.startGraph(net, data, {
      onTrace: traced,
      ...css(), layout: css, avoid: () => [], poster: net.querySelector('.net-poster'), ask,
      bg: { at: [css().cx, css().cy], size: [0.52, 0.62], stops: ['#080B0C', '#080B0C', '#080B0C'] },
      links: { sheet: (id) => `/library/${id}/`, ask: (s) => askLink(question(s), { site: '' }) },
    });
  } catch { return; }
  getSignal().then((snap) => g.setSignal(snap), () => {});
  // pointing (a mouse or a pen) and clicking; a touch screen taps
  let touch = false;
  const at = (e) => { const r = net.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  net.addEventListener('pointerdown', (e) => { touch = e.pointerType === 'touch'; }, { passive: true });
  net.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') g.pointerAt(...at(e), e.target === g.surface); }, { passive: true });
  net.addEventListener('pointerleave', () => g.pointerOut());
  g.surface.addEventListener('click', (e) => { const url = g.activate(...at(e), touch); if (url) location.assign(url); });
  ask.addEventListener('pointerenter', () => g.keep(true));
  ask.addEventListener('pointerleave', () => g.keep(false));
  // a row under the prompt traces what it names while it's pointed at or focused
  const list = document.getElementById('hp-list');
  const idOf = (el) => { const a = el && el.closest && el.closest('a.hp-row[href^="/library/"]'); return a ? a.getAttribute('href').split('/')[2] : null; };
  if (list) {
    list.addEventListener('pointerover', (e) => { const id = idOf(e.target); if (id) g.hold(id); });
    list.addEventListener('pointerleave', () => g.release());
    list.addEventListener('focusin', (e) => { const id = idOf(e.target); if (id) g.hold(id); });
    list.addEventListener('focusout', () => g.release());
  }
  // what's typed lights up, as the Library's search would find it
  const q = document.getElementById('hero-q'), found = fig.querySelector('.net-found');
  const typed = () => {
    const r = g.light(q.value), on = q.value.trim().length > 1;
    found.textContent = !on ? '' : r.lit ? `${r.lit} of ${r.of} light up` : `none of the ${r.of} drawn`;
    typing = on; bar();
  };
  q.addEventListener('input', typed);
  if (q.value) typed();
}

// ---------------------------------------------------------------------------------------------
// The prompt: › look up. Empty, it lists the most talked-about fact sheets (by the live Signal). As
// you type, the first few fact sheets and blends that match, as the Library's own search matches
// them (name, other names, category and family), and last a row that asks Sig instead. Each row is
// the sheet's file name, its name and family, its evidence (the Evidence librarian's blue) and its
// Signal (the community's lime). ↓ moves into the rows; Enter opens the first; Escape clears.
function promptFrom(data) {
  const form = document.querySelector('form.hp'), q = document.getElementById('hero-q');
  const list = document.getElementById('hp-list'), count = document.getElementById('hp-n'), head = document.getElementById('hp-k');
  if (!form || !q || !list || !data.names?.c || !data.find) return;
  const fold = (x) => String(x || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
  const FAM = ['peptide', 'hormone', 'medication', 'supplement'];
  const GRADE = ['anecdotal', 'animal and lab', 'limited', 'moderate', 'strong'];
  const names = data.names.c, ids = data.ids, finds = data.find, stacks = data.stacks || [], grades = data.grade || [];
  const byId = new Map(ids.map((id, c) => [id, c]));
  let snap = null;
  const rank = (name, t) => { const f = fold(name); return f.startsWith(t) ? 0 : f.includes(t) ? 1 : 2; };
  const row = (href, file, name, kind, facts, cls = '') => h('li', {}, h('a', { class: `hp-row${cls}`, href },
    h('span', { class: 'hp-file' }, ...[].concat(file)), h('span', { class: 'hp-name' }, name, kind ? h('span', { class: 'hp-kind', text: ` · ${kind}` }) : null),
    h('span', { class: 'hp-facts' }, ...facts)));
  const fact = (cls, text, label) => h('span', { class: `hp-fact ${cls}`, title: label }, h('i', { 'aria-hidden': 'true' }), h('span', { class: 'mh-sr', text: `${label}: ` }), text);
  const facts = (id, c) => {
    const g = grades[c], sig = snap?.signals?.[id]?.score;
    return [g >= 0 ? fact('hp-ev', GRADE[g], 'Evidence') : null,
      Number.isFinite(Number(sig)) && sig != null ? fact('hp-sig', Number(sig).toFixed(1), 'Community Signal') : null].filter(Boolean);
  };
  const sheetRow = (c) => row(`/library/${ids[c]}/`, `${ids[c]}.md`, names[c], FAM[data.famOf[c]] || 'compound', facts(ids[c], c));
  // empty: the most talked-about sheets, highest Signal first, until it's typed in
  function suggest() {
    let top = ['bpc157', 'tirzepatide', 'semaglutide', 'tb500'];
    if (snap?.signals) {
      const live = Object.entries(snap.signals).filter(([id, s]) => byId.has(id) && Number.isFinite(Number(s.score)))
        .sort((a, b) => b[1].score - a[1].score).slice(0, 4).map(([id]) => id);
      if (live.length === 4) top = live;
    }
    list.replaceChildren(...top.filter((id) => byId.has(id)).map((id) => sheetRow(byId.get(id))));
    head.hidden = false;
    head.textContent = snap?.signals ? 'most talked about · by the live signal' : 'most talked about';
    count.textContent = '';
  }
  function draw() {
    const terms = q.value.split(/\s+/).map(fold).filter(Boolean);
    const t = terms.join('');
    if (t.length < 2) { suggest(); return; }
    const hits = [];
    stacks.forEach((st, k) => { if (terms.every((x) => st.find.includes(x))) hits.push({ k, r: rank(st.name, t), n: st.name }); });
    for (let c = 0; c < names.length; c++) if (terms.every((x) => finds[c].includes(x))) hits.push({ c, r: rank(names[c], t), n: names[c] });
    hits.sort((a, b) => a.r - b.r || a.n.localeCompare(b.n));
    count.textContent = hits.length ? `${hits.length} match${hits.length === 1 ? '' : 'es'}` : 'no fact sheet matches';
    const rows = hits.slice(0, 4).map((m) => {
      if (m.k != null) {
        const st = stacks[m.k];
        return row(`/library/${st.id}/`, st.id, st.name, 'blend', [h('span', { class: 'hp-parts', text: st.parts.map((c) => names[c]).join(' + ') })]);
      }
      return sheetRow(m.c);
    });
    // and Sig, a keystroke away
    const said = q.value.trim().slice(0, 120);
    rows.push(row(askLink(`What does the evidence say about ${said}, and what do people report?`, { site: '' }),
      [node('<svg class="ring" width="12" height="12" viewBox="-6 -6 12 12" aria-hidden="true" focusable="false"><circle r="4.3" fill="none" stroke="#FF6B5B" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(-85.5)"/><circle r="4.3" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(-20.05)"/><circle r="4.3" fill="none" stroke="#D8FF3D" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(12.68)"/><circle r="4.3" fill="none" stroke="#3FE0C5" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(78.14)"/><circle r="4.3" fill="none" stroke="#6FA8FF" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(143.59)"/><circle r="4.3" fill="none" stroke="#B98CFF" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(209.05)"/><circle r="4.3" fill="none" stroke="#FF7FC8" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(241.77)"/></svg>'), 'sig ask'],
      `“${said}”`, '', [], ' hp-ask'));
    list.replaceChildren(...rows);
    head.hidden = true;
  }
  getSignal().then((x) => { snap = x; draw(); }, () => {});
  q.addEventListener('input', draw);
  const links = () => [...list.querySelectorAll('a')];
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); links()[0]?.focus(); }
    else if (e.key === 'Escape' && q.value) { q.value = ''; q.dispatchEvent(new Event('input')); }
  });
  list.addEventListener('keydown', (e) => {
    const all = links(), i = all.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); all[Math.min(all.length - 1, i + 1)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) q.focus(); else all[i - 1].focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); q.focus(); }
  });
  // Enter opens the first match; with nothing typed, or no match, the form searches the Library
  form.addEventListener('submit', (e) => {
    const first = links()[0];
    if (first && q.value.trim().length > 1 && !first.classList.contains('hp-ask')) { e.preventDefault(); location.assign(first.href); }
  });
  draw();
  // the strip under the hero: how many Signals are live, once they've loaded
  const live = document.querySelector('.strip-live'), liveN = document.getElementById('strip-live-n');
  getSignal().then((x) => {
    const n = x?.signals ? Object.keys(x.signals).length : 0;
    if (live && liveN && n) { liveN.textContent = String(n); live.hidden = false; }
  }, () => {});
}

// ---------------------------------------------------------------------------------------------
// The Community Signal, like top. While the snapshot loads, Sig's ring is the spinner and three
// lines say what's happening. Then the board: the totals, where the numbers come from (members or
// the forums), the compounds with the highest Signal and the log, every line of it signed by the
// community. Only what the public snapshot holds: totals, nothing about any one member. While the
// board is on screen it asks for a newer snapshot once a minute; a row that moved flashes, lime up,
// coral down, and the log says so.
const board = document.getElementById('fp-board');
if (board) signalBoard(board);
function signalBoard(board) {
  const load = document.getElementById('fp-load'), stats = document.getElementById('fp-stats');
  const wrap = document.getElementById('fp-top-wrap'), tbody = board.querySelector('#fp-top tbody');
  const log = document.getElementById('fp-log-lines'), snapEl = document.getElementById('fp-snap');
  const pieces = [...load.querySelectorAll('svg.ring .rg')];
  const wheel = pieces.filter((p) => !p.classList.contains('rg-c')), centre = pieces.find((p) => p.classList.contains('rg-c'));
  const said = (k) => load.querySelector(`[data-load="${k}"]`);
  const S = (k) => board.querySelector(`[data-s="${k}"]`);
  const fmtN = (n) => Number(n || 0).toLocaleString('en-US');
  // the labels under the totals: "1 member", "2 members"
  const ONE = { signals: 'live signal', reports: 'first-hand report', moves: 'move today', members: 'member' };
  const MANY = { signals: 'live signals', reports: 'first-hand reports', moves: 'moves today', members: 'members' };
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const stamp = (iso, withDate = true) => {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${withDate ? `${months[d.getMonth()]} ${d.getDate()} ` : ''}${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  // the spinner: the ring's pieces light one by one, round and round, until the numbers arrive
  let tick = 0, spin = 0;
  if (!reduceMotion && wheel.length) {
    spin = setInterval(() => {
      tick = (tick + 1) % (wheel.length + 1);
      wheel.forEach((p, i) => p.classList.toggle('on', i < tick));
      said('agents').textContent = `${tick}/12 …`;
    }, 140);
  }
  let shown = null, version = null, seenOnce = false;
  const rows = new Map();
  function line(t, kids, cls = '') {
    return h('li', { class: cls }, h('span', { class: 't', text: t }), h('span', {}, ...kids));
  }
  function logFrom(snap) {
    const c = snap.community || {}, share = Math.max(0, Math.min(100, Number(c.community_share) || 0));
    const n = c.signals ?? Object.keys(snap.signals || {}).length;
    const items = [line(stamp(snap.published_at || snap.generated_at), [`snapshot ${snap.version ?? 1} published · ${fmtN(n)} signals, `,
      share ? `${share}% from members` : 'all read from public forums'])];
    for (const m of (snap.moves || []).slice(0, 4)) {
      const up = Number(m.to) >= Number(m.from);
      items.push(line('this week', [h('span', { class: up ? 'up' : 'down', text: up ? '▲ ' : '▼ ' }), `${String(m.name).toLowerCase()} ${Number(m.from).toFixed(1)} → ${Number(m.to).toFixed(1)}`]));
    }
    if (Number(c.reports_week) > 0) items.push(line('this week', [`${fmtN(c.reports_week)} first-hand report${c.reports_week === 1 ? '' : 's'} read by `, h('span', { class: 'who', text: 'the community' })]));
    const cursor = h('span', { class: 'cursor', 'aria-hidden': 'true' });
    items.push(line('now', [Number(c.reports) > 0 ? 'listening for the next report ' : 'waiting for the first first-hand report ', cursor]));
    log.replaceChildren(...items);
  }
  // the board's rows: the highest Signal first
  function rowFor(id, s, i) {
    const score = Number(s.score), wk = Number(s.week);
    const d = Number.isFinite(wk) ? score - wk : NaN;
    const fill = h('i');
    fill.style.width = `${Math.max(0, Math.min(100, score)).toFixed(1)}%`;
    const from = Number(s.internal_share) > 0 ? `members ${s.internal_share}%` : 'forums';
    const n0 = (x) => (Number.isFinite(Number(x)) && x != null ? String(Math.round(Number(x))) : '—');
    const dl = !Number.isFinite(d) || Math.abs(d) < 0.05 ? h('span', { class: 'flat', text: '—' })
      : h('span', { class: d > 0 ? 'up' : 'down', text: `${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(1)}` });
    return h('tr', { 'data-id': id },
      h('td', { class: 'c-n', text: String(i + 1) }),
      h('th', { scope: 'row' }, h('a', { href: `/library/${id}/`, text: s.name || id })),
      h('td', { class: 'c-sig' }, h('span', { class: 'fp-bar' }, h('span', { 'aria-hidden': 'true' }, fill), h('b', { text: score.toFixed(1) }))),
      h('td', { class: 'c-x num', text: n0(s.efficacy) }), h('td', { class: 'c-x num', text: n0(s.consistency) }),
      h('td', { class: 'c-x num', text: n0(s.diversity) }), h('td', { class: 'c-x num', text: n0(s.confidence) }),
      h('td', { class: 'c-x', text: from }), h('td', { class: 'num' }, dl),
      h('td', { class: 'c-x', text: String(s.summary_label || '').toLowerCase() || '—' }));
  }
  function render(snap) {
    const c = snap.community || {};
    const all = Object.entries(snap.signals || {}).filter(([, s]) => s && s.score != null && Number.isFinite(Number(s.score)));
    all.sort((a, b) => b[1].score - a[1].score);
    const top = all.slice(0, 8);
    const before = new Map(rows);
    rows.clear();
    const trs = top.map(([id, s], i) => { rows.set(id, Number(s.score)); return rowFor(id, s, i); });
    const rest = all.length - top.length;
    if (rest > 0) {
      trs.push(h('tr', { class: 'more' }, h('td', { colspan: '10' }, `… ${rest} more · `,
        h('a', { href: 'https://community.miraclehealth.us/#/signal', text: 'sort the whole board in the community' }))));
    }
    tbody.replaceChildren(...trs);
    // a row that moved since the last snapshot flashes, lime up or coral down
    if (shown) for (const tr of tbody.querySelectorAll('tr[data-id]')) {
      const was = before.get(tr.dataset.id), now = rows.get(tr.dataset.id);
      if (was != null && now != null && Math.abs(now - was) >= 0.05) tr.classList.add(now > was ? 'flash-up' : 'flash-down');
    }
    const share = Math.max(0, Math.min(100, Number(c.community_share) || 0));
    const totals = { signals: c.signals ?? all.length, reports: c.reports ?? 0, moves: c.moves_today ?? 0, members: c.members ?? 0 };
    for (const [k, n] of Object.entries(totals)) {
      S(k).dataset.to = String(n);
      S(k).nextElementSibling.textContent = Number(n) === 1 ? ONE[k] : MANY[k];
      if (seenOnce || reduceMotion) S(k).textContent = fmtN(n);
    }
    S('share').textContent = `members ${share}%`;
    S('forums').textContent = `forums ${100 - share}%`;
    S('bar').style.width = `${share}%`;
    logFrom(snap);
    const at = snap.checked_at || snap.published_at || snap.generated_at;
    snapEl.lastElementChild.textContent = `live · snapshot ${snap.version ?? 1} · ${stamp(at)}`;
    shown = snap; version = snap.version ?? null;
  }
  // the totals count up once, as the board comes into view
  function countUp() {
    seenOnce = true;
    for (const k of ['signals', 'reports', 'moves', 'members']) {
      const el = S(k), to = Number(el.dataset.to || 0);
      if (reduceMotion || !to) { el.textContent = fmtN(to); continue; }
      const t0 = performance.now();
      const step = (t) => { const f = Math.min(1, (t - t0) / 900); el.textContent = fmtN(Math.round(to * (1 - (1 - f) ** 3))); if (f < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
  }
  function show() {
    clearInterval(spin);
    load.hidden = true; stats.hidden = false; wrap.hidden = false;
    board.setAttribute('aria-busy', 'false');
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((seen) => { if (seen.some((e) => e.isIntersecting)) { io.disconnect(); countUp(); } }, { threshold: 0.25 });
      io.observe(stats);
    } else countUp();
  }
  getSignal().then((snap) => {
    if (!snap || !snap.signals) throw new Error('no snapshot');
    clearInterval(spin); // stop the spinner first, so the full ring and 12/12 stay up until the board shows
    const n = snap.community?.signals ?? Object.keys(snap.signals).length;
    said('signal').replaceChildren(`${fmtN(n)} `, ck());
    said('agents').replaceChildren('12/12 ', ck());
    wheel.forEach((p) => p.classList.add('on'));
    if (centre) centre.classList.add('on');
    render(snap);
    setTimeout(show, reduceMotion ? 0 : 420);
    keepLive();
  }).catch(() => {
    clearInterval(spin);
    said('signal').textContent = 'not reachable just now';
    said('signal').classList.add('is-wait');
    said('agents').textContent = '—';
    board.setAttribute('aria-busy', 'false');
    log.replaceChildren(line('now', ['the signal couldn’t load just now · ', h('a', { href: 'https://community.miraclehealth.us/#/signal', text: 'open the board in the community' })]));
  });
  // while the board is on screen and the tab is showing, a newer snapshot is asked for once a minute
  function keepLive() {
    let visible = false, timer = 0;
    const ask = async () => {
      if (!visible || document.hidden) return;
      try {
        const r = await fetch(SIGNAL_URL, { credentials: 'omit', cache: 'no-cache' });
        const snap = r.ok ? await r.json() : null;
        if (snap && snap.signals && (snap.version ?? null) !== version) {
          snap.checked_at = r.headers.get('X-Signal-Checked') || snap.checked_at;
          render(snap);
          log.prepend(line(stamp(new Date().toISOString(), false), [`snapshot ${snap.version} arrived · `, h('span', { class: 'who', text: 'the community' })]));
        }
      } catch { /* the board keeps what it has */ }
    };
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver((seen) => {
      visible = seen.some((e) => e.isIntersecting);
      clearInterval(timer);
      if (visible) timer = setInterval(ask, 60000);
    }, { threshold: 0 }).observe(board);
  }
}

// ---------------------------------------------------------------------------------------------
// Ask Sig, with all twelve agents: the example run plays once as it comes into view. Each step
// lights its agent's piece of the ring and ticks it off in the list beside it; the Interpretation
// agent lights the centre, last; then the answer comes in, part by part, each signed by the agent
// that wrote it. Picking an agent lights up what it wrote. Reduced motion: the finished run.
const run = document.getElementById('fp-run');
if (run) runDemo(run);
// the check mark: neither font has one, so it's drawn (img/i-check.svg, as a mask in the words' colour)
function ck() { return h('i', { class: 'ck', 'aria-hidden': 'true' }); }
function runDemo(run) {
  const steps = [...run.querySelectorAll('#fp-steps > li')];
  const parts = [...run.querySelectorAll('#fp-answer > *')];
  const signed = [...run.querySelectorAll('.signed')];
  const rg = [...run.querySelectorAll('svg.fp-bigring .rg')];
  const roster = [...run.querySelectorAll('#fp-roster > li')];
  const centre = run.querySelector('.fp-center');
  const ringN = document.getElementById('fp-ring-n');
  const state = document.getElementById('fp-run-state'), replay = document.getElementById('fp-replay');
  const total = {};
  for (const li of steps) total[li.dataset.agent] = (total[li.dataset.agent] || 0) + 1;

  // picking an agent: a click keeps it, pointing or focus previews it
  let kept = null;
  function pick(a) {
    run.classList.toggle('has-pick', !!a);
    for (const el of [...steps, ...signed]) el.classList.toggle('is-lit', !!a && el.dataset.agent === a);
    for (const p of rg) p.classList.toggle('is-lit', !!a && p.dataset.a === a);
    for (const li of roster) li.querySelector('button').setAttribute('aria-pressed', String(!!kept && li.dataset.agent === kept));
  }
  for (const li of roster) {
    const b = li.querySelector('button'), a = li.dataset.agent;
    b.addEventListener('click', () => { kept = kept === a ? null : a; pick(kept); });
    b.addEventListener('pointerenter', () => pick(a));
    b.addEventListener('pointerleave', () => pick(kept));
    b.addEventListener('focus', () => pick(a));
    b.addEventListener('blur', () => pick(kept));
  }
  run.addEventListener('keydown', (e) => { if (e.key === 'Escape' && kept) { kept = null; pick(null); } });

  if (reduceMotion || !('IntersectionObserver' in window)) return;
  let timers = [];
  const seen = new Set();
  function arm() {
    timers.forEach(clearTimeout); timers = [];
    seen.clear();
    run.classList.add('is-armed'); run.classList.remove('is-centre');
    for (const el of [...steps, ...parts]) el.classList.remove('in');
    for (const p of rg) p.classList.remove('on');
    for (const li of roster) { li.classList.remove('done'); li.dataset.n = '0'; }
    ringN.textContent = '0';
    state.textContent = 'waking sig’s agents …';
    replay.hidden = true;
  }
  function report(li, i) {
    li.classList.add('in');
    const a = li.dataset.agent;
    seen.add(a);
    if (a === 'interpretation') run.classList.add('is-centre');
    else rg.find((p) => p.dataset.a === a)?.classList.add('on');
    const r = roster.find((x) => x.dataset.agent === a);
    if (r) { r.classList.add('done'); r.dataset.n = String(Number(r.dataset.n || 0) + 1); r.querySelector('.ct').replaceChildren(ck(), ` ${r.dataset.n}`); }
    ringN.textContent = String(seen.size);
    state.textContent = `running · step ${i + 1} of ${steps.length}`;
  }
  function play() {
    arm();
    const gap = 230;
    steps.forEach((li, i) => timers.push(setTimeout(() => report(li, i), 350 + i * gap)));
    const t0 = 350 + steps.length * gap + 250;
    parts.forEach((el, i) => timers.push(setTimeout(() => el.classList.add('in'), t0 + i * 170)));
    timers.push(setTimeout(() => {
      state.replaceChildren(ck(), ` done · ${steps.length} steps · ${seen.size} agents`);
      replay.hidden = false;
      for (const li of roster) li.querySelector('.ct').replaceChildren(ck(), ` ${total[li.dataset.agent] || 0}`);
    }, t0 + parts.length * 170));
  }
  arm();
  // it starts once the start of the run is well on screen, however tall the run is
  const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { io.disconnect(); play(); } }, { rootMargin: '0px 0px -30% 0px' });
  io.observe(run.querySelector('.fp-cmd') || run);
  replay.addEventListener('click', play);
}

// Ask Sig from the front page: the question goes to Sig's own page, in the link
const askForm = document.getElementById('fp-askbox');
if (askForm) askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const said = askForm.querySelector('input').value.trim();
  location.assign(said ? askLink(said, { site: '' }) : '/sig/');
});

// The drawings that move without end only move while they're on screen
document.querySelectorAll('svg.sig, svg.takeover, svg.flowviz').forEach(calm);
