// Einstein's elevator, DOM-free: a closed box in four situations and what a
// released object (a ball, or a light pulse) does relative to it. Every
// motion here is Newtonian kinematics plus the equivalence principle — the
// statement that a uniform gravitational field and a uniform acceleration are
// locally indistinguishable — with the tidal (non-uniform) part of Earth's
// field to first order. SI units throughout. Tested in test/gr-elevator.test.mjs.

export const C = 2.998e8;            // m/s
export const G_EARTH = 9.81;         // m/s², standard surface value
export const R_EARTH = 6.371e6;      // m, mean radius

/**
 * The four boxes. `box` is the box's own acceleration seen from outside (an
 * inertial frame far away, or the ground), `field` is the uniform
 * gravitational acceleration where the box is, both vertical, up positive,
 * in units of g. `nearMass` marks the scenes where tides exist.
 */
export const SCENES = {
  rocket: { box: +1, field: 0, nearMass: false, label: 'Rocket accelerating at g, far from any star' },
  earth: { box: 0, field: -1, nearMass: true, label: 'Standing on Earth' },
  falling: { box: -1, field: -1, nearMass: true, label: 'Falling freely near Earth' },
  space: { box: 0, field: 0, nearMass: false, label: 'Floating in deep space' },
};

/** Vertical acceleration of a released object relative to the box (up positive), m/s². */
export function relativeAcceleration(mode, g = G_EARTH) {
  const s = SCENES[mode];
  return (s.field - s.box) * g;
}

/** Acceleration of the box itself as seen from outside, m/s². */
export const boxAcceleration = (mode, g = G_EARTH) => SCENES[mode].box * g;

/** Acceleration of a released object as seen from outside, m/s². */
export const fieldAcceleration = (mode, g = G_EARTH) => SCENES[mode].field * g;

/** How far a light pulse sent straight across a box of width L falls relative to it: ½a(L/c)². */
export const lightDrop = (L, a = G_EARTH, c = C) => 0.5 * Math.abs(a) * (L / c) ** 2;

/** Fractional frequency shift of light sent up a height h in a field g (blue going down, red going up): gh/c². */
export const gravShift = (h, g = G_EARTH, c = C) => (g * h) / (c * c);

/**
 * Tidal acceleration relative to the centre of a small box near a spherical
 * mass, to first order in the offset (dx sideways, dy up), m/s²: the sideways
 * pull points back toward the centre line (squeeze), the vertical one away
 * from the centre (stretch), twice as strong. g and R are the field and the
 * distance from the mass's centre at the box.
 */
export const tidalAcceleration = (dx, dy, g = G_EARTH, R = R_EARTH) => [(-g * dx) / R, (2 * g * dy) / R];

/** Exact Newtonian acceleration at (x, y) for a mass at (0, −R) with surface field g at the origin — for checking the tidal formula. */
export function newtonAcceleration(x, y, g = G_EARTH, R = R_EARTH) {
  const GM = g * R * R, dx = x, dy = y + R, r = Math.hypot(dx, dy);
  return [(-GM * dx) / r ** 3, (-GM * dy) / r ** 3];
}
