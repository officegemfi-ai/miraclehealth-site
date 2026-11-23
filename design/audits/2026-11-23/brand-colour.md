# Brand and colour: audit of 23 November 2026

**State of the area:** the website's own colours are nearly all on token. It has no off-palette text colour on any of its 24 pages at any width. No text fails contrast under `ds.EFFECTIVE_BG_JS` at 1440 or 390. Every focus stop draws the 2px `text` ring. Every logo is the drawn `logo.svg` at 20px or 26px, and every page links the u icon.

It doesn't read as one brand yet:
- **The community** still draws the Signal's own scale, its compound tiles, its emblems and its small greys in older themes' colours, and shows two electric-blue actions in one view on 8 screens.
- **Ask Sig's answers** sign the Safety agent's work in the Recommender's yellow, and keep a terminal look.
- **The brand's own pieces are drawn differently from place to place:**
  - the line has its gradient on the front page but not on About;
  - Sig's ring is 16px in the top bar and 18px on Ask Sig;
  - the violet band's action is white in one band and black in the other two;
  - kickers are muted on pages but Signal blue on every share card;
  - the loading ring is missing.

## What was checked
- **Website:** the 24 templates in `design/pages.json` at 1440, 1024, 768 and 390.
- **Community:** 15 screens and `comm-signin` (`design/pages-community.json`) at the same widths. The new art-director capture was used once its log said `exit 0`.
- **My own live capture of every element:**
  - text colour, ground, all four border sides, underline colour;
  - SVG fill and stroke;
  - `::before` and `::after`;
  - the opacity chain, full gradients and shadows;
  - the head's icons, titles and share tags.

  It is in `.design/work-brand-colour/live/`, 179 page views: 96 website, 64 community and 19 states.
- **States the capture doesn't reach:**
  - the side panel open, ⌘K, and the front page's search results;
  - the front page while the Signal loads and when it fails, and the Library and a fact sheet when it fails;
  - Ask Sig with a real answer on it (a canned stream fulfilled by Playwright, as `scripts/check_sig.mjs` does), with an answer the Safety agent edited and its trace open, and when the answer can't come;
  - the clinician packet;
  - the email logo.
- **Contrast:**
  - `ds.EFFECTIVE_BG_JS`'s method on every text element on all 24 pages at 1440 and 390, with the opacity chain blended in;
  - a pixel check for words over gradients and pictures, since that method reads those as black;
  - the same method on all community screens at 1440 and 390.
- **Keyboard walks:**
  - website: home, a fact sheet, Ask Sig, 404 and privacy at 1440 and 390 (249 stops);
  - community: home, post, new post and sign-in (356 stops).
- **Static check:** `node scripts/design_check.mjs --list` reports colour 114, font-size 17, mono-tracking 10, gradient 23 and shadow 17. Most colour hits sit in `ai/ai.css` (answer states and crisis cards), `ai/packet.css` (the legacy clinician packet) and `ai/term.css` (print styles).
- **Evidence:** `.design/evidence/design-brand-colour/`.

**Two notes on the checklist's wording:**
- "One white main action" and "evidence blue" are older than the book. Since November 12 **the one main action is electric blue** (`accent`, lit by `accent-hi`), a white button is the second choice, and **the studies are mint** (`evidence`). I audited against the book and the decisions.
- **Work in progress during this audit:** the weekly and sign-up emails were being rebranded. These are uncommitted changes in:
  - `scripts/build_pages.mjs`;
  - `weekly/1/email.html`;
  - `img/email/logo.png`;
  - `design/pack/wordmark.py`;
  - the community's `supabase/functions/newsletter/index.ts`.

  BC-18 is about that state. The email logo PNG matches the drawn outline (`email-logo-vs-site-logo.png`).

---

## Findings, most visible first

### BC-01 · high · The community draws the Signal's scale red to amber to blue; the website draws it Signal blue
- **Where:** `comm-space` and `comm-post` at all four widths (8 views): every compound's space and every post's Signal card.
- **Selector:** `section.card.dark.sigcard > svg.scale`, drawn by `scale()` in `web/ui/art.js:110–119`:
  - its comment says "The Signal's scale, red to amber to lime";
  - its gradient at `:115` is `#B0453D → #D4A72C → #3D8BFF`.
- **Evidence:**
  - The same card on a fact sheet uses `--scale` (`linear-gradient(90deg, rgba(61,139,255,.28), #3D8BFF)`, `styles.css:39`).
  - `#B0453D` and `#D4A72C` are off-palette. They are the old red and amber.
  - Image: `signal-scale-two-ways.jpg`.
- **Rule broken:**
  - BRAND *Colour*: gradients only for "the Signal's scale bar", in Signal blue.
  - Signal blue is the community's and its Signal's colour.
  - No leftovers of older themes.
- **Fix:** `web/ui/art.js:115`:
  - Change `<stop offset="0" stop-color="#B0453D"/><stop offset=".55" stop-color="#D4A72C"/><stop offset="1" stop-color="#3D8BFF"/>` to `<stop offset="0" stop-color="#3D8BFF" stop-opacity=".28"/><stop offset="1" stop-color="#3D8BFF"/>`.
  - Change the `:110` comment to "The Signal's scale, in Signal blue, as the website's (`--scale`)".

### BC-02 · high · Two electric-blue main actions in one community view: Create and "Claim +20"
- **Where:** home, popular, post, notifications, quests, rules, how and builders, at 1440 and 1024 (16 views). It shows for every new member who followed three spaces at onboarding.
- **Selectors:**
  - `header.topbar a.btn.lime.sm.create`;
  - `aside#rail div.quest > button.btn.lime.xs` "Claim +20", from `web/ui/components/game.js:92` (`'btn lime xs'`).
