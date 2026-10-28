// First-order ODEs y′ = f(t, y), DOM-free, for sims/de-slopefield.js and
// sims/de-stepper.js:
//   - one-step methods (Euler, improved Euler/Heun, midpoint, classical RK4),
//     with every stage of a step — where each slope is evaluated — exposed so
//     a picture can draw them;
//   - whole runs, global errors at the end of an interval, error tables over
//     halving step sizes and the observed order log₂(E(h)/E(h/2));
//   - slope-field helpers: a solution curve traced across a window with RK4
//     steps that shorten where the curve is steep, and the equilibria of an
//     autonomous equation y′ = g(y) with their stability.
// Tested headlessly: node atlas/test/de-ode.test.mjs

export const METHODS = ['euler', 'heun', 'midpoint', 'rk4'];
export const METHOD_NAMES = { euler: 'Euler', heun: 'Improved Euler', midpoint: 'Midpoint', rk4: 'RK4' };
/** The order p of each method: its global error falls like hᵖ. */
export const ORDER = { euler: 1, heun: 2, midpoint: 2, rk4: 4 };
/** Evaluations of f per step: the cost of one step. */
export const EVALS = { euler: 1, heun: 2, midpoint: 2, rk4: 4 };

/**
 * One step of `method` from (t, y) with step h. Returns
 *   { stages: [{ t, y, k }], slope, y1 }
 * where each stage is a point at which f was evaluated and the slope k found
 * there, `slope` is the weighted slope the step actually uses, and
 * y1 = y + h·slope is the new value at t + h.
 */
