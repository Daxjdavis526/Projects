// The optional diagnostic: unassisted questions from the courses you said you
// know. Every skill you answer correctly is placed at Proficient (placed) —
// never Mastered — so you can skip lessons you already own. Placements are
// revoked automatically if later answers disagree.

import { h, icon, clear } from '../dom.js';
import { app, log } from '../state.js';
import { itemsOf, instantiate } from '../../core/content.js';
import { mountQuestion } from '../player/question.js';
import { logResponse } from './lesson.js';
import { loadLesson } from '../player/session.js';

const MAX_ITEMS = 25;

export function render(main) {
  const familiar = app.profile?.familiar || {};
  const courses = Object.entries(familiar).filter(([, s]) => s === 'done' || s === 'taking').map(([id]) => id);
  const candidates = courses.flatMap((cid) => (app.cat.byId[cid]?.lessonIds || []).filter((l) => app.cat.lessons[l].ready));
  const wrap = h('div.player');
  main.append(wrap);
  wrap.append(h('section.stage',
    h('div.eyebrow', 'Optional'), h('h1', 'Diagnostic'),
    h('div.prose', h('p', 'Up to 25 unassisted questions — no hints, one try — from the courses you told the Atlas you know. Stop whenever you like; results so far still count.'),
      h('p', 'Each skill you answer correctly is placed at **Proficient (placed)**. Placement can never reach Mastered, and it is revoked if later reviews disagree.')),
    candidates.length ? null : h('div.callout', 'None of the courses you marked as known have built lessons yet, so there is nothing to diagnose. ', h('a', { href: '#/welcome' }, 'Change your starting point'), ' or ', h('a', { href: '#/library' }, 'browse the library'), '.'),
    h('div.player-nav', h('a.btn.ghost', { href: '#/' }, 'Not now'), candidates.length ? h('button.btn.primary', { type: 'button', onclick: run, html: `${icon('play')}Begin` }) : null)));

  let current = null;
  async function run() {
    const picks = candidates.slice(0, MAX_ITEMS);
    const placed = [];
    let k = 0;
    const box = h('div');
    const stopBtn = h('button.btn.ghost.small', { type: 'button', onclick: () => finish() }, 'Stop and save results');
    wrap.replaceChildren(h('div.player-top', h('span.crumb', 'Diagnostic'), h('span', { style: { flex: 1 } }), stopBtn), h('section.stage', box));
    const next = async () => {
      current?.destroy?.();
      clear(box);
      if (k >= picks.length) return finish();
      const L = await loadLesson(picks[k]);
      const defs = itemsOf(L).filter((x) => x.context === 'checkpoint').map((x) => x.def);
      const def = defs[0] || itemsOf(L)[0].def;
      const item = instantiate(L, def, 900 + k);
      box.append(h('div.small.faint', { style: { marginBottom: '.5rem' } }, `${app.cat.byId[app.cat.lessons[L.id].course].code} · ${L.title}`));
      const qb = h('div'); box.append(qb);
      current = mountQuestion(qb, item, {
        context: 'diagnostic', assisted: false, index: k, total: picks.length, confidence: false,
        onResolved: (r) => { if (r.correct && r.tries === 1) placed.push(L.id); logResponse(L, item, 'diagnostic', r); },
        onNext: () => { k++; next(); }, nextLabel: 'Next',
      });
    };
    const finish = async () => {
      current?.destroy?.();
      if (placed.length) await log('placement', { skills: placed });
      wrap.replaceChildren(h('section.stage', h('div.summary-hero', h('div.eyebrow', 'Diagnostic complete'), h('div.big', `${placed.length}`), h('p.muted', `skill${placed.length === 1 ? '' : 's'} placed at Proficient. The Atlas will skip past them in its recommendations; you can still open any lesson.`)),
        h('div.player-nav', h('span'), h('a.btn.primary', { href: '#/' }, 'Go to the dashboard'))));
    };
    next();
  }
  return () => current?.destroy?.();
}
