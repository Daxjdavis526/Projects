// What to study next. Pure functions over the catalog and the replayed
// learner state: the recommended lesson, the ready-to-learn frontier, a
// review session, the daily challenge, and progress summaries.

import { hashString, makeRng } from './rng.js';
import { STATES } from './mastery.js';

const RANK = Object.fromEntries(STATES.map((s, i) => [s, i]));
const DAY_MS = 86400000;

export const stateOf = (st, id) => st.skills[id]?.state ?? 'not-started';
export const completed = (st, id) => !!st.lessons[id]?.completed;
const atLeast = (st, id, s) => RANK[stateOf(st, id)] >= RANK[s];

/** A prerequisite counts as met once its lesson is finished or its skill is Developing. */
export const prereqMet = (st, id) => completed(st, id) || atLeast(st, id, 'developing');

export function prereqStatus(cat, st, lessonId) {
  const L = cat.lessons[lessonId];
  return (L?.prereqs || []).map((id) => ({ id, title: cat.lessons[id]?.title ?? id, met: prereqMet(st, id) }));
}

export const isUnlocked = (cat, st, id) => prereqStatus(cat, st, id).every((p) => p.met);

/** Ready lessons whose prerequisites are met and that are not yet finished. */
export function frontier(cat, st, { readyOnly = true, courses = null } = {}) {
  return cat.order.filter((id) => {
    const L = cat.lessons[id];
    if (readyOnly && !L.ready) return false;
    if (courses && !courses.includes(L.course)) return false;
    return !completed(st, id) && isUnlocked(cat, st, id);
  });
}

/**
 * The lesson to continue with. Preference: the lesson in progress; the next
 * lesson in the learner's focus courses (in order); then the earliest frontier
 * lesson anywhere.
 */
export function recommendNext(cat, st, profile = {}) {
  const focus = profile.focus?.length ? profile.focus : null;
  const last = st.lastLesson && cat.lessons[st.lastLesson];
  if (last && last.ready && !completed(st, last.id)) return last.id;
  if (focus) {
    for (const cid of focus) {
      const c = cat.byId[cid];
      if (!c) continue;
      const next = c.lessonIds.find((id) => cat.lessons[id].ready && !completed(st, id) && !skippable(st, id));
      if (next) return next;
    }
  }
  const f = frontier(cat, st).filter((id) => !skippable(st, id));
  return f[0] ?? null;
}

// A placed or already-proficient skill does not need its lesson again.
const skippable = (st, id) => atLeast(st, id, 'proficient');

/** Lessons, modules, states and boss status for one course. */
export function courseProgress(cat, st, courseId) {
  const c = cat.byId[courseId];
  const ids = c.lessonIds;
  const ready = ids.filter((id) => cat.lessons[id].ready);
  const done = ready.filter((id) => completed(st, id));
  const states = Object.fromEntries(STATES.map((k) => [k, 0]));
  for (const id of ready) states[stateOf(st, id)]++;
  const masteryScore = ready.length ? ready.reduce((a, id) => a + RANK[stateOf(st, id)] / 4, 0) / ready.length : 0;
  return {
    total: ids.length, ready: ready.length, completed: done.length,
    completion: ready.length ? done.length / ready.length : 0,
    mastery: masteryScore, states, boss: st.boss[courseId] || null,
    started: ids.some((id) => st.lessons[id]),
  };
}

export function moduleProgress(cat, st, moduleKey) {
  const m = cat.modules[moduleKey];
  const ready = m.lessonIds.filter((id) => cat.lessons[id].ready);
  const done = ready.filter((id) => completed(st, id)).length;
  const mastery = ready.length ? ready.reduce((a, id) => a + RANK[stateOf(st, id)] / 4, 0) / ready.length : 0;
  return { total: m.lessonIds.length, ready: ready.length, completed: done, mastery };
}

/**
 * Plan a review session: due skills first (lowest recall first), then skills
 * the learner is struggling with (targeted practice), then sure-but-wrong
 * retests, interleaved so the same skill never appears twice in a row.
 * Returns [{ lesson, reason, variant }]; the player loads each lesson module
 * and draws a fresh variant of one of its items.
 */
