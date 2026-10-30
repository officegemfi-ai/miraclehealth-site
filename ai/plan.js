// The Miracle Plan: a member's plan, built from the ground up. Three pillars at the base
// (nutrition, sleep, exercise), then their peptides and medicines, then the supplements that
// shore up their weak spot, and wellbeing and community on top. The pillar that needs work is
// marked "Focus here": the plan is built around it.
// Drawn in the chat (/ai/) and on the page a shared plan opens (/plan/). A shared plan travels in
// the part of the link after "#", which browsers never send to a server, so Miracle Health never
// receives or keeps it. It can also be saved as an image, drawn in the browser.
// Nothing here uses innerHTML: every word is placed with textContent.

const PILLARS = ['nutrition', 'sleep', 'exercise'];
const PILLAR = { nutrition: 'Nutrition', sleep: 'Sleep', exercise: 'Exercise' };
const STATE = { strong: 'Strong', focus: 'Focus here', unknown: 'Not sure yet' };
const STATE_SR = { strong: 'strong', focus: 'your focus: the plan is built around it', unknown: 'not sure yet' };
const EVIDENCE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Early human studies', preclinical: 'Animal or lab studies', anecdotal: 'User reports' };
const TONES = { ok: 'o', warn: 'w', none: 'n' };
const TONE_OF = { o: 'ok', w: 'warn', n: 'none' };
const isId = (s) => typeof s === 'string' && /^[a-z0-9]{1,40}$/.test(s);
const clip = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== '') el.append(k instanceof Node ? k : String(k));
  return el;
}

// The evidence for what they asked about, or else the compound's overall evidence
const evidenceOf = (it) => EVIDENCE[(it.use && it.use.fits && it.use.grade) || it.grade] || '';

// ---------------------------------------------------------------------------
// On screen
// ---------------------------------------------------------------------------
function block(it) {
  const name = isId(it.id) ? h('a', { class: 'block-name', href: `/library/${it.id}/`, text: it.name }) : h('b', { class: 'block-name', text: it.name });
  const ev = evidenceOf(it);
  return h('li', { class: `block tone-${it.tone || 'none'}` },
    name,
    it.role ? h('span', { class: 'block-role', text: it.role }) : null,
    h('span', { class: 'block-meta' },
      it.tag ? h('span', { class: 'block-tag', text: it.tag }) : null,
      ev ? h('span', { class: 'block-ev', text: ev }) : null));
}

function tier(kind, name, items, empty) {
  return h('section', { class: `tier tier-${kind}`, 'aria-label': name },
    h('h3', { class: 'tier-name', text: name }),
    items.length ? h('ul', { class: 'blocks' }, items.map(block)) : h('p', { class: 'tier-empty', text: empty }));
}

// card: { title, foundations: [{ pillar, state, step }], peptides, supplements, wellbeing, hidden? }
// opts: { kick, share (link and image buttons), save (image only), live (build animation) }
export function node(card, opts = {}) {
  const fs = PILLARS.map((p) => card.foundations?.find((f) => f.pillar === p) || { pillar: p, state: 'unknown', step: '' });
  const focus = fs.filter((f) => f.state === 'focus').map((f) => PILLAR[f.pillar].toLowerCase());
  const el = h('section', { class: 'card plan', 'aria-label': `${opts.kick || 'Your Miracle Plan'}: ${card.title}` });
  el.append(h('header', { class: 'plan-head' },
    h('p', { class: 'plan-kick', text: opts.kick || 'Your Miracle Plan' }),
    h('h2', { class: 'plan-title', text: card.title || 'Your Miracle Plan' }),
    h('p', { class: 'plan-sub', text: focus.length
      ? `Built from the ground up, around ${focus.join(' and ')}: that’s where the biggest win is.`
      : 'Built from the ground up: the three pillars hold up everything above them.' })));

  // In reading order the foundations come first, as the plan is built; on screen they're the base
  const base = h('ul', { class: 'plan-base', 'aria-label': 'Foundations' }, fs.map((f) => h('li', { class: `pillar is-${f.state}` },
    h('span', { class: 'pillar-cap', 'aria-hidden': 'true' }),
    h('h3', { class: 'pillar-name' }, PILLAR[f.pillar], h('span', { class: 'sr', text: `: ${STATE_SR[f.state] || 'not sure yet'}.` })),
    h('span', { class: 'pillar-state', 'aria-hidden': 'true', text: STATE[f.state] || STATE.unknown }),
    f.step ? h('p', { class: 'pillar-step', text: f.step }) : null)));
  const pep = card.hidden
    ? h('section', { class: 'tier tier-pep', 'aria-label': 'Peptides and medicines' }, h('h3', { class: 'tier-name', text: 'Peptides & medicines' }), h('p', { class: 'tier-empty', text: 'Kept private' }))
    : tier('pep', 'Peptides & medicines', card.peptides || [], 'None right now: the pillars do the work');
  const sup = tier('sup', 'Supplements', card.supplements || [], 'None needed right now');
  const top = h('section', { class: 'tier tier-top', 'aria-label': 'Wellbeing and community' },
    h('h3', { class: 'tier-name', text: 'Wellbeing & community' }),
    (card.wellbeing || []).length
      ? h('ul', { class: 'well' }, card.wellbeing.map((w) => h('li', { text: w })))
      : h('p', { class: 'tier-empty', text: 'Share the wins: the Miracle Health community has your back' }));
  el.append(h('div', { class: 'plan-build' }, base, h('div', { class: 'plan-plinth', 'aria-hidden': 'true' }, h('i', { class: 'plinth-bar' }), h('span', { text: 'Foundations' })), pep, sup, top));
  el.append(h('div', { class: 'audit', hidden: true }));
  if (opts.share || opts.save) el.append(foot(card, opts));
  if (opts.live) build(el);
  return el;
}

