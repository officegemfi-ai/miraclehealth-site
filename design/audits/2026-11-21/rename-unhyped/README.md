# Miracle Health is now Unhyped

November 21, 2026. The owner: "I think we need to change our name". Of the names offered (Unhyped, N of Many, Verum, Sig), he took Unhyped, at theunhyped.com, because unhyped.com is taken.

The headline already said "Peptides, without the sales pitch", and "Miracle" was the one pitch left. It is also the word the FTC uses for health scams: its consumer warning is called "Miracle Health Claims", at ftc.gov/miraclehealth.

## The logo

`logo-options.jpg` shows the four drawn. A is the logo: **unhyped**, lower case, in the site's own face (Mona Sans at 900 and its widest, 125%), a little tight, kerned, and slanted 10 degrees. It keeps the old script logo's energy, which the owner chose to keep in October, and drops its fuss: no second line, no ®. B (upright), C (upright, lower case, with Sig's ring) and D (A with the ring) are there if he would rather.

`design/pack/wordmark.py` draws it from the font as outlines, so the logo needs no font and can't drift: `logo.svg` (the pages), `design/pack/logo.svg` (the brand pack and the share images), `design/pack/logo-ink.svg` (a light ground) and the foot's big word (`img/wordmark.svg`) all come from one outline. `logo.webp` and the old tracer (`design/wordmark/make_wordmark.py`) are gone.

- `top-bar-before-after.jpg`, `phone-before-after.jpg`: the logo is 20px tall in the top bar, the side panel and Ask Sig's side (109px wide), and fits a 390px phone's bar beside search, Ask Sig and Join.
- `foot-before-after.jpg`: 26px in the foot; the big word stands on the page's bottom edge with its lowest strokes cut off, as the old one did.
- `share-image-before-after.jpg`: all 35 share images redrawn with the new logo.
- `community-app-after.jpg`: the community app, from its own branch (the same logo, beside its "Community" tag).

## The words

- "Miracle Health" is "Unhyped" everywhere a person reads it: titles, the side panel, the foot, Ask Sig, the clinician's packet, the plan, the fact sheets, the guides, the share images, the brand pack and the design department's own notes.
- "My Miracle", the member's own page, is **My stack**: the word this audience uses for what they take, and what the page holds. It is the kit's name for the place, so the community app shows it too.
- The "Miracle Plan" is just a **plan**: "Your plan", "A plan built with Sig, shared with you".
- "No miracles. Just what happened." stays: it says the new name's promise.
- The About page, the privacy notice and the terms say once that Unhyped was called Miracle Health until November 2026. The legal pages' substance and effective date are unchanged.

## Not yet

The address. Every link, the canonical addresses, the share images' address line, `CNAME` and hello@miraclehealth.us stay on miraclehealth.us until theunhyped.com is the owner's and points here; then one change moves them all. Storage keys (`mh-…`) keep their names, so nobody's saved chats, stack or plan are lost.

## Checks

`node scripts/build_library.mjs --check`, `node --test tests/*.test.mjs` (51), `node scripts/check_links.mjs` (35,663 links), `node scripts/design_check.mjs`, `node scripts/check_body.mjs`, `node scripts/check_layout.mjs`, `node scripts/check_states.mjs` (46 views, 572 focus stops), `node scripts/check_clean.mjs` (46 views) and `node scripts/check_sig.mjs` (114 looks).
