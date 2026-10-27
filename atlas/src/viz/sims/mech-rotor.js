// A rigid body turning about a fixed axis, seen along the axis: a disk, ring,
// rod, plate, sphere, shell or dumbbell, with the axis anywhere along its
// length (the parallel-axis theorem), forces fixed to the body with their
// lever arms drawn, or a block hanging from a string wound round the rim.
// Play spins it up with α = τ/I (or with a prescribed α, for pure kinematics);
// a marked point shows its velocity and the two parts of its acceleration.
// Optional graph below: ω against t (the area under it is the angle turned),
// or I against the axis offset d (a parabola, lowest at the centre of mass).
// The physics is model/mech-rotor.js (tested headlessly).
//
//   { type: 'mech-rotor', params: {
//       shape: 'disk',             // disk ring rod plate sphere shell dumbbell
//       M: 2, R: 0.3,              // mass (kg); radius (m) of disk, ring, sphere, shell
//       L: 1.2, W: 0.5,            // rod or plate length, plate width (m)
//       m: 1, s: 0.4,              // dumbbell: each point mass (kg), its distance from the centre (m)
//       d: 0,                      // the axis's distance from the centre of mass, along the body's length (m)
//       shapes: ['disk', 'ring'],  // offer a choice of shapes
//       omega0: 0,                 // angular velocity at t = 0 (rad/s, + anticlockwise)
//       alpha: 1.5,                // a prescribed angular acceleration (rad/s²): pure kinematics, forces ignored
//       F: 20, rF: 0.3, phi: 90,   // a force fixed to the body: size (N); distance from the axis (m, along the
//                                  //   body's length; negative: the other side); angle (°) from the outward radial line
//       F2: 0, rF2: 0, phi2: 90,   // an optional second force
//       hang: 0,                   // a block (kg) on a string wound round the rim (round shapes, axis at the centre)
//       point: 0.25,               // mark a point this far from the axis (m): its v, a_t and a_c
//       plot: false,               // 'omega' (ω–t), 'axis' (I against d) or false
//       sliders: ['F', 'phi'],     // adjustable keys, or objects overriding { key, min, max, step, label, explain }
//       T: 5, time: 0, play: true, // seconds of motion; where the playhead starts; offer Play
//       values: true,              // numbers on the arrows
//       lever: true,               // draw each force's line of action and lever arm
//       cm: true,                  // mark the centre of mass when the axis is not at it
//       readouts: ['I', 'tau'],    // I Icm Md2 tau alpha omega theta K v at ac a T — or false (default: a set to suit)
//   } }

import { Plot, themeColors } from '../plot.js';
import * as RM from '../model/mech-rotor.js';

export const defaults = {
  shape: 'disk', M: 2, R: 0.3, L: 1.2, W: 0.5, m: 1, s: 0.4, d: 0, shapes: null,
  omega0: 0, alpha: null, F: 0, rF: null, phi: 90, F2: 0, rF2: null, phi2: 90, hang: 0, g: 9.8,
  point: null, plot: false, sliders: [], T: 5, time: 0, play: true, values: true, lever: true, readouts: null, cm: true,
};

const D2R = Math.PI / 180;
const SHAPE_KEYS = Object.keys(RM.SHAPES);
const ROUND = ['disk', 'ring', 'sphere', 'shell'];
const READOUTS = ['I', 'Icm', 'Md2', 'tau', 'alpha', 'omega', 'theta', 'K', 'v', 'at', 'ac', 'a', 'T'];
const SHAPE_LABEL = { disk: 'Disk', ring: 'Ring', rod: 'Rod', plate: 'Plate', sphere: 'Sphere', shell: 'Shell', dumbbell: 'Dumbbell' };

