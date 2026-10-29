// Exact solutions of the three archetypal 1D evolution equations on the whole
// line, for the pde-player and pde-walk simulations (DOM-free, tested in
// test/pde-1d.test.mjs):
//
//   transport   u_t + c u_x = −λu         u = e^(−λt) f(x − ct)
//   variable    u_t + c(x) u_x = 0        u constant along dx/dt = c(x)
//   wave        u_tt = c² u_xx            d'Alembert, with initial displacement f and velocity g
//   heat        u_t = D u_xx              the initial profile convolved with the heat kernel
//
// and the lattice random walk whose limit is the heat equation.
// Every initial profile is A·p((x − x0)/w) for one of four shapes p.

import { erf } from '../../core/expr.js';

const SQPI = Math.sqrt(Math.PI);

/** erfc without cancellation for large arguments (continued fraction past 3). */
export function erfc(x) {
  if (x < 0) return 2 - erfc(-x);
  if (x < 3) return 1 - erf(x);
  let f = x, C = x, D = 0;
  for (let n = 1; n < 300; n++) {
    const an = n / 2;
    D = x + an * D; D = D === 0 ? 1e-300 : 1 / D;
    C = x + an / C; if (C === 0) C = 1e-300;
    const delta = C * D; f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return Math.exp(-x * x) / SQPI / f;
}

// ─── profiles, in the scaled variable s = (x − x0)/w ─────────────────────────
// p(s), its antiderivative P(s) (any constant), its derivative dp(s) (null: has jumps)
const RIP = { eps: 0.35, kappa: 8 };            // the rough profile: a bump with a fine ripple on it
const tentP = (s) => (s < -1 ? 0 : s < 0 ? (s + 1) ** 2 / 2 : s < 1 ? 1 - (1 - s) ** 2 / 2 : 1);
let roughTable = null;                          // the rough profile's antiderivative, tabulated
function roughP(s) {
  if (!roughTable) {
    const n = 4800, a = -6, b = 6, h = (b - a) / n, T = new Float64Array(n + 1);
    const p = PROFILES.rough.p;
    for (let i = 1; i <= n; i++) {           // Simpson on each cell (midpoint included)
      const x0 = a + (i - 1) * h;
      T[i] = T[i - 1] + (h / 6) * (p(x0) + 4 * p(x0 + h / 2) + p(x0 + h));
    }
    roughTable = { a, h, n, T };
  }
  const { a, h, n, T } = roughTable;
  const u = (s - a) / h;
  if (u <= 0) return 0;
  if (u >= n) return T[n];
  const i = Math.floor(u);
  return hermite(T[i], T[i + 1], PROFILES.rough.p(a + i * h), PROFILES.rough.p(a + (i + 1) * h), u - i, h);
}
// cubic Hermite interpolation between values y0, y1 with slopes d0, d1 over a cell of width h, at fraction q
function hermite(y0, y1, d0, d1, q, h) {
  const q2 = q * q, q3 = q2 * q;
  return (2 * q3 - 3 * q2 + 1) * y0 + (q3 - 2 * q2 + q) * h * d0 + (-2 * q3 + 3 * q2) * y1 + (q3 - q2) * h * d1;
}

export const PROFILES = {
  gauss: { label: 'Gaussian bump', p: (s) => Math.exp(-s * s), P: (s) => (SQPI / 2) * erf(s), dp: (s) => -2 * s * Math.exp(-s * s), support: 4, compact: false },
  box: { label: 'square pulse', p: (s) => (Math.abs(s) < 1 ? 1 : Math.abs(s) === 1 ? 0.5 : 0), P: (s) => Math.max(-1, Math.min(1, s)), dp: null, support: 1, compact: true },
  tri: { label: 'triangle (a pluck)', p: (s) => Math.max(0, 1 - Math.abs(s)), P: tentP, dp: (s) => (Math.abs(s) >= 1 ? 0 : s < 0 ? 1 : -1), support: 1, compact: true },
  rough: { label: 'bump with a ripple', p: (s) => Math.exp(-s * s) * (1 + RIP.eps * Math.sin(RIP.kappa * s)), P: roughP,
    dp: (s) => Math.exp(-s * s) * (-2 * s * (1 + RIP.eps * Math.sin(RIP.kappa * s)) + RIP.eps * RIP.kappa * Math.cos(RIP.kappa * s)), support: 4, compact: false },
};
export const RIPPLE = RIP;

/** The initial profile f(x) = A p((x − x0)/w). */
export function initial(o, x) {
  const pr = PROFILES[o.profile] || PROFILES.gauss;
  return (o.A ?? 1) * pr.p((x - (o.x0 ?? 0)) / (o.w ?? 1));
}

// ─── transport ─────────────────────────────────────────────────────────────

/** Speed fields c(x) for u_t + c(x)u_x = 0. 'const': c; 'stretch': c·x (c in 1/s); 'river': c, slowed to r·c on a reach [xa, xb]. */
export const SPEEDS = {
  const: { label: 'constant' },
  stretch: { label: 'c = a x (stretching flow)' },
  river: { label: 'a slow reach' },
};
export const RIVER = { xa: -2, xb: 3, delta: 0.35 };
export function speed(o, x) {
  const c = o.c ?? 1;
  if (o.speed === 'stretch') return c * x;
  if (o.speed === 'river') {
    const r = o.slow ?? 0.35, bump = 0.5 * (Math.tanh((x - RIVER.xa) / RIVER.delta) - Math.tanh((x - RIVER.xb) / RIVER.delta));
    return c * (1 - (1 - r) * bump);
  }
  return c;
}

// the travel time τ(x) = ∫ dx / c(x) for a positive speed field, tabulated, so the
// characteristic through x at time t starts from τ⁻¹(τ(x) − t)
const tauCache = new Map();
function tauTable(o) {
  const key = `${o.c}|${o.slow}`;
  if (tauCache.has(key)) return tauCache.get(key);
  const a = -400, b = 400, n = 80000, h = (b - a) / n;
  const T = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) {
    const x0 = a + (i - 1) * h;
    T[i] = T[i - 1] + (h / 6) * (1 / speed(o, x0) + 4 / speed(o, x0 + h / 2) + 1 / speed(o, x0 + h));
  }
  const tab = { a, b, h, n, T, o: { speed: 'river', c: o.c, slow: o.slow } };
  if (tauCache.size > 20) tauCache.clear();
  tauCache.set(key, tab);
  return tab;
}
function tauOf(tab, x) {
  const u = (x - tab.a) / tab.h;
  if (u <= 0) return tab.T[0] + (x - tab.a);           // (never reached in the window)
  if (u >= tab.n) return tab.T[tab.n] + (x - tab.b);
  const i = Math.floor(u), xa = tab.a + i * tab.h;
  return hermite(tab.T[i], tab.T[i + 1], 1 / speed(tab.o, xa), 1 / speed(tab.o, xa + tab.h), u - i, tab.h);
}
function tauInv(tab, tau) {
  const T = tab.T;
  if (tau <= T[0]) return tab.a;
  if (tau >= T[tab.n]) return tab.b;
  let lo = 0, hi = tab.n;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= tau) lo = m; else hi = m; }
  let x = tab.a + (lo + (tau - T[lo]) / (T[hi] - T[lo])) * tab.h;
  for (let k = 0; k < 3; k++) x += (tau - tauOf(tab, x)) * speed(tab.o, x);   // Newton: dτ/dx = 1/c
  return x;
}

