// The design check keeps the stylesheets to the brand book: it passes on the site as it is (no drift
// past design/baseline.json), and it would catch a colour, face or radius from outside the brand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the site keeps to its design baseline', () => {
  const out = execFileSync(process.execPath, ['scripts/design_check.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /^design check: /m);
});

test('drift is caught: an off-brand colour, face, radius and size', () => {
  // a copy of the checker beside a stylesheet with drift in it, against an empty baseline
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'design-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'design'));
  fs.copyFileSync(path.join(ROOT, 'scripts', 'design_check.mjs'), path.join(dir, 'scripts', 'design_check.mjs'));
  fs.copyFileSync(path.join(ROOT, 'design', 'tokens.json'), path.join(dir, 'design', 'tokens.json'));
  fs.writeFileSync(path.join(dir, 'design', 'baseline.json'), JSON.stringify({ counts: {} }));
  fs.writeFileSync(path.join(dir, 'drift.css'), [
    '.a{color:#F7F8FA;background:#000000;border:1px solid rgba(255,255,255,.1)}',   // on brand
    '.b{color:#3B3B3B}',                                                              // off-brand grey
    '.c{font-family:Arial,sans-serif}',                                               // another face
    '.d{border-radius:40px}',                                                         // a pill
    '.e{font-size:13.25px}',                                                          // off the scale
  ].join('\n'));
  let out = '';
  try {
    execFileSync(process.execPath, ['scripts/design_check.mjs'], { cwd: dir, encoding: 'utf8' });
    assert.fail('the check should have failed');
  } catch (e) { out = String(e.stdout); }
  assert.match(out, /colour: 1 now, 0 allowed/);
  assert.match(out, /font-family: 1 now, 0 allowed/);
  assert.match(out, /radius: 1 now, 0 allowed/);
  assert.match(out, /font-size: 1 now, 0 allowed/);
  assert.doesNotMatch(out, /drift\.css:1 /);
});
