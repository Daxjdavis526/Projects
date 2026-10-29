// Burgers' equation u_t + (u²/2)_x = 0 on the whole line, solved exactly.
//
// Before anything breaks, u is constant along the straight characteristics
// x = ξ + u0(ξ) t. For every t, including after characteristics cross, the
// physical (entropy) weak solution is given by the Lax–Oleinik (Hopf) formula
//
//     u(x, t) = (x − y*)/t,   y* = the y that minimizes U0(y) + (x − y)²/(2t),
//
// with U0(y) = ∫₀^y u0. A shock is a jump in y*(x): two characteristics, from
// two different feet, arrive at the same point. Shocks found this way move at
// the Rankine–Hugoniot speed (u⁻ + u⁺)/2 — test/pde3-burgers.test.mjs checks
// that, the breaking times, the Riemann problems and the box's triangle wave.
// Also here: the folded (multivalued) profile the characteristics alone would
// give, and two upwind schemes — conservative (Godunov) and non-conservative —
// whose shocks move at the right and the wrong speed.

import { erf } from '../../core/expr.js';

export const PROFILES = ['gauss', 'sine', 'box', 'step', 'nwave'];
const SE = Math.sqrt(Math.E);

/** The initial profile u0(x). o = { profile, A, w, uL, uR }. */
export function u0(o, x) {
  const { A = 1, w = 1 } = o, s = x / w;
  switch (o.profile) {
    case 'gauss': return A * Math.exp(-s * s);
    case 'sine': return A * Math.sin(s);
    case 'box': return Math.abs(s) < 1 ? A : 0;
    case 'step': return x < 0 ? o.uL : o.uR;
    case 'nwave': return A * s * Math.exp((1 - s * s) / 2);
    default: throw new Error(`pde3-burgers: unknown profile ${o.profile}`);
  }
}

/** Its slope u0′(x) (zero away from the jumps of box and step). */
export function du0(o, x) {
  const { A = 1, w = 1 } = o, s = x / w;
  switch (o.profile) {
    case 'gauss': return (-2 * A * s * Math.exp(-s * s)) / w;
    case 'sine': return (A * Math.cos(s)) / w;
    case 'nwave': return (A * (1 - s * s) * Math.exp((1 - s * s) / 2)) / w;
    default: return 0;
  }
}

/** U0(y) = ∫₀^y u0. */
export function U0(o, y) {
  const { A = 1, w = 1 } = o, s = y / w;
  switch (o.profile) {
    case 'gauss': return ((A * w * Math.sqrt(Math.PI)) / 2) * erf(s);
    case 'sine': return A * w * (1 - Math.cos(s));
    case 'box': return A * Math.max(-w, Math.min(w, y));
    case 'step': return y < 0 ? o.uL * y : o.uR * y;
    case 'nwave': return A * w * (SE - Math.exp((1 - s * s) / 2));
    default: throw new Error(`pde3-burgers: unknown profile ${o.profile}`);
  }
}

/** The largest |u0|: no characteristic is faster. */
export function maxSpeed(o) {
  const A = Math.abs(o.A ?? 1);
  if (o.profile === 'step') return Math.max(Math.abs(o.uL), Math.abs(o.uR));
  return A;      // gauss, sine, box and nwave all peak at |A|
}

/**
 * The breaking time t* = −1/min u0′ and where it happens: the foot ξ of the
 * first characteristics to cross, and the point x where they meet. A downward
 * jump breaks at once (t* = 0); a profile that never decreases never breaks
 * (null). For the N-wave both ends break together; the front is returned.
 */
export function breaking(o) {
  const A = o.A ?? 1, w = o.w ?? 1;
  const at = (t, xi) => ({ t, xi, x: xi + u0(o, xi) * t });
  switch (o.profile) {
    case 'gauss': return A === 0 ? null : at((w * SE) / (Math.SQRT2 * Math.abs(A)), (Math.sign(A) * w) / Math.SQRT2);
    case 'sine': return A === 0 ? null : at(w / Math.abs(A), A > 0 ? Math.PI * w : 0);
    case 'nwave': return A === 0 ? null : A > 0 ? at((w * Math.E) / (2 * A), Math.sqrt(3) * w) : at(w / (-A * SE), 0);
    case 'box': return A === 0 ? null : { t: 0, xi: A > 0 ? w : -w, x: A > 0 ? w : -w };
    case 'step': return o.uL > o.uR ? { t: 0, xi: 0, x: 0 } : null;
    default: return null;
  }
}

/** The characteristic from ξ: x = ξ + u0(ξ) t. */
export const charX = (o, xi, t) => xi + u0(o, xi) * t;

/**
 * A solver over a window of feet [ylo, yhi]: U0 tabulated once, then for each
 * (x, t) a scan of the tabulated values for the minimizer and a golden-section
 * polish on the exact U0. Keep |x| + maxSpeed·t inside the window.
 */
