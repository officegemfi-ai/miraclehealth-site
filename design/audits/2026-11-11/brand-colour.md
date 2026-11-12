# Brand and colour: audit report

**State:** Graphite holds on every rendered page (no light grounds; 98.8% of text colours and 95% of drawn borders sit on a token), but the one-white-button rule fails on every desktop screen because the side panel's Join is white, two buttons paint white words on white, and several older pieces (the fact-sheet chips, Ask Sig's gap and greys, the Library's flow panel, the Home graph, the plan card) still run on colours of their own.

Method: all 92 data files (23 pages × 4 widths) mapped with `ds.nearest_token` (off-palette = distance > 3); a live Playwright pass at all 4 widths for what the data can't hold (all four border sides, `::before/::after`, SVG stroke and fill, placeholders, filters); live contrast at 1440 and 390 with `ds.EFFECTIVE_BG_JS` plus a corrected ratio that blends the text's own alpha and opacity (the helper ignores both); tabbing through 7 pages at 1440 and 390; hover, drawer, focus and shared-plan states driven live. Evidence is in `/home/claude/design/evidence/brand-colour/`. Scripts are in `/home/claude/design/tools-brand/`.

---

## Findings (most visible first)

### BRAND-01 · Two or three white buttons on one screen
- **Severity:** high
- **Where:** all 21 windowed pages at 1440 and 1024. The side panel's Join is white and sticky, so it shares every desktop screen with the page's own white button. First screens with 2 or more white buttons: fact sheets (3 at 1440: Join, "Ask Sig about Semaglutide" at y 467, "Share how it went" at y 782), my (3 at 1440 and 1024; 2 at 768 and 390), plan (3 at 1440 and 1024; 2 at 768), notfound, weekly, goal-weight (2 each at 1440 and 1024), story (2 at 1440). Further down, the foot's "Get it weekly" shares a screen with the page's main action on home (5769/6026), story (5136/5321), compare (1174/1373), compare-pair (2895/3163), founders (1315/1610), weekly-issue (2122/2306), goal-weight (5227/5585), my (395/579) and plan (434/676). Fact sheets paint "Share how it went" white three times (y 782, 1036, 2478 at 1440), the first two 254px apart, while the same action in the hero is a hairline.
- **Selector(s):** `div.os-acct > a.btn.lime.sm` (Join; `scripts/build_library.mjs:173`), `div.sg-acct > a.btn.lime.sm` (Ask Sig; `:898`), `div.nf-row > button.btn.bone` (foot, from `scripts/build_pages.mjs:28` `signupForm`), `div.le-signal > a.btn.lime.sm.sig-cta` (`build_library.mjs:655`), `div.side-card > a.btn.lime.sm` (`:670`), `div.vs-act > a.btn.lime` (`:564`).
- **Evidence:** background `rgb(238,236,230)` on all of them. The per-screen counts are in Appendix F. Crops: `white-buttons-sheet@1440.jpg`, `white-buttons-my@1440.jpg`, `white-buttons-my@768.jpg`, `white-buttons-plan@1440.jpg`, `white-buttons-404@1440.jpg`.
- **The rule it breaks:** README, Colour: "One main action per view: the white button… Every other button is a hairline". tokens.json `accent`: "Never two on a screen." Button: "Never two white buttons on one screen."
- **Fix:**
  1. `build_library.mjs:173` and `:898`: change `class="btn lime sm"` to `class="btn line sm"`. Join then becomes a hairline: `styles.css:574` gives it a transparent ground, a `line-2` border and `text` words.
  2. `styles.css`, after line 684, add `.foot .nf-row .btn.bone{background:transparent;border-color:var(--line-2);color:var(--text)}` and `.foot .nf-row .btn.bone:hover{background:transparent;border-color:var(--text);color:#FFFFFF}`. The weekly pages' own form (`.news-form.on-paper`, inside `main`) stays white.
  3. `build_library.mjs:564`, `:655` and `:670`: change `btn lime` to `btn line` (keep `sm`). "Share how it went" is then a hairline everywhere on a sheet, as it already is in the hero, and "Ask Sig about X" is the sheet's one white button.
  - **Check:** on every page and width, no 900px band holds more than one `a`/`button` with background `rgb(238,236,230)`.

### BRAND-02 · White words on a white fill (a blank button, a blank source number)
- **Severity:** high
- **Where:**
  1. `/weekly/1/` at all widths: "Share how it went" (y 2122 at 1440, y 2992 at 390).
  2. Every fact sheet, whenever a reader follows a citation (`a.ref` links to `#src-N`).
- **Selector(s):**
  1. `p.wk-close > a.btn.lime`, rule `pages/pages.css:109` `.wk-close .btn{color:var(--text);text-decoration:none}`.
  2. `ol.sources > li:target::before`, rule `library/library.css:244` `.sources li:target::before{background:var(--accent)}`.
- **Evidence:** button text `rgb(238,236,230)` on `rgb(238,236,230)`, which is 1.00:1. The targeted source's counter is `rgb(238,236,230)` on `rgb(238,236,230)`, so the number vanishes. Crops: `weekly-issue-white-on-white@1440.jpg` (a blank white slab) and `sheet-source-target@1440.jpg` (a blank chip beside source 2).
- **The rule it breaks:** tokens.json `on-accent`: "Words on accent (16:1)".
- **Fix:**
  1. `pages/pages.css:109`: change `.wk-close .btn{color:var(--text);text-decoration:none}` to `.wk-close .btn{text-decoration:none}`. Then `styles.css:571` `.btn.lime{color:var(--on-accent)}` applies, giving 16:1.
  2. `library/library.css:244`: change it to `.sources li:target::before{background:var(--accent);color:var(--on-accent)}`.

### BRAND-03 · Three chip systems on one sheet: hairline chips beside tinted pills
- **Severity:** high (every full fact sheet, compare pairs, method)
- **Where:**
  - Harm-frequency chips on every full fact sheet: 7 on semaglutide, 5 on creatine at 1440.
  - Compare pairs: 8 on compare-pair.
  - The "Fact-checked" chip in every full fact sheet's first screen.
  - The method page's confidence chips (10).
  - All widths.
- **Selector(s):** `ul.claims.risks > li > span.hc.hc-{common,uncommon,rare,theoretical,unknown}`, `ul.cmp-list > li > span.hc.*`, `div.le-badges > span.check`, `td > span.conf.conf-{good,fair,weak}`. Rules: `library/library.css:8, 20–25` and `styles.css:552–555`.
- **Evidence:**
  - **Shape.** `.hc` and `.check` have `border-radius: 40px` on 25–26px chips, which makes them pills. `.conf` has 20px on 19px chips. The `.ev`/`.st` chips beside them are 5px with a `line-2` hairline: `library.css:361` turns those into hairlines but leaves `.hc` and `.check` out.
  - **`.hc-common`.** Fill `rgba(224,104,92,.14)`, which is `rgb(43,31,32)` on the card. Words `#FFB4A9` (d = 37.5 from `down`).
  - **`.hc-uncommon`.** Fill `rgba(232,183,90,.14)`, words `#F2C46B` (d = 23.6 from `amber`).
  - **`.hc-rare/.hc-unknown/.hc-theoretical`.** Fill `rgba(238,236,230,.06/.07)`. Muted words on that fill drop to 4.68:1, below the brand's 5:1.
  - **`.check`.** Fill `rgba(255,255,255,.08)`, border `rgba(255,255,255,.18)`.
  - **`.conf-good`.** Fill `rgba(111,168,255,.14)`.
  - Crops: `sheet-harm-chips@1440.jpg`, `sheet-factchecked-chip@1440.jpg`, `method-conf-chips@1440.jpg`.
- **The rule it breaks:** Shape and depth: "radius-control for buttons, fields and tabs… No pills". tokens `radius-control`: "chips". Colour: "Never use colour as decoration". The site's own Plate note (`library.css:351`): "Pills are hairline labels".
- **Fix:**
  - `library/library.css:361`: add `.hc,.hc-common,.hc-uncommon,.hc-rare,.hc-theoretical,.hc-unknown,.check` to the selector list. That gives `border:1px solid var(--line-2);border-radius:5px;background:transparent;color:var(--text)`.
  - After line 363, add `.hc-rare,.check{color:var(--text-2)}.hc-theoretical,.hc-unknown{color:var(--muted)}`. The frequency is then carried by the words and the grey, not by a coral or amber tint.
  - `styles.css:552–555`: change to `.method .conf{display:inline-block;padding:2px 8px;border:1px solid var(--line-2);border-radius:5px;background:transparent;color:var(--text);font:600 10.5px/1.4 var(--mono);letter-spacing:.06em;text-transform:uppercase}` and delete the three `.conf-good/.conf-fair/.conf-weak` rules.

