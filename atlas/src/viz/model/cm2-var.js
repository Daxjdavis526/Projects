// The calculus of variations, numerically (PHYS 3550, module M3–M4). DOM-free;
// tested in test/cm2-var.test.mjs.
//
//   Brachistochrone race: a bead released from rest at A = (0, 0) slides
//   without friction to B = (x1, y1), with y measured DOWNWARD. Its speed at
//   depth y is √(2gy), so the time along a path is ∫ ds / √(2gy). Paths are
//   parametrized by s ∈ [0, 1]; the integral is taken on the grid s = u²
//   (which clusters nodes at the start, where the speed is zero) with chord
//   lengths and the speed at each chord's midpoint. That rule is exact for the
//   straight line and second-order otherwise; the tests check the cycloid
//   (θ₁√(a/g)), the line and the quarter circle (a 90° pendulum's quarter
//   period, K(½)√(R/g)) against their closed forms.
//
//   Tautochrone: an upturned cycloid x = a(θ + sin θ), y = a(1 − cos θ) (y up):
//   arc length from the bottom is s = 4a sin(θ/2), so s̈ = −(g/4a)s exactly and
//   every release reaches the bottom after π√(a/g).
//
//   Functional explorer: a true path, a family of variations y + α η_n (η_n
//   vanishes at both ends) and the functional F(α) — length, travel time or
//   the action ∫(T − U)dt — evaluated by the same chord / midpoint rules.

export const G = 9.8;

/* ---------------- the cycloid through A and B ---------------- */

/** (θ − sin θ)/(1 − cos θ): the cycloid's x/y at parameter θ, rising from 0 to ∞ on (0, 2π). */
const ratio = (th) => (th - Math.sin(th)) / (1 - Math.cos(th));

/** The cycloid x = a(θ − sin θ), y = a(1 − cos θ) from (0, 0) through (x1, y1), y down: { a, th1 }. */
export function cycloidThrough(x1, y1) {
  const target = x1 / y1;
  let lo = 1e-9, hi = 2 * Math.PI - 1e-9;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (ratio(m) < target) lo = m; else hi = m;
  }
  const th1 = (lo + hi) / 2;
  return { a: y1 / (1 - Math.cos(th1)), th1 };
}

/** Closed-form times (s). */
export const cycloidTime = (x1, y1, g = G) => { const { a, th1 } = cycloidThrough(x1, y1); return th1 * Math.sqrt(a / g); };
export const lineTime = (x1, y1, g = G) => Math.sqrt((2 * (x1 * x1 + y1 * y1)) / (g * y1));
export const dropTime = (x1, y1, g = G) => Math.sqrt((2 * y1) / g) + x1 / Math.sqrt(2 * g * y1);

/** The circle that leaves A heading straight down (centre on the level of A) and passes through B. */
export function arcThrough(x1, y1) {
  const c = (x1 * x1 + y1 * y1) / (2 * x1);
  return { c, phi1: Math.atan2(y1, c - x1) };
}

export const KINDS = ['line', 'arc', 'cycloid', 'power', 'drop'];

/**
 * A path from A to B as s ↦ [x, y] (y down), s ∈ [0, 1].
 * power: y = y1 (x/x1)^p (p < 1 starts steep). drop: straight down, then level
 * (the bead turns the corner without losing speed — an idealized smooth bend).
 */
export function pathOf(kind, x1, y1, p = 0.5) {
  if (kind === 'line') return (s) => [x1 * s, y1 * s];
  if (kind === 'arc') { const { c, phi1 } = arcThrough(x1, y1); return (s) => [c * (1 - Math.cos(phi1 * s)), c * Math.sin(phi1 * s)]; }
  if (kind === 'cycloid') { const { a, th1 } = cycloidThrough(x1, y1); return (s) => { const th = th1 * s; return [a * (th - Math.sin(th)), a * (1 - Math.cos(th))]; }; }
  if (kind === 'power') return (s) => [x1 * s, y1 * s ** p];
  if (kind === 'drop') { const f = y1 / (x1 + y1); return (s) => (s <= f ? [0, (y1 * s) / f] : [(x1 * (s - f)) / (1 - f), y1]); }
  throw new Error(`unknown path ${kind}`);
}

