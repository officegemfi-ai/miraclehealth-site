#!/usr/bin/env node
// Builds the public library at miraclehealth.us/library from library/data:
//   catalog.json       every compound and blend in the community's library (from its database)
//   entries/<id>.json  the fact sheets, each claim checked against a source we opened
//   uses.json          the twelve goals and the uses members report on (the community's list)
//   baselines.json     how many improve anyway (on a placebo, or with time) by use, with sources
//                      (the community's shared/baselines.json; for the methodology page)
// Writes library/index.html, library/<id>/index.html (one per compound), library/data/index.json
// (what Sig reads to find and rank compounds), library/data/body/ (the body map, split for the
// screen beside Ask Sig: an index, and one small file per drawn compound), the Ask Sig page (ai/index.html), the
// pages scripts/build_pages.mjs makes (about, status, goals, compare, weekly, founders) and
// sitemap.xml. The pages are static; library/library.js adds search and filters, and fills in
// the live Community Signal from community.miraclehealth.us/snapshot.json; ai/ai.js is the chat.
// Run: node scripts/build_library.mjs   (--check fails if the committed pages are out of date)
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { roseSvg, flowSvg, takeoverSvg, sealSvg, LEVELS } from '../library/signalviz.js';
// Miracle Health's design kit, shared with the community app (copied from the community's
// shared/kit by its scripts/sync_kit.sh): the bar of the four places, the evidence meter, Sig
import { barHtml, PLACES, placeHref, meterHtml, sigSvg, askLink, askAboutCompound } from '../kit/kit.js';
// The body map (the kit's bodymap.js): how each compound works in the body, from body.json
import { bodyMapHtml } from '../kit/bodymap.js';
// The pages around the Library: about, the status tracker, goals, comparisons, the weekly email
// and the founding reporters (scripts/build_pages.mjs)
import { buildPages, signupForm, NEWSLETTER_ORIGIN, PAIRS, slugOf } from './build_pages.mjs';
import { buildGraph } from './graph.mjs';
import { SIGNAL_URL } from '../lib/dom.js';
// Sig's mark on Ask Sig: the eleven who gather what's known as one ring, and the Interpretation agent
// at its centre (lib/ring.js, shared with ai/ai.js)
import { CENTER, ringSvg, WHEEL } from '../lib/ring.js';
import { glyphSvg } from '../lib/glyphs.js';
import { printSvg } from '../lib/print.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'library');
const DATA = path.join(LIB, 'data');
const SITE = 'https://miraclehealth.us';
const COMMUNITY = 'https://community.miraclehealth.us';
// Sig's chat: the ask function in the community's live Supabase project
// (miracle-health-community, supabase/functions/ask). The address isn't secret.
const ASK_URL = 'https://nerfymdslkhopsomwriv.supabase.co/functions/v1/ask';
// The Community Signal's public read API, in the same project (supabase/functions/signal): the pages
// that show the Signal read it through lib/dom.js's getSignal, with snapshot.json as the fallback,
// so their policy lets them connect to both
const READS_SIGNAL = `${new URL(SIGNAL_URL).origin} ${COMMUNITY}`;
const CHECK = process.argv.includes('--check');

const catalog = JSON.parse(fs.readFileSync(path.join(DATA, 'catalog.json'), 'utf8'));
const uses = JSON.parse(fs.readFileSync(path.join(DATA, 'uses.json'), 'utf8'));
const baselines = JSON.parse(fs.readFileSync(path.join(DATA, 'baselines.json'), 'utf8'));
const BODY = JSON.parse(fs.readFileSync(path.join(DATA, 'body.json'), 'utf8'));
// A fact sheet shows how it works in the body once its compound is drawn (scripts/draw_body.md);
// until then it has no such section, rather than one saying it isn't drawn
const drawnHere = (id) => Object.hasOwn(BODY.compounds || {}, id) && Array.isArray(BODY.compounds[id]?.lines) && BODY.compounds[id].lines.length > 0;
const entries = new Map();
for (const f of fs.readdirSync(path.join(DATA, 'entries')).filter((x) => x.endsWith('.json')).sort()) {
  const e = JSON.parse(fs.readFileSync(path.join(DATA, 'entries', f), 'utf8'));
  entries.set(e.id, e);
}
const byId = new Map(catalog.map((c) => [c.id, c]));
for (const id of entries.keys()) if (!byId.has(id)) throw new Error(`entries/${id}.json has no compound in the catalog`);

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------
const e = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SINGULAR = { Peptides: 'Peptide', Hormones: 'Hormone', Supplements: 'Supplement', Medications: 'Medication', Blends: 'Blend' };
const FAMILIES = ['Peptides', 'Hormones', 'Supplements', 'Medications', 'Blends'];
const GRADE = {
  strong: ['Strong evidence', 'Several randomized trials in people, or an approved drug for this use'],
  moderate: ['Moderate evidence', 'At least one good randomized trial in people, or several smaller ones'],
  limited: ['Limited evidence', 'Small, short or uncontrolled studies in people'],
  preclinical: ['Animal and lab studies', 'Studied in animals or cells, not in people'],
  anecdotal: ['Anecdotal', 'User reports only'],
};
// An evidence pill: the four bars of the design kit's meter (the same one Sig and the
// community show) and the grade's name
const evPill = (grade, label = GRADE[grade]?.[0] || grade) => `<span class="ev ev-${e(grade)}">${meterHtml(grade, { bare: true })}${e(label)}</span>`;
const GRADE_ORDER = { strong: 0, moderate: 1, limited: 2, preclinical: 3, anecdotal: 4 };
const STATUS = {
  approved: 'FDA-approved', otc: 'Over the counter', supplement: 'Dietary supplement', compounded: 'Compounded by prescription',
  category2: 'FDA safety-risk list', investigational: 'In clinical trials', not_approved: 'Not approved', restricted: 'Restricted',
  unclear: 'Status unclear', under_review: 'Under FDA review',
};
const HOW_COMMON = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', theoretical: 'In theory', unknown: 'Not known' };
const GOAL_SHORT = {
  weight: 'Weight', muscle: 'Muscle', recovery: 'Recovery', energy: 'Energy', sleep: 'Sleep', cognition: 'Focus & mood',
  skin: 'Skin & hair', sexual: 'Sexual health', longevity: 'Aging', gut: 'Gut', immune: 'Immune', hormonal: 'Hormones',
};
const AXES = uses.goals.map((g) => ({ id: g.id, label: GOAL_SHORT[g.id] || g.label }));
const date = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const refs = (ns) => (ns || []).filter((n) => Number.isInteger(n)).map((n) => `<a class="ref" href="#src-${n}" aria-label="Source ${n}">${n}</a>`).join('');
const familyLine = (c) => `${SINGULAR[c.family] || c.family} · ${c.category}`;
const blendsWith = (id) => catalog.filter((c) => c.kind === 'blend' && (c.parts || []).includes(id));
// Product and ingredient brand names stay searchable but aren't printed as "Also called":
// the library doesn't promote brands or sellers. Class names that aren't really other names
// for the compound are left out the same way.
const NOT_SHOWN = new Set(['kyolic', 'ksm-66', 'sensoril', 'bacognize', 'synapsa', 'glucovantage', 'carnosyn', '5-loxin',
  'rejuvant', 'cognizin', 'meriva', 'longvida', 'bcm-95', 'lmnt', 'liquid i.v.', 'hydration mix', 'testofen', 'pharmagaba',
  'iodoral', 'suntheanine', 'magtein', 'relora', 'ovasitol', 'niagen', 'tru niagen', 'levagen', 'metamucil', 'florastor',
  'affron', 'primavie', 'spermidinelife', 'avmacol', 'teacrine', 'lj100', 'mitopure', 'timeline', 'pepzingi', 'senolytic',
  'niacin flush', 'protein powder']);
const shownAliases = (c) => (c.aliases || []).filter((a) => !NOT_SHOWN.has(a.toLowerCase()));
// Not an approved medicine: blood-marker lists describe what a trial or clinician would check. With
// 'unclear' (PDA: not approved, and not on any compounding list); without 'restricted' (NAC, an
// approved drug) or 'compounded' (some are compounded forms of approved drugs, such as low-dose naltrexone)
const UNAPPROVED = new Set(['investigational', 'not_approved', 'category2', 'under_review', 'unclear']);

// ---------------------------------------------------------------------------
// The page around everything
// ---------------------------------------------------------------------------
// Every page asks for the stylesheets and script by a version made from their contents, so a
// browser or GitHub's cache never pairs a new page with an old stylesheet (GitHub Pages caches
// files for 10 minutes)
const version = (...files) => createHash('sha256').update(files.map((f) => fs.readFileSync(path.join(ROOT, f))).join('\n')).digest('hex').slice(0, 10);
// Scripts import the kit, the Signal's drawings and the site's own helpers (lib/) by their
// version too: the build writes it into their import lines, so a new script never runs with an
// old copy of any of them (or of one a script loads later, with import()). The shared scripts
// import nothing themselves, so their versions come first.
const SHARED = ['kit/kit.js', 'kit/bodymap.js', 'library/signalviz.js', 'lib/dom.js', 'lib/pack.js', 'lib/graph.js', 'lib/ring.js', 'lib/glyphs.js', 'lib/print.js', 'lib/cmdk.js', 'lib/how.js', 'lib/sighero.js', 'lib/ring3d.js'].map((f) => [f, version(f)]);
const IMPORTERS = ['ai/ai.js', 'ai/packet.js', 'ai/plan.js', 'ai/screen.js', 'library/library.js', 'my/my.js', 'home.js', 'pages/pages.js', 'lib/os.js'];
for (const f of IMPORTERS) {
  const file = path.join(ROOT, f);
  if (!fs.existsSync(file)) continue;
  const was = fs.readFileSync(file, 'utf8');
  const now = SHARED.reduce((text, [shared, v]) =>
    text.replace(new RegExp(`((?:from |import\\()'/${shared.replace(/\./g, '\\.')})(?:\\?v=[0-9a-f]+)?'`, 'g'), `$1?v=${v}'`), was);
  if (now === was) continue;
  if (CHECK) { console.error(`out of date: ${f} imports an older shared script (run node scripts/build_library.mjs)`); process.exit(1); }
  fs.writeFileSync(file, now);
}
// A share image by its version too, so a new picture isn't hidden behind an old one in a share preview's cache
const ogVersion = (p) => (fs.existsSync(path.join(ROOT, p)) ? `?v=${version(p.replace(/^\//, ''))}` : '');
const V = {
  kitCss: version('kit/kit.css'),
  css: version('styles.css'), lib: version('library/library.css'), js: version('library/library.js', 'library/signalviz.js'),
  aiCss: version('ai/ai.css'), aiJs: version('ai/ai.js'),
  pkCss: version('ai/packet.css'), pkJs: version('ai/packet.js'), qr: version('ai/vendor/qrcode.js'),
  plCss: version('ai/plan.css'), plJs: version('ai/plan.js'),
  scCss: version('ai/screen.css'), scJs: version('ai/screen.js'), tmCss: version('ai/term.css'),
  myCss: version('my/my.css'), myJs: version('my/my.js'), os: version('lib/os.js'),
  home: version('home.js'), homeCss: version('home.css'),
  pgCss: version('pages/pages.css'), pgJs: version('pages/pages.js', 'library/signalviz.js'),
};


