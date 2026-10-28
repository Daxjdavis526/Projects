// The MATH 2210 boss, "The Flux and Circulation Challenge": the design review
// of Kestrel, an imagined air-launched rocket. Each problem mixes two or three
// of the course's skills the way the review meets them — the oxidizer in a
// partly filled spherical tank (setting up a triple integral) and the fuel in
// a toroidal tank (a moment of inertia in shifted cylindrical coordinates);
// the carrier aircraft's wingtip vortex (Green's theorem, a Gaussian in polar
// coordinates, and the circulation read as the aircraft's weight); the
// exhaust of a conical nozzle (the divergence theorem swapping the flat exit
// plane for a spherical cap, then the axial-momentum flux that gives the
// divergence loss); the pull-up (the normal acceleration and the wing's
// lift) and the orbit's inclination (h = r × v); and the heat shield (a
// maximum on a closed disk by Lagrange multipliers, and heat stored in a test
// plug by the divergence theorem); then a last match of integrals to the
// theorem that makes each easy. Every item names the lesson whose skill it
// measures; every number comes from its generator.
import { boss, mcq, num, match } from '../../src/core/content.js';
import { tex, nice, fmt } from '../../src/core/format.js';
import { fieldArrows } from './_fields.js';

const t = String.raw;
const PI = Math.PI;
const DEG = PI / 180;
const G0 = 9.81;              // m/s², as the prompts quote it
const GM = 398600;            // km³/s², Earth
const RE = 6378;              // km, Earth's equatorial radius
const r4 = (v) => +(+v).toFixed(4);
const r6 = (v) => +(+v).toPrecision(6);
const r12 = (v) => +(+v).toPrecision(12);   // for the calculus-check integrands
/** A number as TeX to n significant figures, with a thin space in five-digit numbers. */
const tn = (x, n = 3) => { const s = tex(x, n); return /^-?\d{5}(\.\d+)?$/.test(s) ? s.replace(/^(-?\d{2})(\d{3})/, '$1\\,$2') : s; };
/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  }
  return kept;
}
/** A signed term for TeX: (+1080, 'x') → '+ 1080x', (−1440, 'y') → '- 1440y'. */
const sgn = (c, v) => `${c < 0 ? '-' : '+'} ${Math.abs(c)}${v}`;

// ── picture pieces (graph curves, fills and labels) ──────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const poly = (pts, color, width, dash) => pts.slice(1).map((p, k) => seg(pts[k], p, color, width, dash));
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0, color, label, labelDx: dx, labelDy: dy });
const dot = (x, y, color = 'gold', r = 5) => ({ x: r4(x), y: r4(y), r, color });
const arc = (cx, cy, R, a0, a1, color = 'ink3', width = 1.4, dash = false) => ({ param: [`${r4(cx)} + ${r4(R)}*cos(t)`, `${r4(cy)} + ${r4(R)}*sin(t)`], t: [r4(a0), r4(a1)], color, width, ...(dash ? { dash: true } : {}) });
const picture = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', ...params }, caption });

// ── round 1 pictures: the tanks ──────────────────────────────────────────────
function tankPic(R, c) {
  const R2 = r4(R * R), w = Math.sqrt(R * R - c * c), s = -32 * DEG;
  return picture({
    x: [r4(-2.75 * R), r4(2.75 * R)], y: [r4(-1.3 * R), r4(1.3 * R)],
    shade: [
      { fn: `min(${c}, sqrt(max(0, ${R2} - x^2)))`, lower: `-sqrt(max(0, ${R2} - x^2))`, from: -R, to: R, color: 'accent', alpha: 0.38 },
      { fn: `sqrt(max(0, ${R2} - x^2))`, lower: `${c}`, from: r4(-w), to: r4(w), color: 'ink3', alpha: 0.1 },
    ],
    curves: [arc(0, 0, R, 0, 2 * PI, 'ink2', 2.4), seg([-w, c], [w, c], 'accent', 2.2), seg([0, -1.22 * R], [0, 1.22 * R], 'ink3', 1.1, true)],
    arrows: [{ from: [0, 0], to: [r4(R * Math.cos(s)), r4(R * Math.sin(s))], color: 'ink2', width: 1.6, label: `R = ${nice(R)} m`, labelDx: 8, labelDy: 10 }],
    points: [dot(0, 0, 'ink2', 3), tag(w, c, `liquid surface, z = ${nice(c)} m`, 'accent', 10, -4), tag(0.06 * R, (c + R) / 2, 'ullage (gas)', 'ink2', 2, 5),
      tag(-0.5 * R, -0.5 * R, 'liquid oxygen', 'ink', -6, 4), tag(0, 1.22 * R, 'z, up', 'ink3', 6, 8)],
    alt: 'A circle cut by a horizontal line, the region below the line shaded as liquid',
  }, 'A cut through the tank’s centre. The liquid oxygen (shaded) fills the sphere below the horizontal plane; the gas above it is the ullage.');
}

function torusPic(R, a) {
  // three quarters of the torus, cut open toward the viewer, with its two cut faces: the tube's cross-section
  const torus = { x: `(${R} + ${a}*cos(u))*cos(v)`, y: `(${R} + ${a}*cos(u))*sin(v)`, z: `${a}*sin(u)`, u: [0, '2*pi'], v: ['pi/2', '2*pi'] };
  const cut = (v0) => ({ x: `(${R} + u*cos(v))*cos(${v0})`, y: `(${R} + u*cos(v))*sin(${v0})`, z: 'u*sin(v)', u: [0, a], v: [0, '2*pi'] });
  const bell = { x: '(0.07 + 0.3*u^1.5)*cos(v)', y: '(0.07 + 0.3*u^1.5)*sin(v)', z: '0.3 - u', u: [0, 1], v: [0, '2*pi'] };
  return {
    type: 'c3-flux',
    params: {
      F: null, integrand: 'none', surfaces: [{ label: 'Tank and engine', pieces: [torus, cut(0), cut('pi/2'), bell] }],
      readouts: [], normals: false, arrows: false, flipToggle: false, range: 1, n: 24, yaw: 0.55, pitch: 0.42,
      points: [{ at: [R, 0, 0], label: 'fuel', color: 'gold' }, { at: [0, 0, -0.72], label: 'engine', color: 'gold' }],
    },
    caption: t`The fuel torus, cut open to show its tube’s circular cross-section, round the engine’s nozzle (drawn schematically). The stage’s axis is $z$. Drag to rotate.`,
  };
}

