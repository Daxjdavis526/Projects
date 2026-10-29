// Achievements reward learning behaviours — coming back, recovering from a
// mistake, owning a skill after needing a hint, calibrating confidence —
// and real milestones of mastery. None of them rewards volume or speed.
// Definitions live in content/achievements.js; this module evaluates them.

import { STATES } from './mastery.js';

const RANK = Object.fromEntries(STATES.map((s, i) => [s, i]));

/** Helpers handed to every achievement test. */
export function context(st, cat) {
  const completedIn = (courseId) => (cat.byId[courseId]?.lessonIds || []).filter((id) => st.lessons[id]?.completed).length;
  const readyIn = (courseId) => (cat.byId[courseId]?.lessonIds || []).filter((id) => cat.lessons[id]?.ready).length;
  const atLeast = (id, s) => RANK[st.skills[id]?.state ?? 'not-started'] >= RANK[s];
  const moduleAtLeast = (moduleKey, s, frac = 1) => {
    const ids = (cat.modules[moduleKey]?.lessonIds || []).filter((id) => cat.lessons[id]?.ready);
    if (!ids.length) return false;
    return ids.filter((id) => atLeast(id, s)).length >= Math.ceil(frac * ids.length);
  };
  const lessonsCompleted = Object.values(st.lessons).filter((l) => l.completed).length;
  const studyDaysIn = (days, now = st.lastT ?? Date.now()) => {
    const today = Math.floor(now / 86400000);
    return Object.entries(st.days).filter(([d, r]) => today - +d < days && (r.items || r.lessons)).length;
  };
  const cal = st.calibration;
  const calN = cal.sure.n + cal.unsure.n + cal.guess.n;
  return {
    st, cat, completedIn, readyIn, atLeast, moduleAtLeast, lessonsCompleted, studyDaysIn,
    bossPassed: (c) => !!st.boss[c]?.passed,
    bossesPassed: Object.values(st.boss).filter((b) => b.passed).length,
    coursesStarted: st.coursesStarted.size,
    calibrationN: calN,
    calibrationGood: calN >= 20 && (cal.sure.n === 0 || cal.sure.right / cal.sure.n >= 0.8) && (cal.guess.n === 0 || cal.guess.right / cal.guess.n <= 0.6),
    c: st.counters,
  };
}

/** Evaluate definitions → [{ ...def, unlocked, progress }] */
export function evaluate(defs, st, cat) {
  const ctx = context(st, cat);
  return defs.map((d) => {
    let unlocked = false, progress = null;
    try { unlocked = !!d.test(ctx); } catch { unlocked = false; }
    try { progress = d.progress ? d.progress(ctx) : null; } catch { progress = null; }
    return { ...d, unlocked, progress };
  });
}
