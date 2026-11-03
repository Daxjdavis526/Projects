// Numerics for multivariable and vector calculus (Calculus III): nested
// adaptive quadrature in two and three dimensions with honest error estimates,
// line and surface integrals, Riemann sums, critical points classified by the
// Hessian, Lagrange-multiplier solutions classified by the bordered Hessian,
// contour extraction, streamlines, polygon areas and a singularity detector.
// DOM-free; tested in tests/vcalc.test.ts against exact answers.

import { integrate, QuadResult } from './quad';

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export interface NestedResult extends QuadResult {
  /** the evaluation budget ran out: the value is a coarse estimate, not converged */
  budgetHit?: boolean;
}

/**
 * ∫_{ax}^{bx} ∫_{ay(x)}^{by(x)} f(x, y) dy dx by nested adaptive Gauss–Kronrod.
 * The error estimate is the outer estimate plus (largest inner estimate) × (bx − ax),
 * a conservative bound on how the inner errors propagate. A budget of function
 * evaluations keeps rough integrands from freezing the interface; when it runs out
 * the inner integrals drop to one Kronrod panel and `budgetHit` is set.
 */
export function integrate2e(f: (x: number, y: number) => number, ax: number, bx: number, ay: (x: number) => number, by: (x: number) => number, tol = 1e-8, budget = 2e6): NestedResult {
  let evals = 0, maxInner = 0, innerOk = true, budgetHit = false;
  let warn: string | undefined;
  const outer = integrate((x) => {
    const lo = ay(x), hi = by(x);
    if (!(hi > lo)) return 0;
    const r = integrate((y) => f(x, y), lo, hi, tol, evals > budget ? 15 : 6000);
    evals += r.evals;
    if (evals > budget) budgetHit = true;
    if (r.error > maxInner) maxInner = r.error;
    if (!r.ok) innerOk = false;
    if (r.warning && !warn) warn = r.warning;
    return r.value;
  }, ax, bx, tol, 6000);
  const error = outer.error + maxInner * Math.abs(bx - ax);
  const ok = outer.ok && innerOk && !budgetHit && Number.isFinite(outer.value);
  return { value: outer.value, error, evals: evals + outer.evals, ok, budgetHit, warning: outer.warning ?? warn ?? (budgetHit ? 'The integrand is rough: the evaluation budget ran out before full accuracy' : undefined) };
}

/**
 * ∫∫∫ f over ax ≤ x ≤ bx, ay(x) ≤ y ≤ by(x), az(x, y) ≤ z ≤ bz(x, y), nested three deep.
 * Same error accounting as integrate2e, one level further.
 */
export function integrate3e(f: (x: number, y: number, z: number) => number, ax: number, bx: number, ay: (x: number) => number, by: (x: number) => number,
  az: (x: number, y: number) => number, bz: (x: number, y: number) => number, tol = 1e-7, budget = 3e6): NestedResult {
  let evals = 0, maxMid = 0, ok = true, budgetHit = false;
  let warn: string | undefined;
  const outer = integrate((x) => {
    const ylo = ay(x), yhi = by(x);
    if (!(yhi > ylo)) return 0;
    let maxIn = 0;
    const mid = integrate((y) => {
      const zlo = az(x, y), zhi = bz(x, y);
      if (!(zhi > zlo)) return 0;
      const r = integrate((z) => f(x, y, z), zlo, zhi, tol, evals > budget ? 15 : 1500);
      evals += r.evals;
      if (evals > budget) budgetHit = true;
      if (r.error > maxIn) maxIn = r.error;
      if (!r.ok) ok = false;
      if (r.warning && !warn) warn = r.warning;
      return r.value;
    }, ylo, yhi, tol, evals > budget ? 15 : 1500);
    evals += mid.evals;
    const e = mid.error + maxIn * (yhi - ylo);
    if (e > maxMid) maxMid = e;
    if (!mid.ok) ok = false;
    if (mid.warning && !warn) warn = mid.warning;
    return mid.value;
  }, ax, bx, tol, 3000);
  const error = outer.error + maxMid * Math.abs(bx - ax);
  return { value: outer.value, error, evals: evals + outer.evals, ok: ok && outer.ok && !budgetHit && Number.isFinite(outer.value), budgetHit,
    warning: outer.warning ?? warn ?? (budgetHit ? 'The integrand is rough: the evaluation budget ran out before full accuracy' : undefined) };
}

