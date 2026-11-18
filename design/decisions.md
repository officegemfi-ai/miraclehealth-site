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
