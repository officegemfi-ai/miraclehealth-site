// My Miracle (miraclehealth.us/my): what a member keeps on this device, together. Their Miracle
// Plan with its steps, how it's going (check-ins), their saved stack, their places in the community,
// a code to move it all to their phone, and a way to forget it.
// It's all read from and written to this browser's storage. Nothing leaves it unless they choose:
// a check-in they post in the community (it opens there as a draft they change and post), a
// question they take to Miracle AI (typed in for them there, never sent by itself), or the code
// they open on their phone (it travels in the link after "#", which no server receives).
// Nothing here uses innerHTML; the design kit's pieces are its own markup.
import { chipHtml, signalHtml, sigSvg, node as fromKit, askLink, spaceLink, COMMUNITY } from '/kit/kit.js?v=aea73e9434';
import { sealSvg, levelOf } from '/library/signalviz.js';

const P = window.MHPlan;
const root = document.getElementById('my-root');
const app = document.getElementById('my-app');
const QR_SRC = root.dataset.qr;
const STACK = 'mh-ai-stack-v1';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function h(tag, attrs, ...kids) {
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
const local = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* blocked */ } },
};
const clean = (x, n) => String(x ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const isId = (id) => typeof id === 'string' && /^[a-z0-9]{1,40}$/.test(id);
const listOf = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const daysSince = (iso) => Math.max(0, Math.round((Date.parse(`${P.today()}T12:00:00`) - Date.parse(`${iso}T12:00:00`)) / 864e5));

// One file each for every compound and every Signal (nothing says which ones are theirs)
const libIndex = fetch('/library/data/index.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
const snapshot = fetch(`${COMMUNITY}/snapshot.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);

// ---------------------------------------------------------------------------
// Their saved stack (Miracle AI saves it, in the same place)
// ---------------------------------------------------------------------------
function savedStack() {
  const st = local.get(STACK);
  if (!st || st.v !== 1 || !Array.isArray(st.items)) return null;
  const items = st.items.filter((i) => i && isId(i.id)).slice(0, 8)
    .map((i) => ({ id: i.id, name: clean(i.name, 60) || i.id, status: clean(i.status, 80), grade: typeof i.grade === 'string' ? i.grade : '' }));
  if (!items.length) return null;
  return { v: 1, saved: /^\d{4}-\d{2}-\d{2}$/.test(st.saved) ? st.saved : '', items,
    meds: (Array.isArray(st.meds) ? st.meds : []).map((m) => clean(m, 40)).filter(Boolean).slice(0, 6) };
}
const stackQuestion = (st) => `I take ${listOf(st.items.map((i) => i.name))}.${st.meds.length ? ` My medicines: ${st.meds.join(', ')}.` : ''} Is that combination OK?`;
const b64 = (bytes) => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = (text) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const stackLink = (st) => `${location.origin}/ai/#stack=${b64(new TextEncoder().encode(JSON.stringify({ v: 1, i: st.items.map((i) => i.id), m: st.meds })))}`;

// ---------------------------------------------------------------------------
// Moving it all to another device: one link (and its QR code) that carries it after "#"
// ---------------------------------------------------------------------------
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
async function packAll() {
  const k = P.keptPlan();
  const st = savedStack();
  const json = JSON.stringify({ v: 1, p: k ? { s: k.saved, c: k.plan, d: k.done } : null, st: st ? { s: st.saved, i: st.items.map((i) => i.id), m: st.meds } : null, ci: P.checkIns() });
  const raw = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'function') {
    try { return `z${b64(await pipe(raw, new CompressionStream('deflate-raw')))}`; } catch { /* fall through */ }
  }
  return `u${b64(raw)}`;
}
async function unpackAll(s) {
  let bytes = unb64(s.slice(1));
  if (s[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (s[0] !== 'u') throw new Error('not a My Miracle link');
  const x = JSON.parse(new TextDecoder().decode(bytes));
  if (!x || x.v !== 1) throw new Error('not a My Miracle link');
  return x;
}
async function incoming() {
  const m = /^#m=([zu][A-Za-z0-9_-]{4,12000})$/.exec(location.hash);
  if (!m) return null;
  try { return await unpackAll(m[1]); } catch { return { broken: true }; }
}
async function keepIncoming(x) {
  if (x.p) { try { P.restorePlan({ saved: x.p.s, plan: x.p.c, done: x.p.d }); } catch { /* a plan that doesn't read stays behind */ } }
  if (x.st && Array.isArray(x.st.i)) {
    const index = await libIndex;
    const byId = new Map((index?.items || []).map((it) => [it.id, it]));
    const items = [...new Set(x.st.i)].filter((id) => isId(id) && byId.has(id)).slice(0, 8)
      .map((id) => ({ id, name: byId.get(id).name, status: byId.get(id).status_label || '', grade: byId.get(id).grade || '' }));
    if (items.length) local.set(STACK, { v: 1, saved: /^\d{4}-\d{2}-\d{2}$/.test(x.st.s) ? x.st.s : P.today(), items, meds: (Array.isArray(x.st.m) ? x.st.m : []).map((v) => clean(v, 40)).filter(Boolean).slice(0, 6) });
  }
  if (Array.isArray(x.ci)) P.mergeCheckIns(x.ci);
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------
const sec = (cls, id, title, ...kids) => h('section', { class: `my-sec ${cls}`, id, 'aria-labelledby': `${id}-h` }, h('h2', { id: `${id}-h`, text: title }), ...kids);
async function copy(text, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch { ok = false; }
  const was = btn.textContent;
  btn.textContent = ok ? 'Copied' : 'Couldn’t copy: select the link and copy it';
  setTimeout(() => { btn.textContent = was; }, 2200);
}

// How it's going: one tap saves it here; then they can say more, post it in the community or ask
// Miracle AI what's next
function checkInSection(k) {
  const card = P.normalize(k.card);
  const items = [...card.peptides, ...card.supplements];
  const days = daysSince(k.saved || P.today());
  const todays = P.checkIns().find((c) => c.d === P.today());
  let current = todays ? { ...todays } : null;
  const after = h('div', { class: 'ci-after' });
  const howBtns = Object.entries(P.HOW).map(([key, label]) => {
    const b = h('button', { type: 'button', class: `ci-how-b how-${key}`, 'aria-pressed': String(current?.how === key), text: label });
    b.addEventListener('click', () => {
      // Their peptides and medicines are theirs (a plan holds only what they take); the
      // supplements it suggests start unticked until they say they've started them
      const ids = current ? current.ids : card.peptides.map((i) => i.id);
      current = P.addCheckIn({ how: key, note: current?.note || '', ids, plan: card.title }) || { d: P.today(), how: key, note: '', ids, plan: card.title };
      howBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      drawAfter(true);
      redrawHistory();
    });
    return b;
  });
  const drawAfter = (fresh) => {
    if (!current) { after.replaceChildren(); return; }
    const draft = () => P.reportDraft(k, current);
    const post = h('a', { class: 'btn lime', href: draft().link }, 'Post it in the community');
    const nextQ = () => `It’s been about ${P.howLong(Math.max(1, days))} on my plan, and it’s going ${{ better: 'better', same: 'about the same', worse: 'worse' }[current.how]} than before I started.${current.note ? ` ${current.note}` : ''} ${P.checkIn(k.card, k.done)}`;
    const ask = h('a', { class: 'btn line', href: askLink(nextQ().slice(0, 1500), { site: '' }) }, 'Ask Miracle AI what’s next');
    const refresh = () => { P.updateCheckIn(current); post.href = draft().link; ask.href = askLink(nextQ().slice(0, 1500), { site: '' }); redrawHistory(); };
    const took = items.length ? h('div', { class: 'ci-took', role: 'group', 'aria-label': 'What you’re taking' }, items.map((i) => {
      const b = h('button', { type: 'button', class: 'ci-took-b', 'aria-pressed': String(current.ids.includes(i.id)) }, i.name);
      b.addEventListener('click', () => {
        const on = !current.ids.includes(i.id);
        current.ids = on ? [...current.ids, i.id] : current.ids.filter((x) => x !== i.id);
        b.setAttribute('aria-pressed', String(on));
        refresh();
      });
      return b;
    })) : null;
    const note = h('textarea', { class: 'ci-note', id: 'ci-note', maxlength: '600', rows: '3', placeholder: 'Side effects, what changed, anything else you’d tell someone starting out' });
    note.value = current.note || '';
    note.addEventListener('input', () => { current.note = note.value.slice(0, 600); refresh(); });
    after.replaceChildren(
      h('p', { class: 'ci-saved', role: 'status' }, fromKit(sigSvg(28, 'happy', { dark: true })), h('span', { text: `Saved on this device: ${P.HOW[current.how].toLowerCase()}, ${fresh ? 'just now' : 'today'}.` })),
      took ? h('p', { class: 'ci-label', text: 'What you’re taking now' }) : null,
      took,
      h('label', { class: 'ci-label', for: 'ci-note', text: 'Anything to add? (optional)' }),
      note,
      h('div', { class: 'ci-actions' }, post, ask),
      h('p', { class: 'ci-fine', text: 'The community post opens as a draft: change anything, and nothing is posted until you press Post there. Your report feeds the Community Signal for what you take.' }));
  };
  drawAfter(false);
  return sec('my-checkin', 'checkin', 'How’s it going?',
    h('p', { class: 'ci-why', text: `${days >= 1 ? `You started your plan ${days === 1 ? 'yesterday' : `${P.howLong(days)} ago`}, on ${P.dayLabel(k.saved)}.` : 'You started your plan today.'} Compared with before you started:` }),
    h('div', { class: 'ci-how', role: 'group', 'aria-label': 'How it’s going' }, howBtns),
    after);
}

let historyBox = null;
function redrawHistory() {
  if (!historyBox) return;
  const k = P.keptPlan();
  const list = P.checkIns().slice().reverse().slice(0, 8);
  historyBox.hidden = !list.length;
  historyBox.querySelector('ol').replaceChildren(...list.map((c) => h('li', { class: `ci-item how-${c.how}` },
    h('span', { class: 'ci-dot', 'aria-hidden': 'true' }),
    h('span', { class: 'ci-what' }, h('b', { text: P.HOW[c.how] }), h('span', { text: ` · ${P.dayLabel(c.d)}` })),
    c.note ? h('p', { class: 'ci-note-text', text: c.note }) : null,
    k ? h('a', { class: 'ci-post', href: P.reportDraft(k, c).link, text: 'Post it in the community' }) : null)));
}
function historySection() {
  historyBox = sec('my-history', 'history', 'Your check-ins', h('ol', { class: 'ci-list' }),
    h('p', { class: 'my-fine', text: 'Kept on this device. The Signal counts a check-in only once you post it in the community.' }));
  redrawHistory();
  return historyBox;
}

function planSection(k) {
  const card = { ...k.card, done: k.done };
  const el = P.node(card, {
    kick: 'Your Miracle Plan', share: true,
    // Answering a "not sure yet" pillar goes to Miracle AI, the answer typed in for them
    onAnswer: (text) => { location.href = askLink(text, { site: '' }); },
    onKeep: () => draw(),
  });
  return sec('my-plan', 'plan', 'Your plan', el);
}

function signalOf(snap, id) {
  const x = snap?.signals?.[id];
  if (!x || x.score == null) return '';
  const lvl = levelOf(x.certification);
  return signalHtml(x.score, { seal: sealSvg(lvl.key, 18), level: lvl.name });
}
function stackSection(st, index, snap) {
  const byId = new Map((index?.items || []).map((it) => [it.id, it]));
  const chips = h('ul', { class: 'my-chips' }, st.items.map((i) => {
    const it = byId.get(i.id);
    return h('li', {}, fromKit(chipHtml({ name: i.name, href: `/library/${i.id}/`, category: it?.category, grade: it?.grade || i.grade, signal: signalOf(snap, i.id), role: it?.status_label || i.status })));
  }));
  const copyBtn = h('button', { class: 'linkish', type: 'button', text: 'Copy a link to it' });
  copyBtn.addEventListener('click', () => copy(stackLink(st), copyBtn));
  const forget = h('button', { class: 'linkish', type: 'button', text: 'Forget it' });
  forget.addEventListener('click', () => { local.del(STACK); draw(); });
  return sec('my-stack', 'stack', 'Your stack', chips,
    st.meds.length ? h('p', { class: 'my-meds', text: `With your medicines: ${st.meds.join(', ')}` }) : null,
    h('div', { class: 'my-actions' }, h('a', { class: 'btn lime sm', href: askLink(stackQuestion(st), { site: '' }) }, 'Check it again with Miracle AI'), copyBtn, forget),
    h('p', { class: 'my-fine', text: `Saved on this device${st.saved ? ` on ${P.dayLabel(st.saved)}` : ''}. The evidence bars are the Library’s; the number is each one’s Community Signal.` }));
}

function communitySection(k, st, index, snap) {
  const byId = new Map((index?.items || []).map((it) => [it.id, it]));
  const card = k ? P.normalize(k.card) : null;
  const ids = [...new Set([...(card ? [...card.peptides, ...card.supplements].map((i) => i.id) : []), ...(st ? st.items.map((i) => i.id) : [])])].filter((id) => byId.has(id)).slice(0, 10);
  const mine = (st ? st.items.map((i) => i.id) : card ? card.peptides.map((i) => i.id) : []).filter(isId);
  return sec('my-community', 'community', 'Your places in the community',
    h('p', { class: 'my-lede', text: 'The spaces for what you take, where members share how it went. Every first-hand report moves its Community Signal.' }),
    ids.length ? h('ul', { class: 'my-chips' }, ids.map((id) => h('li', {}, fromKit(chipHtml({ name: byId.get(id).name, href: spaceLink(id), category: byId.get(id).category, signal: signalOf(snap, id) }))))) : null,
    h('div', { class: 'my-actions' },
      mine.length > 1 ? h('a', { class: 'btn line sm', href: `${COMMUNITY}/#/stack?c=${mine.join(',')}` }, 'Find your exact stack') : null,
      h('a', { class: 'btn line sm', href: `${COMMUNITY}/#/me` }, 'Your posts and profile')));
}

function moveSection() {
  const show = h('button', { class: 'btn line sm', type: 'button', text: 'Show the code' });
  const box = h('div', { class: 'my-qr', hidden: true });
  show.addEventListener('click', async () => {
    show.disabled = true;
    try {
      const url = `${location.origin}/my/#m=${await packAll()}`;
      const { svg } = await window.MHPacket.qrSvg(url, QR_SRC);
      svg.setAttribute('aria-label', 'QR code that opens My Miracle on another device');
      const copyBtn = h('button', { class: 'linkish', type: 'button', text: 'Copy the link instead' });
      copyBtn.addEventListener('click', () => copy(url, copyBtn));
      box.replaceChildren(h('div', { class: 'my-qr-code' }, svg), h('p', { text: 'Point your phone’s camera at it, then choose to keep them there.' }), copyBtn);
      box.hidden = false;
      show.hidden = true;
    } catch {
      show.disabled = false;
      box.replaceChildren(h('p', { text: 'The code couldn’t be made in this browser.' }));
      box.hidden = false;
    }
  });
  return sec('my-move', 'move', 'Move it to your phone',
    h('p', { class: 'my-lede', text: 'A code that carries your plan, its ticks, your stack and your check-ins to another device. It travels inside the link, so Miracle Health never receives it.' }),
    show, box);
}

function forgetSection() {
  const ask = h('button', { class: 'linkish danger', type: 'button', text: 'Forget everything on this device' });
  const row = h('div', { class: 'my-actions' }, ask);
  ask.addEventListener('click', () => {
    const yes = h('button', { class: 'btn line sm', type: 'button', text: 'Yes, forget it all' });
    const no = h('button', { class: 'linkish', type: 'button', text: 'Keep them' });
    yes.addEventListener('click', () => { P.forgetPlan(); local.del(STACK); P.forgetCheckIns(); draw(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
    no.addEventListener('click', () => row.replaceChildren(ask));
    row.replaceChildren(h('p', { class: 'my-warn', text: 'This removes your plan, stack and check-ins from this browser. Anything you posted in the community stays there.' }), yes, no);
    yes.focus();
  });
  return h('section', { class: 'my-sec my-forget', 'aria-label': 'Forget' }, row);
}

function emptyState() {
  return h('section', { class: 'my-sec my-empty', 'aria-labelledby': 'empty-h' },
    h('h2', { id: 'empty-h', text: 'Nothing kept here yet' }),
    h('p', { class: 'my-lede', text: 'When you keep a Miracle Plan or save your stack in Miracle AI, it lives here: your steps to tick off, how it’s going, your stack’s evidence and Signal, and your places in the community.' }),
    h('div', { class: 'my-actions' },
      h('a', { class: 'btn lime', href: '/ai/' }, 'Build your plan with Miracle AI'),
      h('a', { class: 'btn line', href: '/library/' }, 'Explore the Library')));
}

async function draw() {
  const inc = await incoming();
  const k = P.keptPlan();
  const st = savedStack();
  const [index, snap] = await Promise.all([libIndex, snapshot]);
  const parts = [];
  if (inc) {
    if (inc.broken) {
      parts.push(h('section', { class: 'my-sec my-incoming', role: 'status' }, h('h2', { text: 'This link couldn’t be opened' }), h('p', { text: 'It may have been cut short when it was copied. Show the code on your other device again.' })));
    } else {
      const what = [inc.p ? 'your plan' : '', inc.st?.i?.length ? `your stack (${inc.st.i.length})` : '', inc.ci?.length ? `${inc.ci.length} check-in${inc.ci.length === 1 ? '' : 's'}` : ''].filter(Boolean);
      const keep = h('button', { class: 'btn lime sm', type: 'button', text: 'Keep them on this device' });
      const no = h('button', { class: 'linkish', type: 'button', text: 'No thanks' });
      const done = () => { window.history.replaceState(null, '', location.pathname); draw(); };
      keep.addEventListener('click', async () => { await keepIncoming(inc); done(); });
      no.addEventListener('click', done);
      parts.push(h('section', { class: 'my-sec my-incoming', 'aria-labelledby': 'in-h' },
        h('h2', { id: 'in-h', text: 'From your other device' }),
        h('p', { class: 'my-lede', text: `${what.length ? `${listOf(what)[0].toUpperCase()}${listOf(what).slice(1)}` : 'Nothing'}, from the code you opened.${k || st ? ' Keeping them replaces the plan and stack on this device; check-ins are added.' : ''}` }),
        h('div', { class: 'my-actions' }, keep, no)));
    }
  }
  if (k) parts.push(checkInSection(k), planSection(k), historySection());
  if (st) parts.push(stackSection(st, index, snap));
  if (k || st) parts.push(communitySection(k, st, index, snap), moveSection(), forgetSection());
  else if (!inc || inc.broken) parts.push(emptyState());
  app.replaceChildren(...parts);
  if (location.hash === '#checkin') document.getElementById('checkin')?.scrollIntoView({ block: 'start' });
}

if (P && app) draw();
else if (app) app.replaceChildren(h('p', { class: 'my-loading', text: 'My Miracle couldn’t start in this browser.' }));
