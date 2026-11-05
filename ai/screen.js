// The screen beside Ask Sig (miraclehealth.us/ai): what Sig is talking about, drawn. For the
// compounds in the conversation it shows, top to bottom:
//   1. what the community reports: the exact combination's own Signal (members' first-hand
//      reports of that stack) or plainly that nobody has reported it yet, then each compound's;
//   2. how each one works in the body, written like code: where it acts, what changes, which
//      blood markers may move, each line with its source on the fact sheet (library/data/body.json,
//      written from the sheets); then where they meet;
//   3. the blood markers that may move, compound by compound, from each fact sheet's lab list;
//   4. what Sig's Synergy auditor found when it checked them together.
// The chat (ai/ai.js) tells the screen what's being discussed. Nothing here is written by the AI
// except the auditor's notes, which the Safety agent has cleared; they're placed as text, never
// markup. On a phone the screen is a tab beside the chat. window.MHScreen is the whole interface.
import { COMMUNITY, draftLink, signalHtml, meterHtml, catColor, node as fromKit } from '/kit/kit.js?v=f08d778478';
import { sealSvg } from '/library/signalviz.js?v=d8ffb3d8c3';

const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const FAM = { Peptides: 'Peptide', Hormones: 'Hormone', Supplements: 'Supplement', Medications: 'Medication', Blends: 'Blend' };
const OP = {
  is: ['─▶', 'is'], up: ['─▲', 'raises'], block: ['─┤', 'blocks'], watch: ['─◆', 'check'], warn: ['─!', 'caution'],
};
const DIR = { up: ['▲', 'may rise'], watch: ['◆', 'worth checking'] };
const LEVEL = { avoid: 'Avoid together', caution: 'Caution', info: 'Good to know' };
const RANK = { avoid: 3, caution: 2, info: 1 };
// The example on the empty screen: it asks Sig, like any question
const EXAMPLE = { ids: ['somatropin', 'enclomiphene'], label: 'HGH + enclomiphene', ask: 'What do HGH and enclomiphene do together, according to the community and the studies?' };

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== '') n.append(k instanceof Node ? k : String(k));
  return n;
}
const clean = (s, max = 200) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
const listOf = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const lower = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
const pad = (n) => String(n).padStart(2, '0');
const colored = (el, c) => { el.style.setProperty('--c', c); return el; };
const okId = (id) => typeof id === 'string' && /^[a-z0-9]{1,40}$/.test(id);

// ---------------------------------------------------------------------------
// What it draws from: the Library's index (names, status, labs), the body pathways and the
// community's public totals. Each loads once; the screen draws with whatever has arrived.
// ---------------------------------------------------------------------------
const S = { lib: new Map(), body: { markers: {}, compounds: {} }, snap: null, subject: null, checking: false, onAsk: null, root: null, seen: '', marker: '' };
const json = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const ready = Promise.all([
  json('/library/data/index.json').then((ix) => { for (const it of ix?.items || []) if (okId(it.id)) S.lib.set(it.id, it); }),
  json('/library/data/body.json').then((b) => { if (b?.compounds) S.body = b; }),
  json(`${COMMUNITY}/snapshot.json`).then((s) => { S.snap = s && typeof s === 'object' ? s : null; }),
]).then(() => draw(false));

const item = (id) => S.lib.get(id) || { id, name: id, family: '', category: '' };
const nameOf = (id) => clean(item(id).name, 60) || id;
const colorOf = (id) => catColor(item(id).category);
const sigOf = (id) => S.snap?.signals?.[id] || null;
// A stack's own Signal: the community names a stack after its parts, joined with " + " in
// alphabetical order; any order is tried, so nothing depends on how a database sorts names
function stackSig(ids) {
  const sigs = S.snap?.signals;
  if (!sigs || ids.length < 2 || ids.length > 5) return null;
  const want = new Set();
  const names = ids.map((id) => item(id).name);
  const perm = (xs, pre = []) => (xs.length ? xs.forEach((x, i) => perm([...xs.slice(0, i), ...xs.slice(i + 1)], [...pre, x])) : want.add(pre.join(' + ').toLowerCase()));
  perm(names);
  return Object.values(sigs).find((s) => s && s.kind === 'stack' && want.has(String(s.name || '').toLowerCase())) || null;
}

