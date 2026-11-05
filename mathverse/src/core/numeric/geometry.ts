// Differential geometry, DOM-free. Parametric surfaces r(u, v) in R³ with exact
// symbolic derivatives (first, second and third), the first and second
// fundamental forms, Gaussian, mean and principal curvatures, Christoffel
// symbols; metrics g_ij(x) in any dimension with Christoffel symbols, the
// Riemann tensor, Ricci and scalar curvature (exact from symbolic second
// derivatives of the metric); geodesics (with chart switching across an atlas),
// parallel transport and holonomy, geodesic boundary-value problems, curvature
// integrals, the Frenet–Serret equations, and the Jacobi (geodesic deviation)
// equation. Everything numerical says so: integrators report their own drift.

import { Node, compile, derivative, NotDifferentiable, Fn } from '../expr';
import { rk4Step, solveAdaptive, Rhs } from './ode';
import { inverse } from './linalg';

export type V3 = [number, number, number];
export type V2 = [number, number];

// ── small vector helpers ────────────────────────────────────────────────────
export const dot3 = (a: ArrayLike<number>, b: ArrayLike<number>) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: ArrayLike<number>, b: ArrayLike<number>): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm3 = (a: ArrayLike<number>) => Math.hypot(a[0], a[1], a[2]);
export const add3 = (a: ArrayLike<number>, b: ArrayLike<number>): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: ArrayLike<number>, b: ArrayLike<number>): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale3 = (a: ArrayLike<number>, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const unit3 = (a: ArrayLike<number>): V3 => { const l = norm3(a); return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0]; };
/** a·A + b·B */
export const comb3 = (a: number, A: ArrayLike<number>, b: number, B: ArrayLike<number>): V3 => [a * A[0] + b * B[0], a * A[1] + b * B[1], a * A[2] + b * B[2]];

/**
 * solveAdaptive, tolerating its one false alarm: when the last step is
 * truncated to a round-off-sized remainder of the interval, its step-size
 * check reports a collapse although the solution reached t1. That case is
 * accepted here; every genuine failure is passed on unchanged.
 */
export function odeSolve(f: Rhs, y0: number[], t0: number, t1: number, opts: Parameters<typeof solveAdaptive>[4] = {}) {
  const tr = solveAdaptive(f, y0, t0, t1, opts);
  if (!tr.ok && tr.warning?.startsWith('The step size collapsed') && Math.abs(tr.t[tr.t.length - 1] - t1) <= 1e-9 * Math.max(1, Math.abs(t1 - t0))) return { ...tr, ok: true, warning: undefined };
  return tr;
}

// ── Gauss–Legendre nodes (for smooth integrands over discs and rectangles) ──
const glCache = new Map<number, { x: number[]; w: number[] }>();
/** Gauss–Legendre nodes and weights on [−1, 1] (Newton on P_n; exact for polynomials of degree ≤ 2n − 1). */
export function gaussLegendre(n: number): { x: number[]; w: number[] } {
  const hit = glCache.get(n);
  if (hit) return hit;
  const x: number[] = [], w: number[] = [];
  for (let i = 0; i < n; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5)), dp = 1;
    for (let it = 0; it < 100; it++) {
      let p0 = 1, p1 = z;
      for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * z * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      dp = (n * (z * p1 - p0)) / (z * z - 1);
      const dz = p1 / dp;
      z -= dz;
      if (Math.abs(dz) < 1e-15) break;
    }
    x.push(z); w.push(2 / ((1 - z * z) * dp * dp));
  }
  const r = { x, w };
  glCache.set(n, r);
  return r;
}

// ══ Parametric surfaces ═══════════════════════════════════════════════════════

/** The symbolic derivatives of r(u, v), computed once per formula. */
export interface SymbolicSurface {
  vars: [string, string];
  r: Node[];
  /** r_u, r_v */
  d1: Node[][] | null;
  /** r_uu, r_uv, r_vv */
  d2: Node[][] | null;
  /** r_uuu, r_uuv, r_uvv, r_vvv */
  d3: Node[][] | null;
}

function tryD(ns: Node[], x: string): Node[] | null {
  try { return ns.map((n) => derivative(n, x)); } catch (e) { if (e instanceof NotDifferentiable) return null; throw e; }
}

/** Differentiate r(u, v) symbolically up to third order (null where a function has no derivative formula). */
export function symbolicSurface(components: Node[], vars: [string, string] = ['u', 'v']): SymbolicSurface {
  if (components.length !== 3) throw new Error('A surface needs three components (x, y, z)');
  const [u, v] = vars;
  const ru = tryD(components, u), rv = tryD(components, v);
  const d1 = ru && rv ? [ru, rv] : null;
  let d2: Node[][] | null = null, d3: Node[][] | null = null;
  if (d1) {
    const ruu = tryD(ru!, u), ruv = tryD(ru!, v), rvv = tryD(rv!, v);
    if (ruu && ruv && rvv) {
      d2 = [ruu, ruv, rvv];
      const a = tryD(ruu, u), b = tryD(ruu, v), c = tryD(rvv, u), d = tryD(rvv, v);
      if (a && b && c && d) d3 = [a, b, c, d];
    }
  }
  return { vars, r: components, d1, d2, d3 };
}

/**
 * A compiled surface. `jet` fills 18 numbers: r, r_u, r_v, r_uu, r_uv, r_vv
 * (3 each, in that order); `jet3` fills 12: r_uuu, r_uuv, r_uvv, r_vvv.
 */
export interface Surface {
  /** first and second derivatives are exact (symbolic) */
  exact: boolean;
  /** third derivatives are exact (symbolic) */
  exact3: boolean;
  r(u: number, v: number): V3;
  jet(u: number, v: number, out: Float64Array): void;
  jet3(u: number, v: number, out: Float64Array): void;
}

