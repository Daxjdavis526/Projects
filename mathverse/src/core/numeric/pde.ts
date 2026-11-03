// Partial differential equations, DOM-free: finite-difference solvers for the
// heat equation (1D θ-schemes — FTCS, BTCS, Crank–Nicolson — with Dirichlet,
// Neumann, Robin or periodic ends; 2D FTCS and Peaceman–Rachford ADI), the
// wave equation (leapfrog) and Laplace/Poisson (Jacobi, Gauss–Seidel, SOR);
// exact solutions to check them against (Fourier series, d'Alembert with
// reflections, the Laplace series on a square, the Dirichlet Green's function
// of the square, the free Schrödinger packet); Bessel functions and their
// zeros for drum modes; erf; von Neumann amplification factors; Sturm–Liouville
// eigenvalues by shooting. Solvers preallocate their work arrays so a step
// allocates nothing.

import { brent } from './roots';
import { integrate } from './quad';
import { rk4Step } from './ode';

// ── tridiagonal systems ─────────────────────────────────────────────────────

/**
 * Solve a tridiagonal system by the Thomas algorithm. Row i reads
 * a[i]·x[i−1] + b[i]·x[i] + c[i]·x[i+1] = d[i] (a[0] and c[n−1] are ignored).
 * cp, dp are work arrays of length ≥ n. x may alias d.
 */
