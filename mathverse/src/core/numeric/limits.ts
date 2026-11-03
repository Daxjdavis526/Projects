// Numerical one-sided limits and the classification of a point of a function
// of one variable (continuous, removable, jump, infinite, oscillating). Every
// answer here is numerical: the function is sampled at x = a ± h for h halving
// from ~0.1 to ~1e−8, the sequence is accelerated with Aitken's Δ² process
// (exact for f(a+h) = L + c·hᵖ, any p > 0), and the estimate stops where
// floating-point cancellation starts to dominate. Callers label the results
// "numerical" with the error estimate returned.

export type LimitKind = 'finite' | '+inf' | '-inf' | 'oscillates' | 'undefined';

export interface LimitEstimate {
  kind: LimitKind;
  /** the limit (finite), or ±Infinity, or NaN */
  value: number;
  /** estimated absolute error of a finite limit */
  error: number;
  /** the samples (x, f(x)) the estimate came from, nearest last */
  samples: [number, number][];
}

const H0 = 0.0937;          // an unremarkable starting step (avoids hitting 1/(kπ) and friends exactly)
const STEPS = 25;

/**
 * lim f(x) as x → a from the right (side = +1) or the left (side = −1).
 * `scale` sets the size of the neighbourhood (default: 1, or |a| when larger).
 */
export function oneSidedLimit(f: (x: number) => number, a: number, side: 1 | -1, scale = Math.max(1, Math.abs(a))): LimitEstimate {
  const xs: number[] = [], vs: number[] = [];
  for (let k = 0; k < STEPS; k++) {
    const h = scale * H0 * Math.pow(2, -k);
    const x = a + side * h;
    if (x === a) break;
    xs.push(x); vs.push(f(x));
  }
  const samples = xs.map((x, i) => [x, vs[i]] as [number, number]);
  // the tail must be defined: a function undefined on one side has no limit from that side
  const finiteTail = vs.slice(-12).filter(Number.isFinite).length;
  if (finiteTail < 8) {
    const infs = vs.slice(-12).filter((v) => v === Infinity || v === -Infinity);
    if (infs.length >= 8 && infs.every((v) => v === infs[0])) return { kind: infs[0] > 0 ? '+inf' : '-inf', value: infs[0], error: 0, samples };
    return { kind: 'undefined', value: NaN, error: NaN, samples };
  }
  const v = vs.filter(Number.isFinite);
  const n = v.length;
  const d = v.slice(1).map((y, i) => y - v[i]);

  // divergence: the last dozen steps all move the same way and do not shrink
  const tail = d.slice(-12);
  const sameSign = tail.every((t) => t > 0) || tail.every((t) => t < 0);
  if (sameSign && Math.abs(tail[tail.length - 1]) >= 0.5 * Math.abs(tail[0])) {
    return { kind: tail[0] > 0 ? '+inf' : '-inf', value: tail[0] > 0 ? Infinity : -Infinity, error: 0, samples };
  }

  // stop where rounding noise takes over: the step sizes reach their smallest envelope
  const env = d.map((_, i) => Math.max(...d.slice(Math.max(0, i - 1), i + 2).map(Math.abs)));
  let kStop = 0;
  for (let i = 1; i < env.length; i++) if (env[i] <= env[kStop]) kStop = i;
  const scaleV = Math.max(1, ...v.slice(0, Math.max(3, kStop + 2)).map(Math.abs));

  // did the steps shrink at all? (oscillation does not)
  const early = Math.max(...d.slice(0, 4).map(Math.abs));
  const shrank = env[kStop] <= Math.max(1e-3 * early, 1e-9 * scaleV) || env[kStop] <= 1e-11 * scaleV;
  if (!shrank) {
    // monotone but slow (like −1/ln x at 0⁺): a limit exists, known only roughly
    if (sameSign && Math.abs(tail[tail.length - 1]) < 0.5 * Math.abs(tail[0])) return { kind: 'finite', value: v[n - 1], error: 12 * Math.abs(tail[tail.length - 1]), samples };
    return { kind: 'oscillates', value: NaN, error: NaN, samples };
  }

  const floor = 8 * Number.EPSILON * scaleV;
  // locally constant (a step function's flat side): exact
  if (d.slice(-15).every((t) => t === 0)) return { kind: 'finite', value: v[n - 1], error: floor, samples };

  // the asymptotic regime: steps that keep their sign and shrink steadily. Rounding
  // noise at tiny h breaks this pattern (zero steps, sign flips), so it ends the regime.
  const smooth = (k: number) => d[k] !== 0 && d[k + 1] !== 0 && Math.sign(d[k]) === Math.sign(d[k + 1]) && Math.abs(d[k + 1]) < 0.95 * Math.abs(d[k]);
  let k1 = -1, k2 = -1;
  for (let k = 0; k + 1 < d.length;) {
    if (!smooth(k)) { k++; continue; }
    let e = k;
    while (e + 1 < d.length && smooth(e)) e++;
    if (e - k > k2 - k1) { k1 = k; k2 = e; }
    k = e + 1;
  }
  if (k2 - k1 >= 4) {
    // Aitken Δ² inside the regime; the sweet spot is where three consecutive values agree best
    const A: number[] = [];
    for (let k = k1; k + 2 <= k2 + 1 && k + 2 < n; k++) {
      const d0 = v[k + 1] - v[k], d1 = v[k + 2] - v[k + 1], den = d1 - d0;
      A.push(den !== 0 ? v[k + 2] - (d1 * d1) / den : v[k + 2]);
    }
    let best = NaN, err = Infinity;
    for (let k = 0; k + 2 < A.length; k++) {
      const w = Math.max(Math.abs(A[k + 1] - A[k]), Math.abs(A[k + 2] - A[k + 1]));
      if (w < err) { err = w; best = A[k + 2]; }
    }
    if (Number.isFinite(best)) return { kind: 'finite', value: best, error: err + floor, samples };
  }
  // no clean regime (x·sin(1/x)): the sample at the smallest step envelope, with that envelope as the error
  return { kind: 'finite', value: v[Math.min(n - 1, kStop + 1)], error: 2 * env[kStop] + floor, samples };
}

