// Onboarding: what you know (as a starting point, never as proof of
// mastery), what you are drawn to, where to focus, and an optional diagnostic.

import { h, icon, LOGO } from '../dom.js';
import { app, setProfile, setSettings } from '../state.js';

const STATUS = [['new', 'New to me'], ['taking', 'Taking now'], ['done', 'Completed']];
const INTERESTS = [
  ['gr', 'General relativity', 'Spacetime, curvature, Einstein’s equations'],
  ['blackholes', 'Black holes', 'Horizons, orbits, lensing'],
  ['gw', 'Gravitational waves', 'LIGO, chirps, numerical relativity'],
  ['astro', 'Astrophysics & cosmology', 'Stars, the expanding universe'],
  ['propulsion', 'Propulsion & aerospace', 'Rockets, orbits, thermodynamics'],
  ['theory', 'Theoretical physics', 'Lagrangians, symmetry, quantum'],
];
const COURSE_CHOICES = ['m0', 'math1210', 'math1220', 'math2210', 'math2270', 'math2280', 'phys2210', 'phys2220', 'phys2710', 'prog'];

export function render(main) {
  const draft = {
    name: app.profile?.name || '',
    familiar: { ...(app.profile?.familiar || { math1210: 'done', math1220: 'taking', phys2210: 'taking', prog: 'done' }) },
    interests: new Set(app.profile?.interests || ['gr', 'blackholes', 'gw']),
    weeklyGoal: app.settings.weeklyGoal,
  };
  let step = 0;
  const paint = () => {
    main.replaceChildren(h('div.page.narrow', [intro, familiar, interests, finish][step]()));
  };
  const nav = (back, nextLabel, onNext) => h('div.player-nav', back ? h('button.btn.ghost', { type: 'button', onclick: () => { step--; paint(); } }, 'Back') : h('button.btn.ghost', { type: 'button', onclick: skip }, 'Skip setup'),
    h('button.btn.primary', { type: 'button', onclick: onNext || (() => { step++; paint(); }) }, nextLabel));
  const skip = () => { sessionStorage.setItem('atlas:skipWelcome', '1'); location.hash = '#/'; };

  function intro() {
    return h('div.stage',
      h('div', { html: LOGO.replace('width="34" height="34"', 'width="64" height="64"') }),
      h('h1', 'Welcome to The Physics Atlas'),
      h('div.prose',
        h('p', 'A personal academy from algebra to Einstein’s field equations: every course of USU’s Physics: Professional Emphasis B.S., plus the mathematics and physics of general relativity.'),
        h('p', 'Lessons are short: an idea, a picture you can play with, one worked example, then problems one at a time — with hints that never cost you anything. The Atlas tracks each skill from your answers and brings it back for review before it fades.'),
        h('p', 'Everything stays in this browser. Nothing is sent anywhere; you can export your progress to a file at any time.')),
      h('div.field', { style: { marginTop: '1rem' } }, h('label', { for: 'nm' }, 'What should the Atlas call you? (optional)'),
        h('input#nm', { type: 'text', value: draft.name, autocomplete: 'given-name', style: { padding: '.6rem .8rem', borderRadius: '10px', border: '1px solid var(--line-2)', background: 'var(--panel-2)', maxWidth: '320px' }, oninput: (e) => { draft.name = e.target.value.trim(); } })),
      nav(false, 'Get started'));
  }

  function familiar() {
    return h('div.stage',
      h('div.eyebrow', 'Step 1 of 3'), h('h1', 'Where are you starting?'),
      h('p.muted', 'This only chooses where the Atlas starts you. Taking or having taken a course never marks a topic as mastered — your answers do that.'),
      h('div.stack.s', COURSE_CHOICES.map((id) => {
        const c = app.cat.byId[id];
        return h('div.switch', h('div', h('b', c.title), h('div.tiny.faint', c.code)),
          h('div.seg', STATUS.map(([k, label]) => h('button', { type: 'button', 'aria-pressed': String((draft.familiar[id] || 'new') === k), onclick: (e) => { draft.familiar[id] = k; [...e.target.parentNode.children].forEach((b, i) => b.setAttribute('aria-pressed', String(STATUS[i][0] === k))); } }, label))));
      })),
      nav(true, 'Next'));
  }

  function interests() {
    return h('div.stage',
      h('div.eyebrow', 'Step 2 of 3'), h('h1', 'What draws you to physics?'),
      h('p.muted', 'Your interests pick the examples, the daily challenges and which road the dashboard points to.'),
      h('div.option-grid', INTERESTS.map(([k, title, sub]) => h('button.option', { type: 'button', 'aria-pressed': String(draft.interests.has(k)), onclick: (e) => { draft.interests.has(k) ? draft.interests.delete(k) : draft.interests.add(k); e.currentTarget.setAttribute('aria-pressed', String(draft.interests.has(k))); } }, h('b', title), h('small', sub)))),
      h('div.field', { style: { marginTop: '1.4rem' } }, h('label', 'Optional weekly goal'),
        h('div.seg', [[0, 'Off'], [2, '2 days'], [3, '3 days'], [4, '4 days'], [5, '5 days']].map(([v, label]) => h('button', { type: 'button', 'aria-pressed': String(draft.weeklyGoal === v), onclick: (e) => { draft.weeklyGoal = v; [...e.target.parentNode.children].forEach((b) => b.setAttribute('aria-pressed', String(b === e.target))); } }, label))),
        h('small', 'A goal counts study days per week. Missing a week never erases anything — you get a fresh start, and every four goal weeks earns a rest token.')),
      nav(true, 'Next'));
  }

  function finish() {
    const focus = [];
    for (const [id, s] of Object.entries(draft.familiar)) if (s === 'taking') focus.push(id);
    if (draft.interests.has('gr') || draft.interests.has('blackholes') || draft.interests.has('gw')) focus.push('gr');
    if (!focus.length) focus.push('math1220', 'phys2210');
    const save = async (dest) => {
      await setSettings({ weeklyGoal: draft.weeklyGoal });
      await setProfile({ name: draft.name, familiar: draft.familiar, interests: [...draft.interests], focus, onboarded: Date.now() });
      location.hash = dest;
    };
    return h('div.stage',
      h('div.eyebrow', 'Step 3 of 3'), h('h1', 'Your path'),
      h('p.muted', 'The Atlas will put these courses first. You can change focus any time, and explore anything — locked lessons are suggestions, not walls.'),
      h('div.stack.s', focus.map((id) => h('div.card.flat', h('div.row.between', h('b', app.cat.byId[id].title), h('span.chip.mono', app.cat.byId[id].code))))),
      h('div.callout', { style: { marginTop: '1.2rem' } }, h('b', 'Optional: a short diagnostic. '), 'Twenty minutes of unassisted questions on what you said you know. Skills you show are placed at Proficient (never Mastered) so you can skip what you already own.'),
      h('div.player-nav',
        h('button.btn.ghost', { type: 'button', onclick: () => { step--; paint(); } }, 'Back'),
        h('div.row', h('button.btn', { type: 'button', onclick: () => save('#/diagnostic') }, 'Take the diagnostic'),
          h('button.btn.primary', { type: 'button', onclick: () => save('#/'), html: `${icon('play')}Start learning` }))));
  }

  paint();
}
