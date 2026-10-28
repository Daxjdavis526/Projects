// The planar-systems model behind sims/de-plane.js and sims/de-tracedet.js,
// DOM-free: the eigenvalues, real eigenvectors and type of a 2×2 matrix —
// every region and every borderline case of the trace–determinant map —
// the closed form of e^{At} (Cayley–Hamilton), trajectories of
// x′ = f(x, y) traced by RK4 with steps of nearly equal length on screen,
// and equilibria found by Newton's method from a grid of starts and typed by
// their Jacobian. Tested headlessly in test/de-plane.test.mjs.

/** Largest entry of [[a, b], [c, d]] in size (never 0, so it can scale tolerances). */
const sizeOf = (a, b, c, d) => Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 1e-300);

/**
 * Eigen-structure of A = [[a, b], [c, d]]: trace τ, determinant Δ, discriminant
 * τ² − 4Δ, the two eigenvalues as { re, im } (λ₁ ≥ λ₂ when real), and the
 * real eigenvector directions [{ lambda, dir }] (unit vectors; none when the
 * eigenvalues are complex, one when a repeated eigenvalue is defective, and
 * 'all' when A is a multiple of I).
 */
export function eig2(a, b, c, d, eps = 1e-9) {
  const tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
  const size = sizeOf(a, b, c, d);
  const flat = Math.abs(disc) <= eps * size * size;
  let values;
  if (disc > 0 && !flat) { const r = Math.sqrt(disc); values = [{ re: (tr + r) / 2, im: 0 }, { re: (tr - r) / 2, im: 0 }]; }
  else if (flat) values = [{ re: tr / 2, im: 0 }, { re: tr / 2, im: 0 }];
  else { const w = Math.sqrt(-disc) / 2; values = [{ re: tr / 2, im: w }, { re: tr / 2, im: -w }]; }
  let vectors = [];
  if (Math.abs(b) <= eps * size && Math.abs(c) <= eps * size && Math.abs(a - d) <= eps * size) vectors = 'all';
  else if (values[0].im === 0) {
    const lams = flat ? [tr / 2] : [values[0].re, values[1].re];
    for (const L of lams) {
      // (A − λI)v = 0: v is perpendicular to the larger row of A − λI
      const r1 = [a - L, b], r2 = [c, d - L];
      const row = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
      const n = Math.hypot(row[0], row[1]);
      if (n <= eps * size) continue;
      vectors.push({ lambda: L, dir: [-row[1] / n, row[0] / n] });
    }
  }
  return { tr, det, disc, values, vectors };
}

/**
 * The type of the equilibrium at the origin of x′ = Ax, A = [[a, b], [c, d]]:
 * { kind, stability, name, turn } with
 *   kind: 'saddle' | 'node' | 'spiral' | 'centre' | 'degenerate' (a repeated,
 *         defective eigenvalue) | 'star' (A = λI) | 'line' (Δ = 0: a whole line
 *         of equilibria) | 'zero' (A = 0: every point is an equilibrium);
 *   stability: 'stable' | 'unstable' | 'neutral';
 *   turn: 'ccw' | 'cw' for spirals and centres (the sign of c), else null.
 * Borderline cases are judged with a tolerance relative to the entries.
 */
export function classify2(a, b, c, d, eps = 1e-9) {
  const { tr, det, disc } = eig2(a, b, c, d, eps);
  const size = sizeOf(a, b, c, d), zero = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d)) === 0;
  const st = Math.abs(tr) <= eps * size ? 'neutral' : tr < 0 ? 'stable' : 'unstable';
  const word = st === 'stable' ? 'stable ' : st === 'unstable' ? 'unstable ' : '';
  const out = (kind, stability, name, turn = null) => ({ kind, stability, name, turn, tr, det, disc });
  if (zero) return out('zero', 'neutral', 'every point an equilibrium');
  if (Math.abs(det) <= eps * size * size) return out('line', st, st === 'neutral' ? 'line of equilibria (shear flow)' : `line of equilibria (${st === 'stable' ? 'attracting' : 'repelling'})`);
  if (det < 0) return out('saddle', 'unstable', 'saddle');
  if (Math.abs(disc) <= eps * size * size) {
    const star = Math.abs(b) <= eps * size && Math.abs(c) <= eps * size;
    return out(star ? 'star' : 'degenerate', st, `${word}${star ? 'star' : 'degenerate node'}`);
  }
  if (disc > 0) return out('node', st, `${word}node`);
  const turn = c > 0 ? 'ccw' : 'cw';
  if (st === 'neutral') return out('centre', 'neutral', 'centre', turn);
  return out('spiral', st, `${word}spiral`, turn);
}

