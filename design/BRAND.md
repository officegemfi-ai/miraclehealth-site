# Miracle Health: the brand book

The rules every page keeps to. The tokens are in `tokens.json` beside this file; the illustration system is in `illustration.md`. The same book, with live previews of every component, is the "Miracle Health" design system on Claude.

Miracle Health is an independent, free place for adults 18+ to look up what they take, ask about it and say how it went. It has four places: the Library, Ask Sig, the Community and My Miracle. All four are one app, and every page opens as a window in Sig's terminal. Behind every answer are twelve agents, each with one job, each signing what it made. Nothing is for sale, nobody is told what to take, and no amount is ever given.

Build every page from this system: the window and its parts (`components/`), the tokens (`tokens.json`), the twelve agents' glyphs, Sig's ring and the compound prints (`assets/`). The illustration rules are in *The illustration system*; the launch rules are in *The launch campaign*.

## Principles

1. **Every answer, checked.** The design shows the checking: the run log of each agent's step, the Safety agent first and last, the read strip under a report, "safety on" in every status bar.
2. **Measured, not sold.** Every number comes with its source and how sure anyone can be ("checked oct 28, 2026 against 10 sources", "strong evidence"). It is set in mono. Never show a price, a seller, a brand, a lab or an amount.
3. **Colour is a signature.** Pages are graphite and near-white. Colour shows who is speaking or what is being measured: `lime` for the community and its Signal, `evidence` for the evidence, and each agent's own `agent-*` hue for that agent. Never use colour as decoration.
4. **One window, everywhere.** The same side panel, title bar, path and status bar on every page and every surface. The side panel is never removed: it folds away or slides in.
5. **Everything is a file.** Things are named the way a terminal names them: a fact sheet is `semaglutide.md`, the feed is `home.feed`, the Signal is `signal.top`, a run is a log. People should be able to read the system, not just look at it.

## Voice

Plain, calm and exact, like a careful friend who has read the studies. Short sentences. Talk to "you" and say what happens. Write "we" rarely and never in place of the agents: Sig and its agents speak for themselves. Use sentence case everywhere. Kickers are mono capitals (`kicker`). Labels in the side panel and status bar are mono lowercase (`label`, `status`).

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
- **Headlines: Mona Sans Display,** the same file wider (from 112.5%) and heavier (from weight 640). Track it tight.
  - `hero` for the one headline of Home and the story page, `section` for section heads, `page` for a page's h1, `h2` inside a page.
  - A page's h1 ends in a full stop: "Your feed.", "The Signal."
- **Anything measured or labelled: Monaspace Neon.**
  - `kicker` (capitals, 0.12em, led by a 28px rule) and `label` (lowercase).
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

- **Corners:** `radius-plate` for cards and tables, `radius-row` for side panel rows, `radius-control` for buttons, fields and tabs, `radius-strip` for the read strip, `radius-shell` for terminal blocks, `radius-window` for the window. No pills.
- **Plates:** a plate (a page's head) carries a 10px tick in each corner, like crop marks.
- **Shadows:** nothing casts one except what floats (`shadow-float`) and the phone drawer (`shadow-drawer`). Depth comes from the four grounds, not from shadows.

## Motion

- **What moves:**
  - The live dot pulses every 1.8s, growing and fading on transform and opacity only.
  - The Signal's tape runs, and pauses on hover.
  - A Signal counts from its last value to its new one.
  - Sig's ring lights each agent's arc as it reports.
  - Drawers slide in 0.22s.
- **When it doesn't:** nothing loops for decoration, and when a device asks for reduced motion, everything stops.

## States and focus

- **Focus:** every focusable thing gets a solid 2px `text` ring, 2–3px out. It contrasts at 15:1 or more on every ground.
- **Hover:** hairlines brighten to `text`, and rows take a 5% `text` fill.
- **Current:** the current place, row or tab takes an 8% `text` fill and `aria-current`.
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
