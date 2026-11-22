// The look, as values a script can draw with: the brand's colours (read from design/tokens.json), the
// two faces, the page's black ground with its grid and wash, the violet band, the headline and the
// kicker. scripts/og_images.mjs (every page's share image) and design/pack/build.mjs (the brand pack)
// both draw from here, so a share image, a post and a page can't drift apart.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TOKENS = JSON.parse(fs.readFileSync(path.join(ROOT, 'design', 'tokens.json'), 'utf8'));
const raw = Object.fromEntries(TOKENS.color.tokens.map((t) => [t.name, t.value]));
const resolve = (v) => { const m = /^\{(.+)\}$/.exec(v); return m ? resolve(raw[m[1]]) : v; };
// Every colour by its token name, upper case (C.accent is '#1A04FF'; 'lime' is Signal blue's name in code)
export const C = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolve(v).startsWith('#') ? resolve(v).toUpperCase() : resolve(v)]));
export const fileUrl = (...p) => pathToFileURL(path.join(ROOT, ...p)).href;
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The two faces, from the site's own files
export const FACES = `@font-face{font-family:Mona;src:url('${fileUrl('fonts', 'mona-sans.woff2')}') format('woff2');font-weight:200 900;font-stretch:75% 125%}
@font-face{font-family:Neon;src:url('${fileUrl('fonts', 'monaspace-neon-400.woff2')}') format('woff2');font-weight:100 549}`;

// The page's ground (styles.css): black under a faint 64px grid and an ultramarine wash from the top.
// scale: how much larger than a page this picture is drawn (a 1080 x 1920 story takes 1.5)
export const ground = (scale = 1) => `radial-gradient(90% ${640 * scale}px at 50% ${-160 * scale}px,rgba(26,4,255,.3) 0%,rgba(0,0,0,0) 62%),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/${64 * scale}px ${64 * scale}px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/${64 * scale}px ${64 * scale}px,${C.surface}`;
// The violet band (styles.css .join): a grainy gradient for a statement. White words; its main action is black
export const violet = (scale = 1) => `background:url('${fileUrl('img', 'grain.svg')}') 0 0/${180 * scale}px ${180 * scale}px,radial-gradient(70% 130% at 24% 0%,${C['violet-deep']} 0%,rgba(93,51,239,0) 72%),linear-gradient(115deg,${C['violet-deep']} 0%,${C.violet} 55%,${C['violet-light']} 118%);background-blend-mode:overlay,normal,normal`;
// The punchline's gradient (home.css .sx-hero h1 em): Signal blue to violet, each line on its own
export const PUNCH = `font-style:normal;color:${C.lime};background:linear-gradient(90deg,${C.lime} 0%,${C.violet} 52%,${C['violet-light']} 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;-webkit-box-decoration-break:clone;box-decoration-break:clone`;
// A headline: Mona Sans at its widest and heaviest, in capitals (styles.css h1)
export const HEAD = `font-family:Mona,sans-serif;font-weight:800;font-stretch:125%;letter-spacing:-.028em;text-transform:uppercase`;
// A name or a score: the same face a step lighter, as written (home.css .sx-score)
export const NAME = `font-family:Mona,sans-serif;font-weight:650;font-stretch:125%;letter-spacing:-.025em`;
// What every picture starts from
export const BASE = `${FACES}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:${C.surface}}
body{color:${C.text};font-family:Mona,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
img,svg{display:block}`;
// The logo: one drawing, white, for black grounds (on a piece with the violet band it sits on black above the band).
// height is the room the old two-line logo took; the one-line word is drawn a little over half as tall
// (and so about as wide), so it weighs on a picture what the old one did
export const LOGO = fs.readFileSync(path.join(ROOT, 'design', 'pack', 'logo.svg'), 'utf8').replace(/<\?xml[^>]*>\s*/, '');
const [, , LW, LH] = /viewBox="([^"]+)"/.exec(LOGO)[1].split(/\s+/).map(Number);
export const logo = (height) => {
  const h = Number((height * 0.55).toFixed(2));
  return LOGO.replace(/ width="[^"]*" height="[^"]*"/, ` class="logo" width="${Number((h * LW / LH).toFixed(2))}" height="${h}"`);
};
