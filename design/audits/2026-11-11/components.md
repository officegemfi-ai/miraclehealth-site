# Components and states: audit report

**State of the area:** three layers of CSS (the old light theme, the "Plate" redraw and per-page overrides) make each component come out four or five ways; four things are broken outright (an invisible button label, an invisible link on 45 sheets, an unstyled body map on every sheet, an invisible focus ring on Join), and every page shows two to four white "main" buttons at once.

All measurements come from the captured data (`data/*.json`) and from Playwright on `http://127.0.0.1:8765`. Evidence images are in `/home/claude/design/evidence/components/`, given below as `ev/…`. Line numbers refer to the `design-dept` branch as it stands now. Counts written "×N" are element instances across the 23 pages at all 4 widths.

---

## Findings

### COMP-01 · high · More than one white main action on screen, on every page
- **Where:** 21 of 22 window pages at 1440 and 1024 (all except Ask Sig), and 13 pages at 390. Fact sheets are the worst case.
- **Selectors:**
  - Side panel "Join": `.os-acct .btn.lime.sm` (scripts/build_library.mjs:173; index.html:43, privacy.html:31, terms.html:31, 404.html:31) and `.sg-acct .btn.lime.sm` (build_library.mjs:898).
  - The foot's "Get it weekly": `.foot-news .nf-row .btn.bone` (scripts/build_pages.mjs:28 `signupForm`, plus the hand-written pages).
  - Fact sheets: `.le-bl .vs-act .btn.lime` (build_library.mjs:564), `.le-signal .sig-cta` (:655) and `.side-card .btn.lime.sm` (:670).
  - Weekly issue: `.wk-close .btn.lime` (build_pages.mjs:375).
- **Evidence:** Playwright scrolled every page by half a viewport and counted the opaque #EEECE6 buttons visible at once:
  - home@1440: 3 (Join, Join the community, Get it weekly).
  - sheet-semaglutide@1440, first screen: 3 (Join, Ask Sig about Semaglutide, Share how it went).
  - sheet-creatine@1440: 4.
  - founders, goal-weight, story, my, plan, 404, compare, compare-pair, weekly-issue @1440: 3 each.
  - On each fact sheet, "Share how it went" is white three times, and a hairline once in the head.
  - Images: `ev/white-buttons-sheet-semaglutide@1440.jpg`, `ev/white-buttons-home@1440.jpg`, `ev/white-buttons-weekly-issue@1440.jpg`.
- **Rule broken:**
  - README › Colour: "One main action per view: the white button".
  - Button README: "Never two white buttons on one screen".
  - tokens `accent`: "Never two on a screen".
- **Fix:** turn the persistent and repeated buttons into hairlines. Add after styles.css:575:
  `.os-acct .btn,.sg-acct .btn,.foot-news .btn,.wk-close .btn,.le-bl .vs-act .btn,.le-signal .btn,.side-card .btn{background:transparent;border-color:var(--line-2);color:var(--text)}`
  `.os-acct .btn:hover,.sg-acct .btn:hover,.foot-news .btn:hover,.wk-close .btn:hover,.le-bl .vs-act .btn:hover,.le-signal .btn:hover,.side-card .btn:hover{background:transparent;border-color:var(--text);color:#FFFFFF}`
  - Alternatively, change those classes from `btn lime`/`btn bone` to `btn line` in the generators listed above.
  - The weekly page's own sign-up (`.news-form.on-paper`) stays white.
  - **Checked:** with these rules injected, every page has at most one white button per view at 1440 and 390. The one exception is the Library's pressed chip; see COMP-16.

### COMP-02 · high · The body map is unstyled on every fact sheet
- **Where:** all 122 full fact sheets (the "where it acts in the body" section), at all widths.
- **Selector:** kit/kit.css:66 has a stray `}` after the reduced-motion block. The next rule's prelude becomes `} .mh-bm`, which is invalid, so the whole `.mh-bm{position:relative;container:mh-bm/inline-size;--mh-bm-rule…;--mh-bm-lit…;font…}` rule (kit.css:71–79) is dropped.
- **Evidence:** on /library/semaglutide/:
  - `--mh-bm-rule` computes empty.
  - `button.mh-bm-mk` has border `0px none` (its rule says `1px solid var(--mh-bm-rule)`).
  - `.mh-bm-row` has no top border.
  - `.mh-bm-src` (citation chips) has a transparent background.
  - The route tag "Taken as: injection or pill" has no frame.
  - The `@container mh-bm (min-width:34rem)` two-column layout never applies, so the place names stack over their lines.
  - Cautions ("!") lose their colour.
  - With the rule restored, you get hairlines between places, two columns and framed chips.
  - Images: `ev/bodymap-no-hairlines@1440.jpg` (now) and `ev/bodymap-with-rule-restored@1440.jpg` (fixed).
- **Rule broken:** the kit component as drawn (hairline dividers, framed chips); `line` frames and dividers.
- **Fix:** delete the extra `}` on kit/kit.css:66.
  - Make the change in the kit's source (miracle-health-community `shared/kit`) and re-run `scripts/sync_kit.sh`, since CI checks that the copies match. The community app probably has the same bug.
  - For the colour lead: `--mh-bm-warn` mixes `#D9452B`, which is not the `safety` token.

### COMP-03 · high · Stub fact sheets: "Fact sheet in progress" box has no top padding and an invisible frame
- **Where:** all 169 stub sheets (e.g. /library/5htp/), at all widths.
- **Selector:** `section.le-sec.pending-box`.
  - `.le-sec:first-child{border-top:0;padding-top:0}` (library/library.css:200) wins over `.pending-box{padding:30px 32px;border:1px dashed rgba(11,15,17,.3)}` (library.css:249).
- **Evidence:** computed padding-top 0px and border-top none. The other three sides are `1px dashed rgba(11,15,17,.3)`, which is ink on graphite and so invisible. The headline sits flush against the top edge of the raised box. Image: `ev/sheet-stub-pending-box@1440.jpg`.
- **Rule broken:** cards are `surface-raised` with a `line` hairline (README › Colour › Hairlines).
- **Fix:** add after library.css:379:
  `.le-sec.pending-box{padding:24px;border:1px solid var(--line)}`
  `@media (max-width:600px){.le-sec.pending-box{padding:20px}}`
  - This has the same specificity as `.le-sec:first-child` and comes later, so it wins.

### COMP-04 · high · Radii off the brand's set
- **Where:** every page. In the table, the counts column is instances in the captured data, all widths together.
- **Rule broken:** README › Shape and depth: `radius-plate` 6, `radius-row` 7, `radius-control` 8, `radius-strip` 9, `radius-shell` 10, `radius-window` 12, 50% dots. "No pills."
- **Fix:** change the radius in the rule named in each row. Better still, put the tokens in `:root` (styles.css:22, e.g. `--r-plate:6px;--r-row:7px;--r-control:8px;--r-shell:10px;--r-window:12px`) and use them, so the drift can't come back.

