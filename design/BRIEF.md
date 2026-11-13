# The design department: brief for every member

You are one member of Miracle Health's design department. The site must be clean, well formatted, consistent and symmetric in every detail. Your job is to **audit** one area across the whole site and report concrete, checkable findings with exact fixes. The art director (the session that briefed you) applies them, so **do not edit any file**. Write only under `.design/`.

## The rules
- **The look: pages 15 to 18 of the design canvas** ("Miracle Health hero: the Library as a network"): black and electric blue. Page 15 is the front page and the kit, page 16 every website page (one board per page template), page 17 every community screen, page 18 How it works. Later decisions in `design/decisions.md` win over the boards; read its last entries first:
  - **the plain frame** (November 12): no window box, tabs, path line or status bar on the website; a top bar and a side panel that starts closed;
  - **the Signal's card and Sig's card** in How it works' language (square frame, the number in its box, title in mono, dividers with a gap by the tree), their rings in 3D (`lib/ring3d.js`);
  - **square corners** for cards in that language (How it works' six, the Signal's and Sig's cards, the example run, and on Ask Sig the window, its answer cards, ways to start and box to write in);
  - **Ask Sig's typing bar** (November 13): its own place at the foot of the conversation; the page never scrolls.
  The boards are not attached this time: hold each page against the brand book, the decisions and the other pages. Where the brand book disagrees with a decision or with what was built on purpose, say so as a finding in the book (the book is corrected, not the page).
- **The brand book:** `design/BRAND.md`. Read it first; its last section, *The Sig system*, is the short version (parts of it are older than the plain frame: check them).
- **The tokens:** `design/tokens.json`, every colour, type style, spacing, size, radius and shadow, with what each is for.
- **The illustration system:** `design/illustration.md`.
- **The frame of every website page** (BRAND.md, *The frame*):
  - top bar `.os-top` (60px, sticky): menu button, logo, search (⌘K), Ask Sig, Join;
  - side panel `.os-side` (272px), closed until the menu button opens it, over the page, at every width;
  - the page across the window's whole width (up to 2400px; margin from 16px to 96px), then the foot.
  - **Ask Sig** (`/sig/`) is the exception: Sig's terminal window (title bar with the chats as tabs, the conversation, the agents and the screen on the right, a status bar), beside its own side panel (open on a wide screen).
- **The community app** (community.miraclehealth.us, `/home/claude/miracle-health-community`, styles in `web/styles.css`, the shared kit in `web/kit/`) is in this audit too. It shares the brand; hold it against the website's current frame and decisions as well as its own screens.
- **Never propose:** removing or hiding a navigation panel or menu; changing what the copy says (casing and format are fine); doses, sellers or prices.

## The site
- **Stylesheets:** `styles.css` (main), `library/library.css`, `ai/*.css` (Ask Sig), `kit/kit.css` (shared with the community app; change it in both), `pages/pages.css`, `my/my.css`.
- **Pages:**
  - built by `scripts/build_library.mjs` and `scripts/build_pages.mjs`;
  - hand-written: `index.html`, `privacy.html`, `terms.html`, `404.html`;
  - drawn with JS: `home.js`, `library/library.js`, `ai/*.js`, `my/`, `plan/`.

## What you work from
- **The capture** (the art director has run it): `.design/shots/<page>@<width>.jpg` (full page) and `.design/data/<page>@<width>.json`.
  - Each data file has every visible element's selector, text, box and computed type, colour, border, radius, spacing and shadow.
  - Widths: 1440, 1024, 768 and 390.
  - The website's pages: `design/pages.json` (the live Signal answered from a saved copy, so the numbers show as they do live).
  - The community's screens: `design/pages-community.json`, captured as `comm-*` (signed in as a new member of the preview's sample community; `comm-signin` is the sign-in screen). If `.design/shots/comm-home@1440.jpg` is missing, the capture is still running: `tail /tmp/sx/capture-comm.log` ends with "exit" when it's done.
- **The helpers:** `import sys; sys.path.insert(0, 'scripts'); import design_data as ds`. They give:
  - `ds.load(page, width)` (community screens too, by their `comm-*` name) and `ds.all_pages()` (the website's);
  - `ds.usage('fs')`;
  - `ds.nearest_token(colour)`;
  - `ds.contrast(fg, bg)`;
  - `ds.EFFECTIVE_BG_JS`, for real contrast in a live page.
- **Live pages:**
  - the website at `http://127.0.0.1:8765` (use `/privacy.html`, `/terms.html` and `/404.html`); it can't reach the live Signal from here, so route `**/functions/v1/signal**` to `/tmp/sx/signal-live.json` in your own captures, or the front page shows its "didn't load" state;
  - the community's preview at `http://127.0.0.1:8767/#/home` (signed in; each load takes about 15 seconds to set up the sample community, so wait for a `a[href^="#/post/"]` link) and its sign-in screen at `http://127.0.0.1:8768/`.
- **Your own captures:** use Playwright for Python with Chrome (`/usr/bin/google-chrome`). Save evidence crops to `.design/evidence/<your-role>/` and look at them before you report.
- **The static check:** `node scripts/design_check.mjs --list` lists off-brand colours, families, radii and sizes by file and line.

## What you report
Write `.design/reports/<your-role>.md`:
1. **The state of your area,** in one line.
2. **Findings, most visible first** (at most 30). Each finding has:
   - an ID;
   - a severity: high (breaks layout or shows on many pages), medium or low;
   - the pages and widths;
   - the selectors, with the file and rule;
   - the evidence: measured values, and the path to the image;
   - the brand rule it breaks;
   - the exact fix: file, selector, and property from old value to new value. Fix the shared rule rather than each page.
3. **Systemic:** what should be one thing everywhere but isn't, and the one value to standardise on.
4. **The next update, in your area:** the three to five changes that would most raise the whole system's quality (website and community together), beyond the fixes above, each with the pages it touches and why. Keep to the brand and the decisions; nothing that removes navigation.

Report only verified problems, not taste. Reply with the number of findings by severity and the top five.
