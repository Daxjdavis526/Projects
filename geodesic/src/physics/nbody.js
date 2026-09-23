/* =============================================================================
   N-BODY DYNAMICS
   -----------------------------------------------------------------------------
   Newtonian pairwise gravity, plus an optional first post-Newtonian term.
   Nothing here knows about rendering; it moves numbers.
   ========================================================================== */

import { G, C2 } from './constants.js';

/* -----------------------------------------------------------------------------
   Accelerations. O(N^2) pairwise — honest and exact for the body counts this
   simulator targets (tens, not millions). Newton's third law halves the work.

   Softening is Plummer: |r|^3 -> (|r|^2 + eps^2)^{3/2}. It is a deliberate lie
   about the force at small separation, which is why eps is surfaced in the UI
   rather than buried. With eps = 0 the force is exact.
-------------------------------------------------------------------------------*/
export function accelerations(bodies, out, opts = {}) {
  const eps2 = (opts.softening ?? 0) ** 2;
  const n = bodies.length;

  for (let i = 0; i < n; i++) { const a = out[i]; a[0] = a[1] = a[2] = 0; }

  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    for (let j = i + 1; j < n; j++) {
      const bj = bodies[j];
      const dx = bj.pos[0] - bi.pos[0];
      const dy = bj.pos[1] - bi.pos[1];
      const dz = bj.pos[2] - bi.pos[2];
      const r2 = dx * dx + dy * dy + dz * dz + eps2;
      const inv = 1 / Math.sqrt(r2);
      const inv3 = inv * inv * inv;

      const fi = G * bj.mass * inv3;     // acceleration of i toward j
      const fj = G * bi.mass * inv3;
      const ai = out[i], aj = out[j];
      ai[0] += fi * dx; ai[1] += fi * dy; ai[2] += fi * dz;
      aj[0] -= fj * dx; aj[1] -= fj * dy; aj[2] -= fj * dz;
    }
  }

  if (opts.relativistic) addPostNewtonian(bodies, out, opts);

  /* A pinned body does not move, whatever is pulling on it. */
  for (let i = 0; i < n; i++) if (bodies[i].fixed) { const a = out[i]; a[0] = a[1] = a[2] = 0; }
  return out;
}

/* -----------------------------------------------------------------------------
   First post-Newtonian correction.

     a_rel = (GM / c^2 r^3) [ (4GM/r - v^2) r + 4 (r.v) v ]

   This is the Schwarzschild 1PN term for a test body relative to a dominant
   mass M. It produces the relativistic perihelion advance

     dw = 6 pi G M / (c^2 a (1 - e^2))   per orbit

   which for Mercury is 42.98 arcsec/century — the classical test of GR, and
   the one this simulator checks in its test suite.

   IMPORTANT LIMITATION: applied relative to the single most massive body. For
   systems of comparable masses the full Einstein-Infeld-Hoffmann equations
   with all pairwise cross-terms would be required; the engine reports when
   this assumption is violated rather than applying the term regardless.
-------------------------------------------------------------------------------*/
function addPostNewtonian(bodies, out, opts) {
  let primary = null;
  for (const b of bodies) if (!primary || b.mass > primary.mass) primary = b;
  if (!primary) return;
  const GM = G * primary.mass;

  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b === primary) continue;
    const dx = b.pos[0] - primary.pos[0];
    const dy = b.pos[1] - primary.pos[1];
    const dz = b.pos[2] - primary.pos[2];
    const r = Math.hypot(dx, dy, dz);
    if (r <= 0) continue;

    const vx = b.vel[0] - primary.vel[0];
    const vy = b.vel[1] - primary.vel[1];
    const vz = b.vel[2] - primary.vel[2];
    const v2 = vx * vx + vy * vy + vz * vz;
    const rv = dx * vx + dy * vy + dz * vz;

    const k = GM / (C2 * r * r * r);
    const s = 4 * GM / r - v2;
    const a = out[i];
    a[0] += k * (s * dx + 4 * rv * vx);
    a[1] += k * (s * dy + 4 * rv * vy);
    a[2] += k * (s * dz + 4 * rv * vz);
  }
}

