// The homepage's top: the Community Signal, one compound at a time, and under it the Signal spectrum,
// every live Signal as one bar. The Signal is the compound's name and rank with a way to step to the
// next, then its score, big, with its four parts (how well it worked 65, how much people agree 15, how many people 10, how many
// reports 10, in words anyone can read: decision, November 17)
// as glowing bars, then what people report most, and at the foot the level its Signal has reached and
// how strong its studies are. Behind the whole top, the Signal in light (lib/sigfield.js, handed in):
// bands of violet and blue light drift as if on an LED wall, one band for each part, as bright as its
// number, and a pulse goes out through them from the score when another compound is picked. Each bar of
// the spectrum is stacked from the same four parts; the bars are grouped by kind, and picking one opens
// it above. The numbers are the live Signal's, the same version the rest of the page reads; what kind
// each compound is and how strong its studies are come from the Library's own data. home.js hands in
// what this needs, so this file imports nothing. People who ask for less motion get every number at
// once and the light standing still.
//
// The opening: when the live Signal arrives the card plays in once: the score counts up, the bars grow
// to their numbers, the words and the spectrum's bars come in with them (home.css, "is-opening"), and
// the light comes up with a pulse. The light is moved by its own drawing, small and on the GPU; the
// rest by the compositor (opacity and transform), so it stays smooth while the page loads. The promise
// startSigHero returns settles once that has played (or the Signal didn't load), so the page can leave
// the rest of its work until then.
const SPANS = [65, 15, 10, 10];
const PARTS = ['how well it worked', 'how much people agree', 'how many people', 'how many reports'];
// the parts' colours: the Signal's blue into the brand's violets (home.css gives the bars the same)
const COLS = ['#3D8BFF', '#9AA0F4', '#6B48F1', '#3A2BFF'];
// the words the light dims behind, so they read on a dark ground
const QUIET = ['.sx-head', '.sx-do', '.sx-h', '.sx-of', '.sx-sum', '.sx-tb', '.sx-f', '.sx-parts', '.sx-band-head', '.sx-spec'];

