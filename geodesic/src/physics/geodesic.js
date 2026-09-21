/* =============================================================================
   GEODESIC — the exact-Schwarzschild layer, and gravitational radiation
   -----------------------------------------------------------------------------
   Layer C of the model. Everything here is an EXACT result of general
   relativity for an idealised system, computed independently of the N-body
   integration, so the two can be drawn side by side and compared. Nothing in
   this file feeds back into the orbits: the simulation is Newtonian (plus an
   optional 1PN term) and these are the answers GR gives for the same initial
   conditions, held up against it.

   That separation is the honest one. A browser cannot solve the Einstein
   field equations; it can solve the geodesic equation of a known metric
   exactly, and it can evaluate the quadrupole formula exactly. Those are the
   two things this file does.
   ========================================================================== */

import { G, C, C2 } from './constants.js';

/* =============================================================================
   TIMELIKE GEODESICS IN SCHWARZSCHILD

   The orbit SHAPE obeys one exact ordinary differential equation. With
   u = 1/r and L the specific angular momentum r^2 dphi/dtau,

       d^2u/dphi^2 + u = GM/L^2 + 3GM u^2 / c^2

   The first term on the right is Newton; the second is the whole of general
   relativity's correction to the orbit of a test particle around a static
   spherical mass. Dropping it gives a closed ellipse. Keeping it makes the
   ellipse precess, at 6 pi GM / (c^2 a (1 - e^2)) per orbit, which is where
   Mercury's 43 arcseconds per century comes from.

   Integrating in phi rather than in time is what makes this cheap enough to
   redraw every frame: one second-order ODE, no adaptive stepping, and the
   result is the closed shape rather than a sampled trajectory.
   ========================================================================== */

/* d^2u/dphi^2 as a function of u. */
function uAccel(u, GM, L2, relativistic) {
  const newtonian = GM / L2 - u;
  return relativistic ? newtonian + 3 * GM * u * u / C2 : newtonian;
}

/**
 * Trace the orbit of a test particle about a mass M.
 *
 * @param M         mass of the central body, Msun
 * @param rel       position of the particle relative to it, AU
 * @param vel       velocity relative to it, AU/yr
 * @param opts.turns        how many revolutions of phi to trace
 * @param opts.stepsPerTurn phi resolution
 * @param opts.relativistic keep the 3GMu^2/c^2 term (GR) or drop it (Newton)
 * @param opts.rMax         stop if the particle gets this far away
 * @returns { points: Float64Array (xyz triples, relative to the mass),
 *            count, escaped, captured, precessionPerOrbit (rad, analytic) }
 */
export function traceOrbit(M, rel, vel, opts = {}) {
  const turns = opts.turns ?? 3;
  const stepsPerTurn = opts.stepsPerTurn ?? 360;
  const relativistic = opts.relativistic ?? true;
  const GM = G * M;

  const r = Math.hypot(rel[0], rel[1], rel[2]);
  if (!(r > 0) || !(GM > 0)) return { points: new Float64Array(0), count: 0 };

  /* Orbital plane: the specific angular momentum fixes it. */
  const Lv = [
    rel[1] * vel[2] - rel[2] * vel[1],
    rel[2] * vel[0] - rel[0] * vel[2],
    rel[0] * vel[1] - rel[1] * vel[0],
  ];
  const L = Math.hypot(Lv[0], Lv[1], Lv[2]);
  if (!(L > 0)) return { points: new Float64Array(0), count: 0 };   // radial fall

  const er = [rel[0] / r, rel[1] / r, rel[2] / r];
  const en = [Lv[0] / L, Lv[1] / L, Lv[2] / L];
  /* e_perp = n x r_hat completes a right-handed frame in which phi increases
     in the direction the particle is actually moving. */
  const ep = [
    en[1] * er[2] - en[2] * er[1],
    en[2] * er[0] - en[0] * er[2],
    en[0] * er[1] - en[1] * er[0],
  ];

  /* du/dphi = -(dr/dphi)/r^2, and dr/dphi = v_r r^2 / L. */
  const vr = (rel[0] * vel[0] + rel[1] * vel[1] + rel[2] * vel[2]) / r;
  let u = 1 / r;
  let du = -vr / L;

  const n = turns * stepsPerTurn;
  const h = (2 * Math.PI) / stepsPerTurn;
  const pts = new Float64Array((n + 1) * 3);
  const rs = 2 * GM / C2;
  const rMax = opts.rMax ?? r * 40;
  const L2 = L * L;

  let count = 0, escaped = false, captured = false;
  for (let i = 0; i <= n; i++) {
    const rr = 1 / u;
    if (!(rr > 0) || rr > rMax) { escaped = true; break; }
    if (rr <= rs * 1.0001) { captured = true; break; }

    const phi = i * h;
    const cp = Math.cos(phi), sp = Math.sin(phi);
    pts[count * 3]     = rr * (er[0] * cp + ep[0] * sp);
    pts[count * 3 + 1] = rr * (er[1] * cp + ep[1] * sp);
    pts[count * 3 + 2] = rr * (er[2] * cp + ep[2] * sp);
    count++;

    /* RK4 on (u, du/dphi). */
    const f = (uu) => uAccel(uu, GM, L2, relativistic);
    const k1u = du,                 k1d = f(u);
    const k2u = du + h / 2 * k1d,   k2d = f(u + h / 2 * k1u);
    const k3u = du + h / 2 * k2d,   k3d = f(u + h / 2 * k2u);
    const k4u = du + h * k3d,       k4d = f(u + h * k3u);
    u  += h / 6 * (k1u + 2 * k2u + 2 * k3u + k4u);
    du += h / 6 * (k1d + 2 * k2d + 2 * k3d + k4d);
  }

  return {
    points: pts, count, escaped, captured,
    precessionPerOrbit: precessionPerOrbit(M, rel, vel),
  };
}

