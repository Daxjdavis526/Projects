// Course library, organised by track.

import { h } from '../dom.js';
import { app } from '../state.js';
import { TRACKS } from '../../core/catalog.js';
import { courseCard } from '../widgets.js';

export function render(main, { track }) {
  const tracks = track ? TRACKS.filter((t) => t.id === track) : TRACKS;
  const tabs = h('div.seg', { role: 'group', 'aria-label': 'Filter by track' },
    h('button', { 'aria-pressed': !track ? 'true' : 'false', onclick: () => (location.hash = '#/library') }, 'All'),
    TRACKS.map((t) => h('button', { 'aria-pressed': track === t.id ? 'true' : 'false', onclick: () => (location.hash = `#/library/${t.id}`) }, t.title)));
  const total = Object.keys(app.cat.lessons).length;
  const ready = Object.values(app.cat.lessons).filter((l) => l.ready).length;
  main.append(h('div.page',
    h('header.page-head', h('h1', 'Library'),
      h('p', 'Every course of USU’s Physics: Professional Emphasis B.S., plus the mathematics and physics of general relativity. Each course says where it comes from: USU required, a USU course this degree does not require, or supplementary.'),
      h('p.small.faint', `${ready} of ${total} planned lessons are built so far; the rest are listed so you can see the whole map.`)),
    h('div', { style: { overflowX: 'auto', marginBottom: '1.4rem' } }, tabs),
    tracks.map((t) => h('section.section',
      h('div', h('h2', t.title), h('p.muted.small', t.blurb)),
      h('div.grid.g3', app.cat.courses.filter((c) => c.track === t.id).map(courseCard))))));
}
