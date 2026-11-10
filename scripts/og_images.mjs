#!/usr/bin/env node
// Makes the share images (1200 x 630), in Plate like the site: the one every page falls back to
// (og.jpg), the shared plan's (img/og-plan.jpg), and one each for the pages
// scripts/build_pages.mjs builds (About, the FDA status tracker, each goal, each comparison, the
// weekly email, the founding reporters) into img/og/<slug>.jpg. The pages use an image once it's
// there (run the library build after).
// Needs Playwright with Chromium, so it's run by hand, not in CI (CHROMIUM_PATH names a Chrome
// to use when Playwright's own isn't installed):
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

// The plan's picture: the bone "Start here" step over the three pillars, as on the plan itself
const PLAN_ART = `<div class="plan"><div class="p-start"><span>Start here</span><b>One step, this week</b></div>
<div class="p-pillars"><i class="on">Nutrition</i><i class="next">Sleep</i><i>Exercise</i></div><div class="p-ground"></div></div>`;
const cards = [
  { slug: 'home', file: path.join(ROOT, 'og.jpg'), kick: 'Independent and free, for adults 18+', title: 'Peptides,<br><em>without the sales pitch.</em>',
    sub: 'What the studies show and how it went for people who took it, side by side. Nothing for sale.' },
  { slug: 'plan', file: path.join(ROOT, 'img', 'og-plan.jpg'), kick: 'A Miracle Plan', title: 'A plan built from the ground up, <em>shared with you</em>',
    sub: 'Nutrition, sleep and exercise first, then what rests on them. Made with Sig.', art: PLAN_ART },
  { slug: 'ask-sig', kick: 'Ask Sig', title: 'The studies and the whole community, <em>in one answer.</em>', sub: 'Sig is Miracle Health’s AI. It says which is which, and never gives doses or names sellers.', art: sigSvg(260, 'happy', { dark: true }) },
  { slug: 'about', kick: 'About', title: 'No miracles.<br><em>Just what happened.</em>', sub: 'Who runs Miracle Health, how it’s paid for, and how every fact sheet is checked.' },
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
@font-face{font-family:Newsreader;src:url('${font('newsreader.woff2')}') format('woff2');font-weight:400 500;font-style:normal}
@font-face{font-family:Newsreader;src:url('${font('newsreader-italic.woff2')}') format('woff2');font-weight:400 500;font-style:italic}
@font-face{font-family:Jakarta;src:url('${font('jakarta.woff2')}') format('woff2');font-weight:200 800}
@font-face{font-family:Plex;src:url('${font('plexmono-500.woff2')}') format('woff2');font-weight:500}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0A100F;color:#F0ECE0;font-family:Jakarta,sans-serif;position:relative}
/* the plate: a hairline frame with a tick in each corner */
.frame{position:absolute;inset:26px;border:1px solid rgba(240,236,224,.16)}
.frame i{position:absolute;width:14px;height:14px;border:0 solid rgba(240,236,224,.6)}
.frame i:nth-child(1){left:-1px;top:-1px;border-left-width:1px;border-top-width:1px}
.frame i:nth-child(2){right:-1px;top:-1px;border-right-width:1px;border-top-width:1px}
.frame i:nth-child(3){left:-1px;bottom:-1px;border-left-width:1px;border-bottom-width:1px}
.frame i:nth-child(4){right:-1px;bottom:-1px;border-right-width:1px;border-bottom-width:1px}
.in{position:relative;height:100%;padding:70px 78px 66px;display:flex;flex-direction:column}
.logo{height:40px;width:auto;align-self:flex-start}
.url{position:absolute;right:78px;top:80px;font:500 17px/1 Plex,monospace;letter-spacing:.14em;color:rgba(240,236,224,.56)}
.kick{display:flex;align-items:center;gap:16px;margin-top:auto;font:500 20px/1 Plex,monospace;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,236,224,.6)}
.kick::before{content:'';width:40px;height:1px;background:currentColor}
h1{margin-top:22px;font:500 ${c.pair ? 80 : 78}px/1 Newsreader,Georgia,serif;letter-spacing:-.028em;max-width:${c.art ? 700 : 1010}px}
h1 em,.vs{font-style:italic;font-weight:400}
.vs{color:rgba(240,236,224,.6)}
.sub{margin-top:24px;max-width:${c.art ? 680 : 880}px;font-size:27px;line-height:1.42;color:rgba(240,236,224,.74)}
.art{position:absolute;right:86px;bottom:74px;width:300px;display:grid;place-items:center}
.art svg{width:260px;height:260px}
/* the Signal's ring and dot, on every picture */
.mark{position:absolute;right:78px;bottom:66px;width:44px;height:44px}
.pills{display:flex;gap:14px;margin-top:30px}
.pill{display:inline-flex;align-items:center;gap:12px;padding:12px 16px;border-radius:6px;border:1px solid rgba(240,236,224,.32);font:500 17px/1 Plex,monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(240,236,224,.78)}
.pill b{font:500 24px/1 Newsreader,Georgia,serif;letter-spacing:-.01em;text-transform:none;color:#F0ECE0}
.meter{display:inline-grid;grid-template-columns:repeat(4,14px);gap:3px}
.meter i{height:10px;border-radius:2px;background:#F0ECE0;opacity:.22}
.meter i.on{opacity:1}
.plan{width:300px;display:grid;gap:12px}
.p-start{display:grid;gap:6px;padding:16px 18px;border-radius:6px;background:#F0ECE0;color:#121E1D}
.p-start span{font:500 12px/1 Plex,monospace;letter-spacing:.14em;text-transform:uppercase;opacity:.7}
.p-start b{font:500 24px/1.1 Newsreader,Georgia,serif;letter-spacing:-.01em}
.p-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;height:150px;margin-top:6px;padding:0 10px}
.p-pillars i{display:flex;align-items:flex-end;padding:10px;border:1px solid rgba(240,236,224,.32);border-radius:6px;font:500 16px/1 Newsreader,Georgia,serif;font-style:normal}
.p-pillars .on{border-color:#F0ECE0;background:#F0ECE0;color:#121E1D}
.p-pillars .next{background:repeating-linear-gradient(135deg,rgba(240,236,224,.12) 0 5px,rgba(240,236,224,.03) 5px 12px)}
.p-ground{height:8px;margin-top:-12px;border-radius:2px;background:#F0ECE0}
</style></head><body><div class="frame"><i></i><i></i><i></i><i></i></div><div class="in">
<img class="logo" src="${pathToFileURL(path.join(ROOT, 'logo.webp')).href}" alt="">
<span class="url">MIRACLEHEALTH.US</span>
<p class="kick">${e(c.kick)}</p>
<h1>${c.title}</h1>
${c.sub ? `<p class="sub">${e(c.sub)}</p>` : ''}
${c.art ? `<div class="art">${c.art}</div>` : `<div class="mark">${sigSvg(44, 'idle', { dark: true })}</div>`}
${c.pair ? `<div class="pills">${c.pair.map((id) => { const f = entries.get(id); return `<span class="pill"><b>${e(f.name)}</b>${meter(f.evidence.grade)}${e(GRADE[f.evidence.grade])}</span>`; }).join('')}</div>` : ''}
</div></body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const c of cards) {
  const file = path.join(OUT, `${c.slug}.html`);
  fs.writeFileSync(file, html(c));
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: c.file || path.join(OUT, `${c.slug}.jpg`), type: 'jpeg', quality: 86 });
  fs.rmSync(file);
}
await browser.close();
console.log(`share images: ${cards.length} (og.jpg, img/og-plan.jpg and ${cards.length - 2} in img/og)`);