export function thomas(a: ArrayLike<number>, b: ArrayLike<number>, c: ArrayLike<number>, d: ArrayLike<number>, x: Float64Array, n: number, cp: Float64Array, dp: Float64Array): void {
  let m = b[0];
  cp[0] = c[0] / m; dp[0] = d[0] / m;
  for (let i = 1; i < n; i++) {
    m = b[i] - a[i] * cp[i - 1];
    cp[i] = c[i] / m;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / m;
  }
  x[n - 1] = dp[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
}

/** Work space for cyclicThomas (length n each). */
export function cyclicWork(n: number) {
  return { bb: new Float64Array(n), u: new Float64Array(n), z: new Float64Array(n), y: new Float64Array(n), cp: new Float64Array(n), dp: new Float64Array(n) };
}

/**
 * A cyclic tridiagonal system (periodic boundary): as thomas, but a[0] couples
 * row 0 to x[n−1] and c[n−1] couples row n−1 to x[0]. Sherman–Morrison.
 */
export function cyclicThomas(a: ArrayLike<number>, b: ArrayLike<number>, c: ArrayLike<number>, d: ArrayLike<number>, x: Float64Array, n: number, w: ReturnType<typeof cyclicWork>): void {
  const alpha = c[n - 1], beta = a[0];
  const gamma = -b[0];
  const { bb, u, z, y, cp, dp } = w;
  for (let i = 0; i < n; i++) { bb[i] = b[i]; u[i] = 0; }
  bb[0] = b[0] - gamma;
  bb[n - 1] = b[n - 1] - (alpha * beta) / gamma;
  thomas(a, bb, c, d, y, n, cp, dp);
  u[0] = gamma; u[n - 1] = alpha;
  thomas(a, bb, c, u, z, n, cp, dp);
  const fact = (y[0] + (beta * y[n - 1]) / gamma) / (1 + z[0] + (beta * z[n - 1]) / gamma);
  for (let i = 0; i < n; i++) x[i] = y[i] - fact * z[i];
}

// ── the 1D heat equation u_t = α u_xx ───────────────────────────────────────

/**
 * An end condition. Dirichlet: u = value. Neumann: ∂u/∂n = value (outward
 * slope; 0 = insulated). Robin: ∂u/∂n = −bi·(u − value) (convective loss to an
 * ambient temperature `value`, Biot-type coefficient bi in 1/length).
 */
export interface EndCond { kind: 'dirichlet' | 'neumann' | 'robin'; value?: number; bi?: number }
export type Scheme1D = 'ftcs' | 'btcs' | 'cn';
export const THETA: Record<Scheme1D, number> = { ftcs: 0, btcs: 1, cn: 0.5 };

export interface Heat1DOpts { L: number; N: number; alpha: number; left?: EndCond; right?: EndCond; periodic?: boolean }

/**
 * u_t = α u_xx on [0, L] with N intervals (N + 1 nodes; periodic: N nodes,
 * u(L) = u(0)). Ends use ghost nodes, second order. step() advances by dt with
 * the θ-scheme: FTCS (θ = 0, explicit), BTCS (θ = 1), Crank–Nicolson (θ = ½).
 */
export class Heat1D {
  readonly n: number;
  readonly dx: number;
  readonly x: Float64Array;
  u: Float64Array;
  t = 0;
  readonly opts: Required<Omit<Heat1DOpts, 'periodic'>> & { periodic: boolean };
  // the stencil: (Âu)_i = sub_i u_{i−1} + diag_i u_i + sup_i u_{i+1} + cst_i, times 1/dx²
  private sub: Float64Array; private diag: Float64Array; private sup: Float64Array; private cst: Float64Array;
  private fixed: Uint8Array; private fixedVal: Float64Array;
  private A: Float64Array; private B: Float64Array; private C: Float64Array; private D: Float64Array;
  private cp: Float64Array; private dp: Float64Array; private cyc: ReturnType<typeof cyclicWork> | null;

  constructor(o: Heat1DOpts) {
    const periodic = !!o.periodic;
    this.opts = { L: o.L, N: o.N, alpha: o.alpha, left: o.left ?? { kind: 'dirichlet', value: 0 }, right: o.right ?? { kind: 'dirichlet', value: 0 }, periodic };
    const n = (this.n = periodic ? o.N : o.N + 1);
    this.dx = o.L / o.N;
    this.x = new Float64Array(n);
    for (let i = 0; i < n; i++) this.x[i] = i * this.dx;
    this.u = new Float64Array(n);
    this.sub = new Float64Array(n); this.diag = new Float64Array(n); this.sup = new Float64Array(n); this.cst = new Float64Array(n);
    this.fixed = new Uint8Array(n); this.fixedVal = new Float64Array(n);
    this.A = new Float64Array(n); this.B = new Float64Array(n); this.C = new Float64Array(n); this.D = new Float64Array(n);
    this.cp = new Float64Array(n); this.dp = new Float64Array(n);
    this.cyc = periodic ? cyclicWork(n) : null;
    for (let i = 0; i < n; i++) { this.sub[i] = 1; this.diag[i] = -2; this.sup[i] = 1; }
    if (!periodic) {
      this.sub[0] = 0; this.sup[n - 1] = 0;
      this.end(0, this.opts.left, 1);
      this.end(n - 1, this.opts.right, -1);
    }
  }

  private end(i: number, e: EndCond, toward: 1 | -1) {
    const dx = this.dx;
    if (e.kind === 'dirichlet') { this.fixed[i] = 1; this.fixedVal[i] = e.value ?? 0; return; }
    // ∂u/∂n = g − bi·u  →  ghost = inner + 2dx (g − bi u_i)
    const bi = e.kind === 'robin' ? (e.bi ?? 1) : 0;
    const g = e.kind === 'robin' ? bi * (e.value ?? 0) : (e.value ?? 0);
    this.diag[i] = -2 - 2 * dx * bi;
    if (toward === 1) { this.sup[i] = 2; this.sub[i] = 0; } else { this.sub[i] = 2; this.sup[i] = 0; }
    this.cst[i] = 2 * dx * g;
  }

  /**
   * Set u(x, 0) = f(x) (Dirichlet ends take their boundary values). With
   * `average`, each node takes the mean of f over its cell (16-point midpoint
   * rule), which keeps a jump between nodes from costing an order of accuracy.
   */
  setInitial(f: (x: number) => number, average = false) {
    const { dx } = this, L = this.opts.L;
    for (let i = 0; i < this.n; i++) {
      if (this.fixed[i]) { this.u[i] = this.fixedVal[i]; continue; }
      if (!average) { this.u[i] = f(this.x[i]); continue; }
      let s = 0, w = 0;
      for (let k = 0; k < 16; k++) {
        let x = this.x[i] + dx * ((k + 0.5) / 16 - 0.5);
        if (this.opts.periodic) x = ((x % L) + L) % L; else if (x < 0 || x > L) continue;
        s += f(x); w++;
      }
      this.u[i] = s / w;
    }
    this.t = 0;
  }

  /** The largest FTCS-stable r = α dt/dx² (Gershgorin bound; exactly ½ for Dirichlet and Neumann ends). */
  get rMax(): number {
    let m = 0;
    for (let i = 0; i < this.n; i++) if (!this.fixed[i]) m = Math.max(m, Math.abs(this.diag[i]) + Math.abs(this.sub[i]) + Math.abs(this.sup[i]));
    return m > 0 ? 2 / m : Infinity;
  }

  /** r = α dt / dx² for a time step dt. */
  r(dt: number) { return (this.opts.alpha * dt) / (this.dx * this.dx); }

  /** One θ-scheme step. */
  step(dt: number, scheme: Scheme1D) {
    const n = this.n, u = this.u, r = this.r(dt), th = THETA[scheme];
    const { sub, diag, sup, cst, fixed, fixedVal, A, B, C, D } = this;
    const per = this.opts.periodic;
    for (let i = 0; i < n; i++) {
      if (fixed[i]) { D[i] = fixedVal[i]; continue; }
      const um = i > 0 ? u[i - 1] : per ? u[n - 1] : 0;
      const up = i < n - 1 ? u[i + 1] : per ? u[0] : 0;
      const Au = sub[i] * um + diag[i] * u[i] + sup[i] * up + cst[i];
      D[i] = u[i] + (1 - th) * r * Au + th * r * cst[i];
    }
    if (th === 0) { u.set(D); this.t += dt; return; }
    for (let i = 0; i < n; i++) {
      if (fixed[i]) { A[i] = 0; B[i] = 1; C[i] = 0; continue; }
      A[i] = -th * r * sub[i]; B[i] = 1 - th * r * diag[i]; C[i] = -th * r * sup[i];
    }
    if (per) cyclicThomas(A, B, C, D, u, n, this.cyc!);
    else thomas(A, B, C, D, u, n, this.cp, this.dp);
    this.t += dt;
  }

  /** ∫ u dx by the trapezoid rule (the quantity the insulated scheme conserves exactly). */
  heat(): number {
    const n = this.n, u = this.u;
    let s = 0;
    if (this.opts.periodic) { for (let i = 0; i < n; i++) s += u[i]; return s * this.dx; }
    for (let i = 0; i < n; i++) s += (i === 0 || i === n - 1 ? 0.5 : 1) * u[i];
    return s * this.dx;
  }

  /** u at any x by linear interpolation between nodes. */
  at(x: number): number {
    const n = this.n, L = this.opts.L;
    if (this.opts.periodic) x = ((x % L) + L) % L;
    const s = x / this.dx, i = Math.min(Math.max(0, Math.floor(s)), n - 1), f = s - i;
    const a = this.u[i], b = i + 1 < n ? this.u[i + 1] : this.opts.periodic ? this.u[0] : this.u[i];
    return a + (b - a) * f;
  }
}

/** Fourier sine-series solution of the heat equation on [0, L] with u = 0 at both ends. b[k−1] is the coefficient of sin(kπx/L). */
export function heatSineSeries(b: ArrayLike<number>, alpha: number, L: number, x: number, t: number): number {
  let s = 0;
  for (let k = 1; k <= b.length; k++) {
    const decay = Math.exp(-alpha * (k * Math.PI / L) ** 2 * t);
    if (decay < 1e-17) break;
    s += b[k - 1] * decay * Math.sin((k * Math.PI * x) / L);
  }
  return s;
}

// ── exact sine/cosine coefficients ──────────────────────────────────────────

/**
 * Exact sine coefficients b_k = (2/L)∫₀ᴸ g(s) sin(kπs/L) ds, k = 1..K, of the
 * piecewise-linear g through (xs[j], ys[j]) (xs increasing, covering [0, L]).
 */
export function sineCoeffsPL(xs: ArrayLike<number>, ys: ArrayLike<number>, K: number, L = 1): Float64Array {
  const out = new Float64Array(K);
  for (let k = 1; k <= K; k++) {
    const w = (k * Math.PI) / L;
    let s = 0;
    for (let j = 0; j + 1 < xs.length; j++) {
      const a = xs[j], b = xs[j + 1];
      if (b <= a) continue;
      const q = (ys[j + 1] - ys[j]) / (b - a), p = ys[j] - q * a;
      // ∫ (p + q s) sin(ws) ds = −(p + q s) cos(ws)/w + q sin(ws)/w²
      const F = (z: number) => (-(p + q * z) * Math.cos(w * z)) / w + (q * Math.sin(w * z)) / (w * w);
      s += F(b) - F(a);
    }
    out[k - 1] = (2 / L) * s;
  }
  return out;
}

/**
 * Fourier coefficients by adaptive quadrature. kind 'full' on [−π, π]
 * (a_0..a_N, b_1..b_N), 'sine' / 'cosine' on [0, π] (odd / even extension).
 * f(x) = a_0/2 + Σ a_n cos nx + b_n sin nx. Returns the summed error estimate.
 */
export function fourierCoeffs(f: (x: number) => number, kind: 'full' | 'sine' | 'cosine', N: number): { a: Float64Array; b: Float64Array; error: number; ok: boolean } {
  const a = new Float64Array(N + 1), b = new Float64Array(N + 1);
  let error = 0, ok = true;
  const q = (g: (x: number) => number, lo: number, hi: number) => { const r = integrate(g, lo, hi, 1e-10, 40000); error += Math.abs(r.error); ok = ok && r.ok; return r.value; };
  for (let n = 0; n <= N; n++) {
    if (kind === 'full') {
      a[n] = q((x) => f(x) * Math.cos(n * x), -Math.PI, Math.PI) / Math.PI;
      if (n) b[n] = q((x) => f(x) * Math.sin(n * x), -Math.PI, Math.PI) / Math.PI;
    } else if (kind === 'cosine') a[n] = (2 / Math.PI) * q((x) => f(x) * Math.cos(n * x), 0, Math.PI);
    else if (n) b[n] = (2 / Math.PI) * q((x) => f(x) * Math.sin(n * x), 0, Math.PI);
  }
  return { a, b, error, ok };
}

/** The partial sum S_N (fejer: the Cesàro mean σ_N, weights 1 − n/(N+1)). */
export function fourierSum(a: ArrayLike<number>, b: ArrayLike<number>, N: number, x: number, fejer = false): number {
  let s = a[0] / 2;
  for (let n = 1; n <= N && n < a.length; n++) {
    const w = fejer ? 1 - n / (N + 1) : 1;
    s += w * (a[n] * Math.cos(n * x) + b[n] * Math.sin(n * x));
  }
  return s;
}

/** The Gibbs constant: the partial sums of a jump of height 1 overshoot by this fraction (≈ 0.0895). */
export const GIBBS = 0.08948987223608362;

// ── the 2D heat equation on a square ────────────────────────────────────────

export type SideBC = { kind: 'dirichlet'; value: number } | { kind: 'neumann' };
export interface Heat2DOpts { L: number; n: number; alpha: number; left: SideBC; right: SideBC; bottom: SideBC; top: SideBC }

/**
 * u_t = α(u_xx + u_yy) + q(x, y) on [0, L]² with (n + 1)² nodes; node (i, j)
 * at index j(n+1) + i. Each side Dirichlet (fixed value) or Neumann
 * (insulated, ghost node). FTCS (stable for r ≤ ¼) or Peaceman–Rachford ADI
 * (unconditionally stable, second order).
 */
export class Heat2D {
  readonly n: number; readonly m: number; readonly h: number;
  u: Float64Array;
  /** a heat source q(x, y) per node (zeros = none) */
  q: Float64Array;
  t = 0;
  opts: Heat2DOpts;
  fixed: Uint8Array; private fixedVal: Float64Array;
  private tmp: Float64Array; private star: Float64Array;
  private A: Float64Array; private B: Float64Array; private C: Float64Array; private D: Float64Array; private X: Float64Array;
  private cp: Float64Array; private dp: Float64Array;

  constructor(o: Heat2DOpts) {
    this.opts = o;
    const n = (this.n = o.n), m = (this.m = n + 1);
    this.h = o.L / n;
    this.u = new Float64Array(m * m); this.q = new Float64Array(m * m);
    this.fixed = new Uint8Array(m * m); this.fixedVal = new Float64Array(m * m);
    this.tmp = new Float64Array(m * m); this.star = new Float64Array(m * m);
    this.A = new Float64Array(m); this.B = new Float64Array(m); this.C = new Float64Array(m); this.D = new Float64Array(m); this.X = new Float64Array(m);
    this.cp = new Float64Array(m); this.dp = new Float64Array(m);
    this.setBC(o);
  }

  setBC(o: Pick<Heat2DOpts, 'left' | 'right' | 'bottom' | 'top'>) {
    Object.assign(this.opts, o);
    const { n, m } = this;
    this.fixed.fill(0); this.fixedVal.fill(0);
    const sides: [SideBC, (k: number) => number][] = [
      [this.opts.left, (k) => k * m], [this.opts.right, (k) => k * m + n],
      [this.opts.bottom, (k) => k], [this.opts.top, (k) => n * m + k],
    ];
    const cnt = new Uint8Array(m * m);
    for (const [bc, idx] of sides) if (bc.kind === 'dirichlet') for (let k = 0; k <= n; k++) { const id = idx(k); this.fixed[id] = 1; this.fixedVal[id] += bc.value; cnt[id]++; }
    for (let id = 0; id < m * m; id++) if (cnt[id] > 1) this.fixedVal[id] /= cnt[id];
    for (let id = 0; id < m * m; id++) if (this.fixed[id]) this.u[id] = this.fixedVal[id];
  }

  setInitial(f: (x: number, y: number) => number) {
    const { m, h } = this;
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) { const id = j * m + i; this.u[id] = this.fixed[id] ? this.fixedVal[id] : f(i * h, j * h); }
    this.t = 0;
  }

  r(dt: number) { return (this.opts.alpha * dt) / (this.h * this.h); }

  /** second difference in x (dir 1) or y (dir m) at node (i, j), Neumann sides reflected */
  private d2(u: Float64Array, i: number, j: number, dirX: boolean): number {
    const { n, m } = this;
    const id = j * m + i, k = dirX ? i : j, s = dirX ? 1 : m;
    const lo = k === 0 ? u[id + s] : u[id - s];
    const hi = k === n ? u[id - s] : u[id + s];
    return lo - 2 * u[id] + hi;
  }

  step(dt: number, scheme: 'ftcs' | 'adi') {
    const { n, m, u, q, fixed, fixedVal } = this;
    const r = this.r(dt);
    if (scheme === 'ftcs') {
      const t = this.tmp;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
        const id = j * m + i;
        t[id] = fixed[id] ? fixedVal[id] : u[id] + r * (this.d2(u, i, j, true) + this.d2(u, i, j, false)) + dt * q[id];
      }
      u.set(t);
      this.t += dt;
      return;
    }
    // ADI half step 1: implicit in x, explicit in y
    const { A, B, C, D, X, cp, dp, star } = this, hr = r / 2;
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const id = j * m + i;
        if (fixed[id]) { A[i] = 0; B[i] = 1; C[i] = 0; D[i] = fixedVal[id]; continue; }
        D[i] = u[id] + hr * this.d2(u, i, j, false) + (dt / 2) * q[id];
        B[i] = 1 + 2 * hr;
        A[i] = i === 0 ? 0 : i === n ? -2 * hr : -hr;
        C[i] = i === n ? 0 : i === 0 ? -2 * hr : -hr;
      }
      thomas(A, B, C, D, X, m, cp, dp);
      for (let i = 0; i <= n; i++) star[j * m + i] = X[i];
    }
    // half step 2: implicit in y, explicit in x
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const id = j * m + i;
        if (fixed[id]) { A[j] = 0; B[j] = 1; C[j] = 0; D[j] = fixedVal[id]; continue; }
        D[j] = star[id] + hr * this.d2(star, i, j, true) + (dt / 2) * q[id];
        B[j] = 1 + 2 * hr;
        A[j] = j === 0 ? 0 : j === n ? -2 * hr : -hr;
        C[j] = j === n ? 0 : j === 0 ? -2 * hr : -hr;
      }
      thomas(A, B, C, D, X, m, cp, dp);
      for (let j = 0; j <= n; j++) u[j * m + i] = X[j];
    }
    this.t += dt;
  }

  /** ∬ u dA (trapezoid). */
  heat(): number {
    const { n, m, u, h } = this;
    let s = 0;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) s += (i === 0 || i === n ? 0.5 : 1) * (j === 0 || j === n ? 0.5 : 1) * u[j * m + i];
    return s * h * h;
  }
}

