// The brand guide: two pages, the least anyone needs to make something that looks like Unhyped.
// Page one is what it is (the logo, the icon, the colours, the type); page two is how it's used (shape,
// icons, the Community Signal, the voice). Each panel shows the real thing and says at most three
// short things about it. Also the icon sheet: every icon with the name of its file.
import { BASE, C, HEAD, NAME, PUNCH, ground, logo, icon } from './look.mjs';
import { ringSvg, WHEEL, CENTER } from '../../lib/ring.js';
import { GLYPH, AGENT_COLOR } from '../../lib/glyphs.js';
import { PARTS } from './pieces.mjs';

const W = 1600;
const H = 1000;

export function guidePages({ icons, steps, board, palette, sig }) {
  const s = board[0];
  const [a, b] = Number(s.score).toFixed(1).split('.');
  const ico = (inner, colour, size = 30) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${colour}" stroke-width="${icons.stroke}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const some = ['home', 'search', 'menu', 'close', 'arrow-right', 'check', 'plus', 'user', 'bell', 'comment', 'share', 'clock'];
  const css = `${BASE}
@page{size:${W}px ${H}px;margin:0}
html,body{width:${W}px}
.pg{position:relative;width:${W}px;height:${H}px;overflow:hidden;display:flex;flex-direction:column;padding:50px 64px 60px;background:${ground(1.2)};break-after:page}
.pg-top{display:flex;align-items:center;justify-content:space-between;height:34px}
.pg-top p{font:600 18px/1 Mona,sans-serif;color:${C['text-2']}}
.grid{flex:1;min-height:0;display:grid;gap:20px;margin-top:32px;grid-template-columns:1.16fr 1fr;grid-template-rows:1fr 1.14fr}
.grid.two{grid-template-columns:1fr 1.32fr;grid-template-rows:1fr 1.12fr}
.panel{display:flex;flex-direction:column;min-width:0;min-height:0;padding:26px 30px 28px;border:1px solid ${C.line};background:${C['surface-raised']}}
.panel.black{background:${C.surface}}
.panel>h2{font:600 16px/1.2 Mona,sans-serif;color:${C.lime}}
.show{flex:1;min-height:0;display:flex;align-items:center;gap:40px}
.notes{display:grid;gap:5px;font:400 16.5px/1.4 Mona,sans-serif;color:${C['text-2']}}
.notes b{font-weight:600;color:${C.text}}
/* the icon at the sizes it is used, and Sig's ring beside it */
.sizes{display:flex;align-items:flex-end;gap:26px}
.sizes svg{display:block}
.tile{display:grid;place-items:center;width:96px;height:96px;margin-left:14px;background:${C.surface};border:1px solid ${C.line}}
/* colour */
.sws{flex:1;display:grid;grid-template-columns:repeat(5,1fr);gap:18px 14px;align-content:center;margin:14px 0}
.sw i{display:block;height:56px;border:1px solid ${C.line}}
.sw b{display:block;margin-top:10px;font:600 15px/1.2 Mona,sans-serif}
.sw code{display:block;margin-top:4px;font:400 13px/1 Neon,monospace;color:${C['text-2']}}
.sw span{display:block;margin-top:5px;font:400 13.5px/1.3 Mona,sans-serif;color:${C['text-2']}}
/* type */
.types{flex:1;display:grid;align-content:space-between;margin:14px 0 0}
.types>div{padding:13px 0 0;border-top:1px solid ${C.line}}
.types>div:first-child{padding-top:0;border-top:0}
.types small{display:block;margin-top:7px;font:400 14px/1.35 Mona,sans-serif;color:${C['text-2']}}
.t1{${HEAD};font-size:38px;line-height:1;white-space:nowrap}
.t1 em{${PUNCH}}
.t2{${NAME};font-size:28px;line-height:1.1}
.t3{font:400 18px/1.45 Mona,sans-serif;color:${C['text-read']}}
.t4{font:400 22px/1 Neon,monospace}
/* shape */
.btns{display:flex;flex-wrap:wrap;gap:14px}
.btn{display:inline-flex;align-items:center;min-height:48px;padding:0 18px;font:600 14.5px/1 Mona,sans-serif}
.btn.blue{color:#fff;background:linear-gradient(180deg,${C['accent-hi']} 0%,${C.accent} 100%);box-shadow:0 10px 30px rgba(26,4,255,.45),inset 0 1px 0 rgba(255,255,255,.22)}
.btn.white{color:${C.surface};background:${C.text}}
.btn.line{color:${C.text};border:1px solid ${C['line-2']}}
/* icons */
.icons{flex:1;display:grid;grid-template-columns:repeat(12,1fr);gap:26px 0;align-content:center;justify-items:center}
/* the Signal */
.sg{flex:1;display:grid;grid-template-columns:max-content max-content max-content;justify-content:space-between;align-items:center;gap:28px}
.sg-n{${NAME};font-size:92px;line-height:.92;letter-spacing:-.045em;white-space:nowrap}
.sg-n span{font-size:.4em;letter-spacing:-.02em;color:${C['text-2']}}
.sg-of{margin-top:10px;font:400 14px/1 Mona,sans-serif;color:${C['text-2']}}
.sg-sum{margin-top:8px;font:500 15px/1.2 Mona,sans-serif;color:${C.lime}}
.sg-parts{display:grid;grid-template-columns:26px max-content max-content;gap:14px 14px;align-items:center;list-style:none;font:400 16px/1.2 Mona,sans-serif;color:${C['text-read']};white-space:nowrap}
.sg-parts li{display:contents}
.sg-parts i{height:5px}
.sg-parts em{font:400 14px/1 Neon,monospace;font-style:normal;color:${C['text-2']};text-align:right}
.sg-sig{display:grid;justify-items:center;gap:10px;width:156px;text-align:center;font:400 13.5px/1.35 Mona,sans-serif;color:${C['text-2']}}
/* voice */
.say{flex:1;display:grid;align-content:center;gap:14px;font:500 25px/1.25 Mona,sans-serif;letter-spacing:-.01em}
/* the icon sheet */
.sheet h2{margin-top:30px;font:600 16px/1.2 Mona,sans-serif;color:${C.lime}}
.sheet h2:first-of-type{margin-top:34px}
.cells{display:grid;grid-template-columns:repeat(10,1fr);gap:22px 8px;margin-top:20px}
.cells.twelve{grid-template-columns:repeat(12,1fr)}
.cells figure{display:grid;justify-items:center;gap:10px;font:400 13px/1.2 Mona,sans-serif;color:${C['text-2']};text-align:center}
.cells.steps{grid-template-columns:repeat(3,128px);gap:8px 18px}
.cells.steps svg,.cells.moods svg{width:96px;height:96px}
.cells.steps svg *{vector-effect:non-scaling-stroke;stroke-width:1.2px}   /* on the sheet, hairlines as the pages draw them */
.pair{display:grid;grid-template-columns:max-content 1fr;gap:0 72px}
.pair h2{margin-top:36px}
.cells.moods{grid-template-columns:repeat(8,1fr)}`;
  const top = (word) => `<div class="pg-top">${logo(32)}<p>${word}</p></div>`;

  const page1 = `<section class="pg">${top('Brand guide')}<div class="grid">
<div class="panel black"><h2>The logo</h2><div class="show" style="justify-content:center">${logo(132)}</div>
<div class="notes"><p><b>White, on black.</b> Never on a colour or a photo.</p><p>Never smaller than 20 px tall. Keep half its height clear on every side.</p><p>Never recoloured, outlined, stretched or turned.</p></div></div>
<div class="panel"><h2>The icon</h2><div class="show" style="justify-content:center;gap:48px">${icon(168)}
<div class="sizes">${icon(96)}${icon(52)}${icon(28)}<span class="tile">${ringSvg(60)}</span></div></div>
<div class="notes"><p><b>The logo’s own u,</b> white on electric blue: the profile picture, the app icon and the browser tab.</p><p>In black or white only where blue can’t be printed. Never beside the logo.</p><p><b>The ring is Sig’s,</b> not Unhyped’s: Ask Sig only, always all its colours, on black.</p></div></div>
<div class="panel"><h2>Colour</h2><div class="sws">${palette.map(([name, token, usage]) => `<div class="sw"><i style="background:${C[token]}"></i><b>${name}</b><code>${C[token]}</code><span>${usage}</span></div>`).join('')}</div>
<div class="notes"><p><b>Colour is a signature, never decoration.</b> Sig’s twelve agents each have their own: the ring.</p></div></div>
<div class="panel"><h2>Type</h2><div class="types">
<div><p class="t1">No miracles.<br><em>Just what happened.</em></p><small>Headlines: Mona Sans at its widest, 800, capitals. The second sentence takes the gradient.</small></div>
<div><p class="t2">${s.name} &nbsp;${a}.${b}</p><small>Names and scores: Mona Sans, wide, 650.</small></div>
<div><p class="t3">Scored 0 to 100 by the people who took it.</p><small>Text: Mona Sans 400. Labels 600, never under 13 px.</small></div>
<div><p class="t4">0123456789</p><small>Numbers only: Monaspace Neon. Never words.</small></div>
</div></div>
</div></section>`;

  const page2 = `<section class="pg">${top('Brand guide')}<div class="grid two">
<div class="panel"><h2>Shape</h2><div class="show"><div class="btns"><span class="btn blue">Look it up</span><span class="btn white">Join</span><span class="btn line">See the Signal</span></div></div>
<div class="notes"><p><b>Square corners.</b> Only dots and rings are round.</p><p><b>One blue button on a screen:</b> the main action. Only it glows.</p><p>No drop shadows, no emoji, nothing dressed up as code.</p></div></div>
<div class="panel"><h2>Icons</h2><div class="icons">${[...WHEEL, CENTER].map((k) => ico(GLYPH[k], AGENT_COLOR[k])).join('')}${some.map((k) => ico(icons.interface[k], C.text)).join('')}</div>
<div class="notes"><p><b>One set:</b> a 24 grid, a 1.6 stroke, round ends, no fills.</p><p>An agent’s glyph wears its colour. Every other icon takes the colour of the words beside it.</p></div></div>
<div class="panel"><h2>Voice</h2><div class="say"><p>No miracles. Just what happened.</p><p>BPC-157, unhyped.</p><p>Took something? Say how it went.</p></div>
<div class="notes"><p><b>One line,</b> the first, everywhere. <b>One format</b> for a compound or a goal: its name, then “unhyped.”</p><p><b>Plain, calm, exact.</b> Never a dose, a seller, a brand, a lab, a price, a diagnosis or a promise.</p></div></div>
<div class="panel"><h2>The Community Signal</h2><div class="sg">
<div><p class="sg-n">${a}<span>.${b}</span></p><p class="sg-of">out of 100</p><p class="sg-sum">Mostly positive, high confidence</p></div>
<ul class="sg-parts">${PARTS.map(([, name, share, col]) => `<li><i style="background:${col}"></i><span>${name}</span><em>${share}%</em></li>`).join('')}</ul>
<div class="sg-sig">${sig(64, 'idle')}<p>Sig in the community: the Signal in person. A character, not the logo.</p></div></div>
<div class="notes"><p><b>One number from 0 to 100,</b> always shown with what it’s made of, each part in its own colour.</p><p>Its words come from how well it worked: 75 and up “Mostly positive”, 60 “Leaning positive”, 45 “Mixed”, under that “Mostly negative”.</p></div></div>
</div></section>`;

  const cell = (svg, name) => `<figure>${svg}<figcaption>${name}</figcaption></figure>`;
  const iconSheet = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><section class="pg sheet">${top('Icons')}
<h2>Interface</h2><div class="cells">${Object.entries(icons.interface).map(([k, d]) => cell(ico(d, C.text, 28), k)).join('')}</div>
<h2>Sig’s agents</h2><div class="cells twelve">${[...WHEEL, CENTER].map((k) => cell(ico(GLYPH[k], AGENT_COLOR[k], 28), k)).join('')}</div>
<div class="pair"><div><h2>The three steps</h2><div class="cells steps">${['Say how it went', 'Sig reads it in', 'The Signal moves'].map((n, i) => cell(steps[i], n)).join('')}</div></div>
<div><h2>Sig in the community</h2><div class="cells moods">${[['idle', 'Sig'], ['think', 'thinking'], ['cheer', 'cheering'], ['support', 'support'], ['curious', 'curious'], ['watching', 'watching'], ['concerned', 'concerned'], ['sleepy', 'resting']].map(([m, n]) => cell(sig(96, m), n)).join('')}</div></div></div>
</section></body></html>`;

  return { w: W, h: H, count: 2, html: `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${page1}${page2}</body></html>`, iconSheet };
}
