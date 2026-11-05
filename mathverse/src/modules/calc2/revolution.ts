// Solids of revolution by disks, washers and cylindrical shells. A region in
// the plane (left) is revolved about a horizontal or vertical line; the 3D
// view shows the solid, its slices, a highlighted slice, and — when the
// revolution is less than a full turn — the cut faces, i.e. the cross-section.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import { Region, Axis, washerSlices, shellSlices, volume, centroid, straddles, yRange, intervalsAt } from '../../core/numeric/revolution';
import { fmt, rgba, clamp, BLUE, GOLD, RED, VIOLET, CYAN, FONT, safeTutorial } from './util';
import { Frame, frameMatrix, framePoint, latheCurve, cutFace, ringBox, mergeColored, SwapMesh, lineObject } from './solids';

interface Preset {
  label: string; R: Region; fTeX: string; gTeX: string; aTeX: string; bTeX: string;
  /** washers about the y-axis (x = 0) and shells about the x-axis (y = 0) need x in terms of y */
  yWasher?: { R: string; r: string; c: string; d: string }; xShell?: { len: string; c: string; d: string };
  axis: 'x' | 'y';
  exact?: { x?: string; y?: string };
}

const PRESETS: Record<string, Preset> = {
  between: { label: 'between y = x and y = x²', R: { f: (x) => x, g: (x) => x * x, a: 0, b: 1 }, fTeX: 'x', gTeX: 'x^2', aTeX: '0', bTeX: '1', yWasher: { R: '\\sqrt{y}', r: 'y', c: '0', d: '1' }, xShell: { len: '\\sqrt{y} - y', c: '0', d: '1' }, axis: 'x', exact: { x: '\\frac{2\\pi}{15}', y: '\\frac{\\pi}{6}' } },
  sqrt: { label: 'under y = √x, 0 ≤ x ≤ 4', R: { f: Math.sqrt, g: () => 0, a: 0, b: 4 }, fTeX: '\\sqrt{x}', gTeX: '0', aTeX: '0', bTeX: '4', yWasher: { R: '4', r: 'y^2', c: '0', d: '2' }, xShell: { len: '4 - y^2', c: '0', d: '2' }, axis: 'x', exact: { x: '8\\pi', y: '\\frac{128\\pi}{5}' } },
  sine: { label: 'under y = sin x, 0 ≤ x ≤ π', R: { f: Math.sin, g: () => 0, a: 0, b: Math.PI }, fTeX: '\\sin x', gTeX: '0', aTeX: '0', bTeX: '\\pi', yWasher: { R: '\\pi - \\arcsin y', r: '\\arcsin y', c: '0', d: '1' }, xShell: { len: '\\pi - 2\\arcsin y', c: '0', d: '1' }, axis: 'y', exact: { x: '\\frac{\\pi^2}{2}', y: '2\\pi^2' } },
  sphere: { label: 'half-disc → sphere (radius 2)', R: { f: (x) => Math.sqrt(Math.max(0, 4 - x * x)), g: () => 0, a: -2, b: 2 }, fTeX: '\\sqrt{4 - x^2}', gTeX: '0', aTeX: '-2', bTeX: '2', xShell: { len: '2\\sqrt{4 - y^2}', c: '0', d: '2' }, axis: 'x', exact: { x: '\\frac{32\\pi}{3}' } },
  cone: { label: 'triangle → cone', R: { f: (x) => 2 - x / 2, g: () => 0, a: 0, b: 4 }, fTeX: '2 - \\tfrac{x}{2}', gTeX: '0', aTeX: '0', bTeX: '4', yWasher: { R: '4 - 2y', r: '0', c: '0', d: '2' }, xShell: { len: '4 - 2y', c: '0', d: '2' }, axis: 'x', exact: { x: '\\frac{16\\pi}{3}', y: '\\frac{32\\pi}{3}' } },
  bowl: { label: 'between y = x² and y = 4 (a bowl)', R: { f: () => 4, g: (x) => x * x, a: 0, b: 2 }, fTeX: '4', gTeX: 'x^2', aTeX: '0', bTeX: '2', yWasher: { R: '\\sqrt{y}', r: '0', c: '0', d: '4' }, xShell: { len: '\\sqrt{y}', c: '0', d: '4' }, axis: 'y', exact: { x: '\\frac{256\\pi}{5}', y: '8\\pi' } },
  torus: { label: 'disc centred at (3, 0) → torus', R: { f: (x) => Math.sqrt(Math.max(0, 1 - (x - 3) ** 2)), g: (x) => -Math.sqrt(Math.max(0, 1 - (x - 3) ** 2)), a: 2, b: 4 }, fTeX: '\\sqrt{1-(x-3)^2}', gTeX: '-\\sqrt{1-(x-3)^2}', aTeX: '2', bTeX: '4', yWasher: { R: '3 + \\sqrt{1 - y^2}', r: '3 - \\sqrt{1 - y^2}', c: '-1', d: '1' }, axis: 'y', exact: { y: '6\\pi^2' } },
};

