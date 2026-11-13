# Components and states: audit report

**State of the area:** the website mostly keeps one tag, one card frame and one focus ring, but the community app is still on the November 11 Plate components (6px corners, mono-capital tags, soft focus halos, a blue button in its own frame), and across the two apps every control, link, table and hover comes in two to four versions.

Everything was measured from the capture (`.design/data`, the 23 website templates and the 16 community screens, re-captured at 10:49–10:52 in their loaded state, at 1440, 1024, 768 and 390) and with Playwright on the live servers. Evidence images are in `.design/evidence/design-components/`. The scripts and raw results are in `.design/evidence/design-components/scripts/`, so every number can be re-run. Line numbers are as on `design-audit` now. "Community" means `/home/claude/miracle-health-community/web/styles.css` unless another file is named.

## Read first: where this brief and the book disagree

The checklist for this audit repeats the November 11 rules. On November 12 the decision log replaced several of them, and the build has moved again since. Each fix below says which rule it follows:

| Topic | This brief | Book and decision log | Built | This report standardises on |
|---|---|---|---|---|
| Cards, plates, tables | 6px | 12px ("replaces radius-plate 6px", Nov 12 call 4) | website 12, community 6 | **12**: the community moves |
| Rows | 7px | `radius-row` 9px | both apps' side panels 7 (since e4ec420, before the Nov 12 call); website `.pg-jump a` 9 | **7**: the book is corrected |
| Buttons, fields, chips, tab tops | 8px | `radius-control` 10px for buttons and fields | website buttons 8 (small 7) since d172bd8 "Page 15's look", fields 10; community 8 | **8** for every control: the book is corrected |
| Terminal blocks | 10px | inside `radius-control` | 10 | **10**, as its own token |
| Read strip | 9px | no token | community 9 | **9** |
| Window | 12px | 12px | community 12; Ask Sig's window square (Nov 13) | 12, and square on Ask Sig |
| Kinds of button | white main action and hairline | electric blue main (one per view), white second choice, hairline (Nov 12, "Black and electric blue") | three kinds | **three kinds** |
| Button size | 48 default, 38–44 small | the book gives no size | website 42/36, community 44/38 | **48 / 40**: the brief's numbers, since the book is silent |
| Plates | carry corner ticks | the book no longer mentions ticks; page heads are open bands (Nov 11 call 11) | website: no plates; community: its two page-head plates (`.feed-hero`, `.hero`) have ticks | no finding; the book should say whether the community's ticked plates stay |
| Row hover | 5% fill | the `hover` ground #1C1C20 (Nov 12 call 9) | both | **`hover`** |

If the 6px cards in this brief are wanted, that needs a new decision, and then the website's 2,334 cards at 12px move, not the community's.

## Findings

### COMP-01 · high · The community is on a different corner scale

**Where:** every community screen (15 screens and sign-in), all four widths.

**Selectors:** web/styles.css:30 `--r:6px;--r-sm:6px;--pill:6px`, used by 38 rules (`var(--r)`) and 13 rules (`var(--pill)`), plus literal 5px on `.chip` (:223) and `.logo .tag` (:109).

**Evidence:**
- Community: 6px on 3,313 elements, including:
  - cards `section.card` (×160);
  - the space cards on Explore `a.card.space-card` (×1,200);
  - the plates `.feed-hero` and `.hero`;
  - menus, the sort tabs, post actions and the vote frame.
- Community: 5px on 86 elements (tags, the COMMUNITY tag).
- Website, same components: cards 12 (×2,334), front page panes 14, tags 7.
- Images: `cards-web-vs-comm@1440.png` (`a.lib-card` 12 and `a.fp-way` 14 beside community `section.card` 6) and `tags-web-vs-comm@1440.png`.

**Rule:** tokens `radius-card` 12 ("Cards, plates and tables"), `radius-tag` 7; decision Nov 12 call 4. The decision log's "Next" says the community takes the Sig system's corners.