// ── round 2 pictures: the wake ───────────────────────────────────────────────
const B0 = (PI / 4) * 47;          // m, the vortices' spacing for the carrier's 47 m span
const XV = B0 / 2;                 // the right vortex sits at (+XV, 0), the left at (−XV, 0)
/** The Lamb–Oseen pair: the right vortex anticlockwise (Γ), the left clockwise, seen from behind. */
function pairField(G, rc) {
  const one = (x, y, x0, s) => { const dx = x - x0, r2 = dx * dx + y * y, f = (s * G * (1 - Math.exp(-r2 / (rc * rc)))) / (2 * PI * Math.max(r2, 1e-9)); return [-f * y, f * dx]; };
  return [(x, y) => one(x, y, XV, 1)[0] + one(x, y, -XV, -1)[0], (x, y) => one(x, y, XV, 1)[1] + one(x, y, -XV, -1)[1]];
}
function loopsPic() {
  const [P, Q] = pairField(640, 1.5);
  const x = [-34, 34], y = [-16, 16];
  const pent = [[15, 13], [95, 11.5], [165, 12.5], [225, 10], [300, 13.5], [375, 13]].map(([a, r]) => [XV + r * Math.cos(a * DEG), r * Math.sin(a * DEG)]);
  const sq = [[XV - 8, -8], [XV + 8, -8], [XV + 8, 8], [XV - 8, 8], [XV - 8, -8]];
  const head = (pts, k, color) => ({ from: pts[k].map(r4), to: [0, 1].map((i) => r4(pts[k][i] + 0.55 * (pts[k + 1][i] - pts[k][i]))), color, width: 2.4 });
  return picture({
    x, y,
    curves: [arc(XV, 0, 5, 0, 2 * PI, 'gold', 2.4), ...poly(sq, 'violet', 2.2), ...poly(pent, 'teal', 2.2), arc(-4, 9, 3.4, 0, 2 * PI, 'ink2', 2, true)],
    arrows: [...fieldArrows(P, Q, { x, y, n: 19, alpha: 0.7 }),
      { from: [r4(XV + 5 * Math.cos(-0.5)), r4(5 * Math.sin(-0.5))], to: [r4(XV + 5 * Math.cos(-0.3)), r4(5 * Math.sin(-0.3))], color: 'gold', width: 2.4 },
      head(sq, 0, 'violet'), head(pent, 3, 'teal')],
    points: [dot(XV, 0, 'bad', 4), dot(-XV, 0, 'bad', 4), tag(XV, 0, 'right core', 'bad', -30, 18), tag(-XV, 0, 'left core', 'bad', -26, 18),
      tag(XV + 5 * Math.cos(2.3), 5 * Math.sin(2.3), 'Γ', 'gold', -4, -6), tag(XV + 8, 8, 'Γ', 'violet', 4, -4), tag(pent[1][0], pent[1][1], 'Γ', 'teal', 4, -6), tag(-4, 12.4, '0', 'ink2', -3, -4)],
    alt: 'The swirling air of two wingtip vortices, with several loops drawn round the right one and one loop away from both',
  }, 'Across the wake, seen from behind the carrier: the air’s velocity (arrows, lengths compressed) round the two vortex centres (red), 37 m apart, and loops walked anticlockwise. Each vortex’s core, where the air spins, is only about 3 m across.');
}
function wakePic(rc) {
  const rc2 = r4(rc * rc), h = 15;
  const sq = [[XV - h, -h], [XV + h, -h], [XV + h, h], [XV - h, h], [XV - h, -h]];
  return {
    type: 'surface3d',
    params: {
      z: `20*(exp(-((x - ${r4(XV)})^2 + y^2)/${rc2}) - exp(-((x + ${r4(XV)})^2 + y^2)/${rc2}))`,
      domain: [[-40, 40], [-20, 20]], n: 110, axisLen: 30, axisLabels: ['x', 'y', 'ω'], target: [0, 0, 2], dist: 88, yaw: -1.25, pitch: 0.5,
      curves: sq.slice(1).map((p, k) => ({ param: [`${r4(sq[k][0])} + t*${r4(p[0] - sq[k][0])}`, `${r4(sq[k][1])} + t*${r4(p[1] - sq[k][1])}`, '0'], t: [0, 1], color: 'violet', width: 3 })),
    },
    caption: t`The vorticity $\omega$ across the wake as the survey fit has it, drawn as a height over the plane: up for the right vortex, which spins anticlockwise, down for the left. Horizontal distances to scale (80 m × 40 m); heights not. The violet square on the floor is the survey window. Drag to rotate.`,
  };
}

// ── round 3 pictures: the nozzle ─────────────────────────────────────────────
/** A cut through a conical nozzle's axis, apex at the origin, slant length to the lip 10 units. */
function nozzlePic(al, { split = false } = {}) {
  const a = al * DEG, L = 10, ca = Math.cos(a), sa = Math.sin(a), st = 3, ch = 2.15;
  const lip = [L * ca, L * sa], thr = [st * ca, st * sa];
  const rays = [-1, -0.5, 0, 0.5, 1].map((f) => f * a);
  const curves = [
    seg([-2.1, -ch], [-2.1, ch], 'ink2', 2.6), seg([-2.1, ch], [0.7, ch], 'ink2', 2.6), seg([-2.1, -ch], [0.7, -ch], 'ink2', 2.6),
    seg([0.7, ch], thr, 'ink2', 2.6), seg([0.7, -ch], [thr[0], -thr[1]], 'ink2', 2.6),
    seg(thr, lip, 'ink2', 2.6), seg([thr[0], -thr[1]], [lip[0], -lip[1]], 'ink2', 2.6),
    ...rays.map((th) => seg([0, 0], [L * Math.cos(th), L * Math.sin(th)], 'gold', 1, true)),
    seg([lip[0], -lip[1]], lip, 'accent', 3.2),
    arc(0, 0, L, -a, a, 'violet', 3.2),
    arc(0, 0, 1.7, 0, a, 'ink2', 1.4),
  ];
  const arrows = rays.map((th) => ({ from: [r4(7.2 * Math.cos(th)), r4(7.2 * Math.sin(th))], to: [r4(8.3 * Math.cos(th)), r4(8.3 * Math.sin(th))], color: 'gold', width: 2 }));
  const points = [dot(0, 0, 'ink2', 4), tag(0, 0, 'apex', 'ink2', -34, 16), tag(lip[0], -lip[1], 'exit plane', 'accent', -40, 18), tag(L, 0, 'cap, r = L', 'violet', 8, 4),
    tag(1.7 * Math.cos(a / 2), 1.7 * Math.sin(a / 2), 'α', 'ink2', 4, 2), tag(5.6 * ca, 5.6 * sa, 'L', 'ink2', -6, -10), tag(-0.7, 0, 'chamber', 'ink3', -28, -30)];
  if (split) {
    // a streamline at θ, and its velocity at the cap split tip to tail into axial and sideways parts
    const th = 0.8 * a, P0 = [L * Math.cos(th), L * Math.sin(th)], s = 3.4, Q = [P0[0] + s * Math.cos(th), P0[1]], T = [P0[0] + s * Math.cos(th), P0[1] + s * Math.sin(th)];
    curves.push(seg([0, 0], P0, 'gold', 2.2), arc(0, 0, 4.2, 0, th, 'gold', 1.4));
    arrows.push({ from: P0.map(r4), to: T.map(r4), color: 'gold', width: 2.6, label: 'v', labelDx: -2, labelDy: -8 },
      { from: P0.map(r4), to: Q.map(r4), color: 'good', width: 2.4, label: 'v cos θ', labelDx: -62, labelDy: 16 },
      { from: Q.map(r4), to: T.map(r4), color: 'warn', width: 2.4, label: 'v sin θ', labelDx: 8, labelDy: 10 });
    points.push(tag(4.2 * Math.cos(th / 2), 4.2 * Math.sin(th / 2), 'θ', 'gold', 4, 4));
  }
  return picture({ x: [-2.8, 15.6], y: [-4.4, 4.4], curves, arrows, points, alt: 'A cut through a conical rocket nozzle, with exhaust streamlines fanning out from the cone’s apex' },
    split
      ? 'A cut through the nozzle’s axis: the cone to scale, the chamber a sketch. A streamline at angle θ from the axis carries momentum with an axial part (green), which pushes, and a sideways part (orange), which the streamline opposite cancels.'
      : 'A cut through the nozzle’s axis: the cone to scale, the chamber a sketch. The exhaust streams along rays from the cone’s apex (gold); the flat exit plane (blue) and the spherical cap r = L (violet) share the lip as their edge.');
}

// ── round 4 pictures: the climb ──────────────────────────────────────────────
function pullupPic(v, a) {
  const V = Math.hypot(...v), A = Math.hypot(...a), u = v.map((c) => c / V), w = a.map((c) => c / A);
  const path = { param: [`${r4(v[0])}*t + ${r4(a[0] / 2)}*t^2`, `${r4(v[1])}*t + ${r4(a[1] / 2)}*t^2`], t: [-6, 6], color: 'teal', width: 2.2 };
  return picture({
    x: [-1700, 1700], y: [-500, 1100],
    curves: [path, seg([0, 0], [900, 0], 'ink3', 1.1, true), arc(0, 0, 420, 0, Math.atan2(v[1], v[0]), 'ink2', 1.4)],
    arrows: [
      { from: [0, 0], to: [r4(780 * u[0]), r4(780 * u[1])], color: 'accent', width: 2.6, label: 'v', labelDx: 4, labelDy: -2 },
      { from: [0, 0], to: [r4(560 * w[0]), r4(560 * w[1])], color: 'gold', width: 2.6, label: 'a', labelDx: 6, labelDy: 0 },
      { from: [0, 0], to: [0, -400], color: 'bad', width: 2.6, label: 'g', labelDx: 8, labelDy: 6 },
    ],
    points: [dot(0, 0, 'ink', 5), tag(420, 0, 'γ', 'ink2', 6, -6), tag(-5 * v[0] + 12.5 * a[0], -5 * v[1] + 12.5 * a[1], 'path', 'teal', -14, 22), tag(900, 0, 'horizontal', 'ink3', -60, 16)],
    alt: 'A rocket’s path curving upward, with its velocity, acceleration and gravity drawn at one point',
  }, 'The pull-up, in the vertical plane of flight; the path is traced from the reported v and a for six seconds either side. The arrows show directions only: their lengths are not to scale.');
}

