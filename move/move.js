// theunhyped.com/move: where what a member kept on miraclehealth.us arrives. The old address's
// forwarding page opens this in a small window, and once it says it's ready, hands over that
// device's saved things (lib/carry.js) by postMessage. They're kept here without writing over
// anything already here, then this window says how it went and closes. Opened any other way, it
// says how to bring them over.
import { OLD, merge } from '/lib/carry.js?v=c3ddf6fe40';

const say = document.getElementById('mv-say');
const act = document.getElementById('mv-act');
const show = (text) => { if (say) say.textContent = text; };
const opener = window.opener;

if (!opener) {
  show('This page brings what you saved on miraclehealth.us (your stack, your plan and your chats with Sig) to theunhyped.com. Open miraclehealth.us in the browser where you used it, and choose to bring them over.');
  if (act) act.hidden = false;
} else {
  let done = false;
  window.addEventListener('message', (ev) => {
    if (done || ev.source !== opener || !OLD.includes(ev.origin)) return;
    const m = ev.data;
    if (!m || m.type !== 'unhyped-carry' || typeof m.items !== 'object') return;
    done = true;
    let r = { added: 0, kept: 0, failed: 1 };
    try { r = merge(window.localStorage, m.items); } catch { /* storage blocked */ }
    show(r.failed ? 'Some of it didn’t fit on this device.' : 'Done. Taking you to theunhyped.com…');
    opener.postMessage({ type: 'unhyped-stored', ...r }, ev.origin);
    setTimeout(() => window.close(), 400);
  });
  show('Bringing your saved things over…');
  // Ready: only the old address can hear it
  for (const o of OLD) { try { opener.postMessage({ type: 'unhyped-ready' }, o); } catch { /* not that one */ } }
}
