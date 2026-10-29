// Orbits in Newtonian gravity and in the Schwarzschild spacetime, in
// geometric units (G = c = 1, distances in units of the mass M). DOM-free and
// tested in Node against the classic results: ISCO at 6M, photon sphere at
// 3M, marginally bound orbit at 4M, perihelion advance 6πM/p per orbit.

/** Schwarzschild effective potential for a massive particle, per unit mass: V = (1 − 2M/r)(1 + L²/r²). (E² = V at a turning point.) */
export const vEffMassive = (r, L, M = 1) => (1 - (2 * M) / r) * (1 + (L * L) / (r * r));

/** Schwarzschild effective potential for light, per b: V = (1 − 2M/r)/r². */
export const vEffLight = (r, M = 1) => (1 - (2 * M) / r) / (r * r);

/** Newtonian effective potential per unit mass: −M/r + L²/(2r²). */
export const vEffNewton = (r, L, M = 1) => -M / r + (L * L) / (2 * r * r);

/** Circular-orbit angular momentum at radius r in Schwarzschild (r > 3M). */
export const Lcirc = (r, M = 1) => Math.sqrt((M * r * r) / (r - 3 * M));
/** …and its energy per unit mass. */
export const Ecirc = (r, M = 1) => (1 - (2 * M) / r) / Math.sqrt(1 - (3 * M) / r);

/** Stable circular orbits exist for r ≥ 6M; L of the ISCO = 2√3 M. */
export const ISCO = 6, PHOTON_SPHERE = 3, MARGINALLY_BOUND = 4;

/**
 * Integrate an equatorial Schwarzschild geodesic in the orbit equation
 *   d²u/dφ² + u = M/L² + 3 M u²,   u = 1/r,
 * with RK4 in φ. Returns points [x, y] and detected perihelia.
 * Starts at r0 with dr/dφ = 0 (a turning point).
 */
export function orbitSchwarzschild({ r0, L, M = 1, turns = 3, steps = 3000, newtonian = false }) {
  const f = (u, w) => [w, M / (L * L) - u + (newtonian ? 0 : 3 * M * u * u)];
  let u = 1 / r0, w = 0, phi = 0;
  const dphi = (2 * Math.PI * turns) / steps;
  const pts = [[r0, 0]];
  const peri = [];
  let prevW = w;
  for (let i = 0; i < steps; i++) {
    const k1 = f(u, w);
    const k2 = f(u + (dphi / 2) * k1[0], w + (dphi / 2) * k1[1]);
    const k3 = f(u + (dphi / 2) * k2[0], w + (dphi / 2) * k2[1]);
    const k4 = f(u + dphi * k3[0], w + dphi * k3[1]);
    u += (dphi / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    w += (dphi / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    phi += dphi;
    if (u <= 0) break;                      // escaped
    const r = 1 / u;
    if (!newtonian && r < 2 * M) { pts.push([2 * M * Math.cos(phi), 2 * M * Math.sin(phi)]); return { pts, peri, captured: true }; }
    pts.push([r * Math.cos(phi), r * Math.sin(phi)]);
    // perihelion: u has a maximum where w = du/dφ crosses from + to −
    if (prevW > 0 && w <= 0) peri.push(phi - dphi * (w / (w - prevW)));
    prevW = w;
  }
  return { pts, peri, captured: false };
}

/** Weak-field perihelion advance per orbit, radians: Δφ = 6πM/p with p = a(1 − e²). */
export const advanceWeak = (p, M = 1) => (6 * Math.PI * M) / p;

/** Gravitational time-dilation factor for a static clock: dτ/dt = √(1 − 2M/r). */
export const staticClockRate = (r, M = 1) => Math.sqrt(1 - (2 * M) / r);

/** Weak-field light deflection for impact parameter b: 4M/b radians. */
export const deflection = (b, M = 1) => (4 * M) / b;
