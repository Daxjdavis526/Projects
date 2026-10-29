// A run of questions drawn from several lessons — reviews, the daily
// challenge, boss battles and the diagnostic all use it. Each pick names a
// lesson and a variant; the lesson module is loaded and one of its items
// instantiated fresh, so a review never repeats the exact numbers you saw.

import { h, icon, clear } from '../dom.js';
import { app } from '../state.js';
import { instantiate, itemsOf } from '../../core/content.js';
import { mountQuestion } from './question.js';
import { logResponse } from '../pages/lesson.js';
import { makeRng } from '../../core/rng.js';

const moduleCache = new Map();
export async function loadLesson(id) {
  if (!moduleCache.has(id)) moduleCache.set(id, app.cat.lessons[id].load().then((m) => m.default));
  return moduleCache.get(id);
}

/**
 * Choose an item definition from a lesson for a pick: prefer generators (fresh
 * numbers) and items not used in the most recent responses to this skill.
 */
export function chooseItem(L, pick, { prefer = 'any' } = {}) {
  const pool = itemsOf(L).map((x) => x.def);
  const recent = new Set(app.events.filter((e) => e.kind === 'response' && e.skill === L.skills[0]).slice(-4).map((e) => e.item));
  let candidates = pool.filter((d) => !recent.has(`${L.id}/${d.id}`));
  if (prefer === 'transfer') { const tr = pool.filter((d) => d.transfer); if (tr.length) candidates = tr; }
  if (!candidates.length) candidates = pool;
  const gens = candidates.filter((d) => d.gen);
  const from = gens.length ? gens : candidates;
  const rng = makeRng(pick.variant + 17);
  return from[Math.floor(rng.next() * from.length)];
}

/**
 * Run a session in `box`.
 * @param picks [{ lesson, variant, reason }]
 * @param o { context, assisted, onDone(results), title, subtitle, prefer }
 */
export function runSession(box, picks, o) {
  let k = 0;
  const results = [];
  let current = null;
  async function show() {
    current?.destroy?.();
    clear(box);
    if (k >= picks.length) { o.onDone?.(results); return; }
    const pick = picks[k];
    const L = await loadLesson(pick.lesson);
    const def = pick.item ? itemsOf(L).find((x) => x.def.id === pick.item)?.def : chooseItem(L, pick, { prefer: o.prefer });
    const item = instantiate(L, def, pick.variant);
    const reasonText = { due: 'Due for review', struggling: 'Targeted practice', retest: 'You were sure — let’s confirm', refresh: 'Keeping it fresh' }[pick.reason];
    box.append(h('div.row.small.faint', { style: { marginBottom: '.6rem' } },
      h('span', app.cat.byId[app.cat.lessons[L.id].course].code), h('span', '·'), h('a', { href: `#/lesson/${L.id}` }, L.title),
      reasonText ? h('span.chip', reasonText) : null));
    const qbox = h('div');
    box.append(qbox);
    current = mountQuestion(qbox, item, {
      context: o.context, assisted: o.assisted !== false, index: k, total: picks.length,
      label: o.label ? o.label(k, picks.length) : undefined,
      onResolved: (r) => { results.push({ ...r, lesson: L.id, item: item.key }); logResponse(L, item, o.context, r, { mixed: o.context === 'review' }); },
      onNext: () => { k++; show(); },
      nextLabel: k + 1 < picks.length ? 'Next' : 'Finish',
    });
  }
  show();
  return { destroy: () => current?.destroy?.() };
}

export function sessionSummary(results, { title, onAgain, againLabel = 'Another round' } = {}) {
  const right = results.filter((r) => r.correct).length;
  const unaided = results.filter((r) => r.correct && r.tries === 1 && !r.hints).length;
  return h('div',
    h('div.summary-hero', h('div.eyebrow', title || 'Session complete'), h('div.big', `${right} / ${results.length}`), h('p.muted', `${unaided} solved on the first try without hints.`)),
    h('div.player-nav', h('a.btn.ghost', { href: '#/' }, 'Home'), onAgain ? h('button.btn.primary', { type: 'button', onclick: onAgain, html: `${icon('review')}${againLabel}` }) : null));
}
