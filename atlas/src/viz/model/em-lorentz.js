// A charged particle in a uniform magnetic field B = B ẑ, optionally with a
// uniform electric field E = E ŷ across it — the physics behind the
// em-lorentz simulation (sims/em-lorentz.js). DOM-free; tested headlessly in
// test/em-lorentz.test.mjs.
//
// The motion is solved exactly (non-relativistically): the velocity splits
// into a part along B (constant), the E×B drift u = E/B along x̂ (constant), and
// a part that turns about ẑ at the signed cyclotron frequency Ω = qB/m —
// clockwise seen from +z for a positive charge when B > 0. So
//   x(t) = x₀ + u t + [w_x sin Ωt + w_y (1 − cos Ωt)]/Ω
//   y(t) = y₀ +       [w_y sin Ωt − w_x (1 − cos Ωt)]/Ω
//   z(t) = z₀ + v_z t
// with w = v₀ − u x̂. A circle of radius r = m v⊥/(|q|B) and period
// T = 2πm/(|q|B), a helix when v has a part along B, a cycloid when E is on.
// A Boris integrator (the standard particle pusher of plasma codes) is
// included so the tests can check the closed form against brute force.

export const E_CHARGE = 1.602176634e-19;     // C, exact
export const M_E = 9.1093837139e-31;         // kg, CODATA 2022
export const M_P = 1.67262192595e-27;        // kg, CODATA 2022
export const M_ALPHA = 6.6446573450e-27;     // kg, CODATA 2022
export const U_AMU = 1.66053906892e-27;      // kg, CODATA 2022
export const C = 299792458;                  // m/s, exact

/** Particles by name: charge in C, mass in kg. */
export const SPECIES = {
  electron: { q: -E_CHARGE, m: M_E, name: 'electron', short: 'e⁻' },
  proton: { q: E_CHARGE, m: M_P, name: 'proton', short: 'p⁺' },
  alpha: { q: 2 * E_CHARGE, m: M_ALPHA, name: 'alpha particle', short: 'α' },
  deuteron: { q: E_CHARGE, m: 3.3435837768e-27, name: 'deuteron', short: 'd⁺' },
  xenon: { q: E_CHARGE, m: 131.293 * U_AMU - M_E, name: 'Xe⁺ ion', short: 'Xe⁺' },
  o2: { q: E_CHARGE, m: 31.9988 * U_AMU - M_E, name: 'O₂⁺ ion', short: 'O₂⁺' },
};

/**
 * A particle from a species name, or from { q, m } given in units of e and u
 * (an ion: { q: 1, m: 12 } is ¹²C⁺, the electron's mass subtracted per charge).
 */
export function particle(s) {
  if (typeof s === 'string') {
    const p = SPECIES[s];
    if (!p) throw new Error(`unknown species “${s}”`);
    return { ...p };
  }
  const q = (s.q ?? 1) * E_CHARGE, m = (s.m ?? 1) * U_AMU - (s.q ?? 1) * M_E;
  return { q, m, name: s.name || 'ion', short: s.short || s.name || 'ion' };
}

/** Signed cyclotron angular frequency Ω = qB/m (rad/s). */
export const omega = (q, m, B) => (q * B) / m;
/** Radius of the circle, r = m v⊥/(|q|B). */
export const radius = (m, vperp, q, B) => (m * Math.abs(vperp)) / (Math.abs(q) * Math.abs(B));
/** Period of one turn, T = 2πm/(|q|B) — the same at every speed. */
export const period = (m, q, B) => (2 * Math.PI * m) / (Math.abs(q) * Math.abs(B));
/** Pitch of the helix: the distance along B covered in one turn. */
export const pitch = (m, vpar, q, B) => Math.abs(vpar) * period(m, q, B);
/** E×B drift speed for E ⊥ B (along E × B). */
export const drift = (E, B) => E / B;
/** Kinetic energy in electronvolts. */
export const kineticEV = (m, v) => (0.5 * m * v * v) / E_CHARGE;
/** Speed after falling from rest through a potential difference V (non-relativistic). */
export const speedFromVoltage = (q, m, V) => Math.sqrt((2 * Math.abs(q * V)) / m);

