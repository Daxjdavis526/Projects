// Maximal aging near Earth's surface, DOM-free. In weak, uniform gravity a
// clock at height h moving at vertical speed v ticks, relative to a clock
// resting on the ground, at the rate
//     dτ/dt ≈ 1 + gh/c² − v²/(2c²)
// (the time part of the weak-field metric plus special-relativistic time
// dilation, both to first order). Every worldline here leaves the ground at
// event A (t = 0) and returns to it at event B (t = T); its extra proper time
// over the ground clock is a height bonus minus a speed penalty:
//     Δτ = (g/c²)∫h dt − (1/2c²)∫v² dt.
// Free fall, h = ½gt(T − t), makes Δτ the largest — the principle of maximal
// aging. Tested in test/gr-aging.test.mjs.

import { simpson } from './numeric.js';

export const C = 2.998e8;        // m/s
export const G_EARTH = 9.81;     // m/s²

/** Trial-path shapes, each leaving h = 0 at t = 0, reaching H, and back at t = T. */
export const SHAPES = {
  arc: { label: 'Arc', h: (H, T, t) => (4 * H * t * (T - t)) / (T * T), v: (H, T, t) => (4 * H * (T - 2 * t)) / (T * T), intH: (H, T) => (2 * H * T) / 3, intV2: (H, T) => (16 * H * H) / (3 * T) },
  tent: { label: 'Up, down', h: (H, T, t) => (t < T / 2 ? (2 * H * t) / T : (2 * H * (T - t)) / T), v: (H, T, t) => (t < T / 2 ? (2 * H) / T : (-2 * H) / T), intH: (H, T) => (H * T) / 2, intV2: (H, T) => (4 * H * H) / T },
  hover: {
    label: 'Hover',
    h: (H, T, t) => (t < T / 6 ? (6 * H * t) / T : t > (5 * T) / 6 ? (6 * H * (T - t)) / T : H),
    v: (H, T, t) => (t < T / 6 ? (6 * H) / T : t > (5 * T) / 6 ? (-6 * H) / T : 0),
    intH: (H, T) => (5 * H * T) / 6, intV2: (H, T) => (12 * H * H) / T,
  },
};

/** Height bonus, speed penalty and net extra proper time (s) of a trial path, exactly. */
export function budget(shape, H, T, g = G_EARTH, c = C) {
  const S = SHAPES[shape];
  const bonus = (g * S.intH(H, T)) / (c * c);
  const penalty = S.intV2(H, T) / (2 * c * c);
  return { bonus, penalty, net: bonus - penalty };
}

/** The same budget for any path h(t) with speed v(t), by Simpson's rule. */
export function budgetNumeric(h, v, T, g = G_EARTH, c = C, n = 2000) {
  const bonus = (g * simpson(h, 0, T, n)) / (c * c);
  const penalty = simpson((t) => v(t) ** 2, 0, T, n) / (2 * c * c);
  return { bonus, penalty, net: bonus - penalty };
}

/** Free fall between the two events: h = ½gt(T − t), apex gT²/8. */
export const freeFall = {
  h: (T, t, g = G_EARTH) => 0.5 * g * t * (T - t),
  v: (T, t, g = G_EARTH) => 0.5 * g * (T - 2 * t),
  apex: (T, g = G_EARTH) => (g * T * T) / 8,
  /** Its extra proper time over the ground clock: g²T³/(24c²). */
  gain: (T, g = G_EARTH, c = C) => (g * g * T ** 3) / (24 * c * c),
};

/** The apex height at which each shape's net gain peaks (d net/dH = 0). */
export function bestApex(shape, T, g = G_EARTH) {
  const S = SHAPES[shape];
  // net = aH − bH²  ⇒  H* = a/(2b); a, b read off the exact integrals
  const a = g * S.intH(1, T), b = S.intV2(1, T) / 2;
  return a / (2 * b);
}
