// DOM-free numerics for the Fidget playgrounds: smoothing, vector algebra,
// exact 2×2 eigen-analysis, Taylor coefficients by Taylor-mode automatic
// differentiation, surface curvature from the fundamental forms, a rover that
// drives along geodesics, a damped 2D wave solver with an automatic stable
// time step, and an RK4 step for planar flows. Everything here is tested in
// tests/fidget.test.ts against exact answers.

import type { Node } from '../expr';
import { CONSTANTS } from '../expr';

export type V3 = [number, number, number];

// ── smoothing ─────────────────────────────────────────────────────────────
/** Frame-rate independent exponential approach of `cur` to `target` (rate in 1/s). */
export function approach(cur: number, target: number, rate: number, dt: number): number {
  return target + (cur - target) * Math.exp(-rate * dt);
}
/** Cubic ease 0 → 1 with zero slope at both ends. */
export const smoothstep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** Round to the nearest multiple of `step` (and clean −0 and float dust). */
export const snapTo = (v: number, step: number) => { const r = Math.round(v / step) * step; return +r.toFixed(10) + 0; };

// ── vectors ───────────────────────────────────────────────────────────────
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const scale3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const unit3 = (a: V3): V3 => { const n = norm3(a); return n > 0 ? [a[0] / n, a[1] / n, a[2] / n] : [0, 0, 0]; };

export interface VecStats {
  dot: number; cross: V3; magA: number; magB: number;
  /** angle between a and b in radians (NaN if either is zero) — atan2(|a×b|, a·b), accurate at every angle */
  angle: number;
  /** scalar projection of a on b, a·b/|b| */
  comp: number;
  /** vector projection of a on b, and the rejection a − proj */
  proj: V3; rej: V3;
  /** area of the parallelogram spanned by a and b */
  area: number;
  /** a · (b × c), the signed volume of the parallelepiped (when c is given) */
  triple: number;
}

export function vecStats(a: V3, b: V3, c?: V3): VecStats {
  const d = dot3(a, b), x = cross3(a, b), area = norm3(x);
  const magA = norm3(a), magB = norm3(b);
  const angle = magA > 0 && magB > 0 ? Math.atan2(area, d) : NaN;
  const bb = magB * magB;
  const proj: V3 = bb > 0 ? scale3(b, d / bb) : [0, 0, 0];
  return { dot: d, cross: x, magA, magB, angle, comp: magB > 0 ? d / magB : NaN, proj, rej: sub3(a, proj), area, triple: c ? dot3(c, x) : NaN };
}

// ── 2×2 eigen-analysis, exact closed form ────────────────────────────────
export interface Eig2 {
  /** distinct real, a repeated eigenvalue with one eigen-direction (defective),
   *  a scalar matrix (every direction is an eigen-direction), or a complex pair */
  kind: 'distinct' | 'defective' | 'scalar' | 'complex';
  /** real eigenvalues (both entries equal when repeated); for complex, [re, re] */
  values: [number, number];
  /** imaginary part of the complex pair (0 otherwise) */
  im: number;
  /** unit eigenvectors for the real eigenvalues (one for defective, none for complex or scalar) */
  vectors: [number, number][];
  trace: number; det: number;
}

/** Eigenvalues and eigenvectors of [[a, b], [c, d]]. */
export function eig2(a: number, b: number, c: number, d: number): Eig2 {
  const trace = a + d, det = a * d - b * c;
  const half = (a - d) / 2;
  const disc = half * half + b * c;          // = tr²/4 − det, computed without cancellation
  const sc = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 1e-300);
  const tol = 1e-12 * sc * sc;
  const vecFor = (lam: number): [number, number] => {
    // a null vector of A − λI from whichever row is larger
    const r1: [number, number] = [b, lam - a], r2: [number, number] = [lam - d, c];
    const v = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
    const n = Math.hypot(v[0], v[1]);
    return n > 0 ? [v[0] / n, v[1] / n] : [1, 0];
  };
  if (disc > tol) {
    const s = Math.sqrt(disc), m = trace / 2;
    // stable: the larger-magnitude root first, the other from the product
    const l1 = m >= 0 ? m + s : m - s;
    const l2 = l1 !== 0 ? det / l1 : m - (l1 - m);
    const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return { kind: 'distinct', values: [hi, lo], im: 0, vectors: [vecFor(hi), vecFor(lo)], trace, det };
  }
  if (disc < -tol) {
    return { kind: 'complex', values: [trace / 2, trace / 2], im: Math.sqrt(-disc), vectors: [], trace, det };
  }
  const lam = trace / 2;
  if (Math.abs(b) <= 1e-12 * sc && Math.abs(c) <= 1e-12 * sc && Math.abs(a - d) <= 1e-12 * sc) {
    return { kind: 'scalar', values: [lam, lam], im: 0, vectors: [], trace, det };
  }
  return { kind: 'defective', values: [lam, lam], im: 0, vectors: [vecFor(lam)], trace, det };
}

