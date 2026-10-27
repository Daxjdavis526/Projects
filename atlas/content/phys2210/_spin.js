// Picture builders for PHYS 2210 module M11 (rolling and angular momentum):
// wheels, inclines, rolling shapes and a gyroscope, as ordinary `graph` and
// `calc-vectors3d` specs, so the content test validates them like any other
// visual. Not a lesson: the leading underscore keeps it out of the registry.

export const G = 9.8;                         // m/s², the course's g
const r4 = (v) => +(+v).toFixed(4);
const DEG = Math.PI / 180;

/** Rolling shapes: I = β M R², with β the shape factor. */
export const SHAPES = {
  hoop: { name: 'hoop', long: 'a thin hoop', I: 'MR^2', beta: 1, betaTeX: '1', color: 'warn' },
  disk: { name: 'solid disk', long: 'a solid disk (or solid cylinder)', I: '\\tfrac12 MR^2', beta: 1 / 2, betaTeX: '\\tfrac12', color: 'accent' },
  sphere: { name: 'solid sphere', long: 'a solid sphere', I: '\\tfrac25 MR^2', beta: 2 / 5, betaTeX: '\\tfrac25', color: 'good' },
  shell: { name: 'hollow sphere', long: 'a thin hollow sphere', I: '\\tfrac23 MR^2', beta: 2 / 3, betaTeX: '\\tfrac23', color: 'violet' },
};

/** A circle as a graph curve. */
export const circle = (cx, cy, r, color = 'ink3', width = 2, extra = {}) => ({ param: [`${r4(cx)} + ${r4(r)}*cos(t)`, `${r4(cy)} + ${r4(r)}*sin(t)`], t: [0, 6.2832], color, width, ...extra });

/** A filled disk as a graph shade. */
export const disk = (cx, cy, r, color = 'accent', alpha = 0.3) => {
  const s = `sqrt(max(0, ${r4(r * r)} - (x - ${r4(cx)})^2))`;
  return { fn: `${r4(cy)} + ${s}`, lower: `${r4(cy)} - ${s}`, from: r4(cx - r), to: r4(cx + r), color, alpha };
};

/** A straight line from a to b, as a graph curve. */
export const line = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, dash });

/** The pieces that draw one shape (a key of SHAPES, or 'block') centred at (cx, cy): { curves, shade, points }. */
export function shapeAt(kind, cx, cy, r, { label, tilt = 0, labelDy = -14 } = {}) {
  const S = SHAPES[kind];
  const out = { curves: [], shade: [], points: [] };
  if (kind === 'block') {
    // a square of side 2r resting on a slope tilted `tilt` degrees, centred at (cx, cy)
    const c = Math.cos(tilt * DEG), s = Math.sin(tilt * DEG);
    const corner = (u, v) => [cx + r * (u * c + v * s), cy + r * (-u * s + v * c)];
    const P = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    for (let k = 0; k < 4; k++) out.curves.push(line(P[k], P[(k + 1) % 4], 'ink2', 2.2));
  } else if (kind === 'hoop') {
    out.curves.push(circle(cx, cy, r * 0.93, S.color, 4.5));
  } else if (kind === 'shell') {
    out.shade.push(disk(cx, cy, r, S.color, 0.1));
    out.curves.push(circle(cx, cy, r, S.color, 2.6));
  } else {
    out.shade.push(disk(cx, cy, r, S.color, kind === 'sphere' ? 0.6 : 0.3));
    out.curves.push(circle(cx, cy, r, S.color, 1.8));
  }
  out.points.push({ x: r4(cx), y: r4(cy), r: 2, color: 'ink2', ...(label ? { label, labelDy, labelDx: -4 } : {}) });
  return out;
}

/**
 * A ramp from its top-left corner (0, h) down to (w, 0), with shapes resting on
 * it: shapes [{ kind, s (distance down the slope from the top, as a fraction
 * of its length), label }]. Options: the angle (deg), the drawn length, the
 * shapes' radius, whether to mark the height and the angle.
 */
