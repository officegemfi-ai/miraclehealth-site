# Typography: the audit of November 23, 2026

Lead: design-typography. Website at 1440, 1024, 768 and 390 (every page in `design/pages.json`), the community's fifteen screens and its sign-in (`design/pages-community.json`), and the shared parts in the states a page load doesn't show: the front page's search results, ⌘K, the side panel open, Ask Sig with an answer, the Signal loading and failing, the weekly email, the community domain's root.

How it was measured: the art director's capture (`.design/data`, `.design/shots`), plus my own live pass (`.design/work-typography/r23/`): every website page scrolled through so what plays in is there, then every text element's computed type and the lines it breaks into, and at 1440 and 390 the faces Chrome really drew each node with (CDP `CSS.getPlatformFontsForNode`), and each served font's character map. Ask Sig was given a canned answer (the stream `scripts/check_sig.mjs` uses). The working tree includes the art director's uncommitted weekly-email change of today (`scripts/build_pages.mjs`, `weekly/1/email.html`). Evidence images: `.design/evidence/design-typography/`.

## 1. The state of the area

Headlines are one thing in both apps (wide 800 capitals, −0.028em, 1.0 to 1.04 leading, balanced, the same clamps for every page's h1 and h2), and the forms inherit Mona Sans everywhere; what doesn't read as one brand is everything under the headline: the Community Signal is set nine ways, numbers are tracked and drawn bold in some places and not others, labels and tags still carry the November 12 lowercase in Ask Sig and on every fact sheet, and the community's front door and its post titles are set as another product.

Counts: 24 findings: 6 high, 12 medium, 6 low.

## 2. Findings, most visible first

### TYPE-01 · high · The Community Signal, the site's signature number, is set nine ways
- **Pages and widths:** the front page (top card, finale, spectrum, Join band, the example, the search results) and /how-it-works/ at every width; every fact sheet with a Signal; the community's spaces, posts and Signal page.
- **Selectors and evidence** (`01-signal-score-nine-ways.png`, measured at 1440):

  | Where | Rule | As set |
  | --- | --- | --- |
  | Front page, the Signal card | `home.css:145` `.sx-score`, `:146` `.sx-dec` | Mona Sans 650 at 125%, 117.6px, −0.045em, proportional figures |
  | Front page and /how-it-works/, finale | `home.css:753` `.hs-n` | Mona Sans 800 at 125%, 96px, −0.03em |
  | /how-it-works/, step 5's drawing | `svg text.hs-wide` | Mona Sans 800 at 125%, 32px |
  | Front page, the spectrum's picked bar | `home.css:205` `.sx-lab b` | Mona Sans 650 at 125%, 12px |
  | Front page, Join band | `home.css:453` `.fp-c-t b` and `:454` `.fp-c-t .up` | Mona Sans 600, 16px; "▲ 0.3" in Mona Sans |
  | Front page, the example's plate | `home.css:406` `.fp-vs .vs-fig-v b` | Monaspace Neon 500, 52px |
  | Every fact sheet | `library/library.css:145` and `:270` `.sig-top .n` | Monaspace Neon 700, drawn bold from the 400 file, 68px, −0.055em |
  | Community, a space and a post | `web/styles.css:346` `.sig-big b` | Monaspace Neon 700, 54px, −0.05em; the point takes a whole cell ("89 . 3") |
  | Front page search results | `home.css:56–59` `.hp-facts .hp-sig` | Mona Sans 400, 13px |

- **Rules broken:**
  - BRAND.md *Type*: "Numbers: Monaspace Neon … with tabular figures".
  - tokens: `number-lg` is mono 500 at 40px, "A Signal standing on its own"; mono is untracked.
  - *The book disagrees with what was built on purpose.* `design/pack/look.mjs:31–32` sets "A name or a score: the same face a step lighter, as written (home.css .sx-score)": Mona Sans 650 at 125%, −0.025em. The front page and every share piece and post use it. Mona Sans's default figures are proportional (a 1 is 325 units wide, a 0 is 612), so the top's score changes width as it counts up.
- **Fix: one rule by size** (the art director's call, since the book and the pack disagree). I recommend the built one for display sizes, and mono for everything else:
  1. **A Signal or figure standing on its own at 40px and up takes the score style:** `font-weight:650; font-stretch:125%; letter-spacing:-.025em; font-variant-numeric:tabular-nums`, face `var(--head)`.
     - `home.css:145` `.sx-score`: letter-spacing −.045em → −.025em; add `font-variant-numeric:tabular-nums`. `:146` `.sx-dec`: −.02em → −.025em.
     - `home.css:753` `.hs-n`: `font:800 expanded clamp(56px,7cqi,96px)/1` → `font:650 expanded clamp(56px,7cqi,96px)/.92 var(--head)`; −.03em → −.025em; add tabular-nums.
     - `library/library.css:145` `.sig-top .n`: `font:700 68px/.9 var(--mono); letter-spacing:-.055em` → `font:650 expanded 68px/.92 var(--head); letter-spacing:-.025em; font-variant-numeric:tabular-nums`. `:270`: 64px, the same.
     - Community `web/styles.css:346` `.sig-big b`: `font:700 54px/1 var(--mono); letter-spacing:-.05em` → `font:650 54px/.92 var(--head); font-stretch:125%; letter-spacing:-.025em; font-variant-numeric:tabular-nums`.
     - `home.css:406` `.fp-vs .vs-fig-v b` ("0.0", "35–84%"): `font:500 clamp(40px,2.5cqi + 16px,64px)/.82 var(--mono)` → `font:650 expanded clamp(40px,2.5cqi + 16px,64px)/.92 var(--head); letter-spacing:-.025em; font-variant-numeric:tabular-nums`.
  2. **Every Signal under 40px is mono data:**
     - `home.css:205` `.sx-lab b`: `font:650 expanded 12px/1 var(--head)` → `font:400 13px/1 var(--mono)`.
     - `home.css:453–454`: `.fp-c-t b,.fp-c-t .up{font-family:var(--mono);font-weight:400}`. Write the move "▲0.3", as the book does ("89.3 ▲0.3").
     - after `home.css:59`, add `.hp-sig{font-family:var(--mono)}`.
     - `ai/ai.css:383` `.vx-score` (Ask Sig's pick cards, by its rule; not on screen in the captured answer): 600 16px → 400 13px.
  3. **The book:** `tokens.json` `number-lg` becomes the score style above, and BRAND.md *Type* adds one sentence: "A Signal standing on its own at 40px and up is set in the score style (Mona Sans 650 at 125%, −0.025em, tabular figures), as the front page and the brand pack set it; every other number is Monaspace Neon."

### TYPE-02 · high · Totals and counts are set eight ways, and mono is tracked and drawn bold
- **Pages and widths:** the front page, the Library, the story, every goal page, the status tracker and every fact sheet, plus every community screen; all widths. Evidence: `02-totals-and-counts-many-ways.png`.
- **Measured, website:**
  - Front page totals (`home.css:81` `.sx-stats dd`): mono 500, 28px, untracked.
  - The Library's totals (`library/library.css:55`, `:266`, `:342` `.lib-stats dd`): mono 500, 36px, −0.045em.
  - A goal page (`pages/pages.css:18` `.pg-anyway b`): mono 500, 31px, −0.04em.
  - The story's ring (`styles.css:741`, `:795` `.sy-ring-n b`): mono 600, drawn bold, 64px, −0.04em.
  - The example's figures by use (`styles.css:509` `.vs-cell.pl .vs-v b`): mono 24px, −0.04em.
  - The spectrum's group counts (`home.css:213` `.sx-glab b`): Mona Sans 650 at 125%.
  - The side panel's counts (`styles.css:618` `.lt-n`): Mona Sans 13.5px.
  - The status tracker: the same count is mono 13px in its jump chip (`pages/pages.css:44`) and Mona Sans 500 12.5px beside its group's head (`.st-group-h .st`, `library/library.css:434`).
- **Measured, community:** every total is mono 700, tracked −0.03 to −0.05em:
  - `web/styles.css:391` `.hero-stats b` 24px and 28px; `:400` `.brow .sc` 20px; `:429` `.space-card .sc` 24px; `:461` `.me-card b.pts` 26px; `:488` `.pod .p` 17px; `:501` `.stat b` 22px; `:707` `.lib-row .sc`; `:710` `.big-sc b.num`; `:762` `.step-l .cnt b`.
  - The explore chips' counts (`a > span.n`) are in Mona Sans.
- **Drawn bold:** the website ships only `monaspace-neon-400.woff2` (weights 100–549), so 41 kinds of mono at 600 or 700 are synthesised bold. Among them `.lc-sig` 600 (`library/library.css:82`, the Library's and goal pages' Signal chips), `.ref` 600 (`:13`) and kit `.mh-signal` 600, `.mh-bm-op`, `.mh-bm-src`, `.mh-bm-dir` (`kit/kit.css:35`, `:87`, `:91`, `:99`). The community ships a real bold. The same kit pieces therefore render differently in the two apps.
- **Rules broken:** tokens `number` (mono 500, 26px) for "a total on a board" and `data` (mono 400, 13px); "Mono only for numbers, untracked."
- **Fix:**
  - **Totals:** `font:500 26px/1 var(--mono); letter-spacing:0` at `home.css:81` (28→26), `library/library.css:55/266/342` (36/32→26, −.045em→0), `pages/pages.css:18` (31→26, −.04em→0), `styles.css:509` (−.04em→0), and the community rules above (700→500, tracking→0; 22/24/28 → 26 for totals, 13 for scores in rows).
  - **Counts in chips and tags:** `font:400 13px/1 var(--mono)` at `home.css:213` `.sx-glab b`, `styles.css:618` `.os-ctx .lt-n`, `.st-group-h .st`, and community `a > span.n`.
  - **The story's "12"** (64px) takes TYPE-01's score style.
  - **Mono weights 400 and 500 only, in both apps:** `.lc-sig`, `.ref`, `.mh-signal`, `.mh-bm-op/-src/-dir` 600→400, and the community's `.tick-i b`, `.mv`, `.count`, `.vote b`, `.lb-row .n/.p`, `.quest .rw` 600→400 or 500. The community's `monaspace-neon-700.woff2` is then unused and can go.

### TYPE-03 · high · Every fact sheet's glance sets its radar in the code face, lowercased, and lowercases its date
- **Pages and widths:** every fact sheet with a radar (the 122 full sheets), all widths. Evidence: `04-fact-sheet-glance-mono-lowercase.png`.
- **Measured:**
  - The radar's labels ("weight", "muscle", "focus & mood"…) are Monaspace Neon 500 12px, forced lowercase (`library/library.css:31–33` `.radar .rd-label{font:500 12px var(--mono);text-transform:lowercase}`), beside a legend in Mona Sans.
  - The "Checked" line reads "oct 28, 2026 against 5 sources" (`library/library.css:420` `.le-facts .dd-log{…text-transform:lowercase}`).
- **Rules broken:** "Words are never set in it (the owner's rule, November 18)"; labels in sentence case; the month is a proper name. `scripts/check_clean.mjs` misses SVG text.
- **Fix:**
  - `library/library.css:31`: `font:500 12px var(--mono);…;text-transform:lowercase` → `font:500 13px var(--body);text-transform:none`. Keep the container-query sizes at `:32–33` (13.5px and 15px).
  - `:420` `.le-facts .dd-log`: `text-transform:lowercase` → `none`.

### TYPE-04 · high · Ask Sig's answers, rack and side set their labels and tags in lowercase
- **Pages and widths:** /sig/ and /ai/ with a conversation, at 1440, 1024 and 390. These appear on every answer: "how I got here", "checked by the safety agent", and the rack once a compound is named. Evidence: `03-ask-sig-lowercase-labels.png`.
- **Measured:**
  - "for your doctor", and a "copy" button beside a "Copy" button (`ai/ai.js:1128`, `:1130`).
  - "checked by the safety agent" (`ai/ai.js:1729`) and "how I got here" (`:517`).
  - The tags "worth checking" and "good to know", forced lowercase (`ai/ai.css:219` `.lvl`), and the agent's own name forced lowercase (`ai/term.css:224` `.ctag b`; also `ai/ai.css:434` and `ai/term.css:245` `.src-k`, `ai/ai.css:371` `.vx-k`).
  - The rack: "what it may move" (`sig/index.html:120`); "pushed both ways" (`ai/markers.js:21`, shown alone at `:148`); the key "up", "down", "where it usually sits", "tap a tube" (`:178`); and the tubes' tags "both ways", "checked", "noted", and "hgh ↑", "encl ↑" (`:156`, with the compound's name cut and lowercased at `:30`).
- **Rules broken:** "Kickers, labels, tags, table heads, captions and tabs are Mona Sans in sentence case"; agents' names are written as the book names them ("Safety agent", "Synergy auditor"). This is the November 12 "labels are lowercase" style, still alive here.
- **Fix:**
  - CSS: `text-transform:lowercase` → `none` at `ai/ai.css:219`, `:371`, `:434` and `ai/term.css:224`, `:245`. Raise `.lvl` from 12px to 13px.
  - Casing in the copy (casing only):
    - `ai/ai.js:517` "How I got here"; `:1128` "Copy"; `:1130` "For your doctor"; `:1729` "Answered" and "Checked by the Safety agent".
    - `sig/index.html:120` "What it may move".
    - `ai/markers.js`: capitalise `STATE_SAID` where it stands as its own line (`:148`; keep it lowercase inside the summary at `:114`), the tags at `:156` ("Both ways", "Checked", "Noted"), and the key at `:178` ("Up", "Down", "Where it usually sits", "Tap a tube"). At `:30`, drop `.toLowerCase()` so the tags read "HGH ↑", "Encl ↑".

### TYPE-05 · high · The community sets a member's own title and handle in capitals
- **Pages and widths:** every post page and every profile, all widths. Evidence: `05-community-member-words-in-capitals.png`.
- **Measured:**
  - Post page: "MONTH 3 ON TIRZEPATIDE (PRESCRIBED): APPETITE, ENERGY AND ONE ROUGH WEEK" (`h1.post-title`, 18px 600 at 100%, uppercase). The capitals come from `web/styles.css:918` `h1,h2{…text-transform:uppercase}`. `.post-title` (`:287`) resets the font but not the case. The same title in the feed is sentence case, 17.5px.
  - Profile: "U/GLP_JOURNAL" (`ui/pages/profile.js:32` h1).
  - This is the November 13 audit's TYPE-12, back.
- **Rules broken:** what people write stays as written; headings inside a card or a post are sentence case; the h3 token says "a post's title".
- **Fix:**
  - `web/styles.css:287` `.post-title{…}`: add `text-transform:none`.
  - Add `.profile-h h1{font-weight:650;letter-spacing:-.025em;text-transform:none}`. A handle is a name: the pack's name style, as written.

### TYPE-06 · high · The community domain's front door is set in another product's faces
- **Page:** community.miraclehealth.us root. Until the community opens, every visitor gets `site/soon.html` and `site/soon.css` (`.github/workflows/pages.yml:91–96` copies them and `unbounded.woff2` to the root), at all widths.
- **Evidence:** `14-community-root-other-faces.png`.
  - "Unhyped Community" is set in **Unbounded** 700 (`site/soon.css:1`, `:8`), with sentence case and −0.01em.
  - Every other line is in the system face: `font:17px/1.55 system-ui,…,Roboto,sans-serif` (`:5`), drawn by Inter here.
  - The ground is warm brown in a dark scheme and cream in a light one, with coral.
- **Rules broken:** "only Mona Sans, Mona Sans Display and Monaspace Neon"; "Never substitute Inter, Roboto or a system serif"; one set of colours whatever a device is set to (for the colour lead).
- **Fix:**
  - `site/soon.css:1`: the Unbounded `@font-face` → Mona Sans (`src:url('fonts/mona-sans.woff2')`, weight 200 900, stretch 75% 125%).
  - `:8` `h1`: `font:700 clamp(26px,6vw,40px)/1.15 'Unbounded',…; letter-spacing:-.01em` → `font:800 clamp(26px,6vw,40px)/1.04 'Mona Sans',system-ui,sans-serif; font-stretch:125%; letter-spacing:-.028em; text-transform:uppercase`.
  - `:5` body: → `font:16px/1.55 'Mona Sans',system-ui,sans-serif`.
  - `pages.yml:96`: copy `web/fonts/mona-sans.woff2` instead of `unbounded.woff2`, and delete `web/fonts/unbounded.woff2`.
  - Colours: the colour lead's (black ground, the electric blue action, no `prefers-color-scheme` swap).

### TYPE-07 · medium · Labels are set eight ways, and three of them carry the headline's tracking
- **Pages and widths:** the fact sheets, compare pairs, Ask Sig, the Library, the front page and the side panel in both apps, at all widths. Evidence: `12-labels-eight-ways.png`.
- **Measured** (the job is "label", the token is Mona Sans 600, 13px, untracked):
  - `h2.bl-k` "The bottom line" (`library/library.css:295`): 13px 400, −0.028em.
  - `h2.cmp-k` (`pages/pages.css:68`): 14px 400, −0.028em.
  - `h2.sg-k` "Chats on this device" (`ai/term.css:315`): 13px 500, −0.028em.
  - All three inherit `letter-spacing:var(--head-ls)` from `styles.css:71` `h2`.
  - `.toc .label`, `.side-card .label` (`library/library.css:383`): 13.5px 400.
  - `.moves-k` (`:312`) and `.kick-sm` (`:153`): 13px 400.
  - `.sx-k` (`home.css:150`), `.fp-vs .vs-k` (`:403`), `.fp-c-k` (`:451`): 13px 500.
  - `.sx-pop` "Popular" (`home.css:72`): 14px 400.
  - The side panel's group name: "More" `.os-k` 13px 400 (`styles.css:597`) on the website, against the community's `.nav-sec .kick` 13px 600 (`web/styles.css:203`).
- **Rule broken:** tokens `label` (13px, 600, sentence case, in the body face).
- **Fix:**
  - Set `font:600 13px/1.4 var(--body); letter-spacing:0` at `library/library.css:295`, `pages/pages.css:68` and `ai/term.css:315`.
  - Delete `library/library.css:383`, so `.label` applies.
  - Weight 400 or 500 → 600 at `library/library.css:312`, `:153`; `home.css:150`, `:403`, `:451`; and `styles.css:597` `.os-k`.
  - `home.css:73` `.sx-pop-k`: add `font:600 13px/1 var(--body)`.

### TYPE-08 · medium · Kickers carry a middle dot
- **Pages and widths:** all widths. Evidence: `08-kickers-with-a-dot.png`.
  - Every fact sheet: "Peptide · Metabolic & weight" (`p.kick.lime`, from `scripts/build_library.mjs:92` `familyLine`, used at `:642`). The same line heads every card on the Library (300), the goal pages and the blends (`:358`, `:557`).
  - The Library: "The Library · live community data" (`:374`).
  - Community, a space: "Peptide · Healing & recovery".
  - Community, Explore: "300 in the library · 0 stacks" (`web/ui/pages/explore.js:29`).
  - Community, a profile: "Member #3 · since Oct 2026", which becomes three bits for a moderator (`web/ui/pages/profile.js:31`).
- **Rule broken:** BRAND.md *Type*: a kicker is "sentence case, no rule before it, no dots in it".
- **Fix (format only):**
  - `scripts/build_library.mjs:92` `familyLine`: `${SINGULAR[c.family] || c.family} · ${c.category}` → `${SINGULAR[c.family] || c.family}, ${c.category[0].toLowerCase()}${c.category.slice(1)}`, giving "Peptide, metabolic & weight".
  - `:374`: "The Library, live community data".
  - `explore.js:29`: "300 in the Library, 0 stacks" (the Library is a proper name).
  - `profile.js:31`: join with ", " ("Member #3, since Oct 2026, moderator").
  - The community space kicker: the same `familyLine` change in its page.

### TYPE-09 · medium · Card titles are set as page headings, in capitals
- **Pages and widths:** all widths. Evidence: `21-card-titles-as-page-headings.png`.
  - The founding reporters' two cards ("WHAT A FOUNDING REPORTER GETS").
  - "THE SHORT VERSION" on the method and privacy pages.
  - My stack's empty state ("NOTHING KEPT HERE YET").
  - A shared plan ("BUILD YOUR OWN PLAN").
  - Every sheet still being written ("FACT SHEET IN PROGRESS", 169 pages).
  - All are h2 at 18.2px (1440), 800 at 125%, capitals, inside a framed card.
- **For comparison:** the community sets a card's title as h3, 16px 600, sentence case ("How the number moves").
- **Rules broken:**
  - tokens `h2`: "A card's title is h3, never this".
  - BRAND.md: "Headings inside an answer or a card stay semibold and in sentence case".
- **Fix:** one rule in `styles.css`, after `:72`: `.fd-card h2,.doc .short h2,.my-empty h2,.plan-cta h2,.pending-box h2{font:600 16px/1.3 var(--body);letter-spacing:-.01em;text-transform:none}`. Keep the elements for structure.

### TYPE-10 · medium · The weekly email's band, at the foot of every page, is the one statement band without the headline
- **Pages and widths:** every website page, all widths. Evidence: `10-weekly-band-vs-statement-bands.png`.
- **Measured:** "The Signal, weekly." `.foot-news>p b` (`styles.css:331`, overridden at `:526`): Mona Sans 600, 22px, sentence case, −0.012em.
- **For comparison:**
  - On the same violet band, Join's head (`.fp-join-copy h2`) and How it works' head (`.hs-head`) are the brand's headline: 800 at 125%, capitals, −0.028em.
  - So is the email itself (`scripts/build_pages.mjs:408` `HEAD`).
- **Rule broken:** BRAND.md *The brand pack*: "A statement (Join, the weekly email) … the logo and the address along the top, then one kicker, the headline and one line under it".
- **Fix:** `styles.css:526` (and delete `:331`'s font): `.foot-news>p b{font:800 expanded clamp(20px,.6vw + 14px,26px)/1.04 var(--head);letter-spacing:var(--head-ls);text-transform:uppercase;text-wrap:balance}`.

### TYPE-11 · medium · The line "No miracles. Just what happened." is a headline without its gradient on About; the story's two-part headline is a third treatment
- **Pages and widths:** /about/ and /story/, all widths. Evidence: `09-the-line-and-the-punchline.png`.
- **Measured:**
  - About's h1 is the line, both sentences plain white (`scripts/build_pages.mjs:92`, `docHead`).
  - About's own share card (`img/og/about.jpg`) sets it with the gradient, as the front page does (`home.css:29`, scoped to `.sx-hero h1 em` only).
  - The story's h1 sets its last sentence in grey (`styles.css:743` `.sy-hero h1 em{color:var(--text-2)}`).
- **Rule broken:** BRAND.md *Voice*: "in a headline its second sentence takes the punchline's gradient".
- **Fix:**
  - Move `home.css:29–30` to `styles.css` as `.punch{…}` (and `@media (forced-colors:active){.punch{…}}`). Mark the front page's em `class="punch"`. The gradient count in `design/baseline.json` is unchanged: one rule moves.
  - `scripts/build_pages.mjs:92`: `docHead('About', 'No miracles. <em class="punch">Just what happened.</em>', …)`. `stop()` at `:74` already allows a closing tag.
  - Story: `styles.css:743` `.sy-hero h1 em{color:var(--text-2)}` → use `.punch`. BRAND.md *Colour* names the story's headline among the gradient's places.

### TYPE-12 · medium · A name as a title is set three ways on the front page; the example's is the November 12 style
- **Pages and widths:** the front page, all widths. Evidence: `11-titles-in-other-styles.png`.
- **Measured:**
  - The Signal card's name "BPC-157" (`home.css:111` `.hs-title`): 650 at 125%, 26px, −0.025em.
  - The example's "BPC-157" (`h3#vs-name`, `home.css:399`, `:618`, `:684`): Mona Sans 600 at 100%, 32px, 38px or 28px, −0.02em. This is the retired "headlines in Mona Sans at its normal width, semibold" (decision, November 12, call 1).
  - Its "Limited evidence" figure (`b.w`, `:407`, `:610`, `:621`, `:628`): 600, 24px to 40px.
  - "Noise" and "Signal" (`h3.sn-name`, `home.css:258`, `:662`): 800 at 125%, 40px, sentence case.
- **Rule broken:** one style per job. The brand pack's name style (`design/pack/look.mjs:32` `NAME`) is the one the card uses.
- **Fix:**
  - `home.css:399`: `.fp-vs .vs-head h3{font:600 32px/1.1 var(--body);letter-spacing:-.02em}` → `{font:650 expanded 26px/1.15 var(--head);letter-spacing:-.025em}`. Delete `:618` and `:684`.
  - `:407`: `.fp-vs .vs-fig-v b.w` → `font:650 expanded 26px/1.1 var(--head);letter-spacing:-.025em`. Delete `:610`, `:621`, `:628`.
  - `:258`: `.fp .sn-name` 800 → 650, `letter-spacing:-.025em`.

### TYPE-13 · medium · The Signal's drawings write words in tracked mono capitals, and render differently in the two apps
- **Pages and widths:** the Library's "How the Signal is made"; the takeover line on every fact sheet with a Signal; the community's Signal page; all widths.
- **Evidence:** `07a-library-flow-figure.png`, `07b-takeover-line.png`, `07c-flow-figure-two-apps.png`.
- **Measured:**
  - "PUBLIC FORUMS · COUNT AS 1 REPORTS", "IN 0 SIGNALS", "MEMBERS HERE · FIRST-HAND", "THE FORMULA", "• 65 HOW WELL IT WORKED • 15 HOW MUCH PEOPLE AGREE …", "FORUM DATA", "25% · BACKED": Monaspace Neon at 7 to 9.5px, tracked +0.5 to +1.4px (`library/signalviz.js:90`, `99`, `108`, `131`, `133`, `143`, `145–146`, `208`, `249`, `282`, `297`, `323–326`; `library/library.js:281` uppercases the name). This is the November 13 kicker style.
  - The same drawing's names and numbers (`.t-head`) are Mona Sans 600 at 100%, −0.02em on the website (`library/library.css:20`, `styles.css:233`), but "Mona Sans Display" 700, wide, −0.016em in the community (`web/styles.css:720`). "Reddit", "51" and "0%" look like two different drawings.
- **Rules broken:**
  - Words never in the code face; untracked mono.
  - Nothing a reader needs under 13px.
  - *The book disagrees with a decision:* BRAND.md's exemption names only How it works, the prints and the body map; the community's decision of November 20 "left alone, on purpose" the flow and the takeover line.
- **Fix:**
  - In `library/signalviz.js` (and `web/kit/signalviz.js`, which is identical), labels get a new `class="t-lab"`: `.t-lab{font-family:var(--body);font-weight:600;letter-spacing:0}`. Write them in sentence case, drop the `letter-spacing` attributes, and set font-size ≥ 11 in the drawing's units. Numbers stay `t-mono` at 400. Drop `.toUpperCase()` at `library/library.js:281` and `signalviz.js:282`.
  - One `.t-head` in both apps: `font-family:var(--head);font-weight:650;font-stretch:125%;letter-spacing:-.025em`.
  - BRAND.md *Clean, not costume*, "What stays", lists the drawings exactly.

### TYPE-14 · medium · The side panel's Library tree is set two ways; on the Library it is still a folder list
- **Pages and widths:** /library/ with the panel open, all widths. Evidence: `06-side-panel-tree-two-ways.png`.
- **Measured:**
  - On the Library: "library/ 300", "▸ peptides/ 79", "▸ hormones/ 22" … in lowercase with slashes (`scripts/build_library.mjs:453–456`, `fam.toLowerCase()` plus `/`).
  - The "▸" is drawn by DejaVu Sans; Mona Sans doesn't have U+25B8.
  - The counts are in Mona Sans.
  - The note "122 have a full fact sheet; the rest are being checked." is 11.5px (`styles.css:627` `.os-ctx .lt-more`) and is clipped at the panel's foot at 1440×900.
  - On a fact sheet the same panel reads "The Library", "Peptides 56" … by name (`:625–631`), as the decision of November 18 says.
- **Rules broken:** sentence case in navigation; one component, one look; 13px floor. The slashes are code costume (for design-clean).
- **Fix:**
  - `scripts/build_library.mjs:454–455`: write it as `:626–630` does: `<a href="/library/" aria-current="page">The Library</a><span class="lt-n">${catalog.length}</span>` and `${e(fam)}<span class="lt-n">…</span>`, without the "▸ " span or the "/".
  - `styles.css:618`: `.os-ctx .lt-n{font:400 13px/1 var(--mono)}`.
  - `:627`: `font-size:11.5px` → `13px`.

### TYPE-15 · medium · Glyphs the served fonts don't have are drawn in system faces
- **Pages and widths:** the website and the community, all widths. Evidence: `13-glyphs-in-system-faces.png`. The served Mona Sans has 221 glyphs, and both faces' character maps were checked.
  - **→** U+2192: "Took it? Share how it went →", "How the score is made →", "Studies: limited →" (`index.html:105`, `.sx-arr`), drawn by Inter here.
  - **▲** U+25B2: the Join band's "▲ 0.3" (`.fp-c-t .up`), drawn by Inter.
  - **▸** U+25B8: the Library tree (TYPE-14) and Ask Sig's "How I got here" (`ai/ai.js:517`), drawn by DejaVu Sans.
  - **←** U+2190: the community's back link "← s/Tirzepatide" on every post. **▾** U+25BE: the community's Signal page.
  - **⌘** U+2318: in neither face. Every page's top bar shows "⌘K" on an Apple device (`lib/os.js:47–50`), so a system face draws it. So does the 404's "Go anywhere · ⌘K".
- **Rule broken:** BRAND.md *Type*: "Never substitute Inter, Roboto or a system serif"; only the three faces.
- **Fix:**
  - Arrows and chevrons come from the icon set (`design/pack/icons.json`: `arrow-right`, `chevron-right`, `chevron-down`), as the three ways in already do. In `index.html:105` and `lib/sighero.js:99`, replace `<span class="sx-arr">→</span>` with the inline `arrow-right` SVG (16px, `currentColor`). In `ai/ai.js:517`, use `chevron-right`/`chevron-down`. In the side tree, drop it (TYPE-14). In the community, add `arrow-left` to the set and use it for the back link.
  - Moves: set the arrow in mono, which has ▲▼ (TYPE-01's `.fp-c-t .up`).
  - ⌘: add a `command` icon to `icons.json` (24 grid, 1.6 stroke) and draw `.kbd-k`'s ⌘ with it on Apple devices.

### TYPE-16 · medium · Running text over 75 characters a line
- **Pages, widths and measurements** (evidence: `15-lines-over-75-characters.png`):
  - Ask Sig's greeting, 82 characters (`ai/ai.css:42` `.ai-lede{max-width:62ch}`), at 1440, 1024 and 768.
  - Sig's answers, 83 (`.tm .prose p`, 609px).
  - Every page's foot disclaimer at 1024 and 768, 82 (`styles.css:302` `.foot-say`, no max-width).
  - A fact sheet's print caption at 1024 and 768, 92 to 95 (`library/library.css:388` `max-width:72ch`).
  - The method's baselines table, 98 (`.mtable td`).
  - The community's Signal lede, 80 (`web/styles.css:223` `.lede{max-width:62ch}`).
- **Cause:** a `ch` is Mona Sans's zero (612 units), about 1.25 average characters, so 62ch sets about 80.
- **Rule broken:** paragraphs at most about 75 characters.
- **Fix:**
  - `ai/ai.css:42` and `web/styles.css:223`: `max-width:62ch` → `56ch`.
  - `library/library.css:388`: `72ch` → `56ch`.
  - `styles.css:302`: add `max-width:56ch` to `.foot-say`.
  - `ai/term.css:217`: `.tm .prose p{max-width:58ch}`.
  - `styles.css:437`: `.method .mtable td{max-width:56ch}`.

### TYPE-17 · medium · Text a reader needs is set under 13px, and the tokens allow it
- **Pages, widths and measurements** (evidence: `17-text-a-reader-needs-under-13px.png`):
  - Ask Sig's line under the box to write in ("Sig is an AI. No doses, sellers or diagnosis…"): 12px, 11px on a phone (`ai/term.css:152`, `:282`).
  - The website's evidence and status tags: 12.5px, 629 on a 1440 pass (`library/library.css:434`).
  - The top bar's key hint: 11px, every page (`styles.css:650`).
  - The story's run log on a phone: 11.5px (`styles.css:798`).
  - The spectrum's axis: 10.5px (`home.css:196`).
  - The side tree's note: 11.5px (TYPE-14). The drawings: 7 to 9.5px (TYPE-13).
  - Community: the Signal's totals' captions 10px (`web/styles.css:737`); a post's actions 12px (`:295` `.act`); moves' reasons 12px (`:413`); `.xs` meta 12px (`:59`); the phone tab bar 12px (`:836`); the tape 12.5px and 11.5px (`:73–76`).
- **Rule broken:** BRAND.md *Clean, not costume*: "Tiny text a reader needs: 13px and up". *The book disagrees with the tokens:* `caption` is 12.5px and `fine` is 12px.
- **Fix:**
  - `tokens.json`: `caption` and `fine` → 13px.
  - `ai/term.css:152` and `:282` → 13px.
  - `library/library.css:434` `.ev,.st,…` 12.5px → 13px.
  - `styles.css:650` `.os-search kbd` 11px → 11.5px (`tick`).
  - `:798` → 13px. `home.css:196` → 11.5px.
  - Community `:737`, `:295`, `:413`, `:59` and `:836` → 13px. The tape's names → 13px, its numbers → `data` 13px.

### TYPE-18 · medium · The lede under a page's headline is set differently in the two apps
- **Pages and widths:** all the community's screens, all widths. Evidence: `20-page-head-ledes-two-apps.png`.
- **Measured:**
  - Website: the lede sits under the h1 at 18px/1.6, text-2, 50ch (`styles.css:154` `.lede`, `pages/pages.css:7` `.pg-intro`).
  - Community, Home, Signal, How it works, a space and a profile: under the h1 at 15px (`web/styles.css:223` `.lede`, `:255` `.feed-hero-cap`).
  - Community, Explore, Signal Builders, Popular and Quests: beside the h1 at 14px/1.5 in a 300px column (`.cap`, `:224`), pushed right by `.page-h{justify-content:space-between}` (`:218`).
- **Rules broken:**
  - tokens `lede` (18px, under a headline).
  - The owner's rule (November 18): "Every heading stands above its block … a heading set beside its block only fills the width artificially".
- **Fix:**
  - `web/styles.css:223`: `.lede` → `font:400 18px/1.6 var(--body);max-width:50ch`.
  - `:255` `.feed-hero-cap` and `:224` `.cap` inside `.page-h` → the same.
  - `:218`: `.page-h{flex-direction:column;align-items:flex-start}`, so the lede stands under the h1 (layout lead to confirm).

### TYPE-19 · low · Running text outside 1.5–1.6 leading
- **Measured:**
  - Sig's answers at 1.65 (`ai/ai.css:124`, `ai/mind.css:43`) and 1.62 (`ai/term.css:217`).
  - A community post's body at 15.5px/1.65 (`web/styles.css:291`), while the same text in the feed is 15px/1.55.
  - The community's `.sig-tail` at 1.7 (`:1007`).
  - Signal and noise's list at 1.45 (`home.css:264`) and the ring's middle text at 1.42 and 1.45 (`home.css:338`, `:542` `.cr-read-t`).
- **Rule broken:** body at 1.5–1.6.
- **Fix:**
  - Line-height → 1.55 at all of these.
  - Also `web/styles.css:291` `.body` 15.5px → 15px, so a post reads as its excerpt does.

### TYPE-20 · low · One-offs and near-duplicates in the scale
- **Measured:** the full list, with counts and the size each should be, is in the appendix. In short:
  - Mona Sans uses 18 sizes on the website and 13 in the community.
  - Monaspace Neon uses 20 on the website and 15 in the community, where the tokens have 4: 11.5, 13, 26 and 40.
  - The jobs that split:
    - Labels and meta at 12, 12.5, 13 and 13.5.
    - Card copy at 15 and 15.5.
    - The front page's lede at 17.5 against 18 everywhere else.
    - Card display titles at 20, 21.2 (`library/library.css` via `styles.css:497` `.lib-explain h3`, one-off), 22 and 24 (`home.css:733` `.hs-who`).
    - Two sizes made by scaling (`.sx-of` 12.95, `.sx-sum` 13.95).
    - Key hints at 0.92em (13.34 and 16.56, `styles.css:723`).
    - "/100" at 14 and 16.
- **Rule broken:** the type scale in `tokens.json`.
- **Fix:** the appendix maps each to its scale size. The main lines:
  - `home.css:25` `.sx-hero .fp-lede` 17.5px → 18px, and `:749` `.hs-cap p` → 18px.
  - `styles.css:497` `.lib-explain h3` → 22px (20px on a phone).
  - `home.css:733` `.hs-who` 24px → 22px.
  - `home.css:147–148`: clamp to 13px and 14px fixed.
  - `styles.css:723` `.kbd-k{font-size:.92em}` → `1em`.
  - `.of` (`home.css:408`, `library/library.css:146`) → 13px.

### TYPE-21 · low · "0 of 10" is set in the code face, word and all
- **Pages and widths:** the Library ("Filling first", `library/library.js:191`), Ask Sig (`ai/ai.js:2442`) and the community's rail on Home, Popular, How it works, Rules, a space and Notifications (`web/ui/components/checks.js:267`); all widths.
- **Measured:** "of" in Monaspace Neon at 11.5 to 13px. `scripts/check_clean.mjs:128` flags words of three letters or more, so "of" passes.
- **Rule broken:** words never in the code face.
- **Fix:**
  - At all three, build `h('span', {class:'n'}, h('b', {text: fmt(f.reports)}), ' of ', h('b', {text: fmt(f.goal)}))`, with `.n{font-family:var(--body)} .n b{font:400 13px var(--mono)}` (community: `.focus-c` the same).
  - `check_clean.mjs:128`: `/[A-Za-z]{3,}/` → `/[A-Za-z]{2,}/`.

### TYPE-22 · low · The same level is set at two sizes
- **Measured:**
  - The h1 of /how-it-works/ is the section size: 36px at 1440 and 32.35px at 1024 (`home.css:778` `.fp-head h1`). Every other page's h1 is 32.78px and 27.79px.
  - The two hero h1s use two clamps: the front page 48px and the story 51.5px at 1440; 30px and 32.5px at 390 (`home.css:24`, `styles.css:742`).
  - The front page's search results set their row 15px 500 (`home.css:54`), and ⌘K sets the same row 14px 500 (`styles.css:690`).
- **Rule broken:** the same level looks the same on every page type.
- **Fix:**
  - `home.css:778` → the page clamp `clamp(26px,1.2vw + 15.5px,34.5px)`.
  - `styles.css:742` `.sy-hero h1` → the front page's `clamp(30px,3.2cqi + 12px,48px)`, with its container.
  - `home.css:54` `.hp-name` → `font:500 14px/1.3` (and `.hp-kind`).

### TYPE-23 · low · Paragraphs set right-aligned
- **Pages and widths:** /how-it-works/ at 1440 and 1024: steps 1, 3 and 5's four-line captions. Evidence: `19-right-aligned-paragraphs.png`.
- **Rule broken:** text left or centred.
- **Fix:** `home.css:747` `.hs-r .hs-cap{…text-align:right}` → `text-align:left`. Keep the box's position.

### TYPE-24 · low (the book) · The book and the tokens say other things than the type built
1. `tokens.json` `families.display` is "Mona Sans Display", but the website serves no face by that name. It sets `--head:'Mona Sans'` with `expanded` (`styles.css:40`). The community defines "Mona Sans Display" as the same file at 640–900 and 112.5–125% (`web/styles.css:14`). Say: "display: Mona Sans at 125% and 800 (the community names it Mona Sans Display)".
2. Headline entries still differ from what's built: hero 64/1.02, section 42/1.08, page 38/1.1 and h2 22/1.25, against clamps of 30–88, 26–36, 26–34.5 and 17–19, at 0.98 to 1.04. The decision of November 20 left this for its own change. Write the clamps and leading in the entries, and teach `scripts/design_check.mjs` the clamp ranges.
3. `caption` 12.5px and `fine` 12px sit under the book's 13px floor (TYPE-17).
4. `number-lg` against the pack's score style (TYPE-01).
5. *Clean, not costume*'s exemption list against the community's decision of November 20 (TYPE-13).
6. `body-app` (15px) is "the community app's copy", yet the website sets 767 elements of card copy at 15px. Rename it "card copy, both apps".
7. The comments that teach the next change are stale:
   - `styles.css:1–10`: "AlgoRx's look … one lime accent, photography, frosted glass cards"; "headlines … at its normal width and semibold; Monaspace Neon for chrome, logs and numbers".
   - `fonts/README.md`: "Numbers, labels and the code on Ask Sig's screen are set in Monaspace Neon".
   - the community's `site/r.css:1`: "Graphite".

## 3. Systemic: what should be one thing everywhere, and the one value

| What | Today | One value |
| --- | --- | --- |
| A Signal standing on its own (40px and up) | 9 treatments (TYPE-01) | Mona Sans 650 at 125%, −0.025em, tabular figures (the front page's and the pack's) |
| Every other number | mono at 400/500/600/700, tracked 0 to −0.055em, 20 sizes; some in Mona Sans | Monaspace Neon, 400 (`data`, 13px) or 500 (`number`, 26px), `tick` 11.5px for footnotes and axes, letter-spacing 0, in both apps |
| A name (compound, member) as a title | 650 wide / 600 normal / 800 wide / forced capitals | The pack's name style: 650 at 125%, −0.025em, as written |
| Label | 8 treatments | Mona Sans 600, 13px, sentence case, letter-spacing 0 (side panels' group names included) |
| Kicker | dots in it on sheets, the Library, the community | Mona Sans 600, 14px, one phrase, a comma where a dot was |
| Card title | h2 capitals in five places; h3 elsewhere | h3: 600, 16px (22px/20px for display cards), sentence case |
| Statement band head (Join, How it works, the weekly email) | the weekly email's is 600 sentence case | the headline: 800 at 125%, capitals, −0.028em |
| The line in a headline | gradient on the front page and share cards, plain on About, grey device on the story | `.punch`, shared |
| Lede under a page headline | 18px under (site), 15px under or 14px beside (community) | 18px/1.6, text-2, max 50ch, under the h1 |
| Running text | 1.45 to 1.7 | line-height 1.55; max-width 56ch (about 70 characters) |
| Smallest text a reader needs | 10 to 12.5px in places; tokens allow 12 | 13px |
| Arrows, chevrons, ⌘ | text glyphs falling back to system faces | the icon set's SVGs (add `arrow-left`, `command`); moves in mono |
| Case | `text-transform:lowercase` on 8 rules; capitals forced on member words | sentence case as written; capitals only in headlines |

## 4. The next update, in this area (website and community together)

1. **One type module, shared through the kit.** The roles above (headline, name, score, number, data, tick, label, kicker, lede, card copy, fine) are written once as classes and custom properties in `kit/kit.css`. Both apps already sync it (`sync_kit.sh`, and the community's check compares its kit with the site's). The page stylesheets then only choose a role. This touches every page in both apps, and it is the change that stops the two apps drifting: today the same drawing (`signalviz.js`) and the same pieces (`.mh-signal`, `.t-head`) render differently because each app defines its own.
2. **A type check that sees states, not only page loads.** Extend `scripts/check_clean.mjs` or `scripts/design_check.mjs`, run in the browser on page loads and on the states `check_sig.mjs` already drives (an answer, the side panel open, ⌘K), to fail on:
   - computed font-size under 13px for text that isn't a footnote or axis;
   - `text-transform` lowercase or uppercase outside headlines;
   - mono weight over 500 or letter-spacing other than 0;
   - words of two letters or more in mono, SVG text included;
   - a character outside the served fonts' character maps (read with fontTools at build time);
   - an h2 inside a card;
   - a paragraph over 75 characters.

   Most of this report's findings were invisible to today's checks because they live in SVG, in states, or in words of two letters.
3. **The number system, end to end.** Score, number, data and tick, with tabular figures where Mona Sans carries a number, so the front page's count-up doesn't change width. The community's bold mono file then goes (one fewer font on every community load), and the fact sheet, a space and the front page show the same Signal the same way. This touches the front page, every fact sheet, the Library, the goal pages, the story and every community screen.
4. **Measure in characters, by token.** A `--measure` token (56ch in Mona Sans, about 70 characters) and a `--measure-lede` (50ch), used by every paragraph rule in both apps (`.lede`, `.prose`, `.foot-say`, `figcaption`, `.cap`, tables' cells), replacing the 52/58/62/72ch values scattered today. This touches Ask Sig, the foot of every page, the fact sheets and the community's ledes.
5. **The community's public surfaces in the brand's type before launch.** These are the opening-soon root (TYPE-06), the public report pages (`site/r.css`, "Graphite") and the sign-up and weekly emails' fallback face. Where an email app has no Mona Sans, set the headline's fallback tracking to 0 so Helvetica capitals don't crowd; −0.028em is tuned for Mona Sans at 125%. These are the pages people see before they ever sign in.

## Appendix: sizes in use, with counts, and the scale size each should be

Counts are text elements on one pass of every page at that width (live pass for the website, the art director's capture for the community).

**Website, Mona Sans (normal width), 1440** (390 in brackets where it differs):
- 11 [4] → 13
- 11.5 [39] → 13
- 12: 14 [8] → 13
- 12.5: 629 [627] → 13 (tags)
- 12.95 and 13.95: 1 each → 13, 14
- 13: 696 (label ✓)
- 13.5: 395 (nav ✓)
- 14: 585 (kicker, small ✓)
- 14.5: 263 (button ✓)
- 15: 767 [859] (card copy: name it in the tokens)
- 15.5: 14 → 15
- 16: 994 (body ✓)
- 17.5: 13 → 18 for ledes, 17.5 kept for list titles
- 18: 64 (lede ✓)
- 20 [17], 21.2: 2, 22: 29, 24: 6 → 22 (20 on a phone)
- 28 [2], 32: 1, 38: 1 → the name style (TYPE-12)

**Website, wide (headline face):**
- 18.19 (h2): 90
- 32.78 (h1): 22
- 35.72 and 36 (section): 16
- 40 (`.sn-name`): 2
- 48, 51.5, 56 and 96 (hero, bands, finale)
- 117.6 (`.sx-score`)
- 12, 14, 15 and 26 (wide sub-styles: `.sx-lab b`, `.sx-glab b`, `.sx-band-t b`, `.hs-title`): numbers → mono; titles → the name style

**Website, Monaspace Neon, 1440:**
- 10.5 (axis, seals) → 11.5
- 11: 81 (footnote refs 41, body-map refs 35, key hint) → 11.5
- 11.5: 8 ✓
- 12: 83 (card Signal chips 71, ranges, parts) → 13
- 13: 31 ✓
- 13.34 and 16.56 (0.92em keys) → 1em
- 13.5 and 14 → 13
- 16 ("/100") → 13
- 20 (How it works' boxed numbers: the drawings' language, kept)
- 24, 28, 31 and 36 (totals) → 26
- 52, 64 and 68 → the score style

**Community, Mona Sans, 1440:**
- 10: 5 → 13
- 12: 338 (reasons 88, actions 42, meta) → 13
- 12.5: 1,361 (tape 1,258, tags, badges) → 13
- 13: 1,222 ✓
- 13.5: 653 ✓
- 14: 561 ✓
- 14.5: 23 ✓
- 15: 137 ✓
- 15.5: 301 (names 300, post body) → 15
- 16: 12 ✓
- 17 (sign-in lede): 1 → 18
- 17.5: 31 ✓
- 18 (post h1): 4 → keep, sentence case (TYPE-05)

**Community, wide ("Mona Sans Display"):**
- 18.19: 18 ✓
- 32.78: 14 ✓
- 37.15 (sign-in form's h2, larger than any section head): 1 → 36
- 57 (sign-in h1): 2 ✓ (hero)

**Community, Monaspace Neon, 1440:**
- 11: 15 → 11.5
- 11.5: 1,304 ✓ (tick) or 13 for moves
- 12: 1,372 (the tape) → 13
- 12.5: 208 → 13
- 13: 488 ✓
- 13.5: 88 → 13
- 15, 16, 17, 20 and 22 (row scores) → 13
- 24, 26 and 28 (totals) → 26
- 54 → the score style
