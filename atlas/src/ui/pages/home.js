// Home dashboard: continue learning, reviews due, today's challenge, goals,
// active courses, mastery overview, recent achievements, history.

import { h, icon, ring, bar, plural } from '../dom.js';
import { app, subscribe } from '../state.js';
import { recommendNext, courseProgress, dailyPick, frontier } from '../../core/plan.js';
import { levelOf, rankOf } from '../../core/progress.js';
import { STATES, STATE_LABEL } from '../../core/mastery.js';
import { courseCard, heroCanvas, heatmap, masteryStack } from '../widgets.js';
import { medalSVG } from '../medals.js';
import { ROUTES } from '../../../content/gr/index.js';
import { installState } from '../offline.js';

export function render(main) {
  let stopHero = null;
  const paint = () => {
    if (stopHero) stopHero();
    main.replaceChildren(page());
    const hero = main.querySelector('.hero');
    if (hero) stopHero = heroCanvas(hero);
  };
  paint();
  const unsub = subscribe(paint);
  return () => { unsub(); if (stopHero) stopHero(); };
}

function greeting() {
  const hr = new Date().getHours();
  return hr < 5 ? 'Working late' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
}

function page() {
  const { cat, st, profile } = app;
  const nextId = recommendNext(cat, st, profile || {});
  const next = nextId ? cat.lessons[nextId] : null;
  const lv = levelOf(st.xp);
  const due = st.due.length;
  const daily = dailyPick(cat, st, Date.now(), new Date().getTimezoneOffset());
  const dailyDone = daily && app.events.some((e) => e.kind === 'response' && e.context === 'daily' && Math.floor((e.t - new Date().getTimezoneOffset() * 60000) / 86400000) === daily.day);

  const hero = h('section.hero',
    h('div.eyebrow', greeting() + (profile?.name ? `, ${profile.name}` : '')),
    next
      ? [h('h1', 'Continue your journey'),
        h('div.lesson-title', next.title),
        h('p.muted', `${cat.byId[next.course].code} · ${cat.modules[next.module].title} · about ${next.minutes} minutes`),
        h('div.row', { style: { marginTop: '1rem' } },
          h('a.btn.primary.big', { href: `#/lesson/${next.id}`, html: `${icon('play')}Continue learning` }),
          h('a.btn', { href: `#/course/${next.course}` }, 'Course overview'))]
      : [h('h1', 'Where to next?'), h('p.muted', 'Pick a course in the library, or take the optional diagnostic so the Atlas can place you.'),
        h('div.row', h('a.btn.primary', { href: '#/library' }, 'Open the library'), h('a.btn', { href: '#/diagnostic' }, 'Take the diagnostic'))],
  );

  const stats = h('section.grid.g4.section',
    h('div.card', h('div.row', h('span', { html: ring(lv.into / lv.span, { size: 58, stroke: 5, label: String(lv.level) }) }),
      h('div.stat', h('b', rankOf(lv.level)), h('span', `${st.xp.toLocaleString()} XP · ${(lv.next - st.xp).toLocaleString()} to next level`)))),
    h('a.card.hover', { href: '#/review' }, h('div.stat', h('span.eyebrow', 'Spaced review'), h('b', due ? plural(due, 'skill') + ' due' : 'All caught up'),
      h('span', due ? 'Reviews keep what you learned from fading.' : st.struggling.length ? `${st.struggling.length} skill${st.struggling.length > 1 ? 's' : ''} could use targeted practice` : 'Nothing is due yet.'))),
    daily ? h('a.card.hover', { href: '#/daily' }, h('div.stat', h('span.eyebrow', 'Daily challenge'), h('b', dailyDone ? 'Solved today' : 'One problem, untimed'),
      h('span', cat.lessons[daily.lesson]?.title ?? ''))) : h('div.card', h('div.stat', h('span.eyebrow', 'Daily challenge'), h('b', '—'))),
    weeklyCard(),
  );

  // active courses: focus first, then any started
  const focus = profile?.focus || [];
  const started = cat.courses.filter((c) => courseProgress(cat, st, c.id).started).map((c) => c.id);
  const active = [...new Set([...focus, ...started])].map((id) => cat.byId[id]).filter(Boolean).slice(0, 6);

  const courses = h('section.section',
    h('div.row.between', h('h2', 'Your courses'), h('a.btn.small.ghost', { href: '#/library' }, 'All courses →')),
    active.length ? h('div.grid.g3', active.map(courseCard))
      : h('div.grid.g3', ['math1220', 'phys2210', 'gr'].map((id) => cat.byId[id]).map(courseCard)));

  const counts = st.stateCounts;
  const learned = STATES.slice(1).reduce((a, s) => a + counts[s], 0);
  const masteryCard = h('div.card',
    h('div.row.between', h('h3', 'Mastery overview'), h('a.small', { href: '#/progress' }, 'Details')),
    h('p.small.faint', 'The Atlas estimates each skill from your answers — accuracy, hints, retries, spacing and transfer. These are estimates, not grades.'),
    learned ? [masteryStack(counts, learned), h('div.row.small', { style: { marginTop: '.6rem' } }, STATES.slice(1).map((s, i) => h('span.state', { class: `s${i + 1}` }, h('i'), `${counts[s]} ${STATE_LABEL[s]}`)))]
      : h('p.muted.small', 'Start a lesson to see your first estimates.'));

  const recent = app.achievements.filter((a) => a.unlocked).sort((a, b) => (app.seen[b.id] || 0) - (app.seen[a.id] || 0)).slice(0, 3);
  const achCard = h('div.card',
    h('div.row.between', h('h3', 'Recent achievements'), h('a.small', { href: '#/progress' }, 'All')),
    recent.length ? h('div.row', recent.map((a) => h('div', { style: { textAlign: 'center', width: '96px' } }, h('div', { html: medalSVG(a, 52) }), h('div.tiny', a.title))))
      : h('p.muted.small', 'Achievements reward habits that build understanding — coming back to a skill, recovering from a mistake, owning a skill after a hint.'));

  const fastDone = ROUTES.fastTrack.filter((n) => st.lessons[`gr.S${String(n).padStart(2, '0')}.i`]?.completed).length;
  const grCard = h('a.card.hover', { href: '#/gr' },
    h('div.row', h('span', { html: icon('orbit'), style: { color: 'var(--accent-2)', display: 'inline-flex' } }), h('h3', { style: { margin: 0 } }, 'The Road to Einstein’s Field Equations')),
    h('p.small.muted', 'Black-hole fast track: proper time → geodesics → Schwarzschild → time dilation → orbits → horizons → lensing, at Calculus II level.'),
    bar(fastDone / ROUTES.fastTrack.length, 'gold'), h('div.tiny.faint', { style: { marginTop: '.35rem' } }, `${fastDone} of ${ROUTES.fastTrack.length} fast-track steps`));

  const ready = frontier(cat, st).length;
  const histCard = h('div.card', h('div.row.between', h('h3', 'Study history'), h('span.tiny.faint', 'last 12 weeks')), h('div', { style: { overflowX: 'auto' } }, heatmap(84)),
    h('p.tiny.faint', { style: { marginTop: '.5rem' } }, `${ready} lesson${ready === 1 ? '' : 's'} ready to learn right now.`));

  return h('div.page', hero, installTip(), stats, courses,
    h('section.section.grid.g2', masteryCard, achCard),
    h('section.section.grid.g2', grCard, histCard));
}

