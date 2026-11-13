# Brand and colour: audit of 13 November 2026

**State of the area:** the website's text colours are all on-token and its contrast passes almost everywhere, and every focus ring checked is a solid 2px. But the one-main-action rule breaks on 7 website templates and on every community screen at phone and tablet width. The Evidence librarian signs its work in the studies' mint instead of its own blue. And the community still carries greys, glows and green tints from older themes.

**What was checked:**
- **Website:** 23 page templates (`design/pages.json`) at 1440, 1024, 768 and 390.
- **Community:** 15 screens (`design/pages-community.json`, the redone loaded captures, signed in), plus `comm-signin`.
- **Sources:**
  - the art director's capture in `.design/`;
  - my own live capture of every element on every page and width: text colour, background, all four border sides, SVG fill and stroke, opacity chain, shadow, filter (`/tmp/bc/live`);
  - `ds.EFFECTIVE_BG_JS` contrast on all pages at 1440 and 390;
  - Tab walks of home (1440 and 390), Ask Sig (1440), community home (1440) and the community sign-in;
  - `node scripts/design_check.mjs --list`.
- **Evidence:** in `.design/evidence/design-brand-colour/`.

**Two notes on the checklist's wording:**
- The checklist says "one white main action" and "evidence blue". Since 12 November the brand book makes the **main action electric blue** (`accent` #1A04FF lit by #3A2BFF). A white button is the second choice, one per view (decision 11-11, call 1).
- **The studies are mint** (`evidence` #14ECC3). The **Evidence librarian keeps its own blue** (`agent-evidence` #6FA8FE).
- I audited against the book and the decisions, and I say where the two disagree.

---

## Findings, most visible first

### BC-01 · high · Two white buttons in one view on 7 website templates
- **Pages:**
  - home;
  - every fact sheet (sheet-semaglutide, sheet-creatine, sheet-stub-5htp);
  - goal-weight (every goal page);
  - compare;
  - compare-pair (every pair);
  - weekly;
  - weekly-issue.
- **Widths:** all four. That makes 36 of the captured views.
- **Selectors:**
  - The sticky top bar's `a.btn.bone.sm.os-top-join` "Join" (`styles.css:434`, white #F7F8FA). The book says it is white.
  - In the same view, the page's own white action:
    - `button.btn.bone.sx-go` "Look it up" (`index.html:90`). Home also has the blue `a.btn.lime` "Share how it went" in that view, so home shows **2 white and 1 blue**.
    - `a.btn.bone.sm` "Ask Sig about {name}" (`scripts/build_library.mjs:604`). Fact sheets have no blue action at all.
    - `a.btn.ink` "Ask Sig about it", "Ask Sig to compare them" and "Compare others with Sig" (`scripts/build_pages.mjs:211`, `:301`, `:317`). Note that `.btn.ink` renders white.
    - `button.btn.bone` "Get it weekly" (`scripts/build_pages.mjs:28`, `signupForm`, the `on-paper` branch).
- **Evidence (y positions at 1440; Join is at y 12 on every page):**

  | Page | Page's white button | Its y |
  | --- | --- | --- |
  | home | "Look it up" (blue "Share how it went" at y 642) | 570 |
  | sheet-semaglutide | "Ask Sig about Semaglutide" | 408 |
  | sheet-stub-5htp | "Ask Sig about 5-HTP" | 302 |
  | goal-weight | "Ask Sig about it" | 533 |
  | weekly | "Get it weekly" | 502 |

  Images: `home-1440-top.jpg`, `sheet-semaglutide-1440-top.jpg`.
- **Rule broken:**
  - BRAND.md, *Colour*: "One main action per view: the electric blue button … A white button is the second choice".
  - Decision 11-11, call 1: one white button per view.
  - tokens `accent`: "Never two on a screen".
- **Fix:** make each page's own main action the electric blue one. Join keeps the white slot.
  - `scripts/build_library.mjs:604`: `class="btn bone sm"` → `class="btn lime sm"`.
  - `scripts/build_pages.mjs:211`, `:301`, `:317`: `class="btn ink"` → `class="btn lime"`.
  - `scripts/build_pages.mjs:28`: `cls.includes('on-paper') ? 'bone' : 'line'` → `cls.includes('on-paper') ? 'lime' : 'line'`.
  - `index.html:90`: `class="btn bone sx-go"` → `class="btn line sx-go"`. A hairline, because the hero already has its blue main action in view.
  - Checked: no page then shows two blues in one view. Goal-weight's other blue sits at y 4676.

### BC-02 · high · Two electric-blue main actions in one view in the community
- **Screens and widths:**
  - Every signed-in screen at 768 and 390 (all 15 screens, 30 views).
  - comm-account at all widths.
  - comm-new at 1440.
- **Selectors:**
  - The title bar's `a.btn.lime.sm.create` "Create" (`web/ui/shell.js:107`, `web/styles.css:132`).
  - At 860px and under, it sits beside the tab bar's `nav#tabbar a.make span.ic-wrap` "Share" (`web/styles.css:825`, `background:var(--act)`). Both go to `#/new`.
  - On account: Create plus `button.btn.lime.sm` "Text me when a check-in is due" (`web/ui/components/checks.js:224`).
  - On the new-post screen: Create plus the form's `button.btn.lime` "Post".
- **Evidence:**
  - At 390, Create is at (x 170, y 83) and Share at (x 174, y 790). At 768, Create is at y 66 and Share at y 846.
  - Each has the `act` gradient, and Create has the 0 10px 30px rgba(26,4,255,.45) glow.
  - Images: `comm-390-pair.jpg`, `comm-account-1440.jpg`.
- **Rule broken:** tokens `accent`, "The one main action per view … Never two on a screen". Also BRAND.md, *Colour*.
- **Fix.** Nothing is removed: Create stays in the title bar, and the tab bar keeps Share.
  - In `web/styles.css`, inside `@media (max-width:860px)`, add `.top-actions .create{background:transparent;border-color:var(--line-2);box-shadow:none}`. On phones, where the tab bar's Share is the main action, Create becomes a hairline.
  - The top bar isn't redrawn on a route change, so mark Create from the router. In `web/ui/router.js:74`, after `renderTabbar(…)`, add `document.querySelector('.top-actions .create')?.setAttribute('aria-current', r.name === 'new' ? 'page' : 'false');`.
  - Add `.top-actions .create[aria-current=page]{background:transparent;border-color:var(--line-2);box-shadow:none}`.
  - `web/ui/components/checks.js:224`: `'btn lime sm'` → `'btn ink sm'`. That makes it the white second choice.

### BC-03 · high · The Evidence librarian signs in mint, the studies' colour, not its own blue
- **Pages:**
  - home (the example run's log line, the signed answer's heading and gutter, the roster name and pip, the "$ open library" pip);
  - every fact sheet (signer names `span.h-by > b`, 5 per sheet at 1440; finding and study gutters, 8 and 7);
  - Ask Sig (the roster `li.tm-who > b` and the agent node);
  - story (agents list and run log);
  - the community's side panel at every screen. Its Library place mark is drawn in mint, where the website's is #6FA8FE.
- **Widths:** all.
- **Selectors:**
  - `styles.css:539` `[data-agent="evidence"]{--ac:#14ECC3}`;
  - `library/library.css:368` `.h-by b[data-agent="evidence"]{color:var(--sig-evidence)}`;
  - `ai/term.css:17` `--a-evidence:#14ECC3`;
  - community `web/styles.css:1008`, the Library mark's data-URI `stroke="#14ECC3"`.
- **Evidence:**
  - In the same roster row, the glyph is #6FA8FE (`lib/glyphs.js:11`) and the name is mint rgb(20,236,195). The 3D ring draws the agent #6FA8FE (`lib/ring.js:15`).
  - Mint and the Markers agent's teal #3FE0C5 are 1.4° of hue apart, at a luminance ratio of 1.09. In the roster and the run log the two agents read as one colour. The agent's own blue is 46° away.
  - Images:
    - `asksig-roster-evidence-vs-markers.jpg` (blue ladder glyph, mint name, teal Markers below);
    - `home-example-run.jpg` (rows 04 and 09);
    - `story-1440-run.jpg`;
    - `places-site-vs-community.jpg` (Library mark: blue on the site, mint in the community).
- **Rule broken:**
  - tokens `agent-evidence` #6FA8FE, "its own blue … the grades it signs are mint".
  - BRAND.md, *The Sig system*: "the Evidence librarian in its own blue (its grades and sources in mint)". Pip, log line and gutter are "in the signer's colour".
  - Decision 11-12, call 5: "Evidence librarian blue" gutters.
  - BRAND.md, *Iconography*: each glyph in its agent's colour.
- **Fix:**
  - `styles.css:539`: `[data-agent="evidence"]{--ac:#14ECC3}` → `{--ac:#6FA8FE}`.
  - `library/library.css:368`: `color:var(--sig-evidence)` → `color:#6FA8FE`.
  - `ai/term.css:17`: `--a-evidence:#14ECC3` → `--a-evidence:#6FA8FE`.
  - `ai/term.css:312`: `.tm .v-dot.v-studies{background:var(--a-evidence)}` → `{background:#14ECC3}`. The studies' verdict stays mint.
  - Community `web/styles.css:1008`: `stroke="#14ECC3" color="#14ECC3"` → `#6FA8FE`.
  - Leave mint on the grades: `.mh-meter`, `.hp-ev` (`home.css:60`), the radar's studied layer, the print's rungs.

### BC-04 · medium · Community: 300 hairline "Join" buttons per Explore view carry the main action's blue glow
- **Screens:** comm-explore (300 per width), comm-space (2), comm-post (1). All widths: 1,212 buttons in all.
- **Selector:** `button.btn.lime.sm.join`.
  - `web/styles.css:908`, `.btn.join.lime{background:transparent;border-color:var(--line-2);color:var(--text)}`, resets the fill but not the glow.
  - The glow comes from `web/styles.css:132`, `.btn.lime{box-shadow:0 10px 30px rgba(26,4,255,.45),inset 0 1px 0 rgba(255,255,255,.22)}`.
- **Evidence:** the computed `box-shadow` on every space-card Join is the main action's glow. A blue haze sits under each card. Images: `comm-explore-1440.jpg`, `comm-explore-join-glow-and-chip-counts.jpg`.
- **Rule broken:** BRAND.md, *Gradients and glows*. The glow belongs to the one main action only. *Shape and depth*: nothing else casts a shadow.
- **Fix:** `web/styles.css:908`, add `box-shadow:none` to `.btn.join.lime`.

### BC-05 · medium · Community text in off-palette greys and reds, mostly leftovers of the graphite theme's #FCFCFC
- **Screens:** 14 screens, all widths. 495 instances in total.
- **Instances:**

  | Value | Elements | Instances | Should be |
  | --- | --- | --- | --- |
  | `rgba(252,252,252,.4)` | `span.eq` in the status bar's ticker (`web/styles.css:74` `.tick-i .eq`); `b.num` (`:342` `.use.waiting .num`) | 279 + 12 | `muted` |
  | `#C2C6CD` | `div.excerpt`, every feed post (`web/styles.css:942` `.post.log .excerpt`) | 184 | `text-2` |
  | `rgba(252,252,252,.52)` | `span.use-meta` (`:345`) | 12 | `muted` |
  | `rgba(252,252,252,.5)` | `.uses .dim, .tools .dim` (`:338`), `.use .num .rng` (`:883`), `.search input::placeholder` (`:112`) | 4 + | `muted` |
  | `#FF8A7A` | `.tick-i .dn` (`:74`) | 4 | `down` |

  `.btn.on-ink` (`:136`) also has the border `rgba(252,252,252,.4)`.
- **Evidence:** the ticker's dash measures 3.59:1 on black, under 4.5. Image: `comm-ticker-eq-dn.jpg`.
- **Rule broken:**
  - BRAND.md, *Colour*: words are `text`, `text-2` and `muted`.
  - No leftovers of older themes: #FCFCFC is the graphite-era white.
  - `down` is the move-down colour.
- **Fix (`web/styles.css`):**
  - `:74`: `.tick-i .dn{color:#FF8A7A}` → `var(--neg)` (#FF9A8E); `.tick-i .eq{color:rgba(252,252,252,.4)}` → `var(--muted)`.
  - `:338`, `:342`, `:345`, `:883`: the `rgba(252,252,252,.4–.52)` colours → `var(--muted)`.
  - `:112`: placeholder → `var(--muted)`.
  - `:136`: border → `var(--line-2)`.
  - `:942`: `#C2C6CD` → `var(--text-2)`.

### BC-06 · medium · Community text under 4.5:1, from opacity on muted words
- **Screens:**
  - comm-home, popular, space, post, profile: separators. 63 per feed screen.
  - comm-explore: family counts.
  - comm-profile: locked badge descriptions.
  - comm-space: waiting numbers.
- **Widths:** 1440 and 390.
- **Contrast measured with `EFFECTIVE_BG_JS`:**

  | Element | Rule | Contrast |
  | --- | --- | --- |
  | `post-head > span.sep` "·" | `web/styles.css:269` `.post-head .sep{opacity:.5}` | 2.13:1 on #000; 2.19:1 on #121214 |
  | `.tabs.fam .n` ("79", "22" …) | `:670` `opacity:.7` | 3.25:1 |
  | `.bdg.locked` descriptions | `:474` `opacity:.55` | 2.40:1 on #121214 |
  | `.use.waiting .num` "—" | BC-05 | 3.76:1 |
  | `.tick-i .eq` | BC-05 | 3.59:1 |

  Image: `comm-explore-join-glow-and-chip-counts.jpg` (the counts).
- **Rule broken:** small text 4.5:1. BRAND.md: `muted` "reads at 5:1 or better". *Disabled*: "keep their words".
- **Fix (`web/styles.css`):**
  - `:269`: `opacity:.5` → `opacity:1`. Muted on black is 5.81:1.
  - `:670`: `opacity:.7` → `opacity:1`.
  - `:474`: `.bdg.locked{opacity:.55}` → `.bdg.locked .seal{opacity:.55}`, so only the seal dims and the words keep their colour (5.18:1).

### BC-07 · medium · Community: the title bar's search field shows no 2px focus ring; form fields show a 1px border and a halo
- **Screens:**
  - The search field `.search input`: every signed-in screen, all widths.
  - `.input`: sign-in, new post, account.
  - `.cpick-box`: new post.
- **Selectors:** `web/styles.css`:
  - `:111` `.search input{…outline:none}`;
  - `:113` `.search input:focus{border-color:rgba(255,255,255,.45);background:rgba(255,255,255,.06)}`;
  - `:508–509` `.input{…outline:none}` and `.input:focus{border-color:var(--text);box-shadow:0 0 0 3px rgba(255,255,255,.12)}`;
  - `:636` `.cpick-box:focus-within`, the same halo.
- **Evidence:**
  - On keyboard focus (`:focus-visible` true), the search field has `outline-style:none` and a 1px border at 45% white. That is about 4:1 on the bar, where the book asks 15:1.
  - The phone field shows a 1px white border and a 3px halo at 12%.
  - Every other stop in a 40-stop Tab walk of community home has the 2px ring. So does every stop on the website (home 1440 and 390, Ask Sig 1440: 2px #F7F8FA, 16.8–19.8:1).
  - Images: `comm-search-focus.jpg`, `comm-signin-input-focus.jpg`, `focus-home1440-sheet.jpg`.
- **Rule broken:** BRAND.md, *States and focus*: "every focusable thing gets a solid 2px `text` ring, 2–3px out".
- **Fix (`web/styles.css`):**
  - `:111`: delete `outline:none`, and add `.search input:focus-visible{outline:2px solid var(--text);outline-offset:2px}`.
  - `:508`: delete `outline:none`.
  - `:509`: `.input:focus{…box-shadow:0 0 0 3px rgba(255,255,255,.12)}` → `.input:focus-visible{outline:2px solid var(--text);outline-offset:2px;box-shadow:none}`.
  - `:636`: the same change for `.cpick-box:focus-within`.

### BC-08 · medium · Body map: the lit row and the pressed marker fill with Signal blue
- **Where:**
  - Every fact sheet, plus comm-space (the kit's body map), all widths, in its picked state.
  - The rows where two compounds meet use the same variable family (`tr.meet`).
- **Selectors:**
  - shared kit `kit.css:76` `--mh-bm-lit:color-mix(in srgb,var(--mh-lime) 42%,transparent)`, used by `.mh-bm-ln.lit` (`:100`) and `button.mh-bm-mk[aria-pressed="true"]` (`:97`);
  - `kit.css:75` `--mh-bm-meet` (lime 18%, `tr.meet`, `:111`).
  - Copies: `kit/kit.css` (website), `web/kit/kit.css` (community). The source is `shared/kit/kit.css` in miracle-health-community.
- **Evidence:** picking "Kidney function" fills the whole kidneys row, and the marker, with 42% Signal blue. Image: `bodymap-lit.jpg`.
- **Rule broken:**
  - "Signal blue (`lime`) only for the community and its Signal". The body map is the Library's.
  - "Never fill a button with a signature colour".
  - *Current*: "the `hover` ground (or an 8% `text` fill)".
- **Fix (`shared/kit/kit.css`, then sync both copies):**
  - `:76`: `--mh-bm-lit:color-mix(in srgb,var(--mh-lime) 42%,transparent)` → `--mh-bm-lit:rgba(247,248,250,.08)`.
  - `:75`: `--mh-bm-meet:…lime 18%…` → `rgba(247,248,250,.05)`.
  - Keep the 3px inset mark in `currentColor`.

### BC-09 · medium · Body map greys are derived from `currentColor`, not tokens, and its operator glyphs fall to 4.41:1
- **Where:** sheet-semaglutide and sheet-creatine, so every full fact sheet; comm-space. All widths. 448 off-palette instances on the two captured sheets.
- **Values:**

  | Elements | Value | Instances |
  | --- | --- | --- |
  | `dt`, `.mh-bm-op`, `li` words | `text` at 68% | 132 |
  | `.mh-bm-op` glyphs ▶ ▼ ▲ | `text` at 46% | 16 |
  | `a.mh-bm-src` chips (background) | `text` at 14% | 140 |
  | `.mh-bm-row` and `.mh-bm-mk` (borders) | 14% | 144 |
  | `.mh-bm-route` (border) | 9.5% | 16 |

  The source is shared kit `kit.css:71–72` (`--mh-bm-rule`, `--mh-bm-soft`, "so it reads on light and dark pages alike", a leftover of the light theme) and `:87` `.mh-bm-op{color:var(--mh-bm-soft)}`, which applies the soft mix twice.
- **Evidence:** contrast of ▶ ▼ ▲ is 4.41:1 at 12px, the only website text under 4.5 at 1440 and at 390. Image: `bodymap-lit.jpg`.
- **Rule broken:** words are `text`, `text-2` or `muted`. Hairlines are `line` or `line-2`. Small text 4.5:1. "One set of colours … whatever a device is set to".
- **Fix (`shared/kit/kit.css`, sync both):**
  - `:71` `--mh-bm-rule` → `rgba(255,255,255,.10)`.
  - `:72` `--mh-bm-soft` → `#A1A7B2` (`text-2`).
  - `:87` `.mh-bm-op{color:var(--mh-bm-soft)}` → `{color:#A1A7B2}`. That gives 8.7:1.

### BC-10 · medium · Kit compound tiles are drawn in five off-palette "tints of bone"
- **Screens:** 12 community screens (explore, home, popular, space, profile, quests, how, new, notifications …), all widths. 1,333 tile text and frame instances.
- **Tints:**

  | Name | Value | Instances |
  | --- | --- | --- |
  | SAND | #E8DCC4 | 390 |
  | SAGE | #DAE2CA, a green tint | 380 |
  | MIST | #C9D3DC | 242 |
  | STONE | #CED6D2 | 237 |
  | CLAY | #E6CFC0 | 84 |
- **Selector:** shared kit `kit.js:104` (`const BONE … SAND, STONE, SAGE, MIST, CLAY`) and `CAT` (`:105–110`), used by `tileSvg`. Copies are in `web/kit/kit.js` and `kit/kit.js`.
- **Evidence:** the tile initials "SE", "CE", "DI" are each a different tint. The kit's own comment says the category "is always written beside the tile", so the tint carries no information. Image: `comm-explore-join-glow-and-chip-counts.jpg`.
- **Rule broken:** "Pages are black and near-white … Never use colour as decoration." Off-palette.
- **Fix:** `shared/kit/kit.js:104–110`: map every category to `BONE` (#F7F8FA, `text`). Delete SAND, STONE, SAGE, MIST and CLAY. Then sync.

### BC-11 · medium · Community emblems borrow other agents' hues; locked emblems use the old green-greys
- **Screens:** comm-how (all 15 shown), comm-profile and comm-quests (when unlocked), and the confetti on celebrations. All widths.
- **Selectors:**
  - `web/ui/art.js:46` `TIERS`: Resonant `#7CF0DC`→`#3D8BFF`, which is mint-teal, the studies' and Markers' hue. Lodestar `#FFE07A`→`#F5A93F`, which is the Recommender's yellow and the Planner's orange.
  - Locked emblems: `art.js:54–55` `#5E6664`, `#3E4644`, and `art.js:64` `#1B2725` (green-black) and `#A9B1AE`. On comm-profile that is 13 locked emblems per view: 160 colour instances over four widths.
  - `web/ui/components/game.js:188`, the confetti: `#9CC2FF`, `#FCFCFC`, `#7CF0DC`, `#FFE07A`.
- **Evidence:** image `comm-how-emblem-tiers.jpg` shows blue, mint-teal and gold tiers.
- **Rule broken:** points are the community's (`lime`). "`agent-*` only where that agent is named". No old greens. Off-palette.
- **Fix:**
  - `art.js:46` → `[['#3D8BFF','#2E7BFF','Signal'],['#3D8BFF','#F7F8FA','Resonant'],['#F7F8FA','#A1A7B2','Lodestar']]`, so the tiers run blue, then blue to white, then white.
  - `art.js:54` `#5E6664` → `#7F8796`.
  - `art.js:55` `#3E4644` → `#1C1C20`.
  - `art.js:64` `#1B2725` → `#121214` and `#A9B1AE` → `#A1A7B2`.
  - `game.js:188` → `['#3D8BFF','#2E7BFF','#F7F8FA']`.

### BC-12 · low · Home, How it works step 05: the house rules' tags are drawn in the Safety agent's coral
- **Page:** home, all widths.
- **Selector:** `index.html:196`, step 05's `svg.hs-svg`:
  - `g[data-a="no0|no1|no2"] > rect` has `fill="#140707"` (a red-tinted ground) and `stroke="rgba(255,107,91,0.55)"`;
  - `text` has `fill="#FF6B5B"` ("ads", "sellers", "shop");
  - `line[data-a="x0|x1|x2"]` has `stroke="#FF6B5B"`.
- **Evidence:** image `home-step05-coral-tags.jpg`, from `home-howitworks-step05.jpg`.
- **Rule broken:** "`safety` only for the Safety agent and 'safety on'". These are moderation rules, not the Safety agent.
- **Fix:** `index.html:196`:
  - rect `fill="#140707"` → `fill="#0B0B0D"` (the drawing's own tag ground, as in step 02), and `stroke="rgba(255,107,91,0.55)"` → `stroke="rgba(255,255,255,0.22)"`;
  - text `fill="#FF6B5B"` → `fill="#7F8796"`;
  - strike lines `stroke="#FF6B5B"` → `stroke="#A1A7B2"`.

### BC-13 · low · Home: tinted signature frames and fills on two cards
- **Page:** home, all widths.
- **Selectors:**
  - The Signal card's foot chip `a.sx-studies` (`home.css:120`): border `rgba(20,236,195,.34)` (16 instances) and background `rgba(20,236,195,.06)` (4).
  - The "Signal, not noise" card `div.sn-card.sn-signal` (`home.css:181`): border `rgba(61,139,255,.4)` (16).
- **Evidence:** images `home-sx-studies-chip.jpg`, `home-signal-not-noise.jpg`.
- **Rule broken:**
  - Decision 11-11, call 3, and BRAND.md: tags are `line-2` hairlines with no tinted fills.
  - "Hairlines: `line` frames … cards … Neither carries meaning alone." The fact sheet's own evidence tag is a hairline with the mint meter.
  - The card's wash is a glow counted by decision 11-12, so it stays.
- **Fix:**
  - `home.css:120`: `border:1px solid rgba(20,236,195,.34)` → `border:1px solid var(--line-2)`, and `background:rgba(20,236,195,.06)` → `background:none`. Keep the mint meter.
  - `home.css:181`: `border-color:rgba(61,139,255,.4)` → `border-color:var(--line)`.

### BC-14 · low · Website hairlines outside `line` and `line-2`
- **Measured live, all widths:**

  | Alpha | Elements | Instances | Should be |
  | --- | --- | --- | --- |
  | .07 | home `tr`, `li`, `.vs-row` (`home.css:260`, `:325`, `:406`, `:442`) | 72 | `line` |
  | .12 | `.sy-term`, `.sy-status` (story), `.nf-shell` (404) (`styles.css:729`, `:762`, `:686`) | 48 | `line` |
  | .09 | `.sx-rule` (`home.css:139`); the side panel on every page: `.os-side`, `.os-ctx`, `.os-more`, `.os-foot` (`styles.css:549`, `:571`, `:573`, `:578`) | 18 captured, plus the panel everywhere | `line` |
  | .22 | `.sx-pt` (`home.css:106`) | 16 | `line-2` |
  | .08 | story `.sy-status>span` (`styles.css:763`) | 12 | `line` |
  | .14 | reference chips `a.ref` (`library/library.css:13`, background) | 164 | `line` |

  Meter tracks use four values: `.fp-bar` .12 (`home.css:268`), `.sig-scale` .14 (`library.css:150`), `.bar` .18 (`styles.css:96`), `.fp-mix-bar` .22 (`home.css:248`). They should be one value, `line-2`.
- **Rule broken:** BRAND.md, *Hairlines*: `line` frames, `line-2` controls. The checklist: hairlines are `line` or `line-2`.
- **Fix:** each value above → `var(--line)` or `var(--line-2)` as listed. All tracks → `var(--line-2)`.

### BC-15 · low · Grounds outside the four ground tokens (top bar, search field, community bars)
- **Website:**
  - `header.os-top`: `rgba(0,0,0,.84)` with a blur (`styles.css:608`), 84 instances on 21 pages.
  - `button.os-search`: `rgba(255,255,255,.03)` (`styles.css:611`), 63 on 21 pages. The Library's own search field is `surface-raised` #121214, so the two search fields differ.
  - `p.rose-empty`: `rgba(0,0,0,.85)` (`library/library.css:122`, sheet-stub-5htp).
- **Community (`web/styles.css`):**
  - `.search input`: `rgba(255,255,255,.03)` (`:111`, 30 instances), with border .12 (120).
  - `.sim`: .03 (`:720`).
  - `nav#tabbar`: `rgba(0,0,0,.97)` (`:822`, 30).
  - `.notif.unread`: .07 (`:496`).
  - `.hero-stats`: .02 (`:705`).
  - `.season-mini .bar`: .12 (`:198`).
- **Rule broken:** BRAND.md, *Grounds* (surface, side, bar, surface-raised; fields on `surface-raised`).
- **Fix:**
  - Website:
    - `styles.css:608` `background:rgba(0,0,0,.84)` → `var(--os-page)`;
    - `styles.css:611` `background:rgba(255,255,255,.03)` → `var(--card)`;
    - `library.css:122` → `var(--paper)`.
  - Community:
    - `:111` → `background:var(--surface);border:1px solid var(--line-2)`;
    - `:720` → `var(--surface)`;
    - `:822` → `var(--os-page)`;
    - `:496` → `var(--surface-3)`;
    - `:705` → `none`;
    - `:198` → `var(--line-2)`.

### BC-16 · low · Community better, same and worse are drawn in the old amber and the old red; the move flashes are off-token
- **Screens:** comm-space (`div.split`, all widths), the Signal flashes, `--neu` users.
- **Selectors:** `web/styles.css`:
  - `:747` `.split .s{background:#D4A72C}.split .w{background:#E0685C}`;
  - `:750` `.split-key .s::before`, `.w::before` (the same values);
  - `:27` `--neu:#F0CC6A`, `--neu-tint:rgba(212,167,44,.16)`, `--neg-tint:rgba(176,69,61,.22)`;
  - `:28` `--red:#B0453D`;
  - `:362` `@keyframes fup{color:#9CC2FF}` and `:363` `fdn{color:#FF7A6A}`.
- **Evidence:** live backgrounds rgb(212,167,44) and rgb(224,104,92) on comm-space (4 each).
- **Rule broken:**
  - Decision 11-11, call 13: better, same and worse are `lime`, `amber` and `down`.
  - BRAND.md, *Motion*: "flashes once, blue up, coral down".
  - #E0685C reads as the Safety agent's coral.
- **Fix:**
  - `:747` and `:750`: `#D4A72C` → `var(--amber)` and `#E0685C` → `var(--neg)`.
  - `:27`: `--neu:#F0CC6A` → `#E8B75A`; the tints → `rgba(232,183,90,.16)` and `rgba(255,154,142,.16)`.
  - `:28`: delete `--red`.
  - `:362`: `#9CC2FF` → `var(--lime)`.
  - `:363`: `#FF7A6A` → `var(--neg)`.

### BC-17 · low · Ask Sig's 18+ gate is a glass card with off-token hairlines
- **Page:** asksig and ai, every first question, all widths.
- **Selectors:**
  - `ai/ai.css:360` `.gate{border:1px solid rgba(255,255,255,.35);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))}`;
  - `ai/ai.css:368` `.gate-no{border:1px solid rgba(255,255,255,.25)}`.
- **Evidence:** live after asking a question, the gate's computed `background-image` is the gradient above, with the .35 border. Images: `asksig-agegate-1440.jpg`, `asksig-agegate-390.jpg`.
- **Rule broken:** gradients are only for the Signal's bar, the main action and the window's ground. Hairlines are `line` or `line-2`. The "frosted glass cards" are an older look.
- **Fix:**
  - `ai/ai.css:360`: `border:1px solid rgba(255,255,255,.35);background:linear-gradient(…)` → `border:1px solid var(--line);background:var(--card)`.
  - `ai/ai.css:368`: `rgba(255,255,255,.25)` → `var(--line-2)`.
  - The same glass is on `.saved-box` (`ai/ai.css:55`): apply the same fix.

### BC-18 · low · Glows and shadows outside the allowed set
- **Website:**
  - The picked spectrum bar has `filter:drop-shadow(0 0 10px rgba(61,139,255,.75))` (`home.css:146`, `.sx-bar[aria-pressed="true"]`). Decision 11-12 counted only the picked bar's cap and the floor. The design check does not see filters.
  - Ask Sig's `span.crowd-dot` has a halo, `box-shadow:0 0 0 4px rgba(61,139,255,.14)` (`ai/ai.css:472`).
  - Floating panels use off-token values:
    - ⌘K `.cmdk`: `0 1px 2px rgba(0,0,0,.4),0 20px 50px rgba(0,0,0,.5)` (`styles.css:648`);
    - home's open search `.sx-find .hp-drop`: `0 24px 48px rgba(0,0,0,.6)` (`home.css:42`).
- **Community:**
  - The checked segment `.seg label:has(input:checked){box-shadow:var(--shadow)}` (`web/styles.css:517`). It is not floating.
  - `.live-dot` pulses a `box-shadow` ring (`:77–78`). The website moved to an opacity and transform pulse (`styles.css:81–82`).
  - `dialog.modal`: `box-shadow:0 30px 80px -20px rgba(0,0,0,.45)` (`:559`).
- **Evidence:**
  - Image `home-spectrum-picked-bar.jpg`.
  - Computed live: on comm-new, `label` shadow `rgba(0,0,0,.4) 0 1px 2px, rgba(0,0,0,.6) 0 10px 30px -14px`; `.live-dot` box-shadow rings measured mid-pulse on all 15 screens.
- **Rule broken:**
  - *Shape and depth*: only what floats (`shadow-float`) and the drawer (`shadow-drawer`).
  - *Motion*: the live dot fades on opacity only.
- **Fix:**
  - `home.css:146` → `filter:none`.
  - `ai/ai.css:472` → `box-shadow:none`.
  - `styles.css:648` and `home.css:42` → `box-shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px -14px rgba(0,0,0,.6)`.
  - `web/styles.css:517` → `box-shadow:none;background:var(--surface-3)`.
  - `web/styles.css:77–78` → port `.live i::after` from the website (`styles.css:81–82`, `transform`/`opacity` keyframes).
  - `web/styles.css:559` → `box-shadow:var(--shadow)`.

### BC-19 · low · Community: the current filter chip and three tags are filled white
- **Screens and selectors:**
  - comm-explore, all widths: `.tabs a[aria-current=page]{background:var(--bone);color:var(--on-bone)}` (`web/styles.css:601`). With "Find your stack" (`a.btn.ink.sm`, also white), that makes 2 white fills in one view.
  - comm-post: "OP", `span.chip.ink` (`:231`).
  - comm-account: the role chip "moderator", also `.chip.ink`.
  - moderation: target kinds, also `.chip.ink`.
- **Evidence:** image `comm-explore-1440.jpg`. The website's pressed chip ("All" on the Library and Ask Sig) is an 8% text fill.
- **Rule broken:**
  - *Current*: hover ground or 8% text fill.
  - One white button per view.
  - Tags are hairlines with no fills (decision 11-11, call 3).
- **Fix:**
  - `web/styles.css:601` → `background:rgba(247,248,250,.08);color:var(--text);border-color:var(--line-2)`.
  - `:231` `.chip.ink` → `background:none;color:var(--text);border-color:var(--line-2)`.

### BC-20 · low · Leftovers of older themes in code (green-black, old red, light fallbacks, pure white, stale comments)
- **Community:**
  - `dialog.modal::backdrop{background:rgba(8,12,11,.55)}` (`web/styles.css:560`). This is the old deep green-black. The other scrims are `rgba(0,0,0,.55)`.
- **Shared kit:**
  - `--mh-red:#B0453D` (`kit.css:11`), which is unused.
  - The `.mh-chip` fallback `rgba(0,0,0,.05)` (`kit.css:41`), a light-ground value.
- **Website:**
  - Hover words in pure #FFFFFF instead of `text`:
    - `.btn.line:hover` (`styles.css:437`);
    - `.vs-sub a:hover` (`:474`);
    - `.foot-links a:hover` (`:491`);
    - `.pg-terms summary:hover` (`pages/pages.css:38`);
    - `.sx-howto:hover` (`home.css:72`).
  - The ground `.sy-status{background:#000000}` (`styles.css:762`).
  - Stale headers that describe a look the site no longer has: `styles.css:2–6` ("AlgoRx's look: deep green-black … one lime accent"), `styles.css:15–20` and `:87` (".btn.lime is the one main action, now white"), and community `web/styles.css:2–4`, `:15–18` and `:131`.
- **Rule broken:** no leftovers of older themes; no opaque #000 or #FFF where a token is meant. *Hover*: "hairlines brighten to `text`".
- **Fix:**
  - `web/styles.css:560` → `rgba(0,0,0,.55)`.
  - `kit.css:11`: delete `--mh-red`.
  - `kit.css:41`: `rgba(0,0,0,.05)` → `transparent`.
  - The five hovers: `color:#FFFFFF` → `color:var(--text)`.
  - `styles.css:762`: `background:#000000` → `var(--os-page)`.
  - Rewrite the comments to "black and electric blue; the one main action is electric blue (`.btn.lime`); white is the second choice". Keep `.my-qr-code{background:#FFFFFF}`, which is needed for scanning.

### BC-21 · low · The brand book and tokens disagree with what was decided or built
This is a book finding: the book is corrected, not the pages.
- **BRAND.md, *Colour*, "Gradients and glows only for the Signal's scale bar, the main action and the window's ground":**
  - Decision 11-12 counted more glows. These remain: the spectrum's floor, the picked bar's cap, the "Signal, not noise" card's wash and the open search's panel.
  - **Correction:** list those four. The ring's halo and sweep were removed on 11-13.
- **BRAND.md, *Colour*, "Mint (`evidence`) only for … the Library's mark":**
  - The website draws the Library's mark as the Evidence librarian's ladder in #6FA8FE, following *Iconography*: "each in its agent's colour".
  - **Correction:** delete "the Library's mark" from the mint list (see BC-03).
- **tokens.json `amber.usage`, "(with on-accent words, 10:1)":** `on-accent` is now #FFFFFF, which would be 1.85:1. The banner is built with black words at 11.35:1.
  - **Correction:** "(with `surface` words, 11.3:1)".
- **BRAND.md, *Logo*:** gives no top-bar size. The plain frame's top bar sets it at 22px on 21 pages.
  - **Correction:** "22px in the top bar and the side panel".
- **tokens.json `shadow-drawer.usage`, "…on a phone":** since 11-12 the panel slides in over the page at every width.
  - **Correction:** "at every width".
- **The print's operation beads reuse agent hues on purpose (tokens `op-up` = Recommender yellow, `op-down` = Synergy cyan, `op-block` = Mechanism purple):** the book's signature rule says `agent-*` only where that agent is named. These are visible on every fact sheet's print legend.
  - **Correction:** note the beads as the one sanctioned reuse in *Colour*.
- **Code names contradict the tokens:**
  - In both apps `--accent` is #F7F8FA (`styles.css:26`, `web/styles.css:26`), while `accent` in tokens.json is #1A04FF.
  - `--white` is #121214, a card (`styles.css:24`).
  - `.btn.ink` is white.
  - **Correction:** see *Systemic*.

---

## Palette map (`ds.nearest_token`, live capture, all widths)

**Website (23 pages × 4 widths):**

| Kind | Checked | Off-palette |
| --- | --- | --- |
| Text | 20,513 | 151 (body map 148, Signal tag tints 3) |
| Backgrounds | 8,704 | 1,131 |
| Borders, every side | 25,777 | 646 |

- Of the 1,131 backgrounds: Signal part tints `sx-p1/p2/p3` 624, body map 140, rest 367.
- The 8 current-chip fills (8%) are the book's sanctioned "8% text fill" and are not findings.
- Of the 646 borders, 288 are Ask Sig's agent nodes, each agent's own colour at 65%. These are accepted, except the Evidence librarian's node in mint (BC-03). Body map 160, hairlines 182, tinted card frames 32.
- SVG drawing shades (about 5,700) follow "drawn depth … in the drawing's own shades" and are not counted, except where a signature is misused (BC-12).
- Groups and fixes: BC-08, BC-09, BC-13, BC-14 and BC-15. The Signal's four part tints have no tokens (see *The next update*).

**Community (15 screens × 4 widths):**

| Kind | Checked | Off-palette |
| --- | --- | --- |
| Text | 21,010 | 503 (BC-05 495, body map 8) |
| Backgrounds | 4,650 | 178 (sanctioned current fills 50; rest in BC-15, BC-16, BC-19) |
| Borders | 18,166 | 392 (BC-14-style hairlines .08, .09 and .12: 360; outcome chip lime .42: 16; danger: 16) |
| SVG | | tiles 1,333 (BC-10); emblems 164 (BC-11: 160 lock colours, 4 Lodestar) |

**Static check (`design_check.mjs --list`):**
- Colour hits total 148: `ai/packet.css` 66 (its light paper look was left for the founder on 11-11), `ai/ai.css` 45, `ai/screen.css` 28, `ai/term.css` 8 (4 of them print-only), `kit.css` 1.
- Gradients 32, shadows 32.
- These sit almost all in Ask Sig's conversation states, which the captures don't reach. Of them, the gate (BC-17) and the crowd dot (BC-18) were driven live and verified.
- The check does not read `rgba(255,255,255,x)` hairlines, `filter:`, colours drawn in JS or HTML (`index.html` SVGs, `kit.js`, `art.js`), or the community's stylesheet.

**Logo and marks, verified (no finding except BC-03):**
- Wordmark: 22px in the side panel (website, Ask Sig, community), 24px in every foot, 22px in the top bar. Never under 20px.
- Sig's ring: 18px in Ask Sig's title bar and the community's title bar at all four widths.
- Glyphs: every website glyph is stroked in its agent's colour (checked by `data-g` against `agent-*`).
- Signature colours: no button is filled with a signature colour in any captured state.

---

## Systemic

1. **Hairlines.** The website's borders use 25 different white alphas (.05 to .65), and the community's use 6. The book has two hairlines and one hover state.
   - **Standardise:** frames and dividers `var(--line)`, controls `var(--line-2)`, hover `var(--text)`.
2. **Hover and current grounds.** Row hover is `rgba(255,255,255,.05)` in 9 website rules and 3 community rules, never the `hover` token. "Current" is an 8% fill on the website and a solid white fill in the community.
   - **Standardise:** hover is `var(--hover)` (#1C1C20). Current is `rgba(247,248,250,.08)`; add it to tokens.json as `current`.
3. **The main action.** Each view has one electric-blue `.btn.lime`. The bar's persistent action takes the second place: on the website Join is white; in the community Create is a hairline wherever the page or the tab bar has its own blue.
4. **Agent colours.** They are written down at least 6 times (`styles.css:537–539`, `ai/term.css:16–19`, `lib/ring.js:14–15`, `lib/glyphs.js:10–11`, `lib/how.js:20`, and the community's data-URI marks), and the copies disagree on the Evidence librarian.
   - **Standardise:** one table, tokens.json `agent-*`.
5. **Code names.** `--accent` is white in both apps, `--white` is a card, `.btn.lime` is electric blue and `.btn.ink` is white.
   - **Standardise:** names follow tokens.json. `--accent:#1A04FF`, `--accent-hi:#3A2BFF`, `--surface-raised:#121214`. The old `--accent` uses become `--text`.
6. **Float shadow.** There are four values: `.cmdk`, `.hp-drop`, `dialog.modal`, and `shadow-float` itself.
   - **Standardise:** `shadow-float` everywhere.

## The next update, in this area

1. **One tokens file for both apps.**
   - Generate `tokens.css` from `design/tokens.json` (colours, `agent-*`, `current`, shadows). The website, the community and the shared kit all import it.
   - Make `design_check.mjs` fail on any colour literal outside that file, including JS- and HTML-drawn markup (`index.html` drawings, `kit.js`, `art.js`, `lib/how.js`), `filter:` glows and `rgba(255,255,255,x)` hairlines.
   - Run it on the community repo too. Today the check can't see 503 off-palette text colours there.
   - **Touches:** every page.
2. **Name the Signal's four part tints.** `sx-p1`, `sx-p2` and `sx-p3` are Signal blue mixed 68%, 44% and 22% with white: 624 instances on home, also used by the ring card's tags and the 3D ring's walls. Add them as `signal-what`, `signal-agree`, `signal-voices` and `signal-volume`, so the spectrum, the card and the ring share them by name.
   - **Touches:** home, the Signal card, `lib/sighero.js`, `lib/ring3d.js`.
3. **Bring the community onto the website's colour rules in one pass.** That covers:
   - one main action per view with the tab bar (BC-02);
   - the website's current chip and hairline tags (BC-19);
   - the opacity live dot;
   - the Evidence librarian's blue;
   - no graphite-era greys (BC-05).

   This lets community and website screens sit side by side without a seam.
   - **Touches:** all 15 community screens.
4. **Review Ask Sig's conversation states for colour.**
   - Cover the gate, the saved box, the answers' caution shades (#F2BE4B, #F2C46B, #FFB4A9), and the screen pane's green-tinted #0A0E10 and #86948A.
   - This is the decisions log's open follow-up, and 81 of the 148 static colour hits outside the packet live there.
   - Map them to `safety`, `down` and `amber` after the founder's review of the crisis card.
   - **Touches:** asksig, ai, plan.
5. **Emblems drawn only in the Signal's blues and white.** Tell the tiers apart by frame and glyph, not by borrowed agent hues (BC-11), so points stay the community's own colour.
   - **Touches:** comm-how, profile, quests, builders, and the title bar's points chip.

**Image paths:** all images named above are in `.design/evidence/design-brand-colour/`.
