// The pages around the Library, built with it by scripts/build_library.mjs (which passes in its
// page template, words and data):
//   /about/                  who runs Miracle Health, how it's paid for, how sheets are checked,
//                            reviewers and corrections (library/data/about.json)
//   /status/                 where each compound stands with the FDA, from the fact sheets
//   /goals/, /goals/<goal>/  the compounds people take for each of the twelve goals
//   /compare/, /compare/<a>-vs-<b>/   two compounds side by side, from their fact sheets
//   /weekly/, /weekly/<n>/   The Signal, the weekly email: signing up, and each issue
//                            (library/data/weekly/<n>.json), with the email itself at
//                            /weekly/<n>/email.html for the community's newsletter function
//   /founders/               the first 100 reporters
// Live numbers (the Community Signal on the cards, the founders' count) come from pages/pages.js;
// every page reads fine without it.
import fs from 'node:fs';
import path from 'node:path';

// The weekly email's server function, in the community's live Supabase project
// (miracle-health-community, supabase/functions/newsletter). The address isn't secret.
export const NEWSLETTER_URL = 'https://nerfymdslkhopsomwriv.supabase.co/functions/v1/newsletter';
export const NEWSLETTER_ORIGIN = new URL(NEWSLETTER_URL).origin;

// The weekly email's sign-up form: a plain form (it works with no script), sent to the
// newsletter function, which comes back to /weekly/ to say what happened. "website" is a field
// people never see: bots fill it in.
export function signupForm(e, { source, id, cls = '', button = 'Get it weekly', label = '' }) {
  return `<form class="news-form ${cls}" action="${NEWSLETTER_URL}" method="post">
    ${label ? `<label class="nf-label" for="${id}">${label}</label>` : `<label class="mh-sr" for="${id}">Your email address</label>`}
    <div class="nf-row"><input id="${id}" type="email" name="email" required maxlength="254" autocomplete="email" inputmode="email" placeholder="Your email address"><button class="btn bone" type="submit">${e(button)}</button></div>
    <input type="hidden" name="source" value="${e(source)}">
    <span class="nf-hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></span>
    <p class="nf-note">Free, once a week. We email you a link to confirm first; unsubscribe in one click. <a href="/privacy#weekly">How we handle your address</a>.</p>
  </form>`;
}