// ---------------------------------------------------------------------------
// The pathway, written like code
// ---------------------------------------------------------------------------
// One compound's lines: from body.json, or (for a compound not drawn yet) its sheet's summary
function linesOf(id) {
  const b = S.body.compounds?.[id];
  if (b?.lines?.length) return b.lines;
  const it = item(id);
  return [{ at: 'what it is', op: 'is', say: clean(it.summary, 220) || 'No fact sheet yet.', src: [] }];
}
function code(ids) {
  const rows = [];
  ids.forEach((id, k) => {
    const b = S.body.compounds?.[id];
    if (k) rows.push({ t: 'gap' });
    rows.push({ t: 'head', id, route: b?.route || '' });
    const lines = linesOf(id);
    lines.forEach((ln, j) => rows.push({ t: 'line', id, last: j === lines.length - 1, ln }));
  });
  // Where they meet: a place in the body both act on, and markers on both lists
  if (ids.length > 1) {
    const at = new Map();
    for (const id of ids) for (const ln of S.body.compounds?.[id]?.lines || []) {
      const list = at.get(ln.at) || [];
      if (!list.some((x) => x.id === id)) list.push({ id, say: ln.say });
      at.set(ln.at, list);
    }
    const shared = [...at].filter(([, xs]) => xs.length > 1);
    const drawn = ids.filter((id) => S.body.compounds?.[id]);
    rows.push({ t: 'gap' });
    if (drawn.length === ids.length) {
      for (const [place, xs] of shared) rows.push({ t: 'meet', place, xs });
      if (!shared.length) rows.push({ t: 'meet', place: '', note: 'no place in the body on both of their fact sheets' });
      const dirs = drawn.map((id) => new Set(Object.keys(S.body.compounds[id].dirs || {})));
      const both = [...dirs[0]].filter((m) => dirs.every((d) => d.has(m)));
      rows.push({ t: 'meet', place: 'blood markers', note: both.length ? `on both lists: ${both.map((m) => S.body.markers?.[m]?.name || m).join(', ')}` : 'none on both lists' });
    } else rows.push({ t: 'meet', place: '', note: 'not drawn yet for every compound here: where they meet comes as each is added' });
  }
  return rows;
}
function codeNode(ids, animate) {
  const box = h('div', { class: `sc-code${animate ? ' typing' : ''}`, role: 'list', 'aria-label': `How ${listOf(ids.map(nameOf))} work in the body` });
  let n = 0;
  for (const r of code(ids)) {
    n += 1;
    const ln = h('span', { class: 'ln', 'aria-hidden': 'true', text: pad(n) });
    let row;
    if (r.t === 'gap') row = h('div', { class: 'cl gap', 'aria-hidden': 'true' }, ln);
    else if (r.t === 'head') {
      const it = item(r.id);
      row = colored(h('div', { class: 'cl head', role: 'listitem' }, ln, h('span', { class: 'cx' },
        h('b', { class: 'tk-name', text: lower(nameOf(r.id)) }),
        r.route ? h('span', { class: 'tk-route', text: ` · ${r.route}` }) : null,
        it.sheet ? h('a', { class: 'tk-cmt', href: `/library/${r.id}/`, text: ' // fact sheet' }) : h('span', { class: 'tk-cmt', text: ' // no fact sheet yet' }))), colorOf(r.id));
    } else if (r.t === 'line') {
      const [glyph, verb] = OP[r.ln.op] || OP.is;
      const markers = (r.ln.markers || []).filter((m) => S.body.markers?.[m]);
      const dirs = S.body.compounds?.[r.id]?.dirs || {};
      row = colored(h('div', { class: `cl op-${r.ln.op in OP ? r.ln.op : 'is'}`, role: 'listitem', 'data-mk': markers.join(' ') }, ln, h('span', { class: 'cx' },
        h('span', { class: 'tk-tree', 'aria-hidden': 'true', text: `${r.last ? '└' : '├'}${glyph} ` }),
        h('span', { class: 'sr', text: `${verb}: ` }),
        h('span', { class: 'tk-at', text: r.ln.at }), ' ',
        h('span', { class: 'tk-say', text: r.ln.say }),
        ...markers.map((m) => [' ', h('button', { class: `tk-mk d-${dirs[m] || 'watch'}`, type: 'button', 'data-mk': m, 'aria-label': `${S.body.markers[m].name}: ${(DIR[dirs[m]] || DIR.watch)[1]}. Show what it is` },
          `${S.body.markers[m].name} ${(DIR[dirs[m]] || DIR.watch)[0]}`)]),
        (r.ln.src || []).length ? [' ', h('a', { class: 'tk-cmt', href: `/library/${r.id}/#src-${r.ln.src[0]}`, 'aria-label': `Source${r.ln.src.length > 1 ? 's' : ''} ${r.ln.src.join(', ')} on the fact sheet`, text: `// [${r.ln.src.join(', ')}]` })] : null)), colorOf(r.id));
    } else {
      // Where they meet
      row = h('div', { class: 'cl meet', role: 'listitem' }, ln, h('span', { class: 'cx' },
        h('span', { class: 'tk-tree', 'aria-hidden': 'true', text: '∩ ' }),
        h('span', { class: 'sr', text: 'Where they meet: ' }),
        r.place ? h('span', { class: 'tk-at', text: r.place }) : null, r.place ? ' ' : null,
        r.xs ? r.xs.map((x, i) => [i ? h('span', { class: 'tk-sep', text: ' · ' }) : null, colored(h('span', { class: 'tk-who', text: lower(nameOf(x.id)) }), colorOf(x.id)), h('span', { class: 'tk-say', text: ` ${x.say}` })])
          : h('span', { class: 'tk-say', text: r.note })));
    }
    if (animate) row.style.setProperty('--i', String(n));
    box.append(row);
  }
  if (animate) box.append(h('span', { class: 'sc-caret', 'aria-hidden': 'true' }));
  return box;
}

