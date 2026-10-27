// Progress: level and XP, mastery by course, achievements, confidence
// calibration and study history.

import { h, ring, bar, plural } from '../dom.js';
import { app } from '../state.js';
import { levelOf, rankOf, RANKS } from '../../core/progress.js';
import { courseProgress } from '../../core/plan.js';
import { STATES, STATE_LABEL } from '../../core/mastery.js';
import { masteryStack, heatmap } from '../widgets.js';
import { medalSVG } from '../medals.js';

export function render(main) {
  const { st, cat } = app;
  const lv = levelOf(st.xp);
  const started = cat.courses.filter((c) => courseProgress(cat, st, c.id).started);
  const cal = st.calibration;
  const calRow = (k, label) => {
    const c = cal[k];
    return h('tr', h('td', label), h('td', String(c.n)), h('td', c.n ? `${Math.round((100 * c.right) / c.n)}%` : '—'));
  };
  const nextRank = RANKS.find(([l]) => l > lv.level);
  main.append(h('div.page',
    h('header.page-head', h('h1', 'Progress'), h('p', 'XP measures effort and never goes down. Mastery is a separate, evidence-based estimate per skill — accuracy, hints, retries, spacing and transfer — shown in words because it is an estimate, not a measurement.')),
    h('div.grid.g3',
      h('div.card', h('div.row', h('span', { html: ring(lv.into / lv.span, { size: 84, stroke: 7, label: String(lv.level), sub: 'level' }) }),
        h('div.stat', h('b', rankOf(lv.level)), h('span', `${st.xp.toLocaleString()} XP`), h('span', `${(lv.next - st.xp).toLocaleString()} XP to level ${lv.level + 1}`), nextRank ? h('span', `${nextRank[1]} at level ${nextRank[0]}`) : null))),
      h('div.card', h('h3', 'Skills by state'), masteryStack(st.stateCounts),
        h('div.stack.s', { style: { marginTop: '.7rem' } }, STATES.slice(1).map((s, i) => h('div.row.between.small', h('span.state', { class: `s${i + 1}` }, h('i'), STATE_LABEL[s]), h('b', String(st.stateCounts[s])))))),
      h('div.card', h('h3', 'Confidence calibration'), h('p.tiny.faint', 'How often your first unaided answer was right, by how sure you said you were. Kept separate from mastery.'),
        h('table.t', h('thead', h('tr', h('th', 'You said'), h('th', 'Answers'), h('th', 'Right'))), h('tbody', calRow('sure', 'Sure'), calRow('unsure', 'Unsure'), calRow('guess', 'Guessing'))),
        cal.sure.n >= 5 && cal.sure.right / cal.sure.n < 0.7 ? h('p.small', { style: { color: 'var(--warn)', marginTop: '.5rem' } }, 'When you are sure you are right about two-thirds of the time or less — worth slowing down on “sure” answers.') : null)),
    h('section.section', h('h2', 'Courses'),
      started.length ? h('div.stack.s', started.map((c) => { const p = courseProgress(cat, st, c.id); return h('a.card.hover', { href: `#/course/${c.id}` }, h('div.row.between', h('b', c.title), h('span.small.faint', `${p.completed}/${p.ready} lessons · ${p.total} planned`)), h('div', { style: { margin: '.5rem 0' } }, bar(p.completion)), masteryStack(p.states, p.ready)); }))
        : h('p.muted', 'No courses started yet.')),
    h('section.section', h('h2', 'Achievements'), h('p.muted.small', `${plural(app.achievements.filter((a) => a.unlocked).length, 'achievement')} of ${app.achievements.length}. They reward habits that build understanding — never speed or volume.`),
      h('div.grid', { style: { gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))' } }, app.achievements.map((a) =>
        h(`div.medal${a.unlocked ? '' : '.locked'}`, h('div', { html: medalSVG(a, 64) }), h('b', a.title), h('small', a.blurb),
          !a.unlocked && a.progress ? [bar(a.progress[0] / a.progress[1]), h('small', `${a.progress[0]} / ${a.progress[1]}`)] : null,
          a.unlocked && app.seen[a.id] ? h('small', `Earned ${new Date(app.seen[a.id]).toLocaleDateString()}`) : null)))),
    h('section.section', h('h2', 'Study history'), h('div.card', h('div', { style: { overflowX: 'auto' } }, heatmap(168)), h('p.tiny.faint', { style: { marginTop: '.5rem' } }, 'Last 24 weeks. Darker squares: more practice that day.')))));
}
