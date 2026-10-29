#!/usr/bin/env node
// Builds the public library at miraclehealth.us/library from library/data:
//   catalog.json       every compound and blend in the community's library (from its database)
//   entries/<id>.json  the fact sheets, each claim checked against a source we opened
//   uses.json          the twelve goals and the uses members report on (the community's list)
// Writes library/index.html, library/<id>/index.html (one per compound), library/data/index.json
// (what Miracle AI reads to find and rank compounds), the Miracle AI page (ai/index.html) and
// sitemap.xml. The pages are static; library/library.js adds search and filters, and fills in
// the live Community Signal from community.miraclehealth.us/snapshot.json; ai/ai.js is the chat.
// Run: node scripts/build_library.mjs   (--check fails if the committed pages are out of date)
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { roseSvg, flowSvg, takeoverSvg, sealSvg, LEVELS } from '../library/signalviz.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'library');
const DATA = path.join(LIB, 'data');
const SITE = 'https://miraclehealth.us';
const COMMUNITY = 'https://community.miraclehealth.us';
// Miracle AI's chat: the ask function in the community's live Supabase project
// (miracle-health-community, supabase/functions/ask). The address isn't secret.
const ASK_URL = 'https://nerfymdslkhopsomwriv.supabase.co/functions/v1/ask';
const CHECK = process.argv.includes('--check');

const catalog = JSON.parse(fs.readFileSync(path.join(DATA, 'catalog.json'), 'utf8'));
const uses = JSON.parse(fs.readFileSync(path.join(DATA, 'uses.json'), 'utf8'));
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
// Not an approved medicine: blood-marker lists describe what a trial or clinician would check
const UNAPPROVED = new Set(['investigational', 'not_approved', 'category2', 'under_review']);

// ---------------------------------------------------------------------------
// The page around everything
// ---------------------------------------------------------------------------
// Every page asks for the stylesheets and script by a version made from their contents, so a
// browser or GitHub's cache never pairs a new page with an old stylesheet (GitHub Pages caches
// files for 10 minutes)
const version = (...files) => createHash('sha256').update(files.map((f) => fs.readFileSync(path.join(ROOT, f))).join('\n')).digest('hex').slice(0, 10);
const V = {
  css: version('styles.css'), lib: version('library/library.css'), js: version('library/library.js', 'library/signalviz.js'),
  aiCss: version('ai/ai.css'), aiJs: version('ai/ai.js'),
  pkCss: version('ai/packet.css'), pkJs: version('ai/packet.js'), qr: version('ai/vendor/qrcode.js'),
};

// The library's banner photo, in three widths
const BANNER = { src: '/img/library-1600.webp', srcset: '/img/library-960.webp 960w, /img/library-1600.webp 1600w, /img/library-2560.webp 2560w' };

