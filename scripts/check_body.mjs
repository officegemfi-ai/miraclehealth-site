// Checks Ask Sig's body map (library/data/body.json) against its rules (scripts/draw_body.md) and
// each compound's fact sheet (library/data/entries/<id>.json). With --drafts or --merge, it checks
// drafts waiting to join the map, one <id>.json each.
//   node scripts/check_body.mjs                 the whole map (CI)
//   node scripts/check_body.mjs --drafts <dir>  drafts only
//   node scripts/check_body.mjs --merge <dir>   check the drafts, then write them into body.json
//   node scripts/check_body.mjs --format        rewrite body.json in its usual layout
// Errors fail (exit 1), among them an entry whose sheet was checked again after it was drawn: the
// fact sheet page prints its lines with links to the sheet's numbered sources. Warnings don't: a
// sheet with no entry yet, a line that might read better. What no script can check is whether the
// sheet really says it: a reviewer reads each line against the sheet.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'library', 'data');
const BODY = path.join(DATA, 'body.json');

export const OPS = new Set(['is', 'up', 'down', 'block', 'watch', 'warn']);
export const DIRS = new Set(['up', 'down', 'watch']);
export const ROUTES = new Set(['injection', 'pill', 'by mouth', 'powder', 'liquid', 'nasal spray', 'nasal drops', 'eye drops', 'on the skin', 'vaginal', 'under the tongue', 'infusion', 'implant', 'inhaled']);
const ENTRY_KEYS = ['route', 'checked', 'lines', 'dirs', 'ask'];
const LINE_KEYS = ['at', 'op', 'say', 'markers', 'risk', 'src', 'lab'];
const ID = /^[a-z0-9]{1,40}$/;
const MARKER = /^[a-z0-9]{1,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SAY = 90;
// Amounts and schedules: the body map never doses. A study's length ("after 8 weeks") and its
// results ("about 15% less body weight") are fine. The word dose itself is refused too, and so is
// any amount with a unit, lab units included: results go in words or percentages, so no line can be
// read as an amount to take. Both are tested on the text as it reads (NFKC: "５ mg" is "5 mg")
const NUM = String.raw`(?:\d+(?:[.,]\d+)?|an?|one|two|three|four|five|six|seven|eight|nine|ten|half an?)`;
export const DOSE = new RegExp([
  String.raw`\b\d+(?:[.,]\d+)?\s?(?:mg|mcg|[µμ]g|ug|g|iu|units?|ml)\b`,
  String.raw`\b${NUM}\s?(?:milligrams?|micrograms?|grams?|international\s+units?|millilit(?:er|re)s?)\b`,
  String.raw`\b(?:once|twice|(?:three|four|five|six|\d+)\s?(?:x|times))\s+(?:(?:a|an|per|each|every)\s+(?:day|week|month|night|morning|evening|year|hour)|daily|weekly|monthly|nightly|yearly|hourly)\b`,
  String.raw`\bper\s+(?:day|week|night|month)\b`,
  String.raw`\b(?:daily|weekly|nightly|monthly)\s+(?:injections?|shots?|use|pills?|tablets?|capsules?|drops?|sprays?)\b`,
  String.raw`\b${NUM}\s+(?:capsules?|tablets?|pills?|drops?|sprays?|puffs?|scoops?|softgels?|gummies|injections?|shots?)\s+(?:a|an|per|each|every|daily|nightly|weekly|monthly|once|twice)\b`,
  String.raw`\bevery\s+(?:other\s+|few\s+|\d+\s+|two\s+|three\s+|four\s+|six\s+|eight\s+|twelve\s+)?(?:days?|weeks?|nights?|months?|hours?|mornings?|evenings?)\b`,
  String.raw`\b(?:bid|tid|qid|qd|qod|eod|qhs|prn)\b`,
  String.raw`\bmicro-?dos(?:e|es|ed|ing)\b`,
  String.raw`\b\d+\s+(?:days?|weeks?|months?)\s+on\b[^.;]{0,16}?\boff\b`,
  String.raw`\bdos(?:e|es|ed|ing|age|ages)\b`,
].join('|'), 'i');
export const ADVICE = /\b(?:you should|you must|you can|take it|take this|we recommend|is recommended|try it|consider taking|should|recommended|best taken|make sure)\b/i;
// Nothing a reader can't see: bidi overrides, zero-width spaces and other formatting characters
const HIDDEN = /\p{Cf}/u;
// A check from the sheet's lab list may name it instead of a source: "before.0", "during.1", "why"
const LAB = /^(before|during)\.(\d{1,2})$|^why$/;
const labText = (sheet, ref) => {
  const m = typeof ref === 'string' ? LAB.exec(ref) : null;
  if (!m) return null;
  const t = ref === 'why' ? sheet.labs?.why : Array.isArray(sheet.labs?.[m[1]]) ? sheet.labs[m[1]][Number(m[2])] : null;
  return typeof t === 'string' && t.trim() ? t : null;
};
// A line with no source of its own can say what's checked, not which way anything goes
const DIRECTION = /\b(?:ris(?:e|es|ing)|rose|fall(?:s|ing)?|fell|drops?|dropped|increas\w*|decreas\w*|rais\w*|lower(?:s|ed|ing)?|higher|boost\w*|reduc\w*|improv\w*|worsen\w*|up|down)\b/i;
const reads = (t) => t.normalize('NFKC');

const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const intsIn = (xs) => Array.isArray(xs) && xs.every((n) => Number.isInteger(n));

// One compound's entry, against the map's places and markers and its own fact sheet
export function checkEntry(id, entry, { places, markers, sheet }) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(`${id}: ${m}`);
  const warn = (m) => warnings.push(`${id}: ${m}`);
  if (!ID.test(id)) err('the id must be lowercase letters and digits');
  if (!sheet) { err(`has no fact sheet (library/data/entries/${id}.json)`); return { errors, warnings }; }
  if (!isObj(entry)) { err('the entry must be an object'); return { errors, warnings }; }
  for (const k of Object.keys(entry)) if (!ENTRY_KEYS.includes(k)) err(`unknown field "${k}"`);
  const sources = new Set((sheet.sources || []).map((s) => s?.n).filter(Number.isInteger));

  if (entry.route !== undefined) {
    const parts = typeof entry.route === 'string' ? entry.route.split(' or ') : [];
    if (!parts.length || parts.length > 2 || !parts.every((p) => ROUTES.has(p))) err(`route "${entry.route}" isn't one or two of: ${[...ROUTES].join(', ')}`);
  }
  // The sheet's date, so a sheet checked again later stops the build until its lines are read again:
  // its page prints them with links to its numbered sources, which a re-check may renumber
  if (entry.checked === undefined) {
    if (sheet.checked) err(`checked is missing: read the lines against the sheet, then set it to the sheet's ${sheet.checked}`);
  } else if (typeof entry.checked !== 'string' || !DATE.test(entry.checked)) err('checked must be a date, YYYY-MM-DD');
  else if (sheet.checked && entry.checked > sheet.checked) err(`checked ${entry.checked} is later than the sheet's own (${sheet.checked})`);
  else if (sheet.checked && entry.checked < sheet.checked) err(`its fact sheet was checked again (${sheet.checked}) after this entry was drawn (${entry.checked}): read its lines against the sheet, then set checked to ${sheet.checked}`);

  const lines = entry.lines;
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 12) err('lines must be a list of 1 to 12');
  else {
    if (lines.length < 3) warn(`${lines.length} line${lines.length === 1 ? '' : 's'}; at least 3 read best`);
    const cautions = lines.filter((ln) => ln?.op === 'warn').length;
    if (cautions > 5) warn(`${cautions} cautions; keep the 5 most serious`);
  }
  const named = new Map(); // marker -> the ops of the lines naming it
  const sourced = new Set(); // markers named on a line with a source of its own
  for (const [i, ln] of (Array.isArray(lines) ? lines : []).entries()) {
    const at = `line ${i + 1}`;
    if (!isObj(ln)) { err(`${at} must be an object`); continue; }
    for (const k of Object.keys(ln)) if (!LINE_KEYS.includes(k)) err(`${at}: unknown field "${k}"`);
    if (!places.has(ln.at)) err(`${at}: "${ln.at}" isn't one of the map's places`);
    if (!OPS.has(ln.op)) err(`${at}: op "${ln.op}" isn't one of ${[...OPS].join(', ')}`);
    const say = ln.say;
    if (typeof say !== 'string' || say.trim().length < 3) err(`${at}: say is missing`);
    else {
      if (say.length > MAX_SAY) err(`${at}: say is ${say.length} characters (at most ${MAX_SAY})`);
      if (say !== say.trim() || /\s{2}|[\u0000-\u001f\u007f]/.test(say)) err(`${at}: say has extra spaces or control characters`);
      if (HIDDEN.test(say)) err(`${at}: say has an invisible formatting character (a direction override or a zero-width space)`);
      if (/\.$/.test(say)) err(`${at}: say ends with a full stop`);
      if (DOSE.test(reads(say))) err(`${at}: "${say}" reads like a dose or a schedule`);
      if (ADVICE.test(reads(say))) err(`${at}: "${say}" reads like advice`);
      if (/^[A-Z][a-z]/.test(say)) warn(`${at}: "${say}" starts with a capital (lowercase unless it's a name)`);
    }
    // Every line cites the sources that back it. The one exception, a check from the sheet's own lab
    // list when the sheet gives that lab no source, names the lab instead
    const unsourced = Array.isArray(ln.src) && ln.src.length === 0;
    if (!intsIn(ln.src) || ln.src.length > 4 || (unsourced && (ln.op !== 'watch' || ln.lab === undefined))) {
      err(`${at}: src must list 1 to 4 of the sheet's source numbers${ln.op === 'watch' ? ' (a check from the sheet\'s lab list that has none names its lab instead: "lab": ["before.0"])' : ''}`);
    } else {
      for (const n of ln.src) if (!sources.has(n)) err(`${at}: source ${n} isn't on the fact sheet (it has ${[...sources].join(', ') || 'none'})`);
      if (new Set(ln.src).size !== ln.src.length) err(`${at}: src repeats a number`);
    }
    if (ln.lab !== undefined) {
      if (ln.op !== 'watch') err(`${at}: only a watch line names a lab`);
      if (!Array.isArray(ln.lab) || ln.lab.length < 1 || ln.lab.length > 3 || new Set(ln.lab).size !== ln.lab.length) err(`${at}: lab must list 1 to 3 of the sheet's labs, each once`);
      else for (const ref of ln.lab) if (!labText(sheet, ref)) err(`${at}: lab "${ref}" isn't on the sheet's lab list (before.N, during.N or why)`);
    }
    if (unsourced && typeof say === 'string' && DIRECTION.test(reads(say))) err(`${at}: "${say}" says which way something goes, which needs a source`);
    if (ln.markers !== undefined) {
      if (!Array.isArray(ln.markers) || !ln.markers.length) err(`${at}: markers, when there, must list at least one`);
      else {
        if (new Set(ln.markers).size !== ln.markers.length) err(`${at}: markers repeats one`);
        for (const m of ln.markers) {
          if (!markers.has(m)) err(`${at}: marker "${m}" isn't in the map's markers`);
          else {
            if (!named.has(m)) named.set(m, []);
            named.get(m).push(ln.op);
            if (!unsourced) sourced.add(m);
          }
        }
      }
    }
    if (ln.op === 'warn') {
      if (typeof ln.risk !== 'string' || ln.risk.trim().length < 3 || ln.risk.length > 40) err(`${at}: a warn line needs risk, its short name (3 to 40 characters)`);
      else if (HIDDEN.test(ln.risk) || /[\u0000-\u001f\u007f]/.test(ln.risk)) err(`${at}: risk has an invisible or control character`);
      else if (DOSE.test(reads(ln.risk)) || ADVICE.test(reads(ln.risk))) err(`${at}: risk "${ln.risk}" reads like a dose, a schedule or advice`);
    } else if (ln.risk !== undefined) err(`${at}: only a warn line has risk`);
  }

  const dirs = entry.dirs ?? {};
  if (!isObj(dirs)) err('dirs must be an object');
  else {
    for (const [m, d] of Object.entries(dirs)) {
      if (!markers.has(m)) err(`dirs: marker "${m}" isn't in the map's markers`);
      if (!DIRS.has(d)) err(`dirs: "${m}" is "${d}", not up, down or watch`);
      if (!named.has(m)) err(`dirs: "${m}" isn't named on any line`);
    }
    for (const [m, ops] of named) {
      if (!Object.hasOwn(dirs, m)) err(`dirs: "${m}" is named on a line but has no direction`);
      else if ((dirs[m] === 'up' && ops.includes('down') && !ops.includes('up')) || (dirs[m] === 'down' && ops.includes('up') && !ops.includes('down'))) {
        err(`dirs: "${m}" is ${dirs[m]}, but the lines naming it go the other way`);
      } else if ((dirs[m] === 'up' || dirs[m] === 'down') && !sourced.has(m)) err(`dirs: "${m}" is ${dirs[m]}, but only a line without a source names it (make it watch)`);
    }
  }

  const qs = Array.isArray(sheet.ask_your_clinician) ? sheet.ask_your_clinician : [];
  if (entry.ask === undefined) {
    if (qs.length) err('ask is missing: one of the sheet\'s own "ask your clinician" questions, word for word');
  } else if (!Array.isArray(entry.ask) || entry.ask.length !== 1 || typeof entry.ask[0] !== 'string') err('ask must be a list of one question');
  else if (!qs.includes(entry.ask[0])) err(`ask "${entry.ask[0]}" isn't one of the sheet's own "ask your clinician" questions, word for word`);
  return { errors, warnings };
}

