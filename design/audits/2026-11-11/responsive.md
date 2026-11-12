# Phone and tablet: audit report

**State of the area:** the window folds into a phone well: the drawer opens, covers the page and closes properly, and no word breaks at 390. But every phone page scrolls 1px sideways, and phones lose "safety on" and the rules completely. On short or sideways phones the drawer cuts off its own bottom, and the window's controls are 20–32px targets. Between 901 and 1279px the side panel leaves the page narrower than it is at 768, yet the layouts add columns, so the fact sheets, story, compare pairs and home crush or split their text.

**How it was measured:** I checked the live pages with Playwright (Chrome) at 360, 375, 390, 430, 768, 1024 and, where useful, 1180 and 1280. For the drawer I also used 360×640, 375×667 and 844×390 (a phone held sideways). Every fix below was injected into the live page and measured again; anything taken from the CSS alone is marked "from the CSS". The scripts are in `/home/claude/design/work_resp/` and the evidence is in `/home/claude/design/evidence/responsive/` (paths below are relative to that folder).

One note on the capture: for the 10 long pages (home, library, both full fact sheets, method, status, goal-weight, compare-pair, story and privacy), the captured 390/768/1024 screenshots hold only the first screen. `crawl.py` clips without `full_page`. I took my own full-page captures instead.

**Overlaps with typography.md, so nothing is fixed twice:**
- The story ring's dot over the "12" is TYPE-15.
- The pills on /compare/ at 14.5px with no meter are TYPE-12.
- The 4-line status h1 at 390 is fixed by TYPE-01, which puts page h1s at 34px on a phone.
- The FAQ questions (23px on phones, because the 18px phone rule at styles.css:521 loses to :666) are fixed by TYPE-04 at 17.5px. Also delete the dead line 521.
- Card copy under 15px (`.lc-sum`, `.st-note`, `.st-label`, `.le-facts dd`) is TYPE-05.
- The "more" rows in mono are TYPE-06; RESP-06 covers only their height.

---

## Findings (most visible first)

### RESP-01 · high · Every phone page scrolls 1px sideways
- **Where:** 21 of 23 pages (all but /sig/ and /ai/) at every width up to 700px. scrollWidth is 361 at 360, 391 at 390 and 431 at 430.
- **Selector(s):**
  - styles.css:816 `.win-title::before{…left:-1px;right:-1px…}`: the strip that paints the gap above the title bar.
  - At 700px and below the title bar is full width with no gap, but styles.css:881 hides only `::after`. This 2px-tall box therefore ends at innerWidth + 1.
  - No element box crosses the edge; only this pseudo-element does.
- **Evidence:** before and after on all 21 pages at 3 widths are in `overflow-measurements.txt`. Ask Sig already hides both pseudo-elements (ai/term.css:387).
- **The rule it breaks:** README, The window: "On a phone: the window fills the screen."
- **Fix:** styles.css:881 `.win-title::after{display:none}` → `.win-title::before,.win-title::after{display:none}`.
- **Check:** scrollWidth equals innerWidth on every page at 360, 390 and 430.

### RESP-02 · high · On a phone the status bar is gone: no "safety on", no rules
- **Where:** all 22 windows at 700px and below, Ask Sig included.
- **Selector(s):**
  - styles.css:889 `.win-status{display:none}`.
  - ai/term.css:401 `.tm .tm-status{display:none}`, with `--tm-sb:0px` at term.css:384.
- **Evidence:**
  - At 390 every segment computes `display:none`: SIG, online, safety on, the sheet's facts, the rules and the Library date. "safety on" and "no doses · no sellers · no diagnosis" appear nowhere else on the phone page.
  - Widths at 390, measured in the page: SIG 62 + safety on 96 + rules 269 = 427px. That fits from 430px.
  - With the ring alone for SIG, 11px text and 8px cells, the three segments take 373px, which fits from 375px.
  - Without the SIG segment, 344px, which fits at 360.
  - Image: `phone-status-bar-proposal.jpg` shows the fix at 360 and 390, on a fact sheet, Home and Ask Sig.
- **The rule it breaks:**
  - README Principle 1: "'safety on' in every status bar".
  - Window: "Don't … leave the status bar's rules off a page".
  - StatusBar: "Phone: the status bar's segments drop to fit."
- **Fix:**
  - styles.css:889, in the 700px block, replace `.win-status{display:none}` with:
    `.win-status{bottom:0;margin:0;border-width:1px 0 0;border-radius:0;height:calc(28px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom)} .win-status::before{display:none} .ws{padding:0 10px} .ws-sig{border-bottom-left-radius:0} .win-status>.ws:not(.ws-sig):not(.ws-safe):not(.ws-rules){display:none} .ws-rules{display:inline-flex}`
  - After that block, add:
    `@media (max-width:429px){.win-status,.tm .tm-status{font-size:11px}.ws,.tm-sb{padding:0 8px}.ws-sig,.tm-sb-sig{font-size:0;gap:0}} @media (max-width:374px){.ws-sig,.tm-sb-sig{display:none}}`
  - Ask Sig, ai/term.css:384: `--tm-sb:0px` → `--tm-sb:28px`.
  - ai/term.css:401: replace `display:none` with `.tm .tm-status{bottom:0;border-width:1px 0 0;border-radius:0;height:calc(28px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom)} .tm .tm-status::before,.tm .tm-status::after{display:none} .tm-sb-state,.tm-sb-lib{display:none} .tm-sb{padding:0 10px} .tm-sb-sig{border-bottom-left-radius:0}`.
  - ai/term.css:404: `.tm .ai-dock{bottom:0…}` → `bottom:var(--tm-sb)`.
  - ai/term.css:402: add `- var(--tm-sb)` to `.tm .ai-chat` min-height.