function page({
  title, description, url, body, current = 'library', preload = '', bodyClass = 'lib',
  styles = [`/library/library.css?v=${V.lib}`], script = `/library/library.js?v=${V.js}`, scripts = [script], connect = COMMUNITY, head = '',
}) {
  const nav = [['/library/', 'Library', 'library'], ['/ai/', 'Miracle AI', 'ai'], ['/#signal', 'The Signal', 'signal'], ['/#how', 'How it works', 'how']];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#0C1413">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; connect-src 'self' ${connect}; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Miracle Health">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:image" content="${SITE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>${preload ? `\n${preload}` : ''}${head ? `\n${head}` : ''}
<link rel="stylesheet" href="/styles.css?v=${V.css}">
${styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n')}
${scripts.map((src) => `<script type="module" src="${src}"></script>`).join('\n')}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>

<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><img src="/logo.webp" alt="Miracle Health" width="80" height="28"></a>
    <nav class="top-nav" aria-label="Main">
      ${nav.map(([href, label, key]) => `<a href="${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
    </nav>
    <a class="top-link" href="${COMMUNITY}/">Sign in</a>
    <a class="btn lime sm" href="${COMMUNITY}/">Join</a>
    <a class="menu-btn" href="#menu" aria-label="Open the menu"><span aria-hidden="true"></span></a>
  </div>
</header>
<nav class="menu-panel" id="menu" aria-label="Menu">
  <a class="menu-close" href="#_" aria-label="Close the menu"><span aria-hidden="true"></span></a>
  ${nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n  ')}
  <a href="${COMMUNITY}/">Sign in</a>
  <a class="btn lime" href="${COMMUNITY}/">Join the community</a>
</nav>

<main id="main">
${body}
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-row">
      <img src="/logo.webp" alt="Miracle Health" width="69" height="24">
      <nav class="foot-links" aria-label="Site"><a href="/library/">Library</a><a href="/ai/">Miracle AI</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a class="mail" href="mailto:hello@miraclehealth.us">hello@miraclehealth.us</a></nav>
    </div>
    <div class="foot-row">
      <p>Experiences and published evidence, not medical advice. Talk to a clinician before you start, stop or change anything. In a crisis, call or text 988 (US).</p>
      <p class="copy">© 2026 Miracle Health</p>
    </div>
  </div>
</footer>
</body>
</html>
`;
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
    <span class="lc-badges">${f ? `<span class="ev ev-${grade}">${e(GRADE[grade]?.[0] || grade)}</span><span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.label)}</span>` : c.kind === 'blend' ? '<span class="st st-blend">Blend</span>' : '<span class="ev ev-pending">Being checked</span>'}</span>
  </a>`;
}

function indexPage() {
  // Fact sheets first, then the rest, each A to Z (the page's default order; the script re-sorts)
  const sorted = [...catalog].sort((a, b) => (entries.has(b.id) - entries.has(a.id)) || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  const checked = catalog.filter((c) => entries.has(c.id)).length;
  const counts = Object.fromEntries(FAMILIES.map((f) => [f, catalog.filter((c) => c.family === f).length]));
  const flowData = { sources: [{ name: 'Reddit', n: 0 }, { name: 'YouTube', n: 0 }, { name: 'Podcasts', n: 0 }, { name: 'Forums & reviews', n: 0 }], share: 0, reports: 0, sames: 0, signals: 0, levels: {}, weight: 50 };
  const body = `<section class="lib-hero">
  <img class="lib-hero-photo" src="${BANNER.src}" srcset="${BANNER.srcset}" sizes="100vw" alt="" width="2560" height="1348" fetchpriority="high">
  <div class="wrap lib-hero-in">
    <div>
      <p class="kick lime live"><i aria-hidden="true"></i>The Library · live community data</p>
      <h1>Every compound,<br> checked.</h1>
      <p class="lede">What each peptide, hormone, supplement and medication is, what the studies actually show, the risks and the blood markers to watch, checked against FDA labels, NIH fact sheets and published trials. Next to it, the Community Signal: what people who took it report.</p>
    </div>
    <dl class="lib-stats">
      <div><dt>Compounds</dt><dd>${catalog.length}</dd></div>
      <div><dt>Fact sheets checked</dt><dd>${checked}</dd></div>
      <div><dt>Community Signals</dt><dd data-live="signals">–</dd></div>
      <div><dt>First-hand reports</dt><dd data-live="reports">–</dd></div>
    </dl>
  </div>
</section>

<section class="wrap lib-tools" aria-label="Find a compound">
  <div class="lib-search">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    <input type="search" id="q" placeholder="Search compounds, brands and nicknames" aria-label="Search the library" autocomplete="off">
  </div>
  <div class="lib-chips" role="group" aria-label="Family">
    <button type="button" data-family="" aria-pressed="true">All <span>${catalog.length}</span></button>
    ${FAMILIES.map((f) => `<button type="button" data-family="${f}" aria-pressed="false">${f} <span>${counts[f]}</span></button>`).join('\n    ')}
  </div>
  <div class="lib-filters">
    <label><span>Goal</span><select id="goal"><option value="">Any goal</option>${uses.goals.map((g) => `<option value="${g.id}">${e(g.label)}</option>`).join('')}</select></label>
    <label><span>Evidence</span><select id="ev"><option value="">Any evidence</option>${Object.entries(GRADE).filter(([k]) => k !== 'anecdotal').map(([k, [l]]) => `<option value="${k}">${e(l)}</option>`).join('')}</select></label>
    <label><span>Sort</span><select id="sort"><option value="checked">Fact sheets first</option><option value="name">A to Z</option><option value="signal">Community Signal</option><option value="evidence">Strongest evidence</option></select></label>
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
        <p class="kick lime">// Two kinds of evidence</p>
        <h2 id="two-h">What studies show. What people report.</h2>
      </div>
      <p class="sec-note">Side by side on every page, never mixed together.</p>
    </div>
    <div class="explain-grid">
      <div class="glass deep">
        <p class="mono lime">// The fact sheet</p>
        <h3>Checked against the sources</h3>
        <p>Every claim links to the FDA label, NIH fact sheet, trial or review it came from. Each benefit says what kind of evidence backs it, from randomized trials in people to studies in rats. No doses, no sellers.</p>
        <ul class="grade-key">${Object.entries(GRADE).filter(([k]) => k !== 'anecdotal').map(([k, [l, d]]) => `<li><span class="ev ev-${k}">${e(l)}</span><span>${e(d)}</span></li>`).join('')}</ul>
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
    description: `${catalog.length} peptides, hormones, supplements and medications: what each is, the evidence, risks and blood markers to watch, checked against primary sources, next to what people who took it report.`,
    url: '/library/',
    body,
    preload: `<link rel="preload" as="image" href="${BANNER.src}" imagesrcset="${BANNER.srcset}" imagesizes="100vw" fetchpriority="high">`,
  });
}

// ---------------------------------------------------------------------------
// One compound
// ---------------------------------------------------------------------------
function list(items, cls = '') {
  return items && items.length ? `<ul class="${cls}">${items.map((x) => `<li>${e(x)}</li>`).join('')}</ul>` : '';
}

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
      <h2>What it is</h2>
      <p class="big">${e(f.what_it_is)}</p>
      <div class="ev-box"><span class="ev ev-${f.evidence.grade}">${e(g[0])}</span><p>${e(f.evidence.why)}</p></div>
    </section>

    <section class="le-sec" id="benefits">
      <h2>What it may do</h2>
      <ul class="claims">${(f.benefits || []).map((b) => `<li><span class="ev ev-${b.evidence}">${e(GRADE[b.evidence]?.[0] || b.evidence)}</span><p>${e(b.claim)} ${refs(b.sources)}</p></li>`).join('')}</ul>
    </section>

    <section class="le-sec" id="risks">
      <h2>Risks and side effects</h2>
      <ul class="claims risks">${(f.risks || []).map((r) => `<li><span class="hc hc-${r.how_common}">${e(HOW_COMMON[r.how_common] || r.how_common)}</span><p>${e(r.risk)} ${refs(r.sources)}</p></li>`).join('')}</ul>
      <div class="two">
        <div><h3>Who should avoid it or check with a clinician first</h3>${list(f.avoid_if, 'dots')}</div>
        <div><h3>Interactions</h3>${list(f.interactions, 'dots')}</div>
      </div>
    </section>

    <section class="le-sec" id="labs">
      <h2>Blood markers to watch</h2>
      ${UNAPPROVED.has(f.status_us.key) && ((labs.before || []).length || (labs.during || []).length) ? '<p class="lab-note">Not an approved medicine. These are checks a clinician or a clinical trial would use, not a plan for taking it on your own.</p>' : ''}
      <div class="labs">
        <div class="lab-col"><p class="mono">Before starting</p>${(labs.before || []).length ? list(labs.before, 'marks') : '<p class="muted">None routinely needed.</p>'}</div>
        <div class="lab-col"><p class="mono">While taking it</p>${(labs.during || []).length ? list(labs.during, 'marks') : '<p class="muted">None routinely needed.</p>'}</div>
      </div>
      <p class="lab-why">${e(labs.why || '')}</p>
    </section>

    ${studies ? `<section class="le-sec" id="studies">
      <h2>Key studies</h2>
      <ol class="studies">${studies}</ol>
    </section>` : ''}

    <section class="le-sec" id="ask">
      <h2>Questions for your clinician</h2>
      ${list(f.ask_your_clinician, 'asks')}
    </section>

    <section class="le-sec" id="status">
      <h2>Status in the US</h2>
      <p><span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span> <b>${e(f.status_us.label)}.</b> ${e(f.status_us.note)} ${refs(f.status_us.sources)}</p>
    </section>

    <section class="le-sec" id="sources">
      <h2>Sources</h2>
      <ol class="sources">${(f.sources || []).map((s) => `<li id="src-${s.n}"><a href="${e(s.url)}" rel="noopener" target="_blank">${e(s.title)}</a><span>${e(s.publisher)}${s.year ? `, ${e(s.year)}` : ''}</span></li>`).join('')}</ol>
      <p class="checked">Fact-checked against these sources on ${date(f.checked)}. Clinician review pending. Spotted something wrong? <a href="mailto:hello@miraclehealth.us?subject=${encodeURIComponent(`Library: ${c.name}`)}">Tell us</a>.</p>
    </section>`;
}

function pendingSheet(c) {
  const parts = (c.parts || []).map((p) => byId.get(p)).filter(Boolean);
  if (c.kind === 'blend') {
    return `<section class="le-sec" id="what">
      <h2>What’s in it</h2>
      <p class="big">${e(c.name)} is a pre-mixed blend of ${parts.map((p) => e(p.name)).join(' and ')}. Each part has its own fact sheet, and the blend has its own Community Signal, from reports of the blend itself.</p>
      <div class="parts">${parts.map((p) => {
        const pf = entries.get(p.id);
        return `<a class="part" href="/library/${p.id}/"><span class="lc-fam">${e(familyLine(p))}</span><b>${e(p.name)}</b>${pf ? `<span>${e(pf.summary)}</span><span class="lc-badges"><span class="ev ev-${pf.evidence.grade}">${e(GRADE[pf.evidence.grade]?.[0])}</span><span class="st st-${pf.status_us.key}">${e(STATUS[pf.status_us.key])}</span></span>` : '<span class="muted">Fact sheet in progress.</span>'}</a>`;
      }).join('')}</div>
    </section>`;
  }
  return `<section class="le-sec pending-box" id="what">
      <h2>Fact sheet in progress</h2>
      <p class="big">We’re checking ${e(c.name)} against FDA labels, NIH fact sheets and published studies. Every claim on a finished fact sheet links to the source it came from, so it takes a little while. Until then, here’s what members report.</p>
    </section>`;
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
    ['Evidence', `<span class="ev ev-${f.evidence.grade}">${e(GRADE[f.evidence.grade]?.[0])}</span>`],
    mainGoals.length ? ['Mostly used for', e(mainGoals.join(', '))] : null,
    ['Blood markers', (f.labs?.before || []).length || (f.labs?.during || []).length
      ? `<a href="#labs">${[(f.labs.before || []).length ? `${f.labs.before.length} before starting` : null, (f.labs.during || []).length ? `${f.labs.during.length} while taking it` : null].filter(Boolean).join(' · ')}</a>`
      : 'None routinely needed'],
    ['Checked', `${date(f.checked)} against <a href="#sources">${(f.sources || []).length} sources</a>`],
  ].filter(Boolean) : [];
  const toc = f ? [['what', 'What it is'], ['benefits', 'What it may do'], ['risks', 'Risks'], ['labs', 'Blood markers'], ...(f.studies?.length ? [['studies', 'Key studies']] : []), ['ask', 'Ask your clinician'], ['status', 'US status'], ['sources', 'Sources']] : [];
  const desc = f ? `${f.summary} Evidence, risks, blood markers to watch and sources, next to what people who took it report.` : `${c.name}: what members report, and its fact sheet as soon as it’s checked against primary sources.`;
  const body = `<div class="lib-entry" data-id="${c.id}" data-name="${e(c.name)}">
<section class="le-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/library/">Library</a><span aria-hidden="true">/</span><a href="/library/?family=${encodeURIComponent(c.family)}">${e(c.family)}</a></nav>
    <p class="kick lime">${e(familyLine(c))}</p>
    <h1${c.name.length > 22 ? ' class="long"' : ''}>${e(c.name)}</h1>
    ${shownAliases(c).length ? `<p class="aka">Also called ${shownAliases(c).map(e).join(', ')}</p>` : ''}
    ${f ? `<p class="lede">${e(f.summary)}</p>` : ''}
    <div class="le-badges">
      ${f ? `<span class="st st-${f.status_us.key}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span>
      <span class="ev ev-${f.evidence.grade}">${e(GRADE[f.evidence.grade]?.[0])}</span>
      <span class="check">Fact-checked ${date(f.checked)} · clinician review pending</span>` : c.kind === 'blend' ? '<span class="st st-blend">Blend</span>' : '<span class="ev ev-pending">Fact sheet in progress</span>'}
    </div>
  </div>
</section>

<section class="le-glance" aria-label="At a glance">
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
      <a class="btn lime sm sig-cta" href="${COMMUNITY}/#/s/${encodeURIComponent(c.id)}">Share how it went</a>
    </div>
  </div>
</section>

<div class="wrap le-body">
  <article class="le-main">
    ${f ? factSheet(c, f) : pendingSheet(c)}
    ${parentBlends.length ? `<section class="le-sec" id="blends"><h2>Also sold in blends</h2><div class="parts">${parentBlends.map((b) => `<a class="part" href="/library/${b.id}/"><span class="lc-fam">Blend</span><b>${e(b.name)}</b></a>`).join('')}</div></section>` : ''}
  </article>
  <aside class="le-side">
    ${toc.length ? `<nav class="toc" aria-label="On this page"><p class="mono">On this page</p>${toc.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</nav>` : ''}
    <div class="side-card">
      <p class="mono">Took it?</p>
      <p>Your first-hand report moves the ${e(c.name)} Signal, whether it worked or not.</p>
      <a class="btn lime sm" href="${COMMUNITY}/#/s/${encodeURIComponent(c.id)}">Go to its space</a>
    </div>
    <p class="side-note">Experiences and published evidence, not medical advice. No doses, no sellers.</p>
  </aside>
</div>
</div>`;
  return page({ title: `${c.name}: evidence, risks, blood markers · Miracle Health Library`, description: desc.slice(0, 300), url: `/library/${c.id}/`, body });
}

// ---------------------------------------------------------------------------
// What Miracle AI reads: every compound with what it needs to find and rank it
// ---------------------------------------------------------------------------
function aiIndex() {
  const nonzero = (g) => Object.fromEntries(Object.entries(g || {}).filter(([, v]) => Number(v) > 0));
  const checked = [...entries.values()].map((f) => f.checked || '').sort().pop() || '';
  return JSON.stringify({
    note: 'Every compound and blend in the Library, with the status, evidence grade and goals of the ones that have a fact sheet. Written by scripts/build_library.mjs for Miracle AI (miraclehealth.us/ai).',
    checked,
    goals: uses.goals,
    items: catalog.map((c) => {
      const f = entries.get(c.id);
      return {
        id: c.id, name: c.name, family: c.family, category: c.category, aliases: c.aliases || [], kind: c.kind, parts: c.parts || [],
        sheet: !!f,
        ...(f ? { status: f.status_us.key, status_label: f.status_us.label, grade: f.evidence.grade, goals: nonzero(f.goals), summary: f.summary } : {}),
      };
    }),
  }) + '\n';
}

// ---------------------------------------------------------------------------
// Miracle AI (miraclehealth.us/ai): the chat with four agents, and the member's own clinician last
// ---------------------------------------------------------------------------
const AGENTS = [
  ['safety', 'Safety agent', 'Screens every message for emergencies, signs of crisis, medicines and conditions, and reads every reply again before it stands.'],
  ['recommender', 'Recommender', 'Asks what it needs to know, like a clinician taking a history, then finds options in the Library’s fact sheets and the Community Signal and explains the evidence.'],
  ['synergy', 'Synergy auditor', 'Checks compounds together with your medicines and conditions: overlaps, risks that add up, interactions.'],
  ['builder', 'Stack builder', 'Lays out your stack, and options to discuss with your clinician. Never doses, never sellers.'],
  ['clinician', 'Your clinician', 'Your own licensed clinician, outside Miracle Health. Take them your review packet; until they’ve reviewed it, nothing here is a plan.'],
];
const STARTERS = [
  ['recovery', 'Recover from an injury', 'I keep straining a tendon. What could help it heal, what does the evidence say, and what should I ask a clinician about?'],
  ['muscle', 'Build muscle', 'I want to build muscle. Which supplements and peptides have real evidence in people, and what should I know before trying any?'],
  ['sleep', 'Sleep better', 'I want to sleep better. What has good evidence, and what is mostly hype?'],
  ['weight', 'Lose fat', 'I want to lose fat. What are the options, from supplements to prescription medicines, and how strong is the evidence for each?'],
  ['cognition', 'Focus and mood', 'I want sharper focus and a steadier mood. What has evidence behind it?'],
  ['longevity', 'Age well', 'I want to age well. What do peptides and supplements for healthy aging actually show in people?'],
];
const EXAMPLES = [
  'Is BPC-157 safe?',
  'What does the evidence say about creatine for strength?',
  'I take levothyroxine. Is ashwagandha OK for stress?',
  'Semaglutide or tirzepatide: how do they compare?',
];

function aiPage() {
  const agentList = (cls) => `<ol class="${cls}">${AGENTS.map(([key, name, what]) => `<li class="agent" data-agent="${key}"><span class="agent-node" aria-hidden="true"></span><span class="agent-text"><b>${e(name)}</b><span class="agent-what">${e(what)}</span><span class="agent-now" aria-live="off"></span></span></li>`).join('')}</ol>`;
  const body = `<div class="ai-app" id="ai" data-endpoint="${e(ASK_URL)}" data-qr="/ai/vendor/qrcode.js?v=${V.qr}">
  <section class="ai-chat" aria-label="Conversation with Miracle AI">
    <div class="ai-bar">
      <div class="ai-id"><span class="ai-sig" data-sig="40" aria-hidden="true"></span><span><h1>Miracle AI</h1><span class="ai-status" id="ai-status">Ready</span></span></div>
      <button class="ai-new" id="ai-new" type="button" hidden>New chat</button>
    </div>
    <div class="ai-thread" id="ai-thread" role="log" aria-label="Messages" aria-live="polite">
      <div class="ai-empty" id="ai-empty">
        <span class="ai-hello" data-sig="112" aria-hidden="true"></span>
        <h2 class="ai-title">Talk it through with Miracle AI.</h2>
        <p class="ai-lede">Ask what the evidence says about a peptide or supplement, or how to work toward a goal. Like a good clinician, Miracle AI asks a few questions so the answer fits you. Four AI agents check every answer against the Library’s fact sheets and the Community Signal, and your own clinician has the final say.</p>
        <div class="ai-starts" role="group" aria-label="Start with a goal">
          ${STARTERS.map(([goal, label, text]) => `<button type="button" class="ai-start" data-ask="${e(text)}" data-goal="${goal}"><span class="start-ico" aria-hidden="true"></span>${e(label)}</button>`).join('\n          ')}
        </div>
        <div class="ai-examples" role="group" aria-label="Or ask something specific">
          ${EXAMPLES.map((q) => `<button type="button" class="ai-example" data-ask="${e(q)}">${e(q)}</button>`).join('\n          ')}
        </div>
        <div class="ai-who">
          <h2>Who answers, and who decides</h2>
          ${agentList('agent-list')}
        </div>
      </div>
    </div>
    <form class="ai-dock" id="ai-form" novalidate>
      <div class="ai-composer">
        <label class="sr" for="ai-input">Message Miracle AI</label>
        <textarea id="ai-input" rows="1" maxlength="2000" placeholder="Ask about a goal, a compound or a combination" data-short="Ask about a goal or a compound"></textarea>
        <span class="ai-count" id="ai-count" aria-live="polite"></span>
        <button class="ai-send" id="ai-send" type="submit" aria-label="Send" disabled><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path class="i-send" d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><rect class="i-stop" x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg></button>
      </div>
    </form>
    <p class="ai-fine">For adults 18 and over. Miracle AI explains evidence; it doesn’t diagnose, give doses or name sellers. Your chat stays in this browser tab; messages go to our AI provider to write the answers and aren’t stored by Miracle Health. <a href="/privacy#ai">How messages are handled</a></p>
    <noscript><p class="ai-nojs">Miracle AI needs JavaScript. The <a href="/library/">Library</a> works without it.</p></noscript>
  </section>
  <aside class="ai-rail" aria-label="The agents">
    <div class="rail-head"><span class="rail-sig" data-sig="64" aria-hidden="true"></span><div><h2>The agents</h2><p id="rail-sub">Waiting for your first message</p></div></div>
    ${agentList('agent-rail')}
    <div class="rail-notes" id="rail-notes" hidden>
      <h2>In this conversation</h2>
      <div class="rail-chips" id="rail-chips"></div>
      <div class="rail-qs" id="rail-qs" hidden><h3>Questions for your clinician</h3><ul id="rail-qlist"></ul></div>
      <button type="button" class="rail-copy" id="rail-copy">Prepare clinician packet</button>
    </div>
  </aside>
</div>`;
  return page({
    title: 'Miracle AI · talk through peptides and supplements with four AI agents',
    description: 'Ask Miracle AI what the evidence says about peptides, supplements and hormones for your goals. Four AI agents check every answer against the Miracle Health Library and the Community Signal, and you take a review packet to your own clinician. No doses, no sellers.',
    url: '/ai/', body, current: 'ai', bodyClass: 'ai',
    styles: [`/library/library.css?v=${V.lib}`, `/ai/ai.css?v=${V.aiCss}`, `/ai/packet.css?v=${V.pkCss}`],
    scripts: [`/ai/packet.js?v=${V.pkJs}`, `/ai/ai.js?v=${V.aiJs}`],
    connect: new URL(ASK_URL).origin,
  });
}

// The page a clinician opens from a shared packet: the packet travels in the link after "#", so
// it never reaches this site's server; the page reads it in the browser
function packetPage() {
  const body = `<div class="packet-root" id="packet-root">
  <section class="pk-welcome">
    <h1>Clinician review packet</h1>
    <p>This page shows a review packet that a patient made with Miracle AI and shared with you as a link or QR code. The packet travels inside the link itself, so Miracle Health never receives or keeps it.</p>
    <p>If you were sent here without a packet, ask for the link or the code again. Patients can make one at <a href="/ai/">miraclehealth.us/ai</a>.</p>
  </section>
  <noscript><p class="pk-loading">Opening a packet needs JavaScript.</p></noscript>
</div>`;
  return page({
    title: 'Clinician review packet · Miracle Health',
    description: 'A clinician review packet a patient made with Miracle AI. The packet travels inside the shared link; Miracle Health never receives it.',
    url: '/ai/packet/', body, current: 'ai', bodyClass: 'packet-page',
    styles: [`/ai/packet.css?v=${V.pkCss}`], scripts: [`/ai/packet.js?v=${V.pkJs}`],
    connect: '', head: '<meta name="robots" content="noindex">',
  });
}

// ---------------------------------------------------------------------------
// Write it all
// ---------------------------------------------------------------------------
const out = new Map();
out.set(path.join(LIB, 'index.html'), indexPage());
for (const c of catalog) out.set(path.join(LIB, c.id, 'index.html'), entryPage(c));
out.set(path.join(DATA, 'index.json'), aiIndex());
out.set(path.join(ROOT, 'ai', 'index.html'), aiPage());
out.set(path.join(ROOT, 'ai', 'packet', 'index.html'), packetPage());
const urls = ['/', '/ai/', '/library/', ...catalog.map((c) => `/library/${c.id}/`), '/privacy', '/terms'];
out.set(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`);