/** Compile a symbolic surface with parameter values. */
export function compileSurface(sym: SymbolicSurface, params: Record<string, number> = {}): Surface {
  const vars = sym.vars as string[];
  const c = (ns: Node[]) => ns.map((n) => compile(n, vars, params));
  const R = c(sym.r);
  const D1 = sym.d1 ? sym.d1.map(c) : null, D2 = sym.d2 ? sym.d2.map(c) : null, D3 = sym.d3 ? sym.d3.map(c) : null;
  const arg = new Float64Array(2);
  const ev = (fs: Fn[], u: number, v: number, out: Float64Array, off: number) => { arg[0] = u; arg[1] = v; out[off] = fs[0](arg); out[off + 1] = fs[1](arg); out[off + 2] = fs[2](arg); };
  const r = (u: number, v: number): V3 => { arg[0] = u; arg[1] = v; return [R[0](arg), R[1](arg), R[2](arg)]; };
  const numeric = numericJets(r);
  return {
    exact: !!(D1 && D2), exact3: !!(D1 && D2 && D3), r,
    jet(u, v, out) {
      if (!D1 || !D2) { numeric.jet(u, v, out); return; }
      ev(R, u, v, out, 0); ev(D1[0], u, v, out, 3); ev(D1[1], u, v, out, 6);
      ev(D2[0], u, v, out, 9); ev(D2[1], u, v, out, 12); ev(D2[2], u, v, out, 15);
    },
    jet3(u, v, out) {
      if (!D3) { numeric.jet3(u, v, out); return; }
      for (let k = 0; k < 4; k++) ev(D3[k], u, v, out, 3 * k);
    },
  };
}

/** A surface from a plain function, differentiated numerically (central differences; not exact). */
export function surfaceFromFunction(r: (u: number, v: number) => V3): Surface {
  const n = numericJets(r);
  return { exact: false, exact3: false, r, jet: n.jet, jet3: n.jet3 };
}

function numericJets(r: (u: number, v: number) => V3) {
  const jet = (u: number, v: number, out: Float64Array) => {
    const h = 1e-4 * Math.max(1, Math.abs(u), Math.abs(v)), k = 2e-3 * Math.max(1, Math.abs(u), Math.abs(v));
    const p = r(u, v), pu = r(u + h, v), mu = r(u - h, v), pv = r(u, v + h), mv = r(u, v - h);
    const Pu = r(u + k, v), Mu = r(u - k, v), Pv = r(u, v + k), Mv = r(u, v - k);
    const pp = r(u + k, v + k), pm = r(u + k, v - k), mp = r(u - k, v + k), mm = r(u - k, v - k);
    for (let i = 0; i < 3; i++) {
      out[i] = p[i];
      out[3 + i] = (pu[i] - mu[i]) / (2 * h); out[6 + i] = (pv[i] - mv[i]) / (2 * h);
      out[9 + i] = (Pu[i] - 2 * p[i] + Mu[i]) / (k * k);
      out[12 + i] = (pp[i] - pm[i] - mp[i] + mm[i]) / (4 * k * k);
      out[15 + i] = (Pv[i] - 2 * p[i] + Mv[i]) / (k * k);
    }
  };
  const jet3 = (u: number, v: number, out: Float64Array) => {
    // differentiate the second derivatives numerically
    const h = 2e-3 * Math.max(1, Math.abs(u), Math.abs(v));
    const a = new Float64Array(18), b = new Float64Array(18);
    jet(u + h, v, a); jet(u - h, v, b);
    for (let i = 0; i < 3; i++) { out[i] = (a[9 + i] - b[9 + i]) / (2 * h); out[3 + i] = (a[12 + i] - b[12 + i]) / (2 * h); }
    jet(u, v + h, a); jet(u, v - h, b);
    for (let i = 0; i < 3; i++) { out[6 + i] = (a[12 + i] - b[12 + i]) / (2 * h); out[9 + i] = (a[15 + i] - b[15 + i]) / (2 * h); }
  };
  return { jet, jet3 };
}

/** Everything about a surface at one point. */
export interface LocalGeometry {
  u: number; v: number;
  r: V3; ru: V3; rv: V3; ruu: V3; ruv: V3; rvv: V3;
  /** unit normal n = r_u × r_v / |r_u × r_v| (this orientation fixes the signs of II and H) */
  n: V3;
  /** first fundamental form (the metric) and its determinant */
  E: number; F: number; G: number; detg: number;
  /** second fundamental form */
  L: number; M: number; N: number;
  /** Gaussian (intrinsic) and mean (extrinsic) curvature, principal curvatures k1 ≥ k2 */
  K: number; H: number; k1: number; k2: number;
  /** principal directions: in coordinates (du, dv), unit in the metric, and in space */
  dir1: V2; dir2: V2; e1: V3; e2: V3;
  /** Γ^u_uu, Γ^u_uv, Γ^u_vv, Γ^v_uu, Γ^v_uv, Γ^v_vv */
  gamma: number[];
  /** false at a singular point of the parametrization (r_u × r_v = 0) */
  regular: boolean;
}

const jetBuf = new Float64Array(18);
const v3 = (b: Float64Array, o: number): V3 => [b[o], b[o + 1], b[o + 2]];

export function localGeometry(S: Surface, u: number, v: number): LocalGeometry {
  S.jet(u, v, jetBuf);
  const r = v3(jetBuf, 0), ru = v3(jetBuf, 3), rv = v3(jetBuf, 6), ruu = v3(jetBuf, 9), ruv = v3(jetBuf, 12), rvv = v3(jetBuf, 15);
  const E = dot3(ru, ru), F = dot3(ru, rv), G = dot3(rv, rv), D = E * G - F * F;
  const nx = cross3(ru, rv), nl = norm3(nx);
  const regular = Number.isFinite(D) && nl > 1e-12 * Math.max(1e-300, E + G) && D > 0;
  const n: V3 = nl > 0 ? [nx[0] / nl, nx[1] / nl, nx[2] / nl] : [0, 0, 0];
  const L = dot3(ruu, n), M = dot3(ruv, n), N = dot3(rvv, n);
  const K = (L * N - M * M) / D;
  const H = (E * N - 2 * F * M + G * L) / (2 * D);
  const disc = Math.sqrt(Math.max(0, H * H - K));
  const k1 = H + disc, k2 = H - disc;
  // shape operator S = I⁻¹ II; eigenvectors give principal directions
  const s11 = (G * L - F * M) / D, s12 = (G * M - F * N) / D, s21 = (E * M - F * L) / D, s22 = (E * N - F * M) / D;
  const eigvec = (k: number): V2 => {
    // (S − kI) d = 0 — pick the better-conditioned row
    const a: V2 = [s12, k - s11], b: V2 = [k - s22, s21];
    const d = Math.hypot(a[0], a[1]) >= Math.hypot(b[0], b[1]) ? a : b;
    if (Math.hypot(d[0], d[1]) < 1e-12 * (Math.abs(k) + 1)) return [1 / Math.sqrt(E), 0];   // umbilic: any direction
    const len = Math.sqrt(E * d[0] * d[0] + 2 * F * d[0] * d[1] + G * d[1] * d[1]);
    return [d[0] / len, d[1] / len];
  };
  const dir1 = eigvec(k1);
  // the second direction is metric-orthogonal to the first
  let dir2: V2 = [-(F * dir1[0] + G * dir1[1]), E * dir1[0] + F * dir1[1]];
  const l2 = Math.sqrt(E * dir2[0] ** 2 + 2 * F * dir2[0] * dir2[1] + G * dir2[1] ** 2);
  dir2 = l2 > 0 ? [dir2[0] / l2, dir2[1] / l2] : [0, 1 / Math.sqrt(G)];
  const e1 = comb3(dir1[0], ru, dir1[1], rv), e2 = comb3(dir2[0], ru, dir2[1], rv);
  const gamma = new Array<number>(6);
  christoffelFromJet(jetBuf, gamma);
  return { u, v, r, ru, rv, ruu, ruv, rvv, n, E, F, G, detg: D, L, M, N, K, H, k1, k2, dir1, dir2, e1, e2, gamma, regular };
}