- **Evidence:**
  - At 1440, Create is at y 43 and Claim at y 683, both in one 900px view.
  - Both have the `act` gradient and the `0 10px 30px rgba(26,4,255,.45)` glow.
  - `comm-home@1440` also has the white "Post" in that view.
  - Image: `comm-two-blue-actions-1440.jpg`.
- **Rule broken:** tokens `accent`: "The one main action per view … Never two on a screen". Also BRAND *Colour*.
- **Fix:** `web/ui/components/game.js:92`: `'btn lime xs'` → `'btn xs'`. That is the community's hairline (`web/styles.css:923`), so the claim stays and the view keeps one blue action and one white.

### BC-03 · high · Community text still in the graphite theme's whites and off greys; the ticker's dash fails contrast
- **Where:** every community screen, at all widths: the Signal's tape at the foot of each screen.
- **The off values:**

  | Selector (`web/styles.css`) | Value | Count | Contrast | Token |
  | --- | --- | --- | --- | --- |
  | `:77` `.tick-i .eq` (the tape's "–") | `rgba(252,252,252,.4)` | 277 on screen (4,898 with the tape's copies) | 3.59:1 | `muted` |
  | `:77` `.tick-i .dn` | `#FF8A7A` | 9 on screen | n/a | `down` (#FF9A8E) |
  | `:961` `.post.log .excerpt`, every feed post (home, popular, space, profile) | `#C2C6CD` | 127 | n/a | `text-2` |
  | `:362` `.use.waiting .num` "—" | `rgba(252,252,252,.4)` | n/a | 3.76:1 on #121214 | `muted` |
  | `:358` `.uses .dim, .tools .dim` | `rgba(252,252,252,.5)` | n/a | n/a | `muted` |
  | `:905` `.use .num .rng` | `rgba(252,252,252,.5)` | n/a | n/a | `muted` |
  | `:125` `.btn.on-ink` border | `rgba(252,252,252,.4)` | n/a | n/a | `line-2` |

  The `.btn.on-ink` border is overridden at `:928`, so it is dead, but it is still a literal. The `.uses`/`.tools .dim` and `.use .num .rng` values are the same graphite white.
- **Evidence:** `contrast-comm/*.json` and `a1_comm.txt` in `.design/work-brand-colour/`. This was BC-05 of 13 November and is still open.
- **Rule broken:**
  - BRAND *Colour*: words in `text`, `text-2` and `muted` only, "each reads at 5:1 or better".
  - `down` is the move-down colour.
  - #FCFCFC is the graphite-era white.
- **Fix:** in `web/styles.css`:
  - `:77` → `.tick-i .dn{color:var(--neg)}` and `.tick-i .eq{color:var(--muted)}`;
  - `:358`, `:362` and `:905` → `color:var(--muted)`;
  - `:961` → `color:var(--text-2)`;
  - `:125` → `border-color:var(--line-2)`.

  Muted reads 5.81:1 on black and 5.18:1 on #121214.

### BC-04 · medium · Explore: every space card's hairline "Join" casts the main action's blue glow
- **Where:** `comm-explore` at all widths: 297 buttons per width, 1,188 in all.
- **Selector:** `div.space-grid a.card.space-card button.btn.lime.sm.join`.
  - `web/styles.css:933` `.btn.join.lime{background:transparent;border-color:var(--line-2);color:var(--text)}` clears the fill.
  - It doesn't clear the glow, which comes from `:121` `.btn.lime{box-shadow:0 10px 30px rgba(26,4,255,.45),…}`.
- **Evidence:** the computed `box-shadow` on each Join is the main action's glow, a blue haze under every card. Image: `comm-explore-join-glow.jpg`. This was BC-04 of 13 November and is still open.
- **Rule broken:** BRAND *Gradients and glows*: the glow belongs to the one main action. *Shape and depth*: nothing else casts a shadow.
- **Fix:** `web/styles.css:933`: add `box-shadow:none` to `.btn.join.lime`, and to `:934`'s hover.

### BC-05 · medium · The violet band's action is drawn two ways, and the front page shows two white buttons in one view
- **Where:** the front page at all widths. It is the How band at y 2411 at 1440, with the white Join in the sticky top bar in the same view.
- **Selectors:**
  - The How band's `header.hs-intro.violet a.btn.bone` "See how it works" (`index.html:192`) is **white**.
  - The Join band's "Join the community" (`section#join.violet a.btn.lime`) is **black**.
  - The foot's weekly "Get it weekly" (`.foot-news .btn`) on every page is **black**.
  - The band rule is `styles.css:841` `.violet .btn.lime,.foot-news .btn{background:var(--ink)…}`. It catches `.btn.lime` and not `.btn.bone`.
- **Evidence:** `violet-band-action-two-ways.jpg`. `a2_buttons.py` finds two whites in one view on home at 1440, 1024, 768 and 390, and nowhere else on the website.
- **Rule broken:**
  - BRAND *Colour*: the violet band's "main action is black, since electric blue doesn't hold on violet".
  - *The brand pack*: "its one action is black there".
  - One second-choice white per view (decision 11-11, call 1).
  - **For the book:** decision 11-22 says "one white button under them". Either it or the book has to change. The page should match the other two bands.
- **Fix:**
  - `styles.css:841`: `.violet .btn.lime,.foot-news .btn` → `.violet .btn,.foot-news .btn`.
  - `styles.css:842`: the hover selector, the same way.
  - In `design/decisions.md` (11-22), "one white button" → "one button, black as on every violet band".

### BC-06 · medium · About's headline is the line without its gradient; its own share card has it
- **Where:** `/about/` at all widths: `div.doc-head h1` "No miracles. Just what happened.", plain `text`.
- **Selector:** `scripts/build_pages.mjs:92`, `docHead('About', 'No miracles. Just what happened.', …)`. The gradient rule lives only in `home.css:29` (`.sx-hero h1 em`), which About doesn't load.
- **Evidence:**
  - The front page h1 runs `rgb(61,139,255) → rgb(107,72,241) → rgb(154,160,244)`.
  - About's h1 is flat #F7F8FA.
  - `img/og/about.jpg` draws it with the gradient.
  - Image: `the-line-two-ways.jpg`.
- **Rule broken:** BRAND *Voice*: "Say it as written … in a headline its second sentence takes the punchline's gradient".
- **Fix:**
  - Move the rule in `home.css:29–30` to `styles.css` as `.punch{font-style:normal;color:var(--lime);background:linear-gradient(90deg,#3D8BFF 0%,#6B48F1 52%,#9AA0F4 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;-webkit-box-decoration-break:clone;box-decoration-break:clone}`, with its `forced-colors` line.
  - `index.html:76`: `<em>` → `<em class="punch">`.
  - `scripts/build_pages.mjs:92`: the title → `'No miracles. <em class="punch">Just what happened.</em>'`. The `stop()` at `:74` already ignores closing tags.
  - BRAND *Colour*, gradients: "the front page's punchline" → "the line's second sentence wherever the line is a headline". `design/baseline.json` gradient count +1.

### BC-07 · medium · Sig's ring beside Ask Sig in the top bar is 16px; on Ask Sig's tab bar it is 18px
- **Where:** the top bar of all 22 website pages that have one (every page but Ask Sig), at all widths. The ring is an icon button on a phone.
- **Selector:** `header.os-top a.os-top-sig > span > svg.ring`, 16×16. It comes from `scripts/build_library.mjs:202` `ringSvg(16)`; `index.html:63` and `404.html:47` carry the stamped copy.
- **Evidence:**
  - Ask Sig's `span.ai-sig.tm-logo > svg.ring` is 18×18 at every width.
  - Image: `sig-ring-16-vs-18.jpg`.
- **Rule broken:** the ring is 18px beside Ask Sig in the top bar and in Ask Sig's tab bar (this department's brief). The book doesn't say so yet.
- **Fix:**
  - `scripts/build_library.mjs:202`: `ringSvg(16)` → `ringSvg(18)`, then rebuild so `index.html`, `404.html` and every built page take it.
  - Add to BRAND *Iconography*: "18px beside Ask Sig in the top bar and in Ask Sig's tab bar".

