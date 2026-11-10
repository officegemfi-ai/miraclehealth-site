// Sig's mark on Ask Sig: the ten agents and the community, the eleven who answer, as one ring with
// each in its own colour (Eleven). The library build draws the rings the page starts with; ai/ai.js
// draws one beside each answer and lights each one's piece of a ring as it reports. A piece is lit
// with the "on" class (ai/term.css dims the rest), so a ring changes without being drawn again.
// Nothing here is anyone's text: the markup is ours, made from numbers and the names below.

// Round the ring by hue, from the Safety agent's coral to the Stack builder's pink
export const WHEEL = ['safety', 'planner', 'recommender', 'community', 'combination', 'markers', 'synergy', 'evidence', 'relatives', 'mechanism', 'builder'];
export const AGENT_COLOR = {
  safety: '#FF6B5B', planner: '#FF9F4A', recommender: '#F2C94C', community: '#D8FF3D', combination: '#5FE08A', markers: '#3FE0C5',
  synergy: '#55D3FF', evidence: '#6FA8FF', relatives: '#8F95FF', mechanism: '#B98CFF', builder: '#FF7FC8',
};

// A ring `size` pixels across. lit: the agents whose pieces are lit (all of them when left out).
// The pieces carry their colour twice: as the stroke, and as `color`, for a glow in currentColor.
export function ringSvg(size, { lit = null, sw = Math.max(2.4, size * 0.17), gap = size > 60 ? 4.5 : 9, cls = '' } = {}) {
  const r = size / 2 - sw / 2 - 0.5;
  const c = 2 * Math.PI * r;
  const g = (gap / 360) * c;
  const n = (x) => Number(x.toFixed(2));
  const pieces = WHEEL.map((k, i) => `<circle class="rg${!lit || lit.includes(k) ? ' on' : ''}" data-a="${k}" r="${n(r)}" fill="none" stroke="${AGENT_COLOR[k]}" color="${AGENT_COLOR[k]}" stroke-width="${n(sw)}" stroke-dasharray="${n(c / 11 - g)} ${n(c)}" transform="rotate(${n(-90 + (i * 360) / 11 + gap / 2)})"/>`);
  return `<svg class="ring${cls ? ` ${cls}` : ''}" width="${size}" height="${size}" viewBox="${-size / 2} ${-size / 2} ${size} ${size}" aria-hidden="true" focusable="false">${pieces.join('')}</svg>`;
}
