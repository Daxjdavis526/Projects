// Chaos in two small systems, DOM-free (tested in test/cm5-chaos.test.mjs):
//
// 1. The driven damped pendulum in Taylor's form (Classical Mechanics, ch. 12)
//      φ̈ + 2βφ̇ + ω₀² sin φ = γ ω₀² cos ωt,
//    with γ the drive torque as a fraction of the largest gravitational
//    torque. Taylor's numbers are the default: drive ω = 2π rad/s (period
//    1 s), ω₀ = 1.5ω, β = ω₀/4. Integrated with fixed-step RK4 at `spp`
//    steps per drive period, so a Poincaré section (one sample per period)
//    lands exactly on the grid. Also: the separation of two nearby starts,
//    the largest Lyapunov exponent (Benettin's renormalization, with the
//    tangent map), periodic orbits of the stroboscopic map by Newton's
//    method with their Floquet multipliers, and the drive strengths at which
//    an orbit's period doubles (a multiplier passing through −1).
//
// 2. The logistic map x → r x(1 − x): orbits, cobwebs, the attractor at each
//    r, the Lyapunov exponent ⟨ln|r(1 − 2x)|⟩, the superstable parameters Rₖ
//    (x = ½ on a 2ᵏ-cycle) and the period-doubling parameters rₖ, and from
//    them estimates of Feigenbaum's δ = 4.669 201 609… (the constant itself
//    is cited, not computed to all its digits).
//
// Used by sims/cm5-pendulum.js, sims/cm5-logistic.js and the PHYS 3550 M10
// lessons.

export const TAU = 2 * Math.PI;
/** Taylor's parameters: drive ω = 2π rad/s, ω₀ = 1.5ω, β = ω₀/4 (all in s⁻¹ or rad/s). */
export const TAYLOR = Object.freeze({ w: TAU, w0: 1.5 * TAU, beta: (1.5 * TAU) / 4 });
/**
 * The drive strengths at which Taylor's pendulum (started at φ = −π/2, at rest) doubles its period:
 * 1 → 2 → 4 → 8 → 16, computed by doubling() below (spp 200 and 400 agree to 10⁻⁷) and checked
 * by test/cm5-chaos.test.mjs. Taylor (ch. 12) gives 1.0663, 1.0793, 1.0821, 1.0827.
 */
export const TAYLOR_DOUBLINGS = Object.freeze([1.0663729, 1.0793139, 1.0820844, 1.0826784]);
/** Feigenbaum's constants (cited: Feigenbaum 1978; digits from Briggs 1991). */
export const FEIGENBAUM_DELTA = 4.669201609102990;
export const FEIGENBAUM_ALPHA = 2.502907875095892;

/** φ wrapped into (−π, π]. */
export function wrap(phi) {
  let p = phi - TAU * Math.round(phi / TAU);
  if (p <= -Math.PI) p += TAU;
  return p;
}

const P = (o = {}) => ({ ...TAYLOR, gamma: 1.06, ...o });

/** One RK4 step of the pendulum (state [φ, φ̇]) from time t. */
export function step(o, t, s, h) {
  const { w, w0, beta, gamma } = o;
  const w02 = w0 * w0;
  const f = (tt, p, v) => -2 * beta * v - w02 * Math.sin(p) + gamma * w02 * Math.cos(w * tt);
  const p = s[0], v = s[1];
  const k1p = v, k1v = f(t, p, v);
  const k2p = v + (h / 2) * k1v, k2v = f(t + h / 2, p + (h / 2) * k1p, v + (h / 2) * k1v);
  const k3p = v + (h / 2) * k2v, k3v = f(t + h / 2, p + (h / 2) * k2p, v + (h / 2) * k2v);
  const k4p = v + h * k3v, k4v = f(t + h, p + h * k3p, v + h * k3v);
  return [p + (h / 6) * (k1p + 2 * k2p + 2 * k3p + k4p), v + (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v)];
}

