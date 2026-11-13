# Design decisions

What the design department decided where its agents disagreed, or where a fix meant choosing between the brand book and the site. Each entry names the findings it settles; the findings are in `audits/<date>/`.

## 2026-11-11: the first full review

Five agents audited 23 page templates at 1440, 1024, 768 and 390 wide and reported 133 findings (typography 22, brand and colour 29, layout and symmetry 28, components and states 26, phone and tablet 28). The reports are in `audits/2026-11-11/`. Their line numbers refer to the stylesheets before the fixes.

| Measure | Before | After |
| --- | --- | --- |
| Pages wider than the screen | 23 (every phone page by 1px; the compare pairs by up to 19px) | 0 |
| Text set in Arial | 142 elements | 0 |
| Corner radii outside the brand's set | 1,445 | 0 |
| Distinct type sizes | 63 | 39 |
| Off-palette computed colours | 292 (17 distinct) | 93 (6 distinct: the hidden spam-trap field and three accepted plate details) |
| White main buttons in one view | up to 4 | 1 |
| `design_check.mjs` (colour · radius · size · gradient · shadow) | 224 · 66 · 83 · 42 · 38 | 161 · 23 · 34 · 30 · 28 |

What remains in `design_check.mjs` is mostly inside Ask Sig, in states the captures don't reach: its answers and screen pane (`ai/ai.css` 83, `ai/screen.css` 41) and the clinician packet (`ai/packet.css` 78). `baseline.json` holds it there, so it can only go down.

### The calls

1. **One white button per view.** The side panel's Join, Ask Sig's Join, the foot's "Get it weekly" and the fact sheet's repeated "Share how it went" are hairlines. A page's own main action stays white; the weekly email's own sign-up stays white on its pages. (BRAND-01, COMP-01)
2. **Headline roles.** `page` (48px, 34px on a phone) is every page's h1: fact sheets, the Library, the 404, My Miracle, the plan and Ask Sig's greeting included. `hero` (72px) is only Home's and the story's. Section heads are `section` (60px), headings inside a page `h2` (26px), card and row titles `h3` in Mona Sans (16px; 17.5px leading a list). A page's h1 ends in a full stop. (TYPE-01, 03, 04, 08, 22)
3. **One tag.** A `line-2` hairline, 8px corners, mono capitals at .12em, no tinted fills. How often a harm happens is in its words and greys (common and uncommon in `text`, rare in `text-2`, in theory and unknown in `muted`); the method page's confidence is in its words. Chips are 44px, Mona Sans, 8px corners; the pressed one takes the 8% current fill. (BRAND-03, BRAND-14, BRAND-17, COMP-04, COMP-16)
4. **Side padding stays 40px.** The layout lead proposed the `pad` token's 24px (LAYOUT-19). Declined: every page already shares one left edge at 40px, and moving all of them buys no consistency. Instead the site uses 40px, 20px from 701 to 900px and 16px on a phone, and `tokens.json` now says so. (LAYOUT-19, RESP-13)
5. **Doc pages join the site's left edge.** Privacy, terms, about, method and the weekly issues start at the same x as every other page (not a centred column), with text at 52ch; wide tables use the page's width. (LAYOUT-09, TYPE-02)
6. **The tablet band.** From 901 to 1279px the side panel and the window's frame take 306px, so the page is narrower than at 768. Layouts that need room stack until 1279px: the fact sheet's glance, claims and print, the story's hero, the compare rows, Home's steps and rules, the Library's explainer. (RESP-03, 07, 08, 09, LAYOUT-03, 04, 05)
7. **Phones keep the status bar.** At 700px and under it shows SIG, "safety on" and the rules; the SIG word goes first, then the segment, on the smallest phones. Tablets keep the rules too; the page's own facts give way first. (RESP-02, RESP-11)
8. **Ask Sig is a window like every other.** A 44px title bar, 32px tabs, the site's 272px side panel with the four places under New chat and the rest of the site under the chats, the site's greys and grounds, the Prompt's shape. (LAYOUT-07, BRAND-05, RESP-28, COMP-25, TYPE-13)
9. **No glows.** The home graph draws its points as discs, its bloom and vignette are off, blood markers are the Markers agent's teal and cautions the Safety agent's coral. The Library's flow figure, Ask Sig's big ring and the story's ring don't glow or spin. (BRAND-07, 08, 13, 20, 22)
10. **The side panel's rows are rows.** The places are 36px and the quieter "more" list 28px (`row-more`), both in Mona Sans; in the phone drawer every row is 40px. The panel fits a 900px-tall screen whole. On a shorter one the folder tree gives way first, down to 120px, then the panel scrolls under its foot, so Sign in, Join and the legal line stay in view. Nothing in it was removed. (TYPE-06, LAYOUT-06, LAYOUT-27, RESP-04, RESP-06)
    - *Amended after the first pass:* 36px "more" rows pushed Join and the legal line off a 1440×900 screen and cut the Library's note mid-sentence. Measured at 1920×1080, 1440×900 and 1536×864: nothing scrolls and all ten links show; at 1440×790 to 1280×720 the panel scrolls 17–77px with the foot pinned.