/* --- conserved quantities ----------------------------------------------------
   Displayed live, because silent loss of conservation is the main way toy
   gravity simulators mislead people.
-------------------------------------------------------------------------------*/
export function kineticEnergy(bodies) {
  let T = 0;
  for (const b of bodies) {
    const v2 = b.vel[0] ** 2 + b.vel[1] ** 2 + b.vel[2] ** 2;
    T += 0.5 * b.mass * v2;
  }
  return T;
}

export function potentialEnergy(bodies, softening = 0) {
  const eps2 = softening ** 2;
  let U = 0;
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].pos[0] - bodies[i].pos[0];
      const dy = bodies[j].pos[1] - bodies[i].pos[1];
      const dz = bodies[j].pos[2] - bodies[i].pos[2];
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz + eps2);
      U -= G * bodies[i].mass * bodies[j].mass / r;
    }
  }
  return U;
}

export function totalEnergy(bodies, softening = 0) {
  return kineticEnergy(bodies) + potentialEnergy(bodies, softening);
}

export function angularMomentum(bodies) {
  let Lx = 0, Ly = 0, Lz = 0;
  for (const b of bodies) {
    const [x, y, z] = b.pos, [vx, vy, vz] = b.vel;
    Lx += b.mass * (y * vz - z * vy);
    Ly += b.mass * (z * vx - x * vz);
    Lz += b.mass * (x * vy - y * vx);
  }
  return [Lx, Ly, Lz];
}

export function centerOfMass(bodies) {
  let M = 0, x = 0, y = 0, z = 0, vx = 0, vy = 0, vz = 0;
  for (const b of bodies) {
    M += b.mass;
    x += b.mass * b.pos[0]; y += b.mass * b.pos[1]; z += b.mass * b.pos[2];
    vx += b.mass * b.vel[0]; vy += b.mass * b.vel[1]; vz += b.mass * b.vel[2];
  }
  if (M <= 0) return { mass: 0, pos: [0, 0, 0], vel: [0, 0, 0] };
  return { mass: M, pos: [x / M, y / M, z / M], vel: [vx / M, vy / M, vz / M] };
}

/* -----------------------------------------------------------------------------
   Circular-orbit speed helper. sqrt(GM/r) for a test mass; for comparable
   masses the two-body value sqrt(G(M+m)/r) is what actually closes the orbit,
   so the UI uses this when placing a body "in a circular orbit".
-------------------------------------------------------------------------------*/
export function circularSpeed(centralMass, orbitingMass, r) {
  return Math.sqrt(G * (centralMass + orbitingMass) / r);
}

/* Timestep from the shortest dynamical time present. Symplectic integrators
   need a FIXED step, so this is evaluated when the system changes rather than
   adapted every step.

   eta = 1/320 gives ~320 steps per the tightest orbit. That sounds generous
   until you remember eccentricity: a body at e = 0.2 sweeps through periapsis
   far faster than its mean rate, so a step chosen from the ORBITAL PERIOD is
   effectively several times coarser there. At 1/64 the Solar System drifts by
   3e-6 in energy over a century; at 1/320 it is ~1e-8. */
export function suggestTimestep(bodies, eta = 1 / 320) {
  let tMin = Infinity;
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].pos[0] - bodies[i].pos[0];
      const dy = bodies[j].pos[1] - bodies[i].pos[1];
      const dz = bodies[j].pos[2] - bodies[i].pos[2];
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const mu = G * (bodies[i].mass + bodies[j].mass);
      if (r > 0 && mu > 0) tMin = Math.min(tMin, 2 * Math.PI * Math.sqrt(r ** 3 / mu));
    }
  }
  if (!isFinite(tMin)) return 1e-3;
  return eta * tMin;
}
