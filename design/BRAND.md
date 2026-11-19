# Miracle Health: the brand book

The rules every page keeps to. The tokens are in `tokens.json` beside this file; the illustration system is in `illustration.md`. The same book, with live previews of every component, is the "Miracle Health" design system on Claude.

Miracle Health is an independent, free place for adults 18+ to look up what they take, ask about it and say how it went. It has four places: the Library, Ask Sig, the Community and My Miracle. All four are one app. Behind every answer are twelve agents, each with one job, each signing what it made. Nothing is for sale, nobody is told what to take, and no amount is ever given.

Build every page from this system: the window and its parts (`components/`), the tokens (`tokens.json`), the twelve agents' glyphs, Sig's ring and the compound prints (`assets/`). The illustration rules are in *The illustration system*; the launch rules are in *The launch campaign*.

The look is **black and electric blue**, pages 15 to 18 of the Miracle Health design canvas ("15 Black and electric blue", "16 Website, every page", "17 Community, every screen", "18 The system, animated"): black pages under a faint grid, wide capital headlines, one electric blue main action, signed in Sig's colours. It keeps the Sig system's window (page 9). When this book and those pages disagree, the pages win and this book is corrected. *The Sig system*, below, says what it asks of every page.

## Principles

1. **Every answer, checked.** The design shows the checking: each agent's step in plain words, the Safety agent first and last, Sig's read under a report.
2. **Measured, not sold.** Every number comes with its source and how sure anyone can be ("Checked Oct 28, 2026 against 10 sources", "Strong evidence"). The number is set in mono; the words round it are not. Never show a price, a seller, a brand, a lab or an amount.
3. **Colour is a signature.** Pages are black and near-white. Colour shows who is speaking or what is being measured: Signal blue (`lime` in code) for the community and its Signal, mint (`evidence`) for the studies, and each agent's own `agent-*` hue for that agent. Never use colour as decoration.
4. **One frame, everywhere.** The same top bar and side panel on every page. The side panel is never removed: it folds away or slides in.
5. **Clean, not costume.** Nothing is dressed up as code or as a machine talking about itself. Every small thing on a page is something a reader needs, said once, in plain words, at a size they can read (the owner's rule, November 18; *Clean, not costume*, below).

## Clean, not costume

The owner's rule (November 18, 2026), after six screenshots of the site: these small details "look like AI, it's too much and makes it not clean." The `design-clean` agent audits every page against it, and `scripts/check_clean.mjs` fails a change that brings the mechanical kinds back.

**Never:**
- **Code costume:** a file name or extension as a label (`signal.top`, `bpc157.md`), a shell path (`~/sig/agents`), a prompt (`sig@miracle ›`), a command or flag (`git log --reports`), a code comment as a label (`// took it?`), a shell error, a status bar of slogans.
- **Bars on panels** that name them like a window or a file. A panel starts with its content or a real heading.
- **Corner captions and counters:** "one question · four steps · twelve agents", "4 rules · 0 exceptions", "live · nov 18, 20:36", "12 agents online", "step 01 of 06".
- **Dot chains:** three or more short bits on middle dots, in the text or drawn by the stylesheet. Write a sentence. Two bits on one dot are fine.
- **Rows of dots and colour strips** that say nothing a word doesn't.
- **Words in the code face.** Monaspace Neon is for numbers and keyboard keys only.
- **Prefix labels and padded numbers:** "you ask", "you get", "01" where "1" will do.
- **Keys that repeat labels:** the spectrum's four parts are named on the card above it, so it has no legend.
- **Tiny text a reader needs:** 13px and up; under that, only footnote numbers.

**What stays:** numbers in the code face; every navigation panel and menu, with plain names in it; one short kicker per section; honest notes said plainly ("An example, not a real report"); the drawings' own labels (How it works, the prints, the body map); and Ask Sig's screen, the editor the owner chose, which lays compounds out like code.

## Voice

Plain, calm and exact, like a careful friend who has read the studies. Short sentences. Talk to "you" and say what happens. Write "we" rarely and never in place of the agents: Sig and its agents speak for themselves. Use sentence case everywhere. A kicker is one short phrase over a heading, in the body face (`kicker`: "How it works"). Labels and a table's column heads are sentence case in the body face too (`label`).

**Real copy to learn from:**
- "One app. Twelve agents. Every answer, checked."
- "Took something? Say how it went."
- "Your report moves the number for the next person, even if it did nothing."
- "No trial has tested the two together for fat loss."
- "1 pair checked · no known clashes (absence of data, not a green light)"
- "Plausible, unproven."
- "Experiences, not medical advice. In a crisis, call or text 988 (US)."
- "Talk to your doctor before you start, stop or change anything."

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
  - `page` fills the gap round Ask Sig's window.
  - `side` is the side panel and a window's foot.
  - `bar` is the title bar and anything that floats (search results, menus).
  - `surface-raised` is cards, plates, fields and the read strip.
  - The violet band (`violet-deep`, `violet`, `violet-light`): a grainy violet gradient, deepest at the top left, for a few statement bands so the black pages aren't flat: How it works' opening and Join on the front page, and the weekly email at the foot of every page. Words on it are white and sit in its deeper part (4.5:1 and up); its main action is black, since electric blue doesn't hold on violet (decision, November 16).
- **Words:** `text` for words and headlines, `text-2` for ledes and secondary lines, `muted` for labels, meta and the path. Each reads at 5:1 or better on every ground.
- **One main action per view:** the electric blue button, `accent` lit from the top by `accent-hi`, with white `on-accent` words and a soft glow. A white button is the second choice; every other button is a hairline: `line-2` border, `text` words.
- **Signatures:**
  - Signal blue (`lime`) only for the community and its Signal: the live dot, scores, moves up, points, the community's place mark and tab.
  - The Signal's four parts, in its bars, its light and the spectrum: how well it worked in Signal blue, how much people agree in `violet-light`, how many people in `violet`, how many reports in `accent-hi` (decision, November 17).
  - Mint (`evidence`) only for the studies: grades, the evidence meter, a print's rungs, the Library's mark.
  - `safety` only for the Safety agent and "safety on".
  - `agent-*` only where that agent is named, speaks or made something.
  - Never fill a button with a signature colour.
- **Moves:** Signal blue ▲ up, `down` ▼ down. The arrow always carries the direction too.
- **Hairlines:** `line` frames windows and cards; `line-2` borders controls. Neither carries meaning alone.
- **Gradients and glows** only for the Signal's scale bar, the main action (electric blue, lit from the top, with its glow), the window's ground (an ultramarine wash at the top over a faint 64px grid), the violet band, the front page's top in light (the Signal's parts as bands of light, and the glow on their bars) and the front page's punchline, whose second sentence runs from Signal blue into `violet` and `violet-light`, line by line (decision, November 18). One set of colours, black and electric blue, whatever a device is set to.