/**
 * Travel table for a path from rest at its start (depth 0): nodes s_i = (i/n)^q
 * (q = 2 suits a path whose depth grows like s or s² at the start; y ∝ s^p needs q = 2/p),
 * the cumulative time ts[i] (s) and the positions. Total time T = ts[n].
 */
export function travel(path, g = G, n = 3000, q = 2) {
  const xs = new Float64Array(n + 1), ys = new Float64Array(n + 1), ts = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) { const [x, y] = path((i / n) ** q); xs[i] = x; ys[i] = y; }
  for (let i = 0; i < n; i++) {
    const um = (i + 0.5) / n, ym = path(um ** q)[1];
    const ds = Math.hypot(xs[i + 1] - xs[i], ys[i + 1] - ys[i]);
    ts[i + 1] = ts[i] + (ym > 0 ? ds / Math.sqrt(2 * g * ym) : ds > 0 ? Infinity : 0);
  }
  return { xs, ys, ts, T: ts[n] };
}

/** Where a travel table puts the bead at time t: [x, y] (the end once t ≥ T). */
export function positionAt(tab, t) {
  const { xs, ys, ts } = tab, n = ts.length - 1;
  if (t <= 0) return [xs[0], ys[0]];
  if (t >= ts[n]) return [xs[n], ys[n]];
  let lo = 0, hi = n;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ts[m] <= t) lo = m; else hi = m; }
  const f = (t - ts[lo]) / (ts[hi] - ts[lo] || 1);
  return [xs[lo] + f * (xs[hi] - xs[lo]), ys[lo] + f * (ys[hi] - ys[lo])];
}

/** Travel time (s) along one of the named paths. */
export const gridQ = (kind, p = 0.5) => (kind === 'power' ? Math.max(2, 2 / p) : 2);
export const timeOf = (kind, x1, y1, p = 0.5, g = G) => travel(pathOf(kind, x1, y1, p), g, 3000, gridQ(kind, p)).T;

/* ---------------- the tautochrone ---------------- */

/** A bead released at parameter θ0 on the bowl x = a(θ + sin θ), y = a(1 − cos θ): θ(t), exact. */
export function tautoTheta(a, th0, t, g = G) {
  const w = Math.sqrt(g / (4 * a)), s0 = 4 * a * Math.sin(th0 / 2);
  const s = s0 * Math.cos(w * t);
  return 2 * Math.asin(Math.max(-1, Math.min(1, s / (4 * a))));
}
export const tautoTime = (a, g = G) => Math.PI * Math.sqrt(a / g);
export const tautoPoint = (a, th) => [a * (th + Math.sin(th)), a * (1 - Math.cos(th))];

/* ---------------- the functional explorer ---------------- */

/**
 * Presets. Each has a horizontal variable on [0, X], a true path y0(s) (s = x/X),
 * the variation η(n, s) added to it (α η), and a functional of a sampled path.
 *   length   the plane, A = (0, 0) to B = (1, 0.5) m: L = ∫ √(1 + y′²) dx (m)
 *   brach    the cycloid from (0, 0) to (1, 0.6) m, y down: T = ∫ ds/√(2gy) (s); the variation multiplies
 *            the depth by (1 + α sin nπs), so the bead never rises above A
 *   ball     a 0.5 kg ball thrown up and caught after 2 s: S = ∫ (½mẏ² − mgy) dt (J s)
 *   spring   a 1 kg mass on a 4π² N/m spring (period 1 s), at rest at x = 0 at t = 0 and t = T:
 *            S = ∫ (½mẋ² − ½kx²) dt (J s). The true path is to stay put; for T beyond half a
 *            period the first variation LOWERS S — the action is stationary, not least.
 */