// ── the wave equation u_tt = c² u_xx ───────────────────────────────────────

/**
 * Leapfrog for the string on [0, L] (N intervals). Fixed end: u = 0. Free end:
 * u_x = 0 (ghost node). Courant number C = c dt/dx; stable for C ≤ 1, and
 * exact on the grid at C = 1.
 */
export class Wave1D {
  readonly n: number; readonly dx: number; readonly x: Float64Array;
  u: Float64Array; uOld: Float64Array; private tmp: Float64Array;
  t = 0; dt = 0;
  constructor(readonly L: number, readonly N: number, readonly c: number, readonly leftFixed: boolean, readonly rightFixed: boolean) {
    const n = (this.n = N + 1);
    this.dx = L / N;
    this.x = new Float64Array(n);
    for (let i = 0; i < n; i++) this.x[i] = i * this.dx;
    this.u = new Float64Array(n); this.uOld = new Float64Array(n); this.tmp = new Float64Array(n);
  }
  get courant() { return (this.c * this.dt) / this.dx; }

  private lap(u: Float64Array, i: number): number {
    const n = this.n;
    const lo = i === 0 ? u[1] : u[i - 1], hi = i === n - 1 ? u[n - 2] : u[i + 1];
    return lo - 2 * u[i] + hi;
  }
  private pin(u: Float64Array) { if (this.leftFixed) u[0] = 0; if (this.rightFixed) u[this.n - 1] = 0; }

