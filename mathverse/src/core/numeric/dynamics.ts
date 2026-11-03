// Closed-form solutions and small numerical tools for ordinary differential
// equations: constant-coefficient second-order equations (homogeneous solution
// in a form that stays accurate through critical damping, particular solutions
// by undetermined coefficients, the steady-state response), 2×2 linear systems
// (matrix exponential, classification on the trace–determinant plane),
// linear first-order equations with exact solutions, the pendulum period
// (complete elliptic integral by the AGM), equilibria of planar systems by
// Newton's method, and convergence-order fitting for numerical methods.
// DOM-free; tested in tests/dynamics.test.ts.

// ── cosh/cos and sinh/sin through zero ────────────────────────────────────
// For q = disc/4 the pair C(t), S(t) solves C' = q S, S' = C with C(0) = 1, S(0) = 0:
//   q > 0: C = cosh(√q t), S = sinh(√q t)/√q;  q < 0: C = cos(√−q t), S = sin(√−q t)/√−q;
//   q = 0: C = 1, S = t. Near q = 0 a series keeps full accuracy (no cancellation).
export function CS(q: number, t: number): [number, number] {
  const z = q * t * t;
  if (Math.abs(z) < 1e-6) {
    // C = Σ zᵏ/(2k)!, S = t Σ zᵏ/(2k+1)!  (four terms: error ~ z⁴ < 1e-24)
    return [1 + z / 2 + (z * z) / 24 + (z * z * z) / 720, t * (1 + z / 6 + (z * z) / 120 + (z * z * z) / 5040)];
  }
  if (q > 0) { const s = Math.sqrt(q); return [Math.cosh(s * t), Math.sinh(s * t) / s]; }
  const s = Math.sqrt(-q);
  return [Math.cos(s * t), Math.sin(s * t) / s];
}

export interface Root { re: number; im: number }

export type Damping = 'overdamped' | 'critically damped' | 'underdamped' | 'undamped' | 'negatively damped (growing)' | 'unstable (a positive real root)' | 'degenerate';

/** Roots of r² + b r + c = 0, as complex numbers (a conjugate pair when b² < 4c). */
export function charRoots(b: number, c: number): Root[] {
  const q = (b * b) / 4 - c, a = -b / 2;
  if (q >= 0) { const s = Math.sqrt(q); return [{ re: a + s, im: 0 }, { re: a - s, im: 0 }]; }
  const s = Math.sqrt(-q);
  return [{ re: a, im: s }, { re: a, im: -s }];
}

/** The regime of y″ + b y′ + c y = 0, with a relative tolerance for "exactly critical". */
export function dampingKind(b: number, c: number, tol = 1e-9): Damping {
  const q = (b * b) / 4 - c, scale = Math.max(1e-300, (b * b) / 4 + Math.abs(c));
  if (Math.abs(b) < tol && Math.abs(c) < tol) return 'degenerate';
  if (c < -tol * scale || (Math.abs(c) <= tol * scale && b < 0)) return 'unstable (a positive real root)';
  if (Math.abs(b) <= tol * Math.max(1, Math.sqrt(Math.abs(c)))) return 'undamped';
  if (b < 0) return 'negatively damped (growing)';
  if (Math.abs(q) <= tol * scale) return 'critically damped';
  return q > 0 ? 'overdamped' : 'underdamped';
}

/**
 * The solution of y″ + b y′ + c y = 0 with y(0) = y0, y′(0) = v0, exactly:
 *   y = e^{αt} [ y0 C(t) + (v0 − α y0) S(t) ],  α = −b/2,  q = b²/4 − c,
 * which is the over-, critically or under-damped formula as q > 0, = 0, < 0.
 */
export function homog2(b: number, c: number, y0: number, v0: number): { y: (t: number) => number; dy: (t: number) => number } {
  const al = -b / 2, q = (b * b) / 4 - c, B = v0 - al * y0;
  const y = (t: number) => { const [C, S] = CS(q, t); return Math.exp(al * t) * (y0 * C + B * S); };
  const dy = (t: number) => { const [C, S] = CS(q, t); const e = Math.exp(al * t); return al * e * (y0 * C + B * S) + e * (y0 * q * S + B * C); };
  return { y, dy };
}

