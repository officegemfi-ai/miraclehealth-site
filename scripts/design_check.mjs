// The design check: every stylesheet keeps to the brand book (design/BRAND.md, design/tokens.json).
// It reads the CSS and finds what the brand doesn't allow:
// - colours that aren't the brand's;
// - type families other than Mona Sans, Mona Sans Display and Monaspace Neon;
// - corner radii outside the set;
// - type sizes off the scale;
// - mono that is tracked outside a kicker, and capitals outside headlines, kickers and the COMMUNITY tag;
// - gradients and shadows, which are counted.
// What's there today is written down in design/baseline.json. The check fails when any of these
// grows, so a change can't bring drift back. Once drift is fixed, `--update` lowers the baseline.
//   node scripts/design_check.mjs            check
//   node scripts/design_check.mjs --list     every finding, file:line
//   node scripts/design_check.mjs --update   write today's counts as the baseline
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS = JSON.parse(fs.readFileSync(path.join(ROOT, 'design', 'tokens.json'), 'utf8'));
const BASELINE_FILE = path.join(ROOT, 'design', 'baseline.json');
const args = new Set(process.argv.slice(2));

// ---------------------------------------------------------------- what the brand allows
const hexOf = (v) => v.toLowerCase();
const byName = Object.fromEntries(TOKENS.color.tokens.map((t) => [t.name, t.value]));
const resolve = (v) => { let x = v; for (let i = 0; i < 16 && /^\{.+\}$/.test(x); i++) x = byName[x.slice(1, -1)]; return x; };
const rgbOf = (s) => {
  s = s.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x)));
    if (p.length >= 3 && p.slice(0, 3).every((x) => Number.isFinite(x))) return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  return null;
};
// the palette: every colour token, plus white (the main button's hover) and black (shadows, scrims)
const PALETTE = new Map();
for (const t of TOKENS.color.tokens) {
  const v = resolve(t.value);
  const c = rgbOf(v);
  if (c) PALETTE.set(c.slice(0, 3).join(','), t.name);
}
PALETTE.set('255,255,255', 'white (the main button on hover)');
PALETTE.set('0,0,0', 'black (shadows and scrims, never a ground)');
const FAMILIES = new Set(['mona sans', 'mona sans display', 'monaspace neon', 'mona', 'monadisplay', 'neon',
  'system-ui', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'sans-serif', 'ui-monospace', 'sfmono-regular', 'menlo', 'consolas', 'monospace', 'inherit', 'initial', 'unset']);
// The Sig system's corners (design/tokens.json): tags 7, tabs 8, rows 9, controls 10, cards 12, panes 14;
// 6 is left for focus rings and the wordmark, 11 for the masks that round the window's inner corners
// every corner is square (decision, November 13); only dots and rings are round
const RADII = new Set(['0', '0px', '50%', 'inherit']);
const SIZES = new Set(TOKENS.type.groups.flatMap((g) => g.styles.map((s) => s.fontSize)).concat(
  ['10.5px', '11px', '14px', '17.5px', '20px', '22px', '24px', '28px', '32px', '40px', '1em', 'inherit', 'smaller', '100%']));