function orbitPic(rv, vv, Pv, Qv, u) {
  const k = 1e-3, s = 0.5, R = rv.map((c) => r4(c * k));
  const tip = R.map((c, i) => r4(c + s * vv[i]));
  const rm = Math.hypot(...rv) * k;
  const along = (c) => `${r4(rm)}*(cos(${r4(u)} + t)*(${r4(Pv[c])}) + sin(${r4(u)} + t)*(${r4(Qv[c])}))`;
  return {
    type: 'calc-vectors3d',
    params: {
      range: 8.5,
      spheres: [{ centre: [0, 0, 0], radius: RE * k, color: 'teal' }],
      planes: [{ normal: [0, 0, 1], d: 0, size: 8.5, color: 'violet', alpha: 0.13 }],
      vectors: [{ to: R, color: 'accent', label: '\\vec r' }, { from: R, to: tip, color: 'gold', label: '\\vec v' }],
      curves: [{ param: [along(0), along(1), along(2)], t: [-0.45, 0.3], color: 'gold', dash: true }],
      points: [{ at: [0, 0, r4(RE * k)], color: 'ink2', label: '\\text{N}' }],
    },
    caption: t`Earth (three great circles) with the equator’s plane (violet), the stage’s position $\vec r$ and its velocity $\vec v$ (drawn to a different scale), and a short stretch of its path. Distances in thousands of km. Drag to rotate.`,
  };
}

// ── round 5 pictures: the heat shield ────────────────────────────────────────
function shieldPic(f, R, p, Tpeak, c) {
  const x0 = Math.min(-R, p[0]) - 0.22, x1 = Math.max(R, p[0]) + 0.22, y0 = Math.min(-R, p[1]) - 0.22, y1 = Math.max(R, p[1]) + 0.22;
  // contours every 100 K from the coolest corner of the window up to just below the peak, so the colour ramp spans what is shown
  const T = (x, y) => Tpeak - c * ((x - p[0]) ** 2 + (y - p[1]) ** 2);
  const lo = Math.min(T(x0, y0), T(x0, y1), T(x1, y0), T(x1, y1));
  return {
    type: 'c3-contour',
    params: {
      f, x: [r4(x0), r4(x1)], y: [r4(y0), r4(y1)], levels: { from: 100 * Math.ceil(lo / 100), to: 100 * Math.floor(Tpeak / 100), step: 100 }, labels: false, fill: true, n: 120,
      curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'ink', width: 2.6 }],
      points: [{ x: 0, y: 0, label: 'centre', color: 'ink' }],
      xlabel: 'x (m)', ylabel: 'y (m)',
    },
    caption: 'The thermal model across the face, contours 100 K apart, gold where it is hottest. The circle is the shield’s rim: the model’s formula runs on beyond it, but only the disk inside is shield.',
  };
}

function plugPic(acm, hcm, k, A, B) {
  // drawn in cm with the heated face at z = 0 on top; the flux q = −k∇T in the same (arbitrary) units
  const Acm = A * 1e-4, Bcm = B * 1e-4, Gcm = 400;
  const top = { x: 'u*cos(v)', y: 'u*sin(v)', z: '0', u: [0, acm], v: [0, '2*pi'] };
  const bottom = { x: 'u*cos(v)', y: '-u*sin(v)', z: `${-hcm}`, u: [0, acm], v: [0, '2*pi'] };
  const side = { x: `${acm}*cos(u)`, y: `${acm}*sin(u)`, z: 'v', u: [0, '2*pi'], v: [-hcm, 0] };
  return {
    type: 'c3-flux',
    params: {
      F: [`${r6(2 * k * Bcm)}*x`, `${r6(2 * k * Bcm)}*y`, `-${k}*(${Gcm} + ${r6(2 * Acm)}*z)`],
      surfaces: [{ label: 'Plug', pieces: [top, side, bottom], volume: { kind: 'cylinder', c: [0, 0], r: acm, z: [-hcm, 0] } }],
      readouts: [], flipToggle: false, normals: false, range: 1.15 * hcm, n: 18, yaw: 0.6, pitch: 0.35, arrowGrid: [3, 6],
      points: [{ at: [0, 0, 0.35], label: 'heated face', color: 'bad' }],
    },
    caption: t`The plug, drawn in centimetres with its heated face on top. Gold arrows: the heat flux $\vec q = -k\nabla T$ (lengths compressed). Each face is tinted by $\vec q\cdot\hat n$: red where heat flows in, blue where it flows out. Drag to rotate.`,
  };
}

// ── generator tables ─────────────────────────────────────────────────────────
const DIRS = [[3, 4], [4, 3], [-3, 4], [4, -3], [-4, 3], [3, -4], [-3, -4], [-4, -3]];

