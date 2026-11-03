// Accumulation and Riemann sums for teaching the integral.
//   cumulativeIntegral — A(x) = ∫_a^x f(t) dt on a grid, cell by cell with
//                        adaptive Gauss–Kronrod, with a global error bound
//   partitionSum       — a Riemann sum on any partition (non-uniform allowed)
//                        with left / right / midpoint / trapezoid / lower /
//                        upper tags; returns the rectangles to draw

import { integrate } from './quad';

export interface Cumulative {
  xs: Float64Array;
  /** A(x_i) = ∫_a^{x_i} f; NaN past a point where f is not integrable */
  A: Float64Array;
  /** sum of the quadrature error estimates (an absolute bound on |A error| in practice) */
  error: number;
  /** where the integral stopped being finite, if it did */
  badAt: number | null;
}

/** A(x) = ∫_a^x f(t) dt at n + 1 equally spaced x in [lo, hi]. */
export function cumulativeIntegral(f: (x: number) => number, a: number, lo: number, hi: number, n: number, tol = 1e-10): Cumulative {
  const xs = new Float64Array(n + 1), A = new Float64Array(n + 1);
  const h = (hi - lo) / n;
  for (let i = 0; i <= n; i++) xs[i] = lo + h * i;
  let error = 0, badAt: number | null = null;
  const piece = (p: number, q: number): number => {
    const r = integrate(f, p, q, tol, 4000);
    error += r.error;
    if (r.warning && /not finite|finite value/.test(r.warning)) { if (badAt === null) badAt = (p + q) / 2; return NaN; }
    return r.value;
  };
  // the grid index just at or below a (clamped), and A there
  const j = Math.max(0, Math.min(n, Math.floor((a - lo) / h)));
  A[j] = piece(a, xs[j]);
  // walk right from j, then left; NaN propagates past a singularity
  for (let i = j + 1; i <= n; i++) A[i] = A[i - 1] + piece(xs[i - 1], xs[i]);
  for (let i = j - 1; i >= 0; i--) A[i] = A[i + 1] - piece(xs[i], xs[i + 1]);
  return { xs, A, error, badAt };
}

/** Linear interpolation in a cumulative table. */
export function sampleCumulative(c: Cumulative, x: number): number {
  const n = c.xs.length - 1, lo = c.xs[0], hi = c.xs[n];
  if (x < lo || x > hi) return NaN;
  const t = ((x - lo) / (hi - lo)) * n, i = Math.min(n - 1, Math.floor(t)), u = t - i;
  return c.A[i] * (1 - u) + c.A[i + 1] * u;
}

export type Tag = 'left' | 'right' | 'mid' | 'trap' | 'lower' | 'upper';

export interface Rect { x0: number; x1: number; /** the sample point (NaN for trapezoids) */ tag: number; /** height (rectangles) */ h: number; /** trapezoid heights at x0, x1 */ h0: number; h1: number }

export interface PartitionSum { sum: number; rects: Rect[]; /** a cell where f was undefined */ undefinedAt: number | null }

/**
 * Riemann sum of f over the partition pts (sorted ascending, at least two points).
 * 'lower'/'upper' use the minimum/maximum of f on each cell, found by sampling
 * (`samples` points per cell plus the endpoints) — numerical, not exact.
 */
export function partitionSum(f: (x: number) => number, pts: number[], tag: Tag, samples = 32): PartitionSum {
  const rects: Rect[] = [];
  let sum = 0, undefinedAt: number | null = null;
  for (let i = 0; i + 1 < pts.length; i++) {
    const x0 = pts[i], x1 = pts[i + 1], w = x1 - x0;
    if (w <= 0) continue;
    let t = NaN, h = NaN;
    const y0 = f(x0), y1 = f(x1);
    if (tag === 'trap') { h = (y0 + y1) / 2; }
    else if (tag === 'left') { t = x0; h = y0; }
    else if (tag === 'right') { t = x1; h = y1; }
    else if (tag === 'mid') { t = (x0 + x1) / 2; h = f(t); }
    else {
      let best = tag === 'lower' ? Infinity : -Infinity;
      for (let k = 0; k <= samples; k++) {
        const x = x0 + (w * k) / samples, y = f(x);
        if (!Number.isFinite(y)) { best = NaN; break; }
        if (tag === 'lower' ? y < best : y > best) { best = y; t = x; }
      }
      h = best;
    }
    if (!Number.isFinite(h)) { if (undefinedAt === null) undefinedAt = Number.isFinite(t) ? t : (x0 + x1) / 2; }
    sum += h * w;
    rects.push({ x0, x1, tag: t, h, h0: y0, h1: y1 });
  }
  return { sum, rects, undefinedAt };
}

/** n equal subintervals of [a, b]. */
export function uniformPartition(a: number, b: number, n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
}
