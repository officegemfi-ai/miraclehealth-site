// The front page's graph of the Library (scripts/graph.mjs, drawn by lib/graph.js): that the same
// Library always lays out the same, that it draws every fact sheet and every blend whose parts are
// all drawn, that Sig's tour and the search work from the Library's own words, and that the
// download stays small. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGraph, POSTER_R } from '../scripts/graph.mjs';
import { fold, camera, projectCloud, placePhrase } from '../lib/graph.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const body = read('library/data/body.json');
const catalog = read('library/data/catalog.json');
const graph = buildGraph({ body, catalog });
const g = graph.data;

test('the same Library always gives the same graph and picture', () => {
  const again = buildGraph({ body, catalog });
  assert.equal(again.json, graph.json);
  assert.equal(again.svg, graph.svg);
});

test('every drawn compound has a fact sheet page, in its family', () => {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  assert.equal(g.ids.length, Object.keys(body.compounds).length);
  g.ids.forEach((id, c) => {
    assert.ok(fs.existsSync(path.join(ROOT, 'library', id, 'index.html')), `no page for ${id}`);
    assert.equal(['Peptides', 'Hormones', 'Medications', 'Supplements'][g.famOf[c]], byId.get(id).family, id);
    assert.equal(g.names.c[c], byId.get(id).name);
  });
  assert.equal(g.nodes.length, g.counts.nodes * 3);
  assert.equal(g.lineC.length, g.counts.lines);
});

test('every blend whose parts are all drawn is traced as one, and nothing else', () => {
  const drawn = new Set(Object.keys(body.compounds));
  const want = catalog.filter((c) => c.kind === 'blend' && c.parts.length > 1 && c.parts.every((p) => drawn.has(p))).map((c) => c.id);
  assert.deepEqual(g.stacks.map((s) => s.id), want);
  for (const s of g.stacks) {
    assert.ok(s.parts.every((c) => Number.isInteger(c) && c >= 0 && c < g.counts.compounds), s.id);
    assert.ok(!/\(|blend$/i.test(s.name), `${s.id}: "${s.name}" should be its short name`);
  }
});

test("Sig's tour: the front page's four, then the Wolverine blend, every blend once", () => {
  const ids = (k) => (k >= 0 ? g.ids[k] : g.stacks[-k - 1].id);
  assert.deepEqual(g.tour.slice(0, 5).map(ids), ['semaglutide', 'bpc157', 'tirzepatide', 'tb500', 'wolverine']);
  const blends = g.tour.filter((k) => k < 0);
  assert.equal(new Set(blends).size, g.stacks.length);
  assert.equal(blends.length, g.stacks.length);
  for (const k of g.tour) assert.ok(k < g.counts.compounds && -k - 1 < g.stacks.length);
});

test('the search folds words as the Library search does', () => {
  const src = fs.readFileSync(path.join(ROOT, 'library', 'library.js'), 'utf8');
  const line = src.match(/const fold = (\(s\) => .*);/);
  assert.ok(line, "library.js's fold");
  const theirs = new Function(`return ${line[1]}`)();
  for (const s of ['BPC-157', 'TB 500', 'Glucagon-like peptide 1', 'Café', 'GHK‑Cu', 'semaglutide (Ozempic)']) assert.equal(fold(s), theirs(s), s);
  const bpc = g.ids.indexOf('bpc157');
  assert.ok(g.find[bpc].includes(fold('BPC-157')) && g.find[bpc].includes(fold('Peptides')));
  assert.ok(g.stacks.find((s) => s.id === 'wolverine').find.includes(fold('wolverine')));
});

test('the still picture is the graph at the live drawing\'s first pose', () => {
  assert.match(graph.svg, /^<svg [^>]*viewBox="-1\.6 -1\.6 3\.2 3\.2"/);
  assert.equal(POSTER_R, 1.6);
  assert.ok(!/NaN|Infinity/.test(graph.svg));
  // Sig's place in the picture is where projectCloud puts it
  const S = (g.counts.nodes - 1) * 3;
  const out = { x: [0], y: [0], z: [0], s: [0] };
  projectCloud(g.nodes.slice(S, S + 3).map((v) => v / 1000), 1, 6.5, camera(6.5, 0.45), 1, () => false, () => true, out);
  const cx = String(Math.round(out.x[0] * 1000) / 1000).replace(/^(-?)0\./, '$1.');
  assert.ok(graph.svg.includes(`cx="${cx}"`), 'Sig where the camera puts it');
});

test('the front page gets the legend, the count of what the lines say, and the text', () => {
  assert.match(graph.legend, new RegExp(`${g.counts.compounds} of the ${catalog.length} have full fact sheets`));
  for (const k of ['up', 'down', 'block', 'is', 'watch', 'warn']) assert.ok(graph.foot.includes(`<b>${g.ops[k].toLocaleString('en-US')}</b>`), k);
  assert.match(graph.text, /^<p>The Library as one graph/);
  assert.ok(!/<a /.test(graph.text), 'the text version has no links to tab through');
  const front = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const key of ['graph:legend', 'graph:foot', 'graph:text', 'graph:size', 'graph:lines']) assert.ok(front.includes(`<!-- ${key} -->`), key);
});

test('places read naturally in a question', () => {
  assert.equal(placePhrase('liver'), 'the liver');
  assert.equal(placePhrase('blood sugar'), 'blood sugar');
  assert.equal(placePhrase('urinary · genital'), 'the urinary and genital organs');
  for (const p of g.names.p) assert.ok(!placePhrase(p).includes('·'), p);
});

test('the download stays small', () => {
  assert.ok(graph.json.length < 64000, `graph.json is ${graph.json.length} bytes`);
  assert.ok(graph.svg.length < 160000, `the still picture is ${graph.svg.length} bytes`);
  assert.ok(fs.statSync(path.join(ROOT, 'lib', 'graph.js')).size < 72000, 'lib/graph.js');
});
