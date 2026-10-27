// The light clock: a pulse of light bouncing between two mirrors a distance L
// apart, in units with c = 1. One round trip is one tick. Seen from a frame
// in which the clock moves sideways at speed β, the pulse runs along a
// zigzag at the same speed c, so each tick lasts γ times longer — time
// dilation. DOM-free; tested in test/gr-foundations.test.mjs.

import { gamma } from './relativity.js';

/** One tick (a round trip) of a light clock at rest, mirrors L apart (c = 1). */
export const restTick = (L) => 2 * L;

/** The same tick, timed in a frame where the clock moves sideways at β. */
export const movingTick = (L, beta) => 2 * L * gamma(beta);

/**
 * Where the pulse is at time t in the frame where the clock moves at β along
 * x (the lower mirror starts at x = 0 when t = 0). Returns the pulse's x, its
 * height y above the lower mirror, the completed ticks and the phase of the
 * current tick (0 at the lower mirror, ½ at the upper one).
 */
export function pulse(L, beta, t) {
  const T = movingTick(L, beta);
  const ticks = Math.floor(t / T);
  const phase = t / T - ticks;
  const y = phase < 0.5 ? 2 * phase * L : 2 * (1 - phase) * L;
  return { x: beta * t, y, ticks, phase };
}

/** Half a tick as a right triangle: the legs L and β·Δt/2, the hypotenuse Δt/2 (c = 1). */
export function halfTickTriangle(L, beta) {
  const half = movingTick(L, beta) / 2;
  return { up: L, across: beta * half, slant: half };
}
