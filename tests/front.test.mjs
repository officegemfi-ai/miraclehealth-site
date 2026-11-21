// The front page below its top: Sig's twelve agents round its ring (the logo's own order and colours,
// from lib/ring.js), the live Signal as the place "/#signal" lands now that the board has left the
// page, and the real example's three plates, whose words are the fact sheet's and the placebo file's
// own. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WHEEL, CENTER, AGENT_COLOR } from '../lib/ring.js';
import { GRADES, gradeLabel } from '../kit/kit.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = read('index.html');
const css = read('home.css');
const js = read('home.js');
const between = (text, from, to) => { const a = text.indexOf(from); assert.ok(a >= 0, `no ${from}`); const b = text.indexOf(to, a); assert.ok(b > a, `no ${to}`); return text.slice(a, b); };

const crew = between(html, '<div class="cr" id="crew">', '<!-- /crew:ring -->');
const turn = 360 / WHEEL.length;
const middle = (i) => ((-90 + (i + 0.5) * turn) * Math.PI) / 180;

test("Sig's ring on the front page is the logo's: its eleven in order and colour, the twelfth in the middle", () => {
  const arcs = [...crew.matchAll(/<g class="cr-arc" data-agent="(\w+)"><path class="cr-band" d="M(-?[\d.]+) (-?[\d.]+)A[\d.]+ [\d.]+ 0 0 1 (-?[\d.]+) (-?[\d.]+)" stroke="(#[0-9A-Fa-f]{6})"/g)];
  assert.deepEqual(arcs.map((m) => m[1]), WHEEL);
  arcs.forEach(([, key, x0, y0, x1, y1, colour], i) => {
    assert.equal(colour.toUpperCase(), AGENT_COLOR[key].toUpperCase(), `${key}'s colour`);
    // a piece's two ends sit either side of its middle, clockwise from the top
    const at = Math.atan2(Number(y0) + Number(y1), Number(x0) + Number(x1));
    const off = Math.atan2(Math.sin(at - middle(i)), Math.cos(at - middle(i)));
    assert.ok(Math.abs(off) < 0.002, `${key} is drawn ${(off * 180 / Math.PI).toFixed(2)}° from its place`);
  });
  const whos = [...crew.matchAll(/<li class="cr-who( cr-core)?" data-agent="(\w+)"><button class="cr-name" type="button" aria-pressed="false" aria-describedby="cr-j-(\w+)">([\s\S]*?)<\/button><span class="cr-job" id="cr-j-(\w+)">([^<]+)<\/span><\/li>/g)];
  assert.deepEqual(whos.map((m) => m[2]), [...WHEEL, CENTER]);
  for (const [, core, key, says, name, id, job] of whos) {
    assert.equal(says, key);
    assert.equal(id, key);
    assert.equal(Boolean(core), key === CENTER, `${key}: only the one that weighs it all sits in the middle`);
    assert.ok(name.replace(/<[^>]+>/g, '').trim().length > 3, `${key} has no name`);
    assert.ok(job.trim().length > 20, `${key} has no job`);
  }
  // the site's policy lets no style="" through, so nothing here may depend on one
  assert.ok(!/\sstyle="/.test(crew));
});

test("each agent's name stands at the middle of its piece", () => {
  WHEEL.forEach((key, i) => {
    const m = new RegExp(`\\.cr-who:nth-child\\(${i + 1}\\)\\{--x:(-?[\\d.]+);--y:(-?[\\d.]+)\\}`).exec(css);
    assert.ok(m, `no place for ${key}`);
    assert.ok(Math.abs(Number(m[1]) - Math.cos(middle(i))) < 0.002 && Math.abs(Number(m[2]) - Math.sin(middle(i))) < 0.002, `${key}'s name is off its piece`);
  });
});

test('the board has left the front page, and "/#signal" lands on the live Signal', () => {
  assert.ok(!/fp-board|fp-signal|fp-top|signalBoard/.test(html + css + js));
  assert.equal((html.match(/\sid="signal"/g) || []).length, 1);
  assert.match(html, /<figure class="sx hs-card" id="signal"/);
});

const example = between(html, '<article class="vs fp-vs"', '</article>');
const lane = (k) => between(example, `<section class="vs-lane ${k}">`, '</section>');
const uses = (k) => [...lane(k).matchAll(/<div class="vs-u" data-use="(\w+)"><dt>([^<]+)<\/dt><dd class="vs-cell (\w+)">([\s\S]*?)<\/dd><\/div>/g)]
  .map(([, use, label, cls, cell]) => ({ use, label, cls, cell }));

test("the real example's three plates keep the same uses, in the same order", () => {
  const order = uses('st').map((u) => u.use);
  assert.equal(order.length, 3);
  for (const k of ['st', 'rep', 'pl']) {
    assert.deepEqual(uses(k).map((u) => u.use), order, k);
    assert.deepEqual(uses(k).map((u) => u.label), uses('st').map((u) => u.label), k);
    for (const u of uses(k)) assert.equal(u.cls, k);
  }
});

test("the real example says what the fact sheet says, word for word, with its source", () => {
  const sheet = JSON.parse(read(`library/data/entries/${/data-id="(\w+)"/.exec(example)[1]}.json`));
  assert.ok(example.includes(`<h3 id="vs-name">${sheet.name}</h3>`));
  assert.ok(example.includes(`data-v="status">${sheet.status_us.label}</p>`));
  // the plate's bottom line is the fact sheet's own grade, on the kit's meter
  const fig = between(lane('st'), '<div class="vs-fig">', '</div>');
  assert.ok(fig.includes(`<b class="w">${gradeLabel(sheet.evidence.grade)}</b>`));
  assert.ok(fig.includes(`<span class="mh-meter m${GRADES[sheet.evidence.grade][0]}" aria-hidden="true">`));
  let own = 0;
  for (const { label, cell } of uses('st')) {
    const sub = /<p class="vs-sub">([\s\S]*?)<\/p>/.exec(cell)[1];
    const words = sub.replace(/<a [^>]*>[^<]*<\/a>/g, '').trim();
    if (/^The same studies as for [a-z ]+\.$/.test(words)) continue;
    const claim = sheet.benefits.find((b) => `${b.claim}.` === words);
    assert.ok(claim, `${label}: not the fact sheet's words`);
    const source = sheet.sources.find((s) => s.n === claim.sources[0]);
    assert.ok(sub.includes(`<a href="${source.url}" aria-label="Source: `), `${label}: the finding has lost its source`);
    own++;
  }
  assert.ok(own >= 2);
});

test("the real example's placebo figures are the placebo file's, and the range is theirs", () => {
  const base = JSON.parse(read('library/data/baselines.json'));
  const pcts = uses('pl').map(({ use, label, cell }) => {
    const b = base.uses.find((u) => u.use === use);
    assert.ok(b, `no placebo figure for ${use}`);
    assert.equal(label, b.label);
    assert.ok(cell.includes(`<p class="vs-v"><b>${b.placebo_pct}%</b></p>`), `${use}: the figure`);
    assert.ok(cell.includes(`<rect class="fi" width="${b.placebo_pct}" height="6"/>`), `${use}: the bar`);
    assert.ok(cell.includes(`<p class="vs-sub">${b.says}</p>`), `${use}: the sentence`);
    return b.placebo_pct;
  });
  const lo = Math.min(...pcts), hi = Math.max(...pcts);
  const fig = lane('pl');
  assert.ok(fig.includes(`data-v="range-n">${lo}–${hi}%</b>`));
  assert.ok(fig.includes(`data-v="range-sr">${lo}% to ${hi}%,</span>`));
  assert.ok(fig.includes(`data-v="range-bar"><rect class="tr" width="100" height="6"/><rect class="fi" x="${lo}" width="${hi - lo}" height="6"/>`));
});

test('every number the page fills in live still has its place', () => {
  const places = new Set([...example.matchAll(/data-v="([\w-]+)"/g)].map((m) => m[1]));
  const filled = new Set([...js.matchAll(/\bv\('([\w-]+)'\)/g)].map((m) => m[1]));
  assert.ok(filled.size >= 8);
  for (const k of filled) assert.ok(places.has(k), `home.js fills "${k}", which the page doesn't have`);
  // and the cells it replaces as reports come in are found the way it looks for them
  assert.match(js, /\.vs-lane\.\$\{lane\} \.vs-u\[data-use="/);
  assert.match(js, /\.vs-cell\.pl \.vs-v b/);
});