export function solver(o, ylo, yhi, n = 6000) {
  const dy = (yhi - ylo) / n, Y = new Float64Array(n + 1), V = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) { Y[i] = ylo + i * dy; V[i] = U0(o, Y[i]); }
  const M = maxSpeed(o);
  const G = (y, x, t) => U0(o, y) + ((x - y) * (x - y)) / (2 * t);

  function ystar(x, t) {
    if (t <= 0) return x;
    const reach = M * t + 2 * dy;
    let i0 = Math.max(0, Math.floor((x - reach - ylo) / dy)), i1 = Math.min(n, Math.ceil((x + reach - ylo) / dy));
    let best = i0, bv = Infinity;
    const inv = 1 / (2 * t);
    for (let i = i0; i <= i1; i++) {
      const d = x - Y[i], g = V[i] + d * d * inv;
      if (g < bv) { bv = g; best = i; }
    }
    // golden-section polish on the exact function, inside the neighbouring cells
    let a = Y[Math.max(0, best - 1)], b = Y[Math.min(n, best + 1)];
    const r = (Math.sqrt(5) - 1) / 2;
    let c = b - r * (b - a), d = a + r * (b - a), gc = G(c, x, t), gd = G(d, x, t);
    for (let k = 0; k < 40; k++) {
      if (gc < gd) { b = d; d = c; gd = gc; c = b - r * (b - a); gc = G(c, x, t); }
      else { a = c; c = d; gc = gd; d = a + r * (b - a); gd = G(d, x, t); }
    }
    const ym = (a + b) / 2;
    return G(ym, x, t) <= G(Y[best], x, t) ? ym : Y[best];
  }
  const u = (x, t) => (t <= 0 ? u0(o, x) : (x - ystar(x, t)) / t);

  /** The shocks at time t inside [xl, xr]: { x, uL, uR, s } with s the Rankine–Hugoniot speed. */
  function shocks(t, xl, xr, nx = 400) {
    if (t <= 0) return [];
    const out = [], h = (xr - xl) / nx, tol = 1e-3 * Math.max(M, 1e-9);
    let xa = xl, ya = ystar(xa, t);
    for (let i = 1; i <= nx; i++) {
      const xb = xl + i * h, yb = ystar(xb, t);
      // u = (x − y*)/t falls across the cell: a shock, or only a steep smooth
      // stretch — bisection tells them apart (a true jump survives it)
      if ((xa - ya) / t - (xb - yb) / t > 0.02 * M) {
        let a = xa, b = xb, A = ya, B = yb;
        for (let k = 0; k < 50 && b - a > 1e-10; k++) {
          const m = (a + b) / 2, ym = ystar(m, t);
          if (ym - A < B - ym) { a = m; A = ym; } else { b = m; B = ym; }
        }
        const uL = (a - A) / t, uR = (b - B) / t;
        if (uL - uR > tol) out.push({ x: (a + b) / 2, uL, uR, s: (uL + uR) / 2 });
      }
      xa = xb; ya = yb;
    }
    return out;
  }
  return { ystar, u, shocks };
}

/**
 * Two first-order upwind schemes on cells of width (xr − xl)/n, run from 0 to t
 * with Courant number 0.5. 'conservative': Godunov's flux for f = u²/2, the
 * update u_j − (Δt/Δx)(F_{j+½} − F_{j−½}). 'nonconservative': the same equation
 * written u_t + u u_x = 0 and differenced upwind, u_j − (Δt/Δx) u_j (u_j − u_{j−1})
 * (or the right-hand difference where u < 0). The ends copy their neighbours.
 * Returns the cell centres and values.
 */
export function scheme(o, t, xl, xr, n = 400, kind = 'conservative') {
  const dx = (xr - xl) / n, xs = new Float64Array(n), u = new Float64Array(n);
  for (let j = 0; j < n; j++) { xs[j] = xl + (j + 0.5) * dx; u[j] = u0(o, xs[j]); }
  const M = Math.max(maxSpeed(o), 1e-9);
  const f = (v) => 0.5 * v * v;
  const flux = (a, b) => Math.max(f(Math.max(a, 0)), f(Math.min(b, 0)));
  let time = 0;
  const v = new Float64Array(n);
  while (time < t - 1e-12) {
    const dt = Math.min(0.5 * dx / M, t - time), lam = dt / dx;
    for (let j = 0; j < n; j++) {
      const L = u[Math.max(0, j - 1)], C = u[j], R = u[Math.min(n - 1, j + 1)];
      v[j] = kind === 'conservative'
        ? C - lam * (flux(C, R) - flux(L, C))
        : C >= 0 ? C - lam * C * (C - L) : C - lam * C * (R - C);
    }
    u.set(v);
    time += dt;
  }
  return { xs, u };
}

/** Exact solutions used by the tests: the box's triangle-wave shock, x_s(t). */
export function boxShock(A, w, t) {
  return t <= (4 * w) / A ? w + (A * t) / 2 : -w + 2 * Math.sqrt(A * w * t);
}