// ---------------------------------------------------------------------------
// Blood markers that may move, compound by compound
// ---------------------------------------------------------------------------
function markersNode(ids) {
  const sec = h('section', { class: 'sc-sec sc-mk', 'aria-labelledby': 'sc-mk-h' }, h('h3', { id: 'sc-mk-h', text: 'Blood markers that may move' }));
  const def = h('p', { class: 'mk-def', 'aria-live': 'polite' });
  const groups = [];
  for (const id of ids) {
    const it = item(id);
    const b = S.body.compounds?.[id];
    let chips;
    if (b?.dirs && Object.keys(b.dirs).length) {
      chips = Object.entries(b.dirs).filter(([m]) => S.body.markers?.[m]).map(([m, d]) => h('li', {}, h('button', {
        class: `mk d-${d}`, type: 'button', 'data-mk': m, 'aria-pressed': 'false',
      }, h('span', { class: 'mk-dir', 'aria-hidden': 'true', text: (DIR[d] || DIR.watch)[0] }), S.body.markers[m].name, h('span', { class: 'sr', text: `, ${(DIR[d] || DIR.watch)[1]}` }))));
    } else {
      // Not drawn yet: its fact sheet's lab list as it stands
      const labs = [...new Set([...(it.labs?.before || []), ...(it.labs?.during || [])].map((x) => clean(x, 80)).filter(Boolean))].slice(0, 8);
      chips = labs.map((x) => h('li', {}, h('span', { class: 'mk plain', text: x })));
    }
    groups.push(colored(h('div', { class: 'mk-group' },
      h('p', { class: 'mk-who' }, h('i', { 'aria-hidden': 'true' }), nameOf(id), h('span', { text: chips.length ? ' · its fact sheet lists these to check' : ' · no lab list on its fact sheet yet' })),
      chips.length ? h('ul', { class: 'mk-list' }, chips) : null), colorOf(id)));
  }
  sec.append(...groups, def, h('p', { class: 'mk-note', text: '▲ may rise · ◆ worth checking. Your clinician decides what to test, and when.' }));
  // A marker tapped: what it is, and the lines that move it light up
  sec.addEventListener('click', (e) => { const b = e.target.closest('button[data-mk]'); if (b) pickMarker(b.dataset.mk); });
  return sec;
}
function pickMarker(m) {
  S.marker = S.marker === m ? '' : m;
  const root = S.root;
  if (!root) return;
  root.querySelectorAll('button[data-mk]').forEach((b) => {
    const on = b.dataset.mk === S.marker;
    b.classList.toggle('on', on);
    if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on));
  });
  root.querySelectorAll('.cl[data-mk]').forEach((l) => l.classList.toggle('lit', !!S.marker && l.dataset.mk.split(' ').includes(S.marker)));
  root.querySelector('.sc-code')?.classList.toggle('has-lit', !!S.marker);
  const def = root.querySelector('.mk-def');
  if (!def) return;
  const mk = S.body.markers?.[S.marker];
  if (!mk) { def.replaceChildren(); def.hidden = true; return; }
  const who = (S.subject?.ids || []).filter((id) => S.body.compounds?.[id]?.dirs?.[S.marker]);
  def.hidden = false;
  def.replaceChildren(h('b', { text: mk.name }), ` ${mk.what} `,
    who.length ? h('span', { class: 'mk-from', text: who.map((id) => `${(DIR[S.body.compounds[id].dirs[S.marker]] || DIR.watch)[1]} with ${nameOf(id)}`).join('; ') + '.' }) : null);
}

