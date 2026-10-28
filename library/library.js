// The Library's live parts: search and filters on the front page, and on each compound's
// page the Community Signal, from the community's public snapshot (aggregate totals only,
// updated every hour; no posts, no names). Everything works without it, minus the numbers.
import { roseSvg, flowSvg, takeoverSvg, sealSvg, levelOf } from './signalviz.js';

const COMMUNITY = 'https://community.miraclehealth.us';
const SNAPSHOT = `${COMMUNITY}/snapshot.json`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GOAL_SHORT = {
  weight: 'Weight', muscle: 'Muscle', recovery: 'Recovery', energy: 'Energy', sleep: 'Sleep', cognition: 'Focus & mood',
  skin: 'Skin & hair', sexual: 'Sexual health', longevity: 'Aging', gut: 'Gut', immune: 'Immune', hormonal: 'Hormones',
};
const FORUM_LEVEL = { 'Very common': 1, Common: 0.72, Mixed: 0.48, Occasional: 0.3 };
const FORUM_WORD = { 'Very common': 'very common', Common: 'common', Mixed: 'mixed', Occasional: 'occasional' };
const SOURCE_FAMILY = { Reddit: 'Reddit', YouTube: 'YouTube', 'YouTube index': 'YouTube', 'Podcast / YouTube': 'Podcasts' };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else el.setAttribute(k, v === true ? '' : String(v));
  });
  kids.flat(Infinity).forEach((k) => { if (k != null && k !== false && k !== '') el.append(k instanceof Node ? k : String(k)); });
  return el;
}
// Static SVG markup we write ourselves (never anyone's text) becomes a node
const parser = new DOMParser();
function svg(markup) {
  const doc = parser.parseFromString(markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'), 'image/svg+xml');
  return document.importNode(doc.documentElement, true);
}
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(m)) return '';
  if (m < 2) return 'just now';
  if (m < 90) return `${m} minutes ago`;
  const hrs = Math.round(m / 60);
  return hrs < 36 ? `${hrs} hours ago` : `${Math.round(hrs / 24)} days ago`;
}
function countUp(el, to, digits = 1) {
  const end = Number(to) || 0;
  if (reduceMotion) { el.textContent = end.toFixed(digits); return; }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 900);
    el.textContent = (end * (1 - (1 - k) ** 3)).toFixed(digits);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function bar(pct, cls = 'bar') {
  const b = h('div', { class: cls });
  const fill = h('span', {});
  fill.style.width = '0%';   // set through the DOM: the pages allow no inline styles
  b.append(fill);
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = reduceMotion ? 'none' : 'width .9s cubic-bezier(.2,.7,.2,1)'; fill.style.width = `${Math.max(0, Math.min(100, pct))}%`; }));
  return b;
}