/**
 * The state at time t of a charge q (C), mass m (kg) starting at r0 (m) with
 * velocity v0 (m/s), in B = B ẑ (T) and E = E ŷ (V/m). Exact.
 */
export function stateAt({ q, m, B, E = 0, r0 = [0, 0, 0], v0 }, t) {
  const [x0, y0, z0] = r0, [vx0, vy0, vz0] = v0;
  if (Math.abs(B) < 1e-300) {
    const a = (q * E) / m;
    return { r: [x0 + vx0 * t, y0 + vy0 * t + 0.5 * a * t * t, z0 + vz0 * t], v: [vx0, vy0 + a * t, vz0] };
  }
  const W = omega(q, m, B), u = E / B;
  const wx = vx0 - u, wy = vy0;
  const c = Math.cos(W * t), s = Math.sin(W * t);
  // (1 − cos Ωt)/Ω and sin(Ωt)/Ω, written to stay accurate when Ωt is small
  const sOverW = Math.abs(W * t) < 1e-4 ? t * (1 - (W * t) ** 2 / 6) : s / W;
  const cOverW = Math.abs(W * t) < 1e-4 ? W * t * t * (0.5 - (W * t) ** 2 / 24) : (2 * Math.sin((W * t) / 2) ** 2) / W;
  return {
    r: [x0 + u * t + wx * sOverW + wy * cOverW, y0 + wy * sOverW - wx * cOverW, z0 + vz0 * t],
    v: [u + wx * c + wy * s, wy * c - wx * s, vz0],
  };
}

/** The Lorentz force q(E ŷ + v × B ẑ) on a charge with velocity v. */
export function force({ q, B, E = 0 }, v) {
  return [q * v[1] * B, q * (E - v[0] * B), 0];
}

/** Centre of the circle (E = 0), or of the guiding centre at t = 0 (E ≠ 0). */
export function centre({ q, m, B, E = 0, r0 = [0, 0, 0], v0 }) {
  const W = omega(q, m, B), u = E / B;
  return [r0[0] + v0[1] / W, r0[1] - (v0[0] - u) / W, r0[2]];
}

/** Positions from t0 to t1 in n steps. */
export function path(cfg, t0, t1, n = 200) {
  const out = [];
  for (let k = 0; k <= n; k++) out.push(stateAt(cfg, t0 + ((t1 - t0) * k) / n).r);
  return out;
}

/**
 * A mass spectrometer: a particle entering a field region y > y₀ moving
 * straight up (+y) turns through a half circle and lands back on the line
 * y = y₀, a distance 2r from where it entered. Returns { t, x } of landing.
 */
export function landing({ q, m, B, r0 = [0, 0, 0], v0 }) {
  const T = period(m, q, B);
  const s = stateAt({ q, m, B, r0, v0 }, T / 2);
  return { t: T / 2, x: s.r[0] };
}

/** One Boris step (dt) for a non-relativistic particle in B ẑ and E ŷ. */
export function borisStep({ q, m, B, E = 0 }, r, v, dt) {
  const h = (q * dt) / (2 * m);
  const vm = [v[0], v[1] + h * E, v[2]];                  // half electric kick
  const tz = h * B, s = (2 * tz) / (1 + tz * tz);          // rotation about z
  const vp = [vm[0] + vm[1] * tz, vm[1] - vm[0] * tz, vm[2]];
  const vr = [vm[0] + vp[1] * s, vm[1] - vp[0] * s, vm[2]];
  const v1 = [vr[0], vr[1] + h * E, vr[2]];               // second half kick
  return { r: [r[0] + v1[0] * dt, r[1] + v1[1] * dt, r[2] + v1[2] * dt], v: v1 };
}
