// FLRW cosmology, DOM-free: the Friedmann equation for matter, radiation, a
// cosmological constant and spatial curvature, written with density
// parameters Ω (fractions of the critical density today) and H₀ in km/s/Mpc.
// The scale factor a is 1 today. Times are in Gyr (10⁹ Julian years) and
// distances in Mpc unless a name says otherwise. Tested in
// test/gr-cosmology.test.mjs.
//
//   H(a)² = H₀² [Ω_r a⁻⁴ + Ω_m a⁻³ + Ω_k a⁻² + Ω_Λ],   Ω_k = 1 − Ω_r − Ω_m − Ω_Λ
//   ä = H₀² [−Ω_r a⁻³ − Ω_m a⁻²/2 + Ω_Λ a]

import { simpson, rk4 } from './numeric.js';

export const G = 6.674e-11;                  // m³ kg⁻¹ s⁻²
export const C_KMS = 299792.458;             // km/s
export const MPC_KM = 3.0857e19;             // km per Mpc
export const GYR_S = 1e9 * 365.25 * 86400;   // s per Gyr
export const M_PROTON = 1.67262192e-27;      // kg
export const LY_PER_MPC = 3.26156e6;

/** 1/H₀, the Hubble time, in Gyr (977.8/H₀). */
export const hubbleTime = (H0) => MPC_KM / H0 / GYR_S;
/** c/H₀, the Hubble radius, in Mpc. */
export const hubbleRadius = (H0) => C_KMS / H0;
/** H₀ in s⁻¹. */
export const H0perSecond = (H0) => H0 / MPC_KM;
/** Critical density 3H₀²/(8πG), kg/m³. */
export const rhoCrit = (H0) => (3 * H0perSecond(H0) ** 2) / (8 * Math.PI * G);

const Ok = (P) => 1 - P.Om - P.OL - (P.Or || 0);
/** E(a)² = H(a)²/H₀². */
export const E2 = (a, P) => (P.Or || 0) / a ** 4 + P.Om / a ** 3 + Ok(P) / a ** 2 + P.OL;
/** Deceleration parameter today, q₀ = Ω_r + Ω_m/2 − Ω_Λ (negative: speeding up). */
export const q0 = (P) => (P.Or || 0) + P.Om / 2 - P.OL;
/** Redshift at which the expansion began to speed up (matter and Λ only). */
export const zAccel = (P) => Math.cbrt((2 * P.OL) / P.Om) - 1;
/** Redshift at which matter and Λ had equal densities. */
export const zEqualLambda = (P) => Math.cbrt(P.OL / P.Om) - 1;

/** Age of a flat matter + Λ universe, closed form: (2/(3H₀√Ω_Λ)) asinh √(Ω_Λ/Ω_m), in Gyr. */
export const ageFlat = (Om, H0) => ((2 / (3 * Math.sqrt(1 - Om))) * Math.asinh(Math.sqrt((1 - Om) / Om))) * hubbleTime(H0);

/** Age (Gyr) by quadrature, t₀ = ∫₀¹ a da / √(Ω_r + Ω_m a + Ω_k a² + Ω_Λ a⁴) — valid when the expansion never paused in the past. */
export function ageIntegral(P, H0, n = 20000) {
  // substitute a = u² to tame the start: dt = 2u³ du / √(…)
  const f = (u0) => { const u = Math.max(u0, 1e-9), a = u * u; const d = (P.Or || 0) + P.Om * a + Ok(P) * a * a + P.OL * a ** 4; return d > 0 ? (2 * u ** 3) / Math.sqrt(d) : NaN; };
  return simpson(f, 0, 1, n) * hubbleTime(H0);
}

/** Comoving distance (Mpc) to redshift z: (c/H₀) ∫₀ᶻ dz′/E(z′). z = Infinity gives the particle horizon. */
export function comovingDistance(z, P, H0, n = 20000) {
  // in terms of a: ∫_{a}^{1} da / (a² E(a)) = ∫ da / √(Ω_r + Ω_m a + Ω_k a² + Ω_Λ a⁴); substitute a = u²
  const aLo = z === Infinity ? 0 : 1 / (1 + z);
  const f = (u0) => { const u = Math.max(u0, 1e-9), a = u * u; return (2 * u) / Math.sqrt((P.Or || 0) + P.Om * a + Ok(P) * a * a + P.OL * a ** 4); };
  return simpson(f, Math.sqrt(aLo), 1, n) * hubbleRadius(H0);
}

