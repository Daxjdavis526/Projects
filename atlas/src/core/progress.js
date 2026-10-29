// Everything the Atlas knows about the learner is recomputed from one
// append-only event log. Nothing derived (XP, mastery, review schedules,
// achievements) is stored, so a fix to the rules re-scores history, an
// import merges cleanly by event id, and the Node tests can replay any
// learner's life in milliseconds.
//
// Event kinds:
//   response    one resolved item: { lesson, item, variant, skill, context, correct, tries,
//                 hints, solution, confidence, difficulty, choices, transfer, mixed, kind }
//   example     a worked example read to the end: { lesson }
//   checkpoint  a lesson checkpoint finished: { lesson, score, total, passed }
//   lesson      a lesson finished: { lesson }
//   boss        a boss battle finished: { course, score, total, passed, claims }
//   placement   diagnostic results: { skills: [ids placed at Proficient] }
//   visit       a lesson opened: { lesson } (for "new territory" and history)

import { newSkill, update, restate, fsrsGrade, isStruggling, STATES } from './mastery.js';
import { initCard, review, dueAt, recallNow, GOOD, intervalFor } from './fsrs.js';

const DAY_MS = 86400000;
export const dayOf = (t) => Math.floor(t / DAY_MS);
/** Monday-based week index, local time offset applied by the caller via `tz` minutes. */
export const weekOf = (t, tz = 0) => Math.floor((dayOf(t - tz * 60000) + 3) / 7);

export const XP = { practice: 10, review: 15, daily: 25, example: 5, checkpoint: 40, boss: 150, diagnostic: 2 };

/** Cumulative XP needed to reach a level (level 1 at 0). */
export const xpForLevel = (L) => Math.round(100 * Math.max(0, L - 1) ** 1.6);
export function levelOf(xp) {
  let L = 1;
  while (xpForLevel(L + 1) <= xp) L++;
  const lo = xpForLevel(L), hi = xpForLevel(L + 1);
  return { level: L, into: xp - lo, span: hi - lo, next: hi };
}
export const RANKS = [
  [1, 'Observer'], [5, 'Experimenter'], [10, 'Analyst'], [16, 'Modeller'], [24, 'Theorist'],
  [34, 'Field Theorist'], [46, 'Relativist'], [60, 'Cosmologist'],
];
export const rankOf = (L) => RANKS.filter(([l]) => L >= l).pop()[1];

/**
 * Replay the log.
 * @param {object[]} events  sorted or not; sorted here by t then id
 * @param {object} [opts] { retention, maxInterval, now, tz, weeklyGoal, encompassing }
 */
