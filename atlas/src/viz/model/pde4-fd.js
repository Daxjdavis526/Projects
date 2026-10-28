// Finite-difference schemes for three model problems on a periodic grid — the
// numerical analyst's view of module B13 of the PDE course. DOM-free; tested in
// test/pde4-fd.test.mjs.
//
//   advection u_t + c u_x = 0 (c > 0): upwind, downwind, FTCS, Lax–Friedrichs, Lax–Wendroff
//   heat      u_t = D u_xx:             FTCS
//   wave      u_tt = c² u_xx:           leapfrog (the standard three-level scheme)
//
// ν is the Courant number cΔt/Δx (advection, waves) or r = DΔt/Δx² (heat).
// gain(scheme, θ, ν) is the von Neumann amplification factor G(θ), θ = kΔx: the
// factor one step multiplies the grid mode e^(ijθ) by. Leapfrog has two.

import { erf } from '../../core/expr.js';

export const SCHEMES = {
  advect: ['upwind', 'downwind', 'ftcs', 'laxf', 'lw'],
  heat: ['ftcs'],
  wave: ['leapfrog'],
};
export const EQS = Object.keys(SCHEMES);
export const PROFILES = ['gauss', 'box', 'sine'];
export const NAME = { upwind: 'upwind', downwind: 'downwind', ftcs: 'FTCS', laxf: 'Lax–Friedrichs', lw: 'Lax–Wendroff', leapfrog: 'leapfrog' };

// complex helpers: [re, im]
const cx = (re, im = 0) => [re, im];
const cabs = (z) => Math.hypot(z[0], z[1]);

/** The amplification factor(s) of one step for the mode e^(ijθ): an array of complex numbers. */
export function gain(scheme, theta, nu) {
  const c = Math.cos(theta), s = Math.sin(theta);
  switch (scheme) {
    case 'upwind': return [cx(1 - nu * (1 - c), -nu * s)];                 // 1 − ν(1 − e^(−iθ))
    case 'downwind': return [cx(1 + nu * (1 - c), -nu * s)];               // 1 − ν(e^(iθ) − 1)
    case 'ftcs': return [cx(1 - 4 * nu * Math.sin(theta / 2) ** 2, 0)];    // heat: 1 − 4r sin²(θ/2)
    case 'ftcs-adv': return [cx(1, -nu * s)];                              // 1 − iν sin θ
    case 'laxf': return [cx(c, -nu * s)];                                  // cos θ − iν sin θ
    case 'lw': return [cx(1 - nu * nu * (1 - c), -nu * s)];               // 1 − iν sin θ − ν²(1 − cos θ)
    case 'leapfrog': {                                                     // G² − 2bG + 1 = 0, b = 1 − 2ν² sin²(θ/2)
      const b = 1 - 2 * nu * nu * Math.sin(theta / 2) ** 2, d = b * b - 1;
      return d <= 0 ? [cx(b, Math.sqrt(-d)), cx(b, -Math.sqrt(-d))] : [cx(b + Math.sqrt(d)), cx(b - Math.sqrt(d))];
    }
    default: throw new Error(`unknown scheme ${scheme}`);
  }
}
/** The scheme key gain() uses for (eq, scheme): FTCS means different things for advection and heat. */
export const gainKey = (eq, scheme) => (eq === 'advect' && scheme === 'ftcs' ? 'ftcs-adv' : scheme);

/** The largest |G| over θ in [0, π] (sampled finely, plus θ = π exactly). */
export function maxGain(key, nu, n = 2000) {
  let m = 0;
  for (let i = 0; i <= n; i++) for (const g of gain(key, (Math.PI * i) / n, nu)) m = Math.max(m, cabs(g));
  return m;
}
export { cabs };

/** The stability limit on ν, where one exists (null for “never stable”). */
export const LIMIT = { upwind: 1, downwind: null, 'ftcs-adv': null, laxf: 1, lw: 1, ftcs: 0.5, leapfrog: 1 };

/** The numerical domain of dependence of one point, n steps back: the range of grid offsets [lo, hi]. */
export function stencilReach(scheme, n) {
  if (scheme === 'upwind') return [-n, 0];
  if (scheme === 'downwind') return [0, n];
  return [-n, n];
}

// ── initial profiles on [XL, XL + L), periodic ─────────────────────────────
export function profile(o, x) {
  const { XL = 0, L = 10 } = o, x0 = o.x0 ?? XL + L / 2, w = o.w ?? 0.8;
  const X = ((((x - x0) + L / 2) % L) + L) % L - L / 2;     // nearest periodic image
  if (o.profile === 'gauss') return Math.exp(-(X * X) / (w * w));
  if (o.profile === 'box') return Math.abs(X) < w ? 1 : Math.abs(X) === w ? 0.5 : 0;
  if (o.profile === 'sine') return Math.sin((2 * Math.PI * (o.m ?? 1) * (x - XL)) / L);
  throw new Error(`unknown profile ${o.profile}`);
}

