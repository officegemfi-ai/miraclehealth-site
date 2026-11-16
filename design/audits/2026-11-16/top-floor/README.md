# The front page's top, on the Signal's floor

The owner pointed at the isometric squares under the Signal's ring. They asked for the top's background to be made of them, "so it looks like it's going inside", with the ring built into it. Before is main at 5a0314d (what is live); after is this branch. Both were captured in Chrome at the owner's window size (1717 by 955, at 1.5x) and on a phone (390 at 2x), with the Signal answered from `tests/fixtures/signal.json`.

- `desktop-1717-before-after.jpg`: before above, after below.
- `phone-390-before-after.jpg`: side by side.

How it's built:
- **The floor** is a layer of the top's own (`.sx-ground` in `home.css`, drawn by `sxFloorSvg` in `lib/sighero.js`), under everything in the top:
  - it is the plate's isometric grid, 40 of the drawing's units apart, carried on across the whole top;
  - it is brightest round the ring and fades with distance to the page grid's faintness;
  - Signal blue lights the floor round the slab;
  - it is drawn in the drawing's own units, so the script moves and scales it to where the drawing sits, and again when the top or the drawing changes size, then fades it in.
- **The ring:**
  - the slab rests on the floor, without the posts and the small grid it stood over;
  - the card has no box round the ring;
  - what people report most and the foot are a plate under it.
- **The top's own black** keeps the page's ultramarine wash and hides the page's square grid. That's the one gradient the design check now counts more.

Smoothness, measured over the whole first load with the processor slowed four times (five runs each, medians):

| Width | Pauses over 50 ms, before → after | Time in those pauses, before → after |
|---|---|---|
| 390 | 7 → 6 | 817 → 667 ms |
| 1440 | 8 → 8 | 1,015 → 1,184 ms |

Main-thread work is the same.

Checks: build, body map, 31 tests (one new: the floor's lines cross at the plate's centre, and the page carries the floor), links, design check, layout (322 views) and states (574 focus stops) all pass.
