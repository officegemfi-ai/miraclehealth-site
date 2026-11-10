// The front page's one live part: the real compound in "Popular isn't the same as proven".
// What the studies show is published with the page, word for word from the compound's fact
// sheet (caveats included). What changes as reports come in is read here from the community's
// public files (totals only: no posts, no names): the Community Signal, what people report for
// each use and the placebo figures beside them. Then the bars are drawn in once, as the card comes
// into view. If the files can't load, the page keeps what it was published with.
import { sealSvg, levelOf } from '/library/signalviz.js?v=d8ffb3d8c3';
import { COMMUNITY, node, askLink, askAboutCompound } from '/kit/kit.js?v=f08d778478';
import { h, getJson, getSignal, calm } from '/lib/dom.js?v=cef2a56736';

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

// The hero: the Library as one graph (lib/graph.js; its data, and the still picture shown until
// it starts, by scripts/graph.mjs). Its script and data load after the page; if either can't, the
// still picture stays. Pointing at a dot traces it and clicking it opens its fact sheet; the
// "Jump to" chips and the search box ask for what they name; Sig's link follows what's traced.
const net = document.querySelector('.net[data-graph]');
if (net) startNet(net);
async function startNet(net) {
  const [mod, data] = await Promise.all([import('/lib/graph.js?v=611d29108d').catch(() => null), getJson(net.dataset.graph)]);
  if (!mod || !data || !data.counts) return;
  const css = () => {
    const cs = getComputedStyle(net);
    const v = (k, d) => { const x = parseFloat(cs.getPropertyValue(k)); return Number.isFinite(x) ? x : d; };
    const bar = net.querySelector('.net-bar'), foot = net.querySelector('.net-foot');
    return {
      cx: v('--gx', 0.6), cy: v('--gy', 0.5), unit: v('--gu', 0.27), unitH: v('--guh', 0), caption: v('--gcap', 0) > 0,
      callouts: v('--gcap', 0) > 0 ? 1 : 4, top: (bar ? bar.offsetHeight : 0) + 4, bottom: (foot ? foot.offsetHeight : 0) + 6,
    };
  };
  // labels keep clear of what's laid over the graph: the legend, the Signal card, and the words
  // (as far as their text reaches, not their whole column)
  const tight = (el) => { if (el.matches('form')) return el.getBoundingClientRect(); const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
  const over = () => {
    const r0 = net.getBoundingClientRect();
    return [...document.querySelectorAll('.net-key, .hero-card')].map((el) => el.getBoundingClientRect())
      .concat([...document.querySelectorAll('.hero-copy > *')].map(tight))
      .filter((r) => r.width && r.height && r.bottom > r0.top && r.top < r0.bottom).map((r) => [r.left - r0.left, r.top - r0.top, r.width, r.height]);
  };
  const ask = net.querySelector('.net-ask');
  const question = (s) => (s.kind === 'c' ? askAboutCompound(s.name)
    : s.kind === 's' ? `What may the ${s.name} blend (${s.parts.join(' + ')}) do for me? What does the evidence say about each part, and what do members report?`
      : s.kind === 'p' ? `In the Library, which compounds act on ${s.label}, and what do their fact sheets say?`
        : `In the Library, which compounds may change ${s.name} on a blood test, and what do their fact sheets say?`);
  // the Signal card beside the graph reads out the Signal of what's traced, when there is one:
  // its name, its number (counting to it, as the marker slides there) and its level
  const sc = document.querySelector('.hero-card');
  const hc = (k) => sc && sc.querySelector(`[data-hc="${k}"]`);
  const knob = sc && sc.querySelector('.hc-knob'), rest = sc && sc.querySelector('.hc-rest');
  let snapNow = null, was = null, counting = 0;
  const countTo = (el, to) => {
    const from = was == null ? to : was;
    was = to;
    cancelAnimationFrame(counting);
    if (reduceMotion || from === to) { el.textContent = to.toFixed(1); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      el.textContent = (from + (to - from) * (1 - (1 - k) ** 3)).toFixed(1);
      if (k < 1) counting = requestAnimationFrame(step);
    };
    counting = requestAnimationFrame(step);
  };
  const traced = (s) => {
    if (!knob || !hc('score')) return;
    const v = s && Number.isFinite(s.signal) ? Math.max(0, Math.min(100, s.signal)) : null;
    sc.classList.toggle('is-live', v != null);
    knob.style.left = v != null ? `${v}%` : '';
    if (rest) rest.style.left = v != null ? `${v}%` : '';
    if (v == null) return;
    hc('name').textContent = s.label;
    countTo(hc('score'), v);
    const lvl = levelOf(snapNow?.signals?.[s.id]?.certification || 'forum');
    hc('level').replaceChildren(seal(lvl.key), h('span', {}, lvl.name));
  };
  let g;
  try {
    g = mod.startGraph(net, data, {
      onTrace: traced,
      ...css(), layout: css, avoid: over, poster: net.querySelector('.net-poster'), ask,
      bg: { at: [css().cx, css().cy], size: [0.52, 0.62], stops: ['#111B19', '#0E1615', '#0C1312'] },
      links: { sheet: (id) => `/library/${id}/`, ask: (s) => askLink(question(s), { site: '' }) },
    });
  } catch { return; }
  getSignal().then((snap) => { snapNow = snap; g.setSignal(snap); }, () => {});
  // pointing (a mouse or a pen) and clicking; a touch screen taps
  let touch = false;
  const at = (e) => { const r = net.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  net.addEventListener('pointerdown', (e) => { touch = e.pointerType === 'touch'; }, { passive: true });
  net.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') g.pointerAt(...at(e), e.target === g.surface); }, { passive: true });
  net.addEventListener('pointerleave', () => g.pointerOut());
  g.surface.addEventListener('click', (e) => { const url = g.activate(...at(e), touch); if (url) location.assign(url); });
  ask.addEventListener('pointerenter', () => g.keep(true));
  ask.addEventListener('pointerleave', () => g.keep(false));
  // the chips: Sig traces what a chip names while it's pointed at or focused
  for (const a of document.querySelectorAll('.hero-try a[href^="/library/"]')) {
    const id = a.getAttribute('href').split('/')[2];
    a.addEventListener('pointerenter', () => g.hold(id));
    a.addEventListener('focus', () => g.hold(id));
    a.addEventListener('pointerleave', () => g.release());
    a.addEventListener('blur', () => g.release());
  }
  // the search box: what's typed lights up, as the Library's search would find it
  const q = document.getElementById('hero-q'), size = net.querySelector('.net-size'), found = net.querySelector('.net-found');
  const typed = () => {
    const r = g.light(q.value), on = q.value.trim().length > 1;
    found.textContent = !on ? '' : r.lit ? `${r.lit} of ${r.of} light up` : `none of the ${r.of} drawn`;
    found.hidden = !on; size.hidden = on;
  };
  q.addEventListener('input', typed);
  if (q.value) typed();
}

// The drawings that move without end (Sig, the takeover line's pulse, the flow) only move while
// they're on screen
document.querySelectorAll('svg.sig, svg.takeover, svg.flowviz').forEach(calm);
