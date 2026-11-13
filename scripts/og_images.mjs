#!/usr/bin/env node
// Makes the share images (1200 x 630), each like a page of the site: the logo and the address along
// the top, the words, and the rules along the foot: the one every page falls back to (og.jpg), the shared plan's (img/og-plan.jpg), the story page's, and one each for the pages
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
import { ringSvg } from '../lib/ring.js';

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
  { slug: 'home', name: 'Miracle Health', tab: 'home', file: path.join(ROOT, 'og.jpg'), kick: 'Independent and free, for adults 18+', title: 'Peptides,<br><em>without the sales pitch.</em>',
    sub: 'What the studies show and how it went for people who took it, side by side. Nothing for sale.' },
  { slug: 'plan', name: 'A Miracle Plan', tab: 'plan.md', file: path.join(ROOT, 'img', 'og-plan.jpg'), kick: 'A Miracle Plan', title: 'A plan built from the ground up, <em>shared with you</em>',
    sub: 'Nutrition, sleep and exercise first, then what rests on them. Made with Sig.', art: PLAN_ART },
  { slug: 'story', name: 'The story', tab: 'story.md', kick: '~/story · the new Miracle Health', title: 'One app. Twelve agents.<br><em>Every answer, checked.</em>',
    sub: 'The Library, Ask Sig, the community and My Miracle, as one app.', art: ringSvg(260) },
  { slug: 'ask-sig', name: 'Ask Sig', tab: 'chats/new', kick: 'Ask Sig', title: 'The studies and the whole community, <em>in one answer.</em>', sub: 'Sig is Miracle Health’s AI. It says which is which, and never gives doses or names sellers.', art: ringSvg(260) },
  { slug: 'about', name: 'About', tab: 'about.md', kick: 'About', title: 'No miracles.<br><em>Just what happened.</em>', sub: 'Who runs Miracle Health, how it’s paid for, and how every fact sheet is checked.' },
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
];

const meter = (g) => `<span class="meter">${[0, 1, 2, 3].map((i) => `<i class="${i < BARS[g] ? 'on' : ''}"></i>`).join('')}</span>`;
const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mona;src:url('${font('mona-sans.woff2')}') format('woff2');font-weight:200 900;font-stretch:75% 125%}
@font-face{font-family:MonaDisplay;src:url('${font('mona-sans.woff2')}') format('woff2');font-weight:640 900;font-stretch:112.5% 125%}
@font-face{font-family:Neon;src:url('${font('monaspace-neon-400.woff2')}') format('woff2');font-weight:100 549}
@font-face{font-family:Neon;src:url('${font('monaspace-neon-700.woff2')}') format('woff2');font-weight:550 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#000000;color:#F7F8FA;font-family:Mona,sans-serif;position:relative}
/* the page itself: the logo and the address along the top, the words, the rules along the foot, on the
   faint grid under the ultramarine wash */
body{background:radial-gradient(90% 640px at 50% -160px,rgba(26,4,255,.3) 0%,rgba(0,0,0,0) 62%),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/64px 64px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/64px 64px,#000000}
.in{position:absolute;inset:0;display:flex;flex-direction:column;padding:52px 64px 48px}
.top{display:flex;align-items:center;justify-content:space-between}
.addr{font:500 17px/1 Neon,monospace;color:#A1A7B2}
.foot{display:flex;align-items:center;gap:14px;margin-top:34px;padding-top:22px;border-top:1.5px solid rgba(255,255,255,.10);font:500 16px/1 Neon,monospace;color:#7F8796;white-space:nowrap}
.foot svg{display:block}
.logo{display:block;width:auto;height:32px}
.kick{display:flex;align-items:center;gap:16px;margin-top:auto;font:500 18px/1 Neon,monospace;letter-spacing:.09em;text-transform:uppercase;color:#3D8BFF}
.kick::before{content:'';width:40px;height:1px;background:currentColor}
.kick.lower{letter-spacing:0;text-transform:none}.kick.lower::before{display:none}
h1{margin-top:20px;font:800 ${c.pair ? 53 : 52}px/1 MonaDisplay,sans-serif;font-stretch:125%;letter-spacing:-.022em;text-transform:uppercase;max-width:${c.art ? 720 : 1010}px}
h1 em,.vs{font-style:normal;font-weight:inherit}
.vs{color:rgba(255,255,255,.6)}
.sub{margin-top:20px;max-width:${c.art ? 680 : 880}px;font-size:25px;line-height:1.42;color:rgba(255,255,255,.74)}
.art{position:absolute;right:64px;bottom:116px;width:300px;display:grid;place-items:center}
.art svg{width:260px;height:260px}
.pills{display:flex;gap:14px;margin-top:30px}
.pill{display:inline-flex;align-items:center;gap:12px;padding:12px 16px;border-radius:6px;border:1px solid rgba(255,255,255,.32);font:500 16px/1 Neon,monospace;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.78)}
.pill b{font:700 21px/1 MonaDisplay,sans-serif;letter-spacing:-.01em;text-transform:none;color:#F7F8FA}
.meter{display:inline-grid;grid-template-columns:repeat(4,14px);gap:3px}
.meter i{height:10px;border-radius:2px;background:#14ECC3;opacity:.22}
.meter i.on{opacity:1}
.plan{width:300px;display:grid;gap:12px}
.p-start{display:grid;gap:6px;padding:16px 18px;border-radius:6px;background:#F7F8FA;color:#000000}
.p-start span{font:500 12px/1 Neon,monospace;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.p-start b{font:700 21px/1.1 MonaDisplay,sans-serif;letter-spacing:-.01em}
.p-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;height:150px;margin-top:6px;padding:0 10px}
.p-pillars i{display:flex;align-items:flex-end;padding:10px;border:1px solid rgba(255,255,255,.32);border-radius:6px;font:600 15px/1 Mona,sans-serif;font-style:normal}
.p-pillars .on{border-color:#F7F8FA;background:#F7F8FA;color:#000000}
.p-pillars .next{background:repeating-linear-gradient(135deg,rgba(255,255,255,.12) 0 5px,rgba(255,255,255,.03) 5px 12px)}
.p-ground{height:8px;margin-top:-12px;border-radius:2px;background:#F7F8FA}
</style></head><body>
<div class="in">
<div class="top"><img class="logo" src="${pathToFileURL(path.join(ROOT, 'logo.webp')).href}" alt=""><span class="addr">miraclehealth.us</span></div>
<p class="kick${c.kick.startsWith('~') ? ' lower' : ''}">${e(c.kick)}</p>
<h1>${c.title}</h1>
${c.sub ? `<p class="sub">${e(c.sub)}</p>` : ''}
${c.art ? `<div class="art">${c.art}</div>` : ''}
${c.pair ? `<div class="pills">${c.pair.map((id) => { const f = entries.get(id); return `<span class="pill"><b>${e(f.name)}</b>${meter(f.evidence.grade)}${e(GRADE[f.evidence.grade])}</span>`; }).join('')}</div>` : ''}
<div class="foot">${ringSvg(16)}<span>independent and free · no doses · no sellers · no diagnosis</span></div>
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
