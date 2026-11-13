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
export function startSigHero(root, { getSignal, library, meter, levels, ring3d }) {
  if (!root) return;
  const doc = root.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (k) => root.querySelector(`[data-sx="${k}"]`);
  const el = (tag, cls, text) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ---- the drawing, made once (lib/ring3d.js, handed in by home.js): the ring standing on a plate over
  // a grid, each part a wall as tall as its number; the walls, their tags and the score change with
  // the compound ----------------------------------------------------------------------------------
  const SPANS = [65, 15, 10, 10];
  const PARTS = ['what happened', 'agreement', 'voices', 'volume'];
  const COLS = ['#3D8BFF', '#7BB0FF', '#AACCFF', '#D4E5FF'];
  const VW = 560, VH = 380;
  const geo = ring3d({ w: VW, h: VH, cx: 280, cy: 218, r: 102, band: 12, rim: 16, floor: 40, slab: 12, gap: 3.2, grid: 120, step: 40,
    parts: SPANS.map((span, i) => ({ span, color: COLS[i] })) });
  const { RI, RO, RP, SEGS, at, arcPath, f1 } = geo;
  const tall = (v) => 6 + Math.max(0, Math.min(100, v)) * 0.36;   // 100 stands 42 high
  let svg = `<svg class="sx-svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" aria-hidden="true" focusable="false">${geo.base()}`
    + `<path d="${arcPath(0, 360, RI * 0.62, 0)}Z" fill="none" stroke="rgba(61,139,255,0.3)" stroke-width="1"/>`
    + `<path d="${arcPath(0, 360, RI * 0.3, 0)}Z" fill="none" stroke="rgba(61,139,255,0.2)" stroke-width="1"/>`;
  // the light that goes round the plate's edge, then the walls
  svg += '<g data-run opacity="0"><circle r="9" fill="rgba(61,139,255,0.28)"/><circle r="3.4" fill="#FFFFFF"/></g>';
  svg += geo.walls();
  // each part's tag, out from the top of its wall
  SEGS.forEach((_, i) => {
    svg += `<line class="sx-tl" data-tl="${i}" stroke="${COLS[i]}" stroke-width="1" opacity="0.7"/>`
      + `<g class="sx-tag" data-tag="${i}" opacity="0"><rect height="22" rx="4" fill="#0B0B0D" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>`
      + `<text font-family="'Monaspace Neon', ui-monospace, Menlo, monospace" font-size="11" fill="${COLS[i]}"></text></g>`;
  });
  const ring = $('ring'), partsEl = $('parts');
  ring.insertAdjacentHTML('afterbegin', `${svg}</svg>`);
  const drawWalls = geo.bind(ring);
  const tags = [...ring.querySelectorAll('[data-tag]')], tls = [...ring.querySelectorAll('[data-tl]')], run = ring.querySelector('[data-run]');
  const drawRing = (parts, score) => {
    const hs = parts.map(tall);
    drawWalls(hs);
    tags.forEach((g, i) => {
      const line = tls[i];
      if (!list.length) { g.setAttribute('opacity', '0'); line.setAttribute('opacity', '0'); return; }
      const m = SEGS[i][2], h = hs[i], [px, py] = at(m, RO, h), [qx, qy] = at(m, RO + 40, h);
      const len = Math.hypot(qx - px, qy - py) || 1, dx = (qx - px) / len, dy = (qy - py) / len;
      const [lx0, ly0] = [px + dx * 4, py + dy * 4], [lx1, ly1] = [px + dx * 22, py + dy * 22];
      line.setAttribute('x1', f1(lx0)); line.setAttribute('y1', f1(ly0)); line.setAttribute('x2', f1(lx1)); line.setAttribute('y2', f1(ly1)); line.setAttribute('opacity', '0.7');
      const txt = `${PARTS[i]} · ${Math.round(parts[i])}`, w = txt.length * 6.62 + 16;
      const sideOf = dx > 0.35 ? 'r' : dx < -0.35 ? 'l' : 'c', x = lx1 + dx * 4, y = ly1 + dy * 4;
      // the tag stays inside the drawing, whatever the number's width
      const left = Math.max(8, Math.min(VW - 8 - w, sideOf === 'r' ? x : sideOf === 'l' ? x - w : x - w / 2)), top = Math.max(6, sideOf === 'c' ? y - 22 : y - 11);
      const box = g.querySelector('rect'), t = g.querySelector('text');
      box.setAttribute('x', f1(left)); box.setAttribute('y', f1(top)); box.setAttribute('width', f1(w));
      t.setAttribute('x', f1(left + 8)); t.setAttribute('y', f1(top + 15)); t.textContent = txt;
      g.setAttribute('opacity', '1');
    });
    if (list.length) {
      partsEl.replaceChildren(...PARTS.map((p, i) => el('li', `sx-pt p${i}`, `${p} · ${Math.round(parts[i])}`)));
    }
    const [w, d] = score.toFixed(1).split('.');
    $('whole').textContent = w;
    $('dec').textContent = `.${d}`;
  };
  // the light goes round once every ten seconds while the card is on screen, unless less motion is asked for
  let seen = false, spin = 0;
  const turn = (t) => {
    const [x, y] = at(((t / 10000) % 1) * 360, RP, 0);
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