  /** Start from u(x,0) = f, u_t(x,0) = g with time step dt (second-order Taylor first step). */
  init(f: (x: number) => number, g: (x: number) => number, dt: number) {
    const n = this.n, C2 = ((this.c * dt) / this.dx) ** 2;
    this.dt = dt;
    for (let i = 0; i < n; i++) this.uOld[i] = f(this.x[i]);
    this.pin(this.uOld);
    for (let i = 0; i < n; i++) this.u[i] = this.uOld[i] + dt * g(this.x[i]) + 0.5 * C2 * this.lap(this.uOld, i);
    this.pin(this.u);
    this.t = dt;
  }

  step() {
    const n = this.n, C2 = this.courant ** 2, { u, uOld, tmp } = this;
    for (let i = 0; i < n; i++) tmp[i] = 2 * u[i] - uOld[i] + C2 * this.lap(u, i);
    this.pin(tmp);
    uOld.set(u); u.set(tmp);
    this.t += this.dt;
  }

  /**
   * The discrete energy leapfrog conserves exactly (between levels n and n+1):
   * ½Σw(Δ_t u)² + ½c²Σ(Δ_x u^{n+1})(Δ_x u^n), trapezoid weights w.
   */
  energy(): number {
    const { n, u, uOld, dx, dt, c } = this;
    let k = 0, p = 0;
    for (let i = 0; i < n; i++) { const w = (i === 0 || i === n - 1) ? 0.5 : 1; const v = (u[i] - uOld[i]) / dt; k += w * v * v; }
    for (let i = 0; i + 1 < n; i++) p += ((u[i + 1] - u[i]) * (uOld[i + 1] - uOld[i])) / (dx * dx);
    return 0.5 * dx * (k + c * c * p);
  }

  at(x: number): number {
    const s = x / this.dx, i = Math.min(Math.max(0, Math.floor(s)), this.n - 2), f = s - i;
    return this.u[i] + (this.u[i + 1] - this.u[i]) * f;
  }
}

/**
 * d'Alembert's solution on [0, L] with reflecting ends, exact:
 *   u(x, t) = ½[F(x − ct) + F(x + ct)] + ½[H(x + ct) − H(x − ct)]
 * where F extends u(x, 0) = f and H extends h = (1/c)∫₀ˣ u_t(s, 0) ds by
 * reflection: a fixed end makes F odd and H even about it; a free end makes F
 * even and H odd (about its end value). Returns the solution and its right-
 * and left-moving parts R(x − ct), Lw(x + ct) with u = R + Lw.
 */
