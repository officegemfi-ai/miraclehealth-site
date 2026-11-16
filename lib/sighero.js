// The homepage's top: the Community Signal, one compound at a time, and under it the Signal spectrum,
// every live Signal as one bar. The Signal is a card in How it works' language (page 18 of the
// design canvas): its rank in the numbered box with the compound's name and a way to step to the
// next, then its ring drawn in 3D, standing on a plate over a grid, each of its four parts (what
// happened 65, agreement 15, voices 10, volume 10) a wall as tall as its number, lit from the front
// left, with the numbers on tags and the score in its middle,
// then what people report most, and at the foot the level its Signal has reached and how strong its
// studies are. Each bar of the spectrum is stacked from the same four parts; the bars are grouped by
// kind, and picking one opens it above. The numbers are the live Signal's, the same version the rest
// of the page reads; what kind each compound is and how strong its studies are come from the
// Library's own data. home.js hands in what this needs, so this file imports nothing. People who ask
// for less motion get every number at once, and nothing travels round the ring.
//
// The opening: the plate is in the page from its first frame (the build draws it in: sxRingSvg).
// When the live Signal arrives the card plays in once: the walls come up onto the plate at the top
// compound's numbers as its score counts up, and the words and the spectrum's bars come in with
// them (home.css, "is-opening"); then the light starts round the plate. All of it is moved by the
// compositor (opacity and transform), not drawn again frame by frame, so it stays smooth while the
// rest of the page loads. The promise startSigHero returns settles once that has played (or the
// Signal didn't load), so the page can leave the rest of its work until then.

// ---- the drawing (lib/ring3d.js, handed in): the ring standing on a plate over a grid, each part a
// wall as tall as its number; the walls, their tags and the score change with the compound --------
const SPANS = [65, 15, 10, 10];
const PARTS = ['what happened', 'agreement', 'voices', 'volume'];
const COLS = ['#3D8BFF', '#7BB0FF', '#AACCFF', '#D4E5FF'];
const VW = 560, VH = 380;
const tall = (v) => 6 + Math.max(0, Math.min(100, v)) * 0.36;   // 100 stands 42 high
// the plate rests on the floor (floor = slab): the floor is the top's own, laid under the whole top (floorSvg)
const SLAB = 12;
const sxGeo = (ring3d) => ring3d({ w: VW, h: VH, cx: 280, cy: 218, r: 102, band: 12, rim: 16, floor: SLAB, slab: SLAB, gap: 3.2, grid: 120, step: 40,
  parts: SPANS.map((span, i) => ({ span, color: COLS[i] })) });
const svgOpen = (cls) => `<svg class="${cls}" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" aria-hidden="true" focusable="false">`;

// The floor the ring stands on, laid under the whole top of the page in place of the page's square
// grid: the plate's grid (the same isometric squares, 40 units apart) carried on across the whole top,
// so the ring is built into the page rather than standing in a box. It is brightest round the plate
// and fades with distance, the back (up the page) first, so the floor goes in, down to the page grid's
// own faintness. It is drawn in the ring's own units and is a layer of the top's own, under everything
// in it (home.css, .sx-ground); startSigHero moves and scales it to where the drawing sits, so its lines
// run on from the plate's. The build writes it into the front page; startSigHero makes it only if it
// isn't there.
export function sxFloorSvg(ring3d, geo = sxGeo(ring3d)) {
  const { iso, f1 } = geo;
  const Z = -SLAB, STEP = 40, E = STEP * 64;
  let lines = '';
  for (let v = -E; v <= E + 0.01; v += STEP) {
    const a = iso(v, -E, Z), b = iso(v, E, Z), c = iso(-E, v, Z), d = iso(E, v, Z);
    lines += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}M${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}`;
  }
  // Signal blue lights the floor round the plate (the plate covers the middle of it)
  return '<svg class="sx-ground-svg" aria-hidden="true" focusable="false"><defs>'
    + floorFade(geo, 'sx-ground-line', 760, 60, [[0, '#fff', 0.28], [0.35, '#fff', 0.17], [0.7, '#fff', 0.075], [1, '#fff', 0.045]])
    + floorFade(geo, 'sx-ground-glow', 250, 0, [[0, '#3D8BFF', 0.34], [0.52, '#3D8BFF', 0.2], [1, '#3D8BFF', 0]])
    + `</defs><g class="sx-ground-g"><path d="${geo.arcPath(0, 360, 250, Z)}Z" fill="url(#sx-ground-glow)"/>`
    + `<path d="${lines}" fill="none" stroke="url(#sx-ground-line)" stroke-width="1" vector-effect="non-scaling-stroke"/></g></svg>`;
}
// a fade that is round on the floor: seen from here, an ellipse 1.2247 times its radius wide and 1/√3
// as high as it is wide, centred under the plate (oy units nearer you)
function floorFade(geo, id, rho, oy, stops) {
  const { iso, f1 } = geo;
  const [cx, cy0] = iso(0, 0, -SLAB), cy = cy0 + oy;
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(rho * 1.2247449)}"`
    + ` gradientTransform="translate(0 ${f1(cy * (1 - 0.5773503))}) scale(1 0.5773503)">`
    + stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + '</radialGradient>';
}

