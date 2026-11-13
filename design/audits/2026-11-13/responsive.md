# Phone and tablet: audit report (November 13)

**The state of the area, in one line:** the website's new frame holds well on phones (one sideways overflow on the whole site, a drawer that does everything the book asks, 16px margins on every page), but the front page breaks between 861 and 1279px and in two places at 390, and the community app is still on its older frame: its tablet band, Signal board, touch targets, type floors and margins all fall short of the website's.

**How it was measured:**
- Live pages with Playwright for Python and Chrome: every website page in `design/pages.json`, all 15 community screens and the sign-in screen, at 1440, 1024, 768 and 390.
- At 768 and under I emulated a touch device (`has_touch`, `is_mobile`), because the site's `@media (pointer:coarse)` rules change control sizes; the art director's capture has no touch, so its 390 data shows Join at 36px where a phone gets 40px.
- Wrapping and size checks ran with reduced motion and after one scroll through each page, so typed-in titles and scroll-in cards were whole.
- Extra widths for overflow: 360, 430, 820, 900, 960, 1180 and 1280. Panel heights: 1440×900, 1440×790 and 1280×720. Drawers: also 360×640 and 844×390.
- Every fix marked **verified** was injected into the live page (`bypass_csp`) and measured again before and after; fixes in JavaScript or markup are marked **not verified live**.
- Scripts and raw results: `.design/work/design-responsive/` (`sweep.js` is the per-page checker; `live/*.json` holds its output). Images: `.design/evidence/design-responsive/`.

**Severity convention:** high breaks a layout or shows on many page templates (the brief); I count a template once, so a problem on every fact sheet is one template.

## What the frame does today (checked, mostly fine)

- **Overflow:** across all 23 website pages at 11 widths, only the front page is wider than the screen (PT-01). The community has none at the four widths.
- **Words:** no word breaks mid-letter anywhere on either site (HTML text); every break is at a hyphen (see PT-27).
- **The website's drawer** (390×844, 768×1024, 1440×900, 360×640, 844×390; front page, a sheet, privacy, 404, My Miracle, Ask Sig):
  - it covers the page and the top bar (the scrim is on top at the top bar's right end);
  - focus moves in; the page behind is `inert`, and a 500px wheel moves it 0px;
  - Escape, the scrim and its own button all close it, Escape returning focus to the menu button;
  - on short or sideways phones it scrolls to its legal line.
  - Exceptions: PT-25 and PT-26.
- **The bars:**
  - **Website at 390** (56px): the menu (40×40), logo, search and Ask Sig as 40×40 icons, and Join (57×40), as BRAND.md *On a phone* says. **At 768** (60px): all of it, with the 420px search box and its ⌘K/Ctrl K, and "Ask Sig" in words. No status bar (the plain frame).
  - **Ask Sig at 390:** a 52px title bar (menu 40×40, ring, "Sig", "12/12 ready"), then the tab row ("New chat" 99×39, + 40×40). The status bar gives way to one line of small print carrying the rules, as decided on November 13; "safety on" doesn't show. **At 768:** a 44px title bar (menu, ring, Sig, "health terminal", the tab, +, "12 agents online") and a 28px status bar (SIG, ready, safety on, the rules, Ctrl K; the Library's date drops below 1101px).
  - **Community at 390 and 768:** the preview banner; the 28px ticker (SIGNAL · LIVE and the running Signal; SIG and "safety on" are hidden at 860px and under); a 52px top bar (menu 36×36, ring and Community, Create, bell, avatar); the "~ / home" path line; and a 64px bottom tab bar (Home, Signal, Share, Builders, You). **From 861px:** the panel docks and the window's title bar takes the search.
