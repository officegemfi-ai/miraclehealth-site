// The front page, in the Sig system: the Community Signal and its spectrum with the prompt beside
// them (the top, page 15 of the design canvas), the Community Signal like top, Ask Sig's twelve
// agents in an example run, and the real compound in "Popular isn't the same as proven". What the studies show is published with the page, word for word from
// the compound's fact sheet (caveats included). What changes as reports come in is read here from the
// community's public files (totals only: no posts, no names): the Community Signal, what people
// report for each use and the placebo figures beside them. If the files can't load, the page keeps
// what it was published with.
import { sealSvg, levelOf, LEVELS } from '/library/signalviz.js?v=865e272ad0';
import { COMMUNITY, node, askLink, meterHtml } from '/kit/kit.js?v=9eee17d93b';
import { startHow } from '/lib/how.js?v=547caf3594';
import { startSigHero } from '/lib/sighero.js?v=e0fa87772c';
import { sigField } from '/lib/sigfield.js?v=36f23eb1e2';
import { h, getJson, getSignal, calm, groupN, SIGNAL_URL } from '/lib/dom.js?v=f31d9546b5';

const card = document.querySelector('[data-live="example"]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// While the page opens, only the top moves. The parts further down (the community board, Ask Sig's
// example run, How it works) start once the top has played in, one at a time in the browser's idle
// moments, in the order they come down the page; or all at once, at the first scroll, so each is
// ready before it can be seen (a jump to one of them, or a page that opens part way down, scrolls too)
const below = [];
let belowOn = false;
function later(el, start) {
  if (!el) return;
  if (belowOn) { start(); return; }
  below.push({ el, start });
  below.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
function startBelow(now = false) {
  belowOn = true;
  if (now) { while (below.length) below.shift().start(); return; }
  const idle = window.requestIdleCallback ? (f) => window.requestIdleCallback(f, { timeout: 800 }) : (f) => setTimeout(f, 40);
  const next = () => { if (below.length) { below.shift().start(); idle(next); } };
  idle(next);
}
function openBelow() {
  window.addEventListener('scroll', () => startBelow(true), { once: true, passive: true });
  if (location.hash || window.scrollY > 0) { startBelow(true); return; }
  // and never later than this, whatever the top is doing
  const wait = setTimeout(() => startBelow(), 9000);
  topPlayed.then(() => { clearTimeout(wait); if (below.length || !belowOn) startBelow(); });
}

const fmt = groupN;
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
    const said = [sig.summary_label, sig.confidence_label ? `with ${String(sig.confidence_label).toLowerCase()} confidence` : null].filter(Boolean).join(', ');
    v('cap').textContent = `${said ? `${said}. ` : ''}${Number(sig.internal_share) > 0 ? `${sig.internal_share}% from members.` : 'From public forums so far.'}`;
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
// The top: the Community Signal, one compound at a time, and the spectrum of every live Signal
// (lib/sighero.js), beside the prompt. The prompt looks things up in the Library's own data (its
// graph's names, other names and families, by their version), which also says how strong each
// compound's studies are.
const prompt = document.querySelector('form.hp[data-graph]');
const library = prompt ? getJson(prompt.dataset.graph) : Promise.resolve(null);
library.then((data) => { if (data && data.counts) promptFrom(data); });
const topPlayed = startSigHero(document.querySelector('.sx-hero'), {
  getSignal,
  library: library.then((d) => d && {
    grades: new Map((d.ids || []).map((id, c) => [id, d.grade?.[c]]).filter(([, g]) => Number.isInteger(g) && g >= 0)),
    kinds: new Map((d.ids || []).map((id, c) => [id, ['peptide', 'hormone', 'medication', 'supplement'][d.famOf?.[c]]]).filter(([, k]) => k)),
  }),
  meter: (grade) => meterHtml(grade, { bare: true }),
  levels: LEVELS,
  field: sigField,
});
// the side panel says how many Signals are live
getSignal().then((snap) => {
  const n = snap?.signals ? Object.keys(snap.signals).length : 0;
  const k = document.querySelector('.os-places .op-signal-n');
  if (n && k) k.textContent = `${n} `;
}, () => {});

// ---------------------------------------------------------------------------------------------
// The prompt: look up a compound. It opens under the box while you're in it. Empty, it lists the
// most talked-about fact sheets (by the live Signal). As
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
  const row = (href, name, kind, facts, cls = '', lead = null) => h('li', {}, h('a', { class: `hp-row${cls}`, href },
    h('span', { class: 'hp-name' }, lead, name, kind ? h('span', { class: 'hp-kind', text: ` · ${kind}` }) : null),
    h('span', { class: 'hp-facts' }, ...facts)));
  const fact = (cls, text, label) => h('span', { class: `hp-fact ${cls}`, title: label }, h('i', { 'aria-hidden': 'true' }), h('span', { class: 'mh-sr', text: `${label}: ` }), text);
  const facts = (id, c) => {
    const g = grades[c], sig = snap?.signals?.[id]?.score;
    return [g >= 0 ? fact('hp-ev', GRADE[g], 'Evidence') : null,
      Number.isFinite(Number(sig)) && sig != null ? fact('hp-sig', Number(sig).toFixed(1), 'Community Signal') : null].filter(Boolean);
  };
  const sheetRow = (c) => row(`/library/${ids[c]}/`, names[c], FAM[data.famOf[c]] || 'compound', facts(ids[c], c));
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
    head.textContent = 'Most talked about';
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
        return row(`/library/${st.id}/`, st.name, 'blend', [h('span', { class: 'hp-parts', text: st.parts.map((c) => names[c]).join(' + ') })]);
      }
      return sheetRow(m.c);
    });
    // and Sig, a keystroke away
    const said = q.value.trim().slice(0, 120);
    rows.push(row(askLink(`What does the evidence say about ${said}, and what do people report?`, { site: '' }),
      `Ask Sig about “${said}”`, '', [], ' hp-ask', node('<svg class="ring" width="12" height="12" viewBox="-6 -6 12 12" aria-hidden="true" focusable="false"><circle r="4.3" fill="none" stroke="#FF6B5B" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(-85.5)"/><circle r="4.3" fill="none" stroke="#F2C94C" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(-20.05)"/><circle r="4.3" fill="none" stroke="#3D8BFF" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(12.68)"/><circle r="4.3" fill="none" stroke="#3FE0C5" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(78.14)"/><circle r="4.3" fill="none" stroke="#14ECC3" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(143.59)"/><circle r="4.3" fill="none" stroke="#B98CFF" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(209.05)"/><circle r="4.3" fill="none" stroke="#FF7FC8" stroke-width="2.4" stroke-dasharray="1.78 27.02" transform="rotate(241.77)"/></svg>')));
    list.replaceChildren(...rows);
    head.hidden = true;
  }
  getSignal().then((x) => { snap = x; draw(); }, () => {});
  q.addEventListener('input', draw);
  const links = () => [...list.querySelectorAll('a')];
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); links()[0]?.focus(); }
    else if (e.key === 'Escape' && q.value) { q.value = ''; q.dispatchEvent(new Event('input')); }
    else if (e.key === 'Escape') q.blur();
  });
  // the rows open under the box while you're in it; pressing one keeps you in the box until the
  // click lands, so the row is still there to be clicked
  form.querySelector('.hp-drop')?.addEventListener('mousedown', (e) => { if (e.target.closest('a')) e.preventDefault(); });
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
}