/** Γ^k_ij = g^{kl} ⟨r_ij, r_l⟩ from a jet. Returns det g. */
function christoffelFromJet(j: ArrayLike<number>, out: number[] | Float64Array): number {
  const E = j[3] * j[3] + j[4] * j[4] + j[5] * j[5];
  const F = j[3] * j[6] + j[4] * j[7] + j[5] * j[8];
  const G = j[6] * j[6] + j[7] * j[7] + j[8] * j[8];
  const D = E * G - F * F;
  for (let k = 0; k < 3; k++) {
    const o = 9 + 3 * k;
    const a = j[o] * j[3] + j[o + 1] * j[4] + j[o + 2] * j[5];    // ⟨r_ij, r_u⟩
    const b = j[o] * j[6] + j[o + 1] * j[7] + j[o + 2] * j[8];    // ⟨r_ij, r_v⟩
    out[k] = (G * a - F * b) / D;
    out[3 + k] = (E * b - F * a) / D;
  }
  return D;
}

/** Christoffel symbols at (u, v) into `out` (6 numbers, order of LocalGeometry.gamma). Returns det g. */
export function surfaceChristoffel(S: Surface, u: number, v: number, out: number[] | Float64Array, jet = new Float64Array(18)): number {
  S.jet(u, v, jet);
  return christoffelFromJet(jet, out);
}

/** g(A, B) at (u, v) for coordinate vectors A, B. */
export function metricDot(lg: { E: number; F: number; G: number }, A: ArrayLike<number>, B: ArrayLike<number>): number {
  return lg.E * A[0] * B[0] + lg.F * (A[0] * B[1] + A[1] * B[0]) + lg.G * A[1] * B[1];
}

/** The signed angle from A to B in the tangent plane (orientation of the chart): atan2(√det g · (A × B), g(A, B)). */
export function signedAngle(lg: { E: number; F: number; G: number }, A: ArrayLike<number>, B: ArrayLike<number>): number {
  const D = lg.E * lg.G - lg.F * lg.F;
  return Math.atan2(Math.sqrt(Math.max(0, D)) * (A[0] * B[1] - A[1] * B[0]), metricDot(lg, A, B));
}

/** An orthonormal frame (in coordinates) at a point: e1 ∥ ∂_u, e2 = the metric-orthogonal unit vector (positively oriented). */
export function orthonormalFrame(lg: { E: number; F: number; G: number }): [V2, V2] {
  const D = lg.E * lg.G - lg.F * lg.F;
  const e1: V2 = [1 / Math.sqrt(lg.E), 0];
  const e2: V2 = [-lg.F / Math.sqrt(lg.E * D), Math.sqrt(lg.E / D)];
  return [e1, e2];
}

// ══ Metrics in any dimension ═════════════════════════════════════════════════

export interface Metric {
  dim: number;
  coords: string[];
  g(x: ArrayLike<number>): number[][];
  /** dg[k][i][j] = ∂_k g_ij */
  dg(x: ArrayLike<number>): number[][][];
  /** d2g[k][l][i][j] = ∂_k ∂_l g_ij, when available exactly */
  d2g: ((x: ArrayLike<number>) => number[][][][]) | null;
  /** dg is exact (symbolic) */
  exact: boolean;
}

/** A metric from a matrix of expressions g_ij(x), differentiated symbolically (twice). */
export function metricFromExprs(G: Node[][], coords: string[], params: Record<string, number> = {}): Metric {
  const n = coords.length;
  if (G.length !== n || G.some((r) => r.length !== n)) throw new Error(`The metric must be ${n}×${n}`);
  const cg = G.map((r) => r.map((e) => compile(e, coords, params)));
  let exact = true, exact2 = true;
  const d1: Node[][][] = [], d2: Node[][][][] = [];
  try {
    for (let k = 0; k < n; k++) d1.push(G.map((r) => r.map((e) => derivative(e, coords[k]))));
  } catch (e) { if (!(e instanceof NotDifferentiable)) throw e; exact = false; exact2 = false; }
  if (exact) {
    try {
      for (let k = 0; k < n; k++) { d2.push([]); for (let l = 0; l < n; l++) d2[k].push(d1[k].map((r) => r.map((e) => derivative(e, coords[l])))); }
    } catch (e) { if (!(e instanceof NotDifferentiable)) throw e; exact2 = false; }
  }
  const cd1 = exact ? d1.map((m) => m.map((r) => r.map((e) => compile(e, coords, params)))) : null;
  const cd2 = exact2 ? d2.map((a) => a.map((m) => m.map((r) => r.map((e) => compile(e, coords, params))))) : null;
  const g = (x: ArrayLike<number>) => cg.map((r) => r.map((f) => f(x)));
  const dg = cd1 ? (x: ArrayLike<number>) => cd1.map((m) => m.map((r) => r.map((f) => f(x)))) : (x: ArrayLike<number>) => numericDg(g, x, n);
  const d2g = cd2 ? (x: ArrayLike<number>) => cd2.map((a) => a.map((m) => m.map((r) => r.map((f) => f(x))))) : null;
  return { dim: n, coords, g, dg, d2g, exact };
}

function numericDg(g: (x: ArrayLike<number>) => number[][], x: ArrayLike<number>, n: number): number[][][] {
  const out: number[][][] = [];
  for (let k = 0; k < n; k++) {
    const h = 1e-5 * Math.max(1, Math.abs(x[k]));
    const xp = Array.from(x), xm = Array.from(x);
    xp[k] += h; xm[k] -= h;
    const a = g(xp), b = g(xm);
    out.push(a.map((r, i) => r.map((v, j) => (v - b[i][j]) / (2 * h))));
  }
  return out;
}

