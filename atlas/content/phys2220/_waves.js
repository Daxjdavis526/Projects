// Picture builders and number formats for the PHYS 2220 wave lessons (modules
// W1 and W2): snapshots of waves, pulses, standing-wave envelopes and labelled
// points, as ordinary `graph` specs, so the content test validates them like
// any other visual. Not a lesson: the leading underscore keeps it out of the
// registry.

import { fmt } from '../../src/core/format.js';
export { tn } from '../phys2210/_fluids.js';

/** n significant figures as plain text (prose and canvas labels). */
export const s3 = (x, n = 3) => fmt(x, n);
/** Six significant figures, for numbers written into expressions. */
export const r6 = (v) => +(+v).toPrecision(6);
/** "+ 0.5" or "- 0.5": a signed term for an expression. */
const signed = (v) => (v < 0 ? `- ${r6(-v)}` : `+ ${r6(v)}`);

/** Speed of light, m/s (exact). */
export const C = 299792458;

/**
 * A snapshot of a sinusoidal wave at one instant, y(x) = A sin(2πx/λ + φ).
 *   x        the range of x shown
 *   numbers  false hides the axis numbers (so a picture cannot be read for the answer)
 *   points, arrows, vlines, hlines, curves, shade  passed to the graph
 *   drag     a draggable point (for a point item)
 */
export function snapshot({ A = 1, lambda = 4, phi = 0, x = [0, 10], pad = 0.4, ylabel = 'y (cm)', xlabel = 'x (m)', points = [], arrows = [], vlines = [], hlines = [], curves = [], shade = [], numbers = true, drag, caption, color = 'accent', xticks, aspect = 'wide' }) {
  return {
    type: 'graph',
    params: {
      aspect, x, y: [r6(-(1 + pad) * A), r6((1 + pad) * A)], xlabel, ylabel,
      ...(numbers ? (xticks ? { xticks } : {}) : { xticks: 0.001, yticks: 0.001 }),
      curves: [{ fn: `${r6(A)}*sin(${r6((2 * Math.PI) / lambda)}*x ${signed(phi)})`, color, width: 2.4 }, ...curves],
      points, arrows, vlines, hlines, shade, ...(drag ? { drag } : {}),
    },
    caption,
  };
}

/** A curve y = fn(x) on its own graph (a pulse, a sum, an envelope…). */
export function curvePicture({ fn, x, y, xlabel = 'x (m)', ylabel = 'y (m)', curves = [], points = [], arrows = [], vlines = [], hlines = [], shade = [], numbers = true, caption, aspect = 'wide', color = 'accent', width = 2.4, drag, equal = false, axes = true, grid = true }) {
  return {
    type: 'graph',
    params: {
      aspect, x, y, xlabel, ylabel, ...(equal ? { equal: true } : {}), ...(axes ? {} : { axes: false }), ...(grid ? {} : { grid: false }),
      ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }),
      curves: [...(fn ? [{ fn, color, width }] : []), ...curves],
      points, arrows, vlines, hlines, shade, ...(drag ? { drag } : {}),
    },
    caption,
  };
}

/** A text label placed at (x, y) (a point too small to see). */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy });

/** A straight segment as a graph curve. */
export const seg = (a, b, { color = 'ink2', width = 2, dash = false } = {}) => ({
  param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width, dash,
});

/**
 * A standing wave on a string of length L fixed at both ends, in mode n: the envelope
 * ±sin(nπx/L) (dashed), the string at one moment (solid), and the nodes (orange dots).
 *   phase   cos(ωt) at the moment drawn (1: the string at its widest)
 *   marks   [{ x, label }] extra labelled points on the axis
 */