11. **Bands aren't cards.** The fact sheet's glance is a band on the `band` ground, not a card in the window; "What moved this week" is a card inside the page's gutter. Page heads stay open bands with a hairline below, not plates. (LAYOUT-10, LAYOUT-11, COMP-12)
12. **Glyphs the fonts have.** ◊ for "worth checking", × for "blocks", ↩ for enter, • for a dot; the check mark and the stop square are drawn (`img/i-check.svg`). (TYPE-14)
13. **Better, same and worse** are lime, `amber` (a mixed read) and `down` (a worse outcome), wherever members' outcomes are split. (BRAND-21, systemic)

### Left as they are, for the founder

- **Ask Sig's crisis card.** Its "Call 988" buttons are filled dark red inside a coral-tinted pin. It's a crisis surface, so it wasn't touched. (BRAND appendix G)
- **The clinician packet** keeps its light "paper" look for printing and sharing with a doctor. (BRAND appendix G)
- **Ask Sig's answer states** (cautions, "avoid" levels, the urgency of a warning, an edited check) use their own coral and yellow shades. They appear only in a conversation and some sit beside the crisis card, so they need a review in a real conversation before mapping to `safety`, `down` and `amber`.

### Follow-ups

- Audit Ask Sig in conversation: the captures show its empty state only, so its answers, cards, screen pane and packet weren't reviewed. Drive a few questions through it (a stack check, a crisis word, a plan) and capture each state.
- Ask Sig's screen pane uses ○, ↳ and box-drawing characters that neither font has; they fall back to the system's mono face.
- The Library's "How the Signal is made" figure: its smallest labels render 6 to 7px at tablet width (RESP-15). Raising them means re-spacing the drawing.

## 2026-11-12: the Sig system, page 9

The founder pointed at page 9 of the design canvas ("9 Sig system") and asked why the site didn't look like it. The first review had checked the site against this brand book and never opened the canvas, so it made the older Plate look consistent instead of building page 9. From now on the canvas is the source of truth: `.claude/skills/design-review/SKILL.md` and `BRIEF.md` hold every page against its board, and `BRAND.md` ends with *The Sig system*.

### The calls

