// The Library as one graph: the front page's hero (index.html, started by home.js). The body is the
// axis through the middle: its places in the Library's head-to-toe order, top to bottom. The four
// families of compounds gather around it, each fact-sheet line a dot beside its compound with a
// thread to its place on the axis (brighter threads cite two or more sources); the blood markers sit
// to one side in their lab panels. Sig, at the top of the axis, traces one compound at a time (or a
// blend, its parts together): it picks the compound, runs down the axis through each place the
// sheet names, and sends a pulse to every blood marker the sheet says may move there, which reads
// out as it lands (▲ may rise, ▼ may fall, ◆ worth checking; ! the sheet has a caution there).
// Pointing at a compound (or tapping it) traces that one, and clicking it opens its fact sheet;
// pointing at a place or a marker shows what the Library says about it. Typing in the search box
// lights up what matches. Where there's a Community Signal for what's traced, it shows in coral.
//
// Drawn with WebGL where there is WebGL 2 (soft glow, depth), otherwise on a 2D canvas; the labels
// are always on a 2D canvas on top. One still frame under reduced motion, which still answers
// pointing; paused off screen or in a hidden tab. The data is library/data/graph.json, written by
// scripts/graph.mjs from the Library (which also draws the still picture shown until this starts,
// with camera() and projectCloud() below, so the two line up).

// The camera: a slow turn around the body's axis, tipped a little toward the viewer
export const POSE = { yaw0: 0.45, t: 6.5 };
const F = 3.2, DRIFT = 0.006;
export function camera(t, yaw, px = 0, py = 0) {
  const Y = yaw + px * 0.22, pitch = 0.26 + 0.05 * Math.sin(t * 0.05) - py * 0.08;
  return { cy: Math.cos(Y), sy: Math.sin(Y), cp: Math.cos(pitch), sp: Math.sin(pitch) };
}
// Where each point lands, in units around the centre (x right, y down), how near it is (z, nearer is
// smaller) and its perspective scale. Points in drift[] sway a little; points off axis[] unfold by g
export function projectCloud(base, count, t, cam, g, drift, axis, out) {
  for (let i = 0; i < count; i++) {
    const d = drift(i) ? DRIFT : 0;
    let x = base[i * 3] + d * Math.sin(t * 0.6 + i * 1.7);
    const y = base[i * 3 + 1] + d * Math.cos(t * 0.5 + i * 2.3);
    let z = base[i * 3 + 2];
    if (g < 1 && !axis(i)) { x *= g; z *= g; }
    const x1 = x * cam.cy + z * cam.sy, z1 = -x * cam.sy + z * cam.cy;
    const y1 = y * cam.cp - z1 * cam.sp, z2 = y * cam.sp + z1 * cam.cp;
    const s = F / (F + z2 * 0.9);
    out.x[i] = x1 * s; out.y[i] = -y1 * s; out.z[i] = z2; out.s[i] = s;
  }
}
// Search text, folded as the Library's own search folds it (library/library.js)
export const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
// "the liver", but "blood sugar"
const BARE = new Set(['blood sugar', 'blood', 'fat', 'skin', 'hair', 'bone', 'muscle']);
const SAID = { 'urinary · genital': 'the urinary and genital organs', 'joints · fluid': 'the joints and joint fluid' };
export const placePhrase = (p) => SAID[p] || (BARE.has(p) ? p : 'the ' + p).replace(/ · /g, ' and ');

// Graphite: the graph is drawn in near-white on graphite, a slightly different tint per family
// (peptides, hormones, medications, supplements); blood markers in the Markers agent's colour and
// cautions in the Safety agent's (colour is a signature); Sig and its tracer near-white; lime only for
// the Community Signal's numbers. Points are discs: no glow, no bloom (the brand book)
export const FAM = [[238, 236, 230], [230, 222, 204], [204, 212, 216], [216, 224, 204]];
const BODY = [238, 236, 230], AMBER = [63, 224, 197], SIGC = [238, 236, 230], WHITE = [238, 236, 230];
const TXT = [238, 236, 230], DIM = [164, 169, 166], WARN = [255, 107, 91], CORAL = [216, 255, 61], EDGE = [196, 200, 198];
const GROUP = [FAM[0], FAM[1], FAM[2], FAM[3], BODY, AMBER];
const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';