/** ∫_C F · dr for r(t), t ∈ [t0, t1], with r′ given (exact derivative). Works in any dimension. */
export function lineIntegral(F: (p: number[]) => number[], r: (t: number) => number[], rp: (t: number) => number[], t0: number, t1: number, tol = 1e-10): QuadResult {
  return integrate((t) => { const p = r(t), v = rp(t), w = F(p); let s = 0; for (let i = 0; i < v.length; i++) s += w[i] * v[i]; return s; }, t0, t1, tol);
}

/** ∫_C f ds (arc-length line integral of a scalar). */
export function scalarLineIntegral(f: (p: number[]) => number, r: (t: number) => number[], rp: (t: number) => number[], t0: number, t1: number, tol = 1e-10): QuadResult {
  return integrate((t) => f(r(t)) * Math.hypot(...rp(t)), t0, t1, tol);
}

/**
 * Flux ∬_S F · n dS of a parametrized surface S(u, v), u ∈ [u0, u1], v ∈ [v0, v1],
 * with N(u, v) = S_u × S_v (not normalized — its length is the area element).
 */
export function fluxIntegral(F: (p: Vec3) => Vec3, S: (u: number, v: number) => Vec3, N: (u: number, v: number) => Vec3, u0: number, u1: number, v0: number, v1: number, tol = 1e-8): NestedResult {
  return integrate2e((u, v) => { const w = F(S(u, v)), n = N(u, v); return w[0] * n[0] + w[1] * n[1] + w[2] * n[2]; }, u0, u1, () => v0, () => v1, tol);
}

/** Surface area ∬ |S_u × S_v| du dv. */
export function surfaceArea(N: (u: number, v: number) => Vec3, u0: number, u1: number, v0: number, v1: number, tol = 1e-9): NestedResult {
  return integrate2e((u, v) => Math.hypot(...N(u, v)), u0, u1, () => v0, () => v1, tol);
}

export type SampleRule = 'll' | 'mid' | 'ur';

/** Riemann sum of f over n × m boxes of [x0,x1] × [y0,y1]; boxes whose sample point is outside `inside` are skipped. */
export function riemann2(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, n: number, m: number, rule: SampleRule = 'mid', inside?: (x: number, y: number) => boolean): number {
  const hx = (x1 - x0) / n, hy = (y1 - y0) / m, o = rule === 'll' ? 0 : rule === 'mid' ? 0.5 : 1;
  let s = 0;
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const x = x0 + (i + o) * hx, y = y0 + (j + o) * hy;
    if (inside && !inside(x, y)) continue;
    s += f(x, y);
  }
  return s * hx * hy;
}

/** Midpoint Riemann sum of g over the box [a0,a1]×[b0,b1]×[c0,c1] split n ways per side (g already includes any Jacobian). */
export function riemann3(g: (a: number, b: number, c: number) => number, a0: number, a1: number, b0: number, b1: number, c0: number, c1: number, n: number, inside?: (a: number, b: number, c: number) => boolean): number {
  const ha = (a1 - a0) / n, hb = (b1 - b0) / n, hc = (c1 - c0) / n;
  let s = 0;
  for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = a0 + (i + 0.5) * ha, b = b0 + (j + 0.5) * hb, c = c0 + (k + 0.5) * hc;
    if (inside && !inside(a, b, c)) continue;
    const v = g(a, b, c);
    if (Number.isFinite(v)) s += v;
  }
  return s * ha * hb * hc;
}

