#!/usr/bin/env node
// The clean check: the small details that make a page look machine-made and busy (the owner's rule,
// November 18; design/BRAND.md, *Clean, not costume*). On every page in design/pages.json, at 1440 and
// 390 wide, it fails when the page shows
//   - code costume: a file name or extension as a label (signal.top, bpc157.md), a shell path (~/sig),
//     a prompt (sig@miracle), a command or a flag (git log --reports), a code comment used as a label
//     (// took it?) or a shell error (command not found);
//   - a dot chain: three or more short bits strung on middle dots ("no ads · no sellers · no doses"),
//     whether written in the text or drawn between items by the stylesheet;
//   - a dot strip: five or more small round dots in a row, or a strip of five or more colours, that
//     say nothing a word doesn't;
//   - words in the code face: Monaspace Neon is for numbers only (a score, a count, a percentage) and
//     for keyboard keys; a word of three letters or more set in it is flagged.
// It also opens what only shows on demand (the front page's search results and ⌘K) and checks them.
// Drawings (svg) are left alone. ALLOW, below, lists what stays on purpose, each with its reason.
//
// It serves the site and answers the Signal from tests/fixtures/signal.json, as check_states.mjs does.
// Needs Playwright with Chromium (CI installs them); locally CHROME_PATH picks a Chrome.
//
//   node scripts/check_clean.mjs                       every page
//   node scripts/check_clean.mjs --pages home,asksig   some pages
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURE = readFileSync(join(ROOT, 'tests/fixtures/signal.json'), 'utf8');
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
};
const only = arg('pages');
const pages = JSON.parse(readFileSync(join(ROOT, 'design/pages.json'), 'utf8')).filter(([name]) => !only || only.includes(name));

// What stays on purpose. Each entry is a CSS selector the flagged element matches (or sits inside),
// the rules it may break, and why.
const ALLOW = [
  { sel: 'kbd', rules: ['mono'], why: 'keyboard keys are set in the code face everywhere' },
];

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('check_clean needs Playwright: npm install --no-save playwright && npx playwright install chromium');
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