// ---------------------------------------------------------------------------
// What the community reports: the exact combination first, then each compound
// ---------------------------------------------------------------------------
function seal(sig) {
  const lvl = sig.certification || 'forum';
  return fromKit(signalHtml(sig.score, { seal: sealSvg(lvl, 18), level: sig.summary_label || '' }));
}
const FROM = (sig) => (Number(sig.first_hand) > 0 ? `${plural(Number(sig.first_hand), 'first-hand report')} from members, with public forum data` : 'from the public forums so far');
function communityNode(ids) {
  const sec = h('section', { class: 'sc-sec sc-cm', 'aria-labelledby': 'sc-cm-h' }, h('h3', { id: 'sc-cm-h', text: 'What the community reports' }));
  if (!S.snap) {
    sec.append(h('p', { class: 'cm-none', text: 'The community’s numbers couldn’t be loaded just now.' }));
    return sec;
  }
  if (ids.length > 1) {
    const st = stackSig(ids);
    const names = ids.map(nameOf);
    sec.append(st
      ? h('div', { class: 'cm-combo' }, seal(st), h('div', {}, h('b', { text: 'This exact combination' }),
        h('span', { text: ` · ${st.summary_label || ''} · ${FROM(st)}` }),
        (st.themes || []).length ? h('p', { class: 'cm-themes', text: `What members describe most: ${st.themes.slice(0, 3).map((t) => `${lower(t.theme)} (${String(t.label || '').toLowerCase()})`).join(', ')}.` }) : null))
      : h('div', { class: 'cm-combo none' }, h('span', { class: 'cm-ring', 'aria-hidden': 'true' }),
        h('div', {}, h('b', { text: 'Together: no first-hand reports yet' }),
          h('p', { text: 'Nobody has reported taking these together, so the community has nothing on the pair itself yet. Each one on its own:' }),
          h('a', { class: 'cm-first', href: draftLink(ids, { title: `How ${listOf(names)} went for me`, body: '' }), target: '_blank', rel: 'noopener', text: 'Taken them together? Add the first report' }))));
  }
  const ul = h('ul', { class: 'cm-each' });
  for (const id of ids) {
    const sig = sigOf(id);
    const themes = (sig?.themes || []).slice(0, 4);
    ul.append(colored(h('li', {}, h('i', { 'aria-hidden': 'true' }),
      h('div', { class: 'cm-row' }, h('b', { text: nameOf(id) }), sig ? seal(sig) : null),
      sig ? h('p', { class: 'cm-what' }, `${sig.summary_label || ''}, ${FROM(sig)}.`, themes.length ? ` People describe: ${themes.map((t) => `${lower(t.theme)} (${String(t.label || '').toLowerCase()})`).join(', ')}.` : '')
        : h('p', { class: 'cm-what', text: 'No Community Signal yet: no member reports, and the public forums haven’t been read for it.' })), colorOf(id)));
  }
  sec.append(ul, h('p', { class: 'sc-small', text: 'What people report is experience, not evidence, and never a reason to take something.' }));
  return sec;
}