// ---------------------------------------------------------------------------------------------
// The Community Signal, like top. While the snapshot loads, Sig's ring is the spinner and three
// lines say what's happening. Then the board: the compounds with the highest Signal, each with what
// people report most and its score, and a way to the whole board. Only what the public snapshot holds,
// nothing about any one member. A row shows how far it moved this week only when it moved. While the
// board is on screen it asks for a newer snapshot once a minute; a row that moved flashes, lime up,
// coral down.
const board = document.getElementById('fp-board');
later(board, () => signalBoard(board));
function signalBoard(board) {
  const load = document.getElementById('fp-load');
  const wrap = document.getElementById('fp-top-wrap'), tbody = board.querySelector('#fp-top tbody');
  const pieces = [...load.querySelectorAll('svg.ring .rg')];
  const wheel = pieces.filter((p) => !p.classList.contains('rg-c')), centre = pieces.find((p) => p.classList.contains('rg-c'));
  const said = (k) => load.querySelector(`[data-load="${k}"]`);
  const fmtN = fmt;
  // the spinner: the ring's pieces light one by one, round and round, until the numbers arrive
  let tick = 0, spin = 0;
  if (!reduceMotion && wheel.length) {
    spin = setInterval(() => {
      tick = (tick + 1) % (wheel.length + 1);
      wheel.forEach((p, i) => p.classList.toggle('on', i < tick));
    }, 140);
  }
  let shown = null, version = null;
  const rows = new Map();
  // a row: its rank, the compound (its fact sheet), what people report most for it, and its Signal,
  // with this week's move beside the score when there was one. What people report most is written
  // twice, under the name and in its own column; the board shows one or the other by its width
  // (home.css), so it's seen, and read out, once
  function rowFor(id, s, i) {
    const score = Number(s.score), wk = Number(s.week);
    const d = Number.isFinite(wk) ? score - wk : NaN;
    const fill = h('i');
    fill.style.width = `${Math.max(0, Math.min(100, score)).toFixed(1)}%`;
    const most = (Array.isArray(s.themes) ? s.themes : []).find((t) => t && t.theme);
    const said1 = most ? String(most.theme) : '';
    // every row keeps a slot for the move, so the scores stay in one column; it shows only when a row moved
    const moved = Number.isFinite(d) && Math.abs(d) >= 0.05
      ? h('span', { class: `fp-mv ${d > 0 ? 'up' : 'down'}`, title: 'this week', text: `${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(1)}` })
      : h('span', { class: 'fp-mv', 'aria-hidden': 'true' });
    return h('tr', { 'data-id': id, role: 'row' },
      h('td', { class: 'c-n', role: 'cell', text: String(i + 1) }),
      h('th', { scope: 'row', role: 'rowheader' }, h('a', { href: `/library/${id}/`, text: s.name || id }),
        said1 ? h('span', { class: 'fp-top-t', text: said1 }) : null),
      h('td', { class: 'c-th', role: 'cell', text: said1 || '—' }),
      h('td', { class: 'c-sig', role: 'cell' }, h('span', { class: 'fp-bar' }, h('span', { 'aria-hidden': 'true' }, fill), h('b', { text: score.toFixed(1) }), moved)));
  }
  function render(snap) {
    const all = Object.entries(snap.signals || {}).filter(([, s]) => s && s.score != null && Number.isFinite(Number(s.score)));
    all.sort((a, b) => b[1].score - a[1].score);
    const top = all.slice(0, 8);
    const before = new Map(rows);
    rows.clear();
    const trs = top.map(([id, s], i) => { rows.set(id, Number(s.score)); return rowFor(id, s, i); });
    const rest = all.length - top.length;
    if (rest > 0) {
      trs.push(h('tr', { class: 'more', role: 'row' }, h('td', { colspan: '4', role: 'cell' },
        h('a', { href: 'https://community.miraclehealth.us/#/signal', text: `See all ${fmtN(all.length)} on the full board` }))));
    }
    tbody.replaceChildren(...trs);
    tbody.parentElement.classList.toggle('has-moves', !!tbody.querySelector('.fp-mv.up,.fp-mv.down'));
    // a row that moved since the last snapshot flashes, lime up or coral down
    if (shown) for (const tr of tbody.querySelectorAll('tr[data-id]')) {
      const was = before.get(tr.dataset.id), now = rows.get(tr.dataset.id);
      if (was != null && now != null && Math.abs(now - was) >= 0.05) tr.classList.add(now > was ? 'flash-up' : 'flash-down');
    }
    shown = snap; version = snap.version ?? null;
  }
  function show() {
    clearInterval(spin);
    load.hidden = true; wrap.hidden = false;
    board.setAttribute('aria-busy', 'false');
  }
  getSignal().then((snap) => {
    if (!snap || !snap.signals) throw new Error('no snapshot');
    clearInterval(spin); // stop the spinner first, so the full ring stays up until the board shows
    said('signal').replaceChildren(' ', ck());
    wheel.forEach((p) => p.classList.add('on'));
    if (centre) centre.classList.add('on');
    render(snap);
    setTimeout(show, reduceMotion ? 0 : 420);
    keepLive();
  }).catch(() => {
    clearInterval(spin);
    said('signal').textContent = ': not reachable just now';
    said('signal').classList.add('is-wait');
    board.setAttribute('aria-busy', 'false');
    wrap.before(h('p', { class: 'fp-noscript' }, 'The Signal couldn’t load just now. ',
      h('a', { href: 'https://community.miraclehealth.us/#/signal', text: 'Open the whole board in the community' }), '.'));
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

// the check mark: neither font has one, so it's drawn (img/i-check.svg, as a mask in the words' colour)
function ck() { return h('i', { class: 'ck', 'aria-hidden': 'true' }); }

// Sig's twelve agents, in light like the top (the owner's request, November 18: "give it that Solana
// design"): bands in four of the agents' colours, from the Safety agent's coral to the Mechanism
// agent's violet, drift behind the section on the LED wall, brightest behind the agents, dark behind
// the words above and below them; a pulse goes out from the agents every few seconds while it's seen
const sig = document.getElementById('sig');
later(sig, () => {
  const canvas = sig.querySelector('.fp-sig-field canvas');
  let light = null;
  try {
    light = canvas ? sigField(sig, { canvas, colors: ['#FF6B5B', '#F2C94C', '#3FE0C5', '#B98CFF'], quiet: ['.fp-head h2', '.fp-head .fp-sub', '.fp-askbox', '.fp-fine'], focus: sig.querySelector('.fp-groups'), spread: 2.3 }) : null;
  } catch { light = null; }
  if (!light) return;
  light.set([92, 70, 86, 76], 84, { pulse: false });
  light.start();
  if (reduceMotion) return;
  setInterval(() => { if (!document.hidden) light.set([92, 70, 86, 76], 84); }, 8000);
});

// Ask Sig from the front page: the question goes to Sig's own page, in the link
const askForm = document.getElementById('fp-askbox');
if (askForm) askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const said = askForm.querySelector('input').value.trim();
  location.assign(said ? askLink(said, { site: '' }) : '/sig/');
});

// The drawings that move without end only move while they're on screen
document.querySelectorAll('svg.sig, svg.takeover, svg.flowviz').forEach(calm);

// How it works: the system behind one honest number, on the live Signal
const how = document.getElementById('how');
later(how, () => startHow(how, getSignal));
openBelow();
