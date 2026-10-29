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
const form = $('ai-form');
const input = $('ai-input');
const sendBtn = $('ai-send');
const countEl = $('ai-count');
const statusEl = $('ai-status');
const newBtn = $('ai-new');
const railSub = $('rail-sub');
const LIMIT = 2000;
const KEY = 'mh-ai-chat-v1';
const ADULT = 'mh-ai-adult';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

const AGENT_NAME = {
  safety: 'Safety agent', recommender: 'Recommender', synergy: 'Synergy auditor', builder: 'Stack builder',
  review: 'Safety agent', clinician: 'Clinician review',
};
const RAIL_KEY = { review: 'safety' };
const GRADE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence', preclinical: 'Animal and lab studies', anecdotal: 'Anecdotal' };
const GRADE_N = { strong: 4, moderate: 3, limited: 2, preclinical: 1, anecdotal: 0 };
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
};
const GOAL_ICON = {
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
const sigs = () => document.querySelectorAll('.ai-sig,.rail-sig');

// ---------------------------------------------------------------------------
// The answer's words: paragraphs, ### headings, - lists, 1. lists, **bold**, *italic* and
// [Name](lib:id) links to the Library. Anything else stays plain text.
// ---------------------------------------------------------------------------
let LIB_IDS = null;
fetch('/library/data/catalog.json').then((r) => (r.ok ? r.json() : [])).then((c) => { LIB_IDS = new Set(c.map((x) => x.id)); }).catch(() => {});
const isLib = (id) => /^[a-z0-9]{1,40}$/.test(id) && (!LIB_IDS || LIB_IDS.has(id));

const INLINE = /\*\*([^*]+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])/g;
function inline(el, s) {
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    if (m.index > last) el.append(s.slice(last, m.index));
    if (m[1] != null) { const b = h('strong'); inline(b, m[1]); el.append(b); }
    else if (m[2] != null) {
      const id = /^lib:([a-z0-9]+)$/.exec(m[3])?.[1];
      el.append(id && isLib(id) ? h('a', { href: `/library/${id}/`, text: m[2] }) : m[2]);
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
const save = () => store.set(KEY, chat.map((m) => (m.role === 'user' ? m : { ...m, view: undefined, showHelp: undefined, helpShown: undefined })));

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

function shortlistNode(card) {
  const el = h('div', { class: 'card short', 'data-card': card.id || '' });
  el.append(h('div', { class: 'card-head' }, h('div', {}, h('h2', { text: card.title }), h('p', { text: 'Laid out by the Stack builder. Options to raise with a clinician, not a plan to start on your own.' }))));
  if (card.note) el.append(h('p', { class: 'short-note' }, svg(ICON.warn), h('span', { text: card.note })));
  for (const it of card.items || []) {
    const g = GRADE_N[it.grade] ?? -1;
    const meter = h('span', { class: `meter${g >= 1 ? ` g${g}` : ''}`, title: GRADE[it.grade] || 'No fact sheet yet', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'));
    const pills = h('div', { class: 'pick-pills' },
      it.status ? h('span', { class: `st st-${it.status.key}`, text: it.tag || STATUS[it.status.key] }) : h('span', { class: 'ev ev-pending', text: it.tag }),
      it.grade ? h('span', { class: `ev ev-${it.grade}`, text: GRADE[it.grade] || it.grade }) : null);
    const sig = it.signal
      ? h('div', { class: 'pick-sig' }, h('small', { text: 'Signal' }), h('b', { text: Number(it.signal.score).toFixed(0) }), h('span', { text: it.signal.level }))
      : h('div', { class: 'pick-sig' }, h('small', { text: 'Signal' }), h('b', { text: '–' }), h('span', { text: 'Not rated yet' }));
    el.append(h('div', { class: 'pick' },
      meter,
      h('div', {},
        h('div', { class: 'pick-name' }, isLib(it.id) ? h('a', { href: it.url, text: it.name }) : h('b', { text: it.name }), h('span', { class: 'pick-role', text: it.role })),
        it.why ? h('p', { class: 'pick-why', text: it.why }) : null,
        pills,
        it.caution ? h('p', { class: 'pick-warn' }, svg(ICON.warn), h('span', { text: it.caution })) : null),
      sig));
  }
  const audit = h('div', { class: 'audit' }, h('div', { class: 'audit-head busy', text: 'Synergy auditor: checking these together' }));
  if (card.audit) fillAudit(audit, card.audit);
  el.append(audit);
  el.append(h('div', { class: 'review-line' }, svg(ICON.clock), h('span', { text: 'Clinician review: pending. Take this to a licensed clinician who knows your history.' })));
  return el;
}
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
    h('span', { class: `lvl lvl-${f.level}`, text: f.level === 'avoid' ? 'Avoid' : f.level === 'caution' ? 'Caution' : 'Good to know' }),
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
    const li = h('li', { class: 'iq' }, h('p', { class: 'iq-q', id: qid, text: q.q }));
    if (q.options?.length) {
      const group = h('div', { class: 'iq-opts', role: 'group', 'aria-labelledby': qid });
      const sync = () => group.querySelectorAll('.iq-opt').forEach((b) => b.setAttribute('aria-pressed', String(state[i].picked.has(b.dataset.v))));
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
      li.append(group);
      sync();
    }
    const field = h('input', { class: 'iq-text', type: 'text', maxlength: '200', autocomplete: 'off', placeholder: q.options?.length ? 'Or type your own answer' : 'Type your answer', 'aria-labelledby': qid });
    field.value = state[i].text;
    field.disabled = closed;
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
function notes() {
  const lines = [`Notes from Miracle AI to discuss with a clinician (${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`,
    'Education from the Miracle Health Library and Community Signal, not medical advice. Clinician review pending.', ''];
  // What the visitor told Miracle AI when it asked, as a clinician would want it up front
  const about = [];
  for (const m of chat) {
    for (const p of m.parts || []) {
      if (p.t !== 'card' || p.card.type !== 'intake' || !p.card.answered) continue;
      p.card.questions.forEach((q, i) => { const a = answerOf(p.card, i); if (a) about.push(`- ${q.q} ${a}`); });
    }
  }
  if (about.length) lines.push('About me (what I told Miracle AI):', ...about, '');
  const qs = [];
  for (const m of chat) {
    if (m.role !== 'assistant') continue;
    for (const p of m.parts || []) {
      if (p.t !== 'card') continue;
      const c = p.card;
      if (c.type === 'shortlist') {
        lines.push(`${c.title}:`);
        for (const it of c.items) lines.push(`- ${it.name} (${it.tag || STATUS[it.status?.key]}${it.grade ? `, ${GRADE[it.grade].toLowerCase()}` : ''}): ${it.role}.${it.why ? ` ${it.why}` : ''}${it.caution ? ` ${it.caution}` : ''}`);
        const a = c.audit;
        if (a?.findings?.length) for (const f of a.findings) lines.push(`  Checked together: ${(f.names || f.ids).join(' + ')}: ${f.note}`);
        lines.push('');
      }
      if (c.type === 'questions') for (const q of c.items) if (!qs.includes(q)) qs.push(q);
    }
  }
  if (qs.length) lines.push('Questions for my clinician:', ...qs.map((q) => `- ${q}`), '');
  lines.push('From https://miraclehealth.us/ai');
  return lines.join('\n');
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
  statusEl.textContent = on ? 'The agents are working' : 'Five agents ready';
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
  input.value = '';
  grow();
  empty.hidden = true;
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
  const ran = new Set(am.steps.map((s) => (s.agent === 'review' ? 'safety' : s.agent)));
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
    view.foot.append(h('span', { class: `cleared${edited ? ' edited' : ''}` }, svg(edited ? ICON.edit : ICON.check), h('span', { text: said })), h('span', { class: 'foot-actions' }, btn));
    view.foot.hidden = false;
  }
  if (live && !am.helpShown) {
    const stick = nearBottom();
    if (stick) toBottom();
  }
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
  return h('div', { class: 'oops', role: 'alert' }, h('span', { text: am.error }), retry);
}

// ---------------------------------------------------------------------------
// Before the first message: adults only, and what Miracle AI is
// ---------------------------------------------------------------------------
function gate(pending) {
  if (document.getElementById('ai-gate')) return;
  const yes = h('button', { class: 'gate-yes', type: 'button', text: 'I’m 18 or older, continue' });
  const no = h('button', { class: 'gate-no', type: 'button', text: 'Not now' });
  const box = h('div', { class: 'gate', id: 'ai-gate', role: 'region', 'aria-labelledby': 'ai-gate-h' },
    h('h2', { id: 'ai-gate-h', text: 'Before we start' }),
    h('p', { text: 'Miracle AI is for adults 18 and over. It explains what studies and the community say about peptides, supplements and hormones. It doesn’t diagnose, give doses or name sellers, and it doesn’t replace a clinician who knows you.' }),
    h('p', { text: 'Please leave out your name and contact details. Your chat stays in this browser tab; messages go to our AI provider to write the answers and aren’t stored by Miracle Health.' }),
    h('div', { class: 'gate-actions' }, yes, no));
  yes.addEventListener('click', () => {
    adult = true;
    store.set(ADULT, true, 'local');
    box.remove();
    ask(pending);
  });
  no.addEventListener('click', () => { box.remove(); input.value = pending; grow(); updateSend(); input.focus(); });
  empty.hidden = true;
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
document.querySelectorAll('.ai-start').forEach((b) => b.querySelector('.start-ico')?.append(goalIcon(b.dataset.goal)));
newBtn.addEventListener('click', () => {
  if (busy) busy.controller.abort();
  chat = [];
  store.del(KEY);
  thread.querySelectorAll('.msg,.gate').forEach((n) => n.remove());
  empty.hidden = false;
  newBtn.hidden = true;
  railReset('Waiting for your first message', false);
  railNotes();
  input.focus();
});
$('rail-copy')?.addEventListener('click', (e) => copy(notes(), e.currentTarget));

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
  empty.hidden = !!chat.length;
  newBtn.hidden = !chat.length;
  for (const m of chat) thread.append(m.role === 'user' ? userNode(m.text) : assistantNode(m));
  const last = [...chat].reverse().find((m) => m.role === 'assistant');
  if (last) { railReset(''); (last.steps || []).forEach(railStep); railDone(last); }
  railNotes();
  save();
}
// A shorter prompt in the box on narrow screens
const fitPlaceholder = () => { input.placeholder = innerWidth < 520 ? input.dataset.short : 'Ask about a goal, a compound or a combination'; };
fitPlaceholder();
addEventListener('resize', fitPlaceholder);
updateSend();
