// The simulation gallery: every interactive model, free to explore.

import { h, icon } from '../dom.js';
import { mountViz } from '../../viz/registry.js';
import GALLERY from '../../../content/gallery.js';
import { app } from '../state.js';

export function render(main, { sim }) {
  const destroyers = [];
  if (sim) {
    const g = GALLERY.find((x) => x.id === sim);
    if (!g) { main.append(h('div.page.narrow', h('h1', 'No such simulation'), h('a.btn', { href: '#/explore' }, 'All simulations'))); return; }
    const box = h('div');
    const from = g.lesson && app.cat.lessons[g.lesson];
    main.append(h('div.page.narrow', h('a.small', { href: '#/explore', html: `${icon('left')} All simulations` }), h('h1', { style: { marginTop: '.6rem' } }, g.title), h('p.muted', g.blurb),
      from ? h('p.small', 'From the lesson ', h('a', { href: `#/lesson/${from.id}` }, from.title), '.') : null, box));
    // a lesson's visual comes from its module; anything else is a spec here
    const spec = g.spec ? Promise.resolve(g.spec) : from?.ready ? from.load().then((m) => m.default.visual) : Promise.reject(new Error('lesson not built'));
    spec.then((s) => mountViz(box, s, {})).then((c) => destroyers.push(() => c.destroy())).catch(() => box.append(h('p.muted', 'This simulation could not load.')));
  } else {
    main.append(h('div.page',
      h('header.page-head', h('h1', 'Simulations'), h('p', 'Every interactive model in the Atlas, outside any lesson. Each one is computed live from the physics or mathematics it shows, and its caption says what it simplifies.')),
      h('div.grid.g3', GALLERY.map((g) => h('a.card.hover', { href: `#/explore/${g.id}` }, h('div.eyebrow', { math: 'Mathematics', physics: 'Physics', gr: 'Relativity' }[g.track]), h('h3', g.title), h('p.small.muted', g.blurb))))));
  }
  return () => destroyers.forEach((d) => d());
}