// ---------------------------------------------------------------- reading the stylesheets
const FILES = fs.readdirSync(ROOT, { recursive: true })
  .filter((f) => f.endsWith('.css') && !/(^|\/)(node_modules|vendor|\.git)\//.test(f) && !f.startsWith('.'))
  .sort();
function declarations(file) {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));   // comments out, lines kept
  const out = [];
  const re = /([{;\s])(-?[a-z-]+)\s*:\s*([^;{}]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const prop = m[2].toLowerCase(), value = m[3].trim();
    if (/^[a-z-]+$/.test(prop) && !/^(http|https|data)$/.test(prop)) {
      const line = text.slice(0, m.index + 1).split('\n').length;
      out.push({ prop, value, line });
    }
  }
  return out;
}
const splitTop = (v, sep = /\s/) => {   // split at top level (not inside brackets)
  const parts = []; let depth = 0, cur = '';
  for (const ch of v) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && sep.test(ch)) { if (cur.trim()) parts.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
};
function familiesOf(prop, value) {
  if (prop === 'font-family') return value.split(',');
  // font: [style] [weight] [stretch] size[/line-height] family, …
  const parts = splitTop(value);
  const i = parts.findIndex((p) => /^(\d*\.?\d+(px|rem|em|%)|var\(|clamp\(|calc\(|min\(|max\()/.test(p.split('/')[0]) && !/^\d+$/.test(p));
  if (i < 0) return [];
  return parts.slice(i + 1).join(' ').split(',');
}

// ---------------------------------------------------------------- the rules
const findings = [];
const add = (rule, file, line, what, hint) => findings.push({ rule, file, line, what, hint });
for (const file of FILES) {
  for (const { prop, value, line } of declarations(file)) {
    // colours: every literal, wherever it is (custom properties too)
    for (const lit of value.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) || []) {
      if (/var\(/.test(lit)) continue;
      const c = rgbOf(lit);
      if (!c) continue;
      if (!PALETTE.has(c.slice(0, 3).join(','))) {
        let best = null;
        for (const [k, name] of PALETTE) { const t = k.split(',').map(Number); const d = Math.hypot(t[0] - c[0], t[1] - c[1], t[2] - c[2]); if (!best || d < best[1]) best = [name, d]; }
        add('colour', file, line, `${prop}: ${lit}`, `not a brand colour; nearest is ${best[0]}`);
      }
    }
    // families
    if (prop === 'font-family' || prop === 'font') {
      for (const f of familiesOf(prop, value)) {
        const name = f.trim().replace(/^["']|["']$/g, '').toLowerCase();
        if (!name || name.startsWith('var(') || FAMILIES.has(name)) continue;
        add('font-family', file, line, `${prop}: ${value}`, `"${f.trim()}" isn't a brand face`);
      }
    }
    // radii
    if (/^border(-(top|bottom)-(left|right))?-radius$/.test(prop)) {
      for (const v of splitTop(value.replace(/\s*\/\s*/g, ' '))) {
        if (RADII.has(v) || v.startsWith('var(') || v.startsWith('calc(')) continue;
        add('radius', file, line, `${prop}: ${value}`, `${v} isn't square (corners are 0; 50% only for dots and rings)`);
      }
    }
    // type sizes
    const sizes = [];
    if (prop === 'font-size') sizes.push(value);
    if (prop === 'font') { const s = splitTop(value).find((p) => /^\d*\.?\d+(px|rem|em|%)/.test(p.split('/')[0])); if (s) sizes.push(s.split('/')[0]); }
    for (const s of sizes) {
      if (SIZES.has(s) || /^(var|clamp|calc|min|max)\(/.test(s)) continue;
      add('font-size', file, line, `${prop}: ${value}`, `${s} is off the type scale`);
    }
    // gradients and shadows: counted (the plate's ticks, the Signal's bar and floating panels have them)
    if (/gradient\(/.test(value) && prop !== 'mask-image' && prop !== '-webkit-mask-image') add('gradient', file, line, `${prop}: ${value.slice(0, 80)}`, 'gradients: the Signal bar and drawn marks only');
    if (prop === 'box-shadow' && value !== 'none') add('shadow', file, line, `box-shadow: ${value.slice(0, 80)}`, 'shadows: floating panels and the phone drawer only');
  }
}
// Type, rule by rule: mono is untracked except in kickers; capitals are for headlines, kickers and the
// COMMUNITY tag (labels, tags, tabs and the status bar are lowercase or sentence case)
const KICKER = /kick|(^|[^a-z])sy-k\b|\.tag\b|tick-sig/;
const HEADLINE = /(^|[\s,>+~(])h[12](?![\w-])|-head\b|hero|ai-title/;
const zero = (v) => /^(0|0px|0em|normal|-?0\.0+em)$/.test(v.trim());
for (const file of FILES) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const sel = m[1].trim().replace(/\s+/g, ' '), body = m[2];
    if (sel.startsWith('@')) continue;
    const line = text.slice(0, m.index + m[0].indexOf('{')).split('\n').length;
    const mono = /font(-family)?\s*:[^;]*var\(--mono\)/.test(body);
    const ls = /letter-spacing\s*:\s*([^;]+)/.exec(body);
    if (mono && ls && !zero(ls[1]) && !KICKER.test(sel)) add('mono-tracking', file, line, `${sel.slice(0, 70)} { letter-spacing: ${ls[1].trim()} }`, 'mono is untracked outside kickers');
    if (/text-transform\s*:\s*uppercase/.test(body) && !KICKER.test(sel) && !HEADLINE.test(sel)) add('capitals', file, line, `${sel.slice(0, 70)} { text-transform: uppercase }`, 'capitals are for headlines, kickers and the COMMUNITY tag');
  }
}
// inline styles never apply under the site's policy (style-src 'self'): none in any page
const HTML = fs.readdirSync(ROOT, { recursive: true }).filter((f) => f.endsWith('.html') && !/(^|\/)(node_modules|vendor|\.git)\//.test(f) && !f.endsWith('email.html'));
for (const f of HTML) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const n = (s.match(/\sstyle="/g) || []).length;
  if (n) add('inline-style', f, 0, `${n} style="" attribute(s)`, 'blocked by the page policy: use a class');
}

// ---------------------------------------------------------------- against the baseline
const RULES = ['colour', 'font-family', 'radius', 'font-size', 'mono-tracking', 'capitals', 'gradient', 'shadow', 'inline-style'];
const counts = Object.fromEntries(RULES.map((r) => [r, {}]));
for (const f of findings) counts[f.rule][f.file] = (counts[f.rule][f.file] || 0) + 1;
if (args.has('--list')) {
  for (const f of findings) console.log(`${f.rule.padEnd(12)} ${f.file}:${f.line}  ${f.what}  (${f.hint})`);
}
if (args.has('--update')) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify({ note: 'What the design check allows today. Lower it as drift is fixed (node scripts/design_check.mjs --update); never raise it to let drift in.', counts }, null, 2) + '\n');
  console.log('design baseline written:', RULES.map((r) => `${r} ${Object.values(counts[r]).reduce((a, b) => a + b, 0)}`).join(', '));
  process.exit(0);
}
const base = fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')).counts : Object.fromEntries(RULES.map((r) => [r, {}]));
let failed = 0, better = 0;
for (const r of RULES) {
  const files = new Set([...Object.keys(counts[r]), ...Object.keys(base[r] || {})]);
  for (const file of files) {
    const now = counts[r][file] || 0, was = (base[r] || {})[file] || 0;
    if (now > was) {
      failed++;
      console.log(`::error file=${file}::${r}: ${now} now, ${was} allowed. Keep to the brand book (design/BRAND.md):`);
      for (const f of findings.filter((x) => x.rule === r && x.file === file)) console.log(`   ${file}:${f.line}  ${f.what}  (${f.hint})`);
    } else if (now < was) better++;
  }
}
const total = (r) => Object.values(counts[r]).reduce((a, b) => a + b, 0);
console.log(`design check: ${RULES.map((r) => `${r} ${total(r)}`).join(' · ')}${better ? ` · ${better} below the baseline (run with --update to lower it)` : ''}`);
if (failed) { console.log(`${failed} place(s) drifted from the brand book.`); process.exit(1); }
