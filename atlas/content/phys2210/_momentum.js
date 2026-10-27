// Picture builders for PHYS 2210 module M9 (momentum, collisions, centre of
// mass, rockets): ordinary `graph` specs, so the content test validates them
// like any other visual. Collisions themselves use the mech-collide
// simulation. Not a lesson: the leading underscore keeps it out of the registry.

import { fmt } from '../../src/core/format.js';

export const G = 9.8;                 // m/s², the course's g
export const G0 = 9.80665;            // m/s², standard gravity — the g₀ in specific impulse
const r4 = (v) => +(+v).toFixed(4);

/** A straight segment as a graph curve. */
export const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, dash });

/**
 * A force that varies in time, drawn as straight pieces through `pts`
 * ([[t, F], …], t in the axis's unit), with the area under it shaded.
 */
export function forceCurve({ pts, x, y, xlabel = 't (ms)', ylabel = 'F (N)', color = 'accent', shade = true, xticks, yticks, caption, extra = {} }) {
  const curves = [], shades = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [t0, f0] = pts[i], [t1, f1] = pts[i + 1];
    curves.push(seg([t0, f0], [t1, f1], color, 2.6));
    if (shade && t1 > t0) shades.push({ fn: `${r4(f0)} + (x - ${r4(t0)})*${r4((f1 - f0) / (t1 - t0))}`, from: r4(t0), to: r4(t1), color, alpha: 0.22 });
  }
  return {
    type: 'graph',
    params: { aspect: 'wide', x, y, xlabel, ylabel, ...(xticks ? { xticks } : {}), ...(yticks ? { yticks } : {}), alt: 'A graph of force against time', curves: [...curves, ...(extra.curves || [])], shade: [...shades, ...(extra.shade || [])], points: extra.points || [], arrows: extra.arrows || [] },
    caption,
  };
}

/** Area under straight pieces through pts: the impulse ∫F dt (in the units of t × F). */
export const areaUnder = (pts) => pts.slice(1).reduce((s, [t1, f1], i) => s + 0.5 * (f1 + pts[i][1]) * (t1 - pts[i][0]), 0);

/**
 * Momentum as an area: each body a rectangle of width m (kg) and height v
 * (m/s), so its momentum mv is the rectangle's area. bodies [{ m, v, label, color }].
 */
export function momentumBoxes(bodies, { caption, x, y, ylabel = 'speed v (m/s)' } = {}) {
  const mmax = Math.max(...bodies.map((b) => b.m)), vmax = Math.max(...bodies.map((b) => b.v));
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: x || [0, r4(mmax * 1.25)], y: y || [0, r4(vmax * 1.2)], xlabel: 'mass m (kg)', ylabel,
      alt: 'Rectangles whose width is a mass and whose height is a speed',
      shade: bodies.map((b) => ({ fn: String(r4(b.v)), from: 0, to: r4(b.m), color: b.color || 'accent', alpha: 0.28 })),
      curves: bodies.flatMap((b) => [seg([0, b.v], [b.m, b.v], b.color || 'accent', 2.2), seg([b.m, 0], [b.m, b.v], b.color || 'accent', 2.2)]),
      points: bodies.map((b) => ({ x: r4(b.m), y: r4(b.v), r: 3, color: b.color || 'accent', label: b.label })),
    },
    caption: caption ?? 'Each rectangle is m wide and v tall, so its area is the momentum mv.',
  };
}

/**
 * Signed one-dimensional vectors as arrows on rows of a number line:
 * rows [{ from: 0, to, label, color }], top row first.
 */
export function lineArrows(rows, { x, xlabel = 'p (kg·m/s)', caption, numbers = true } = {}) {
  const ends = rows.flatMap((r) => [r.from ?? 0, r.to]);
  const lo = Math.min(0, ...ends), hi = Math.max(0, ...ends), pad = 0.18 * (hi - lo || 1);
  const n = rows.length;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: x || [r4(lo - pad), r4(hi + pad)], y: [-0.25, n + 0.35], xlabel, ylabel: '', yticks: 0.001,
      ...(numbers ? {} : { xticks: 0.001 }),
      alt: 'Arrows along a number line',
      arrows: rows.map((r, i) => ({ from: [r4(r.from ?? 0), n - i - 0.3], to: [r4(r.to), n - i - 0.3], color: r.color || 'accent' })),
      points: rows.map((r, i) => ({ x: r4(((r.from ?? 0) + r.to) / 2), y: n - i - 0.3 + 0.3, r: 0.01, color: r.color || 'accent', label: r.label, labelDx: -24 })),
    },
    caption,
  };
}

