// What a member keeps on a device, moving from the old address (miraclehealth.us) to this one.
// A browser keeps each address's saved things apart, so they don't follow on their own: the old
// address's forwarding page (scripts/build_forward.mjs) reads them and hands them to /move/ here,
// in a window it opens, by postMessage. They never travel in a link and never reach a server.
// Shared by both sides; it imports nothing and touches no page.

export const NEW = 'https://theunhyped.com';
export const OLD = ['https://miraclehealth.us', 'https://www.miraclehealth.us'];
// Only the site's own saved things, by their names
const NAME = /^mh-[a-z0-9-]{1,60}$/;
const LIST = 'mh-sig-chats-v1';
const ONE = /^mh-sig-chat-v1-([a-z0-9]{6,16})$/;
const FOLLOW = 'mh-sig-follow-v1';
// A browser gives an address about 5 MB of saved text: never more than that in one move
export const MAX = 4_500_000;

const read = (s, k) => { try { return s.getItem(k); } catch { return null; } };
const json = (v) => { try { return JSON.parse(v); } catch { return undefined; } };
const list = (v) => (Array.isArray(v) ? v : []);
const chatsIn = (v) => list(json(v)).filter((c) => c && typeof c.id === 'string' && /^[a-z0-9]{6,16}$/.test(c.id));

// Everything saved here, and what of it is worth asking about: a stack, a plan, check-ins,
// chats with Sig, followed compounds. Settings (which agents answer, the side panel) come along
// but don't count.
export function saved(s) {
  const items = {};
  let size = 0;
  let n = 0;
  try { n = s.length; } catch { n = 0; }
  for (let i = 0; i < n; i++) {
    let k = null;
    try { k = s.key(i); } catch { k = null; }
    if (!k || !NAME.test(k)) continue;
    const v = read(s, k);
    if (typeof v !== 'string' || size + k.length + v.length > MAX) continue;
    items[k] = v;
    size += k.length + v.length;
  }
  const has = (k) => typeof items[k] === 'string' && items[k] !== 'null' && items[k] !== '';
  const chats = has(LIST) ? chatsIn(items[LIST]).filter((c) => typeof items[`mh-sig-chat-v1-${c.id}`] === 'string').length : 0;
  const follows = has(FOLLOW) ? list(json(items[FOLLOW])).length : 0;
  const mine = {
    stack: has('mh-ai-stack-v1'), plan: has('mh-ai-plan-v1'), checkins: has('mh-my-checkins-v1'), chats, follows,
  };
  return { items, size, mine, any: mine.stack || mine.plan || mine.checkins || chats > 0 || follows > 0 };
}

// In words, for the forwarding page: "your stack, your plan and 4 chats with Sig"
export function words(mine) {
  const parts = [];
  if (mine.stack) parts.push('your stack');
  if (mine.plan) parts.push('your plan');
  if (mine.checkins) parts.push('your check-ins');
  if (mine.chats) parts.push(mine.chats === 1 ? '1 chat with Sig' : `${mine.chats} chats with Sig`);
  if (mine.follows) parts.push(mine.follows === 1 ? '1 compound you follow' : `${mine.follows} compounds you follow`);
  return parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

// Into this device's storage, never over what's already here: something saved at both addresses
// keeps this one's, chats and followed compounds from both are kept together. Says how it went.
export function merge(s, items) {
  const out = { added: 0, kept: 0, failed: 0 };
  const write = (k, v) => { try { s.setItem(k, v); return true; } catch { return false; } };
  const given = items && typeof items === 'object' ? items : {};
  let size = 0;
  const ok = Object.entries(given).filter(([k, v]) => {
    if (!NAME.test(k) || typeof v !== 'string') return false;
    size += k.length + v.length;
    return size <= MAX;
  });
  // Each chat first, so the list below only names chats that are here
  for (const [k, v] of ok) {
    if (k === LIST || k === FOLLOW) continue;
    if (read(s, k) !== null) { if (!ONE.test(k)) out.kept++; continue; }
    if (write(k, v)) out.added++; else out.failed++;
  }
  const theirs = Object.fromEntries(ok);
  if (typeof theirs[LIST] === 'string') {
    const here = read(s, LIST);
    const byId = new Map();
    for (const c of [...chatsIn(here), ...chatsIn(theirs[LIST])]) {
      if (!byId.has(c.id) && read(s, `mh-sig-chat-v1-${c.id}`) !== null) byId.set(c.id, c);
    }
    const all = [...byId.values()].sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
    if (all.length) { if (write(LIST, JSON.stringify(all))) out.added++; else out.failed++; }
  }
  if (typeof theirs[FOLLOW] === 'string') {
    const both = [...new Set([...list(json(read(s, FOLLOW))), ...list(json(theirs[FOLLOW]))].filter((id) => typeof id === 'string'))].slice(0, 20);
    if (both.length) { if (write(FOLLOW, JSON.stringify(both))) out.added++; else out.failed++; }
  }
  return out;
}
