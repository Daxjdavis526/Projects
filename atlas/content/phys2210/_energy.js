// Picture builders for the PHYS 2210 work-and-energy lessons (modules M7 and
// M8): energy bar charts, force–position graphs with the work shaded, and a
// block with its forces and displacement. Each returns an ordinary `graph`
// spec, so the content test validates it like any other visual.
// Not a lesson: the leading underscore keeps it out of the lesson registry.

import { fmt } from '../../src/core/format.js';

export { G, s3 } from './_kinematics.js';

const r4 = (v) => +(+v).toFixed(4);
const DEG = Math.PI / 180;

/** Thousands with a thin space for TeX: 12500 → 12\,500. */
export const thou = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');

/** A number to n significant figures for TeX, with ×10ⁿ for large or small values. */
export const sci = (x, n = 3) => {
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  return thou(fmt(x, n));
};

/** A label-only point (no visible dot) for graph pictures. */
const label = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy });

const BAR = {
  K: ['K', 'accent'], Ki: ['Ki', 'accent'], Kf: ['Kf', 'accent'], Ug: ['Ug', 'good'], Us: ['Us', 'teal'], U: ['U', 'good'], Eth: ['Eth', 'warn'],
  W: ['W', 'gold'], E: ['E', 'violet'],
};

/**
 * Energy bar charts ("LOL diagrams"): one group of bars per snapshot.
 *   snaps    [{ title: 'A: at rest', K: 0, Ug: 12, … }]
 *   keys     which bars, in order: K Ki Kf Ug Us U Eth W E (Ki, W, Kf in one snapshot draw the work–energy theorem)
 *   numbers  false hides the energy scale (a qualitative chart)
 */
export function energyBars(snaps, { keys = ['K', 'Ug', 'Us', 'Eth'], numbers = true, values = false, unit = 'J', caption, alt } = {}) {
  const m = keys.length, gap = 1.3;
  const all = snaps.flatMap((s) => keys.map((k) => s[k] ?? 0));
  const lo0 = Math.min(0, ...all), hi0 = Math.max(0, ...all, 1e-9);
  const span = hi0 - lo0;
  const shade = [], points = [];
  snaps.forEach((s, g) => {
    const x0 = g * (m + gap);
    if (s.title) points.push(label(x0 + 0.1, hi0 + 0.16 * span, s.title, 'ink', -4, 0));
    keys.forEach((k, j) => {
      const v = s[k] ?? 0, [name, color] = BAR[k];
      const cx = x0 + 0.5 + j;
      if (Math.abs(v) > 1e-12) shade.push({ fn: String(r4(v)), lower: '0', from: r4(cx - 0.36), to: r4(cx + 0.36), color, alpha: 0.75 });
      points.push(label(cx, lo0 - 0.1 * span, name, color, -4 - 3.5 * (name.length - 1), 0));
      if (values && Math.abs(v) > 1e-12) points.push(label(cx, v, fmt(v, 3), 'ink2', -4 - 3 * (fmt(v, 3).length - 1), v >= 0 ? -10 : 10));
    });
  });
  const W = snaps.length * (m + gap) - gap;
  return {
    type: 'graph',
    params: {
      x: [-0.4, r4(W + 0.4)], y: [r4(lo0 - 0.2 * span), r4(hi0 + 0.3 * span)], aspect: 'wide',
      xticks: 0.001, xlabel: ' ', ylabel: numbers ? `energy (${unit})` : 'energy', ...(numbers ? {} : { yticks: 0.001 }),
      alt: alt || 'Energy bar charts', shade, points,
    },
    caption: caption ?? 'Energy bar charts: each bar is one kind of energy at that moment. K kinetic, Ug gravitational, Us elastic (spring), Eth thermal.',
  };
}

/**
 * A force–position graph with the work shaded between `from` and `to`:
 * positive area (force along +x) in green, negative in red.
 */