export function dalembert(f: (x: number) => number, h: (x: number) => number, L: number, c: number, leftFixed: boolean, rightFixed: boolean) {
  const hL = h(0), hR = h(L);
  // the extension on [−2L, 2L]
  const baseF = (x: number): number => {
    if (x >= 0 && x <= L) return f(x);
    if (x > L) { const v = f(2 * L - x); return rightFixed ? -v : v; }
    if (x >= -L) { const v = f(-x); return leftFixed ? -v : v; }
    const v = baseF(-x); return leftFixed ? -v : v;
  };
  const baseH = (x: number): number => {
    if (x >= 0 && x <= L) return h(x);
    if (x > L) { const v = h(2 * L - x); return rightFixed ? v : 2 * hR - v; }
    if (x >= -L) { const v = h(-x); return leftFixed ? v : 2 * hL - v; }
    const v = baseH(-x); return leftFixed ? v : 2 * hL - v;
  };
  const P = 4 * L, drift = baseH(2 * L) - baseH(-2 * L);
  const ext = (x: number, isH: boolean) => {
    const k = Math.round(x / P), y = x - k * P;
    return isH ? baseH(y) + k * drift : baseF(y);
  };
  return {
    u(x: number, t: number) { const a = x - c * t, b = x + c * t; return 0.5 * (ext(a, false) + ext(b, false)) + 0.5 * (ext(b, true) - ext(a, true)); },
    right(x: number, t: number) { const a = x - c * t; return 0.5 * (ext(a, false) - ext(a, true)); },
    left(x: number, t: number) { const b = x + c * t; return 0.5 * (ext(b, false) + ext(b, true)); },
  };
}

// ── Laplace and Poisson on a square ─────────────────────────────────────────

/** A grid for ∇²u = f on [0, n·h]²: (n+1)² nodes; fixed nodes keep their values. */
export interface Grid2 { n: number; h: number; u: Float64Array; fixed: Uint8Array; f?: Float64Array | null }
export type RelaxMethod = 'jacobi' | 'gs' | 'sor';

/** The optimal SOR factor for the model problem on an n-interval square. */
export const sorOmegaOpt = (n: number) => 2 / (1 + Math.sin(Math.PI / n));

/** One relaxation sweep; returns the largest change. tmp (length (n+1)²) is needed for Jacobi. */
export function relaxSweep(g: Grid2, method: RelaxMethod, omega: number, tmp: Float64Array): number {
  const { n, h, u, fixed, f } = g, m = n + 1, h2 = h * h;
  let dmax = 0;
  if (method === 'jacobi') {
    tmp.set(u);
    for (let j = 1; j < n; j++) for (let i = 1; i < n; i++) {
      const id = j * m + i;
      if (fixed[id]) continue;
      const v = (tmp[id - 1] + tmp[id + 1] + tmp[id - m] + tmp[id + m] - (f ? h2 * f[id] : 0)) / 4;
      dmax = Math.max(dmax, Math.abs(v - u[id]));
      u[id] = v;
    }
    return dmax;
  }
  const w = method === 'sor' ? omega : 1;
  for (let j = 1; j < n; j++) for (let i = 1; i < n; i++) {
    const id = j * m + i;
    if (fixed[id]) continue;
    const gs = (u[id - 1] + u[id + 1] + u[id - m] + u[id + m] - (f ? h2 * f[id] : 0)) / 4;
    const d = w * (gs - u[id]);
    u[id] += d;
    dmax = Math.max(dmax, Math.abs(d));
  }
  return dmax;
}

/** max |∇²_h u − f| over the free interior nodes. */
export function residual(g: Grid2): number {
  const { n, h, u, fixed, f } = g, m = n + 1;
  let r = 0;
  for (let j = 1; j < n; j++) for (let i = 1; i < n; i++) {
    const id = j * m + i;
    if (fixed[id]) continue;
    r = Math.max(r, Math.abs((u[id - 1] + u[id + 1] + u[id - m] + u[id + m] - 4 * u[id]) / (h * h) - (f ? f[id] : 0)));
  }
  return r;
}

/** Relax until the largest change is below tol (or maxIter sweeps). */
export function solveRelax(g: Grid2, method: RelaxMethod = 'sor', omega = sorOmegaOpt(g.n), tol = 1e-10, maxIter = 20000, tmp?: Float64Array) {
  const t = tmp ?? new Float64Array(g.u.length);
  let it = 0, d = Infinity;
  while (it < maxIter && d > tol) { d = relaxSweep(g, method, omega, t); it++; }
  return { iterations: it, change: d, converged: d <= tol };
}

/** sinh(kπs)/sinh(kπ) without overflow, s ∈ [0, 1]. */
function sinhRatio(k: number, s: number): number {
  const a = k * Math.PI;
  if (s <= 0) return 0;
  return Math.exp(a * (s - 1)) * (1 - Math.exp(-2 * a * s)) / (1 - Math.exp(-2 * a));
}

/** Piecewise-linear boundary data on one side: values at s = xs[j] ∈ [0, 1]. */
export interface PL { xs: number[]; ys: number[] }

/**
 * The exact (series) solution of Laplace's equation on the unit square with
 * piecewise-linear boundary data on each side (continuous at the corners).
 * Bottom/top are u(s, 0), u(s, 1); left/right are u(0, s), u(1, s). The
 * bilinear interpolant of the corners is harmonic and is subtracted first, so
 * the remaining side data vanish at the corners and their sine series
 * converge like 1/k²; K terms are kept.
 */