/** The induced metric of a surface: g = [[E, F], [F, G]], with derivatives from the jets (third derivatives for d2g). */
export function metricOfSurface(S: Surface, coords: [string, string] = ['u', 'v']): Metric {
  const j = new Float64Array(18), j3 = new Float64Array(12);
  const vec = (b: Float64Array, o: number) => [b[o], b[o + 1], b[o + 2]];
  const d = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const parts = (x: ArrayLike<number>) => {
    S.jet(x[0], x[1], j);
    const r1 = [vec(j, 3), vec(j, 6)];
    const r2 = [[vec(j, 9), vec(j, 12)], [vec(j, 12), vec(j, 15)]];      // r2[a][b] = r_ab
    return { r1, r2 };
  };
  return {
    dim: 2, coords, exact: S.exact,
    g: (x) => { const { r1 } = parts(x); return [[d(r1[0], r1[0]), d(r1[0], r1[1])], [d(r1[1], r1[0]), d(r1[1], r1[1])]]; },
    dg: (x) => {
      const { r1, r2 } = parts(x);
      return [0, 1].map((k) => [0, 1].map((a) => [0, 1].map((b) => d(r2[a][k], r1[b]) + d(r1[a], r2[b][k]))));
    },
    d2g: S.exact3 ? (x) => {
      const { r1, r2 } = parts(x);
      S.jet3(x[0], x[1], j3);
      const t = [vec(j3, 0), vec(j3, 3), vec(j3, 6), vec(j3, 9)];   // uuu, uuv, uvv, vvv
      const r3 = (a: number, b: number, c: number) => t[a + b + c];   // symmetric: index by the number of v's
      return [0, 1].map((k) => [0, 1].map((l) => [0, 1].map((a) => [0, 1].map((b) =>
        d(r3(a, k, l), r1[b]) + d(r2[a][k], r2[b][l]) + d(r2[a][l], r2[b][k]) + d(r1[a], r3(b, k, l))))));
    } : null,
  };
}

/** Γ[k][i][j] = ½ g^{kl} (∂_i g_lj + ∂_j g_li − ∂_l g_ij). */
export function christoffel(M: Metric, x: ArrayLike<number>): number[][][] {
  const n = M.dim, gi = inverse(M.g(x)), dg = M.dg(x);
  if (!gi) return fill3(n, NaN);
  return christoffelFrom(gi, dg, n);
}

function christoffelFrom(gi: number[][], dg: number[][][], n: number): number[][][] {
  const out = fill3(n, 0);
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
    let s = 0;
    for (let l = 0; l < n; l++) s += gi[k][l] * (dg[i][l][j] + dg[j][l][i] - dg[l][i][j]);
    out[k][i][j] = out[k][j][i] = s / 2;
  }
  return out;
}

const fill3 = (n: number, v: number) => Array.from({ length: n }, () => Array.from({ length: n }, () => new Array(n).fill(v)));

/** ∂_m Γ^k_ij as dG[m][k][i][j]: exact from d2g when available, else central differences of Γ. */
export function christoffelDerivatives(M: Metric, x: ArrayLike<number>): { dG: number[][][][]; exact: boolean } {
  const n = M.dim;
  if (M.d2g) {
    const g = M.g(x), gi = inverse(g), dg = M.dg(x), d2 = M.d2g(x);
    if (!gi) return { dG: Array.from({ length: n }, () => fill3(n, NaN)), exact: true };
    const dG: number[][][][] = [];
    for (let m = 0; m < n; m++) {
      // ∂_m g^{kl} = −g^{ka} ∂_m g_ab g^{bl}
      const dgi = gi.map((_, k) => gi.map((_, l) => { let s = 0; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) s -= gi[k][a] * dg[m][a][b] * gi[b][l]; return s; }));
      const t = fill3(n, 0);
      for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
        let s = 0;
        for (let l = 0; l < n; l++) {
          const S = dg[i][l][j] + dg[j][l][i] - dg[l][i][j];
          const dS = d2[m][i][l][j] + d2[m][j][l][i] - d2[m][l][i][j];
          s += dgi[k][l] * S + gi[k][l] * dS;
        }
        t[k][i][j] = t[k][j][i] = s / 2;
      }
      dG.push(t);
    }
    return { dG, exact: M.exact };
  }
  const dG: number[][][][] = [];
  for (let m = 0; m < n; m++) {
    const h = 1e-4 * Math.max(1, Math.abs(x[m]));
    const xp = Array.from(x), xm = Array.from(x);
    xp[m] += h; xm[m] -= h;
    const a = christoffel(M, xp), b = christoffel(M, xm);
    dG.push(a.map((A, k) => A.map((row, i) => row.map((v, j) => (v - b[k][i][j]) / (2 * h)))));
  }
  return { dG, exact: false };
}

export interface CurvatureTensors {
  g: number[][]; ginv: number[][];
  gamma: number[][][];
  /** R^a_{bcd} as Rup[a][b][c][d] = ∂_c Γ^a_{db} − ∂_d Γ^a_{cb} + Γ^a_{ce} Γ^e_{db} − Γ^a_{de} Γ^e_{cb} */
  Rup: number[][][][];
  /** R_{abcd} = g_{ae} R^e_{bcd} */
  Rdown: number[][][][];
  /** R_{bd} = R^a_{bad} */
  ricci: number[][];
  /** R = g^{bd} R_{bd} */
  scalar: number;
  /** R_{abcd} R^{abcd} */
  kretschmann: number;
  /** derivatives of Γ were exact (symbolic) */
  exact: boolean;
}

/** Riemann, Ricci, scalar and Kretschmann curvature of a metric at x. */
export function curvatureTensors(M: Metric, x: ArrayLike<number>): CurvatureTensors {
  const n = M.dim, g = M.g(x), gi = inverse(g) ?? g.map((r) => r.map(() => NaN));
  const gamma = christoffelFrom(gi, M.dg(x), n);
  const { dG, exact } = christoffelDerivatives(M, x);
  const Rup = Array.from({ length: n }, () => fill3(n, 0));
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) for (let d = 0; d < n; d++) {
    if (c === d) continue;
    let s = dG[c][a][d][b] - dG[d][a][c][b];
    for (let e = 0; e < n; e++) s += gamma[a][c][e] * gamma[e][d][b] - gamma[a][d][e] * gamma[e][c][b];
    Rup[a][b][c][d] = s;
  }
  const Rdown = Array.from({ length: n }, () => fill3(n, 0));
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) for (let d = 0; d < n; d++) {
    let s = 0; for (let e = 0; e < n; e++) s += g[a][e] * Rup[e][b][c][d];
    Rdown[a][b][c][d] = s;
  }
  const ricci = Array.from({ length: n }, (_, b) => Array.from({ length: n }, (_, d) => { let s = 0; for (let a = 0; a < n; a++) s += Rup[a][b][a][d]; return s; }));
  let scalar = 0;
  for (let b = 0; b < n; b++) for (let d = 0; d < n; d++) scalar += gi[b][d] * ricci[b][d];
  // R^{abcd}: raise all four indices
  let kretschmann = 0;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) for (let d = 0; d < n; d++) {
    const R = Rdown[a][b][c][d];
    if (R === 0) continue;
    let up = 0;
    for (let p = 0; p < n; p++) for (let q = 0; q < n; q++) for (let r = 0; r < n; r++) for (let s = 0; s < n; s++) {
      const w = gi[a][p] * gi[b][q] * gi[c][r] * gi[d][s];
      if (w !== 0) up += w * Rdown[p][q][r][s];
    }
    kretschmann += R * up;
  }
  return { g, ginv: gi, gamma, Rup, Rdown, ricci, scalar, kretschmann, exact };
}