export function standingPicture({ n, L = 1, phase = 0.75, numbers = true, nodes = true, xlabel = 'x (m)', marks = [], caption, ends = true }) {
  const k = r6((n * Math.PI) / L);
  const pts = nodes ? Array.from({ length: n + 1 }, (_, j) => ({ x: r6((j * L) / n), y: 0, color: 'warn', r: 4.5 })) : [];
  const wall = ends ? [seg([0, -1.25], [0, 1.25], { color: 'ink3', width: 4 }), seg([L, -1.25], [L, 1.25], { color: 'ink3', width: 4 })] : [];
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [r6(-0.04 * L), r6(1.04 * L)], y: [-1.45, 1.45], xlabel, ylabel: '',
      ...(numbers ? {} : { xticks: 0.001 }), yticks: 0.001,
      curves: [
        { fn: `sin(${k}*x)`, domain: [0, L], color: 'ink4', width: 1.2, dash: true },
        { fn: `-sin(${k}*x)`, domain: [0, L], color: 'ink4', width: 1.2, dash: true },
        { fn: `${r6(phase)}*sin(${k}*x)`, domain: [0, L], color: 'accent', width: 2.6 },
        ...wall,
      ],
      points: [...pts, ...marks.map((m) => ({ x: r6(m.x), y: r6(m.y ?? 0), color: m.color || 'gold', r: m.r ?? 5, label: m.label, labelDx: m.dx, labelDy: m.dy }))],
    },
    caption: caption ?? `A string fixed at both ends vibrating in mode ${n}: the solid line is the string at one moment, the dashed lines the limits of its swing; orange dots are nodes. Height exaggerated.`,
  };
}

/** A circle as a graph curve. */
export const circle = (cx, cy, r, { color = 'ink2', width = 2, dash = false } = {}) => ({
  param: [`${r6(cx)} + ${r6(r)}*cos(t)`, `${r6(cy)} + ${r6(r)}*sin(t)`], t: [0, r6(2 * Math.PI)], color, width, dash,
});

/**
 * A string clamped on the left, running over a pulley on the right to a hanging weight that
 * sets its tension — the classic standing-wave rig. Labels are plain text (canvas).
 *   top, side   labels over the string and beside the weight (e.g. 'μ = 0.01 kg/m', 'F_T = 80 N')
 *   pulse       draw a small pulse centred this far along the string (0–8), or null
 *   wave        draw n half-wavelength loops (a standing wave) instead, or 0
 */
export function stringRig({ top = '', side = '', pulse = null, wave = 0, caption, length = '' } = {}) {
  const curves = [
    seg([0, -0.6], [0, 0.6], { color: 'ink3', width: 5 }),
    circle(8.35, -0.35, 0.35, { color: 'ink2', width: 2 }),
    seg([8.7, -0.35], [8.7, -1.55], { color: 'ink2', width: 1.8 }),
    seg([8.35, -1.55], [9.05, -1.55], { color: 'accent', width: 2.2 }), seg([9.05, -1.55], [9.05, -2.25], { color: 'accent', width: 2.2 }),
    seg([9.05, -2.25], [8.35, -2.25], { color: 'accent', width: 2.2 }), seg([8.35, -2.25], [8.35, -1.55], { color: 'accent', width: 2.2 }),
  ];
  if (wave > 0) {
    const k = r6((wave * Math.PI) / 8.35);
    curves.push({ fn: `0.45*sin(${k}*x)`, domain: [0, 8.35], color: 'accent', width: 2.4 }, { fn: `-0.45*sin(${k}*x)`, domain: [0, 8.35], color: 'ink4', width: 1.2, dash: true });
  } else if (pulse !== null) {
    curves.push({ fn: `0.4*exp(-((x - ${r6(pulse)})/0.45)^2)`, domain: [0, 8.35], color: 'accent', width: 2.4 });
  } else curves.push(seg([0, 0], [8.35, 0], { color: 'accent', width: 2.4 }));
  const points = [];
  if (top) points.push(label(3.2, 0.78, top, 'accent'));
  if (side) points.push(label(9.25, -1.9, side, 'ink2'));
  if (length) {
    curves.push(seg([0, -0.95], [8.35, -0.95], { color: 'ink3', width: 1.2, dash: true }));
    points.push(label(3.4, -1.22, length, 'ink3'));
  }
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [-0.6, 11.4], y: [-2.6, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    caption: caption ?? 'A string clamped at the left and passing over a pulley to a hanging weight, which sets the tension. Not to scale.',
  };
}

