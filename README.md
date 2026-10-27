# miraclehealth.us

The front page of Miracle Health, at https://miraclehealth.us. The community itself
lives at https://community.miraclehealth.us (the `miracle-health-community` repository).

One static page with no scripts, no tracking and no cookies, served by GitHub Pages
from the `main` branch. It has the community's look: lime on deep green-black, Inter
headlines, Plus Jakarta Sans text, IBM Plex Mono labels, and Sig, the Community Signal
in person. Light and dark follow the visitor's device.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Its look (the page's security policy allows only its own files, so no inline styles) |
| `404.html` | Shown for any address that doesn't exist |
| `og.png` | The picture shown when someone shares the link |
| `CNAME` | Tells GitHub Pages this site is miraclehealth.us |
| `.nojekyll` | Serves the files as they are, with no Jekyll build |
| `fonts/` | The three typefaces, under the SIL Open Font License (see `fonts/README.md`) |

## Changing it

Edit `index.html` on GitHub (the pencil icon) and commit. The site updates in a minute
or two.

When the community opens, change the two "Opening soon" spots in `index.html`: the
status line under the buttons at the top, and the lime band near the bottom.

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