### BRAND-04 · The wordmark is never in the foot, so phones never see it
- **Severity:** high (every page, every width)
- **Where:** all 21 pages with a foot, at every width. At 768 and 390 the side panel is a drawer, so the wordmark is not on screen at all unless the drawer is opened.
- **Selector(s):** `footer.foot.win-foot`, built by `osClose()` (`scripts/build_library.mjs:212–235`; `stampShell` writes the same shell into index, privacy, terms and 404). `styles.css:396` `.foot img{height:24px;width:auto}` is styled but unused.
- **Evidence:** across 92 data files there are 46 logo images. 42 are `a.os-logo > img` (1440 and 1024 only) and 4 are `a.sg-logo > img`. None is in a foot. Crops: `foot@1440.jpg`, `foot@390.jpg`.
- **The rule it breaks:** Logo: "Set it 22px tall in the side panel and 24px in a foot."
- **Fix:** in `osClose`, in the last `foot-row` before `<p>Experiences…`, add `<a class="foot-logo" href="/"><img src="/logo.webp" alt="Miracle Health" width="69" height="24"></a>`. `styles.css:396` sets it 24px tall, which is 69×24 at the file's 480×168 ratio.
  - **Check:** an `img[src="/logo.webp"]` of height 24 inside `footer.win-foot` on every page and width.

### BRAND-05 · Ask Sig's window sits on its own grounds and greys
- **Severity:** medium
- **Where:** `/sig/` (and `/ai/`, which redirects there), all widths.
- **Selector(s) and evidence:**
  - **The gap round the window is `surface`, not `page`.** The screenshot pixel is `(11,15,18)` on /sig/ against `(8,9,11)` on every other page, and the corner masks `div.tm-title::after` paint `rgb(11,15,17)`. Cause: `ai/term.css:19` `--tm-page:var(--darker)`, and `styles.css:23` sets `--darker:#0B0F11`.
  - **The words are alpha greys.** 40 of 79 text elements at 1440 use `rgba(238,236,230,.6)` (about `rgb(147,148,145)`; `muted` is `rgb(134,140,138)`) or `.74` (about `rgb(179,179,175)`; `text-2` is `rgb(164,169,166)`): `span.tm-sb-safe` "safety on" (muted on every other status bar), `span.tm-sb-rules`, `p.sg-legal a`, `span.tm-now`, `h2.sg-k`, `span.tm-dim` and others. Source: `term.css:20`.
  - **Washes:**
    - `button#sg-new` has `rgba(238,236,230,.03)` (`term.css:440`).
    - `button.ai-start` has `.025` (`:170`).
    - The current place `nav.sg-site > a[aria-current]` has `.06` (`:476`), where every other page uses `.08`.
  - **The prompt's ground.** The Ask Sig prompt `div.ai-composer` is `rgba(0,0,0,.28)`, which is `rgb(8,11,12)`, a well darker than the window (`term.css:186, 187, 190`). The Home prompt `form.hero-search.hp` is on `bar` `rgb(18,23,26)`.
  - **Crops:**
    - `asksig-grounds@1440.jpg`.
    - `asksig-status@1440.jpg` against `site-status@1440.jpg`.
    - `asksig-composer-unfocused@1440.jpg` against `home-prompt-unfocused@1440.jpg`.
- **The rule it breaks:**
  - Colour, Grounds: "`page` fills the gap round the window", "`surface` is the ground of every page and window".
  - Words: `text`, `text-2`, `muted`.
  - Prompt: "Field: `bar` ground, `line-2` border (brighter on focus)".
  - States: "Current … 8% `text` fill".
  - Button: hairlines are transparent.
- **Fix (`ai/term.css`):**
  - `:19` `--tm-page:var(--darker)` → `--tm-page:#07090A`.
  - `:20` `--tm-t2:rgba(238,236,230,.74)` → `#A4A9A6` and `--tm-t3:rgba(238,236,230,.6)` → `#868C8A`.
  - `:137` `.tm-sb-safe{…color:var(--tm-t2)}` → `color:var(--tm-t3)`, which matches the site's `.ws-safe`.
  - `:186`, `:187` and `:190`: the three `background:rgba(0,0,0,.2/.32/.28)` → `background:var(--tm-bar)`.
  - `:440` `.sg-new{…background:rgba(238,236,230,.03)}` → `transparent`.
  - `:170` `.tm .ai-start{…background:rgba(238,236,230,.025)}` → `transparent`.
  - `:476` `.06` → `.08`.
  - Cross-reference for the type lead: Ask Sig's status bar is `600 11px`, where the site's is `500 11.5px`.

### BRAND-06 · The Library's lede is near-white, every other lede is `text-2`
- **Severity:** medium (first screen of the Library, all widths)
- **Where:** `/library/`, `section.lib-hero p.lede`.
- **Selector(s):** `library/library.css:71` `.lib-hero .lede{max-width:56ch;color:rgba(252,252,252,.86)}`.
- **Evidence:** the colour is `rgba(252,252,252,.86)`, which is `rgb(218,219,219)` on surface (13.9:1). The ledes on home, 404, my, plan and story are `text-2` `rgb(164,169,166)` (8.1:1). In `library-lede@1440.jpg` the lede reads as white beside "Guide:" in `text-2`.
- **The rule it breaks:** Words: "`text-2` for ledes and secondary lines". tokens `lede`: "in text-2".
- **Fix:** `library.css:71`: change `color:rgba(252,252,252,.86)` to `color:var(--text-2)`.

