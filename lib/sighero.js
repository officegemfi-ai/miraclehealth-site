// The homepage's top (page 15 of the design canvas): the Community Signal, one compound at a time,
// and under it the Signal spectrum, every live Signal as one bar. The instrument is a ring of the
// Signal's four parts (what happened 65, agreement 15, voices 10, volume 10) with the score in its
// middle, the compound's name with a way to step to the next, what people report most, the level
// the Signal has reached and how strong the studies are, from its fact sheet. Each bar of the
// spectrum is stacked from the same four parts; the bars are grouped by kind, and picking one opens
// it above. The numbers are the live Signal's, the same version the rest of the page reads: home.js
// hands in what this needs, so this file imports nothing. People who ask for less motion get every
// number at once, and the ring's sweep holds still.
export function startSigHero(root, { getSignal, studies, meter, levels }) {
  if (!root) return;
  const doc = root.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (k) => root.querySelector(`[data-sx="${k}"]`);
  const el = (tag, cls, text) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ---- the ring, drawn once; its four arcs and their numbers change with the compound -----------
  const SPANS = [65, 15, 10, 10];
  const PARTS = ['what happened', 'agreement', 'voices', 'volume'];
  const COLS = ['#3D8BFF', '#7BB0FF', '#AACCFF', '#D4E5FF'];
  const S = 340, PAD = 38, TRACK = 22, SEG = 14, GAP = 2.8;
  const C = S / 2, R_TICK = C - PAD, R_BEZ = R_TICK - 10, R_TRK = R_BEZ - 6 - TRACK / 2, R_DISC = R_TRK - TRACK / 2 - 7, R_TAG = R_TICK + 19;
  const CAP = ((SEG / 2) / R_TRK) * (180 / Math.PI);
  let at = 0;
  const SEGS = SPANS.map((sp) => { const a0 = at, a1 = at + 3.6 * sp; at = a1; return [a0 + GAP / 2 + CAP, a1 - GAP / 2 - CAP, (a0 + a1) / 2]; });
  const f2 = (v) => v.toFixed(2);
  const pol = (r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
  const arc = (r, a0, a1) => {
    a1 = Math.max(a1, a0 + 0.01);
    const [x0, y0] = pol(r, a0), [x1, y1] = pol(r, a1);
    return `M${f2(x0)} ${f2(y0)}A${f2(r)} ${f2(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f2(x1)} ${f2(y1)}`;
  };
  const dashes = (r, w, n, dash, col) => `<circle r="${f2(r)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="${dash} ${(2 * Math.PI * r / n - dash).toFixed(3)}" stroke-dashoffset="${dash / 2}" transform="rotate(-90)"/>`;
  const ring = $('ring');
  const id = `sx${Math.random().toString(36).slice(2, 7)}`;
  let svg = `<svg class="sx-svg" viewBox="${-C} ${-C} ${S} ${S}" width="${S}" height="${S}" aria-hidden="true" focusable="false">`
    + `<defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3F4A"/><stop offset="1" stop-color="#08090B"/></linearGradient>`
    + `<radialGradient id="${id}d" cx="50%" cy="28%" r="78%"><stop offset="0" stop-color="#15171C"/><stop offset="1" stop-color="#040405"/></radialGradient>`
    + `<filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(SEG * 0.55).toFixed(1)}"/></filter></defs>`
    + dashes(R_TICK - 3, 6, 96, 1, 'rgba(255,255,255,0.13)') + dashes(R_TICK - 5, 10, 12, 1.8, 'rgba(255,255,255,0.34)')
    + `<circle r="${R_BEZ}" fill="none" stroke="url(#${id}b)" stroke-width="5"/>`
    + `<circle r="${R_TRK}" fill="none" stroke="#0A0A0B" stroke-width="${TRACK}"/>`
    + `<circle r="${R_TRK + TRACK / 2 - 2}" fill="none" stroke="rgba(0,0,0,0.55)" stroke-width="3"/>`
    + `<circle r="${R_DISC + 3}" fill="none" stroke="rgba(0,0,0,0.7)" stroke-width="5"/>`
    + `<circle r="${R_DISC}" fill="url(#${id}d)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  SEGS.forEach(([s0, s1, m], i) => {
    const col = COLS[i], [lx0, ly0] = pol(R_TICK + 2, m), [lx1, ly1] = pol(R_TAG - 12, m), [cx, cy] = pol(R_TAG, m);
    svg += `<path d="${arc(R_TRK, s0, s1)}" fill="none" stroke="${col}" stroke-opacity="0.14" stroke-width="${SEG}" stroke-linecap="round"/>`
      + `<path data-arc="${i}" d="M0 0" fill="none" stroke="${col}" stroke-opacity="0.34" stroke-width="${SEG}" stroke-linecap="round" filter="url(#${id}g)"/>`
      + `<path data-arc="${i}" d="M0 0" fill="none" stroke="${col}" stroke-width="${SEG}" stroke-linecap="round"/>`
      + `<line x1="${lx0.toFixed(1)}" y1="${ly0.toFixed(1)}" x2="${lx1.toFixed(1)}" y2="${ly1.toFixed(1)}" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>`
      + `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="11" fill="#000000" stroke="${col}" stroke-width="1.4"/>`
      + `<text data-tag="${i}" x="${cx.toFixed(1)}" y="${(cy + 0.5).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Monaspace Neon, ui-monospace, monospace" font-size="9" fill="${col}"></text>`;
  });
  const glow = ring.querySelector('.sx-glow');   // the drawing goes over its glow, under its sweep
  (glow || ring).insertAdjacentHTML(glow ? 'afterend' : 'afterbegin', `${svg}</svg>`);
  const arcs = [...ring.querySelectorAll('[data-arc]')], tags = [...ring.querySelectorAll('[data-tag]')];
  const drawRing = (parts, score) => {
    arcs.forEach((p) => { const i = +p.dataset.arc, [s0, s1] = SEGS[i]; p.setAttribute('d', arc(R_TRK, s0, s0 + ((s1 - s0) * Math.max(0, Math.min(100, parts[i]))) / 100)); });
    tags.forEach((t) => { t.textContent = list.length ? String(Math.round(parts[+t.dataset.tag])) : ''; });
    const [w, d] = score.toFixed(1).split('.');
    $('whole').textContent = w;
    $('dec').textContent = `.${d}`;
  };

  // ---- the live Signal: every compound, in the spectrum's order ---------------------------------
  const KINDS = [['peptide', 'peptides'], ['hormone', 'hormones'], ['medication', 'medications'], ['supplement', 'supplements']];
  const GRADE = ['anecdotal', 'animal and lab', 'limited', 'moderate', 'strong'];
  const GRADE_KEY = ['anecdotal', 'preclinical', 'limited', 'moderate', 'strong'];
  const lower = (s) => String(s || '').toLowerCase();
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  let list = [], pick = 0, shown = null, grades = new Map(), tween = 0;

  const meta = $('meta'), name = $('name'), summary = $('summary'), themesEl = $('themes'), themesK = $('themes-k'), level = $('level'), study = $('studies');
  function fill(i, { animate = false } = {}) {
    const c = list[i];
    pick = i;
    name.textContent = c.name;
    meta.textContent = `${c.kind} · ${c.conf ? `${c.conf} confidence · ` : ''}ranked ${c.rank} of ${list.length}`;
    summary.textContent = c.summary;
    root.querySelector('.sx-dial').setAttribute('aria-label', `${c.name}: Community Signal ${c.score.toFixed(1)} out of 100, ${c.summary}. ${PARTS.map((p, k) => `${p} ${c.parts[k]}`).join(', ')}.`);
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
    const pips = el('span', 'sx-pips');
    pips.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < levels.length; k++) pips.append(el('i', k <= lv ? 'on' : ''));
    level.replaceChildren(pips, el('span', '', `level ${lv + 1} of ${levels.length} · `), el('b', '', levels[lv].name));
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
  getSignal().then((snap) => {
    const all = snap?.signals || {};
    const rows = Object.entries(all).map(([cid, s]) => {
      const parts = [s.efficacy, s.consistency, s.diversity, s.confidence].map(num);
      if (num(s.score) == null || parts.some((v) => v == null)) return null;
      const kind = lower(s.kind) || 'compound', k = KINDS.findIndex(([x]) => x === kind);
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
    root.querySelector('.sx').removeAttribute('aria-busy');
    // the studies, from the fact sheets, once they're here
    Promise.resolve(studies).then((m) => { if (m && m.size) { grades = m; fill(pick); } }, () => {});
  }).catch(() => {
    summary.textContent = 'the live Signal didn’t load';
    root.querySelector('.sx-dial').setAttribute('aria-label', 'The Community Signal didn’t load. Try again in a minute.');
    meta.textContent = 'try again in a minute';
    root.querySelector('.sx').removeAttribute('aria-busy');
    root.classList.add('is-off');
  });
}
