// The Road to Einstein's Field Equations: all 37 steps, in Intuition Mode,
// Derivation Mode or the black-hole fast track, with honesty badges and the
// fourteen equation dissections.

import { h, icon, bar, statePill } from '../dom.js';
import { app, setSettings } from '../state.js';
import { ROUTES } from '../../../content/gr/index.js';
import { badge } from './course.js';
import { stateOf } from '../../core/plan.js';

const pad = (n) => String(n).padStart(2, '0');

export function render(main) {
  const paint = () => main.replaceChildren(page());
  paint();
  function page() {
    const mode = app.settings.grMode || 'intuition';
    const route = mode === 'fast' ? ROUTES.fastTrack : ROUTES[mode];
    const suffix = mode === 'derivation' ? 'd' : 'i';
    const cat = app.cat;
    const done = route.filter((n) => app.st.lessons[`gr.S${pad(n)}.${suffix}`]?.completed).length;
    const seg = h('div.seg', [['intuition', 'Intuition Mode'], ['derivation', 'Derivation Mode'], ['fast', 'Black-hole fast track']].map(([k, label]) =>
      h('button', { type: 'button', 'aria-pressed': String(mode === k), onclick: async () => { await setSettings({ grMode: k }); paint(); } }, label)));
    const blurb = {
      intuition: 'Builds the physical picture without advanced mathematics: clocks, light, orbits and tides. Geodesics come early as “maximal aging”, so black holes arrive within a dozen lessons.',
      derivation: 'Works the real mathematics step by step, in Carroll’s conventions. Steps that need tensors or differential geometry are gated by the Mathematics of Spacetime tracks — you can still open them.',
      fast: 'Seven Intuition lessons, at Calculus II level: proper time → geodesics → Schwarzschild → time dilation → orbits → horizons → lensing.',
    }[mode];
    const rows = route.map((n, k) => {
      const id = `gr.S${pad(n)}.${suffix}`;
      const L = cat.lessons[id];
      const m = cat.modules[`gr.S${pad(n)}`];
      const st = stateOf(app.st, id);
      const completed = app.st.lessons[id]?.completed;
      const body = [h('span.n', String(n)), h('span.t', h('div', L.title), h('div.tiny.faint', m.title)),
        h('span.meta', (m.badges || []).map(badge), L.ready ? (st !== 'not-started' ? statePill(st) : null) : h('span.chip.planned', 'planned'), completed ? h('span.chip.good', { html: `${icon('check')}done` }) : null, h('span.nowrap', `${L.minutes} min`))];
      return L.ready ? h('a.lesson-row', { href: `#/lesson/${id}` }, body) : h('div.lesson-row.planned', body);
      void k;
    });
    const dis = cat.modules['gr.EQ'].lessonIds.map((id) => {
      const L = cat.lessons[id];
      return L.ready ? h('a.chip', { href: `#/lesson/${id}` }, L.title) : h('span.chip.planned', L.title);
    });
    return h('div.page',
      h('header.page-head', h('div.eyebrow', 'General relativity'), h('h1', 'The Road to Einstein’s Field Equations'),
        h('p', 'Thirty-seven steps from Newton’s gravity to the open questions. Every lesson connects its mathematics to what it does physically, dissects the famous equations symbol by symbol, and wears a badge saying what is established, what the mathematics merely allows, and what is speculation.')),
      h('div.card', h('div.row.between', seg, h('span.small.faint', `${done} of ${route.length} done`)), h('p.small.muted', { style: { marginTop: '.7rem' } }, blurb), bar(done / route.length, 'gold')),
      h('div.row.small', { style: { margin: '1rem 0' } }, h('span.faint', 'Badges:'), ['est-obs', 'est-der', 'math', 'spec', 'open', 'refuted', 'model'].map(badge)),
      h('section.module', { style: { marginTop: '.4rem' } }, rows),
      h('section.section', h('h2', 'Equations, dissected'), h('p.muted.small', 'Every symbol, index and sign of the equations that matter, and what each equation accomplishes.'), h('div.row', dis)),
      h('p.tiny.faint', { style: { marginTop: '1.5rem' } }, 'Warp drives and traversable wormholes appear only as mathematically allowed geometries that teach the energy conditions — never as technology. There is no known physical route to faster-than-light travel.'));
  }
  void statePill;
}
