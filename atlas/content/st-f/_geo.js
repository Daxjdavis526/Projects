// Helpers for the geodesic lab (st-f F14.1–F14.3) and the course boss: test
// particles in the Schwarzschild spacetime, equatorial, with G = c = 1 and
// lengths and proper times in units of M unless a mass is passed. Written in
// JavaScript's doubles, the same IEEE 754 binary64 arithmetic as Python's
// floats, so the numbers a lesson prints are the numbers a learner's NumPy
// program reproduces.
//
// Level 1: radial motion in proper time, r̈ = −M/r² + L²/r³ − 3ML²/r⁴, and the
//   exact radial fall from rest, the cycloid r = (R/2)(1 + cos η),
//   τ = √(R³/8M)(η + sin η).
// Level 2: the orbit equation u″ + u = M/L² + 3Mu² (u = 1/r, ′ = d/dφ), with
//   periapses located as events, and the exact precession per radial period
//   Φ − 2π = 4K(m)/√(2M(u₃ − u₁)) − 2π.
// Level 3: the geodesic equation for (t, r, φ) as six first-order equations
//   with the monitors E = (1 − 2M/r)ṫ, L = r²φ̇ and u·u; and the reduced
//   Hamiltonian H(r, pᵣ) = ½[−E²/f + f pᵣ² + L²/r²] (f = 1 − 2M/r, H = −½ on
//   a timelike geodesic) for RK4 against the symplectic implicit midpoint rule.

import { n12, lg } from './_ode.js';
export { n12, lg };