/** One RK4 step of the pendulum and its tangent map: s = [φ, φ̇], J = 2×2 (row-major [a, b, c, d]). */
function stepVar(o, t, s, J, h) {
  const { w, w0, beta, gamma } = o;
  const w02 = w0 * w0;
  // y = [φ, v, J00, J01, J10, J11]; dJ/dt = A J with A = [[0, 1], [−ω₀² cos φ, −2β]]
  const F = (tt, y) => {
    const c = -w02 * Math.cos(y[0]);
    return [y[1], -2 * beta * y[1] - w02 * Math.sin(y[0]) + gamma * w02 * Math.cos(w * tt),
      y[4], y[5], c * y[2] - 2 * beta * y[4], c * y[3] - 2 * beta * y[5]];
  };
  const y = [s[0], s[1], J[0], J[1], J[2], J[3]];
  const add = (a, b, k) => a.map((x, i) => x + k * b[i]);
  const k1 = F(t, y), k2 = F(t + h / 2, add(y, k1, h / 2)), k3 = F(t + h / 2, add(y, k2, h / 2)), k4 = F(t + h, add(y, k3, h));
  const z = y.map((x, i) => x + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  return { s: [z[0], z[1]], J: [z[2], z[3], z[4], z[5]] };
}

/**
 * Integrate from s0 at t = t0 for `periods` drive periods at `spp` steps each.
 * Returns samples every `every` steps: { t: [], phi: [], dphi: [] } (φ unwrapped).
 */
export function run(o0, s0 = [-Math.PI / 2, 0], { periods = 10, spp = 200, every = 1, t0 = 0 } = {}) {
  const o = P(o0), T = TAU / o.w, h = T / spp, n = Math.round(periods * spp);
  const t = [t0], phi = [s0[0]], dphi = [s0[1]];
  let s = s0.slice();
  for (let i = 1; i <= n; i++) {
    s = step(o, t0 + (i - 1) * h, s, h);
    if (i % every === 0) { t.push(t0 + i * h); phi.push(s[0]); dphi.push(s[1]); }
  }
  return { t, phi, dphi, end: s };
}

/** The stroboscopic (Poincaré) map: the state after one drive period from a time that is a whole number of periods. */
export function strobe(o0, s, spp = 200) {
  const o = P(o0), T = TAU / o.w, h = T / spp;
  let z = s.slice();
  for (let i = 0; i < spp; i++) z = step(o, i * h, z, h);
  return z;
}

/** The Poincaré section: skip `skip` periods of transient, then `keep` points [φ (wrapped), φ̇] one period apart. */
export function poincare(o0, s0 = [-Math.PI / 2, 0], { skip = 100, keep = 200, spp = 200 } = {}) {
  let s = s0.slice();
  for (let n = 0; n < skip; n++) s = strobe(o0, s, spp);
  const out = [];
  for (let n = 0; n < keep; n++) { s = strobe(o0, s, spp); out.push([wrap(s[0]), s[1]]); }
  return out;
}

/** Bifurcation diagram: for each γ, the wrapped φ at `keep` successive periods after `skip` (from the same start s0). */
export function bifurcation(o0, gammas, { s0 = [-Math.PI / 2, 0], skip = 150, keep = 40, spp = 120 } = {}) {
  return gammas.map((gamma) => ({ gamma, phis: poincare({ ...o0, gamma }, s0, { skip, keep, spp }).map(([p]) => p) }));
}

/**
 * Count the period of the attractor in a Poincaré section: the smallest m ≤ maxM with
 * |φ(n + m) − φ(n)| (wrapped) and |φ̇(n + m) − φ̇(n)| below tol for the last points; 0 if none (chaotic or not settled).
 */
export function period(points, { maxM = 16, tol = 1e-3 } = {}) {
  const n = points.length;
  for (let m = 1; m <= maxM; m++) {
    let ok = true;
    for (let k = n - 1; k >= Math.max(m, n - 2 * maxM) && ok; k--) {
      const a = points[k], b = points[k - m];
      if (Math.abs(wrap(a[0] - b[0])) > tol || Math.abs(a[1] - b[1]) > tol * TAU * 3) ok = false;
    }
    if (ok) return m;
  }
  return 0;
}

/**
 * Two starts Δφ₀ apart: |Δφ(t)| sampled every `every` steps, as { t, d, ln } with ln = ln|Δφ| (φ unwrapped:
 * the separation is a real angle difference, not a wrapped one).
 */
export function separation(o0, s0 = [-Math.PI / 2, 0], d0 = 1e-4, { periods = 16, spp = 200, every = 10 } = {}) {
  const A = run(o0, s0, { periods, spp, every }), B = run(o0, [s0[0] + d0, s0[1]], { periods, spp, every });
  const d = A.phi.map((p, i) => Math.abs(B.phi[i] - p));
  return { t: A.t, d, ln: d.map((x) => Math.log(Math.max(x, 1e-300))) };
}

/**
 * The largest Lyapunov exponent (s⁻¹): carry a tangent vector with the flow, renormalize it every period,
 * and average the log growth over `periods` periods after `skip` periods of transient.
 */
export function lyapunov(o0, s0 = [-Math.PI / 2, 0], { skip = 50, periods = 400, spp = 200 } = {}) {
  const o = P(o0), T = TAU / o.w, h = T / spp;
  let s = s0.slice();
  for (let n = 0; n < skip; n++) s = strobe(o, s, spp);
  let v = [1, 0], sum = 0;
  for (let n = 0; n < periods; n++) {
    let J = [1, 0, 0, 1];
    for (let i = 0; i < spp; i++) ({ s, J } = stepVar(o, i * h, s, J, h));
    const u = [J[0] * v[0] + J[1] * v[1], J[2] * v[0] + J[3] * v[1]];
    const g = Math.hypot(u[0], u[1]);
    sum += Math.log(g);
    v = [u[0] / g, u[1] / g];
  }
  return sum / (periods * T);
}

/** The m-fold stroboscopic map and its Jacobian (2×2, row-major). */
export function mapM(o0, s, m, spp = 200) {
  const o = P(o0), T = TAU / o.w, h = T / spp;
  let z = s.slice(), J = [1, 0, 0, 1];
  for (let k = 0; k < m; k++) {
    let Jk = [1, 0, 0, 1];
    for (let i = 0; i < spp; i++) ({ s: z, J: Jk } = stepVar(o, i * h, z, Jk, h));
    J = [Jk[0] * J[0] + Jk[1] * J[2], Jk[0] * J[1] + Jk[1] * J[3], Jk[2] * J[0] + Jk[3] * J[2], Jk[2] * J[1] + Jk[3] * J[3]];
  }
  return { s: z, J };
}

/** Eigenvalues of a real 2×2 matrix: { re: [a, b], im: [c, d] }, sorted so a real pair is ascending. */
export function eig2(J) {
  const tr = J[0] + J[3], det = J[0] * J[3] - J[1] * J[2], disc = (tr * tr) / 4 - det;
  if (disc >= 0) { const r = Math.sqrt(disc); return { re: [tr / 2 - r, tr / 2 + r], im: [0, 0] }; }
  const i = Math.sqrt(-disc);
  return { re: [tr / 2, tr / 2], im: [-i, i] };
}

/**
 * A periodic orbit of the m-fold stroboscopic map near `guess`, by Newton's method (φ may come back
 * shifted by a whole number of turns). Returns { s, J, mult, ok } with mult the Floquet multipliers.
 */
export function cycle(o0, guess, m, { spp = 200, iters = 30 } = {}) {
  let s = guess.slice();
  for (let it = 0; it < iters; it++) {
    const { s: z, J } = mapM(o0, s, m, spp);
    const turns = Math.round((z[0] - s[0]) / TAU);
    const g = [z[0] - TAU * turns - s[0], z[1] - s[1]];
    // (J − 1) δ = −g
    const a = J[0] - 1, b = J[1], c = J[2], d = J[3] - 1, det = a * d - b * c;
    const dx = (-g[0] * d + g[1] * b) / det, dy = (-a * g[1] + c * g[0]) / det;
    s = [s[0] + dx, s[1] + dy];
    if (Math.hypot(dx, dy / TAU) < 1e-12) break;
  }
  const { s: z, J } = mapM(o0, s, m, spp);
  const res = Math.hypot(wrap(z[0] - s[0]), (z[1] - s[1]) / TAU);
  return { s: [wrap(s[0]), s[1]], J, mult: eig2(J), ok: res < 1e-8 };
}

/**
 * The drive strength at which the attracting m-cycle (found near `guess` at γ = gLo) doubles its period:
 * its most negative Floquet multiplier passes through −1. Tracked by continuation from gLo in steps of dg,
 * then refined by bisection. Returns { gamma, s } (the cycle at the threshold) or null.
 */
export function doubling(o0, guess, m, gLo, { dg = 5e-4, gMax = gLo + 0.05, spp = 200, tol = 1e-7 } = {}) {
  const mu = (g, s) => { const C = cycle({ ...o0, gamma: g }, s, m, { spp }); return { C, low: C.mult.im[0] === 0 ? C.mult.re[0] : Infinity }; };
  let g = gLo, cur = mu(g, guess);
  if (!cur.C.ok) return null;
  for (; g + dg <= gMax;) {
    const nxt = mu(g + dg, cur.C.s);
    if (!nxt.C.ok) return null;
    if (nxt.low <= -1) {
      let a = g, b = g + dg, sa = cur.C.s;
      while (b - a > tol) {
        const c = (a + b) / 2, mc = mu(c, sa);
        if (mc.low > -1) { a = c; sa = mc.C.s; } else b = c;
      }
      return { gamma: (a + b) / 2, s: sa };
    }
    g += dg; cur = nxt;
  }
  return null;
}

// ── the logistic map ─────────────────────────────────────────────────────────

export const logistic = (r, x) => r * x * (1 - x);

/** x₀, x₁, …, xₙ. */
export function orbit(r, x0, n) {
  const xs = [x0];
  for (let i = 0; i < n; i++) xs.push(logistic(r, xs[i]));
  return xs;
}

/** The cobweb path for n steps: (x₀, 0) → (x₀, x₁) → (x₁, x₁) → (x₁, x₂) → … */
export function cobweb(r, x0, n) {
  const pts = [[x0, 0]];
  let x = x0;
  for (let i = 0; i < n; i++) { const y = logistic(r, x); pts.push([x, y], [y, y]); x = y; }
  return pts;
}

/** The attractor at r: `keep` iterates after `skip` (from x0). */
export function attractor(r, { x0 = 0.2, skip = 600, keep = 200 } = {}) {
  let x = x0;
  for (let i = 0; i < skip; i++) x = logistic(r, x);
  const out = [];
  for (let i = 0; i < keep; i++) { x = logistic(r, x); out.push(x); }
  return out;
}

/** The Lyapunov exponent per iteration, ⟨ln|f′(xₙ)|⟩ = ⟨ln|r(1 − 2xₙ)|⟩ over n iterates after skip. */
export function lyapLogistic(r, { x0 = 0.2, skip = 1000, n = 20000 } = {}) {
  let x = x0, s = 0;
  for (let i = 0; i < skip; i++) x = logistic(r, x);
  for (let i = 0; i < n; i++) { s += Math.log(Math.max(Math.abs(r * (1 - 2 * x)), 1e-300)); x = logistic(r, x); }
  return s / n;
}

/** The fixed points 0 and 1 − 1/r with the slopes f′ there (r and 2 − r): stable where |slope| < 1. */
export const fixedPoints = (r) => ({ x0: 0, x1: 1 - 1 / r, slope0: r, slope1: 2 - r });

/** f^p(x) and its derivative. */
function iterD(r, x, p) {
  let d = 1;
  for (let i = 0; i < p; i++) { d *= r * (1 - 2 * x); x = logistic(r, x); }
  return { x, d };
}

/** The superstable parameters R₀ … R_{k−1}: x = ½ lies on an attracting 2ⁿ-cycle (R₀ = 2, R₁ = 1 + √5). */
export function superstable(k = 10) {
  const R = [2, 1 + Math.sqrt(5)];
  for (let n = 2; n < k; n++) {
    const p = 2 ** n, dlt = n >= 3 ? (R[n - 2] - R[n - 3]) / (R[n - 1] - R[n - 2]) : 4.7;
    let r = R[n - 1] + (R[n - 1] - R[n - 2]) / dlt;
    // secant on g(r) = f_r^p(½) − ½
    const g = (q) => iterD(q, 0.5, p).x - 0.5;
    let r0 = r, r1 = r + 1e-7 * (R[n - 1] - R[n - 2]) / 1e-3, g0 = g(r0), g1 = g(r1);
    for (let it = 0; it < 60 && Math.abs(r1 - r0) > 1e-15; it++) {
      const r2 = r1 - (g1 * (r1 - r0)) / (g1 - g0);
      r0 = r1; g0 = g1; r1 = r2; g1 = g(r1);
    }
    R.push(r1);
  }
  return R.slice(0, k);
}

/**
 * The period-doubling parameters r₁ = 3, r₂ = 1 + √6, r₃, …: the 2^{k−1}-cycle's multiplier reaches −1.
 * Found by Newton's method on f^p(x) = x, (f^p)′(x) = −1 in (x, r), starting between Rₖ₋₁ and Rₖ.
 */
export function doublings(k = 9) {
  const R = superstable(k + 1), out = [];
  for (let j = 1; j <= k; j++) {
    const p = 2 ** (j - 1);
    // start: the 2^{j−1}-cycle through ½ at R_{j−1}, continued in r toward R_j
    let r = R[j - 1], x = 0.5;
    const solve = (rr, xx) => { for (let it = 0; it < 50; it++) { const { x: y, d } = iterD(rr, xx, p); const dx = (y - xx) / (d - 1); xx -= dx; if (Math.abs(dx) < 1e-15) break; } return xx; };
    const mult = (rr, xx) => iterD(rr, xx, p).d;
    const steps = 40, dr = (R[j] - R[j - 1]) / steps;
    let rr = r, xx = x, m = mult(rr, xx);
    for (let s = 1; s <= steps && m > -1; s++) { const rn = R[j - 1] + s * dr; const xn = solve(rn, xx); const mn = mult(rn, xn); if (mn <= -1) { r = rn; x = xn; break; } rr = rn; xx = xn; m = mn; }
    // bisection between rr (multiplier > −1) and r (≤ −1)
    let a = rr, b = r, xa = xx;
    for (let it = 0; it < 80 && b - a > 1e-15; it++) {
      const c = (a + b) / 2, xc = solve(c, xa);
      if (mult(c, xc) > -1) { a = c; xa = xc; } else b = c;
    }
    out.push((a + b) / 2);
  }
  return out;
}

/** Ratios (rₖ − rₖ₋₁)/(rₖ₊₁ − rₖ) of successive gaps: estimates of Feigenbaum's δ. */
export const deltaEstimates = (rs) => rs.slice(2).map((r, i) => (rs[i + 1] - rs[i]) / (r - rs[i + 1]));

/** The accumulation point estimated from the last two doublings and δ: r∞ ≈ rₖ + (rₖ − rₖ₋₁)/(δ − 1). */
export const accumulation = (rs, delta = FEIGENBAUM_DELTA) => rs[rs.length - 1] + (rs[rs.length - 1] - rs[rs.length - 2]) / (delta - 1);
