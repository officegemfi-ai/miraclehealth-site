# miraclehealth.us

The front page of Miracle Health, at https://miraclehealth.us. The community itself
lives at https://community.miraclehealth.us (the `miracle-health-community` repository).

Static pages with no tracking and no cookies, served by GitHub Pages from the `main`
branch: the front page (no scripts), the Library at /library, Ask Sig, the chat with Sig (Miracle Health's AI) that
speaks for the studies and the whole community, on its own page at /sig (the old address /ai goes on to it), and My Miracle, what a member keeps on their device, at /my. The look is Graphite: graphite pages (the same as Sig's terminal), near-white type with two quiet greys, Mona Sans
for the words (headlines set wide and heavy), Monaspace Neon for labels and everything measured,
plates (cards and figures) with hairline frames, and the one main action on a page in white. Colour is a
signature: it shows only where one of Sig's agents signs what it made, lime for the community and its
Signal, blue for the Evidence librarian's grades, each other agent in its own colour on Ask Sig. No photographs: the Library's graph is the picture. The colors stay the
same whatever the visitor's device is set to. On phones the links sit behind a Menu button, which
works without scripts.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The front page: "Peptides, without the sales pitch." At the top, the Library as one graph (below); a search box straight into the Library, what the Library, the Community Signal and Sig each do, one real compound (BPC-157) with the studies, what people report and the placebo figures side by side, what we won't do, questions and joining. The counts marked `<!-- count:… -->` are filled in by the library build, so they always match the Library |
| `home.js` | The front page's one script: starts the graph at the top (`lib/graph.js`, loaded after the page) and ties it to the search box, the "Jump to" chips and the Signal card; brings the real compound's Community Signal, what people report and the placebo figures up to date from the community's public files, and draws its bars in once. What the studies show is written into `index.html` from the fact sheet, caveats included; without the script the page keeps what it was published with |
| `sig/` | Sig's own page, miraclehealth.us/sig, filling the browser window like ChatGPT's or Claude's: `index.html` (written by the library build, with the scripts and styles in `ai/`), and `sig.webmanifest` with its icons (Sig's ring), so it can be added to a phone's home screen or installed like an app |
| `ai/` | Ask Sig, the chat with Sig, Miracle Health's AI: `ai.css`, `term.css` and `ai.js`, for Sig's page at /sig. Here `index.html` and `go.js` (written by the library build, `scripts/build_pages.mjs`) send the old address, /ai, on to /sig with any question or stack in the link, so every link made before still works. People talk about improving with peptides, supplements and hormones; the answers come from the community's `ask` function (miracle-health-community, `supabase/functions/ask`), streamed with each agent's steps. Every answer speaks for two voices and says which is which: what the studies show (the Library's fact sheets) and what the community reports (the Community Signal's totals from members' first-hand reports and public forum data). The page is Sig's health terminal (`term.css`, over `ai.css`), filling the browser window: a side panel (a new chat; the chats kept on this device, newest first, each to open or delete, and "Delete all chats", asked once more; the four places and signing in, so the site's navigation stays), beside the window on a wide screen, where it folds away, and sliding in over it from the ☰ on a narrower one; then the window, with a title bar (Sig's mark, the ring of the ten agents and the community, each in its own colour from `lib/ring.js`, with the Interpretation agent's white dot at its centre; the chats as tabs, like a browser's, each named by its first question, with + for a new one and × to close one; on a phone they sit in the conversation's header) and a status bar (ready, working, writing, done and how long it took; the Library's last update) that stay put while the conversation scrolls between them (in its pane on a wide screen; on a phone the page scrolls). The chats are kept on this device (localStorage: a list, and each chat under its own key, so two windows of Sig don't write over each other, and a chat deleted in one closes in the other), never on our servers, until they're deleted; the 60 most recent are kept, and a full device lets the oldest go. Which chats are open as tabs belongs to the browser tab (sessionStorage), like a browser window's tabs; closing a tab keeps its chat in the list. Chats from before, kept only in a browser tab, join the list once. A question or a stack sent in a link (a Library page, the community, My Miracle) opens in a chat of its own, typed in and not sent. Sig answers one question at a time: while it answers in one chat, the others can be read but wait to send, and closing a chat stops its answer. The question is echoed at the prompt; each agent's steps stream in as numbered log lines in its colour, and fold into one line once the answer is being written. Every paragraph and bullet of the answer carries a coloured rule and a line naming the agent it comes from and what kind of part it is (the bottom line, the studies, the forums or members, blood tests, good to know, the next step), told from its words; the studies are the Evidence librarian's blue and the community its lime, so the two voices stay apart, and screen readers hear which after each part. The cards keep their layout, with the agent that made each over it; the line saying what the answer was drawn from is the key. Sig asks no questions: the clinician card lists points to discuss, and the last card, when someone asks whether compounds they name could help with something, is the Interpretation agent's efficacy read: each step of its reasoning, strongest evidence first, then its verdict (likely, plausible but unproven, unlikely or unclear), how big the effect could be, how sure anyone can be and what would change that, in plain words at the end. Safety notes read as information, never alarm. When the screen shows their own stack, the chat says in one line what the check found and how many safety notes and blood markers are on the screen, and opens it. Where the studies don't answer the question, the community's reports lead; each compound shows both side by side, a question about what the community rates highest gets its list (reports, not recommendations), and each answer ends with what it was drawn from. The first screen shows the live crowd from the community's public snapshot. Beside the chat on wide screens, two tabs: the agents (the ring lights piece by piece as each one reports, and each one's line says what it's doing or did, or before anyone asks, what it's for), in front while they work, and the screen, in front once an answer about something is done (a tab picked by hand during an answer stays picked). The screen (`screen.js`, `screen.css`) is laid out like a code editor: the compounds the conversation is about (the latest stack card, or the agents' steps). At the top, one plain sentence (where they meet in the body, or that they don't) and a row of checks that each jump to their part: the fact sheets, the community's reports of taking them together, what Sig's Synergy auditor found, the cautions, the blood markers and where they meet. Then the code: "together" lines them up place by place, head to toe, one column per compound, with where they meet lit and a strip on the right marking it and the cautions; each compound's own tab has its lines in its fact sheet's order. When the question is about a goal ("is HGH plus enclomiphene good for fat loss?"), the sentence at the top says where the evidence for it stands, and the screen opens on an "evidence" tab: the agents' evidence ladder (Sig's `ladder` event), one rung per row and one column per compound: its own studies on that goal (with how strong, and their source numbers), what a relative's studies show a rung below (testosterone's for enclomiphene, which raises it; tesamorelin's for HGH, from `library/data/axes.json`), how it could bear on it from its fact sheet (expected, not tested), and what people report; then how they relate and whether anyone has reported taking them together. The clinician's copy carries the same ladder. Every line comes from `library/data/body.json` (what it acts on, what rises, what it blocks, what's worth checking, what to watch for, each linked to the numbered source on its fact sheet). Then panels: what the community reports on the exact combination (its own Community Signal when members have reported taking them together, said plainly when nobody has) and on each one alone; what the auditor found; the blood markers each fact sheet lists as worth checking (pick one to light the lines that move it; a clinician decides what to test); and what Sig's agents did. Last, "Take this to your clinician": questions to copy, with the markers, sources and checks, and the stack to keep in My Miracle (on this device only). On phones and narrow windows the screen is a sheet that pulls up over the chat from a bar above the box to write in, which says what's on it; it opens on the rows that matter (where they meet and the cautions), with the rest one tap away. It only draws what the chat's cards and steps say, and nothing on it reads a member's own results. Its "Try it" button asks Sig about HGH + enclomiphene. Every compound with a fact sheet is drawn (122): HGH, enclomiphene and SS-31 by hand first, then all of them drafted from their sheets by drawing agents, read line by line against each sheet by a separate reviewer, and corrected. `scripts/draw_body.md` has the rules (places, ops, markers, cited sources, no doses, how weak evidence is labeled), and `scripts/check_body.mjs` checks every entry against them and its sheet in CI, warning when a sheet changes after its entry was drawn; to draw a new compound, follow the first and pass the second (`--drafts`, then `--merge`). The build splits `body.json` into `library/data/body/` (an index, and one file per compound), and the screen loads only the compounds it shows; Sig's server reads `body.json` itself. Sig no longer makes clinician review packets: `ai/packet/` still opens links made before November 5, 2026 (`packet.js`, `packet.css`), and `packet.js`'s QR code maker serves My Miracle; `vendor/qrcode.js` is qrcode-generator 2.0.4 (MIT), loaded only when someone asks for a code |
| `styles.css` | Its look (the page's security policy allows only its own files, so no inline styles) |
| `kit/` | Miracle Health's design kit, shared with the community app so the two look like one product: `kit.css` (the palette and type, Sig's moves) and `kit.js` (the bar of the four places on every page, Library · Ask Sig · Community · My Miracle; the evidence meter; the Community Signal number; compound tiles and chips; Sig; and the links one place opens in another, like a question typed into Sig or a check-in drafted as a community post). Copied from the community's `shared/kit` by its `scripts/sync_kit.sh`; the community's checks fail if the copies here differ. Don't edit them here. The library build writes the bar, menu and footer into every page, the hand-written ones too, and the kit's version into every script that imports it |
| `lib/` | The website's own helpers, shared by its scripts and kept here only (they make elements, where the kit makes markup): `dom.js` (an element from a tag, its attributes and children; our own SVG drawings as nodes; a public JSON file, or nothing), `ring.js` (Sig's mark on Ask Sig: the ring of the eleven who gather what's known, with the Interpretation agent at its centre, drawn by the library build and by `ai/ai.js`) and `pack.js` (data packed into the part of a link after "#": URL-safe base64 and compression), for the plan, the clinician's copy and My Miracle's link to another device. `graph.js` draws the front page's graph (below). Like the kit, the library build writes their versions into every script that imports them (`SHARED` and `IMPORTERS` in `scripts/build_library.mjs`: a new script that imports one goes in `IMPORTERS`) |
| `my/` | My Miracle, at /my (written by the library build, with `my.css` and `my.js`): what a member keeps on a device, together. Their Miracle Plan and its ticks, how it's going (one-tap check-ins, which can become a community post they edit and post there), their saved stack with each compound's evidence and Signal, their spaces in the community, a link and QR code that move it all to another device after "#", and a way to forget it. All of it lives in the browser's own storage |
| `privacy.html`, `terms.html` | The privacy notice and terms of use, at /privacy and /terms (the community app links to the privacy notice at sign-up) |
| `about/`, `status/`, `goals/`, `compare/`, `weekly/`, `founders/` | Written by the library build (`scripts/build_pages.mjs`): who runs Miracle Health, how it's paid for, reviewers and corrections (`library/data/about.json`); where each compound stands with the FDA, from the fact sheets; the compounds people take for each of the twelve goals; two compounds side by side; The Signal, the weekly email: signing up and each issue (`library/data/weekly/<n>.json`, with the email itself at `weekly/<n>/email.html`); and the first 100 founding reporters. `pages/pages.css` and `pages/pages.js` (live Signals, the founders' count and the method page's check of the Signal against the studies) |
| `img/og/`, `img/og-plan.jpg` | Share images for those pages and for a shared plan, in Graphite like the site, made by `scripts/og_images.mjs` (needs Playwright; run it by hand, then the library build) |
| `404.html` | Shown for any address that doesn't exist |
| `img/` | The share images and the graph's still picture. Plate uses no photographs: the photos the site had (`hero-*`, `report-*`, `move-*`, `library-*`, `join-*`, as WebP in a few widths) are kept, unused, in case they're wanted back |
| `og.jpg` | The picture shown when someone shares the link (made by `scripts/og_images.mjs`, with the others) |
| `CNAME` | Tells GitHub Pages this site is miraclehealth.us |
| `.nojekyll` | Serves the files as they are, with no Jekyll build |
| `sitemap.xml`, `robots.txt` | For search engines (the sitemap is written by the library build) |
| `fonts/` | The typefaces, under the SIL Open Font License (see `fonts/README.md`) |

## The graph at the top of the front page

The Library as one graph: the 122 compounds with full fact sheets gathered round an axis of the
38 places in the body, head to toe, each joined to the places its sheet names by that sheet's
lines (985 of them; brighter where a line cites two or more sources), with the 37 blood markers
in their lab panels to one side. Sig, at the top, traces one compound at a time down the axis,
and the blood markers its sheet says may move read out as it passes; it also traces the blends
whose parts are all drawn (Wolverine, GLOW, KLOW and the rest), their parts together, lighting the
places they share and adding up their cautions. Pointing at a dot traces it and clicking it opens
its fact sheet (on a touch screen, the first tap traces, a second opens); pointing at a place or a
marker shows what the Library says about it. What's typed into the search box lights up as the
Library's search would find it, and one compound or blend found that way is traced. Beside what's
traced: its Community Signal in coral, when it has one (the Signal card follows it too), and a
link that asks Sig about it.

It's drawn with WebGL 2 where a browser has it (the lines and points add up as light, with a
glow over the brightest and a faint shell of dust for depth), and on a 2D canvas where it
doesn't; the labels are on a 2D canvas on top. Under reduced motion it's one still frame, which
still answers pointing; it stops while it's off screen.

| File | What it is |
| --- | --- |
| `scripts/graph.mjs` | Lays the graph out from `library/data/body.json` and the catalog (a force simulation from a fixed seed, so the same Library always gives the same graph) whenever the library build runs, so the graph changes when the Library does. Writes `library/data/graph.json` and `img/library-graph.svg`, and gives the build the legend, the count of what the lines say and the graph as text for the front page (its `<!-- graph:… -->` markers) |
| `library/data/graph.json` | What the graph draws: where each point sits, the lines, the blends, the search words, Sig's tour (written by the build) |
| `img/library-graph.svg` | The graph standing still, drawn with the same camera as the live one: shown until the script starts, and without scripts (written by the build) |
| `lib/graph.js` | Draws it, turns it, traces and lights up (WebGL 2, or a 2D canvas) |
| `tests/graph.test.mjs` | The same Library gives the same graph; every fact sheet and every fully drawn blend is in it; the search folds words as the Library's does; the downloads stay small |

The page's styles place the graph (`--gx`, `--gy`, `--gu`, `--guh`, `--gcap` on `.net` in
`styles.css`); the script and the still picture both read them, so they line up.