/** A TeX formula for the general solution of y″ + b y′ + c y = 0 with the numbers filled in. */
export function homog2TeX(b: number, c: number, y0: number, v0: number, f = (v: number) => String(+v.toPrecision(4))): string {
  const al = -b / 2, q = (b * b) / 4 - c, scale = (b * b) / 4 + Math.abs(c);
  const ex = (r: number) => (Math.abs(r) < 1e-12 ? '' : `e^{${f(r)}t}`);
  if (Math.abs(q) <= 1e-9 * Math.max(scale, 1e-300)) {
    return `y = (${f(y0)} ${sgn(v0 - al * y0, f)}\\,t)\\,${ex(al) || '1'}`;
  }
  if (q > 0) {
    const s = Math.sqrt(q), r1 = al + s, r2 = al - s;
    const C1 = (v0 - r2 * y0) / (r1 - r2), C2 = (r1 * y0 - v0) / (r1 - r2);
    const term = (r: number) => (ex(r) ? `\\,${ex(r)}` : '');
    return `y = ${f(C1)}${term(r1)} ${sgn(C2, f)}${term(r2)}`;
  }
  const be = Math.sqrt(-q), C2 = (v0 - al * y0) / be;
  return `y = ${ex(al)}\\big(${f(y0)}\\cos ${f(be)}t ${sgn(C2, f)}\\sin ${f(be)}t\\big)`;
}

const sgn = (v: number, f: (v: number) => string) => (v < 0 ? `- ${f(-v)}` : `+ ${f(v)}`);

// ── particular solutions (undetermined coefficients) ──────────────────────
export type Forcing =
  | { kind: 'const'; A: number }
  | { kind: 'exp'; A: number; a: number }
  | { kind: 'cos'; A: number; w: number }
  | { kind: 'lin'; A: number };

export interface Particular {
  yp: (t: number) => number;
  dyp: (t: number) => number;
  /** the trial form (TeX) and the solved particular solution (TeX) */
  guess: string;
  tex: string;
  /** 0 = ordinary; 1 or 2 = the forcing solves the homogeneous equation (multiplied by t or t²) */
  resonance: number;
}