// The drawing as it stands before the live Signal is in: the plate (resting on the floor) and its rings,
// and the light that will go round the plate's edge (hidden until then). Nothing in it is anyone's text: it's
// made from numbers and colours. The build writes it into the front page; startSigHero makes it only
// if it isn't there. The walls come later, in a drawing of their own over this one (wallsSvg), so the
// light passes behind them and they can come in without the plate being drawn again.
export function sxRingSvg(ring3d, geo = sxGeo(ring3d)) {
  const { RI, arcPath } = geo;
  return `${svgOpen('sx-svg')}${geo.base({ well: false, posts: false })}`
    + `<path d="${arcPath(0, 360, RI * 0.62, 0)}Z" fill="none" stroke="rgba(61,139,255,0.3)" stroke-width="1"/>`
    + `<path d="${arcPath(0, 360, RI * 0.3, 0)}Z" fill="none" stroke="rgba(61,139,255,0.2)" stroke-width="1"/></svg>`
    + '<div class="orbit-box" aria-hidden="true"><div class="orbit sx-orbit"><i class="orbit-arm"><i class="orbit-dot"></i></i></div></div>';
}
// the walls at heights hs, and each part's tag, out from the top of its wall
function wallsSvg(geo, hs) {
  let svg = `${svgOpen('sx-svg sx-walls')}${geo.walls(hs)}`;
  geo.SEGS.forEach((_, i) => {
    svg += `<line class="sx-tl" data-tl="${i}" stroke="${COLS[i]}" stroke-width="1" opacity="0"/>`
      + `<g class="sx-tag" data-tag="${i}" opacity="0"><rect height="22" rx="0" fill="#0B0B0D" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>`
      + `<text font-family="'Monaspace Neon', ui-monospace, Menlo, monospace" font-size="11" fill="${COLS[i]}"></text></g>`;
  });
  return `${svg}</svg>`;
}

