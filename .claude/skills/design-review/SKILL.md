---
name: design-review
description: Run Miracle Health's design department over miraclehealth.us. Five specialist agents (brand and colour, typography, layout and symmetry, components and states, phone and tablet) audit every page, then the findings are fixed on a branch and checked. Use when asked to review, polish or check the site's design, branding, consistency or symmetry.
---

# The design review

You are the art director. The department is five agents defined in `.claude/agents/`:
- `design-brand-colour`
- `design-typography`
- `design-layout`
- `design-components`
- `design-responsive`

The look is page 9 of the founder's design canvas, "9 Sig system" (the "Miracle Health hero: the Library as a network" artifact): graphite pages, signed in Sig's colours. Open it before anything else and keep it beside the captures; the boards to hold each page against are SysHome (the front page), SysLibrary (a fact sheet), SysSignal (the Signal), SysAskSig (Ask Sig), SysCommunity (the community), SysEverywhere (⌘K, status bars, loading, the 404, My Miracle, share cards, the weekly email) and SysRule (who signs what). `design/BRAND.md` and `design/tokens.json` write that page down; where they disagree with it, the page wins and the book is corrected. Every page is a window in Sig's terminal, and navigation panels are never removed.

1. **Branch.** Work on a branch, never on main (main is the live site).
2. **Capture.** Run `python3 scripts/design_capture.py`. It serves the site on 127.0.0.1:8765 and writes `.design/shots` and `.design/data` for every page in `design/pages.json` at four widths. Add a new page template to `design/pages.json` first.
3. **Brief the team.** Launch the five agents in parallel, each with "Audit the site as `design/BRIEF.md` says." Each writes `.design/reports/<agent>.md` and replies with a summary.
4. **Consolidate.** Read the five reports and merge duplicates. Verify each finding yourself (look at the evidence, re-measure), and drop what doesn't hold. Where two agents disagree, or a fix would change the brand book, make the call and write it in `design/decisions.md` with the reason. Keep the reports in `design/audits/<date>/`.
5. **Fix.** Fix the shared rule rather than each page, using the tokens' values. `kit/kit.css`, `kit/kit.js`, `kit/bodymap.js` and `library/signalviz.js` are copies of the community repository's `shared/kit`: change them there and copy them over with its `scripts/sync_kit.sh <path to this repo>` (its CI compares them with this site's main). Rebuild with `node scripts/build_library.mjs`. Never leave a pseudo-element or a stray brace unchecked: a single extra `}` drops the next rule.
6. **Check.**
   - Capture again and compare before and after for every finding, at 1440, 1024 (the tablet band, where the side panel leaves the page narrower than at 768), 768 and 390.
   - When you remove old CSS, capture with and without the removal and compare every element's computed style by selector: nothing on screen may change.
   - Run `node scripts/design_check.mjs`: no new drift. When drift is fixed, lower the baseline with `--update`.
   - Run the site's checks (`node scripts/build_library.mjs --check`, `node --test tests/*.test.mjs`, `node scripts/check_links.mjs`).
7. **Ship.** Open a PR with the findings fixed, any left with a reason, and before/after images for the most visible ones. Nothing goes live until the owner merges.