### BC-08 · medium · Ask Sig: the Safety agent's edits and flags are signed in the Recommender's yellow
- **Where:** `/sig/` in a conversation, at all widths, on every answer the Safety agent edited or flagged.
- **Selectors:**
  - `ai/mind.css:107` `.a-check.edited svg{color:var(--a-recommender)}`: the ✎ in "the safety agent edited 1 part before you saw it".
  - `ai/term.css:211` `.tstep.flag .ts-st::before{content:'!';color:#F2BE4B}`: the flagged or fixed step's mark in "how I got here".
  - `ai/ai.css:113–114` `.tstep.flag/.fixed .tstep-dot{background:#F0A23B}`.
  - `ai/ai.css:160` `.cleared.edited svg{color:#F2BE4B}`.
- **Evidence:**
  - The pencil renders rgb(242,201,76), the Recommender's colour, beside the words "the safety agent".
  - The Safety agent's fixed step "Took out a dose someone named" has a #F2BE4B mark, while its unflagged step above it is coral.
  - `#F0A23B` sits 15° from the Planner's #FF9F4A.
  - Image: `asksig-answer-signatures.jpg`.
- **Rule broken:**
  - BRAND *Colour*: "`agent-*` only where that agent is named, speaks or made something".
  - "`safety` only for the Safety agent".
  - *The Sig system*: each agent signs only its own work.
- **Fix:**
  - `ai/mind.css:107` → `color:var(--a-safety)`.
  - `ai/term.css:211` → `color:var(--a-safety)`.
  - `ai/ai.css:113–114` → `background:var(--sig-safety)`.
  - `ai/ai.css:160` → `color:var(--sig-safety)`.

### BC-09 · medium · Ask Sig's answer cards: tinted tags in off-palette yellows and corals, white-tint grounds, and an error box in an off-token amber
- **Where:** `/sig/` in a conversation: the Synergy auditor's card and the picks, and the error state, at all widths.
- **Selectors (`ai/ai.css`):**
  - `:219–223`:
    - `.lvl` "worth checking" is `rgba(232,183,90,.12)` with `#F2C46B`;
    - `.lvl-avoid` is `rgba(224,104,92,.14)` with `#FFB4A9`;
    - `.lvl-info` is `rgba(255,255,255,.07)`;
    - `.lvl-unknown` has a dashed border.
  - `:197` `.pick-ev.ev-preclinical` uses `#F2C46B`.
  - `:170` `.oops`, the "can't answer" box, uses `#F2C46B` on an amber tint.
  - `:183`, `:286`, `:395` and `:552` (`.card.short/.intake/.voices/.compare .card-head`) are `rgba(255,255,255,.05)`, and `:213` `.audit` is `rgba(255,255,255,.04)`. They composite to #0D0D0D and #0A0A0A.
- **Evidence:** measured "Worth checking" `rgb(242,196,107)` on `rgba(232,183,90,.12)`. Images:
  - `asksig-answer-signatures.jpg`;
  - `asksig-error-1440.png`, where the error box reads "busy" in #F2C46B.
- **Rule broken:**
  - Decision 11-11, call 3: tags are "a `line-2` hairline … no tinted fills"; how serious a harm is goes "in its words and greys".
  - Decision 11-11, *Left for the founder*: the answer states were to be mapped "to `safety`, `down` and `amber`" once reviewed in a conversation. This is that review.
  - BRAND *Colour*: cards and plates are `surface-raised`.
