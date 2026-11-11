// Every page of the site is a window in Sig's terminal, as Ask Sig is: the side panel with the
// places and the site's links, the title bar with Sig's ring and the window's tabs, the status bar.
// This keeps the panel: on a wide screen it folds away and comes back (the choice is kept, the same
// as on Ask Sig), on a narrower one it slides in over the page from the menu button. In the
// Library the window's tabs are the fact sheets opened in this browser, like files in an editor:
// they stay until closed. Nothing of it leaves the browser.
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

  // The Library's tabs: the sheets opened in this browser, most recent last, up to six
  const tabs = document.getElementById('win-tabs');
  const here = tabs?.dataset.sheet ? { id: tabs.dataset.sheet, file: tabs.dataset.file } : null;
  if (tabs && tabs.dataset.kind === 'library') {
    const KEY = 'mh-lib-tabs';
    let list = [];
    try { list = JSON.parse(get(KEY) || '[]').filter((t) => t && /^[a-z0-9-]{1,40}$/.test(t.id) && typeof t.file === 'string'); } catch { list = []; }
    if (here) { list = list.filter((t) => t.id !== here.id); list.push(here); list = list.slice(-6); put(KEY, JSON.stringify(list)); }
    const draw = () => {
      const kids = list.map((t) => {
        const on = here && t.id === here.id;
        const a = document.createElement('a');
        a.className = `win-tab${on ? ' on' : ''}`;
        a.href = `/library/${t.id}/`;
        if (on) a.setAttribute('aria-current', 'page');
        const dot = document.createElement('i'); dot.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span'); name.className = 'win-tabname'; name.textContent = t.file.slice(0, 40);
        const x = document.createElement('button');
        x.type = 'button'; x.className = 'win-tabx'; x.setAttribute('aria-label', `Close ${t.file.slice(0, 40)}`); x.textContent = '×';
        x.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          list = list.filter((y) => y.id !== t.id); put(KEY, JSON.stringify(list));
          if (on) { location.assign(list.length ? `/library/${list[list.length - 1].id}/` : '/library/'); return; }
          draw();
        });
        a.append(dot, name, x);
        return a;
      });
      if (!kids.length) return;
      tabs.replaceChildren(...kids);
      tabs.classList.add('has-tabs');
    };
    draw();
  }
}

// A page that wasn't found says which address was tried, as its shell line
for (const el of document.querySelectorAll('[data-here]')) el.textContent = decodeURIComponent(location.pathname).slice(0, 80);
