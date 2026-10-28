// Picture builders for the PHYS 3550 Lagrangian lessons (M3–M4): a bead on a
// rotating hoop, a double pendulum, a pendulum on a moving support. Each
// returns an ordinary `graph` visual, so the content test validates it.
// Not a lesson: the leading underscore keeps it out of the registry.

import { r6, gpic, seg, lab } from './_cm.js';

/**
 * A vertical hoop of radius 1 spinning about its vertical diameter, seen side-on,
 * with a bead at angle th (rad) from the bottom. `bead: false` leaves the bead off.
 */
export function hoopPic({ th = 0.8, caption, bead = true, angle = true, spin = true, alt, extra = {} }) {
  const bx = Math.sin(th), by = -Math.cos(th);
  return gpic({
    x: [-1.7, 1.7], y: [-1.3, 1.45], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.6 },
      seg([0, -1.25], [0, 1.3], 'ink4', 1.2, true),
      ...(spin ? [{ param: ['0.35*cos(t)', '1.3 + 0.08*sin(t)'], t: [3.6, 8.9], color: 'accent', width: 1.6 }] : []),
      ...(angle && bead ? [seg([0, 0], [r6(bx), r6(by)], 'ink3', 1.2), { param: ['0.35*sin(t)', '-0.35*cos(t)'], t: [0, r6(th)], color: 'ink3', width: 1.2 }] : []),
    ],
    points: [
      ...(bead ? [{ x: r6(bx), y: r6(by), color: 'warn', r: 7 }] : []),
      ...(spin ? [lab(0.45, 1.36, 'ω', 'accent')] : []),
      ...(angle && bead ? [lab(0.42 * Math.sin(th / 2) + 0.04, -0.5 * Math.cos(th / 2) - 0.02, 'θ', 'ink2')] : []),
    ],
    arrows: spin ? [{ from: [-0.34, 1.21], to: [-0.3, 1.215], color: 'accent' }] : [],
    ...extra,
  }, caption, alt || 'A vertical hoop spinning about its vertical diameter, with a bead on it');
}

/** A double pendulum (arms 1 and 1) at angles t1, t2 (rad) from straight down, pivot at the origin. */
export function dpendPic({ t1 = 0.6, t2 = -0.4, caption, labels = true, alt, extra = {} }) {
  const x1 = Math.sin(t1), y1 = -Math.cos(t1), x2 = x1 + Math.sin(t2), y2 = y1 - Math.cos(t2);
  return gpic({
    x: [-2.2, 2.2], y: [-2.25, 0.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([-0.4, 0], [0.4, 0], 'ink2', 3), seg([0, 0], [r6(x1), r6(y1)], 'ink2', 1.8), seg([r6(x1), r6(y1)], [r6(x2), r6(y2)], 'ink2', 1.8), seg([0, 0], [0, -0.7], 'ink4', 1, true), seg([r6(x1), r6(y1)], [r6(x1), r6(y1 - 0.7)], 'ink4', 1, true)],
    points: [
      { x: r6(x1), y: r6(y1), color: 'accent', r: 7, label: labels ? 'm₁' : '', labelDx: 10, labelDy: 0 },
      { x: r6(x2), y: r6(y2), color: 'warn', r: 7, label: labels ? 'm₂' : '', labelDx: 10, labelDy: 0 },
      ...(labels ? [lab(0.32 * Math.sin(t1 / 2) + 0.06, -0.5, 'θ₁', 'ink2'), lab(x1 + 0.32 * Math.sin(t2 / 2) + 0.06, y1 - 0.5, 'θ₂', 'ink2')] : []),
    ],
    ...extra,
  }, caption, alt || 'A double pendulum: two masses on two light rods');
}

/** A pendulum hanging from a cart that slides on a horizontal track; th in rad, cart at x = xs. */
export function cartPendPic({ th = 0.5, xs = 0, caption, alt, extra = {} }) {
  const bx = xs + 1.3 * Math.sin(th), by = -1.3 * Math.cos(th);
  return gpic({
    x: [-2.4, 2.4], y: [-1.7, 0.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([-2.3, -0.02], [2.3, -0.02], 'ink3', 1.4), seg([xs - 0.35, 0.25], [xs + 0.35, 0.25], 'ink2', 2), seg([xs - 0.35, 0.02], [xs + 0.35, 0.02], 'ink2', 2), seg([xs - 0.35, 0.02], [xs - 0.35, 0.25], 'ink2', 2), seg([xs + 0.35, 0.02], [xs + 0.35, 0.25], 'ink2', 2), seg([xs, 0.02], [r6(bx), r6(by)], 'ink2', 1.6), seg([xs, 0.02], [xs, -1.1], 'ink4', 1, true)],
    points: [{ x: r6(bx), y: r6(by), color: 'warn', r: 7 }, lab(xs + 0.25 * Math.sin(th / 2) + 0.05, -0.55, 'θ', 'ink2')],
    ...extra,
  }, caption, alt || 'A pendulum hanging from a cart on a horizontal track');
}