const opts = (pairs: Record<string, string>) => Object.entries(pairs) as [string, string][];

const params = [
  { key: 'n', label: 'number of slices n', value: 10, min: 1, max: 60, step: 1 },
  { key: 'off', label: 'axis offset: y = k or x = h', value: 0, min: -3, max: 6, step: 0.05 },
  { key: 'sweep', label: 'revolve through (degrees) — less than 360 shows the cross-section', value: 270, min: 5, max: 360, step: 1 },
  { key: 'build', label: 'build progress (play to animate)', value: 1, min: 0, max: 1, step: 0.01 },
  { key: 'pos', label: 'highlighted slice position (drag on the left)', value: 0.5, min: 0, max: 1, step: 0.001 },
];
const toggles = [
  { key: 'solid', label: 'Smooth solid', value: true },
  { key: 'slices', label: 'Slices', value: true },
  { key: 'mirror', label: 'Mirror the region across the axis (2D)', value: true },
];

function makeDef(id: string, title: string, method: 'washer' | 'shell', axisDefault: 'x' | 'y', regionDefault: string, extra: Partial<DemoDef>): DemoDef {
  return {
    id, module: 'calc2', title, topic: 'Volumes of revolution: disks, washers and cylindrical shells',
    summary: method === 'washer'
      ? 'Slice the solid perpendicular to the axis: each slice is a disk or a washer of volume π(R² − r²)Δx. Add them up and let the slices thin: V = π∫(R² − r²)dx.'
      : 'Slice the region parallel to the axis: each strip sweeps out a thin cylindrical shell of volume 2π·(radius)·(height)·(thickness). Add them up: V = 2π∫ρ h(ρ) dρ.',
    tex: method === 'washer' ? 'V = \\pi\\int_a^b \\big[R(x)^2 - r(x)^2\\big]\\,dx' : 'V = 2\\pi\\int_a^b \\rho(x)\\,h(x)\\,dx',
    view: 'split3d', animated: true,
    params: params.map((p) => ({ ...p })),
    choices: [
      { key: 'region', label: 'Region', value: regionDefault, options: opts(Object.fromEntries(Object.entries(PRESETS).map(([k, p]) => [k, p.label]))) },
      { key: 'axis', label: 'Revolve about', value: axisDefault, options: [['x', 'a horizontal line y = k'], ['y', 'a vertical line x = h']] },
      { key: 'method', label: 'Method', value: method, options: [['washer', 'disks / washers (⊥ axis)'], ['shell', 'cylindrical shells (∥ axis)']] },
      { key: 'anim', label: 'Play animates', value: 'build', options: [['build', 'building the solid slice by slice'], ['sweep', 'the revolution sweeping round']] },
    ],
    toggles: toggles.map((t) => ({ ...t })),
    experiments: [], connections: [],
    accuracy: 'The slice sum is the midpoint rule (exact arithmetic on each slice). The volume is one adaptive Gauss–Kronrod integral (washers about a horizontal axis, shells about a vertical one; ≈1e−10), and the exact closed form is shown for the presets with the axis through the origin. Cross-sections {x : g(x) ≤ y ≤ f(x)} needed for washers about a vertical axis and shells about a horizontal one are found by sampling (400 points) and bisection.',
    create: (ctx) => createSolid(ctx),
    ...extra,
  };
}