// ---------------------------------------------------------------------------
// What Sig's Synergy auditor found
// ---------------------------------------------------------------------------
function checkNode(sub) {
  const sec = h('section', { class: 'sc-sec sc-ck', 'aria-labelledby': 'sc-ck-h' }, h('h3', { id: 'sc-ck-h', text: sub.ids.length > 1 ? 'Checked together' : 'Checked for you' }));
  const findings = (sub.findings || []).filter((f) => f && LEVEL[f.level] && f.note).sort((a, b) => RANK[b.level] - RANK[a.level]);
  if (S.checking && sub.ok == null) sec.append(h('p', { class: 'ck-busy', text: 'Sig’s Synergy auditor is checking them now…' }));
  else if (sub.ok === false) sec.append(h('p', { class: 'ck-none', text: 'The Synergy auditor couldn’t check these just now.' }));
  else if (sub.ok && findings.length) {
    sec.append(h('ul', { class: 'ck-list' }, findings.map((f) => h('li', { class: `lvl-${f.level}` },
      h('span', { class: `ck-pill lvl-${f.level}`, text: LEVEL[f.level] }),
      h('span', {}, h('b', { text: (f.names?.length ? f.names : (f.ids || []).map(nameOf)).join(' + ') }), h('span', { text: ` ${clean(f.note, 240)}` }))))));
  } else if (sub.ok) sec.append(h('p', { class: 'ck-none', text: 'No known clash in the data. That’s an absence of data, not a green light.' }));
  else if (sub.asked) sec.append(h('p', { class: 'ck-none', text: 'Sig asked you a few questions first. The check comes with its answer, with your medicines and conditions in it.' }));
  else sec.append(h('p', { class: 'ck-none', text: 'Not checked together yet. Ask Sig about taking them together, and its Synergy auditor checks them with your medicines and conditions.' }));
  return sec;
}

