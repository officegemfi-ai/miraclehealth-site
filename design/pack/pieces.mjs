// The pack's pictures, as pages a browser draws: the Community Signal's pieces, the marketing formats
// and the brand guide. Every one keeps one layout: the logo and the address along the top, then a
// kicker, a headline and one line under it, from the left. Nothing else is added: no foot, no
// counters, no strips, nothing in the code face but numbers.
import { BASE, C, HEAD, NAME, PUNCH, ground, violet, logo, esc } from './look.mjs';
import { ringSvg } from '../../lib/ring.js';

// The Signal's four parts: the field in the data, its name on the card, its share of the score and
// its colour (the community's shared/kit/signalviz.js and the site's home.css)
export const PARTS = [
  ['efficacy', 'How well it worked', 65, C.lime],
  ['consistency', 'How much people agree', 15, C['violet-light']],
  ['diversity', 'How many people', 10, C.violet],
  ['confidence', 'How many reports', 10, C['accent-hi']],
];
// What a score is called, from the Signal's own rule (the community's signal board)
export const SAID = [[75, 'Mostly positive'], [60, 'Leaning positive'], [45, 'Mixed'], [0, 'Mostly negative']];
export const SURE = [[80, 'High confidence'], [60, 'Moderate confidence'], [40, 'Building confidence'], [0, 'Low confidence']];

const ARROW = '<svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const doc = (w, h, css, body, bg = `background:${ground()}`) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
body{width:${w}px;height:${h}px;overflow:hidden;position:relative;${bg}}
${css}</style></head><body>${body}</body></html>`;
const said = (s) => [s.summary_label, s.confidence_label ? `${String(s.confidence_label).toLowerCase()} confidence` : ''].filter(Boolean).join(', ');
const whole = (score) => { const [a, b] = Number(score).toFixed(1).split('.'); return `${a}<span>.${b}</span>`; };

// ---------------------------------------------------------------------------
// The Community Signal's pieces. u: one unit in pixels, so a piece is drawn at any size
// ---------------------------------------------------------------------------
const SIGNAL_CSS = (u) => `
.score{${NAME};font-size:${118 * u}px;line-height:.92;letter-spacing:-.045em;white-space:nowrap}
.score span{font-size:.4em;letter-spacing:-.02em;color:${C['text-2']}}
.of{margin-top:${14 * u}px;font:400 ${14 * u}px/1 Mona,sans-serif;color:${C['text-2']}}
.sum{margin-top:${9 * u}px;font:500 ${15 * u}px/1.2 Mona,sans-serif;color:${C.lime}}
.parts{display:grid;grid-template-columns:max-content minmax(${48 * u}px,1fr) 2.2em;gap:${13 * u}px ${16 * u}px;padding:${18 * u}px ${20 * u}px;list-style:none;border:1px solid ${C.line};background:rgba(0,0,0,.6)}
.parts li{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:center;font:400 ${12 * u}px/1 Neon,monospace;color:${C['text-2']};white-space:nowrap}
.parts span{font:400 ${15 * u}px/1.2 Mona,sans-serif;color:${C['text-read']}}
.parts i{display:block;height:${4 * u}px;background:rgba(255,255,255,.08)}
.parts i b{display:block;height:100%}
.parts em{font-style:normal;text-align:right;color:${C.text}}`;
const parts = (s) => `<ul class="parts">${PARTS.map(([k, name, , col]) => `<li><span>${name}</span><i><b style="width:${s[k]}%;background:${col};box-shadow:0 0 ${10}px ${col}"></b></i><em>${s[k]}</em></li>`).join('')}</ul>`;

// The score alone, on nothing: for a slide or a film
export const scoreAlone = (s) => doc(1200, 520, `html,body{background:transparent}${SIGNAL_CSS(3)}
.in{position:absolute;inset:0;display:grid;place-content:center;justify-items:center}`,
`<div class="in"><p class="score">${whole(s.score)}</p><p class="of">out of 100</p></div>`, 'background:transparent');

// A compound's card, as the front page draws it
export const signalCard = (s, rank, total, kind) => doc(1200, 1200, `${SIGNAL_CSS(2)}
.in{position:absolute;inset:0;padding:96px;display:flex;flex-direction:column}
.name{${NAME};font-size:56px;line-height:1.1}
.sub{margin-top:14px;font:400 26px/1.2 Mona,sans-serif;color:${C['text-2']}}
.mid{margin:auto 0;display:grid;justify-items:center;text-align:center}
.k{margin-top:44px;font:600 26px/1.2 Mona,sans-serif;color:${C['text-2']}}
.themes{margin-top:10px;list-style:none}
.themes li{display:flex;align-items:baseline;gap:20px;padding:8px 0;font:400 30px/1.2 Mona,sans-serif;color:${C['text-read']}}
.themes small{font:400 24px/1 Mona,sans-serif;color:${C['text-2']}}
.themes .hi small{color:${C.lime}}`,
`<div class="in"><p class="name">${esc(s.name)}</p><p class="sub">${esc(kind)} · ranked ${rank} of ${total}</p>
<div class="mid"><p class="score">${whole(s.score)}</p><p class="of">out of 100</p><p class="sum">${esc(said(s))}</p></div>
${parts(s)}
<p class="k">What people report most</p><ul class="themes">${s.themes.slice(0, 3).map((t) => `<li class="${/very/i.test(t.label) ? 'hi' : ''}">${esc(t.theme)}<small>${esc(String(t.label).toLowerCase())}</small></li>`).join('')}</ul></div>`);

// The board's rows: rank, name, a bar as long as the score, the score
const BOARD_CSS = (u) => `
.board{display:grid;grid-template-columns:max-content max-content 1fr max-content;column-gap:${22 * u}px;list-style:none}
.board li{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:center;padding:${15 * u}px 0;border-top:1px solid ${C.line}}
.board li:last-child{border-bottom:1px solid ${C.line}}
.board .n{font:400 ${13 * u}px/1 Neon,monospace;color:${C.muted}}
.board .nm{font:600 ${16 * u}px/1.2 Mona,sans-serif}
.board i{display:block;height:${4 * u}px;background:rgba(255,255,255,.08)}
.board i b{display:block;height:100%;background:${C.lime};box-shadow:0 0 ${8 * u}px rgba(61,139,255,.7)}
.board .sc{font:400 ${16 * u}px/1 Neon,monospace;text-align:right}`;
const board = (rows) => `<ol class="board">${rows.map((s, i) => `<li><span class="n">${i + 1}</span><span class="nm">${esc(s.name)}</span><i><b style="width:${s.score}%"></b></i><span class="sc">${Number(s.score).toFixed(1)}</span></li>`).join('')}</ol>`;
export const boardRows = (rows) => doc(1200, 560, `${BOARD_CSS(2)}.in{position:absolute;inset:0;padding:72px 96px;display:grid;align-content:center}`, `<div class="in">${board(rows)}</div>`);

// The Signal spectrum: one bar a compound, stacked from the four things that make its score
export const spectrumSvg = (rows, w = 1200, h = 360, gap = 4) => {
  const bw = (w - gap * (rows.length - 1)) / rows.length;
  const n = (x) => Number(x.toFixed(2));
  const bars = rows.map((s, i) => {
    let y = h; const x = i * (bw + gap);
    return PARTS.map(([k, , share, col]) => { const ph = (s[k] * share / 10000) * h; y -= ph; return `<rect x="${n(x)}" y="${n(y)}" width="${n(bw)}" height="${n(Math.max(0, ph - 1.5))}" fill="${col}"/>`; }).join('');
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="The Signal spectrum">${bars}</svg>`;
};

