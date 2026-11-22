#!/usr/bin/env node
// Makes the share images (1200 x 630), each like a page of the site: the logo and the address along
// the top, then a kicker, the headline and one line under it, on the page's own black ground. Nothing
// else: no foot, no rules strip, nothing in the code face (the owner's clean rule). The one every page
// falls back to (og.jpg), the shared plan's (img/og-plan.jpg), the story page's, and one each for the pages
// scripts/build_pages.mjs builds (About, the FDA status tracker, each goal, each comparison, the
// weekly email, the founding reporters) into img/og/<slug>.jpg. The pages use an image once it's
// there (run the library build after).
// Needs Playwright with Chromium, so it's run by hand, not in CI (CHROMIUM_PATH names a Chrome
// to use when Playwright's own isn't installed); name cards to make only those:
//   node scripts/og_images.mjs && node scripts/build_library.mjs
//   node scripts/og_images.mjs community
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAIRS, slugOf } from './build_pages.mjs';
import { ringSvg } from '../lib/ring.js';
import { BASE, C, HEAD, NAME, PUNCH, ground, logo } from '../design/pack/look.mjs';

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
const GRADE = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence', preclinical: 'Animal and lab studies', anecdotal: 'Anecdotal' };
const BARS = { strong: 4, moderate: 3, limited: 2, preclinical: 1, anecdotal: 0 };

// The plan's picture: the white "Start here" step over the three pillars, as on the plan itself
const PLAN_ART = `<div class="plan"><div class="p-start"><span>Start here</span><b>One step, this week</b></div>
<div class="p-pillars"><i class="on">Nutrition</i><i class="next">Sleep</i><i>Exercise</i></div><div class="p-ground"></div></div>`;
const cards = [
  { slug: 'home', name: 'Unhyped', tab: 'home', file: path.join(ROOT, 'og.jpg'), kick: 'Independent and free, for adults 18+', title: 'Peptides,<br><em>without the sales pitch.</em>',
    sub: 'What the studies show and how it went for people who took it, side by side. Nothing for sale.' },
  { slug: 'plan', name: 'A plan built with Sig', tab: 'plan.md', file: path.join(ROOT, 'img', 'og-plan.jpg'), kick: 'A plan built with Sig', title: 'A plan built from the ground up, <em>shared with you</em>',
    sub: 'Nutrition, sleep and exercise first, then what rests on them. Made with Sig.', art: PLAN_ART },
  { slug: 'story', name: 'The story', tab: 'story.md', kick: 'The story', title: 'One app. Twelve agents.<br><em>Every answer, checked.</em>',
    sub: 'The Library, Ask Sig, the community and My stack, as one app.', art: ringSvg(260) },
  { slug: 'ask-sig', name: 'Ask Sig', tab: 'chats/new', kick: 'Ask Sig', title: 'The studies and the whole community, <em>in one answer.</em>', sub: 'Sig is Unhyped’s AI. It says which is which, and never gives doses or names sellers.', art: ringSvg(260) },
  { slug: 'about', name: 'About', tab: 'about.md', kick: 'About', title: 'No miracles.<br><em>Just what happened.</em>', sub: 'Who runs Unhyped, how it’s paid for, and how every fact sheet is checked.' },
  { slug: 'status', name: 'FDA status tracker', tab: 'status.log', kick: 'FDA status tracker', title: 'Where each compound stands with the FDA', sub: `${entries.size} peptides, hormones, supplements and medications, each checked against FDA’s own documents.` },
  { slug: 'goals', name: 'By goal', tab: 'goals', kick: 'By goal', title: 'What people take, and what the studies show', sub: 'Weight, muscle, recovery, sleep, focus, skin, aging and more.' },
  ...uses.goals.map((g) => ({ slug: `goal-${g.id}`, name: 'By goal', tab: `goals/${g.id}`, kick: 'Goals', title: e(g.label), sub: 'What the studies show for each compound people take for it, and what people who took it report.' })),
  { slug: 'compare', name: 'Compare', tab: 'compare', kick: 'Side by side', title: 'Compare two compounds', sub: 'Evidence, risks, FDA status and what people report, side by side.' },
  ...PAIRS.map(([a, b, slug]) => ({
    slug: `compare-${slug || `${slugOf(nameOf(a))}-vs-${slugOf(nameOf(b))}`}`, name: 'Compare', tab: `${slug || `${slugOf(nameOf(a))}-vs-${slugOf(nameOf(b))}`}.diff`, kick: 'Side by side',
    title: `${e(nameOf(a))} <span class="vs">vs</span> ${e(nameOf(b))}`, pair: [a, b],
  })),
  { slug: 'weekly', name: 'The Signal, weekly', tab: 'issues', kick: 'The Signal, weekly', title: 'What moved, once a week', sub: 'The Community Signal, new studies and FDA news. Free, no ads.' },
  { slug: 'founders', name: 'Founding reporters', tab: 'founders.md', kick: 'Founding reporters', title: 'Be one of the first 100.', sub: 'Share a first-hand report on what you took, and how it went.' },
  // The community's own share card (community.theunhyped.com points its og:image here)
  { slug: 'community', name: 'Community', tab: 'community', addr: 'community.theunhyped.com', kick: 'The Unhyped community', title: 'Took something?<br><em>Say how it went.</em>',
    sub: 'Your report moves the number for the next person, even if it did nothing. Free to join.', art: ringSvg(260) },
];

