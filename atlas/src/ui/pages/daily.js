// The daily challenge: one untimed problem a day, preferring transfer
// problems from lessons you have finished. Not tied to any streak.

import { h, icon } from '../dom.js';
import { app } from '../state.js';
import { dailyPick } from '../../core/plan.js';
import { runSession } from '../player/session.js';

export function render(main) {
  const pick = dailyPick(app.cat, app.st, Date.now(), new Date().getTimezoneOffset());
  if (!pick) { main.append(h('div.page.narrow', h('h1', 'Daily challenge'), h('p.muted', 'No lessons are built yet.'))); return; }
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const box = h('div');
  main.append(h('div.player',
    h('div.player-top', h('a.icon-btn', { href: '#/', 'aria-label': 'Home', html: icon('left') }), h('span.crumb', `Daily challenge · ${date}`)),
    h('section.stage', h('div.eyebrow', 'Daily challenge'), h('h1', 'One problem, no clock'),
      h('p.muted', 'A fresh problem every day from what you have learned. Take as long as you like — hints are there if you want them.'), box)));
  const s = runSession(box, [{ ...pick, reason: null }], {
    context: 'daily', prefer: 'transfer', label: () => 'Today’s problem',
    onDone: (r) => box.replaceChildren(h('div.summary-hero', h('div.big', r[0]?.correct ? 'Solved' : 'Attempted'), h('p.muted', 'Come back tomorrow for a new one — or not; nothing is lost either way.'), h('a.btn', { href: '#/' }, 'Home'))),
  });
  return () => s.destroy();
}
