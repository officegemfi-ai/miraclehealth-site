#!/usr/bin/env node
// Checks Ask Sig with a conversation on it. The other browser checks open each page as it loads, so
// they never see an answer, the blood markers it brings, or the sheet they pull up in on a phone.
// This one serves the site, lets Sig "answer" from a canned stream that arrives in pieces as the real
// one does, and fails when
//   - anything but the blood markers stands beside the chat (tabs, a second panel, another view: the
//     owner's rule of November 21, 2026), or the navigation panel has lost a link;
//   - the rack doesn't keep up with the conversation: it shows an answer's compounds as soon as the
//     agents name them, rests dimmed while a new answer is on its way, and empties when the newest
//     answer names nothing;
//   - someone's own stack isn't laid out in full in the conversation (each compound, what the Synergy
//     auditor found, the button to keep it on this device);
//   - the page itself grows taller than the window, or moves, under a long answer: only the
//     conversation scrolls, in its own pane;
//   - on a phone or a tablet the bar over the box doesn't say what the rack says, or the sheet it
//     opens isn't a proper dialog: inside the window and 640px wide at most, the page behind at rest,
//     closed by Escape, a tap outside or its button, with focus and the side panel given back as they
//     were.
//
// The stream is served from the site's own address, so the page's security policy stays as it ships.
// Needs Playwright with Chromium (CI installs them); locally CHROME_PATH picks a Chrome.
//
//   node scripts/check_sig.mjs
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURE = readFileSync(join(ROOT, 'tests/fixtures/signal.json'), 'utf8');
const WAIT = 8000;   // how long the page gets to reach each state

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('check_sig needs Playwright: npm install --no-save playwright && npx playwright install chromium');
  process.exit(2);
}

