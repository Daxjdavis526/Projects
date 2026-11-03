// Linear algebra in mechanics: the principal axes of a rigid body are the
// eigenvectors of its inertia tensor, and the normal modes of coupled
// oscillators are the eigenvectors of M⁻¹K.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import type { V3 } from '../../engine/viewport3d';
import { Mat, eigSymmetric, matmul, transpose, det } from '../../core/numeric/linalg';
import { inertiaBox, inertiaPoints, rotateTensor, rotAxis, normalModes, modalCoefficients, matAdd } from '../../core/numeric/linmap';
import {
  fmt, tnum, pal, alpha, texMat, vecStr, C3, lineSet, dragArrow, add3, sub3, mul3, dot3, cross3, len3, mv3, P2,
  setCube,
} from './common';

// ── 1. inertia tensor and principal axes ───────────────────────────────────
const BODIES: Record<string, [number, number, number]> = { box: [2, 1.2, 0.6], rod: [2.6, 0.3, 0.3], plate: [2, 1.6, 0.12], cube: [1.2, 1.2, 1.2] };

function inertiaDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  setCube(view, 1.5);
  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#8f9bb3', transparent: true, opacity: 0.45, roughness: 0.6, depthWrite: false }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: '#c9cfdb' }));
  const body = new THREE.Group(); body.add(box, edges);
  view.addObject(body);
  let spin = 0;                                          // angle turned about ω so far
  const R0 = () => matmul(rotAxis([0, 0, 1], (ctx.params.yaw * Math.PI) / 180), rotAxis([1, 0, 0], (ctx.params.tilt * Math.PI) / 180));
  const mass = view.addPoint([1, 0.5, 0.5], { color: C3.v, size: 0.12, drag: { onDrag: (p) => { const Rs = rotAxis(omegaDir(), spin); const q = mv3(transpose(Rs), p); ctx.setParam('px', q[0]); ctx.setParam('py', q[1]); ctx.setParam('pz', q[2]); update(); } } });
  const com = view.addPoint([0, 0, 0], { color: '#ffffff', size: 0.06 });
  const omegaDir = (): V3 => { const th = (ctx.params.oth * Math.PI) / 180, ph = (ctx.params.oph * Math.PI) / 180; return [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]; };
  const wA = dragArrow(view, C3.u, 'ω', (p) => {
    const d = sub3(p, comPos); const l = len3(d); if (l < 1e-6) return;
    ctx.setParam('oth', Math.round((Math.acos(Math.max(-1, Math.min(1, d[2] / l))) * 180) / Math.PI));
    let ph = (Math.atan2(d[1], d[0]) * 180) / Math.PI; if (ph < 0) ph += 360; ctx.setParam('oph', Math.round(ph) % 360); update();
  });
  const LA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.err, label: 'L = Iω' });
  const axes = lineSet(view, 3, 1);
  const axLabels = [0, 1, 2].map(() => view.addLabel([0, 0, 0], ''));
  const trail = lineSet(view, 200, 0.7);
  let ell: ReturnType<typeof view.addSurface> | null = null;
  let comPos: V3 = [0, 0, 0];
  let lastBody = ctx.choices.body;
  const trailPts: V3[] = [];
  const update = () => {
    if (ctx.choices.body !== lastBody) { lastBody = ctx.choices.body; const d = BODIES[lastBody]; if (d) { ctx.setParam('a', d[0]); ctx.setParam('b', d[1]); ctx.setParam('c', d[2]); } }
    const { a, b, c, M, m } = ctx.params;
    const r: V3 = [ctx.params.px, ctx.params.py, ctx.params.pz];
    const Rb = R0(), w = omegaDir(), Rs = rotAxis(w, spin), R = matmul(Rs, Rb);
    const rNow = mv3(Rs, r);
    // tensor about the combined centre of mass, in the lab frame, at this instant
    const Mt = M + m, cm = mul3(rNow, m / Mt);
    const Iorigin = matAdd(rotateTensor(inertiaBox(M, a, b, c), R), inertiaPoints([{ m, r: rNow }]));
    const I = matAdd(Iorigin, inertiaPoints([{ m: -Mt, r: cm }]));          // parallel-axis shift to the centre of mass
    comPos = cm;
    // body pose
    const m4 = new THREE.Matrix4().set(R[0][0], R[0][1], R[0][2], 0, R[1][0], R[1][1], R[1][2], 0, R[2][0], R[2][1], R[2][2], 0, 0, 0, 0, 1);
    body.quaternion.setFromRotationMatrix(m4);
    body.scale.set(a, b, c);
    body.position.set(0, 0, 0);
    mass.set(rNow); mass.visible(m > 0);
    com.set(cm);
    const { values, vectors } = eigSymmetric(I);
    // principal axes through the centre of mass
    axes.begin();
    const cols = [C3.c1, C3.c2, C3.c3];
    vectors.forEach((v, i) => { const d = mul3(v as V3, 1.35); axes.seg(sub3(cm, d), add3(cm, d), cols[i]); });
    axes.end();
    axes.visible(!!ctx.toggles.axes);
    vectors.forEach((v, i) => { axLabels[i].set(add3(cm, mul3(v as V3, 1.5)), `<span style="color:${cols[i]}">I${'₁₂₃'[i]} = ${fmt(values[i], 3)}</span>`); axLabels[i].visible(!!ctx.toggles.axes); });
    // inertia ellipsoid xᵀIx = 1, scaled to fit
    if (ctx.toggles.ellipsoid) {
      const sc = Math.sqrt(Math.max(...values)) * 0.9;
      const F = (u: number, v: number): V3 => { const loc = [Math.sin(v) * Math.cos(u), Math.sin(v) * Math.sin(u), Math.cos(v)].map((x, i) => (x * sc) / Math.sqrt(Math.max(1e-9, values[i]))); return add3(cm, [0, 1, 2].map((k) => vectors.reduce((s2, vec, i) => s2 + vec[k] * loc[i], 0)) as V3); };
      const opts = { uRange: [0, 2 * Math.PI] as [number, number], vRange: [0, Math.PI] as [number, number], res: 32, colorBy: 'uniform' as const, color: '#b48cff', opacity: 0.22 };
      if (!ell) ell = view.addSurface(F, opts); else ell.update(F, opts);
      ell.visible(true);
    } else ell?.visible(false);
    // ω and L = Iω
    const wm = ctx.params.w;
    const omega = mul3(w, wm), L = mv3(I, omega);
    wA.set(cm, mul3(w, 1.2));
    const Ls = 1.2 / Math.max(1e-9, Math.max(...values) * wm);           // L drawn on the same scale for every ω direction
    LA.set(cm, mul3(L, Ls));
    const ang = (Math.acos(Math.max(-1, Math.min(1, dot3(L, omega) / (len3(L) * len3(omega) || 1)))) * 180) / Math.PI;
    const torque = cross3(omega, L);
    // trace of the tip of L while spinning
    trail.begin();
    for (let i = 1; i < trailPts.length; i++) trail.seg(trailPts[i - 1], trailPts[i], C3.err);
    trail.end();
    const principal = ang < 0.5;
    ctx.setReadouts([
      { label: 'inertia tensor I (lab frame, about the centre of mass)', value: texMat(I), tex: true },
      { label: 'principal moments I₁ ≥ I₂ ≥ I₃', value: values.map((x) => fmt(x)).join(',  ') },
      { label: 'principal axes', value: vectors.map((v) => vecStr(v, 2)).join('  ') },
      { label: 'angle between ω and L', value: `${fmt(ang, 3)}°`, tone: principal ? 'good' : 'warn' },
      { label: 'torque needed to keep ω fixed, |ω × L|', value: fmt(len3(torque)), tone: principal ? 'good' : 'warn' },
      { label: 'kinetic energy ½ ωᵀIω', value: fmt(0.5 * dot3(omega, L)) },
      { label: 'det I = I₁I₂I₃', value: fmt(det(I)) },
    ]);
    const steps: StepRow[] = [
      { title: 'Tensor of the box about its centre, in its own axes', tex: `I_{\\text{box}} = \\tfrac{M}{12}\\operatorname{diag}(b^2+c^2,\\ a^2+c^2,\\ a^2+b^2) = ${texMat(inertiaBox(M, a, b, c))}` },
      { title: 'Rotate into the lab frame', tex: 'I = R\\,I_{\\text{box}}R^{\\mathsf T}', detail: 'Off-diagonal products of inertia appear: the lab axes are not principal.' },
      { title: 'Add the point mass and shift to the centre of mass', tex: 'I \\mathrel{+}= m(|\\mathbf r|^2\\mathbb 1 - \\mathbf r\\mathbf r^{\\mathsf T}),\\qquad I_{\\text{cm}} = I_O - M_{\\text{tot}}(|\\mathbf c|^2\\mathbb 1 - \\mathbf c\\mathbf c^{\\mathsf T})' },
      { title: 'Principal axes: the eigenvectors of the symmetric I', tex: `\\lambda = ${values.map((x) => tnum(x)).join(',\\ ')}`, detail: 'Symmetric ⇒ real moments and perpendicular axes (spectral theorem).' },
    ];
    ctx.setSteps(steps);
    ctx.setNote(`Angular momentum is $\\mathbf L = I\\boldsymbol\\omega$ — a matrix times a vector, so in general **L is not parallel to ω**. It is parallel exactly when ω lies along an **eigenvector** of $I$: a principal axis, with the principal moment as eigenvalue. Drag ω (or use the sliders) onto a coloured axis and the angle drops to 0. ${principal ? 'Here ω is principal: the body can spin about it with no torque at all.' : 'Press play: the body is turned about the fixed ω, so L sweeps a cone (orange trace) — keeping the axis fixed requires the torque $\\boldsymbol\\tau = \\boldsymbol\\omega\\times\\mathbf L$ in the panel. That is the wobble of an unbalanced wheel; without the torque the motion would precess or tumble.'}`);
    ctx.warn(m > 0 && len3(r) > 2.5 ? 'The point mass is far outside the box.' : '');
  };
  return {
    update,
    tick(dt) {
      spin = (spin + dt * ctx.params.w) % (2 * Math.PI);
      update();
      // record the tip of L (math coordinates) for the cone
      const { a, b, c, M, m } = ctx.params;
      const w = omegaDir(), Rs = rotAxis(w, spin), R = matmul(Rs, R0()), rNow = mv3(Rs, [ctx.params.px, ctx.params.py, ctx.params.pz]);
      const Mt = M + m, cm = mul3(rNow, m / Mt);
      const I = matAdd(matAdd(rotateTensor(inertiaBox(M, a, b, c), R), inertiaPoints([{ m, r: rNow }])), inertiaPoints([{ m: -Mt, r: cm }]));
      const vals = eigSymmetric(I).values;
      const L = mv3(I, mul3(w, ctx.params.w)), Ls = 1.2 / Math.max(1e-9, Math.max(...vals) * ctx.params.w);
      trailPts.push(add3(cm, mul3(L, Ls)));
      if (trailPts.length > 200) trailPts.shift();
    },
    reset() { spin = 0; trailPts.length = 0; },
    dispose() { view.clear(); },
  };
}

