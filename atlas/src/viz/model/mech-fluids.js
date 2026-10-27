// Fluids at rest and in steady flow — the DOM-free physics behind the
// mech-tank and mech-flow simulations (tested headlessly in
// test/mech-fluids.test.mjs). SI units throughout: Pa, kg/m³, m, m/s, m³/s.
//
// The idealisations are the textbook ones and the sims' captions say so:
// liquids are incompressible; flow is steady and inviscid along a streamline
// (Bernoulli), uniform across each section of a pipe (one-dimensional), and
// the Pitot probe sits in two-dimensional potential flow (a Rankine half-body).

import { airDensity } from './mech-forces.js';

/** The Atlas's g for these lessons, m/s² (as in the other PHYS 2210 models). */
export const G = 9.8;
/** One standard atmosphere, Pa (exact by definition). */
export const P_ATM = 101325;
/** Sea-level air density of the standard atmosphere, kg/m³ (15 °C). */
export const RHO_SL = 1.225;

/**
 * Liquids (and air) the sims offer by name. Densities are rounded textbook or
 * handbook values; `pv` is the vapour pressure at the stated condition (Pa),
 * where a sim warns of boiling (cavitation) — null when not modelled.
 */
export const FLUIDS = {
  water: { label: 'water', rho: 1000, pv: 2339, note: '20 °C' },
  seawater: { label: 'seawater', rho: 1025, pv: 2339, note: '20 °C' },
  mercury: { label: 'mercury', rho: 13600, pv: null, note: 'the textbook 13.6 × 10³ kg/m³' },
  lox: { label: 'liquid oxygen', rho: 1141, pv: 101325, note: 'at its boiling point, 90 K' },
  rp1: { label: 'RP-1', rho: 810, pv: null, note: 'rocket kerosene, about 810 kg/m³' },
  lh2: { label: 'liquid hydrogen', rho: 70.8, pv: 101325, note: 'at its boiling point, 20 K' },
  oil: { label: 'oil', rho: 900, pv: null, note: 'a light oil' },
  air: { label: 'air', rho: RHO_SL, pv: null, note: 'sea level, 15 °C' },
};

/** A fluid by name, or { rho } given directly. */
export function fluid(name, rho) {
  if (Number.isFinite(rho)) return { label: 'fluid', rho, pv: null };
  return FLUIDS[name] || FLUIDS.water;
}

// ─── fluids at rest ────────────────────────────────────────────────────────

/** Pressure at depth h below a surface held at p0: p = p0 + ρ g h. */
export const pressureAt = (p0, rho, h, g = G) => p0 + rho * g * h;

/** The height of liquid whose weight per area is p: h = p/(ρ g). */
export const headOf = (p, rho, g = G) => p / (rho * g);

/** A U-tube manometer: the level difference for a pressure difference Δp (m). */
export const manometerRise = (dp, rho, g = G) => dp / (rho * g);

/**
 * A block (a cube of volume V) in a liquid.
 *   hold 'scale': hung from a spring scale with its bottom face `depth` below
 *                 the surface (negative: still in the air); the scale reads T
 *   hold 'free':  left alone — it floats if it is less dense than the liquid,
 *                 otherwise it rests on the floor, which pushes up with N
 * Returns the side s, the submerged fraction, the forces W, B, T, N (N) and
 * the depth of the block's bottom below the surface.
 */
export function block({ rhoObj, V, rhoFluid, hold = 'scale', depth = 0, floorDepth = Infinity, g = G }) {
  const s = Math.cbrt(V), W = rhoObj * V * g;
  const floatDepth = rhoObj < rhoFluid ? (rhoObj / rhoFluid) * s : Infinity;   // where B would equal W
  let bottom;
  if (hold === 'free') bottom = Math.min(floatDepth, floorDepth);
  // on a scale: lowered past the depth where it would float, the string goes slack and it floats
  else bottom = Math.min(depth, floorDepth, floatDepth);
  const sub = Math.max(0, Math.min(1, bottom / s));
  const B = rhoFluid * V * sub * g;
  let T = 0, N = 0;
  const onFloor = bottom >= floorDepth && floatDepth > floorDepth;
  if (onFloor) N = Math.max(0, W - B);              // the floor holds what the liquid does not
  else if (hold === 'scale') T = Math.max(0, W - B); // the scale does (zero once it floats)
  return { s, W, B, T, N, sub, bottom, floats: bottom === floatDepth && !onFloor, onFloor };
}

/** Fraction of a floating body's volume below the surface: ρ_object/ρ_fluid (capped at 1). */
export const floatFraction = (rhoObj, rhoFluid) => Math.min(1, rhoObj / rhoFluid);

/** Net upward force on a balloon of volume V filled with gas of density ρ_gas, carrying mass m (N). */
export const balloonLift = (V, rhoAir, rhoGas, m = 0, g = G) => (rhoAir - rhoGas) * V * g - m * g;

// ─── steady flow in a pipe ─────────────────────────────────────────────────

/** Volume flow rate Q = A v (m³/s) and mass flow rate ρ A v (kg/s). */
export const flowRate = (A, v) => A * v;
export const massFlow = (rho, A, v) => rho * A * v;
/** Continuity for an incompressible fluid: v₂ = v₁ A₁/A₂. */
export const continuity = (v1, A1, A2) => (v1 * A1) / A2;
/** Area of a circle of diameter D. */
export const areaOf = (D) => (Math.PI * D * D) / 4;

