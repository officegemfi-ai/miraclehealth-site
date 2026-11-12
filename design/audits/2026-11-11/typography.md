# Typography: audit report

**State of the area:** the three families are the right ones and load (no visible text renders in Arial, and headlines do render wide), but the type has drifted to 56 sizes across the three families. The same level looks different from page to page: the page h1 has nine treatments from 34 to 92px, the in-page h2 has nine and the h3 eight. Running text runs to 85–114 characters a line, and the mono labels use six trackings and two casings for the same job.

How it was measured: the captured data, plus a live pass over all 22 unique pages at 1440, 1024, 768 and 390 (`/ai/` redirects to `/sig/`, so `ai` and `asksig` are one page). The live pass recorded every text element's computed `text-wrap`, `font-variant-numeric`, kicker `::before`, the characters on each rendered line and the words on the last line. A Chrome DevTools (CDP) pass named the platform font that drew each node. Everything was verified in Chrome 153; this environment has no WebKit or Firefox. The scripts are in `/home/claude/design/work_typo/`, and the evidence images are in `/home/claude/design/evidence/typography/`.

---

## Findings (most visible first)

### TYPE-01 · high · The page h1 has nine treatments for one level
- **Where:** every page except Home and story, at all widths.
- **Selectors:**
  - `.le-hero h1`: library/library.css:131, :146 (`.long`), :375.
  - `.nf-main h1`: styles.css:389.
  - `.lib-hero h1`: library.css:356, :358.
  - `.doc-head h1`: styles.css:369. Used on about, method, status, goals, goal-weight, compare, weekly, weekly-issue, founders, privacy and terms.
  - `.cmp-head h1`: pages/pages.css:65.
  - `.ai-title`: ai/ai.css:39, :489, :583. Ask Sig's visible headline is an h2; its h1 is a 12px mono label, `.tm .ai-id h1` at ai/term.css:148.
  - `.my-intro h1`: my/my.css:9, :84.
  - `.plan-intro h1`: ai/plan.css:151, :164.
  - The base rules: styles.css:55 `h1,h2,h3{…font-weight:700…}`, overridden by :561 `h1,h2,h3{font-weight:500}`.
- **Evidence (size at 1440 → 390):**

  | Page | Size | Weight | Tracking | Line height |
  |---|---|---|---|---|
  | Fact sheets | 92 → 44px | 640 | -0.03em | 0.96 |
  | 404 | 88 → 44px | 640 | -0.03em | 0.98 |
  | Library | 77.76 → 40.2px | 640 | -0.028em | 0.98 |
  | The 11 doc-head pages | 68 → 40px | 640 | -0.03em | 1 |
  | Compare pair | 62 → 36px | 640 | -0.03em | 1 |
  | Ask Sig (`.ai-title`) | 36 → 28px | 640 | -0.022em | 1.08 |
  | My Miracle | 36 → 30px | 700 | -0.03em | 1.1 |
  | Plan | 34 → 28px | 700 | -0.03em | 1.1 |

  Weight 500 computes but renders 640 through the Display face (TYPE-16). The fact-sheet and 404 h1s are larger than Home's hero (72px). Image: `evidence/typography/h1-sizes-across-pages@1440.jpg`.
- **The rule it breaks:**
  - tokens.json `page`: 48px (clamp 34–48), weight 700, letter spacing -0.026em, line height 1.02, "A page's h1".
  - bundle.css `.mh-plate h1{font:700 48px/1.02 …;letter-spacing:-.026em}`.
  - README Type: "`hero` for the one headline of Home and the story page … `page` for a page's h1".
- **Fix:**
  1. In styles.css, change line 55 to `h1,h2,h3{margin:0;font-family:var(--head);text-wrap:balance}`. Add `h1{font:700 clamp(34px,3.4vw,48px)/1.02 var(--head);font-stretch:112.5%;letter-spacing:-.026em}`. Delete line 561.
  2. Delete `font-size`, `line-height` and `letter-spacing` from these rules:
     - styles.css:369 `.doc-head h1` and :389 `.nf-main h1`.
     - library.css:131 and :375 `.le-hero h1`, :146 `.le-hero h1.long`, :356 and :358 `.lib-hero h1`.
     - pages.css:65 `.cmp-head h1`.
     - my.css:9 `.my-intro h1`: from `font:700 36px/1.1 var(--head);letter-spacing:-.03em` to `color` only. Delete the 30px at :84.
     - plan.css:151 `.plan-intro h1` the same way. Delete the 28px at :164.
  3. In ai.css, set `.ai-title` (lines 39, 489 and 583) to `font:700 clamp(34px,3.4vw,48px)/1.02 var(--head);font-stretch:112.5%;letter-spacing:-.026em`.
  4. Home and story keep `hero` (TYPE-08).
- **Check:** every page h1 at 1440 is 48px, weight 700, letter spacing -1.25px and line height 48.96px; at 390 it is 34px.

