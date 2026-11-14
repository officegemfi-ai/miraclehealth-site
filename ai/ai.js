// Sig's own page (miraclehealth.us/sig): the chat with Sig, Miracle Health's AI, filling the browser
// window. The chats are kept on this device until they're deleted (see "The conversation"), with
// the list of them in the side panel. Each message goes to the ask function (the community's Supabase
// project), with the agents the member picked to answer (ai/who.js; the Safety agent always does),
// and it streams back who answers, each agent's steps, the answer, the cards, where the answer came
// from and the final check as server-sent events. Sig speaks as the community's mind (page 19 of the
// design canvas): its answer opens with a headline, each compound it names carries its Community
// Signal, and the studies, the safety line and what to take to a doctor stand apart in labelled
// rows, so the two voices never blur. How it got there (each agent's steps) folds away under the
// answer's first line. Beside the chat (ai/mind.js, ai/screen.js): the blood markers what it's
// about may move, Sig's mind (every Signal as one map, the ones it read lit) and the screen.
// Nothing here uses innerHTML for anything the AI or the visitor wrote: text is placed with
// textContent, and the small amount of formatting the AI uses (bold, lists, Library links) is
// built node by node.
import { askFrom, meterHtml, node as fromKit, GRADES as KIT_GRADES, COMMUNITY, spaceLink, draftLink } from '/kit/kit.js?v=9eee17d93b';
import { sealSvg, levelOf } from '/library/signalviz.js?v=bb8f0ed784';
import { h, svg, getSignal } from '/lib/dom.js?v=cef2a56736';
import { ringSvg, WHEEL, AGENT_COLOR, CENTER } from '/lib/ring.js?v=59d3289bb7';
import { glyphSvg } from '/lib/glyphs.js?v=55198cff0b';
import { picker as whoPicker, tidy as tidyWho, ALL as WHO_ALL, isAll as everyone } from '/ai/who.js?v=aa054cadec';
import { makeRail } from '/ai/mind.js?v=8c2c22060a';

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
const LIMIT = 2000;
const KEY = 'mh-ai-chat-v1';
const ADULT = 'mh-ai-adult';
const STACK = 'mh-ai-stack-v1';    // their stack, kept on this device only if they ask
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

const AGENT_NAME = {
  safety: 'Safety agent', planner: 'Planner', recommender: 'Recommender', evidence: 'Evidence librarian', relatives: 'Relatives agent',
  mechanism: 'Mechanism agent', markers: 'Markers agent', community: 'The community', combination: 'Combination agent', synergy: 'Synergy auditor', builder: 'Stack builder', review: 'Safety agent',
  interpretation: 'Interpretation agent',
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
const ICON = {
  check: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 13h3l7-7-3-3-7 7z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  warn: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 2 15 14H1z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 6.5v3.5M8 11.9v.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  copy: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10.5 3.2V3a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10h.3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  doc: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 1.8h5.2L12.2 5v9.2H4z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M6.2 8.2h3.8M6.2 10.8h3.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  print: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 6V2h7v4M4.5 11.5H2.5v-5h11v5h-2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.5 9.5h7V14h-7z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  qr: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M9.5 9.5h1.6v1.6H9.5zM12.4 12.4H14V14h-1.6zM12.4 9.5H14v1.6h-1.6zM9.5 12.4h1.6V14H9.5z" fill="currentColor"/></svg>',
  link: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.8 9.2a3 3 0 0 0 4.3 0l2-2a3 3 0 0 0-4.3-4.3l-.8.8M9.2 6.8a3 3 0 0 0-4.3 0l-2 2a3 3 0 0 0 4.3 4.3l.8-.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  trash: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  info: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 7.2v4M8 4.9v.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  keep: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2h8v12l-4-3-4 3z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  code: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  net: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="5.6" stroke-dasharray="2 1.6"/><circle cx="8" cy="8" r="1.9" fill="currentColor" stroke="none"/></g><g fill="currentColor"><circle cx="8" cy="2.4" r="1.75"/><circle cx="12.85" cy="10.8" r="1.75"/><circle cx="3.15" cy="10.8" r="1.75"/></g></svg>',
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
// Sig on this page: the ring of the eleven who gather what's known, each in its own colour, with the
// Interpretation agent's dot at its centre (lib/ring.js). Every
// piece lit while Sig is idle, turning while the agents work, the Safety agent's piece beating when
// something was flagged; beside an answer, lit piece by piece as each one reports (lit: who did)
// ---------------------------------------------------------------------------
function setSig(el, mood, lit) {
  if (!el) return;
  if (!el.querySelector('svg')) el.replaceChildren(svg(ringSvg(Number(el.dataset.sig) || 36)));
  const on = lit ? new Set(lit) : null;
  for (const p of el.querySelectorAll('.rg')) p.classList.toggle('on', !on || on.has(p.dataset.a));
  el.classList.toggle('is-spin', mood === 'think' && !lit);
  el.classList.toggle('is-flag', mood === 'concerned');
  el.dataset.mood = mood;
}
const sigs = () => document.querySelectorAll('.ai-sig');
// The agent behind a step (the final check is the Safety agent's), and who reported in an answer,
// in the order they first did
const agentOf = (a) => (a === 'review' ? 'safety' : a);
const ranOf = (m) => [...new Set((m?.steps || []).map((s) => agentOf(s.agent)).filter((a) => a !== 'clinician' && AGENT_NAME[a]))];

// ---------------------------------------------------------------------------
// The answer's words: paragraphs, ### headings, - lists, 1. lists, **bold**, *italic* and
// [Name](lib:id) links to the Library. Anything else stays plain text.
// ---------------------------------------------------------------------------
let LIB_IDS = null;
const CATALOG = fetch('/library/data/catalog.json').then((r) => (r.ok ? r.json() : [])).catch(() => []);
const NAMES = new Map();
CATALOG.then((c) => { LIB_IDS = new Set(c.map((x) => x.id)); for (const x of c) NAMES.set(x.id, x.name); }).catch(() => {});
const isLib = (id) => /^[a-z0-9]{1,40}$/.test(id) && (!LIB_IDS || LIB_IDS.has(id));
// The Library's guides, which aren't compounds
const GUIDES = { 'lab-reports': '/library/lab-reports/' };

const INLINE = /\*\*([^*]+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])/g;
// Names like BPC-157, SS-31 or IGF-1 never break at their hyphen
const WHOLE = /\b[A-Za-z][A-Za-z0-9]{0,6}-[A-Za-z0-9]{1,6}\b/g;
function words(el, t) {
  let at = 0;
  for (const m of t.matchAll(WHOLE)) {
    if (m.index > at) el.append(t.slice(at, m.index));
    el.append(h('span', { class: 'nw', text: m[0] }));
    at = m.index + m[0].length;
  }
  if (at < t.length) el.append(t.slice(at));
}
function inline(el, s) {
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    if (m.index > last) words(el, s.slice(last, m.index));
    if (m[1] != null) { const b = h('strong'); inline(b, m[1]); el.append(b); }
    else if (m[2] != null) {
      const id = /^lib:([a-z0-9-]+)$/.exec(m[3])?.[1];
      const short = m[2].length <= 24 ? 'nw' : null;
      el.append(id && GUIDES[id] ? h('a', { href: GUIDES[id], text: m[2] })
        : id && isLib(id) ? h('a', { href: `/library/${id}/`, class: short, text: m[2] }) : m[2]);
    } else if (m[4] != null) el.append(m[4]);
    else if (m[5] != null) el.append(h('em', { text: m[5] }));
    last = m.index + m[0].length;
  }
  if (last < s.length) words(el, s.slice(last));
}
const BLOCK = /^\s*(#{1,6}\s|[-*•]\s|\d+[.)]\s)/;
// Which voice a paragraph or bullet draws on, from its words: the studies, the community, or both.
// Its line says so (the Evidence librarian for the studies, the community for the community), so
// each claim shows where it comes from, and screen readers hear which after it.
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

// Screen readers hear which voice a part draws on (the words say it too); the labelled rows carry
// the rest
function tagPart(el, text) {
  const v = saidOf(text);
  if (v) el.append(h('span', { class: 'sr', text: SAID_SR[v] }));
  return el;
}
// The rows an answer ends with, each under its label: the studies, the safety line, the next step
// (what to take to a doctor is a card that joins them: questionsNode)
const ROWS = [
  [/^\s*(?:\*\*)?the studies(?:\*\*)?\s*:\s*(?:\*\*)?\s*/i, 'studies', 'the studies'],
  [/^\s*(?:\*\*)?good to know(?:\*\*)?\s*:\s*(?:\*\*)?\s*/i, 'safety', 'good to know'],
  [/^\s*(?:\*\*)?next steps?(?:\*\*)?\s*:\s*(?:\*\*)?\s*/i, 'next', 'next step'],
];
function rowOf(text) {
  for (const [re, kind, label] of ROWS) {
    const m = re.exec(text);
    if (m) {
      const rest = text.slice(m[0].length);
      return { kind, label, rest: rest.charAt(0).toUpperCase() + rest.slice(1) };
    }
  }
  return null;
}
// Which paragraph each compound's Signal goes in: the first (after the headline, never a labelled
// row) that links it
function firstLinks(msg) {
  const firsts = new Map();
  let lead = true;
  for (const p of msg.parts || []) {
    if (p.t !== 'text') continue;
    const m = MORE.exec(p.s);
    for (const b of blocksOf(m ? p.s.slice(0, m.index) : p.s)) {
      if (b.k !== 'p') continue;
      const words = b.lines.join(' ');
      if (lead) { lead = false; continue; }
      if (rowOf(words)) continue;
      for (const x of words.matchAll(LIB_LINK)) if (!firsts.has(x[1])) firsts.set(x[1], words);
    }
  }
  return firsts;
}
const labelled = (kind, label, ...value) => h('div', { class: `a-row r-${kind}` }, h('span', { class: 'a-rk', text: label }), h('div', { class: 'a-rv' }, ...value));
// A compound's Community Signal beside it in the words, the first time the answer links it (only
// when the community answered, and when it has a Signal): ● bpc-157 91.9
let SIG = null;
const chipName = (id) => {
  const n = String(NAMES.get(id) || id);
  return (n.length <= 14 && !/[\s(]/.test(n) ? n : id).toLowerCase();
};
function signalChip(id) {
  const x = SIG?.signals?.[id];
  if (!x || typeof x.score !== 'number') return null;
  const score = Number(x.score).toFixed(1);
  return h('span', { class: 'a-sig', title: `Community Signal: ${score} of 100` }, h('i', { 'aria-hidden': 'true' }), h('span', { 'aria-hidden': 'true', text: chipName(id) }), ' ', h('b', { 'aria-hidden': 'true', text: score }),
    h('span', { class: 'sr', text: ` (Community Signal ${score} of 100)` }));
}
// A paragraph's words, with the Signal of the first compound it links (where mine() says this is
// the paragraph for it) placed where that sentence ends
const LIB_LINK = /\[[^\]]+\]\(lib:([a-z0-9]{1,40})\)/g;
function withChip(el, s, mine) {
  const link = mine ? [...s.matchAll(LIB_LINK)].find((x) => mine(x[1])) : null;
  const id = link?.[1];
  const chip = id && isLib(id) ? signalChip(id) : null;
  if (!chip) { inline(el, s); return el; }
  const after = link.index + link[0].length;
  const end = /[.;!?](?=\s|$)/.exec(s.slice(after));
  const cut = end ? after + end.index : -1;
  // (never inside **bold**: then the Signal goes right after the name)
  if (cut > 0 && ((s.slice(0, cut).match(/\*\*/g) || []).length % 2 === 0)) { inline(el, s.slice(0, cut)); el.append(' ', chip); inline(el, s.slice(cut)); } else { inline(el, s.slice(0, after)); el.append(' ', chip); inline(el, s.slice(after)); }
  return el;
}
// The words in blocks first (headings, lists, paragraphs), so the first can be the bottom line and
// the last the one still being written. The bottom line is the answer's headline; a paragraph that
// starts "The studies:", "Good to know:" or "Next step:" is a labelled row; chips: the compounds
// whose Signal is already shown in this answer (none: no Signals in the words)
function blocksOf(text) {
  const blocks = [];
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const m = /^\s*#{1,6}\s+(.*)$/.exec(line);
    if (m) { blocks.push({ k: 'h2', text: m[1] }); i++; continue; }
    const kind = /^\s*[-*•]\s+/.test(line) ? 'ul' : /^\s*\d+[.)]\s+/.test(line) ? 'ol' : '';
    if (kind) {
      const items = [];
      const re = kind === 'ul' ? /^\s*[-*•]\s+/ : /^\s*\d+[.)]\s+/;
      while (i < lines.length && (re.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (re.test(lines[i])) items.push(lines[i].replace(re, ''));
        else items[items.length - 1] += ` ${lines[i].trim()}`;
        i++;
      }
      blocks.push({ k: kind, items });
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !BLOCK.test(lines[i])) buf.push(lines[i++]);
    blocks.push({ k: 'p', lines: buf });
  }
  return blocks;
}
function prose(text, { lead = false, live = false, chips = null } = {}) {
  const blocks = blocksOf(text);
  return blocks.map((b, bi) => {
    const last = live && bi === blocks.length - 1;
    if (b.k === 'h2') { const el = h('h2'); inline(el, b.text.replace(/\*\*/g, '')); return el; }
    if (b.k === 'p') {
      const words = b.lines.join(' ');
      if (lead && bi === 0) { const el = h('h2', { class: 'a-head' }); inline(el, words.replace(/\*\*/g, '')); return el; }
      const row = rowOf(words);
      if (row) { const rp = h('p'); inline(rp, row.rest); return labelled(row.kind, row.label, tagPart(rp, row.rest)); }
      const p = h('p');
      const mine = chips ? (id) => chips.get(id) === words : null;
      b.lines.forEach((ln, j) => { if (j) p.append(h('br')); withChip(p, ln, mine); });
      return tagPart(p, words);
    }
    const list = h(b.k);
    b.items.forEach((it, ii) => {
      const li = h('li');
      inline(li, it);
      list.append(b.k === 'ul' ? tagPart(li, it, { live: last && ii === b.items.length - 1 }) : li);
    });
    return list;
  });
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
// The chats are kept on this device (localStorage), never sent to us to keep: a list of them, and
// each one under its own key, so two windows of Sig don't write over each other's chats. Which are
// open as tabs, and which is in front, belongs to this browser tab (sessionStorage), like a
// browser window's tabs. Chats the last versions kept only in the tab join the list once.
const LIST = 'mh-sig-chats-v1';
const ONE = (id) => `mh-sig-chat-v1-${id}`;
const OPEN = 'mh-sig-open-v1';
const MAX_TABS = 8;
const MAX_KEPT = 60;
const newId = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');
function fromStore(list) {
  const c = (Array.isArray(list) ? list : []).map((m) => (m.role === 'assistant' && Array.isArray(m.steps) ? { ...m, steps: m.steps.filter((s) => s.agent !== 'clinician') } : m));
  // A turn that never finished (the tab closed mid-answer) is dropped
  while (c.length && c[c.length - 1].role === 'assistant' && !c[c.length - 1].state) c.pop();
  if (c.length && c[c.length - 1].role === 'user') c.pop();
  return c;
}
// A write that says whether it fit (a full device, or storage that's blocked)
function put(k, v) { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); return true; } catch { return false; } }
const readList = () => {
  const l = store.get(LIST, 'local');
  return Array.isArray(l) ? l.filter((c) => c && typeof c.id === 'string' && /^[a-z0-9]{6,16}$/.test(c.id)).map((c) => ({ id: c.id, title: String(c.title || 'Chat').slice(0, 80), at: Number(c.at) || 0 })) : [];
};
const titleOf = (c) => c.find((m) => m.role === 'user')?.text.replace(/\s+/g, ' ').trim().slice(0, 80) || 'New chat';
const bare = (m) => (m.role === 'user' ? m : { ...m, view: undefined, showHelp: undefined, helpShown: undefined });
let list = readList();
const gone = new Set();     // deleted in this window: not kept again
let carried = [];
{
  const tabs = store.get('mh-ai-tabs-v1');
  const one = store.get(KEY);
  const old = tabs?.v === 1 && Array.isArray(tabs.tabs) ? tabs.tabs.map((t) => t.chat) : one ? [one] : [];
  const now = Date.now();
  for (const [i, raw] of old.entries()) {
    const c = fromStore(raw);
    if (!c.length) continue;
    const id = newId();
    if (put(ONE(id), c.map(bare))) { list.push({ id, title: titleOf(c), at: now - i }); carried.push(id); }
  }
  if (old.length) { put(LIST, list); store.del('mh-ai-tabs-v1'); store.del(KEY); }
}
// The tabs that were open in this browser tab come back (the chats they show from the device)
const loadChat = (id) => fromStore(store.get(ONE(id), 'local'));
const openKept = store.get(OPEN);
const sessions = (carried.length ? carried : Array.isArray(openKept?.open) ? openKept.open : [])
  .filter((id, i, a) => typeof id === 'string' && /^[a-z0-9]{6,16}$/.test(id) && a.indexOf(id) === i).slice(0, MAX_TABS)
  .map((id) => ({ id, chat: list.some((c) => c.id === id) ? loadChat(id) : [], nodes: null, at: list.find((c) => c.id === id)?.at || 0 }));