async function getJson(url) {
  try {
    const r = await fetch(url, { credentials: 'omit' });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
async function load() {
  const [snap, usesFile] = await Promise.all([getJson(SNAPSHOT), getJson('/library/data/uses.json')]);
  const uses = {};
  (usesFile?.uses || []).forEach((u) => { uses[u.id] = [u.label, u.goal]; });
  Object.assign(uses, snap?.uses || {});
  return { snap: snap && snap.signals ? snap : null, uses, goals: usesFile?.goals || [] };
}

// ---------------------------------------------------------------------------
// The front page: search, filters, sorting and the live numbers
// ---------------------------------------------------------------------------
const GRADE_ORDER = { strong: 0, moderate: 1, limited: 2, preclinical: 3, anecdotal: 4 };
function frontPage(grid) {
  const cards = [...grid.querySelectorAll('.lib-card')];
  const original = new Map(cards.map((c, i) => [c, i]));
  const q = document.getElementById('q');
  const goal = document.getElementById('goal');
  const ev = document.getElementById('ev');
  const sort = document.getElementById('sort');
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const chips = [...document.querySelectorAll('.lib-chips button')];
  const params = new URLSearchParams(location.search);
  let family = params.get('family') || '';
  q.value = params.get('q') || '';
  goal.value = params.get('goal') || '';
  ev.value = params.get('ev') || '';
  sort.value = params.get('sort') || 'checked';
  let scores = new Map();

  const apply = () => {
    const terms = q.value.split(/\s+/).map(fold).filter(Boolean);
    let shown = 0;
    cards.forEach((c) => {
      const text = fold(c.dataset.text);
      const ok = (!family || c.dataset.family === family)
        && (!goal.value || c.dataset.goals.split(' ').includes(goal.value))
        && (!ev.value || c.dataset.ev === ev.value)
        && terms.every((t) => text.includes(t));
      c.hidden = !ok;
      if (ok) shown += 1;
    });
    const byName = (a, b) => a.querySelector('.lc-name').textContent.localeCompare(b.querySelector('.lc-name').textContent, 'en', { sensitivity: 'base' });
    const order = [...cards].sort((a, b) => {
      if (sort.value === 'signal') return (scores.get(b.dataset.id) ?? -1) - (scores.get(a.dataset.id) ?? -1) || original.get(a) - original.get(b);
      if (sort.value === 'evidence') return (GRADE_ORDER[a.dataset.ev] ?? 9) - (GRADE_ORDER[b.dataset.ev] ?? 9) || byName(a, b);
      if (sort.value === 'name') return byName(a, b);
      return original.get(a) - original.get(b);   // fact sheets first, the page's own order
    });
    order.forEach((c) => grid.insertBefore(c, empty));
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.family === family)));
    count.textContent = `${shown} compound${shown === 1 ? '' : 's'}`;
    empty.hidden = shown > 0;
    const p = new URLSearchParams();
    if (q.value.trim()) p.set('q', q.value.trim());
    if (family) p.set('family', family);
    if (goal.value) p.set('goal', goal.value);
    if (ev.value) p.set('ev', ev.value);
    if (sort.value !== 'checked') p.set('sort', sort.value);
    history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
  };
  q.addEventListener('input', apply);
  [goal, ev, sort].forEach((s) => s.addEventListener('change', apply));
  chips.forEach((b) => b.addEventListener('click', () => { family = b.dataset.family; apply(); }));
  apply();

  load().then(({ snap }) => {
    if (!snap) return;
    const sig = snap.signals;
    scores = new Map(Object.entries(sig).map(([id, x]) => [id, Number(x.score)]));
    cards.forEach((c) => {
      const x = sig[c.dataset.id];
      const slot = c.querySelector('.lc-sig');
      if (!x || x.score == null || !slot) return;
      slot.replaceChildren(svg(sealSvg(x.certification || 'forum', 18)), Number(x.score).toFixed(1));
      slot.title = `Community Signal: ${Number(x.score).toFixed(1)} of 100 · ${levelOf(x.certification).name}`;
      slot.hidden = false;
    });
    const live = (k, v) => document.querySelectorAll(`[data-live="${k}"]`).forEach((el) => { el.textContent = v; });
    live('signals', fmt(Object.keys(sig).length));
    live('reports', fmt(snap.community?.reports));
    live('updated', `Updated ${ago(snap.generated_at)}`);
    const panel = document.querySelector('[data-live="flow"]');
    if (panel) {
      const fams = new Map();
      Object.values(sig).forEach((x) => new Set((x.source_families || []).map((f) => SOURCE_FAMILY[f] || 'Forums & reviews')).forEach((f) => fams.set(f, (fams.get(f) || 0) + 1)));
      const c = snap.community || {};
      const data = {
        sources: ['Reddit', 'YouTube', 'Podcasts', 'Forums & reviews'].map((name) => ({ name, n: fams.get(name) || 0 })),
        share: c.community_share || 0, reports: c.reports || 0, sames: c.same_total || 0, signals: Object.keys(sig).length,
        levels: { forum: c.cert_forum, early: c.cert_early, backed: c.cert_backed, verified: c.cert_verified, certified: c.cert_certified },
        weight: c.external_weight || 50,
      };
      panel.querySelector('.viz-wide')?.replaceChildren(svg(flowSvg(data)));
      panel.querySelector('.viz-compact')?.replaceChildren(svg(flowSvg(data, { compact: true })));
    }
    if (sort.value === 'signal') apply();
  });
}

