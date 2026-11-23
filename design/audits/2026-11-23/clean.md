# Clean, not costume: the audit (November 23, 2026)

**The state of the area:** the mechanical check is green (`node scripts/check_clean.mjs`: **0 problems in 48 views**), but the owner's six kinds are still on the site and in the community. They survive wherever the check doesn't look: inside SVG drawings and a canvas, in the side panel (closed at load), in Ask Sig's answers (never asked), and in text under 13px or set in lowercase or capitals by the stylesheet (never measured).

Everything here was verified in the capture (`.design/shots`, `.design/data`, website 390 to 2560, community 390 to 2560 from the second capture, which ended `exit 0`) and in my own captures and scans: the side panel opened on every page, Ask Sig with the canned answer from `scripts/check_sig.mjs`, the front page with the Signal loading and failing, ⌘K and the front page's search with a query, and the community signed in as a new member. Evidence crops: `.design/evidence/design-clean/`.

## The check, and what it lets through

- **Its count:** 0 problems, 48 views (24 pages × 1440 and 390, plus ⌘K and the front page's results).
- **Its `ALLOW`:** one entry, `kbd` may be set in the code face. That entry is right: the brand book sets keys in Monaspace. Two notes: the top bar's key `kbd.kbd-k` is 11px (`styles.css:723`, `.92em`), and the 404 says the same key twice (CL-23).
- **What it allows without saying so.** These are where the findings below live:
  1. `svg` is skipped entirely ("Drawings (svg) are left alone"). That lets through the Signal's charts and the community's letter tiles. My scan of `svg text`: at 1440, 30 labels on the website outside How it works' own pictures (Library flow 11, fact sheet takeover 7, uses rose 12), and 233 on the community (about 210 of them letter tiles).
  2. The side panel starts closed, so `shown()` drops it. Opened, it shows the Library's `library/` and `▸ peptides/` tree (CL-11).
  3. The finale's ring of words is drawn on a `<canvas>` (CL-10).
  4. Ask Sig is never asked a question (`check_sig.mjs` asks, but runs no clean scan). With an answer: `// your stack, checked together`, `Sig · all 12 agents` and `checked by the safety agent` (CL-03).
  5. Nothing measures size or text-transform. 47 different elements under 13px on the website at 1440, 164 in the community; labels lowercased by CSS (`.dd-log`, `.sy-ring-n`, `.ctag b`, `.lvl`, `.rd-label`).
- The community's `tests/e2e/clean.mjs` has the same gaps. Run on every screen at 1440, its rules find 0. At 390 they find one chain, in the preview-only banner, which doesn't ship.

## Delete first: the fix order

Apply these deletions before any restyle from the other leads, because several restyles touch the same rules:
1. Every page: CL-01, CL-02.
2. Ask Sig: CL-03, CL-21, and CL-17's legal link.
3. Shared kit: CL-04, CL-07.
4. Fact sheets: CL-05, CL-09, CL-27, and CL-24's question numbers.
5. Library: CL-11, CL-12.
6. Front page and How it works: CL-10, CL-16, CL-25, CL-17's drawing label, and CL-24's rule numbers.
7. Story, legal pages, weekly, founders, goals, compare and the 404: CL-14, CL-18, CL-23.
8. Community: CL-13, CL-15, CL-19, CL-20.

After the deletions:
- Size floors: CL-06, CL-08.
- Case: CL-22, plus the lowercase parts of CL-03, CL-05 and CL-21.
- The loading state: CL-26.
- Strengthen the check, so none of this comes back (next update, 1).

## Findings, most visible first

### CL-01 · high · The foot's last line is the owner's first example, reworded
- **Where:** every website page, 390 to 2560 (343 HTML files).
- **Selector:** `footer.foot .foot-base p.copy`. Text "No ads, no sellers, no doses.". Comes from `scripts/build_library.mjs:229` (`osClose`) and is stamped into `index.html:395`, `404.html:92`, `privacy.html:187`, `terms.html:142`.
- **Evidence:** 13px, weight 500, `muted`, alone in the foot's bottom-right corner (x 1212 at 1440). `07-foot-last-line@1440.jpg`.
- **Rule:** corner captions that restate. This is "no ads · no sellers · no doses", the owner's first screenshot, with the dots turned into commas. The same promise is said in the house rules, the disclaimer beside the logo, and the story's rules.
- **Fix:** delete `<p class="copy">No ads, no sellers, no doses.</p>` from `osClose` and rebuild. The last line keeps "© 2026 Unhyped". Book: in BRAND.md *The frame*, change "a last line" to "a last line with the copyright".

### CL-02 · high · The weekly sign-up says how often and that it's free two or three times in one view
- **Where:** the foot of every page but /weekly/, and the /weekly/ page.
- **Selectors:**
  - `.foot-news p` "The Signal, weekly. What changed, new studies and FDA news. One email a week." (`build_library.mjs:239`);
  - `.news-form .nf-note` "Free, once a week. We email you a link to confirm first; unsubscribe in one click." (`scripts/build_pages.mjs:31`);
  - /weekly/'s head line "A free email. Unsubscribe in one click." (`build_pages.mjs:354`), above the lede "Once a week: …" and the same note.
- **Evidence:** `16-weekly-band-says-weekly-three-times@1440.jpg`, `16-weekly-page-repeats@1440.jpg`.
- **Rule:** two ways of saying the same fact in one view.
- **Fix:**
  - `footNews`: delete " One email a week.";
  - `signupForm` note: "Free, once a week." → "Free.";
  - /weekly/: delete `docHead`'s third argument, "A free email. Unsubscribe in one click.".

### CL-03 · high · Ask Sig's answers still talk like a terminal
- **Where:** /sig/ and /ai/, every answer, 390 to 2560.
- **Selectors and evidence** (canned stack answer): `01-asksig-answer-head-and-slash-tag@1440.jpg`, `01-asksig-answer-foot-checked-by-safety@1440.jpg`, `01-asksig-answer-foot@390.jpg`.
  - Every card Sig makes is tagged as a code comment: `p.ctag > span.pt-k` "// your stack, checked together" (also "// options to discuss with your doctor", "// what people report", "// side by side", "// a few questions first", "// when to get help"). Source: `ai/ai.js:625` (`` text: `// ${who[1]}` ``).
  - The agent's name beside it is lowercased by `ai/term.css:224` `.ctag b{text-transform:lowercase}` ("synergy auditor").
  - The answer's head is a dot chain and a counter: `readLine()` (`ai/ai.js:493-506`) writes "Sig · read 2 Signals and 1 fact sheet · all 12 agents"; on a phone "Sig · 12 agents" (`.a-read-s`); while working "· reading your message · all 12 agents". The phone title bar also counts "12/12 agents" (`drawCount`, `ai/ai.js:2003-2005`).
  - The foot says "✓ checked by the safety agent" (`ai/ai.js:1729`), a system talking about itself.
  - The questions for the doctor are strung on dots drawn by the stylesheet: `ai/mind.css:66-68` `.a-list li{display:inline}` and `.a-list li+li::before{content:' · '}`. With three or more questions that is a drawn dot chain. The label "for your doctor" and the button "copy" are lowercase beside a "Copy" button.
- **Rule:** code costume (a code comment as a label); dot chains; counters; a system talking about itself; lowercase as style.
- **Fix:**
  - `ai.js:625`: drop the `span.pt-k` (the card's own heading names it). Keep `span.pt-by`. Delete `text-transform:lowercase` in `term.css:224`.
  - `readLine()`: when the answer is done, return `''`. While working, return `low(last.title)` alone, with no agent count (the ring already shows who is working). Delete `drawCount`'s `/${WHO_ALL.length} agents`.
  - `ai.js:1729`: when the review is clean, show nothing. Keep the edited and stopped notes, in sentence case ("The Safety agent edited 1 part before you saw it.").
  - Delete `mind.css:66-68`, so the questions read as a list, one per line.
  - `ai.js:1128-1130`: "for your doctor" → "For your doctor", "copy" → "Copy".

### CL-04 · high · The Signal's drawings are the old terminal look: words in the code face, capitals, tracking, bullets, an arrow on an axis
- **Where:**
  - the Library's "How the Signal is made" (`flowSvg`);
  - all 300 compound pages: the takeover line (`takeoverSvg`) and the uses rose (`roseSvg`);
  - the community's Signal, space and post screens.
  - 390 to 2560; at 2560 the takeover's capitals draw about 20px tall.
- **Selectors:**
  - `library/signalviz.js`, identical to the community's `shared/kit/signalviz.js`: `class="t-mono"` with `letter-spacing` 0.5 to 1.4 on words, at lines 90 (`head()`, called at 194, 199, 206, 236, 241, 247), 97, 99, 108, 131, 133, 143-146, 208, 249, 282 (`.toUpperCase()`), 310, 323-326;
  - the rose's labels, `library/library.css:31` `.radar .rd-label{font:500 12px var(--mono);…;text-transform:lowercase}`.
- **Evidence:**
  - labels such as "PUBLIC FORUMS · COUNT AS 1 REPORTS", "IN 0 SIGNALS", "• 65 HOW WELL IT WORKED • 15 HOW MUCH PEOPLE AGREE", "THE FORMULA", "LIVE SIGNALS, 0–100", "75% · CERTIFIED", "SEMAGLUTIDE · 0%", "FIRST-HAND REPORTS FOR ONE COMPOUND →", and "weight", "hormones", "focus & mood" in lowercase mono;
  - single-letter tiles "R", "Y", "P", "F" beside each source's name;
  - `02-library-flow-drawing@1440.jpg`, `02-sheet-takeover-drawing@2560.jpg`, `02-sheet-rose-and-takeover@1440.jpg`, `13-comm-signal-same-numbers-three-times@1440.jpg`.
- **Rule:** words in the code face; capitals as style; a dot before every label; an arrow after a label.
- **Note on the book and the decisions:** BRAND.md's *What stays* names three illustrations whose labels stay: How it works' pictures, the prints and the body map. The decision of November 20 also left "the labels inside the drawings (the flow …, the takeover line)" alone, in the community. These two are data charts, not illustrations, and the owner's rule ("Monaspace Neon is for numbers and keyboard keys only") is the one this round's request points at. **Put it to the owner.** If he agrees, correct the decision's scope; the book's list of three is already right.
- **Fix** (site first, then the community with its `sync_kit.sh`):
  - Add `.t-label{font-family:var(--body);font-weight:500}` beside `.t-mono` (`styles.css:232`, `library/library.css:19`, community `web/styles.css:719`).
  - In `signalviz.js`, every word label: `class="t-mono"` → `t-label`, delete `letter-spacing`, write it in sentence case. Numbers stay in a `t-mono` `<tspan>`. Examples: "Public forums count as 50 reports", "In 50 Signals", "+ 20 “same for me”", "From members", "97% forums", "The Signal", "Live Signals, 0 to 100", "Forum data", "Members’ data", "75% Signal Certified", "First-hand reports for one compound".
  - Delete `.toUpperCase()` at line 282, the "→" at line 326, the letter tile at line 97 (the source's name is beside it), and the "The formula" caption with its bulleted legend (lines 143-146; the four weights are on /method/ and the community's How it works).
  - `library.css:31`: `font:500 13px var(--body);text-transform:none`.

### CL-05 · high · Fact sheets say the same thing three to seven times in one view
- **Where:** all 300 compound pages (122 fact sheets in full), every width. Measured on semaglutide at 1440.
- **Evidence:**
  - "FDA-approved" 7 times: hero chip y365; bottom line's chip and "FDA-approved for diabetes, weight, heart, kidney, MASH" y729/733; facts panel chip and the same sentence y1481; "Where it stands" chip and the same sentence y6105.
  - "Strong evidence" 3 times in the first two screens.
  - The bottom line `p.bl-why` (y625) is repeated word for word in What it is's `.ev-box p` (y2181).
  - "Share how it went" 4 times (y414, 813, 1537, 2466).
  - The check date 3 times: hero chip "Fact-checked Oct 28, 2026" at 12.5px; facts row "oct 28, 2026 against 10 sources", lowercased; and the sources' line.
  - The kicker "Peptide · Metabolic & weight" repeats the facts row "Mostly used for".
  - `10-sheet-top-repeats@1440.jpg`, `10-sheet-facts-repeats@1440.jpg`, `10-sheet-bottom-line-repeated-in-what-it-is@1440.jpg`.
- **Rule:** two ways of saying the same fact in one view; lowercase as style; one short kicker with no dots in it.
- **Fix** (`scripts/build_library.mjs`):
  - delete `p.bl-tags` (line 584);
  - delete the `span.st` chip where the status sentence follows it (line 610 in the facts, line 532 in #status);
  - delete `<p>${e(f.evidence.why)}</p>` from `.ev-box` (line 488) and keep its grade chip;
  - delete the hero's `span.check` (line 649; the facts row says it, with its link to the sources);
  - delete the share buttons in `.vs-act` (line 592) and `.le-signal` (`a.sig-cta`). The hero's and the side card's stay;
  - `familyLine` (line 92): `${SINGULAR[c.family] || c.family}` alone;
  - `library/library.css:420`: delete `text-transform:lowercase` from `.le-facts .dd-log`.

### CL-06 · high · Website text a reader needs is set at 9.5 to 12.5px
- **Where:** the Library (300 cards × 2 chips), all compound pages, the method, the front page, Ask Sig, the story, the side panel. Desktop and phone.
- **Selectors (size, file:line):**
  - `.ev,.st,.hc,.pill,.check` 12.5px (`library/library.css:434`; the base rule at line 8 still sets them in `var(--mono)` 12px and is overridden later);
  - the body map's `.mh-bm-route`, `.mh-bm-mk`, `.mh-bm-key` 12px (`kit/kit.css:79, 94, 118`);
  - `.method .conf` 12.5px, written in lowercase ("fair", "good", "weak") (`styles.css:451`);
  - `.sx-of` "out of 100" 12px at 1024 and 12.1px at 390 (`home.css:147`);
  - `.sx-lab` 12px (`home.css:204-205`);
  - the side panel's `.lt-more` 11.5px (`styles.css:627`);
  - `.moves-focus .n` 11px mono (`library.css:332`);
  - Ask Sig's fine print `.ai-fine` 12px (`ai/term.css:152`) and `.sg-wipe` 12.5px (`term.css:352`);
  - in answers: `.found-ev` 10.5px (`ai/ai.css:203`), `.pick-pills .ev,.pick-pills .st` and `.vx-item .pick-name .st/.ev` **9.5px** (`ai.css:209, 397`), `.lvl` 12px and lowercase (`ai.css:219`), `.pick-signal` and `.pick-ev-label` 12.5px (`ai.css:193, 210`);
  - the story's `.sy-log li` 11.5px on a phone (`styles.css:798`);
  - the top bar's key `.kbd-k` 11px.
- **Evidence:** `11-library-card-chips-12.5px@1440.jpg`, `11-asksig-stack-chips-9.5px@1440.jpg`, `11-asksig-lowercase-tags-12px@1440.jpg`, `11-sheet-body-map-key-12px@1440.jpg`, `11-asksig-fine-print-12px@1440.jpg`.
- **Rule:** anything a reader needs is 13px or more.
- **Fix:**
  - each of these to 13px (`font-size:13px`; `home.css:147` `clamp(13px,…,14px)`);
  - delete `text-transform:lowercase` in `.lvl`, `.src-k` and `.vx-k` (`ai.css:219, 371, 434`);
  - "fair/good/weak" → "Fair/Good/Weak";
  - delete the `font:… var(--mono)` in `library.css:8`.

### CL-07 · high · The community's letter tiles: initials in the code face beside every name
- **Where:** every community screen: the side panel's spaces, Live moves, goals, the Explore cards (about 300), a space's hero, the post head, chips, the Signal page's movers. Also the website's My stack chips once anything is kept.
- **Selectors:**
  - `kit/kit.js:125-141` `tileSvg()`: `<text … font-family="Monaspace Neon" font-weight="700">` + `initials()` (lines 116-123): "BPC", "TI", "SE", "TB5", "MG";
  - drawn by the community's `web/ui/art.js:91` `spaceTile` at 16 call sites, always right before the space's name;
  - the stack tile adds a Monaspace count bubble (`kit.js:134`);
  - colours from `CAT` (`kit.js:104-115`: sand #E8DCC4, sage #DAE2CA, clay #E6CFC0, mist #C9D3DC, stone #CED6D2), none of them in `tokens.json`.
- **Evidence:** about 210 tile texts in my 1440 scan. `05-comm-side-tiles@1440.jpg`, `05-comm-explore-tiles@1440.jpg`.
- **Rule:** words in the code face; two ways of saying the same thing ("TI" next to "Tirzepatide"); a leftover palette.
- **Fix:**
  - `spaceTile()` returns `null` for compounds and blends;
  - keep the stack's plates drawing without its count bubble (delete the `<circle>` and `<text>` at `kit.js:134`);
  - delete `initials`, `CAT` and `catColor` when nothing else uses them;
  - website: `my/my.js:198, 217` pass `tile: false` to `chipHtml`.

### CL-08 · high · Community text a reader needs is set at 10 to 12.5px
- **Where:** every community screen, 390 to 2560.
- **Selectors** (`web/styles.css`):
  - `.xs{font-size:12px}` (line 59), used for whole sentences ("Ten members’ reports unlock …", "9% of the number from members here · goal 50%", start-here descriptions);
  - `.act` 12px (line 295; "5 comments", "Same for me · 5", "React" under every post);
  - `.move-i .why` 12px (413);
  - `.quest .d` 12.5px (467);
  - `.tick-i` 12.5px (73) and its moves at 11.5px mono (76);
  - `.nav-i .badge-n` 12.5px (201);
  - `.focus-c` "0 of 10" 11.5px mono;
  - the Signal page's number labels **10px** (`.signal-hero .hero-stats span`, line 737), which is the owner's "three numbers' tiny labels" again.
- **Evidence:** 164 different elements under 13px in my 1440 scan. `13-comm-signal-same-numbers-three-times@1440.jpg` (the 10px labels).
- **Rule:** 13px and up.
- **Fix:**
  - `.xs`, `.act`, `.move-i .why`, `.quest .d`, `.tick-i`, `.badge-n` → 13px;
  - line 737 → `font-size:13px`;
  - `.focus-c`: Mona Sans 13px with tabular figures ("0 of 10 reports", as the founders page writes it);
  - `.btn.xs` (line 128 sets 10.5px; "Claim +20" renders at 12px) → 13px.

### CL-09 · high · Bars on panels with meta on the right, and "● Live" stamps
- **Where:**
  - the Library ("How the Signal is made, live" … "Updated 11 days ago");
  - every compound page ("What it’s used for" … "By goal"; "Community Signal" … "● Live");
  - the community's Signal card on a space and a post, and the takeover card ("● Live").
- **Selectors:**
  - `.gc-head` (`styles.css:110`), written at `build_library.mjs:440, 665, 672`;
  - community `web/ui/components/signal.js:84` and `web/ui/pages/signal.js:69` (`h('span', { class: 'live' }, …, 'Live')`).
- **Evidence:** 13px meta at the far right of each panel's first line. `06-sheet-panel-heads@1440.jpg`, `06-library-flow-bar@1440.jpg`, `06-comm-sigcard-live@1440.jpg`. The Library's bar says "live" and "Updated 11 days ago" in the same line.
- **Rule:** bars on panels that name them like a window, with meta on the right; the board's live stamp was one of the owner's six.
- **Fix:**
  - line 440 → `<h3 class="gc-h">How the Signal is made</h3>` (delete ", live" and the `data-live="updated"` span; update `library/library.js:205`, which reads `.gc-head`);
  - line 665: delete `<span class="dim">By goal</span>`;
  - line 672: delete `<span class="live lime">…Live</span>`;
  - community: delete the `span.live` in both places.
  - Each panel starts with its heading alone.

### CL-10 · high · The finale's ring of words: `//` between words, in the code face, glinting in all twelve agents' colours
- **Where:** the front page under the violet band, and /how-it-works/, 390 to 2560.
- **Selectors:**
  - `lib/how.js:250` `PHR = 'how it went // better // the same // … // 12 weeks // '`;
  - line 269 `ctx.font = '400 13px "Monaspace Neon", …'`;
  - lines 275-277 lit letters from `PALETTE` (line 22, fourteen agent colours);
  - drawn on `canvas.hs-ringc`, which no check can read.
- **Evidence:** `04-finale-ring-slashes@1440.jpg`.
- **Rule:** code costume (code-comment marks); words in the code face; colour as decoration (agents' colours only where that agent made something).
- **Fix:**
  - `PHR`: replace each `' // '` with `'   '` (the loop skips spaces);
  - `ctx.font = '400 13px "Mona Sans", sans-serif'`;
  - the ring's glints in Signal blue only (`'#3D8BFF'`), since the ring is the Signal.
  - The owner asked for the finale to stay (November 22); only its marks change.

### CL-11 · high · The Library's side panel is still a file tree
- **Where:** /library/ with the side panel open, every width.
- **Selector:** `.os-ctx nav.le-tree`, written at `build_library.mjs:454-456`:
  - `p.lt-root` "library/" with "300";
  - `a.lt-dir` "▸ peptides/ 79", "▸ hormones/ 22", "▸ supplements/ 156", "▸ medications/ 34", "▸ blends/ 9";
  - `p.lt-more` at 11.5px, cut off by the panel's scroll ("…the rest are / being checked").
- **Evidence:** `03-library-side-panel-paths@1440.jpg`.
- **Rule:** code costume (a path, folder names, lowercase as style); counters; tiny text. The November 18 decision removed "the Library tree's folders and file names" from the fact sheets only; this one was missed because the check never opens the panel.
- **Fix:**
  - write the fact sheets' tree (lines 626-630) here: `<p class="lt-root"><a href="/library/" aria-current="page">The Library</a></p>` and `${e(fam)}`;
  - delete `<span aria-hidden="true">▸ </span>`, `.toLowerCase()`, the trailing `/` and both counts;
  - `.lt-more` 11.5px → 13px (`styles.css:627`).
  - Every family link stays.

### CL-12 · high · The Library page's top: a live dot and a dot chain in the kicker, the same count four times, a busy moves panel, a corner note
- **Where:** /library/, every width.
- **Selectors:**
  - `p.kick.lime.live` "● The Library · live community data" (`build_library.mjs:374`);
  - the stats strip's "In the Library 300" (line 380) under a lede that opens "300 peptides…", beside tabs "All 300" and a side panel "300";
  - `section.lib-moves`: `.moves-k i`, a 7px Signal-blue dot before "What moved this week" (`library.css:313`); `span.kick-sm` "Filling first" as a prefix label (`library/library.js:190`); five chips each ending `span.n` "0 of 10" in 11px Monaspace Signal blue (`library.css:332`);
  - `p.sec-note` "Side by side on every page, never mixed together." at x 1132, beside the h2 (`build_library.mjs:423`).
- **Evidence:** `09-library-top-kicker-stats-moves@1440.jpg`, `21-filling-first-library-chips@1440.jpg`.
- **Rule:** one short kicker with no dots; one live dot, beside the Signal; counters; prefix labels; words in the code face; headings stand above their block with nothing beside them.
- **Fix:**
  - kicker → `<p class="kick">The Library</p>`;
  - delete the "In the Library" cell;
  - delete `.moves-k i` and the "Filling first" span. Write each item as the founders page does: name, use, then "0 of 10 reports" in Mona Sans 13px with tabular figures (see *Systemic*);
  - delete `p.sec-note`. Its sentence, if wanted, becomes the section's lede under the heading.

### CL-13 · high · Community pages put a note in the corner beside the heading, and kickers that count
- **Where:** Explore, Signal Builders, Quests, Popular (the note beside the h1), and card heads on most screens. 1024 and up (the note wraps under on a phone).
- **Selectors:**
  - `.page-h{display:flex;…;justify-content:space-between}` (`web/styles.css:218`) puts "One space per compound, blend and stack. Join the ones you care about." (and the other three) at the heading's right;
  - card heads with a counter at the right: "5 to go" (`web/ui/components/checks.js:263`), "39 days left" (`components/game.js:159`), "Each use is rated after 3 reports" (`components/signal.js:110`), "Sort by any column." (`pages/signal.js:35`), "Each Signal earns its level from the database, live" (`pages/signal.js:80`);
  - kickers that count: "3 spaces you follow" (`pages/home.js:24`), "300 in the library · 0 stacks" (`pages/explore.js:29`), "Member #3 · since Oct 2026" (`pages/profile.js:31`), and "Version 2026-10-21" on the rules (`pages/info.js:15`, a machine date).
- **Evidence:** `12-comm-explore-corner-caption@1440.jpg`, `12-comm-builders-corner-caption@1440.jpg`, `12-comm-filling-5-to-go@1440.jpg`, `12-comm-certification-from-database@1440.jpg`.
- **Rule:** corner captions and counters; a system talking about itself ("from the database, live"); headings above their block.
- **Fix:**
  - `.page-h{display:block}`, with the note as the lede under the h1;
  - delete the five right-hand captions and the two counting kickers on Home and Explore;
  - profile kicker → "Member since Oct 2026";
  - rules kicker → "Updated Oct 21, 2026" (format only).

### CL-14 · high · The story page counts and logs: "12 agents", "13 steps, 12 agents", numbers on everything, "Checked by the Safety agent"
- **Where:** /story/, every width (the log is 11.5px on a phone).
- **Selectors** (`build_library.mjs` and `styles.css`):
  - `.sy-ring-n` "12 agents" in the ring beside the headline "Twelve agents." (line 1139; `styles.css:740`, `text-transform:lowercase`);
  - `.sy-an` corner numbers 1 to 12 on the agents' cards, Monaspace 11.5px (line 1154; `styles.css:748`);
  - `div.sy-term` (aria-label "A run, as Sig logs it"): `p.sy-sum` "13 steps, 12 agents" (line 1167), `span.sl-n` 1 to 13 and a ✓ `span.sl-st` on every line (line 1168), `p.sy-ah` "The answer —— Checked by the Safety agent ✓" (line 1169);
  - `.sy-pf` "12 lines" under each print (line 1133).
- **Evidence:** `08-story-hero-12-agents@1440.jpg`, `08-story-agent-card-numbers@1440.jpg`, `08-story-run-panel@1440.jpg`, `08-story-print-line-counts@1440.jpg`.
- **Rule:** counters (the owner's "one question · four steps · twelve agents" and "12 agents online"); a dot before every label; a system talking about itself; numbers where order is already clear; tiny text.
- **Fix:**
  - delete `.sy-ring-n` (the ring stays), `.sy-an`, `p.sy-sum`, `span.sl-n`, `span.sl-st`, `p.sy-ah` (step 13 already says the Safety agent checked every part), and `.sy-pf`;
  - `styles.css:798` 11.5px → 13px.
  - Each step keeps the agent's name in its colour and what it did, which is the brand's "step".

### CL-15 · high · The community's Signal page says each number three times
- **Where:** `#/signal`, every width.
- **Evidence:**
  - "52" and "17 first-hand reports" are in the flow card and again in the strip under it;
  - the levels 51/1/0/0/0 are under the flow's seals, again in the strip ("0 Signal Certified"), and again in the five certification cards (with corner numbers 1 to 5);
  - the strip's labels are 10px.
  - `13-comm-signal-same-numbers-three-times@1440.jpg`, `13-comm-signal-certification-cards@1440.jpg`.
- **Selectors:** `web/ui/pages/signal.js:17, 50-55` (`.hero-stats`); lines 80-84 (`span.n.mono` `${i + 1}` and the head's caption); `web/styles.css:733-737`.
- **Rule:** two ways of saying the same fact in one view; tiny text; counters.
- **Fix:**
  - delete the `.hero-stats` strip. "Moves today" and "Run by this community" are the only numbers not shown elsewhere, and nobody would miss them here;
  - delete `span.n.mono` in each certification card and the card head's caption.
  - The November 20 decision left "how much the Signal page shows" to the owner as a question of what to keep. This deletes only repeats.

### CL-16 · medium · "Popular", a prefix label, before the four links under the front page's search
- **Where:** the front page, 768 and up (a phone already drops it: `@container fp (max-width:480px){.sx-pop-k{display:none}}`).
- **Selector:** `span.sx-pop-k` (`index.html:103`; `home.css:72-73, 77`).
- **Evidence:** 14px `muted`, then four `text-2` links. `17-front-popular-prefix@1440.jpg`.
- **Rule:** prefix labels ("popular" is the brief's own example).
- **Fix:** delete the span and `home.css:73, 77`.

### CL-17 · medium · The old name, where the reader looks
- **Where:**
  - How it works, step 6's drawing: the website is labelled "miraclehealth.us", while the caption beside it says "The website";
  - Ask Sig's side panel ends with a "miraclehealth.us" link, where every other side panel ends "Privacy Terms © 2026".
- **Selectors:** `how-it-works/index.html:111` (`<text …>miraclehealth.us</text>`); `sig/index.html:59`, written by `build_library.mjs:1007` (`p.sg-legal`).
- **Evidence:** `19-how-step6-miraclehealth-label@1440.jpg`, `19-asksig-side-legal-domain@1440.jpg`.
- **Rule:** leftovers of the old name; a domain used as a label. (Links, addresses and the contact address wait for the domain, as decided on November 21; these two are labels.)
- **Fix:**
  - the drawing's label → "the website" (the card's own words);
  - `sg-legal` → `<a href="/privacy#ai">Privacy</a><a href="/terms">Terms</a><span>© 2026</span>`, as `.os-legal`. The logo above already goes home.

### CL-18 · medium · Kickers that repeat the heading under them, and head lines that count what's below
- **Where:**
  - /story/ (4), /privacy, /terms, /weekly/;
  - /founders/ "100 spots" under "Be one of the first 100.";
  - /goals/ "12 goals · 122 checked fact sheets";
  - /compare/ "12 comparisons · from the fact sheets";
  - the 404 (CL-23).
- **Selectors:**
  - `p.sy-k` "The twelve" / "Prints" / "One app" / "What never changes" over "Meet the twelve." / "Every compound has a print." / "Four places. One app." / "The rules never change." (`build_library.mjs:1151, 1178, 1193, 1206`);
  - `doc-head .kick` "Privacy" over "Privacy notice.", "Terms" over "Terms of use." (`privacy.html`, `terms.html`), and "The Signal, weekly" over "What moved, once a week." (`build_pages.mjs:354`);
  - the meta lines at `build_pages.mjs:458, 251, 321`.
- **Evidence:** `18-story-kicker-repeats-heading@1440.jpg`, `18-privacy-kicker-repeats-heading@1440.jpg`, `18-founders-100-spots@1440.jpg`, `18-goals-meta-counter@1440.jpg`.
- **Rule:** a label that repeats the heading over it; counters.
- **Fix:**
  - delete those seven kickers;
  - delete "100 spots" (keep the `data-live="founders"` span, empty until it says how many are left);
  - goals → "From the fact sheets." (delete the counts); compare → "From the fact sheets" (delete "12 comparisons · ").

### CL-19 · medium · A community space says its numbers and its ways on twice, and Explore shows zeros on every card
- **Where:**
  - a space (`#/s/…`) and a post: the hero says "6 members, 2 posts this week, 2 first-hand reports", "Joined", "Fact sheet", "Ask Sig"; the rail's space card says "6 Members | 2 Reports", "Joined", "Fact sheet", "Ask Sig" again;
  - Explore: "No Signal yet" over "0 members · 0 reports" on about 290 cards.
- **Selectors:** `web/ui/rail.js:52` (the space card); `web/ui/pages/explore.js:25`.
- **Evidence:** `14-comm-space-hero-and-rail-repeat@1440.jpg`, `14-comm-explore-zero-counters@1440.jpg`.
- **Rule:** two ways of saying the same fact in one view; counters that say nothing.
- **Fix:**
  - on a space's own page, don't draw the rail's space card (the hero carries all of it). On a post, keep it: it's the only place there;
  - on Explore, leave out "0 members · 0 reports" when both are zero.

### CL-20 · medium · Live dots multiply, and the ticker puts a diamond before every name
- **Where:** the community, every screen.
  - The ticker draws a 5px Signal-blue diamond before each of about 52 items.
  - Up to four live dots per view: the nav's "The Signal ●", "● Live moves", "● The Signal, live", "● Live".
  - On the website: "● What moved this week" (Library), "● Community" (Ask Sig's first screen), and the Library's kicker.
- **Selectors:** `web/styles.css:74` `.tick-i::before{…;transform:rotate(45deg)}`; `.live-dot` in the card heads; website `library.css:313` `.moves-k i`, `ai/ai.css:447` `.crowd-dot`, and the Library kicker's `.live i` (`styles.css:89-97`).
- **Evidence:** `15-comm-ticker-diamonds@1440.jpg`.
- **Rule:** rows of dots; a dot appears only where it carries something ("the one live dot beside the Signal").
- **Fix:**
  - delete `.tick-i::before` (the tape stays, as decided; its gap separates the names);
  - keep one live dot per view: the ticker's in the community, the Signal card's on the website. Delete the others.

### CL-21 · medium · Ask Sig's blood markers: truncated lowercase tags under the tubes, a lowercase caption in the head
- **Where:** /sig/ with an answer (the rail at 1440 and up, the sheet on a phone).
- **Selectors:**
  - `tagOf()` (`ai/markers.js:27-31`) cuts names to four lowercase letters: "hgh ↑", "encl ↑", under "Glucose", "LH", "FSH";
  - `span.rl-sub` "what it may move" beside "Blood markers" (`sig/index.html:120`);
  - "tap a tube" in the legend's corner.
- **Evidence:** `20-asksig-rack-tags-and-head@1440.jpg`.
- **Rule:** lowercase as style; machine-made abbreviations; corner captions.
- **Fix:**
  - `tagOf` returns `shortName(name)` as written ("HGH ↑", "Enclomiphene ↑");
  - delete `span.rl-sub` (the first line under it says "12 blood tests move");
  - delete "tap a tube" (the tubes are buttons).

### CL-22 · medium · The community sets members' own words in capitals
- **Where:** a post's page (its title) and a profile (the handle, "U/GLP_JOURNAL"), every width.
- **Selectors:** `web/styles.css:918` `h1,h2{…;text-transform:uppercase}` applies to `h1.post-title` and `.profile-h h1`.
- **Evidence:** `27-comm-post-title-capitals@1440.jpg`, `27-comm-profile-handle-capitals@1440.jpg`. The same title is in sentence case in the feed.
- **Rule:** capitals as style. A member's title and handle are theirs; "u/" becoming "U/" reads like a constant.
- **Fix:** `h1.post-title,.profile-h h1{text-transform:none;font-stretch:100%}`.

### CL-23 · medium · The 404 opens with a status code and says the key twice
- **Where:** /404.html, every width.
- **Selectors:** `p.kick` "404"; `p.lede` "…Or press Ctrl K and type where you meant to go." and the button "Go anywhere · Ctrl K" (`404.html:62`, `Go anywhere · <kbd class="kbd-k">⌘K</kbd>`).
- **Evidence:** `22-404-kicker-and-key-twice@1440.jpg`.
- **Rule:** a machine talking about itself; two ways of saying the same thing.
- **Fix:** delete the kicker; the button → "Go anywhere" (delete " · " and its `kbd`).

### CL-24 · low · Numbers on lists whose order means nothing
- **Where:** the front page's house rules (1 to 4), every fact sheet's questions for the doctor (1 to 3).
- **Selectors:** `home.css:462` `.fp-rule-list li::before{content:counter(rule);…;font:400 12px/1 var(--mono)}`; `library/library.css:216` `.asks li::before{content:counter(ask);…}`.
- **Evidence:** `25-house-rules-numbers@1440.jpg`, `25-sheet-doctor-questions-numbers@1440.jpg`.
- **Rule:** no number where order carries nothing.
- **Fix:** delete both `::before` rules and the 52px and 40px number columns (`home.css:460, 574, 647`; `library.css:215` `padding-left:52px` → 18px).

### CL-25 · low · An arrow after every link on the front page's top
- **Where:** the front page: "Took it? Share how it went →", "How the score is made →", "Studies: limited →", and the three ways in ("Open the Library →", "See the Signal →", "Ask Sig →"). On Ask Sig: "Ask the members this ↗", its arrow set in Monaspace.
- **Evidence:** `26-front-arrows-after-links@1440.jpg`.
- **Rule:** an arrow after every link is decoration; a link is already a link.
- **Fix:** delete `span.sx-arr` (`index.html`, `home.css`) and `span.fp-way-a` (`home.css:282, 284`); keep an arrow only where a link leaves the site (the ↗), and set `span.a-ar` in Mona Sans.

### CL-26 · low · The front page's Signal card, loading or failed, shows a white bar where the score goes
- **Where:** the front page while the Signal loads, or when it fails, 390 to 2560.
- **Evidence:** the score's "–" drawn at 117.6px Mona Sans 800 renders as a 58 × 13px white block over "out of 100", and there's no ring. `24-front-signal-loading-white-bar@1440.jpg`.
- **Rule:** loading is Sig's ring with one plain line; no skeleton boxes (BRAND.md *Motion*).
- **Fix:** `home.js`: while loading, draw the ring spinner (`lib/ring.js`) in the score's place with "Loading the live Signal" under it. On failure, the plain line alone. No dash.

### CL-27 · low · Side panel: counts beside the fact sheets' families
- **Where:** every fact sheet with the side panel open ("Peptides 56"), every width.
- **Selectors:** `span.lt-n` (`build_library.mjs:628, 630`; `styles.css:618-620`).
- **Evidence:** `23-side-panel-ask-twice-and-counts@1440.jpg`.
- **Rule:** counters beside navigation (the November 18 decision removed "122 sheets" and "12 agents" beside the places).
- **Fix:** delete `span.lt-n`. Every link stays.
- **Observation, not a fix:** the panel's "Ask Sig a question" button and its "Ask Sig" place go to the same page, one above the other. The owner's rule keeps every navigation link, so this is the owner's call alone.

## Systemic: what should be one thing everywhere, and the one value

1. **Small text has one floor: 13px.** The website's `label` token is 13px, but chips, keys, notes and fine print run at 9.5 to 12.5px in six stylesheets. The community's `.xs` is 12px. One value: nothing a reader needs under 13px, footnote numbers alone excepted.
2. **A word is never in the code face, in HTML, SVG or canvas.** The website's HTML is clean; its charts (`signalviz.js`), the finale (`lib/how.js`) and the kit's tiles (`kit.js`) are not. One value: words in Mona Sans (`var(--body)`, an SVG class `t-label`); numbers and keys in Monaspace.
3. **A panel starts with its heading, and nothing sits at its right.** Three patterns today: the website's `.gc-head`, the community's `.card-h` with a right-hand `span`, and the community's `.page-h` note. One value: a heading (Mona Sans 600, sentence case), with any needed note as a line under it.
4. **"Filling first" has four looks:**
   - Library: chips, 11px mono;
   - Ask Sig: chips, mono;
   - founders: rows, Mona Sans;
   - community rail: rows, 11.5px mono.
   One value: the founders' row. Name, then the use, then "0 of 10 reports" in Mona Sans 13px with tabular figures. No prefix label.
5. **One live dot per view, beside the Signal** (CL-20). Today, up to four per community screen.
6. **Terminal-era rules are overridden, not deleted.**
   - `library/library.css:8` still sets the chips in mono, undone at line 434.
   - The community's `.btn` (`web/styles.css:117`) is mono, tracked and in capitals, undone at line 923.
   - `ai/term.css` (the `.tm` "terminal" names, the lowercase agent names) and `ai/mind.css` (the view removed on November 21, whose drawn dot list is still live in answers) are still loaded on Ask Sig.
   One value: delete the old rule, not override it. An override is one missed class from bringing the look back.
7. **The Signal's four parts have two sets of names.** /method/ says "how reports went, how much they agree, how many independent voices there are, how much there is to go on"; everywhere else says "how well it worked, how much people agree, how many people, how many reports" (decision of November 20). This is copy, so it's the owner's call; noted for the art director.

## The next update, in this area

1. **Make the check see what it can't** (website and community). `check_clean.mjs` and the community's `tests/e2e/clean.mjs` should:
   - open the side panel on every page;
   - read `svg text`, allowing only How it works' pictures (`.hs-svg`), the prints and the body map;
   - read the finale's words from `lib/how.js` (or a `data-words` attribute);
   - ask Sig the canned question from `check_sig.mjs` and scan the answer;
   - render the Signal's loading and error states;
   - flag text a reader needs under 13px, and labels under 20px set in lowercase or capitals by CSS.
   Every finding above would have failed it. This is the change that keeps the owner's rule true after this round.
2. **Delete the terminal-era leftovers instead of overriding them:**
   - `library.css:8`;
   - the community's `.btn` at `styles.css:117`;
   - `ai/term.css` and `ai/mind.css` folded into `ai.css` with only what's used (rename `.tm`);
   - the old `CAT` palette in `kit.js`.
   Pages: Ask Sig, the Library, every community screen. Why: it removes the source the costume keeps coming back from.
3. **One rule for counts:** a number appears once per view, in the place it means most, and a zero becomes a plain sentence or nothing. Pages: the Library, fact sheets, the community's Signal, Explore, spaces and Quests. Why: repeated counts are most of what still reads as "machine-made" (CL-05, CL-12, CL-15, CL-19).
4. **One page head for both apps,** the website's `doc-head`: one short kicker, the h1, one line under it. No note beside the heading, no counters in the kicker. Pages: the community's Explore, Popular, Builders, Quests, Signal and Rules. Why: it's the most visible place where the community still reads as a different product.
5. **Compounds named by their names.** With the letter tiles gone (CL-07), a compound is its name everywhere, and its print only where it has a fact sheet, as the website already does. Pages: every community screen, My stack.