/** Where the characteristic through (x, t) started at t = 0 (its foot). */
export function foot(o, x, t) {
  if (o.speed === 'stretch') return x * Math.exp(-(o.c ?? 1) * t);
  if (o.speed === 'river') { const tab = tauTable(o); return tauInv(tab, tauOf(tab, x) - t); }
  return x - (o.c ?? 1) * t;
}
/** Where the characteristic that starts at x0 is at time t. */
export function along(o, x0, t) {
  if (o.speed === 'stretch') return x0 * Math.exp((o.c ?? 1) * t);
  if (o.speed === 'river') { const tab = tauTable(o); return tauInv(tab, tauOf(tab, x0) + t); }
  return x0 + (o.c ?? 1) * t;
}
export function transport(o, x, t) {
  return Math.exp(-(o.lambda ?? 0) * t) * initial(o, foot(o, x, t));
}

// ─── wave: d'Alembert ──────────────────────────────────────────────────────
// init 'pluck': u = f, u_t = 0; 'strike': u = 0, u_t = g = A p; 'right': u = f, u_t = −c f′ (one pulse moving right)

/** The right- and left-moving parts R(x − ct) and L(x + ct), with u = R + L. */
export function waveParts(o, x, t) {
  const pr = PROFILES[o.profile] || PROFILES.gauss, A = o.A ?? 1, w = o.w ?? 1, x0 = o.x0 ?? 0, c = o.c ?? 1;
  const xi = x - c * t, eta = x + c * t;
  const f = (y) => A * pr.p((y - x0) / w), G = (y) => A * w * pr.P((y - x0) / w);
  if (o.init === 'strike') return { R: -G(xi) / (2 * c), L: G(eta) / (2 * c) };
  if (o.init === 'right') return { R: f(xi), L: 0 };
  return { R: f(xi) / 2, L: f(eta) / 2 };
}
export function wave(o, x, t) {
  const { R, L } = waveParts(o, x, t);
  return R + L;
}
/** u_x and u_t from the exact parts; null where the profile has jumps (a square pulse plucked). */
export function waveGrad(o, x, t) {
  const pr = PROFILES[o.profile] || PROFILES.gauss, A = o.A ?? 1, w = o.w ?? 1, x0 = o.x0 ?? 0, c = o.c ?? 1;
  const xi = x - c * t, eta = x + c * t;
  const p = (y) => A * pr.p((y - x0) / w);
  let Rp, Lp;                                   // R′(ξ), L′(η)
  if (o.init === 'strike') { Rp = -p(xi) / (2 * c); Lp = p(eta) / (2 * c); }
  else {
    if (!pr.dp) return null;
    const dp = (y) => (A / w) * pr.dp((y - x0) / w);
    if (o.init === 'right') { Rp = dp(xi); Lp = 0; } else { Rp = dp(xi) / 2; Lp = dp(eta) / 2; }
  }
  return { ux: Rp + Lp, ut: -c * Rp + c * Lp };
}
/** Kinetic ½∫u_t², potential ½c²∫u_x² and total energy (per unit linear density) over the whole line. */
export function waveEnergy(o, t, n = 6000) {
  const pr = PROFILES[o.profile] || PROFILES.gauss, w = o.w ?? 1, x0 = o.x0 ?? 0, c = o.c ?? 1;
  if (o.init !== 'strike' && !pr.dp) return { K: Infinity, V: Infinity, E: Infinity };
  const half = pr.support * w + 0.5 * w;
  // the pieces live near x0 ± ct; integrate each smooth stretch between the
  // pieces' edges and kinks (where p jumps or bends) by Simpson's rule
  const cuts = new Set();
  for (const ctr of [x0 - c * t, x0 + c * t]) for (const k of [-half, -w, 0, w, half]) cuts.add(ctr + k);
  const pts = [...cuts].sort((a, b) => a - b);
  const m = Math.max(40, Math.round(n / pts.length)) & ~1;
  let K = 0, V = 0;
  for (let j = 0; j + 1 < pts.length; j++) {
    const a = pts[j], b = pts[j + 1];
    if (b - a < 1e-12) continue;
    const h = (b - a) / m;
    for (let i = 0; i <= m; i++) {
      const wt = (i === 0 || i === m ? 1 : i % 2 ? 4 : 2) * h / 3;
      // at a stretch's ends, sample just inside it, so a kink is read from the correct side
      const x = i === 0 ? a + 1e-9 * (b - a) : i === m ? b - 1e-9 * (b - a) : a + i * h, d = waveGrad(o, x, t);
      K += 0.5 * d.ut * d.ut * wt; V += 0.5 * c * c * d.ux * d.ux * wt;
    }
  }
  return { K, V, E: K + V };
}

