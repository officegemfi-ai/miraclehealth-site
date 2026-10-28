# miraclehealth.us

The front page of Miracle Health, at https://miraclehealth.us. The community itself
lives at https://community.miraclehealth.us (the `miracle-health-community` repository).

One static page with no scripts, no tracking and no cookies, served by GitHub Pages
from the `main` branch. The look: a full-width photo (shown exactly as supplied, with
the headline on its sky) under a dark see-through header,
paper-white sections between deep green-black bands, lime accents, frosted "glass"
cards, Inter headlines, Plus Jakarta Sans text, IBM Plex Mono labels, and Sig, the
Community Signal in person. The colors stay the same whatever the visitor's device is
set to. On phones the links sit behind a Menu button, which works without scripts.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Its look (the page's security policy allows only its own files, so no inline styles) |
| `privacy.html`, `terms.html` | The privacy notice and terms of use, at /privacy and /terms (the community app links to the privacy notice at sign-up) |
| `404.html` | Shown for any address that doesn't exist |
| `img/` | The photos, as WebP in a few widths so phones get the small ones (`hero-*` at the top, `report-*` and `move-*` in How it works) |
| `og.jpg` | The picture shown when someone shares the link |
| `CNAME` | Tells GitHub Pages this site is miraclehealth.us |
| `.nojekyll` | Serves the files as they are, with no Jekyll build |
| `fonts/` | The three typefaces, under the SIL Open Font License (see `fonts/README.md`) |

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
