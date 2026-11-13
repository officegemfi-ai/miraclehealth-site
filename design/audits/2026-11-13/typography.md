# Typography: audit report

**State of the area:** the website's and the community app's stylesheets use only the three faces and every headline renders wide, but the type doesn't speak with one voice. Kickers have five treatments and none meets the rule. The h1 has six sizes across page types and the two apps, and Ask Sig's headline is in the narrow semibold cut. Every headline is tracked -0.022em. Running text reaches 105–174 characters a line on every page's foot, the fact sheets and the community feed. The community sets its labels and status bar in tracked capitals and draws five glyphs in system fonts, its domain's root page is set in Unbounded and the system face, and on Apple devices the website's ⌘ falls back too. The front page sets its measured numbers in Mona Sans.

**How it was measured:**
- **The art director's capture** of every page at 1440, 1024, 768 and 390.
- **My own live pass** of all 23 website pages and the 16 community screens at the same widths (`.design/work-typography/live.py` with `collect.js`):
  - each page was scrolled through so what plays in as it comes into view was there;
  - the community was signed in, the feed loaded and the welcome card closed;
  - the sign-in screen was taken again once it had finished loading, so no loading state is reported.
- **What the pass recorded** for every element with text: computed type, `text-wrap`, `font-variant-numeric`, its `::before`, and the characters on each rendered line.
- **The faces Chrome actually drew:** at 1440 and 390, a CDP pass (`CSS.getPlatformFontsForNode`) named the face behind every text node and pseudo-element, and the fonts' own character sets (fontTools) showed which characters neither font has.
- **Other states:**
  - the side panel opened at 1440 and 390;
  - the ⌘K palette;
  - every page as an Apple device sees it (`navigator.platform` set to Mac, so the keys read ⌘K).
- **The fixes:** the main ones were tried in the live pages with injected CSS (`verify_fixes.py`). Nothing in the repo was edited.
- **Where things are:** the scripts are in `.design/work-typography/` and the evidence in `.design/evidence/design-typography/`. Line numbers are as of this branch.

---

## Findings (most visible first)

### TYPE-01 · high · Kickers have five treatments, and none is the rule
- **Where:**
  - website: 18 page types (26 kickers at 1440, eight of them on Home), at every width;
  - community: the page-head kickers on 14 screens plus the sign-in.
- **Selectors and evidence:**

  | Where | Rule | Size · weight | Tracking | Case | Lead |
  |---|---|---|---|---|---|
  | `.kick`: about, compare, compare pair, founders, goals, goal, method, privacy, terms, status, weekly, weekly issue, the 3 fact sheets, library, 404, home's 8 section kickers | styles.css:73, :422, :423 | 11px · 400 | .09em (0.99px) | caps | the text `// `, no rule |
  | home hero `.sx-kick` ("the community signal · live") | home.css:24 | 12px · 400 | .09em | caps | live dot, no rule |
  | home How it works `.hs-kick` | home.css:603 | 11px · 400 | .09em | caps | live dot, no rule |
  | story `.sy-k` | styles.css:706, :707 | 12px · 500 | .12em | **lowercase** | 28×1px rule at .75 |
  | community page heads (`.page-h/.feed-hero/.hero/.auth-* .kick`) | web/styles.css:51, :913, :914 | 11.5px · 500 | .09em (1.035px) | caps | 28×1px rule at .75 |

  Image: `.design/evidence/design-typography/kickers@1440.png`.
- **Rule broken:**
  - the brief: kickers are mono capitals at 0.12em, led by a 28px rule at 75% opacity;
  - decisions, Nov 12 "Black and electric blue": kickers are capitals.
- **Fix:**
  1. styles.css:73 `.kick{font:400 11px/1.4 var(--mono);letter-spacing:.09em;text-transform:uppercase}` → `.kick{display:flex;align-items:center;gap:12px;font:500 12px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}`.
  2. styles.css:422 `.kick{display:block}` → delete.
  3. styles.css:423 `.kick::before{content:'// '}` → `.kick::before{content:'';flex:none;width:28px;height:1px;background:currentColor;opacity:.75}`.
  4. The story's kickers:
     - styles.css:706 `.sy-k{…}` → add `text-transform:uppercase`;
     - or give them the class `kick` and delete :706–707.
  5. home.css:24 `.sx-kick` and :603 `.hs-kick`:
     - `font:400 12px/1.4 var(--mono);letter-spacing:.09em` (:24) and `font:400 11px/1 var(--mono);letter-spacing:.09em` (:603) → `font:500 12px/1.4 var(--mono);letter-spacing:.12em`;
     - add `.sx-kick::before,.hs-kick::before{content:'';flex:none;width:28px;height:1px;background:currentColor;opacity:.75}`, so the order is rule, then live dot, then words.
  6. web/styles.css:913: add `font:500 12px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase` to that rule (its list is the page-head kickers).
  7. Every other community `.kick` is a label: see TYPE-04, fix 1.
- **Check:** verified live with fixes 1–3: the about kicker reads ABOUT at 12px, .12em, led by the rule.

### TYPE-02 · high · The page's h1 isn't one style across page types and the two apps
- **Where:** Ask Sig, the Library on a phone, every community screen.
- **Evidence:** the h1 at 1440 / 1024 / 768 / 390.

  | Page type | Size | Weight · width · tracking · leading | Rule |
  |---|---|---|---|
  | 19 website page types (doc pages, fact sheets, library, 404, My Miracle, plan) | 32.78 / 27.79 / 26 / 26 | 800 · 125% · -0.022em · 1.04 | styles.css:62 |
  | Library on a phone | 34.65 at 390 (and "IT." alone on the last line) | same | library.css:331 |
  | **Ask Sig**: the visible headline is `h2.ai-title` (its h1 is the 12px mono "Ask Sig") | **48 / 34.82 / 34 / 34** | **600 · 100% (normal width)** · -0.026em · 1.02 | ai/ai.css:39 |
  | community, 12 screens | **40.9 / 29.08 / 27.5 / 27.5** | 800 · 125% · -0.022em · 1.02 | web/styles.css:203, :794 |
  | community profile | 29 / 29 / 29 / 29 | | web/styles.css:481 |
  | community space | 31 / 31 / 24 / 24 | | web/styles.css:401, :820 |
  | community in-page h2 | 19 fixed; 20.5 (`.takeover-card h2`); 22.5 (`.top-head h2`) | website: 18.19 / 17 / 17 / 17 | web/styles.css:204, :717, :969, :680 |

  Images:
  - `.design/evidence/design-typography/h1-across-pages@1440.png`;
  - `asksig-headline@390.png`;
  - `headline-widows@390.png` (first row).
- **Rule broken:**
  - decisions, Nov 11 call 2: `page` is every page's h1, "Ask Sig's greeting included";
  - decisions, Nov 12: headlines are wide, heavy and in capitals;
  - BRAND.md Type: `page` is a page's h1;
  - the brief: the same level looks the same on every page type, and the community is held against the website.
