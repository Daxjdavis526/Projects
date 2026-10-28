// Electromagnetic induction — the physics behind the em-faraday simulation
// (sims/em-faraday.js). DOM-free; tested in test/em-faraday.test.mjs, which
// checks every emf here against −dΦ/dt taken numerically from the flux.
//
// Five set-ups, all in SI units:
//   slide        a rectangular loop crossing a region of uniform field at
//                constant speed: Φ = B h s(t), s the length of loop inside;
//   magnet       a bar magnet moving along the axis of a coil (pushed in and
//                out, at a steady speed, or dropped through it), its field
//                that of a uniformly magnetised needle;
//   ramp         a uniform field in a circular region (a long solenoid seen
//                end on) that changes in time, and the electric field it
//                induces — inside and outside the region, ring or no ring;
//   rails        a bar sliding on rails through a uniform field, closed by a
//                resistor: pushed at constant speed, coasting, or pulled by a
//                constant force;
//   transformer  an ideal transformer driven by an AC source (or switched onto
//                a DC one).
//
// Signs: the page is the x–y plane and z points out of it, toward the viewer.
// A field into the page has Bz < 0. Flux is taken through the loop with its
// normal along +z, so a positive emf (and current) circulates anticlockwise as
// the viewer sees it. In the magnet set-up, z is the coil's axis, pointing up.

export const MU0 = 4e-7 * Math.PI;   // T·m/A
export const TAU = 2 * Math.PI;
export const G = 9.81;               // m/s²

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ─── slide: a rectangular loop crossing a field region ──────────────────────
/** Length of a loop (leading edge at xr, width w) inside the region 0 ≤ x ≤ Lf. */
export const overlap = (xr, w, Lf) => clamp(xr, 0, Lf) - clamp(xr - w, 0, Lf);
const within = (u, Lf) => (u > 0 && u < Lf ? 1 : 0);

/**
 * The loop at time t. Params { Bz (T), w, h (m), Lf (m), v (m/s, > 0), x0 (m, its leading edge at t = 0), R (Ω) }.
 * Returns the leading-edge position, the overlap s, the flux, the emf, the
 * current (anticlockwise positive) and the magnetic force on the loop along x.
 */
export function slide({ Bz, w, h, Lf, v, x0 = -0.02, R = 1 }, t) {
  const xr = x0 + v * t, s = overlap(xr, w, Lf);
  const edges = within(xr, Lf) - within(xr - w, Lf);   // +1 entering, −1 leaving
  const emf = -Bz * h * v * edges, I = emf / R;
  // anticlockwise current: up the leading edge, down the trailing edge; F = I L × B
  const Fx = I * h * Bz * edges;
  return { xr, s, flux: Bz * h * s, emf, I, Fx };
}
/** The time the slide takes: from x0 until the trailing edge has left the region by `margin`. */
export const slideDuration = ({ w, Lf, v, x0 = -0.02 }, margin = 0.02) => (Lf + w + margin - x0) / v;

// ─── magnet: a bar magnet on the axis of a coil ─────────────────────────────
// A uniformly magnetised needle of moment m (A·m², signed along +z) and
// length l is a line of dipoles; its flux through a circle of radius a whose
// centre is u below the needle's centre (u = z_magnet − z_turn) is
//   φ(u) = (μ₀m / 2l) [ g(u + l/2) − g(u − l/2) ],   g(s) = s / √(a² + s²),
// which tends to the point dipole's μ₀ma² / (2(a² + u²)^{3/2}) as l → 0, and
// to μ₀m/l = μ₀MA (the flux inside the magnet) for a long needle threading it.
const g = (s, a) => s / Math.sqrt(a * a + s * s);
const gp = (s, a) => (a * a) / Math.pow(a * a + s * s, 1.5);

/** Flux of the needle through one turn (Wb). */
export function turnFlux(m, l, a, u) {
  if (!(l > 0)) return (MU0 * m * gp(u, a)) / 2;
  return ((MU0 * m) / (2 * l)) * (g(u + l / 2, a) - g(u - l / 2, a));
}
/** d(turn flux)/du. */
export function turnFluxSlope(m, l, a, u) {
  if (!(l > 0)) return (-3 * MU0 * m * a * a * u) / (2 * Math.pow(a * a + u * u, 2.5));
  return ((MU0 * m) / (2 * l)) * (gp(u + l / 2, a) - gp(u - l / 2, a));
}
/** The z of each turn of a coil of length Lc centred on z = 0, as (at most k) groups: [[z, turns], …]. */
export function coilTurns(N, Lc, k = 24) {
  const n = Math.max(1, Math.min(Math.round(N), k));
  if (!(Lc > 0) || n === 1) return [[0, N]];
  return Array.from({ length: n }, (_, i) => [-Lc / 2 + (Lc * (i + 0.5)) / n, N / n]);
}
/** Flux linkage NΦ of the coil with the magnet's centre at zc, and its slope d(NΦ)/dzc. */
export function linkage({ m, l, a, N, Lc = 0 }, zc) {
  let L = 0, dL = 0;
  for (const [z, n] of coilTurns(N, Lc)) { L += n * turnFlux(m, l, a, zc - z); dL += n * turnFluxSlope(m, l, a, zc - z); }
  return { L, dL };
}