export function stages(method, f, t, y, h) {
  if (method === 'euler') {
    const k1 = f(t, y);
    return { stages: [{ t, y, k: k1 }], slope: k1, y1: y + h * k1 };
  }
  if (method === 'heun') {
    // predictor: an Euler step to the far end; corrector: average the two end slopes
    const k1 = f(t, y), yp = y + h * k1, k2 = f(t + h, yp), s = (k1 + k2) / 2;
    return { stages: [{ t, y, k: k1 }, { t: t + h, y: yp, k: k2 }], slope: s, y1: y + h * s };
  }
  if (method === 'midpoint') {
    const k1 = f(t, y), ym = y + (h / 2) * k1, k2 = f(t + h / 2, ym);
    return { stages: [{ t, y, k: k1 }, { t: t + h / 2, y: ym, k: k2 }], slope: k2, y1: y + h * k2 };
  }
  if (method === 'rk4') {
    const k1 = f(t, y);
    const y2 = y + (h / 2) * k1, k2 = f(t + h / 2, y2);
    const y3 = y + (h / 2) * k2, k3 = f(t + h / 2, y3);
    const y4 = y + h * k3, k4 = f(t + h, y4);
    const s = (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    return { stages: [{ t, y, k: k1 }, { t: t + h / 2, y: y2, k: k2 }, { t: t + h / 2, y: y3, k: k3 }, { t: t + h, y: y4, k: k4 }], slope: s, y1: y + h * s };
  }
  throw new Error(`unknown method ${method}`);
}

/** The new value after one step. */
export const step = (method, f, t, y, h) => stages(method, f, t, y, h).y1;

/** n steps of size h from (t0, y0): [[t, y], …], n + 1 points (t computed as t0 + i·h, so it never drifts). */
export function solve(method, f, t0, y0, h, n) {
  const out = [[t0, y0]];
  let y = y0;
  for (let i = 0; i < n; i++) {
    y = step(method, f, t0 + i * h, y, h);
    out.push([t0 + (i + 1) * h, y]);
  }
  return out;
}

/** The value at T after n equal steps from (t0, y0). */
export function endValue(method, f, t0, y0, T, n) {
  const h = (T - t0) / n;
  let y = y0;
  for (let i = 0; i < n; i++) y = step(method, f, t0 + i * h, y, h);
  return y;
}

/**
 * Global errors at T for step counts n = n0, 2n0, 4n0, …: rows { n, h, y, error }
 * with error = y_n − exact (signed). `exact` is the true y(T).
 */
export function errorTable(method, f, t0, y0, T, exact, { n0 = 2, levels = 9 } = {}) {
  const rows = [];
  for (let k = 0, n = n0; k < levels; k++, n *= 2) {
    const y = endValue(method, f, t0, y0, T, n);
    rows.push({ n, h: (T - t0) / n, y, error: y - exact });
  }
  return rows;
}

/** Observed order from two errors at h and h/2: log₂ |E(h)/E(h/2)|. */
export const observedOrder = (eh, eh2) => Math.log2(Math.abs(eh / eh2));

/** A reference value of y(T) by RK4 with many small steps (for when no exact solution is given). */
export const reference = (f, t0, y0, T, n = 4096) => endValue('rk4', f, t0, y0, T, n);

/**
 * A solution curve of y′ = f(t, y) through (t0, y0), traced forward and
 * backward across the window [ta, tb] × [ya, yb] by RK4 steps whose length
 * (measured in window-scaled units) stays about 1/res of the window, so steep
 * stretches stay smooth. A branch stops at the window's left or right edge,
 * when it leaves the window vertically by more than `margin` of its height,
 * when f becomes undefined, or after maxSteps steps. Returns [[t, y], …] in
 * increasing t.
 */
export function traceCurve(f, t0, y0, [ta, tb], [ya, yb], { res = 360, margin = 0.6, maxSteps = 5000 } = {}) {
  const sx = tb - ta, sy = yb - ya;
  const base = sx / res;
  const branch = (dir) => {
    const pts = [];
    let t = t0, y = y0;
    for (let i = 0; i < maxSteps; i++) {
      if (dir > 0 ? t >= tb : t <= ta) break;
      const m = f(t, y);
      if (!Number.isFinite(m)) break;
      let h = (dir * base) / Math.hypot(1, (m * sx) / sy);
      if (dir > 0 && t + h > tb) h = tb - t;
      if (dir < 0 && t + h < ta) h = ta - t;
      if (!(Math.abs(h) > 1e-14 * sx)) break;
      const y1 = step('rk4', f, t, y, h);
      if (!Number.isFinite(y1)) break;
      t += h; y = y1;
      pts.push([t, y]);
      if (y > yb + margin * sy || y < ya - margin * sy) break;
    }
    return pts;
  };
  const fwd = branch(1), back = branch(-1);
  return [...back.reverse(), [t0, y0], ...fwd];
}

/**
 * Equilibria of an autonomous equation y′ = g(y) in [ya, yb]: the zeros of g,
 * found by bisection where g changes sign and by a golden-section search where
 * |g| dips to a touching zero (a double root such as (y − 1)²). Each comes with
 * its stability, read from the sign of g just below and just above it:
 *   'stable'   — g > 0 below, g < 0 above: nearby solutions approach it;
 *   'unstable' — g < 0 below, g > 0 above: nearby solutions leave it;
 *   'semi'     — the same sign on both sides: approached from one side only.
 * Returns [{ y, kind, below, above }] sorted by y (below/above are the signs).
 */
export function equilibria(g, ya, yb, n = 800) {
  const ys = [], gs = [];
  for (let i = 0; i <= n; i++) { const y = ya + ((yb - ya) * i) / n; ys.push(y); gs.push(g(y)); }
  const big = Math.max(1e-300, ...gs.filter(Number.isFinite).map(Math.abs));
  const roots = [];
  const add = (y) => { if (!roots.some((r) => Math.abs(r - y) < 1e-6 * (yb - ya))) roots.push(y); };
  for (let i = 0; i < n; i++) {
    const a = gs[i], b = gs[i + 1];
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    if (a === 0) { add(ys[i]); continue; }
    if (a * b < 0) add(bisect(g, ys[i], ys[i + 1]));
  }
  if (gs[n] === 0) add(ys[n]);
  // touching zeros: local minima of |g| that are (numerically) zero
  for (let i = 1; i < n; i++) {
    const a = Math.abs(gs[i - 1]), b = Math.abs(gs[i]), c = Math.abs(gs[i + 1]);
    if (!(b <= a && b <= c) || !(Number.isFinite(a) && Number.isFinite(c))) continue;
    if (gs[i - 1] * gs[i + 1] < 0) continue;              // a sign change: already found
    const y = golden((u) => Math.abs(g(u)), ys[i - 1], ys[i + 1]);
    if (Math.abs(g(y)) <= 1e-9 * big) add(y);
  }
  roots.sort((p, q) => p - q);
  const d = 1e-5 * (yb - ya);
  return roots.map((y) => {
    const below = Math.sign(g(y - d)), above = Math.sign(g(y + d));
    const kind = below > 0 && above < 0 ? 'stable' : below < 0 && above > 0 ? 'unstable' : 'semi';
    return { y, kind, below, above };
  });
}

function bisect(g, a, b) {
  let fa = g(a);
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2, fm = g(m);
    if (fm === 0 || b - a < 1e-14 * Math.max(1, Math.abs(m))) return m;
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m;
  }
  return (a + b) / 2;
}

function golden(F, a, b) {
  const r = (Math.sqrt(5) - 1) / 2;
  let c = b - r * (b - a), d = a + r * (b - a);
  for (let i = 0; i < 120 && b - a > 1e-15 * Math.max(1, Math.abs(a)); i++) {
    if (F(c) < F(d)) { b = d; d = c; c = b - r * (b - a); } else { a = c; c = d; d = a + r * (b - a); }
  }
  return (a + b) / 2;
}
