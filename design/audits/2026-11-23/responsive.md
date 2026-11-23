# Phone and tablet: audit report (November 23)

**The state of the area, in one line:** on phones and tablets the frame mostly holds. No page in either app is wider than the screen at any of 12 widths. Every drawer works. The logo and the u icon are the same files in both apps. The weekly email holds at 390. But three places turn into a different product on a small screen:
- How it works' main section runs into the right edge.
- Ask Sig drops the Unhyped logo under 901px.
- The community's bar loses the search up to 860px, where the website's keeps it.

A layer of older or off-floor details sits under those: Ask Sig's app icon in the old lime and graphite, 10px labels, 5px figure labels, two blue actions on the community's Quests.

**How it was measured:**
- **What I opened:**
  - every website page in `design/pages.json`;
  - the community's 15 screens, signed in as a new member the way `/tmp/sx/comm_capture2.py` does (birth year, phone, code, handle, three spaces);
  - the sign-in screen.
- **How:** Playwright for Python with Chrome. At 768 and under I emulated touch (`has_touch`, `is_mobile`). Motion was reduced and every page was scrolled through once, so cards that draw in were whole.
- **Widths:**
  - the capture's 1440, 1024, 768 and 390;
  - for overflow, also 360, 430, 600, 820, 900, 960, 1180 and 1280 (the community at 360, 600, 860 and 1180);
  - fixes at 360, 600, 800, 880 and 1200.
- **Panel heights:** 1440×900, 1440×790 and 1280×720.
- **Drawers:** 390×844, 768×1024, 1024×768, 1440×900, 360×640 and 844×390.
- **Verification:** every fix marked **verified** was injected into the live page (`bypass_csp`) and measured before and after. Fixes in markup, JavaScript or assets say **not verified**.
- **The restart:** the website was measured on 8765 before the restart, then the final checks were re-run against the frozen copy (`/tmp/sx/site-frozen`). They gave the same values. File:line citations are the frozen copy's; the community's are `/home/claude/miracle-health-community`.
- **Where everything is:**
  - scripts and raw results: `.design/work/design-responsive/r1123/`;
  - per-page sweeps: `live/*.json` and `clive/*.json`;
  - images: `.design/evidence/design-responsive/`.
- **Severity:** as in the brief (high breaks a layout or shows on many templates). Findings are ranked by how visible they are on a phone.

## What holds (checked)

- **Overflow:** none.
  - Website: 24 pages × 12 widths.
  - Community: 16 screens × 8 widths.
- **Words:** no word breaks mid-letter anywhere in either app, only at hyphens. Text is cut only where an ellipsis is meant (search placeholders, tab names), except RESP-01, RESP-19 and RESP-25.
- **The drawer:**
  - **Where:** the website (front page, a fact sheet, privacy, 404, My stack, How it works), Ask Sig and the community, at the six sizes above.
  - **What it does:**
    - it is a 300px drawer over the page and its bars: the scrim is what lies under the bar's right end and the page's middle;
    - focus moves into it and the page behind is inert;
    - a 500px wheel moves the page 0px;
    - Escape closes it and gives focus back to the menu button;
    - a tap on the scrim closes it, and so does its own button;
    - on short and sideways phones it scrolls to its legal line;
    - the community's Sig button stays under the scrim (z 35 under 47) and inert.
  - **Exception:** RESP-27. The community's only escape is the preview's banner, which is not on the live app.
- **The bars, as built:**
  - **Website at 390 (56px):** menu 40×40, logo 109×20, search icon 40×40, Ask Sig's ring 40×40, Join 57×44 (white).
  - **Website at 768 (60px):** menu 40×40, logo, a 300px search box with its key hint, "Ask Sig" with its ring, Join. The four sections come in from 1100px.
  - The bar is identical on every website page at each width.
  - **Ask Sig:** see RESP-02. At 390 a 52px bar (menu, ring, "Sig") over a 44px tab row ("New chat" 102×40, + 40×40). At 768 one 44px bar (menu, ring, Sig, the tab, a 28px +).
  - **Community:** see RESP-03. At 390 and 768: menu, logo, Create, bell, avatar. At 1024: the search box joins them.
- **Side padding at 390:** every framed website page puts its text 16px from both edges, except RESP-01, RESP-05 and RESP-16. Community content sits at 16px too.
- **Type at 390:**
  - website copy 15px and up, notes 14px;
  - fields 16px in both apps, so a phone does not zoom;
  - no rounded corners in either app at 1440 or 390;
  - exceptions: RESP-05, 07, 12, 15, 17, 19, 22 and 23.
- **Figures:** prints, Sig's ring, the glyphs and the step drawings scale and stay inside their frames. The finale's ring draws on both pages it is on. Exceptions are labels: RESP-13.
- **Tablet:**
  - the website's grids reflow cleanly: 4, 3, 2 and 1 columns of 305–358px cards;
  - the pages that grow at 768 (the Library 1.85×, the status tracker 1.64× the 1440 height) do so through those two-column grids, not through a broken layout;
  - exceptions: RESP-01, 09, 11 and 19.
- **Screen height:**
  - **1440×900:** every website page's panel fits whole. Nothing scrolls, all nine "more" links show, and the foot sits at the bottom. Ask Sig's fits the same way.
  - **Shorter screens:** only the folder tree and Ask Sig's chat list give way, and Sign in, Join and the legal line stay in view while the panel scrolls. The tree stops just under 120px (RESP-26).
  - **The community's docked panel:** its menu scrolls inside, and the legal line stays.
