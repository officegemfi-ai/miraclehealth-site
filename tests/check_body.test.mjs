// The body map's checks (scripts/check_body.mjs): what they refuse, what they let through, and
// that the map itself passes. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkEntry, checkMap, format, loadSheets, duplicateKeys, DOSE, ADVICE } from '../scripts/check_body.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BODY = path.join(ROOT, 'library', 'data', 'body.json');

const places = new Set(['pituitary', 'liver', 'skin', 'veins']);
const markers = new Set(['igf1', 'glucose']);
const sheet = {
  id: 'x', checked: '2026-10-01', sources: [{ n: 1 }, { n: 2 }], ask_your_clinician: ['How would we watch my blood sugar?'],
  labs: { before: ['Fasting glucose'], during: ['Liver tests if vomiting is severe'], why: 'Nothing routine beyond these.' },
};
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
  for (const s of ['5 mg twice', '250 mcg', '2 IU', '10 units', '0.5 mL', 'once a week', 'twice daily', 'per day', 'the dose', 'dosing matters', 'higher doses',
    '5 milligrams', '250 micrograms', '2 international units', 'every other day', 'every 8 hours', 'four times a day', '2x daily', 'BID with food',
    '2 capsules a day', 'one tablet nightly', '5 days on, 2 off', 'microdosing', 'daily injections', 'a pill a day', '5 µg', '5 μg']) assert.ok(DOSE.test(s), s);
  for (const s of ['after 8 weeks', 'a 218-person trial', 'about 15% less body weight', 'peaking around 90 days', 'in 12 patients',
    'once a deficiency is corrected', 'twice the risk', 'blood pressure drops a little', 'after 12 weeks on semaglutide', 'every place it acts', 'three times higher']) assert.ok(!DOSE.test(s), s);
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'releases growth hormone at 100 mcg'; }), /dose or a schedule/));
  assert.ok(hasError(with_((e) => { e.lines[2].risk = 'high-dose reactions'; }), /reads like a dose/));
});

test('a dose can\'t hide in characters a reader doesn\'t see or in wide forms', () => {
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'acts here at \u202Egm 5\u202C'; }), /invisible formatting character/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'acts here at 5\u200Bmg'; }), /invisible formatting character/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'acts here at ５ mg'; }), /dose or a schedule/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'acts here at 5 ｍｇ'; }), /dose or a schedule/));
  assert.ok(hasError(with_((e) => { e.lines[2].risk = 'swelling\u200B'; }), /invisible/));
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
  assert.ok(hasError(with_((e) => { e.dirs.igf1 = 'down'; }), /go the other way/));
  // A name every object inherits isn't a direction
  const e = good();
  e.lines[1].markers = ['igf1', 'constructor'];
  const r = checkEntry('x', e, { places, markers: new Set([...markers, 'constructor']), sheet });
  assert.ok(r.errors.some((m) => /"constructor" is named on a line but has no direction/.test(m)));
});

test('a clinician question is the sheet\'s own, word for word', () => {
  assert.ok(hasError(with_((e) => { e.ask = ['How would we watch blood sugar?']; }), /word for word/));
  assert.ok(hasError(with_((e) => { e.ask = ['How would we watch my blood sugar?', 'And?']; }), /list of one/));
});

test('routes, advice, wording', () => {
  assert.deepEqual(with_((e) => { e.route = 'injection or pill'; }).errors, []);
  assert.ok(hasError(with_((e) => { e.route = 'injection or pill or patch'; }), /route/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'you should check it'; }), /reads like advice/));
  for (const s of ['should be avoided in pregnancy', 'not recommended in pregnancy', 'best taken at night', 'are recommended']) assert.ok(ADVICE.test(s), s);
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'releases growth hormone.'; }), /full stop/));
  assert.ok(hasError(with_((e) => { e.lines[0].say = 'x'.repeat(91); }), /at most 90/));
  assert.ok(with_((e) => { e.lines[0].say = 'Releases growth hormone'; }).warnings.some((w) => /starts with a capital/.test(w)));
});

test('a sheet checked again after its entry stops the build until the entry is; an entry newer than its sheet is wrong', () => {
  assert.ok(hasError(with_((e) => { e.checked = '2026-09-01'; }), /checked again \(2026-10-01\).*set checked to 2026-10-01/));
  assert.ok(hasError(with_((e) => { e.checked = '2026-12-01'; }), /later than the sheet's own/));
  assert.ok(hasError(with_((e) => { delete e.checked; }), /checked is missing/));
  assert.ok(hasError(with_((e) => { delete e.ask; }), /ask is missing/));
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

test('only a check from the lab list may go without a source, and it names its lab', () => {
  const plus = (ln) => with_((e) => { e.lines.splice(1, 0, ln); });
  assert.deepEqual(plus({ at: 'liver', op: 'watch', say: 'liver tests checked if vomiting is severe', src: [], lab: ['during.0'] }).errors, []);
  assert.deepEqual(plus({ at: 'liver', op: 'watch', say: 'nothing routine; fasting glucose first', src: [], lab: ['before.0', 'why'] }).errors, []);
  assert.ok(hasError(plus({ at: 'liver', op: 'watch', say: 'liver tests checked', src: [] }), /names its lab instead/));
  assert.ok(hasError(plus({ at: 'liver', op: 'watch', say: 'liver tests checked', src: [], lab: ['during.4'] }), /isn't on the sheet's lab list/));
  assert.ok(hasError(plus({ at: 'liver', op: 'watch', say: 'liver tests checked', src: [], lab: 'during.0' }), /lab must list/));
  assert.ok(hasError(plus({ at: 'liver', op: 'is', say: 'liver tests checked', src: [1], lab: ['during.0'] }), /only a watch line names a lab/));
  assert.ok(hasError(plus({ at: 'liver', op: 'watch', say: 'blood pressure rises (user reports)', src: [], lab: ['during.0'] }), /says which way something goes/));
  assert.ok(hasError(with_((e) => { e.lines[0].src = []; }), /src must list/));
  // A direction needs a line with a source of its own
  assert.ok(hasError(with_((e) => { e.lines.splice(1, 1, { at: 'liver', op: 'watch', say: 'IGF-1 checked', markers: ['igf1'], src: [], lab: ['before.0'] }); }), /only a line without a source names it/));
});

test('a key listed twice is caught before JSON drops a copy', () => {
  assert.deepEqual(duplicateKeys('{"compounds": {"zinc": {"a": 1}, "iron": {}, "zinc": {"a": 2}}}'), ['"zinc" in compounds']);
  assert.deepEqual(duplicateKeys('{"a": {"x": 1}, "b": {"x": 2}, "c": ["x", "x", {"y": "x", "x": "y"}]}'), []);
  assert.deepEqual(duplicateKeys('{"a": "say \\"b\\"", "a": 2}'), ['"a" in the top level']);
  const body = { note: 'n', updated: '2026-11-07', places: [{ at: 'liver', say: 'the liver' }], markers: { igf1: { name: 'IGF-1', what: 'w' } }, compounds: { x: good() } };
  const text = format(body).replace('  "compounds": {\n', `  "compounds": {\n    "x": ${JSON.stringify(good())},\n`);
  assert.ok(checkMap(JSON.parse(text), new Map([['x', sheet]]), text).errors.some((m) => /"x" in compounds is listed twice/.test(m)));
});
