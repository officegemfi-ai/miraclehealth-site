// The homepage's How it works: "The system behind one honest number" (page 18 of the design
// canvas). A spine you scroll down with a square that keeps your place; six numbered cards that
// come in as you reach them, their titles decoding and their line drawings moving; and at the end
// the Community Signal written in what people report. The numbers are the live Signal's, the same
// version the rest of the page reads (handed in by home.js, so this file imports nothing). Under
// reduced motion every card is there and still; nothing moves while the section is off screen.
export function startHow(root, getSignal) {
  if (!root) return () => {};
  const doc = root.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const now = () => (win.__mhClock != null ? win.__mhClock : win.performance.now());
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  const easeIO = (x) => { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = (x) => { x = clamp(x, 0, 1); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const rnd = (v) => { const x = Math.sin(v * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const f1 = (v) => v.toFixed(1);
  const GLYPHS = '01<>/[]{}#*+=-_%$&ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const SIG = '#3D8BFF', GREY = 'rgba(255,255,255,0.4)';
  const PALETTE = ['#FF6B5B', '#FF9F4A', '#F2C94C', '#3D8BFF', '#5FE08A', '#3FE0C5', '#55D3FF', '#6FA8FE', '#8F95FF', '#B98CFF', '#FF7FC8', '#F7F8FA', '#3D8BFF', '#3D8BFF'];

  const scramble = (txt, p, t) => {
    if (p >= 1) return txt;
    if (p <= 0) return ' ';
    const k = Math.floor(p * txt.length), tick = Math.floor(t / 55);
    let out = txt.slice(0, k);
    for (let i = k; i < Math.min(txt.length, k + 14); i++) out += txt[i] === ' ' ? ' ' : GLYPHS[Math.floor(rnd(tick * 31 + i * 7) * GLYPHS.length)];
    return out;
  };
  const isoOf = (svg) => {
    const cx = +svg.dataset.cx, cy = +svg.dataset.cy;
    return (x, y, z = 0) => [cx + (x - y) * 0.8660254, cy + (x + y) * 0.5 - z];
  };
  const setLine = (el, a, b) => { el.setAttribute('x1', f1(a[0])); el.setAttribute('y1', f1(a[1])); el.setAttribute('x2', f1(b[0])); el.setAttribute('y2', f1(b[1])); };

  const steps = [...root.querySelectorAll('.hs-step')].map((el, i) => {
    const svg = el.querySelector('svg.hs-svg');
    const a = {};
    el.querySelectorAll('[data-a]').forEach((x) => { a[x.getAttribute('data-a')] = x; });
    const s = {
      el, i, card: el.querySelector('.hs-card'), cap: el.querySelector('.hs-cap-in'), title: el.querySelector('.hs-title'),
      text: el.querySelector('.hs-title').getAttribute('data-text'), draws: [...el.querySelectorAll('.dr')], svg, iso: isoOf(svg), a, at: null,
    };
    s.card.style.opacity = '0';
    s.cap.style.opacity = '0';
    s.title.textContent = ' ';
    s.draws.forEach((d) => { d.style.strokeDasharray = '1'; d.style.strokeDashoffset = '1'; });
    return s;
  });

  // ---- the live Signal --------------------------------------------------------------------------
  const W = [0.65, 0.15, 0.10, 0.10];
  let SCORE = 91.9, PARTS = [59.8, 13.8, 9.3, 9.0];
  const STILL = [1200, 3200, 5300, 3200, 2900, 1300];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const live = (snap) => {
    const all = snap.signals || {};
    const id = all.bpc157 ? 'bpc157' : Object.keys(all).sort((a, b) => (all[b].score || 0) - (all[a].score || 0))[0];
    const c = all[id];
    if (!c || typeof c.score !== 'number') return;
    const v = [c.efficacy, c.consistency, c.diversity, c.confidence];
    if (v.some((x) => typeof x !== 'number')) return;
    SCORE = c.score;
    PARTS = v.map((x, i) => x * W[i]);
    const name = c.name || 'BPC-157';
    root.querySelectorAll('[data-live="name"]').forEach((el) => { el.textContent = name; });
    root.querySelectorAll('[data-live="lname"]').forEach((el) => { el.textContent = name.toLowerCase(); });
    const count = (snap.community && snap.community.signals) || Object.keys(all).length;
    root.querySelectorAll('[data-live="count"]').forEach((el) => { el.textContent = String(count); });
    const d = new Date(snap.published_at || snap.generated_at || Date.now());
    const when = MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate();
    // step 4: the four parts restacked, their sums and the total
    const s4 = steps[3], iso = s4.iso, k = 1.95;
    let z = 0;
    for (let i = 0; i < 4; i++) {
      const h = PARTS[i] * k, faces = s4.a['slab' + i].querySelectorAll('polygon');
      const F = [[[-32, 32, z], [32, 32, z], [32, 32, z + h], [-32, 32, z + h]], [[32, -32, z], [32, 32, z], [32, 32, z + h], [32, -32, z + h]],
        [[-32, -32, z + h], [32, -32, z + h], [32, 32, z + h], [-32, 32, z + h]]];
      F.forEach((pts, j) => { if (faces[j]) faces[j].setAttribute('points', pts.map((p) => iso(...p).map(f1).join(',')).join(' ')); });
      const lab = s4.a['lab' + i], line = lab.querySelector('polyline'), dot = lab.querySelector('circle'), texts = lab.querySelectorAll('text');
      const [mx, my] = iso(32, 0, z + h / 2);
      const pts = line.getAttribute('points').split(' ');
      pts[0] = f1(mx + 3) + ',' + f1(my); pts[1] = pts[1].split(',')[0] + ',' + f1(my);
      line.setAttribute('points', pts.join(' '));
      dot.setAttribute('cx', f1(mx + 3)); dot.setAttribute('cy', f1(my));
      if (texts[1]) texts[1].textContent = `${v[i]} × ${W[i].toFixed(2)} = ${PARTS[i].toFixed(1)}`;
      z += h;
    }
    const t4 = s4.a.total.querySelectorAll('text');
    if (t4[1]) t4[1].textContent = `${name} · the live Signal`;
    // step 6: the score, its version and its day
    const s6 = steps[5].svg.querySelectorAll('text');
    s6.forEach((el) => {
      if (/^\d+(\.\d)?$/.test(el.textContent.trim())) el.textContent = SCORE.toFixed(1);
      else if (/· version /.test(el.textContent)) el.textContent = `${name} · version ${snap.version ?? 1} · ${when}`;
      else if (/live Signals$/.test(el.textContent)) el.textContent = `${count} live Signals`;
    });
    root.querySelectorAll('.hs-sub').forEach((el) => { if (/live Signals$/.test(el.textContent)) el.textContent = `${count} live Signals`; });
  };

  // ---- the six pictures ------------------------------------------------------------------------
  const ANIM = [
    // 01 reports rise from the community into the Signal
    (s, lt) => {
      const P = 4800;
      let glow = 0;
      for (let k = 0; k < 3; k++) {
        const ph = ((Math.max(lt, 0) / P) + k / 3 + 0.12) % 1;
        const z = 26 + ph * 190;
        const o = clamp(Math.min(ph / 0.1, (1 - ph) / 0.12), 0, 1);
        s.a['sheet' + k].setAttribute('transform', `translate(0 ${f1(-z)})`);
        s.a['sheet' + k].setAttribute('opacity', o.toFixed(3));
        glow = Math.max(glow, clamp(1 - Math.abs(ph - 0.95) / 0.07, 0, 1));
      }
      s.a.top.setAttribute('opacity', (0.5 + 0.5 * glow).toFixed(3));
    },
    // 02 Sig reads the report; the member confirms
    (s, lt, t) => {
      const iso = s.iso, rot = t * 0.0005;
      for (let i = 0; i < 12; i++) {
        const a0 = rot + i * Math.PI / 6 + 0.07, a1 = a0 + Math.PI / 6 - 0.14;
        let d = '';
        for (let j = 0; j <= 6; j++) {
          const an = a0 + (a1 - a0) * j / 6, p = iso(46 * Math.cos(an), 46 * Math.sin(an), 176);
          d += (j ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]);
        }
        s.a['seg' + i].setAttribute('d', d);
      }
      const P = 5600, live = lt > 0, u = live ? lt % P : 0;
      const out = live ? clamp(1 - (u - 4700) / 500, 0, 1) : 0;
      const sx = -70 + 140 * easeIO(u / 1800), scanOn = live && u < 2050 ? clamp(Math.min(u / 200, (2050 - u) / 250), 0, 1) : 0;
      const A = iso(sx, -50, 24), B = iso(sx, 50, 24), C = iso(0, 0, 176);
      setLine(s.a.scan, A, B); setLine(s.a.beamA, C, A); setLine(s.a.beamB, C, B);
      s.a.beam.setAttribute('points', `${f1(C[0])},${f1(C[1])} ${f1(A[0])},${f1(A[1])} ${f1(B[0])},${f1(B[1])}`);
      [s.a.scan, s.a.beamA, s.a.beamB, s.a.beam].forEach((e) => e.setAttribute('opacity', scanOn.toFixed(3)));
      for (let k = 0; k < 3; k++) {
        const e = live ? ease((u - 450 - k * 420) / 520) : 0;
        s.a['tag' + k].setAttribute('opacity', (e * out).toFixed(3));
        s.a['tag' + k].setAttribute('transform', `translate(0 ${f1((1 - e) * 16)})`);
      }
      s.a.tagh.setAttribute('opacity', ((live ? ease((u - 450) / 520) : 0) * out).toFixed(3));
      const ce = live ? ease((u - 2350) / 520) : 0;
      s.a.check.setAttribute('opacity', (ce * out).toFixed(3));
    },
    // 03 one report, followed for twelve weeks
    (s, lt) => {
      const iso = s.iso, X = (w) => -150 + w * 25, wks = [2, 6, 12];
      const P = 6800, live = lt > 0, u = live ? lt % P : 0, TRAVEL = 4800;
      const w = live ? 12 * clamp(u / TRAVEL, 0, 1) : 0;
      const out = live ? clamp(1 - (u - 6100) / 500, 0, 1) : 1;
      const D = iso(X(w), 0, 5), S0 = iso(X(0), 0, 5);
      s.a.dot.setAttribute('cx', f1(D[0])); s.a.dot.setAttribute('cy', f1(D[1]));
      s.a.glow.setAttribute('cx', f1(D[0])); s.a.glow.setAttribute('cy', f1(D[1]));
      s.a.trail.setAttribute('points', `${f1(S0[0])},${f1(S0[1])} ${f1(D[0])},${f1(D[1])}`);
      [s.a.dot, s.a.glow, s.a.trail].forEach((e) => e.setAttribute('opacity', out.toFixed(3)));
      wks.forEach((wk, k) => {
        const tPass = TRAVEL * wk / 12, e = live ? ease((u - tPass) / 380) : 0;
        const g = s.a['gate' + k];
        g.setAttribute('stroke', e > 0.05 ? SIG : GREY);
        g.setAttribute('fill', `rgba(61,139,255,${(0.1 * e * out).toFixed(3)})`);
        g.setAttribute('stroke-width', e > 0.05 ? '1.6' : '1.2');
        s.a['ans' + k].setAttribute('opacity', (e * out).toFixed(3));
        s.a['ans' + k].setAttribute('transform', `translate(0 ${f1((1 - e) * 10)})`);
      });
      s.a.latest.setAttribute('opacity', ((live ? ease((u - TRAVEL - 200) / 450) : 0) * out).toFixed(3));
    },
    // 04 the four parts drop into place and make 91.9
    (s, lt) => {
      const iso = s.iso, parts = [59.8, 13.8, 9.3, 9.0], k = 1.95, live = lt > 0;
      let total = 0;
      for (let i = 0; i < 4; i++) {
        const st = i * 430, e = live ? clamp((lt - st) / 560, 0, 1) : 0;
        s.a['slab' + i].setAttribute('opacity', clamp(e * 4, 0, 1).toFixed(3));
        s.a['slab' + i].setAttribute('transform', `translate(0 ${f1(-(1 - back(e)) * 80)})`);
        s.a['lab' + i].setAttribute('opacity', (live ? ease((lt - st - 320) / 420) : 0).toFixed(3));
        total += parts[i] * (live ? ease((lt - st) / 560) : 0);
      }
      s.a.total.setAttribute('opacity', (live ? ease((lt - 200) / 500) : 0).toFixed(3));
      s.a.totaln.textContent = (live && lt > 2200 ? SCORE : total).toFixed(1);
      const H = PARTS.reduce((a, b) => a + b, 0) * 1.95;
      if (live && lt > 2300) {
        const v = ((lt - 2300) % 2800) / 2800, z0 = v * (H - 10);
        const pts = [[32, -32, z0], [32, 32, z0], [32, 32, z0 + 10], [32, -32, z0 + 10]].map((q) => iso(...q));
        s.a.shine.setAttribute('points', pts.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' '));
        s.a.shine.setAttribute('opacity', (Math.sin(v * Math.PI) * 0.9).toFixed(3));
      } else s.a.shine.setAttribute('opacity', '0');
    },
    // 05 the Signal, sealed: ads, sellers and shops bounce off; a burst of new accounts counts a quarter
    (s, lt, t) => {
      s.a.lid.setAttribute('transform', `translate(0 ${f1(-7 * Math.sin(t * 0.0015))})`);
      const P = 5600, live = lt > 0, u = live ? lt % P : 0;
      const out = live ? clamp(1 - (u - 4900) / 500, 0, 1) : 0;
      const paths = [[[28, 112], [118, 176]], [[470, 92], [386, 150]], [[18, 318], [112, 292]]];
      paths.forEach(([a, b], k) => {
        const st = 200 + k * 260, m = live ? easeIO((u - st) / 1100) : 0;
        const hit = live ? clamp((u - st - 1100) / 160, 0, 1) : 0;
        const bounce = live ? ease((u - st - 1260) / 700) : 0;
        const x = a[0] + (b[0] - a[0]) * m - (b[0] - a[0]) * 0.18 * bounce, y = a[1] + (b[1] - a[1]) * m - (b[1] - a[1]) * 0.18 * bounce;
        s.a['no' + k].setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
        s.a['no' + k].setAttribute('opacity', ((live ? clamp((u - st) / 300, 0, 1) : 0) * out * (1 - 0.45 * bounce)).toFixed(3));
        s.a['x' + k].setAttribute('opacity', hit.toFixed(3));
      });
      for (let i = 0; i < 9; i++) {
        const st = 1500 + i * 70, m = live ? easeIO((u - st) / 1000) : 0;
        const sx = 520 + (rnd(i * 3.1) - 0.5) * 50, sy = 236 + (rnd(i * 7.7) - 0.5) * 60;
        const ex = 420 + (rnd(i * 5.3) - 0.5) * 36, ey = 262 + (rnd(i * 9.1) - 0.5) * 30;
        const d = s.a['acct' + i];
        d.setAttribute('cx', f1(sx + (ex - sx) * m)); d.setAttribute('cy', f1(sy + (ey - sy) * m));
        d.setAttribute('r', f1(4 - 2.6 * clamp((m - 0.85) / 0.15, 0, 1)));
        d.setAttribute('opacity', ((live ? clamp((u - st) / 250, 0, 1) : 0) * out * (m > 0.98 ? 0.55 : 0.95)).toFixed(3));
      }
      s.a.quarter.setAttribute('opacity', ((live ? ease((u - 2600) / 450) : 0) * out).toFixed(3));
    },
    // 06 one version, read everywhere
    (s, lt, t) => {
      const iso = s.iso;
      for (let i = 0; i < 3; i++) {
        const a0 = t * 0.0009 + i * 2 * Math.PI / 3;
        let d = '';
        for (let j = 0; j <= 8; j++) { const an = a0 + 0.7 * j / 8, p = iso(46 * Math.cos(an), 46 * Math.sin(an), 12); d += (j ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); }
        s.a['sp' + i].setAttribute('d', d);
      }
      const h = s.a.hand, hx = +h.getAttribute('x1'), hy = +h.getAttribute('y1'), ha = t * 2 * Math.PI / 4000;
      h.setAttribute('x2', f1(hx + 5 * Math.sin(ha))); h.setAttribute('y2', f1(hy - 5 * Math.cos(ha)));
      const panels = [[-118, 4], [4, -118], [92, 92]], live = lt > 0, C = iso(0, 0, 12);
      panels.forEach(([px, py], k) => {
        const P = 2700, u = live ? ((lt + k * 520) % P) / 1500 : -1, p = s.a['pulse' + k], lit = s.a['lit' + k];
        if (u >= 0 && u <= 1) {
          const E = iso(px, py, 5), e = easeIO(u);
          p.setAttribute('cx', f1(C[0] + (E[0] - C[0]) * e)); p.setAttribute('cy', f1(C[1] + (E[1] - C[1]) * e));
          p.setAttribute('opacity', clamp(Math.min(u / 0.12, (1 - u) / 0.08), 0, 1).toFixed(3));
        } else p.setAttribute('opacity', '0');
        lit.setAttribute('opacity', (u > 1 ? 0.4 * clamp(1 - (u - 1) / 0.5, 0, 1) : 0).toFixed(3));
      });
    },
  ];

  // ---- the finale: the Signal, written in what people report ---------------------------------------
  const cv = root.querySelector('.hs-ringc'), mid = root.querySelector('.hs-mid'), midN = root.querySelector('.hs-n');
  const finale = root.querySelector('.hs-finale'), close = root.querySelector('.hs-close');
  const DPR = Math.min(2, win.devicePixelRatio || 1);
  let CW = 980;
  const sizeRing = () => { CW = cv.clientWidth || 980; cv.width = Math.round(CW * DPR); cv.height = Math.round(CW * DPR); };
  sizeRing();
  const ctx = cv.getContext('2d');
  const PHR = 'how it went // better // the same // worse // same for me // what for // how long // 2 weeks // 6 weeks // 12 weeks // ';
  const RINGS = [];
  for (let k = 0, r = 172; r <= 452; k++, r += 23.3) {
    // whole phrases round each ring, so no two words run together where it closes
    const count = Math.max(1, Math.round(2 * Math.PI * r / (10.4 * PHR.length))) * PHR.length, off = (k * 23) % PHR.length, chars = [];
    for (let j = 0; j < count; j++) {
      const ch = PHR[(j + off) % PHR.length];
      if (ch === ' ') continue;
      const base = -Math.PI / 2 + j * 2 * Math.PI / count;
      chars.push({ ch, base, na: j / count, seed: rnd(j * 1.37 + k * 91.1) });
    }
    RINGS.push({ r, k, chars });
  }
  mid.style.opacity = '0'; close.style.opacity = '0';
  const drawRing = (t, rev) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (rev <= 0) return;
    const k = CW / 980;
    ctx.font = '400 13px "Monaspace Neon", ui-monospace, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const bucket = Math.floor(t / 430);
    for (const R of RINGS) {
      const rot = (R.k % 2 ? 1 : -1) * t * 0.000035;
      for (let j = 0; j < R.chars.length; j++) {
        const c = R.chars[j];
        const vis = clamp((rev * 1.35 - c.na - R.k * 0.028) / 0.05, 0, 1);
        if (vis <= 0) continue;
        const a = c.base + rot, x = (490 + R.r * Math.cos(a)) * k, y = (490 + R.r * Math.sin(a)) * k, q = a + Math.PI / 2;
        const lit = rnd(j * 7.13 + R.k * 101.7 + bucket + Math.floor(c.seed * 9)) > 0.972;
        ctx.globalAlpha = lit ? vis : vis * (0.16 + 0.1 * c.seed);
        ctx.fillStyle = lit ? PALETTE[Math.floor(rnd(j * 3.7 + R.k * 11 + bucket) * PALETTE.length)] : '#FFFFFF';
        ctx.setTransform(DPR * k * Math.cos(q), DPR * k * Math.sin(q), -DPR * k * Math.sin(q), DPR * k * Math.cos(q), DPR * x, DPR * y);
        ctx.fillText(c.ch, 0, 0);
      }
    }
    ctx.globalAlpha = 1;
  };

  // ---- spine and marker -------------------------------------------------------------------------
  const spine = root.querySelector('.hs-spine'), fill = root.querySelector('.hs-fill'), marker = root.querySelector('.hs-marker');

  const render = () => {
    const t = now();
    const vh = win.innerHeight, rt = root.getBoundingClientRect().top;
    const intro = root.querySelector('.hs-intro');
    const sTop = intro.offsetTop + intro.offsetHeight - 40, sBot = finale.offsetTop + 70;
    spine.style.top = sTop + 'px';
    spine.style.height = (sBot - sTop) + 'px';
    const my = clamp(-rt + vh * 0.5, sTop, sBot);
    marker.style.top = my + 'px';
    fill.style.height = (my - sTop) + 'px';
    let active = 0;
    steps.forEach((s) => {
      const r = s.card.getBoundingClientRect();
      if (r.top + r.height * 0.5 < vh * 0.62) active = s.i + 1;
      if (s.at == null && (still || r.top < vh * 0.84)) s.at = still ? t - 60000 : t;
      const lt = s.at == null ? -1 : t - s.at;
      const e = lt < 0 ? 0 : ease(lt / 760);
      s.card.style.opacity = e.toFixed(3);
      s.card.style.transform = `translateY(${f1((1 - e) * 56)}px)`;
      const ce = lt < 0 ? 0 : ease((lt - 260) / 700);
      s.cap.style.opacity = ce.toFixed(3);
      s.cap.style.transform = `translateY(${f1((1 - ce) * 20)}px)`;
      s.title.textContent = scramble(s.text, (lt - 140) / 950, t);
      const d = lt < 0 ? 0 : ease((lt - 180) / 1200);
      s.draws.forEach((p) => { p.style.strokeDashoffset = (1 - d).toFixed(3); });
      ANIM[s.i](s, lt < 0 ? -1 : still ? STILL[s.i] : lt - 700, still ? 0 : t);
    });
    const fr = finale.getBoundingClientRect();
    const rev = still ? 1 : clamp((vh * 0.8 - fr.top - 60) / 820, 0, 1);
    drawRing(still ? 0 : t, rev);
    const me = ease((rev - 0.62) / 0.3);
    mid.style.opacity = me.toFixed(3);
    midN.textContent = (SCORE * ease((rev - 0.55) / 0.4)).toFixed(1);
    const cr = close.getBoundingClientRect();
    const cl = ease((vh * 0.92 - cr.top) / 260);
    close.style.opacity = cl.toFixed(3);
    close.style.transform = `translateY(${f1((1 - cl) * 24)}px)`;
  };

  let raf = 0, alive = true, seen = false;
  const loop = () => { raf = 0; if (!alive || !seen) return; render(); if (!still) raf = win.requestAnimationFrame(loop); };
  const kick = () => { if (!raf) raf = win.requestAnimationFrame(loop); };
  const io = new win.IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; if (seen) kick(); }, { rootMargin: '200px 0px' });
  io.observe(root);
  const onScroll = () => { if (still) kick(); };
  const onResize = () => { sizeRing(); kick(); };
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', onResize);
  getSignal().then((snap) => { if (snap) { live(snap); kick(); } }, () => {});
  return () => { alive = false; io.disconnect(); win.removeEventListener('scroll', onScroll); win.removeEventListener('resize', onResize); if (raf) win.cancelAnimationFrame(raf); };

}
