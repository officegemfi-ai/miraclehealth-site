// Beside the chat on Ask Sig (miraclehealth.us/sig): the blood tests that what Sig is talking about
// may move, as a rack of test tubes. Each tube says which way (up, down, both ways, checked), and
// which compound pushes it; tap one for what it measures and what each compound does to it.
// Direction only, never how much, and never anyone's own results.
// Everything drawn comes from the Library (its body map, library/data/body/, written from the fact
// sheets): no AI's words, nobody's own data. Text is placed as text; the only markup is the
// drawings, made here from numbers and our own words.
// Imports nothing: ai/ai.js hands it the page's helpers (and `onDraw`, called each time the rack is
// drawn), and the library build writes this file's version into ai/ai.js.

const UP = '#F2C94C';
const DOWN = '#55D3FF';
// A body-map line's direction, as a tube shows it
const OPS = { up: 'up', down: 'down', watch: 'watch', warn: 'watch', is: 'steady', block: 'steady' };
// Names too long for a tube's label
const SHORT = {
  glucose: 'Glucose', testosterone: 'Testosterone', thyroid: 'Thyroid', alp: 'ALP', pth: 'PTH', semen: 'Semen', eosinophils: 'Eosinophils',
  kidney: 'Kidney', lipids: 'Lipids', liver: 'Liver', cbc: 'CBC', mma: 'MMA', vitd: 'Vitamin D', b12: 'B12', urineprotein: 'Urine protein',
  uricacid: 'Uric acid', insulin: 'Insulin',
};
const STATE_SAID = { up: 'goes up', down: 'goes down', both: 'pushed both ways', watch: 'checked, no set direction', steady: 'noted', none: 'not moved by what’s on' };
const json = (url) => fetch(url, { credentials: 'omit' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
// A compound's short name: what's in brackets (HGH), else its name
const shortName = (name) => /\(([^)]{2,12})\)/.exec(name)?.[1] || name;
// Its tag under a tube: hgh, encl, bpc
function tagOf(name) {
  const s = shortName(name);
  const word = s.split(/[\s-]/)[0].replace(/[^A-Za-z0-9]/g, '');
  return (word.length > 5 ? word.slice(0, 4) : word).toLowerCase();
}

// One tube, `w` wide: arrows over it, the liquid in its rounded bottom, the dashed line where it
// usually sits. `uid` keeps each tube's clip apart on the page.
function tube(state, uid, w = 40) {
  const T = 'M11 18h18v58a9 9 0 0 1-18 0z';
  const g = { a: [0, 0, 'none'], b: [0, 0, 'none'], up: 0, dn: 0, ux: 0, dx: 0, dash: '' };
  if (state === 'up') { g.a = [30, 55, UP]; g.up = 1; }
  if (state === 'down') { g.a = [66, 19, DOWN]; g.dn = 1; }
  if (state === 'both') { g.a = [36, 16, UP]; g.b = [52, 33, DOWN]; g.up = 1; g.dn = 1; g.ux = -7; g.dx = 7; }
  if (state === 'steady') g.a = [52, 33, 'rgba(247,248,250,.5)'];
  if (state === 'watch') g.dash = ' stroke-dasharray="3 3"';
  const fill = ([y, hh, c]) => (hh ? `<rect x="11" y="${y}" width="18" height="${hh}" fill="${c}"/>` : '');
  return `<svg class="rk-svg" width="${w}" height="${w * 2.5}" viewBox="0 0 40 100" aria-hidden="true" focusable="false"><defs><clipPath id="${uid}"><path d="${T}"/></clipPath></defs>${
    g.up ? `<polygon points="15,12 20,5 25,12" fill="${UP}" transform="translate(${g.ux} 0)"/>` : ''}${
    g.dn ? `<polygon points="15,5 20,12 25,5" fill="${DOWN}" transform="translate(${g.dx} 0)"/>` : ''}<rect x="9" y="15" width="22" height="4" fill="#2A2A30" stroke="rgba(255,255,255,.45)" stroke-width="1"/><g clip-path="url(#${uid})">${fill(g.a)}${fill(g.b)}</g><path d="${T}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"${g.dash}/><line x1="5" y1="52" x2="35" y2="52" stroke="#F7F8FA" stroke-opacity=".6" stroke-width="1" stroke-dasharray="2 2"/></svg>`;
}

export function makeMarkers({ h, svg, copy, onDraw }) {
  // ---------------------------------------------------------------- the body map
  let index = null;
  const lines = new Map();
  const bodyIndex = () => (index ||= json('/library/data/body/index.json'));
  async function linesOf(id) {
    if (!lines.has(id)) {
      lines.set(id, bodyIndex().then((ix) => {
        const v = ix?.drawn?.[id];
        return v ? json(`/library/data/body/${id}.json?v=${encodeURIComponent(v)}`) : null;
      }));
    }
    return lines.get(id);
  }
  // Every marker the compounds may move: who pushes it, which way, and in the fact sheet's words
  async function pushesOf(ids) {
    const [ix, ...all] = await Promise.all([bodyIndex(), ...ids.map(linesOf)]);
    const meta = ix?.markers || {};
    const order = Object.keys(meta);
    const out = new Map();
    ids.forEach((id, i) => {
      for (const ln of all[i]?.lines || []) {
        const op = OPS[ln?.op];
        if (!op || !Array.isArray(ln.markers)) continue;
        for (const m of ln.markers) {
          if (!meta[m]) continue;
          const list = out.get(m) || [];
          if (!list.some((p) => p.id === id && p.op === op)) list.push({ id, op, say: String(ln.say || '') });
          out.set(m, list);
        }
      }
    });
    return { meta, order, pushes: out, loaded: all.some(Boolean) };
  }

  // ---------------------------------------------------------------- the rack
  const rack = { el: null, ids: [], names: {}, on: new Set(), sel: '', data: null, drawn: null, n: 0, ask: 0 };
  const stateOf = (m) => {
    const act = (rack.data?.pushes.get(m) || []).filter((p) => rack.on.has(p.id));
    const has = (op) => act.some((p) => p.op === op);
    return { act, st: has('up') && has('down') ? 'both' : has('up') ? 'up' : has('down') ? 'down' : has('watch') ? 'watch' : has('steady') ? 'steady' : 'none' };
  };
  // Pushed both ways first, then by how many compounds push it, then up or down before checked
  function markerOrder() {
    const d = rack.data;
    const w = { both: 0, up: 1, down: 1, watch: 2, steady: 3, none: 4 };
    return [...d.pushes.keys()].sort((a, b) => {
      const sa = stateOf(a);
      const sb = stateOf(b);
      return w[sa.st] - w[sb.st] || new Set(sb.act.map((p) => p.id)).size - new Set(sa.act.map((p) => p.id)).size || d.order.indexOf(a) - d.order.indexOf(b);
    });
  }
  const label = (m) => SHORT[m] || rack.data.meta[m]?.name || m;
  // What the rack holds, in one line: how many tests move (and how many are pushed both ways); when
  // none does, how many are checked. `short` is the same without the second half. Null when
  // there's nothing to draw.
  function tally() {
    const d = rack.data;
    if (!rack.ids.length || !d || !d.pushes.size) return null;
    const markers = markerOrder();
    const moved = markers.filter((m) => ['up', 'down', 'both'].includes(stateOf(m).st));
    const both = markers.filter((m) => stateOf(m).st === 'both').length;
    const shown = markers.filter((m) => stateOf(m).st !== 'none').length;
    const short = moved.length ? `${moved.length} blood test${moved.length === 1 ? '' : 's'} move${moved.length === 1 ? 's' : ''}`
      : shown ? `${shown} blood test${shown === 1 ? ' is' : 's are'} checked` : 'No blood test is moved by what’s on';
    return { markers, moved, short, text: both ? `${short} · ${both} pushed both ways` : short };
  }
  function drawRack() {
    const el = rack.el;
    if (!el) return;
    const d = rack.data;
    if (!rack.ids.length || !d || !d.pushes.size) {
      el.replaceChildren(h('div', { class: 'rk-none' },
        h('p', { class: 'rl-lede', text: rack.ids.length && d ? 'Nothing Sig is talking about moves a blood test, as far as the Library’s fact sheets say.' : 'Blood tests show up here when Sig talks about something that moves them.' }),
        h('p', { class: 'rl-note', text: 'Each one says which way it goes and which compound pushes it, from the Library’s fact sheets. Your own results stay yours: Sig never asks for them or reads them.' })));
      onDraw?.();
      return;
    }
    const { markers, moved, text } = tally();
    if (!markers.includes(rack.sel) || stateOf(rack.sel).st === 'none') rack.sel = markers.find((m) => stateOf(m).st !== 'none') || markers[0];
    const n = rack.n++;
    // The compounds, each on or off (one stays on)
    const chips = rack.ids.length > 1 ? h('div', { class: 'rk-who', role: 'group', 'aria-label': 'Show what these move' }, rack.ids.map((id) => {
      const b = h('button', { class: 'rk-chip', type: 'button', 'aria-pressed': String(rack.on.has(id)) }, h('i', { 'aria-hidden': 'true' }), shortName(rack.names[id] || id));
      b.addEventListener('click', () => {
        if (rack.on.has(id) && rack.on.size === 1) return;
        if (rack.on.has(id)) rack.on.delete(id); else rack.on.add(id);
        drawRack();
        el.querySelector(`.rk-chip:nth-child(${rack.ids.indexOf(id) + 1})`)?.focus({ preventScroll: true });
      });
      return b;
    })) : null;
    // The one picked: the big tube, what it measures, and what each compound does to it
    const s = stateOf(rack.sel);
    const name = d.meta[rack.sel]?.name || rack.sel;
    const card = h('div', { class: 'rk-card', 'aria-live': 'polite' },
      h('div', { class: 'rk-big' }, svg(tube(s.st, `rk-${n}-big`, 60))),
      h('div', { class: 'rk-what' },
        h('h3', { text: name }),
        h('p', { class: `rk-state s-${s.st}`, text: STATE_SAID[s.st] }),
        d.meta[rack.sel]?.what ? h('p', { class: 'rk-def', text: d.meta[rack.sel].what }) : null,
        s.act.length ? h('dl', { class: 'rk-lines' }, s.act.map((p) => [
          h('dt', { class: `p-${p.op}` }, shortName(rack.names[p.id] || p.id), p.op === 'up' ? h('span', { class: 'rk-ar', text: ' ↑' }) : p.op === 'down' ? h('span', { class: 'rk-ar', text: ' ↓' }) : null),
          h('dd', { text: cap(p.say) })])) : null,
        s.st === 'both' ? h('p', { class: 'rk-both', text: `Pushed both ways: a single ${name} result can’t show either effect alone.` }) : null));
    const grid = h('div', { class: 'rk-grid', role: 'group', 'aria-label': 'Blood tests' }, markers.map((m) => {
      const r = stateOf(m);
      const tag = r.st === 'both' ? 'both ways' : r.st === 'watch' ? 'checked' : r.st === 'steady' ? 'noted' : r.st === 'none' ? 'off'
        : [...new Set(r.act.filter((p) => p.op === r.st).map((p) => tagOf(rack.names[p.id] || p.id)))].map((t) => `${t} ${r.st === 'up' ? '↑' : '↓'}`).join(' ');
      const b = h('button', { class: `rk-tube s-${r.st}`, type: 'button', 'data-marker': m, 'aria-pressed': String(m === rack.sel), 'aria-label': `${d.meta[m]?.name || m}: ${STATE_SAID[r.st]}` },
        svg(tube(r.st, `rk-${n}-${m}`)), h('span', { class: 'rk-name', text: label(m) }), h('span', { class: `rk-tag s-${r.st}`, text: tag }));
      b.addEventListener('click', () => {
        rack.sel = m;
        drawRack();
        el.querySelector(`.rk-tube[data-marker="${m}"]`)?.focus({ preventScroll: true });
      });
      return b;
    }));
    const copyBtn = h('button', { class: 'rk-copy', type: 'button' }, 'Copy the tests for my doctor');
    copyBtn.addEventListener('click', () => {
      const rows = moved.concat(markers.filter((m) => !moved.includes(m) && stateOf(m).st !== 'none')).map((m) => {
        const r = stateOf(m);
        return `- ${d.meta[m]?.name || m}: ${r.act.map((p) => `${shortName(rack.names[p.id] || p.id)} ${p.op === 'up' ? 'may raise it' : p.op === 'down' ? 'may lower it' : p.op === 'watch' ? 'means it’s checked' : 'is noted'}`).join('; ')}`;
      });
      copy(['Blood tests to discuss with my clinician (from Miracle Health’s fact sheets; direction only):', ...rows].join('\n'), copyBtn);
    });
    el.replaceChildren(
      h('div', { class: 'rk-top' }, h('p', { class: 'rk-sum', text }), chips),
      card,
      h('div', { class: 'rk-key', 'aria-hidden': 'true' }, h('span', {}, h('i', { class: 'k-up' }), 'up'), h('span', {}, h('i', { class: 'k-down' }), 'down'), h('span', {}, h('i', { class: 'k-line' }), 'where it usually sits'), h('span', { class: 'rk-tap', text: 'tap a tube' })),
      grid,
      h('p', { class: 'rl-note rk-fine', text: 'Direction only, from the Library’s fact sheets: how much depends on the person, and isn’t drawn.' }),
      h('div', { class: 'rk-own' }, h('p', { text: 'Your own results stay yours: Sig never asks for them or reads them.' }), copyBtn));
    onDraw?.();
  }
  // What the chat is about: these compounds (their names for the labels). Resolves with how many
  // blood tests they move, so the page can open on the rack when there are some
  async function showMarkers(ids, names = {}) {
    const want = [...new Set(ids || [])].slice(0, 4);
    const key = want.join('+');
    const same = key === rack.ids.join('+');
    rack.ids = want;
    rack.names = { ...rack.names, ...names };
    // Already drawn for these: leave the rack as it is (the tube picked, and where the keyboard is)
    if (same && rack.drawn === key && rack.data?.loaded) return rack.data.pushes.size;
    if (!same) { rack.on = new Set(want); rack.sel = ''; }
    const ask = ++rack.ask;
    const data = want.length ? await pushesOf(want) : null;
    if (ask !== rack.ask) return 0;
    rack.data = data;
    rack.drawn = key;
    drawRack();
    return rack.data ? rack.data.pushes.size : 0;
  }

  return {
    mount(el) { rack.el = el; drawRack(); },
    show: showMarkers,
    // How many blood tests are on the rack, and the rack's own first line, for the page to repeat
    count: () => (rack.data ? rack.data.pushes.size : 0),
    said: () => tally()?.short || '',
  };
}
