# The site's opening, before and after

Every page in `design/pages.json`, opened in Chrome with the processor slowed 4x (a mid-range phone), the Community Signal answering after 350 ms. Two runs each; the medians of frames dropped in the 3.5 seconds after the first paint, and the largest layout shift score (CLS) seen. Before: main at 5f885b1. After: this branch.

| Page | Width | Frames dropped, before → after | Layout shift, before → after |
|---|---|---|---|
| home | 1440 | 36 → 21 | 0.070 → 0.000 |
| home | 390 | 59 → 29.5 | 0.033 → 0.000 |
| library | 1440 | 26 → 20 | 0.013 → 0.000 |
| library | 390 | 25.5 → 23 | 0.001 → 0.000 |
| sheet-semaglutide | 1440 | 5.5 → 2 | 0.000 → 0.000 |
| sheet-semaglutide | 390 | 14.5 → 9 | 0.000 → 0.000 |
| sheet-creatine | 1440 | 2 → 1.5 | 0.000 → 0.000 |
| sheet-creatine | 390 | 13 → 5 | 0.000 → 0.000 |
| sheet-stub-5htp | 1440 | 0.5 → 0.5 | 0.000 → 0.000 |
| sheet-stub-5htp | 390 | 2 → 3 | 0.000 → 0.000 |
| method | 1440 | 2.5 → 0 | 0.000 → 0.000 |
| method | 390 | 1.5 → 0 | 0.000 → 0.000 |
| about | 1440 | 0 → 0 | 0.000 → 0.000 |
| about | 390 | 0 → 0 | 0.000 → 0.000 |
| status | 1440 | 0.5 → 0 | 0.000 → 0.000 |
| status | 390 | 0 → 0 | 0.000 → 0.000 |
| goals | 1440 | 0.5 → 0 | 0.000 → 0.000 |
| goals | 390 | 0 → 0 | 0.000 → 0.000 |
| goal-weight | 1440 | 3.5 → 2 | 0.001 → 0.001 |
| goal-weight | 390 | 3 → 0 | 0.000 → 0.000 |
| compare | 1440 | 0 → 0 | 0.000 → 0.000 |
| compare | 390 | 0 → 0 | 0.000 → 0.000 |
| compare-pair | 1440 | 6.5 → 6 | 0.000 → 0.000 |
| compare-pair | 390 | 5 → 3.5 | 0.000 → 0.000 |
| weekly | 1440 | 0 → 0 | 0.000 → 0.000 |
| weekly | 390 | 0 → 0 | 0.000 → 0.000 |
| weekly-issue | 1440 | 0.5 → 0 | 0.000 → 0.000 |
| weekly-issue | 390 | 0 → 0 | 0.000 → 0.000 |
| founders | 1440 | 4 → 0.5 | 0.000 → 0.000 |
| founders | 390 | 4.5 → 1.5 | 0.000 → 0.000 |
| story | 1440 | 1 → 0.5 | 0.000 → 0.000 |
| story | 390 | 0 → 0 | 0.000 → 0.000 |
| privacy | 1440 | 0 → 0 | 0.000 → 0.000 |
| privacy | 390 | 0 → 0 | 0.000 → 0.000 |
| terms | 1440 | 0 → 0 | 0.000 → 0.000 |
| terms | 390 | 0.5 → 0 | 0.000 → 0.000 |
| asksig | 1440 | 11 → 8 | 0.027 → 0.001 |
| asksig | 390 | 8 → 6.5 | 0.000 → 0.000 |
| ai | 1440 | 8 → 7.5 | 0.027 → 0.001 |
| ai | 390 | 7.5 → 8 | 0.000 → 0.000 |
| my | 1440 | 3 → 0 | 0.074 → 0.000 |
| my | 390 | 0 → 1.5 | 0.000 → 0.000 |
| plan | 1440 | 0.5 → 0 | 0.000 → 0.000 |
| plan | 390 | 1.5 → 0 | 0.000 → 0.000 |
| notfound | 1440 | 2 → 0.5 | 0.030 → 0.008 |
| notfound | 390 | 0.5 → 0.5 | 0.000 → 0.000 |
| **all pages** | | **259.5 → 161** | **0.275 → 0.011** |

Pictures:

- `front-page-1440.jpg`: the top while the Signal loads and once it has, before and after. The line marks where the headline settles.
- `front-page-390.jpg`: the same on a phone.
- `ask-sig-waiting-and-in.jpg`: Ask Sig's community lines waiting in their places, then filled.
- `front-page-opening-while-busy.jpg`: the opening keeps playing while the page's main thread is held busy for 0.7 s, because the compositor moves it. Only the score's count waits.

## Scrolling the front page

A 9,000px scroll down the front page after it has opened: the browser's own scroll gesture, two runs each, medians.

| Device | Frames dropped, before → after | Pauses over 50 ms | Script time on the main thread |
|---|---|---|---|
| Laptop, full speed | 88.5 → 43 | 0.5 → 0 | 2.2 s → 0.4 s |
| Phone size, full speed | 62.5 → 23 | 1 → 0 | 1.8 s → 0.3 s |
| Laptop, processor slowed 4x | 440 → 300 | 58 → 20.5 | 3.6 s → 1.0 s |
| Phone, processor slowed 4x | 385 → 235.5 | 50.5 → 14 | 3.1 s → 1.0 s |

With the processor slowed, much of what's left is the browser's own drawing of the page. This test machine draws without a graphics card, so a real device should do better there.
