# The brand after its name: an icon, one line, a format

November 22, 2026. The owner asked "How can we make the unhyped branding better?" The brand as it
stood was read against its own book (`design/BRAND.md`) and four ideas were drawn, one picture each,
with the site's own logo, fonts and colours. The answer: "I like it, now lets expand on it and make
things cool and well branded". The decisions are in `design/decisions.md` ("The brand after its
name").

## What was found

- The browser tab's icon and the pack's app icon were Sig's ring: Sig's face, not Unhyped's, and a
  ring of dots at 16 pixels. Unhyped had no icon of its own, and no icon for a phone's home screen.
- "No miracles. Just what happened." was on two pages (the front page and About). The card every page
  falls back to led with "Peptides, without the sales pitch." instead.
- 301 of the Library's 303 pages shared that one general card, so a shared fact sheet showed nothing
  of its compound.
- Outside the design: every card still carries the old address until the move to theunhyped.com; and a
  skincare brand in India, Unhype, launched in September 2026 with the hashtag #Unhyped.

## The ideas shown

- `idea-1-own-icon.jpg`: the logo's u as the icon, in blue, black or white.
- `idea-2-one-line.jpg`: the line on the general card.
- `idea-3-name-at-work.jpg`: "BPC-157, unhyped." on a card of its own. Drawn there with the compound's
  Signal; built without it, since a saved picture can't follow a score that is checked every minute.
- `idea-4-flat-blue.jpg`: one flat blue for the punchline, no glow. Offered as taste; not built.

## What was built

- `built-1-icon.jpg`: the tab's icon and a phone's, before and after.
- `built-2-cards.jpg`: the general card with the line; four of the 122 fact sheets' cards, each with its
  print; two of the twelve goals' cards.
- `built-3-social.jpg`: the pack's profile picture, the post and the story in the format (their score
  is an example; a post takes it from the live Signal the day it goes out), and the shortest bio.
- `brand-guide-1.jpg`: the pack's guide, page one, with the icon where the ring was.

Checked: the icon's outline is the logo's first letter, point for point (`tests/brand.test.mjs`); every
page links it once for the tab and once for a home screen, Ask Sig keeping its ring there; every fact
sheet's card exists and its headline fits (the script steps its size down until no word runs past its
column); the build, tests, links, design, body, layout, states, clean and Sig checks pass.
