// The body map's checks (scripts/check_body.mjs): what they refuse, what they let through, and
// that the map itself passes. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkEntry, checkMap, format, loadSheets, DOSE } from '../scripts/check_body.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BODY = path.join(ROOT, 'library', 'data', 'body.json');

const places = new Set(['pituitary', 'liver', 'skin', 'veins']);
const markers = new Set(['igf1', 'glucose']);
const sheet = { id: 'x', checked: '2026-10-01', sources: [{ n: 1 }, { n: 2 }], ask_your_clinician: ['How would we watch my blood sugar?'] };
const good = () => ({
  route: 'injection',
  checked: '2026-10-01',
  lines: [
    { at: 'pituitary', op: 'is', say: 'releases growth hormone in pulses', src: [1] },
    { at: 'liver', op: 'up', say: 'IGF-1 rises (after 8 weeks, in a small trial)', markers: ['igf1'], src: [1, 2] },
    { at: 'skin', op: 'warn', say: 'injection-site redness', risk: 'injection-site reactions', src: [2] },
  ],
  dirs: { igf1: 'up' },
  ask: ['How would we watch my blood sugar?'],
});
const check = (entry, s = sheet) => checkEntry('x', entry, { places, markers, sheet: s });
const with_ = (f) => { const e = good(); f(e); return check(e); };
const hasError = (r, re) => r.errors.some((m) => re.test(m));

test('a well-drawn entry passes with nothing to say', () => {
  assert.deepEqual(check(good()), { errors: [], warnings: [] });
});

test('no doses or schedules, but a study\'s length and results are fine', () => {
  for (const s of ['5 mg twice', '250 mcg', '2 IU', '10 units', '0.5 mL', 'once a week', 'twice daily', 'per day', 'the dose', 'dosing matters', 'higher doses']) assert.ok(DOSE.test(s), s);
  for (const s of ['after 8 weeks', 'a 218-person trial', 'about 15% less body weight', 'peaking around 90 days', 'in 12 patients']) assert.ok(!DOSE.test(s), s);
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'releases growth hormone at 100 mcg'; }), /dose or a schedule/));
});

test('places, ops and markers come only from the map', () => {
  assert.ok(hasError(with_((e) => { e.lines[0].at = 'spleen'; }), /isn't one of the map's places/));
  assert.ok(hasError(with_((e) => { e.lines[0].op = 'boosts'; }), /op "boosts"/));
  assert.ok(hasError(with_((e) => { e.lines[1].markers = ['shbg']; }), /marker "shbg"/));
});

test('every source number is on the sheet', () => {
  assert.ok(hasError(with_((e) => { e.lines[0].src = [3]; }), /source 3 isn't on the fact sheet/));
  assert.ok(hasError(with_((e) => { e.lines[0].src = []; }), /src must list/));
});

test('a caution has its short name, and only a caution does', () => {
  assert.ok(hasError(with_((e) => { delete e.lines[2].risk; }), /needs risk/));
  assert.ok(hasError(with_((e) => { e.lines[0].risk = 'something'; }), /only a warn line has risk/));
});

test('the directions name exactly the markers on the lines', () => {
  assert.ok(hasError(with_((e) => { e.dirs = {}; }), /"igf1" is named on a line but has no direction/));
  assert.ok(hasError(with_((e) => { e.dirs.glucose = 'up'; }), /"glucose" isn't named on any line/));
  assert.ok(hasError(with_((e) => { e.dirs.igf1 = 'rises'; }), /not up, down or watch/));
  assert.ok(with_((e) => { e.dirs.igf1 = 'down'; }).warnings.some((w) => /go the other way/.test(w)));
});

test('a clinician question is the sheet\'s own, word for word', () => {
  assert.ok(hasError(with_((e) => { e.ask = ['How would we watch blood sugar?']; }), /word for word/));
  assert.ok(hasError(with_((e) => { e.ask = ['How would we watch my blood sugar?', 'And?']; }), /list of one/));
});

test('routes, advice, wording', () => {
  assert.deepEqual(with_((e) => { e.route = 'injection or pill'; }).errors, []);
  assert.ok(hasError(with_((e) => { e.route = 'injection or pill or patch'; }), /route/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'you should check it'; }), /reads like advice/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'releases growth hormone.'; }), /full stop/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'x'.repeat(91); }), /at most 90/));
  assert.ok(with_((e) => { e.lines[0].say = 'Releases growth hormone'; }).warnings.some((w) => /starts with a capital/.test(w)));
});

test('a sheet newer than its entry asks for a redraw; an entry newer than its sheet is wrong', () => {
  assert.ok(with_((e) => { e.checked = '2026-09-01'; }).warnings.some((w) => /redraw it/.test(w)));
  assert.ok(hasError(with_((e) => { e.checked = '2026-12-01'; }), /later than the sheet's own/));
  assert.ok(hasError(check(good(), null), /has no fact sheet/));
});

test('the layout survives a round trip, a line per row', () => {
  const body = { note: 'n', updated: '2026-11-07', places: [{ at: 'liver', say: 'the liver' }], markers: { igf1: { name: 'IGF-1', what: 'w' } }, compounds: { x: good() } };
  const text = format(body);
  assert.equal(format(JSON.parse(text)), text);
  assert.match(text, /\n {8}\{ "at": "pituitary", "op": "is", "say": "releases growth hormone in pulses", "src": \[1\] \},\n/);
});

test('the map itself checks out, in its usual layout', () => {
  const text = fs.readFileSync(BODY, 'utf8');
  const r = checkMap(JSON.parse(text), loadSheets(), text);
  assert.deepEqual(r.errors, []);
});