/** A particular solution of y″ + b y′ + c y = g(t) for the forcings above (exact). */
export function particular2(b: number, c: number, g: Forcing, f = (v: number) => String(+v.toPrecision(4))): Particular {
  const tiny = (v: number, s = 1) => Math.abs(v) <= 1e-12 * Math.max(1, s);
  if (g.kind === 'const') return particular2(b, c, { kind: 'exp', A: g.A, a: 0 }, f);
  if (g.kind === 'exp') {
    const { A, a } = g, P = a * a + b * a + c, dP = 2 * a + b;
    const E = (t: number) => Math.exp(a * t);
    const eTeX = a === 0 ? '' : `e^{${f(a)}t}`;
    if (!tiny(P, a * a + Math.abs(b * a) + Math.abs(c))) {
      const K = A / P;
      return { yp: (t) => K * E(t), dyp: (t) => K * a * E(t), guess: `y_p = K${eTeX}`, tex: `y_p = ${f(K)}${eTeX}`, resonance: 0 };
    }
    if (!tiny(dP, Math.abs(a) + Math.abs(b))) {
      const K = A / dP;
      return { yp: (t) => K * t * E(t), dyp: (t) => K * (1 + a * t) * E(t), guess: `y_p = K\\,t${eTeX}`, tex: `y_p = ${f(K)}\\,t${eTeX}`, resonance: 1 };
    }
    const K = A / 2;
    return { yp: (t) => K * t * t * E(t), dyp: (t) => K * (2 * t + a * t * t) * E(t), guess: `y_p = K\\,t^2${eTeX}`, tex: `y_p = ${f(K)}\\,t^2${eTeX}`, resonance: 2 };
  }
  if (g.kind === 'cos') {
    const { A, w } = g;
    if (w === 0) return particular2(b, c, { kind: 'exp', A, a: 0 }, f);
    const re = c - w * w, im = b * w, m2 = re * re + im * im;
    if (!tiny(Math.sqrt(m2), w * w + Math.abs(c))) {
      const P = (A * re) / m2, Q = (A * im) / m2;   // y_p = P cos ωt + Q sin ωt
      return {
        yp: (t) => P * Math.cos(w * t) + Q * Math.sin(w * t),
        dyp: (t) => w * (-P * Math.sin(w * t) + Q * Math.cos(w * t)),
        guess: `y_p = P\\cos ${f(w)}t + Q\\sin ${f(w)}t`, tex: `y_p = ${f(P)}\\cos ${f(w)}t ${sgn(Q, f)}\\sin ${f(w)}t`, resonance: 0,
      };
    }
    // b = 0, c = ω²: pure resonance, y_p = A t sin(ωt) / (2ω)
    const K = A / (2 * w);
    return { yp: (t) => K * t * Math.sin(w * t), dyp: (t) => K * (Math.sin(w * t) + w * t * Math.cos(w * t)), guess: `y_p = t\\,(P\\cos ${f(w)}t + Q\\sin ${f(w)}t)`, tex: `y_p = ${f(K)}\\,t\\sin ${f(w)}t`, resonance: 1 };
  }
  // g = A t
  const { A } = g;
  if (!tiny(c, b * b)) {
    const p1 = A / c, p0 = (-A * b) / (c * c);
    return { yp: (t) => p1 * t + p0, dyp: () => p1, guess: 'y_p = P t + Q', tex: `y_p = ${f(p1)}\\,t ${sgn(p0, f)}`, resonance: 0 };
  }
  if (!tiny(b)) {
    const p2 = A / (2 * b), p1 = -A / (b * b);
    return { yp: (t) => p2 * t * t + p1 * t, dyp: (t) => 2 * p2 * t + p1, guess: 'y_p = t\\,(P t + Q)', tex: `y_p = ${f(p2)}\\,t^2 ${sgn(p1, f)}\\,t`, resonance: 1 };
  }
  return { yp: (t) => (A * t * t * t) / 6, dyp: (t) => (A * t * t) / 2, guess: 'y_p = t^2 (P t + Q)', tex: `y_p = ${f(A / 6)}\\,t^3`, resonance: 2 };
}

/** The forcing function itself. */
export function forcingFn(g: Forcing): (t: number) => number {
  switch (g.kind) {
    case 'const': return () => g.A;
    case 'exp': return (t) => g.A * Math.exp(g.a * t);
    case 'cos': return (t) => g.A * Math.cos(g.w * t);
    case 'lin': return (t) => g.A * t;
  }
}

/** y″ + b y′ + c y = g, y(0) = y0, y′(0) = v0: the exact solution y = y_p + y_h. */
export function solveLinear2(b: number, c: number, g: Forcing, y0: number, v0: number) {
  const p = particular2(b, c, g);
  const h = homog2(b, c, y0 - p.yp(0), v0 - p.dyp(0));
  return { y: (t: number) => p.yp(t) + h.y(t), dy: (t: number) => p.dyp(t) + h.dy(t), yh: h.y, yp: p.yp, particular: p };
}

/** Steady-state amplitude and phase lag of x″ + 2ζω₀x′ + ω₀²x = F cos ωt. */
export function response(w0: number, zeta: number, F: number, w: number): { amp: number; phase: number } {
  const re = w0 * w0 - w * w, im = 2 * zeta * w0 * w;
  return { amp: F / Math.hypot(re, im), phase: Math.atan2(im, re) };
}

/** The frequency of maximum amplitude: ω₀√(1 − 2ζ²) for ζ < 1/√2, otherwise 0. */
export const resonantFrequency = (w0: number, zeta: number) => (zeta < Math.SQRT1_2 ? w0 * Math.sqrt(1 - 2 * zeta * zeta) : 0);