// ---- what Sig "answers": three turns, by the newest question's first word
const NAMES = { somatropin: 'Somatropin (HGH)', enclomiphene: 'Enclomiphene', semaglutide: 'Semaglutide' };
const PAIR = ['somatropin', 'enclomiphene'];
const ONE = ['semaglutide'];
// (the check stands on these moving blood tests in the Library's body map: say so plainly if they stop)
const body = (f) => JSON.parse(readFileSync(join(ROOT, 'library/data/body', f), 'utf8'));
const known = body('index.json').markers || {};
for (const id of [...PAIR, ...ONE]) {
  const moves = existsSync(join(ROOT, 'library/data/body', `${id}.json`)) && (body(`${id}.json`).lines || []).some((l) => (l.markers || []).some((m) => known[m]));
  if (!moves) { console.error(`check_sig: ${id} no longer moves a blood test in library/data/body: pick another compound for this check`); process.exit(2); }
}
const chipsOf = (ids) => ids.map((id) => ({ id, name: NAMES[id] }));
const ALL = ['safety', 'planner', 'recommender', 'community', 'combination', 'markers', 'synergy', 'evidence', 'relatives', 'mechanism', 'builder', 'interpretation'];
const ITEMS = [
  { id: 'somatropin', name: NAMES.somatropin, family: 'Hormone', role: 'Hormone', why: 'Lab-made human growth hormone, approved for growth hormone deficiency and a few other conditions.', url: '/library/somatropin/', status: { key: 'approved', label: 'FDA-approved for some uses' }, grade: 'strong', use: { grade: 'limited', fits: true }, signal: { score: 78.8, level: 'Forum data', reports: null, effects: ['Recovery / fullness'] }, tag: '', tone: 'none', caution: 'Can raise blood sugar; checked with IGF-1 and glucose.', benefits: [{ claim: 'Lowers body fat in adults with growth hormone deficiency', evidence: 'strong', source: { url: 'https://www.fda.gov/', title: 'FDA label', year: 2024 } }], labs: ['IGF-1', 'Glucose'] },
  { id: 'enclomiphene', name: NAMES.enclomiphene, family: 'Medication', role: 'Research stage', why: 'A selective estrogen receptor modulator studied for raising testosterone; not approved.', url: '/library/enclomiphene/', status: { key: 'not_approved', label: 'Not FDA-approved' }, grade: 'moderate', use: { grade: 'none', fits: false }, signal: { score: 65.8, level: 'Forum data', reports: null, effects: [] }, tag: '', tone: 'none', caution: 'Vision changes were reported with its close relative clomiphene.', benefits: [{ claim: 'Raises testosterone while keeping sperm counts', evidence: 'moderate', source: { url: 'https://pubmed.ncbi.nlm.nih.gov/', title: 'Phase 3 trials', year: 2016 } }], labs: ['Testosterone', 'LH', 'FSH'] },
];
const HOLD = Symbol('the stream waits here until the check has looked');
const TURNS = {
  // their own stack: a long answer, with the stack laid out and audited
  stack: [
    ['meta', { agents: ALL }],
    ['step', { id: 'safety', agent: 'safety', title: 'Read your question: nothing urgent', status: 'done', flag: 'none' }],
    ['step', { id: 'lookup', agent: 'recommender', title: 'Opened 2 fact sheets', status: 'done', chips: chipsOf(PAIR) }],
    HOLD,
    ['step', { id: 'evidence', agent: 'evidence', title: 'Pulled the study results', status: 'done' }],
    ['step', { id: 'markers', agent: 'markers', title: 'Named the blood tests they may move', status: 'done' }],
    ['text', { d: '**Short answer:** the studies are thin for fat loss with this pair, and people mostly report it for other reasons.\n\nGrowth hormone lowers body fat in adults who are short of it; in people with normal levels the effect is small. Enclomiphene raises testosterone, and its trials did not measure fat loss.\n\nTalk it over with your doctor before changing anything.' }],
    ['step', { id: 'bld1', agent: 'builder', title: 'Laid out your stack of 2', status: 'done', chips: chipsOf(PAIR) }],
    ['card', { type: 'shortlist', kind: 'yours', id: 'card1', title: 'Your stack: to discuss with your clinician', note: '', goal: 'weight', meds: ['metformin'], items: ITEMS }],
    ['step', { id: 'syn1', agent: 'synergy', title: 'Checked them together', status: 'done', chips: chipsOf(PAIR) }],
    ['card', { type: 'audit', for: 'card1', ok: true, summary: '', findings: [
      { ids: PAIR, names: PAIR.map((id) => NAMES[id]), kind: 'marker', level: 'caution', note: 'They push IGF-1 in opposite directions, so one IGF-1 result can’t show either effect alone.' },
      { ids: ['somatropin'], names: [NAMES.somatropin], kind: 'condition', level: 'info', note: 'Growth hormone can raise blood sugar; worth knowing alongside metformin.' },
    ] }],
    ['card', { type: 'questions', items: ['Should IGF-1 and glucose be checked before and during?', 'Is there an approved option for my goal?'] }],
    ['sources', { studies: {}, community: { names: PAIR.map((id) => ({ id })) } }],
    ['review', { ok: true, edited: 0, held: 0 }],
    ['done', { memo: 'The studies are thin for fat loss with this pair.', ms: 8200 }],
  ],
  // then one other compound: the last answer's rack waits, dimmed, until this one is named
  other: [
    ['meta', { agents: ALL }],
    ['step', { id: 'safety', agent: 'safety', title: 'Read your question: nothing urgent', status: 'done', flag: 'none' }],
    HOLD,
    ['step', { id: 'lookup', agent: 'recommender', title: 'Opened 1 fact sheet', status: 'done', chips: chipsOf(ONE) }],
    HOLD,
    ['text', { d: '**Short answer:** it is approved for type 2 diabetes and for weight management.\n\nYour doctor can say whether it suits you.' }],
    ['sources', { studies: {}, community: { names: ONE.map((id) => ({ id })) } }],
    ['review', { ok: true, edited: 0, held: 0 }],
    ['done', { memo: 'Approved for two uses.', ms: 4100 }],
  ],
  // then a question that names no compound: nothing for the rack to show
  nothing: [
    ['meta', { agents: ALL }],
    ['step', { id: 'safety', agent: 'safety', title: 'Read your question: nothing urgent', status: 'done', flag: 'none' }],
    ['text', { d: '**Short answer:** most adults do best on seven to nine hours.\n\nA regular bedtime helps more than anything you can take.' }],
    ['review', { ok: true, edited: 0, held: 0 }],
    ['done', { memo: 'Seven to nine hours.', ms: 2100 }],
  ],
};
const ASK = { stack: 'Stack check: is HGH plus enclomiphene good for fat loss?', other: 'Other one: what about semaglutide?', nothing: 'Nothing named: how much sleep do adults need?' };
// The stream stops at each HOLD until the check lets it on (once per HOLD, in either order), so what
// the page shows part-way through an answer is looked at without racing a timer. Off for the
// narrow windows, which only look at finished answers.
let stepwise = false, waiting = null, banked = 0;
const hold = () => (banked ? (banked--, Promise.resolve()) : new Promise((ok) => { waiting = ok; setTimeout(ok, WAIT * 2).unref(); }));
const letOn = () => { if (waiting) { const ok = waiting; waiting = null; ok(); } else banked++; };

