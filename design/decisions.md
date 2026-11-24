# Design decisions

What the design department decided where its agents disagreed, or where a fix meant choosing between the brand book and the site. Each entry names the findings it settles; the findings are in `audits/<date>/`.

## 2026-11-11: the first full review

Five agents audited 23 page templates at 1440, 1024, 768 and 390 wide and reported 133 findings (typography 22, brand and colour 29, layout and symmetry 28, components and states 26, phone and tablet 28). The reports are in `audits/2026-11-11/`. Their line numbers refer to the stylesheets before the fixes.

| Measure | Before | After |
| --- | --- | --- |
| Pages wider than the screen | 23 (every phone page by 1px; the compare pairs by up to 19px) | 0 |
| Text set in Arial | 142 elements | 0 |
| Corner radii outside the brand's set | 1,445 | 0 |
| Distinct type sizes | 63 | 39 |
| Off-palette computed colours | 292 (17 distinct) | 93 (6 distinct: the hidden spam-trap field and three accepted plate details) |
| White main buttons in one view | up to 4 | 1 |
| `design_check.mjs` (colour · radius · size · gradient · shadow) | 224 · 66 · 83 · 42 · 38 | 161 · 23 · 34 · 30 · 28 |

What remains in `design_check.mjs` is mostly inside Ask Sig, in states the captures don't reach: its answers and screen pane (`ai/ai.css` 83, `ai/screen.css` 41) and the clinician packet (`ai/packet.css` 78). `baseline.json` holds it there, so it can only go down.

### The calls

1. **One white button per view.** The side panel's Join, Ask Sig's Join, the foot's "Get it weekly" and the fact sheet's repeated "Share how it went" are hairlines. A page's own main action stays white; the weekly email's own sign-up stays white on its pages. (BRAND-01, COMP-01)
2. **Headline roles.** `page` (48px, 34px on a phone) is every page's h1: fact sheets, the Library, the 404, My Miracle, the plan and Ask Sig's greeting included. `hero` (72px) is only Home's and the story's. Section heads are `section` (60px), headings inside a page `h2` (26px), card and row titles `h3` in Mona Sans (16px; 17.5px leading a list). A page's h1 ends in a full stop. (TYPE-01, 03, 04, 08, 22)
3. **One tag.** A `line-2` hairline, 8px corners, mono capitals at .12em, no tinted fills. How often a harm happens is in its words and greys (common and uncommon in `text`, rare in `text-2`, in theory and unknown in `muted`); the method page's confidence is in its words. Chips are 44px, Mona Sans, 8px corners; the pressed one takes the 8% current fill. (BRAND-03, BRAND-14, BRAND-17, COMP-04, COMP-16)
4. **Side padding stays 40px.** The layout lead proposed the `pad` token's 24px (LAYOUT-19). Declined: every page already shares one left edge at 40px, and moving all of them buys no consistency. Instead the site uses 40px, 20px from 701 to 900px and 16px on a phone, and `tokens.json` now says so. (LAYOUT-19, RESP-13)
5. **Doc pages join the site's left edge.** Privacy, terms, about, method and the weekly issues start at the same x as every other page (not a centred column), with text at 52ch; wide tables use the page's width. (LAYOUT-09, TYPE-02)
6. **The tablet band.** From 901 to 1279px the side panel and the window's frame take 306px, so the page is narrower than at 768. Layouts that need room stack until 1279px: the fact sheet's glance, claims and print, the story's hero, the compare rows, Home's steps and rules, the Library's explainer. (RESP-03, 07, 08, 09, LAYOUT-03, 04, 05)
7. **Phones keep the status bar.** At 700px and under it shows SIG, "safety on" and the rules; the SIG word goes first, then the segment, on the smallest phones. Tablets keep the rules too; the page's own facts give way first. (RESP-02, RESP-11)
8. **Ask Sig is a window like every other.** A 44px title bar, 32px tabs, the site's 272px side panel with the four places under New chat and the rest of the site under the chats, the site's greys and grounds, the Prompt's shape. (LAYOUT-07, BRAND-05, RESP-28, COMP-25, TYPE-13)
9. **No glows.** The home graph draws its points as discs, its bloom and vignette are off, blood markers are the Markers agent's teal and cautions the Safety agent's coral. The Library's flow figure, Ask Sig's big ring and the story's ring don't glow or spin. (BRAND-07, 08, 13, 20, 22)
10. **The side panel's rows are rows.** The places are 36px and the quieter "more" list 28px (`row-more`), both in Mona Sans; in the phone drawer every row is 40px. The panel fits a 900px-tall screen whole. On a shorter one the folder tree gives way first, down to 120px, then the panel scrolls under its foot, so Sign in, Join and the legal line stay in view. Nothing in it was removed. (TYPE-06, LAYOUT-06, LAYOUT-27, RESP-04, RESP-06)
    - *Amended after the first pass:* 36px "more" rows pushed Join and the legal line off a 1440×900 screen and cut the Library's note mid-sentence. Measured at 1920×1080, 1440×900 and 1536×864: nothing scrolls and all ten links show; at 1440×790 to 1280×720 the panel scrolls 17–77px with the foot pinned.
11. **Bands aren't cards.** The fact sheet's glance is a band on the `band` ground, not a card in the window; "What moved this week" is a card inside the page's gutter. Page heads stay open bands with a hairline below, not plates. (LAYOUT-10, LAYOUT-11, COMP-12)
12. **Glyphs the fonts have.** ◊ for "worth checking", × for "blocks", ↩ for enter, • for a dot; the check mark and the stop square are drawn (`img/i-check.svg`). (TYPE-14)
13. **Better, same and worse** are lime, `amber` (a mixed read) and `down` (a worse outcome), wherever members' outcomes are split. (BRAND-21, systemic)

### Left as they are, for the founder

- **Ask Sig's crisis card.** Its "Call 988" buttons are filled dark red inside a coral-tinted pin. It's a crisis surface, so it wasn't touched. (BRAND appendix G)
- **The clinician packet** keeps its light "paper" look for printing and sharing with a doctor. (BRAND appendix G)
- **Ask Sig's answer states** (cautions, "avoid" levels, the urgency of a warning, an edited check) use their own coral and yellow shades. They appear only in a conversation and some sit beside the crisis card, so they need a review in a real conversation before mapping to `safety`, `down` and `amber`.

### Follow-ups

- Audit Ask Sig in conversation: the captures show its empty state only, so its answers, cards, screen pane and packet weren't reviewed. Drive a few questions through it (a stack check, a crisis word, a plan) and capture each state.
- Ask Sig's screen pane uses ○, ↳ and box-drawing characters that neither font has; they fall back to the system's mono face.
- The Library's "How the Signal is made" figure: its smallest labels render 6 to 7px at tablet width (RESP-15). Raising them means re-spacing the drawing.

## 2026-11-12: the Sig system, page 9

The founder pointed at page 9 of the design canvas ("9 Sig system") and asked why the site didn't look like it. The first review had checked the site against this brand book and never opened the canvas, so it made the older Plate look consistent instead of building page 9. From now on the canvas is the source of truth: `.claude/skills/design-review/SKILL.md` and `BRIEF.md` hold every page against its board, and `BRAND.md` ends with *The Sig system*.

### The calls