const meter = (g) => `<span class="meter">${[0, 1, 2, 3].map((i) => `<i class="${i < BARS[g] ? 'on' : ''}"></i>`).join('')}</span>`;
const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
${BASE}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:${ground()}}
.in{position:absolute;inset:0;display:flex;flex-direction:column;padding:56px 64px 62px}
.top{display:flex;align-items:center;justify-content:space-between}
.addr{font:500 19px/1 Mona,sans-serif;color:${C['text-2']}}
.kick{margin-top:auto;font:600 22px/1.2 Mona,sans-serif;color:${C.lime}}
h1{margin-top:18px;${HEAD};font-size:${c.pair ? 53 : 56}px;line-height:1;max-width:${c.art ? 740 : 1040}px;text-wrap:balance}
h1 em{${PUNCH}}
.vs{color:${C['text-2']}}
.sub{margin-top:22px;max-width:${c.art ? 700 : 900}px;font:400 25px/1.42 Mona,sans-serif;color:${C['text-2']};text-wrap:pretty}
.art{position:absolute;right:64px;bottom:62px;width:300px;display:grid;place-items:center}
.art svg{width:260px;height:260px}
.pills{display:flex;gap:14px;margin-top:30px}
.pill{display:inline-flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid ${C['line-2']};font:600 16px/1 Mona,sans-serif;color:${C['text-2']}}
.pill b{${NAME};font-size:21px;line-height:1;color:${C.text}}
.meter{display:inline-grid;grid-template-columns:repeat(4,14px);gap:3px}
.meter i{height:10px;background:${C.evidence};opacity:.22}
.meter i.on{opacity:1}
.plan{width:300px;display:grid;gap:12px}
.p-start{display:grid;gap:8px;padding:16px 18px;background:${C.text};color:${C.surface}}
.p-start span{font:600 14px/1 Mona,sans-serif;opacity:.7}
.p-start b{${NAME};font-size:21px;line-height:1.1}
.p-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;height:150px;margin-top:6px;padding:0 10px}
.p-pillars i{display:flex;align-items:flex-end;padding:10px;border:1px solid ${C['line-2']};font:600 15px/1 Mona,sans-serif;font-style:normal}
.p-pillars .on{border-color:${C.text};background:${C.text};color:${C.surface}}
.p-pillars .next{background:repeating-linear-gradient(135deg,rgba(255,255,255,.12) 0 5px,rgba(255,255,255,.03) 5px 12px)}
.p-ground{height:8px;margin-top:-12px;background:${C.text}}
</style></head><body>
<div class="in">
<div class="top">${logo(42)}<span class="addr">${e(c.addr || 'theunhyped.com')}</span></div>
<p class="kick">${e(c.kick)}</p>
<h1>${c.title}</h1>
${c.sub ? `<p class="sub">${e(c.sub)}</p>` : ''}
${c.art ? `<div class="art">${c.art}</div>` : ''}
${c.pair ? `<div class="pills">${c.pair.map((id) => { const f = entries.get(id); return `<span class="pill"><b>${e(f.name)}</b>${meter(f.evidence.grade)}${e(GRADE[f.evidence.grade])}</span>`; }).join('')}</div>` : ''}
</div></body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// node scripts/og_images.mjs [slug ...]: only those cards, so one new card doesn't redraw the rest
const only = process.argv.slice(2);
const todo = only.length ? cards.filter((c) => only.includes(c.slug)) : cards;
for (const c of todo) {
  const file = path.join(OUT, `${c.slug}.html`);
  fs.writeFileSync(file, html(c));
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: c.file || path.join(OUT, `${c.slug}.jpg`), type: 'jpeg', quality: 86 });
  fs.rmSync(file);
}
await browser.close();
console.log(only.length ? `share images: ${todo.map((c) => c.slug).join(', ')}` : `share images: ${cards.length} (og.jpg, img/og-plan.jpg and ${cards.length - 2} in img/og)`);