// ── Taylor coefficients by Taylor-mode automatic differentiation ─────────
// A function is carried as its truncated Taylor series about x = a,
// [f(a), f′(a), f″(a)/2!, …, f⁽ᴺ⁾(a)/N!], and every operation acts on whole
// series by the standard recurrences (Griewank & Walther, ch. 13). This is
// exact up to floating-point rounding and costs O(N²) per operation — unlike
// repeated symbolic differentiation, whose expressions grow exponentially.

type Jet = Float64Array;

export class TaylorError extends Error {}

/**
 * Normalized Taylor coefficients c_k = f⁽ᵏ⁾(a)/k! for k = 0..N of the expression
 * `node` in the variable `x` about `a`. Other symbols take values from `fixed`.
 * Throws TaylorError when f is not analytic at a (|x| at 0, ln at 0, a pole) or
 * uses a function with no series here (floor, Γ, …).
 */
export function taylorCoeffs(node: Node, x: string, a: number, N: number, fixed: Record<string, number> = {}): number[] {
  const n = N + 1;
  const constant = (v: number): Jet => { const j = new Float64Array(n); j[0] = v; return j; };
  const isConst = (j: Jet) => { for (let k = 1; k < n; k++) if (j[k] !== 0) return false; return true; };
  const mul = (p: Jet, q: Jet): Jet => {
    const r = new Float64Array(n);
    for (let k = 0; k < n; k++) { let s = 0; for (let j = 0; j <= k; j++) s += p[j] * q[k - j]; r[k] = s; }
    return r;
  };
  const div = (p: Jet, q: Jet): Jet => {
    if (q[0] === 0) throw new TaylorError('division by a quantity that is zero at the centre (a pole or a removable singularity)');
    const r = new Float64Array(n);
    for (let k = 0; k < n; k++) { let s = p[k]; for (let j = 1; j <= k; j++) s -= q[j] * r[k - j]; r[k] = s / q[0]; }
    return r;
  };
  const exp = (p: Jet): Jet => {
    const r = new Float64Array(n); r[0] = Math.exp(p[0]);
    for (let k = 1; k < n; k++) { let s = 0; for (let j = 1; j <= k; j++) s += j * p[j] * r[k - j]; r[k] = s / k; }
    return r;
  };
  const log = (p: Jet): Jet => {
    if (!(p[0] > 0)) throw new TaylorError('the logarithm needs a positive argument at the centre');
    const r = new Float64Array(n); r[0] = Math.log(p[0]);
    for (let k = 1; k < n; k++) { let s = 0; for (let j = 1; j < k; j++) s += j * r[j] * p[k - j]; r[k] = (p[k] - s / k) / p[0]; }
    return r;
  };
  /** sin and cos (or sinh and cosh when hyp) of a series, together */
  const sincos = (p: Jet, hyp: boolean): [Jet, Jet] => {
    const s = new Float64Array(n), c = new Float64Array(n);
    s[0] = hyp ? Math.sinh(p[0]) : Math.sin(p[0]); c[0] = hyp ? Math.cosh(p[0]) : Math.cos(p[0]);
    for (let k = 1; k < n; k++) {
      let ss = 0, cc = 0;
      for (let j = 1; j <= k; j++) { ss += j * p[j] * c[k - j]; cc += j * p[j] * s[k - j]; }
      s[k] = ss / k; c[k] = (hyp ? cc : -cc) / k;
    }
    return [s, c];
  };
  const powConst = (p: Jet, e: number): Jet => {
    if (Number.isInteger(e) && e >= 0 && e <= 64) {
      let r = constant(1), base = p, k = e;
      while (k > 0) { if (k & 1) r = mul(r, base); k >>= 1; if (k) base = mul(base, base); }
      return r;
    }
    if (p[0] === 0) throw new TaylorError(`x^${e} is not analytic where its base is 0`);
    if (p[0] < 0 && !Number.isInteger(e)) throw new TaylorError('a non-integer power of a negative number is not real');
    const r = new Float64Array(n); r[0] = Math.pow(p[0], e);
    for (let k = 1; k < n; k++) { let s = 0; for (let j = 1; j <= k; j++) s += (e * j - (k - j)) * p[j] * r[k - j]; r[k] = s / (k * p[0]); }
    return r;
  };
  /** the series whose derivative is q · p′ and whose value is v0 (for atan, asin, erf, …) */
  const integrateChain = (p: Jet, q: Jet, v0: number): Jet => {
    const dp = new Float64Array(n);
    for (let k = 0; k < n - 1; k++) dp[k] = (k + 1) * p[k + 1];
    const g = mul(q, dp);
    const r = new Float64Array(n); r[0] = v0;
    for (let k = 1; k < n; k++) r[k] = g[k - 1] / k;
    return r;
  };
  const one = () => constant(1);
  const sq = (p: Jet) => mul(p, p);
  const addJ = (p: Jet, q: Jet, sgn = 1): Jet => { const r = new Float64Array(n); for (let k = 0; k < n; k++) r[k] = p[k] + sgn * q[k]; return r; };

  const go = (e: Node): Jet => {
    switch (e.t) {
      case 'num': return constant(e.v);
      case 'sym': {
        if (e.name === x) { const j = constant(a); if (n > 1) j[1] = 1; return j; }
        if (e.name in fixed) return constant(fixed[e.name]);
        if (e.name in CONSTANTS) return constant(CONSTANTS[e.name].value);
        throw new TaylorError(`“${e.name}” has no value`);
      }
      case 'neg': { const p = go(e.a); return p.map((v) => -v); }
      case 'add': return addJ(go(e.a), go(e.b));
      case 'sub': return addJ(go(e.a), go(e.b), -1);
      case 'mul': return mul(go(e.a), go(e.b));
      case 'div': return div(go(e.a), go(e.b));
      case 'pow': {
        const p = go(e.a), q = go(e.b);
        if (isConst(q)) return powConst(p, q[0]);
        return exp(mul(q, log(p)));
      }
      case 'call': {
        if (e.args.length !== 1) throw new TaylorError(`${e.fn} has no Taylor series here`);
        const p = go(e.args[0]);
        switch (e.fn) {
          case 'exp': return exp(p);
          case 'ln': case 'log': return log(p);
          case 'log10': return log(p).map((v) => v / Math.LN10);
          case 'log2': return log(p).map((v) => v / Math.LN2);
          case 'sin': return sincos(p, false)[0];
          case 'cos': return sincos(p, false)[1];
          case 'tan': { const [s, c] = sincos(p, false); return div(s, c); }
          case 'sec': return div(one(), sincos(p, false)[1]);
          case 'csc': return div(one(), sincos(p, false)[0]);
          case 'cot': { const [s, c] = sincos(p, false); return div(c, s); }
          case 'sinh': return sincos(p, true)[0];
          case 'cosh': return sincos(p, true)[1];
          case 'tanh': { const [s, c] = sincos(p, true); return div(s, c); }
          case 'sqrt': return powConst(p, 0.5);
          case 'cbrt': {
            if (p[0] === 0) throw new TaylorError('the cube root is not analytic at 0');
            if (p[0] > 0) return powConst(p, 1 / 3);
            return powConst(p.map((v) => -v), 1 / 3).map((v) => -v);   // cbrt(−u) = −cbrt(u)
          }
          case 'atan': return integrateChain(p, div(one(), addJ(one(), sq(p))), Math.atan(p[0]));
          case 'asin': case 'acos': {
            if (!(Math.abs(p[0]) < 1)) throw new TaylorError(`${e.fn} is not analytic at ±1`);
            const r = integrateChain(p, powConst(addJ(one(), sq(p), -1), -0.5), Math.asin(p[0]));
            return e.fn === 'asin' ? r : r.map((v, k) => (k === 0 ? Math.acos(p[0]) : -v));
          }
          case 'asinh': return integrateChain(p, powConst(addJ(one(), sq(p)), -0.5), Math.asinh(p[0]));
          case 'acosh': {
            if (!(p[0] > 1)) throw new TaylorError('arcosh is not analytic at 1 (and not real below it)');
            return integrateChain(p, powConst(addJ(sq(p), one(), -1), -0.5), Math.acosh(p[0]));
          }
          case 'atanh': {
            if (!(Math.abs(p[0]) < 1)) throw new TaylorError('artanh has poles at ±1');
            return integrateChain(p, div(one(), addJ(one(), sq(p), -1)), Math.atanh(p[0]));
          }
          case 'erf': return integrateChain(p, exp(sq(p).map((v) => -v)).map((v) => (v * 2) / Math.sqrt(Math.PI)), erfAt(p[0]));
          case 'abs': {
            if (p[0] === 0) throw new TaylorError('|x| has a corner at 0 — no Taylor series there');
            return p[0] > 0 ? p : p.map((v) => -v);
          }
          default: throw new TaylorError(`${e.fn} has no Taylor series here`);
        }
      }
      default: throw new TaylorError('only a scalar expression has a Taylor series');
    }
  };
  const out = Array.from(go(node));
  if (!out.every(Number.isFinite)) throw new TaylorError('the series overflowed (the function is too steep at the centre)');
  return out;
}

