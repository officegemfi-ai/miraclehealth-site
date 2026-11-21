"""The browser tab's icon: Sig's ring, as on Ask Sig's app icon and every title bar. The eleven agents
round the ring, each in its own colour, and the Interpretation agent's white dot at its centre, on a
dark tile with the corners the tab icon has always had.

    python3 design/favicon/make_favicon.py      (needs Pillow; run it when the ring's colours change)

It writes favicon.svg, which every page links, and favicon.ico, the same drawing at 16, 32 and 48
pixels for browsers that can't show an SVG icon. The colours and their order are read from
lib/ring.js, so the tab's ring is always the one the pages draw.
"""
import io
import math
import pathlib
import re

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[2]
TILE, RX = '#000000', 7          # the page's own black; the tab icon's corners, out of 32
D, SW, GAP, DOT = 28, 5.2, 14, 2.6   # the ring across, its width, the gap between pieces (degrees), the dot

ring_js = (ROOT / 'lib' / 'ring.js').read_text()
wheel = re.findall(r"'(\w+)'", re.search(r'export const WHEEL = \[([^\]]+)\]', ring_js).group(1))
color = dict(re.findall(r"(\w+): '(#[0-9A-Fa-f]{6})'", re.search(r'export const AGENT_COLOR = \{([^}]+)\}', ring_js).group(1)))
center = re.search(r"export const CENTER = '(\w+)'", ring_js).group(1)
assert len(wheel) == 11 and all(k in color for k in wheel + [center]), 'lib/ring.js has changed shape'

r = D / 2 - SW / 2
step = 360 / len(wheel)
starts = [-90 + i * step + GAP / 2 for i in range(len(wheel))]      # each piece from here, clockwise
n = lambda x: f'{x:.2f}'.rstrip('0').rstrip('.')

# favicon.svg: the pieces drawn the way lib/ring.js draws them, as dashes round one circle
c = 2 * math.pi * r
arcs = ''.join(f'<circle r="{n(r)}" stroke="{color[k]}" stroke-dasharray="{n(c / len(wheel) - GAP / 360 * c)} {n(c)}" '
               f'transform="rotate({n(a)})"/>' for k, a in zip(wheel, starts))
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 32 32" width="32" height="32">'
       f'<rect x="-16" y="-16" width="32" height="32" rx="{RX}" fill="{TILE}"/>'
       f'<g fill="none" stroke-width="{SW}">{arcs}</g><circle r="{DOT}" fill="{color[center]}"/></svg>\n')
(ROOT / 'favicon.svg').write_text(svg)


# favicon.ico: the same drawing, drawn sixteen times larger and brought down, at each size
def draw(size, ss=16):
    k = size * ss / 32
    im = Image.new('RGBA', (size * ss,) * 2, (0, 0, 0, 0))
    g = ImageDraw.Draw(im)
    g.rounded_rectangle((0, 0, size * ss - 1, size * ss - 1), radius=RX * k, fill=TILE)
    mid, outer = 16 * k, (r + SW / 2) * k
    for key, a in zip(wheel, starts):
        g.arc((mid - outer, mid - outer, mid + outer, mid + outer), a, a + step - GAP, fill=color[key], width=round(SW * k))
    g.ellipse((mid - DOT * k, mid - DOT * k, mid + DOT * k, mid + DOT * k), fill=color[center])
    return im.resize((size, size), Image.LANCZOS)


sizes = [16, 32, 48]
frames = [draw(s) for s in sizes]
buf = io.BytesIO()
frames[-1].save(buf, format='ICO', sizes=[(s, s) for s in sizes], append_images=frames[:-1])
(ROOT / 'favicon.ico').write_bytes(buf.getvalue())
print(f'favicon.svg: {len(svg)} bytes · favicon.ico: {", ".join(map(str, sizes))} px, {len(buf.getvalue())} bytes')