if (!sessions.length) sessions.push({ id: newId(), chat: [], nodes: null, at: 0 });
let activeId = sessions.some((t) => t.id === openKept?.active) ? openKept.active : sessions[0].id;
let chat = sessions.find((t) => t.id === activeId).chat;
let busy = null;            // {controller, msg, sid}: one answer at a time, in the chat it was asked in
let adult = store.get(ADULT, 'local') === true;
const touch = (sid) => { const t = sessions.find((x) => x.id === sid); if (t) t.at = Date.now(); };
// Keeping: every open chat with words in it (only when it changed), the list merged with what
// other windows have kept meanwhile, and the open tabs. A full device makes room by letting go of
// the oldest chats that aren't open; past the most kept, the oldest go too.
function save() {
  let kept = readList().filter((c) => !gone.has(c.id));
  const open = new Set(sessions.map((t) => t.id));
  const spare = () => kept.filter((c) => !open.has(c.id)).sort((a, b) => a.at - b.at)[0];
  for (const t of sessions) {
    if (!t.chat.length || gone.has(t.id)) continue;
    const entry = { id: t.id, title: titleOf(t.chat), at: t.at || Date.now() };
    const i = kept.findIndex((c) => c.id === t.id);
    if (i >= 0) kept[i] = entry; else kept.push(entry);
    const json = JSON.stringify(t.chat.map(bare));
    if (json === t.saved) continue;
    for (let tries = 0; !put(ONE(t.id), json) && tries < MAX_KEPT; tries++) {
      const old = spare();
      if (!old) break;
      store.del(ONE(old.id), 'local');
      kept = kept.filter((c) => c !== old);
    }
    t.saved = json;
  }
  while (kept.length > MAX_KEPT) {
    const old = spare();
    if (!old) break;
    store.del(ONE(old.id), 'local');
    kept = kept.filter((c) => c !== old);
  }
  put(LIST, kept);
  list = kept;
  store.set(OPEN, { active: activeId, open: sessions.map((t) => t.id) });
  drawList();
}
// The conversation a message belongs to (an answer can finish in a chat that isn't open)
const chatOf = (m) => sessions.find((t) => t.chat.includes(m))?.chat || chat;

// The first screen (a greeting, the box, four ways in) or the conversation
function setEmpty(on) {
  empty.hidden = !on;
  if (begin) begin.hidden = !on;
  chatEl.classList.toggle('is-empty', on);
  app.classList.toggle('is-empty', on);
}

// "The bottom" is where the conversation ends, just over the typing bar
const chatEl = document.querySelector('.ai-chat');
// What scrolls: on Sig's own page, the conversation alone, between the title bar and the typing bar,
// which stays put (the page itself never scrolls); elsewhere, the page
const scrollEl = document.getElementById('ai-scroll') || chatEl;
let gap = 0;
const measureGap = () => { gap = parseFloat(getComputedStyle(app).getPropertyValue('--tm-g')) || 0; };
measureGap();
addEventListener('resize', measureGap);
// On Sig's own page the window fills the browser, on a phone too, and the conversation scrolls in
// its own pane
const inPane = () => document.body.classList.contains('sigapp');
const scroller = () => (inPane() ? scrollEl : window);
const scrollPos = () => (inPane() ? scrollEl.scrollTop : window.scrollY);
const chatEnd = () => (inPane() ? scrollEl.scrollHeight - scrollEl.clientHeight : app.getBoundingClientRect().bottom + gap + window.scrollY - window.innerHeight);
function nearBottom() { return scrollPos() >= chatEnd() - 180; }
// (at once: the page's smooth scrolling, started again every frame, would never catch up)
function toBottom() { scroller().scrollTo({ top: Math.max(0, chatEnd()), behavior: 'instant' }); }
// Following an answer down as it's written: from sending it until they scroll up themselves (the
// parts of an answer can arrive faster than the page scrolls to them)
let following = false;
addEventListener('wheel', (e) => { if (e.deltaY < 0) following = false; }, { passive: true });
addEventListener('touchstart', () => { following = false; }, { passive: true });
addEventListener('keydown', (e) => { if (/^(?:PageUp|ArrowUp|Home)$/.test(e.key) && !e.target.closest?.('textarea, input')) following = false; });

