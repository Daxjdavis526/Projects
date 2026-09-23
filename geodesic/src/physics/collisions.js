/* =============================================================================
   COLLISIONS, ROCHE LIMITS, HORIZONS
   ========================================================================== */

import { G, C2, MATERIALS } from './constants.js';

/* -----------------------------------------------------------------------------
   Roche limit — where tidal forces overcome a satellite's self-gravity.

     rigid:  d = R_p (2 rho_p / rho_s)^(1/3)
     fluid:  d = 2.44 R_p (rho_p / rho_s)^(1/3)

   The fluid form is the familiar one (and why Saturn's rings sit where they
   do). GEODESIC FLAGS this rather than simulating it: modelling fragmentation
   would mean tracking a debris field, and drawing a body calmly orbiting
   inside its Roche limit without comment would be the dishonest option.
-------------------------------------------------------------------------------*/
export function rocheLimit(primary, satellite) {
  const rhoP = primary.density, rhoS = satellite.density;
  if (!(rhoS > 0) || !(rhoP > 0)) return { rigid: 0, fluid: 0 };
  return {
    rigid: primary.radius * Math.cbrt(2 * rhoP / rhoS),
    fluid: 2.44 * primary.radius * Math.cbrt(rhoP / rhoS),
  };
}

/* -----------------------------------------------------------------------------
   Perfectly inelastic merge. Conserves mass, linear momentum, and angular
   momentum about the new centre of mass (orbital angular momentum of the pair
   is added to the combined spin, which is where it physically goes).

   Kinetic energy is NOT conserved — a real merger radiates it, and pretending
   otherwise would be worse than losing it.
-------------------------------------------------------------------------------*/
export function mergeBodies(a, b) {
  const M = a.mass + b.mass;
  const pos = [0, 0, 0], vel = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    pos[i] = (a.mass * a.pos[i] + b.mass * b.pos[i]) / M;
    vel[i] = (a.mass * a.vel[i] + b.mass * b.vel[i]) / M;
  }

  /* orbital angular momentum of the pair about the new COM -> spin */
  const spin = [a.spin[0] + b.spin[0], a.spin[1] + b.spin[1], a.spin[2] + b.spin[2]];
  for (const x of [a, b]) {
    const r = [x.pos[0] - pos[0], x.pos[1] - pos[1], x.pos[2] - pos[2]];
    const v = [x.vel[0] - vel[0], x.vel[1] - vel[1], x.vel[2] - vel[2]];
    spin[0] += x.mass * (r[1] * v[2] - r[2] * v[1]);
    spin[1] += x.mass * (r[2] * v[0] - r[0] * v[2]);
    spin[2] += x.mass * (r[0] * v[1] - r[1] * v[0]);
  }

  /* The survivor keeps the more massive body's identity and material, and
     grows by combined volume at that material's density. */
  const keep = a.mass >= b.mass ? a : b;
  const volume = (4 / 3) * Math.PI * (a.radius ** 3 + b.radius ** 3);
  let radius = Math.cbrt(volume / ((4 / 3) * Math.PI));

  /* If the merged object is inside its own horizon, it IS a horizon. */
  const rs = 2 * G * M / C2;
  const isBH = radius <= rs || keep.material === 'blackHole';
  if (isBH) radius = rs;

  keep.mass = M;
  keep.radius = radius;
  keep.pos = pos;
  keep.vel = vel;
  keep.spin = spin;
  if (isBH) keep.material = 'blackHole';
  return { survivor: keep, absorbed: a.mass >= b.mass ? b : a, becameBlackHole: isBH };
}

/* Merge any bodies whose surfaces overlap. Returns event records for the UI. */
export function resolveCollisions(bodies) {
  const events = [];
  let again = true;
  while (again) {
    again = false;
    outer:
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const d = Math.hypot(
          b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]);
        if (d < a.radius + b.radius) {
          const before = { a: a.name, b: b.name, mA: a.mass, mB: b.mass };
          const { survivor, absorbed, becameBlackHole } = mergeBodies(a, b);
          bodies.splice(bodies.indexOf(absorbed), 1);
          absorbed.alive = false;
          events.push({
            kind: becameBlackHole ? 'merge-to-black-hole' : 'merge',
            text: becameBlackHole
              ? `${before.a} and ${before.b} merged and collapsed inside their own horizon.`
              : `${before.a} and ${before.b} merged into ${survivor.name}.`,
            survivor: survivor.id,
          });
          again = true;
          break outer;
        }
      }
    }
  }
  return events;
}