export function startSigHero(root, { getSignal, library, meter, levels, ring3d }) {
  if (!root) return Promise.resolve();
  const doc = root.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (k) => root.querySelector(`[data-sx="${k}"]`);
  const el = (tag, cls, text) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  let played;
  const ready = new Promise((r) => { played = r; });

  const geo = sxGeo(ring3d);
  const { RO, SEGS, at, f1 } = geo;
  const ring = $('ring'), partsEl = $('parts'), whole = $('whole'), dec = $('dec');
  if (!ring.querySelector('svg.sx-svg')) ring.insertAdjacentHTML('afterbegin', sxRingSvg(ring3d, geo));
  const plate = ring.querySelector('svg.sx-svg'), orbit = ring.querySelector('.sx-orbit');
  const set = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  // the floor (sxFloorSvg) is moved and scaled to where the drawing sits, so its lines run on from the
  // plate's, and again whenever the top or the drawing changes size or the fonts come in; it shows
  // once it's in place (home.css, .sx-ground.is-set)
  const floor = root.closest('.sx-hero')?.querySelector('.sx-ground');
  if (floor && !floor.querySelector('svg')) floor.insertAdjacentHTML('afterbegin', sxFloorSvg(ring3d, geo));
  const floorG = floor?.querySelector('.sx-ground-g');
  let laid = '';
  const lay = () => {
    const b = plate.getBoundingClientRect(), o = floor.getBoundingClientRect();
    const k = Math.min(b.width / VW, b.height / VH);
    if (!k) return;
    const x = b.left - o.left + (b.width - VW * k) / 2, y = b.top - o.top + (b.height - VH * k) / 2;
    const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(4)})`;
    if (t === laid) return;   // only when it has moved, so the floor isn't drawn again for nothing
    laid = t;
    floorG.setAttribute('transform', t);
    floor.classList.add('is-set');
  };
  if (floorG) {
    lay();
    if ('ResizeObserver' in win) { const ro = new win.ResizeObserver(lay); ro.observe(floor); ro.observe(ring); }
    doc.fonts?.ready?.then(lay);
  }
  // the walls' drawing is made unseen in the first idle moment while the Signal loads (or when it
  // arrives, if that's sooner), so the frame that brings the opening in only has to stand them up
  let drawWalls = null, wallsEl = null, tags = [], tls = [];
  const makeWalls = (hs) => {
    if (drawWalls) return;
    orbit.parentElement.insertAdjacentHTML('afterend', wallsSvg(geo, hs));
    wallsEl = orbit.parentElement.nextElementSibling;
    wallsEl.classList.add('is-wait');
    drawWalls = geo.bind(wallsEl, hs);
    tags = [...wallsEl.querySelectorAll('[data-tag]')].map((g) => ({ g, box: g.querySelector('rect'), t: g.querySelector('text') }));
    tls = [...wallsEl.querySelectorAll('[data-tl]')];
  };
  (win.requestIdleCallback || ((f) => win.setTimeout(f, 1)))(() => makeWalls(SPANS.map(() => tall(0))));
  const shape = (parts) => {
    const hs = parts.map(tall);
    if (!drawWalls) makeWalls(hs); else drawWalls(hs);
    wallsEl.classList.remove('is-wait');
    tags.forEach(({ g, box, t }, i) => {
      const line = tls[i];
      const m = SEGS[i][2], h = hs[i], [px, py] = at(m, RO, h), [qx, qy] = at(m, RO + 40, h);
      const len = Math.hypot(qx - px, qy - py) || 1, dx = (qx - px) / len, dy = (qy - py) / len;
      const [lx0, ly0] = [px + dx * 4, py + dy * 4], [lx1, ly1] = [px + dx * 22, py + dy * 22];
      line.setAttribute('x1', f1(lx0)); line.setAttribute('y1', f1(ly0)); line.setAttribute('x2', f1(lx1)); line.setAttribute('y2', f1(ly1)); line.setAttribute('opacity', '0.7');
      const txt = `${PARTS[i]} · ${Math.round(parts[i])}`, w = txt.length * 6.62 + 16;
      const sideOf = dx > 0.35 ? 'r' : dx < -0.35 ? 'l' : 'c', x = lx1 + dx * 4, y = ly1 + dy * 4;
      // the tag stays inside the drawing, whatever the number's width
      const left = Math.max(8, Math.min(VW - 8 - w, sideOf === 'r' ? x : sideOf === 'l' ? x - w : x - w / 2)), top = Math.max(6, sideOf === 'c' ? y - 22 : y - 11);
      box.setAttribute('x', f1(left)); box.setAttribute('y', f1(top)); box.setAttribute('width', f1(w));
      t.setAttribute('x', f1(left + 8)); t.setAttribute('y', f1(top + 15)); set(t, txt);
      g.setAttribute('opacity', '1');
    });
  };
  // the numbers: the score in the middle and the parts as chips (under the drawing on a phone), which
  // keep their places while only their numbers change
  const numbers = (parts, score) => {
    const chips = partsEl.children;
    if (chips.length !== PARTS.length) partsEl.replaceChildren(...PARTS.map((p, i) => el('li', `sx-pt p${i}`)));
    PARTS.forEach((p, i) => set(chips[i], `${p} · ${Math.round(parts[i])}`));
    const [w, d] = score.toFixed(1).split('.');
    set(whole, w);
    set(dec, `.${d}`);
  };
  const drawRing = (parts, score) => { shape(parts); numbers(parts, score); };
  // the light goes round the plate's edge once every ten seconds while the card is on screen, unless
  // less motion is asked for. It's moved by the compositor (home.css, .orbit); here it's only placed
  // over the drawing (lib/ring3d.js, placeOrbit), and again when the drawing changes size
  const place = () => geo.placeOrbit(orbit, plate, orbit.parentElement);
  const go = () => {
    if (still || !list.length) return;
    place();
    orbit.classList.add('is-on');
    if ('ResizeObserver' in win) new win.ResizeObserver(place).observe(ring);
  };
  if ('IntersectionObserver' in win) {
    new win.IntersectionObserver((es) => { orbit.classList.toggle('is-away', !es.some((x) => x.isIntersecting)); }, { rootMargin: '80px' }).observe(ring);
  }

  // ---- the live Signal: every compound, in the spectrum's order ---------------------------------
  const KINDS = [['peptide', 'peptides'], ['hormone', 'hormones'], ['medication', 'medications'], ['supplement', 'supplements']];
  const GRADE = ['anecdotal', 'animal and lab', 'limited', 'moderate', 'strong'];
  const GRADE_KEY = ['anecdotal', 'preclinical', 'limited', 'moderate', 'strong'];
  const lower = (s) => String(s || '').toLowerCase();
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
    meta.replaceChildren(`${c.kind} · `, ...(c.conf ? [el('span', 'sx-conf', `${c.conf} confidence · `)] : []), el('span', 'sx-rk', `ranked ${c.rank} of ${list.length}`));
    summary.textContent = c.summary;
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
    level.textContent = `level ${lv + 1} of ${levels.length} · ${lower(levels[lv].name)}`;
    const g = grades.get(c.id);
    study.href = `/library/${encodeURIComponent(c.id)}/`;
    study.replaceChildren();
    if (g != null) study.insertAdjacentHTML('afterbegin', meter(GRADE_KEY[g]));
    const arr = el('span', 'sx-arr', '→');
    arr.setAttribute('aria-hidden', 'true');
    study.append(el('span', '', g != null ? `studies: ${GRADE[g]}` : 'the fact sheet'), arr);
    study.setAttribute('aria-label', `${c.name}: the fact sheet${g != null ? `, studies ${GRADE[g]}` : ''}`);
    // the ring: from where it was to here. In the opening the walls are drawn once, where they end
    // up (home.css brings their drawing in), and only the numbers count up, from nothing; its clock
    // starts on the frame after the one that brings everything in, so none of it is lost to that
    // busier frame. Picking another compound moves the walls themselves
    const from = intro ? { parts: [0, 0, 0, 0], score: 0 } : shown, to = { parts: c.parts, score: c.score };
    shown = to;
    win.cancelAnimationFrame(tween);
    if (ended) { const f = ended; ended = null; f(); }
    if ((!animate && !intro) || still || !from) { drawRing(to.parts, to.score); if (done) done(); }
    else {
      const dur = intro ? 1000 : 700;
      let t0 = null;
      ended = done;
      if (intro) { shape(to.parts); numbers(from.parts, 0); }
      const step = (t) => {
        if (t0 == null) t0 = t;
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const parts = to.parts.map((v, j) => from.parts[j] + (v - from.parts[j]) * e), score = from.score + (to.score - from.score) * e;
        if (intro) numbers(parts, score); else drawRing(parts, score);
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
        b.title = `${c.name} · ${c.score.toFixed(1)} · ${c.summary}`;
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
      lab.append(el('span', '', g.label), el('br'), el('b', '', String(g.items.length)));
      labels.append(lab);
      if (gi) inline.append(' · ');
      inline.append(`${g.label} `, el('b', '', String(g.items.length)));
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
    fill(top, { intro: true, done: go });
    root.querySelectorAll('[data-sx="count"]').forEach((n) => { set(n, String(list.length)); });
    root.querySelector('.sx').removeAttribute('aria-busy');
  }).catch(() => {
    summary.textContent = 'the live Signal didn’t load';
    ring.setAttribute('aria-label', 'The Community Signal didn’t load. Try again in a minute.');
    meta.textContent = 'try again in a minute';
    themesEl.hidden = themesK.hidden = true;
    root.querySelector('.sx').removeAttribute('aria-busy');
    root.classList.add('is-off');
    played();
  });
  return ready;
}