function weeklyCard() {
  const w = app.st.weekly;
  if (!w.enabled) {
    return h('a.card.hover', { href: '#/settings' }, h('div.stat', h('span.eyebrow', 'Weekly goal'), h('b', 'Off'),
      h('span', 'Optional. Set a number of study days per week — missing a week never erases your progress.')));
  }
  return h('div.card', h('div.stat', h('span.eyebrow', 'Weekly goal'), h('b', `${Math.min(w.doneThisWeek, w.goal)} / ${w.goal} days`),
    h('span', w.run > 1 ? `${w.run} goal weeks in a row${w.tokens ? ` · ${w.tokens} rest token${w.tokens > 1 ? 's' : ''}` : ''}` : 'New week, fresh start.')),
  bar(Math.min(1, w.doneThisWeek / w.goal)));
}

// On a phone, until it is installed or dismissed: say the Atlas can live on the home screen.
function installTip() {
  let dismissed = false;
  try { dismissed = localStorage.getItem('atlas:installTip') === 'no'; } catch { /* private mode */ }
  const how = installState();
  if (dismissed || how === 'installed' || !matchMedia('(max-width: 860px)').matches) return null;
  const tip = h('section.card.section', { style: { display: 'flex', gap: '.8rem', alignItems: 'center' } },
    h('div', { style: { flex: 1 } }, h('b', 'Put the Atlas on your home screen'),
      h('div.tiny.faint', how === 'ios' ? 'Tap Share, then “Add to Home Screen”. It opens full screen, and Settings can save every lesson for offline use.'
        : 'It opens full screen like an app, and Settings can save every lesson for offline use.')),
    how === 'ios' ? null : h('a.btn.small', { href: '#/settings' }, 'How'),
    h('button.icon-btn', { type: 'button', 'aria-label': 'Dismiss', html: icon('x'), onclick: () => { try { localStorage.setItem('atlas:installTip', 'no'); } catch { /* ignore */ } tip.remove(); } }));
  return tip;
}