- **Check:** at 360, 390 and 430 a 28px bar sits at the screen's foot on every page. It shows "safety on" and the three rules in full: 344, 373 and 427px used, nothing cut. From 375px it also shows the SIG segment. On Ask Sig the composer sits above the bar.

### RESP-03 · high · Fact sheets on tablets: the name splits mid-word, the facts are crushed, the print leaves an empty side
- **Where:** all 122 fact sheets:
  - from 901 to 1279px, so 1024 and 1180;
  - at 768 for the print.
- **Selector(s):**
  - library.css:406 `.le-print{float:right;width:260px;margin:0 0 18px 40px}`. It squeezes `.le-hero h1`, which is 65.5px at 1024 and carries library.css:131 `overflow-wrap:anywhere`.
  - library.css:142 `.le-glance-in`, two columns (single only at 900px and below, :283).
  - library.css:148 `.le-facts div{grid-template-columns:130px minmax(0,1fr)}`.
  - library.css:383 `.claims li{grid-template-columns:216px minmax(0,1fr)}` at 901px and up.
  - library.css:411–413: at 900px and below the print is 200px with `margin:0`.
- **Evidence:**
  - At 1024 the h1 renders "Semagluti / de"; creatine's renders "mono / hydrate" at 1024 and 1180.
  - In the facts card the values get 93px. "FDA-approved for diabetes, weight, heart, kidney, MASH" runs 8 lines, and the STRONG EVIDENCE badge ends 50px past the card's edge (badge right 675, card right 625).
  - The radar beside it is 235px, with 6px labels.
  - The risks' text is 180px wide at 1180.
  - At 768 the print sits alone at top left, with about 480px of empty plate beside it.
  - Images: `sheet@1024-h1-split.jpg`, `sheet@1024-glance.jpg`, `sheet@768-print-alone.jpg`. After the fix: `sheet@1024-top-after-fix.jpg`, `sheet@1024-glance-after-fix.jpg`, `sheet@390-top-after-fix.jpg`.
- **The rule it breaks:**
  - The brief: no breaking words, no columns too narrow.
  - illustration.md: "Always set a print with its name, its file, its count and its evidence".
- **Fix:** at the end of library.css (it must come after :383), add:
  `@media (max-width:1279px){.le-glance-in{grid-template-columns:1fr}.claims li{grid-template-columns:1fr;gap:10px}.le-print{float:none;width:auto;margin:0 0 24px;display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px;align-items:center}.le-print .print{width:200px;height:200px;margin:0}.le-print figcaption{margin-top:0}} @media (max-width:640px){.le-print{grid-template-columns:1fr;justify-items:center;gap:12px}}`
  TYPE-01's smaller h1 (34–48px) also stops the split. The print and glance changes are still needed for the crushed facts and the empty side.
- **Check:** at 768, 1024 and 1180, no word in `.le-hero h1` has two line boxes, and `.le-facts dd` is at least 500px wide. At 641–1279 the print sits beside its key; at 390 it is centred above it.

