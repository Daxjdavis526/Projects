// A flat rectangular coil turning about an axle in a uniform magnetic field —
// the physics behind the em-generator simulation (sims/em-generator.js), both
// as a motor (a current in the coil, a torque on it) and as a generator (the
// coil turned, an emf induced in it). DOM-free; tested in
// test/em-generator.test.mjs.
//
// Frame: the axle runs along x; B points along +y; the coil's normal n̂ (the
// direction of its magnetic moment for a positive current) turns in the
// y–z plane, n̂ = (0, cos θ, sin θ), so θ is the angle between n̂ and B.
// The coil has N turns, sides a (along the axle) and b (across it), area
// A = ab. A positive current circulates round n̂ by the right-hand rule.
//   flux linkage   NΦ = NBA cos θ
//   emf            ε = −d(NΦ)/dt = NBAω sin ωt          (θ = ωt)
//   torque         τ = μ × B = −NIAB sin θ  (about +x)  (μ = NIA n̂)
// A split-ring commutator reverses the current every half turn, so a motor’s
// torque keeps one sign and a generator’s output is |ε| (pulsing DC); slip
// rings leave both alternating.

export const TAU = 2 * Math.PI;
export const omegaOf = (rpm) => (TAU * rpm) / 60;

const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const add = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const mul = (p, s) => [p[0] * s, p[1] * s, p[2] * s];
export const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];

/** Flux linkage NΦ = NBA cos θ (weber-turns). */
export const linkage = (N, B, A, th) => N * B * A * Math.cos(th);
/** The emf of a coil turning at ω from θ = 0 at t = 0: NBAω sin ωt (volts). */
export const emf = (N, B, A, w, t) => N * B * A * w * Math.sin(w * t);
/** Peak emf, NBAω. */
export const peakEmf = (N, B, A, w) => N * B * A * w;
/** What the brushes deliver: the emf itself with slip rings, its size with a split ring. */
export const output = (N, B, A, w, t, ring = 'slip') => (ring === 'split' ? Math.abs(emf(N, B, A, w, t)) : emf(N, B, A, w, t));

/** The sign the commutator gives the current at angle θ, so a motor keeps turning toward larger θ. */
export const commutator = (th) => (Math.sin(th) > 1e-12 ? -1 : Math.sin(th) < -1e-12 ? 1 : 1);

/**
 * Torque on the coil about +x (the direction of increasing θ), for a current
 * I fed through slip rings (fixed sign) or a split ring (reversed every half turn).
 */
export function torque(N, I, A, B, th, ring = 'slip') {
  const s = ring === 'split' ? commutator(th) : 1;
  return -N * s * I * A * B * Math.sin(th);
}

/** The coil at angle θ: its unit normal, its in-plane direction across the axle, and its corners in the order a positive current visits them. */
export function coil(th, a, b) {
  const n = [0, Math.cos(th), Math.sin(th)];          // normal (μ for a positive current)
  const e = [0, -Math.sin(th), Math.cos(th)];         // across the axle, in the coil's plane; e × x̂ = n
  const x = [1, 0, 0];
  const P = (u, w) => add(mul(e, u), mul(x, w));
  return { n, e, corners: [P(b / 2, -a / 2), P(b / 2, a / 2), P(-b / 2, a / 2), P(-b / 2, -a / 2)] };
}

/** The magnetic force on each side for current I (N turns) in B ŷ: [{ from, to, mid, F }]. */
export function sideForces(th, I, a, b, B, N = 1) {
  const { corners } = coil(th, a, b);
  return corners.map((p, k) => {
    const q = corners[(k + 1) % 4], L = sub(q, p);
    return { from: p, to: q, mid: mul(add(p, q), 0.5), F: mul(cross(L, [0, B, 0]), N * I) };
  });
}

/** Total torque about the axle (the origin) from the side forces: Σ r × F. */
export function torqueFromForces(forces) {
  return forces.reduce((acc, f) => add(acc, cross(f.mid, f.F)), [0, 0, 0]);
}

/** Time-average of the torque over a turn: zero with slip rings, (2/π)NIAB with a split ring. */
export const averageTorque = (N, I, A, B, ring = 'slip') => (ring === 'split' ? (2 / Math.PI) * N * I * A * B : 0);

/** The rms of the alternating emf, peak/√2. */
export const rmsEmf = (peak) => peak / Math.SQRT2;