// ── critical points ────────────────────────────────────────────────────────

export type CritKind = 'min' | 'max' | 'saddle' | 'degenerate';
export interface Crit2 { x: number; y: number; f: number; fxx: number; fxy: number; fyy: number; D: number; kind: CritKind }

/** Classify by the second-derivative test: D = fxx fyy − fxy². */
export function classifyHessian(fxx: number, fxy: number, fyy: number, scale = 1): { D: number; kind: CritKind } {
  const D = fxx * fyy - fxy * fxy;
  const eps = 1e-9 * Math.max(1, scale * scale);
  if (D > eps) return { D, kind: fxx > 0 ? 'min' : 'max' };
  if (D < -eps) return { D, kind: 'saddle' };
  return { D, kind: 'degenerate' };
}

/**
 * Every critical point of f in [x0,x1] × [y0,y1] that Newton's method on ∇f = 0 reaches
 * from an n × n grid of seeds (exact gradient and Hessian supplied). Degenerate critical
 * points (singular Hessian) are found only when Newton still converges to them.
 */
export function criticalPoints2(f: (x: number, y: number) => number, grad: (x: number, y: number) => Vec2, hess: (x: number, y: number) => Vec3,
  x0: number, x1: number, y0: number, y1: number, n = 14): Crit2[] {
  const out: Crit2[] = [];
  const size = Math.max(x1 - x0, y1 - y0);
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    let x = x0 + ((x1 - x0) * (i + 0.5)) / (n + 1), y = y0 + ((y1 - y0) * (j + 0.5)) / (n + 1);
    let conv = false;
    for (let it = 0; it < 60; it++) {
      const [gx, gy] = grad(x, y), [a, b, c] = hess(x, y);
      if (![gx, gy, a, b, c].every(Number.isFinite)) break;
      const det = a * c - b * b;
      if (Math.hypot(gx, gy) < 1e-12 * Math.max(1, Math.abs(f(x, y)))) { conv = true; break; }
      if (Math.abs(det) < 1e-14) break;
      let dx = (c * gx - b * gy) / det, dy = (a * gy - b * gx) / det;
      const step = Math.hypot(dx, dy), cap = size * 0.25;
      if (step > cap) { dx *= cap / step; dy *= cap / step; }
      x -= dx; y -= dy;
      if (step < 1e-13 * size) { conv = Math.hypot(...grad(x, y)) < 1e-7; break; }
    }
    if (!conv || x < x0 || x > x1 || y < y0 || y > y1) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.y - y) < 1e-6 * size)) continue;
    const [a, b, c] = hess(x, y);
    const { D, kind } = classifyHessian(a, b, c);
    out.push({ x, y, f: f(x, y), fxx: a, fxy: b, fyy: c, D, kind });
  }
  return out.sort((p, q) => p.x - q.x || p.y - q.y);
}

export interface LagrangePoint { x: number; y: number; lambda: number; f: number; bordered: number; kind: 'max' | 'min' | 'degenerate' }

/**
 * Solutions of ∇f = λ∇g, g = 0 by Newton's method on (x, y, λ) from the given seeds
 * (points on or near the constraint). Classified by the bordered Hessian
 * det [[0, gx, gy], [gx, Lxx, Lxy], [gy, Lxy, Lyy]] (L = f − λg): > 0 local max, < 0 local min.
 */
