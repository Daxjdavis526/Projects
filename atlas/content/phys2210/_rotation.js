// Picture builders for PHYS 2210 module M10 (rotation): ω–t graphs and wheels
// with marked points, as ordinary `graph` specs. Bodies that turn, with their
// torques and moments of inertia, use the mech-rotor simulation.
// Not a lesson: the leading underscore keeps it out of the registry.

export const G = 9.8;                          // m/s²
export const RPM = (2 * Math.PI) / 60;         // rad/s per rpm
const r4 = (v) => +(+v).toFixed(4);

/**
 * Angular velocity against time for constant α: a straight line from (0, w0)
 * to (T, w1), with the area under it (the angle turned) shaded up to `upTo`.
 */
export function omegaGraph({ w0, w1, T, upTo = T, shade = true, ylabel = 'ω (rad/s)', numbers = true, caption, labels = [] }) {
  const lo = Math.min(0, w0, w1), hi = Math.max(0, w0, w1), pad = 0.15 * (hi - lo || 1);
  const slope = (w1 - w0) / T;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r4(T * 1.08)], y: [r4(lo - (lo < 0 ? pad : 0)), r4(hi + pad)], xlabel: 't (s)', ylabel, ...(numbers ? {} : { yticks: 0.001 }),
      curves: [{ fn: `${r4(w0)} + ${r4(slope)}*x`, domain: [0, r4(T)], color: 'good' }],
      shade: shade ? [{ fn: `${r4(w0)} + ${r4(slope)}*x`, from: 0, to: r4(upTo), color: 'good', alpha: 0.22 }] : [],
      points: labels,
    },
    caption: caption ?? 'Angular velocity against time. Its slope is the angular acceleration; the shaded area is the angle turned.',
  };
}

/**
 * A wheel seen face-on, turning anticlockwise, with marked points at radii
 * `points` [{ r, label, color, v: arrow length or 0 }]. Arrows are tangent
 * (velocities), drawn to the lengths given.
 */
export function wheel({ R = 1, points = [], caption, spokes = 6, omega = true }) {
  const curves = [{ param: [`${r4(R)}*cos(t)`, `${r4(R)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 3 }];
  for (let k = 0; k < spokes; k++) {
    const a = (2 * Math.PI * k) / spokes + 0.3;
    curves.push({ param: [`t*${r4(R * Math.cos(a))}`, `t*${r4(R * Math.sin(a))}`], t: [0, 1], color: 'ink4', width: 1.2 });
  }
  if (omega) curves.push({ param: [`${r4(0.22 * R)}*cos(t)`, `${r4(0.22 * R)}*sin(t)`], t: [-0.6, 2.4], color: 'good', width: 2 });
  const arrows = [], pts = [{ x: 0, y: 0, r: 4, color: 'gold' }];
  if (omega) arrows.push({ from: [r4(0.22 * R * Math.cos(2.3)), r4(0.22 * R * Math.sin(2.3))], to: [r4(0.22 * R * Math.cos(2.45)), r4(0.22 * R * Math.sin(2.45))], color: 'good', label: 'ω', labelDx: -18, labelDy: -6 });
  // marked points lie along a ray at −30°, each with its velocity, tangent and anticlockwise
  const ang = -Math.PI / 6, u = [Math.cos(ang), Math.sin(ang)], tng = [-Math.sin(ang), Math.cos(ang)];
  for (const p of points) {
    const P = [p.r * u[0], p.r * u[1]];
    pts.push({ x: r4(P[0]), y: r4(P[1]), r: 5, color: p.color || 'gold', label: p.label, labelDx: 8, labelDy: 12 });
    if (p.v) arrows.push({ from: [r4(P[0]), r4(P[1])], to: [r4(P[0] + p.v * tng[0]), r4(P[1] + p.v * tng[1])], color: p.color || 'gold', label: p.vlabel });
  }
  return {
    type: 'graph',
    params: { x: [r4(-1.35 * R), r4(1.6 * R)], y: [r4(-1.25 * R), r4(1.25 * R)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points: pts },
    caption: caption ?? 'A wheel seen face-on, turning anticlockwise about its centre (gold).',
  };
}