export class LaplaceSquare {
  readonly K: number;
  private c00: number; private c10: number; private c01: number; private c11: number;
  readonly coeffs: { bottom: Float64Array; top: Float64Array; left: Float64Array; right: Float64Array };
  constructor(sides: { bottom: PL; top: PL; left: PL; right: PL }, K = 80) {
    this.K = K;
    const { bottom, top, left, right } = sides;
    const first = (p: PL) => p.ys[0], last = (p: PL) => p.ys[p.ys.length - 1];
    this.c00 = first(bottom); this.c10 = last(bottom); this.c01 = first(top); this.c11 = last(top);
    const res = (p: PL, a: number, b: number) => sineCoeffsPL(p.xs, p.ys.map((y, j) => y - (a * (1 - p.xs[j]) + b * p.xs[j])), K);
    this.coeffs = {
      bottom: res(bottom, this.c00, this.c10), top: res(top, this.c01, this.c11),
      left: res(left, first(left), last(left)), right: res(right, first(right), last(right)),
    };
  }
  /** the harmonic bilinear part */
  bilinear(x: number, y: number) { return this.c00 * (1 - x) * (1 - y) + this.c10 * x * (1 - y) + this.c01 * (1 - x) * y + this.c11 * x * y; }
  at(x: number, y: number): number {
    const { bottom, top, left, right } = this.coeffs;
    let s = this.bilinear(x, y);
    for (let k = 1; k <= this.K; k++) {
      const sx = Math.sin(k * Math.PI * x), sy = Math.sin(k * Math.PI * y);
      s += sx * (bottom[k - 1] * sinhRatio(k, 1 - y) + top[k - 1] * sinhRatio(k, y)) + sy * (left[k - 1] * sinhRatio(k, 1 - x) + right[k - 1] * sinhRatio(k, x));
    }
    return s;
  }
  /** Values on the (n+1)² grid of the unit square, fast (separable tables). */
  grid(n: number, out: Float64Array): Float64Array {
    const K = this.K, m = n + 1;
    const S = new Float64Array(K * m), H = new Float64Array(K * m), H1 = new Float64Array(K * m);
    for (let k = 1; k <= K; k++) for (let i = 0; i < m; i++) {
      const s = i / n;
      S[(k - 1) * m + i] = Math.sin(k * Math.PI * s); H[(k - 1) * m + i] = sinhRatio(k, s); H1[(k - 1) * m + i] = sinhRatio(k, 1 - s);
    }
    const { bottom, top, left, right } = this.coeffs;
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) {
      let s = this.bilinear(i / n, j / n);
      for (let k = 0; k < K; k++) {
        const o = k * m;
        s += S[o + i] * (bottom[k] * H1[o + j] + top[k] * H[o + j]) + S[o + j] * (left[k] * H1[o + i] + right[k] * H[o + i]);
      }
      out[j * m + i] = s;
    }
    return out;
  }
}

/** The average of g over the circle of radius R about (x0, y0) (trapezoid rule: exponentially accurate for smooth periodic integrands). */
export function circleAverage(g: (x: number, y: number) => number, x0: number, y0: number, R: number, M = 256): number {
  let s = 0;
  for (let k = 0; k < M; k++) { const a = (2 * Math.PI * k) / M; s += g(x0 + R * Math.cos(a), y0 + R * Math.sin(a)); }
  return s / M;
}

/**
 * The Dirichlet Green's function of the unit square: −∇²G = δ(x − ξ)δ(y − η),
 * G = 0 on the boundary. Single sine series in x; converges exponentially
 * except on the line y = η (where it is slow) and diverges (log) at the source.
 */
export function greenSquare(x: number, y: number, xi: number, eta: number, K = 300): number {
  const lo = Math.min(y, eta), hi = Math.max(y, eta);
  let s = 0;
  for (let m = 1; m <= K; m++) {
    const a = m * Math.PI;
    // sinh(a·lo) sinh(a(1−hi)) / sinh(a), stably
    const e = Math.exp(a * (lo + (1 - hi) - 1)) * (1 - Math.exp(-2 * a * lo)) * (1 - Math.exp(-2 * a * (1 - hi))) / (2 * (1 - Math.exp(-2 * a)));
    if (e < 1e-18 && m > 5) break;
    s += (2 / a) * Math.sin(a * x) * Math.sin(a * xi) * e;
  }
  return s;
}

/**
 * greenSquare on the whole (n+1)² grid of the unit square at once, added into
 * `out` times q (separable in x: a sine table and one row of y-factors per row).
 */
export function greenSquareGrid(n: number, xi: number, eta: number, q: number, out: Float64Array, K = 300): Float64Array {
  const m = n + 1;
  const S = new Float64Array(K * m), E = new Float64Array(K);
  for (let k = 1; k <= K; k++) { const sx = Math.sin(k * Math.PI * xi); for (let i = 0; i < m; i++) S[(k - 1) * m + i] = Math.sin((k * Math.PI * i) / n) * sx; }
  for (let j = 0; j < m; j++) {
    const y = j / n, lo = Math.min(y, eta), hi = Math.max(y, eta);
    let kk = 0;
    for (let k = 1; k <= K; k++) {
      const a = k * Math.PI;
      const e = Math.exp(a * (lo - hi)) * (1 - Math.exp(-2 * a * lo)) * (1 - Math.exp(-2 * a * (1 - hi))) / (2 * (1 - Math.exp(-2 * a)));
      E[k - 1] = (2 / a) * e;
      kk = k;
      if (e < 1e-18 && k > 5) break;
    }
    for (let i = 0; i < m; i++) { let s = 0; for (let k = 0; k < kk; k++) s += S[k * m + i] * E[k]; out[j * m + i] += q * s; }
  }
  return out;
}

// ── special functions ───────────────────────────────────────────────────────

/**
 * Bessel J_m(x), integer m ≥ 0, from J_m(x) = (1/2π)∫₀^{2π} cos(x sin τ − mτ) dτ
 * by the trapezoid rule, which converges exponentially for this periodic
 * integrand: with N > |x| + m + 40 points the error is at rounding level.
 */
export function besselJ(m: number, x: number): number {
  const N = 2 * Math.ceil((Math.abs(x) + m) / 2) + 48;
  let s = 0;
  for (let k = 0; k < N; k++) { const t = (2 * Math.PI * k) / N; s += Math.cos(x * Math.sin(t) - m * t); }
  return s / N;
}

