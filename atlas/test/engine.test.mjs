// The learning engine: FSRS-6 review intervals, the mastery estimate and its
// evidence gates, and replaying an event log into XP, states and schedules.
//   node atlas/test/engine.test.mjs

import { initCard, review, intervalFor, retrievability, dueAt, AGAIN, HARD, GOOD } from '../src/core/fsrs.js';
import { newSkill, update, evidence, pHat, explain, isStruggling, fsrsGrade } from '../src/core/mastery.js';
import { replay, levelOf, xpForLevel, weeklyGoal, history, XP } from '../src/core/progress.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const DAY = 86400000;
const T0 = Date.UTC(2026, 9, 1, 15);   // a Thursday afternoon

// ─── FSRS-6 ────────────────────────────────────────────────────────────────
check('R(S, S) = 0.9 by construction', Math.abs(retrievability(10, 10) - 0.9) < 1e-12);
check('interval at retention 0.9 equals S', Math.abs(intervalFor(7.3, 0.9) - 7.3) < 1e-9);
check('interval multiplier at 0.8 ≈ 3.32', Math.abs(intervalFor(1, 0.8) - 3.32) < 0.01, intervalFor(1, 0.8).toFixed(3));
check('interval multiplier at 0.95 ≈ 0.40', Math.abs(intervalFor(1, 0.95) - 0.40) < 0.01, intervalFor(1, 0.95).toFixed(3));
{
  // A skill rated Good every time, reviewed exactly when R falls to 0.9:
  // the research computed intervals of 2.3 → 11.9 → 49.7 → 173.8 → 527 days.
  let c = initCard(GOOD, 0);
  const got = [c.S];
  for (let k = 0; k < 4; k++) {
    const t = c.last + intervalFor(c.S) * DAY;
    c = review(c, GOOD, t);
    got.push(c.S);
  }
  const want = [2.3065, 11.9, 49.7, 173.8, 527];
  check('Good-every-time stabilities match the reference sequence',
    got.every((s, k) => Math.abs(s - want[k]) / want[k] < 0.006), got.map((s) => s.toFixed(1)).join(' → '));
  let h = initCard(GOOD, 0);
  const hard = [h.S];
  for (let k = 0; k < 4; k++) { const t = h.last + intervalFor(h.S) * DAY; h = review(h, HARD, t); hard.push(h.S); }
  const wantH = [2.3, 8.1, 19.6, 37.1, 59];
  check('Hard-every-time stabilities match the reference sequence', hard.every((s, k) => Math.abs(s - wantH[k]) / wantH[k] < 0.01), hard.map((s) => s.toFixed(1)).join(' → '));
  // a lapse at S ≈ 174 days drops stability to about 4.8 days
  let L = initCard(GOOD, 0);
  for (let k = 0; k < 3; k++) L = review(L, GOOD, L.last + intervalFor(L.S) * DAY);
  const lapsed = review(L, AGAIN, L.last + intervalFor(L.S) * DAY);
  check('a lapse at S ≈ 174 d resets stability to ≈ 4.8 d', Math.abs(lapsed.S - 4.8) < 0.15, lapsed.S.toFixed(2));
  check('difficulty stays in [1, 10]', [c, h, lapsed].every((k) => k.D >= 1 && k.D <= 10));
  check('due date respects the 180-day cap', dueAt({ S: 900, last: 0 }, 0.9, 180) === 180 * DAY);
  check('same-day reviews do not shrink stability for Good', review(initCard(GOOD, 0), GOOD, 3600e3).S >= 2.3065);
}