**Fix (community styles.css):**
- :30: `--r:6px;--r-sm:6px;--pill:6px` → `--r:12px;--r-sm:7px;--pill:8px`.
- Rows that use `var(--r)` take `var(--r-sm)` (7, as the side panel's rows):
  - :116 `.search-pop a`;
  - :286 `.pop button`;
  - :290 `.menu button,.menu a`;
  - :458 `.lb-row`;
  - :494 `.notif`;
  - :646 `.cpick-opt`.
- Tags take 7px:
  - :223 `.chip` 5px → `var(--r-sm)`;
  - :109 `.logo .tag` 5px → `var(--r-sm)`;
  - :282 `.stk-count` `var(--pill)` → `var(--r-sm)`.
- Controls take 8px:
  - :106 `.burger` `var(--r)` → `var(--pill)`;
  - :188 `.nav-sec button` 6px → `var(--pill)`;
  - :311 `.cm-toggle` 6px → `var(--pill)`.
- :559 `dialog.modal` 8px → `var(--r)` (a floating panel, like a card).
- Small tiles and keys that use `var(--r)` would round too far at 12px:
  - :473 `.bdg .seal` and :497 `.notif .ico` (36–40px tiles) → `var(--r-sm)`;
  - :825 `.tabbar a.make span.ic-wrap` and :860 `.fix .input.xs` → `var(--pill)`.
- Every other `var(--r)` is a card, plate or floating panel and takes 12.
- The shared kit: kit/kit.css:41 `.mh-chip`, :86 `.mh-bm-ln` and :91 `.mh-bm-src` 6px → 7px. Change these in the kit's source and sync, which fixes both apps.

### COMP-02 · high · The website's controls have three radii, side by side

**Where:**
- the top bar on every page, at all widths;
- the foot sign-up on 19 pages;
- the Library's toolbar;
- Ask Sig's side panel and typing bar.

**Selectors and values:**
- Top bar: `.os-fold,.os-menu` 7px (styles.css:555), `.os-search` 8px (:611), `.os-top-sig` 8px (:617), Join `.btn.sm` 7px (:431).
- Foot: `.nf-row input` 10px (:493) beside `.nf-row .btn` 8px (:430).
- Library: `.lib-search input` 10px (library.css:60), `.lib-chips button` 9px (:339), `.lib-filters select` 10px (:344).
- `.pg-jump a` 9px (pages.css:43).
- Ask Sig: `.sg-new` 10px (ai/term.css:448), `.tm .ai-send` 7px (:205), 10px on a phone (:214); ai.css:585 `.ai-send` 10px.
- The kit's `.mh-bm-retry` 10px (styles.css:428).

**Evidence:**
- `foot-field10-vs-button8@1440.jpg`: the field's corners are visibly rounder than the button's beside it.
- `lib-search-chips-selects@1440.jpg`: three controls, three radii.
- `topbar-heights@1440.jpg`.

**Rule:** one `radius-control` for buttons and fields (tokens, BRAND *Shape and depth*). The book says 10. Page 15's look set `.btn` 10→8 and `.btn.sm` 9→7 on purpose (d172bd8) and left the fields at 10. The community's buttons and fields are all 8, and the brief's list says 8. styles.css:424 still says "controls 10px".

**Fix:** every control at 8px.
- styles.css: :431 `border-radius:7px` → `8px`; :555 `7px` → `8px`; :493 `10px` → `8px`; :428 `.mh-bm-retry{border-radius:10px}` → `8px`; the comment at :424 "controls 10px" → "controls 8px".
- library.css: :60 `10px` → `8px`; :339 `9px` → `8px`; :344 `10px` → `8px`.
- pages.css: :43 `9px` → `8px`.
- ai/term.css: :448 `10px` → `8px`; :205 `7px` → `8px`; :214 `10px` → `8px`.
- ai/ai.css: :585 `10px` → `8px`.
- In the book (see COMP-22): tokens.json `radius-control` 10px → 8px ("Buttons, fields and filter chips"), and a new `radius-shell` 10px ("terminal blocks: a run log, the 404 shell"), so that `.nf-shell` and `.sy-term` keep 10.

### COMP-03 · high · Community fields have no focus ring, or a soft halo instead

**Where:**
- the top-bar search on every community screen (1440, 1024);
- `.input` fields on New, Explore, Account and sign-in (all widths);
- the compound picker on New and Stack.

**Selectors:**
- :111 `.search input{…outline:none…}`, and on focus :113 `border-color:rgba(255,255,255,.45);background:rgba(255,255,255,.06)` only.
- :508 `.input{…outline:none…}` with :509 `.input:focus{border-color:var(--text);box-shadow:0 0 0 3px rgba(255,255,255,.12)}`.
- :636 `.cpick-box:focus-within{…box-shadow:0 0 0 3px rgba(255,255,255,.12)}`.

**Evidence:**
- Measured on keyboard focus: the search has outline `none`, border .12 → .45 and no ring. `.input` has a 3px halo of 12% white on black, about 1.3:1.
- Images: `states-prompts-focus.png` (bottom row), `states-topbar-web-vs-comm.png` (the website's search draws the ring; the community's doesn't).

**Rule:** BRAND *States and focus*: "every focusable thing gets a solid 2px text ring, 2–3px out. It contrasts at 15:1 or more."

**Fix (community styles.css):**
- :111: delete `outline:none`, and add `.search input:focus-visible{outline:2px solid var(--text);outline-offset:2px}`.
- :508: delete `outline:none`.
- :509 → `.input:focus{border-color:var(--text)}.input:focus-visible{outline:2px solid var(--text);outline-offset:2px}`.
- :636 → `.cpick-box:focus-within{border-color:var(--text)}.cpick-box:has(:focus-visible){outline:2px solid var(--text);outline-offset:2px}`.

### COMP-04 · high · The community shows two electric blue main actions at once

**Where:**
- every community screen at 768 and 390: "Create" in the top bar and the blue key in the middle of the tab bar;
- Account at every width, with "Text me when a check-in is due";
- New at every width, with "Post" (the top bar is sticky, so "Create" stays in view).

**Selectors:** ui/shell.js:107 `h('a', { class: 'btn lime sm create' …})`; styles.css:825 `.tabbar a.make span.ic-wrap{…background:var(--act);color:var(--on-accent)}`.

**Evidence:**
- Counted per viewport from the capture: 2 blue actions on all 15 screens at 390, and 3 on comm-account@390.
- Images: `comm-home@390-two-blue-actions.jpg`, `comm-account@1440-two-blue-actions.jpg`.

**Rule:**
- tokens `accent`: "The one main action per view … Never two on a screen".
- BRAND *Colour*: one main action per view.
- The website's frame carries no blue: its Join is white.

**Fix:** the frame carries no blue, as on the website; the page's own main action stays the one blue.
- shell.js:107 `'btn lime sm create'` → `'btn ink sm create'`.
- styles.css:825 `background:var(--act);color:var(--on-accent)` → `background:var(--bone);color:var(--on-bone)`.

### COMP-05 · high · Inline links have four treatments, and some have no hover

**Where:**
- every website page;
- the community's post and space screens.

**Evidence** (Playwright, rest → hover, `states-links.png`):

| Where | Rule | Words | Underline | Hover |
|---|---|---|---|---|
| Doc pages, sheets, compare, goals, weekly, privacy (about 14 rules: pages.css:8, :22; styles.css:480; library.css:129, :193, :195, :211, :220, :223 …) | `.doc a`, `.pg-foot a`, `.checked a` … | `text`, 600 | 1px, 50% white | solid (styles.css:792) |
| Small print (`.nf-note a` styles.css:303, `.ai-fine a` ai.css:390, `.st-when a` pages.css:58) | | `text-2`, 400 | 1px, 50% white | turns `text-2` |
| Print caption on every sheet (`.le-print figcaption a` library.css:381) | | `text-2`, 400 | 1px, 50% white | **none**: the rule outranks styles.css:792 |
| Front page: `.sx-howto` (home.css:71) and "How each score is worked out" | | `text`, 500/400 | auto, 100%, offset 4px | **none** visible (colour to #FFF only) |
| Ask Sig: "Add yours" (`.ai-crowd a` ai.css:473) | | `text`, 400 | auto, 100% | **none** |
| Ask Sig answers (`.prose a` ai.css:165) | | `text`, 600 | 2px, 60% white | solid |
| Community posts (`a` community styles.css:44) | | inherited `text-2`, 400 | auto, 35% `currentColor` | **none** |

**Rule:** one inline link everywhere (this brief), and hover changes something you can see (BRAND *States*).

**Fix:**
- Website: one shared rule in styles.css after :58:
  - `.ln,:where(main,.foot) :where(p,li,dd,figcaption,small) a:not([class]){color:var(--text);font-weight:600;text-decoration:underline 1px rgba(255,255,255,.5);text-underline-offset:3px}`
  - `.ln:hover,:where(main,.foot) :where(p,li,dd,figcaption,small) a:not([class]):hover{text-decoration-color:currentColor}`
  - small print keeps its grey: `.nf-note a,.ai-fine a,.st-when a,.le-print figcaption a{color:var(--text-2);font-weight:400}` with the same underline and hover.
- Then delete the per-context copies listed above, and set:
  - home.css:71 `.sx-howto` `text-underline-offset:4px` → the shared rule (add class `ln`);
  - ai.css:473 `.ai-crowd a{…text-decoration:underline…}` → class `ln`;
  - ai.css:165 `.prose a` `rgba(255,255,255,.6)` / `2px` → `.5` / `1px`;
  - add `.le-print figcaption a:hover{text-decoration-color:currentColor}` (library.css:381).
- Community styles.css:44:
  - `a{…text-decoration-color:color-mix(in srgb,currentColor 35%,transparent)…}` → `a{color:inherit;text-decoration-thickness:1px;text-decoration-color:rgba(255,255,255,.5);text-underline-offset:3px}a:hover{text-decoration-color:currentColor}`;
  - plus `main :where(p,li) a:not([class]){color:var(--text);font-weight:600}`.

### COMP-06 · medium · The top bars: four controls, four heights, two radii

**Where:** every page of both apps, all widths.

**Evidence (height / radius):**
- Website at 1440: menu 32/7, search 40/8, Ask Sig 40/8, Join 36/7.
- Website at 390: 40/7, 40/8, 40/8, 36/7.
- Community at 1440: search 34/8, Create 38/8, bell 40/8, points chip 40/8.
- Community at 390: menu 36/6, Create 38/8, bell 40/8, points 38/8.
- Images: `states-topbar-web-vs-comm.png`, `topbar-heights@1440.jpg`, `topbar-web@390.jpg`.

**Rule:** one control height and one control radius per bar (this brief's 38–44 small size; COMP-02).

**Fix:** all top-bar controls 40px and 8px.
- Website:
  - styles.css:555 `.os-fold,.os-menu{width:32px;height:32px;…border-radius:7px}` → `width:40px;height:40px;…border-radius:8px` (then :626 is redundant);
  - Join through `.btn.sm` at 40 (COMP-07).
- Community:
  - :111 `.search input{height:34px…}` → `height:40px`;
  - :106 `.burger` → `width:40px;height:40px;border-radius:var(--pill)`;
  - :122 `.me-chip` add `min-height:40px`;
  - Create through `.btn.sm` at 40.

### COMP-07 · medium · Buttons come in ten heights and five type sizes

**Where:** every page of both apps.

**Selectors and values:**
- Website:
  - `.btn` 42 (styles.css:430), `.btn.sm` 36 (:431);
  - the front page's main action 50px at 15.5px (`.sx-acts .btn`, home.css:70);
  - "Look it up" 48 at 15px, 52 on a phone (`.sx-go`, home.css:41, :574);
  - the foot's "Get it weekly" 48 beside its field, but 42 at 390 under a 48px field;
  - Ask Sig: "New chat" 40 (term.css:448), send key 36 (:205), ways to start 48, and 52–60 on a phone (ai.css:42, :490).
- Community:
  - `.btn` 44 at 14px (:898), `.btn.sm` 38 at 13px (:905);
  - sign-in 56 (`.auth-form .btn.block`, :550).

**Evidence:** button inventory (`scripts/buttons.py`): heights 36, 38, 40, 42, 44, 48, 50, 52, 56, 60; type 13, 14, 14.5, 15, 15.5.

**Rule:**
- this brief: 48px default, 38–44px small;
- tokens `button`: 14.5px (14px on a small button);
- BRAND has no size: see COMP-22.

**Fix:**
- styles.css:
  - :430 `min-height:42px` → `48px`;
  - :431 `min-height:36px` → `40px`;
  - :432 `@media (pointer:coarse){.btn{min-height:44px}.btn.sm{min-height:40px}}` → `@media (pointer:coarse){.btn.sm{min-height:44px}}`.
- home.css:
  - :70: delete `.sx-acts .btn{min-height:50px;padding:0 24px;font-size:15.5px}`;
  - :41 `.sx-go{…min-height:48px;padding:0 22px;font-size:15px}` → `.sx-go{flex:none}`;
  - :574 `min-height:52px` → `48px`.
- ai/term.css:205 `height:36px` → `40px`; ai/ai.css:490 `min-height:52px` → `48px`.
- Community:
  - :898 `min-height:44px;…font:600 14px/1` → `min-height:48px;…font:600 14.5px/1`;
  - :905 `.btn.sm{min-height:38px;…font-size:13px}` → `min-height:40px;…font-size:14px`;
  - :550 and :547 `min-height:56px` → `48px`.

### COMP-08 · medium · On hover, hairlines stop short of `text`

**Where:**
- the front page's three ways in;
- the top-bar search on every website page;
- the community's "Start here" rows and composer;
- the community's top-bar search.

**Selectors and values (rest → hover):**
- `.fp-way:hover{border-color:var(--line-2)}` (home.css:201): line → line-2.
- `.os-search:hover{border-color:rgba(255,255,255,.36)}` (styles.css:612).
- Community `.start-i:hover{border-color:var(--line-2)}` (:418).
- Community `.composer-bar .fake:hover{border-color:var(--line-2)}` (:241).
- Community `.search input`: no hover rule (stays .12).
- The front page prompts take `rgba(255,255,255,.36)` while focused: home.css:33 and :571.

**Evidence:** `states-hover-line2.png` (the Library card and the points chip reach `text`; these don't); `states-topbar-web-vs-comm.png`.

**Rule:** BRAND *States*: "Hover: hairlines brighten to text".

**Fix:**
- home.css:201, styles.css:612, community :418 and :241 → `border-color:var(--text)`.
- Community: add `.search input:hover{border-color:var(--text)}`.
- home.css:33 and :571 `rgba(255,255,255,.36)` → `var(--text)`.

### COMP-09 · medium · Rows and quiet buttons take four different hover fills

**Where:** both apps' side panels, the Signal board, the agent roster, the community feed and the Signal table.

**Evidence (hover background, Playwright):**
- 5% white: website side panel rows (styles.css:563, :576, :600), top-bar icon buttons (:556, :619), `.toc a` (library.css:236), Ask Sig's side panel (term.css:485), community side rows `.nav-i` (:182).
- `hover` #1C1C20: the Signal board rows (home.css:261), the roster (home.css:360), the community's sort tabs, post actions and votes (:244, :256, :277).
- 8% white: the community bell (:120).
- 3% white: community Signal table rows (:977).
- Images: `states-inset-rings.png` and the `side-*`, `comm-act-*`, `home-board-row-*` crops.

**Rule:** BRAND *States*: rows take the `hover` ground. This brief's "5% fill" predates the `hover` token (Nov 12 call 9).

**Fix:** every one of those values → `var(--hover)` (website) or `var(--surface-3)` (community; the same #1C1C20). The current row keeps its 8% fill and `aria-current`.

### COMP-10 · medium · Focus rings are drawn inside on ten controls, five without need

**Where:**
- the front page (roster, prompt results);
- Ask Sig (chat tab, agents/screen tabs, +, ⌘K);
- every community screen (side panel rows, the window tab).

**Selectors:**
- Not clipped, so the ring can sit outside:
  - `.tm-plus` (term.css:99);
  - `.tm-sb-k` (term.css:140);
  - `.roster button` (home.css:361);
  - community `.side .family a,.side-legal a` (:163; 12px of room).
- Clipped by a container that scrolls or hides overflow:
  - `.tm-tabopen` (nav.tm-chats, `overflow-x:auto`, 0px below);
  - `.tm-tabbtn` (the rail, `overflow:auto`, 0px above);
  - `.hp-row` (inside `.hp-drop`, overflow hidden);
  - community `.win-tab` (:98, nav.win-tabs hidden);
  - `.leftnav a` (:163, scrolls with 0px to the left).

**Evidence:** offsets -2px and -3px against +2/+3px everywhere else (`scripts/clipcheck.py`). The website's side panel rows draw the ring outside, the community's identical rows inside: `states-inset-rings.png`.

**Rule:** BRAND *States*: the ring sits 2–3px out.

**Fix:**
- term.css:99: split into `.tm-tabopen:focus-visible,.tm-tabx:focus-visible{…-2px}` and `.tm-plus:focus-visible{outline:2px solid var(--tm-tx);outline-offset:2px}`.
- term.css:140 `-2px` → `2px`.
- home.css:361 `-2px` → `2px`.
- Community :163: split; `.side .family a:focus-visible,.side-legal a:focus-visible{outline-offset:2px}`, and `.leftnav a` keeps -2px.
- Record the exception in the book (COMP-22).

### COMP-11 · medium · Tags come in two styles: the community still uses mono capitals

**Where:** community post, space, account and profile (all widths); compare with the website's sheets, Library and compare pages.

**Selectors:**
- Community `.chip` (:223): 24px, 0 9px, 5px, `line-2`, Monaspace 500 10.5px in capitals at .63px.
- Community `.chip.ink` ("OP", "moderator") is filled white.
- Community `.chip.fx` has a 6% fill; `.chip.oc.pos` has a blue frame.
- Website `.ev,.st,.hc,.pill,.conf,.check`: 27px, 5px 10px, 7px, `line-2`, Mona Sans 500 12.5px in sentence case.

**Evidence:** `tags-web-vs-comm@1440.png`; the white MODERATOR tag in `comm-account@1440-two-blue-actions.jpg`.

**Rule:** decision Nov 12 call 3: "Tags are words, not code: Mona Sans in sentence case at 12.5px, 7px corners"; Nov 11 call 3: no tinted fills.

**Fix:**
- Community :223 `.chip{…}` → `height:27px;padding:0 10px;border:1px solid var(--line-2);border-radius:7px;font:500 12.5px/1.2 var(--body);letter-spacing:0;text-transform:none`.
- `.chip.ink` → `background:transparent;border-color:var(--line-2);color:var(--text)`.
- `.chip.fx` → no fill.
- The COMMUNITY tag beside the logo keeps mono capitals (BRAND *Logo*) and takes 7px.

### COMP-12 · medium · Card padding takes 14 values

**Where:** website cards on 13 templates; community cards on every screen.

**Values** (all framed in `line`, filled `surface-raised`):
- Website:
  - 20: `.lib-card` library.css:73, `.st-row` pages.css:50, `.side-card` library.css:237;
  - 24, or 20 at ≤600px: `.glass.deep` styles.css:93/:380, `.doc .short` :262, `.fd-card` pages.css:115, `.pg-share` :23, `.wk-get` :104, `.plan-cta` plan.css:156, `.my-sec` my.css:13, `.pending-box` library.css:225;
  - 18 20: `.ev-box` library.css:180;
  - 20 22: `.lab-col` :199;
  - 16 18: `.checked` :222;
  - 18: `.toc` :233;
  - 14 18: `.lib-moves` :309;
  - 14 16: `.cmp-cell` pages.css:84;
  - 14 18 14 52: `.asks li` library.css:214;
  - 40 36: `.st-card` home.css:170;
  - 22 24 24: `.fp-way` home.css:200.
- Community:
  - 16: `.card` :210;
  - 14: `.stat`, `.bdg`, `.step-l`;
  - 12 14: `.airead` :294, `.pub-choice` :426, `.rules-note` :525, `.start-i` :417.

**Evidence:** `scripts/cards.py` output; `cards-web-vs-comm@1440.png`.

**Rule:** one card padding (this brief).

**Fix:** 20px everywhere. It is the most-seen card (`.lib-card`, `.st-row`), what the 24px family already uses on a phone, and +4px for the community.
- Every rule above → `padding:20px`, keeping `.asks li`'s 52px left gutter for its number.
- Delete the ≤600px overrides styles.css:380, :386, pages.css:139, plan.css:165 and library.css:271.
- Community :210 `padding:16px` → `20px`.

### COMP-13 · medium · Three tables, three styles

**Where:**
- the front page's Signal board (`table.fp-top`, all widths);
- the method page (`table.mtable`);
- the community Signal (`table.top-table`).

**Evidence:**

| | Front page board (home.css:254–265) | Method (styles.css:399–409) | Community (:972–1003) |
|---|---|---|---|
| Head | mono 11.5px `muted` on `band` #000 | mono 13px lowercase `muted` on `raised` #17171A | mono 13px `muted` on #17171A |
| Cells | 13px 12px (18px at the ends) | 9px 12px | 9px 10px under 1600px |
| Row | 42px, top rule rgba(255,255,255,.07) | ≥41px, `line` under each row | 37px, `line` under |
| Numbers | 13px 400 `text-2`, right | 13px **500 `text`**, right | 13px 400 `text-2`, right; the Signal in Signal blue |
| Hover | `hover` | none | 3% white |
| The Signal's bar | **white** (home.css:269) | | Signal blue (:987) |

Image: `tables-three-styles@1440.png`.

**Rule:**
- tokens `label` (12px) for "a table's column heads";
- `data` 13px for "Tables and numbers";
- `cell` 12px horizontal (10px on narrow screens);
- `line` for dividers;
- Signal blue for "scores" (BRAND *Colour*).

**Fix (head: `label` on `bar`; cells 9px 12px; `line` under rows; numbers 400 `text-2`; rows `hover`):**
- home.css:
  - :255 `padding:13px 12px` → `9px 12px`;
  - :256 `background:var(--band);font-size:11.5px` → `background:var(--raised);font-size:12px`;
  - :260 `border-top:1px solid rgba(255,255,255,.07)` → `border-top:1px solid var(--line)`;
  - :269 `background:var(--text)` → `var(--lime)` (the colour lead should confirm).
- styles.css:
  - :403 `font:400 13px/1.4` → `400 12px/1.4`;
  - :406 `font:500 13px/1.4 …;color:var(--text)` → `font:400 13px/1.4 …;color:var(--text-2)`;
  - add `.method .mtable tbody tr:hover{background:var(--hover)}`.
- Community:
  - :975 add `font-size:12px` to `.top-table thead th`;
  - :977 `rgba(255,255,255,.03)` → `var(--surface-3)`;
  - :997 the `max-width:1600px` padding override → delete (keep 10px only under 760px, :1001).

### COMP-14 · medium · Fields: two sizes, the community's placeholders are unstyled, and some fields zoom iOS

**Where:**
- website: the foot sign-up (19 pages), the Library, the front page;
- community: New, Explore, Account, sign-in and the top bar.

**Evidence:**
- Text fields: website 48px, 10px, Mona Sans 16px, padding 0 16px. Community `.input`: 47px, 8px, 15px, padding 11 14 (:508); sign-in 56px (:547).
- Top-bar searches: website 40px, Mona Sans 14.5px, `line-2`. Community 34px, mono 12.5px, border rgba(255,255,255,.12) (:111).
- Placeholders:
  - website: all `muted`, 5.18:1 on `surface-raised`;
  - community `.input`: Chrome's default #757575 (no `::placeholder` rule), **4.06:1**, under `muted`'s 5:1;
  - community search: `rgba(252,252,252,.5)` (:112).
- Under 16px at 390, which makes iOS Safari zoom the page on focus (Ask Sig's own box already switches to 16px on a phone):
  - website `#fp-ask-q` 14.5px (home.css:384);
  - the Library's three selects at 14px (library.css:69);
  - community `.input` 15px.

**Rule:** fields are `surface-raised` with a `line-2` border (BRAND *Colour*); `muted` reads at 5:1 and up (tokens); one field (this brief).

**Fix:**
- Community:
  - :508 `.input{min-height:46px;padding:11px 14px;…}` → `min-height:48px;padding:11px 16px;font-size:16px`, and radius via COMP-01;
  - add `.input::placeholder,.cpick-in::placeholder{color:var(--muted);opacity:1}`;
  - :112 `rgba(252,252,252,.5)` → `var(--muted)`;
  - :111 `.search input` `border:1px solid rgba(255,255,255,.12)` → `var(--line-2)` and `font:400 12.5px/1 var(--mono)` → `400 14.5px/1 var(--body)`, as the website's;
  - :547 `min-height:56px` → `48px`.
- Website:
  - home.css: add `@media (max-width:700px){.fp-askbox input{font-size:16px}}`;
  - library.css:69 `font:500 14px var(--body)` → `500 16px var(--body)`.
- Fields take 8px (COMP-02).

### COMP-15 · medium · One prompt drawn four ways, with four focus states

**Where:** the front page (hero search; Sig's box under the example run), Ask Sig's typing bar, the community composer.

**Evidence:**

| Prompt | Box | Focus |
|---|---|---|
| Hero search `.hp-line` (home.css:32) | 64px, 8px, `surface` #000 | ring, and frame .36 |
| Front page ask box `.fp-askbox` (home.css:380), 22px under the square example run and the same width, with the same `sig@miracle ~/chats ›` as Ask Sig | 58px, **12px**, `raised`, blue "Ask Sig" key | ring, and frame .36 |
| Ask Sig's typing bar `.ai-composer` | 56px, square, `bar`, hairline "↩ send" key at 7px | frame turns white, **no ring** (`term.css:181 …{outline:0}`) |
| Community composer `a.fake` (:240) | 42px, 8px, `bar`, `line` frame | hover to `line-2` |

Images: `states-prompts-focus.png`, `home-askbox-under-square-run@1440.png`.

**Rule:** decision Nov 13 (Sig's box to write in is square, with a hairline frame that turns white); BRAND *States* (the ring).

**Fix:**
- home.css:380 `.fp-askbox{…border-radius:12px…}` → `border-radius:0`: it is Sig's box, under a square run.
- term.css:181 `.tm .ai-composer:has(textarea:focus-visible){outline:0}` → `{outline:2px solid var(--text);outline-offset:2px}`, keeping the white frame.
- home.css:33 and :571 → `var(--text)` (COMP-08).
- Community :240 `a.fake` frame `var(--line)` → `var(--line-2)` (a field).

### COMP-16 · medium · The same family filter is two components, with three "current" looks

**Where:** website Library (`.lib-chips button`); community Explore (`nav.tabs.fam a`) and the sort bars on home, popular, post and space (`.sortbar a`).

**Evidence:**
- Library: 44px, 9px, Mona Sans 500 13.5px; pressed: 8% fill and a `text` frame.
- Explore: 34px, 6px, mono 11.5px capitals; current: **solid white** with black words (:601 `background:var(--bone);color:var(--on-bone)`), which reads as a white button.
- Sort bar current: `surface` with a `line-2` frame (:245).
- Images: `comm-explore-tabs-current@1440.jpg`, `lib-search-chips-selects@1440.jpg`.

**Rule:** BRAND *States*: "Current: … the hover ground (or an 8% text fill) and aria-current".

**Fix:**
- Community :601 → `background:rgba(255,255,255,.08);border-color:var(--text);color:var(--text)`.
- :245 → the same.
- :600 `.tabs a` → `height:44px;border-color:var(--line-2);font:500 13.5px/1 var(--body);letter-spacing:0;text-transform:none`, matching the Library's chips; radius 8 (COMP-02).

### COMP-17 · medium · Interface icons are drawn at seven stroke weights

**Where:** the top bar on every website page, the front page, Ask Sig.

**Evidence** (stroke-width × 24/viewBox, so every icon is compared on the brand's 24 grid):
- 1.8, on brand: menu and close at 1.2 on a 16-grid (index.html:37, :51; build_library.mjs:161), Ask Sig's set (ai.js:68–93 mostly 1.2), the Library search (1.8 on 24, build_library.mjs:347).
- 2.0: the top-bar search on every page (index.html:53, privacy.html:41, terms.html:41, 404.html:41, build_library.mjs:158) and the hero search (index.html:75).
- 2.2: the send key (build_library.mjs:826, sig/index.html:109).
- 2.4: Ask Sig's "ways to start" (`goalIcon` 1.6 on 16, ai.js:93).
- 2.55: the new-chat + (1.7 on 16, build_library.mjs:790, sig/index.html:70) and the `warn` and `code` icons (ai.js).
- 2.7: `close` (1.8 on 16).
- 3.0: `check` (2 on 16).
- Rendered from 1.2px to 2px. Sizes (16–20px) and centring on their labels are right.
- Image: `icons-stroke@1440.png`.

**Rule:** BRAND *Iconography*: "1.8 stroke on a 24 grid … drawn at 16–20px".

**Fix:** `stroke-width="2"` → `"1.8"` on the 24-grid icons above (index.html:53, :75; privacy/terms/404 :41; build_library.mjs:158, :826; sig/index.html:109); 16-grid icons → `1.2` (ai.js `goalIcon` 1.6, `check` 2, `close` 1.8, `warn` and `code` 1.7; build_library.mjs:790 and sig/index.html:70 1.7).

### COMP-18 · low · Meters aren't one family

**Where:** the front page, sheets, the community Signal table and rail.

**Evidence:**
- Heights 4px (`.fp-bar`), 5px (`.tbar`) and 6px.
- Ends 2, 3 and 4px.
- Tracks:
  - 12% (home.css:268);
  - 14% (library.css:150);
  - 22% (home.css:248);
  - 10% (community `.scale-fill`);
  - #1C1C20 (community `.bar` :217).
- Fills: Signal blue, white (the front page board) and a gradient (`.sig-scale`).

**Rule:** one family (this brief); Signal blue for the Signal.

**Fix:** a 6px meter (4px inside a table row), round ends (3px, 2px in a row), track `var(--line)`, fill `--lime` for a Signal and mint for evidence (the kit's segmented meter stays as it is).
- home.css: :248 `.22` → `var(--line)`; :268 `.12` → `var(--line)`.
- library.css:150–151 `border-radius:4px` → `3px`, `.14` → `var(--line)`.
- Community: :217 `var(--surface-3)` → `var(--line)`; `.tbar` 5px → 4px.

### COMP-19 · low · Other radii off the scale

**Where:** website.

**Values** (component · now → token):
- ⌘K key `.os-search kbd` · 6 → 7 `radius-tag` (styles.css:616).
- The kit's citation key `.mh-bm-src` · 6 → 7, sitting next to `.ref` at 7 on every sheet (add `.mh-bm-src,.mh-bm-ln` to styles.css:426).
- `.mh-bm-ln` row · 6 → 7.
- Ask Sig's status bar `.tm-sb-sig` · 11px bottom-left → 0 (term.css:122). The window and bar are square now, so the white SIG block leaves a black notch: `asksig-status-sig-corner@1440.jpg`, at 1440, 1024 and 768.
- The Signal card's tags `.sx-pt` and `.sx-studies` · 3 (home.css:106, :120) → 0 in its square language, with the drawing's tag `rx="4"` (lib/sighero.js:40) → 0.
- `.sig-scale` · 4 → 3 (COMP-18).
- Terminal blocks `.nf-shell` (styles.css:686) and `.sy-term` (:729) keep 10, but their frame `rgba(255,255,255,.12)` → `var(--line)`.
- The front page's cards `.st-card` (home.css:170) and `.fp-way` (:200) use the pane radius 14. tokens' `radius-pane` lists "the prompt, the Signal board, a run, the graph". Either set 14 → 12, or add them to `radius-pane`'s usage (COMP-22).

### COMP-20 · low · Dots come in four sizes

**Evidence:**
- pips and live dots 7px (`.fp .pip`, `.live i`, tab dots);
- 6px: `.op-live` styles.css:569, Ask Sig `.tm-dots i` term.css:115, `.tm-sb-safe i` :135, community `.tick-safe i` :67 and `.chip .dot` :232;
- 8px: `.sx-live` home.css:25, `.crowd-dot` ai.css:472, `.fp-interp .pip` home.css:335, `.roster .pip` :362;
- 12px: `.sn-name i` home.css:187, with a 4px glow ring.

**Rule:** BRAND *The Sig system*: "The pip: a 7px dot in the signer's colour".

**Fix:** those rules → `width:7px;height:7px`, and drop the `outline` and `box-shadow` halos on `.sn-name i` and `.crowd-dot`.

### COMP-21 · low · The community has three more button kinds

**Evidence:**
- `.cm-toggle` (collapse a comment, "–"): **16px tall** (:311), under a 24px target, at every width.
- `.btn.danger` ("Delete my account", :137): coral words in a 45% coral frame. `down` is "a Signal's move down", and the book's buttons are blue, white or hairline.
- The kit's `.mh-bm-retry` ("Try again") has a `text` frame rather than `line-2`. It shows on the BPC-157 space in this capture because the preview can't load the body map offline.

**Fix:**
- :311 `.cm-toggle` → `min-width:32px;min-height:32px` (as `.act`).
- :137 `.btn.danger` → a plain hairline (`border-color:var(--line-2);color:var(--text)`); the typed DELETE stays the guard (colour lead to confirm).
- kit `.mh-bm-retry` frame → `var(--line-2)`.

### COMP-22 · low · The book trails the build (correct the book, not the pages)

**Edits:**
1. **tokens.json `radius`:**
   - `radius-row` 9px → 7px ("the side panel's places and menu", as built in both apps since e4ec420);
   - `radius-control` 10px → 8px ("Buttons, fields and filter chips", as page 15's look set it in d172bd8);
   - new `radius-shell` 10px ("terminal blocks: a run log, the 404 shell") and `radius-strip` 9px ("the read strip");
   - `radius-card` usage: drop "Sig's window" (square since Nov 13).

   BRAND *Shape and depth* the same. styles.css:424's comment says "controls 10px".
2. **tokens.json `size`:** add `control` 48px ("buttons and fields") and `control-sm` 40px ("small buttons, the top bars' controls; 44 on touch"). The book has no button size today.
3. **BRAND *Shape and depth*:**
   - How it works' language frames its cards in `line-2` (`.hs-card` home.css:613, the run :298, `.fp-interp` :329, built with How it works in 80c7472), while *Colour* says `line` frames cards: say so;
   - say whether the community's ticked plates stay, and that "Three steps" and "Three ways in" are panes (14) or cards (12).
4. **BRAND *States and focus*:** add "inside a strip or list that scrolls (tabs, a dropdown's options), the ring sits 2px inside", and "the frame never carries the electric blue" (COMP-04).
5. **BRAND *Colour*:** "A white button is the second choice" is right. This brief's "white main action" is the Nov 11 rule and should not be reintroduced.

## Systemic

What should be one thing in both apps, and the one value:

| Thing | Today | One value |
|---|---|---|
| Corners | community 5/6/8/9/12; website 0/7/8/9/10/12/14 by component | tags and rows **7** · controls (buttons, fields, filter chips, tab tops) **8** · read strip **9** · terminal blocks **10** · cards, plates, tables, floating panels, the window **12** · the front page's panes **14** · How it works' language **0** · dots **50%** |
| Button | 3 kinds plus danger, quiet and mono keys; 10 heights; type 13–15.5 | electric blue (one per view, never in the frame), white, hairline · **48 / 40** (44 on touch) · 8px · Mona Sans 600 **14.5 / 14** |
| Field | 34–64px, radii 0/8/10/12, four fills, three fonts | **48px**, 8px, `line-2`, `surface-raised`, Mona Sans **16px**, 0 16px, placeholder `muted`, hover `text` |
| Focus | 2px rings (in and out), soft halos, none | **2px solid `text`, 2px out** (3px on text links); 2px inside only in a scrolling strip |
| Hover | frames to `text`, `line-2` or .36; fills of 3%, 5%, 8% and #1C1C20 | frames → **`text`**; rows and quiet buttons → **`hover`** #1C1C20; current → 8% fill and `aria-current` |
| Inline link | 4 treatments | **`text` 600** (`text-2` 400 in small print), **1px underline at 50% white**, offset 3px, hover → `currentColor` |
| Tag | two styles (Mona Sans 27/7 · mono caps 24/5) and filled badges | **27px, 0 10px, 7px, `line-2`, Mona Sans 500 12.5px**, sentence case, no fills |
| Card | padding 12–40, radius 6/12/14 | 1px `line` (`line-2` in How it works' language), `surface-raised`, **12px**, **20px** padding |
| Table | 3 styles | head `label` 12px mono lowercase `muted` on `bar` · cells **9px 12px** (10px under 760px) · `line` under each row · numbers `data` 13px tabular, right, `text-2` · the Signal in Signal blue · rows `hover` |
| Meter | 4–6px, ends 2–4, tracks 10–22% or #1C1C20, fills blue, white or gradient | **6px** (4px in a row), round ends, track `line`, fill Signal blue or mint |
| Dot | 6, 7, 8, 12px | **7px** |
| Icon | 7 stroke weights | 16–20px, **1.8 on 24** (1.2 on 16), round caps, `currentColor` |

## The next update, in this area

1. **One component layer for both apps, in the shared kit.**
   - **What:** move `.btn`, `.field`, `.tag`, `.card`, `.table` and the focus and hover rules into `kit/kit.css` (already shared and synced by CI), with variables generated from tokens.json (`--r-tag`, `--r-control`, `--r-card`, `--control-h`, `--control-h-sm`).
   - **Why:** today each app defines them separately (website styles.css:430, community styles.css:128 and :898), and they have drifted apart on every value above.
   - **Touches:** every page of both apps.
2. **Bring the community onto the Sig system's components, the decision log's own "Next".**
   - **What:** corners, tags, buttons, focus and links as above, and no blue in its frame.
   - **Why:** COMP-01, 03, 04 and 11 are most of the visible gap between the two apps.
   - **Touches:** all 15 screens and sign-in.
3. **A states check in CI.**
   - **What:** turn this audit's Tab-walk, hover probe and blue-count (`.design/evidence/design-components/scripts/tabwalk.py`, `probe.py`, `buttons.py`) into `scripts/check_states.mjs`. It fails on:
     - a focus stop without a 2px `text` ring, or with an inset ring outside the listed strips;
     - a frame whose hover stays below `text`;
     - two electric blue buttons in one viewport;
     - a field under 16px at 390.
   - **Why:** the static check (`design_check.mjs`) reads values but can't see states, and every state finding here passes it. It also allows 6px, which let the kit's 6px chips through.
   - **Touches:** all pages.
4. **One prompt component.**
   - **What:** the front page's search, Sig's box on the front page, Ask Sig's typing bar and the community composer as one `.prompt`: square, a hairline frame that turns white while typing, the ring on keyboard focus, the mono prompt, a hairline key.
   - **Why:** the decision of Nov 13 settled its look on Ask Sig; COMP-15 shows it hasn't reached the other three.
   - **Touches:** home, Ask Sig, community home, space and post.
5. **One interface icon set.**
   - **What:** one module of the community's stroke set on the 24 grid at 1.8 (`lib/icons.js`, synced like the kit).
   - **Why:** it replaces inline SVGs that are copied into index.html, privacy, terms, 404, both build scripts, sig/index.html and ai.js, where the stroke has drifted to seven weights (COMP-17).
   - **Touches:** every page.