- **The weekly email** (issue 1's `email.html`) at 390 and 768 holds:
  - the 132×26 logo;
  - the headline face (30px, 800, 125%, capitals) and 16px copy;
  - 16px edges at 390;
  - the line, with its second sentence in Signal blue (right for mail clients, which can't clip a gradient);
  - one blue button.
  - Images: `email-issue1-ends@390.jpg`, `email-logo-onblack.png`.
- **The u icon and the logo:** `favicon.svg`, `apple-touch-icon.png` and `logo.svg` are byte-identical in both apps. Ask Sig keeps its ring as its home-screen icon, as the book says, but in the old colours (RESP-10).

---

## Findings, most visible on a phone first

### RESP-01 · high · How it works' page at 900px and under: the band leaves the page's edge, its headline runs to four lines, and the six cards and the finale run into the right edge
- **Where:** `/how-it-works/`, every width up to 900px (measured at 390 and 768).
- **Selectors:** `home.css:757` `@container (max-width:900px)` contains:
  - `:760` `.hs-intro.violet{padding:72px 20px 64px 44px}`;
  - `:762` `.hs-step{display:block;height:auto;padding:28px 0 28px 44px}`;
  - `:770` `.hs-finale{height:auto;padding:40px 0 0 44px}`.
  
  The front page escapes these through `.hs-way` (`:782–788`). How it works' section has no `.hs-way`.
- **Evidence at 390:**
  - the band's kicker, headline and line start at x44 (the front page's at x16);
  - the headline (32px) wraps in 326px to 4 lines, 128px tall (3 lines on the front page);
  - the six cards run from x44 to the screen's edge, 0px on the right, and their captions end 13px from it;
  - the finale's ring runs to the edge too, and its line "…moves them closer to the community's own." ends 4px from it.
  - At 768 the band is at x44 (the front page's at 24) and the cards and the ring end at 0px.
  - Images: `how-flush-vs-home@390.jpg` (left: the cards at the edge; middle and right: the finale on each page), `band-finale-home-vs-how@390.jpg`, `how-cards-flush@390.jpg`.
- **Rule:**
  - equal side padding, the same on every page (16px on a phone, 20px from 701 to 900);
  - no headline over three lines at 390;
  - the decision of November 22: "on a phone and a tablet the band's words … keep the page's left edge".
- **Fix (`home.css`):**
  - add `.hs:not(.hs-way){--hw:20px}` and `@media (max-width:700px){.hs:not(.hs-way){--hw:16px}}`;
  - `:760` `padding:72px 20px 64px 44px` → `padding:72px var(--hw) 64px var(--hw)`;
  - `:762` `padding:28px 0 28px 44px` → `padding:28px var(--hw) 28px 44px` (the steps keep 44px on the left for the spine);
  - `:770` `padding:40px 0 0 44px` → `padding:40px var(--hw) 0 44px`.
- **Verified**, with the same rules injected, at 390 and 768:
  - the band's words at 16px (20px at 768), its headline 3 lines (96px);
  - cards, captions and ring end 16px (20px) from the edge, the finale's line 26px;
  - nothing wider than the screen.
  - Image: `fix-how-edges@390.jpg`.

### RESP-02 · high · Ask Sig on a phone and a tablet: no Unhyped logo anywhere on the screen
- **Where:** `/sig/` and `/ai/`, 900px and under (measured at 360, 390 and 768).
- **Selectors:**
  - `ai/term.css:388–397` (`@media (max-width:900px)`) turns the side panel, which holds the logo (`.sg-logo`, `:303–304`), into a closed drawer;
  - the tab bar holds only the menu and Sig's ring with "Sig" (`.tm-menu`, `.tm-brand`), built at `scripts/build_library.mjs:937–938`.
- **Evidence:**
  - Ask Sig: no logo on screen at 390 or 768 (at 1024 the docked panel shows it, 109×20 at x18).
  - Every other website page at those widths has the 109×20 logo at x46 (390) or x70 (768), and so does every community screen.
  - Images: `asksig-first-390-768.jpg`, `asksig-widths.jpg`, `bars-site-vs-comm.jpg` (bottom row).
- **Rule:** BRAND *Logo* (20px in the top bar, the side panel and Ask Sig's side); principle 4, one frame everywhere.
- **Fix:**
  - `build_library.mjs:937`, after the menu button: add `<a class="tm-home" href="/"><img src="/logo.svg" alt="Unhyped" width="109" height="20"></a>`;
  - `ai/term.css`: add `.tm-home{display:none}`;
  - inside `:388`: add `.tm-home{display:flex;align-items:center;flex:none;min-height:40px;margin-right:14px;align-self:center}.tm-home img{display:block;width:auto;height:20px}`.
  
  The word beside Sig's ring is how the docked layout already reads (the logo in the panel, the ring in the bar). "Never with the ring" is the u icon's rule, not the word's.
- **Verified** with a live mock at 360, 390 and 768:
  - the logo lands at x58 (x81 at 768);
  - the bar stays 52px (44px at 768) tall;
  - the ring and "Sig" move right;
  - nothing is wider than the screen.
  - Image: `fix-sig-logo.jpg`. Not verified through the build.

### RESP-03 · high · The community's bar loses the search on phones and tablets, and at 768 it is the phone bar where the website's is the tablet bar
- **Where:** all 15 community screens, up to 860px (390, 768).
- **Selectors:** `web/styles.css:798` `@media (max-width:860px)` contains:
  - `:806` `.search{display:none}`;
  - `:802` `.topbar{…padding:0 10px 0 8px}`;
  - `:804` `.layout{…padding:0 16px 96px}`.
  
  The bar is drawn in `web/ui/shell.js`.
- **Evidence:**
  - **At 390:** the community's bar has menu, logo, Create 96×40, bell 40×40 and avatar 46×40, but no search. The website's has a 40×40 search icon and Ask Sig.
  - **At 768:** the community shows its phone bar (56px tall, 8 and 10px edges, no search) where the website shows its tablet bar (60px, 24px edges, a 300px search box, "Ask Sig" in words). Its content also sits 16px from the edges, where the website's sits at 20px.
  - Images: `bars-site-vs-comm.jpg`, `csheet768-a.jpg`, `csheet390-a.jpg`.
- **Rule:** BRAND *The frame*: "On a phone: the top bar keeps the search and Ask Sig as icons". Decision November 13, call 4: the community takes the website's top bar.
- **Fix:**
  1. **From 701 to 860px:** after `:798`'s block add `@media (min-width:701px) and (max-width:860px){.search{display:block}.topbar{gap:14px}.layout{padding:0 20px 96px}}` and `.search input{text-overflow:ellipsis}`. `:806` then holds only at 700 and under.
  2. **At 700 and under:** `shell.js` draws a 40px search button (the kit's search icon) before Create, opening the same search.
  3. **At 480 and under:** Create shows its + alone: `.top-actions .create{width:40px;min-width:40px;padding:0;font-size:0;gap:0}`, with its words kept as the button's name.
- **Verified** with mocks:
  - **At 768:** the field is 269px wide and nothing is wider than the screen. Its placeholder runs past "stacks, po", hence the ellipsis. Image: `fix-comm-search@768.jpg`.
  - **At 390 and 360:** search, +, bell and avatar fit with no overflow. Image: `fix-comm-bar-my-intro.jpg`, the left two.
- **Not verified:** the button's behaviour (JS) and the 20px margins.

### RESP-04 · medium · The front page's first screen on a phone: taps under 40px
- **Where:** `/` at 390 and 360. The spectrum at 768 too.
- **Selectors:**
  - `home.css:74` `.sx-pop a{…min-height:32px…}`;
  - `:66` `.sx-acts a{…min-height:24px…}`;
  - `:669` `.sx-nav{width:36px;height:36px}`, in `:654` `@container fp (max-width:560px)`;
  - `:179` `.sx-studies{…padding:6px 9px…}`;
  - `lib/sighero.js:163` and `:179`: each of the spectrum's 51 bars is its own button with its own click.
- **Evidence at 390:**
  - the four popular links: 50–83 × 32px;
  - "Took it? Share how it went": 209×24; "How the score is made": 185×24;
  - the card's arrows: 36×36;
  - "Studies: limited": 181×27;
  - the spectrum: 51 bars 5×120 at a 7px pitch (8×180 at 768).
  - Image: `home-top-widths.jpg`, right.
- **Rule:** phone floors (decision November 13, part two): every tap 40px.
- **Fix:**
  - `@container fp (max-width:640px){.sx-pop a,.sx-acts a{min-height:40px}}` (**verified:** 40px, the top 40px taller, nothing wider at 390 and 360);
  - delete `:669`, so the arrows keep their 40×40 from `:117` (**verified:** 40×40, the name keeps its room);
  - `.sx-studies{min-height:40px}` on a coarse pointer (not verified);
  - the spectrum: one pointer handler on `.sx-cols` that picks the bar nearest the finger on pointerdown and pointermove (`lib/sighero.js`, beside `:179`). Not verified (JS).
- Raised as PT-20 on November 13.

### RESP-05 · medium · Ask Sig's typing bar on a phone: off the page's edge, with its rule line at 11px
- **Where:** `/sig/` and `/ai/`, 700px and under.
- **Selectors:** `ai/term.css:280` `.tm .ai-dock{padding:8px 10px calc(8px + env(safe-area-inset-bottom))}`; `:282` `.tm .ai-fine{margin-top:6px;font-size:11px}`.
- **Evidence:**
  - the box to write in sits 10px from both edges, where everything above it sits at 16px;
  - "Sig is an AI. No doses, sellers or diagnosis." is set at 11px.
  - Image: `asksig-first@390.jpg`.
- **Rule:** the same side padding for every part of a page; BRAND *Clean, not costume* (text a reader needs, 13px and up).
- **Fix:** `:280` `padding:8px 10px …` → `padding:8px var(--tm-px) calc(8px + env(safe-area-inset-bottom))` (`--tm-px` is 16px here); `:282` `11px` → `13px`.
- **Verified** at 390 and 360: the box at 16px from both edges, the line at 13px and still one line. Image: `fix-sig-dock@390.jpg`.
- Raised as PT-18.

### RESP-06 · medium · Community: two electric blue fills in one view on phones and tablets
- **Where:**
  - Quests at 390, 768 and 1024;
  - Notifications at 768 and 1024;
  - the home rail at 1440, beside Create.
- **Selectors:** "Claim +20" is `button.btn.lime.xs` in `.quest` (`web/styles.css:464`; `:121` `.btn.lime`; `:128` `.btn.xs{min-height:28px}`). `:1033–1036` step Create back for the tab bar's Share, but nothing steps Claim back.
- **Evidence:** Quests at 390, first view: Claim +20 (82×30 at y741) and the tab bar's Share (y787) are both electric blue. Image: `comm-quests-view@390.jpg`.
- **Rule:** BRAND *Colour*: one main action per view, "never two on a screen".
- **Fix:** `.quest .btn.lime{background:transparent;border-color:var(--line-2);box-shadow:none;color:var(--text)}`, and in the phone floor (`:844–852`) `.quest .btn{min-height:40px}`.
- **Verified** at 390: one blue fill in view, Claim 40px tall.

### RESP-07 · medium · The Library's drawer labels its families as folder paths, with its note at 11.5px
- **Where:** `/library/`, every width. In the drawer at 390 and 768 the tree comes first under the places.
- **Selectors:**
  - `scripts/build_library.mjs:454`: `library/` as the root's name;
  - `:455`: `▸ ` and `${fam.toLowerCase()}/`;
  - `styles.css:627` `.os-ctx .lt-more{…font-size:11.5px…}`.
  
  The fact sheets' tree is built plainly at `:626–630` ("The Library", "Peptides 56").
- **Evidence (live, 390):** "library/ 300", "▸ peptides/ 79", "▸ hormones/ 22", "▸ supplements/ 156", "▸ medications/ 34", and "122 have a full fact sheet, the rest are being checked." at 11.5px. Images: `drawer-library@390.jpg`; the fact sheet's plain tree in `drawers-390-768.jpg`.
- **Rule:** BRAND *Clean, not costume*: no file names or paths as labels. The decision of November 18 lists the Library tree's folders among what went. Also the 13px floor.
- **Note:** this is the clean lead's rule. It is reported here because it is what the Library's drawer shows on a phone.
- **Fix:**
  - `:454` `>library/</a>` → `>The Library</a>`;
  - `:455`: drop `<span aria-hidden="true">▸ </span>`, and print `${e(fam)}` without `.toLowerCase()` and the `/`;
  - `styles.css:627` `11.5px` → `13px`.
- **Not verified** (build).

### RESP-08 · high · The method page's table on a phone: one row's label collapses to nothing and its words fall one to a line over its value
- **Where:** `/method/`, the table of how reports are weighted, 360 to 640px.
- **Selectors:** `styles.css:819` `.method .mtable-wrap tr{display:grid;grid-template-columns:minmax(0,1fr) auto;…}`, in the 640px block at `:814`. The long value takes the whole row and the label's track goes to 0px.
- **Evidence at 390:** "…by how long they took it" is 0px wide. It reads "by / how / long / they / took / it", one word a line, with "by" drawn over "× 1;". The same at 360 and 640. Image: `method-pairs-table@390.jpg`.
- **Rule:** no squeezed tables, nothing overlapping, no single words per line.
- **Fix:** `:819` `grid-template-columns:minmax(0,1fr) auto` → `grid-template-columns:minmax(0,1fr) fit-content(45%)`.
- **Verified** at 360, 390 and 640:
  - the label is 166px wide at 390;
  - the value wraps beside it in 146px;
  - the other rows and the placebo table are unchanged.
  - Image: `fix-method-pairs@390.jpg`.

### RESP-09 · medium · The front page and How it works keep their own side margins from 561 to 900px
- **Where:** `/` and `/how-it-works/`, 561 to 900px (measured at 600, 768 and 880).
- **Selectors:**
  - `home.css:645` `.fp-wrap{padding:0 24px}`, in `@container fp (max-width:860px)`;
  - `:655` `.fp-wrap{padding:0 16px}`, at 560px;
  - `:787–788` `.hs-way{--hw:24px}` and `{--hw:16px}`.
  
  Every other page: `styles.css:390` `.wrap{padding-left:20px;padding-right:20px}` up to 900px, and `:672` 16px up to 700px.
- **Evidence:**
  - at 600 the front page's sections sit 24px in, every other page's 16px;
  - at 768 they sit 24px in over the page's own foot at 20px, a 4px step on one page;
  - at 880 they sit 35px in (4vw) against 20px elsewhere.
  - Images: `sheet768-a.jpg` vs `home-top-widths.jpg`.
- **Rule:** the same side padding on every page; tokens `pad` (20px from 701 to 900, 16px on a phone).
- **Fix (`home.css`):**
  - replace `:645` and `:655` with `@container fp (max-width:900px){.fp-wrap{padding:0 20px}.hs-way{--hw:20px}}` and `@container fp (max-width:700px){.fp-wrap{padding:0 16px}.hs-way{--hw:16px}}`;
  - delete `:787–788`.
- **Verified** with the same values: 600 (16/16), 768 (20/20, matching its foot), 880 (20/20).

### RESP-10 · medium · Ask Sig's home-screen and app icons are in the old colours
- **Where:** `/sig/` added to a phone's home screen: `sig/icon-180.png` via `build_library.mjs:1022`, and the manifest's `icon-192`, `icon-512` and `icon-maskable-512`.
- **Evidence:**
  - the ground is the old graphite #0B0F11, not the page's #000000 or the `bar` grey #17171A;
  - the community's piece of the ring is the old lime #D8FF3D, where everywhere else it is Signal blue #3D8BFF (`lib/ring.js:14`);
  - the files date from November 12, before *Black and electric blue*.
  - Measured by pixel colour. Image: `icons-u-vs-sig.png` (the u icon, then the three Sig icons).
- **Rule:**
  - BRAND *Iconography* (Sig's ring in the agents' colours);
  - BRAND *Colour* (the community in Signal blue);
  - decision November 12.
- **Fix:** redraw the four files from `lib/ring.js` on #000000 (the manifest's `background_color`), and have `design/pack/build.mjs` make them with the pack so they follow the ring.
- **Not verified** (asset).

### RESP-11 · medium · Community from 861 to 1279px: a centred 780px feed with empty sides, and the rail 2,000px down
- **Where:** every community screen with a rail, 861 to 1279px (measured at 1024 and 1200).
- **Selectors:**
  - `web/styles.css:786–788`: `@media (max-width:1300px)` makes one column and puts the rail under the page at 780px;
  - `:184` `main{max-width:780px;justify-self:center}`.
  
  These were written when the panel docked from 861px (comment at `:1023–1024`). It docks from 1280px now (`:144`).
- **Evidence:**
  - at 1024 the feed runs from x122 to x902, with 122px empty on each side, and the rail starts at y2018;
  - at 1200 each side is 210px empty;
  - the website at 1024 runs to 41px margins.
  - Image: `csheet1024-a.jpg`.
- **Rule:** tablet checks (empty sides); the page across the window's width.
- **Fix:** after `:788` add `@media (min-width:1000px) and (max-width:1279px){.layout{grid-template-columns:minmax(0,1fr) var(--rail-w);grid-template-areas:"main rail"}.rail{padding-top:18px;max-width:none;width:auto;justify-self:stretch;grid-template-columns:none}}`.
- **Verified:**
  - at 1024 the feed is 628px from x24, with the 320px rail beside it at the top;
  - at 1200 the feed is 780px with the rail beside;
  - nothing wider than the screen.
  - Images: `fix-comm-rail@1024.jpg`, `comm-home@1200-after.jpg`.
- **Note:** with the rail up, Claim and Create share the first view, so RESP-06's fix goes with this one.

### RESP-12 · medium · The community's Signal screen: the hero's five stat labels are 10px
- **Where:** `#/signal`, every width.
- **Selectors:** `web/styles.css:737` `.signal-hero .hero-stats span{font-size:10px;line-height:1.4}`. The same kind of label elsewhere is 13px (`:502` `.stat span`).
- **Evidence:** "Signals", "Moves today", "First-hand reports", "Run by this community" and "Signal Certified" are 10px at 390, 768 and 1440. Image: `csheet390-a.jpg` (Signal, bottom).
- **Rule:** labels 11px and up at 390; BRAND's 13px floor.
- **Fix:** `:737` `font-size:10px` → `13px`, or delete the rule so `:502` applies.
- **Verified** at 390: 13px. The longest label takes two lines in its 159px cell, and nothing overlaps.

### RESP-13 · medium · Figures whose labels shrink far under 11px on a phone
- **Where:**
  - the fact sheet's takeover chart;
  - the Library's "How the Signal is made";
  - How it works' six drawings;
  - the community's Signal and space screens, which use the same drawings: `web/kit/signalviz.js` is byte-identical to `library/signalviz.js`.
- **Selectors:**
  - `library/library.js:281` draws the takeover in a fixed 520-unit box (`{ compact: true, width: 520 }`);
  - `library/signalviz.js:264` (`W = width || …`) and `:282–283` (labels `compact ? 8 : 9` units);
  - the flow figure's compact labels (7 to 9 units);
  - How it works' card drawings (`lib/how.js`).
- **Evidence** (at 390, from the drawings' own scale):

  | Figure | 390 | 768 | 1024 |
  | --- | --- | --- | --- |
  | Takeover chart | 4.9px | 10.4px | |
  | Flow figure (24 of its 31 labels under 11px) | 4.6px | 5.3px | 6.9px |
  | How it works' drawings | 6.1–6.8px | | 7.4–8.1px |
  | Community flow | 4.5px | | |
  | Community takeover | 7.2px | | |

  Images: `figs-small-labels@390.jpg`, `fig-takeover@768.jpg`.
- **Rule:**
  - labels 11px and up at 390;
  - figures scale;
  - the follow-up open since November 11: "its smallest labels render 6 to 7px at tablet width … raising them means re-spacing the drawing".
- **Fix:**
  - draw each figure at the width it is shown at: `library.js:281` `width: 520` → `width: Math.max(320, Math.round(host.clientWidth))`, and `signalviz.js:282–283` `compact ? 8 : 9` → `compact ? 11 : 9`;
  - the compact flow figure's labels to 11 units at its 316-unit width, re-spacing its rows;
  - How it works' drawings: labels of 11px or more at a 344px card, which means fewer, larger labels.
- **Not verified** (JS and drawings).

### RESP-14 · medium · Community taps the November 13 phone floor missed
- **Where:** most community screens at 390. The rail's cards are on home, builders, how, new, notifications, space, post and signal.
- **Selectors (`web/styles.css`):**
  - `:229` `.card-h a,.card-h button`: "All" 16×18, "Profile" 39×18, "The Signal" 65×18;
  - `:694` `.space-links a`: "Fact sheet" and "Ask Sig", 21px tall;
  - `:240` `.chip{height:27px}`: 27–28px;
  - `:670` `.cpick-in{…height:34px}`: the compound and stack pickers, where fields are 48px;
  - `:128` `.btn.xs`: Claim at 30px (see RESP-06).
- **Evidence:** measured at 390. Image: `csheet390-a.jpg`.
- **Rule:** every tap 40px on a phone, and fields 48px (decision November 13, part two).
- **Fix:**
  - add to the phone floor at `:844–852`: `.card-h a,.card-h button{display:inline-flex;align-items:center;min-height:40px;min-width:40px}.space-links a,.chip{min-height:40px}`;
  - `:670` `height:34px` → `height:46px`, so the picker fills its 48px frame.
- **Not verified.**

### RESP-15 · medium · Community: a post's own page sets its title in capitals
- **Where:** `#/post/…`, every width (three lines at 390).
- **Selectors:** `web/styles.css:918` `h1,h2{font-weight:800;…font-stretch:125%;text-transform:uppercase}`. Then `:287` `.post-title{…font:600 18px/1.3 var(--body)…}` resets the weight and the width but not the capitals.
- **Evidence:** the post page's `h1.post-title` is 18px, 600, normal width and in capitals. The same title in the feed is in sentence case. It is neither the headline style nor the post title style. Image: `csheet390-a.jpg` (comm-post).
- **Rule:** BRAND *Type*: post titles are `h3` in sentence case; headlines are wide, heavy capitals.
- **Fix:** add `text-transform:none` to `:287`.
- **Not verified** (one property). For the typography lead too.

### RESP-16 · low · The top bar's edges on a phone sit off the page's 16px line
- **Where:** every website page at 700px and under. The community's bar up to 860px has the same edges.
- **Selectors:** `styles.css:668` `.os-top{gap:6px;padding:0 10px 0 8px}`; `web/styles.css:802` is the same.
- **Evidence:** the menu's glyph sits 12px from the left and Join's edge 10px from the right, while the page's text sits at 16px. Image: `bars-site-vs-comm.jpg`.
- **Fix:** `styles.css:668` `padding:0 10px 0 8px` → `padding:0 16px 0 12px`. The menu's glyph sits 12px inside its 40px button, so with 12px of padding the button starts at 4px and its glyph lands on 16.
- **Verified** on the website at 390 and 360: glyph at 16, Join 16px from the edge, everything fits.
- **For the community:** do not copy this into `:802` with RESP-03's search button. At 390 the bar would then be about 10px too full. Keep 8/10 there, or make its gaps 4px (not verified).

### RESP-17 · low · The story's hero headline: four lines on a phone, and bigger than the front page's
- **Where:** `/story/` at 390 and 360.
- **Selectors:** `styles.css:742` `.sy-hero h1{…clamp(32.5px,2.92vw + 12px,51.5px)…}`. The markup breaks it after each sentence (`story/index.html`: `One app.<br> Twelve agents.<br> <em>…</em>`).
- **Evidence:** 32.5px and four lines at 390, where the front page's hero is 30px and three lines at the same width. Image: `sheet390-c.jpg` (story).
- **Rule:** no headline over three lines at 390; the two `hero` headlines the same size at one width.
- **Fix:** `:742` `clamp(32.5px,…)` → `clamp(30px,…)` (**verified:** 30px, still four lines).
- **Why not three lines:**
  - The third sentence needs about 384px at the 26px floor, and the phone has 358px.
  - Hiding the breaks gives three lines but sets "Twelve" apart from "agents." (tried and rejected: `fix-story-h1-br@390.jpg`).
  - So the book should allow four lines here (RESP-29).

### RESP-18 · low · My stack and the plan on a phone: the head and the main action differ from every other page
- **Where:** `/my/` up to 760px; `/plan/` up to 600px.
- **Selectors:**
  - `my/my.css:7` `.my-intro{display:flex;align-items:center;gap:18px}`, `:8` (a 48px glyph), and `:84` `.my-intro{align-items:flex-start}` in the 760px block;
  - `ai/plan.css:159` `.plan-cta .btn{margin-top:16px}`. It has no phone width; `pages/pages.css:139` makes a page's action full width at 600px.
- **Evidence at 390:**
  - My stack's h1 and line start at x82, beside the glyph, with the line in 292px. Every other page starts at x16 with 358px.
  - The plan's "Start with Sig" is 132px wide, where My stack's "Build your plan with Sig", in the same kind of card, is 316px.
  - Image: `my-plan-heads.jpg`.
- **Fix:**
  - `my/my.css:84` → `.my-intro{flex-direction:column;align-items:flex-start;gap:14px}.my-intro .glyph{width:40px;height:40px}`;
  - `ai/plan.css`: add `@media (max-width:600px){.plan-cta .btn{width:100%}}`.
- **Verified** at 390 and 360, with the head's rule injected at 700px:
  - the glyph sits over the h1;
  - the h1 and the line start at 16, and the line is 358px;
  - the plan's button is 316px.
  - Image: `fix-comm-bar-my-intro.jpg`, right. Not verified at 701–760px.

### RESP-19 · low · The spectrum's axis numbers are cut at 768 and touch the edge at 1024; the group names nearly touch
- **Where:** `/`, 761 to 1100px (measured at 768, 800 and 1024).
- **Selectors:**
  - `home.css:196` `.sx-gv{position:absolute;left:-36px;…font:400 10.5px/1 var(--mono)…}`: the numbers sit left of a plot that starts at the page's edge;
  - `:211` `.sx-glabs{display:flex;gap:24px}`;
  - the phone's arrangement is at `:503–515`.
- **Evidence:**
  - at 768 the axis numbers start 12px off the screen, so "100" loses 5px;
  - at 1024 they sit 5px from the edge;
  - they are 10.5px, under the 11.5px `tick` token;
  - "Hormones" ends 10px before "Medications" starts.
  - Image: `spectrum@768.jpg`.
- **Fix (`home.css`):** add `@container fp (min-width:761px) and (max-width:1100px){.sx-plot{margin-left:36px}.sx-glabs{display:none}.sx-gline{display:flex}}`, and change `:196` `10.5px` → `11.5px`.
- **Verified** at 768, 800 and 1024:
  - all four numbers sit inside the page at its edge;
  - the plot starts at x60;
  - the group names run on one line under it;
  - nothing is wider than the screen.
  - Image: `fix-spectrum-margin@768.jpg`.
- **Rejected:** a first try that moved the numbers into the plot put "50" behind the bars (`fix-spectrum@768.jpg`).
- Raised as PT-23.

### RESP-20 · low · Other website taps under 40px on a phone, and controls that stay small on a touch tablet
- **Where:**
  - **At 390:**
    - the Library's "Filling first" links: 32px;
    - the status tracker's 122 card titles: 22px;
    - the weekly issue's three "more" links: 22px;
    - compare's "What people report": 21px;
    - the fact sheets' source numbers: 24×24 (WCAG 2.2's minimum, as footnote numbers).
  - **On a touch screen at 1024:** the menu button is 32×32, in both apps.
  - **Ask Sig at 768 and 1024:** the + is 28×28 and its tab 31px tall.
- **Selectors:**
  - `library/library.css:330` `.moves-focus a{padding:5px 10px…}`;
  - `pages/pages.css:53` `.st-row h3 a`;
  - `pages/pages.css:100` `.wk-issue .wk-more`;
  - `styles.css:584` `.os-fold,.os-menu{…width:32px;height:32px…}` (40px only at 900 and under, `:660`); the community's `web/styles.css:88` is the same;
  - `ai/term.css:111` `.tm-plus{…width:28px;height:28px…}` (40px at 700 and under, `:276`).
  
  The only coarse-pointer rule is `styles.css:469` (`.btn.sm`).
- **Fix:**
  - after `styles.css:469`: `@media (pointer:coarse){.os-fold,.os-menu{width:40px;height:40px}.moves-focus a,.st-row h3 a,.wk-more a{display:inline-flex;align-items:center;min-height:40px}}`;
  - `ai/term.css`: `@media (pointer:coarse){.tm-plus{width:40px;height:40px}}`;
  - `web/styles.css`: `@media (pointer:coarse){.burger,.side-close{width:40px;height:40px}}`.
- **Not verified.**

### RESP-21 · low · The 404 keeps its keyboard hints on a phone
- **Where:** `/404.html` at 390, and at 768 on touch.
- **Selectors:** `404.html:56` ("Or press `⌘K` and type where you meant to go.") and `:62` ("Go anywhere · `⌘K`"). The bar hides its own hint at 700px (`styles.css:670`).
- **Evidence:** "Ctrl K" shows twice on a phone (⌘K on an iPhone). Image: `sheet390-c.jpg` (notfound).
- **Fix:** use the site's touch switch (`styles.css:144` `.nk-point`): wrap `:56`'s last sentence and `:62`'s " · ⌘K" in `<span class="nk-point">`. The words stay where there is a keyboard.
- **Not verified.**

### RESP-22 · low · Website notes under the phone floor
- **Selectors:**
  - `pages/pages.css:150` `.doc .news-form .nf-note{…font-size:13px…}` outranks the floor at `styles.css:828` (14px);
  - `styles.css:798` `.sy-log li{…font-size:11.5px}` (the story's run log, up to 760px).
- **Evidence:** the weekly issue's sign-up note is 13px where the weekly page's and every foot's is 14px. The story's log lines are 11.5px.
- **Fix:** `pages.css:150` `13px` → `14px`; `styles.css:798` `11.5px` → `13px` (its 14ch column may need to become 12ch).
- **Not verified.**

### RESP-23 · low · Community notes under the phone floor
- **Selectors:**
  - `web/styles.css:351` `.sigcard .cap2{font:400 13px/1.5…}`;
  - `:681` `.cpick-note{…13.5px}`;
  - `:728` `.flow-cap{…13.5px}`;
  - the shared `kit/kit.css:122` `.mh-bm-foot{…font-size:12px}` (identical in both apps).
- **Evidence at 390:**
  - "2 first-hand reports here…": 13px;
  - the picker's note: 13.5px;
  - the flow caption: 13.5px;
  - the body map's foot: 12px.
- **Fix:** add `.sigcard .cap2,.cpick-note,.flow-cap{font-size:14px}` to the phone floor (`:844–846`), and change `kit.css:122` `12px` → `13px` in both repositories.
- **Not verified.**

### RESP-24 · low · The community's foot: the logo at 24px, and a different foot
- **Selectors:** `web/styles.css:639` `.foot img{display:block;height:24px;width:auto}`; the foot's markup in `web/index.html`.
- **Evidence:**
  - the logo is 131×24 at 390 and 1440, where the website's foot logo is 142×26;
  - the foot itself is a different component at every width: no "Peptides, without the sales pitch.", a run of links instead of four columns, no big word, no weekly band.
  - Image: `foots@390.jpg`.
- **Rule:** BRAND *Logo* (26px in a foot); BRAND *The frame* (the foot).
- **Fix:** `:639` `24px` → `26px` (measured only). The structure is in *The next update*.

### RESP-25 · low · Signal Builders' podium cuts members' names on a phone
- **Selectors:** `web/styles.css:487` `.pod b{…overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`, in 88px boxes (`:482`).
- **Evidence:** at 390 "u/sleepy_in_sd" and "u/desk_athlete" are cut, losing 18 and 21px.
- **Fix:** at 480 and under, `.pod b{white-space:normal;overflow-wrap:anywhere;text-overflow:clip}`, so names wrap to two lines. This is a design call against keeping the ellipsis.
- **Not verified.**

### RESP-26 · low · Short screens: the folder tree and Ask Sig's chat list give way to 119px and 108px, under the decided 120px
- **Where:** the Library, the fact sheets and Ask Sig, at 1440×790 and 1280×720.
- **Selectors:** `styles.css:596` `.os-ctx{…min-height:min(120px,15dvh)…}`; `ai/term.css:432` `.sg-chats{min-height:min(120px,15dvh)…}`.
- **Evidence:**
  - the tree shrinks to 119px and 108px, and the panel scrolls 26px and 85px (Ask Sig's: 70 and 129px);
  - Sign in, Join and the legal line stay in view throughout;
  - before scrolling, 8 of 9 and 6 of 9 "more" links show (Ask Sig: 6 and 4).
  - Images: `panel-library@1280x720.jpg`, `panel-asksig@1280x720.jpg`.
- **Fix:** in both rules, `min-height:min(120px,15dvh)` → `min-height:120px`. The panel then scrolls 1.5px and 12px more.
- **Not verified.** Raised as PT-24.

### RESP-27 · low · With the drawer open, Tab reaches "Skip to content"
- **Where:** every website page and Ask Sig.
- **Selectors:** `styles.css:78` `.skip` sits outside the inert page.
- **Evidence:** 4 of 45 Tab presses leave the drawer: twice to the skip link, twice to the browser's own bar.
- **Fix:** after `:572`, add `:root:has(#os.drawer) .skip,:root:has(#sg.drawer) .skip{visibility:hidden}`.
- **Verified** on About and on Ask Sig at 390: the skip link is no longer reached (the two stops left are the browser's bar), and Escape still returns focus to the menu button.
- Raised as PT-26.

### RESP-28 · low · theme-color: a graphite browser bar over a black top bar
- **Selectors:**
  - `#17171A` in `scripts/build_library.mjs:310`, `index.html:9`, `404.html:10`, `privacy.html:9`, `terms.html:9`, `how-it-works/index.html:9` and `sig/index.html:9`;
  - `sig/sig.webmanifest:9–10` says `#000000`;
  - the community's `web/index.html` says `#000000`.
- **Evidence:**
  - the website's top bar is black (rgba(0,0,0,.84)) but tells a phone's browser #17171A;
  - the community says #000000;
  - Ask Sig's own bar is #17171A, but its manifest says #000000.
- **Fix:**
  - `#000000` on the website's pages: `build_library.mjs:310` and the six hand-written pages;
  - `#17171A` on `/sig/`: `sig/index.html:9` stays, and `sig.webmanifest:10` `theme_color` → `#17171A`.
- **Not verified** on a device.

### RESP-29 · low · The book and the brief, against what was built
1. The side panel's "more" list has **nine** links on every page, not ten (the brief; the November 11 decision).
2. The website's side panel is a drawer at every width, `min(86vw,300px)` (`styles.css:574` `--os-w:300px`). The 272px of BRAND *The frame* and the token `side-panel` is only Ask Sig's and the community's docked panel.
3. Token `pad` says "the side padding is 40px … and the path line". What is built:
   - `clamp(16px,4vw,96px)` above 900px (`styles.css:51`);
   - 20px from 701 to 900px;
   - 16px under 701px;
   - no path line.
4. "No headline over three lines at 390" can't hold for a headline of three sentences set one to a line (RESP-17). Allow four lines there, or name where it may break.

---

## Systemic: one thing everywhere, and the one value

- **The phone and tablet breakpoints.** Today:

  | Surface | Bar and margins switch at |
  | --- | --- |
  | Website frame | 700px (bar and 16px), 900px (20px, drawer rows) |
  | Front page | 560 and 860px (container queries) |
  | Ask Sig | 700 and 900px |
  | Community | 480 and 860px |

  **Standardise on 700px and 900px** for the bar and the margins on all three (RESP-03, 09).
- **Side margins:** 16px up to 700, 20px up to 900, `clamp(16px,4vw,96px)` above. Today `.fp-wrap` and `.hs` use 24px or 44/0, Ask Sig's typing bar 10px, and the community 16px up to 860 (RESP-01, 03, 05, 09).
- **The bar's edges:** the first glyph and the last control sit on the page's 16px line on a phone. Today they sit at 12px and 10px in both apps (RESP-16).
- **Small type on a phone:** 13px for anything a reader reads (the book), 11.5px for ticks and footnote numbers. Today there is text at 10, 10.5, 11, 11.5 and 12px (RESP-05, 07, 12, 19, 22, 23).
- **Taps:** 40px on any coarse pointer, in both apps. Today only `.btn.sm` grows on touch, so tablets keep 28px and 32px controls (RESP-04, 14, 20).
- **One blue action per view, in both apps:** whatever else is blue steps back to a hairline where the phone's Share is on screen. Today only Create does (RESP-06).
- **The logo on every screen at every width,** Ask Sig included (RESP-02). It is 26px in a foot in both apps (RESP-24).
- **theme-color matches the bar it sits over:** #000000 on the website and the community, #17171A on Ask Sig (RESP-28).

## The next update, in this area

1. **A frame check for phones and tablets, in both apps.**
   - **What:** extend `scripts/check_layout.mjs`, and the community's e2e run, so every website page and community screen at 390 and 768 must show:
     - the logo in the first view;
     - the bar's items (search, and Ask Sig or its place);
     - content edges of 16px or 20px;
     - the bar's edges on the content's line;
     - one electric blue action per view.
   - **Why:** it would have caught RESP-01, 02, 03, 06, 09 and 16, which no current check sees.
2. **One frame on both sides.**
   - **What:** the community's foot becomes the website's: the weekly band, the logo at 26px with "Peptides, without the sales pitch." and the disclaimer, four columns, the last line, and the big word. Its bar also takes the website's items at each width, with Ask Sig's ring from 701px where there is room.
   - **Why:** today every community screen ends differently from every website page, at every width.
3. **Figures drawn at the width they are shown at.**
   - **What:** a phone layout for `kit/signalviz.js`'s flow and takeover drawings (shared, so both apps get it), labels of 11 units drawn at the host's width, and How it works' six drawings with fewer, larger labels at 344px.
   - **Why:** this closes the follow-up open since November 11 (RESP-13).
4. **One touch floor, shared.**
   - **What:** a `@media (pointer:coarse)` block in `kit/kit.css` for the shared pieces, plus one in each app, so every control is 40px on touch at any width; the spectrum scrubs under a finger; `check_states.mjs` also walks 768×1024 with touch.
   - **Why:** RESP-04, 14 and 20, and tablets in general.
5. **Ask Sig's identity on a phone.**
   - **What:** the logo in its bar (RESP-02), its app icons made by the brand pack from `lib/ring.js` so they can't go stale (RESP-10), and theme-color per surface (RESP-28).
   - **Why:** today, on a phone, Ask Sig looks like an older, separate app.
