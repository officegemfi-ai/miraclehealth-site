# Components and states: audit report (November 23, 2026)

**The state of the area:** the website's main parts are close to one system: square everywhere, one tag family, one 2px focus ring, 48/40 buttons and one side-panel row. But Ask Sig and the community still draw the same parts their own way. The community has two blue actions in one view, hairline buttons wearing the blue glow, and skeletons where Sig's ring should be. One pair row comes in four forms and "current" in five, so the two apps don't yet feel like one.

**How this was measured**
- **The capture** in `.design/data` and `.design/shots`: the 24 website pages and the 15 community screens plus sign-in, at 1440, 1024, 768 and 390. The community capture is the second run, signed in.
- **Live, with Playwright and Chrome** on the three local servers:
  - inline and standalone links, at rest and under the pointer (centred hits only);
  - every focus stop on every page and screen, reached with Tab;
  - every kind of control under the pointer;
  - every field, focused;
  - the overlays: ⌘K, the side panel, Ask Sig's picker, the community's dialog, search, notifications, react, menu and toast;
  - loading and failure: the Signal held and failed, and Sig's answer held;
  - a canned Sig answer, a shared plan and the packet page.
- **The repository's own checks:** `node scripts/design_check.mjs --list` and `scripts/check_states.mjs`. Both pass: 48 views, 601 focus stops. Everything below is what they don't look at.
- **Where the files are:** scripts in `.design/evidence/design-components/scripts/`, raw results in `.../live/`, images in `.../img/`.
- **A caution on the website's hover runs:** the website scrolls smoothly (`html{scroll-behavior:smooth}`, styles.css:57), so a pointer test made straight after scrolling can miss. Every website "no hover" below was re-checked with instant scrolling (`scripts/reverify.py`, `reverify2.py`). The community doesn't scroll smoothly.
- **Line numbers:**
  - "site" means `/home/claude/miraclehealth-site`.
  - "community" means `/home/claude/miracle-health-community/web/styles.css` unless another file is named.
  - The shared kit's source is `miracle-health-community/shared/kit/`. Change it there, then sync. The copies are identical today.

## Read first: where the brief and the book disagree

This report follows the book wherever the two disagree.

