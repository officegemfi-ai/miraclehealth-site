// ⌘K: go anywhere, from any page (the Sig system, design canvas page 9). Type part of a name and
// each match comes with what can be done with it: open its fact sheet, ask Sig about it, trace it in
// the body, compare it, or go to its space in the community; and every page of the site. Its data is
// one small file the library build writes (library/data/cmdk.json), fetched the first time it opens.
// lib/os.js loads this on the first ⌘K (or Ctrl+K) and on any [data-cmdk] button.
// It imports nothing, so the build can version it like the other shared scripts. Nothing it shows is
// anyone's text: names come from the Library, the markup is built with textContent.

const COMMUNITY = 'https://community.miraclehealth.us';
const GRADE = ['anecdotal', 'animal and lab', 'limited', 'moderate', 'strong'];
const b64u = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(String(text)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const askLink = (q) => `/ai/#ask=${b64u(String(q).slice(0, 1500))}`;
const fold = (x) => String(x || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat()) if (k != null && k !== false && k !== '') n.append(k instanceof Node ? k : String(k));
  return n;
}

let data = null, loading = null, ui = null, opener = null, rows = [], at = 0;

function load() {
  if (data) return Promise.resolve(data);
  if (!loading) loading = fetch('/library/data/cmdk.json', { credentials: 'omit' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d || !Array.isArray(d.c)) return null;
    data = { ...d, find: d.c.map((c) => c[5]) };
    return data;
  }).catch(() => null);
  return loading;
}

function build() {
  const input = el('input', { id: 'cmdk-q', type: 'text', autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'go', 'aria-label': 'Go anywhere: type a compound or a page', 'aria-controls': 'cmdk-list', 'aria-autocomplete': 'list', role: 'combobox', 'aria-expanded': 'true', placeholder: 'a compound, a page, or a question for sig' });
  const list = el('ul', { class: 'cmdk-list', id: 'cmdk-list', role: 'listbox', 'aria-label': 'Where to go' });
  const keys = el('p', { class: 'cmdk-keys', 'aria-hidden': 'true' }, el('span', { text: '↩ run' }), el('span', { text: '↑↓ move' }), el('span', { text: 'esc close' }));
  const box = el('div', { class: 'cmdk', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Go anywhere' },
    el('div', { class: 'cmdk-line' }, el('span', { class: 'cmdk-ps1', 'aria-hidden': 'true', text: '›' }), input), list, keys);
  const scrim = el('div', { class: 'cmdk-scrim' });
  scrim.append(box);
  document.body.append(scrim);
  scrim.addEventListener('pointerdown', (e) => { if (e.target === scrim) close(); });
  input.addEventListener('input', draw);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); run(rows[at]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
  });
  list.addEventListener('pointermove', (e) => { const li = e.target.closest('li[data-i]'); if (li) select(Number(li.dataset.i)); });
  list.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) run(rows[Number(li.dataset.i)]); });
  return { scrim, box, input, list };
}

// One row: the verb, then what it acts on, then a quiet note
function row(verb, name, note, href, extra = {}) { return { verb, name, note, href, ...extra }; }

function results(q) {
  const out = [];
  const pages = data?.pages || [];
  const t = fold(q);
  if (!t) {
    // nothing typed: the four places and the pages people open most
    for (const [href, title, hint] of pages.slice(0, 8)) out.push(row('go', title, hint, href));
    return out;
  }
  if (data) {
    const terms = q.split(/\s+/).map(fold).filter(Boolean);
    const hits = [];
    data.c.forEach((c, i) => {
      if (!terms.every((x) => data.find[i].includes(x))) return;
      const f = fold(c[1]);
      hits.push({ c, r: (f.startsWith(t) ? 0 : f.includes(t) ? 1 : 2) - (c[3] ? 0.5 : 0) });
    });
    hits.sort((a, b) => a.r - b.r || a.c[1].localeCompare(b.c[1]));
    const [best, ...rest] = hits;
    if (best) {
      const [id, name, fam, sheet, grade] = best.c;
      out.push(row('open', name, sheet ? `fact sheet · ${fam}${grade >= 0 ? ` · ${GRADE[grade]} evidence` : ''}` : `${fam} · listed, sheet coming`, `/library/${id}/`, { ev: sheet && grade >= 0 }));
      out.push(row('ask', `Sig about ${name}`, 'twelve agents', askLink(`What may ${name} do for me? What does the evidence say, and what do members report?`), { ring: true }));
      if (sheet) out.push(row('trace', `${name} in the body`, 'its places, head to toe', `/library/${id}/#body`));
      for (const [a, b, href] of data.pairs || []) {
        if (a !== id && b !== id) continue;
        const other = data.c.find((x) => x[0] === (a === id ? b : a));
        if (other) out.push(row('compare', `${name} vs ${other[1].toLowerCase()}`, 'side by side', href));
      }
      if (sheet) out.push(row('go', `s/${id}`, 'its space in the community', `${COMMUNITY}/#/s/${encodeURIComponent(id)}`));
    }
    for (const h of rest.slice(0, best ? 4 : 6)) {
      const [id, name, fam, sheet] = h.c;
      out.push(row('open', name, sheet ? `fact sheet · ${fam}` : `${fam} · listed`, `/library/${id}/`));
    }
  }
  for (const [href, title, hint] of pages) {
    if (fold(title).includes(t) || fold(hint).includes(t)) out.push(row('go', title, hint, href));
  }
  // and Sig, whatever was typed
  out.push(row('ask', `sig “${q.trim().slice(0, 80)}”`, 'ask it as a question', askLink(q.trim()), { ring: true }));
  return out.slice(0, 12);
}

function draw() {
  rows = results(ui.input.value);
  at = 0;
  ui.list.replaceChildren(...rows.map((r, i) => el('li', { id: `cmdk-${i}`, role: 'option', 'data-i': i, 'aria-selected': i === 0 ? 'true' : 'false', class: i === 0 ? 'on' : '' },
    el('span', { class: 'cmdk-verb', text: r.verb }),
    el('span', { class: 'cmdk-name' }, r.ev ? el('i', { class: 'cmdk-pip', 'aria-hidden': 'true' }) : null, r.name, r.note ? el('span', { class: 'cmdk-note', text: ` · ${r.note}` }) : null))));
  ui.input.setAttribute('aria-activedescendant', rows.length ? 'cmdk-0' : '');
}

function select(i) {
  if (!rows.length) return;
  at = (i + rows.length) % rows.length;
  for (const li of ui.list.children) {
    const on = Number(li.dataset.i) === at;
    li.classList.toggle('on', on);
    li.setAttribute('aria-selected', on ? 'true' : 'false');
  }
  ui.input.setAttribute('aria-activedescendant', `cmdk-${at}`);
  ui.list.children[at]?.scrollIntoView({ block: 'nearest' });
}
const move = (d) => select(at + d);

function run(r) {
  if (!r) return;
  close(false);
  location.assign(r.href);
}

export function openCmdk(from) {
  opener = from || document.activeElement;
  if (!ui) ui = build();
  ui.scrim.hidden = false;
  document.documentElement.classList.add('cmdk-open');
  ui.input.value = '';
  draw();
  ui.input.focus();
  load().then(() => { if (!ui.scrim.hidden) draw(); });
}

export function close(restore = true) {
  if (!ui || ui.scrim.hidden) return;
  ui.scrim.hidden = true;
  document.documentElement.classList.remove('cmdk-open');
  if (restore && opener && opener.focus) opener.focus();
}

export const isOpen = () => !!ui && !ui.scrim.hidden;