- **Screen height:**
  - **Website panel, all 23 pages:** at 1440×900 it fits whole (nothing scrolls, every "more" link shows, the foot ends at the screen's bottom). At 1440×790 and 1280×720, pages without a folder tree still fit. The Library and the fact sheets give the tree way to 119px and 108px and scroll 18px and 78px, with Sign in, Join and the legal line in view.
  - **Ask Sig's panel:** fits at 900. At 790 and 720 the chat list gives way to 119px and 108px and the panel scrolls 62px and 121px, with the foot pinned.
  - Deviations: PT-24 and PT-29(a). Image: `panel-sheet-semaglutide@1280x720.jpg`.
- **Side padding at 390:** every framed website page puts its text 16px from both edges. The exceptions are PT-10, PT-15 and PT-18.

---

## Findings, most visible first

### PT-01 · high · Front page: wider than the screen from 901 to about 1050px, and How it works' cards cut their titles and run past their frames from 901 to 1279px
- **Where:** front page (`/`), How it works' six cards (`.hs-step`), at a `.hs` container width of 901 to 1279px.
  - The page is 989px wide at 901, 1018 at 960 and 1050 at 1024 (the capture's overflow).
  - It is the only overflow on the site; other pages were checked at 11 widths.
- **Selectors:**
  - home.css:613 `.hs-card{width:min(560px,calc(50% - 96px))}` makes the cards 384–494px wide in this band.
  - home.css:621 `.hs-title{white-space:nowrap;overflow:hidden;text-overflow:clip}`.
  - home.css:624 `.hs-f{display:flex;height:96px;padding:0 24px 0 84px}`, :626 `.hs-who{24px}`, :627 `.hs-sub{margin-left:auto}`.
  - The stacked layout only starts at `@container (max-width:900px)` (home.css:642).
- **Evidence:**
  - At 1024 card 01's foot line "community.miraclehealth.us" (`span.hs-sub`, 171px, no break opportunity) spans x 879–1050: 58px past its card's frame and 26px past the screen. Below 1130px it overruns the frame on screen too (20px at 1100).
  - Titles are cut mid-letter, by 30, 52, 30 and 41px at 1024 and up to 113px at 901: "Reports, in people's own wo", "One number, everywhere you l".
  - Card 06 sets "The / Community / Signal" one word a line.
  - Images: `home@1024-how-card01-overflow.jpg`, `home@1024-how-card06-oneword.jpg`.
- **Rule:** the brief: nothing cut off or overlapping, URLs break, no single words per line; BRAND.md *The frame*: the page runs the window's width.
- **Fix:** home.css, after :627, put the narrow-card foot in the Sig card's pattern (`.fp-team-f .hs-sub{display:block}`):
  ```css
  @container (min-width:901px) and (max-width:1279px){
    .hs-step .hs-title{white-space:normal;font-size:15px;line-height:1.35}
    .hs-step .hs-f{display:grid;grid-template-columns:52px minmax(0,1fr);column-gap:16px;align-content:center}
    .hs-step .hs-tile{grid-row:span 2}
    .hs-step .hs-who{font-size:20px}
    .hs-step .hs-sub{margin:4px 0 0;text-align:left}
  }
  ```
- **Check (verified):**
  - scrollWidth equals the screen at 901, 960, 1024, 1100, 1180 and 1279.
  - All six titles are whole (0px cut) and each foot fits its card.
  - "The Community Signal" sets on 1 line (2 at 960 and under).
  - Nothing changes at 900 and under or from 1280.
  - Images: `home@1024-how-card01-after-fix.jpg`, `home@1024-how-card06-after-fix.jpg`.

### PT-02 · high · Front page: the real example's rows slip one column against their heads from 861 to 1100px
- **Where:** front page, "Popular isn't the same as proven" (`.fp-vs`), at 861–1100px (iPad landscape, small laptops).
- **Selectors:** styles.css:322–329 `@media (max-width:1100px){… .vs-use{grid-column:1/-1} …}`. These are the old example's tablet rules, still used by the fact sheets. home.css:403 gives `.fp-vs .vs-row` four columns and keeps its heads (`.fp-vs .vs-cols{display:grid}` outranks styles.css's `display:none`), but nothing resets `.vs-use`, so "taken for" spans the row and the three answers shift left.
- **Evidence:**
  - At 1024 the heads start at x 68 / 262 / 501 / 741, and the cells at 68 / 68 / 262 / 501.
  - The studies sit under "taken for", "Very common on the forums" under "what the studies show", the placebo figures under "what people report", and "got better on a placebo" is empty.
  - Images: `home@1024-example.jpg` against `home@1440-example.jpg`.
- **Rule:** the brief: no broken in-between layouts, no squeezed tables.
- **Fix:** home.css, after :406 (`.fp-vs .vs-row{…}`), add `.fp-vs .vs-use{grid-column:auto}`.
- **Check (verified):** the cells start at the heads' x at 900 (63 / 257 / 458 / 660), 1024 (68 / 262 / 501 / 741) and 1100. 1180 and wider, and 860 and narrower (where it stacks), are unchanged.

### PT-03 · high · Front page at 390: the Signal board's table scrolls sideways and cuts "this week"
- **Where:** front page, `#signal` board (`#fp-top`), from about 300 to 430px.
- **Selectors:** home.css:255 `.fp-top th,.fp-top td{…white-space:nowrap}` also applies to the closing row, `.fp-top .more td` (home.css:274), whose one cell spans the table: "… 43 more · sort the whole board in the community". That cell's 405px sets the table's minimum width.
- **Evidence:** the table is 405px inside a 356px scroller (`.fp-top-wrap{overflow-x:auto}`, home.css:252), with no cue that it scrolls. The moves column shows as "thi" and the link as "…in the commu". Image: `home@390-signal-board.jpg`.
- **Rule:** the brief: no squeezed tables, nothing cut off.
- **Fix:** home.css:274 `.fp-top .more td{padding-top:12px;padding-bottom:12px;color:var(--muted)}` → add `white-space:normal`.
- **Check (verified):** the table fits at 360, 390 and 430 (326/326, 356/356 and 396/396px), with all four columns. 768 and 1440 are unchanged. At 320 it still scrolls 34px. Image: `home@390-signal-board-after-fix.jpg`.

### PT-04 · high · Community: the Signal board is wider than its frame at every width
- **Where:** community `#/signal` at 1440, 1024, 768 and 390.
- **Selectors:** web/styles.css:974 `.top-table th,.top-table td{…white-space:nowrap}`. The compound column takes its longest name ("Melanotan I (afamelanotide)", 210px).
- **Evidence:**
  - The table is 797px in a 738px frame at 1440, 670 at 1024 and 744 at 768, and 453px in 366 at 390.
  - "last move" is cut to "las" at 1440 and 768. At 390 the moves are off screen. At 1024 the part columns are cut too.
  - Images: `comm-signal@1440-board.jpg`, `comm-signal@390-board.jpg`, `comm-signal@768-board.jpg`.
- **Rule:** the brief: no squeezed tables, nothing cut off.
- **Fix:** web/styles.css:
  - :982 `.top-table tbody th{font:600 14px/1.3 var(--body)}` → add `white-space:normal;min-width:7.5em`;
  - add `@media (min-width:861px) and (max-width:1100px){.top-table .opt{display:none}}`, the same parts the phone already drops at :1002;
  - add `@media (max-width:480px){.top-table th,.top-table td{padding:9px 8px}}`.
- **Check (verified):** the frame and table widths match at 1440 (736/736), 1101 (745/745), 1024 (668/668), 768 (742/742) and 390 (364/364). 3 to 8 long names take two lines. Image: `comm-signal@390-board-after-fix.jpg`.

### PT-05 · high · Community: the docked side panel gives 1024 less room than 768, so Explore drops a column
- **Where:** every community screen from 861 to about 1150px.
- **Selectors:** web/styles.css:774–791. The drawer rules (`.os{grid-template-columns:minmax(0,1fr)}`, `.side{position:fixed…}`, `.burger{display:inline-grid}`, `.scrim`) only apply at 860px and under; at :838 `@media (min-width:861px){… .scrim{display:none}}`.
- **Evidence:**
  - The feed column is 738px at 1440, **670px at 1024** and 744px at 768.
  - Explore runs 3 columns at 1440, **2 at 1024** and 3 at 768, and is 26,533px tall at 1024 against 19,133 at 768 and 18,234 at 1440.
  - The website has none of this: its panel slides in over the page at every width (decision log, November 12).
- **Rule:** the brief: no grids collapsing oddly, no columns too narrow; BRAND.md Principle 4 and *The frame*: one side panel, closed until the menu button opens it.
- **Fix:** web/styles.css:
  - move `:root{--os-g:0px}`, `.os{…}`, `.side{…}`, `body.drawer .side{…}`, `.burger{display:inline-grid}` and `.scrim{…}` out of the `@media (max-width:860px)` block (:775–790) into a new `@media (max-width:1279px){…}` placed before it (`--top-h:52px` and the phone rules stay at 860);
  - at :838 keep `.post .vote.h{display:none}` at 861px and up, and move `.scrim{display:none}` to `@media (min-width:1280px)`.
  - The panel is not removed: it slides in from the menu button, as on the website.
- **Check (verified):** at 1024 the feed column is 780px and Explore 3 columns (18,770px tall). The open drawer shows the panel, and the page holds still with PT-19's lock.

### PT-06 · high · Community: labels under 11px and copy under 15px on every screen at 390
- **Where:** all 15 community screens at 860px and under.
- **Selectors and sizes:**
  - web/styles.css:823 `.tabbar a{font:500 9.5px var(--mono)}`: the bottom tabs, on every screen.
  - :65 `.tick-lead` 10.5px ("SIGNAL · LIVE"); :223 `.chip` 10.5px; :121 `.count` 10.5px (the bell's number); :109 `.logo .tag`, :286 `.pop button`, `.cap2` and `.use-meta`, all 10.5px.
  - The foot's disclaimer `#foot-text` (with the 988 line) is 14px; the website's is 15px at this width.
  - Notes: `p.xs` 12px (7 screens), `p.small` 13.5px (6 screens).
- **Evidence:** the 390 sweep: 60 tab labels at 9.5px, 15 ticker leads at 10.5px, 15 foot disclaimers at 14px. Image: `comm-home@390-top.jpg` (the tab bar at its foot).
- **Rule:** the brief: body at least 15px (`body-app` 15px), labels at least 11px.
- **Fix:** web/styles.css:
  - :823 `9.5px` → `11px`; :65, :223, :121, :109 and :286 `10.5px` → `11px`;
  - in the 860px block add `#foot-text{font-size:15px}` and `.small,.xs{font-size:14px}` (the `small` token).
- **Check (verified for the tab bar and the foot):** at 390 and 768 the tab labels are 11px and none overflows its 78px slot; the foot disclaimer is 15px.

### PT-07 · high · Community: phone side padding is 12, 14, 16 and 20px against the website's 16px
- **Where:** every community screen at 860px and under, so 768 too.
- **Selectors:** web/styles.css 860px block:
  - :787 `.layout{padding:0 12px 96px}` (the page);
  - :786 `.win-path{padding:6px 14px}`;
  - :782 `.topbar{padding:0 10px 0 8px}`, with :106 `.burger{padding:6px;margin-left:-6px}` putting the menu glyph at 8px;
  - :806 `.auth-art{padding:112px 20px 30px}` and :816 `.auth-form{padding:30px 20px 44px}` (sign-in);
  - :829 `.foot-in{padding:32px 16px…}` (the foot).
- **Evidence:**
  - At 390 the page starts at 12px, the path at 14, the foot at 16, the sign-in at 20 and the menu glyph at 8. The website puts all of these at 16.
  - At 768 the community's page still sits 12px in; the website's sits 20px in.
  - Images: `comm-home@390-top.jpg`, `comm-signin@390.jpg`.
- **Rule:** the brief: equal side padding, the same on every page; tokens.json `pad`.
- **Fix:**
  - :787 → `padding:0 16px 96px`; :786 → `6px 16px`; :806 → `112px 16px 30px`; :816 → `30px 16px 44px`;
  - :782 → `padding:0 14px 0 16px`, with `.burger{padding:8px;margin-left:-8px}` in the same block (PT-08 makes it 40×40).
- **Check:**
  - Verified: the page and the path start 16px in at 390 and 768.
  - From the measured offsets (not re-measured with these exact values): the menu glyph sits at 16px and the avatar's box ends 16px from the right.

### PT-08 · high · Community: touch targets under 40px across every screen at 390
- **Where and sizes:** every screen at 390 (768 is the same layout).
  - Menu `#burger` 36×36 (:106).
  - Create and every `.btn.sm` 38px (:905).
  - The path crumbs `.wp-crumbs a` 19px tall; "~" is 7×19 (:101).
  - Foot links 17px (:620).
  - Post actions `.act` 32px (:276), vote arrows `.vote.h button` 30×28 (:262).
  - Sort tabs `.sortbar a` 34px (:243), the focus list `.focus-i` 32px (:875).
  - The comment toggle `.cm-toggle` 19×16 (:311); table sorts `.th-sort` 18px (:979).
  - Ticker links `.tick-i` 12px tall in a 28px bar.
- **Evidence:** `live/comm-*@390.json`, e.g. the home feed: 52 vote buttons at 30×28 and 104 actions at 32px. Image: `comm-home@390-top.jpg`.
- **Rule:** the brief's 40×40 at 390. The website's own floor is `.btn.sm` 40px on touch (styles.css:432), 40px menu buttons, 40px foot links at 700px and under.
- **Fix:** web/styles.css 860px block:
  ```css
  .burger{width:40px;height:40px}
  .btn.sm{min-height:40px}
  .act,.vote.h button{min-height:40px;min-width:40px}
  .sortbar a,.sortbar button,.tabs a,.space-tabs a{min-height:40px}
  .foot-links a{display:inline-flex;align-items:center;min-height:40px}
  .wp-crumbs a{display:inline-flex;align-items:center;justify-content:center;min-width:40px;min-height:40px}
  .cm-toggle{min-width:40px;min-height:40px}
  .th-sort{min-height:40px}
  .focus-i{min-height:40px}
  .tick-i{display:inline-flex;align-items:center;height:100%}
  ```
- **Check (verified for the menu, `.btn.sm`, actions, votes, sort tabs, foot links, crumbs and focus list):** each is 40px tall, and the menu, votes and crumbs 40px wide too, at 390 and 768.

### PT-09 · high · Figures: labels drawn far under 11px on phones and tablets
- **Where:**
  - The front page's six How it works drawings (index.html `svg.hs-svg`, labels at `font-size="11"` on a 560-wide viewBox): 6.1–6.8px at 390 (344px wide), 7.4–8.1px at 1024 (414px wide), 13–14px at 768.
  - "How the Signal is made" (`svg.flowviz`, the Library and community `#/signal`): 4.6px at 390, 5.3 at 768, 6.9 at 1024; 24 of 31 labels under 11px at 390.
  - The takeover chart (`svg.takeover`): every fact sheet's Signal, 4.9px at 390 with 15 of 15 under 11px; community `#/signal` and `#/s/…`, 7.4–8.9px.
- **Selectors:**
  - library/signalviz.js and web/kit/signalviz.js (identical) draw labels at 7–9.5 units (lines 90, 99, 108, 131, 133, 143–146, 162, 208, 249, 282).
  - The How it works drawings are static SVG in index.html.
- **Evidence:** `sheet-semaglutide@390-takeover.jpg`, `library@390-flowviz.jpg`, `home@390-how-top.jpg` (card 01's drawing). Measured from each `<text>`'s `getScreenCTM()` × font size.
- **Rule:** the brief: labels at least 11px, figures scale; the November 13 decision for the Signal card: "On a phone, where the tags in the drawing would be too small to read, the same four tags sit in a row under it". The decision log's November 11 follow-ups already list the flow figure.
- **Fix (not verified live: JS and markup):**
  1. **How it works:** apply the Signal card's rule to the six cards. Add `container-type:inline-size` to `.hs-card`. Under each drawing add the drawing's tags as HTML (`<p class="hs-parts">`, styled like `.sx-parts`). Then `@container (max-width:539px){.hs-ill .hs-tag{display:none} .hs-parts{display:flex}}` (the drawing renders 1:1 at 560px). This needs a class on each in-drawing tag group in index.html.
  2. **signalviz.js (both copies):** draw the compact figures on a viewBox matched to their rendered width (316–332px), so one unit is about one pixel. Give every label a floor at draw time: `size = Math.max(designed, 11 * viewBoxWidth / renderedWidth)`, re-spacing the boxes.
- **Check:** at 390, 768 and 1024 the smallest rendered `<text>` in `svg.hs-svg`, `svg.flowviz` and `svg.takeover` is at least 11px.

### PT-10 · high · Website: the top bar's edges at 390 are 12px and 10px, the page's 16px
- **Where:** all 21 framed pages at 700px and under.
- **Selectors:** styles.css:634 `.os-top{gap:6px;padding:0 10px 0 8px}`, with :588 `.os-menu{margin:0 0 0 -8px}`.
- **Evidence:** at 390 and 360 the menu glyph starts 12px from the left and Join ends 10px from the right; text starts 16px in on every page. Image: `about@390-topbar.jpg`.
- **Rule:** the brief: equal side padding, the same on every page.
- **Fix:** styles.css:634 `padding:0 10px 0 8px` → `padding:0 16px 0 12px`.
- **Check (verified):** at 360 and 390 the menu glyph starts at 16px and Join ends 16px from the right. The logo still clears the search icon (83px at 360).

### PT-11 · high · Website: copy under 15px, and notes under the 14px `small` token, at 390
- **Where:**
  - On every framed page: the foot's sign-up note `.nf-note`, 13px (styles.css:302, pages/pages.css:150).
  - The fact sheets' disclaimer `.side-note`, 13px ("Experiences and published evidence, not medical advice…", library/library.css:241).
  - On the front page: `.fp-fine` 13px (home.css:213); the example's running copy `.fp-vs .vs-sub` 14px (home.css:410); `.fp-c-s` 14px (home.css:437).
  - The method table: cells 14.5px (styles.css:399), `.cell-sub` 13px (:410).
  - The plan's `.plan-fine` 13px (ai/plan.css:160).
- **Evidence:** the 390 sweep (`live/*@390.json`, "copy").
- **Rule:** the brief: body at least 15px at 390; tokens.json `small` 14px for a note.
- **Fix:** at `@media (max-width:700px)`:
  - `.vs-sub` and `.fp-c-s` 14 → 15px; `.method .mtable` 14.5 → 15px;
  - `.side-note` 13 → 15px (it carries the disclaimer, like the foot's, which is already 15px);
  - `.nf-note`, `.fp-fine`, `.plan-fine` and `.method .cell-sub` 13 → 14px.
- **Check (not verified live: sizes only):** at 390 no Mona Sans sentence is under 14px, and running copy is 15px or more.

### PT-12 · high · Website: the frame's own links under 40px at 390
- **Where:** all 21 framed pages.
- **Sizes:** the top bar's logo `a.os-top-logo` 63×22 (styles.css:609); the foot's logo `a.foot-logo` 69×24 (:279); the foot's "Terms" 39×40.
- **Evidence:** `live/*@390.json` taps.
- **Rule:** the brief's 40×40.
- **Fix:**
  - styles.css:609 `.os-top-logo{display:block;flex:none}` → `display:flex;align-items:center;flex:none;min-height:40px`;
  - in the 700px block (:638–641) add `.foot-logo{display:inline-flex;align-items:center;min-height:40px}`, and to `.foot-links a` add `min-width:40px;justify-content:center`.
- **Check (verified):** the logos are 63×40 and 69×40, and every foot link is at least 40×40 at 360 and 390.

### PT-13 · medium · Front page: Sig's run squeezed beside its card from 1000 to 1279px
- **Where:** front page, `section#sig` (`.fp-run`).
- **Selectors:** home.css:505–507 `@container fp (min-width:1000px){.fp-run{grid-template-columns:minmax(0,1fr) minmax(360px,420px)} .fp-team.hs-card{position:sticky…}}`.
- **Evidence:**
  - The evidence rows' text column (`.fp-ev li` second column) is 130px at 1000, 152 at 1024, 222 at 1100 and 295 at 1180, running 4 to 9 lines a row.
  - At 999 (stacked) it is 573px, at 768 374px.
  - Image: `home@1024-sig-section.jpg`.
- **Rule:** the brief: no columns too narrow; decision log November 11, call 6 (layouts that need room stack until 1279px).
- **Fix:** move those two declarations into a new `@container fp (min-width:1280px){…}`; leave `.fp-join-in` and `.fp-faq-in` at 1000.
- **Check (verified):** the evidence text is 596px at 1024, 666 at 1100 and 830 at 1279. The section grows from 2,630 to 3,095px at 1024. 1280 and wider are unchanged.

### PT-14 · medium · Front page: the three steps go three-up at 768, one word a line
- **Where:** front page, `#steps` (`.st-cards`), at an `fp` width of 760–999px.
- **Selectors:** home.css:498–501 `@container fp (min-width:760px){.st-cards{grid-template-columns:repeat(3,…)} .st-card{min-height:400px}}`, with :170 `.st-card{padding:40px 36px}` and :173 h3 at 24px.
- **Evidence:** at 768 each card is 229px with 155px of text: "THE / SIGNAL / MOVES" one word a line, and the copy runs 5 to 7 lines. Image: `home@768-three-steps.jpg`.
- **Rule:** the brief: no single words per line, no columns too narrow.
- **Fix:** home.css, after :504:
  ```css
  @container fp (min-width:760px) and (max-width:999px){
    .st-cards{grid-template-columns:minmax(0,1fr)}
    .st-card{min-height:0;display:grid;grid-template-columns:112px minmax(0,1fr);column-gap:32px;align-items:center}
    .st-card>*{grid-column:2}
    .st-card>.st-ico{grid-column:1;grid-row:1/span 3}
    .fp .st-card h3{margin-top:0}
  }
  ```
- **Check (verified):** at 768, 900 and 999 each title sets 1 line and each text 2 lines; the section is 905px against 892 today. 1000 and wider are unchanged. Image: `home@768-three-steps-row-card.jpg`.

### PT-15 · medium · Front page: How it works runs flush to the right edge at 900px and under
- **Where:** front page, `section#how`, at 360–900px.
- **Selectors:** home.css:646 `.hs-step{padding:28px 0 28px 44px}`, :644 `.hs-intro{padding:72px 20px 60px 44px}`, :657 `.hs-close{padding:40px 0 0}`.
- **Evidence:**
  - Captions, cards and the closing buttons end 0px from the screen's right edge at 360, 390, 600, 768 and 900.
  - The lede ends 20px in; the rest of the front page keeps 16px (390) or 24px (600–860).
  - Image: `home@390-how-top.jpg`.
- **Rule:** the brief: side padding equal and the same on every page. The spine's 44px on the left is part of the drawing; the right should match the page.
- **Fix:** in the `@container (max-width:900px)` block:
  - `.hs-intro` and `.hs-step` padding-right → `24px`; `.hs-close` padding → `40px 24px 0 0`;
  - add `@container (max-width:560px){.hs-intro,.hs-step,.hs-close{padding-right:16px}}`.
- **Check (verified):** every block ends 16px from the edge at 360 and 390, and 24px at 600–900.

### PT-16 · medium · Headlines over three lines at 390
- **Where and evidence:**
  - The story's h1, "One app. / Twelve agents. / Every answer, checked.": 4 lines at 32.5px; the `<br>`s force three lines and the last phrase wraps. It is also 4 lines at 1440 (51.5px in a 761px column; typography's call).
  - The front page's How it works head (`.hs-head`, with a `<br>`): 4 lines at 32px.
  - Ask Sig's greeting (`.ai-title`, ai/ai.css:39 `clamp(34px,3.4vw,48px)`): 4 lines at 34px.
  - Images: `story@390-h1.jpg`, `home@390-how-top.jpg`, `asksig@390x844.jpg`.
- **Rule:** the brief: no headline over three lines at 390.
- **Fix** (the front page's hero already drops its `<br>` on phones, styles.css `.hero h1 em br{display:none}`):
  - styles.css, after the story's 760px block (:778): `@media (max-width:700px){.sy-hero h1 br{display:none}}`;
  - home.css, in the `.hs` container: `@container (max-width:560px){.hs-head br{display:none}}`;
  - ai/ai.css, after :39: `@media (max-width:480px){.ai-title{font-size:30px}}`.
- **Check (verified):** at 390 all three set 3 lines. The story is 3 lines at 430 too; Ask Sig's is 3 lines at 360. At 360 How it works' head is still 4.

### PT-17 · medium · Ask Sig: the agents pane cuts every agent's line from 1101 to about 1700px wide
- **Where:** `/sig/` and `/ai/`, the agents tab beside the chat.
- **Selectors:** ai/term.css:76 `.tm.ai-app{grid-template-columns:minmax(0,1fr) clamp(380px,32%,560px)}` holds the pane at 380px until about 1700px wide. :363 `.tm-who{grid-template-columns:14px 8px 152px minmax(0,1fr)}` leaves the line 114px, and :372 `.tm-now{white-space:nowrap;text-overflow:ellipsis}` cuts it.
- **Evidence:** at 1101, 1280 and 1440 all 12 of 12 lines are cut ("First to read, …", "Turns goals int…"); 7 of 12 at 1700; none at 1920. Image: `asksig@1440-roster.jpg`.
- **Rule:** the brief: nothing cut off.
- **Fix:** ai/term.css, after :373 (the line goes under the name, as on the front page's card; the ring gives way so the pane still fits a 900px-tall screen):
  ```css
  .tm-team{container-type:inline-size}
  @container (max-width:460px){
    .tm-who{grid-template-columns:14px 16px minmax(0,1fr);padding:4px 10px;line-height:1.35}
    .tm-who .tm-now{grid-column:3;white-space:normal}
    .tm-ringbox{max-width:260px}
  }
  ```
- **Check (verified):** 0 lines cut and the pane doesn't scroll at 1101, 1280, 1440 and 1700 (900 tall). 1920 is unchanged. Image: `asksig@1440-roster-after-fix.jpg`.

### PT-18 · medium · Ask Sig at 700px and under: the typing bar sits 10px from the edges, the rest 16px
- **Where:** `/sig/` and `/ai/` at 360–700px.
- **Selectors:** ai/term.css:409 `.tm .ai-dock{padding:8px 10px calc(8px + env(safe-area-inset-bottom))}`, against :385 `--tm-px:16px`.
- **Evidence:** at 390 the box to write in and the small print span x 10–380; the greeting and the ways to start sit at 16–374. Image: `asksig@390x844.jpg`.
- **Rule:** the brief: equal, consistent side padding.
- **Fix:** ai/term.css:409 → `padding:8px var(--tm-px) calc(8px + env(safe-area-inset-bottom))`.
- **Check (verified):** the box and the small print sit 16px from both edges at 360, 390 and 430. The page still doesn't scroll (844/844).

### PT-19 · medium · Community: the drawer lets the page behind scroll and be tabbed into, and has no close button of its own
- **Where:** every community screen at 860px and under (to 1279px with PT-05).
- **Selectors:** web/ui/shell.js:207–218 only toggles `body.drawer` and a scrim. Nothing locks the page's scroll or makes it `inert`, and `.side-head` (web/index.html:28) has no close button.
- **Evidence:**
  - At 390, 768 and 360×640, a 400px wheel over the scrim scrolled the page 400px.
  - 39 of 60 Tab presses landed behind the scrim (the menu button, Create, bell, avatar, the path).
  - Escape, the scrim and following a link do close it, and focus returns to the menu button.
  - Image: `comm-drawer@390.jpg`.
- **Rule:** BRAND.md *Closing the panel*: "its own button, Escape, a tap outside it or following one of its links". The website's drawer locks and inerts the page (styles.css:543, lib/os.js:11–16).
- **Fix:**
  - web/styles.css: add `:root:has(body.drawer){overflow:hidden}`.
  - shell.js: on open set `document.querySelector('.win').inert = true` (and `.tabbar` and `#sigdock`, which sit outside `.win`); clear them in `closeDrawer()` (:162).
  - Add `<button class="side-fold" type="button" aria-label="Close the menu">` to `.side-head`, styled like the website's `.os-fold` (40×40) and shown only while the side is a drawer, calling `closeDrawer(true)`.
- **Check:**
  - Verified: with the CSS lock, the wheel moves the page 0px.
  - Not verified (JS): Tab stays in the drawer, and the button closes it.

### PT-20 · medium · Front page at 390: the spectrum's bars, the Signal card's arrows and the agents' rows are small targets
- **Sizes:**
  - The spectrum's 51 bars are buttons 5px wide (`button.sx-bar`, 5×120).
  - The Signal card's arrows are 36×36: home.css:559 sets `.sx-nav{width:36px;height:36px}` at 560px and under, though the base is 40×40 (:89).
  - Sig's card's roster rows are 28px (home.css:359 `.roster button{padding:6px 8px}`).
  - Standalone links: `.sx-howto` 20px (:71), `.fp-more` 18px (:215).
- **Evidence:** `live/home@390.json`; image `home@390-spectrum.jpg`.
- **Rule:** the brief's 40×40.
- **Fix:**
  - delete home.css:559;
  - add `.roster button{min-height:40px}` to `@container fp (max-width:640px)`;
  - add `display:inline-flex;align-items:center;min-height:40px` to `.sx-howto` and `.fp-more`;
  - lib/sighero.js, after the keydown handler (:200–208), let a finger pick the nearest bar and slide along them, with `.sx-cols{touch-action:pan-y}` in home.css:
    ```js
    cols.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const near = (x) => bars.reduce((b, el, i) => { const r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - x); return d < b.d ? { i, d } : b; }, { i: pick, d: Infinity }).i;
      const go = (ev) => { const i = near(ev.clientX); if (i !== pick) fill(i, { animate: true }); };
      go(e); cols.addEventListener('pointermove', go);
      cols.addEventListener('pointerup', () => cols.removeEventListener('pointermove', go), { once: true });
    });
    ```
- **Check:**
  - Verified: the arrows are 40×40 and the rows 40px at 360 and 390.
  - Not verified live: the scrub.

### PT-21 · medium · Front page at 390: labels in the Signal card and Sig's ring under 11px
- **Sizes:**
  - home.css:101 `.sx-of` ("out of 100") and :102 `.sx-sum` ("mostly positive"): `clamp(9px,…)`, 10.6px at 390.
  - :77 `.sx-read span` 10.5px; :140 `.sx-gv` (the spectrum's axis) 10.5px.
  - :356 `.fp-ring-l` ("reported", in Sig's ring) `clamp(9px,…)`, 9.8px.
- **Evidence:** `live/home@390.json` "small"; images `home@390-signal-card.jpg`, `home@390-sig-ring.jpg`.
- **Rule:** the brief: labels at least 11px.
- **Fix:** :101, :102 and :356 `clamp(9px,` → `clamp(11px,`; :77 and :140 `10.5px` → `11px`.
- **Check (not verified live: sizes, +0.4 to +1.2px):** no HTML text under 11px on the front page at 390.

### PT-22 · medium · Body map: the marker chips are 24px tall (shared kit)
- **Where:** every fact sheet with a body map (and the community, which shares the kit), at 390.
- **Selectors:** kit/kit.css:94 and web/kit/kit.css:94 (identical) `.mh-bm-mk{…min-height:24px…}`. These are buttons that light a marker.
- **Evidence:** 118×24 and 65×24 at 390 on semaglutide and creatine. Image: `sheet-semaglutide@390-bodymap-markers.jpg`.
- **Rule:** the brief's 40px. The site's chips are 44px (decision log November 11, call 3).
- **Fix:** both kit.css files, after :97: `@media (pointer:coarse){button.mh-bm-mk{min-height:40px}}`.
- **Check (not verified live):** on a touch screen each marker chip is 40px tall.

### PT-23 · low · Front page: the spectrum's axis labels hang outside the plot, cut at 761–790px and touching the edge to 1100
- **Selectors:** home.css:140 `.sx-gv{position:absolute;left:-36px}`. Only at 760px and under do they move inside (:494).
- **Evidence:**
  - The labels start at x −12 at 768 ("100" shows as "00"), 0 at 900, 5 at 1024 and 8 at 1100.
  - The page's text starts at 24, 36, 41 and 44.
  - Image: `home@768-hero.jpg` (the spectrum's left edge).
- **Rule:** the brief: nothing cut off; one left edge.
- **Fix:** home.css: add `@container fp (min-width:761px) and (max-width:1279px){.sx-plot{margin-left:36px}}`.
- **Check (verified):** the labels start at the page's edge: 24 at 768, 36 at 900, 41 at 1024, 44 at 1100.

### PT-24 · low · Short screens: the folder tree (and Ask Sig's chat list) gives way below the decided 120px
- **Selectors:** styles.css:571 `.os-ctx{min-height:min(120px,15dvh)}` and ai/term.css:575 `.sg-chats{min-height:min(120px,15dvh)}`. On screens under 800px tall, 15dvh wins.
- **Evidence:**
  - The tree is 118.5px at 1440×790 and 108px at 1280×720 (two files showing).
  - Ask Sig's chat list is 119px and 108px.
  - Image: `panel-sheet-semaglutide@1280x720.jpg`.
- **Rule:** decision log November 11, call 10: "the folder tree gives way first, down to 120px, then the panel scrolls under its foot".
- **Fix:** both rules → `min-height:120px`.
- **Check (verified on the site):** the tree is 120px at 790, 720 and 768 tall; the panel scrolls 20 and 90px with Sign in, Join and the legal line pinned in view.

### PT-25 · low · The website's side panel is 300px wide at every width; the book says 272px
- **Selectors:** styles.css:545 `.os{--os-w:300px}`, with :549 `width:min(86vw,var(--os-w))`. Since the panel became a drawer at every width (November 12), desktops get the phone drawer's width.
- **Evidence:** 300px at 1024 and 1440. Ask Sig's docked panel is 272px (term.css:438 `--sg-w:272px`). tokens.json `side-panel`: "272px; on a phone a drawer of min(86vw, 300px)"; BRIEF.md: `.os-side` (272px).
- **Rule:** BRAND.md Principle 4: the same side panel on every page.
- **Fix:** styles.css, after :545: `@media (min-width:901px){.os{--os-w:272px}}`.
- **Check (verified):** 272px at 1024 and 1440; no row clipped or wrapped; it still fits whole at 1440×900.

### PT-26 · low · With a drawer open, Tab escapes to "Skip to content"
- **Where:** every website page and Ask Sig.
- **Selectors:** lib/os.js:11–16 `sync()` makes `.os-main` inert, but `a.skip` sits outside it (a sibling of `#os`). Ask Sig's sync (ai/ai.js:2288–2291) does the same.
- **Evidence:** at 390, after the drawer's last control, Tab lands on `BODY`, then `A.skip`; activating it jumps to `#main` behind the scrim.
- **Rule:** the page behind the drawer stays out of reach (decision log, the RESP-18 fix).
- **Fix:** lib/os.js `sync()`: add `document.querySelector('.skip')?.toggleAttribute('inert', shown);`. In ai/ai.js after :2291: the same with `narrow && sg.classList.contains('drawer')`.
- **Check (not verified live: JS):** with the drawer open, Tab cycles inside it.

### PT-27 · low · Compound names split at their hyphen
- **Where:**
  - Library card summaries (`.lc-sum`): "TB- / 500.", "IGF- / 1", "L- / tyrosine.", "Pal- / KTTKS." at 390 and 768; "(GHK- / Cu," at 1024 and 1440.
  - The semaglutide sheet's lede (`p.big`): "GLP- / 1" at 768, 1024 and 1440.
  - Status notes: "CJC- / 1295", "GHRP- / 2".
  - The weekly issue: "BPC- / 157" at 390.
  - The community's Explore: "TB- / 500)".
- **Evidence:** `live/*.json` "midword" (all breaks are at hyphens; none mid-letter).
- **Rule:** the brief: no labels breaking mid-word; BRAND.md: name compounds by their generic names.
- **Fix:** wrap the Library's hyphenated names and aliases in `<span class="nw">` where text is written (scripts/build_library.mjs, scripts/build_pages.mjs, and the community's renderers), and add `.nw{white-space:nowrap}` to styles.css and web/styles.css. A non-breaking hyphen won't do: Mona Sans has no U+2011 (checked), so it would fall back to another face.
- **Check:** no `.nw` span has two line boxes at any width.

### PT-28 · low · Community: the Signal card's sparkline stays 280px wide
- **Selectors:** web/ui/components/signal.js:88 `sparkline(hist.slice(-24), 280, 40, 'lime')` writes `width="280"`.
- **Evidence:** at 768 the sparkline sits at the card's left with 430px empty beside it (`#/s/bpc157`, `#/post/…`); at 1024 356px.
- **Rule:** the brief: figures scale.
- **Fix:**
  - web/styles.css: `.sigcard .spark{width:100%;height:40px}`;
  - web/ui/art.js:100: give the `<svg>` `preserveAspectRatio="none"` and its path `vector-effect="non-scaling-stroke"`, so the line keeps its weight.
- **Check (not verified live):** the sparkline spans the card at every width.

### PT-29 · low · The book: four of its frame measures are stale (the book is corrected, not the page)
- (a) BRIEF.md and decisions.md (November 11, call 10, amended) say "all ten 'more' links". There are nine since "The Signal" moved from "more" up to the places on November 12 (commit c878bf7, "The front page leads with the Community Signal"). Nothing was removed. → "all nine".
- (b) tokens.json `pad` says 40px above 900px, "the same for the page, its foot and the path line". The built margin is `--page-pad:clamp(16px,4vw,96px)`: 16px on a phone, 20px from 701 to 900px, then 4vw (41px at 1024, 58px at 1440); the website has no path line. → Say so.
- (c) BRAND.md, *The Sig system*: "The status bar … SIG and 'safety on' lead it on every page"; tokens `status-bar`, `path-line` and `title-bar` ("Sig's title bar on the site"). Since the plain frame these describe Ask Sig and the community only. On a phone Ask Sig's status bar gives way to its small print (November 13), and the community's ticker hides SIG and "safety on" at 860px and under. → Scope them to Ask Sig and the community.
- (d) The website's top bar (60px, 56px at 700px and under) has no token. → Add a `top-bar` token.

---

## Systemic

1. **One side padding on a phone: 16px.**
   - Where it differs today:
     - the website's top bar: 12 and 10px (PT-10);
     - How it works: 44px and 0 (PT-15);
     - Ask Sig's typing bar: 10px (PT-18);
     - the community: 12, 14, 16 and 20px, plus 8 and 10 in its top bar (PT-07).
   - Standardise on 16px for the first and last control of every bar, the page, cards' outer edges, the foot, the typing bar and sign-in, in both apps.
   - Tablets: 20px from 701 to 900px. The front page's own `.fp-wrap` uses 24px at 561–860px (home.css:515) and the community 12px; both should be 20px.
2. **One tablet band, 901–1279px, measured on the page's own container.**
   - The front page switches its two-column layouts at five different widths: How it works at 900, the three steps at 760, Sig's run at 1000, the example at 860 in home.css and 1100 in styles.css, and the spectrum's axis at 760.
   - Two of those produce the worst bugs here (PT-01, PT-02, PT-13, PT-14).
   - Standardise: anything two-up that needs room stacks, or turns into a row card, until the container is 1280px wide, as decision 6 says. The community's panel docks from 1280px, not 861 (PT-05).
3. **One touch floor: 40px for every control at 900px and under, and on `pointer:coarse` at any width, in the shared kit.**
   - Today: the website's `.btn.sm` is 40 on touch and the community's 38; menu buttons are 40 and 36; chips are 44 and the body map's 24; the community's votes 28, its actions 32, its crumbs 19, its toggles 16.
   - Put one `@media (pointer:coarse)` block in kit/kit.css (both copies) for buttons, chips, tabs, rows and toggles, instead of patching page by page.
4. **One label floor: 11px as rendered, HTML and SVG alike.**
   - Today: 4.6–8.1px in figures (PT-09), 9.8–10.6px in the front page's cards (PT-21), and 9.5 and 10.5px in the community (PT-06).
   - Figures size their labels from their rendered width, or move them out of the drawing as HTML (the Signal card's November 13 rule).
5. **One table rule:** names and prose wrap; only numbers and moves are `nowrap`; a table drops optional columns (`.opt`) before it scrolls (PT-03, PT-04).
6. **One drawer:**
   - scroll lock, an inert page, the skip link inert too, its own 40px close button, Escape, the scrim, and a link closing it;
   - 272px from 901px, `min(86vw,300px)` on a phone;
   - the website has most of it (PT-25, PT-26); the community lacks three parts (PT-19).

## The next update, in my area

1. **Move the community onto the website's plain frame.** The panel stays, closed, sliding in from the menu button at every width; a top bar replaces the window box. Touches all 16 community screens.
   - It removes the tablet squeeze at the root (PT-05).
   - It gives both apps one set of edges (PT-07) and one drawer (PT-19).
   - It lets the path line's 19px crumbs go, as they did on the website.
   - Keep every place and link.
2. **A shared touch-and-type floor in kit/kit.css** (both copies): 40px controls on touch and 11px labels. Then delete the per-page overrides that undercut it (home.css:559, the community's `.btn.sm` 38px, `.act` 32px). Touches every page of both apps, and makes PT-06, 08, 12, 20 and 22 one change instead of thirty.
3. **Figures that know their size.**
   - How it works' six drawings, the flow figure, the takeover chart and the radar get one helper: labels sized from the rendered width with an 11px floor, falling back to HTML tags under the drawing below 540px.
   - Lives in lib/ and both signalviz.js copies. Touches the front page, the Library, every fact sheet and the community's Signal and space screens.
4. **Container queries for every page layout.** The front page already has `fp` and `.hs` containers, and Ask Sig has the pane. Move the remaining viewport `@media` layout rules (styles.css:322–329, the example; the story; the Library's explainer) onto the page's container with the one 1280px band, so a layout is written once and fits the panel open, closed or as a drawer.
5. **Make these checks part of the capture.**
   - `.design/work/design-responsive/sweep.js` finds overflow culprits, cut text (`scrollWidth` past a hiding ancestor, with or without an ellipsis), words split across lines, one-word columns, headline line counts, targets under 40px, and HTML and SVG text under 11px.
   - Run it at 360, 390, 430, 768, 820, 960, 1024, 1180, 1280 and 1440, with touch at 820 and under, and fail on new findings like `design_check.mjs` does.
   - This review's two worst bugs (PT-01, PT-02) live only between the four captured widths, or at 1024 alone.

---

**Capture note for the art director:** `comm-signin@390` and `@768` show "boot: … Timeout" in `/tmp/sx/capture-comm.log`. The screen loaded fine (`comm-signin@390.jpg`, `comm-signin@768.jpg` here). The boot check looks for "Sign in", but the heading renders "SIGN IN." in capitals, so the check waited out its 120 seconds and then captured the loaded screen anyway.

**Seen outside my area, reported so it isn't lost:**
- **Community home at 390:** three filled actions in one view (Create in electric blue, "+ Post" in white, Share in blue in the tab bar). BRAND.md: one main action per view.
- **The community's side panel:** four places, no Signal place; the website's has five, Signal first.
- **The flow figure:** reads "in 0 signals" for every forum source and "0 first-hand reports" against 51 live Signals. Data, not layout, but it shows on the Library's first screen.
