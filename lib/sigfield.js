// The front page's top, in light (the owner's request, November 17: "like the Solana website's
// banners, moving, with colours"). Soft bands of violet and blue light drift behind the whole top, as
// if seen on an LED wall: each of the Community Signal's four parts is a band in its own colour, as
// bright as its number, with three thinner streaks of the same light between them, and the light is
// brightest round the score. Stepping to another compound sends a pulse out through the bands from the
// score; on a screen with a pointer the light gathers a little round it; and the light dims behind the
// words (quiet), so they always read on a dark ground. Nothing here is anyone's text.
//
// It's drawn small: one pixel for each cell of the wall, and the browser scales it up smoothly, so the
// light has a small share of the screen's pixels to fill and still runs in soft gradients; the dark
// lines between the cells are a still layer over it (img/led.svg). The cells are 5 CSS pixels on an
// ordinary screen and smaller on a sharp one (3 at twice the pixels), so the wall's grid stays fine.
// It draws every frame the screen shows while it's on screen; when less motion is asked for, it draws
// one still frame (and again when the Signal changes); without WebGL it isn't there at all and the top
// keeps its plain ground.
// (November 17, later: on the owner's sharp screen the first version looked blocky and flickered, so
// the cells are no longer drawn as hard squares, the cells' twinkle is gone and it no longer skips frames.)
//
// sigField(host, { canvas, colors, quiet }) -> { set(levels, score), start() } or null
//   host: the element it fills (it measures it); canvas: the canvas it draws on
//   colors: the four parts' colours, as '#RRGGBB'; quiet: selectors of the words to keep dark behind

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 res,px;uniform float asp,t,pulse,sc,soft;uniform vec2 focus,lf;uniform vec3 ptr,c0,c1,c2,c3;uniform vec4 lv;
uniform vec4 q[12];uniform float qn;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
// how far a point is outside a box with rounded corners (negative inside), in CSS pixels
float box(vec2 p,vec4 b){vec2 c=(b.xy+b.zw)*.5*px,h=(b.zw-b.xy)*.5*px;vec2 q=abs(p*px-c)-h+18.;return length(max(q,0.))+min(max(q.x,q.y),0.)-18.;}
float band(vec2 p,float y0,float hh,float sp,float sd){
  float prof=exp(-pow((p.y-y0)/hh,2.));
  return prof*smoothstep(.36,.82,fbm(vec2(p.x*.55+t*sp+sd,sd*1.3+p.y*.8)));
}
void main(){
  vec2 uv=gl_FragCoord.xy/res;
  vec2 p=vec2(uv.x*asp,uv.y);
  float fy=focus.y;
  float wob=(fbm(vec2(p.x*.35-t*.22,t*.25))-.5)*.14;
  vec3 col=vec3(0.);
  col+=c0*band(p+vec2(0.,wob),fy-.04,.04,-.26,4.)*(.3+1.5*lv.x);
  col+=c1*band(p+vec2(0.,wob*1.2),fy-.13,.026,.38,7.)*(.25+1.05*lv.y);
  col+=c2*band(p+vec2(0.,wob*.6),fy-.22,.042,-.30,15.)*(.3+1.3*lv.z);
  col+=c3*band(p+vec2(0.,-wob),fy+.07,.05,.22,11.)*(.3+1.4*lv.w);
  col+=vec3(.36,.20,.94)*band(p+vec2(0.,wob*.9),fy-.31,.018,.48,23.)*.9;
  col+=vec3(.10,.02,1.)*band(p+vec2(0.,wob),fy+.16,.022,.55,19.)*.9;
  col+=vec3(.60,.63,.96)*band(p+vec2(0.,wob*1.4),fy-.175,.011,.70,29.)*.45;
  col*=.85+.15*sin(t*1.3+p.x*2.);
  float d=length((uv-focus)*vec2(asp,1.));
  float wave=exp(-pow((d-pulse*.9)/.09,2.))*exp(-pulse*1.4);
  col*=1.+2.2*wave;
  col+=(c0+c1)*.12*wave;
  float pd=length((uv-ptr.xy)*vec2(asp,1.));
  col+=ptr.z*vec3(.55,.5,1.)*exp(-pow(pd/.16,2.))*(.12+.5*length(col));
  col*=(.55+.75*exp(-pow(d/.8,2.)))*(.75+.35*sc)*(1.-smoothstep(.88,.99,uv.y));
  float qv=0.;
  for(int i=0;i<12;i++){
    if(float(i)>=qn)break;
    qv=max(qv,1.-smoothstep(-8.,soft,box(uv,q[i])));
  }
  col=1.-exp(-col*2.);
  // dark behind the words: the boxes, and on a wide screen everything left of the card, fading in
  if(lf.y>0.)col*=mix(.13,1.,smoothstep(lf.x,lf.y,uv.x));
  col*=1.-.84*qv;
  gl_FragColor=vec4(col,1.);
}`;

const rgb = (hex) => [1, 3, 5].map((j) => parseInt(hex.slice(j, j + 2), 16) / 255);

export function sigField(host, { canvas, colors, quiet = [], cell = 0, focus = null, side = null } = {}) {
  if (!host || !canvas) return null;
  const doc = host.ownerDocument, win = doc.defaultView;
  // the wall's cells: about 6 to 8 of the screen's own pixels each, whatever the screen
  if (!cell) { const dpr = win.devicePixelRatio || 1; cell = dpr >= 1.75 ? 3 : dpr >= 1.3 ? 4 : 5; }
  canvas.parentElement?.style.setProperty('--cell', `${cell}px`);
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const k of ['res', 'px', 'asp', 't', 'pulse', 'sc', 'lf', 'focus', 'soft', 'ptr', 'c0', 'c1', 'c2', 'c3', 'lv', 'q', 'qn']) U[k] = gl.getUniformLocation(pr, k);
  colors.forEach((c, i) => gl.uniform3fv(U[`c${i}`], rgb(c)));

  const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = win.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // the parts' levels and the score, eased toward what they're set to; the pointer, eased too
  let lv = [0, 0, 0, 0], to = [0, 0, 0, 0], sc = 0, scTo = 0, pulseAt = -99;
  let ptr = [0.5, 0.5, 0], ptrTo = [0.5, 0.5, 0];
  let W = 0, H = 0, raf = 0, prev = 0, running = false, seen = true, t0 = win.performance.now();

  // the size: one pixel a cell; and where the score and the words are, as shares of the top (y up)
  const measure = () => {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    W = r.width; H = r.height;
    const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
    if (canvas.width !== cols || canvas.height !== rows) {
      canvas.width = cols; canvas.height = rows;
      canvas.style.setProperty('width', `${cols * cell}px`);
      canvas.style.setProperty('height', `${rows * cell}px`);
    }
    gl.viewport(0, 0, cols, rows);
    gl.uniform2f(U.res, cols, rows);
    gl.uniform1f(U.asp, (cols * cell) / (rows * cell));
    gl.uniform1f(U.soft, 46);
    gl.uniform2f(U.px, cols * cell, rows * cell);
    const share = (x, y) => [(x - r.left) / (cols * cell), 1 - (y - r.top) / (rows * cell)];
    const f = focus ? focus.getBoundingClientRect() : null;
    gl.uniform2fv(U.focus, f && f.width ? share(f.left + f.width / 2, f.top + f.height / 2) : [0.7, 0.6]);
    // side: on a wide screen (the card in the right part of the top) the light is dark over the words
    // left of the card and comes up across the gap between them
    const sb = side ? side.getBoundingClientRect() : null;
    const lx = sb && sb.width && (sb.left - r.left) / W > 0.35 ? (sb.left - r.left) / (cols * cell) : 0;
    let edge = 0;
    const boxes = [];
    for (const sel of quiet) {
      for (const el of host.querySelectorAll(sel)) {
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height || boxes.length === 48) continue;
        const [x0, y1] = share(b.left - 6, b.top - 6), [x1, y0] = share(b.right + 6, b.bottom + 6);
        if (lx && x1 < lx) { edge = Math.max(edge, x1); continue; }   // left of the card: in the dark already
        boxes.push(x0, y0, x1, y1);
      }
    }
    gl.uniform2f(U.lf, lx ? Math.min(edge || lx - 0.3, lx - 0.02) : 0, lx ? lx + 30 / (cols * cell) : 0);
    gl.uniform1f(U.qn, boxes.length / 4);
    if (boxes.length) gl.uniform4fv(U.q, new Float32Array([...boxes, ...new Array(48 - boxes.length).fill(0)]));
    return true;
  };

  const draw = (now) => {
    const dt = Math.min(0.1, (now - prev) / 1000 || 0);
    prev = now;
    const e = still ? 1 : 1 - Math.exp(-dt * 3.2), ep = 1 - Math.exp(-dt * 5);
    lv = lv.map((v, i) => v + (to[i] - v) * e);
    sc += (scTo - sc) * e;
    ptr = ptr.map((v, i) => v + (ptrTo[i] - v) * ep);
    const t = still ? 12 : (now - t0) / 1000;
    gl.uniform1f(U.t, t);
    gl.uniform1f(U.pulse, still ? 99 : (now - pulseAt) / 1000);
    gl.uniform1f(U.sc, sc);
    gl.uniform4fv(U.lv, lv);
    gl.uniform3fv(U.ptr, ptr);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const loop = (now) => {
    raf = 0;
    if (!running || !seen) return;
    raf = win.requestAnimationFrame(loop);
    draw(now);
  };
  const go = () => { if (!raf && running && seen && !still) { prev = win.performance.now(); raf = win.requestAnimationFrame(loop); } };

  if ('ResizeObserver' in win) new win.ResizeObserver(() => { if (measure() && (still || !raf)) draw(win.performance.now()); }).observe(host);
  if ('IntersectionObserver' in win) new win.IntersectionObserver((es) => { seen = es.some((x) => x.isIntersecting); go(); }, { rootMargin: '60px' }).observe(host);
  doc.fonts?.ready?.then(() => measure());
  if (pointer && !still) {
    host.addEventListener('pointermove', (ev) => {
      const r = canvas.getBoundingClientRect();
      ptrTo = [(ev.clientX - r.left) / r.width, 1 - (ev.clientY - r.top) / r.height, 1];
    }, { passive: true });
    host.addEventListener('pointerleave', () => { ptrTo = [ptrTo[0], ptrTo[1], 0]; }, { passive: true });
  }

  return {
    // levels: each part's number, 0 to 100; score: the Signal, 0 to 100. A pulse goes out unless
    // pulse is false; the bands ease to their new brightness
    set(levels, score, { pulse = true } = {}) {
      to = levels.map((v) => Math.max(0, Math.min(1, v / 100)) ** 1.6);
      scTo = Math.max(0, Math.min(1, score / 100));
      if (pulse) pulseAt = win.performance.now();
      if (!W) measure();
      win.requestAnimationFrame(() => { measure(); if (still || !running) draw(win.performance.now()); });
    },
    // the light comes up and starts moving (or, with less motion, is drawn once)
    start() {
      measure();
      running = true;
      draw(win.performance.now());
      canvas.parentElement?.classList.add('is-on');
      go();
    },
  };
}
