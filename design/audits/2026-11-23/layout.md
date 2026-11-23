# Layout, grid and symmetry: audit (design-layout), 2026-11-23

**The state of my area, in one line:** the frame is the same on every website page, Ask Sig's tabs sit exactly on its window, and the foot, ⌘K and the weekly email are consistent. But the pages under the frame come from three generations of layout:
- page heads land at five different heights;
- three places still use widths from before November 12: the story (1320px), My stack and the plan (a centred 740px column) and the Library's "What moved" box (1240px);
- fact sheets and the community come apart on a wide screen;
- the community's page heads, foot and tablet frame are its own.

**How this was measured**
- **Sources:** the capture in `.design/data` (24 pages and 16 community screens at 2560, 1440, 1024, 768 and 390), plus live Playwright with Chrome. Live runs answered the Signal from `/tmp/sx/signal-live.json`, used reduced motion, and scrolled through each page so what plays in is there. The community was signed in as a new member, as `/tmp/sx/comm_capture2.py` does.
- **Verified fixes:** fixes marked *verified* were injected into the live page (CSP bypassed in the test browser only) and measured again.
- **The layout check:** `node scripts/check_layout.mjs --widths 2560,1920` passes (48 views). Everything in LAY-02, 05, 06 and 07 is outside what it looks at: headings, card heads, `div` rows, bars and the community.
- **Evidence:** in `.design/evidence/design-layout/`. A blue guide is the page's edge or the standard, a red guide is the stray value.
- **Canvas sections:** one caution. The capture's full-page shots show the front page's finale ring as empty, because the canvas clears when the screenshot resizes the page. Live, it draws under reduced motion too. It is not reported.

---

## Findings (most visible first)

### LAY-01: high. Page heads land at five heights; the same kicker and h1 pair has five gaps
- **Where:**
  - `/library/`, every fact sheet (`/library/*/`) and `/how-it-works/`, at every width.
  - Measured against the twelve pages that share `.doc-head`: method, about, status, goals, goal-weight, compare, compare-pair, weekly, weekly-issue, founders, privacy and terms.
- **Selectors:**
  - `library/library.css` l.110 `.le-hero h1{margin-top:12px}` and l.50 `.lib-hero h1{margin-top:18px}`;
  - `styles.css` l.88 `.live{display:inline-flex}`, which puts the Library's live kicker on a 24.8px line box, 9px more;
  - `library/library.css` l.256 (≤900) `.lib-hero-in{padding-top:calc(var(--top-h) + 28px)}`;
  - `home.css` l.777 `.fp-head h1{margin:14px 0 0}` and l.287 `.fp-sec{padding:88px 0;border-top:1px solid var(--line)}`. On `/how-it-works/` this is the page's first block, so its head sits 17px low and its top border doubles the bar's hairline.
- **Evidence:**
  - Gap from the kicker to the h1, and the h1's top, at 1440:

    | Page | Kicker to h1 | h1 top |
    | --- | --- | --- |
    | `.doc-head` pages | 16px | y=168 |
    | Library | 27px | y=179 |
    | Fact sheets | 12px | y=164 |
    | How it works | 14px | y=183 (kicker at 149, 89px under the bar, not 72) |

  - Kicker's distance under the bar: at 768, 72px on doc pages, 28 on the Library and 65 on How it works. At 390, 44, 28 and 65, and 72 on a sheet without a print.
  - On `/how-it-works/` the pixel rows y=59 and y=60 are both a hairline: a 2px line under the bar that no other page has.
  - `page-heads@1440.jpg`: the red line is the standard h1 top and the blue line is the page's edge.
- **Rule:** BRAND *The frame* ("Every page opens the same way"); principle 4, one frame everywhere; this round's ask, "so it feels all one".
- **Fix (verified at 1440, 768 and 390):**
  - `library/library.css` l.110: `margin-top:12px` → `16px`.
  - l.50: `18px` → `16px`.
  - `styles.css` after l.88, add `.kick.live{display:flex}`.
  - `library.css` l.256: `+ 28px` → `+ 72px`, and add `@media (max-width:600px){.lib-hero-in{padding-top:calc(var(--top-h) + 44px)}}`, as `.doc-head` does at `styles.css` l.422.
  - Add `@media (max-width:600px){.le-hero:not(.has-print) .kick{margin-top:4px}}`.
  - `home.css` l.777: `margin:14px 0 0` → `16px 0 0`, and add `main.fp>.fp-sec:first-child{border-top:0;padding-top:72px}` with `@media (max-width:600px){main.fp>.fp-sec:first-child{padding-top:44px}}`.
  - Result: every h1 starts at y=168 (1440 and 768) and y=136 (390), 16px under its kicker.
