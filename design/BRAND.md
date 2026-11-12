# Miracle Health: the brand book

The rules every page keeps to. The tokens are in `tokens.json` beside this file; the illustration system is in `illustration.md`. The same book, with live previews of every component, is the "Miracle Health" design system on Claude.

Miracle Health is an independent, free place for adults 18+ to look up what they take, ask about it and say how it went. It has four places: the Library, Ask Sig, the Community and My Miracle. All four are one app, and every page opens as a window in Sig's terminal. Behind every answer are twelve agents, each with one job, each signing what it made. Nothing is for sale, nobody is told what to take, and no amount is ever given.

Build every page from this system: the window and its parts (`components/`), the tokens (`tokens.json`), the twelve agents' glyphs, Sig's ring and the compound prints (`assets/`). The illustration rules are in *The illustration system*; the launch rules are in *The launch campaign*.

The look is the **Sig system**, page 9 ("9 Sig system") of the Miracle Health design canvas: graphite pages, signed in Sig's colours. When this book and that page disagree, the page wins and this book is corrected. *The Sig system*, below, says what it asks of every page.

## Principles

1. **Every answer, checked.** The design shows the checking: the run log of each agent's step, the Safety agent first and last, the read strip under a report, "safety on" in every status bar.
2. **Measured, not sold.** Every number comes with its source and how sure anyone can be ("checked oct 28, 2026 against 10 sources", "strong evidence"). It is set in mono. Never show a price, a seller, a brand, a lab or an amount.
3. **Colour is a signature.** Pages are graphite and near-white. Colour shows who is speaking or what is being measured: `lime` for the community and its Signal, `evidence` for the evidence, and each agent's own `agent-*` hue for that agent. Never use colour as decoration.
4. **One window, everywhere.** The same side panel, title bar, path and status bar on every page and every surface. The side panel is never removed: it folds away or slides in.
5. **Everything is a file.** Things are named the way a terminal names them: a fact sheet is `semaglutide.md`, the feed is `home.feed`, the Signal is `signal.top`, a run is a log. People should be able to read the system, not just look at it.

## Voice

Plain, calm and exact, like a careful friend who has read the studies. Short sentences. Talk to "you" and say what happens. Write "we" rarely and never in place of the agents: Sig and its agents speak for themselves. Use sentence case everywhere. Kickers are comments in the code: `// the community signal`, lowercase mono (`kicker`). Labels, a table's column heads and the status bar are mono lowercase (`label`, `status`).

**Real copy to learn from:**
- "One app. Twelve agents. Every answer, checked."
- "Took something? Say how it went."
- "Your report moves the number for the next person, even if it did nothing."
- "No trial has tested the two together for fat loss."
- "1 pair checked · no known clashes (absence of data, not a green light)"
- "Plausible, unproven."
- "Experiences, not medical advice. In a crisis, call or text 988 (US)."
- "Talk to your doctor before you start, stop or change anything."
- Status bar: "safety on" · "no doses · no sellers · no diagnosis"

**Always:**
- Name compounds by their generic names: semaglutide, BPC-157.
- Give a Signal to one decimal with its move (89.3 ▲0.3).
- State what is missing as plainly as what was found.
- End any answer that names something to add with the check with the prescriber.

**Never:**
- Doses or amounts, for anything.
- Sellers, brands, labs, shops, prices or affiliate links.
- A diagnosis, or reading someone's own lab results.
- Urgency, superlatives about a compound, promises of results or before-and-after.
- Emoji or exclamation marks.

## Colour

- **Grounds:**
  - `surface` is the ground of every page and window.
  - `page` fills the gap round the window and the status bar.
  - `side` is the side panel, a window's foot and terminal blocks.
  - `bar` is the title bar and anything that floats (search results, menus).
  - `surface-raised` is cards, plates, fields and the read strip.
- **Words:** `text` for words and headlines, `text-2` for ledes and secondary lines, `muted` for labels, meta and the path. Each reads at 5:1 or better on every ground.
- **One main action per view:** the white button, `accent` with `on-accent` words. Every other button is a hairline: `line-2` border, `text` words.
- **Signatures:**
  - `lime` only for the community and its Signal: the live dot, scores, moves up, points, the community's place mark and tab.
  - `evidence` only for evidence: grades, the evidence meter, a print's rungs, the Library's mark.
  - `safety` only for the Safety agent and "safety on".
  - `agent-*` only where that agent is named, speaks or made something.
  - Never fill a button with a signature colour.
