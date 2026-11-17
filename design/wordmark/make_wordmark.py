"""The footer's wordmark (img/wordmark.svg): the logo's script word, traced from logo.webp, drawn as a
stack of hairline outlines that steps down and to the left, in the brand's violet into blue.

    python3 design/wordmark/make_wordmark.py      (needs OpenCV and numpy; run it when the logo changes)

Only the word is traced: HEALTH under it and the registered mark are left out.
"""
import pathlib

import cv2
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
COPIES, DX, DY = 8, -4.2, 3.4          # how many outlines, and the step from one to the next
STOPS = [(0, '#A493FF'), (.38, '#6B48F1'), (.7, '#3A2BFF'), (1, '#3D8BFF')]   # violet into blue

alpha = np.array(Image.open(ROOT / 'logo.webp').convert('RGBA'))[:, :, 3].astype(np.float32)
h, w = alpha.shape
alpha[136:, :] = 0        # HEALTH
alpha[:40, 430:] = 0      # the registered mark
S = 8                     # trace at eight times the size, so the outline is smooth
big = cv2.GaussianBlur(cv2.resize(alpha, (w * S, h * S), interpolation=cv2.INTER_CUBIC), (0, 0), 2.2)
mask = (big > 127).astype(np.uint8) * 255
contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
parts, xs, ys = [], [], []
for c in contours:
    if cv2.contourArea(c) < 60:
        continue
    pts = cv2.approxPolyDP(c, 1.0, True)[:, 0, :] / S
    xs += list(pts[:, 0]); ys += list(pts[:, 1])
    parts.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z')
x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
vx, vy = x0 + COPIES * DX - 4, y0 - 4
vw, vh = (x1 + 4) - vx, (y1 + COPIES * DY + 4) - vy
uses = []
for k in range(COPIES - 1, -1, -1):        # back to front: the front outline whole, the ones behind it fainter
    op = 1.0 if k == 0 else round(0.85 - 0.62 * k / (COPIES - 1), 3)
    uses.append(f'<use href="#w" transform="translate({k * DX:.1f} {k * DY:.1f})" stroke-opacity="{op}"/>')
stops = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in STOPS)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx:.1f} {vy:.1f} {vw:.1f} {vh:.1f}" width="{vw * 3:.0f}" height="{vh * 3:.0f}" fill="none">'
       f'<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{vx:.0f}" y1="0" x2="{vx + vw:.0f}" y2="0">{stops}</linearGradient>'
       f'<path id="w" d="{"".join(parts)}"/></defs>'
       f'<g stroke="url(#g)" stroke-width=".45" stroke-linejoin="round">{"".join(uses)}</g></svg>\n')
(ROOT / 'img' / 'wordmark.svg').write_text(svg)
print(f'img/wordmark.svg: {len(parts)} outlines, {len(svg)} bytes, viewBox {vw:.1f} x {vh:.1f}')