// ── 2. normal modes of two coupled oscillators ─────────────────────────────
function normalModesDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.axes = false; plot.opts.grid = false; plot.opts.pan = false;
  plot.setView({ x0: -3.4, x1: 3.4, y0: -1.6, y1: 1.6 });
  plot2.opts.equal = true; plot2.opts.xLabel = 'x₁'; plot2.opts.yLabel = 'x₂';
  plot2.setView({ x0: -1.4, x1: 1.4, y0: -1.2, y1: 1.2 });
  let lastStart = ctx.choices.start;
  const spring = (a: number, b: number, y: number, coils = 9): P2[] => {
    const pts: P2[] = [[a, y]];
    const L = b - a, lead = Math.min(0.12, Math.abs(L) * 0.15);
    pts.push([a + Math.sign(L) * lead, y]);
    for (let i = 0; i < coils * 2; i++) pts.push([a + Math.sign(L) * lead + ((L - 2 * Math.sign(L) * lead) * (i + 0.5)) / (coils * 2), y + (i % 2 ? -0.14 : 0.14)]);
    pts.push([b - Math.sign(L) * lead, y], [b, y]);
    return pts;
  };
  const update = () => {
    if (ctx.choices.start !== lastStart) {
      lastStart = ctx.choices.start;
      const { modes } = solve();
      const set = (x1: number, x2: number) => { ctx.setParam('x10', +x1.toFixed(3)); ctx.setParam('x20', +x2.toFixed(3)); };
      if (lastStart === 'mode1') set(modes[0][0] * 0.8 / Math.max(...modes[0].map(Math.abs)), modes[0][1] * 0.8 / Math.max(...modes[0].map(Math.abs)));
      if (lastStart === 'mode2') set(modes[1][0] * 0.8 / Math.max(...modes[1].map(Math.abs)), modes[1][1] * 0.8 / Math.max(...modes[1].map(Math.abs)));
      if (lastStart === 'one') set(0.8, 0);
    }
    const P = pal(ctx.dark);
    const { m1, m2, k1, k2, k3 } = ctx.params;
    const { omega, modes, K } = solve();
    const x0 = [ctx.params.x10, ctx.params.x20];
    const c = modalCoefficients(modes, [m1, m2], x0);
    const t = ctx.time.t;
    const at = (tt: number): P2 => [0, 1].map((k) => c[0] * Math.cos(omega[0] * tt) * modes[0][k] + c[1] * Math.cos(omega[1] * tt) * modes[1][k]) as P2;
    const x = at(t);
    const E = omega.map((w, i) => 0.5 * c[i] * c[i] * w * w * (m1 * modes[i][0] ** 2 + m2 * modes[i][1] ** 2));
    // the physical picture
    const eq = [-1.1, 1.1], wall = 3.1;
    const s1 = 0.22 + 0.12 * Math.cbrt(m1), s2 = 0.22 + 0.12 * Math.cbrt(m2);
    plot.setDraw((g) => {
      const ink = P.muted;
      for (const wx of [-wall, wall]) { g.line([wx, -0.6], [wx, 0.6], { color: ink, width: 3 }); for (let i = -3; i <= 3; i++) g.line([wx, i * 0.18], [wx + Math.sign(wx) * 0.14, i * 0.18 - 0.1], { color: ink, width: 1 }); }
      const p1 = eq[0] + x[0], p2 = eq[1] + x[1];
      g.path(spring(-wall, p1 - s1, 0), { color: alpha(P.ink, 0.7), width: 1.6 });
      g.path(spring(p1 + s1, p2 - s2, 0, 7), { color: alpha(P.v, 0.95), width: 1.6 });
      g.path(spring(p2 + s2, wall, 0), { color: alpha(P.ink, 0.7), width: 1.6 });
      g.polygon([[p1 - s1, -s1], [p1 + s1, -s1], [p1 + s1, s1], [p1 - s1, s1]], { fill: alpha(P.c1, 0.8), color: P.c1 });
      g.polygon([[p2 - s2, -s2], [p2 + s2, -s2], [p2 + s2, s2], [p2 - s2, s2]], { fill: alpha(P.c3, 0.8), color: P.c3 });
      g.text([p1, -s1 - 0.12], 'm₁', { color: P.ink, align: 'center', baseline: 'top' });
      g.text([p2, -s2 - 0.12], 'm₂', { color: P.ink, align: 'center', baseline: 'top' });
      for (const [e, col] of [[eq[0], P.c1], [eq[1], P.c3]] as [number, string][]) g.line([e, -0.75], [e, 0.75], { color: alpha(col, 0.5), width: 1, dash: [3, 4] });
      g.text([-wall + 0.3, 1.25], `k₁ = ${fmt(k1, 3)}`, { color: P.muted, font: '12px Inter, sans-serif' });
      g.text([0, 1.25], `coupling k₂ = ${fmt(k2, 3)}`, { color: P.v, font: '12px Inter, sans-serif', align: 'center' });
      g.text([wall - 0.3, 1.25], `k₃ = ${fmt(k3, 3)}`, { color: P.muted, font: '12px Inter, sans-serif', align: 'right' });
      g.handle({ id: 'm1', at: [p1, 0], color: P.c1, onDrag: ([px]) => { ctx.setParam('x10', Math.max(-1, Math.min(1, +(px - eq[0]).toFixed(2)))); ctx.setParam('x20', +x[1].toFixed(2)); resetTime(); }, constrain: ([px]) => [px, 0] });
      g.handle({ id: 'm2', at: [p2, 0], color: P.c3, onDrag: ([px]) => { ctx.setParam('x20', Math.max(-1, Math.min(1, +(px - eq[1]).toFixed(2)))); ctx.setParam('x10', +x[0].toFixed(2)); resetTime(); }, constrain: ([px]) => [px, 0] });
    });
    // configuration space
    plot2.setDraw((g) => {
      modes.forEach((v, i) => { const l = Math.hypot(v[0], v[1]); g.line([(-v[0] / l) * 5, (-v[1] / l) * 5], [(v[0] / l) * 5, (v[1] / l) * 5], { color: alpha(P.eig, 0.75), width: 1.5, dash: [7, 5] }); g.text([(v[0] / l) * 1.05, (v[1] / l) * 1.05], `mode ${i + 1}: ω = ${fmt(omega[i], 3)}`, { color: P.eig, font: '600 12px Inter, sans-serif', align: 'center' }); });
      const pts: P2[] = [];
      const t0 = Math.max(0, t - 40);
      for (let i = 0; i <= 600; i++) pts.push(at(t0 + ((t - t0) * i) / 600));
      g.path(pts, { color: alpha(P.res, 0.6), width: 1.3 });
      g.point(x, 5.5, { color: P.res });
      g.handle({ id: 'x0', at: [x0[0], x0[1]], color: P.u, label: 'start', onDrag: ([a, b]) => { ctx.setParam('x10', Math.max(-1, Math.min(1, +a.toFixed(2)))); ctx.setParam('x20', Math.max(-1, Math.min(1, +b.toFixed(2)))); resetTime(); } });
    });
    ctx.setReadouts([
      { label: 'M⁻¹K', value: texMat([[K[0][0] / m1, K[0][1] / m1], [K[1][0] / m2, K[1][1] / m2]]), tex: true },
      { label: 'mode frequencies ω₁, ω₂', value: `${fmt(omega[0])}, ${fmt(omega[1])}` },
      { label: 'mode shapes φ₁, φ₂', value: `${vecStr(modes[0])}, ${vecStr(modes[1])}` },
      { label: 'start = c₁φ₁ + c₂φ₂', value: `c = ${vecStr(c)}` },
      { label: 'energy in each mode (constant)', value: `${fmt(E[0])}, ${fmt(E[1])}` },
      { label: 'beat period 2π/|ω₂ − ω₁|', value: fmt((2 * Math.PI) / Math.abs(omega[1] - omega[0])) },
      { label: 'x(t)', value: `(${fmt(x[0], 3)}, ${fmt(x[1], 3)})` },
    ]);
    ctx.setSteps([
      { title: 'Newton’s law for both masses', tex: `M\\ddot{\\mathbf x} = -K\\mathbf x,\\quad M = ${texMat([[m1, 0], [0, m2]])},\\ K = ${texMat(K)}` },
      { title: 'Look for motions with one frequency: x = φ cos ωt', tex: 'K\\boldsymbol\\varphi = \\omega^2 M\\boldsymbol\\varphi \\iff \\det(K - \\omega^2 M) = 0', rule: 'generalized eigenproblem' },
      { title: 'Eigenvalues ω² and eigenvectors (mode shapes)', tex: `\\omega_1^2 = ${tnum(omega[0] ** 2)},\\ \\boldsymbol\\varphi_1 = ${'\\begin{bmatrix}' + modes[0].map((v) => tnum(v)).join('\\\\') + '\\end{bmatrix}'};\\quad \\omega_2^2 = ${tnum(omega[1] ** 2)},\\ \\boldsymbol\\varphi_2 = ${'\\begin{bmatrix}' + modes[1].map((v) => tnum(v)).join('\\\\') + '\\end{bmatrix}'}` },
      { title: 'Any motion from rest is a superposition', tex: `\\mathbf x(t) = ${tnum(c[0])}\\cos(${tnum(omega[0])}t)\\,\\boldsymbol\\varphi_1 + ${tnum(c[1])}\\cos(${tnum(omega[1])}t)\\,\\boldsymbol\\varphi_2` },
    ]);
    ctx.setNote(`Two coupled masses move in a tangle — but in the **eigenvector basis** of $M^{-1}K$ the system splits into two independent oscillators. Start exactly along a dashed mode line and the point in configuration space (right) moves back and forth **on that line** forever: both masses share one frequency (mode 1 in phase, mode 2 out of phase). Any other start is a superposition; with weak coupling the energy sloshes between the masses (**beats**). The same idea gives the vibration modes of molecules, bridges and crystal lattices.`);
    ctx.warn('');
  };
  const solve = () => {
    const { m1, m2, k1, k2, k3 } = ctx.params;
    const K: Mat = [[k1 + k2, -k2], [-k2, k2 + k3]];
    return { ...normalModes(K, [m1, m2]), K };
  };
  const resetTime = () => { ctx.time.t = 0; update(); };
  return { update, tick() { update(); }, reset() { update(); }, dispose() {} };
}

