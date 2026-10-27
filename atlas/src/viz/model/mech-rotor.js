// A rigid body turning about a fixed axis: moment of inertia (with the
// parallel-axis theorem), torque from forces fixed to the body, constant
// angular acceleration, and a block hanging from a string wound on a drum.
// The physics behind sims/mech-rotor.js. DOM-free; checked by
// test/mech-rotor.test.mjs.
//
// Bodies lie in the plane of the screen and turn about an axis perpendicular
// to it. A body's "length direction" is its local x-axis; the axis sits a
// distance d from the centre of mass along it.

export const G = 9.8;
const D2R = Math.PI / 180;

/**
 * Moments of inertia about an axis through the centre of mass, perpendicular
 * to the plane of the drawing. M kg, R m (radius), L m (length), W m (plate
 * width), m kg and s m (dumbbell: each of two point masses, s from the centre).
 */
export const SHAPES = {
  disk: { name: 'solid disk', Icm: ({ M, R }) => 0.5 * M * R * R, half: ({ R }) => R, mass: ({ M }) => M, formula: '\\tfrac12 MR^2' },
  ring: { name: 'thin ring', Icm: ({ M, R }) => M * R * R, half: ({ R }) => R, mass: ({ M }) => M, formula: 'MR^2' },
  rod: { name: 'thin rod', Icm: ({ M, L }) => (M * L * L) / 12, half: ({ L }) => L / 2, mass: ({ M }) => M, formula: '\\tfrac1{12}ML^2' },
  plate: { name: 'rectangular plate', Icm: ({ M, L, W }) => (M * (L * L + W * W)) / 12, half: ({ L }) => L / 2, mass: ({ M }) => M, formula: '\\tfrac1{12}M(L^2 + W^2)' },
  sphere: { name: 'solid sphere', Icm: ({ M, R }) => 0.4 * M * R * R, half: ({ R }) => R, mass: ({ M }) => M, formula: '\\tfrac25 MR^2' },
  shell: { name: 'thin spherical shell', Icm: ({ M, R }) => (2 / 3) * M * R * R, half: ({ R }) => R, mass: ({ M }) => M, formula: '\\tfrac23 MR^2' },
  dumbbell: { name: 'two point masses on a light rod', Icm: ({ m, s }) => 2 * m * s * s, half: ({ s }) => s, mass: ({ m }) => 2 * m, formula: '2ms^2' },
};

/** Moment of inertia about an axis a distance d from the centre of mass: I = I_cm + M d². */
export function inertia(P) {
  const S = SHAPES[P.shape];
  if (!S) throw new Error(`unknown shape ${P.shape}`);
  const Icm = S.Icm(P), M = S.mass(P), d = P.d || 0;
  return { Icm, M, d, Md2: M * d * d, I: Icm + M * d * d };
}

/**
 * Torque about the axis of a force F (N) applied at distance r (m) from the
 * axis, at angle phi (degrees) measured anticlockwise from the outward radial
 * line to the force. Positive: anticlockwise. Its lever arm is r|sin φ|.
 */
export const torque = ({ F, r, phi }) => Math.abs(r) * F * Math.sin(phi * D2R);
export const leverArm = ({ r, phi }) => Math.abs(r * Math.sin(phi * D2R));

/**
 * A block of mass m hanging from a string wound round a drum of radius R and
 * moment of inertia I (axis fixed and frictionless, string light and not
 * slipping). Newton's second law for the block, mg − T = ma, and for the
 * drum, TR = Iα, with a = αR.
 */
export function hang({ I, R, m, g = G }) {
  const a = (m * g * R * R) / (I + m * R * R);
  return { a, alpha: a / R, T: m * (g - a) };
}

/** Constant angular acceleration from θ0, ω0: the state at time t. */
export const spinAt = ({ theta0 = 0, omega0 = 0, alpha = 0 }, t) => ({
  theta: theta0 + omega0 * t + 0.5 * alpha * t * t,
  omega: omega0 + alpha * t,
});

/**
 * Everything the simulation needs at one instant, from its parameters:
 *   { shape, M, R, L, W, m, s, d, omega0, alpha (prescribed, optional),
 *     forces: [{ F, r, phi }], hang (block mass, kg), g }
 * With a prescribed alpha the forces are ignored (pure kinematics). With a
 * hanging block the drum must turn about its centre (d = 0); its string
 * leaves the left-hand side of the rim, so the drum turns anticlockwise
 * (positive α) as the block falls.
 */
export function motion(P) {
  const In = inertia(P);
  const g = P.g ?? G;
  let alpha, tau = 0, block = null;
  if (P.alpha !== undefined && P.alpha !== null) alpha = P.alpha;
  else if (P.hang > 0) {
    const R = SHAPES[P.shape].half(P);
    const h = hang({ I: In.I, R, m: P.hang, g });
    block = { ...h, m: P.hang, R };
    tau = h.T * R;
    alpha = tau / In.I;
  } else {
    tau = (P.forces || []).reduce((s, f) => s + torque(f), 0);
    alpha = tau / In.I;
  }
  const omega0 = P.omega0 || 0;
  return {
    ...In, tau, alpha, omega0, block,
    at(t) {
      const s = spinAt({ omega0, alpha }, t);
      return { ...s, K: 0.5 * In.I * s.omega * s.omega, drop: block ? 0.5 * block.a * t * t : 0, vBlock: block ? block.a * t : 0 };
    },
  };
}

/** A point at radius r on the body: speed and the two parts of its acceleration. */
export const pointKinematics = (r, omega, alpha) => ({ v: Math.abs(r * omega), at: r * alpha, ac: r * omega * omega, a: Math.abs(r) * Math.hypot(alpha, omega * omega) });