/* Analytic apsidal advance per orbit, 6 pi GM / (c^2 a (1-e^2)) — the closed
   form the traced curve should reproduce, and the one the UI quotes. */
export function precessionPerOrbit(M, rel, vel) {
  const { a, e } = elements(M, rel, vel);
  if (!(a > 0) || !(e < 1)) return 0;
  return 6 * Math.PI * G * M / (C2 * a * (1 - e * e));
}

/* Osculating Keplerian elements of a relative state vector. */
export function elements(M, rel, vel) {
  const GM = G * M;
  const r = Math.hypot(rel[0], rel[1], rel[2]);
  const v2 = vel[0] ** 2 + vel[1] ** 2 + vel[2] ** 2;
  const energy = v2 / 2 - GM / r;
  const a = -GM / (2 * energy);
  const Lv = [
    rel[1] * vel[2] - rel[2] * vel[1],
    rel[2] * vel[0] - rel[0] * vel[2],
    rel[0] * vel[1] - rel[1] * vel[0],
  ];
  const L2 = Lv[0] ** 2 + Lv[1] ** 2 + Lv[2] ** 2;
  const e = Math.sqrt(Math.max(0, 1 + 2 * energy * L2 / (GM * GM)));
  return { a, e, energy, L: Math.sqrt(L2) };
}

/* =============================================================================
   GRAVITATIONAL RADIATION — the quadrupole formula

   Exact to leading post-Newtonian order for two point masses in a Keplerian
   orbit (Peters & Mathews 1963; Peters 1964). Every quantity below is a
   closed-form evaluation of those results, not a simulation of them.

   IMPORTANT, and stated in the UI: the N-body integration here has NO
   radiation reaction. These numbers say how fast the orbit would shrink; the
   orbit on screen will not shrink. Adding the 2.5PN reaction term would
   change that, and until it is added the simulator must not imply otherwise.
   ========================================================================== */

/* Peters' eccentricity enhancement of the radiated power. */
export function eccentricityFactor(e) {
  const e2 = e * e;
  return (1 + (73 / 24) * e2 + (37 / 96) * e2 * e2) / (1 - e2) ** 3.5;
}

/**
 * Radiation from a bound pair, in internal units unless noted.
 * Returns power (Msun AU^2 / yr^3), da/dt, the merger time in years, the
 * dominant GW frequency in Hz, the chirp mass, and the strain amplitude at a
 * stated distance.
 */
export function radiation(m1, m2, rel, vel, opts = {}) {
  const M = m1 + m2;
  const { a, e } = elements(M, rel, vel);
  if (!(a > 0) || !(e < 1)) return null;

  const fe = eccentricityFactor(e);
  const G4c5 = G ** 4 / C ** 5;

  /* dE/dt, positive = energy radiated away. */
  const power = (32 / 5) * G4c5 * (m1 * m1 * m2 * m2 * M) / a ** 5 * fe;

  /* Peters' orbit-averaged shrinkage. */
  const dadt = -(64 / 5) * (G ** 3) * m1 * m2 * M / (C ** 5 * a ** 3) * fe;

  /* Circular-orbit coalescence time; for e > 0 this is an overestimate and
     the UI says so. */
  const tMerge = (5 / 256) * (C ** 5) * a ** 4 / (G ** 3 * m1 * m2 * M);

  /* Orbital and dominant (l=m=2) gravitational-wave frequency. */
  const fOrb = Math.sqrt(G * M / a ** 3) / (2 * Math.PI);     // per year
  const fGwHz = 2 * fOrb / 3.15576e7;

  const chirp = (m1 * m2) ** 0.6 / M ** 0.2;                  // Msun

  /* Strain amplitude at distance D (AU), circular approximation:
       h = (4/D) (G Mc / c^2)^(5/3) (pi f_gw / c)^(2/3)
     with f_gw in inverse years to stay in internal units. */
  const D = opts.distance ?? 6.324e9;                         // 100 kpc, AU
  const fGw = 2 * fOrb;
  const h = (4 / D) * (G * chirp / C2) ** (5 / 3) * (Math.PI * fGw / C) ** (2 / 3);

  return { a, e, power, dadt, tMerge, fOrb, fGwHz, chirp, strain: h, distance: D };
}

/* Angular pattern of the radiated power for a circular binary, normalised to
   1 along the orbital axis. h+ goes as (1+cos^2 i)/2 and hx as cos i, so the
   power goes as the sum of their squares: eight times stronger along the axis
   than in the plane. */
export function radiationPattern(cosTheta) {
  const c2 = cosTheta * cosTheta;
  const plus = (1 + c2) / 2;
  return (plus * plus + c2) / 2;
}