export const washersDemo = makeDef('calc2.washers', 'Volumes: disks and washers', 'washer', 'x', 'between', {
  experiments: [
    'Press play: the solid assembles washer by washer. Increase n — the stack of washers approaches the smooth solid, and V_n → V.',
    'Drag the highlighted slice (left): its outer radius R and inner radius r are the distances from the axis to the top and bottom curves.',
    'Set the sweep below 360°: the cut face is the region and its mirror image — the solid’s cross-section through the axis.',
    'Move the axis to y = −1 (offset): both radii grow by 1 and the hole widens. Pappus: V = 2π·(distance of the centroid)·(area).',
    'Revolve about a vertical line: washers are now horizontal, and you need x as a function of y — the readout says which.',
  ],
  connections: ['calc2.shells', 'calc2.surface', 'calc2.arclength'],
  tutorial: safeTutorial([
    { text: '**Slicing.** A solid of revolution is round in every slice perpendicular to its axis. Cut it into thin slabs: each is a disk (radius $R$) or a washer (outer $R$, inner $r$), of volume $\\pi(R^2 - r^2)\\,\\Delta x$.', set: { choices: { region: 'sqrt', axis: 'x', method: 'washer', anim: 'build' }, params: { n: 6, off: 0, sweep: 360, build: 1, pos: 0.5 }, toggles: { solid: false, slices: true, mirror: true } }, task: 'Rotate the 3D view with the mouse to see the disks from the side.' },
    { text: 'The sum of the disks is a Riemann sum: $V_n = \\sum \\pi f(x_i)^2\\Delta x$. As $n\\to\\infty$ it becomes $V = \\pi\\int_0^4 (\\sqrt x)^2dx = 8\\pi$.', set: { toggles: { solid: true } }, task: 'Raise n to 40 and compare V_n with V.', done: (c) => c.params.n >= 40 },
    { text: '**Watch it build.** Press play: the slabs appear one by one along the axis — integration as accumulation.', set: { params: { build: 0, n: 20 }, toggles: { solid: false } }, task: 'Press play (space).' },
    { text: '**Washers.** Revolve the region between $y = x$ and $y = x^2$: each slice has a hole. Outer radius $R = x$ (the far curve), inner radius $r = x^2$ (the near one): $V = \\pi\\int_0^1 (x^2 - x^4)dx = \\frac{2\\pi}{15}$.', set: { choices: { region: 'between' }, params: { n: 12, build: 1, sweep: 270 }, toggles: { solid: true, slices: true } }, task: 'Drag the highlighted slice (left plot) and watch R and r.' },
    { text: '**Cross-section.** With a sweep below 360° the solid is cut open: the flat face is the region together with its mirror image across the axis. That is the slice *containing* the axis.', set: { params: { sweep: 200 } }, task: 'Set the sweep to about 90° and rotate the view.', done: (c) => c.params.sweep < 120 },
    { text: '**A different axis.** Revolve about $y = -1$: now $R = x + 1$, $r = x^2 + 1$. The volume grows — **Pappus’ theorem** says $V = 2\\pi\\bar d A$, where $\\bar d$ is the distance travelled by the centroid. Physics connection: the centroid is the centre of mass of a uniform plate.', set: { params: { off: -1, sweep: 270 } }, task: 'Compare V with the Pappus readout.' },
  ]),
});

export const shellsDemo = makeDef('calc2.shells', 'Volumes: cylindrical shells', 'shell', 'y', 'sine', {
  experiments: [
    'Press play: nested shells appear from the axis outward. Each is a strip of the region swept round — unroll it and it is a thin slab 2πρ by h by Δρ.',
    'Revolve y = sin x (0 ≤ x ≤ π) about the y-axis: shells give 2π∫x sin x dx = 2π² at once — washers would need arcsin.',
    'Switch the method to washers for the same solid: the volume is the same, the slices are not. Compare the two integrals in the Steps tab.',
    'Make the torus: the disc centred at (3, 0) about the y-axis. Shells give 2π²Rr² = 6π² — and so does Pappus (the centre travels 6π).',
    'Move the axis to x = −1: every shell’s radius grows by 1.',
  ],
  connections: ['calc2.washers', 'calc2.parts'],
  tutorial: safeTutorial([
    { text: '**Shells.** Slice the region into thin vertical strips at $x$, of height $h(x) = f(x) - g(x)$ and width $\\Delta x$. Revolving a strip about the $y$-axis sweeps out a thin cylindrical shell of radius $x$.', set: { choices: { region: 'sine', axis: 'y', method: 'shell', anim: 'build' }, params: { n: 8, off: 0, sweep: 270, build: 1, pos: 0.5 }, toggles: { solid: false, slices: true, mirror: true } }, task: 'Rotate the 3D view to see the nested shells.' },
    { text: '**Unroll a shell:** it is nearly a flat slab of length $2\\pi x$ (the circumference), height $h(x)$ and thickness $\\Delta x$. So $\\Delta V \\approx 2\\pi x\\,h(x)\\,\\Delta x$, and $V = 2\\pi\\int_a^b x\\,h(x)\\,dx$.', task: 'Drag the highlighted shell (left) and read its radius and height.' },
    { text: 'For $y = \\sin x$: $V = 2\\pi\\int_0^\\pi x\\sin x\\,dx$ — integration by parts — $= 2\\pi\\cdot\\pi = 2\\pi^2$. With washers we would need $x = \\arcsin y$ and $x = \\pi - \\arcsin y$: possible, but harder.', set: { params: { n: 30 }, toggles: { solid: true } }, task: 'Press play to build the solid from shells.' },
    { text: '**Same solid, other method.** Switch to washers: horizontal slices, outer radius $\\pi - \\arcsin y$, inner $\\arcsin y$. Both sums approach the same $V$.', set: { choices: { method: 'washer' } }, task: 'Compare V_n for the two methods at n = 30.' },
    { text: '**A torus.** Revolve the unit disc centred at $(3, 0)$ about the $y$-axis. Shells: $V = 2\\pi\\int_2^4 x\\cdot 2\\sqrt{1-(x-3)^2}\\,dx = 6\\pi^2$. Pappus: the centre travels $2\\pi\\cdot 3$ and the area is $\\pi$ — the same $6\\pi^2$.', set: { choices: { region: 'torus', method: 'shell' }, params: { n: 16, sweep: 250 } } },
  ]),
});

