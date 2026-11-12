# Layout, grid and symmetry — audit (LAYOUT)

**State:** The window frame is the same on 21 of 23 pages at 1440 and 1024: 16px gap, 44px title bar, 34px path line, 28px status bar, 272px side panel, 12px corners. Seven problems break that frame or the layout:

- **The frame leaks at the bottom.** While the page scrolls, page content shows in the gap under the status bar.
- **Vertical padding disappears under 900px.** The foot, the doc pages and the 404 lose their top and bottom padding.
- **Four two-column parts break at 1024.** Their breakpoints follow the viewport, but the window is 304px narrower.
- **The side panel jumps 12px on fact sheets.**
- **Ask Sig runs its own window.** It has a 42px title bar, 31px tabs, a 248px side panel at 1024, and the four places at the bottom of the panel.
- **The active tab doesn't open into the page.** A hairline runs under it.
- **Five doc pages have two left edges.** Their head and body start at different x.

**How it was measured:**

- All numbers come from the live pages, measured with Playwright and Chrome at DPR 1, using exact sub-pixel boxes.
- Widths: 1440, 1024, 768 and 390. Some checks also use 1920, 1366, 1280 or 1101; each finding says where.
- **L+n** is the offset from the window's inner left edge, and **R−n** the offset from its inner right edge. The inner left edge is at x=289 at 1440 and 1024, x=17 at 768 and x=0 at 390.
- Evidence images are in `/home/claude/design/evidence/layout-symmetry/`. Images whose names contain `FIXED` show the proposed CSS injected into the live page.

---

## Findings (most visible first)

### LAYOUT-01 — high — The page shows through the gap under the status bar while you scroll
- **Where:** every page longer than the viewport (all window pages except Ask Sig), at 1440, 1024 and 768, whenever the page is scrolled.
- **Selector(s):** `styles.css` l.849 `.win-status{…overflow:hidden}`; l.850 `.win-status::before{…top:100%;height:calc(var(--os-g) + 2px)…}`.
- **Evidence:**
  - At /library/ scrolled to y=2200, the 16px band under the status bar (y 884–900) shows card titles and card fills. Measured luminance there is 236 (text) and 18 (card fill); the page colour #07090A would read 9.
  - The status bar has `overflow:hidden`, which clips its own `::before`, the strip meant to paint that gap. The title bar has no overflow setting, so its `::before` works and the top gap is clean.
  - The bottom corners also show the window's straight side borders running past the status bar's 12px curve, because there is no corner mask.
  - `bottom-gap-showthrough-library@1440x2.jpg` shows the problem; `bottom-gap-FIXED-library@1440x2.jpg` shows the fix.
- **Rule:** README › The window: "The gap above and below them is painted in `page`, so nothing shows through while the page scrolls." Token `window-gap` is 16px.
- **Fix (`styles.css`):**
  - l.849 `.win-status`: remove `overflow:hidden`. The segments fit at every width where the bar shows: 413px of segments in a 734px bar at 768.
  - l.850 `.win-status::before`: change `top:100%;height:calc(var(--os-g) + 2px)` to `top:calc(100% + 1px);height:var(--os-g)`. This keeps the bar's bottom hairline.
  - Add the bottom-corner mask that Ask Sig already uses:
    `.win-status::after{content:'';position:absolute;left:-1px;right:-1px;bottom:-1px;height:12px;pointer-events:none;background:radial-gradient(circle at 100% 0,transparent 11.9px,var(--os-page) 12.4px) left bottom/12px 12px no-repeat,radial-gradient(circle at 0 0,transparent 11.9px,var(--os-page) 12.4px) right bottom/12px 12px no-repeat}`
  - **Check:** scroll any long page. Every pixel in y 884–900 equals #07090A. The status bar's bottom hairline (y 883) and both 12px corner arcs are visible.

### LAYOUT-02 — high — Under 900px the `.wrap` padding shorthand wipes the foot's, the doc pages' and the 404's vertical padding
- **Where:**
  - The foot on all 21 window pages at 768 and 390.
  - The doc body (`.doc`) on privacy, terms, about, method and weekly/1 at 601–900px.
  - The 404 at 601–900px.
- **Selector(s):** `styles.css` l.466, inside `@media (max-width:900px)`: `.wrap{padding:0 20px}`. It overrides the earlier, equally specific rules `.foot-in` (l.393), `.doc` (l.371) and `.nf-in` (l.388).
- **Evidence:**
  - `.foot-in` padding is 40/34px at ≥901 but 0/0 at 768 and 390. "The Signal, weekly." touches the foot's top rule, and the © line sits on the window's bottom edge, without its safe-area inset.
  - `.doc` padding is 64/110px at ≥901 but 0/0 at 768. The intro paragraph starts on the head's bottom rule.
  - `.nf-in` padding is 0/0 at 768, so the 404 shell touches the path line.
  - Evidence: `foot-no-padding-about@768.jpg`, `foot-no-padding-about@390.jpg`, `doc-no-top-padding-privacy@768.jpg`, `404-no-padding@768.jpg`.
- **Rule:** token `pad`: "the foot's padding (12px on a phone)". The intended spacing is the site's own 40/34px foot and 64/110px doc rules, which the shorthand cancels.
- **Fix (`styles.css` l.466):** change `.wrap{padding:0 20px}` to `.wrap{padding-left:20px;padding-right:20px}`. No other `.wrap` relies on the reset: the hero, strip and join each set their own padding later.
- **Check:** at 768, `.foot-in` is 40/34px, `.doc` is 64/110px and `.nf-in` is 64/96px (64/64 after LAYOUT-13). At 390, `.foot-in` is 40/34px, `.doc` is 40/72px and `.nf-in` is 40/72px.

### LAYOUT-03 — high — The story's hero squeezes its copy into a 194px column at 1024 and clips "checked."
- **Where:** /story/ at 1024 and 768, and every width from 761 to about 1340px (anywhere the side panel takes room).
- **Selector(s):** `styles.css` l.939 `.sy-hero-in{grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:64px}`, which stacks only at l.1002–1003 `@media (max-width:760px)`.
- **Evidence:**
  - The grid is 380px + 194px at 1024 and 380px + 250px at 768.
  - The h1 wraps to 7 lines and is 393px tall.
  - The h1's scrollWidth is 252px against a clientWidth of 194px, and `.sy-hero{overflow:hidden}` cuts "checked." at the window edge.
  - Evidence: `story-hero@1024.jpg` (problem) and `story-hero-FIXED@1024.jpg` (fix).
