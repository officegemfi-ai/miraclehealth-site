#!/usr/bin/env python3
"""Draws the Unhyped wordmark from the site's own font, as outlines, so the logo needs no font.

The word is "unhyped" in Mona Sans (fonts/mona-sans.woff2) at its heaviest weight (900) and widest
width (125%), set a little tight (-20 units of 1000) with the font's own kerning, and slanted 10
degrees, as the old script logo was. It writes, in place:

  logo.svg                  the site's logo: the word, solid, in near-white (#F7F8FA), for dark grounds
  design/pack/logo.svg      the same, for the brand pack, the share images and the posts
  design/pack/logo-ink.svg  the same in ink (#0B0B0C), for light grounds
  img/wordmark.svg          the word drawn big under every page's foot: a stack of hairline outlines
                            in violet into blue, standing on the page's bottom edge

Run from the repository's root (needs fontTools with brotli):  python3 design/pack/wordmark.py
(give a folder to write there instead, to try a change without touching the site)
"""
import math
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.getcwd() if os.path.exists(os.path.join('fonts', 'mona-sans.woff2')) else os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else ROOT
WORD = 'unhyped'
WEIGHT, WIDTH = 900, 125
TRACK = -20              # units of 1000: a little tight
SLANT = 10               # degrees, top to the right
WHITE, INK = '#F7F8FA', '#0B0B0C'

font = TTFont(os.path.join(ROOT, 'fonts', 'mona-sans.woff2'))
font = instancer.instantiateVariableFont(font, {'wght': WEIGHT, 'wdth': WIDTH})
cmap = font.getBestCmap()
glyphs = font.getGlyphSet()
hmtx = font['hmtx']


def kerning(left, right):
    """The font's own kerning between two glyphs (its 'kern' feature: pair adjustments)."""
    gpos = font['GPOS'].table
    wanted = set()
    for rec in gpos.FeatureList.FeatureRecord:
        if rec.FeatureTag == 'kern':
            wanted.update(rec.Feature.LookupListIndex)
    total = 0
    for i in sorted(wanted):
        lookup = gpos.LookupList.Lookup[i]
        for sub in lookup.SubTable:
            if lookup.LookupType == 9:
                sub = sub.ExtSubTable
            if getattr(sub, 'LookupType', 2) != 2 or left not in sub.Coverage.glyphs:
                continue
            if sub.Format == 1:
                pairs = sub.PairSet[sub.Coverage.glyphs.index(left)].PairValueRecord
                for pv in pairs:
                    if pv.SecondGlyph == right and pv.Value1 is not None:
                        total += getattr(pv.Value1, 'XAdvance', 0) or 0
                        break
            else:
                c1 = sub.ClassDef1.classDefs.get(left, 0)
                c2 = sub.ClassDef2.classDefs.get(right, 0)
                value = sub.Class1Record[c1].Class2Record[c2].Value1
                total += (getattr(value, 'XAdvance', 0) or 0) if value is not None else 0
            break  # the first subtable that covers the pair decides, as in a shaper
    return total


# Lay the word out, then draw each glyph through one transform: scale it, move it along, slant it,
# and turn the font's y-up units into the SVG's y-down ones
t = math.tan(math.radians(SLANT))
names = [cmap[ord(c)] for c in WORD]


def draw(pen, k=1.0):
    x = 0
    for i, name in enumerate(names):
        glyphs[name].draw(TransformPen(pen, (k, 0, -t * k, -k, x * k, 0)))
        x += hmtx[name][0] + TRACK
        if i + 1 < len(names):
            x += kerning(name, names[i + 1])
    return pen


num = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')  # a tenth of a unit is plenty
d = draw(SVGPathPen(glyphs, ntos=num)).getCommands()
# The ink's own bounds
from fontTools.pens.boundsPen import BoundsPen
xmin, ymin, xmax, ymax = draw(BoundsPen(glyphs)).bounds
w, h = xmax - xmin, ymax - ymin


def fmt(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')


def logo(colour, path):
    pad = 0
    vb = f'{fmt(xmin - pad)} {fmt(ymin - pad)} {fmt(w + 2 * pad)} {fmt(h + 2 * pad)}'
    height = 28
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{fmt(height * w / h)}" height="{height}" '
           f'role="img" aria-label="Unhyped"><path fill="{colour}" d="{d}"/></svg>\n')
    with open(path, 'w') as f:
        f.write(svg)


os.makedirs(os.path.join(OUT, 'design', 'pack'), exist_ok=True)
logo(WHITE, os.path.join(OUT, 'logo.svg'))
logo(WHITE, os.path.join(OUT, 'design', 'pack', 'logo.svg'))
logo(INK, os.path.join(OUT, 'design', 'pack', 'logo-ink.svg'))

# The big word under the foot: the outline, eight times, each a step down and to the left and
# fainter, stroked in hairline violet into blue. Drawn at about 480 units wide, as the old one was,
# so its hairline (.45) and its steps keep their weight
s = 480 / w
db = draw(SVGPathPen(glyphs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.')), s).getCommands()
bx0, by0, bx1, by1 = xmin * s, ymin * s, xmax * s, ymax * s
steps = [(-4.2 * k, 3.4 * k, round(1 - 0.0884 * k, 3)) for k in range(7, -1, -1)]
sx0, sy0 = -4.2 * 7, 3.4 * 7
# room above the word, so that under the foot (a box four times as wide as it is tall) the word stands
# on the page's bottom edge and its lowest strokes run off it, as the old word's did
ROOM = float(os.environ.get('WORD_ROOM', 44))
vx, vy, vw, vh = bx0 + sx0 - 2, by0 - 2 - ROOM, (bx1 - bx0) - sx0 + 4, (by1 - by0) + sy0 + 4 + ROOM
uses = ''.join(f'<use href="#w" transform="translate({fmt(dx)} {fmt(dy)})" stroke-opacity="{op}"/>' for dx, dy, op in steps)
big = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{fmt(vx)} {fmt(vy)} {fmt(vw)} {fmt(vh)}" width="{fmt(vw * 3)}" height="{fmt(vh * 3)}" fill="none">'
       f'<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{fmt(bx0 + sx0)}" y1="0" x2="{fmt(bx1)}" y2="0">'
       '<stop offset="0" stop-color="#A493FF"/><stop offset="0.38" stop-color="#6B48F1"/><stop offset="0.7" stop-color="#3A2BFF"/>'
       '<stop offset="1" stop-color="#3D8BFF"/></linearGradient>'
       f'<path id="w" d="{db}"/></defs>'
       f'<g stroke="url(#g)" stroke-width=".45" stroke-linejoin="round">{uses}</g></svg>\n')
os.makedirs(os.path.join(OUT, 'img'), exist_ok=True)
with open(os.path.join(OUT, 'img', 'wordmark.svg'), 'w') as f:
    f.write(big)
print(f'unhyped: {len(names)} glyphs, {fmt(w)} x {fmt(h)} units, kerning applied; wrote logo.svg, design/pack/logo.svg, design/pack/logo-ink.svg and img/wordmark.svg in {OUT}')