// ---------------------------------------------------------------------------
// The window every page opens in
// ---------------------------------------------------------------------------
// Every page opens beside the side panel (the Signal and the four places with what's in each, what's
// in this window, the rest of the site, joining, the legal), under a plain top bar: search (⌘K goes
// anywhere), Ask Sig and joining. Then the page and its foot (the weekly email, the links, the
// disclaimer). The panel is never taken away: it starts closed, and the top bar's menu button slides it
// in over the page (lib/os.js).
const ICO = {
  search: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4.2-4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  // the Signal's own mark: its spectrum, four bars in the community's blue
  signal: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 13.5v-4M6.5 13.5v-9M10 13.5v-6.5M13.5 13.5v-3" fill="none" stroke="#3D8BFF" stroke-width="1.8" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  fold: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const libDateOf = () => date([...entries.values()].map((f) => f.checked || '').concat(BODY.updated || '', GUIDES.map((g) => g.checked)).filter(Boolean).sort().pop());
const PLACE_ICON = { library: () => glyphSvg('evidence', { size: 16 }), ai: () => ringSvg(16), community: () => glyphSvg('community', { size: 16 }), my: () => glyphSvg('builder', { size: 16 }) };
const PLACE_META = { library: () => `${entries.size} sheets`, ai: () => `${AGENTS.length} agents`, community: () => '<i class="op-live" aria-hidden="true"></i>live', my: () => 'this device' };
// The Signal leads the places (page 15 of the design canvas): the community's live score, its spectrum on
// the front page; the front page writes in how many Signals are live
const SIGNAL_PLACE = () => `<a href="/#signal"><span class="op-g" aria-hidden="true">${ICO.signal}</span><span class="op-n">The Signal</span><span class="op-k"><i class="op-live" aria-hidden="true"></i><span class="op-signal-n"></span>live</span></a>`;
const MORE = [['/#how', 'How it works'], ['/method/', 'How the numbers are made'], ['/status/', 'FDA status tracker'],
  ['/compare/', 'Compare'], ['/goals/', 'By goal'], ['/weekly/', 'The weekly email'], ['/founders/', 'Founding reporters'], ['/story/', 'The story'], ['/about/', 'About']];
function osSide(current, ctx = '', url = '') {
  return `<aside class="os-side" id="os-side" aria-label="Miracle Health">
  <div class="os-head"><a class="os-logo" href="/"><img src="/logo.webp" alt="Miracle Health" width="80" height="28"></a><button class="os-fold" id="os-fold" type="button" aria-label="Close the menu" aria-controls="os-side" aria-expanded="false">${ICO.fold}</button></div>
  <a class="os-ask" href="/sig/">${ringSvg(16)}<span>Ask Sig a question</span></a>
  <nav class="os-places" aria-label="Main">${SIGNAL_PLACE()}${PLACES.map(([k, label]) => `<a href="${k === 'ai' ? '/sig/' : placeHref(k, { site: '' })}"${k === current ? ' aria-current="page"' : ''}><span class="op-g" aria-hidden="true">${PLACE_ICON[k] ? PLACE_ICON[k]() : ''}</span><span class="op-n">${label}</span><span class="op-k">${PLACE_META[k] ? PLACE_META[k]() : ''}</span></a>`).join('')}</nav>
  ${ctx ? `<div class="os-ctx">${ctx}</div>` : ''}
  <nav class="os-more" aria-label="More of the site"><p class="os-k">more</p>${MORE.map(([href, label]) => `<a href="${href}"${href === url ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
  <div class="os-foot">
    <div class="os-acct"><a class="os-signin" href="${COMMUNITY}/">Sign in</a><a class="btn line sm" href="${COMMUNITY}/">Join</a></div>
    <p class="os-legal"><a href="/privacy">Privacy</a><span aria-hidden="true"> · </span><a href="/terms">Terms</a><span aria-hidden="true"> · </span><span>© 2026</span></p>
  </div>
</aside>`;
}
function osOpen({ current = '', url = '/', side = '' }) {
  return `<div class="os" id="os">
${osSide(current, side, url)}
<div class="os-scrim" id="os-scrim" hidden></div>
<div class="os-main">
<div class="win" data-win="${e(current || 'site')}">
  <header class="os-top">
    <button class="os-menu" id="os-menu" type="button" aria-label="Open the menu" aria-controls="os-side" aria-expanded="false">${ICO.menu}</button>
    <a class="os-top-logo" href="/"><img src="/logo.webp" alt="Miracle Health" width="80" height="28"></a>
    <button class="os-search" type="button" data-cmdk aria-label="Search the Library and the site (⌘K)">${ICO.search}<span class="os-search-t">Search the Library…</span><kbd class="kbd-k" aria-hidden="true">⌘K</kbd></button>
    <a class="os-top-sig" href="/sig/"><span aria-hidden="true">${ringSvg(16)}</span><span class="os-top-sig-t">Ask Sig</span></a>
    <a class="btn bone sm os-top-join" href="${COMMUNITY}/">Join</a>
  </header>`;
}
function osClose({ url = '/' }) {
  return `  <footer class="foot win-foot">
    <div class="wrap foot-in">
    ${url.startsWith('/weekly/') ? '' : footNews()}
    <div class="foot-row">
      ${footLinks()}
    </div>
    <div class="foot-row">
      <a class="foot-logo" href="/"><img src="/logo.webp" alt="Miracle Health" width="69" height="24"></a>
      <p>Experiences and published evidence, not medical advice. Talk to your doctor before you start, stop or change anything. In a crisis, call or text 988 (US).</p>
      <p class="copy">© 2026 Miracle Health</p>
    </div>
    </div>
  </footer>
</div>
</div>
</div>`;
}
const footLinks = () => `<nav class="foot-links" aria-label="Site">${PLACES.map(([k, label]) => `<a href="${placeHref(k, { site: '' })}">${label}</a>`).join('')}<a href="/#signal">The Signal</a><a href="/status/">FDA status tracker</a><a href="/compare/">Compare</a><a href="/goals/">By goal</a><a href="/weekly/">The weekly email</a><a href="/founders/">Founding reporters</a><a href="/method/">How the numbers are made</a><a href="/story/">The story</a><a href="/about/">About</a><a href="/#rules">House rules</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a class="mail" href="mailto:hello@miraclehealth.us">hello@miraclehealth.us</a></nav>`;
// The weekly email's sign-up at the foot of every page but the weekly email's own
const footNews = () => `<div class="foot-news">
      <p><b>The Signal, weekly.</b> What changed, new studies and FDA news. One email a week.</p>
      ${signupForm(e, { source: 'footer', id: 'foot-email' })}
    </div>`;
// The hand-written pages (the front page, privacy, terms, 404) open in the same window as every
// built page: the build writes it between their markers (the first time, in place of the site's
// old bar, menu and footer), and their policy lets the sign-up form send (and come back)
function stampShell(html, file, { current = '', home = false, url = '/' } = {}) {
  const open = /<!-- os:open -->[\s\S]*?<!-- \/os:open -->/;
  const close = /<!-- os:close -->[\s\S]*?<!-- \/os:close -->/;
  const oldTop = /<header class="top">[\s\S]*?<\/header>\s*<nav class="menu-panel"[\s\S]*?<\/nav>/;
  const oldFoot = /<footer class="foot">[\s\S]*?<\/footer>/;
  if (!(open.test(html) || oldTop.test(html)) || !(close.test(html) || oldFoot.test(html))) throw new Error(`${file} has no window (or old bar and footer) to update`);
  if (!/href="\/?styles\.css(\?v=[0-9a-f]+)?"/.test(html)) throw new Error(`${file} has no styles.css link`);
  const o = `<!-- os:open -->\n${osOpen({ current, url })}\n<!-- /os:open -->`;
  const c = `<!-- os:close -->\n${osClose({ url })}\n<!-- /os:close -->`;
  let out = open.test(html) ? html.replace(open, () => o) : html.replace(oldTop, () => o);
  out = close.test(out) ? out.replace(close, () => c) : out.replace(oldFoot, () => c);
  // the window's script, by its version
  out = out.replace(/\n<script type="module" src="\/lib\/os\.js(?:\?v=[0-9a-f]+)?"><\/script>/, '');
  out = out.replace('</head>', `<script type="module" src="/lib/os.js?v=${V.os}"></script>\n</head>`);
  return out
    // The sign-up goes to the newsletter function, which sends the browser back here: both allowed
    .replace(/form-action ([^;"]*)/, `form-action 'self' ${NEWSLETTER_ORIGIN}`)
    // A page that reads the community's numbers (the front page) may read them from the Signal API
    .replace(/connect-src 'self'[^;"]*https:\/\/community\.miraclehealth\.us[^;"]*/, `connect-src 'self' ${READS_SIGNAL}`)
    .replace(/<link rel="stylesheet" href="\/?kit\/kit\.css(?:\?v=[0-9a-f]+)?">\n/, '')
    .replace(/<link rel="stylesheet" href="(\/?)styles\.css(?:\?v=[0-9a-f]+)?">/, `<link rel="stylesheet" href="/kit/kit.css?v=${V.kitCss}">\n<link rel="stylesheet" href="$1styles.css?v=${V.css}">`);
}

function page({
  title, description, url, body, current = 'library', preload = '', bodyClass = 'lib',
  styles = [`/library/library.css?v=${V.lib}`], script = `/library/library.js?v=${V.js}`, scripts = [script], connect = READS_SIGNAL, head = '',
  ogImage = '/og.jpg', app = false, side = '',
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover${app ? ', interactive-widget=resizes-content' : ''}">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#17171A">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; connect-src 'self' ${connect};${app ? " manifest-src 'self';" : ''} base-uri 'none'; form-action 'self' ${NEWSLETTER_ORIGIN}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Miracle Health">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:image" content="${SITE}${ogImage}${ogVersion(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>${preload ? `\n${preload}` : ''}${head ? `\n${head}` : ''}
<link rel="stylesheet" href="/kit/kit.css?v=${V.kitCss}">
<link rel="stylesheet" href="/styles.css?v=${V.css}">
${styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n')}
${(app ? scripts : [...scripts, `/lib/os.js?v=${V.os}`]).map((src) => `<script type="module" src="${src}"></script>`).join('\n')}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${app ? `
${body}
</body>
</html>
` : `
${osOpen({ current, url, side })}
<main id="main" class="win-body">
${body}
</main>
${osClose({ url })}
</body>
</html>
`}`;
}

// ---------------------------------------------------------------------------
// The library's front page
// ---------------------------------------------------------------------------
function card(c) {
  const f = entries.get(c.id);
  const goals = f ? Object.entries(f.goals).filter(([, v]) => v >= 0.75).map(([k]) => k) : [];
  const parts = (c.parts || []).map((p) => byId.get(p)?.name).filter(Boolean);
  const text = [c.name, ...(c.aliases || []), c.category, c.family, ...parts].join(' ').toLowerCase();
  const grade = f?.evidence?.grade;
  const sum = f ? f.summary : c.kind === 'blend' ? `A blend of ${parts.join(' and ')}.`
    : shownAliases(c).length ? `Also called ${shownAliases(c).slice(0, 4).join(', ')}.` : `${SINGULAR[c.family] || c.family} for ${c.category.toLowerCase()}.`;
  return `<a class="lib-card${f ? '' : ' pending'}" href="/library/${c.id}/" data-id="${c.id}" data-family="${e(c.family)}" data-goals="${goals.join(' ')}" data-ev="${grade || ''}" data-checked="${f ? 1 : 0}" data-text="${e(text)}">
    <span class="lc-top"><span class="lc-fam">${e(familyLine(c))}</span><span class="lc-sig" data-sig="${c.id}" hidden></span></span>
    <span class="lc-name">${e(c.name)}</span>
    <span class="lc-sum">${e(sum)}</span>
    <span class="lc-badges">${f ? `${evPill(grade)}<span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.label)}</span>` : c.kind === 'blend' ? '<span class="st st-blend">Blend</span>' : '<span class="ev ev-pending">Being checked</span>'}</span>
  </a>`;
}