- **For typography:** How it works' h1 is 36px; every other page's h1 is 32.78px.

### LAY-02: high. Headings and their signers, and card titles and their tags, stand 600 to 1,870px apart
- **Where:**
  - Every fact sheet from 1024px. At 1440 already more than 560px.
  - The Library's "How the Signal is made, live" panel.
  - The fact sheets' glance plates.
  - The story's `.sp-k` at 1024.
- **Selectors:**
  - `library/library.css` l.382 `.le-sec h2,.bl-head .bl-k{display:flex;justify-content:space-between}`;
  - `styles.css` l.110 `.gc-head{display:flex;justify-content:space-between}`;
  - `styles.css` l.766 `.sp-k{display:flex;justify-content:space-between}`.
- **Evidence:** measured live, from the end of the heading's words to the start of the signer's.

  | What | 1024 | 1440 | 1920 | 2560 |
  | --- | --- | --- | --- | --- |
  | Fact sheet h2 to signer ("What it is … Evidence librarian", "Risks and side effects … Safety agent") | | 600–778px | 1,030–1,216px | 1,472–1,658px |
  | Library, "How the Signal is made, live … Updated 11 days ago" | | 983px | | 1,867px |
  | Sheet, "What it's used for … By goal" | 743px | | | 845px |
  | Sheet, "Community Signal … Live" | | | | 944px |
  | Story, "The bottom line … Recommender" | 666px | | | |

  Images: `sheet-body@2560.jpg`, `library-gc-head@2560.jpg`, `sheet-2560-glance.jpg`.
