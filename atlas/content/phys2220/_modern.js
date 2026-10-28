// Constants and picture builders for the PHYS 2220 modern-physics lessons
// (modules R1, Q1 and A1). Every picture is an ordinary `graph` spec, so the
// content test validates it like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.
//
// Constants: the 2019 SI fixes c, h and e exactly; measured values are
// CODATA 2022 (as in the research notes and src/core/units.js).

import { fmt } from '../../src/core/format.js';

export const C = 299792458;                 // m/s, exact
export const H = 6.62607015e-34;            // J s, exact
export const HBAR = H / (2 * Math.PI);      // J s
export const QE = 1.602176634e-19;          // C (and J per eV), exact
export const ME = 9.1093837139e-31;         // kg, electron (CODATA 2022)
export const MEC2 = 0.51099895069;          // MeV, electron rest energy
export const MPC2 = 938.27208943;           // MeV, proton rest energy
export const YEAR = 365.25 * 86400;         // s, Julian year
export const DAY = 86400;                   // s

/** Six significant figures, for numbers written into graph expressions. */
export const r6 = (v) => +(+v).toPrecision(6);
/** n significant figures as plain text (canvas labels, prose). */
export const s3 = (x, n = 3) => fmt(x, n);

/** A straight segment as a graph curve. */
export const seg = (x0, y0, x1, y1, color = 'ink2', width = 2, dash = false) => ({
  param: [`${r6(x0)} + t*(${r6(x1 - x0)})`, `${r6(y0)} + t*(${r6(y1 - y0)})`], t: [0, 1], color, width, dash,
});
/** A text label at (x, y): a point too small to see. */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0, align) => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });

/**
 * A static spacetime diagram drawn with `graph`: time up the page, space
 * across, c = 1 so light runs at 45°. Unlike the `spacetime` simulation it has
 * no readout and labels its events as told (P, Q… — never A–D, which the
 * player uses for answer choices).
 *   events: [[t, x, label, color?, dx?, dy?], …]
 *   lines:  [[t0, x0, t1, x1, color?, dashed?, width?], …]
 *   cone:   the light cone of the origin (dashed)
 *   numbers: false hides the tick numbers (a picture must not show its answer)
 *   xr: [lo, hi] overrides the horizontal range (default ±range)
 */
export function st({ events = [], lines = [], range = 5, xr, top, bottom, cone = true, numbers = true, xlabel = 'x (light-years)', ylabel = 't (years)', caption, extra = {} } = {}) {
  const curves = [];
  if (cone) curves.push({ fn: 'x', color: 'warn', dash: true, width: 1.3 }, { fn: '-x', color: 'warn', dash: true, width: 1.3 });
  for (const [t0, x0, t1, x1, color = 'accent', dashed = false, width = 2.2] of lines) curves.push(seg(x0, t0, x1, t1, color, width, dashed));
  return {
    type: 'graph',
    params: {
      x: xr ? xr.map(r6) : [r6(-range), r6(range)], y: [r6(bottom ?? -0.25 * range), r6(top ?? 1.4 * range)], equal: true, xlabel, ylabel,
      ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }),
      curves: [...curves, ...(extra.curves || [])],
      points: [...events.map(([T, X, text, color = 'accent2', dx, dy]) => ({ x: r6(X), y: r6(T), label: text, color, ...(dx !== undefined ? { labelDx: dx } : {}), ...(dy !== undefined ? { labelDy: dy } : {}) })), ...(extra.points || [])],
      ...(extra.arrows ? { arrows: extra.arrows } : {}),
      ...(extra.shade ? { shade: extra.shade } : {}),
    },
    caption: caption ?? 'Time up the page, distance across, in units where c = 1: light runs along the dashed 45° lines.',
  };
}

/**
 * A spaceship seen side-on, drawn with `graph`: a body of length `len` (world
 * units) from x0, a nose cone, an optional velocity arrow and labels.
 */
export function shipCurves(x0, len, y = 0, h = 0.5, color = 'accent', dash = false, dir = 1) {
  const nose = Math.min(0.35 * len, 0.6 * h + 0.2);
  // dir = 1: the nose points right (toward +x); dir = −1: it points left
  const X = (x) => (dir > 0 ? x : 2 * x0 + len - x);
  const x1 = x0 + len - nose;
  return [
    seg(X(x0), y - h / 2, X(x1), y - h / 2, color, 2.2, dash), seg(X(x0), y + h / 2, X(x1), y + h / 2, color, 2.2, dash),
    seg(X(x0), y - h / 2, X(x0), y + h / 2, color, 2.2, dash),
    seg(X(x1), y - h / 2, X(x0 + len), y, color, 2.2, dash), seg(X(x1), y + h / 2, X(x0 + len), y, color, 2.2, dash),
  ];
}