- **Rule:** the brief's "breaks layout" criterion. The 760px breakpoint describes a viewport, but the window is 304px narrower on desktop (272px panel plus two 16px gaps).
- **Fix (`styles.css`, after l.939):**
  `.sy-hero{container-type:inline-size}` and
  `@container (max-width:1040px){.sy-hero-in{grid-template-columns:minmax(0,1fr);gap:36px}}`
  This stacks the hero when the hero itself is under 1040px. A plainer alternative is to move l.1003's rule into a `@media (max-width:1340px)` block.
- **Check:** at 1024 and 768, the hero is one column and the h1's scrollWidth equals its clientWidth (638px at 1024). At 1440 and 1366 it stays two columns, with a 610px copy column at 1440 and 536px at 1366.

### LAYOUT-04 — high — The compare page's columns collapse to 80px of text and the page scrolls sideways
- **Where:** /compare/semaglutide-vs-tirzepatide/ (every pair page) at 1024 and 768. It is also cramped at 1101–1300: the text column is 80px at 1101 and 136px at 1280.
- **Selector(s):** `pages/pages.css` l.68 `.cmp-row{grid-template-columns:200px minmax(0,1fr) minmax(0,1fr)}`, which stacks only at ≤760px; l.78 `.cmp-list li{display:flex;gap:10px}`.
- **Evidence:**
  - At 1024 the row is 200px + 191px + 191px.
  - The 173px evidence chip leaves the claim text 72–84px wide, one word per line.
  - The left cell's text runs into the right cell's chips.
  - The right cell's spans end at x=1031–1043, so the document scrollWidth is 1043px at 1024 and 779px at 768: a sideways scroll of 19px and 11px.
  - Evidence: `compare-overflow@1024.jpg` (problem) and `compare-FIXED@1024.jpg` (fix).
- **Rule:** breaks layout. Also README › The window: the page lives inside the window, and nothing should spill out of it.
- **Fix (`pages/pages.css`):**
  - Add `.cmp-cell{container-type:inline-size}`.
  - Add `@container (max-width:380px){.cmp-list li{flex-direction:column;align-items:flex-start;gap:6px}}`. This puts the chip above the claim when a cell is narrow.
  - Add `@media (min-width:761px) and (max-width:1100px){.cmp-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 28px}.cmp-k{grid-column:1/-1}.cmp-names .cmp-k{display:none}}`. This puts the label above both cells.
- **Check:** `document.documentElement.scrollWidth === innerWidth` at 1024 and 768. The claim text is at least 230px wide at every width from 761 to 1440: 305px at 1024, 319px at 1280 and 399px at 1440.

### LAYOUT-05 — high — The fact sheet's "glance" panel and the Library's "two kinds of evidence" panel stay two-column until 900px
- **Where:**
  - Fact sheets at 1024: the facts card. Measured on semaglutide and creatine; every full sheet uses the same template.
  - /library/ at 1024, and 1280 for the grade key.
- **Selector(s):**
  - `library/library.css` l.142 `.le-glance-in{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr)}`, which stacks at l.283 (≤900).
  - l.112 `.lib-explain .explain-grid{grid-template-columns:1fr 1fr}`, which stacks at l.284 (≤900).
  - l.116 `.grade-key li{grid-template-columns:auto minmax(0,1fr)}`.
- **Evidence:**
  - At 1024 the facts card is about 294px wide. The "Strong evidence" chip's right edge is at x=674.8 against the card's right edge at 625.2, so it sticks out 49.5px. The values wrap to one or two words per line.
  - In the Library's "Checked against the sources" card, the grade descriptions get columns 66, 52, 59 and 16px wide at 1024 (144–194px at 1280).
  - Evidence: `sheet-facts-chip-overflow@1024.jpg`, `library-grade-key-squeezed@1024.jpg`.
- **Rule:** breaks layout. The same viewport-versus-window cause as LAYOUT-03.
- **Fix (`library/library.css`):**
  - `.le-glance{container-type:inline-size}` and `@container (max-width:900px){.le-glance-in{grid-template-columns:minmax(0,1fr)}}`.
  - `.lib-explain{container-type:inline-size}` and `@container (max-width:980px){.lib-explain .explain-grid{grid-template-columns:minmax(0,1fr)}}`.
- **Check:**
  - No child of `.le-facts dd` ends right of `.le-facts` at 1024, 1180 or 1280.
  - The grade-key text is at least 187px wide at 1440, 1366, 1280, 1024 and 768 (393px at 1024).

### LAYOUT-06 — high — The side panel jumps 12px on fact sheets
- **Where:**
  - Fact sheets at 1440×900 and 1024×900: semaglutide, creatine and the 5-HTP stub, measured. Every sheet carries the same folder tree.
  - /library/ on screens up to about 770px tall: measured at 1440×760.
- **Selector(s):** `styles.css` l.759 `.os-side{display:flex;flex-direction:column;height:100dvh…}` and l.760 `.os-head{height:44px}`. The head is a flex item with the default `flex-shrink:1`, so a long `.os-ctx` folder tree squeezes it.
- **Evidence:**
  - `.os-head` is 32px tall on the sheets against 44px everywhere else. The logo sits at y=15 instead of 21.
  - "Ask Sig a question" is at y=52 instead of 64, and the four places at y=104 instead of 116.
  - The panel moves under the pointer when you go from Home to a sheet.
  - Evidence: `side-panel-jump-home-vs-sheet@1440.jpg` (red guides at 17, 21, 64 and 116).
- **Rule:** principle 4, "One window, everywhere. The same side panel … on every page."
- **Fix (`styles.css`, after l.760):** `.os-side>:not(.os-ctx){flex-shrink:0}`. Only the folder tree, which scrolls, may shrink.
- **Check:** on /library/semaglutide/ at 1440×900, `.os-head` is 44px tall, the logo image's top is y=21, `.os-ask` is at y=64 and `.os-places` at y=116, identical to /. *(Verified with the rule injected.)*

### LAYOUT-07 — medium — Ask Sig's window is not the site's window
- **Where:** /sig/ and /ai/ (same page) at 1440 and 1024 (side panel at 1024).
- **Selector(s):**
  - `ai/term.css` l.22 `--tm-tb:42px`.
  - l.95 `.tm-tab{height:31px}`.
  - l.143 `.tm .ai-bar{padding:0 10px 0 var(--tm-px)}`, where `--tm-px` is 24px.
  - l.513–515 `@media (min-width:901px) and (max-width:1100px){.sg{--sg-w:248px}}`.
  - Side panel markup in `scripts/build_library.mjs` l.886–897: the places `nav.sg-site` sits inside `.sg-foot`.