export function rampPicture({ angle = 25, length = 6, shapes = [], radius = 0.32, height, angleLabel, caption, extra = {} }) {
  const th = angle * DEG, w = length * Math.cos(th), h = length * Math.sin(th);
  const curves = [line([0, 0], [w, 0], 'ink3', 1.6), line([0, 0], [0, h], 'ink3', 1.6), line([0, h], [w, 0], 'ink', 2.6)];
  const shade = [], points = [], arrows = [];
  for (const sh of shapes) {
    const d = sh.s * length;
    const contact = [d * Math.cos(th), h - d * Math.sin(th)];
    const centre = [contact[0] + radius * Math.sin(th), contact[1] + radius * Math.cos(th)];
    const p = shapeAt(sh.kind, centre[0], centre[1], radius, { label: sh.label, tilt: angle, labelDy: sh.labelDy ?? -14 });
    curves.push(...p.curves); shade.push(...p.shade); points.push(...p.points);
    if (sh.forces) {
      // weight from the centre, normal force and static friction at the contact point (lengths schematic)
      const n = [Math.sin(th), Math.cos(th)], up = [-Math.cos(th), Math.sin(th)];
      arrows.push({ from: centre.map(r4), to: [r4(centre[0]), r4(centre[1] - 1.5)], color: 'ink2', label: 'Mg' });
      arrows.push({ from: contact.map(r4), to: [r4(contact[0] + 1.3 * n[0]), r4(contact[1] + 1.3 * n[1])], color: 'teal', label: 'N' });
      arrows.push({ from: contact.map(r4), to: [r4(contact[0] + 0.8 * up[0]), r4(contact[1] + 0.8 * up[1])], color: 'bad', label: sh.friction ?? 'f', labelDx: -16, labelDy: -10 });
    }
  }
  if (height) {
    curves.push(line([-0.35, 0], [-0.35, h], 'gold', 1.4));
    points.push({ x: -0.35, y: r4(h / 2), r: 0.01, color: 'gold', label: height, labelDx: -10 - 7 * height.length });
  }
  if (angleLabel) {
    const R = 0.9;
    curves.push({ param: [`${r4(w)} - ${R}*cos(t)`, `${R}*sin(t)`], t: [0, r4(th)], color: 'gold', width: 1.6 });
    points.push({ x: r4(w - 1.35 * R * Math.cos(th / 2)), y: r4(1.1 * R * Math.sin(th / 2)), r: 0.01, color: 'gold', label: angleLabel, labelDx: -10 });
  }
  return {
    type: 'graph',
    params: {
      x: [-1.2, r4(w + 0.6)], y: [-0.5, r4(h + 1.2)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      alt: 'A ramp with objects resting on it', curves, shade, points, arrows, ...extra,
    },
    caption: caption ?? 'A sketch of the ramp (not to scale).',
  };
}

/**
 * A wheel of radius 1 on the road, its centre moving right at speed v = 1, as
 * seen from the side: `arrows` is 'ground' (the velocity of five points over
 * the road), 'centre' (the centre's velocity only), 'relative' (velocities
 * relative to the centre) or 'none'. `labels` names the arrows.
 */
export function wheelPicture({ arrows = 'ground', labels = true, caption, mark, extra = {} } = {}) {
  const k = 0.55;                                     // drawn length per unit speed
  const curves = [{ fn: '0', color: 'ink3', width: 2 }, circle(0, 1, 1, 'accent', 2.6)];
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) curves.push(line([0, 1], [Math.cos(a), 1 + Math.sin(a)], 'ink3', 1.2));
  const pts = { top: [0, 2], front: [1, 1], bottom: [0, 0], back: [-1, 1], centre: [0, 1] };
  const vel = {
    ground: { top: [2, 0], front: [1, -1], bottom: [0, 0], back: [1, 1], centre: [1, 0] },
    relative: { top: [1, 0], front: [0, -1], bottom: [-1, 0], back: [0, 1], centre: [0, 0] },
    centre: { centre: [1, 0] },
    none: {},
  }[arrows];
  const names = {
    ground: { top: '2v', front: 'v√2', back: 'v√2', centre: 'v', bottom: 'v = 0' },
    relative: { top: 'v', front: 'v', back: 'v', bottom: 'v', centre: '' },
    centre: { centre: 'v' }, none: {},
  }[arrows];
  const arrowList = [], points = [{ x: 0, y: 1, r: 3, color: 'ink2' }, { x: 0, y: 0, r: 4, color: 'bad' }];
  for (const [key, [vx, vy]] of Object.entries(vel)) {
    const [x, y] = pts[key];
    if (vx || vy) arrowList.push({ from: [x, y], to: [r4(x + k * vx), r4(y + k * vy)], color: key === 'centre' ? 'ink2' : 'gold', ...(labels && names[key] ? { label: names[key] } : {}) });
    else if (labels && names[key]) points.push({ x, y, r: 0.01, color: 'bad', label: names[key], labelDy: 14, labelDx: 6 });
  }
  if (mark) points.push(...mark);
  return {
    type: 'graph',
    params: {
      x: [-2.4, 2.6], y: [-0.45, 2.55], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      alt: 'A wheel rolling to the right, with velocity arrows', curves, arrows: arrowList, points, ...extra,
    },
    caption: caption ?? 'A wheel rolling to the right without slipping. Arrows to scale for each point’s velocity over the road.',
  };
}