export function fxGraph({ F, from, to, x, y, xlabel = 'x (m)', ylabel = 'F (N)', caption, points = [], vlines = [], color = 'accent', shadeIt = true, extra = {} }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel, ylabel,
      curves: [{ fn: F, color, width: 2.6 }],
      shade: shadeIt ? [{ fn: `max(${F}, 0)`, from, to, color: 'good', alpha: 0.28 }, { fn: `min(${F}, 0)`, from, to, color: 'bad', alpha: 0.28 }] : [],
      points, vlines, ...extra,
    },
    caption: caption ?? 'Force against position. The shaded area between the graph and the axis is the work: above the axis it counts as positive, below as negative.',
  };
}

/**
 * A block on a level floor with force arrows from its centre, an optional
 * angle marker on the first force and a displacement arrow under the floor.
 *   forces  [{ deg, label, len (default 1.6), color }] — deg anticlockwise from +x
 *   d       the displacement label ('' hides the arrow); dDeg its direction (0 or 180, or −90 for down)
 *   angle   label for the angle between the first force and the motion (null hides it)
 *   floor   false for a body in mid-air (a lifted load)
 */
export function blockPic({ forces = [], d = 'Δr', dDeg = 0, angle = null, floor = true, caption, alt, blockLabel = '' }) {
  const c = [0, 0.45];
  const arrows = [], curves = [], points = [];
  const ext = [[-0.6, -0.1], [0.6, 0.95]];
  const starts = [];
  for (const f of forces) {
    // each arrow starts where its line leaves the block (1.0 wide, 0.9 tall)
    const L = f.len ?? 1.3, a = f.deg * DEG, u = [Math.cos(a), Math.sin(a)];
    const te = Math.min(Math.abs(u[0]) > 1e-9 ? 0.5 / Math.abs(u[0]) : Infinity, Math.abs(u[1]) > 1e-9 ? 0.45 / Math.abs(u[1]) : Infinity);
    const from = [c[0] + te * u[0], c[1] + te * u[1]], to = [from[0] + L * u[0], from[1] + L * u[1]];
    starts.push(from);
    arrows.push({ from: from.map(r4), to: to.map(r4), color: f.color || 'accent', label: f.label, labelDx: f.labelDx, labelDy: f.labelDy });
    ext.push(to);
  }
  if (angle && forces.length) {
    const a = forces[0].deg, o = starts[0];
    curves.push({ param: [`${r4(o[0])} + 0.5*cos(t)`, `${r4(o[1])} + 0.5*sin(t)`], t: [0, r4(a * DEG)], color: 'gold', width: 1.8 });
    curves.push({ param: [`${r4(o[0])} + t`, String(r4(o[1]))], t: [0, 1.1], color: 'ink3', width: 1.1, dash: true });
    const mid = (a / 2) * DEG;
    points.push(label(o[0] + 0.72 * Math.cos(mid), o[1] + 0.72 * Math.sin(mid), angle, 'gold', 2, 0));
    ext.push([o[0] + 1.15, o[1]]);
  }
  if (d) {
    const L = 2.1, a = dDeg * DEG;
    const start = dDeg === -90 ? [-1.05, 0.95] : [dDeg === 180 ? 0.9 : -0.9, -0.42];
    const end = [start[0] + L * Math.cos(a), start[1] + L * Math.sin(a)];
    arrows.push({ from: start.map(r4), to: end.map(r4), color: 'good', label: d, labelDx: dDeg === -90 ? -8 - 7 * d.length : undefined });
    ext.push(start, end);
  }
  const xs = ext.map((p) => p[0]), ys = ext.map((p) => p[1]);
  const X = [Math.min(...xs) - 0.55, Math.max(...xs) + 0.9], Yr = [Math.min(...ys) - 0.3, Math.max(...ys) + 0.4];
  if (floor) curves.push({ fn: '0', domain: [r4(X[0]), r4(X[1])], color: 'ink3', width: 2 });
  if (blockLabel) points.push(label(0, 0.45, blockLabel, 'ink', -4 * blockLabel.length, 0));
  return {
    type: 'graph',
    params: {
      x: X.map(r4), y: Yr.map(r4), equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '',
      alt: alt || 'A block with force arrows and its displacement',
      shade: [{ fn: '0.9', lower: floor ? '0' : '0.0001', from: -0.5, to: 0.5, color: 'accent', alpha: 0.55 }],
      curves, arrows, points,
    },
    caption: caption ?? 'Not to scale: the arrows show directions only. The green arrow is the displacement.',
  };
}
