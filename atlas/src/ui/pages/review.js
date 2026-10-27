// Spaced review: due skills (lowest recall first), targeted practice for
// skills you are struggling with, and retests of answers you were sure of but
// got wrong — interleaved, fresh numbers every time.

import { h, icon, statePill, plural, relTime } from '../dom.js';
import { app } from '../state.js';
import { planReview } from '../../core/plan.js';
import { runSession, sessionSummary } from '../player/session.js';

export function render(main) {
  let session = null;
  const start = () => {
    const picks = planReview(app.cat, app.st, Date.now(), { max: 12 });
    const box = h('div');
    main.replaceChildren(h('div.player', h('div.player-top', h('a.icon-btn', { href: '#/review', 'aria-label': 'Back', html: icon('left') }), h('span.crumb', 'Review session')), h('section.stage', box)));
    session = runSession(box, picks, { context: 'review', onDone: (results) => { box.replaceChildren(sessionSummary(results, { title: 'Review complete', onAgain: start })); } });
  };
  const overview = () => {
    const { st, cat } = app;
    const picks = planReview(cat, st, Date.now(), { max: 12 });
    const learned = Object.keys(st.cards).length;
    const rows = Object.entries(st.cards).map(([id, card]) => ({ id, card, s: st.skills[id] })).filter((r) => cat.lessons[r.id])
      .sort((a, b) => (a.s?.due ?? 0) - (b.s?.due ?? 0));
    main.replaceChildren(h('div.page',
      h('header.page-head', h('h1', 'Review'),
        h('p', 'Spaced retrieval is one of the best-supported findings in learning science: recalling something just as it starts to fade makes it last. Each review uses fresh numbers, mixes topics, and moves only your estimates — never your XP downward.')),
      h('div.grid.g3',
        h('div.card', h('div.stat', h('span.eyebrow', 'Due now'), h('b', plural(st.due.length, 'skill')), h('span', 'scheduled by FSRS-6 at 90% target recall'))),
        h('div.card', h('div.stat', h('span.eyebrow', 'Targeted practice'), h('b', plural(st.struggling.length, 'skill')), h('span', 'recent answers suggest these need work'))),
        h('div.card', h('div.stat', h('span.eyebrow', 'In your memory bank'), h('b', plural(learned, 'skill')), h('span', 'each with its own review schedule')))),
      h('div.row', { style: { margin: '1.4rem 0' } },
        picks.length ? h('button.btn.primary.big', { type: 'button', onclick: start, html: `${icon('play')}Start a ${picks.length}-question review` }) : h('p.muted', 'Nothing to review yet — finish a lesson checkpoint and its skill joins your review schedule.')),
      rows.length ? h('section.section', h('h2', 'Your schedule'),
        h('div.table-wrap', h('table.t', h('thead', h('tr', h('th', 'Skill'), h('th', 'Estimate'), h('th', 'Recall now'), h('th', 'Next review'))),
          h('tbody', rows.map(({ id, s }) => h('tr',
            h('td', h('a', { href: `#/lesson/${id}` }, cat.lessons[id].title), h('div.tiny.faint', cat.byId[cat.lessons[id].course].code)),
            h('td', statePill(s?.state ?? 'learning')),
            h('td', s?.recall !== undefined ? `${Math.round(s.recall * 100)}%` : '—'),
            h('td', s?.due ? (s.due <= Date.now() ? h('b', 'now') : relFuture(s.due)) : '—'))))))) : null));
  };
  overview();
  return () => session?.destroy();
}

function relFuture(t) {
  const d = Math.round((t - Date.now()) / 86400000);
  return d <= 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
}
export { relTime };
