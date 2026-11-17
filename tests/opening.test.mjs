// The front page's top (lib/sighero.js, lib/sigfield.js), Sig's 3D ring (lib/ring3d.js) and the shared
// number formatter (lib/dom.js): the walls a ring draws are the walls it binds, the top carries the
// light and the parts' bars, and numbers are grouped as the browser's own formats would. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ring3d } from '../lib/ring3d.js';
import { groupN } from '../lib/dom.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Just enough of a page for bind(): each slice's group and its faces, read from the markup
function fakePage(markup) {
  const groups = [];
  for (const m of markup.matchAll(/<g data-s="(\d+)">([\s\S]*?)<\/g>/g)) {
    const kids = [...m[2].matchAll(/<path data-f="(\w+)"[^>]*d="([^"]*)"/g)].map(([, f, d]) => ({
      attrs: { 'data-f': f, d },
      getAttribute(k) { return this.attrs[k]; },
      setAttribute(k, v) { this.attrs[k] = v; },
    }));
    groups.push({ s: m[1], children: kids, getAttribute(k) { return k === 'data-s' ? this.s : null; } });
  }
  return { groups, querySelectorAll: () => groups };
}
const PARTS = [65, 15, 10, 10].map((span, i) => ({ span, color: ['#3D8BFF', '#7BB0FF', '#AACCFF', '#D4E5FF'][i] }));
const GEO = { w: 560, h: 380, cx: 280, cy: 218, r: 102, band: 12, rim: 16, floor: 40, slab: 12, gap: 3.2, grid: 120, step: 40, parts: PARTS };

test('walls drawn standing in the markup are the walls bind draws', () => {
  const geo = ring3d(GEO);
  for (const hs of [[6, 6, 6, 6], [40.1, 39.2, 42, 38.4], [6, 20, 33.3, 41.9]]) {
    const drawn = fakePage(geo.walls());
    geo.bind(drawn)(hs);
    const standing = fakePage(geo.walls(hs));
    assert.equal(standing.groups.length, drawn.groups.length);
    standing.groups.forEach((g, i) => g.children.forEach((p, j) => assert.equal(p.attrs.d, drawn.groups[i].children[j].attrs.d)));
  }
});

test('bind leaves a part alone until its height changes', () => {
  const geo = ring3d(GEO);
  const page = fakePage(geo.walls([10, 10, 10, 10]));
  const draw = geo.bind(page, [10, 10, 10, 10]);
  let sets = 0;
  for (const g of page.groups) for (const p of g.children) { const set = p.setAttribute.bind(p); p.setAttribute = (k, v) => { sets++; set(k, v); }; }
  draw([10, 10, 10, 10]);
  assert.equal(sets, 0);
  draw([10, 30, 10, 10]);
  assert.ok(sets > 0);
});

test('the front page carries the light and the four parts, and no ring or floor', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(html.includes('<div class="sx-field" aria-hidden="true"><canvas class="sx-field-c" width="1" height="1"></canvas><i class="sx-led"></i></div>'));
  const ill = html.slice(html.indexOf('data-sx="ring"'), html.indexOf('<div class="sx-tb">'));
  assert.equal((ill.match(/<li class="sx-pt p\d"><span>[a-z ]+<\/span><span class="sx-m"><i><\/i><\/span><b>–<\/b><\/li>/g) || []).length, 4);
  assert.ok(!/sighero:|sx-ground|sx-svg|orbit/.test(ill + html.slice(html.indexOf('sx-hero'), html.indexOf('sx-grid'))));
  assert.ok(fs.existsSync(path.join(ROOT, 'img/led.svg')));
});

test('numbers are grouped as en-US toLocaleString groups them', () => {
  for (const n of [0, 7, 999, 1000, 1234, 12345, 1234567, -1234, 12.5, 1234.5678, '3456', null, undefined, NaN]) {
    assert.equal(groupN(n), Number(n || 0).toLocaleString('en-US'), String(n));
  }
});

test("the agents' ring, drawn one part to a layer, draws the same walls in the same order", () => {
  const parts = ['safety', 'planner', 'recommender', 'community', 'combination', 'markers', 'synergy', 'evidence', 'relatives', 'mechanism', 'builder']
    .map((key) => ({ key, span: 100 / 11, color: '#FF6B5B' }));
  const geo = ring3d({ w: 400, h: 300, cx: 200, cy: 150, r: 118, band: 11, rim: 14, floor: 34, slab: 10, gap: 3.4, grid: 114, step: 38, byPart: true, parts });
  const whole = geo.walls();
  const layered = geo.partWalls();
  assert.equal(layered.length, parts.length);
  // the same slices, in the same order from the back to the front
  const ids = (m) => [...m.matchAll(/data-s="(\d+)"/g)].map((x) => x[1]);
  assert.deepEqual(layered.flatMap(([, m]) => ids(m)), ids(whole));
  const keys = [...whole.matchAll(/class="rg" data-a="(\w+)"/g)].map((x) => x[1]);
  assert.deepEqual(layered.map(([k]) => k), keys);
});

test("the Signal's parts are the same four colours in the light, the bars and the spectrum", () => {
  const js = fs.readFileSync(path.join(ROOT, 'lib/sighero.js'), 'utf8');
  const cols = JSON.parse(js.match(/const COLS = (\[[^\]]+\]);/)[1].replace(/'/g, '"')).map((c) => c.toUpperCase());
  const css = fs.readFileSync(path.join(ROOT, 'home.css'), 'utf8');
  const lime = '#3D8BFF';
  const val = (v) => (v.trim() === 'var(--lime)' ? lime : v.trim().toUpperCase());
  for (let i = 0; i < 4; i++) {
    assert.equal(val(css.match(new RegExp(`\\.p${i}\\{--c:([^}]+)\\}`))[1]), cols[i], `bar ${i}`);
    assert.equal(val(css.match(new RegExp(`\\.sx-p${i}\\{background:([^}]+)\\}`))[1]), cols[i], `spectrum ${i}`);
  }
});