- **Evidence:**

  | Part | Ask Sig | Rest of the site |
  |---|---|---|
  | Title bar | 42px (y 16→58) | 44px |
  | Active tab | 31px | 32px |
  | Path text | x=313 (L+24) | x=309 (L+20) |
  | Side panel at 1024 | 248px | 272px |
  | The four places | y=617 | y=116 |

  The panel also has no "more" list, the rest of the site's links. Evidence: `titlebar-site-vs-asksig@1440.jpg`, `side-panel-home-vs-asksig@1024.jpg`.
- **Rule:**
  - Tokens `title-bar` 44px ("on the site") and `tab` 32px, and `side-panel` 272px.
  - README › The window: "the logo, then the four places … Under them comes what is in this window, then the rest and the legal."
  - Principle 4.
- **Fix:**
  - `ai/term.css` l.22: `--tm-tb:42px` → `44px`.
  - l.95: `.tm-tab{height:31px}` → `32px`; see LAYOUT-08 for its margin.
  - l.143: `.tm .ai-bar` `padding-left:var(--tm-px)` → `20px`.
  - Delete l.513–515, so the panel stays 272px.
  - In `build_library.mjs`, move `<nav class="sg-site os-places">` out of `.sg-foot` to directly after `#sg-new`, and give it `margin-top:8px` so the first place row lands at y=116.
  - The site's "more" list is a navigation menu missing from this panel. It should be added under the chats, not dropped.
- **Check:** at 1440 and 1024, `.tm-title` is 44px tall, `.tm-tab.on` runs from 28 to 60, `.tm-path` is at x=309, `.sg-side` is 272px wide and the Library row is at y=116. *(The geometry part is verified with the CSS injected: title 16→60, tab 28→60, path x=309, side 272.)*

### LAYOUT-08 — medium — The active tab doesn't sit on the window: the title bar's hairline runs under it
- **Where:** every page at 1440, 1024 and 768 (on phones the tab is a pill by design). Ask Sig too.
- **Selector(s):**
  - `styles.css` l.824 `.win-tabs{…align-self:stretch;overflow-x:auto}`.
  - l.826 `.win-tab{…height:32px;margin-bottom:-1px}`.
  - `ai/term.css` l.91–92 `.tm-tabstrip` / `.tm-chats{overflow-x:auto;overflow-y:hidden;height:100%}`.
  - l.95 `.tm-tab{margin-bottom:-1px}`.
- **Evidence:** the tab's box ends at y=60, but `overflow-x:auto` on the nav also clips vertically at the nav's bottom, y=59. So the 1px bottom border of `.win-title` (y 59–60) stays visible under the tab, and the tab is cut off from the page instead of opening into it. Evidence: `tab-junction-home@1440x4.jpg` and `tab-junction-asksig@1440x4.jpg` (problem); `tab-junction-home-FIXED@1440x4.jpg` and `tab-junction-asksig-FIXED@1440x4.jpg` (fix).
- **Rule:** token `tab`: "A window tab … sitting on the window like a file's tab in an editor". `bundle.css` `.mh-tabs` has no overflow, so `.mh-tab`'s −1px margin covers the line.
- **Fix:**
  - `styles.css` l.824 `.win-tabs`: add `margin-bottom:-1px`.
  - l.826 `.win-tab`: change `margin-bottom:-1px` to `0`.
  - `ai/term.css` l.91 `.tm-tabstrip`: add `margin-bottom:-1px`.
  - l.95 `.tm-tab`: change to `height:32px;margin-bottom:0`.
- **Check:** at 1440, the active tab's box is 28→60 (32px) on / and /sig/, and the pixels under the tab at y=59 equal the window surface #0B0F11 (no hairline).

### LAYOUT-09 — medium — Doc pages have two left edges: the head at L+40 and the body at L+197
- **Where:** /privacy.html, /terms.html, /about/, /method/ and /weekly/1/ at 1440. This applies at every viewport wider than about 1125px, wherever the window is wider than 820px.
- **Selector(s):** `styles.css` l.367 `.doc-head .wrap` (full width, 40px padding) and l.371 `.doc{max-width:820px}`, an 820px centred column inside a `.wrap`.
- **Evidence:** the kicker, h1 and date start at x=329 (L+40); the intro, h2s, lists and the "short version" box start at x=486 (L+197), 157px to the right. Evidence: `doc-two-left-edges-privacy@1440.jpg`.
- **Rule:** one left edge per page, from the founder's brief. The head and body are one page.
- **Fix (`styles.css`, after l.367):** add `.doc-head:has(+ .doc) .wrap{max-width:820px}`. The head then shares the doc's centred column, and the page stays symmetric at L+197 and R−197. If one left edge across the whole site matters more than the centred column, use the alternative `.doc{max-width:1320px}.doc>*{max-width:740px}`, which left-aligns the body at L+40 like status, goals and weekly.
- **Check:** at 1440 on the five pages, the kicker, the h1 and the first body paragraph all start at x=486 (L+197). /status/ is unchanged at x=329. *(Verified with the rule injected.)*

### LAYOUT-10 — medium — The fact sheet's "glance" band is drawn as a plate: a double hairline on the window, notched corners and a 1px stray edge
- **Where:** fact sheets (semaglutide, creatine and the 5-HTP stub) at 1440, 1024 and 768.
- **Selector(s):** `library/library.css` l.376 `.le-glance,.lab-col,.side-card,.lib-moves,.toc,.ev-box,.checked{border:1px solid var(--line);border-radius:6px;background:var(--card)}`, applied to the full-bleed `section.le-glance`; l.317 `.le-bl-wrap{padding-top:4px;padding-bottom:16px}`.
- **Evidence:**
  - The band's 1px border runs right next to the window's own border, giving a double hairline on both sides. A second line sits under the hero's `border-bottom`.
  - The band has 6px rounded corners, which show as notches against the window edge.
  - Everything inside is shifted 1px: the bottom-line plate, the radar and the facts are at L+41 and R−41 instead of L+40 and R−40.
  - The bottom-line plate sits only 5px below the band's top edge but 40px from its sides.
  - Evidence: `glance-band-corner@1440x4.jpg`, `glance-band-edge@1440.jpg`, `glance-band-top@1440.jpg` (problem); `glance-band-top-FIXED@1440.jpg` (fix).
