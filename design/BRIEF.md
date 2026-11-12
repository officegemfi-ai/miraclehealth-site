# The design department: brief for every member

You are one member of Miracle Health's design department. The site must be clean, well formatted, consistent and symmetric in every detail. Your job is to **audit** one area across the whole site and report concrete, checkable findings with exact fixes. The art director (the session that briefed you) applies them, so **do not edit any file**. Write only under `.design/`.

## The rules
- **The brand book:** `design/BRAND.md`. Read it first.
- **The tokens:** `design/tokens.json`, every colour, type style, spacing, size, radius and shadow, with what each is for.
- **The illustration system:** `design/illustration.md`.
- **Every page is a window in Sig's terminal:**
  - side panel `.os-side` (272px; a drawer on phones);
  - title bar `.win-title` (44px);
  - path line `.win-path` (34px);
  - page `main.win-body`;
  - foot `footer.win-foot`;
  - status bar `.win-status` (28px);
  - a 16px gap round the window on a desktop.
- **Never propose:** removing or hiding a navigation panel or menu; changing what the copy says (casing and format are fine); doses, sellers or prices.

## The site
- **Stylesheets:** `styles.css` (main), `library/library.css`, `ai/*.css` (Ask Sig), `kit/kit.css` (shared with the community app; change it in both), `pages/pages.css`, `my/my.css`.
- **Pages:**
  - built by `scripts/build_library.mjs` and `scripts/build_pages.mjs`;
  - hand-written: `index.html`, `privacy.html`, `terms.html`, `404.html`;
  - drawn with JS: `home.js`, `library/library.js`, `ai/*.js`, `my/`, `plan/`.

## What you work from
- **The capture:** `python3 scripts/design_capture.py` (the art director usually runs it first) writes `.design/shots/<page>@<width>.jpg` (full page) and `.design/data/<page>@<width>.json`.
  - Each data file has every visible element's selector, text, box and computed type, colour, border, radius, spacing and shadow.
  - Widths: 1440, 1024, 768 and 390.
  - The page list: `design/pages.json`.
- **The helpers:** `import sys; sys.path.insert(0, 'scripts'); import design_data as ds`. They give:
  - `ds.load(page, width)` and `ds.all_pages()`;
  - `ds.usage('fs')`;
  - `ds.nearest_token(colour)`;
  - `ds.contrast(fg, bg)`;
  - `ds.EFFECTIVE_BG_JS`, for real contrast in a live page.
- **Live pages:** `http://127.0.0.1:8765` (the capture starts it). Use `/privacy.html`, `/terms.html` and `/404.html` locally.
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

Report only verified problems, not taste. Reply with the number of findings by severity and the top five.