/** The geodesic equation ẍ^k = −Γ^k_ij ẋ^i ẋ^j for a metric, as a first-order system in (x, ẋ). */
export function geodesicRhs(M: Metric): Rhs {
  const n = M.dim;
  return (_t, y) => {
    const G = christoffel(M, y);
    const out = new Array(2 * n);
    for (let k = 0; k < n; k++) {
      out[k] = y[n + k];
      let s = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += G[k][i][j] * y[n + i] * y[n + j];
      out[n + k] = -s;
    }
    return out;
  };
}

/** g(ẋ, ẋ) — conserved along an affinely parametrized geodesic. */
export function quadForm(g: number[][], a: ArrayLike<number>, b: ArrayLike<number> = a): number {
  let s = 0;
  for (let i = 0; i < g.length; i++) for (let j = 0; j < g.length; j++) s += g[i][j] * a[i] * b[j];
  return s;
}

// ══ Geodesics on surfaces, across an atlas ════════════════════════════════════

/** One chart of an atlas: a parametrization of (part of) a surface. */
export interface Chart {
  surface: Surface;
  u: [number, number]; v: [number, number];
  periodicU?: boolean; periodicV?: boolean;
  /** how good the chart is at (u, v): 1 fine → 0 at a coordinate singularity (e.g. sin θ on a sphere) */
  quality?: (u: number, v: number) => number;
  /** the chart's coordinates of a point on the surface (the transition maps go through this) */
  inverse?: (p: V3) => V2 | null;
}

export interface GeodesicPoint { chart: number; u: number; v: number; p: V3; s: number }
export interface GeodesicResult {
  points: GeodesicPoint[];
  length: number;
  /** why it stopped: reached the length, left the drawn domain, or hit a singularity */
  stop: 'done' | 'edge' | 'singular';
  warning?: string;
  /** max |g(ẋ, ẋ) − 1| along the way: the integrator's own error indicator */
  speedDrift: number;
  /** how many times the integration moved to another chart */
  switches: number;
  end: { chart: number; u: number; v: number; du: number; dv: number };
}

const inRange = (x: number, r: [number, number]) => x >= Math.min(r[0], r[1]) - 1e-12 && x <= Math.max(r[0], r[1]) + 1e-12;

/** Rewrite a coordinate velocity w = du r_u + dv r_v from chart a to chart b at the same surface point. */
export function transferState(charts: Chart[], from: number, to: number, u: number, v: number, du: number, dv: number): { u: number; v: number; du: number; dv: number } | null {
  const A = charts[from], B = charts[to];
  if (!B.inverse) return null;
  const j = new Float64Array(18);
  A.surface.jet(u, v, j);
  const p: V3 = [j[0], j[1], j[2]];
  const w = [du * j[3] + dv * j[6], du * j[4] + dv * j[7], du * j[5] + dv * j[8]];
  const q = B.inverse(p);
  if (!q) return null;
  B.surface.jet(q[0], q[1], j);
  const E = j[3] * j[3] + j[4] * j[4] + j[5] * j[5], F = j[3] * j[6] + j[4] * j[7] + j[5] * j[8], G = j[6] * j[6] + j[7] * j[7] + j[8] * j[8];
  const a = w[0] * j[3] + w[1] * j[4] + w[2] * j[5], b = w[0] * j[6] + w[1] * j[7] + w[2] * j[8];
  const D = E * G - F * F;
  if (!(D > 0)) return null;
  return { u: q[0], v: q[1], du: (G * a - F * b) / D, dv: (E * b - F * a) / D };
}

/**
 * Trace a geodesic of the given arc length from a point and a direction (any
 * nonzero coordinate velocity; it is normalized to unit speed). Classical RK4
 * in arc length; when the current chart degrades (quality below `switchBelow`)
 * the state moves to the best other chart through its inverse — a transition map.
 */