// ---------------------------------------------------------------------------
// Marketing. Every format: the logo and the address along the top; a kicker, the headline and one
// line under it at the foot, from the left. f: the format's own measures
// ---------------------------------------------------------------------------
const F = {
  square: { w: 1080, h: 1080, pad: 80, top: 80, logo: 56, addr: 26, kick: 30, head: 88, sub: 34, scale: 1.2 },
  portrait: { w: 1080, h: 1350, pad: 80, top: 80, logo: 56, addr: 26, kick: 30, head: 92, sub: 36, scale: 1.3 },
  story: { w: 1080, h: 1920, pad: 88, top: 250, bottom: 330, logo: 68, addr: 30, kick: 34, head: 104, sub: 40, scale: 1.6 },
};
const frame = (f, o) => `
.in{position:absolute;inset:0;display:flex;flex-direction:column;padding:${f.top}px ${f.pad}px ${f.bottom || f.pad}px}
.top{display:flex;align-items:center;justify-content:space-between}
.addr{font:500 ${f.addr}px/1 Mona,sans-serif;color:${C['text-2']}}
.band{flex:1;display:flex;flex-direction:column;margin:${Math.round(f.pad * 0.8)}px -${f.pad}px -${f.bottom || f.pad}px;padding:${f.pad}px ${f.pad}px ${f.bottom || f.pad}px;${violet(f.scale)}}
.kick{margin-top:auto;font:600 ${f.kick}px/1.2 Mona,sans-serif;color:${o.band ? C.text : C.lime}}
h1{margin-top:${Math.round(f.kick * 0.7)}px;${HEAD};font-size:${o.head || f.head}px;line-height:.98;text-wrap:balance}
h1 em{${o.band ? 'font-style:normal' : PUNCH}}
.sub{margin-top:${Math.round(f.sub * 0.85)}px;max-width:${o.subw || '22em'};font:400 ${f.sub}px/1.4 Mona,sans-serif;color:${o.band ? 'rgba(255,255,255,.92)' : C['text-2']};text-wrap:balance}
.go{display:inline-flex;align-items:center;gap:.6em;align-self:flex-start;margin-top:${Math.round(f.sub * 1.3)}px;min-height:3.2em;padding:0 1.3em;font:600 ${Math.round(f.sub * 0.82)}px/1 Mona,sans-serif;color:#fff;${o.band ? `background:${C.surface}` : `background:linear-gradient(180deg,${C['accent-hi']} 0%,${C.accent} 100%);box-shadow:0 10px 30px rgba(26,4,255,.45),inset 0 1px 0 rgba(255,255,255,.22)`}}
.note{margin-top:${Math.round(f.sub * 0.9)}px;font:400 ${Math.round(f.sub * 0.74)}px/1.3 Mona,sans-serif;color:${C['text-2']}}
.art{margin:auto 0 0}
.art+.kick{margin-top:${Math.round(f.kick * 1.6)}px}`;
// One piece. o: kick, title (its punchline in <em>), sub, body (a Signal piece under the words), go (the
// main action's words), note, art (a drawing above the words), addr, css. band: the words sit on the
// violet band, under the logo on black (the logo is never set on a colour); the main action is black there
const piece = (f, o) => {
  const words = `${o.art ? `<div class="art">${o.art}</div>` : ''}
${o.kick ? `<p class="kick">${esc(o.kick)}</p>` : ''}
${o.title ? `<h1>${o.title}</h1>` : ''}
${o.sub ? `<p class="sub">${esc(o.sub)}</p>` : ''}
${o.body || ''}
${o.go ? `<p class="go">${esc(o.go)}${ARROW}</p>` : ''}
${o.note ? `<p class="note">${esc(o.note)}</p>` : ''}`;
  return doc(f.w, f.h, frame(f, o) + (o.css || ''),
    `<div class="in"><div class="top">${logo(f.logo)}<span class="addr">${esc(o.addr || 'miraclehealth.us')}</span></div>
${o.band ? `<div class="band">${words}</div>` : words}</div>`, `background:${o.band ? C.surface : ground(f.scale)}`);
};

