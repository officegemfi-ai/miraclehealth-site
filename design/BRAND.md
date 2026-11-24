# Unhyped: the brand book

The rules every page keeps to. The tokens are in `tokens.json` beside this file; the illustration system is in `illustration.md`. The same book, with live previews of every component, is the "Unhyped" design system on Claude.

Unhyped is an independent, free place for adults 18+ to look up what they take, ask about it and say how it went. It has four places: the Library, Ask Sig, the Community and My stack. All four are one app. Behind every answer are twelve agents, each with one job, each signing what it made. Nothing is for sale, nobody is told what to take, and no amount is ever given.

Build every page from this system: the window and its parts (`components/`), the tokens (`tokens.json`), the twelve agents' glyphs, Sig's ring and the compound prints (`assets/`). The illustration rules are in *The illustration system*; the launch rules are in *The launch campaign*.

The look is **black and electric blue**, pages 15 to 18 of the Unhyped design canvas ("15 Black and electric blue", "16 Website, every page", "17 Community, every screen", "18 The system, animated"): black pages under a faint grid, wide capital headlines, one electric blue main action, signed in Sig's colours. It keeps the Sig system's window (page 9). When this book and those pages disagree, the pages win and this book is corrected. *The Sig system*, below, says what it asks of every page.

## Principles

