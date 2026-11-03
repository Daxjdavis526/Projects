// Roots and extrema of functions of one variable: Brent's method on a bracket,
// and a scan that finds every sign change (roots) or derivative sign change
// (critical points) on an interval.

export function brent(f: (x: number) => number, a: number, b: number, tol = 1e-13, maxIter = 200): number | null {
  let fa = f(a), fb = f(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  let c = a, fc = fa, d = b - a, e = d;
  for (let i = 0; i < maxIter; i++) {
    if (fb * fc > 0) { c = a; fc = fa; d = e = b - a; }
    if (Math.abs(fc) < Math.abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
    const tol1 = 2 * Number.EPSILON * Math.abs(b) + tol / 2, xm = (c - b) / 2;
    if (Math.abs(xm) <= tol1 || fb === 0) return b;
    if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
      const s = fb / fa;
      let p: number, q: number;
      if (a === c) { p = 2 * xm * s; q = 1 - s; }
      else { const q0 = fa / fc, r = fb / fc; p = s * (2 * xm * q0 * (q0 - r) - (b - a) * (r - 1)); q = (q0 - 1) * (r - 1) * (s - 1); }
      if (p > 0) q = -q; else p = -p;
      if (2 * p < Math.min(3 * xm * q - Math.abs(tol1 * q), Math.abs(e * q))) { e = d; d = p / q; } else { d = xm; e = d; }
    } else { d = xm; e = d; }
    a = b; fa = fb;
    b += Math.abs(d) > tol1 ? d : xm > 0 ? tol1 : -tol1;
    fb = f(b);
  }
  return b;
}

/** All roots of f in [a, b] found by sign changes on n samples (misses double roots, which is said by the caller). */
export function findRoots(f: (x: number) => number, a: number, b: number, n = 400): number[] {
  const out: number[] = [];
  let x0 = a, f0 = f(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n, f1 = f(x1);
    if (Number.isFinite(f0) && Number.isFinite(f1)) {
      if (f0 === 0) out.push(x0);
      else if (f0 * f1 < 0) {
        const r = brent(f, x0, x1);
        // a sign change across a pole is not a root
        if (r !== null && Math.abs(f(r)) < 1e-6 * (1 + Math.abs(f0) + Math.abs(f1))) out.push(r);
      }
    }
    x0 = x1; f0 = f1;
  }
  if (Number.isFinite(f0) && f0 === 0) out.push(x0);
  return out.filter((r, i) => i === 0 || Math.abs(r - out[i - 1]) > 1e-9);
}

export interface CriticalPoint { x: number; y: number; kind: 'max' | 'min' | 'flat' }

/** Critical points of f from the roots of f′, classified by the sign of f″. */
export function criticalPoints(f: (x: number) => number, df: (x: number) => number, d2f: (x: number) => number, a: number, b: number): CriticalPoint[] {
  return findRoots(df, a, b).map((x) => {
    const c = d2f(x);
    return { x, y: f(x), kind: c < -1e-9 ? 'max' : c > 1e-9 ? 'min' : 'flat' };
  });
}

/** Inflection points: where f″ changes sign. */
export function inflectionPoints(f: (x: number) => number, d2f: (x: number) => number, a: number, b: number): { x: number; y: number }[] {
  return findRoots(d2f, a, b).map((x) => ({ x, y: f(x) }));
}