/** A small box outline centred at (x, y), half-sizes w and h, as graph curves. */
export const box = (x, y, w, h, color = 'accent', width = 2) => [
  seg([x - w, y - h], [x + w, y - h], { color, width }), seg([x + w, y - h], [x + w, y + h], { color, width }),
  seg([x + w, y + h], [x - w, y + h], { color, width }), seg([x - w, y + h], [x - w, y - h], { color, width }),
];

/**
 * Two sources (speakers) and a listening point P, with the two paths drawn dashed and labelled.
 *   s1, s2   source positions; P the listener; l1, l2 the path labels (plain text); path: [[x, y], [x, y]]
 *   a dashed line the listener walks along
 */
export function twoSources({ s1 = [0, 1.2], s2 = [0, -1.2], P = [7, 2.2], l1 = 'r₁', l2 = 'r₂', who = 'P', path = null, caption } = {}) {
  const curves = [...box(s1[0] - 0.25, s1[1], 0.25, 0.35, 'accent'), ...box(s2[0] - 0.25, s2[1], 0.25, 0.35, 'accent'),
    seg(s1, P, { color: 'gold', width: 1.4, dash: true }), seg(s2, P, { color: 'violet', width: 1.4, dash: true })];
  if (path) curves.push(seg(path[0], path[1], { color: 'ink3', width: 1.2, dash: true }));
  const xs = [s1[0], s2[0], P[0], ...(path ? [path[0][0], path[1][0]] : [])], ys = [s1[1], s2[1], P[1], ...(path ? [path[0][1], path[1][1]] : [])];
  const pad = 1.1;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m1 = mid(s1, P), m2 = mid(s2, P);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [r6(Math.min(...xs) - pad - 0.6), r6(Math.max(...xs) + pad + 0.6)], y: [r6(Math.min(...ys) - pad), r6(Math.max(...ys) + pad)], equal: true,
      axes: false, grid: false, xlabel: '', ylabel: '', curves,
      points: [{ x: r6(P[0]), y: r6(P[1]), color: 'good', r: 6, label: who }, label(m1[0], m1[1], l1, 'gold', 4, -12), label(m2[0], m2[1], l2, 'violet', 4, 12),
        label(s1[0] - 0.95, s1[1] + 0.6, 'S₁', 'accent'), label(s2[0] - 0.95, s2[1] - 0.6, 'S₂', 'accent')],
    },
    caption: caption ?? 'Two sources in step, S₁ and S₂, and a listening point. Not to scale.',
  };
}

/** A Michelson interferometer, seen from above: laser, beam splitter, two arms with end mirrors, detector. */
export function michelson({ caption, arm = 'one arm moves by ΔL' } = {}) {
  const curves = [
    ...box(-3.4, 0, 0.55, 0.3, 'bad'),                                   // laser
    seg([-2.85, 0], [3.6, 0], { color: 'bad', width: 1.6 }), seg([0, 0], [0, 3.6], { color: 'bad', width: 1.6 }), seg([0, 0], [0, -2.4], { color: 'bad', width: 1.6 }),
    seg([-0.45, -0.45], [0.45, 0.45], { color: 'ink2', width: 3 }),      // beam splitter
    seg([3.7, -0.6], [3.7, 0.6], { color: 'ink', width: 4 }), seg([-0.6, 3.7], [0.6, 3.7], { color: 'ink', width: 4 }),   // mirrors
    seg([4.1, -0.6], [4.1, 0.6], { color: 'ink3', width: 2, dash: true }),
    ...box(0, -2.75, 0.45, 0.3, 'good'),                                 // detector
  ];
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-4.6, 6.6], y: [-3.4, 4.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves,
      arrows: [{ from: [3.75, 1.0], to: [4.15, 1.0], color: 'gold' }],
      points: [label(-4.0, 0.62, 'laser', 'bad'), label(0.35, 0.9, 'beam splitter', 'ink2'), label(0.85, 3.7, 'mirror', 'ink2'), label(3.9, 1.45, arm, 'gold'), label(0.6, -2.75, 'detector', 'good')],
    },
    caption: caption ?? 'A Michelson interferometer from above: the beam splitter sends light down two arms; the beams return, recombine, and reach the detector. Not to scale.',
  };
}