export function traceGeodesic(charts: Chart[], start: { chart: number; u: number; v: number; du: number; dv: number }, length: number, opts: { h?: number; switchBelow?: number; maxPoints?: number } = {}): GeodesicResult {
  let ci = start.chart;
  const L = Math.abs(length), sgn = length < 0 ? -1 : 1;
  const nSteps = Math.max(50, Math.min(20000, Math.ceil(L / (opts.h ?? 0.01))));
  const h = L / nSteps;
  const jet = new Float64Array(18), gam = new Float64Array(6);
  const rhsFor = (c: Chart): Rhs => (_t, y) => {
    christoffelFromJetSurface(c.surface, y[0], y[1], jet, gam);
    const a = y[2], b = y[3];
    return [a, b, -(gam[0] * a * a + 2 * gam[1] * a * b + gam[2] * b * b), -(gam[3] * a * a + 2 * gam[4] * a * b + gam[5] * b * b)];
  };
  let rhs = rhsFor(charts[ci]);
  const gAt = (c: Chart, u: number, v: number) => { c.surface.jet(u, v, jet); return [jet[3] ** 2 + jet[4] ** 2 + jet[5] ** 2, jet[3] * jet[6] + jet[4] * jet[7] + jet[5] * jet[8], jet[6] ** 2 + jet[7] ** 2 + jet[8] ** 2]; };
  let [E, F, G] = gAt(charts[ci], start.u, start.v);
  const sp = Math.sqrt(E * start.du ** 2 + 2 * F * start.du * start.dv + G * start.dv ** 2);
  if (!(sp > 0) || !Number.isFinite(sp)) return { points: [], length: 0, stop: 'singular', warning: 'The starting direction is zero or the point is singular', speedDrift: 0, switches: 0, end: { ...start } };
  let y = [start.u, start.v, (sgn * start.du) / sp, (sgn * start.dv) / sp];
  const every = Math.max(1, Math.ceil(nSteps / (opts.maxPoints ?? 1500)));
  const pts: GeodesicPoint[] = [{ chart: ci, u: y[0], v: y[1], p: charts[ci].surface.r(y[0], y[1]), s: 0 }];
  let drift = 0, switches = 0, stop: GeodesicResult['stop'] = 'done', warning: string | undefined;
  const switchBelow = opts.switchBelow ?? 0.3;
  let s = 0;
  for (let i = 1; i <= nSteps; i++) {
    const next = rk4Step(rhs, s, y, h);
    const c = charts[ci];
    const bad = !next.every(Number.isFinite);
    const out = !bad && ((!c.periodicU && !inRange(next[0], c.u)) || (!c.periodicV && !inRange(next[1], c.v)));
    if (bad || out) {
      // maybe another chart covers it
      const alt = bad ? -1 : bestChart(charts, ci, y);
      if (alt >= 0 && switches < 1000) { const t = transferState(charts, ci, alt, y[0], y[1], y[2], y[3]); if (t) { ci = alt; y = [t.u, t.v, t.du, t.dv]; rhs = rhsFor(charts[ci]); switches++; i--; continue; } }
      stop = bad ? 'singular' : 'edge';
      warning = bad ? 'The geodesic ran into a singular point of the parametrization' : 'The geodesic left the drawn part of the surface';
      break;
    }
    y = next; s += h;
    [E, F, G] = gAt(c, y[0], y[1]);
    const D = E * G - F * F;
    if (!(D > 1e-14 * (E + G) * (E + G))) { stop = 'singular'; warning = 'The geodesic reached a point where the parametrization degenerates (r_u × r_v = 0)'; break; }
    drift = Math.max(drift, Math.abs(E * y[2] ** 2 + 2 * F * y[2] * y[3] + G * y[3] ** 2 - 1));
    if (charts.length > 1 && c.quality && c.quality(y[0], y[1]) < switchBelow) {
      const alt = bestChart(charts, ci, y);
      if (alt >= 0) { const t = transferState(charts, ci, alt, y[0], y[1], y[2], y[3]); if (t) { ci = alt; y = [t.u, t.v, t.du, t.dv]; rhs = rhsFor(charts[ci]); switches++; } }
    }
    if (i % every === 0 || i === nSteps) pts.push({ chart: ci, u: y[0], v: y[1], p: charts[ci].surface.r(y[0], y[1]), s: s * sgn });
  }
  if (stop !== 'done' && pts[pts.length - 1].s !== s * sgn) pts.push({ chart: ci, u: y[0], v: y[1], p: charts[ci].surface.r(y[0], y[1]), s: s * sgn });
  return { points: pts, length: s, stop, warning, speedDrift: drift, switches, end: { chart: ci, u: y[0], v: y[1], du: sgn * y[2], dv: sgn * y[3] } };
}

function christoffelFromJetSurface(S: Surface, u: number, v: number, jet: Float64Array, out: Float64Array) { S.jet(u, v, jet); christoffelFromJet(jet, out); }

function bestChart(charts: Chart[], ci: number, y: number[]): number {
  const p = charts[ci].surface.r(y[0], y[1]);
  let best = -1, bq = charts[ci].quality ? charts[ci].quality!(y[0], y[1]) : 0;
  charts.forEach((c, k) => {
    if (k === ci || !c.inverse) return;
    const q = c.inverse(p);
    if (!q) return;
    const inside = (c.periodicU || inRange(q[0], c.u)) && (c.periodicV || inRange(q[1], c.v));
    const qq = c.quality ? c.quality(q[0], q[1]) : 1;
    if (inside && qq > bq + 1e-9) { best = k; bq = qq; }
  });
  return best;
}

/** Initial coordinate velocity for a unit direction at angle θ from ∂_u (measured with the metric, positively oriented). */
export function directionAt(S: Surface, u: number, v: number, theta: number): V2 {
  const lg = metricAt(S, u, v);
  const [e1, e2] = orthonormalFrame(lg);
  return [Math.cos(theta) * e1[0] + Math.sin(theta) * e2[0], Math.cos(theta) * e1[1] + Math.sin(theta) * e2[1]];
}

/** E, F, G at a point. */
export function metricAt(S: Surface, u: number, v: number): { E: number; F: number; G: number } {
  const j = new Float64Array(18);
  S.jet(u, v, j);
  return { E: j[3] ** 2 + j[4] ** 2 + j[5] ** 2, F: j[3] * j[6] + j[4] * j[7] + j[5] * j[8], G: j[6] ** 2 + j[7] ** 2 + j[8] ** 2 };
}

/**
 * The geodesic from A to B in one chart, by shooting: Newton's method on the
 * initial angle and length. Returns null if it does not converge (no geodesic
 * nearby, or one that leaves the chart).
 */
export function geodesicBetween(chart: Chart, A: V2, B: V2, opts: { h?: number; tol?: number } = {}): { result: GeodesicResult; theta: number; length: number; iterations: number; residual: number } | null {
  const S = chart.surface;
  const wrap = (d: number, per: boolean, r: [number, number]) => { if (!per) return d; const P = Math.abs(r[1] - r[0]); return d - P * Math.round(d / P); };
  const diff = (p: V2, q: V2): V2 => [wrap(q[0] - p[0], !!chart.periodicU, chart.u), wrap(q[1] - p[1], !!chart.periodicV, chart.v)];
  const lgA = metricAt(S, A[0], A[1]);
  const d0 = diff(A, B);
  const [e1, e2] = orthonormalFrame(lgA);
  // initial guess: the straight segment in coordinates
  const a = metricDot(lgA, d0, e1), b = metricDot(lgA, d0, e2);
  let theta = Math.atan2(b, a), len = Math.hypot(a, b);
  if (len < 1e-12) return null;
  const h = opts.h ?? Math.max(1e-3, len / 400);
  const shoot = (th: number, l: number) => {
    const d = directionAt(S, A[0], A[1], th);
    const r = traceGeodesic([chart], { chart: 0, u: A[0], v: A[1], du: d[0], dv: d[1] }, l, { h: Math.min(h, l / 60), maxPoints: 400 });
    const res = diff([r.end.u, r.end.v], B);
    return { r, res, ok: r.stop === 'done' };
  };
  let cur = shoot(theta, len), it = 0;
  const tol = opts.tol ?? 1e-9;
  for (; it < 30; it++) {
    if (!cur.ok) return null;
    const rn = Math.hypot(...cur.res);
    if (rn < tol) break;
    const et = 1e-6, el = 1e-6 * Math.max(1, len);
    const ct = shoot(theta + et, len), cl = shoot(theta, len + el);
    if (!ct.ok || !cl.ok) return null;
    // residual = B − end; d(end)/dθ = −d(res)/dθ
    const J = [[-(ct.res[0] - cur.res[0]) / et, -(cl.res[0] - cur.res[0]) / el], [-(ct.res[1] - cur.res[1]) / et, -(cl.res[1] - cur.res[1]) / el]];
    const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    if (!Number.isFinite(det) || Math.abs(det) < 1e-14) return null;
    const dth = (J[1][1] * cur.res[0] - J[0][1] * cur.res[1]) / det;
    const dl = (-J[1][0] * cur.res[0] + J[0][0] * cur.res[1]) / det;
    // damped step
    let k = 1, next = cur;
    for (; k > 1e-3; k /= 2) {
      const l2 = len + k * dl;
      if (l2 <= 0) continue;
      next = shoot(theta + k * dth, l2);
      if (next.ok && Math.hypot(...next.res) < rn) break;
    }
    if (k <= 1e-3) return null;
    theta += k * dth; len += k * dl; cur = next;
  }
  const residual = Math.hypot(...cur.res);
  if (residual > Math.max(tol * 1e3, 1e-6)) return null;
  return { result: cur.r, theta, length: len, iterations: it, residual };
}