1. **Headlines in Mona Sans at its normal width, semibold.** The wide, heavy Display cut is gone. `hero` 64px (58px in the window), `section` 42px, `page` 38px, `h2` 22px. Supersedes the sizes and the Display face in call 2.
2. **Kickers are comments:** `// the community signal`, lowercase mono at 13px, no rule, no capitals. Labels and column heads are lowercase mono. Supersedes "mono capitals" in call 3.
3. **Tags are words, not code:** Mona Sans in sentence case at 12.5px, 7px corners, with the signer's pip where an agent made the thing. Supersedes "one tag" in mono capitals (call 3).
4. **Corners on the boards' scale:** tags 7px, tab tops 8px, rows 9px, buttons, fields and terminal blocks 10px, cards and the window 12px, the front page's panes 14px. Replaces `radius-plate` 6px and `radius-control` 8px.
5. **Signed, not boxed.** On a fact sheet the findings, studies, safety notes and blood tests carry their signer's 2px mark in the gutter (Evidence librarian blue, Safety agent coral, Markers agent teal) instead of a box round each.
6. **The front page is a prompt, then the Signal, then Sig's twelve agents.** "› look up" with live results and pips, the Library's graph tracing what's typed ("trace semaglutide · 9 places · 5 safety notes"), the numbers, three ways in, the Community Signal running like `top` (totals, members against forums, the board, `tail -f signal.log`), an example run where all twelve agents light the ring and sign their lines (pick one to light up what it wrote), the real BPC-157 example, how a report becomes a commit, the house rules as a file and the questions. The Signal board reads the live public snapshot and asks for a newer one each minute while it's on screen.
7. **Everywhere:** ⌘K (Ctrl K off Apple devices) on every page and in Ask Sig (`lib/cmdk.js`, `library/data/cmdk.json`); the status bar says what you're looking at and how fresh it is, then the rules, then ⌘K ("online" is gone); the ring is the Signal board's spinner; the 404 is "command not found" with "did you mean".
8. **No "!" for safety.** A place with a safety note carries the Safety agent's pip on the graph. (The body map in the shared kit still draws "!"; see below.)
9. **Two more greys from the boards:** `text-read` (#DCDAD4) for an answer's words and anything an agent signed, `hover` (#161C20) for the row under the pointer or picked.
10. **A bug on the way:** privacy, terms and the 404 had no `script-src` in their policy, so their own script was blocked and the side panel couldn't fold or open as a drawer there. Fixed.

### Next, not in this change

- **The community app** keeps its own look until it takes the Sig system: SysCommunity ("every report is a commit", Sig's read under each report) and its status bar. The shared kit (the body map's "!" and its corners) changes there, then is copied here.
- **My Miracle as a file** (`~/my-miracle/stack.yml`), **the weekly email as a changelog** and **share cards with the three pips** (SysEverywhere) aren't built yet.

## 2026-11-12 · Black and electric blue

The site takes page 15's look (pages 15 to 18 of the design canvas): the grounds go from graphite to black, the window gets a faint 64px grid under an ultramarine wash, headlines are wide, heavy and in capitals, kickers are capitals, and the one main action is electric blue (#1A04FF, lit from #3A2BFF) with white words. The community and its Signal go from lime to Signal blue (#3D8BFF; the code keeps the name `lime`), the studies' grades go from blue to mint (#14ECC3), and the Evidence librarian keeps its own blue (#6FA8FE) in Sig's ring. The design check's baseline was rewritten for the new gradients and glow, which the brand book now allows.

## 2026-11-12 · The front page leads with the Community Signal

The front page takes page 15's top. The Library's graph gives way to the Signal itself: a ring of its four parts (what happened 65, agreement 15, voices 10, volume 10) with the score in its middle, the compound's name with a way to step to the next, what people report most, the level its Signal has reached and how strong its studies are. Under it, the Signal spectrum: every live Signal as one bar, as tall as its score and split in the shares its four parts give it, grouped by kind; picking a bar opens it above. Both read the live Signal (`lib/sighero.js`, handed what it needs by `home.js`). The prompt stays, as a search box whose fact sheets open under it while you're in it, and still looks things up in the graph's data. "Signal, not noise" (page 15) follows How it works: what a forum thread or a star rating usually does, beside what the Signal does, rule for rule. The Signal leads the side panel's places on every page, with how many Signals are live on the front page.

1. **The bars are as tall as the score.** The published score isn't always the four rounded parts added up (the parts are shown whole), so each bar's height is the score and its parts keep their shares. Page 15's equation ("= 91.9, exactly") isn't built for the same reason: for most compounds the parts on show wouldn't add up to the number.
2. **On a phone the Signal comes first**, then the spectrum, then the search and the actions, as page 15's phone board has it.
3. **New glow, counted:** the ring's halo and sweep, the spectrum's floor and the picked bar's cap, the Signal card's wash and the open search's panel. The design check's baseline was rewritten for them.

## 2026-11-12 · A plain frame

Every page loses the app window round it: no rounded window box, no title bar with Sig's ring, the window's name, tabs and "12 agents online", no `~` path line, no status bar. The side panel stays, unchanged (its places, what's on this page, the rest of the site, joining). Beside it the page runs full width under a plain top bar that stays at the top: a search box that opens ⌘K, Ask Sig, and Join. The Library's tabs of recently opened sheets went with the title bar; the Library tree in the side panel still shows where a sheet sits. The share images drop their window frame the same way. Ask Sig's own page keeps its chat window, since its tabs are its chats.

The front page gets page 15's "Three steps, one honest number" cards back, under the top, before Three ways in and the animated How it works.

Then, the same day: **the side panel starts closed** behind a menu button at the left of the top bar, at every width; it slides in over the page and closes with its own button, Escape, a tap outside it or a link followed (it no longer stays docked on a wide screen). **The pages run the window's whole width**, up to 2400px, with a margin that grows from 16px to 96px, instead of stopping at 1200 to 1320px; on a wide screen the front page's top grows with it (the headline to 76px, the ring to 420px, the spectrum to 260px tall). And the Community Signal's kinds come from the Library: the live Signal now says only "compound", so the spectrum groups peptides, hormones, medications and supplements by each fact sheet's family.

## 2026-11-13 · The Signal's card speaks How it works' language

The front page's Community Signal was a glowing dial (a bezel, ticks, a sweep and a halo). It is now a card like How it works' six (page 18): square corners and a 1px frame, the rank in the numbered box beside the compound's name in mono and two square arrows, a line drawing of the Signal's ring lying on a plate over a grid (its four parts as arcs, their numbers on mono tags, the score in its middle, one small light going round it), what people report most, and a foot with the Signal's mark, the level its Signal has reached and its studies. On a phone, where the tags in the drawing would be too small to read, the same four tags sit in a row under it. The halo, the sweep and their gradients are gone.

Then the ring was made 3D. Each part is now a wall standing on the plate, as tall as its number (from 6 units at 0 to 42 at 100), so a compound's four parts read as four heights at a glance and the walls rise and fall when you step to the next one. The walls are lit from the front left: each side's shade follows how squarely it faces that light, so the ring's curve shows. The plate is a slab with a visible edge, its shadow falls on the grid below and dashed posts hold it up. The score and its words sit in the ring's middle, sized in the drawing's own units so they always fit inside it. On a phone, where there are no tags, the drawing is cut down to the ring, so the ring fills the card.

## 2026-11-13 · Ask Sig speaks the same language

Ask Sig now looks like the Signal's card. Sig's ring of agents stands in 3D, drawn like the Signal's ring and by the same code (`lib/ring3d.js`): a wall for each agent in its own colour on a slab over a grid, lit from the front left, with the Interpretation agent's white light over the count in the middle. On Ask Sig's page (the agents' tab beside the chat), every wall stands while Sig is ready; when a question comes in, the walls lie low and each one stands up as its agent reports. An agent at work is half up and beating, and a light goes round the slab until the answer is done. On the front page, Sig's twelve agents became a card like the Signal's at the top: the number in its box, "Sig's twelve agents" in mono, the 3D ring with the count, who's who, and Sig's mark at the foot. The example run stands each agent's wall up as it reports, and picking an agent stands its wall above the rest. Square corners came with it: the run's frame and its efficacy box on the front page, and on Ask Sig the window, the answer cards, the ways to start and the box to write in. The terminal look stays: the title bar, the chats as tabs, the prompt and the status bar, and the agents listed on the right. Phones keep Sig's flat ring in the title bar; the 3D ring is in the agents' tab, which shows beside the chat on wide screens.

## 2026-11-13 · Ask Sig: a typing bar of its own

The chat is cleaner, and the box to write in no longer moves. It has its own bar at the foot of the conversation, the same on the first screen and in a chat: the box (square, a hairline frame that turns white while you type, the prompt `sig@miracle ~/chats ›` in it) and one line of small print under it. Only the conversation scrolls, in its own pane between the title bar and the typing bar; the page itself never scrolls, on a phone either. Before, the box sat in the middle of the first screen, then dropped to the bottom, and in a chat it rode up and down over three lines of small print; on a short laptop the whole page slid, and on a phone the page scrolled with the box. What went: the two start-up lines over the conversation (what they said is in the title bar and the status bar), the path line over it on a wide screen (the chat's name is on its tab), and the long small print (now one line: Sig is an AI, no doses, sellers or diagnosis, chats stay on this device, and how messages are handled). On a phone the status bar gives way to that line, and the bar saying what's on the screen keeps to one row. The side panel scrolls by itself on a short screen, so the page never has to.

## 2026-11-13 · The audit's first phase: what was broken

The design audit of November 13 (`design/audits/2026-11-13`) found five things that break a page, and they are fixed. Between tablet and laptop widths (901 to 1279px) How it works' cards wrap their titles and put the web address under the name, as Sig's card does, so nothing is cut and the front page no longer scrolls sideways at 1024. The real example's rows sit under their own headings again from 861 to 1100px. On a phone the front page's Signal board shows "this week", because its closing line wraps. Each page has one main action in electric blue and Join keeps the one white place: a fact sheet's "Ask Sig about" the compound, the goal and compare pages' Ask Sig and the weekly's sign-up turned blue, and the front page's "Look it up" became a hairline, since "Share how it went" is its blue. Ask Sig's agents pane, when it is narrow (wide screens up to about 1700px), puts each agent's line under its name and draws the ring a little smaller, so no line is cut. In the community, the Signal board fits its frame at every width, and Create steps back to a hairline wherever the phone's Share or the new-post form is the main action.

A check now runs on every pull request (`scripts/check_layout.mjs`, in Chromium): every page at fourteen widths from 360 to 1600px, failing when a page scrolls sideways, when text is cut off, or when a table scrolls inside its frame. On the old pages it caught the cut titles and the sideways scroll at 1024, the phone's board and Ask Sig's cut lines.

## 2026-11-13 · Four of the audit's calls: square corners, the librarian's blue, one headline tracking, the community's frame

The owner made four of the audit's six calls (`design/audits/2026-11-13`), each as recommended.

1. **Square everywhere.** Every card, plate, table, pane, button, field, tag, chip, tab, row, menu, dialog and meter is square, in both apps, in the shared kit, in the tags inside the drawings, in the weekly email and in the share images. Only dots and rings stay round (50%): pips, live dots, agent dots, avatars and Sig's ring button. It replaces November 12's call 4 (the boards' scale of 7 to 14px); it's the language the Signal's card, Sig's card and Ask Sig already speak. The brand check now flags any other radius, the ends of meters included.
2. **The Evidence librarian signs in its own blue** (#6FA8FE) wherever it signs: the front page's run, the fact sheets' signer names, Ask Sig's roster, and the community's Library mark and Sig's ring. Mint stays for what it signs: the studies' grades, meters and the studies' verdict on Ask Sig's screen.
3. **One headline tracking.** Every headline in both apps is tracked −0.028em from one value, `--head-ls`, in each app's root; headings inside a page sit at a line height of 1.04, not 1.2.
4. **The community takes the website's frame** (the update's third phase): the website's top bar; the community's side panel stays open from 1280px wide and slides in from the menu below that, with every place and link kept and the Signal added to its places.

Waiting: the front page's length (call 3) and a card on the right of interior page heads (call 5), for the update's fourth phase.

## 2026-11-13 · Ask Sig's first screen, cleaner

The owner asked for Ask Sig's first screen to be cleaner. Everything on it now starts at one left edge: Sig's ring sits over the headline instead of beside it, so the headline, the line under it, the four ways in and the community's lines line up. The headline takes the site's headline style (wide, heavy capitals tracked `--head-ls`, balanced over two lines on a laptop) instead of a semibold of its own, and it is smaller, so it takes two lines, not three. The line under it is two lines, not five: what to ask about is already in the four ways in and in the box, and the rules (no doses, no sellers, no diagnosis) are said once, under the typing bar and in the status bar; "Your doctor has the final say" stays. The community's line and the pairs it is filling first moved under the four ways in, after a hairline, each under a small mono label: the line is one sentence (the Signals and where they are read from, and "Add yours"), and the pairs sit on the same two columns as the four ways in, with how many of their ten reports are in at the right (the count had lost its space: "fat loss0 of 10"). It shows the first four pairs, three on a phone. On a phone, the four ways in are now on the first screen; before, they were under the fold, after the community's chips.

## 2026-11-13 · The audit's second phase, part two: one set of pieces in both apps

The update's second phase finishes here (`design/audits/2026-11-13`). The two apps now share one set of pieces.

- **Kickers** are one style in both apps and on the story page: mono capitals at .12em, 12px, led by a 28px rule (TYPE-01). The `//` lead is gone. Everything else that is mono is a label, and labels are lowercase and untracked. That covers the community's rail heads, captions, tabs, the phone tab bar, form labels and its status bar (TYPE-04). "SIG" and the COMMUNITY tag keep their capitals.
- **Headlines.** A page's h1 is the `page` size in both apps. That includes Ask Sig's greeting, the Library on a phone, and the community's screens, space and profile. The community's h2 inside a page takes the website's size (TYPE-02).
- **Tags are words.** The community's tags are Mona Sans 12.5px in sentence case, 27px tall, with a hairline frame and no fill: Report, OP, moderator (COMP-11).
- **Buttons** are 48px (40px small) in both apps, Mona Sans 600 at 14.5px (14px small) (COMP-07).
- **Fields and focus.**
  - Fields are 48px at 16px, and their placeholders are muted.
  - On hover and on focus their frames turn white, and the focus ring is a solid 2px ring outside the control. Inside is used only in a strip that scrolls (the chat tabs, the community's left nav).
  - The typing bar and the community's search and fields draw the ring too, which they didn't before (COMP-03, 10, 14, 15).
  - On a phone, every field is at least 16px, so an iPhone no longer zooms the page when a field is tapped.
- **Hover.** Hairline frames brighten to text white, and rows and quiet buttons take one hover ground, #1C1C20 (COMP-08, 09).
- **One inline link:** the words in text at 600, with a 1px underline at half white, 3px under, that turns solid on hover. Small print keeps its grey at 400 (COMP-05).
- **Line length.** Running text holds about 52 characters a line in both apps: the foot, the fact sheets, the front page, the story, method, the body map and the community's posts and cards (TYPE-03, 07, 13).
- **Phone floors.** On a phone, copy is 15px or more, notes 14px or more and labels 11px or more. Every tap is 40px: the frame's logos and foot links, and the community's votes, actions, tabs, sorts and avatar (PT-06, 07, 08, 11, 12, 22).

Two checks keep it this way. `scripts/check_states.mjs` runs on every pull request, beside the layout check. It walks each page with Tab at 1440 and 390 and fails on:

- a focus without its ring, or a ring drawn inside with room outside;
- two electric blue main actions in one view;
- a phone field under 16px.

On main before this update it found 14 such places. The brand check now also counts tracked mono outside kickers and capitals outside headlines, kickers and the COMMUNITY tag. Today's 15 and 3 are its baseline.

The website's side panel turned out to move focus into itself when it opens, so it needed no change.

## 2026-11-13 · Ask Sig as the community's mind (page 19 of the design canvas)

The owner approved page 19 ("I like this GO"), and Ask Sig is built to it. Where the build departs from the boards, it's on purpose:

- **Who answers.** A pill beside the send button opens the picker: four teams (everyone, the crowd, the studies, what I take) and the twelve one by one. The Safety agent is always on. Each chat keeps its own choice, and a new chat starts from the last one made. The choice goes to Sig's server with each message, and the server says who answered (the community repo's `ask` function, the same pull request's partner). Choosing never takes away what keeps someone safe: the server still calls in the Synergy auditor when the member mentions their own medicines, conditions or pregnancy, so the picker says so.
- **The answer is spoken.** It opens with a headline (22px, the scale's nearest to the board's 23), then short paragraphs (16px, not 16.5). Each compound carries its Community Signal where its first sentence ends, when the community answered. The studies, the safety line ("good to know"), what to take to a doctor and the efficacy read stand apart in labelled rows. The numbered part tags and their agent names are gone from the words; screen readers still hear which voice a part draws on, and the words say it too.
- **No member's quote.** The board showed one member's words under the answer. Sig never quotes or describes one member's post, only totals, so the build leaves it out.
- **How it got there** (each agent's steps) folds under the answer's first line, "how I got here". It is open while the agents work.
- **When nobody has a Signal for it yet,** a card offers to ask the members. It opens the community's new-post form with the question filled in, and the member posts it themselves. Two changes from the board. It doesn't say "posted without your name", because the page can't promise that. It doesn't show "0 of 10" either, because the page can't know how many reports a compound without a Signal already has. Its button is a white line button, so the send button stays the one electric blue action in the view. "Show me here when its Signal goes live" is kept on this device. The next visit after it goes live says so once.
- **Nothing to tap after help.** After a sign of crisis, an emergency or someone under 18, the answer gets no headline, no follow-ups and no "ask the members": only the help.
- **Beside the chat**, the agents' roster and the 3D ring gave way to three tabs: blood markers, Sig's mind and the screen. The left side panel (the site's navigation and the chats) is unchanged.
  - **Blood markers** are a rack of test tubes from the Library's body map, for whatever the answer names, not only the board's two. The rack opens by itself only when the Markers agent answered.
  - **Sig's mind** maps every Signal by family. Its lines mean "read together for this answer": the Signal doesn't have taken-together data yet.
- **Narrower windows** get the same three tabs in the pull-up sheet, closed from its own bar.

## 2026-11-15 · The site opens smoothly

The owner found the front page's opening wasn't smooth. Measured on a desktop and on a phone, with the processor slowed to a mid-range phone's (pictures and numbers in `design/audits/2026-11-15/smooth-opening/`), three things made it stutter:

- **The top jumped.** The Signal card grew when the live Signal arrived, so the headline, the search and the spectrum moved down about 75px on a desktop. Ask Sig's welcome moved up about 107px, the Library's search and list moved down 110px, and My Miracle's footer moved down 176px.
- **The ring's light was drawn again on every frame,** so it froze whenever the page was busy, and the walls appeared all at once.
- **Everything started at once:** the community board, Ask Sig's example run and How it works started while the top was still opening, all below the fold.

What changed:

- **Nothing moves while a page opens.** Whatever arrives later keeps its place from the first frame: the Signal card's rows and its phone chips, Ask Sig's community lines, the Library's "What moved this week" and My Miracle's empty state. Each waits as an empty place of the same size, then its words fade in.
- **The front page's top plays in once.** The plate is in the page from its first frame, because the build draws it in. When the Signal arrives, the walls come up onto it while the score counts up. What it changed fades in, and the spectrum's bars grow from the floor if they're on screen. Then the light starts round the plate.
  - All of this moves on the compositor (transform and opacity). It keeps moving even while the browser is busy.
  - People who ask for less motion get the finished card at once.
- **Picking another compound** still moves the walls themselves, as before.
- **The rest of the front page waits.** The board, the example run and How it works start after the top has played, one at a time in idle moments. At the first scroll they all start at once, so each is ready before it can be seen. A jump to How it works now lands where it should, because nothing above it moves.
- **Smaller costs.** Numbers are grouped without loading the browser's number formats. Every page preloads the mono font, so it doesn't swap after the first frame. The front page asks for its scripts alongside home.js. Ask Sig's 3D ring doesn't animate while it's off screen.

Then the owner asked for it smoother still ("maked it smoother"). Scrolling down the front page was the next thing that stuttered:

- **How it works redid all its work on every frame.** It read the layout between its writes, so the browser laid the page out again several times a frame. It also re-wrote every card, title and drawing, and drew all six pictures even when they were off screen. Now:
  - it reads where things sit once, and again when the section changes size;
  - each frame it writes only what changed;
  - a card's picture moves only while the card can be seen;
  - the ring of words is drawn at most 30 times a second, and only while it's on screen;
  - the spine's marker and fill move by transform.
- **The live dots' pulse layered the whole page.** The pulse moves on the compositor, but with nothing clipping it the browser had to give everything drawn after it a layer of its own, and every frame paid for those layers. Each pulse now grows inside a small clipping box, with negative margins so the layout is unchanged. That covers the front page's kicker and the Library's and fact sheets' "live" dots. The orbits round the 3D rings are clipped the same way.
- **Ask Sig's example ring** gives each agent's walls a layer of their own, and its light moves on the compositor too. A wall that rises now redraws only that agent's walls.
- **The opening's last heavy frame is lighter.** The walls are made unseen while the Signal is still loading. The spectrum's bars, when they're off screen, are made after the opening. The fade-ins let go of their layers when they end.

## 2026-11-16 · How it works on the front page, simpler

The owner asked for the front page's "Three steps, one honest number" and the three ways in under it to look better and simpler (pictures in `design/audits/2026-11-16/simpler-how-it-works/`). It was six boxes: three tall cards with an empty band between each drawing and its title, then, after a wide gap, three more cards that said much of the same again. Now:

- **The three steps stand on one line.** No cards: the three drawings are joined by a hairline with an arrow, and each step's number, title and line sit under its drawing at one left edge. Up to 999px, and on a phone, the hairline runs down the left.
- **The step titles are semibold, in sentence case,** as headings inside a section are in the brand book; the section's headline is its one line in capitals.
- **The line under the headline sits under it,** not far off to the right.
- **The three ways in are three slim links** on the steps' own columns, each starting where its step does: the place's mark from the side panel, the title and, where there's room, where it opens. Their descriptions went, since the steps say how the Signal works and the titles say where each goes. The links themselves are the same three.

On the owner's window the section is 696px tall instead of 1,048; on a phone, 1,151 instead of 1,979.

## 2026-11-16 · The Signal board, cleaner

The owner asked for the front page's Community Signal board to look cleaner, and whether it was needed at all (pictures in `design/audits/2026-11-16/cleaner-signal-board/`). It stays: it is the one place on the front page that names the compounds people say worked best, in a ranked list. Around that list, most of the board said nothing yet:
- four counters, three of them zeros;
- where the numbers come from, and the score's formula;
- ten columns, two of them the same on every row;
- a log with two lines in it.

Now it is the eight highest Signals, each with what people report most for it and its score, and a way to the whole board:
- **Gone:** the counters, the source split and formula (the line under the headline says the Signal is read from public forums for now, and "How the numbers are made" has the formula), the four parts' columns (the ring at the top of the page shows them, and the community's full board sorts by them), "from", "read", the log, and the second button to the full board.
- **What people report most** is new: the first of each compound's themes in the snapshot, beside its name, or under it on a phone.
- **The bars are Signal blue,** the community's colour.
- **This week's move** shows beside a score only when the compound moved.
- **When the Signal can't load,** the board says it is offline and opens the whole board in the community.

## 2026-11-16 · The front page's top stands on the Signal's floor

The owner pointed at the isometric squares under the Signal's ring. They asked for the top's background to be made of them, "so it looks like it's going inside", with the ring built into it to look more spectacular. Now:

- **The floor is a layer of the top's own** (`.sx-ground`, `lib/sighero.js` `sxFloorSvg`), under everything in it. It is the plate's grid, the same isometric squares 40 units apart, carried on across the whole top in place of the page's square grid.
- **It fades with distance,** the back first, so it reads as going in:
  - it is brightest round the ring;
  - it fades down to the page grid's own faintness;
  - the ultramarine wash stays at the top.
- **The floor and the plate line up.** The floor is drawn in the drawing's own units, and the script moves and scales it to wherever the drawing sits. It does this again whenever the top or the drawing changes size, then fades the floor in.
- **The ring is built into the floor:**
  - the slab rests on it, without the posts or the small grid it stood over;
  - Signal blue lights the floor round the slab;
  - the card has no box round the ring;
  - what people report most and the foot became a plate of their own under it.
- **The design check counts one more gradient.** It is the wash, laid again on the top's own black, since the top's ground now hides the page's grid; the baseline is raised for it.
- **Smoothness:** measured over the whole first load, with the processor slowed four times, the opening pauses as often and for as long as before. Main-thread work is the same.

## 2026-11-16 · The violet band

The owner showed a grainy purple gradient banner and asked for something like it in some parts of the website, "so it doesn't look too flat". There is now a violet band (`.violet` in `styles.css`):
- **What it is:** a violet gradient, deepest at the top left and lightest at the bottom right, under a fine grain (a small noise tile, `img/grain.svg`, blended over it).
- **Its colours** are tokens: `violet-deep` #5D33EF, `violet` #6B48F1 and `violet-light` #9AA0F4.
- **It's a little deeper than the example,** so the white words on it read at 4.5:1 or better where they sit. Measured on a laptop and a phone, the smallest line, the weekly email's note, reads at 4.6 to 4.8.
- **Where it goes:**
  - How it works' opening on the front page ("The system behind one honest number."), where the spine's marker now passes under the band;
  - Join ("Took something? Say how it went."), with its pane of reports a black window on it;
  - the weekly email at the foot of every page, as a band of its own.
- **On the band:** the words are white and the main action is black, since electric blue doesn't hold on violet. The weekly email's field is a dark glass, with a white outline when you're in it.
- **The design check** counts its one gradient (the baseline is raised by one). Its colours are in the palette, so the colour count is unchanged.

## 2026-11-17 · A cleaner top, and a top bar with its sections

The owner sent the front page's top on a wide screen and asked for it to look cleaner, with a better header. The top had too many boxes (the rank's numbered box, two arrow boxes, four boxed tags round the ring, a plate of what people report and a foot with its own tile), three ways to act and four big numbers, and on a wide screen its two halves drifted far apart.
- **The words:** the lede is two sentences: one honest score, built from what people who took it report; "it did nothing" counts and nobody can buy a better number. The twelve weeks are left to How it works.
- **One main action:** the search is the top's main action, so Look it up is the electric-blue button. Share how it went and How the score is made are plain links with an arrow.
- **The numbers** are one line: 51 live Signals (in the community's blue), no ads, no sellers, no doses. Zeros read like missing data.
- **The Signal stands on the floor with no plates:** the name and its rank are words over the ring (no numbered box), the ring's four numbers are words with a dark edge instead of boxed tags (on a phone, two by two under it), what people report most is three lines, and the level and the studies follow on one line.
- **On a wide screen** (the window 1500px and up) the headline grows to 88px and the Signal's column to 800px, so the two halves fill the width together.
- **The top bar names its sections:** The Signal, Library, Community and How it works sit after the logo, the search moved to the right, and the page you're on is underlined. The side panel keeps everything and stays where it was; below 1100px wide the bar is as before.

## 2026-11-17 · Sig's ring in the browser tab

The owner asked for Sig's logo in the browser tab, where the community's blue ring and dot was.
- **The tab icon is Sig's ring:** the eleven agents' pieces in their colours and the Interpretation agent's white dot, on Ask Sig's app icon's dark ground, with the corners the tab icon already had. It is drawn larger and bolder than the title bar's ring (28 of 32 across, pieces 5.2 wide, 14° apart) so it still reads as a ring at 16 pixels.
- **One drawing, two files:** `favicon.svg` for the browsers that show an SVG icon, and `favicon.ico` (16, 32 and 48 pixels) for those that can't. `design/favicon/make_favicon.py` draws both from `lib/ring.js`, so the tab's colours follow the ring's. No page changes: they already link `/favicon.svg`.
- **The community app** keeps its own tab icon, the blue Sig, the community's character.
## 2026-11-17 · The foot, with the logo's word drawn big

The owner sent a video of a footer whose name is drawn huge at the bottom as a stack of hairline outlines that light up under the pointer, and asked for ours to be like it, with the Miracle logo and our purple and blue.
- **The word:** the logo's script word alone (HEALTH and the registered mark left out), traced from `logo.webp` into outlines (`design/wordmark/make_wordmark.py`, run when the logo changes). It is drawn eight times, each a step down and to the left and fainter than the one in front, as hairlines in a gradient from light violet through the brand's violet and an ultramarine into the Signal's blue (`img/wordmark.svg`, 11 KB, cached once).
- **At the very bottom of every page,** as wide as the page's text, the page's bottom edge cuts off the lower part of the word. On a phone it runs edge to edge.
- **It's dim, and lights up under the pointer:** a second copy at full strength is seen only through a soft circle (`img/glow.svg`) that follows the pointer anywhere in the foot (`lib/os.js`). With no pointer (a phone) the circle sweeps slowly across. With reduced motion there's no sweep.
- **The brand book's logo rule** (never recolour or outline it) now has this one exception, at the owner's request. The word is used there only, and never as the logo.
- **The foot above it, tidied:**
  - the logo at 32px with "Peptides, without the sales pitch." and the disclaimer;
  - the links in four columns: explore, community, how it works, contact;
  - a last line: © 2026 Miracle Health and "no ads · no sellers · no doses".
  The weekly email's violet band stays first.
- **The design check** is unchanged: the glow's circle is a drawn file, not a CSS gradient.

## 2026-11-17 · The Signal's ring, in light

The owner sent the front page's ring and asked for the drawing to look better. Up close it had grey walls (the light parts' shaded sides went grey), stripes down the big wall (each 4° slice its own flat shade), beaded top edges (each slice's highlight overlapped the next one's), a slab outlined twice in grey like a record, and the score running into the back walls.
- **Shading:** the walls are shaded by one gradient per part across the drawing, so the curve turns smoothly; the light falls off a little faster round the curve so the turn reads. Shadows lean toward a deep Signal blue (#0E2A66) rather than toward black, so the light parts read as pale blue in shadow, not grey. The tops brighten slightly toward the light.
- **Edges:** the top edges are solid lines with round ends, so they run on unbroken.
- **The slab:** no outlines: its side is lit from the left and its rim catches the light at the front left and fades round the back. Signal blue spills onto it round the walls' foot, inside and out. The middle keeps one faint ring, not two.
- **Room for the score:** the walls stand a little lower (100 is 35 high, was 42) and the score sits lower in the opening (51.75% down, 40.2% on a phone, where it's 42 units high), so it clears the back walls and the front wall at every width.
- **Only the Signal's ring:** these are options of `lib/ring3d.js` (smooth, ambient, sheen, a soft slab); Sig's agents ring keeps its look.

## 2026-11-17 · The top in light

The owner didn't like the 3D ring at the top of the front page and asked for something more innovative, "like the Solana or Sui websites' moving banners with colours". Two looks were made over the live page and filmed: A, light bands (Solana's drifting light), and B, a warp (Sui's streaks rushing out of the middle). The owner asked which was better; A, because it is the colourful moving banner asked for, matches the foot's violet into blue, keeps the words readable without hiding the effect, and is calm enough for a health site. The owner then asked for it built and improved overall.
- **The light** (`lib/sigfield.js`): bands of violet and blue light drift behind the whole top, as if on an LED wall. Each of the Signal's four parts is a band in its colour, as bright as its number, with three thinner streaks of the same light between them, brightest round the score. Picking another compound sends a pulse out through the bands from the score; a pointer gathers a little light round it.
- **Words first:** the light goes dark behind every block of words (the left column fades out across the gap to the card on a wide screen), so nothing small sits on bright light.
- **Light to run:** it's drawn one pixel for each 5px cell and scaled up square (a 25th of the screen's pixels), the cells' dark grid is a still layer (`img/led.svg`), about 30 frames a second, nothing off screen, one still frame with less motion, and the plain ground without WebGL.
- **The card:** the 3D ring and its floor are gone from the top. The score stands big, and the four parts are bars on a dark pane under it, each filled to its number with a glow of its colour, growing on the compositor.
- **The parts' colours** move from Signal blue's tints to Signal blue into the brand's violets (what happened `lime`, agreement `violet-light`, voices `violet`, volume `accent-hi`), in the bars, the light, the spectrum and its legend, so the top is one violet-into-blue piece with the foot.
- **Sig's ring** keeps its 3D on Ask Sig; only the front page's Signal left it. This replaces the ring's polish (#45, merged earlier the same day); `lib/ring3d.js` keeps its smooth-light options for Ask Sig to use.

## 2026-11-17 · The light made smooth, the parts in plain words

The owner saw the new top on a sharp screen: "the background is not as smooth as in your video", and the parts' names "not very clear".
- **Smooth light:** on a screen with twice the pixels the wall's cells were 10 of the screen's pixels each, drawn as hard squares, with a twinkle on every cell ten times a second and the light skipping every other frame. Now the browser scales the light up smoothly (soft gradients through the grid), the cells are 5 CSS pixels on an ordinary screen and finer on sharp ones (4 at 1.5 times, 3 at twice), the twinkle is gone, and it draws every frame. The dark behind the words has rounded, softer edges.
- **Plain words:** the four parts are named for what they measure, everywhere the site names them (the bars, the spectrum's legend, How it works and the Library's figure): what happened is now "how well it worked", agreement "how much people agree", voices "how many people" and volume "how many reports". The bars' names are in the reading face, not the code face, at 15px.
- **The keyhole** on How it works' fifth step sat 10 units right of its lid's middle; it's centred.

## 2026-11-18 · A launch check against six legal risks

The owner asked for a check of six risks that commonly catch new sites: a missing age gate (COPPA), fonts loaded from Google's servers (GDPR), session replay without consent (California's wiretapping law), marketing emails without an unsubscribe link and a postal address (CAN-SPAM), renewal terms away from a subscribe button (California's automatic renewal law) and no registered DMCA agent. What the check found and did:
- **Age:** the community already refused anyone who didn't confirm they were 18, but asked after taking the phone number, with a tick box. It now asks the month and year of birth first, plainly, and asks nothing more of anyone younger (community repository). The privacy notice says so, and that we don't knowingly collect anything from children under 13.
- **Fonts:** both apps serve their own fonts; nothing loads from Google.
- **Session replay:** off. PostHog, if it's switched on, records no sessions, captures nothing automatically and now keeps nothing on the device; Sentry has no replay.
- **The weekly email:** one-click unsubscribe (and the List-Unsubscribe header) was there; the postal address wasn't, because `library/data/about.json` has no `mailing_address` yet. The address line is now marked (`data-mh-postal`), and the community's newsletter function refuses to send an issue without it. No issue has been sent.
- **Renewals:** nothing is sold or renewed, so there is no subscribe button to put terms beside.
- **DMCA:** the terms now explain how to send a copyright notice and a counter-notice, and that repeat infringers' accounts are closed. The agent still has to be registered with the Copyright Office; once it is, its details go in the terms exactly as registered.

## 2026-11-18 · Sig's ring on the community's sign-in page

The owner pointed at the blue ring and dot beside "The Miracle Health community" on the sign-in page and said it should be the Sig logo. That spot is a logo, not Sig reacting to anything, so it now shows Sig's ring, the mark in the browser tab and on Ask Sig, drawn the way `lib/ring.js` draws it (community PR #25). The blue Sig keeps its moods everywhere it acts as a character.

## 2026-11-18 · Sig's twelve agents, drawn simply on the front page

The owner found the front page's Ask Sig section too busy: a 15-step run log, a six-part answer, Sig's ring in 3D and a list of the twelve that lit up the lines each wrote. They asked for the agents illustrated in frames and boxes, each explained. The section now shows one question going through them in four steps down a numbered line: the Safety agent reads it first, ten agents gather what's known (in two frames: what the studies show, and what people report with what it means for your stack), the Interpretation agent weighs it all, and the Safety agent checks every line. Each agent is a box signed along its top in its own colour, with its mark, its name and one plain sentence. The build draws the boxes from Ask Sig's own list (`AGENTS` and `CREW` in scripts/build_library.mjs), so the two pages name the agents the same way. The section is half as tall on a phone (2,688px from 4,072), and the front page no longer loads the 3D ring.

Later the same day the owner asked for it to look better. The ten gatherers now stand as two equal frames of five rows (side by side from 1100px), each frame named on its border; the Safety agent's two steps and the Interpretation agent are wide bands with a tag for when they act ("reads first", "weighs it all", "checks last"); every agent sits on a faint ground of its own colour with its mark on a tile of it, signed down its left edge; the question and the answer sit in the prompt's box, the answer signed by twelve dots in the agents' colours. The tints are color-mix() of each agent's colour, so no new colours enter the palette.

Then the owner asked to see it in the style of the front page's top (the Solana-like light). The section now has the top's LED light behind it (`lib/sigfield.js`, with a new `spread` option so the bands reach over a tall section; the top keeps 1 and is unchanged), in four of the agents' colours, brightest behind the agents and dark behind the words above and below them; a pulse goes out from the agents every eight seconds. The frame is dark glass (a third opaque) so the light glows through, the agents' boxes let a quarter of it through, a strip of the ring's eleven colours runs under the frame's bar, and a pulse of light travels down the four steps in each step's colour. With less motion asked for, the light is one still frame and the pulse is gone.

Then the owner asked for better cards. Each agent's card is now an even dark glass with a hairline of its colour round it, and its mark dark on a solid tile of its colour: the one solid colour on the card, so the twelve read as twelve colours at a glance (the Interpretation agent's tile is white, the centre of the ring). The muddy tints behind each card and the coloured left edge are gone; pointing at a card brings its colour up.

## 2026-11-18 · The front page's punchline: "No miracles. Just what happened."

The owner asked for the top to look better and for a better punchline. The headline is now "No miracles. Just what happened.", the second sentence on its own line in the Signal's blue: the line the About page already carried, and the one that says what the site is for in the brand's own name. "Peptides, without the sales pitch" stays as the page's title, its share card and the footer's line, where it does the search engines' work. Under it, one shorter sentence: every peptide, hormone and supplement, scored 0 to 100 by the people who took it. Under the search box, the four most talked about as chips (the same four the box offers first); sharing how it went is framed as the second thing to do; and the count line became three numbers (live Signals in blue, compounds, fact sheets) with what's never here (ads, sellers, doses) under them.


## 2026-11-18 · The top, cleaner, with the punchline in a gradient

The owner asked for the top to be cleaner and for a gradient. The punchline's second sentence ("Just what happened.") is now drawn in the Signal's light: its blue running into the violets of its bars (`lime` → `violet` → `violet-light`), the colours of the light behind the Signal beside it and of the main action under it. Each line carries the whole run, so it reads the same whether the sentence takes one line or two; Signal blue stays underneath for any browser that can't clip a gradient to words, and high-contrast modes get plain words. Its darkest point, the violet, is 3.8:1 on black, above the 3:1 a headline this size needs; the rest is 6:1 and up. The gradient is the front page's one; the brand book's list of where gradients may go now names it (`design/baseline.json` allows home.css one more).

Cleaner: the kicker leads with its live dot alone (its dash is gone; other kickers keep theirs), the four most talked about are plain links instead of boxed chips (the label is dropped on a phone so the four fit one line), sharing how it went is a link again beside how the score is made, and the rule over the three numbers is gone. Nothing was taken out of the top: the same search, the same four, the same two next steps, the same numbers and promises, with one box and one line fewer each.

Options shown to the owner beside it: blue to lavender, blue to orchid, Sig's ring (coral, yellow, teal, violet) and a Solana-like violet to blue to teal.

## 2026-11-18 · Clean, not costume: a sixth agent, and the small details gone

The owner sent six screenshots of small details (the three numbers' tiny labels and "no ads · no sellers · no doses", the spectrum's legend, the board's `signal.top` bar with its live stamp, the agents' `~/sig/agents` bar with "one question · four steps · twelve agents", "you get" with twelve dots, and `house-rules.md` with "4 rules · 0 exceptions") and said they look like AI, are too much and make the site not clean. He asked for a software design agent that makes sure they don't appear again.

**The agent.** `.claude/agents/design-clean.md` joins the department as its sixth member, and the design review briefs it with the others (its findings come first: delete before restyling). Its rules are the brand book's new section, *Clean, not costume*: no code costume, no bars on panels, no corner captions or counters, no chains of three or more bits on middle dots, no rows of dots or colour strips, no words in the code face, no prefix labels or padded numbers, no keys that repeat labels, nothing a reader needs under 13px.

**The check.** `scripts/check_clean.mjs` opens every page in `design/pages.json` at 1440 and 390, and the front page's search results and ⌘K, and fails on the mechanical kinds: file names, paths, prompts, commands and code comments (written or drawn by the stylesheet), dot chains (written or drawn), rows of dots and colour strips, and words in the code face. It runs in CI with the layout and focus checks. On the site as it was, it found 1,438 problems (284 on the front page alone, all six of the owner's kinds among them); now none. Two things are allowed on purpose, each with its reason in the script: keyboard keys, and Ask Sig's screen, the editor the owner chose, which lays compounds out like code.

**What changed.** The words moved to the body face, in sentence case: every kicker (no rule before it, one short phrase, no dots), label, table head, card head, tab, caption and date; numbers stay in mono. Removed: the bars naming panels and their meta, the board's live stamp, the agents' rainbow strip, "you ask" and "you get" and the twelve dots, the agents' "reads first" tags, the top's promises line and the spectrum's legend, How it works' "step 01 of 06" and its cards' corner captions, the search results' file names and key hints, ⌘K's prompt sign, verbs and key hints, the side panel's captions beside each place ("122 sheets", "12 agents", "this device", "live"), the Library tree's folders and file names (now the families and the sheets by name), Ask Sig's tagline, "12 agents online", path, prompt, block cursor and status bar (its window now ends at the typing bar, and a question shows as a plain bubble), the story's prompt, paths, padded numbers and status bar, and the 404's fake shell (it says the page isn't here and offers the closest compound or page). Chains became sentences or plain lists, in the page and in what scripts write (the Signal card, the example's caption, the fact sheet's Signal line, the method's weights, the weekly line, the packet, Sig's answers).

**Kept.** Every navigation panel and its links; the agents' colours and glyphs; the frames and steps of the twelve; the numbers; the honest notes ("An example, not a real report"); the drawings' own labels; and the body map's place names, set in the body face here by the site (the shared kit still sets them in the code face until the community's pass).

**Next.** The community app gets the same pass (its kit, its labels), with the agent's rules.

## 2026-11-18 · Wide screens: nothing runs long and empty

The owner sent the front page's Community Signal on a screen about 2,450px wide and asked why it was so stretched. Since the pages run the window's whole width (November 12), every block under a heading ran the whole width too: the board's eight rows put the compound and what people report most at the left and its bar and score some 1,500px away, and signal and noise, the example, the twelve agents and the rules ran long with their words at the left and empty space after. The pages keep the whole width; what fills it changed.

A first try set each section's heading in a column beside its block on a wide screen. The owner turned it down the same night: it fills the width artificially; put the heading above and fix the cards. So every heading stands above its block at every width (the questions' too, which had stood beside their list from 1000px), and the cards are made to fit:

- **The board.** A bar first filled the row between the compound and its score, so a wider board drew a longer bar instead of a gap; on the owner's screen that made bars some 1,500px long, and the owner said lines that long look ridiculous. So the rows are a grid now, the same tracks in every row so names, bars and scores line up: a bar is 48 to 480px, and a board 1120px wide and up holds its eight in two columns of four (1 to 4, then 5 to 8), a line between them and the way to the whole board under both. What people report most stands under the compound's name (as it did on a phone), with a column of its own only where each column of the board is 1000px wide. The head row (rank, compound, signal) is for screen readers only, and the table keeps its rows, cells and headers for them through roles in the markup, since the grid takes over their display; what people report most is read out once (the copy under the name had been hidden from them). With this week's moves, the Signal's track widens to hold them. The foot keeps its line and its two ways on together.
- **Signal and noise.** A card 840px wide and up lists its seven lines in two columns, the same in both cards, so each line still stands level with its answer in the other; the last runs across both.
- **The twelve agents.** Where the two frames of gatherers stand side by side (1100px), an agent alone in its step is one frame wide, not the window's. From 1880px each frame is a row of five cards and an agent alone is one card wide. The question in and the answer out end where those agents do.
- **The example.** From 1280px its head sits on the card's own columns: the compound over the first two, its Signal over what people report (its bar no longer than 480px), instead of at the far edge. Its foot keeps its words and its way on together.
- **The rules** stand two by two from 1100px and four across from 1880px. **The questions** keep a reading width (1040px), so each one's + stays near it. Ask Sig's heading breaks between its three sentences, never after a sentence's first word.
- **Elsewhere:** the weekly's list of issues keeps 780px (its dates had run to the far edge), and the method's tables stop at 740px (the table of pairs) and 1280px (the placebo table).

**The check.** `scripts/check_layout.mjs` now also opens every page at 1920 and 2560 and fails a row (a table row or a list item) whose parts stand side by side more than 560px apart. On the site as it was it found 26 such rows on the front page at 1440 to 2560 alone, and others on the method and weekly pages; now none, at all 16 widths. The design department's capture adds 2560, and the layout lead looks for it.

## 2026-11-19 · The Noise card in matte grey suede

The owner asked for the Noise card (signal and noise, on the front page) in a matte grey fabric. Six were tried on the page at 2,560px, at actual size: suede, felt, linen, twill, herringbone and a ribbed knit. The owner chose suede.

- **What it is.** A fine grain, `img/suede.svg` (a 200px tile of fractal noise, grey, opaque), laid over a new ground, `suede` (#28282D), in soft light, so it lightens and darkens the grey a little, never tints it; and a soft light from the top left, a white radial gradient at 6% that fades out by 60%. The tile is a file on the site, as the page's rules (img-src 'self') ask, and drawn once.
- **Words on it.** `muted` would read at under 4:1 on it, so the card's list and its line under "Noise" are `text-2`: about 5.8:1 beside every line, 4.7:1 on the lightest grain. Noise stays quieter than the Signal card's white words.
- **Why it works.** Noise feels like something to the touch, matte and grey; the Signal beside it stays clean and lit.
- **The design check** counts one more gradient (26, the suede's light); the baseline was raised for it, on purpose. `suede` is in `design/tokens.json` and the brand book.

## 2026-11-19 · The three steps as large cards

The owner sent How it works on the front page ("Three steps, one honest number") and asked for three large cards, with the top icons larger (not the three ways in under them, which stay slim buttons). This undoes November 16's "no cards" for the steps, at the owner's word.

- **The cards.** Each step is a card: its line drawing, its number, its title and its line, on `surface-raised` with a hairline border, the three on the same columns as the ways in below them.
- **The drawings, larger:** 72px on a phone (beside the words), 112px on a laptop (over them), 128px on a wide screen, where the card's words grow too (title 24px, line 18px). Their strokes stay 1.2px at every size.
- **No long lines.** The hairline that ran across from drawing to drawing, some 600px on a wide screen, is gone; a short arrow in the gap leads from each card to the next, across on a laptop and down on a phone.

## 2026-11-20 · One brand pack, made from the site

The owner asked for an asset pack (brand identity, icons, marketing) that covers the website, the community and the Community Signal, all matching, in a clean format, with nothing in it that is too much. So the pack is not drawn by hand: `design/pack/build.mjs` makes it from what the site runs on, and it is lean: a two-page guide and six folders (*The brand pack* in the brand book).

Taking stock first found six things that did not match. What was decided about each:

- **The logo was only a 480px picture.** It is traced once into `design/pack/logo.svg` (one path; against the picture its ink area is within 0.11%, and 37 pixels differ by more than a quarter). HEALTH's corners are rounded in the artwork, so they stay rounded. The ® is part of the artwork and stays; whether the mark is registered is the owner's to confirm.
- **The share images broke the clean rule** (a kicker in the code face in capitals with a rule before it, the address in the code face, a strip of four rules along the foot, a path as the story's kicker). All 35 are redrawn in one layout: the logo and the address along the top, a kicker, the headline with its punchline in the gradient, one line. The foot is gone, not restyled (delete first). Posts, stories and headers in the pack keep the same layout, from the same file (`design/pack/look.mjs`).
- **Two icon weights.** The glyphs were drawn at 1.6 and the community's interface icons at 1.8. One set now: 1.6, the weight of the drawings that carry the brand. `design/pack/icons.json` is the set; the community draws it at 1.6 from its next change.
- **Two tab icons.** The site's stood on an old graphite (#0B0F11) and the community's was Sig the character. The brand book already said the tab is Sig's ring; both are the ring on the page's own black now. The tile keeps its rounded corners: a tab icon is the one place the browser's convention wins.
- **Two marks called Sig.** Kept as the brand book has them, and said plainly in the guide: the ring is the mark (the profile picture, the app icon, the tab); the blue ring and dot is Sig in the community, a character with moods, never the logo.
- **The logo on violet.** The book says never on a colour. So a piece on the violet band (Join, the weekly email's header) puts the logo on black above the band.

**Kept out, on purpose:** the community's fifteen emblems and the compound prints (they belong to the app and to each fact sheet, not to anyone making a post); a light version of the logo (there is none: it is white, on black); desktop copies of the fonts (the pack carries the web files and their licences and says where the full families are free to get).

**The token file's headlines were out of date** (weight 600 at the normal width, from before November 13; a sample that read "The Signal — top"). They say what the pages draw now: Mona Sans at its widest, 800, in capitals. Their sizes are left as they were, because the design check takes its type scale from them: the pages' headlines run smaller than those entries (a section's is 26 to 36px, not 42), and bringing the scale and the entries together is its own change.

**The design system on Claude was a terminal-era one** (November 11). A new "Miracle Health" system holds the brand as it is today: this book in short, the tokens, ten components with live previews (the heading, the button, the card, the Signal's score, parts and board row, Sig's read, the ring, the glyphs, the icons), the logo and marks, and examples of the marketing. The two older systems are left for the owner to delete.

**Numbers in the pack are examples,** from the saved Signal the tests use. The live Signal is at its first level (forum data), so a piece that shows a compound's Signal says "What people report. Not medical advice.", never "what members report".

**Left for the owner:** the front page tells how it works twice (the three steps, then the six-card scroll story). A simpler scroll story, one picture built in three stops, was drawn as a storyboard for the owner to decide.

## 2026-11-20 · The community app, cleaned

The same day, so that the two apps match: the community app had not had the clean pass the website had on November 18. The website's own scan, run on every screen of the app, found 343 different things: 317 words in the code face, 23 chains of bits on dots and 3 lines of code costume. Now it finds none, at a laptop's and a phone's width, and the app's end-to-end run fails a change that brings one back (`tests/e2e/clean.mjs` in its repository).

- **Words left the code face:** kickers, labels, tabs, captions, the feed's line of who and where, Sig's read, the board's column heads, the foot. A kicker is one short phrase in the text face, with no rule before it and no capitals. Numbers stay in the code face.
- **Costume, deleted:** the command line under the feed's heading, the "tail" line over the latest moves, "— top" after the board's heading, the notes beside the places in the side panel ("live", "12 agents", "this device"), the marks in the heroes' corners, and the padded numbers (01 became 1).
- **Chains became sentences.** Sig's read under a report was "better · 3 months · nausea · fatigue · author confirmed"; it reads "Confirmed by the author. Better, 3 months in. Side effects: nausea, fatigue." A post's line is "Report in s/Tirzepatide by u/glp_journal", then when. A Signal reads "Mostly positive, high confidence", as on the website.
- **One set of names for the Signal's four parts.** The board called them what happened, agreement, voices and volume; they are how well it worked, how much people agree, how many people and how many reports, as on the website.
- **The tape stays** (the brand book's motion rules name it), without its "SIG" block and its "safety on": it says "The Signal, live" and runs the names and numbers.
- **The tab's icon is Sig's ring,** as the brand book says of a browser tab, and the icons are drawn at 1.6.

**Left alone, on purpose:** the labels inside the drawings (the flow of forums to members, the takeover line); "s/" and "u/" before a space's and a member's name, which are the app's own way of naming them; and how much the Signal page shows at once, which is a question of what to keep, not of how it is set.

## 2026-11-20 · Sig, redrawn in the steps' hand

The owner looked at the brand pack's icon sheet, where Sig's eight moods (thick blue rings with a filled mark) sat beside the three step drawings (fine lines in a white ring, one thing in blue), and asked for the moods in the steps' design.

- **One hand.** Sig in the community is now a fine white ring on the steps' 200 grid, the mood inside it in Signal blue, and round the mood its echoes fading at half and a fifth, in lines that stay 1.2px at any size. Nothing is filled. This replaces "the blue ring and dot" of the entries above; the ring (the eleven arcs) is still the mark, and Sig in the community is still a character, never the logo.
- **Each mood echoes its own shape,** as each step has its own construction: rings round the dot at rest, lines of a report round the three dots while it thinks, the spark filling out toward the ring, hearts in hearts, an eye in an eye, a sign in a sign. Curious and resting keep Sig's rings round a question mark and a moon.
- **Resting is a moon,** where it was a bar: the bar read as "nothing" once it was a hairline, and Sig rests at night. **Concerned is a warning sign,** in amber, the one colour Sig borrows.
- **Small sizes draw less.** Stickers and notifications are 18 to 34px: under 36px it is the ring and the mood alone, drawn larger; from 36px one echo; from 56px the whole drawing. The ring is drawn a little smaller under 36px so its line is never cut by its own box.
- **It moves as before,** with one change: the cheer swells the drawing inside the ring, not the ring, which now runs to the edge. The dimming while it rests is gone; the moon says it.
- **In the community** the Sig button stands on a black disc, since hairlines over a scrolling feed need a ground, and it is drawn at the size it is shown (48px on a phone), so it gets that size's detail.
- **In the pack** the eight files have lines that are part of the drawing (1.6 on the 200 grid), as the steps' files do, and the icon sheet shows the steps and the moods in one row at one size.

**Found on the way:** the community's How it works page and the card under a Signal still called the Signal's four parts what happened, agreement, voices and volume, after the board took the website's names. They take them too. And the pack's read-me said the logo may sit on the violet band, which the book forbids; it says black only now.

**The kit changed** (`kit/kit.js`, `kit/kit.css`), so the website's change goes live first and the community's after it: the community's check compares its kit with the website's.

## 2026-11-20 · The front page: the agents as Sig's ring, the board off the page, the example in three plates

The owner sent three screenshots of the front page on a 2560px screen: the boxed picture of Sig's twelve agents ("make this circular similar to the sig logo: and clean"), the Community Signal's board ("also remove this part") and the real example's table ("make this look better"). Pictures and measurements are in `design/audits/2026-11-20/front-page-ring/`.

- **The agents are the ring.** The picture of Sig's twelve agents is Sig's own mark, drawn large: the logo's eleven pieces in the logo's order and colours (`lib/ring.js`), each carrying its glyph, its name beside it, and the Interpretation agent as the white dot in the middle. The middle says what an agent does when it is pointed at or picked, and what the middle one does at rest. The four steps of an answer stand beside the ring as four plain lines; pointing at one lights the pieces that take part. This replaces the four boxed steps with an agent in every box and the pulse that ran down them. On a phone the names are a list under the ring, each one a button, since names round a 340px ring would be too small to read or press.
- **The names' places are rules, not `style=""`.** The site's policy (`style-src 'self'`) drops inline styles on the live site, so each name's place round the ring is written in `home.css`, and `tests/front.test.mjs` holds those rules to the middles of the pieces.
- **The board leaves the front page.** The page already opens on the live Signal and the spectrum of all 51; a list of eight under it said the same thing a second time. The ranked board stays in the community. "The Signal" in the top bar, the side panel and the foot (`/#signal`) now lands on the live Signal at the top of the page, so no link on any page changed; Ask Sig's "How the Signal works" goes to How it works (`/#how`), which is what it promises.
- **The example is three plates,** where it was one table stretched across the window with its point in small type at the foot. A plate is one of the three things a fact sheet lays out, in the fact sheets' order, and opens with its bottom line and the sentence it comes to: "Limited evidence" on the meter and "The proof is mostly in animals."; the Community Signal on its bar and "Lots of people say it helped."; the lowest to the highest placebo figure and "Many of these problems get better on their own." Under that come the same three uses in the same order, on rows the plates share from 1160px, so a use still reads straight across.
- **What it says did not change.** Every finding is the fact sheet's sentence, whole, with its FDA link; every placebo figure and sentence is the placebo file's. Two things are new, and both are the Library's own: the fact sheet's grade for the compound (the "Studies: limited" the top of the page already shows for it) and the range, which is only the lowest and the highest of the figures beside it and is worked out again whenever they change. Two things went: "No member ratings yet", said three times, which the plate's level ("Forum data") says once; and the Signal's caption, which the card at the top of the page carries.
- **Between 700 and 1159px** each plate keeps its bottom line on the left and its uses on the right; narrower than that, everything stacks. A browser without subgrid keeps the three columns, each on its own rows.

**Found on the way:** two sizes in the ring's first draft (17px and 19px) were off the type scale and are 17.5px and 20px; the old Signal figure's tracked mono went with the table, so the design baseline is one lower.

## 2026-11-21 · Ask Sig: only the blood markers beside the chat

The owner: "On the Ask sig page, make sure only the markers are shown on the right tab". The panel beside the chat had three tabs since November 13: the blood markers, Sig's mind (every Signal as dots) and the screen (the compounds laid out like code). It now shows the blood markers and nothing else, so it has no tabs. Pictures and measurements are in `design/audits/2026-11-21/ask-sig-markers/`.

- **The reading taken.** "The right tab" is the panel on the right, and "only the markers" means the other two views go, not that they hide behind a tab. The screen was the one place the code face and code costume were still allowed (the owner's choice earlier in November); that exception leaves `design/BRAND.md` and `scripts/check_clean.mjs` with it. If the owner meant something narrower, this is one pull request to take back.
- **The navigation panel is untouched,** and `tests/sig.test.mjs` now holds it to every link.
- **What the screen carried moves into the conversation.** Someone's own stack is laid out in full where it is asked about: each compound, what the Synergy auditor found, and the button to keep it on this device. That was already how the chat answered whenever the screen failed to load; it is now the only way. The evidence ladder and the place-by-place lines are drawn nowhere on Ask Sig; the fact sheets keep the body map.
- **The rack follows the conversation.** It shows an answer's compounds as soon as the agents name them, while Sig is still writing, where it used to wait for the end. Until then the last answer's tubes rest dimmed, so they can't be taken for the new question's. An answer that names no compound empties it. Its first line says how many tests are checked when none moves, where it said "0 blood tests move".
- **On a phone and a tablet** the bar over the box says what the rack's first line says ("Blood markers", "12 blood tests move", "See them") in the body face, where it was a shell prompt with chips. The sheet it opens is 640px wide at most and stands in the middle of a wider window: the rack is drawn for a narrow column, and at a tablet's width its tubes stood about 250px apart. The sheet stands on the window's own ground under the brand's scrim; its green-tinted black and its shadow went with the screen.
- **Closing the sheet gives the page back as it found it.** It used to wake everything behind it, the closed side panel on a phone included, which a keyboard could then walk into unseen.

**Found on the way: the page could jump.** On the live site, after a few questions, a click in the box to write in dragged the whole app up by about 390px and left half the window black. A label kept for screen readers is placed out of the flow; nothing inside the conversation's pane held it, so at the end of a long chat it hung below the window, the page grew taller than the window, and the next focus scrolled it. The pane now holds what is placed inside it (`.sigapp .tm .ai-scroll{position:relative}`). No check opened Ask Sig with an answer on it, which is how this stayed live.

**The check.** `scripts/check_sig.mjs` does, on every pull request, with the layout, focus and clean checks: Sig answers from a canned stream that arrives in pieces, at 1440, 1024 and 390px. It fails when anything but the blood markers stands beside the chat, when the rack doesn't keep up, when the page moves or grows under a long answer, or when the sheet isn't a proper dialog. It serves the stream from the site's own address so the page keeps its security policy, and it looks at the page from outside, because that policy lets nothing be evaluated from a string.

**Lighter.** The page's own scripts go from 285 KB to 201 KB and its stylesheets from 132 KB to 110 KB. The design baseline drops with the screen's stylesheet: colours off the palette 144 to 114, sizes off the scale 21 to 17, gradients 26 to 23, shadows 22 to 17.

**Left as they are:** Sig's server still sends the evidence ladder, and its Markers agent is still told that "the screen lists every marker" (the rack does); `lib/dom.js` still names `ai/screen.js` in a comment, since every page's scripts carry that file's version and one corrected comment would restamp 345 pages.

## 2026-11-21 · Miracle Health is now Unhyped

The owner: "I think we need to change our name". He took **Unhyped**, at theunhyped.com (unhyped.com is taken). The headline already said "Peptides, without the sales pitch", and "Miracle" was the one pitch left; it is also the word the FTC uses for health scams ("Miracle Health Claims", at ftc.gov/miraclehealth). Pictures in `design/audits/2026-11-21/rename-unhyped/`.

- **The logo is drawn from the site's own face,** not traced from a picture: "unhyped", lower case, Mona Sans at 900 and 125% wide, a little tight, kerned and slanted 10 degrees, the old script logo's energy without its second line or its ®. `design/pack/wordmark.py` draws every copy of it (the pages', the brand pack's, an ink one for light grounds, and the foot's big word) from one outline. Option A of four; the other three are in the audit folder.
- **Sizes:** 20px tall in the top bar, the side panel and Ask Sig's side, 26px in a foot (the one-line word is wider than the old two-line logo, so it is set shorter to weigh the same). Share images draw it at 0.55 of the room the old logo took, for the same footprint.
- **The names that came from the old one:** "My Miracle" is **My stack** (the audience's own word for what they take, and what the page holds; the shared kit's name for the place, so the community app follows); the "Miracle Plan" is a plain **plan**. "No miracles. Just what happened." stays, since it says the new name's promise.
- **Said once where it matters:** About, the privacy notice and the terms say that Unhyped was called Miracle Health until November 2026. Sig is told the same, to say if asked.
- **What waits for the domain:** links, canonical addresses, the share images' address line, `CNAME` and the contact address stay on miraclehealth.us until theunhyped.com points here; then one change moves them. Storage keys (`mh-…`) keep their names so nobody loses a saved chat, stack or plan.
- **The kit changed in the community repository first** (`shared/kit`: the place's name, the bar's label) and was copied here with its `sync_kit.sh`; its check compares with this site's main, so this site merges first, then the community app.

## 2026-11-22 · How it works gets a page of its own

The owner: "remove the scroling animation under the purple banner and make the how it works page a seperate page with the animation and FAQs".

- **The front page keeps the violet band, as the way in.** Its kicker, headline and line stay where they were, with one white button under them, "See how it works", to /how-it-works/. The six-step animation and its finale left the front page, and so did its script (`home.js` no longer starts `lib/how.js`, and the page no longer preloads it). The section keeps `id="how"`, so every link to /#how still lands on the band. With no spine beside it, the band's words on a phone and a tablet keep the page's left edge, the same as the sections under it.
- **/how-it-works/ is the animation, unchanged, then questions.** The violet band is the page's top, right under the bar, with its headline as the page's h1; then the six cards, the finale and ten questions about the Signal: what counts as a report, why a Signal starts from public forums, what Sig does with a report, the check-ins, the score's four parts, how reports are weighted, why nobody can push a number up, why a high Signal isn't proof, how often it changes and whether it's medical advice. Every answer comes from How the numbers are made (/method/), which the questions link to. The front page keeps its own questions ("Straight answers"), which are about the site rather than the number.
- **It's hand-written, like the front page it came from,** and the library build stamps its window, its script's version and its share image (`img/og/how.jpg`). It uses `home.css`, where the cards and the questions are already drawn, rather than a copy of those rules.
- **Every "How it works" link goes to the page:** the top bar (where it's underlined on the page), the side panel's More, the footer, ⌘K, Ask Sig's "How the Signal works" and the front page's "How the score is made".

## 2026-11-22 · How it works, after the owner saw it

Three asks, after the page above went up.

- **The finale stays on the front page, under the band.** The owner: "keep this part on the main page aswell under the purple banner". The Signal written in what people report, "Every report makes it sharper" and its two buttons sit under the band again, with its white button, "See how it works". `lib/how.js` runs it there with no cards, spine or marker, skipping what isn't there. On a phone and a tablet the band's words, the ring and the finale's words keep the page's left edge, with the score at the ring's centre as on the page. This replaces "the six-step animation and its finale left the front page" above; the six cards and the spine stay on /how-it-works/ only.
- **"The Community Signal, live" is gone from the top of the front page.** The owner: "remove this". The line over the headline went, with its pulsing dot; the headline now opens the page.
- **Three steps opens /how-it-works/ too.** The owner: "put this also on the how it works page". The library build copies the front page's section, the three cards and the three ways in, onto the page between `part:steps` markers, so the two never differ, and copies the finale the same way (`part:finale`). On the page, Three steps' headline is the h1 and the band's is an h2, and its links go to the front page's Signal and to Sig's page. Then come the band, the six cards, the finale and the questions, as before. This replaces "the violet band is the page's top" above. With the band no longer at the top, the spine's square waits under the band until the page places it, so its edge doesn't show over the band.

## 2026-11-22 · One list of questions, on How it works

The owner, of the front page's "Straight answers": "REMOVE THIS from the landing page we dont need it 2 times".

- **The front page's questions moved to /how-it-works/,** after the Signal's, so the site has one list of questions. "Is this medical advice?" was in both with the same answer and is kept once. The other six follow the Signal's nine: where the numbers come from, Sig's twelve agents, doses, selling, what happens to what you share, and whether it's free. The list's headline is "Straight answers." now, since it answers both. This replaces "the front page keeps its own questions" in "How it works gets a page of its own".
- **The front page ends with "What we won't do",** then the footer. Nothing linked to /#faq.

## 2026-11-22 · The brand after its name: an icon, one line, a format

The owner asked "How can we make the unhyped branding better?" and was shown four ideas, one picture each (`design/audits/2026-11-22/brand/`). The answer: "I like it, now lets expand on it and make things cool and well branded". Three of the four are built here; the fourth was offered as a matter of taste and is left for the owner to ask for.

- **Unhyped has an icon of its own: the logo's u,** white on electric blue. Until now the browser tab and the pack's app icon were Sig's ring, which is Sig's face, not Unhyped's, and turns to dots at 16 pixels. `design/pack/wordmark.py` draws the icon from the logo's own outline (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, the pack's `icon.svg` and its black and white forms); every page links it, and a phone's home screen has one for the first time. `design/favicon/make_favicon.py`, which drew the ring as the tab's icon, is gone. The ring stays wherever it is Sig's: Ask Sig's button, page and app icon, the spinner, the community's welcome. Blue, not black: on black the icon is lost in a dark tab bar, and electric blue is already the one colour a page acts in. The book's "never set the logo on a colour" still holds for the word; the icon is a separate drawing with its own rule.
- **One line: "No miracles. Just what happened."** It was on two pages. The card every page falls back to (`og.jpg`) led with "Peptides, without the sales pitch." instead; it now leads with the line, and that sentence is the kicker over it, as it is the words under the logo in a foot. The book says which is the line and which says what Unhyped is.
- **One format: "<Name>, unhyped."** Every fact sheet shared the general card. Each of the 122 now has its own (`img/og/library-<id>.jpg`): its name in the format, its kind, its evidence on the meter and its print. A fact sheet's title says it too ("BPC-157, unhyped: evidence, risks, blood tests"); a name too long for that keeps its brackets before it keeps the brand's word, since the brackets are names people look up. The twelve goals' cards say it the same way ("Sleep, unhyped."), with the short names their page's row of goals already uses. A page's own h1 doesn't change: a fact sheet's is the compound's name.
- **No Community Signal on a share card.** The idea shown to the owner had the score beside the name. It isn't built that way: the score is checked every minute and a picture saved in the site would show an old number under a brand whose promise is the honest one. The print stands there instead, which changes only when the sheet does. The format with its score is a post, made the day it goes out: the pack's `post-unhyped.png` and `story-unhyped.png`.
- **Left as it is: the gradient and the glow.** Idea four was one flat blue for the punchline and no glow on the main action ("the name says no hype"). It changes how the whole site looks, it was offered as taste, and the owner's answer asked for "cool"; it waits for a plain yes.
- **The pack** has the icon (as SVG, as app icons, in black and white), the fact sheet's card, the post and the story in the format, the words (the line, what Unhyped is, the format, a bio at three lengths), and a guide whose first page shows the icon where the ring was.


## 2026-11-23 · One brand on every part: the identity carried through both apps

The owner: "Go over every component of the website and add that unhyped brand identity to it. So it feels all one". The design department audited every page and every shared part of both apps (six reports, 162 findings, kept in `design/audits/2026-11-23/`). What was built, and the calls made:

- **The punchline is one rule, in the kit.** `.punch` (the second sentence in the Signal's light) moved from `home.css` into `kit/kit.css`, so both apps draw it from one place. Every two-sentence headline takes it: the line on the front page and on About (it was flat white there), the story's "Every answer, checked.", Ask Sig's "Get the studies and the people, kept apart.", the Library's "What people report.", the story's "One app." and the community's "Say how it went.". The design baseline moves one gradient from `home.css` to `kit/kit.css`; the total is unchanged.
- **Every page signs off with the line.** The foot's last row is "No miracles. Just what happened." as a small headline with its punchline, beside the copyright, on the website, in the community and at the end of both emails. It replaces "No ads, no sellers, no doses.", which restated the house rules in a corner (the clean lead's CL-01). The community's foot became the website's: the logo at 26px with "Peptides, without the sales pitch." and the disclaimer under it.
- **The weekly band's head is a headline** ("The Signal, weekly." in the headline face), like every other statement band, and it no longer says "once a week" three times.
- **The violet band's action is black on every band.** The How band's white button was the second white in the front page's view (with Join). This corrects 2026-11-22's "one white button": one button, black, as on every violet band.
- **Loading is Sig, in both apps.** The kit has one loader (`waitHtml`): Sig's ring with its pieces lit one by one round the ring, beside one plain line saying what's loading ("Loading the live Signal", "Loading the posts"). It replaces the community's grey skeleton boxes and bare "Loading…" lines, the body map's pulsing bars, and sits beside the front page's and the fact sheets' loading lines. On Ask Sig the ring no longer turns while the agents work: its pieces light in turn, and the small turning border spinners became calm pulses in the agent's colour.
- **The Signal's number has one style by size.** A Signal standing on its own at 40px and up is set as the front page and the brand pack set it: Mona Sans 650 at 125%, −0.025em, tabular figures (the fact sheets' 68px number was bold-drawn mono). Under 40px every Signal is Monaspace Neon. The book's "Numbers: Monaspace Neon" gains that one exception.
- **The Signal's drawings write words in the body face** (the flow, the takeover line, the uses rose): sentence case, untracked, numbers still in the code face. On November 20 the community left the drawings' labels alone; the owner's rule of November 18 (Monaspace for numbers and keys only) and this ask point the other way, and these are data charts, not illustrations. How it works' pictures, the prints and the body map keep their labels, as the book says.
- **Ask Sig talks like the site, not a terminal:** no "// " labels, no padded step numbers, no dot chains in its head, agents' names as the book writes them, sentence case everywhere. The clean lead asked to drop "Checked by the Safety agent" from the foot of a clean answer; it stays, in sentence case and the Safety agent's coral, because it is the proof of the story's "Every answer, checked." An agent's colour signs only that agent's work: the Safety agent's edits are coral (they were the Recommender's yellow) and a compound's name in the blood markers is white (it was in two agents' colours). Its Send carries the main action's light and glow, and on a phone or tablet its bar shows the Unhyped logo, which was nowhere on screen.
- **Ask Sig's app icon** is redrawn on black, with the community's piece in Signal blue (it was graphite and the old lime).
- **Kickers carry no dots and don't count:** "Peptide, metabolic & weight", "The Library", "Member since Oct 2026", "Updated Oct 21, 2026". Corner notes beside headings became a line under them.
- **One live dot per view,** the ticker's in the community and the Signal card's on the front page; the ticker lost its diamonds.
- **The community is the same product:** one electric-blue action per view ("Claim +20" is a hairline, the phone's Share steps back on the new-post screen, Join loses the main action's glow), the Signal's scale in Signal blue (it ran red to amber to blue), better/same/worse in the palette's blue, amber and coral, the graphite theme's whites and greys replaced, open page heads like the website's, members' own titles and handles in their own case, nothing a reader needs under 13px, and the search kept on tablets (a field) and phones (an icon that opens it).
- **Page heads open at one height:** the kicker 72px under the bar (44px on a phone) and the h1 16px under it, on the Library, the fact sheets and How it works as on every doc page. My stack, the plan and the story start at the site's left edge and run its width.

Left for the owner, with the reason:
- **Share-card kickers in grey** (BC-14): the cards' kickers are Signal blue, where pages keep kickers grey. Changing it redraws 160 share images the owner approved today (#69).
- **The community's letter tiles** (CL-07 asks to delete them, BC-12 to recolour them): two different answers to a visible part of every community screen.
- **Repeated counts in content** (CL-05, CL-15, CL-19): what a fact sheet, the community's Signal page and a space say more than once is copy.
- **The community rules' examples quote amounts** ("250 mcg a day"): copy, and the rules are the moderators'.

## 2026-11-23 · The community's ground is cosy

The owner: "can the community page background be a cosy texture?" Grain, felt, linen and Alcantara were tried on the community, and the owner chose the suede the Noise card is made of (2026-11-19). The community's window, its docked side panel and its foot lie on it: `img/suede.svg` (copied into the community as `web/img/suede.svg` and made smoother at the owner's pick: a 0.5px blur and a gentler grain) laid on in soft light over `suede` (#28282D), lit softly from the top left, as the card is. Cards and panels keep their solid dark grounds and stand on it. On the suede the book's `muted` (#7F8796) falls to about 4:1, so the community's quiet grey is #969CA9, which keeps 4.5:1. The website keeps its black ground and grid: the suede is the community's own warmth, the place where members talk.

