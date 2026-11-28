# The house rules on How it works

November 27, 2026. The owner, of the front page's "What we won't do" (with a picture of it): "put this on the how it works page".

How it works now carries the section between the system behind one honest number and the questions. The library build copies it from the front page between `part:rules` markers, the way it copies Three steps and the finale, so the two pages never differ. The front page keeps it as its last section, and the footer's "House rules" still goes to /#rules. The reasons are in `design/decisions.md`.

- `how-desktop-before-after.jpg`: How it works at 1440, where the questions followed the system (before) and where the house rules now come first (after).
- `how-phone-before-after.jpg`: the same at 390.

Checked at 2560 (four rules in a row, as on the front page), 1440 (two by two), 1024 (one rule a row, title beside the words), 768 and 390 (one under another). The build (300 compounds, 122 fact sheets), the tests (54), the links (36,414 across 348 pages), the design check (no new drift), clean (48 views), layout (384 views) and states (48 views, 603 focus stops) pass.
