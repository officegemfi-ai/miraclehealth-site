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
      // its four corners on the slab, worked out once: a wall h high has the same corners h higher
      slices.push({ id: slices.length, i, b0, b1, near: toward((b0 + b1) / 2), first: j === 0, last: j === n - 1,
        i0: at(b0, RI, 0), i1: at(b1, RI, 0), o0: at(b0, RO, 0), o1: at(b1, RO, 0) });
    }
  });
  // a slice's faces, standing hh high: the side toward the middle, the outside, the ends, the top, and the top's two edges
  const up = ([x, y], hh) => [x, y - hh];
  const line = (a, b) => `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;
  const faceD = (c, f, hh) => {
    const { i0, i1, o0, o1 } = c;
    switch (f) {
      case 'in': return quad([i0, i1, up(i1, hh), up(i0, hh)]);
      case 'out': return quad([o0, o1, up(o1, hh), up(o0, hh)]);
      case 'c0': return quad([i0, o0, up(o0, hh), up(i0, hh)]);
      case 'c1': return quad([i1, o1, up(o1, hh), up(i1, hh)]);
      case 'top': return quad([up(i0, hh), up(o0, hh), up(o1, hh), up(i1, hh)]);
      case 'eo': return line(up(o0, hh), up(o1, hh));
      default: return line(up(i0, hh), up(i1, hh));
    }
  };
  // hh: the height it's drawn at, so the markup can carry the drawing itself (the front page's
  // build writes it in); without it the faces are empty until bind's draw stands them up
  const sliceSvg = (c, hh) => {
    const col = parts[c.i].color, m = (c.b0 + c.b1) / 2;
    const d = (f) => (hh == null ? 'M0 0' : faceD(c, f, hh));
    const face = (f, fill) => `<path data-f="${f}" fill="${fill}" stroke="${fill}" stroke-width="1" stroke-linejoin="round" d="${d(f)}"/>`;
    let g = `<g data-s="${c.id}">`;
    if (c.near < 0) g += face('in', shade(col, inK(m)));
    if (c.first && capFaces(c.b0)[0]) g += face('c0', shade(col, capK(c.b0, false)));
    if (c.last && capFaces(c.b1)[1]) g += face('c1', shade(col, capK(c.b1, true)));
    if (c.near > 0) g += face('out', shade(col, outK(m)));
    return `${g}${face('top', col)}<path data-f="eo" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1" d="${d('eo')}"/><path data-f="ei" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1" d="${d('ei')}"/></g>`;
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
    // hs: each part's height, to draw the walls standing in the markup itself (see sliceSvg)
    walls(hs = null) {
      const one = (c) => sliceSvg(c, hs ? hs[c.i] : null);
      if (!byPart) return `<g data-walls>${[...slices].sort(near).map(one).join('')}</g>`;
      const order = parts.map((p, i) => i).sort((x, y) => toward(SEGS[x][2]) - toward(SEGS[y][2]));
      return `<g data-walls>${order.map((i) => `<g class="rg" data-a="${parts[i].key}">${slices.filter((c) => c.i === i).sort(near).map(one).join('')}</g>`).join('')}</g>`;
    },
    // each part's walls on their own, from the back to the front: [key, markup], for drawings that
    // give every part a layer of its own (so a part that moves redraws only itself)
    partWalls() {
      const order = parts.map((p, i) => i).sort((x, y) => toward(SEGS[x][2]) - toward(SEGS[y][2]));
      return order.map((i) => [parts[i].key, `<g data-walls>${slices.filter((c) => c.i === i).sort(near).map((c) => sliceSvg(c, null)).join('')}</g>`]);
    },
    // a light going round the plate's edge is moved by the compositor (CSS .orbit: an arm turning in a
    // frame squashed to the edge's ellipse, whose height is 1/√3 of its width); this places it over the
    // drawing (plate: the drawing's svg; host: what the orbit is positioned in) and sizes its light
    placeOrbit(orbit, plate, host, { halo = 9, core = 3.4 } = {}) {
      const b = plate.getBoundingClientRect(), o = host.getBoundingClientRect();
      const k = Math.min(b.width / w, b.height / h);
      if (!k) return;
      const px = (v) => `${v.toFixed(2)}px`;
      orbit.style.setProperty('--ox', px(b.left - o.left + (b.width - w * k) / 2 + cx * k));
      orbit.style.setProperty('--oy', px(b.top - o.top + (b.height - h * k) / 2 + cy * k));
      orbit.style.setProperty('--ra', px(RP * 1.2247449 * k));   // the ellipse's half width: RP·√2·cos 30°
      orbit.style.setProperty('--rh', px(halo * k));
      orbit.style.setProperty('--rc', px(core * k));
    },
    // once the markup is on the page: draw(heights) stands each part's walls at its height. A part
    // whose height hasn't changed since the last draw is left as it is; hs: the heights the markup
    // was made at, if it was made standing (walls(hs))
    bind(root, hs = null) {
      const els = [];
      for (const g of root.querySelectorAll('[data-walls] [data-s]')) {
        const f = [];
        for (const p of g.children) f.push([p.getAttribute('data-f'), p]);
        els.push({ c: slices[+g.getAttribute('data-s')], f });
      }
      let drawn = hs ? [...hs] : [];
      return (hs) => {
        for (const { c, f } of els) {
          const hh = hs[c.i];
          if (hh === drawn[c.i]) continue;
          for (const [k, p] of f) p.setAttribute('d', faceD(c, k, hh));
        }
        drawn = [...hs];
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
  // the plate (with the centre's light), the light round the plate's edge, then each agent's walls in
  // a drawing of its own, from the back to the front: the light passes behind the walls, a wall that
  // moves redraws only its own drawing, and an agent's walls brighten or dim as one layer
  const open = (c, more = '') => `<svg class="${c}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" focusable="false"${more}>`;
  host.innerHTML = `<div class="r3d${cls ? ` ${cls}` : ''}"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>`
    + `${open('r3d-plate')}${geo.base()}${orb}</svg>`
    + '<div class="orbit-box" aria-hidden="true"><div class="orbit r3d-orbit"><i class="orbit-arm"><i class="orbit-dot"></i></i></div></div>'
    + geo.partWalls().map(([key, markup]) => `${open('r3d-part rg', ` data-a="${key}"`)}${markup}</svg>`).join('')
    + '</div>';
  host.classList.add('is-3d');
  const wrap = host.firstElementChild, plate = wrap.querySelector('.r3d-plate'), orbit = wrap.querySelector('.orbit');
  const walls = [...wrap.querySelectorAll('svg.r3d-part')];
  walls.forEach((g) => g.classList.toggle('on', was.get(g.dataset.a) !== false));
  const draw = geo.bind(wrap);
  const want = () => walls.map((g) => (g.classList.contains('is-lit') ? LIT : g.classList.contains('on') ? ON : g.classList.contains('is-now') ? RUN : OFF));
  let hs = want(), from = hs, to = hs, t0 = 0, raf = 0, seen = !('IntersectionObserver' in win);
  draw(hs);
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 450), e = 1 - (1 - k) ** 3;
    hs = from.map((v, i) => v + (to[i] - v) * e);
    draw(hs);
    raf = k < 1 ? win.requestAnimationFrame(step) : 0;
  };
  // (off screen, the walls go straight to where they're going: nobody would see them move)
  const sync = () => {
    const next = want();
    if (next.every((v, i) => v === to[i])) return;
    to = next;
    if (still || !seen) { if (raf) { win.cancelAnimationFrame(raf); raf = 0; } hs = to; draw(hs); return; }
    from = hs; t0 = win.performance.now();
    if (!raf) raf = win.requestAnimationFrame(step);
  };
  // whatever changes a piece's classes moves its wall
  let queued = false;
  new win.MutationObserver(() => { if (queued) return; queued = true; win.requestAnimationFrame(() => { queued = false; sync(); }); })
    .observe(wrap, { subtree: true, attributes: true, attributeFilter: ['class'] });
  // the light round the plate's edge, once every 2.4 seconds while the agents work and the ring is on
  // screen, moved by the compositor (geo.placeOrbit), so it keeps going while the page is busy
  let working = false, placed = false;
  const light = () => {
    const on = working && !still;
    if (on && !placed) {
      placed = true;
      geo.placeOrbit(orbit, plate, orbit.parentElement, { halo: 8, core: 3 });
      if ('ResizeObserver' in win) new win.ResizeObserver(() => geo.placeOrbit(orbit, plate, orbit.parentElement, { halo: 8, core: 3 })).observe(wrap);
    }
    orbit.classList.toggle('is-on', on);
  };
  if (!seen) new win.IntersectionObserver((es) => { seen = es.some((x) => x.isIntersecting); orbit.classList.toggle('is-away', !seen); }, { rootMargin: '60px' }).observe(wrap);
  return { svg: wrap, sync, busy(on) { working = !!on; light(); } };
}