export type PointKind = 'continuous' | 'removable' | 'jump' | 'infinite' | 'oscillating' | 'undefined';

export interface PointReport {
  left: LimitEstimate;
  right: LimitEstimate;
  /** f(a), NaN when undefined */
  value: number;
  kind: PointKind;
  /** the two-sided limit when it exists (finite), else NaN */
  limit: number;
  /** tolerance used to decide equality of numerical limits */
  tol: number;
}

/** Classify the behaviour of f at x = a from its numerical one-sided limits. */
export function classifyPoint(f: (x: number) => number, a: number, scale?: number): PointReport {
  const left = oneSidedLimit(f, a, -1, scale), right = oneSidedLimit(f, a, 1, scale);
  const value = f(a);
  const base = { left, right, value: Number.isFinite(value) ? value : NaN, limit: NaN };
  if (left.kind === 'undefined' && right.kind === 'undefined') return { ...base, kind: 'undefined', tol: 0 };
  const isInf = (l: LimitEstimate) => l.kind === '+inf' || l.kind === '-inf';
  if (isInf(left) || isInf(right)) return { ...base, kind: 'infinite', tol: 0 };
  if (left.kind === 'oscillates' || right.kind === 'oscillates') return { ...base, kind: 'oscillating', tol: 0 };
  // one side undefined (√x at 0): judge by the side that exists
  const sides = [left, right].filter((l) => l.kind === 'finite');
  const L = sides[0].value;
  const tol = Math.max(1e-6 * Math.max(1, Math.abs(L)), 20 * Math.max(...sides.map((s) => s.error)));
  if (sides.length === 2 && Math.abs(left.value - right.value) > tol) return { ...base, kind: 'jump', tol };
  const lim = sides.length === 2 ? (left.value + right.value) / 2 : L;
  if (Number.isFinite(value) && Math.abs(value - lim) <= tol) return { ...base, limit: lim, kind: 'continuous', tol };
  return { ...base, limit: lim, kind: 'removable', tol };
}

/**
 * The largest δ (searched on a grid, then refined by bisection) such that
 * |f(x) − L| < ε for every sampled x with 0 < |x − a| < δ (on the requested sides).
 * Sampling-based: a very narrow spike between samples could be missed; the caller says so.
 */
export function largestDelta(f: (x: number) => number, a: number, L: number, eps: number, deltaMax: number, sides: 'both' | 'left' | 'right' = 'both', samples = 600): number {
  const bad = (h: number) => {
    const ok = (x: number) => { const y = f(x); return Number.isFinite(y) && Math.abs(y - L) < eps; };
    return (sides !== 'left' && !ok(a + h)) || (sides !== 'right' && !ok(a - h));
  };
  // walk outward on a geometric-then-linear grid; the first failure bounds δ
  let prev = 0;
  for (let i = 1; i <= samples; i++) {
    const h = deltaMax * Math.pow(i / samples, 2);
    if (bad(h)) {
      let lo = prev, hi = h;
      for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (bad(m)) hi = m; else lo = m; }
      // make sure nothing between 0 and lo fails on a finer look
      return lo;
    }
    prev = h;
  }
  return deltaMax;
}