export function replay(events, opts = {}) {
  const retention = opts.retention ?? 0.9;
  const maxInterval = opts.maxInterval ?? 180;
  const now = opts.now ?? Date.now();
  const tz = opts.tz ?? 0;
  const encompassing = opts.encompassing || {};      // skill → [{ skill, weight }]
  const evs = [...events].sort((a, b) => a.t - b.t || String(a.id).localeCompare(String(b.id)));

  const st = {
    xp: 0, skills: {}, cards: {}, lessons: {}, boss: {}, days: {},
    calibration: { sure: { n: 0, right: 0 }, unsure: { n: 0, right: 0 }, guess: { n: 0, right: 0 } },
    counters: { responses: 0, correct: 0, unaided: 0, hintsUsed: 0, errorsFound: 0, recoveries: 0, labs: 0, reviews: 0, longReturns: 0, hintThenOwn: 0, dailies: 0 },
    visits: new Set(), coursesStarted: new Set(), lastLesson: null, lastT: null,
    sureWrong: [],
  };
  const skillDayCount = {};                           // `${skill}|${day}` → items, for XP diminishing returns
  const hintedSkills = new Set();
  const lastReviewDay = {};                           // skill → day of last FSRS-graded retrieval

  const skill = (id) => (st.skills[id] ??= newSkill());
  const dayRec = (t) => (st.days[dayOf(t - tz * 60000)] ??= { xp: 0, items: 0, lessons: 0 });
  const addXP = (t, n) => { st.xp += n; dayRec(t).xp += n; };

  for (const ev of evs) {
    st.lastT = ev.t;
    switch (ev.kind) {
      case 'visit': {
        st.visits.add(ev.lesson);
        const course = ev.lesson?.split('.')[0];
        if (course) st.coursesStarted.add(course);
        (st.lessons[ev.lesson] ??= { started: ev.t, completed: null, checkpoint: null }).lastSeen = ev.t;
        st.lastLesson = ev.lesson;
        break;
      }
      case 'example': addXP(ev.t, XP.example); break;
      case 'response': {
        const s = skill(ev.skill);
        const attemptNo = Math.max(1, ev.tries || 1);
        const r = {
          t: ev.t, correct: !!ev.correct, attemptNo, hints: ev.hints || 0, solutionViewed: !!ev.solution,
          difficulty: ev.difficulty, choices: ev.choices, context: ev.context, template: ev.item,
          transfer: !!ev.transfer, mixed: !!ev.mixed, confidence: ev.confidence,
        };
        // FSRS: the first scored retrieval of the day, once a card exists
        const d = dayOf(ev.t);
        const card = st.cards[ev.skill];
        if (card && lastReviewDay[ev.skill] !== d && ev.context !== 'checkpoint') {
          const g = fsrsGrade(r, s);
          if (st.cards[ev.skill].last && ev.t - st.cards[ev.skill].last >= 30 * DAY_MS && g >= 3) st.counters.longReturns++;
          st.cards[ev.skill] = review(card, g, ev.t);
          lastReviewDay[ev.skill] = d;
          // FIRe: a successful review also counts, fractionally, for the skills it encompasses
          if (g >= GOOD) implicitCredit(st, encompassing, ev.skill, ev.t);
        }
        update(s, r);
        // counters
        const c = st.counters;
        c.responses++;
        if (r.correct) c.correct++;
        if (r.correct && attemptNo === 1 && !r.hints && !r.solutionViewed) c.unaided++;
        if (r.hints) { c.hintsUsed += r.hints; hintedSkills.add(ev.skill); }
        else if (r.correct && attemptNo === 1 && hintedSkills.has(ev.skill)) { c.hintThenOwn++; hintedSkills.delete(ev.skill); }
        if (r.correct && attemptNo > 1 && !r.solutionViewed) c.recoveries++;
        if (ev.itemType === 'error' && r.correct) c.errorsFound++;
        if (ev.context === 'review') c.reviews++;
        if (ev.context === 'daily' && r.correct) c.dailies++;
        if (ev.confidence && st.calibration[ev.confidence]) {
          st.calibration[ev.confidence].n++;
          if (r.correct && attemptNo === 1 && !r.hints) st.calibration[ev.confidence].right++;
          else if (ev.confidence === 'sure') st.sureWrong.push({ skill: ev.skill, t: ev.t });
        }
        // XP: effort, never reduced by hints; a genuine attempt is at least one submission
        if (ev.tries > 0 || ev.correct) {
          const key = `${ev.skill}|${d}`;
          const k = (skillDayCount[key] = (skillDayCount[key] || 0) + 1);
          const base = ev.context === 'review' ? XP.review : ev.context === 'daily' ? XP.daily
            : ev.context === 'diagnostic' ? XP.diagnostic : XP.practice;
          addXP(ev.t, k > 20 ? Math.round(base / 5) : base);
        }
        dayRec(ev.t).items++;
        break;
      }
      case 'checkpoint': {
        const L = (st.lessons[ev.lesson] ??= { started: ev.t, completed: null, checkpoint: null });
        L.checkpoint = Math.max(L.checkpoint ?? 0, ev.score / Math.max(1, ev.total));
        const skills = ev.skills?.length ? ev.skills : [ev.lesson];
        for (const sk of skills) {
          const s = skill(sk);
          if (ev.passed) s.checkpointPassed = true;
          // the checkpoint sets the first FSRS rating
          if (!st.cards[sk]) {
            const frac = ev.score / Math.max(1, ev.total);
            const g = frac >= 0.999 ? 3 : frac >= 0.6 ? 2 : 1;
            st.cards[sk] = initCard(g, ev.t);
            lastReviewDay[sk] = dayOf(ev.t);
          }
          restate(s);
        }
        addXP(ev.t, XP.checkpoint);
        break;
      }
      case 'lesson': {
        const L = (st.lessons[ev.lesson] ??= { started: ev.t, completed: null, checkpoint: null });
        if (!L.completed) { L.completed = ev.t; dayRec(ev.t).lessons++; }
        if (ev.lab) st.counters.labs++;
        break;
      }
      case 'boss': {
        const B = (st.boss[ev.course] ??= { attempts: 0, best: 0, passed: false, passedAt: null });
        B.attempts++;
        B.best = Math.max(B.best, ev.score / Math.max(1, ev.total));
        if (ev.passed && !B.passed) { B.passed = true; B.passedAt = ev.t; }
        addXP(ev.t, XP.boss);
        break;
      }
      case 'placement': {
        for (const sk of ev.skills || []) {
          const s = skill(sk);
          s.placed = true;
          s.theta = Math.max(s.theta, 1.4);
          s.checkpointPassed = true;
          restate(s);
          if (!st.cards[sk]) st.cards[sk] = initCard(GOOD, ev.t);
        }
        break;
      }
      default: break;
    }
  }

  // review schedule
  st.due = [];
  for (const [id, card] of Object.entries(st.cards)) {
    const due = dueAt(card, retention, maxInterval);
    const R = recallNow(card, now);
    st.skills[id] && Object.assign(st.skills[id], { due, recall: R });
    if (due <= now) st.due.push({ skill: id, due, recall: R });
  }
  st.due.sort((a, b) => a.recall - b.recall);
  st.struggling = Object.entries(st.skills).filter(([, s]) => isStruggling(s)).map(([id]) => id);
  st.level = levelOf(st.xp);
  st.weekly = weeklyGoal(st.days, opts.weeklyGoal ?? 0, now, tz);
  st.stateCounts = Object.fromEntries(STATES.map((k) => [k, 0]));
  for (const s of Object.values(st.skills)) st.stateCounts[s.state]++;
  return st;
}