/**
 * The magnet's motion: { motion: 'inout' | 'const' | 'drop', z0 (m, start), v (m/s), zs (m, where 'inout' stops), T1, T2 (s) }.
 *   inout  pushed from z0 to zs and pulled back, smoothly: in over [0, T1], held until T2, out over [T2, T2 + T1], then held
 *   const  moving at v (signed, along +z) from z0
 *   drop   released from rest at z0 and falling freely (the magnetic drag on it neglected)
 * Returns { z, vz }.
 */
export function magnetMotion({ motion = 'inout', z0 = 0.15, v = -0.5, zs = 0, T1 = 0.4, T2 = 1.2 }, t) {
  if (motion === 'const') return { z: z0 + v * t, vz: v };
  if (motion === 'drop') return { z: z0 - 0.5 * G * t * t, vz: -G * t };
  const d = zs - z0;
  if (t <= 0) return { z: z0, vz: 0 };
  if (t < T1) { const u = t / T1; return { z: z0 + (d * (1 - Math.cos(Math.PI * u))) / 2, vz: ((d * Math.PI) / (2 * T1)) * Math.sin(Math.PI * u) }; }
  if (t < T2) return { z: zs, vz: 0 };
  if (t < T2 + T1) { const u = (t - T2) / T1; return { z: zs - (d * (1 - Math.cos(Math.PI * u))) / 2, vz: -((d * Math.PI) / (2 * T1)) * Math.sin(Math.PI * u) }; }
  return { z: z0, vz: 0 };
}
/** How long each motion is shown: 'inout' through the pull-out and a pause; 'const' and 'drop' until the magnet is as far below as it started above. */
export function magnetDuration(P) {
  const { motion = 'inout', z0 = 0.15, v = -0.5, T1 = 0.4, T2 = 1.2 } = P;
  if (motion === 'const') return Math.abs((2 * z0) / v);
  if (motion === 'drop') return Math.sqrt((4 * z0) / G);
  return T2 + T1 + 0.4 * T1 + 0.3;
}
/** Everything at time t: position, velocity, linkage NΦ, emf = −d(NΦ)/dt, current through a circuit of resistance R. */
export function magnet(P, t) {
  const { z, vz } = magnetMotion(P, t), { L, dL } = linkage(P, z);
  const emf = -dL * vz;
  return { z, vz, flux: L, emf, I: emf / (P.R ?? 10) };
}

// ─── ramp: a changing field in a circular region, and the E it induces ──────
/**
 * Bz(t) and dBz/dt. Params { B0 (T, signed: < 0 into the page), profile: 'trapezoid' | 'sine', tr (s), f (Hz) }.
 *   trapezoid  0 until tr/2; up to B0 by 3tr/2; held until 5tr/2; down to 0 by 7tr/2; then 0 (to 4tr)
 *   sine       B0 sin 2πft
 */
export function rampField({ B0, profile = 'trapezoid', tr = 1, f = 1 }, t) {
  if (profile === 'sine') return { B: B0 * Math.sin(TAU * f * t), dB: B0 * TAU * f * Math.cos(TAU * f * t) };
  const k = B0 / tr;
  if (t < 0.5 * tr) return { B: 0, dB: 0 };
  if (t < 1.5 * tr) return { B: k * (t - 0.5 * tr), dB: k };
  if (t < 2.5 * tr) return { B: B0, dB: 0 };
  if (t < 3.5 * tr) return { B: B0 - k * (t - 2.5 * tr), dB: -k };
  return { B: 0, dB: 0 };
}
export const rampDuration = ({ profile = 'trapezoid', tr = 1, f = 1 }) => (profile === 'sine' ? 2 / f : 4 * tr);