// The one moment: the ground is laid, the pillars rise, the floors settle on them. Played once,
// with the Web Animations API, so the chat redrawing around the card doesn't start it again.
function build(el) {
  if (reduceMotion() || typeof el.animate !== 'function') return;
  const ease = 'cubic-bezier(.2,.8,.2,1)';
  const run = (node, from, ms, delay) => node?.animate([from, { transform: 'none', opacity: 1 }], { duration: ms, delay, easing: ease, fill: 'backwards' });
  run(el.querySelector('.plinth-bar'), { transform: 'scaleX(.15)', opacity: 0 }, 450, 0);
  el.querySelectorAll('.pillar').forEach((p, i) => run(p, { transform: 'translateY(16px) scaleY(.9)', opacity: 0 }, 500, 220 + i * 90));
  ['.tier-pep', '.tier-sup', '.tier-top'].forEach((sel, i) => run(el.querySelector(sel), { transform: 'translateY(-12px)', opacity: 0 }, 420, 580 + i * 120));
}

function foot(card, opts) {
  // Their own plan can leave out what they take before they share it
  const mine = !!opts.share && !card.hidden && (card.peptides || []).length > 0;
  const incl = mine ? h('input', { type: 'checkbox', checked: true }) : null;
  const status = h('span', { class: 'plan-status', role: 'status', 'aria-live': 'polite' });
  const say = (t) => { status.textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { status.textContent = ''; }, 4000); };
  const pick = () => ({ ...card, hidden: card.hidden || (incl ? !incl.checked : false) });
  const share = opts.share ? h('button', { class: 'plan-btn primary', type: 'button', text: 'Share with family & friends' }) : null;
  const save = h('button', { class: 'plan-btn', type: 'button', text: 'Save image' });
  share?.addEventListener('click', async () => {
    try {
      const url = await link(pick());
      if (navigator.share) {
        try { await navigator.share({ title: 'My Miracle Plan', text: `${card.title}: my plan, built from the ground up with Miracle AI.`, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      await navigator.clipboard.writeText(url);
      say('Link copied. Paste it into a message.');
    } catch { say('Couldn’t make the link just now. Try Save image instead.'); }
  });
  save.addEventListener('click', async () => {
    save.disabled = true;
    try {
      const blob = await image(pick());
      const a = h('a', { href: URL.createObjectURL(blob), download: 'my-miracle-plan.png' });
      document.body.append(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      say('Image saved.');
    } catch { say('Couldn’t draw the image just now.'); }
    save.disabled = false;
  });
  return h('footer', { class: 'plan-foot' },
    incl ? h('label', { class: 'plan-incl' }, incl, h('span', { text: 'Include my peptides and medicines' })) : null,
    h('div', { class: 'plan-actions' }, share, save, status),
    h('p', { class: 'plan-note', text: opts.share
      ? 'A shared plan travels inside its link: Miracle Health never receives it. Talk any change through with your clinician.'
      : 'Talk any change through with your own clinician.' }));
}

// ---------------------------------------------------------------------------
// In a link: compact, compressed, and checked field by field when opened
// ---------------------------------------------------------------------------
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}
const item = (it) => [it.id, clip(it.name, 60), clip(it.role, 50), clip(it.tag, 30), TONES[it.tone] || 'n', (it.use && it.use.fits && it.use.grade) || it.grade || ''];
export async function encode(card) {
  const c = {
    v: 1, t: clip(card.title, 60),
    f: PILLARS.map((p) => { const f = card.foundations?.find((x) => x.pillar === p) || {}; return [p[0], (f.state || 'unknown')[0], clip(f.step, 90)]; }),
    p: card.hidden ? [] : (card.peptides || []).slice(0, 4).map(item),
    s: (card.supplements || []).slice(0, 4).map(item),
    w: (card.wellbeing || []).slice(0, 3).map((w) => clip(w, 80)),
    ...(card.hidden ? { x: 1 } : {}),
  };
  const json = new TextEncoder().encode(JSON.stringify(c));
  if (typeof CompressionStream === 'function') {
    try { return `z${b64url(await pipe(json, new CompressionStream('deflate-raw')))}`; } catch { /* fall through */ }
  }
  return `u${b64url(json)}`;
}
// A link someone hands over is data, never trusted: every field is checked and clipped
export async function decode(s) {
  const raw = String(s || '').replace(/^#/, '');
  if (!/^[zu][A-Za-z0-9_-]{2,6000}$/.test(raw)) throw new Error('not a plan');
  let bytes = unb64url(raw.slice(1));
  if (raw[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  const c = JSON.parse(new TextDecoder().decode(bytes));
  if (!c || c.v !== 1) throw new Error('unknown plan version');
  const arr = (x, n) => (Array.isArray(x) ? x.slice(0, n) : []);
  const STATES = { s: 'strong', f: 'focus', u: 'unknown' };
  const items = (x) => arr(x, 4).filter((r) => Array.isArray(r) && isId(r[0])).map(([id, name, role, tag, tone, grade]) => ({
    id, name: clip(name, 60) || id, role: clip(role, 50), tag: clip(tag, 30), tone: TONE_OF[tone] || 'none',
    grade: EVIDENCE[grade] ? grade : null, use: null,
  }));
  const found = arr(c.f, 3).filter(Array.isArray);
  return {
    title: clip(c.t, 60) || 'A Miracle Plan',
    foundations: PILLARS.map((p) => {
      const f = found.find((x) => x[0] === p[0]) || [];
      return { pillar: p, state: STATES[f[1]] || 'unknown', step: clip(f[2], 90) };
    }),
    peptides: items(c.p), supplements: items(c.s),
    wellbeing: arr(c.w, 3).map((w) => clip(w, 80)).filter(Boolean),
    hidden: c.x === 1,
  };
}
export async function link(card) { return `${location.origin}/plan/#${await encode(card)}`; }

// ---------------------------------------------------------------------------
// As an image: the same plan, drawn on a canvas in the browser
// ---------------------------------------------------------------------------
const C = {
  bg: '#0C1413', ink: '#121E1D', text: '#FCFCFC', text2: 'rgba(252,252,252,.74)', text3: 'rgba(252,252,252,.52)',
  line: 'rgba(255,255,255,.16)', lime: '#D8FF3D', amber: '#F2C46B',
};
const F = {
  brand: '600 30px Inter, system-ui, sans-serif', kick: '500 21px "IBM Plex Mono", ui-monospace, monospace',
  title: '600 54px Inter, system-ui, sans-serif', name: '600 28px Inter, system-ui, sans-serif',
  pillar: '600 31px Inter, system-ui, sans-serif', body: '400 24px "Plus Jakarta Sans", system-ui, sans-serif',
  small: '400 21px "Plus Jakarta Sans", system-ui, sans-serif', chip: '500 18px "IBM Plex Mono", ui-monospace, monospace',
};
function lines(ctx, text, max) {
  const out = [];
  for (const para of String(text || '').split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= max || !line) line = next;
      else { out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}
function rrect(ctx, x, y, w, hgt, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hgt, r);
  ctx.arcTo(x + w, y + hgt, x, y + hgt, r);
  ctx.arcTo(x, y + hgt, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Lays the plan out from the top; draws it too when `draw` is set. Returns the height it needs.
function paint(ctx, card, W, draw) {
  const P = 64;
  const inner = W - 2 * P;
  let y = P;
  const spaced = (px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px; };
  const text = (t, x, yy, font, color, align = 'left') => {
    if (!draw) return;
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillText(t, x, yy);
  };
  const para = (t, x, yy, max, font, color, lh) => {
    ctx.font = font;
    const ls = lines(ctx, t, max);
    ls.forEach((l, i) => text(l, x, yy + lh * (i + 1) - lh * 0.28, font, color));
    return ls.length * lh;
  };

  // The brand and where to make one
  if (draw) {
    ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(P + 9, y + 20, 9, 0, Math.PI * 2); ctx.fill();
    spaced('0px'); text('Miracle Health', P + 30, y + 31, F.brand, C.text);
    spaced('1px'); text('miraclehealth.us/ai', W - P, y + 29, F.chip, C.text3, 'right'); spaced('0px');
  }
  y += 82;
  spaced('3px'); text('MY MIRACLE PLAN', P, y + 22, F.kick, C.lime); spaced('0px');
  y += 40;
  y += para(card.title || 'My Miracle Plan', P, y, inner, F.title, C.text, 64) + 30;

  // A layer: a label, then blocks two to a row (or words, for wellbeing)
  const layer = (label, fill, stroke, labelColor, body) => {
    const pad = 28;
    const top = y;
    const h0 = 24 + pad;               // label
    const bodyH = body(P + pad, top + pad + h0, inner - 2 * pad, false);
    const hgt = pad + h0 + bodyH + pad;
    if (draw) {
      rrect(ctx, P, top, inner, hgt, 20); ctx.fillStyle = fill; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke();
      spaced('2px'); text(label, P + pad, top + pad + 20, F.chip, labelColor); spaced('0px');
      body(P + pad, top + pad + h0, inner - 2 * pad, true);
    }
    y = top + hgt + 16;
  };
  const blocks = (items, empty) => (x, yy, w, d) => {
    if (!items.length) {
      ctx.font = F.body;
      if (d && draw) text(empty, x, yy + 24, F.body, C.text3);
      return 34;
    }
    const gap = 14;
    const bw = (w - gap) / 2;
    let used = 0;
    for (let r = 0; r < items.length; r += 2) {
      const row = items.slice(r, r + 2);
      const hs = row.map((it) => {
        ctx.font = F.name; const n = lines(ctx, it.name, bw - 36).length;
        ctx.font = F.small; const ro = it.role ? lines(ctx, it.role, bw - 36).length : 0;
        return 22 + n * 34 + ro * 28 + 10 + 30 + 18;
      });
      const rh = Math.max(...hs);
      if (d && draw) {
        row.forEach((it, i) => {
          const bx = x + i * (bw + gap);
          const by = yy + used;
          rrect(ctx, bx, by, bw, rh, 14); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill();
          ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();
          let ty = by + 22;
          ty += para(it.name, bx + 18, ty, bw - 36, F.name, C.text, 34);
          if (it.role) ty += para(it.role, bx + 18, ty, bw - 36, F.small, C.text2, 28);
          const tag = [it.tag, evidenceOf(it)].filter(Boolean);
          spaced('1px');
          ctx.font = F.chip;
          let tx = bx + 18;
          for (const [k, t] of tag.entries()) {
            text(t.toUpperCase(), tx, ty + 32, F.chip, k === 0 ? (it.tone === 'warn' ? C.amber : C.lime) : C.text3);
            tx += ctx.measureText(t.toUpperCase()).width + 18;
          }
          spaced('0px');
        });
      }
      used += rh + gap;
    }
    return used - gap;
  };

  const well = card.wellbeing || [];
  layer('WELLBEING & COMMUNITY', 'rgba(216,255,61,.08)', 'rgba(216,255,61,.38)', C.lime, (x, yy, w, d) => {
    if (!well.length) { if (d && draw) text('Share the wins: the Miracle Health community has your back', x, yy + 24, F.body, C.text2); return 34; }
    let used = 0;
    for (const t of well) {
      ctx.font = F.body;
      const n = lines(ctx, t, w - 26).length;
      if (d && draw) {
        ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(x + 6, yy + used + 17, 5, 0, Math.PI * 2); ctx.fill();
        para(t, x + 26, yy + used, w - 26, F.body, C.text, 32);
      }
      used += n * 32 + 8;
    }
    return used - 8;
  });
  layer('SUPPLEMENTS', 'rgba(255,255,255,.035)', C.line, C.text3, blocks(card.supplements || [], 'None needed right now'));
  layer('PEPTIDES & MEDICINES', 'rgba(255,255,255,.035)', C.line, C.text3,
    card.hidden ? (x, yy, w, d) => { if (d && draw) text('Kept private', x, yy + 24, F.body, C.text3); return 34; }
      : blocks(card.peptides || [], 'None right now: the pillars do the work'));

  // The pillars
  y += 6;
  const gap = 18;
  const pw = (inner - 2 * gap) / 3;
  const fs = PILLARS.map((p) => card.foundations?.find((f) => f.pillar === p) || { pillar: p, state: 'unknown', step: '' });
  const ph = Math.max(280, ...fs.map((f) => { ctx.font = F.small; return 30 + 40 + 46 + lines(ctx, f.step, pw - 40).length * 29 + 30; }));
  if (draw) {
    fs.forEach((f, i) => {
      const x = P + i * (pw + gap);
      rrect(ctx, x, y, pw, ph, 16);
      if (f.state === 'focus') {
        ctx.fillStyle = 'rgba(216,255,61,.10)'; ctx.fill();
        ctx.save(); rrect(ctx, x, y, pw, ph, 16); ctx.clip();
        ctx.strokeStyle = 'rgba(216,255,61,.14)'; ctx.lineWidth = 5;
        for (let k = -ph; k < pw + ph; k += 22) { ctx.beginPath(); ctx.moveTo(x + k, y + ph); ctx.lineTo(x + k + ph, y); ctx.stroke(); }
        ctx.restore();
        rrect(ctx, x, y, pw, ph, 16); ctx.lineWidth = 3; ctx.strokeStyle = C.lime; ctx.stroke();
      } else if (f.state === 'strong') {
        ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.stroke();
        ctx.fillStyle = C.lime; rrect(ctx, x + 20, y + 18, pw - 40, 6, 3); ctx.fill();
      } else {
        ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.36)'; ctx.stroke(); ctx.setLineDash([]);
      }
      let ty = y + 34;
      text(PILLAR[f.pillar], x + 20, ty + 30, F.pillar, C.text);
      ty += 50;
      const label = (STATE[f.state] || STATE.unknown).toUpperCase();
      spaced('1px'); ctx.font = F.chip;
      const cw = ctx.measureText(label).width + 24;
      rrect(ctx, x + 20, ty, cw, 32, 16);
      if (f.state === 'focus') { ctx.fillStyle = C.lime; ctx.fill(); text(label, x + 32, ty + 22, F.chip, C.ink); }
      else { ctx.lineWidth = 1.5; ctx.strokeStyle = f.state === 'strong' ? C.lime : 'rgba(255,255,255,.4)'; ctx.stroke(); text(label, x + 32, ty + 22, F.chip, f.state === 'strong' ? C.lime : C.text2); }
      spaced('0px');
      ty += 46;
      if (f.step) para(f.step, x + 20, ty, pw - 40, F.small, C.text2, 29);
    });
  }
  y += ph;
  // The ground they stand on
  if (draw) { ctx.fillStyle = C.lime; rrect(ctx, P - 10, y + 10, inner + 20, 12, 6); ctx.fill(); }
  y += 22 + 34;
  spaced('3px'); text('FOUNDATIONS', W / 2, y, F.chip, C.text3, 'center'); spaced('0px');
  y += 42;
  y += para('Made with Miracle AI at miraclehealth.us/ai. Education, not medical advice: talk any change through with your own clinician.', P, y, inner, F.small, C.text3, 30);
  return y + P;
}

export async function image(card) {
  try {
    await Promise.all([F.brand, F.kick, F.title, F.name, F.pillar, F.body, F.small, F.chip].map((f) => document.fonts.load(f)));
  } catch { /* system fonts will do */ }
  const W = 1080;
  const scratch = document.createElement('canvas').getContext('2d');
  const H = Math.max(1350, Math.ceil(paint(scratch, card, W, false)));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  paint(ctx, card, W, true);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no image'))), 'image/png'));
}

window.MHPlan = { node, encode, decode, link, image };

// ---------------------------------------------------------------------------
// The page a shared plan opens
// ---------------------------------------------------------------------------
const root = document.getElementById('plan-root');
if (root) {
  const show = async () => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const intro = root.querySelector('.plan-intro');
    try {
      const card = await decode(hash);
      root.replaceChildren(...(intro ? [intro] : []), node(card, { kick: 'A Miracle Plan', save: true, live: true }));
    } catch {
      root.replaceChildren(h('h1', { class: 'plan-oops', text: 'This plan couldn’t be opened' }),
        h('p', { class: 'plan-oops-p', text: 'The link may have been cut short when it was copied. Ask for it again, or build your own plan with Miracle AI.' }));
    }
  };
  window.addEventListener('hashchange', show);
  show();
}

