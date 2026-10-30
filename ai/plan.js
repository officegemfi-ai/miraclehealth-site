// The Miracle Plan: a member's plan, built from the ground up, led by the one thing to do first.
//   Start here: the first step for this week, for the pillar where they begin.
//   The building: three pillars (nutrition, sleep, exercise), their peptides and medicines resting
//   on them, the supplements that shore up the weak spot, and wellbeing and community on top.
//   Then: the rest of the steps, numbered, to tick off. A pillar that's "not sure yet" can be
//   answered in place, and Miracle AI updates the plan.
// Drawn in the chat (/ai/) and on the page a shared plan opens (/plan/). A shared plan travels in
// the part of the link after "#", which browsers never send to a server, so Miracle Health never
// receives or keeps it. A plan the member keeps lives only in this browser's storage. It can also
// be saved as an image, drawn in the browser. Nothing here uses innerHTML.

const COMMUNITY = 'https://community.miraclehealth.us';
const KEPT = 'mh-ai-plan-v1';
const PILLARS = ['nutrition', 'sleep', 'exercise'];
const PILLAR = { nutrition: 'Nutrition', sleep: 'Sleep', exercise: 'Exercise' };
const STATE = { start: 'Start here', next: 'Next', strong: 'Strong', unknown: 'Not sure yet' };
// Answering a pillar that's "not sure yet": the same questions Miracle AI asks
const ASK = {
  nutrition: { q: 'Most days, do you get about 0.7 to 1 g of protein per pound of lean body mass?', options: ['Yes', 'Not quite', 'No'] },
  sleep: { q: 'How’s your sleep most nights?', options: ['7+ hours, solid', 'Short or broken'] },
  exercise: { q: 'Do you strength train?', options: ['3+ times a week', '1 to 2 times a week', 'Not yet'] },
};
const EVIDENCE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Early human studies', preclinical: 'Animal or lab studies only', anecdotal: 'User reports only' };
const BARS = { strong: 4, moderate: 3, limited: 2, preclinical: 1, anecdotal: 0 };
const TONES = { ok: 'o', warn: 'w', none: 'n' };
const TONE_OF = { o: 'ok', w: 'warn', n: 'none' };
const STATE_CODE = { start: 'a', next: 'n', strong: 's', unknown: 'u' };
const CODE_STATE = { a: 'start', n: 'next', s: 'strong', u: 'unknown', f: 'focus' };
// Simple line drawings, 24 by 24: a fork and knife, a moon, a dumbbell
const ICONS = {
  nutrition: 'M5 3v4a2 2 0 0 0 4 0V3M7 3v18M17 21V3c-1.8 1-3 3.4-3 6.5V13h3',
  sleep: 'M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2z',
  exercise: 'M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11',
};
const NS = 'http://www.w3.org/2000/svg';
const isId = (s) => typeof s === 'string' && /^[a-z0-9]{1,40}$/.test(s);
const clip = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
// "October 30, 2026" from "2026-10-30", read as a day where they are (not midnight UTC)
const dayLabel = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : iso;
};
const local = {
  get() { try { return JSON.parse(localStorage.getItem(KEPT) || 'null'); } catch { return null; } },
  set(v) { try { localStorage.setItem(KEPT, JSON.stringify(v)); return true; } catch { return false; } },
  del() { try { localStorage.removeItem(KEPT); } catch { /* blocked */ } },
};

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
function icon(name, cls = 'picon') {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('class', cls);
  const p = document.createElementNS(NS, 'path');
  for (const [k, v] of Object.entries({ d: ICONS[name] || '', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) p.setAttribute(k, v);
  s.append(p);
  return s;
}

// ---------------------------------------------------------------------------
// The plan, tidied: exactly one pillar to start with (older plans said "focus"), a first step
// ---------------------------------------------------------------------------
export function normalize(card) {
  const given = PILLARS.map((p) => card.foundations?.find((f) => f.pillar === p) || { pillar: p, state: 'unknown', step: '' });
  let lead = given.find((f) => f.state === 'start') || given.find((f) => f.state === 'focus') || given.find((f) => f.state === 'next') || null;
  if (card.first?.pillar) lead = given.find((f) => f.pillar === card.first.pillar && ['start', 'focus', 'next'].includes(f.state)) || lead;
  const foundations = given.map((f) => ({
    pillar: f.pillar, step: clip(f.step, 90),
    state: f === lead ? 'start' : ['start', 'focus', 'next'].includes(f.state) ? 'next' : f.state === 'strong' ? 'strong' : 'unknown',
  }));
  const start = foundations.find((f) => f.state === 'start');
  return {
    ...card,
    title: clip(card.title, 60) || 'Your Miracle Plan',
    foundations,
    first: start ? { pillar: start.pillar, step: clip(card.first?.step, 80) || start.step } : null,
    peptides: card.peptides || [], supplements: card.supplements || [], wellbeing: card.wellbeing || [],
    community: card.community && isId(card.community.id) ? { id: card.community.id, name: clip(card.community.name, 60) || card.community.id } : null,
  };
}

// The steps to tick off: the first step, then each pillar that needs work, then the ones to keep
// up; a pillar that's "not sure yet" is a question rather than a step
export function steps(card) {
  const c = normalize(card);
  const rank = { start: 0, next: 1, unknown: 2, strong: 3 };
  const rest = [...c.foundations].sort((a, b) => rank[a.state] - rank[b.state] || PILLARS.indexOf(a.pillar) - PILLARS.indexOf(b.pillar));
  return [
    ...(c.first ? [{ key: 'first', pillar: c.first.pillar, state: 'first', step: c.first.step }] : []),
    ...rest.filter((f) => !(f.state === 'start' && c.first && f.step === c.first.step)).map((f) => ({ key: f.pillar, pillar: f.pillar, state: f.state, step: f.step })),
  ];
}
const todo = (card) => steps(card).filter((s) => s.state !== 'strong' && s.state !== 'unknown');

// ---------------------------------------------------------------------------
// On screen
// ---------------------------------------------------------------------------
const evidenceOf = (it) => (it.use && it.use.fits && it.use.grade) || it.grade || '';
function meter(grade) {
  if (!(grade in BARS)) return null;
  return h('span', { class: `pmeter m${BARS[grade]}`, title: EVIDENCE[grade] },
    h('i', { 'aria-hidden': 'true' }), h('i', { 'aria-hidden': 'true' }), h('i', { 'aria-hidden': 'true' }), h('i', { 'aria-hidden': 'true' }),
    h('span', { class: 'sr', text: EVIDENCE[grade] }));
}
function chip(it) {
  const name = isId(it.id) ? h('a', { class: 'pchip-name', href: `/library/${it.id}/`, text: it.name }) : h('b', { class: 'pchip-name', text: it.name });
  return h('li', { class: `pchip tone-${it.tone || 'none'}` },
    h('span', { class: 'pchip-top' }, name, meter(evidenceOf(it))),
    it.role ? h('span', { class: 'pchip-role', text: it.role }) : null,
    it.tone === 'warn' && it.tag ? h('span', { class: 'pchip-status', text: it.tag }) : null);
}
function row(kind, label, body) {
  return h('section', { class: `prow prow-${kind}`, 'aria-label': label }, h('h3', { class: 'plabel', text: label }), body);
}

// opts: { kick, share (link, image, keep), save (image only), live (build animation),
//         onAnswer(text) (answer a "not sure yet" pillar), onChange() (a step was ticked) }
export function node(raw, opts = {}) {
  const card = normalize(raw);
  const mine = !!opts.share;
  const kept = keptPlan();
  const isKept = !!kept && kept.key === keyOf(card);
  // Ticks live with the chat (and with the kept plan, when this is it)
  const done = new Set(Array.isArray(raw.done) ? raw.done : isKept ? kept.done : []);
  const tickable = mine || isKept;
  const ticked = (key, on) => {
    if (on) done.add(key); else done.delete(key);
    raw.done = [...done];
    if (keptPlan()?.key === keyOf(card)) { const k = keptPlan(); k.done = [...done]; local.set(k); }
    opts.onChange?.();
    el.querySelectorAll(`[data-step="${key}"]`).forEach((x) => { x.classList.toggle('is-done', on); const b = x.querySelector('input'); if (b) b.checked = on; });
    hero?.classList.toggle('is-done', done.has('first'));
    if (heroState) heroState.textContent = done.has('first') ? 'Done this week' : `Start here: ${PILLAR[card.first.pillar]}`;
  };
  const tick = (key, label) => {
    const box = h('input', { type: 'checkbox', class: 'ptick', 'aria-label': label });
    box.checked = done.has(key);
    box.addEventListener('change', () => ticked(key, box.checked));
    return box;
  };

  const el = h('section', { class: 'card plan', 'aria-label': `${opts.kick || 'Your Miracle Plan'}: ${card.title}` });
  el.append(h('header', { class: 'plan-head' },
    h('p', { class: 'plabel plan-kick', text: opts.kick || 'Your Miracle Plan' }),
    h('h2', { class: 'plan-title', text: card.title })));

  // Start here: the one thing to do this week
  let hero = null;
  let heroState = null;
  if (card.first) {
    heroState = h('span', { class: 'plabel phero-label', text: done.has('first') ? 'Done this week' : `Start here: ${PILLAR[card.first.pillar]}` });
    hero = h('div', { class: `plan-hero${done.has('first') ? ' is-done' : ''}`, 'data-step': 'first' },
      h('span', { class: 'phero-icon' }, icon(card.first.pillar)),
      h('div', { class: 'phero-text' }, heroState, h('p', { class: 'phero-step', text: card.first.step })),
      tickable ? h('label', { class: 'phero-done' }, tick('first', `Done: ${card.first.step}`), h('span', { text: 'Done' })) : null);
    el.append(hero);
  }

  // The building, top to bottom on screen; in reading order the foundations come first
  const base = h('ul', { class: 'plan-base', 'aria-label': 'Foundations' }, card.foundations.map((f) => h('li', { class: `pillar is-${f.state}` },
    icon(f.pillar),
    h('span', { class: 'pillar-foot' },
      h('h3', { class: 'pillar-name', text: PILLAR[f.pillar] }),
      h('span', { class: 'pillar-state' }, f.state === 'strong' ? h('span', { class: 'pcheck', 'aria-hidden': 'true' }) : null, STATE[f.state])))));
  const pwell = h('div', { class: 'prow-body' });
  if (card.wellbeing.length) pwell.append(h('ul', { class: 'pwell' }, card.wellbeing.map((w) => h('li', { text: w }))));
  if (card.community) {
    pwell.append(h('p', { class: 'pwell-community' },
      h('a', { href: `${COMMUNITY}/#/s/${card.community.id}`, target: '_blank', rel: 'noopener', text: `Compare notes with others on ${card.community.name}` }),
      h('span', { text: ' in the Miracle Health community' })));
  }
  const chips = (items, empty) => (items.length ? h('ul', { class: 'pchips' }, items.map(chip)) : h('p', { class: 'prow-empty', text: empty }));
  const rows = [
    card.wellbeing.length || card.community ? row('top', 'Wellbeing & community', pwell) : null,
    row('sup', 'Supplements', chips(card.supplements, 'None needed right now')),
    row('pep', 'Peptides & medicines', card.hidden ? h('p', { class: 'prow-empty', text: 'Kept private' }) : chips(card.peptides, 'None right now: the pillars do the work')),
  ].filter(Boolean);
  el.append(h('div', { class: 'plan-build' }, base, h('i', { class: 'plan-ground', 'aria-hidden': 'true' }), ...rows));

  // Then: the rest of the steps, numbered
  const list = steps(card).filter((s) => s.key !== 'first');
  if (list.length) {
    el.append(h('section', { class: 'plan-then', 'aria-label': 'Your steps' },
      h('h3', { class: 'plabel', text: card.first ? 'Then' : 'Your steps' }),
      h('ol', { class: `psteps${card.first ? ' after-first' : ''}`, start: card.first ? 2 : 1 }, list.map((s) => stepItem(s)))));
  }
  const graded = [...card.supplements, ...(card.hidden ? [] : card.peptides)].some((it) => evidenceOf(it) in BARS);
  if (graded) el.append(h('p', { class: 'plan-legend' }, h('span', { class: 'pmeter m3', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')), h('span', { text: 'How strong the evidence is, from the Library' })));
  el.append(h('div', { class: 'audit', hidden: true }));
  if (opts.share || opts.save) {
    const f = foot(raw, card, opts);
    el.append(f);
    // Kept or forgotten elsewhere (another plan in the chat, or the first screen)
    el.addEventListener('plan:kept', () => f.redrawKeep?.());
  }
  if (opts.live) build(el);
  return el;

  function stepItem(s) {
    const name = h('b', { class: 'pstep-pillar', text: PILLAR[s.pillar] });
    if (s.state === 'strong') {
      return h('li', { class: 'pstep is-strong', 'data-step': s.key }, h('span', { class: 'pcheck', 'aria-hidden': 'true' }),
        h('span', { class: 'pstep-text' }, name, h('span', { text: ` Keep it up${s.step ? `: ${s.step}` : '.'}` })));
    }
    if (s.state === 'unknown') {
      const ask = ASK[s.pillar];
      const li = h('li', { class: 'pstep is-unknown', 'data-step': s.key }, h('span', { class: 'pdash', 'aria-hidden': 'true' }),
        h('span', { class: 'pstep-text' }, name, h('span', { text: ' Not sure yet.' }), s.step ? h('span', { class: 'pstep-hint', text: ` ${s.step}` }) : null));
      if (opts.onAnswer && ask) {
        const qid = `${raw.id || 'plan'}-${s.pillar}-q`;
        li.append(h('div', { class: 'pask', role: 'group', 'aria-labelledby': qid },
          h('p', { class: 'pask-q', id: qid, text: ask.q }),
          h('div', { class: 'pask-opts' }, ask.options.map((o) => {
            const b = h('button', { class: 'pask-opt', type: 'button', text: o });
            b.addEventListener('click', () => opts.onAnswer(`${ask.q} ${o}. Please update my plan.`));
            return b;
          }))));
      }
      return li;
    }
    const label = `${PILLAR[s.pillar]}: ${s.step}`;
    return h('li', { class: `pstep${done.has(s.key) ? ' is-done' : ''}`, 'data-step': s.key },
      tickable ? tick(s.key, `Done: ${label}`) : h('span', { class: 'pdot', 'aria-hidden': 'true' }),
      h('span', { class: 'pstep-text' }, name, h('span', { text: ` ${s.step}` })));
  }
}

// The one moment: the ground is laid, the pillars rise, the floors settle on them. Played once,
// with the Web Animations API, so the chat redrawing around the card doesn't start it again.
function build(el) {
  if (reduceMotion() || typeof el.animate !== 'function') return;
  const ease = 'cubic-bezier(.2,.8,.2,1)';
  const run = (node, from, ms, delay) => node?.animate([from, { transform: 'none', opacity: 1 }], { duration: ms, delay, easing: ease, fill: 'backwards' });
  run(el.querySelector('.plan-ground'), { transform: 'scaleX(.15)', opacity: 0 }, 450, 0);
  el.querySelectorAll('.pillar').forEach((p, i) => run(p, { transform: 'translateY(18px) scaleY(.88)', opacity: 0 }, 520, 200 + i * 90));
  [...el.querySelectorAll('.prow')].reverse().forEach((r, i) => run(r, { transform: 'translateY(-12px)', opacity: 0 }, 420, 560 + i * 110));
  run(el.querySelector('.plan-hero'), { transform: 'translateY(8px)', opacity: 0 }, 420, 900);
}

function foot(raw, card, opts) {
  // Their own plan can leave out what they take before they share it
  const own = !!opts.share && !card.hidden && card.peptides.length > 0;
  const incl = own ? h('input', { type: 'checkbox', checked: true }) : null;
  const status = h('span', { class: 'plan-status', role: 'status', 'aria-live': 'polite' });
  const say = (t) => { status.textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { status.textContent = ''; }, 4000); };
  const pick = () => ({ ...card, hidden: card.hidden || (incl ? !incl.checked : false) });
  const actions = h('div', { class: 'plan-actions' });
  if (opts.share) {
    const share = h('button', { class: 'plan-btn primary', type: 'button', text: 'Share with family & friends' });
    share.addEventListener('click', async () => {
      try {
        const url = await link(pick());
        if (navigator.share) {
          try { await navigator.share({ title: 'My Miracle Plan', text: `${card.title}: my plan, built from the ground up with Miracle AI.`, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
        }
        await navigator.clipboard.writeText(url);
        say('Link copied. Paste it into a message.');
      } catch { say('Couldn’t make the link just now. Try saving an image instead.'); }
    });
    actions.append(share);
  }
  // Two shapes: a post or a text (4:5), or a story (9:16, clear of the app's own buttons)
  const menu = h('details', { class: 'plan-save' }, h('summary', { class: 'plan-btn', text: 'Save image' }));
  const shapes = h('div', { class: 'plan-save-menu' });
  for (const [label, shape] of [['For a post or a text', 'post'], ['For stories', 'story']]) {
    const b = h('button', { type: 'button', text: label });
    b.addEventListener('click', async () => {
      menu.open = false;
      try {
        const blob = await image(pick(), { shape });
        const a = h('a', { href: URL.createObjectURL(blob), download: shape === 'story' ? 'my-miracle-plan-story.png' : 'my-miracle-plan.png' });
        document.body.append(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
        say('Image saved.');
      } catch { say('Couldn’t draw the image just now.'); }
    });
    shapes.append(b);
  }
  menu.append(shapes);
  actions.append(menu);
  // Keep it on this device, to tick off and check in on later
  const keepBox = h('span', { class: 'plan-keep' });
  const drawKeep = () => {
    const k = keptPlan();
    if (k && k.key === keyOf(card)) {
      const forget = h('button', { class: 'plan-link', type: 'button', text: 'Forget it' });
      forget.addEventListener('click', () => { forgetPlan(); announceKept(); opts.onKeep?.(); });
      keepBox.replaceChildren(h('span', { class: 'pcheck', 'aria-hidden': 'true' }), h('span', { text: ' Kept on this device. ' }), forget);
    } else if (opts.share) {
      const keep = h('button', { class: 'plan-btn', type: 'button', text: k ? 'Keep this one instead' : 'Keep on this device' });
      keep.addEventListener('click', () => {
        if (!keepPlan(raw)) { say('This browser isn’t keeping anything for this site, so it couldn’t be kept.'); return; }
        announceKept();
        opts.onKeep?.();
      });
      keepBox.replaceChildren(keep);
    } else keepBox.replaceChildren();
  };
  drawKeep();
  actions.append(keepBox, status);
  const el = h('footer', { class: 'plan-foot' },
    incl ? h('label', { class: 'plan-incl' }, incl, h('span', { text: 'Include my peptides and medicines' })) : null,
    actions,
    h('p', { class: 'plan-note', text: opts.share
      ? 'A shared plan travels inside its link, and a kept plan stays in this browser: Miracle Health never receives either. Talk any change through with your clinician.'
      : 'Talk any change through with your own clinician.' }));
  el.redrawKeep = drawKeep;
  return el;
}
// Every plan on the page redraws its "keep" line when the kept plan changes
const announceKept = () => document.querySelectorAll('.card.plan').forEach((c) => c.dispatchEvent(new CustomEvent('plan:kept')));

// ---------------------------------------------------------------------------
// In a link, and on this device: compact, and checked field by field when read back
// ---------------------------------------------------------------------------
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}
const item = (it) => [it.id, clip(it.name, 60), clip(it.role, 50), clip(it.tag, 30), TONES[it.tone] || 'n', evidenceOf(it)];
function compact(raw) {
  const card = normalize(raw);
  return {
    v: 1, t: card.title,
    a: card.first ? clip(card.first.step, 80) : '',
    f: card.foundations.map((f) => [f.pillar[0], STATE_CODE[f.state] || 'u', clip(f.step, 90)]),
    p: card.hidden ? [] : card.peptides.slice(0, 4).map(item),
    s: card.supplements.slice(0, 4).map(item),
    w: card.wellbeing.slice(0, 3).map((w) => clip(w, 80)),
    ...(card.community ? { c: [card.community.id, clip(card.community.name, 60)] } : {}),
    ...(card.hidden ? { x: 1 } : {}),
  };
}
// Read back from a link or storage: data, never trusted
function expand(c) {
  if (!c || c.v !== 1) throw new Error('unknown plan version');
  const arr = (x, n) => (Array.isArray(x) ? x.slice(0, n) : []);
  const items = (x) => arr(x, 4).filter((r) => Array.isArray(r) && isId(r[0])).map(([id, name, role, tag, tone, grade]) => ({
    id, name: clip(name, 60) || id, role: clip(role, 50), tag: clip(tag, 30), tone: TONE_OF[tone] || 'none',
    grade: grade in BARS ? grade : null, use: null,
  }));
  const found = arr(c.f, 3).filter(Array.isArray);
  const foundations = PILLARS.map((p) => {
    const f = found.find((x) => x[0] === p[0]) || [];
    return { pillar: p, state: CODE_STATE[f[1]] || 'unknown', step: clip(f[2], 90) };
  });
  const lead = foundations.find((f) => f.state === 'start') || foundations.find((f) => f.state === 'focus');
  const community = Array.isArray(c.c) && isId(c.c[0]) ? { id: c.c[0], name: clip(c.c[1], 60) || c.c[0] } : null;
  return normalize({
    title: clip(c.t, 60) || 'A Miracle Plan',
    first: lead && clip(c.a, 80) ? { pillar: lead.pillar, step: clip(c.a, 80) } : null,
    foundations, peptides: items(c.p), supplements: items(c.s),
    wellbeing: arr(c.w, 3).map((w) => clip(w, 80)).filter(Boolean),
    community, hidden: c.x === 1,
  });
}
export async function encode(card) {
  const json = new TextEncoder().encode(JSON.stringify(compact(card)));
  if (typeof CompressionStream === 'function') {
    try { return `z${b64url(await pipe(json, new CompressionStream('deflate-raw')))}`; } catch { /* fall through */ }
  }
  return `u${b64url(json)}`;
}
export async function decode(s) {
  const raw = String(s || '').replace(/^#/, '');
  if (!/^[zu][A-Za-z0-9_-]{2,6000}$/.test(raw)) throw new Error('not a plan');
  let bytes = unb64url(raw.slice(1));
  if (raw[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  return expand(JSON.parse(new TextDecoder().decode(bytes)));
}
export async function link(card) { return `${location.origin}/plan/#${await encode(card)}`; }

// Which plan this is, whoever's device it's on (a short fingerprint of what it says)
export function keyOf(card) {
  const c = compact({ ...card, hidden: false });
  delete c.x;
  const s = JSON.stringify(c);
  let a = 5381;
  let b = 52711;
  for (let i = 0; i < s.length; i++) { const k = s.charCodeAt(i); a = (a * 33) ^ k; b = (b * 31) ^ k; }
  return `${(a >>> 0).toString(36)}${(b >>> 0).toString(36)}`;
}
// A plan kept on this device: the plan, which steps are done, and when it was kept
export function keptPlan() {
  const k = local.get();
  if (!k || k.v !== 1 || typeof k.key !== 'string') return null;
  try {
    const card = expand(k.plan);
    return { v: 1, key: keyOf(card), saved: /^\d{4}-\d{2}-\d{2}$/.test(k.saved) ? k.saved : '', card, plan: k.plan,
      done: (Array.isArray(k.done) ? k.done : []).filter((x) => x === 'first' || PILLARS.includes(x)) };
  } catch { return null; }
}
export function keepPlan(card) {
  const c = compact({ ...card, hidden: false });
  delete c.x;
  return local.set({ v: 1, key: keyOf(card), saved: today(), plan: c, done: Array.isArray(card.done) ? card.done : [] });
}
export function forgetPlan() { local.del(); }
// How far along they are, for the first screen
export function progress(card, done) {
  const list = todo(card);
  return { done: list.filter((s) => done.includes(s.key)).length, total: list.length };
}
// What to tell Miracle AI when they check in on their plan
export function checkIn(card, done) {
  const c = normalize(card);
  const all = steps(c);
  const did = all.filter((s) => done.includes(s.key)).map((s) => s.step);
  const left = all.filter((s) => !done.includes(s.key) && s.state !== 'strong' && s.state !== 'unknown').map((s) => s.step);
  const unsure = all.filter((s) => s.state === 'unknown').map((s) => PILLAR[s.pillar].toLowerCase());
  return [`I’m checking in on my Miracle Plan, “${c.title}”.`,
    did.length ? `Done so far: ${did.join('; ')}.` : 'I haven’t ticked anything off yet.',
    left.length ? `Still to do: ${left.join('; ')}.` : '',
    unsure.length ? `Not sure yet about my ${unsure.join(' and ')}.` : '',
    'What should I focus on next? Please update my plan.'].filter(Boolean).join(' ').slice(0, 1800);
}

// ---------------------------------------------------------------------------
// As an image: the same plan, drawn on a canvas in the browser, for a post (4:5) or a story (9:16)
// ---------------------------------------------------------------------------
const C = {
  bg: '#0C1413', ink: '#121E1D', text: '#FCFCFC', text2: 'rgba(252,252,252,.76)', text3: 'rgba(252,252,252,.54)',
  line: 'rgba(255,255,255,.14)', lime: '#D8FF3D', amber: '#F2C46B',
};
const F = {
  brand: '600 30px Inter, system-ui, sans-serif', label: '500 19px "IBM Plex Mono", ui-monospace, monospace',
  title: '600 56px Inter, system-ui, sans-serif', hero: '600 42px Inter, system-ui, sans-serif',
  name: '600 27px Inter, system-ui, sans-serif', pillar: '600 30px Inter, system-ui, sans-serif',
  body: '400 25px "Plus Jakarta Sans", system-ui, sans-serif', bodyB: '700 25px "Plus Jakarta Sans", system-ui, sans-serif',
  small: '400 21px "Plus Jakarta Sans", system-ui, sans-serif', pill: '600 20px "Plus Jakarta Sans", system-ui, sans-serif',
};
function lines(ctx, text, max) {
  const out = [];
  for (const para of String(text || '').split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= max || !line) line = next;
      else { out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}
function rrect(ctx, x, y, w, hgt, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hgt, r);
  ctx.arcTo(x + w, y + hgt, x, y + hgt, r);
  ctx.arcTo(x, y + hgt, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Lays the plan out from `top`; draws it too when `draw` is set. Returns where it ends. The picture
// is the plan at a glance: the first step, the building with names and evidence (the roles stay
// in the chat and the link), and each step on one line.
function paint(ctx, raw, W, top, draw) {
  const card = normalize(raw);
  const P = 72;
  const inner = W - 2 * P;
  let y = top;
  const spaced = (px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px; };
  const text = (t, x, yy, font, color, align = 'left') => {
    if (!draw) return;
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillText(t, x, yy);
  };
  const para = (t, x, yy, max, font, color, lh) => {
    ctx.font = font;
    const ls = lines(ctx, t, max);
    ls.forEach((l, i) => text(l, x, yy + lh * (i + 1) - lh * 0.27, font, color));
    return ls.length * lh;
  };
  // One line, cut with an ellipsis if it runs long
  const fit = (t, max, font) => {
    ctx.font = font;
    if (ctx.measureText(t).width <= max) return t;
    let out = t;
    while (out.length > 1 && ctx.measureText(`${out}…`).width > max) out = out.slice(0, -1);
    return `${out.replace(/[\s,;:]+$/, '')}…`;
  };
  const label = (t, x, yy, color, align = 'left') => { spaced('3px'); text(t.toUpperCase(), x, yy, F.label, color, align); spaced('0px'); };
  const drawIcon = (name, x, yy, size, color, width = 2) => {
    if (!draw) return;
    ctx.save(); ctx.translate(x, yy); ctx.scale(size / 24, size / 24);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(ICONS[name])); ctx.restore();
  };
  const bars = (grade, x, yy, color) => {
    if (!draw || !(grade in BARS)) return;
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i < BARS[grade] ? color : 'rgba(255,255,255,.18)'; rrect(ctx, x + i * 15, yy, 12, 9, 2); ctx.fill(); }
  };

  // The brand, and whose plan this is
  if (draw) { ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(P + 9, y + 20, 9, 0, Math.PI * 2); ctx.fill(); }
  text('Miracle Health', P + 30, y + 31, F.brand, C.text);
  label('My Miracle Plan', W - P, y + 29, C.lime, 'right');
  y += 84;
  y += para(card.title, P, y, inner, F.title, C.text, 64) + 26;

  // Start here
  if (card.first) {
    const pad = 30;
    ctx.font = F.hero;
    const tl = lines(ctx, card.first.step, inner - 2 * pad - 106).slice(0, 2);
    const hh = pad + 28 + tl.length * 50 + pad - 6;
    if (draw) {
      rrect(ctx, P, y, inner, hh, 22); ctx.fillStyle = C.lime; ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(P + pad + 36, y + hh / 2, 36, 0, Math.PI * 2); ctx.fill();
    }
    drawIcon(card.first.pillar, P + pad + 18, y + hh / 2 - 18, 36, C.lime, 2.2);
    label(`Start here: ${PILLAR[card.first.pillar]}`, P + pad + 98, y + pad + 14, 'rgba(18,30,29,.72)');
    tl.forEach((l, i) => text(l, P + pad + 98, y + pad + 28 + 50 * (i + 1) - 12, F.hero, C.ink));
    y += hh + 30;
  }

  // A row of the building: a label, then names (three to a line) or lines of words
  const rowOf = (name, body) => {
    label(name, P, y + 20, name === 'Wellbeing & community' ? C.lime : C.text3);
    y += 36;
    y += body(P, y, inner);
    y += 22;
    if (draw) { ctx.fillStyle = C.line; ctx.fillRect(P, y, inner, 2); }
    y += 24;
  };
  const chipsOf = (items, empty) => (x, yy, w) => {
    if (!items.length) { text(empty, x, yy + 28, F.body, C.text3); return 36; }
    const gap = 14;
    // Each chip as wide as its name (and its evidence bars), wrapping to a new line like words
    const sized = items.map((it) => {
      const graded = evidenceOf(it) in BARS;
      const warn = it.tone === 'warn' && it.tag;
      ctx.font = F.name;
      let cw = 36 + Math.min(ctx.measureText(it.name).width, w - 36 - (graded ? 76 : 0)) + (graded ? 76 : 0);
      ctx.font = F.pill;
      if (warn) cw = Math.max(cw, 36 + Math.min(ctx.measureText(it.tag).width, w - 36));
      return { it, graded, warn, cw: Math.min(cw, w), ch: warn ? 96 : 66 };
    });
    let lx = x;
    let top = yy;
    let lineH = 0;
    for (const c of sized) {
      if (lx > x && lx + c.cw > x + w) { top += lineH + gap; lx = x; lineH = 0; }
      if (draw) { rrect(ctx, lx, top, c.cw, c.ch, 14); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); }
      text(fit(c.it.name, c.cw - 36 - (c.graded ? 76 : 0), F.name), lx + 18, top + 43, F.name, C.text);
      bars(evidenceOf(c.it), lx + c.cw - 76, top + 28, C.lime);
      if (c.warn) text(fit(c.it.tag, c.cw - 36, F.pill), lx + 18, top + 78, F.pill, C.amber);
      lx += c.cw + gap;
      lineH = Math.max(lineH, c.ch);
    }
    return top + lineH - yy;
  };
  const wl = card.wellbeing.slice(0, 2);
  if (wl.length || card.community) {
    rowOf('Wellbeing & community', (x, yy, w) => {
      let used = 0;
      for (const t of wl) {
        if (draw) { ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(x + 6, yy + used + 18, 5, 0, Math.PI * 2); ctx.fill(); }
        text(fit(t, w - 26, F.body), x + 26, yy + used + 26, F.body, C.text);
        used += 38;
      }
      if (card.community) { text(fit(`Others on ${card.community.name}: the Miracle Health community`, w, F.body), x, yy + used + 26, F.body, C.text2); used += 38; }
      return used - 4;
    });
  }
  rowOf('Supplements', chipsOf(card.supplements, 'None needed right now'));
  rowOf('Peptides & medicines', card.hidden ? (x, yy) => { text('Kept private', x, yy + 28, F.body, C.text3); return 36; } : chipsOf(card.peptides, 'None right now: the pillars do the work'));
  y -= 24;
  // The beam the floors rest on
  if (draw) { ctx.fillStyle = 'rgba(255,255,255,.34)'; ctx.fillRect(P, y, inner, 4); }
  y += 20;

  // The pillars: tall, each with its drawing, name and state
  const gap = 20;
  const pw = (inner - 2 * gap) / 3;
  const ph = 214;
  card.foundations.forEach((f, i) => {
    const x = P + i * (pw + gap);
    if (draw) {
      rrect(ctx, x, y, pw, ph, 16);
      if (f.state === 'start') { ctx.fillStyle = C.lime; ctx.fill(); }
      else if (f.state === 'next') {
        ctx.fillStyle = 'rgba(216,255,61,.06)'; ctx.fill();
        ctx.save(); rrect(ctx, x, y, pw, ph, 16); ctx.clip();
        ctx.strokeStyle = 'rgba(216,255,61,.13)'; ctx.lineWidth = 5;
        for (let k = -ph; k < pw + ph; k += 22) { ctx.beginPath(); ctx.moveTo(x + k, y + ph); ctx.lineTo(x + k + ph, y); ctx.stroke(); }
        ctx.restore();
        rrect(ctx, x, y, pw, ph, 16); ctx.lineWidth = 3; ctx.strokeStyle = C.lime; ctx.stroke();
      } else if (f.state === 'strong') {
        ctx.fillStyle = 'rgba(255,255,255,.085)'; ctx.fill();
      } else {
        ctx.setLineDash([10, 9]); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke(); ctx.setLineDash([]);
      }
    }
    drawIcon(f.pillar, x + 24, y + 24, 46, f.state === 'start' ? C.ink : f.state === 'unknown' ? C.text3 : C.lime, 2);
    text(PILLAR[f.pillar], x + 24, y + ph - 70, F.pillar, f.state === 'start' ? C.ink : C.text);
    ctx.font = F.pill;
    const st = STATE[f.state];
    const sw = ctx.measureText(st).width + 30;
    if (draw) {
      rrect(ctx, x + 24, y + ph - 54, sw, 36, 18);
      if (f.state === 'start') { ctx.fillStyle = C.ink; ctx.fill(); }
      else { ctx.lineWidth = 2; ctx.strokeStyle = f.state === 'unknown' ? 'rgba(255,255,255,.4)' : C.lime; ctx.stroke(); }
    }
    text(st, x + 39, y + ph - 29, F.pill, f.state === 'start' ? C.lime : f.state === 'unknown' ? C.text2 : C.lime);
  });
  y += ph;
  // The ground they stand on
  if (draw) { ctx.fillStyle = C.lime; rrect(ctx, P - 12, y + 10, inner + 24, 14, 7); ctx.fill(); }
  y += 24 + 48;

  // Then: the rest, numbered, one line each
  const list = steps(card).filter((s) => s.key !== 'first');
  if (list.length) {
    label(card.first ? 'Then' : 'Your steps', P, y, C.text3);
    y += 20;
    list.forEach((s, i) => {
      const n = (card.first ? 2 : 1) + i;
      const lead = s.state === 'strong' ? 'Keep it up: ' : s.state === 'unknown' ? 'Not sure yet' : '';
      const body = s.state === 'unknown' ? lead : `${lead}${s.step}`;
      if (draw) {
        ctx.lineWidth = 2; ctx.strokeStyle = s.state === 'strong' ? C.lime : 'rgba(255,255,255,.4)';
        ctx.beginPath(); ctx.arc(P + 20, y + 28, 20, 0, Math.PI * 2); ctx.stroke();
      }
      text(String(n), P + 20, y + 35, F.pill, C.text, 'center');
      text(PILLAR[s.pillar], P + 62, y + 37, F.bodyB, C.text);
      const max = inner - 62 - 148;
      ctx.font = F.body;
      const all = lines(ctx, body, max);
      const two = all.length > 2 ? [all[0], fit(all.slice(1).join(' '), max, F.body)] : all;
      two.forEach((l, k) => text(l, P + 62 + 148, y + 37 + 34 * k, F.body, s.state === 'unknown' ? C.text3 : C.text2));
      y += 58 + 34 * (two.length - 1);
    });
    y += 18;
  }
  const graded = [...card.supplements, ...(card.hidden ? [] : card.peptides)].some((it) => evidenceOf(it) in BARS);
  if (graded) {
    bars('moderate', P, y + 3, C.lime);
    text('How strong the evidence is, from the Library', P + 76, y + 13, F.small, C.text3);
    y += 40;
  }
  y += 4;
  y += para('Made with Miracle AI at miraclehealth.us/ai. Education, not medical advice: talk any change through with your clinician.', P, y, inner, F.small, C.text3, 30);
  return y + 48;
}

// A post or a text (4:5, 1080 by 1350) or a story (9:16, 1080 by 1920, clear of the app's own
// bars). A plan too tall for the shape is drawn a little smaller, down to 85%, and past that the
// picture grows.
export async function image(card, { shape = 'post' } = {}) {
  try {
    await Promise.all(Object.values(F).map((f) => document.fonts.load(f)));
  } catch { /* system fonts will do */ }
  const W = 1080;
  const scratch = document.createElement('canvas').getContext('2d');
  const TOP = 64;
  const tall = Math.ceil(paint(scratch, card, W, TOP, false));
  const art = document.createElement('canvas');
  art.width = W;
  art.height = tall;
  const a = art.getContext('2d');
  a.fillStyle = C.bg;
  a.fillRect(0, 0, W, tall);
  paint(a, card, W, TOP, true);
  const SAFE = 200;
  const room = shape === 'story' ? 1920 - 2 * SAFE : 1350;
  const scale = Math.min(1, Math.max(0.85, room / tall));
  const w = Math.round(W * scale);
  const hgt = Math.round(tall * scale);
  const H = shape === 'story' ? Math.max(1920, hgt + 2 * SAFE) : Math.max(1350, hgt);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(art, Math.round((W - w) / 2), Math.round((H - hgt) / 2), w, hgt);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no image'))), 'image/png'));
}

window.MHPlan = { node, normalize, steps, encode, decode, link, image, keyOf, keptPlan, keepPlan, forgetPlan, progress, checkIn };

// ---------------------------------------------------------------------------
// The page a shared plan opens (or their own kept plan, to tick off)
// ---------------------------------------------------------------------------
const root = document.getElementById('plan-root');
if (root) {
  const show = async () => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const intro = root.querySelector('.plan-intro');
    try {
      const card = await decode(hash);
      const kept = keptPlan();
      const theirs = !!kept && kept.key === keyOf(card);
      if (theirs) document.title = 'Your Miracle Plan · Miracle Health';
      if (intro && theirs) {
        intro.querySelector('h1').textContent = 'Your Miracle Plan';
        intro.querySelector('p').textContent = `Kept on this device${kept.saved ? ` since ${dayLabel(kept.saved)}` : ''}. Tick off steps as you go; they stay in this browser. To change the plan, check in with Miracle AI.`;
      }
      const el = node(theirs ? { ...card, done: kept.done } : card, { kick: theirs ? 'Your Miracle Plan' : 'A Miracle Plan', save: true, live: true });
      root.replaceChildren(...(intro ? [intro] : []), el);
    } catch {
      root.replaceChildren(h('h1', { class: 'plan-oops', text: 'This plan couldn’t be opened' }),
        h('p', { class: 'plan-oops-p', text: 'The link may have been cut short when it was copied. Ask for it again, or build your own plan with Miracle AI.' }));
    }
  };
  window.addEventListener('hashchange', show);
  show();
}
