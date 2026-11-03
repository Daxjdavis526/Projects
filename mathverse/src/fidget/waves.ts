// Wave Laboratory: a vibrating membrane you can poke. Click it for a splash,
// drag across it to leave a wake; waves spread, reflect from the rim (or are
// soaked up by it), interfere and slowly die away.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance } from '../modules/types';
import { colormap } from '../engine/colors';
import { Membrane, Boundary } from '../core/numeric/fidget';
import { addSegments, fmt, ping } from './common';

const N = 101;            // nodes per side
const L = 4;              // side length: the membrane is [−2, 2]²

function create(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  v.setBounds({ x: [-L / 2, L / 2], y: [-L / 2, L / 2], z: [-1, 1] });
  const m = new Membrane(N, L);
  // frame the membrane a little closer than the default view
  v.camera.position.lerp(v.controls.target, 0.3); v.controls.update();

  // the membrane mesh, in math coordinates (PlaneGeometry lies in the xy-plane)
  const geo = new THREE.PlaneGeometry(L, L, N - 1, N - 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(N * N * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  v.addObject(mesh);
  const rim = addSegments(v, 4, { color: '#8b93a7' });
  const h = L / 2;
  rim.set([[-h, -h, 0], [h, -h, 0], [h, -h, 0], [h, h, 0], [h, h, 0], [-h, h, 0], [-h, h, 0], [-h, -h, 0]]);

  const scaleRef = { s: 0.12 };          // colour scale: small ripples get the full palette
  const paint = () => {
    const u = m.u, zs = ctx.params.zx, sc = scaleRef.s;
    for (let iy = 0; iy < N; iy++) {
      const j = N - 1 - iy;                  // PlaneGeometry rows run from +y down
      for (let i = 0; i < N; i++) {
        const k = iy * N + i, z = u[j * N + i];
        pos.setZ(k, z * zs);
        const c = colormap('ice', 0.52 + 0.45 * Math.max(-1, Math.min(1, z / sc)));
        col[3 * k] = c.r; col[3 * k + 1] = c.g; col[3 * k + 2] = c.b;
      }
    }
    pos.needsUpdate = true;
    (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    v.requestRender();
  };

  // ── poking: our own pointer handling on the membrane (the camera still orbits off it) ──
  const canvas = v.renderer.domElement, host = canvas.parentElement!;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hitAt = (e: PointerEvent): [number, number] | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, v.camera);
    const hit = ray.intersectObject(mesh, false)[0];
    if (!hit) return null;
    const p = mesh.worldToLocal(hit.point.clone());
    return [p.x, p.y];
  };
  let poking = false, last: [number, number] | null = null, pokes = 0;
  const amp = () => -ctx.params.amp;
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || e.shiftKey) return;
    const p = hitAt(e);
    if (!p) return;
    e.stopPropagation(); e.preventDefault();
    poking = true; last = p; pokes++;
    m.poke(p[0], p[1], amp(), ctx.params.width);
    ping(0.55 + 0.3 * Math.random(), 0.03);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };
  const onMove = (e: PointerEvent) => {
    if (!poking) return;
    const p = hitAt(e);
    if (!p || !last) { last = p; return; }
    // a wake: small plucks along the path, in proportion to the distance moved
    const d = Math.hypot(p[0] - last[0], p[1] - last[1]), w = ctx.params.width;
    if (d < w * 0.35) return;
    const steps = Math.min(8, Math.ceil(d / (w * 0.5)));
    for (let s = 1; s <= steps; s++) m.poke(last[0] + ((p[0] - last[0]) * s) / steps, last[1] + ((p[1] - last[1]) * s) / steps, amp() * 0.22, w);
    last = p;
  };
  const onUp = () => { poking = false; last = null; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  host.addEventListener('pointerdown', onDown, { capture: true });

  let lastStart = '';
  const start = (which: string) => {
    m.clear();
    if (which === 'drop') m.poke(0.5, 0.3, -ctx.params.amp, ctx.params.width);
    else if (which === 'two') { m.poke(-0.8, 0, -ctx.params.amp, ctx.params.width); m.poke(0.8, 0, -ctx.params.amp, ctx.params.width); }
    else if (which.startsWith('mode')) {
      const [a, b] = [Number(which[4]), Number(which[5])];
      m.setMode(a, b, 0.3);
    }
    paint();
  };

  const report = () => {
    const dt = m.dt(), C = (m.c * dt) / m.h;
    const rows = [
      { label: 'time t', value: fmt(m.t, 4) },
      { label: 'energy (discrete)', value: fmt(m.energy(), 5) },
      { label: 'max |u|', value: fmt(m.maxAbs(), 4) },
      { label: 'Courant number cΔt/h', value: `${fmt(C, 3)} ≤ 1/√2 ≈ 0.707`, tone: 'good' as const },
      { label: 'time step Δt', value: fmt(dt, 4) },
      { label: 'grid', value: `${N} × ${N},  h = ${fmt(m.h, 4)}` },
    ];
    const st = ctx.choices.start;
    if (st.startsWith('mode') && ctx.choices.boundary === 'fixed') {
      const a = Number(st[4]), b = Number(st[5]);
      rows.push({ label: `ω of mode (${a},${b}), exact`, value: fmt(m.exactOmega(a, b), 6) }, { label: 'ω on this grid (what you see)', value: fmt(m.discreteOmega(a, b), 6), tone: 'good' as const });
    }
    ctx.setReadouts(rows);
  };

  const update = () => {
    m.c = ctx.params.c; m.gamma = ctx.params.gamma;
    const b = ctx.choices.boundary as Boundary;
    if (b !== m.boundary) m.setBoundary(b);
    if (ctx.choices.start !== lastStart) { lastStart = ctx.choices.start; start(lastStart); }
    report();
    const st = ctx.choices.start;
    ctx.setNote(`**Click** the membrane to drop a pebble; **drag** across it to leave a wake (Shift-drag or drag off the membrane to turn the view). ` +
      ({ fixed: 'The rim is clamped (u = 0): waves reflect upside-down.', free: 'The rim is free (∂u/∂n = 0): waves reflect right way up.', absorbing: 'The rim is a sponge layer: most of each wave is soaked up instead of reflected.' } as Record<string, string>)[b] +
      (st.startsWith('mode') ? ` A normal mode is a standing wave $\\sin\\frac{m\\pi x}{L}\\sin\\frac{n\\pi y}{L}\\cos\\omega t$ with $\\omega = c\\pi(m^2+n^2)^{1/2}/L$ — poke it and it stops being pure.` : ''));
    ctx.warn(st.startsWith('mode') && b !== 'fixed' ? 'Normal modes listed here belong to the clamped (fixed) rim; with other edges they are not standing waves.' : '');
  };

  let acc = 0, sinceReport = 0, rainClock = 0;
  const stop = v.onFrame((dtFrame) => {
    if (ctx.toggles.pause) return;
    if (ctx.toggles.rain) {
      rainClock -= dtFrame;
      if (rainClock <= 0) {
        rainClock = 0.25 + Math.random() * 0.5;
        m.poke((Math.random() - 0.5) * L * 0.8, (Math.random() - 0.5) * L * 0.8, -ctx.params.amp * (0.3 + 0.5 * Math.random()), ctx.params.width * (0.6 + 0.6 * Math.random()));
        ping(0.5 + 0.45 * Math.random(), 0.015);
      }
    }
    acc += dtFrame * ctx.params.timescale;
    const dt = m.dt();
    let steps = 0;
    while (acc >= dt && steps < 16) { m.step(); acc -= dt; steps++; }
    if (steps === 16) acc = 0;         // too far behind: drop the backlog rather than spiral
    paint();
    sinceReport += dtFrame;
    if (sinceReport > 0.2) { sinceReport = 0; report(); }
  });

  paint();
  return {
    update,
    reset() { start(ctx.choices.start); },
    csv() {
      const rows = ['x,y,u'];
      for (let j = 0; j < N; j += 2) for (let i = 0; i < N; i += 2) rows.push(`${m.coord(i).toFixed(4)},${m.coord(j).toFixed(4)},${m.u[j * N + i].toExponential(6)}`);
      return rows.join('\n');
    },
    dispose() { stop(); onUp(); host.removeEventListener('pointerdown', onDown, { capture: true }); v.clear(); },
  };
}