export function planReview(cat, st, now = Date.now(), { max = 15 } = {}) {
  const picks = [];
  const seen = new Map();
  const add = (lesson, reason) => {
    if (!cat.lessons[lesson]?.ready) return;
    const k = seen.get(lesson) || 0;
    if (k >= 2) return;
    seen.set(lesson, k + 1);
    picks.push({ lesson, reason });
  };
  for (const d of st.due) add(d.skill, 'due');
  for (const s of st.struggling) { add(s, 'struggling'); add(s, 'struggling'); }
  const recentSure = st.sureWrong.filter((x) => now - x.t < 7 * DAY_MS);
  for (const x of recentSure) add(x.skill, 'retest');
  // if little is due, top up with the oldest-reviewed learned skills
  if (picks.length < 5) {
    const learned = Object.entries(st.cards).sort((a, b) => a[1].last - b[1].last).map(([id]) => id);
    for (const id of learned) { if (picks.length >= 5) break; add(id, 'refresh'); }
  }
  const capped = picks.slice(0, max);
  const day = Math.floor(now / DAY_MS);
  return interleave(capped).map((p, k) => ({ ...p, variant: hashString(`${p.lesson}|${day}|${k}`) % 100000 }));
}

function interleave(list) {
  const out = [];
  const pool = list.slice();
  while (pool.length) {
    const prev = out[out.length - 1]?.lesson;
    let k = pool.findIndex((p) => p.lesson !== prev);
    if (k === -1) k = 0;
    out.push(pool.splice(k, 1)[0]);
  }
  return out;
}

/**
 * Today's challenge: one untimed transfer problem drawn from lessons the
 * learner has finished (or from the first ready lessons for a newcomer),
 * fixed for the whole day.
 */
export function dailyPick(cat, st, now = Date.now(), tz = 0) {
  const day = Math.floor((now - tz * 60000) / DAY_MS);
  let pool = Object.keys(st.lessons).filter((id) => completed(st, id) && cat.lessons[id]?.ready);
  if (!pool.length) pool = cat.order.filter((id) => cat.lessons[id].ready).slice(0, 12);
  if (!pool.length) return null;
  pool.sort();
  const rng = makeRng(hashString(`daily|${day}|${pool.length}`));
  const a = rng.pick(pool);
  return { day, lesson: a, variant: day % 100000 };
}

/** Course-level prerequisite graph for the knowledge map. */
export function courseGraph(cat) {
  return {
    nodes: cat.courses.map((c) => ({ id: c.id, title: c.title, code: c.code, track: c.track })),
    edges: cat.courses.flatMap((c) => c.prereqs.map((p) => ({ from: p, to: c.id }))),
  };
}

/** Module-level graph inside and across courses. */
export function moduleGraph(cat, courseIds = null) {
  const mods = Object.values(cat.modules).filter((m) => !courseIds || courseIds.includes(m.course));
  const keys = new Set(mods.map((m) => m.key));
  const edges = [];
  for (const m of mods) {
    for (const p of m.prereqs) if (keys.has(p)) edges.push({ from: p, to: m.key });
    // consecutive modules in a course depend on each other unless prereqs say otherwise
    if (!m.prereqs.length && m.index > 0) {
      const prev = cat.byId[m.course].modules[m.index - 1];
      const pk = `${m.course}.${prev.id}`;
      if (keys.has(pk)) edges.push({ from: pk, to: m.key });
    }
  }
  return { nodes: mods.map((m) => ({ id: m.key, title: m.title, course: m.course })), edges };
}

/** Longest-path layering + barycentre ordering for a DAG (used by the map). */
export function layout(graph) {
  const preds = {}, succs = {};
  for (const n of graph.nodes) { preds[n.id] = []; succs[n.id] = []; }
  for (const e of graph.edges) if (preds[e.to] && succs[e.from]) { preds[e.to].push(e.from); succs[e.from].push(e.to); }
  const layer = {};
  const visit = (id, stack = new Set()) => {
    if (layer[id] !== undefined) return layer[id];
    if (stack.has(id)) return 0;
    stack.add(id);
    const l = preds[id].length ? 1 + Math.max(...preds[id].map((p) => visit(p, stack))) : 0;
    stack.delete(id);
    return (layer[id] = l);
  };
  graph.nodes.forEach((n) => visit(n.id));
  const layers = [];
  for (const n of graph.nodes) (layers[layer[n.id]] ??= []).push(n.id);
  // a few sweeps of barycentre ordering to reduce crossings
  const pos = {};
  layers.forEach((L) => L.forEach((id, i) => (pos[id] = i)));
  for (let sweep = 0; sweep < 6; sweep++) {
    for (let li = 1; li < layers.length; li++) {
      const L = layers[li];
      const bc = (id) => (preds[id].length ? preds[id].reduce((a, p) => a + pos[p], 0) / preds[id].length : pos[id]);
      L.sort((a, b) => bc(a) - bc(b));
      L.forEach((id, i) => (pos[id] = i));
    }
  }
  return { layer, layers, pos };
}
