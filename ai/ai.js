// Ask Sig (miraclehealth.us/ai): the chat with Sig, Miracle Health's AI. The conversation lives only in this browser
// tab (sessionStorage). Each message goes to the ask function (the community's Supabase
// project), which streams back each agent's steps, the answer, the cards, where the answer came
// from and the final check as server-sent events. Every answer speaks for two voices, drawn in
// their own materials: the studies on paper, as in the Library, and the community in ink and
// lime, as in the community itself. Nothing here uses innerHTML for anything the AI or the
// visitor wrote: text is placed with textContent, and the small amount of formatting the
// AI uses (bold, lists, Library links) is built node by node.
import { sigSvg, askFrom, meterHtml, node as fromKit, GRADES as KIT_GRADES, COMMUNITY, spaceLink, draftLink } from '/kit/kit.js?v=f08d778478';
import { sealSvg, levelOf } from '/library/signalviz.js?v=d8ffb3d8c3';

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
const LIMIT = 2000;
const KEY = 'mh-ai-chat-v1';
const ADULT = 'mh-ai-adult';
const STACK = 'mh-ai-stack-v1';    // their stack, kept on this device only if they ask
const QR_SRC = app.dataset.qr;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

const AGENT_NAME = {
  safety: 'Safety agent', planner: 'Planner', recommender: 'Recommender', evidence: 'Evidence librarian', relatives: 'Relatives agent',
  mechanism: 'Mechanism agent', markers: 'Markers agent', community: 'The community', combination: 'Combination agent', synergy: 'Synergy auditor', builder: 'Stack builder', review: 'Safety agent',
};
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
// How often the public forums mention something for a use (the community's forum reading)
const FORUM_N = { 'Very common': 4, Common: 3, Mixed: 2, Occasional: 1 };
const FORUM_SAID = { 'Very common': 'Very common on the forums', Common: 'Common on the forums', Mixed: 'Mixed reports on the forums', Occasional: 'Now and then on the forums' };
const forumSaid = (f) => FORUM_SAID[f] || 'On the forums';
const fmt = (n) => Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
const plural = (n, one, many = `${one}s`) => `${fmt(n)} ${Number(n) === 1 ? one : many}`;
const low = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
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
  code: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  net: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.6" stroke-dasharray="2 1.6"/><circle cx="8" cy="8" r="1.9" fill="currentColor" stroke="none"/></g><g fill="currentColor"><circle cx="8" cy="2.4" r="1.75"/><circle cx="12.85" cy="10.8" r="1.75"/><circle cx="3.15" cy="10.8" r="1.75"/></g></svg>',
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
// Sig, the Community Signal in person: the design kit's drawing (the community's Sig), on the
// chat's dark page
// ---------------------------------------------------------------------------
const sigMarkup = (size, mood) => sigSvg(size, mood, { dark: true });
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
// Which voice a paragraph or bullet draws on, from its words: the studies, the community, or both.
// A dot beside it says so (hollow for the studies, lime for the community, half and half for both),
// so each claim shows where it comes from; the line under the answer says which dot is which.
const SAID_STUDIES = /\b(?:stud(?:y|ies|ied)|trials?|evidence|research(?:ers)?|in people|rodents?|animals?|meta-analys[ie]s|fda|approved)\b/i;
const SAID_COMMUNITY = /\b(?:members?|forums?|community|people (?:report|describe|say|mention)|reports?|reported|community signal)\b/i;
// Words that don't make a paragraph draw on a voice: saying there are no studies, and reporting a
// reaction to the FDA (MedWatch) or reading a lab report
const NOT_STUDIES = /\b(?:no|without|lacks?|lacking|few|little)\s+(?:good\s+|real\s+|human\s+|clinical\s+|published\s+)?(?:stud(?:y|ies)|trials?|evidence|research)(?:\s+in\s+(?:people|humans))?\b|\b(?:not|never|hasn['’]?t\s+been|haven['’]?t\s+been|isn['’]?t|aren['’]?t)\s+(?:been\s+)?(?:studied|tested|(?:fda[- ])?approved)(?:\s+in\s+(?:people|humans))?\b|\bunapproved\b/gi;
const SAFETY_REPORT = /\b(?:report(?:ed|ing|s)?|tell)\b[^.]{0,40}?\b(?:fda|medwatch)\b[^.]*|\bmedwatch\b|\blab reports?\b|\bcertificates? of analysis\b/gi;
function saidOf(text) {
  const t = String(text || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(SAFETY_REPORT, ' ');
  const studies = SAID_STUDIES.test(t.replace(NOT_STUDIES, ' '));
  const community = SAID_COMMUNITY.test(t);
  return studies && community ? 'both' : studies ? 'studies' : community ? 'community' : '';
}
const SAID_SR = { studies: ' (from the studies)', community: ' (from the community)', both: ' (from the studies and the community)' };
function voiced(el, text) {
  const v = saidOf(text);
  if (v) { el.classList.add('v', `v-${v}`); el.append(h('span', { class: 'sr', text: SAID_SR[v] })); }
  return el;
}
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
      if (kind === 'ul') for (const li of list.children) voiced(li, li.textContent);
      out.push(list);
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !BLOCK.test(lines[i])) buf.push(lines[i++]);
    const p = h('p');
    buf.forEach((b, j) => { if (j) p.append(h('br')); inline(p, b); });
    out.push(voiced(p, buf.join(' ')));
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
let chat = (store.get(KEY) || []).map((m) => (m.role === 'assistant' && Array.isArray(m.steps) ? { ...m, steps: m.steps.filter((s) => s.agent !== 'clinician') } : m));
let busy = null;            // {controller, msg}
let adult = store.get(ADULT, 'local') === true;
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
// The line that starts what the page folds away ("More detail:"), and everything after it
const MORE = /^\s*(?:\*\*)?more detail:?(?:\*\*)?:?\s*$/im;
const CAUTION = /\b(?:911|988|emergency|emergency room|urgent care|get (?:medical )?help|seek (?:medical )?(?:care|help)|get (?:it )?(?:checked|seen)|stop taking|poison control|medwatch|warning signs?)\b|\bER\b/i;
function moreFold(view) {
  if (!view.more) {
    const box = h('div', { class: 'prose' });
    const d = h('details', { class: 'more' }, h('summary', {}, h('span', { text: 'More detail' })), box);
    d.addEventListener('toggle', () => { view.moreOpen = d.open; });
    view.more = { d, box };
  }
  view.more.d.open = !!view.moreOpen;
  view.more.box.replaceChildren();
  return view.more;
}
function drawParts(msg) {
  const view = msg.view;
  const parts = msg.parts || [];
  // Rebuild the body only where it changed: text parts re-render, cards are made once
  view.body.replaceChildren();
  let hasText = false;
  let fold = null;
  parts.forEach((p, i) => {
    if (p.t === 'text') {
      hasText = hasText || !!p.s.trim();
      const revealing = i === view.revealIdx && view.revealShown < p.s.length;
      const live = (!msg.state && i === parts.length - 1) || revealing;
      const shown = revealing ? p.s.slice(0, view.revealShown) : p.s;
      // Words after "More detail:" go into the fold (and so does any text after it)
      let before = live ? settle(shown) : shown;
      let after = '';
      const m = fold ? null : MORE.exec(before);
      if (fold) { after = before; before = ''; }
      else if (m) { after = before.slice(m.index + m[0].length); before = before.slice(0, m.index); }
      if (before.trim()) {
        const el = h('div', { class: `prose${live && !m ? ' streaming' : ''}` });
        el.append(...prose(before));
        view.body.append(el);
      }
      if (m || fold) {
        // A caution never hides: if one ends up after "More detail:", the fold stays open
        if (CAUTION.test(after)) view.moreOpen = true;
        if (!fold) { fold = moreFold(view); view.body.append(fold.d); }
        if (view.moreOpen) fold.d.open = true;
        fold.box.append(...prose(after));
      }
    } else if (p.t === 'card') {
      let el = view.cardEls.get(p);
      if (!el) { el = cardNode(p.card, msg); view.cardEls.set(p, el); }
      view.body.append(el);
    }
  });
  if (!msg.state && !hasText) view.body.append(h('p', { class: 'waiting' }, h('i'), h('i'), h('i'), h('span', { text: waitingText(msg) })));
  if (msg.sources && hasText) { const src = sourcesNode(msg.sources); if (src) view.body.append(src); }
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
  if (card.type === 'voices') return voicesNode(card);
  if (card.type === 'community') return crowdNode(card);
  if (card.type === 'compare') return compareNode(card);
  if (card.type === 'plan') return planNode(card, msg);
  if (card.type === 'questions') return questionsNode(card);
  if (card.type === 'intake') return intakeNode(card);
  if (card.type === 'audit') return auditNode(card);
  if (card.type === 'warn') {
    return h('div', { class: 'card warn', role: 'note', 'aria-labelledby': `${card.id || 'warn'}-h` },
      h('h2', { id: `${card.id || 'warn'}-h`, text: 'When to get help' }), warnGroups(card.groups), h('p', { class: 'warn-note', text: card.note || '' }),
      h('p', { class: 'warn-note' }, 'After a serious reaction to a medicine, supplement or other product, you or your clinician can report it to the FDA through ', h('a', { href: MEDWATCH, target: '_blank', rel: 'noopener', text: 'MedWatch' }), '.'));
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

// Their Miracle Plan (ai/plan.js draws it): where to start, the pillars and what rests on them,
// the steps to tick off, and the auditor's check of what the plan adds, filled in when it arrives.
// Ticks are kept with the chat; a "not sure yet" pillar answered on the card is their next message.
function planNode(card, msg) {
  const P = window.MHPlan;
  if (!P) return h('div');
  const el = P.node(card, {
    share: true, live: !!msg && !msg.state,
    onAnswer: (text) => { if (!busy) ask(text.slice(0, LIMIT)); },
    onChange: () => { save(); refreshStack(); },
    onKeep: () => refreshStack(),
  });
  if (card.audit) {
    const box = el.querySelector('.audit');
    fillAudit(box, card.audit);
    box.hidden = false;
  }
  return el;
}

// Warning signs under fixed levels, most urgent first; 911 is a tap away
const WARN_ICON = { now: ICON.warn, today: ICON.clock, week: ICON.doc };
function warnGroups(groups) {
  return h('div', { class: 'warn-groups' }, (groups || []).map((g) => h('section', { class: `warn-group lvl-${g.level}` },
    h('h3', { class: 'warn-level' }, svg(WARN_ICON[g.level] || ICON.info), h('span', { text: g.label })),
    h('ul', {}, (g.signs || []).map((t) => h('li', { text: t }))),
    g.level === 'now' ? h('a', { class: 'warn-call', href: 'tel:911', text: 'Call 911' }) : null)));
}

// Their own stack, when the screen is there to show it: one line saying what the check found, and
// how many cautions and blood markers are on the screen, which it opens
function pointerText(card) {
  const ids = (card.items || []).map((it) => it && it.id).filter(libId);
  const a = card.audit;
  const top = (a?.findings || []).reduce((t, f) => (({ avoid: 3, caution: 2 })[f?.level] || 0) > (({ avoid: 3, caution: 2 })[t] || 0) ? f.level : t, '');
  const check = !a ? (ids.length > 1 ? 'The Synergy auditor is checking them together' : '')
    : a.skipped ? '' : a.ok === false ? 'The Synergy auditor couldn’t check these just now'
      : top === 'avoid' ? 'The Synergy auditor says not to take these together'
        : top === 'caution' ? 'The Synergy auditor found a caution' : ids.length > 1 ? 'No clash found' : 'Checked for you';
  const n = SCREEN?.sum?.(ids);
  const bits = n ? [n.cautions ? plural(n.cautions, 'caution') : '', n.markers ? plural(n.markers, 'blood marker') : ''].filter(Boolean) : [];
  const where = bits.length ? `${listOf(bits)} on the screen` : 'How they work, on the screen';
  return { text: check ? `${check}. ${where}` : where, tone: a && !a.skipped && a.ok !== false ? top : '' };
}
function pointerNode(card) {
  const label = h('span', { class: 'ptr-text' });
  const btn = h('button', { class: 'ai-pointer', type: 'button', 'data-card': card.id || '' }, h('span', { class: 'ptr-code', 'aria-hidden': 'true', text: '</>' }), label);
  btn.fill = () => {
    const t = pointerText(card);
    label.textContent = t.text;
    btn.classList.toggle('t-avoid', t.tone === 'avoid');
    btn.classList.toggle('t-caution', t.tone === 'caution');
  };
  btn.fill();
  SCREEN?.ready?.then(() => btn.fill());
  btn.addEventListener('click', () => {
    const i = chat.findIndex((m) => (m.parts || []).some((p) => p.t === 'card' && p.card === card));
    const sub = i >= 0 ? subjectIn(chat[i], i) : null;
    if (sub) SCREEN.show(sub);
    openScreen();
  });
  return btn;
}
function shortlistNode(card) {
  if (card.kind === 'yours' && SCREEN) return pointerNode(card);
  const el = h('div', { class: 'card short', 'data-card': card.id || '' });
  const compact = card.kind === 'yours' && !!SCREEN;
  const sub = card.kind === 'yours'
    ? `What you take or asked about, checked together by the Synergy auditor.${compact ? ' How each works in the body, the blood markers and what the community reports are on the screen.' : ''}`
    : 'Laid out by the Stack builder: options to talk through with your clinician.';
  el.append(h('div', { class: 'card-head' }, h('div', {}, h('h2', { text: card.title }), h('p', { text: sub }))));
  if (card.note) el.append(h('p', { class: 'short-note' }, svg(ICON.info), h('span', { text: card.note })));
  if (card.kind === 'yours' && card.meds?.length) el.append(h('p', { class: 'short-meds', text: `Checked with what you told me you take: ${card.meds.join(', ')}` }));
  // A caution that several options share is said once, under them
  const items = card.items || [];
  const shared = [...new Set(items.map((it) => it.caution).filter((c) => c && !c.includes(':') && items.filter((x) => x.caution === c).length > 1))];
  for (const it of items) {
    const one = shared.includes(it.caution) ? { ...it, caution: '' } : it;
    el.append(compact ? pickCompact(one) : pickNode(one));
  }
  for (const c of shared) {
    const names = items.filter((x) => x.caution === c).map((x) => x.name);
    el.append(h('p', { class: 'short-note shared' }, svg(ICON.info), h('span', { text: `${listOf(names)}: ${c[0].toLowerCase()}${c.slice(1)}` })));
  }
  const audit = h('div', { class: 'audit' }, h('div', { class: 'audit-head busy', text: 'Synergy auditor: checking these together' }));
  if (card.audit) fillAudit(audit, card.audit);
  el.append(audit);
  if (card.kind === 'yours') el.append(stackSaveRow(card));
  return el;
}
// A compound in the member's own stack, in short: the screen has the rest
function pickCompact(it) {
  return h('div', { class: 'pick compact' },
    h('div', { class: 'pick-name' }, isLib(it.id) ? h('a', { href: it.url || `/library/${it.id}/`, text: it.name }) : h('b', { text: it.name }),
      h('span', { class: 'pick-role', text: it.role }),
      it.status ? h('span', { class: `st st-${it.status.key}`, text: it.tag || STATUS[it.status.key] }) : h('span', { class: 'ev ev-pending', text: it.tag || 'No fact sheet yet' })),
    it.caution ? h('p', { class: 'pick-warn' }, svg(ICON.info), h('span', { text: it.caution })) : null);
}
// One option: its two voices side by side (what the studies show for what was asked, what the
// community reports), the one that leads first; then what studies found, each with its source.
// Answers from before the community spoke (no "lead") keep the evidence as the headline.
function pickNode(it) {
  if ('lead' in it) return pickTwo(it);
  const grade = it.use ? it.use.grade : it.grade;
  const shown = USE[grade] ? grade : it.grade && USE[it.grade] ? it.grade : '';
  const [label] = USE[shown] || ['No fact sheet yet'];
  const meter = fromKit(meterHtml(GRADE_N[shown] != null ? shown : 'anecdotal', { bare: true }));
  const ev = h('div', { class: `pick-ev ev-${shown || 'pending'}` }, h('span', { class: 'pick-ev-label', text: label }), meter,
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
function pickTwo(it) {
  const found = it.benefits?.length
    ? [it.use && !it.use.fits ? h('p', { class: 'pick-other', text: 'The Library has no studies of it for this use yet. What it has been studied for:' }) : null, foundList(it.benefits, it.name)]
    : [];
  return h('div', { class: 'pick' },
    h('div', { class: 'pick-main' },
      h('div', { class: 'pick-name' }, isLib(it.id) ? h('a', { href: it.url, text: it.name }) : h('b', { text: it.name }), h('span', { class: 'pick-role', text: it.role })),
      voiceStrip(it, { pick: true }),
      it.why ? h('p', { class: 'pick-why', text: it.why }) : null,
      ...found,
      h('div', { class: 'pick-pills' }, it.status ? h('span', { class: `st st-${it.status.key}`, text: it.tag || STATUS[it.status.key] }) : h('span', { class: 'ev ev-pending', text: it.tag || 'No fact sheet yet' })),
      it.caution ? h('p', { class: 'pick-warn' }, svg(ICON.info), h('span', { text: it.caution })) : null));
}
function foundList(benefits, name) {
  return h('ul', { class: 'pick-found', 'aria-label': `What studies found for ${name}` }, benefits.map((b) => h('li', {},
    h('span', { text: b.claim }), ' ',
    h('span', { class: `found-ev found-${b.evidence}`, text: FOUND[b.evidence] || b.evidence }),
    b.source?.url ? h('a', { class: 'found-src', href: b.source.url, target: '_blank', rel: 'noopener noreferrer', title: `${b.source.title}${b.source.year ? ` (${b.source.year})` : ''}`, text: 'Source' }) : null)));
}

// ---------------------------------------------------------------------------
// The two voices: what the studies show (on paper, as in the Library) and what the community
// reports (in ink and lime, as in the community), side by side. The one that leads for what was
// asked comes first and says so: the studies when there are studies in people for it, the
// community's reports when there aren't.
// ---------------------------------------------------------------------------
const LEAD_WHY = {
  studies: 'Studies in people cover what you asked, so they come first.',
  community: 'No studies in people answer what you asked, so what people report comes first. It isn’t evidence.',
};
// A voice is marked as leading only when it really covers what was asked: studies in people for
// it, or community reports on it (with neither, nothing is marked)
const HUMAN = new Set(['strong', 'moderate', 'limited']);
const studiesCover = (st) => !!st && st.forUse && HUMAN.has(st.grade);
const communityCovers = (c) => !!c && (!c.use || c.use.rating != null || !!c.use.forum || !!c.near);
function leadShown(it, st = it.studies === undefined ? studiesFromItem(it) : it.studies) {
  if (it.lead === 'community' && communityCovers(it.community)) return 'community';
  if (it.lead === 'studies' && studiesCover(st)) return 'studies';
  return 'none';
}
function sideHead(name, lead) {
  return h('div', { class: 'vx-k' }, h('span', { text: name }),
    lead ? h('span', { class: 'vx-lead', title: LEAD_WHY[lead] }, 'Leads', h('span', { class: 'sr', text: `: ${LEAD_WHY[lead]}` })) : null);
}
function studiesSide(st, lead) {
  const g = !st ? '' : !st.forUse || st.grade === 'none' ? 'none' : st.grade;
  const label = !st ? 'No fact sheet yet' : (USE[g] || USE.none)[0];
  const sub = !st ? 'The Library is still researching it.'
    : g === 'none' ? 'Its studies are about other uses.'
    : KIT_GRADES[g]?.[2] || '';
  return h('div', { class: `vx-side vx-studies${lead ? ' lead' : ''}`, role: 'group', 'aria-label': 'What the studies show' },
    sideHead('Studies', lead ? 'studies' : ''),
    h('div', { class: `vx-main vx-ev-${g || 'pending'}` }, fromKit(meterHtml(GRADE_N[g] != null ? g : 'anecdotal', { bare: true })), h('span', { text: label })),
    sub ? h('p', { class: 'vx-sub', text: sub }) : null);
}
function useLine(c) {
  const u = c.use;
  if (u) {
    const what = low(u.label);
    if (u.rating != null) return `Members rate it ${u.rating}${u.low != null && u.high != null ? ` (likely ${u.low}–${u.high})` : ''} for ${what}, from ${plural(u.reports, 'report')}${u.betterPct != null ? `; ${u.betterPct}% said better` : ''}`;
    if (u.forum) return `${forumSaid(u.forum)} for ${what}; not rated by members yet`;
    // Nothing on that use yet: the closest use reported, for the same goal
    const n = c.near;
    if (n) return `${n.rating != null ? `Members rate it ${n.rating} for ${low(n.label)}` : `${forumSaid(n.forum)} for ${low(n.label)}`}, the closest use; nothing on ${what} yet`;
    return `No reports for ${what} yet`;
  }
  const top = (c.uses || []).slice(0, 2).map((x) => low(x.label));
  return top.length ? `Most reported for ${top.join(' and ')}` : '';
}
// note: 'pregnancy' or 'reaction' (what people report is left out) or 'down' (the numbers couldn't be read)
const LEFT_OUT = {
  pregnancy: ['Left out in pregnancy', 'Most of these haven’t been studied in pregnancy, so what people report isn’t shown. Your obstetric clinician is the one to ask.'],
  reaction: ['Left out for now', 'What’s happening now comes first. What people report can wait until that’s been seen to.'],
  down: ['Couldn’t load just now', 'The community’s numbers couldn’t be read just now. Ask again in a little while to see them.'],
};
function communitySide(c, lead, { effects = false, note = '' } = {}) {
  const head = sideHead('Community', lead ? 'community' : '');
  if (!c) {
    const [main, sub] = LEFT_OUT[note] || ['No reports yet', 'No member reports or forum data on it yet.'];
    return h('div', { class: `vx-side vx-community none${lead ? ' lead' : ''}`, role: 'group', 'aria-label': 'What the community reports' },
      head, h('div', { class: 'vx-main' }, h('span', { text: main })),
      h('p', { class: 'vx-sub', text: sub }));
  }
  const lvl = levelOf(c.level);
  const o = c.outcomes;
  const n = o ? o.better + o.same + o.worse : 0;
  return h('div', { class: `vx-side vx-community${lead ? ' lead' : ''}`, role: 'group', 'aria-label': 'What the community reports' },
    head,
    h('div', { class: 'vx-main' }, svg(sealSvg(lvl.key, 18)), h('b', { class: 'vx-score', text: Number(c.score).toFixed(1) }),
      h('span', { class: 'vx-level', text: c.firstHand ? `${lvl.name} · ${plural(c.firstHand, 'member report')}` : `${lvl.name}, no member reports yet` }),
      h('span', { class: 'sr', text: ` Community Signal ${Number(c.score).toFixed(1)} of 100.` })),
    useLine(c) ? h('p', { class: 'vx-sub', text: useLine(c) }) : null,
    o && n ? h('div', { class: 'vx-split' }, splitBar(o), h('span', { text: `Overall, ${o.better} of ${n} reports said better` })) : null,
    effects && c.sideEffects?.length ? h('p', { class: 'vx-sub vx-fx', text: `Side effects in members’ reports: ${c.sideEffects.map((e) => `${low(e.effect)} (${e.n})`).join(', ')}` }) : null);
}
// pick: an option on a shortlist or in their stack, to discuss with a clinician. The studies come
// first there whatever leads the words, and neither side is marked: options are never chosen by
// what people report.
function voiceStrip(it, { pick = false } = {}) {
  const st = it.studies === undefined ? studiesFromItem(it) : it.studies;
  const lead = pick ? 'none' : leadShown(it, st);
  const s = studiesSide(st, lead === 'studies');
  const c = communitySide(it.community, lead === 'community', { effects: pick, note: it.communityNote || '' });
  return h('div', { class: `vx lead-${lead}${pick ? ' in-pick' : ''}` }, lead === 'community' ? [c, s] : [s, c]);
}
// Card items carry the studies' side as their evidence for what was asked
function studiesFromItem(it) {
  if (!it.status && !it.grade) return null;
  return { grade: it.use ? it.use.grade : it.grade, forUse: it.use ? !!it.use.fits : true };
}
// How first-hand reports went: better, about the same, worse
function splitBar({ better = 0, same = 0, worse = 0 }) {
  const n = better + same + worse;
  const box = h('span', { class: 'split', role: 'img', 'aria-label': `${better} better, ${same} about the same, ${worse} worse` });
  [['b', better], ['s', same], ['w', worse]].forEach(([c, k]) => {
    const part = h('span', { class: c });
    part.style.width = `${n ? (100 * k) / n : 0}%`;   // set through the DOM: the page allows no inline styles
    box.append(part);
  });
  return box;
}

// What they named, the studies and the community side by side, when no stack card lays it out
function voicesNode(card) {
  const items = card.items || [];
  const one = items.length === 1;
  const el = h('div', { class: 'card voices', 'data-card': card.id || '' });
  el.append(h('div', { class: 'card-head' }, h('div', {},
    h('h2', { text: one ? `${items[0].name}: the studies and the community` : 'The studies and the community' }),
    h('p', { text: card.use ? `For ${low(card.use.label)}` : 'What studies show, and what members and the forums report' }))));
  const leads = items.map((i) => leadShown(i));
  const note = leads.includes('community') ? 'No studies in people answer this, so what people report comes first. What people report isn’t evidence.'
    : leads.length && leads.every((l) => l === 'none') ? 'Little is known yet, from studies in people or from members.' : '';
  if (note) el.append(h('p', { class: 'short-note' }, svg(ICON.info), h('span', { text: note })));
  for (const it of items) el.append(voiceItem(it, card.use));
  el.append(h('p', { class: 'vx-foot' }, 'The community’s numbers are totals from members’ first-hand reports and public forum data: what people report, not proof. No posts or names. ',
    h('a', { href: '/#signal', text: 'How the Signal works' })));
  return el;
}
function voiceItem(it, use) {
  const c = it.community;
  const f = it.studies?.finding;
  const said = [];
  if (c?.themes?.length) said.push(h('p', { class: 'vx-said' }, h('b', { text: 'What people describe most: ' }), c.themes.map((t) => `${low(t.theme)} (${low(t.label)})`).join(', ')));
  if (c?.sideEffects?.length) said.push(h('p', { class: 'vx-said' }, h('b', { text: 'Side effects members mention: ' }), c.sideEffects.map((e) => `${low(e.effect)} (${e.n})`).join(', ')));
  said.push(...contextLines(c));
  const title = `How ${it.name} went for me${use ? `: ${low(use.label)}` : ''}`;
  const body = [`What I took it for: ${use ? use.label : ''}`, 'How long: ', 'How it went (better, about the same or worse): ', 'Anything I noticed: '].join('\n');
  return h('div', { class: 'pick vx-item' },
    h('div', { class: 'pick-name' }, isLib(it.id) ? h('a', { href: it.url || `/library/${it.id}/`, text: it.name }) : h('b', { text: it.name }),
      it.status ? h('span', { class: `st st-${it.status.key}`, text: it.tag || STATUS[it.status.key] }) : h('span', { class: 'ev ev-pending', text: it.tag || 'No fact sheet yet' })),
    voiceStrip(it),
    f ? [it.studies.forUse ? null : h('p', { class: 'pick-other', text: 'What it has been studied for:' }), foundList([f], it.name)] : null,
    ...said,
    h('div', { class: 'vx-acts' },
      h('a', { class: 'vx-act', href: spaceLink(it.id), text: 'What members report' }),
      h('a', { class: 'vx-act add', href: draftLink([it.id], { title, body }), text: 'Took it? Share how it went' })));
}

// What sits beside what people report: how many improve anyway (on a placebo, or with time), the
// side-effect watch and serious reactions (with the FDA's MedWatch), what check-ins weeks later
// say, and counted forum data from sources whose terms allow it
const MEDWATCH = 'https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program';
const STOPPED = { done: 'it worked, done', no_effect: 'it didn’t help', side_effects: 'side effects', cost: 'cost or hassle', other: 'something else' };
function contextLines(c) {
  if (!c) return [];
  const out = [];
  if (c.baseline && c.use) out.push(h('p', { class: 'vx-said vx-base' }, h('b', { text: c.baseline.use !== c.use.id ? `For context, on ${String(c.near?.label || c.baseline.use).toLowerCase()}: ` : 'For context: ' }), c.baseline.says, ' ',
    h('span', { class: 'vx-dim', text: 'A member’s “better” is self-reported, so this is context, not a comparison.' })));
  if (c.watch?.length || c.serious) {
    out.push(h('p', { class: 'vx-said vx-watch' }, h('b', { text: 'Side-effect watch: ' }),
      c.watch?.length ? `${c.watch.map((w) => `${low(w.effect)} in ${w.n} of ${w.of} reports (${w.pct}%), against ${w.othersPct}% for other compounds`).join('; ')}. ` : '',
      c.serious ? `${plural(c.serious, 'report')} describe${c.serious === 1 ? 's' : ''} a reaction that sounded serious. ` : '',
      'A serious reaction needs medical help, and anyone can report one to the FDA through ', h('a', { href: MEDWATCH, target: '_blank', rel: 'noopener', text: 'MedWatch' }), '.'));
  }
  const k = c.checkins;
  if (k?.reports) out.push(h('p', { class: 'vx-said' }, h('b', { text: 'Weeks later: ' }),
    `${plural(k.reports, 'report')} checked in; ${fmt(k.still)} still taking it, ${fmt(k.stopped)} stopped${k.reasons?.length ? ` (${k.reasons.map((r) => `${STOPPED[r.reason] || r.reason} ${r.n}`).join(', ')})` : ''}.`));
  for (const f of c.forumCounts || []) out.push(h('p', { class: 'vx-said' }, h('b', { text: 'Counted on the forums: ' }),
    `${f.source}, ${plural(f.posts, 'post')} read${f.positive != null ? `: ${f.positive}% positive, ${f.mixed ?? 0}% mixed, ${f.negative ?? 0}% negative` : ''}.`));
  return out;
}

// Two to four compounds side by side for what they asked: each with the studies and the
// community, its US status and the one caution. Proven options first, never ranked by what people
// report, and no winner.
function compareNode(card) {
  const items = card.items || [];
  const el = h('div', { class: 'card compare', 'data-card': card.id || '' });
  el.append(h('div', { class: 'card-head' }, h('div', {},
    h('h2', { text: `Side by side: ${listOf(items.map((i) => i.name))}` }),
    h('p', { text: card.use ? `For ${low(card.use.label)}. Not a ranking: they differ in evidence, status and what people report.` : 'Not a ranking: they differ in evidence, status and what people report.' }))));
  el.append(h('div', { class: 'cmp-grid' }, items.map((it) => h('section', { class: 'cmp-col', 'aria-label': it.name },
    h('div', { class: 'pick-name' }, isLib(it.id) ? h('a', { href: it.url || `/library/${it.id}/`, text: it.name }) : h('b', { text: it.name }),
      it.status ? h('span', { class: `st st-${it.status.key}`, text: it.tag || STATUS[it.status.key] }) : h('span', { class: 'ev ev-pending', text: it.tag || 'No fact sheet yet' })),
    voiceStrip(it, { pick: true }),
    it.studies?.finding ? foundList([it.studies.finding], it.name) : null,
    ...contextLines(it.community).slice(0, 2),
    it.caution ? h('p', { class: 'pick-warn' }, svg(ICON.info), h('span', { text: it.caution })) : null))));
  el.append(h('p', { class: 'vx-foot' }, 'Proven options first (approved, over the counter or supplements), then the rest. What people report isn’t evidence. ',
    h('a', { href: '/method/', text: 'How the numbers are made' })));
  return el;
}

// What the community reports most for one use: members' ratings first (only with enough reports
// from enough members), then how often the forums mention it. Grouped by US status, proven options
// first, as a shortlist is: what people report, never a leaderboard or a recommendation.
function crowdRow(r) {
  const lvl = levelOf(r.level);
  const rated = r.rating != null;
  const bar = h('span', { class: `crowd-bar${rated ? '' : ' forum'}` }, h('i'));
  bar.firstChild.style.width = `${rated ? Math.max(4, Math.min(100, r.rating)) : 25 * (FORUM_N[r.forum] || 1)}%`;
  return h('li', { class: 'crowd-row' },
    h('div', { class: 'crowd-who' },
      isLib(r.id) ? h('a', { href: r.url || `/library/${r.id}/`, text: r.name }) : h('b', { text: r.name }),
      h('span', { class: `crowd-st tone-${r.tone || 'none'}`, text: r.tag || '' }),
      h('span', { class: 'crowd-sig' }, svg(sealSvg(lvl.key, 14)), `Overall Signal ${Number(r.score).toFixed(1)}`)),
    h('div', { class: 'crowd-val' },
      rated ? h('b', { class: 'crowd-num', text: String(r.rating) }) : h('b', { class: 'crowd-num forum', text: r.forum || 'Forums' }),
      bar,
      h('span', { class: 'crowd-meta', text: rated ? `members’ rating${r.low != null && r.high != null ? ` · likely ${r.low}–${r.high}` : ''} · ${plural(r.reports, 'report')}` : 'mentioned on the forums · not rated yet' })));
}
function crowdNode(card) {
  const use = low(card.use?.label || '');
  const members = card.crowd?.members || 0;
  const items = card.items || [];
  const el = h('div', { class: 'card crowd', 'data-card': card.id || '' });
  el.append(h('div', { class: 'card-head' }, h('div', {},
    h('h2', { text: `What the community reports most for ${use}` }),
    h('p', { text: card.crowd?.reports > 0
      ? `From ${members > 1 ? `${fmt(members)} members’` : 'members’'} first-hand reports and the public forums. What people report, not a recommendation.`
      : 'From public forum data so far: members’ ratings come first as their reports arrive. What people report, not a recommendation.' }))));
  // Proven options first (approved, over the counter, supplements), then the rest
  const grouped = items.some((r) => typeof r.proven === 'boolean');
  const groups = grouped
    ? [['FDA-approved (for some use), over the counter or supplements', items.filter((r) => r.proven)], ['Research stage, not approved or other status', items.filter((r) => !r.proven)]]
    : [['', items]];
  for (const [name, rows] of groups) {
    if (!rows.length) continue;
    el.append(h('section', { class: 'crowd-group' }, name ? h('h3', { text: name }) : null, h('ul', { class: 'crowd-list' }, rows.map(crowdRow))));
  }
  el.append(h('p', { class: 'vx-foot' }, 'Members’ ratings count once 10 or more reports, from 5 or more people, name a use; until then, how often the forums mention it. ',
    h('a', { href: draftLink([], { title: `What I tried for ${use}`, body: '' }), text: 'Took one of these? Share how it went' })));
  return el;
}

// Where an answer came from: the fact sheets (the studies) and the Signals (the community) it drew on
function sourcesNode(src) {
  const st = src.studies || {};
  const co = src.community || {};
  const names = (xs) => (xs || []).map((x) => x.name).join(', ');
  const bits = [];
  if (st.sheets) {
    bits.push(h('span', { class: 'src-part', title: names(st.names) }, h('span', { class: 'v-dot v-studies', 'aria-hidden': 'true' }),
      h('span', { text: `Studies: ${plural(st.sheets, 'fact sheet')}${st.sources ? `, ${plural(st.sources, 'source')}` : ''}` })));
  }
  if (co.signals) {
    const what = [co.reports ? plural(co.reports, 'member report') : '', co.forum ? 'public forum data' : ''].filter(Boolean).join(' and ');
    const when = src.version && !Number.isNaN(Date.parse(src.version)) ? ` · numbers of ${new Date(src.version).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : '';
    bits.push(h('span', { class: 'src-part', title: `${names(co.names)}${when}` }, h('span', { class: 'v-dot v-community', 'aria-hidden': 'true' }),
      h('span', { text: `Community: ${plural(co.signals, 'Signal')}${what ? `, from ${what}` : ''}` })));
  }
  return bits.length ? h('p', { class: 'answer-src' }, h('span', { class: 'src-k', text: 'Drawn from' }), ...bits) : null;
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

// ---------------------------------------------------------------------------
// The screen (ai/screen.js): what the chat is about, drawn beside it (a tab on phones)
// ---------------------------------------------------------------------------
const SCREEN = window.MHScreen || null;
// The compounds an answer was about, with the auditor's check when it ran: a stack, shortlist,
// plan or comparison it laid out, or else what the member named (the community step reads those)
function cardSet(card, at) {
  let items = [];
  if (card.type === 'shortlist' || card.type === 'compare' || card.type === 'voices') items = card.items || [];
  else if (card.type === 'plan') items = [...(card.peptides || []), ...(card.supplements || [])];
  const ids = [...new Set(items.map((it) => it && it.id).filter(libId))].slice(0, 6);
  if (!ids.length) return null;
  const a = card.type === 'shortlist' || card.type === 'plan' ? card.audit : null;
  const ok = !a || a.skipped ? null : a.ok !== false;
  return { ids, findings: a?.findings || [], ok, meds: card.meds || [], at };
}
// With what the agents did, how long it took and what the answer drew on, for the screen's log
const withLog = (s, m) => s && {
  ...s, log: (m.steps || []).map((x) => ({ agent: x.agent, title: x.title || '', status: x.status || '', flag: x.flag || '' })), ms: m.ms || 0, src: m.sources || null,
  ladder: m.ladder || null,
};
function subjectIn(m, i) {
  if (!m || m.role !== 'assistant') return null;
  const cards = (m.parts || []).filter((p) => p.t === 'card').map((p) => p.card);
  for (let j = cards.length - 1; j >= 0; j--) {
    const s = cardSet(cards[j], i);
    if (s) return withLog(s, m);
  }
  const steps = m.steps || [];
  const named = steps.find((s) => s.agent === 'community' && s.chips?.length)
    || steps.find((s) => s.agent === 'synergy' && s.chips?.length)
    || steps.find((s) => s.agent === 'recommender' && /fact sheet/i.test(s.title || '') && s.chips?.length);
  if (!named) return null;
  const ids = [...new Set(named.chips.map((c) => c.id).filter(libId))].slice(0, 6);
  if (!ids.length) return null;
  const audit = cards.find((c) => c.type === 'audit' && !c.for);
  // Sig asked its questions first: the check comes with its next answer
  const asked = cards.some((c) => c.type === 'intake');
  return withLog({ ids, findings: audit?.findings || [], ok: audit ? audit.ok !== false : null, meds: [], asked, at: i }, m);
}
function latestSubject() {
  for (let i = chat.length - 1; i >= 0; i--) {
    const s = subjectIn(chat[i], i);
    if (s) return s;
  }
  return null;
}
function screenSync() {
  if (!SCREEN) return;
  const s = latestSubject();
  if (s) SCREEN.show(s);
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

// Today, as the date a saved stack carries
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

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
const unb64u = (text) => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
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

// What they keep on this device, together: My Miracle in short, on the first screen (and beside
// the chat on wide screens). Their plan, stack and check-ins are in full at /my/.
function myBox(where) {
  const P = window.MHPlan;
  const k = P?.keptPlan();
  const st = savedStack();
  if (!k && !st) return null;
  const parts = [];
  if (k) {
    const pr = P.progress(k.card, k.done);
    const check = h('button', { class: 'saved-check', type: 'button', text: 'Check in with Sig' });
    check.addEventListener('click', () => { if (!busy) ask(P.checkIn(k.card, k.done)); });
    const due = P.checkInDue(k);
    parts.push(h('div', { class: 'my-part' },
      h('h3', { class: 'my-kind', text: 'Your plan' }),
      h('p', { class: 'saved-names', text: k.card.title }),
      k.card.first ? h('p', { class: 'saved-meds', text: `Start here: ${k.card.first.step}` }) : null,
      pr.total ? h('p', { class: 'saved-progress' }, h('span', { class: 'saved-bar', 'aria-hidden': 'true' }, h('i', { class: `w${Math.round((pr.done / pr.total) * 4)}` })), h('span', { text: `${pr.done} of ${pr.total} steps done` })) : null,
      due ? h('a', { class: 'my-due', href: '/my/#checkin' }, h('b', { text: 'How’s it going? ' }), h('span', { text: `It’s been ${P.howLong(due)}. Say so in one tap, and share it with the community if you like.` })) : null,
      h('div', { class: 'saved-actions' }, check)));
  }
  if (st) {
    const check = h('button', { class: 'saved-check', type: 'button', text: 'Check my stack again' });
    check.addEventListener('click', () => ask(stackQuestion(st)));
    const changes = h('div', { class: 'saved-changes' });
    whatChanged(st).then((lines) => {
      if (lines == null) return;
      changes.replaceChildren(lines.length
        ? h('ul', { 'aria-label': 'What’s changed since you saved it' }, lines.map((t) => h('li', { text: t })))
        : h('p', { text: 'Nothing has changed in the Library for these since you saved them.' }));
    });
    parts.push(h('div', { class: 'my-part' },
      h('h3', { class: 'my-kind', text: 'Your stack' }),
      h('p', { class: 'saved-names' }, st.items.map((i, n) => [n ? ' · ' : '', isLib(i.id) ? h('a', { href: `/library/${i.id}/`, text: i.name }) : i.name])),
      st.meds.length ? h('p', { class: 'saved-meds', text: `With your medicines: ${st.meds.join(', ')}` }) : null,
      changes,
      h('div', { class: 'saved-actions' }, check)));
  }
  const hid = `my-${where}-h`;
  return h('section', { class: 'saved-box my-box', 'aria-labelledby': hid },
    h('div', { class: 'my-head' }, h('h2', { id: hid, text: 'My Miracle' }), h('a', { class: 'linkish', href: '/my/', text: 'Open My Miracle' })),
    ...parts,
    h('p', { class: 'saved-note', text: 'Kept on this device. Miracle Health never receives it.' }));
}
function refreshStack() {
  const host = $('ai-saved');
  if (host) {
    const boxes = [myBox('start')].filter(Boolean);
    host.replaceChildren(...boxes);
    host.hidden = !boxes.length;
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
  const box = h('section', { class: 'saved-box incoming', 'aria-labelledby': 'saved-in-h' },
    h('h2', { id: 'saved-in-h', text: 'A stack from your link' }),
    h('p', { class: 'saved-names', text: st.items.map((i) => i.name).join(' · ') }),
    st.meds.length ? h('p', { class: 'saved-meds', text: `With your medicines: ${st.meds.join(', ')}` }) : null,
    h('div', { class: 'saved-actions' }, save, now, no));
  if (chat.length) {
    // Mid-conversation, the offer waits at the end of it, until they answer
    const wrap = h('div', { class: 'ai-incoming' }, box);
    for (const b of [save, now, no]) b.addEventListener('click', () => wrap.remove());
    thread.append(wrap);
    wrap.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
  }
  const host = $('ai-saved');
  if (!host) return;
  host.replaceChildren(box);
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
  // Sig's replies go back with the signature the server gave them
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
      if (!am.memo) throw Object.assign(new Error('cut off'), { friendly: `The answer was cut off. Please try again.${HELP_LINE}` });
    }
  } catch (e) {
    if (controller.signal.aborted) {
      am.state = 'stopped';
      am.memo = textOf(am) ? `${textOf(am)}\n\n[Stopped by the member before the end]` : '';
    } else {
      am.state = 'error';
      am.error = e.friendly || `Couldn’t reach Sig. Check your connection and try again.${HELP_LINE}`;
    }
  }
  am.ms = am.ms || Math.round(performance.now() - t0);
  if (!am.state) am.state = 'done';
  busy = null;
  finish(am, true);
  setBusy(false);
  SCREEN?.checking(false);
  screenSync();
  sigs().forEach((el) => setSig(el, moodOf(am)));
  save();
  if (!coarse) input.focus();
}
// Whatever stops an answer, the way to help is still on the page
const HELP_LINE = ' If you’re thinking about hurting yourself, call or text 988 any time; in an emergency, call 911.';
const errorText = (status) => (status === 429 ? `Too many messages for now. Please try again later.${HELP_LINE}`
  : status === 413 ? 'That message is too long. Keep it under 2,000 characters.'
  : status === 403 ? 'Sig only answers on miraclehealth.us.'
  : `Sig is resting for a moment. Please try again shortly.${HELP_LINE}`);
const textOf = (m) => (m.parts || []).filter((p) => p.t === 'text').map((p) => p.s).join('\n\n').trim();

function onEvent(am, ev, d) {
  const view = am.view;
  switch (ev) {
    case 'step': {
      // The member's own clinician isn't a step in the chat (an older server still sends one)
      if (d.agent === 'clinician') break;
      const i = am.steps.findIndex((s) => s.id === d.id);
      if (i >= 0) am.steps[i] = { ...am.steps[i], ...d }; else am.steps.push(d);
      if (d.flag && d.flag !== 'none') am.flag = d.flag;
      drawStep(view, am.steps.find((s) => s.id === d.id));
      // The screen says the auditor is checking, and shows what was named as soon as it's read
      if (d.agent === 'synergy' && d.status === 'run') SCREEN?.checking(true);
      if (d.agent === 'community' && d.chips?.length) screenSync();
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
        const host = am.parts.find((p) => p.t === 'card' && (p.card.type === 'shortlist' || p.card.type === 'plan') && p.card.id === d.for);
        if (host) {
          host.card.audit = d;
          const box = view.cardEls.get(host)?.querySelector('.audit');
          if (box) { fillAudit(box, d); box.hidden = false; }
          view.cardEls.get(host)?.fill?.();
          SCREEN?.checking(false);
          screenSync();
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
      // A stack, shortlist, plan or comparison goes on the screen at once; its check when it comes
      if (d.type === 'audit') SCREEN?.checking(false);
      if (['shortlist', 'plan', 'audit', 'compare', 'voices'].includes(d.type)) screenSync();
      break;
    }
    // The evidence for what they asked about, rung by rung: the screen draws it
    case 'ladder':
      am.ladder = d && typeof d === 'object' ? d : null;
      screenSync();
      break;
    case 'sources':
      am.sources = { studies: d.studies || {}, community: d.community || {}, version: typeof d.version === 'string' ? d.version.slice(0, 40) : '' };
      schedule(am);
      break;
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
      view.cardEls.get(p)?.fill?.();
    }
  }
  drawParts(am);
  // Agents that actually ran; the visitor's own clinician isn't one of them, and the community is
  // people, not an agent
  const ran = new Set(am.steps.map((s) => (s.agent === 'review' ? 'safety' : s.agent)).filter((a) => a !== 'clinician' && a !== 'community'));
  const heard = am.steps.some((s) => s.agent === 'community');
  view.trace.classList.add('done');
  view.sum.textContent = am.steps.length
    ? `${ran.size} agent${ran.size === 1 ? '' : 's'}${heard ? ' and the community' : ''} worked on this${am.ms ? ` · ${(am.ms / 1000).toFixed(1)} s` : ''}`
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
    const sub = SCREEN ? subjectIn(am, chat.indexOf(am)) : null;
    const pointed = (am.parts || []).some((p) => p.t === 'card' && p.card.type === 'shortlist' && p.card.kind === 'yours');
    const go = sub && !pointed ? h('button', { class: 'ai-toscreen', type: 'button' }, svg(ICON.code), h('span', { text: 'See it on the screen' })) : null;
    go?.addEventListener('click', () => { SCREEN.show(sub); openScreen(); });
    view.foot.append(h('span', { class: `cleared${edited ? ' edited' : ''}` }, svg(edited ? ICON.edit : ICON.check), h('span', { text: said })),
      h('span', { class: 'foot-actions' }, go, btn));
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
// Before the first message: adults only, and what Sig is
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
    h('h2', { id: 'ai-gate-h', text: 'One check before Sig answers' }),
    h('p', { text: 'Sig is Miracle Health’s AI, for adults 18 and over. It explains evidence and what people report; it isn’t a person or a clinician.' }),
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
document.querySelectorAll('.ai-start[data-goal]').forEach((b) => b.querySelector('.start-ico')?.append(goalIcon(b.dataset.goal)));
newBtn.addEventListener('click', () => {
  if (busy) busy.controller.abort();
  chat = [];
  store.del(KEY);
  helpPin();
  thread.querySelectorAll('.msg,.gate,.ai-incoming').forEach((n) => n.remove());
  setEmpty(true);
  refreshStack();
  newBtn.hidden = true;
  SCREEN?.clear();
  closeSheet();
  input.focus();
});
// The screen: beside the chat on wide screens. On phones and narrow windows it's a sheet that
// pulls up over the chat, from the bar above the box to write in (or "See it on the screen"
// under an answer); the page behind it rests until it's closed, and nothing is taken away.
const rail = $('ai-screen');
const narrowMq = matchMedia('(max-width: 1100px)');
const backdrop = h('div', { class: 'sc-backdrop', 'aria-hidden': 'true' });
let sheetFrom = null;
const behind = () => [document.querySelector('header.top'), chatEl, document.querySelector('.foot')].filter(Boolean);
function openSheet() {
  if (!SCREEN || !rail || !narrowMq.matches || !SCREEN.subject() || app.classList.contains('sheet-open')) return;
  sheetFrom = document.activeElement;
  app.classList.add('sheet-open');
  document.documentElement.classList.add('sheet-lock');
  rail.setAttribute('role', 'dialog');
  rail.setAttribute('aria-modal', 'true');
  for (const el of behind()) el.inert = true;
  rail.scrollTop = 0;
  requestAnimationFrame(() => rail.querySelector('.sc-close')?.focus({ preventScroll: true }));
}
function openScreen() {
  if (!SCREEN || !rail) return;
  if (narrowMq.matches) { openSheet(); return; }
  rail.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  const head = rail.querySelector('.sc-headline');
  if (!head) return;
  head.setAttribute('tabindex', '-1');
  head.focus({ preventScroll: true });
  const box = head.closest('.sc-head');
  box?.classList.remove('flash');
  void box?.offsetWidth;
  box?.classList.add('flash');
}
function closeSheet() {
  if (!app.classList.contains('sheet-open')) return;
  app.classList.remove('sheet-open');
  document.documentElement.classList.remove('sheet-lock');
  rail?.setAttribute('role', 'complementary');
  rail?.removeAttribute('aria-modal');
  for (const el of behind()) el.inert = false;
  const back = sheetFrom && document.contains(sheetFrom) && sheetFrom !== document.body ? sheetFrom : $('ai-peek')?.querySelector('button');
  sheetFrom = null;
  back?.focus({ preventScroll: true });
}
if (SCREEN) {
  SCREEN.mount($('sc-root'));
  SCREEN.peek($('ai-peek'));
  SCREEN.onOpen(openSheet);
  SCREEN.onClose(closeSheet);
  SCREEN.onAsk((q) => { closeSheet(); ask(q); });
  // Keeping what's on the screen in My Miracle: the same as saving a stack from its card
  const fromScreen = (items, meds) => ({
    v: 1, saved: localDate(),
    items: items.filter((it) => libId(it.id)).slice(0, 8).map((it) => ({ id: it.id, name: cleanName(it.name), status: cleanName(it.status, 80), grade: GRADE[it.grade] ? it.grade : '' })),
    meds: (meds || []).map((m) => cleanName(m, 40)).filter(Boolean).slice(0, 6),
  });
  SCREEN.onSave((items, meds) => {
    const st = fromScreen(items, meds);
    saveStack(st);
    const now = savedStack();
    return !!now && stackKey(now) === stackKey(st);
  }, (items, meds) => {
    const now = savedStack();
    return !!now && stackKey(now) === stackKey(fromScreen(items, meds));
  });
  app.append(backdrop);
  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && app.classList.contains('sheet-open')) { e.preventDefault(); closeSheet(); } });
  narrowMq.addEventListener('change', () => { if (!narrowMq.matches) closeSheet(); });
}
// The questions from this conversation, to take to whoever they see

// Sig everywhere, and the agents waking up once on arrival
document.querySelectorAll('[data-sig]').forEach((el) => setSig(el, 'idle'));
if (!reduceMotion) {
  for (const list of document.querySelectorAll('.agent-list')) {
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
  save();
}
screenSync();
refreshStack();
stackFromLink();
// The community, live: how many members and first-hand reports Sig speaks for (totals from
// the community's public snapshot; the line stays hidden if it can't load)
const FAMILY = { Reddit: 'Reddit', YouTube: 'YouTube', 'YouTube index': 'YouTube', 'Podcast / YouTube': 'podcasts' };
fetch(`${COMMUNITY}/snapshot.json`).then((r) => (r.ok ? r.json() : null)).then((snap) => {
  const c = snap?.community;
  const el = $('ai-crowd');
  if (!el || !c || !(c.signals > 0)) return;
  const dot = h('span', { class: 'crowd-dot', 'aria-hidden': 'true' });
  if (c.reports > 0) {
    el.replaceChildren(dot, h('span', {}, h('b', { text: fmt(c.members) }), ` member${c.members === 1 ? '' : 's'} · `, h('b', { text: fmt(c.reports) }), ` first-hand report${c.reports === 1 ? '' : 's'} · `,
      h('b', { text: fmt(c.signals) }), ` Community Signal${c.signals === 1 ? '' : 's'}, with public forum data`));
  } else {
    // Before members' reports start, the Signals are what the public forums say: said plainly
    const from = [...new Set(Object.values(snap.signals || {}).flatMap((x) => x?.source_families || []).map((f) => FAMILY[f]).filter(Boolean))];
    el.replaceChildren(dot, h('span', {}, h('b', { text: fmt(c.signals) }), ` Community Signals so far, read from ${from.length ? listOf(from) : 'public forums'}. Members’ first-hand reports take over as they come in. `,
      h('a', { href: `${COMMUNITY}/`, text: 'Add yours' })));
  }
  el.hidden = false;
  // The pairs the community is filling first, until each has its ten reports
  const open = (Array.isArray(snap.focus) ? snap.focus : []).filter((f) => f && f.id && f.label && Number(f.reports) < Number(f.goal)).slice(0, 5);
  if (open.length) {
    el.after(h('p', { class: 'ai-focus' }, h('span', { class: 'kick-sm', text: 'Filling first' }),
      ...open.map((f) => h('a', { href: draftLink([f.id], { title: `How ${cleanName(f.name, 40)} went for me: ${low(cleanName(f.label, 40))}`, body: '' }) },
        `${cleanName(f.name, 40)} for ${low(cleanName(f.label, 40))}`, h('span', { class: 'n', text: ` ${fmt(f.reports)} of ${fmt(f.goal)}` })))));
  }
}).catch(() => {});
// A question typed in for them elsewhere (a Library page, a community space, My Miracle):
// ready to read, change and send; never sent by itself
const asked = askFrom(location.hash);
if (asked) {
  window.history.replaceState(null, '', location.pathname + location.search);
  input.value = asked.slice(0, LIMIT);
  grow();
  updateSend();
  input.focus({ preventScroll: true });
  input.setSelectionRange(input.value.length, input.value.length);
}
// A shorter prompt in the box when it's narrow (on phones, and beside the screen in a smaller window)
const fitPlaceholder = () => { input.placeholder = chatEl.clientWidth < 470 ? input.dataset.short : 'Ask about a goal, a compound or a combination'; };
fitPlaceholder();
addEventListener('resize', fitPlaceholder);
updateSend();