### TYPE-02 · high · Running text runs 85–114 characters a line
- **Where:** at 1440 (and 1024) on privacy, terms, method, about, weekly-issue, status, goals, goal-weight, compare, compare-pair, weekly, founders, both fact sheets, Home, Ask Sig, My Miracle and Plan. The newsletter note in every page's foot too.
- **Selectors, with the longest full line measured live at 1440:**
  - styles.css:373 `.doc p,.doc li` (740px box, 16.5px): method 109 (its `.cell-note` 114), weekly-issue 107, about 103, privacy and terms 102. `.doc .intro` (:375, 19px): 82–85.
  - pages.css:
    - `.pg-intro` (:7, 780px box, 19px): 84–90 on seven pages.
    - `.pg-sub` (:14): 98.
    - `.pg-foot` (:16): 97–102.
    - `.st-desc` (:51): 96–99.
    - Status `.pg-terms dd` (:43): 112.
  - library.css:
    - `.le-sec>p` (:203, 710px box, 17px): 92.
    - `.le-sec .big`: 83.
    - `.study p` (:237): 96.
    - `.bl-why` (:321 max 72ch, :382 20px): 94.
    - `.le-hero .lede` (:133, 62ch): 77.
    - Source titles: 85–89.
  - styles.css:
    - `.rules-members` (:327, 86ch): 113.
    - `.nf-note` (:416, every page's foot): 89, and 96 on weekly.
    - `.sy-lede` (:933): 83.
  - Ask Sig: `.tm .ai-fine` (term.css:172) 132, `.ai-lede` 77.
  - Plan: `.plan-fine` (plan.css:160) 116, `.plan-intro p` (:152) 85.
  - My Miracle: `.my-lede` (my.css:15) 84.
- **Evidence:** in Mona Sans, 1ch is 1.33 average characters (measured on 10 paragraphs), so a 740px box at 16.5px holds about 105. Verified live: with `max-width:52ch` on these selectors, the longest full lines drop to 67–76. Images: `doc-line-length-105ch-lh1.7@1440.jpg`, `sheet-line-length-92ch@1440.jpg`, `status-intro-line-length@1440.jpg` and `foot-nf-note-89ch@1440.jpg`.
- **The rule it breaks:**
  - The brief: about 75 characters a line.
  - tokens.json `lede`: "at most 50ch".
  - bundle.css `.mh-plate p{max-width:52ch}`.
- **Fix:** `max-width:52ch` on running text (about 69 characters) and `50ch` on ledes.
  - styles.css:
    - :373 `.doc p,.doc li`: add `max-width:52ch`.
    - :375 `.doc .intro`: add `max-width:50ch`.
    - :327 `.rules-members`: `86ch` → `52ch`.
    - :416 `.nf-note`: add `max-width:52ch`.
    - :933 `.sy-lede`: `640px` → `50ch`.
    - :947 `.sy-hero .lede`: `600px` → `50ch`.
  - pages.css:
    - :7 `.pg-intro`: `780px` → `50ch`.
    - :14 `.pg-sub`: `760px` → `52ch`.
    - :16 `.pg-foot`: `780px` → `52ch`.
    - :51 `.st-desc`: `760px` → `52ch`.
    - :43 `.pg-terms dd`: add `max-width:52ch`.
  - library.css:
    - :203 `.le-sec>p`: add `max-width:52ch`; `.le-sec .big` takes `50ch`.
    - :237 `.study p:last-child`: add `52ch`.
    - :321 `.bl-why`: `72ch` → `50ch`.
    - :133 `.le-hero .lede`: `62ch` → `50ch`.
  - Ask Sig: ai.css:40 `.ai-lede` `60ch` → `50ch`. term.css:172 `.tm .ai-fine`: add `max-width:52ch`.
  - Plan: plan.css:152 `62ch` → `50ch`. Add `52ch` to `.plan-fine` (:160).
  - My Miracle: my.css:10 `60ch` → `50ch`. my.css:15 `.my-lede` `62ch` → `52ch`.

### TYPE-03 · high · The in-page h2 has nine treatments
- **Where:**
  - privacy, terms, method, about and weekly-issue.
  - Both fact sheets and the stub.
  - status, goal-weight, weekly, founders, My Miracle and Plan.
  - The foot of 19 pages.
- **Selectors (size, weight, tracking and line height at 1440):**
  - styles.css:372 `.doc h2`: 26px, 640, -0.025em, 1.2. `.doc .short h2` (:382): 19px.
  - library.css:201 and :378 `.le-sec h2`: 38px (28 at 390), 640, -0.02em, 1.08.
  - pages.css:50 `.st-group-h h2`: 30px, 640, -0.025em, **1.55** (no line height set, so it inherits body's).
  - pages.css:13 `.pg-sec>h2`: 32px, 640, -0.025em, 1.15.
  - pages.css:122 `.fd-card h2`: 21px, 640, -0.02em, **1.55**.
  - my.css:14 `.my-sec>h2`: 22px, **700**, -0.02em, 1.2.
  - plan.css:157 `.plan-cta h2`: 22px, 640, -0.02em, **1.55**.
  - styles.css:407 and :681 `.foot-news>p b` (the foot's "The Signal, weekly."): 28px, 700, **-0.012em**, 1.15.
- **Evidence:** image `h2-in-page-across-pages@1440.jpg`.
- **The rule it breaks:** tokens.json `h2`: 26px (22–26), 700, -0.02em, 1.1. "Headings inside a page: … a fact sheet's sections".
- **Fix:**
  1. In styles.css (after the h1 rule), add `h2{font:700 clamp(22px,1.4vw + 6px,26px)/1.1 var(--head);font-stretch:112.5%;letter-spacing:-.02em}`.
  2. Delete size, weight, tracking and line height from the nine rules above, keeping their margins and colour.
  3. Give `.foot-news>p b` (styles.css:681) the same font declarations.
  4. Section heads keep `section` (TYPE-08).
- **Check:** every in-page h2 at 1440 is 26px, weight 700, letter spacing -0.52px and line height 28.6px; at 390 it is 22px.

### TYPE-04 · high · h3 and card titles use the headline face, at eight sizes
- **Where:** Home, Library, goal-weight, both fact sheets, status, compare, compare-pair and story.
- **Selectors:** the base rule styles.css:55 `h1,h2,h3{font-family:var(--head)}` puts every h3 in Mona Sans Display:
  - `.step h3`: 30px (:252, :637).
  - `.rules h3`: 27px (:321, :663).
  - `.join-steps h3`: 22px (:359).
  - `.vs-id h3`: 60px (:278, :650).
  - library.css:113 `.lib-explain h3`: 24px.
  - library.css:202 `.le-sec h3`: 17px, line height 1.55.
  - pages.css:56 `.st-row h3`: 19px, on 122 rows.
  - Story's `.sy-agent h3` (styles.css:952) is the only Mona Sans one, at 17px and weight 650.

  Card titles that aren't h3s use the Display face too:
  - library.css:105 and :372 `.lc-name`: 22px, on 346 cards.
  - library.css:252 `.part b`: 19px.
  - pages.css:35 `.pg-goal b`: 19px, 700.
  - pages.css:70 `.cmp-name`: 24px, 700.
  - styles.css:292 and :653 `.vs-use`: 23px, 700.
  - styles.css:339 and :666 `.faq-list summary`: 23px, 700, -0.012em.
- **Evidence:** image `h3-and-card-titles-across-pages@1440.jpg`.
- **The rule it breaks:**
  - README Type: "Words: Mona Sans … `h3` for card and post titles".
  - tokens.json `h3`: Mona Sans 16px, 600, -0.01em, 1.3, and "17.5px in the feed".
  - Every card title in bundle.css is Mona Sans 600: `.mh-em h3` 17.5px, `.mh-name` 15px, `.mh-top tbody th` 14px.
- **Fix:**
  1. In styles.css, add `h3{font:600 16px/1.3 var(--body);letter-spacing:-.01em}`.
  2. Give card and row titles that style by deleting their size, family and tracking: `.st-row h3`, `.le-sec h3`, `.sy-agent h3` (from `650 17px/1.25` to `600 16px/1.3`), `.lc-name`, `.part b`, `.pg-goal b`, `.cmp-name` and `.vs-use`.
  3. The two list-leading titles, `.faq-list summary` and `.wk-t` (pages.css:104), take the token's 17.5px.
  4. The four big feature-card heads (`.step h3`, `.rules h3`, `.join-steps h3`, `.lib-explain h3`) take the `h2` style (26px, 700, -0.02em, 1.1, Display) instead of 30, 27, 22 and 24px.
  5. `.vs-id h3` takes `page` (48px, 700, -0.026em, 1.02).
- **Check:** at 1440 the Display face appears only at 26, 48, 60 and 72px.

### TYPE-05 · high · Body copy runs at seven sizes and ledes at six
- **Where:** every page.
- **Evidence:** Mona Sans sizes at 1440, from the live data.

  Running text:

  | Size | Where (elements) |
  |---|---|
  | 14px | `.lc-sum` (346), `.sy-agent p`, `.vs-sub`, the foot disclaimer |
  | 14.5px | `.st-note` and `.st-label` (244), `.le-facts dd`, the method tables' cells, `.pg-goal span` |
  | 15px | `.study p`, `.ev-box p`, `.step h3+p` |
  | 15.5px | `.dots li`, `.marks li`, `.nums li`, `.claims p`, `.sec-note`, `.rules-members`, `.my-lede` |
  | 16px | the compare cells, `.st-desc`, `.foot-news>p` |
  | 16.5px | `.doc p` and `li` (230, on 6 pages), `.faq-list details p` |
  | 17px | `.le-sec>p` |

  Ledes:

  | Size | Where |
  |---|---|
  | 16px | `.my-intro p`, `.plan-intro p` |
  | 16.5px | `.ai-lede` |
  | 17px | `.hero .lede` |
  | 18px | `.lede`, `.sy-lede` |
  | 19px | `.pg-intro` ×7, `.doc .intro` ×5, `.le-sec .big`, `.sy-hero .lede` |
  | 20px | `.bl-why`, `.vs-foot>p` |

  Two rules lose to the cascade and render 17px with line height 1.7, because `.le-sec>p` (library.css:203) is more specific:
  - `.lab-why` (library.css:230), declared 15px in muted.
  - `.checked` (:247), declared 14.5px.

  Image: `body-copy-sizes-across-pages@1440.jpg`.
- **The rule it breaks:** tokens.json Text: `body` 16px/1.55 ("The site's copy"), `body-app` 15px/1.55 (the size bundle.css gives plate and post copy) and `lede` 18px/1.6.
- **Fix:** three text sizes and one fine-print size.
  - **Page copy, 16px/1.55:**
    - `.doc p,.doc li`: 16.5 → 16.
    - `.le-sec>p`: 17 → 16.
    - `.dots li,.marks li,.nums li`, `.rules-members` and `.faq-more`: 15.5 → 16.
    - `.faq-list details p`: 16.5 → 16.
  - **Copy inside cards and plates, 15px/1.55:**
    - `.lc-sum`, `.sy-agent p`, `.sy-win p` and `.vs-sub`: 14 → 15.
    - `.st-note`, `.st-label` and `.le-facts dd`: 14.5 → 15.
    - `.claims p` and `.sec-note`: 15.5 → 15.
  - **Every lede, 18px/1.6:** `.pg-intro`, `.doc .intro`, `.le-sec .big`, `.sy-hero .lede`, `.bl-why`, `.vs-foot>p`, `.hero .lede`, `.ai-lede`, `.my-intro p` and `.plan-intro p` all become 18px.
  - **Fine print, 13px/1.5:** `.ai-fine` (12) and `.cell-sub` and `.plan-note` (12.5) become 13px.
  - **The cascade:** write the two rules as `.le-sec>p.lab-why` and `.le-sec>p.checked` so they apply. They then become 15px with the rest of the card copy.

### TYPE-06 · high · The side panel's "more" rows are set in mono
- **Where:** 21 pages (every page but Ask Sig), at 1440 and 1024, and in the phone drawer.
- **Selector:** styles.css:781 `.os-more a{min-height:28px;…color:var(--muted);font:400 12.5px/1 var(--mono)}`. The ten rows run from "The Signal" to "About".
- **Evidence:** the four places above them are `nav` (Mona Sans 500, 13.5px) and the rows below are mono 400, 12.5px. Image: `side-panel-more-rows-mono@1440.jpg`.
- **The rule it breaks:**
  - SidePanel README: "rows are `row` tall in `nav`"; its preview draws menu rows as `.mh-nav{font:500 13.5px/1.2 var(--font-body)}`.
  - README Voice: only *labels* in the side panel are mono.
- **Fix:** styles.css:781 `font:400 12.5px/1 var(--mono)` → `font:500 13.5px/1.2 var(--body)`.
  - Leave the "more" label (`.os-k`) and the Library tree's file names in mono.
  - Row height (28 → 36px `row`) and colour (`muted` → `text-2`) belong to the layout and colour leads. Check the panel still fits a 768px-tall screen.

### TYPE-07 · medium · Three kicker treatments break the kicker
- **Where:** Home's hero (all widths), the story page (six kickers) and the Library's hero.
- **Selectors:**
  - styles.css:690–691 `.hero .kick{display:block;font:400 13px/1.4 var(--mono);letter-spacing:0;text-transform:lowercase}` and `::before{display:none}`. The line reads "independent and free, for adults 18+", which is the brand's own kicker sample, set here as a lowercase log line with no rule.
  - styles.css:931 `.sy-k{font:400 12.5px/1.4 var(--mono)}`: no rule and no tracking ("~/story · the new Miracle Health", "01 · the twelve" …).
  - styles.css:568 `.kick.live::before{display:none}`: the Library's "THE LIBRARY · LIVE COMMUNITY DATA" loses its rule to the live dot.
  - The standard `.kick` (styles.css:62, :565–566) is correct everywhere else it is used, on 18 pages: 12px, 500, .12em, capitals, and a 28 × 1px rule at 0.75.
- **Evidence:** the live `::before` is 28px × 1px at opacity 0.75 on `.kick`, and absent on `.hero .kick`, `.sy-k` and `.kick.live`. Image: `kickers-compared@1440.jpg`.
- **The rule it breaks:**
  - tokens.json `kicker`: "capitals, led by a 28px rule at 75% opacity".
  - Kicker README; its example is "INDEPENDENT AND FREE, FOR ADULTS 18+".
  - The README allows lowercase after the number on the story page only.
- **Fix:**
  - Delete styles.css:690 and :691, so Home's kicker becomes the standard `.kick`.
  - Change styles.css:931 `.sy-k` to `display:flex;align-items:center;gap:12px;margin:0 0 14px;font:500 12px/1.5 var(--mono);letter-spacing:.12em;color:var(--muted)`. Add `.sy-k::before{content:'';flex:none;width:28px;height:1px;background:currentColor;opacity:.75}`. The lowercase stays, as the README allows on the story page.
  - Delete styles.css:568, so the rule leads and the live dot follows it.

### TYPE-08 · medium · Story and Home set the same headline levels differently
- **Where:** story and Home, at all widths.
- **Selectors:**
  - The hero h1: styles.css:945 `.sy-hero h1{font:700 clamp(44px,5.6vw,84px)/.98 …;letter-spacing:-.035em}` renders 80.64px at 1440. Home's :588 `.hero h1` is `clamp(40px,5vw,74px)`, line height 1, -0.03em, weight 500 (rendered 640).
  - Section heads: styles.css:932 `.sy h2{font:700 …;letter-spacing:-.03em}` against Home's `.sec-head h2` (:242, :633), which is 640 and -0.024em.
  - The join head: Home's `.join h2` (:355, :670) is `clamp(40px,5.6vw,72px)` with line height 1 and -0.026em. At 1440 that is 72px, the same size as the hero h1, though it is a section head.
- **Evidence:** image `hero-and-section-home-vs-story@1440.jpg`.
- **The rule it breaks:**
  - tokens.json `hero`: 74px (clamp 40–74), 640, -0.03em, 1, "the one headline of Home and the story page".
  - tokens.json `section`: 60px (clamp 36–60), 640, -0.024em, 1.02.
- **Fix:**
  - styles.css:945 → `font:640 clamp(40px,5vw,74px)/1 var(--head);font-stretch:112.5%;letter-spacing:-.03em`.
  - :588 `.hero h1`: add `font-weight:640;font-stretch:112.5%`.
  - :932 `.sy h2` → `font:640 clamp(36px,4.6vw,60px)/1.02 var(--head);font-stretch:112.5%;letter-spacing:-.024em`.
  - :355 `.join h2` → `font-size:clamp(36px,4.6vw,60px);line-height:1.02`. Change :670 to `-.024em`.
  - :633 `.sec-head h2,.faq-head h2`: add `font-weight:640;font-stretch:112.5%`, so the new 700 h2 base doesn't reach them.
- **Check:** at 1440 the story h1 is 72px at 640, and the story h2 and the join h2 are 60px at 640.

### TYPE-09 · medium · Body text has line height 1.7 where the token is 1.55
- **Where:** privacy, terms, method, about and weekly-issue (`.doc`); both fact sheets and the stub (`.le-sec`).
- **Selectors:** styles.css:373 `.doc p,.doc li{line-height:1.7}` (230 elements); library.css:203 `.le-sec>p,.le-sec .big{line-height:1.7}`; library.css:380 `.asks li{font:500 18px/1.4 …}`.
- **Evidence:** measured live: `.doc p` has a 28.05px line on 16.5px type (1.70), `.le-sec>p` 28.9px on 17px (1.70), and `.asks li` 25.2px on 18px (1.40). Image: `doc-line-length-105ch-lh1.7@1440.jpg`.
- **The rule it breaks:** tokens.json `body` 1.55 and `lede` 1.6; the brief's range for body text is 1.5–1.6.
- **Fix:**
  - styles.css:373 `line-height:1.7` → `1.55`.
  - library.css:203 → `1.55`, with `.le-sec .big` at `1.6` as a lede.
  - library.css:380 → `font:500 18px/1.55 var(--body)`.

### TYPE-10 · medium · Meta lines and table heads are set in tracked capitals
- **Where:**
  - The 11 doc-head pages: about, compare, compare-pair, goals, goal-weight, method, privacy, status, terms, weekly and weekly-issue.
  - status, with 122 rows.
  - Both fact sheets, weekly, Library and Home.
  - method, in both table heads.
- **Selectors:**
  - styles.css:370 and pages.css:5 `.doc-head p:last-child`: 12px, .12em, capitals ("UPDATED NOV 4, 2026").
  - pages.css:61 `.st-when`: 11px, .08em ("CHECKED OCT 28, 2026 · ITS SOURCES").
  - pages.css:105 `.wk-d`: 11px, .08em.
  - library.css:234 `.st-meta`: 11px, .06em.
  - library.css:90 `.lib-count`: 11px, .1em.
  - styles.css:281 `.vs-when`: 10.5px, .11em.
  - styles.css:545 `.method .mtable thead th`: 11px, weight 600 (which loads the bold file), .1em ("WHAT", "COUNTS AS").
- **Evidence:** the path line already sets the same fact as brand meta: `.wp-meta` reads "checked oct 28, 2026 against 10 sources" in mono 12.5px/400, lowercase and untracked. Image: `meta-lines-caps-vs-lowercase@1440.jpg`.
- **The rule it breaks:**
  - tokens.json `label`: "Side panel labels and meta, lowercase".
  - README Principles 2 gives the example "checked oct 28, 2026 against 10 sources".
  - TopTable README: type in `data`; the preview's head reads "# compound signal last move".
- **Fix:**
  - Set meta as `log`, `font:400 12.5px/1.5 var(--mono);letter-spacing:0;text-transform:lowercase`, on styles.css:370, pages.css:5, :61 and :105, library.css:234 and :90, and styles.css:281 (`.vs-when` only).
  - Set table heads as `data`: styles.css:545 → `font:400 13px/1.4 var(--mono);letter-spacing:0;text-transform:lowercase`.

### TYPE-11 · medium · Mono capitals use six trackings, and some lowercase mono is tracked
- **Where:** Library, the fact sheets, goal-weight, status, Home, compare-pair, method and every page's foot.
- **Evidence (element counts at 1440):**

  | Tracking | Selectors |
  |---|---|
  | .06em | `.st-meta`, `.conf` |
  | .08em | the `.ev` and `.st` pills (about 560), `.check`, `.pg-jump a`, `.legend` |
  | .1em | `.lc-fam` (347), `.le-facts dt`, `.pg-goals a`, `.lib-filters label`, `.chips span`, `.bl-how` |
  | .11em | `.vs-k`, `.vs-cap` |
  | .12em | `.kick`, `.cmp-k`, `.bl-k`, `.lib-stats dt`, `.gc-head`, `.vs-cols`, `.kick-sm` |
  | .14em | `.moves-k`, `.net-n`, `.hc-head` |

  Lowercase mono that is tracked: `.aka` .06em (fact sheets), `.foot .copy` .06em (21 pages), `.hc-labels` .08em and `.net-foot` .04em (Home). Image: `mono-caps-tracking-spread@1440.jpg`.
- **The rule it breaks:** in tokens.json only `kicker` has letter spacing (.12em); `label`, `data`, `log` and `status` have none. The brief: mono text is not tracked except kickers.
- **Fix:** every mono capital takes `letter-spacing:.12em`.
  - library.css:
    - :8 `.ev,.st,.hc,.pill`: .08 → .12.
    - :25 `.check`: .08 → .12.
    - :101 `.lc-fam`: .1 → .12.
    - :150 `.le-facts dt`: .1 → .12.
    - :158 `.legend`: .08 → .12.
    - :173 `.lvl-rule`: .06 → .12.
    - :186 `.use-meta`: .07 → .12.
    - :336 `.moves-k`: .14 → .12.
    - :88 `.lib-filters label`: .1 → .12.
  - styles.css:
    - :117 `.net-bar`: .1 → .12.
    - :191 `.hc-head`: .14 → .12.
    - :264 `.chips span`: .1 → .12.
    - :281 `.vs-k,.vs-cap`: .11 → .12.
    - :285 `.vs-lvl`: .1 → .12.
    - :552 `.conf`: .06 → .12.
    - :597 `.net-n`: .14 → .12.
  - pages.css:
    - :30 `.pg-goals a`: .1 → .12.
    - :45 `.pg-jump a`: .08 → .12.

  Lowercase mono takes 0:
  - library.css:132 `.aka`: .06em → 0.
  - styles.css:401 `.foot .copy`: .06em → 0.
  - styles.css:223 `.hc-labels`: .08em → 0.
  - styles.css:123 `.net-foot`: .04em → 0.

  The SIG segment's .04em stays: it is the brand's own (bundle.css `.mh-ws.sig`).

### TYPE-12 · medium · /compare/: evidence pills at 14.5px, with their meters gone
- **Where:** compare, at all widths (24 pills).
- **Selector:** pages.css:36 `.pg-goal span{display:flex;flex-wrap:wrap;gap:6px;color:var(--text-2);font-size:14.5px}` also matches the nested `span.ev` and `span.mh-meter`. Its specificity (0,1,1) beats `.ev` (library.css:8, (0,1,0)).
- **Evidence:** `.ev` computes 14.5px on /compare/ and 10.5px on Library, goal-weight and the fact sheets. `.mh-meter` becomes `display:flex`, so its four `i` collapse to zero width: that is the empty gap before "STRONG EVIDENCE". Images: `compare-ev-pills-14px@1440.jpg` against `library-ev-pills-10px@1440.jpg`.
- **The rule it breaks:** one size per style (the pills are 10.5px everywhere else); kit.css `.mh-meter` draws four 8px bars.
- **Fix:** pages.css:36 `.pg-goal span` → `.pg-goal>span`.
- **Check:** `.ev` on /compare/ is 10.5px, with the four-bar meter showing.

### TYPE-13 · medium · Ask Sig's labels drift from the rest of the window
- **Where:** Ask Sig (/sig/) at 1440 and 1024; the status bar is hidden at 700px and below.
- **Selectors:**
  - ai/term.css:120 `.tm .tm-status{font:600 11px/1 var(--mono)}`. Monaspace Neon loads its bold file from weight 550, so the status bar reads bold. Every other page uses styles.css:849 `.win-status{font:500 11.5px/1 var(--mono)}`.
  - ai/term.css:444 `.sg-k{font:600 10.5px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase}` reads "CHATS ON THIS DEVICE". Elsewhere the side-panel label is `.os-k` (styles.css:778): "more", 11.5px/400, lowercase.
  - ai/term.css, `@media (min-width:1101px)`: `.tm-tabbtn` and `.tm-live` are 600, 10.5px, .08em capitals ("AGENTS", "SCREEN", "READY").
- **Evidence:** images `status-bars-compared@1440.jpg` and `asksig-side-label-caps@1440.jpg`.
- **The rule it breaks:**
  - tokens.json `status`: 11.5px/500, "The status bar's segments and the window's tabs (12px)".
  - tokens.json `label`: 11.5px/400, lowercase.
  - SidePanel README: labels are lowercase.
- **Fix:**
  - term.css:120 → `font:500 11.5px/1 var(--mono)`.
  - term.css:444 → `font:400 11.5px/1 var(--mono);letter-spacing:0;text-transform:lowercase`.
  - `.tm-tabbtn` → `font:500 12px/1 var(--mono);letter-spacing:0;text-transform:lowercase`.
  - `.tm-live` → `font:500 11.5px/1 var(--mono);letter-spacing:0;text-transform:lowercase`.

### TYPE-14 · medium · Glyphs the fonts lack render in a fallback face
- **Where:** found by asking Chrome DevTools which platform font drew each text node, at 1440 and 390.
  - **story:** `.sl-st` ✓ ×13 and `.sy-ok` ✓.
  - **Fact sheets:**
    - The kit body map's `.mh-bm-dir` ▼ and ◆ sit inside Mona Sans buttons and render in **Inter Medium**.
    - `.mh-bm-op` ◆ and the key's ◆ render in DejaVu Sans Mono.
  - **Home:** `.net-foot` ┤ and ◆, `.hp-go` ⏎, and `.chips .ok` "First-hand ✓".
  - **Library:** `text.t-mono` ● in the SVG legend (×8).
  - **Ask Sig:**
    - `.tm-key.k-send` "↵ send" and `.tm-ico::before` ● and ✓.
    - At 390, the box drawing ─┤ and ─▲ in `.cl .cx` (ai/screen.js:810).
- **Evidence:**
  - The shipped files are the published Latin sets. Mona Sans (221 glyphs) lacks ▲ ▼ ◆ ✓ → ← ≈ ≤ ≥. Monaspace Neon (487 glyphs) has ▲ ▼ ▶ ▸ ◊ • ← → ↩, but lacks ✓ ◆ ● ○ ⏎ ↵ ┤ ─.
  - Here the fallbacks are DejaVu Sans Mono and Inter; on a Mac they would be Menlo or Apple Symbols.
  - Images: `story-runlog-check-fallback@1440.jpg`, `sheet-bodymap-fallback@1440.jpg` and `sheet-bodymap-marks@1440.jpg`.
- **The rule it breaks:** README Type: "Never substitute Inter, Roboto or a system serif". The brief: only Mona Sans, Mona Sans Display and Monaspace Neon.
- **Fix:**
  1. kit/kit.css:99 `.mh-bm-dir{font-size:10px}` → `font:600 10px/1 var(--mh-mono)`, since ▲ and ▼ are in Monaspace Neon. The change goes through the kit's source, `shared/kit` in miracle-health-community.
  2. Use glyphs the fonts have:
     - ◆ → ◊ (U+25CA) in kit/bodymap.js:30 and :33, lib/graph.js:676, ai/screen.js:28 and :30, and the index.html:66 legend.
     - ⏎ and ↵ → ↩ (U+21A9) in index.html:85 and :88, and on the Ask Sig send key.
     - ● → • (U+2022) in ai/term.css:132 and library/signalviz.js.
  3. No glyph exists for ✓, ┤ or box-drawing ─. Draw ✓ with the community's "check" interface icon (README Iconography), as an inline SVG at 1em in currentColor. That covers build_library.mjs:1056–1057, index.html:145, term.css:134 and screen.js. Draw ┤ and ─ the same way, or choose glyphs the fonts have.

  bundle.css itself uses ✓ (`.mh-step .ok::before`) and ⏎ (the Prompt's keys), so the brand book needs the same change.

### TYPE-15 · medium · Story: the ring's dot overprints the "12"
- **Where:** story's hero, at all widths.
- **Selectors:** scripts/build_library.mjs:1026 `ringSvg(320, { sw: 26, centerY: 0 })` builds story/index.html:57. Its `circle.rg-c` (radius 10.56, at the centre) sits on `.sy-ring-n b` "12" (styles.css:943, mono 64px/600).
- **Evidence:**
  - The numeral spans -41 to +23px from the ring's centre at 1440 (box y 411–475, centre 452), and -31 to +13px at 390. The dot covers ±10.6px, so it lands on the baseline between the 1 and the 2.
  - Ask Sig's ring, which also has words in it, is drawn with `centerY: -44` (build_library.mjs:868) and is clear.
  - Images: `story-ring-12-dot-overlap@1440.jpg` and `@390.jpg`.
- **The rule it breaks:** lib/ring.js:20–21: "centerY pixels from the middle (up is negative), where a ring has words in its middle". A measured number has to stay legible.
- **Fix:** build_library.mjs:1026 `centerY: 0` → `centerY: -66` (Ask Sig's -44 at 212px, scaled to 320px). Then rebuild.
- **Check:** the dot spans -76.6 to -55.4px, clearing the numeral by 14px at 1440 and by about 7px at 390.

### TYPE-16 · low · Headlines render wide only through the @font-face clamp
- **Where:** every headline. The data reads `fontStretch: 100%` for all 3,174 Mona Sans Display elements across the four widths, and weight 500 for 606 of 671 at 1440.
- **Selectors:** styles.css:12 `@font-face{font-family:'Mona Sans Display';…font-weight:640 900;font-stretch:112.5% 125%}`, with :55 and :561 setting weight 500 and no stretch.
- **Evidence:** in Chrome 153 the same line measures 712.5px set as Mona Sans Display at 500 and 712.5px set as Mona Sans at 640 and 112.5% (so it is wide and 640), against 670.9px at 100%. The browser clamps the computed 100%/500 into the face's range. That works here (WebKit couldn't be tested), but the computed style, and any audit that reads it, says 100% and 500. Page h1s and h2s compute 500, render 640, and the tokens say 700. Image: `display-face-renders-112.5-via-clamp.jpg`.
- **The rule it breaks:** README Type: "Mona Sans Display, the same file wider (from 112.5%) and heavier (from weight 640)". The token weights are 640 for hero and section, and 700 for page and h2.
- **Fix:** the role rules in TYPE-01, 03, 04 and 08 set `font-stretch:112.5%` and the token weight explicitly. Add `font-stretch:112.5%` to the remaining `var(--head)` users: `.plan-title`, `.phero-step` and `.plan-oops` (ai/plan.css:13, :20, :154), and `.t-head` (styles.css:312, library.css:37).
- **Check:** in a new capture, headline `fst` reads 112.5% and `fw` reads 640 or 700.

### TYPE-17 · low · Widows in titles that have no balance
- **Where:**
  - Library at 1440 and 390: 10 `.lc-name` card titles end on one word, such as "blend", "acid)", "semaglutide)", "TB-500)" and "1-29)".
  - The fact sheets' `.part b`: "semaglutide)".
  - compare's `.pg-goal b`: "Ipamorelin".
  - Home at 390, `.faq-list summary`: "dose?" and "share?".
  - weekly at 390, `.wk-t`: "allowed".
  - Lists and table cells, such as privacy `li` "emblems.", method `th` "fixed" and the fact sheet `li` "recommended".
- **Selectors:** library.css:105 `.lc-name`, :252 `.part b`; pages.css:35 `.pg-goal b`, :104 `.wk-t`; styles.css:339 `.faq-list summary`. These are not h1–h3, so the base `text-wrap:balance` (styles.css:55) misses them. `text-wrap:pretty` is on `p` only (:56).
- **Evidence:** verified live (an inline style; the site's CSP blocks injected style tags). `balance` gives "Vitamin B5 / (pantothenic acid)", "Why won't you / tell me a dose?", "Off FDA's risk list isn't / the same as allowed" and "CJC-1295 with / DAC vs Ipamorelin". `pretty` fixes the first three but not the fourth. Image: `widows-unbalanced-titles.jpg`.
- **The rule it breaks:** the brief: headlines that end on a single short word. bundle.css sets `text-wrap:balance` on the plate h1.
- **Fix:**
  - Add `text-wrap:balance` to `.lc-name`, `.part b`, `.pg-goal b`, `.wk-t`, `.faq-list summary`, `.vs-use`, `.cmp-name` and `.foot-news>p b`.
  - Next to styles.css:56, add `li,dd,td,th,figcaption{text-wrap:pretty}`.

### TYPE-18 · low · Measured numbers are set in Mona Sans with proportional figures
- **Where:** Library (the filter chips), method (the weights) and the fact sheets (the "Checked" row).
- **Selectors:**
  - library.css:84 `.lib-chips button span`: the counts 300, 79, 22, 156, 34 and 9 inherit Mona Sans 13.5px from :366.
  - The method page's first `table.mtable`, in its "Counts as" cells: 1, × 1.25, × 1.1 and × 0.6–1.15, in Mona Sans 14.5px.
  - The list of the Signal's parts, `.doc li > b`: 65% / 15% / 10% / 10%, in Mona Sans 600.
  - The fact sheets' `.le-facts` "Checked" `dd`, "Oct 28, 2026 against 10 sources": Mona Sans 14.5px (library.css:151).
- **Evidence:**
  - Mona Sans figures are proportional by default: the 1 advances 325 units and the 0 advances 612. A `tnum` feature exists, but it is off, and computed `font-variant-numeric` is `normal` on all of these.
  - Every other measured number on the site is mono (Monaspace Neon is fixed-width), and the big stats set `tabular-nums`.
  - Image: `numbers-in-mona-sans-proportional.jpg`.
- **The rule it breaks:**
  - README Principles 2: every number "is set in mono".
  - tokens.json `data`: "Tables and numbers, tabular figures".
- **Fix:**
  - library.css:84 → `.lib-chips button span{font:400 13px/1 var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)}`.
  - On the method page, give the "Counts as" cells and the four `li > b` weights `class="num"` (build_library.mjs, method page), styled `font:500 13px/1.4 var(--mono);font-variant-numeric:tabular-nums` (TYPE-19).
  - Give the fact sheet's "Checked" `dd` the `log` style (`font:400 12.5px/1.5 var(--mono)`) in build_library.mjs.

### TYPE-19 · low · Mono sizes off the scale
- **Where:** the fact sheets, Home, 404, weekly and method.
- **Selectors:**
  - library.css:30 and :381 `.ref`: 10px/600 (the bold file), 41 citation chips across the two sheets. They read as specks beside 17px text, and their `rgba(11,15,17,.08)` ground is invisible on graphite, which is for the colour lead.
  - styles.css:223 `.hc-labels`: 10px.
  - styles.css:729 `.step-n`: 13px.
  - styles.css:917 `.nf-shell`: 13.5px/1.75. Story's `.sy-term` and Ask Sig's log are 12.5px.
  - styles.css:718–719 `.hero-ask`: 14px.
  - styles.css:284 `.vs-score .of`: 14px.
  - pages.css:103 `.wk-n`: 600 14px.
  - styles.css:548 `.method .mtable .num`: 600 15px/1.3.
- **Evidence:** images `terminal-blocks-404-vs-story@1440.jpg` and `sheet-line-length-92ch@1440.jpg` (where the refs show).
- **The rule it breaks:** tokens.json Mono: `label` 11.5, `kicker` 12, `log` 12.5, `data` 13, `status` 11.5. bundle.css `.mh-shell` is 12.5px/1.75.
- **Fix:**
  - `.ref` → `font:400 11.5px/1 var(--mono)`.
  - `.hc-labels`: 10 → 11.5px.
  - `.step-n`: 13 → 12.5px.
  - `.nf-shell`: 13.5 → 12.5px, line height 1.75.
  - `.hero-ask` and `.hero-ask a`: 14 → 12.5px.
  - `.vs-score .of`: 14 → 13px.
  - `.wk-n` → `400 13px/1`.
  - `.method .mtable .num` → `500 13px/1.4`, plus `font-variant-numeric:tabular-nums`.

### TYPE-20 · low · A right-aligned note, and a centred lede over left-aligned cards
- **Where:**
  - `.sec-note`: Home (×3) and Library, at 1440 and 1024.
  - The join band: Home at 390.
- **Selectors:**
  - styles.css:243 `.sec-note{text-align:right}`: two or three ragged-left lines ("Side by side on every page, never mixed together.").
  - styles.css:349 and :356 `.join` and `.join .lede{text-align:center}`: at 390 the lede centres over three lines ("18 and over." alone) above left-aligned step cards.
- **Evidence:** images `library-sec-note-right-aligned@1440.jpg`, `home-sec-note-right-aligned@1440.jpg` and `home-join-centred@390.jpg`.
- **The rule it breaks:** the brief: centred or right-aligned multi-line text that should be left-aligned. Every other text block on the site sets left.
- **Fix:**
  - styles.css:243 `text-align:right` → `left`. The box stays at the right end of the row, since `.sec-head` is space-between.
  - Add `@media (max-width:600px){.join{text-align:left}.join-in{align-items:flex-start}}`.

### TYPE-21 · low · 71 Arial elements per width: icon buttons and a honeypot
- **Where:** every page.
  - **At 1440 and 1024:**
    - `button#os-fold.os-fold` and its `svg`: 21 pages each.
    - `form.news-form > span.nf-hp > input`, the off-screen honeypot at `left:-9999px`: 21 pages.
    - On Ask Sig (counted twice, because `/ai/` is the same page): `button#sg-fold.sg-fold`, `button#tm-plus.tm-plus` and their two `svg`s.
    - The total is 21 + 21 + 21 + 8 = 71.
  - **At 768 and 390:** the same, with `button#os-menu.win-menu` and Ask Sig's `button#tm-menu.tm-menu` in place of the fold buttons.
- **Why:** buttons and inputs don't inherit `font`; the browser's default is 13.333px Arial. These rules set no font:
  - styles.css:763 `.os-fold,.win-menu`.
  - ai/term.css:111 `.tm-plus`.
  - ai/term.css:436 `.sg-fold,.tm-menu`.
  - The honeypot input (styles.css:415), which has no style at all.

  No visible text renders in Arial: the buttons hold only icons and the input is off-screen.
- **The rule it breaks:** the brief: only the three families.
- **Fix:** add `button,input,select,textarea{font:inherit}` to styles.css after line 52; it loads on every page, /sig/ included. Every other control sets its own `font`, so only these change.
- **Check:** the next capture shows 0 Arial.

### TYPE-22 · low · Fifteen page h1s lack the closing full stop
- **Where:**
  - method, status, goals, goal-weight, compare, compare-pair, weekly, weekly-issue, privacy, terms, My Miracle and Plan.
  - Every fact sheet: Semaglutide, Creatine monohydrate and 5-HTP here.
  - About, founders, Home, Library, story and 404 already end in one.
- **Sources:**
  - scripts/build_library.mjs: fact sheets :623, compare :743, plan :951, My Miracle :980, method :1129.
  - scripts/build_pages.mjs: the doc-head template :72, the compare pair :285.
  - privacy.html:51, terms.html:51.
- **Evidence:** image `h1-sizes-across-pages@1440.jpg` shows them.
- **The rule it breaks:** README Type: 'A page's h1 ends in a full stop: "Your feed.", "The Signal."' The Plate README: "a headline in `page` ending in a full stop".
- **Fix:** append "." to these h1s in the templates and files above. This changes the format, not the words.

---

## Systemic

**1. One rule per headline role, written once in styles.css.** Today about 30 local overrides make the same role look different. Set the roles from tokens.json, delete the per-page `font-size`, `line-height` and `letter-spacing`, and keep only margins and colour.

| Role | Used for | Value | 1440 / 390 |
|---|---|---|---|
| `hero` | Home and story h1 | `640 clamp(40px,5vw,74px)/1`, -0.03em, stretch 112.5% | 72 / 40 |
| `section` | `.sec-head h2`, `.faq-head h2`, `.join h2`, `.sy h2` | `640 clamp(36px,4.6vw,60px)/1.02`, -0.024em, max 15ch | 60 / 36 |
| `page` | every other h1, and `.ai-title` | `700 clamp(34px,3.4vw,48px)/1.02`, -0.026em | 48 / 34 |
| `h2` | in-page h2, the foot's heading, big feature cards | `700 clamp(22px,1.4vw + 6px,26px)/1.1`, -0.02em | 26 / 22 |
| `h3` | card, row and post titles, in **Mona Sans** | `600 16px/1.3`, -0.01em (17.5px for list-leading titles) | 16 |

The base heading rules must set line height, so no heading inherits body's 1.55, as the status, founders, Plan and fact-sheet h2/h3s do today.

**2. The type scale.** Today the site uses 22 Display sizes, 16 Mona Sans sizes and 12 mono sizes (plus 6 numeral sizes): 56 in all. Here is each size, where it is used and what it should be. Counts are elements with their own text at 1440.

*Mona Sans Display:*

| Size | Count | Where | Should be |
|---|---|---|---|
| 17 | 4 | `.le-sec h3` | h3 (Mona Sans 16) |
| 19 | 149 | `.st-row h3` 122, `.pg-goal b`, `.part b`, `.doc .short h2` | h3 16, and h2 26 for `.short h2` |
| 21 | 2 | `.fd-card h2` | 26 |
| 22 | 351 | `.lc-name` 346, `.join-steps h3`, `.my-sec h2`, `.plan-cta h2` | h3 16; 26 for the h2s and `.join-steps h3` |
| 23 | 9 | `.faq-list summary`, `.vs-use` | h3 17.5 and 16 |
| 24 | 4 | `.lib-explain h3`, `.cmp-name` | 26 and h3 16 |
| 26 | 48 | `.doc h2` | 26 (now at weight 700, -0.02em, line height 1.1) |
| 27 | 4 | `.rules h3` | 26 |
| 28 | 19 | `.foot-news>p b` | 26 |
| 30 | 13 | `.step h3`, `.st-group-h h2` | 26 |
| 32 | 6 | `.pg-sec>h2` | 26 |
| 34, 36, 62, 68, 77.76, 88, 92 | 1–11 each | page h1s and `.ai-title` | 48 |
| 38 | 20 | `.le-sec h2` | 26 |
| 60 | 15 | section heads; `.vs-id h3` | 60; 48 for `.vs-id h3` |
| 72 | 4 | Home hero; `.join h2` | 72 for the hero; 60 for `.join h2` |
| 80.64 | 2 | story h1 | 72 |

*Mona Sans:*

| Size | Count | Where | Should be |
|---|---|---|---|
| 10 | 6 | `.mh-bm-dir` | mono (TYPE-14) |
| 11.5 | 110 | `.os-legal`, `.sg-legal` | 11.5 (bundle.css `.mh-legal`) |
| 12 | 17 | `.mh-bm-mk`, `.mh-bm-key`, `.ai-fine` | 13 |
| 12.5 | 11 | `.cell-sub`, `.plan-note` | 13 |
| 13 | 52 | `.nf-note` (every page), `.side-note`, `.cmp-aka`, `.plan-fine`, `.hero-try a` | 13 fine print; `.hero-try a` → 14 (small button) |
| 13.5 | 147 | the places `.op-n`, `.os-ask`, `.os-signin`, `.lib-chips button` | 13.5 `nav`; `.lib-chips button` → 14 |
| 14 | 489 | `.lc-sum` 346, `.btn.sm`, `.win-brand b`, `.sy-agent p`, `.vs-sub`, the foot disclaimer | 15 for copy; `.btn.sm` and `.win-brand b` stay |
| 14.5 | 785 | `.foot-links a` 336, `.st-note` and `.st-label` 244, the method tables, `.btn`, `.le-facts dd`, `.pg-goal span` | `.btn` stays; copy → 15; `.foot-links a` → 13.5 `nav` |
| 15 | 54 | `.study p`, `.ev-box p`, `.step h3+p`, `.sy-pn`, `.ai-start` | 15; `.sy-pn` → h3; `.ai-start` → 14.5 |
| 15.5 | 54 | `.dots li`, `.marks li`, `.nums li`, `.claims p`, `.sec-note`, `.rules-members`, `.my-lede` | 16 on the page; 15 in cards |
| 16 | 198 | compare cells, `.st-desc`, `.foot-news>p`, fields | 16 |
| 16.5 | 230 | `.doc p` and `li`, `.faq-list details p`, `.st-title`, `.ai-lede` | 16; `.st-title` → h3; `.ai-lede` → 18 |
| 17 | 23 | `.le-sec>p` (with `.lab-why` and `.checked`), `.sy-agent h3`, `.hero .lede` | 16, h3 and 18 |
| 18 | 20 | `.lede`, `.sy-lede`, `.asks li`, `.sy-win b`, `.wk-t` | 18; the titles → h3 |
| 19 | 23 | `.pg-intro`, `.doc .intro`, `.big`, `.sy-hero .lede` | 18 |
| 20 | 5 | `.bl-why`, `.vs-foot>p` | 18 |

*Monaspace Neon:*

| Size | Count | Where | Should be |
|---|---|---|---|
| 10 | 45 | `.ref` 41, `.hc-labels`, `.tm-count-k` | 11.5 `label` |
| 10.5 | 1011 | pills (`.ev`, `.st`, `.hc`, `.check`, `.conf`), `.lc-fam` 347, `dt` labels, `.bl-k`, `.vs-k`, `.kick-sm`, `.gc-head`, `.legend`, `.moves-k` | 10.5 only for **framed** tags (as bundle.css's COMMUNITY tag and status lead segment); unframed capitals → 12 `kicker` |
| 11 | 426 | `.st-when` 244, `.op-k` 88, `.mh-bm-src`, `.st-meta`, `.net-foot`, method `th`, `.lib-filters label`, `.lib-count`, `.wk-d`, `.tm-status` | 11.5 `label`/`status`; `.op-k` stays 11, as bundle.css's `.mh-place .k` |
| 11.5 | 274 | `.os-k`, `.win-dim`, status `.ws`, `.pg-goals a`, `.pg-jump a`, `.sy-an` | 11.5 |
| 12 | 201 | `.kick`, `.win-tabname`, `.skip`, `.copy`, `.h-by`, doc-head meta, `.cmp-k`, `.aka`, `.rng` | 12 for kickers and tabs; meta → 12.5 `log` |
| 12.5 | 563 | `.os-more a` 210, the side-panel tree, the path line, story's log, `.sy-k` | 12.5; `.os-more a` → `nav` (TYPE-06); `.sy-k` → 12 |
| 13 | 10 | `.step-n`, `.hero .kick`, `.tm-ps1` | 12.5; `.hero .kick` → 12 |
| 13.5 | 5 | `.nf-shell` | 12.5 |
| 14 | 8 | `.hero-ask`, `.of`, `.wk-n` (the `.win-tabx` × is an icon) | 12.5 / 13 |
| 14.5 | 24 | `.ev` on /compare/ | 10.5 (TYPE-12) |
| 15 | 13 | `td.num`; `.hp-ps1`, `.hp-go`, textarea | 13 `data` for `td.num`; the prompt's 15/16 matches bundle.css `.mh-ps1` and `.mh-q` |
| 30–68 | 12 | stat numerals | already tabular; leave |

After the fixes, Display runs at 4 sizes (26, 48, 60 and 72 at 1440). Mona Sans runs at 8: 11.5 legal, 13 fine print, 13.5 `nav`, 14 and 14.5 buttons, 15 card copy, 16 body and h3, 18 lede. Mono runs at 5 (10.5 tags, 11.5, 12, 12.5, 13), plus the prompt's 15 and 16 and the six numeral sizes. That is 25 sizes in all in place of 56, and 17 for words and labels.

**3. Measure.** Running text gets `max-width:52ch`, ledes `50ch`; in Mona Sans 1ch is 1.33 characters, which gives 66–69 characters. Today the caps run from 50ch (`.lede`) to 86ch (`.rules-members`), and most running text (`.doc`, `.le-sec`, `.pg-*`, `.study`) has none.

**4. Line height.** Body 1.55, lede 1.6, h3 1.3, h2 1.1, page and section 1.02, hero 1. Today 1.7 appears on 7 pages, and three heading rules inherit 1.55.

**5. Tracking and case in mono.** Only capitals are tracked, always at .12em; everything else is 0. Capitals are reserved for kickers and framed tags; meta, labels and table heads are lowercase. Today there are six tracking values and two casings for meta.

**6. Mono weight.** Monaspace Neon is two static files, regular for weights up to 549 and bold from 550. Keep every label at 400 or 500 (regular) and use 600 and up only for numerals. Today `.ref`, `.mh-bm-src`, `.conf`, method `th`, `.sg-k` and Ask Sig's whole status bar load the bold file at 10–11px.

**7. Wrapping.** `balance` goes on every Display or title element, not only h1–h3, and `pretty` on `p, li, dd, td, th, figcaption`.

**8. Glyphs.** Use only glyphs the two fonts contain (see TYPE-14 for the substitutes) and draw the rest as icons. Form controls inherit `font`.

**9. Numbers.** Anything measured is set in mono. Numbers in tables use `data` 13px with `tabular-nums`; display numerals keep the `tabular-nums` they already have.
