# How it works on the front page, made simpler

The owner asked for the front page's "Three steps, one honest number" and the three ways in under it to look better and simpler. Before is main at 161fc61 (what is live); after is this branch. Both were captured in Chrome with the top bar hidden, from the section's top hairline to the end of the three ways in.

| Width | Before | After |
|---|---|---|
| 1717 (the owner's window) | 1,048px tall, six boxes | 696px tall, three steps and three slim links |
| 1440 | 1,072px | 696px |
| 1024 | 1,225px | 717px |
| 768 | 1,149px | 1,027px |
| 390 (a phone) | 1,979px | 1,151px |

- `desktop-1717-before-after.jpg`: the owner's window size, before above and after below.
- `phone-390-before-after.jpg`: a phone, side by side.

What changed:
- **Three steps on one line.** The three tall cards, with an empty band between each drawing and its title, became three columns joined by a hairline with an arrow, from drawing to drawing. Each column keeps one left edge: the drawing, the step's number in Signal blue, its title and its line. On a phone, and up to 999px, the hairline runs down the left instead.
- **Titles in sentence case.** The step titles were wide, heavy capitals, like a section's headline. They are now semibold sentence case, as the brand book has for headings inside a section (`design/BRAND.md`, Type), so the section's headline is the one line in capitals. The design check counts one capital use fewer; its baseline is lowered.
- **The line under the headline sits under it.** It was pushed to the far right, away from the headline it explains.
- **The three ways in are three slim links,** each with its place's mark from the side panel (the Library's ladder, the Signal's bars, Sig's ring), its title, and where it opens ("open library", "open signal", "ask sig") where there is room. Each starts exactly where its step does above it, at every width. Their long descriptions are gone: the three steps already say how the Signal works, and the titles say where each one goes. They keep the same three links, so the keyboard stops are unchanged (574).

Checks: build, body map, 30 tests, links (346 pages), design check, layout (322 views, nothing scrolls sideways or is cut off) and states (46 views, 574 focus stops) all pass. The titles of the three links stay on one line from 1000px up; at 999px and below the links stack.