// ══ Parallel transport and holonomy ═══════════════════════════════════════════

export interface TransportResult {
  t: number[];
  /** the curve point (u, v) and the transported vector (V^u, V^v) at each t */
  x: V2[]; V: V2[];
  ok: boolean; warning?: string;
  /** max relative change of |V|_g — it should be zero: the integrator's error indicator */
  normDrift: number;
}

/**
 * Parallel-transport V0 along the coordinate curve t ↦ (u(t), v(t)):
 * dV^k/dt + Γ^k_ij ẋ^i V^j = 0 (adaptive Dormand–Prince).
 */
export function parallelTransport(S: Surface, path: (t: number) => [number, number, number, number], V0: V2, t0: number, t1: number, opts: { rtol?: number; maxStep?: number } = {}): TransportResult {
  const gam = new Float64Array(6), jet = new Float64Array(18);
  const rhs: Rhs = (t, y) => {
    const [u, v, du, dv] = path(t);
    surfaceChristoffel(S, u, v, gam, jet);
    const a = y[0], b = y[1];
    return [-(gam[0] * du * a + gam[1] * (du * b + dv * a) + gam[2] * dv * b), -(gam[3] * du * a + gam[4] * (du * b + dv * a) + gam[5] * dv * b)];
  };
  const tr = odeSolve(rhs, [V0[0], V0[1]], t0, t1, { rtol: opts.rtol ?? 1e-10, atol: 1e-12, maxStep: opts.maxStep ?? Math.abs(t1 - t0) / 200 });
  const x: V2[] = [], V: V2[] = [];
  let n0 = NaN, drift = 0;
  tr.t.forEach((t, i) => {
    const [u, v] = path(t);
    x.push([u, v]); V.push([tr.y[i][0], tr.y[i][1]]);
    const lg = metricAt(S, u, v);
    const nn = Math.sqrt(metricDot(lg, V[i], V[i]));
    if (i === 0) n0 = nn; else drift = Math.max(drift, Math.abs(nn / n0 - 1));
  });
  return { t: tr.t, x, V, ok: tr.ok, warning: tr.warning, normDrift: drift };
}

/**
 * ∫∫ K dA over a region of the parameter plane: a disc (cu, cv, ρ) or a
 * rectangle. Tensor Gauss–Legendre; the error estimate is |Q(n) − Q(n/2)|.
 * Also returns the area ∫∫ √det g du dv.
 */
export function curvatureIntegral(S: Surface, region: { kind: 'disc'; cu: number; cv: number; rho: number; ax?: number } | { kind: 'rect'; u0: number; u1: number; v0: number; v1: number }, n = 32): { K: number; area: number; errK: number } {
  const q = (m: number) => {
    const { x, w } = gaussLegendre(m);
    let sK = 0, sA = 0;
    const lgK = (u: number, v: number) => { const lg = localGeometry(S, u, v); const sq = Math.sqrt(Math.max(0, lg.detg)); return [Number.isFinite(lg.K) ? lg.K * sq : 0, sq]; };
    if (region.kind === 'rect') {
      const hu = (region.u1 - region.u0) / 2, hv = (region.v1 - region.v0) / 2, cu = (region.u0 + region.u1) / 2, cv = (region.v0 + region.v1) / 2;
      for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const [k, a] = lgK(cu + hu * x[i], cv + hv * x[j]); sK += w[i] * w[j] * k; sA += w[i] * w[j] * a; }
      return [sK * hu * hv, sA * hu * hv];
    }
    // polar coordinates in the parameter plane: ρ' ∈ [0, ρ], φ ∈ [0, 2π) (trapezoid in φ is spectrally accurate)
    const nphi = 2 * m, ax = region.ax ?? 1;
    for (let i = 0; i < m; i++) {
      const rr = (region.rho / 2) * (x[i] + 1);
      for (let k = 0; k < nphi; k++) {
        const ph = (2 * Math.PI * k) / nphi;
        const [kk, a] = lgK(region.cu + rr * Math.cos(ph) * ax, region.cv + rr * Math.sin(ph));
        const wt = w[i] * (region.rho / 2) * rr * ax * (2 * Math.PI / nphi);
        sK += wt * kk; sA += wt * a;
      }
    }
    return [sK, sA];
  };
  const [K1, A1] = q(n), [K2] = q(Math.max(4, n >> 1));
  return { K: K1, area: A1, errK: Math.abs(K1 - K2) };
}

// ══ Curves ═══════════════════════════════════════════════════════════════════

/** Frenet frame, curvature and torsion from r′, r″, r‴. */
export function curveFrame(r1: V3, r2: V3, r3: V3): { T: V3; N: V3; B: V3; kappa: number; tau: number; speed: number } {
  const speed = norm3(r1), c = cross3(r1, r2), cl = norm3(c);
  const T = unit3(r1), B = cl > 1e-14 * speed ** 3 ? unit3(c) : [0, 0, 0] as V3;
  const N = cross3(B, T);
  return { T, N, B, speed, kappa: cl / speed ** 3, tau: cl > 1e-14 * speed ** 3 ? dot3(c, r3) / (cl * cl) : 0 };
}

export interface FrenetResult { s: number[]; r: V3[]; T: V3[]; N: V3[]; B: V3[]; ok: boolean; warning?: string; orthoDrift: number }