| In use | ×N | Component (selector, file:line) | Pages | Should be |
|---|---|---|---|---|
| 5px | 2,380 | evidence/status/study tags `.ev .st .pill` (library.css:361) | 8 | `radius-control` 8px |
| 5px | 164 | citation numbers `.ref` (library.css:30) | sheets | 6px, as the kit's `.mh-bm-src` (COMP-16) |
| 5px | 24 | body-map marker buttons `.mh-bm-mk` (kit.css) | sheets | 8px (in the kit source) |
| 5px | 24 | Ask Sig roster rows `.tm-who` (term.css:362) | Ask Sig | `radius-row` 7px |
| 5px | 20 | home AI-card chips `.chips span` (styles.css:645) | home | 8px |
| 5px | 12 | tab close × `.win-tabx` (styles.css:832) | sheets | 7px (like the menu/fold buttons) |
| 5px | 6 | Ask Sig send key `.tm .ai-send` (term.css:206) | Ask Sig | 7px, as `.hp-go` / the bundle's `.mh-go` |
| 5px | 9 | `.vs-status` (styles.css:651), `.mh-bm-route` (kit), `.hc-range` (styles.css:620) | home, sheets | 8px |
| 6px | 420 | side-panel "more" rows `.os-more a` (styles.css:781) | 21 | 7px |
| 6px | 254 | side-panel Library tree rows `.os-ctx .lt-dir`, `.lt-files a` (styles.css:801, 806) | 4 | 7px |
| 6px | 32 | Ask Sig "ways in" icon frame `.start-ico` (ai.css:585) | Ask Sig | 7px |
| 6px | 8 | Ask Sig new-chat + `.tm-plus` (term.css:111) | Ask Sig | 7px |
| 6px | 8 | 404 hairline buttons `.btn.glass`, via `.glass{border-radius:6px}` (styles.css:576) | 404 | 8px |
| 6px | 4 | graph label link `.net-ask` (styles.css:608) | home | 8px |
| 6px | 12 | glance band `.le-glance` (library.css:376) | sheets | none: it isn't a card (COMP-12) |
| 7px | 104 | jump chips `.hero-try a` (styles.css:615), `.pg-goals a`, `.pg-jump a` (pages.css:153) | home, goal pages, status | 8px |
| 7px | 32 | Ask Sig "ways in" `.ai-start` (ai.css:584) | Ask Sig | 8px |
| 7px | 24 | Library filter chips `.lib-chips button` (library.css:366) | library | 8px |
| 7px | 12 | Library selects `.lib-filters select` (library.css:369) | library | 8px |
| 7px | 21 | window tab on phones `.win-tab` (styles.css:884) | all @390 | 8px |
| 7px | 20 | founders pair rows `.fd-pairs a` (pages.css:153) | founders | `radius-plate` 6px (they are link cards) |
| 8px | 20 | fact-sheet contents rows `.toc a` (library.css:259) | sheets | 7px (rows) |
| 8px | 10 | Ask Sig prompt `.tm .ai-chat.is-empty .ai-composer` (term.css:190; ai.css:586 says 10px) | Ask Sig | `radius-window` 12px (Prompt component) |
| 10px | 4 | Library search `.lib-search input` (library.css:364) | library | 8px |
| 12px | 48 | story cards `.sy-print` (styles.css:978), `.sy-win` (:984) | story | 6px |
| 12px | 4 | story run log `.sy-term` (styles.css:956), a terminal block | story | `radius-shell` 10px |
| 14px | 8 | `.method .mtable-wrap` (styles.css:541), `.sy-twelve` (styles.css:948) | method, story | 6px |
| 20px | 40 | method confidence pills `.method .conf` (styles.css:552) | method | 8px |
| 40px | 92 | skip link `.skip` (styles.css:60) | 23 | 8px (COMP-22) |
| 40px | 88 | harm tags `.hc` (library.css:8), fact-checked tag `.check` (library.css:25) | sheets, compare-pair | 8px |
| 1.5px | 3,200 | evidence-meter segments `.mh-meter i` (kit.css) | 6 | a data mark, not a corner: keep (if changed, only in the kit source) |
| 3px | 48 | `.vs-bar` (svg), legend swatches `.legend .k` | home, sheets | data marks with half-height ends, like the brand's TopTable bar (rx 2.5 on 5px): keep |

- **Already correct:**
  - 6px: cards, plates and tables (≈3,000).
  - 7px: side-panel places, fold/menu buttons, `.hp-go`.
  - 8px: buttons, fields, `.os-ask`.
  - 8 8 0 0: tab tops.
  - 12px: the window, title bar and status bar corners, and the home prompt.
  - 10px: the 404 shell and the story's status sample.
  - 0 0 0 11: the SIG segment (the window corner minus its 1px border).
  - 50%: dots (×1,215).
- **In the CSS only (states not captured):**
  - 40px pills, all should be 8px: `.lc-sig` (library.css:102), `.fx span` (:194), `.ci-how-b` and `.ci-took-b` (my/my.css:37, 45), and five in ai/packet.css (lines 63, 97, 105, 109, 117).
  - 4px: `.tm .tstep-chips a` (term.css:257) should be 8px.
  - 5px: `.mini` and `.ai-toscreen` (term.css:319), and `.vx-lead`, `.found-ev`, `.pick-ev`, `.lvl` (ai.css:591), should be 8px; `.tm-tabx` (term.css:105) should be 7px.
  - 6px: `.sg-del` (term.css:457) should be 7px; `.move` and `.moves-focus a` (library.css:339, 347) should be 8px.

### COMP-05 · high · Weekly issue: the "Share how it went" button has an invisible label
- **Where:** /weekly/1/ (and every issue built by build_pages.mjs), all widths.
- **Selector:** pages/pages.css:109 `.wk-close .btn{color:var(--text);text-decoration:none}`. It overrides `.btn.lime{color:var(--on-accent)}` because it has the same specificity and comes in a later file.
- **Evidence:** computed colour rgb(238,236,230) on background rgb(238,236,230): contrast 1:1. It is the only text under 2:1 on any of the 23 pages (contrast scan of every text node). It reads as a blank 169×48 white box. Images: `ev/wk-close-invisible-label@1440.jpg`, and the full page at `shots/weekly-issue@390.jpg`.
- **Rule broken:** `on-accent` words on `accent` (16:1).
- **Fix:** pages.css:109: change `.wk-close .btn{color:var(--text);text-decoration:none}` to `.wk-close .btn{text-decoration:none}`. With COMP-01 it becomes a hairline whose words are `text`.

### COMP-06 · high · Fact-sheet guide link is drawn in ink on graphite (invisible)
- **Where:** the 45 fact sheets with "here's how to read its lab report" (e.g. /library/bpc157/, /library/aod9604/), and "Tell us" on /library/lab-reports/. All widths.
- **Selector:** library/library.css:218 `.guide-link a,.lib-guide .le-sec p a:not(.ref){color:var(--ink);…}`. Unlike the other light-theme link rules, it was never overridden in the Plate section.
- **Evidence:** computed colour rgb(11,15,17) on #0B0F11, contrast 1:1. Only the 2px underline at 20% shows. Images: `ev/link-guide-link-bpc157@1440.jpg`, `ev/link-lab-reports-guide@1440.jpg`.
- **Rule broken:** `text` on surface at 15:1; the inline-link style (COMP-09).
- **Fix:** library.css:218:
  - `color:var(--ink)` → `color:var(--text)`.
  - `text-decoration-color:var(--line-2);text-decoration-thickness:2px` → `text-decoration-color:rgba(238,236,230,.5);text-decoration-thickness:1px`.

