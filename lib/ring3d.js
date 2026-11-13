// A ring drawn in 3D, in How it works' language (page 18 of the design canvas): it stands on a slab
// over a grid, in the same isometric projection, and each of its parts is a wall that can stand at
// any height, lit from the front left so its curve shows. The front page's Community Signal card
// draws the Signal with it (four parts, each as tall as its number: lib/sighero.js), and Ask Sig
// draws Sig's agents with it (sigRing3d, below: each agent a wall that stands up as it reports, the
// Interpretation agent a light over the middle). Nothing here is anyone's text: the markup is ours,
// made from numbers and colours.

const f1 = (v) => v.toFixed(1);

// The drawing's geometry and markup. parts: [{ span, color, key }], span a share of the whole (the
// spans add up to 100). byPart: each part's walls in one group (class "rg", data-a its key), so a part
// can be lit, dimmed or picked as one; it needs parts no wider than about 60°, since whole parts are
// drawn from the back to the front. Without it, the walls are drawn in thin slices from the back to
// the front, whatever the parts' widths.
export function ring3d({ w = 560, h = 380, cx = 280, cy = 218, r = 102, band = 12, rim = 16, floor = 40, slab = 12, gap = 3.2,
  grid = 120, step = 40, parts = [], light = 215, byPart = false } = {}) {
  const RI = r - band, RO = r + band, RP = RO + rim;
  const iso = (x, y, z = 0) => [cx + (x - y) * 0.8660254, cy + (x + y) * 0.5 - z];
  const T = (a) => ((225 + a) * Math.PI) / 180;
  // a point on a ring: a is degrees round it from its top, clockwise as you look down on it
  const at = (a, rr = r, z = 0) => { const t = T(a); return iso(rr * Math.cos(t), rr * Math.sin(t), z); };
  const toward = (a) => { const t = T(a); return Math.cos(t) + Math.sin(t); };   // > 0: its outside faces you
  const quad = (pts) => `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;
  const arcPath = (a0, a1, rr, z) => {
    const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3));
    let d = '';
    for (let j = 0; j <= n; j++) { const [x, y] = at(a0 + ((a1 - a0) * j) / n, rr, z); d += `${j ? 'L' : 'M'}${f1(x)} ${f1(y)}`; }
    return d;
  };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
  // the parts round the ring, each with a gap either side: [start, end, middle] in degrees
  let a0 = 0;
  const SEGS = parts.map(({ span }) => { const s0 = a0, s1 = a0 + 3.6 * span; a0 = s1; return [s0 + gap, s1 - gap, (s0 + s1) / 2]; });

  // the light comes from the front left, so the walls brighten as they turn toward it and darken away
  // from it; lit(d, lo, hi) runs from lo (facing away) to hi (facing it square on)
  const LT = T(light), LX = Math.cos(LT), LY = Math.sin(LT);
  const lit = (d, lo, hi) => lo + (hi - lo) * (0.5 + 0.5 * d);
  const outK = (a) => { const t = T(a); return lit(Math.cos(t) * LX + Math.sin(t) * LY, 0.34, 0.82); };
  const inK = (a) => { const t = T(a); return lit(-(Math.cos(t) * LX + Math.sin(t) * LY), 0.22, 0.5); };
  const capK = (a, end) => { const t = T(a), d = Math.sin(t) * LX - Math.cos(t) * LY; return lit(end ? -d : d, 0.3, 0.7); };
  const capFaces = (b) => { const t = T(b); return [Math.sin(t) - Math.cos(t) > 0, Math.cos(t) - Math.sin(t) > 0]; };   // [start end faces you, finish end faces you]

  // the walls, in thin slices, each showing its top, the side that faces you and the ends of its part
  const slices = [];
  SEGS.forEach(([s0, s1], i) => {
    const n = Math.max(1, Math.ceil((s1 - s0) / 4));
    for (let j = 0; j < n; j++) {
      const b0 = s0 + ((s1 - s0) * j) / n, b1 = s0 + ((s1 - s0) * (j + 1)) / n;
      slices.push({ id: slices.length, i, b0, b1, near: toward((b0 + b1) / 2), first: j === 0, last: j === n - 1 });
    }
  });
  const sliceSvg = (c) => {
    const col = parts[c.i].color, m = (c.b0 + c.b1) / 2;
    const face = (f, fill) => `<path data-f="${f}" fill="${fill}" stroke="${fill}" stroke-width="1" stroke-linejoin="round" d="M0 0"/>`;
    let g = `<g data-s="${c.id}">`;
    if (c.near < 0) g += face('in', shade(col, inK(m)));
    if (c.first && capFaces(c.b0)[0]) g += face('c0', shade(col, capK(c.b0, false)));
    if (c.last && capFaces(c.b1)[1]) g += face('c1', shade(col, capK(c.b1, true)));
    if (c.near > 0) g += face('out', shade(col, outK(m)));
    return `${g}${face('top', col)}<path data-f="eo" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1" d="M0 0"/><path data-f="ei" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1" d="M0 0"/></g>`;
  };
  const near = (x, y) => x.near - y.near;

  return {
    RI, RO, RP, SEGS, iso, at, toward, arcPath, f1,
    // the grid well under it, the slab's shadow on the grid, the posts the slab stands on, then the
    // slab: the side you can see (round the front, from its far right, 90°, to its far left, 270°) and its top
    base() {
      const LINE = 'rgba(255,255,255,0.16)';
      let s = '';
      for (let v = -grid; v <= grid + 0.01; v += step) {
        const [x0, y0] = iso(v, -grid, -floor), [x1, y1] = iso(v, grid, -floor), [x2, y2] = iso(-grid, v, -floor), [x3, y3] = iso(grid, v, -floor);
        s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${LINE}" stroke-width="1"/><line x1="${f1(x2)}" y1="${f1(y2)}" x2="${f1(x3)}" y2="${f1(y3)}" stroke="${LINE}" stroke-width="1"/>`;
      }
      s += `<path d="${arcPath(0, 360, RP, -floor)}Z" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
      for (const a of [45, 135, 225, 315]) {
        const [x0, y0] = at(a, RP - 6, -floor), [x1, y1] = at(a, RP - 6, -slab);
        s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3 4"/>`;
      }
      return `${s}<path d="${arcPath(90, 270, RP, 0)}L${arcPath(270, 90, RP, -slab).slice(1)}Z" fill="#0F0F12" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linejoin="round"/>`
        + `<path d="${arcPath(0, 360, RP, 0)}Z" fill="#141418" stroke="rgba(255,255,255,0.42)" stroke-width="1" stroke-linejoin="round"/>`;
    },
    walls() {
      if (!byPart) return `<g data-walls>${[...slices].sort(near).map(sliceSvg).join('')}</g>`;
      const order = parts.map((p, i) => i).sort((x, y) => toward(SEGS[x][2]) - toward(SEGS[y][2]));
      return `<g data-walls>${order.map((i) => `<g class="rg" data-a="${parts[i].key}">${slices.filter((c) => c.i === i).sort(near).map(sliceSvg).join('')}</g>`).join('')}</g>`;
    },
    // once the markup is on the page: draw(heights) stands each part's walls at its height
    bind(root) {
      const els = [...root.querySelectorAll('[data-walls] [data-s]')].map((g) => ({ c: slices[+g.dataset.s], f: Object.fromEntries([...g.querySelectorAll('[data-f]')].map((p) => [p.dataset.f, p])) }));
      return (hs) => {
        for (const { c, f } of els) {
          const hh = hs[c.i], { b0, b1 } = c;
          if (f.in) f.in.setAttribute('d', quad([at(b0, RI, 0), at(b1, RI, 0), at(b1, RI, hh), at(b0, RI, hh)]));
          if (f.out) f.out.setAttribute('d', quad([at(b0, RO, 0), at(b1, RO, 0), at(b1, RO, hh), at(b0, RO, hh)]));
          if (f.c0) f.c0.setAttribute('d', quad([at(b0, RI, 0), at(b0, RO, 0), at(b0, RO, hh), at(b0, RI, hh)]));
          if (f.c1) f.c1.setAttribute('d', quad([at(b1, RI, 0), at(b1, RO, 0), at(b1, RO, hh), at(b1, RI, hh)]));
          f.top.setAttribute('d', quad([at(b0, RI, hh), at(b0, RO, hh), at(b1, RO, hh), at(b1, RI, hh)]));
          const [o0, o1, i0, i1] = [at(b0, RO, hh), at(b1, RO, hh), at(b0, RI, hh), at(b1, RI, hh)];
          f.eo.setAttribute('d', `M${f1(o0[0])} ${f1(o0[1])}L${f1(o1[0])} ${f1(o1[1])}`);
          f.ei.setAttribute('d', `M${f1(i0[0])} ${f1(i0[1])}L${f1(i1[0])} ${f1(i1[1])}`);
        }
      };
    },
  };
}