const DEFS = {
  M: { label: 'Mass $M$', min: 0.1, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'The whole body’s mass.' },
  R: { label: 'Radius $R$', min: 0.05, max: 1, step: 0.01, unit: '\\mathrm{m}', explain: 'Of the disk, ring or sphere.' },
  L: { label: 'Length $L$', min: 0.2, max: 3, step: 0.05, unit: '\\mathrm{m}', explain: 'Of the rod or plate.' },
  W: { label: 'Width $W$', min: 0.1, max: 2, step: 0.05, unit: '\\mathrm{m}', explain: 'Of the plate.' },
  m: { label: 'Each point mass $m$', min: 0.1, max: 5, step: 0.1, unit: '\\mathrm{kg}', explain: 'The light rod between them counts as massless.' },
  s: { label: 'Their distance from the centre, $s$', min: 0.05, max: 1, step: 0.01, unit: '\\mathrm{m}', explain: 'Both masses sit this far from the middle of the rod.' },
  d: { label: 'Axis offset $d$', min: 0, max: 0.6, step: 0.01, unit: '\\mathrm{m}', explain: 'Distance from the centre of mass to the axis.' },
  omega0: { label: 'Initial angular velocity $\\omega_0$', min: -10, max: 10, step: 0.1, unit: '\\mathrm{rad/s}', explain: 'At $t = 0$. Positive: anticlockwise.' },
  alpha: { label: 'Angular acceleration $\\alpha$', min: -5, max: 5, step: 0.1, unit: '\\mathrm{rad/s^2}', explain: 'Constant. Positive: anticlockwise.' },
  F: { label: 'Force $F$', min: 0, max: 50, step: 0.5, unit: '\\mathrm{N}', explain: 'Fixed to the body, so it turns with it — like a small thruster.' },
  rF: { label: 'Distance from the axis, $r$', min: 0, max: 1.2, step: 0.01, unit: '\\mathrm{m}', explain: 'Where the force is applied, measured from the axis.' },
  phi: { label: 'Angle $\\varphi$', min: 0, max: 180, step: 1, unit: '^\\circ', explain: 'Between the radial line (from the axis out to the point) and the force.' },
  F2: { label: 'Second force $F_2$', min: 0, max: 50, step: 0.5, unit: '\\mathrm{N}', explain: 'Also fixed to the body.' },
  rF2: { label: 'Its distance from the axis, $r_2$', min: -1.2, max: 1.2, step: 0.01, unit: '\\mathrm{m}', explain: 'Negative: on the other side of the axis.' },
  phi2: { label: 'Its angle $\\varphi_2$', min: 0, max: 180, step: 1, unit: '^\\circ', explain: 'From its outward radial line.' },
  hang: { label: 'Hanging mass $m$', min: 0.05, max: 5, step: 0.05, unit: '\\mathrm{kg}', explain: 'On a light string wound round the rim.' },
  point: { label: 'Marked point at radius $r$', min: 0, max: 1, step: 0.01, unit: '\\mathrm{m}', explain: 'Its distance from the axis.' },
};
const KEYS = Object.keys(DEFS);

const sliderList = (P) => (P.sliders || []).map((k) => (typeof k === 'string' ? { key: k, ...DEFS[k], value: P[k] } : { ...DEFS[k.key], ...k, key: k.key, value: k.value ?? P[k.key] }));

/** The model's input from current values: v(key) reads a slider, a choice or a fixed parameter. */
function modelOf(P, v) {
  const shape = v('shape');
  const half = RM.SHAPES[shape].half({ R: v('R'), L: v('L'), s: v('s') });
  const forces = [];
  if (v('F') > 0) forces.push({ F: v('F'), r: v('rF') ?? v('d') + half, phi: v('phi') });
  if (v('F2') > 0) forces.push({ F: v('F2'), r: v('rF2') ?? -(half - v('d')), phi: v('phi2') });
  return { shape, M: v('M'), R: v('R'), L: v('L'), W: v('W'), m: v('m'), s: v('s'), d: v('d'), omega0: v('omega0'), alpha: v('alpha'), forces, hang: ROUND.includes(shape) ? v('hang') : 0, g: P.g, half };
}