export const physicsDemos: DemoDef[] = [
  {
    id: 'linalg.inertia', module: 'linalg', title: 'Principal axes: eigenvectors of the inertia tensor', topic: 'Symmetric matrices; spectral theorem; physics: the inertia tensor',
    summary: 'A tilted box with an extra mass. Its inertia tensor is a symmetric 3×3 matrix; its eigenvectors are the principal axes — the only directions of spin for which angular momentum L = Iω is parallel to ω.',
    tex: '\\mathbf L = I\\boldsymbol\\omega,\\quad I_{ij} = \\sum m\\,(|\\mathbf r|^2\\delta_{ij} - r_i r_j),\\quad I\\mathbf e_k = I_k\\mathbf e_k',
    view: '3d', animated: true,
    params: [
      { key: 'a', label: 'box length a', value: 2, min: 0.1, max: 3, step: 0.01 }, { key: 'b', label: 'box width b', value: 1.2, min: 0.1, max: 3, step: 0.01 }, { key: 'c', label: 'box height c', value: 0.6, min: 0.1, max: 3, step: 0.01 },
      { key: 'M', label: 'box mass M', value: 3, min: 0.1, max: 10, step: 0.1 }, { key: 'yaw', label: 'box yaw (°)', value: 30, min: -180, max: 180, step: 1 }, { key: 'tilt', label: 'box tilt (°)', value: 25, min: -90, max: 90, step: 1 },
      { key: 'm', label: 'extra mass m', value: 0.5, min: 0, max: 3, step: 0.05 }, { key: 'px', label: 'mass at $x$', value: 0.9, min: -2, max: 2, step: 0.01 }, { key: 'py', label: 'mass at $y$', value: 0.3, min: -2, max: 2, step: 0.01 }, { key: 'pz', label: 'mass at $z$', value: 0.4, min: -2, max: 2, step: 0.01 },
      { key: 'oth', label: 'ω polar angle (°)', value: 30, min: 0, max: 180, step: 1 }, { key: 'oph', label: 'ω azimuth (°)', value: 60, min: 0, max: 359, step: 1 }, { key: 'w', label: '|ω| (rad/s)', value: 1.5, min: 0.1, max: 4, step: 0.05 },
    ],
    choices: [{ key: 'body', label: 'Body', value: 'box', options: [['box', 'box 2 × 1.2 × 0.6'], ['rod', 'thin rod'], ['plate', 'flat plate'], ['cube', 'cube (isotropic)']] }],
    toggles: [{ key: 'axes', label: 'Principal axes', value: true }, { key: 'ellipsoid', label: 'Inertia ellipsoid', value: false }],
    experiments: [
      'Drag ω onto each coloured axis: the angle between ω and L drops to 0 and no torque is needed.',
      'Set the extra mass to 0 and choose the cube: every axis is principal (I = I₀𝟙, a triple eigenvalue).',
      'Thin rod: one moment is almost 0 — spinning about the rod\'s own axis costs almost no energy.',
      'Move the extra mass: the principal axes swing round. This is how wheels are balanced.',
      'Press play with ω off-axis and watch L sweep its cone.',
    ],
    connections: ['linalg.eigen', 'linalg.transform3d', 'linalg.svd', 'linalg.normalmodes'],
    accuracy: 'Exact tensor for a uniform box plus a point mass, shifted to the combined centre of mass; eigenvalues by the Jacobi method (~1e−12). The animation turns the body about a fixed ω (the motion a torque would enforce), not torque-free motion.',
    create: inertiaDemo,
  },
  {
    id: 'linalg.normalmodes', module: 'linalg', title: 'Normal modes: eigenvectors that oscillate', topic: 'Eigenvectors in physics; generalized eigenproblem; coupled oscillators',
    summary: 'Two masses between three springs. The eigenvectors of M⁻¹K are the normal modes — motions in which both masses swing at one frequency. Every other motion is a superposition of the two.',
    tex: 'M\\ddot{\\mathbf x} = -K\\mathbf x,\\qquad K\\boldsymbol\\varphi = \\omega^2 M\\boldsymbol\\varphi,\\qquad \\mathbf x(t) = \\sum_i c_i\\cos(\\omega_i t)\\,\\boldsymbol\\varphi_i',
    view: 'split2d', animated: true,
    params: [
      { key: 'm1', label: '$m_1$', value: 1, min: 0.2, max: 4, step: 0.05 }, { key: 'm2', label: '$m_2$', value: 1, min: 0.2, max: 4, step: 0.05 },
      { key: 'k1', label: '$k_1$ (left wall)', value: 4, min: 0.1, max: 10, step: 0.05 }, { key: 'k2', label: '$k_2$ (coupling)', value: 0.8, min: 0, max: 10, step: 0.05 }, { key: 'k3', label: '$k_3$ (right wall)', value: 4, min: 0.1, max: 10, step: 0.05 },
      { key: 'x10', label: 'start $x_1(0)$', value: 0.8, min: -1, max: 1, step: 0.01 }, { key: 'x20', label: 'start $x_2(0)$', value: 0, min: -1, max: 1, step: 0.01 },
    ],
    choices: [{ key: 'start', label: 'Start from', value: 'one', options: [['one', 'only mass 1 displaced (beats)'], ['mode1', 'mode 1 (in phase)'], ['mode2', 'mode 2 (out of phase)'], ['custom', 'custom']] }],
    experiments: [
      'Play from “only mass 1 displaced”: the motion passes back and forth between the masses (beats).',
      'Start in mode 1, then mode 2: a single frequency each, and the point in configuration space stays on its line.',
      'Make the coupling k₂ tiny: the two frequencies approach each other and the beats slow down.',
      'Make m₂ much heavier: the mode shapes tilt. Are they still perpendicular? (They are M-orthogonal instead.)',
    ],
    connections: ['linalg.eigen', 'linalg.diagonalize', 'linalg.inertia'],
    accuracy: 'Exact solution x(t) = Σ cᵢ cos(ωᵢt) φᵢ from the eigenvectors of M^{-1/2}KM^{-1/2} (Jacobi, ~1e−12) — no numerical time-stepping, so energy is conserved exactly. Masses start from rest.',
    create: normalModesDemo,
  },
];