- **Fix (`ai/ai.css`):**
  - `:219` → add `border:1px solid var(--line-2);background:transparent`.
  - `:220` `.lvl-avoid` → `color:var(--text)`.
  - `:221` `.lvl-caution` → `color:var(--text)`.
  - `:222` `.lvl-info` → `color:var(--text-2)`.
  - `:223` `.lvl-unknown` → `border-style:solid;color:var(--muted)`.
  - `:170` and `:197` `#F2C46B` → `var(--amber)`, the token Sig's concerned mood borrows.
  - `:183`, `:286`, `:395`, `:552` and `:213` → `background:var(--card)`.
  - Crisis and warning cards (`.card.warn`, `.warn-call`) are left alone, as the founder asked.

### BC-10 · medium · Ask Sig's blood markers name compounds in the Recommender's yellow and the Synergy auditor's cyan
- **Where:** `/sig/` with an answer, at all widths (the panel, and the sheet on a phone).
- **Selectors (`ai/mind.css`):**
  - `:232–233` `.rk-lines dt.p-up/.p-down`: "HGH ↑" in `var(--a-recommender)`, "Enclomiphene ↓" in `var(--a-synergy)`;
  - `:250–251` `.rk-tag.s-up/.s-down`: "hgh ↑" under each tube;
  - `:226–227` `.rk-state`;
  - `:239–240` the key's squares.
- **Evidence:** a compound's name reads as signed by an agent that didn't touch it. The rack is the Markers agent's work. Image: `asksig-answer-signatures.jpg`.
- **Rule broken:**
  - BRAND *Colour*: agent colours only where that agent is named or made something.
  - Decision 11-11, call 9: "blood markers are the Markers agent's teal".
- **Fix:**
  - `ai/mind.css:232–233` and `:250–251` → `color:var(--text)` for the names. The arrows ↑ and ↓ keep the direction.
  - Keep the up and down hues only on the tubes and the key's squares, as the prints do.
  - Write the exception into tokens.json `op-up` and `op-down` (see BC-28).

### BC-11 · medium · Ask Sig's answers keep the terminal look: a code comment as a label, padded step numbers, agent ids in lower case
- **Where:** `/sig/` with an answer, at all widths.
- **Selectors:**
  - `ai/ai.js:625` labels each card "`// ${who[1]}`", for example "// your stack, checked together";
  - `ai/ai.js:531` numbers the trace's steps `padStart(2, '0')` (01–07);
  - `ai/ai.js:540` shows the agent's id ("safety", "builder", "markers") in place of its name.
- **Evidence:**
  - The story page's run log of the same answer reads "1 Safety … 11 Builder", which is the same thing drawn two ways.
  - Image: `asksig-answer-signatures.jpg`.
  - `check_clean.mjs` doesn't reach an answer, which is how these stayed.
- **Rule broken:** BRAND *Clean, not costume*: "a code comment as a label (`// took it?`)", and padded numbers. No leftovers of the terminal theme. Overlaps with design-clean.
- **Fix (`ai/ai.js`):**
  - `:625`: `` text: `// ${who[1]}` `` → `text: who[1]`.
  - `:531`: `String(view.stepEls.size + 1).padStart(2, '0')` → `String(view.stepEls.size + 1)`.
  - `:540`: `text: AGENT_NAME[a] ? a : s.agent` → `text: AGENT_NAME[a] ? a[0].toUpperCase() + a.slice(1) : s.agent`, which gives the story's "Safety", "Builder" and so on.

### BC-12 · medium · The compound tiles carry the old earthy tints (sand, stone, sage, mist, clay)
- **Where:**
  - every community screen: side panel spaces, space cards, rail moves, the space hero, at all widths;
  - My stack's chips on the website when filled.