- **Moves:** `lime` ▲ up, `down` ▼ down. The arrow always carries the direction too.
- **Hairlines:** `line` frames windows and cards; `line-2` borders controls. Neither carries meaning alone.
- **No** gradients except the Signal's scale bar, no glows and no blue-purple washes. One set of colours, Graphite, whatever a device is set to.

## Type

- **Words: Mona Sans.**
  - `body` on the site, `body-app` in the community, `lede` under a headline.
  - `h3` for card and post titles, `nav` for side panel rows, `button` for buttons.
- **Headlines: Mona Sans,** at its normal width and semibold (600), tracked tight (-0.02 to -0.03em). No wide or heavy cut.
  - `hero` (64px) for the one headline of Home and the story page, `section` (42px) for section heads, `page` (38px) for a page's h1, `h2` (22px) inside a page.
  - A page's h1 ends in a full stop: "Your feed.", "The Signal."
- **Anything measured or labelled: Monaspace Neon.**
  - `kicker` (`// a comment`, lowercase, 13px, no capitals and no rule) and `label` (lowercase, 12px).
  - `data` for tables and numbers, with tabular figures.
  - `log` for paths, read strips, run logs and prompts; `status` for the status bar and tabs.
- **Fonts:** both are open fonts (SIL OFL, in `licenses/`), served from `fonts/`. Never substitute Inter, Roboto or a system serif.

## The window

Build every page as a window:
- **Side panel** (`side-panel` wide, on `side`): the logo, then the four places, each with its mark and meta:
  - Library: the Evidence librarian's ladder, "122 sheets".
  - Ask Sig: Sig's ring, "12 agents".
  - Community: the community's glyph, with a live dot.
  - My Miracle: the Stack builder's glyph, "this device".
  
  Under them comes what is in this window, then the rest and the legal.
- **Title bar** (`title-bar`, on `bar`): Sig's ring at 18px, the window's name, its domain in `muted` mono, the tabs, and what's live on the right.
- **Path line** (`path-line`): `~ / library / peptides / semaglutide.md`.
- **Page,** then the foot (on `side`).
- **Status bar** (`status-bar`, on `page`): the white SIG segment, what's on, and the rules.

**On a desktop:** the window sits `window-gap` in from the screen, with `radius-window` corners. The title bar stays at the top and the status bar at the bottom. The gap above and below them is painted in `page`, so nothing shows through while the page scrolls.

**On a phone:** the window fills the screen and the side panel slides in from the menu button (`shadow-drawer`). Escape or a tap outside closes it.

## Shape and depth

- **Corners:** `radius-tag` (7px) for tags and chips, `radius-tab` (8px) for a tab's top corners, `radius-row` (9px) for rows, `radius-control` (10px) for buttons, fields and terminal blocks, `radius-card` (12px) for cards, tables and the window, `radius-pane` (14px) for the front page's big panes. No pills.
- **Panes:** a pane is a framed block with a bar naming its file (`signal.top`, `house-rules.md`, `~/chats/…`), mono in the bar, the content under it.
- **Shadows:** nothing casts one except what floats (`shadow-float`) and the phone drawer (`shadow-drawer`). Depth comes from the four grounds, not from shadows.

## Motion

- **What moves:**
  - The live dot pulses, fading on opacity only.
  - While something loads, Sig's ring is the spinner: its pieces light one by one, with three lines saying what's happening. No grey skeleton boxes.
  - A run plays line by line, each agent lighting its piece of the ring as it reports, the centre last.
  - A row of the Signal that moved flashes once, lime up, coral down.
  - The Signal's tape runs, and pauses on hover.
  - A Signal counts from its last value to its new one.
  - Sig's ring lights each agent's arc as it reports.
  - Drawers slide in 0.22s.
- **When it doesn't:** nothing loops for decoration, and when a device asks for reduced motion, everything stops.