1. **Every answer, checked.** The design shows the checking: each agent's step in plain words, the Safety agent first and last, Sig's read under a report.
2. **Measured, not sold.** Every number comes with its source and how sure anyone can be ("Checked Oct 28, 2026 against 10 sources", "Strong evidence"). The number is set in mono; the words round it are not. Never show a price, a seller, a brand, a lab or an amount.
3. **Colour is a signature.** Pages are black and near-white. Colour shows who is speaking or what is being measured: Signal blue (`lime` in code) for the community and its Signal, mint (`evidence`) for the studies, and each agent's own `agent-*` hue for that agent. Never use colour as decoration.
4. **One frame, everywhere.** The same top bar and side panel on every page. The side panel is never removed: it folds away or slides in.
5. **Clean, not costume.** Nothing is dressed up as code or as a machine talking about itself. Every small thing on a page is something a reader needs, said once, in plain words, at a size they can read (the owner's rule, November 18; *Clean, not costume*, below).

## Clean, not costume

The owner's rule (November 18, 2026), after six screenshots of the site: these small details "look like AI, it's too much and makes it not clean." The `design-clean` agent audits every page against it, and `scripts/check_clean.mjs` fails a change that brings the mechanical kinds back. The community app keeps to the same rule since November 20, held by the same scan on every one of its screens (its `tests/e2e/clean.mjs`).

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

**What stays:** numbers in the code face; every navigation panel and menu, with plain names in it; one short kicker per section; honest notes said plainly ("An example, not a real report"); and the drawings' own labels (How it works, the prints, the body map). The Signal's data charts (the flow, the takeover line, the uses rose) are not among them: their words are in the body face, in sentence case, and only their numbers are in the code face (decision, November 23). Ask Sig's screen, the editor that laid compounds out like code, was an exception here until November 21, 2026, when the owner asked for only the blood markers beside the chat: it and Sig's mind are gone, and so is the exception.

## Voice

Plain, calm and exact, like a careful friend who has read the studies. Short sentences. Talk to "you" and say what happens. Write "we" rarely and never in place of the agents: Sig and its agents speak for themselves. Use sentence case everywhere. A kicker is one short phrase over a heading, in the body face (`kicker`: "How it works"). Labels and a table's column heads are sentence case in the body face too (`label`).

**The line.** Unhyped has one: "No miracles. Just what happened." It is the front page's headline, the share card every page falls back to, the sign-off at the foot of every page and every email, the first post and the opening of a profile's bio. Say it as written, both sentences, never one without the other; in a headline its second sentence takes the punchline's gradient. What Unhyped is goes beside it in its own words, "Peptides, without the sales pitch.": under the logo in a foot, in the front page's title, as the kicker over the line. A page's own headline ("One app. Twelve agents. Every answer, checked.", "Three steps, one honest number.") is that page's, not a second line (decision, November 22).

**The format.** A compound or a goal is said as its name, then the brand's word: "BPC-157, unhyped.", "Sleep, unhyped." The name comes first, as the Library writes it; "unhyped" is in lower case, as the logo has it, and ends in a full stop. In a headline it is in capitals like any headline and "unhyped." takes the gradient. It is for a fact sheet's title and share card, a goal's share card and a post, never a page's own h1 (a fact sheet's h1 is the compound's name), and nothing is claimed after it: what follows is what the sheet covers ("BPC-157, unhyped: evidence, risks, blood tests").

**Real copy to learn from:**
- "No miracles. Just what happened."
- "BPC-157, unhyped."
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
  - The suede card (`suede`): the Noise card in signal and noise is matte grey suede, a fine grain (`img/suede.svg`, laid on in soft light) over `suede`, lit softly from the top left, so noise feels like something to the touch beside the Signal's clean, lit card. Words on it are `text-2` (about 5.8:1 beside every line), never `muted` (under 4:1) (decision, November 19).
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
- **Gradients and glows** only for the Signal's scale bar, the main action (electric blue, lit from the top, with its glow), the window's ground (an ultramarine wash at the top over a faint 64px grid; in the community, a softer wash that warms into violet over brushed Alcantara, the owner's "cosy texture", November 23), the violet band, the front page's top in light (the Signal's parts as bands of light, and the glow on their bars) and the punchline: the second sentence of a two-sentence headline (the line wherever it is a headline, a page's own headline, a share card's), running from Signal blue into `violet` and `violet-light`, line by line (decision, November 18). It is one rule in the design kit, `.punch` in `kit/kit.css`, so both apps draw it the same (November 23). One set of colours, black and electric blue, whatever a device is set to.

## Type

- **Words: Mona Sans.**
  - `body` on the site, `body-app` in the community, `lede` under a headline.
  - `h3` for card and post titles, `nav` for side panel rows, `button` for buttons.
- **Headlines: Mona Sans,** wide (125%), heavy (800) and in capitals, tracked tight (-0.028em, one value for every headline: `--head-ls`), set at about 0.86 of the old sizes so a line keeps its length. Headings inside an answer or a card stay semibold and in sentence case.
  - `hero` (64px) for the one headline of Home and the story page, `section` (42px) for section heads, `page` (38px) for a page's h1, `h2` (22px) inside a page.
  - A page's h1 ends in a full stop: "Your feed.", "The Signal."
- **Numbers: Monaspace Neon.** `data` for scores, counts, percentages and figures in tables, with tabular figures, and keyboard keys. Words are never set in it (the owner's rule, November 18). One exception: a Signal standing on its own at 40px and up is set in the score style, as the front page and the brand pack set it (Mona Sans 650 at 125%, −0.025em, tabular figures; decision, November 23).
- **Kickers and labels: Mona Sans.** `kicker` (14px, semibold, sentence case, no rule before it, no dots in it) and `label` (13px, semibold).
- **Fonts:** both are open fonts (SIL OFL, in `licenses/`), served from `fonts/`. Never substitute Inter, Roboto or a system serif.

## The frame

Every page opens the same way:
- **Side panel** (`side-panel`, on `side`): it starts closed; the menu button at the left of the top bar slides it in over the page. In it, the logo, then the Signal and the four places, each with its mark and no caption beside it (the owner's rule, November 18):
  - The Signal: its spectrum, four bars in Signal blue.
  - Library: the Evidence librarian's ladder.
  - Ask Sig: Sig's ring.
  - Community: the community's glyph.
  - My stack: the Stack builder's glyph.
  
  Under them comes what is on this page, then the rest and the legal.
- **Top bar** (60px, sticky): the menu button, the logo, then the four sections most people go to (The Signal, Library, Community, How it works; the page you're on is underlined where the bar meets the page), and at the right a search box that opens ⌘K (Ctrl K) to go anywhere, Ask Sig with its ring, and Join as a white button. Below 1100px wide the four sections are left to the side panel.
- **Page,** across the window's whole width (up to 2400px, with a margin that grows from 16px to 96px) on the faint grid under the ultramarine wash, then the foot: the weekly email, the logo with "Peptides, without the sales pitch." and the disclaimer under it beside four columns of links, a last line (the line signing the page off as a small headline with its punchline, and the copyright), and the logo's word drawn big at the very bottom. The community's foot is the same (decision, November 23). Text keeps its own line lengths inside it; on a wide screen the front page's top grows with it, and nothing runs long and empty (the owner, November 18: "why is it so stretched?"). Every heading stands above its block at every width (a heading set beside its block only fills the width artificially, the owner said); it's the cards that fit the width: a row's parts stay together (on the board a name, its bar and its score, never a gap; a card's foot keeps its words and its way on side by side); no bar or meter runs long (the owner: "having the lines that long looks ridiculous"): the board's bars and the example's stay 48 to 480px, and a board 1120px wide and up holds its eight in two columns of four; what a card lists flows into more columns as it widens (signal and noise two columns on a card 840px and up, the rules two by two from 1100px and four across from 1880px, the twelve agents' gatherers five to a row from 1880px, an agent alone in its step one frame or one card wide); a card's head sits on its own columns (the example's, from 1280px); and a list or table of short lines keeps a reading width (the questions 1040px, the weekly's issues 780px, the method's table of pairs 740px, its placebo table 1280px). The layout check fails a row whose parts stand more than 560px apart. On the front page's top the faint grid gives way to the Signal in light: bands of violet and blue light drifting behind the whole top as if on an LED wall (5px cells, finer on a sharp screen, the light running in soft gradients across them), one band for each of the Signal's four parts and as bright as its number, brightest round the score and dark behind the words (decision, November 17).

No window box, tabs, path line or status bar: the frame is a plain website's (decision log, November 12).

**Closing the panel:** its own button, Escape, a tap outside it or following one of its links (`shadow-drawer` under it).

**On a phone:** the top bar keeps the search and Ask Sig as icons, and Join.

## Shape and depth

- **Corners:** square. Every card, plate, table, pane, button, field, tag, chip, tab, row, menu, dialog and meter has `radius-none` (0), in both apps and in the drawings' tags (decision, November 13). Only dots and rings are round (`radius-dot`, 50%): pips, live dots, agent dots, avatars and Sig's ring button. No pills.
- **Square, in How it works' language:** How it works' six cards, the front page's three steps (three large cards, a short arrow from each to the next; November 19), the Signal's card on the front page, the frame round its picture of Sig's twelve agents, the real example's three plates, and on Ask Sig the window, its answer cards, its ways to start and its box to write in have no round corners: a 1px frame, the number in its box, the title in mono, dividers with a gap by the tree.
- **Panes:** a pane is a framed block, its content straight under the frame or under a real heading. No bar names it.
- **Shadows:** nothing casts one except what floats (`shadow-float`) and the phone drawer (`shadow-drawer`). Depth comes from the four grounds, not from shadows.
- **Drawn depth:** Sig's ring stands in 3D on Ask Sig (`lib/ring3d.js`): isometric, on a slab over a grid, each agent a wall lit from the front left. The depth is drawn, in the drawing's own shades; nothing on the page casts a shadow for it.

## Motion

- **What moves:**
  - The live dot pulses, fading on opacity only.
  - While something loads, Sig's ring is the spinner: its pieces light one by one, with one plain line saying what's loading. No grey skeleton boxes, no bare "Loading…". Both apps draw it from the kit (`waitHtml` in `kit/kit.js`, `.mh-wait` in `kit/kit.css`); on Ask Sig the answer's ring lights the same way while the agents work, and never turns.
  - A run plays line by line, each agent lighting its piece of the ring as it reports, the centre last.
  - A row of the Signal that moved flashes once, blue up, coral down.
  - The Signal's tape runs, and pauses on hover.
  - A Signal counts from its last value to its new one, and its parts' bars grow to theirs.
  - The Signal in light drifts behind the front page's top (`lib/sigfield.js`), smoothly at the screen's own frame rate, and stops off screen; a pulse goes out through it from the score when another compound is picked, and on a screen with a pointer it gathers a little round it.
  - The same light drifts behind the front page's twelve agents (the owner's request, November 18), in four of the agents' colours (coral, yellow, teal, violet), spread over the whole section and brightest behind the ring; the frame is dark glass over it.
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
- **Sig's ring** (`assets/Marks/`, the Ring component) is Sig's own mark: Ask Sig's button in the top bar and Ask Sig's tab bar (18px in both), its page, its app's icon on a phone (`sig/icon-*.png`, on black) and the loading spinner. It is also on the community's welcome page, above "The Unhyped community", where Sig is the one who reads a report in (`ring()` in the community's `web/ui/art.js`, drawn the same way; the owner's request, November 18). It was the browser tab's icon too, from November 17 to November 22, 2026; the tab's icon is now Unhyped's own (*Logo*, below). The ring is never Unhyped's mark: not a profile picture, not an app icon for the site.
- **Sig in the community** is drawn in the same hand as the front page's three step drawings (`sigSvg` in `kit/kit.js`; the owner's request, November 20): a fine white ring on a 200 grid, the mood inside it in Signal blue, and around the mood its echoes fading out (half strength, then a fifth), in lines that stay 1.2px at any size. Nothing is filled. It is the community's own character, with moods: notifications, stickers, empty states and the Sig button.
  - **The moods:** a dot at rest, three dots while it thinks, a spark to cheer, a heart for support, a question mark when curious, an eye when watching, a moon while it rests. When something is wrong it is a warning sign in amber, the one colour it borrows; offline it is grey.
  - **Small sizes draw less:** the whole drawing from 56px up, one echo from 36px, and under that the ring and the mood alone, drawn larger. Never thicken its lines or fill its shapes to make it louder.
  - Where Sig stands as a logo rather than a character, as on the sign-in page, it is the ring. Don't confuse the two.
- **Compound prints** (`assets/Prints/`, the CompoundPrint component): one mark per fact sheet, drawn from its data. Never use a print that isn't that compound's own.
- **Interface icons** (`design/pack/icons.json`): one set for the website and the community app, drawn the way the glyphs are, so an icon and a glyph side by side are one weight: a 24-unit grid, one 1.6 stroke, round caps and joins, no fills, at 16–24px in `currentColor` (home, search, menu, comment, the vote arrows, check and thirty more; decision, November 20, when the community's set came down from 1.8).
- **No emoji, ever.**

## Logo

The logo is the word **unhyped**, lower case, in the site's own face: Mona Sans at its heaviest (900) and widest (125%), set a little tight with the font's own kerning, and slanted 10 degrees, with the old script logo's energy and none of its fuss (the owner's new name, November 21, 2026; it was Miracle Health until then). It is drawn as outlines, so it needs no font: `design/pack/wordmark.py` draws it, and draws `logo.svg` (what the pages load), `design/pack/logo.svg` (the brand pack, the share images and the posts), `design/pack/logo-ink.svg` (for a light ground) and the foot's big word from the same outline. Never set the word in type instead. It is near-white, for black grounds:
- Set it 20px tall in the top bar, the side panel and Ask Sig's side, and 26px in a foot. Don't set it smaller than 16px, and keep half its height clear on every side.
- Never recolour, outline, stretch or rotate it, and never set it on a photo or a colour. On a piece that uses the violet band, the logo sits on black above the band, never on it.
- The one exception is the foot's big word (`img/wordmark.svg`, made by `design/pack/wordmark.py`): the logo's word drawn as a stack of hairline outlines in violet into blue, dim, lighting up under the pointer, standing on the page's bottom edge with its lowest strokes cut off. The owner asked for it (November 17). Use it there only, and never as the logo.
- In the community it sits beside a "Community" tag: the word in the label style, in a `line-2` frame.

**The icon** is the logo's own u, alone, for where the word can't fit: a browser's tab, a phone's home screen, a profile picture (the owner, November 22, 2026, of the brand ideas: "I like it, now lets expand on it"). It is white on the main action's electric blue (`accent`, lit from the top by `accent-hi`, as that button is), so the one colour a page acts in is the one the brand is known by. `design/pack/wordmark.py` draws it from the same outline as the word, so the two can't drift apart:
- `favicon.svg` and `favicon.ico` are the tab's, on every page of the site and in the community; the u fills more of the square there, so it still reads at 16 pixels.
- `apple-touch-icon.png` is a phone's home screen's (Ask Sig, an app of its own, keeps its ring there); the brand pack's `icon.svg` and `app-icon-*.png` are for a profile picture and anything else.
- It is a square with nothing round it: a phone rounds its corners and a profile picture cuts a circle from it, and the u keeps clear of both.
- In black (`icon-black.svg`) or white (`icon-white.svg`) only where blue can't be printed, or the ground is blue already.
- Never beside the logo (the word has its u already), never redrawn in another face or straightened, never with the ring.

## The brand pack

`design/pack/build.mjs` makes one folder to hand to anyone who makes something for Unhyped: the logo and Sig's ring, the colours, the type, the icons, the Community Signal's pieces, the marketing formats and a two-page guide. Every file is made from what the site runs on (`tokens.json`, `lib/ring.js`, `lib/glyphs.js`, the fonts, the front page's step drawings, the share images), so it matches the pages; make it again when they change (decision, November 20).

**Marketing keeps one layout,** on a share image, a post, a story or a header: the logo and the address along the top, then one kicker, the headline and one line under it, from the left, on the page's black ground. A headline's second sentence takes the punchline's gradient. Nothing else: no foot, no strip of rules, no counters, nothing in the code face but numbers. `design/pack/look.mjs` holds that look for `scripts/og_images.mjs` (every page's share image) and the pack, so they can't drift apart.

- **A statement** (Join, the weekly email) may sit on the violet band, under the logo on black; its one action is black there.
- **A fact sheet's share card** is that layout with the format as its headline ("BPC-157, unhyped."), the sheet's kind as its kicker, its evidence on the meter and its print at the right, where a card's drawing goes. A goal's says it the same way ("Sleep, unhyped."). `scripts/og_images.mjs` draws one for every fact sheet, and the library build gives the sheet its own once it's there. It never carries a Community Signal: the score is checked every minute, and a picture saved in the site can't follow it.
- **A piece that shows a compound's Signal** takes its number from the live Signal on the day it goes out (the pack's `post-unhyped.png` is the format with its score) and carries "What people report. Not medical advice."
- **The words** are the site's own (*Voice*, above), as written. Never a dose, a seller, a brand, a lab, a price, a diagnosis or a promise, in a post as on a page.

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

**The front page:** the search with live results (the name, its kind, the evidence pip, the Signal pip), the Signal's card and spectrum, three numbers, then the three steps, how the Signal works, Ask Sig's twelve agents, the real example, how a report counts, the house rules and the questions. The ranked board is the community's; the front page no longer carries one (November 20), and "The Signal" in the bars and the side panel lands on the live Signal at its top.
- **Sig's twelve agents are drawn as its ring** (the owner's request, November 20): the logo's eleven pieces in its order and colours, each with its glyph and its name beside it, and the one that weighs it all as the white dot in the middle. Pointing at an agent, or picking its name, says what it does in the middle. The four steps of an answer stand beside the ring (under it on a narrow window); pointing at a step lights the pieces that take part. A phone lists the names under the ring.
- **The real example is three plates,** one for each thing a fact sheet lays out, in the fact sheets' order: what the studies show, what people report, got better on a placebo. A plate opens with its own bottom line (the fact sheet's grade on the meter, the Community Signal on its bar, the lowest to the highest placebo figure) and one sentence, then says it use by use, on rows the three share. The findings are the fact sheet's words, whole, with their sources; `tests/front.test.mjs` holds them to it.
