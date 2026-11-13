// The homepage's top: the Community Signal, one compound at a time, and under it the Signal spectrum,
// every live Signal as one bar. The Signal is a card in How it works' language (page 18 of the
// design canvas): its rank in the numbered box with the compound's name and a way to step to the
// next, then a line drawing of its ring lying flat over a grid, its four parts (what happened 65,
// agreement 15, voices 10, volume 10) as arcs with their numbers on tags and the score in its middle,
// then what people report most, and at the foot the level its Signal has reached and how strong its
// studies are. Each bar of the spectrum is stacked from the same four parts; the bars are grouped by
// kind, and picking one opens it above. The numbers are the live Signal's, the same version the rest
// of the page reads; what kind each compound is and how strong its studies are come from the
// Library's own data. home.js hands in what this needs, so this file imports nothing. People who ask
// for less motion get every number at once, and nothing travels round the ring.
export function startSigHero(root, { getSignal, library, meter, levels }) {
  if (!root) return;
  const doc = root.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (k) => root.querySelector(`[data-sx="${k}"]`);
  const el = (tag, cls, text) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ---- the drawing, made once: the ring lying flat over a grid; its arcs, tags and score change -------
  const SPANS = [65, 15, 10, 10];
  const PARTS = ['what happened', 'agreement', 'voices', 'volume'];
  const COLS = ['#3D8BFF', '#7BB0FF', '#AACCFF', '#D4E5FF'];
  const VW = 560, VH = 380, CX = 280, CY = 204, R = 112, FLOOR = 30, GAP = 3.2;
  const f1 = (v) => v.toFixed(1);
  const iso = (x, y, z = 0) => [CX + (x - y) * 0.8660254, CY + (x + y) * 0.5 - z];
  // a point on the ring: a is degrees round it from its top, clockwise as you look at it
  const at = (a, r = R, z = 0) => { const t = ((225 + a) * Math.PI) / 180; return iso(r * Math.cos(t), r * Math.sin(t), z); };
  const path = (a0, a1, r = R, z = 0) => {
    const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3));
    let d = '';
    for (let j = 0; j <= n; j++) { const [x, y] = at(a0 + ((a1 - a0) * j) / n, r, z); d += `${j ? 'L' : 'M'}${f1(x)} ${f1(y)}`; }
    return d;
  };
  let a0 = 0;
  const SEGS = SPANS.map((sp) => { const s0 = a0, s1 = a0 + 3.6 * sp; a0 = s1; return [s0 + GAP, s1 - GAP, (s0 + s1) / 2]; });
  const LINE = 'rgba(255,255,255,0.16)';
  let svg = `<svg class="sx-svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" aria-hidden="true" focusable="false">`;
  // the grid it lies over
  for (let v = -120; v <= 120; v += 40) {
    const [x0, y0] = iso(v, -120, -FLOOR), [x1, y1] = iso(v, 120, -FLOOR), [x2, y2] = iso(-120, v, -FLOOR), [x3, y3] = iso(120, v, -FLOOR);
    svg += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${LINE}" stroke-width="1"/><line x1="${f1(x2)}" y1="${f1(y2)}" x2="${f1(x3)}" y2="${f1(y3)}" stroke="${LINE}" stroke-width="1"/>`;
  }
  // its shadow on the grid, posts up from it, then the plate the ring lies on (a slab, edge and top),
  // with rings inside it
  const RP = R + 16;
  svg += `<path d="${path(0, 360, RP, -FLOOR)}Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
  for (const a of [45, 135, 225, 315]) {
    const [x0, y0] = at(a, RP, -FLOOR), [x1, y1] = at(a, RP, -6);
    svg += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="rgba(255,255,255,0.18)" stroke-width="1" stroke-dasharray="3 4"/>`;
  }
  svg += `<path d="${path(0, 360, RP, -6)}Z" fill="#0F0F12" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="${path(0, 360, RP)}Z" fill="#141418" stroke="rgba(255,255,255,0.42)" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="${path(0, 360, R * 0.62)}Z" fill="none" stroke="rgba(61,139,255,0.3)" stroke-width="1"/>`
    + `<path d="${path(0, 360, R * 0.34)}Z" fill="none" stroke="rgba(61,139,255,0.18)" stroke-width="1"/>`;
  // the four parts: a dim track each, and the arc as far as its number goes
  SEGS.forEach(([s0, s1], i) => {
    svg += `<path d="${path(s0, s1)}" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="7" stroke-linecap="round"/>`
      + `<path data-arc="${i}" d="M0 0" fill="none" stroke="${COLS[i]}" stroke-width="7" stroke-linecap="round"/>`;
  });
  // the light that goes round it
  svg += '<g data-run opacity="0"><circle r="9" fill="rgba(61,139,255,0.28)"/><circle r="3.4" fill="#FFFFFF"/></g>';
  // each part's tag, out from the middle of its arc
  SEGS.forEach(([, , m], i) => {
    const [px, py] = at(m, RP), dx0 = px - CX, dy0 = py - CY, len = Math.hypot(dx0, dy0), dx = dx0 / len, dy = dy0 / len;
    const [lx0, ly0] = at(m, R + 6), [lx1, ly1] = [px + dx * 18, py + dy * 18];
    const side = dx > 0.35 ? 'r' : dx < -0.35 ? 'l' : 'c';
    svg += `<line class="sx-tl" x1="${f1(lx0)}" y1="${f1(ly0)}" x2="${f1(lx1)}" y2="${f1(ly1)}" stroke="${COLS[i]}" stroke-width="1" opacity="0.7"/>`
      + `<g class="sx-tag" data-tag="${i}" data-x="${f1(lx1 + dx * 4)}" data-y="${f1(ly1 + dy * 4)}" data-side="${side}" opacity="0"><rect height="22" rx="4" fill="#0B0B0D" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>`
      + `<text font-family="'Monaspace Neon', ui-monospace, Menlo, monospace" font-size="11" fill="${COLS[i]}"></text></g>`;
  });
  const ring = $('ring'), partsEl = $('parts');
  ring.insertAdjacentHTML('afterbegin', `${svg}</svg>`);
  const arcs = [...ring.querySelectorAll('[data-arc]')], tags = [...ring.querySelectorAll('[data-tag]')], run = ring.querySelector('[data-run]');
  const drawRing = (parts, score) => {
    arcs.forEach((p) => { const i = +p.dataset.arc, [s0, s1] = SEGS[i]; p.setAttribute('d', path(s0, s0 + ((s1 - s0) * Math.max(0.5, Math.min(100, parts[i]))) / 100)); });
    tags.forEach((g) => {
      if (!list.length) { g.setAttribute('opacity', '0'); return; }
      const i = +g.dataset.tag, txt = `${PARTS[i]} · ${Math.round(parts[i])}`, w = txt.length * 6.62 + 16;
      const x = +g.dataset.x, y = +g.dataset.y, side = g.dataset.side;
      // the tag stays inside the drawing, whatever the number's width
      const left = Math.max(8, Math.min(VW - 8 - w, side === 'r' ? x : side === 'l' ? x - w : x - w / 2)), top = side === 'c' ? y - 22 : y - 11;
      const box = g.querySelector('rect'), t = g.querySelector('text');
      box.setAttribute('x', f1(left)); box.setAttribute('y', f1(top)); box.setAttribute('width', f1(w));
      t.setAttribute('x', f1(left + 8)); t.setAttribute('y', f1(top + 15)); t.textContent = txt;
      g.setAttribute('opacity', '1');
    });
    if (list.length) {
      partsEl.replaceChildren(...PARTS.map((p, i) => { const li = el('li', `sx-pt p${i}`, `${p} · ${Math.round(parts[i])}`); return li; }));
    }
    const [w, d] = score.toFixed(1).split('.');
    $('whole').textContent = w;
    $('dec').textContent = `.${d}`;
  };
  // the light goes round once every ten seconds while the card is on screen, unless less motion is asked for
  let seen = false, spin = 0;
  const turn = (t) => {
    const [x, y] = at(((t / 10000) % 1) * 360);
    run.setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
    spin = seen ? win.requestAnimationFrame(turn) : 0;
  };
  const go = () => { if (still || !list.length) return; run.setAttribute('opacity', '1'); if (seen && !spin) spin = win.requestAnimationFrame(turn); };
  if ('IntersectionObserver' in win) {
    new win.IntersectionObserver((es) => { seen = es.some((x) => x.isIntersecting); if (seen) go(); }, { rootMargin: '80px' }).observe(ring);
  } else seen = true;

  // ---- the live Signal: every compound, in the spectrum's order ---------------------------------
  const KINDS = [['peptide', 'peptides'], ['hormone', 'hormones'], ['medication', 'medications'], ['supplement', 'supplements']];
  const GRADE = ['anecdotal', 'animal and lab', 'limited', 'moderate', 'strong'];
  const GRADE_KEY = ['anecdotal', 'preclinical', 'limited', 'moderate', 'strong'];
  const lower = (s) => String(s || '').toLowerCase();
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  let list = [], pick = 0, shown = null, grades = new Map(), tween = 0;

  const meta = $('meta'), name = $('name'), rank = $('rank'), summary = $('summary'), themesEl = $('themes'), themesK = $('themes-k'), level = $('level'), study = $('studies');
  function fill(i, { animate = false } = {}) {
    const c = list[i];
    pick = i;
    name.textContent = c.name;
    rank.textContent = String(c.rank).padStart(2, '0');
    meta.replaceChildren(`${c.kind} · `, ...(c.conf ? [el('span', 'sx-conf', `${c.conf} confidence · `)] : []), el('span', 'sx-rk', `ranked ${c.rank} of ${list.length}`));
    summary.textContent = c.summary;
    ring.setAttribute('aria-label', `${c.name}: Community Signal ${c.score.toFixed(1)} out of 100, ${c.summary}. ${PARTS.map((p, k) => `${p} ${c.parts[k]}`).join(', ')}.`);
    // what people report most, as often as the forums and members say it
    themesEl.replaceChildren(...c.themes.map((t) => {
      const li = el('li');
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
    // the ring: from where it was to here
    const from = shown, to = { parts: c.parts, score: c.score };
    shown = to;
    win.cancelAnimationFrame(tween);
    if (!animate || still || !from) { drawRing(to.parts, to.score); }
    else {
      const t0 = win.performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3);
        drawRing(to.parts.map((v, j) => from.parts[j] + (v - from.parts[j]) * e), from.score + (to.score - from.score) * e);
        if (k < 1) tween = win.requestAnimationFrame(step);
      };
      tween = win.requestAnimationFrame(step);
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

  // before the Signal has loaded, the ring is empty and says so
  drawRing([0, 0, 0, 0], 0);
  $('whole').textContent = '–';
  $('dec').textContent = '';
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
    drawSpectrum();
    const top = list.reduce((best, c, i) => (c.score > list[best].score ? i : best), 0);
    fill(top);
    root.querySelectorAll('[data-sx="count"]').forEach((n) => { n.textContent = String(list.length); });
    root.classList.add('is-live');
    go();
    root.querySelector('.sx').removeAttribute('aria-busy');
  }).catch(() => {
    summary.textContent = 'the live Signal didn’t load';
    ring.setAttribute('aria-label', 'The Community Signal didn’t load. Try again in a minute.');
    meta.textContent = 'try again in a minute';
    root.querySelector('.sx').removeAttribute('aria-busy');
    root.classList.add('is-off');
  });
}