export function lagrange2(f: (x: number, y: number) => number, grad: (x: number, y: number) => Vec2, hess: (x: number, y: number) => Vec3,
  g: (x: number, y: number) => number, ggrad: (x: number, y: number) => Vec2, ghess: (x: number, y: number) => Vec3, seeds: Vec2[], scale = 1): LagrangePoint[] {
  const out: LagrangePoint[] = [];
  for (const s of seeds) {
    let [x, y] = s;
    let [gx, gy] = ggrad(x, y);
    const [fx0, fy0] = grad(x, y);
    let lam = (fx0 * gx + fy0 * gy) / (gx * gx + gy * gy || 1);
    let conv = false;
    for (let it = 0; it < 50; it++) {
      const [fx, fy] = grad(x, y); [gx, gy] = ggrad(x, y);
      const [fa, fb, fc] = hess(x, y), [ga, gb, gc] = ghess(x, y);
      const G = g(x, y);
      const r = [fx - lam * gx, fy - lam * gy, G];
      if (!r.every(Number.isFinite)) break;
      if (Math.hypot(...r) < 1e-12 * Math.max(1, Math.hypot(fx, fy))) { conv = true; break; }
      // Jacobian of the system in (x, y, λ)
      const J = [[fa - lam * ga, fb - lam * gb, -gx], [fb - lam * gb, fc - lam * gc, -gy], [gx, gy, 0]];
      const d = solve3(J, r);
      if (!d) break;
      const step = Math.hypot(d[0], d[1]);
      const cap = 0.3 * scale;
      const k = step > cap ? cap / step : 1;
      x -= d[0] * k; y -= d[1] * k; lam -= d[2] * k;
      if (step < 1e-14 * scale) { conv = Math.abs(g(x, y)) < 1e-9; break; }
    }
    if (!conv || !Number.isFinite(x + y + lam)) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.y - y) < 1e-6 * scale)) continue;
    [gx, gy] = ggrad(x, y);
    const [fa, fb, fc] = hess(x, y), [ga, gb, gc] = ghess(x, y);
    const Lxx = fa - lam * ga, Lxy = fb - lam * gb, Lyy = fc - lam * gc;
    const B = -gx * (gx * Lyy - Lxy * gy) + gy * (gx * Lxy - Lxx * gy);
    const tolB = 1e-9 * Math.max(1, (gx * gx + gy * gy) * (Math.abs(Lxx) + Math.abs(Lyy) + Math.abs(Lxy)));
    out.push({ x, y, lambda: lam, f: f(x, y), bordered: B, kind: B > tolB ? 'max' : B < -tolB ? 'min' : 'degenerate' });
  }
  return out;
}

/** Solve a 3×3 system by Cramer's rule (null when singular). */
export function solve3(A: number[][], b: number[]): number[] | null {
  const det = (M: number[][]) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  const D = det(A);
  if (!Number.isFinite(D) || Math.abs(D) < 1e-300) return null;
  const col = (k: number) => A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)));
  return [det(col(0)) / D, det(col(1)) / D, det(col(2)) / D];
}

// ── curves and regions ─────────────────────────────────────────────────────

/**
 * Zero set of F on a grid over [x0,x1] × [y0,y1] by marching squares.
 * Returns a flat array of segments [xa, ya, xb, yb, …]. Sign flips across poles are dropped.
 */