// The front page's Signal section draws the takeover line and the levels with the same code
const frontFile = path.join(ROOT, 'index.html');
const fill = (html, key, inner) => {
  const re = new RegExp(`(<!-- signal-art:${key} -->)[\\s\\S]*?(<!-- /signal-art:${key} -->)`);
  if (!re.test(html)) throw new Error(`index.html has no signal-art:${key} markers`);
  return html.replace(re, (_, a, b) => `${a}${inner}${b}`);
};
let front = fs.readFileSync(frontFile, 'utf8');
front = fill(front, 'takeover', `<div class="viz-wide">${takeoverSvg({ w: 50, max: 300 })}</div><div class="viz-compact">${takeoverSvg({ w: 50, max: 300 }, { compact: true })}</div>`);
front = fill(front, 'levels', LEVELS.map((l) => `<li>${sealSvg(l.key, 30)}<span><b>${e(l.name)}</b>${e(l.rule)}</span></li>`).join(''));
out.set(frontFile, front.replace(/href="(\/?)styles\.css(\?v=[0-9a-f]+)?"/, `href="$1styles.css?v=${V.css}"`));
// The other hand-written pages share the site stylesheet
for (const f of ['privacy.html', 'terms.html', '404.html']) {
  const file = path.join(ROOT, f);
  const html = fs.readFileSync(file, 'utf8');
  if (!/href="\/?styles\.css(\?v=[0-9a-f]+)?"/.test(html)) throw new Error(`${f} has no styles.css link`);
  out.set(file, html.replace(/href="(\/?)styles\.css(\?v=[0-9a-f]+)?"/, `href="$1styles.css?v=${V.css}"`));
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
const known = new Set(catalog.map((c) => c.id));
for (const d of fs.readdirSync(LIB, { withFileTypes: true })) {
  if (d.isDirectory() && !['data', 'research'].includes(d.name) && !known.has(d.name)) {
    if (CHECK) { console.error(`left over: library/${d.name}`); stale += 1; } else fs.rmSync(path.join(LIB, d.name), { recursive: true });
  }
}
if (CHECK && stale) process.exit(1);
console.log(`${CHECK ? 'checked' : 'wrote'} the library: ${catalog.length} compounds, ${entries.size} fact sheets`);