// Sig's agents as a ring in 3D, in place of the flat ring in host (Ask Sig's agents tab, and Ask Sig on
// the front page): a wall for each agent, in its own colour, round the ring by hue as in lib/ring.js,
// and, with center, the Interpretation agent as a white light over the middle. The pieces keep the flat
// ring's classes, so whatever lit the flat ring lights this one: "on" (it has reported, or it's ready)
// stands an agent's wall up, "is-now" (at work) half up, and "is-lit" (picked) taller than the rest; a
// piece that's none of these lies low. busy(true) sends a light round the slab while the agents work.
// Under reduced motion the walls move at once and no light goes round.
export function sigRing3d(host, { wheel, colors, center = null, cls = '', label = '' } = {}) {
  if (!host) return null;
  const doc = host.ownerDocument, win = doc.defaultView;
  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 400, H = 300, ON = 30, RUN = 16, OFF = 5, LIT = 40;
  const geo = ring3d({ w: W, h: H, cx: 200, cy: 150, r: 118, band: 11, rim: 14, floor: 34, slab: 10, gap: 3.4, grid: 114, step: 38, byPart: true,
    parts: wheel.map((k) => ({ key: k, span: 100 / wheel.length, color: colors[k] })) });
  const was = new Map([...host.querySelectorAll('.rg')].map((p) => [p.dataset.a, p.classList.contains('on')]));
  const [ox, oy] = geo.iso(0, 0, 40);
  const orb = center ? `<g class="rg rg-c${was.get(center) !== false ? ' on' : ''}" data-a="${center}"><circle cx="${f1(ox)}" cy="${f1(oy)}" r="11" fill="rgba(255,255,255,0.12)"/><circle cx="${f1(ox)}" cy="${f1(oy)}" r="5" fill="${colors[center] || '#FFFFFF'}"/></g>` : '';
  host.innerHTML = `<svg class="ring r3d${cls ? ` ${cls}` : ''}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} focusable="false">${geo.base()}${orb}`
    + `<g data-run opacity="0"><circle r="8" fill="rgba(255,255,255,0.22)"/><circle r="3" fill="#FFFFFF"/></g>${geo.walls()}</svg>`;
  host.classList.add('is-3d');
  const svg = host.querySelector('svg');
  const walls = [...svg.querySelectorAll('[data-walls] > .rg')];
  walls.forEach((g) => g.classList.toggle('on', was.get(g.dataset.a) !== false));
  const draw = geo.bind(svg);
  const want = () => walls.map((g) => (g.classList.contains('is-lit') ? LIT : g.classList.contains('on') ? ON : g.classList.contains('is-now') ? RUN : OFF));
  let hs = want(), from = hs, to = hs, t0 = 0, raf = 0;
  draw(hs);
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 450), e = 1 - (1 - k) ** 3;
    hs = from.map((v, i) => v + (to[i] - v) * e);
    draw(hs);
    raf = k < 1 ? win.requestAnimationFrame(step) : 0;
  };
  const sync = () => {
    const next = want();
    if (next.every((v, i) => v === to[i])) return;
    to = next;
    if (still) { hs = to; draw(hs); return; }
    from = hs; t0 = win.performance.now();
    if (!raf) raf = win.requestAnimationFrame(step);
  };
  // whatever changes a piece's classes moves its wall
  let queued = false;
  new win.MutationObserver(() => { if (queued) return; queued = true; win.requestAnimationFrame(() => { queued = false; sync(); }); })
    .observe(svg, { subtree: true, attributes: true, attributeFilter: ['class'] });
  // the light round the slab, once every 2.4 seconds while the agents work and the ring is on screen
  const run = svg.querySelector('[data-run]');
  let working = false, seen = !('IntersectionObserver' in win), spin = 0;
  const turn = (t) => {
    const [x, y] = geo.at(((t / 2400) % 1) * 360, geo.RP, 0);
    run.setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
    spin = working && seen ? win.requestAnimationFrame(turn) : 0;
  };
  const light = () => {
    run.setAttribute('opacity', working && !still ? '1' : '0');
    if (working && seen && !still && !spin) spin = win.requestAnimationFrame(turn);
  };
  if (!seen) new win.IntersectionObserver((es) => { seen = es.some((x) => x.isIntersecting); light(); }, { rootMargin: '60px' }).observe(svg);
  return { svg, sync, busy(on) { working = !!on; light(); } };
}