- **Rule:**
  - README › Shape: `radius-plate` is "for cards and tables". A band is a ground, not a plate.
  - Hairlines: "line frames windows and cards".
  - One left edge.
- **Fix (`library/library.css`):**
  - Remove `.le-glance` from the l.376 list.
  - Set `.le-glance{background:var(--card);border:0;border-radius:0;padding-bottom:40px}`.
  - At l.317, change `.le-bl-wrap` `padding-top:4px` to `40px`.
- **Check:** at 1440, `.le-bl`, `.le-radar` and `.le-main` all start at L+40. The bottom-line plate's top is 40px below the hero's rule, the same as its side inset. One hairline shows at the window's left edge. *(Verified with the rule injected.)*

### LAYOUT-11 — medium — The Library's "What moved this week" band runs into the window's edges and its label is 21px off the page's edge
- **Where:** /library/ at 1440 and 1024 (21px off), and at 768 and 390 (1px off, band touching the edges).
- **Selector(s):** `library/library.css` l.335 `.lib-moves{…padding:14px 18px;border-radius:6px…}`, applied to `section.wrap.lib-moves`, plus the plate border from l.376. `.lib-moves` replaces `.wrap`'s 40px padding, while `.wrap` keeps the box full width.
- **Evidence:** the box spans L+0 to R−0, a rounded, bordered rectangle touching both sides of the window. Its label "What moved this week" is at x=308 (L+19), while the hero, search field, chips and cards start at x=329 (L+40). Evidence: `library-moves@1440.jpg`.
- **Rule:** one left edge; symmetric insets (every other block is inset 40px from both window edges).
- **Fix (`library/library.css`):**
  - `section.wrap.lib-moves{width:auto;margin:22px max(40px,calc((100% - 1240px) / 2)) 0}`
  - Inside `@media (max-width:900px)`: `section.wrap.lib-moves{margin:22px 20px 0}`
- **Check:** the `.lib-moves` box's left and right insets equal `.lib-search`'s at every width: 40/40 at 1440 and 1024, 187/187 at 1920, 20/20 at 768 and 390. *(Verified.)*

### LAYOUT-12 — medium — On wide screens the page content is capped and centred, but the foot spans the window
- **Where:** every window page at viewports of 1627px and wider (window inner wider than 1320px); measured at 1920. The story differs again because of its own column width.
- **Selector(s):** `styles.css` l.59 `.wrap{max-width:1320px;margin:0 auto}`; l.848 `.win-foot .foot-in{max-width:none}`; l.929 `.sy{--sy-w:1180px}`.
- **Evidence:** at 1920 (window inner 1614px):
  - Page content starts at L+187 and ends at R−187 on /weekly/, /status/, / and /library/.
  - The foot's newsletter, links and legal line start at L+40 and end at R−40: two left edges 147px apart on every page.
  - The story's column is capped at 1180px, so its sections start at L+287.
  - Evidence: `foot-vs-content-edge-weekly@1920.jpg` (red line is the content edge, blue line the foot edge).
- **Rule:** item 7 of the brief, "the foot's columns aligned to the page's grid"; one left edge.
- **Fix (`styles.css`):** delete l.848 `.win-foot .foot-in{max-width:none}`, so the foot uses the same 1320px column. At l.929, change `.sy{--sy-w:1180px}` to `1320px`, or delete it together with l.930.
- **Check:** at 1920, `.foot-news`, `main h1` and the story's `.sy-k` all start at L+187.

### LAYOUT-13 — medium — The 404 isn't centred: 64px above the shell, 403px below the buttons
- **Where:** /404.html at 1440 and 1024. At 768 see LAYOUT-02.
- **Selector(s):** `styles.css` l.386 `.nf-main{…min-height:100svh;display:flex;align-items:center}`, overridden by l.846 `.win-body{display:block}` (same specificity, later). l.388 `.nf-in{padding-top:64px;padding-bottom:96px}`.
- **Evidence:** at 1440, `main` is 900px tall and the content runs from 94 to 686.7. There is 64px above the shell and 403.3px below the buttons, 265.3px of it above the status bar. The page reads as top-heavy with a dead band before the foot. Evidence: `404-not-centred@1440.jpg`.
- **Rule:** centring (brief item 4); the shell and its message are meant to sit in the middle of the window's visible area.
- **Fix (`styles.css`):**
  - Add `.nf-main.win-body{display:flex;min-height:calc(100svh - 2 * var(--os-g) - var(--os-tb) - 62px)}`, where 62px is the 34px path line plus the 28px status bar.
  - Inside `@media (max-width:700px)`: `.nf-main.win-body{min-height:calc(100svh - var(--os-tb) - 34px)}`.
  - l.388: change `.nf-in` to `padding-top:64px;padding-bottom:64px`.
  - l.530 (≤600px): `.nf-in` 40/72px → 40/40px.
- **Check:** at 1440×900, the gap from the path line to the shell (164.6px) equals the gap from the buttons to the status bar (164.7px). At 1024 both are 175.2px. *(Verified.)*

### LAYOUT-14 — medium — Home "three ways": the third card's title sits 3px low, and the middle card's link floats 227px above the others
- **Where:** / at 1440 and 1024.
- **Selector(s):**
  - `styles.css` l.729 `.step-n{display:flex;align-items:center;font:400 13px/1 …}`: the third card's line holds a 16px ring (`.sn-ring`), the others a 7px dot.
  - l.640 `.ai-visual{order:9…}` and l.638 `.step-link{margin-top:auto…}`.
- **Evidence:**
  - The `.step-n` lines are 13, 13 and 16px tall, so the h3 tops are 1432.4, 1432.4 and 1435.4.
  - The link tops are 1881.9, 1654.4 and 1881.9. In the middle card the visual comes after the link, so "How the numbers are made" sits mid-card while the other two links sit on the bottom line.
  - Evidence: `home-three-ways@1440.jpg`.
- **Rule:** grids and rows: aligned rows within a card row (brief item 6).
- **Fix (`styles.css`):** at l.729 add `min-height:16px` to `.step-n`, and add `.step.ai .step-link{order:10}`.
- **Check:** the three `.step h3` tops are equal (1435.4) and the three `.step-link` tops are equal (1884.9) at 1440. *(Verified with the rules injected.)*

