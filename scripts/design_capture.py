# The design department's capture: every page template at four widths, as a full-page screenshot
# and every visible element's computed type, colour, border, radius, spacing and box (JSON), in
# .design/ (not committed). The team reads it with scripts/design_data.py.
#   python3 scripts/design_capture.py            all pages in design/pages.json
#   python3 scripts/design_capture.py story      only the pages whose name contains "story"
# Needs Playwright for Python and Chrome (CHROMIUM_PATH, default /usr/bin/google-chrome). It
# serves the site itself on port 8765 if nothing is there yet.
import asyncio, json, sys, os, subprocess, time, urllib.request
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'.design')
BASE='http://127.0.0.1:8765'
PAGES=[p for p in json.load(open(os.path.join(ROOT,'design','pages.json'))) if not sys.argv[1:] or any(a in p[0] for a in sys.argv[1:])]
try:
    urllib.request.urlopen(BASE+'/', timeout=2)
except Exception:
    subprocess.Popen([sys.executable,'-m','http.server','8765','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    time.sleep(1.5)
os.makedirs(os.path.join(OUT,'data'),exist_ok=True); os.makedirs(os.path.join(OUT,'shots'),exist_ok=True)
WIDTHS=[1440,1024,768,390]
JS = r"""
() => {
  const out = [];
  const short = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const c = [...el.classList].slice(0, 3);
    if (c.length) s += '.' + c.join('.');
    return s;
  };
  const path = (el) => { const a = []; let e = el; for (let i = 0; e && e.nodeType === 1 && i < 4; i++, e = e.parentElement) a.unshift(short(e)); return a.join(' > '); };
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','META','LINK','BR'].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    let own = '';
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent;
    own = own.replace(/\s+/g, ' ').trim().slice(0, 60);
    out.push({
      sel: path(el), tag: el.tagName.toLowerCase(), text: own,
      x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height),
      ff: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, tt: cs.textTransform, ta: cs.textAlign, fst: cs.fontStretch,
      color: cs.color, bg: cs.backgroundColor, bgi: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 80),
      bw: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(' '), bc: cs.borderTopColor, bs: cs.borderTopStyle,
      br: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '),
      pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '), mar: [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(' '),
      gap: cs.gap, disp: cs.display, pos: cs.position, shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow.slice(0, 80), op: cs.opacity,
    });
  }
  return { url: location.pathname, title: document.title, scrollW: document.documentElement.scrollWidth, innerW: innerWidth, scrollH: document.documentElement.scrollHeight, els: out };
}
"""
async def one(b, name, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 900 if w > 500 else 844}, device_scale_factor=1)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    try:
        await pg.goto(BASE + url, wait_until='networkidle', timeout=45000)
    except Exception as e:
        errs.append('goto: ' + str(e)[:120])
    await pg.wait_for_timeout(900)
    data = await pg.evaluate(JS)
    data['errors'] = errs
    data['width'] = w
    json.dump(data, open(os.path.join(OUT, 'data', f'{name}@{w}.json'), 'w'))
    h = min(data['scrollH'], 7000)
    await pg.screenshot(path=os.path.join(OUT, 'shots', f'{name}@{w}.jpg'), type='jpeg', quality=82, full_page=True, clip=None if h == data['scrollH'] else {'x': 0, 'y': 0, 'width': w, 'height': h})
    await ctx.close()
    return f"{name}@{w}: {len(data['els'])} els, scrollW {data['scrollW']} vs {w}{' OVERFLOW' if data['scrollW'] > w else ''}, h {data['scrollH']}{' errors ' + str(errs[:2]) if errs else ''}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/google-chrome'))
        sem = asyncio.Semaphore(6)
        async def run(n, u, w):
            async with sem:
                return await one(b, n, u, w)
        res = await asyncio.gather(*[run(n, u, w) for n, u in PAGES for w in WIDTHS])
        for r in res: print(r)
        await b.close()
asyncio.run(main())
