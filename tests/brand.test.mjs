// The brand's own pieces (design/BRAND.md, Logo and Voice): the icon is the logo's own u, drawn from the
// same outline, and every page links it for a browser's tab and a phone's home screen; the ring is
// Sig's, on Ask Sig only. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const outline = (svg) => /<path fill="[^"]*" d="([^"]+)"/.exec(svg)?.[1] ?? '';
const SKIP = new Set(['.git', '.design', 'design', 'tests', 'scripts', 'node_modules', 'img']);
function pages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.isDirectory()) return SKIP.has(d.name) && dir === ROOT ? [] : pages(path.join(dir, d.name));
    return d.name.endsWith('.html') ? [path.join(dir, d.name)] : [];
  });
}

test('the icon is the logo’s own u: one outline, in the tab’s icon, the pack’s and the logo', () => {
  const u = outline(read('favicon.svg'));
  assert.ok(u.length > 100 && u.endsWith('Z'), 'favicon.svg has the u’s outline');
  // design/pack/wordmark.py draws them all; a u redrawn by hand anywhere would no longer match
  for (const f of ['icon.svg', 'icon-black.svg', 'icon-white.svg']) assert.equal(outline(read('design', 'pack', f)), u, `design/pack/${f}`);
  assert.ok(outline(read('logo.svg')).startsWith(u), 'the logo’s first letter is that same outline');
  // no ring in it: the ring is Sig's
  assert.ok(!/<circle/.test(read('favicon.svg')), 'favicon.svg draws no ring');
  // the tab's icon for a browser that can't show an SVG one: three sizes
  const ico = fs.readFileSync(path.join(ROOT, 'favicon.ico'));
  assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)], [0, 1, 3], 'favicon.ico holds three pictures');
  assert.deepEqual([0, 1, 2].map((i) => ico[6 + 16 * i]), [16, 32, 48]);
  // a phone's home screen: a PNG, 180 pixels square
  const png = fs.readFileSync(path.join(ROOT, 'apple-touch-icon.png'));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [180, 180]);
});

test('every page links the icon for the tab and for a phone’s home screen, once each', () => {
  const wrong = [];
  let linked = 0;
  for (const p of pages()) {
    const s = fs.readFileSync(p, 'utf8');
    const rel = path.relative(ROOT, p);
    const tab = s.match(/<link rel="icon" href="\/favicon\.svg\?v=[0-9a-f]+" type="image\/svg\+xml">/g) || [];
    if (!tab.length) continue;      // a page that only sends the browser on has no icon of its own
    linked += 1;
    const touch = [...s.matchAll(/<link rel="apple-touch-icon" href="([^"?]+)/g)].map((m) => m[1]);
    if (tab.length !== 1) wrong.push(`${rel}: ${tab.length} tab icons`);
    if (touch.length !== 1) wrong.push(`${rel}: ${touch.length} home-screen icons`);
    else if (!fs.existsSync(path.join(ROOT, touch[0]))) wrong.push(`${rel}: ${touch[0]} is missing`);
    // Ask Sig is an app of its own and keeps its ring on a home screen; every other page has Unhyped's
    else if (touch[0] !== (rel === path.join('sig', 'index.html') ? '/sig/icon-180.png' : '/apple-touch-icon.png')) wrong.push(`${rel}: its home-screen icon is ${touch[0]}`);
  }
  assert.ok(linked > 300, `found ${linked} pages with a tab icon`);
  assert.deepEqual(wrong, []);
});
