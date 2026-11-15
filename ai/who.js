// Who answers on Ask Sig (miraclehealth.us/sig): the picker beside the box to write in (page 19 of
// the design canvas). For each chat the member keeps all twelve agents, picks a ready-made team, or
// picks agents one by one, the way a model is picked in a chat app. The Safety agent is always on:
// it reads every question and checks every answer, whatever is picked. The library build writes
// the picker's markup (scripts/build_library.mjs, aiPage); this keeps it in step with the choice and
// says when the choice changes. Sig's server gets the choice with each message (supabase/functions/
// ask in the community repository), runs only those agents, and says who answered.
// Imports nothing: the library build writes this file's version into ai/ai.js, which imports it.

// The twelve, in the order Sig's server and the page list them
export const ALL = ['safety', 'planner', 'recommender', 'evidence', 'relatives', 'mechanism', 'combination', 'markers', 'community', 'synergy', 'builder', 'interpretation'];
// The ready-made teams
export const TEAMS = {
  all: ALL,
  crowd: ['safety', 'planner', 'community', 'interpretation'],
  studies: ['safety', 'planner', 'recommender', 'evidence', 'relatives', 'mechanism', 'interpretation'],
  stack: ['safety', 'combination', 'markers', 'synergy', 'builder'],
};
const TEAM_NAME = { crowd: 'The crowd', studies: 'The studies', stack: 'What I take' };

// A choice as it's kept: the agents on, in the order above, the Safety agent always among them
export function tidy(list) {
  const on = new Set(Array.isArray(list) ? list.filter((a) => ALL.includes(a)) : ALL);
  on.add('safety');
  return ALL.filter((a) => on.has(a));
}
export const teamOf = (on) => Object.keys(TEAMS).find((t) => TEAMS[t].length === on.length && TEAMS[t].every((a) => on.includes(a))) || '';
export const isAll = (on) => on.length === ALL.length;
// What the pill says: "All 12 agents", "The crowd · 4", or "6 agents"
export function labelOf(on) {
  const t = teamOf(on);
  return t === 'all' ? `All ${ALL.length} agents` : t ? `${TEAM_NAME[t]} · ${on.length}` : `${on.length} agent${on.length === 1 ? '' : 's'}`;
}

// The picker, on the markup the build wrote: the pill opens a panel (a sheet on a phone) with the
// teams and the twelve. onChange hears every new choice; onRing redraws Sig's ring for it.
export function picker({ pill, pop, label, onChange, onRing }) {
  let on = ALL.slice();
  const rows = [...pop.querySelectorAll('button.who-row[data-agent]')];
  const teams = [...pop.querySelectorAll('button[data-preset]')];
  const shade = document.createElement('div');
  shade.className = 'who-shade';
  shade.hidden = true;
  pop.before(shade);
  const draw = () => {
    for (const b of rows) b.setAttribute('aria-pressed', String(on.includes(b.dataset.agent)));
    const t = teamOf(on);
    for (const b of teams) b.setAttribute('aria-pressed', String(b.dataset.preset === t));
    label.textContent = labelOf(on);
    pill.dataset.n = String(on.length);
    pill.setAttribute('aria-label', `Who answers: ${labelOf(on)}`);
    onRing?.(on);
  };
  const set = (next, tell) => {
    on = tidy(next);
    draw();
    if (tell) onChange?.(on.slice());
  };
  const outside = (e) => { if (!pop.contains(e.target) && !pill.contains(e.target)) close({ back: false }); };
  function open() {
    if (!pop.hidden) return;
    pop.hidden = false;
    shade.hidden = false;
    pill.setAttribute('aria-expanded', 'true');
    (pop.querySelector('button[data-preset][aria-pressed="true"]') || rows[0] || pop.querySelector('.who-x'))?.focus({ preventScroll: true });
    document.addEventListener('pointerdown', outside, true);
  }
  function close({ back = true } = {}) {
    if (pop.hidden) return;
    pop.hidden = true;
    shade.hidden = true;
    pill.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside, true);
    if (back) pill.focus({ preventScroll: true });
  }
  pill.addEventListener('click', () => (pop.hidden ? open() : close()));
  pop.querySelector('.who-x')?.addEventListener('click', () => close());
  // Escape closes it, and leaving it with the keyboard does too
  pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } });
  pop.addEventListener('focusout', (e) => { if (e.relatedTarget && !pop.contains(e.relatedTarget) && !pill.contains(e.relatedTarget)) close({ back: false }); });
  for (const b of rows) {
    b.addEventListener('click', () => {
      const a = b.dataset.agent;
      set(on.includes(a) ? on.filter((x) => x !== a) : [...on, a], true);
    });
  }
  for (const b of teams) b.addEventListener('click', () => set(TEAMS[b.dataset.preset] || ALL, true));
  draw();
  return { set: (list) => set(list, false), get: () => on.slice(), close, isOpen: () => !pop.hidden };
}
