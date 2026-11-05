# miraclehealth.us

The front page of Miracle Health, at https://miraclehealth.us. The community itself
lives at https://community.miraclehealth.us (the `miracle-health-community` repository).

Static pages with no tracking and no cookies, served by GitHub Pages from the `main`
branch: the front page (no scripts), the Library at /library, Ask Sig, the chat with Sig (Miracle Health's AI) that
speaks for the studies and the whole community, at /ai, and My Miracle, what a member keeps on their device, at /my. The look: a full-width photo (shown exactly as supplied, with
the headline on its sky) under a dark see-through header,
paper-white sections between deep green-black bands, lime accents, frosted "glass"
cards, Inter headlines, Plus Jakarta Sans text, IBM Plex Mono labels, and Sig, the
Community Signal in person. The colors stay the same whatever the visitor's device is
set to. On phones the links sit behind a Menu button, which works without scripts.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The front page: "Peptides, without the sales pitch." A search box straight into the Library, what the Library, the Community Signal and Sig each do, one real compound (BPC-157) with the studies, what people report and the placebo figures side by side, what we won't do, questions and joining. The counts marked `<!-- count:… -->` are filled in by the library build, so they always match the Library |
| `home.js` | The front page's one script: brings the real compound's Community Signal, what people report and the placebo figures up to date from the community's public files, and draws its bars in once. What the studies show is written into `index.html` from the fact sheet, caveats included; without the script the page keeps what it was published with |
| `ai/` | Ask Sig, the chat with Sig, Miracle Health's AI, at /ai (and the short link /sig/, in `sig/`): `index.html` (written by the library build), `ai.css` and `ai.js`. People talk about improving with peptides, supplements and hormones; the answers come from the community's `ask` function (miracle-health-community, `supabase/functions/ask`), streamed with each agent's steps. Every answer speaks for two voices and says which is which: what the studies show (the Library's fact sheets, drawn on paper) and what the community reports (the Community Signal's totals from members' first-hand reports and public forum data, drawn in ink and lime). Where the studies don't answer the question, the community's reports lead; each compound shows both side by side, a question about what the community rates highest gets its list (reports, not recommendations), and each answer ends with what it was drawn from. The first screen shows the live crowd from the community's public snapshot. The conversation stays in the visitor's browser tab. Beside the chat sits the screen (`screen.js`, `screen.css`; on phones and narrow windows, a Chat | Screen switch in the bar): the compounds the conversation is about (the latest stack card, or the agents' steps), drawn as code. Each compound's lines say what it does in the body, place by place, from `library/data/body.json` (what it acts on, what rises, what it blocks, what's worth checking, what to watch for, each line linked to the numbered source on its fact sheet); then where they meet; then the blood markers each fact sheet lists as worth checking (pick one to light the lines that move it; a clinician decides what to test); what the community reports on the exact combination (its own Community Signal when members have reported taking them together, said plainly when nobody has) and on each one alone; and what Sig's Synergy auditor found. It only draws what the chat's cards and steps say, and nothing on it reads a member's own results. Its "Try it" button asks Sig about HGH + enclomiphene. To draw another compound, add its lines to `body.json`, with sources numbered as on its fact sheet. Sig no longer makes clinician review packets: `ai/packet/` still opens links made before November 5, 2026 (`packet.js`, `packet.css`), and `packet.js`'s QR code maker serves My Miracle; `vendor/qrcode.js` is qrcode-generator 2.0.4 (MIT), loaded only when someone asks for a code |
| `styles.css` | Its look (the page's security policy allows only its own files, so no inline styles) |
| `kit/` | Miracle Health's design kit, shared with the community app so the two look like one product: `kit.css` (the palette and type, Sig's moves) and `kit.js` (the bar of the four places on every page, Library · Ask Sig · Community · My Miracle; the evidence meter; the Community Signal number; compound tiles and chips; Sig; and the links one place opens in another, like a question typed into Sig or a check-in drafted as a community post). Copied from the community's `shared/kit` by its `scripts/sync_kit.sh`; the community's checks fail if the copies here differ. Don't edit them here. The library build writes the bar, menu and footer into every page, the hand-written ones too, and the kit's version into every script that imports it |
| `my/` | My Miracle, at /my (written by the library build, with `my.css` and `my.js`): what a member keeps on a device, together. Their Miracle Plan and its ticks, how it's going (one-tap check-ins, which can become a community post they edit and post there), their saved stack with each compound's evidence and Signal, their spaces in the community, a link and QR code that move it all to another device after "#", and a way to forget it. All of it lives in the browser's own storage |
| `privacy.html`, `terms.html` | The privacy notice and terms of use, at /privacy and /terms (the community app links to the privacy notice at sign-up) |
| `about/`, `status/`, `goals/`, `compare/`, `weekly/`, `founders/` | Written by the library build (`scripts/build_pages.mjs`): who runs Miracle Health, how it's paid for, reviewers and corrections (`library/data/about.json`); where each compound stands with the FDA, from the fact sheets; the compounds people take for each of the twelve goals; two compounds side by side; The Signal, the weekly email: signing up and each issue (`library/data/weekly/<n>.json`, with the email itself at `weekly/<n>/email.html`); and the first 100 founding reporters. `pages/pages.css` and `pages/pages.js` (live Signals, the founders' count and the method page's check of the Signal against the studies) |
| `img/og/` | Share images for those pages, made by `scripts/og_images.mjs` (needs Playwright; run it by hand, then the library build) |
| `404.html` | Shown for any address that doesn't exist |
| `img/` | The photos, as WebP in a few widths so phones get the small ones (`hero-*` at the top, `report-*` and `move-*` in How it works, `library-*` for the Library's banner, `join-*` behind the Join section) |
| `og.jpg` | The picture shown when someone shares the link |
| `CNAME` | Tells GitHub Pages this site is miraclehealth.us |
| `.nojekyll` | Serves the files as they are, with no Jekyll build |
| `sitemap.xml`, `robots.txt` | For search engines (the sitemap is written by the library build) |
| `fonts/` | The three typefaces, under the SIL Open Font License (see `fonts/README.md`) |

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
(`node scripts/check_links.mjs`), every page has its security policy, title and description, and
every script parses.

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
| `scripts/build_library.mjs` | Writes `library/index.html`, `library/<id>/index.html`, `library/data/index.json`, the Ask Sig page (`ai/index.html`), the page that opens old packet links (`ai/packet/index.html`) and `sitemap.xml` from the data. Run `node scripts/build_library.mjs` after changing the data, and commit what it writes (`--check` says whether the pages are up to date) |
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

To swap a photo, replace the files in `img/` with new ones of the same names and sizes
(the top photo is 2400, 1600 and 960 pixels wide; the other two are 760 and 480 wide,
in portrait).

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