// ---------------------------------------------------------------------------
// The whole screen
// ---------------------------------------------------------------------------
function emptyNode() {
  const go = h('button', { class: 'sc-example', type: 'button' }, h('span', { text: `Try it: ${EXAMPLE.label}` }));
  go.addEventListener('click', () => {
    show({ ids: EXAMPLE.ids, ok: null, findings: [], asking: true });
    S.onAsk?.(EXAMPLE.ask);
  });
  const ghost = h('div', { class: 'sc-ghost', 'aria-hidden': 'true' },
    ...['somatropin (HGH) · injection', '├─▲ liver IGF-1 rises', '├─▲ blood sugar can rise', 'enclomiphene · pill', '├─┤ hypothalamus blocks estrogen’s feedback', '└─▲ testes testosterone rises']
      .map((t, i) => h('div', { class: 'cl' }, h('span', { class: 'ln', text: pad(i + 1) }), h('span', { class: 'cx', text: t }))));
  return h('div', { class: 'sc-empty' },
    h('p', { class: 'sc-label' }, h('span', { class: 'sc-dot', 'aria-hidden': 'true' }), 'The screen'),
    h('h2', { class: 'sc-title', text: 'See what Sig is talking about' }),
    h('p', { class: 'sc-lede', text: 'Ask about a compound or a combination. The screen shows how each one works in the body, which blood markers may move, and what the community reports.' }),
    ghost, go);
}
function draw(fresh) {
  const root = S.root;
  if (!root) return;
  const sub = S.subject;
  if (!sub || !sub.ids?.length) {
    root.replaceChildren(emptyNode());
    root.classList.add('is-empty');
    return;
  }
  root.classList.remove('is-empty');
  const ids = sub.ids;
  const key = ids.join('+');
  const animate = fresh && key !== S.seen && !motionOff();
  if (fresh) S.seen = key;
  const tags = h('ul', { class: 'sc-tags' }, ids.map((id) => {
    const it = item(id);
    return colored(h('li', {}, h('i', { 'aria-hidden': 'true' }),
      h('div', {}, h('b', { text: nameOf(id) }), h('span', { text: `${FAM[it.family] || 'Compound'}${it.status_label ? ` · ${clean(it.status_label, 90)}` : ''}` })),
      it.grade ? fromKit(meterHtml(it.grade)) : null), colorOf(id));
  }));
  root.replaceChildren(
    h('div', { class: 'sc-top' },
      h('p', { class: 'sc-label' }, h('span', { class: `sc-dot${S.checking ? ' busy' : ''}`, 'aria-hidden': 'true' }), sub.asking || S.checking ? 'On the screen · Sig is working' : 'On the screen'),
      h('h2', { class: 'sc-title', id: 'sc-title', text: ids.map(nameOf).join(' + ') }), tags),
    h('section', { class: 'sc-sec sc-body', 'aria-labelledby': 'sc-body-h' }, h('h3', { id: 'sc-body-h', text: ids.length > 1 ? 'How they work in the body' : 'How it works in the body' }), codeNode(ids, animate)),
    markersNode(ids),
    communityNode(ids),
    checkNode(sub),
    h('p', { class: 'sc-fine', text: 'From the Library’s fact sheets, each line with its source, and the community’s public totals. Education, not medical advice: no doses, and your clinician has the final say.' }));
  if (S.marker && !ids.some((id) => S.body.compounds?.[id]?.dirs?.[S.marker])) S.marker = '';
  if (S.marker) { const m = S.marker; S.marker = ''; pickMarker(m); }
  root.querySelector('.mk-def')?.toggleAttribute('hidden', !S.marker);
  // A code line's marker: the same as tapping it in the list
  root.querySelector('.sc-code')?.addEventListener('click', (e) => { const b = e.target.closest('button[data-mk]'); if (b) pickMarker(b.dataset.mk); });
}

// What the chat is about: shown at once; the same subject again only refreshes what's known
function show(sub) {
  const ids = [...new Set((sub?.ids || []).filter(okId))].slice(0, 6);
  if (!ids.length) return;
  const prev = S.subject;
  const same = prev && prev.ids.join('+') === ids.join('+');
  S.subject = {
    ids, findings: Array.isArray(sub.findings) ? sub.findings : [], ok: sub.ok === true ? true : sub.ok === false ? false : null,
    meds: sub.meds || [], asked: !!sub.asked, asking: !!sub.asking, at: Number.isFinite(sub.at) ? sub.at : -1,
  };
  draw(!same);
  for (const fn of listeners) fn(S.subject, !same);
}
const listeners = new Set();
window.MHScreen = {
  mount(root) { S.root = root; draw(false); },
  show,
  clear() { S.subject = null; S.seen = ''; S.marker = ''; S.checking = false; draw(false); for (const fn of listeners) fn(null, true); },
  checking(on) { if (S.checking === !!on) return; S.checking = !!on; if (S.subject) draw(false); },
  onAsk(fn) { S.onAsk = fn; },
  onChange(fn) { listeners.add(fn); },
  subject: () => S.subject,
  title: () => (S.subject ? S.subject.ids.map(nameOf).join(' + ') : ''),
  ready,
};
