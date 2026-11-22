// miraclehealth.us, Unhyped's old address: every page goes on to the same page at theunhyped.com.
// A browser keeps each address's saved things apart, so when this browser has some (a stack, a
// plan, chats with Sig), it asks first and can bring them along: it opens theunhyped.com/move in a
// small window and hands them over there by postMessage (carry.js), never in a link.
// Written by scripts/build_forward.mjs in the website's repository.
import { NEW, saved, words } from './carry.js';

const MOVED = 'unhyped-moved-v1';
const q = new URLSearchParams(location.search);
const asked = q.has('bring');
q.delete('bring');
const rest = q.toString();
const dest = `${NEW}${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`;
const go = () => location.replace(dest);
const ls = (() => { try { return window.localStorage; } catch { return null; } })();
const mark = () => { try { ls?.setItem(MOVED, String(Date.now())); } catch { /* blocked */ } };
const moved = (() => { try { return Boolean(ls?.getItem(MOVED)); } catch { return false; } })();
const found = ls ? saved(ls) : { any: false };

if (found.any && (asked || !moved)) ask(found);
else if (asked) nothing();
else go();

function parts(m) {
  const n = [m.stack, m.plan, m.checkins, m.chats, m.follows].filter(Boolean).length;
  return { many: n > 1 || m.checkins || m.chats > 1 || m.follows > 1 };
}

function screen() {
  const el = (id) => document.getElementById(id);
  const s = { main: el('mv'), say: el('mv-say'), acts: el('mv-acts'), bring: el('mv-bring'), skip: el('mv-skip') };
  s.skip.href = dest;
  s.skip.addEventListener('click', mark);
  s.acts.hidden = false;
  s.main.classList.add('mv-on');
  return s;
}

function nothing() {
  const s = screen();
  s.say.textContent = 'Nothing from Unhyped is saved in this browser.';
  s.bring.hidden = true;
  s.skip.textContent = 'Go to theunhyped.com';
}

function ask({ mine, items }) {
  const s = screen();
  const { many } = parts(mine);
  const what = words(mine);
  const them = many ? 'them' : 'it';
  const intro = `${what.charAt(0).toUpperCase()}${what.slice(1)} ${many ? 'are' : 'is'} saved in this browser. Bring ${them} with you? ${many ? 'They go' : 'It goes'} straight from this browser to the new address; nobody else receives ${them}.`;
  s.say.textContent = intro;
  s.bring.textContent = `Bring ${them} over`;
  s.skip.textContent = `Go without ${them}`;
  let win = null;
  let timer = 0;
  const idle = (msg) => { s.say.textContent = msg; s.bring.disabled = false; };
  window.addEventListener('message', (ev) => {
    if (!win || ev.source !== win || ev.origin !== NEW || !ev.data) return;
    if (ev.data.type === 'unhyped-ready') {
      win.postMessage({ type: 'unhyped-carry', items }, NEW);
    } else if (ev.data.type === 'unhyped-stored') {
      clearTimeout(timer);
      mark();
      s.say.textContent = ev.data.failed ? 'Most of it came over; some didn’t fit on this device. Taking you there…' : 'Done. Taking you to theunhyped.com…';
      setTimeout(go, ev.data.failed ? 1600 : 300);
    }
  });
  s.bring.addEventListener('click', () => {
    win = window.open(`${NEW}/move/`, 'unhyped-move', 'popup,width=520,height=480');
    if (!win) {
      idle(`Your browser blocked the small window that brings ${them} over. Allow pop-ups for miraclehealth.us and try again, or go without ${them}.`);
      return;
    }
    s.bring.disabled = true;
    s.say.textContent = `Bringing ${them} over…`;
    clearTimeout(timer);
    timer = setTimeout(() => idle(`That didn’t finish. Try again, or go without ${them}.`), 20000);
  });
}
