// The mass–spring–damper: a 3D spring and mass in an oil bath moving in step
// with the exact solution plotted beside it, a chart recorder drawing x(t)
// behind it, and a mass you can pull and release.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveLinear2, dampingKind, response } from '../../core/numeric/dynamics';
import { fmt, pal, csvOf, P, label, loopTime } from './common';

const CEIL = 3.0, MASS_H = 0.42, MASS_R = 0.5, COIL_R = 0.2, WIRE_R = 0.035, TURNS = 9;
const PAPER_X0 = -3.7, PAPER_X1 = -0.75, PAPER_Y = 0.95, PAPER_SPEED = 0.36, TRACE_N = 260;

export const spring: DemoDef = {
  id: 'ode.spring', module: 'ode', title: 'Mass–spring–damper',
  topic: 'Damped and undamped oscillations · second-order equations · the RLC analogy',
  summary: 'A mass on a spring in an oil bath obeys m x″ + c x′ + k x = F(t). The 3D mass moves with the exact solution on the left; a chart recorder behind it draws the same curve as it moves.',
  tex: "m\\,x'' + c\\,x' + k\\,x = F_0\\cos\\omega t",
  view: 'split3d', animated: true,
  params: [
    { key: 'm', label: 'mass m', value: 1, min: 0.2, max: 5, step: 0.01 },
    { key: 'c', label: 'damping c', value: 0.4, min: 0, max: 10, step: 0.01 },
    { key: 'k', label: 'spring constant k', value: 4, min: 0.2, max: 20, step: 0.01 },
    { key: 'x0', label: 'initial displacement x(0)', value: 1, min: -1.5, max: 1.5, step: 0.01 },
    { key: 'v0', label: 'initial velocity x′(0)', value: 0, min: -5, max: 5, step: 0.01 },
    { key: 'F0', label: 'driving force F₀', value: 0, min: 0, max: 5, step: 0.01 },
    { key: 'w', label: 'driving frequency ω', value: 2, min: 0.1, max: 6, step: 0.01 },
    { key: 'T', label: 'time window T', value: 20, min: 5, max: 60, step: 0.5 },
  ],
  toggles: [{ key: 'envelope', label: 'Decay envelope', value: true }, { key: 'velocity', label: 'Velocity x′(t)', value: false }, { key: 'energy', label: 'Energy E(t)', value: false }, { key: 'chart', label: 'Chart recorder (3D)', value: true }],
  experiments: [
    'Press play. Then double m: the period grows by √2, because ω₀ = √(k/m).',
    'Raise c until ζ = 1 (critical damping): the mass returns to rest fastest without overshooting. Beyond it, it creeps back more slowly.',
    'Grab the mass in the 3D view, pull it down and let go — the motion restarts from where you released it.',
    'Set c = 0: energy (toggle it) is exactly conserved; with c > 0 it falls in steps, fastest when the mass moves fastest.',
    'Add a driving force F₀ and tune ω near ω₀: the response builds up — see the resonance demo for the full curve.',
  ],
  connections: ['ode.charroots', 'ode.resonance', 'ode.pendulum', 'ode.nonhomog'],
  accuracy: 'Exact closed-form solution (characteristic roots plus undetermined coefficients for the forcing), evaluated at each frame. The spring is drawn as a helix stretched between ceiling and mass; the oil bath only symbolizes linear (viscous) damping, force −c x′.',
  tutorial: [
    { text: 'Hooke’s law says the spring pulls back with force $-kx$; Newton says $m x\'\' = -kx$. The solution $x = x_0\\cos\\omega_0 t$ with $\\omega_0 = \\sqrt{k/m}$ is **simple harmonic motion**: the period $2\\pi\\sqrt{m/k}$ does not depend on the amplitude.', task: 'Press play, then make the mass heavier (m ≥ 2): the oscillation slows.', set: { params: { m: 1, c: 0, k: 4, x0: 1, v0: 0, F0: 0 } }, done: (c) => c.params.m >= 2 },
    { text: 'Add a little damping $c\\,x\'$. The characteristic roots become $-\\zeta\\omega_0 \\pm i\\omega_0\\sqrt{1-\\zeta^2}$ with damping ratio $\\zeta = c / (2\\sqrt{mk})$: the mass still oscillates (slightly slower), inside an exponential envelope $e^{-ct/2m}$.', task: 'Turn on the decay envelope and watch the peaks touch it.', set: { params: { m: 1, c: 0.4, k: 4 }, toggles: { envelope: false } }, done: (c) => c.toggles.envelope },
    { text: '**Critical damping**, $\\zeta = 1$ ($c = 2\\sqrt{mk}$): the two roots collide on the real axis and the solution is $(C_1 + C_2t)e^{-\\omega_0 t}$. It is the fastest return to rest without overshoot — what a car’s shock absorbers and a door closer aim for.', task: 'Set c so that ζ = 1 (for m = 1, k = 4 that is c = 4).', set: { params: { m: 1, k: 4, c: 1.5 } }, done: (c) => Math.abs(c.params.c / (2 * Math.sqrt(c.params.m * c.params.k)) - 1) < 0.03 },
    { text: '**Overdamped**, $\\zeta > 1$: two negative real roots, two decaying exponentials and no oscillation. More damping is not faster: the slow root $r = -\\omega_0(\\zeta - \\sqrt{\\zeta^2-1}) \\to 0$ as $\\zeta$ grows, so the mass creeps back.', task: 'Push ζ above 2 and compare how long the return takes.', done: (c) => c.params.c / (2 * Math.sqrt(c.params.m * c.params.k)) > 2 },
    { text: 'Initial conditions select one solution from the two-parameter family. Grab the mass in the 3D view, pull it, and release it: the motion restarts with $x(0)$ where you let go and $x\'(0) = 0$.', task: 'Drag the mass in the 3D view to a new starting height.', set: { params: { c: 0.4, x0: 1 } }, done: (c) => Math.abs(c.params.x0 - 1) > 0.2 },
    { text: 'The same equation runs an **RLC circuit**: $L q\'\' + R q\' + q/C = V(t)$ with charge $q \\leftrightarrow x$, inductance $L \\leftrightarrow m$, resistance $R \\leftrightarrow c$, $1/C \\leftrightarrow k$. A radio tuner is a driven, lightly damped oscillator.', task: 'Add a driving force F₀ > 0 and look for the steady state.', set: { params: { F0: 0, w: 1.8 } }, done: (c) => c.params.F0 > 0.2 },
  ],
  create: (ctx) => springInst(ctx),
};

function springInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, v = ctx.view3d!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'x';
  v.setBounds({ x: [-3.8, 1.2], y: [-1.2, 1.2], z: [-2, 3.2] });
  const P0 = pal(ctx);

  // ── the 3D scene (math coordinates, z up) ──
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.14), new THREE.MeshStandardMaterial({ color: 0x8b93a7, roughness: 0.7 }));
  ceiling.position.set(0, 0, CEIL + 0.07);
  const hatch = new THREE.Group(); hatch.add(ceiling);
  v.addObject(hatch);

  const segs = TURNS * 26, rad = 10;
  const coilGeo = new THREE.BufferGeometry();
  const cpos = new Float32Array((segs + 1) * (rad + 1) * 3), cnor = new Float32Array((segs + 1) * (rad + 1) * 3);
  coilGeo.setAttribute('position', new THREE.BufferAttribute(cpos, 3));
  coilGeo.setAttribute('normal', new THREE.BufferAttribute(cnor, 3));
  const idx: number[] = [];
  for (let i = 0; i < segs; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  coilGeo.setIndex(idx);
  const coilMat = new THREE.MeshStandardMaterial({ color: 0xc9cfdb, roughness: 0.3, metalness: 0.6 });
  const coil = new THREE.Mesh(coilGeo, coilMat);
  coil.frustumCulled = false;
  v.addObject(coil);
  const writeCoil = (bottom: number) => {
    const L = CEIL - bottom, th1 = 2 * Math.PI * TURNS;
    let k = 0;
    for (let i = 0; i <= segs; i++) {
      const s = i / segs, th = th1 * s, ct = Math.cos(th), st = Math.sin(th);
      const cx = COIL_R * ct, cy = COIL_R * st, cz = CEIL - L * s;
      let tx = -COIL_R * st * th1, ty = COIL_R * ct * th1, tz = -L;
      const tn = Math.hypot(tx, ty, tz); tx /= tn; ty /= tn; tz /= tn;
      const nx = -ct, ny = -st, nz = 0;                       // radial, ⟂ tangent
      const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      for (let j = 0; j <= rad; j++) {
        const ph = (2 * Math.PI * j) / rad, cp = Math.cos(ph), sp = Math.sin(ph);
        const ox = cp * nx + sp * bx, oy = cp * ny + sp * by, oz = cp * nz + sp * bz;
        cpos[k] = cx + WIRE_R * ox; cpos[k + 1] = cy + WIRE_R * oy; cpos[k + 2] = cz + WIRE_R * oz;
        cnor[k] = ox; cnor[k + 1] = oy; cnor[k + 2] = oz;
        k += 3;
      }
    }
    coilGeo.attributes.position.needsUpdate = true; coilGeo.attributes.normal.needsUpdate = true;
  };

  const massGeo = new THREE.CylinderGeometry(MASS_R, MASS_R, MASS_H, 40); massGeo.rotateX(Math.PI / 2);
  const mass = new THREE.Mesh(massGeo, new THREE.MeshStandardMaterial({ color: P0.orange, roughness: 0.35, metalness: 0.2 }));
  v.addObject(mass);
  const bathGeo = new THREE.CylinderGeometry(0.72, 0.72, 3.7, 48, 1, true); bathGeo.rotateX(Math.PI / 2);
  const bathMat = new THREE.MeshStandardMaterial({ color: 0x4fd1d9, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const bath = new THREE.Mesh(bathGeo, bathMat); bath.position.set(0, 0, -0.1);
  v.addObject(bath);
  // equilibrium ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: 0x6fcf97 }));
  v.addObject(ring);
  const eqLabel = v.addLabel([0.95, 0, 0], 'x = 0');
  // the chart recorder
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PAPER_X1 - PAPER_X0, 3.4), new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
  paper.rotation.x = Math.PI / 2; paper.position.set((PAPER_X0 + PAPER_X1) / 2, PAPER_Y + 0.02, -0.1);
  const tracePos = new Float32Array(TRACE_N * 3);
  const traceGeo = new THREE.BufferGeometry(); traceGeo.setAttribute('position', new THREE.BufferAttribute(tracePos, 3));
  const trace = new THREE.Line(traceGeo, new THREE.LineBasicMaterial({ color: 0x1f4fb0 }));
  trace.frustumCulled = false;
  const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(PAPER_X0, PAPER_Y, 0), new THREE.Vector3(PAPER_X1, PAPER_Y, 0)]);
  const paperAxis = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x6fcf97 }));
  const penGeo = new THREE.BufferGeometry(); const penPos = new Float32Array(6); penGeo.setAttribute('position', new THREE.BufferAttribute(penPos, 3));
  const pen = new THREE.Line(penGeo, new THREE.LineBasicMaterial({ color: 0x8b93a7 }));
  pen.frustumCulled = false;
  const recorder = new THREE.Group(); recorder.add(paper, trace, paperAxis, pen);
  v.addObject(recorder);
  const recLabel = v.addLabel([(PAPER_X0 + PAPER_X1) / 2, PAPER_Y, 1.85], 'chart recorder: x(t), time runs left');
  const force = v.addArrow([0, 0, -MASS_H / 2], [0, 0, -0.5], { color: P0.red });
  // grab handle: an invisible-ish sphere inside the mass
  let dragging = false, tShift = 0;
  const grab = v.addPoint([0, 0, 1], {
    color: P0.orange, size: MASS_R * 0.95,
    drag: {
      constrain: ([, , z]) => [0, 0, Math.max(-1.5, Math.min(1.5, z))],
      onDrag: ([, , z]) => { dragging = true; ctx.setParam('x0', z); ctx.setParam('v0', 0); placeAt(z, 0, 0); },
      onEnd: () => { dragging = false; tShift = ctx.time.t; update(); },
    },
  });
  ((grab.object as THREE.Mesh).material as THREE.Material).visible = false;
  // a camera from the front, a little above and to the side
  const c0 = new THREE.Vector3(-1.3, 0.6, 0), dir = new THREE.Vector3(0.38, 0.32, 1).normalize();
  v.setCamera({ position: [c0.x + dir.x * 9.2, c0.y + dir.y * 9.2, c0.z + dir.z * 9.2], target: [c0.x, c0.y, c0.z], projection: 'perspective' });

  let X: (t: number) => number = () => 0, V: (t: number) => number = () => 0;
  let tl = 0, Fmax = 1;

  function placeAt(x: number, t: number, Fnow: number) {
    mass.position.set(0, 0, x);
    grab.set([0, 0, x]);
    writeCoil(x + MASS_H / 2);
    force.set([0, 0, x - MASS_H / 2 - (Fnow < 0 ? 0 : 0)], [0, 0, (0.9 * Fnow) / Fmax]);
    force.visible(ctx.params.F0 > 0 && Math.abs(Fnow) > 1e-3);
    // chart: x(s) for s in [t − window, t], drawn leftwards from the pen
    const win = (PAPER_X1 - PAPER_X0) / PAPER_SPEED;
    for (let i = 0; i < TRACE_N; i++) {
      const back = (win * i) / (TRACE_N - 1), s = t - back;
      const z = s >= 0 ? X(s) : NaN;
      tracePos[3 * i] = PAPER_X1 - back * PAPER_SPEED; tracePos[3 * i + 1] = PAPER_Y - 0.005; tracePos[3 * i + 2] = Number.isFinite(z) ? Math.max(-1.6, Math.min(1.6, z)) - 0 : x;
    }
    // before t = 0 the pen rested at x(0): draw that as a flat line
    for (let i = 0; i < TRACE_N; i++) if (!Number.isFinite(tracePos[3 * i + 2])) tracePos[3 * i + 2] = X(0);
    traceGeo.attributes.position.needsUpdate = true;
    penPos.set([-MASS_R, 0, x, PAPER_X1, PAPER_Y, x]);
    penGeo.attributes.position.needsUpdate = true;
    v.requestRender();
  }

  function update() {
    const { m, c, k, x0, v0, F0, w, T } = ctx.params;
    const b = c / m, cc = k / m;
    const sol = solveLinear2(b, cc, { kind: 'cos', A: F0 / m, w }, x0, v0);
    X = sol.y; V = sol.dy;
    Fmax = Math.max(F0, 1e-9);
    const P = pal(ctx);
    (mass.material as THREE.MeshStandardMaterial).color.set(P.orange);
    bathMat.opacity = 0.05 + 0.25 * Math.min(1, c / 6);
    recorder.visible = ctx.toggles.chart; recLabel.visible(ctx.toggles.chart);
    eqLabel.visible(true);
    const w0 = Math.sqrt(k / m), zeta = c / (2 * Math.sqrt(m * k)), kind = dampingKind(b, cc);
    const al = -b / 2, q = (b * b) / 4 - cc;
    const xs = Array.from({ length: 401 }, (_, i) => { const t = (T * i) / 400; return [t, X(t)] as P; });
    const vs = ctx.toggles.velocity ? xs.map(([t]) => [t, V(t)] as P) : [];
    const Es = ctx.toggles.energy ? xs.map(([t, x]) => [t, 0.5 * m * V(t) ** 2 + 0.5 * k * x * x] as P) : [];
    const ymax = Math.max(1.6, ...xs.map((p) => Math.abs(p[1])), ...vs.map((p) => Math.abs(p[1])), ...Es.map((p) => p[1]));
    plot.setView({ x0: -T * 0.03, x1: T * 1.02, y0: -ymax * 1.12, y1: ymax * 1.12 });
    const M = q < 0 ? Math.hypot(x0, (v0 - al * x0) / Math.sqrt(-q)) : 0;
    plot.setDraw((g) => {
      if (ctx.toggles.envelope && q < 0 && F0 === 0) { g.fn((t) => M * Math.exp(al * t), { color: P.muted, width: 1.3, dash: [3, 4] }, [0, T]); g.fn((t) => -M * Math.exp(al * t), { color: P.muted, width: 1.3, dash: [3, 4] }, [0, T]); }
      if (ctx.toggles.envelope && F0 > 0) { const a = response(w0, zeta, F0 / m, w).amp; g.line([0, a], [T, a], { color: P.muted, width: 1.2, dash: [3, 4] }); g.line([0, -a], [T, -a], { color: P.muted, width: 1.2, dash: [3, 4] }); }
      if (Es.length) { g.path(Es, { color: P.violet, width: 1.8 }); label(g, Es[Math.floor(Es.length * 0.04)], 'E(t)', P.violet, { dy: -10 }); }
      if (vs.length) g.path(vs, { color: P.green, width: 1.6, dash: [6, 4] });
      g.path(xs, { color: P.blue, width: 1.6, alpha: 0.45 });
      const n = Math.max(2, Math.floor((tl / T) * 400) + 1);
      g.path(xs.slice(0, n).concat([[tl, X(tl)]]), { color: P.blue, width: 3 });
      g.line([tl, g.view.y0], [tl, g.view.y1], { color: P.muted, width: 1, dash: [4, 4] });
      g.point([tl, X(tl)], 6, { fill: P.orange });
      g.handle({ id: 'x0', at: [0, x0], color: P.gold, label: 'x(0)', constrain: ([, y]) => [0, Math.max(-1.5, Math.min(1.5, y))], onDrag: ([, y]) => { ctx.setParam('x0', y); tShift = ctx.time.t; update(); } });
    });
    placeAt(X(tl), tl, F0 * Math.cos(w * tl));
    const E = 0.5 * m * V(tl) ** 2 + 0.5 * k * X(tl) ** 2;
    const rows: Readout[] = [
      { label: 'natural frequency ω₀ = √(k/m)', value: `${fmt(w0)} rad/s  (period ${fmt((2 * Math.PI) / w0)})` },
      { label: 'damping ratio ζ = c / 2√(mk)', value: fmt(zeta), tone: zeta < 1 ? 'good' : Math.abs(zeta - 1) < 1e-9 ? 'warn' : undefined },
      { label: 'regime', value: kind, tone: kind.startsWith('crit') ? 'warn' : undefined },
    ];
    if (q < 0) rows.push({ label: 'damped period 2π/ω_d', value: fmt((2 * Math.PI) / Math.sqrt(-q)) });
    if (c > 0) rows.push({ label: 'decay time 2m/c', value: fmt((2 * m) / c) }, { label: 'quality factor Q = 1/(2ζ)', value: fmt(1 / (2 * zeta)) });
    if (F0 > 0) rows.push({ label: 'steady-state amplitude', value: fmt(response(w0, zeta, F0 / m, w).amp) });
    rows.push({ label: 'x(t), x′(t) now', value: `${fmt(X(tl))},  ${fmt(V(tl))}` }, { label: 'energy ½mv² + ½kx²', value: fmt(E) });
    ctx.setReadouts(rows);
    ctx.setNote(`The mass is drawn at height $x(t)$ from the **exact** solution; the green ring is the equilibrium $x = 0$. ${c === 0 && F0 === 0 ? 'No damping: energy is conserved exactly.' : c > 0 ? `Damping removes energy at the rate $c\\,x'^2$.` : ''} **RLC analogy:** $L q'' + R q' + q/C = V(t)$ is the same equation with $m \\to L$, $c \\to R$, $k \\to 1/C$.`);
  }

  return {
    update,
    tick() {
      if (dragging) return;
      tl = loopTime(ctx.time.t - tShift, ctx.params.T);
      placeAt(X(tl), tl, ctx.params.F0 * Math.cos(ctx.params.w * tl));
      plot.render();
    },
    reset() { tShift = 0; tl = 0; },
    csv() {
      const { T, m, k } = ctx.params;
      return csvOf(['t', 'x', "x'", 'energy'], Array.from({ length: 1001 }, (_, i) => { const t = (T * i) / 1000; return [t, X(t), V(t), 0.5 * m * V(t) ** 2 + 0.5 * k * X(t) ** 2]; }));
    },
    dispose() { v.clear(); },
  };
}