// erf at a single point — the same series / continued fraction as the core's table
export function erfAt(x: number): number {
  const ax = Math.abs(x);
  if (ax < 2.5) {
    let sum = x, term = x;
    for (let k = 1; k < 200; k++) { term *= -x * x / k; const t = term / (2 * k + 1); sum += t; if (Math.abs(t) < 1e-17 * Math.abs(sum)) break; }
    return (2 / Math.sqrt(Math.PI)) * sum;
  }
  let f = ax, C = ax, D = 0;
  for (let k = 1; k < 300; k++) {
    const an = k / 2;
    D = ax + an * D; D = D === 0 ? 1e-300 : 1 / D;
    C = ax + an / C; if (C === 0) C = 1e-300;
    const delta = C * D; f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return Math.sign(x) * (1 - Math.exp(-ax * ax) / (f * Math.sqrt(Math.PI)));
}

/**
 * The Taylor polynomial Σ c_k (x − a)^k with the first `order` terms in full and
 * term `order + 1` weighted by `w` ∈ [0, 1] (so a new term can grow in smoothly).
 * Horner's rule.
 */
export function taylorEval(c: ArrayLike<number>, a: number, x: number, order: number, w = 0): number {
  const top = Math.min(order + (w > 0 ? 1 : 0), c.length - 1);
  const h = x - a;
  let s = 0;
  for (let k = top; k >= 0; k--) s = s * h + (k === order + 1 ? w * c[k] : c[k]);
  return s;
}

/**
 * Cauchy–Hadamard estimate of the radius of convergence, 1/limsup |c_k|^{1/k},
 * from the later coefficients (numerical, rough). Returns Infinity when the
 * series terminates, or when the estimate keeps growing with k (the mark of an
 * entire function such as eˣ or sin x, where |c_k|^{−1/k} ~ k/e).
 */
export function radiusEstimate(c: ArrayLike<number>): number {
  const est = (k0: number, k1: number) => {
    let best = 0;
    for (let k = Math.max(2, k0); k < k1; k++) { const m = Math.abs(c[k]); if (m > 1e-300) best = Math.max(best, Math.pow(m, 1 / k)); }
    return best > 0 ? 1 / best : Infinity;
  };
  const n = c.length, mid = Math.floor(n / 2), q = Math.floor((3 * n) / 4);
  const early = est(mid, q), late = est(q, n);
  if (!Number.isFinite(late)) return Infinity;
  if (late > 1.2 * early) return Infinity;
  return late;
}

// ── surface curvature from the first and second fundamental forms ────────
export interface Curvature {
  K: number; H: number; k1: number; k2: number;
  n: V3;
  E: number; F: number; G: number; L: number; M: number; N: number;
  /** principal directions as unit 3-vectors (null at an umbilic, where every direction is principal) */
  d1: V3 | null; d2: V3 | null;
}

/**
 * Gauss and mean curvature of a parametric surface at a point from its exact
 * partial derivatives r_u, r_v, r_uu, r_uv, r_vv. Sign convention: n = r_u × r_v / |r_u × r_v|,
 * principal curvatures are the eigenvalues of the shape operator I⁻¹ II, k1 ≥ k2.
 */
export function surfaceCurvature(ru: V3, rv: V3, ruu: V3, ruv: V3, rvv: V3): Curvature {
  const nr = cross3(ru, rv), nl = norm3(nr);
  const n: V3 = nl > 0 ? scale3(nr, 1 / nl) : [NaN, NaN, NaN];
  const E = dot3(ru, ru), F = dot3(ru, rv), G = dot3(rv, rv);
  const L = dot3(ruu, n), M = dot3(ruv, n), N = dot3(rvv, n);
  const W = E * G - F * F;
  const K = (L * N - M * M) / W;
  const H = (E * N - 2 * F * M + G * L) / (2 * W);
  const disc = Math.max(0, H * H - K), s = Math.sqrt(disc);
  const k1 = H + s, k2 = H - s;
  // shape operator S = I⁻¹ II in the (u, v) basis
  const S11 = (G * L - F * M) / W, S12 = (G * M - F * N) / W, S21 = (E * M - F * L) / W, S22 = (E * N - F * M) / W;
  let d1: V3 | null = null, d2: V3 | null = null;
  const scale = Math.max(Math.abs(k1), Math.abs(k2), 1e-12);
  if (s > 1e-7 * scale && Number.isFinite(s)) {
    const dir = (k: number): V3 => {
      const r1: [number, number] = [S12, k - S11], r2: [number, number] = [k - S22, S21];
      const w = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
      return unit3(add3(scale3(ru, w[0]), scale3(rv, w[1])));
    };
    d1 = dir(k1); d2 = dir(k2);
  }
  return { K, H, k1, k2, n, E, F, G, L, M, N, d1, d2 };
}

/** Normal curvature II(w, w)/I(w, w) in the tangent direction w = du r_u + dv r_v (Euler's theorem in action). */
export function normalCurvature(c: Curvature, du: number, dv: number): number {
  return (c.L * du * du + 2 * c.M * du * dv + c.N * dv * dv) / (c.E * du * du + 2 * c.F * du * dv + c.G * dv * dv);
}

/** Components (du, dv) of a tangent vector t in the basis r_u, r_v (least squares via the metric). */
export function tangentToParams(ru: V3, rv: V3, t: V3): [number, number] {
  const E = dot3(ru, ru), F = dot3(ru, rv), G = dot3(rv, rv), W = E * G - F * F;
  const p = dot3(ru, t), q = dot3(rv, t);
  return [(G * p - F * q) / W, (E * q - F * p) / W];
}

/** Classify a surface point by its curvatures. */
export function pointType(c: Curvature, tol = 1e-9): string {
  const sc = Math.max(1, Math.abs(c.k1), Math.abs(c.k2));
  if (Math.abs(c.k1) < tol * sc && Math.abs(c.k2) < tol * sc) return 'planar';
  if (Math.abs(c.k1 - c.k2) < 1e-7 * sc) return 'umbilic';
  if (c.K > tol * sc * sc) return 'elliptic';
  if (c.K < -tol * sc * sc) return 'hyperbolic';
  return 'parabolic';
}

// ── a rover on a surface ─────────────────────────────────────────────────
export interface RoverSurface {
  /** a point of the surface from its parameters */
  r(u: number, v: number): V3;
  /** the unit normal at (u, v) */
  normal(u: number, v: number): V3;
  /** the parameters of the surface point nearest (or below) a point near the surface */
  project(p: V3): [number, number];
}
export interface RoverState { u: number; v: number; p: V3; heading: V3 }

/**
 * Drive the rover forward by arc length ds along its heading. "Driving straight"
 * keeps the heading tangent by projecting it onto each new tangent plane (the
 * discrete form of parallel transport along the path), so the track is a
 * geodesic to first order in the step; substeps keep it accurate.
 */
export function roverStep(S: RoverSurface, st: RoverState, ds: number, substeps = 4): RoverState {
  let { u, v, p, heading } = st;
  const h = ds / substeps;
  for (let i = 0; i < substeps; i++) {
    // midpoint step: half step, re-tangent the heading, full step from the start with the mid heading
    const [um, vm] = S.project(add3(p, scale3(heading, h / 2)));
    const nm = S.normal(um, vm);
    const hm = unit3(sub3(heading, scale3(nm, dot3(heading, nm))));
    [u, v] = S.project(add3(p, scale3(hm, h)));
    p = S.r(u, v);
    const n = S.normal(u, v);
    const t = unit3(sub3(hm, scale3(n, dot3(hm, n))));
    if (Number.isFinite(t[0]) && norm3(t) > 0.5) heading = t;
  }
  return { u, v, p, heading };
}

/** Rotate a tangent vector about the unit normal by angle θ (steering). */
export function turn(heading: V3, n: V3, theta: number): V3 {
  const nh = cross3(n, heading);
  return unit3(add3(scale3(heading, Math.cos(theta)), scale3(nh, Math.sin(theta))));
}

// ── a vibrating membrane: the damped 2D wave equation ────────────────────
// u_tt + γ u_t = c² (u_xx + u_yy) on a square of side L with n × n nodes,
// leapfrog in time (second order), five-point Laplacian (second order).
// Stable when the Courant number C = cΔt/h ≤ 1/√2; the membrane always steps
// at C = 0.5 and takes as many substeps as a frame needs.

export type Boundary = 'fixed' | 'free' | 'absorbing';

export class Membrane {
  readonly n: number; readonly L: number; readonly h: number;
  u: Float64Array; prev: Float64Array; private next: Float64Array;
  private damp: Float64Array;           // profile (0..1) of the sponge layer's extra damping (absorbing edges)
  c = 1; gamma = 0; t = 0;
  boundary: Boundary = 'fixed';
  static readonly COURANT = 0.5;

  constructor(n: number, L: number) {
    this.n = n; this.L = L; this.h = L / (n - 1);
    this.u = new Float64Array(n * n); this.prev = new Float64Array(n * n); this.next = new Float64Array(n * n);
    this.damp = new Float64Array(n * n);
    this.setBoundary('fixed');
  }

  /** the largest stable time step for this grid and wave speed (2D CFL) */
  static maxStableDt(c: number, h: number) { return h / (c * Math.SQRT2); }
  /** the time step actually used */
  dt() { return (Membrane.COURANT * this.h) / this.c; }

  setBoundary(b: Boundary) {
    this.boundary = b;
    const n = this.n, w = Math.max(4, Math.round(n * 0.12));
    this.damp.fill(0);
    if (b === 'absorbing') {
      // a smooth damping ramp in a band at the edges (a sponge layer): absorbs most of an outgoing wave
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const d = Math.min(i, j, n - 1 - i, n - 1 - j);
        if (d < w) { const s = 1 - d / w; this.damp[j * n + i] = s * s; }
      }
    }
    if (b === 'fixed') this.clampEdges();
  }

  clear() { this.u.fill(0); this.prev.fill(0); this.t = 0; }

  private clampEdges() {
    const n = this.n;
    for (let k = 0; k < n; k++) {
      for (const A of [this.u, this.prev]) { A[k] = 0; A[(n - 1) * n + k] = 0; A[k * n] = 0; A[k * n + n - 1] = 0; }
    }
  }

  /** node index → coordinate in [−L/2, L/2] */
  coord(i: number) { return -this.L / 2 + i * this.h; }

  /** a Gaussian pluck of height amp and width sigma at (x, y), released from rest */
  poke(x: number, y: number, amp: number, sigma: number) {
    const n = this.n, h = this.h, r = Math.ceil((3 * sigma) / h);
    const ci = Math.round((x + this.L / 2) / h), cj = Math.round((y + this.L / 2) / h);
    for (let j = Math.max(0, cj - r); j <= Math.min(n - 1, cj + r); j++) for (let i = Math.max(0, ci - r); i <= Math.min(n - 1, ci + r); i++) {
      const dx = this.coord(i) - x, dy = this.coord(j) - y;
      const g = amp * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      this.u[j * n + i] += g; this.prev[j * n + i] += g;
    }
    if (this.boundary === 'fixed') this.clampEdges();
  }

  /** the exact standing wave sin(mπξ) sin(kπη) of the fixed square, phased so it starts at rest */
  setMode(m: number, k: number, amp: number) {
    const n = this.n, dt = this.dt();
    const w = this.discreteOmega(m, k);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const s = amp * Math.sin((m * Math.PI * i) / (n - 1)) * Math.sin((k * Math.PI * j) / (n - 1));
      this.u[j * n + i] = s; this.prev[j * n + i] = s * Math.cos(w * dt);
    }
    this.t = 0;
  }

  /** angular frequency of mode (m, k) of the continuous fixed square: cπ√(m² + k²)/L */
  exactOmega(m: number, k: number) { return (this.c * Math.PI * Math.hypot(m, k)) / this.L; }
  /** the same mode's frequency on this grid with leapfrog (what the solver actually does) */
  discreteOmega(m: number, k: number) {
    const h = this.h, dt = this.dt(), n = this.n;
    const lam = (4 / (h * h)) * (Math.sin((m * Math.PI) / (2 * (n - 1))) ** 2 + Math.sin((k * Math.PI) / (2 * (n - 1))) ** 2);
    return (2 / dt) * Math.asin(Math.min(1, (this.c * dt * Math.sqrt(lam)) / 2));
  }

  /** advance by one time step */
  step() {
    const n = this.n, u = this.u, p = this.prev, q = this.next, dt = this.dt();
    const r2 = (this.c * dt / this.h) ** 2;
    const free = this.boundary !== 'fixed';
    const sponge = (40 * this.c) / this.L;     // peak sponge damping rate, scaled to the crossing time
    for (let j = 0; j < n; j++) {
      const jm = j > 0 ? j - 1 : free ? 1 : -1, jp = j < n - 1 ? j + 1 : free ? n - 2 : -1;
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        if (!free && (i === 0 || j === 0 || i === n - 1 || j === n - 1)) { q[k] = 0; continue; }
        const im = i > 0 ? i - 1 : 1, ip = i < n - 1 ? i + 1 : n - 2;   // free edges: mirrored ghost nodes (∂u/∂n = 0)
        const lap = u[j * n + im] + u[j * n + ip] + u[jm * n + i] + u[jp * n + i] - 4 * u[k];
        const g = (this.gamma + sponge * this.damp[k]) * dt / 2;
        q[k] = (2 * u[k] - (1 - g) * p[k] + r2 * lap) / (1 + g);
      }
    }
    this.prev = u; this.u = q; this.next = p;
    this.t += dt;
  }

  /**
   * The discrete energy ½Σ[((uⁿ − uⁿ⁻¹)/Δt)² + c² ∇uⁿ·∇uⁿ⁻¹] h², which leapfrog
   * conserves exactly (up to rounding) on the fixed square without damping.
   */
  energy() {
    const n = this.n, u = this.u, p = this.prev, dt = this.dt(), h = this.h, c2 = this.c * this.c;
    let kin = 0, pot = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = j * n + i, v = (u[k] - p[k]) / dt;
      kin += v * v;
      if (i < n - 1) pot += (u[k + 1] - u[k]) * (p[k + 1] - p[k]);
      if (j < n - 1) pot += (u[k + n] - u[k]) * (p[k + n] - p[k]);
    }
    return 0.5 * (kin * h * h + c2 * pot);
  }

  maxAbs() { let m = 0; for (let k = 0; k < this.u.length; k++) { const a = Math.abs(this.u[k]); if (a > m) m = a; } return m; }

  /** bilinear sample of the displacement at (x, y) */
  sample(x: number, y: number) {
    const n = this.n, fx = (x + this.L / 2) / this.h, fy = (y + this.L / 2) / this.h;
    const i = Math.max(0, Math.min(n - 2, Math.floor(fx))), j = Math.max(0, Math.min(n - 2, Math.floor(fy)));
    const a = Math.min(1, Math.max(0, fx - i)), b = Math.min(1, Math.max(0, fy - j));
    const u = this.u, k = j * n + i;
    return (1 - a) * (1 - b) * u[k] + a * (1 - b) * u[k + 1] + (1 - a) * b * u[k + n] + a * b * u[k + n + 1];
  }
}