function indexPage() {
  // Fact sheets first, then the rest, each A to Z (the page's default order; the script re-sorts)
  const sorted = [...catalog].sort((a, b) => (entries.has(b.id) - entries.has(a.id)) || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  const checked = catalog.filter((c) => entries.has(c.id)).length;
  const counts = Object.fromEntries(FAMILIES.map((f) => [f, catalog.filter((c) => c.family === f).length]));
  const flowData = { sources: [{ name: 'Reddit', n: 0 }, { name: 'YouTube', n: 0 }, { name: 'Podcasts', n: 0 }, { name: 'Forums & reviews', n: 0 }], share: 0, reports: 0, sames: 0, signals: 0, levels: {}, weight: 50 };
  const body = `<section class="lib-hero">
  <div class="wrap lib-hero-in">
    <div>
      <p class="kick lime live"><i aria-hidden="true"></i>The Library · live community data</p>
      <h1>Look it up<br> before you take it.</h1>
      <p class="lede">${catalog.length} peptides, hormones, supplements and medications. For each one: what it is, what the studies show, the risks and the blood tests to watch, checked against FDA labels, NIH fact sheets and published trials. Next to it, the Community Signal: how it went for people who took it.</p>
      <p class="lib-guides">Guide: <a href="/library/lab-reports/">How to read a lab report (certificate of analysis)</a></p>
    </div>
    <dl class="lib-stats">
      <div><dt>In the Library</dt><dd>${catalog.length}</dd></div>
      <div><dt>Fully checked</dt><dd>${checked}</dd></div>
      <div><dt>With a Signal</dt><dd data-live="signals">–</dd></div>
      <div><dt>Member reports</dt><dd data-live="reports">–</dd></div>
    </dl>
  </div>
</section>

<section class="wrap lib-moves" data-live="moves" aria-label="What moved this week" hidden>
  <p class="moves-k"><i aria-hidden="true"></i>What moved this week</p>
  <div class="moves-track"></div>
  <p class="moves-focus" hidden></p>
</section>

<section class="wrap lib-tools" aria-label="Find a compound">
  <div class="lib-search">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    <input type="search" id="q" placeholder="Search by name, brand or nickname" aria-label="Search the library" autocomplete="off">
  </div>
  <div class="lib-chips" role="group" aria-label="Family">
    <button type="button" data-family="" aria-pressed="true">All <span>${catalog.length}</span></button>
    ${FAMILIES.map((f) => `<button type="button" data-family="${f}" aria-pressed="false">${f} <span>${counts[f]}</span></button>`).join('\n    ')}
  </div>
  <div class="lib-filters">
    <label><span>Goal</span><select id="goal"><option value="">Any goal</option>${uses.goals.map((g) => `<option value="${g.id}">${e(g.label)}</option>`).join('')}</select></label>
    <label><span>Evidence</span><select id="ev"><option value="">Any evidence</option>${Object.entries(GRADE).filter(([k]) => k !== 'anecdotal').map(([k, [l]]) => `<option value="${k}">${e(l)}</option>`).join('')}</select></label>
    <label><span>Sort</span><select id="sort"><option value="checked">Fully checked first</option><option value="name">A to Z</option><option value="signal">Best rated by people</option><option value="evidence">Strongest evidence</option></select></label>
    <p class="lib-count" id="count" aria-live="polite">${catalog.length} compounds</p>
  </div>
</section>

<section class="wrap lib-grid" id="grid" aria-label="Compounds">
  ${sorted.map(card).join('\n  ')}
  <p class="lib-empty" id="empty" hidden>Nothing matches. Try a brand name or a nickname, or <a href="${COMMUNITY}/">suggest it to the community</a>.</p>
</section>

<section class="band ink-band lib-explain" id="two-kinds" aria-labelledby="two-h">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="kick lime">Two kinds of evidence</p>
        <h2 id="two-h">What studies show. What people report.</h2>
      </div>
      <p class="sec-note">Side by side on every page, never mixed together.</p>
    </div>
    <div class="explain-grid">
      <div class="glass deep">
        <p class="mono evid">// The fact sheet</p>
        <h3>Checked against the sources</h3>
        <p>Every claim links to the FDA label, NIH fact sheet, trial or review it came from. Each benefit says what kind of evidence backs it, from randomized trials in people to studies in rats. No doses, no sellers.</p>
        <ul class="grade-key">${Object.entries(GRADE).filter(([k]) => k !== 'anecdotal').map(([k, [l, d]]) => `<li>${evPill(k, l)}<span>${e(d)}</span></li>`).join('')}</ul>
      </div>
      <div class="glass deep">
        <p class="mono lime">// The Community Signal</p>
        <h3>A certificate of human experience</h3>
        <p>Each number starts from what people say on public forums and is rewritten, report by report, by members who took it themselves. As first-hand reports take over, a Signal earns its level:</p>
        <ul class="level-key">${LEVELS.map((l) => `<li>${sealSvg(l.key, 26)}<span><b>${e(l.name)}</b> ${e(l.rule)}</span></li>`).join('')}</ul>
      </div>
    </div>
    <div class="glass deep flow-panel" data-live="flow">
      <div class="gc-head"><span>How the Signal is made, live</span><span class="dim" data-live="updated">Updated hourly</span></div>
      <div class="viz-wide">${flowSvg(flowData)}</div>
      <div class="viz-compact">${flowSvg(flowData, { compact: true })}</div>
    </div>
  </div>
</section>`;
  return page({
    title: 'The Library · Peptides, hormones and supplements, checked · Miracle Health',
    description: `${catalog.length} peptides, hormones, supplements and medications: what each one is, what the studies show, the risks and the blood tests to watch, checked against primary sources, next to how it went for people who took it.`,
    url: '/library/',
    body,
    // the Library's folders in the side panel: each family, with how many it holds and how many
    // have a sheet; the filter opens on it
    side: `<nav class="le-tree" aria-label="The Library's families">
    <p class="lt-root"><a href="/library/" aria-current="page">library/</a><span>${catalog.length}</span></p>
    ${FAMILIES.map((fam) => `<a class="lt-dir" href="/library/?family=${encodeURIComponent(fam)}"><span aria-hidden="true">▸ </span>${e(fam.toLowerCase())}/<span class="lt-n">${catalog.filter((x) => x.family === fam).length}</span></a>`).join('\n    ')}
    <p class="lt-more">${entries.size} have a full fact sheet; the rest are being checked.</p>
  </nav>`,
  });
}

// ---------------------------------------------------------------------------
// One compound
// ---------------------------------------------------------------------------
function list(items, cls = '') {
  return items && items.length ? `<ul class="${cls}">${items.map((x) => `<li>${e(x)}</li>`).join('')}</ul>` : '';
}

// A section of a fact sheet signed, on the right of its heading, by the agent of Sig's who reads
// that part of it for an answer: the Evidence librarian the evidence, the Safety agent the risks
// and where it stands, the Markers agent the blood tests, the Mechanism agent the body map
const SIGNER = { evidence: 'evidence librarian', safety: 'safety agent', markers: 'markers agent', mechanism: 'mechanism agent', community: 'the community' };
const by = (...as) => `<span class="h-by" aria-hidden="true">${as.map((a) => `<b data-agent="${a}">${SIGNER[a]}</b>`).join(' · ')}</span>`;

function factSheet(c, f) {
  const g = GRADE[f.evidence.grade] || [f.evidence.grade, ''];
  const studies = (f.studies || []).map((s) => {
    const src = (f.sources || []).find((x) => x.n === s.source);
    return `<li class="study">
        <p class="st-meta"><span class="pill">${e(s.type)}</span><span>${e(s.year)}</span><span>${e(s.people)}</span></p>
        <p class="st-title">${src ? `<a href="${e(src.url)}" rel="noopener" target="_blank">${e(s.title)}</a>` : e(s.title)}</p>
        <p>${e(s.finding)} ${refs([s.source])}</p>
      </li>`;
  }).join('');
  const labs = f.labs || {};
  return `<section class="le-sec" id="what">
      <h2>What it is${by('evidence')}</h2>
      <p class="big">${e(f.what_it_is)}</p>
      <div class="ev-box">${evPill(f.evidence.grade, g[0])}<p>${e(f.evidence.why)}</p></div>
    </section>

${drawnHere(c.id) ? `    <section class="le-sec" id="body">
      <h2>Where it acts in the body${by('mechanism')}</h2>
      ${bodyMapHtml({ items: [{ id: c.id, name: c.name, entry: BODY.compounds[c.id] }], places: BODY.places, markers: BODY.markers, sourceHref: (id, n) => `#src-${n}`, id: 'body-map' })}
    </section>
` : ''}
    <section class="le-sec" id="benefits">
      <h2>What it may do${by('evidence')}</h2>
      <ul class="claims" data-agent="evidence">${(f.benefits || []).map((b) => `<li>${evPill(b.evidence)}<p>${e(b.claim)} ${refs(b.sources)}</p></li>`).join('')}</ul>
    </section>

    <section class="le-sec" id="risks">
      <h2>Risks and side effects${by('safety')}</h2>
      <ul class="claims risks" data-agent="safety">${(f.risks || []).map((r) => `<li><span class="hc hc-${r.how_common}">${e(HOW_COMMON[r.how_common] || r.how_common)}</span><p>${e(r.risk)} ${refs(r.sources)}</p></li>`).join('')}</ul>
      <div class="two" data-agent="safety">
        <div><h3>Who should skip it, or ask a doctor first</h3>${list(f.avoid_if, 'dots')}</div>
        <div><h3>What it can clash with</h3>${list(f.interactions, 'dots')}</div>
      </div>
    </section>

    <section class="le-sec" id="labs">
      <h2>Blood tests to watch${by('markers')}</h2>
      ${UNAPPROVED.has(f.status_us.key) && ((labs.before || []).length || (labs.during || []).length) ? '<p class="lab-note">Not an approved medicine. These are checks a doctor or a clinical trial would use, not a plan for taking it on your own.</p>' : ''}
      <div class="labs" data-agent="markers">
        <div class="lab-col"><p class="mono">Before starting</p>${(labs.before || []).length ? list(labs.before, 'marks') : '<p class="muted">None routinely needed.</p>'}</div>
        <div class="lab-col"><p class="mono">While taking it</p>${(labs.during || []).length ? list(labs.during, 'marks') : '<p class="muted">None routinely needed.</p>'}</div>
      </div>
      <p class="lab-why">${e(labs.why || '')}</p>
    </section>

    ${studies ? `<section class="le-sec" id="studies">
      <h2>The main studies${by('evidence')}</h2>
      <ol class="studies" data-agent="evidence">${studies}</ol>
    </section>` : ''}

    <section class="le-sec" id="ask">
      <h2>Questions to ask your doctor</h2>
      ${list(f.ask_your_clinician, 'asks')}
    </section>

    <section class="le-sec" id="status">
      <h2>Where it stands in the US${by('safety')}</h2>
      <p><span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span> <b>${e(f.status_us.label)}.</b> ${e(f.status_us.note)} ${refs(f.status_us.sources)}</p>
      ${UNAPPROVED.has(f.status_us.key) ? '<p class="guide-link">Products sold outside approved medicines vary in what they contain. If you already have one, here’s <a href="/library/lab-reports/">how to read its lab report</a>, and what even a good one can’t tell you.</p>' : ''}
    </section>

    <section class="le-sec" id="sources">
      <h2>Sources${by('evidence')}</h2>
      <ol class="sources">${(f.sources || []).map((s) => `<li id="src-${s.n}"><a href="${e(s.url)}" rel="noopener" target="_blank">${e(s.title)}</a><span>${e(s.publisher)}${s.year ? `, ${e(s.year)}` : ''}</span></li>`).join('')}</ol>
      <p class="checked">Fact-checked against these sources on ${date(f.checked)}.${reviewedBy(f) ? ` ${ReviewWords(f)}.` : ''} Spotted something wrong? <a href="mailto:hello@miraclehealth.us?subject=${encodeURIComponent(`Library: ${c.name}`)}">Tell us</a>.</p>
    </section>`;
}

// reviewed: { by, role, date } once a clinician or pharmacist has signed a fact sheet off
const reviewedBy = (f) => (f?.reviewed?.by && f?.reviewed?.date ? `reviewed by ${e(f.reviewed.by)}${f.reviewed.role ? `, ${e(f.reviewed.role)}` : ''}, ${date(f.reviewed.date)}` : '');
// No reviewer, nothing said: a sheet names a clinician only once one has reviewed it
const reviewWords = (f) => reviewedBy(f);
const ReviewWords = (f) => { const t = reviewWords(f); return t.charAt(0).toUpperCase() + t.slice(1); };

function pendingSheet(c) {
  const parts = (c.parts || []).map((p) => byId.get(p)).filter(Boolean);
  if (c.kind === 'blend') {
    return `<section class="le-sec" id="what">
      <h2>What’s in it</h2>
      <p class="big">${e(c.name)} is a pre-mixed blend of ${parts.map((p) => e(p.name)).join(' and ')}. Each part has its own fact sheet, and the blend has its own Community Signal, from reports of the blend itself.</p>
      <div class="parts">${parts.map((p) => {
        const pf = entries.get(p.id);
        return `<a class="part" href="/library/${p.id}/"><span class="lc-fam">${e(familyLine(p))}</span><b>${e(p.name)}</b>${pf ? `<span>${e(pf.summary)}</span><span class="lc-badges">${evPill(pf.evidence.grade)}<span class="st st-${pf.status_us.key}">${e(STATUS[pf.status_us.key])}</span></span>` : '<span class="muted">Fact sheet in progress.</span>'}</a>`;
      }).join('')}</div>
    </section>`;
  }
  return `<section class="le-sec pending-box" id="what">
      <h2>Fact sheet in progress</h2>
      <p class="big">We’re checking ${e(c.name)} against FDA labels, NIH fact sheets and published studies. Every claim on a finished fact sheet links to the source it came from, so it takes a little while. Until then, here’s what members report.</p>
    </section>`;
}

// Where "Share how it went" goes: the community's new-post page with the compound picked
const shareLink = (id) => `${COMMUNITY}/#/new?c=${encodeURIComponent(id)}`;
// The bottom line, as the front page's real example reads: the fact sheet's own verdict on the
// evidence and the US status, then use by use what the studies show, what people report and how
// many get better on a placebo (filled in by library.js from the community's evidence file). The
// findings' full words, caveats included, travel with the page, because the evidence file keeps
// only a long finding's first clause.
function bottomLine(c, f) {
  const claims = (f.benefits || []).map((b) => {
    const s = (f.sources || []).find((x) => x.n === (b.sources || [])[0]);
    return { c: b.claim, s: s ? { t: s.title, p: s.publisher, y: s.year, u: s.url } : null };
  });
  return `<div class="wrap le-bl-wrap">
    <article class="vs le-bl" id="voices" data-live="voices" data-claims="${e(JSON.stringify(claims))}" aria-labelledby="bl-h">
      <header class="bl-head">
        <h2 class="bl-k" id="bl-h">The bottom line${by('evidence', 'community')}</h2>
        <p class="bl-why">${e(f.evidence.why)}</p>
        <p class="bl-tags">${evPill(f.evidence.grade)}<span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span><span class="bl-status">${e(f.status_us.label)}</span></p>
      </header>
      <div class="bl-uses" hidden>
        <div class="vs-cols" aria-hidden="true"><span>Taken for</span><span>What the studies show</span><span class="c-rep">What people report</span><span>Got better on a placebo</span></div>
        <div class="vs-rows"></div>
      </div>
      <footer class="vs-foot">
        <p>What people report isn’t proof, and many problems ease on their own. Use this to decide what to ask your doctor, not what to take.</p>
        <div class="vs-act"><a class="btn line" href="${shareLink(c.id)}">Share how it went</a><a class="bl-how" href="/method/">How these are made</a></div>
      </footer>
    </article>
  </div>`;
}

function entryPage(c) {
  const f = entries.get(c.id);
  const parentBlends = blendsWith(c.id);
  // A blend's petals come from what its parts are studied for
  const partSheets = (c.parts || []).map((p) => entries.get(p)).filter(Boolean);
  const studied = f ? f.goals : partSheets.length
    ? Object.fromEntries(AXES.map((a) => [a.id, Math.max(...partSheets.map((p) => p.goals?.[a.id] || 0))])) : null;
  const radar = roseSvg({ axes: AXES, layers: [{ values: studied || {}, cls: 'studied' }, { values: {}, cls: 'forums' }, { values: {}, cls: 'members' }] },
    { title: `What ${c.name} is used and studied for` });
  const studiedLabel = f ? 'What studies look at' : 'What its parts are studied for';
  const mainGoals = studied ? Object.entries(studied).filter(([, v]) => v >= 0.75).sort((a, b) => b[1] - a[1]).map(([k]) => uses.goals.find((g) => g.id === k)?.label || k) : [];
  const facts = f ? [
    ['US status', `<span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span> ${e(f.status_us.label)}`],
    ['Evidence', evPill(f.evidence.grade)],
    mainGoals.length ? ['Mostly used for', e(mainGoals.join(', '))] : null,
    ['Blood tests', (f.labs?.before || []).length || (f.labs?.during || []).length
      ? `<a href="#labs">${[(f.labs.before || []).length ? `${f.labs.before.length} before starting` : null, (f.labs.during || []).length ? `${f.labs.during.length} while taking it` : null].filter(Boolean).join(' · ')}</a>`
      : 'None routinely needed'],
    ['Checked', `<span class="dd-log">${date(f.checked)} against <a href="#sources">${(f.sources || []).length} sources</a></span>`],
  ].filter(Boolean) : [];
  const toc = f ? [['voices', 'The bottom line'], ['what', 'What it is'], ...(drawnHere(c.id) ? [['body', 'In the body']] : []), ['benefits', 'What it may do'], ['risks', 'Risks'], ['labs', 'Blood tests'], ...(f.studies?.length ? [['studies', 'The main studies']] : []), ['ask', 'Ask your doctor'], ['status', 'US status'], ['sources', 'Sources']] : [];
  const desc = f ? `${f.summary} Evidence, risks, blood tests to watch and sources, next to what people who took it report.` : `${c.name}: what members report, and its fact sheet as soon as it’s checked against primary sources.`;
  // The Library beside the sheet: the family's sheets as files in the side panel (the other families
  // as folders that open the Library on them)
  const dir = (fam) => fam.toLowerCase();
  const listed = (x) => entries.has(x.id) || x.kind === 'blend';
  const famFiles = catalog.filter((x) => x.family === c.family && (listed(x) || x.id === c.id)).sort((a, b) => a.id.localeCompare(b.id));
  const famCount = (fam) => catalog.filter((x) => x.family === fam && listed(x)).length;
  const tree = `<nav class="le-tree" aria-label="Fact sheets in the Library">
    <p class="lt-root"><a href="/library/">library/</a><span>${entries.size} sheets</span></p>
    ${FAMILIES.map((fam) => (fam === c.family
      ? `<p class="lt-dir on"><span aria-hidden="true">▾ </span>${e(dir(fam))}/<span class="lt-n">${famCount(fam)}</span></p>
    <ul class="lt-files">${famFiles.map((x) => `<li><a href="/library/${x.id}/"${x.id === c.id ? ' aria-current="page"' : ''}>${e(entries.has(x.id) ? `${x.id}.md` : x.id)}</a></li>`).join('')}</ul>`
      : `<a class="lt-dir" href="/library/?family=${encodeURIComponent(fam)}"><span aria-hidden="true">▸ </span>${e(dir(fam))}/<span class="lt-n">${famCount(fam)}</span></a>`)).join('\n    ')}
    <p class="lt-more">${catalog.filter((x) => !listed(x)).length} more compounds are listed and waiting for their sheets.</p>
  </nav>`;
  // the sheet's print: its fact sheet as one mark (lib/print.js), big beside the name
  const print = f && BODY.compounds[c.id] ? `<figure class="le-print" aria-labelledby="le-print-cap">
      ${printSvg({ id: c.id, name: c.name, family: c.family, grade: f.evidence.grade, lines: BODY.compounds[c.id].lines || [], places: BODY.places.map((x) => x.at) }, { size: 232 })}
      <figcaption id="le-print-cap"><b>${e(c.name)}’s print.</b> Each spoke is a place in the body its sheet names, each bead a line there: <span class="pk pk-is">acts</span> <span class="pk pk-up">raises</span> <span class="pk pk-down">lowers</span> <span class="pk pk-block">blocks</span> <span class="pk pk-watch">blood test</span> <span class="pk pk-warn">caution</span>. The rings in the middle are its evidence; the blue arc, its Signal. <a href="/story/#prints">How prints work</a></figcaption>
    </figure>` : '';
  const body = `<div class="lib-entry" data-id="${c.id}" data-name="${e(c.name)}">
<section class="le-hero${print ? ' has-print' : ''}">
  <div class="wrap">
    ${print}
    <p class="kick lime">${e(familyLine(c))}</p>
    <h1>${e(c.name)}.</h1>
    ${shownAliases(c).length ? `<p class="aka">Also called ${shownAliases(c).map(e).join(', ')}</p>` : ''}
    ${f ? `<p class="lede">${e(f.summary)}</p>` : ''}
    <div class="le-badges">
      ${f ? `<span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span>
      ${evPill(f.evidence.grade)}
      <span class="check${reviewedBy(f) ? ' reviewed' : ''}">Fact-checked ${date(f.checked)}${reviewedBy(f) ? ` · ${reviewWords(f)}` : ''}</span>` : c.kind === 'blend' ? '<span class="st st-blend">Blend</span>' : '<span class="ev ev-pending">Fact sheet in progress</span>'}
    </div>
    <div class="le-actions">
      <a class="btn lime sm" href="${e(askLink(askAboutCompound(c.name), { site: '' }))}">Ask Sig about ${e(c.name)}</a>
      <a class="btn line sm" href="/sig/" data-with-stack="${c.id}" hidden>Check it against what I take</a>
      <a class="btn line sm" href="${shareLink(c.id)}">Share how it went</a>
      <a class="btn line sm" href="${COMMUNITY}/#/s/${encodeURIComponent(c.id)}">See what members report</a>
    </div>
  </div>
</section>

<section class="le-glance" aria-label="At a glance">
  ${f ? bottomLine(c, f) : ''}
  <div class="wrap le-glance-in">
    <div class="le-left">
      <div class="glass deep le-radar">
        <div class="gc-head"><span>What it’s used for</span><span class="dim">By goal</span></div>
        <div class="radar-box" data-live="radar" data-studied="${e(JSON.stringify(studied || {}))}">${radar}${studied ? '' : '<p class="rose-empty">Charted as forums and members report on it</p>'}</div>
        <p class="legend">${studied ? `<span class="lg"><span class="k studied"></span>${studiedLabel}</span>` : ''}<span class="lg"><span class="k forums"></span>What forums talk about</span><span class="lg"><span class="k members"></span>What members report on</span></p>
      </div>
      ${facts.length ? `<dl class="glass deep le-facts">${facts.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
    </div>
    <div class="glass deep le-signal" data-live="signal" aria-live="polite">
      <div class="gc-head"><span>Community Signal</span><span class="live lime"><i aria-hidden="true"></i>Live</span></div>
      <p class="sig-wait">Loading what members report…</p>
      <noscript><p>The Community Signal needs JavaScript. You can see it in the community.</p></noscript>
      <a class="btn line sm sig-cta" href="${shareLink(c.id)}">Share how it went</a>
    </div>
  </div>
</section>

<div class="wrap le-body">
  <article class="le-main">
    ${f ? factSheet(c, f) : pendingSheet(c)}
    ${parentBlends.length ? `<section class="le-sec" id="blends"><h2>Also sold in blends</h2><div class="parts">${parentBlends.map((b) => `<a class="part" href="/library/${b.id}/"><span class="lc-fam">Blend</span><b>${e(b.name)}</b></a>`).join('')}</div></section>` : ''}
  </article>
  <aside class="le-side">
    ${toc.length ? `<nav class="toc" aria-label="On this page"><p class="mono">// on this page</p>${toc.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</nav>` : ''}
    <div class="side-card">
      <p class="mono">// took it?</p>
      <p>Your report moves the ${e(c.name)} Signal, whether it worked or not.</p>
      <a class="btn line sm" href="${shareLink(c.id)}">Share how it went</a>
    </div>
    <p class="side-note">Experiences and published evidence, not medical advice. No doses, no sellers.</p>
  </aside>
</div>
</div>`;
  return page({ title: `${c.name}: evidence, risks, blood tests · Miracle Health Library`, description: desc.slice(0, 300), url: `/library/${c.id}/`,
    side: tree, body });
}

// ---------------------------------------------------------------------------
// What Sig reads: every compound with what it needs to find and rank it
// ---------------------------------------------------------------------------
function aiIndex() {
  const nonzero = (g) => Object.fromEntries(Object.entries(g || {}).filter(([, v]) => Number(v) > 0));
  const checked = [...entries.values()].map((f) => f.checked || '').sort().pop() || '';
  return JSON.stringify({
    note: 'Every compound and blend in the Library, with the status, evidence grade, goals and lab list of the ones that have a fact sheet. Written by scripts/build_library.mjs for Sig (miraclehealth.us/ai) and its screen.',
    checked,
    goals: uses.goals,
    items: catalog.map((c) => {
      const f = entries.get(c.id);
      return {
        id: c.id, name: c.name, family: c.family, category: c.category, aliases: c.aliases || [], kind: c.kind, parts: c.parts || [],
        sheet: !!f,
        ...(f ? { status: f.status_us.key, status_label: f.status_us.label, grade: f.evidence.grade, goals: nonzero(f.goals), summary: f.summary, checked: f.checked || '',
          labs: { before: f.labs?.before || [], during: f.labs?.during || [] } } : {}),
      };
    }),
  }) + '\n';
}

// ---------------------------------------------------------------------------
// The Library's guides (library/data/guides/<id>.md): written in a small Markdown of ## and ###
// headings, - and 1. lists, **bold**, *italics* and [1] source numbers, ending in a numbered
// Sources list. Rendered like a fact sheet.
// ---------------------------------------------------------------------------
const GUIDES = [{ id: 'lab-reports', kick: 'Guide', checked: '2026-10-29' }];
function guideInline(t) {
  return e(t)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?![\w*])/g, '$1<i>$2</i>')
    .replace(/\s?\[(\d+(?:,\s*\d+)*)\]/g, (_, ns) => ` ${refs(ns.split(/,\s*/).map(Number))}`);
}
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
function guidePage(g) {
  const md = fs.readFileSync(path.join(DATA, 'guides', `${g.id}.md`), 'utf8').replace(/\r\n?/g, '\n');
  const blocks = md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const title = blocks.shift().replace(/^#\s+/, '');
  const lede = /^\*[^*][\s\S]*\*$/.test(blocks[0] || '') ? blocks.shift().slice(1, -1) : '';
  if (/^\*Checked/.test(blocks[0] || '')) blocks.shift();
  const sections = [];
  let sources = [];
  for (const b of blocks) {
    if (/^##\s/.test(b)) { sections.push({ title: b.replace(/^##\s+/, ''), parts: [] }); continue; }
    const sec = sections[sections.length - 1];
    if (!sec) continue;
    if (/^sources$/i.test(sec.title)) {
      sources = b.split('\n').map((l) => /^(\d+)\.\s+(.*?)\s+(https:\/\/\S+)$/.exec(l.trim())).filter(Boolean).map(([, n, text, url]) => ({ n: Number(n), text, url }));
      continue;
    }
    if (/^###\s/.test(b)) sec.parts.push(`<h3>${guideInline(b.replace(/^###\s+/, ''))}</h3>`);
    else if (/^-\s/.test(b)) sec.parts.push(`<ul class="dots">${b.split(/\n(?=-\s)/).map((l) => `<li>${guideInline(l.replace(/^-\s+/, '').replace(/\n/g, ' '))}</li>`).join('')}</ul>`);
    else if (/^\d+\.\s/.test(b)) sec.parts.push(`<ol class="nums">${b.split(/\n(?=\d+\.\s)/).map((l) => `<li>${guideInline(l.replace(/^\d+\.\s+/, '').replace(/\n/g, ' '))}</li>`).join('')}</ol>`);
    else sec.parts.push(`<p>${guideInline(b.replace(/\n/g, ' '))}</p>`);
  }
  const shown = sections.filter((x) => !/^sources$/i.test(x.title));
  if (!shown.length || !sources.length) throw new Error(`guide ${g.id}: no sections or no sources`);
  const body = `<div class="lib-entry lib-guide">
<section class="le-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/library/">Library</a><span aria-hidden="true">/</span><span>Guides</span></nav>
    <p class="kick lime">${e(g.kick)}</p>
    <h1 class="long">${e(title)}</h1>
    ${lede ? `<p class="lede">${guideInline(lede)}</p>` : ''}
    <div class="le-badges"><span class="check">Checked ${date(g.checked)} against ${sources.length} sources</span></div>
  </div>
</section>

<div class="wrap le-body">
  <article class="le-main">
    ${shown.map((x) => `<section class="le-sec" id="${slug(x.title)}">
      <h2>${guideInline(x.title)}</h2>
      ${x.parts.join('\n      ')}
    </section>`).join('\n\n    ')}

    <section class="le-sec" id="sources">
      <h2>Sources</h2>
      <ol class="sources">${sources.map((x) => `<li id="src-${x.n}"><a href="${e(x.url)}" rel="noopener" target="_blank">${e(x.text)}</a></li>`).join('')}</ol>
      <p class="checked">Checked against these sources on ${date(g.checked)}. Spotted something wrong? <a href="mailto:hello@miraclehealth.us?subject=${encodeURIComponent(`Library: ${title}`)}">Tell us</a>.</p>
    </section>
  </article>
  <aside class="le-side">
    <nav class="toc" aria-label="On this page"><p class="mono">On this page</p>${shown.map((x) => `<a href="#${slug(x.title)}">${e(x.title)}</a>`).join('')}<a href="#sources">Sources</a></nav>
    <p class="side-note">Education, not medical advice. No doses, no sellers, no labs named. A good report doesn’t make a product safe.</p>
  </aside>
</div>
</div>`;
  return page({
    title: `${title} · Miracle Health Library`,
    description: 'What a lab report (certificate of analysis) for a peptide, hormone or supplement should show, how to spot a weak or fake one, and what even a good one can’t tell you. No sellers named.',
    url: `/library/${g.id}/`, body, scripts: [], connect: '',
  });
}

// ---------------------------------------------------------------------------
// Ask Sig, Sig's own page (miraclehealth.us/sig): Sig, Miracle Health's AI, with its agents and the community's numbers, and the
// member's own clinician last
// ---------------------------------------------------------------------------
// Each agent: its key, its name, what it does, and that in a few words (the agents' tab on Ask Sig)
const AGENTS = [
  ['safety', 'Safety agent', 'Reads your message first, and checks every answer before you see it.', 'First to read, last to check'],
  ['planner', 'Planner', 'Turns your goal into what studies measure. “Lose fat” becomes body fat, waist and lean mass.', 'Turns goals into measures'],
  ['recommender', 'Recommender', 'Finds the options in the Library and reads their fact sheets, with what you’ve told it. It never asks you questions.', 'Finds and reads the fact sheets'],
  ['evidence', 'Evidence librarian', 'Finds every study result on exactly that: how strong it is, and who was studied.', 'Finds every study result'],
  ['relatives', 'Relatives agent', 'Finds things that work through the same hormone or receptor, like testosterone for enclomiphene, and says whose evidence it is.', 'Evidence from close relatives'],
  ['mechanism', 'Mechanism agent', 'Explains how each one could affect your goal, from its fact sheet. That is theory, not a test result, and it says so.', 'How each one could work'],
  ['community', 'The community', 'What members report first-hand and what public forums say, as totals. It leads where the studies run out.', 'Member and forum reports'],
  ['combination', 'Combination agent', 'Says whether the things you take together overlap or work in different ways.', 'Overlap, or different paths'],
  ['markers', 'Markers agent', 'Flags blood tests that two things push in opposite directions, like IGF-1 with HGH and enclomiphene.', 'Blood tests pushed two ways'],
  ['synergy', 'Synergy auditor', 'Checks everything together with your medicines and conditions.', 'Checks it all with your meds'],
  ['builder', 'Stack builder', 'Lays out what you take and the options to discuss with your doctor. Never doses, never sellers.', 'Lays out options to discuss'],
  ['interpretation', 'Interpretation agent', 'Runs last. Reasons through everything the others found, strictly about efficacy: how likely it is to work for what you asked, how big the effect could be, and how sure anyone can be.', 'Efficacy, reasoned last'],
];
// The first screen: four ways in. "Check my stack" starts the sentence for them to finish.
const STARTERS = [
  ['stack', 'Check what I take together', '', 'I take '],
  ['recovery', 'Recover from an injury', 'I keep straining a tendon. What could help it heal, and what does the evidence say?', ''],
  ['weight', 'Lose fat', 'I want to lose fat. What are the options, from supplements to prescription medicines, and how strong is the evidence?', ''],
  ['sleep', 'Sleep better', 'I want to sleep better. What has good evidence, and what is mostly hype?', ''],
];

// Ask Sig is Sig's health terminal: a window under the site's bar with a title bar (Sig's ring, the
// question it's on and the twelve who answer), the conversation on the left with the box to write
// in as its prompt, the agents and the screen beside it as two tabs, and a status bar. On a phone it
// is the conversation alone, with the ring in its title bar; the screen pulls up as a sheet.
function aiPage() {
  const agentList = (cls) => `<ol class="${cls}">${AGENTS.map(([key, name, what]) => `<li class="agent" data-agent="${key}"><span class="agent-node" aria-hidden="true"></span><span class="agent-text"><b>${e(name)}</b><span class="agent-what">${e(what)}</span><span class="agent-now" aria-live="off"></span></span></li>`).join('')}</ol>`;
  // The Library's newest change: a fact sheet checked, the body map or a guide
  const libDate = date([...entries.values()].map((f) => f.checked || '').concat(BODY.updated || '', GUIDES.map((g) => g.checked)).filter(Boolean).sort().pop());
  const ring = (size, cls = '', opts = {}) => `<span${cls ? ` class="${cls}"` : ''} data-sig="${size}" aria-hidden="true">${ringSvg(size, opts)}</span>`;
  const roster = `<ol class="tm-roster" id="tm-roster">${AGENTS.map(([key, name, what, short]) => `<li class="tm-who" data-agent="${key}"><span class="tm-st" aria-hidden="true"></span><span class="tm-sq tm-gl" aria-hidden="true">${glyphSvg(key, { size: 14 })}</span><b>${e(name)}</b><span class="tm-now" title="${e(what)}">${e(short)}</span></li>`).join('')}</ol>`;
  const body = `<div class="ai-app tm is-empty" id="ai" data-endpoint="${e(ASK_URL)}" data-qr="/ai/vendor/qrcode.js?v=${V.qr}">
  <div class="tm-title">
    <button class="tm-menu" id="tm-menu" type="button" aria-label="Show your chats and the site's links" aria-controls="sg-side" aria-expanded="false"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button>
    <span class="tm-brand" aria-hidden="true">${ring(18, 'ai-sig tm-logo')}<b>Sig</b><span class="tm-dim">health terminal</span></span>
    <div class="tm-tabstrip" id="tm-tabstrip">
      <nav class="tm-chats" id="tm-chats" aria-label="Your chats"></nav>
      <button class="tm-plus" id="tm-plus" type="button" aria-label="New chat" title="New chat"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>
    </div>
    <span class="tm-online" aria-hidden="true"><span class="tm-dots">${[...WHEEL, CENTER].map((k) => `<i data-agent="${k}"></i>`).join('')}</span><span>${AGENTS.length} agents online</span></span>
    <span class="tm-count-sm" id="tm-count-sm" aria-hidden="true"><b>${AGENTS.length}</b>/${AGENTS.length} ready</span>
  </div>
  <section class="ai-chat is-empty" aria-label="Conversation with Sig">
    <div class="ai-bar">
      <div class="ai-id"><span class="tm-path" aria-hidden="true">~/chats/<b id="tm-slug">new</b></span><h1>Ask Sig</h1><span class="tm-what" aria-hidden="true">every answer checked · efficacy reasoned last</span></div>
    </div>
    <div class="ai-scroll" id="ai-scroll">
      <div class="ai-thread" id="ai-thread" role="log" aria-label="Messages" aria-live="polite">
        <div class="ai-empty" id="ai-empty">
          <div class="ai-hi">${ring(56, 'ai-hello')}<h2 class="ai-title">Ask anything. Get the studies and the people, kept apart.</h2></div>
          <p class="ai-lede">I’m Sig, Miracle Health’s AI. Ask me about a goal, something you take, or something you’re thinking about. I’ll tell you what the studies show and what people report, and I’ll always say which is which. No doses, no sellers, no diagnosis. Your doctor has the final say.</p>
          <p class="ai-crowd" id="ai-crowd" hidden></p>
        </div>
      </div>
      <div class="ai-begin" id="ai-begin">
        <div class="ai-saved" id="ai-saved" hidden></div>
        <div class="ai-starts" role="group" aria-label="Start with">
          ${STARTERS.map(([goal, label, text, prefill]) => `<button type="button" class="ai-start"${text ? ` data-ask="${e(text)}"` : ''}${prefill ? ` data-prefill="${e(prefill)}"` : ''} data-goal="${goal}"><span class="start-ico" aria-hidden="true"></span>${e(label)}</button>`).join('\n        ')}
        </div>
        <details class="ai-who">
          <summary>Who answers</summary>
          ${agentList('agent-list')}
        </details>
      </div>
      <noscript><p class="ai-nojs">Sig needs JavaScript. The <a href="/library/">Library</a> works without it.</p></noscript>
    </div>
    <form class="ai-dock" id="ai-form" novalidate>
      <div class="ai-peek" id="ai-peek" hidden></div>
      <div class="ai-composer">
        <span class="tm-ps1" aria-hidden="true"><span class="ps-host">sig@miracle</span> <span class="ps-path">~/chats</span> <b>›</b></span>
        <label class="sr" for="ai-input">Message Sig</label>
        <span class="tm-field"><textarea id="ai-input" rows="1" maxlength="2000" placeholder="Ask about a goal, something you take, or a mix" data-short="Ask about a goal or what you take"></textarea><span class="tm-caret" aria-hidden="true"></span></span>
        <span class="ai-count" id="ai-count" aria-live="polite"></span>
        <button class="ai-send" id="ai-send" type="submit" aria-label="Send" disabled><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path class="i-send" d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><rect class="i-stop" x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg><span class="tm-key k-send" aria-hidden="true">↩ send</span><span class="tm-key k-stop" aria-hidden="true">stop</span></button>
      </div>
      <p class="ai-fine">Sig is an AI. No doses, sellers or diagnosis.<span class="ai-fine-x"> Your chats stay on this device.</span> <a href="/privacy#ai"><span class="ai-fine-x">How messages are handled</span><span class="ai-fine-s">Privacy</span></a></p>
    </form>
  </section>
  <section class="ai-rail sc" id="ai-screen" role="complementary" aria-label="Beside the chat: the agents and the screen">
    <div class="tm-tabs" role="tablist" aria-label="Beside the chat">
      <button class="tm-tabbtn" type="button" role="tab" id="tm-t-agents" aria-controls="tm-team" aria-selected="true">Agents</button>
      <button class="tm-tabbtn" type="button" role="tab" id="tm-t-screen" aria-controls="sc-root" aria-selected="false" tabindex="-1">Screen</button>
      <span class="tm-live" id="tm-live">${ring(12)}<span id="tm-live-t">ready</span></span>
    </div>
    <div class="tm-team" id="tm-team" role="tabpanel" aria-labelledby="tm-t-agents" data-state="idle">
      <div class="tm-ringbox">${ring(212, 'tm-bigring', { sw: 20, centerY: -44 })}<p class="tm-count"><span class="tm-frac"><b id="tm-n">${AGENTS.length}</b><span>/${AGENTS.length}</span></span><span class="tm-count-k" id="tm-k">ready</span></p></div>
      ${roster}
    </div>
    <div id="sc-root" role="tabpanel" aria-labelledby="tm-t-screen" hidden><noscript><p class="sc-lede">The screen needs JavaScript.</p></noscript></div>
  </section>
  <div class="tm-status">
    <span class="tm-sb tm-sb-sig" aria-hidden="true">${ring(12)}SIG</span>
    <span class="tm-sb tm-sb-state" id="tm-state" data-state="ready"><i class="tm-ico" aria-hidden="true"></i><span id="ai-status">ready</span></span>
    <span class="tm-sb tm-sb-safe"><i aria-hidden="true"></i>safety on</span>
    <span class="tm-sb tm-sb-rules">no doses · no sellers · no diagnosis</span>
    <span class="tm-sb tm-sb-lib">library · ${libDate.toLowerCase()}</span>
    <button class="tm-sb tm-sb-k" type="button" data-cmdk aria-label="Go anywhere (⌘K)">⌘K</button>
  </div>
</div>`;
  // Sig's own page: the window fills the browser beside a side panel with the chats kept on this
  // device and the site's own links (the site's bar and footer give way to it)
  const ico = (d) => `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const shell = `<div class="sg" id="sg">
<aside class="sg-side" id="sg-side" aria-label="Your chats and the site">
  <div class="sg-head">
    <a class="sg-logo" href="/"><img src="/logo.webp" alt="Miracle Health" width="80" height="28"></a>
    <button class="sg-fold" id="sg-fold" type="button" aria-label="Hide the side panel" aria-controls="sg-side" aria-expanded="true">${ico('M10 3.5 5.5 8l4.5 4.5')}</button>
  </div>
  <button class="sg-new" id="sg-new" type="button">${ico('M8 2.5v11M2.5 8h11')}<span>New chat</span></button>
  <nav class="sg-site os-places" aria-label="Main">${SIGNAL_PLACE()}${PLACES.map(([k, label]) => `<a href="${k === 'ai' ? '/sig/' : placeHref(k, { site: '' })}"${k === 'ai' ? ' aria-current="page"' : ''}><span class="op-g" aria-hidden="true">${PLACE_ICON[k] ? PLACE_ICON[k]() : ''}</span><span class="op-n">${label}</span><span class="op-k">${PLACE_META[k] ? PLACE_META[k]() : ''}</span></a>`).join('')}</nav>
  <section class="sg-chats" aria-labelledby="sg-chats-h">
    <h2 class="sg-k" id="sg-chats-h">Chats on this device</h2>
    <ol class="sg-list" id="sg-list"></ol>
    <p class="sg-none" id="sg-none">Your chats show here. They stay on this device, never on our servers.</p>
  </section>
  <nav class="os-more sg-more" aria-label="More of the site"><p class="os-k">more</p>${MORE.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</nav>
  <div class="sg-foot">
    <div class="sg-acct"><a class="sg-signin" href="${COMMUNITY}/">Sign in</a><a class="btn line sm" href="${COMMUNITY}/">Join</a></div>
    <div class="sg-wipe-row" id="sg-wipe-row">
      <button class="sg-wipe" id="sg-wipe" type="button">${ico('M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5')}<span>Delete all chats</span></button>
    </div>
    <p class="sg-legal"><a href="/privacy#ai">Privacy</a><span aria-hidden="true"> · </span><a href="/terms">Terms</a><span aria-hidden="true"> · </span><a href="/">miraclehealth.us</a></p>
  </div>
</aside>
<div class="sg-scrim" id="sg-scrim" hidden></div>
<main id="main" class="sg-main">
${body}
</main>
</div>`;
  return page({
    title: 'Ask Sig · Miracle Health’s AI: the studies and the whole community, in one answer',
    description: 'Ask Sig, Miracle Health’s AI, about peptides, supplements and hormones: what studies show and what members and the public forums report, in one answer that says which is which. Every part is checked before you see it. No doses, no sellers.',
    ogImage: fs.existsSync(path.join(ROOT, 'img', 'og', 'ask-sig.jpg')) ? '/img/og/ask-sig.jpg' : '/og.jpg',
    url: '/sig/', body: shell, current: 'ai', bodyClass: 'ai sigapp', app: true,
    head: `<link rel="manifest" href="/sig/sig.webmanifest">
<link rel="apple-touch-icon" href="/sig/icon-180.png">
<meta name="apple-mobile-web-app-title" content="Sig">
<meta name="mobile-web-app-capable" content="yes">`,
    styles: [`/library/library.css?v=${V.lib}`, `/ai/ai.css?v=${V.aiCss}`, `/ai/plan.css?v=${V.plCss}`, `/ai/screen.css?v=${V.scCss}`, `/ai/term.css?v=${V.tmCss}`],
    scripts: [`/ai/plan.js?v=${V.plJs}`, `/ai/screen.js?v=${V.scJs}`, `/ai/ai.js?v=${V.aiJs}`],
    connect: `${new URL(ASK_URL).origin} ${COMMUNITY}`,
  });
}

// The page a clinician opens from a shared packet: the packet travels in the link after "#", so
// it never reaches this site's server; the page reads it in the browser
function packetPage() {
  const body = `<div class="packet-root" id="packet-root">
  <section class="pk-welcome">
    <h1>Clinician review packet</h1>
    <p>This page shows a review packet that a patient made with Sig and shared with you as a link or QR code. The packet travels inside the link itself, so Miracle Health never receives or keeps it.</p>
    <p>If you were sent here without a packet, ask for the link or the code again.</p>
  </section>
  <noscript><p class="pk-loading">Opening a packet needs JavaScript.</p></noscript>
</div>`;
  return page({
    title: 'Clinician review packet · Miracle Health',
    description: 'A clinician review packet a patient made with Sig. The packet travels inside the shared link; Miracle Health never receives it.',
    url: '/ai/packet/', body, current: 'ai', bodyClass: 'packet-page',
    styles: [`/ai/packet.css?v=${V.pkCss}`], scripts: [`/ai/packet.js?v=${V.pkJs}`],
    connect: '', head: '<meta name="robots" content="noindex">',
  });
}

// The page a shared Miracle Plan opens: the plan travels in the link after "#", so it never
// reaches this site's server; the page draws it in the browser
function planPage() {
  const body = `<div class="plan-wrap">
  <div class="plan-root" id="plan-root">
    <section class="plan-intro">
      <h1>A Miracle Plan, shared with you.</h1>
      <p>Someone built this plan with Sig and wanted you to see it: the three foundations everything rests on, what they’ve built on top, and the pillar they’re working on. It travels inside the link you opened, so Miracle Health never receives it.</p>
    </section>
    <noscript><p class="plan-oops-p">Opening a plan needs JavaScript.</p></noscript>
  </div>
  <section class="plan-cta">
    <h2>Build your own plan</h2>
    <p>Tell Sig your goal and what you take. It asks about your nutrition, sleep and training, finds the pillar that will make the biggest difference, and builds your plan around it.</p>
    <a class="btn lime" href="/sig/">Start with Sig</a>
  </section>
  <p class="plan-fine">Education, not medical advice. Miracle Health gives no doses and names no sellers. Talk any change through with your own doctor.</p>
</div>`;
  return page({
    title: 'A Miracle Plan, shared with you · Miracle Health',
    description: 'A plan someone built with Sig and shared with you: nutrition, sleep and exercise as the foundations, and what rests on them. It travels inside the link; Miracle Health never receives it.',
    url: '/plan/', body, current: 'ai', bodyClass: 'plan-page', ogImage: '/img/og-plan.jpg',
    styles: [`/ai/plan.css?v=${V.plCss}`], scripts: [`/ai/plan.js?v=${V.plJs}`],
    connect: '', head: '<meta name="robots" content="noindex">',
  });
}

// My Miracle: what a member keeps on this device (their plan and its ticks, their check-ins, their
// saved stack), together, with their places in the community. The page reads it from the
// browser's own storage; nothing of it reaches this site's server.
function myPage() {
  const body = `<div class="my-wrap" id="my-root" data-qr="/ai/vendor/qrcode.js?v=${V.qr}">
  <section class="my-intro">
    ${glyphSvg('builder', { size: 48 })}
    <div>
      <h1>My Miracle.</h1>
      <p>Your plan, how it’s going, your stack and your places in the community, together. They’re kept on this device; Miracle Health never receives them.</p>
    </div>
  </section>
  <div id="my-app"><p class="my-loading">Opening what you keep on this device…</p></div>
  <noscript><p class="my-loading">My Miracle needs JavaScript: it reads what you keep in this browser.</p></noscript>
</div>`;
  return page({
    title: 'My Miracle · Miracle Health',
    description: 'Your Miracle Plan, how it’s going, what you take and your places in the community, in one place. It all stays on your device; Miracle Health never receives it.',
    url: '/my/', body, current: 'my', bodyClass: 'my-page',
    styles: [`/ai/plan.css?v=${V.plCss}`, `/my/my.css?v=${V.myCss}`],
    scripts: [`/ai/packet.js?v=${V.pkJs}`, `/ai/plan.js?v=${V.plJs}`, `/my/my.js?v=${V.myJs}`],
    connect: READS_SIGNAL, head: '<meta name="robots" content="noindex">',
  });
}

// ---------------------------------------------------------------------------
// How the numbers are made: the methodology, in plain words, with the references for "how many
// improve anyway" and their sources
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// The story: the new Miracle Health, told in its own windows
// ---------------------------------------------------------------------------
// One page that tells what changed and why: one app, the twelve agents and what each does, how an
// answer is made (a real run, step by step), every compound's print, and the rules that don't
// move. Everything on it is drawn from the Library and Sig as they are: the agents' own words, a
// run as Sig logs it, the prints from the fact sheets.
const STORY_PRINTS = ['semaglutide', 'tirzepatide', 'bpc157', 'testosterone', 'creatine', 'melatonin', 'ashwagandha', 'metformin'];
const STORY_RUN = [
  ['safety', 'No red flags'], ['planner', 'Looking for evidence on body fat, body weight and lean mass'], ['recommender', 'Opened 2 fact sheets'],
  ['evidence', 'Found 2 findings in 1 of 2 fact sheets'], ['relatives', 'Found evidence through Tesamorelin and Testosterone'], ['mechanism', 'Read how each could bear on body fat'],
  ['combination', 'Different pathways: growth hormone and testosterone'], ['markers', 'IGF-1: pushed both ways'], ['community', 'Read the forum data on Somatropin (HGH)'],
  ['synergy', '1 pair checked · no known clashes (absence of data, not a green light)'], ['builder', 'Laid out your stack of 2'],
  ['interpretation', 'Reasoned it all through for efficacy: plausible, unproven'], ['safety', 'Every part checked before you saw it: no doses, no sellers'],
];
function storyPage() {
  const places = BODY.places.map((x) => x.at);
  const prints = STORY_PRINTS.filter((id) => entries.has(id) && BODY.compounds[id] && byId.has(id)).map((id) => {
    const c = byId.get(id), f = entries.get(id);
    return `<a class="sy-print" href="/library/${id}/">${printSvg({ id, name: c.name, family: c.family, grade: f.evidence.grade, lines: BODY.compounds[id].lines || [], places }, { size: 168 })}<span class="sy-pn">${e(c.name)}</span><span class="sy-pf">${e(`${id}.md`)} · ${(BODY.compounds[id].lines || []).length} lines</span></a>`;
  }).join('');
  const short = (k) => (k === 'community' ? 'community' : k);
  const body = `<article class="sy">
  <section class="sy-hero">
    <div class="wrap sy-hero-in">
      <div class="sy-ring" aria-hidden="true">${ringSvg(320, { sw: 26, centerY: -66 })}<span class="sy-ring-n"><b>12</b>agents</span></div>
      <div class="sy-hero-copy">
        <p class="sy-k">~/story · the new Miracle Health</p>
        <h1>One app.<br> Twelve agents.<br> <em>Every answer, checked.</em></h1>
        <p class="lede">Miracle Health is now one app. The Library, Ask Sig, the community and My Miracle each open as a window in Sig’s terminal, side by side, the same everywhere. Behind every answer are twelve agents, each with one job, each signing what it made.</p>
        <div class="sy-acts"><a class="btn lime" href="/sig/">Ask Sig a question</a><a class="btn line" href="/library/">Open the Library</a></div>
      </div>
    </div>
  </section>

  <section class="sy-sec" id="twelve" aria-labelledby="sy-twelve">
    <div class="wrap">
      <p class="sy-k">01 · the twelve</p>
      <h2 id="sy-twelve">Meet the twelve.</h2>
      <p class="sy-lede">Eleven gather what’s known, each in its own colour round Sig’s ring. The twelfth sits at its centre and reasons it all through, last, strictly for efficacy. Colour on Miracle Health is a signature: wherever you see one, that agent made it.</p>
      <ol class="sy-twelve">${AGENTS.map(([key, name, what], i) => `<li class="sy-agent" data-agent="${key}"><span class="sy-an" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${glyphSvg(key, { size: 34 })}<h3>${e(name)}</h3><p>${e(what)}</p></li>`).join('')}</ol>
    </div>
  </section>

  <section class="sy-sec" id="run" aria-labelledby="sy-run">
    <div class="wrap sy-split">
      <div>
        <p class="sy-k">02 · how an answer is made</p>
        <h2 id="sy-run">Watch it work.</h2>
        <p class="sy-lede">Every question runs as a log you can read: each agent’s step, numbered, in its colour, as it happens. The answer comes under the Safety agent’s check, each part numbered and signed by the agent that made it. Nothing is a black box.</p>
        <p class="sy-note">A real run, as Sig logged it, for “Is HGH plus enclomiphene good for fat loss?”</p>
      </div>
      <div class="sy-term" aria-label="A run, as Sig logs it">
        <p class="sy-ps"><span>sig@miracle ~/chats ›</span> ask “Is HGH plus enclomiphene good for fat loss?”</p>
        <p class="sy-sum">▾ run · ${STORY_RUN.length} steps · ${AGENTS.length} agents</p>
        <ol class="sy-log">${STORY_RUN.map(([a, t], i) => `<li data-agent="${a}"><span class="sl-n">${String(i + 1).padStart(2, '0')}</span><span class="sl-who">${short(a)}</span><span class="sl-st" aria-hidden="true"><svg class="i-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="sl-t">${e(t)}</span></li>`).join('')}</ol>
        <p class="sy-ah"><b>answer</b><span class="sy-rule" aria-hidden="true"></span><span>checked by the safety agent <span class="sy-ok"><svg class="i-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span></p>
        <div class="sy-part" data-agent="recommender"><span class="sp-n">1</span><p class="sp-k"><span>// the bottom line</span><b>recommender</b></p><p>No trial has tested the two together for fat loss. They act on different hormone systems, so any effect would come from each one separately.</p></div>
        <div class="sy-part" data-agent="interpretation"><span class="sp-n">8</span><p class="sp-k"><span>// efficacy, reasoned last</span><b>interpretation agent</b></p><p>Plausible, unproven. A small combined effect is possible; nothing has measured the pair.</p></div>
      </div>
    </div>
  </section>

  <section class="sy-sec" id="prints" aria-labelledby="sy-prints">
    <div class="wrap">
      <p class="sy-k">03 · prints</p>
      <h2 id="sy-prints">Every compound has a print.</h2>
      <p class="sy-lede">A print is a fact sheet drawn as one mark, so you can tell two compounds apart, and compare them, at a glance. Nothing in it is decoration.</p>
      <ul class="sy-legend">
        <li><b>Spokes</b> run to the places in the body the sheet names: the body’s ${places.length} places, head to toe, clockwise from the top.</li>
        <li><b>Beads</b> are its lines there: <span class="pk pk-is">acts</span> <span class="pk pk-up">raises</span> <span class="pk pk-down">lowers</span> <span class="pk pk-block">blocks</span> <span class="pk pk-watch">worth a blood test</span> <span class="pk pk-warn">a caution</span>, cautions outermost.</li>
        <li><b>The core</b> is the family’s shape (peptide, hormone, medication, supplement) and the evidence inside it, ring by ring, in the Evidence librarian’s blue.</li>
        <li><b>The edge</b> carries the Community Signal in blue, once it’s known.</li>
      </ul>
      <div class="sy-prints">${prints}</div>
    </div>
  </section>

  <section class="sy-sec" id="windows" aria-labelledby="sy-windows">
    <div class="wrap">
      <p class="sy-k">04 · one app</p>
      <h2 id="sy-windows">Four places. One window.</h2>
      <div class="sy-wins">
        <a class="sy-win" href="/library/">${glyphSvg('evidence', { size: 22 })}<b>Library</b><span>~/library/peptides/bpc157.md</span><p>Every compound is a file: its path, its family’s sheets beside it, each section signed by the agent that reads it, its facts on the status line.</p></a>
        <a class="sy-win" href="/sig/">${ringSvg(22)}<b>Ask Sig</b><span>sig@miracle ~/chats ›</span><p>Ask at the prompt. The run shows as a log; the answer comes checked and signed.</p></a>
        <a class="sy-win" href="${COMMUNITY}/">${glyphSvg('community', { size: 22 })}<b>Community</b><span>log --all-spaces</span><p>The feed is a log: each report a commit, Sig’s read its check. The Signal is a live table, like top.</p></a>
        <a class="sy-win" href="/my/">${glyphSvg('builder', { size: 22 })}<b>My Miracle</b><span>this device only</span><p>Your plan, how it’s going and your stack, kept in your browser. Miracle Health never receives it.</p></a>
      </div>
    </div>
  </section>

  <section class="sy-sec sy-rules" id="rules" aria-labelledby="sy-rules">
    <div class="wrap">
      <p class="sy-k">05 · what never changes</p>
      <h2 id="sy-rules">The rules are in the status bar.</h2>
      <p class="sy-lede">At the foot of every window, always: safety on; no doses, no sellers, no diagnosis. They aren’t settings. They’re how it’s built.</p>
      <div class="sy-status" aria-hidden="true"><span class="ss-sig">${ringSvg(12)}SIG</span><span><i class="ss-on"></i>online</span><span><i class="ss-safe"></i>safety on</span><span class="ss-r">no doses · no sellers · no diagnosis</span></div>
      <ul class="sy-promises">
        <li><b>No doses.</b> Ever, for anything. The right amount is a conversation with your doctor.</li>
        <li><b>No sellers.</b> No shop, no ads, no affiliate links. Nobody pays to be in the Library.</li>
        <li><b>No diagnosis.</b> Sig explains evidence. It doesn’t tell you what you have or what to take.</li>
        <li><b>Your chats stay with you.</b> On this device until you delete them, never on our servers.</li>
      </ul>
      <div class="sy-acts"><a class="btn lime" href="/sig/">Ask Sig a question</a><a class="btn line" href="${COMMUNITY}/">Join the community</a></div>
    </div>
  </section>
</article>`;
  return page({
    title: 'The story: one app, twelve agents, every answer checked · Miracle Health',
    description: 'Miracle Health is now one app: the Library, Ask Sig, the community and My Miracle as windows in Sig’s terminal, twelve agents behind every answer, and a print for every compound.',
    url: '/story/', body, current: '', bodyClass: 'story-page',
    ogImage: fs.existsSync(path.join(ROOT, 'img', 'og', 'story.jpg')) ? '/img/og/story.jpg' : '/og.jpg',
  });
}

function methodPage() {
  const pct = (b) => `${b.placebo_pct}%${b.low != null && b.high != null && (b.low !== b.placebo_pct || b.high !== b.placebo_pct) ? ` <span class="rng">(${b.low}–${b.high}%)</span>` : ''}`;
  const label = (id) => uses.uses.find((u) => u.id === id)?.label || id;
  const rows = baselines.uses.map((b) => `<tr>
        <th scope="row">${e(label(b.use))}</th>
        <td class="num">${pct(b)}</td>
        <td>${e(b.defined_as)}<span class="cell-sub">${e(b.population)} · ${e(b.pooled)}</span></td>
        <td><span class="conf conf-${e(b.confidence)}">${e(b.confidence)}</span></td>
        <td>${b.sources.map((x) => `<a href="${e(x.url)}" rel="noopener" target="_blank">${e(x.author)} ${e(x.year)}</a>`).join(', ')}</td>
      </tr>`).join('');
  const body = `<div class="doc-head">
    <div class="wrap">
      <p class="kick">Method</p>
      <h1>How the numbers are made.</h1>
      <p>Updated ${date(baselines.checked)}</p>
    </div>
  </div>

  <article class="wrap doc method">
    <p class="intro">Every answer on Miracle Health draws on two sources, kept apart and always named: <b>the studies</b>, in the Library’s fact sheets, and <b>the community</b>, in the Community Signal: what members report first-hand and what people say on public forums. This page explains how each number is made, what it can and can’t tell you, and what we never do.</p>

    <section class="short" aria-labelledby="short-h">
      <h2 id="short-h">The short version</h2>
      <ul>
        <li>Studies come first whenever there are studies in people for what you asked. Where there aren’t, what people report comes first, always said to be reports, not evidence.</li>
        <li>Reports are weighted, never people: a report its author confirmed, a longer one and one followed up weeks later count more. Nobody gets a credibility score.</li>
        <li>Ratings come with a likely range, and start from what members report for that use everywhere, so a handful of glowing reports can’t outrank many good ones.</li>
        <li>Next to what people report, we show how many people improve anyway, on a placebo or with time, from published trials.</li>
        <li>A side effect reported unusually often for one compound is flagged, and serious reactions point to medical help and the FDA’s MedWatch.</li>
        <li>No doses, no sellers, no diagnosis. Sig keeps nothing you write.</li>
      </ul>
    </section>

    <h2 id="studies">The studies</h2>
    <p>Each fact sheet is checked claim by claim against sources we opened: FDA labels and documents, NIH fact sheets and published trials. The evidence for each use is graded: <b>strong</b> (several good trials in people, or approved for that use), <b>moderate</b> (at least one good trial in people), <b>limited</b> (small or short studies in people), <b>animal and lab studies</b> only, or <b>anecdotal</b> (user reports only). Each sheet shows the date it was checked.</p>

    <h2 id="reports">How a report is read</h2>
    <p>Members post in their own words. Sig reads each post: is it about their own use; how it went compared with before (better, about the same or worse); for how long; what they took it for; any side effects, under one name each (so “nauseous” and “mild nausea” count together); and whether a reaction sounds serious. The author then sees that read in one line, <b>“Did we read you right?”</b>, and confirms it or fixes any part with a tap. If something important is missing, usually how long, it asks that one question. Their word always wins over the read.</p>
    <p>Two, six and twelve weeks later, the author is asked <b>“How is it now?”</b>: better, about the same or worse; still taking it or not; and if not, why (it worked, it didn’t help, side effects, cost or hassle). The latest answer is the one that counts, and why people stop is counted too.</p>

    <h2 id="weights">Reports are weighted, never people</h2>
    <div class="mtable-wrap"><table class="mtable">
      <thead><tr><th scope="col">What</th><th scope="col">Counts as</th></tr></thead>
      <tbody>
        <tr><th scope="row">A first-hand report</th><td class="d">1</td></tr>
        <tr><th scope="row">…that its author confirmed or fixed</th><td class="d">× 1.25</td></tr>
        <tr><th scope="row">…by how long they took it</th><td class="d">under a week × 0.6 · 1–4 weeks × 0.9 · 1–3 months × 1 · 3 months or more × 1.15 · not said × 0.85</td></tr>
        <tr><th scope="row">…for each check-in, up to three</th><td class="d">× 1.1</td></tr>
        <tr><th scope="row">A “same for me” on someone’s report</th><td class="d">half a report</td></tr>
        <tr><th scope="row">From an account in its first days</th><td class="d">half</td></tr>
      </tbody>
    </table></div>
    <ul>
      <li>Each account counts once per compound: its latest report.</li>
      <li>A “same for me” from someone whose own report already counts adds nothing more.</li>
      <li>A post with the same words as an earlier post by someone else is held out (an edit counts from when it was made).</li>
      <li>When five or more accounts less than a week old report on one compound, or tap “same for me” there, within 48 hours, what each of them adds counts a quarter until a moderator has looked. A moderator can let a report count in full.</li>
      <li>Side effects are counted by one name each (“queasy” counts as nausea), and only names on that list reach the totals.</li>
    </ul>

    <h2 id="signal">The Community Signal</h2>
    <p>One number from 0 to 100 per compound, blend and stack. It has four parts:</p>
    <ul>
      <li><b class="num">65%</b> how reports went (better 1, about the same ½, worse 0)</li>
      <li><b class="num">15%</b> how much they agree</li>
      <li><b class="num">10%</b> how many independent voices there are</li>
      <li><b class="num">10%</b> how much there is to go on</li>
    </ul>
    <p>Every Signal starts from Miracle Health’s reading of public forums, which counts as 50 reports; every first-hand report here shifts the balance toward members’ own experience.</p>
    <p>Each Signal earns a level for how far along that line it is:</p>
    <ul>
      <li>Forum data</li>
      <li>Early signal</li>
      <li>Community-backed (25% from members, 10+ reports)</li>
      <li>Community-verified (50%, 25+ reports from 15+ members)</li>
      <li>Signal Certified (75%, 50+ reports, 30+ members)</li>
    </ul>
    <p>Every change is kept as a new version.</p>

    <h2 id="ranges">Ratings by use, with a likely range</h2>
    <p>A compound gets its own rating for a use (sleep, joint pain, injury healing…) once three reports name that use. The rating starts from what members report for that use across every compound, worth eight reports, and moves toward the compound’s own reports as they come in: so three glowing reports pull a rating up only so far, and two hundred good ones carry it.</p>
    <p>Each rating shows its likely range (90%), worked out from the effective number of reports so that weights never make it look surer than the reports allow, and the share of its reports that went better, with a 95% interval.</p>
    <p>Sig lists what the community reports most for a use only from ratings with 10 or more reports from 5 or more people, in order of the low end of their range, and never as a recommendation.</p>

    <h2 id="anyway">Would it have happened anyway?</h2>
    <p>Many people feel better with time, or on a placebo, whatever they take. Next to what members report for a use, we show how many people improved anyway in published trials. It’s context, not a direct comparison: in trials “improved” was measured on strict scales, while a member’s “better” is their own word.</p>
    <div class="mtable-wrap"><table class="mtable baselines">
      <thead><tr><th scope="col">Use</th><th scope="col">Improved anyway</th><th scope="col">How it was measured</th><th scope="col">Confidence</th><th scope="col">Sources</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="cell-note">Not shown yet, for want of comparable trials: ${baselines.not_shown.map((x) => `${e(label(x.use).toLowerCase())} (${e(x.why.replace(/\.$/, ''))})`).join('; ')}.</p>

    <h2 id="calibration">Does the Signal agree with the studies?</h2>
    <p>One check we run in the open. If the Signal measures something real, compounds with good trials in people should, on the whole, be reported as working more often than compounds studied only in animals. Below, from the live numbers: the share of members’ reports that went better, for every compound with a fact sheet and at least 10 reports, grouped by how strong its studies are. It’s a rough check, not proof: people take strongly studied medicines for what they were studied for, and other compounds for many things.</p>
    <div class="calib" data-live="calibration">
      <p class="calib-wait">This fills in by itself as reports come in: it needs at least three compounds with 10 or more reports in a group to compare.</p>
    </div>

    <h2 id="watch">The side-effect watch</h2>
    <p>For each compound we compare how often each side effect is reported with how often it’s reported for every other compound. A side effect is flagged when all four of these hold:</p>
    <ul>
      <li>at least three reports mention it</li>
      <li>it’s reported at least twice as often (a proportional reporting ratio of 2 or more, with half a report added to each count)</li>
      <li>it’s unlikely to be chance (a Yates chi-square of 3.84 or more)</li>
      <li>there are at least 20 reports on other compounds to compare with</li>
    </ul>
    <p>A flag isn’t proof that the compound causes it; it’s a signal worth knowing.</p>
    <p>Reactions Sig reads as serious, in a report, a question or a comment, are counted, moderators see them all, and their writers are pointed to medical help and to <a href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program" rel="noopener" target="_blank">MedWatch</a>, where anyone in the US can report a serious reaction to the FDA.</p>

    <h2 id="forums">What we read on the forums</h2>
    <p>Each Signal starts from Miracle Health’s reading of public forums, podcasts and videos: what people describe most, and how often they mention each use. We show counted forum data (such as “412 posts read, 61% positive”) only from sources whose terms allow counting and showing it; Reddit, for one, doesn’t allow commercial use of its data without an agreement, so none is counted from there. We never quote or name anyone.</p>

    <h2 id="ai">How Sig uses all this</h2>
    <p>For each compound and question, Sig starts with the studies when there are studies in people for it, and with what people report when there aren’t, saying so in the same breath. Safety comes before either: for anything on FDA’s list of substances with significant safety risks, the status and the studies lead; in pregnancy, what people report is left out.</p>
    <p>The numbers it gives come from these same files: the fact sheets and the community’s hourly snapshot, worked into one reading per compound and use that the fact sheets show too. A check flags any number in an answer that isn’t in what Sig was given, and every part of every answer is checked by a Safety agent before you see it.</p>
    <p>A test set of about two hundred questions, with what a good answer must and must not do, is graded automatically each time Sig changes.</p>

    <h2 id="never">What we never do</h2>
    <ul>
      <li>No doses, amounts, schedules or how to take or inject anything, for any compound.</li>
      <li>No sellers, brands, prices, pharmacies or where to get something or have it tested.</li>
      <li>No diagnosis, and never start, stop or change a prescribed medicine: that’s for your doctor.</li>
      <li>No health records: Sig keeps nothing you write, and the community holds only what members choose to post.</li>
    </ul>
    <p>Spotted something wrong? <a href="mailto:hello@miraclehealth.us?subject=Method">Tell us</a>.</p>
  </article>`;
  return page({
    title: 'How the numbers are made · Miracle Health',
    description: 'How the Library grades studies, how members’ reports are read, weighted and checked, how ratings get their ranges, how many improve anyway, and the side-effect watch.',
    url: '/method/', body, current: '', bodyClass: 'doc-page', styles: [`/pages/pages.css?v=${V.pgCss}`], scripts: [`/pages/pages.js?v=${V.pgJs}`],
  });
}

// ---------------------------------------------------------------------------
// The body map, split for the screen beside Ask Sig. library/data/body.json is the one copy people
// edit (scripts/check_body.mjs checks it) and what Sig's server reads. The screen loads only an
// index with the page (the places, the markers, and each drawn compound with a version for its
// file), then a compound's own lines when it first shows that compound, so the page doesn't carry
// every compound's lines to show one or two.
// ---------------------------------------------------------------------------
const BODY_DIR = path.join(DATA, 'body');
function bodyFiles() {
  const b = BODY;
  const files = new Map();
  const drawn = {};
  for (const [id, c] of Object.entries(b.compounds || {})) {
    if (!/^[a-z0-9]{1,40}$/.test(id)) throw new Error(`body.json: "${id}" isn't a compound id`);
    const json = `${JSON.stringify(c)}\n`;
    drawn[id] = createHash('sha256').update(json).digest('hex').slice(0, 10);
    files.set(path.join(BODY_DIR, `${id}.json`), json);
  }
  files.set(path.join(BODY_DIR, 'index.json'), `${JSON.stringify({ updated: b.updated, places: b.places, markers: b.markers, drawn })}\n`);
  return files;
}

// ---------------------------------------------------------------------------
// Write it all
// ---------------------------------------------------------------------------
const out = new Map();
for (const [file, json] of bodyFiles()) out.set(file, json);
out.set(path.join(LIB, 'index.html'), indexPage());
for (const c of catalog) out.set(path.join(LIB, c.id, 'index.html'), entryPage(c));
out.set(path.join(DATA, 'index.json'), aiIndex());
// The Library as one graph, for the front page's hero (scripts/graph.mjs): laid out again whenever
// the Library changes, with its still picture
const GRAPH = buildGraph({ body: BODY, catalog, grades: new Map([...entries].map(([id, f]) => [id, f.evidence?.grade || ''])) });
out.set(path.join(DATA, 'graph.json'), GRAPH.json);
out.set(path.join(ROOT, 'img', 'library-graph.svg'), GRAPH.svg);
// ⌘K's data (lib/cmdk.js): every page, every compound (id, name, family, whether it has a sheet, the
// evidence grade the graph draws, and the words it's found by) and the pairs with a comparison
{
  const fold = (x) => String(x || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
  const gradeOf = new Map(GRAPH.data.ids.map((id, i) => [id, GRAPH.data.grade[i]]));
  const famShort = (f) => String(f || '').toLowerCase().replace(/s$/, '');
  const PAGES = [['/library/', 'Library', 'every compound and its fact sheet'], ['/sig/', 'Ask Sig', 'twelve agents, every answer checked'],
    [`${COMMUNITY}/`, 'Community', 'say how it went'], ['/my/', 'My Miracle', 'your stack, on this device'],
    ...MORE.map(([href, label]) => [href, label, href.startsWith('/#') ? 'on the front page' : '']),
    [`${COMMUNITY}/#/signal`, 'The Signal, the whole board', 'in the community'], ['/privacy', 'Privacy', ''], ['/terms', 'Terms', '']];
  const cmdk = {
    v: 1,
    pages: PAGES,
    c: catalog.map((c) => [c.id, c.name, famShort(c.family), entries.has(c.id) ? 1 : 0, gradeOf.has(c.id) ? gradeOf.get(c.id) : -1,
      fold([c.name, ...(c.aliases || []), c.category, c.family, c.id].join(' '))]),
    pairs: PAIRS.map(([a, b, slug]) => [a, b, `/compare/${slug || `${slugOf(byId.get(a)?.name || a)}-vs-${slugOf(byId.get(b)?.name || b)}`}/`]),
  };
  out.set(path.join(DATA, 'cmdk.json'), `${JSON.stringify(cmdk)}\n`);
}
for (const g of GUIDES) out.set(path.join(LIB, g.id, 'index.html'), guidePage(g));
// Sig's own page is /sig/; /ai/ (and every link made before) goes on to it (the pages build)
out.set(path.join(ROOT, 'sig', 'index.html'), aiPage());
out.set(path.join(ROOT, 'ai', 'packet', 'index.html'), packetPage());
out.set(path.join(ROOT, 'plan', 'index.html'), planPage());
out.set(path.join(ROOT, 'my', 'index.html'), myPage());
out.set(path.join(ROOT, 'story', 'index.html'), storyPage());
out.set(path.join(ROOT, 'method', 'index.html'), methodPage());
const more = buildPages({
  ROOT, SITE, COMMUNITY, V, page, e, catalog, entries, byId, uses, baselines, STATUS, GRADE, GRADE_ORDER, GOAL_SHORT,
  evPill, date, card, askLink, version, shownAliases,
});
for (const [file, html] of more.files) out.set(file, html);
const urls = ['/', '/sig/', '/library/', ...catalog.map((c) => `/library/${c.id}/`), ...GUIDES.map((g) => `/library/${g.id}/`), '/method/',
  ...more.urls, '/story/', '/privacy', '/terms'];
out.set(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`);

// The front page: wherever it marks them, the Library's own counts (so a number on the front page
// is never older than the Library), and the Signal's drawings made with the same code as the
// Library's. Each marker pair is filled in place and kept, so the next build fills it again.
const frontFile = path.join(ROOT, 'index.html');
const fill = (html, key, inner) => html.replace(new RegExp(`(<!-- ${key} -->)[\\s\\S]*?(<!-- /${key} -->)`, 'g'), (_, a, b) => `${a}${inner}${b}`);
let front = fs.readFileSync(frontFile, 'utf8');
front = fill(front, 'count:compounds', String(catalog.length));
front = fill(front, 'count:sheets', String(entries.size));
// Sig's ring beside "rather ask?" under the prompt and on the third way in; the ring that is the
// Signal board's loading spinner (dark until home.js lights it piece by piece); and the big ring
// beside the example run, every piece lit (home.js dims it and lights each agent as it reports)
front = fill(front, 'ring:ask', ringSvg(16));
front = fill(front, 'ring:load', ringSvg(64, { lit: [] }));
front = fill(front, 'ring:big', ringSvg(196, { center: false, cls: 'fp-bigring' }));
front = fill(front, 'ring:tile', ringSvg(28));
// and between Noise and Signal, Sig's ring on its dark disc
front = fill(front, 'ring:sn', ringSvg(30));
// The graph in the hero: its data and still picture by their versions, its size, its legend, the
// count of what its lines say, and the graph as text
const hashOf = (text) => createHash('sha256').update(text).digest('hex').slice(0, 10);
front = front.replace(/\/library\/data\/graph\.json(?:\?v=[0-9a-f]+)?"/g, `/library/data/graph.json?v=${hashOf(GRAPH.json)}"`);
front = front.replace(/\/img\/library-graph\.svg(?:\?v=[0-9a-f]+)?"/g, `/img/library-graph.svg?v=${hashOf(GRAPH.svg)}"`);
front = fill(front, 'graph:size', `<span>${GRAPH.data.counts.nodes.toLocaleString('en-US')} nodes</span><span>${GRAPH.data.counts.links.toLocaleString('en-US')} links</span>`);
front = fill(front, 'graph:legend', GRAPH.legend);
front = fill(front, 'graph:foot', GRAPH.foot);
front = fill(front, 'graph:lines', `${GRAPH.data.counts.lines.toLocaleString('en-US')} lines`);
front = fill(front, 'graph:text', GRAPH.text);
front = fill(front, 'signal-art:takeover', `<div class="viz-wide">${takeoverSvg({ w: 50, max: 300 })}</div><div class="viz-compact">${takeoverSvg({ w: 50, max: 300 }, { compact: true })}</div>`);
front = fill(front, 'signal-art:levels', LEVELS.map((l) => `<li>${sealSvg(l.key, 30)}<span><b>${e(l.name)}</b>${e(l.rule)}</span></li>`).join(''));
// The real example's level seal sits beside the level's name, so it's only a picture
front = fill(front, 'signal-art:seal', sealSvg('forum', 22).replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"'));
// Its one script, by its version
front = front.replace(/(<meta property="og:image" content="https:\/\/miraclehealth\.us\/og\.jpg)(?:\?v=[0-9a-z]+)?"/, `$1${ogVersion('/og.jpg')}"`);
front = front.replace(/<script type="module" src="\/home\.js(?:\?v=[0-9a-f]+)?"><\/script>/, `<script type="module" src="/home.js?v=${V.home}"></script>`);
front = front.replace(/<link rel="stylesheet" href="\/home\.css(?:\?v=[0-9a-f]+)?">/, `<link rel="stylesheet" href="/home.css?v=${V.homeCss}">`);
// Any Sig (the community's lime character) it draws is the kit's; the front page now shows Sig as
// its ring, so it draws none
const SIGS = [];
let sigN = 0;
front = front.replace(/<svg class="sig[ a-z]*"[\s\S]*?<\/svg>/g, (m) => {
  const spec = SIGS[sigN++];
  if (!spec) throw new Error('index.html has more Sigs than the build draws');
  return sigSvg(spec[0], spec[1], { dark: true, id: spec[2] });
});
if (sigN !== SIGS.length) throw new Error(`index.html has ${sigN} Sigs; the build draws ${SIGS.length}`);
out.set(frontFile, stampShell(front, 'index.html', { home: true, url: '/' }));
// The other hand-written pages: the same top, menu, footer and stylesheets
for (const f of ['privacy.html', 'terms.html', '404.html']) {
  const file = path.join(ROOT, f);
  out.set(file, stampShell(fs.readFileSync(file, 'utf8'), f, { url: f === '404.html' ? '/404' : `/${f.replace(/\.html$/, '')}` }));
}

let stale = 0;
for (const [file, html] of out) {
  if (CHECK) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== html) { console.error(`out of date: ${path.relative(ROOT, file)}`); stale += 1; }
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
}
// Pages for compounds no longer in the catalog go
const known = new Set([...catalog.map((c) => c.id), ...GUIDES.map((g) => g.id)]);
for (const d of fs.readdirSync(LIB, { withFileTypes: true })) {
  if (d.isDirectory() && !['data', 'research'].includes(d.name) && !known.has(d.name)) {
    if (CHECK) { console.error(`left over: library/${d.name}`); stale += 1; } else fs.rmSync(path.join(LIB, d.name), { recursive: true });
  }
}
// A compound taken off the body map loses its file
for (const f of fs.existsSync(BODY_DIR) ? fs.readdirSync(BODY_DIR) : []) {
  const file = path.join(BODY_DIR, f);
  if (!out.has(file)) { if (CHECK) { console.error(`left over: library/data/body/${f}`); stale += 1; } else fs.rmSync(file); }
}
if (CHECK && stale) process.exit(1);
console.log(`${CHECK ? 'checked' : 'wrote'} the library: ${catalog.length} compounds, ${entries.size} fact sheets`);
