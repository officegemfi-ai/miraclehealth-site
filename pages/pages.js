// The live parts of the pages around the Library (scripts/build_pages.mjs) and the method page,
// from the community's public snapshot (aggregate totals only, updated every hour; no posts, no
// names): the Community Signal on cards and comparisons, how many founding-reporter spots are
// taken, how far the first pairs are, and the method page's check of the Signal against the
// studies. Every page reads fine without it.
import { sealSvg, levelOf } from '/library/signalviz.js?v=f388629295';
import { h, svg, getJson, getSignal } from '/lib/dom.js?v=cef2a56736';

const COMMUNITY = 'https://community.miraclehealth.us';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
// A bar's fill, set through the DOM (the pages allow no inline styles), grown in once
function grow(el, pct) {
  const w = `${Math.max(0, Math.min(100, pct))}%`;
  if (reduceMotion) { el.style.width = w; return; }
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = 'width .9s cubic-bezier(.2,.7,.2,1)'; el.style.width = w; }));
}

// The Community Signal wherever a page marks a place for it
function signals(snap) {
  const sig = snap.signals || {};
  document.querySelectorAll('.lc-sig[data-sig]').forEach((slot) => {
    const x = sig[slot.dataset.sig];
    if (!x || x.score == null) return;
    slot.replaceChildren(svg(sealSvg(x.certification || 'forum', 18)), Number(x.score).toFixed(1));
    slot.title = `Community Signal: ${Number(x.score).toFixed(1)} of 100 · ${levelOf(x.certification).name}`;
    slot.hidden = false;
  });
  document.querySelectorAll('[data-sig-none]').forEach((el) => {
    const x = sig[el.dataset.sigNone];
    el.hidden = !!(x && x.score != null);
  });
}

// How many of the 100 founding-reporter spots are taken
function founders(snap) {
  const f = snap.founders;
  if (!f || !Number.isFinite(Number(f.taken)) || !Number(f.goal)) return;
  const taken = Number(f.taken);
  const goal = Number(f.goal);
  document.querySelectorAll('[data-live="founders"]').forEach((el) => {
    el.textContent = taken >= goal ? 'All 100 spots are taken' : `${fmt(goal - taken)} of ${fmt(goal)} spots left`;
  });
  const meter = document.querySelector('[data-live="founders-meter"]');
  if (meter) {
    meter.querySelector('.fd-n').textContent = `${fmt(taken)} of ${fmt(goal)} taken`;
    meter.hidden = false;
    grow(meter.querySelector('.fd-bar i'), (100 * taken) / goal);
  }
}

// How far each of the pairs the community fills first has got
function focus(snap) {
  const list = document.querySelector('[data-live="focus"]');
  const pairs = (Array.isArray(snap.focus) ? snap.focus : []).filter((f) => f && f.id);
  if (!list || !pairs.length) return;
  list.replaceChildren(...pairs.map((f) => h('li', {}, h('a', { href: `${COMMUNITY}/#/new?c=${encodeURIComponent(f.id)}` },
    h('span', {}, h('b', {}, String(f.name || f.id).slice(0, 40)), ` for ${String(f.label || '').toLowerCase().slice(0, 40)}`),
    h('span', { class: 'n' }, Number(f.reports) >= Number(f.goal) ? 'Rated by members' : `${fmt(f.reports)} of ${fmt(f.goal)} reports`)))));
}

// The method page: does the Signal agree with the studies? The share of members' reports that
// went better, for compounds with a fact sheet and 10 or more reports, by how strong their
// studies are. Shown only once a group has three such compounds.
const GROUPS = [
  ['Good trials in people', ['strong', 'moderate']],
  ['Small studies in people', ['limited']],
  ['Animal and lab studies only', ['preclinical', 'anecdotal']],
];
function calibration(snap, index, box) {
  const sheets = new Map((index?.items || []).filter((i) => i.sheet && i.grade).map((i) => [i.id, i]));
  const rows = [];
  Object.entries(snap.signals || {}).forEach(([id, x]) => {
    const o = x && x.outcomes;
    const item = sheets.get(id);
    if (!o || !item) return;
    const n = Number(o.better || 0) + Number(o.same || 0) + Number(o.worse || 0);
    if (n < 10 || !Number.isFinite(Number(o.better_pct))) return;
    rows.push({ id, name: item.name, grade: item.grade, pct: Number(o.better_pct), n });
  });
  const groups = GROUPS.map(([label, grades]) => ({ label, rows: rows.filter((r) => grades.includes(r.grade)) }))
    .filter((g) => g.rows.length >= 3);
  if (!groups.length) {
    box.querySelector('.calib-wait').textContent = `This fills in by itself as reports come in. It needs at least three compounds with a fact sheet and 10 or more members’ reports in a group; ${rows.length === 1 ? 'one compound has' : `${fmt(rows.length)} compounds have`} that many so far.`;
    return;
  }
  box.replaceChildren(...groups.map((g) => {
    const reports = g.rows.reduce((s, r) => s + r.n, 0);
    const pct = Math.round(g.rows.reduce((s, r) => s + r.pct * r.n, 0) / reports);
    const fill = h('i', {});
    grow(fill, pct);
    return h('div', { class: 'calib-g' },
      h('div', { class: 'calib-h' }, h('b', {}, g.label), h('span', {}, `${pct}% better`)),
      h('div', { class: 'calib-bar', role: 'img', 'aria-label': `${pct}% of reports went better` }, fill),
      h('p', { class: 'calib-list' }, `${fmt(g.rows.length)} compounds, ${fmt(reports)} reports: `,
        g.rows.sort((a, b) => b.n - a.n).slice(0, 8).map((r, i) => [i ? ', ' : '', h('a', { href: `/library/${encodeURIComponent(r.id)}/` }, r.name), ` ${Math.round(r.pct)}%`])));
  }));
}

const wants = document.querySelector('.lc-sig[data-sig], [data-live="founders"], [data-live="focus"], [data-live="calibration"]');
if (wants) {
  const box = document.querySelector('[data-live="calibration"]');
  Promise.all([getSignal(), box ? getJson('/library/data/index.json') : null]).then(([snap, index]) => {
    if (!snap || !snap.signals) return;
    signals(snap);
    founders(snap);
    focus(snap);
    if (box) calibration(snap, index, box);
  });
}