// ── planar flows ─────────────────────────────────────────────────────────
export type Field2 = (x: number, y: number, out: Float64Array) => void;

/** One classical RK4 step of dx/dt = F(x) from (x, y); writes the result to out[0], out[1]. No allocation. */
export function rk4Field(F: Field2, x: number, y: number, h: number, out: Float64Array, k: Float64Array) {
  // k holds 8 numbers: k1..k4 (x, y)
  F(x, y, out); k[0] = out[0]; k[1] = out[1];
  F(x + 0.5 * h * k[0], y + 0.5 * h * k[1], out); k[2] = out[0]; k[3] = out[1];
  F(x + 0.5 * h * k[2], y + 0.5 * h * k[3], out); k[4] = out[0]; k[5] = out[1];
  F(x + h * k[4], y + h * k[5], out); k[6] = out[0]; k[7] = out[1];
  out[0] = x + (h / 6) * (k[0] + 2 * k[2] + 2 * k[4] + k[6]);
  out[1] = y + (h / 6) * (k[1] + 2 * k[3] + 2 * k[5] + k[7]);
}

// ── the Surface Sculptor's family ────────────────────────────────────────
export interface Bump { x: number; y: number; h: number; s: number }
export interface Sculpt { a: number; b: number; c: number; d: number; e: number; bumps: Bump[] }

