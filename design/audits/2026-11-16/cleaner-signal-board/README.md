# The front page's Signal board, made cleaner

The owner asked for the Community Signal section ("How it went, for the people who took it.") to look cleaner, and whether it should stay at all. It stays: it is the one place on the front page that names names, the compounds people say worked best, in a ranked list. Most of what was around that list said nothing yet. Before is main at dfdff13 (what is live); after is this branch. Both were captured in Chrome with the top bar hidden, and with the Signal answered from `tests/fixtures/signal.json`, as the layout check does.

| Width | Before | After |
|---|---|---|
| 1717 (the owner's window) | 1,178px tall | 974px tall |
| 1440 | 1,193px | 974px |
| 1024 | 1,244px | 933px |
| 768 | 1,313px | 921px |
| 390 (a phone) | 1,652px | 1,185px |

- `desktop-1717-before-after.jpg`: the owner's window size, before above and after below.
- `phone-390-before-after.jpg`: a phone, side by side.

What went:
- **Four counters** (51 live Signals, 0 first-hand reports, 0 moves today, 1 member). The zeros made the board look empty, and the top of the page already counts the live Signals.
- **Where the numbers come from** (members 0% · forums 100%) and the score's formula. The line under the headline says the Signal is read from public forums for now, and "How the numbers are made" has the formula.
- **Six columns:**
  - The four parts were what happened, agreement, voices and volume. The ring at the top of the page shows them for each compound, and the community's full board can sort by them.
  - The other two were "from" (forums on every row) and "read" (mostly positive on every row).
- **The log** (`tail -f signal.log`), which had two lines: when the snapshot was published, and "waiting for the first first-hand report". A row that moves still flashes when a newer snapshot arrives.
- **"Open the full board"** as a second button, since the board's last row opens it.

What changed:
- Each row is now the rank, the compound (still a link to its fact sheet), **what people report most for it** (the first of its themes in the snapshot), and its score with a bar. On a phone, what people report most sits under the name.
- The bars are in Signal blue, the community's colour, as the live dot is.
- **This week's move** shows beside a score (▲ in blue, ▼ in coral) only when a compound moved. Every row keeps room for it then, so the scores stay in one column.
- The board's bar reads "live · nov 16, 11:29", without the snapshot number or seconds. If the Signal can't load, it reads "offline", and a line under the loading lines opens the whole board in the community.
- The line under the headline is shorter, and the line beside the button is one sentence: "Your report moves it, whether it worked or not."

Checks: build, body map, 30 tests, links (346 pages), design check, layout (322 views, nothing scrolls sideways or is cut off) and states (46 views, 574 focus stops) all pass.
