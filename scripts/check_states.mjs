#!/usr/bin/env node
// Checks what the brand check can't see, because it only shows in a browser: the states. On every page
// in design/pages.json it fails when
//   - a stop you reach with Tab shows no ring: every focus gets a solid 2px ring in text white, outside
//     the control (inside only where the control sits in a strip that scrolls or clips, such as the chat
//     tabs). A ring drawn on the box around a field (the typing bar, the front page's boxes) counts;
//   - two electric blue main actions show in one view: there is one per view;
//   - on a phone (390px), a field is set under 16px, which makes an iPhone zoom the page when it's tapped.
//
// It serves the site and answers the Signal from tests/fixtures/signal.json, as check_layout.mjs does,
// with motion reduced. Needs Playwright with Chromium (CI installs them); locally CHROME_PATH picks a Chrome.
//
//   node scripts/check_states.mjs                       every page
//   node scripts/check_states.mjs --pages home,asksig   some pages
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURE = readFileSync(join(ROOT, 'tests/fixtures/signal.json'), 'utf8');
const STOPS = 60;   // how far down each page Tab walks
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
};
const only = arg('pages');
const pages = JSON.parse(readFileSync(join(ROOT, 'design/pages.json'), 'utf8')).filter(([name]) => !only || only.includes(name));

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('check_states needs Playwright: npm install --no-save playwright && npx playwright install chromium');
  process.exit(2);
}

// ---- the site, served as GitHub Pages serves it
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};
const fileFor = (url) => {
  const p = normalize(decodeURIComponent(new URL(url, 'http://x').pathname));
  if (p.split(sep).includes('..')) return null;
  const base = join(ROOT, p);
  for (const f of [base, join(base, 'index.html'), `${base}.html`]) {
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
};
const server = createServer((req, res) => {
  const f = fileFor(req.url);
  if (!f) { res.writeHead(404, { 'Content-Type': 'text/html' }); createReadStream(join(ROOT, '404.html')).pipe(res); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// ---- the focused element's ring: run inside the page after each Tab
const RING = () => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const name = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += `#${e.id}`; const c = [...e.classList].slice(0, 2); if (c.length) s += `.${c.join('.')}`; return s; };
  const r = el.getBoundingClientRect();
  // skip what can't be seen: a closed drawer, something parked off screen (the skip link at rest)
  for (let e = el; e && e !== document.body; e = e.parentElement) {
    const c = getComputedStyle(e);
    if (c.display === 'none' || c.visibility === 'hidden' || e.inert) return { skip: true };
  }
  if (!r.width || !r.height || r.right <= 0 || r.left >= innerWidth) return { skip: true };
  const light = (col) => { const m = col.match(/[\d.]+/g); if (!m) return false; const [R, G, B, A = 1] = m.map(Number); return A > 0.8 && 0.2126 * R + 0.7152 * G + 0.0722 * B > 200; };
  const ringOf = (e) => { const c = getComputedStyle(e); return { ok: c.outlineStyle === 'solid' && parseFloat(c.outlineWidth) >= 2 && light(c.outlineColor), offset: parseFloat(c.outlineOffset) || 0, what: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} offset ${c.outlineOffset}` }; };
  let ring = ringOf(el), on = el;
  // a field inside a box draws its ring on the box (:has(:focus-visible)): look two boxes up
  if (!ring.ok) for (let e = el.parentElement, i = 0; e && i < 2; e = e.parentElement, i++) { const x = ringOf(e); if (x.ok) { ring = x; on = e; break; } }
  if (!ring.ok) return { el: name(el), problem: `no 2px ring (${ring.what})` };
  if (ring.offset < 0) {
    // inside is right only in a strip that scrolls or clips, where an outside ring would be cut
    let clipped = false;
    for (let e = on.parentElement; e && e !== document.body; e = e.parentElement) { const c = getComputedStyle(e); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { clipped = true; break; } }
    if (!clipped) return { el: name(el), problem: `ring drawn inside (offset ${ring.offset}px) with room outside` };
  }
  return { el: name(el) };
};
// ---- electric blue main actions, and small fields
const VIEW = () => {
  const name = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += `#${e.id}`; const c = [...e.classList].slice(0, 2); if (c.length) s += `.${c.join('.')}`; return s; };
  const shown = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || x.inert) return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth; };
  const blue = [];
  for (const e of document.querySelectorAll('a, button, input[type=submit]')) {
    const c = getComputedStyle(e);
    if (c.backgroundColor !== 'rgb(26, 4, 255)' || !shown(e)) continue;   // --act, the one main action
    const r = e.getBoundingClientRect();
    blue.push({ el: `${name(e)} “${(e.textContent || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 28)}”`, top: r.top + scrollY, bottom: r.bottom + scrollY, fixed: c.position === 'fixed' });
  }
  const twos = [];
  for (let i = 0; i < blue.length; i++) for (let j = i + 1; j < blue.length; j++) {
    const a = blue[i], b = blue[j];
    // in one view: both fit in the screen's height together (a fixed one is in every view)
    if (a.fixed || b.fixed || Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top) <= innerHeight) twos.push(`${a.el} and ${b.el}`);
  }
  const small = innerWidth <= 430 ? [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea')]
    .filter((e) => shown(e) && parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => `${name(e)} at ${getComputedStyle(e).fontSize}`) : [];
  return { twos, small };
};

// ---- every page, at a laptop and a phone
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const problems = [];
let stops = 0, views = 0;
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w <= 600 ? 844 : 900 }, reducedMotion: 'reduce' });
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(ORIGIN)) return route.continue();
    if (u.includes('functions/v1/signal') || u.includes('snapshot.json')) {
      return route.fulfill({ status: 200, body: FIXTURE, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    return route.abort();
  });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    await page.goto(ORIGIN + path, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; await new Promise((ok) => setTimeout(ok, 300)); });
    views++;
    const at = `${name} at ${w}px`;
    const v = await page.evaluate(VIEW);
    for (const t of v.twos) problems.push(`${at}: two electric blue main actions in one view: ${t}`);
    for (const s of v.small) problems.push(`${at}: a field under 16px (an iPhone zooms the page): ${s}`);
    // Tab walk: each stop's ring, once per element
    const seen = new Set();
    await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo(0, 0); });
    for (let i = 0; i < STOPS; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(RING);
      if (!f || f.skip) continue;
      if (seen.has(f.el)) continue;
      seen.add(f.el);
      stops++;
      if (f.problem) problems.push(`${at}: ${f.el}: ${f.problem}`);
    }
  }
  await ctx.close();
}
await browser.close();
server.close();

if (problems.length) {
  for (const p of problems) console.log(process.env.GITHUB_ACTIONS ? `::error::${p}` : p);
  console.log(`states: ${problems.length} problem${problems.length === 1 ? '' : 's'} in ${views} views and ${stops} focus stops`);
  process.exit(1);
}
console.log(`states: ${views} views and ${stops} focus stops: every focus shows its ring, one blue action per view, phone fields at 16px`);