- **Rule:** BRAND *The frame* (a row's parts stay together; the 560px limit); the brief's item 9 (a card's title and its number at opposite edges, a date far from what it belongs to). The book's signer is "on the right of the heading", not at the far edge.
- **Fix:** in all three rules (`library.css` l.382, `styles.css` l.110 and l.766), `justify-content:space-between` → `flex-start`. The signer and tag then sit 16–18px after the title, at every width. Verified on the sheet at 1440 to 2560.

### LAY-03: high. My stack and the plan are a centred 740px column, an older layout; My stack has two left edges
- **Where:** `/my/` and `/plan/`, from 1024 to 2560, and the glyph offset at 768.
- **Selectors:**
  - `my/my.css` l.6 `.my-wrap{max-width:820px;margin:0 auto;padding:… 40px …}` and l.7 `.my-intro{display:flex;align-items:center;gap:18px}`;
  - `ai/plan.css` l.150 `.plan-wrap{max-width:820px;margin:0 auto;…}`.
- **Evidence:**

  | Width | Column | Page and foot edge | My stack's h1 | Its card |
  | --- | --- | --- | --- | --- |
  | 1024 | x=142 | 41 | | |
  | 1440 | x=350–1090 | 58 | x=416, beside the 48px glyph | 350 (two edges, 66px apart) |
  | 2560 | x=910–1650 (910px empty on each side) | 176 | | |
  | 768 | | | x=86 | 20 |

  Images: `my-column@2560.jpg`, `plan-column@2560.jpg`, `page-heads@1440.jpg`.
- **Rule:**
  - decisions, November 11 call 5 (pages join the site's left edge) and November 12 (pages run the whole width);
  - November 13: Sig's ring went over Ask Sig's headline so everything starts at one edge;
  - the brief's item 9 (a narrow column beside a full-width one).
- **Fix (verified at 768, 1440 and 2560):**
  - `my/my.css` l.6 → `max-width:var(--page-max);padding:calc(var(--top-h) + 72px) var(--page-pad) 110px`, and add `.my-wrap>*{max-width:740px}`.
  - l.7 → `.my-intro{display:grid;justify-items:start;gap:16px}`, which puts the glyph above the h1.
  - Delete l.82.
  - `ai/plan.css` l.150: the same change, with `.plan-wrap>*{max-width:740px}`; delete l.162.
  - Result: the glyph, h1 and card sit at 58 (1440) and 176 (2560), the foot's edge.

### LAY-04: high. The story still caps its sections at 1320px
- **Where:** `/story/` at every width over 1320.
- **Selector:** `styles.css` l.728 `.sy{--sy-w:1320px}`; l.738 `.sy-ring{margin:0 auto}`.
- **Evidence:**
  - At 1440: section heads at x=118 and the hero copy at 562; the foot and every other page start at 58.
  - At 2560: heads at 716 against the foot's 176, 540px in.
  - Images: `story-column@2560.jpg`, `story-foot@2560.jpg`.
- **Rule:** decision, November 12 (the 1200 to 1320px caps went); one left edge.
- **Fix (verified at 1440 and 2560):**
  - l.728 → `.sy{--sy-w:var(--page-max)}`.
  - Add `@media (min-width:1280px){.sy-ring{margin:0}}`.
  - Result: the ring and every section sit at 58 and 176.

### LAY-05: high. The community's feed and its rail drift apart on a wide screen
- **Where:** every community screen from about 1500px. Measured at 1920 and 2560.
- **Selectors:** community `web/styles.css` l.137 `.layout{grid-template-columns:minmax(0,1fr) var(--rail-w);gap:28px}` and l.184 `main{max-width:780px;justify-self:center}`.
- **Evidence:**
  - At 2560: the feed is at x=852–1632 and the rail at 2216–2536, 584px apart. The `gutter` token is 28px.
  - At 1920: 264px apart. At 1440: 28px.
  - Image: `comm-feed-rail@2560.jpg`.
- **Rule:** token `gutter` (28px between the feed and the rail); BRAND *The frame* ("nothing runs long and empty"; a row's parts stay together).
- **Fix (verified at 1440, 1920 and 2560):**
  - l.137 → `grid-template-columns:minmax(0,780px) var(--rail-w);justify-content:center`.
  - l.184 `justify-self:center` → `stretch`.
  - Result: the rail stands 28px from the feed and the pair is centred beside the panel. 1440 is unchanged.

### LAY-06: high. On a fact sheet at 1920 to 2560 the body's rules and frames run 1,400 to 1,860px with the words in the first 700
- **Where:** every fact sheet at 1920 (main column 1422px) and 2560 (1864px).
- **Selectors:**
  - `kit/kit.css` l.81 `.mh-bm-row{border-top:1px solid…}`: the body map, shared with the community;
  - `library/library.css` l.182 `.claims`, l.208 `.studies`, l.217 `.sources`, l.180 `.ev-box`, l.223 `.checked`.
- **Evidence:**
  - At 2560, nine body-map rows draw 1864px rules, with the words ending by x≈1000.
  - `.ev-box` and `p.checked` are 1864px frames, with 1,188 and 1,236px of empty run.
  - The claims and risks are 1864px rows.
  - Image: `sheet-body@2560.jpg`.
- **Rule:**
  - BRAND *The frame*: no rule runs long ("having the lines that long looks ridiculous");
  - what a card lists flows into more columns as it widens;
  - a list of short lines keeps a reading width.
- **Fix (verified at 1440, 1920 and 2560; no sideways scroll):**
  - `kit/kit.css`, in both apps: `@container mh-bm (min-width:84rem){.mh-bm-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:56px}}`.
  - `library.css`: `.le-main{container-type:inline-size}` and `@container (min-width:1400px){.claims,.studies,.sources{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:28px}}`.
  - l.180 and l.223: add `max-width:1040px`.
  - Result: rows of 904px at 2560 and 683px at 1920, and 1040px boxes. 1440 is unchanged at 981px.

### LAY-07: medium. Bars over 480px, and rows whose name and score stand more than 560px apart
- **Where:**
  - the fact sheets' Signal bar, on all 122 sheets;
  - the community's space page ("Rated by use", the split bar) and Quests.
- **Selectors:**
  - `library/library.css` l.150 `.sig-scale` (no max width);
  - community `web/styles.css` l.234 `.bar`, l.773 `.split`, l.356 `.uses`, l.359 `.use{grid-template-columns:minmax(0,1fr) auto}`.
- **Evidence:**
  - `.sig-scale` is 637px at 1440, 892 at 1024 and 1099 at 2560.
  - The community's bars are 738–746px from 1024 to 2560.
  - Measured live at 1440: "Injury healing" ends at x=409 and its score at 1041, 632px apart; "Joint pain" 660px.
  - Images: `comm-space-bars@1440.jpg` (red line at 480px), `sheet-2560-glance.jpg`.
- **Rule:** BRAND *The frame*: a bar stays 48 to 480px; never a gap between a name and its number.
- **Fix:**
  - `library.css` l.150: add `max-width:480px`. Verified: 480px at every width.
  - `web/styles.css` l.234 `.bar` and l.773 `.split`: add `max-width:480px`.
  - l.356 `.uses`: add `max-width:480px`, which keeps each use's name, score and bar inside 480px.

### LAY-08: medium. The community's page heads come in two kinds, neither of them the website's
- **Where:** every community screen, at every width.
- **Selectors:** `web/styles.css` l.218 `.page-h{display:flex;align-items:flex-end;justify-content:space-between}`, l.220 `h1{margin:8px 0 0}`, l.253 `.feed-hero{padding:26px 30px 28px;border:1px solid var(--line)}`, l.385 `.hero{padding:30px 30px 26px;border:1px solid var(--line)}`.
- **Evidence (1440):**
  - Five screens open in a framed plate: home, signal, space, profile and how.
  - Ten open on an open head. Four of these (popular, explore, builders, quests) set their line beside the headline: `p.cap` at x=768, 472px right of the h1 at 296.
  - The kicker sits 7px over the h1; on the website it is 16px.
  - The h1 tops are at y=145, 153, 170, 172 and 189.
  - Image: `comm-heads@1440.jpg`.
- **Rule:**
  - BRAND *The frame*: every heading stands above its block (the owner turned the side-by-side head down on November 18);
  - decision of November 11, call 11 (page heads are open bands, not plates);
  - November 13, call 4 (the community takes the website's frame).
- **Fix:**
  - l.218 → `.page-h{display:grid;gap:12px}` and `.page-h .cap{max-width:50ch}`.
  - l.220 → `margin:16px 0 0`.
  - l.253 → `.feed-hero{padding:0;border:0}`.
  - For `.hero`: move its kicker, h1 and lede out of the plate in `web/ui/pages/space.js`, `profile.js`, `info.js` and the Signal page. The plate keeps its stats and drawing.

### LAY-09: medium. The page margin is set four ways; at tablet widths the front page and its own foot miss by 4 to 15px
- **Where:**
  - `/` and `/how-it-works/` from 561 to 900;
  - every page against the community at 701 to 860.
- **Selectors:**
  - `styles.css` l.51 `--page-pad:clamp(16px,4vw,96px)`, overridden by l.390 `.wrap{padding-left:20px;…}` (≤900) and l.673 (≤700);
  - `home.css` l.645 `.fp-wrap{padding:0 24px}` (≤860) and l.655 `{padding:0 16px}` (≤560), and l.787–788 `.hs-way{--hw:24px}` and `16px`;
  - `my/my.css` l.82; `ai/plan.css` l.162;
  - in the community, `.layout` at 16px from 860.
- **Evidence:** measured live.

  | Width | Front page's content | Its foot |
  | --- | --- | --- |
  | 880 | 35.2px | 20px |
  | 768 | 24px | 20px |
  | 640 | 24px | 16px |

  Images: `home-edges@880.jpg`, `home-edges@768.jpg`.
- **Rule:** BRAND *The frame* (one margin, from 16 to 96px); one left edge.
- **Fix (verified at 880, 768 and 640, with no overflow):**
  - Keep l.51, and add `@media (max-width:900px){:root{--page-pad:20px}}` and `@media (max-width:700px){:root{--page-pad:16px}}`.
  - Delete `styles.css` l.390 and l.673, `home.css` l.645, l.655, l.787 and l.788, `my.css` l.82 and `plan.css` l.162.
  - Result: the front page, the Library and the foot all sit at 20, 20 and 16.

### LAY-10: medium. The Library's "What moved this week" is capped at 1240px and centred
- **Where:** `/library/` at every width over 1320.
- **Selector:** `library/library.css` l.311 `.wrap.lib-moves{width:calc(100% - 80px);max-width:1240px}`.
- **Evidence:**
  - At 1440, insets of 100 and 100 against the page's 58; at 2560, 660 and 660 against 176.
  - The search, stats and h1 are on the edge.
  - Images: `library-moves@1440.jpg`, `library-moves@2560.jpg`.
- **Rule:** one left edge; symmetric insets.
- **Fix (verified at 58/58 and 176/176):**
  - l.311 → `width:calc(100% - 2 * var(--page-pad));max-width:calc(var(--page-max) - 2 * var(--page-pad))`.
  - Delete l.408 and l.409 with LAY-09.
- **Caution:** the box is 137px tall at that width, where it was 175, so set l.324 `.lib-moves.is-wait` to `min-height:137px` above 1320px. Otherwise the box moves when the Signal arrives (decision, November 15).

### LAY-11: medium. The website's side panel is 300px; Ask Sig's, the community's and the token are 272px
- **Where:** every website page, when the menu opens, from 1024 to 2560.
- **Selector:** `styles.css` l.574 `.os{--os-w:300px}`. Compare `ai/term.css` l.299 `.sg{--sg-w:272px}`, the community's `--side-w`, and the token `side-panel`.
- **Evidence:**
  - Measured live: `.os-side` is 300px at 2560, 1440, 1024 and 768.
  - Ask Sig's and the community's docked panels are 272px. Both use `min(86vw,300px)` only as a drawer under 900 and 1280px.
  - Image: `side-widths@1440.jpg`.
- **Rule:** token `side-panel` (272px); the brief (`.os-side` 272px); principle 4.
- **Fix (verified on `/library/`, a fact sheet and `/about/`; nothing cut):**
  - l.574 → `--os-w:272px`.
  - Add `@media (max-width:900px){.os{--os-w:300px}}`, as Ask Sig's drawer does at `ai/term.css` l.390.

### LAY-12: medium. Vertical rhythm: the front page's beat is 177px; four section breaks are not
- **Where:** `/` and `/how-it-works/` at every width; `/story/`; the Library's explainer band.
- **Selectors:**
  - `home.css` l.750 `.hs-finale{height:1600px}`, l.755 `.hs-close{position:absolute;top:1120px}`, l.701 `.hs{margin:40px 0 0;padding:0 0 40px}`;
  - `styles.css` l.735 `.sy-sec{padding:96px 0}`, l.171 `.band{padding:96px 0}`.
- **Evidence:** ink to ink, measured. The front page's beat is 88px + a hairline + 88px = 177px (129px at 860 and under).

  | Section break | 1440 / 2560 | 1024 | 860 and under | Beat |
  | --- | --- | --- | --- | --- |
  | Finale to "Signal, not noise" | 308px | 330px | 105px | 177 / 129 |
  | How it works, finale to the questions | 283px | 306px | | 177 / 129 |
  | Ways in to the violet band's edge | 104px | | | 88 |
  | Story sections | 193px (96 + 96) | | | 177 |
  | Library band | 96px each side | | | 88 |

  Image: `home-finale-gap@1440.jpg`. The finale's buttons sit twice as far above the hairline as the kicker sits under it.
- **Rule:** the brief's item 5, one scale.
- **The scale:**
  - 88px each side of a section hairline, 64px at 860 and under;
  - 56px between blocks in a page (`.pg-sec`, `.doc h2`, and `.le-sec` 28+28);
  - 64px under a page head;
  - 14px between cards.
- **Fix:**
  - l.750 → `height:auto;padding-top:1120px`.
  - l.755 → `position:relative;left:auto;right:auto;top:auto`.
  - l.701 → `margin:24px 0 0;padding:0 0 88px`, plus `@container fp (max-width:860px){.hs{padding-bottom:64px}}`.
  - `styles.css` l.735 and l.171: `96px` → `88px`.
  - Verified on `/`: 177px at 1024 to 2560 and 129px at 768 and 390. On `/how-it-works/` the gap comes to 153px, because its closing block sits 24px below its own box there; check it when applying.

### LAY-13: medium. In the Library's cards, the compound names sit at two or three heights in a row
- **Where:** `/library/` and `/goals/*/` from 768 to 2560.
- **Selector:** `library/library.css` l.80 `.lc-top{display:flex;align-items:center;justify-content:space-between;gap:10px}`.
- **Evidence:**
  - The top line is 18px with no Signal, 28px with the Signal chip, and 36px when the family wraps beside the chip.
  - So names sit 49, 59 or 67px down their card. The spread is up to 19px, in 26 of 31 rows at 1440 and 17 of 18 at 2560.
  - Gutters (14/14), card heights per row and the last row are right.
  - Image: `library-card-names@1440.jpg` ("Ashwagandha" sits 10px higher than its row).
- **Rule:** the brief's item 6, a grid's rows aligned.
- **Fix (verified: every name 67px down at 1440 and 2560):** l.80, add `min-height:36px`.

### LAY-14: medium. The community's frame differs from the website's at tablet widths, and its search sits on the other side
- **Where:**
  - every community screen from 701 to 860 (measured at 768);
  - the bar's order from 861 up.
- **Selectors:** `web/styles.css` l.798–806 `@media (max-width:860px){:root{--top-h:56px} .topbar{padding:0 10px 0 8px} .layout{padding:0 16px 96px} .search{display:none}}`, l.98 `.search{flex:0 1 420px}`, l.107 `.top-actions{margin-left:auto}`.
- **Evidence:**
  - At 768: the community's bar is 56px tall with 8 and 10px insets, a 16px content edge and no search. The website's is 60px, with 24px insets, a 20px edge and a search box. Its 56px bar starts at 700.
  - From 861: the community's search is a 420px box after the logo (x=285 at 1024). The website's is 300px, at the right (x=526).
  - Image: `bars@768.jpg`.
- **Rule:** decision, November 13 call 4 (the community takes the website's top bar); principle 4.
- **Fix:**
  - Move `--top-h:56px` and the `.topbar` padding from the 860 query into `@media (max-width:700px)`.
  - Give `.layout` 20px from 701 to 900 (it follows `--page-pad` once LAY-09 is in).
  - l.98 → `.search{flex:0 1 300px;margin-left:auto}`.
  - l.107: `margin-left:auto` → `0`.

### LAY-15: medium. The community's foot is a different component from the website's
- **Where:** every community screen.
- **Selectors:** `web/styles.css` l.635–643 (`.foot`, `.foot-in`, `.foot-row`, `.foot-links`).
- **Evidence:**
  - The community's foot is 193px at 1440: a 24px logo, one row of ten links, the disclaimer and ©.
  - The website's: the weekly band; then a 380px brand column (26px logo, "Peptides, without the sales pitch.", the disclaimer) beside four columns (Explore, Community, How it works, Contact); a last line; and the big word.
  - Image: `feet@1440.jpg`.
- **Rule:** BRAND *The frame* (the foot); *Logo* (26px in a foot).
- **Fix:** give the community the website's `.foot-grid` (the brand column and the four `.foot-col` columns, with the same links) and the last line, from the shared kit. The weekly band and the big word can stay out of the app.

### LAY-16: medium. On a phone, Ask Sig has four left edges: 2, 4, 10 and 16px
- **Where:** `/sig/` and `/ai/` at 700px and under (measured at 390).
- **Selectors:**
  - `ai/term.css` l.280 `.tm .ai-dock{padding:8px 10px …}`; l.272 `.tm .ai-bar{padding:0 6px 0 4px}`;
  - `ai/ai.css` l.504 `.sheet-body>.card:not(.help){margin-left:-14px;margin-right:-14px;border-left:0;border-right:0}`, written for a 14px pane that is now 16px (`--tm-px:16px`, l.266).
- **Evidence:**
  - The conversation's words are at 16px.
  - The typing box and its small print are at 10px, the first tab at 4px.
  - In an answer, the stack card runs from 2 to 388px, with a left hairline and no right one.
  - Image: `asksig-edges@390.jpg`.
- **Rule:** one left edge; symmetric padding; square cards with a 1px frame (BRAND *Square*).
- **Fix:**
  - l.280: padding → `8px var(--tm-px) calc(8px + env(safe-area-inset-bottom))`.
  - l.272 → `padding:0 var(--tm-px)`.
  - Delete `ai/ai.css` l.504.
  - Verified: the box and small print at 16 and 16; the card from 16 to 374 with four borders. The tab change was not run live.

### LAY-17: low. The fact sheet's glance has a ragged bottom
- **Where:** fact sheets from 1101px.
- **Selector:** `library/library.css` l.119 `.le-glance-in{align-items:start}`, l.120 `.le-left{display:grid;gap:14px}`.
- **Evidence:**
  - The left column (chart and facts) ends at y=1768 at 1440; the Signal plate at 1602, 166px short.
  - At 2560, 1746 and 1806.
  - Image: `sheet-2560-glance.jpg`.
- **Fix (verified; both end at 1768 and at 1806):**
  - l.119 → `align-items:stretch`.
  - l.120: add `grid-template-rows:auto 1fr`.

### LAY-18: low. The side panels' rows don't share one left edge
- **Where:**
  - the website's panel on every page, and Ask Sig's;
  - the community's panel.
- **Selectors:**
  - `styles.css` l.581 `.os-head{padding:0 0 0 6px}`, l.591 `.os-places a{grid-template-columns:20px …;column-gap:10px}`, l.594 `.op-g{width:20px}`, l.588 `.os-ask{padding:0 12px;gap:10px}`;
  - `ai/term.css` l.302 and l.309;
  - community l.143 `.side-head`, l.171 `.side .family a`, l.196 `.nav-i{gap:10px}` with 18px icons.
- **Evidence:**
  - Website: logo at x=18; "More" rows and legal at 22; glyphs at 24; the ask button's ring at 25 and its label at 51; places' labels at 52.
  - Community: places' labels at 52, menu labels at 50 (icons at 22), spaces at 56.
  - Images: `site-side-edges@1440.jpg`, `comm-side-edges@1440.jpg`.
- **Fix:** one icon edge at 22 and one label edge at 52.
  - `.os-head` and `.sg-head`: padding-left `6px` → `10px`, which puts the logo at 22.
  - `.os-places a{grid-template-columns:16px minmax(0,1fr) auto;column-gap:14px}` and `.op-g{width:16px;height:16px}`.
  - `.os-ask` and `.sg-new`: `padding:0 12px 0 9px;gap:14px`.
  - Community `.nav-i{display:grid;grid-template-columns:18px minmax(0,1fr) auto;column-gap:12px}`, with `.side-head` the same as `.os-head`.

### LAY-19: low. The side panel's head isn't on the bar's centre line
- **Where:** the website's drawer, the community's docked panel, and Ask Sig at 901 to 2560.
- **Selectors:** `styles.css` l.581, community l.143, `ai/term.css` l.302 (each `height:44px`).
- **Evidence:**
  - The website's drawer: logo and close button centred at y=32, the bar's items at 30.
  - The community: the logo at 66 and the search at 63.5, under the 34px preview banner.
  - Ask Sig: the logo at 32, the window's tab bar at 38.
  - Images: `asksig-head-line@1440.jpg`, `comm-head-line@1440.jpg`.
- **Fix:**
  - `.os-head` and `.side-head`: `height:40px`.
  - `.sg-head`: add `margin-top:6px`.

### LAY-20: low. On two-line items, the level seals sit between the lines
- **Where:** the Library's "Two kinds of evidence" key (all four items at 390, one at 1440) and the community's How it works at 390.
- **Selectors:** `library/library.css` l.98 `.level-key li{align-items:center}`; community `.ledger.levels` (`web/styles.css` l.504, drawn by `web/kit/signalviz.js`).
- **Evidence:** the 26px seal is centred 11.5px below its first line. Measured from the capture's element boxes.
- **Fix:** `align-items:start`, plus `.level-key .seal{margin-top:-2px}`, and the same in the community.

### LAY-21: low. Gutters that aren't equal both ways, or aren't the site's 14px
- **Where:**
  - Ask Sig's "Filling first", every width;
  - the community's grids (explore, profile badges, stats).
- **Selectors:** `ai/ai.css` l.449 `.ai-focus{gap:8px 14px}`; community l.424 `.space-grid`, l.489 `.badges` and l.499 `.stats` (`gap:10px`).
- **Evidence:** rows 8px apart against columns 14px apart. The community's card grids use 10px where every grid on the website uses 14px (the `stack` token).
- **Fix:** `gap:14px` in all four.

### LAY-22: low. Two framed controls inset their parts unevenly by 3px
- **Where:** the front page's and How it works' three ways in; Ask Sig's typing box.
- **Selectors:** `home.css` l.275 `.fp-way{padding:14px 18px 14px 15px}`; `ai/term.css` l.149 `.tm .ai-composer{padding:6px 10px 6px 16px}`.
- **Evidence:**
  - The way's icon tile is 16px from its left edge and its arrow 19px from its right.
  - The send button is 8px from the box's top and bottom and 11px from its right.
- **Fix:**
  - `.fp-way{padding:14px 15px}`.
  - `.tm .ai-composer{padding:6px 7px 6px 16px}`.

### LAY-23: low. The short-version boxes are narrower than the column's other blocks
- **Where:** `/method/` and `/privacy.html`.
- **Selector:** `styles.css` l.283 `.doc .short{width:fit-content}`.
- **Evidence:** a 583px box, stacked with 740px blocks (the table of pairs, `.calib`, and `.wk-get` on the weekly issue).
- **Fix:** `width:auto`, so the box fills the 740px column.

### LAY-24: low (the book is corrected). The book and tokens disagree with the frame as built
- **Where:** `design/BRAND.md` *The frame*; `design/tokens.json` `pad`, `side-panel` and `title-bar`.
- **Evidence:**
  - The top bar is 56px at 700px and under (`styles.css` l.667) and in the community; the book says 60px.
  - `pad` says "40px (20px from 701 to 900px wide, 16px on a phone)". The pages use `clamp(16px,4vw,96px)`.
  - `side-panel` says the 300px drawer is "on a phone". As built, it is under 900px for Ask Sig and under 1280px for the community.
  - `title-bar` says the community's bar is 52px. It is the website's 60px.
- **Fix (the text):**
  - BRAND: "Top bar (60px, 56px at 700px and under, sticky)".
  - `pad`: "the page's side margin is `--page-pad`, 4vw from 16 to 96px (20px from 701 to 900px, 16px under 700)".
  - `side-panel`: "272px; up to 900px wide, a drawer of min(86vw, 300px)".
  - `title-bar`: drop the community clause.

---

## Systemic: what should be one thing everywhere

| What | Today | The one value |
| --- | --- | --- |
| Page margin | `--page-pad` (4vw), `.wrap` overrides of 20 and 16, `.fp-wrap` 24 and 16, `.my-wrap` and `.plan-wrap` 40 and 20, the community 24 and 16 from 860 | `--page-pad`: clamp(16px, 4vw, 96px), 20px at ≤900, 16px at ≤700, the only source in both apps (LAY-09) |
| Page head | five tops and gaps; the community uses plates or open heads, with a 7px gap | kicker 72px under the bar (44px under 600px); 16px to the h1; 18px to a meta line or 22px to a lede; 64px to the hairline; 64px to the content (LAY-01, LAY-08) |
| Content width | full width, plus 1320 (story), 820 (My stack, plan) and 1240 (moves) caps | the page's whole width (to 2400px); text keeps 52ch, lists of short lines keep 1040px (LAY-03, 04, 10) |
| Side panel | 300 (site) and 272 (Ask Sig, community); icons at 22/24, labels at 50/51/52/56, head centred at 32 against the bar's 30 | 272px (min(86vw,300px) at ≤900); icon edge 22, label edge 52; the head on the bar's centre line (LAY-11, 18, 19) |
| Top bar | 60px (site) and 56px from 860 (community); search on the right on the site, on the left in the community | 60px (56px at ≤700), 24px insets (8 and 10 at ≤700), search 300px at the right in both (LAY-14, 24) |
| Section beat | 88 (front page), 96 (story, Library band), finale 283 to 330 | 88px each side of a hairline (64px at ≤860); 56px between blocks; 14px between cards (LAY-12) |
| Card padding | 20 and 24 (site); 32 (front page plates, steps); 16 (community `.card`, l.227) | 20px for cards, 24px for plates, 20px on a phone; the community's `.card` from 16 to 20 |
| Card gutter | 14 (site), 10 (community), 8 and 14 (Ask Sig) | 14px both ways (LAY-21) |
| A row's parts | `space-between` heads; bars to 1,099px | title and tag, or heading and signer, side by side (`flex-start`, 12 to 18px apart); bars 48 to 480px (LAY-02, LAY-07) |
| Breakpoints | site 700 and 900 (frame), 860 and 560 (front page container), 1100 (bar links); community 860 and 1280 | 700, 900, 1100 and 1280 in both apps; the front page's 860 and 560 steps go with LAY-09 |

## The next update, in my area

1. **Make the frame and the page head shared kit components** (`kit/kit.css` and `kit/kit.js`, used by both apps): `.page-head` (kicker, h1, line, hairline), the side panel's row grid (icon at 22, label at 52), and the foot. The community and the website then can't drift. *Touches:* every website page, every community screen, Ask Sig's side panel.
2. **Teach `scripts/check_layout.mjs` what this audit had to find by hand:**
   - run it on the community preview's screens;
   - check every flex or grid row (headings with signers, card heads, field rows), not only `li` and `tr`;
   - fail a bar over 480px;
   - fail a block that starts 2 to 40px off the page's edge (a near miss);
   - fail an h1 whose top isn't the page head's.

   *Touches:* CI for both apps. These are the kinds that came back after November 18.
3. **A wide-screen pass for the fact sheet with the owner at 2560,** after LAY-02, 06 and 07. The sheets are the site's most numerous pages and the most read after the front page. Their body column is the one place where 1,800px rows remain.
4. **Put the rhythm in the tokens:** `section` 88/64, `block` 56, `stack` 14, `head-top` 72/44 in `design/tokens.json`, as CSS variables in both apps. A new page then can't invent a 96 or a 1600px finale. *Touches:* front page, How it works, story, Library, the community's heads and rail.
5. **One foot for both apps,** from the kit (LAY-15), with the community's links in the four columns. It is the one frame component the two apps still draw differently.

---

## Notes for the art director
- **Not reported (all passed):**
  - The top bar has the same item boxes on all 22 website pages at every width.
  - Ask Sig's active tab sits on its window at 390, 768, 1024, 1440 and 2560: no hairline under it.
  - ⌘K is centred to the pixel at every width and square.
  - The foot's parts match on every page; only the weekly pages drop the weekly band, on purpose.
  - Numbers are right-aligned in the method's placebo table.
  - Card heights are equal per row in every grid checked.
  - The weekly email is a centred 600px column with symmetric 16px phone insets.
  - The Signal's loading state keeps its layout.
- **Seen in passing, for `design-clean`:** Ask Sig's answer labels the stack card "// your stack, checked together", a code-comment label (`asksig-answer@390-0.jpg`).
- **Working files:** the measuring scripts and the CSS used for the verifications are in `.design/work/design-layout/` (`fix_*.css`).
