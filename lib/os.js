// Every page of the site opens beside the side panel with the places and the site's links, under a
// plain top bar (search, Ask Sig, joining). This keeps the panel: on a wide screen it folds away and
// comes back from the top bar's menu button (the choice is kept, the same as on Ask Sig), on a
// narrower one it slides in over the page from that button. Nothing of it leaves the browser.
const os = document.getElementById('os');
const side = document.getElementById('os-side');
if (os && side) {
  const menuBtn = document.getElementById('os-menu');
  const foldBtn = document.getElementById('os-fold');
  const scrim = document.getElementById('os-scrim');
  const narrowMq = matchMedia('(max-width: 900px)');
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: not kept */ } };
  // the same choice as Ask Sig's panel: folded there, folded here
  let folded = get('mh-sig-side') === '"folded"' || get('mh-sig-side') === 'folded';
  const sync = () => {
    const narrow = narrowMq.matches;
    if (!narrow) { os.classList.remove('drawer'); if (scrim) scrim.hidden = true; }
    os.classList.toggle('folded', !narrow && folded);
    const shown = narrow ? os.classList.contains('drawer') : !folded;
    side.inert = !shown;
    // while the drawer is open the page behind it is out of reach (Tab stays in the drawer)
    const page = os.querySelector('.os-main');
    if (page) page.inert = narrow && os.classList.contains('drawer');
    menuBtn?.setAttribute('aria-expanded', String(shown));
    foldBtn?.setAttribute('aria-expanded', String(shown));
    foldBtn?.setAttribute('aria-label', narrow ? 'Close the side panel' : 'Hide the side panel');
  };
  const open = () => { os.classList.add('drawer'); if (scrim) scrim.hidden = false; sync(); side.querySelector('a, button')?.focus(); };
  const close = (back = true) => {
    if (!os.classList.contains('drawer')) return;
    os.classList.remove('drawer'); if (scrim) scrim.hidden = true; sync();
    if (back) menuBtn?.focus();
  };
  menuBtn?.addEventListener('click', () => {
    if (narrowMq.matches) { open(); return; }
    folded = false; put('mh-sig-side', JSON.stringify('open')); sync(); foldBtn?.focus();
  });
  foldBtn?.addEventListener('click', () => {
    if (narrowMq.matches) { close(); return; }
    folded = true; put('mh-sig-side', JSON.stringify('folded')); sync(); menuBtn?.focus();
  });
  scrim?.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && os.classList.contains('drawer')) { e.preventDefault(); close(); } });
  // a link in the drawer goes somewhere: the drawer shuts behind it
  side.addEventListener('click', (e) => { if (e.target.closest('a[href]') && narrowMq.matches) close(false); });
  narrowMq.addEventListener('change', sync);
  sync();
}

// A page that wasn't found says which address was tried, as its shell line
for (const el of document.querySelectorAll('[data-here]')) el.textContent = decodeURIComponent(location.pathname).slice(0, 80);

// ⌘K (Ctrl+K elsewhere), or any button marked data-cmdk: go anywhere, from any page. The palette's
// script (lib/cmdk.js) and its data load the first time it's asked for.
let cmdk = null;
const cmdkOpen = (from) => {
  (cmdk ||= import('/lib/cmdk.js?v=9c92a8758f')).then((m) => (m.isOpen() ? m.close() : m.openCmdk(from))).catch(() => { location.assign('/library/'); });
};
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); cmdkOpen(document.activeElement); }
});
for (const b of document.querySelectorAll('[data-cmdk]')) b.addEventListener('click', (e) => { e.preventDefault(); cmdkOpen(b); });
// ⌘K is the Mac's; everywhere else the same key is Ctrl K, so that's what it says
if (!/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')) {
  for (const k of document.querySelectorAll('.kbd-k')) k.textContent = k.textContent.replace('⌘K', 'Ctrl K');
  for (const b of document.querySelectorAll('[data-cmdk][aria-label*="⌘K"]')) b.setAttribute('aria-label', b.getAttribute('aria-label').replace('⌘K', 'Ctrl K'));
}

// A page that wasn't found offers the nearest compound or page to the address that was tried, as
// a shell would: "did you mean bpc157.md?" (the closest by edit distance, and only when it's close)
const dym = document.querySelector('[data-dym]');
if (dym) {
  const tried = decodeURIComponent(location.pathname).toLowerCase().replace(/\/+$/, '');
  const leaf = tried.split('/').pop() || '';
  const fold = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const dist = (a, b) => {
    const d = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = d[0]; d[0] = i;
      for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
    }
    return d[b.length];
  };
  fetch('/library/data/cmdk.json', { credentials: 'omit' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d || !leaf) return;
    const want = fold(leaf);
    const cands = d.c.map((c) => ({ href: `/library/${c[0]}/`, label: c[3] ? `${c[0]}.md` : c[1], keys: [fold(c[0]), fold(c[1])] }))
      .concat(d.pages.filter((p) => p[0].startsWith('/') && !p[0].startsWith('/#')).map((p) => ({ href: p[0], label: p[0], keys: [fold(p[0]), fold(p[1])] })));
    let best = null;
    for (const c of cands) for (const k of c.keys) { const s = dist(want, k); if (!best || s < best.s) best = { ...c, s }; }
    if (!best || best.s > Math.max(2, Math.round(want.length * 0.34))) return;
    const a = dym.querySelector('[data-dym-link]');
    a.href = best.href; a.textContent = best.label;
    dym.hidden = false;
  }).catch(() => {});
}