/** The first `count` positive zeros j_{m,1} < j_{m,2} < … of J_m (scan + Brent, ~1e−13). */
export function besselJZeros(m: number, count: number): number[] {
  const out: number[] = [];
  const f = (x: number) => besselJ(m, x);
  let a = m === 0 ? 0.5 : m + 0.5, fa = f(a);
  const step = 0.1;
  while (out.length < count) {
    const b = a + step, fb = f(b);
    if (fa === 0) out.push(a);
    else if (fa * fb < 0) { const r = brent(f, a, b, 1e-14); if (r !== null) out.push(r); }
    a = b; fa = fb;
    if (a > 400) break;
  }
  return out;
}

/** erf(x) to ~1e−15: a positive series for |x| < 3, the continued fraction for erfc beyond. */
export function erf(x: number): number {
  if (x < 0) return -erf(-x);
  if (x < 3) {
    // erf x = (2/√π) e^{−x²} Σ 2ⁿ x^{2n+1} / (1·3·…·(2n+1))
    let term = x, s = x;
    for (let n = 1; n < 200; n++) { term *= (2 * x * x) / (2 * n + 1); s += term; if (term < 1e-17 * s) break; }
    return (2 / Math.sqrt(Math.PI)) * Math.exp(-x * x) * s;
  }
  return 1 - erfc(x);
}
export function erfc(x: number): number {
  if (x < 3) return 1 - erf(x);
  // erfc x = e^{−x²}/√π · 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + 2/(x + …)))))
  let f = x;
  for (let k = 120; k >= 1; k--) f = x + (k / 2) / f;
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
}

// ── random walks and the heat kernel ────────────────────────────────────────

/**
 * The heat kernel for u_t = D u_xx started from δ(x − x0), optionally with a
 * wall at x = a: 'absorbing' (u = 0, an odd image) or 'reflecting' (u_x = 0,
 * an even image). Valid on the side of the wall where x0 lies.
 */
export function heatKernel(x: number, t: number, D: number, x0 = 0, wall: 'none' | 'absorbing' | 'reflecting' = 'none', a = 1): number {
  if (t <= 0) return 0;
  const g = (s: number) => Math.exp(-((x - s) ** 2) / (4 * D * t)) / Math.sqrt(4 * Math.PI * D * t);
  if (wall === 'none') return g(x0);
  const img = 2 * a - x0;
  return wall === 'absorbing' ? g(x0) - g(img) : g(x0) + g(img);
}

/** The probability a walker from x0 has not yet hit an absorbing wall at a by time t: erf(|a − x0| / √(4Dt)). */
export const survival = (t: number, D: number, x0: number, a: number) => (t <= 0 ? 1 : erf(Math.abs(a - x0) / Math.sqrt(4 * D * t)));

// ── stability ───────────────────────────────────────────────────────────────

/**
 * The von Neumann amplification factor for the Fourier mode e^{ijθ} (θ = kΔx).
 * Heat: r = αΔt/Δx². Wave (leapfrog): r is the Courant number C = cΔt/Δx and
 * the result is the larger |G| of the two roots of G² − 2(1 − 2C²sin²(θ/2))G + 1 = 0.
 */
export function amplification(scheme: Scheme1D | 'exact' | 'leapfrog', r: number, theta: number): number {
  const s = Math.sin(theta / 2) ** 2;
  switch (scheme) {
    case 'ftcs': return 1 - 4 * r * s;
    case 'btcs': return 1 / (1 + 4 * r * s);
    case 'cn': return (1 - 2 * r * s) / (1 + 2 * r * s);
    case 'exact': return Math.exp(-r * theta * theta);
    case 'leapfrog': { const b = 1 - 2 * r * r * s; return Math.abs(b) <= 1 ? 1 : Math.abs(b) + Math.sqrt(b * b - 1); }
  }
}

// ── classification ──────────────────────────────────────────────────────────

/** A u_xx + 2B u_xy + C u_yy + (lower order) = 0: the type from the discriminant B² − AC. */
export function classify2(A: number, B: number, C: number, eps = 1e-12): { disc: number; type: 'hyperbolic' | 'parabolic' | 'elliptic' | 'degenerate'; slopes: number[] } {
  const disc = B * B - A * C;
  const scale = Math.max(A * A, B * B, C * C, 1e-300);
  if (A === 0 && B === 0 && C === 0) return { disc, type: 'degenerate', slopes: [] };
  const type = disc > eps * scale ? 'hyperbolic' : disc < -eps * scale ? 'elliptic' : 'parabolic';
  // characteristics: A (dy)² − 2B dx dy + C (dx)² = 0 → dy/dx = (B ± √disc)/A
  const slopes: number[] = [];
  if (type !== 'elliptic') {
    const sq = type === 'parabolic' ? 0 : Math.sqrt(disc);
    if (Math.abs(A) > 1e-12) { slopes.push((B + sq) / A); if (sq) slopes.push((B - sq) / A); }
    else { slopes.push(Infinity); if (Math.abs(B) > 1e-12) slopes.push(C / (2 * B)); }
  }
  return { disc, type, slopes };
}

// ── Sturm–Liouville eigenvalues by shooting ─────────────────────────────────

/** Left: dirichlet X(0)=0, neumann X'(0)=0, robin X'(0) = κX(0). Right: X(L)=0, X'(L)=0, X'(L) + κX(L) = 0. */
export interface SLBC { kind: 'dirichlet' | 'neumann' | 'robin'; kappa?: number }

/**
 * Shoot X'' + λρ(x)X = 0 from the left end with RK4 (`steps` steps) and
 * return the normalized mismatch of the right condition (a number in [−1, 1]
 * that is zero exactly at an eigenvalue) and, if asked, the trajectory.
 */
export function shoot(lambda: number, rho: (x: number) => number, L: number, left: SLBC, right: SLBC, steps = 400, out?: { x: number[]; X: number[] }): number {
  let y = left.kind === 'dirichlet' ? [0, 1] : left.kind === 'neumann' ? [1, 0] : [1, left.kappa ?? 1];
  const f = (x: number, Y: number[]) => [Y[1], -lambda * rho(x) * Y[0]];
  const h = L / steps;
  if (out) { out.x.length = 0; out.X.length = 0; out.x.push(0); out.X.push(y[0]); }
  for (let i = 0; i < steps; i++) {
    y = rk4Step(f, i * h, y, h);
    if (out) { out.x.push((i + 1) * h); out.X.push(y[0]); }
  }
  const k = 1 + Math.abs(lambda) * rho(L);
  const res = right.kind === 'dirichlet' ? y[0] * Math.sqrt(k) : right.kind === 'neumann' ? y[1] : y[1] + (right.kappa ?? 1) * y[0];
  return res / Math.sqrt(k * y[0] * y[0] + y[1] * y[1]);
}

