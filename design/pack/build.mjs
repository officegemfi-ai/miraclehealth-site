#!/usr/bin/env node
// The brand pack: one folder anyone can be handed, with the logo, the mark, the colours, the type, the
// icons, the Community Signal's pieces and the marketing formats. Every file is made from what the
// site itself runs on (design/tokens.json, lib/ring.js, lib/glyphs.js, the fonts, the front page's own
// step drawings, the share images, the Signal saved in tests/fixtures), so the pack matches the pages
// and is made again whenever they change. Needs Playwright with Chromium, and Python with Pillow, so
// it's run by hand, like scripts/og_images.mjs:
//   node scripts/og_images.mjs                       (first, when the share images changed)
//   node design/pack/build.mjs <folder to write to>   (CHROMIUM_PATH names a Chrome to use)
// It writes "<folder>/Miracle Health brand pack" and, beside it, the same as a zip and the guide's two
// pages as pictures.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { ROOT, TOKENS, C, FACES, LOGO, fileUrl } from './look.mjs';
import * as P from './pieces.mjs';
import { guidePages } from './guide.mjs';
import { ringSvg, WHEEL, CENTER } from '../../lib/ring.js';
import { GLYPH, AGENT_COLOR } from '../../lib/glyphs.js';
import { sigSvg } from '../../kit/kit.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const NAME = 'Miracle Health brand pack';
const dest = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'miracle-health-brand-pack'));
const OUT = path.join(dest, NAME);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mh-pack-'));
fs.rmSync(OUT, { recursive: true, force: true });
const put = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); return f; };
const copy = (from, rel) => put(rel, fs.readFileSync(path.join(ROOT, from)));
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