export function startSigHero(root, { getSignal, library, meter, levels, field }) {
  if (!root) return Promise.resolve();
  const doc = root.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (k) => root.querySelector(`[data-sx="${k}"]`);
  const el = (tag, cls, text) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  let played;
  const ready = new Promise((r) => { played = r; });

  const ring = $('ring'), partsEl = $('parts'), whole = $('whole'), dec = $('dec');
  const set = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  // the light, made in the first idle moment while the Signal loads (its drawing is compiled then), so
  // the frame that brings the opening in only has to start it
  let light = null, made = false;
  const makeLight = () => {
    if (made) return light;
    made = true;
    const canvas = root.querySelector('.sx-field-c');
    try { light = field && canvas ? field(root, { canvas, colors: COLS, quiet: QUIET, focus: root.querySelector('.sx-mid'), side: root.querySelector('.sx.hs-card') }) : null; } catch { light = null; }
    return light;
  };
  (win.requestIdleCallback || ((f) => win.setTimeout(f, 1)))(makeLight);
  // the four parts: a bar each (its fill is scaled on the compositor, home.css .sx-m) and its number
  const rows = [...partsEl.querySelectorAll('.sx-pt')].map((li) => ({ fill: li.querySelector('.sx-m i'), val: li.querySelector('b') }));
  const grow = (parts) => rows.forEach(({ fill }, i) => fill?.style.setProperty('--v', (Math.max(0, Math.min(100, parts[i])) / 100).toFixed(3)));
  // the numbers: the score in the middle and each part's, which keep their places while they change
  const numbers = (parts, score) => {
    rows.forEach(({ val }, i) => { if (val) set(val, String(Math.round(parts[i]))); });
    const [w, d] = score.toFixed(1).split('.');
    set(whole, w);
    set(dec, `.${d}`);
  };

  // ---- the live Signal: every compound, in the spectrum's order ---------------------------------
  const KINDS = [['peptide', 'peptides'], ['hormone', 'hormones'], ['medication', 'medications'], ['supplement', 'supplements']];
  const GRADE = ['anecdotal', 'animal and lab', 'limited', 'moderate', 'strong'];
  const GRADE_KEY = ['anecdotal', 'preclinical', 'limited', 'moderate', 'strong'];
  const lower = (s) => String(s || '').toLowerCase();
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  let list = [], pick = 0, shown = null, grades = new Map(), tween = 0, ended = null;

  const meta = $('meta'), name = $('name'), rank = $('rank'), summary = $('summary'), themesEl = $('themes'), themesK = $('themes-k'), level = $('level'), study = $('studies');
  // done: called once the ring has got there (at once if it doesn't move, or if another compound is
  // picked before it has)
  function fill(i, { animate = false, intro = false, done = null } = {}) {
    const c = list[i];
    pick = i;
    name.textContent = c.name;
    rank.textContent = String(c.rank).padStart(2, '0');
    // its kind and its rank, then how it went and how sure: two plain lines, no chain of dots
    meta.replaceChildren(`${cap(c.kind)} · `, el('span', 'sx-rk', `ranked ${c.rank} of ${list.length}`));
    summary.textContent = `${cap(c.summary)}${c.conf ? `, ${c.conf} confidence` : ''}`;
    ring.setAttribute('aria-label', `${c.name}: Community Signal ${c.score.toFixed(1)} out of 100, ${c.summary}. ${PARTS.map((p, k) => `${p} ${c.parts[k]}`).join(', ')}.`);
    // what people report most, as often as the forums and members say it
    themesEl.replaceChildren(...c.themes.map((t, k) => {
      const li = el('li');
      li.style.setProperty('--i', String(k));
      const f = lower(t.label);
      li.append(el('span', 'sx-th', t.theme), el('span', `sx-fq${f === 'very common' ? ' hi' : f === 'common' ? ' mid' : ''}`, f));
      return li;
    }));
    if (!c.themes.length) themesEl.replaceChildren(el('li', 'sx-none', 'Not enough reports yet to say what people mention most.'));
    themesEl.hidden = themesK.hidden = false;
    // the level the Signal has reached, and the studies from its fact sheet
    const lv = Math.max(0, levels.findIndex((l) => l.key === c.level));
    level.textContent = `Level ${lv + 1} of ${levels.length}: ${lower(levels[lv].name)}`;
    const g = grades.get(c.id);
    study.href = `/library/${encodeURIComponent(c.id)}/`;
    study.replaceChildren();
    if (g != null) study.insertAdjacentHTML('afterbegin', meter(GRADE_KEY[g]));
    const arr = el('span', 'sx-arr', '→');
    arr.setAttribute('aria-hidden', 'true');
    study.append(el('span', '', g != null ? `Studies: ${GRADE[g]}` : 'The fact sheet'), arr);
    study.setAttribute('aria-label', `${c.name}: the fact sheet${g != null ? `, studies ${GRADE[g]}` : ''}`);
    // the ring: from where it was to here. In the opening the walls are drawn once, where they end
    // up (home.css brings their drawing in), and only the numbers count up, from nothing; its clock
    // starts on the frame after the one that brings everything in, so none of it is lost to that
    // busier frame. Picking another compound moves the walls themselves
    const from = intro ? { parts: [0, 0, 0, 0], score: 0 } : shown, to = { parts: c.parts, score: c.score };
    shown = to;
    win.cancelAnimationFrame(tween);
    if (ended) { const f = ended; ended = null; f(); }
    // the bars grow (home.css eases them) and the light brightens to the new parts with a pulse out
    // from the score; the numbers count from where they were
    grow(to.parts);
    makeLight()?.set(to.parts, to.score, { pulse: !still });
    if (intro) makeLight()?.start();
    if ((!animate && !intro) || still || !from) { numbers(to.parts, to.score); if (done) done(); }
    else {
      const dur = intro ? 1000 : 700;
      let t0 = null;
      ended = done;
      if (intro) numbers(from.parts, 0);
      const step = (t) => {
        if (t0 == null) t0 = t;
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        numbers(to.parts.map((v, j) => from.parts[j] + (v - from.parts[j]) * e), from.score + (to.score - from.score) * e);
        if (k < 1) tween = win.requestAnimationFrame(step);
        else if (ended) { const f = ended; ended = null; f(); }
      };
      tween = intro ? win.requestAnimationFrame(() => { tween = win.requestAnimationFrame(step); }) : win.requestAnimationFrame(step);
    }
    // the spectrum: this bar is the picked one
    bars.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  }

  // ---- the spectrum: one bar per Signal, stacked from its parts, grouped by kind --------------------
  const spec = $('spec');
  let bars = [];
  function drawSpectrum() {
    const groups = [];
    list.forEach((c, i) => {
      let g = groups.find((x) => x.kind === c.kind);
      if (!g) groups.push(g = { kind: c.kind, label: c.kinds, items: [] });
      g.items.push(i);
    });
    const plot = el('div', 'sx-plot');
    for (const v of [25, 50, 75, 100]) {
      const line = el('span', `sx-rule g${v}`);
      line.style.bottom = `${v}%`;
      line.setAttribute('aria-hidden', 'true');
      line.append(el('span', 'sx-gv', String(v)));
      plot.append(line);
    }
    const cols = el('div', 'sx-cols'), labels = el('div', 'sx-glabs'), inline = el('p', 'sx-gline');
    labels.setAttribute('aria-hidden', 'true');
    bars = [];
    groups.forEach((g, gi) => {
      const col = el('div', 'sx-col');
      col.style.flex = `${g.items.length} 1 0`;
      col.setAttribute('role', 'group');
      col.setAttribute('aria-label', `${g.label}, ${g.items.length}`);
      for (const i of g.items) {
        // the bar is as tall as the Signal, split in the shares its four parts give it
        const c = list[i], b = el('button', 'sx-bar'), sum = c.cw.reduce((a, v) => a + v, 0), k = sum > 0 ? c.score / sum : 0;
        b.type = 'button';
        b.style.setProperty('--i', String(i));
        b.setAttribute('aria-label', `${c.name}, Signal ${c.score.toFixed(1)}`);
        b.title = `${c.name}: ${c.score.toFixed(1)}, ${c.summary}`;
        b.classList.toggle('l', i < 3);
        b.classList.toggle('r', i > list.length - 4);
        const lab = el('span', 'sx-lab');
        lab.style.bottom = `calc(${c.score.toFixed(2)}% + 12px)`;
        lab.append(c.name, ' ', el('b', '', c.score.toFixed(1)));
        b.append(lab, el('span', 'sx-cap'));
        for (const j of [3, 2, 1, 0]) {
          const part = el('span', `sx-p${j}`);
          part.style.height = `${(c.cw[j] * k).toFixed(2)}%`;
          b.append(part);
        }
        b.addEventListener('click', () => fill(i, { animate: true }));
        bars[i] = b;
        col.append(b);
      }
      cols.append(col);
      const lab = el('p', gi === groups.length - 1 && groups.length > 1 ? 'sx-glab end' : 'sx-glab');
      lab.style.flex = `${g.items.length} 1 0`;
      lab.append(el('span', '', cap(g.label)), el('br'), el('b', '', String(g.items.length)));
      labels.append(lab);
      const item = el('span');
      item.append(`${cap(g.label)} `, el('b', '', String(g.items.length)));
      inline.append(item);
    });
    inline.setAttribute('aria-hidden', 'true');
    plot.append(cols);
    spec.replaceChildren(plot, el('div', 'sx-floor'), labels, inline);
    spec.querySelector('.sx-floor').setAttribute('aria-hidden', 'true');
    // the arrow keys move along the bars, Home and End go to either end
    cols.addEventListener('keydown', (e) => {
      const go = { ArrowRight: pick + 1, ArrowDown: pick + 1, ArrowLeft: pick - 1, ArrowUp: pick - 1, Home: 0, End: list.length - 1 }[e.key];
      if (go == null) return;
      e.preventDefault();
      const i = (go + list.length) % list.length;
      fill(i, { animate: true });
      bars[i].focus();
    });
  }

  $('prev').addEventListener('click', () => { if (list.length) fill((pick + list.length - 1) % list.length, { animate: true }); });
  $('next').addEventListener('click', () => { if (list.length) fill((pick + 1) % list.length, { animate: true }); });

  // before the Signal has loaded, the plate is empty and says so
  set(whole, '–');
  set(dec, '');
  // the Library says what kind each compound is (the Signal itself may only say "compound"), but the
  // Signal isn't kept waiting long for it
  const lib = Promise.race([Promise.resolve(library).catch(() => null), new Promise((r) => { win.setTimeout(() => r(null), 2500); })]);
  Promise.all([getSignal(), lib]).then(([snap, info]) => {
    const all = snap?.signals || {};
    const kindOf = info?.kinds || new Map();
    if (info?.grades?.size) grades = info.grades;
    const rows = Object.entries(all).map(([cid, s]) => {
      const parts = [s.efficacy, s.consistency, s.diversity, s.confidence].map(num);
      if (num(s.score) == null || parts.some((v) => v == null)) return null;
      const said = lower(s.kind), kind = KINDS.some(([x]) => x === said) ? said : kindOf.get(cid) || said || 'compound';
      const k = KINDS.findIndex(([x]) => x === kind);
      return {
        id: cid, name: s.name || cid, kind, kinds: k >= 0 ? KINDS[k][1] : `${kind}s`, order: k >= 0 ? k : KINDS.length, score: s.score, parts,
        cw: parts.map((v, j) => (v * SPANS[j]) / 100), conf: lower(s.confidence_label), summary: lower(s.summary_label) || 'live',
        level: s.certification || 'forum',
        themes: (Array.isArray(s.themes) ? s.themes : []).filter((t) => t && t.theme).slice(0, 4).map((t) => ({ theme: String(t.theme), label: String(t.label || '') })),
      };
    }).filter(Boolean);
    if (!rows.length) throw new Error('no Signal');
    rows.forEach((c) => { c.rank = 1 + rows.filter((x) => x.score > c.score).length; });
    list = rows.sort((a, b) => a.order - b.order || b.score - a.score || a.name.localeCompare(b.name));
    // (read before anything changes, so it costs no layout of its own: the spectrum keeps its height).
    // Off screen, the spectrum's bars are made once the opening has played (or at the first scroll),
    // so the frame that brings the opening in has less to do; its place is kept meanwhile
    const specShown = spec.getBoundingClientRect().top < win.innerHeight;
    let specDone = false;
    const spectrumNow = () => {
      if (specDone) return;
      specDone = true;
      drawSpectrum();
      bars.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === pick)); b.tabIndex = k === pick ? 0 : -1; });
    };
    if (specShown) spectrumNow();
    else {
      win.addEventListener('scroll', spectrumNow, { once: true, passive: true });
      ready.then(() => (win.requestIdleCallback ? win.requestIdleCallback(spectrumNow, { timeout: 1000 }) : win.setTimeout(spectrumNow, 50)));
    }
    const top = list.reduce((best, c, i) => (c.score > list[best].score ? i : best), 0);
    root.classList.add('is-live');
    // home.css plays what changed in while this is on (its longest part, the last bar, ends by 1.5s);
    // the bars only grow if the spectrum is on screen to be seen (below the fold they'd only keep the
    // page busy). The page's other work waits until it's over
    if (still) played();
    else {
      spec.classList.toggle('is-growing', specShown);
      root.classList.add('is-opening');
      win.setTimeout(() => { root.classList.remove('is-opening'); played(); }, 1600);
    }
    fill(top, { intro: true });
    root.querySelectorAll('[data-sx="count"]').forEach((n) => { set(n, String(list.length)); });
    root.querySelector('.sx').removeAttribute('aria-busy');
  }).catch(() => {
    summary.textContent = 'The live Signal didn’t load';
    ring.setAttribute('aria-label', 'The Community Signal didn’t load. Try again in a minute.');
    meta.textContent = 'Try again in a minute';
    themesEl.hidden = themesK.hidden = true;
    root.querySelector('.sx').removeAttribute('aria-busy');
    root.classList.add('is-off');
    played();
  });
  return ready;
}
