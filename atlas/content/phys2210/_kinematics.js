// Shared helpers for the PHYS 2210 kinematics lessons (modules M3 and M4).
// Not a lesson: the leading underscore keeps it out of the lesson registry.

import { fmt, nice } from '../../src/core/format.js';

/** The Atlas's default g, in m/s². */
export const G = 9.8;

/** A number for TeX, bracketed when negative, so that 5 - (-3) reads right. */
export const par = (x, f = nice) => (x < 0 ? `(${f(x)})` : f(x));

/** Three significant figures, as text. */
export const s3 = (x) => fmt(x, 3);

/** Degrees ↔ radians. */
export const D2R = Math.PI / 180;

/** A plot range [lo, hi] that covers every value given, always includes 0, and leaves a margin. */
export function span(values, margin = 0.12) {
  const lo = Math.min(0, ...values), hi = Math.max(0, ...values);
  const pad = (hi - lo || 1) * margin;
  return [lo - pad, hi + pad];
}
