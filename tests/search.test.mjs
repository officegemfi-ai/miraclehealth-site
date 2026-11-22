// What a search result shows (fitTitle and fitDescription in scripts/build_library.mjs): Google cuts a
// title at about 60 characters and a description at about 155, so every page's own are fitted to that,
// keeping what tells the most, while its share card keeps the full ones. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.design', 'design', 'tests', 'scripts', 'node_modules', 'img']);
const plain = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function pages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.isDirectory()) return SKIP.has(d.name) && dir === ROOT ? [] : pages(path.join(dir, d.name));
    return d.name.endsWith('.html') ? [path.join(dir, d.name)] : [];
  });
}
const head = (file) => {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const get = (re) => plain(re.exec(s)?.[1] ?? '');
  return { title: get(/<title>([^<]*)<\/title>/), description: get(/<meta name="description" content="([^"]*)"/),
    ogTitle: get(/<meta property="og:title" content="([^"]*)"/), ogDescription: get(/<meta property="og:description" content="([^"]*)"/) };
};

test('every page’s title and description fit a search result, so neither is cut off', () => {
  const all = pages();
  assert.ok(all.length > 300, `found ${all.length} pages`);
  const long = [];
  for (const p of all) {
    const { title, description } = head(path.relative(ROOT, p));
    if (title.length > 60) long.push(`${path.relative(ROOT, p)}: title, ${title.length} characters`);
    if (description.length > 155) long.push(`${path.relative(ROOT, p)}: description, ${description.length} characters`);
  }
  assert.deepEqual(long, []);
});

test('a fact sheet keeps its whole name when it fits, and its share card keeps the full title', () => {
  // Brackets kept, the site's name dropped: "CDP-choline" is a name people look up
  assert.equal(head('library/citicoline/index.html').title, 'Citicoline (CDP-choline): evidence, risks, blood tests');
  // Too long with its brackets: the name without them, the site's name kept
  const klow = head('library/klow/index.html');
  assert.equal(klow.title, 'KLOW blend: evidence, risks, blood tests · Unhyped');
  assert.equal(klow.ogTitle, 'KLOW blend (GHK-Cu, BPC-157, TB-500, KPV): evidence, risks, blood tests · Unhyped');
});

test('a description keeps whole sentences, and the share card the full text', () => {
  const mk = head('library/mk677/index.html');
  assert.ok(mk.description.length <= 155 && /\.$/.test(mk.description), mk.description);
  assert.ok(mk.ogDescription.startsWith(mk.description) && mk.ogDescription.length > mk.description.length);
});