export function contourSegments(F: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, nx: number, ny: number): number[] {
  const hx = (x1 - x0) / nx, hy = (y1 - y0) / ny;
  const v = new Float64Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) v[j * (nx + 1) + i] = F(x0 + i * hx, y0 + j * hy);
  const out: number[] = [];
  const lerp = (a: number, b: number) => (a === b ? 0.5 : a / (a - b));
  const e: number[] = [];
  // Each crossing is refined by a few bisection steps. At a true level crossing the values at the
  // shrunken bracket are small; across a pole they grow — then the cell is dropped.
  let pole = false;
  const cross = (xa: number, ya: number, xb: number, yb: number, a: number, b: number) => {
    let lo = 0, hi = 1, flo = a, fhi = b;
    for (let k = 0; k < 6; k++) {
      const m = (lo + hi) / 2, fm = F(xa + (xb - xa) * m, ya + (yb - ya) * m);
      if (!Number.isFinite(fm)) { pole = true; return; }
      if ((fm < 0) === (flo < 0)) { lo = m; flo = fm; } else { hi = m; fhi = fm; }
    }
    if (Math.min(Math.abs(flo), Math.abs(fhi)) > 0.25 * Math.max(Math.abs(a), Math.abs(b))) pole = true;
    const t = lo + (hi - lo) * lerp(flo, fhi);
    e.push(xa + (xb - xa) * t, ya + (yb - ya) * t);
  };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = v[j * (nx + 1) + i], b = v[j * (nx + 1) + i + 1], c = v[(j + 1) * (nx + 1) + i + 1], d = v[(j + 1) * (nx + 1) + i];
    if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d))) continue;
    const X = x0 + i * hx, Y = y0 + j * hy;
    e.length = 0; pole = false;
    if ((a < 0) !== (b < 0)) cross(X, Y, X + hx, Y, a, b);
    if ((b < 0) !== (c < 0)) cross(X + hx, Y, X + hx, Y + hy, b, c);
    if ((c < 0) !== (d < 0)) cross(X + hx, Y + hy, X, Y + hy, c, d);
    if ((d < 0) !== (a < 0)) cross(X, Y + hy, X, Y, d, a);
    if (e.length < 4 || pole) continue;
    // a grid vertex exactly on the curve gives a zero-length piece: drop it (the neighbours carry the curve)
    const tiny = 1e-7 * (hx + hy);
    if (Math.abs(e[0] - e[2]) + Math.abs(e[1] - e[3]) > tiny) out.push(e[0], e[1], e[2], e[3]);
    if (e.length === 8 && Math.abs(e[4] - e[6]) + Math.abs(e[5] - e[7]) > tiny) out.push(e[4], e[5], e[6], e[7]);
  }
  return out;
}

/** Shoelace area of a closed polygon (positive when counter-clockwise). */
export function polygonArea(pts: ArrayLike<number>[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; }
  return s / 2;
}

/** A streamline of a field by fixed-step RK4 (arc-length normalized, so speed does not matter). Stops outside the box. */
export function streamline(F: (p: Vec3) => Vec3, p0: Vec3, h: number, steps: number, box: { lo: Vec3; hi: Vec3 }, backward = false): Vec3[] {
  const s = backward ? -1 : 1;
  const dir = (p: Vec3): Vec3 | null => { const v = F(p), m = Math.hypot(v[0], v[1], v[2]); return m > 1e-12 && Number.isFinite(m) ? [(s * v[0]) / m, (s * v[1]) / m, (s * v[2]) / m] : null; };
  const out: Vec3[] = [p0];
  let p = p0;
  for (let i = 0; i < steps; i++) {
    const k1 = dir(p); if (!k1) break;
    const k2 = dir([p[0] + (h / 2) * k1[0], p[1] + (h / 2) * k1[1], p[2] + (h / 2) * k1[2]]); if (!k2) break;
    const k3 = dir([p[0] + (h / 2) * k2[0], p[1] + (h / 2) * k2[1], p[2] + (h / 2) * k2[2]]); if (!k3) break;
    const k4 = dir([p[0] + h * k3[0], p[1] + h * k3[1], p[2] + h * k3[2]]); if (!k4) break;
    p = [p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]), p[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])];
    if (p.some((c, k) => c < box.lo[k] || c > box.hi[k])) break;
    out.push(p);
    if (i > 20 && Math.hypot(p[0] - p0[0], p[1] - p0[1], p[2] - p0[2]) < h * 0.5) break;     // closed loop
  }
  return out;
}

/**
 * Look for a point where |g| blows up inside a box (optionally restricted by `inside`):
 * sample a grid, then zoom repeatedly into the largest value. A genuine singularity keeps
 * growing as the zoom closes in; a smooth maximum levels off. Returns the location or null.
 */