## The weekly email

Every page's footer (and /weekly/) has a sign-up form: a plain form, sent to the community's
`newsletter` function (miracle-health-community, `supabase/functions/newsletter`), which keeps
the address, emails a link to confirm it once an email account is connected (Resend), and comes
back to /weekly/#… to say what happened. To publish an issue, add `library/data/weekly/<n>.json`,
run the library build and push; then run **Weekly email** in the community repository's Actions
with *send* and the issue number. Nothing is emailed to an address until it's confirmed.

## Checks

`.github/workflows/check.yml` runs on every push: the built pages match their sources
(`node scripts/build_library.mjs --check`), no link between the site's pages is broken
(`node scripts/check_links.mjs`), the scripts' tests pass (`node --test tests/*.test.mjs`), every
page has its security policy, title and description, and every script parses.

## The Library (/library)

A page for each of the 300 compounds and blends in the community's library: what it is,
what the studies show (each claim with its kind of evidence and a link to the source),
risks, who should talk to a clinician first, blood markers to watch, key studies, US status
and sources, next to the live Community Signal: the overall rating, ratings by use, how
first-hand reports went, side effects members mention and where it sits on the takeover
line. No doses, no sellers.

| File | What it is |
| --- | --- |
| `library/data/catalog.json` | Every compound and blend (exported from the community's database) |
| `library/data/entries/<id>.json` | The fact sheets: every claim checked against a source we opened, with its link. Each page says "Fact-checked … · clinician review pending" until a clinician has read it |
| `library/data/uses.json` | The twelve goals and the uses members report on (a copy of the community's `shared/uses.json`) |
| `library/data/index.json` | What Sig reads to find and rank compounds: every compound with its family and aliases, plus the status, evidence grade and goals of those with a fact sheet (written by the build) |
| `scripts/build_library.mjs` | Writes `library/index.html`, `library/<id>/index.html`, `library/data/index.json`, the front page's graph (`library/data/graph.json`, `img/library-graph.svg`, with `scripts/graph.mjs`), Sig's page (`sig/index.html`), the page that opens old packet links (`ai/packet/index.html`) and `sitemap.xml` from the data. Run `node scripts/build_library.mjs` after changing the data, and commit what it writes (`--check` says whether the pages are up to date) |
| `library/library.css`, `library/library.js` | The library's look, and its script: search and filters, and the live numbers |
| `library/signalviz.js` | The drawings (the rose, the Signal's flow, the takeover line, the seals), part of the design kit: copied from the community's `shared/kit/signalviz.js` |
| `library/research/` | How the fact sheets are researched: `BRIEF.md` (the rules every entry follows), `NEXT_ROUND.md` (what's already confirmed, and where to pick up), `batches/` (the 300 entries in groups of 12; the ones without a file in `data/entries/` are still to do) and `validate.py` (checks every entry) |

The live numbers come from https://community.miraclehealth.us/snapshot.json, which the
community's site build refreshes every hour: aggregate totals only (no posts, no names,
side effects only once three reports mention them). The pages work without it, minus the
numbers. The library pages' security policy allows only their own files plus reading that
one address.

## Changing it

Edit `index.html` on GitHub (the pencil icon) and commit. The site updates in a minute
or two.

The line above the headline at the top, the questions near the bottom and the dark band
under them say the site is independent and free for adults; change them there if that
changes. The real compound's "What the studies show" column is copied from its fact sheet
(`library/data/entries/bpc157.json`); update it there too when the fact sheet changes.

The site shows no photographs: the top of the front page is the graph, which changes with
the Library, and the rest is type on plates. The photos it used to show are still in `img/`,
unused, in case they're wanted back; a photo goes back in by adding its `<img>` where it was
(the page's history has each one).

## Domain

GitHub Pages: Settings > Pages > Build and deployment: "Deploy from a branch", `main`,
`/ (root)`. Custom domain `miraclehealth.us`, with Enforce HTTPS on.

The DNS records at Namecheap (Advanced DNS) for miraclehealth.us:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `officegemfi-ai.github.io.` |
| CNAME | `community` | `officegemfi-ai.github.io.` (the community) |
| TXT | `_github-pages-challenge-officegemfi-ai` | GitHub's proof that this account owns the domain |

www.miraclehealth.us forwards to miraclehealth.us on its own.