// The whole map: its shape, its vocabulary, each entry, its layout, and which sheets it doesn't cover
export function checkMap(body, sheets, text) {
  const errors = [];
  const warnings = [];
  if (!isObj(body)) return { errors: ['body.json must be an object'], warnings };
  if (typeof body.note !== 'string' || !body.note.trim()) errors.push('note is missing');
  if (typeof body.updated !== 'string' || !DATE.test(body.updated)) errors.push('updated must be a date, YYYY-MM-DD');
  const places = new Set();
  for (const p of Array.isArray(body.places) ? body.places : (errors.push('places must be a list'), [])) {
    if (!isObj(p) || typeof p.at !== 'string' || !p.at || typeof p.say !== 'string' || !p.say) { errors.push(`a place needs at and say: ${JSON.stringify(p)}`); continue; }
    if (places.has(p.at)) errors.push(`place "${p.at}" is listed twice`);
    places.add(p.at);
  }
  const markers = new Set();
  for (const [k, m] of Object.entries(isObj(body.markers) ? body.markers : (errors.push('markers must be an object'), {}))) {
    if (!MARKER.test(k)) errors.push(`marker key "${k}" must be lowercase letters and digits`);
    if (!isObj(m) || typeof m.name !== 'string' || !m.name || typeof m.what !== 'string' || !m.what) errors.push(`marker "${k}" needs a name and what it is`);
    markers.add(k);
  }
  const compounds = isObj(body.compounds) ? body.compounds : (errors.push('compounds must be an object'), {});
  for (const [id, entry] of Object.entries(compounds)) {
    const r = checkEntry(id, entry, { places, markers, sheet: sheets.get(id) });
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  if (text !== undefined) for (const d of duplicateKeys(text)) errors.push(`${d} is listed twice: keep one (JSON keeps only the last, and --format would drop the other)`);
  if (text !== undefined && errors.length === 0 && text !== format(body)) errors.push('body.json isn\'t in its usual layout: run node scripts/check_body.mjs --format');
  const missing = [...sheets.keys()].filter((id) => !(id in compounds));
  if (missing.length) warnings.push(`${missing.length} of ${sheets.size} fact sheets aren't drawn yet: ${missing.join(', ')}`);
  return { errors, warnings, places, markers, drawn: Object.keys(compounds).length };
}

// JSON.parse keeps only the last of two equal keys in one object, so a merge that leaves a compound in
// twice would lose a copy without a word: the keys that appear twice, and where
export function duplicateKeys(text) {
  const found = [];
  const stack = [];
  let key = true;
  let last = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      const top = stack[stack.length - 1];
      if (top?.keys && key) {
        let k;
        try { k = JSON.parse(text.slice(i, j + 1)); } catch { k = text.slice(i + 1, j); }
        if (top.keys.has(k)) found.push(`"${k}" in ${top.name || 'the top level'}`);
        top.keys.add(k);
        last = k;
        key = false;
      }
      i = j;
    } else if (ch === '{' || ch === '[') {
      stack.push({ keys: ch === '{' ? new Set() : null, name: stack.length ? last : '' });
      key = ch === '{';
    } else if (ch === '}' || ch === ']') stack.pop();
    else if (ch === ',') key = !!stack[stack.length - 1]?.keys;
  }
  return found;
}

