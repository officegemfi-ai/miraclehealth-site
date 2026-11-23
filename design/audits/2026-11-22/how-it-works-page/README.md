# How it works, a page of its own

November 22, 2026. The owner: "remove the scroling animation under the purple banner and make the how
it works page a seperate page with the animation and FAQs". Why it's done this way is in
`design/decisions.md` (2026-11-22).

- `front-before-after.jpg`: the front page at 1440 wide. Before, the violet band, then the six-step
  animation; after, the band with "See how it works", then "Signal, not noise".
- `page-desktop.jpg`: /how-it-works/ at 1440 wide: its top (the band under the bar, then the first card)
  and its end (the finale, then the questions).
- `phone.jpg`: at 390 wide, the page's top, its questions with one open, and the front page's band,
  its words on the page's left edge.

Checked: the page runs with motion on at both widths with no script errors, every card is there,
and the band's words line up with the next section's heading at 390, 600, 768 and 880 wide (centred
from 901, as before).

## After the owner saw it

Three asks the same evening; the decisions are in `design/decisions.md` ("How it works, after the
owner saw it").

- `front-band-and-ring.jpg`: the front page at 1440 and 390 wide: the band with "See how it works",
  then the finale under it, the Signal written in what people report ("keep this part on the main page
  aswell under the purple banner").
- `front-top-before-after.jpg`: the front page's top at 1440 wide, before and after "The Community
  Signal, live" went from over the headline ("remove this").
- `page-top.jpg`: /how-it-works/ at 1440 and 390 wide: Three steps first, copied from the front page
  by the build ("put this also on the how it works page"), then the band.

Checked: both pages run with motion on at 1440, 768 and 390 wide with no script errors; on the front
page the score sits on the ring's centre as it does on the page, and the band's and the finale's words
line up with the next section's heading at 390, 600, 768 and 880 wide (centred from 901, as before);
the spine's square stays under the band until the page places it, then runs the spine as before, with
motion on and off. The pictures answer the live Signal from `tests/fixtures/signal.json`.

## One list of questions

The owner, of the front page's "Straight answers": "REMOVE THIS from the landing page we dont need it 2
times".

- `front-end-before-after.jpg`: the front page's end at 1440 wide, before and after: it now goes from
  "What we won't do" to the footer.
- `page-questions.jpg`: /how-it-works/'s questions at 1440 and 390 wide: the Signal's nine, then the
  six that were only on the front page ("Is this medical advice?" was on both, and is there once).
