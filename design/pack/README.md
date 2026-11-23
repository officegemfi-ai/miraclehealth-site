# The brand pack

One folder to hand to anyone who makes something for Unhyped. `build.mjs` makes it from what the site itself runs on, so it matches the pages:

| In the pack | Made from |
| --- | --- |
| `1 Logo`: the logo, the icon (its own u) as app, profile and tab icons, Sig's ring | `logo.svg` and `icon.svg` here, `favicon.svg`, `lib/ring.js` |
| `2 Colour`: the colours as CSS and JSON, the three grounds | `design/tokens.json`, `styles.css`'s grounds |
| `3 Type`: the two faces and their licences, the type as CSS | `fonts/` |
| `4 Icons`: every icon as a file, a sprite, a sheet | `icons.json` here, `lib/glyphs.js`, the front page's step drawings |
| `5 Signal`: its mark, a score, a card, the board, Sig in its eight moods | `tests/fixtures/signal.json`, `kit/kit.js` |
| `6 Marketing`: share images, posts, a carousel, stories, headers, the words | `og.jpg` and `img/og/`, `pieces.mjs` |
| `Brand guide.pdf`: two pages | `guide.mjs` |

## Making it

It needs Playwright with Chromium, and Python with Pillow, so it is run by hand:

```
node scripts/og_images.mjs                        # first, when the share images changed
node design/pack/build.mjs <folder to write to>   # CHROMIUM_PATH names a Chrome to use
```

It writes `<folder>/Unhyped brand pack`, the same as a zip, and the guide's two pages as pictures. Nothing it writes goes into the site.

## Changing it

- **The look** (the grounds, the headline, the punchline's gradient) is `look.mjs`, which `scripts/og_images.mjs` draws from too. Change it there and both follow.
- **A marketing piece** is in `pieces.mjs`; **the guide** is `guide.mjs`. Keep to the one layout and to the site's own words (`design/BRAND.md`, *The brand pack* and *Voice*).
- **An icon** goes in `icons.json` (24 grid, 1.6 stroke, round ends, no fills) and in the community's `web/ui/dom.js`, which draws the same set.
- **The logo** is `logo.svg` (and `logo-ink.svg` for a light ground), drawn from the site's own font by `wordmark.py`, which draws the site's `logo.svg` and the foot's big word from the same outline. **The icon** is the logo's own u, drawn by the same script: `icon.svg` (white on electric blue), `icon-black.svg` and `icon-white.svg` here, and the site's `favicon.svg`, `favicon.ico` and `apple-touch-icon.png`. Never redraw either by hand: change `wordmark.py` and run it.
- The Signal's numbers in the pack are examples, from the saved Signal the tests use.