export default boss({
  title: 'The Flux and Circulation Challenge',
  intro: t`*Kestrel* is an imagined air-launched rocket. A widebody carrier aircraft lifts it to 12 km and drops it; it lights its engine, pulls up on a small wing and puts its upper stage in orbit; and after the mission the upper stage comes home behind a heat shield, to be flown again. Before the first flight comes the design review, and every number the review asks for is a problem in multivariable calculus: choose the coordinates, choose the theorem, set up the integral — and say what the number means. Five rounds, eleven problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Under the wing',
      story: t`Hanging under the carrier, the upper stage holds its oxygen in a spherical tank and its kerosene in a ring-shaped tank wrapped round the engine. The structures team needs to know how much propellant there is and how it resists being turned.`,
      items: [
        mcq({
          id: 'r1-setup', skill: 'math2210.C3-4.5', difficulty: 2,
          gen(r) {
            const R = r.pick([0.8, 0.9, 1.0, 1.1, 1.2]), c = +(r.pick([0.2, 0.3, 0.4, 0.5, 0.6]) * R).toFixed(2);
            const R2 = r4(R * R), nR = nice(R), nc = nice(c), nR2 = nice(R2);
            const V = PI * (R * R * (c + R) - (c ** 3 + R ** 3) / 3), M = 1141 * V, pct = (100 * V) / ((4 / 3) * PI * R ** 3);
            const ints = (z0, z1, rho1, jac) => t`$\displaystyle\int_0^{2\pi}\!\!\int_{${z0}}^{${z1}}\!\!\int_0^{${rho1}} 1141\,${jac}d\rho\,dz\,d\phi$`;
            const root = t`\sqrt{${nR2} - z^2}`;
            return {
              prompt: t`The upper stage carries its liquid oxygen in a spherical tank of radius ${nR} m. Put the origin at the tank’s centre, with $z$ pointing straight up. Before the drop the oxygen (density 1141 kg/m³) fills the tank up to the horizontal plane $z = ${nc}$ m; above it is the **ullage**, a pocket of gas. In cylindrical coordinates $(\rho, \phi, z)$ about the vertical axis through the centre, which integral is the mass of the oxygen, in kg?`,
              choices: [ints(`-${nR}`, nc, root, t`\rho\,`), ints(`-${nR}`, nc, root, ''), ints(`-${nR}`, nc, nR, t`\rho\,`), ints(nc, nR, root, t`\rho\,`)],
              answer: 0,
              why: {
                1: t`Without the Jacobian $\rho$ this is not a volume: a cylindrical cell $d\rho\times\rho\,d\phi\times dz$ has volume $\rho\,d\rho\,d\phi\,dz$, because the arc it spans grows with $\rho$.`,
                2: t`With $\rho$ running out to $${nR}$ at every height, this fills a cylinder of radius $${nR}$. At height $z$ the sphere’s cross-section is a disk of radius only $\sqrt{${nR2} - z^2}$.`,
                3: t`Those limits sweep the ullage — the gas from the liquid’s surface $z = ${nc}$ up to the top of the sphere — not the liquid below it.`,
              },
              hints: [t`Slice the liquid horizontally. At height $z$ the slice is a disk: what is its radius?`, t`The disk at height $z$ has radius $\sqrt{${nR2} - z^2}$; the liquid runs from the bottom of the sphere, $z = -${nR}$, up to $z = ${nc}$; and $dV = \rho\,d\rho\,d\phi\,dz$.`],
              teach: t`To set up a triple integral, describe the solid in the chosen coordinates — for each height, how far out the slice reaches — and include the volume element, $\rho\,d\rho\,d\phi\,dz$ in cylindrical coordinates.`,
              explain: t`At height $z$ the liquid fills a disk of radius $\sqrt{${nR2} - z^2}$, from the bottom of the sphere at $z = -${nR}$ up to the surface at $z = ${nc}$, and the cylindrical volume element is $\rho\,d\rho\,d\phi\,dz$. Doing the $\rho$ and $\phi$ integrals first gives each disk’s area, $\pi(${nR2} - z^2)$, so $$m = 1141\pi\int_{-${nR}}^{${nc}}(${nR2} - z^2)\,dz = ${tn(M)}\ \text{kg}.$$ The tank is ${Math.round(pct)}% full by volume.`,
              visual: tankPic(R, c),
            };
          },
        }),
        num({
          id: 'r1-torus', skill: 'math2210.C3-4.7', difficulty: 3,
          gen(r) {
            const R = r.pick([0.55, 0.6, 0.65, 0.7]), a = r.pick([0.2, 0.24, 0.28]), D = 810;
            const M = 2 * PI * PI * R * a * a * D, I = M * (R * R + 0.75 * a * a);
            return {
              prompt: t`The fuel tank is a **torus** wrapped round the engine: the centre-line of its tube is a circle of radius $R = ${R}$ m about the stage’s axis, and the tube itself has radius $a = ${a}$ m. Full, it holds RP-1 kerosene of density 810 kg/m³. For the roll-control thrusters, find the fuel’s moment of inertia about the stage’s axis, treating it as a solid that turns with the tank. Give 3 significant figures.`,
              answer: I, units: 'kg m^2', tol: { rel: 0.005 },
              // for the calculus check: the ρ³ weight times the tube's chord at that ρ
              integrand: `${r12(2 * PI * D)}*p^3*2*sqrt(max(0, ${r4(a * a)} - (p - ${R})^2))`, vars: { p: [R - a, R + a] }, limits: [R - a, R + a],
              errors: apart([
                { value: M * R * R, feedback: t`That is a thin hoop, with all the fuel on the tube’s centre-line. The fuel spreads across the tube, and the part farther out counts for more.` },
                { value: M * (R * R + 0.25 * a * a), feedback: t`That averages $\rho^2$ evenly over the tube’s cross-section. But $dV = \rho\,d\rho\,d\phi\,dz$: the outer half of the tube holds more fuel than the inner half, which raises $\tfrac14a^2$ to $\tfrac34a^2$.` },
                { value: 2 * PI * D * (PI * a * a * R * R + (PI * a ** 4) / 4), feedback: t`The Jacobian is missing: in cylindrical coordinates $dm = 810\,\rho\,d\rho\,d\phi\,dz$, so the integrand is $\rho^3$, not $\rho^2$.` },
              ], I),
              hints: [
                t`Each element of fuel contributes $\rho^2\,dm$, with $\rho$ its distance from the axis and $dm = 810\,\rho\,d\rho\,d\phi\,dz$. The tube’s cross-section is the disk $(\rho - ${R})^2 + z^2 \le ${a}^2$.`,
                t`Use polar coordinates centred in the tube: $\rho = ${R} + s\cos\psi$, $z = s\sin\psi$, with Jacobian $s$. Then $I = 810\cdot2\pi\displaystyle\int_0^{2\pi}\!\!\int_0^{${a}}(${R} + s\cos\psi)^3\,s\,ds\,d\psi$.`,
                t`Expand the cube: the odd powers of $\cos\psi$ integrate to $0$, leaving $\pi a^2R^3 + \tfrac34\pi Ra^4$.`,
              ],
              teach: t`A moment of inertia weights each mass element by its squared distance from the axis, $\iiint \rho^2\,dm$ — and in cylindrical coordinates $dm$ carries the Jacobian $\rho$.`,
              explain: t`About the stage’s axis each element contributes $\rho^2\,dm$ with $dm = 810\,\rho\,d\rho\,d\phi\,dz$. Polar coordinates centred in the tube, $\rho = R + s\cos\psi$ and $z = s\sin\psi$ (Jacobian $s$), turn the cross-section into a rectangle: $$I = 810\cdot2\pi\int_0^{2\pi}\!\!\int_0^{a}(R + s\cos\psi)^3\,s\,ds\,d\psi = 810\cdot2\pi\left(\pi a^2R^3 + \tfrac34\pi Ra^4\right) = M\left(R^2 + \tfrac34a^2\right),$$ where $M = 810\cdot2\pi^2Ra^2 = ${tn(M)}$ kg is the fuel’s mass (the tube’s cross-section times the length of its centre-line). So $I = ${tn(I)}\ \text{kg m}^2$. The $\tfrac34a^2$ beyond a hoop’s $R^2$ is the fuel’s spread across the tube — three times the plain average $\tfrac14a^2$, because the outer half of the tube holds more fuel than the inner half. A real liquid does not turn rigidly with its tank: in a quick roll most of it stays where it is, so this is an upper bound.`,
              visual: torusPic(R, a),
            };
          },
        }),
      ],
    },
    {
      title: 'The drop',
      story: t`At 12 km the carrier lets go. Behind each of its wingtips trails a vortex — a tube of spinning air strong enough to roll a light aircraft that flies into it — and the flight-test team has surveyed the carrier’s wake in the plane across it.`,
      items: [
        mcq({
          id: 'r2-meaning', skill: 'math2210.C3-5.4', difficulty: 2,
          prompt: t`Seen from behind the carrier, the vortex from its right wingtip turns anticlockwise. In the plane across the wake the team measures the circulation $\oint_C\vec v\cdot d\vec r$ of the air’s velocity $\vec v$ round several loops $C$, each walked anticlockwise. Every loop that goes round the right vortex’s core — a circle, a square, a lopsided pentagon — gives the same value, $\Gamma = 640$ m²/s; a loop that goes round neither core gives $0$. What does $\Gamma$ measure?`,
          choices: [
            t`The total vorticity of the core: the curl integrated over the region inside the loop, which is zero outside the core`,
            t`The air’s speed round the loop, which must therefore be 640 m/s at every point of every loop round the core`,
            t`The volume of air that crosses the loop each second, per metre along the wake, the same for every loop`,
            t`That the air’s velocity is a conservative field round the core, since the circulation is the same whatever the loop`,
          ],
          answer: 0,
          why: {
            1: t`Circulation adds up $\vec v\cdot d\vec r$ along the whole loop, so its units are speed × length, m²/s. The speed itself falls with distance from the core, as $\Gamma/2\pi r$ outside it.`,
            2: t`That is the flux across the loop, $\oint_C\vec v\cdot\hat n\,ds$ — the other form of Green’s theorem, which adds up sources (divergence). It is about $0$ here: air neither appears nor disappears in the wake.`,
            3: t`A conservative field has zero circulation round **every** loop. This one has $\Gamma \ne 0$ round loops that enclose the core: it is curl-free outside the core, but those loops surround a region where it is not.`,
          },
          hints: [t`Green’s theorem: the circulation round a loop equals the double integral of what, over the region inside?`, t`A loop that misses both cores gives $0$, so the curl is zero away from the cores. Then what can every loop round the right core have in common?`],
          teach: t`Circulation round a loop is the flux of curl through it (Green’s theorem), so a loop’s shape stops mattering once it encloses all the vorticity.`,
          explain: t`By Green’s theorem $\oint_C\vec v\cdot d\vec r = \iint_D \omega\,dA$, where the vorticity $\omega = \partial v_y/\partial x - \partial v_x/\partial y$ is twice the local rate at which the air spins. Away from the cores $\omega = 0$ (that is what the loop round neither core shows), so any loop round the right core collects exactly that core’s total vorticity, whatever its shape. The number is set by the wing that shed it: lift per metre of span is $\rho V\Gamma$ (the Kutta–Joukowski theorem), so $\Gamma$ is the carrier’s weight written into the air — the next problem uses it.`,
          visual: loopsPic(),
        }),
        num({
          id: 'r2-carrier', skill: 'math2210.C3-5.4', difficulty: 4,
          gen(r) {
            const rc = r.pick([1.2, 1.5, 1.8]), Gt = r.pick([620, 660, 700, 740]), V = r.pick([220, 230, 240]);
            const w0 = Math.round(Gt / (PI * rc * rc)), G = PI * rc * rc * w0;
            const b0 = (PI / 4) * 47, W = 0.31 * V * G * b0, m = W / G0 / 1000;
            return {
              prompt: t`Across the right vortex, the survey’s data fit the Lamb–Oseen model of a vortex: the vorticity is $\omega(r) = \omega_0\,e^{-r^2/r_c^2}$, where $r$ is the distance from the vortex’s centre, $\omega_0 = ${w0}\ \text{s}^{-1}$ and the core radius is $r_c = ${rc}$ m. (Here $\omega = \partial v_y/\partial x - \partial v_x/\partial y$, the curl of the air’s velocity in the plane across the wake.) The survey window is a square 30 m on a side, centred on the vortex. Find the circulation round the window’s edge — and from it the carrier’s mass. A wing in level flight that sheds vortices of circulation $\Gamma$ makes lift $\rho V\Gamma$ per metre of span (the Kutta–Joukowski theorem), and for an elliptically loaded wing of span $b$ the two vortices are $\tfrac{\pi}{4}b$ apart, so the whole lift is $\rho V\Gamma\cdot\tfrac{\pi}{4}b$. The carrier, of span $b = 47$ m, was flying level at $V = ${V}$ m/s through air of density $\rho = 0.31$ kg/m³. What is its mass, in tonnes? ($g = 9.81$ m/s²)`,
              answer: m, units: 't', tol: { rel: 0.01 },
              // for the calculus check: the vorticity integrated in rings, times ρVb₀/(1000g)
              integrand: `${r12((0.31 * V * b0) / G0 / 1000)}*${w0}*exp(-r^2/${r4(rc * rc)})*2*pi*r`, vars: { r: [0, 20] }, limits: [0, 'inf'],
              errors: apart([
                { value: (m * 4) / PI, feedback: t`The lift is $\rho V\Gamma$ times the vortices’ spacing, $\tfrac{\pi}{4}b$, not times the whole span: the circulation tapers off toward the wingtips.` },
                { value: 2 * m, feedback: t`$\int_0^\infty e^{-r^2/r_c^2}\,r\,dr = \tfrac12r_c^2$: check the factor $\tfrac12$.` },
                { value: (m * Math.sqrt(PI)) / rc, feedback: t`The polar area element is $r\,dr\,d\theta$: without the $r$, the integral is not a flux of vorticity through the window.` },
                { value: m * G0, feedback: t`That is the carrier’s weight in kN. Divide by $g$ for its mass.` },
              ], m),
              hints: [
                t`By Green’s theorem the circulation round the square’s edge is $\iint\omega\,dA$ over the square. Even at the nearest points of its edge, 15 m out, $e^{-r^2/r_c^2}$ is below $e^{-60}$: the square holds essentially all the vorticity.`,
                t`So integrate over the whole plane, in polar coordinates: $\Gamma = \displaystyle\int_0^{2\pi}\!\!\int_0^\infty \omega_0\,e^{-r^2/r_c^2}\,r\,dr\,d\theta = \pi r_c^2\,\omega_0$.`,
                t`In level flight lift equals weight: $mg = \rho V\Gamma\cdot\tfrac{\pi}{4}b$.`,
              ],
              teach: t`Green’s theorem turns a circulation into the integral of vorticity over the region inside — and the right coordinates make that integral easy.`,
              explain: t`By Green’s theorem $\oint\vec v\cdot d\vec r = \iint\omega\,dA$ over the window. The vorticity is negligible beyond a few core radii, so the square can be swapped for the whole plane, where polar coordinates turn the integral into a Gaussian: $$\Gamma = \int_0^{2\pi}\!\!\int_0^\infty ${w0}\,e^{-r^2/${nice(r4(rc * rc))}}\,r\,dr\,d\theta = \pi(${rc})^2(${w0}) = ${tn(G)}\ \text{m}^2/\text{s}.$$ Then $mg = \rho V\Gamma\cdot\tfrac{\pi}{4}b = (0.31)(${V})(${tn(G)})(${tn(b0)})$ N $= ${tn(W / 1000)}$ kN, so $m = ${tn(m)}$ t. The circulation is the aircraft’s weight written into the air: a heavier or slower aircraft leaves stronger vortices, which is why air-traffic control spaces aircraft by the weight of the one in front. Real wings are not quite elliptically loaded; their vortices end up about 0.75–0.8 of the span apart.`,
              visual: wakePic(rc),
            };
          },
        }),
      ],
    },
    {
      title: 'Ignition',
      story: t`Five seconds after the drop the first-stage engine lights. Past its throat, its nozzle is a cone. In the ideal model of a conical nozzle the exhaust streams straight out from the cone’s apex — every streamline a ray, every particle at the same speed — and the propulsion team wants two numbers from it.`,
      items: [
        num({
          id: 'r3-massflow', skill: 'math2210.C3-5.9', difficulty: 3,
          gen(r) {
            const al = r.pick([12, 15, 18]), Re = r.pick([0.5, 0.55, 0.6]), rho = r.pick([0.06, 0.07, 0.08]), ve = 2900;
            const a = al * DEG, L = Re / Math.sin(a), md = rho * ve * 2 * PI * L * L * (1 - Math.cos(a));
            const flat = rho * ve * PI * Re * Re;
            return {
              prompt: t`The diverging part of the nozzle is a cone of half-angle $\alpha = ${al}^\circ$ ending at an exit lip of radius $R_e = ${Re}$ m. In the ideal conical-nozzle model the exhaust’s mass current is $$\rho\vec v = \rho_e v_e\,\frac{L^2}{r^2}\,\hat r,$$ where $r$ is the distance from the cone’s apex, $\hat r$ the unit vector pointing away from it, $L$ the distance from the apex to the lip, $\rho_e = ${rho}$ kg/m³ and $v_e = 2900$ m/s. Find the mass flow rate: the flux of $\rho\vec v$ through the flat exit plane, the disk spanning the lip. Give 3 significant figures.`,
              answer: md, units: 'kg/s', tol: { rel: 0.005 },
              // for the calculus check: the flux through the flat disk, ring by ring — the hard way
              integrand: `${r12(2 * PI * rho * ve * L * L * L * Math.cos(a))}*s/(s^2 + ${r12((L * Math.cos(a)) ** 2)})^1.5`, vars: { s: [0, Re] }, limits: [0, Re],
              errors: apart([
                { value: flat, feedback: t`That takes $\rho_e v_e$ straight and evenly across the flat disk. In this model the exhaust crosses the disk at an angle and is denser near the middle, which is nearer the apex. Integrate — or move to a surface where the flux is simple.` },
                { value: md * Math.cos(a) ** 2, feedback: t`On the sphere through the lip, $r = L$ is the slant distance from the apex to the lip, $R_e/\sin\alpha$ — not the distance along the axis, $R_e/\tan\alpha$.` },
                { value: rho * ve * 2 * PI * L * L, feedback: t`The cap is only the part of the sphere inside the cone, out to the angle $\alpha$ from the axis: its area is $2\pi L^2(1 - \cos\alpha)$, not a hemisphere’s $2\pi L^2$.` },
              ], md, 0.006),
              hints: [
                t`The flat exit disk and the spherical cap $r = L$ through the lip have the same edge, and together they enclose a region with no apex in it. Away from the apex, $\nabla\cdot(\hat r/r^2) = 0$.`,
                t`So by the divergence theorem the flux through the disk equals the flux through the cap (both taken downstream). On the cap $\rho\vec v = \rho_e v_e\,\hat r$: the same everywhere, and normal to the cap.`,
                t`The cap’s area is $2\pi L^2(1 - \cos\alpha)$, with $L = R_e/\sin\alpha$.`,
              ],
              teach: t`A divergence-free field has the same flux through every surface with the same edge, so choose the surface on which the field is simplest.`,
              explain: t`Between the flat exit disk and the spherical cap $r = L$ that spans the same lip, $\nabla\cdot(\rho\vec v) = 0$: steady exhaust neither piles up nor drains away. So by the divergence theorem the two surfaces carry the same flux, and on the cap the mass current is uniform and normal: $$\dot m = \rho_e v_e\cdot 2\pi L^2(1 - \cos\alpha),\qquad L = \frac{${Re}}{\sin ${al}^\circ} = ${tn(L)}\ \text{m},$$ which is $${tn(md)}$ kg/s — the propellant the engine burns every second. Integrating over the flat disk directly gives the same, with more work: in polar coordinates on the disk the integrand is $\rho_e v_e L^2z_0/(s^2 + z_0^2)^{3/2}$, with $z_0 = L\cos\alpha$. The answer is ${fmt((100 * (md - flat)) / flat, 2)}% more than $\rho_e v_e\pi R_e^2$, because the cap is bigger than the disk.`,
              visual: nozzlePic(al),
            };
          },
        }),
        num({
          id: 'r3-divergence', skill: 'math2210.C3-5.7', difficulty: 3,
          gen(r) {
            const al = r.pick([12, 15, 18]), Re = r.pick([0.5, 0.55, 0.6]), rho = r.pick([0.06, 0.07, 0.08]), ve = 2900;
            const a = al * DEG, ca = Math.cos(a), L = Re / Math.sin(a);
            const mv = (rho * ve * ve * 2 * PI * L * L * (1 - ca)) / 1000, Fax = (rho * ve * ve * PI * Re * Re) / 1000, loss = mv - Fax;
            return {
              prompt: t`The same model of the nozzle: half-angle $\alpha = ${al}^\circ$, exit lip of radius $R_e = ${Re}$ m, and exhaust streaming out radially from the cone’s apex with mass current $\rho_e v_e L^2/r^2$, where $\rho_e = ${rho}$ kg/m³ and every particle moves at $v_e = 2900$ m/s. Thrust is a flux of **axial momentum**. On the spherical cap $r = L$ spanning the lip, a streamline at angle $\theta$ from the axis carries axial momentum out at the rate $\rho_e v_e^2\cos\theta$ per unit area. How much less is the total, $\iint_\text{cap}\rho_e v_e^2\cos\theta\,dS$, than $\dot m v_e$ — the thrust the engine would make if all its exhaust flowed straight back? Leave out the pressure part of the thrust, and give the answer in kN to 3 significant figures.`,
              answer: loss, units: 'kN', tol: { rel: 0.01 },
              // for the calculus check: ṁv_e minus the axial momentum flux, ring by ring over the cap
              integrand: `${r12((rho * ve * ve * L * L * 2 * PI) / 1000)}*sin(q)*(1 - cos(q))`, vars: { q: [0, a] }, limits: [0, a],
              errors: apart([
                { value: mv * (1 - ca), feedback: t`That treats every streamline as leaving at the wall’s angle $\alpha$. Most leave nearer the axis: averaged over the cap’s area, $\cos\theta$ is $\tfrac12(1 + \cos\alpha)$.` },
                { value: Fax, feedback: t`That is the axial thrust itself. The question asks how far short of $\dot m v_e$ it falls.` },
                { value: mv * (1 - Math.sin(a) / a), feedback: t`That averages $\cos\theta$ over the angle $\theta$. The average must be over the cap’s **area**, whose rings grow as $\sin\theta$: $dS = L^2\sin\theta\,d\theta\,d\phi$.` },
              ], loss),
              hints: [
                t`On the cap, in spherical coordinates about the nozzle’s axis, $dS = L^2\sin\theta\,d\theta\,d\phi$ with $0 \le \theta \le \alpha$, and $L = R_e/\sin\alpha$.`,
                t`$\iint_\text{cap}\cos\theta\,dS = 2\pi L^2\displaystyle\int_0^\alpha\cos\theta\sin\theta\,d\theta = \pi L^2\sin^2\alpha$, while $\dot m v_e = \rho_e v_e^2\cdot2\pi L^2(1 - \cos\alpha)$.`,
                t`The ratio of the two is $\tfrac12(1 + \cos\alpha)$, so the shortfall is $\tfrac12(1 - \cos\alpha)\,\dot m v_e$.`,
              ],
              teach: t`Thrust is a flux of axial momentum, so exhaust leaving at an angle θ pushes with only cos θ of its momentum — over a conical nozzle’s exit that averages to (1 + cos α)/2.`,
              explain: t`On the cap, $$\iint_\text{cap}\rho_e v_e^2\cos\theta\,dS = \rho_e v_e^2L^2\int_0^{2\pi}\!\!\int_0^{\alpha}\cos\theta\sin\theta\,d\theta\,d\phi = \rho_e v_e^2\,\pi L^2\sin^2\alpha = ${tn(Fax)}\ \text{kN},$$ while $\dot m v_e = \rho_e v_e^2\cdot2\pi L^2(1 - \cos\alpha) = ${tn(mv)}$ kN. The shortfall is $${tn(loss)}$ kN, a fraction $\tfrac12(1 - \cos\alpha) = ${fmt(50 * (1 - ca), 2)}\%$. What it means: off-axis exhaust carries sideways momentum too, and the sideways parts from opposite sides of the axis cancel and push nothing. The thrust is $\lambda\,\dot m v_e$ with $\lambda = \tfrac12(1 + \cos\alpha) = ${fmt((1 + ca) / 2, 4)}$, the **divergence factor** of nozzle design; bell-shaped nozzles turn the flow back toward the axis to win most of the loss back.`,
              visual: nozzlePic(al, { split: true }),
            };
          },
        }),
      ],
    },
    {
      title: 'Pull-up to orbit',
      story: t`Burning hard, Kestrel pulls out of its drop on a small wing until it is climbing steeply, then flies on to orbit. The guidance team checks two numbers: the load on the wing during the pull-up, and the tilt of the orbit the upper stage reaches.`,
      items: [
        num({
          id: 'r4-lift', skill: 'math2210.C3-2.4', difficulty: 3,
          gen(r) {
            const V0 = r.pick([220, 235, 250]), gam = r.pick([10, 15, 20]) * DEG, q = r.pick([2.5, 3, 3.5]) * DEG, aT0 = r.pick([3, 4, 5]), m = r.pick([19, 20, 21]);
            const T = [Math.cos(gam), Math.sin(gam)], N = [-Math.sin(gam), Math.cos(gam)], aN0 = V0 * q;
            const v = T.map((c) => +(V0 * c).toFixed(1)), a = [0, 1].map((i) => +(aT0 * T[i] + aN0 * N[i]).toFixed(2));
            const V = Math.hypot(...v), aN = (v[0] * a[1] - v[1] * a[0]) / V, gN = (G0 * v[0]) / V, aTr = (v[0] * a[0] + v[1] * a[1]) / V;
            const L = m * (aN + gN);          // kN, since m is in tonnes
            return {
              prompt: t`Kestrel is pulling up on its wing. Ten seconds after ignition its navigation system reports, in the vertical plane of its flight ($x$ downrange, $z$ up), the velocity $\vec v = \langle ${v[0]},\ ${v[1]}\rangle$ m/s and the acceleration $\vec a = \langle ${a[0]},\ ${a[1]}\rangle$ m/s². Four forces act on it: the engine’s thrust and the air’s drag, both along the velocity; gravity, $9.81$ m/s² straight down; and the wing’s lift, at right angles to the velocity. The rocket’s mass is now ${m} t. How large is the lift? Give 3 significant figures.`,
              answer: L, units: 'kN', tol: { rel: 0.005 },
              errors: apart([
                { value: m * aN, feedback: t`That is only the part of the lift that bends the path. The wing must also hold the rocket up against gravity’s component across the path, $g\cos\gamma$.` },
                { value: m * (aN - gN), feedback: t`Gravity pulls the path’s bend the other way, so the lift has to overcome gravity’s part across the path as well: the two add, $L = m(a_N + g\cos\gamma)$.` },
                { value: m * Math.hypot(a[0], a[1] + G0), feedback: t`That is $m|\vec a - \vec g|$, which includes thrust and drag along the path. Lift is only the part across it.` },
              ], L),
              hints: [
                t`Split $\vec a$ into its parts along and across the path. The part across it, $a_N = |\vec v\times\vec a|/|\vec v|$, is what bends the path.`,
                t`Across the path only lift and gravity act. Gravity’s part across it is $g\cos\gamma$, pointing out of the upward bend, with $\cos\gamma = v_x/|\vec v|$.`,
                t`Newton’s second law across the path: $L - mg\cos\gamma = m\,a_N$.`,
              ],
              teach: t`Only the forces across a path bend it: the normal acceleration $a_N = |\vec v\times\vec a|/|\vec v|$ is set by the sideways forces alone.`,
              explain: t`$|\vec v| = ${tn(V, 4)}$ m/s, and the part of $\vec a$ across the path is $$a_N = \frac{|\vec v\times\vec a|}{|\vec v|} = \frac{(${v[0]})(${a[1]}) - (${v[1]})(${a[0]})}{${tn(V, 4)}} = ${tn(aN)}\ \text{m/s}^2,$$ toward the upper side of the path. (The part along it, $a_T = ${tn(aTr)}$ m/s², is thrust minus drag minus gravity’s share.) Gravity’s part across the path, $g\cos\gamma = 9.81\cdot\frac{${v[0]}}{${tn(V, 4)}} = ${tn(gN)}$ m/s², pulls the other way, so the wing must supply $$L = m(a_N + g\cos\gamma) = (${tn(m * 1000, 5)}\ \text{kg})(${tn(aN + gN)}\ \text{m/s}^2) = ${tn(L)}\ \text{kN},$$ about ${fmt((aN + gN) / G0, 2)} times the rocket’s weight. The path’s radius of curvature is $|\vec v|^2/a_N = ${tn((V * V) / aN / 1000)}$ km. An accelerometer on board reads exactly the non-gravitational part, $\vec a - \vec g$: lift, thrust and drag per unit mass.`,
              visual: pullupPic(v, a),
            };
          },
        }),
        num({
          id: 'r4-incline', skill: 'math2210.C3-2.5', difficulty: 3,
          gen(r) {
            const i0 = r.pick([28.5, 39, 51.6, 63.4, 97.8]) * DEG, Om = r.int(2, 34) * 10 * DEG, u = r.int(3, 14) * 5 * DEG * r.sign(), h = r.pick([450, 500, 550, 600]);
            const rm = RE + h, vm = Math.sqrt(GM / rm);
            const P = [Math.cos(Om), Math.sin(Om), 0], Q = [-Math.sin(Om) * Math.cos(i0), Math.cos(Om) * Math.cos(i0), Math.sin(i0)];
            const rv = [0, 1, 2].map((k) => Math.round(rm * (Math.cos(u) * P[k] + Math.sin(u) * Q[k])));
            const vv = [0, 1, 2].map((k) => +(vm * (-Math.sin(u) * P[k] + Math.cos(u) * Q[k])).toFixed(3));
            const hv = [rv[1] * vv[2] - rv[2] * vv[1], rv[2] * vv[0] - rv[0] * vv[2], rv[0] * vv[1] - rv[1] * vv[0]];
            const hm = Math.hypot(...hv), inc = Math.acos(hv[2] / hm) / DEG, lat = Math.asin(rv[2] / Math.hypot(...rv)) / DEG;
            const errs = [
              { value: Math.abs(lat), feedback: t`That is how far the stage is from the equator at burnout — its latitude. The orbit’s tilt comes from the plane of $\vec r$ and $\vec v$ together, whose normal is $\vec h = \vec r\times\vec v$.` },
              { value: 90 - inc, feedback: t`That is the angle between $\vec h$ and the equator’s plane. The inclination is the angle between the orbit’s plane and the equator — between their normals, $\vec h$ and the $z$-axis.` },
              { value: 180 - inc, feedback: t`Order matters in a cross product: $\vec h = \vec r\times\vec v$, while $\vec v\times\vec r = -\vec h$ gives $180^\circ - i$.` },
            ].filter((e) => e.value > 0.5 && Math.abs(e.value - inc) > 2);
            return {
              prompt: t`At burnout, the upper stage’s guidance reports its state in Earth-centred coordinates — $z$ along Earth’s axis toward the North Pole, $x$ and $y$ in the plane of the equator: position $\vec r = \langle ${rv[0]},\ ${rv[1]},\ ${rv[2]}\rangle$ km and velocity $\vec v = \langle ${vv[0]},\ ${vv[1]},\ ${vv[2]}\rangle$ km/s. From then on only gravity acts. What is the **inclination** of its orbit, the angle between the orbit’s plane and the equator? Give degrees to one decimal place.`,
              answer: inc, units: '°', tol: { rel: 0, abs: 0.15 },
              errors: errs.filter((e, k) => errs.slice(0, k).every((f) => Math.abs(f.value - e.value) > 2)),
              hints: [
                t`Gravity is central, so $\vec h = \vec r\times\vec v$ stays constant and the orbit stays in the plane of $\vec r$ and $\vec v$, with $\vec h$ perpendicular to it.`,
                t`The angle between two planes is the angle between their normals — here $\vec h$ and the $z$-axis: $\cos i = h_z/|\vec h|$.`,
              ],
              teach: t`The angular momentum $\vec h = \vec r\times\vec v$ is perpendicular to the orbit’s plane — it points along the path’s binormal — so the orbit’s tilt to the equator is the angle between $\vec h$ and Earth’s axis.`,
              explain: t`$$\vec h = \vec r\times\vec v = \langle ${tn(hv[0], 4)},\ ${tn(hv[1], 4)},\ ${tn(hv[2], 4)}\rangle\ \text{km}^2/\text{s},\qquad |\vec h| = ${tn(hm, 4)}\ \text{km}^2/\text{s},$$ so $\cos i = h_z/|\vec h| = ${fmt(hv[2] / hm, 4)}$ and $i = ${inc.toFixed(1)}^\circ$${inc > 90 ? ' — more than 90°, so the orbit is retrograde: it carries the stage round against Earth’s spin, as sun-synchronous orbits do' : ''}. Sense check: no point of an orbit inclined at $i$ is farther than $${Math.min(inc, 180 - inc).toFixed(1)}^\circ$ from the equator, and the stage is at latitude $\arcsin(r_z/|\vec r|) = ${lat.toFixed(1)}^\circ$. That is also why a rocket launched from latitude $\ell$ cannot reach an orbit inclined less than $\ell$ without an expensive change of plane — and one reason to launch from an aircraft, which can first fly toward the equator.`,
              visual: orbitPic(rv, vv, P, Q, u),
            };
          },
        }),
      ],
    },
    {
      title: 'Coming home',
      story: t`After the mission the upper stage turns round and re-enters, blunt end first, behind an ablative heat shield. The thermal team has two questions — where the shield gets hottest, and how fast heat is soaking into its material — and the review ends by checking which theorem did each job.`,
      items: [
        num({
          id: 'r5-hot', skill: 'math2210.C3-3.8', difficulty: 4,
          gen(r) {
            const R = 0.63, c = r.pick([200, 250, 300]), d = r.pick([1.1, 1.2, 1.3]), [dx, dy] = r.pick(DIRS), Tc = r.pick([1550, 1600, 1650]);
            const a = Math.round((2 * c * d * dx) / 5), b = Math.round((2 * c * d * dy) / 5), g = Math.hypot(a, b);
            const p = [a / (2 * c), b / (2 * c)], dd = Math.hypot(...p);
            const Tmax = Tc + R * g - c * R * R, Tmin = Tc - R * g - c * R * R, Tpeak = Tc + (g * g) / (4 * c);
            const ux = a / g, uy = b / g;
            const f = `${Tc} + ${a}*x + ${b}*y - ${c}*(x^2 + y^2)`;
            return {
              prompt: t`At peak heating the thermal model gives the temperature across the shield’s face as $$T(x, y) = ${Tc} ${sgn(a, 'x')} ${sgn(b, 'y')} - ${c}\,(x^2 + y^2)\ \text{K},$$ with $x$ and $y$ in metres from the centre of the face, which is a disk of radius ${R} m. How hot is the hottest point of the shield? Give 3 significant figures.`,
              answer: Tmax, units: 'K', tol: { rel: 0.003 },
              errors: apart([
                { value: Tpeak, feedback: t`That is the model’s peak, at $(${fmt(p[0], 3)}, ${fmt(p[1], 3)})$ — ${fmt(dd, 3)} m from the centre, beyond the ${R} m rim. On the shield itself the maximum has to be on the boundary.` },
                { value: Tmin, feedback: t`That is the coldest point of the rim. Lagrange’s condition $\nabla T = \lambda\nabla g$ has two solutions on the circle; compare $T$ at both.` },
                { value: Tc, feedback: t`At zero angle of attack the centre would be hottest, but here $\nabla T(0, 0) = \langle ${a}, ${b}\rangle \ne \vec 0$: the face gets hotter toward one side.` },
              ], Tmax, 0.006),
              hints: [
                t`Find the critical point of $T$ first. Is it on the shield, inside the disk $x^2 + y^2 \le ${R}^2$?`,
                t`It is not, so the maximum over the shield is on the rim: maximize $T$ subject to $g = x^2 + y^2 = ${nice(r4(R * R))}$, with $\nabla T = \lambda\nabla g$.`,
                t`$\nabla T = \lambda\nabla g$ reads $${a} - ${2 * c}x = 2\lambda x$ and $${b} - ${2 * c}y = 2\lambda y$, so $(x, y)$ is parallel to $(${a}, ${b})$. Compare the two rim points that gives.`,
              ],
              teach: t`On a closed region a maximum sits at a critical point inside or on the boundary — and when the critical point lies outside the region, Lagrange multipliers find the boundary’s maximum.`,
              explain: t`$\nabla T = \langle ${a} - ${2 * c}x,\ ${b} - ${2 * c}y\rangle$ vanishes only at $(${fmt(p[0], 3)}, ${fmt(p[1], 3)})$, which is ${fmt(dd, 3)} m from the centre: off the shield. (The model’s stagnation point, its hottest spot, has moved off the face, beyond the shoulder.) So the maximum over the disk is on the rim $g = x^2 + y^2 = ${nice(r4(R * R))}$. Lagrange’s condition $\nabla T = \lambda\nabla g$ gives $${a} - ${2 * c}x = 2\lambda x$ and $${b} - ${2 * c}y = 2\lambda y$, so $(x, y)$ is parallel to $(${a}, ${b})$: the rim points $\pm${R}\,(${fmt(ux, 2)}, ${fmt(uy, 2)})$. The hotter is $(${fmt(R * ux, 3)}, ${fmt(R * uy, 3)})$, where $$T = ${Tc} + ${R}\sqrt{${Math.abs(a)}^2 + ${Math.abs(b)}^2} - ${c}(${R})^2 = ${tn(Tmax, 4)}\ \text{K};$$ the other, at $${tn(Tmin, 4)}$ K, is the coldest point of the rim. At angle of attack a capsule’s stagnation point moves toward its windward shoulder, which is why a shield’s rim needs as much attention as its middle.`,
              visual: shieldPic(f, R, p, Tpeak, c),
            };
          },
        }),
        num({
          id: 'r5-heat', skill: 'math2210.C3-5.9', difficulty: 4,
          gen(r) {
            const acm = r.pick([2, 2.5, 3]), hcm = r.pick([3, 4]), k = r.pick([0.3, 0.4, 0.5]), A5 = r.pick([3, 4, 5]), B5 = r.pick([0.5, 1]);
            const a = acm / 100, h = hcm / 100, A = A5 * 1e5, B = B5 * 1e5, G = 4e4;
            const lap = 2 * A - 4 * B, V = PI * a * a * h, P = k * lap * V;
            const Pin = k * G * PI * a * a, Pback = k * (G - 2 * A * h) * PI * a * a, Pside = 4 * PI * k * B * a * a * h;
            return {
              prompt: t`In an arc-jet test of the shield’s material, a cylindrical plug is heated on its front face. Thermocouples inside it fit, at one moment, $$T(x, y, z) = 1700 - 4.0\times10^{4}\,z + ${A5.toFixed(1)}\times10^{5}\,z^2 - ${B5.toFixed(1)}\times10^{5}\,(x^2 + y^2)\ \text{K},$$ with $z$ the depth below the heated face and $x$, $y$ across it, all in metres; the plug is the solid $x^2 + y^2 \le ${nice(a)}^2$, $0 \le z \le ${nice(h)}$. Heat flows as $\vec q = -k\nabla T$ (Fourier’s law), with $k = ${k}$ W/(m·K). At what rate is heat building up inside the plug — the net rate at which heat flows in through its whole surface? Give 3 significant figures.`,
              answer: P, units: 'W', tol: { rel: 0.005 },
              errors: apart([
                { value: k * (2 * A - 2 * B) * V, feedback: t`$\nabla^2$ of $-B(x^2 + y^2)$ is $-2B - 2B$: both the $x^2$ and the $y^2$ term contribute.` },
                { value: k * 2 * A * V, feedback: t`Heat also leaks out through the plug’s curved side: the $x^2 + y^2$ term contributes $-4\times${B5.toFixed(1)}\times10^5$ to $\nabla^2T$.` },
                { value: Pin, feedback: t`That is only the heat coming in through the heated face. Some of it leaves again through the back and the side; the net is $\iiint k\nabla^2T\,dV$.` },
              ], P),
              hints: [
                t`The net heat in is $-\oiint\vec q\cdot d\vec S$ over the plug’s three faces. The divergence theorem turns it into one volume integral: $-\iiint\nabla\cdot\vec q\,dV = \iiint k\nabla^2T\,dV$.`,
                t`$\nabla^2T = T_{xx} + T_{yy} + T_{zz} = -2(${B5.toFixed(1)}\times10^5) - 2(${B5.toFixed(1)}\times10^5) + 2(${A5.toFixed(1)}\times10^5)$ K/m² — a constant.`,
                t`So the integral is $k\nabla^2T$ times the plug’s volume, $\pi a^2h$, with $a$ and $h$ in metres.`,
              ],
              teach: t`The divergence theorem turns the net flow through a closed surface into the integral of the divergence inside — and for heat, $-\nabla\cdot\vec q = k\nabla^2T$ is the rate at which heat is stored per unit volume.`,
              explain: t`Directly, this takes three surface integrals: front, back and curved side. The divergence theorem needs one: the net heat in is $-\oiint\vec q\cdot d\vec S = -\iiint\nabla\cdot\vec q\,dV = \iiint k\nabla^2T\,dV$, and here $\nabla^2T = ${tn(lap)}$ K/m² everywhere, so $$P = k\nabla^2T\cdot\pi a^2h = (${k})(${tn(lap)})\cdot\pi(${nice(a)})^2(${nice(h)}) = ${tn(P)}\ \text{W}.$$ (Face by face: $${tn(Pin)}$ W in through the front, $${tn(Pback)}$ W out through the back, $${tn(Pside)}$ W out through the side.) What it means: the plug is gaining heat at ${fmt(P, 3)} W, so it is warming — on average at $k\nabla^2T/\rho c_p$, about ${fmt((k * lap) / (270 * 1600), 2)} K/s for a light ablator of density 270 kg/m³ and specific heat 1600 J/(kg·K). That is the heat equation, $\partial T/\partial t = (k/\rho c_p)\nabla^2T$, read off the divergence theorem. (A real ablator also soaks up heat as its resin decomposes; this model leaves that out.)`,
              visual: plugPic(acm, hcm, k, A, B),
            };
          },
        }),
        match({
          id: 'r5-theorems', skill: 'math2210.C3-5.10', difficulty: 2,
          prompt: t`The review’s last page lists four integrals still to be done. Match each with the theorem that makes it easy.`,
          left: [
            t`$\int_C\vec F_g\cdot d\vec r$: the work Earth’s gravity does on the upper stage along its whole curving climb to orbit`,
            t`$\oint_C\vec w\cdot d\vec r$: the circulation of the wind round the carrier’s holding pattern, a flat racetrack at one altitude, from a map of the wind’s vorticity`,
            t`$\oint_C\vec E\cdot d\vec r$: the emf round a bent wire loop on the stage, from the changing magnetic field through it`,
            t`$\oiint_S\vec g\cdot d\vec S$: the flux of gravity out through a lumpy closed surface drawn round the Moon`,
          ],
          right: ['Green’s theorem', 'Stokes’ theorem', 'the divergence theorem', 'the fundamental theorem for line integrals', 'none of them: parametrize it and integrate directly'],
          answer: [3, 0, 1, 2],
          hints: [
            t`Each theorem trades an integral over a boundary for one over what it bounds: a curve’s two ends (the fundamental theorem for line integrals), a flat region’s edge (Green), a curved surface’s edge (Stokes), a solid’s closed surface (divergence).`,
            t`Gravity has a potential; the racetrack is flat; the wire loop is bent in space; the surface round the Moon is closed.`,
          ],
          teach: t`Green, Stokes, the divergence theorem and the fundamental theorem for line integrals are one theorem: the integral of a derivative over a region equals an integral over the region’s boundary.`,
          explain: t`Gravity is conservative, $\vec F_g = -\nabla U$, so its work depends only on the ends of the climb: $U(\text{start}) - U(\text{end})$. The holding pattern is a flat loop, so Green’s theorem makes its circulation the integral of the vorticity over the region inside. The wire loop is bent in space, so Stokes’ theorem (with any surface spanning it) makes the emf $-\frac{d}{dt}\iint\vec B\cdot d\vec S$: Faraday’s law. And a closed surface calls for the divergence theorem: $\oiint\vec g\cdot d\vec S = \iiint\nabla\cdot\vec g\,dV = -4\pi GM_\text{Moon}$, whatever its lumps.`,
        }),
      ],
    },
  ],
});
