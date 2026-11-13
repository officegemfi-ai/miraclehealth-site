#!/usr/bin/env node
// Checks every page in design/pages.json at the widths where its layouts switch, and fails when
//   - the page is wider than the screen (it scrolls sideways), naming what sticks out;
//   - text is cut off sideways or below by a box that hides what overflows (an ellipsis counts as cut);
//   - a table scrolls sideways inside its frame.
// Text clamped on purpose (-webkit-line-clamp) and panes that scroll up and down are fine.
//
// The site is served from this folder. The live Signal is answered from tests/fixtures/signal.json, so the
// numbers and the boards show as they do live; every other host is blocked. Motion is reduced, so nothing is
// caught halfway through playing in.
//
// Needs Playwright with Chromium (CI installs them):
//   npm install --no-save playwright && npx playwright install --with-deps chromium
// Locally, CHROME_PATH=/usr/bin/google-chrome uses that Chrome instead.
//
//   node scripts/check_layout.mjs                       every page at every width
//   node scripts/check_layout.mjs --pages home,asksig   some pages
//   node scripts/check_layout.mjs --widths 1024,390     some widths
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURE = readFileSync(join(ROOT, 'tests/fixtures/signal.json'), 'utf8');
// where layouts switch: the side panel's bands (900, 1280), How it works (901 to 1279), the example
// (861 to 1100), Ask Sig's agents pane (to about 1700) and phones
const WIDTHS = [1600, 1440, 1280, 1180, 1100, 1024, 960, 901, 860, 768, 600, 430, 390, 360];

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
};
const widths = (arg('widths') || WIDTHS).map(Number);
const only = arg('pages');
const pages = JSON.parse(readFileSync(join(ROOT, 'design/pages.json'), 'utf8'))
  .filter(([name]) => !only || only.includes(name));

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('check_layout needs Playwright: npm install --no-save playwright && npx playwright install chromium');
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

// ---- what one page at one width shows: run inside the page
const MEASURE = () => {
  const W = innerWidth;
  // closed drawers sit off screen on purpose
  const offscreen = (el) => { const r = el.getBoundingClientRect(); return r.right <= 1 || r.left >= W - 1; };
  const drawers = [...document.querySelectorAll('.os-side, .os-scrim, .cmdk-scrim, .sg-side, .sg-scrim, dialog:not([open])')]
    .filter((d) => offscreen(d) || getComputedStyle(d).display === 'none' || getComputedStyle(d).visibility === 'hidden');
  const inDrawer = (el) => drawers.some((d) => d.contains(el));
  const cs = new Map();
  const CS = (el) => { let c = cs.get(el); if (!c) { c = getComputedStyle(el); cs.set(el, c); } return c; };
  const visible = (el) => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const c = CS(e);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
    }
    return true;
  };
  const name = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const c = [...el.classList].slice(0, 2);
    if (c.length) s += `.${c.join('.')}`;
    return s;
  };
  const path = (el, k = 3) => { const a = []; for (let e = el, i = 0; e && e.nodeType === 1 && i < k; i++, e = e.parentElement) a.unshift(name(e)); return a.join(' > '); };
  const scrolls = (v) => v === 'auto' || v === 'scroll';

  const out = { width: document.documentElement.scrollWidth, past: [], cut: [], tables: [] };

  // what sticks out past the screen, outside any box that holds its overflow
  if (out.width > W + 1) {
    for (const el of document.body.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
      const r = el.getBoundingClientRect();
      // only the right edge widens a page: what is parked left of it (the skip link) can't be scrolled to
      if (!r.width || !r.height || r.right <= W + 1) continue;
      if (inDrawer(el) || CS(el).position === 'fixed' || !visible(el)) continue;
      let held = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (CS(a).overflowX !== 'visible') { held = true; break; }
      }
      if (!held) out.past.push(`${path(el)} (to x ${Math.round(r.right)})`);
    }
    out.past = out.past.slice(-3);
  }

  // text cut by the nearest box that hides overflow
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const text = n.textContent.trim();
    if (!text) continue;
    const p = n.parentElement;
    if (!p || p.closest('svg, script, style, noscript, template, textarea, [aria-hidden="true"]') || inDrawer(p)) continue;
    const pr = p.getBoundingClientRect();
    if (pr.width < 3 || pr.height < 3 || !visible(p)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const t = range.getBoundingClientRect();
    if (t.width < 1) continue;
    for (let a = p; a && a !== document.body; a = a.parentElement) {
      const c = CS(a);
      if (c.overflowX === 'visible' && c.overflowY === 'visible') continue;
      const r = a.getBoundingClientRect();
      if (r.width < 3) break;
      const side = Math.max(t.right - r.right, r.left - t.left);
      // a line's box runs past its glyphs by up to half its size (line heights under 1.2): below that, nothing
      // shows as cut
      const below = t.bottom - r.bottom;
      const clamped = [p, a].some((e) => CS(e).webkitLineClamp && CS(e).webkitLineClamp !== 'none');
      if (side > 1 && !scrolls(c.overflowX)) out.cut.push(`“${text.slice(0, 48)}” in ${path(p, 2)}, ${Math.round(side)}px cut sideways`);
      else if (below > Math.max(4, parseFloat(CS(p).fontSize) / 2) && !scrolls(c.overflowY) && !clamped) out.cut.push(`“${text.slice(0, 48)}” in ${path(p, 2)}, ${Math.round(below)}px cut below`);
      break;
    }
  }

  // tables that scroll sideways inside their frame
  for (const t of document.querySelectorAll('table')) {
    if (inDrawer(t) || !visible(t)) continue;
    for (let a = t.parentElement; a && a !== document.body; a = a.parentElement) {
      if (!scrolls(CS(a).overflowX)) continue;
      const over = a.scrollWidth - a.clientWidth;
      if (over > 1) out.tables.push(`${path(t, 2)} scrolls ${over}px sideways inside ${name(a)}`);
      break;
    }
  }
  return out;
};

// ---- every page at every width
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const problems = [];
let views = 0;
for (const w of widths) {
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
    await page.evaluate(async () => {
      await document.fonts.ready;
      // once down the page and back, so what plays in as it comes into view is there
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
        scrollTo(0, y);
        await new Promise((ok) => requestAnimationFrame(() => setTimeout(ok, 20)));
      }
      scrollTo(0, 0);
      await new Promise((ok) => setTimeout(ok, 120));
    });
    const m = await page.evaluate(MEASURE);
    views++;
    const at = `${name} at ${w}px`;
    if (m.width > w + 1) problems.push(`${at}: the page is ${m.width}px wide, ${m.width - w}px wider than the screen${m.past.length ? `; sticking out: ${m.past.join(', ')}` : ''}`);
    for (const c of m.cut) problems.push(`${at}: ${c}`);
    for (const t of m.tables) problems.push(`${at}: ${t}`);
  }
  await ctx.close();
}
await browser.close();
server.close();

if (problems.length) {
  for (const p of problems) console.log(process.env.GITHUB_ACTIONS ? `::error::${p}` : p);
  console.log(`layout: ${problems.length} problem${problems.length === 1 ? '' : 's'} in ${views} views (${pages.length} pages at ${widths.length} widths)`);
  process.exit(1);
}
console.log(`layout: ${views} views (${pages.length} pages at ${widths.length} widths), nothing scrolls sideways or is cut off`);
