// Boss battles. A course's authored boss (content/<course>/boss.js) is a set
// of multi-part problems built by evidence-centred design. Until one is
// written, the Atlas runs a provisional boss: mixed, unassisted checkpoint and
// transfer problems drawn from every built lesson of the course — and says so.

import { h, icon, clear, md } from '../dom.js';
import { app, log } from '../state.js';
import { itemsOf, instantiate } from '../../core/content.js';
import { mountQuestion } from '../player/question.js';
import { logResponse } from './lesson.js';
import { loadLesson } from '../player/session.js';
import { makeRng, hashString } from '../../core/rng.js';

export async function render(main, { course: id }) {
  const c = app.cat.byId[id];
  if (!c) { main.append(h('div.page.narrow', h('h1', 'No such course'))); return; }
  const prev = app.st.boss[id];
  const authored = c.bossLoad ? (await c.bossLoad()).default : null;
  const ready = [...new Set(c.lessonIds)].filter((l) => app.cat.lessons[l].ready);
  const nAuthored = authored ? authored.rounds.reduce((n, r) => n + r.items.length, 0) : 0;
  const intro = h('div.stage',
    h('div.eyebrow', `${c.code} · Boss battle`), h('h1', authored?.title || c.boss?.title || 'Boss battle'),
    authored?.intro ? md(authored.intro) : h('p.prose', c.boss?.blurb || ''),
    authored
      ? h('p.small.muted', `${authored.rounds.length} rounds, ${nAuthored} problems. Pass at ${Math.round(authored.pass * 100)}%.`)
      : h('div.callout', h('b', 'Provisional boss. '), `This course’s authored boss, with multi-part problems, is still in preparation. Until then the battle is ${Math.min(8, ready.length * 2)} mixed problems from the course’s ${ready.length} built lesson${ready.length === 1 ? '' : 's'}: no hints, one try each, pass at 70%.`),
    h('ul.small.muted', h('li', 'No hints and one try per problem — this measures what you can do on your own.'), h('li', 'Win or lose, a boss attempt earns 150 XP: effort counts.'), h('li', 'Your results feed your mastery estimates as transfer evidence.')),
    prev ? h('p.small', `Best so far: ${Math.round(prev.best * 100)}% over ${prev.attempts} attempt${prev.attempts > 1 ? 's' : ''}${prev.passed ? ' — defeated ✓' : ''}.`) : null,
    h('div.player-nav', h('a.btn.ghost', { href: `#/course/${id}` }, 'Back to the course'),
      authored || ready.length ? h('button.btn.primary.big', { type: 'button', onclick: () => fight(), html: `${icon('sword')}Begin` }) : h('span.muted', 'No lessons built yet.')));
  const wrap = h('div.player', intro);
  main.append(wrap);

  let current = null;
  async function fight() {
    const attempt = (prev?.attempts || 0) + 1;
    const rng = makeRng(hashString(`${id}|boss|${attempt}`));
    let pool = [];
    if (authored) {
      // an authored boss: its rounds in order, each item measuring a named lesson skill
      authored.rounds.forEach((round, ri) => round.items.forEach((def, k) => pool.push({ L: { id: `${id}.boss`, skills: [def.skill] }, def, round: k === 0 ? { ...round, n: ri + 1 } : null })));
    } else {
      const lessons = await Promise.all(ready.map(loadLesson));
      for (const L of lessons) for (const { def, context } of itemsOf(L)) if (context === 'checkpoint' || def.transfer) pool.push({ L, def });
      if (pool.length < 4) for (const L of lessons) for (const { def } of itemsOf(L)) pool.push({ L, def });
      pool = rng.shuffle(pool).slice(0, Math.min(8, Math.max(4, ready.length * 2)));
    }
    let k = 0, score = 0;
    const box = h('div');
    wrap.replaceChildren(h('div.player-top', h('span', { html: icon('sword'), style: { color: 'var(--warn)', display: 'inline-flex' } }), h('span.crumb', authored?.title || c.boss?.title)), h('section.stage', box));
    const next = () => {
      current?.destroy?.();
      clear(box);
      if (k >= pool.length) return finish();
      const { L, def, round } = pool[k];
      if (round) box.append(h('div.callout', h('b', `Round ${round.n} of ${authored.rounds.length} — ${round.title}`), round.story ? md(round.story, 'small') : null));
      const qbox = h('div');
      box.append(qbox);
      const item = instantiate(L, def, 500 + attempt * 37 + k);
      current = mountQuestion(qbox, item, {
        context: 'boss', assisted: false, index: k, total: pool.length, confidence: false,
        onResolved: (r) => { if (r.correct) score++; logResponse(L, item, 'boss', r, { mixed: true }); },
        onNext: () => { k++; next(); }, nextLabel: k + 1 < pool.length ? 'Next' : 'Finish',
      });
    };
    const finish = async () => {
      const passed = score / pool.length >= (authored?.pass ?? 0.7);
      await log('boss', { course: id, score, total: pool.length, passed, provisional: !authored });
      box.replaceChildren(h('div.summary-hero', h('div.eyebrow', passed ? 'Victory' : 'Not this time'), h('div.big', `${score} / ${pool.length}`),
        h('p.muted', passed ? 'Boss defeated. The skills you used here count as transfer evidence.' : 'Every problem you missed is now on your review list. Come back stronger.')),
      h('div.player-nav', h('a.btn.ghost', { href: `#/course/${id}` }, 'Course'), h('a.btn.primary', { href: '#/review' }, 'Review')));
    };
    next();
  }
  return () => current?.destroy?.();
}