/**
 * A gyroscope seen in 3D: a pivot on a stand, a horizontal axle of length 1.6
 * at azimuth `phi` (degrees, or a slider key), a wheel at its end, and chosen
 * vectors: L (along the axle, `inward` reverses it), the weight W, the support
 * force N, the torque τ about the pivot, and dL (the change in L).
 */
export function gyroScene({ phi = 30, show = ['L', 'W', 'tau'], inward = false, Lsize = 2.4, sliders, readouts, caption, labels = {}, extra = {} } = {}) {
  const a = typeof phi === 'number' ? String(r4(phi * DEG)) : `(${phi})*pi/180`;
  const c = `cos(${a})`, s = `sin(${a})`, rr = 1.6, rw = 0.55;
  const axle = [`${rr}*${c}`, `${rr}*${s}`, '0'];
  const sign = inward ? -1 : 1;
  const vectors = [];
  const lab = (k, d) => labels[k] ?? d;
  if (show.includes('L')) vectors.push({ to: [`${sign * Lsize}*${c}`, `${sign * Lsize}*${s}`, '0'], color: 'accent', label: lab('L', '\\vec L') });
  if (show.includes('W')) vectors.push({ from: axle, to: [axle[0], axle[1], '-1.3'], color: 'ink2', label: lab('W', 'M\\vec g') });
  if (show.includes('N')) vectors.push({ from: [0, 0, 0], to: [0, 0, 1.3], color: 'teal', label: lab('N', '\\vec N') });
  if (show.includes('tau')) vectors.push({ to: [`-1.3*${s}`, `1.3*${c}`, '0'], color: 'bad', label: lab('tau', '\\vec\\tau') });
  if (show.includes('dL')) vectors.push({ from: [`${sign * Lsize}*${c}`, `${sign * Lsize}*${s}`, '0'], to: [`${sign * Lsize}*${c} - 0.7*${s}`, `${sign * Lsize}*${s} + 0.7*${c}`, '0'], color: 'gold', label: lab('dL', 'd\\vec L') });
  const curves = [
    // the wheel: a circle about the axle's end, in the plane perpendicular to the axle
    { param: [`${rr}*${c} - ${rw}*${s}*cos(t)`, `${rr}*${s} + ${rw}*${c}*cos(t)`, `${rw}*sin(t)`], t: [0, 6.2832], color: 'ink', width: 2.4 },
  ];
  if (show.includes('circle')) curves.push({ param: [`${Lsize}*cos(t)`, `${Lsize}*sin(t)`, '0'], t: [0, 6.2832], color: 'accent', width: 1.1, dash: true });
  return {
    type: 'calc-vectors3d',
    params: {
      range: 2.6, aspect: 'wide', grid: false, axisLabels: ['x', 'y', 'z (up)'], yaw: 0.75, pitch: 0.42,
      segments: [{ from: [0, 0, -1.6], to: [0, 0, 0], color: 'ink3', width: 3 }, { from: [0, 0, 0], to: axle, color: 'ink2', width: 3.2 }],
      points: [{ at: [0, 0, 0], color: 'ink2', r: 4 }, { at: axle, color: 'ink2', r: 3.5 }],
      vectors, curves, ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}), ...extra,
    },
    caption: caption ?? 'A gyroscope on a pivot. Drag to rotate the view. Arrows show directions; their lengths are not to one scale.',
  };
}