- **Selector:** `svg.tile.mh-tile` (initials and frame) from the kit:
  - `shared/kit/kit.js:104–115` (the community's source), copied to `web/kit/kit.js` and to the website's `kit/kit.js:104–115`;
  - `const BONE='#F7F8FA', SAND='#E8DCC4', STONE='#CED6D2', SAGE='#DAE2CA', MIST='#C9D3DC', CLAY='#E6CFC0'`, one per category.
- **Evidence (across all screens and widths):**
  - #DAE2CA (pale green): 402 strokes and 402 fills;
  - #E8DCC4 (beige): 395 and 395;
  - #CED6D2: 232;
  - #C9D3DC: 214;
  - #E6CFC0: 91.

  The kit's own comment says the category is always written beside the tile, so the tint carries nothing. Images: `comm-explore-top.jpg` and `comm-space-top.jpg` in `.design/work-brand-colour/`. "BPC" is visibly green on the space hero.
- **Rule broken:**
  - BRAND *Colour*: pages are black and near-white; colour only signs.
  - No leftovers of older themes (these are the paper theme's tints).
- **Fix:**
  - `shared/kit/kit.js:104` → `const BONE = '#F7F8FA';`.
  - `:115` → `export const catColor = () => BONE;`.
  - Drop the `CAT` map, then sync to `web/kit/kit.js` and the website's `kit/kit.js`, website first.
  - The initials are letters in Monaspace Neon 700, which is typography's call.

### BC-13 · medium · Community words dimmed by opacity under 4.5:1
- **Where (1440 and 390):**
  - home, popular, space, post and profile: the post-head separators;
  - explore: the family counts;
  - profile: the locked badges.
- **Selectors and contrast (`web/styles.css`):**
  - `:286` `.post-head .sep{opacity:.5}`: 2.13:1 on #000 and 2.19:1 on #121214.
  - `:698` `.tabs.fam .n{opacity:.7}` ("79", "22" …): 3.25:1.
  - `:492` `.bdg.locked{opacity:.55}`: "Three first-hand reports that say how long" at 2.40:1.
- **Evidence:** `contrast-comm/` and `comm-profile-locked.jpg`. This was BC-06 of 13 November and is still open.
- **Rule broken:**
  - Small text needs 4.5:1.
  - BRAND: `muted` "reads at 5:1 or better".
  - *Disabled*: controls "keep their words".
- **Fix:**
  - `:286` → `opacity:1`. Muted is 5.81:1.
  - `:698` → `opacity:1`.
  - `:492` → `.bdg.locked .seal{opacity:.55}`, so only the seal dims and the words stay `muted` at 5.18:1.

### BC-14 · medium · Every share card's kicker is Signal blue; pages keep kickers muted
- **Where:** every share image:
  - `og.jpg`;
  - `img/og-plan.jpg`;
  - the 156 in `img/og/`: "Peptide" over a fact sheet, "By goal", "About", "Ask Sig", "Peptides, without the sales pitch" …

  It also applies to the brand pack's posts and stories.
- **Selectors:**
  - `scripts/og_images.mjs:92` `.kick{…color:${C.lime}}`;
  - `design/pack/pieces.mjs:102` `color:${o.band ? C.text : C.lime}`.
- **Evidence:** `share-card-kickers.jpg`. The pages' kickers ("How it works", "Why it's different") are #7F8796.
- **Rule broken:**
  - tokens `kicker`: "muted (Signal blue over the Signal)".
  - BRAND *Colour*: Signal blue "only for the community and its Signal".
- **Fix:**
  - `scripts/og_images.mjs:92` → `color:${o.signal ? C.lime : C.muted}`, with `signal: true` only on the community's and the Signal's cards.
  - `design/pack/pieces.mjs:102` → `color:${o.band ? C.text : o.signal ? C.lime : C.muted}`.
  - Regenerate the cards.

### BC-15 · medium · Loading has no Sig: the front page shows a line and a dash, and the community shows "Loading…"
- **Where:**
  - the front page's Signal card while the Signal loads (all widths, every visit for a moment);
  - the community's first screen, its rail moves, quests, leaderboard and notifications.
- **Selectors:**
  - `index.html:133` `p.sx-sum` "Loading the live Signal", with the score as a white dash. No ring is drawn: the only SVGs in the hero then are the search icon and the arrows.
  - Community `web/index.html:68` `div.boot` "Loading…".
  - Community `web/ui/components/game.js:101` and `:120`, `moves.js:27`, `notifications.js:64`, `pages/quests.js:18` and `pages/notifications.js:11`: "Loading…" in muted, without Sig's think mood, which `checks.js:149` and `signal.js:212` already use.
  - Ask Sig rotates the whole ring (`ai/term.css:61` `[data-sig].is-spin svg{animation:tm-turn …}`).
- **Evidence:** `home-loading-1440.png`, `asksig-empty-1440.png`.
- **Rule broken:**
  - BRAND *Motion*: "While something loads, Sig's ring is the spinner: its pieces light one by one, with one plain line saying what's loading. No grey skeleton boxes."
  - BRAND *The Sig system*: "Loading: the ring is the spinner".
- **Fix:**
  - **Front page:** `index.html:133` → put the 18px ring (`ringSvg(18)`, as in the top bar) in front of the line, with a rule that lights its arcs one by one: `.sx-sum .ring .rg{opacity:.25;animation:rg-light 1.32s steps(1) infinite}`, each arc delayed by its index × 0.12s, and `@keyframes rg-light{0%{opacity:1}9%,100%{opacity:.25}}`. `home.js` replaces the line when the Signal arrives.
  - **Community:** use `sig(18, 'think')` beside each "Loading…".
  - **Ask Sig:** `is-spin` → the same arc lighting instead of the turn.

### BC-16 · medium · Fields stand on five different grounds
- **Where:** the top bar of every page in both apps, the front page, and Ask Sig.

  | Field | Ground |
  | --- | --- |
  | `styles.css:645` `.os-search` | `rgba(255,255,255,.03)` |
  | community `web/styles.css:99` `.search input` | `rgba(255,255,255,.03)` |
  | `home.css:34` `.sx-find .hp-line` | `var(--ink)` #000 |
  | `home.css:318` `.fp-sig .fp-askbox` | `bar` at 88% |
  | `ai/term.css:149` `.tm .ai-composer` | `var(--tm-bar)` #17171A |
  | Library search, selects, weekly field, community `.input` | `surface-raised` #121214 |

- **Rule broken:** BRAND *Colour*: "`surface-raised` is cards, plates, fields". The same thing is drawn five ways.
- **Fix:**
  - The first five → `background:var(--card)`. In the community, `var(--surface)`, which is #121214.
  - The violet band's field (`styles.css:847`) keeps its own ground.

### BC-17 · medium · `design/illustration.md` still describes the Miracle Health terminal era
- **Where:** it is the department's illustration system, which every agent holds pages against.
- **Lines:**
  - `:7` "the mark of Ask Sig and of every title bar". There are no title bars since November 12.
  - `:16` "Don't … use it as a loading spinner. It never spins." The book says "the ring is the spinner".
  - `:50` "set a print with … its file (`semaglutide.md`), its count ("9 of the body's 38 places · 12 lines")". That is a file name and a dot chain.
  - `:52` "on a graphite plate".
  - `:56` "the title bar with its tab (`semaglutide.md`), the path, the status bar with 'safety on'".
  - `:62` "the kicker and every number in Monaspace Neon".
  - `:63` "sign every piece in mono … `sig@miracle ~/story`, `miraclehealth.us`".
- **Rule broken:** BRAND *Clean, not costume*, *The frame* (no title bar, path or status bar), *Motion*, and *The brand pack* (one layout, no foot). This is a book finding: the doc is corrected, not the pages.
- **Fix:**
  - `:7` → "It is Sig's mark: Ask Sig's button, its page and tab bar, the spinner".
  - `:16` → "Its arcs light one by one while something loads; it never turns".
  - `:50` → "set a print with its name, its count in words and its evidence".
  - `:52` → "on `surface`".
  - `:56–57` → "show the real page, at real size and with real copy, cropped; never a mockup".
  - `:62` → "the headline in Mona Sans at 125% and 800, kickers in the body face, numbers in Monaspace Neon".
  - `:63` → "the logo and the address along the top, as *The brand pack* says; no foot".

### BC-18 · medium · The new emails underline links in Signal blue and draw their hairlines off the palette
- **Where:**
  - the weekly email (`scripts/build_pages.mjs`, `emailHtml`, generating `weekly/1/email.html`);
  - the sign-up email (the community's `supabase/functions/newsletter/index.ts`).

  Both were uncommitted and in progress during the audit.
- **Selectors:**
  - `emailHtml`'s `A`: `text-decoration-color:#3D8BFF`, on every link to fact sheets, status and compare.
  - Both emails' `border-top:1px solid #2A2A2E`.
- **Evidence:** the site's inline links are underlined at half white (decision 11-13, COMP-05). #2A2A2E is neither `line` (#1A1A1A on black) nor `line-2` (#333333).
- **Rule broken:**
  - BRAND *Colour*: Signal blue only for the community and its Signal.
  - Hairlines are `line` or `line-2`.
- **Fix:**
  - `A`: `text-decoration-color:#3D8BFF` → `#7C7C7D`, which is half of `text` on black, the site's underline as one opaque colour, since email clients drop rgba.
  - Both emails: `#2A2A2E` → `#1A1A1A`.
  - The line's flat Signal blue second sentence is the right fallback for email. Keep it.

### BC-19 · medium · The community's foot draws the brand's foot differently: logo 24px and no "Peptides, without the sales pitch."
- **Where:** every community screen and `comm-signin`, at all widths.
- **Selector:**
  - `web/index.html:71–83` `footer.foot`;
  - `web/styles.css:639` `.foot img{height:24px}` renders 131×24.
- **Evidence:** the website's foot logo is 142×26 under the weekly band, with "Peptides, without the sales pitch." under it. Image: `foot-logo-26-vs-24.jpg`.
- **Rule broken:**
  - BRAND *Logo*: "26px in a foot".
  - *Voice*: "Peptides, without the sales pitch." goes "under the logo in a foot".
- **Fix:**
  - `web/styles.css:639` → `height:26px`.
  - `web/index.html:74`: after the `img`, add `<p class="foot-what">Peptides, without the sales pitch.</p>`, styled as the website's `.foot-brand` line (`text`, 600).

### BC-20 · medium · Community outcome split: "about the same" and "worse" in old amber and red
- **Where:** `comm-space` and `comm-post` at all widths: the "How N first-hand reports went" bar and its key.
- **Selectors:**
  - `web/styles.css:775` `.split .s{background:#D4A72C}.split .w{background:#E0685C}`;
  - `:778` `.split-key .s::before/.w::before`, the same;
  - the old red and amber in `:30–31` `--neu:#F0CC6A`, `--neu-tint:rgba(212,167,44,.16)`, `--neg-tint:rgba(176,69,61,.22)` and `--red:#B0453D`.
- **Rule broken:** decision 11-11, call 13: "Better, same and worse are lime, `amber` (a mixed read) and `down` (a worse outcome), wherever members' outcomes are split."
- **Fix:**
  - `:775` and `:778` → `.s{background:var(--amber)}`, `.w{background:var(--neg)}`.
  - `:30` → `--neu:var(--amber);--neu-tint:rgba(232,183,90,.16);--neg-tint:rgba(255,154,142,.16)`.
  - `:31` → drop `--red` once nothing uses it.

### BC-21 · low · Off-token hairlines
- **Website:**
  - `rgba(255,255,255,.09)`:
    - the side panel's edge and dividers (`styles.css:578`, `:596`, `:598`, `:603`; Ask Sig's side uses the same rules);
    - the spectrum's rules (`home.css:195`).
  - `.07`: the "What we won't do" list (`home.css:576`, `:590`).
  - `.12`: the story's run (`styles.css:752` `.sy-term`).
  - `.14`: Ask Sig's question bubble and rack cards (`ai/mind.css:19`, `:221`).
- **Community:**
  - `.08`: the tape's lead (`web/styles.css:69`);
  - `.09`: the side panel, its family bar and its legal line (`:142`, `:167`, `:181`).
- **On the violet band:** two strengths, `.28` on the Join band's example (`home.css:299`) and `.42` on the weekly field (`styles.css:847`).
- **Rule broken:** hairlines are `line` or `line-2`.
- **Fix:**
  - All of these → `var(--line)`.
  - On violet, one value for both: `home.css:299` → `rgba(255,255,255,.42)`, written into tokens.json as `line-band`.

### BC-22 · low · Floating panels cast three different shadows
- **Selectors:**
  - `styles.css:682` `.cmdk{box-shadow:0 1px 2px rgba(0,0,0,.4),0 20px 50px rgba(0,0,0,.5)}`;
  - `home.css:44` `.sx-find .hp-drop{box-shadow:0 24px 48px rgba(0,0,0,.6)}`;
  - the token value, used by `ai/plan.css:119` and the community's `.sigsay`.
- **Evidence:** `cmdk-1440.png`, `home-search-results-1440.png`.
- **Rule broken:** tokens `shadow-float`, one value for "search results, menus, pickers, toasts".
- **Fix:** both → `box-shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px -14px rgba(0,0,0,.6)`.

### BC-23 · low · Ask Sig's Send is a flat blue with no light or glow
- **Selector:** `ai/mind.css:136–141` `.tm .ai-send{background:#1A04FF}`, hover `#3A2BFF`, disabled `#1A04FF`.
- **Evidence:** every other main action uses `--act` (the `#3A2BFF → #1A04FF` light) and the glow. Ask Sig's own age check "I'm 18 or older" does too. Image: `asksig-answer-1440.png`.
- **Rule broken:** BRAND *Colour*: the main action is "accent lit from the top by accent-hi … and a soft glow".
- **Fix:**
  - `:136` and `:139` → `background:var(--act);box-shadow:0 10px 30px rgba(26,4,255,.45),inset 0 1px 0 rgba(255,255,255,.22)`.
  - `:140` → `background:var(--act-2)`.
  - `:141` → `background:var(--act);box-shadow:none`.

### BC-24 · low · The community's live dot pulses with a growing box-shadow
- **Selector:** `web/styles.css:80–81` `.live-dot{box-shadow:…;animation:live …}` with `@keyframes live{…box-shadow:0 0 0 7px…}`.
- **Evidence:**
  - 2 to 7 dots per screen are caught mid-shadow in the capture.
  - The website's dot (`styles.css:88–98`) grows a clipped `::after` on transform and opacity, for the reason its comment gives (a growing box-shadow repaints every frame).
- **Rule broken:**
  - BRAND *Motion*: "The live dot pulses, fading on opacity only".
  - *Shape and depth*: shadows only for what floats.
- **Fix:** replace `:80–81` with the website's `.live i::before/::after` construction:
  - `.live-dot{position:relative}`;
  - `.live-dot::after{content:'';position:absolute;inset:0;border-radius:50%;background:rgba(61,139,255,.55);animation:live 1.8s ease-out infinite}`;
  - `@keyframes live{0%{transform:scale(1);opacity:1}70%,100%{transform:scale(3.3);opacity:0}}`.

### BC-25 · low · The profile's locked emblems use the old green-graphite; the emblem tiers borrow agents' hues
- **Selectors:**
  - Lock colours in `web/ui/art.js`:
    - `:59` `'#5E6664'`;
    - `:60` `'#3E4644'`;
    - `:69` the lock `fill="#1B2725" stroke="#5E6664"`, path `#A9B1AE`.
  - Tier colours at `:51` `TIERS`: Resonant `#7CF0DC`, near the Markers agent's teal, and Lodestar `#FFE07A → #F5A93F`, near the Recommender and the Planner.
- **Evidence:** `comm-profile-locked.jpg` (the path's 13 locked emblems).
- **Rule broken:**
  - No leftovers of older themes.
  - Agent hues only where the agent signs.
- **Fix:**
  - `:59` → `'#7F8796'` (`muted`).
  - `:60` → `'#28282D'` (`suede`).
  - `:69` → `fill="#1C1C20" stroke="#7F8796"`, path `#A1A7B2`.
  - Tier colours are a book decision: the book has none for emblems. Propose tiers from the Signal's own colours: `lime → signal-2`, `violet-light → lime`, `text → violet-light`.

### BC-26 · low · Two places where words sit on colour under the line
- **Home at 390, the spectrum's axis numbers over the bars:**
  - `span.sx-gv` "50" (10.5px `muted`) measures 2.24:1 on the bars.
  - The phone rule is `home.css:513`.
  - Image: `home-390-axis-label.jpg`.
  - Fix: at `:513` add `padding:0 3px;background:var(--ink)`. Muted on black is 5.81:1.
- **The foot's weekly band, small print:**
  - `.foot-news .nf-note` (13px white) measures 4.50 to 4.61:1 median, and 3.2 to 3.7:1 on the grain's lightest tenth, on every page.
  - The words sit past the band's middle, where it lightens.
  - Image: `weekly-band-note.jpg`.
  - Fix: `styles.css:840` linear stop `#9aa0f4 118%` → `#9aa0f4 140%`, then re-measure to 4.5:1 on the light tenth. BRAND: words "sit in its deeper part (4.5:1 and up)".

### BC-27 · low · The head: no share card on privacy and terms, and two theme colours
- **Share card:** `privacy.html` and `terms.html` have no `og:image`, `og:title` or `twitter:card`, so they don't fall back to the line's card (`og.jpg`) as every other page does. The 404 doesn't need one.
- **Theme colour:** `theme-color` is `#17171A` on the website (`scripts/build_library.mjs:310`, `index.html:9`, `404.html:10`, `privacy.html:9`) but `#000000` in the community (`web/index.html:21`). Both top bars are black at 84%.
- **Rule broken:** BRAND *Voice*: the line is "the share card every page falls back to". One frame, one set of colours.
- **Fix:**
  - Add the front page's `og:image`, its size tags, and an `og:title` to `privacy.html` and `terms.html`.
  - Set `theme-color` to `#000000` (`surface`) on the website (the four places above).

### BC-28 · low · The book, the tokens and the stylesheets' own notes disagree with what is built
- **Gradients:** BRAND *Colour*'s gradient list leaves out three that are built on purpose:
  - the Signal card's blue light (`home.css:255`), which the book itself calls "the Signal's clean, lit card";
  - the Noise card's suede light (decision 11-19);
  - the fade over Ask Sig's typing bar (`form#ai-form.ai-dock::before`).

  Add them.
- **`op-up` and `op-down`:** tokens.json defines them as the Recommender's and the Synergy auditor's colours, against the book's signature rule. Say so in the token's usage, as the prints' and the rack's key only, on a bead, tube or key square and never on a name or a word (see BC-10).
- **Costume-era wording in tokens.json:**
  - `size.title-bar`;
  - `tab`: "like a file's tab in an editor";
  - `spacing.pad`: "the path line";
  - `color.note`: "black, graphite and near-white".

  Rewrite them in the plain frame's terms.
- **Stylesheet notes from older themes:**
  - `styles.css:2–3`: "AlgoRx's look: deep green-black … one lime accent, photography, frosted glass cards".
  - `styles.css:16–17`: "Graphite … The one main action is white".
  - `styles.css:100`: "buttons: pills".
  - `styles.css:189` and `:249`: "frosted".
  - Community `web/styles.css:120`: "the one main action, white".

  Rewrite them, so nobody builds from them.
- **The `--accent` name:** `--accent` in both apps' CSS is #F7F8FA (`styles.css:28`, community `web/styles.css:29`), while the token `accent` is #1A04FF. It is used for focus and labels, so renaming it is safe: `--accent` → `--bone` at each use, then `--accent:var(--act-c)`.

---

## Systemic
What should be one thing everywhere but isn't, and the one value:

1. **The Signal's pieces:** one set, from the kit, in both apps.
   - The scale is `--scale` (Signal blue), not the community's red-amber-blue (BC-01).
   - Better, same and worse are `lime`, `amber` and `down` (BC-20).
   - A move down is `down` #FF9A8E, not #FF8A7A (BC-03).
   - The live dot pulses on opacity (BC-24).

   Move `scale()` and the split colours into `kit/kit.js` and `kit/kit.css` so they can't drift.
2. **Grounds:** fields on `surface-raised` (BC-16). Answer cards on `surface-raised`, not white tints (BC-09).
3. **Hairlines:** `line` and `line-2` only, plus one band hairline on violet (BC-21).
4. **Bar and meter tracks:** drawn at five strengths:
   - `.18` (`styles.css:112` `.bar`);
   - `.14` (`library.css:150` `.sig-scale`, `ai.css:67` `.saved-bar`, `styles.css:514` `.vs-bar .tr`);
   - `.12` (`library.css:159` `.use .bar`, `ai.css:426` `.crowd-bar`, community `div.bar`);
   - `.14` currentColor (community `scale()`).

   Add a `track` token at `rgba(255,255,255,.14)`, the most common, and use it for every track.
5. **The main action:** `--act` with the glow everywhere, including Ask Sig's Send (BC-23). One blue per view in the community too (BC-02, BC-04). The violet band's action is black on every band (BC-05).
6. **Agents' colours:** only on the agent's own name, step, gutter, pip or arc. Never on a compound's name, a level or another agent's edit (BC-08, BC-10). `op-*` hues only on beads, tubes and key squares.
7. **Kickers:** muted on pages, share cards and posts. Signal blue only over the Signal (BC-14).
8. **Loading:** Sig everywhere. On the website, the ring's arcs light one by one with one plain line. In the community, Sig's think mood with the line. Ask Sig's ring doesn't turn (BC-15).
9. **Step and run numbers:** plain "1", not "01" (BC-11). The front page's three steps set theirs in Signal blue (`home.css:243` `.st-n{color:var(--lime)}`), while How it works' six and Ask Sig's four sit in a box in `text`. One style: `muted`, or `text` in a box. This is low and visible on home and How it works.
10. **A compound row in search:**
    - the front page's results show "name · kind" with the evidence pip and word and the Signal pip and score at the right;
    - ⌘K shows "name · kind, strong evidence" with the mint pip at the left and no Signal.

    One row for both: the front page's.
11. **The foot:** the website's foot is the brand's. The community's should carry the same logo size and the same line under it (BC-19).
12. **Ask Sig's "current" ground:** `rgba(255,255,255,.08)`, the book's "8% `text` fill", in both apps' side panels. Write it into tokens.json as `current`, so it stops showing as off-palette.

## The next update, in this area
1. **One brand kit for states and pieces in both apps:** the loading line with Sig, the error line with Sig concerned in `amber`, the empty state, the Signal's scale and split, the compound tile and the live dot.
   - They go in `kit/kit.js` and `kit/kit.css` (the community's `shared/kit` first), so the two apps draw them from one place.
   - Pages: the front page's Signal card, the Library's live numbers, Ask Sig, and the community's boot, rail, quests, notifications, spaces and posts.
   - Why: every "drawn two ways" finding above in the Signal's pieces comes from each app keeping its own copy.
2. **Ask Sig in conversation, in the department's capture:** add the canned stream that `scripts/check_sig.mjs` uses to `scripts/design_capture.py` as an `asksig-answer` page, with an edited answer, an audit with all four levels, the error and the trace open, so every lead sees it each round.
   - Pages: `/sig/`.
   - Why: BC-08 to BC-11 and BC-23 lived only in states no capture opened, and decision 11-11 asked for this review a week and a half ago.
3. **Tokens for what is drawn ad hoc, enforced by the static check:**
   - `track` (.14);
   - `line-band` (.42 on violet);
   - `current` (8% text);
   - the composites for email (`line` #1A1A1A, underline #7C7C7D).

   Then make `scripts/design_check.mjs` fail any `rgba(255,255,255,x)` or `rgba(252,252,252,x)` literal that isn't a token.
   - Pages: all.
   - Why: the 26 white-alpha values in use today are where the off-palette count comes from, and where #FCFCFC keeps returning.
4. **The book brought up to the brand after its name:**
   - Rewrite `design/illustration.md` (BC-17).
   - Add to BRAND: the ring's 18px, the loading ring's lighting, the line's gradient wherever the line is a headline, the missing gradients, the `op-*` exception, and the violet band's black action on every band.
   - Clean the costume-era wording in tokens.json and the stylesheets' header notes (BC-28).
   - Regenerate the share cards with muted kickers (BC-14).
   - Pages: the brand pack and every share image.
   - Why: three of the department's documents still describe the terminal-era Miracle Health, and agents build from them.
5. **The community at phone width keeps its "Community" tag beside the logo:**
   - It is shown at 1440, 1024 and 768 (`span.tag`) and dropped at 390, where the bar then reads exactly as the website's.
   - Pages: every community screen at 390.
   - Why: on a phone, the tag is the only sign you're in the community rather than on the site.
