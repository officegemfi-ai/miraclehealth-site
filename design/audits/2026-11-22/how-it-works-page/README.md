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