export const waveLab: DemoDef = {
  id: 'fidget.waves', module: 'fidget', title: 'Wave Laboratory', topic: 'The 2D wave equation, reflection, interference, normal modes, damping',
  summary: 'A drum skin you can poke. Click for a splash, drag for a wake, and watch the rings spread, bounce off the rim, interfere and fade.',
  tex: 'u_{tt} + \\gamma\\,u_t = c^2\\,(u_{xx} + u_{yy})',
  view: '3d',
  params: [
    { key: 'c', label: 'wave speed c', value: 1, min: 0.2, max: 2.5, step: 0.01 },
    { key: 'gamma', label: 'damping γ', value: 0.15, min: 0, max: 2, step: 0.01 },
    { key: 'amp', label: 'poke strength', value: 0.5, min: 0.05, max: 1, step: 0.01 },
    { key: 'width', label: 'pebble size', value: 0.16, min: 0.08, max: 0.5, step: 0.01 },
    { key: 'timescale', label: 'slow motion ↔ fast', value: 1, min: 0.1, max: 2, step: 0.01 },
    { key: 'zx', label: 'height exaggeration (drawing only)', value: 2.5, min: 1, max: 6, step: 0.1 },
  ],
  choices: [
    { key: 'boundary', label: 'Rim', value: 'fixed', options: [['fixed', 'Clamped (fixed, u = 0)'], ['free', 'Free (∂u/∂n = 0)'], ['absorbing', 'Absorbing (sponge layer)']] },
    { key: 'start', label: 'Start from', value: 'drop', options: [['calm', 'Calm water'], ['drop', 'One drop'], ['two', 'Two drops (interference)'], ['mode21', 'Normal mode (2, 1)'], ['mode33', 'Normal mode (3, 3)'], ['mode12', 'Normal mode (1, 2)']] },
  ],
  toggles: [{ key: 'rain', label: 'Rain', value: false }, { key: 'pause', label: 'Freeze', value: false }],
  experiments: [
    'Drop one pebble with the rim **clamped**, then with it **free**: does the reflected ring come back as a crest or a trough?',
    'Choose **Two drops** and look for the lines where the ripples cancel — interference.',
    'Pick **Normal mode (2, 1)**: a pure standing wave. Then poke it once and watch it stop being pure.',
    'Set damping to 0 and watch the discrete energy readout: it stays constant to many digits. Then raise γ.',
    'Switch the rim to **absorbing** and turn on rain: an open pond instead of a drum.',
  ],
  connections: ['fidget.sculptor', 'fidget.flow'],
  accuracy: 'Numerical: second-order leapfrog in time and the five-point Laplacian in space on a 101 × 101 grid, with the time step chosen automatically at Courant number cΔt/h = 0.5 (stable up to 1/√2). With no damping and a clamped rim the discrete energy shown is conserved exactly up to rounding. Damping is centred (second order). The absorbing rim is a sponge layer of graded damping — it absorbs most of a wave, not all. Heights are drawn multiplied by the exaggeration slider (1 = to scale); the colours exaggerate small waves further.',
  create,
};