- **Fix:**
  1. ai/ai.css:39 `.ai-title{font:600 clamp(34px,3.4vw,48px)/1.02 var(--head);letter-spacing:-.026em}` → `font:800 expanded clamp(26px,1.2vw + 15.5px,34.5px)/1.04 var(--head);letter-spacing:-.028em`.
  2. library.css:331 `@media (max-width:560px){.lib-hero h1{font-size:clamp(26px,calc((100vw - 40px) / 10.1),39.5px)}}` → `@media (max-width:560px){.lib-hero h1 br{display:none}}`. The size then comes from h1 and `balance` spreads the line.
  3. web/styles.css:203 `h1{font:800 expanded clamp(29px,2.84vw,41.5px)/1.02 var(--head);letter-spacing:-.022em;…}` → `h1{font:800 expanded clamp(26px,1.2vw + 15.5px,34.5px)/1.04 var(--head);letter-spacing:-.028em;margin:8px 0 0}`.
     - Delete :794 `h1{font-size:27.5px}`, :401 `.space-hero h1{font-size:31px}`, :820 `.space-hero h1{font-size:24px}` and :481 `.profile-h h1{font-size:29px}`.
     - Delete the `font-size:38px` in :553 `.gate h1` (the beta gate, which wasn't captured).
  4. web/styles.css:204 `h2{font:800 expanded 19px/1.2 var(--head);…}` → `h2{font:800 expanded clamp(17px,0.43vw + 12px,19px)/1.04 var(--head);letter-spacing:-.028em;margin:26px 0 12px}`. Delete the sizes in :969 (`22.5px/1.1`), :717 (`20.5px`) and :680 (`20.5px;line-height:1.15`).
- **Check:** verified live: Ask Sig's headline at 1440 becomes 32.78px wide 800, and the community feed's h1 32.78px.

### TYPE-03 · high · Every page's foot, and the fact-sheet template, run 96–154 characters a line
- **Where:**
  - the foot disclaimer on all 21 website page types with a foot (everything but Ask Sig), at 1440, 1024 and 768;
  - the fact-sheet template (the 122 sheets), at 1440, 1024 and 768.
- **Selectors and evidence** (the longest full line, measured live):
  - styles.css:282 `.foot-row>p:not(.copy)` (15px, `max-width:none`): one line of **154 characters at 1440**, 139 at 1024 and 101 at 768.
  - library.css (ranges cover the semaglutide and creatine sheets):

    | Rule | Text | Longest line |
    |---|---|---|
    | :185 `.claims p` | benefits and risks, 15px | **96–107 at 1440, 125–134 at 1024** |
    | :220 `.sources a` | source titles | 96–125 |
    | :142 `.sig-wait` | | 78–115 |
    | :181 `.ev-box p` | | 94–107 |
    | :352 `.asks li` | 18px | 92–99 |
    | :209 `.st-meta` | mono | 93 |
    | :379 `.le-print figcaption` | mono | 100–104 at 1024 |
    | :196 `.dots li`, `.marks li` | | 85–90 at 768 |

  - kit/kit.css:78 `.mh-bm-lead` and the body map's `.mh-bm-txt`: 80–98.

  Images:
  - `.design/evidence/design-typography/foot-disclaimer@1440.png`;
  - `sheet-measure@1440.png`;
  - `sheet-measure@1024.png`.
- **Rule broken:**
  - the brief: paragraphs at most about 75 characters a line;
  - decisions, Nov 11 call 5: text at 52ch. The doc pages keep it, at most 72 measured on privacy.
- **Fix:**
  1. styles.css:282 → `.foot-row>p:not(.copy){max-width:52ch;font-size:15px;line-height:1.55}`. The size goes to 14px in TYPE-16.
  2. library.css: add `max-width:52ch` to `.claims p` (:185), `.ev-box p` (:181), `.sources a` (:220) and `.sig-wait` (:142), and add `.dots li,.marks li{max-width:52ch}` after :196.
  3. library.css:213 `.asks{…}` → add `max-width:60ch`, so the question boxes share one narrower width.
  4. library.css: add `max-width:72ch` to `.st-meta` (:209) and `.le-print figcaption` (:379). They're mono, so 1ch is one character.
  5. kit/kit.css (in both apps): add `max-width:52ch` to `.mh-bm-lead` (:78), and add `.mh-bm-txt{max-width:52ch}`.
- **Check:** verified live:
  - the foot holds at most 72 characters at 1440 and 1024;
  - the creatine sheet: `.claims p` 70, `.ev-box p` 66, `.asks li` 59, `.sources a` 64, `.sig-wait` 64.

### TYPE-04 · high · The community sets its labels, status bar, tabs, tags and foot in tracked mono capitals
- **Where:** all 16 community screens, at every width. (The website's labels are mono lowercase and untracked.)
- **Selectors and evidence** (web/styles.css):

  | Rule | What it is | Now |
  |---|---|---|
  | :71 `.tick-i` | status bar items, 1,560 at 1440 on 15 screens | 11px caps .06em. In the same bar, "safety on" is lowercase |
  | :65 `.tick-lead` | "SIGNAL · LIVE" | .12em |
  | :51 `.kick` | as a label: rail card heads "YOUR EMBLEM", "LIVE MOVES" (14 screens), the side panel's season card "SEASON 1 · FOUNDERS" (:196), "pts", the body map's h2 | 11.5px caps .09em, no rule |
  | :212 `.card-h a` | "PROFILE", "ALL" | 11px caps .08em |
  | :207 `.cap` | page captions | 11px caps .08em, right-aligned (TYPE-18) |
  | :619 `.foot-links` | foot links | **12px mono caps .12em**. The website's are 13.5px Mona Sans in sentence case (styles.css:489) |
  | :622 `.foot .copy` | | .06em |
  | :823 `.tabbar a` | phone tab bar | 9.5px caps .07em |
  | :507 `label.f>span` | form labels | 11px caps .08em |
  | :223 `.chip` | tags | **10.5px mono caps .06em**. The website's tags are 12.5px Mona Sans in sentence case |

  Also in tracked capitals:
  - :403 `.space-tabs a`, :600 `.tabs a` and :515 `.seg label` (.06–.07em);
  - :411 `.space-card .meta`, :485 `.stat span`, :372 `.hero-stats span`, :331 `.sigcard .cap2` and :345 `.use-meta` (.05–.09em);
  - :577 `.pick .m`;
  - :467 `.pod .place` (.1em);
  - :325 and :725 `.live` (.12em).

  Images:
  - `.design/evidence/design-typography/comm-labels-caps@1440.png`;
  - `comm-tabbar@390.png`;
  - `comm-page-cap-right-aligned@1440.png`;
  - `kickers@1440.png` (last row).
- **Rule broken:**
  - the brief: side panel and status labels are mono lowercase, and mono is untracked except kickers;
  - BRAND.md Voice: "Labels, a table's column heads and the status bar are mono lowercase";
  - decisions, Nov 12 call 3: tags are Mona Sans in sentence case at 12.5px.
- **Fix** (web/styles.css):
  1. :51 `.kick{font:500 11.5px/1.4 var(--mono);letter-spacing:.09em;text-transform:uppercase;…}` → `.kick{font:400 12px/1.4 var(--mono);letter-spacing:0;text-transform:lowercase;color:var(--muted)}`. The page-head kickers get capitals back through TYPE-01, fix 6.
  2. :71 `.tick-i{font:500 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;…}` → `font:400 11.5px/1 var(--mono);letter-spacing:0;text-transform:lowercase`. Also :65 `.tick-lead`: letter-spacing `.12em` → `0`, and add `text-transform:lowercase`. "SIG" stays: BRAND.md says SIG leads the bar.
  3. :212 `.card-h a,.card-h button{font:500 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;…}` → `font:400 12px var(--mono);letter-spacing:0;text-transform:lowercase`.
  4. :207 `.cap{font:500 11px/1.5 var(--mono);letter-spacing:.08em;text-transform:uppercase;…;text-align:right;…}` → `font:400 12px/1.5 var(--mono);letter-spacing:0;text-transform:lowercase;text-align:left`.
  5. :619 `.foot-links{…font:500 12px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}` → `font:500 13.5px/1.4 var(--body);letter-spacing:0;text-transform:none`. That is the website's styles.css:489. Also :622 `.foot .copy`: letter-spacing `.06em` → `0`.
  6. :823 `.tabbar a{…font:500 9.5px var(--mono);letter-spacing:.07em;text-transform:uppercase}` → `font:400 11px var(--mono);letter-spacing:0;text-transform:lowercase`.
  7. :223 `.chip{…font:500 10.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;…}` → `font:500 12.5px/1.2 var(--body);letter-spacing:0;text-transform:none`. The `.chip.part`, `.chip.rm` and `.chip.fx.warn` overrides then become redundant.
  8. The other rules listed above: `letter-spacing:0;text-transform:lowercase`.
  9. `.logo .tag` ("COMMUNITY", :109) stays in capitals: BRAND.md's Logo section says so.

### TYPE-05 · high · Glyphs neither font has are drawn in system faces (Inter, DejaVu)
- **Where:**
  - community: the status bar on all 15 signed-in screens; the feed (home, popular, profile, space); Sig's notes (14 screens); the post page;
  - website on Apple devices: every page's top bar, the 404 and Ask Sig's status bar.
- **Evidence:** the face Chrome drew each glyph in, measured with CDP. The fonts' character sets confirm none of these glyphs is in them.

  | Glyph | Where | Rule or source | Font asked for | Drawn in |
  |---|---|---|---|---|
  | ◆ U+25C6 | before every status-bar item | web/styles.css:72 `.tick-i::before{content:'◆'}` | Monaspace Neon | DejaVu Sans Mono |
  | ✓ U+2713 | "✓ sig read" | web/ui/components/post.js:158, `.rs-k` | Monaspace Neon | DejaVu Sans Mono |
  | ○ U+25CB | "○ a question…" | post.js:151, `.read-q` | Monaspace Neon | DejaVu Sans Mono |
  | ▲ ▼ | "just moved ▲ 0.2" | web/ui/live.js:30, `.sigsay` | Mona Sans | **Inter** |
  | ← | "← s/Tirzepatide" | web/ui/pages/post.js:170, `.lnk` | Mona Sans | **Inter SemiBold** |
  | ⌘ U+2318 | "⌘K", on an Apple device (the static `<kbd class="kbd-k">⌘K</kbd>` in every page's top bar, 404.html:59 and :63, Ask Sig's `.tm-sb-k`; lib/os.js:47–50 only rewrites it elsewhere) | | Monaspace Neon | DejaVu Sans Mono here; a system face on a Mac |

  Images:
  - `.design/evidence/design-typography/fallback-glyphs-comm@1440.png`;
  - `fallback-glyphs-status-and-cmd.png` (3–4× zoom).
- **Rule broken:**
  - the brief: only the three faces;
  - BRAND.md Type: "Never substitute Inter, Roboto or a system serif";
  - decisions, Nov 11 call 12: glyphs the fonts have, and the check mark drawn (`img/i-check.svg`).
- **Fix:**
  1. web/styles.css:72 `.tick-i::before{content:'◆';color:var(--lime);font-size:8px;margin-right:6px}` → `.tick-i::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--lime);margin-right:6px}`. That's a drawn pip.
  2. web/ui/live.js:30: render the move with `movement(delta(x))` from components/signal.js (the `.mv` span, Monaspace Neon, which has ▲ and ▼). Don't write it into the sentence. The copy is unchanged.
  3. post.js:158 `'✓ sig read'` → `[h('i', { class: 'ck', 'aria-hidden': 'true' }), ' sig read']`. Copy the website's `.ck` rule (styles.css:795) and `img/i-check.svg` into the community.
  4. post.js:151: drop the "○ " character and draw the dot: `.read-q::before{content:'';display:inline-block;width:7px;height:7px;margin-right:8px;border:1.5px solid currentColor;border-radius:50%;vertical-align:1px}`. That's the feed's hollow question dot.
  5. The back link: add `.post-head .lnk{font:500 12.5px/1.4 var(--mono)}` to web/styles.css. The path is mono, and Monaspace Neon has ←.
  6. The ⌘ on the website: draw it as a mask like `.ck`.
     - Add `img/i-cmd.svg` and `.kbd-cmd{display:inline-block;width:.9em;height:.9em;vertical-align:-.12em;background:currentColor;-webkit-mask:url('/img/i-cmd.svg') center/contain no-repeat;mask:url('/img/i-cmd.svg') center/contain no-repeat}`.
     - Write the key in the HTML (top bar, 404.html:59 and :63) as `<kbd class="kbd-k"><i class="kbd-cmd" aria-hidden="true"></i>K</kbd>`.
     - In lib/os.js:49, off Apple devices, put the text `Ctrl ` in place of the `<i>`.

### TYPE-06 · high · Every headline is tracked -0.022em, and h2 is set at 1.2
- **Where:** every page of both apps, at every width.
- **Evidence:**
  - Of 648 wide heading elements (both apps, four widths), 636 are tracked -0.022em and 12 are tracked -0.02em (home's Three steps h3).
  - h2 leading is 1.2: the website's doc h2 is 21.83px on 18.19px, the community's 22.8px on 19px. Other headlines sit at 0.98–1.04.
  - Image: `.design/evidence/design-typography/h1-across-pages@1440.png` (values in the captions).
- **Selectors:**
  - styles.css:62 `h1`, :63 `h2`, :157 and :456 `.sec-head h2,.faq-head h2`, :238 and :482 `.join h2`, :444 `.hero h1`, :708 `.sy h2`, :719 `.sy-hero h1`;
  - home.css:27 `.sx-hero h1`, :210 `.fp-head h2`, :605 `.hs-head`. Also :184 `.fp .sn-name` and :173 `.fp .st-card h3` (-.02em), which TYPE-10 turns into card titles;
  - web/styles.css:203 `h1`, :204 `h2`, :535 `.auth-art h1`, :546 `.auth-form h2`, :717 `.takeover-card h2`, :894 `h1,h2`, :969 `.top-head h2`.
- **Rule broken:** the brief: headlines at -0.026 to -0.032em, line height about 1. BRAND.md:72 says -0.022em; see TYPE-19.
- **Fix:**
  1. Add `--head-ls:-.028em` to the `:root` of styles.css (:21) and of web/styles.css (:20).
  2. In every rule listed, change `letter-spacing:-.022em` (and `-.02em`) → `letter-spacing:var(--head-ls)`.
  3. styles.css:63 `h2{…/1.2 …}` → `/1.04`; web/styles.css:204 `/1.2` → `/1.04`.

### TYPE-07 · high · Community running text runs 99–115 characters a line
- **Where:** home, popular and profile (the feed), the post page, how, rules, account, quests, signal and builders, at 1440, 1024 and 768.
- **Selectors and evidence** (web/styles.css):
  - :273 and :942 `.excerpt`: 15px, 630px box, **105 characters at 1440** (140 excerpts across widths);
  - :274 `.body` (a post): 88–99;
  - `section.card>p`: 105–106;
  - `.rule>div` (:605): 95–109;
  - `p.small` in cards: 101–115;
  - :432 `.texts-choice p`: 105;
  - :525 `.rules-note>div`: 87–100;
  - :313 `.cm-body`: 80.

  The main column is 780px (:168) with no measure on its text. Image: `.design/evidence/design-typography/comm-measure@1440.png`.
- **Rule broken:**
  - the brief: paragraphs at most about 75 characters a line;
  - the website keeps running text at 52ch (decisions, Nov 11 call 5).
- **Fix:** web/styles.css, after :274, add `.excerpt,.body,.cm-body,.card>p,.rule>div,.texts-choice p,.rules-note>div{max-width:52ch}`.
- **Check:** verified live: the feed's excerpts are at most 76 characters a line at 1440.

### TYPE-08 · medium · The community domain's root, until it opens, is set in Unbounded and the system face
- **Where:** community.miraclehealth.us's root page. pages.yml deploys site/soon.html there "before the community opens" (.github/workflows/pages.yml:91–96). It isn't in pages-community.json, so the capture doesn't have it. Checked at 1440 and 390, built as the workflow builds it.
- **Selectors:**
  - site/soon.css:1 `@font-face{font-family:'Unbounded';…}`;
  - :8 `h1{…font:700 clamp(26px,6vw,40px)/1.15 'Unbounded',system-ui,sans-serif;letter-spacing:-.01em}`;
  - :6 `body{…font:17px/1.55 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}`;
  - pages.yml:96 copies only `unbounded.woff2`.
- **Evidence:** the faces Chrome drew (CDP):
  - "Miracle Health Community" (40px at 1440, 26px at 390): **Unbounded**;
  - the lede, "Opening soon", the note and the foot: **Inter** and Inter SemiBold, through `system-ui`. A visitor gets their own system face: Roboto, SF or Segoe UI.
  - No brand face is on the page.
  - The lede (`max-width:30em`, no `text-wrap`) leaves "them." alone at 1440.

  Image: `.design/evidence/design-typography/comm-opening-soon-root.png`.
- **Rule broken:**
  - the brief: only Mona Sans, Mona Sans Display and Monaspace Neon;
  - BRAND.md Type: "Never substitute Inter, Roboto or a system serif".
- **Fix:**
  1. site/soon.css:1 → `@font-face{font-family:'Mona Sans';src:url('fonts/mona-sans.woff2') format('woff2');font-weight:200 900;font-stretch:75% 125%;font-style:normal;font-display:swap}`.
  2. :6 → `font:16px/1.55 'Mona Sans',system-ui,-apple-system,'Segoe UI',sans-serif`. Drop Roboto.
  3. :8 → `font:800 clamp(30px,3.2vw + 12px,48px)/.98 'Mona Sans',system-ui,sans-serif;font-stretch:125%;letter-spacing:-.028em;text-transform:uppercase`. That's the hero, as on home.
  4. `.lead` → `font-size:18px;text-wrap:pretty`.
  5. pages.yml:96 → `cp web/fonts/mona-sans.woff2 web/fonts/monaspace-neon-400.woff2 _site/fonts/`.
  6. Delete web/fonts/unbounded.woff2 and its line in web/fonts/README.md.
  7. The page's colours (a cream and coral theme that follows the device) and its pill are for the brand-and-colour and components leads.

### TYPE-09 · medium · Measured numbers are set in Mona Sans: the front page's top, its How it works, status and the flow figure
- **Where:**
  - website: home at every width; status; the Library's "How the Signal is made" figure;
  - community: the post page, signal, quests and Sig's notes.
- **Evidence:**

  | Number | Rule | Face now |
  |---|---|---|
  | Home's strip "51 · 0 · 0 · 0" | home.css:75 `.sx-read b` | 28px Mona Sans wide 650, proportional figures |
  | The Signal "91.9" in the ring card | home.css:99 `.sx-score` | 51.8px Mona Sans wide 650, -0.04em |
  | Spectrum counts 29 · 4 · 10 · 8 | home.css:157 `.sx-glab b` | 14px Mona Sans wide |
  | The picked bar's 91.9 | home.css:149 `.sx-lab b` | 12px Mona Sans wide |
  | How it works' 91.9 | home.css:638 `.hs-n` | 96px Mona Sans wide 800 (capture data) |
  | The same number in its SVG | home.css:601 `.hs-wide` | 32px Mona Sans wide |
  | The flow figure's "0%" and "51" (community: "3%", "52") | library/signalviz.js:130, :207, :248 and web/kit/signalviz.js, same lines, `class="t-head"` | 30–40px Mona Sans 600 |
  | Status counts "11 · 5 · 6 · 22 …" | `.st-group-h .st` | 12.5px Mona Sans |
  | The Signal "89.3" on the post page | `b.num`; web/styles.css:359 `.num` sets tabular figures only | 14px Mona Sans |
  | Sig's note "▲ 0.2" | web/ui/live.js:30 | Mona Sans |
  | Quest progress "0 of 3 · this week" | :448 `.quest .d` | Mona Sans |

  Home sets the same Signal in Mona Sans wide 52px in the ring card and in mono 40px in the example card further down. Image: `.design/evidence/design-typography/numbers-in-mona-sans@1440.png`.
- **Rule broken:**
  - the brief: every measured number in mono with tabular figures;
  - BRAND.md Principle 2 ("It is set in mono") and Type (`data` with tabular figures);
  - tokens `number` and `number-lg` are mono.
- **Fix:**
  1. home.css:75 `.sx-read b{font:650 expanded 28px/1 var(--head);letter-spacing:-.03em;…}` → `font:500 26px/1 var(--mono);letter-spacing:0`.
  2. home.css:99 `.sx-score{font:650 expanded clamp(34px,calc(52 * var(--u)),64px)/1 var(--head);letter-spacing:-.04em;…}` → `font:500 clamp(34px,calc(52 * var(--u)),64px)/1 var(--mono);letter-spacing:0`. It keeps the drawing's own sizing (decisions, Nov 13).
  3. home.css:157 `.sx-glab b{font:650 expanded 14px/1.5 var(--head)}` → `font:500 13px/1.5 var(--mono)`.
  4. home.css:149 `.sx-lab b{font:650 expanded 12px/1 var(--head)}` → `font:500 12px/1 var(--mono)`.
  5. home.css:129 `.sx-band-t b{font:650 expanded 15px/1.3 var(--head);…}` → `font:600 15px/1.3 var(--body);letter-spacing:0`. It's a lead-in, not a headline. Set the count in that caption in mono too.
  6. home.css:638 `.hs-n{font:800 expanded …/1 var(--head);letter-spacing:-.03em;…}` → `font:500 clamp(56px,7cqi,96px)/1 var(--mono);letter-spacing:0`.
  7. home.css:601 `.hs-wide{font-stretch:125%;letter-spacing:-.02em}` → `.hs-wide{font-family:var(--mono);font-weight:500;letter-spacing:0}`.
  8. signalviz.js, in both apps, lines 130, 207 and 248: `class="t-head"` → `class="t-mono"`.
  9. pages.css:47: add `.st-group-h .st{font-family:var(--mono);font-variant-numeric:tabular-nums}`.
  10. web/styles.css:359 `.num{font-variant-numeric:tabular-nums}` → `.num{font-family:var(--mono);font-variant-numeric:tabular-nums}`.
  11. web/styles.css:448 `.quest .d{font-size:12.5px;…}` → `font:400 12px/1.4 var(--mono)`.
  12. The move in Sig's note: TYPE-05, fix 2.

### TYPE-10 · medium · Home's headings are out of order, and card titles have six treatments
- **Where:** home at every width.
- **Evidence:** sizes at 1440 / 1024 / 768 / 390.

  | Element | Rule | Size | Treatment |
  |---|---|---|---|
  | h1 (hero) | | 48 | |
  | How it works h2 `.hs-head` | home.css:605 | **56** / 43 / 32.3 / 32 | larger than the page's h1; `.hs-small` is 48 |
  | Section h2 `.fp-head h2` | home.css:210 | 36 / **32.35** / 27.52 / 26 | library and story (styles.css:456, :708): 35.72 / **27.85** / 26 / 26. Two clamps for one role, 4.5px apart at 1024 |
  | `h3.sn-name` | home.css:184, :552 | **40** / 40 / 40 / 32 | wide 800, sentence case; larger than its h2 (36) |
  | Three steps h3 | home.css:173 | 24 | wide 800, **caps**; at 768 it sets one word a line |
  | `h3#vs-name` | home.css:391, :583 | **38** / 38 / 38 / 32 | Mona Sans 600 at **normal width** |
  | `span.fp-way-h` | home.css:204 | 22 | 600; a card title that isn't a heading |
  | House rules h3 | | 16 | 600 |

  Images:
  - `.design/evidence/design-typography/home-heading-levels@1440.png`;
  - `headline-widows@768.png`.
- **Rule broken:**
  - the brief: the same level looks the same on every page type;
  - BRAND.md:72: "Headings inside an answer or a card stay semibold and in sentence case";
  - tokens `h2`: a card's title on the front page, 20–22px;
  - tokens `section`: section heads.
- **Fix:**
  1. home.css:605 `.hs-head{font:800 expanded clamp(32px,4.2cqi,56px)/1 …}` → `clamp(26px,1.89vw + 8.5px,36px)/1.04`. Delete the font-size in :606 `.hs-head.hs-small`.
  2. home.css:210 `clamp(26px,1.89cqi + 13px,36px)` → `clamp(26px,1.89vw + 8.5px,36px)`, the library's and the story's.
  3. home.css:184 `.fp .sn-name{…font:800 expanded 40px/1 var(--head);letter-spacing:-.022em;text-transform:none}` → `font:600 clamp(20px,.5vw + 14px,22px)/1.25 var(--body);letter-spacing:-.012em`. Delete :552.
  4. home.css:173 `.fp .st-card h3{…font:800 expanded 24px/1.02 var(--head);letter-spacing:-.02em;text-transform:uppercase;…}` → `font:600 clamp(20px,.5vw + 14px,22px)/1.25 var(--body);letter-spacing:-.012em;text-transform:none`. That's styles.css:460's card title.
  5. home.css:391 `.fp-vs .vs-id h3{font:600 38px/1.1 var(--body);letter-spacing:-.02em;…}` → the same card title. Delete :583.
  6. home.css:626 `.hs-who{font:500 24px/1 …}` → `font:500 20px/1.2 …`, its phone size (delete :652). The names stop breaking a word a line at 1024.
  7. If page 15's board sets the Three steps titles in wide capitals on purpose, keep them and correct BRAND.md:72 instead.

### TYPE-11 · medium · The hero headline has three sizes, and the community's sign-in h2 outranks every section head
- **Where:** home, story and the community sign-in, at every width.
- **Evidence:** at 1440 / 1024 / 768 / 390.
  - Home `.sx-hero h1` (home.css:27): 48 / 44.77 / 36.58 / 30.
  - Story `.sy-hero h1` (styles.css:719): **51.5 / 41.9 / 34.43 / 32.5**.
  - Community sign-in `.auth-art h1` (web/styles.css:535, :808): **57.02 / 40.55 / 39.5 / 33.54**.
  - Its `.auth-form h2` "Sign in." (:546): 37.15 / 29 / 29 / 29. The website's section h2 tops out at 36.

  Images:
  - `.design/evidence/design-typography/h1-across-pages@1440.png` (rows 2 and 3);
  - `.design/shots/comm-signin@1440.jpg`.
- **Rule broken:**
  - tokens `hero`: the front page's one headline and the story page's, one style;
  - the brief: the same level looks the same.
- **Fix:**
  1. styles.css:719 `clamp(32.5px,2.92vw + 12px,51.5px)/1.03` → `clamp(30px,3.2vw + 12px,48px)/.98`. That's home's value; its cqi matches vw here, giving equal sizes at 1024, 768 and 390.
  2. web/styles.css:535 `font-size:clamp(38px,3.96vw,60px)` → `font-size:clamp(30px,3.2vw + 12px,48px)`. Delete :808.
  3. web/styles.css:546 `.auth-form h2{font-size:clamp(29px,2.58vw,39.5px);line-height:1;…}` → `font-size:clamp(26px,1.89vw + 8.5px,36px);line-height:1.04`.

### TYPE-12 · medium · The community's post page sets the member's own title in capitals
- **Where:** the community post page, at every width.
- **Evidence:** `h1.post-title` is 18px Mona Sans 600, `text-transform: uppercase`. The global rule `h1,h2{…text-transform:uppercase…}` (web/styles.css:894) reaches the member's words. The feed shows the same title in sentence case, as written. Image: `.design/evidence/design-typography/comm-post-title-caps@1440.png`.
- **Rule broken:**
  - tokens `h3`: a post's title is Mona Sans semibold, as the feed sets it;
  - BRAND.md Voice: sentence case everywhere;
  - capitals are for the site's own display heads.
- **Fix:** web/styles.css:270 `.post-title{…letter-spacing:-.015em;…}` → add `text-transform:none;text-wrap:pretty`. The class outranks the `h1` element rule.

### TYPE-13 · medium · Home, the Library's explainer, story, method and Ask Sig run 85–174 characters a line
- **Where:**
  - home at 1440, 1024 and 768;
  - the Library at 1024 and 768;
  - story and method;
  - Ask Sig at 1440, 1024 and 768.
- **Evidence** (the longest full line):

  | Page | Rule | Size | Longest line |
  |---|---|---|---|
  | Home | home.css:448 `.fp-members` | 14.5px | **174** |
  | Home | :446 `.fp-rule-list p` | 15px | 107–125 |
  | Home | :213 `.fp-fine` | 13px, one line | 116 |
  | Home | :321 `.signed-t` | 15.5px | 97–112 |
  | Home | :211 `.fp-sub` | 17.5px, `max-width:64ch` | 87 |
  | Home | :460 `.fp-faq details p` | 15.5px, `64ch` | 86 |
  | Home | :410 `.fp-vs .vs-sub` | | 101 at 768 |
  | Home | :633 `.hs-cap p` | | 93 at 768 |
  | Library | library.css:94 `.lib-explain h3+p` | | 131 at 1024 |
  | Story | styles.css:747 `.sy-part p:last-child` | | 124 at 1024 |
  | Method | styles.css:410 `.method .cell-sub` | | 119 |
  | Ask Sig | ai/ai.css:470 `.ai-crowd` | | 99 |
  | Ask Sig | ai/ai.css:94 `.agent-what` | | 97 |

  Image: `.design/evidence/design-typography/home-library-asksig-measure.png`.
- **Rule broken:** the brief: about 75 characters a line. tokens `lede`: at most 50ch.
- **Fix:**
  1. Add `max-width:52ch` to `.fp-members`, `.fp-rule-list p`, `.fp-fine`, `.signed-t` and `.fp-vs .vs-sub` (home.css).
  2. home.css:211 `.fp-sub{…max-width:64ch;font-size:17.5px…}` → `max-width:50ch;font-size:18px`.
  3. home.css:460 `max-width:64ch;…font-size:15.5px` → `max-width:52ch;…font-size:16px`.
  4. home.css:633 `.hs-cap p`: add `max-width:50ch`.
  5. library.css:94: add `max-width:52ch`.
  6. styles.css:747 and :410: add `max-width:52ch` (`.method .cell-sub` is already `display:block`).
  7. ai/ai.css: add `.ai-crowd>span{max-width:52ch}` and `max-width:52ch` on `.agent-what` (:94).
  8. Ask Sig's `.ai-fine` stays one line: decisions, Nov 13.

### TYPE-14 · medium · Single-word last lines in headlines and titles
- **Where and evidence:**
  - **Library h1 at 390** ("LOOK IT UP / BEFORE YOU TAKE / IT."): the 34.65px phone size (TYPE-02) plus the `<br>` in library/index.html:66.
  - **Home How it works h2 at 390** ("THE SYSTEM / BEHIND / ONE HONEST / NUMBER."): the `<br>` in index.html:188 and :203.
  - **Community feed titles at 390**: `a.post-title`, text-wrap `auto`, gives "…I have ever / tried", "…no difference for / me" and "…surgery scar, 8 / weeks".
  - **Home `.fp-way-h` at 768** (text-wrap `auto`): "What the studies / show".
  - **Home Three steps h3 at 768**: "THE / SIGNAL / MOVES", one word a line.

  Images:
  - `.design/evidence/design-typography/headline-widows@390.png`;
  - `headline-widows@768.png`;
  - `comm-titles-widows@390.png`.
- **Rule broken:** the brief: no single-word last lines in headlines; text-wrap balance or pretty fixes them.
- **Fix:**
  1. library.css:331 as in TYPE-02, fix 2 (hide the `<br>` at 560px and under).
  2. home.css: add `@media (max-width:600px){.hs-head br{display:none}}`. The precedent is styles.css:375 `.hero h1 br{display:none}`.
  3. web/styles.css:270 `.post-title`: add `text-wrap:pretty` (TYPE-12).
  4. home.css:204 `.fp-way-h`: add `text-wrap:balance`.
  5. The Three steps h3 is fixed by TYPE-10, fix 4.
- **Check:** verified live:
  - the library h1 sets two lines with no lone word;
  - `.hs-head` has no single-word line;
  - the community titles have none;
  - "What the / studies show".
  - What remains is "What people / report" in the 230px three-column cards at 768: a balanced two-line split of three words, and the cards' width is layout's call.

### TYPE-15 · medium · Mono is tracked where it should be untracked
- **Where:**
  - website: compare pair, library, the fact sheets, home, story and the goal page;
  - community: 10 rules across most screens.
- **Evidence and selectors:**
  - Website labels:
    - styles.css:74 `.mono` at .04em: the library's "// The fact sheet" and the sheets' lab columns;
    - pages.css:68 `h2.cmp-k` (compare pair): mono 13px tracked **-0.286px (-0.022em)**, which `.cmp-k`'s `font` shorthand doesn't reset from the h2 rule;
    - home.css:621 `.hs-title` .02em;
    - home.css:171 `.st-n` .08em;
    - home.css:634 `.hs-cap-k` "STEP 01 OF 06": .09em and capitals, though it's a label.
  - Big mono numbers on both apps, tracked -0.02 to -0.055em:
    - website: library.css:55 and :333 `.lib-stats dd` (-.045); :145 `.sig-top .n` (-.055, on every sheet); home.css:396 `.fp-vs .vs-score b` (-.02); styles.css:472 `.vs-cell.pl .vs-v b` (-.04, which home.css:412 inherits); styles.css:718 `.sy-ring-n b` (-.04); pages.css:18 `.pg-anyway b` (-.04); pages.css:135 `.calib-h span` (-.04);
    - community (web/styles.css): :327 `.sig-big b` (-.05); :371 `.hero-stats b`, :380 `.brow .sc`, :410 `.space-card .sc`, :442 `.me-card b.pts`, :484 `.stat b`, :679 `.lib-row .sc` and :734 `.step-l .cnt b` (-.04); :470 `.pod .p` (-.03); :682 `.stack-hit .big-sc b.num` (-.045).

  Images:
  - `.design/evidence/design-typography/mono-tracked-site@1440.png`;
  - `compare-cmp-k-tracked@1440.png`.
- **Rule broken:** the brief: mono untracked, except kickers.
- **Fix:**
  1. styles.css:74: `.04em` → `0`.
  2. pages.css:68 `.cmp-k{font:400 13px/1.4 var(--mono);…}` → `.cmp-k{font:400 12px/1.4 var(--mono);letter-spacing:0;…}`.
  3. home.css:621 and :171: tracking → `0`.
  4. home.css:634: `letter-spacing:0;text-transform:lowercase`.
  5. Every number rule listed: `letter-spacing:0`.

### TYPE-16 · medium · Mona Sans has near-duplicate sizes doing one job
- **Where:**
  - website: every page's foot and side panel; home's ledes, FAQ and hero buttons; method; the fact sheets' body map;
  - community: its foot, side panel and small buttons.
- **Evidence:** live sizes in use. The website has 22 Mona Sans sizes in HTML, the community 12.

  | Job | In use (rule) | Should be |
  |---|---|---|
  | A note under a block | 13px: `.nf-note` styles.css:302 (every page's foot), `.fp-fine` home.css:213, `.method .cell-sub` styles.css:410, `.side-note` | 14px `small` |
  | The foot's disclaimer | 15px on the website (styles.css:282); 14px in the community (`#foot-text`) | 14px `small` |
  | Lede | 17.5px: `.sx-hero .fp-lede` home.css:28, `.fp-sub` :211, `.hs-cap p` :633. 18px elsewhere (`.pg-intro`, `.doc .intro`, `.lede`) | 18px `lede` |
  | Running text | 15.5px in home's FAQ (home.css:460) | 16px `body` |
  | Button | 15.5px `.sx-acts .btn` (home.css:70), 15px `.sx-go` (:41); 14.5px everywhere else | 14.5px `button` |
  | Small button, community | 13px `.btn.sm` (web/styles.css:905), 12px `.btn.xs` (:906); the website's `.btn.sm` is 14px | 14px |
  | Tiny Mona Sans | 11.5px `.os-legal` (styles.css:584) and community `.side-legal` (:165); 12px body-map markers `.mh-bm-mk` (kit) | 12.5px, the tag size and smallest Mona Sans step |
  | Diagram name | 24px `.hs-who` (home.css:626) | 20px (TYPE-10) |

- **Rule broken:** the brief: flag one-offs and near-duplicates; tokens.json Text styles.
- **Fix:**
  1. Set each rule listed to the size in the last column.
  2. home.css:70: delete `font-size:15.5px`.
  3. home.css:41: delete `font-size:15px`.

### TYPE-17 · medium · Mono uses 30 sizes on the website and 18 in the community for a handful of jobs
- **Where:**
  - website: home, the Library, every fact sheet, story, the goal page and compare pair;
  - community: the rail, explore, profile, space, signal, stack and the side panel.
- **Evidence:** live, HTML only; drawing-scaled text inside the rings is left aside.

  | Job | In use (rule) | Should be |
  |---|---|---|
  | A total on a board | website: 26 (home), 31 (`.pg-anyway b` pages.css:18), 32 and 36 (`.lib-stats dd` library.css:55, :265), 19 (`.calib-h span` pages.css:135); community: 22 (`.stat b` :484), 24 (`.hero-stats b` :371, `.space-card .sc` :410), 26 (`.me-card b.pts` :442), 28 (signal totals) | 26px `number` |
  | A Signal on its own | website: 40 (home's example card), **68 and 64** (`.sig-top .n` library.css:145, :269, every sheet); community: **54** (`.sig-big b` :327), 32 (`.stack-hit .big-sc` :682) | 40px `number-lg` |
  | A ring's count | story: 64 and 44 (`.sy-ring-n b` styles.css:718, :782); home and Ask Sig: 25.7–29.3 | 26px `number` |
  | A Signal in a row | community: 13.5 (`.num.mono.small`), 15, 16, 17 (`.pod .p` :470), 20 (`.brow .sc` :380, `.lib-row .sc` :679, `.step-l .cnt b` :734) | 13px `data` (500) |
  | Prompt | 13.5px `.fp-cmd` and `.fp-c-code` (home.css:304, :434) | 12.5px `log` |
  | Label | 13px `.cmp-k`; 12.5px `.toc .mono`, `.side-card .mono` (library.css:374); 10.5px `.sx-read span` (home.css:77), `.sx-gv` (:140) | 12px `label` |
  | Side panel meta | 11px `.op-k` (styles.css:568) beside 11.5px `.os-k` (:572) in the same panel; community: 11px family meta (:157) beside 11.5px `.nav-sec .kick` (:187) | 11.5px |

- **Rule broken:**
  - the brief: one-offs and near-duplicates;
  - tokens.json Mono: `data` 13, `label` 12, `log` 12.5, `status` 11.5, `number` 26, `number-lg` 40.
- **Fix:** set each rule to the size in the last column and drop its phone override where one exists (library.css:265, :269; styles.css:782).

### TYPE-18 · low · Two multi-line paragraphs are set right-aligned
- **Where:**
  - home's How it works captions on the left of the stage, at 1440 and 1024;
  - the community's page captions on builders, explore, popular and stack, at 1440 and 1024.
- **Evidence:**
  - home.css:631 `.hs-r .hs-cap{…text-align:right}`: a 17.5px paragraph of 3–4 lines with a ragged left edge;
  - web/styles.css:207 `.cap{…text-align:right…}`: 3 lines. At 860px and under it's already left (:814).

  Images:
  - `.design/evidence/design-typography/home-caption-right-aligned@1440.png`;
  - `comm-page-cap-right-aligned@1440.png`.
- **Rule broken:** the brief: the right alignment is left or centred.
- **Fix:**
  1. home.css:631: `text-align:right` → `text-align:left`.
  2. web/styles.css:207: `text-align:right` → `text-align:left` (with TYPE-04, fix 4).

### TYPE-19 · medium · In the book: BRAND.md and tokens.json disagree with the decisions and with what was built
- **Where:** design/BRAND.md, design/tokens.json and two comments in styles.css.
- **Evidence:**
  - BRAND.md:72 says headlines are tracked -0.022em; the brief says -0.026 to -0.032em.
  - BRAND.md:73 still lists the old sizes: hero 64, section 42, page 38, h2 22. What's built: hero 48 (76 on a wide front page), section 36, page 34.5, h2 19.
  - BRAND.md:76: "`kicker` (`// a comment`, in capitals, 11px, spaced .09em, no rule)".
  - BRAND.md:21 (Voice): "Kickers are comments in the code: `// the community signal`, lowercase mono".
  - tokens.json:242–277 Headlines: weight 600, sizes 64 / 42 / 38 / 22. :248 says "Mona Sans at its normal width". Tracking runs -0.02 to -0.03em.
  - tokens.json:353–360 kicker: 13px, .12em, "lowercase … No capitals, no rule", with an all-capitals sample.
  - tokens.json:232: `families.display` names "Mona Sans Display". The website has no such face; its headlines are `'Mona Sans'` with `expanded`. Only the community declares it, at weights 640–900.
  - The tokens have nothing for How it works' mono card title (17.5px; 14px on a phone, home.css:621, :650) or the number in its box (20px, home.css:620). Both came in with the Nov 13 decisions.
  - styles.css:8–10 and :72: the comments still describe page 9's normal-width semibold headlines and lowercase kickers.
- **Rule broken:** BRIEF: where the brand book disagrees with a decision or with what was built on purpose, the book is corrected.
- **Fix:**
  1. BRAND.md:72 → "wide (125%), heavy (800), in capitals, tracked -0.028em, line height about 1".
  2. BRAND.md:73 → hero clamp 30–48px (76px on a wide front page), section 26–36px, page 26–34.5px, h2 17–19px.
  3. BRAND.md:76 → "`kicker` (mono capitals, 12px, .12em, led by a 28px rule at 75%)".
  4. BRAND.md:21 → "Kickers are mono capitals led by a short rule. Labels, a table's column heads and the status bar are mono lowercase".
  5. tokens.json:
     - Headlines: weight 800, `fontStretch` 125%, `textTransform` uppercase, `letterSpacing` -0.028em, lineHeight 0.98 / 1.04 / 1.04 / 1.04, and the sizes above;
     - kicker: 12px, 500, .12em, uppercase, "led by a 28px rule at 75% opacity";
     - add `title-mono` (17.5px; 14px on a phone) and `number-box` (20px).
  6. tokens.json:232: name the face as the website builds it (Mona Sans at `font-stretch:125%`), or add the face to the website (see Systemic).
  7. Rewrite the two comments in styles.css.

---

## Systemic: what should be one thing everywhere, and the value

| What | Now | One value |
|---|---|---|
| Headline tracking | -0.022em (636 elements), -0.02em, -0.026em | **-0.028em**, from one `--head-ls` in each `:root` |
| Headline leading | 0.98 / 1 / 1.02 / 1.03 / 1.04 / 1.1 / 1.2 | **1.04** (the hero 0.98) |
| The page h1 | 32.78 (19 page types), 40.9 (community), 48 at normal width (Ask Sig), 34.65 (Library on a phone), 31 and 29 (community space and profile) | **`clamp(26px,1.2vw + 15.5px,34.5px)`**, 800, 125%, capitals |
| The hero | three clamps (home, story, the community's sign-in) | **`clamp(30px,3.2vw + 12px,48px)`** |
| Section h2 | a vw clamp and a cqi clamp; 37px on the sign-in | **`clamp(26px,1.89vw + 8.5px,36px)`** |
| In-page h2 | 17–19px clamp on the website; 19, 20.5 and 22.5 in the community | **`clamp(17px,0.43vw + 12px,19px)`** |
| Card title | 16, 20–22, 22 (a span), 24 wide caps, 38 normal width, 40 wide | **`clamp(20px,.5vw + 14px,22px)`, Mona Sans 600, sentence case** (h3 16px inside running content) |
| Kicker | five treatments | **mono 12px · 500 · .12em · capitals, led by a 28×1px rule at .75** |
| Labels and status | mono lowercase on the website; tracked capitals in the community (20-plus rules) | **mono 12px, lowercase, untracked** (status 11.5px) |
| Tags | Mona Sans 12.5px sentence case on the website; mono 10.5px capitals .06em in the community | **Mona Sans 12.5px, sentence case** (decisions, Nov 12, call 3) |
| Numbers | Mona Sans wide on the front page; mono elsewhere at 7 + 11 sizes, tracked -0.02 to -0.055em | **mono, untracked: 13 (`data`), 26 (`number`), 40 (`number-lg`)** |
| Measure | 52ch on doc pages; nothing on sheets, home, Ask Sig, the foot and the community | **52ch** for running text, **50ch** for ledes |
| The display face | website: `'Mona Sans'` with `expanded`; community: its own `@font-face 'Mona Sans Display'` (weights 640–900 only) | one way in both apps. Keep the website's: one face, `font-stretch:125%` in the headline rules, and drop "Mona Sans Display" from the community and from tokens.json:232 |
| Faces | Unbounded and `system-ui` on the community domain's opening-soon root | **Mona Sans and Monaspace Neon only** |
| Glyphs | ◆ ✓ ○ ▲ ← ⌘ fall to system faces | **only characters in the two fonts; anything else drawn as a mask** (`img/i-*.svg`, like `.ck`) |

**Verified fine:**
- The website's and the community app's (`web/`) stylesheets name only the three families, and `node scripts/design_check.mjs` reports 0 font-family findings. The exception is site/soon.css (TYPE-08).
- Form controls inherit the face in both apps, and no input, button or placeholder fell back.
- Body leading is 1.5–1.6 everywhere.
- The doc pages hold 52ch (at most 72 measured).
- The side panel's labels are mono lowercase and untracked in both apps.
- Ask Sig's status bar is lowercase.
- The ⌘K palette is clean.

---

## The next update, in this area

1. **Type roles in the shared kit.**
   - **What:** put the roles in kit/kit.css (shared by both apps) as custom properties and classes: `--t-hero`, `--t-page`, `--t-section`, `--t-h2`, `--t-card`, `--head-ls`, and `.t-kick`, `.t-label`, `.t-data`, `.t-num`, `.t-num-lg`. styles.css and web/styles.css then use them instead of restating `font` shorthands.
   - **Pages:** every page in both apps.
   - **Why:** today 13 website rules and 7 community rules restate the headline tracking alone, which is how the two apps drifted to different h1s, kickers and labels.
2. **Teach `scripts/design_check.mjs` typography, and run it on the community's stylesheet too.**
   - **What it should flag:**
     - mono `letter-spacing` outside kickers;
     - `text-transform:uppercase` outside headlines, kickers and the COMMUNITY tag;
     - headline tracking other than `--head-ls`;
     - display (`expanded`) text below 17px;
     - sizes off the role list (it lets 10.5, 11, 14, 17.5, 20, 22, 24, 28, 32 and 40 through today).
   - **Pages:** both apps' stylesheets.
   - **Why:** TYPE-04, 06, 15, 16 and 17 can't come back once the baseline drops.
3. **A glyph and measure check in the capture.**
   - **What:** have `design_capture.py`, or a step after it, record each text node's characters against the two fonts' character sets (fontTools, as `.design/work-typography/a2_fonts.py` does) and the characters on each full line (as `collect.js` does). It fails on a glyph outside both fonts or a running-text line over 75 characters. Run it once with a Mac platform so ⌘ is caught.
   - **Pages:** every page.
   - **Why:** the fallbacks (TYPE-05) and long lines (TYPE-03, 07, 13) are invisible in CSS review and only show in rendering.
4. **The community takes the website's type in one place.**
   - **What:** do it in web/styles.css's "Graphite" block (:890–925), which already re-sets buttons this way: the h1, h2 and hero clamps, labels lowercase, tags in Mona Sans, foot links in Mona Sans and the status bar lowercase. This is the type half of "the community app keeps its own look until it takes the Sig system" (decisions, Nov 12).
   - **Pages:** all comm-* screens.
   - **Why:** it closes TYPE-02, 04, 07, 11 and 12 together.
5. **One measure rule for prose.**
   - **What:** `:where(.prose) :is(p,li,dd,figcaption,blockquote){max-width:52ch}` on the doc pages, the fact-sheet article, home's sections and the community's cards and posts. Tables opt out explicitly, and so does the one-line small print (Ask Sig, by decision).
   - **Pages:** the 122 sheets, the doc pages, home and the community.
   - **Why:** one rule instead of 30 `max-width`s, so a new block can't ship at 130 characters a line.
