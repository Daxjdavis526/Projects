// The skill map: courses (or one course's modules) as a layered graph of
// prerequisites. Pan by dragging, zoom with the wheel or the buttons; select a
// node to see what it builds on and what it unlocks. Locked nodes are only a
// suggestion — every lesson can be opened.

import { h, icon, bar, stateColor } from '../dom.js';
import { app } from '../state.js';
import { courseGraph, moduleGraph, layout, courseProgress, moduleProgress } from '../../core/plan.js';
import { TRACKS } from '../../core/catalog.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) e.setAttribute(k, v); kids.flat().forEach((k) => k && e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k)); return e; };
const TRACK_COLOR = { math: 'var(--accent)', physics: 'var(--teal)', experimental: 'var(--warn)', computing: 'var(--good)', spacetime: 'var(--violet)', gr: 'var(--gold)' };

export function render(main, { course }) {
  const cat = app.cat;
  const isCourse = !!course && cat.byId[course];
  const graph = isCourse ? moduleGraph(cat, [course]) : courseGraph(cat);
  const lay = layout(graph);
  const W = 190, Hn = 50, GX = 70, GY = 22;
  const pos = {};
  lay.layers.forEach((L, li) => L.forEach((id, i) => { pos[id] = { x: li * (W + GX), y: i * (Hn + GY) - (L.length * (Hn + GY)) / 2 }; }));

  const preds = {}, succs = {};
  for (const n of graph.nodes) { preds[n.id] = []; succs[n.id] = []; }
  for (const e of graph.edges) { preds[e.to]?.push(e.from); succs[e.from]?.push(e.to); }

  const svg = sv('svg', { role: 'img', 'aria-label': isCourse ? `Module map of ${cat.byId[course].title}` : 'Map of all courses and their prerequisites' });
  const world = sv('g');
  svg.append(world);
  const edges = graph.edges.map((e) => {
    const a = pos[e.from], b = pos[e.to];
    const x1 = a.x + W, y1 = a.y + Hn / 2, x2 = b.x, y2 = b.y + Hn / 2;
    const p = sv('path', { class: 'map-edge', d: `M${x1},${y1} C${x1 + GX * 0.6},${y1} ${x2 - GX * 0.6},${y2} ${x2},${y2}` });
    p.dataset.from = e.from; p.dataset.to = e.to;
    world.append(p);
    return p;
  });
  const nodes = graph.nodes.map((n) => {
    const p = pos[n.id];
    const prog = isCourse ? moduleProgress(cat, app.st, n.id) : courseProgress(cat, app.st, n.id);
    const color = isCourse ? 'var(--accent)' : TRACK_COLOR[n.track];
    const frac = prog.mastery ?? 0;
    const g = sv('g', { class: 'map-node', transform: `translate(${p.x},${p.y})`, tabindex: '0', role: 'button', 'aria-label': n.title });
    g.append(
      sv('rect', { width: W, height: Hn, rx: 11 }),
      sv('rect', { x: 0, y: 0, width: 4, height: Hn, rx: 2, fill: color, stroke: 'none' }),
      sv('text', { x: 14, y: 20 }, trunc(n.title, 26)),
      sv('text', { x: 14, y: 36, class: 'sub' }, isCourse ? `${prog.ready}/${prog.total} built` : `${n.code}`),
      sv('rect', { x: 14, y: 42, width: W - 28, height: 3, rx: 1.5, fill: 'var(--panel-3)', stroke: 'none' }),
      sv('rect', { x: 14, y: 42, width: Math.max(0, (W - 28) * frac), height: 3, rx: 1.5, fill: stateColor(frac > 0.85 ? 'mastered' : frac > 0.6 ? 'proficient' : frac > 0.3 ? 'developing' : 'learning'), stroke: 'none' }),
    );
    g.dataset.id = n.id;
    g.addEventListener('click', () => select(n.id));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); } });
    world.append(g);
    return g;
  });

  const panel = h('div.card.map-panel', { hidden: true });
  const legend = h('div.map-legend', isCourse ? [h('span', 'Bars show estimated mastery of built lessons.')] : TRACKS.map((t) => h('span.row', { style: { gap: '.35rem' } }, h('i', { style: { width: '10px', height: '10px', borderRadius: '3px', background: TRACK_COLOR[t.id], display: 'inline-block' } }), t.title)));
  const zoomIn = h('button.icon-btn', { type: 'button', 'aria-label': 'Zoom in', onclick: () => zoom(1.2) }, '+');
  const zoomOut = h('button.icon-btn', { type: 'button', 'aria-label': 'Zoom out', onclick: () => zoom(1 / 1.2) }, '−');
  const fitBtn = h('button.icon-btn', { type: 'button', 'aria-label': 'Fit to view', onclick: () => fit(), html: icon('target') });
  const wrap = h('div.map-wrap', svg, panel, legend, h('div', { style: { position: 'absolute', left: '1rem', top: '1rem', display: 'flex', gap: '.4rem' } }, zoomIn, zoomOut, fitBtn));

  main.append(h('div.page',
    h('header.page-head', h('h1', isCourse ? `${cat.byId[course].title}: module map` : 'Skill map'),
      h('p', isCourse ? 'Modules of this course and how they depend on one another.' : 'How every course connects — from algebra through calculus, mechanics and electromagnetism to tensors, geometry and general relativity. Select a course to see its prerequisites and what it unlocks.'),
      h('div.row', isCourse ? h('a.btn.small', { href: '#/map' }, '← All courses') : null,
        h('select', { 'aria-label': 'Show the module map of a course', onchange: (e) => { if (e.target.value) location.hash = `#/map/${e.target.value}`; } },
          h('option', { value: '' }, 'Module map of a course…'), cat.courses.map((c) => h('option', { value: c.id, selected: c.id === course || null }, `${c.code} — ${c.title}`))))),
    wrap));

  // pan and zoom
  let view = { x: 0, y: 0, k: 1 };
  const apply = () => world.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);
  function fit() {
    const xs = Object.values(pos).map((p) => p.x), ys = Object.values(pos).map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs) + W, minY = Math.min(...ys), maxY = Math.max(...ys) + Hn;
    const r = svg.getBoundingClientRect();
    const k = Math.min(1.4, Math.min((r.width - 40) / (maxX - minX), (r.height - 80) / (maxY - minY)));
    view = { k, x: (r.width - (maxX - minX) * k) / 2 - minX * k, y: (r.height - (maxY - minY) * k) / 2 - minY * k + 10 };
    apply();
  }
  function zoom(f, cx, cy) {
    const r = svg.getBoundingClientRect();
    cx ??= r.width / 2; cy ??= r.height / 2;
    view.x = cx - (cx - view.x) * f; view.y = cy - (cy - view.y) * f; view.k *= f;
    apply();
  }
  let drag = null;
  svg.addEventListener('pointerdown', (e) => { if (e.target.closest('.map-node')) return; drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; svg.classList.add('dragging'); svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (!drag) return; view.x = drag.vx + e.clientX - drag.x; view.y = drag.vy + e.clientY - drag.y; apply(); });
  svg.addEventListener('pointerup', () => { drag = null; svg.classList.remove('dragging'); });
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  requestAnimationFrame(fit);

  function select(id) {
    const anc = closure(id, preds), desc = closure(id, succs);
    nodes.forEach((g) => { const nid = g.dataset.id; g.classList.toggle('sel', nid === id); g.classList.toggle('dim', nid !== id && !anc.has(nid) && !desc.has(nid)); });
    edges.forEach((p) => { const on = (anc.has(p.dataset.from) || p.dataset.from === id) && (anc.has(p.dataset.to) || p.dataset.to === id) || (desc.has(p.dataset.to) || p.dataset.to === id) && (desc.has(p.dataset.from) || p.dataset.from === id); p.classList.toggle('hi', on); p.classList.toggle('dim', !on); });
    panel.hidden = false;
    if (isCourse) {
      const m = cat.modules[id];
      const mp = moduleProgress(cat, app.st, id);
      panel.replaceChildren(h('div.eyebrow', m.id), h('h3', m.title), bar(mp.completed / Math.max(1, mp.ready)), h('p.small.muted', `${mp.ready} of ${mp.total} lessons built · ${mp.completed} done`),
        h('div.stack.s', { style: { marginTop: '.6rem' } }, m.lessonIds.slice(0, 8).map((l) => cat.lessons[l].ready ? h('a.small', { href: `#/lesson/${l}` }, cat.lessons[l].title) : h('span.small.faint', cat.lessons[l].title))),
        h('button.btn.small.ghost', { type: 'button', style: { marginTop: '.6rem' }, onclick: clearSel }, 'Clear'));
    } else {
      const c = cat.byId[id];
      const pr = courseProgress(cat, app.st, id);
      panel.replaceChildren(h('div.eyebrow', c.code), h('h3', c.title), h('p.small.muted', c.summary), bar(pr.completion),
        h('p.tiny.faint', `${pr.completed}/${pr.ready} built lessons done · ${pr.total} planned`),
        preds[id].length ? h('p.small', h('b', 'Builds on: '), preds[id].map((p) => cat.byId[p].code).join(', ')) : null,
        succs[id].length ? h('p.small', h('b', 'Unlocks: '), succs[id].map((p) => cat.byId[p].code).join(', ')) : null,
        h('div.row', h('a.btn.small.primary', { href: `#/course/${id}` }, 'Open course'), h('a.btn.small', { href: `#/map/${id}` }, 'Module map'), h('button.btn.small.ghost', { type: 'button', onclick: clearSel }, 'Clear')));
    }
  }
  function clearSel() { panel.hidden = true; nodes.forEach((g) => g.classList.remove('sel', 'dim')); edges.forEach((p) => p.classList.remove('hi', 'dim')); }
}

function closure(id, adj) {
  const out = new Set(), stack = [...(adj[id] || [])];
  while (stack.length) { const x = stack.pop(); if (out.has(x)) continue; out.add(x); stack.push(...(adj[x] || [])); }
  return out;
}
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
