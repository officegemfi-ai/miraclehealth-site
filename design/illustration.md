# The illustration system

Miracle Health draws with data, not decoration. There are three marks, all made from code: Sig's ring, the twelve agents' glyphs and the compound prints. The fourth illustration is the product itself, the window. Nothing else is drawn: no stock photos, no 3D pills or syringes, no people, no gradients, no mascots other than Sig.

## Sig's ring

The ring is the twelve agents as one mark. It is the mark of Ask Sig and of every title bar.

- **Construction:**
  - Eleven arcs, one for each agent who gathers what's known, go round by hue: Safety (coral), Planner, Recommender, the community, Combination, Markers, Synergy, Evidence, Relatives, Mechanism, Stack builder (pink).
  - Each arc is drawn in its `agent-*` colour, and they are separated by gaps of 9° (4.5° from 60px up).
  - The stroke is 17% of the ring's size (2.4px at least).
  - From 30px up, the Interpretation agent sits at the centre as a white dot, 3.3% of the size: it reasons it all through, last.
- **Code:** `lib/ring.js` draws it (`ringSvg(size)`). Never redraw it by hand.
- **Alive:** in Ask Sig each arc lights as its agent reports, and unlit arcs dim. In the launch film the ring assembles arc by arc, in the order the agents run.
- **Don't:** recolour it, put it on a light ground, outline it, add arcs or use it as a loading spinner. It never spins.

## The twelve

A glyph for each agent, on a 24-unit grid, in one 1.6 stroke with round caps and joins and no fills, in the agent's colour. Each is a small metaphor for its agent's job:

| Agent | Glyph | Colour |
| --- | --- | --- |
| Safety agent | a shield, checked | `agent-safety` |
| Planner | a route from where you are, by a turn, to what you want | `agent-planner` |
| Recommender | a compass star: the options worth a look | `agent-recommender` |
| Evidence librarian | a ladder of rungs: how strong the evidence is | `agent-evidence` |
| Relatives agent | a family: what close relatives show | `agent-relatives` |
| Mechanism agent | a receptor and what fits in it: how it could work | `agent-mechanism` |
| The community | many voices meeting in one number | `agent-community` |
| Combination agent | two circles and where they overlap | `agent-combination` |
| Markers agent | a vial with a level in it: the blood tests | `agent-markers` |
| Synergy auditor | two waves in step: checked together | `agent-synergy` |
| Stack builder | blocks, stacked: the options, laid out | `agent-builder` |
| Interpretation agent | an eye, at the centre of the ring | `agent-interpretation` |

- **Code:** `lib/glyphs.js` draws them (`glyphSvg(key, { size })`). The assets in `assets/Glyphs/` carry their colours.
- **Sizes:** 14px in a run log, 16px in the side panel, 18–24px on a fact sheet's section, 28–48px on cards, up to 400px as the hero of a social card.
- **Use:** a glyph always means its agent: where it speaks, signs or made something. Twelve together means Sig.
- **Don't:** fill them, thicken one stroke, mix in other icon sets, or use a glyph as a generic icon (the shield isn't "security", the eye isn't "view").

## Compound prints

A print is a fact sheet drawn as one mark, so two compounds can be told apart, and compared, at a glance. `lib/print.js` draws one from the sheet's data. Nothing in it is decoration, and nothing in it may be invented.

- **Spokes** run to the places in the body the sheet names. There are 38 places, head to toe, clockwise from the top. Short ticks mark all 38 round the edge.
- **Beads** sit on a spoke, one for each of the sheet's lines at that place. Each bead's colour says what the compound does there: `op-is` acts, `op-up` raises, `op-down` lowers, `op-block` blocks, `op-watch` worth a blood test, `op-warn` a caution. Cautions are outermost and ringed in `surface`.
- **The core** is the family's shape (peptide, hormone, medication, supplement), with the evidence inside it as rungs. A rung lit in `evidence` is a grade reached: anecdotal, animal and lab, limited, moderate, strong.
- **The edge** carries the compound's Community Signal as a `lime` arc once it is known. Until then it is not drawn.
- **Always** set a print with its name, its file (`semaglutide.md`), its count ("9 of the body's 38 places · 12 lines") and its evidence, and give the key in words wherever the beads are read.
- **Sizes:** 120px in lists, 168px on the story page, 232–260px on a fact sheet, up to 720px as a social hero.
- **Assets:** `assets/Prints/` has the eight on the story page, on a graphite plate.

## The window as illustration

When a piece needs to show the product, show the product. That means the real window, at real size and with real copy: the title bar with its tab (`semaglutide.md`), the path, the status bar with "safety on". Crop into it, scale it and set it on `page`, but never redraw it as a mockup with invented data, and never put it in a phone or laptop frame.

## Composing a piece

- **Ground:** `surface` or `page`. Never white.
- **Colour:** one signature colour per piece (`lime` for a community piece, `evidence` for a Library piece, an agent's colour for its card), except where the twelve appear together.
- **Type:** the headline in Mona Sans Display, the kicker and every number in Monaspace Neon, the words in Mona Sans.
- **Signature:** sign every piece in mono at the foot with what made it and where: `sig@miracle ~/story`, `miraclehealth.us`.
- **Rules:** a piece that mentions a compound never names an amount, a seller or an outcome promise.