// ---- the site, served as GitHub Pages serves it, with Sig's page asking this server
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};
const fileFor = (url) => {
  const p = normalize(decodeURIComponent(new URL(url, 'http://x').pathname));
  if (p.split(sep).includes('..')) return null;
  const base = join(ROOT, p);
  for (const f of [base, join(base, 'index.html'), `${base}.html`]) {
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
};
const SIG_PAGE = join(ROOT, 'sig', 'index.html');
const server = createServer(async (req, res) => {
  if (req.url.startsWith('/__ask')) {
    let sent = '';
    for await (const chunk of req) sent += chunk;
    let asked = '';
    try { asked = String([...JSON.parse(sent).messages].reverse().find((m) => m.role === 'user')?.content || ''); } catch { /* not a question */ }
    const turn = TURNS[Object.keys(ASK).find((k) => asked === ASK[k])];
    if (!turn) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: `check_sig has no answer for: ${asked.slice(0, 80)}` })); return; }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
    for (const part of turn) {
      if (part === HOLD) { if (stepwise) await hold(); continue; }
      res.write(`event: ${part[0]}\ndata: ${JSON.stringify(part[1])}\n\n`);
    }
    res.end();
    return;
  }
  const f = fileFor(req.url);
  if (!f) { res.writeHead(404, { 'Content-Type': 'text/html' }); createReadStream(join(ROOT, '404.html')).pipe(res); return; }
  if (f === SIG_PAGE) {
    const html = readFileSync(f, 'utf8');
    if (!/data-endpoint="[^"]+"/.test(html)) { console.error('check_sig: sig/index.html no longer says where Sig answers from (data-endpoint)'); process.exit(2); }
    res.writeHead(200, { 'Content-Type': TYPES['.html'] });
    res.end(html.replace(/data-endpoint="[^"]+"/, 'data-endpoint="/__ask"'));
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// ---- what the page shows, read inside it
const LOOK = () => {
  const $ = (s, el = document) => el.querySelector(s);
  const all = (s, el = document) => [...el.querySelectorAll(s)];
  const shown = (e) => { if (!e) return false; for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const box = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }; };
  const app = $('.ai-app'), rail = $('#ai-rail'), rack = $('#rl-markers'), side = $('.sg-side'), chat = $('.ai-chat'), pane = $('#ai-scroll'), thread = $('#ai-thread'), peek = $('#ai-peek');
  const last = all('.msg.ai', thread).pop();
  const active = document.activeElement;
  return {
    // beside the chat
    rail: rail ? { shown: shown(rail), box: box(rail), kids: [...rail.children].map((c) => c.id || c.className), role: rail.getAttribute('role'), modal: rail.getAttribute('aria-modal'), label: rail.getAttribute('aria-label') || '' } : null,
    tabs: all('[role=tab], [role=tablist], [role=tabpanel]', rail || document.createElement('i')).length,
    panels: all('.rl-panel', rail || document.createElement('i')).map((p) => p.id),
    title: $('.rl-name', rail || document)?.textContent.trim() || '',
    chatBox: chat ? box(chat) : null,
    // the rack
    tubes: all('.rk-tube', rack || document).map((t) => t.dataset.marker),
    sum: $('.rk-sum', rack || document)?.textContent.trim() || '',
    none: $('.rk-none', rack || document)?.textContent.trim() || '',
    who: all('.rk-chip', rack || document).map((c) => c.textContent.trim()),
    pushers: all('.rk-lines dt', rack || document).map((d) => d.textContent.trim()),
    waiting: Boolean(app?.classList.contains('rail-wait')),
    rackBusy: rack?.getAttribute('aria-busy') === 'true',
    // the conversation
    busy: thread?.getAttribute('aria-busy') === 'true',
    answers: all('.msg.ai', thread).length,
    lastText: last ? last.textContent.replace(/\s+/g, ' ') : '',
    lastButtons: last ? all('button, a', last).map((b) => b.textContent.replace(/\s+/g, ' ').trim()) : [],
    paneTall: pane ? pane.scrollHeight - pane.clientHeight : 0,
    hidden: all('.sr', thread).length,
    // the page
    pageY: scrollY, pageTall: document.documentElement.scrollHeight - innerHeight, pageWide: document.documentElement.scrollWidth - innerWidth, width: innerWidth,
    // the navigation panel
    side: side ? { shown: shown(side), inert: side.inert, main: all('nav.sg-site a', side).map((a) => a.textContent.trim()), more: all('nav.sg-more a', side).length } : null,
    // the bar over the box, and the sheet
    bar: peek && shown(peek) ? { text: peek.textContent.replace(/\s+/g, ' ').trim(), said: $('.rl-peek-n', peek)?.textContent.trim() || '' } : null,
    open: Boolean(app?.classList.contains('sheet-open')),
    lock: document.documentElement.classList.contains('sheet-lock'),
    chatInert: Boolean(chat?.inert),
    focus: active ? (active.id ? `#${active.id}` : `${active.tagName.toLowerCase()}${active.className && typeof active.className === 'string' ? `.${active.className.trim().split(/\s+/)[0]}` : ''}`) : '',
  };
};

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const problems = [];
let looks = 0;

async function visit(w) {
  const phone = w <= 600;
  const ctx = await browser.newContext({ viewport: { width: w, height: phone ? 844 : 900 }, reducedMotion: 'reduce', hasTouch: phone, isMobile: phone });
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(ORIGIN)) return route.continue();
    if (u.includes('functions/v1/signal') || u.includes('snapshot.json')) {
      return route.fulfill({ status: 200, body: FIXTURE, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    return route.abort();
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(WAIT);
  const at = `Ask Sig at ${w}px`;
  const fail = (what) => problems.push(`${at}: ${what}`);
  const ok = (cond, what) => { looks++; if (!cond) fail(what); return Boolean(cond); };
  page.on('pageerror', (e) => fail(`a script error: ${String(e).slice(0, 200)}`));
  const look = () => page.evaluate(LOOK);
  // Waits for the page to reach a state, and says what it showed instead when it doesn't. (It looks
  // from here, again and again: the page's security policy lets nothing be evaluated from a string.)
  const until = async (test, what) => {
    looks++;
    const end = Date.now() + WAIT;
    let s = await look();
    while (!test(s) && Date.now() < end) { await new Promise((r) => setTimeout(r, 40)); s = await look(); }
    if (test(s)) return true;
    fail(`${what} (it showed: ${JSON.stringify({ busy: s.busy, answers: s.answers, tubes: s.tubes.length, sum: s.sum, waiting: s.waiting, bar: s.bar?.text || null, open: s.open })})`);
    return false;
  };
  const ask = async (turn) => {
    await page.fill('#ai-input', ASK[turn]);
    await page.locator('#ai-send').click();
    const adult = page.locator('.gate-yes');
    if (turn === 'stack') { await adult.waitFor({ timeout: WAIT }).catch(() => fail('the question never reached the 18+ gate')); if (await adult.count()) await adult.first().click(); }
  };
  const answered = (n) => until((s) => !s.busy && s.answers >= n, `answer ${n} never finished`);
  const still = (s, when) => {
    ok(s.pageY === 0 && s.pageTall <= 0, `${when}, the page itself moved or grew taller than the window (moved ${s.pageY}px, ${s.pageTall}px taller): only the conversation scrolls`);
    ok(s.pageWide <= 0, `${when}, the page is ${s.pageWide}px wider than the window`);
  };

  await page.goto(`${ORIGIN}/sig/`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => setTimeout(r, 300)); });

  // -- before anyone asks
  let s = await look();
  if (!ok(s.rail && s.side, 'the page has lost the panel beside the chat or the navigation panel')) { await ctx.close(); return; }
  ok(s.tabs === 0, `the panel beside the chat has tabs again (${s.tabs} tab parts): only the blood markers stand there`);
  ok(s.panels.length === 1 && s.panels[0] === 'rl-markers' && s.rail.kids.join(' ') === 'rl-bar rl-markers', `beside the chat there is more than the blood markers: ${s.rail.kids.join(', ')}`);
  ok(s.title === 'Blood markers' && /blood markers/i.test(s.rail.label), `the panel beside the chat is named “${s.title}”, not “Blood markers”`);
  ok(s.tubes.length === 0 && s.none, 'the rack shows blood tests before Sig has talked about anything');
  ok(['The Signal', 'Library', 'Ask Sig', 'Community', 'My Miracle'].every((n) => s.side.main.includes(n)) && s.side.more >= 5, `the navigation panel has lost links (it has: ${s.side.main.join(', ')}; ${s.side.more} more)`);
  if (w > 1100) {
    ok(s.rail.shown && s.side.shown, 'on a wide window the blood markers and the navigation panel both show');
    ok(s.rail.box.left >= s.chatBox.right - 1 && s.rail.box.right <= s.width + 1, 'the blood markers don’t stand to the right of the chat, inside the window');
    ok(!s.bar, 'a wide window needs no bar over the box: the rack is already beside the chat');
  } else {
    ok(!s.rail.shown && !s.bar, 'on a narrow window nothing about blood markers shows before an answer brings some');
  }
  still(s, 'before anyone asks');

  // -- their own stack: a long answer
  stepwise = w > 1100;
  await ask('stack');
  if (stepwise) {
    await until((s) => s.busy && s.tubes.length > 0 && !s.waiting, 'the rack didn’t show the answer’s compounds as soon as the agents named them, while Sig was still writing');
    letOn();
  }
  await answered(1);
  await until((s) => s.tubes.length > 0 && !s.waiting && !s.rackBusy, 'after an answer about two compounds the rack shows no blood tests');
  s = await look();
  const first = s.tubes.join(' ');
  ok(/^\d+ blood tests? (moves?|is checked|are checked)/.test(s.sum), `the rack’s first line doesn’t count the blood tests: “${s.sum}”`);
  ok(s.who.length === 2, `the rack doesn’t offer the two compounds to switch on and off (${s.who.join(', ')})`);
  ok(s.tabs === 0 && s.panels.length === 1, 'an answer brought tabs or another panel beside the chat');
  ok(/Somatropin \(HGH\)/.test(s.lastText) && /Enclomiphene/.test(s.lastText) && /Synergy auditor/.test(s.lastText) && s.lastButtons.includes('Save on this device'),
    'their own stack isn’t laid out in full in the conversation (each compound, the Synergy auditor’s findings, “Save on this device”)');
  ok(!s.lastButtons.some((b) => /on the screen/i.test(b)), 'an answer still offers to show something “on the screen”, which is gone');
  ok(s.paneTall > 100 && s.hidden > 0, 'this check needs an answer taller than its pane, with a hidden label in it, to mean anything: make its stack answer longer');
  still(s, 'under a long answer');

  if (w > 1100) {
    // -- the next answer: the last one's rack rests dimmed until this one names its compound
    await ask('other');
    await until((s) => s.busy && s.waiting && s.rackBusy && s.tubes.join(' ') === first, 'while a new answer is on its way, the last answer’s blood tests don’t rest dimmed');
    letOn();
    await until((s) => s.busy && !s.waiting && !s.rackBusy && s.tubes.length > 0 && s.tubes.join(' ') !== first, 'the rack didn’t move on to the new answer’s compound once the agents named it');
    letOn();
    await answered(2);
    s = await look();
    ok(s.who.length === 0 && s.pushers.length > 0 && s.pushers.every((p) => /^Semaglutide/.test(p)), `after an answer about one compound the rack is about something else (${s.pushers.join(', ') || 'nothing'})`);
    // -- an answer that names nothing
    await ask('nothing');
    await answered(3);
    await until((s) => s.tubes.length === 0 && Boolean(s.none) && !s.waiting && !s.rackBusy, 'after an answer that names no compound the rack still shows the last one’s blood tests');
    still(await look(), 'after three answers');
  } else {
    // -- the bar over the box, and the sheet it opens
    const mid = s.width / 2;
    if (ok(s.bar && /^Blood markers/.test(s.bar.text), 'after an answer that moves blood tests, no bar over the box says so')) {
      ok(s.bar.said && s.sum.startsWith(s.bar.said), `the bar says “${s.bar.said}”, the rack says “${s.sum}”`);
      ok(!s.rail.shown && !s.open, 'the sheet is open before anyone asked for it');
      const sideWas = s.side.inert;
      const bar = page.locator('#ai-peek button');
      await bar.click();
      await until((s) => s.open && s.rail.shown, 'the bar didn’t open the blood markers');
      // (the keyboard moves to the sheet a frame after it opens)
      await until((s) => s.focus === '#rl-close', 'opening the sheet doesn’t put the keyboard on its Close button');
      s = await look();
      ok(s.rail.role === 'dialog' && s.rail.modal === 'true' && s.lock, 'the open sheet isn’t a dialog over the page (role, aria-modal, the page held still)');
      ok(s.chatInert && s.side.inert, 'the page behind the open sheet can still be reached');
      ok(s.rail.box.left >= -0.5 && s.rail.box.right <= s.width + 0.5 && s.rail.box.width <= 640.5 && Math.abs((s.rail.box.left + s.rail.box.right) / 2 - mid) <= 1, `the sheet isn’t inside the window, 640px wide at most and in the middle (${Math.round(s.rail.box.left)} to ${Math.round(s.rail.box.right)})`);
      ok(s.tubes.length > 0 && s.tabs === 0, 'the sheet doesn’t show the rack, alone');
      still(s, 'with the sheet open');
      await page.keyboard.press('Escape');
      await until((s) => !s.open && !s.rail.shown, 'Escape didn’t shut the sheet');
      await until((s) => s.focus === 'button.rl-peek', 'shutting the sheet doesn’t put the keyboard back on the bar');
      s = await look();
      ok(s.rail.role === 'complementary' && s.rail.modal === null && !s.lock, 'the shut sheet still says it is a dialog, or still holds the page');
      ok(!s.chatInert && s.side.inert === sideWas, `shutting the sheet doesn’t give the page back as it was (the chat ${s.chatInert ? 'still rests' : 'is back'}; the side panel ${s.side.inert ? 'rests' : 'can be reached'}, and ${sideWas ? 'rested' : 'could be reached'} before)`);
      await bar.click();
      await until((s) => s.open, 'the bar didn’t open the sheet a second time');
      await page.mouse.click(phone ? mid : 12, phone ? 8 : 300);
      if (!await until((s) => !s.open, 'a tap outside the sheet didn’t shut it')) await page.keyboard.press('Escape');
      await bar.click();
      await until((s) => s.open, 'the bar didn’t open the sheet a third time');
      await page.locator('#rl-close').click();
      await until((s) => !s.open, 'the sheet’s Close button didn’t shut it');
    }
    // -- an answer that names nothing takes the bar away again
    await ask('nothing');
    await answered(2);
    await until((s) => !s.bar && s.tubes.length === 0, 'after an answer that names no compound the bar over the box still offers blood markers');
    still(await look(), 'after two answers');
  }
  await ctx.close();
}

for (const w of [1440, 1024, 390]) {
  try { await visit(w); } catch (e) { problems.push(`Ask Sig at ${w}px: the check itself stopped: ${String(e).split('\n')[0].slice(0, 240)}`); }
  stepwise = false; banked = 0; letOn(); banked = 0;
}
await browser.close();
server.close();

if (problems.length) {
  for (const p of problems) console.log(process.env.GITHUB_ACTIONS ? `::error::${p}` : p);
  console.log(`sig: ${problems.length} problem${problems.length === 1 ? '' : 's'} in ${looks} looks at a conversation`);
  process.exit(1);
}
console.log(`sig: ${looks} looks at a conversation, at 1440, 1024 and 390px: only the blood markers beside the chat, the rack keeps up, the page stays put, the sheet is a proper dialog`);