// The layout people edit by hand: a place, a marker or a line per row
const inline = (v) => (Array.isArray(v) ? `[${v.map(inline).join(', ')}]`
  : isObj(v) ? (Object.keys(v).length ? `{ ${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${inline(x)}`).join(', ')} }` : '{}')
    : JSON.stringify(v));
const ordered = (o, keys) => Object.fromEntries([...keys.filter((k) => k in o), ...Object.keys(o).filter((k) => !keys.includes(k))].map((k) => [k, o[k]]));
export function normalize(entry) {
  const e = ordered(entry, ENTRY_KEYS);
  if (Array.isArray(e.lines)) e.lines = e.lines.map((ln) => (isObj(ln) ? ordered(ln, LINE_KEYS) : ln));
  return e;
}
export function format(body) {
  const out = ['{'];
  const top = Object.keys(body);
  top.forEach((k, i) => {
    const last = i === top.length - 1 ? '' : ',';
    const v = body[k];
    if (k === 'places' && Array.isArray(v)) {
      out.push(`  "places": [`, ...v.map((p, j) => `    ${inline(p)}${j < v.length - 1 ? ',' : ''}`), `  ]${last}`);
    } else if (k === 'markers' && isObj(v)) {
      const ks = Object.keys(v);
      out.push(`  "markers": {`, ...ks.map((m, j) => `    ${JSON.stringify(m)}: ${inline(v[m])}${j < ks.length - 1 ? ',' : ''}`), `  }${last}`);
    } else if (k === 'compounds' && isObj(v)) {
      const ids = Object.keys(v);
      out.push(`  "compounds": {`);
      ids.forEach((id, j) => {
        const c = normalize(v[id]);
        const ck = Object.keys(c);
        out.push(`    ${JSON.stringify(id)}: {`);
        ck.forEach((f, n) => {
          const end = n < ck.length - 1 ? ',' : '';
          if (f === 'lines' && Array.isArray(c.lines)) out.push(`      "lines": [`, ...c.lines.map((ln, x) => `        ${inline(ln)}${x < c.lines.length - 1 ? ',' : ''}`), `      ]${end}`);
          else out.push(`      ${JSON.stringify(f)}: ${inline(c[f])}${end}`);
        });
        out.push(`    }${j < ids.length - 1 ? ',' : ''}`);
      });
      out.push(`  }${last}`);
    } else out.push(`  ${JSON.stringify(k)}: ${inline(v)}${last}`);
  });
  out.push('}');
  return `${out.join('\n')}\n`;
}

export function loadSheets(dir = path.join(DATA, 'entries')) {
  const sheets = new Map();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    sheets.set(s.id, s);
  }
  return sheets;
}
export function loadDrafts(dir) {
  const drafts = new Map();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const id = f.slice(0, -5);
    try { drafts.set(id, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) { drafts.set(id, { __bad: String(e.message || e) }); }
  }
  return drafts;
}
export function checkDrafts(drafts, vocab, sheets) {
  const errors = [];
  const warnings = [];
  for (const [id, d] of drafts) {
    if (d?.__bad) { errors.push(`${id}: the draft isn't valid JSON (${d.__bad})`); continue; }
    const r = checkEntry(id, d, { ...vocab, sheet: sheets.get(id) });
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  return { errors, warnings };
}

