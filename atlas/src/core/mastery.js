// Per-skill mastery: an Elo-style ability estimate plus evidence gates.
//
// The estimate θ moves after every graded response:
//     P(correct) = g + (1 − g)·σ(θ − b)
//     θ ← θ + K(n)·w·(c − P),   K(n) = max(0.2, 1/(1 + 0.05n))
// b is the item's difficulty tier, g the guessing floor (1/k for a k-option
// choice), c the evidence of the response — 1 for an unaided first-try solve,
// reduced by retries and hints — and w a context weight (practice counts less
// than a checkpoint, a spaced review or a transfer problem).
//
// States are gated by kinds of evidence, not by the estimate alone, because a
// lesson completed with hints is not proof of mastery. The thresholds are
// design choices checked by simulation (hint-only solving plateaus near
// p ≈ 0.68 and can never reach Proficient), not values fitted to learners —
// the interface says "the Atlas estimates", never a percentage.

export const STATES = ['not-started', 'learning', 'developing', 'proficient', 'mastered'];
export const STATE_LABEL = {
  'not-started': 'Not started', learning: 'Learning', developing: 'Developing',
  proficient: 'Proficient', mastered: 'Mastered',
};

export const TIER_B = { 1: -1, 2: 0, 3: 0.75, 4: 1.5 };
export const CONTEXT_W = { lesson: 0.75, practice: 0.75, checkpoint: 1, review: 1.25, daily: 1.25, transfer: 1.5, boss: 1.5, diagnostic: 1 };
const ATTEMPT_A = [1, 0.5, 0.25];            // first, second, third-or-later try
const HINT_H = [1, 0.7, 0.4, 0];             // 0, 1, 2, 3+ hints (or the solution)
const DAY_MS = 86400000;

const sigma = (z) => 1 / (1 + Math.exp(-z));

/** Evidence c ∈ [0, 1] from one response. */
export function evidence({ correct, attemptNo = 1, hints = 0, solutionViewed = false }) {
  if (!correct || solutionViewed) return 0;
  const A = ATTEMPT_A[Math.min(attemptNo, 3) - 1];
  const H = HINT_H[Math.min(hints, 3)];
  return A * H;
}

export function newSkill() {
  return {
    theta: -1, n: 0, first: null, last: null,
    unaidedFirstTry: 0, templates: new Set(), days: new Set(),
    checkpointPassed: false, spacedSuccess: false, transferSuccess: false,
    state: 'not-started', recent: [],
  };
}

/** Probability the learner solves a standard (tier-2, typed) item now. */
export const pHat = (s) => sigma(s.theta - TIER_B[2]);

/**
 * Update a skill with one response event. Mutates and returns `s`.
 * ev: { t, correct, attemptNo, hints, solutionViewed, difficulty, choices, context, template, transfer }
 */
export function update(s, ev) {
  const g = ev.choices ? 1 / ev.choices : 0;
  const b = TIER_B[ev.difficulty ?? 2] ?? 0;
  const c = evidence(ev);
  const P = g + (1 - g) * sigma(s.theta - b);
  const K = Math.max(0.2, 1 / (1 + 0.05 * s.n));
  const w = CONTEXT_W[ev.transfer ? 'transfer' : ev.context] ?? 1;
  s.theta += K * w * (c - P);
  s.theta = Math.max(-4, Math.min(5, s.theta));
  s.n += 1;
  const day = Math.floor(ev.t / DAY_MS);
  if (s.first === null) s.first = ev.t;
  s.last = ev.t;
  s.recent.push(c);
  if (s.recent.length > 8) s.recent.shift();
  const unaided = c === 1;
  if (unaided) {
    if ((ev.attemptNo ?? 1) === 1) s.unaidedFirstTry += 1;
    if (ev.template) s.templates.add(ev.template);
    s.days.add(day);
    if (ev.t - s.first >= 7 * DAY_MS && (ev.context === 'review' || ev.context === 'daily' || ev.context === 'boss' || ev.context === 'checkpoint')) s.spacedSuccess = true;
    if (ev.transfer || ev.context === 'boss' || ev.mixed) s.transferSuccess = true;
  }
  s.state = nextState(s);
  return s;
}

const ORDER = Object.fromEntries(STATES.map((k, i) => [k, i]));

function gates(s) {
  const p = pHat(s);
  return {
    developing: p >= 0.6 && s.unaidedFirstTry >= 2,
    proficient: p >= 0.8 && s.n >= 6 && s.unaidedFirstTry >= 3 && s.templates.size >= 2 && s.checkpointPassed,
    mastered: p >= 0.85 && s.spacedSuccess && s.transferSuccess && s.days.size >= 3 && s.checkpointPassed,
  };
}

/**
 * The state with hysteresis: promotion at the threshold, demotion 0.05 below
 * it. A diagnostic placement holds a skill at Proficient (never Mastered)
 * until the estimate clearly falls.
 */
export function restate(s) { s.state = nextState(s); return s.state; }

function nextState(s) {
  const g = gates(s);
  let target = 'learning';
  if (g.mastered) target = 'mastered';
  else if (g.proficient) target = 'proficient';
  else if (g.developing) target = 'developing';
  if (s.placed && ORDER[target] < ORDER.proficient) {
    if (pHat(s) >= 0.7) target = 'proficient';
    else s.placed = false;
  }
  if (s.n === 0 && !s.placed) return 'not-started';
  const cur = s.state;
  if (ORDER[target] >= ORDER[cur]) return target;
  // demote only if the estimate has clearly fallen below the current state's bar
  const p = pHat(s);
  const bar = { developing: 0.6, proficient: 0.8, mastered: 0.85 }[cur] ?? 0;
  return p < bar - 0.05 ? target : cur;
}

/** Evidence checklist shown in the "Why this state?" panel. */
export function explain(s) {
  const p = pHat(s);
  return [
    { label: 'Solved it unaided on the first try at least twice', met: s.unaidedFirstTry >= 2 },
    { label: 'Solved two different kinds of problem unaided', met: s.templates.size >= 2 },
    { label: 'Passed the lesson checkpoint', met: s.checkpointPassed },
    { label: 'Succeeded again at least a week after first learning it', met: s.spacedSuccess },
    { label: 'Succeeded in a mixed or unfamiliar problem', met: s.transferSuccess },
    { label: 'Succeeded on three different days', met: s.days.size >= 3 },
    { label: `Estimate ${p >= 0.85 ? 'high' : p >= 0.6 ? 'moderate' : 'still low'} (based on ${s.n} response${s.n === 1 ? '' : 's'})`, met: p >= 0.8 },
  ];
}

/** A skill the learner is repeatedly struggling with. */
export function isStruggling(s) {
  if (s.n < 4) return false;
  const r = s.recent.slice(-5);
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  return mean < 0.45 || pHat(s) < 0.4;
}

/** FSRS grade from the evidence of the first scored retrieval of a day. */
export function fsrsGrade(ev, s) {
  const c = evidence(ev);
  if (c < 0.3) return 1;                                   // Again
  if (c < 1 || ev.confidence === 'guess') return 2;        // Hard
  if ((ev.difficulty ?? 2) >= 3 && ev.confidence === 'sure' && s && ORDER[s.state] >= ORDER.proficient) return 4;  // Easy
  return 3;                                                // Good
}
