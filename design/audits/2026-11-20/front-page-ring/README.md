# The front page: the agents as Sig's ring, the board off the page, the example in three plates

November 20, 2026. The owner sent three screenshots of the front page on a 2560px screen:

1. the boxed picture of Sig's twelve agents: "make this circular similar to the sig logo: and clean";
2. the Community Signal's board: "also remove this part";
3. the real example's table: "make this look better".

## What changed

| | Before | After |
|---|---|---|
| Sig's twelve agents | four boxed steps, an agent in each box, a pulse running down them | Sig's ring, drawn large: the logo's eleven pieces in its order and colours, the twelfth as the dot in the middle, the four steps beside it |
| The Community Signal's board | a second list of eight under the live Signal and its spectrum | gone from this page; "The Signal" lands on the live Signal at the top |
| The real example | one table across the window, its point in small type at the foot | three plates, each opening with its bottom line and one sentence, the uses on rows the three share |

How tall each is, in CSS pixels:

| | 2560 wide | 1440 wide | 390 wide |
|---|---|---|---|
| The agents, before | 1647 | 1769 | 2679 |
| The agents, after | 1336 | 1228 | 1802 |
| The board, before | 737 | 827 | 1149 |
| The board, after | 0 | 0 | 0 |
| The example, before | 1145 | 1206 | 2224 |
| The example, after | 1276 | 1278 | 2447 |

The page is about 900px shorter at 2560, 1,300px at 1440 and 1,800px on a phone. The example is the one part that grew, by about a tenth: it now says its three points in large type before the detail, where the table left them to one small paragraph at the foot.

## Pictures

- `agents-before-after.jpg`: Ask Sig's section at 2560px.
- `agents-pointing.jpg`: pointing at the Evidence librarian's piece; the middle says what it does.
- `agents-phone.jpg`: the same section on a phone (390px).
- `board-removed.jpg`: the section that left the page, for the record.
- `example-before-after.jpg`: the real example at 2560px.
- `example-phone.jpg`: the real example on a phone.

## What did not change

Every finding in the example is the fact sheet's sentence, whole, with its FDA link, and every placebo figure and sentence is the placebo file's (`library/data/baselines.json`). `tests/front.test.mjs` holds the page to both, and to the ring's order, colours and places.

## Checks

`node scripts/build_library.mjs --check`, `node --test tests/*.test.mjs` (41), `node scripts/check_links.mjs`, `node scripts/design_check.mjs` (the baseline is one lower: the old Signal figure's tracked mono went with the table), `node scripts/check_body.mjs`, `node scripts/check_layout.mjs` (368 views, 16 widths), `node scripts/check_states.mjs` (46 views, 574 focus stops), `node scripts/check_clean.mjs` (46 views).