/** z = a·sin(bx)·cos(cy) + d·x² − e·y² + Σ hᵢ exp(−|p − pᵢ|²/(2sᵢ²)) */
export function sculptZ(S: Sculpt, x: number, y: number): number {
  let z = S.a * Math.sin(S.b * x) * Math.cos(S.c * y) + S.d * x * x - S.e * y * y;
  for (const B of S.bumps) { const dx = x - B.x, dy = y - B.y; z += B.h * Math.exp(-(dx * dx + dy * dy) / (2 * B.s * B.s)); }
  return z;
}
/** its exact gradient */
export function sculptGrad(S: Sculpt, x: number, y: number): [number, number] {
  let gx = S.a * S.b * Math.cos(S.b * x) * Math.cos(S.c * y) + 2 * S.d * x;
  let gy = -S.a * S.c * Math.sin(S.b * x) * Math.sin(S.c * y) - 2 * S.e * y;
  for (const B of S.bumps) {
    const dx = x - B.x, dy = y - B.y, g = B.h * Math.exp(-(dx * dx + dy * dy) / (2 * B.s * B.s)) / (B.s * B.s);
    gx -= g * dx; gy -= g * dy;
  }
  return [gx, gy];
}

/**
 * The exact signed volume ∫∫ z dA over the square [−R, R]²: the trigonometric
 * term is odd in x and integrates to 0; x² and y² give 4R⁴/3; each bump gives
 * h·Iₓ·I_y with I = s√(π/2)[erf((R − x₀)/(s√2)) + erf((R + x₀)/(s√2))].
 */
export function sculptVolume(S: Sculpt, R: number): number {
  let V = ((S.d - S.e) * 4 * R ** 4) / 3;
  const I = (x0: number, s: number) => s * Math.sqrt(Math.PI / 2) * (erfAt((R - x0) / (s * Math.SQRT2)) + erfAt((R + x0) / (s * Math.SQRT2)));
  for (const B of S.bumps) V += B.h * I(B.x, B.s) * I(B.y, B.s);
  return V;
}