### COMP-07 · high · Focus rings are drawn inside instead of out, and the side panel's Join shows none
- **Where:** the side panel on 21 pages: 14 focusables per page (logo, fold, Ask Sig, 4 places, "more" links, Sign in, Join, legal, the Library tree). Also Ask Sig's panel, the window tabs and their ×, and Ask Sig's chat tabs, + and rail tabs. Every width (the drawer included).
- **Selectors and their offsets:**
  - −2px: styles.css:765 `.os-fold:focus-visible,.win-menu:focus-visible,.os-side a:focus-visible`, and term.css:438 (the `.sg-*` list).
  - −3px: styles.css:835 `.win-tab:focus-visible,.win-tabx:focus-visible`, and term.css:100 `.tm-tabopen/.tm-tabx/.tm-plus:focus-visible`.
  - −4px plus an inset 2px bar: term.css:341 `.tm-tabbtn:focus-visible`.
- **Evidence:** a Tab walk through 15 pages:
  - 66 element types get `2px solid #EEECE6, +3px` (correct).
  - 14 get −2px, 5 get −3px and 1 gets −4px.
  - On Join (#EEECE6 fill), the −2px #EEECE6 ring is invisible: rest and focus are pixel-identical. The same holds for Join on Ask Sig.
  - Images: `ev/focus-join-rest-vs-focus-zoom@1440.jpg`, `ev/focus-rings-inside@1440.jpg`; for comparison, a correct ring at `ev/focus-try-chip@1440.jpg`.
- **Rule broken:** States: "every focusable thing gets a solid 2px `text` ring, 2–3px out". Button: "a 2px text ring, 3px out".
- **Fix:**
  - styles.css:765 and term.css:438: `outline-offset:-2px` → `2px`. Rows sit inside the panel's 10–12px padding, so a ring outside them is not clipped.
  - So the tree and chat rows aren't clipped by their scroll boxes, add `.os-ctx{margin-left:-3px;padding-left:3px}` (after styles.css:777) and `.sg-chats{margin-left:-3px;padding-left:3px}` (after term.css:443).
  - Tab strips scroll (`overflow-x:auto`) and clip a ring outside them. Either give them room (`.win-tabs,.tm-chats{padding:0 3px;margin:0 -3px}` with offset 2px) or keep the ring inside but at one value: styles.css:835, term.css:100 and term.css:341 all `outline-offset:-2px`, and drop the inset bar from `.tm-tabbtn:focus-visible`.

### COMP-08 · high · A focused element lands under the sticky status bar
- **Where:** every window page at 1440, 1024 and 768 (wherever the status bar shows).
- **Selector:** styles.css:753 `:root:has(#os){…scroll-padding-top:calc(var(--os-top) + 14px)}` has no bottom padding. The status bar `.win-status` (styles.css:849) sticks 16px from the bottom and is 28px tall.
- **Evidence:** tabbing with smooth scrolling allowed to settle, the browser brings each next element in at the bottom of the viewport:
  - Cards on goals and compare: the bottom 28px and the lower edge of the ring are under the bar.
  - Foot links (21px tall): 8px covered.
  - about's "Tell us" (23px) sits at y 877–900, behind and below the bar.
  - Also, the 16px gap under the bar is meant to be painted in `page`, but `.win-status::before` (top:100%, 18px) is clipped by the bar's own `overflow:hidden`, so page content shows below the bar. This is window chrome; cross-check with the layout lead.
  - Images: `ev/focus-under-statusbar-goals@1440.jpg`, `ev/focus-tell-us-hidden-about@1440.jpg`, `ev/statusbar-gap-not-painted@1440.jpg`.
- **Rule broken:** WCAG 2.4.11 (Focus Not Obscured). README › The window: "The gap above and below them is painted in `page`."
- **Fix:**
  - styles.css:753: add `scroll-padding-bottom:calc(var(--os-g) + 28px + 14px)`. In the `@media (max-width:700px)` block at styles.css:877, add `:root:has(#os){scroll-padding-bottom:14px}`.
  - For the gap: styles.css:849 `overflow:hidden` → `overflow:clip;overflow-clip-margin:calc(var(--os-g) + 2px)`. Or let the layout lead move the gap paint off the bar.

### COMP-09 · medium · Inline links: four underline treatments, two weights, and no hover
- **Where:** the doc pages (privacy, terms, about, method, weekly issue) are consistent with each other; the rest differ.
- **Evidence:** computed styles of every inline `<a>` on every page at 1440. Image: `ev/links-six-styles@1440.jpg`.
  - **600, `text`, 1px underline at 50%, offset 3px:** `.doc a` (styles.css:665) on privacy, terms, about, method and the weekly issue; home's `.rules a` and `.faq-more a`.
  - **600, 2px underline at 20%:** `.pg-intro a, .pg-sub a, .pg-foot a, .st-note a, .cmp-why a` (pages.css:8) on status, compare-pair, goal-weight and founders; `.lib-guides a` (library.css:220) on the Library; `.st-title a` (library.css:236) and `.sources a` (library.css:245) on the fact sheets.
  - **Solid underline in the link's own colour:** `.checked a` (library.css:248, 600, 17px); `.le-facts a` (library.css:153, weight 400); `figcaption a` (mono); `.nf-note a` (styles.css:417, 400) in every foot; `.pa-src a` (pages.css:25, 400, muted); `.ai-fine a`; `.st-when a` (mono caps 11px).
  - **Hover:** no inline link changes on hover except home's `.vs-sub a`, whose words turn #FFF.
- **Rule broken:** States: "Hover: hairlines brighten to `text`". The brief: inline links look the same everywhere.
- **Fix:** one link, two tones.
  - Body copy: 600, `text`, `text-decoration-color:rgba(238,236,230,.5);text-decoration-thickness:1px;text-underline-offset:3px`.
    - Apply it at pages.css:8, library.css:218, 220, 236 and 245 (change `var(--line-2)` to `rgba(238,236,230,.5)` and `2px` to `1px`).
    - At library.css:248 and :153, add `text-decoration-color:rgba(238,236,230,.5);text-decoration-thickness:1px`; :153 also gets `font-weight:600`.
  - Small print and meta lines keep their line's colour and weight, with the same underline: add `text-decoration-color:rgba(238,236,230,.5);text-decoration-thickness:1px` to `.nf-note a` (styles.css:417), `.pa-src a` (pages.css:25), `.st-when a` (pages.css:62), `.le-print figcaption a` (library.css:410) and `.tm .ai-fine a`.
  - Hover: add `main a:hover,.foot a:hover{text-decoration-color:currentColor}` to styles.css. Its specificity is (0,1,2), so it beats the (0,1,1) link rules above.

### COMP-10 · medium · Compare index: evidence tags lose their meter and grow to 14.5px
- **Where:** /compare/ at all widths: 24 tags, 0 meter bars rendered.
- **Selector:** pages/pages.css:36 `.pg-goal span{display:flex;flex-wrap:wrap;gap:6px;color:var(--text-2);font-size:14.5px}`. It is meant for the card's meta line, but it hits every descendant span: `span.ev` and its `span.mh-meter`.
- **Evidence:** computed values for the tags:

  | | /compare/ | Library and every other page |
  |---|---|---|
  | Font size | 14.5px | 10.5px |
  | Letter spacing | 1.16px | 0.84px |
  | Colour | `text-2` | `text` |
  | Height | 29px | 25px |
  | `.mh-meter` | `display:flex`, 18px wide, its `<i>` bars collapse to 0 | `display:grid`, 38px |

  Image: `ev/badge-compare-vs-library@1440.jpg`.
- **Rule broken:** `evidence` is shown by the evidence meter (README › Colour); the tags should be one family.
- **Fix:** pages.css:36: change the selector `.pg-goal span` to `.pg-goal>span`.

### COMP-11 · medium · Cards: the same component in six paddings, four radii and four frames
- **Where:** goals and compare (`.pg-goal`), Library (`.lib-card`), founders (`.fd-card`, `.fd-pairs a`), weekly issue (`.wk-get`), story (`.sy-print`, `.sy-win`, `.sy-twelve`, `.sy-term`), 404 (`.nf-shell`), My (`.my-sec`), plan (`.plan-cta`), home (`.step`, `.rules li`, `.join-steps li`), fact sheets (`.glass.deep` ×3), privacy and method (`.short`). Measured at 1440 and 390.
- **Evidence:**

  | Card | Padding | Radius | Border | Fill |
  |---|---|---|---|---|
  | `.pg-goal` | 22 | 6 | `line` | raised |
  | `.lib-card` | 20/20/18 | 6 | `line` | raised |
  | `.fd-card` | 26/28 | 6 | `line` | raised |
  | `.fd-pairs a` | 16/20 | **7** | **`line-2`** | **none** |
  | `.wk-get` | 28 | 6 | `line` | raised |
  | `.sy-win` | 22 | **12** | `line` | raised |
  | `.sy-print` | 22/14/18 | **12** | **9%** | raised |
  | `.plan-cta` | 22/24 | 6 | **35%** | **gradient 8%→2%** |
  | `.my-sec` | 22/24 | 6 | `line` | raised |
  | `.glass.deep` | 28/**29**/32 | 6 | `line` | raised |
  | `.step` | 30/30/32 | 6 | `line` | raised |
  | `.rules li` | 28 | 6 | `line` | raised |
  | `.st-row` | 22 | 6 | `line` | raised |
  | `.sy-term` (terminal block) | 18/20/20 | 12 | 12% | `#07090A` |
  | `.nf-shell` (terminal block) | 16/18 | 10 | 12% | `#07090A` |

  - On phones these keep their desktop padding: `.pg-share` 30/32, `.step` 30, `.fd-card` 26/28, `.wk-get` 28. Others drop to 16–20.
  - Images: `ev/cards-drift@1440.jpg`, `ev/story-prints@1440.jpg`, `ev/story-wins@1440.jpg`, `ev/story-term@1440.jpg`, `ev/notfound-shell@1440.jpg`.
- **Rule broken:**
  - Cards are `surface-raised` with a `line` hairline and `radius-plate` corners.
  - Terminal blocks: `radius-shell`, on `side` (bundle `.mh-shell`: 16px 18px, 12% border).
  - The `pad` token is 24px.
- **Fix:**
  - **Radius:** styles.css:978 and :984 `12px` → `6px`; :948 `14px` → `6px`; :956 `.sy-term{padding:18px 20px 20px;border-radius:12px;background:#07090A}` → `padding:16px 18px;border-radius:10px;background:var(--band)`; :917 `.nf-shell` background → `var(--band)`.
  - **Frames:** styles.css:978 `rgba(238,236,230,.09)` → `var(--line)`. ai/plan.css:156 `.plan-cta`: border `rgba(238,236,230,.35)` → `var(--line)`, and the gradient background → `var(--card)`. pages.css:153: split off `.fd-pairs a{border-color:var(--line);border-radius:6px;background:var(--card)}`.
  - **Padding, content cards: 24px, and 20px at ≤600px.**
    - `.glass.deep`: styles.css:86 to 24px, and :525 to 20px.
    - `.fd-card` (pages.css:121), `.wk-get` (:110) and `.pg-share` (:26).
    - `.step` (styles.css:634), `.rules li` (:320) and `.doc .short` (:381).
    - `.my-sec` (my.css:13) and `.plan-cta`.
  - **Padding, link cards: 20px at all widths.** `.pg-goal` (pages.css:33), `.lib-card` (library.css:93), `.part` (:251), `.st-row` (pages.css:53), `.sy-win` and `.sy-print`.

### COMP-12 · medium · Two full-width bands are styled as cards, doubling the window frame
- **Where:** every full fact sheet's glance band, and the Library's "What moved this week". All widths.
- **Selector:** library.css:376 `.le-glance,.lab-col,.side-card,.lib-moves,.toc,.ev-box,.checked{border:1px solid var(--line);border-radius:6px;background:var(--card)}` applies to:
  - `section.le-glance`: 1134×1268, a full band.
  - `section.wrap.lib-moves`: 1134×63. Its own padding replaces `.wrap`'s 40px gutter.
- **Evidence:**
  - Both are 1134px wide inside a 1136px window. Their hairline runs 1px inside the window's hairline on both sides, with a 6px corner tucked into the window's.
  - The glance band's raised fill sits behind the raised cards inside it (le-bl, le-radar, le-signal, le-facts): a card in a card, so the inner cards lose their contrast with the ground.
  - Images: `ev/sheet-glance@1440.jpg`, `ev/sheet-glance-double-frame-zoom@1440.jpg`, `ev/library-moves-full-width@1440.jpg`.
- **Rule broken:** Plate README: don't nest plates, and don't put a plate inside a card. Hairlines frame windows and cards, not bands.
- **Fix:** after library.css:376 add:
  - `.le-glance{border:0;border-radius:0;background:transparent}`, which returns it to the surface band.
  - `.wrap.lib-moves{width:calc(100% - 80px);max-width:1240px;margin:22px auto 0}` and `@media (max-width:900px){.wrap.lib-moves{width:calc(100% - 40px)}}`, which inset it to the page gutter.

### COMP-13 · medium · Hover states are missing or break the rule
- **Where:** Library, goal pages, compare, fact sheets, story, the side panel on all pages, and Ask Sig. Playwright hover at 1440.
- **Evidence** (rest → hover):
  - **No change at all:** every inline link (COMP-09), the Library filter chips `.lib-chips button`, the Library selects, the foot's `.nf-row input`, and the status page's `.pg-terms summary`.
  - **Frame gets darker:** `.pg-goal:hover` (pages.css:34) and `.part:hover` (library.css:254) go from `line` to `rgba(11,15,17,.32)`, so the frame disappears.
  - **Lift and shadow:** `.lib-card:hover` (library.css:98, then :371) moves up 2px, draws a shadow `0 18px 40px -26px rgba(11,15,17,.45)` and only reaches `line-2`.
  - **Story cards:** `.sy-print` and `.sy-win` go to a 30% border; `.sy-print` also changes fill to `bar`.
  - **Side panel buttons:** `.os-ask` and `.sg-new` (styles.css:767, term.css:441) go to a 45% border with a 6% fill.
  - **Ask Sig "ways in":** `.ai-start` (term.css:171) goes to a 50% border.
  - **Contents rows:** `.toc a:hover` (library.css:260) takes a 10% fill; side-panel rows take 5%.
  - **Icon buttons:** `.os-fold`, `.win-menu`, `.sg-fold`, `.tm-menu` and `.tm-plus` take 8% (which is the "current" value); `.win-tabx` and `.tm-tabx` take 10%.
  - Images: `ev/hover-goal-card-rest-vs-hover@1440.jpg`, `ev/hover-library-card-rest-vs-hover@1440.jpg`, `ev/hover-library-chip-rest-vs-hover@1440.jpg`, `ev/hover-inline-link-rest-vs-hover@1440.jpg`, `ev/hover-toc-row-rest-vs-hover@1440.jpg`, `ev/hover-os-ask-rest-vs-hover@1440.jpg`.
- **Rule broken:** States: "Hover: hairlines brighten to `text`, and rows take a 5% `text` fill." Shape: nothing casts a shadow but what floats.
- **Fix:**
  - **Card frames to `var(--text)`:** pages.css:34, library.css:254 and library.css:371. On `.lib-card:hover`, also set `transform:none;box-shadow:none`, and remove `transform .2s,box-shadow .2s` from library.css:93.
  - **Story cards:** styles.css:979 and :985 `border-color:rgba(238,236,230,.3)` → `var(--text)`, and drop `background:#12171A`.
  - **Side panel and Ask Sig buttons:** styles.css:767 and term.css:441 → `border-color:var(--text);background:transparent`, and remove the 3% base fill at :766 and term.css:440. term.css:171: `.5` → `var(--text)`.
  - **Contents rows:** library.css:260 `.10` → `.05`.
  - **Icon buttons:** styles.css:764, term.css:437 and term.css:112 `.08` → `.05`; styles.css:834 and term.css:108 `.1` → `.05`.
  - **New hovers:** `.lib-chips button:hover,.lib-filters select:hover,.nf-row input:hover{border-color:var(--text)}` in library.css after :369 (and in styles.css for the input).

### COMP-14 · medium · Hairline buttons: six variants for one kind
- **Where:** fact-sheet heads, My, 404, the side panel on all pages, and Ask Sig.
- **Evidence:** every button at 1440. "Kind" is the brand's two kinds, white and hairline.

  | Variant | Where | Height | Padding | Font | Radius | Border | Fill | Should be |
  |---|---|---|---|---|---|---|---|---|
  | `.btn.lime` / `.bone` / `.ink` | page CTAs | 48 | 0 22 | 600 14.5 | 8 | — | #EEECE6 | white ✓ (one per view) |
  | `.btn.*.sm` | Join, sheet heads | 44 | 0 18 | 600 14 | 8 | — | white | white small ✓ |
  | `.btn.line`, `.btn.ghost-ink` | story, compare-pair, founders, goal-weight | 48 / 44 | | | 8 | `line-2` | none | hairline ✓ |
  | `.le-hero .btn.line` (library.css:137) | fact-sheet heads | 44 | | | 8 | `rgba(255,255,255,.3)`, hover words stay #EEECE6 | | hairline: `line-2`, words #FFF on hover |
  | `.my-page .btn.line` (my.css:19–20) | My | 48 | | | 8 | `rgba(255,255,255,.3)` | | hairline: `line-2` |
  | `.btn.glass` | 404 "Ask Sig", "Home" | 48 | | | **6** | `line-2` | | hairline, radius 8 |
  | `.os-ask`, `.sg-new` | side panel, Ask Sig | 40 | 0 12 | 600 13.5 | 8 | `line-2` | 3% | hairline small: no fill, 14px |
  | `.ai-start` | Ask Sig "ways in" | **56** (52–60 on phones) | 12 16 | 500 15 | 7 | `line-2` | 2.4% | hairline 48: `padding:8px 16px`, 600 14.5, radius 8, no fill |
  | `.tm .ai-send` | Ask Sig prompt | **30** (40 on phones) | 0 10 | mono 11.5 | 5 | `line-2`; a white fill once you type | | prompt key, like home's `.hp-go`: 36px, radius 7 |
  | `.mini`, `.ai-toscreen` (CSS only) | Ask Sig answers | 30 | 0 10 | mono 11.5 | 5 | `line-2` | | hairline small: 38px, radius 8 |

  - Icon buttons are correct at 32px with radius 7: `.os-fold`, `.win-menu`, `.sg-fold`, `.tm-menu`. `.tm-plus` (28px, radius 6), `.win-tabx` (20px, radius 5) and `.tm-tabx` (22px, radius 5) should take radius 7.
  - Images: `ev/white-buttons-sheet-semaglutide@1440.jpg` (the head's hairlines are brighter than the side panel's), `ev/notfound-buttons@1440.jpg`, `ev/cards-drift@1440.jpg` (My).
- **Rule broken:** Button README: every other button is a hairline (`line-2` border, `text` words) that brightens to `text` on hover; `.sm` is 38px and the default is 48px; corners are `radius-control`. tokens `button`: 14px on a small button.
- **Fix:**
  - Delete library.css:137–138 and my.css:19–20.
  - styles.css:576: change `.glass,.glass.deep,.glass.smoke{border-radius:6px…}` to `.glass:not(.btn),…`, or add `.btn.glass{border-radius:8px}` after it.
  - styles.css:766 and term.css:440: `background:rgba(238,236,230,.03)` → `transparent`; `font:600 13.5px` → `600 14px`.
  - ai.css:584 `.ai-start{border-radius:7px}` → `8px`, and term.css:170 `background:rgba(238,236,230,.025)` → `transparent`.
  - term.css:206: `height:30px;padding:0 10px;border-radius:5px` → `height:36px;padding:0 12px;border-radius:7px`.
  - term.css:319: `min-height:30px;border-radius:5px` → `min-height:38px;border-radius:8px`.
  - Name the two kinds once (see Systemic).

### COMP-15 · medium · The two prompts are drawn differently, and neither shows a focus ring
- **Where:** the home prompt (`form.hero-search.hp`) and the Ask Sig prompt (`.ai-composer`), at all widths. Also the home prompt's result rows.
- **Evidence:**

  | | Home prompt | Ask Sig prompt |
  |---|---|---|
  | Height | 60px | 56px |
  | Radius | 12 | 8 |
  | Ground | `bar` #12171A | `rgba(0,0,0,.28)` |
  | Type | mono 16/500 | mono 15/500 |
  | Submit key | 36×36, radius 7 | 63×30, radius 5 |

  - Keyboard focus draws no ring on either; only the border brightens, to 55% (styles.css:694 `outline:none`) and 50% (term.css:191). The textarea has `outline:0`.
  - Result rows (`.hp-row:focus-visible`, styles.css:705) get `outline:none` plus an inset 2px left bar. Since the first match is already lit, that bar is the only cue.
  - Images: `ev/prompts-rest-vs-focus@1440.jpg`, `ev/focus-home-prompt-result-row@1440.jpg`.
- **Rule broken:** Prompt README: field on `bar`, `line-2` border (brighter on focus), `radius-window`, words in mono. States: the focus ring.
- **Fix:**
  - **Ask Sig prompt shape:** term.css:190 `border-radius:8px;background:rgba(0,0,0,.28)` → `border-radius:12px;background:var(--tm-bar)`; ai.css:586 `border-radius:10px` → `12px`; term.css:186 `min-height:56px` → `58px`.
  - **Home prompt focus:** styles.css:694 → `.hero-search.hp:focus-within{border-color:var(--text)}`, and add `.hero-search.hp:has(input:focus-visible){outline:2px solid var(--text);outline-offset:3px}`.
  - **Ask Sig prompt focus:** term.css:191 → `.tm .ai-chat.is-empty .ai-composer:has(textarea:focus-visible){border-color:var(--tm-tx);outline:2px solid var(--tm-tx);outline-offset:3px}`. For the docked composer (term.css:187), add `outline:2px solid var(--tm-tx);outline-offset:-2px`.
  - **Result rows:** styles.css:705 → `outline:2px solid var(--text);outline-offset:-2px;box-shadow:none`. They sit inside the clipped list, so the ring goes inside.
  - **Send key:** see COMP-14.

### COMP-16 · medium · Tags and chips: three shapes, tinted fills, two chip fonts and three citation sizes
- **Where:** fact sheets, compare-pair, method, home, status, goal pages and Library.
- **Evidence** (image: `ev/chips-tags-family@1440.jpg`):
  - **Static tags:**
    - `.ev .st .pill`: 25px, radius 5, `line-2`, transparent.
    - `.hc` (Common, Rare…): pills (40px radius), no border, tinted fills `rgba(224,104,92,.14)` with `#FFB4A9` words and `rgba(232,183,90,.14)` with `#F2C46B` words. Neither colour is a token.
    - `.check` ("Fact-checked…"): a pill, 18% white border and 8% white fill.
    - `.method .conf`: 19px pills (20px radius), 600 weight, tinted.
    - Home `.chips span`: 29px, padding 8/12, 0.1em tracking.
    - `.vs-status`: 30px, 11px.
  - **Interactive chips:**
    - `.lib-chips button` and `.hero-try a`: Mona Sans 13.5/13px, 44px.
    - `.pg-goals a` and `.pg-jump a`: mono 11.5px capitals at 0.1/0.08em, 38px.
    - The pressed chip ("All 300") is filled white and reads as a main button.
  - **Citation numbers, three different:**
    - `.ref`: 18px, radius 5, fill `rgba(11,15,17,.08)` (invisible); it turns white on hover.
    - `.mh-bm-src`: 24px, radius 6.
    - `.sources li::before`: 26×22, radius 6, fill ink 8%.
  - **Dots and bars:** dots are 6px (status, data, agents) and 7px (live, tab); fine, except the story's status sample uses 7px dots at 12.5px type in a 34px bar. Bars are 6px (`.vs-bar`, `.sig-scale`, `.bar`), 8px (`.hc-track`, `.calib-bar`), 10px (`.split`) and 12px (`.fd-bar`). `.fd-bar` and `.calib-bar` tracks are ink at 8–10%, so invisible on graphite.
- **Rule broken:**
  - `radius-control` for chips; no pills.
  - Colour is a signature, never decoration: `down` for a worse outcome, `amber` for a mixed read.
  - Current takes an 8% fill.
- **Fix:**
  - **Tag:** library.css:361: `border-radius:5px` → `8px`, and add `.hc,.hc-common,.hc-uncommon,.hc-rare,.hc-theoretical,.hc-unknown,.check` to that selector. Then add:
    - `.hc-common{border-color:rgba(255,154,142,.45);color:#FF9A8E}`
    - `.hc-uncommon{border-color:rgba(232,183,90,.55);color:var(--amber)}`
    - `.hc-rare,.hc-theoretical,.hc-unknown,.check{color:var(--text-2)}`
  - **Method confidence tags:** styles.css:552–555 `.method .conf` → `padding:5px 10px;border:1px solid var(--line-2);border-radius:8px;background:transparent;font:500 10.5px/1.2 var(--mono);letter-spacing:.08em`. Keep the words' colour: evidence blue for good, amber for fair, `#FF9A8E` for weak.
  - **Home chips and status tag:** styles.css:645 and :264 `.chips span` → `padding:5px 10px;letter-spacing:.08em`. styles.css:651 and :279 `.vs-status` → `padding:5px 10px;font-size:10.5px;line-height:1.2`.
  - **Chip:** pages.css:153 `.pg-goals a,.pg-jump a` → `min-height:44px;border-radius:8px;font:500 13.5px/1 var(--body);letter-spacing:0;text-transform:none`. library.css:366 and styles.css:615 → `border-radius:8px`.
  - **Pressed chip:** library.css:367–368 → `background:rgba(238,236,230,.08);border-color:var(--text);color:var(--text)`, with the count span `color:var(--muted);opacity:1`.
  - **Citation:** library.css:30–31 `.ref` → `min-width:24px;height:24px;border-radius:6px;background:rgba(238,236,230,.14);font:600 11px/1 var(--mono);color:var(--text-2)`, and on hover `background:rgba(238,236,230,.22);color:var(--text)`. This matches the kit's `.mh-bm-src` once COMP-02 is fixed. library.css:243 `.sources li::before` → `width:24px;height:24px;background:rgba(238,236,230,.14)`.
  - **Bar tracks:** pages.css:117 and :143 → `background:rgba(238,236,230,.12)`.

### COMP-17 · medium · Fields: three heights, four radii and two grounds
- **Where:** the foot sign-up (19 pages), the weekly pages, and the Library search and filters. All widths.
- **Evidence** (images: `ev/library-tools-fields-chips@1440.jpg`, `ev/form-signup-issue-vs-weekly@1440.jpg`):

  | Field | Height | Radius | Border | Ground | Type | Placeholder |
  |---|---|---|---|---|---|---|
  | `.nf-row input` | 48 | 8 | `line-2` | `rgba(238,236,230,.04)` | Mona Sans 16/400 | `muted` ✓ |
  | `.lib-search input` | **58** | **10** | `line-2` | 4% | 16.5/500 | browser default **#757575** |
  | `.lib-filters select` | 44 | **7** | `line-2` | transparent | 14/500 | — |

  - `.lib-search input` also carries a drop shadow (`0 12px 30px -18px`, library.css:80).
  - Focus rings are correct on all three (2px, offset 2–3px).
- **Rule broken:**
  - `surface-raised` is the ground of fields.
  - `radius-control` for fields.
  - Nothing casts a shadow but what floats.
- **Fix:**
  - **Foot and weekly fields:** styles.css:682 and :684 `background:rgba(238,236,230,.04)` → `background:var(--card)`.
  - **Library search:** library.css:364 → `height:48px;padding:0 16px 0 44px;border-radius:8px;background:var(--card);box-shadow:none;font:400 16px var(--body)`. Set library.css:79 `left:20px` → `left:16px`, and add `.lib-search input::placeholder{color:var(--muted);opacity:1}`.
  - **Library selects:** library.css:369 `border-radius:7px;…;background-color:transparent` → `border-radius:8px;background-color:var(--card)`.

### COMP-18 · medium · Five table-like components with four header styles
- **Where:** method (two real `<table>`s), compare-pair (`.cmp` grid), fact sheets (`.vs.le-bl`, `.le-facts`), home (`.vs`). The status tracker is drawn as cards (`.st-row`, COMP-11), not a table.
- **Evidence** (images: `ev/table-method-1@1440.jpg`, `ev/table-method-2@1440.jpg`, `ev/table-compare-pair@1440.jpg`, `ev/table-home-vs@1440.jpg`, `ev/sheet-glance@1440.jpg`, `ev/table-status@1440.jpg`):
  - **Method "weights" table** (build_library.mjs:1157): no frame at all, while the "improved anyway" table on the same page (:1202) has one with radius 14 (styles.css:541). Headers: mono 600 11px capitals, 0.1em, on a 5% fill. Cells padded 11/14px.
  - **Home and bottom-line `.vs-cols`** (styles.css:289): headers mono 500 10.5px capitals, 0.12em, no fill, padding 14/40.
  - **Compare grid:** row labels `.cmp-k` (pages.css:73) are mono 12px capitals, 0.12em. Column heads `.cmp-name` (pages.css:70) are in `text-2`, dimmer than the cells. The header row's fill is `band`, darker than the window. Rows are 22/0 with a 28px gap.
  - **Facts list `.le-facts dt`** (library.css:150): 10.5px capitals, 0.1em.
  - **Numbers:** the weights table's "1", "× 1.25", "× 1.1" are set in the body face, not `data`. `.num` values are mono 15/600 and left-aligned. They line up only because every value has the same digit count.
- **Rule broken:** TopTable: frame `line`, `radius-plate`, `surface-raised`; header cells mono 13px 400, `muted`, lowercase, on `bar`; cells 9px 12px (`cell` token; 10px on narrow screens); hairline rows; `data` with tabular figures; numbers right-aligned.
- **Fix** (one table style):
  - **Method:** wrap the first table: build_library.mjs:1157 `<table class="mtable">…</table>` → `<div class="mtable-wrap"><table class="mtable">…</table></div>`. Then:
    - styles.css:543 `.method .mtable-wrap .mtable{…min-width:720px}` → `.method .mtable-wrap .baselines{min-width:720px}`.
    - :541 `border-radius:14px` → `6px`.
    - :544 `padding:11px 14px` → `9px 12px`.
    - :545 `font:600 11px/1.3 var(--mono);letter-spacing:.1em;text-transform:uppercase;…background:rgba(238,236,230,.05)` → `font:400 13px/1.4 var(--mono);letter-spacing:0;text-transform:none;background:var(--raised)`.
    - :548 `.num` → `font:500 13px/1.4 var(--mono);font-variant-numeric:tabular-nums`.
  - **Header labels:** apply the same header style to `.vs-cols` (styles.css:289, adding `background:var(--raised)`), `.cmp-k` (pages.css:73) and `.le-facts dt` (library.css:150). Coordinate the case change with the type lead.
  - **Compare grid:** pages.css:70 `.cmp-name` add `color:var(--text)`; pages.css:156 `.cmp-names{background:var(--band)}` → `var(--raised)`.

### COMP-19 · low · "Current" and "pressed" are drawn five ways
- **Where:** the side panel and its tree (all pages), Ask Sig's panel, the Library chips and Ask Sig's rail tabs.
- **Evidence:** computed styles of the `aria-current`, `aria-pressed` and selected items:
  - `.os-places a`: 8% ✓.
  - `.sg-site a`: 6% (term.css:476).
  - `.sg-item.on`: 9% (term.css:448).
  - `.os-more a` current (e.g. "How the numbers are made" on /method/): no fill, words only (styles.css:783).
  - `.lt-files a` current: `#12171A` fill with an inset 2px white bar (styles.css:808).
  - `.lib-chips` pressed: white fill (COMP-16).
  - `.tm-tabbtn` selected: a 2px underline (term.css:339).
  - Image: `ev/white-buttons-sheet-semaglutide@1440.jpg` (tree item).
- **Rule broken:** States: "Current: the current place, row or tab takes an 8% `text` fill and `aria-current`."
- **Fix:**
  - term.css:476: `.06` → `.08`.
  - term.css:448: `.09` → `.08`.
  - styles.css:783: add `background:rgba(238,236,230,.08)`.
  - styles.css:808 → `background:rgba(238,236,230,.08);box-shadow:none`.
  - Library chips: COMP-16.

### COMP-20 · low · Button groups on phones come in three layouts
- **Where:** the 404, story, My and fact-sheet heads @390.
- **Evidence:** from the data at 390:
  - 404 `.cta`: "Open the Library" 201px and "Ask Sig" 137px on one row, then "Home" 350px alone (styles.css:516 `flex:1 1 auto`).
  - story, My and `.le-actions`: stacked at their natural widths (174, 163, 209, 221px…).
  - `.pg-acts`: full width, 350px each (pages.css:146).
  - Image: `shots/notfound@390.jpg`.
- **Rule broken:** one component, one behaviour.
- **Fix:** styles.css:516 `.cta .btn{flex:1 1 auto}` → `flex:1 1 100%`. Add `@media (max-width:600px){.sy-acts .btn,.my-actions .btn,.le-actions .btn{width:100%}}`, the same as `.pg-acts`.

### COMP-21 · low · The weekly issue's sign-up takes the article's type
- **Where:** /weekly/1/, all widths.
- **Selectors:** `.doc p{font-size:16.5px;line-height:1.7}` (styles.css:373) and `.rules a,…,.doc a{…}` (styles.css:665) reach into `.wk-get .news-form`.
- **Evidence:** on the weekly issue, `p.nf-note` is 16.5px/28px and its link is weight 600. Everywhere else they are 13px/19.5px and 400. Image: `ev/form-signup-issue-vs-weekly@1440.jpg`.
- **Rule broken:** one sign-up component.
- **Fix:** add to pages.css: `.doc .news-form .nf-note{margin-top:10px;font-size:13px;line-height:1.5}` and `.doc .news-form .nf-note a{font-weight:400}`. These are (0,3,0) and (0,3,1), so they beat `.doc p` and `.doc a`.

### COMP-22 · low · The skip link is a pill in mono capitals
- **Where:** every page, on the first Tab.
- **Selector:** styles.css:60 `.skip{padding:10px 16px;border-radius:40px;…font:500 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase}`.
- **Evidence:** a 161×32 white pill with radius 40. Image: `ev/focus-skip-pill@1440.jpg`.
- **Rule broken:** "No pills"; buttons are sentence case in `button` type.
- **Fix:** styles.css:60 → `display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:8px;font:600 14px/1 var(--body);letter-spacing:0;text-transform:none`.

### COMP-23 · low · Disabled controls use four opacities
- **Where:** Ask Sig, all widths.
- **Evidence:** computed values:
  - `.sg-wipe:disabled`: 0.45 (term.css:483).
  - `.tm .ai-send:disabled`: 0.75 at 1440 (term.css:213), and 1 with a 10% fill on phones (term.css:219).
  - `.tm-plus:disabled`: 0.35 (term.css:113).
  - `.btn-answers` and `.pask-opt`: 0.5 ✓.
- **Rule broken:** States: "controls drop to half opacity and keep their words".
- **Fix:** term.css:483, :113, :213 and :219 → `opacity:.5`. On phones (term.css:219), also `background:transparent`.

### COMP-24 · low · Interface icons are heavier than the brand's, several are under 16px, and there are two close icons
- **Where:** the side panel (all pages), the home hero card, Ask Sig, and the window tabs.
- **Evidence:** every inline SVG measured on all 22 pages at 1440 (image: `ev/icons-weights-and-close@1440.jpg`):
  - **Stroke weight:**
    - The interface icons (fold and menu: build_library.mjs:157–158 and the hand-written pages; sg-new, sg-wipe, `.start-ico`, the `.hc-foot` refresh; ai.js:67–92) are drawn on a 16-unit grid with stroke 1.6, which renders at 1.6px.
    - The brand's set (1.8 on a 24 grid) renders at 1.2px at 16px.
    - So the fold chevron is heavier than the 1.07px place glyphs beside it.
  - **Sizes:** `.hc-foot svg` 14px; `.tm-plus` 14px (build_library.mjs:818); `.sg-del svg` 14px; `.tm-tabx svg` 11px; ai.js icons 13–15px.
  - **Close icons:** the window tab closes with a "×" text glyph in mono 14px; Ask Sig's tab closes with an 11px SVG.
- **Rule broken:** Iconography: interface icons are a 1.8 stroke on a 24 grid, round caps, drawn at 16–20px in `currentColor`.
- **Fix:**
  - On the 16-grid icons, set `stroke-width="1.6"` → `1.2` (the same weight as 1.8 on 24).
  - Draw them at a minimum of 16px: `width/height` 14 → 16 in index.html (`.hc-foot`) and build_library.mjs:818; term.css:458 `.sg-del svg` → 16px; ai.js 13/15 → 16.
  - Use the "×" glyph for both tab closes (term.css:106 SVG → the `.win-tabx` text glyph), so the site and Ask Sig match.

### COMP-25 · low · Ask Sig's tabs and bars are a different size from the site's
- **Where:** /sig/ at 1440, 1024 and 768.
- **Evidence:** from the data:

  | Part | Ask Sig | Rest of the site |
  |---|---|---|
  | Title bar | 42px (`--tm-tb:42px`, term.css:22) | 44px |
  | Tab | 31px (term.css:95) | 32px |
  | Status bar type | mono 600 11px (term.css:120) | mono 500 11.5px |
  | Pane tabs `.tm-tabbtn` | mono 600 10.5px capitals, 0.08em (term.css:337) | window tabs: mono 500 12px, lowercase |

  Image: `shots/asksig@1440.jpg`.
- **Rule broken:** tokens `title-bar` 44px and `tab` 32px; type `status` (11.5px, and 12px for tabs).
- **Fix:** term.css:22 `--tm-tb:42px` → `44px`; :95 `height:31px` → `32px`; :120 `font:600 11px/1 var(--mono)` → `font:500 11.5px/1 var(--mono)`; :337 → `font:500 12px/1 var(--mono);letter-spacing:0;text-transform:none`. Coordinate with the window lead.

### COMP-26 · low · Plate ticks: only on the home graph, and off the spec
- **Where:** home @1440 and 1024.
- **Evidence:**
  - The home graph plate (`figure.net`) has ticks: `.net-corner` spans, 10px, 1px, `#868C8A`, 8px inside its frame (styles.css:145–148, 604–607).
  - The bundle draws them 9px inside, in `rgba(238,236,230,.46)`.
  - The home hero card (`.hero-card`, 340×268), which the Plate README names as a plate, has no ticks. It floats over the graph plate with no shadow.
  - Image: `ev/home-hero@1440.jpg`.
- **Rule broken:** Shape and depth: a plate carries a 10px tick in each corner. Plate README: use it for the hero card on Home.
- **Fix:**
  - styles.css:604: `border-color:var(--on-ink-3)` → `rgba(238,236,230,.46)`.
  - styles.css:145–148: `8px` → `9px`.
  - Give `.hero-card` (styles.css:618) the bundle's tick background: the eight `linear-gradient(var(--tk),var(--tk))` layers from bundle.css:25–30 over `rgba(14,19,22,.94)`.

---

## Systemic

1. **Two button kinds, one name each.**
   - Today the white main action is spelled `.btn.lime`, `.btn.bone` and `.btn.ink`, and the hairline is `.btn.line`, `.btn.ghost-ink` and `.btn.glass`, each with local overrides (COMP-14).
   - Standardise on the bundle's model: `.btn` is the hairline (`line-2`, `text`, transparent, 48px, `0 22px`, 600 14.5px, radius 8), and `.btn.main` is the white one. `.sm` is 44px, `0 18px`, 14px.
   - Only one `.main` may be in view, so never in the side panel or the foot (COMP-01).
2. **Radii come from tokens, not numbers.**
   - 6, 7, 8, 10 and 12 should exist as custom properties in `:root` (styles.css:22). Every `border-radius` should use one of them, or 50% for dots.
   - Cards, plates and tables use 6; side-panel rows and icon buttons 7; buttons, fields, tags and chips 8; terminal blocks 10; the window and the prompt 12.
   - Nothing should be 4, 5, 14, 16, 20, 22 or 40 (COMP-04).
3. **One state model, written once.**
   - Focus: `outline:2px solid var(--text);outline-offset:3px`, and 2px on fields. Inside, at −2px, only where a strip clips it (tab strips, prompt rows).
   - Hover: hairline to `text`; row fill 5%; current 8%; disabled 0.5.
   - Today there are 7 ring offsets, 5 hover fills (5/6/8/10% and a lift) and 4 disabled opacities (COMP-07, 13, 19, 23).
4. **Cards: one frame, two paddings.**
   - Frame: `1px solid var(--line)`, `radius-plate`, `surface-raised`; on hover, the frame goes to `text`, with no lift or shadow.
   - Padding: 24px for content cards (the `pad` token), 20px for link cards, and 20px for both on phones.
   - Terminal blocks use the bundle's shell: 16px 18px, radius 10, `side`.
   - Bands are never cards (COMP-11, 12).
5. **One tag, one chip, one citation.**
   - Tag: 25px, mono 500 10.5px capitals at 0.08em, `line-2`, radius 8. Signature colour only where it carries meaning: `evidence`, `amber`, `down`.
   - Chip: 44px, Mona Sans 500 13.5px, `line-2`, radius 8; pressed or current takes 8%.
   - Citation: 24px, mono 600 11px, 14% fill, radius 6 (COMP-16).
6. **One inline link.** 600, `text`, a 1px underline at 50%, offset 3px. Links in small print inherit colour and weight. On hover, the underline goes to `currentColor` (COMP-09).
7. **Fields and prompts.**
   - Fields: 48px (44 in filter rows), radius 8, `line-2`, `surface-raised`, 16px text, `muted` placeholder.
   - The two prompts follow the Prompt component: `bar` ground, radius 12, mono, 58px, with a 36px radius-7 key (COMP-15, 17).
8. **Clear out the light-theme leftovers.**
   - Several rules still put ink on graphite. Each one is invisible or reads backwards:
     - `color:var(--ink)` on links (library.css:218).
     - Ink hover frames (pages.css:34 and :128, library.css:98 and :254).
     - Ink-tinted fills (library.css:30 and :243, pages.css:117 and :143).
     - A dashed ink frame (library.css:249).
     - `.btn.ghost-ink` (pages.css:10).
   - A grep for `rgba(11,15,17` and `var(--ink)` in the colour, border and background properties of library.css and pages.css finds them all. The Plate section patched some of these but not all.
9. **For the art director (outside the brief's checks):** the brand calls a page's head a plate. On the site, page heads (`.doc-head`, `.le-hero`, `.lib-hero`) are open bands with a bottom hairline, not plates. If they should be plates, the bundle's `.mh-plate` (24px 30px 26px padding, `line`, radius 6, raised, ticks) is the spec.