// The prompt: who is asking, where, and the arrow (the composer has the same one)
const ps1 = (cls, verb = '') => h('span', { class: cls, 'aria-hidden': 'true' }, h('span', { class: 'ps-host', text: 'sig@miracle' }), ' ',
  h('span', { class: 'ps-path', text: '~/chats' }), ' ', h('b', { text: '›' }), verb ? h('span', { class: 'ps-verb', text: ` ${verb}` }) : null);
// Their question, as typed at the prompt: sig@miracle ~/chats › ask "…"
function userNode(text) {
  return h('div', { class: 'msg me' }, ps1('echo-ps1', 'ask'), h('div', { class: 'bubble', text }));
}

// A view: the DOM for one answer, kept in step with its message. Its first line (Sig's ring lit by
// who answered, what it read, how many answered) with how it got there folded under it (each
// agent's steps, as log lines), then the answer, then the Safety agent's check
let traceN = 0;
function assistantNode(msg) {
  const sigEl = h('span', { class: 'msg-sig', 'data-sig': '22', 'aria-hidden': 'true' });
  const tid = `trace-${++traceN}`;
  const sum = h('button', { class: 'a-how', type: 'button', 'aria-expanded': 'false', 'aria-controls': tid });
  const read = h('span', { class: 'a-read' });
  const readS = h('span', { class: 'a-read-s', 'aria-hidden': 'true' });
  const head = h('div', { class: 'a-top' }, sigEl, h('p', { class: 'a-who' }, h('b', { text: 'Sig' }), read, readS), sum);
  const steps = h('ol', { class: 'trace-steps', 'aria-label': 'What the agents did' });
  const trace = h('div', { class: 'trace', id: tid }, steps);
  sum.addEventListener('click', () => {
    view.open = !traceOpen(msg);
    drawTrace(msg);
  });
  const body = h('div', { class: 'sheet-body' });
  const foot = h('div', { class: 'sheet-foot', hidden: true });
  const sheet = h('div', { class: 'sheet' }, head, trace, body, foot);
  const node = h('div', { class: 'msg ai' }, sheet);
  const view = { node, sigEl, trace, sum, read, readS, steps, head, body, foot, stepEls: new Map(), partEls: [], cardEls: new Map(), cardTags: new Map(), raf: 0, revealIdx: -1, revealShown: Infinity, open: null };
  msg.view = view;
  for (const s of msg.steps || []) drawStep(view, s);
  drawParts(msg);
  if (msg.state) finish(msg, false);
  else drawTrace(msg);
  return node;
}
// How it got there shows while the agents work, and folds under the answer's first line once the
// answer is being written, unless they opened or closed it themselves
const hasBody = (m) => (m.parts || []).some((p) => (p.t === 'text' && p.s.trim()) || p.t === 'card');
const traceOpen = (m) => (m.view?.open ?? (!m.state && !hasBody(m)));
// An answer where help comes first (a sign of crisis, an emergency, someone under 18): plain words,
// no headline, and nothing to tap after it but the help itself
const calmOf = (m) => (!!m.flag && m.flag !== 'none') || (m.parts || []).some((p) => p.t === 'card' && (p.card.type === 'crisis' || p.card.type === 'urgent'))
  || CRISIS_WORDS.test(questionOf(m));
// Who answered: as Sig's server said (its first event), or as the page asked, or who reported
const answered = (m) => (Array.isArray(m?.agents) && m.agents.length ? m.agents : Array.isArray(m?.asked) && m.asked.length ? m.asked : ranOf(m));
// short: for a phone (Sig · 2 Signals · 12 agents)
function readLine(m, short = false) {
  const n = answered(m).length;
  const who = n ? (n === WHO_ALL.length && !short ? `all ${n} agents` : plural(n, 'agent')) : '';
  const line = (xs) => xs.filter(Boolean).map((x) => ` · ${x}`).join('');
  if (!m.state) {
    const last = (m.steps || []).filter((s) => s.status === 'run').pop();
    return line([short ? 'working' : last ? low(last.title) : 'reading your message', who]);
  }
  const src = m.sources || {};
  const sig = Number(src.community?.signals) || 0;
  const sheets = Number(src.studies?.sheets) || 0;
  if (short) return line([sig ? plural(sig, 'Signal') : sheets ? plural(sheets, 'fact sheet') : '', who]);
  const read = sig || sheets ? `read ${[sig ? plural(sig, 'Signal') : '', sheets ? plural(sheets, 'fact sheet') : ''].filter(Boolean).join(' and ')}` : '';
  return line([read, who]);
}
function drawTrace(m) {
  const view = m.view;
  if (!view) return;
  const open = traceOpen(m);
  const steps = m.steps || [];
  view.trace.classList.toggle('open', open);
  view.trace.hidden = !open || !steps.length;
  view.sum.hidden = !steps.length;
  view.sum.setAttribute('aria-expanded', String(open));
  view.sum.replaceChildren(...[h('span', { class: 'ts-car', 'aria-hidden': 'true', text: open ? '▾' : '▸' }), h('span', { text: 'how I got here' }),
    !m.state ? h('span', { class: 'ts-busy', 'aria-hidden': 'true' }) : null].filter(Boolean));
  view.read.textContent = readLine(m);
  view.readS.textContent = readLine(m, true);
  // Sig's ring: turning while the agents work, then lit by those who answered
  setSig(view.sigEl, m.state ? moodOf(m) : 'think', m.state ? answered(m) : null);
}
const moodOf = (msg) => ((msg.flag && msg.flag !== 'none') || msg.state === 'error' ? 'concerned' : msg.state === 'done' ? 'happy' : 'idle');