### RESP-04 · high · The drawer can't scroll: on short or sideways phones its bottom is cut off and the Library tree vanishes
- **Where:** every page at 360×640 and 375×667, and at 844×390 (a phone on its side, which still gets the drawer because it's under 900px).
- **Selector(s):**
  - styles.css:759 `.os-side{…overflow:hidden}`.
  - styles.css:777 `.os-ctx{flex:1 1 auto;min-height:0;…}`.
- **Evidence:**
  - The legal line ends at 651px on a 640px screen (home), and at 674px on the fact sheets. Wheel scrolling moves the drawer 0px.
  - At 844×390 only 2 of the 10 "more" links show whole (a third is cut at the edge). Sign in, Join, Privacy and Terms can't be reached.
  - The Library's folder tree in the drawer is 9px tall at 360×640 and 375×667, so it is invisible.
  - Images: `drawer-360x640-three-pages.jpg`, `drawer-sheet@844x390-landscape.jpg`. After the fix: `drawer-sheet-semaglutide@360x640-after-fix-scrolled.jpg`. Numbers are in `drawer-measurements.txt`.
- **The rule it breaks:** SidePanel: "the logo, the four places …, then what's in this window …, then the rest and the legal". Here the rest and the legal can't be reached.
- **Fix:** in the 900px block (styles.css:870), add `.os-side,.os.folded .os-side{overflow-y:auto;overscroll-behavior:contain}` and `.os-ctx{flex:0 0 auto;max-height:42dvh}`. Also add `.sg-side{overflow-y:auto;overscroll-behavior:contain}` in term.css's 900px block: Ask Sig's drawer is 2px short at 844×390.
- **Check:** at 360×640, 375×667 and 844×390, scrolling the open drawer brings `.os-legal` fully on screen. `.os-ctx` is at least 200px tall.

### RESP-05 · high · The window's own controls are under 40px on every page
- **Where:** every page at 390, and at 768 for the menu button.
- **Selector(s) and sizes at 390:**
  - `#os-menu` / `.win-menu`: 32×32 (styles.css:763). `#tm-menu`: 32×32 (term.css:436).
  - The drawer's close button `.os-fold` / `.sg-fold`: 32×32.
  - The tab `.win-tab`: 30px tall (styles.css:884). Its close button `.win-tabx`: 20×20 (:832).
  - The path crumbs `.wp-crumbs a`: 19px tall, and "~" (Home) is 7×19.
- **Evidence:** `tap-targets-390.txt`, which lists every control on all 22 pages.
- **The rule it breaks:** the brief's 40×40 minimum, and Apple's 44pt.
- **Fix:**
  - In the 900px block: `.win-menu,.os-fold,.tm-menu,.sg-fold{width:40px;height:40px}`.
  - In the 700px block: `.win-tab{height:40px}` `.win-tabx{width:32px;height:32px}` `.win-path{padding-top:0;padding-bottom:0;min-height:40px}` `.wp-crumbs{align-items:center}` `.wp-crumbs a{position:relative;display:inline-flex;align-items:center;min-height:40px}` `.wp-crumbs a::after{content:'';position:absolute;top:0;bottom:0;left:50%;width:max(40px,100%);transform:translateX(-50%)}`.
  - The 40px button also puts the menu icon's left edge at 16px (see RESP-13).
- **Check:**
  - At 390 the menu and close buttons are 40×40 and the tab is 40px tall.
  - Each crumb is hit 18px above, below, left and right of its centre.
  - Measured: the path line grows from 57 to 66px on a sheet; scrollWidth is unchanged.

### RESP-06 · high · Drawer rows and footer links are under 40px on every page
- **Where:** the drawer and the foot on every page at 390. The "more" rows are also short on desktop.
- **Selector(s) and sizes at 390:**
  - styles.css:781 `.os-more a{min-height:28px}`: 277×28, 10 per page.
  - :770 `.os-places a`: 36px.
  - :806 the tree's files and :801 its folders: 23px and 25px.
  - :786 `.os-signin`: 43×14.
  - :788 `.os-legal a`: 33–40×17.
  - :761 `.os-logo`: 63×30.
  - :398 `.foot-links a`: 20px tall, 16 per page, 8px apart.
  - Ask Sig's drawer: `.sg-site a` 34px, `.sg-signin` 14px, `.sg-legal a` 17px.
- **Evidence:** `tap-targets-390.txt`.
- **The rule it breaks:**
  - tokens.json `row`: 36px, "A row of the side panel; a place or a menu item".
  - SidePanel: "rows are `row` tall".
  - The brief's 40px.
- **Fix:**
  - styles.css:781 `min-height:28px` → `36px`, at every width.
  - In the 900px block: `.os-places a,.os-more a,.sg-site.os-places a,.sg-open{min-height:40px}` (Ask Sig's rows need `.sg-site.os-places a` to beat styles.css:770) `.os-ctx .lt-files a,.os-ctx .lt-dir{padding-top:10px;padding-bottom:10px;line-height:20px}` `.os-signin,.os-legal a,.sg-signin,.sg-legal a{display:inline-flex;align-items:center;min-height:40px}` `.os-logo,.sg-logo{padding:9px 0}`.
  - In the 700px block: `.foot-links{gap:0 20px}` `.foot-links a{display:inline-flex;align-items:center;min-height:40px}`.
- **Check:** with the drawer open at 390, every link in it is at least 40px tall. Measured on a sheet: places, "more", Sign in, legal, logo and the tree's files and folders all 40px. On Ask Sig: places, Sign in, legal and logo all 40px. Each foot link is 40px tall.

### RESP-07 · high · Compare pairs: the text beside each badge runs off the page and over the other column
- **Where:** all 12 /compare/<pair>/ pages from 360 to 1279px (measured on 4; the other 8 use the same rules).
  - scrollWidth reaches 1043 at 1024 and 779 at 768 (semaglutide pair), and 1091 and 827 on the BPC-157 pair.
  - On the BPC-157 pair it reaches 391 at 360.
- **Selector(s):**
  - pages.css:78 `.cmp-list li{display:flex}`, with :80 `.cmp-list .ev,.cmp-list .hc{flex:none}` (nowrap badges, 150–210px).
  - The text `<span>` keeps `min-width:auto`.
  - pages.css:68 `.cmp-row{grid-template-columns:200px minmax(0,1fr) minmax(0,1fr)}`.
- **Evidence:**
  - The longest-text column is 64–86px at 768–1180, with one or two words a line. At 390 it is 133px, two or three words a line.
  - At 768 and 1024 the text runs under the second column's badge and past the window's edge.
  - Images: `compare-pair@1024-squeezed.jpg`, `compare-pair@768-squeezed.jpg`, `compare-pair@390-list.jpg`. After the fix: `compare-pair@1024-after-fix.jpg`, `compare-pair@390-after-fix.jpg`. Numbers are in `overflow-measurements.txt`.
- **The rule it breaks:** the window fills the screen; text is never cut or overlapped.
- **Fix:**
  - pages.css:78 → `.cmp-list li{display:flex;flex-direction:column;align-items:flex-start;gap:6px}`.
  - Add `@media (min-width:761px) and (max-width:1279px){.cmp-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 28px}.cmp-k{grid-column:1/-1}.cmp-names .cmp-k{display:none}}`.
- **Check:** scrollWidth equals innerWidth at 360–1440 on every pair. The longest-text column is at least 286px (measured 286–399).

### RESP-08 · high · Story hero on tablets: the headline is crushed into a narrow column and clipped at 1024
- **Where:** /story/ from 761 to 1279px.
- **Selector(s):** styles.css:939 `.sy-hero-in{grid-template-columns:minmax(0,380px) minmax(0,1fr)}`. It stacks only at 760px and below (:1003). The h1 is sized from the screen (:945, `5.6vw`), not from its column.
- **Evidence:**
  - At 1024 the copy column is 194px and the h1 (57px) runs 7 lines. "checked." spills past the column and is clipped by the window's edge.
  - At 768: 250px, 6 lines. At 1180: 350px, 6 lines. The two buttons stack.
  - Images: `story@1024-hero.jpg`, `story@768-hero.jpg`.
- **The rule it breaks:** the brief: a headline of 4 or more lines is too big for its space; text is never cut.
- **Fix:** move `.sy-hero-in{grid-template-columns:1fr;gap:36px}` from the 760px block (:1003) into a new `@media (max-width:1279px){…}` placed after :1001. The h1's size per TYPE-08.
- **Check:** the h1 is 3–4 lines at 768, 1024 and 1180 (measured 3, 4 and 4), and nothing spills past its column.

### RESP-09 · medium · Home and the Library on tablets: cards and keys crushed to one word a line
- **Where:** Home and the Library, from 901 to 1279px.
- **Selector(s):**
  - styles.css:246 `.steps` keeps three columns down to 900px (:490).
  - :319 `.rules` keeps four columns down to 1100px (:434).
  - library.css:112 `.lib-explain .explain-grid` keeps two columns down to 900px (:284).
- **Evidence:**
  - At 1024 Home's three step cards are about 200px each, and "How one report is read" sits one word a line in 50px.
  - At 1180 the four rules cards sit side by side with 129px of text width each: "Let the numbers be gamed" takes 4 lines.
  - At 1024 the Library's grade key gives its descriptions 16–66px beside the pills.
  - Images: `home@1024-steps.jpg`, `home@1180-rules.jpg`, `library@1024-grade-key.jpg`.
- **The rule it breaks:** the brief: no two columns too narrow, no one word a line.
- **Fix:** in styles.css add `@media (max-width:1279px){.steps{grid-template-columns:1fr}.rules{grid-template-columns:repeat(2,minmax(0,1fr))}}`. In library.css add `@media (max-width:1279px){.lib-explain .explain-grid{grid-template-columns:1fr}}`.
- **Check:** with these rules and the RESP-03, RESP-07 and RESP-08 blocks, a wrap check at 768, 1024 and 1180 finds no block at about one word a line and no split word. (I measured that; only the story h1's forced line breaks remain.)

### RESP-10 · medium · Status page at 1024: one column of 638px cards, 32,000px long
- **Where:** /status/ from 901 to 1099px.
- **Selector(s):**
  - pages.css:52 `.st-rows{grid-template-columns:repeat(auto-fill,minmax(330px,1fr))}`. Two columns need 672px, but the window gives 515–713px when the side panel is open. So 768 gets two columns and 1024 gets one.
  - pages.css:55 `contain-intrinsic-size:auto 320px`.
- **Evidence:**
  - With every row rendered, the page is 32,376px at 1024, against 26,885 at 768 and 20,057 at 1440.
  - The captured 48,710 is the 320px placeholder on single-column rows that really render at 201–294px. The scroll bar jumps as they render.
  - Image: `status@1024-one-column.jpg`.
- **The rule it breaks:** the brief: no grid collapsing oddly. 1024 gets fewer columns than 768.
- **Fix:**
  - pages.css:52 `minmax(330px,1fr)` → `minmax(min(100%,300px),1fr)`.
  - pages.css:55 `auto 320px` → `auto 360px`. Rendered rows run 338–431px in two columns.
- **Check:** 2 columns at 1024 (28,790px). 768 (2), 1100 (2), 1280 (2) and 1440 (3) are unchanged.

### RESP-11 · high · On tablets the status bar drops the rules but keeps the page's facts
- **Where:** every page from 701 to 1100px, so 768 and 1024.
- **Selector(s):** styles.css:865 `.ws-rules,.ws-sheet{display:none}`.
- **Evidence:**
  - On Home at 768 the bar reads "SIG · online · safety on · Library · Nov 7, 2026", with no rules.
  - The rules fit. SIG, online, safety on and the rules take 518px, and 659px with a sheet's evidence, against a bar of 667px at 701, 734px at 768 and 718px at 1024.
  - Ask Sig shows them at 768.
  - Image: `story@768-hero.jpg` (the bar at its foot).
- **The rule it breaks:**
  - Window: "Don't … leave the status bar's rules off a page".
  - StatusBar: the order is SIG, state, the page's facts, then the rules. The facts drop first.
- **Fix:**
  - styles.css:865 → `.ws-lib,.ws-sheet,.ls-sig,.ws-src{display:none}`.
  - In scripts/build_library.mjs, give the sources segment (`<span class="ws">10 sources</span>`, written beside line 226) the class `ws-src`.
  - CSS-only alternative, verified: `.win-status>.ws:not([class*='ws-']):not([class*='ls-'])`.
- **Check:** at 701, 768, 900, 1024 and 1100, the rules show on every page and the segments total no more than the bar's width.

### RESP-12 · medium · Sticky parts stick under the title bar
- **Where:**
  - The compare pairs' names row, from 761px.
  - Home's FAQ heading, from 901px.
  - The fact sheets' side column, from 1101px.
- **Selector(s):** `--top-h` is 0px inside the window, but each of these sticks at an offset from it:
  - pages.css:69 `.cmp-names{top:var(--top-h)}`.
  - styles.css:333 `.faq-head{top:calc(var(--top-h) + 40px)}`.
  - library.css:256 `.le-side{top:calc(var(--top-h) + 24px)}`.
- **Evidence:**
  - At 1024 the names row sticks at 0, hidden behind the title bar (16–60px). Only "Also called…" peeks out.
  - The FAQ kicker "QUESTIONS" sticks at 40px, under the bar.
  - `.le-side` sticks at 24px at 1440.
  - Images: `compare-pair@1024-squeezed.jpg` (top), `home@1024-faq-head-under-title-bar.jpg`.
- **The rule it breaks:** The window: the title bar stays at the top, and nothing should hide under it.
- **Fix:** use the window's offset, `--os-top` (gap plus title bar):
  - pages.css:69 → `top:var(--os-top,var(--top-h))`.
  - styles.css:333 → `top:calc(var(--os-top,var(--top-h)) + 24px)`.
  - library.css:256 → `top:calc(var(--os-top,var(--top-h)) + 24px)`.
- **Check:** stuck, `.cmp-names` top is 60px, the FAQ kicker 84px and `.le-side` 84px, each below the title bar's bottom (60px).

### RESP-13 · medium · Side padding on a phone is five different values
- **Where:** every page at 390. Also at 768 for My Miracle and Plan.
- **Selector(s):**
  - Page and foot: `.wrap{padding:0 20px}`, styles.css:466.
  - Path: `.win-path{padding:6px 16px}`, :887.
  - Ask Sig: `--tm-px:14px`, term.css:384.
  - My Miracle: `.my-wrap`, my.css:81, 16px. Plan: `.plan-wrap`, ai/plan.css:163, 16px. At 768 both use 24px (my.css:6, plan.css:150).
  - Title bar: padding 8/10px, with the menu icon's left edge at 12px.
  - Home's graph plate: `.net{margin:12px 12px 0}`, :445, edges at 12px.
- **Evidence:**
  - At 390 the left edges are 12 (menu icon and graph plate), 14 (Ask Sig), 16 (path, My Miracle, Plan) and 20 (every other page and the foot). On My Miracle and Plan the page sits at 16 and the foot at 20.
  - At 768 they are 20, 20 and 24.
  - Left and right are equal on each part.
  - `side-padding-390.txt`; `side-padding-12-16-20-sheet@390.jpg` shows 12, 16 and 20 side by side.
- **The rule it breaks:**
  - tokens.json `pad`: "The page's side padding inside the window … (12px on a phone)". The site uses 12px nowhere for text.
  - README Principle 4: one window everywhere.
- **Fix:** one phone value, 16px. That is already the path's; the 3-up image shows 12px reads tight beside 16px body text.
  - In the 700px block: `.wrap{padding:0 16px}` and `.net{margin:12px 16px 0}`.
  - term.css:384 `--tm-px:14px` → `16px`.
  - my.css:81 and plan.css:163: keep 16px but move them into `@media (max-width:700px)`. Add `@media (max-width:900px){.my-wrap,.plan-wrap{padding-left:20px;padding-right:20px}}`.
  - Title bar: RESP-05's 40px menu button puts its icon at 16px.
  - Then set tokens.json `pad` to "(16px on a phone)". Or, if the brand's 12px must hold, use 12 in every one of these places.
- **Check:** at 390 the menu icon, path text, page text, cards, foot and Ask Sig all start 16px in and end 16px from the right. At 768 every page uses 20px.

### RESP-14 · medium · "What moved this week" runs edge to edge of the window
- **Where:** /library/ at every width, whenever the box shows.
- **Selector(s):** `section.wrap.lib-moves`. Here library.css:335 `.lib-moves{padding:14px 18px}` replaces `.wrap`'s side padding but keeps `width:100%`, so its border lands on the window's sides.
- **Evidence:**
  - The box spans 0–390 at 390, while the search box below spans 20–370.
  - It spans 17–751 at 768 against 37–731, and 289–1007 at 1024 against 329–967.
  - Image: `library@390-moves-box.jpg`.
- **The rule it breaks:** tokens.json `pad`: every block sits inside the page's side padding.
- **Fix:** library.css after :335, add `.wrap.lib-moves{width:calc(100% - 80px);max-width:1240px}` and `@media (max-width:900px){.wrap.lib-moves{width:calc(100% - 40px)}}`. If RESP-13 lands, add `calc(100% - 32px)` at 700px and below.
- **Check:** the box's edges equal the search box's at 390, 768, 1024 and 1440 (measured identical).

### RESP-15 · medium · Figures: the radar's labels run 6 to 16px, the Signal figure's run 5–7px
- **Where:**
  - Every fact sheet's "What it's used for" radar.
  - The Library's "how a Signal is made" figure, at 390, 768 and 1024.
- **Selector(s):**
  - library.css:48 `.radar .rd-label{font:500 10.5px …}`, in SVG units on a 410-wide viewBox drawn at whatever the column gives.
  - library/signalviz.js draws its labels at 7–9.5 units (lines 90, 99, 108, 132, 134, 144–147, 163, 212, 253, 286–287) on 360- and 760-wide viewBoxes.
- **Evidence:**
  - Radar labels render 7.7px at 390 (302px wide), 16.2px at 768 (632px wide, filling the column), 6.0px at 1024 (235px) and 11.1px at 1440.
  - The Signal figure's smallest text renders 5.9px at 390, 6.7px at 768 and 6.1px at 1024 ("IN 0 SIGNALS", "100% FORUMS", the formula).
  - Images: `sheet@1024-glance.jpg`, `sheet@768-radar.jpg`, `library@390-flowviz.jpg`, `library@1024-flowviz.jpg`. `sheet@390-radar-labels-now-vs-15.jpg` shows the radar's labels at 15 units, with no collisions.
- **The rule it breaks:**
  - tokens.json `label` 11.5px.
  - The brief's 11px minimum for labels.
  - illustration.md: figures drawn from data must be readable where they are read.
- **Fix:**
  - Radar: library.css:48 `10.5px` → `15px` (SVG units, 11px at 302px and 15.4px at 420px). Add `.le-radar .radar-box{max-width:420px;margin:12px auto 0}`.
  - Signal figure: in library/signalviz.js, raise every label to at least 13 units in the compact figure (drawn about 304px for a 360 viewBox), and at least 15 in the wide one (drawn 578px at 1024 for a 760 viewBox). Re-space the boxes to fit. Not yet tried live.
- **Check:** the smallest rendered text in `svg.radar` and `svg.flowviz` is at least 11px at 390, 768 and 1024. The radar is 302–420px wide.

### RESP-16 · medium · Text that shrinks below 11px only on phones
- **Where:** Home, the fact sheets and Ask Sig, at 700px and below.
- **Selector(s):**
  - lib/graph.js:751 `const fs = K < 0.8 ? 9.5 : 11`: the hero graph's labels and its "Ask Sig about …" chip drop to 9.5px on a phone.
  - styles.css:459 `.net-bar{font-size:10px}` and :461 `.net-foot{font-size:10px}` ("Plate 01", "1,183 nodes", "Tap any dot to trace it").
  - ai/term.css:412 `.ptag,.ctag{font-size:10px}`: the label over each part of an answer (from the CSS).
  - kit/kit.css:99 `.mh-bm-dir{font-size:10px}`.
  - Running copy still under 15px that TYPE-05 doesn't reach: the foot's disclaimer `.foot-row>p` at 14px (styles.css:392, on 21 pages; it carries the 988 crisis line), and Ask Sig's `.agent-what` at 13.5px (ai/ai.css:94).
- **Evidence:** the 390 capture data: `.net-ask` 9.5px, `.net-n` and `.nf-hint` 10px, `.mh-bm-dir` 10px, the foot disclaimer 14px on 21 pages. Image: `home@390-graph-labels.jpg`.
- **The rule it breaks:**
  - tokens.json `label` and `status` 11.5px. Framed tags go no smaller than 10.5px (typography's scale).
  - tokens.json `body-app` 15px.
- **Fix:**
  - lib/graph.js:751 → `const fs = 11;`.
  - styles.css:459 and :461 `font-size:10px` → `11px`.
  - Delete ai/term.css:412.
  - kit.css:99 `10px` → `11px`.
  - In the 700px block: `.foot-row>p{font-size:15px}`. ai.css:94 `13.5px` → `15px`.
- **Check:** at 390 no visible text on Home, the sheets or Ask Sig is under 11px, and the foot disclaimer is 15px.

### RESP-17 · medium · The method table shows 2 of its 5 columns on a phone, with no cue
- **Where:** /method/ at 390 (and 26px hidden at 768).
- **Selector(s):** styles.css:541 and :543: `.method .mtable-wrap{overflow-x:auto}` holding `.mtable{min-width:720px}`.
- **Evidence:**
  - At 390, 350px of 720 show: Use, Improved anyway and a sliver of "How it was measured", cut mid-word.
  - Confidence and Sources are entirely off screen.
  - Image: `method@390-table-now-vs-stacked.jpg`, now and with the fix.
- **The rule it breaks:** the brief: tables not squeezed and nothing cut. The brand allows no gradient, so a fade cue isn't an option.
- **Fix:** after styles.css:555, add:
  `@media (max-width:640px){.method .mtable-wrap{overflow:visible;border:0;border-radius:0;background:none}.method .mtable-wrap .mtable{min-width:0}.method .mtable-wrap thead{display:none}.method .mtable-wrap tbody{display:grid;gap:10px}.method .mtable-wrap tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;padding:16px;border:1px solid var(--line);border-radius:6px;background:var(--white)}.method .mtable-wrap th,.method .mtable-wrap td{padding:0;border:0}.method .mtable-wrap td:nth-child(3),.method .mtable-wrap td:nth-child(5){grid-column:1/-1}}`
- **Check:** at 390 every cell of every row is on screen (each row is a card: use and figure, then the measure, then confidence and sources). scrollWidth is 390.

### RESP-18 · medium · The page behind the drawer scrolls, and Tab walks out of the drawer
- **Where:** every page with the drawer open, from 360 to 900px.
- **Selector(s):** there is no scroll lock and nothing is made inert. lib/os.js:28 `open()` only adds `.drawer` and unhides the scrim.
- **Evidence:**
  - One 500px swipe over the scrim scrolled the page behind by 500px on every page tested.
  - After the drawer's last item, Tab lands on `a.win-tab` behind the scrim. On Ask Sig it lands on the textarea.
  - Escape, tap outside and focus return all work.
  - `drawer-measurements.txt`.
- **The rule it breaks:** README: the side panel "slides in from the menu button … Escape or a tap outside closes it". The page behind should hold still and stay out of reach while it is open.
- **Fix:**
  - In styles.css add `:root:has(#os.drawer){overflow:hidden}`. Verified: the page then moves 0px.
  - In lib/os.js:28 `open()` add `document.querySelector('.os-main').inert = true;`, and in `close()` (:31) `… = false;`.
  - In ai/ai.js, openDrawer and closeDrawer, do the same for `.sg-main`.
- **Check:** with the drawer open, swiping the scrim leaves scrollY unchanged, and Tab cycles only through the drawer.

### RESP-19 · medium · Tap targets on the pages themselves under 40px
- **Where and sizes at 390:**
  - Fact sheets: refs `a.ref` 18×18 (41 on semaglutide, library.css:30); body-map sources `.mh-bm-src` 24×24 and markers `.mh-bm-mk` 24px tall (kit.css:92, :95); `.bl-how` "How these are made" 298×15.
  - Status and goals: chips `.pg-jump a` and `.pg-goals a`, 38px (pages.css:45, :30). The Library's chips are 44px.
  - Home: search button `.hp-go` 36×36 (styles.css:700).
  - Ask Sig: tab `.tm-tabopen` 28px tall, `+` `.tm-plus` 28×28, "Delete all chats" `.sg-wipe` 32px.
- **Evidence:** `tap-targets-390.txt`; `asksig@390-tabbar-after-fix.jpg`.
- **The rule it breaks:** the brief's 40px. `.lib-chips button`, `.hero-try a` and `.btn.sm` are already 44px.
- **Fix:**
  - `.pg-jump a,.pg-goals a{min-height:44px}`. `.hp-go{width:40px;height:40px}`. `.bl-how{display:inline-flex;align-items:center;min-height:40px}`.
  - `.ref{min-width:24px;height:24px;margin-left:4px}`, matching `.mh-bm-src`. Inline refs can't reach 40px without overlapping lines; 24px with spacing is WCAG 2.5.8's minimum.
  - Ask Sig, in the 700px block: `.ai{--tm-ph:44px}` `.tm .ai-bar .tm-tab{height:40px}` `.tm-plus{width:40px;height:40px}`. In the 900px block: `.sg-wipe{min-height:40px}`.
- **Check:** measured after: chips 44px, search button 40×40, "How these are made" 40px, refs 24×24, Ask Sig's tab and `+` 40px. scrollWidth is unchanged.

### RESP-20 · medium · Fact-sheet facts at 390: a 96px label column crushes the values
- **Where:** every fact sheet at 640px and below.
- **Selector(s):** library.css:299 `.le-facts div{grid-template-columns:96px minmax(0,1fr)}`.
- **Evidence:**
  - Values get 194px.
  - "FDA-approved for diabetes…" breaks at its hyphen ("FDA- / approved") right after the FDA-APPROVED badge, over 5 lines.
  - Labels wrap ("MOSTLY USED / FOR").
  - Image: `sheet@390-facts.jpg`.
- **The rule it breaks:** the brief: labels breaking, values squeezed.
- **Fix:** library.css:299 → `.le-facts div{grid-template-columns:1fr;gap:4px}` (label over value).
- **Check:** at 390 each `dd` is 302px wide, and US status runs 4 lines with "FDA-approved" whole.

### RESP-21 · low · The compare pair's tab name is cut while the title bar has room
- **Where:** /compare/<pair>/ at every width.
- **Selector(s):** styles.css:826 `.win-tab{flex:0 1 200px}` caps the tab at 200px.
- **Evidence:** "semaglutide-vs-tirzepatide.diff" shows 163 of 223px with an ellipsis, with 246px free at 768 and 29px at 390. Image: `compare-pair@768-squeezed.jpg` (title bar).
- **The rule it breaks:** Window: tabs are named like files. Here the file's name is cut for no reason.
- **Fix:** styles.css:826 `flex:0 1 200px` → `flex:0 1 auto;max-width:320px`.
- **Check:** the full name at 768, 1024 and 1440 (223/223), and 192/223 at 390, where the bar has no room.

### RESP-22 · low · Story run log: "interpretation" overflows its column and covers its ✓
- **Where:** /story/ at 760px and below. Ask Sig's run log has the same 11ch column on phones (from the CSS).
- **Selector(s):**
  - styles.css:1009 `.sy-log li{grid-template-columns:18px 11ch 12px minmax(0,1fr)}`: 11ch is 76px, and "interpretation" is 96px.
  - ai/term.css:413 `.tm .tstep{grid-template-columns:18px 11ch 10px …}`, where it is cut to "interpret…".
- **Evidence:** line 12 shows "interpretation" running into the ✓ column. Image: `story@390-runlog.jpg`.
- **The rule it breaks:** the brief: no overlapping text.
- **Fix:** both `11ch` → `14ch`.
- **Check:** every `.sl-who` fits (scrollWidth ≤ clientWidth); the text column is 152px at 390.

### RESP-23 · low · Home's strip: the wrapped second row starts 22px in, after a stray divider
- **Where:** Home from 641 to 1100px.
- **Selector(s):** styles.css:722–727 `.strip-in span{padding:0 22px;border-right:…}`. Only `:first-child` loses its left padding.
- **Evidence:** at 768 the rows start at 37 and 59px, with a divider ending row one. Image: `home@768-strip.jpg`.
- **The rule it breaks:** symmetric alignment on one left edge.
- **Fix:** add `@media (min-width:641px) and (max-width:1100px){.strip-in{display:grid;grid-template-columns:repeat(2,max-content)}.strip-in span:nth-child(odd){padding-left:0}.strip-in span:nth-child(even){border-right:0}}`. This assumes all four spans show.
- **Check:** both rows start at the same x (37 at 768, 329 at 1024), with one divider per row.

### RESP-24 · low · Wrapped `.vs-act` keeps its right alignment
- **Where:** Home's example, and every fact sheet's bottom line, from 641 to 1279px.
- **Selector(s):** styles.css:303 `.vs-act{…align-items:flex-end}`.
- **Evidence:** "As it stood in November 2026" and "How these are made" sit 21px and 31px in from the button's left edge, once `.vs-foot` wraps the block below the text. Image: `home@768-vs-foot.jpg`.
- **The rule it breaks:** one left edge per block.
- **Fix:** add `@media (min-width:641px) and (max-width:1279px){.vs-act{align-items:flex-start}}`.
- **Check:** the button and the line under it share their left x (62 at 768, 371 on the sheet at 1024).

### RESP-25 · low · Library filters at 390: three selects on three different left edges
- **Where:** /library/ at 640px and below.
- **Selector(s):** library.css:88 `.lib-filters label{display:inline-flex}`, with labels of different widths.
- **Evidence:** the selects start at 59, 89 and 59px and are 231, 199 and 182px wide. Image: `library@390-filters.jpg`.
- **The rule it breaks:** consistent, symmetric alignment.
- **Fix:** add `@media (max-width:640px){.lib-filters label{display:grid;grid-template-columns:76px minmax(0,1fr);width:100%}.lib-filters select{width:100%}}`.
- **Check:** every select starts at 104px and is 266px wide.

### RESP-26 · low · Search placeholders are cut mid-word on a phone
- **Where:** Home and /library/ at 390.
- **Selector(s):** styles.css:697 `.hero-search.hp input` and library.css:80 `.lib-search input` clip their placeholders.
- **Evidence:** "look up BPC-157, semaglutid" and "Search by name, brand or nickna". Images: `home@390-search-placeholder.jpg`, `library@390-search-placeholder.jpg`.
- **The rule it breaks:** the brief: text cut off.
- **Fix:** add `.hero-search.hp input,.lib-search input{text-overflow:ellipsis}`.
- **Check:** computed `text-overflow` is `ellipsis`; the placeholder ends in "…" at 390.

### RESP-27 · low · Study meta lines have no line height
- **Where:** every fact sheet's studies, wrapping to 2–3 lines at 390.
- **Selector(s):** library.css:234 `.st-meta{font:500 11px var(--mono)}`. The shorthand resets line height to `normal`, about 12px.
- **Evidence:** "17,604 adults aged 45 or older with heart disease…" sets three capital lines almost touching. Image: `sheet@390-study-meta.jpg`.
- **The rule it breaks:** tokens.json `label` and `data` set a 1.4–1.5 line height for mono text that wraps.
- **Fix:** library.css:234 → `font:500 11px/1.5 var(--mono)`.
- **Check:** `.st-meta` computes line height 16.5px.

### RESP-28 · low · Ask Sig's title bar differs from every other window's
- **Where:** /sig/ at every width.
- **Selector(s):**
  - ai/term.css:22 `--tm-tb:42px`, against `--os-tb:44px` on the site.
  - term.css:388 `.tm-logo{width:30px;height:30px}` at 700px and below, against an 18px ring in every other title bar.
- **Evidence:** the title bar is 42px at 768 and 1024, against 44px. At 390 Ask Sig's ring is 30px and the Library's is 18px. Image: `asksig-vs-site-title-bar@390.jpg`.
- **The rule it breaks:**
  - tokens.json `title-bar` 44px.
  - Window: "Sig's ring at 18px".
  - Principle 4: the same title bar on every page.
- **Fix:** term.css:22 `--tm-tb:42px` → `44px`. Delete term.css:388.
- **Check:** at 768 and 1024 every title bar is 44px, and at 390 every title-bar ring is 18px.

---

## Systemic

1. **One tablet band, 901–1279px. Lay out the page against the window, not the screen.**
   - From 901px the side panel and the window's frame take 306px, so the page at 1024 (638px of content) is narrower than at 768 (694px). Yet the layouts switch at the screen widths they had before the window existed (760, 900 and 1100px), so 1024 gets more columns in less room.
   - That one cause is behind RESP-03, 07, 08, 09 and 10.
   - Standardise on 1279px as the last width where any page layout is single column or stacked, as the blocks above do.
   - Better: give `main.win-body` `container:win/inline-size`. Then turn the page-layout `@media (max-width:…)` rules (not the shell's) into `@container win (max-width:…)`, and turn `vw` in clamps into `cqi`.
   - Why: the window is the page's real width on every surface, so a layout written once fits the panel open, folded or as a drawer.

2. **One minimum target: 40px for every control at 900px and below, and the `row` token (36px) for side-panel rows everywhere.**
   - Today the window's own controls are 32, 30, 28, 20 and 14px (RESP-05, 06, 19).
   - Chips are 38 on two pages and 44 on two others: make them 44, which is `.btn.sm` and the Library's chips.

3. **One status bar, with one order for dropping segments, on the site and in Ask Sig.**
   - Keep the white SIG segment, "safety on" and the rules. Drop the state first, then the page's facts.
   - On the smallest phones the SIG word goes to the ring alone, then the segment.
   - Today it vanishes on phones and drops the rules first on tablets (RESP-02, 11).

4. **One phone side padding: 16px for the title bar's first icon, the path, the page, cards, the foot and Ask Sig; 20px from 701 to 900px.**
   - Today it is 12, 14, 16 and 20 (RESP-13), with one box at 0 (RESP-14).
   - Record it in tokens.json `pad` so the community and the site agree.

5. **Sticky offsets come from the window.** Anything sticky inside `.win` uses `var(--os-top)`, never `--top-h`, which is 0 there (RESP-12).

6. **Figures keep a readable floor.** SVG text is set in viewBox units, so it shrinks with the column. Every drawn figure needs a minimum rendered label of 11px and a width cap, so it neither shrinks to 6px nor swells to 16px (RESP-15, RESP-16's graph labels).

---

**Seen outside my area, reported here so it isn't lost:**
- The story ring spins (styles.css:941 `.sy-ring svg{animation:sy-turn 60s linear infinite}`). illustration.md says of the ring: "It never spins."
- At 1180 and 1280, Ask Sig's agent roster cuts every agent's line to 114px with an ellipsis (`.tm-now`, term.css:371).