// ── 2×2 linear systems x′ = A x ───────────────────────────────────────────
export type M2 = [number, number, number, number];   // [a, b, c, d] = [[a, b], [c, d]]

/** e^{At} for a 2×2 matrix, exactly: e^{τt/2} [C(t) I + S(t) (A − τ/2 I)], q = τ²/4 − Δ. */
export function expm2(A: M2, t: number): M2 {
  const [a, b, c, d] = A, tau = a + d, D = a * d - b * c, q = (tau * tau) / 4 - D;
  const [C, S] = CS(q, t), e = Math.exp((tau / 2) * t);
  return [e * (C + S * (a - tau / 2)), e * S * b, e * S * c, e * (C + S * (d - tau / 2))];
}

export function apply2(M: M2, x: number, y: number): [number, number] { return [M[0] * x + M[1] * y, M[2] * x + M[3] * y]; }

export type Portrait = 'saddle' | 'stable node' | 'unstable node' | 'stable spiral' | 'unstable spiral' | 'center' | 'stable star / degenerate node' | 'unstable star / degenerate node' | 'line of equilibria (stable)' | 'line of equilibria (unstable)' | 'uniform motion (A has a zero eigenvalue twice)' | 'every point is an equilibrium';

/** The phase portrait type of x′ = A x from the trace and determinant (with tolerance). */
export function classify2(tau: number, D: number, tol = 1e-9, A?: M2): Portrait {
  const disc = (tau * tau) / 4 - D, s = Math.max(1, Math.abs(tau), Math.abs(D));
  if (Math.abs(D) <= tol * s) {
    if (Math.abs(tau) <= tol * s) return A && A.every((v) => Math.abs(v) <= tol) ? 'every point is an equilibrium' : 'uniform motion (A has a zero eigenvalue twice)';
    return tau < 0 ? 'line of equilibria (stable)' : 'line of equilibria (unstable)';
  }
  if (D < 0) return 'saddle';
  if (Math.abs(tau) <= tol * s) return 'center';
  if (Math.abs(disc) <= tol * s) return tau < 0 ? 'stable star / degenerate node' : 'unstable star / degenerate node';
  if (disc > 0) return tau < 0 ? 'stable node' : 'unstable node';
  return tau < 0 ? 'stable spiral' : 'unstable spiral';
}

/** Eigenvalues of a 2×2 matrix (complex pair when the discriminant is negative), and real eigenvectors when they exist. */
export function eig2(A: M2): { values: Root[]; vectors: ([number, number] | null)[] } {
  const [a, b, c, d] = A, tau = a + d, D = a * d - b * c, q = (tau * tau) / 4 - D;
  if (q < 0) { const s = Math.sqrt(-q); return { values: [{ re: tau / 2, im: s }, { re: tau / 2, im: -s }], vectors: [null, null] }; }
  const s = Math.sqrt(q), ls = [tau / 2 + s, tau / 2 - s];
  const vec = (l: number): [number, number] | null => {
    // (A − λI) v = 0: use the larger row
    const r1: [number, number] = [a - l, b], r2: [number, number] = [c, d - l];
    const r = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
    const n = Math.hypot(...r);
    if (n < 1e-12) return null;              // A = λI: every vector
    return [-r[1] / n, r[0] / n];
  };
  return { values: ls.map((l) => ({ re: l, im: 0 })), vectors: ls.map(vec) };
}

/**
 * Re-shape a matrix to a new trace and determinant while keeping its "shape":
 * A = τ/2 I + M with M = [[p, r+e], [r−e, −p]], M² = (p² + r² − e²) I. The angle
 * of (p, r) and the rotation part e are kept (e grows only if it must, for a
 * spiral). `phi` remembers the angle when M passes through zero.
 */
export function matrixFromTraceDet(tau: number, D: number, shape: { phi: number; e: number }): M2 {
  const disc = (tau * tau) / 4 - D;
  let e = shape.e;
  if (disc + e * e < 0) e = (e < 0 ? -1 : 1) * Math.sqrt(-disc);
  const R = Math.sqrt(Math.max(0, disc + e * e));
  const p = R * Math.cos(shape.phi), r = R * Math.sin(shape.phi);
  return [tau / 2 + p, r + e, r - e, tau / 2 - p];
}