// ── Level 1: radial fall ────────────────────────────────────────────────
/** The cycloid of a fall from rest at r = R: s = √(R³/8M), r(η), τ(η). */
export function cycloid(R, M = 1) {
  const s = Math.sqrt(R ** 3 / (8 * M));
  return { s, r: (eta) => (R / 2) * (1 + Math.cos(eta)), tau: (eta) => s * (eta + Math.sin(eta)) };
}
/** The development angle η ∈ [0, π] at proper time τ (bisection: τ(η) is increasing). */
export function etaAt(R, tau, M = 1) {
  const { tau: T } = cycloid(R, M);
  let lo = 0, hi = Math.PI;
  for (let i = 0; i < 200 && hi - lo > 0; i++) { const mid = (lo + hi) / 2; if (T(mid) < tau) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/** The exact radius at proper time τ of a fall from rest at R. */
export const rFall = (R, tau, M = 1) => (R / 2) * (1 + Math.cos(etaAt(R, tau, M)));
/** Proper time from rest at R to the horizon r = 2M, and to r = 0. */
export function tauHorizon(R, M = 1) { const e = Math.acos((4 * M) / R - 1); return cycloid(R, M).tau(e); }
export const tauCrunch = (R, M = 1) => Math.PI * Math.sqrt(R ** 3 / (8 * M));

/** The radial acceleration r̈(r) for angular momentum L per unit mass. */
export const radialAcc = (L = 0, M = 1) => (r) => -M / (r * r) + (L * L) / r ** 3 - (3 * M * L * L) / r ** 4;

/**
 * n fixed steps of `method` ('euler' | 'verlet' | 'rk4') on r̈ = a(r) from
 * (r0, v0) over proper time T. Returns { r, v } at τ = T and, with
 * path: true, every [τ, r].
 */
export function fall(method, r0, T, n, { L = 0, M = 1, v0 = 0, path = false } = {}) {
  const a = radialAcc(L, M), h = T / n;
  let r = r0, v = v0;
  const pts = path ? [[0, r]] : null;
  for (let i = 0; i < n; i++) {
    if (method === 'euler') { const ar = a(r); r += h * v; v += h * ar; }
    else if (method === 'verlet') { v += (h / 2) * a(r); r += h * v; v += (h / 2) * a(r); }
    else {
      const k1r = v, k1v = a(r);
      const k2r = v + (h / 2) * k1v, k2v = a(r + (h / 2) * k1r);
      const k3r = v + (h / 2) * k2v, k3v = a(r + (h / 2) * k2r);
      const k4r = v + h * k3v, k4v = a(r + h * k3r);
      r += (h / 6) * (k1r + 2 * k2r + 2 * k3r + k4r);
      v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    }
    if (path) pts.push([(i + 1) * h, r]);
  }
  return { r, v, path: pts };
}

// ── Level 2: the orbit equation ────────────────────────────────────────
/** Complete elliptic integral of the first kind K(m), m = k², by the AGM. */
export function ellipK(m) {
  let a = 1, b = Math.sqrt(1 - m);
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-16 * a; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return Math.PI / (2 * a);
}
/**
 * A bound orbit from its periapsis rₚ and apoapsis rₐ: u₁ = 1/rₐ, u₂ = 1/rₚ,
 * u₃ = 1/(2M) − u₁ − u₂ (the third root of the cubic), L² = 1/(u₁u₂ + (u₁ + u₂)u₃),
 * E² = (1 − 2Mu₂)(1 + L²u₂²), the semi-latus rectum p = 2rₚrₐ/(rₚ + rₐ), the
 * exact precession per radial period and the weak-field 6πM/p.
 */
export function orbitOf(rp, ra, M = 1) {
  const u1 = 1 / ra, u2 = 1 / rp, u3 = 1 / (2 * M) - u1 - u2;
  const L2 = 1 / (u1 * u2 + (u1 + u2) * u3), E2 = (1 - 2 * M * u2) * (1 + L2 * u2 * u2);
  const m = (u2 - u1) / (u3 - u1), Phi = (4 * ellipK(m)) / Math.sqrt(2 * M * (u3 - u1));
  const p = (2 * rp * ra) / (rp + ra);
  return { rp, ra, u1, u2, u3, L: Math.sqrt(L2), L2, E: Math.sqrt(E2), E2, m, K: ellipK(m), Phi, exact: Phi - 2 * Math.PI, weak: (6 * Math.PI * M) / p, p };
}

/**
 * Integrate u″ = M/L² − u + 3Mu² (drop the last term with newton: true) from
 * apoapsis (u = 1/rₐ, u′ = 0, φ = 0) with N fixed steps per 2π of φ, by
 * 'rk4' or 'verlet' (kick–drift–kick), until `orbits` + 1 periapses have been
 * found. A periapsis is where u′ crosses from + to −; `locate` finds the
 * crossing by 'linear' interpolation of u′ or by the 'hermite' cubic through
 * u′ and u″ at both ends of the step (fourth-order accurate). Returns the
 * mean advance per radial period, (φ of the last periapsis − φ of the first)/orbits − 2π,
 * the periapsis angles and, with path: true, every [φ, u].
 */
export function precession(rp, ra, N, { orbits = 1, method = 'rk4', locate = 'hermite', M = 1, newton = false, path = false } = {}) {
  const { L2 } = orbitOf(rp, ra, M);
  const g = newton ? (u) => M / L2 - u : (u) => M / L2 - u + 3 * M * u * u;
  const h = (2 * Math.PI) / N;
  let u = 1 / ra, w = 0, phi = 0;
  const peri = [], pts = path ? [[0, u]] : null;
  for (let guard = 0; peri.length < orbits + 1 && guard < 1e7; guard++) {
    const u0 = u, w0 = w;
    if (method === 'verlet') { w += (h / 2) * g(u); u += h * w; w += (h / 2) * g(u); }
    else {
      const k1u = w, k1w = g(u);
      const k2u = w + (h / 2) * k1w, k2w = g(u + (h / 2) * k1u);
      const k3u = w + (h / 2) * k2w, k3w = g(u + (h / 2) * k2u);
      const k4u = w + h * k3w, k4w = g(u + h * k3u);
      u += (h / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
      w += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
    }
    if (w0 > 0 && w <= 0) {
      if (locate === 'linear') peri.push(phi + (h * w0) / (w0 - w));
      else {
        const a0 = g(u0), a1 = g(u);
        const H = (s) => (2 * s ** 3 - 3 * s * s + 1) * w0 + (s ** 3 - 2 * s * s + s) * h * a0 + (-2 * s ** 3 + 3 * s * s) * w + (s ** 3 - s * s) * h * a1;
        let lo = 0, hi = 1;
        for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (H(mid) > 0) lo = mid; else hi = mid; }
        peri.push(phi + h * ((lo + hi) / 2));
      }
    }
    phi += h;
    if (path) pts.push([phi, u]);
  }
  return { adv: (peri[peri.length - 1] - peri[0]) / orbits - 2 * Math.PI, peri, path: pts };
}

export const ARCSEC = (180 / Math.PI) * 3600;
/** Mercury (GM☉ from IAU 2015, mean elements a, e and the sidereal period in days). */
export const MERCURY = { GM: 1.32712440018e20, c: 299792458, a: 5.790905e10, e: 0.20563, P: 87.9691 };
/** Planets for transfer problems: semi-major axis (m), eccentricity, sidereal period (d). */
export const PLANETS = {
  Mercury: { a: 5.790905e10, e: 0.20563, P: 87.9691 },
  Venus: { a: 1.0820893e11, e: 0.006773, P: 224.701 },
  Earth: { a: 1.49598023e11, e: 0.0167086, P: 365.256 },
};
export const M_SUN_M = MERCURY.GM / MERCURY.c ** 2;        // GM☉/c², metres (1476.6 m)
export const M_SUN_S = MERCURY.GM / MERCURY.c ** 3;        // GM☉/c³, seconds (4.9255 µs)
/** Arcseconds per century from radians per orbit and the period in days. */
export const perCentury = (radPerOrbit, P) => radPerOrbit * ARCSEC * (36525 / P);

// ── Level 3: the geodesic equation ─────────────────────────────────────
/**
 * The equatorial geodesic equation as y′ = F(y) for y = [t, r, φ, ṫ, ṙ, φ̇]
 * (dots: d/dτ). The non-zero Christoffel symbols: Γᵗₜᵣ = M/(r²f),
 * Γʳₜₜ = Mf/r², Γʳᵣᵣ = −M/(r²f), Γʳ_φφ = −rf, Γ^φᵣ_φ = 1/r, with f = 1 − 2M/r.
 */
export function geoRHS(M = 1, bug = null) {
  return (y) => {
    const [, r, , td, rd, pd] = y, f = 1 - (2 * M) / r;
    const Grrr = bug === 'Grrr' ? M / (r * r * f) : -M / (r * r * f);
    return [td, rd, pd, -2 * (M / (r * r * f)) * td * rd, -(M * f / (r * r)) * td * td - Grrr * rd * rd + r * f * pd * pd, -(2 / r) * rd * pd];
  };
}
/** The monitors: E = fṫ, L = r²φ̇, and u·u = −fṫ² + ṙ²/f + r²φ̇² (−1 exactly). */
export function monitors(y, M = 1) {
  const [, r, , td, rd, pd] = y, f = 1 - (2 * M) / r;
  return { E: f * td, L: r * r * pd, uu: -f * td * td + (rd * rd) / f + r * r * pd * pd };
}
/** The state at apoapsis of the orbit (rₚ, rₐ). */
export function apoState(rp, ra, M = 1) {
  const o = orbitOf(rp, ra, M), f = 1 - (2 * M) / ra;
  return { y: [0, ra, 0, o.E / f, 0, o.L / (ra * ra)], E: o.E, L: o.L };
}
/** A circular orbit at r: L² = Mr²/(r − 3M), E = (r − 2M)/√(r(r − 3M)). */
export function circular(r, M = 1) {
  const L = Math.sqrt((M * r * r) / (r - 3 * M)), E = (r - 2 * M) / Math.sqrt(r * (r - 3 * M));
  return { L, E, y: [0, r, 0, E / (1 - (2 * M) / r), 0, L / (r * r)] };
}
/** ω² of small radial oscillations about a circular orbit, in proper time: M(r − 6M)/(r³(r − 3M)). */
export const epicyclic2 = (r, M = 1) => (M * (r - 6 * M)) / (r ** 3 * (r - 3 * M));
/** The radial effective potential V(r) = (1 − 2M/r)(1 + L²/r²); ṙ² = E² − V. */
export const Veff = (r, L, M = 1) => (1 - (2 * M) / r) * (1 + (L * L) / (r * r));

/** One RK4 step of y′ = F(y) for an array state. */
export function rk4(F, y, h) {
  const k1 = F(y), y2 = y.map((v, i) => v + (h / 2) * k1[i]);
  const k2 = F(y2), y3 = y.map((v, i) => v + (h / 2) * k2[i]);
  const k3 = F(y3), y4 = y.map((v, i) => v + h * k3[i]);
  const k4 = F(y4);
  return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
/** n RK4 steps of the geodesic equation; calls each(i, y) after every step (if given). Returns the last state. */
export function geoRun(y0, h, n, { M = 1, bug = null, each = null } = {}) {
  const F = geoRHS(M, bug);
  let y = y0;
  for (let i = 1; i <= n; i++) { y = rk4(F, y, h); if (each) each(i, y); }
  return y;
}

/** The reduced Hamiltonian system for (r, pᵣ) with E and L fixed: [ṙ, ṗᵣ] and H itself. */
export function hamOf(E, L, M = 1) {
  const F = ([r, pr]) => {
    const f = 1 - (2 * M) / r, fp = (2 * M) / (r * r);
    return [f * pr, -0.5 * ((E * E * fp) / (f * f) + fp * pr * pr - (2 * L * L) / r ** 3)];
  };
  const H = ([r, pr]) => { const f = 1 - (2 * M) / r; return 0.5 * ((-E * E) / f + f * pr * pr + (L * L) / (r * r)); };
  return { F, H };
}
/** One implicit-midpoint step z₁ = z₀ + hF((z₀ + z₁)/2), solved by fixed-point iteration to round-off. */
export function midpoint(F, z, h) {
  let zn = z.slice();
  for (let k = 0; k < 60; k++) {
    const d = F([(z[0] + zn[0]) / 2, (z[1] + zn[1]) / 2]);
    const z1 = [z[0] + h * d[0], z[1] + h * d[1]];
    const done = Math.abs(z1[0] - zn[0]) + Math.abs(z1[1] - zn[1]) < 1e-15 * (1 + Math.abs(z1[0]));
    zn = z1;
    if (done) break;
  }
  return zn;
}