// ---- the scan, run inside the page: every visible element under the part named by sel
const SCAN = ({ sel, allow }) => {
  const out = [];
  const root = document.querySelector(sel);
  if (!root) return out;
  const name = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += `#${e.id}`; const c = [...e.classList].slice(0, 2); if (c.length) s += `.${c.join('.')}`; return s; };
  const where = (e) => { const a = []; for (let x = e, i = 0; x && x.nodeType === 1 && i < 3; x = x.parentElement, i++) a.unshift(name(x)); return a.join(' > '); };
  const allowed = (e, rule) => allow.some((a) => a.rules.includes(rule) && e.closest(a.sel));
  const shown = (e) => {
    const r = e.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    for (let x = e; x && x.nodeType === 1; x = x.parentElement) {
      const c = getComputedStyle(x);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0 || x.hasAttribute('hidden')) return false;
    }
    return true;
  };
  const own = (e) => { let s = ''; for (const n of e.childNodes) if (n.nodeType === 3) s += n.textContent; return s.replace(/\s+/g, ' ').trim(); };
  const COSTUME = [
    [/(^|[\s(“"'‘])[a-z0-9][\w-]*\.(md|top|log|feed|sh|json|txt|yml|csv)\b/i, 'a file name'],
    [/(^|\s)~\//, 'a shell path'],
    [/\b[a-z]+@[a-z]+\b(?=\s*[~›$#])/i, 'a prompt'],
    [/\b(git|tail|grep|cat|ls|cd|npm)\s+(-|log\b|commit\b)/, 'a command'],
    [/(^|\s)--[a-z][a-z-]+\b/, 'a command flag'],
    [/(^|\s)\/\/\s?\S/, 'a code comment as a label'],
    [/command not found/i, 'a shell error'],
  ];
  const els = [...root.querySelectorAll('*')].filter((e) => !e.closest('svg, script, style, template, noscript') && shown(e));
  const texty = new Set();
  for (const e of els) {
    const text = (e.innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    // code costume and dot chains: report the deepest element whose text holds it
    for (const [re, what] of COSTUME) {
      if (!re.test(text) || allowed(e, 'costume')) continue;
      const deeper = [...e.children].some((c) => re.test((c.innerText || c.textContent || '').replace(/\s+/g, ' ')));
      if (!deeper) { out.push({ rule: 'costume', what, el: where(e), text: text.slice(0, 90) }); texty.add(e); }
    }
    // what the stylesheet writes before or after it (a '// ' drawn before a label is costume too)
    const drawnText = ['::before', '::after'].map((at) => getComputedStyle(e, at).content).filter((c) => c && c !== 'none' && c !== 'normal').map((c) => c.replace(/^["']|["']$/g, '')).join(' ');
    if (drawnText && !allowed(e, 'costume')) {
      const hit = COSTUME.find(([re]) => re.test(drawnText));
      if (hit || /^\s*(\/\/|~\/|\$\s|›)/.test(drawnText)) out.push({ rule: 'costume', what: `${hit ? hit[1] : 'a prompt or a code comment'}, drawn by the stylesheet`, el: where(e), text: drawnText.slice(0, 60) });
    }
    const chain = (t) => String(t || '').split('\n').find((line) => (line.match(/·/g) || []).length >= 2);
    const line = chain(e.innerText);
    if (line && !allowed(e, 'chain')) {
      const deeper = [...e.children].some((c) => chain(c.innerText || c.textContent));
      if (!deeper) out.push({ rule: 'chain', what: 'three or more bits on middle dots', el: where(e), text: line.replace(/\s+/g, ' ').trim().slice(0, 90) });
    }
    // words in the code face
    const t = own(e);
    if (t && /[A-Za-z]{3,}/.test(t) && /Monaspace/i.test(getComputedStyle(e).fontFamily.split(',')[0]) && !allowed(e, 'mono')) {
      out.push({ rule: 'mono', what: 'words in the code face', el: where(e), text: t.slice(0, 90) });
    }
  }
  // dots drawn between items by the stylesheet, and rows of dots or colours
  for (const e of els) {
    const kids = [...e.children].filter(shown);
    const drawn = kids.filter((k) => /·/.test(getComputedStyle(k, '::before').content) || /·/.test(getComputedStyle(k, '::after').content));
    if (drawn.length >= 2 && !allowed(e, 'chain')) out.push({ rule: 'chain', what: 'middle dots drawn between three or more bits', el: where(e), text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90) });
    const round = kids.filter((k) => { const r = k.getBoundingClientRect(); const c = getComputedStyle(k); return r.width <= 12 && r.height <= 12 && r.width >= 3 && parseFloat(c.borderTopLeftRadius) >= r.width * 0.4 && !(k.textContent || '').trim(); });
    const thin = kids.filter((k) => { const r = k.getBoundingClientRect(); return r.height <= 4 && r.width >= 4 && !(k.textContent || '').trim(); });
    const colours = new Set(thin.map((k) => getComputedStyle(k).backgroundColor));
    if ((round.length >= 5 || colours.size >= 5) && !allowed(e, 'strip')) out.push({ rule: 'strip', what: round.length >= 5 ? `${round.length} dots in a row` : `a strip of ${colours.size} colours`, el: where(e), text: '' });
  }
  return out;
};

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const problems = [];
let views = 0;
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
    await page.evaluate(async () => {
      await document.fonts.ready;
      // walk the page so what draws as it comes into view is drawn
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((ok) => setTimeout(ok, 40)); }
      scrollTo(0, 0); await new Promise((ok) => setTimeout(ok, 400));
    });
    views++;
    const at = `${name} at ${w}px`;
    for (const f of await page.evaluate(SCAN, { sel: 'body', allow: ALLOW })) {
      problems.push(`${at}: ${f.rule}: ${f.what}: ${f.el}${f.text ? ` "${f.text}"` : ''}`);
    }
    // what shows only on demand: the front page's search results, and ⌘K
    const demand = [];
    if (await page.$('#hero-q')) demand.push(async () => { await page.focus('#hero-q'); await page.waitForTimeout(200); return '.hp-drop'; });
    demand.push(async () => { await page.keyboard.press('Escape'); await page.keyboard.press('Control+k'); await page.waitForTimeout(250); return '.cmdk, [role="dialog"]'; });
    for (const open of demand) {
      const sel = await open().catch(() => null);
      if (!sel) continue;
      for (const f of await page.evaluate(SCAN, { sel, allow: ALLOW })) problems.push(`${at} (${sel.split(',')[0]} open): ${f.rule}: ${f.what}: ${f.el}${f.text ? ` "${f.text}"` : ''}`);
      await page.keyboard.press('Escape');
    }
  }
  await ctx.close();
}
await browser.close();
server.close();

const unique = [...new Set(problems)];
if (unique.length) {
  for (const p of unique) console.log(process.env.GITHUB_ACTIONS ? `::error::${p}` : p);
  console.log(`clean: ${unique.length} problem${unique.length === 1 ? '' : 's'} in ${views} views`);
  process.exit(1);
}
console.log(`clean: ${views} views: no code costume, no dot chains or strips, no words in the code face`);