// The lines, as the site says them
const LINE = {
  brand: { kick: 'The Community Signal', title: 'No miracles.<br><em>Just what happened.</em>', sub: 'Every peptide, hormone and supplement, scored 0 to 100 by the people who took it.' },
  report: { kick: 'The Miracle Health community', title: 'Took something?<br>Say how it went.', sub: 'Your report moves the number for the next person, even if it did nothing.', go: 'community.miraclehealth.us', addr: 'community.miraclehealth.us', band: true },
  rules: { kick: 'Independent and free', title: 'Nobody can buy<br><em>a better number.</em>', sub: 'No doses. No sellers. No diagnosis. Nothing for sale.' },
};
const NOT_ADVICE = 'What people report. Not medical advice.';

export const posts = (top, total, kindOf, steps) => {
  const s = top[0];
  const sq = F.square; const pt = F.portrait; const st = F.story;
  const stepCss = `.art{margin:auto 0 0}.art svg{width:400px;height:400px}
.num{margin-top:56px;font:400 40px/1 Neon,monospace;color:${C.lime}}
h1{margin-top:22px}`;
  const step = (i, title, sub) => doc(pt.w, pt.h, frame(pt, { head: 76 }) + stepCss,
    `<div class="in"><div class="top">${logo(pt.logo)}<span class="addr">miraclehealth.us</span></div>
<div class="art">${steps[i]}</div><p class="num">${i + 1}</p><h1>${title}</h1><p class="sub">${esc(sub)}</p></div>`, `background:${ground(pt.scale)}`);
  return {
    'posts/post-brand.png': [sq, piece(sq, LINE.brand)],
    'posts/post-signal.png': [sq, piece(sq, { kick: 'The Community Signal', note: NOT_ADVICE,
      css: `${SIGNAL_CSS(1.8)}.name{margin-top:14px;${NAME};font-size:60px;line-height:1.05}.sub2{margin-top:10px;font:400 26px/1.2 Mona,sans-serif;color:${C['text-2']}}.row{display:flex;align-items:flex-end;gap:26px;margin-top:36px}.row .of{margin:0 0 20px}.sum{margin-top:16px}.parts{margin-top:36px}`,
      body: `<p class="name">${esc(s.name)}</p><p class="sub2">${esc(kindOf(s))} · ranked 1 of ${total}</p><div class="row"><p class="score">${whole(s.score)}</p><p class="of">out of 100</p></div><p class="sum">${esc(said(s))}</p>${parts(s)}` })],
    'posts/post-board.png': [sq, piece(sq, { kick: 'The Signal, weekly', note: NOT_ADVICE, css: `${BOARD_CSS(2.4)}.board{margin-top:36px}`, body: board(top.slice(0, 5)) })],
    'posts/post-report.png': [sq, piece(sq, { ...LINE.report, head: 84 })],
    'posts/post-rules.png': [sq, piece(sq, LINE.rules)],
    'carousel/1-cover.png': [pt, piece(pt, { kick: 'How it works', title: 'Three steps,<br><em>one honest number.</em>', sub: 'Nothing to fill in but how it went. Everything after that is worked out in the open.' })],
    'carousel/2-say-how-it-went.png': [pt, step(0, 'Say how it went', 'In your own words: what you took, what for, and how it went. Better, the same or worse, it all counts.')],
    'carousel/3-sig-reads-it-in.png': [pt, step(1, 'Sig reads it in', 'Sig, Miracle Health’s AI, reads what it was for and how it went, then asks “Did we read you right?” Your word wins.')],
    'carousel/4-the-signal-moves.png': [pt, step(2, 'The Signal moves', 'Every report moves one honest score from 0 to 100, and it’s followed up at 2, 6 and 12 weeks. Nobody can buy a better number.')],
    'carousel/5-your-turn.png': [pt, piece(pt, { ...LINE.report, head: 78 })],
    'stories/story-brand.png': [st, piece(st, { ...LINE.brand, go: 'miraclehealth.us' })],
    'stories/story-report.png': [st, piece(st, { ...LINE.report, head: 76 })],
  };
};

