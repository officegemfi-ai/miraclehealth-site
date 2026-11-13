# Layout, grid and symmetry: audit (design-layout), 2026-11-13

**State:** The plain frame, Ask Sig's window and most grids hold. Four things do not:
- The front page's How it works breaks between 901 and 1200px, so the page scrolls 26px sideways at 1024.
- The website's side panel is 300px, not 272px.
- The top bar and four page templates leave the page edge.
- The community's Signal board is cut off at every width.

**How it was measured**
- **Sources:** the capture in `.design/data` for every page at 1440, 1024, 768 and 390, plus live Playwright with Chrome at device pixel ratio 1. Seams and icons were measured at 4x. Every website page was answered from `/tmp/sx/signal-live.json`.
- **Community:** the preview at :8767, with the welcome dialog closed. The community captures used are the redone, loaded set; nothing here comes from the loading state.
- **Gaps:** vertical gaps are ink to ink (first and last visible text or frame of each block), measured after scrolling through the page so the drawings are in.
- **Fixes:** fixes marked "verified" were injected into the live page and re-measured.
- **Evidence:** all images are in `.design/evidence/design-layout/`. A red guide is the stray edge and a blue guide is the page's edge.
- **The window brief versus the plain frame.** The decision of November 12 removed the window from the website. My brief's window checks (16px gap, 44px title bar, 34px path line, 28px status bar, 272px panel, 12px corners) therefore apply to Ask Sig and the community. On the website I checked the plain frame instead: a 60px top bar, a 272px panel, and one margin that grows from 16 to 96px. The full table is under *Systemic*.

---

## Findings (most visible first)

### LAYOUT-01: high. The front page's How it works breaks from 901 to 1200px wide, and it ignores the page margin at every width
- **Where:** `/`.
  - At 1024 the document scrolls sideways (scrollWidth 1050; the capture log shows the same).
  - The cards are too narrow for their content at every width from 901 to about 1200.
  - At 1280 the cards sit outside the page margin.
  - At 768 and 390 the stacked steps run to the screen's right edge.
- **Selectors** (`home.css`):
  - l.613 `.hs-card{width:min(560px,calc(50% - 96px))}`
  - l.621 `.hs-title{white-space:nowrap;overflow:hidden;text-overflow:clip}`
  - l.627 `.hs-sub{margin-left:auto…}`
  - l.642 `@container (max-width:900px){`
  - l.644 `.hs-intro{padding:72px 20px 60px 44px}`
  - l.646 `.hs-step{padding:28px 0 28px 44px}`
  - l.654 `.hs-finale{padding:40px 0 0 44px}`
- **Evidence:**
  - **The overflow at 1024:** the cards are 416px wide (576 to 992). Card 1's foot line `span.hs-sub` "community.miraclehealth.us" (171px, unbreakable) ends at x=1050, which is 58px past its card and 26px past the screen.
  - **The cramped cards at 1024:** card 1's title is clipped at "Reports, in people's own wo". The feet of cards 4 to 6 wrap, "The Community Signal" onto three lines (72px tall in a 96px foot).
  - **Outside the page margin:** card edges sit 32px from the screen at 1024 and 1280, against page margins of 41 and 51.2.
  - **No right margin when stacked:** at 768 and 390 the captions and cards span x=44 to the screen's edge (right inset 0), while every other section keeps 24 or 16px.
  - **Images:** `home-howitworks-card-overflow@1024.png`, `home-howitworks-stacked-no-right-margin@390.png`.
- **Rule broken:** BRAND, *The frame* (the page has a margin that grows from 16px to 96px); the brief's "breaks layout"; symmetric padding.
- **Fix** (`home.css`):
  - l.613 `.hs-card` `width:min(560px,calc(50% - 96px))` → `width:min(560px,calc(50% - 64px - var(--page-pad)))`. The outer edges then land on the page margin; 1440 is unchanged at 96.
  - l.642 `@container (max-width:900px)` → `@container (max-width:1200px)`. Below 1200 a card would be under 476px, too narrow for its title and foot.
  - Inside that block:
    - l.644 `.hs-intro` padding-right `20px` → `var(--page-pad)`.
    - l.646 `.hs-step` padding `28px 0 28px 44px` → `28px var(--page-pad) 28px 44px`.
    - l.654 `.hs-finale` padding-right `0` → `var(--page-pad)`.
  - l.627 `.hs-sub`: add `min-width:0;overflow-wrap:anywhere`.
- **Check (verified):**
  - scrollWidth is 1024 at 1024.
  - At 1280 the card edges are 51/51 (page margin 51.2). At 1440 they are unchanged (96/96).
  - At 1200 and 1024 the steps are one column with a 48 and 41px right inset. At 768 the inset is 31 (20 after LAYOUT-04), and at 390 it is 16.

### LAYOUT-02: high. The website's side panel is 300px at every width; Ask Sig, the community and the token use 272px
- **Where:** every website page, whenever the menu opens, at 1440, 1024, 768 and 390.
- **Selectors:** `styles.css` l.545 `.os{--os-w:300px}`, which l.549 reads in `.os-side{width:min(86vw,var(--os-w))}`.
- **Evidence:**
  - `.os-side` measures 300px at all four widths: rows are 277px wide and the fold button sits at x=257.
  - Ask Sig's panel (`ai/term.css` l.438 `.sg{--sg-w:272px}`) and the community's (`--side-w:272px`) measure 272. They share the same rows: a 44px head, places 36px tall at y=116, and "more" rows 28px tall.
  - Image: `side-panel-site300-vs-asksig272@1440.png` (left the site, right Ask Sig).