/** Eigenvalues in [lo, hi] by scanning the mismatch for sign changes and refining with Brent. */
export function slEigenvalues(rho: (x: number) => number, L: number, left: SLBC, right: SLBC, lo: number, hi: number, samples = 240, steps = 400): number[] {
  const F = (l: number) => shoot(l, rho, L, left, right, steps);
  const out: number[] = [];
  let a = lo, fa = F(a);
  for (let i = 1; i <= samples; i++) {
    const b = lo + ((hi - lo) * i) / samples, fb = F(b);
    if (fa === 0) out.push(a);
    else if (fa * fb < 0) { const r = brent(F, a, b, 1e-12); if (r !== null) out.push(r); }
    a = b; fa = fb;
  }
  return out;
}

// ── the Schrödinger equation (ħ = m = 1) ────────────────────────────────────

/**
 * iψ_t = −½ψ_xx + V(x)ψ on [x0, x1] with ψ = 0 at the ends, by Crank–Nicolson
 * (unitary: the discrete norm is conserved to rounding).
 */
export class Schrodinger1D {
  readonly n: number; readonly dx: number; readonly x: Float64Array;
  re: Float64Array; im: Float64Array; V: Float64Array;
  t = 0;
  private cr: Float64Array; private ci: Float64Array; private dr: Float64Array; private di: Float64Array;
  constructor(readonly x0: number, readonly x1: number, N: number, V?: (x: number) => number) {
    const n = (this.n = N + 1);
    this.dx = (x1 - x0) / N;
    this.x = new Float64Array(n); this.re = new Float64Array(n); this.im = new Float64Array(n); this.V = new Float64Array(n);
    for (let i = 0; i < n; i++) { this.x[i] = x0 + i * this.dx; this.V[i] = V ? V(this.x[i]) : 0; }
    this.cr = new Float64Array(n); this.ci = new Float64Array(n); this.dr = new Float64Array(n); this.di = new Float64Array(n);
  }
  set(psi: (x: number) => [number, number]) {
    for (let i = 0; i < this.n; i++) { const [a, b] = i === 0 || i === this.n - 1 ? [0, 0] : psi(this.x[i]); this.re[i] = a; this.im[i] = b; }
    this.t = 0;
  }
  step(dt: number) {
    const { n, dx, re, im, V, cr, ci, dr, di } = this;
    const k = dt / (4 * dx * dx);          // off-diagonal of (1 + i dt/2 H) is −ik
    // rhs = (1 − i dt/2 H)ψ: diag 1 − i(2k + dt/2 V), off +ik
    // unknowns 1..n−2 (ends are 0); solve (1 + i dt/2 H)ψ' = rhs with a = c = −ik
    let pr = 0, pi = 0;   // previous c'
    let qr = 0, qi = 0;   // previous d'
    for (let i = 1; i < n - 1; i++) {
      const dg = 2 * k + (dt / 2) * V[i];
      // rhs_i
      const sr = re[i - 1] + re[i + 1], si = im[i - 1] + im[i + 1];
      const Rr = re[i] + dg * im[i] - k * si;
      const Ri = im[i] - dg * re[i] + k * sr;
      // b = 1 + i dg; a = c = −ik. m = b − a·c'_{i−1}
      // a·c' = (−ik)(pr + i pi) = k pi − i k pr
      const mr = 1 - k * pi, mi = dg + k * pr;
      const den = mr * mr + mi * mi;
      // c'_i = c / m = (−ik)/m
      const ncr = (-k * mi) / den, nci = (-k * mr) / den;
      // d'_i = (rhs − a·d'_{i−1}) / m ; a·d' = (−ik)(qr + i qi) = k qi − i k qr
      const ur = Rr - k * qi, ui = Ri + k * qr;
      const ndr = (ur * mr + ui * mi) / den, ndi = (ui * mr - ur * mi) / den;
      cr[i] = ncr; ci[i] = nci; dr[i] = ndr; di[i] = ndi;
      pr = ncr; pi = nci; qr = ndr; qi = ndi;
    }
    let xr = 0, xi = 0;
    for (let i = n - 2; i >= 1; i--) {
      const nr = dr[i] - (cr[i] * xr - ci[i] * xi), ni = di[i] - (cr[i] * xi + ci[i] * xr);
      re[i] = nr; im[i] = ni; xr = nr; xi = ni;
    }
    re[0] = im[0] = re[n - 1] = im[n - 1] = 0;
    this.t += dt;
  }
  norm(): number { let s = 0; for (let i = 0; i < this.n; i++) s += this.re[i] ** 2 + this.im[i] ** 2; return s * this.dx; }
}

/**
 * The free Gaussian packet (ħ = m = 1), exact: initially
 * ψ = (2πσ²)^{−¼} exp(−(x − x0)²/(4σ²) + ik0(x − x0)). Returns [Re ψ, Im ψ].
 * |ψ|² stays Gaussian with σ(t) = σ√(1 + (t/2σ²)²), centred at x0 + k0 t.
 */
export function freePacket(x: number, t: number, x0: number, k0: number, sigma: number): [number, number] {
  // a = 1 + i t/(2σ²)
  const ar = 1, ai = t / (2 * sigma * sigma);
  const am2 = ar * ar + ai * ai;
  // 1/a
  const ir = ar / am2, ii = -ai / am2;
  const X = x - x0 - k0 * t;
  // exponent: −X²/(4σ²) · (1/a) + i k0 (x − x0) − i k0² t/2
  const q = -(X * X) / (4 * sigma * sigma);
  const er = q * ir, ei = q * ii + k0 * (x - x0) - (k0 * k0 * t) / 2;
  // prefactor (2πσ²)^{−¼} a^{−½}
  const mod = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.pow(am2, -0.25);
  const arg = -0.5 * Math.atan2(ai, ar);
  const ex = Math.exp(er);
  return [mod * ex * Math.cos(ei + arg), mod * ex * Math.sin(ei + arg)];
}
