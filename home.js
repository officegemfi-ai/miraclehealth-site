// The front page, in the Sig system: the Community Signal and its spectrum with the prompt beside
// them (the top, page 15 of the design canvas), Sig's twelve agents round its ring, and the real
// compound in "Popular isn't the same as proven". What the studies show is published with the page, word for word from
// the compound's fact sheet (caveats included). What changes as reports come in is read here from the
// community's public files (totals only: no posts, no names): the Community Signal, what people
// report for each use and the placebo figures beside them. If the files can't load, the page keeps
// what it was published with.
import { sealSvg, levelOf, LEVELS } from '/library/signalviz.js?v=865e272ad0';
import { COMMUNITY, node, askLink, meterHtml } from '/kit/kit.js?v=7920a66cee';
import { startHow } from '/lib/how.js?v=00580c8b6b';
import { startSigHero } from '/lib/sighero.js?v=e0fa87772c';
import { sigField } from '/lib/sigfield.js?v=36f23eb1e2';
import { h, getJson, getSignal, calm, groupN } from '/lib/dom.js?v=47be1f2023';

const card = document.querySelector('[data-live="example"]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// While the page opens, only the top moves. The parts further down (Sig's twelve agents, How it
// works) start once the top has played in, one at a time in the browser's idle
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
    // (no member reports yet: the plate's own level, "Forum data", already says so, once)
    said = [h('p', { class: 'vs-v' }, `${cu.forum} on the forums`),
      cu.reports ? h('p', { class: 'vs-sub' }, `${fmt(cu.reports)} member report${cu.reports === 1 ? '' : 's'} so far; rated after 3`) : null];
  } else if (c?.near) {
    said = h('p', { class: 'vs-v' }, `Closest use reported: ${String(c.near.label).toLowerCase()}`);
  } else {
    said = h('p', { class: 'vs-v' }, 'Nothing reported yet');
  }
  return h('dd', { class: 'vs-cell rep' }, said);
}
// How many get better on a placebo, for that use (or the closest one, said so)
function placeboCell(c, use) {
  const b = c?.baseline;
  return h('dd', { class: 'vs-cell pl' },
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

// The placebo plate's own bottom line: the lowest and the highest of its uses' figures, as they stand
function placeboRange() {
  const fig = v('range');
  const pcts = [...card.querySelectorAll('.vs-cell.pl .vs-v b')].map((b) => parseFloat(b.textContent)).filter(Number.isFinite);
  fig.hidden = !pcts.length;
  if (!pcts.length) return;
  const lo = Math.min(...pcts), hi = Math.max(...pcts);
  v('range-n').textContent = lo === hi ? `${lo}%` : `${lo}–${hi}%`;
  v('range-sr').textContent = lo === hi ? `${lo}%,` : `${lo}% to ${hi}%,`;
  const fi = v('range-bar').querySelector('.fi');
  fi.setAttribute('x', lo === hi ? '0' : clamp(lo).toFixed(1));
  fi.setAttribute('width', (lo === hi ? clamp(lo) : Math.max(1, clamp(hi) - clamp(lo))).toFixed(1));
}

function update(ev, snap) {
  const id = card.dataset.id;
  if (ev && ev.id === id) {
    if (ev.status?.label) v('status').textContent = ev.status.label;
    for (const u of ev.uses || []) {
      if (!u?.use || !u.community) continue;
      const cell = (lane) => card.querySelector(`.vs-lane.${lane} .vs-u[data-use="${CSS.escape(u.use)}"] .vs-cell`);
      cell('rep')?.replaceWith(reportCell(u.community));
      cell('pl')?.replaceWith(placeboCell(u.community, u.use));
    }
    placeboRange();
  }
  const sig = snap?.signals?.[id];
  if (sig && sig.score != null && Number.isFinite(Number(sig.score))) {
    const score = Number(sig.score).toFixed(1);
    setScore(score);
    v('score-sr').textContent = `${score} out of 100.`;
    v('bar').querySelector('.fi').setAttribute('width', clamp(sig.score).toFixed(1));
    const lvl = levelOf(sig.certification || 'forum');
    v('level').replaceChildren(seal(lvl.key), h('span', {}, lvl.name));
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

// Sig's twelve agents, in light like the top (the owner's request, November 18: "give it that Solana
// design"): bands in four of the agents' colours, from the Safety agent's coral to the Mechanism
// agent's violet, drift behind the section on the LED wall, brightest behind the ring, dark behind
// the words above and below it; a pulse goes out from the ring every few seconds while it's seen
const sig = document.getElementById('sig');
later(sig, () => {
  const canvas = sig.querySelector('.fp-sig-field canvas');
  let light = null;
  try {
    light = canvas ? sigField(sig, { canvas, colors: ['#FF6B5B', '#F2C94C', '#3FE0C5', '#B98CFF'], quiet: ['.fp-head h2', '.fp-head .fp-sub', '.fp-askbox', '.fp-fine'], focus: sig.querySelector('.cr-dial'), spread: 2.3 }) : null;
  } catch { light = null; }
  if (!light) return;
  light.set([92, 70, 86, 76], 84, { pulse: false });
  light.start();
  if (reduceMotion) return;
  setInterval(() => { if (!document.hidden) light.set([92, 70, 86, 76], 84); }, 8000);
});

// The twelve round Sig's ring (the owner's request, November 20). Pointing at an agent's piece or its
// name, or moving to its name with the keyboard, says what it does in the ring's middle; a click or a
// tap keeps it there until another is picked, or the same one again (or Escape). At rest the middle is
// the centre's own, the Interpretation agent's. A step lights its agents' pieces while it is pointed
// at. The ring plays in once, the first time it is seen: the Safety agent's piece, the ten round the
// ring, then the dot, each step marked as its turn comes.
const crew = document.getElementById('crew');
later(crew, () => {
  const read = crew.querySelector('.cr-read');
  const whos = new Map([...crew.querySelectorAll('.cr-who')].map((li) => [li.dataset.agent, li]));
  const arcs = new Map([...crew.querySelectorAll('.cr-arc')].map((g) => [g.dataset.agent, g]));
  const steps = [...crew.querySelectorAll('.cr-step')];
  const rest = crew.querySelector('.cr-core')?.dataset.agent;
  if (!read || !rest || !arcs.size) return;
  const readN = read.querySelector('.cr-read-n'), readT = read.querySelector('.cr-read-t');
  let pinned = null, back = 0;
  // what the ring shows: the agent pointed at, or else the one picked, or else the ring at rest
  const show = (key) => {
    clearTimeout(back);
    const k = key || pinned;
    const li = whos.get(k || rest);
    read.dataset.agent = k || rest;
    readN.textContent = li.querySelector('.cr-name').textContent;
    readT.textContent = li.querySelector('.cr-job').textContent;
    if (k) crew.dataset.on = k; else delete crew.dataset.on;
    for (const [a, el] of whos) el.classList.toggle('on', a === k);
    for (const [a, el] of arcs) el.classList.toggle('on', a === k);
  };
  // back to the picked one or to rest, a moment after the pointer leaves, so the words don't flicker
  // as it crosses from one piece to the next
  const leave = () => { clearTimeout(back); back = setTimeout(() => show(null), 160); };
  const pick = (key) => {
    pinned = pinned === key ? null : key;
    for (const [a, el] of whos) el.querySelector('.cr-name').setAttribute('aria-pressed', String(a === pinned));
    show(pinned);
  };
  for (const [key, li] of whos) {
    const btn = li.querySelector('.cr-name');
    li.addEventListener('pointerenter', () => show(key));
    li.addEventListener('pointerleave', leave);
    btn.addEventListener('focus', () => show(key));
    btn.addEventListener('blur', leave);
    btn.addEventListener('click', () => pick(key));
  }
  for (const [key, g] of arcs) {
    g.addEventListener('pointerenter', () => show(key));
    g.addEventListener('pointerleave', leave);
    g.addEventListener('click', () => pick(key));
  }
  crew.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pinned) pick(pinned); });
  const mark = (step) => {
    for (const s of steps) s.classList.toggle('now', s === step);
    if (step) crew.dataset.step = step.dataset.lit; else delete crew.dataset.step;
  };
  for (const step of steps) {
    step.addEventListener('pointerenter', () => mark(step));
    step.addEventListener('pointerleave', () => mark(null));
  }
  // the ring plays in, once
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  [...arcs.values()].forEach((g, i) => g.style.setProperty('--o', String(i)));
  crew.classList.add('cr-wait');
  const io = new IntersectionObserver((seen) => {
    if (!seen.some((e) => e.isIntersecting)) return;
    io.disconnect();
    crew.classList.replace('cr-wait', 'cr-play');
    // each step as its agents light: the first piece, the ten after it, the dot, and the Safety agent's again
    [[0, 0], [1, 330], [2, 1500], [3, 2200]].forEach(([i, ms]) => setTimeout(() => { for (const s of steps) s.classList.toggle('now', s === steps[i]); }, ms));
    setTimeout(() => { crew.classList.remove('cr-play'); for (const s of steps) s.classList.remove('now'); }, 3000);
  }, { threshold: 0.35 });
  io.observe(crew.querySelector('.cr-dial'));
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

// How it works has a page of its own (/how-it-works/, how-it-works/how.js); here, its violet band leads
// to it, and under the band the finale, the Signal written in what people report, on the live Signal
const how = document.getElementById('how');
later(how, () => startHow(how, getSignal));
openBelow();