// The comparisons: two compounds people often weigh against each other, both with fact sheets
// (a third item gives the page's address when the names would make a clumsy one)
export const PAIRS = [
  ['semaglutide', 'tirzepatide'], ['tirzepatide', 'retatrutide'], ['semaglutide', 'liraglutide'], ['orforglipron', 'semaglutide'],
  ['bpc157', 'tb500'], ['cjc1295', 'ipamorelin', 'cjc-1295-vs-ipamorelin'], ['sermorelin', 'tesamorelin'], ['nad', 'nmn'],
  ['modafinil', 'armodafinil'], ['finasteride', 'dutasteride'], ['sildenafil', 'tadalafil'], ['semax', 'selank'],
];
export const slugOf = (n) => n.toLowerCase().replace(/\+/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function buildPages(ctx) {
  const {
    ROOT, SITE, COMMUNITY, page, e, catalog, entries, byId, uses, baselines, STATUS, GRADE, GRADE_ORDER, GOAL_SHORT,
    evPill, date, card, askLink, version, shownAliases,
  } = ctx;
  const files = new Map();
  const urls = [];
  const V = { css: version('pages/pages.css'), js: version('pages/pages.js', 'library/signalviz.js') };
  const STYLES = [`/library/library.css?v=${ctx.V.lib}`, `/pages/pages.css?v=${V.css}`];
  const SCRIPTS = [`/pages/pages.js?v=${V.js}`];
  // A page's share image, when scripts/og_images.mjs has made one
  const og = (slug) => (fs.existsSync(path.join(ROOT, 'img', 'og', `${slug}.jpg`)) ? `/img/og/${slug}.jpg` : '/og.jpg');
  const add = (url, html) => { files.set(path.join(ROOT, ...url.split('/').filter(Boolean), 'index.html'), html); urls.push(url); };
  const sheets = [...entries.values()];
  const lastChecked = sheets.map((f) => f.checked).sort().pop();
  const nameOf = (id) => byId.get(id)?.name || id;
  const lower = (s) => String(s).charAt(0).toLowerCase() + String(s).slice(1);
  // [words](link) in the data files become links; everything else is escaped
  const inline = (t, abs = false) => e(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, words, href) => {
    const url = href.startsWith('/') && abs ? `${SITE}${href}` : href;
    return `<a href="${url}">${words}</a>`;
  });
  const fill = (t) => String(t).replaceAll('{{sheets}}', String(entries.size)).replaceAll('{{compounds}}', String(catalog.length));
  // An issue's headline: its subject without "The Signal #n: "
  const headline = (i) => { const t = i.subject.replace(/^The Signal #\d+:\s*/, ''); return t.charAt(0).toUpperCase() + t.slice(1); };
  const docHead = (kick, title, sub = '') => `<div class="doc-head">
    <div class="wrap">
      <p class="kick">${e(kick)}</p>
      <h1>${title}</h1>
      ${sub ? `<p>${sub}</p>` : ''}
    </div>
  </div>`;
  const stPill = (f) => `<span class="st st-${e(f.status_us.key)}">${e(STATUS[f.status_us.key] || f.status_us.key)}</span>`;
  const sig = (id) => `<span class="lc-sig pg-sig" data-sig="${e(id)}" hidden></span>`;

  // -------------------------------------------------------------------------
  // About
  // -------------------------------------------------------------------------
  const about = JSON.parse(fs.readFileSync(path.join(ROOT, 'library', 'data', 'about.json'), 'utf8'));
  {
    const reviewers = (about.reviewers || []).filter((r) => r && r.name);
    const corrections = (about.corrections || []).filter((c) => c && c.what);
    const body = `${docHead('About', 'No miracles. Just what happened.', `Updated ${date(about.updated)}`)}

  <article class="wrap doc about">
    <p class="intro">Miracle Health is a free place to look up peptides, hormones, supplements and medications, ask about them, and say how they went. It has three parts, kept apart and always named: <a href="/library/">the Library</a>, where each fact sheet is checked against its sources; <a href="${COMMUNITY}/">the community</a>, where members share first-hand reports; and <a href="/ai/">Ask Sig</a>, where Sig, Miracle Health’s AI, answers from both.</p>

    <h2 id="who">Who runs it</h2>
    <p>Miracle Health is independent and run by its founder${about.founder ? `, ${e(about.founder)}` : ''}. It isn’t a clinic, a pharmacy or a seller, and nobody here can examine you, diagnose you or prescribe anything. Write to us at <a href="mailto:hello@miraclehealth.us">hello@miraclehealth.us</a>; a person reads every email.</p>

    <h2 id="money">How it’s paid for</h2>
    <p>It’s free for everyone, and today it’s paid for by its founder. There are no ads, no sponsors and no affiliate links, and nobody can pay to be in the Library, in Sig’s answers or in the Community Signal. We never sell what members share.</p>
    <p>If Miracle Health ever sells anything of its own, it will be kept apart: never in the Library, never in Sig’s answers, never counted in the Signal. And this page will say so before it happens.</p>

    <h2 id="checked">How fact sheets are checked</h2>
    <p>Each fact sheet is checked claim by claim against sources we opened: FDA labels and documents, NIH fact sheets and published trials. Every benefit says what kind of evidence backs it, from randomized trials in people to studies in rats, and every claim links to its source. Each sheet shows the date it was checked; ${entries.size} of ${catalog.length} compounds have one so far, and the rest say they’re still being checked. <a href="/method/">How the numbers are made</a> explains the grades, how reports are read and weighted, and the side-effect watch.</p>

    ${reviewers.length ? `<h2 id="reviewers">Clinician and pharmacist review</h2>
    <ul>${reviewers.map((r) => `<li><b>${e(r.name)}</b>${r.role ? `, ${e(r.role)}` : ''}: ${e(r.reviewed || 'reviewed fact sheets')}${r.date ? `, ${date(r.date)}` : ''}</li>`).join('')}</ul>

    ` : ''}    <h2 id="never">What we never do</h2>
    <ul>
      <li>No doses, amounts, schedules or how to take or inject anything, for any compound.</li>
      <li>No sellers, brands, prices or where to get something.</li>
      <li>No diagnosis, and never start, stop or change a prescribed medicine: that’s for your doctor.</li>
      <li>No health records: Sig keeps nothing you write, and the community holds only what members choose to post.</li>
    </ul>

    <h2 id="corrections">Corrections</h2>
    <p>Found a mistake? <a href="mailto:hello@miraclehealth.us?subject=Correction">Tell us</a> which page and what’s wrong, with a source if you have one. When we fix a fact sheet, its “checked” date changes, and significant corrections are listed here.</p>
    ${corrections.length ? `<ul class="fixes">${corrections.map((c) => `<li><b>${date(c.date)}</b>, ${c.url ? `<a href="${e(c.url)}">${e(c.page || c.url)}</a>` : e(c.page || '')}: ${e(c.what)}</li>`).join('')}</ul>` : '<p class="muted-line">No significant corrections so far.</p>'}

    <h2 id="contact">Contact</h2>
    <p><a href="mailto:hello@miraclehealth.us">hello@miraclehealth.us</a>. See also the <a href="/privacy">privacy notice</a> and the <a href="/terms">terms of use</a>.</p>
  </article>`;
    add('/about/', page({
      title: 'About · No miracles. Just what happened. · Miracle Health',
      description: 'Who runs Miracle Health, how it’s paid for, how fact sheets are checked, and corrections.',
      url: '/about/', body, current: '', bodyClass: 'doc-page', styles: [`/pages/pages.css?v=${V.css}`], scripts: [], ogImage: og('about'),
    }));
  }

  // -------------------------------------------------------------------------
  // Where each compound stands with the FDA
  // -------------------------------------------------------------------------
  const GROUPS = [
    ['under_review', 'Under FDA review', 'Off FDA’s safety-risk list, or waiting on a compounding decision: the ones moving now.'],
    ['category2', 'On FDA’s safety-risk list', 'FDA lists them as raising significant safety risks when compounded (Category 2), for pharmacies, outsourcing facilities or both.'],
    ['investigational', 'In clinical trials', 'Not approved in the US: in trials, or waiting on an FDA decision.'],
    ['not_approved', 'Not approved', 'No approved US product.'],
    ['unclear', 'Status unclear', 'Not on any FDA list we could find.'],
    ['restricted', 'A special case', 'Read the note.'],
    ['compounded', 'Compounded by prescription', 'No approved product for this form or use, but pharmacies may compound it on a prescription, for now or under conditions.'],
    ['approved', 'FDA-approved', 'Approved for at least one use. Using an approved medicine for anything else is off-label.'],
    ['otc', 'Over the counter', 'Sold without a prescription.'],
    ['supplement', 'Dietary supplements', 'Sold as supplements, which FDA doesn’t approve before they’re sold.'],
  ];
  {
    const byStatus = new Map(GROUPS.map(([k]) => [k, []]));
    for (const f of sheets) (byStatus.get(f.status_us.key) || byStatus.set(f.status_us.key, []).get(f.status_us.key)).push(f);
    for (const list of byStatus.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
    const groups = [...byStatus.entries()].filter(([, list]) => list.length);
    const label = (k) => GROUPS.find((g) => g[0] === k)?.[1] || STATUS[k] || k;
    const row = (f) => `<article class="st-row" id="${e(f.id)}-status">
        <h3><a href="/library/${e(f.id)}/">${e(f.name)}</a></h3>
        <p class="st-label">${e(f.status_us.label)}</p>
        <p class="st-note">${e(f.status_us.note || '')}</p>
        <p class="st-when">Checked ${date(f.checked)} · <a href="/library/${e(f.id)}/#status">Its sources</a></p>
      </article>`;
    const body = `${docHead('Status tracker', 'Where each compound stands with the FDA', `Checked ${date(lastChecked)} · ${entries.size} compounds`)}

  <div class="wrap pg-wrap">
    <p class="pg-intro">Whether a compound is approved, can be compounded by a pharmacy, or is on FDA’s list of substances with significant safety risks, compound by compound, from the Library’s fact sheets. It’s moving fast this year: each line says when we last checked it, and links to the FDA documents behind it.</p>

    <details class="pg-terms">
      <summary>What the words mean</summary>
      <dl>
        <div><dt>FDA-approved</dt><dd>FDA has approved a product for at least one use. Using it for anything else is off-label, which a prescriber can choose to do.</dd></div>
        <div><dt>Compounding</dt><dd>A pharmacy making a medicine for a patient’s prescription. Pharmacies (503A) and outsourcing facilities (503B) follow different rules.</dd></div>
        <div><dt>Category 1</dt><dd>On FDA’s interim policy, substances still being evaluated, which licensed pharmacies may compound under set conditions while FDA decides.</dd></div>
        <div><dt>Category 2</dt><dd>Substances FDA says raise significant safety risks when compounded.</dd></div>
        <div><dt>Category 3</dt><dd>Substances nominated without enough information for FDA to evaluate them.</dd></div>
        <div><dt>Dietary supplement</dt><dd>Sold without FDA approval; the maker is responsible for its safety and labeling.</dd></div>
      </dl>
    </details>

    <nav class="pg-jump" aria-label="Statuses">${groups.map(([k, list]) => `<a href="#st-${e(k)}">${e(label(k))} <span>${list.length}</span></a>`).join('')}</nav>

    ${groups.map(([k, list]) => `<section class="st-group" id="st-${e(k)}" aria-labelledby="st-${e(k)}-h">
      <div class="st-group-h"><h2 id="st-${e(k)}-h">${e(label(k))}</h2><span class="st st-${e(k)}">${list.length}</span></div>
      <p class="st-desc">${e(GROUPS.find((g) => g[0] === k)?.[2] || '')}</p>
      <div class="st-rows">
      ${list.map(row).join('\n      ')}
      </div>
    </section>`).join('\n    ')}

    <p class="pg-foot">${catalog.length - entries.size} more compounds are still being checked; their pages in the <a href="/library/">Library</a> say what we know so far. Status isn’t advice: what’s legal to compound or sell doesn’t say whether something is right for you. Spotted something out of date? <a href="mailto:hello@miraclehealth.us?subject=Status%20tracker">Tell us</a>.</p>
  </div>`;
    add('/status/', page({
      title: 'Peptide and supplement FDA status tracker · Miracle Health',
      description: `Where ${entries.size} peptides, hormones, supplements and medications stand with the FDA: approved, compoundable, on the safety-risk list or under review, each checked against FDA’s own documents.`,
      url: '/status/', body, current: 'library', bodyClass: 'lib pg', styles: STYLES, scripts: [], ogImage: og('status'),
    }));
  }

  // -------------------------------------------------------------------------
  // Goals
  // -------------------------------------------------------------------------
  const goalCards = (gid, min, max = 2) => catalog.filter((c) => {
    const f = entries.get(c.id);
    const v = f?.goals?.[gid] ?? 0;
    return f && v >= min && v < max;
  }).sort((a, b) => (GRADE_ORDER[entries.get(a.id).evidence.grade] ?? 9) - (GRADE_ORDER[entries.get(b.id).evidence.grade] ?? 9)
    || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  const goalStats = uses.goals.map((g) => ({ ...g, main: goalCards(g.id, 0.75), some: goalCards(g.id, 0.25, 0.75) }));
  {
    for (const g of goalStats) {
      const useIds = uses.uses.filter((u) => u.goal === g.id).map((u) => u.id);
      const base = baselines.uses.filter((b) => useIds.includes(b.use) && b.placebo_pct != null);
      const useLabel = (id) => uses.uses.find((u) => u.id === id)?.label || id;
      const strong = g.main.filter((c) => ['strong', 'moderate'].includes(entries.get(c.id).evidence.grade)).length;
      const body = `${docHead('Goals', e(g.label), `${g.main.length} compounds studied for it · ${strong} with strong or moderate evidence`)}

  <div class="wrap pg-wrap">
    <p class="pg-intro">What the studies show for each compound people take for ${e(lower(g.label))}, strongest evidence first, next to its Community Signal: what people who took it report. It isn’t a ranking of what to take: the evidence grade is for the compound as a whole, and each fact sheet says what it was studied for.</p>
    <div class="pg-acts">
      <a class="btn ink" href="${e(askLink(`What does the evidence say about compounds for ${lower(g.label)}?`, { site: '' }))}">Ask Sig about it</a>
      <a class="btn ghost-ink" href="/library/?goal=${e(g.id)}">Search the Library</a>
    </div>

    <section class="pg-sec" aria-labelledby="g-main">
      <h2 id="g-main">Studied for ${e(lower(g.label))}</h2>
      <div class="lib-grid pg-grid">${g.main.map(card).join('\n      ')}</div>
    </section>
    ${g.some.length ? `<section class="pg-sec" aria-labelledby="g-some">
      <h2 id="g-some">Sometimes taken for it</h2>
      <p class="pg-sub">Studied mainly for something else, with some evidence or interest for ${e(lower(g.label))}.</p>
      <div class="lib-grid pg-grid">${g.some.map(card).join('\n      ')}</div>
    </section>` : ''}
    ${base.length ? `<section class="pg-sec" aria-labelledby="g-anyway">
      <h2 id="g-anyway">Would it have happened anyway?</h2>
      <p class="pg-sub">Many people improve with time or on a placebo, whatever they take. In published trials:</p>
      <ul class="pg-anyway">${base.map((b) => `<li><b>${b.placebo_pct}%</b><span><span class="pa-use">${e(useLabel(b.use))}</span> ${e(b.defined_as)} <span class="pa-src">${b.sources.map((x) => `<a href="${e(x.url)}" rel="noopener" target="_blank">${e(x.author)} ${e(x.year)}</a>`).join(', ')}</span></span></li>`).join('')}</ul>
      <p class="pg-sub">It’s context, not a direct comparison: in trials “improved” was measured on strict scales, while a member’s “better” is their own word. <a href="/method/#anyway">More on this</a>.</p>
    </section>` : ''}

    <section class="pg-sec pg-share" aria-labelledby="g-share">
      <h2 id="g-share">Took something for ${e(lower(g.label))}?</h2>
      <p>Say how it went, compared with before you started, in your own words. A report that says it didn’t work counts just as much.</p>
      <a class="btn lime" href="${COMMUNITY}/#/new">Share how it went</a>
    </section>

    <nav class="pg-goals" aria-label="Other goals">${goalStats.filter((x) => x.id !== g.id).map((x) => `<a href="/goals/${e(x.id)}/">${e(GOAL_SHORT[x.id] || x.label)}</a>`).join('')}</nav>
  </div>`;
      add(`/goals/${g.id}/`, page({
        title: `${g.label}: what the studies show and what people report · Miracle Health`,
        description: `${g.main.length} peptides, supplements and medications people take for ${lower(g.label)}, with what the studies show for each, its risks and status, and what people who took it report.`,
        url: `/goals/${g.id}/`, body, current: 'library', bodyClass: 'lib pg', styles: STYLES, scripts: SCRIPTS, ogImage: og(`goal-${g.id}`),
      }));
    }
    const body = `${docHead('Goals', 'What people take, by goal', `${uses.goals.length} goals · ${entries.size} checked fact sheets`)}
  <div class="wrap pg-wrap">
    <p class="pg-intro">The compounds people take for each goal, with what the studies show for each and what people who took it report.</p>
    <div class="pg-goal-grid">${goalStats.map((g) => `<a class="pg-goal" href="/goals/${e(g.id)}/"><b>${e(g.label)}</b><span>${g.main.length} studied for it${g.some.length ? ` · ${g.some.length} sometimes taken for it` : ''}</span></a>`).join('')}</div>
  </div>`;
    add('/goals/', page({
      title: 'Peptides and supplements by goal · Miracle Health',
      description: 'The peptides, hormones, supplements and medications people take for weight, muscle, recovery, sleep, focus, skin, aging and more, with what the studies show.',
      url: '/goals/', body, current: 'library', bodyClass: 'lib pg', styles: STYLES, scripts: [], ogImage: og('goals'),
    }));
  }

  // -------------------------------------------------------------------------
  // Two compounds side by side
  // -------------------------------------------------------------------------
  const pairs = PAIRS.map(([a, b, slug]) => {
    if (!entries.has(a) || !entries.has(b)) throw new Error(`compare: ${a} and ${b} both need a fact sheet`);
    return { a: entries.get(a), b: entries.get(b), slug: slug || `${slugOf(nameOf(a))}-vs-${slugOf(nameOf(b))}` };
  });
  {
    const top = (list, n) => (list || []).slice(0, n);
    const byEvidence = (bs) => [...(bs || [])].sort((x, y) => (GRADE_ORDER[x.evidence] ?? 9) - (GRADE_ORDER[y.evidence] ?? 9));
    const goalsOf = (f) => Object.entries(f.goals || {}).filter(([, v]) => v >= 0.75).map(([k]) => GOAL_SHORT[k] || k);
    const aka = (f) => { const c = byId.get(f.id); const a = c ? shownAliases(c).slice(0, 3) : []; return a.length ? `<span class="cmp-aka">Also called ${e(a.join(', '))}</span>` : ''; };
    const cell = (f, inner) => `<div class="cmp-cell"><span class="cmp-who">${e(f.name)}</span>${inner}</div>`;
    const ul = (items, fn) => (items.length ? `<ul class="cmp-list">${items.map(fn).join('')}</ul>` : '<p class="muted-line">None listed.</p>');
    for (const { a, b, slug } of pairs) {
      const rows = [
        ['What it is', (f) => `<p>${e(f.summary)}</p>`],
        ['Status in the US', (f) => `<p>${stPill(f)} ${e(f.status_us.label)}.</p>`],
        ['Evidence overall', (f) => `<p>${evPill(f.evidence.grade)}</p><p class="cmp-why">${e(f.evidence.why)}</p>`],
        ['Mostly taken for', (f) => `<p>${goalsOf(f).length ? e(goalsOf(f).join(', ')) : '–'}</p>`],
        ['What it may do', (f) => ul(top(byEvidence(f.benefits), 4), (x) => `<li>${evPill(x.evidence)}<span>${e(x.claim)}</span></li>`)],
        ['Risks and side effects', (f) => ul(top(f.risks, 4), (x) => `<li><span class="hc hc-${e(x.how_common)}">${e({ common: 'Common', uncommon: 'Uncommon', rare: 'Rare', theoretical: 'In theory', unknown: 'Not known' }[x.how_common] || x.how_common)}</span><span>${e(x.risk)}</span></li>`)],
        ['Skip it, or ask a doctor first, if', (f) => ul(top(f.avoid_if, 4), (x) => `<li><span>${e(x)}</span></li>`)],
        ['Interactions', (f) => ul(top(f.interactions, 4), (x) => `<li><span>${e(x)}</span></li>`)],
        ['Community Signal', (f) => `<p class="cmp-sig">${sig(f.id)}<span class="cmp-sig-none" data-sig-none="${e(f.id)}" hidden>No Signal yet</span></p><p class="cmp-why"><a href="/library/${e(f.id)}/#voices">What people report</a></p>`],
      ];
      const body = `<div class="doc-head cmp-head">
    <div class="wrap">
      <p class="kick">Side by side</p>
      <h1>${e(a.name)} <span class="cmp-vs">vs</span> ${e(b.name)}</h1>
      <p>From each fact sheet · checked ${date([a.checked, b.checked].sort()[0])}</p>
    </div>
  </div>

  <div class="wrap pg-wrap">
    <p class="pg-intro">What each one is, its status, what the studies show, its risks and what people who took it report, from their fact sheets, each claim checked against its source. It isn’t a recommendation: which one fits, if either, is for you and your doctor.</p>
    <div class="cmp">
      <div class="cmp-row cmp-names" aria-hidden="true">
        <span class="cmp-k"></span>
        ${[a, b].map((f) => `<div class="cmp-cell"><a class="cmp-name" href="/library/${e(f.id)}/" tabindex="-1">${e(f.name)}</a>${aka(f)}</div>`).join('')}
      </div>
      ${rows.map(([k, fn]) => `<section class="cmp-row"><h2 class="cmp-k">${e(k)}</h2>${[a, b].map((f) => cell(f, fn(f))).join('')}</section>`).join('\n      ')}
    </div>
    <div class="pg-acts">
      <a class="btn ink" href="${e(askLink(`How do ${a.name} and ${b.name} compare?`, { site: '' }))}">Ask Sig to compare them</a>
      <a class="btn ghost-ink" href="/library/${e(a.id)}/">${e(a.name)}’s fact sheet</a>
      <a class="btn ghost-ink" href="/library/${e(b.id)}/">${e(b.name)}’s fact sheet</a>
    </div>
    <p class="pg-foot">Took one of them? <a href="${COMMUNITY}/#/new?c=${e(a.id)}">Share how ${e(a.name)} went</a> or <a href="${COMMUNITY}/#/new?c=${e(b.id)}">how ${e(b.name)} went</a>. <a href="/compare/">More comparisons</a>.</p>
  </div>`;
      add(`/compare/${slug}/`, page({
        title: `${a.name} vs ${b.name}: evidence, risks and status side by side · Miracle Health`,
        description: `${a.name} and ${b.name} compared: what each is, its FDA status, what the studies show, risks and side effects, and what people who took them report.`,
        url: `/compare/${slug}/`, body, current: 'library', bodyClass: 'lib pg', styles: STYLES, scripts: SCRIPTS, ogImage: og(`compare-${slug}`),
      }));
    }
    const body = `${docHead('Side by side', 'Compare two compounds', `${pairs.length} comparisons · from the fact sheets`)}
  <div class="wrap pg-wrap">
    <p class="pg-intro">Two compounds people often weigh against each other, side by side: status, evidence, risks and what people report. To compare any two others, ask Sig.</p>
    <div class="pg-goal-grid">${pairs.map(({ a, b, slug }) => `<a class="pg-goal" href="/compare/${e(slug)}/"><b>${e(a.name)} vs ${e(b.name)}</b><span>${evPill(a.evidence.grade)} ${evPill(b.evidence.grade)}</span></a>`).join('')}</div>
    <div class="pg-acts"><a class="btn ink" href="${e(askLink('Can you compare two compounds for me?', { site: '' }))}">Compare others with Sig</a></div>
  </div>`;
    add('/compare/', page({
      title: 'Compare peptides and supplements side by side · Miracle Health',
      description: 'Semaglutide vs tirzepatide, BPC-157 vs TB-500 and more: evidence, risks, FDA status and what people report, side by side.',
      url: '/compare/', body, current: 'library', bodyClass: 'lib pg', styles: STYLES, scripts: [], ogImage: og('compare'),
    }));
  }

  // -------------------------------------------------------------------------
  // The Signal, weekly
  // -------------------------------------------------------------------------
  const ISSUES = path.join(ROOT, 'library', 'data', 'weekly');
  const issues = fs.readdirSync(ISSUES).filter((f) => /^\d+\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(ISSUES, f), 'utf8')))
    .sort((x, y) => y.n - x.n);
  {
    const said = [
      ['signup-check', 'Check your inbox', 'We’ve emailed you a link to confirm. Nothing more comes until you tap it.'],
      ['signup-later', 'You’re on the list', 'We’ll email you a link to confirm before the first issue goes out. Nothing comes until you tap it.'],
      ['signup-confirmed', 'You’re already on the list', 'That address gets The Signal already.'],
      ['signup-email', 'That doesn’t look like an email address', 'Try again below.'],
      ['signup-limit', 'That’s enough sign-ups from this connection for today', 'Try again tomorrow.'],
      ['signup-busy', 'Lots of sign-ups today', 'Try again tomorrow.'],
      ['signup-error', 'Something went wrong', 'Nothing was saved. Try again in a minute.'],
      ['confirmed', 'You’re confirmed', 'The Signal comes once a week. Every issue has a one-click unsubscribe link.'],
      ['unsubscribed', 'You’re unsubscribed', 'No more emails. Changed your mind? Sign up again below.'],
      ['unknown', 'That link didn’t work', 'It may be old, or already used. Sign up again below, or write to hello@miraclehealth.us.'],
      ['error', 'Something went wrong', 'Nothing changed. Try the link again in a minute.'],
    ];
    const body = `${docHead('The Signal, weekly', 'What moved, once a week', 'An email · free · unsubscribe in one click')}

  <div class="wrap pg-wrap wk">
    <div class="wk-said">${said.map(([id, t, s]) => `<p class="wk-msg" id="${id}" tabindex="-1"><b>${e(t)}.</b> ${e(s)}</p>`).join('')}</div>
    <div class="wk-top" id="signup">
      <div>
        <p class="pg-intro">Once a week: what moved in the Community Signal, new studies, and FDA news on the compounds in the Library, with every fact linked to its source. No ads, nothing for sale, and we never share your address.</p>
        ${signupForm(e, { source: 'weekly', id: 'wk-email', cls: 'on-paper' })}
      </div>
    </div>

    <section class="pg-sec" aria-labelledby="wk-issues">
      <h2 id="wk-issues">Issues</h2>
      <ul class="wk-list">${issues.map((i) => `<li><a href="/weekly/${i.n}/"><span class="wk-n">#${i.n}</span><span class="wk-t">${e(headline(i))}</span><span class="wk-d">${date(i.date)}</span></a></li>`).join('')}</ul>
    </section>
  </div>`;
    add('/weekly/', page({
      title: 'The Signal: Miracle Health’s weekly email',
      description: 'Once a week: what moved in the Community Signal, new studies and FDA news on peptides, hormones and supplements. Free, no ads.',
      url: '/weekly/', body, current: '', bodyClass: 'lib pg', styles: STYLES, scripts: [], ogImage: og('weekly'),
    }));

    for (const i of issues) {
      const web = `${docHead(`The Signal #${i.n}`, e(headline(i)), date(i.date))}
  <article class="wrap doc wk-issue">
    <p class="intro">${inline(fill(i.intro))}</p>
    ${i.sections.map((s) => `<h2>${e(s.h)}</h2>
    ${s.p.map((p) => `<p>${inline(fill(p))}</p>`).join('\n    ')}
    ${s.more ? `<p class="wk-more"><a href="${e(s.more[1])}">${e(s.more[0])}</a></p>` : ''}`).join('\n    ')}
    ${i.close ? `<p class="wk-close-lead">${inline(fill(i.close.lead))}</p>
    <p class="wk-close"><a class="btn lime" href="${e(i.close.url)}">${e(i.close.label)}</a></p>` : ''}
    <div class="wk-get">
      <h2>Get The Signal every week</h2>
      ${signupForm(e, { source: `issue${i.n}`, id: `wk-email-${i.n}`, cls: 'on-paper' })}
    </div>
  </article>`;
      add(`/weekly/${i.n}/`, page({
        title: `${i.subject} · Miracle Health`,
        description: i.preview,
        url: `/weekly/${i.n}/`, body: web, current: '', bodyClass: 'doc-page', styles: [`/pages/pages.css?v=${V.css}`], scripts: [], ogImage: og('weekly'),
      }));
      files.set(path.join(ROOT, 'weekly', String(i.n), 'email.html'), emailHtml(i));
    }
  }

  // The email itself: tables and inline styles, the way email apps need them. {{unsubscribe}} is
  // filled in for each reader by the newsletter function.
  function emailHtml(i) {
    const A = 'color:#0B0F11;font-weight:bold;text-decoration:underline;text-decoration-color:#C6F02A';
    const link = (t) => inline(fill(t), true).replace(/<a href="/g, `<a style="${A}" href="`);
    const P = 'margin:0 0 14px;font-size:16px;line-height:1.6;color:#3A4644';
    const abs = (u) => (u.startsWith('/') ? `${SITE}${u}` : u);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${e(i.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F2F3F2">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${e(i.preview)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F3F2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FCFCFC;border-radius:16px;font-family:Arial,Helvetica,sans-serif">
<tr><td style="background:#0B0F11;border-radius:16px 16px 0 0;padding:28px 32px">
<p style="margin:0 0 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#D8FF3D">The Signal #${i.n} · ${e(date(i.date))}</p>
<h1 style="margin:0;font-size:26px;line-height:1.2;color:#FCFCFC">${e(headline(i))}</h1>
</td></tr>
<tr><td style="padding:28px 32px 8px">
<p style="${P};color:#0B0F11;font-size:17px">${link(i.intro)}</p>
${i.sections.map((s) => `<h2 style="margin:26px 0 10px;font-size:19px;line-height:1.3;color:#0B0F11">${e(s.h)}</h2>
${s.p.map((p) => `<p style="${P}">${link(p)}</p>`).join('\n')}
${s.more ? `<p style="${P}"><a style="${A}" href="${e(abs(s.more[1]))}">${e(s.more[0])}</a></p>` : ''}`).join('\n')}
${i.close ? `<p style="${P};margin-top:26px">${link(i.close.lead)}</p>
<p style="margin:0 0 8px"><a href="${e(abs(i.close.url))}" style="display:inline-block;padding:14px 24px;border-radius:40px;background:#D8FF3D;color:#0B0F11;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase">${e(i.close.label)}</a></p>` : ''}
</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid #E3E5E4">
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#6A6F6E">Experiences and published evidence, not medical advice. Talk to your doctor before you start, stop or change anything.</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#6A6F6E">You get this because you signed up at miraclehealth.us and confirmed. <a href="${SITE}/weekly/${i.n}/" style="color:#6A6F6E">Read it on the web</a> · <a href="{{unsubscribe}}" style="color:#6A6F6E">Unsubscribe</a></p>
${about.mailing_address ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#8A8F8E">Miracle Health · ${e(about.mailing_address)}</p>` : ''}
</td></tr>
</table>
</td></tr></table>
</body>
</html>
`;
  }

  // -------------------------------------------------------------------------
  // The first 100 reporters
  // -------------------------------------------------------------------------
  {
    const body = `${docHead('Founding reporters', 'Be one of the first 100.', '<span data-live="founders">100 spots</span>')}

  <div class="wrap pg-wrap fd">
    <p class="pg-intro">Every Community Signal starts from what people say on public forums. Each first-hand report from a member moves it toward what members actually experienced. The first 100 members to share a first-hand report become founding reporters.</p>
    <div class="fd-meter" data-live="founders-meter" hidden><span class="fd-bar"><i></i></span><span class="fd-n"></span></div>

    <div class="fd-grid">
      <div class="fd-card"><h2>What a founding reporter gets</h2>
        <ul><li>The Founding reporter badge on your profile, for good.</li><li>Your report in the first community ratings: ten members’ reports unlock the community’s own rating for each compound and use.</li></ul></div>
      <div class="fd-card"><h2>What counts</h2>
        <ul><li>Something you took yourself: what for, how long, and how it compares with before you started.</li><li>Better, about the same or worse all count the same. A report that says it didn’t work is just as useful.</li><li>Sig reads it into the Signal, and you check its read with a tap. Questions don’t count.</li></ul></div>
    </div>

    <section class="pg-sec" aria-labelledby="fd-first">
      <h2 id="fd-first">Filling these first</h2>
      <p class="pg-sub">The pairs where the most people are taking something, and asking “is this normal?”.</p>
      <ul class="fd-pairs" data-live="focus">
        <li><a href="${COMMUNITY}/#/new?c=tirzepatide"><span><b>Tirzepatide</b> for fat loss</span></a></li>
        <li><a href="${COMMUNITY}/#/new?c=semaglutide"><span><b>Semaglutide</b> for fat loss</span></a></li>
        <li><a href="${COMMUNITY}/#/new?c=retatrutide"><span><b>Retatrutide</b> for fat loss</span></a></li>
        <li><a href="${COMMUNITY}/#/new?c=tirzepatide"><span><b>Tirzepatide</b> for appetite</span></a></li>
        <li><a href="${COMMUNITY}/#/new?c=bpc157"><span><b>BPC-157</b> for injury healing</span></a></li>
      </ul>
    </section>

    <div class="pg-acts"><a class="btn lime" href="${COMMUNITY}/#/new">Share how it went</a><a class="btn ghost-ink" href="/method/#reports">How a report is read</a></div>
    <p class="pg-foot">One badge per member, by when your first report was read. A report removed for breaking the <a href="${COMMUNITY}/#/rules">house rules</a> doesn’t count. No doses, no sellers.</p>
  </div>`;
    add('/founders/', page({
      title: 'Be one of the first 100 founding reporters · Miracle Health',
      description: 'The first 100 members to share a first-hand report on a peptide, hormone or supplement become founding reporters. Here’s what counts.',
      url: '/founders/', body, current: '', bodyClass: 'lib pg', styles: STYLES, scripts: SCRIPTS, ogImage: og('founders'),
    }));
  }

  // -------------------------------------------------------------------------
  // miraclehealth.us/ai, where Ask Sig was first: on to Sig's own page at /sig/ (the library
  // build writes it), keeping any question or stack in the link, and not a page of its own for
  // search engines. Every link made before (Library pages, the community, My Miracle) still works.
  // The refresh is only for browsers without scripts: racing go.js, it could drop the #ask= part.
  // -------------------------------------------------------------------------
  files.set(path.join(ROOT, 'ai', 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ask Sig · Miracle Health</title>
<meta name="description" content="Ask Sig, Miracle Health’s AI: the studies and the whole community, in one answer.">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; base-uri 'none'; form-action 'none'">
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE}/sig/">
<script src="/ai/go.js"></script>
<noscript><meta http-equiv="refresh" content="0; url=/sig/"></noscript>
</head>
<body>
<p><a href="/sig/">Ask Sig</a></p>
</body>
</html>
`);
  files.set(path.join(ROOT, 'ai', 'go.js'), '// miraclehealth.us/ai: on to Sig\'s own page at /sig/, keeping a question or a stack in the link\nlocation.replace(`/sig/${location.search}${location.hash}`);\n');

  return { files, urls, pairs, goals: goalStats, issues, V, og };
}
