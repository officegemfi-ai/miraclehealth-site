# Ask Sig: only the blood markers beside the chat

November 21, 2026. The owner: "On the Ask sig page, make sure only the markers are shown on the right tab".

The panel beside the chat had three tabs. **Markers** is a rack of test tubes: the blood tests that the compounds in an answer may move. **Mind** was a map of every Community Signal as dots, by family. **Screen** laid the compounds out like code: where they meet in the body, a row of checks, the evidence rung by rung. The request was read as: that panel shows the blood markers and nothing else. Mind and Screen are gone, and with one view left the panel has no tabs. The navigation panel on the left is as it was.

## What changed

| | Before | After |
|---|---|---|
| Beside the chat, on a wide window | three tabs: Markers, Mind, Screen | the blood markers, alone, under one title |
| Under an answer | "See it on the screen" next to Copy | Copy |
| Someone's own stack | one line saying what the check found and how many notes were "on the screen" | the stack laid out in the conversation: each compound, what the Synergy auditor found, "Save on this device" |
| The bar over the box, phone and tablet | `$ sig check hgh + enclomiphene`, chips in the code face, "Swipe up" | "Blood markers", how many tests move, "See them" |
| The sheet that bar opens | the three tabs, as wide as the window on a tablet | the rack, 640px wide at most, in the middle |
| While the next answer is on its way | the last answer's tubes, unchanged until the new answer was finished | the same tubes, dimmed, until the agents name the new answer's compounds; then that answer's own, while Sig is still writing |
| An answer that names no compound | the rack emptied, but the bar kept offering the last answer's screen | the rack empties and the bar goes |
| Tests that are only checked, not moved | "0 blood tests move" | "2 blood tests are checked" |

What the page loads and carries:

| | Before | After |
|---|---|---|
| Its own scripts | 285 KB (90 KB zipped) | 201 KB (64 KB zipped) |
| Its own stylesheets | 132 KB (32 KB zipped) | 110 KB (27 KB zipped) |
| Colours off the brand's palette, site-wide (`design/baseline.json`) | 144 | 114 |
| Type sizes off the scale | 21 | 17 |
| Gradients | 26 | 23 |
| Shadows | 22 | 17 |

`ai/screen.js` (1,049 lines) and `ai/screen.css` (307) are deleted. `ai/mind.js` is `ai/markers.js`, the rack alone. The sheet took the brand's own ground and scrim on the way (it was a green-tinted near-black left from the screen), and lost a shadow that black on black never showed.

## Found on the way: the page could jump up in a long chat

On the live site, after a few questions, a click or a tap in the box to write in dragged the whole app up by about 390px: the title bar left the window and half the window went black (`long-chat-before-after.jpg`, `long-chat-phone.jpg`). A label kept for screen readers at the end of the chat is placed out of the flow, and nothing inside the conversation's pane held it, so in a long chat it hung below the window; the page became taller than the window (1,452px in a 900px one after five short answers), and the next focus scrolled it.

It showed up here because a stack laid out in the conversation makes one answer long enough. The pane now holds what is placed inside it (`ai/term.css`, one declaration), and the page is exactly as tall as the window however long the chat grows.

## Pictures

- `page-before-after.jpg`: the whole page at 1440px, after one answer.
- `panel-before-after.jpg`: the panel's three tabs before, and the one view after.
- `stack-before-after.jpg`: someone's own stack, as a line pointing at the screen and as it is laid out now.
- `phone-before-after.jpg`: the bar over the box and the sheet it opens, at 390px.
- `tablet-before-after.jpg`: the sheet at 1024px.
- `long-chat-before-after.jpg`, `long-chat-phone.jpg`: the page after five answers and a click in the box.

## What did not change

- The navigation panel: the five places, the chats kept on this device, the nine links under "More", signing in. `tests/sig.test.mjs` holds it to every link.
- The rack itself: the same tubes, in the same order, with the same words, drawn from `library/data/body.json`. Direction only, never how much; it never reads anyone's own results.
- The conversation: every element's computed style was dumped on the live code and on the branch at 2560, 1920, 1440, 1024, 768 and 390px, with an answer, without one, with a stack, with a tube picked and with the sheet open. Apart from what the table above lists, the differences are the pane's `position` and where its hidden labels now measure from.
- Sig's server: it still sends the evidence ladder with an answer about a goal. The page no longer draws it or keeps it with a chat.

## Not in this change

- `supabase/functions/ask/markers.ts` in the community repository tells the Markers agent that "the screen lists every marker, so name at most the one or two that matter most". The rack still lists every marker, so the advice holds; the word "screen" there is out of date.
- `lib/dom.js` still names `ai/screen.js` in its opening comment. Every page's scripts carry that file's version, so correcting one comment would restamp 345 pages; it waits for the next real change to that file.

## Checks

`scripts/check_sig.mjs` is new, and runs in CI with the other three browser checks. It is the first check that sees Ask Sig with a conversation on it: Sig answers from a canned stream that arrives in pieces, at 1440, 1024 and 390px, and it fails when anything but the blood markers stands beside the chat, when the rack doesn't keep up with the answers, when the page moves or grows under a long answer, or when the sheet isn't a proper dialog (114 looks, about four seconds). Breaking the page five ways, one at a time, failed it each time: the pane's fix taken out, the sheet waking the closed side panel, the rack not following mid-answer, no dimming, the sheet at the window's width.

`tests/sig.test.mjs` (10 tests) holds the built page to one panel and no tabs, the navigation panel to its links, and the rack to the body map: the tubes it draws for a set of compounds are exactly the blood tests their fact sheets' lines name, its first line is what the bar repeats, and neither the rack nor what it copies for a doctor carries an amount.

`node scripts/build_library.mjs --check`, `node --test tests/*.test.mjs` (51), `node scripts/check_links.mjs`, `node scripts/design_check.mjs` (baseline lowered), `node scripts/check_body.mjs`, `node scripts/check_layout.mjs` (368 views, 16 widths), `node scripts/check_states.mjs` (46 views, 572 focus stops), `node scripts/check_clean.mjs` (46 views; its one exception for Ask Sig's screen is gone with the screen), `node scripts/check_sig.mjs`.