/** The induced field's anticlockwise component at distance r from the axis of a region of radius R: E_φ = −(r/2) dBz/dt inside, −(R²/2r) dBz/dt outside. */
export const inducedE = (r, R, dB) => (r <= R ? (-r / 2) * dB : (-(R * R) / (2 * r)) * dB);
/** The induced field as a vector at (x, y), the region centred on the origin. */
export function inducedEVec(x, y, R, dB) {
  const r = Math.hypot(x, y);
  if (r < 1e-12) return [0, 0];
  const e = inducedE(r, R, dB);
  return [(-y / r) * e, (x / r) * e];
}
/** The emf round a circle of radius r centred on the axis (anticlockwise): −dΦ/dt = −π min(r, R)² dBz/dt. */
export const ringEmf = (r, R, dB) => -Math.PI * Math.min(r, R) ** 2 * dB;

// ─── rails: a bar sliding on rails, closed by a resistor ────────────────────
/**
 * The bar at time t. Params { Bz (T), L (m, rail spacing), R (Ω), mass (kg), x0 (m), motion: 'push' | 'coast' | 'pull', v (m/s), F (N) }.
 *   push   moved at constant speed v by whatever pushes it (which must supply B²L²v/R)
 *   coast  launched at v and left alone: v e^(−t/τ), τ = mR/(B²L²)
 *   pull   pulled from rest by a constant force F: terminal speed FR/(B²L²)
 * The circuit runs anticlockwise round resistor (at x = 0), lower rail, bar (at x), upper rail.
 */
export function rails({ Bz, L, R, mass = 0.05, x0 = 0.05, motion = 'push', v = 1, F = 0.1 }, t) {
  const k = (Bz * Bz * L * L) / R, tau = k > 0 ? mass / k : Infinity;
  let x, vx;
  if (motion === 'coast') { const e = Number.isFinite(tau) ? Math.exp(-t / tau) : 1; vx = v * e; x = x0 + (Number.isFinite(tau) ? v * tau * (1 - e) : v * t); }
  else if (motion === 'pull') {
    if (Number.isFinite(tau)) { const vt = F / k, e = Math.exp(-t / tau); vx = vt * (1 - e); x = x0 + vt * (t - tau * (1 - e)); }
    else { vx = (F / mass) * t; x = x0 + 0.5 * (F / mass) * t * t; }
  } else { vx = v; x = x0 + v * t; }
  const flux = Bz * L * x, emf = -Bz * L * vx, I = emf / R;
  // anticlockwise current runs up the bar (+y): F = I L ŷ × Bz ẑ = I L Bz x̂
  const Fmag = I * L * Bz;
  return { x, vx, flux, emf, I, Fmag, P: I * I * R, tau, vt: motion === 'pull' && k > 0 ? F / k : null };
}

// ─── transformer ────────────────────────────────────────────────────────────
/**
 * An ideal transformer. Params { Np, Ns, Vp (V rms), f (Hz), RL (Ω), source: 'ac' | 'dc', tau (s, the DC switch-on's time constant) }.
 * AC: vp = Vp√2 sin ωt, the core flux Φ = −(Vp√2/(Np ω)) cos ωt (so vp = Np dΦ/dt), vs = Ns dΦ/dt.
 * DC switched on at t = 0: the flux climbs to its final value as 1 − e^(−t/τ) (the primary's resistance
 * limits the current), so vs = (Ns/Np) Vp e^(−t/τ) and then nothing.
 */
export function transformer({ Np, Ns, Vp, f = 50, RL = 10, source = 'ac', tau = 0.01 }, t) {
  if (source === 'dc') {
    const phiF = (Vp * tau) / Np, e = t >= 0 ? Math.exp(-t / tau) : 1;
    const flux = t >= 0 ? phiF * (1 - e) : 0, vp = t >= 0 ? Vp : 0, vs = t >= 0 ? (Ns / Np) * Vp * e : 0;
    return { vp, vs, flux, is: vs / RL, ip: (Ns / Np) * (vs / RL) };
  }
  const w = TAU * f, V0 = Vp * Math.SQRT2;
  const vp = V0 * Math.sin(w * t), flux = -(V0 / (Np * w)) * Math.cos(w * t), vs = (Ns / Np) * vp;
  return { vp, vs, flux, is: vs / RL, ip: (Ns / Np) * (vs / RL) };
}
/** rms values of the ideal transformer: Vs = (Ns/Np)Vp, Is = Vs/RL, Ip = (Ns/Np)Is; peak core flux Vp√2/(Np ω). */
export function transformerRms({ Np, Ns, Vp, f = 50, RL = 10 }) {
  const Vs = (Ns / Np) * Vp, Is = Vs / RL, Ip = (Ns / Np) * Is;
  return { Vs, Is, Ip, P: Vs * Is, phiPeak: (Vp * Math.SQRT2) / (Np * TAU * f) };
}
