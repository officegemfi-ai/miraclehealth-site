# miraclehealth.us

The front page of Miracle Health, at https://miraclehealth.us. The community itself
lives at https://community.miraclehealth.us (the `miracle-health-community` repository).

Static pages with no tracking and no cookies, served by GitHub Pages from the `main`
branch: the front page (no scripts), and the Library at /library. The look: a full-width photo (shown exactly as supplied, with
the headline on its sky) under a dark see-through header,
paper-white sections between deep green-black bands, lime accents, frosted "glass"
cards, Inter headlines, Plus Jakarta Sans text, IBM Plex Mono labels, and Sig, the
Community Signal in person. The colors stay the same whatever the visitor's device is
set to. On phones the links sit behind a Menu button, which works without scripts.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The front page |
| `styles.css` | Its look (the page's security policy allows only its own files, so no inline styles) |
| `privacy.html`, `terms.html` | The privacy notice and terms of use, at /privacy and /terms (the community app links to the privacy notice at sign-up) |
| `404.html` | Shown for any address that doesn't exist |
| `img/` | The photos, as WebP in a few widths so phones get the small ones (`hero-*` at the top, `report-*` and `move-*` in How it works) |
| `og.jpg` | The picture shown when someone shares the link |
| `CNAME` | Tells GitHub Pages this site is miraclehealth.us |
| `.nojekyll` | Serves the files as they are, with no Jekyll build |
| `sitemap.xml`, `robots.txt` | For search engines (the sitemap is written by the library build) |
| `fonts/` | The three typefaces, under the SIL Open Font License (see `fonts/README.md`) |

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
| `scripts/build_library.mjs` | Writes `library/index.html`, `library/<id>/index.html` and `sitemap.xml` from the data. Run `node scripts/build_library.mjs` after changing the data, and commit what it writes (`--check` says whether the pages are up to date) |
| `library/library.css`, `library/library.js` | The library's look, and its script: search and filters, and the live numbers |
| `library/signalviz.js` | The drawings (the rose, the Signal's flow, the takeover line, the seals), copied from the community's `web/lib/signalviz.js` |

The live numbers come from https://community.miraclehealth.us/snapshot.json, which the
community's site build refreshes every hour: aggregate totals only (no posts, no names,
side effects only once three reports mention them). The pages work without it, minus the
numbers. The library pages' security policy allows only their own files plus reading that
one address.

## Changing it

Edit `index.html` on GitHub (the pencil icon) and commit. The site updates in a minute
or two.

The "Now open" line above the headline at the top and the dark band near the bottom
say the community is open and free for adults; change them there if that changes.

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