### LAYOUT-15 — medium — Key/value rows don't share a baseline
- **Where:** compare pair pages at 1440 (every row); fact sheets' facts card at 1440 and 1024.
- **Selector(s):** `pages/pages.css` l.68 `.cmp-row` (grid, default stretch with top alignment); `library/library.css` l.148 `.le-facts div{…align-items:center…}`.
- **Evidence:**
  - Compare: each row label (`.cmp-k`, 12px mono) sits 6.0px above the first line of its cells. The label baseline is at 665.4 and the cells' first baseline at 671.4 on "What it is"; it is 787.1 against 793.1 on "Status in the US".
  - Fact sheets: the label is 2.9px above one-line values and 10.0px below the first line of the two-line "US status" value, because it is centred.
  - Evidence: `compare-label-baselines@1440.jpg` (red = label baseline, blue = cell first baseline).
- **Rule:** brief item 7, table columns aligned. A key and its value read as one line.
- **Fix:** `pages/pages.css` l.68 `.cmp-row`: add `align-items:baseline`. `library/library.css` l.148 `.le-facts div`: change `align-items:center` to `baseline`.
- **Check:**
  - Compare: label and first-cell baselines match within 0.5px on text rows and within 2px on rows that start with a chip.
  - Fact sheets: dt and dd baselines match within 0.3px on all five rows.
  - *(Verified with the rules injected.)*

### LAYOUT-16 — medium — The home strip wraps with a 22px indented second row and a dangling divider
- **Where:** / at 1024, 1280 and 768 (anything under about 1360px wide).
- **Selector(s):** `styles.css` l.722–725 `.strip-in{…}`, `.strip-in span{padding:0 22px;border-right:1px solid var(--line)}`, `span:first-child{padding-left:0}` and `span:last-child{border-right:0}`.
- **Evidence:** at 1024 the strip breaks into two rows of two. Row 2 starts at L+62 instead of L+40, and row 1 ends with a divider that has nothing after it. At 1280 only the fourth item wraps, again at L+62. Evidence: `home-strip-wrap@1024.jpg` (problem) and `home-strip-wrap-FIXED@1024.jpg` (fix).
- **Rule:** one left edge.
- **Fix (`styles.css`, after l.727):**
  `.strip{container-type:inline-size}`
  `@container (min-width:600px) and (max-width:1050px){.strip-in{display:grid;grid-template-columns:repeat(2,max-content);column-gap:44px}.strip-in span,.strip-in span:first-child{padding:0;border:0}}`
- **Check:** at 1280, 1024 and 768, the four items start at two x values only, L+40 and L+316 (L+20 and L+296 at 768). At 1440 and 1366 the strip is still one row.

