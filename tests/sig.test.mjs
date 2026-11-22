// Ask Sig, beside the chat: only the blood markers stand there (the owner's rule of November 21,
// 2026: Sig's mind and the code-like screen that shared the panel as tabs are gone), the navigation
// panel keeps every link, and the rack (ai/markers.js) counts and draws what the Library's body map
// says and nothing more: direction only, no amounts, no doses. scripts/check_sig.mjs looks at the
// same page in a browser, with an answer on it. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeMarkers } from '../ai/markers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const there = (f) => fs.existsSync(path.join(ROOT, f));
const page = read('sig/index.html');
const js = read('ai/ai.js');
const between = (text, from, to) => { const a = text.indexOf(from); assert.ok(a >= 0, `no ${from}`); const b = text.indexOf(to, a); assert.ok(b > a, `no ${to}`); return text.slice(a, b); };

// ---- the page as the build writes it
test('beside the chat stand the blood markers, alone: one panel, no tabs', () => {
  const rail = between(page, '<section class="ai-rail"', '</section>');
  assert.match(rail, /^<section class="ai-rail" id="ai-rail" role="complementary" aria-label="[^"]*blood markers[^"]*">/);
  assert.deepEqual([...rail.matchAll(/class="rl-panel" id="([\w-]+)"/g)].map((m) => m[1]), ['rl-markers'], 'one panel, the markers');
  assert.match(rail, /<span class="rl-name">Blood markers<\/span>/);
  assert.match(rail, /<button class="rl-close" id="rl-close" type="button" aria-label="Close">/, 'the sheet a phone pulls up needs its way out');
  for (const gone of ['role="tab"', 'role="tablist"', 'role="tabpanel"', 'rl-tabs', 'tm-tabbtn', 'sc-root', 'rl-mind', 'Sig’s mind', 'Screen']) {
    assert.ok(!rail.includes(gone), `${gone} is back beside the chat`);
  }
  // the bar a narrow window opens them from sits over the box to write in, empty until an answer
  assert.match(between(page, '<form class="ai-dock"', '</form>'), /<div class="ai-peek" id="ai-peek" hidden><\/div>/);
});