// ─── mastery estimate and gates ────────────────────────────────────────────
check('evidence: unaided first try = 1', evidence({ correct: true }) === 1);
check('evidence: one hint = 0.7', evidence({ correct: true, hints: 1 }) === 0.7);
check('evidence: second try = 0.5', evidence({ correct: true, attemptNo: 2 }) === 0.5);
check('evidence: solution viewed = 0', evidence({ correct: true, solutionViewed: true }) === 0);
check('evidence: wrong = 0', evidence({ correct: false }) === 0);
{
  // hint-only solving must never reach Proficient, however long it goes on
  const s = newSkill();
  for (let k = 0; k < 200; k++) update(s, { t: T0 + k * DAY, correct: true, hints: 1, context: 'checkpoint', template: 'q' + (k % 4), difficulty: 2 });
  s.checkpointPassed = true;
  check('hint-only solving plateaus below 0.8', pHat(s) < 0.8 && pHat(s) > 0.6, pHat(s).toFixed(3));
  check('hint-only solving stays below Proficient', s.state !== 'proficient' && s.state !== 'mastered', s.state);
}
{
  // a typical good lesson: 6 practice items right first time, checkpoint passed
  const s = newSkill();
  for (let k = 0; k < 6; k++) update(s, { t: T0 + k * 60e3, correct: true, context: 'practice', template: 'q' + (k % 3), difficulty: 2 });
  check('six unaided practice solves → Developing', s.state === 'developing', `${s.state} p=${pHat(s).toFixed(2)}`);
  for (let k = 0; k < 3; k++) update(s, { t: T0 + 600e3 + k * 60e3, correct: true, context: 'checkpoint', template: 'c' + k, difficulty: 3 });
  s.checkpointPassed = true;
  update(s, { t: T0 + 900e3, correct: true, context: 'checkpoint', template: 'c3', difficulty: 3 });
  check('…plus a clean checkpoint → Proficient', s.state === 'proficient', `${s.state} p=${pHat(s).toFixed(2)}`);
  check('Proficient is not Mastered without spaced and transfer evidence', s.state !== 'mastered');
  update(s, { t: T0 + 8 * DAY, correct: true, context: 'review', template: 'r1', difficulty: 3 });
  update(s, { t: T0 + 9 * DAY, correct: true, context: 'review', template: 'r2', difficulty: 3, transfer: true });
  check('…a week later, a review and a transfer success → Mastered', s.state === 'mastered', `${s.state} p=${pHat(s).toFixed(2)} days=${s.days.size}`);
  const list = explain(s);
  check('evidence checklist all met once Mastered', list.every((x) => x.met), JSON.stringify(list.filter((x) => !x.met)));
  // a run of failures demotes, with hysteresis
  for (let k = 0; k < 6; k++) update(s, { t: T0 + 20 * DAY + k * 60e3, correct: false, context: 'review', difficulty: 2 });
  check('repeated failures demote a mastered skill', s.state !== 'mastered', s.state);
  check('…and flag it as a struggle', isStruggling(s));
}
{
  const s = newSkill();
  update(s, { t: T0, correct: true, context: 'practice', choices: 4, difficulty: 1 });
  const a = s.theta;
  const s2 = newSkill();
  update(s2, { t: T0, correct: true, context: 'practice', difficulty: 1 });
  check('a correct multiple-choice guess moves θ less than a typed answer', a < s2.theta);
}
check('FSRS grade: hinted → Hard', fsrsGrade({ correct: true, hints: 1 }) === 2);
check('FSRS grade: unaided → Good', fsrsGrade({ correct: true }) === 3);
check('FSRS grade: wrong → Again', fsrsGrade({ correct: false }) === 1);
check('FSRS grade: right but a guess → Hard', fsrsGrade({ correct: true, confidence: 'guess' }) === 2);