// What the pack is made from
const icons = JSON.parse(read('design', 'pack', 'icons.json'));
const catalog = JSON.parse(read('library', 'data', 'catalog.json'));
const signals = JSON.parse(read('tests', 'fixtures', 'signal.json')).signals;
const one = { Peptides: 'Peptide', Hormones: 'Hormone', Medications: 'Medication', Supplements: 'Supplement' };
const board = Object.entries(signals).map(([id, s]) => ({ id, ...s })).filter((s) => s.score != null).sort((a, b) => b.score - a.score);
const kindOf = (s) => { const f = catalog.find((c) => c.id === s.id)?.family; return one[f] || f || 'Compound'; };
// The front page's three step drawings, as the page has them, made to stand alone: the page keeps
// their lines a hair wide at any size; a file's lines are part of the drawing
const steps = [...read('index.html').matchAll(/<svg class="st-ico"[\s\S]*?<\/svg>/g)].map((m) => m[0]
  .replace(/<svg class="st-ico"[^>]*viewBox/, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox')
  .replace(/ vector-effect="non-scaling-stroke"/g, '').replace(/stroke-width="1\.2"/g, 'stroke-width="1.6"').replace(/><\/(circle|line|path|rect)>/g, '/>'));
if (steps.length !== 3) throw new Error('the front page no longer has three step drawings');

// ---------------------------------------------------------------------------
// 1 Logo: the wordmark, Sig's ring, the tab and app icons, Sig in the community
// ---------------------------------------------------------------------------
const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';
put('1 Logo/logo.svg', LOGO);
const mark = ringSvg(512).replace('<svg class="ring" ', `<svg ${XMLNS} `).replace(' aria-hidden="true" focusable="false"', ' role="img" aria-label="Sig’s ring"')
  .replace(/ class="[^"]*"/g, '').replace(/ data-a="[^"]*"/g, '').replace(/ color="[^"]*"/g, '');
put('1 Logo/mark.svg', mark);
copy('favicon.svg', '1 Logo/favicon.svg');
copy('favicon.ico', '1 Logo/favicon.ico');

// ---------------------------------------------------------------------------
// 2 Colour
// ---------------------------------------------------------------------------
const use = Object.fromEntries(TOKENS.color.tokens.map((t) => [t.name, t.usage]));
// The few a person needs, by the name people say, with the name the code uses
const PALETTE = [
  ['Black', 'surface', 'Every page.'],
  ['Card', 'surface-raised', 'Cards and fields on black.'],
  ['White', 'text', 'Words, and the second button.'],
  ['Grey', 'text-2', 'Quieter words.'],
  ['Electric blue', 'accent', 'The one main action on a screen.'],
  ['Signal blue', 'lime', 'The community and its Signal.'],
  ['Violet', 'violet', 'The statement band, with grain.'],
  ['Mint', 'evidence', 'The studies.'],
  ['Coral', 'safety', 'Safety.'],
];
const AGENT_NAME = { safety: 'Safety agent', planner: 'Planner', recommender: 'Recommender', community: 'Community', combination: 'Combination agent', markers: 'Markers agent', synergy: 'Synergy auditor', evidence: 'Evidence librarian', relatives: 'Relatives agent', mechanism: 'Mechanism agent', builder: 'Stack builder', interpretation: 'Interpretation agent' };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
put('2 Colour/colours.css', `/* Miracle Health: the colours. Black pages, white words, one electric blue main action. Colour is a
   signature (Signal blue for the community, mint for the studies, each agent its own), never decoration. */
:root{
${PALETTE.map(([n, t, u]) => `  --mh-${slug(n)}:${C[t]};${' '.repeat(Math.max(1, 22 - slug(n).length))}/* ${u} */`).join('\n')}
  --mh-line:${C.line};   /* A hairline between things. */
  --mh-punchline:linear-gradient(90deg,${C.lime} 0%,${C.violet} 52%,${C['violet-light']} 100%);   /* A headline's second sentence. */
  --mh-main-action:linear-gradient(180deg,${C['accent-hi']} 0%,${C.accent} 100%);   /* The blue button's fill. */
  /* The Community Signal's four parts */
${P.PARTS.map(([k, n, share, c]) => `  --mh-signal-${slug(n)}:${c};   /* ${share}% of the score */`).join('\n')}
  /* Sig's twelve agents */
${[...WHEEL, CENTER].map((k) => `  --mh-agent-${k}:${AGENT_COLOR[k]};`).join('\n')}
}
`);
put('2 Colour/colours.json', `${JSON.stringify({
  brand: PALETTE.map(([name, token, usage]) => ({ name, hex: C[token], token, use: usage })),
  signal: P.PARTS.map(([, name, share, hex]) => ({ name, hex, share_of_score: share })),
  agents: [...WHEEL, CENTER].map((k) => ({ name: AGENT_NAME[k], hex: AGENT_COLOR[k] })),
}, null, 2)}\n`);

// ---------------------------------------------------------------------------
// 3 Type: the two faces as the site serves them, with their licences
// ---------------------------------------------------------------------------
copy('fonts/mona-sans.woff2', '3 Type/mona-sans.woff2');
copy('fonts/monaspace-neon-400.woff2', '3 Type/monaspace-neon-400.woff2');
copy('fonts/OFL-Mona-Sans.txt', '3 Type/Licence Mona Sans.txt');
copy('fonts/OFL-Monaspace.txt', '3 Type/Licence Monaspace.txt');
put('3 Type/type.css', `/* Miracle Health: the type. Two faces: Mona Sans for every word, Monaspace Neon for numbers only. */
@font-face{font-family:'Mona Sans';src:url('mona-sans.woff2') format('woff2');font-weight:200 900;font-stretch:75% 125%;font-display:swap}
@font-face{font-family:'Monaspace Neon';src:url('monaspace-neon-400.woff2') format('woff2');font-weight:100 549;font-display:swap}
.mh-headline{font:800 expanded 64px/.98 'Mona Sans',sans-serif;letter-spacing:-.028em;text-transform:uppercase}   /* widest, heaviest, capitals */
.mh-name{font:650 expanded 26px/1.15 'Mona Sans',sans-serif;letter-spacing:-.025em}   /* a compound's name, a score */
.mh-heading{font:600 22px/1.25 'Mona Sans',sans-serif;letter-spacing:-.012em}
.mh-lede{font:400 18px/1.55 'Mona Sans',sans-serif}
.mh-text{font:400 16px/1.6 'Mona Sans',sans-serif}
.mh-button{font:600 14.5px/1 'Mona Sans',sans-serif}
.mh-kicker{font:600 14px/1.4 'Mona Sans',sans-serif}   /* one short phrase over a heading, sentence case */
.mh-label{font:600 13px/1.3 'Mona Sans',sans-serif}   /* nothing a reader needs is smaller than this */
.mh-number{font:400 13px/1 'Monaspace Neon',monospace;font-variant-numeric:tabular-nums}   /* numbers only, never words */
`);

// ---------------------------------------------------------------------------
// 4 Icons: one set. As files they are drawn in white (an agent's glyph in its own colour) so they
// show on black anywhere; in the sprite they take the colour of the words beside them
// ---------------------------------------------------------------------------
const SW = icons.stroke;
const iconSvg = (inner, stroke) => `<svg ${XMLNS} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>\n`;
for (const [k, d] of Object.entries(icons.interface)) put(`4 Icons/interface/${k}.svg`, iconSvg(d, C.text));
for (const k of [...WHEEL, CENTER]) put(`4 Icons/agents/${k}.svg`, iconSvg(GLYPH[k], AGENT_COLOR[k]));
['say-how-it-went', 'sig-reads-it-in', 'the-signal-moves'].forEach((n, i) => put(`4 Icons/steps/${i + 1}-${n}.svg`, `${steps[i]}\n`));
put('4 Icons/sprite.svg', `<svg ${XMLNS} style="display:none">\n${[...Object.entries(icons.interface), ...[...WHEEL, CENTER].map((k) => [`agent-${k}`, GLYPH[k]])]
  .map(([k, d]) => `<symbol id="${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">${d}</symbol>`).join('\n')}\n</svg>\n`);

// ---------------------------------------------------------------------------
// 5 Signal: its mark (the spectrum's four bars, as the pages draw them) and Sig in the community
// ---------------------------------------------------------------------------
put('5 Signal/signal-mark.svg', `<svg ${XMLNS} viewBox="0 0 16 16" width="256" height="256" fill="none" stroke="${C.lime}" stroke-width="1.8" stroke-linecap="round" role="img" aria-label="The Community Signal"><path d="M3 13.5v-4M6.5 13.5v-9M10 13.5v-6.5M13.5 13.5v-3"/></svg>\n`);
put('5 Signal/spectrum.svg', `${P.spectrumSvg(board)}\n`);
// Sig in the community: the Signal in person, drawn in the same hand as the three step drawings: a
// fine ring with the mood inside it in the Signal's blue. kit/kit.js draws it; these are its
// drawings standing alone, with lines that are part of the drawing, as the steps' files have them
const SIG = { idle: 'sig', think: 'sig-thinking', cheer: 'sig-cheering', support: 'sig-support', curious: 'sig-curious', watching: 'sig-watching', concerned: 'sig-concerned', sleepy: 'sig-resting' };
const SIG_NAME = { idle: 'Sig', think: 'Sig, thinking', cheer: 'Sig, cheering', support: 'Sig, support', curious: 'Sig, curious', watching: 'Sig, watching', concerned: 'Sig, concerned', sleepy: 'Sig, resting' };
for (const [mood, file] of Object.entries(SIG)) {
  const alone = sigSvg(200, mood, { dark: true })
    .replace(/<svg class="[^"]*"/, `<svg ${XMLNS}`).replace(' aria-hidden="true"', ` role="img" aria-label="${SIG_NAME[mood]}"`)
    .replace(/ vector-effect="non-scaling-stroke"/g, '').replace(/stroke-width="1\.2"/g, 'stroke-width="1.6"')
    .replace(/ class="[^"]*"/g, '').replace(/<\/?g>/g, '').replace(/>\s+</g, '><');
  if (/transform=|<g[ >]/.test(alone)) throw new Error(`Sig's ${mood} drawing can't stand alone: it still leans on a transform`);
  put(`5 Signal/sig/${file}.svg`, `${alone}\n`);
}

// ---------------------------------------------------------------------------
// 6 Marketing: the words, and three of the site's own share images
// ---------------------------------------------------------------------------
copy('og.jpg', '6 Marketing/share/share-home.jpg');
copy('img/og/community.jpg', '6 Marketing/share/share-community.jpg');
copy('img/og/ask-sig.jpg', '6 Marketing/share/share-ask-sig.jpg');
put('6 Marketing/Words.txt', `MIRACLE HEALTH: THE WORDS

Plain, calm and exact. Sentence case in text; headlines in capitals. No emoji, no exclamation marks.

Lines to use, as written:
  Peptides, without the sales pitch.
  No miracles. Just what happened.
  Took something? Say how it went.
  Your report moves the number for the next person, even if it did nothing.
  Three steps, one honest number.
  Nobody can buy a better number.
  How it went, for the people who took it.
  Experiences, not medical advice.

Never, anywhere:
  A dose or an amount. A seller, a brand or a lab. A price.
  A diagnosis, or advice to take or stop anything.
  A promise that something works. Urgency ("last chance", "don't miss").

When a post shows a compound's Signal:
  Take the number from the live Signal on the day you post (the ones in these files are examples).
  Keep the line "What people report. Not medical advice." on it.

Addresses: miraclehealth.us and community.miraclehealth.us
`);

put('README.txt', `MIRACLE HEALTH BRAND PACK

Start with "Brand guide.pdf": two pages, everything that matters.

1 Logo       The logo is white and sits on black, nothing else. The mark is Sig's ring;
             use it for a profile picture, an app icon or a browser tab.
2 Colour     The colours as CSS and JSON, and the three grounds as pictures.
3 Type       Mona Sans for every word, Monaspace Neon for numbers. These are the web files; for Canva, Figma,
             Word or Keynote install the full families, free, from github.com/github/mona-sans and
             github.com/githubnext/monaspace.
4 Icons      One set: 24 grid, 1.6 stroke, round ends, no fills. Files are white for black grounds; the
             sprite takes the colour of the words beside it.
5 Signal     The Community Signal's mark, a score, a card and the board. The numbers are examples.
             In sig: Sig in the community in its eight moods, drawn like the three steps in 4 Icons.
6 Marketing  Share images, posts, a how-it-works carousel, stories, profile headers, the email's header,
             and the words to use.

Made from the website's own code by design/pack/build.mjs, so it matches the pages.
`);

// ---------------------------------------------------------------------------
// The pictures
// ---------------------------------------------------------------------------
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let n = 0;
async function shot(html, rel, w, h, { clear = false, scale = 1 } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const file = path.join(TMP, `p${n += 1}.html`);
  fs.writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: rel.endsWith('.jpg') ? 'jpeg' : 'png', omitBackground: clear, ...(rel.endsWith('.jpg') ? { quality: 93 } : {}) });
  await page.close();
}
const bare = (svg, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}html,body{background:transparent}svg{display:block;width:${w}px;height:${h}px}</style></head><body>${svg}</body></html>`;

await shot(bare(LOGO, 2400, 840), '1 Logo/logo.png', 2400, 840, { clear: true });
await shot(P.logoOnBlack(), '1 Logo/logo-on-black.png', 1920, 1080);
await shot(bare(mark, 1024, 1024), '1 Logo/mark.png', 1024, 1024, { clear: true });
for (const s of [1024, 512, 192, 180]) await shot(P.appIcon(s), `1 Logo/app-icon-${s}.png`, s, s);
await shot(P.groundOnly(), '2 Colour/grounds/black-with-grid.png', 1920, 1080);
await shot(P.violetOnly(), '2 Colour/grounds/violet-band.jpg', 1920, 1080);
await shot(P.suedeOnly(fileUrl('img', 'suede.svg')), '2 Colour/grounds/suede.jpg', 1920, 1080);
await shot(P.scoreAlone(board[0]), '5 Signal/score.png', 1200, 520, { clear: true });
await shot(P.signalCard(board[0], 1, board.length, kindOf(board[0])), '5 Signal/signal-card.png', 1200, 1200);
await shot(P.boardRows(board.slice(0, 5)), '5 Signal/board.png', 1200, 560);
for (const [rel, [f, html]] of Object.entries(P.posts(board, board.length, kindOf, steps))) await shot(html, `6 Marketing/${rel}`, f.w, f.h);
await shot(P.banner(1500, 500, board, { pad: 72, head: 54, specW: 580, specH: 330 }), '6 Marketing/headers/x-header-1500x500.png', 1500, 500);
await shot(P.banner(1584, 396, board, { pad: 64, head: 54, gap: 26, logo: 40, specW: 700, specH: 270 }), '6 Marketing/headers/linkedin-cover-1584x396.png', 1584, 396);
await shot(P.emailHeader(), '6 Marketing/headers/email-header-1200x400.png', 1200, 400);

// The guide: one document, each page as a picture and all of them as one PDF; and the icon sheet
const guide = guidePages({ icons, steps, board, kindOf, palette: PALETTE, sig: (size, mood) => sigSvg(size, mood, { dark: true }) });
{
  const page = await browser.newPage({ viewport: { width: guide.w, height: guide.h }, deviceScaleFactor: 2 });
  const file = path.join(TMP, 'guide.html');
  fs.writeFileSync(file, guide.html);
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // Its pages as pictures, beside the pack (to show in a message or a slide)
  for (let i = 0; i < guide.count; i += 1) await page.screenshot({ path: path.join(dest, `Brand guide ${i + 1}.png`), fullPage: true, clip: { x: 0, y: i * guide.h, width: guide.w, height: guide.h } });
  await page.close();
}
await shot(guide.iconSheet, '4 Icons/all-icons.png', guide.w, guide.h, { scale: 2 });
await browser.close();

// The guide's PDF, made from its pages as pictures (a PDF of the page itself draws the headline's
// gradient with a stray hairline in some readers), and the zip, beside the folder
execFileSync('python3', ['-c', `
import sys, zipfile, pathlib
from PIL import Image
out = pathlib.Path(sys.argv[1])
pages = [Image.open(out.parent / f'Brand guide {i}.png').convert('RGB') for i in range(1, int(sys.argv[2]) + 1)]
pages[0].save(out / 'Brand guide.pdf', save_all=True, append_images=pages[1:], resolution=192, title='Miracle Health brand guide')
z = out.parent / (out.name + '.zip'); z.unlink(missing_ok=True)
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as f:
    for p in sorted(out.rglob('*')):
        if p.is_file(): f.write(p, pathlib.Path(out.name) / p.relative_to(out))
`, OUT, String(guide.count)]);
fs.rmSync(TMP, { recursive: true, force: true });
const count = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((a, x) => a + (x.isDirectory() ? count(path.join(d, x.name)) : 1), 0);
console.log(`brand pack: ${count(OUT)} files in ${OUT}`);