function implicitCredit(st, encompassing, skillId, t) {
  for (const { skill: comp, weight } of encompassing[skillId] || []) {
    const card = st.cards[comp];
    if (!card) continue;
    const R = recallNow(card, t);
    if (R > 0.95) continue;                           // too early to count
    const full = review(card, GOOD, t);
    st.cards[comp] = {
      ...card,
      S: card.S + weight * (full.S - card.S),
      last: card.last + weight * (t - card.last),
    };
  }
}

/**
 * Optional weekly goal: study on `goal` distinct days per week. A missed week
 * spends a rest token (one is earned every 4 goal weeks) instead of breaking
 * the run; with no token the run simply starts again — no loss message.
 */
export function weeklyGoal(days, goal, now, tz = 0) {
  if (!goal) return { enabled: false };
  const weeks = {};
  for (const d of Object.keys(days)) {
    if (!days[d].items && !days[d].lessons) continue;
    const w = Math.floor((+d + 3) / 7);
    weeks[w] = (weeks[w] || 0) + 1;
  }
  const thisWeek = weekOf(now, tz);
  let run = 0, tokens = 0, best = 0, earnedSince = 0;
  const first = Math.min(thisWeek, ...Object.keys(weeks).map(Number));
  for (let w = first; w < thisWeek; w++) {
    if ((weeks[w] || 0) >= goal) {
      run++; earnedSince++;
      if (earnedSince === 4) { tokens = Math.min(tokens + 1, 2); earnedSince = 0; }
    } else if (tokens > 0) { tokens--; }
    else run = 0;
    best = Math.max(best, run);
  }
  const doneThisWeek = weeks[thisWeek] || 0;
  if (doneThisWeek >= goal) best = Math.max(best, run + 1);
  return { enabled: true, goal, doneThisWeek, run: run + (doneThisWeek >= goal ? 1 : 0), tokens, best };
}

/** Days with activity in the last `n` days, oldest first, for the history heat map. */
export function history(st, n = 84, now = Date.now(), tz = 0) {
  const today = dayOf(now - tz * 60000);
  return Array.from({ length: n }, (_, k) => {
    const d = today - (n - 1 - k);
    return { day: d, ...(st.days[d] || { xp: 0, items: 0, lessons: 0 }) };
  });
}

export { intervalFor };
