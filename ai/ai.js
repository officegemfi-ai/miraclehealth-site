// Miracle AI (miraclehealth.us/ai): the chat. The conversation lives only in this browser
// tab (sessionStorage). Each message goes to the ask function (the community's Supabase
// project), which streams back each agent's steps, the answer, the cards and the final
// check as server-sent events. Nothing here uses innerHTML for anything the AI or the
// visitor wrote: text is placed with textContent, and the small amount of formatting the
// AI uses (bold, lists, Library links) is built node by node.

const app = document.getElementById('ai');
const ENDPOINT = app.dataset.endpoint;
const $ = (id) => document.getElementById(id);
const thread = $('ai-thread');
const empty = $('ai-empty');
const begin = $('ai-begin');
const form = $('ai-form');
const input = $('ai-input');
const sendBtn = $('ai-send');
const countEl = $('ai-count');
const statusEl = $('ai-status');
const newBtn = $('ai-new');
const railSub = $('rail-sub');
const LIMIT = 2000;
const KEY = 'mh-ai-chat-v1';
const META = 'mh-ai-meta-v1';      // this chat's clinician review mark, kept in the tab like the chat
const ADULT = 'mh-ai-adult';
const STACK = 'mh-ai-stack-v1';    // their stack, kept on this device only if they ask
const QR_SRC = app.dataset.qr;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