function report({ errors, warnings }, file = 'library/data/body.json') {
  const gh = !!process.env.GITHUB_ACTIONS;
  for (const w of warnings) console.log(gh ? `::warning file=${file}::${w}` : `warning: ${w}`);
  for (const e of errors) console.log(gh ? `::error file=${file}::${e}` : `error: ${e}`);
}

const USAGE = 'usage: node scripts/check_body.mjs [--drafts <dir> | --merge <dir> [--date YYYY-MM-DD] | --format]';
function main(argv) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  for (const name of ['--drafts', '--merge', '--date']) {
    if (argv.includes(name) && (!arg(name) || arg(name).startsWith('--'))) { console.log(`${name} needs a value\n${USAGE}`); return 2; }
  }
  const text = fs.readFileSync(BODY, 'utf8');
  const body = JSON.parse(text);
  const sheets = loadSheets();
  // Never write over a copy JSON.parse dropped
  const twice = duplicateKeys(text);
  if (twice.length && (argv.includes('--format') || argv.includes('--merge'))) {
    for (const d of twice) console.log(`error: ${d} is listed twice: keep one, then run this again`);
    return 1;
  }
  if (argv.includes('--format')) {
    fs.writeFileSync(BODY, format(body));
    console.log('body.json rewritten in its usual layout');
    return 0;
  }
  const dir = arg('--drafts') || arg('--merge');
  if (dir) {
    const map = checkMap(body, sheets);
    const drafts = loadDrafts(dir);
    const r = checkDrafts(drafts, { places: map.places, markers: map.markers }, sheets);
    report(r, dir);
    if (r.errors.length) { console.log(`${r.errors.length} problem${r.errors.length === 1 ? '' : 's'} in ${drafts.size} draft${drafts.size === 1 ? '' : 's'}`); return 1; }
    if (!argv.includes('--merge')) { console.log(`${drafts.size} draft${drafts.size === 1 ? '' : 's'} check out`); return 0; }
    for (const [id, d] of drafts) body.compounds[id] = normalize(d);
    body.compounds = Object.fromEntries(Object.keys(body.compounds).sort().map((id) => [id, body.compounds[id]]));
    body.updated = arg('--date') || new Date().toISOString().slice(0, 10);
    fs.writeFileSync(BODY, format(body));
    console.log(`${drafts.size} entr${drafts.size === 1 ? 'y' : 'ies'} written into body.json; ${Object.keys(body.compounds).length} of ${sheets.size} fact sheets drawn`);
    return 0;
  }
  const r = checkMap(body, sheets, text);
  report(r);
  if (r.errors.length) { console.log(`The body map has ${r.errors.length} problem${r.errors.length === 1 ? '' : 's'}`); return 1; }
  console.log(`The body map checks out: ${r.drawn} of ${sheets.size} fact sheets drawn, ${r.places.size} places, ${r.markers.size} markers`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
