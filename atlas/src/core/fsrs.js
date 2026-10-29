// FSRS-6 — the Free Spaced Repetition Scheduler, version 6 — applied per
// skill rather than per flashcard. Formulas and the 21 default parameters
// follow the open-spaced-repetition reference implementation (py-fsrs).
// Stability S is in days: the gap after which recall probability falls to
// 90%. Difficulty D runs from 1 to 10.
//
// Caveat carried from the research: FSRS's defaults were fitted to flashcard
// reviews, not to solving physics problems. The intervals are a reasonable
// starting point, not a measured property of how mathematics is forgotten.

export const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
  1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];

export const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4;
const DAY_MS = 86400000;
const DECAY = -W[20];
const FACTOR = 0.9 ** (1 / DECAY) - 1;
const S_MIN = 0.001;

const clampD = (d) => Math.min(10, Math.max(1, d));

/** Probability of recall after t days at stability S. */
export const retrievability = (tDays, S) => (1 + FACTOR * tDays / S) ** DECAY;

/** Interval in days that brings recall down to `retention`. */
export const intervalFor = (S, retention = 0.9) => (S / FACTOR) * (retention ** (1 / DECAY) - 1);

const initStability = (g) => Math.max(W[g - 1], S_MIN);
const initDifficulty = (g) => W[4] - Math.exp(W[5] * (g - 1)) + 1;   // unclamped (used for mean reversion)

function nextDifficulty(D, g) {
  const dD = -W[6] * (g - 3);
  const linear = D + dD * (10 - D) / 9;
  return clampD(W[7] * initDifficulty(EASY) + (1 - W[7]) * linear);
}

function recallStability(D, S, R, g) {
  const hard = g === HARD ? W[15] : 1;
  const easy = g === EASY ? W[16] : 1;
  return S * (1 + Math.exp(W[8]) * (11 - D) * S ** -W[9] * (Math.exp(W[10] * (1 - R)) - 1) * hard * easy);
}

function forgetStability(D, S, R) {
  const s = W[11] * D ** -W[12] * ((S + 1) ** W[13] - 1) * Math.exp(W[14] * (1 - R));
  return Math.min(s, S / Math.exp(W[17] * W[18]));
}

function shortTermStability(S, g) {
  let inc = Math.exp(W[17] * (g - 3 + W[18])) * S ** -W[19];
  if (g >= HARD) inc = Math.max(inc, 1);
  return S * inc;
}

/**
 * A new memory state from the first graded retrieval (usually the lesson checkpoint).
 * @returns {{S:number, D:number, last:number, reps:number, lapses:number}}
 */
export function initCard(grade, now) {
  return { S: initStability(grade), D: clampD(initDifficulty(grade)), last: now, reps: 1, lapses: grade === AGAIN ? 1 : 0 };
}

/** Apply one graded review at time `now` (ms). Pure: returns a new card. */
export function review(card, grade, now) {
  const elapsed = Math.max(0, (now - card.last) / DAY_MS);
  let S;
  if (elapsed < 1) S = shortTermStability(card.S, grade);
  else {
    const R = retrievability(elapsed, card.S);
    S = grade === AGAIN ? forgetStability(card.D, card.S, R) : recallStability(card.D, card.S, R, grade);
  }
  return {
    S: Math.max(S, S_MIN),
    D: nextDifficulty(card.D, grade),
    last: now,
    reps: card.reps + 1,
    lapses: card.lapses + (grade === AGAIN ? 1 : 0),
  };
}

/** When this card is next due, in ms, for a desired retention and a cap in days. */
export function dueAt(card, retention = 0.9, maxDays = 180) {
  const days = Math.min(maxDays, Math.max(1, Math.round(intervalFor(card.S, retention))));
  return card.last + days * DAY_MS;
}

export const recallNow = (card, now) => retrievability(Math.max(0, (now - card.last) / DAY_MS), card.S);