export const PRESETS = {
  length: { X: 1, unit: 'm', name: 'length', amax: 0.3, xlabel: 'x (m)', ylabel: 'y (m)', y: [-0.35, 0.9] },
  brach: { X: 1, unit: 's', name: 'time', amax: 0.6, xlabel: 'x (m)', ylabel: 'depth (m)', y: [-0.05, 1.05] },
  ball: { X: 2, unit: 'J s', name: 'action', amax: 3, xlabel: 't (s)', ylabel: 'height (m)', y: [-3.5, 8.5], m: 0.5 },
  spring: { X: 0.7, unit: 'J s', name: 'action', amax: 0.25, xlabel: 't (s)', ylabel: 'x (m)', y: [-0.3, 0.3], m: 1, k: 4 * Math.PI * Math.PI },
};

const BR = { x1: 1, y1: 0.6 };
const brachCyc = () => cycloidThrough(BR.x1, BR.y1);

/** The sampled path for preset `key`, variation mode n, amplitude α, and a base offset β along mode 1. */
export function samplePath(key, n, alpha, beta = 0, opts = {}) {
  const P = PRESETS[key], X = opts.T ?? P.X, N = opts.N || 600;
  const pts = [];
  if (key === 'brach') {
    const { a, th1 } = brachCyc();
    for (let i = 0; i <= N; i++) {
      const s = (i / N) ** 2, th = th1 * s;
      const yc = a * (1 - Math.cos(th));
      pts.push([a * (th - Math.sin(th)), yc * (1 + beta * Math.sin(Math.PI * s) + alpha * Math.sin(n * Math.PI * s))]);
    }
    return pts;
  }
  const y0 = key === 'length' ? (x) => 0.5 * x : key === 'ball' ? (t) => 0.5 * G * t * (X - t) : () => 0;
  for (let i = 0; i <= N; i++) {
    const x = (X * i) / N, s = x / X;
    pts.push([x, y0(x) + beta * Math.sin(Math.PI * s) + alpha * Math.sin(n * Math.PI * s)]);
  }
  return pts;
}

/** The functional's value on a sampled path. */
export function functional(key, pts, opts = {}) {
  const P = PRESETS[key];
  let F = 0;
  if (key === 'brach') {
    // chords between even nodes; the odd node between them (the midpoint in u, where s = u²) gives the depth
    for (let i = 0; i + 2 < pts.length; i += 2) {
      const [x0, y0] = pts[i], [x2, y2] = pts[i + 2], ym = pts[i + 1][1];
      F += ym > 0 ? Math.hypot(x2 - x0, y2 - y0) / Math.sqrt(2 * G * ym) : Infinity;
    }
    return F;
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = x1 - x0, dy = y1 - y0;
    if (key === 'length') F += Math.hypot(dx, dy);
    else if (key === 'ball') {
      const m = P.m, v = dy / dx, ym = (y0 + y1) / 2;
      F += (0.5 * m * v * v - m * G * ym) * dx;
    } else if (key === 'spring') {
      const m = P.m, k = P.k, v = dy / dx, x2 = (y0 * y0 + y0 * y1 + y1 * y1) / 3;
      F += (0.5 * m * v * v - 0.5 * k * x2) * dx;
    }
  }
  return F;
}

/** F(α) for one preset and mode (and base offset β). */
export const F = (key, n, alpha, beta = 0, opts = {}) => functional(key, samplePath(key, n, alpha, beta, opts), opts);

/** Exact action changes, for the tests and for lessons: ΔS = S(α) − S(0). */
export const ballDS = (n, alpha, m = PRESETS.ball.m, T = PRESETS.ball.X) => (m * alpha * alpha * n * n * Math.PI * Math.PI) / (4 * T);
export const springS = (n, alpha, T = PRESETS.spring.X, m = PRESETS.spring.m, k = PRESETS.spring.k) => 0.25 * alpha * alpha * T * (m * (n * Math.PI / T) ** 2 - k);
export const ballS0 = (m = PRESETS.ball.m, T = PRESETS.ball.X) => (-m * G * G * T ** 3) / 24;
