// The website's own helpers for building a page in the browser, shared by its scripts: Ask Sig
// (ai/ai.js, ai/screen.js), the Miracle Plan (ai/plan.js), the clinician's copy (ai/packet.js),
// the Library (library/library.js), My Miracle (my/my.js), the front page (home.js) and the
// pages around the Library (pages/pages.js), the one reader of the Community Signal they share,
// and calm(), which keeps the drawings' endless motion to when it can be seen. The design kit (kit/kit.js) makes markup that's the
// same in the community app; these make elements, and live on the website only. The library
// build writes this file's version into every script that imports it. Nothing here uses innerHTML.

// An element. In attrs, class and text set its className and textContent, a function under an
// on… name listens for that event, true is an empty attribute and anything else an attribute;
// null, undefined and false are left out. Children may be nested lists; null, false and '' are
// left out, and anything that isn't a node becomes text, never markup.
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== '') el.append(k instanceof Node ? k : String(k));
  return el;
}

// Static SVG markup we draw ourselves (never anyone's text) becomes a node
let parser = null;
export function svg(markup) {
  if (!parser) parser = new DOMParser();
  const doc = parser.parseFromString(markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'), 'image/svg+xml');
  return document.importNode(doc.documentElement, true);
}

// A public JSON file, fetched without cookies; null when it can't be had (offline, missing, not JSON)
export async function getJson(url) {
  try {
    const r = await fetch(url, { credentials: 'omit' });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

// Endless motion only while it can be seen. The Signal's drawings keep moving (the flow's
// particles are SVG animations, which CSS can't pause; the pulses and Sig are CSS). Off screen
// that motion still cost a phone a fifth of its main thread, so calm(el) pauses everything moving
// inside el while el is scrolled away (the is-away class, in styles.css), and holds it still for
// people who ask for less motion. After drawing new SVG inside el, call hold(el) again.
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const away = new WeakSet();
export function hold(el) {
  const still = reduced || away.has(el);
  el.classList.toggle('is-away', still);
  const svgs = el.tagName.toLowerCase() === 'svg' ? [el, ...el.querySelectorAll('svg')] : el.querySelectorAll('svg');
  for (const s of svgs) {
    if (!s.querySelector('animate, animateMotion, animateTransform')) continue;
    if (still) s.pauseAnimations();
    else s.unpauseAnimations();
  }
}
let watcher = null;
export function calm(el) {
  if (!el) return;
  if (!watcher && typeof IntersectionObserver === 'function') {
    watcher = new IntersectionObserver((seen) => seen.forEach((e) => {
      if (e.isIntersecting) away.delete(e.target); else away.add(e.target);
      hold(e.target);
    }));
  }
  watcher?.observe(el);
  hold(el);
}

// The Community Signal: the newest version the community's database published, from its public
// read API (miracle-health-community, supabase/functions/signal; the address isn't secret), or, when
// that doesn't answer within six seconds, the static copy on the community site (snapshot.json).
// Either way the same fields, plus checked_at: when the numbers were last confirmed current (the API
// says so in a header, since a version's body never changes). Read once per page, however many
// scripts ask; null when neither answers.
export const SIGNAL_URL = 'https://nerfymdslkhopsomwriv.supabase.co/functions/v1/signal';
const SIGNAL_COPY = 'https://community.miraclehealth.us/snapshot.json';
let signal = null;
export function getSignal() {
  if (!signal) signal = (async () => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 6000);
    try {
      const r = await fetch(SIGNAL_URL, { credentials: 'omit', signal: ac.signal });
      const s = r.ok ? await r.json() : null;
      if (s && typeof s === 'object' && s.signals) return { ...s, checked_at: r.headers.get('X-Signal-Checked') || s.checked_at || s.generated_at };
    } catch { /* the static copy, below */ } finally { clearTimeout(timer); }
    const s = await getJson(SIGNAL_COPY);
    return s && typeof s === 'object' && s.signals ? s : null;
  })();
  return signal;
}
