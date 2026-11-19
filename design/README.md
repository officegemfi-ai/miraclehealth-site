# The design department

miraclehealth.us keeps to one design language: every page is a window in Sig's terminal, in Graphite, with the brand's three faces, its radii and its colours as signatures. This folder holds the rules, and the team and tools that keep every page to them.

## The rules
- `BRAND.md`: the brand book (voice, colour, type, the window, shape, motion, states, iconography, the logo).
- `tokens.json`: every colour, type style, spacing, size, radius and shadow, with what each is for.
- `illustration.md`: Sig's ring, the twelve agents' glyphs and the compound prints.

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