/** The kind of system at (τ, Δ) on the trace–determinant map, with the representative matrix of companion form [[0, 1], [−Δ, τ]]. */
export const classifyTD = (tau, Delta, eps) => classify2(0, 1, -Delta, tau, eps);

/**
 * e^{At} for A = [[a, b], [c, d]] in closed form. With m = τ/2 and
 * B = A − mI, Cayley–Hamilton gives B² = (m² − Δ)I = s²I, so
 * e^{At} = e^{mt}[cosh(st) I + (sinh(st)/s) B] — with cos and sin when s² < 0.
 */
export function expm2(a, b, c, d, t) {
  const m = (a + d) / 2, s2 = m * m - (a * d - b * c);
  const x = s2 * t * t;
  let C, S;
  if (Math.abs(x) < 1e-8) { C = 1 + x / 2; S = t * (1 + x / 6); }
  else if (s2 > 0) { const s = Math.sqrt(s2); C = Math.cosh(s * t); S = Math.sinh(s * t) / s; }
  else { const w = Math.sqrt(-s2); C = Math.cos(w * t); S = Math.sin(w * t) / w; }
  const e = Math.exp(m * t);
  return [[e * (C + S * (a - m)), e * S * b], [e * S * c, e * (C + S * (d - m))]];
}

/** e^{At} by its power series I + At + (At)²/2! + … summed to n terms (for checking expm2). */
export function expmSeries(A, t, n = 40) {
  let term = [[1, 0], [0, 1]], sum = [[1, 0], [0, 1]];
  for (let k = 1; k < n; k++) {
    term = [[(term[0][0] * A[0][0] + term[0][1] * A[1][0]) * t / k, (term[0][0] * A[0][1] + term[0][1] * A[1][1]) * t / k],
      [(term[1][0] * A[0][0] + term[1][1] * A[1][0]) * t / k, (term[1][0] * A[0][1] + term[1][1] * A[1][1]) * t / k]];
    sum = [[sum[0][0] + term[0][0], sum[0][1] + term[0][1]], [sum[1][0] + term[1][0], sum[1][1] + term[1][1]]];
  }
  return sum;
}

/** One RK4 step of z′ = f(z) for z = [x, y], f returning [u, v]. */
export function rk4Step(f, x, y, h) {
  const [k1x, k1y] = f(x, y);
  const [k2x, k2y] = f(x + (h / 2) * k1x, y + (h / 2) * k1y);
  const [k3x, k3y] = f(x + (h / 2) * k2x, y + (h / 2) * k2y);
  const [k4x, k4y] = f(x + h * k3x, y + h * k3y);
  return [x + (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x), y + (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y)];
}

/**
 * A trajectory of z′ = f(z) from (x0, y0), traced forward (dir = 1) or backward
 * (dir = −1) for up to time T. Steps are chosen so each moves about 1/res of
 * the window box = [[xa, xb], [ya, yb]] (scaled per axis), never longer than
 * dtMax in time, so fast and slow stretches are both drawn smoothly. It stops
 * at time T, when it leaves the box by more than `margin` of its size, when
 * f is undefined, or after maxSteps steps. Returns [{ x, y, t }] in the order
 * traced (t is 0 at the start and negative going backward).
 */
export function trajectory(f, x0, y0, { T = 20, dir = 1, box, res = 260, dtMax = 0.05, margin = 0.5, maxSteps = 4000 } = {}) {
  const [[xa, xb], [ya, yb]] = box || [[x0 - 5, x0 + 5], [y0 - 5, y0 + 5]];
  const sx = xb - xa, sy = yb - ya;
  const pts = [{ x: x0, y: y0, t: 0 }];
  let x = x0, y = y0, t = 0;
  for (let i = 0; i < maxSteps && t < T; i++) {
    const [u, v] = f(x, y);
    if (!Number.isFinite(u) || !Number.isFinite(v)) break;
    const sp = Math.hypot(u / sx, v / sy);
    let h = Math.min(dtMax, sp > 0 ? 1 / (res * sp) : dtMax);
    if (t + h > T) h = T - t;
    if (!(h > 0)) break;
    const [x1, y1] = rk4Step(f, x, y, dir * h);
    if (!Number.isFinite(x1) || !Number.isFinite(y1)) break;
    x = x1; y = y1; t += h;
    pts.push({ x, y, t: dir * t });
    if (x < xa - margin * sx || x > xb + margin * sx || y < ya - margin * sy || y > yb + margin * sy) break;
  }
  return pts;
}

/** The trajectory through (x0, y0) both ways, as one list in increasing time. */
export function orbit(f, x0, y0, o = {}) {
  const fwd = trajectory(f, x0, y0, { ...o, dir: 1 });
  const back = trajectory(f, x0, y0, { ...o, dir: -1 });
  return [...back.reverse(), ...fwd.slice(1)];
}

