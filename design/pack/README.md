# The brand pack

One folder to hand to anyone who makes something for Miracle Health. `build.mjs` makes it from what the site itself runs on, so it matches the pages:

| In the pack | Made from |
| --- | --- |
| `1 Logo`: the logo, Sig's ring, the app and tab icons | `logo.svg` here, `lib/ring.js`, `favicon.svg` |
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

It writes `<folder>/Miracle Health brand pack`, the same as a zip, and the guide's two pages as pictures. Nothing it writes goes into the site.

## Changing it

- **The look** (the grounds, the headline, the punchline's gradient) is `look.mjs`, which `scripts/og_images.mjs` draws from too. Change it there and both follow.
- **A marketing piece** is in `pieces.mjs`; **the guide** is `guide.mjs`. Keep to the one layout and to the site's own words (`design/BRAND.md`, *The brand pack* and *Voice*).
- **An icon** goes in `icons.json` (24 grid, 1.6 stroke, round ends, no fills) and in the community's `web/ui/dom.js`, which draws the same set.
- **The logo** is `logo.svg`, traced once from `logo.webp`. Never redraw it by hand.
- The Signal's numbers in the pack are examples, from the saved Signal the tests use.