### BRAND-07 · The story's ring spins, and its centre dot is drawn through the "12"
- **Severity:** medium (the story page's first screen, all widths)
- **Where:** `/story/` hero, `div.sy-ring > svg.ring` (320px; 220px at 390) and `span.sy-ring-n > b` "12".
- **Selector(s):** `styles.css:941` `.sy-ring svg{display:block;animation:sy-turn 60s linear infinite}` and `:944` `@keyframes sy-turn`. `scripts/build_library.mjs:1026` `ringSvg(320, { sw: 26, centerY: 0 })`.
- **Evidence:**
  - The svg's live box is 364×364 for a 320px ring (252 for 220), so it is caught mid-turn. The arcs no longer start from the top in order: pink sits at 12 o'clock, coral to its right.
  - The Interpretation agent's dot (r 10.6px) sits at the ring's centre (519,452), inside the numeral's box (x 483–554, y 411–475). It reads "1●2". At 390 the same thing happens (dot at 195,268; "12" box 170–219 × 237–281).
  - Crop: `story-hero@1440.jpg`.
- **The rule it breaks:**
  - illustration.md: "It never spins."
  - Marks: "Never recolour, outline or spin the ring."
  - Motion: "nothing loops for decoration".
  - Ring README: "centerY … where a ring has words in its middle" (Ask Sig's 212px ring uses `centerY: -44` and clears its "12/12").
- **Fix:**
  - `styles.css:941` → `.sy-ring svg{display:block}`; delete `:944` (`@keyframes sy-turn`) and `:1013`.
  - `build_library.mjs:1026`: change `centerY: 0` to `centerY: -66`, the same 0.21 proportion Ask Sig uses.
  - **Check:** the svg box is 320×320, and the dot clears the numeral by about 14px.

### BRAND-08 · The Home graph glows, draws blood markers and cautions in amber, and labels in pills
- **Severity:** medium (the Home hero; first screen at 1440 and 1024)
- **Where:** `/`, `div.graph-live > canvas`, drawn by `lib/graph.js`. The Community Signal card floats over it.
- **Selector(s):**
  - `lib/graph.js:52–53`: `AMBER = [232, 183, 90]`, `WARN = [232, 183, 90]`.
  - Glow sprites (kind 0 and 1) at `:598, 640, 648, 658, 663, 670`.
  - Additive bloom at `:856` `globalCompositeOperation = 'lighter'`.
  - Pill labels at `:697` `ctx.roundRect(bx, by, bw, bh, bh / 2)`.
  - `styles.css:618` `.hero-card{…background:rgba(14,19,22,.94)}`.
- **Evidence:**
  - In `home-graph-amber-glow@1440.jpg`, HbA1c, eGFR and glucose, and the "!" cautions ("pancreas !", "blood sugar !"), are amber with radial halos.
  - Every label is a full pill.
  - Graph nodes ghost through the translucent Signal card (faint circles under its scale).
- **The rule it breaks:**
  - tokens `amber`: "Not a brand colour" (only the preview banner and a mixed read).
  - Blood tests are the Markers agent's (`op-watch` = `agent-markers` #3FE0C5). Cautions are `op-warn` = `safety` #FF6B5B.
  - README: "no gradients except the Signal's scale bar, no glows". Shape: "No pills". Grounds: `bar` for "anything that floats".
- **Fix:**
  - `graph.js:52`: `AMBER = [63, 224, 197]`. `:53`: `WARN = [255, 107, 91]`.
  - `:697`: change `bh / 2` to `8` (`radius-control`).
  - Draw the points listed above as discs (sprite kind 2) instead of glows and hazes (kinds 0 and 1), and drop the `'lighter'` pass at `:856`.
  - `styles.css:618`: `background:rgba(14,19,22,.94)` → `background:var(--raised)` (`bar`, opaque).

### BRAND-09 · Fact sheets' and My Miracle's hairline buttons are framed in pure white
- **Severity:** medium (every fact sheet's first screen, and My Miracle)
- **Where:**
  - `div.le-actions > a.btn.line.sm` ("Share how it went", "See what members report") on every fact sheet.
  - `div.my-actions > a.btn.line` ("Explore the Library") on /my/.
  - All widths.
- **Selector(s):** `library/library.css:137` `.le-hero .btn.line{border-color:rgba(255,255,255,.3);color:var(--on-ink)}`. `my/my.css:19` `.my-page .btn.line{…border-color:rgba(255,255,255,.3);color:var(--on-ink)…}`.
- **Evidence:** the border is `rgba(255,255,255,.3)`, which is `rgb(84,87,88)` on surface. The same class elsewhere (404 "Ask Sig"/"Home", story "Open the Library", founders "How a report is read") uses `line-2`, which is `rgb(56,59,60)`. Crop: `sheet-hairline-buttons@1440.jpg`.
- **The rule it breaks:** "Every other button is a hairline: `line-2` border, `text` words."
- **Fix:** delete `library.css:137`; `styles.css:574` already gives `line-2`/`text`. In `my.css:19`, change `border-color:rgba(255,255,255,.3);color:var(--on-ink)` to `border-color:var(--line-2);color:var(--text)`.

### BRAND-10 · On fact sheets the side panel's wordmark sits 6px higher
- **Severity:** medium (every fact sheet, at 1440 and 1024)
- **Where:** every fact sheet. Measured on semaglutide, creatine, 5-HTP, cagrisema, semaxselank, anastrozole, b12 and testosterone; all have a 32px head. The Library index is 44px.
- **Selector(s):** `aside#os-side > div.os-head` (`styles.css:760`, `height:44px`). It is a flex child of the 100dvh column. On sheets the long folder tree (`div.os-ctx`, `flex:1 1 auto`) squeezes it.
- **Evidence:**
  - `os-head` computes at 32px instead of 44px.
  - The logo top is y 15 instead of 21, and "Ask Sig a question" is at y 52 instead of 64 on every other page, so the whole panel jumps 12px between the Library and a sheet.
  - Setting `flex:none` on the live page puts them at 21 and 64.
  - Crops: `sheet-side-head@1440.jpg` against `about-side-head@1440.jpg`.
- **The rule it breaks:** Principle 4: "The same side panel, title bar, path and status bar on every page". Logo: "22px tall in the side panel".
- **Fix:** `styles.css:760`: add `flex:none` to `.os-head{…}`.

### BRAND-11 · The Miracle Plan card uses white as a ground, pure-white frames and a gradient
- **Severity:** medium
- **Where:**
  - The `/plan/` empty state, all widths: `section.plan-cta`.
  - A shared plan (`/plan/#…`; verified by building one with the page's own `MHPlan.encode` at 1440 and 390): `div.plan-hero`, `.pillar.is-start`, `.plan-ground`, `.pillar`, `.pchip`, `.pchip-status`. The same card renders in Ask Sig answers and on My Miracle once a plan is kept.
- **Selector(s):** `ai/plan.css:156` (plan-cta), `:16`, `:23` (plan-hero), `:37` (pchip), `:42` (pchip-status), `:56`, `:61–70` (pillars and ground).
- **Evidence:**
  - **The empty-state card.** `plan-cta` has a `linear-gradient(rgba(238,236,230,.08),rgba(238,236,230,.02))` fill and an `rgba(238,236,230,.35)` border, which is `rgb(91,92,92)`. It reads lighter than every other card (`plan-cta-gradient@1440.jpg`).
  - **White as a ground.** In the shared plan, the "Start here" card, the start pillar and the ground bar are filled with `accent` #EEECE6 with dark words.
  - **Other colours:**
    - Pillars use `rgba(255,255,255,.06)` fills and `.18/.3/.34/.45` borders.
    - `.pillar.is-next` is a striped `repeating-linear-gradient`.
    - "Not approved" is in `#F2C46B`.
    - `.plan-hero.is-done` is `#EEF9C4`.
  - Crop: `plan-shared-top@1440.jpg`.
- **The rule it breaks:** "Pages are graphite and near-white"; `accent` is "the white button's fill" only; cards are `surface-raised` with `line`; no gradients; tokens only.
- **Fix (`ai/plan.css`):**
  - **The empty-state card:** `:156` `border:1px solid rgba(238,236,230,.35);background:linear-gradient(…)` → `border:1px solid var(--line);background:var(--card)`.
  - **The start card and start pillar** take the "current" treatment: `:16` `background:var(--bone);color:var(--ink)` → `background:rgba(238,236,230,.08);border:1px solid var(--line-2);color:var(--text)`, and `:61–63` the same for `.pillar.is-start`.
  - **Delete:** `:23` (`#EEF9C4`) and the gradient in `:64` (`.pillar.is-next` → `background:transparent;border-color:var(--line-2)`).
  - **The ground bar:** `:70` `background:var(--bone)` → `var(--line-2)`.
  - **Frames and fills:** `:56`, `:67` white alphas → `var(--line)` and `var(--line-2)`. `:37` `.pchip` background → `var(--card)` with `border:1px solid var(--line)`.
  - **Status words:** `:42` `#F2C46B` → `var(--text-2)`.

### BRAND-12 · Hover states darken frames, lift cards and cast shadows
- **Severity:** medium
- **Where:**
  - Goal cards on `/goals/` and `/compare/`.
  - Library cards on `/library/` and `/goals/weight/`.
  - "Ask Sig a question" in every side panel.
  - Story prints and windows.
  - Ask Sig's starters and New chat.
- **Selector(s) and evidence:** live hover at 1440.
  - **`a.pg-goal`** (`pages/pages.css:34`): the border goes from `rgba(238,236,230,.1)` to `rgba(11,15,17,.32)`, so the frame vanishes on hover (`hover-goals-card@1440.jpg`).
  - **`a.lib-card`** (`library/library.css:98`, then `:371`): the border goes to `line-2` only, the card lifts by `matrix(1,0,0,1,0,-2)` and it casts `rgba(11,15,17,.45) 0 18px 40px -26px` (`hover-library-card@1440.jpg`).
  - **Off-token hover borders:**
    - `a.os-ask`: `.45` border and `.06` fill (`styles.css:767`).
    - `a.sy-print` and `a.sy-win`: `.3` (`styles.css:979, 985`).
    - `button.ai-start`: `.5` border and `.05` fill (`ai/term.css:171`).
    - Read from the code, not hovered live: `button#sg-new` `.45` and `.06` (`term.css:441`); `a.part` an ink border (`library.css:254`).
  - Side panel rows are right: a 5% fill and `text` words.
- **The rule it breaks:** States: "Hover: hairlines brighten to `text`, and rows take a 5% `text` fill." Shadows: "nothing casts one except what floats".
- **Fix:**
  - **Cards to a `text` border:**
    - `pages.css:34` → `border-color:var(--text)`.
    - `library.css:98` → `.lib-card:hover{border-color:var(--text)}` (drop the `transform` and `box-shadow`), and `:371` `var(--line-2)` → `var(--text)`.
    - `library.css:254` → `var(--text)`.
  - **Side panel:** `styles.css:767` → `border-color:var(--text);background:transparent`.
  - **Story:**
    - `styles.css:979` → `border-color:var(--text)` (drop `background:#12171A`).
    - `:985` → `var(--text)`.
  - **Ask Sig:** `term.css:171` and `:441` → `border-color:var(--tm-tx);background:transparent`.

### BRAND-13 · The Library's "How the Signal is made" panel is drawn in the old theme
- **Severity:** medium
- **Where:**
  - `/library/` `#two-kinds div.flow-panel svg.flowviz` (wide and compact versions).
  - The level seals `svg.seal` on /library/ and in Home's example (`span.vs-lvl > svg.seal.seal-forum`).
- **Selector(s):** `library/signalviz.js:27–28, 78, 124, 126, 139, 151, 168–170, 283, 286, 316, 327, 331`. `library/library.css:38` `.flowviz .spin{animation:spin 60s linear infinite;…}`.
- **Evidence:**
  - **Gradient fills:** `url(#fl1-glow)` (a lime halo, .2 to 0), `url(#fl1-core)` (#17231F to #0A110F) and `url(#fl1-card)` (#15201E to #0D1513), the deep green-blacks of the old theme.
  - **Old whites and greys:**
    - #FCFCFC strokes and fills ×282 (d = 30.6 from `text`).
    - The forum grey #A3A198 ×85.
  - **The formula's segments** are #B8E62A, #9BE35A and #6EE7B7 (d = 44.8, 73.1 and 47.9).
  - **Motion:** a dotted ring rotates every 60s.
  - Crops: `library-flowviz-old-greens@1440.jpg`, `library-level-seals@1440.jpg`.
- **The rule it breaks:** "No gradients except the Signal's scale bar, no glows"; illustration.md "no gradients"; Ground: "`surface` or `page`"; Motion: "nothing loops for decoration".
- **Fix (`signalviz.js`):**
  - **Whites and greys:**
    - `:78` `const WHITE = '#FCFCFC'` → `'#EEECE6'`, and the literal `#FCFCFC` at `:283, 286, 316, 327, 331` → `#EEECE6`.
    - `:28` `const FORUM = '#A3A198'` → `'#A4A9A6'` (`text-2`).
  - **Formula:** `:139` → all four segments `LIME`; the legend's words name them.
  - **Glow and gradients:**
    - `:124`: remove the glow circle.
    - `:168–170`: drop the `-glow`, `-core` and `-card` gradients and fill those shapes with `#0E1316` (`surface-raised`).
  - **Spin:** `:126`: remove `class="spin"`, or set `library.css:38` to `animation:none`.

### BRAND-14 · FDA-risk chips are amber, which is not a brand colour
- **Severity:** medium (Library cards, goal pages, the status tracker)
- **Where:** `span.lc-badges > span.st.st-category2` ("FDA safety-risk list") and `span.st.st-restricted` on `/library/` (6 at 1440) and `/goals/weight/` (3), and `div.st-group-h > span.st.*` on `/status/` (6). All widths.
- **Selector(s):** `library/library.css:362` `.st-category2,.st-restricted{border-color:rgba(232,183,90,.55);color:var(--amber)}`.
- **Evidence:** amber words #E8B75A and an `rgba(232,183,90,.55)` border (`rgb(134,109,59)` on the card, d = 114.7). Every other status chip (`st-approved`, `st-supplement`…) is `line-2`/`text`. Crops: `library-card-amber-chip@1440.jpg`, `status-amber-chips@1440.jpg`.
- **The rule it breaks:** tokens `amber`: "The preview's banner ground … and a mixed read. Not a brand colour." Colour: "Never use colour as decoration."
- **Fix:** delete `library.css:362`; the chips then take `:361` (a `line-2` border and `text` words, and the words carry the warning). The dead tints at `:16–17` can go too.

### BRAND-15 · The Library search placeholder fails contrast (3.88:1)
- **Severity:** medium
- **Where:** `/library/` at 1440 and 390: `div.lib-search > input#q`, "Search by name, brand or nickname".
- **Selector(s):** `library/library.css:80` and `:364`. There is no `::placeholder` rule, so Chrome's default applies.
- **Evidence:** the placeholder is `rgb(117,117,117)` on the field's `rgb(20,24,26)`, which is 3.88:1 at 16.5px. Every other field's placeholder is `muted` (5.0–5.4:1). Crop: `library-search@1440.jpg`.
- **The rule it breaks:** "muted for labels, meta… Each reads at 5:1 or better"; WCAG 1.4.3 (4.5:1).
- **Fix:** after `library.css:364`, add `.lib-search input::placeholder{color:var(--muted);opacity:1}`, which gives 5.22:1.

### BRAND-16 · The focus ring disappears on the side panel's Join button
- **Severity:** medium (every page at 1440 and 1024, keyboard users)
- **Where:** `div.os-acct > a.btn.lime` (Join), reached after 20 Tab presses on Home.
- **Selector(s):** `styles.css:765` `.os-fold:focus-visible,.win-menu:focus-visible,.os-side a:focus-visible{outline:2px solid var(--text);outline-offset:-2px}`.
- **Evidence:** the outline is `solid 2px rgb(238,236,230)` at offset −2px, drawn inside an `rgb(238,236,230)` fill, which is 1.0:1. In `focus/home@1440-19.jpg` no ring is visible.
  - Every other stop shows the ring (`focus/home@1440-04.jpg`). Ask Sig's Join uses +3px and is fine.
  - The prompts (Home's "look up" and Ask Sig's composer) show focus by brightening their border on all sides, as the Prompt spec says (`asksig-composer-focused@1440.jpg`).
- **The rule it breaks:** States: "every focusable thing gets a solid 2px `text` ring, 2–3px out. It contrasts at 15:1 or more on every ground."
- **Fix:** `styles.css:765`: change `.os-side a:focus-visible` to `.os-side a:not(.btn):focus-visible`, and add `.os-side .btn:focus-visible{outline:2px solid var(--text);outline-offset:3px}`. The account row has 10px of side padding, so the ring isn't clipped.

### BRAND-17 · The Library's pressed filter chip is a white button
- **Severity:** low
- **Where:** `/library/` `div.lib-chips > button[aria-pressed=true]` ("All 300" by default), all widths. It is in the first screen at 768.
- **Selector(s):** `library/library.css:367–368`.
- **Evidence:** background `rgb(238,236,230)` with `on-accent` words. It reads as the page's main action beside the hairline chips. Crop: `library-chip-all-white@1440.jpg`.
- **The rule it breaks:** `accent` is only for the one main action. States: "Current: the current place, row or tab takes an 8% `text` fill and `aria-current`."
- **Fix:** `:367` → `.lib-chips button[aria-pressed=true]{background:rgba(238,236,230,.08);border-color:var(--line-2);color:var(--text)}`. `:368` → `…span{color:var(--muted);opacity:1}`.

### BRAND-18 · Ask Sig's title-bar ring is 30px on phones
- **Severity:** low
- **Where:** `/sig/` at 700px and under. Measured at 390: `span.ai-sig.tm-logo > svg.ring` at (50,11), 30×30. Every other page's title bar is 18×18 at 390, and so is Ask Sig's at 768 and up.
- **Selector(s):** `ai/term.css:388` `.tm-logo{width:30px;height:30px}`. The svg is generated at 18px and scaled up, so its gaps and strokes scale too.
- **Evidence:** `asksig-ring30@390.jpg`.
- **The rule it breaks:** Title bar: "Sig's ring at 18px". Ring: "18px in every title bar".
- **Fix:** delete `term.css:388`.

### BRAND-19 · My Miracle wears Sig's ring as its mark, and the app icon's ring has no centre dot
- **Severity:** low
- **Where:** `/my/` `section.my-intro > svg.ring.sig` (64px; 48 at 390), all widths. The Ask Sig app icons `sig/icon-180.png`, `icon-192.png`, `icon-512.png` and `icon-maskable-512.png`.
- **Selector(s):** `scripts/build_library.mjs:978` `${ringSvg(64, { cls: 'sig' })}`.
- **Evidence:** `my-head@1440.jpg`. The side panel marks My Miracle with the Stack builder's pink glyph. `sig-icon-512.jpg` shows eleven arcs with no white centre dot at 512px.
- **The rule it breaks:** SidePanel: "My Miracle (the Stack builder's glyph, `agent-builder`)". tokens `agent-builder`: "Also My Miracle's mark." illustration.md: the ring "is the mark of Ask Sig and of every title bar"; "From 30px up, the Interpretation agent sits at the centre as a white dot, 3.3% of the size".
- **Fix:** `build_library.mjs:978` → `${glyphSvg('builder', { size: 48 })}` (48px is the card size in illustration.md). Regenerate the app icons from `ringSvg(size)` so they get the centre dot (17px at 512).

### BRAND-20 · Ask Sig's big ring glows while it runs
- **Severity:** low
- **Where:** `/sig/` agents panel at 1440 and wider: `span.tm-bigring svg.ring`, whenever `.tm-team[data-state]` is not `idle` (during and after a run).
- **Selector(s):** `ai/term.css:354` `.tm-bigring .rg.on{opacity:1;filter:drop-shadow(0 0 7px currentColor)}`.
- **Evidence:** the computed filter is `drop-shadow(rgb(255,107,91) 0 0 7px)`, each arc in its own colour. Crops: `asksig-ring-working@1440.jpg` against `asksig-ring-idle@1440.jpg`.
- **The rule it breaks:** "no glows". The ring "lights each agent's arc as it reports" by lighting, not by a halo.
- **Fix:** `term.css:354` → `.tm-bigring .rg.on{opacity:1}`.

### BRAND-21 · Forum data has two colours, neither a token
- **Severity:** low
- **Where:**
  - Every fact sheet's radar: the legend swatch `span.lg > span.k.forums` "What forums talk about" and the forum slices `.rose .rd-forums path`.
  - The forum seal and flow on `/library/` and `/`.
- **Selector(s):** `library/library.css:156` `.rose .rd-forums path{fill:rgba(159,179,200,.5);stroke:#9FB3C8;…}`. `:162` `.legend .k.forums{background:rgba(159,179,200,.45)}`. `library/signalviz.js:28` `FORUM = '#A3A198'`.
- **Evidence:** a slate blue on the sheets (#9FB3C8, d = 35.8 from `text-2`; the .45 legend swatch is d = 165.7) and a warm grey in the seals (#A3A198, d = 16.2), for the same source. Beside the dashed evidence-blue swatch, the slate blue reads as a second evidence colour. Crops: `sheet-radar-legend@1440.jpg`, `library-level-seals@1440.jpg`.
- **The rule it breaks:** "everything else is graphite and near-white"; `evidence` only for evidence.
- **Fix:** `library.css:156` → `fill:var(--line-2);stroke:var(--text-2)`. `:162` → `background:var(--line-2);border:1px solid var(--text-2)`. `signalviz.js:28` → `'#A4A9A6'` (as in BRAND-13).

### BRAND-22 · Decorative gradients on the story page and behind the Home words
- **Severity:** low
- **Where and selectors:**
  - `/story/` `section.sy-hero::before` is a `repeating-radial-gradient` with a 64px pitch at .05 under a radial mask (`styles.css:938`). It shows as faint concentric rings behind the ring (`story-hero@1440.jpg`).
  - `/story/` `li.sy-agent[data-agent="interpretation"]` is a `linear-gradient(.04→0)` (`styles.css:954`). The 12th cell is visibly lighter (`story-twelve@1440.jpg`).
  - `/` `figure.net > div.net-fade` is a `linear-gradient(90deg, rgba(11,15,17,.94)…0 at 42%)` at 1440 (`styles.css:594`).
- **The rule it breaks:** "No gradients except the Signal's scale bar".
- **Fix:**
  - Delete `styles.css:938`.
  - `:954` → `background:var(--os-win,#0B0F11)`.
  - `:594` → `.net-fade{display:none}`. At 1440 the headline and lede end at x≈770, left of the graph's first points at x≈810; the prompt beyond them is opaque `bar`. Confirm no point sits under the words after the change.
- The legitimate gradients are listed in Appendix C.

### BRAND-23 · Hairlines off the two tokens
- **Severity:** low
- **Where, selectors and evidence:**
  - **The foot's top rule:** `footer.foot.win-foot` is `rgba(238,236,230,.08)` on 19 pages (`styles.css:847`).
  - **Story:**
    - Section rules `section.sy-sec` are `.08` (`styles.css:936`).
    - Prints `a.sy-print` are `.09` (`:978`), while their sibling windows `a.sy-win` are `.10`.
  - **5-HTP stub:** the pending box `section.pending-box` is dashed `rgba(11,15,17,.3)`, which is invisible on dark (`library/library.css:249`; `stub-pending-box@1440.jpg`).
- **The rule it breaks:** "Hairlines: `line` frames windows and cards; `line-2` borders controls."
- **Fix:** `styles.css:847`, `:936` and `:978` → `var(--line)`. `library.css:249` → `border:1px dashed var(--line-2)`.
- The `.08`, `.09` and `.12` that match the component spec are kept; see Appendix B.

### BRAND-24 · "Current" is marked four different ways
- **Severity:** low
- **Where, selectors and evidence:**
  - **The phone tab** `a.win-tab.on` at 700px and under has a `.05` fill and `.12` border on four sides (`styles.css:885`; `tab-phone@390.jpg`). On desktop the tab sits on `surface` with `line`.
  - **The side panel's "more" rows**, `nav.os-more > a[aria-current]`, are marked by `text` words only, with no fill (`styles.css:783`). Seen on founders, about, method and story (`founders-side-current@1440.jpg`).
  - **The folder tree's current file** `.lt-files a[aria-current]` uses a `bar` fill plus a 2px white inset bar (`styles.css:808`; `sheet-tree-current@1440.jpg`).
  - **Ask Sig's current place** is `.06` (BRAND-05).
  - The four places get it right with `.08`.
- **The rule it breaks:** States: "Current: the current place, row or tab takes an 8% `text` fill and `aria-current`."
- **Fix:**
  - `styles.css:885` → `.win-tab.on{border-color:var(--line);background:rgba(238,236,230,.08)}`.
  - `:783` → `.os-more a[aria-current="page"]{background:rgba(238,236,230,.08);color:var(--text)}`.
  - `:808` → `background:rgba(238,236,230,.08);box-shadow:none`.

### BRAND-25 · A signature colour on a kicker, and `down` on an error line
- **Severity:** low
- **Where and selectors:**
  - `/library/` `p.moves-k` "WHAT MOVED THIS WEEK" in lime (`library/library.css:336`; `library-moves-kicker@1440.jpg`).
  - `/404.html` `p.nf-err` "open: no such page…" in #FF9A8E `down` (`styles.css:921`; `notfound-shell@1440.jpg`).
- **The rule it breaks:**
  - Kicker: "Don't: colour it."
  - Colour: `down` is "A Signal's move down, a worse outcome". "Never use colour as decoration."
- **Fix:**
  - `library.css:336` `color:var(--lime)` → `color:var(--muted)`. Keep the lime live dot at `:337`.
  - `styles.css:921` → `.nf-err{color:var(--text)}`.

### BRAND-26 · Light-theme ink values that render as nothing
- **Severity:** low
- **Where and selectors:**
  - **Citation chips** `a.ref` on fact sheets: `rgba(11,15,17,.08)`, 164 chips (`library/library.css:30`; `sheet-ref-chips@1440.jpg`).
  - **Source counters** `ol.sources li::before`: the same value, 60 counters (`:243`).
  - **The Library's stats cells** `dl.lib-stats > div`: `rgba(11,15,17,.8)` with a live `backdrop-filter:blur(12px)` (`:73`). Their 1px dividers paint `card` on `card`, so they don't show (`:359`; `library-stats@1440.jpg`).
  - **The Library search field** `input#q`: box-shadow `rgba(11,15,17,.04) 0 1px 2px, rgba(11,15,17,.25) 0 12px 30px -18px` (`:80`).
- **The rule it breaks:**
  - Tokens only.
  - "Depth comes from the four grounds, not from shadows".
  - Hairlines `line` for dividers.
- **Fix:**
  - `:30` and `:243` → `background:transparent`.
  - `:73` → `background:var(--card);-webkit-backdrop-filter:none;backdrop-filter:none`.
  - `:359` `background:var(--card)` → `background:var(--line)`, so the gaps draw hairlines.
  - `:80`: delete the `box-shadow`.

### BRAND-27 · Disabled controls in Ask Sig drop below 4.5:1
- **Severity:** low
- **Where:** `/sig/` at 1440 and 1024:
  - `button#sg-wipe` "Delete all chats", disabled while there are no chats.
  - `button#ai-send > span.k-send` "↵ send", disabled until something is typed.
- **Selector(s):** `ai/term.css:481, 483` (`.sg-wipe` `color:var(--tm-t3)`, `:disabled{opacity:.45}`). `:213` `.tm .ai-send:disabled{background:transparent;color:var(--tm-t3);opacity:.75}`.
- **Evidence:** words at `.6` alpha × opacity `.45` give 2.14:1, and × `.75` give 3.98:1. Crops: `asksig-wipe-disabled@1440.jpg`, `asksig-composer-unfocused@1440.jpg`.
- **The rule it breaks:** "Disabled: controls drop to half opacity and keep their words." `text` at half opacity gives 4.68:1.
- **Fix:** `term.css:483` → `.sg-wipe:disabled{color:var(--tm-tx);opacity:.5;cursor:default}`. `:213` → `.tm .ai-send:disabled{background:transparent;color:var(--tm-tx);opacity:.5}`. Both give 4.68:1.

### BRAND-28 · Every page declares a light colour scheme
- **Severity:** low
- **Where:** every page. `<meta name="color-scheme" content="light">` is written at `scripts/build_library.mjs:281` and `scripts/build_pages.mjs:402`, and appears in `index.html:8`, `privacy.html:8`, `terms.html:8` and `404.html:9`.
- **Evidence:** with stylesheets blocked, `/about/` renders a white page with a black serif, and the near-white wordmark disappears (`about-before-css@390.jpg`). `styles.css` flips `:root` to dark only once it loads. Also, `theme-color` `#0B0F11` doesn't match the phone title bar `#12171A`.
- **The rule it breaks:** "One set of colours, Graphite, whatever a device is set to." Logo: "for graphite grounds only".
- **Fix:** change `content="light"` to `content="dark"` in all six places. The page's CSP (`style-src 'self'`) blocks an inline style, so the meta is the only pre-CSS lever. Optionally set `<meta name="theme-color" content="#12171A">` so the phone browser's bar matches the title bar.

### BRAND-29 · The skip link is a pill
- **Severity:** low
- **Where:** every page, on the first Tab: `a.skip`.
- **Selector(s):** `styles.css:60` `.skip{…border-radius:40px…}`.
- **Evidence:** `focus/home@1440-00.jpg`.
- **The rule it breaks:** "No pills: corners are `radius-control`."
- **Fix:** `styles.css:60` `border-radius:40px` → `border-radius:8px`.

---

## Systemic

1. **White means one thing.** `accent` (#EEECE6 as a fill) is used today for:
   - the side panel's Join;
   - the foot's sign-up;
   - repeated "Share how it went" buttons;
   - the Library's pressed chip;
   - the plan card's start step, start pillar and ground.

   Standardise: `accent` only on the one main action of a view. "Current/selected" is an 8% `text` fill. Everything else is a hairline. Why: the brand's whole action hierarchy rests on there being one white thing per screen. It is currently broken on every desktop screen (BRAND-01, 11, 17).
2. **Hairlines: two tokens, three documented exceptions.**
   - **Values found:** `.08`, `.09`, `.10`, `.12`, `.18`, `.20`, `.3`, `.35`, `.45`, `.55` and pure-white `rgba(255,255,255,x)`. The pure-white alphas are throughout `ai/plan.css`, `my/my.css`, `ai/screen.css` and parts of `library.css`.
   - **Standardise:** `line` (.10) for frames and dividers, `line-2` (.20) for controls, and `text` on hover. Keep only the component bundle's own exceptions: `.08` for the path line and status-bar separators, `.09` inside the side panel, and `.12` for terminal blocks. Replace every `rgba(255,255,255,x)` with the cream-based tokens.
   - **Why:** pure white at .3 reads 50% brighter than `line-2` (BRAND-09) and isn't the brand's near-white.
3. **Greys are three hex values, never alphas.** Ask Sig's `.6`/`.74`, the Library lede's `#FCFCFC` at .86 and the plan's `.72` ink are all off-token greys. Standardise: `text` #EEECE6, `text-2` #A4A9A6 and `muted` #868C8A as solid colours. Why: alpha greys shift with every ground, which is why Ask Sig and the Library read a different grey from the rest (BRAND-05, 06).
4. **Washes instead of grounds.**
   - **Values found:**
     - 2–6% `text` fills on hairline buttons: `.os-ask` .03, `.sg-new` .03, `.ai-start` .025.
     - On fields: the foot email and Library search at .04.
     - On the method table head: .05.
     - Black washes on Ask Sig's prompt: .2–.32.
   - **Standardise:**
     - Hairline buttons transparent.
     - Fields on `surface-raised` (`var(--card)`), and the Prompt on `bar`.
     - Table heads on `bar`, like the TopTable component.
     - Hover at 5%, current at 8%.
   - **Why:** each wash lands on a different off-token grey. The foot field, for example, lands on `rgb(17,20,21)` (d = 3.3 from `surface-raised`).
5. **One hover.** Today hover borders go to `text`, `line-2`, .3, .45, .5, .6 or ink .32, with lifts and shadows (BRAND-12). Standardise: hairlines brighten to `text`; rows take 5%; nothing moves or casts.
6. **One chip.** Today there are hairline chips at 5px, tinted pills at 40px and a white-alpha pill (BRAND-03, 14). Standardise: a `line-2` hairline, transparent ground, `text` words and the 5px radius the `.ev`/`.st` chips already use (or `radius-control` 8px if the shape lead standardises on the token). Colour enters only through the evidence meter's blue squares or a signature dot.
7. **The drawings carry their own palettes.** `lib/graph.js` (amber, family tints #E6DECC/#CCD4D8/#D8E0CC, glows), `library/signalviz.js` (#FCFCFC, #A3A198, old greens) and `styles.css:750–752, 857, 914, 921` all hard-code hex values. Standardise on one JS palette that mirrors tokens.json; `lib/ring.js`'s `AGENT_COLOR` is already exact and can be extended. Why: the CSS has been migrated to Graphite but the canvas and SVG drawings haven't (BRAND-08, 13, 21).
8. **Light-theme leftovers.** Ink-on-paper values (`rgba(11,15,17,x)` borders, fills and shadows) survive in `library.css` (`:30, 73, 80, 98, 243, 249, 254`), `pages.css:34` and `styles.css:165`. On a dark ground they draw nothing or darken. Delete them or map them to `line`/`line-2`/`text`.

---

## Appendix A · Palette map (every off-palette colour, distance > 3)

Totals across 92 data files: text-bearing elements 20,349 (246 off, 1.2%); backgrounds 8,521 (669 off, 7.9%, including 84 hidden honeypot fields and 164 `.ref` chips); top borders 6,206 (297 off, 4.8%). On-palette text breaks down as `text` 7,450, `text-2` 5,954, `muted` 5,831, `on-accent` 395, `evidence` 76, `lime` 61, `safety` 60 and `amber` 44, with the agent colours on agent names.

| Colour | n | Where (selector → pages) | Nearest (d) | Verdict → token |
|---|---|---|---|---|
| **Text** | | | | |
| rgba(238,236,230,.6) | 148 | Ask Sig: `span.tm-now`, `p.sg-legal a`, `span.tm-path`, `h1` (ai-id), `p.ai-fine`, `span.tm-sb-rules/-lib`, `h2.sg-k`, `button.sg-wipe span`… → asksig, ai | line-2 (102) | drift → `muted` (BRAND-05) |
| #FFB4A9 | 36 | `span.hc-common`, `span.conf-weak` → sheets, compare-pair, method | down (37.5) | drift → `text` (BRAND-03) |
| #F2C46B | 36 | `span.hc-uncommon`, `span.conf-fair` | amber (23.6) | drift → `text` (BRAND-03) |
| rgba(238,236,230,.74) | 22 | Ask Sig: `span.tm-online span`, `span.ps-host`, `span.tm-sb-safe`, `a.sg-signin` | text (66.3) | drift → `text-2` (BRAND-05) |
| rgba(252,252,252,.86) | 4 | `p.lede` → library | op-is (66.3) | drift → `text-2` (BRAND-06) |
| **Background** | | | | |
| rgba(11,15,17,.08) | 164 | `a.ref` → sheets | surface (234.6) | dead → transparent (BRAND-26) |
| rgba(238,236,230,.04) | 88 | `input#foot-email` (19 pages), `input#q`, `input#wk-email(-1)` | line (15.3) | drift → `surface-raised` (Systemic 4) |
| rgb(59,59,59) | 84 | `span.nf-hp > input` (21 pages) | bar (63.8) | legit: off-screen honeypot (x −9710, tabindex −1) |
| rgba(238,236,230,.05) | 49 | `th` (method head); `a.win-tab.on` at 390 (21 pages) | line (12.8) | drift → `bar`; 8% for the tab (BRAND-24) |
| rgba(238,236,230,.03) | 46 | `a.os-ask` (21 pages), `button#sg-new` | line (17.9) | drift → transparent |
| rgba(224,104,92,.14) | 36 | `span.hc-common`, `span.conf-weak` | line (201.7) | drift → transparent (BRAND-03) |
| rgba(232,183,90,.14) | 36 | `span.conf-fair`, `span.hc-uncommon` | line (160) | drift → transparent (BRAND-03) |
| rgba(238,236,230,.024) | 32 | `button.ai-start` → asksig, ai | line (19.4) | drift → transparent (BRAND-05) |
| rgba(238,236,230,.06) | 24 | `span.hc-rare`; `nav.sg-site > a[aria-current]` | line (10.2) | drift → transparent; 8% current |
| rgba(238,236,230,.08) | 22 | `nav.os-places > a[aria-current]` (11 pages) | line (5.1) | **legit**: the brand's 8% current fill |
| rgba(11,15,17,.8) | 16 | `dl.lib-stats > div` → library | on-accent (51) | drift → `surface-raised`, no blur (BRAND-26) |
| rgba(238,236,230,.07) | 16 | `span.hc-unknown/-theoretical` | line (7.6) | drift → transparent (BRAND-03) |
| rgba(159,179,200,.45) | 12 | `span.k.forums` → sheets | line-2 (165.7) | drift → `line-2` + `text-2` (BRAND-21) |
| rgba(111,168,255,.14) | 12 | `span.conf-good` → method | line (156.4) | drift → transparent (BRAND-03) |
| rgba(255,255,255,.08) | 8 | `span.check` → sheets | line (40.8) | drift → transparent (BRAND-03) |
| rgba(0,0,0,.28) | 8 | `div.ai-composer` → asksig, ai | page (198.8) | drift → `bar` (BRAND-05) |
| rgba(14,19,22,.72) | 4 | `div.net-bar` → home | surface-raised (71.4) | accepted: the plate's head bar over the live graph (token hue) |
| rgba(11,15,17,.94) | 4 | `a.net-ask` → home | surface (15.3) | accepted: a label floating on the canvas (token hue) |
| rgba(11,15,17,.85) | 4 | `p.rose-empty` → 5-HTP | on-accent (38.3) | accepted: scrim over the empty radar |
| rgba(11,15,17,.38) | 3 | `i.t25/.t50/.t75` → home | surface (158.1) | **legit**: ticks on the Signal's scale bar |
| rgba(14,19,22,.94) | 1 | `div.hero-card` → home | surface-raised (15.3) | drift → opaque `bar` (BRAND-08) |
| **Border** (all four sides, live) | | | | |
| rgba(238,236,230,.08) | 416 sides | see Appendix B | line (5.1) | split: see Appendix B |
| rgb(133,133,133) | 84 | honeypot input | muted (8.7) | legit (off-screen) |
| rgba(232,183,90,.55) | 44 | `span.st-category2/-restricted` → library, goal-weight, status | amber (114.7) | drift → `line-2` (BRAND-14) |
| rgba(238,236,230,.12) | 33 | `a.win-tab.on` at 390; `div.nf-shell`, `div.sy-term`, `div.sy-status` | line (5.1) | split: see Appendix B |
| rgba(255,255,255,.3) | 28 | `a.btn.line(.sm)` → sheets, my | line-2 (61.2) | drift → `line-2` (BRAND-09) |
| rgba(255,255,255,.18) | 8 | `span.check` | line-2 (40.8) | drift → `line-2` (BRAND-03) |
| rgba(11,15,17,.3) dashed | 4 | `section.pending-box` → 5-HTP | surface (178.5) | drift → `line-2` dashed (BRAND-23) |
| rgba(238,236,230,.35) | 4 | `section.plan-cta` → plan | line-2 (38.2) | drift → `line` (BRAND-11) |
| **Pseudo, SVG and canvas** | | | | |
| rgba(11,15,17,.08) | 60 | `ol.sources li::before` → sheets | — | dead (BRAND-26) |
| rgba(216,255,61,.55) | 17 | `.live i::after` pulse | lime (α) | legit: the live dot's pulse |
| #FCFCFC, #A3A198, #B8E62A, #9BE35A, #6EE7B7, gradients | 400+ paints | `svg.flowviz`, `svg.seal` → library, home | — | drift (BRAND-13, 21) |
| rgba(238,236,230,.6) | 12 | `svg.pl-bar .fi` (placebo bars) → home | — | minor drift → `text-2` |
| amber [232,183,90] and family tints | canvas | `lib/graph.js` → home | — | drift (BRAND-08) |
| `#EEECE6` grounds, white alphas, #F2C46B, #1B2827 | live | shared plan card | — | drift (BRAND-11) |

## Appendix B · Hairline alphas found, and the decision

| Alpha | Where | Decision |
|---|---|---|
| .10 `line` / .20 `line-2` | cards, window, tables, chips, controls | token |
| .08 | `div.win-path` bottom (21 pages), `.ws` status separators (21 pages), `div.sy-status > span` | **legit**: `components/bundle.css` `.mh-path` and `.mh-ws` use `rgba(238,236,230,.08)` |
| .08 | `footer.win-foot` top (19 pages), `section.sy-sec` top (story) | drift → `line` (BRAND-23) |
| .09 | `aside.os-side` right, `nav.os-more`, `div.os-foot`, `div.os-ctx` tops (21 pages) | **legit**: bundle `.mh-side/.mh-places/.mh-legal` use .09 (d = 2.6, within tolerance) |
| .09 | `a.sy-print` (story) | drift → `line` (BRAND-23) |
| .12 | `div.nf-shell` (404), `div.sy-term`, `div.sy-status` (story) | **legit**: bundle `.mh-shell` (terminal blocks) uses .12 |
| .12 | `a.win-tab.on` at ≤700px | drift → `line` (BRAND-24) |
| .18 / .3 white; .35; amber .55; ink .3 dashed | `.check`; `.btn.line` on sheets and My; `.plan-cta`; FDA chips; `.pending-box` | drift (BRAND-03, 09, 11, 14, 23) |
| plate ticks | `span.net-corner` (home plate): 10px L-shapes in `muted`, drawn with borders, not gradients | **legit**: the plate's corner ticks |
| agent hues at .65 | `li.agent.wake > span.agent-node` (Ask Sig ≤1024) | **legit**: each agent's own colour where it is named |

## Appendix C · Gradients, glows and shadows

| Kind | Where (field) | Pages | Verdict |
|---|---|---|---|
| bgi `linear-gradient(90deg, lime .28 → lime)` | `div.hc-track` (data) | home | **legit**: the Signal's scale bar |
| SVG `url(#vs-scale)` | `div.vs-sig > svg.sig-bar` | home | **legit**: the Signal's bar |
| bgi radial-gradient corner masks | `div.win-title::after` (21 pages ≥768), `div.tm-title::after`, `div.tm-status::after` (Ask Sig) | all | **legit**: they paint the gap colour into the window's round corners. Ask Sig's paint `surface` because of BRAND-05 |
| mask `linear-gradient` | `.tm-chats.scrolls` (Ask Sig tabs overflow) | asksig | **legit**: the same edge fade the brand's status tape uses |
| bgi `linear-gradient(.04 → 0)` | `li.sy-agent[interpretation]` (data) | story | drift (BRAND-22) |
| bgi `linear-gradient(.08 → .02)` | `section.plan-cta` (data) | plan | drift (BRAND-11) |
| bgi `linear-gradient(90deg, surface .94 → 0)` | `div.net-fade` (data) | home @1440 | drift (BRAND-22) |
| bgi `repeating-radial-gradient` | `section.sy-hero::before` | story | drift (BRAND-22) |
| bgi `repeating-linear-gradient` stripes | `.pillar.is-next` | shared plan | drift (BRAND-11) |
| SVG gradients glow/core/card | `svg.flowviz` | library | drift (BRAND-13) |
| canvas glow sprites + additive bloom | `lib/graph.js` | home | drift (BRAND-08) |
| filter `drop-shadow(0 0 7px currentColor)` | `.tm-bigring .rg.on` (running) | asksig | drift (BRAND-20) |
| backdrop-filter `blur(12px)` | `dl.lib-stats > div` | library | drift (BRAND-26) |
| shadow `12px 0 40px rgba(0,0,0,.5)` | `aside#os-side` drawer (≤900px) | all | **legit**: exactly `shadow-drawer` |
| shadow `0 0 0 3px lime` | `span.hc-knob` (data) | home | **legit**: the Signal marker's lime ring (a ring, not depth) |
| shadow `inset 0 -2px 0 text` | `button.tm-tabbtn` (data) | asksig | **legit**: a 2px underline rule, not depth |
| shadow `inset 2px 0 0 text` | `.lt-files a[aria-current]` (data), `.hp-row:focus-visible` | sheets, home | drift: a state marker (BRAND-24). The Prompt's focused row shows only a 2px left bar on the "lit" ground (`home-prompt-results-focus@1440.jpg`) |
| shadow `rgba(11,15,17,.04/.25)` | `input#q` (data) | library | drift (BRAND-26) |
| shadow `rgba(11,15,17,.45) 0 18px 40px -26px` + lift | `a.lib-card:hover` | library, goal-weight | drift (BRAND-12) |
| shadow `0 14px 30px rgba(0,0,0,.4)` | `.plan-save-menu` (floats) | shared plan | should be `shadow-float` exactly (plan.css:120) |

No `shadow-float` is in use on any rendered floating panel.

## Appendix D · Contrast (live, 1440 and 390)

The method is `ds.EFFECTIVE_BG_JS` run on every visible element with own text, plus a corrected ratio that blends the text's alpha, its opacity chain and any translucent grounds. The helper ignores alpha and opacity: it reports 16.7:1 for Ask Sig's `.6`-alpha words, which are really 6.3:1.

| Ratio | Text | Page | Status |
|---|---|---|---|
| 1.00 | `p.wk-close > a.btn.lime` "Share how it went" | weekly-issue | fail (BRAND-02) |
| 2.14 | `button#sg-wipe span` (disabled) | asksig | fail (BRAND-27) |
| 3.88 | `input#q::placeholder` | library | fail (BRAND-15) |
| 3.98 | `span.k-send` (disabled) | asksig | fail (BRAND-27) |
| 4.68 | `span.hc-theoretical/-unknown` (muted on a .07 fill) | sheets | passes AA, under the brand's 5:1 (fixed by BRAND-03) |
| 4.92 / 5.11 | `thead th` (muted on a .05 fill) | method | under 5:1 (fixed by `bar`: 5.27) |
| 4.95 | `span.op-k` "122 sheets" (muted on the .08 current row) | all pages | under the brand's 5:1. Accept, or set the current row's meta to `text-2` (7.1:1) |
| 5.22–5.46 | every other muted label, placeholder and meta | all | pass |

No text at 24px or over is under 3:1. The focus ring is 16.7:1 on `side` and 1.0:1 on the white Join (BRAND-16).

## Appendix E · Marks inventory

- **Wordmark:**
  - In the side panel it is 63×22 at (18,21) on 18 pages and Ask Sig, and at (18,15) on fact sheets (BRAND-10).
  - It is never in a foot (BRAND-04).
  - At 768 and 390 it appears only in the drawer (63×22, correct).
  - The file is 480×168, near-white, used on graphite grounds only. It is invisible before CSS loads (BRAND-28).
- **Sig's ring:**

  | Place | Size | Status |
  |---|---|---|
  | Title bar | 18px | on all 21 pages at all widths |
  | Ask Sig title bar at 390 | 30px | wrong (BRAND-18) |
  | Status SIG segment | 12px | correct |
  | Side panel place mark and "Ask Sig a question" | 16px | correct |
  | Ask Sig hello | 52px | correct |
  | Ask Sig agents ring | 212px, centre dot at −44 | correct, but glows while running (BRAND-20) |
  | Story | 320px | spins, and its dot hits the numeral (BRAND-07) |
  | My Miracle | 64px | the wrong mark (BRAND-19) |

  Every ring's arcs are the eleven exact `agent-*` hex values (SVG paint check).
- **Glyphs:** all twelve agents are drawn in their own token colours. The side panel uses 16px (evidence ladder, community lime, builder pink), the story's twelve 34px, and Ask Sig's agents 14px. No glyph is used as a generic icon.
- **Favicon:** `/favicon.svg` is a lime ring and dot on a #0B0F11 tile with rx 7 at 32px, matching `sig-mark.svg`. It is linked on all 22 real pages; the `/ai/` redirect stub has none.
- **App icons:** `sig/icon-*.png` lack the ring's centre dot (BRAND-19).
- **`og.jpg`:** a graphite window, on-brand.

## Appendix F · White buttons in the first screen (900px high; 844 at 390)

The sticky side panel's Join is counted at 1440 and 1024.

| Page | 1440 | 1024 | 768 | 390 |
|---|---|---|---|---|
| sheet-semaglutide | 3 | 2 | 1 | 0 |
| sheet-creatine | 3 | 2 | 1 | 0 |
| sheet-stub-5htp | 3 | 3 | 1 | 1 |
| my | 3 | 3 | 2 | 2 |
| plan | 3 | 3 | 2 | 1 |
| notfound | 2 | 2 | 1 | 1 |
| weekly | 2 | 2 | 1 | 1 |
| goal-weight | 2 | 2 | 1 | 1 |
| story | 2 | 1 | 1 | 0 |
| all others | 1 (Join) | 1 (Join) | 0–1 | 0 |

After the BRAND-01 and BRAND-17 fixes, every cell is 0 or 1. No view was found whose main action isn't white; Ask Sig's send button turns white once a question is typed.

## Appendix G · Seen in code, not rendered in the 23 captures (verify before fixing)

- **Ask Sig's crisis card:** the "Call 988/911" buttons are filled `#8E2F28` with `#FFFFFF` words (`ai/ai.css:283, 347, 355`) in a pin tinted `rgba(224,104,92,…)` (`:345`). In that view this should be the one white `accent` button, not a red fill. Confirm with the founder before changing a crisis surface.
- **Ask Sig's destructive hovers** use the safety coral and #FFB4A9: `.sg-del:hover` (`term.css:461`), `.sg-wipe:hover` (`:482`), `.sg-wipe-yes:hover,.sg-yes:hover` (`:486`). `safety` belongs to the Safety agent; use the standard 5% hover.
- **My Miracle's check-in controls** are pills with white alphas: `.ci-how-b` and `.ci-took-b` (`my/my.css:37, 45`), and `.ci-note` (`:48`).
- **The plan save menu** is an old green `#1B2827` (`ai/plan.css:120`), and `.ai-composer` is `#18221F` (`ai/ai.css:375`, overridden on /sig/).
- **The clinician packet dialog** (`ai/packet.css`) is deliberately a light, greenish "paper" document: #EEF1EB, #FFFFFF and #121E1D, an 18px radius and a large shadow. Confirm it as an intended exception to "Graphite whatever a device is set to"; if it stays, its on-screen frame could still be graphite.
