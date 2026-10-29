// Course detail: official identity and provenance, modules and lessons with
// mastery, estimated time, difficulty and prerequisites, and the boss battle.

import { h, icon, bar, statePill, difficultyDots, fmtMinutes } from '../dom.js';
import { app, subscribe } from '../state.js';
import { courseProgress, moduleProgress, prereqStatus, stateOf, completed } from '../../core/plan.js';
import { provenanceChip, evidenceChip, masteryStack } from '../widgets.js';

export function render(main, { course: id }) {
  const paint = () => main.replaceChildren(page(id));
  paint();
  return subscribe(paint);
}

function page(id) {
  const { cat, st } = app;
  const c = cat.byId[id];
  if (!c) return h('div.page.narrow', h('h1', 'No such course'), h('a.btn', { href: '#/library' }, 'Library'));
  const pr = courseProgress(cat, st, id);
  const next = c.lessonIds.find((l) => cat.lessons[l].ready && !completed(st, l));
  const minutes = c.lessonIds.reduce((a, l) => a + (cat.lessons[l].minutes || 6), 0);
  const prereqCourses = c.prereqs.map((p) => cat.byId[p]).filter(Boolean);

  const head = h('header.page-head',
    h('div.row', h('span.chip.mono', c.code), provenanceChip(c), evidenceChip(c), c.credits ? h('span.chip', `${c.credits} credits`) : null),
    h('h1', { style: { marginTop: '.6rem' } }, c.title),
    h('p', c.summary),
    c.catalog ? h('blockquote.callout', h('div.tiny.eyebrow', 'Official description'), h('div', `“${c.catalog}”`),
      c.source ? h('div.tiny', { style: { marginTop: '.3rem' } }, h('a', { href: c.source.url, target: '_blank', rel: 'noopener' }, c.source.label)) : null) : null,
    c.note ? h('p.small.faint', c.note) : null,
    prereqCourses.length ? h('div.row.small', h('span.faint', 'Builds on:'), prereqCourses.map((p) => h('a.chip', { href: `#/course/${p.id}` }, p.code))) : null,
  );

  const summary = h('div.grid.g3',
    h('div.card', h('div.stat', h('span.eyebrow', 'Progress'), h('b', pr.ready ? `${Math.round(pr.completion * 100)}%` : '—'),
      h('span', `${pr.completed} of ${pr.ready} built lessons`)), bar(pr.completion)),
    h('div.card', h('div.stat', h('span.eyebrow', 'Mastery'), h('b', pr.started ? `${pr.states.proficient + pr.states.mastered} proficient+` : 'Not started'),
      h('span', 'estimated from your answers')), pr.started ? masteryStack(pr.states, pr.ready) : bar(0)),
    h('div.card', h('div.stat', h('span.eyebrow', 'Scope'), h('b', `${c.modules.length} modules · ${pr.total} lessons`),
      h('span', `about ${fmtMinutes(minutes)} in total; ${pr.ready} built`))),
  );

  const actions = h('div.row', { style: { margin: '1.2rem 0 .4rem' } },
    next ? h('a.btn.primary', { href: `#/lesson/${next}`, html: `${icon('play')}${pr.completed ? 'Continue' : 'Start'}: ${cat.lessons[next].title}` }) : null,
    c.boss ? h('a.btn', { href: `#/boss/${c.id}`, html: `${icon('sword')}Boss battle: ${c.boss.title}` }) : null,
    h('a.btn.ghost', { href: `#/map/${c.id}`, html: `${icon('map')}Module map` }));

  const modules = c.modules.map((m, mi) => moduleBlock(c, m, mi));
  return h('div.page', head, summary, actions, h('section.section', h('h2', 'Modules'), modules));
}

function moduleBlock(c, m, mi) {
  const { cat, st } = app;
  const key = `${c.id}.${m.id}`;
  const mod = cat.modules[key];
  const mp = moduleProgress(cat, st, key);
  const refNote = m.refs ? h('div.small.faint', { style: { padding: '.6rem 1.1rem' } }, 'Taught by: ',
    m.refs.map((r, i) => [i ? ', ' : '', h('a', { href: `#/course/${r.split('.')[0]}` }, `${cat.byId[r.split('.')[0]].code} · ${cat.modules[r]?.title ?? r}`)])) : null;
  const open = mi < 2 || mod.lessonIds.some((l) => st.lessons[l] && !st.lessons[l].completed);
  return h('details.module', { open: open || null },
    h('summary', h('span.mcode', m.id), h('h3', m.title),
      m.badges ? h('span.row', m.badges.map(badge)) : null,
      h('span.small.faint.nowrap', mp.ready ? `${mp.completed}/${mp.ready}` : `${mp.total} planned`),
      h('span', { html: icon('right'), style: { display: 'inline-flex', color: 'var(--ink-3)' } })),
    refNote,
    h('div', mod.lessonIds.map((lid) => lessonRow(lid))));
}

export function badge(b) {
  const map = { 'est-obs': ['est', 'Established · observed'], 'est-der': ['est', 'Established · derived'], math: ['math', 'Mathematically allowed'], spec: ['spec', 'Speculative'], open: ['open', 'Open question'], refuted: ['refuted', 'Refuted claim'], model: ['model', 'Teaching model'] };
  const [cls, label] = map[b] || ['model', b];
  return h(`span.badge-st.${cls}`, label);
}

export function lessonRow(lid) {
  const { cat, st } = app;
  const L = cat.lessons[lid];
  const pre = prereqStatus(cat, st, lid);
  const locked = pre.some((p) => !p.met);
  const state = stateOf(st, lid);
  const done = completed(st, lid);
  const n = L.mode ? (L.mode === 'intuition' ? 'I' : 'D') : lid.split('.').pop();
  const meta = h('span.meta',
    L.mode ? h('span.chip', L.mode === 'intuition' ? 'Intuition' : 'Derivation') : null,
    L.kind === 'dissection' ? h('span.chip', 'Dissection') : null,
    L.ready ? [state !== 'not-started' ? statePill(state) : null, done ? h('span.chip.good', { html: `${icon('check')}done` }) : null] : h('span.chip.planned', 'planned'),
    locked && L.ready ? h('span.lock', { title: 'Prerequisites not yet met: ' + pre.filter((p) => !p.met).map((p) => p.title).join('; '), html: `${icon('lock')}` }) : null,
    h('span.nowrap', `${L.minutes} min`), difficultyDots(L.difficulty));
  const body = [h('span.n', n), h('span.t', L.title), meta];
  return L.ready
    ? h('a.lesson-row', { href: `#/lesson/${lid}` }, body)
    : h('div.lesson-row.planned', { title: 'This lesson is planned but not built yet.' }, body);
}
