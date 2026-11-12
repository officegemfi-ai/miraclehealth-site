"""The design department's helpers: load what scripts/design_capture.py captured (.design/), parse
colours, map them to the brand's tokens (design/tokens.json), list what's in use.
    import sys; sys.path.insert(0, 'scripts'); import design_data as ds"""
import json, re, glob, os, collections
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, '.design')
PAGES = json.load(open(os.path.join(REPO, 'design', 'pages.json')))
WIDTHS = [1440, 1024, 768, 390]
def _palette():
    t = json.load(open(os.path.join(REPO, 'design', 'tokens.json')))
    cols = {x['name']: x['value'] for x in t['color']['tokens']}
    def res(v):
        while isinstance(v, str) and v.startswith('{'): v = cols[v[1:-1]]
        return v
    return {k: res(v) for k, v in cols.items()}
PALETTE = _palette()   # token name -> '#rrggbb' or 'rgba(...)'

def load(page, width):
    """{'url','title','scrollW','innerW','scrollH','errors','els':[{sel,tag,text,x,y,w,h,ff,fs,fw,lh,ls,tt,ta,fst,color,bg,bgi,bw,bc,bs,br,pad,mar,gap,disp,pos,shadow,op}]}"""
    return json.load(open(f'{ROOT}/data/{page}@{width}.json'))

def all_pages():
    for name, url in PAGES:
        for w in WIDTHS:
            p = f'{ROOT}/data/{name}@{w}.json'
            if os.path.exists(p):
                yield name, w, json.load(open(p))

def rgba(s):
    """'rgb(1, 2, 3)' / 'rgba(1, 2, 3, 0.5)' / '#rrggbb' -> (r, g, b, a) or None"""
    if not s: return None
    s = s.strip()
    m = re.match(r'rgba?\(([^)]+)\)', s)
    if m:
        p = [float(x) for x in re.split(r'[ ,/]+', m.group(1).strip()) if x]
        return (p[0], p[1], p[2], p[3] if len(p) > 3 else 1.0)
    m = re.match(r'#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$', s)
    if m:
        h = m.group(1); a = int(m.group(2), 16) / 255 if m.group(2) else 1.0
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
    return None

TOKEN_RGBA = {k: rgba(v) for k, v in PALETTE.items()}

def nearest_token(s):
    """the closest brand colour token to a computed colour: (name, distance); 0 = exact"""
    c = rgba(s)
    if not c or c[3] == 0: return ('transparent', 0)
    best = None
    for k, t in TOKEN_RGBA.items():
        if not t: continue
        d = sum((a - b) ** 2 for a, b in zip(c[:3], t[:3])) ** .5 + abs(c[3] - t[3]) * 255
        if best is None or d < best[1]: best = (k, round(d, 1))
    return best

def lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    return .2126 * ch(c[0]) + .7152 * ch(c[1]) + .0722 * ch(c[2])

def contrast(fg, bg):
    a, b = lum(rgba(fg) if isinstance(fg, str) else fg), lum(rgba(bg) if isinstance(bg, str) else bg)
    hi, lo = max(a, b), min(a, b)
    return round((hi + .05) / (lo + .05), 2)

def usage(field, pages=None, widths=(1440,)):
    """Counter of a field's values across pages, e.g. usage('fs'), usage('br'), usage('ff')"""
    c = collections.Counter()
    for name, w, d in all_pages():
        if pages and name not in pages: continue
        if w not in widths: continue
        for e in d['els']:
            c[e[field]] += 1
    return c

# In-page helper for Playwright: the effective background behind an element (first opaque
# ancestor background) and its text contrast. page.evaluate(EFFECTIVE_BG_JS, 'css selector')
EFFECTIVE_BG_JS = r"""
(sel) => [...document.querySelectorAll(sel)].slice(0, 50).map((el) => {
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  let e = el, bg = null;
  while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.95) { bg = c; break; } e = e.parentElement; }
  const fg = parse(getComputedStyle(el).color);
  const L = (c) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const ratio = bg && fg ? ((Math.max(L(fg), L(bg)) + .05) / (Math.min(L(fg), L(bg)) + .05)) : null;
  return { text: el.textContent.trim().slice(0, 40), fg: getComputedStyle(el).color, bg: bg ? 'rgb(' + bg.slice(0, 3).join(', ') + ')' : null, ratio: ratio && Math.round(ratio * 100) / 100, fs: getComputedStyle(el).fontSize };
})
"""
