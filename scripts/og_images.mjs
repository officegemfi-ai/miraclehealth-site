#!/usr/bin/env node
// Makes the share images (1200 x 630) for the pages scripts/build_pages.mjs builds: About, the
// FDA status tracker, each goal, each comparison, the weekly email and the founding reporters,
// into img/og/<slug>.jpg. The pages use an image once it's there (run the library build after).
// Needs Playwright with Chromium, so it's run by hand, not in CI:
//   node scripts/og_images.mjs && node scripts/build_library.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAIRS, slugOf } from './build_pages.mjs';
import { sigSvg } from '../kit/kit.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'img', 'og');
const DATA = path.join(ROOT, 'library', 'data');
const catalog = JSON.parse(fs.readFileSync(path.join(DATA, 'catalog.json'), 'utf8'));
const uses = JSON.parse(fs.readFileSync(path.join(DATA, 'uses.json'), 'utf8'));
const entries = new Map(fs.readdirSync(path.join(DATA, 'entries')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DATA, 'entries', f), 'utf8'))).map((x) => [x.id, x]));
const nameOf = (id) => catalog.find((c) => c.id === id)?.name || id;
const e = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const font = (f) => pathToFileURL(path.join(ROOT, 'fonts', f)).href;
const GRADE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence', preclinical: 'Animal and lab studies', anecdotal: 'Anecdotal' };
const BARS = { strong: 4, moderate: 3, limited: 2, preclinical: 1, anecdotal: 0 };

const cards = [
  { slug: 'ask-sig', kick: 'Ask Sig', title: 'The studies and the whole community, in one answer.', sub: 'Sig is Miracle Health’s AI. It says which is which, and never gives doses or names sellers.', art: sigSvg(300, 'happy', { dark: true, id: 'ogsig' }) },
  { slug: 'about', kick: 'About', title: 'No miracles.<br>Just what happened.', sub: 'Who runs Miracle Health, how it’s paid for, and how every fact sheet is checked.' },
  { slug: 'status', kick: 'FDA status tracker', title: 'Where each compound stands with the FDA', sub: `${entries.size} peptides, hormones, supplements and medications, each checked against FDA’s own documents.` },
  { slug: 'goals', kick: 'By goal', title: 'What people take, and what the studies show', sub: 'Weight, muscle, recovery, sleep, focus, skin, aging and more.' },
  ...uses.goals.map((g) => ({ slug: `goal-${g.id}`, kick: 'Goals', title: e(g.label), sub: 'What the studies show for each compound people take for it, and what people who took it report.' })),
  { slug: 'compare', kick: 'Side by side', title: 'Compare two compounds', sub: 'Evidence, risks, FDA status and what people report, side by side.' },
  ...PAIRS.map(([a, b, slug]) => ({
    slug: `compare-${slug || `${slugOf(nameOf(a))}-vs-${slugOf(nameOf(b))}`}`, kick: 'Side by side',
    title: `${e(nameOf(a))} <span class="vs">vs</span> ${e(nameOf(b))}`, pair: [a, b],
  })),
  { slug: 'weekly', kick: 'The Signal, weekly', title: 'What moved, once a week', sub: 'The Community Signal, new studies and FDA news. Free, no ads.' },
  { slug: 'founders', kick: 'Founding reporters', title: 'Be one of the first 100.', sub: 'Share a first-hand report on what you took, and how it went.' },
];

const meter = (g) => `<span class="meter">${[0, 1, 2, 3].map((i) => `<i class="${i < BARS[g] ? 'on' : ''}"></i>`).join('')}</span>`;
const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url('${font('inter.woff2')}') format('woff2');font-weight:100 900}
@font-face{font-family:Jakarta;src:url('${font('jakarta.woff2')}') format('woff2');font-weight:200 800}
@font-face{font-family:Plex;src:url('${font('plexmono-500.woff2')}') format('woff2');font-weight:500}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0C1413;color:#FCFCFC;font-family:Jakarta,sans-serif;position:relative}
body::before{content:'';position:absolute;inset:0;background:radial-gradient(60% 90% at 8% 0%,rgba(216,255,61,.16),rgba(216,255,61,0) 60%),radial-gradient(50% 70% at 100% 100%,rgba(216,255,61,.07),rgba(216,255,61,0) 60%)}
.in{position:relative;height:100%;padding:64px 72px;display:flex;flex-direction:column}
.logo{height:40px;width:auto;align-self:flex-start}
.kick{margin-top:auto;font:500 22px/1 Plex,monospace;letter-spacing:.14em;text-transform:uppercase;color:#D8FF3D}
h1{margin-top:22px;font:600 ${c.pair ? 78 : 72}px/1.02 Inter,sans-serif;letter-spacing:-.035em;max-width:${c.art ? 720 : 1000}px}
.art{position:absolute;right:56px;bottom:40px;width:340px;height:340px;display:grid;place-items:center}
.art svg{width:300px;height:300px}
.vs{color:#D8FF3D;font-weight:500}
.sub{margin-top:24px;max-width:${c.art ? 700 : 900}px;font-size:28px;line-height:1.4;color:rgba(252,252,252,.72)}
.pills{display:flex;gap:16px;margin-top:30px}
.pill{display:inline-flex;align-items:center;gap:12px;padding:12px 18px;border-radius:40px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);font:500 18px/1 Plex,monospace;letter-spacing:.08em;text-transform:uppercase}
.pill b{font:600 20px/1 Inter,sans-serif;letter-spacing:0;text-transform:none}
.meter{display:inline-grid;grid-template-columns:repeat(4,14px);gap:3px}
.meter i{height:10px;border-radius:2px;background:#D8FF3D;opacity:.25}
.meter i.on{opacity:1}
.url{position:absolute;right:72px;top:72px;font:500 18px/1 Plex,monospace;letter-spacing:.1em;color:rgba(252,252,252,.5)}
</style></head><body><div class="in">
<img class="logo" src="${pathToFileURL(path.join(ROOT, 'logo.webp')).href}" alt="">
<span class="url">MIRACLEHEALTH.US</span>
<p class="kick">// ${e(c.kick)}</p>
<h1>${c.title}</h1>
${c.sub ? `<p class="sub">${e(c.sub)}</p>` : ''}
${c.art ? `<div class="art">${c.art}</div>` : ''}
${c.pair ? `<div class="pills">${c.pair.map((id) => { const f = entries.get(id); return `<span class="pill"><b>${e(f.name)}</b>${meter(f.evidence.grade)}${e(GRADE[f.evidence.grade])}</span>`; }).join('')}</div>` : ''}
</div></body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const c of cards) {
  const file = path.join(OUT, `${c.slug}.html`);
  fs.writeFileSync(file, html(c));
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${c.slug}.jpg`), type: 'jpeg', quality: 84 });
  fs.rmSync(file);
}
await browser.close();
console.log(`share images: ${cards.length} in img/og`);
