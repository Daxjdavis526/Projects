// Surface area of revolution: the surface is approximated by frusta (bands of
// cones) whose slant heights are the polyline's segments — S = 2π∫ f ds.
// Gabriel's horn shows a finite volume inside an infinite area.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { derivative, compile, Node } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { frustaArea } from '../../core/numeric/revolution';
import { fmt, ink, rgba, BLUE, GOLD, RED, VIOLET, FONT, compileInput, safeTutorial, clamp } from './util';
import { frameMatrix, latheCurve, mergeColored, SwapMesh, lineObject } from './solids';

export const surfaceDemo: DemoDef = {
  id: 'calc2.surface', module: 'calc2', title: 'Surface area of revolution', topic: 'Surface area of a surface of revolution',
  summary: 'Revolve the inscribed polyline instead of the curve: each segment sweeps a frustum (a band of a cone) with area 2π·(mean radius)·(slant height). Summing and refining gives S = 2π∫ f ds.',
  tex: 'S = 2\\pi\\int_a^b f(x)\\sqrt{1 + f\'(x)^2}\\,dx',
  view: 'split3d',
  input: { label: 'f(x) =', value: 'sqrt(x)', placeholder: 'e.g. 1/x, sqrt(4 - x^2), cosh(x), x' },
  params: [
    { key: 'a', label: 'a', value: 0, min: -5, max: 50, step: 0.01 },
    { key: 'b', label: 'b', value: 2, min: -5, max: 50, step: 0.01 },
    { key: 'n', label: 'frusta n', value: 4, min: 1, max: 120, step: 1 },
    { key: 'sweep', label: 'revolve through (degrees)', value: 300, min: 10, max: 360, step: 1 },
  ],
  toggles: [{ key: 'smooth', label: 'Smooth surface', value: true }, { key: 'frusta', label: 'Frusta (cone bands)', value: true }],
  experiments: [
    'Increase n: the frusta’s total area approaches S from below, and the bands become indistinguishable from the surface.',
    'Type sqrt(4 - x^2) on [−2, 2]: a sphere, area 16π. Now take any zone, say [0.5, 1.5]: its area is 2π·2·1 — it depends only on the width (Archimedes’ hat-box theorem).',
    'Type x on [0, 2]: a cone. A single frustum (n = 1) is already exact — the surface is made of straight lines.',
    'Gabriel’s horn: type 1/x on [1, 50]. The volume stays below π, but the area grows like 2π ln b — paint it? You cannot. Fill it? Easily.',
  ],
  connections: ['calc2.arclength', 'calc2.washers', 'calc2.improper'],
  accuracy: 'f′ is exact (symbolic). S and V are adaptive quadrature (≈1e−10); the frusta sum is exact arithmetic on the sampled points. Where f < 0 the radius is |f|.',
  tutorial: safeTutorial([
    { text: '**Why not cylinders?** For volume, thin cylinders (disks) work. For area they do not: a slanted band is longer than it is wide. Use **frusta** — bands of cones — whose slant follows the curve. A frustum with radii $r_1, r_2$ and slant $\\ell$ has area $\\pi(r_1 + r_2)\\ell$.', set: { input: 'sqrt(x)', params: { a: 0, b: 2, n: 3, sweep: 300 }, toggles: { smooth: false, frusta: true } }, task: 'Rotate the 3D view to see the three bands.' },
    { text: 'The slant $\\ell$ is the polyline segment from the arc length demo: $\\ell \\approx \\sqrt{1 + f\'^2}\\,\\Delta x$, and the mean radius $\\approx f(x)$. So $S \\approx \\sum 2\\pi f(x_i)\\sqrt{1+f\'(x_i)^2}\\,\\Delta x \\to 2\\pi\\int f\\,ds$.', set: { toggles: { smooth: true } }, task: 'Raise n until the frusta sum agrees with S to 3 digits.', done: (c) => c.params.n >= 30 },
    { text: 'For $f = \\sqrt x$: $f\\sqrt{1 + f\'^2} = \\sqrt{x + \\tfrac14}$, so $S = 2\\pi\\int_0^2 (x+\\tfrac14)^{1/2}dx = \\frac{13\\pi}{3}$.', task: 'Check the readout: 13π/3 ≈ 13.6136.' },
    { text: '**Gabriel’s horn.** Revolve $y = 1/x$ for $x \\ge 1$. Volume: $\\pi\\int_1^\\infty x^{-2}dx = \\pi$ (finite). Area: $2\\pi\\int_1^\\infty \\frac1x\\sqrt{1 + x^{-4}}\\,dx \\ge 2\\pi\\int_1^\\infty \\frac{dx}{x} = \\infty$. A horn you could fill with paint but never paint.', set: { input: '1/x', params: { a: 1, b: 20, n: 60, sweep: 300 } }, task: 'Drag b to 50 and compare V with S.', done: (c) => c.params.b > 45 },
  ]),
  create: (ctx) => createSurface(ctx),
};