/**
 * A point source with two spheres around it, seen in cross-section, at radii in the ratio r2/r1
 * (drawn to scale up to a ratio of 4). Labels are plain text.
 */
export function spheres({ ratio = 2, l1 = 'r₁', l2 = 'r₂', who = '', caption } = {}) {
  const b = 2.8, a = b / Math.min(4, ratio);
  const inner = l1 !== '';                       // no label: draw only the outer sphere
  const curves = [...(inner ? [circle(0, 0, a, { color: 'accent', width: 1.8 }), seg([0, 0], [a * 0.707, a * 0.707], { color: 'accent', width: 1.4 })] : []),
    circle(0, 0, b, { color: 'violet', width: 1.8 }), seg([0, 0], [b * 0.866, -b * 0.5], { color: 'violet', width: 1.4 })];
  const points = [{ x: 0, y: 0, color: 'warn', r: 6 }, ...(inner ? [label(a * 0.38, a * 0.58, l1, 'accent', 6, -4)] : []), label(b * 0.52, -b * 0.36, l2, 'violet', 6, 8)];
  if (who) points.push({ x: r6(b * 0.866), y: r6(-b * 0.5), color: 'good', r: 5, label: who });
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [-3.2, 6.4], y: [-3.1, 3.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    caption: caption ?? 'A small source (orange) radiating equally in all directions: the same power crosses every sphere around it. Spheres seen in cross-section.',
  };
}

/** The speed of sound against altitude in the 1976 US Standard Atmosphere, 0–20 km (air, γ = 1.4). */
export function soundAltitude({ numbers = true, mark = null, caption } = {}) {
  const curves = [{ param: ['sqrt(1.4*287.05*(288.15 - 6.5*min(t, 11)))', 't'], t: [0, 20], color: 'accent', width: 2.4 }];
  const points = mark ? [{ x: r6(mark.v), y: r6(mark.h), color: 'gold', r: 5, label: mark.label }] : [];
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [280, 350], y: [0, 20], xlabel: 'speed of sound (m/s)', ylabel: 'altitude (km)', ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }), curves, points },
    caption: caption ?? 'The speed of sound against altitude: √(γRT/M) with the temperatures of the 1976 US Standard Atmosphere. It falls with the temperature up to 11 km, then stays constant in the isothermal layer above.',
  };
}

/**
 * A ladder of typical sound levels, 0–140 dB (rough, typical values), with optional gold marks
 * [{ b, label }] on the right. y numbers are shown; there is no x axis to read.
 */
export function dbLadder({ marks = [], caption } = {}) {
  const refs = [[0, 'threshold of hearing (1 kHz)'], [30, 'whisper'], [60, 'conversation, 1 m away'], [85, 'damages hearing over hours'], [120, 'threshold of pain'], [140, 'jet engine close by']];
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, 10], y: [-10, 150], xlabel: '', ylabel: 'level (dB)', xticks: 0.001,
      curves: [seg([0.5, 0], [0.5, 140], { color: 'ink3', width: 3 })],
      points: [...refs.map(([b, txt]) => ({ x: 0.5, y: b, color: 'ink2', r: 4, label: `${b} dB: ${txt}` })),
        ...marks.map((m) => ({ x: 5.4, y: r6(m.b), color: 'gold', r: 6, label: m.label }))],
    },
    caption: caption ?? 'Typical sound levels (rough: real sounds vary by many decibels).',
  };
}