| Topic | Brief / agent definition | Book and decisions | Built | Standardised on |
|---|---|---|---|---|
| Kinds of button | the white main action and the hairline | electric blue main action (one per view), white second, hairline the rest | three kinds | **three kinds** |
| Row hover | 5% fill | the `hover` ground (#1C1C20) | `hover` in both side panels | **`hover`** |
| Plates | carry corner ticks | no ticks in the book; plates are "a 1px frame, the number in its box" | no ticks anywhere (community `.hero::after{display:none}`, :940) | **no ticks** (the brief should drop the line) |
| Icon size | 16–20px | 16–24px | 10–22px | **16–24px**, the book's range |
| Card title in "How it works' language" | n/a | *Shape and depth*: "the title in mono" | Mona Sans 600, 22px (`li.st-step h3`); the code face is for numbers only (*Clean, not costume*) | **the body face** (see COMP-25: the book is corrected) |

## Findings (most visible first)

### COMP-01 · high · Two electric blue main actions in one view, on eight community screens at every width

**Where:**
- At 1440 and 1024, Create in the sticky top bar plus "Claim +20" in the quests card on 8 screens: comm-home, comm-popular, comm-post, comm-builders, comm-quests, comm-notifications, comm-how and comm-rules.
- At 768 and 390, the fixed tab bar's Share plus "Claim +20" on the same 8 screens.
- At 768 and 390 on comm-new, the form's "Post" plus the tab bar's Share.

**Selectors:**
- `ui/components/game.js:92` draws Claim as `class: 'btn lime xs'`.
- community :838 `.tabbar a.make span.ic-wrap{…background:var(--act)}` has no step-back on the new-post screen.
- The top bar's Create already steps back there (:1037–1038).

**Evidence:**
- comm-home@1440: Create at y 44–82, Claim at y 684–713. Both are in the first 900px view and both are filled with the `--act` gradient and the glow.
- Claim is 30px tall with 12px type.
- Image: `img/comm-home-two-blue@1440.png`.

**Rule:** BRAND *Colour*, "One main action per view"; tokens `accent`, "Never two on a screen"; decision of Nov 13 ("Create steps back to a hairline wherever the phone's Share or the new-post form is the main action").

**Fix:**
- `ui/components/game.js:92`: `class: 'btn lime xs'` → `class: 'btn sm'` (a hairline, 40px, 14px/600).
- community, after :838, add `.tabbar a.make[aria-current=page] span.ic-wrap{background:transparent;border:1px solid var(--line-2);box-shadow:none}`. `renderTabbar` already sets `aria-current` on Share at `#/new`.

### COMP-02 · high · Hairline "Join" buttons wear the main action's blue glow

**Where:**
- comm-explore at all widths: 297 Join buttons.
- The Join button on every space page the member hasn't joined (300 spaces).

**Selectors:** `ui/components/spaces.js:15` draws `btn lime sm join`. Community :121 `.btn.lime{…box-shadow:0 10px 30px rgba(26,4,255,.45),inset 0 1px 0 rgba(255,255,255,.22)}` is never cleared by :933 `.btn.join.lime{background:transparent;border-color:var(--line-2);color:var(--text)}`.

**Evidence:**
- Computed `box-shadow` of `button.btn.lime.sm` on Explore is `rgba(26,4,255,.45) 0 10px 30px, rgba(255,255,255,.22) 0 1px 0 inset` on a hairline (line-2) button.
- A purple pool sits under every card's Join.
- Image: `img/comm-explore-join-glow@1440.png`.

**Rule:** BRAND *Colour*: "every other button is a hairline: line-2 border, text words". *Shape and depth*: nothing casts a shadow but what floats. The glow belongs to the one main action.

**Fix:** community :933, add `box-shadow:none` → `.btn.join.lime{background:transparent;border-color:var(--line-2);color:var(--text);box-shadow:none}`.

### COMP-03 · high · Nothing loads with Sig's ring: skeleton boxes, bare "Loading…" lines, a spinning ring and CSS circle spinners

**Where:**
- **Community: grey shimmering skeletons.** `.skel` (:657–658, :727) is used by:
  - `ui/components/feed.js:18` (every feed: home, popular, space, profile);
  - `ui/pages/signal.js:15,18`;
  - `ui/pages/profile.js:16,25`;
  - `ui/pages/post.js:108`;
  - `ui/pages/builders.js:12`;
  - `ui/pages/moderation.js:23`.
- **Community: bare "Loading…" lines,** with no ring and not saying what loads:
  - `index.html:68` (boot);
  - `ui/components/notifications.js:64`;
  - `ui/components/moves.js:27`;
  - `ui/components/game.js:101,120`;
  - `ui/pages/quests.js:18`;
  - `ui/pages/notifications.js:11`.
- **Shared kit, both apps:** the body map draws a pulsing skeleton (`bodymap.js:169`, kit.css:123–126 and :133) on every fact sheet and every community space.
- **Website:**
  - The front page says "Loading the live Signal" with no ring (`img/web-home-signal-hold@1440.png`).
  - The fact sheet says "Loading what members report…" with no ring, under a blue "Live" pip (`img/web-sheet-signal-hold@1440.png`).
  - Ask Sig, while working, rotates the whole ring (term.css:61, `[data-sig].is-spin svg{animation:tm-turn 2.4s linear infinite}`) and draws CSS border spinners in the tab (term.css:103), the chat row (:325), the steps (:201, :210) and the auditor's head (ai.css:215). See `img/web-asksig-working@1440.png`.

**Evidence:**
- `.skel` measures 120px tall, with `linear-gradient(90deg,#121214,#17171A,#121214)` and `animation: skel`. `img/comm-skeleton-feed@1440.png` shows the feed's own markup drawn with the app's own stylesheet. The local preview resolves too fast to catch it, but the code path is the one members see.
- Live while Sig answers: `tm-spin` runs on `.sg-dot` (10px) and `.tm-tabdot` (11px), and the ring rotates.

**Rule:**
- BRAND *Motion*: "While something loads, Sig's ring is the spinner: its pieces light one by one, with one plain line saying what's loading. No grey skeleton boxes."
- *The Sig system*: "Loading: the ring is the spinner, with one plain line."

**Fix (one piece in the shared kit, used by both apps):**
- **The kit piece:**
  - `shared/kit/kit.js`: export the ring (today `lib/ring.js` `ringSvg` on the site and `ring()` in the community's `web/ui/art.js`) and a `waitHtml(words)` that returns `<p class="mh-wait" role="status">{ring 20px}<span>{words}</span></p>`.
  - `shared/kit/kit.css`:
    - `.mh-wait{display:flex;align-items:center;gap:10px;margin:0;color:var(--mh-muted);font:400 14px/1.5 var(--mh-body)}`
    - `.mh-wait .rg{opacity:.18;animation:mh-wait 1.32s linear infinite}` with `.mh-wait .rg:nth-child(2..12){animation-delay:.12s … 1.32s}`
    - `@keyframes mh-wait{0%,10%{opacity:1}35%,100%{opacity:.18}}`
    - `@media (prefers-reduced-motion:reduce){.mh-wait .rg{animation:none;opacity:1}}`
- **Community:** delete :657–658 and :727. Replace each `h('div',{class:'skel'})` and each bare "Loading…" `p` above with `waitHtml(…)`, keeping their words. The book asks the line to say what loads; the words are the copy owner's.
- **Kit:** `bodymap.js:169`: the skeleton → `waitHtml('Loading how … works in the body…')`. That line is already in the markup for screen readers. Delete kit.css:123–126 and :133.
- **Website:**
  - term.css:61: replace the rotation with the same piece-by-piece lighting on `.is-spin .rg`.
  - term.css:103, :201, :210, :325 and ai.css:215: replace the border spinners with the 16px ring lit the same way. The side panel already draws `ringSvg(16)`.
  - Put the ring beside "Loading the live Signal" (`lib/sighero.js`) and "Loading what members report…" (library.js).

### COMP-04 · medium · Under the pointer, framed parts and rows break the hover rule

**Where and evidence** (live, `live/hover-comm@1440.json` and `live/hover-web@1440.json`):
- **Frames that only reach line-2 (rgba(255,255,255,.2)), not `text`:**
  - community `.space-card:hover` (:426), 300 on Explore;
  - `.lib-link:hover` (:714), on posts and spaces;
  - `.chip.part:hover` (:685).
- **Framed links with no hover at all:**
  - the rail's main row `.start-i.main` (:440): its `border-color:var(--line-2)` outranks `.start-i:hover` (:437), so the row that sits on the hover ground at rest never answers;
  - the podium cards `.pod` (:483–484, comm-builders);
  - `.season-mini` (:211, in the side panel on every screen).
- **Rows with no hover:** `.move-i` (:409), `.goal` (:471) and `.mover` (:405), the rail's Live moves and Community goals on 11 screens.
- **Rows that take the wrong ground:**
  - `.lb-row:hover` (:477) and `.notif:hover` (:512) take `--surface-2` (#17171A, the floating panels' `bar`), not `hover` (#1C1C20).
  - `.notif.unread` (:513) comes after `.notif:hover`, so unread rows never show a hover.
- **Website:**
  - the Library's pairs turn their frame **electric blue**: library.css:331 `.moves-focus a:hover{border-color:var(--act-c);color:var(--accent)}`, measured `rgb(26,4,255)`;
  - Ask Sig's pairs only reach `text-2`: ai.css:451 `.ai-focus a:hover{border-color:var(--on-ink-2)}`.

**Rule:** BRAND *States and focus*: "Hover: hairlines brighten to `text`, and rows take the `hover` ground." Electric blue is only the main action (*Colour*).

**Fix:**
- community :426, :685, :714: `border-color:var(--line-2)` → `var(--text)`.
- After :440, add `.start-i.main:hover{border-color:var(--text)}`.
- Add `.pod:hover,.season-mini:hover{border-color:var(--text)}`.
- :477, :512: `var(--surface-2)` → `var(--surface-3)`. Add `.notif.unread:hover{background:var(--surface-3)}`.
- Add `.move-i,.goal,.mover{margin-inline:-8px;padding-inline:8px}` and `.move-i:hover,.goal:hover,.mover:hover{background:var(--surface-3)}`.
- site library.css:331 → `.moves-focus a:hover{border-color:var(--text)}`.
- site ai.css:451 → `border-color:var(--text)`.

### COMP-05 · medium · The family filter is two components, and "current" has five looks

**Where:** website `/library/` (all widths); community comm-explore, comm-home, comm-popular, comm-post, comm-signal (sort tabs), comm-profile (Posts/Comments) and comm-new (My experience / A question).

**Evidence** (`img/tabs-five-currents@1440.png`, capture data):
- **Website Library** `.lib-chips button`: 44px, 13.5px/500, `text` words, line-2 frame. Current: `rgba(255,255,255,.08)` fill and a `text` frame (library.css:351).
- **Community Explore** `nav.tabs.fam a` (:622–623): 34px, 13px/600, muted words, line (.1) frame. Current: **solid white, black words**.
- **Sort tabs** `.sortbar a[aria-current=page]` (:262): `surface-raised` and a line-2 frame.
- **Profile tabs** `.space-tabs a[aria-current=page]` (:423): a 2px underline.
- **New post** `.seg label:has(input:checked)` (:538): `surface-raised` inside a `hover` track (:535), **with `box-shadow:var(--shadow)`**.

**Rule:**
- BRAND *States and focus*: "Current: the current place, row or tab takes the `hover` ground (or an 8% `text` fill) and `aria-current`."
- The underline belongs to the top bar only ("underlined where the bar meets the page").
- Shadows only on what floats.

**Fix (one filter chip, one tab):**
- **Filters and choices** take the Library chip. Community :622: `.tabs a{height:34px;…border:1px solid var(--line);font:600 13px …;color:var(--muted)}` → `min-height:44px;padding:0 16px;border:1px solid var(--line-2);font:500 13.5px/1 var(--body);color:var(--text)`.
- :623 → `.tabs a[aria-current=page]{background:rgba(255,255,255,.08);color:var(--text);border-color:var(--text)}`.
- `.seg` (:535–538) takes the same chip: drop the track's `background:var(--surface-3)`. The checked label → `background:rgba(255,255,255,.08);box-shadow:none`, plus a `text` frame.
- **Tabs** (sort and profile): current → `background:rgba(255,255,255,.08);color:var(--text)`, no frame and no underline. That means :262 `background:var(--surface);border-color:var(--line-2)` → `background:rgba(255,255,255,.08);border-color:transparent`, and :423 `border-bottom-color:var(--text)` → `transparent` plus `background:rgba(255,255,255,.08)`.

### COMP-06 · medium · Cards: 11 paddings on the website and 9 in the community, two frames side by side, and nested cards on floating and hover grounds

**Where:**
- every page with cards in both apps;
- the community rail on all 15 screens;
- the Library, fact sheets, front page, story, status and founders.

**Evidence** (`scripts/cards.py`, `img/cards-frames@1440.png`):
- **Website padding:**
  - 20px: `.lib-card` library.css:73, `.st-row` pages.css:50, `.pg-goal` :30, `.part` :228, `.side-card` :238, `.sy-print`/`.sy-win` styles.css:772/778;
  - 24px: `.glass.deep` :109, `.doc .short` :283, `.fd-card` pages.css:115, `.wk-get` :104, `.pg-share` :23, `.plan-cta` plan.css:156, `.my-sec` my.css:16, `.pending-box` library.css:226;
  - 18/20: `.ev-box` :180, `.study` :209; 20/22: `.lab-col` :200; 16/18: `.checked` :223, `.claims li` :183; 18: `.toc` :234;
  - 14/18: `.lib-moves` :310; 14/18/14/15: `.fp-way` home.css:275;
  - 32/32/34/32: `.st-step` at 1440.
- **Community padding:** 16 (`.card` :227), 14 (`.stat`, `.bdg`, `.step-l`, `.season-mini`), 12/14 (`.start-i`, `.lib-link`, `.airead`, `.rules-note`, `.pub-choice`), 36/20 (`.empty`), and heroes at an uneven 30/30/26/30 and 26/30/28/30.
- **Frames:** community `.dark` (:231) and `.season-mini` (:211) use line-2 while their neighbours use line. On comm-home the rail's Live moves card is line-2 between line cards. Website `.pending-box` uses a dashed line-2.
- **Grounds:**
  - `.start-i`, `.lib-link`, `.airead`, `.rules-note` and `.pub-choice` sit on `--surface-2` (#17171A, the token for what floats).
  - `.start-i.main` (:440) and `.sigsay` sit on `--surface-3` (#1C1C20, the hover ground), so they look hovered at rest.
  - site `.plan-hero` (plan.css:16) sits on rgba(255,255,255,.08).

**Rule:**
- BRAND *Colour*: "`surface-raised` is cards, plates, fields and the read strip"; `bar` is for what floats; `hover` for the row under the pointer.
- One card padding (brief); `line` frames cards (*Colour*, Hairlines).

**Fix:**
- **One card:** `padding:20px; border:1px solid var(--line); background:var(--surface-raised)`.
  - Every website rule above → `padding:20px`, keeping `.asks li`'s 52px left gutter for its number. Delete the ≤600px 20px overrides that then repeat it (styles.css:418, :424; library.css:272; plan.css:165).
  - community :227 `padding:16px` → `20px`.
  - `.dark` :231 and `.season-mini` :211: `border-color:var(--line-2)` → `var(--line)`.
- **One plate** (How it works' large cards, the example's three plates and the community heroes): `padding:32px`. That is `.st-step` 32/32/34/32 → 32 and community `.hero`/`.feed-hero` → 32 all round.
- **Nested blocks inside a card** go transparent: `.start-i` :436 and `.lib-link` :713 `background:var(--surface-2)` → `transparent`; `.start-i.main` :440 `background:var(--surface-3);border-color:var(--line-2)` → `background:transparent;border-color:var(--line)`. Also `.airead`, `.rules-note`, `.pub-choice` → `transparent`, and plan.css:16 `background:rgba(255,255,255,.08)` → `var(--surface-raised)` with a line frame.

### COMP-07 · medium · The "Filling first" pair is four different components

**Where:** `/library/` (What moved this week), `/sig/` (Filling first), `/founders/` and the community rail ("Filling these first") on 6 screens.

**Evidence** (`img/pairs-four-ways@1440.png`):

| | Height, padding | Type | Count "0 of 10" | Hover |
|---|---|---|---|---|
| Library `.moves-focus a` (library.css:330–332) | 32px, 5/10 | 13px 600 | mono 11px, Signal blue | frame → electric blue |
| Ask Sig `.ai-focus a` (ai.css:450–452) | 36px, 8/12 | 13.5px | mono 11.5px muted | frame → text-2 |
| Founders `.fd-pairs a` (pages.css:120–123) | 59px, 16/20, raised | 16px text-2 | body 13px 600 muted | frame → text |
| Community `.focus-i` (:897–901) | row, no frame, 5px bar | 15px | mono muted | name underlined |

**Rule:** one component, one form (the owner's "so it feels all one"). The count is a number, so it takes the code face in `muted`; Signal blue is for scores and moves (*Colour*).

**Fix:** one pair row in the kit, used by all four places: `min-height:40px;padding:8px 12px;border:1px solid var(--line);background:transparent;font:600 14px/1.35 var(--body)`, with the use in `text-2`. The count is `font:400 13px/1 var(--mono);color:var(--muted)` and hover is `border-color:var(--text)`. In detail:
- library.css:330 `padding:5px 10px` → the above; :332 `.moves-focus .n{…color:var(--lime)}` → `var(--muted)`.
- ai.css:450 `min-height:36px` → `40px`, `font-size:13.5px` → `14px`.
- pages.css:120 `padding:16px 20px;…background:var(--white);color:var(--text-2)` → the above.
- The community rail keeps its bars as the one addition (a meter under the row).

### COMP-08 · medium · Website fields don't turn white on focus, and two don't on hover either; the community's do both

**Where:**
- the foot's email field on every page with the foot (22 pages, all widths);
- `/weekly/` and `/weekly/1/` (the page's email field);
- `/library/` (the search and the three selects, on focus).

**Evidence** (`live/fields@1440.json`, `live/hover-web@1440.json`):
- **The foot's email:** its frame stays rgba(255,255,255,.42) under the pointer and on focus. styles.css:847 `.foot-news .nf-row input{border-color:rgba(255,255,255,.42)…}` comes after :528 `.nf-row input:hover{border-color:var(--text)}` at equal specificity, so it wins.
- **The weekly page's field:** the frame stays line-2. :530 `.news-form.on-paper .nf-row input{border-color:var(--line-2)}` outranks :528.
- **Library search and selects:** turn white on hover (library.css:62, :354) but not on focus. With the pointer away, the frame stays rgba(255,255,255,.2) and only the outline appears (:63, and the global rule for the selects). Re-checked live with instant scrolling (`scripts/reverify2.py`).
- **Community** `.input:hover,.input:focus{border-color:var(--text)}` (:527) turns white both ways.

**Rule:** decision of Nov 13 (COMP-03/14): "On hover and on focus their frames turn white, and the focus ring is a solid 2px ring outside the control."

**Fix (site styles.css):**
- After :851, add `.foot-news .nf-row input:hover,.foot-news .nf-row input:focus,.news-form.on-paper .nf-row input:hover,.news-form.on-paper .nf-row input:focus,.nf-row input:focus{border-color:var(--text)}`.
- library.css after :354, add `.lib-search input:focus,.lib-filters select:focus{border-color:var(--text)}`.

### COMP-09 · medium · Prompts and fields come in three grounds and six heights, and the select is drawn two ways

**Where:** front page (search, Ask box), `/sig/` (typing bar), `/library/` (search, selects), `/weekly/`, community composer, new post, account, explore and sign-in.

**Evidence** (`img/prompts-and-fields@1440.png`, `live/fields@1440.json`):
- **Boxes with an action inside:**
  - front page search `.sx-find .hp-line` (home.css:34): 64px on **black** (`--ink`), with a 48px button inside;
  - Ask box `.fp-askbox` (home.css:385, :318): 58px on `bar` at 88%, with a 40px button at 14.5px and 16px sides (:389);
  - Ask Sig's typing bar: 56px on `bar`;
  - community composer: a 42px fake field on `bar` with a white 40px "Post" outside.
- **Plain fields:**
  - website 48px on `surface-raised`;
  - community `.input` 49px (11px padding plus line height) and `.cpick-box` 50px.
- **Selects:**
  - website Library: 44px, 16px/**500**, the browser's own arrow (library.css:69, :353);
  - community sign-in: 48px, 16px/400, a drawn triangle (:530).
- **Top-bar search:** website (a button) 40px on rgba(255,255,255,.03); community (an input) 40px at 14.5px. Both pass.

**Rule:**
- BRAND *Colour*: "`surface-raised` is cards, plates, fields" (`bar` is for what floats).
- Decision of Nov 13: "Fields are 48px at 16px".
- One component, one form.

**Fix:**
- **One field ground and frame:** `background:var(--surface-raised)` (site `--card`, community `--surface`), line-2, 48px.
  - home.css:34 `background:var(--ink)` → `var(--card)`.
  - home.css:318 `background:color-mix(in srgb,var(--raised) 88%,transparent)` → `var(--card)`, and :385 `background:var(--raised)` → `var(--card)`.
  - term.css's composer → `var(--card)`.
  - community `.fake` → `var(--surface)`.
  - Heights: the box with an action inside is 58px (8px in, 40px action) everywhere: home.css:34 `height:64px` → `58px`, and the search's button 48 → 40. Community :525 `min-height:48px;padding:11px 16px` → `height:48px;padding:0 16px` for single-line inputs.
- **One select:**
  - library.css:69/:353 → `min-height:48px;font-weight:400;appearance:none`, with the community's drawn arrow from :530 (or both apps take the interface set's `chevron-down`).

### COMP-10 · medium · The website's interface icons aren't the one icon set

**Where:** the top bar and side panel on every website page (menu, search, fold) at all widths; `/sig/` (new chat, wipe, plus, send, the picker's caret); `/story/` (checks); `/library/` (search).

**Evidence** (`live/icons-web@1440.json`, `live/icons-comm@1440.json`, stroke as drawn on screen):
- **The website's frame icons** come from `scripts/build_library.mjs:159–165` (`ICO`) and `lib/cmdk.js:44`, not from `design/pack/icons.json`:
  - menu and fold: 1.2 on a 16 grid (1.2px);
  - search: 2 on a 24 grid at 16px (1.33px);
  - hero search: 2/24 at 18px (1.5px);
  - Library search: 1.8/24 at 20px (1.5px);
  - send: 2.2/24 at 20px (1.83px);
  - `tm-plus`: 1.7 on a 16 grid;
  - the picker's caret: 1.4 on a 10 grid at **10px** (build_library.mjs:923);
  - the story's checks: 3/24 at **13px** (:1168–1169).
- **The community** draws every interface icon from the set: 1.6/24 at 16–22px.
- **The search icon alone** is 16, 18 and 20px on the site and 18px in the community.
- **The Signal's place mark:** in both side panels it is 1.8 on a 16 grid (1.8px), beside glyphs at 1.6/24 (1.07px at 16px).

**Rule:** BRAND *Iconography*: "Interface icons (`design/pack/icons.json`): one set for the website and the community app … a 24-unit grid, one 1.6 stroke … at 16–24px".

**Fix:**
- build_library.mjs:159–165: draw `search`, `menu` and the fold (`chevron-right` mirrored) from `design/pack/icons.json` at 1.6. The same applies to lib/cmdk.js:44, the hero's `.sx-find-i`, the Library search, Ask Sig's `sg-new`/`tm-plus` (`plus`), `sg-wipe` (`trash`), `ai-send` (`arrow-right` turned up) and the caret (`chevron-down`, 16px).
- The story's checks: `check` at 16px, 1.6.
- One search icon size in a field: 18px in both apps.

### COMP-11 · medium · One Ask Sig answer shows buttons in five heights and four type styles

**Where:** `/sig/` with an answer (1440, 1024; the same rules hold at 390), and the blood-marker rack beside it.

**Evidence** (`img/web-asksig-answer@1440.png`, live measurements):
- `.a-copy` "copy": 32px, 13px/400 (mind.css:69).
- `.mini` "Copy": 38px, 13px/500, `text-2` (ai.css:162, term.css:253). The same action twice in one answer, in two cases and two sizes.
- `.a-q` follow-ups: 36px, 13.5px/500 (mind.css:111).
- `.who-pill`: 40px, 13px/500 (mind.css:150).
- `.rk-copy` "Copy the tests for my doctor": 44px, 14px/600, **a white frame at rest**, hover = `hover` fill (mind.css:256–257).
- `.a-q.a-members`: a Signal-blue frame (:113).
- Elsewhere on the site, buttons are 48/40 at 14.5/14px 600 with a line-2 frame.

**Rule:**
- Decision of Nov 13 (COMP-07): "Buttons are 48px (40px small) in both apps, Mona Sans 600 at 14.5px (14px small)".
- Hairlines are line-2 and brighten to `text` on hover.

**Fix (all to the small hairline: 40px, 14px/600, line-2, hover → text):**
- mind.css:69 `min-height:32px;…font:400 13px/1` → `min-height:40px;…font:600 14px/1`.
- ai.css:162 and term.css:253 `.mini{min-height:32px|38px;…color:var(--text-2);font:500 13px/1}` → `min-height:40px;…color:var(--text);font:600 14px/1`.
- mind.css:111 `.a-q{min-height:36px;padding:6px 14px;font:500 13.5px/1.35}` → `min-height:40px;padding:8px 14px;font:600 14px/1.35`.
- mind.css:150 `font:500 13px/1` → `font:600 14px/1`.
- mind.css:256 `.rk-copy{min-height:44px;border:1px solid var(--tm-tx)}` → `min-height:40px;border:1px solid var(--tm-line2)`, and :257 `.rk-copy:hover{background:var(--hover)}` → `{border-color:var(--tm-tx)}`.
- Write "Copy" in sentence case on both.

### COMP-12 · medium · Floating panels, dialogs and toasts: four grounds, four shadows, three scrims

**Where:**
- ⌘K on every website page;
- Ask Sig's "Who answers" picker;
- the community's dialog (onboarding and every `confirm`), its toasts, and its search, notification, react and menu pops (all screens).

**Evidence** (`live/overlays@1440.json`; images `img/web-cmdk@1440.png`, `img/web-who@1440.png`, `img/comm-modal@1440.png`, `img/comm-toast-claim@1440.png`):

| Panel | Ground | Frame | Shadow | Scrim |
|---|---|---|---|---|
| ⌘K `.cmdk` (styles.css:682) | bar ✓ | line-2 ✓ | `0 1px 2px .4, 0 20px 50px .5` ✗ | rgba(0,0,0,.62) (:679) |
| Ask Sig `.who-pop` (mind.css:157) | **#121214** ✗ | line-2 | **none** ✗ | n/a |
| Community pops (:104, :304, :520, :672 with :941) | bar ✓ | line-2 ✓ | shadow-float ✓ | n/a |
| Community `dialog.modal` (:580) | **surface** ✗ | line-2 | `0 30px 80px -20px .45` ✗ | **rgba(8,12,11,.55) + blur(3px)** (:581): green-tinted |
| Community `.toast` (:601) | **#1C1C20 (hover)** ✗ | line-2 | `0 18px 40px -16px .55` ✗ | n/a |
| Side panels' scrims (styles.css:612, term.css:363, community :155) | | | | rgba(0,0,0,.55) |
| Ask Sig's sheet `.rl-backdrop` (mind.css:276) | | | | rgba(0,0,0,.62) |

**Rule:**
- tokens `bar`: "floating panels: search results, menus, pickers".
- `shadow-float`: "Floating panels: search results, menus, pickers, toasts".
- BRAND: "One set of colours, black and electric blue": no green-tinted scrim.

**Fix:**
- styles.css:682 → `box-shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px -14px rgba(0,0,0,.6)`.
- mind.css:157 `background:#121214` → `var(--raised)`, and add the same `box-shadow`.
- community :580 `background:var(--surface);…box-shadow:0 30px 80px -20px rgba(0,0,0,.45)` → `background:var(--surface-2);…box-shadow:var(--shadow)`.
- community :581 → `dialog.modal::backdrop{background:rgba(0,0,0,.55)}`, with no blur.
- community :601 `background:var(--surface-3);…box-shadow:0 18px 40px -16px rgba(0,0,0,.55)` → `background:var(--surface-2);…box-shadow:var(--shadow)`.
- **One scrim, rgba(0,0,0,.55):** styles.css:679 and mind.css:276 `.62` → `.55`. Add it to tokens as `scrim`.

### COMP-13 · medium · The community's search hides the row under the pointer, and it isn't ⌘K

**Where:** the community's top bar on every screen (1440, 1024; hidden on phones), and the compound picker on comm-new and comm-stack.

**Evidence:**
- **Rows that don't show:**
  - `.search-pop a:hover,.search-pop a.on{background:var(--surface-2)}` (:106) draws #17171A on a pop whose ground :941 sets to the same #17171A. Measured row hover is `rgb(23,23,26)` on `rgb(23,23,26)`, so hover and the chosen row don't show (`img/comm-search@1440.png`).
  - `.cpick-opt:hover` (:677) has the same problem.
- **Not ⌘K:**
  - The community has no ⌘K or Ctrl K: no handler in `web/`, and no key shown.
  - Its results are a 420px dropdown with 42px rows at 15px. Enter takes only the first row; there are no arrow keys.
  - The website's ⌘K is a centred 640px palette with 40px rows (14px names, 13.5px notes), evidence pips and arrow keys (`img/web-cmdk@1440.png`).

**Rule:**
- BRAND *States*: rows take the `hover` ground.
- *The Sig system*: "⌘K (Ctrl+K), from any page".
- Decision of Nov 13: the community takes the website's top bar.

**Fix:**
- community :106 and :677: `var(--surface-2)` → `var(--surface-3)`.
- In the next update, the community's top-bar search opens the kit's palette (see *The next update*, item 4).

### COMP-14 · medium · Keyboard focus is invisible on the community's "My experience / A question" choice

**Where:** comm-new (and anywhere `.seg` is used), all widths.

**Evidence:**
- Live, with Shift+Tab from the text box: focus lands on `input[type=radio]` at `opacity:0` (:537). Its 2px ring is drawn at opacity 0, and the label draws none (`img/comm-seg-focus@1440.png`).
- The app's tests don't catch it. The website's `check_states.mjs` doesn't run on the community.

**Rule:** BRAND *States and focus*: "every focusable thing gets a solid 2px `text` ring".

**Fix:** community, after :538, add `.seg label:has(input:focus-visible){outline:2px solid var(--text);outline-offset:2px}`. Its shadow goes with COMP-05.

### COMP-15 · medium · Round number badges and round controls where the book says square

**Where:** `/plan/#…` (a shared plan) at all widths; `/sig/` answers with a numbered list; the clinician packet; the community's Sig button on every screen.

**Evidence** (`img/web-plan-kept@1440.png`, `img/web-plan-steps@1440.png`, `img/web-asksig-answer@1440.png`):
- plan.css:17 `.phero-icon`: a **46px round** tile (40px at 390).
- plan.css:79 `.pstep::before`: **22px round** step numbers.
- ai.css:136 `.prose ol li::before`: **19px round** list numbers on a 14% fill, in 10.5px bold mono.
- packet.css:19 `.pk-close`: a 40px round close button.
- community :613 `.sigdock>button`: an inline svg in a 64px-wide button gives it a 64×70 box, so the black disc is an oval with 6px under the ring.
- Elsewhere, numbers sit in square boxes: the front page's `.cr-step-n` (32px, line-2) and How it works' `.hs-num` (52px).

**Rule:** BRAND *Shape and depth*: "Only dots and rings are round … No pills". "The number in its box".

**Fix:**
- plan.css:17 `border-radius:50%;background:var(--ink)` → `border-radius:0;border:1px solid var(--line-2);background:transparent`.
- plan.css:79 and ai.css:136 `border-radius:50%` → `0`. On ai.css:136, also `background:rgba(255,255,255,.14)` → `transparent;border:1px solid var(--line-2)`.
- packet.css:19 `border-radius:50%` → `0`.
- community :613: add `display:grid;place-items:center;width:64px;height:64px` (and 48px in the ≤860px block, :840).

### COMP-16 · medium · The Library's side-panel tree is drawn as folders; the fact sheets' tree uses plain names

**Where:** `/library/` with the side panel open (all widths, where the panel slides in).

**Evidence:**
- The panel reads "library/ 300", "▸ peptides/ 79", "▸ hormones/ 22" and so on (`img/web-side@1440.png`).
- These come from `scripts/build_library.mjs:454–455`.
- The fact sheets' tree (:626–630) says "The Library" and "Peptides".
- `scripts/check_clean.mjs` never opens the side panel, so the scan misses it.

**Rule:** *Clean, not costume* (file names and paths as labels); decision of Nov 18 ("the Library tree's folders and file names (now the families and the sheets by name)"). Rows of one component, two forms.

**Fix:**
- build_library.mjs:454 `library/` → `The Library`.
- :455: drop `<span aria-hidden="true">▸ </span>` and the trailing `/`, and print `${e(fam)}` as :630 does.
- check_clean.mjs: click `.os-menu` before scanning each page. This is the clean lead's rule; it's listed here because the tree is a side-panel row.

### COMP-17 · medium · The clinician packet is the one dialog and page still in the old paper-and-green look

**Where:** `/ai/packet/` (and its dialog over Ask Sig), all widths.

**Evidence:**
- packet.css:7–16 sets `--paper:#FCFCFC`, `--ink/--text:#121E1D`, a `#EEF1EB` ground, `#8DB51A` rules and `--line:rgba(18,30,29,.12)`, with a `0 30px 80px` shadow and a green-black scrim `rgba(6,10,9,.74)`.
- Its error state is a pale green-grey band under the black top bar (`img/web-packet-bad@1440.png`).
- The design check counts 66 off-palette colours in this one file.

**Rule:** BRAND: "One set of colours, black and electric blue, whatever a device is set to". Dialogs float: `bar`, line-2, `shadow-float`. No round close (COMP-15).

**Fix:**
- On screen, the packet takes the dialog form: packet.css:7–16 → `background:var(--raised);border:1px solid var(--line-2);box-shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px -14px rgba(0,0,0,.6);color:var(--text)`, with the site's own tokens, and `::backdrop` rgba(0,0,0,.55).
- Move the paper colours into the existing `@media print` block (:124–140) so a printed packet stays light.

### COMP-18 · low · Checkboxes are the browser's own: round-cornered, grey, and the second one on sign-up is squeezed

**Where:** community sign-up (both boxes) and new post ("Also let anyone read this report"); site plan ticks (`.ptick`, `.plan-incl input`, plan.css:87, :108).

**Evidence:**
- At 4×: rounded corners (about 2px), with a grey fill when off (`img/comm-signup-checkbox-on@x4.png`, `img/comm-signup-form@1440.png`).
- `#health-ok` renders **13.4×18px** beside `#rules-ok` at 18×18. The flex row shrinks it because `.check input` (:534) has no `flex:none`.

**Rule:** *Shape and depth*: every field square. One component, one size.

**Fix (in the kit, for both apps):**
- `input[type=checkbox]{appearance:none;flex:none;width:18px;height:18px;margin:3px 0 0;border:1px solid var(--line-2);border-radius:0;background:var(--surface-raised)}`
- `input[type=checkbox]:checked{background:var(--text) url(check, 1.6 stroke) center/14px no-repeat;border-color:var(--text)}`
- At minimum, community :534: add `flex:none`.

### COMP-19 · low · Buttons outside the three kinds and two sizes

**Where and evidence:**
- **Community:**
  - `.btn.xs` (:931): 30px, 12px (Claim, COMP-01).
  - `.btn.danger` (:126): coral `--neg` words and frame. Used by "Delete my account" (`ui/pages/account.js:16`) and every confirm's yes (`ui/dom.js:138`). The website's "Delete all chats" is a plain text button.
- **Kit:** `.mh-bm-retry` (kit.css:128): 44px, a `currentColor` (white) frame at rest (comm-space's "Try again").
- **Front page Ask box:** "Ask Sig" (home.css:389) is 40px at 14.5px with 16px sides, neither `.btn` nor `.btn.sm`.
- **Touch:** the site raises `.btn.sm` to 44px on a coarse pointer (styles.css:469); the community has no such rule (40px).
- **Join:** a white button in the top bar (build_library.mjs:203), a hairline in the side panel (:181) and in Ask Sig's side (:1003).

**Rule:** BRAND *Colour* (three kinds); decision of Nov 13 (48/40, 14.5/14px 600). `down` is "a Signal's move down", not a danger colour.

**Fix:**
- Delete community :931 once COMP-01 lands.
- Delete community :126, and `class:'btn danger'` → `'btn'` (the words say what it does).
- kit.css:128 → `min-height:40px;border:1px solid color-mix(in srgb,currentColor 20%,transparent)`, plus `.mh-bm-retry:hover{border-color:currentColor}`.
- home.css:389 → `min-height:40px;padding:0 14px;font-size:14px` (the `.sm` values).
- community: add `@media (pointer:coarse){.btn.sm{min-height:44px}}`.
- build_library.mjs:181 and :1003 `btn line sm` → `btn bone sm`, so Join is white wherever it stands.

### COMP-20 · low · Tables: two head styles and two cell paddings

**Where:** `/method/` (both tables); comm-signal (the board) at 1440 and 1024; `/compare/…` (row labels).

**Evidence:**
- **The method's heads** `.method .mtable thead th` (styles.css:441): 400 14px muted. The method has no row hover.
- **The community board** (:991): 600 13px muted, with row hover `--surface-3` ✓.
- **Cell padding:** the board's cells are 9/**10**px at 1440, because `@media (max-width:1600px)` (:1015–1017) narrows them. The method's are 9/12.
- **Compare** `.cmp-k` (pages.css:68): row labels at 400 14px.

**Rule:** tokens `label` (13px 600) for "a table's column heads"; `cell` 12px (10px on narrow screens); rows take the `hover` ground.

**Fix:**
- styles.css:441 → `font:600 13px/1.4 var(--body)`; add `.method .mtable tbody tr:hover{background:var(--hover)}`.
- pages.css:68 → `font:600 13px/1.4 var(--body)`.
- community: delete :1015–1017. Keep 10px from 760px down (:1021).

### COMP-21 · low · Links: hover-less cases and three underline strengths

**Where and evidence** (live, `live/links@1440.json`):
- **The foot's "How we handle your address":** on the violet band on 20 pages, a 70% underline and no hover. styles.css:851 `.foot-news .nf-note a{text-decoration-color:rgba(255,255,255,.7)}` comes after `.foot a:hover` (:804) at equal specificity, so it wins. Re-checked live with instant scrolling.
- **Community `.lnk`** (:132): a 20% (line-2) underline, and no hover on `button.lnk` ("Suggest it for the library", comm-stack, comm-explore).
- **Goal pages' sources** `.pa-src a` (pages.css:21–22): small print in `muted`. The decided small print is `text-2` at 400.
- **The side panels' legal row:** underlined on the website and Ask Sig (styles.css:610, term.css:361), not underlined in the community (:182).
- **Foot links:** the site's are `text-2` 14px/500 (styles.css:307); the community's are `text` 13.5px/500 (:642). Their hover goes #F7F8FA → #FFF, which can't be seen (1.04:1).

**Rule:** decision of Nov 13 (COMP-05): "One inline link: the words in text at 600, with a 1px underline at half white, 3px under, that turns solid on hover. Small print keeps its grey at 400."

**Fix:**
- styles.css:851 `.7` → `.5`; add `.foot-news .nf-note a:hover{text-decoration-color:currentColor}`.
- community :132 `text-decoration-color:var(--line-2)` → `rgba(255,255,255,.5)`; add `.lnk:hover{text-decoration-color:currentColor}`.
- pages.css:21 `color:var(--muted)` → `var(--text-2)`.
- The legal row: no underline in all three side panels. styles.css:610 and term.css:361 add `text-decoration:none`.
- Foot links in both apps: `text-2` 14px/500 → `text` on hover. Community :642 `color:var(--on-ink)` → `var(--on-ink-2)`, :643 `#FFFFFF` → `var(--text)`.

### COMP-22 · low · The focus ring stands 3px out on the website's pages and 2px out everywhere else

**Where:** every website page (the global rule), against the website's own frame, the community and the kit.

**Evidence:**
- Live Tab walks: on the site, 268 stops at 3px and 130 at 2px (the top bar and side panel: styles.css:586, :640, :647, :654).
- The community: all 180 stops at 2px (:55).
- The kit `.mh-bm :focus-visible` uses 2px. In all, 28 local rules on the site use 2px.

**Rule:** BRAND "2–3px out". One component, one value.

**Fix:** site styles.css:76 `:focus-visible{…outline-offset:3px…}` → `2px`, and the two `outline-offset:3px` rules in home.css. Then the book says "2px out" (COMP-25).

### COMP-23 · low · Tags and chips that leave the family

**Where:** front page; `/library/`, `/goals/weight/`, `/compare/…`; fact sheets (body map); community comm-space, comm-post and every screen's logo tag.

**Evidence.** The family (library.css:8, :343, :434; community `.chip` :223) is 27px, 5px/10px padding, 12.5px/500, line-2, with no fill. These differ:
- `.fp-vs .vs-status` (home.css:400): 28px, 13px, `text-2`.
- `.sx-studies` (home.css:179): a mint frame at 34% on a **mint fill at 6%**.
- `.lc-sig` (library.css:82, :356): a line (.1) frame, 4/9/4/5.
- `.move` (library.css:315): a 40px chip, used for the empty "Nothing moved yet this week."
- community `.chip.fx`: a line (.1) frame.
- community `.logo .tag` "Community": 23px, 12.5px/600, 4/8.
- `.stk-count`: 28px on `surface-raised`.
- kit `.mh-bm-route`: 23px, 12px, a 14% frame.
- kit `.mh-bm-mk`: 24px, 12px, a 14% frame (kit.css:93, :97).

**Rule:** decision of Nov 13 (COMP-11): "Tags are words … 12.5px in sentence case, 27px tall, with a hairline frame and no fill". The book's Community tag is "the word in the label style, in a line-2 frame".

**Fix:**
- home.css:400 → `min-height:27px;padding:5px 10px;font:500 12.5px/1.2 var(--body);color:var(--text)`.
- home.css:179 `background:rgba(20,236,195,.06)` → `transparent` (the mint words and meter keep the signature).
- library.css:356 `var(--line)` → `var(--line-2)`.
- The empty "Nothing moved yet" becomes a plain `muted` line, not a `.move` chip.
- community `.chip.fx` → line-2; `.logo .tag` → `font:600 13px/1.4` in its line-2 frame.
- kit `.mh-bm-route`/`.mh-bm-mk` → `min-height:27px;font:500 12.5px/1.2;border-color:color-mix(in srgb,currentColor 20%,transparent)`.

### COMP-24 · low · Dots and meters: two pip sizes, four bar heights, six track greys

**Where:** ⌘K, Ask Sig, the front page and the community post page (pips); the community rail, quests, signal, space and side panel; the website's fact sheets, method and front page (meters).

**Evidence:**
- **Pips:** 6px at `.cmdk-pip` (styles.css:692), `.crowd-dot` with a 3px glow (ai.css:447), `.hp-fact i` (styles.css:544/home.css:58) and community `.dot`; 7px for the live dots and `.tm-tabdot`.
- **Meter heights:** 4 (`.comp .bar`), 5 (`.focus-i .bar` :901, `.tbar`), 6 (`.bar` :234, site `.bar` styles.css:111) and 10 (`.split`).
- **Track colours:** `--surface-3` (:234), .08, .1, .12, .14 and .18 white.

**Rule:** BRAND *The Sig system*, "The pip: a 7px dot". One meter.

**Fix:**
- Pips → 7px: styles.css:692, ai.css:447 (and drop its `box-shadow`), styles.css:544, home.css:58, community `.dot`.
- Meters → `height:6px`, track `var(--line)`: community :234 `var(--surface-3)` → `var(--line)`, :901 `5px` → `6px`; site styles.css:111 `rgba(255,255,255,.18)` → `var(--line)`.

### COMP-25 · low · The book and the brief trail what was decided and built (correct the book, not the pages)

1. **"The title in mono."** BRAND *Shape and depth* ("Square, in How it works' language: … the title in mono") contradicts *Clean, not costume* and the build (Mona Sans 600). It should read "the title in the body face, semibold".
2. **The violet band's action.** BRAND *Colour* and *The brand pack* say its action is black. Join and the weekly email are black (`a.btn.lime` and `.foot-news .btn`, styles.css:841). The decision of Nov 22 built How it works' band with "one white button" (`a.btn.bone`, "See how it works", on `/` and `/how-it-works/`). The book should name both, or the owner picks one.
3. **The focus ring.** BRAND *States and focus*, "2–3px out" → "2px out", once COMP-22 lands.
4. **The brief and agent definition** (`.claude/agents/design-components.md`):
   - "two kinds only" → three;
   - "rows take a 5% fill" → the `hover` ground;
   - drop "plates carry corner ticks";
   - "icons 16–20px" → 16–24px.
5. **tokens.json has no numbers for the components it names.** Add:
   - spacing `card` 20px and `plate` 32px;
   - size `button` 48px, `button-sm` 40px (44px on touch), `field` 48px, `chip` 27px;
   - colour `scrim` rgba(0,0,0,.55).

## Systemic: what should be one thing, and the one value

| Thing | Now | The one value |
|---|---|---|
| Main action | one per view on the site; two on 8 community screens | one electric blue per view; everything else white (second) or hairline |
| Button size and type | 48, 44, 40, 38, 36, 34, 32, 30; 14.5/600, 14/600, 13.5/500, 13/500, 13/400, 12/600 | 48 at 14.5px/600; 40 at 14px/600 (44 on touch) |
| Hairline button | line-2 → text, but a white frame at rest (`.rk-copy`, `.mh-bm-retry`) and the blue glow on Join | line-2 at rest, `text` on hover, no shadow |
| Card | 20 paddings across both apps; line or line-2; raised, bar, hover or 8% ground | 20px, `line`, `surface-raised`; a plate is 32px |
| Card and frame hover | text, line-2, electric blue or none | the frame turns `text` |
| Row hover | `hover`, `bar` or none | `hover` (#1C1C20) |
| Current (tab, filter, row) | 8% fill, solid white, raised + frame, underline, raised + shadow | 8% `text` fill (+ `text` frame on a framed chip); the underline only in the top bar |
| Field | 48, 49 or 50px; raised, bar, black or .03; selects native and drawn; frames don't turn white on focus on the site (nor on hover on the foot's and the weekly page's fields) | 48px, `surface-raised`, line-2 → `text` on hover and focus, one drawn select arrow, square checkboxes |
| Box with an action inside | 64, 58 or 56px; black or bar | 58px on `surface-raised`, the action 40px, 8px in |
| Floating panel | bar, raised or hover ground; four shadows | `bar`, line-2, `shadow-float` |
| Scrim | .55, .62, a green tint with blur | rgba(0,0,0,.55) |
| Focus ring | 2px `text` at 3px (site pages) or 2px; invisible on `.seg` | 2px `text`, 2px out, on what can be seen |
| Loading | skeletons, "Loading…", a spinning ring, circle spinners | Sig's ring, its pieces lit in turn, beside one plain line (the kit) |
| Pair row ("Filling first") | four components | one kit row: 40px, line, 14px/600, count in mono `muted` |
| Interface icons | site: 1.2/16 to 2.2/24, 10–20px; community: the set | `design/pack/icons.json`, 1.6 on 24, 16–24px (18px in a field) |
| Tag | the 27px family plus nine strays | 27px, 12.5px/500, line-2, no fill |
| Pip and meter | 6 or 7px; 4–10px bars on six greys | a 7px pip; 6px bars on `line` |
| Table | head 600 13px or 400 14px; cells 9/10 or 9/12 | `label` on `bar`, cells 9/12 (10 under 760px), rows `hover` |
| Number badge | square boxes (front page, How it works), round (plan, Sig's lists) | the number in a square line-2 box |
| Inline link | 50% → solid; 20% (community `.lnk`); 70% with no hover (foot note) | 50% → solid on hover; small print `text-2` |

## The next update, in this area

1. **One set of components in the shared kit.** Move the button (three kinds, two sizes), tag, filter chip, tab, field, select and checkbox, card and plate, pair row, floating panel, dialog, toast and wait line into `shared/kit/kit.css` (`mh-*`). Both apps then use the kit's classes rather than their own `.btn`, `.card`, `.tabs` and `.input`. The kit's sync check already holds the copies equal, so the two apps can't drift apart again. This touches every page and screen, and is the change that makes them "feel all one".
2. **Sig's ring as the one loading state, and one error state.** Use the kit's `waitHtml` everywhere (COMP-03). The error state ("couldn't load just now" plus "Try again" as `.btn.sm`) becomes a kit piece too. Today it is the body map's own 44px white-framed button, the front page's line and Ask Sig's line. This touches the front page, the fact sheets, the Library, Ask Sig and every community screen.
3. **States checks for both apps.**
   - Run `scripts/check_states.mjs`'s rules on the community's screens (its `tests/e2e`), and add:
     - a focus ring that can be seen (not on an element at `opacity:0`);
     - one blue per view counting fixed bars;
     - hover that turns a frame `text` and a row `hover`.
   - Make the website's check open the side panel, ⌘K and Ask Sig's picker.
   - Make `check_clean.mjs` open the side panel.
   - COMP-01, -02, -04, -08 and -14 would all have failed such a check.
4. **One search.** The community's top-bar search opens the same ⌘K palette as the website (`lib/cmdk.js`, moved into the kit), with its 40px rows, pips and arrow keys, plus the community's spaces, posts and members as rows. It touches every community screen and makes ⌘K "from any page" true in both apps.
5. **A components page in the brand book with numbers.** It would carry the systemic table above as tokens (card, plate, button, field, chip, scrim) and say how each state looks (rest, hover, focus, current, disabled, loading, empty, error). The next audit can then hold both apps to numbers rather than to each other.

## Seen outside my area (for the art director to route)

- **Clean.**
  - Ask Sig's working line "Sig · reading your message · all 12 agents" is a three-bit dot chain (`img/web-asksig-working@1440.png`).
  - The preview banner at 390 reads "Preview with made-up members · any number · code 123456 · invite PREVIEW" (comm-* @390).
  - The community dialog's onboarding steps are a row of three dots (`img/comm-modal@1440.png`).
- **Copy, not changed by this department:** the community rules' "Fine / Not fine" examples quote amounts ("250 mcg a day", "500 mcg twice a day"; comm-rules). The book says "Doses or amounts, for anything" are never shown. This is for the owner to judge.