export function startGraph(host, data, opts) {
  const o = Object.assign({
    cx: 0.6, cy: 0.5, unit: 0.27, unitH: 0, labelMinX: 0, top: 46, bottom: 40, still: false, labels: true, callouts: 4, caption: false, layout: null,
    spin: 0.07, yaw0: POSE.yaw0, gl: true, poster: null, intro: null, ask: null, links: null, avoid: null, onTrace: null,
    bg: { at: [0.68, 0.52], size: [0.52, 0.62], stops: ['#0E1316', '#0E1316', '#0E1316'] },
    font: '"Monaspace Neon", ui-monospace, SFMono-Regular, Menlo, monospace',
  }, opts || {});
  const intro = o.intro == null ? !o.poster : o.intro;
  const nC = data.counts.compounds, nP = data.counts.places, nM = data.counts.markers, nL = data.counts.lines;
  const P0 = nC, M0 = nC + nP, L0 = M0 + nM, SIG = L0 + nL, N = SIG + 1;
  const anchors = o.labels === false ? [] : data.anchors;
  const A0 = N, NA = N + anchors.length;
  // a faint shell of dust around the cloud, for depth (WebGL only)
  const DUST = 380, D0 = NA, ND = NA + DUST;
  const base = new Float32Array(ND * 3);
  for (let i = 0; i < N * 3; i++) base[i] = data.nodes[i] / 1000;
  anchors.forEach((a, k) => { base[(A0 + k) * 3] = a[0] / 1000; base[(A0 + k) * 3 + 1] = a[1] / 1000; base[(A0 + k) * 3 + 2] = a[2] / 1000; });
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const dustA = new Float32Array(DUST);
  for (let k = 0; k < DUST; k++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = 1.12 + Math.pow(rnd(), 0.7) * 0.85, q = Math.sqrt(1 - u * u);
    base[(D0 + k) * 3] = Math.cos(th) * q * r; base[(D0 + k) * 3 + 1] = u * r * 0.8; base[(D0 + k) * 3 + 2] = Math.sin(th) * q * r;
    dustA[k] = 0.35 + rnd() * 0.65;
  }
  const lineC = data.lineC, lineP = data.lineP, lineOp = data.lineOp, famOf = data.famOf, lm = data.lm, wM = data.markerW;
  const lineSrc = data.lineSrc || lineC.map(() => 1);
  const ids = data.ids || data.names.c, finds = data.find || data.names.c.map(fold);
  const stacks = data.stacks || [];
  const wC = new Float32Array(nC), wP = new Float32Array(nP);
  const linesOf = Array.from({ length: nC }, () => []);
  const lmOf = Array.from({ length: nL }, () => []);
  for (let l = 0; l < nL; l++) { wC[lineC[l]]++; wP[lineP[l]]++; linesOf[lineC[l]].push(l); }
  for (let k = 0; k < lm.length; k += 3) lmOf[lm[k]].push(lm[k + 1], lm[k + 2]);
  // What the Library says per place (compounds, cautions, markers) and per marker (compounds, which way)
  const placeComp = Array.from({ length: nP }, () => new Set()), placeWarn = new Int32Array(nP);
  for (let l = 0; l < nL; l++) { placeComp[lineP[l]].add(lineC[l]); if (lineOp[l] === 5) placeWarn[lineP[l]]++; }
  const placeMk = Array.from({ length: nP }, () => []);
  for (let k = 0; k < data.pm.length; k += 2) placeMk[data.pm[k]].push(data.pm[k + 1]);
  const markerComp = Array.from({ length: nM }, () => new Map());
  for (let k = 0; k < lm.length; k += 3) markerComp[lm[k + 1]].set(lineC[lm[k]], lm[k + 2]);
  const compPlaces = linesOf.map((ls) => new Set(ls.map((l) => lineP[l])).size);
  const compWarn = linesOf.map((ls) => ls.filter((l) => lineOp[l] === 5).length);
  const MARKERS = data.anchors.findIndex((a) => a[4] === 5);
  const byId = new Map(ids.map((id, c) => [id, { kind: 'c', i: c }]));
  stacks.forEach((s, k) => byId.set(s.id, { kind: 's', i: k }));
  const byName = new Map(data.names.c.map((n, c) => [n.toLowerCase(), { kind: 'c', i: c }]));
  stacks.forEach((s, k) => byName.set(s.name.toLowerCase(), { kind: 's', i: k }));

  // ----- The surfaces: a WebGL canvas for the cloud (or nothing), a 2D canvas on top -----
  const layer = document.createElement('div');
  const cv = document.createElement('canvas'), lab = document.createElement('canvas');
  for (const el of [layer, cv, lab]) Object.assign(el.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
  cv.setAttribute('aria-hidden', 'true'); lab.setAttribute('aria-hidden', 'true');
  layer.className = 'graph-live';
  layer.append(cv, lab);
  if (o.poster && o.poster.parentNode === host) o.poster.after(layer); else host.prepend(layer);
  const lctx = lab.getContext('2d');
  let gl = o.gl ? makeGL(cv, o.bg) : null;
  let mode = gl ? 'gl' : '2d';
  if (!gl) cv.style.display = 'none';
  const toFlat = () => { if (gl) gl.destroy(); gl = null; mode = '2d'; cv.style.display = 'none'; resize(); go(); };
  cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); toFlat(); });

  const sprite = (c, soft) => {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    if (!soft) { g.fillStyle = rgba(c, 1); g.beginPath(); g.arc(32, 32, 10, 0, Math.PI * 2); g.fill(); }
    return s;
  };
  let sp = null;
  const sprites = () => sp || (sp = { fam: FAM.map((c) => sprite(c)), body: sprite(BODY), amber: sprite(AMBER), sig: sprite(SIGC), haze: GROUP.map((c) => sprite(c, true)), white: sprite(WHITE) });

  // Where each point lands on screen this frame
  const sx = new Float32Array(ND), sy = new Float32Array(ND), sz = new Float32Array(ND), ss = new Float32Array(ND);
  const proj = { x: new Float32Array(ND), y: new Float32Array(ND), z: sz, s: ss };
  const flash = new Float32Array(nM), ripple = new Float32Array(nM), flare = new Float32Array(nP), lit = new Float32Array(nL);
  const spots = new Uint8Array(nC);
  const lightT = new Uint8Array(nC), lightF = new Float32Array(nC);
  let lightOn = false, lightAmt = 0, lightK = 1;
  const signal = new Map();

  let W = 0, H = 0, dpr = 1, maxDpr = Math.min(2, window.devicePixelRatio || 1);
  let avoid = [];
  const resize = () => {
    // the page may lay the graph out differently at this size (its centre, unit, call-outs)
    if (o.layout) Object.assign(o, o.layout());
    W = host.clientWidth; H = host.clientHeight;
    // sharp on a retina screen, but no more than about six million pixels drawn
    dpr = Math.max(1, Math.min(maxDpr, Math.sqrt(6e6 / Math.max(1, W * H))));
    lab.width = Math.max(1, Math.round(W * dpr)); lab.height = Math.max(1, Math.round(H * dpr));
    if (gl) gl.resize(Math.max(1, Math.round(W * dpr)), Math.max(1, Math.round(H * dpr)), W, H, dpr);
    avoid = o.avoid ? o.avoid() : [];
    if (stillMode()) drawStill();
  };
  const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const stillMode = () => o.still || (reduce && reduce.matches);

  // ----- Pointing: what's under the pointer (or was tapped), and what's asked for from outside -----
  let pointer = null, pinned = null, hover = null, hoverT0 = 0, held = null, heldBy = '', frozen = false;
  let px = 0, py = 0, tx = 0, ty = 0;
  const idx = (h) => (h.kind === 'c' ? h.i : h.kind === 'p' ? P0 + h.i : M0 + h.i);
  const same = (a, b) => (!a && !b) || (a && b && a.kind === b.kind && a.i === b.i);
  function hitAt(x, y, R) {
    let best = null, bd = R;
    const look = (i, kind, k) => {
      if (sx[i] < W * o.labelMinX) return;
      const d = Math.hypot(sx[i] - x, sy[i] - y) - 3 * ss[i] * K;
      if (d < bd || (best && d === bd && sz[i] < sz[idx(best)])) { bd = d; best = { kind, i: k }; }
    };
    for (let c = 0; c < nC; c++) look(c, 'c', c);
    for (let p = 0; p < nP; p++) look(P0 + p, 'p', p);
    for (let m = 0; m < nM; m++) look(M0 + m, 'm', m);
    return best;
  }

  // ----- Turning: a slow turn around the body's axis that slows while something is looked at -----
  let yaw = o.yaw0, spinRate = 1, lastT = -1, introT0 = -1, start = -1;
  const INTRO = 1700;
  let K = 1, U = 1, CX = 0, CY = 0;
  const unfoldAt = (now) => (stillMode() || !intro || introT0 < 0 ? 1 : Math.min(1, (now - introT0) / INTRO));
  const drifts = (i) => i < nC || (i >= L0 && i < SIG) || i >= D0;
  const onAxis = (i) => (i >= P0 && i < M0) || i === SIG;
  function project(t, now) {
    const dt = lastT < 0 ? 0 : Math.min(0.1, Math.max(0, t - lastT));
    lastT = t;
    const want = hover || held || frozen ? 0.12 : 1;
    spinRate += (want - spinRate) * Math.min(1, dt * 2.5);
    if (!stillMode()) yaw += dt * o.spin * spinRate;
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    // the unit: a share of the width, or of the height where that's smaller
    U = Math.min(W * o.unit, o.unitH > 0 ? H * o.unitH : Infinity); CX = W * o.cx; CY = H * o.cy;
    K = Math.max(0.55, Math.min(1.15, U / 330));
    // on load (without a still picture first), everything unfolds outward from the axis
    const e = unfoldAt(now), g = 0.04 + 0.96 * (1 - Math.pow(1 - e, 3));
    projectCloud(base, mode === 'gl' ? ND : NA, t, camera(t, yaw, px, py), g, drifts, onAxis, proj);
    for (let i = 0, n = mode === 'gl' ? ND : NA; i < n; i++) { sx[i] = CX + proj.x[i] * U; sy[i] = CY + proj.y[i] * U; }
  }
  // nearer is brighter
  const near = (i) => Math.max(0.28, Math.min(1, 0.66 - sz[i] * 0.42));

  // ----- Sig's trace: one compound, or a blend's parts together -----
  const tour = data.tour;
  let tourK = 0, trace = null;
  const pulses = [], callouts = [], tags = [];
  const dist = (a, b) => Math.hypot(base[a * 3] - base[b * 3], base[a * 3 + 1] - base[b * 3 + 1], base[a * 3 + 2] - base[b * 3 + 2]);
  const target = (k) => (k >= 0 ? { kind: 'c', i: k } : { kind: 's', i: -k - 1 });
  function makeTrace(tg, now, user) {
    const parts = tg.kind === 's' ? stacks[tg.i].parts : [tg.i];
    const byP = new Map();
    for (const c of parts) for (const l of linesOf[c]) {
      let e = byP.get(lineP[l]);
      if (!e) byP.set(lineP[l], (e = { ls: [], by: new Set() }));
      e.ls.push(l); e.by.add(c);
    }
    // head to toe: down the axis
    const stops = [...byP.entries()].sort((a, b) => a[0] - b[0]).map(([p, e]) => {
      const mk = new Map();
      for (const l of e.ls) for (let k = 0; k < lmOf[l].length; k += 2) mk.set(lmOf[l][k], lmOf[l][k + 1]);
      return { p, ls: e.ls, by: e.by.size, mk: [...mk.entries()], warn: e.ls.some((l) => lineOp[l] === 5), shown: false };
    });
    // Sig picks the compound (each part of a blend in turn; quicker when someone asked), then runs to each place
    const picks = [];
    let t = now + (user ? 60 : 150), from = SIG;
    for (const c of parts) {
      const dur = (user ? 300 : 450) + dist(from, c) * (from === SIG ? 380 : 300);
      picks.push({ from, to: c, go: t, dur, kind: from === SIG ? 0 : 2 });
      t += dur + (parts.length > 1 ? 80 : 0); from = c;
    }
    t += 160;
    let prev = parts[parts.length - 1];
    for (const st of stops) {
      const fromC = prev < nC;
      st.from = prev; st.go = t; st.dur = fromC ? 400 + dist(prev, P0 + st.p) * 420 : 240 + dist(prev, P0 + st.p) * 900;
      st.kind = fromC ? 1 : 2;
      t += st.dur; st.at = t; t += parts.length > 1 ? 300 : 360; prev = P0 + st.p;
    }
    // call-outs go on the side away from the blood markers, for the whole trace
    const mx = MARKERS >= 0 && A0 + MARKERS < NA ? sx[A0 + MARKERS] : CX + 1;
    return {
      tg, parts, c: parts[0], stack: tg.kind === 's' ? tg.i : -1, user, picks, stops, t0: now, end: t + 1700, out: t + 2400,
      side: mx > sx[P0] ? -1 : 1, warn: parts.reduce((s, c) => s + compWarn[c], 0), shared: stops.filter((s) => s.by > 1).length,
    };
  }
  const isHeld = (tr) => frozen || same(held, tr.tg) || (tr.tg.kind === 'c' && hover && hover.kind === 'c' && hover.i === tr.tg.i);
  function begin(tg, now, user) {
    trace = makeTrace(tg, now, user);
    spots.fill(0);
    for (const c of trace.parts) spots[c] = 1;
    callouts.length = 0; pulses.length = 0; tags.length = 0;
    lit.fill(0);
    told();
  }
  const ready = (now) => !intro || introT0 < 0 || now > introT0 + INTRO * 0.7;
  function stepTrace(now) {
    if (!ready(now)) return;
    // keep a trace someone is looking at on screen; let it go a moment after they look away
    if (trace && trace.user && isHeld(trace)) { if (now > trace.end - 60) { trace.end = now + 60; trace.out = now + 760; } }
    if (!trace || now > trace.out + 300) {
      const was = trace;
      if (hover && hover.kind !== 'c') trace = null;
      else if (held) begin(held, now, true);
      else if (hover && hover.kind === 'c') begin({ kind: 'c', i: hover.i }, now, true);
      else if (lightOn) trace = null;
      else { begin(target(tour[tourK % tour.length]), now, false); tourK++; }
      if (was && !trace) { spots.fill(0); told(); }
    }
    if (!trace) return;
    for (const st of trace.stops) {
      if (st.shown || now < st.at) continue;
      st.shown = true;
      flare[st.p] = 1;
      for (const l of st.ls) lit[l] = 1;
      for (const [m, d] of st.mk) pulses.push({ from: P0 + st.p, m, d, t0: now, dur: 520 + dist(P0 + st.p, M0 + m) * 420 });
      callouts.push({ st, born: now });
      while (callouts.length > o.callouts) callouts.shift();
    }
  }
  const focusAt = (now) => (!trace ? 0 : now < trace.t0 + 400 ? (now - trace.t0) / 400 : now < trace.end ? 1 : Math.max(0, 1 - (now - trace.end) / (trace.out - trace.end)));
  // a place or a marker pointed at: how far its highlight has come on
  const hoverFocus = (now) => (hover && hover.kind !== 'c' ? Math.min(1, (now - hoverT0) / 260) : 0);
  function setHover(h, now) {
    if (same(h, hover)) return;
    hover = h;
    lab.style.cursor = h ? 'pointer' : '';
    if (h && h.kind === 'c') { if (!trace || trace.stack >= 0 || trace.c !== h.i) begin({ kind: 'c', i: h.i }, now, true); else trace.user = true; }
    else if (h) { hoverT0 = now; if (trace) { trace.end = Math.min(trace.end, now); trace.out = Math.min(trace.out, now + 380); } }
    told();
  }
  function updateHover(now) {
    if (frozen) return;
    let h = pinned;
    if (!h && pointer) {
      // hold on to what's pointed at while the pointer stays near it
      if (hover && !pinned && Math.hypot(sx[idx(hover)] - pointer.x, sy[idx(hover)] - pointer.y) < 22) h = hover;
      else h = hitAt(pointer.x, pointer.y, 12);
    }
    setHover(h, now);
  }

  // What's being shown, for the page around the graph (the Ask Sig link, the Signal card)
  let lastTold = '';
  function shown() {
    if (hover && hover.kind !== 'c') return hover.kind === 'p' ? { kind: 'p', name: data.names.p[hover.i], label: placePhrase(data.names.p[hover.i]) } : { kind: 'm', name: data.names.m[hover.i], label: data.names.m[hover.i] };
    if (!trace) return null;
    if (trace.stack >= 0) { const s = stacks[trace.stack]; return { kind: 's', id: s.id, name: s.name, full: s.full, label: s.name, parts: s.parts.map((c) => data.names.c[c]), signal: signal.get(s.id) }; }
    return { kind: 'c', id: ids[trace.c], name: data.names.c[trace.c], label: data.names.c[trace.c], signal: signal.get(ids[trace.c]) };
  }
  function told() {
    const s = shown(), key = s ? s.kind + ':' + s.name : '';
    if (key === lastTold) return;
    lastTold = key;
    askInfo = s;
    if (o.ask) {
      if (s) {
        o.ask.textContent = 'Ask Sig about ' + s.label;
        if (o.links && o.links.ask) o.ask.href = o.links.ask(s);
      }
    }
    if (o.onTrace) o.onTrace(s);
  }
  let askInfo = null, askBox = null;

  // ----- Drawing on a 2D canvas (without WebGL) -----
  const traceFam = (g) => trace && g < 4 && trace.parts.some((c) => famOf[c] === g);
  function drawHaze(ctx, focus) {
    // a soft glow behind each family and the markers, so each reads as a region
    const S = sprites();
    anchors.forEach((an, k) => {
      if (an[4] === 4) return;
      const i = A0 + k, r = 0.34 * U * ss[i];
      const on = traceFam(an[4]) ? 0.4 * focus : 0;
      ctx.globalAlpha = (0.16 + on) * near(i);
      ctx.drawImage(S.haze[an[4]], sx[i] - r, sy[i] - r, r * 2, r * 2);
    });
    ctx.globalAlpha = 1;
  }
  // a thread from a line's dot to its place on the axis: leaves sideways, then turns to the place
  const qx = (L, p) => sx[L] + (sx[p] - sx[L]) * 0.7, qy = (L, p) => sy[L] + (sy[p] - sy[L]) * 0.2;
  const lightOf = (c) => lightF[c] * lightAmt;
  function drawEdges(ctx, focus, hf) {
    const dim = 1 - 0.42 * Math.max(focus, hf, lightAmt);
    for (let f = 0; f < 4; f++) {
      for (let pass = 0; pass < 2; pass++) {
        // compound to its lines
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let l = 0; l < nL; l++) {
          const c = lineC[l];
          if (famOf[c] !== f || spots[c]) continue;
          const L = L0 + l;
          if ((sz[L] < 0) !== (pass === 0)) continue;
          ctx.moveTo(sx[c], sy[c]); ctx.lineTo(sx[L], sy[L]);
        }
        ctx.strokeStyle = rgba(FAM[f], (pass === 0 ? 0.16 : 0.08) * dim);
        ctx.stroke();
        // lines to the body: a brighter, thicker thread when the line cites two or more sources
        for (const strong of [false, true]) {
          ctx.lineWidth = strong ? 0.95 : 0.6;
          ctx.beginPath();
          for (let l = 0; l < nL; l++) {
            const c = lineC[l];
            if (famOf[c] !== f || spots[c] || (lineSrc[l] >= 2) !== strong) continue;
            const L = L0 + l, p = P0 + lineP[l];
            if ((sz[L] < 0) !== (pass === 0)) continue;
            ctx.moveTo(sx[L], sy[L]); ctx.quadraticCurveTo(qx(L, p), qy(L, p), sx[p], sy[p]);
          }
          ctx.strokeStyle = rgba(FAM[f], (pass === 0 ? 0.07 : 0.033) * (strong ? 2.3 : 1) * dim);
          ctx.stroke();
        }
      }
    }
    // relatives: compounds in the same Library category
    const cc = data.cc;
    ctx.lineWidth = 0.6;
    for (let f = 0; f < 4; f++) {
      ctx.beginPath();
      for (let k = 0; k < cc.length; k += 2) { const a = cc[k], b = cc[k + 1]; if (famOf[a] !== f) continue; ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]); }
      ctx.strokeStyle = rgba(FAM[f], 0.2 * dim);
      ctx.stroke();
    }
    // the body to the blood markers it carries, warming into amber
    const pm = data.pm;
    for (let k = 0; k < pm.length; k += 2) {
      const p = P0 + pm[k], m = M0 + pm[k + 1];
      const lit2 = hover && ((hover.kind === 'p' && hover.i === pm[k]) || (hover.kind === 'm' && hover.i === pm[k + 1])) ? hf : 0;
      const g = ctx.createLinearGradient(sx[p], sy[p], sx[m], sy[m]);
      g.addColorStop(0, rgba(BODY, 0.06 * dim + 0.3 * lit2));
      g.addColorStop(1, rgba(AMBER, 0.3 * near(m) * dim + 0.6 * lit2));
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.8 + lit2;
      ctx.beginPath(); ctx.moveTo(sx[p], sy[p]); ctx.lineTo(sx[m], sy[m]); ctx.stroke();
    }
    // the axis: the body, head to toe, with Sig at the top
    for (const [w, a] of [[4, 0.05], [1.1, 0.32]]) {
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(sx[P0], sy[P0]);
      for (let p = 1; p < nP; p++) ctx.lineTo(sx[P0 + p], sy[P0 + p]);
      ctx.strokeStyle = rgba(BODY, a);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx[SIG], sy[SIG]); ctx.lineTo(sx[P0], sy[P0]);
    ctx.strokeStyle = rgba(SIGC, 0.45);
    ctx.stroke();
    // what's traced: all its threads, bright (thicker where they cite more)
    if (trace && focus > 0) {
      for (const c of trace.parts) {
        for (const strong of [false, true]) {
          ctx.lineWidth = strong ? 1.4 : 0.9;
          ctx.beginPath();
          for (const l of linesOf[c]) {
            if ((lineSrc[l] >= 2) !== strong) continue;
            const L = L0 + l, p = P0 + lineP[l];
            ctx.moveTo(sx[c], sy[c]); ctx.lineTo(sx[L], sy[L]); ctx.quadraticCurveTo(qx(L, p), qy(L, p), sx[p], sy[p]);
          }
          ctx.strokeStyle = rgba(FAM[famOf[c]], (strong ? 0.6 : 0.42) * focus);
          ctx.stroke();
        }
      }
    }
    // a place pointed at: every thread into it; a marker: every thread whose line names it; a search:
    // every thread of what it lit up
    const hp = hover && hover.kind !== 'c' && hf > 0;
    if (hp || lightAmt > 0.01) {
      for (let f = 0; f < 4; f++) {
        for (const [on, a] of [[(l) => hp && (hover.kind === 'p' ? lineP[l] === hover.i : lmOf[l].some((v, k) => k % 2 === 0 && v === hover.i)), 0.5 * hf], [(l) => lightT[lineC[l]] && !spots[lineC[l]], 0.4 * lightAmt * lightK]]) {
          if (a <= 0.005) continue;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          for (let l = 0; l < nL; l++) {
            const c = lineC[l];
            if (famOf[c] !== f || !on(l)) continue;
            const L = L0 + l, p = P0 + lineP[l];
            ctx.moveTo(sx[c], sy[c]); ctx.lineTo(sx[L], sy[L]); ctx.quadraticCurveTo(qx(L, p), qy(L, p), sx[p], sy[p]);
          }
          ctx.strokeStyle = rgba(FAM[f], a);
          ctx.stroke();
        }
      }
    }
  }

  const beat = (t) => 1 + 0.06 * Math.sin(t * 1.1);
  // how much a compound is lifted: by a place or marker pointed at, or by the search
  const liftOf = (c, hf) => Math.max(hover && hf > 0 && (hover.kind === 'p' ? placeComp[hover.i].has(c) : hover.kind === 'm' ? markerComp[hover.i].has(c) : false) ? hf : 0, lightOf(c));
  // the sizes and brightness of the points, shared by both ways of drawing
  const dotR = (l, on, L, dof) => (1.05 + on * 0.6) * ss[L] * Math.max(0.8, K) * dof;
  const dofOf = (i) => 1 + Math.max(0, sz[i] - 0.05) * 1.2;
  const lineOn = (l, focus) => (spots[lineC[l]] ? (0.45 + 0.55 * lit[l]) * focus : 0);
  const placeR = (p) => (1.8 + Math.sqrt(wP[p]) * 0.36) * ss[P0 + p] * K;
  const markerR = (m, t, on) => (2 + Math.sqrt(wM[m]) * 0.45) * ss[M0 + m] * K * (1 + 0.12 * Math.sin(t * 1.4 + m * 0.9)) * (1 + flash[m] * 0.7 + on * 0.5);
  const compR = (c, on) => (2 + wC[c] * 0.2) * ss[c] * K * (1 + on * 0.6);
  function drawNodes(ctx, t, focus, hf) {
    const S = sprites();
    const quiet = 1 - 0.3 * Math.max(focus, hf, lightAmt);
    // the lines: a dot each beside its compound; far ones softer and larger, like depth of field
    for (let l = 0; l < nL; l++) {
      const L = L0 + l, a = near(L), dof = dofOf(L), on = lineOn(l, focus), lt = lightOf(lineC[l]);
      ctx.globalAlpha = Math.min(1, ((0.6 * quiet) / dof) * a + on * 0.6 + lt * 0.35);
      ctx.fillStyle = on > 0.3 && lit[l] > 0.5 ? 'rgba(244,248,255,1)' : rgba(FAM[famOf[lineC[l]]], 1);
      ctx.beginPath(); ctx.arc(sx[L], sy[L], dotR(l, on, L, dof), 0, Math.PI * 2); ctx.fill();
    }
    // the places along the axis: white, sized by how much the Library says there
    for (let p = 0; p < nP; p++) {
      const i = P0 + p, r = placeR(p);
      const on = hover && hover.kind === 'p' && hover.i === p ? hf : 0;
      ctx.globalAlpha = (0.6 + flare[p] * 0.4 + on * 0.4) * near(i);
      ctx.drawImage(S.body, sx[i] - r * 3, sy[i] - r * 3, r * 6, r * 6);
      ctx.globalAlpha = 0.9 * near(i);
      ctx.drawImage(S.white, sx[i] - r * 0.6, sy[i] - r * 0.6, r * 1.2, r * 1.2);
      const ring = Math.max(flare[p], on);
      if (ring > 0.02) {
        ctx.globalAlpha = ring;
        ctx.strokeStyle = rgba(SIGC, 0.9);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(sx[i], sy[i], r * (1.6 + (1 - Math.max(flare[p], on * 0.7)) * 2.4), 0, Math.PI * 2); ctx.stroke();
      }
    }
    // blood markers: amber points that breathe; a pulse arriving makes one flare and ripple
    for (let m = 0; m < nM; m++) {
      const i = M0 + m, a = near(i);
      const on = hover && hover.kind === 'm' && hover.i === m ? hf : 0;
      const r = markerR(m, t, on);
      ctx.globalAlpha = Math.min(1, (0.8 + flash[m] * 0.5 + on * 0.4) * a);
      ctx.drawImage(S.amber, sx[i] - r * 3.2, sy[i] - r * 3.2, r * 6.4, r * 6.4);
      ctx.drawImage(S.white, sx[i] - r * 0.55, sy[i] - r * 0.55, r * 1.1, r * 1.1);
      const rp = Math.max(ripple[m], on * 0.6);
      if (rp > 0.02) {
        ctx.globalAlpha = rp * 0.8;
        ctx.strokeStyle = rgba(AMBER, 1);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(sx[i], sy[i], r * (1.4 + (1 - Math.max(ripple[m], on * 0.75)) * 3.4), 0, Math.PI * 2); ctx.stroke();
      }
    }
    // compounds
    for (let c = 0; c < nC; c++) {
      const on = spots[c] ? focus : liftOf(c, hf);
      const r = compR(c, on);
      ctx.globalAlpha = (0.85 * (1 - 0.2 * Math.max(focus, hf, lightAmt)) + on * 0.4) * near(c);
      ctx.drawImage(S.fam[famOf[c]], sx[c] - r * 3, sy[c] - r * 3, r * 6, r * 6);
      ctx.drawImage(S.white, sx[c] - r * 0.55, sy[c] - r * 0.55, r * 1.1, r * 1.1);
      if (on > 0.05) {
        ctx.globalAlpha = on * (spots[c] ? 1 : 0.7);
        ctx.strokeStyle = rgba(FAM[famOf[c]], 0.95);
        ctx.lineWidth = spots[c] ? 1.3 : 1;
        ctx.beginPath(); ctx.arc(sx[c], sy[c], r * 1.5, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // Sig, at the top of the axis
    const hr = 6 * ss[SIG] * K * beat(t);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(S.sig, sx[SIG] - hr * 4, sy[SIG] - hr * 4, hr * 8, hr * 8);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = rgba(SIGC, 0.95);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx[SIG], sy[SIG], hr * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(SIGC, 1);
    ctx.beginPath(); ctx.arc(sx[SIG], sy[SIG], hr * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // The tracer: a white comet; the markers' pulses: amber ones
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  function hopPoint(a, b, u, kind) {
    let hx, hy;
    if (kind === 1) { hx = sx[a] + (sx[b] - sx[a]) * 0.7; hy = sy[a] + (sy[b] - sy[a]) * 0.2; }
    else { const mx = (sx[a] + sx[b]) / 2, my = (sy[a] + sy[b]) / 2, dx = sx[b] - sx[a], dy = sy[b] - sy[a]; const bow = kind === 2 ? 0.08 : 0.2; hx = mx - dy * bow; hy = my + dx * bow; }
    const v = 1 - u;
    return [v * v * sx[a] + 2 * v * u * hx + u * u * sx[b], v * v * sy[a] + 2 * v * u * hy + u * u * sy[b]];
  }
  function comets(now, each) {
    if (!trace) return;
    for (const pk of trace.picks) if (now >= pk.go && now < pk.go + pk.dur) each(pk.from, pk.to, (now - pk.go) / pk.dur, pk.kind, SIGC, 1);
    const st = trace.stops.find((s) => now >= s.go && now < s.at);
    if (st) each(st.from, P0 + st.p, (now - st.go) / st.dur, st.kind, SIGC, 1);
    for (let q = pulses.length - 1; q >= 0; q--) {
      const pu = pulses[q], u = (now - pu.t0) / pu.dur;
      if (u >= 1) {
        // the marker reads out as the pulse lands
        flash[pu.m] = 1; ripple[pu.m] = 1;
        tags.push({ m: pu.m, d: pu.d, born: now });
        while (tags.length > 4) tags.shift();
        pulses.splice(q, 1);
        continue;
      }
      each(pu.from, M0 + pu.m, u, 0, AMBER, 0.75);
    }
  }
  function comet2d(ctx) {
    const S = sprites();
    return (a, b, u, kind, col, size) => {
      for (let k = 9; k >= 0; k--) {
        const [x, y] = hopPoint(a, b, ease(Math.max(0, u - k * 0.022)), kind);
        const r = (k === 0 ? 2.5 : 1.8 - k * 0.14) * size;
        ctx.globalAlpha = k === 0 ? 1 : 0.55 - k * 0.05;
        ctx.fillStyle = rgba(col, 1);
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); ctx.fill();
        if (k === 0) { ctx.globalAlpha = 0.75; ctx.drawImage(col === SIGC ? S.sig : S.amber, x - 11 * size, y - 11 * size, 22 * size, 22 * size); }
      }
      ctx.globalAlpha = 1;
    };
  }

  // ----- Drawing with WebGL: the same scene as lines and glowing points for the GPU -----
  const G = { lc: new Float32Array(4000 * 15), nlc: 0, ls: new Float32Array(4000 * 15), nls: 0, sp: new Float32Array(4000 * 10), nsp: 0 };
  const grow = (k, per) => { if ((G['n' + k] + 1) * per > G[k].length) { const b = new Float32Array(G[k].length * 2); b.set(G[k]); G[k] = b; } };
  function seg(k, ax, ay, cx2, cy2, bx, by, w, c1, a1, c2, a2) {
    if (a1 <= 0.002 && a2 <= 0.002) return;
    grow(k, 15);
    const b = G[k], j = G['n' + k]++ * 15;
    b[j] = ax; b[j + 1] = ay; b[j + 2] = bx; b[j + 3] = by; b[j + 4] = cx2; b[j + 5] = cy2; b[j + 6] = w;
    b[j + 7] = c1[0] / 255; b[j + 8] = c1[1] / 255; b[j + 9] = c1[2] / 255; b[j + 10] = a1;
    b[j + 11] = c2[0] / 255; b[j + 12] = c2[1] / 255; b[j + 13] = c2[2] / 255; b[j + 14] = a2;
  }
  const straight = (a, b, w, c1, a1, c2, a2) => seg('ls', sx[a], sy[a], (sx[a] + sx[b]) / 2, (sy[a] + sy[b]) / 2, sx[b], sy[b], w, c1, a1, c2 || c1, a2 == null ? a1 : a2);
  const curve = (L, p, w, c, a) => seg('lc', sx[L], sy[L], qx(L, p), qy(L, p), sx[p], sy[p], w, c, a, c, a);
  // kinds: 0 a glow, 1 a soft haze, 2 a disc (radius, softness), 3 a ring (radius, width)
  function spr(x, y, R, kind, c, a, p1, p2) {
    if (a <= 0.003 || R <= 0) return;
    grow('sp', 10);
    const b = G.sp, j = G.nsp++ * 10;
    b[j] = x; b[j + 1] = y; b[j + 2] = R; b[j + 3] = kind;
    b[j + 4] = c[0] / 255; b[j + 5] = c[1] / 255; b[j + 6] = c[2] / 255; b[j + 7] = Math.min(1, a);
    b[j + 8] = p1 || 0; b[j + 9] = p2 || 0;
  }
  const disc = (x, y, r, c, a, soft) => spr(x, y, r + (soft || 0) + 2, 2, c, a, r, soft || 0);
  const ring = (x, y, r, w, c, a) => spr(x, y, r + w + 2, 3, c, a, r, w);
  const GLOW = 0.86; // the bloom adds its own light, so the points' own glow is a little less
  function sceneGL(t, now, focus, hf) {
    G.nlc = G.nls = G.nsp = 0;
    const dim = 1 - 0.42 * Math.max(focus, hf, lightAmt);
    const quiet = 1 - 0.3 * Math.max(focus, hf, lightAmt);
    anchors.forEach((an, k) => {
      if (an[4] === 4) return;
      const i = A0 + k;
      spr(sx[i], sy[i], 0.34 * U * ss[i], 1, GROUP[an[4]], (0.16 + (traceFam(an[4]) ? 0.4 * focus : 0)) * near(i), 0, 0);
    });
    // dust, far behind and around: parallax as the cloud turns
    for (let k = 0; k < DUST; k++) {
      const i = D0 + k, a = (0.05 + 0.2 * Math.max(0, 0.7 - sz[i] * 0.5)) * dustA[k] * (0.75 + 0.25 * Math.sin(t * 0.7 + k));
      disc(sx[i], sy[i], 0.45 + 0.35 * ss[i], WHITE, a, 0.6);
    }
    const hp = hover && hover.kind !== 'c' && hf > 0;
    for (let l = 0; l < nL; l++) {
      const c = lineC[l], L = L0 + l, p = P0 + lineP[l], col = FAM[famOf[c]];
      if (spots[c]) continue;
      const front = sz[L] < 0, strong = lineSrc[l] >= 2;
      const extra = (hp && (hover.kind === 'p' ? lineP[l] === hover.i : lmOf[l].some((v, k) => k % 2 === 0 && v === hover.i)) ? 0.5 * hf : 0)
        + (lightT[c] ? 0.4 * lightAmt * lightK : 0);
      straight(c, L, extra > 0.05 ? 0.9 : 0.6, col, (front ? 0.16 : 0.08) * dim + extra);
      curve(L, p, extra > 0.05 ? 0.95 : strong ? 0.95 : 0.6, col, (front ? 0.07 : 0.033) * (strong ? 2.3 : 1) * dim + extra);
    }
    const cc = data.cc;
    for (let k = 0; k < cc.length; k += 2) straight(cc[k], cc[k + 1], 0.6, FAM[famOf[cc[k]]], 0.2 * dim);
    const pm = data.pm;
    for (let k = 0; k < pm.length; k += 2) {
      const p = P0 + pm[k], m = M0 + pm[k + 1];
      const lit2 = hover && ((hover.kind === 'p' && hover.i === pm[k]) || (hover.kind === 'm' && hover.i === pm[k + 1])) ? hf : 0;
      straight(p, m, 0.8 + lit2, BODY, 0.06 * dim + 0.3 * lit2, AMBER, 0.3 * near(m) * dim + 0.6 * lit2);
    }
    for (let p = 1; p < nP; p++) { straight(P0 + p - 1, P0 + p, 4, BODY, 0.05); straight(P0 + p - 1, P0 + p, 1.1, BODY, 0.32); }
    straight(SIG, P0, 1, SIGC, 0.45);
    if (trace && focus > 0) {
      for (const c of trace.parts) for (const l of linesOf[c]) {
        const strong = lineSrc[l] >= 2, a = (strong ? 0.6 : 0.42) * focus, w = strong ? 1.4 : 0.9, L = L0 + l;
        straight(c, L, w, FAM[famOf[c]], a);
        curve(L, P0 + lineP[l], w, FAM[famOf[c]], a);
      }
    }
    // points
    for (let l = 0; l < nL; l++) {
      const L = L0 + l, a = near(L), dof = dofOf(L), on = lineOn(l, focus), lt = lightOf(lineC[l]);
      const r = dotR(l, on, L, dof);
      disc(sx[L], sy[L], r, on > 0.3 && lit[l] > 0.5 ? [244, 248, 255] : FAM[famOf[lineC[l]]], Math.min(1, ((0.6 * quiet) / dof) * a + on * 0.6 + lt * 0.35), (dof - 1) * r * 1.4);
    }
    for (let p = 0; p < nP; p++) {
      const i = P0 + p, r = placeR(p), on = hover && hover.kind === 'p' && hover.i === p ? hf : 0;
      spr(sx[i], sy[i], r * 3, 0, BODY, (0.6 + flare[p] * 0.4 + on * 0.4) * near(i) * GLOW);
      spr(sx[i], sy[i], r * 0.6, 0, WHITE, 0.9 * near(i));
      const rg = Math.max(flare[p], on);
      if (rg > 0.02) ring(sx[i], sy[i], r * (1.6 + (1 - Math.max(flare[p], on * 0.7)) * 2.4), 1.2, SIGC, 0.9 * rg);
    }
    for (let m = 0; m < nM; m++) {
      const i = M0 + m, a = near(i), on = hover && hover.kind === 'm' && hover.i === m ? hf : 0, r = markerR(m, t, on);
      const al = Math.min(1, (0.8 + flash[m] * 0.5 + on * 0.4) * a);
      spr(sx[i], sy[i], r * 3.2, 0, AMBER, al * GLOW);
      spr(sx[i], sy[i], r * 0.55, 0, WHITE, al);
      const rp = Math.max(ripple[m], on * 0.6);
      if (rp > 0.02) ring(sx[i], sy[i], r * (1.4 + (1 - Math.max(ripple[m], on * 0.75)) * 3.4), 1, AMBER, rp * 0.8);
    }
    for (let c = 0; c < nC; c++) {
      const on = spots[c] ? focus : liftOf(c, hf), r = compR(c, on);
      const a = (0.85 * (1 - 0.2 * Math.max(focus, hf, lightAmt)) + on * 0.4) * near(c);
      // far compounds a little softer, like depth of field
      const dof = dofOf(c);
      spr(sx[c], sy[c], r * 3 * (0.9 + 0.1 * dof), 0, FAM[famOf[c]], a * GLOW);
      spr(sx[c], sy[c], r * 0.55 * dof, 0, WHITE, a / dof);
      if (on > 0.05) ring(sx[c], sy[c], r * 1.5, spots[c] ? 1.3 : 1, FAM[famOf[c]], on * (spots[c] ? 0.95 : 0.66));
    }
    const hr = 6 * ss[SIG] * K * beat(t);
    spr(sx[SIG], sy[SIG], hr * 4, 0, SIGC, 0.9 * GLOW);
    ring(sx[SIG], sy[SIG], hr * 1.5, 1.5, SIGC, 0.95);
    disc(sx[SIG], sy[SIG], hr * 0.7, SIGC, 1, 0);
    comets(now, (a, b, u, kind, col, size) => {
      for (let k = 9; k >= 0; k--) {
        const [x, y] = hopPoint(a, b, ease(Math.max(0, u - k * 0.022)), kind);
        disc(x, y, Math.max(0.5, (k === 0 ? 2.5 : 1.8 - k * 0.14) * size), col, k === 0 ? 1 : 0.55 - k * 0.05, 0.3);
        if (k === 0) spr(x, y, 11 * size, 0, col, 0.75);
      }
    });
  }

  // ----- Labels -----
  const MARK = { 1: '▲', '-1': '▼', 0: '◊' };
  const mono = (px2) => '500 ' + px2 + 'px ' + o.font;
  let taken = [];
  const clash = (x, y, w, h) => taken.some((b) => x < b[0] + b[2] + 6 && x + w + 6 > b[0] && y < b[1] + b[3] + 3 && y + h + 3 > b[1]);
  const inside = (x, y, w, h) => x >= W * o.labelMinX && x + w <= W - 8 && y >= o.top && y + h <= H - o.bottom;
  // a pill of coloured text runs [[text, colour], ...]: left edge at x (align -1), right edge (1) or
  // centred (0); moved up or down (or, centred, sideways) to stay clear of the others
  function pill(ctx, x, y, runs, border, a, align, fs) {
    ctx.font = mono(fs);
    const tw = runs.reduce((s, r) => s + ctx.measureText(r[0]).width, 0);
    const bw = tw + 16, bh = fs + 9;
    const bx0 = align === 1 ? x - bw : align === 0 ? x - bw / 2 : x, by0 = y - bh / 2;
    const tries = [[0, 0], [0, bh + 4], [0, -(bh + 4)]];
    if (align === 0) tries.push([bw / 2 + 14, 0], [-(bw / 2 + 14), 0]);
    let bx = 0, by = 0, ok = false;
    for (const [dx, dy] of tries) { bx = bx0 + dx; by = by0 + dy; if (inside(bx, by, bw, bh) && !clash(bx, by, bw, bh)) { ok = true; break; } }
    if (!ok) return null;
    taken.push([bx, by, bw, bh]);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(11,15,17,0.9)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, Math.min(8, bh / 2)); else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.strokeStyle = rgba(border, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textBaseline = 'middle';
    let cx2 = bx + 8;
    for (const [t, col] of runs) { ctx.fillStyle = rgba(col, 0.98); ctx.fillText(t, cx2, by + bh / 2 + 0.5); cx2 += ctx.measureText(t).width; }
    return [bx, by, bw, bh];
  }
  const sig1 = (id) => (signal.has(id) ? [['  Signal ' + signal.get(id).toFixed(1), CORAL]] : []);
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const stopRuns = (st, max) => {
    const runs = [[data.names.p[st.p], TXT]];
    if (trace && trace.parts.length > 1 && st.by > 1) runs.push(['  ' + (st.by === trace.parts.length ? (st.by === 2 ? 'both' : 'all ' + st.by) : st.by + ' of ' + trace.parts.length), SIGC]);
    // a place with a safety note carries the Safety agent's pip, never a "!" (page 9: safety informs, it never shouts)
    if (st.warn) runs.push([' •', WARN]);
    st.mk.slice(0, max).forEach(([m, d]) => runs.push(['  ' + data.names.m[m] + ' ' + MARK[d], AMBER]));
    if (st.mk.length > max) runs.push(['  +' + (st.mk.length - max), AMBER]);
    return runs;
  };
  const placeRuns = (p) => {
    const runs = [[data.names.p[p], TXT], ['  ' + wP[p] + ' lines from ' + plural(placeComp[p].size, 'compound', 'compounds'), DIM]];
    if (placeWarn[p]) runs.push(['  ! ' + placeWarn[p], WARN]);
    if (placeMk[p].length) runs.push(['  ' + data.names.m[placeMk[p][0]] + (placeMk[p].length > 1 ? ' +' + (placeMk[p].length - 1) : ''), AMBER]);
    return runs;
  };
  const markerRuns = (m) => {
    const ways = [0, 0, 0];
    for (const d of markerComp[m].values()) ways[d === 1 ? 0 : d === -1 ? 1 : 2]++;
    const runs = [[data.names.m[m], AMBER], ['  ' + plural(markerComp[m].size, 'compound', 'compounds'), DIM]];
    ['▲', '▼', '◆'].forEach((g, k) => { if (ways[k]) runs.push(['  ' + g + ' ' + ways[k], TXT]); });
    return runs;
  };
  const compRuns = (c) => [[data.names.c[c], FAM[famOf[c]]], ['  ' + plural(compPlaces[c], 'place', 'places') + (compWarn[c] ? ', ' + plural(compWarn[c], 'caution', 'cautions') : ''), DIM], ...sig1(ids[c])];
  // a blend: its parts, where they meet, and all their cautions
  const stackRuns = (tr) => {
    const s = stacks[tr.stack];
    return [[s.name, TXT], ['  ' + plural(tr.stops.length, 'place', 'places') + ', ' + tr.shared + ' shared' + (tr.warn ? ', ' + plural(tr.warn, 'caution', 'cautions') : ''), DIM], ...sig1(s.id)];
  };
  const headRuns = (tr) => (tr.stack >= 0 ? stackRuns(tr) : compRuns(tr.c));
  const outward = (i) => (sx[i] >= sx[P0] ? 1 : -1);
  // the Ask Sig link goes just under the pill it belongs to (or above it, if there's no room)
  function askUnder(ctx, box, align, a, fs) {
    if (!o.ask || !askInfo || !box || a < 0.05) return;
    ctx.font = mono(fs);
    const bw = ctx.measureText('Ask Sig about ' + askInfo.label).width + 16, bh = fs + 9;
    const x = align === 0 ? box[0] + box[2] / 2 - bw / 2 : align === 1 ? box[0] + box[2] - bw : box[0];
    for (const y of [box[1] + box[3] + 4, box[1] - bh - 4]) {
      if (inside(x, y, bw, bh) && !clash(x, y, bw, bh)) { taken.push([x, y, bw, bh]); askBox = [x, y, bw, bh, a, fs]; return; }
    }
  }
  function drawLabels(ctx, now, focus, hf) {
    taken = avoid.slice();
    askBox = null;
    const fs = 11;
    // Sig, beside its node
    pill(ctx, sx[SIG] + 12 * K + 6, sy[SIG], [['Ask Sig', SIGC]], SIGC, 1, -1, fs);
    if (o.caption) {
      // narrow screens: one line along the bottom, for what's pointed at or the place just reached
      let runs = null, a = 0;
      if (hover && hover.kind !== 'c' && hf > 0) { runs = hover.kind === 'p' ? placeRuns(hover.i) : markerRuns(hover.i); a = hf; }
      else if (trace && focus > 0.05) {
        const co = callouts[callouts.length - 1];
        const head = trace.stack >= 0 ? stacks[trace.stack].name : data.names.c[trace.c];
        runs = co ? [[head, trace.stack >= 0 ? TXT : FAM[famOf[trace.c]]], ['  ', TXT], ...stopRuns(co.st, W < 420 ? 1 : 2)] : headRuns(trace);
        // each new place comes in softly, from part-way, so the line never blinks out
        a = (co ? 0.35 + 0.65 * Math.min(1, (now - co.born) / 220) : 1) * focus;
        // once the whole trace has run, the summary
        if (co && now > trace.stops[trace.stops.length - 1].at + 900) { runs = headRuns(trace); a = focus; }
      }
      // the link under it stays steady while the line changes
      if (runs && a > 0.03) askUnder(ctx, pill(ctx, W / 2, H - o.bottom - 34, runs, EDGE, a, 0, fs), 0, hover && hover.kind !== 'c' ? hf : focus, fs);
    }
    if (trace && focus > 0.05) {
      // what's traced: its name and how far its sheet reaches, beside it on the outside (a blend's
      // summary beside its first part, and the other parts' names beside them)
      trace.parts.forEach((c, k) => {
        const right = outward(c) > 0;
        const runs = k === 0 && !o.caption ? headRuns(trace) : [[data.names.c[c], FAM[famOf[c]]]];
        const edge = k === 0 && trace.stack >= 0 ? EDGE : FAM[famOf[c]];
        // on the outside if there's room, otherwise on the inside
        let box = pill(ctx, sx[c] + (right ? 12 : -12), sy[c], runs, edge, focus, right ? -1 : 1, fs), side = right ? -1 : 1;
        if (!box) { box = pill(ctx, sx[c] + (right ? -12 : 12), sy[c], runs, edge, focus, right ? 1 : -1, fs); side = -side; }
        if (k === 0 && !o.caption) askUnder(ctx, box, side, focus, fs);
      });
      if (!o.caption) {
        // call-outs beside the axis, on the side away from the markers, each with a short leader
        for (const co of callouts) {
          const a = Math.min(1, (now - co.born) / 220) * focus;
          if (a < 0.03) continue;
          const i = P0 + co.st.p, side = trace.side;
          const box = pill(ctx, sx[i] + side * (14 + 6 * K), sy[i], stopRuns(co.st, 2), co.st.by > 1 ? SIGC : EDGE, a, side === 1 ? -1 : 1, fs);
          if (!box) continue;
          const lx = side === 1 ? box[0] : box[0] + box[2], ly = box[1] + box[3] / 2;
          ctx.globalAlpha = 0.55 * a;
          ctx.strokeStyle = 'rgba(236,242,255,0.85)';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(sx[i], sy[i]); ctx.lineTo(lx, ly); ctx.stroke();
        }
      }
      // read-outs at the markers as the pulses land
      for (const tg of tags) {
        const age = now - tg.born, a = Math.min(1, age / 180) * Math.min(1, Math.max(0, (2800 - age) / 500)) * focus;
        if (a < 0.03) continue;
        const i = M0 + tg.m, side = outward(i);
        pill(ctx, sx[i] + side * (8 * K + 6), sy[i], [[data.names.m[tg.m] + ' ' + MARK[tg.d], AMBER]], AMBER, a, side > 0 ? -1 : 1, fs - 1);
      }
    }
    // a place or a marker pointed at: what the Library says about it
    if (hover && hover.kind !== 'c' && hf > 0 && !o.caption) {
      const i = idx(hover), side = hover.kind === 'p' ? (sx[A0 + Math.max(0, MARKERS)] > sx[P0] ? -1 : 1) : outward(i);
      const box = pill(ctx, sx[i] + side * (14 + 6 * K), sy[i], hover.kind === 'p' ? placeRuns(hover.i) : markerRuns(hover.i), hover.kind === 'p' ? EDGE : AMBER, hf, side === 1 ? -1 : 1, fs);
      if (box) {
        ctx.globalAlpha = 0.6 * hf;
        ctx.strokeStyle = 'rgba(236,242,255,0.85)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(sx[i], sy[i]); ctx.lineTo(side === 1 ? box[0] : box[0] + box[2], box[1] + box[3] / 2); ctx.stroke();
        askUnder(ctx, box, side === 1 ? -1 : 1, hf, fs);
      }
    }
    // the groups, kept off the axis
    const top = Math.min(sy[SIG], sy[P0]), bot = sy[P0 + nP - 1];
    taken.push([sx[P0] - 5, top, 10, bot - top]);
    anchors.forEach((an, k) => {
      const g = an[4], dimmed = (trace && g < 4 && !traceFam(g) ? 1 - 0.25 * focus : 1) * (1 - 0.3 * Math.max(hf, lightAmt));
      pill(ctx, sx[A0 + k], sy[A0 + k], [[an[3], GROUP[g]]], GROUP[g], (0.75 + 0.25 * near(A0 + k)) * dimmed, 0, fs);
    });
    ctx.globalAlpha = 1;
    placeAsk();
  }
  // the link itself is the page's own element, moved to where its place was kept
  let askShown = false;
  function placeAsk() {
    const el = o.ask;
    if (!el) return;
    const on = !!askBox;
    if (on) {
      const [x, y, w, h, a, fs] = askBox;
      el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
      el.style.height = h + 'px'; el.style.lineHeight = h + 'px'; el.style.fontSize = fs + 'px'; el.style.minWidth = Math.ceil(w) + 'px';
      el.style.opacity = String(Math.min(1, a));
    }
    if (on !== askShown) { el.hidden = !on; askShown = on; }
  }

  let lastNow = 0;
  function draw(t, now) {
    project(t, now);
    const dt = Math.min(100, Math.max(0, now - lastNow)) / 1000;
    // the search's light comes on and goes off softly
    lightAmt += ((lightOn ? 1 : 0) - lightAmt) * (stillMode() ? 1 : Math.min(1, dt * 8));
    for (let c = 0; c < nC; c++) lightF[c] += (lightT[c] - lightF[c]) * (stillMode() ? 1 : Math.min(1, dt * 8));
    const focus = focusAt(now), hf = hoverFocus(now);
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.clearRect(0, 0, W, H);
    if (mode === 'gl') {
      sceneGL(t, now, focus, hf);
      gl.render(G);
    } else {
      drawHaze(lctx, focus);
      drawEdges(lctx, focus, hf);
      drawNodes(lctx, t, focus, hf);
      comets(now, comet2d(lctx));
    }
    if (o.labels !== false) drawLabels(lctx, now, focus, hf);
    lastNow = now;
    for (let p = 0; p < nP; p++) flare[p] *= Math.pow(0.25, dt);
    for (let m = 0; m < nM; m++) { flash[m] *= Math.pow(0.3, dt); ripple[m] = Math.max(0, ripple[m] - dt * 1.1); }
  }
  // The still frame: a whole trace (of what's asked for, or Sig's first), every place reached and
  // every marker read out; or, for a place or a marker pointed at, what the Library says about it
  function drawStill() {
    if (!W) return;
    yaw = o.yaw0; lastT = -1;
    project(POSE.t, 0);
    const tg = held || (hover && hover.kind === 'c' ? { kind: 'c', i: hover.i } : null) || (lightOn ? null : target(tour[0]));
    const showTrace = tg && !(hover && hover.kind !== 'c');
    trace = null; callouts.length = 0; pulses.length = 0; tags.length = 0; lit.fill(0); flare.fill(0); flash.fill(0); ripple.fill(0); spots.fill(0);
    let now = 1000;
    if (showTrace) {
      trace = makeTrace(tg, 1000, true);
      for (const c of trace.parts) spots[c] = 1;
      const st = trace.stops;
      now = st[st.length - 1].at + 600;
      trace.end = now + 1; trace.out = now + 2;
      const rank = (s) => (s.by > 1 ? 4 : 0) + (s.mk.length ? 2 : 0) + (s.warn ? 1 : 0);
      [...st].sort((a, b) => rank(b) - rank(a) || a.p - b.p).slice(0, o.caption ? 1 : o.callouts).sort((a, b) => a.p - b.p).forEach((s) => callouts.push({ st: s, born: now - 1000 }));
      for (const s of st) { s.shown = true; flare[s.p] = 0.3; for (const l of s.ls) lit[l] = 1; for (const [m, d] of s.mk) { flash[m] = 0.6; tags.push({ m, d, born: now - 1000 }); } }
      while (tags.length > 4) tags.shift();
    } else hoverT0 = now - 1000;
    told();
    lastNow = now;
    draw(POSE.t, now);
    showLive();
  }

  // Shown over the still picture once the first frame is drawn
  let live = false;
  function showLive() {
    if (live) return;
    live = true;
    if (!o.poster) return;
    layer.style.opacity = '0';
    layer.style.transition = 'opacity .6s ease';
    requestAnimationFrame(() => { layer.style.opacity = '1'; });
    setTimeout(() => { if (alive) o.poster.style.visibility = 'hidden'; }, 700);
  }

  let raf = 0, visible = true, alive = true, slow = 0, frames = 0, drawMs = 0, primed = false;
  const loop = (now) => {
    raf = 0;
    if (!alive || !visible || document.hidden || stillMode()) return;
    const t0 = performance.now();
    if (start < 0) start = now;
    if (introT0 < 0) introT0 = now;
    const t = POSE.t + (now - start) / 1000;
    // the trace picks its side from where things are on screen, so place them once first
    if (!primed) { project(t, now); primed = true; }
    updateHover(now);
    stepTrace(now);
    draw(t, now);
    if (intro) { const e = unfoldAt(now); layer.style.opacity = e < 1 ? String(Math.min(1, e * 1.7)) : ''; }
    showLive();
    drawMs = performance.now() - t0;
    // a slow device draws at its own pixel size instead of retina
    if (drawMs > 14) slow++;
    if (++frames === 90) { if (slow > 45 && maxDpr > 1) { maxDpr = 1; resize(); } frames = 0; slow = 0; }
    raf = requestAnimationFrame(loop);
  };
  const go = () => { if (!raf && alive && visible && !document.hidden && !stillMode()) raf = requestAnimationFrame(loop); };
  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  const io = new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; go(); });
  io.observe(host);
  const onVis = () => go();
  document.addEventListener('visibilitychange', onVis);
  const onMotion = () => { if (stillMode()) { layer.style.opacity = ''; drawStill(); } else { trace = null; go(); } };
  if (reduce && reduce.addEventListener) reduce.addEventListener('change', onMotion);
  resize();
  if (stillMode()) drawStill(); else { if (intro) layer.style.opacity = '0'; go(); }
  // the labels' font may arrive after the first still frame
  if (document.fonts && document.fonts.load) document.fonts.load(mono(11)).then(() => { if (alive && stillMode()) drawStill(); }, () => {});
  // in the still frame, pointing redraws it
  const still = () => {
    if (!stillMode() || frozen) return;
    const h = pinned || (pointer ? hitAt(pointer.x, pointer.y, 12) : null);
    if (!same(h, hover)) { hover = h; lab.style.cursor = h ? 'pointer' : ''; drawStill(); }
  };
  const find = (key) => byId.get(String(key || '')) || byName.get(String(key || '').toLowerCase()) || null;
  function holdTarget(tg, by) {
    held = tg; heldBy = by;
    if (stillMode()) { drawStill(); return; }
    const now = performance.now();
    if (tg && trace && same(trace.tg, tg)) trace.user = true;
    else if (tg && ready(now)) begin(tg, now, true);
  }
  const urlOf = (h) => {
    if (!h || !o.links) return null;
    if (h.kind === 'c') return o.links.sheet ? o.links.sheet(ids[h.i]) : null;
    const info = h.kind === 'p' ? { kind: 'p', name: data.names.p[h.i], label: placePhrase(data.names.p[h.i]) } : { kind: 'm', name: data.names.m[h.i], label: data.names.m[h.i] };
    return o.links.ask ? o.links.ask(info) : null;
  };
  return {
    // the element that pointing happens on
    surface: lab,
    get mode() { return mode; },
    // x, y: the pointer on the graph, in CSS pixels (over: false when it's over something laid on
    // top, which only tilts the cloud)
    pointerAt(x, y, over = true) {
      pointer = over ? { x, y } : null;
      tx = Math.max(-1, Math.min(1, (x / (W || 1)) * 2 - 1)); ty = Math.max(-1, Math.min(1, (y / (H || 1)) * 2 - 1));
      still();
    },
    pointerOut() { pointer = null; tx = 0; ty = 0; still(); },
    // a click: where it leads (a compound's fact sheet; a place or a marker, Sig's answer). A tap on
    // a touch screen first traces or points; tapping the same dot again leads on
    activate(x, y, touch) {
      const h = hitAt(x, y, touch ? 22 : 12);
      if (!touch) return urlOf(h);
      if (!h) { pinned = null; if (heldBy === 'tap') held = null; if (stillMode()) { hover = null; drawStill(); } return null; }
      const again = h.kind === 'c' ? held && held.kind === 'c' && held.i === h.i : same(pinned, h);
      if (again) return urlOf(h);
      if (h.kind === 'c') { pinned = null; holdTarget({ kind: 'c', i: h.i }, 'tap'); }
      else { pinned = h; if (heldBy === 'tap') held = null; if (stillMode()) { hover = h; drawStill(); } else setHover(h, performance.now()); }
      return null;
    },
    // a chip outside the graph asks Sig to trace a compound or a blend (by id or name) until it lets go
    hold(key) { const tg = find(key); if (tg) holdTarget(tg, 'chip'); },
    release() { if (heldBy !== 'search') { held = null; heldBy = ''; if (stillMode()) drawStill(); } },
    // the pointer is over the Ask Sig link: keep what it belongs to
    keep(on) { frozen = !!on; },
    // the search box: light up what matches, as the Library's own search would match it; one
    // compound or one blend by name, and Sig traces it
    light(q) {
      const terms = String(q || '').split(/\s+/).map(fold).filter(Boolean);
      lightT.fill(0);
      let n = 0, one = -1, stack = -1, stacksHit = 0;
      if (terms.join('').length >= 2) {
        for (let c = 0; c < nC; c++) if (terms.every((t) => finds[c].includes(t))) { lightT[c] = 1; n++; one = c; }
        stacks.forEach((s, k) => { if (terms.every((t) => s.find.includes(t))) { stacksHit++; stack = k; } });
        if (stacksHit === 1) for (const c of stacks[stack].parts) if (!lightT[c]) { lightT[c] = 1; n++; }
      }
      lightOn = n > 0;
      // many lit at once, each a little less bright
      lightK = Math.min(1, 2.5 / Math.sqrt(Math.max(1, n)));
      const tg = stacksHit === 1 ? { kind: 's', i: stack } : n === 1 ? { kind: 'c', i: one } : null;
      if (tg) holdTarget(tg, 'search');
      else if (heldBy === 'search') { held = null; heldBy = ''; if (stillMode()) drawStill(); }
      if (!tg && stillMode()) drawStill();
      go();
      return { lit: n, of: nC, traced: tg ? (tg.kind === 's' ? stacks[tg.i].name : data.names.c[tg.i]) : null };
    },
    // the Community Signal, from lib/dom.js's getSignal()
    setSignal(snap) {
      signal.clear();
      const all = snap && snap.signals;
      if (all) for (const id of [...ids, ...stacks.map((s) => s.id)]) {
        const v = all[id] && all[id].score;
        if (v != null && Number.isFinite(Number(v))) signal.set(id, Number(v));
      }
      lastTold = '';
      told();
      if (stillMode()) drawStill();
    },
    stats() {
      return { mode, drawMs: +drawMs.toFixed(2), dpr, lines: G.nlc + G.nls, points: G.nsp, tracing: trace ? (trace.stack >= 0 ? stacks[trace.stack].name : data.names.c[trace.c]) : null, hover: hover ? hover.kind + ':' + (hover.kind === 'c' ? data.names.c[hover.i] : hover.kind === 'p' ? data.names.p[hover.i] : data.names.m[hover.i]) : null, lit: lightOn ? [...lightT].reduce((s, v) => s + v, 0) : 0 };
    },
    // where a node is on the graph now (for tests)
    where(kind, name) { const list = kind === 'c' ? data.names.c : kind === 'p' ? data.names.p : data.names.m; const k = list.indexOf(name); if (k < 0) return null; const i = kind === 'c' ? k : kind === 'p' ? P0 + k : M0 + k; return [sx[i], sy[i]]; },
    destroy() {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (reduce && reduce.removeEventListener) reduce.removeEventListener('change', onMotion);
      if (gl) gl.destroy();
      layer.remove();
      if (o.poster) o.poster.style.visibility = '';
      if (o.ask) o.ask.hidden = true;
    },
  };
}

// ----- WebGL 2: lines as curved strips, points as glowing discs, then a bloom -----
const VS_LINE = `#version 300 es
precision highp float;
layout(location=0) in vec2 aT;
layout(location=1) in vec4 iAB;
layout(location=2) in vec3 iQW;
layout(location=3) in vec4 iC1;
layout(location=4) in vec4 iC2;
uniform vec2 uRes; uniform float uDpr;
out vec4 vC; out float vD; out float vHW; out float vK;
void main(){
  float t = aT.x;
  vec2 a = iAB.xy, b = iAB.zw, q = iQW.xy;
  vec2 p = mix(mix(a, q, t), mix(q, b, t), t);
  vec2 d = mix(q - a, b - q, t);
  float L = length(d);
  vec2 n = L > 1e-5 ? vec2(-d.y, d.x) / L : vec2(0.0, 1.0);
  float px = 1.0 / uDpr, w = iQW.z, wv = max(w, px);
  vK = w / wv; vHW = wv * 0.5;
  vD = aT.y * (vHW + px);
  p += n * vD;
  vC = mix(iC1, iC2, t);
  vec2 c = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;
const FS_LINE = `#version 300 es
precision highp float;
in vec4 vC; in float vD; in float vHW; in float vK;
uniform float uDpr;
out vec4 o;
void main(){
  float a = vC.a * clamp((vHW - abs(vD)) * uDpr + 0.5, 0.0, 1.0) * vK;
  o = vec4(vC.rgb * a, a);
}`;
const VS_SPRITE = `#version 300 es
precision highp float;
layout(location=0) in vec2 aQ;
layout(location=1) in vec4 iP;
layout(location=2) in vec4 iC;
layout(location=3) in vec2 iX;
uniform vec2 uRes;
out vec2 vP; out vec4 vC; out vec2 vX; out float vR; flat out int vK;
void main(){
  vP = aQ * iP.z; vC = iC; vX = iX; vR = iP.z; vK = int(iP.w + 0.5);
  vec2 c = (iP.xy + vP) / uRes * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;
const FS_SPRITE = `#version 300 es
precision highp float;
in vec2 vP; in vec4 vC; in vec2 vX; in float vR; flat in int vK;
uniform float uDpr;
out vec4 o;
void main(){
  float d = length(vP), u = d / vR, a;
  if (vK == 0) a = clamp((0.31 * vR - d) * uDpr + 0.5, 0.0, 1.0);
  else if (vK == 1) a = 0.0;
  else if (vK == 2) { float e = max(vX.y, 1.0 / uDpr); a = clamp((vX.x - d) / e + 0.5, 0.0, 1.0); }
  else { float w = max(vX.y, 1.0 / uDpr); a = clamp((w * 0.5 - abs(d - vX.x)) * uDpr + 0.5, 0.0, 1.0) * (vX.y / w); }
  a *= vC.a;
  o = vec4(vC.rgb * a, a);
}`;
const VS_FULL = `#version 300 es
out vec2 vUv;
void main(){ vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0); vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FS_BRIGHT = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uTexel;
in vec2 vUv; out vec4 o;
void main(){
  vec3 c = (texture(uTex, vUv + uTexel * vec2(-0.5, -0.5)).rgb + texture(uTex, vUv + uTexel * vec2(0.5, -0.5)).rgb
    + texture(uTex, vUv + uTexel * vec2(-0.5, 0.5)).rgb + texture(uTex, vUv + uTexel * vec2(0.5, 0.5)).rgb) * 0.25;
  float b = max(c.r, max(c.g, c.b));
  o = vec4(c * smoothstep(0.24, 0.62, b), 1.0);
}`;
const FS_BLUR = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uDir;
in vec2 vUv; out vec4 o;
void main(){
  o = texture(uTex, vUv) * 0.2270270270
    + (texture(uTex, vUv + uDir * 1.3846153846) + texture(uTex, vUv - uDir * 1.3846153846)) * 0.3162162162
    + (texture(uTex, vUv + uDir * 3.2307692308) + texture(uTex, vUv - uDir * 3.2307692308)) * 0.0702702703;
}`;
const FS_DOWN = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uTexel;
in vec2 vUv; out vec4 o;
void main(){
  o = (texture(uTex, vUv + uTexel * vec2(-0.5, -0.5)) + texture(uTex, vUv + uTexel * vec2(0.5, -0.5))
    + texture(uTex, vUv + uTexel * vec2(-0.5, 0.5)) + texture(uTex, vUv + uTexel * vec2(0.5, 0.5))) * 0.25;
}`;
const FS_OUT = `#version 300 es
precision highp float;
uniform sampler2D uScene, uB1, uB2;
uniform vec2 uRes, uAt, uSize; uniform vec3 uS0, uS1, uS2; uniform float uK1, uK2;
in vec2 vUv; out vec4 o;
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  float r = length((p - uAt * uRes) / (uSize * uRes));
  vec3 bg = r < 0.45 ? mix(uS0, uS1, r / 0.45) : mix(uS1, uS2, clamp((r - 0.45) / 0.55, 0.0, 1.0));
  vec3 c = texture(uScene, vUv).rgb + texture(uB1, vUv).rgb * uK1 + texture(uB2, vUv).rgb * uK2;
  vec3 e = max(c - 0.72, 0.0);
  c = c - e + 0.28 * (1.0 - exp(-e / 0.28));
  c += bg;
  c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  o = vec4(c, 1.0);
}`;
const BLOOM = false;
function makeGL(canvas, bg) {
  let g = null;
  try { g = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (e) { g = null; }
  if (!g) return null;
  const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; };
  const prog = (vs, fs) => {
    const p = g.createProgram();
    g.attachShader(p, sh(g.VERTEX_SHADER, vs)); g.attachShader(p, sh(g.FRAGMENT_SHADER, fs)); g.linkProgram(p);
    if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p));
    const u = {};
    for (let k = 0, n = g.getProgramParameter(p, g.ACTIVE_UNIFORMS); k < n; k++) { const name = g.getActiveUniform(p, k).name; u[name] = g.getUniformLocation(p, name); }
    return { p, u };
  };
  let P;
  try {
    P = { line: prog(VS_LINE, FS_LINE), sprite: prog(VS_SPRITE, FS_SPRITE), bright: prog(VS_FULL, FS_BRIGHT), blur: prog(VS_FULL, FS_BLUR), down: prog(VS_FULL, FS_DOWN), out: prog(VS_FULL, FS_OUT) };
  } catch (e) { return null; }
  // Half-float buffers let the light add up past white before it's eased back; 8 bits otherwise
  const half = !!g.getExtension('EXT_color_buffer_float') || !!g.getExtension('EXT_color_buffer_half_float');
  // a strip along t for curves (16 segments) and for straight lines (1)
  const strip = (n) => { const v = []; for (let k = 0; k <= n; k++) v.push(k / n, -1, k / n, 1); return new Float32Array(v); };
  const vao = (template, inst) => {
    const a = g.createVertexArray();
    g.bindVertexArray(a);
    const tb = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, tb); g.bufferData(g.ARRAY_BUFFER, template, g.STATIC_DRAW);
    g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
    const ib = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, ib);
    let off = 0;
    const stride = inst.reduce((s, n) => s + n, 0) * 4;
    inst.forEach((n, k) => { g.enableVertexAttribArray(k + 1); g.vertexAttribPointer(k + 1, n, g.FLOAT, false, stride, off); g.vertexAttribDivisor(k + 1, 1); off += n * 4; });
    g.bindVertexArray(null);
    return { a, ib, cap: 0 };
  };
  const curves = vao(strip(16), [4, 3, 4, 4]), straights = vao(strip(1), [4, 3, 4, 4]);
  const quads = vao(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), [4, 4, 2]);
  const empty = g.createVertexArray();
  const target = (w, h) => {
    const tex = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, tex);
    g.texImage2D(g.TEXTURE_2D, 0, half ? g.RGBA16F : g.RGBA8, w, h, 0, g.RGBA, half ? g.HALF_FLOAT : g.UNSIGNED_BYTE, null);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    const fb = g.createFramebuffer();
    g.bindFramebuffer(g.FRAMEBUFFER, fb);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
    return { tex, fb, w, h };
  };
  const drop = (t) => { if (t) { g.deleteTexture(t.tex); g.deleteFramebuffer(t.fb); } };
  const hex = (s) => [1, 3, 5].map((k) => parseInt(s.slice(k, k + 2), 16) / 255);
  const S = bg.stops.map(hex);
  let T = {}, cw = 1, ch = 1, W = 1, H = 1, dpr = 1;
  const upload = (v, data, n, per) => {
    g.bindBuffer(g.ARRAY_BUFFER, v.ib);
    const bytes = n * per * 4;
    if (bytes > v.cap) { v.cap = Math.max(bytes, v.cap * 2); g.bufferData(g.ARRAY_BUFFER, v.cap, g.DYNAMIC_DRAW); }
    g.bufferSubData(g.ARRAY_BUFFER, 0, data, 0, n * per);
  };
  const pass = (pr, to, setup) => {
    g.useProgram(pr.p);
    g.bindFramebuffer(g.FRAMEBUFFER, to ? to.fb : null);
    g.viewport(0, 0, to ? to.w : cw, to ? to.h : ch);
    setup(pr.u);
    g.bindVertexArray(empty);
    g.drawArrays(g.TRIANGLES, 0, 3);
  };
  const bind = (unit, tex) => { g.activeTexture(g.TEXTURE0 + unit); g.bindTexture(g.TEXTURE_2D, tex); };
  return {
    resize(w, h, cssW, cssH, d) {
      canvas.width = w; canvas.height = h; cw = w; ch = h; W = cssW; H = cssH; dpr = d;
      for (const k in T) drop(T[k]);
      const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1), qw = Math.max(1, w >> 2), qh = Math.max(1, h >> 2);
      T = { scene: target(w, h), h1: target(hw, hh), h2: target(hw, hh), q1: target(qw, qh), q2: target(qw, qh) };
    },
    render(G) {
      // the scene, added up as light
      g.bindFramebuffer(g.FRAMEBUFFER, T.scene.fb);
      g.viewport(0, 0, cw, ch);
      g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
      g.enable(g.BLEND); g.blendFunc(g.ONE, g.ONE);
      g.useProgram(P.line.p);
      g.uniform2f(P.line.u.uRes, W, H); g.uniform1f(P.line.u.uDpr, dpr);
      upload(straights, G.ls, G.nls, 15); g.bindVertexArray(straights.a); g.drawArraysInstanced(g.TRIANGLE_STRIP, 0, 4, G.nls);
      upload(curves, G.lc, G.nlc, 15); g.bindVertexArray(curves.a); g.drawArraysInstanced(g.TRIANGLE_STRIP, 0, 34, G.nlc);
      g.useProgram(P.sprite.p);
      g.uniform2f(P.sprite.u.uRes, W, H); g.uniform1f(P.sprite.u.uDpr, dpr);
      upload(quads, G.sp, G.nsp, 10); g.bindVertexArray(quads.a); g.drawArraysInstanced(g.TRIANGLE_STRIP, 0, 4, G.nsp);
      g.disable(g.BLEND);
      // no bloom (the brand has no glows): the scene goes straight out
      bind(0, T.scene.tex);
      if (BLOOM) pass(P.bright, T.h1, (u) => { g.uniform1i(u.uTex, 0); g.uniform2f(u.uTexel, 1 / cw, 1 / ch); });
      if (BLOOM) { bind(0, T.h1.tex); pass(P.blur, T.h2, (u) => { g.uniform1i(u.uTex, 0); g.uniform2f(u.uDir, 1 / T.h1.w, 0); });
      bind(0, T.h2.tex); pass(P.blur, T.h1, (u) => { g.uniform1i(u.uTex, 0); g.uniform2f(u.uDir, 0, 1 / T.h1.h); });
      bind(0, T.h1.tex); pass(P.down, T.q1, (u) => { g.uniform1i(u.uTex, 0); g.uniform2f(u.uTexel, 1 / T.h1.w, 1 / T.h1.h); });
      bind(0, T.q1.tex); pass(P.blur, T.q2, (u) => { g.uniform1i(u.uTex, 0); g.uniform2f(u.uDir, 1.6 / T.q1.w, 0); });
      bind(0, T.q2.tex); pass(P.blur, T.q1, (u) => { g.uniform1i(u.uTex, 0); g.uniform2f(u.uDir, 0, 1.6 / T.q1.h); }); }
      // the panel's own background, the scene and its glow
      bind(0, T.scene.tex); bind(1, T.h1.tex); bind(2, T.q1.tex);
      pass(P.out, null, (u) => {
        g.uniform1i(u.uScene, 0); g.uniform1i(u.uB1, 1); g.uniform1i(u.uB2, 2);
        g.uniform2f(u.uRes, W, H); g.uniform2f(u.uAt, bg.at[0], bg.at[1]); g.uniform2f(u.uSize, bg.size[0], bg.size[1]);
        g.uniform3fv(u.uS0, S[0]); g.uniform3fv(u.uS1, S[1]); g.uniform3fv(u.uS2, S[2]);
        g.uniform1f(u.uK1, BLOOM ? 0.62 : 0); g.uniform1f(u.uK2, BLOOM ? 0.5 : 0);
      });
    },
    destroy() { for (const k in T) drop(T[k]); T = {}; const x = g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
  };
}