## Type

- **Words: Mona Sans.**
  - `body` on the site, `body-app` in the community, `lede` under a headline.
  - `h3` for card and post titles, `nav` for side panel rows, `button` for buttons.
- **Headlines: Mona Sans,** wide (125%), heavy (800) and in capitals, tracked tight (-0.028em, one value for every headline: `--head-ls`), set at about 0.86 of the old sizes so a line keeps its length. Headings inside an answer or a card stay semibold and in sentence case.
  - `hero` (64px) for the one headline of Home and the story page, `section` (42px) for section heads, `page` (38px) for a page's h1, `h2` (22px) inside a page.
  - A page's h1 ends in a full stop: "Your feed.", "The Signal."
- **Numbers: Monaspace Neon.** `data` for scores, counts, percentages and figures in tables, with tabular figures, and keyboard keys. Words are never set in it (the owner's rule, November 18).
- **Kickers and labels: Mona Sans.** `kicker` (14px, semibold, sentence case, no rule before it, no dots in it) and `label` (13px, semibold).
- **Fonts:** both are open fonts (SIL OFL, in `licenses/`), served from `fonts/`. Never substitute Inter, Roboto or a system serif.

## The frame

Every page opens the same way:
- **Side panel** (`side-panel`, on `side`): it starts closed; the menu button at the left of the top bar slides it in over the page. In it, the logo, then the Signal and the four places, each with its mark and no caption beside it (the owner's rule, November 18):
  - The Signal: its spectrum, four bars in Signal blue.
  - Library: the Evidence librarian's ladder.
  - Ask Sig: Sig's ring.
  - Community: the community's glyph.
  - My Miracle: the Stack builder's glyph.
  
  Under them comes what is on this page, then the rest and the legal.
- **Top bar** (60px, sticky): the menu button, the logo, then the four sections most people go to (The Signal, Library, Community, How it works; the page you're on is underlined where the bar meets the page), and at the right a search box that opens ⌘K (Ctrl K) to go anywhere, Ask Sig with its ring, and Join as a white button. Below 1100px wide the four sections are left to the side panel.
- **Page,** across the window's whole width (up to 2400px, with a margin that grows from 16px to 96px) on the faint grid under the ultramarine wash, then the foot: the weekly email, the logo and the disclaimer beside four columns of links, a last line, and the logo's word drawn big at the very bottom. Text keeps its own line lengths inside it; on a wide screen the front page's top grows with it, and nothing runs long and empty (the owner, November 18: "why is it so stretched?"). Every heading stands above its block at every width (a heading set beside its block only fills the width artificially, the owner said); it's the cards that fit the width: a row's parts stay together (on the board a name, its bar and its score, never a gap; a card's foot keeps its words and its way on side by side); no bar or meter runs long (the owner: "having the lines that long looks ridiculous"): the board's bars and the example's stay 48 to 480px, and a board 1120px wide and up holds its eight in two columns of four; what a card lists flows into more columns as it widens (signal and noise two columns on a card 840px and up, the rules two by two from 1100px and four across from 1880px, the twelve agents' gatherers five to a row from 1880px, an agent alone in its step one frame or one card wide); a card's head sits on its own columns (the example's, from 1280px); and a list or table of short lines keeps a reading width (the questions 1040px, the weekly's issues 780px, the method's table of pairs 740px, its placebo table 1280px). The layout check fails a row whose parts stand more than 560px apart. On the front page's top the faint grid gives way to the Signal in light: bands of violet and blue light drifting behind the whole top as if on an LED wall (5px cells, finer on a sharp screen, the light running in soft gradients across them), one band for each of the Signal's four parts and as bright as its number, brightest round the score and dark behind the words (decision, November 17).

No window box, tabs, path line or status bar: the frame is a plain website's (decision log, November 12).

**Closing the panel:** its own button, Escape, a tap outside it or following one of its links (`shadow-drawer` under it).

**On a phone:** the top bar keeps the search and Ask Sig as icons, and Join.

## Shape and depth

- **Corners:** square. Every card, plate, table, pane, button, field, tag, chip, tab, row, menu, dialog and meter has `radius-none` (0), in both apps and in the drawings' tags (decision, November 13). Only dots and rings are round (`radius-dot`, 50%): pips, live dots, agent dots, avatars and Sig's ring button. No pills.
- **Square, in How it works' language:** How it works' six cards, the Signal's card on the front page, its picture of Sig's twelve agents (one question in four steps, each agent in its own box, signed along the top in its colour), and on Ask Sig the window, its answer cards, its ways to start and its box to write in have no round corners: a 1px frame, the number in its box, the title in mono, dividers with a gap by the tree.
- **Panes:** a pane is a framed block, its content straight under the frame or under a real heading. No bar names it.
- **Shadows:** nothing casts one except what floats (`shadow-float`) and the phone drawer (`shadow-drawer`). Depth comes from the four grounds, not from shadows.
- **Drawn depth:** Sig's ring stands in 3D on Ask Sig (`lib/ring3d.js`): isometric, on a slab over a grid, each agent a wall lit from the front left. The depth is drawn, in the drawing's own shades; nothing on the page casts a shadow for it.

## Motion

- **What moves:**
  - The live dot pulses, fading on opacity only.
  - While something loads, Sig's ring is the spinner: its pieces light one by one, with one plain line saying what's loading. No grey skeleton boxes.
  - A run plays line by line, each agent lighting its piece of the ring as it reports, the centre last.
  - A row of the Signal that moved flashes once, blue up, coral down.
  - The Signal's tape runs, and pauses on hover.
  - A Signal counts from its last value to its new one, and its parts' bars grow to theirs.
  - The Signal in light drifts behind the front page's top (`lib/sigfield.js`), smoothly at the screen's own frame rate, and stops off screen; a pulse goes out through it from the score when another compound is picked, and on a screen with a pointer it gathers a little round it.
  - The same light drifts behind the front page's twelve agents (the owner's request, November 18), in four of the agents' colours (coral, yellow, teal, violet), spread over the whole section and brightest behind the agents; the frame is dark glass over it, and a pulse travels down the four steps, taking each step's colour.
  - Sig's ring lights each agent's arc as it reports.
  - Drawers slide in 0.22s.
- **When it doesn't:** nothing loops for decoration (the Signal's light carries its four numbers), and when a device asks for reduced motion, everything stops: the light stands still.

## States and focus

- **Focus:** every focusable thing gets a solid 2px `text` ring, 2–3px out. It contrasts at 15:1 or more on every ground.
- **Hover:** hairlines brighten to `text`, and rows take the `hover` ground.
- **Current:** the current place, row or tab takes the `hover` ground (or an 8% `text` fill) and `aria-current`.
- **Disabled:** controls drop to half opacity and keep their words.
- **Empty:** an empty state says what will appear and how to make it appear: "None yet. Every first-hand report moves a Signal up the line."

## Iconography

- **The twelve's glyphs** (`assets/Glyphs/`, the AgentGlyph component): a 24-unit grid, one 1.6 stroke, round caps and joins, no fills, each in its agent's colour. Each one means its agent and nothing else.
- **Sig's ring** (`assets/Marks/`, the Ring component) is Ask Sig, every title bar and the browser tab: `favicon.svg`, with `favicon.ico` for browsers that can't show an SVG icon, both drawn by `design/favicon/make_favicon.py` from `lib/ring.js` (the owner's request, November 17). It is also the mark on the community's sign-in page, beside "The Miracle Health community" (`ring()` in the community's `web/ui/art.js`, drawn the same way; the owner's request, November 18).
- **Sig in the community** is the blue ring and dot (`assets/Logos/sig-mark.svg`). It is the community's own character, with moods: notifications, stickers, empty states and the Sig button. Where Sig stands as a logo rather than a character, as on the sign-in page, it is the ring. Don't confuse the two.
- **Compound prints** (`assets/Prints/`, the CompoundPrint component): one mark per fact sheet, drawn from its data. Never use a print that isn't that compound's own.
- **Interface icons:** the community's stroke set, 1.8 stroke on a 24 grid, round caps, drawn at 16–20px in `currentColor`: home, flame, pulse, compass, layers, comment, vote arrows, check.
- **No emoji, ever.**

## Logo

`assets/Logos/logo.webp` is the Miracle Health wordmark in near-white, for graphite grounds only:
- Set it 22px tall in the side panel and 32px in a foot. Don't set it smaller than 20px.
- Never recolour, outline, stretch or rotate it, and never set it on a photo or a colour.
- The one exception is the foot's big word (`img/wordmark.svg`, made by `design/wordmark/make_wordmark.py`): the logo's word alone, traced and drawn as a stack of hairline outlines in violet into blue, dim, lighting up under the pointer, cut off by the page's bottom edge. The owner asked for it (November 17). Use it there only, and never as the logo.
- In the community it sits beside a "COMMUNITY" tag (mono capitals in a `line-2` frame).

## The Sig system

Page 9 of the design canvas, as built. Every page is black; colour shows up only when one of Sig's agents signs something it made. What people write stays white.

**Who signs what.** Each agent has one colour (`agent-*`) and signs only its own work: the Safety agent's notes in coral, the Planner in orange, the Recommender in yellow, the community and its Signal in Signal blue, the Combination agent in green, the Markers agent's blood tests in teal, the Synergy auditor in cyan, the Evidence librarian in its own blue (its grades and sources in mint), the Relatives agent in indigo, the Mechanism agent in purple, the Stack builder in pink, and the Interpretation agent, at the ring's centre, in white.

**The four ways a signature shows:**
1. **The pip:** a 7px dot in the signer's colour, on anything an agent made: "● Limited evidence", "● Signal 91.9", "● 4 safety notes".
2. **The step:** the agent's name in its colour and what it did, in plain words.
3. **The gutter:** a 2px mark in the signer's colour beside what it wrote, with its name on the right of the heading ("Evidence librarian"). Never a box round it.
4. **The ring:** Sig's face: Ask Sig, its tab bar, the loading spinner. Each agent's piece lights as it reports; the centre lights last.

**Everywhere:**
- **⌘K** (Ctrl+K), from any page: open a fact sheet, ask Sig, trace a compound in the body, compare it, go to its space in the community, or any page (`lib/cmdk.js`).
- **Loading:** the ring is the spinner, with one plain line ("Loading the live Signal").
- **The 404** says the page isn't here and offers the closest compound or page ("Did you mean BPC-157?").

**The front page:** the search with live results (the name, its kind, the evidence pip, the Signal pip), the Signal's card and spectrum, three numbers, then the Community Signal's board, Ask Sig's twelve agents, the real example, how a report counts, the house rules and the questions.
