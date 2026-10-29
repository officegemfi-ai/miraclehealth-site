// Miracle AI's clinician review packet. It is made in the visitor's browser from their own chat:
// why they're going, what they told Miracle AI, the stack and options discussed (with the evidence
// for their goal, what studies found and where, and the lab tests the Library lists), what the
// Synergy auditor flagged and their questions, with lines they fill in by hand on paper and room
// for the clinician's notes. It can be printed or saved as a PDF, or carried to a clinician inside a
// link or QR code: the packet travels in the part of the link after "#", which browsers never send
// to a server, so Miracle Health never receives or keeps it.
// Used by the chat (/ai/) and by the page a clinician opens (/ai/packet/).

const SITE = 'https://miraclehealth.us';
const LEVEL = { avoid: 'Avoid', caution: 'Caution', unknown: 'Never studied together', info: 'Good to know' };
const FOUND = { strong: 'strong evidence', moderate: 'moderate evidence', limited: 'small human studies', preclinical: 'animal or lab studies', anecdotal: 'user reports' };
// Evidence for the use asked about, as the chat's cards say it
const USE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Early human studies', preclinical: 'Animal or lab studies only', anecdotal: 'User reports only', none: 'none in the Library yet' };
const RANK = { strong: 0, moderate: 1, limited: 2, preclinical: 3, anecdotal: 4 };
// The same words the chat uses to tell which findings are about someone's goal
const GOAL_WORDS = {
  weight: /weight|fat\b|obes|\bbmi\b|waist|appetite|metabolic|insulin|blood sugar|glucose|diabet/i,
  muscle: /muscle|strength|lean mass|power|sprint|weightlift|body composition|sarcopen/i,
  recovery: /tendon|ligament|joint|osteoarth|arthrit|injur|wound|recover|soreness|muscle damage|cartilage|bone|fractur|stiff|knee|shoulder|back pain|musculoskeletal/i,
  energy: /fatigue|energy|tired|vitality|endurance|exhaust/i,
  sleep: /sleep|insomnia|jet lag|circadian/i,
  cognition: /memory|attention|focus|cognit|mood|anxiety|stress|depress|learning|brain|bdnf|mental/i,
  skin: /skin|wrinkle|hair|elastic|hydration|acne|pigment|tan\b/i,
  sexual: /sexual|libido|erectile|desire|arousal|fertility/i,
  longevity: /aging|ageing|lifespan|mortality|longevity|heart|cardio|frailty|cognitive decline/i,
  gut: /\bgut\b|bowel|colitis|crohn|\bibs\b|intestin|stomach|digest|ulcer|liver|inflamm/i,
  immune: /immun|infection|\bcolds?\b|\bflu\b|respiratory/i,
  hormonal: /testosterone|estrogen|hormone|menopaus|thyroid|cortisol|pcos/i,
};
const LEVEL_CODE = { avoid: 'a', caution: 'c', unknown: 'u', info: 'i' };
const CODE_LEVEL = { a: 'avoid', c: 'caution', u: 'unknown', i: 'info' };
const UNAPPROVED = new Set(['not_approved', 'investigational', 'under_review', 'category2', 'restricted', 'unclear']);

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== '') el.append(k instanceof Node ? k : String(k));
  return el;
}
const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
const isId = (id) => typeof id === 'string' && /^[a-z0-9-]{1,40}$/.test(id);
const isHttps = (u) => typeof u === 'string' && /^https:\/\/[^\s"'<>]+$/.test(u);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export function dateLabel(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// What a clinician should know about a compound's status, from the Library's own labels
function cautionFrom(it) {
  const key = it.status?.key || '';
  if (it.family === 'Hormones') return key === 'supplement' ? 'A hormone sold as a supplement: levels worth testing first.' : 'A prescription hormone: only after testing, with monitoring.';
  if (key === 'investigational') return 'Not for use outside a clinical trial.';
  if (key === 'compounded') return 'Not an FDA-approved product; compounded only under a prescription.';
  if (key === 'category2') return 'On FDA’s list of substances with safety risks for compounding.';
  if (UNAPPROVED.has(key)) return 'Not an approved medicine: products sold as research chemicals vary in contents, purity and sterility.';
  return '';
}

// From a fact sheet: evidence for the goal, the findings about it first (each with its source),
// and the labs it lists. The chat's cards carry these already; the clinician's page reads them here.
function fromSheet(sheet, goal) {
  const fits = GOAL_WORDS[goal];
  const ranked = (sheet.benefits || []).map((b, i) => ({ b, i, off: fits && !fits.test(b.claim) ? 1 : 0 }))
    .sort((x, y) => x.off - y.off || (RANK[x.b.evidence] ?? 5) - (RANK[y.b.evidence] ?? 5) || x.i - y.i);
  // Findings about the goal only, when there are any; otherwise what it has been studied for
  const about = ranked.filter((x) => !x.off);
  const benefits = (about.length ? about : ranked).slice(0, 2).map(({ b }) => {
    const src = (sheet.sources || []).find((x) => x.n === b.sources?.[0]);
    return { claim: clip(b.claim, 220), evidence: String(b.evidence || ''), ...(src && isHttps(src.url) ? { source: { title: clip(src.title, 160), year: String(src.year || ''), url: src.url } } : {}) };
  });
  let use = { grade: sheet.evidence?.grade || null, fits: true };
  if (fits) {
    const ranks = (sheet.benefits || []).filter((b) => fits.test(b.claim)).map((b) => RANK[b.evidence] ?? 5);
    if (ranks.length) use = { grade: Object.keys(RANK).find((k) => RANK[k] === Math.min(...ranks)) || null, fits: true };
    else if (!(Number(sheet.goals?.[goal] || 0) >= 0.75)) use = { grade: 'none', fits: false };
  }
  const labs = [...(sheet.labs?.before || []), ...(sheet.labs?.during || [])].map((l) => clip(l, 160)).filter(Boolean).slice(0, 4);
  return { benefits, use, labs };
}

// ---------------------------------------------------------------------------
// The packet, from the chat
// ---------------------------------------------------------------------------
// {date, goal, reason, about:[[q,a]], meds:[name], stack:[item], options:[item], findings:[{level,names,note}], questions:[q]}
// item: {id, name, family, role, why, grade, use, status:{key,label}|null, tag, signal, caution, benefits, labs}
export function fromChat(chat) {
  const about = [];
  const stack = new Map();
  const options = new Map();
  const findings = new Map();
  const questions = [];
  const meds = [];
  let goal = '';
  const addFindings = (list) => {
    for (const f of list || []) {
      const names = (f.names || f.ids || []).map(String);
      const key = `${names.join('+')}|${f.note}`;
      if (f.note && !findings.has(key)) findings.set(key, { level: f.level in LEVEL ? f.level : 'info', names, note: String(f.note) });
    }
  };
  for (const m of chat || []) {
    if (m.role !== 'assistant') continue;
    for (const p of m.parts || []) {
      if (p.t !== 'card') continue;
      const c = p.card;
      if (c.type === 'intake' && c.answered) {
        c.questions.forEach((q, i) => {
          const a = c.answered[i];
          const ans = a ? [...(a.picked || []), a.text || ''].filter(Boolean).join(', ') : '';
          if (ans) about.push([q.q, ans]);
        });
      }
      if (c.type === 'shortlist') {
        if (c.goal && GOAL_WORDS[c.goal]) goal = c.goal;
        const into = c.kind === 'yours' ? stack : options;
        for (const it of c.items || []) into.set(it.id, it);
        for (const m of c.meds || []) if (m && !meds.some((x) => x.toLowerCase() === String(m).toLowerCase())) meds.push(String(m));
        if (c.audit?.findings) addFindings(c.audit.findings);
      }
      if (c.type === 'audit') addFindings(c.findings);
      if (c.type === 'questions') for (const q of c.items || []) if (!questions.includes(q)) questions.push(q);
    }
  }
  // An option that's already in their stack is listed once, with their stack
  for (const id of stack.keys()) options.delete(id);
  return { date: today(), goal, reason: '', about, meds, stack: [...stack.values()], options: [...options.values()], findings: [...findings.values()], questions };
}
export const isEmpty = (p) => !p.about.length && !p.stack.length && !p.options.length && !p.findings.length && !p.questions.length;
const medsOf = (p) => (Array.isArray(p.meds) ? p.meds : []);

// ---------------------------------------------------------------------------
// In a link: short keys, Library details looked up again by id at the other end
// ---------------------------------------------------------------------------
function compact(p) {
  return {
    v: 1, t: p.date, g: p.goal || '', r: clip(p.reason, 200),
    a: p.about.slice(0, 8).map(([q, a]) => [clip(q, 160), clip(a, 220)]),
    m: medsOf(p).slice(0, 6).map((m) => clip(m, 40)),
    y: p.stack.slice(0, 8).map((i) => [i.id, clip(i.role, 40)]),
    o: p.options.slice(0, 8).map((i) => [i.id, clip(i.role, 40), clip(i.why, 110)]),
    f: p.findings.slice(0, 10).map((f) => [LEVEL_CODE[f.level] || 'i', clip(f.names.join(' + '), 90), clip(f.note, 200)]),
    q: p.questions.slice(0, 8).map((q) => clip(q, 170)),
  };
}
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}
export async function encode(p) {
  const json = new TextEncoder().encode(JSON.stringify(compact(p)));
  if (typeof CompressionStream === 'function') {
    try { return `z${b64url(await pipe(json, new CompressionStream('deflate-raw')))}`; } catch { /* fall through */ }
  }
  return `u${b64url(json)}`;
}
// A link someone hands over is data, never trusted: every field is checked and clipped
export async function decode(s) {
  const raw = String(s || '').replace(/^#/, '');
  if (!/^[zu][A-Za-z0-9_-]{2,12000}$/.test(raw)) throw new Error('not a packet');
  let bytes = unb64url(raw.slice(1));
  if (raw[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  const c = JSON.parse(new TextDecoder().decode(bytes));
  if (!c || c.v !== 1) throw new Error('unknown packet version');
  const arr = (x, n) => (Array.isArray(x) ? x.slice(0, n) : []);
  return {
    t: /^\d{4}-\d{2}-\d{2}$/.test(c.t) ? c.t : '',
    g: GOAL_WORDS[c.g] ? c.g : '',
    r: clip(c.r, 200),
    a: arr(c.a, 8).filter(Array.isArray).map(([q, a]) => [clip(q, 160), clip(a, 220)]).filter(([q, a]) => q && a),
    m: arr(c.m, 6).map((m) => clip(m, 40)).filter(Boolean),
    y: arr(c.y, 8).filter((x) => Array.isArray(x) && isId(x[0])).map(([id, role]) => [id, clip(role, 40)]),
    o: arr(c.o, 8).filter((x) => Array.isArray(x) && isId(x[0])).map(([id, role, why]) => [id, clip(role, 40), clip(why, 110)]),
    f: arr(c.f, 10).filter(Array.isArray).map(([l, n, note]) => [CODE_LEVEL[l] ? l : 'i', clip(n, 90), clip(note, 200)]).filter((x) => x[2]),
    q: arr(c.q, 8).map((q) => clip(q, 170)).filter(Boolean),
  };
}
// Back to a full packet, with names, status and evidence from the Library's index
export function expand(c, index) {
  const byId = new Map((index?.items || []).map((it) => [it.id, it]));
  const item = ([id, role, why]) => {
    const it = byId.get(id);
    const out = {
      id, name: it?.name || id, family: it?.family || '', role: role || '', why: why || '',
      grade: it?.grade || null, use: null, status: it?.status ? { key: it.status, label: it.status_label || '' } : null,
      tag: '', signal: null, caution: '', benefits: [], labs: [],
    };
    out.caution = cautionFrom(out);
    return out;
  };
  return {
    date: c.t, goal: c.g, reason: c.r, about: c.a, meds: c.m || [], stack: c.y.map(item), options: c.o.map(item),
    findings: c.f.map(([l, n, note]) => ({ level: CODE_LEVEL[l], names: n.split(' + '), note })), questions: c.q,
  };
}
export async function link(p) { return `${location.origin}/ai/packet/#${await encode(p)}`; }

// ---------------------------------------------------------------------------
// On paper and on screen
// ---------------------------------------------------------------------------
const useLabel = (it) => {
  const g = it.use ? it.use.grade : it.grade;
  return g ? USE[g] || g : 'No Library fact sheet yet';
};
const facts = (it) => [
  `Evidence for this use: ${useLabel(it)}`,
  it.status?.label ? `US status: ${it.status.label}` : it.tag ? `US status: ${it.tag}` : '',
  it.signal && Number.isFinite(Number(it.signal.score)) ? `Community Signal ${Number(it.signal.score).toFixed(0)} (${String(it.signal.level || 'forum data').toLowerCase()}, self-reported)` : '',
].filter(Boolean).join(' · ');

// Every study finding's source, numbered once for the whole packet
function referencesOf(p) {
  const refs = [];
  for (const it of [...p.stack, ...p.options]) {
    for (const b of it.benefits || []) {
      if (!b.source?.url) continue;
      if (!refs.some((r) => r.url === b.source.url)) refs.push(b.source);
    }
  }
  return refs;
}
const refNo = (refs, b) => (b.source?.url ? refs.findIndex((r) => r.url === b.source.url) + 1 : 0);

function itemNode(it, withWhy, refs) {
  const url = `${SITE}/library/${it.id}/`;
  return h('li', { class: 'pk-item' },
    h('div', { class: 'pk-item-head' },
      isId(it.id) ? h('a', { href: url, 'data-short': `miraclehealth.us/library/${it.id}`, text: it.name }) : h('b', { text: it.name }),
      it.role ? h('span', { class: 'pk-role', text: it.role }) : null),
    h('p', { class: 'pk-facts', text: facts(it) }),
    withWhy && it.why ? h('p', { class: 'pk-why', text: `Why it’s listed: ${it.why}` }) : null,
    it.benefits?.length ? h('ul', { class: 'pk-found', 'aria-label': 'What studies found' },
      it.use && !it.use.fits ? h('li', { class: 'pk-nouse', text: 'The Library has no studies of it for this use yet. What it has been studied for:' }) : null,
      it.benefits.map((b) => {
        const n = refNo(refs, b);
        return h('li', {}, `${b.claim} `, h('small', { text: `(${FOUND[b.evidence] || b.evidence}${n ? `; ref ${n}` : ''})` }));
      })) : null,
    it.labs?.length ? h('p', { class: 'pk-labs', text: `Labs the Library lists: ${it.labs.join('; ')}` }) : null,
    it.caution ? h('p', { class: 'pk-warn', text: it.caution }) : null,
    h('p', { class: 'pk-fillin' },
      h('span', { text: '☐ Taking now   ☐ Considering' }),
      h('span', { text: 'How I take it ____________' }),
      h('span', { text: 'Since ________' }),
      h('span', { text: 'From ☐ prescription ☐ pharmacy ☐ other ________' })));
}

export function render(p, { level = 2 } = {}) {
  const H = `h${level}`;
  const S = `h${level + 1}`;
  const refs = referencesOf(p);
  const sec = (title, ...kids) => h('section', { class: 'pk-sec' }, h(S, { text: title }), ...kids);
  const art = h('article', { class: 'packet', 'aria-labelledby': 'packet-h' },
    h('header', { class: 'pk-head' },
      h('p', { class: 'pk-brand' }, 'Miracle Health', h('span', { text: ' · Miracle AI' })),
      h(H, { id: 'packet-h', text: 'Clinician review packet' }),
      p.date ? h('p', { class: 'pk-date', text: `Prepared ${dateLabel(p.date)} by the patient, with Miracle AI` }) : null,
      h('p', { class: 'pk-print-only pk-who' }, h('span', { text: 'Patient name ______________________' }), h('span', { text: 'Date of birth ____________' }))),
    h('p', { class: 'pk-reason' }, h('b', { text: 'Reason for visit: ' }), h('span', { class: 'pk-reason-text', text: p.reason || '' }), p.reason ? null : h('span', { class: 'pk-blank', 'aria-hidden': 'true' })),
    h('section', { class: 'pk-note' },
      h(S, { text: 'For the reviewing clinician' }),
      h('p', { text: 'Your patient explored the options below with Miracle AI, an education tool. It draws on the Miracle Health Library (fact sheets checked against primary sources; clinician review of the Library is still pending) and the Community Signal (outcomes people report, not proof). It gives no doses and makes no diagnosis. Nothing here is a plan until you have reviewed it against their history.' })));
  const about = [...p.about, ...(medsOf(p).length ? [['Medicines I mentioned', medsOf(p).join(', ')]] : [])];
  if (about.length) art.append(sec('About me, in my words', h('dl', { class: 'pk-about' }, about.map(([q, a]) => h('div', {}, h('dt', { text: q }), h('dd', { text: a }))))));
  if (p.stack.length || p.options.length) {
    art.append(h('p', { class: 'pk-screen-only pk-hint', text: 'On paper, each item has lines for you to fill in by hand: whether you take it now, how, since when and where it’s from. Miracle AI never sees them.' }));
  }
  if (p.stack.length) art.append(sec('What I take now, or am weighing up', h('ul', { class: 'pk-items' }, p.stack.map((it) => itemNode(it, false, refs)))));
  if (p.options.length) art.append(sec('Options I’d like to discuss', h('ul', { class: 'pk-items' }, p.options.map((it) => itemNode(it, true, refs)))));
  if (p.findings.length) {
    art.append(sec('Checked together by the Synergy auditor', h('ul', { class: 'pk-findings' }, p.findings.map((f) => h('li', {},
      h('span', { class: `pk-lvl pk-lvl-${f.level}`, text: LEVEL[f.level] || 'Note' }),
      h('span', {}, h('b', { text: f.names.join(' + ') }), `: ${f.note}`))))));
  }
  if (p.questions.length) art.append(sec('My questions for you', h('ol', { class: 'pk-qs' }, p.questions.map((q) => h('li', { text: q })))));
  art.append(h('section', { class: 'pk-review' },
    h(S, { text: 'Clinician notes (not an endorsement)' }),
    h('div', { class: 'pk-lines' }, ['Reviewed by', 'Credentials', 'Date'].map((t) => h('div', { class: 'pk-line' }, h('span', { text: t }))),
      h('div', { class: 'pk-line pk-line-wide' }, h('span', { text: 'Notes' })))));
  if (refs.length) {
    art.append(sec('References', h('ol', { class: 'pk-refs' }, refs.map((r) => h('li', {},
      `${r.title}${r.year ? ` (${r.year})` : ''}. `, h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer', text: r.url }))))));
  }
  art.append(h('footer', { class: 'pk-foot', text: 'Made in my own browser with Miracle AI (miraclehealth.us/ai). Education from the Miracle Health Library and Community Signal; no doses or diagnoses. Miracle Health doesn’t receive or keep this packet.' }));
  return art;
}

export function text(p) {
  const refs = referencesOf(p);
  const out = ['CLINICIAN REVIEW PACKET (Miracle Health · Miracle AI)', p.date ? `Prepared ${dateLabel(p.date)} by the patient, with Miracle AI` : '',
    `Reason for visit: ${p.reason || '____'}`, '',
    'For the reviewing clinician: education from the Miracle Health Library (fact sheets checked against primary sources; clinician review of the Library is still pending) and the Community Signal (self-reported); no doses or diagnoses. Nothing here is a plan until you have reviewed it.', ''];
  const items = (title, list, withWhy) => {
    if (!list.length) return;
    out.push(title);
    for (const it of list) {
      out.push(`- ${it.name}${it.role ? ` (${it.role})` : ''}: ${facts(it)}. ${SITE}/library/${it.id}/`);
      if (withWhy && it.why) out.push(`  Why it’s listed: ${it.why}`);
      for (const b of it.benefits || []) { const n = refNo(refs, b); out.push(`  Found: ${b.claim} (${FOUND[b.evidence] || b.evidence}${n ? `; ref ${n}` : ''})`); }
      if (it.labs?.length) out.push(`  Labs the Library lists: ${it.labs.join('; ')}`);
      if (it.caution) out.push(`  ${it.caution}`);
      out.push('  Taking now or considering: ____  How I take it: ____  Since: ____  From: ____');
    }
    out.push('');
  };
  if (p.about.length || medsOf(p).length) out.push('About me:', ...p.about.map(([q, a]) => `- ${q} ${a}`), ...(medsOf(p).length ? [`- Medicines I mentioned: ${medsOf(p).join(', ')}`] : []), '');
  items('What I take now, or am weighing up:', p.stack, false);
  items('Options I’d like to discuss:', p.options, true);
  if (p.findings.length) out.push('Checked together by the Synergy auditor:', ...p.findings.map((f) => `- [${LEVEL[f.level]}] ${f.names.join(' + ')}: ${f.note}`), '');
  if (p.questions.length) out.push('My questions for you:', ...p.questions.map((q, i) => `${i + 1}. ${q}`), '');
  out.push('Clinician notes (not an endorsement): reviewed by ____  credentials ____  date ____', 'Notes:', '');
  if (refs.length) out.push('References:', ...refs.map((r, i) => `${i + 1}. ${r.title}${r.year ? ` (${r.year})` : ''}. ${r.url}`), '');
  out.push('Made in my own browser with Miracle AI (miraclehealth.us/ai). Miracle Health doesn’t receive or keep this packet.');
  return out.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}

// ---------------------------------------------------------------------------
// A QR code, drawn as SVG (the generator is loaded only when someone asks for a code)
// ---------------------------------------------------------------------------
let qrLib = null;
function loadQr(src) {
  if (qrLib) return qrLib;
  qrLib = new Promise((resolve, reject) => {
    if (typeof window.qrcode === 'function') { resolve(window.qrcode); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => (typeof window.qrcode === 'function' ? resolve(window.qrcode) : reject(new Error('QR generator missing')));
    s.onerror = () => { qrLib = null; reject(new Error('QR generator failed to load')); };
    document.head.append(s);
  });
  return qrLib;
}
export async function qrSvg(data, src) {
  const qrcode = await loadQr(src);
  const qr = qrcode(0, 'L');
  qr.addData(data, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  const m = 4;
  svg.setAttribute('viewBox', `0 0 ${n + m * 2} ${n + m * 2}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'QR code that opens this packet');
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('width', String(n + m * 2));
  bg.setAttribute('height', String(n + m * 2));
  bg.setAttribute('fill', '#fff');
  const path = document.createElementNS(NS, 'path');
  let d = '';
  for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) if (qr.isDark(r, c)) d += `M${c + m},${r + m}h1v1h-1z`;
  path.setAttribute('d', d);
  path.setAttribute('fill', '#000');
  svg.append(bg, path);
  return { svg, modules: n };
}

window.MHPacket = { fromChat, isEmpty, encode, decode, expand, link, render, text, qrSvg, dateLabel };

// ---------------------------------------------------------------------------
// The page a clinician opens: /ai/packet/#<packet>
// ---------------------------------------------------------------------------
const root = document.getElementById('packet-root');
if (root) {
  const show = async () => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    root.replaceChildren(h('p', { class: 'pk-loading', text: 'Opening the packet…' }));
    try {
      const c = await decode(hash);
      let index = null;
      try { index = await (await fetch('/library/data/index.json')).json(); } catch { /* names fall back to ids */ }
      const p = expand(c, index);
      // What studies found, the evidence for the goal and the labs come from the Library's own sheets
      await Promise.all([...p.stack, ...p.options].slice(0, 16).map(async (it) => {
        try {
          Object.assign(it, fromSheet(await (await fetch(`/library/data/entries/${it.id}.json`)).json(), p.goal));
        } catch { /* no fact sheet yet */ }
      }));
      const print = h('button', { class: 'pk-btn', type: 'button', text: 'Print or save as PDF' });
      print.addEventListener('click', () => window.print());
      root.replaceChildren(
        h('p', { class: 'pk-carried', text: 'This packet was made in a patient’s own browser and is carried inside the link you opened. Miracle Health doesn’t receive or keep it.' }),
        h('div', { class: 'pk-page-actions' }, print),
        render(p, { level: 1 }));
    } catch {
      root.replaceChildren(h('h1', { text: 'This packet couldn’t be opened' }), h('p', { text: 'The link may have been cut short when it was copied. Ask for the QR code or the link again.' }));
    }
  };
  window.addEventListener('hashchange', show);
  show();
}
