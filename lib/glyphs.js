// The Twelve, drawn: a glyph for each of Sig's agents, on a 24-unit grid, one stroke weight,
// in currentColor (each agent's own colour, from lib/ring.js, is set where a glyph is used).
// Each says what its agent does: the Safety agent's shield, the Planner's route, the Evidence
// librarian's ladder of rungs, the community's many voices meeting in one, the Interpretation
// agent's eye at the centre of the ring. Used beside the agents' names on Ask Sig, on the side
// panel's places, on fact sheets (each section signed by its agent), on the story page and in
// the launch pieces. Nothing here is anyone's text: the markup is ours. It imports nothing (the
// colours are lib/ring.js's, repeated), so the build can version it on its own.
export const AGENT_COLOR = {
  safety: '#FF6B5B', planner: '#FF9F4A', recommender: '#F2C94C', community: '#3D8BFF', combination: '#5FE08A', markers: '#3FE0C5',
  synergy: '#55D3FF', evidence: '#6FA8FE', relatives: '#8F95FF', mechanism: '#B98CFF', builder: '#FF7FC8', interpretation: '#F7F8FA',
};

export const GLYPH = {
  // a shield, checked
  safety: '<path d="M12 2.8 19.2 5.6v5.2c0 4.6-3 8.4-7.2 10.4-4.2-2-7.2-5.8-7.2-10.4V5.6z"/><path d="m8.6 11.9 2.4 2.4 4.5-4.9"/>',
  // a route: from where they are, by a turn, to what they want
  planner: '<circle cx="5" cy="18.5" r="2"/><circle cx="19" cy="5.5" r="2"/><path d="M6.9 17.6c6-1.6 3.5-8.8 10.2-11.2"/><path d="M12 12.1h0"/>',
  // a compass star: the options worth a look
  recommender: '<path d="m12 2.6 2.3 7.1 7.1 2.3-7.1 2.3-2.3 7.1-2.3-7.1-7.1-2.3 7.1-2.3z"/><circle cx="12" cy="12" r="1.2"/>',
  // many voices meeting in one number
  community: '<circle cx="4.6" cy="5.4" r="1.6"/><circle cx="12" cy="3.6" r="1.6"/><circle cx="19.4" cy="5.4" r="1.6"/><path d="M5.6 6.8 12 15.6l6.4-8.8M12 5.2v10.4"/><circle cx="12" cy="18.8" r="2.4"/>',
  // two things together: where they overlap
  combination: '<circle cx="9" cy="12" r="5.6"/><circle cx="15" cy="12" r="5.6"/>',
  // a vial with a level in it: the blood tests
  markers: '<path d="M8.6 2.8h6.8M10 2.8v14.6a2 2 0 0 0 4 0V2.8"/><path d="M10 11.2h4M15.8 9.4h2.6M15.8 13h2.6"/>',
  // two waves in step: checked together
  synergy: '<path d="M2.6 9c3.1-3.4 6.3 3.4 9.4 0s6.3-3.4 9.4 0M2.6 15c3.1-3.4 6.3 3.4 9.4 0s6.3-3.4 9.4 0"/>',
  // a ladder of rungs: how strong the evidence is
  evidence: '<path d="M6.8 2.8v18.4M17.2 2.8v18.4M6.8 7.2h10.4M6.8 12h10.4M6.8 16.8h10.4"/>',
  // a family: what close relatives show
  relatives: '<circle cx="12" cy="4.8" r="2"/><circle cx="5.4" cy="18.8" r="2"/><circle cx="18.6" cy="18.8" r="2"/><path d="M12 6.8v4.4M5.4 16.8v-5.6h13.2v5.6"/>',
  // a receptor and what fits in it: how it could work
  mechanism: '<path d="M4.4 9.6v2.4a7.6 7.6 0 0 0 15.2 0V9.6"/><path d="M8.6 9.6v2.2a3.4 3.4 0 0 0 6.8 0V9.6"/><circle cx="12" cy="4.6" r="2.2"/>',
  // blocks, stacked: the options, laid out
  builder: '<rect x="3.4" y="13.6" width="7.4" height="6.8" rx="1.2"/><rect x="13.2" y="13.6" width="7.4" height="6.8" rx="1.2"/><rect x="8.3" y="4" width="7.4" height="6.8" rx="1.2"/>',
  // an eye at the centre: it reasons it all through, last
  interpretation: '<path d="M2.4 12s3.6-6.4 9.6-6.4 9.6 6.4 9.6 6.4-3.6 6.4-9.6 6.4S2.4 12 2.4 12z"/><circle cx="12" cy="12" r="2.8"/><circle cx="12" cy="12" r=".6"/>',
};

export const AGENT_SHORT = {
  safety: 'safety', planner: 'planner', recommender: 'recommender', community: 'community', combination: 'combination', markers: 'markers',
  synergy: 'synergy', evidence: 'evidence', relatives: 'relatives', mechanism: 'mechanism', builder: 'builder', interpretation: 'interpretation',
};

// A glyph as markup: size in pixels; colour: true for the agent's own, a CSS colour, or nothing
// (currentColor)
export function glyphSvg(key, { size = 18, color = true, cls = '', label = '' } = {}) {
  const g = GLYPH[key];
  if (!g) return '';
  const c = color === true ? AGENT_COLOR[key] : color || '';
  const a11y = label ? ` role="img" aria-label="${label.replace(/[&<>"]/g, '')}"` : ' aria-hidden="true" focusable="false"';
  return `<svg class="glyph${cls ? ` ${cls}` : ''}" data-g="${key}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${c ? ` color="${c}"` : ''}${a11y}>${g}</svg>`;
}