// ─── replaying a log ───────────────────────────────────────────────────────
{
  let id = 0;
  const E = (t, kind, f) => ({ id: ++id, t, kind, ...f });
  const L = 'math1220.C2-2.1';
  const log = [
    E(T0, 'visit', { lesson: L }),
    E(T0 + 1e3, 'example', { lesson: L }),
    ...[0, 1, 2, 3, 4].map((k) => E(T0 + 60e3 * (k + 1), 'response', { lesson: L, skill: L, item: `q${k % 3}`, context: 'practice', correct: true, tries: 1, hints: k === 0 ? 2 : 0, difficulty: 2 })),
    E(T0 + 400e3, 'response', { lesson: L, skill: L, item: 'q9', context: 'practice', correct: false, tries: 0, solution: true, difficulty: 3 }),
    ...[0, 1, 2].map((k) => E(T0 + 500e3 + k * 1e3, 'response', { lesson: L, skill: L, item: `c${k}`, context: 'checkpoint', correct: true, tries: 1, difficulty: 2 })),
    E(T0 + 600e3, 'checkpoint', { lesson: L, score: 3, total: 3, passed: true }),
    E(T0 + 601e3, 'lesson', { lesson: L }),
  ];
  const st = replay(log, { now: T0 + 3 * DAY });
  const xpWant = XP.example + 5 * XP.practice + 0 + 3 * XP.practice + XP.checkpoint;
  check('XP counts effort; revealing the solution without trying earns none', st.xp === xpWant, `${st.xp} vs ${xpWant}`);
  check('hints never reduce XP', st.xp === xpWant);
  check('lesson recorded as completed', !!st.lessons[L].completed);
  check('skill reaches at least Developing', ['developing', 'proficient'].includes(st.skills[L].state), st.skills[L].state);
  check('checkpoint creates an FSRS card', !!st.cards[L] && Math.abs(st.cards[L].S - 2.3065) < 1e-9);
  check('the skill is due for review after three days', st.due.some((d) => d.skill === L));
  const st2 = replay(log, { now: T0 + DAY });
  check('…but not after one day', !st2.due.some((d) => d.skill === L));
  // diminishing returns after 20 items on one skill in one day
  const grind = Array.from({ length: 30 }, (_, k) => E(T0 + DAY + k * 1e3, 'response', { lesson: L, skill: L, item: 'g', context: 'practice', correct: true, tries: 1 }));
  const st3 = replay(grind, { now: T0 + 2 * DAY });
  check('grinding one skill: items after the 20th earn a fifth', st3.xp === 20 * XP.practice + 10 * 2, String(st3.xp));
  // placement never grants Mastered
  const st4 = replay([E(T0, 'placement', { skills: ['math1210.C1-3.1'] })], { now: T0 + DAY });
  check('placement → Proficient (placed), never Mastered', st4.skills['math1210.C1-3.1'].state === 'proficient' && st4.skills['math1210.C1-3.1'].placed);
  // weak placements are revoked by failures
  const st5 = replay([E(T0, 'placement', { skills: ['s'] }), ...[1, 2, 3, 4, 5, 6].map((k) => E(T0 + k * 1e3, 'response', { skill: 's', context: 'review', correct: false, tries: 2 }))], { now: T0 + DAY });
  check('repeated failures revoke a placement', st5.skills.s.state !== 'proficient', st5.skills.s.state);
  // FIRe: reviewing an encompassing skill pushes the component's review out
  const A = 'calc1.chain', B = 'calc2.ibp';
  const base = [
    E(T0, 'checkpoint', { lesson: A, score: 3, total: 3, passed: true }),
    E(T0, 'checkpoint', { lesson: B, score: 3, total: 3, passed: true }),
    E(T0 + 2.2 * DAY, 'response', { skill: B, context: 'review', correct: true, tries: 1, difficulty: 2 }),
  ];
  const noFire = replay(base, { now: T0 + 2.3 * DAY });
  const fire = replay(base, { now: T0 + 2.3 * DAY, encompassing: { [B]: [{ skill: A, weight: 0.5 }] } });
  check('FIRe: implicit credit raises the component’s stability', fire.cards[A].S > noFire.cards[A].S, `${fire.cards[A].S} vs ${noFire.cards[A].S}`);
  // calibration
  const cal = replay([
    E(T0, 'response', { skill: 'x', context: 'practice', correct: true, tries: 1, confidence: 'sure' }),
    E(T0 + 1, 'response', { skill: 'x', context: 'practice', correct: false, tries: 2, confidence: 'sure' }),
  ], { now: T0 });
  check('calibration counts sure-and-right', cal.calibration.sure.n === 2 && cal.calibration.sure.right === 1);
  check('sure-but-wrong is queued for a retest', cal.sureWrong.length === 1);
}

// ─── levels, weekly goals, history ─────────────────────────────────────────
check('level 1 at 0 XP', levelOf(0).level === 1);
check('level 2 at 100 XP', levelOf(100).level === 2 && levelOf(99).level === 1);
check('levels increase monotonically', [2, 5, 10, 30].every((L) => xpForLevel(L + 1) > xpForLevel(L)));
{
  const days = {};
  const dayIdx = (t) => Math.floor(t / DAY);
  // four goal weeks, a missed week (token spent), then two more
  const weekStart = (w) => (w * 7 - 3) * DAY;
  const w0 = Math.floor((dayIdx(T0) + 3) / 7) - 8;
  for (const w of [0, 1, 2, 3, 5, 6]) for (const d of [0, 1, 2]) days[dayIdx(weekStart(w0 + w)) + d] = { items: 5, xp: 50, lessons: 0 };
  const g = weeklyGoal(days, 3, weekStart(w0 + 7) + DAY);
  check('a missed week spends a rest token instead of breaking the run', g.run === 6 && g.tokens === 0, JSON.stringify(g));
  const h = history({ days }, 84, weekStart(w0 + 7) + DAY);
  check('history covers 84 days', h.length === 84 && h.some((x) => x.items === 5));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
