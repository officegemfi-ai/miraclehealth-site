# Moving to theunhyped.com

November 22, 2026. The owner: "how can we put it on the new domain". Why it's done this way is in
`design/decisions.md` (2026-11-22); how it's set up is in the README's Domain section.

- `old-address-asks-desktop.jpg`, `old-address-asks-phone.jpg`: what miraclehealth.us shows a
  browser that has saved things there (here a stack and two chats; a plan alone on the phone).
  Every other visit goes straight on to the same page at theunhyped.com without showing anything.
- `move-page.jpg`: theunhyped.com/move opened by itself. Opened by the old address, it takes in the
  saved things, says so and closes.

Checked end to end in a real browser, with the old and the new address as two local addresses: a
visit with nothing saved goes straight on (path, `?` and `#` kept, unknown paths too); one with saved
things is asked first, and "Bring them over" brings the stack and both chats, keeps what was already
at the new address, takes nothing that isn't the site's, and lands on the same page, where Ask Sig
lists the chats; the old address then goes straight on; `?bring` asks again; "Go without them" isn't
asked again; /move/ by itself says how, and refuses a page from any other address; the community's
old address goes on to the same place.