### LAYOUT-17 — medium — On the story page, Sig's centre dot sits on the "12"
- **Where:** /story/ at every width.
- **Selector(s):** `scripts/build_library.mjs` l.1026 `ringSvg(320, { sw: 26, centerY: 0 })`; `styles.css` l.942 `.sy-ring-n`.
- **Evidence:** the Interpretation agent's dot (`circle.rg-c`, r=10.56px) is at the ring's exact centre (519, 451.6), inside the "12" box (x 483–555, y 410.6–474.6). It overlaps the lower half of the numerals, reading as "1•2". Ask Sig's big ring passes `centerY:-44`, which `lib/ring.js` documents for "a ring [that] has words in its middle", so its dot sits 13px above the count. Evidence: `story-ring-dot-on-count@1440x3.jpg`.
- **Rule:** centring of the ring's label against its centre; the same mark drawn the same way on both pages (Iconography: Sig's ring).
- **Fix:** in `scripts/build_library.mjs` l.1026, change `centerY: 0` to `centerY: -66` (Ask Sig's −44 scaled from 212 to 320px).
- **Check:** the bottom of the `.sy-ring .rg-c` box (about 396px) sits about 14px above the top of `.sy-ring-n b` (410.6px).

### LAYOUT-18 — medium — Page heads start at different heights: 130.7px on the Library, 72px on doc pages, 70px on fact sheets
- **Where:** /library/ at 1440 (76px at 1024); all fact sheets at 1440 and 1024.
- **Selector(s):**
  - `library/library.css` l.63 `.lib-hero{…display:flex;align-items:flex-end;min-height:clamp(600px,48vw,820px)}`, a leftover of the photo hero that the Plate section removed.
  - l.69 `.lib-hero-in{padding-top:calc(var(--top-h) + 76px)}`.
  - l.130 `.le-hero .kick{margin-top:30px}` on top of `.le-hero .wrap` padding-top 40px.
- **Evidence:** the gap from the path line to the kicker is 130.7px on /library/ at 1440, 72px on every doc-head page and the story, and 70px on fact sheets. Evidence: `page-head-top-space@1440.jpg`.
- **Rule:** vertical rhythm (brief item 5); see the Systemic scale, where a page head starts 72px below the path line.
- **Fix (`library/library.css`):**
  - In the Plate section (after l.354), add `.lib-hero{min-height:0}`.
  - At l.69, change `.lib-hero-in` `padding-top` to `72px`.
  - At l.130, change `.le-hero .kick{margin-top:30px}` to `32px`.
- **Check:** kicker top minus path-line bottom is 72px on /library/, the fact sheets and the doc pages at 1440 and 1024. *(Library part verified: 72/72.)*

### LAYOUT-19 — medium — The page's side padding is 40px (20px under 900px), not the `pad` token's 24px (12px on a phone); My and plan use 24px and 16px
- **Where:** every window page. My Miracle and the plan page differ from the rest.
- **Selector(s):**
  - `styles.css` l.59 `.wrap{padding:0 40px}`, l.466 `20px`, l.393 `.foot-in` 40px.
  - `my/my.css` l.6 `.my-wrap{max-width:880px;padding:… 24px …}` and l.81 `16px`.
  - `ai/plan.css` l.150 `.plan-wrap{max-width:820px;padding:… 24px …}` and l.163 `16px`.
- **Evidence:**
  - Page content starts at L+40 at 1440, 1024 and 768; the title bar's brand at L+17 and the path text at L+20. See `window-insets-title-path-page@1440x2.jpg`.
  - On phones, content starts at x=20 on 21 pages but x=16 on My and plan.
  - My's column is 880px wide; plan's and the doc pages' are 820px.
- **Rule:** token `pad` 24px: "The page's side padding inside the window, the foot's padding (12px on a phone)". `bundle.css` `.mh-wbody{padding:22px 24px 26px}`.
- **Fix:**
  - `.wrap` side padding: 40px → 24px (l.59).
  - Inside `@media (max-width:700px)`: 12px (replacing l.466's 20px at ≤700; keep 24px for 701–900).
  - `.foot-in`: `padding:24px` (12px on phones).
  - `.my-wrap` and `.plan-wrap`: 16px → 12px on phones.
  - `.my-wrap` `max-width:880px` → `820px`.
  - Do this after LAYOUT-02. It moves every left edge by 16px, so re-check LAYOUT-23 afterwards: the hero plate's inner padding must follow the copy edge.
- **Check:** page content starts at L+24 on all window pages at ≥701px and L+12 at ≤700px.

### LAYOUT-20 — low — The story hero's ripple isn't concentric with Sig's ring
- **Where:** /story/ at 1440 (42px off), 1024 (58px off), and every other width.
- **Selector(s):** `styles.css` l.938 `.sy-hero::before{background:repeating-radial-gradient(circle at 24% 50%,…);mask-image:radial-gradient(circle at 24% 50%,…)}`.
- **Evidence:** the ripple centre is at 24% / 50% of the section, (561.2, 459.6) at 1440. The ring's centre is at (519, 451.6): 230px from the section's left edge at any width, and 8px above the middle because the padding is 72/88px. They match only when the section is exactly 958px wide. Evidence: `story-ripple-offset@1440-diagnostic.jpg`, with the ripple boosted, red now and green after the fix; `story-hero@1440.jpg` shows it at normal strength.
- **Rule:** centring (brief item 4): a ripple is read as coming from the ring.
- **Fix (`styles.css`):**
  - l.937: add `isolation:isolate` to `.sy-hero`.
  - Replace l.938 with a ripple drawn from the ring:
    `.sy-ring::before{content:'';position:absolute;left:50%;top:50%;width:1600px;height:1600px;margin:-800px 0 0 -800px;background:repeating-radial-gradient(circle,rgba(238,236,230,0) 0 63px,rgba(238,236,230,.05) 63px 64px);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 51%);mask-image:radial-gradient(circle,#000 0,transparent 51%);pointer-events:none;z-index:-1}`
- **Check:** the ripple centre equals the `.sy-ring` centre at 1440, 1024 and 390.

### LAYOUT-21 — low — The window's hairline is missing along the top edge and round the top corners
- **Where:** every window page at ≥701px (and Ask Sig).
- **Selector(s):**
  - `styles.css` l.816 `.win-title::before{…bottom:100%…}` covers the title bar's 1px top border.
  - l.817–818 `.win-title::after{top:-1px;height:13px;… 13px 13px tiles, transparent 11.4px → page 12.2px}` paints over the border's arc.
  - Same pattern in `ai/term.css` l.81–83.
- **Evidence:**
  - At 1440, pixel row y=16, the title bar's top border, reads the page colour (luminance 9) across the whole width instead of the hairline. With the fix it reads 43; measured at x=700.
  - At each top corner the arc from y=17 to 28 has no hairline. The side hairline only starts at y=29, so the window outline stops short of each corner.
  - Evidence: `window-corner-hairline@1440x8.jpg`, with contrast ×4: now on the left, the fix on the right.
- **Rule:** Colour: "`line` frames windows and cards"; token `radius-window` 12px is "Sig's window, its title bar's top corners".
- **Fix (`styles.css`):**
  - l.816: `bottom:100%` → `bottom:calc(100% + 1px)`.
  - l.817–818: `height:12px;background:radial-gradient(circle at 100% 100%,transparent 11.9px,var(--os-page) 12.4px) left top/12px 12px no-repeat,radial-gradient(circle at 0 100%,transparent 11.9px,var(--os-page) 12.4px) right top/12px 12px no-repeat`.
  - Same in `ai/term.css` l.81–83.
- **Check:** at 1440, row y=16 over the title bar shows the hairline colour, and the 12px arcs carry it continuously into the side borders.

### LAYOUT-22 — low — 1px overflows: phones scroll 1px sideways, and Ask Sig scrolls 1px down
- **Where:** all 21 window pages at 390; /sig/ and /ai/ at 1440, 1024 and 768.
- **Selector(s):** `styles.css` l.816 `.win-title::before{left:-1px;right:-1px}`, still drawn at ≤700px where the window has no border or gap; `ai/term.css` l.121 `.tm .tm-status::before{top:100%;height:calc(var(--tm-g) + 2px)}`.
- **Evidence:** `scrollWidth` is 391 on a 390px viewport on every window page. Ask Sig's `scrollHeight` is 901 on a 900px viewport, because the status bar's cover ends 1px past the screen.
- **Rule:** the window fills the screen exactly on a phone (README › The window: "the window fills the screen").
- **Fix:**
  - `styles.css` inside `@media (max-width:700px)` (l.876): `.win-title::before{display:none}`.
  - `ai/term.css` l.121: `top:calc(100% + 1px);height:var(--tm-g)`.
- **Check:** `scrollWidth` is 390 at 390 on / and /about/ (verified); /sig/ `scrollHeight` is 900 at 1440×900 (verified).

### LAYOUT-23 — low — Home hero: the plate's labels sit 3px left of the copy's edge
- **Where:** / at 1440 and 1024.
- **Selector(s):** `styles.css` l.117 `.net-bar{padding:0 20px}` and l.123 `.net-foot{padding:0 20px}`, inside `.net`, which is inset 16px with a 1px border, so the labels land at 37px. The copy is at the `.wrap`'s 40px.
- **Evidence:** "PLATE 01" and "What the 985 lines say:" are at x=326 (L+37); the kicker, h1, lede and prompt are at x=329 (L+40). The hero card's right edge is on R−40. Evidence: `home-hero-plate-vs-copy-edge@1440x2.jpg`.
- **Rule:** one left edge (brief item 3).
- **Fix (`styles.css`):** `.net-bar,.net-foot{padding-left:23px;padding-right:23px}`, so the labels land on L+40 and end on R−40.
- **Check:** `.net-n` left equals `.hero .kick` left (x=329) at 1440 and 1024.

### LAYOUT-24 — low — Home example card: the caption is right-aligned under a left-aligned button
- **Where:** / at 1440 and 1024.
- **Selector(s):** `styles.css` l.303 `.vs-act{display:flex;flex-direction:column;align-items:flex-end}`. `.vs-foot` wraps at these widths: the text needs 989px and has 972px. So the action group drops to its own line at the left, but keeps right-aligning its children.
- **Evidence:** the button starts at x=370 (L+81); "As it stood in November 2026" starts at x=391 (L+102), 21px in, flush with the button's right edge only. Evidence: `home-vs-foot@1440.jpg`.
- **Rule:** buttons and their captions share an edge (brief item 4, buttons in a row).
- **Fix (`styles.css` l.303):** change `.vs-act` `align-items:flex-end` to `flex-start`. The ≤640px rule `align-items:stretch` is unaffected.
- **Check:** `.vs-act .btn` left equals `.vs-when` left at 1440 and 1024.

### LAYOUT-25 — low — The fact sheet's print starts 30px above the first line of text beside it
- **Where:** all fact sheets with a print at 1440 and 1024 (at ≤900px it stacks).
- **Selector(s):** `library/library.css` l.406 `.le-print{float:right;margin:0 0 18px 40px}` against l.130 `.le-hero .kick{margin-top:30px}`.
- **Evidence:** the print's top is at y=134; the kicker's top is at y=164. Evidence: `sheet-print-top-vs-kicker@1440.jpg`.
- **Rule:** row alignment; the two columns of the hero should start on one line.
- **Fix (`library/library.css` l.406):** `.le-print{margin:30px 0 18px 40px}`, or 32px if LAYOUT-18's 32px kicker margin is applied.
- **Check:** `.le-print` top equals `.le-hero .kick` top at 1440.

### LAYOUT-26 — low — Dots and rings beside capitals sit 1.0–1.4px below the capitals' centre
- **Where:**
  - Status bar "SIG" on every page.
  - "What moved this week" on the Library.
  - The home hero card's "Community Signal" dot and its foot icon.
  - The fact sheets' "Live" dot.
  - Measured at 1440.
- **Selector(s):** `.ws-sig svg` (`styles.css` l.854); `.live i` (l.66); `.hc-foot svg` (l.225); `.moves-k i` (`library/library.css` l.337); `.tm-sb-sig [data-sig]` (`ai/term.css` l.126).
- **Evidence:**
  - All are centred on the label's line box (offsets of 0.25–0.9px). But Monaspace's capitals sit high in that box.
  - Ink centres: SIG ring 1.00px low, "What moved" dot 1.12px, hero card dot 1.13px, card foot icon 1.37px, sheet "Live" dot 1.26px.
  - Lowercase labels are fine: "online", "safety on", "live" and the tab dot are all within 0.5px.
  - Evidence: `dots-vs-caps-centre@1440x4.jpg` (red = icon ink centre, blue = capitals ink centre).
- **Rule:** brief item 7: icons vertically centred with their labels, flagged over 1px.
- **Fix:** add `translate:0 -1px` to `.ws-sig svg`, `.tm-sb-sig [data-sig]`, `.live i`, `.moves-k i` and `.hc-foot svg`.
- **Check:** the icon ink centre is within 0.5px of the capitals' ink centre in a 4× capture.

### LAYOUT-27 — low — Side panel rows have three heights: 40px, 36px and 28px
- **Where:** the side panel on every window page.
- **Selector(s):** `styles.css` l.766 `.os-ask{min-height:40px}`, l.770 `.os-places a{min-height:36px}`, l.781 `.os-more a{min-height:28px}`.
- **Evidence:**
  - All rows share one left edge: the box at x=12 and the content at x=22 (the Ask button's icon at 25).
  - Heights differ: "more" rows are 28px, places 36px, Ask 40px. Evidence: `side-panel-home-vs-asksig@1024.jpg`, left panel.
- **Rule:** token `row` 36px: "A row of the side panel; a place or a menu item". `bundle.css` `.mh-nav{min-height:var(--row)}`.
- **Fix (`styles.css`):** l.781 `.os-more a{min-height:28px}` → `36px`. Because the "more" list then grows by 80px, also change l.759 `.os-side{…overflow:hidden}` to `overflow-y:auto`, so the legal line stays reachable on short screens. This doesn't hide anything.
- **Check:** every `.os-more a` is 36px tall; on a 1440×700 viewport, `.os-legal` can be scrolled into view.

### LAYOUT-28 — low — The method page's only numeric table column is left-aligned with proportional settings
- **Where:** /method/, table "Would it have happened anyway", at all widths.
- **Selector(s):** `styles.css` l.544 `.method .mtable th,.method .mtable td{text-align:left}` and l.548 `.method .mtable .num{…}`, which has no `text-align` and no `font-variant-numeric`.
- **Evidence:** `td.num` ("42% (23–42%)", …) computes `text-align:left` and `font-variant-numeric:normal`. The column aligns today only because every value happens to have two digits.
- **Rule:** Type: `data` is "Tables and numbers, tabular figures". `bundle.css` `.mh-top .n{text-align:right}`.
- **Fix (`styles.css` l.548):** add `text-align:right;font-variant-numeric:tabular-nums` to `.method .mtable .num`, and add `.method .mtable.baselines thead th:nth-child(2){text-align:right}`.
- **Check:** the computed `text-align` of `td.num` is `right`, and the right edges of the column's values are equal.

---

## Systemic

### 1. Breakpoints are written for the viewport; the page lives in a window 304px narrower
The side panel (272px) and the two 16px gaps take 304px from every desktop viewport. Content breakpoints at 760, 900 and 1100px therefore fire too late, and four parts break at 1024 (LAYOUT-03, 04, 05, 16).

**One rule:** a component that changes layout with width gets `container-type:inline-size` on its section, and its breakpoint becomes an `@container` query on the window's width. Where a media query must stay, add 304px to any content breakpoint between 901 and 1400px.

### 2. Two window shells
`ai/term.css` redraws the window with its own variables, `--tm-g`, `--tm-tb:42px`, `--tm-ph`, `--tm-sb` and `--tm-px:24px`, plus its own 248px panel rule, and it has drifted from `styles.css`'s `--os-*` (LAYOUT-07, 08, 21, 22).

**One rule:** define the window once (`--os-g:16px; --os-tb:44px; tab 32px; --os-w:272px; path 34px; status 28px`) and have `.tm` read those variables instead of its own copies.

### 3. Window geometry by page (exact, live)

| Pages | Width | Gap L/R/T/B | Title | Path | Status | Side panel | Radius | Notes |
|---|---|---|---|---|---|---|---|---|
| All 21 window pages (everything but /sig/ and /ai/) | 1440, 1024 | 16 / 16 / 16 / 16 | 44 | 34 | 28 | 272 | 12 | Bottom gap leaks while scrolling (01); tab hairline (08); top hairline missing (21) |
| …of which the fact sheets ×3 | 1440, 1024 | same | 44 | 34 | 28 | 272 | 12 | Panel head 32px, so every row is 12px higher (06) |
| /sig/, /ai/ | 1440 | 16 / 16 / 16 / 16 (document 901px in a 900px viewport) | **42** | 34 (text +24) | 28 | 272 | 12 | Tab **31**; places at the bottom (07) |
| /sig/, /ai/ | 1024 | same | **42** | 34 | 28 | **248** | 12 | (07) |
| All | 768 | 16 / 16 / 16 / 16 | 44 | 34 | 28 | drawer | 12 | Foot padding lost (02) |
| All | 390 | 0 | 52 | 34–75 (wraps) | hidden (≤700px) | drawer | 0 | 1px sideways scroll (22); a 52px title on phones exceeds the 44px token, as the CSS sets at l.877 |

The title bar's items are vertically centred at 1440: ring, name, domain, dots and "12 agents online" all have their centre at y=38, within ±0.5px. The path text's centre is y=76.5, the middle of its 34px line. The status-bar segments' icons and text are centred on y=870, within ±0.5px of their line boxes; see LAYOUT-26 for the optical exception.

### 4. Left edges at 1440 (offset from the window's inner left edge, x=289)

| Page | Main content edges | Stray |
|---|---|---|
| home | 40 (hero copy, all sections, foot) | hero plate labels 37 (23); strip row 2 at 62 at ≤1360px (16) |
| library | 40 | "What moved" band box at 0, label at 19 (11) |
| fact sheets ×3 | 40 | glance band content at 41 (10) |
| method, about, privacy, terms, weekly/1 | head 40, body **197** | two edges (09) |
| status, goals, goal-weight, compare, compare pair, weekly, founders | 40 | — |
| story | 40 (the hero copy column at 484 is its second column) | — |
| My Miracle / plan | 151 / 181 (centred columns, 880 / 820px) | foot at 40 |
| 404 | 40 | — |
| Ask Sig | 24 inside the chat pane | — |
| *at 1920, every page* | content 187 (story 287) | foot 40 (12) |

### 5. Vertical rhythm: one scale

| Gap | Values in use (1440) | Outliers to change | Standard |
|---|---|---|---|
| Path line → first line of the page head | 72 (doc-head, story), 70 (sheets), 130.7 (Library) | `.le-hero .kick` 30→32; `.lib-hero` min-height, padding-top 76→72 | **72px** |
| Head's last line → head rule | 64 (doc-head, Library), 44 (sheets), 88 (story) | `.le-hero .wrap` padding-bottom 44→64; `.sy-hero` 72/88 → 72/64 | **64px** |
| Head rule → first body line | 64 (`.doc`), 52 (`.pg-wrap`), 5 (sheet glance band), 22 (Library) | `.pg-wrap` padding-top 52→64; `.le-bl-wrap` 4→40 (10); `.lib-moves` margin-top 22→40 | **64px** (40 inside a band) |
| Section → section in a page | 52 (`.doc h2`), 56 (`.st-group`), 60 (`.pg-sec`, `.wk-get`), 68 (`.le-sec` 34+34) | `.doc h2` margin-top 52→56; `.pg-sec`, `.wk-get` 60→56; `.le-sec` padding 34→28 | **56px** |
| In-page heading → its content | 14 (`.doc`), 16 (`.le-sec`), 18 (`.wk-list`, `.st-rows`, `.fd-pairs`), 20 (`.pg-grid`) | `.doc p` margin 14→16 after an h2; 18 and 20 → 16 | **16px** |
| Section head (kicker + display h2) → content | 48 (story twelve), 40 (story prints, windows), 56 (Library explain), 60 (home steps, vs, rules) | 40, 56 and 60 → 48 | **48px** |
| Full-bleed band padding | 96 (story), 120 (home `.band`, Library explain), 130 (`.join-in`) | 120 and 130 → 96 (64 under 900px stays) | **96px** |
| Last content → foot | 110 (`.doc`, `.pg-wrap`, `.le-body`, `.lib-grid`), 48+24 (My, plan) | My and plan 72 → 110 | **110px** |

Why these values: 56px is the brief's example and the median of the four in-page values. It sits on the 4px grid, and the status tracker already uses it on 11 sections.

### 6. Card gutters: one value, the `stack` token (14px)

- 14px is already used by the Library grid, goal pages, founders, the story's prints and windows, and `.labs`.
- Change these to 14px:
  - 12px: `.st-rows` (status), `.pg-goal-grid` (goals, compare).
  - 16px: `.steps`, `.rules` and `.join-steps` (home); `.lib-explain .explain-grid` and its flow panel margin; `.le-glance-in`, `.le-left` and `.le-side` (sheets).
  - 10px: `.ai-starts`.
- Hairline grids at 1px (`.lib-stats`, `.sy-twelve`) are intended.

Every grid checked has equal horizontal and vertical gutters within itself, equal card heights per row, and last rows aligned to the columns with no stretched orphans. This holds for the Library index (3 columns at 1440, 2 at 1024), goals, compare, story twelve, prints and windows, home three ways, founders, status and goal-weight. The fault is only that the gutter value differs between pages.

### 7. Bands are not plates
`library.css` l.376 gives full-bleed sections (`.le-glance`, `.lib-moves`) the card treatment: border, 6px radius and card fill. A band that touches the window gets no border or radius of its own; it is set apart by its ground and by the hairline already above it (LAYOUT-10, 11).

### 8. Key and value: always on the first baseline
Compare rows, fact-sheet facts and any label/value pair should use `align-items:baseline`, never `center` or `start` (LAYOUT-15).

### 9. Plumbing that caused two findings

- `main` has `.win-body` on 18 pages but is plain `main#main` on home, privacy and terms.
- `.win-body{display:block}` silently overrides any page-specific `display`, as with the 404 (LAYOUT-13).
- Shorthands inside media queries (`.wrap{padding:0 20px}`) reset properties that earlier single-class rules set (LAYOUT-02).

**One rule:** give every page's main `.win-body` and leave `display` alone on it. Inside media queries, set only the longhand that changes.

### 10. Card padding is symmetric left/right everywhere, but varies by component
Measured left = right on every plate, card, table cell and the prompt: no asymmetry over 2px apart from the brand's own `.mh-pl`-style prompt (18/10) and icon-led inputs. The values vary: 20/20/18, 22, 26/28, 28/29/32, 30/30/32, 16/18 and 18/20. If the components lead standardises them, use the plate spec `24px 30px 26px` from `bundle.css` for plates and one compact value (20px) for list cards.