- **Rule broken:** token `side-panel` 272px ("on a phone a drawer of min(86vw, 300px)"); BRIEF "`.os-side` (272px)"; principle 4, the same side panel.
- **Fix:**
  - `styles.css` l.545 `--os-w:300px` → `--os-w:272px`.
  - Inside `@media (max-width:900px)` (l.624), add `.os{--os-w:300px}`. This is the same switch Ask Sig's panel makes at 900px.
- **Check:** `.os-side` is 272px at 1440 and 1024 and 300px at 768 and 390, with rows 249px wide as on `/sig/`.

### LAYOUT-03: high. The community's Signal board is wider than its column at every width, and "last move" is always cut
- **Where:** community `#/signal` at 1440, 1024, 768 and 390.
- **Selectors** (`web/styles.css`):
  - l.972 `.top-wrap{overflow-x:auto}`
  - l.974 `.top-table th,.top-table td{padding:9px 12px;white-space:nowrap}`
  - l.997 `@media (max-width:1600px)`
  - l.1001 `@media (max-width:760px){.top-table .opt{display:none}}`
- **Evidence:**
  - The table is 797px wide in a 738px wrapper at 1440, so 61px is hidden.
  - At 1024 the wrapper is 670px and 129px is hidden ("volume" and "last move").
  - At 768 the wrapper is 744px and 55px is hidden.
  - At 390 the parts are already hidden, but the table is still 453px in a 366px wrapper, so 89px is hidden.
  - "Last move" is cut mid-glyph at every width. The parts give way only at a 760px *viewport*, but the table sits in a column of 780px or less beside a 272px panel.
  - Images: `comm-signal-table-cut@1440.png`, `comm-signal-table-alignment@1440.png`.
- **Rule broken:** breaks layout; also the page's own rule in `web/ui/pages/signal.js`: "on a narrower screen the table keeps the rank, the compound, the Signal and its last move; the parts of the score go first".
- **Fix** (`web/styles.css`, after l.1004):
  ```css
  .top-wrap{container-type:inline-size}
  @container (max-width:800px){.top-table th,.top-table td{padding:9px 6px}}
  @container (max-width:730px){.top-table .opt{display:none}}
  @container (max-width:480px){.top-table tbody th{white-space:normal;min-width:7em}}
  ```
- **Check (verified live):** 0px is hidden at all four widths.
  - 1440 and 768 keep all eight columns (736px in 738, 742 in 744).
  - 1024 keeps rank, compound, signal and last move (668 in 670).
  - 390 fits (364 in 366).

### LAYOUT-04: medium. The top bar and the front page leave the page's edge; the margin is defined in seven places
- **Where:** the top bar of every website page at all widths; `/` at 768.
- **Selectors:**
  - `styles.css`:
    - l.608 `.os-top{padding:0 24px}`
    - l.634 (700px and under) `.os-top{padding:0 10px 0 8px}`
    - l.588 `.os-menu{margin:0 0 0 -8px}`, with l.626 (900px and under) `width:40px`
    - l.47 `--page-pad:clamp(16px,4vw,96px)`
    - l.352 (900px and under) `.wrap{padding-left:20px;padding-right:20px}`
    - l.638 (700px and under) `.wrap{padding-left:16px;padding-right:16px}`
  - `home.css`:
    - l.515 `@container fp (max-width:860px){.fp-wrap{padding:0 24px}}`
    - l.546 `.fp-wrap{padding:0 16px}`