// ─── heat: the fundamental solution and its convolutions ────────────────────

/** The heat kernel Φ(x, t) = exp(−x²/4Dt)/√(4πDt). */
export function kernel(x, t, D) { const s = 4 * D * t; return Math.exp(-x * x / s) / Math.sqrt(Math.PI * s); }

const nrm = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
const cdf = (z) => 0.5 * erfc(-z / Math.SQRT2);
// the heat solution from the ramp x₊, with σ² = 2Dt
const ramp = (x, sg) => x * cdf(x / sg) + sg * nrm(x / sg);

/** u(x, t) for u_t = D u_xx on the line, u(x, 0) = A p((x − x0)/w). Exact for every profile. */
export function heat(o, x, t) {
  const A = o.A ?? 1, w = o.w ?? 1, X = x - (o.x0 ?? 0), D = o.D ?? 1;
  if (!(t > 0)) return initial(o, x);
  const s0 = w * w / 2, S = s0 + 2 * D * t;   // Gaussian variances: σ₀² and σ² = σ₀² + 2Dt
  switch (o.profile) {
    case 'box': {
      const r = Math.sqrt(4 * D * t);
      if (X > w) return (A / 2) * (erfc((X - w) / r) - erfc((X + w) / r));
      if (X < -w) return (A / 2) * (erfc((-X - w) / r) - erfc((-X + w) / r));
      return (A / 2) * (erf((X + w) / r) - erf((X - w) / r));
    }
    case 'tri': {
      const sg = Math.sqrt(2 * D * t);
      return (A / w) * (ramp(X + w, sg) - 2 * ramp(X, sg) + ramp(X - w, sg));
    }
    case 'rough': {
      const k = RIP.kappa / w;
      const base = Math.sqrt(s0 / S) * Math.exp(-X * X / (2 * S));
      const rip = Math.exp(-k * k * s0 * D * t / S) * Math.sin(k * s0 * X / S);
      return A * base * (1 + RIP.eps * rip);
    }
    default: return A * Math.sqrt(s0 / S) * Math.exp(-X * X / (2 * S));
  }
}
/** The spread (standard deviation) of the heat solution: √(σ₀² + 2Dt), σ₀ the initial profile's. */
export function heatSpread(o, t) {
  const w = o.w ?? 1, D = o.D ?? 1;
  const v0 = { gauss: w * w / 2, box: w * w / 3, tri: w * w / 6 }[o.profile];
  return v0 === undefined ? null : Math.sqrt(v0 + 2 * D * t);
}

