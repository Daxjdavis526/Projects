// Poisson's equation in a grounded box: drag point charges and the potential
// surface follows — the finite-difference solution beside the exact Green's
// function series, with the electric field, equipotentials and Gauss's law
// checked numerically.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { Grid2, solveRelax, sorOmegaOpt, greenSquareGrid } from '../../core/numeric/pde';
import type { SurfaceHandle, PointHandle, FieldHandle, Handle, V3 } from '../../engine/viewport3d';
import { fmt, clamp, csv } from './common';

export const poisson: DemoDef = {
  id: 'pde.poisson', module: 'pde', title: "Poisson's equation: charges in a box",
  topic: "Poisson's equation · Green's functions · electrostatics · Gauss's law",
  summary: 'Two charges inside a grounded square box. Drag them: the potential is the solution of Poisson\'s equation, computed by finite differences and by the exact Green\'s-function series.',
  tex: '-\\nabla^2\\varphi = \\rho \\ \\text{ in } [0,1]^2,\\ \\ \\varphi = 0 \\text{ on the walls};\\qquad \\varphi(\\mathbf x) = \\sum_k q_k\\, G(\\mathbf x; \\mathbf x_k),\\quad G = \\sum_{m\\ge1} \\frac{2\\sin m\\pi x\\,\\sin m\\pi\\xi\\,\\sinh m\\pi y_<\\,\\sinh m\\pi(1 - y_>)}{m\\pi\\sinh m\\pi}',
  view: '3d',
  params: [
    { key: 'q1', label: 'charge q₁', value: 1, min: -2, max: 2, step: 0.01 },
    { key: 'q2', label: 'charge q₂', value: -1, min: -2, max: 2, step: 0.01 },
    { key: 'x1', label: 'x₁', value: 0.35, min: 0.04, max: 0.96, step: 0.005 },
    { key: 'y1', label: 'y₁', value: 0.5, min: 0.04, max: 0.96, step: 0.005 },
    { key: 'x2', label: 'x₂', value: 0.68, min: 0.04, max: 0.96, step: 0.005 },
    { key: 'y2', label: 'y₂', value: 0.5, min: 0.04, max: 0.96, step: 0.005 },
    { key: 'n', label: 'grid n × n', value: 60, min: 10, max: 100, step: 2 },
    { key: 'K', label: 'series terms K', value: 200, min: 10, max: 400, step: 1 },
  ],
  choices: [{ key: 'show', label: 'Surface shows', value: 'fd', options: [['fd', 'finite differences'], ['series', 'exact series']] }],
  toggles: [{ key: 'field', label: 'Electric field E = −∇φ (floor)', value: true }, { key: 'equip', label: 'Equipotentials', value: true }],
  experiments: [
    'Drag a charge toward a wall: the potential near it is squeezed — the grounded wall acts like an image charge of opposite sign.',
    'Make q₂ = −q₁ (a dipole) and q₂ = +q₁: compare the field patterns and the equipotentials.',
    'Read “flux out of the box” — it equals the enclosed charge q₁ + q₂ (Gauss\'s law), computed from the finite-difference solution.',
    'Switch between finite differences and the series: away from the charges they agree to O(h²); at a charge the series diverges (log) while the grid value stays finite.',
    'Set q₂ = 0 and move q₁ around: the potential at the centre is largest when the charge is at the centre (G is symmetric: G(a; b) = G(b; a)).',
  ],
  connections: ['pde.laplace', 'pde.relax', 'pde.heat2d', 'pde.classify'],
  accuracy: 'Finite differences: 5-point Laplacian on (n+1)² nodes, each point charge spread bilinearly onto its four nearest nodes, SOR to a change below 1e−10. Exact: the Green\'s-function series (K terms) — exponentially convergent off the horizontal line through a charge, slowly convergent on it, and logarithmically divergent at the charge itself (the surface there is clipped). In 2D a “point charge” is a uniform line charge in 3D, so φ ~ −(q/2π) ln r: this is an analogy for a 3D point charge, whose potential goes like 1/r.',
  create: (ctx) => poissonDemo(ctx),
};