function createSolid(ctx: DemoCtx): DemoInstance {
  const P2 = ctx.plot!, v = ctx.view3d!;
  P2.opts.equal = true; P2.opts.xLabel = 'x'; P2.opts.yLabel = 'y';
  const solid = new SwapMesh({ color: '#6aa9ff', opacity: 1 });
  const slices = new SwapMesh({ vertexColors: true });
  const hi = new SwapMesh({ color: '#ff9f5a' });
  const cut = new SwapMesh({ color: '#f2c14e' });
  const axisLine = lineObject('#ef6b73');
  const regionLine = lineObject('#f2c14e');
  for (const o of [solid.mesh, slices.mesh, hi.mesh, cut.mesh, axisLine.obj, regionLine.obj]) v.addObject(o);
  let lastView = '';
  const colA = new THREE.Color(), colB = new THREE.Color();

  const update = () => {
    const P = PRESETS[ctx.choices.region] ?? PRESETS.between;
    const R = P.R;
    const ax: Axis = ctx.choices.axis === 'y' ? { kind: 'vertical', h: ctx.params.off } : { kind: 'horizontal', k: ctx.params.off };
    const method = ctx.choices.method === 'shell' ? 'shell' : 'washer';
    const n = Math.max(1, Math.round(ctx.params.n));
    const phiLen = clamp(ctx.params.sweep, 1, 360) * Math.PI / 180;
    const build = clamp(ctx.params.build, 0, 1);
    const over = straddles(R, ax);
    const [ylo, yhi] = yRange(R);
    // which side of the axis the region is on decides the direction at angle 0
    const side = ax.kind === 'horizontal' ? ((ylo + yhi) / 2 >= ax.k ? 1 : -1) : ((R.a + R.b) / 2 >= ax.h ? 1 : -1);
    const fr: Frame = ax.kind === 'horizontal'
      ? { origin: [0, 0, ax.k], axis: [1, 0, 0], radial: [0, 0, side] }
      : { origin: [ax.h, 0, 0], axis: [0, 0, 1], radial: [side, 0, 0] };
    const M = frameMatrix(fr);
    for (const m of [solid, slices, hi, cut]) m.setMatrix(M);
    // (x, y) in the plane → (r, h) in the lathe frame
    const rh = (x: number, y: number): [number, number] => (ax.kind === 'horizontal' ? [Math.abs(y - ax.k), x] : [Math.abs(x - ax.h), y]);

    // the region's boundary as smooth pieces
    const N = 120, top: [number, number][] = [], bot: [number, number][] = [];
    for (let i = 0; i <= N; i++) { const x = R.a + ((R.b - R.a) * i) / N; top.push([x, R.f(x)]); bot.push([x, R.g(x)]); }
    const pieces = [top, bot, [[R.a, R.g(R.a)], [R.a, R.f(R.a)]], [[R.b, R.g(R.b)], [R.b, R.f(R.b)]]] as [number, number][][];
    const segs = 72;
    // the smooth solid
    if (ctx.toggles.solid) {
      const geos = pieces.map((pc) => latheCurve(pc.map(([x, y]) => rh(x, y)), segs, phiLen)).filter((g): g is THREE.BufferGeometry => !!g);
      const merged = mergeColored([{ geos, color: new THREE.Color('#ffffff') }]);
      solid.set(merged);
      solid.material.color.set(ctx.dark ? '#6aa9ff' : '#3d7fd9');
      solid.setOpacity(ctx.toggles.slices ? 0.28 : 0.92);
    } else solid.set(null);
    // cut faces (the cross-section through the axis) when the sweep is partial
    if (phiLen < 2 * Math.PI - 1e-6 && ctx.toggles.solid) {
      const poly = [...top, ...bot.slice().reverse()].map(([x, y]) => rh(x, y));
      const faces = [cutFace(poly, 0), cutFace(poly, phiLen)].filter((g): g is THREE.BufferGeometry => !!g);
      cut.set(mergeColored([{ geos: faces, color: new THREE.Color('#ffffff') }]));
      cut.setOpacity(ctx.toggles.slices ? 0.35 : 0.95);
    } else cut.set(null);

    // slices
    type Box = { r0: number; r1: number; h0: number; h1: number };
    const boxes: Box[][] = [];
    let Vn = 0, sliceInfo = '', hiBoxes: Box[] = [];
    const pos = clamp(ctx.params.pos, 0, 0.9999);
    const hiIndex = Math.min(n - 1, Math.floor(pos * n));
    const strips2d: { rects: [number, number][][]; hiLite: boolean }[] = [];
    if (method === 'washer') {
      const sl = washerSlices(R, ax, n);
      sl.forEach((s, i) => {
        Vn += s.dV;
        boxes.push(s.rings.map(([r0, r1]) => ({ r0, r1, h0: s.s0, h1: s.s0 + s.ds })));
        // the 2D rectangles: the region's cross-section at this slice
        const rects: [number, number][][] = [];
        if (ax.kind === 'horizontal') { const F = R.f(s.s), G = R.g(s.s); if (F > G) rects.push([[s.s0, G], [s.s0 + s.ds, G], [s.s0 + s.ds, F], [s.s0, F]]); }
        else for (const [p, q] of intervalsAt(R, s.s)) rects.push([[p, s.s0], [q, s.s0], [q, s.s0 + s.ds], [p, s.s0 + s.ds]]);
        strips2d.push({ rects, hiLite: i === hiIndex });
        if (i === hiIndex) {
          hiBoxes = boxes[i];
          const rings = s.rings.map(([r0, r1]) => `R = ${fmt(r1, 4)}, r = ${fmt(r0, 4)}`).join('; ');
          sliceInfo = `${ax.kind === 'horizontal' ? 'x' : 'y'} = ${fmt(s.s, 4)}: ${rings || 'empty'}  →  ΔV = π(R² − r²)Δ = ${fmt(s.dV, 5)}`;
        }
      });
    } else {
      const sl = shellSlices(R, ax, n);
      sl.forEach((s, i) => {
        Vn += s.dV;
        boxes.push(s.heights.map(([h0, h1]) => ({ r0: s.r0, r1: s.r0 + s.drho, h0, h1 })));
        const rects: [number, number][][] = [];
        for (const [h0, h1] of s.heights) {
          if (ax.kind === 'vertical') { const x0 = ax.h + side * s.r0, x1 = ax.h + side * (s.r0 + s.drho); rects.push([[x0, h0], [x1, h0], [x1, h1], [x0, h1]]); }
          else { const y0 = ax.k + side * s.r0, y1 = ax.k + side * (s.r0 + s.drho); rects.push([[h0, y0], [h1, y0], [h1, y1], [h0, y1]]); }
        }
        strips2d.push({ rects, hiLite: i === hiIndex });
        if (i === hiIndex) {
          hiBoxes = boxes[i];
          const h = s.heights.reduce((t, [p, q]) => t + q - p, 0);
          sliceInfo = `radius ρ = ${fmt(s.rho, 4)}, height h = ${fmt(h, 4)}  →  ΔV = 2πρhΔρ = ${fmt(s.dV, 5)}`;
        }
      });
    }
    const shown = Math.round(build * n);
    if (ctx.toggles.slices && shown > 0) {
      colA.set(ctx.dark ? '#4f8fe0' : '#5b8fd9'); colB.set(ctx.dark ? '#b48cff' : '#9a72e6');
      const groups = boxes.slice(0, shown).map((bx, i) => ({ geos: bx.flatMap((b) => ringBox(b.r0, b.r1, b.h0, b.h1, 48, phiLen)), color: i % 2 ? colB : colA }));
      slices.set(mergeColored(groups));
    } else slices.set(null);
    hi.set(hiBoxes.length && (ctx.toggles.slices || !ctx.toggles.solid) ? mergeColored([{ geos: hiBoxes.flatMap((b) => ringBox(b.r0, b.r1, b.h0, b.h1, 64, phiLen)), color: new THREE.Color('#ffffff') }]) : null);

    // the axis and the region outline at angle 0, in 3D
    const L = Math.max(R.b - R.a, yhi - ylo);
    if (ax.kind === 'horizontal') axisLine.set([[Math.min(R.a, 0) - 0.4 * L, 0, ax.k], [R.b + 0.4 * L, 0, ax.k]]);
    else axisLine.set([[ax.h, 0, Math.min(ylo, 0) - 0.4 * L], [ax.h, 0, yhi + 0.4 * L]]);
    regionLine.set([...top, ...bot.slice().reverse(), top[0]].map(([x, y]) => framePoint(fr, rh(x, y)[0], rh(x, y)[1], 0)));
    const viewKey = `${ctx.choices.region}|${ctx.choices.axis}|${Math.round(ctx.params.off)}`;
    if (viewKey !== lastView) {
      lastView = viewKey;
      // bounds: the solid's extent
      let rmax = 0, hmin = Infinity, hmax = -Infinity;
      for (const pc of pieces) for (const [x, y] of pc) { const [r, h] = rh(x, y); rmax = Math.max(rmax, r); hmin = Math.min(hmin, h); hmax = Math.max(hmax, h); }
      const pad = 0.15 * Math.max(rmax, hmax - hmin);
      const c0 = fr.origin;
      if (ax.kind === 'horizontal') v.setBounds({ x: [Math.min(hmin, 0) - pad, hmax + pad], y: [-rmax - pad, rmax + pad], z: [c0[2] - rmax - pad, c0[2] + rmax + pad] });
      else v.setBounds({ x: [c0[0] - rmax - pad, c0[0] + rmax + pad], y: [-rmax - pad, rmax + pad], z: [Math.min(hmin, 0) - pad, hmax + pad] });
      v.resetCamera();
      // the 2D view: region plus its mirror
      const xs = [R.a, R.b, ax.kind === 'vertical' ? 2 * ax.h - R.a : R.a, ax.kind === 'vertical' ? 2 * ax.h - R.b : R.b, 0];
      const ys = [ylo, yhi, ax.kind === 'horizontal' ? 2 * ax.k - ylo : ylo, ax.kind === 'horizontal' ? 2 * ax.k - yhi : yhi, 0];
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), m = 0.15 * Math.max(x1 - x0, y1 - y0);
      P2.setView({ x0: x0 - m, x1: x1 + m, y0: y0 - m, y1: y1 + m });
    }
    v.requestRender();

    // 2D picture
    const mirror = (p: [number, number]): [number, number] => (ax.kind === 'horizontal' ? [p[0], 2 * ax.k - p[1]] : [2 * ax.h - p[0], p[1]]);
    const regionPoly = [...top, ...bot.slice().reverse()];
    P2.setDraw((g) => {
      if (ctx.toggles.mirror) g.polygon(regionPoly.map(mirror), { fill: rgba(GOLD, 0.08), color: rgba(GOLD, 0.35), width: 1, dash: [4, 4] });
      g.polygon(regionPoly, { fill: rgba(GOLD, 0.22) });
      strips2d.forEach((s, i) => { if (i < shown || s.hiLite) for (const r of s.rects) g.polygon(r, { fill: s.hiLite ? rgba('#ff9f5a', 0.55) : rgba(i % 2 ? VIOLET : BLUE, 0.28), color: s.hiLite ? '#ff9f5a' : rgba(i % 2 ? VIOLET : BLUE, 0.7), width: s.hiLite ? 2 : 0.8 }); });
      g.path(top, { color: GOLD, width: 2.4 }); g.path(bot, { color: CYAN, width: 2.4 });
      if (ax.kind === 'horizontal') g.line([g.view.x0, ax.k], [g.view.x1, ax.k], { color: RED, width: 2, dash: [8, 5] });
      else g.line([ax.h, g.view.y0], [ax.h, g.view.y1], { color: RED, width: 2, dash: [8, 5] });
      g.text([g.view.x0, g.view.y1], `axis: ${ax.kind === 'horizontal' ? `y = ${fmt(ax.k, 3)}` : `x = ${fmt(ax.h, 3)}`}`, { color: RED, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], `top: y = ${P.fTeX.replace(/\\sqrt\{([^}]*)\}/g, '√($1)').replace(/\\tfrac\{x\}\{2\}/, 'x/2').replace(/\\sin/, 'sin').replace(/\\/g, '')}`, { color: GOLD, font: FONT }, 10, 40);
      g.text([g.view.x0, g.view.y1], `bottom: y = ${P.gTeX.replace(/\\sqrt\{([^}]*)\}/g, '√($1)').replace(/\\/g, '')}`, { color: CYAN, font: FONT }, 10, 58);
      // the highlighted slice: a handle at its centre, and its radii
      const hs = strips2d[hiIndex];
      if (hs && hs.rects.length) {
        const r = hs.rects[0];
        const cx = (r[0][0] + r[2][0]) / 2, cy = (r[0][1] + r[2][1]) / 2;
        if (method === 'washer') {
          if (ax.kind === 'horizontal') { g.arrow([cx, ax.k], [cx, r[2][1]], { color: '#ff9f5a', width: 2 }); g.text([cx, (ax.k + r[2][1]) / 2], 'R', { color: '#ff9f5a', font: '700 14px Inter, sans-serif' }, 6, 0); if (Math.abs(r[0][1] - ax.k) > 1e-6) { g.arrow([cx - 0.02 * (g.view.x1 - g.view.x0), ax.k], [cx - 0.02 * (g.view.x1 - g.view.x0), r[0][1]], { color: CYAN, width: 2 }); } }
          else { const far = hs.rects.reduce((m, q) => Math.max(m, Math.abs(q[1][0] - ax.h), Math.abs(q[0][0] - ax.h)), 0); g.arrow([ax.h, cy], [ax.h + side * far, cy], { color: '#ff9f5a', width: 2 }); }
        } else {
          if (ax.kind === 'vertical') g.arrow([ax.h, cy], [cx, cy], { color: '#ff9f5a', width: 2 });
          else g.arrow([cx, ax.k], [cx, cy], { color: '#ff9f5a', width: 2 });
        }
        g.handle({ id: 'pos', at: [cx, cy], color: '#ff9f5a', onDrag: ([px, py]) => {
          // map the pointer onto the slicing coordinate
          let u: number;
          if (method === 'washer') u = ax.kind === 'horizontal' ? (px - R.a) / (R.b - R.a) : (py - ylo) / (yhi - ylo);
          else {
            const rlo = ax.kind === 'vertical' ? (side > 0 ? Math.max(0, R.a - ax.h) : Math.max(0, ax.h - R.b)) : (side > 0 ? Math.max(0, ylo - ax.k) : Math.max(0, ax.k - yhi));
            const rhi = ax.kind === 'vertical' ? (side > 0 ? R.b - ax.h : ax.h - R.a) : (side > 0 ? yhi - ax.k : ax.k - ylo);
            const rr = ax.kind === 'vertical' ? Math.abs(px - ax.h) : Math.abs(py - ax.k);
            u = (rr - rlo) / (rhi - rlo);
          }
          ctx.setParam('pos', +clamp(u, 0, 0.9999).toFixed(4));
        } });
      }
    });

    // numbers
    const V = volume(R, ax);
    const C = centroid(R);
    const dist = ax.kind === 'horizontal' ? Math.abs(C.cy - ax.k) : Math.abs(C.cx - ax.h);
    const pappus = 2 * Math.PI * dist * C.area;
    const exactTeX = ctx.params.off === 0 ? P.exact?.[ax.kind === 'horizontal' ? 'x' : 'y'] : undefined;
    ctx.warn(over ? `The region lies on both sides of the axis: revolving it makes the two parts overlap. The solid shown is their union; the integral counts it once only where the slices say so — move the axis (offset) off the region.` : '');
    ctx.setReadouts([
      { label: `${method === 'washer' ? 'washer' : 'shell'} sum V_n, n = ${n}`, value: fmt(Vn, 9) },
      { label: 'volume V  (adaptive quadrature)', value: `${fmt(V.value, 11)}${exactTeX ? '' : ''}`, tone: 'good' },
      ...(exactTeX ? [{ label: 'exact', value: `V = ${exactTeX} = ${fmt(V.value, 9)}`, tex: true }] : []),
      { label: 'V − V_n', value: (V.value - Vn).toExponential(2) },
      { label: 'highlighted slice', value: sliceInfo || '—' },
      { label: 'area A, centroid (x̄, ȳ)', value: `${fmt(C.area, 5)}, (${fmt(C.cx, 4)}, ${fmt(C.cy, 4)})` },
      { label: 'Pappus: 2π·(centroid distance)·A', value: over ? 'n/a (region crosses the axis)' : fmt(pappus, 9), tone: over ? 'muted' : Math.abs(pappus - V.value) < 1e-6 * V.value ? 'good' : 'warn' },
    ]);
    const isX = ax.kind === 'horizontal', k = isX ? ax.k : ax.h, off = k === 0 ? '' : k > 0 ? ` - ${fmt(k, 3)}` : ` + ${fmt(-k, 3)}`;
    const washerX = `V = \\pi\\int_{${P.aTeX}}^{${P.bTeX}} \\Big[\\big(${P.fTeX}${off}\\big)^2 - \\big(${P.gTeX}${off}\\big)^2\\Big]dx`;
    const shellY = `V = 2\\pi\\int_{${P.aTeX}}^{${P.bTeX}} \\big|x${off}\\big|\\,\\big(${P.fTeX} - ${P.gTeX}\\big)\\,dx`.replace('- 0\\big)', '\\big)');
    const rows: StepRow[] = [];
    if (isX) {
      rows.push({ title: 'Washers (slices ⊥ the x-axis): R and r are the distances from the axis to the curves', tex: washerX, rule: 'washers' });
      rows.push({ title: 'Shells (strips ∥ the x-axis) need x in terms of y', tex: k === 0 && P.xShell ? `V = 2\\pi\\int_{${P.xShell.c}}^{${P.xShell.d}} y\\,\\big(${P.xShell.len}\\big)\\,dy` : '\\text{(computed numerically: the strip length at height } y \\text{ is } |\\{x : g(x) \\le y \\le f(x)\\}|)', rule: 'shells' });
    } else {
      rows.push({ title: 'Shells (strips ∥ the y-axis): radius |x − h|, height f − g', tex: shellY, rule: 'shells' });
      rows.push({ title: 'Washers (slices ⊥ the y-axis) need x in terms of y', tex: k === 0 && P.yWasher ? `V = \\pi\\int_{${P.yWasher.c}}^{${P.yWasher.d}} \\Big[\\big(${P.yWasher.R}\\big)^2 - \\big(${P.yWasher.r}\\big)^2\\Big]dy` : '\\text{(computed numerically from the cross-sections at each height } y)', rule: 'washers' });
    }
    rows.push({ title: 'Value', tex: `V = ${exactTeX ? exactTeX + ' = ' : ''}${fmt(V.value, 11)}`, detail: `Both methods give the same number; the slice sum with n = ${n} gives ${fmt(Vn, 9)}.`, rule: 'result' });
    rows.push({ title: 'Pappus’ centroid theorem (a check)', tex: `V = 2\\pi\\,\\bar d\\,A = 2\\pi(${fmt(dist, 5)})(${fmt(C.area, 5)}) = ${fmt(pappus, 9)}`, detail: 'The centroid of the region travels a circle of radius d̄; the volume is that distance times the area. (Valid when the axis does not cut the region.)', rule: 'check' });
    ctx.setSteps(rows);
    ctx.setNote(method === 'washer'
      ? `Each slice is ${isX ? 'a vertical' : 'a horizontal'} rectangle revolved into a washer of volume $\\pi(R^2 - r^2)\\,\\Delta$. ${isX ? '' : 'About a vertical axis, washers are horizontal: the radii are x-distances at height y — shells are usually easier here.'} Orange: the highlighted slice. ${phiLen < 2 * Math.PI - 1e-6 ? 'The gold faces are the cut: the region and its mirror image.' : ''}`
      : `Each strip ${isX ? 'parallel to the x-axis' : 'parallel to the y-axis'} sweeps out a cylindrical shell: unrolled, a slab $2\\pi\\rho \\times h \\times \\Delta\\rho$. ${isX ? 'About a horizontal axis, shells need the strip length at each height y — washers are usually easier here.' : ''} ${phiLen < 2 * Math.PI - 1e-6 ? 'The gold faces are the cut: the region and its mirror image.' : ''}`);
  };

  return {
    update,
    tick(dt) {
      if (ctx.choices.anim === 'sweep') { let s = ctx.params.sweep + 50 * dt; if (s > 360) s = 5; ctx.setParam('sweep', s); }
      else { let b = ctx.params.build + dt / 6; if (b > 1.15) b = 0; ctx.setParam('build', Math.min(b, 1)); if (b > 1) { ctx.params.build = b; } }
      update();
    },
    reset() { ctx.setParam('build', 0); },
    dispose() { v.clear(); },
  };
}
