# The design department

miraclehealth.us keeps to one design language: black pages under a faint grid, wide capital headlines, one electric blue main action, square corners, and colour only as a signature. This folder holds the rules, the team and tools that keep every page to them, and the brand pack made from them.

## The rules
- `BRAND.md`: the brand book (voice, colour, type, the window, shape, motion, states, iconography, the logo).
- `tokens.json`: every colour, type style, spacing, size, radius and shadow, with what each is for.
- `illustration.md`: Sig's ring, the twelve agents' glyphs and the compound prints.

## The brand pack
- `pack/build.mjs` makes the brand pack: the logo, Sig's ring, the colours, the type, the icons, the Community Signal's pieces, the marketing formats and a two-page guide, in one folder and a zip, all from the site's own values. `pack/README.md` says how to run it.
- `pack/look.mjs` is the look as values a script draws with; `scripts/og_images.mjs` draws every page's share image from it too.
- `pack/logo.svg` is the logo as a vector; `pack/icons.json` is the one set of interface icons.

## The record
- `decisions.md`: the art director's calls where the agents disagreed or a fix meant choosing between the brand book and the site, with the reasons, and what was left for the founder.
- `audits/<date>/`: each review's reports, finding by finding.

## The team
Six agents, in `.claude/agents/`, audit the site and report findings with exact fixes. Each has its own area:

| Agent | Looks after |
| --- | --- |
| `design-brand-colour` | The palette, the signature colours, the one white main action, contrast, the logo and marks, gradients and shadows |
| `design-typography` | The three faces, the type scale, headings across pages, kickers and labels, line length, numbers |
| `design-layout` | The window's geometry, symmetric padding, one left edge, centring, vertical rhythm, grids, alignment |
| `design-components` | Buttons, links, cards and plates, tables, chips, forms, radii, hover and focus |
| `design-responsive` | Phones and tablets: overflow, wrapping, tap targets, the drawer, side padding, text sizes |
| `design-clean` | What makes a page look machine-made and busy: code costume (file names, paths, prompts, title and status bars), corner captions and counters, middle-dot chains, rows of dots and colour strips, words in the code face. It deletes first (the owner's rule, November 18) |

To run a full review in Claude Code, ask for a design review. The `design-review` skill in `.claude/skills/` captures every page, briefs the six agents in parallel (`BRIEF.md`), consolidates and fixes their findings on a branch, checks the result and opens a PR.

## The checks, on every change
`scripts/check_clean.mjs` opens every page in Chromium at 1440 and 390 wide (and the front page's search results and ⌘K) and fails on code costume, dot chains and strips, and words in the code face. It runs with the layout and focus checks.

`scripts/check_sig.mjs` is the one check that sees Ask Sig with a conversation on it (the others open each page as it loads). Sig answers from a canned stream, at 1440, 1024 and 390 wide, and it fails when anything but the blood markers stands beside the chat, when the rack doesn't keep up with the answers, when the page itself moves or grows under a long answer, or when the phone's sheet isn't a proper dialog. It runs with the three above.

`scripts/design_check.mjs` runs in the site's checks on every push and PR. It reads every stylesheet and finds:
- colours that aren't the brand's;
- type faces other than the three;
- corner radii outside the set;
- type sizes off the scale;
- gradients and shadows;
- inline styles.

`baseline.json` holds what's allowed today. The check fails if any of these grows, so drift can't come back. When drift is fixed, lower the baseline with `node scripts/design_check.mjs --update`.

## The tools
- `scripts/design_capture.py` captures every page in `pages.json` at 1440, 1024, 768 and 390 wide into `.design/`, which isn't committed. It saves a full-page screenshot and every visible element's computed style and box.
- `scripts/design_data.py` holds the helpers for reading the capture: tokens, contrast, usage counts.