/** Lookback time (Gyr) to redshift z: (1/H₀) ∫₀ᶻ dz′/((1 + z′)E(z′)). */
export function lookbackTime(z, P, H0, n = 20000) {
  const f = (u) => { const a = u * u; return (2 * u ** 3) / Math.sqrt((P.Or || 0) + P.Om * a + Ok(P) * a * a + P.OL * a ** 4); };
  return simpson(f, Math.sqrt(1 / (1 + z)), 1, n) * hubbleTime(H0);
}

// time (units of 1/H₀) for a to grow from 0 to a small aF, where only matter and radiation matter
function earlyTime(aF, P) {
  const d = (a) => (P.Or || 0) + P.Om * a + Ok(P) * a * a + P.OL * a ** 4;
  return simpson((a) => (d(a) > 0 ? a / Math.sqrt(d(a)) : NaN), 1e-12, aF, 200);
}

/**
 * The whole history a(t): integrate ä from today (a = 1, ȧ = H₀) into the
 * past and the future. Returns points [t, a] with t in Gyr measured from
 * today, sorted by t, and what happened: the age (Gyr since a Big Bang, or
 * null if the past has a bounce instead), the time of a Big Crunch (Gyr from
 * now, or null), and turning points (maximum expansion, or a bounce).
 */
export function history(P, H0, { tPast = 30, tFuture = 40, aMax = 5 } = {}) {
  const tH = hubbleTime(H0), Or = P.Or || 0;
  const acc = (a) => -Or / a ** 3 - P.Om / (2 * a * a) + P.OL * a;
  const f = (_t, y) => [y[1], acc(y[0])];
  const A_FLOOR = 2e-3;
  const run = (dir, tLimit) => {
    let y = [1, 1], t = 0, turn = null, end = null;
    const pts = [[0, 1]];
    for (let k = 0; k < 400000; k++) {
      const h = dir * Math.min(0.004 * Math.max(1, y[0]) ** 1.5, (0.01 * y[0]) / Math.max(Math.abs(y[1]), 1e-9));
      const yn = rk4(f, t, y, h);
      if (Math.sign(yn[1]) !== Math.sign(y[1]) && yn[1] !== 0) turn = { t: (t + h / 2) * tH, a: (y[0] + yn[0]) / 2 };
      y = yn; t += h;
      if (y[0] <= A_FLOOR) {                      // reached a Big Bang (past) or a Big Crunch (future)
        const extra = earlyTime(y[0], P);
        end = (t + dir * extra) * tH;
        pts.push([end, 0]);
        break;
      }
      if (Math.abs(t) * tH > tLimit || y[0] > aMax) { pts.push([t * tH, y[0]]); break; }
      if (k % 4 === 0) pts.push([t * tH, y[0]]);
    }
    return { pts, turn, end };
  };
  const past = run(-1, tPast), future = run(1, tFuture);
  const pts = [...past.pts.reverse(), ...future.pts.slice(1)];
  return {
    pts,
    age: past.end !== null ? -past.end : null,
    bounce: past.turn,                            // the past turned around: no Big Bang
    crunch: future.end,                           // Gyr from now
    maxExpansion: future.turn,
  };
}

/** A one-line verdict on a model's fate (plain text). */
export function fate(P, H0) {
  const hst = history(P, H0, { tFuture: 1e8, tPast: 1e3, aMax: 1e6 });
  if (hst.crunch !== null) return { kind: 'crunch', text: `recollapses: Big Crunch ${hst.crunch < 1e4 ? hst.crunch.toFixed(0) : `${(hst.crunch / 10 ** Math.floor(Math.log10(hst.crunch))).toFixed(1)}×10${String(Math.floor(Math.log10(hst.crunch))).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`} billion years from now`, hst };
  if (P.OL > 0) return { kind: 'forever-accel', text: 'expands forever, ever faster', hst };
  if (P.Om === 0 && !(P.Or > 0)) return { kind: 'forever', text: 'expands forever at a steady rate', hst };
  return { kind: 'forever', text: 'expands forever, slowing down', hst };
}