const AGENT_NAME = {
  safety: 'Safety agent', recommender: 'Recommender', synergy: 'Synergy auditor', builder: 'Stack builder',
  review: 'Safety agent', clinician: 'Your clinician',
};
const RAIL_KEY = { review: 'safety' };
// Words that may mean someone is in crisis: if an answer can't come through, help still does
const CRISIS_WORDS = /\b(?:kill(?:ing)?\s+my\s?self|kms|suicid\w*|end(?:ing)?\s+my\s+(?:own\s+)?life|end(?:ing)?\s+it\s+all|want(?:ing)?\s+to\s+die|better\s+off\s+dead|no\s+reason\s+to\s+live|don'?t\s+want\s+to\s+(?:live|be\s+alive|wake\s+up)|self[- ]?harm\w*|cut(?:ting)?\s+myself|overdos(?:e|ing))\b/i;
const GRADE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence', preclinical: 'Animal and lab studies', anecdotal: 'Anecdotal' };
const GRADE_N = { strong: 4, moderate: 3, limited: 2, preclinical: 1, anecdotal: 0 };
const FOUND = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Small human studies', preclinical: 'Animal or lab studies', anecdotal: 'User reports' };
// The headline on each option: how strong the evidence is for what the visitor asked about
const USE = {
  strong: ['Strong evidence', 4], moderate: ['Moderate evidence', 3], limited: ['Early human studies', 2],
  preclinical: ['Animal or lab only', 1], anecdotal: ['User reports only', 0], none: ['No evidence for this use', 0],
};
const STATUS = {
  approved: 'FDA-approved', otc: 'Over the counter', supplement: 'Dietary supplement', compounded: 'Compounded by prescription',
  category2: 'FDA safety-risk list', investigational: 'In clinical trials', not_approved: 'Not approved', restricted: 'Restricted',
  unclear: 'Status unclear', under_review: 'Under FDA review',
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== '') el.append(k instanceof Node ? k : String(k));
  return el;
}
const parser = new DOMParser();
function svg(markup) {
  const doc = parser.parseFromString(markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'), 'image/svg+xml');
  return document.importNode(doc.documentElement, true);
}
const ICON = {
  check: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M3 13h3l7-7-3-3-7 7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  warn: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 2 15 14H1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.5v3.5M8 11.9v.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  copy: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 3.2V3a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10h.3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  doc: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 1.8h5.2L12.2 5v9.2H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.2 8.2h3.8M6.2 10.8h3.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  print: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M4.5 6V2h7v4M4.5 11.5H2.5v-5h11v5h-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.5 9.5h7V14h-7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  qr: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9.5h1.6v1.6H9.5zM12.4 12.4H14V14h-1.6zM12.4 9.5H14v1.6h-1.6zM9.5 12.4h1.6V14H9.5z" fill="currentColor"/></svg>',
  link: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M6.8 9.2a3 3 0 0 0 4.3 0l2-2a3 3 0 0 0-4.3-4.3l-.8.8M9.2 6.8a3 3 0 0 0-4.3 0l-2 2a3 3 0 0 0 4.3 4.3l.8-.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  info: '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v4M8 4.9v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  keep: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2h8v12l-4-3-4 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
};
const GOAL_ICON = {
  stack: '<path d="M8 2 14 5 8 8 2 5z"/><path d="M2 8l6 3 6-3M2 11l6 3 6-3"/>',
  recovery: '<path d="M8 2.5v11M2.5 8h11"/>',
  muscle: '<path d="M2 8h12M4.2 5v6M11.8 5v6M1.2 6.6v2.8M14.8 6.6v2.8"/>',
  sleep: '<path d="M12.8 10.3A5.6 5.6 0 0 1 5.7 3.2a5.6 5.6 0 1 0 7.1 7.1z"/>',
  weight: '<path d="M8 14.2c-2.7 0-4.4-1.8-4.4-4.2 0-3 2.8-4.5 2.9-7.6 1.9 1.1 2.9 2.8 2.9 4.3.6-.4 1-1.2 1.1-2 1.4 1.2 1.9 3 1.9 4.6 0 2.9-1.8 4.9-4.4 4.9z"/>',
  cognition: '<path d="M8 1.6v3M8 11.4v3M1.6 8h3M11.4 8h3M3.5 3.5l2.1 2.1M10.4 10.4l2.1 2.1M12.5 3.5l-2.1 2.1M5.6 10.4l-2.1 2.1"/>',
  longevity: '<path d="M13.6 2.4C7.2 2.4 3 5.9 3 10.4c0 1.2.3 2.2.7 3.1 4.8 0 9.9-3.6 9.9-11.1zM3.7 13.5C5.5 10.1 8 8 10.6 6.4"/>',
};
const goalIcon = (g) => svg(`<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${GOAL_ICON[g] || ''}</g></svg>`);
// Browser storage can be missing or throw (private windows, blocked site data): the chat
// then simply forgets on reload
const area = (kind) => { try { return kind === 'local' ? window.localStorage : window.sessionStorage; } catch { return null; } };
const store = {
  get(k, kind = 'session') { try { const a = area(kind); return a ? JSON.parse(a.getItem(k) || 'null') : null; } catch { return null; } },
  set(k, v, kind = 'session') { try { area(kind)?.setItem(k, JSON.stringify(v)); } catch { /* full or blocked */ } },
  del(k, kind = 'session') { try { area(kind)?.removeItem(k); } catch { /* blocked */ } },
};

// ---------------------------------------------------------------------------
// Sig, the Community Signal in person: a lime muscle fibre (the same drawing as the app's)
// ---------------------------------------------------------------------------
const DROP = 'M32 6 C40 16 52 26 52 39 A20 20 0 0 1 12 39 C12 26 24 16 32 6 Z';
const INK = '#121E1D';
const FACES = {
  idle: `<g><ellipse cx="25" cy="38" rx="2.8" ry="3.6" fill="${INK}"/><ellipse cx="39" cy="38" rx="2.8" ry="3.6" fill="${INK}"/><circle cx="26" cy="36.6" r="1" fill="#fff"/><circle cx="40" cy="36.6" r="1" fill="#fff"/></g><path d="M27 46 Q32 50 37 46" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  happy: `<path d="M21.8 39 Q25 34.4 28.2 39 M35.8 39 Q39 34.4 42.2 39" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/><path d="M25.5 44.5 Q32 52.5 38.5 44.5 Z" fill="${INK}"/><path d="M28.6 47.4 Q32 49.6 35.4 47.4" fill="none" stroke="#FF8FA3" stroke-width="1.6" stroke-linecap="round"/>`,
  think: `<g><ellipse cx="25" cy="37.5" rx="2.8" ry="3.6" fill="${INK}"/><ellipse cx="39" cy="37.5" rx="2.8" ry="3.6" fill="${INK}"/><circle cx="26.4" cy="35.6" r="1.1" fill="#fff"/><circle cx="40.4" cy="35.6" r="1.1" fill="#fff"/></g><circle cx="33" cy="47" r="2.2" fill="none" stroke="${INK}" stroke-width="1.9"/><g class="sig-dots" fill="${INK}"><circle cx="49" cy="20" r="1.6"/><circle cx="54" cy="15.5" r="2"/><circle cx="59.5" cy="10" r="2.5"/></g>`,
  concerned: `<path d="M21.5 33.5 L28 35.5 M42.5 33.5 L36 35.5" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="25" cy="39" rx="2.6" ry="3.2" fill="${INK}"/><ellipse cx="39" cy="39" rx="2.6" ry="3.2" fill="${INK}"/><path d="M27 48 Q29.5 45.8 32 48 Q34.5 50.2 37 48" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>`,
};
const f2 = (n) => Number(n).toFixed(2);
function fibre(xb, top = 14, wob = 0) {
  const k = xb - 32;
  return `M${f2(32 + k * 0.06)} ${top} C${f2(32 + k * 0.35)} ${top + 8}, ${f2(32 + k * 1.02 + wob)} ${top + 16}, ${f2(xb)} ${top + 27} S${f2(xb + k * 0.02 - wob)} 56, ${f2(xb - k * 0.12)} 66`;
}
let sigN = 0;
function sigMarkup(size, mood) {
  const g = `aisg${++sigN}`;
  const detail = size >= 36;
  const n = detail ? 17 : 7;
  const xs = Array.from({ length: n }, (_, i) => 12.6 + (i * 38.8) / (n - 1));
  const dark = xs.filter((_, i) => i % 2 === 0).map((x, i) => fibre(x, 14, (i % 3) - 1)).join(' ');
  const lite = xs.filter((_, i) => i % 2 === 1).map((x, i) => fibre(x, 16, 1 - (i % 3))).join(' ');
  const grooves = [22.4, 32, 41.6].map((x) => fibre(x, 15)).join(' ');
  return `<svg class="sig ${mood}" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FFB3"/><stop offset=".5" stop-color="#D8FF3D"/><stop offset="1" stop-color="#9BE35A"/></linearGradient>
  <radialGradient id="${g}h" cx=".35" cy=".28" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <clipPath id="${g}c"><path d="${DROP}"/></clipPath>
  <linearGradient id="${g}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F4F7EE" stop-opacity=".85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
  <radialGradient id="${g}v" cx=".44" cy=".4" r=".66"><stop offset=".5" stop-color="#5E9A0E" stop-opacity="0"/><stop offset="1" stop-color="#5E9A0E" stop-opacity=".42"/></radialGradient></defs>
  <ellipse class="sig-shadow" cx="32" cy="61" rx="13" ry="2.2" fill="#000" opacity=".3"/>
  <g class="sig-body"><path d="${DROP}" fill="url(#${g})"/>
  <g clip-path="url(#${g}c)">
    <path d="${dark}" fill="none" stroke="#5E9A0E" stroke-opacity="${detail ? 0.26 : 0.3}" stroke-width="${detail ? 0.9 : 1.3}" stroke-linecap="round"/>
    <path d="${lite}" fill="none" stroke="#F6FFD2" stroke-opacity="${detail ? 0.55 : 0.45}" stroke-width="${detail ? 0.8 : 1.2}" stroke-linecap="round"/>
    <path d="${grooves}" fill="none" stroke="#5E9A0E" stroke-opacity=".15" stroke-width="${detail ? 3.4 : 4}" stroke-linecap="round"/>
    <path d="${grooves}" fill="none" stroke="#5E9A0E" stroke-opacity=".48" stroke-width="${detail ? 1 : 1.3}" stroke-linecap="round"/>
    ${detail ? `<path d="${[17.6, 26.8].map((x) => fibre(x, 22)).join(' ')}" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" stroke-dasharray="9 40"/>` : ''}
    <rect width="64" height="64" fill="url(#${g}v)"/>
    <path d="M32 6 C35 9.6 37.6 13 39.6 16.6 Q32 20.6 24.4 16.6 C26.4 13 29 9.6 32 6 Z" fill="url(#${g}t)"/>
    <path d="${DROP}" fill="none" stroke="#F6FFD2" stroke-opacity=".55" stroke-width="2.4"/>
  </g>
  <path d="${DROP}" fill="url(#${g}h)"/><path d="${DROP}" fill="none" stroke="#121E1D" stroke-opacity=".18" stroke-width="1"/>
  <circle cx="32" cy="9.2" r="3.1" fill="#fff"/><g>${FACES[mood] || FACES.idle}</g>
  <circle cx="19.8" cy="44.5" r="2.4" fill="#FF8FA3" opacity=".45"/><circle cx="44.2" cy="44.5" r="2.4" fill="#FF8FA3" opacity=".45"/></g></svg>`;
}
function setSig(el, mood) {
  if (!el || el.dataset.mood === mood) return;
  el.dataset.mood = mood;
  el.replaceChildren(svg(sigMarkup(Number(el.dataset.sig) || 36, mood)));
}
const sigs = () => document.querySelectorAll('.ai-sig');

// ---------------------------------------------------------------------------
// The answer's words: paragraphs, ### headings, - lists, 1. lists, **bold**, *italic* and
// [Name](lib:id) links to the Library. Anything else stays plain text.
// ---------------------------------------------------------------------------
let LIB_IDS = null;
fetch('/library/data/catalog.json').then((r) => (r.ok ? r.json() : [])).then((c) => { LIB_IDS = new Set(c.map((x) => x.id)); }).catch(() => {});
const isLib = (id) => /^[a-z0-9]{1,40}$/.test(id) && (!LIB_IDS || LIB_IDS.has(id));
// The Library's guides, which aren't compounds
const GUIDES = { 'lab-reports': '/library/lab-reports/' };

const INLINE = /\*\*([^*]+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])/g;
function inline(el, s) {
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    if (m.index > last) el.append(s.slice(last, m.index));
    if (m[1] != null) { const b = h('strong'); inline(b, m[1]); el.append(b); }
    else if (m[2] != null) {
      const id = /^lib:([a-z0-9-]+)$/.exec(m[3])?.[1];
      el.append(id && GUIDES[id] ? h('a', { href: GUIDES[id], text: m[2] })
        : id && isLib(id) ? h('a', { href: `/library/${id}/`, text: m[2] }) : m[2]);
    } else if (m[4] != null) el.append(m[4]);
    else if (m[5] != null) el.append(h('em', { text: m[5] }));
    last = m.index + m[0].length;
  }
  if (last < s.length) el.append(s.slice(last));
}
const BLOCK = /^\s*(#{1,6}\s|[-*•]\s|\d+[.)]\s)/;
function prose(text) {
  const out = [];
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m = /^\s*#{1,6}\s+(.*)$/.exec(line);
    if (m) { const el = h('h2'); inline(el, m[1].replace(/\*\*/g, '')); out.push(el); i++; continue; }
    const kind = /^\s*[-*•]\s+/.test(line) ? 'ul' : /^\s*\d+[.)]\s+/.test(line) ? 'ol' : '';
    if (kind) {
      const list = h(kind);
      const re = kind === 'ul' ? /^\s*[-*•]\s+/ : /^\s*\d+[.)]\s+/;
      while (i < lines.length && (re.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && list.lastChild))) {
        if (re.test(lines[i])) { const li = h('li'); inline(li, lines[i].replace(re, '')); list.append(li); }
        else { list.lastChild.append(' '); inline(list.lastChild, lines[i].trim()); }
        i++;
      }
      out.push(list);
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !BLOCK.test(lines[i])) buf.push(lines[i++]);
    const p = h('p');
    buf.forEach((b, j) => { if (j) p.append(h('br')); inline(p, b); });
    out.push(p);
  }
  return out;
}
// While words are still arriving: close an open **, hide a link's half-written address
function settle(t) {
  let s = t;
  if (((s.match(/\*\*/g) || []).length) % 2) s += '**';
  s = s.replace(/\[([^\]]*)\]\([^)]*$/, '$1').replace(/\[([^\]]*)$/, '$1');
  return s;
}

// ---------------------------------------------------------------------------
// The conversation
// ---------------------------------------------------------------------------
// Each message: {role:'user', text} or {role:'assistant', parts:[{t:'text',s}|{t:'card',card}],
// steps:[...], review, memo, ms, state:'done'|'stopped'|'error', error}
let chat = store.get(KEY) || [];
let busy = null;            // {controller, msg}
let adult = store.get(ADULT, 'local') === true;
let meta = store.get(META) || {};
const saveMeta = () => store.set(META, meta);
const save = () => store.set(KEY, chat.map((m) => (m.role === 'user' ? m : { ...m, view: undefined, showHelp: undefined, helpShown: undefined })));

// The first screen (a greeting, the box, four ways in) or the conversation
function setEmpty(on) {
  empty.hidden = !on;
  if (begin) begin.hidden = !on;
  chatEl.classList.toggle('is-empty', on);
  app.classList.toggle('is-empty', on);
}

// "The bottom" is where the conversation ends and the box to write in sits, not the page's
// footer below it
const chatEl = document.querySelector('.ai-chat');
const chatEnd = () => chatEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
function nearBottom() { return window.scrollY >= chatEnd() - 180; }
function toBottom() { window.scrollTo({ top: Math.max(0, chatEnd()), behavior: 'auto' }); }

function userNode(text) {
  return h('div', { class: 'msg me' }, h('div', { class: 'bubble', text }));
}

// A view: the DOM for one answer, kept in step with its message
function assistantNode(msg) {
  const sigEl = h('span', { class: 'msg-sig', 'data-sig': '36', 'aria-hidden': 'true' });
  const trace = h('div', { class: 'trace' });
  const sum = h('button', { class: 'trace-sum', type: 'button', 'aria-expanded': 'false' });
  const steps = h('ol', { class: 'trace-steps' });
  trace.append(sum, steps);
  sum.addEventListener('click', () => {
    const open = trace.classList.toggle('open');
    sum.setAttribute('aria-expanded', String(open));
  });
  const body = h('div', { class: 'sheet-body' });
  const foot = h('div', { class: 'sheet-foot', hidden: true });
  const sheet = h('div', { class: 'sheet' }, trace, body, foot);
  const node = h('div', { class: 'msg ai' }, sigEl, sheet);
  const view = { node, sigEl, trace, sum, steps, body, foot, stepEls: new Map(), partEls: [], cardEls: new Map(), raf: 0, revealIdx: -1, revealShown: Infinity };
  msg.view = view;
  setSig(sigEl, msg.state ? moodOf(msg) : 'think');
  for (const s of msg.steps || []) drawStep(view, s);
  drawParts(msg);
  if (msg.state) finish(msg, false);
  return node;
}
const moodOf = (msg) => ((msg.flag && msg.flag !== 'none') || msg.state === 'error' ? 'concerned' : msg.state === 'done' ? 'happy' : 'idle');

function drawStep(view, s) {
  let el = view.stepEls.get(s.id);
  if (!el) {
    el = h('li', { class: 'tstep' }, h('span', { class: 'tstep-dot', 'aria-hidden': 'true' }), h('span', { class: 'tstep-text' }));
    view.stepEls.set(s.id, el);
    view.steps.append(el);
  }
  const flagged = (s.flag && s.flag !== 'none') || s.fixed;
  el.className = `tstep ${s.status}${flagged ? ' flag' : ''}`;
  const text = el.lastChild;
  text.replaceChildren(h('span', { class: 'tstep-who', text: AGENT_NAME[s.agent] || s.agent }), h('span', { class: 'tstep-what', text: s.title || '' }));
  if (s.chips?.length) {
    text.append(h('span', { class: 'tstep-chips' }, s.chips.slice(0, 8).map((c) => (isLib(c.id) ? h('a', { href: `/library/${c.id}/`, text: c.name }) : h('span', { text: c.name })))));
  }
}

// The words arrive a paragraph at a time, once the Safety agent has cleared each one; they're
// written out on the page at reading pace rather than dropped in all at once
function drawParts(msg) {
  const view = msg.view;
  const parts = msg.parts || [];
  // Rebuild the body only where it changed: text parts re-render, cards are made once
  view.body.replaceChildren();
  let hasText = false;
  parts.forEach((p, i) => {
    if (p.t === 'text') {
      hasText = hasText || !!p.s.trim();
      const revealing = i === view.revealIdx && view.revealShown < p.s.length;
      const live = (!msg.state && i === parts.length - 1) || revealing;
      const shown = revealing ? p.s.slice(0, view.revealShown) : p.s;
      const el = h('div', { class: `prose${live ? ' streaming' : ''}` });
      el.append(...prose(live ? settle(shown) : shown));
      view.body.append(el);
    } else if (p.t === 'card') {
      let el = view.cardEls.get(p);
      if (!el) { el = cardNode(p.card, msg); view.cardEls.set(p, el); }
      view.body.append(el);
    }
  });
  if (!msg.state && !hasText) view.body.append(h('p', { class: 'waiting' }, h('i'), h('i'), h('i'), h('span', { text: waitingText(msg) })));
  if (msg.state === 'error' && msg.error) view.body.append(errorNode(msg));
}
const waitingText = (msg) => {
  const last = (msg.steps || []).filter((s) => s.status === 'run').pop();
  return last ? `${AGENT_NAME[last.agent]}: ${last.title.toLowerCase()}` : 'The agents are reading your message';
};
function schedule(msg) {
  const view = msg.view;
  if (!view || view.raf) return;
  view.raf = requestAnimationFrame(() => {
    view.raf = 0;
    const stick = nearBottom();
    // Advance the writing-out of the newest paragraph
    const p = msg.parts?.[view.revealIdx];
    let more = false;
    if (p && p.t === 'text' && view.revealShown < p.s.length) {
      const left = p.s.length - view.revealShown;
      view.revealShown += reduceMotion ? left : Math.max(3, Math.min(48, Math.ceil(left / 14)));
      more = view.revealShown < p.s.length;
    }
    drawParts(msg);
    if (more) schedule(msg);
    // Help comes first: a crisis or emergency card is brought into view, and stays there
    if (msg.showHelp) {
      msg.showHelp = false;
      msg.helpShown = true;
      view.body.querySelector('.card.help')?.scrollIntoView({ block: 'start' });
    } else if (stick && !msg.helpShown) toBottom();
  });
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
function cardNode(card, msg) {
  if (card.type === 'shortlist') return shortlistNode(card);
  if (card.type === 'questions') return questionsNode(card);
  if (card.type === 'intake') return intakeNode(card);
  if (card.type === 'audit') return auditNode(card);
  if (card.type === 'warn') {
    return h('div', { class: 'card warn', role: 'note', 'aria-labelledby': `${card.id || 'warn'}-h` },
      h('h2', { id: `${card.id || 'warn'}-h`, text: 'When to get help' }), warnGroups(card.groups), h('p', { class: 'warn-note', text: card.note || '' }));
  }
  if (card.type === 'inject') {
    return h('div', { class: 'card warn inject', role: 'note' },
      h('h2', { text: card.title || 'If you inject: the safety basics' }),
      h('ul', { class: 'inject-points' }, (card.points || []).map((t) => h('li', { text: t }))),
      warnGroups(card.groups), h('p', { class: 'warn-note', text: card.note || '' }));
  }
  if (card.type === 'crisis') {
    return h('div', { class: 'card help', role: 'note' },
      h('h2', { text: 'You don’t have to face this alone' }),
      h('p', { text: 'If you’re thinking about hurting yourself or ending your life, please reach out now. The 988 Suicide & Crisis Lifeline is free, confidential and open all day, every day. If you’re in danger right now, call 911.' }),
      h('div', { class: 'help-actions' },
        h('a', { href: 'tel:988', text: 'Call 988' }),
        h('a', { href: 'sms:988', class: 'line', text: 'Text 988' }),
        h('a', { href: 'https://988lifeline.org/chat/', class: 'line', rel: 'noopener', target: '_blank', text: 'Chat at 988lifeline.org' })));
  }
  if (card.type === 'urgent') {
    return h('div', { class: 'card help', role: 'note' },
      h('h2', { text: 'If this is happening now, get help first' }),
      h('p', { text: 'Call 911 or go to the nearest emergency room. If you took too much of something, Poison Control is at 1-800-222-1222.' }),
      h('div', { class: 'help-actions' }, h('a', { href: 'tel:911', text: 'Call 911' }), h('a', { href: 'tel:18002221222', class: 'line', text: 'Call Poison Control' })));
  }
  return h('div');
}

// Warning signs under fixed levels, most urgent first; 911 is a tap away
const WARN_ICON = { now: ICON.warn, today: ICON.clock, week: ICON.doc };
function warnGroups(groups) {
  return h('div', { class: 'warn-groups' }, (groups || []).map((g) => h('section', { class: `warn-group lvl-${g.level}` },
    h('h3', { class: 'warn-level' }, svg(WARN_ICON[g.level] || ICON.info), h('span', { text: g.label })),
    h('ul', {}, (g.signs || []).map((t) => h('li', { text: t }))),
    g.level === 'now' ? h('a', { class: 'warn-call', href: 'tel:911', text: 'Call 911' }) : null)));
}

function shortlistNode(card) {
  const el = h('div', { class: 'card short', 'data-card': card.id || '' });
  const sub = card.kind === 'yours'
    ? 'Laid out by the Stack builder: what you take or asked about, checked together. Go through it with a clinician who knows you.'
    : 'Laid out by the Stack builder. Options to raise with a clinician, not a plan to start on your own.';
  el.append(h('div', { class: 'card-head' }, h('div', {}, h('h2', { text: card.title }), h('p', { text: sub }))));
  if (card.note) el.append(h('p', { class: 'short-note' }, svg(ICON.info), h('span', { text: card.note })));
  if (card.kind === 'yours' && card.meds?.length) el.append(h('p', { class: 'short-meds', text: `Checked with what you told me you take: ${card.meds.join(', ')}` }));
  for (const it of card.items || []) el.append(pickNode(it));
  const audit = h('div', { class: 'audit' }, h('div', { class: 'audit-head busy', text: 'Synergy auditor: checking these together' }));
  if (card.audit) fillAudit(audit, card.audit);
  el.append(audit);
  if (card.kind === 'yours') el.append(stackSaveRow(card));
  el.append(h('div', { class: `review-line${meta.reviewed ? ' done' : ''}` }, ...reviewLine()));
  return el;
}
// One option: the evidence for what was asked is the headline; what studies found (each with its
// source) comes next; the Community Signal is a detail, never the biggest number
function pickNode(it) {
  const grade = it.use ? it.use.grade : it.grade;
  const [label, bars] = USE[grade] || (it.grade ? USE[it.grade] : null) || ['No fact sheet yet', 0];
  const meter = h('span', { class: `meter m${bars}`, 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'));
  const ev = h('div', { class: `pick-ev ev-${grade || 'pending'}` }, h('span', { class: 'pick-ev-label', text: label }), meter,
    h('span', { class: 'sr', text: '. Evidence for what you asked about.' }));
  const found = it.benefits?.length
    ? [it.use && !it.use.fits ? h('p', { class: 'pick-other', text: 'The Library has no studies of it for this use yet. What it has been studied for:' }) : null,
      h('ul', { class: 'pick-found', 'aria-label': `What studies found for ${it.name}` }, it.benefits.map((b) => h('li', {},
        h('span', { text: b.claim }), ' ',
        h('span', { class: `found-ev found-${b.evidence}`, text: FOUND[b.evidence] || b.evidence }),
        b.source?.url ? h('a', { class: 'found-src', href: b.source.url, target: '_blank', rel: 'noopener noreferrer', title: `${b.source.title}${b.source.year ? ` (${b.source.year})` : ''}`, text: 'Source' }) : null)))]
    : [];
  const sig = it.signal ? [
    `Community Signal ${Number(it.signal.score).toFixed(0)} (${it.signal.level.toLowerCase()})`,
    it.signal.reports ? `${it.signal.reports} first-hand report${it.signal.reports === 1 ? '' : 's'}` : '',
    it.signal.effects?.length ? `most mentioned: ${it.signal.effects.join(', ').toLowerCase()}` : '',
  ].filter(Boolean).join(' · ') : '';
  return h('div', { class: 'pick' },
    h('div', { class: 'pick-main' },
      h('div', { class: 'pick-name' }, isLib(it.id) ? h('a', { href: it.url, text: it.name }) : h('b', { text: it.name }), h('span', { class: 'pick-role', text: it.role }), ev),
      it.why ? h('p', { class: 'pick-why', text: it.why }) : null,
      ...found,
      h('div', { class: 'pick-pills' }, it.status ? h('span', { class: `st st-${it.status.key}`, text: it.tag || STATUS[it.status.key] }) : h('span', { class: 'ev ev-pending', text: it.tag || 'No fact sheet yet' })),
      sig ? h('p', { class: 'pick-signal', text: sig }) : null,
      it.caution ? h('p', { class: 'pick-warn' }, svg(ICON.info), h('span', { text: it.caution })) : null));
}
const AUDIT_LEVEL = { avoid: 'Avoid', caution: 'Caution', unknown: 'Unknown', info: 'Good to know' };
function fillAudit(box, card) {
  if (card.skipped) {
    box.replaceChildren(h('div', { class: 'audit-head', text: 'Synergy auditor: one option, nothing to check together' }));
    return;
  }
  box.replaceChildren(h('div', { class: 'audit-head', text: card.ok === false ? 'Synergy auditor: couldn’t check this set just now' : 'Synergy auditor: checked together' }));
  if (card.ok === false) return;
  if (!card.findings?.length) {
    box.append(h('p', { class: 'audit-none', text: 'No known clashes in the data. That’s an absence of data, not a green light.' }));
    return;
  }
  box.append(h('ul', {}, card.findings.map((f) => h('li', {},
    h('span', { class: `lvl lvl-${f.level}`, text: AUDIT_LEVEL[f.level] || 'Good to know' }),
    h('span', {}, h('b', { text: (f.names || f.ids || []).join(' + ') }), `: ${f.note}`)))));
}
function auditNode(card) {
  const box = h('div', { class: 'audit' });
  fillAudit(box, card);
  return h('div', { class: 'card short' }, box);
}
function questionsNode(card) {
  const btn = h('button', { class: 'mini', type: 'button' }, svg(ICON.copy), h('span', { text: 'Copy' }));
  btn.addEventListener('click', () => copy(['Questions for my clinician:', ...card.items.map((q) => `- ${q}`)].join('\n'), btn));
  return h('div', { class: 'card qs' },
    h('div', { class: 'card-head' }, h('div', {}, h('h2', { text: 'Questions for your clinician' }), h('p', { class: 'sub', text: 'Bring these to your next visit.' })), btn),
    h('ul', {}, card.items.map((q) => h('li', { text: q }))));
}

// Questions for the visitor, the way a clinician takes a history: tap an answer, type one, or
// both. The answers go back as the visitor's next message; nothing is kept anywhere else.
const NONE_LIKE = /^(?:none|no|not sure|neither|nothing|prefer not to say)\b/i;
const answerOf = (card, i) => {
  const a = card.answered?.[i];
  return a ? [...(a.picked || []), a.text || ''].filter(Boolean).join(', ') : '';
};
function intakeNode(card) {
  const closed = !!(card.answered || card.closed);
  const state = card.questions.map((_, i) => ({ picked: new Set(card.answered?.[i]?.picked || []), text: card.answered?.[i]?.text || '' }));
  const send = h('button', { class: 'btn-answers', type: 'button', text: card.answered ? 'Answers sent' : 'Send my answers' });
  const ready = () => { send.disabled = closed || !state.some((s) => s.picked.size || s.text.trim()); };
  const list = h('ol', { class: 'intake-qs' });
  card.questions.forEach((q, i) => {
    const qid = `${card.id || 'intake'}-q${i}`;
    const li = h('li', { class: 'iq' }, h('p', { class: 'iq-q', id: qid, text: q.q },
      q.options?.length ? h('span', { class: 'iq-hint', text: q.multi ? ' Pick any that apply' : ' Pick one' }) : null));
    // With several answers to tap, typing sits behind "Other…"; with one or two ("None"), the
    // answer is usually typed, so the box shows
    let other = null;
    const tapFirst = (q.options?.length || 0) > 2;
    if (q.options?.length) {
      const group = h('div', { class: 'iq-opts', role: 'group', 'aria-labelledby': qid });
      const sync = () => group.querySelectorAll('.iq-opt:not(.iq-other)').forEach((b) => b.setAttribute('aria-pressed', String(state[i].picked.has(b.dataset.v))));
      for (const o of q.options) {
        const b = h('button', { class: 'iq-opt', type: 'button', 'data-v': o, 'aria-pressed': 'false', text: o });
        b.disabled = closed;
        b.addEventListener('click', () => {
          const s = state[i].picked;
          if (s.has(o)) s.delete(o);
          else {
            // One answer, unless several can apply; "None" stands alone either way
            if (!q.multi || NONE_LIKE.test(o)) s.clear();
            else for (const x of [...s]) if (NONE_LIKE.test(x)) s.delete(x);
            s.add(o);
          }
          sync();
          ready();
        });
        group.append(b);
      }
      // Something else: a box to type in, opened on request
      if (tapFirst) {
        other = h('button', { class: 'iq-opt iq-other', type: 'button', 'aria-expanded': 'false', text: 'Other…' });
        other.disabled = closed;
        group.append(other);
      }
      li.append(group);
      sync();
    }
    const field = h('input', { class: 'iq-text', type: 'text', maxlength: '200', autocomplete: 'off', placeholder: tapFirst ? 'Your own answer' : q.options?.length ? 'Or type your answer' : 'Type your answer', 'aria-labelledby': qid });
    field.value = state[i].text;
    field.disabled = closed;
    if (other) {
      field.hidden = !state[i].text;
      other.setAttribute('aria-expanded', String(!field.hidden));
      other.addEventListener('click', () => {
        field.hidden = !field.hidden;
        other.setAttribute('aria-expanded', String(!field.hidden));
        if (!field.hidden) field.focus();
        else { field.value = ''; state[i].text = ''; ready(); }
      });
    }
    field.addEventListener('input', () => { state[i].text = field.value; ready(); });
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); send.click(); } });
    li.append(field);
    list.append(li);
  });
  send.addEventListener('click', () => {
    if (send.disabled || busy) return;
    const lines = card.questions.map((q, i) => {
      const a = [...state[i].picked, state[i].text.trim()].filter(Boolean).join(', ');
      return a ? `${q.q} ${a}` : '';
    }).filter(Boolean);
    const extra = input.value.trim();
    if (extra) lines.push(extra);
    if (!lines.length) return;
    card.answered = state.map((s) => ({ picked: [...s.picked], text: s.text.trim() }));
    ask(lines.join('\n').slice(0, LIMIT));
  });
  ready();
  const foot = h('div', { class: 'intake-foot' }, send, h('span', { class: 'intake-or', text: card.answered ? 'Sent as your next message.' : 'Or answer in your own words below.' }));
  if (closed && !card.answered) foot.hidden = true;
  return h('div', { class: `card intake${closed ? ' closed' : ''}`, role: 'group', 'aria-label': 'Questions for you' },
    h('div', { class: 'card-head' }, h('div', {}, h('h2', { text: 'A few questions for you' }), h('p', { class: 'sub', text: 'So the answer fits you. Share only what you’re comfortable with.' }))),
    list, foot);
}
// Once the visitor writes again, earlier questions are settled: answered, or passed over
function closeIntakes() {
  for (const m of chat) {
    let changed = false;
    for (const p of m.parts || []) {
      if (p.t !== 'card' || p.card.type !== 'intake' || p.card.closed) continue;
      p.card.closed = true;
      m.view?.cardEls.delete(p);
      changed = true;
    }
    if (changed && m.view) drawParts(m);
  }
}

// ---------------------------------------------------------------------------
// Clinician review: a packet the visitor takes to their own clinician (ai/packet.js makes it, in
// this browser), and their own mark once a clinician has reviewed it
// ---------------------------------------------------------------------------
const reviewedOn = () => (meta.reviewed ? window.MHPacket?.dateLabel(meta.reviewed) || meta.reviewed : '');
function packetButton(label) {
  const b = h('button', { class: 'mini pk-open', type: 'button' }, svg(ICON.doc), h('span', { text: label }));
  b.addEventListener('click', () => openPacket(b));
  return b;
}
function reviewLine() {
  return [svg(meta.reviewed ? ICON.check : ICON.clock),
    h('span', { text: meta.reviewed ? `Your clinician: reviewed (you marked it on ${reviewedOn()}).` : 'Your clinician: not yet. Take your packet to a licensed clinician who knows your history.' }),
    packetButton('Prepare packet')];
}
function refreshReview() {
  document.querySelectorAll('.card .review-line').forEach((el) => { el.classList.toggle('done', !!meta.reviewed); el.replaceChildren(...reviewLine()); });
  railFromChat();
}
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

let dialog = null;
function openPacket(opener) {
  const P = window.MHPacket;
  if (!P) return;
  const packet = P.fromChat(chat);
  packet.reason = meta.reason || '';
  if (dialog) dialog.close();
  const close = h('button', { class: 'pk-close', type: 'button', 'aria-label': 'Close the packet' }, svg(ICON.close));
  const body = h('div', { class: 'pk-scroll' });
  if (P.isEmpty(packet)) {
    body.append(h('div', { class: 'pk-empty' },
      h('h2', { id: 'packet-h', text: 'Nothing to review yet' }),
      h('p', { text: 'Ask Miracle AI about a goal or the stack you take. Once it has laid out your stack, options or questions for your clinician, they’re gathered here.' })));
  }
  // The buttons stay at the top, outside what scrolls
  let actions = null;
  if (!P.isEmpty(packet)) {
    const doc = P.render(packet, { level: 2 });
    const share = shareBox(packet);
    actions = share.bar;
    body.append(share.panel, reasonBox(packet, doc), doc, afterBox());
  }
  const dlg = h('dialog', { class: 'pk-dialog', 'aria-labelledby': 'packet-h' },
    h('div', { class: 'pk-bar' }, h('span', { class: 'pk-bar-title', text: 'Your clinician review packet' }), close), actions, body);
  close.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    document.body.classList.remove('pk-on');
    dlg.remove();
    if (dialog === dlg) dialog = null;
    if (opener?.isConnected) opener.focus();
  });
  dialog = dlg;
  document.body.append(dlg);
  document.body.classList.add('pk-on');
  dlg.showModal();
  close.focus();
}
function shareBox(packet) {
  const P = window.MHPacket;
  const qrBox = h('div', { class: 'pk-qr', hidden: true });
  const status = h('p', { class: 'pk-status', role: 'status' });
  const act = (label, icon, fn) => {
    const b = h('button', { class: 'pk-act', type: 'button' }, svg(ICON[icon]), h('span', { text: label }));
    b.addEventListener('click', () => fn(b));
    return b;
  };
  const qrBtn = act('Show QR code', 'qr', async (b) => {
    if (!qrBox.hidden) { qrBox.hidden = true; b.lastChild.textContent = 'Show QR code'; return; }
    status.textContent = 'Making the code…';
    try {
      const { svg: code } = await P.qrSvg(await P.link(packet), QR_SRC);
      qrBox.replaceChildren(code, h('p', { text: 'Your clinician scans this with their phone camera to open the packet. It’s carried inside the code itself, so Miracle Health never receives it. Anyone with the code can read it: show it only to your clinician.' }));
      qrBox.hidden = false;
      b.lastChild.textContent = 'Hide QR code';
      status.textContent = '';
      qrBox.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } catch {
      status.textContent = 'The code couldn’t be made just now. Copy the link or print the packet instead.';
    }
  });
  return {
    bar: h('div', { class: 'pk-actions', role: 'group', 'aria-label': 'Take it to your clinician' },
      act('Print or save as PDF', 'print', () => window.print()),
      qrBtn,
      act('Copy link', 'link', async (b) => copy(await P.link(packet), b)),
      act('Copy as text', 'copy', (b) => copy(P.text(packet), b))),
    panel: h('div', { class: 'pk-share' },
      h('p', { class: 'pk-share-note', text: 'Made in your browser. Miracle Health doesn’t receive or keep it.' }),
      status, qrBox),
  };
}
// Why they're going, in their words: it heads the packet (and stays in this tab only)
function reasonBox(packet, doc) {
  const field = h('input', { class: 'pk-reason-input', id: 'pk-reason', type: 'text', maxlength: '200', autocomplete: 'off', placeholder: 'For example: a shoulder injury that isn’t healing' });
  field.value = packet.reason;
  field.addEventListener('input', () => {
    packet.reason = field.value.trim();
    meta.reason = packet.reason;
    saveMeta();
    const line = doc.querySelector('.pk-reason');
    if (line) line.replaceWith(window.MHPacket.render(packet, { level: 2 }).querySelector('.pk-reason'));
  });
  return h('div', { class: 'pk-reason-box' }, h('label', { for: 'pk-reason', text: 'Reason for your visit (optional; it heads the packet)' }), field);
}
function afterBox() {
  const mark = h('button', { class: 'pk-reviewed', type: 'button' });
  const sync = () => {
    mark.setAttribute('aria-pressed', String(!!meta.reviewed));
    mark.replaceChildren(svg(ICON.check), h('span', { text: meta.reviewed ? `Reviewed on ${reviewedOn()}` : 'My clinician reviewed this' }));
  };
  mark.addEventListener('click', () => {
    meta.reviewed = meta.reviewed ? null : localDate();
    saveMeta();
    sync();
    refreshReview();
  });
  sync();
  const tell = h('button', { class: 'pk-tell', type: 'button', text: 'Tell Miracle AI what they said' });
  tell.addEventListener('click', () => {
    dialog?.close();
    input.value = 'My clinician reviewed my plan. They said: ';
    grow();
    updateSend();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
  return h('section', { class: 'pk-after', 'aria-labelledby': 'pk-after-h' },
    h('h3', { id: 'pk-after-h', text: 'After your visit' }),
    h('p', { text: 'When a licensed clinician has gone through it with you, mark it reviewed. Then tell Miracle AI what they said, and it can help with the next step.' }),
    h('div', { class: 'pk-after-actions' }, mark, tell));
}

// ---------------------------------------------------------------------------
// Their stack, kept on this device only if they ask, so they can come back to it: the
// compounds and the medicines they mentioned. It's never sent anywhere unless they ask Miracle
// AI about it again; a link can carry it to their other devices (after "#", which browsers
// never send to a server).
// ---------------------------------------------------------------------------
const cleanName = (x, n = 60) => String(x ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const libId = (id) => typeof id === 'string' && /^[a-z0-9]{1,40}$/.test(id);
const dayLabel = (iso) => window.MHPacket?.dateLabel(iso) || iso;
const GRADE_WORDS = { strong: 'strong', moderate: 'moderate', limited: 'limited', preclinical: 'animal and lab studies only', anecdotal: 'user reports only' };
const listOf = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
let libIndexP = null;
const libIndex = () => (libIndexP ||= fetch('/library/data/index.json').then((r) => (r.ok ? r.json() : null)).catch(() => null));

function savedStack() {
  const st = store.get(STACK, 'local');
  if (!st || st.v !== 1 || !Array.isArray(st.items)) return null;
  const items = st.items.filter((i) => i && libId(i.id)).slice(0, 8)
    .map((i) => ({ id: i.id, name: cleanName(i.name) || i.id, status: cleanName(i.status, 80), grade: GRADE[i.grade] ? i.grade : '' }));
  if (!items.length) return null;
  return {
    v: 1, saved: /^\d{4}-\d{2}-\d{2}$/.test(st.saved) ? st.saved : '', items,
    meds: (Array.isArray(st.meds) ? st.meds : []).map((m) => cleanName(m, 40)).filter(Boolean).slice(0, 6),
  };
}
const stackFrom = (card) => ({
  v: 1, saved: localDate(),
  items: (card.items || []).filter((it) => libId(it.id)).slice(0, 8).map((it) => ({ id: it.id, name: cleanName(it.name), status: cleanName(it.status?.label, 80), grade: it.grade || '' })),
  meds: (card.meds || []).map((m) => cleanName(m, 40)).filter(Boolean).slice(0, 6),
});
const stackKey = (st) => `${st.items.map((i) => i.id).sort().join('+')}|${st.meds.map((m) => m.toLowerCase()).sort().join('+')}`;
const stackQuestion = (st) => `I take ${listOf(st.items.map((i) => i.name))}.${st.meds.length ? ` My medicines: ${st.meds.join(', ')}.` : ''} Is that combination OK?`;
const b64u = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (text) => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
const stackLink = (st) => `${location.origin}/ai/#stack=${b64u(JSON.stringify({ v: 1, i: st.items.map((i) => i.id), m: st.meds }))}`;
function saveStack(st) { store.set(STACK, st, 'local'); refreshStack(); }
function forgetStack() { store.del(STACK, 'local'); refreshStack(); }

// What's changed in the Library for their compounds since they saved them
async function whatChanged(st) {
  const index = await libIndex();
  if (!index) return null;
  const byId = new Map((index.items || []).map((it) => [it.id, it]));
  // One file for everything (no request per compound, so nothing says which ones are theirs)
  return st.items.flatMap((i) => {
    const it = byId.get(i.id);
    const out = [];
    if (!it) return out;
    if (it.status_label && i.status && it.status_label !== i.status) out.push(`${i.name}: US status is now “${it.status_label}” (was “${i.status}”).`);
    if (it.grade && i.grade && it.grade !== i.grade) out.push(`${i.name}: the Library’s evidence grade is now ${GRADE_WORDS[it.grade] || it.grade} (was ${GRADE_WORDS[i.grade] || i.grade}).`);
    if (it.sheet && !i.grade && !i.status) out.push(`${i.name}: now has a Library fact sheet.`);
    else if (st.saved && /^\d{4}-\d{2}-\d{2}$/.test(it.checked || '') && it.checked > st.saved) out.push(`${i.name}: fact sheet checked again on ${dayLabel(it.checked)}.`);
    return out;
  });
}

// On their stack's card: keep it on this device, or forget it
function stackSaveRow(card) {
  const row = h('div', { class: 'stack-save' });
  row.redraw = () => {
    const saved = savedStack();
    const mine = stackFrom(card);
    if (!mine.items.length) { row.hidden = true; return; }
    if (saved && stackKey(saved) === stackKey(mine)) {
      const forget = h('button', { class: 'linkish', type: 'button', text: 'Forget it' });
      forget.addEventListener('click', forgetStack);
      row.replaceChildren(svg(ICON.check), h('span', { text: `Saved on this device${saved.saved ? ` on ${dayLabel(saved.saved)}` : ''}. ` }), forget);
      return;
    }
    const btn = h('button', { class: 'mini', type: 'button' }, svg(ICON.keep), h('span', { text: saved ? 'Save this one instead' : 'Save on this device' }));
    btn.addEventListener('click', () => {
      saveStack(mine);
      if (!savedStack()) row.replaceChildren(h('span', { text: 'This browser isn’t keeping anything for this site, so it couldn’t be saved.' }));
    });
    row.replaceChildren(h('span', { class: 'stack-save-why', text: 'Keep this stack for next time, on this device only. Miracle Health never receives it.' }), btn);
  };
  row.redraw();
  return row;
}

// Their saved stack, on the first screen (and beside the chat on wide screens)
function savedBox(where) {
  const st = savedStack();
  if (!st) return null;
  const check = h('button', { class: 'saved-check', type: 'button', text: 'Check it again' });
  check.addEventListener('click', () => ask(stackQuestion(st)));
  const link = h('button', { class: 'linkish', type: 'button', text: 'Copy a link to it' });
  link.addEventListener('click', () => copy(stackLink(st), link));
  const forget = h('button', { class: 'linkish', type: 'button', text: 'Forget it' });
  forget.addEventListener('click', forgetStack);
  const changes = h('div', { class: 'saved-changes' });
  whatChanged(st).then((lines) => {
    if (lines == null) return;
    changes.replaceChildren(lines.length
      ? h('ul', { 'aria-label': 'What’s changed since you saved it' }, lines.map((t) => h('li', { text: t })))
      : h('p', { text: 'Nothing has changed in the Library for these since you saved them.' }));
  });
  const hid = `saved-${where}-h`;
  return h('section', { class: 'saved-box', 'aria-labelledby': hid },
    h('h2', { id: hid, text: 'Your saved stack' }),
    h('p', { class: 'saved-names' }, st.items.map((i, n) => [n ? ' · ' : '', isLib(i.id) ? h('a', { href: `/library/${i.id}/`, text: i.name }) : i.name])),
    st.meds.length ? h('p', { class: 'saved-meds', text: `With your medicines: ${st.meds.join(', ')}` }) : null,
    changes,
    h('div', { class: 'saved-actions' }, check, link, forget),
    h('p', { class: 'saved-note', text: `Saved on this device${st.saved ? ` on ${dayLabel(st.saved)}` : ''}. Miracle Health never receives it.` }));
}
function refreshStack() {
  for (const [id, where] of [['ai-saved', 'start'], ['rail-saved', 'rail']]) {
    const host = $(id);
    if (!host) continue;
    const box = savedBox(where);
    host.replaceChildren(...(box ? [box] : []));
    host.hidden = !box;
  }
  document.querySelectorAll('.stack-save').forEach((row) => row.redraw?.());
}

// A stack from their own link (#stack=...): offered, never saved without asking
async function stackFromLink() {
  const m = /^#stack=([A-Za-z0-9_-]{4,3000})$/.exec(location.hash);
  if (!m) return;
  window.history.replaceState(null, '', location.pathname + location.search);
  let raw = null;
  try { raw = JSON.parse(unb64u(m[1])); } catch { return; }
  if (!raw || raw.v !== 1 || !Array.isArray(raw.i)) return;
  const index = await libIndex();
  const byId = new Map((index?.items || []).map((it) => [it.id, it]));
  const items = [...new Set(raw.i)].filter((id) => libId(id) && byId.has(id)).slice(0, 8)
    .map((id) => ({ id, name: byId.get(id).name, status: byId.get(id).status_label || '', grade: byId.get(id).grade || '' }));
  if (!items.length) return;
  const st = { v: 1, saved: localDate(), items, meds: (Array.isArray(raw.m) ? raw.m : []).map((x) => cleanName(x, 40)).filter(Boolean).slice(0, 6) };
  const save = h('button', { class: 'saved-check', type: 'button', text: 'Save it on this device' });
  const now = h('button', { class: 'linkish', type: 'button', text: 'Just check it now' });
  const no = h('button', { class: 'linkish', type: 'button', text: 'No thanks' });
  save.addEventListener('click', () => saveStack(st));
  now.addEventListener('click', () => { refreshStack(); ask(stackQuestion(st)); });
  no.addEventListener('click', refreshStack);
  const host = $(chat.length ? 'rail-saved' : 'ai-saved');
  if (!host) return;
  host.replaceChildren(h('section', { class: 'saved-box incoming', 'aria-labelledby': 'saved-in-h' },
    h('h2', { id: 'saved-in-h', text: 'A stack from your link' }),
    h('p', { class: 'saved-names', text: st.items.map((i) => i.name).join(' · ') }),
    st.meds.length ? h('p', { class: 'saved-meds', text: `With your medicines: ${st.meds.join(', ')}` }) : null,
    h('div', { class: 'saved-actions' }, save, now, no)));
  host.hidden = false;
}

// ---------------------------------------------------------------------------
// Copying, for the visitor to take to a clinician
// ---------------------------------------------------------------------------
async function copy(text, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = h('textarea', { class: 'sr', 'aria-hidden': 'true' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
  }
  if (btn) {
    const label = btn.querySelector('span');
    const was = label ? label.textContent : btn.textContent;
    const say = ok ? 'Copied' : 'Couldn’t copy';
    if (label) label.textContent = say; else btn.textContent = say;
    btn.classList.add('done');
    setTimeout(() => { if (label) label.textContent = was; else btn.textContent = was; btn.classList.remove('done'); }, 1800);
  }
}
// ---------------------------------------------------------------------------
// The agents beside the chat
// ---------------------------------------------------------------------------
const railAgents = () => document.querySelectorAll('.agent-rail .agent');
function railReset(text, active = true) {
  railAgents().forEach((a) => { a.className = 'agent'; a.querySelector('.agent-now').textContent = ''; });
  document.querySelector('.agent-rail')?.classList.toggle('active', active);
  if (railSub) railSub.textContent = text;
}
function railStep(s) {
  const key = RAIL_KEY[s.agent] || s.agent;
  const el = document.querySelector(`.agent-rail .agent[data-agent="${key}"]`);
  if (!el) return;
  const flagged = (s.flag && s.flag !== 'none') || s.fixed;
  el.className = `agent ${s.status === 'pending' ? 'pending' : s.status === 'run' ? 'run' : 'done'}${flagged ? ' flag' : ''}`;
  el.querySelector('.agent-now').textContent = s.title;
}
function railDone(msg) {
  railAgents().forEach((a) => { if (!/\b(done|pending|flag|run)\b/.test(a.className)) a.classList.add('unused'); else a.classList.remove('run'); });
  if (railSub) railSub.textContent = msg.state === 'done' ? `Answered in ${(msg.ms / 1000).toFixed(1)} s` : msg.state === 'stopped' ? 'Stopped' : 'Something went wrong';
  const doc = document.querySelector('.agent-rail .agent[data-agent="clinician"]');
  if (doc && meta.reviewed) {
    doc.className = 'agent done reviewed';
    doc.querySelector('.agent-now').textContent = `Reviewed: you marked it on ${reviewedOn()}`;
  }
}
// The rail as the last answer left it (after a reload, or when the review mark changes)
function railFromChat() {
  if (busy) return;
  const last = [...chat].reverse().find((m) => m.role === 'assistant' && m.state);
  if (!last) return;
  railReset('');
  (last.steps || []).forEach(railStep);
  railDone(last);
}
function railNotes() {
  const box = $('rail-notes');
  if (!box) return;
  const chips = new Map();
  const qs = [];
  for (const m of chat) {
    if (m.role !== 'assistant') continue;
    for (const p of m.parts || []) {
      if (p.t === 'card' && p.card.type === 'shortlist') p.card.items.forEach((it) => chips.set(it.id, it.name));
      if (p.t === 'card' && p.card.type === 'questions') p.card.items.forEach((q) => { if (!qs.includes(q)) qs.push(q); });
    }
    for (const s of m.steps || []) for (const c of s.chips || []) if (s.agent === 'recommender' && /fact sheet/i.test(s.title)) chips.set(c.id, c.name);
  }
  box.hidden = !chips.size && !qs.length;
  $('rail-chips').replaceChildren(...[...chips].slice(0, 16).map(([id, name]) => (isLib(id) ? h('a', { href: `/library/${id}/`, text: name }) : h('span', { text: name }))));
  $('rail-qs').hidden = !qs.length;
  $('rail-qlist').replaceChildren(...qs.slice(-8).map((q) => h('li', { text: q })));
}

// ---------------------------------------------------------------------------
// Sending, and reading the stream
// ---------------------------------------------------------------------------
function setBusy(on) {
  sendBtn.classList.toggle('stop', on);
  sendBtn.setAttribute('aria-label', on ? 'Stop' : 'Send');
  statusEl.textContent = on ? 'The agents are working' : 'Ready';
  statusEl.classList.toggle('busy', on);
  sigs().forEach((el) => setSig(el, on ? 'think' : 'idle'));
  thread.setAttribute('aria-busy', String(on));
  updateSend();
}
function updateSend() {
  const n = input.value.length;
  countEl.textContent = n > LIMIT - 300 ? `${(LIMIT - n).toLocaleString('en-US')} left` : '';
  countEl.classList.toggle('over', n > LIMIT);
  sendBtn.disabled = !busy && (!input.value.trim() || n > LIMIT);
}
function grow() {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 200)}px`;
}

function history() {
  // Miracle AI's replies go back with the signature the server gave them
  return chat.filter((m) => m.role === 'user' || (m.memo || '').trim())
    .map((m) => (m.role === 'user' ? { role: 'user', content: m.text } : { role: 'assistant', content: m.memo, sig: m.sig || '' }));
}

function ask(text) {
  const t = text.trim();
  if (!t || busy) return;
  if (!adult) { gate(t); return; }
  closeIntakes();
  $('ai-gate')?.remove();
  input.value = '';
  grow();
  setEmpty(false);
  newBtn.hidden = false;
  const um = { role: 'user', text: t };
  chat.push(um);
  thread.append(userNode(t));
  const am = { role: 'assistant', parts: [], steps: [] };
  chat.push(am);
  thread.append(assistantNode(am));
  toBottom();
  save();
  run(am);
}

async function run(am) {
  const controller = new AbortController();
  busy = { controller, msg: am };
  railReset('Working on your message');
  setBusy(true);
  const t0 = performance.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history() }), signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      let msg = '';
      try { msg = (await res.json()).error || ''; } catch { /* not JSON */ }
      throw Object.assign(new Error(msg || `HTTP ${res.status}`), { friendly: msg || errorText(res.status) });
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.search(/\r?\n\r?\n/)) >= 0) {
        const chunk = buf.slice(0, i);
        buf = buf.slice(i).replace(/^\r?\n\r?\n/, '');
        let ev = 'message';
        let data = '';
        for (const line of chunk.split(/\r?\n/)) {
          if (line.startsWith('event:')) ev = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (data) onEvent(am, ev, JSON.parse(data));
      }
    }
    if (!am.state) {
      if (!am.memo) throw Object.assign(new Error('cut off'), { friendly: 'The answer was cut off. Please try again.' });
    }
  } catch (e) {
    if (controller.signal.aborted) {
      am.state = 'stopped';
      am.memo = textOf(am) ? `${textOf(am)}\n\n[Stopped by the member before the end]` : '';
    } else {
      am.state = 'error';
      am.error = e.friendly || 'Couldn’t reach Miracle AI. Check your connection and try again.';
    }
  }
  am.ms = am.ms || Math.round(performance.now() - t0);
  if (!am.state) am.state = 'done';
  busy = null;
  finish(am, true);
  setBusy(false);
  railDone(am);
  railNotes();
  sigs().forEach((el) => setSig(el, moodOf(am)));
  save();
  if (!coarse) input.focus();
}
const errorText = (status) => (status === 429 ? 'Too many messages for now. Please try again later.'
  : status === 413 ? 'That message is too long. Keep it under 2,000 characters.'
  : status === 403 ? 'Miracle AI only answers on miraclehealth.us.'
  : 'Miracle AI is resting for a moment. Please try again shortly.');
const textOf = (m) => (m.parts || []).filter((p) => p.t === 'text').map((p) => p.s).join('\n\n').trim();

function onEvent(am, ev, d) {
  const view = am.view;
  switch (ev) {
    case 'step': {
      const i = am.steps.findIndex((s) => s.id === d.id);
      if (i >= 0) am.steps[i] = { ...am.steps[i], ...d }; else am.steps.push(d);
      if (d.flag && d.flag !== 'none') am.flag = d.flag;
      drawStep(view, am.steps.find((s) => s.id === d.id));
      railStep(d);
      schedule(am);
      break;
    }
    case 'text': {
      const last = am.parts[am.parts.length - 1];
      if (last && last.t === 'text') last.s += d.d;
      else {
        am.parts.push({ t: 'text', s: d.d.replace(/^\n+/, '') });
        view.revealIdx = am.parts.length - 1;
        view.revealShown = 0;
      }
      schedule(am);
      break;
    }
    case 'card': {
      if (d.type === 'audit' && d.for) {
        const host = am.parts.find((p) => p.t === 'card' && p.card.type === 'shortlist' && p.card.id === d.for);
        if (host) {
          host.card.audit = d;
          const box = view.cardEls.get(host)?.querySelector('.audit');
          if (box) fillAudit(box, d);
          break;
        }
      }
      const part = { t: 'card', card: d };
      // A card waits for the words before it to be written out
      view.revealShown = Infinity;
      if (d.type === 'crisis' || d.type === 'urgent') {
        am.parts.unshift(part);
        am.showHelp = true;
        if (d.type === 'crisis') setTimeout(helpPin, 0);
        if (Number.isFinite(view.revealIdx)) view.revealIdx += 1;
      } else am.parts.push(part);
      schedule(am);
      break;
    }
    case 'review':
      am.review = { ok: !!d.ok, edited: d.edited || 0, held: d.held || 0 };
      if (!d.ok && d.text) {
        // The final check rewrote the reply: its words replace the streamed ones
        const first = am.parts.findIndex((p) => p.t === 'text');
        am.parts = am.parts.filter((p) => p.t !== 'text');
        am.parts.splice(first < 0 ? 0 : Math.min(first, am.parts.length), 0, { t: 'text', s: d.text });
        schedule(am);
      }
      break;
    case 'done':
      am.memo = d.memo || textOf(am);
      am.sig = d.sig || '';
      am.ms = d.ms || 0;
      am.state = 'done';
      break;
    case 'error':
      am.state = 'error';
      am.error = d.message || 'Something went wrong. Please try again.';
      am.memo = '';
      break;
    default:
      break;
  }
}

function finish(am, live) {
  const view = am.view;
  if (!view) return;
  if (view.raf) { cancelAnimationFrame(view.raf); view.raf = 0; }
  view.revealShown = Infinity;
  // Steps still "running" when the turn ended didn't finish
  for (const s of am.steps) if (s.status === 'run') { s.status = 'done'; drawStep(view, s); }
  // A shortlist the auditor had nothing to check (one option, no medicines) says so
  for (const p of am.parts || []) {
    if (p.t === 'card' && p.card.type === 'shortlist' && !p.card.audit) {
      p.card.audit = { skipped: true };
      const box = view.cardEls.get(p)?.querySelector('.audit');
      if (box) fillAudit(box, p.card.audit);
    }
  }
  drawParts(am);
  // Agents that actually ran; the visitor's own clinician isn't one of them
  const ran = new Set(am.steps.map((s) => (s.agent === 'review' ? 'safety' : s.agent)).filter((a) => a !== 'clinician'));
  view.trace.classList.add('done');
  view.sum.textContent = am.steps.length
    ? `${ran.size} agent${ran.size === 1 ? '' : 's'} worked on this${am.ms ? ` · ${(am.ms / 1000).toFixed(1)} s` : ''}`
    : 'No steps recorded';
  view.trace.hidden = !am.steps.length;
  setSig(view.sigEl, moodOf(am));
  // The foot: whether the Safety agent cleared it or edited it, and copying the answer
  view.foot.replaceChildren();
  if (am.state === 'done' || am.state === 'stopped') {
    const edited = am.review && am.review.ok === false;
    const r = am.review || {};
    const changes = [r.edited ? `edited ${r.edited} part${r.edited === 1 ? '' : 's'}` : '', r.held ? `held back ${r.held}` : ''].filter(Boolean).join(' and ');
    const said = am.state === 'stopped' ? 'Stopped before the end; what’s shown was checked by the Safety agent'
      : edited ? `The Safety agent ${changes || 'edited this'} before you saw it`
      : am.review ? 'Every part checked by the Safety agent before you saw it' : 'Answered';
    const btn = h('button', { class: 'mini', type: 'button' }, svg(ICON.copy), h('span', { text: 'Copy' }));
    btn.addEventListener('click', () => copy(textOf(am), btn));
    const forClinician = (am.parts || []).some((p) => p.t === 'card' && (p.card.type === 'shortlist' || p.card.type === 'questions'));
    view.foot.append(h('span', { class: `cleared${edited ? ' edited' : ''}` }, svg(edited ? ICON.edit : ICON.check), h('span', { text: said })),
      h('span', { class: 'foot-actions' }, forClinician ? packetButton('Clinician packet') : null, btn));
    view.foot.hidden = false;
  }
  helpPin();
  if (live && !am.helpShown) {
    const stick = nearBottom();
    if (stick) toBottom();
  }
}

// After a sign of crisis, 988 stays in reach for the rest of the chat
// Once someone has written about wanting to die or hurt themselves, 988 stays on screen for the
// rest of the chat, even if the answer couldn't come
function helpPin() {
  const show = chat.some((m) => (m.role === 'user' && CRISIS_WORDS.test(m.text || ''))
    || (m.role === 'assistant' && (m.flag === 'self_harm' || (m.parts || []).some((p) => p.t === 'card' && p.card.type === 'crisis'))));
  const pin = $('ai-help-pin');
  if (!show) { pin?.remove(); return; }
  if (pin) return;
  document.querySelector('.ai-bar')?.after(h('div', { class: 'help-pin', id: 'ai-help-pin', role: 'note' },
    h('span', { text: 'You can call or text 988 any time, day or night.' }),
    h('span', { class: 'help-pin-actions' },
      h('a', { href: 'tel:988', text: 'Call 988' }),
      h('a', { href: 'sms:988', text: 'Text 988' }),
      h('a', { href: 'https://988lifeline.org/chat/', target: '_blank', rel: 'noopener', text: 'Chat' }))));
}

function errorNode(am) {
  const retry = h('button', { class: 'mini', type: 'button', text: 'Try again' });
  retry.addEventListener('click', () => {
    if (busy) return;
    am.state = undefined; am.error = undefined; am.parts = []; am.steps = []; am.review = undefined; am.flag = undefined;
    const old = am.view.node;
    old.replaceWith(assistantNode(am));
    save();
    run(am);
  });
  const i = chat.indexOf(am);
  const said = i > 0 && chat[i - 1].role === 'user' ? chat[i - 1].text : '';
  const oops = h('div', { class: 'oops', role: 'alert' }, h('span', { text: am.error }), retry);
  // A message that may come from someone in crisis gets help even when no answer can
  return CRISIS_WORDS.test(said) ? h('div', {}, cardNode({ type: 'crisis' }), oops) : oops;
}

// ---------------------------------------------------------------------------
// Before the first message: adults only, and what Miracle AI is
// ---------------------------------------------------------------------------
function gate(pending) {
  input.value = '';
  grow();
  updateSend();
  const shown = $('ai-gate');
  if (shown) {
    // Asked again before answering the check: the newest question is the one that waits
    shown.dataset.q = pending;
    shown.querySelector('.gate-q span:last-child').textContent = pending;
    shown.querySelector('.gate-yes').focus();
    return;
  }
  const yes = h('button', { class: 'gate-yes', type: 'button', text: 'I’m 18 or older' });
  const no = h('a', { class: 'gate-no', href: '/library/', text: 'Not now: open the Library' });
  const box = h('div', { class: 'gate', id: 'ai-gate', role: 'region', 'aria-labelledby': 'ai-gate-h', 'data-q': pending },
    h('p', { class: 'gate-q' }, h('span', { class: 'sr', text: 'Your question, waiting: ' }), h('span', { text: pending })),
    h('h2', { id: 'ai-gate-h', text: 'One check before Miracle AI answers' }),
    h('p', { text: 'Miracle AI is for adults 18 and over.' }),
    h('div', { class: 'gate-actions' }, yes, no));
  yes.addEventListener('click', () => {
    adult = true;
    store.set(ADULT, true, 'local');
    const q = box.dataset.q || pending;
    box.remove();
    ask(q);
  });
  setEmpty(false);
  thread.append(box);
  yes.focus();
  toBottom();
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (busy) { busy.controller.abort(); return; }
  if (input.value.length > LIMIT) return;
  ask(input.value);
});
input.addEventListener('input', () => { grow(); updateSend(); });
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !coarse) {
    e.preventDefault();
    if (!busy) form.requestSubmit();
  }
});
document.querySelectorAll('[data-ask]').forEach((b) => b.addEventListener('click', () => ask(b.dataset.ask)));
document.querySelectorAll('[data-prefill]').forEach((b) => b.addEventListener('click', () => {
  input.value = b.dataset.prefill;
  grow();
  updateSend();
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}));
document.querySelectorAll('.ai-start').forEach((b) => b.querySelector('.start-ico')?.append(goalIcon(b.dataset.goal)));
newBtn.addEventListener('click', () => {
  if (busy) busy.controller.abort();
  chat = [];
  store.del(KEY);
  meta = {};
  store.del(META);
  helpPin();
  thread.querySelectorAll('.msg,.gate').forEach((n) => n.remove());
  setEmpty(true);
  refreshStack();
  newBtn.hidden = true;
  railReset('Waiting for your first message', false);
  railNotes();
  input.focus();
});
$('rail-copy')?.addEventListener('click', (e) => openPacket(e.currentTarget));

// Sig everywhere, and the agents waking up once on arrival
document.querySelectorAll('[data-sig]').forEach((el) => setSig(el, 'idle'));
if (!reduceMotion) {
  for (const list of document.querySelectorAll('.agent-rail, .agent-list')) {
    list.querySelectorAll('.agent').forEach((a, i) => {
      a.style.setProperty('--i', String(i));
      a.classList.add('wake');
      a.querySelector('.agent-node').addEventListener('animationend', () => a.classList.remove('wake'), { once: true });
    });
  }
}

// A conversation from earlier in this tab comes back as it was
if (chat.length) {
  // A turn that never finished (the tab closed mid-answer) is dropped
  while (chat.length && chat[chat.length - 1].role === 'assistant' && !chat[chat.length - 1].state) chat.pop();
  if (chat.length && chat[chat.length - 1].role === 'user') chat.pop();
  setEmpty(!chat.length);
  newBtn.hidden = !chat.length;
  for (const m of chat) thread.append(m.role === 'user' ? userNode(m.text) : assistantNode(m));
  const last = [...chat].reverse().find((m) => m.role === 'assistant');
  if (last) railFromChat();
  railNotes();
  save();
}
refreshStack();
stackFromLink();
// A shorter prompt in the box on narrow screens
const fitPlaceholder = () => { input.placeholder = innerWidth < 520 ? input.dataset.short : 'Ask about a goal, a compound or a combination'; };
fitPlaceholder();
addEventListener('resize', fitPlaceholder);
updateSend();