/**
 * A rocket seen from the side, nose to the right, with parcels of exhaust
 * leaving to the left. Optional arrows: thrust on the rocket, push on the
 * exhaust, their labels.
 */
export function rocketSide({ caption, thrust = 'force on the rocket', exhaust = 'force on the exhaust', parcels = 5 } = {}) {
  const h = 0.42;
  const shade = [
    { fn: String(h), lower: String(-h), from: 0, to: 3.2, color: 'ink3', alpha: 0.45 },
    { fn: `${h}*(1 - (x - 3.2)/1.1)`, lower: `-${h}*(1 - (x - 3.2)/1.1)`, from: 3.2, to: 4.3, color: 'ink3', alpha: 0.45 },
    { fn: `0.22 + 0.2*(-x)/0.45`, lower: `-0.22 - 0.2*(-x)/0.45`, from: -0.45, to: 0, color: 'ink2', alpha: 0.6 },
  ];
  const points = [];
  for (let k = 0; k < parcels; k++) points.push({ x: r4(-0.95 - 0.62 * k), y: r4(0.22 * Math.sin(1.7 * k)), r: 4.5 - 0.4 * k, color: 'warn' });
  const arrows = [];
  if (thrust) arrows.push({ from: [1.1, 0.95], to: [2.9, 0.95], color: 'good', label: thrust });
  if (exhaust) arrows.push({ from: [-0.7, -0.95], to: [-2.5, -0.95], color: 'warn', label: exhaust, labelDx: -8, labelDy: 14 });
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-4.4, 5], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      alt: 'A rocket pushing exhaust out of its nozzle',
      shade, points, arrows,
    },
    caption: caption ?? 'A sketch, not to scale. The engine pushes the exhaust backward; by Newton’s third law the exhaust pushes the engine — and the rocket — forward. Nothing outside is needed.',
  };
}

/**
 * Point masses along a line (or in a plane): masses [{ x, y = 0, m, label, color }],
 * drawn as dots whose area grows with the mass. `cm` marks the centre of mass.
 */
export function massDots(masses, { x, y, cm = false, equal = true, caption, xlabel = 'x (m)', ylabel = '', numbers = true, rod = true, axes = true, extra = {} } = {}) {
  const mmax = Math.max(...masses.map((q) => q.m));
  const M = masses.reduce((s, q) => s + q.m, 0);
  const xc = masses.reduce((s, q) => s + q.m * q.x, 0) / M, yc = masses.reduce((s, q) => s + q.m * (q.y || 0), 0) / M;
  const xs = masses.map((q) => q.x), ys = masses.map((q) => q.y || 0);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), 1e-6);
  const X = x || [r4(Math.min(...xs) - 0.15 * span), r4(Math.max(...xs) + 0.15 * span)];
  const flat = ys.every((v) => v === 0);
  const Y = y || (flat ? [r4(-0.18 * span), r4(0.18 * span)] : [r4(Math.min(...ys) - 0.18 * span), r4(Math.max(...ys) + 0.18 * span)]);
  const curves = [...(extra.curves || [])];
  if (rod && flat) curves.push(seg([Math.min(...xs), 0], [Math.max(...xs), 0], 'ink3', 2.4));
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: X, y: Y, equal, xlabel, ylabel, ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }), ...(flat ? { yticks: 0.001 } : {}), ...(axes ? {} : { axes: false, grid: false }),
      alt: 'Point masses, drawn as dots whose size grows with the mass',
      curves, shade: extra.shade || [], arrows: extra.arrows || [],
      points: [
        ...masses.map((q) => ({ x: r4(q.x), y: r4(q.y || 0), r: r4(5 + 7 * Math.sqrt(q.m / mmax)), color: q.color || 'accent', label: q.label, labelDy: flat ? -16 : -14 })),
        ...(cm ? [{ x: r4(xc), y: r4(yc), r: 4, color: 'gold', label: 'CM', labelDy: 16 }] : []),
        ...(extra.points || []),
      ],
    },
    caption: caption ?? (cm ? 'Dot areas grow with mass. Gold: the centre of mass.' : 'Dot areas grow with mass; a light rod joins them.'),
  };
}

/** Text for a number with 3 significant figures (e-notation when large). */
export const s3 = (x) => fmt(x, 3);
