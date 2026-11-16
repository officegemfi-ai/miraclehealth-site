# The violet band

The owner showed a grainy purple gradient banner and asked for something like it in some parts of the website, "so it doesn't look too flat". Before is main at 13a4fa1; after is this branch. Captured in Chrome at 1440 and on a phone (390 at 2x).

- `desktop-1440-before-after.jpg`: How it works' opening, Join, and the foot, before and after.
- `phone-390.jpg`: the three on a phone.

It is `.violet` in `styles.css`:
- a violet gradient (`violet-deep` #5D33EF at the top left, `violet` #6B48F1, `violet-light` #9AA0F4 toward the bottom right);
- under a fine grain: a 180px noise tile, `img/grain.svg`, blended over it with `overlay`.

It's on three places:
- How it works' opening ("The system behind one honest number."): the spine's marker passes under it.
- Join ("Took something? Say how it went."): its pane of reports is a black window on it.
- The weekly email at the foot of every page: a band of its own.

On the band, the words are white and the main action is black.

How well the white words read, measured on the ground under each line (the median, with the words hidden):

| Line | 1440 | 390 |
|---|---|---|
| How it works' kicker | 5.65 | 5.73 |
| How it works' line under the headline | 5.22 | 5.05 |
| Join's kicker | 6.04 | 5.88 |
| Join's line under the headline | 5.90 | 5.76 |
| Join's small print | 5.77 | 5.60 |
| The weekly email's line | 5.99 | 5.59 |
| The weekly email's note (13px) | 4.64 | 4.79 |

Checks: build, body map, 31 tests, links, the design check (one gradient more, the colours in the palette), layout (322 views) and states (574 focus stops) all pass.
