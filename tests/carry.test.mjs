// Moving saved things from the old address (lib/carry.js): what's read, what counts, and that
// nothing already on this device is written over. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saved, words, merge, MAX } from '../lib/carry.js';

// A browser's storage, as far as the page can see it
function store(init = {}, { quota = Infinity } = {}) {
  const m = new Map(Object.entries(init));
  const used = () => [...m].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (used() + k.length + String(v).length > quota) throw new Error('QuotaExceededError'); m.set(k, String(v)); },
    removeItem: (k) => m.delete(k),
    all: () => Object.fromEntries(m),
  };
}
const chat = (id, at, title = 'Chat') => ({ id, at, title });
const J = JSON.stringify;

test('reads only the site’s own saved things, and says what’s worth asking about', () => {
  const s = store({
    'mh-ai-stack-v1': J({ v: 1, items: [{ id: 'bpc157' }] }),
    'mh-sig-chats-v1': J([chat('aaaaaaaa', 2), chat('bbbbbbbb', 1)]),
    'mh-sig-chat-v1-aaaaaaaa': J([{ role: 'user', text: 'hi' }]),
    'mh-sig-who-v1': J(['evidence']),
    'sb-x-auth-token': 'secret',
    other: 'x',
  });
  const r = saved(s);
  assert.deepEqual(Object.keys(r.items).sort(), ['mh-ai-stack-v1', 'mh-sig-chat-v1-aaaaaaaa', 'mh-sig-chats-v1', 'mh-sig-who-v1']);
  assert.equal(r.any, true);
  // A chat in the list without its words isn't counted
  assert.deepEqual(r.mine, { stack: true, plan: false, checkins: false, chats: 1, follows: 0 });
  assert.equal(words(r.mine), 'your stack and 1 chat with Sig');
});

test('settings alone aren’t worth asking about', () => {
  const r = saved(store({ 'mh-sig-who-v1': J(['evidence']), 'mh-sig-side': 'folded', 'mh-ai-adult': 'true' }));
  assert.equal(r.any, false);
  assert.equal(Object.keys(r.items).length, 3);
});

test('says it the way a person would', () => {
  assert.equal(words({ stack: true, plan: true, checkins: false, chats: 4, follows: 0 }), 'your stack, your plan and 4 chats with Sig');
  assert.equal(words({ stack: false, plan: false, checkins: true, chats: 0, follows: 1 }), 'your check-ins and 1 compound you follow');
});

test('never writes over what’s already on this device', () => {
  const s = store({ 'mh-ai-stack-v1': 'here', 'mh-ai-plan-v1': 'here plan' });
  const r = merge(s, { 'mh-ai-stack-v1': 'there', 'mh-my-checkins-v1': 'there checkins' });
  assert.equal(s.getItem('mh-ai-stack-v1'), 'here');
  assert.equal(s.getItem('mh-my-checkins-v1'), 'there checkins');
  assert.equal(r.added, 1);
  assert.equal(r.kept, 1);
});

test('keeps chats and followed compounds from both addresses, newest first', () => {
  const s = store({
    'mh-sig-chats-v1': J([chat('hhhhhhhh', 5, 'Here')]),
    'mh-sig-chat-v1-hhhhhhhh': 'here words',
    'mh-sig-follow-v1': J(['bpc157']),
  });
  merge(s, {
    'mh-sig-chats-v1': J([chat('tttttttt', 9, 'There'), chat('oooooooo', 1, 'Old'), chat('nnnnnnnn', 3, 'No words')]),
    'mh-sig-chat-v1-tttttttt': 'there words',
    'mh-sig-chat-v1-oooooooo': 'old words',
    'mh-sig-chat-v1-hhhhhhhh': 'a different chat with the same name',
    'mh-sig-follow-v1': J(['tb500', 'bpc157']),
  });
  assert.deepEqual(JSON.parse(s.getItem('mh-sig-chats-v1')).map((c) => c.id), ['tttttttt', 'hhhhhhhh', 'oooooooo']);
  assert.equal(s.getItem('mh-sig-chat-v1-hhhhhhhh'), 'here words');
  assert.equal(s.getItem('mh-sig-chat-v1-tttttttt'), 'there words');
  assert.deepEqual(JSON.parse(s.getItem('mh-sig-follow-v1')), ['bpc157', 'tb500']);
});

test('takes nothing that isn’t the site’s, nor more than a device can hold', () => {
  const s = store();
  merge(s, { 'sb-x-auth-token': 'no', '__proto__': 'no', 'mh-BAD': 'no', 'mh-ok-v1': 7, 'mh-ai-plan-v1': 'yes' });
  assert.deepEqual(s.all(), { 'mh-ai-plan-v1': 'yes' });
  const big = store();
  merge(big, { 'mh-a-v1': 'x'.repeat(MAX - 10), 'mh-b-v1': 'y'.repeat(100) });
  assert.equal(big.getItem('mh-b-v1'), null);
  assert.equal(merge(store(), null).added, 0);
});

test('a full device says so instead of failing quietly', () => {
  const s = store({}, { quota: 40 });
  const r = merge(s, { 'mh-ai-plan-v1': 'p'.repeat(10), 'mh-ai-stack-v1': 's'.repeat(60) });
  assert.equal(s.getItem('mh-ai-plan-v1'), 'p'.repeat(10));
  assert.equal(r.failed, 1);
});