/** The shape (angle φ of the symmetric traceless part and rotation e) of a matrix. */
export function matrixShape(A: M2, fallbackPhi = 0): { phi: number; e: number } {
  const [a, b, c, d] = A, p = (a - d) / 2, r = (b + c) / 2, e = (b - c) / 2;
  return { phi: Math.hypot(p, r) > 1e-9 ? Math.atan2(r, p) : fallbackPhi, e };
}

// ── linear first-order equations y′ + k y = q(t) with exact solutions ─────
export type Linear1 = 'const' | 'exp' | 'sin' | 'ramp' | 'gauss';

/**
 * Exact solution of y′ + k y = q(t), y(0) = y0, by the integrating factor μ = e^{kt}:
 * (μy)′ = μ q  ⇒  y = e^{−kt} (y0 + ∫₀ᵗ e^{ks} q(s) ds).
 * 'gauss' is the variable-coefficient case y′ + 2k t y = 2k t A (μ = e^{k t²}).
 */
export function linear1(kind: Linear1, k: number, A: number, w: number, y0: number): { y: (t: number) => number; q: (t: number) => number; p: (t: number) => number; mu: (t: number) => number; tex: string; muTeX: string } {
  const f = (v: number) => String(+v.toPrecision(4));
  const E = (t: number) => Math.exp(-k * t);
  const mu = (t: number) => Math.exp(k * t);
  const p = () => k;
  switch (kind) {
    case 'const': {
      // y = A/k + (y0 − A/k) e^{−kt};  k = 0: y = y0 + A t
      if (Math.abs(k) < 1e-12) return { y: (t) => y0 + A * t, q: () => A, p, mu, tex: `y = ${f(y0)} + ${f(A)}t`, muTeX: '\\mu = 1' };
      const s = A / k;
      return { y: (t) => s + (y0 - s) * E(t), q: () => A, p, mu, tex: `y = ${f(s)} ${sgn(y0 - s, f)}\\,e^{-${f(k)}t}`, muTeX: `\\mu = e^{${f(k)}t}` };
    }
    case 'exp': {
      // q = A e^{−w t}
      const q = (t: number) => A * Math.exp(-w * t);
      if (Math.abs(k - w) < 1e-12) return { y: (t) => (y0 + A * t) * E(t), q, p, mu, tex: `y = (${f(y0)} + ${f(A)}t)\\,e^{-${f(k)}t}`, muTeX: `\\mu = e^{${f(k)}t}` };
      const K = A / (k - w);
      return { y: (t) => K * Math.exp(-w * t) + (y0 - K) * E(t), q, p, mu, tex: `y = ${f(K)}e^{-${f(w)}t} ${sgn(y0 - K, f)}\\,e^{-${f(k)}t}`, muTeX: `\\mu = e^{${f(k)}t}` };
    }
    case 'sin': {
      // y_p = A (k sin ωt − ω cos ωt)/(k² + ω²)
      const m = k * k + w * w;
      if (m < 1e-300) return { y: (t) => y0, q: () => 0, p, mu, tex: `y = ${f(y0)}`, muTeX: '\\mu = 1' };
      const P = (A * k) / m, Q = (-A * w) / m, C = y0 - Q;
      return { y: (t) => P * Math.sin(w * t) + Q * Math.cos(w * t) + C * E(t), q: (t) => A * Math.sin(w * t), p, mu, tex: `y = ${f(P)}\\sin ${f(w)}t ${sgn(Q, f)}\\cos ${f(w)}t ${sgn(C, f)}\\,e^{-${f(k)}t}`, muTeX: `\\mu = e^{${f(k)}t}` };
    }
    case 'ramp': {
      // q = A t: y_p = A (t/k − 1/k²)
      if (Math.abs(k) < 1e-12) return { y: (t) => y0 + (A * t * t) / 2, q: (t) => A * t, p, mu, tex: `y = ${f(y0)} + ${f(A / 2)}t^2`, muTeX: '\\mu = 1' };
      const a1 = A / k, a0 = -A / (k * k), C = y0 - a0;
      return { y: (t) => a1 * t + a0 + C * E(t), q: (t) => A * t, p, mu, tex: `y = ${f(a1)}t ${sgn(a0, f)} ${sgn(C, f)}\\,e^{-${f(k)}t}`, muTeX: `\\mu = e^{${f(k)}t}` };
    }
    case 'gauss': {
      // y′ + 2k t y = 2k t A: μ = e^{k t²}, y = A + (y0 − A) e^{−k t²}
      return { y: (t) => A + (y0 - A) * Math.exp(-k * t * t), q: (t) => 2 * k * t * A, p: (t) => 2 * k * t, mu: (t) => Math.exp(k * t * t), tex: `y = ${f(A)} ${sgn(y0 - A, f)}\\,e^{-${f(k)}t^2}`, muTeX: `\\mu = e^{${f(k)}t^2}` };
    }
  }
}