test('the screen and Sig’s mind are gone from the page, its scripts and its styles', () => {
  for (const f of ['ai/screen.js', 'ai/screen.css', 'ai/mind.js']) assert.ok(!there(f), `${f} is back`);
  assert.ok(there('ai/markers.js'));
  assert.ok(!/screen\.(js|css)|ai\/mind\.js/.test(page), 'the page still loads the screen or the mind map');
  assert.deepEqual([...page.matchAll(/<script type="module" src="\/ai\/([\w.]+)\?v=/g)].map((m) => m[1]), ['plan.js', 'ai.js'], 'the page’s own scripts');
  assert.match(js, /^import \{ makeMarkers \} from '\/ai\/markers\.js\?v=[0-9a-f]{10}';$/m);
  for (const gone of ['MHScreen', 'screen.js', 'openScreen', 'setTab(', 'on the screen', 'ai-pointer', 'sc-root']) assert.ok(!js.includes(gone), `ai/ai.js still has ${gone}`);
  // (Sig's server still sends the evidence ladder; the page neither draws it nor keeps it with a chat)
  assert.match(js, /const bare = \(m\) => .*ladder: undefined/);
  const css = ['ai/ai.css', 'ai/term.css', 'ai/mind.css', 'ai/plan.css'].map(read).join('\n');
  for (const gone of ['.rl-tabs', '.tm-tabbtn', '#sc-root', '.rl-map', '.ai-pointer', '.ai-toscreen', '.ai-rail.sc']) assert.ok(!css.includes(gone), `the stylesheets still dress ${gone}`);
});

test('the navigation panel keeps every link', () => {
  const side = between(page, '<aside class="sg-side"', '</aside>');
  // each link's words (its drawing aside) and where it goes
  const links = (nav) => [...nav.replace(/<svg[\s\S]*?<\/svg>/g, '').matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => `${m[2].replace(/<[^>]+>/g, '').trim()} ${m[1]}`);
  assert.deepEqual(links(between(side, '<nav class="sg-site', '</nav>')),
    ['The Signal /#signal', 'Library /library/', 'Ask Sig /sig/', 'Community https://community.miraclehealth.us/', 'My stack /my/']);
  assert.deepEqual(links(between(side, '<nav class="os-more sg-more"', '</nav>')),
    ['How it works /#how', 'How the numbers are made /method/', 'FDA status tracker /status/', 'Compare /compare/', 'By goal /goals/', 'The weekly email /weekly/', 'Founding reporters /founders/', 'The story /story/', 'About /about/']);
  assert.match(side, /id="sg-new"/, 'a new chat');
  assert.match(side, /id="sg-list"/, 'the chats kept on this device');
});

test('the conversation’s pane holds what is placed out of the flow inside it, so the page can’t move under a long chat', () => {
  // A label kept for screen readers is position:absolute; with no positioned box inside the pane it
  // hangs below the window at the end of a long chat, the page grows taller than the window, and the
  // next focus drags the whole app up (found November 21; scripts/check_sig.mjs measures it).
  assert.match(read('ai/term.css'), /\.sigapp \.tm \.ai-scroll\{position:relative;[^}]*overflow-y:auto/);
  assert.match(read('ai/ai.css'), /^\.sr\{position:absolute;/m);
});

test('the sheet gives the page back as it found it', () => {
  // On a phone the side panel is a drawer that rests (inert) while it's shut: closing the markers'
  // sheet may only wake what opening it put to rest.
  const open = between(js, 'function openSheet()', '\n}');
  const shut = between(js, 'function closeSheet()', '\n}');
  assert.match(open, /rested = behind\(\)\.filter\(\(el\) => !el\.inert\);\s*for \(const el of rested\) el\.inert = true;/);
  assert.match(shut, /for \(const el of rested\) el\.inert = false;\s*rested = \[\];/);
  assert.ok(!/behind\(\)\) el\.inert = false/.test(shut), 'closing the sheet wakes everything behind it');
});

// ---- the rack itself, drawn into a stand-in for the page from the Library's own files
const flat = (kids) => kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false);
function h(tag, attrs = {}, ...kids) {
  const el = { tag, attrs: { ...attrs }, kids: flat(kids), on: {} };
  el.addEventListener = (ev, fn) => { (el.on[ev] ||= []).push(fn); };
  el.press = () => (el.on.click || []).forEach((fn) => fn({}));
  el.replaceChildren = (...next) => { el.kids = flat(next); };
  el.querySelector = () => null;
  return el;
}
const svg = (markup) => ({ tag: 'svg', attrs: {}, kids: [], markup });
const all = (el, cls, out = []) => {
  if (!el || typeof el !== 'object') return out;
  if (String(el.attrs?.class || '').split(/\s+/).includes(cls)) out.push(el);
  for (const k of el.kids || []) all(k, cls, out);
  return out;
};
const said = (el) => (typeof el === 'string' ? el : `${el?.attrs?.text ?? ''}${(el?.kids || []).map(said).join('')}`);
function rackOn() {
  const copied = [];
  let draws = 0;
  const m = makeMarkers({ h, svg, copy: (text) => copied.push(text), onDraw: () => { draws++; } });
  const el = h('div');
  m.mount(el);
  return { m, el, copied, draws: () => draws };
}
// (the rack reads the split body map as a browser would, from the site's own files)
globalThis.fetch = async (url) => {
  const f = path.join(ROOT, new URL(url, 'https://miraclehealth.us').pathname);
  return fs.existsSync(f) ? { ok: true, json: async () => JSON.parse(fs.readFileSync(f, 'utf8')) } : { ok: false, json: async () => null };
};
// What a compound's lines may move, worked out here from the one file people edit
const body = JSON.parse(read('library/data/body.json'));
const DRAWS = new Set(['up', 'down', 'watch', 'warn', 'is', 'block']);
const moved = (ids) => new Set(ids.flatMap((id) => (body.compounds[id]?.lines || []).filter((l) => DRAWS.has(l.op)).flatMap((l) => (l.markers || []).filter((k) => body.markers[k]))));
const way = (ids, marker) => new Set(ids.flatMap((id) => (body.compounds[id]?.lines || []).filter((l) => (l.markers || []).includes(marker)).map((l) => l.op)));
const NAMES = { somatropin: 'Somatropin (HGH)', enclomiphene: 'Enclomiphene', semaglutide: 'Semaglutide', creatine: 'Creatine', bpc157: 'BPC-157' };

test('an empty rack says when blood tests will show, and nothing else', async () => {
  const { m, el, draws } = rackOn();
  assert.equal(m.count(), 0);
  assert.equal(m.said(), '');
  assert.equal(all(el, 'rk-tube').length, 0);
  assert.match(said(el), /^Blood tests show up here when Sig talks about something that moves them\./);
  assert.match(said(el), /Sig never asks for them or reads them\.$/, 'whose results they are');
  assert.equal(draws(), 1, 'the page is told each time the rack is drawn');
  assert.equal(await m.show([]), 0);
  assert.equal(m.said(), '');
});

test('the rack holds exactly the blood tests the body map says these compounds may move', async () => {
  const ids = ['somatropin', 'enclomiphene'];
  const { m, el } = rackOn();
  const want = moved(ids);
  assert.ok(want.size >= 8, 'the body map has lost these two compounds’ blood tests: pick others for this test');
  assert.equal(await m.show(ids, NAMES), want.size);
  assert.equal(m.count(), want.size);
  const tubes = all(el, 'rk-tube');
  assert.deepEqual(new Set(tubes.map((t) => t.attrs['data-marker'])), want);
  // the first line counts those that go up or down, and the page's bar repeats it word for word
  const first = said(all(el, 'rk-sum')[0]);
  assert.match(first, /^\d+ blood tests move( · \d+ pushed both ways)?$/);
  assert.ok(m.said() && first.startsWith(m.said()) && !m.said().includes('·'), `the bar would say “${m.said()}”, the rack says “${first}”`);
  // growth hormone raises IGF-1 and enclomiphene lowers it, as their sheets say: pushed both ways, and first
  assert.ok(way(['somatropin'], 'igf1').has('up') && way(['enclomiphene'], 'igf1').has('down'), 'the fact sheets changed: pick another marker for this test');
  assert.equal(tubes[0].attrs['data-marker'], 'igf1');
  assert.equal(tubes[0].attrs['aria-label'], 'IGF-1: pushed both ways');
  assert.equal(tubes[0].attrs['aria-pressed'], 'true', 'the first tube is the one opened');
  assert.match(said(all(el, 'rk-card')[0]), /Pushed both ways: a single IGF-1 result can’t show either effect alone\.$/);
  // every tube has a name and says which way in words, for someone who can't see its colour
  for (const t of tubes) assert.match(t.attrs['aria-label'], /^.+: (goes up|goes down|pushed both ways|checked, no set direction|noted)$/);
});

test('direction only: no amounts and no doses, on the rack or in what it copies', async () => {
  const { m, el, copied } = rackOn();
  await m.show(['somatropin', 'enclomiphene'], NAMES);
  const amount = /\b\d+(\.\d+)?\s?(mg|mcg|µg|ug|iu|units?|ml|g\/d|ng\/dl|mmol|%)(?![a-z])/i;
  // (a fact sheet's own words can carry a study's figure; the tubes, their labels and the copy never do)
  for (const part of ['rk-sum', 'rk-who', 'rk-key', 'rk-grid', 'rk-fine', 'rk-own']) for (const node of all(el, part)) assert.ok(!amount.test(said(node)), `an amount on the rack: ${said(node).slice(0, 120)}`);
  assert.match(said(all(el, 'rk-fine')[0]), /^Direction only, from the Library’s fact sheets: how much depends on the person, and isn’t drawn\.$/);
  for (const t of all(el, 'rk-tube')) assert.ok(!/\d/.test(t.kids.find((k) => k.tag === 'svg').markup.replace(/<[^>]*>/g, '')), 'a number drawn in a tube');
  all(el, 'rk-copy')[0].press();
  assert.equal(copied.length, 1);
  const lines = copied[0].split('\n');
  assert.equal(lines[0], 'Blood tests to discuss with my clinician (from Unhyped’s fact sheets; direction only):');
  assert.equal(lines.length - 1, m.count());
  for (const line of lines.slice(1)) assert.match(line, /^- [^:]+: ((HGH|Enclomiphene) (may raise it|may lower it|means it’s checked|is noted)(; )?)+$/);
  assert.ok(!amount.test(copied[0]), 'an amount in the copy for the doctor');
});

test('a compound can be switched off, never the last one, and the bar’s line follows', async () => {
  const { m, el, draws } = rackOn();
  await m.show(['somatropin', 'enclomiphene'], NAMES);
  const both = m.said();
  const chips = () => all(el, 'rk-chip');
  assert.deepEqual(chips().map(said), ['HGH', 'Enclomiphene']);
  assert.deepEqual(chips().map((c) => c.attrs['aria-pressed']), ['true', 'true']);
  const before = draws();
  chips()[1].press();
  assert.equal(draws(), before + 1);
  assert.deepEqual(chips().map((c) => c.attrs['aria-pressed']), ['true', 'false']);
  const alone = [...moved(['somatropin'])].filter((k) => ['up', 'down'].some((op) => way(['somatropin'], k).has(op))).length;
  assert.equal(m.said(), `${alone} blood test${alone === 1 ? ' moves' : 's move'}`);
  assert.notEqual(m.said(), both);
  assert.ok(said(all(el, 'rk-sum')[0]).startsWith(m.said()));
  // what the other one moved stays on the rack, marked off
  assert.equal(all(el, 'rk-tube').length, m.count());
  assert.ok(all(el, 'rk-tube').some((t) => /not moved by what’s on$/.test(t.attrs['aria-label'])));
  chips()[0].press();
  assert.deepEqual(chips().map((c) => c.attrs['aria-pressed']), ['true', 'false'], 'one compound always stays on');
  assert.equal(draws(), before + 1);
});

test('the rack takes four compounds at most, moves on with the conversation, and empties when nothing is named', async () => {
  const { m, el } = rackOn();
  await m.show(['somatropin', 'enclomiphene', 'semaglutide', 'creatine', 'bpc157'], NAMES);
  assert.deepEqual(all(el, 'rk-chip').map(said), ['HGH', 'Enclomiphene', 'Semaglutide', 'Creatine']);
  assert.equal(m.count(), moved(['somatropin', 'enclomiphene', 'semaglutide', 'creatine']).size);
  // one compound: no switches, and only its tests
  assert.equal(await m.show(['semaglutide'], NAMES), moved(['semaglutide']).size);
  assert.equal(all(el, 'rk-chip').length, 0);
  assert.deepEqual(new Set(all(el, 'rk-tube').map((t) => t.attrs['data-marker'])), moved(['semaglutide']));
  // a compound the Library hasn't drawn moves nothing it can show
  assert.equal(await m.show(['notacompound'], {}), 0);
  assert.equal(m.said(), '');
  assert.match(said(el), /^Nothing Sig is talking about moves a blood test, as far as the Library’s fact sheets say\./);
  assert.equal(await m.show([]), 0);
  assert.match(said(el), /^Blood tests show up here/);
});