// A step as a log line: its number, the agent by its short name in its colour, a spinner until
// it's done (then ✓, or ! where it flagged something), and what it did
function drawStep(view, s) {
  let el = view.stepEls.get(s.id);
  if (!el) {
    el = h('li', { class: 'tstep' }, h('span', { class: 'ts-n', 'aria-hidden': 'true', text: String(view.stepEls.size + 1).padStart(2, '0') }),
      h('span', { class: 'ts-who' }), h('span', { class: 'ts-st', 'aria-hidden': 'true' }), h('span', { class: 'ts-text' }));
    view.stepEls.set(s.id, el);
    view.steps.append(el);
  }
  const flagged = (s.flag && s.flag !== 'none') || s.fixed;
  const a = agentOf(s.agent);
  el.className = `tstep ${s.status || 'done'}${flagged ? ' flag' : ''}`;
  el.dataset.agent = a;
  el.querySelector('.ts-who').replaceChildren(h('span', { 'aria-hidden': 'true', text: AGENT_NAME[a] ? a : s.agent }), h('span', { class: 'sr', text: `${AGENT_NAME[s.agent] || s.agent}: ` }));
  const text = el.querySelector('.ts-text');
  text.replaceChildren(h('span', { class: 'tstep-what', text: s.title || '' }));
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
    view.more = { d, box, words: null };
  }
  view.more.d.open = !!view.moreOpen;
  return view.more;
}
// The answer's body, kept in step with its parts. While the words are written out, each frame
// draws again only what changed (the paragraph being written, the fold's words); the paragraphs
// before it, the cards and the sources line stay as they are. Drawing the whole answer again
// every frame kept a phone's main thread half busy while an answer came in.
function drawParts(msg) {
  const view = msg.view;
  const parts = msg.parts || [];
  const drawn = view.drawn || (view.drawn = new Map());
  // A piece is made again only when what it's drawn from changed
  const keep = (key, from, make) => {
    const was = drawn.get(key);
    if (was && was.from === from) return was.el;
    const el = make();
    drawn.set(key, { from, el });
    return el;
  };
  const want = [];
  let hasText = false;
  let fold = null;
  const folded = [];
  // The answer's first words are its bottom line; each compound's Signal goes in the first paragraph
  // that links it, when the community answered
  const calm = calmOf(msg);
  const first = calm ? -1 : parts.findIndex((p) => p.t === 'text' && p.s.trim());
  const chips = SIG && !calm && answered(msg).includes('community') ? firstLinks(msg) : null;
  const chipKey = chips ? [...chips.keys()].join(',') : '';
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
        const cls = `prose${live && !m ? ' streaming' : ''}`;
        const ctx = { lead: i === first, live: live && !m, chips };
        want.push(keep(`text ${i}`, `${cls}|${ctx.lead}|${chipKey}|${before}`, () => {
          const el = h('div', { class: cls });
          el.append(...prose(before, ctx));
          return el;
        }));
      }
      if (m || fold) {
        // A caution never hides: if one ends up after "More detail:", the fold stays open
        if (CAUTION.test(after)) view.moreOpen = true;
        if (!fold) { fold = moreFold(view); want.push(fold.d); }
        if (view.moreOpen) fold.d.open = true;
        folded.push(after);
      }
    } else if (p.t === 'card') {
      let el = view.cardEls.get(p);
      if (!el) {
        el = cardNode(p.card, msg);
        view.cardEls.set(p, el);
        const who = cardWho(p.card);
        if (who) {
          if (el.classList.contains('card')) el.dataset.agent = who[0][0];
          view.cardTags.set(p, h('p', { class: 'ctag', 'aria-hidden': 'true' }, h('span', { class: 'pt-k', text: `// ${who[1]}` }),
            h('span', { class: 'pt-by' }, who[0].map((a, j) => [j ? ' · ' : '', h('b', { 'data-agent': a, text: AGENT_NAME[a] })]))));
        }
      }
      const tag = view.cardTags.get(p);
      if (tag) want.push(tag);
      want.push(el);
    }
  });
  if (fold) {
    const words = folded.join('\u0000');
    if (fold.words !== words) { fold.box.replaceChildren(...folded.flatMap((t) => prose(t))); fold.words = words; }
  }
  if (!msg.state && !hasText) {
    const said = waitingText(msg);
    want.push(keep('waiting', said, () => h('p', { class: 'waiting' }, h('i'), h('i'), h('i'), h('span', { text: said }))));
  }
  if (msg.sources && hasText) {
    const src = keep('sources', JSON.stringify(msg.sources), () => sourcesNode(msg.sources));
    if (src) want.push(src);
  }
  if (msg.state === 'error' && msg.error) want.push(keep('error', msg.error, () => errorNode(msg)));
  // The pieces in order, touching only those that came, went or moved
  const kids = view.body.childNodes;
  want.forEach((el, i) => { if (kids[i] !== el) view.body.insertBefore(el, kids[i] || null); });
  while (kids.length > want.length) view.body.lastChild.remove();
  if (view.hadBody !== hasBody(msg)) { view.hadBody = hasBody(msg); drawTrace(msg); }
}
// Who made each card, and what it is; help in a crisis or an emergency stands alone
function cardWho(card) {
  switch (card.type) {
    case 'shortlist': return card.kind === 'yours' ? [['synergy'], 'your stack, checked together'] : [['builder'], 'options to discuss with your doctor'];
    case 'plan': return null;
    case 'voices': return null;
    case 'community': return [['community'], 'what people report'];
    case 'compare': return [['evidence'], 'side by side'];
    case 'questions': return null;
    case 'interpretation': return null;
    case 'intake': return [['recommender'], 'a few questions first'];
    case 'audit': return [['synergy'], 'checked together'];
    case 'warn': return [['safety'], 'when to get help'];
    case 'inject': return [['safety'], 'the safety basics'];
    default: return null;
  }
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
    // (an answer going on in a chat that isn't open doesn't move the page)
    const stick = view.node.isConnected && (following || nearBottom());
    following = stick;
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
      following = false;
      view.body.querySelector('.card.help')?.scrollIntoView({ block: 'start' });
    } else if (stick && !msg.helpShown) toBottom();
  });
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
function cardNode(card, msg) {
  if (card.type === 'shortlist') return shortlistNode(card);
  // The studies and the community side by side: in the words now (each compound's Signal, the
  // studies' row) and beside the chat (Sig's mind, the screen)
  if (card.type === 'voices') return h('div', { class: 'a-none', hidden: true });
  if (card.type === 'community') return crowdNode(card);
  if (card.type === 'compare') return compareNode(card);
  if (card.type === 'plan') return planNode(card, msg);
  if (card.type === 'questions') return questionsNode(card);
  if (card.type === 'interpretation') return interpretationNode(card);
  if (card.type === 'intake') return intakeNode(card);
  if (card.type === 'audit') return auditNode(card);
  if (card.type === 'warn') {
    return h('div', { class: 'card warn', role: 'note', 'aria-labelledby': `${card.id || 'warn'}-h` },
      h('h2', { id: `${card.id || 'warn'}-h`, text: 'When to get help' }), warnGroups(card.groups), h('p', { class: 'warn-note', text: card.note || '' }),
      h('p', { class: 'warn-note' }, 'After a serious reaction to a medicine, supplement or other product, you or your doctor can report it to the FDA through ', h('a', { href: MEDWATCH, target: '_blank', rel: 'noopener', text: 'MedWatch' }), '.'));
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
  // One line until it's opened: what it's for, and where they start
  const first = cleanName(card.first || card.first_step || '', 90);
  const box = h('details', { class: 'a-plan' }, h('summary', {},
    h('span', { class: 'ap-k', text: 'your plan' }), h('span', { class: 'ap-t' }, h('b', { text: cleanName(card.title || 'Your Miracle Plan', 70) }), first ? h('span', { text: `start: ${first}` }) : null),
    h('span', { class: 'ap-open', 'aria-hidden': 'true', text: 'open' })), el);
  if (el.fill) box.fill = el.fill;
  return box;
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
        : top === 'caution' ? 'The Synergy auditor found something worth checking' : ids.length > 1 ? 'No clash found' : 'Checked for you';
  const n = SCREEN?.sum?.(ids);
  const bits = n ? [n.cautions ? plural(n.cautions, 'safety note') : '', n.markers ? plural(n.markers, 'blood marker') : ''].filter(Boolean) : [];
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
  // Again once the screen has these compounds' lines, for its counts
  SCREEN?.ready?.then(() => SCREEN.need?.((card.items || []).map((it) => it && it.id).filter(libId))).then(() => btn.fill());
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
    : 'Laid out by the Stack builder: options to talk through with your doctor.';
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
// reports (in black and blue, as in the community), side by side. The one that leads for what was
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
  pregnancy: ['Left out in pregnancy', 'Most of these haven’t been studied in pregnancy, so what people report isn’t shown. Your obstetrician or midwife is the one to ask.'],
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

const AUDIT_LEVEL = { avoid: 'Avoid', caution: 'Worth checking', unknown: 'Unknown', info: 'Good to know' };
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
  // The evidence for what they asked about keeps the screen: a card about other compounds (a plan
  // built on foundations, options for the goal) doesn't take it away
  const about = [...new Set((Array.isArray(m.ladder?.rows) ? m.ladder.rows : []).map((r) => r && r.id).filter(libId))].slice(0, 6);
  for (let j = cards.length - 1; j >= 0; j--) {
    const s = cardSet(cards[j], i);
    if (s && (!about.length || about.some((id) => s.ids.includes(id)))) return withLog(s, m);
  }
  if (about.length) return withLog({ ids: about, findings: [], ok: null, meds: [], asked: cards.some((c) => c.type === 'intake'), at: i }, m);
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
// What to take to a doctor: one row under the answer's own, to copy in a tap
function questionsNode(card) {
  const items = (card.items || []).map((q) => String(q)).filter(Boolean);
  const btn = h('button', { class: 'a-copy', type: 'button' }, h('span', { text: 'copy' }));
  btn.addEventListener('click', () => copy(['To discuss with my clinician:', ...items.map((q) => `- ${q}`)].join('\n'), btn));
  return labelled('doctor', 'for your doctor', h('ul', { class: 'a-list' }, items.map((q) => h('li', { text: q }))), btn);
}

// The Interpretation agent's read, last in an answer: strictly efficacy, reasoned through from what
// the other agents found. Each step of the reasoning (strongest evidence first, and which rung it
// stands on), then the verdict, how big the effect could be, how sure anyone can be and what would
// change that, then the read in plain words. Everything in it went through the Safety agent's check.
const VERDICT = ['likely', 'plausible', 'unlikely', 'unclear'];
const RUNG = { together: 'tested together', own: 'its own studies', relative: 'a close relative', mechanism: 'how it works', community: 'what people report', none: 'nothing yet' };
function interpretationNode(card) {
  const v = VERDICT.includes(card.verdict) ? card.verdict : 'unclear';
  const line = (k, val, cls = '') => (val ? h('div', { class: `ip-row${cls ? ` ${cls}` : ''}` }, h('dt', { text: k }), h('dd', {}, val)) : null);
  const steps = (Array.isArray(card.steps) ? card.steps : []).slice(0, 6).filter((x) => x && x.link && x.read);
  // A row under the answer: the verdict, in plain words, with how it was reasoned a tap away
  const how = h('details', { class: 'a-eff' },
    h('summary', {}, h('span', { class: 'ae-open', text: 'how it reasoned' }), h('span', { class: 'ae-v' }, h('i', { class: `ip-dot v-${v}`, 'aria-hidden': 'true' }), card.label || v),
      [card.size ? (card.size === 'unclear' ? 'size unclear' : `${card.size} effect`) : '', card.confidence ? `${card.confidence} confidence` : ''].filter(Boolean).map((t) => h('span', { class: 'ae-b', text: ` · ${t}` }))),
    card.subject ? h('p', { class: 'ae-sub', text: `${card.subject}. Reasoned through by the Interpretation agent, from what the other agents found; efficacy only.` }) : null,
    h('dl', { class: 'ip-steps' }, steps.map((x) => h('div', { class: 'ip-row' }, h('dt', { text: x.link }),
      h('dd', {}, x.read, RUNG[x.rung] ? h('span', { class: 'ip-rung', text: RUNG[x.rung] }) : null)))),
    h('dl', { class: 'ip-verdict' },
      line('likely size', [card.size, card.size_note].filter(Boolean).join(': ')),
      line('confidence', [card.confidence, card.confidence_note].filter(Boolean).join(': ')),
      line('what would change it', card.would_change || '')));
  return labelled('efficacy', 'efficacy', card.summary ? h('p', { text: card.summary }) : null, how);
}
// An answer as text to copy: its words, then the efficacy read when there is one
const copyOf = (m) => {
  const read = (m.parts || []).find((p) => p.t === 'card' && p.card.type === 'interpretation')?.card;
  return [textOf(m), read ? `Efficacy (Interpretation agent): ${read.label || read.verdict}. ${read.summary || ''}`.trim() : ''].filter(Boolean).join('\n\n');
};

// Questions for the visitor, the way a clinician takes a history: tap an answer, type one, or
// both. The answers go back as the visitor's next message; nothing is kept anywhere else.
const NONE_LIKE = /^(?:none|no|not sure|neither|nothing|prefer not to say)\b/i;
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
// A date as the chat shows it ("November 7, 2026"), the same words as the clinician's copy (ai/packet.js),
// which this page no longer loads just for this
const dayLabel = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
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
    const check = h('button', { class: 'saved-check', type: 'button', text: 'Check what I take again' });
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
  if (on) setState('working');
  sigs().forEach((el) => setSig(el, on ? 'think' : 'idle'));
  thread.setAttribute('aria-busy', String(on));
  updateSend();
}
// The status bar: ready, the agents working, Sig writing, then how it ended and how long it took
const stateEl = $('tm-state');
const STATE_SAID = { ready: 'ready', working: 'working', writing: 'writing', stopped: 'stopped', error: 'couldn’t answer' };
function setState(st, ms = 0) {
  const known = Object.hasOwn(STATE_SAID, st);
  const said = known ? STATE_SAID[st] : `done${ms ? ` · ${(ms / 1000).toFixed(1)} s` : ''}`;
  if (stateEl) stateEl.dataset.state = known ? st : 'done';
  if (statusEl.textContent !== said) statusEl.textContent = said;
}
// Send, or stop the answer being written in this chat; while Sig answers in another chat, this one
// waits (one answer at a time)
function updateSend() {
  const n = input.value.length;
  countEl.textContent = n > LIMIT - 300 ? `${(LIMIT - n).toLocaleString('en-US')} left` : '';
  countEl.classList.toggle('over', n > LIMIT);
  const here = !!busy && busy.sid === activeId;
  const elsewhere = !!busy && !here;
  sendBtn.classList.toggle('stop', here);
  sendBtn.setAttribute('aria-label', here ? 'Stop' : 'Send');
  sendBtn.title = elsewhere ? 'Sig is answering in another chat' : '';
  sendBtn.disabled = elsewhere || (!busy && (!input.value.trim() || n > LIMIT));
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
  thread.querySelectorAll('.a-next, .a-quiet').forEach((el) => el.remove());
  input.value = '';
  grow();
  setEmpty(false);
  touch(activeId);
  const um = { role: 'user', text: t };
  chat.push(um);
  thread.append(userNode(t));
  const am = { role: 'assistant', parts: [], steps: [], asked: whoFor(sessions.find((t) => t.id === activeId)) };
  chat.push(am);
  thread.append(assistantNode(am));
  toBottom();
  following = true;
  save();
  run(am);
}

async function run(am) {
  const controller = new AbortController();
  const sid = activeId;
  const own = chat;
  busy = { controller, msg: am, sid };
  setBusy(true);
  drawTabs();
  // Beside the chat: Sig's mind, lighting up as the agents read, unless they're looking at
  // something there themselves
  if (!tabByHand) setTab('mind');
  RAIL?.mind.light([]);
  const t0 = performance.now();
  // Who answers: the chat's choice (Sig's server leaves out anyone not on it; the Safety agent always answers)
  const asked = tidyWho(am.asked || whoFor(sessions.find((t) => t.id === sid)));
  am.asked = asked;
  drawTrace(am);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history(), ...(everyone(asked) ? {} : { agents: asked.filter((a) => a !== 'safety') }) }), signal: controller.signal,
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
  touch(sid);
  finish(am, true);
  setBusy(false);
  drawTabs();
  SCREEN?.checking(false);
  const open = sid === activeId;
  if (open) {
    setState(am.state, am.ms);
    screenSync();
    // Beside the chat, what the answer was about: the blood tests it may move, else Sig's mind
    railSync({ choose: !tabByHand });
  } else showState();
  tabByHand = false;
  sigs().forEach((el) => setSig(el, moodOf(am) === 'concerned' ? 'concerned' : 'idle'));
  fitPlaceholder();
  save();
  if (open && !coarse) input.focus();
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
  const here = busy?.msg === am && busy.sid === activeId;
  switch (ev) {
    case 'meta':
      if (Array.isArray(d.agents)) am.agents = tidyWho(d.agents.filter((a) => typeof a === 'string'));
      drawTrace(am);
      break;
    case 'step': {
      // The member's own clinician isn't a step in the chat (an older server still sends one)
      if (d.agent === 'clinician') break;
      const i = am.steps.findIndex((s) => s.id === d.id);
      if (i >= 0) am.steps[i] = { ...am.steps[i], ...d }; else am.steps.push(d);
      if (d.flag && d.flag !== 'none') am.flag = d.flag;
      drawStep(view, am.steps.find((s) => s.id === d.id));
      drawTrace(am);
      if (here && d.agent === 'community' && d.chips?.length) RAIL?.mind.light(d.chips.map((c) => c && c.id).filter(libId));
      // The screen says the auditor is checking, and shows what was named as soon as it's read
      if (d.agent === 'synergy' && d.status === 'run' && busy?.sid === activeId) SCREEN?.checking(true);
      if (d.agent === 'community' && d.chips?.length) screenSync();
      schedule(am);
      break;
    }
    case 'text': {
      if (busy?.msg === am) setState('writing');
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
      if (here) RAIL?.mind.light(readIn(am));
      drawTrace(am);
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
  // The run's line: its steps, the agents who worked on it (the visitor's own clinician isn't one
  // of them) and how long it took
  view.trace.classList.add('done');
  drawTrace(am);
  // The head says whether the Safety agent cleared it or edited it; the foot copies it
  view.foot.replaceChildren();
  if (am.state === 'done' || am.state === 'stopped') {
    const edited = am.review && am.review.ok === false;
    const r = am.review || {};
    const changes = [r.edited ? `edited ${r.edited} part${r.edited === 1 ? '' : 's'}` : '', r.held ? `held back ${r.held}` : ''].filter(Boolean).join(' and ');
    const said = am.state === 'stopped' ? 'stopped before the end; what’s shown was checked'
      : edited ? `${changes || 'edited this'} before you saw it`
      : am.review ? 'every part checked before you saw it' : '';
    const btn = h('button', { class: 'mini', type: 'button' }, svg(ICON.copy), h('span', { text: 'Copy' }));
    btn.addEventListener('click', () => copy(copyOf(am), btn));
    const sub = SCREEN ? subjectIn(am, chatOf(am).indexOf(am)) : null;
    const pointed = (am.parts || []).some((p) => p.t === 'card' && p.card.type === 'shortlist' && p.card.kind === 'yours');
    const go = sub && !pointed ? h('button', { class: 'ai-toscreen', type: 'button' }, svg(ICON.code), h('span', { text: 'See it on the screen' })) : null;
    go?.addEventListener('click', () => { SCREEN.show(sub); openScreen(); });
    const checked = am.review || am.state === 'stopped';
    const line = !checked ? 'answered' : am.state === 'stopped' ? said : edited ? `the safety agent ${said}` : 'checked by the safety agent';
    view.foot.append(h('span', { class: `a-check${edited ? ' edited' : ''}` }, svg(edited ? ICON.edit : ICON.check), h('span', { text: line })), h('span', { class: 'foot-actions' }, go, btn));
    view.foot.hidden = false;
  }
  // The newest answer ends with where to go next: a few follow-ups, and the members themselves
  view.node.querySelectorAll(':scope .a-next, :scope .a-quiet').forEach((el) => el.remove());
  if (am.state === 'done' && chatOf(am)[chatOf(am).length - 1] === am && !calmOf(am)) {
    const quiet = quietNode(am);
    if (quiet) view.foot.before(quiet);
    const next = nextNode(am);
    if (next) view.node.querySelector('.sheet').append(next);
  }
  helpPin();
  if (live && !am.helpShown && view.node.isConnected) {
    if (following || nearBottom()) toBottom();
    following = false;
  }
}

// What an answer was about: the compounds named (the fact sheets opened for them), else those the
// community or the auditor read
function namedIn(m) {
  const steps = m?.steps || [];
  const s = steps.find((x) => x.id === 'lookup' && x.chips?.length) || steps.find((x) => x.agent === 'community' && x.chips?.length)
    || steps.find((x) => x.agent === 'synergy' && x.chips?.length);
  return [...new Set((s?.chips || []).map((c) => c && c.id).filter(libId))].slice(0, 4);
}
// The Signals an answer read: as where it came from says, else what the community's step read
function readIn(m) {
  const names = m?.sources?.community?.names;
  const ids = Array.isArray(names) && names.length ? names.map((x) => x && x.id) : (m?.steps || []).filter((x) => x.agent === 'community').flatMap((x) => (x.chips || []).map((c) => c && c.id));
  return [...new Set(ids.filter(libId))].slice(0, 8);
}
const questionOf = (am) => {
  const own = chatOf(am);
  const i = own.indexOf(am);
  return i > 0 && own[i - 1].role === 'user' ? own[i - 1].text : '';
};
const nameFor = (id) => cleanName(NAMES.get(id) || id, 40);
// The name people use: what's in brackets (HGH), else the name
const callFor = (id) => /\(([^)]{2,12})\)/.exec(nameFor(id))?.[1] || nameFor(id);
// A few follow-ups to tap, from what the answer was about and who answered; then the question
// itself, ready to post in the community
function nextNode(am) {
  const ids = namedIn(am);
  const who = answered(am);
  const [a, b] = ids.map(callFor);
  const qs = [];
  if (a && who.includes('community')) qs.push(`What side effects do people mention with ${a}?`);
  if (a && b) qs.push(`How do ${a} and ${b} compare?`);
  else if (a) qs.push(`What do the studies show for ${a}?`);
  if (a && who.includes('markers') && RAIL?.markers.count()) qs.push(`Which blood tests matter with ${a}${b ? ` and ${b}` : ''}?`);
  else if (a) qs.push(`What should I ask my doctor about ${a}?`);
  const q = questionOf(am);
  const btns = qs.slice(0, 3).map((t) => {
    const btn = h('button', { class: 'a-q', type: 'button', text: t });
    btn.addEventListener('click', () => { if (!busy) ask(t); });
    return btn;
  });
  const members = q ? h('a', { class: 'a-q a-members', href: draftLink(ids, { title: cleanName(q, 140), body: q.length > 140 ? q : '' }), target: '_blank', rel: 'noopener' },
    'Ask the members this', h('span', { class: 'a-ar', 'aria-hidden': 'true', text: ' ↗' }), h('span', { class: 'sr', text: ' (opens the community in a new tab)' })) : null;
  if (!btns.length && !members) return null;
  return h('div', { class: 'a-next', role: 'group', 'aria-label': 'Ask next' }, btns, members);
}
// A compound the community has no Signal for yet: rather than guess, ask the people who'd know.
// The question opens in the community's new-post form, filled in, for them to post themselves;
// and this device can say when its Signal goes live.
const FOLLOW = 'mh-sig-follow-v1';
const followed = () => { const f = store.get(FOLLOW, 'local'); return Array.isArray(f) ? f.filter(libId).slice(0, 20) : []; };
function quietNode(am) {
  if (am.quietDone || !SIG?.signals || !answered(am).includes('community')) return null;
  const id = namedIn(am).find((x) => !SIG.signals[x]);
  if (!id) return null;
  const name = nameFor(id);
  const q = questionOf(am);
  const tid = `qc-${++traceN}`;
  const ta = h('textarea', { class: 'qc-q', id: tid, rows: '2', maxlength: '1000' });
  ta.value = q;
  const link = () => draftLink([id], { title: cleanName(ta.value, 140), body: ta.value.length > 140 ? ta.value.trim() : '' });
  const go = h('a', { class: 'qc-go', href: link(), target: '_blank', rel: 'noopener' }, 'Ask the members', h('span', { class: 'a-ar', 'aria-hidden': 'true', text: ' ↗' }), h('span', { class: 'sr', text: ' (opens the community in a new tab)' }));
  ta.addEventListener('input', () => { go.href = link(); });
  const not = h('button', { class: 'qc-not', type: 'button', text: 'Not now' });
  const box = h('input', { type: 'checkbox', class: 'qc-box', checked: followed().includes(id) });
  box.addEventListener('change', () => {
    const now = followed().filter((x) => x !== id);
    store.set(FOLLOW, box.checked ? [...now, id] : now, 'local');
  });
  const card = h('section', { class: 'a-quiet', 'aria-label': `Ask the members about ${name}` },
    h('div', { class: 'qc-head' }, svg(glyphSvg('community', { size: 18 })), h('h3', { text: 'Ask the members' }), h('span', { class: 'qc-k', text: 'you post it yourself' })),
    h('p', { class: 'qc-lede', text: `${name} has no Community Signal yet: not enough members have shared how it went. Rather than guess, ask the people who’d know.` }),
    h('label', { class: 'qc-l', for: tid, text: `your question, ready to post in s/${id}` }), ta,
    h('div', { class: 'qc-acts' }, go, not, h('label', { class: 'qc-follow' }, box, h('span', { text: `Show me here when ${name}’s Signal goes live` }))));
  not.addEventListener('click', () => { am.quietDone = true; save(); card.remove(); });
  return card;
}