// ── the pendulum ──────────────────────────────────────────────────────────
/** Complete elliptic integral of the first kind K(m), m = k², by the arithmetic–geometric mean (exact to rounding). */
export function ellipticK(m: number): number {
  if (m >= 1) return Infinity;
  let a = 1, g = Math.sqrt(1 - m);
  for (let i = 0; i < 40 && Math.abs(a - g) > 1e-16 * a; i++) { const an = (a + g) / 2; g = Math.sqrt(a * g); a = an; }
  return Math.PI / (2 * a);
}

/** Period of the undamped pendulum θ″ = −ω₀² sin θ released from rest at amplitude θ₀ (|θ₀| < π). */
export const pendulumPeriod = (w0: number, theta0: number) => (4 * ellipticK(Math.sin(theta0 / 2) ** 2)) / w0;

// ── equilibria of planar systems ──────────────────────────────────────────
type F2 = (x: number, y: number) => [number, number];
type J2 = (x: number, y: number) => M2;

/** Zeros of F in a box: Newton's method from a grid of seeds, de-duplicated. */
export function equilibria(F: F2, J: J2, box: { x: [number, number]; y: [number, number] }, n = 14): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const sx = box.x[1] - box.x[0], sy = box.y[1] - box.y[0], tol = 1e-3 * Math.max(sx, sy);
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
    let x = box.x[0] + (sx * i) / n, y = box.y[0] + (sy * j) / n;
    let ok = false;
    for (let it = 0; it < 50; it++) {
      const [f, g] = F(x, y);
      if (!Number.isFinite(f) || !Number.isFinite(g)) break;
      if (Math.hypot(f, g) < 1e-12) { ok = true; break; }
      const [a, b, c, d] = J(x, y), D = a * d - b * c;
      if (!Number.isFinite(D) || Math.abs(D) < 1e-14) break;
      const dx = (d * f - b * g) / D, dy = (-c * f + a * g) / D;
      x -= dx; y -= dy;
      if (Math.hypot(dx, dy) < 1e-13 * Math.max(1, Math.hypot(x, y))) { const [f2, g2] = F(x, y); ok = Math.hypot(f2, g2) < 1e-9; break; }
    }
    if (!ok || x < box.x[0] - 1e-9 || x > box.x[1] + 1e-9 || y < box.y[0] - 1e-9 || y > box.y[1] + 1e-9) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.y - y) < tol)) continue;
    out.push({ x: Math.abs(x) < 1e-12 ? 0 : x, y: Math.abs(y) < 1e-12 ? 0 : y });
  }
  return out;
}

// ── convergence orders ────────────────────────────────────────────────────
/** Least-squares slope of log(err) against log(h): the observed order of a method. */
export function fitOrder(hs: number[], errs: number[]): number {
  const pts = hs.map((h, i) => [Math.log(h), Math.log(errs[i])]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (pts.length < 2) return NaN;
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length, my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let num = 0, den = 0;
  for (const [a, b] of pts) { num += (a - mx) * (b - my); den += (a - mx) ** 2; }
  return num / den;
}