/**
 * Rebuild a curve from its curvature κ(s) and torsion τ(s): integrate
 * r′ = T, T′ = κN, N′ = −κT + τB, B′ = −τN (adaptive Dormand–Prince).
 * The fundamental theorem of curves: κ > 0 and τ fix the curve up to a rigid motion.
 */
export function frenetSerret(kappa: (s: number) => number, tau: (s: number) => number, L: number, opts: { r0?: V3; T0?: V3; N0?: V3; samples?: number; rtol?: number } = {}): FrenetResult {
  const T0 = opts.T0 ?? [1, 0, 0], N0 = opts.N0 ?? [0, 1, 0], B0 = cross3(T0, N0), r0 = opts.r0 ?? [0, 0, 0];
  const rhs: Rhs = (s, y) => {
    const k = kappa(s), t = tau(s);
    const out = new Array(12);
    for (let i = 0; i < 3; i++) {
      out[i] = y[3 + i];
      out[3 + i] = k * y[6 + i];
      out[6 + i] = -k * y[3 + i] + t * y[9 + i];
      out[9 + i] = -t * y[6 + i];
    }
    return out;
  };
  const tr = odeSolve(rhs, [...r0, ...T0, ...N0, ...B0], 0, L, { rtol: opts.rtol ?? 1e-10, atol: 1e-12, maxStep: Math.abs(L) / (opts.samples ?? 600) });
  const r: V3[] = [], T: V3[] = [], N: V3[] = [], B: V3[] = [];
  let drift = 0;
  for (const y of tr.y) {
    r.push([y[0], y[1], y[2]]); T.push([y[3], y[4], y[5]]); N.push([y[6], y[7], y[8]]); B.push([y[9], y[10], y[11]]);
    const t = T[T.length - 1], n = N[N.length - 1];
    drift = Math.max(drift, Math.abs(dot3(t, t) - 1), Math.abs(dot3(n, n) - 1), Math.abs(dot3(t, n)));
  }
  return { s: tr.t, r, T, N, B, ok: tr.ok, warning: tr.warning, orthoDrift: drift };
}

/** The Jacobi equation ξ″ + K(s) ξ = 0 along a geodesic (geodesic deviation on a surface). */
export function jacobiField(K: (s: number) => number, xi0: number, dxi0: number, L: number, samples = 400): { s: number[]; xi: number[]; ok: boolean } {
  const tr = odeSolve((s, y) => [y[1], -K(s) * y[0]], [xi0, dxi0], 0, L, { rtol: 1e-10, atol: 1e-13, maxStep: L / samples });
  return { s: tr.t, xi: tr.y.map((y) => y[0]), ok: tr.ok };
}

// ══ Schwarzschild ════════════════════════════════════════════════════════════

/** Flamm's paraboloid: the embedding height of the Schwarzschild equatorial slice, z = 2√(r_s (r − r_s)). */
export const flammZ = (rs: number, r: number) => 2 * Math.sqrt(rs * Math.max(0, r - rs));

/** Proper radial distance ∫ dr / √(1 − r_s/r) between r1 and r2 (both ≥ r_s), in closed form. */
export function properRadialDistance(rs: number, r1: number, r2: number): number {
  const F = (r: number) => Math.sqrt(r * (r - rs)) + rs * Math.log(Math.sqrt(r) + Math.sqrt(r - rs));
  return F(r2) - F(r1);
}

/**
 * Trace a geodesic in one chart and parallel-transport a vector along it
 * (classical RK4 on (u, v, u′, v′, V^u, V^v)). The initial velocity is
 * normalized to unit speed.
 */
export function geodesicTransport(S: Surface, start: { u: number; v: number; du: number; dv: number }, V0: V2, length: number, n = 200): { u: number; v: number; du: number; dv: number; V: V2; ok: boolean } {
  const jet = new Float64Array(18), gam = new Float64Array(6);
  const lg = metricAt(S, start.u, start.v);
  const sp = Math.sqrt(metricDot(lg, [start.du, start.dv], [start.du, start.dv]));
  const rhs: Rhs = (_t, y) => {
    surfaceChristoffel(S, y[0], y[1], gam, jet);
    const a = y[2], b = y[3], p = y[4], q = y[5];
    return [a, b,
      -(gam[0] * a * a + 2 * gam[1] * a * b + gam[2] * b * b), -(gam[3] * a * a + 2 * gam[4] * a * b + gam[5] * b * b),
      -(gam[0] * a * p + gam[1] * (a * q + b * p) + gam[2] * b * q), -(gam[3] * a * p + gam[4] * (a * q + b * p) + gam[5] * b * q)];
  };
  let y = [start.u, start.v, start.du / sp, start.dv / sp, V0[0], V0[1]];
  const h = length / n;
  for (let i = 0; i < n; i++) y = rk4Step(rhs, i * h, y, h);
  return { u: y[0], v: y[1], du: y[2], dv: y[3], V: [y[4], y[5]], ok: y.every(Number.isFinite) };
}

/**
 * ∫∫ K dA and the area over a region of the parameter plane bounded by a
 * closed polygon that is star-shaped about its centroid (a geodesic triangle,
 * a geodesic disc). Fan triangulation, Gauss–Legendre on each piece.
 */
export function curvatureOverPolygon(S: Surface, poly: V2[], n = 4): { K: number; area: number } {
  const m = poly.length;
  let cu = 0, cv = 0;
  for (const p of poly) { cu += p[0] / m; cv += p[1] / m; }
  const { x, w } = gaussLegendre(n);
  let sK = 0, sA = 0;
  for (let i = 0; i < m; i++) {
    const P = poly[i], Q = poly[(i + 1) % m];
    const a0 = P[0] - cu, a1 = P[1] - cv, b0 = Q[0] - P[0], b1 = Q[1] - P[1];
    const det = a0 * b1 - a1 * b0;
    for (let ii = 0; ii < n; ii++) for (let jj = 0; jj < n; jj++) {
      const s = (x[ii] + 1) / 2, t = (x[jj] + 1) / 2;
      const u = cu + s * a0 + s * t * b0, v = cv + s * a1 + s * t * b1;
      const lg = localGeometry(S, u, v);
      const sq = Math.sqrt(Math.max(0, lg.detg));
      const wt = (w[ii] * w[jj] / 4) * s * det;
      if (Number.isFinite(lg.K)) sK += wt * lg.K * sq;
      sA += wt * sq;
    }
  }
  const sg = sA < 0 ? -1 : 1;
  return { K: sg * sK, area: sg * sA };
}