/**
 * Bernoulli along a streamline: p₂ = p₁ + ½ρ(v₁² − v₂²) + ρg(y₁ − y₂).
 * Steady, incompressible, inviscid.
 */
export const bernoulli = (p1, v1, y1, v2, y2, rho, g = G) => p1 + 0.5 * rho * (v1 * v1 - v2 * v2) + rho * g * (y1 - y2);

/** A Venturi meter: the inlet speed from the pressure drop Δp = p₁ − p₂ between inlet and throat. */
export const venturiSpeed = (dp, A1, A2, rho) => Math.sqrt((2 * dp) / (rho * ((A1 / A2) ** 2 - 1)));

/** A Pitot-static tube: speed from the difference between total and static pressure, v = √(2Δp/ρ). */
export const pitotSpeed = (dp, rho) => Math.sqrt((2 * Math.max(0, dp)) / rho);
/** Dynamic pressure q = ½ρv². */
export const dynamicPressure = (rho, v) => 0.5 * rho * v * v;
/** Air density at an altitude in km (US Standard Atmosphere, as in the drag model). */
export const airAt = (km) => (km <= 0 ? RHO_SL : airDensity(km));
/**
 * Indicated airspeed: what a dial calibrated with sea-level density shows for
 * a true airspeed v at density ρ (incompressible): v √(ρ/ρ₀).
 */
export const indicatedAirspeed = (v, rho) => v * Math.sqrt(rho / RHO_SL);

/**
 * The shape of a Venturi tube along its length x ∈ [0, 1], as a fraction of
 * the inlet area: 1 at the inlet, easing (a cosine) down to `ratio` at the
 * throat, then back up to `out` at the outlet.
 */
export function venturiArea(x, ratio, out = 1) {
  const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)));
  if (x <= 0.28) return 1;
  if (x < 0.42) return 1 + (ratio - 1) * ease((x - 0.28) / 0.14);
  if (x <= 0.58) return ratio;
  if (x < 0.8) return ratio + (out - ratio) * ease((x - 0.58) / 0.22);
  return out;
}

/**
 * The state of the flow at x along a Venturi tube: area fraction, speed,
 * static pressure and dynamic pressure. `rise` lifts the centreline
 * smoothly by that many metres from inlet to outlet.
 */
export function venturiAt(x, { v1, ratio, out = 1, p1, rho, rise = 0, g = G }) {
  const a = venturiArea(x, ratio, out), v = v1 / a;
  const y = rise * (0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x))));
  const p = bernoulli(p1, v1, 0, v, y, rho, g);
  return { a, v, y, p, q: dynamicPressure(rho, v), total: p + dynamicPressure(rho, v) + rho * g * y };
}

// ─── viscous flow (a preview) ──────────────────────────────────────────────

/** Poiseuille flow: Q = π R⁴ Δp / (8 η L). */
export const poiseuille = (R, dp, eta, L) => (Math.PI * R ** 4 * dp) / (8 * eta * L);
/** The parabolic speed profile of Poiseuille flow at distance r from the axis. */
export const poiseuilleSpeed = (r, R, dp, eta, L) => (dp / (4 * eta * L)) * (R * R - r * r);
/** Reynolds number ρ v D / η. */
export const reynolds = (rho, v, D, eta) => (rho * v * D) / eta;

// ─── the Pitot probe as a Rankine half-body ───────────────────────────────
// A uniform stream U along +x plus a 2D source of strength m at the origin.
// The dividing streamline is a blunt body of half-width a = m/(2U) far
// downstream, whose nose — the stagnation point — sits at x = −a/π.

/** Velocity (u, v) of the half-body flow at (x, y) for a probe of half-width a in a stream U. */
export function halfBodyVelocity(x, y, U, a) {
  const m = 2 * U * a, r2 = x * x + y * y;
  if (r2 < 1e-12) return [0, 0];
  const k = m / (2 * Math.PI * r2);
  return [U + k * x, k * y];
}

/** Stream function ψ = U y + (m/2π) θ; the body is |ψ| < m/2 behind the stagnation point. */
export function halfBodyPsi(x, y, U, a) {
  const m = 2 * U * a;
  return U * y + (m / (2 * Math.PI)) * Math.atan2(y, x);
}

/** True when (x, y) lies inside the probe (the half-body). */
export function insideHalfBody(x, y, a) {
  const th = Math.atan2(Math.abs(y), x);          // 0 … π for the upper half (mirror the lower)
  if (th <= 1e-9) return Math.abs(y) < a;         // straight behind: inside within the half-width
  if (th >= Math.PI - 1e-9) return x > -a / Math.PI;   // straight ahead: inside behind the nose
  // the surface at polar angle θ: r = a (π − θ)/(π sin θ)
  const rs = (a * (Math.PI - th)) / (Math.PI * Math.sin(th));
  return Math.hypot(x, y) < rs;
}

/** A point on the probe's surface at polar angle θ ∈ (0, π) (upper half). */
export function halfBodySurface(th, a) {
  const r = (a * (Math.PI - th)) / (Math.PI * Math.sin(th));
  return [r * Math.cos(th), r * Math.sin(th)];
}

/** Pressure coefficient Cp = (p − p∞)/(½ρU²) = 1 − (q/U)² at a point of the flow. */
export function halfBodyCp(x, y, U, a) {
  const [u, v] = halfBodyVelocity(x, y, U, a);
  return 1 - (u * u + v * v) / (U * U);
}
