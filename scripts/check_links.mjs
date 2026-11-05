#!/usr/bin/env node
// Checks every link and file reference between the site's own pages: each one leads to a page or
// file that's there, and each #part of a page it points to exists on that page. Links to other
// sites aren't fetched. Run: node scripts/check_links.mjs (fails, and lists them, if any is broken)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules', 'scripts', 'fonts']);
const pages = [];
(function walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(d.name)) continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p); else if (d.name.endsWith('.html')) pages.push(p);
  }
}(ROOT));

// A site path to the file GitHub Pages would serve for it
function fileFor(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const p = path.join(ROOT, clean);
  if (clean.endsWith('/')) return path.join(p, 'index.html');
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  if (fs.existsSync(`${p}.html`)) return `${p}.html`;
  if (fs.existsSync(path.join(p, 'index.html'))) return path.join(p, 'index.html');
  return p;
}
// A #part that carries a page's state (Miracle AI's #ask=..., a shared plan) isn't a place on it
const isState = (hash) => /[=/]/.test(hash);
const idsCache = new Map();
function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
}

const broken = [];
let checked = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const here = `/${path.relative(ROOT, file).split(path.sep).join('/')}`;
  // The email issues are read in email apps, where every link is absolute
  if (here.endsWith('/email.html')) continue;
  for (const m of html.matchAll(/\s(href|src|srcset|action)="([^"]+)"/g)) {
    const refs = m[1] === 'srcset' ? m[2].split(',').map((x) => x.trim().split(/\s+/)[0]) : [m[2].trim()];
    for (const ref of refs) {
      if (!ref || /^(https?:|mailto:|tel:|data:|javascript:)/.test(ref) || ref.includes('${')) continue;
      checked += 1;
      if (ref.startsWith('#')) {
        if (ref.length > 1 && ref !== '#_' && !isState(ref.slice(1)) && !idsOf(file).has(decodeURIComponent(ref.slice(1)))) broken.push(`${here}: ${ref} (no such part on the page)`);
        continue;
      }
      const abs = ref.startsWith('/') ? ref : path.posix.join(path.posix.dirname(here), ref);
      const target = fileFor(abs);
      if (!fs.existsSync(target)) { broken.push(`${here}: ${ref}`); continue; }
      const hash = ref.split('#')[1];
      if (hash && hash !== '_' && !isState(hash) && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(hash))) broken.push(`${here}: ${ref} (no such part on that page)`);
    }
  }
}
if (broken.length) {
  console.error(`${broken.length} broken link${broken.length === 1 ? '' : 's'}:\n${[...new Set(broken)].slice(0, 200).join('\n')}`);
  process.exit(1);
}
console.log(`links: ${checked} checked across ${pages.length} pages, none broken`);