/** The exact solution at time t of the problem the scheme approximates. */
export function exact(o, x, t) {
  const { eq = 'advect', c = 1, D = 0.1, XL = 0, L = 10 } = o;
  if (eq === 'advect') return profile(o, x - c * t);
  if (eq === 'wave') return 0.5 * (profile(o, x - c * t) + profile(o, x + c * t));      // released from rest
  // heat, periodic: sum the images of the heat-kernel solution on the line
  if (t <= 0) return profile(o, x);
  if (o.profile === 'sine') { const k = (2 * Math.PI * (o.m ?? 1)) / L; return Math.exp(-D * k * k * t) * profile(o, x); }
  const x0 = o.x0 ?? XL + L / 2, w = o.w ?? 0.8, s2 = 4 * D * t;
  let sum = 0;
  for (let m = -4; m <= 4; m++) {
    const X = x - x0 - m * L;
    if (o.profile === 'gauss') sum += (w / Math.sqrt(w * w + s2)) * Math.exp(-(X * X) / (w * w + s2));
    else sum += 0.5 * (erf((X + w) / Math.sqrt(s2)) - erf((X - w) / Math.sqrt(s2)));
  }
  return sum;
}

// a small seeded generator for the optional noise (mulberry32)
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** The grid: N points x_j = XL + jΔx on a periodic domain of length L. */
export function grid(o) {
  const { N = 100, XL = 0, L = 10 } = o, dx = L / N;
  return { N, dx, x: Array.from({ length: N }, (_, j) => XL + j * dx) };
}

/** The time step for Courant number ν (or r for heat). */
export function timeStep(o) {
  const { eq = 'advect', nu = 0.5, c = 1, D = 0.1 } = o, { dx } = grid(o);
  return eq === 'heat' ? (nu * dx * dx) / D : (nu * dx) / c;
}

/** One step of an advection or heat scheme, from u to a new array. */
export function step(scheme, eq, u, nu) {
  const N = u.length, out = new Float64Array(N);
  for (let j = 0; j < N; j++) {
    const um = u[(j - 1 + N) % N], u0 = u[j], up = u[(j + 1) % N];
    if (eq === 'heat') out[j] = u0 + nu * (up - 2 * u0 + um);
    else if (scheme === 'upwind') out[j] = u0 - nu * (u0 - um);
    else if (scheme === 'downwind') out[j] = u0 - nu * (up - u0);
    else if (scheme === 'ftcs') out[j] = u0 - 0.5 * nu * (up - um);
    else if (scheme === 'laxf') out[j] = 0.5 * (up + um) - 0.5 * nu * (up - um);
    else if (scheme === 'lw') out[j] = u0 - 0.5 * nu * (up - um) + 0.5 * nu * nu * (up - 2 * u0 + um);
    else throw new Error(`unknown scheme ${scheme}`);
  }
  return out;
}

/**
 * Run a scheme to time t (the nearest whole number of steps).
 * o: { eq, scheme, N, nu, c, D, XL, L, profile, w, x0, m, noise, seed, t, cap }
 * Returns { x, u, steps, dt, time, blown (the step at which max|u| passed cap, or 0), maxu }.
 */
export function run(o) {
  const { eq = 'advect', scheme = 'upwind', nu = 0.5, noise = 0, seed = 7, cap = 1e12 } = o;
  const { x, N } = grid(o);
  const dt = timeStep(o), steps = Math.max(0, Math.round((o.t ?? 0) / dt));
  const R = rng(seed);
  let u = Float64Array.from(x, (xx) => profile(o, xx) + (noise ? noise * (2 * R() - 1) : 0));
  let blown = 0;
  if (eq === 'wave') {
    // from rest: u¹ = u⁰ + ½ν²δ²u⁰ (Taylor), then u^(n+1) = 2uⁿ − u^(n−1) + ν²δ²uⁿ
    let prev = u;
    if (steps >= 1) {
      const nxt = new Float64Array(N);
      for (let j = 0; j < N; j++) nxt[j] = prev[j] + 0.5 * nu * nu * (prev[(j + 1) % N] - 2 * prev[j] + prev[(j - 1 + N) % N]);
      u = nxt;
    }
    for (let n = 1; n < steps; n++) {
      const nxt = new Float64Array(N);
      for (let j = 0; j < N; j++) nxt[j] = 2 * u[j] - prev[j] + nu * nu * (u[(j + 1) % N] - 2 * u[j] + u[(j - 1 + N) % N]);
      prev = u; u = nxt;
      if (!blown && maxAbs(u) > cap) { blown = n + 1; break; }
    }
  } else {
    for (let n = 0; n < steps; n++) {
      u = step(scheme, eq, u, nu);
      if (maxAbs(u) > cap) { blown = n + 1; break; }
    }
  }
  const done = blown || steps;
  return { x, u: Array.from(u), steps: done, dt, time: done * dt, blown, maxu: maxAbs(u) };
}
export function maxAbs(u) { let m = 0; for (const v of u) m = Math.max(m, Math.abs(v)); return m; }

/** The largest grid error against the exact solution at the time the run reached. */
export function error(o) {
  const R = run(o);
  let e = 0;
  R.x.forEach((xx, j) => { e = Math.max(e, Math.abs(R.u[j] - exact(o, xx, R.time))); });
  return { ...R, err: e };
}

/** Upwind's numerical diffusivity from its modified equation: u_t + c u_x = (cΔx/2)(1 − ν) u_xx. */
export const upwindDiffusivity = (c, dx, nu) => (c * dx * (1 - nu)) / 2;