## States and focus

- **Focus:** every focusable thing gets a solid 2px `text` ring, 2–3px out. It contrasts at 15:1 or more on every ground.
- **Hover:** hairlines brighten to `text`, and rows take the `hover` ground.
- **Current:** the current place, row or tab takes the `hover` ground (or an 8% `text` fill) and `aria-current`.
- **Disabled:** controls drop to half opacity and keep their words.
- **Empty:** an empty state says what will appear and how to make it appear: "None yet. Every first-hand report moves a Signal up the line."

## Iconography

- **The twelve's glyphs** (`assets/Glyphs/`, the AgentGlyph component): a 24-unit grid, one 1.6 stroke, round caps and joins, no fills, each in its agent's colour. Each one means its agent and nothing else.
- **Sig's ring** (`assets/Marks/`, the Ring component) is Ask Sig and every title bar.
- **Sig in the community** is the lime ring and dot (`assets/Logos/sig-mark.svg`), also the favicon. It is the community's own character, with moods. Don't confuse it with the ring.
- **Compound prints** (`assets/Prints/`, the CompoundPrint component): one mark per fact sheet, drawn from its data. Never use a print that isn't that compound's own.
- **Interface icons:** the community's stroke set, 1.8 stroke on a 24 grid, round caps, drawn at 16–20px in `currentColor`: home, flame, pulse, compass, layers, comment, vote arrows, check.
- **No emoji, ever.**

## Logo

`assets/Logos/logo.webp` is the Miracle Health wordmark in near-white, for graphite grounds only:
- Set it 22px tall in the side panel and 24px in a foot. Don't set it smaller than 20px.
- Never recolour, outline, stretch or rotate it, and never set it on a photo or a colour.
- In the community it sits beside a "COMMUNITY" tag (mono capitals in a `line-2` frame).

## The Sig system

Page 9 of the design canvas, as built. Every page is graphite; colour shows up only when one of Sig's agents signs something it made. What people write stays white.

**Who signs what.** Each agent has one colour (`agent-*`) and signs only its own work: the Safety agent's notes in coral, the Planner in orange, the Recommender in yellow, the community and its Signal in lime, the Combination agent in green, the Markers agent's blood tests in teal, the Synergy auditor in cyan, the Evidence librarian's grades and sources in blue, the Relatives agent in indigo, the Mechanism agent in purple, the Stack builder in pink, and the Interpretation agent, at the ring's centre, in white.

**The four ways a signature shows:**
1. **The pip:** a 7px dot in the signer's colour, on anything an agent made: "● Limited evidence", "● Signal 91.9", "● 4 safety notes".
2. **The log line:** step · agent · ✓ · what it did, the agent's name in its colour (`log`).
3. **The gutter:** a 2px mark in the signer's colour beside what it wrote, with its name on the right of the heading ("The bottom line · evidence librarian"). Never a box round it.
4. **The ring:** Sig's face everywhere: the title bar, Ask Sig, the loading spinner. Each agent's piece lights as it reports; the centre lights last.

**Everywhere:**
- **⌘K** (Ctrl+K), from any page: open a fact sheet, ask Sig, trace a compound in the body, compare it, go to its space in the community, or any page (`lib/cmdk.js`). The status bar ends in ⌘K.
- **The status bar** says what you're looking at and how fresh it is ("library · 122 sheets · updated nov 7"; on a fact sheet its kind, evidence and sources), then "no doses · no sellers · no diagnosis", then ⌘K. SIG and "safety on" lead it on every page.
- **Loading:** the ring is the spinner and three lines say what's happening ("loading the library · reading the signal · waking sig's agents").
- **The 404** is a shell: "command not found: /library/bpc-175", then "did you mean bpc157.md?"

**The front page is a prompt:** "› look up" with live results (file name, name, the evidence pip, the Signal pip), the Library's graph tracing what's typed or pointed at, the strip of numbers, then the Community Signal running like `top` (`signal.top`: totals, where the numbers come from, the board, `tail -f signal.log`), then Ask Sig's twelve agents in a run that plays as it comes into view, then the real example, how a report becomes a commit, the house rules as a file, and the questions.