// ---------------------------------------------------------------------------
// One compound: the Community Signal panel and the radar's live layers
// ---------------------------------------------------------------------------
function signalPanel(box, id, name, x, space, uses, snap) {
  const kids = [box.querySelector('.gc-head')];
  const cta = box.querySelector('.sig-cta');
  if (!x || x.score == null) {
    kids.push(h('p', { class: 'sig-wait' }, `No Community Signal for ${name} yet. It starts once three members share first-hand reports, whether it worked or not.`));
    if (space && (space[0] || space[1])) kids.push(h('p', { class: 'sig-cap' }, `${fmt(space[0])} member${space[0] === 1 ? '' : 's'} · ${fmt(space[1])} post${space[1] === 1 ? '' : 's'}`));
    box.replaceChildren(...kids, cta);
    return;
  }
  const lvl = levelOf(x.certification);
  const n = h('span', { class: 'n' }, '0.0');
  const scale = h('div', { class: 'sig-scale' }, h('i', {}));
  const fill = scale.firstChild;
  fill.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = reduceMotion ? 'none' : 'width 1s cubic-bezier(.2,.7,.2,1)'; fill.style.width = `${x.score}%`; }));
  kids.push(
    h('div', { class: 'sig-top' }, n, h('span', { class: 'of' }, '/100'),
      h('span', { class: 'lvl' }, svg(sealSvg(lvl.key, 34)), h('span', {}, h('b', { class: 'lvl-name' }, lvl.name), h('span', { class: 'lvl-rule' }, lvl.rule)))),
    scale,
    h('p', { class: 'sig-cap' }, `Overall rating · ${x.summary_label} · ${x.confidence_label} confidence · ${x.internal_share}% from members`));
  countUp(n, x.score);

  const list = x.by_use || [];
  if (list.length) {
    const rated = list.filter((u) => u.rating != null);
    kids.push(h('div', { class: 'sig-sec' },
      h('div', { class: 'row' }, h('span', { class: 'kick-sm' }, 'Rated by use'), h('span', { class: 'kick-sm' }, rated.length ? 'From first-hand reports' : 'Each use is rated after 3 reports')),
      h('div', { class: 'uses' }, list.slice(0, 6).map((u) => h('div', { class: `use ${u.rating != null ? 'rated' : 'waiting'}` },
        h('span', { class: 'use-n' }, uses[u.use]?.[0] || String(u.use).replace(/_/g, ' ')),
        h('b', { class: 'num' }, u.rating != null ? String(u.rating) : '—'),
        u.rating != null ? bar(u.rating) : h('div', { class: 'bar wait' }),
        h('span', { class: 'use-meta' }, [u.reports ? `${fmt(u.reports)} reports` : null, u.forum ? `forums: ${FORUM_WORD[u.forum] || u.forum}` : null,
          u.rating == null ? 'rated after 3 reports' : null].filter(Boolean).join(' · ')))))));
  }
  const o = x.outcomes;
  if (o) {
    const total = o.better + o.same + o.worse;
    const split = h('div', { class: 'split', role: 'img', 'aria-label': `${o.better} better, ${o.same} about the same, ${o.worse} worse` });
    [['b', o.better], ['s', o.same], ['w', o.worse]].forEach(([c, k]) => { const p = h('span', { class: c }); p.style.width = `${total ? (100 * k) / total : 0}%`; split.append(p); });
    kids.push(h('div', { class: 'sig-sec' },
      h('div', { class: 'row' }, h('span', { class: 'kick-sm' }, `How ${fmt(total)} first-hand reports went`),
        o.better_pct != null ? h('span', { class: 'kick-sm' }, `${o.better_pct}% better · 95% CI ${o.better_low}–${o.better_high}%`) : null),
      split,
      h('div', { class: 'split-key' }, h('span', { class: 'b' }, `Better ${o.better}`), h('span', { class: 's' }, `About the same ${o.same}`), h('span', { class: 'w' }, `Worse ${o.worse}`))));
  }
  if ((x.side_effects || []).length) {
    kids.push(h('div', { class: 'sig-sec' }, h('span', { class: 'kick-sm' }, 'Side effects members mention'),
      h('div', { class: 'fx' }, x.side_effects.map((s) => h('span', {}, `${s.effect} · ${s.n}`)))));
  }
  const w = snap.community?.external_weight || 50;
  kids.push(h('div', { class: 'sig-sec' }, h('span', { class: 'kick-sm' }, 'On the takeover line: from forum data to members’ own'),
    svg(takeoverSvg({ w, max: w * 6, you: { share: x.internal_share, label: name.toUpperCase().slice(0, 16) } }, { compact: true, width: 520 }))));
  if (space && (space[0] || space[1])) kids.push(h('p', { class: 'sig-cap' }, `${fmt(space[0])} member${space[0] === 1 ? '' : 's'} · ${fmt(space[1])} post${space[1] === 1 ? '' : 's'} in s/${name}`));
  kids.push(h('p', { class: 'sig-cap' }, `Updated ${ago(snap.generated_at)}`));
  box.replaceChildren(...kids, cta);
}

