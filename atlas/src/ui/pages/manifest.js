// The curriculum coverage manifest: every course with its USU identifier,
// provenance and evidence, its source, and the live implementation status of
// every lesson — plus what still has to be checked before anything is labelled
// official.

import { h, icon } from '../dom.js';
import { app } from '../state.js';
import { PROVENANCE } from '../../core/catalog.js';
import { provenanceChip, evidenceChip } from '../widgets.js';

export function render(main) {
  const cat = app.cat;
  const lessons = Object.values(cat.lessons);
  const built = lessons.filter((l) => l.ready).length;
  const rows = cat.courses.map((c) => {
    const ids = [...new Set(c.lessonIds)].filter((l) => cat.lessons[l].course === c.id || c.alias);
    const own = ids.filter((l) => cat.lessons[l].course === c.id);
    const b = own.filter((l) => cat.lessons[l].ready).length;
    return h('tr',
      h('td', h('a', { href: `#/course/${c.id}` }, c.title), h('div.tiny.faint.mono', c.id)),
      h('td.mono.small', c.code),
      h('td', provenanceChip(c), ' ', evidenceChip(c)),
      h('td.small', c.alias ? 'routes through 2270/2280' : `${c.modules.length} modules`),
      h('td.small', c.alias ? '—' : `${b} built / ${own.length}`),
      h('td.small', c.source ? h('a', { href: c.source.url, target: '_blank', rel: 'noopener' }, c.source.label) : '—'));
  });
  const detail = cat.courses.filter((c) => !c.alias).map((c) => h('details.module',
    h('summary', h('span.mcode', c.id), h('h3', c.title), h('span.small.faint', `${c.lessonIds.filter((l) => cat.lessons[l].course === c.id && cat.lessons[l].ready).length} built`)),
    h('div.table-wrap', { style: { border: 0, borderRadius: 0 } }, h('table.t', h('thead', h('tr', h('th', 'Lesson id'), h('th', 'Topic'), h('th', 'Status'))),
      h('tbody', c.lessonIds.filter((l) => cat.lessons[l].course === c.id).map((l) => h('tr', h('td.mono.tiny', l), h('td.small', cat.lessons[l].ready ? h('a', { href: `#/lesson/${l}` }, cat.lessons[l].title) : cat.lessons[l].title),
        h('td', cat.lessons[l].ready ? h('span.chip.good', 'built') : h('span.chip.planned', 'planned')))))))));
  main.append(h('div.page',
    h('header.page-head', h('h1', 'Coverage manifest'),
      h('p', `Every lesson the Atlas plans, with where it comes from and whether it is built. ${built} of ${lessons.length} lessons are built.`),
      h('p.small.faint', 'USU facts were gathered from search-engine snippets because the research environment could not open USU’s websites; each course carries an evidence letter. A and B may be shown as official (with their catalog edition); C is a listing or third-party source; D is an inference and never official.')),
    h('div.row.small', { style: { marginBottom: '1rem' } }, Object.entries(PROVENANCE).map(([k, p]) => h(`span.chip.${p.tone}`, { title: p.blurb }, p.label))),
    h('div.table-wrap', h('table.t', h('thead', h('tr', h('th', 'Course'), h('th', 'USU identifier'), h('th', 'Provenance'), h('th', 'Scope'), h('th', 'Lessons'), h('th', 'Primary source'))), h('tbody', rows))),
    h('section.section', h('h2', 'Still to verify before anything is labelled official'),
      h('ul.small.muted',
        h('li', 'The course rows of the 28- and 26-credit requirement blocks, and the full 2026–27 degree-map grid (paste the catalog’s Program Requirements and Suggested Degree Maps tabs, or allow catalog.usu.edu).'),
        h('li', 'Catalog prerequisites for PHYS 2710, 3710, 3750 and 4710; PHYS 4710’s description; learning objectives and terms offered.'),
        h('li', 'Whether MATH 2250’s 4 credits count inside the 13-credit math block; CS 1400’s language (strongly inferred Python).'),
        h('li', 'Data licences for GWOSC, Pantheon+, MAST and Gaia before the research projects ship.'))),
    h('section.section', h('h2', 'Every lesson'), detail),
    h('p.tiny.faint', { style: { marginTop: '1rem' } }, h('span', { html: icon('info'), style: { display: 'inline-flex', verticalAlign: 'middle' } }), ' The full research report behind this manifest is in the repository at reports/Physics Atlas curriculum and design.md.')));
}