const trim = (x, n = 3) => { const r = +(+x).toPrecision(n); return Math.abs(r) < 1e-12 ? '0' : String(r); };
const texq = (x, u) => `${Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? (+x).toExponential(2).replace(/e\+?(-?\d+)/, '\\times10^{$1}') : trim(x)}\\,\\mathrm{${u}}`;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const bodyH = compact ? 240 : 310, plotH = P.plot ? (compact ? 130 : 160) : 0;
  const { canvas } = F.canvas({ label: P.alt || 'A body turning about a fixed axis, seen along the axis', height: `${bodyH + plotH}px` });
  const ctx = canvas.getContext('2d');
  const sliders = sliderList(P);
  const v = (k) => (F.params[k] !== undefined ? F.params[k] : P[k]);

  let Mo = RM.motion(modelOf(P, (k) => (sliders.find((s) => s.key === k)?.value ?? P[k])));
  const runT = () => {
    if (!Mo.block) return P.T;
    // stop when the block has dropped a few drum radii
    return Math.min(P.T, Math.sqrt((2 * maxDrop()) / Math.max(Mo.block.a, 1e-9)));
  };
  const animated = P.play !== false && !(compact && !sliders.length) && (P.alpha !== null || P.F > 0 || P.F2 > 0 || P.hang > 0 || P.omega0 !== 0 || sliders.some((s) => ['F', 'F2', 'alpha', 'omega0', 'hang'].includes(s.key)));
  const maxDrop = () => Math.max(0.5, 3.5 * RM.SHAPES[v('shape')].half({ R: v('R'), L: v('L'), s: v('s') }));
  let timeCtl = null;
  if (animated) timeCtl = F.slider({ key: 'time', label: 'Time $t$', min: 0, max: runT(), step: 0.01, value: Math.min(P.time, runT()), unit: '\\mathrm{s}', explain: 'Scrub through the motion, or press Play.' });
  if (P.shapes) F.choice({ key: 'shape', label: 'Shape', options: P.shapes.map((s) => [s, SHAPE_LABEL[s]]), value: P.shape });
  for (const s of sliders) F.slider(s);
  const model = () => modelOf(P, v);
  const rebuild = () => {
    Mo = RM.motion(model());
    if (timeCtl) { const input = timeCtl.node.querySelector('input'); if (input) input.max = String(runT()); if (F.params.time > runT()) timeCtl.set(runT()); }
  };
  rebuild();

  const S = { running: false };
  let playBtn = null;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    let tn = (F.params.time ?? 0) + dt * (P.rate || 1);
    if (tn >= runT()) { tn = runT(); S.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
    F.set('time', tn);
  }, { force: true });
  if (animated) {
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      if ((F.params.time ?? 0) >= runT() - 1e-9) F.set('time', 0);
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
  }
  F.onChange((key) => { if (key !== 'time') rebuild(); draw(); });

  const body = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, axes: false });
  const graph = P.plot ? new Plot(canvas, { x: [0, 1], y: [0, 1], xlabel: '', ylabel: '', xticks: 6, yticks: 4 }) : null;

  // points on the body's outline at θ = 0 (axis at the origin, length along +x)
  function bodyPts(md) {
    const { d } = md;
    if (ROUND.includes(md.shape)) return [[d - md.R, -md.R], [d + md.R, md.R]];
    if (md.shape === 'rod') { const hw = Math.max(0.018, 0.022 * md.L); return [[d - md.L / 2, -hw], [d + md.L / 2, hw]]; }
    if (md.shape === 'plate') return [[d - md.L / 2, -md.W / 2], [d + md.L / 2, md.W / 2], [d - md.L / 2, md.W / 2], [d + md.L / 2, -md.W / 2]];
    const rr = dumbR(md);
    return [[d - md.s - rr, -rr], [d + md.s + rr, rr]];
  }
  // the square a body sweeps as it turns about the axis
  const circlePts = (md) => { const r = rBodyOf(md); return [[-r, -r], [r, r]]; };
  const dumbR = (md) => Math.max(0.035, 0.05 * Math.cbrt(md.m)) * Math.max(0.6, md.s / 0.4);
  const rBodyOf = (md) => Math.max(1e-3, ...(ROUND.includes(md.shape) ? [Math.abs(md.d) + md.R] : bodyPts(md).map((q) => Math.hypot(q[0], q[1]))), md.shape === 'plate' ? Math.hypot(Math.abs(md.d) + md.L / 2, md.W / 2) : 0);
  const forceLen = (md, f) => 0.42 * rBodyOf(md) * (0.4 + (0.6 * f.F) / Math.max(...md.forces.map((q) => q.F)));
  const forceDir0 = (f) => (f.r < 0 ? Math.PI : 0) + f.phi * D2R;      // direction at θ = 0

  // the view: what is drawn, plus the circle it sweeps if it turns
  function fitView(pl, md, extra = []) {
    const pts = [[0, 0], ...bodyPts(md), ...extra.flatMap((e) => (animated ? circlePts(e) : bodyPts(e)))];
    let right = 0;
    for (const f of md.forces) {
      const u = [Math.cos(forceDir0(f)), Math.sin(forceDir0(f))], L = forceLen(md, f);
      pts.push([f.r, 0], [f.r + u[0] * L, u[1] * L]);
      right = Math.max(right, P.values ? 0.25 : 0.1);
    }
    const rB = rBodyOf(md);
    if (animated && !md.hang) {
      const r = Math.max(rB, ...md.forces.map((f) => Math.abs(f.r) + forceLen(md, f)));
      pts.push([-r, -r], [r, r]);
    }
    if (md.hang > 0) {
      const R = md.half, bw = 0.1 + 0.08 * Math.cbrt(md.hang);
      pts.push([-R, R], [R + bw, -(0.6 * R + 0.15 + maxDrop() + 2 * bw)]);
      right = Math.max(right, 0.35);
    }
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1e-3);
    const m = 0.1 * span;
    pl.setView([Math.min(...xs) - m, Math.max(...xs) + m + right * span], [Math.min(...ys) - m, Math.max(...ys) + m]);
    return rB;
  }

  function draw() {
    const c = themeColors();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || bodyH + plotH;
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const md = model();
    const t = timeCtl ? Math.min(F.params.time ?? 0, runT()) : 0;
    const now = Mo.at(t);
    drawBody(c, W, md, now, t);
    if (graph) drawGraph(c, W, md, t, now);
    readout(md, now, t);
  }

  function drawBody(c, W, md, now, t) {
    const pl = body;
    pl.w = W; pl.h = bodyH; pl.o.pad = { l: 8, r: 8, t: 8, b: 8 };
    // fit the view to the largest body the sliders allow, so that resizing shows as resizing
    const SIZE = ['M', 'R', 'L', 'W', 'm', 's', 'd', 'rF', 'rF2', 'F', 'F2'];
    const big = modelOf(P, (k) => { const sl = SIZE.includes(k) && sliders.find((q) => q.key === k); return sl ? (k === 'rF2' ? -sl.max : sl.max) : v(k); });
    const shapesBig = P.shapes ? P.shapes.map((sh) => modelOf(P, (k) => (k === 'shape' ? sh : big[k] ?? v(k)))) : [big];
    const rch = fitView(pl, md, shapesBig);
    pl.refreshTheme();
    const th = now.theta, cs = Math.cos(th), sn = Math.sin(th);
    const rot = (x, y) => [x * cs - y * sn, x * sn + y * cs];
    const cm = rot(md.d, 0);
    const g = ctx;
    const disc = (x, y, r, color, fillAlpha, width) => { if (fillAlpha) pl.circle(x, y, r, { fill: color, alpha: fillAlpha, stroke: false }); pl.circle(x, y, r, { color, width }); };
    switch (md.shape) {
      case 'disk': case 'sphere': {
        const col = md.shape === 'sphere' ? 'teal' : 'accent';
        disc(cm[0], cm[1], md.R, col, md.shape === 'sphere' ? 0.38 : 0.32, 2);
        if (md.shape === 'sphere') pl.circle(cm[0], cm[1], md.R * 0.62, { color: 'teal', width: 1, dash: [3, 4], alpha: 0.6 });
        spokes(pl, cm, md.R, th, col);
        break;
      }
      case 'ring': case 'shell': {
        const col = md.shape === 'shell' ? 'teal' : 'accent';
        disc(cm[0], cm[1], md.R, col, md.shape === 'shell' ? 0.12 : 0, md.shape === 'shell' ? 4 : 7);
        spokes(pl, cm, md.R, th, 'ink4', true);
        break;
      }
      case 'rod': {
        const hw = Math.max(0.018, 0.022 * md.L);
        poly(pl, [[md.d - md.L / 2, -hw], [md.d + md.L / 2, -hw], [md.d + md.L / 2, hw], [md.d - md.L / 2, hw]].map(([x, y]) => rot(x, y)), 'accent', 0.6);
        break;
      }
      case 'plate': {
        poly(pl, [[md.d - md.L / 2, -md.W / 2], [md.d + md.L / 2, -md.W / 2], [md.d + md.L / 2, md.W / 2], [md.d - md.L / 2, md.W / 2]].map(([x, y]) => rot(x, y)), 'accent', 0.32);
        break;
      }
      case 'dumbbell': {
        const a = rot(md.d - md.s, 0), b = rot(md.d + md.s, 0), rr = dumbR(md);
        pl.line(a[0], a[1], b[0], b[1], { color: 'ink3', width: 2 });
        pl.circle(a[0], a[1], rr, { fill: 'accent', alpha: 0.9, color: 'accent', width: 1.5 });
        pl.circle(b[0], b[1], rr, { fill: 'accent', alpha: 0.9, color: 'accent', width: 1.5 });
        break;
      }
    }
    // the centre of mass (when the axis is elsewhere) and the axis itself (⊙: pointing out of the screen)
    if (P.cm && Math.abs(md.d) > 1e-9) cmCross(c, pl.X(cm[0]), pl.Y(cm[1]));
    const ax = pl.X(0), ay = pl.Y(0);
    g.save(); g.strokeStyle = c.gold; g.fillStyle = c.gold; g.lineWidth = 2;
    g.beginPath(); g.arc(ax, ay, 7, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(ax, ay, 2.2, 0, Math.PI * 2); g.fill(); g.restore();
    // the hanging block
    if (md.hang > 0 && Mo.block) {
      const xr = md.half, ytop = -(0.6 * md.half + 0.15 + now.drop), bw = 0.1 + 0.08 * Math.cbrt(md.hang);
      pl.line(xr, 0, xr, ytop, { color: 'ink2', width: 1.4 });
      g.save(); g.fillStyle = c.violet; g.globalAlpha = 0.9;
      const px = pl.X(xr - bw), py = pl.Y(ytop), pw = pl.X(xr + bw) - px, ph = pl.Y(ytop - 2 * bw) - py;
      g.fillRect(px, py, pw, ph); g.restore();
      label(c, `${trim(md.hang)} kg`, pl.X(xr + bw) + 6, pl.Y(ytop - bw), { color: c.violet, weight: 650 });
      if (P.values && t > 0) label(c, `v = ${trim(now.vBlock)} m/s`, pl.X(xr + bw) + 6, pl.Y(ytop - bw) + 15, { color: c.ink2, size: 11 });
    }
    // forces, their lines of action and lever arms
    md.forces.forEach((f, i) => {
      const A = rot(f.r, 0);
      const base = Math.atan2(A[1], A[0]) + (Math.abs(f.r) < 1e-9 ? th : 0);
      const dir = (Math.abs(f.r) < 1e-9 ? th : base) + f.phi * D2R;
      const u = [Math.cos(dir), Math.sin(dir)];
      const len = forceLen(md, f);
      if (P.lever) {
        pl.line(A[0] - u[0] * rch * 1.6, A[1] - u[1] * rch * 1.6, A[0] + u[0] * rch * 1.6, A[1] + u[1] * rch * 1.6, { color: 'ink4', width: 1.1, dash: [5, 5] });
        const s = -(A[0] * u[0] + A[1] * u[1]), foot = [A[0] + s * u[0], A[1] + s * u[1]];
        if (Math.hypot(...foot) > 1e-6) {
          pl.line(0, 0, foot[0], foot[1], { color: 'gold', width: 2.2 });
          const mid = [foot[0] / 2, foot[1] / 2];
          label(c, i ? 'r⊥₂' : 'r⊥', pl.X(mid[0]) + 6, pl.Y(mid[1]) - 8, { color: c.gold, weight: 650, size: 11.5 });
        }
      }
      pl.arrow(A[0], A[1], A[0] + u[0] * len, A[1] + u[1] * len, { color: i ? 'good' : 'bad', width: 2.8, label: P.values ? `${i ? 'F₂' : 'F'} = ${trim(f.F)} N` : i ? 'F₂' : 'F' });
      pl.point(A[0], A[1], { color: i ? 'good' : 'bad', r: 3.5 });
    });
    // angular velocity: a curved arrow round the axis
    if (Math.abs(now.omega) > 1e-6) {
      const r = Math.max(14, Math.min(26, 0.18 * (pl.X(rch) - pl.X(0)))), sgn = Math.sign(now.omega);
      const a0 = -Math.PI / 2 - sgn * 0.9, a1 = a0 + sgn * 1.9;
      g.save(); g.strokeStyle = c.good; g.fillStyle = c.good; g.lineWidth = 2;
      g.beginPath(); g.arc(ax, ay, r, -a0, -a1, sgn > 0); g.stroke();
      const ex = ax + r * Math.cos(a1), ey = ay - r * Math.sin(a1), tx = -Math.sin(a1) * sgn, ty = -Math.cos(a1) * sgn;
      g.beginPath(); g.moveTo(ex + tx * 7, ey + ty * 7); g.lineTo(ex - ty * 4.5, ey + tx * 4.5); g.lineTo(ex + ty * 4.5, ey - tx * 4.5); g.closePath(); g.fill();
      g.restore();
      label(c, 'ω', ax + r + 4, ay + r - 2, { color: c.good, weight: 700, size: 12 });
    }
    // a marked point: its velocity (tangent) and acceleration (inward a_c, tangential a_t)
    if (P.point !== null && P.point !== undefined) {
      const rp = v('point'), Q = rot(rp, 0), kin = RM.pointKinematics(rp, now.omega, Mo.alpha);
      pl.point(Q[0], Q[1], { color: 'gold', r: 4.5 });
      if (rp > 1e-9) {
        const tang = [-Math.sin(th), Math.cos(th)], radial = [Math.cos(th), Math.sin(th)];
        const vmax = Math.max(1e-9, Math.abs(rp) * (animated ? Math.max(Math.abs(Mo.omega0), Math.abs(Mo.omega0 + Mo.alpha * runT())) : Math.abs(now.omega)));
        const amax = Math.max(1e-9, Math.abs(kin.at), Math.abs(kin.ac));       // rescaled each instant: the larger part keeps its length
        const kv = (0.7 * rch) / vmax, ka = (0.42 * rch) / amax;
        const vv = rp * now.omega;
        if (Math.abs(vv) > 1e-9) pl.arrow(Q[0], Q[1], Q[0] + tang[0] * vv * kv, Q[1] + tang[1] * vv * kv, { color: 'good', width: 2.4, label: P.values ? `v = ${trim(Math.abs(vv))} m/s` : 'v' });
        if (Math.abs(kin.ac) > 1e-9) pl.arrow(Q[0], Q[1], Q[0] - radial[0] * kin.ac * ka, Q[1] - radial[1] * kin.ac * ka, { color: 'bad', width: 2.2, label: 'a_c' });
        // a_t runs along the same line as v: draw it just outside, side by side
        const off = 0.07 * rch, B = [Q[0] + radial[0] * off, Q[1] + radial[1] * off];
        if (Math.abs(kin.at) > 1e-9) pl.arrow(B[0], B[1], B[0] + tang[0] * kin.at * ka, B[1] + tang[1] * kin.at * ka, { color: 'warn', width: 2.2, label: 'a_t' });
      }
    }
  }

  function drawGraph(c, W, md, t, now) {
    const p = graph, y0 = bodyH;
    p.w = W; p.h = bodyH + plotH;
    p.o.pad = { l: 52, r: 18, t: y0 + 16, b: 26 };
    if (P.plot === 'omega') {
      const T = runT(), w0 = Mo.omega0, w1 = Mo.omega0 + Mo.alpha * T;
      let lo = Math.min(0, w0, w1), hi = Math.max(0, w0, w1);
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      const padv = (hi - lo) * 0.12;
      p.setView([0, T], [lo - (lo < 0 ? padv : 0), hi + (hi > 0 ? padv : 0)]);
      p.refreshTheme(); p.grid(); p.axes();
      const area = [[0, 0], [0, w0], [t, now.omega], [t, 0]];
      p.path(area, { close: true, fill: 'good', fillAlpha: 0.2, stroke: false });
      p.line(0, w0, T, w1, { color: 'good', width: 2.4 });
      p.line(t, p.vy0, t, p.vy1, { color: 'ink3', width: 1, dash: [4, 4] });
      p.point(t, now.omega, { color: 'good', r: 4 });
      label(c, 'ω (rad/s) — shaded area = angle turned', p.L + 4, y0 + 8, { color: c.good, size: 11.5, weight: 650 });
      label(c, 't (s)', p.R - 24, p.B + 18, { color: c.ink2, size: 11.5 });
    } else if (P.plot === 'axis') {
      const sl = sliders.find((s) => s.key === 'd'), dmax = sl ? sl.max : Math.max(md.half, Math.abs(md.d)) * 1.1;
      const In = RM.inertia({ ...md, d: 0 }), M = In.M, Imax = In.Icm + M * dmax * dmax;
      p.setView([-dmax, dmax], [0, Imax * 1.12]);
      p.refreshTheme(); p.grid(); p.axes();
      p.fn((x) => In.Icm + M * x * x, { color: 'accent', width: 2.4 });
      p.line(p.vx0, In.Icm, p.vx1, In.Icm, { color: 'ink3', width: 1, dash: [4, 4] });
      p.point(md.d, In.Icm + M * md.d * md.d, { color: 'gold', r: 5 });
      label(c, 'I (kg·m²) against the axis offset d (m)', p.L + 4, y0 + 8, { color: c.accent, size: 11.5, weight: 650 });
      label(c, 'I_cm', p.R - 30, p.Y(In.Icm) - 9, { color: c.ink2, size: 11 });
    }
  }

  function readout(md, now, t) {
    const list = P.readouts === false ? [] : P.readouts || (sliders.length || P.shapes ? defaultReadouts(md) : []);
    const rows = [];
    const kin = P.point !== null && P.point !== undefined ? RM.pointKinematics(v('point'), now.omega, Mo.alpha) : null;
    for (const k of list) {
      if (k === 'I') rows.push(['$I$', texq(Mo.I, 'kg\\,m^2')]);
      if (k === 'Icm') rows.push(['$I_\\text{cm}$', texq(Mo.Icm, 'kg\\,m^2')]);
      if (k === 'Md2') rows.push(['$Md^2$', texq(Mo.Md2, 'kg\\,m^2')]);
      if (k === 'tau') rows.push(['net torque $\\tau$', texq(Mo.tau, 'N\\,m')]);
      if (k === 'alpha') rows.push(['$\\alpha$', texq(Mo.alpha, 'rad/s^2')]);
      if (k === 'omega') rows.push(['$\\omega$', texq(now.omega, 'rad/s')]);
      if (k === 'theta') rows.push(['$\\theta$', `${texq(now.theta, 'rad')} = ${trim(now.theta / (2 * Math.PI))}\\ \\text{rev}`]);
      if (k === 'K') rows.push(['$K = \\tfrac12 I\\omega^2$', texq(now.K, 'J')]);
      if (kin && k === 'v') rows.push(['point: $v = r\\omega$', texq(kin.v, 'm/s')]);
      if (kin && k === 'at') rows.push(['$a_t = r\\alpha$', texq(kin.at, 'm/s^2')]);
      if (kin && k === 'ac') rows.push(['$a_c = \\omega^2 r$', texq(kin.ac, 'm/s^2')]);
      if (Mo.block && k === 'a') rows.push(['block’s acceleration $a$', texq(Mo.block.a, 'm/s^2')]);
      if (Mo.block && k === 'T') rows.push(['string tension $T$', `${texq(Mo.block.T, 'N')}\\ (mg = ${trim(Mo.block.m * P.g)}\\,\\mathrm{N})`]);
    }
    if (list.length) F.readout(rows);
    void t;
  }
  function defaultReadouts(md) {
    if (P.plot === 'axis') return ['Icm', 'Md2', 'I'];
    if (md.hang > 0) return ['I', 'a', 'alpha', 'T'];
    if (P.alpha !== null) return P.point !== null ? ['omega', 'theta', 'v', 'at', 'ac'] : ['alpha', 'omega', 'theta'];
    if (md.forces.length || sliders.some((s) => ['F', 'F2'].includes(s.key))) return ['I', 'tau', 'alpha', 'omega', 'K'];
    return ['I', 'K'];
  }

  // ─── drawing helpers ─────────────────────────────────────────────────────
  function spokes(pl, cm, R, th, color, dashed = false) {
    for (let k = 0; k < 4; k++) {
      const a = th + (k * Math.PI) / 2;
      pl.line(cm[0], cm[1], cm[0] + R * 0.92 * Math.cos(a), cm[1] + R * 0.92 * Math.sin(a), { color, width: k ? 1.2 : 2.2, dash: dashed ? [4, 4] : [] });
    }
    pl.point(cm[0] + R * Math.cos(th), cm[1] + R * Math.sin(th), { color: 'ink2', r: 3.4 });
  }
  function poly(pl, pts, color, alpha) { pl.path(pts, { close: true, fill: color, fillAlpha: alpha, color, width: 2 }); }
  function cmCross(c, x, y) {
    ctx.save(); ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.moveTo(x - 5, y + 5); ctx.lineTo(x + 5, y - 5); ctx.stroke(); ctx.restore();
    label(c, 'CM', x + 7, y + 10, { color: c.ink2, size: 10.5, weight: 650 });
  }
  function label(c, s, x, y, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 500} ${o.size || 12}px Inter, system-ui, sans-serif`;
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = c.bg; ctx.globalAlpha = 0.85; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
    ctx.fillStyle = o.color || c.ink; ctx.fillText(s, x, y); ctx.restore();
  }

  F.draw(draw);
  const cap = [];
  cap.push('Seen along the axis (⊙, pointing out of the screen); anticlockwise counts as positive.');
  if (P.hang > 0 || sliders.some((s) => s.key === 'hang')) cap.push('The string is light and does not slip; the axle is frictionless.');
  else if (P.F > 0 || P.F2 > 0 || sliders.some((s) => s.key === 'F')) cap.push('The axle is frictionless and holds the axis still; each force stays fixed to the body as it turns.');
  if (P.point !== null) cap.push('Velocity and acceleration arrows use separate scales; the two acceleration arrows are redrawn at each instant so the larger keeps the same length.');
  F.caption(cap.join(' '));
  return { get: (k) => (F.params[k] !== undefined ? F.params[k] : P[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  if (!SHAPE_KEYS.includes(P.shape)) p.push(`unknown shape “${P.shape}”`);
  for (const s of P.shapes || []) if (!SHAPE_KEYS.includes(s)) p.push(`unknown shape “${s}” in shapes`);
  if (P.shapes && !P.shapes.includes(P.shape)) p.push('shapes must include the starting shape');
  for (const k of ['M', 'R', 'L', 'W', 'm', 's']) if (!(P[k] > 0)) p.push(`${k} must be positive`);
  if (P.d < 0) p.push('d is a distance: give it as zero or positive');
  if (P.hang > 0 && !ROUND.includes(P.shape)) p.push('a hanging block needs a round drum (disk, ring, sphere or shell)');
  if (P.hang > 0 && P.d !== 0) p.push('a hanging block needs the axis at the centre (d = 0)');
  if (![false, 'omega', 'axis'].includes(P.plot)) p.push(`plot must be false, 'omega' or 'axis'`);
  if (P.readouts && P.readouts !== false) for (const r of P.readouts) if (!READOUTS.includes(r)) p.push(`unknown readout “${r}”`);
  for (const k of P.sliders || []) {
    const key = typeof k === 'string' ? k : k.key;
    if (!KEYS.includes(key)) { p.push(`unknown slider “${key}”`); continue; }
    const d = { ...DEFS[key], ...(typeof k === 'object' ? k : {}) };
    const val = typeof k === 'object' && k.value !== undefined ? k.value : P[key];
    if (val === null || !(val >= d.min && val <= d.max)) p.push(`slider ${key}: value ${val} outside [${d.min}, ${d.max}]`);
  }
  if (!(P.T > 0)) p.push('T must be positive');
  return p;
}