// The wide ones: a profile's header and an email's. The words keep to the top left, clear of where
// a profile picture sits; the Signal spectrum rises from the foot on the right
export const banner = (w, h, rows, o = {}) => doc(w, h, `
.in{position:absolute;inset:0;padding:${o.pad || 64}px ${o.pad || 64}px 0}
h1{margin-top:${o.gap || 34}px;${HEAD};font-size:${o.head || 60}px;line-height:.98}
h1 em{${PUNCH}}
.spec{position:absolute;right:${o.pad || 64}px;bottom:0;width:${o.specW || 620}px;height:${o.specH || 300}px;opacity:.95}
.spec svg{width:100%;height:100%}`,
`<div class="spec">${spectrumSvg(rows, o.specW || 620, o.specH || 300, 3)}</div><div class="in">${logo(o.logo || 46)}<h1>No miracles.<br><em>Just what happened.</em></h1></div>`, `background:${ground(1.1)}`);

// The weekly email's header: the logo on black, the words on the violet band
export const emailHeader = () => doc(1200, 400, `
.top{display:flex;align-items:center;justify-content:space-between;height:104px;padding:0 64px}
.addr{font:500 19px/1 Mona,sans-serif;color:${C['text-2']}}
.band{position:absolute;inset:104px 0 0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;${violet(1)}}
h1{${HEAD};font-size:64px;line-height:.98}
.sub{margin-top:18px;font:400 26px/1.3 Mona,sans-serif;color:rgba(255,255,255,.92)}`,
`<div class="top">${logo(42)}<span class="addr">miraclehealth.us</span></div><div class="band"><h1>The Signal, weekly</h1><p class="sub">What moved, once a week. Free, no ads.</p></div>`, `background:${C.surface}`);

// ---------------------------------------------------------------------------
// Flat pieces: the logo and the mark on their grounds, the three grounds themselves
// ---------------------------------------------------------------------------
export const logoOnBlack = () => doc(1920, 1080, '.in{position:absolute;inset:0;display:grid;place-items:center}', `<div class="in">${logo(320)}</div>`, `background:${C.surface}`);
export const appIcon = (size) => doc(size, size, '.in{position:absolute;inset:0;display:grid;place-items:center}', `<div class="in">${ringSvg(Math.round(size * 0.62))}</div>`, `background:${C.surface}`);
export const groundOnly = () => doc(1920, 1080, '', '', `background:${ground(1.4)}`);
export const violetOnly = () => doc(1920, 1080, '', '', violet(1.4));
// The Noise card's matte grey suede (home.css .sn-noise)
export const suedeOnly = (suedeUrl) => doc(1920, 1080, '', '', `background:radial-gradient(120% 90% at 0% 0%,rgba(255,255,255,.06),rgba(255,255,255,0) 60%),url('${suedeUrl}') 0 0/200px 200px,${C.suede};background-blend-mode:normal,soft-light`);