// After a sign of crisis, 988 stays in reach for the rest of the visit
// Once someone has written about wanting to die or hurt themselves, 988 stays on screen in every
// chat, even if the answer couldn't come
function helpPin() {
  const show = sessions.some((t) => t.chat.some((m) => (m.role === 'user' && CRISIS_WORDS.test(m.text || ''))
    || (m.role === 'assistant' && (m.flag === 'self_harm' || (m.parts || []).some((p) => p.t === 'card' && p.card.type === 'crisis')))));
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
  const own = chatOf(am);
  const i = own.indexOf(am);
  const said = i > 0 && own[i - 1].role === 'user' ? own[i - 1].text : '';
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
    h('p', { text: 'Sig is Miracle Health’s AI, for adults 18 and over. It explains evidence and what people report; it isn’t a person or a doctor.' }),
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
  if (busy) { if (busy.sid === activeId) busy.controller.abort(); return; }
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
// The screen: beside the chat on wide screens. On phones and narrow windows it's a sheet that
// pulls up over the chat, from the bar above the box to write in (or "See it on the screen"
// under an answer); the page behind it rests until it's closed, and nothing is taken away.
const rail = $('ai-screen');
const narrowMq = matchMedia('(max-width: 1100px)');
const backdrop = h('div', { class: 'sc-backdrop', 'aria-hidden': 'true' });
let sheetFrom = null;
const behind = () => [document.querySelector('header.top'), document.querySelector('.sg-side'), chatEl, document.querySelector('.foot')].filter(Boolean);
function openSheet() {
  if (!SCREEN || !rail || !narrowMq.matches || !SCREEN.subject() || app.classList.contains('sheet-open')) return;
  sheetFrom = document.activeElement;
  app.classList.add('sheet-open');
  document.documentElement.classList.add('sheet-lock');
  rail.setAttribute('role', 'dialog');
  rail.setAttribute('aria-modal', 'true');
  for (const el of behind()) el.inert = true;
  rail.scrollTop = 0;
  requestAnimationFrame(() => $('rl-close')?.focus({ preventScroll: true }));
}
function openScreen() {
  if (!SCREEN || !rail) return;
  setTab('screen');
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
// Beside the chat, three tabs (page 19 of the design canvas): the blood markers what it's about may
// move, Sig's mind (every Signal as one map, the ones an answer read lit) and the screen. Sig's mind
// while the agents work, then the markers when the answer moves any, else the mind; a tab picked
// by hand during an answer stays picked. On narrower screens the same three, as the sheet.
const RAIL = makeRail({ h, svg, getSignal, catalog: CATALOG, spaceLink, community: COMMUNITY, copy });
const tabs = { markers: $('tm-t-markers'), mind: $('tm-t-mind'), screen: $('tm-t-screen') };
const panels = { markers: $('rl-markers'), mind: $('rl-mind'), screen: $('sc-root') };
const ORDER = ['markers', 'mind', 'screen'];
const TITLES = { markers: ['Blood markers', 'what it may move'], mind: ['Sig’s mind', 'every Signal, one memory'], screen: ['The screen', 'how it works in the body'] };
let tab = 'mind';
let tabByHand = false;
if (panels.markers) RAIL.markers.mount(panels.markers);
if (panels.mind) RAIL.mind.mount(panels.mind);
function syncPanels() {
  for (const [k, p] of Object.entries(panels)) if (p) p.hidden = k !== tab;
  if (panels.screen) panels.screen.setAttribute('role', 'tabpanel');
  const t = $('rl-title');
  if (t) {
    t.querySelector('.rl-name').textContent = TITLES[tab][0];
    t.querySelector('.rl-sub').textContent = TITLES[tab][1];
  }
}
function setTab(name, { hand = false, focus = false } = {}) {
  if (!tabs[name] || !panels[name]) return;
  tab = name;
  if (hand) tabByHand = true;
  for (const [k, b] of Object.entries(tabs)) {
    if (!b) continue;
    const on = k === name;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    if (on) b.classList.remove('new');
  }
  syncPanels();
  if (focus) tabs[name].focus();
}
for (const [name, b] of Object.entries(tabs)) {
  if (!b) continue;
  b.addEventListener('click', () => setTab(name, { hand: !!busy }));
  b.addEventListener('keydown', (e) => {
    const i = ORDER.indexOf(tab);
    const to = e.key === 'Home' ? ORDER[0] : e.key === 'End' ? ORDER[ORDER.length - 1]
      : e.key === 'ArrowRight' ? ORDER[(i + 1) % ORDER.length] : e.key === 'ArrowLeft' ? ORDER[(i + ORDER.length - 1) % ORDER.length] : '';
    if (!to) return;
    e.preventDefault();
    setTab(to, { hand: !!busy, focus: true });
  });
}
$('rl-close')?.addEventListener('click', () => closeSheet());
narrowMq.addEventListener('change', () => {
  syncPanels();
  if (!narrowMq.matches) setSig(document.querySelector('.tm-logo'), busy ? 'think' : 'idle');
});
// The answer the side panel is about: the one being written, or the last one with steps
function teamMsg() {
  if (busy && busy.sid === activeId) return busy.msg;
  for (let i = chat.length - 1; i >= 0; i--) if (chat[i].role === 'assistant') return (chat[i].steps || []).length ? chat[i] : null;
  return null;
}
// Who answers in each chat (ai/who.js): its own choice, kept with its answers; a new chat starts
// with the last choice made anywhere
const WHO_KEY = 'mh-sig-who-v1';
function whoFor(t) {
  if (t?.who) return tidyWho(t.who);
  const last = [...(t?.chat || [])].reverse().find((m) => m.role === 'assistant' && Array.isArray(m.asked));
  if (last) return tidyWho(last.asked);
  const kept = store.get(WHO_KEY, 'local');
  return tidyWho(Array.isArray(kept) ? kept : WHO_ALL);
}
// The count in a phone's title bar
function drawCount(on) {
  const el = $('tm-count-sm');
  if (el) el.replaceChildren(h('b', { text: String(on.length) }), `/${WHO_ALL.length} agents`);
}
const pickRing = document.querySelector('.who-ring');
const bigRing = document.querySelector('.who-big');
const pick = $('ai-who') && $('ai-whopop') ? whoPicker({
  pill: $('ai-who'), pop: $('ai-whopop'), label: $('ai-who-label'),
  onRing: (on) => { setSig(pickRing, 'idle', on); setSig(bigRing, 'idle', on); drawCount(on); },
  onChange: (on) => {
    const t = sessions.find((x) => x.id === activeId);
    if (t) t.who = on;
    store.set(WHO_KEY, on, 'local');
  },
}) : null;
pick?.set(whoFor(sessions.find((t) => t.id === activeId)));
// What it was about, beside the chat: the blood tests its compounds may move, and the Signals it
// read lit in Sig's mind. choose: open the tab that has something (the markers when they move any)
async function railSync({ choose = false } = {}) {
  const m = teamMsg();
  const ids = m ? namedIn(m) : [];
  RAIL.mind.light(m ? readIn(m) : []);
  const n = await RAIL.markers.show(ids, Object.fromEntries(ids.map((id) => [id, nameFor(id)])));
  // the rack opens by itself when the Markers agent answered and there's something on it
  if (choose && !busy) setTab(n && m && answered(m).includes('markers') ? 'markers' : 'mind');
}
// ---------------------------------------------------------------------------
// The chats as tabs, like a browser's: in the title bar (in the conversation's header on a phone),
// named by their first question. + opens a new one; × closes one, and stops its answer if it's
// being written (the last one closed leaves an empty chat). Each chat keeps its own lines on the
// page and its place in them; the screen, the agents and the status bar follow the one that's open.
// ---------------------------------------------------------------------------
const tabsNav = $('tm-chats');
const plusBtn = $('tm-plus');
const tabStrip = $('tm-tabstrip');
const chatName = (t) => titleOf(t.chat);
// The open chat as a path in the terminal's bar: ~/chats/hgh-enclomiphene-fat-loss
const slugEl = $('tm-slug');
const SLUG_SKIP = new Set('a an and any are about be can could did do does for good bad how i in is it me my of on or plus should that the their there this to vs was were what when which will with would you your'.split(' '));
const slugOf = (title) => String(title || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
  .filter((w) => w && !SLUG_SKIP.has(w)).slice(0, 4).join('-') || 'chat';
function drawTabs() {
  if (!tabsNav) return;
  const was = document.activeElement?.closest?.('.tm-tab');
  const back = was ? { id: was.dataset.id, x: document.activeElement.classList.contains('tm-tabx') } : null;
  const lone = sessions.length === 1 && !sessions[0].chat.length;
  tabsNav.replaceChildren(...sessions.map((t) => {
    const name = chatName(t);
    const on = t.id === activeId;
    const open = h('button', { class: 'tm-tabopen', type: 'button', title: name, 'aria-current': on ? 'true' : null },
      h('i', { class: 'tm-tabdot', 'aria-hidden': 'true' }), h('span', { class: 'tm-tabname', text: name }),
      busy?.sid === t.id ? h('span', { class: 'sr', text: ' (Sig is answering)' }) : null);
    const shut = h('button', { class: 'tm-tabx', type: 'button', title: 'Close chat', 'aria-label': `Close chat: ${name}` }, svg(ICON.close));
    open.addEventListener('click', () => switchTo(t.id));
    open.addEventListener('auxclick', (e) => { if (e.button === 1) { e.preventDefault(); closeTab(t.id); } });
    shut.addEventListener('click', () => closeTab(t.id));
    return h('div', { class: `tm-tab${on ? ' on' : ''}${busy?.sid === t.id ? ' busy' : ''}${lone ? ' lone' : ''}`, 'data-id': t.id }, open, shut);
  }));
  if (slugEl) {
    const t = sessions.find((x) => x.id === activeId);
    slugEl.textContent = t && t.chat.length ? slugOf(chatName(t)) : 'new';
  }
  if (plusBtn) {
    plusBtn.disabled = sessions.length >= MAX_TABS;
    plusBtn.title = plusBtn.disabled ? 'Close a chat to open another' : 'New chat';
  }
  // The open tab in view along the strip (the page itself doesn't move), the strip's ends fading
  // when there are more than fit
  tabsNav.classList.toggle('scrolls', tabsNav.scrollWidth > tabsNav.clientWidth + 1);
  const on = tabsNav.querySelector('.tm-tab.on');
  if (on) {
    const l = on.offsetLeft;
    const r = l + on.offsetWidth;
    if (l < tabsNav.scrollLeft) tabsNav.scrollLeft = l;
    else if (r > tabsNav.scrollLeft + tabsNav.clientWidth) tabsNav.scrollLeft = r - tabsNav.clientWidth;
  }
  if (back) {
    const tab = tabsNav.querySelector(`.tm-tab[data-id="${back.id}"]`) || on;
    tab?.querySelector(back.x && tab.dataset.id === back.id ? '.tm-tabx' : '.tm-tabopen')?.focus();
  }
  drawList();
}
// The status bar for the chat that's open, unless Sig is busy (then it says so)
function showState() {
  if (busy) return;
  const last = chat[chat.length - 1];
  setState(last?.role === 'assistant' && last.state ? last.state : 'ready', last?.ms || 0);
}
// Everything around the conversation, for the chat that's open
function shown() {
  drawTabs();
  following = false;
  if (SCREEN) {
    const sub = latestSubject();
    if (sub) SCREEN.show(sub); else SCREEN.clear();
    SCREEN.checking(false);
  }
  tabs.screen?.classList.remove('new');
  closeSheet();
  tabByHand = false;
  pick?.set(whoFor(sessions.find((t) => t.id === activeId)));
  if (busy?.sid === activeId) setTab('mind');
  railSync({ choose: busy?.sid !== activeId });
  showState();
  helpPin();
  refreshStack();
  fitPlaceholder();
  updateSend();
}
function switchTo(id, { from = sessions.find((t) => t.id === activeId) } = {}) {
  const to = sessions.find((t) => t.id === id);
  if (!to || to === from) return;
  const lines = [...thread.querySelectorAll(':scope > .msg, :scope > .gate, :scope > .ai-incoming')];
  if (from) from.scroll = scrollPos();
  lines.forEach((n) => n.remove());
  if (from) from.nodes = lines;
  activeId = to.id;
  chat = to.chat;
  if (to.nodes) thread.append(...to.nodes);
  else for (const m of chat) thread.append(m.role === 'user' ? userNode(m.text) : assistantNode(m));
  to.nodes = null;
  setEmpty(!thread.querySelector(':scope > .msg, :scope > .gate'));
  shown();
  save();
  scroller().scrollTo({ top: to.scroll ?? Math.max(0, chatEnd()), behavior: 'instant' });
}
// A new chat: in a new tab, unless the one in front is still empty
function newTab() {
  const here = sessions.find((t) => t.id === activeId);
  if (here && !here.chat.length && !thread.querySelector(':scope > .gate')) { closeDrawer(false); input.focus({ preventScroll: true }); return; }
  if (sessions.length >= MAX_TABS) {
    const spare = sessions.find((t) => t.id !== activeId && busy?.sid !== t.id);
    if (!spare) return;
    closeTab(spare.id);
  }
  const t = { id: newId(), chat: [], nodes: null, at: 0 };
  sessions.push(t);
  switchTo(t.id);
  closeDrawer(false);
  input.focus({ preventScroll: true });
}
// Closing a tab keeps its chat in the list (an empty one is just closed); its answer, if Sig is
// writing one, stops
function closeTab(id) {
  const i = sessions.findIndex((t) => t.id === id);
  if (i < 0) return;
  const lone = sessions.length === 1;
  if (lone && !sessions[0].chat.length && !gone.has(id)) return;
  if (busy?.sid === id) busy.controller.abort();
  const [shut] = sessions.splice(i, 1);
  if (!sessions.length) sessions.push({ id: newId(), chat: [], nodes: null, at: 0 });
  if (shut.id === activeId) switchTo(sessions[Math.min(i, sessions.length - 1)].id, { from: null });
  else { drawTabs(); save(); }
  if (lone) input.focus({ preventScroll: true });
}
// ---------------------------------------------------------------------------
// The side panel: the chats kept on this device, newest first (open one; delete one, or all of
// them), and the site's own links. Beside the window wherever the site's bar shows its links (it
// folds away), sliding in over it where the bar would fold them into a menu (900px and under).
// ---------------------------------------------------------------------------
const drawerMq = matchMedia('(max-width: 900px)');
const listEl = $('sg-list');
const noneEl = $('sg-none');
const wipeBtn = $('sg-wipe');
const sg = $('sg');
const side = $('sg-side');
const menuBtn = $('tm-menu');
const foldBtn = $('sg-fold');
const scrim = $('sg-scrim');
const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const yearFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
function whenOf(at) {
  if (!at) return '';
  const d = new Date(at);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return timeFmt.format(d);
  return d.getFullYear() === now.getFullYear() ? dayFmt.format(d) : yearFmt.format(d);
}
// Deleting one is asked once more in its row ("Keep" is where the focus goes)
let asking = null;
const BTNS = ['sg-open', 'sg-del', 'sg-yes', 'sg-no'];
const rowBtn = (id, cls) => listEl.querySelector(`.sg-item[data-id="${id}"] .${cls}`);
function stopAsking({ focus = false } = {}) {
  const id = asking;
  if (!id) return;
  asking = null;
  drawList();
  if (focus) rowBtn(id, 'sg-del')?.focus();
}
function drawList() {
  if (!listEl) return;
  const was = document.activeElement?.closest?.('.sg-item');
  const back = was ? { id: was.dataset.id, cls: BTNS.find((c) => document.activeElement.classList.contains(c)) } : null;
  const open = new Set(sessions.map((t) => t.id));
  const items = [...list].sort((a, b) => b.at - a.at);
  if (asking && !items.some((c) => c.id === asking)) asking = null;
  listEl.replaceChildren(...items.map((c) => {
    const on = c.id === activeId;
    const cls = `sg-item${on ? ' on' : ''}${open.has(c.id) ? ' tabbed' : ''}${busy?.sid === c.id ? ' busy' : ''}`;
    if (c.id === asking) {
      const yes = h('button', { class: 'sg-yes', type: 'button', text: 'Delete', 'aria-describedby': `sg-ask-${c.id}` });
      const no = h('button', { class: 'sg-no', type: 'button', text: 'Keep', 'aria-describedby': `sg-ask-${c.id}` });
      yes.addEventListener('click', () => { asking = null; deleteChat(c.id); });
      no.addEventListener('click', () => stopAsking({ focus: true }));
      return h('li', { class: `${cls} asking`, 'data-id': c.id },
        h('p', { class: 'sg-ask', id: `sg-ask-${c.id}` }, 'Delete ', h('b', { text: c.title }), ' from this device?'), h('div', { class: 'sg-asks' }, yes, no));
    }
    const go = h('button', { class: 'sg-open', type: 'button', 'aria-current': on ? 'true' : null },
      h('i', { class: 'sg-dot', 'aria-hidden': 'true' }), h('span', { class: 'sg-name', text: c.title }), h('span', { class: 'sg-when', text: whenOf(c.at) }),
      busy?.sid === c.id ? h('span', { class: 'sr', text: ' (Sig is answering)' }) : null);
    const del = h('button', { class: 'sg-del', type: 'button', title: 'Delete chat', 'aria-label': `Delete chat: ${c.title}` }, svg(ICON.trash));
    go.addEventListener('click', () => { asking = null; openChat(c.id); closeDrawer(false); });
    del.addEventListener('click', () => { asking = c.id; drawList(); rowBtn(c.id, 'sg-no')?.focus(); });
    return h('li', { class: cls, 'data-id': c.id }, go, del);
  }));
  if (noneEl) noneEl.hidden = items.length > 0;
  if (wipeBtn) wipeBtn.disabled = !items.length;
  if (back?.cls) (rowBtn(back.id, back.cls) || rowBtn(back.id, 'sg-open'))?.focus();
}
// A chat from the list: its tab if it's open, else in the empty tab in front or a new one
function openChat(id) {
  if (sessions.some((t) => t.id === id)) { switchTo(id); return; }
  const c = list.find((x) => x.id === id);
  if (!c) return;
  const loaded = loadChat(id);
  if (!loaded.length) { gone.add(id); store.del(ONE(id), 'local'); save(); return; }
  const t = { id, chat: loaded, nodes: null, at: c.at, saved: JSON.stringify(loaded.map(bare)) };
  const i = sessions.findIndex((x) => x.id === activeId);
  if (i >= 0 && !sessions[i].chat.length && busy?.sid !== activeId && !thread.querySelector(':scope > .gate')) {
    sessions.splice(i, 0, t);
    sessions.splice(i + 1, 1);
    switchTo(id, { from: null });
    return;
  }
  if (sessions.length >= MAX_TABS) {
    const spare = sessions.find((x) => x.id !== activeId && busy?.sid !== x.id);
    if (!spare) return;
    closeTab(spare.id);
  }
  sessions.push(t);
  switchTo(id);
}
// Deleting: gone from this device (its answer stops if Sig is writing one)
function deleteChat(id) {
  const order = [...list].sort((a, b) => b.at - a.at).map((c) => c.id);
  const at = order.indexOf(id);
  const wasFocused = !!document.activeElement?.closest?.('.sg-list');
  gone.add(id);
  store.del(ONE(id), 'local');
  list = list.filter((c) => c.id !== id);
  if (sessions.some((t) => t.id === id)) closeTab(id); else save();
  if (wasFocused) {
    const next = order.filter((x) => x !== id)[Math.min(at, order.length - 2)];
    (next && listEl.querySelector(`.sg-item[data-id="${next}"] .sg-open`) || $('sg-new'))?.focus();
  }
}
function wipeAll() {
  if (busy) busy.controller.abort();
  for (const c of list) { gone.add(c.id); store.del(ONE(c.id), 'local'); }
  for (const t of sessions) { gone.add(t.id); store.del(ONE(t.id), 'local'); }
  list = [];
  put(LIST, []);
  const fresh = { id: newId(), chat: [], nodes: null, at: 0 };
  sessions.splice(0, sessions.length, fresh);
  switchTo(fresh.id, { from: null });
}
// Delete all, asked once more in place: "Keep them" is where the focus goes
wipeBtn?.addEventListener('click', () => {
  const n = list.length;
  if (!n) return;
  const row = $('sg-wipe-row');
  const q = h('p', { class: 'sg-wipe-ask', id: 'sg-wipe-ask', text: `Delete ${n === 1 ? 'your chat' : `all ${n} chats`} from this device? This can’t be undone.` });
  const yes = h('button', { class: 'sg-wipe-yes', type: 'button', text: 'Delete', 'aria-describedby': 'sg-wipe-ask' });
  const no = h('button', { class: 'sg-wipe-no', type: 'button', text: 'Keep them', 'aria-describedby': 'sg-wipe-ask' });
  const done = () => { q.remove(); yes.remove(); no.remove(); wipeBtn.hidden = false; };
  no.addEventListener('click', () => { done(); wipeBtn.focus(); });
  yes.addEventListener('click', () => { done(); wipeAll(); $('sg-new')?.focus(); });
  wipeBtn.hidden = true;
  row.append(q, yes, no);
  no.focus();
});
$('sg-new')?.addEventListener('click', () => { stopAsking(); newTab(); });
// Showing and hiding the panel
let folded = store.get('mh-sig-side', 'local') === 'folded';
function syncSide() {
  if (!sg || !side) return;
  const narrow = drawerMq.matches;
  if (!narrow) { sg.classList.remove('drawer'); if (scrim) scrim.hidden = true; }
  sg.classList.toggle('folded', !narrow && folded);
  const shown = narrow ? sg.classList.contains('drawer') : !folded;
  side.inert = !shown;
  // while the drawer is open the page behind it is out of reach
  const page = sg.querySelector('.sg-main');
  if (page) page.inert = narrow && sg.classList.contains('drawer');
  menuBtn?.setAttribute('aria-expanded', String(shown));
  foldBtn?.setAttribute('aria-expanded', String(shown));
  foldBtn?.setAttribute('aria-label', narrow ? 'Close the side panel' : 'Hide the side panel');
}
function openDrawer() {
  if (!sg) return;
  sg.classList.add('drawer');
  if (scrim) scrim.hidden = false;
  syncSide();
  $('sg-new')?.focus();
}
function closeDrawer(back = true) {
  if (!sg?.classList.contains('drawer')) return;
  stopAsking();
  sg.classList.remove('drawer');
  if (scrim) scrim.hidden = true;
  syncSide();
  if (back) menuBtn?.focus();
}
menuBtn?.addEventListener('click', () => {
  if (drawerMq.matches) { openDrawer(); return; }
  folded = false;
  store.set('mh-sig-side', 'open', 'local');
  syncSide();
  foldBtn?.focus();
});
foldBtn?.addEventListener('click', () => {
  if (drawerMq.matches) { closeDrawer(); return; }
  folded = true;
  store.set('mh-sig-side', 'folded', 'local');
  syncSide();
  menuBtn?.focus();
});
scrim?.addEventListener('click', () => closeDrawer());
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (asking && document.activeElement?.closest?.('.sg-item.asking')) { e.preventDefault(); stopAsking({ focus: true }); return; }
  if (sg?.classList.contains('drawer')) { e.preventDefault(); closeDrawer(); }
});
drawerMq.addEventListener('change', syncSide);
// Another window of Sig kept or deleted a chat: the list follows, and a chat deleted there closes
// here too (unless Sig is answering in it)
addEventListener('storage', (e) => {
  if (e.storageArea !== window.localStorage || (e.key !== LIST && e.key !== null)) return;
  const before = new Set(list.map((c) => c.id));
  list = readList().filter((c) => !gone.has(c.id));
  const now = new Set(list.map((c) => c.id));
  for (const t of [...sessions]) {
    if (before.has(t.id) && !now.has(t.id) && busy?.sid !== t.id) { gone.add(t.id); closeTab(t.id); }
  }
  drawList();
});
plusBtn?.addEventListener('click', newTab);
addEventListener('resize', () => tabsNav?.classList.toggle('scrolls', tabsNav.scrollWidth > tabsNav.clientWidth + 1));
// On a phone the tabs sit in the conversation's header, the width of the screen
const phoneMq = matchMedia('(max-width: 700px)');
function placeStrip() {
  if (!tabStrip) return;
  const bar = document.querySelector('.tm-title');
  const pane = document.querySelector('.ai-bar');
  if (phoneMq.matches) { if (pane && tabStrip.parentElement !== pane) pane.append(tabStrip); }
  else if (bar && tabStrip.parentElement !== bar) bar.insertBefore(tabStrip, bar.querySelector('.tm-online'));
  drawTabs();
}
phoneMq.addEventListener('change', placeStrip);
if (SCREEN) {
  SCREEN.mount($('sc-root'));
  SCREEN.peek($('ai-peek'));
  SCREEN.onOpen(openSheet);
  SCREEN.onClose(closeSheet);
  // Asked from the screen ("Try it"): the screen stays in front while the agents work
  SCREEN.onAsk((q) => { closeSheet(); tabByHand = true; ask(q); });
  // Something new on the screen while another tab is in front: its tab says so
  SCREEN.onChange((sub, fresh) => { if (sub && fresh && tab !== 'screen') tabs.screen?.classList.add('new'); });
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
// A shorter prompt in the box when it's narrow (on phones, and beside the screen in a smaller
// window); after an answer, an invitation to follow it up
let ruler = null;
const widthOf = (t) => {
  ruler ||= document.createElement('canvas').getContext('2d');
  if (!ruler) return t.length * 9;
  const cs = getComputedStyle(input);
  ruler.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ruler.measureText(t).width;
};
function fitPlaceholder() {
  const last = chat[chat.length - 1];
  const after = last?.role === 'assistant' && last.state === 'done';
  const hints = after ? ['Ask a follow-up, or something new', 'Ask a follow-up', 'Ask Sig']
    : ['Ask about a goal, something you take, or a mix', input.dataset.short, 'Ask about what you take', 'Ask Sig'];
  // the longest hint that fits on the prompt's one line, after the cursor
  const room = input.clientWidth;
  input.placeholder = (room && hints.find((t) => widthOf(`${t}00`) <= room)) || hints[hints.length - 1];
}
// Sig everywhere (the picker's rings are lit by who answers)
document.querySelectorAll('[data-sig]:not(.who-ring):not(.who-big)').forEach((el) => setSig(el, 'idle'));

// The chats that were open in this browser tab come back as they were: the open one on the page,
// the others when they're opened
for (const m of chat) thread.append(m.role === 'user' ? userNode(m.text) : assistantNode(m));
setEmpty(!chat.length);
save();
placeStrip();
syncSide();
screenSync();
// The window as it was: the chats in their tabs, and beside the chat what the last answer was about
syncPanels();
railSync({ choose: true });
showState();
{
  const m = teamMsg();
  if (m?.flag && m.flag !== 'none') sigs().forEach((el) => setSig(el, 'concerned'));
}
// A question or a stack sent from elsewhere starts a chat of its own; the one that was open stays
// in its tab
if (/^#(?:ask|stack)=/.test(location.hash) && (chat.length || thread.querySelector(':scope > .gate'))) newTab();
refreshStack();
stackFromLink();
// The community, live, under the four ways in: how many Signals Sig speaks for and where they come
// from (totals from the community's public snapshot), then the pairs it is filling first, as the rows
// of a list. The list stays hidden if the snapshot can't load.
const FAMILY = { Reddit: 'Reddit', YouTube: 'YouTube', 'YouTube index': 'YouTube', 'Podcast / YouTube': 'podcasts' };
getSignal().then((snap) => {
  // Each compound's Signal in Sig's words, in the answers already on the page too
  SIG = snap && snap.signals ? snap : null;
  if (SIG) {
    for (const t of sessions) for (const m of t.chat) if (m.role === 'assistant' && m.view) { m.view.drawn = null; drawParts(m); }
    const what = $('tm-what');
    const n = Object.values(SIG.signals).filter((x) => x && x.kind !== 'stack' && typeof x.score === 'number').length;
    if (what && n && !what.dataset.signals) { what.dataset.signals = '1'; what.textContent = `${fmt(n)} Signals · ${what.textContent} · live`; }
  }
  const c = snap?.community;
  const el = $('ai-pulse');
  if (!el || !c || !(c.signals > 0)) return;
  const row = (k, dd) => [h('dt', {}, k === 'Community' ? h('span', { class: 'crowd-dot', 'aria-hidden': 'true' }) : null, k), dd];
  const rows = [];
  // A compound they asked to hear about has its Signal now: said once, here
  const live = followed().filter((id) => SIG?.signals?.[id] && typeof SIG.signals[id].score === 'number');
  if (live.length) {
    rows.push(...row('Now live', h('dd', { class: 'ai-crowd' }, live.map((id, i) => [i ? ', ' : '', h('a', { href: `/library/${id}/`, text: nameFor(id) }), ` ${Number(SIG.signals[id].score).toFixed(1)}`]))));
    store.set(FOLLOW, followed().filter((id) => !live.includes(id)), 'local');
  }
  if (c.reports > 0) {
    rows.push(...row('Community', h('dd', { class: 'ai-crowd' }, h('b', { text: fmt(c.members) }), ` member${c.members === 1 ? '' : 's'} · `, h('b', { text: fmt(c.reports) }), ` first-hand report${c.reports === 1 ? '' : 's'} · `,
      h('b', { text: fmt(c.signals) }), ` Community Signal${c.signals === 1 ? '' : 's'}, with public forum data`)));
  } else {
    // Before members' reports start, the Signals are what the public forums say: said plainly
    const from = [...new Set(Object.values(snap.signals || {}).flatMap((x) => x?.source_families || []).map((f) => FAMILY[f]).filter(Boolean))];
    rows.push(...row('Community', h('dd', { class: 'ai-crowd' }, h('b', { text: fmt(c.signals) }), ` Community Signals so far, read from ${from.length ? listOf(from) : 'public forums'}. `,
      h('a', { href: `${COMMUNITY}/`, text: 'Add yours' }))));
  }
  // The first four pairs the community is filling, until each has its ten reports (three on a phone)
  const open = (Array.isArray(snap.focus) ? snap.focus : []).filter((f) => f && f.id && f.label && Number(f.reports) < Number(f.goal)).slice(0, 4);
  if (open.length) {
    rows.push(...row('Filling first', h('dd', { class: 'ai-focus' },
      ...open.map((f) => h('a', { href: draftLink([f.id], { title: `How ${cleanName(f.name, 40)} went for me: ${low(cleanName(f.label, 40))}`, body: '' }) },
        `${cleanName(f.name, 40)} for ${low(cleanName(f.label, 40))}`, h('span', { class: 'n', text: ` ${fmt(f.reports)} of ${fmt(f.goal)}` }))))));
  }
  el.replaceChildren(...rows);
  el.hidden = false;
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
fitPlaceholder();
addEventListener('resize', fitPlaceholder);
document.fonts?.ready.then(fitPlaceholder);
updateSend();

// ⌘K (Ctrl+K elsewhere), or the status bar's ⌘K: go anywhere, as on every other page (lib/cmdk.js,
// loaded the first time it's asked for)
{
  let cmdk = null;
  const cmdkOpen = (from) => {
    (cmdk ||= import('/lib/cmdk.js?v=9c92a8758f')).then((m) => (m.isOpen() ? m.close() : m.openCmdk(from))).catch(() => { location.assign('/library/'); });
  };
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); cmdkOpen(document.activeElement); }
  });
  for (const b of document.querySelectorAll('[data-cmdk]')) b.addEventListener('click', (e) => { e.preventDefault(); cmdkOpen(b); });
  if (!/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')) for (const k of document.querySelectorAll('.tm-sb-k')) k.textContent = 'Ctrl K';
}