function poissonDemo(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  v.setBounds({ x: [0, 1], y: [0, 1], z: [-0.7, 0.7] });
  v.resetCamera();
  let n = 0, grid: Grid2 | null = null, tmp = new Float64Array(0), ser = new Float64Array(0), iters = 0;
  let surf: SurfaceHandle | null = null, field: FieldHandle | null = null, equip: Handle | null = null, res = -1;
  const pts: PointHandle[] = [];
  const zCap = 0.7;

  const solve = () => {
    const p = ctx.params, m = n + 1;
    if (!grid || grid.n !== n) {
      grid = { n, h: 1 / n, u: new Float64Array(m * m), fixed: new Uint8Array(m * m), f: new Float64Array(m * m) };
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) if (i === 0 || j === 0 || i === n || j === n) grid.fixed[j * m + i] = 1;
      tmp = new Float64Array(m * m); ser = new Float64Array(m * m);
    }
    const g = grid, h = g.h;
    g.f!.fill(0);
    for (const [q, x, y] of [[p.q1, p.x1, p.y1], [p.q2, p.x2, p.y2]]) {
      const s = x * n, t = y * n, i = Math.min(n - 1, Math.floor(s)), j = Math.min(n - 1, Math.floor(t)), a = s - i, b = t - j;
      // ∇²φ = −ρ, ρ = q δ spread bilinearly: weight / h²
      const add = (ii: number, jj: number, w: number) => { g.f![jj * m + ii] -= (q * w) / (h * h); };
      add(i, j, (1 - a) * (1 - b)); add(i + 1, j, a * (1 - b)); add(i, j + 1, (1 - a) * b); add(i + 1, j + 1, a * b);
    }
    iters = solveRelax(g, 'sor', sorOmegaOpt(n), 1e-10, 20000, tmp).iterations;
    ser.fill(0);
    const K = Math.round(p.K);
    if (p.q1) greenSquareGrid(n, p.x1, p.y1, p.q1, ser, K);
    if (p.q2) greenSquareGrid(n, p.x2, p.y2, p.q2, ser, K);
  };

  const phiAt = (arr: Float64Array, x: number, y: number) => {
    const s = clamp(x, 0, 1) * n, t = clamp(y, 0, 1) * n, i = Math.min(n - 1, Math.floor(s)), j = Math.min(n - 1, Math.floor(t)), a = s - i, b = t - j, m = n + 1;
    return (1 - a) * (1 - b) * arr[j * m + i] + a * (1 - b) * arr[j * m + i + 1] + (1 - a) * b * arr[(j + 1) * m + i] + a * b * arr[(j + 1) * m + i + 1];
  };

  const draw = () => {
    const p = ctx.params, arr = ctx.choices.show === 'fd' ? grid!.u : ser, m = n + 1;
    const qmax = Math.max(Math.abs(p.q1), Math.abs(p.q2), 0.2);
    const f = (x: number, y: number): V3 => [x, y, clamp(arr[Math.round(y * n) * m + Math.round(x * n)], -zCap * 1.4, zCap * 1.4)];
    const opts = { uRange: [0, 1] as [number, number], vRange: [0, 1] as [number, number], res: n, colormap: 'coolwarm' as const, colorRange: [-0.35 * qmax, 0.35 * qmax] as [number, number] };
    if (!surf || res !== n) { surf?.dispose(); surf = v.addSurface(f, opts); res = n; } else surf.update(f, opts);
    // field on the floor: E = −∇φ from the finite-difference solution
    if (ctx.toggles.field) {
      const E = (q: V3): V3 => { const d = 0.5 / n; return [-(phiAt(grid!.u, q[0] + d, q[1]) - phiAt(grid!.u, q[0] - d, q[1])) / (2 * d), -(phiAt(grid!.u, q[0], q[1] + d) - phiAt(grid!.u, q[0], q[1] - d)) / (2 * d), 0]; };
      if (!field) field = v.addVectorField(E, { planar: true, n: 16, bounds: { x: [0, 1], y: [0, 1], z: [0, 0] }, colormap: 'viridis' }); else field.update(E);
      field.visible(true);
    } else field?.visible(false);
    // equipotentials as line segments at their level
    equip?.dispose(); equip = null;
    if (ctx.toggles.equip) {
      const segs: number[] = [];
      for (let L = -8; L <= 8; L++) {
        if (!L) continue;
        const level = (L * 0.05 * qmax);
        for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
          const q = [arr[j * m + i] - level, arr[j * m + i + 1] - level, arr[(j + 1) * m + i + 1] - level, arr[(j + 1) * m + i] - level];
          const X = i / n, Y = j / n, h = 1 / n, e: number[][] = [];
          const cut = (s: number, t: number, x1: number, y1: number, x2: number, y2: number) => { if ((q[s] < 0) !== (q[t] < 0)) { const fr = q[s] / (q[s] - q[t]); e.push([x1 + (x2 - x1) * fr, y1 + (y2 - y1) * fr]); } };
          cut(0, 1, X, Y, X + h, Y); cut(1, 2, X + h, Y, X + h, Y + h); cut(2, 3, X + h, Y + h, X, Y + h); cut(3, 0, X, Y + h, X, Y);
          if (e.length >= 2 && Math.abs(level) < zCap * 1.4) segs.push(e[0][0], e[0][1], level + 0.003, e[1][0], e[1][1], level + 0.003);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
      equip = v.addObject(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: ctx.dark ? 0xffffff : 0x1b1f2a, transparent: true, opacity: 0.55 })));
    }
    // the charges
    const cs: [number, number, number][] = [[p.q1, p.x1, p.y1], [p.q2, p.x2, p.y2]];
    cs.forEach(([q, x, y], k) => {
      const at: V3 = [x, y, clamp(phiAt(grid!.u, x, y), -zCap * 1.4, zCap * 1.4) + 0.03];
      if (!pts[k]) pts[k] = v.addPoint(at, { color: q >= 0 ? '#ef6b73' : '#6aa9ff', size: 0.03, label: k ? 'q₂' : 'q₁', drag: { constrain: (r) => { const X = clamp(r[0], 0.04, 0.96), Y = clamp(r[1], 0.04, 0.96); return [X, Y, clamp(phiAt(grid!.u, X, Y), -zCap * 1.4, zCap * 1.4) + 0.03]; }, onDrag: (r) => { ctx.setParam(k ? 'x2' : 'x1', +r[0].toFixed(3)); ctx.setParam(k ? 'y2' : 'y1', +r[1].toFixed(3)); solve(); draw(); } } });
      else pts[k].set(at);
      ((pts[k].object as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(q >= 0 ? '#ef6b73' : '#6aa9ff');
      pts[k].visible(q !== 0);
    });
    report();
  };

  const report = () => {
    const p = ctx.params, g = grid!, m = n + 1, h = g.h;
    // Gauss: flux of E = −∇φ out through the walls, one-sided differences at the wall (second order)
    let flux = 0;
    for (let k = 1; k < n; k++) {
      const w = h;
      flux += w * ((-3 * 0 + 4 * g.u[1 * m + k] - g.u[2 * m + k]) / (2 * h));                 // bottom: −∂φ/∂n = ∂φ/∂y
      flux += w * ((4 * g.u[(n - 1) * m + k] - g.u[(n - 2) * m + k]) / (2 * h));               // top
      flux += w * ((4 * g.u[k * m + 1] - g.u[k * m + 2]) / (2 * h));                           // left
      flux += w * ((4 * g.u[k * m + n - 1] - g.u[k * m + n - 2]) / (2 * h));                   // right
    }
    let dmax = 0;
    for (let j = 1; j < n; j++) for (let i = 1; i < n; i++) {
      const x = i / n, y = j / n;
      if (Math.hypot(x - p.x1, y - p.y1) < 4 * h || Math.hypot(x - p.x2, y - p.y2) < 4 * h) continue;
      if (Math.abs(y - p.y1) < 1.5 * h || Math.abs(y - p.y2) < 1.5 * h) continue;
      dmax = Math.max(dmax, Math.abs(g.u[j * m + i] - ser[j * m + i]));
    }
    const Q = p.q1 + p.q2;
    ctx.setReadouts([
      { label: 'enclosed charge q₁ + q₂', value: fmt(Q, 4) },
      { label: 'flux of E out of the box (FD)', value: fmt(flux, 4), tone: Math.abs(flux - Q) < 0.03 * Math.max(1, Math.abs(Q)) ? 'good' : 'warn' },
      { label: 'charge induced on the walls', value: fmt(-flux, 4) },
      { label: 'φ at q₁ (FD, finite)', value: fmt(phiAt(g.u, p.x1, p.y1), 4) },
      { label: 'max |FD − series| away from charges', value: fmt(dmax, 3) },
      { label: 'SOR sweeps', value: String(iters) },
    ]);
    ctx.setNote(`Red charges are positive, blue negative; drag them. The surface is ${ctx.choices.show === 'fd' ? 'the finite-difference potential' : `the exact Green's-function series (${Math.round(p.K)} terms), clipped near the charges where it diverges like $-\\tfrac{q}{2\\pi}\\ln r$`}. Arrows on the floor: $\\mathbf E = -\\nabla\\varphi$; lines: equipotentials. The walls are grounded ($\\varphi = 0$), so field lines end on them.`);
  };

  const update = () => { n = Math.round(ctx.params.n); solve(); draw(); };
  return {
    update,
    csv() { const m = n + 1, xs: number[] = [], ys: number[] = [], a: number[] = [], b: number[] = []; for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { xs.push(i / n); ys.push(j / n); a.push(grid!.u[j * m + i]); b.push(ser[j * m + i]); } return csv(['x', 'y', 'phi_fd', 'phi_series'], [xs, ys, a, b]); },
    dispose() { v.clear(); },
  };
}