function createSurface(ctx: DemoCtx): DemoInstance {
  const P2 = ctx.plot!, v = ctx.view3d!;
  P2.opts.xLabel = 'x';
  const smooth = new SwapMesh({ color: '#6aa9ff', opacity: 0.55 });
  const bands = new SwapMesh({ vertexColors: true });
  const curve = lineObject('#f2c14e');
  const M = frameMatrix({ origin: [0, 0, 0], axis: [1, 0, 0], radial: [0, 0, 1] });
  smooth.setMatrix(M); bands.setMatrix(M);
  for (const o of [smooth.mesh, bands.mesh, curve.obj]) v.addObject(o);
  let lastKey = '';
  const update = () => {
    const parsed = compileInput(ctx.input, 'x');
    if ('error' in parsed) { ctx.warn(`Cannot read f(x): ${parsed.error}`); return; }
    const f = parsed.f;
    let dn: Node | null = null;
    try { dn = derivative(parsed.node, 'x'); } catch { dn = null; }
    const dc = dn ? compile(dn, ['x']) : null;
    const df = (x: number) => (dc ? dc([x]) : (f(x + 1e-6) - f(x - 1e-6)) / 2e-6);
    const a = Math.min(ctx.params.a, ctx.params.b), b = Math.max(ctx.params.a, ctx.params.b);
    const n = Math.max(1, Math.round(ctx.params.n));
    const phi = clamp(ctx.params.sweep, 1, 360) * Math.PI / 180;
    const S = integrate((x) => 2 * Math.PI * Math.abs(f(x)) * Math.sqrt(1 + df(x) ** 2), a, b, 1e-10);
    const V = integrate((x) => Math.PI * f(x) ** 2, a, b, 1e-10);
    const Sn = frustaArea(f, a, b, n);
    let sign = false;
    const prof: [number, number][] = [];
    let rmax = 0;
    for (let i = 0; i <= 240; i++) { const x = a + ((b - a) * i) / 240, y = f(x); if (y < 0) sign = true; prof.push([Math.abs(y), x]); if (Number.isFinite(y)) rmax = Math.max(rmax, Math.abs(y)); }
    if (ctx.toggles.smooth) smooth.set(mergeColored([{ geos: [latheCurve(prof, 96, phi)].filter((g): g is THREE.BufferGeometry => !!g), color: new THREE.Color('#ffffff') }])); else smooth.set(null);
    smooth.material.color.set(ctx.dark ? '#6aa9ff' : '#3d7fd9');
    smooth.setOpacity(ctx.toggles.frusta ? 0.35 : 0.95);
    const nodes: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; nodes.push([Math.abs(f(x)), x]); }
    if (ctx.toggles.frusta) {
      const cA = new THREE.Color(GOLD), cB = new THREE.Color(VIOLET);
      bands.set(mergeColored(nodes.slice(0, -1).map((p, i) => ({ geos: [latheCurve([p, nodes[i + 1]], 64, phi)].filter((g): g is THREE.BufferGeometry => !!g), color: i % 2 ? cB : cA }))));
    } else bands.set(null);
    curve.set(prof.map(([r, x]) => [x, 0, r]));
    const key = `${ctx.input}|${a}|${b}`;
    if (key !== lastKey) {
      lastKey = key;
      const R = Math.max(rmax, 0.2), pad = 0.12 * Math.max(R, b - a);
      v.setBounds({ x: [Math.min(a, 0) - pad, b + pad], y: [-R - pad, R + pad], z: [-R - pad, R + pad] });
      v.resetCamera();
      const w = b - a;
      P2.setView({ x0: a - 0.1 * w, x1: b + 0.1 * w, y0: -R * 1.25, y1: R * 1.25 });
    }
    v.requestRender();
    const t = ink(ctx);
    P2.setDraw((g) => {
      g.fillBetween(f, (x) => -f(x), a, b, { fill: rgba(BLUE, 0.12) });
      g.fn(f, { color: t, width: 2.4 }, [a, b]);
      g.fn((x) => -f(x), { color: rgba(BLUE, 0.6), width: 1.4, dash: [5, 4] }, [a, b]);
      g.line([g.view.x0, 0], [g.view.x1, 0], { color: RED, width: 2, dash: [8, 5] });
      for (let i = 0; i < n; i++) {
        const p0: [number, number] = [nodes[i][1], f(nodes[i][1])], p1: [number, number] = [nodes[i + 1][1], f(nodes[i + 1][1])];
        g.polygon([p0, p1, [p1[0], -p1[1]], [p0[0], -p0[1]]], { fill: rgba(i % 2 ? VIOLET : GOLD, 0.18), color: i % 2 ? VIOLET : GOLD, width: 1.5 });
      }
      g.text([g.view.x0, g.view.y1], 'profile y = f(x) and its mirror; each band is a frustum’s cross-section', { color: t, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], 'axis of revolution: the x-axis', { color: RED, font: FONT }, 10, 40);
    });
    ctx.warn([sign ? 'f is negative somewhere on [a, b]: the radius used is |f|.' : '', S.warning && !S.ok ? `Quadrature: ${S.warning}.` : ''].filter(Boolean).join(' '));
    const horn = /^\s*1\s*\/\s*x\s*$/.test(ctx.input);
    ctx.setReadouts([
      { label: `frusta sum S_n, n = ${n}`, value: fmt(Sn, 10) },
      { label: 'surface area S  (quadrature)', value: fmt(S.value, 10), tone: 'good' },
      { label: 'S − S_n', value: (S.value - Sn).toExponential(2) },
      { label: 'enclosed volume V = π∫f² dx', value: fmt(V.value, 10) },
      ...(horn ? [{ label: 'horn: V as b → ∞', value: 'π ≈ 3.14159' }, { label: 'horn: S ≥ 2π ln b', value: fmt(2 * Math.PI * Math.log(b / Math.max(a, 1e-9)), 6) }] : []),
    ]);
    ctx.setNote(horn ? 'Gabriel’s horn: the volume converges ($\\pi\\int x^{-2}$, a $p = 2$ integral) while the area diverges (at least $2\\pi\\int x^{-1}$, the $p = 1$ integral). Infinite surface, finite content.' : 'A frustum’s area is $\\pi(r_1 + r_2)\\ell$: circumference at the mean radius times the slant height. Summing gives a Riemann sum for $2\\pi\\int f\\,ds$ with $ds = (1 + f\'^2)^{1/2}dx$ — the same $ds$ as arc length.');
  };
  return { update, dispose() { v.clear(); } };
}