export function findBlowup(g: (p: number[]) => number, lo: number[], hi: number[], inside?: (p: number[]) => boolean, n = 24): number[] | null {
  const dim = lo.length;
  const sample = (a: number[], b: number[], m: number, keep?: number[]) => {
    let best = -1, at: number[] | null = null;
    const idx = new Array(dim).fill(0);
    const total = Math.pow(m + 1, dim);
    for (let k = 0; k < total; k++) {
      let r = k;
      for (let d = 0; d < dim; d++) { idx[d] = r % (m + 1); r = Math.floor(r / (m + 1)); }
      const p = idx.map((i, d) => a[d] + ((b[d] - a[d]) * i) / m);
      if (inside && !inside(p)) continue;
      const v = Math.abs(g(p));
      if (!Number.isFinite(v)) return { v: Infinity, at: p };
      keep?.push(v);
      if (v > best) { best = v; at = p; }
    }
    return { v: best, at };
  };
  const all: number[] = [];
  let { v, at } = sample(lo, hi, n, all);
  if (!at) return null;
  if (v === Infinity) return at;
  all.sort((p, q) => p - q);
  const median = Math.max(all[Math.floor(all.length / 2)], 1e-300);
  let w = hi.map((h, d) => (h - lo[d]) / n);
  for (let level = 0; level < 8; level++) {
    const a = at!.map((c, d) => c - w[d]), b = at!.map((c, d) => c + w[d]);
    const r = sample(a, b, 6);
    if (!r.at) break;
    if (r.v === Infinity) return r.at;
    v = r.v; at = r.at;
    w = w.map((x) => x / 3);
  }
  // 8 zooms close in ~6500× on the largest value: a 1/r-type singularity grows far beyond the typical size
  return v > 1e4 * median && v > 1e3 ? at : null;
}

/**
 * Join marching-squares segments (flat [xa, ya, xb, yb, …]) into polylines by matching
 * shared endpoints, so curves can be drawn as continuous paths.
 */
export function chainSegments(flat: ArrayLike<number>, tol = 1e-9): number[][] {
  const n = Math.floor(flat.length / 4);
  if (!n) return [];
  let scale = 0;
  for (let i = 0; i < flat.length; i++) scale = Math.max(scale, Math.abs(flat[i]));
  const q = Math.max(scale, 1) * tol * 1e3;
  const key = (x: number, y: number) => `${Math.round(x / q)},${Math.round(y / q)}`;
  const ends = new Map<string, number[]>();      // endpoint → segment ids
  for (let s = 0; s < n; s++) for (const e of [0, 1]) {
    const k = key(flat[4 * s + 2 * e], flat[4 * s + 2 * e + 1]);
    const list = ends.get(k); if (list) list.push(s); else ends.set(k, [s]);
  }
  const used = new Uint8Array(n);
  const out: number[][] = [];
  const other = (s: number, x: number, y: number) => { const k = key(x, y); return (ends.get(k) ?? []).find((t) => t !== s && !used[t]); };
  for (let s0 = 0; s0 < n; s0++) {
    if (used[s0]) continue;
    used[s0] = 1;
    const line = [flat[4 * s0], flat[4 * s0 + 1], flat[4 * s0 + 2], flat[4 * s0 + 3]];
    // extend forward from the tail, then backward from the head
    for (const dir of [1, -1]) {
      for (;;) {
        const x = dir > 0 ? line[line.length - 2] : line[0], y = dir > 0 ? line[line.length - 1] : line[1];
        const t = other(-1, x, y);
        if (t === undefined) break;
        used[t] = 1;
        const ax = flat[4 * t], ay = flat[4 * t + 1], bx = flat[4 * t + 2], by = flat[4 * t + 3];
        const startMatches = key(ax, ay) === key(x, y);
        const [nx, ny] = startMatches ? [bx, by] : [ax, ay];
        if (dir > 0) line.push(nx, ny); else line.unshift(nx, ny);
      }
    }
    out.push(line);
  }
  return out;
}