1. **Headlines in Mona Sans at its normal width, semibold.** The wide, heavy Display cut is gone. `hero` 64px (58px in the window), `section` 42px, `page` 38px, `h2` 22px. Supersedes the sizes and the Display face in call 2.
2. **Kickers are comments:** `// the community signal`, lowercase mono at 13px, no rule, no capitals. Labels and column heads are lowercase mono. Supersedes "mono capitals" in call 3.
3. **Tags are words, not code:** Mona Sans in sentence case at 12.5px, 7px corners, with the signer's pip where an agent made the thing. Supersedes "one tag" in mono capitals (call 3).
4. **Corners on the boards' scale:** tags 7px, tab tops 8px, rows 9px, buttons, fields and terminal blocks 10px, cards and the window 12px, the front page's panes 14px. Replaces `radius-plate` 6px and `radius-control` 8px.
5. **Signed, not boxed.** On a fact sheet the findings, studies, safety notes and blood tests carry their signer's 2px mark in the gutter (Evidence librarian blue, Safety agent coral, Markers agent teal) instead of a box round each.
6. **The front page is a prompt, then the Signal, then Sig's twelve agents.** "› look up" with live results and pips, the Library's graph tracing what's typed ("trace semaglutide · 9 places · 5 safety notes"), the numbers, three ways in, the Community Signal running like `top` (totals, members against forums, the board, `tail -f signal.log`), an example run where all twelve agents light the ring and sign their lines (pick one to light up what it wrote), the real BPC-157 example, how a report becomes a commit, the house rules as a file and the questions. The Signal board reads the live public snapshot and asks for a newer one each minute while it's on screen.
7. **Everywhere:** ⌘K (Ctrl K off Apple devices) on every page and in Ask Sig (`lib/cmdk.js`, `library/data/cmdk.json`); the status bar says what you're looking at and how fresh it is, then the rules, then ⌘K ("online" is gone); the ring is the Signal board's spinner; the 404 is "command not found" with "did you mean".
8. **No "!" for safety.** A place with a safety note carries the Safety agent's pip on the graph. (The body map in the shared kit still draws "!"; see below.)
9. **Two more greys from the boards:** `text-read` (#DCDAD4) for an answer's words and anything an agent signed, `hover` (#161C20) for the row under the pointer or picked.
10. **A bug on the way:** privacy, terms and the 404 had no `script-src` in their policy, so their own script was blocked and the side panel couldn't fold or open as a drawer there. Fixed.

### Next, not in this change

- **The community app** keeps its own look until it takes the Sig system: SysCommunity ("every report is a commit", Sig's read under each report) and its status bar. The shared kit (the body map's "!" and its corners) changes there, then is copied here.
- **My Miracle as a file** (`~/my-miracle/stack.yml`), **the weekly email as a changelog** and **share cards with the three pips** (SysEverywhere) aren't built yet.

## 2026-11-12 · Black and electric blue

The site takes page 15's look (pages 15 to 18 of the design canvas): the grounds go from graphite to black, the window gets a faint 64px grid under an ultramarine wash, headlines are wide, heavy and in capitals, kickers are capitals, and the one main action is electric blue (#1A04FF, lit from #3A2BFF) with white words. The community and its Signal go from lime to Signal blue (#3D8BFF; the code keeps the name `lime`), the studies' grades go from blue to mint (#14ECC3), and the Evidence librarian keeps its own blue (#6FA8FE) in Sig's ring. The design check's baseline was rewritten for the new gradients and glow, which the brand book now allows.

## 2026-11-12 · The front page leads with the Community Signal

The front page takes page 15's top. The Library's graph gives way to the Signal itself: a ring of its four parts (what happened 65, agreement 15, voices 10, volume 10) with the score in its middle, the compound's name with a way to step to the next, what people report most, the level its Signal has reached and how strong its studies are. Under it, the Signal spectrum: every live Signal as one bar, as tall as its score and split in the shares its four parts give it, grouped by kind; picking a bar opens it above. Both read the live Signal (`lib/sighero.js`, handed what it needs by `home.js`). The prompt stays, as a search box whose fact sheets open under it while you're in it, and still looks things up in the graph's data. "Signal, not noise" (page 15) follows How it works: what a forum thread or a star rating usually does, beside what the Signal does, rule for rule. The Signal leads the side panel's places on every page, with how many Signals are live on the front page.

1. **The bars are as tall as the score.** The published score isn't always the four rounded parts added up (the parts are shown whole), so each bar's height is the score and its parts keep their shares. Page 15's equation ("= 91.9, exactly") isn't built for the same reason: for most compounds the parts on show wouldn't add up to the number.
2. **On a phone the Signal comes first**, then the spectrum, then the search and the actions, as page 15's phone board has it.
3. **New glow, counted:** the ring's halo and sweep, the spectrum's floor and the picked bar's cap, the Signal card's wash and the open search's panel. The design check's baseline was rewritten for them.
