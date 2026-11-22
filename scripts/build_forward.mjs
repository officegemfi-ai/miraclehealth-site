// The two small sites that stay at Unhyped's old addresses once it lives at theunhyped.com
// (README, "Domain"). Every page of miraclehealth.us goes on to the same page at theunhyped.com,
// and a browser with saved things from the old address is asked first and can bring them along
// (scripts/forward/go.js, lib/carry.js, the site's /move/ page). Every link to
// community.miraclehealth.us goes on to the same place at community.theunhyped.com.
// A GitHub Pages site has one address, so each goes in its own repository, published from main.
//
// Usage: node scripts/build_forward.mjs <folder>
//   writes <folder>/miraclehealth.us and <folder>/community.miraclehealth.us
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
if (!OUT) { console.error('usage: node scripts/build_forward.mjs <folder>'); process.exit(2); }
const NEW = 'https://theunhyped.com';
const NEW_COMMUNITY = 'https://community.theunhyped.com';
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const write = (dir, rel, data) => {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
};
const copy = (dir, rel, from = rel) => write(dir, rel, fs.readFileSync(path.join(ROOT, from)));
const copyTree = (dir, rel) => {
  for (const f of execFileSync('git', ['ls-files', rel], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)) copy(dir, f);
};

// ---------------------------------------------------------------------------
// miraclehealth.us
// ---------------------------------------------------------------------------
const main = path.join(OUT, 'miraclehealth.us');
fs.rmSync(main, { recursive: true, force: true });
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'";
const pageHtml = (url) => {
  const to = url ? `${NEW}${url}` : `${NEW}/`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unhyped has moved to theunhyped.com</title>
<meta name="description" content="Unhyped now lives at theunhyped.com.">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
${url ? `<link rel="canonical" href="${e(to)}">\n` : ''}<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/go.css">
<script type="module" src="/go.js"></script>
<noscript><link rel="stylesheet" href="/noscript.css"><meta http-equiv="refresh" content="0; url=${e(to)}"></noscript>
</head>
<body>
<main class="mv" id="mv">
  <img class="mv-logo" src="/logo.svg" alt="Unhyped" width="109" height="20">
  <h1>Unhyped has moved to theunhyped.com</h1>
  <p class="mv-say" id="mv-say" role="status">This page is now at <a href="${e(to)}">${e(to.replace(/^https:\/\//, ''))}</a>.</p>
  <div class="mv-acts" id="mv-acts" hidden>
    <button class="btn bone" id="mv-bring" type="button">Bring them over</button>
    <a class="btn line" id="mv-skip" href="${e(to)}">Go without them</a>
  </div>
</main>
</body>
</html>
`;
};
// Every page the site has today, at the path it has today
const pages = execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' }).split('\n')
  .filter((f) => f && f !== '404.html' && !f.startsWith('move/') && !/^(design|scripts|tests)\//.test(f));
for (const f of pages) {
  const url = f === 'index.html' ? '/'
    : f.endsWith('/index.html') ? `/${f.slice(0, -'index.html'.length)}`
      : f.includes('/') ? `/${f}` : `/${f.replace(/\.html$/, '')}`;
  write(main, f, pageHtml(url));
}
// Anything else (a page that's gone, a link with a typo) goes on to the same path; no canonical
write(main, '404.html', pageHtml(''));
write(main, 'go.js', fs.readFileSync(path.join(ROOT, 'scripts', 'forward', 'go.js')));
write(main, 'go.css', fs.readFileSync(path.join(ROOT, 'scripts', 'forward', 'go.css')));
write(main, 'noscript.css', '.mv{visibility:visible;animation:none}\n');
copy(main, 'carry.js', 'lib/carry.js');
copy(main, 'logo.svg');
copy(main, 'favicon.svg');
copy(main, 'fonts/mona-sans.woff2');
copy(main, 'fonts/OFL-Mona-Sans.txt');
// The Library's data, for the hour of the switch: until Promote to live, the live Sig and the live
// community still read it from this address. It can be deleted after.
copyTree(main, 'library/data');
write(main, 'CNAME', 'miraclehealth.us\n');
write(main, '.nojekyll', '');
write(main, 'robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${NEW}/sitemap.xml\n`);
write(main, 'README.md', `# miraclehealth.us

Unhyped's old address. Unhyped now lives at ${NEW}, and every page here goes on to the same
page there, keeping anything after the address (\`?\` and \`#\`).

A browser keeps each address's saved things apart. When this browser has some from the old address
(a stack, a plan, chats with Sig), the page asks first and can bring them along: it opens
${NEW}/move/ in a small window and hands them over there, never in a link and never through a
server. \`?bring\` on any page asks again.

Written by \`scripts/build_forward.mjs\` in officegemfi-ai/miraclehealth-site; change it there, not here.

GitHub Pages: Settings > Pages > Deploy from a branch, \`main\`, \`/ (root)\`. Custom domain
\`miraclehealth.us\` (the \`CNAME\` file), with Enforce HTTPS on. Keep the domain registered.

\`library/data/\` is a copy of the Library's data for the hour of the switch: until Promote to live,
the live Sig and the live community read it from this address. It can be deleted after.
`);

// ---------------------------------------------------------------------------
// community.miraclehealth.us
// ---------------------------------------------------------------------------
const comm = path.join(OUT, 'community.miraclehealth.us');
fs.rmSync(comm, { recursive: true, force: true });
const commHtml = (canonical) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Unhyped community has moved</title>
<meta name="description" content="The Unhyped community now lives at community.theunhyped.com.">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
${canonical ? `<link rel="canonical" href="${NEW_COMMUNITY}/">\n` : ''}<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/go.css">
<script src="/go.js"></script>
<noscript><link rel="stylesheet" href="/noscript.css"><meta http-equiv="refresh" content="0; url=${NEW_COMMUNITY}/"></noscript>
</head>
<body>
<main class="mv" id="mv">
  <img class="mv-logo" src="/logo.svg" alt="Unhyped" width="109" height="20">
  <h1>The community has moved</h1>
  <p class="mv-say">The Unhyped community is now at <a href="${NEW_COMMUNITY}/">community.theunhyped.com</a>. Sign in there with your phone number as before.</p>
</main>
</body>
</html>
`;
write(comm, 'index.html', commHtml(true));
write(comm, '404.html', commHtml(false));
write(comm, 'go.js', `// community.miraclehealth.us, the old address of Unhyped's community: every link goes on to the
// same place at community.theunhyped.com. Written by scripts/build_forward.mjs.
location.replace(\`${NEW_COMMUNITY}\${location.pathname}\${location.search}\${location.hash}\`);
`);
write(comm, 'go.css', fs.readFileSync(path.join(ROOT, 'scripts', 'forward', 'go.css')));
write(comm, 'noscript.css', '.mv{visibility:visible;animation:none}\n');
copy(comm, 'logo.svg');
copy(comm, 'favicon.svg');
copy(comm, 'fonts/mona-sans.woff2');
copy(comm, 'fonts/OFL-Mona-Sans.txt');
write(comm, 'CNAME', 'community.miraclehealth.us\n');
write(comm, '.nojekyll', '');
write(comm, 'robots.txt', 'User-agent: *\nAllow: /\n');
write(comm, 'README.md', `# community.miraclehealth.us

The old address of Unhyped's community. The community now lives at ${NEW_COMMUNITY}, and every
link here goes on to the same place there, keeping anything after the address (\`?\` and \`#\`).
Members sign in again there with their phone number.

Written by \`scripts/build_forward.mjs\` in officegemfi-ai/miraclehealth-site; change it there, not here.

GitHub Pages: Settings > Pages > Deploy from a branch, \`main\`, \`/ (root)\`. Custom domain
\`community.miraclehealth.us\` (the \`CNAME\` file), with Enforce HTTPS on.
`);

console.log(`forwarding sites: ${pages.length} pages + 404 for miraclehealth.us, and community.miraclehealth.us, in ${OUT}`);
