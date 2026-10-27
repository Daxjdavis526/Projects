// The simulation gallery: every interactive model, free to explore.

import { h, icon } from '../dom.js';
import { mountViz } from '../../viz/registry.js';
import GALLERY from '../../../content/gallery.js';

export function render(main, { sim }) {
  const destroyers = [];
  if (sim) {
    const g = GALLERY.find((x) => x.id === sim);
    if (!g) { main.append(h('div.page.narrow', h('h1', 'No such simulation'), h('a.btn', { href: '#/explore' }, 'All simulations'))); return; }
    const box = h('div');
    main.append(h('div.page.narrow', h('a.small', { href: '#/explore', html: `${icon('left')} All simulations` }), h('h1', { style: { marginTop: '.6rem' } }, g.title), h('p.muted', g.blurb), box));
    mountViz(box, g.spec, {}).then((c) => destroyers.push(() => c.destroy()));
  } else {
    main.append(h('div.page',
      h('header.page-head', h('h1', 'Simulations'), h('p', 'Every interactive model in the Atlas, outside any lesson. Each one is computed live from the physics or mathematics it shows, and its caption says what it simplifies.')),
      h('div.grid.g3', GALLERY.map((g) => h('a.card.hover', { href: `#/explore/${g.id}` }, h('div.eyebrow', { math: 'Mathematics', physics: 'Physics', gr: 'Relativity' }[g.track]), h('h3', g.title), h('p.small.muted', g.blurb))))));
  }
  return () => destroyers.forEach((d) => d());
}