/** The position at time t along a forward trajectory (linear interpolation; clamps at its ends). */
export function at(pts, t) {
  if (!pts.length) return null;
  if (t <= pts[0].t) return pts[0];
  for (let k = 1; k < pts.length; k++) {
    if (pts[k].t >= t) {
      const p = pts[k - 1], q = pts[k], u = (t - p.t) / (q.t - p.t || 1);
      return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, t };
    }
  }
  return pts[pts.length - 1];
}

/** The Jacobian [[∂f/∂x, ∂f/∂y], [∂g/∂x, ∂g/∂y]] of (f, g) at (x, y), by central differences. */
export function jacobian(f, x, y, h) {
  const hx = h ?? 1e-6 * Math.max(1, Math.abs(x)), hy = h ?? 1e-6 * Math.max(1, Math.abs(y));
  const [ux1, vx1] = f(x + hx, y), [ux0, vx0] = f(x - hx, y);
  const [uy1, vy1] = f(x, y + hy), [uy0, vy0] = f(x, y - hy);
  return [[(ux1 - ux0) / (2 * hx), (uy1 - uy0) / (2 * hy)], [(vx1 - vx0) / (2 * hx), (vy1 - vy0) / (2 * hy)]];
}

/**
 * The equilibria of z′ = f(z) inside box = [[xa, xb], [ya, yb]]: Newton's
 * method from an (n+1) × (n+1) grid of starts, kept when the residual is tiny
 * compared with the field's typical size, merged when closer than 10⁻⁵ of the
 * window. Each comes with its Jacobian J and type (classify2 of J):
 * [{ x, y, J, type }], at most `max` of them, sorted by x then y.
 */
export function equilibria(f, box, { n = 10, max = 24 } = {}) {
  const [[xa, xb], [ya, yb]] = box, sx = xb - xa, sy = yb - ya;
  // the field's typical size, so "zero" is judged relative to it
  const mags = [];
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const [u, v] = f(xa + (sx * i) / 8, ya + (sy * j) / 8);
    const m = Math.hypot(u / sx, v / sy);
    if (Number.isFinite(m)) mags.push(m);
  }
  mags.sort((p, q) => p - q);
  const scale = mags.length ? Math.max(mags[Math.floor(mags.length / 2)], 1e-12) : 1;
  const found = [];
  const tol = 1e-5 * Math.hypot(sx, sy);
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
    let x = xa + (sx * (i + 0.5 * (j % 2) * 0.37)) / n, y = ya + (sy * (j + 0.29 * (i % 2))) / n;
    let ok = false;
    for (let it = 0; it < 60; it++) {
      const [u, v] = f(x, y);
      if (!Number.isFinite(u) || !Number.isFinite(v)) break;
      if (Math.hypot(u / sx, v / sy) < 1e-11 * scale) { ok = true; break; }
      const J = jacobian(f, x, y);
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
      if (!Number.isFinite(det) || Math.abs(det) < 1e-300) break;
      let dx = (J[1][1] * u - J[0][1] * v) / det, dy = (-J[1][0] * u + J[0][0] * v) / det;
      // never jump more than half the window in one step
      const big = Math.max(Math.abs(dx) / sx, Math.abs(dy) / sy);
      if (big > 0.5) { dx *= 0.5 / big; dy *= 0.5 / big; }
      x -= dx; y -= dy;
    }
    if (!ok) {
      const [u, v] = f(x, y);
      ok = Number.isFinite(u) && Number.isFinite(v) && Math.hypot(u / sx, v / sy) < 1e-8 * scale;
    }
    if (!ok || x < xa - 1e-9 * sx || x > xb + 1e-9 * sx || y < ya - 1e-9 * sy || y > yb + 1e-9 * sy) continue;
    if (found.some((e) => Math.hypot(e.x - x, e.y - y) < tol)) continue;
    // tidy values that are zero to rounding
    if (Math.abs(x) < 1e-9 * sx) x = 0;
    if (Math.abs(y) < 1e-9 * sy) y = 0;
    const J = jacobian(f, x, y);
    found.push({ x, y, J, type: classify2(J[0][0], J[0][1], J[1][0], J[1][1], 1e-6) });
    if (found.length >= max) break;
  }
  return found.sort((p, q) => p.x - q.x || p.y - q.y);
}

/** An equilibrium's colour family: 'good' attracts, 'bad' repels, 'warn' saddle, 'gold' neutral. */
export function eqColor(type) {
  if (type.kind === 'saddle') return 'warn';
  if (type.stability === 'stable') return 'good';
  if (type.stability === 'unstable') return 'bad';
  return 'gold';
}