/** Any of the four equations, by mode. */
export function solve(o, x, t) {
  if (o.mode === 'wave') return wave(o, x, t);
  if (o.mode === 'heat') return heat(o, x, t);
  return transport(o, x, t);
}

// ─── the lattice random walk ────────────────────────────────────────────────

/** A small seeded generator (mulberry32): the same walk every time for a given seed. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** N walkers at the origin, positions in lattice steps. */
export function walkers(N, seed = 1) { return { pos: new Int32Array(N), n: 0, next: rng(seed) }; }
/** Every walker hops one lattice step: right with probability p, else left. */
export function hop(W, p = 0.5) {
  for (let i = 0; i < W.pos.length; i++) W.pos[i] += W.next() < p ? 1 : -1;
  W.n++;
  return W;
}
export function moments(pos) {
  let m = 0;
  for (const x of pos) m += x;
  m /= pos.length;
  let v = 0;
  for (const x of pos) v += (x - m) ** 2;
  return { mean: m, variance: v / pos.length };
}
/** The exact chance that a walker is at lattice site m after n hops (p = ½ unless given). */
export function walkProb(n, m, p = 0.5) {
  if ((n + m) % 2 !== 0 || Math.abs(m) > n) return 0;
  const k = (n + m) / 2;                    // hops to the right
  let lg = 0;
  for (let i = 1; i <= n; i++) lg += Math.log(i);
  for (let i = 1; i <= k; i++) lg -= Math.log(i);
  for (let i = 1; i <= n - k; i++) lg -= Math.log(i);
  return Math.exp(lg + k * Math.log(p) + (n - k) * Math.log(1 - p));
}