// The rose's live petals, all about what it's used for: how often the public forums mention
// each goal, and how many of members' first-hand reports name one (the most-named goal is
// the longest petal). How well it worked lives in "Rated by use", not here.
function radarLayers(box, x, uses) {
  let studied = {};
  try { studied = JSON.parse(box.dataset.studied || '{}'); } catch { studied = {}; }
  const forums = {}; const named = {};
  (x?.by_use || []).forEach((u) => {
    const goal = uses[u.use]?.[1];
    if (!goal) return;
    if (u.forum) forums[goal] = Math.max(forums[goal] || 0, FORUM_LEVEL[u.forum] || 0.3);
    if (u.reports) named[goal] = (named[goal] || 0) + u.reports;
  });
  const top = Math.max(0, ...Object.values(named));
  const members = Object.fromEntries(Object.entries(named).map(([g, n]) => [g, top ? Math.max(0.12, n / top) : 0]));
  if (!Object.keys(forums).length && !Object.keys(members).length) return;
  const axes = Object.keys(GOAL_SHORT).map((id) => ({ id, label: GOAL_SHORT[id] }));
  box.replaceChildren(svg(roseSvg({ axes, layers: [{ values: studied, cls: 'studied' }, { values: forums, cls: 'forums' }, { values: members, cls: 'members' }] },
    { title: 'What it is used for: what studies look at, what forums talk about and what members report on' })));   // (the "charted as reports come in" note goes too)
}

function entryPage(root) {
  const id = root.dataset.id;
  const name = root.dataset.name;
  const box = document.querySelector('[data-live="signal"]');
  load().then(({ snap, uses }) => {
    if (!snap) {
      box.querySelector('.sig-wait').textContent = 'The live numbers couldn’t load just now. You can see them in the community.';
      return;
    }
    const x = snap.signals[id];
    signalPanel(box, id, name, x, snap.spaces?.[id], uses, snap);
    const radarBox = document.querySelector('[data-live="radar"]');
    if (radarBox && x) radarLayers(radarBox, x, uses);
  });
}

const grid = document.getElementById('grid');
if (grid) frontPage(grid);
const entry = document.querySelector('.lib-entry');
if (entry) entryPage(entry);