- **Evidence:**
  - **The page edge:** 57.6, 41, 20 and 16px at 1440, 1024, 768 and 390.
  - **The top bar:**
    - The menu icon sits at 24, 24, 28 and 12px. Join's right inset is 24, 24, 24 and 10px.
    - So the top bar is 33.6px off the page edge at 1440 and 52.8px off at 1920.
    - It is also lopsided at 768 (28 against 24) and at 390 (12 against 10).
  - **The front page at 768:** its sections sit at 24px while its own foot and every other page sit at 20, a 4px step at the foot on both sides.
  - **A shorthand reset:** the same `.fp-wrap{padding:0 24px}` shorthand wipes the 48/64px vertical padding of `nav.fp-wrap.fp-ways` ("Three ways in") at container widths of 860 and under.
  - **Images:** `topbar-24-vs-page-57.6@1440.png` (red: the top bar's items; blue: the page edge) and `home-edge24-vs-foot20@768.png`.
- **Rule broken:** BRAND, *The frame* (one margin from 16 to 96px); one left edge; symmetric padding.
- **Fix:** make `--page-pad` the only source.
  - `styles.css` l.352 → `:root{--page-pad:20px}`, and add `.os-menu{margin-left:-12px}` in the same 900px block.
  - `styles.css` l.638 → `:root{--page-pad:16px}`.
  - `styles.css` l.608 `.os-top` `padding:0 24px` → `padding:0 var(--page-pad)`.
  - `styles.css` l.634 `.os-top{gap:6px;padding:0 10px 0 8px}` → `.os-top{gap:6px}`.
  - `.wrap` keeps `padding:0 var(--page-pad)`.
  - `home.css`: delete l.515 and l.546, since `.fp-wrap` already reads `var(--page-pad)`.
- **Check (verified on `/` and `/about/`):** the menu icon, the h1, the foot and Join's right inset all sit on 57.6, 41, 20 and 16px at the four widths. "Three ways in" gets its 48/64px back.

### LAYOUT-05: medium. Front page rhythm: the space above and below How it works breaks the section beat
- **Where:** `/` at 1440, 1024, 768 and 390.
- **Selectors** (`home.css`):
  - l.599 `.hs{margin:40px 0 0;padding:0 0 40px}`
  - l.602 `.hs-intro{padding:120px 24px 140px}`
  - l.635 `.hs-finale{height:1600px}`
  - l.644 and l.654 (narrow layout)
  - l.208 `.fp-sec{padding:88px 0;border-top:1px solid var(--line)}`
- **Evidence:**
  - **Between the other sections (ink to ink):** 177 to 180px at 1440 and 1024 (88px, a hairline, 88px); 131 to 134px at 768 and 390.
  - **Above How it works:** 233px at 1440 and 1024, 121 at 768 and 390.
  - **Below it:** 291 at 1440, 314 at 1024, 83 at 768 and 390.
  - It is also the only section without the hairline. Its 1600px finale ends 160px under its last button.
- **Rule broken:** the brief's item 5, one vertical scale.
- **Fix** (`home.css`, together with LAYOUT-01's 1200px block):
  - l.599 `.hs` → `margin:0;padding:0;border-top:1px solid var(--line)`.
  - l.602 `.hs-intro` padding-top `120px` → `104px`.
  - l.635 `.hs-finale` height `1600px` → `1528px` (88px under its buttons).
  - In the 1200px block: `.hs-intro` padding-top `104px` and `.hs-finale` padding-bottom `112px`.
  - Add `@container (max-width:860px){.hs-intro{padding-top:56px}.hs-finale{padding-bottom:88px}}`.
- **Check (verified with LAYOUT-01 and LAYOUT-04):**
  - 1440 and 1024: 178 above, 179 below.
  - 768 and 390: 130 above, 131 below.
  - Every section boundary on the page is then 177 to 180px (1440, 1024) or 130 to 134px (768, 390). "Three ways in" stays a sub-block at 136 and 112.

### LAYOUT-06: medium. The story caps its sections at 1320px, so they start 60px inside the page edge (300px at 1920)
- **Where:** `/story/` at 1440 and every viewport over 1435px.
- **Selectors:** `styles.css` l.704 `.sy{--sy-w:1320px}`, l.705 `.sy .wrap{max-width:var(--sy-w)}`.
- **Evidence:**
  - At 1440, the hero's ring column, every kicker, h2, the twelve's grid, the prints and the windows start at x=117.6 and end at 1322.4.
  - The story's own foot and every other page use 57.6 to 1382.4.
  - At 1920: 376.8 against 76.8.
  - Images: `story-edge-118-vs-foot-58@1440.jpg`, `story-foot-edge@1440.jpg`.
- **Rule broken:** BRAND, *The frame* (the page runs the window's whole width; "text keeps its own line lengths inside it"); decision of November 12 (pages no longer stop "at 1200 to 1320px").
- **Fix:** `styles.css` l.704 `.sy{--sy-w:1320px}` → `.sy{--sy-w:var(--page-max)}`. Text keeps its measure through `.sy-lede` (50ch), `.sy-legend` and `.sy-promises` (980px).
- **Check:** at 1440 every `.sy-sec .wrap` child and `.sy-hero-in` start at 57.6, as `.foot-news` does.

### LAYOUT-07: medium. My Miracle and the plan sit in a centred 820px column, and My Miracle's h1 doesn't share its card's edge
- **Where:** `/my/` and `/plan/` at 1440 and 1024 (every width over 900).
- **Selectors:**
  - `my/my.css` l.6 `.my-wrap{max-width:820px;margin:0 auto;padding:calc(var(--top-h) + 72px) 40px 110px}`, plus l.79 and l.84.
  - `my/my.css` l.7 `.my-intro{display:flex;align-items:center;gap:18px}`.
  - `ai/plan.css` l.150 `.plan-wrap{…same…}`, plus l.162 and l.163.
- **Evidence:**
  - At 1440 the column runs from 350 to 1090; the foot under it starts at 57.6.
  - At 1024 it runs from 142 to 882, against 41. At 1920 it runs from 550 to 1370, against 76.8.
  - My Miracle's h1 sits at 416, 66px right of its own card (350), because the 48px glyph and an 18px gap sit beside it.
  - Every other page's head starts on the page edge.
  - Image: `my-centred-column-vs-foot@1440.jpg`.
- **Rule broken:** one left edge; decisions of November 11, call 5 (pages join the site's left edge).
- **Fix:**
  - `my/my.css` l.6 → `.my-wrap{width:100%;max-width:var(--page-max);margin:0 auto;padding:calc(var(--top-h) + 72px) var(--page-pad) 110px}`, plus `.my-wrap>*{max-width:740px}`.
  - Delete l.79. Change l.84 to `.my-wrap{padding-top:calc(var(--top-h) + 40px);padding-bottom:72px}`.
  - Make the same three changes to `.plan-wrap` in `ai/plan.css` (l.150, l.162, l.163).
  - l.7 `.my-intro` → `flex-direction:column;align-items:flex-start;gap:12px`. The glyph then sits over the h1, as Ask Sig's greeting does on a phone.
- **Check:** at 1440 the h1, the intro and `.my-sec` start at 57.6 on `/my/`, and `.plan-intro h1` does too on `/plan/`, matching `.foot-news`.

### LAYOUT-08: medium. The community's feed floats in its column: two left edges at 1280 and 1920
- **Where:** every community screen from 1101 to 1300px (one column) and from about 1483px up (two columns). Measured at 1280 and 1920.
- **Selectors** (`web/styles.css`):
  - l.148 `.layout{grid-template-columns:minmax(0,1fr) var(--rail-w)}`
  - l.168 `main{max-width:780px;justify-self:center}`
  - l.760 `.rail{max-width:780px;justify-self:center}` (1300px and under)
- **Evidence:**
  - The path line's "~ / home" starts at x=313 on every screen.
  - The feed starts at 386 at 1280 (73px in) and at 532 at 1920 (219px in).
  - At 1920 the gutter between the feed and the rail grows from 28 to 247px.
  - Image: `comm-home@1920.png`.
- **Rule broken:** one left edge; token `gutter` 28px ("between the feed and the rail in the community").
- **Fix:**
  - l.148 → `grid-template-columns:minmax(0,780px) var(--rail-w);justify-content:start`.
  - l.168 `justify-self:center` → `start`.
  - l.760 `justify-self:center` → `start`.
- **Check (verified live):**
  - The feed and the path share x=313 at 1920, 1440, 1280 and 1024.
  - The rail follows 28px after the feed (1121 at 1920).
  - 1440, 1024 and 390 are unchanged.

### LAYOUT-09: medium. The Library's "What moved this week" box is capped at 1240px: 100px insets at 1440 and 340px at 1920
- **Where:** `/library/` at 1440 and every viewport over 1320px.
- **Selectors:** `library/library.css` l.310 `.wrap.lib-moves{width:calc(100% - 80px);max-width:1240px}`, plus l.398 and l.399.
- **Evidence:**
  - At 1440 the box spans 100 to 1340, while the search field, chips, cards and foot span 57.6 to 1382.4.
  - At 1920 it spans 340 to 1580, against 76.8 to 1843.2. At 1024 it is 1px off (40 against 41).
  - Image: `library-moves-100-vs-page-58@1440.jpg`.
- **Rule broken:** one left edge; symmetric insets.
- **Fix:** l.310 → `.wrap.lib-moves{width:auto;max-width:none;margin:40px var(--page-pad) 0}`; delete l.398 and l.399.
- **Check:** the `.lib-moves` box's left and right insets equal `.lib-search`'s at every width (57.6, 41, 20, 16).

### LAYOUT-10: medium. The community's open tab doesn't sit on the window: the title bar's hairline runs under it
- **Where:** every community screen at 1440 (the tabs hide at 1060px and under).
- **Selectors:** `web/styles.css` l.93 `.win-tabs{…align-self:stretch;overflow:hidden}`, l.94 `.win-tab{…height:34px;margin-bottom:-1px}`.
- **Evidence:**
  - At 4x, the title bar's bottom hairline row (y 98.25 to 99.25) reads (46,46,49) under the open "home.feed" tab as well as beside it.
  - On Ask Sig, the same row under its open tab reads (0,0,0), the window's ground. The nav's `overflow:hidden` clips the tab's -1px margin.
  - Images: `comm-tab-hairline-under-open-tab@1440x4.png`, compared with `asksig-tab-seam-ok@1440x4.png`.
- **Rule broken:** token `tab` ("sitting on the window like a file's tab in an editor"); the brief's item 8.
- **Fix:** l.93 `.win-tabs` add `margin-bottom:-1px`; l.94 `.win-tab` `margin-bottom:-1px` → `0`. This is Ask Sig's own pattern, `ai/term.css` l.90 and l.94.
- **Check:** at 1440 the pixels at y=98.75 under the open tab equal the window's ground (#000).

### LAYOUT-11: medium. Ask Sig's status bar keeps an 11px round corner on its SIG block in a square window
- **Where:** `/sig/` and `/ai/` at 1440, 1024 and 768. On phones the status bar gives way.
- **Selector:** `ai/term.css` l.122 `.tm-sb-sig{border-bottom-left-radius:11px}`.
- **Evidence:**
  - The window, title bar and status bar compute a 0px radius, as the November 13 decision set.
  - The white SIG block still rounds its bottom-left corner by 11px, leaving a black wedge inside the frame's square corner.
  - Image: `asksig-status-sig-corner@1440x4.png`.
- **Rule broken:** decision of November 13 ("on Ask Sig the window" has square corners); BRAND, *Shape and depth*, "Square, in How it works' language".
- **Fix:** l.122 `border-bottom-left-radius:11px` → `0`. Then l.406's phone override is redundant.
- **Check:** at 1440 the SIG block's corner pixel (289, 882) is white.

### LAYOUT-12: low. The 404 is centred 31px high, and 62px of the foot shows on the first screen
- **Where:** `/404.html` at 1440, 1024 and 768, and on phones.
- **Selectors:** `styles.css` l.271 `.nf-main.win-body{min-height:calc(100svh - 2 * var(--os-g,0px) - var(--os-tb,0px) - 62px)}`; l.641 (700px and under) `calc(100svh - var(--os-tb) - 62px)`.
- **Evidence:**
  - The extra 62px is the old path line plus the status bar, which the plain frame removed.
  - At 1440×900, main ends at y=838, where the foot starts.
  - The block's centre is at y=449; the centre of the screen under the top bar is at 480.
  - Image: `404-centre@1440.png`. The upper yellow line is the block's centre, the lower is the screen's.
- **Rule broken:** the brief's item 4, centring.
- **Fix:** remove ` - 62px` from l.271 and from l.641.
- **Check:** at 1440×900, main runs from 60 to 900 and the block's centre is at y=480.

### LAYOUT-13: low. The Library's head starts 28px under the top bar at 900px and under; every other head starts at 72px (44px on a phone)
- **Where:** `/library/` at 768 and 390.
- **Selector:** `library/library.css` l.255 (900px and under) `.lib-hero-in{…padding-top:calc(var(--top-h) + 28px);padding-bottom:48px}`.
- **Evidence:**
  - The top bar to the kicker measures 28px at 768 and 390 on the Library.
  - It measures 72 and 44 on the doc and page heads (`.doc-head .wrap`, `styles.css` l.246, and l.384 at 600px and under).
  - The head's bottom padding is 48, where the doc heads use 64 and 44.
  - Image: `library-head-28-vs-doc-head-72@768.png`.
- **Rule broken:** one vertical scale (see *Systemic*).
- **Fix:**
  - l.255: `padding-top` → `calc(var(--top-h) + 72px)` and `padding-bottom` → `64px`.
  - Add `@media (max-width:600px){.lib-hero-in{padding-top:calc(var(--top-h) + 44px);padding-bottom:44px}}`.
- **Check:** the kicker sits 72px under the top bar at 768 and 44px at 390, as on `/about/`.

### LAYOUT-14: low. On phones the page bodies use two rhythms, and My Miracle and the plan add 24px before the foot
- **Where:** at 390:
  - status, goals, goal-weight, compare, compare pairs, weekly and founders (`.pg-wrap`);
  - fact sheets (`.le-body`);
  - `/my/` and `/plan/` at every width.
- **Selectors:**
  - `pages/pages.css` l.6 `.pg-wrap{padding-top:64px;padding-bottom:110px}`, which has no phone rule.
  - `library/library.css` l.174 `.le-body{…padding-bottom:110px}`.
  - `styles.css` l.385 `.doc{padding-top:40px;padding-bottom:72px}` (600px and under).
  - `my/my.css` l.5 `.my-page .foot{margin-top:24px}`.
- **Evidence:**
  - At 390, the head rule to the first body line is 40 on doc pages but 64 on `.pg-wrap` pages.
  - The last line to the foot is 72 on doc pages but 110 on `.pg-wrap` pages and fact sheets.
  - My Miracle and the plan end 134px above the foot at 1440 (110 + 24), against 110 everywhere else.
- **Rule broken:** one vertical scale.
- **Fix:**
  - `pages/pages.css`: add `@media (max-width:600px){.pg-wrap{padding-top:40px;padding-bottom:72px}}`.
  - `library/library.css`: add `@media (max-width:600px){.le-body{padding-bottom:72px}}`.
  - `my/my.css` l.5 `margin-top:24px` → `0`.
- **Check:** at 390, 40 and 72px on every doc, page and sheet; 110px at 1440 on `/my/` and `/plan/`.

### LAYOUT-15: low. The gap between a page's intro and its first block takes seven values (24 to 36px) on one template
- **Where:** status, goals, goal-weight, compare, compare pairs, weekly and founders, at all widths.
- **Selectors** (`pages/pages.css`):
  - l.9 `.pg-acts{margin-top:26px}`
  - l.29 `.pg-goal-grid{margin-top:30px}`
  - l.36 `.pg-terms{margin-top:26px}`
  - l.62 `.cmp{margin-top:36px}`
  - l.92 `.wk-top .pg-intro{margin-bottom:24px}`
  - l.114 `.fd-grid{margin-top:34px}`
- **Evidence:** from `.pg-intro` to the next block at 1440:

  | Page | Gap |
  | --- | --- |
  | status | 26 |
  | goals | 30 |
  | goal-weight | 26 |
  | compare | 31 |
  | compare pair | 36 |
  | weekly | 24 |
  | founders | 34 |

- **Rule broken:** one vertical scale.
- **Fix:** at the end of `pages/pages.css`, add `.pg-intro+*{margin-top:32px}`; l.92 `margin-bottom:24px` → `0`.
- **Check:** 32px from every `.pg-intro` to the block after it on all seven pages.

### LAYOUT-16: low. Full-width sections use two paddings: 88px on the front page, 96px on the story and the Library's explainer
- **Where:** `/` (eight sections), `/story/` (`.sy-sec`) and `/library/` (`.band.lib-explain`), at 901px and up.
- **Selectors:** `home.css` l.208 `.fp-sec{padding:88px 0}`; `styles.css` l.155 `.band{padding:96px 0}`; `styles.css` l.712 `.sy-sec{padding:96px 0}`.
- **Evidence (ink to ink at 1440):**
  - Section to section measures 177 to 180px on the front page and 193 to 196px on the story.
  - The Library has 208px from its last card row to "Two kinds of evidence" (`.lib-grid` padding-bottom 110 plus the band's 96).
  - All three use 64px at narrow widths.
- **Rule broken:** one vertical scale.
- **Fix:** `styles.css` l.155 `96px` → `88px` and l.712 `96px` → `88px`; `library/library.css` l.72 `.lib-grid` `padding-bottom:110px` → `88px`. This keeps the front page, its newer design and LAYOUT-05's verified numbers.
- **Check:** section to section is 177 to 180px on `/` and `/story/`, and about 176px from the Library's last card row to its explainer, at 1440.

### LAYOUT-17: low. The community's phone margins are 12px for the body and 14px for the path line; the site and the token use 16px
- **Where:** every community screen at 768 and 390.
- **Selectors:** `web/styles.css` l.787 `.layout{…padding:0 12px 96px…}`, l.786 `.win-path{padding:6px 14px}`.
- **Evidence:**
  - At 390 the feed and rail sit at x=12 to 378 and the path text at 14. The website's pages sit at 16 to 374.
  - Image: `comm-phone-margin-12-vs-16@390.png` (red 12, blue 16).
- **Rule broken:** token `pad` ("on a phone, 16px everywhere").
- **Fix:** l.787 `padding:0 12px 96px` → `padding:0 16px 96px`; l.786 `padding:6px 14px` → `6px 16px`.
- **Check:** the path, feed and rail start at x=16 at 390.

### LAYOUT-18: low. On the community's Signal board the score column's header and values don't share an edge, and "last move" is left-aligned
- **Where:** community `#/signal` at all widths.
- **Selectors:** `web/styles.css` l.985 `.top-table .sigc-in{display:flex;align-items:center;gap:10px}`; `web/ui/pages/signal.js` l.106 `NUMERIC` (lacks `'move'`) and l.131 `h('td', { class: 'mvc' }…)`.
- **Evidence:**
  - The "signal" header is right-aligned (`th.n`) over left-aligned scores (bar, then number).
  - "last move" (▲ 0.3, ▼ 0.6, –) is left-aligned in both header and cells.
  - The website's board right-aligns its move column (`home.css` l.259 `.fp-top .num{text-align:right}`).
  - Image: `comm-signal-table-alignment@1440.png`.
- **Rule broken:** the brief's item 7 (numbers right-aligned in tables); token `data` (tables and numbers, tabular figures).
- **Fix:**
  - l.985: add `justify-content:flex-end`.
  - `signal.js` l.106: add `'move'` to `NUMERIC`.
  - `signal.js` l.131: `class: 'mvc'` → `class: 'n mvc'`.
- **Check:** the right edges of each numeric column's header and values are equal.

### LAYOUT-19: low. The community's status-bar ring sits 1.25px below the "SIG" capitals; Ask Sig fixed the same pair
- **Where:** every community screen at 1024 and up (the ticker's SIG block).
- **Selector:** `web/styles.css` l.64 `.tick-sig svg{display:block;width:12px;height:12px}`.
- **Evidence:**
  - At 4x the ring's ink centre is 1.25px below the capitals' centre.
  - Ask Sig's block is +0.25px, using `ai/term.css` l.123 `.tm-sb-sig [data-sig]{…translate:0 -1px}`.
  - Image: `comm-ticker-ring-low-vs-asksig@1440x4.png` (left the community, right Ask Sig).
- **Rule broken:** the brief's item 7 (icons centred with their labels, within 1px).
- **Fix:** l.64: add `translate:0 -1px`.
- **Check:** the ring's ink centre is within 0.5px of the SIG capitals' centre at 4x.

### LAYOUT-20: low. The community's card grids use a 10px gutter; the site and the community's own rail use 14px
- **Where:** community Explore spaces (`.space-grid`) and profile badges (`.badges`), at all widths.
- **Selectors:** `web/styles.css` l.405 `.space-grid{…gap:10px}`, l.471 `.badges{…gap:10px}`.
- **Evidence:**
  - The gutters are 10 or 11px both ways.
  - The site's Library, goals, status and story grids, and the community's own rail, all measure 14.
  - Every grid does have equal gutters both ways, equal card heights per row and aligned last rows.
- **Rule broken:** token `stack` 14px ("between cards").
- **Fix:** l.405 and l.471 `gap:10px` → `14px`.
- **Check:** 14px gutters both ways on Explore spaces and the badges.

### LAYOUT-21: low (the book). `tokens.json` and BRAND.md still describe the old window frame's geometry
These are corrections to the book, not to the pages: what was built on purpose is right.
- **`tokens.json`, `radius-card`:** says it is for "Sig's window and its bars' corners". Ask Sig's window is square (November 13), so it should read: "…the community's window and its bars' corners; Ask Sig's window is square".
- **`tokens.json`, `path-line`:** should say the path line exists only in the community (34px least). The website has none, Ask Sig has none on a wide screen, and on a phone Ask Sig's tab strip is 44px.
- **`tokens.json`, `pad`:** still says the site's padding is 40px (20px from 701 to 900, 16px on a phone) and mentions a path line. It should say: "the website's page margin is `--page-pad`: clamp(16px, 4vw, 96px) from 901px, 20px from 701 to 900, 16px on a phone, shared by the top bar, the page and the foot".
- **`tokens.json`, `window-gap`:** should be limited to Ask Sig and the community.
- **`tokens.json`, `tab`:** add that the tab is 40px on Ask Sig's phone tab strip.
- **`tokens.json`, a new `top-bar` token:** 60px, 56px at 700px and under (`styles.css` l.541 and l.633).
- **BRAND.md, principle 4 (l.16):** "One window, everywhere. The same side panel, title bar, path and status bar on every page and every surface" contradicts the plain frame. It should read: "The same top bar and side panel on every website page; Sig's window on Ask Sig and in the community; the side panel is never removed: it folds away or slides in".
- **BRAND.md, l.5:** "every page opens as a window in Sig's terminal" needs the same correction.
- **BRAND.md, *The frame*, l.92:** "Top bar (60px, sticky)" should add "56px on a phone".

---

## Systemic

### 1. One page margin, defined once
The page's side margin is set in seven places:
- `--page-pad`;
- two `.wrap` overrides;
- `.fp-wrap`'s 24 and 16px;
- `.my-wrap` and `.plan-wrap` (40, 20 and 16px, with an 820px cap);
- `.wrap.lib-moves` (1240px cap);
- `.sy .wrap` (1320px cap);
- `.os-top` (24px, or 8 and 10px).

Every finding from 04 to 09 is one of them drifting.

**Standardise on `--page-pad`:** clamp(16px, 4vw, 96px) from 901px, 20px from 701 to 900, 16px at 700 and under. Set it by media query on `:root`; every container (`.wrap`, `.fp-wrap`, `.os-top`, `.my-wrap`, `.plan-wrap`, `.lib-moves`, `.hs`) reads it, and nothing caps a container's width. Text keeps its measure with `max-width` on the text (50ch, 52ch, 740px).

### 2. One side panel, 272px
**Standardise on 272px** docked or as a drawer from 901px, and min(86vw, 300px) at 900px and under, on the website, Ask Sig and the community. Today it is 300, 272 and 272 (LAYOUT-02).

### 3. One vertical scale
Measured, ink to ink, at 1440 (phone values in brackets):

| Gap | Doc pages (privacy, terms, about, method, weekly/1) | Page template (status, goals, goal-weight, compare, pair, weekly, founders) | Library | Fact sheets | Story | Front page | My / plan | Standard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Top bar → first line of the head | 72 (44) | 72 (44) | 72, **28** at 900 and under | 72 | hero | hero 64 (36) | 72 (40) | **72 (44)** |
| Last head line → head rule | 64 (44) | 64 (44) | 64, **48** at 900 and under | 64 | 64 | — | — | **64 (44)** |
| Head rule → first body line | 64 (40) | 64 (**64**) | — | 64 | — | — | — | **64 (40)** |
| Between sections inside a page | 56 | 56 | — | 56 (28 + 28) | — | — | — | **56** |
| Intro → first block | — | **24 to 36** | — | — | — | — | — | **32** |
| Between full-width sections | — | — | **96** (grid to explainer **208**) | — | **96** (193 to 196 ink) | 88 (177 to 180 ink), How it works **233 / 291** | — | **88 (64)** |
| Last line → foot | 110 (72) | 110 (**110**) | 110 (72) | 110 (**110**) | — | — | **134** (97) | **110 (72)** |

The scale is 32, 56, 64, 72, 88 and 110 on desktop, with 40, 44, 64 and 72 on phones. Bold values are the outliers fixed in LAYOUT-05, 13, 14, 15 and 16.

### 4. Window geometry by surface (live)

| Surface | Width | Gap | Top or title bar | Tab | Path line | Status bar | Side panel | Corners |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Website (21 pages) | 1440, 1024, 768 | none (plain frame) | 60px; menu, logo, search, Ask Sig and Join all centred at y=29.5 (±0) | — | — | — | **300** drawer, closed (02) | — |
| Website | 390 | none | 56px | — | — | — | **300** drawer | — |
| Ask Sig (`/sig/` = `/ai/`) | 1440, 1024 | 16 all round; the page never scrolls (scrollHeight 900) | 44px; ring, name and agents centred at y=38 (±0.6) | 32px (28 to 60), joins the window | none (November 13) | 28px | 272 docked | 0; SIG block **11px** (11) |
| Ask Sig | 768 | 16 | 44px | 32px | none | 28px | 300 drawer | 0 |
| Ask Sig | 390 | 0 | 52px | 40px in a 44px strip | — | given way (November 13) | 300 drawer | 0 |
| Community | 1440 | 16 (under a 31px preview banner) | 52px; items centred at y=73 | 34px; **hairline under it** (10) | 34px | 28px ticker | 272 docked | 12 |
| Community | 1024 | 16 | 52px | hidden at 1060 and under | 34px | 28px | 272 docked | 12 |
| Community | 768, 390 | 0 | 52px, ticker 28px on top | — | 34px | at the top | min(86vw, 300) drawer | 0 |

Side-panel rows match on all three surfaces: one left edge at x=12 with content at 22; places 36px tall (40 at 900 and under); "more" rows 28px. Icons measure within 0.6px of their label's centre (the cap height for capitalised labels, the x-height for lowercase ones):
- the top bar's search icon and Ask Sig ring;
- the side panel's glyphs (the Signal's bottom-aligned bars read +1.1);
- Ask Sig's title ring, tab dot and status ring;
- the community's tab dot and title ring.

The community's ticker ring is the exception (+1.25, LAYOUT-19).

### 5. Breakpoints written for a frame that no longer exists
The "tablet band" stacks layouts from 901 to 1279px because "the side panel and the window's frame take 306px". That rule is in decisions of November 11, call 6, and in the code at:
- `styles.css` l.315 to 321;
- `library/library.css` l.387 to 397;
- `pages/pages.css` l.153.

On the website that panel is now closed at every width, so these stack layouts that have room. The two layouts that actually broke used the wrong measure the other way:
- How it works switches at a 900px container (01);
- the community's table switches at a 760px viewport (03).

**Standardise:** every layout switch is a container query on the component, as `.fp` and `.hs` already are.

### 6. Card gutters, tab seams and the SIG block
- **Gutters:** every card grid on both surfaces uses `stack`, 14px (LAYOUT-20).
- **Tab seams:** every tab strip uses one rule, `margin-bottom:-1px` on the strip and `0` on the tab (10).
- **The SIG block:** its corner follows its window: 0 on Ask Sig, 11px in the community (11).

---

## The next update, in my area

1. **One 12-column page grid on `--page-pad` (24px gutters), with the background grid on it.**
   - **The problem:** the two-column splits fall on six different lines at 1440:
     - the foot: 1fr / 1.25fr, gap 48, form column at x=673.6;
     - the front page's top: 1fr / 560, gap 40, at 822.4;
     - the sheet glance: 1fr / 1.1fr, gap 14, at 696;
     - Join: 1fr / 1.05fr, gap 64;
     - the questions: .8fr / 1.4fr, gap 64;
     - Signal against noise: 1fr / 1fr, gap 16.
   - **The change:** put them on shared columns, so the foot's columns sit on the page grid (foot 5/7, glance 6/6, top 7/5). Also offset the faint 64px background grid by `--page-pad`, so the page edge sits on a grid line. Today the lines fall at 0, 64, 128… and the content edge at 57.6, 41, 20 or 16 never meets one.
   - **Touches:** every website page and its foot.
2. **Rhythm tokens and one page head and body pair.**
   - **The change:** add `space-head` 72/44, `space-head-end` 64/44, `space-body` 64/40, `space-section` 56, `space-intro` 32, `space-band` 88/64 and `space-foot` 110/72 to `tokens.json`. Have the Library hero, the sheet hero, My Miracle, the plan and the story head use the same `.doc-head .wrap` and body rules.
   - **Why:** seven templates set these values separately today, which is where LAYOUT-13 to 16 came from.
   - **Touches:** all 21 framed website pages.
3. **Retire the tablet band and move every layout switch into container queries.** This covers the fact sheet's glance and claims, the Library's explainer, the story's hero, the compare rows, How it works, and the community's layout and table. Each component then stacks at its own width, whatever the frame does next.
   - **Touches:** fact sheets, the Library, the story, compare pairs, the front page, the community's Signal and feed.
4. **A layout gate in the checks.** Have the capture (or `scripts/design_check.mjs`) fail when any of these hold:
   - `scrollWidth > innerWidth`;
   - an `overflow-x:auto` wrapper hides content at 1440;
   - a section's left edge is more than 2px off `--page-pad` outside a declared column.

   The 1024 overflow was logged by the capture but nothing failed, and the community table hid its last column unnoticed.
   - **Touches:** both apps' CI.
5. **One frame geometry shared by the community.** Give the community the same `--page-pad` variable (24px in the window; 16px on phones, not 12) and the same tab-seam rule. Share Ask Sig's status-bar SIG block and the community's ticker block through `kit/kit.css`, which both apps load. The community's side panel stays docked as it is; nothing is removed or hidden.
   - **Touches:** every community screen, Ask Sig.

## Evidence files (`.design/evidence/design-layout/`)

| Finding | Files |
| --- | --- |
| 01 | `home-howitworks-card-overflow@1024.png`, `home-howitworks-stacked-no-right-margin@390.png` |
| 02 | `side-panel-site300-vs-asksig272@1440.png`, `side-open-home@{1440,1024,768,390}.png` |
| 03, 18 | `comm-signal-table-cut@1440.png`, `comm-signal-table-alignment@1440.png` |
| 04 | `topbar-24-vs-page-57.6@1440.png`, `home-edge24-vs-foot20@768.png` |
| 06 | `story-edge-118-vs-foot-58@1440.jpg`, `story-foot-edge@1440.jpg` |
| 07 | `my-centred-column-vs-foot@1440.jpg` |
| 08 | `comm-home@1920.png` |
| 09 | `library-moves-100-vs-page-58@1440.jpg` |
| 10 | `comm-tab-hairline-under-open-tab@1440x4.png`, `asksig-tab-seam-ok@1440x4.png` |
| 11 | `asksig-status-sig-corner@1440x4.png`, `asksig@{1440,1024,768,390}.png` |
| 12 | `404-centre@1440.png` |
| 13 | `library-head-28-vs-doc-head-72@768.png` |
| 17 | `comm-phone-margin-12-vs-16@390.png` |
| 19 | `comm-ticker-ring-low-vs-asksig@1440x4.png` |
