// Calculus III — optimization: critical points classified by the Hessian
// (second-derivative test), and constrained optimization by Lagrange
// multipliers with the constraint curve lifted onto the surface (tutorial).

import type { DemoDef, DemoCtx, Readout, StepRow } from '../types';
import { Node, toTeX } from '../../core/expr';
import { contourSegments, chainSegments, criticalPoints2, lagrange2, streamline, Crit2, LagrangePoint, Vec2 } from '../../core/numeric/vcalc';
import type { V3 } from '../../engine/viewport3d';
import { fmt, deg, clamp, paramSpecs, paramVals, readFormula, derivs2, D2, palette, makeGraph, addSegments, addTris, splitParts, memo, showArrow } from './common';

type View3 = NonNullable<DemoCtx['view3d']>;
type Point = ReturnType<View3['addPoint']>;
type Arrow = ReturnType<View3['addArrow']>;
type Surf = ReturnType<View3['addSurface']>;

const pairs = (l: number[]): [number, number][] => { const o: [number, number][] = []; for (let i = 0; i + 1 < l.length; i += 2) o.push([l[i], l[i + 1]]); return o; };
const KIND_COL: Record<string, string> = { max: '#ff9f5a', min: '#4fd1d9', saddle: '#b48cff', degenerate: '#e6e9ef' };
const KIND_NAME: Record<string, string> = { max: 'local max', min: 'local min', saddle: 'saddle', degenerate: 'test fails (D = 0)' };

/** Eigenvalues of a symmetric 2×2 matrix [[a, b], [b, c]]. */
const eig2 = (a: number, b: number, c: number): [number, number] => { const m = (a + c) / 2, r = Math.hypot((a - c) / 2, b); return [m - r, m + r]; };

// ── critical points and the second-derivative test ────────────────────────
export const optimize: DemoDef = {
  id: 'calc3.optimize', module: 'calc3', title: 'Critical points and the second-derivative test',
  topic: 'Multivariable optimization · Hessian · second-derivative test',
  summary: 'Every critical point (∇f = 0) of f in the window is found by Newton’s method and classified by the Hessian: D = f_xx f_yy − f_xy² > 0 with f_xx > 0 is a minimum, with f_xx < 0 a maximum; D < 0 is a saddle; D = 0 says nothing. Near any point the surface looks like its second-order Taylor quadric.',
  tex: 'D = \\det\\begin{pmatrix} f_{xx} & f_{xy}\\\\ f_{xy} & f_{yy}\\end{pmatrix},\\qquad f(\\mathbf p+\\mathbf h)\\approx f(\\mathbf p)+\\nabla f\\cdot\\mathbf h+\\tfrac12\\,\\mathbf h^{\\mathsf T} H\\,\\mathbf h',
  view: 'split3d',
  params: [
    { key: 'x0', label: 'x₀ (drag the point)', value: 0.4, min: -6, max: 6, step: 0.01 },
    { key: 'y0', label: 'y₀', value: 1.6, min: -6, max: 6, step: 0.01 },
    { key: 'R', label: 'search window half-width', value: 2.2, min: 0.5, max: 6, step: 0.1 },
    ...paramSpecs(1, 1),
  ],
  toggles: [{ key: 'quad', label: 'Second-order Taylor quadric at the point', value: true }, { key: 'descent', label: 'Path of steepest descent from the point', value: true }],
  input: { label: 'z = f(x, y)', value: 'x^3/3 - a*x + y^3/3 - b*y', placeholder: 'e.g. x^4 + y^4 - 4xy' },
  experiments: [
    'The default has four critical points: a minimum, a maximum and two saddles. Drag the point onto each and compare the Taylor quadric (violet) with the surface.',
    'Slide a from 1 down through 0: the critical points at x = ±√a collide and vanish — at the moment of collision D = 0.',
    'Try x^3 - 3*x*y^2 (the monkey saddle): one critical point with D = 0, and it is neither max, min nor ordinary saddle.',
    'Try (x^4 + y^4)/4 - x*y and turn on the descent path: from almost every start it rolls into one of the two minima.',
    'Physics: equilibria of a particle in a potential U(x, y) are critical points; minima are stable, saddles and maxima unstable.',
  ],
  connections: ['calc3.gradient', 'calc3.lagrange', 'calc3.partials'],
  accuracy: 'Gradient and Hessian are exact symbolic derivatives. Critical points are solved numerically by Newton’s method from a 15 × 15 grid of starts (converged to |∇f| ≲ 10⁻¹²); a critical point that no start reaches can be missed, and degenerate ones (D = 0) are found only when Newton still converges. The descent path is integrated with RK4.',
  create(ctx) {
    const v = ctx.view3d!, plot = ctx.plot!;
    plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
    let src = '', node: Node | null = null, err = '';
    const graph = makeGraph(v, { opacity: 0.9 });
    const descent3 = addSegments(v, '#ffffff');
    let pt: Point | null = null, quad: Surf | null = null;
    const crits: Point[] = [];
    const findCrit = memo<Crit2[]>();
    const viewKey = memo<boolean>();
    const update = () => {
      if (ctx.input !== src) { src = ctx.input; const r = readFormula(src, ['x', 'y'], 1, 'a function f(x, y)'); if (r.items) { node = r.items[0]; err = ''; } else err = r.error; }
      ctx.warn(err);
      if (!node) return;
      const pv = paramVals(ctx.params), R = ctx.params.R;
      const d = derivs2(node, pv);
      const F = (x: number, y: number) => d.f([x, y]);
      const [zl, zh] = graph.draw(F, -R, R, -R, R);
      const cps = findCrit(`${src}|${pv.a}|${pv.b}|${R}`, () => criticalPoints2(F, (x, y) => [d.fx([x, y]), d.fy([x, y])], (x, y) => [d.fxx([x, y]), d.fxy([x, y]), d.fyy([x, y])], -R, R, -R, R, 14));
      const span = Math.max(2 * R, zh - zl);
      while (crits.length < cps.length) crits.push(v.addPoint([0, 0, 0], { color: '#ffffff', size: span * 0.022 }));
      crits.forEach((h, i) => { if (i < cps.length) { const c = cps[i]; h.set([c.x, c.y, c.f]); (h.object as unknown as { material: { color: { set(c: string): void }; emissive: { set(c: string): void } } }).material.color.set(KIND_COL[c.kind]); (h.object as unknown as { material: { emissive: { set(c: string): void } } }).material.emissive.set(KIND_COL[c.kind]); h.visible(true); } else h.visible(false); });
      const x0 = clamp(ctx.params.x0, -R, R), y0 = clamp(ctx.params.y0, -R, R);
      const z0 = F(x0, y0), gx = d.fx([x0, y0]), gy = d.fy([x0, y0]), a = d.fxx([x0, y0]), b = d.fxy([x0, y0]), c = d.fyy([x0, y0]);
      if (!pt) pt = v.addPoint([x0, y0, z0], { color: '#ffffff', drag: { constrain: ([X, Y]) => { const r = ctx.params.R; const p = clamp(X, -r, r), q = clamp(Y, -r, r); return [p, q, F(p, q)]; }, onDrag: ([X, Y]) => { ctx.setParam('x0', X); ctx.setParam('y0', Y); update(); } } });
      pt.set([x0, y0, z0]);
      // the second-order Taylor quadric on a patch around the point
      const hw = R * 0.35;
      const Q = (u: number, w: number): V3 | null => { const hx = u - x0, hy = w - y0; const z = z0 + gx * hx + gy * hy + 0.5 * (a * hx * hx + 2 * b * hx * hy + c * hy * hy); return Number.isFinite(z) ? [u, w, z] : null; };
      const qo = { uRange: [x0 - hw, x0 + hw] as [number, number], vRange: [y0 - hw, y0 + hw] as [number, number], res: 24, colorBy: 'uniform' as const, color: '#b48cff', opacity: 0.6 };
      if (!quad) quad = v.addSurface(Q, qo); else quad.update(Q, qo);
      quad.visible(!!ctx.toggles.quad && Number.isFinite(z0));
      // steepest descent: follow −∇f (arc-length parametrized RK4)
      let path: V3[] = [];
      if (ctx.toggles.descent) {
        path = streamline((p) => [-d.fx([p[0], p[1]]), -d.fy([p[0], p[1]]), 0], [x0, y0, 0], R * 0.01, 1500, { lo: [-R, -R, -1], hi: [R, R, 1] });
        const segs: number[] = [];
        for (let i = 0; i + 1 < path.length; i++) segs.push(path[i][0], path[i][1], F(path[i][0], path[i][1]), path[i + 1][0], path[i + 1][1], F(path[i + 1][0], path[i + 1][1]));
        descent3.set(segs);
      }
      descent3.handle.visible(!!ctx.toggles.descent);
      // the contour map
      const p = palette(ctx.dark);
      const levels: number[][][] = [];
      for (let k = 1; k <= 14; k++) { const z = zl + ((zh - zl) * k) / 15; levels.push(chainSegments(contourSegments((x, y) => F(x, y) - z, -R, R, -R, R, 90, 90))); }
      viewKey(`${R}`, () => { plot.setView({ x0: -R * 1.02, x1: R * 1.02, y0: -R * 1.02, y1: R * 1.02 }); return true; });
      plot.setDraw((g) => {
        g.heatmap((x, y) => (Math.abs(x) <= R && Math.abs(y) <= R ? F(x, y) : NaN), [zl, zh], 'turbo', 150);
        for (const L of levels) for (const l of L) g.path(pairs(l), { color: 'rgba(0,0,0,0.42)', width: 1.1 });
        if (ctx.toggles.descent && path.length > 1) { g.path(path.map((q) => [q[0], q[1]] as [number, number]), { color: 'rgba(0,0,0,0.7)', width: 4.5 }); g.path(path.map((q) => [q[0], q[1]] as [number, number]), { color: '#ffffff', width: 2 }); }
        for (const cp of cps) {
          g.point([cp.x, cp.y], 7.5, { fill: KIND_COL[cp.kind], color: '#000000', width: 1.5 });
          g.text([cp.x, cp.y], cp.kind === 'degenerate' ? 'D = 0' : cp.kind, { color: '#ffffff', font: '600 12.5px Inter, sans-serif' }, 9, -8);
        }
        g.handle({ id: 'p', at: [x0, y0], color: '#ffffff', onDrag: ([X, Y]) => { ctx.setParam('x0', clamp(X, -R, R)); ctx.setParam('y0', clamp(Y, -R, R)); update(); } });
      });
      void p;
      const D = a * c - b * b, [l1, l2] = eig2(a, b, c);
      const rows: Readout[] = [
        { label: 'f(x₀, y₀)', value: fmt(z0, 6) },
        { label: '∇f', value: `(${fmt(gx, 4)}, ${fmt(gy, 4)})`, tone: Math.hypot(gx, gy) < 1e-3 ? 'good' : undefined },
        { label: 'Hessian [[f_xx, f_xy], [f_xy, f_yy]]', value: `[[${fmt(a, 4)}, ${fmt(b, 4)}], [${fmt(b, 4)}, ${fmt(c, 4)}]]` },
        { label: 'D = f_xx f_yy − f_xy²', value: fmt(D, 5), tone: D > 0 ? 'good' : D < 0 ? 'warn' : 'muted' },
        { label: 'eigenvalues of H (curvatures)', value: `${fmt(l1, 4)}, ${fmt(l2, 4)}` },
        { label: 'critical points found', value: String(cps.length) },
        ...cps.slice(0, 8).map((cp) => ({ label: `(${fmt(cp.x, 4)}, ${fmt(cp.y, 4)})`, value: `${KIND_NAME[cp.kind]}, f = ${fmt(cp.f, 4)}, D = ${fmt(cp.D, 3)}`, tone: cp.kind === 'max' || cp.kind === 'min' ? 'good' as const : cp.kind === 'saddle' ? 'warn' as const : 'muted' as const })),
      ];
      if (d.nxx) rows.push({ label: 'f_xx', value: toTeX(d.nxx), tex: true });
      if (d.nxy) rows.push({ label: 'f_xy', value: toTeX(d.nxy), tex: true });
      if (d.nyy) rows.push({ label: 'f_yy', value: toTeX(d.nyy), tex: true });
      ctx.setReadouts(rows);
      const steps: StepRow[] = [{ title: 'Gradient', tex: `\\nabla f = \\left(${d.nx ? toTeX(d.nx) : '\\cdot'},\\; ${d.ny ? toTeX(d.ny) : '\\cdot'}\\right) = \\mathbf 0`, detail: 'Critical points solve both equations at once (here numerically, by Newton’s method).' }];
      for (const cp of cps.slice(0, 8)) steps.push({ title: `(${fmt(cp.x, 5)}, ${fmt(cp.y, 5)})`, tex: `D = (${fmt(cp.fxx, 4)})(${fmt(cp.fyy, 4)}) - (${fmt(cp.fxy, 4)})^2 = ${fmt(cp.D, 5)}`, rule: KIND_NAME[cp.kind] });
      ctx.setSteps(steps);
      ctx.setNote(`At the point the Hessian has eigenvalues $${fmt(l1, 3)}$ and $${fmt(l2, 3)}$: ${l1 > 0 && l2 > 0 ? 'both positive, the quadric is a bowl (curving up in every direction)' : l1 < 0 && l2 < 0 ? 'both negative, the quadric is a cap (curving down in every direction)' : l1 * l2 < 0 ? 'opposite signs, the quadric is a saddle' : 'one is zero, the quadric is a trough'}. At a critical point that shape *is* the local picture — that is the second-derivative test: $D = \\lambda_1\\lambda_2$ and $f_{xx}$ tells which bowl. Orange = maximum, cyan = minimum, violet = saddle.`);
      if (!d.exact2) ctx.warn('Some second derivatives have no symbolic formula; they are computed by finite differences.');
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── Lagrange multipliers ───────────────────────────────────────────────────
const LG = { angle: NaN, nearMax: false, nearMin: false, c: NaN };

export const lagrange: DemoDef = {
  id: 'calc3.lagrange', module: 'calc3', title: 'Lagrange multipliers',
  topic: 'Constrained optimization · Lagrange multipliers',
  summary: 'Maximize f(x, y) while staying on the curve g(x, y) = c. At a constrained extremum the level curve of f just touches the constraint, so their normals line up: ∇f = λ∇g. The multiplier λ is the rate at which the best value changes as the constraint level c is relaxed.',
  tex: '\\nabla f = \\lambda\\,\\nabla g,\\qquad g(x,y) = c,\\qquad \\lambda = \\frac{d f^{*}}{d c}',
  view: 'split3d',
  params: [
    { key: 'x0', label: 'x (drag the point along the constraint)', value: 1.6, min: -6, max: 6, step: 0.001 },
    { key: 'y0', label: 'y', value: 0.4, min: -6, max: 6, step: 0.001 },
    { key: 'c', label: 'constraint level c  (g = c)', value: 2, min: -5, max: 8, step: 0.01 },
    { key: 'R', label: 'domain half-width', value: 2.2, min: 1, max: 6, step: 0.1 },
    ...paramSpecs(1, 1),
  ],
  toggles: [{ key: 'fence', label: 'Fence from the constraint up to the surface', value: true }, { key: 'cands', label: 'Mark all solutions of ∇f = λ∇g', value: true }],
  input: { label: 'f(x, y) ; g(x, y)   (constraint g = c)', value: 'x*y ; x^2 + y^2', placeholder: 'f ; g' },
  experiments: [
    'Drag the gold point along the constraint and watch f: at its largest value the blue and red arrows become parallel.',
    'Raise c: the circle grows and the maximum of xy grows like c/2 — the readout compares that rate with λ.',
    'Change the constraint to an ellipse, x^2/4 + y^2, or a line, x + 2y (with c = 2).',
    'Try f = x + y ; g = x^2 + y^2: the gradients align at (±√(c/2), ±√(c/2)) and λ has opposite signs at the max and the min.',
    'Physics: a bead on a wire in a potential U settles where ∇U = λ∇g; λ∇g is the force the wire exerts (the constraint force).',
  ],
  connections: ['calc3.optimize', 'calc3.gradient'],
  accuracy: 'Gradients and second derivatives are exact (symbolic). The constrained critical points are found numerically by Newton’s method on ∇f = λ∇g, g = c, started from points along the traced constraint curve, and classified by the bordered Hessian. The rate df*/dc is a numerical central difference (δc = 10⁻⁴).',
  tutorial: [
    { text: 'The surface is $f(x, y) = xy$ and the gold curve is the **constraint** $x^2 + y^2 = 2$. Walking along the constraint you trace the gold curve on the surface — the **fence** shows its height. The question: where on this walk is $f$ highest?', task: 'Drag the gold point (on the map or on the surface) to where $f$ is largest along the circle.', set: { input: 'x*y ; x^2 + y^2', params: { c: 2, x0: 1.6, y0: -0.4 }, toggles: { fence: true, cands: false } }, done: () => LG.nearMax },
    { text: 'At the top of the walk, the level curve of $f$ through the point (dashed) **touches** the constraint instead of crossing it — if it crossed, you could walk on to higher values. Touching curves have parallel normals, and normals are gradients: $$\\nabla f = \\lambda\\,\\nabla g.$$', task: 'Make the angle between $\\nabla f$ (blue) and $\\nabla g$ (red) less than 1°.', done: () => LG.angle < 1 },
    { text: 'So we solve three equations — $f_x = \\lambda g_x$, $f_y = \\lambda g_y$, $g = c$ — for $x, y, \\lambda$. MathVerse solves them by Newton’s method and marks **every** solution: maxima, minima (and degenerate cases). The bordered Hessian tells which is which.', task: 'Turn on **Mark all solutions**.', set: { toggles: { cands: true } }, done: (c) => !!c.toggles.cands },
    { text: '**What is λ?** If the constraint level $c$ changes, the best value $f^*$ changes at the rate $df^*/dc = \\lambda$. Economists call it a shadow price; here $f^* = c/2$ so $\\lambda = 1/2$.', task: 'Change $c$ and compare **λ** with the measured **df*/dc** in the readouts.', done: () => Math.abs(LG.c - 2) > 0.2 },
    { text: 'The constraint can be any curve. With a line $x + 2y = c$ only a maximum of $xy$ exists (the line is unbounded, so there is no minimum).', task: 'Look at the line constraint and find its maximum.', set: { input: 'x*y ; x + 2y', params: { c: 2, x0: 1.5, y0: 0.25 } }, done: () => LG.nearMax },
    { text: '**Physics.** A bead slides without friction on a wire $g = c$ in a potential $U$. It rests where the force $-\\nabla U$ is balanced by the wire’s push, which is normal to the wire: $\\nabla U = \\lambda\\nabla g$. The multiplier is (up to sign and $|\\nabla g|$) the size of the constraint force. Try your own $f$ and $g$.', set: { input: 'x^2 - y^2 + x ; x^2/4 + y^2', params: { c: 1, x0: 1, y0: 0.8 } } },
  ],
  create(ctx) {
    const v = ctx.view3d!, plot = ctx.plot!;
    plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
    let src = '', fN: Node | null = null, gN: Node | null = null, err = '';
    const graph = makeGraph(v, { opacity: 0.85 });
    const lift = addSegments(v, '#f2c14e'), base = addSegments(v, '#f2c14e', 0.7), fence = addTris(v, '#f2c14e', 0.28);
    let pt: Point | null = null, gfA: Arrow | null = null, ggA: Arrow | null = null;
    const cands: Point[] = [];
    const solveMemo = memo<LagrangePoint[]>();
    const viewKey = memo<boolean>();
    LG.nearMax = LG.nearMin = false;
    const update = () => {
      if (ctx.input !== src) {
        src = ctx.input;
        const ps = splitParts(src);
        if (ps.length < 2) err = 'Type f(x, y), a semicolon, then the constraint function g(x, y) (the level c is the slider)';
        else {
          const a = readFormula(ps[0], ['x', 'y'], 1, 'f(x, y)'), b = readFormula(ps[1].replace(/=.*$/, ''), ['x', 'y'], 1, 'g(x, y)');
          if (a.items && b.items) { fN = a.items[0]; gN = b.items[0]; err = ''; } else err = (a.error ?? b.error)!;
        }
      }
      ctx.warn(err);
      if (!fN || !gN) return;
      const pv = paramVals(ctx.params), R = ctx.params.R, cl = ctx.params.c;
      LG.c = cl;
      const df: D2 = derivs2(fN, pv), dg: D2 = derivs2(gN, pv);
      const F = (x: number, y: number) => df.f([x, y]), Gc = (x: number, y: number) => dg.f([x, y]) - cl;
      const [zl, zh] = graph.draw(F, -R, R, -R, R);
      const floor = v.getBounds().z[0];
      // the constraint curve
      const segs = contourSegments(Gc, -R, R, -R, R, 160, 160);
      const lines = chainSegments(segs);
      const ls: number[] = [], bs: number[] = [], tris: number[] = [];
      for (let i = 0; i < segs.length; i += 4) {
        const [ax, ay, bx, by] = [segs[i], segs[i + 1], segs[i + 2], segs[i + 3]];
        const za = F(ax, ay), zb = F(bx, by);
        ls.push(ax, ay, za, bx, by, zb); bs.push(ax, ay, floor, bx, by, floor);
        if (Number.isFinite(za + zb)) tris.push(ax, ay, floor, bx, by, floor, bx, by, zb, ax, ay, floor, bx, by, zb, ax, ay, za);
      }
      lift.set(ls); base.set(bs); fence.set(tris); fence.handle.visible(!!ctx.toggles.fence);
      // project the point onto the constraint (Newton along ∇g)
      const project = (x: number, y: number): Vec2 | null => {
        for (let k = 0; k < 30; k++) {
          const gv = Gc(x, y), gx = dg.fx([x, y]), gy = dg.fy([x, y]), m = gx * gx + gy * gy;
          if (!Number.isFinite(gv) || m < 1e-24) return null;
          if (Math.abs(gv) < 1e-12) return [x, y];
          const s = gv / m; x -= s * gx; y -= s * gy;
        }
        return Math.abs(Gc(x, y)) < 1e-8 ? [x, y] : null;
      };
      let P = project(ctx.params.x0, ctx.params.y0);
      if (!P && segs.length) {   // jump to the nearest traced point of the constraint
        let best = Infinity;
        for (let i = 0; i < segs.length; i += 2) { const dd = Math.hypot(segs[i] - ctx.params.x0, segs[i + 1] - ctx.params.y0); if (dd < best) { best = dd; P = [segs[i], segs[i + 1]]; } }
      }
      // all solutions of the Lagrange system
      const sols = solveMemo(`${src}|${pv.a}|${pv.b}|${cl}|${R}`, () => {
        const seeds: Vec2[] = [];
        const step = Math.max(1, Math.floor(segs.length / 4 / 60));
        for (let i = 0; i < segs.length; i += 4 * step) seeds.push([segs[i], segs[i + 1]]);
        return lagrange2(F, (x, y) => [df.fx([x, y]), df.fy([x, y])], (x, y) => [df.fxx([x, y]), df.fxy([x, y]), df.fyy([x, y])], Gc, (x, y) => [dg.fx([x, y]), dg.fy([x, y])], (x, y) => [dg.fxx([x, y]), dg.fxy([x, y]), dg.fyy([x, y])], seeds, R)
          .filter((s) => Math.abs(s.x) <= R * 1.001 && Math.abs(s.y) <= R * 1.001);
      });
      const span = Math.max(2 * R, zh - zl);
      while (cands.length < sols.length) cands.push(v.addPoint([0, 0, 0], { color: '#ffffff', size: span * 0.02 }));
      cands.forEach((h, i) => {
        if (i < sols.length && ctx.toggles.cands) { const s = sols[i]; h.set([s.x, s.y, s.f]); const m = (h.object as unknown as { material: { color: { set(c: string): void }; emissive: { set(c: string): void } } }).material; m.color.set(KIND_COL[s.kind]); m.emissive.set(KIND_COL[s.kind]); h.visible(true); } else h.visible(false);
      });
      const p = palette(ctx.dark);
      if (!P) {
        ctx.setReadouts([{ label: 'constraint', value: `g = ${fmt(cl)} has no points in the window`, tone: 'warn' }]);
        pt?.visible(false); gfA?.visible(false); ggA?.visible(false);
        plot.setDraw((g) => { g.heatmap((x, y) => (Math.abs(x) <= R && Math.abs(y) <= R ? F(x, y) : NaN), [zl, zh], 'turbo', 140); });
        return;
      }
      const [x0, y0] = P;
      if (Math.abs(x0 - ctx.params.x0) > 1e-9 || Math.abs(y0 - ctx.params.y0) > 1e-9) { ctx.setParam('x0', x0); ctx.setParam('y0', y0); }
      const z0 = F(x0, y0), fx = df.fx([x0, y0]), fy = df.fy([x0, y0]), gx = dg.fx([x0, y0]), gy = dg.fy([x0, y0]);
      const nf = Math.hypot(fx, fy), ng = Math.hypot(gx, gy);
      const cosA = nf > 0 && ng > 0 ? (fx * gx + fy * gy) / (nf * ng) : 1;
      const angle = deg(Math.acos(Math.min(1, Math.abs(cosA))));
      const lam = (fx * gx + fy * gy) / (ng * ng || 1);
      LG.angle = angle;
      const close = (s: LagrangePoint) => Math.hypot(s.x - x0, s.y - y0) < 0.04 * R;
      LG.nearMax = sols.some((s) => s.kind === 'max' && close(s)); LG.nearMin = sols.some((s) => s.kind === 'min' && close(s));
      if (!pt) pt = v.addPoint([x0, y0, z0], { color: '#f2c14e', drag: { onDrag: ([X, Y]) => { const q = project(X, Y); if (q) { ctx.setParam('x0', q[0]); ctx.setParam('y0', q[1]); update(); } } } });
      pt.set([x0, y0, z0]); pt.visible(true);
      const sc = (R * 0.45) / Math.max(nf, ng, 1e-12);
      if (!gfA) gfA = v.addArrow([0, 0, 0], [1, 0, 0], { color: '#6aa9ff', label: '∇f' });
      if (!ggA) ggA = v.addArrow([0, 0, 0], [1, 0, 0], { color: '#ef6b73', label: '∇g' });
      showArrow(gfA, [x0, y0, floor], [fx * sc, fy * sc, 0]); showArrow(ggA, [x0, y0, floor], [gx * sc, gy * sc, 0]);
      // the map
      const levels: number[][][] = [];
      for (let k = 1; k <= 12; k++) { const z = zl + ((zh - zl) * k) / 13; levels.push(chainSegments(contourSegments((x, y) => F(x, y) - z, -R, R, -R, R, 90, 90))); }
      const through = chainSegments(contourSegments((x, y) => F(x, y) - z0, -R, R, -R, R, 120, 120));
      viewKey(`${R}`, () => { plot.setView({ x0: -R * 1.02, x1: R * 1.02, y0: -R * 1.02, y1: R * 1.02 }); return true; });
      plot.setDraw((g) => {
        g.heatmap((x, y) => (Math.abs(x) <= R && Math.abs(y) <= R ? F(x, y) : NaN), [zl, zh], 'turbo', 150);
        for (const L of levels) for (const l of L) g.path(pairs(l), { color: 'rgba(0,0,0,0.38)', width: 1 });
        for (const l of through) g.path(pairs(l), { color: '#ffffff', width: 1.8, dash: [6, 4] });
        for (const l of lines) g.path(pairs(l), { color: 'rgba(0,0,0,0.75)', width: 6 });
        for (const l of lines) g.path(pairs(l), { color: '#f2c14e', width: 3 });
        const s2 = (R * 0.35) / Math.max(nf, ng, 1e-12);
        for (const [vx, vy, col] of [[fx, fy, '#6aa9ff'], [gx, gy, '#ef6b73']] as [number, number, string][]) {
          g.arrow([x0, y0], [x0 + vx * s2, y0 + vy * s2], { color: 'rgba(0,0,0,0.75)', width: 5.5 });
          g.arrow([x0, y0], [x0 + vx * s2, y0 + vy * s2], { color: col, width: 3 });
        }
        g.text([x0 + fx * s2, y0 + fy * s2], '∇f', { color: '#ffffff', font: '600 14px Inter, sans-serif' }, 6, -6);
        g.text([x0 + gx * s2, y0 + gy * s2], '∇g', { color: '#ffffff', font: '600 14px Inter, sans-serif' }, 6, 14);
        if (ctx.toggles.cands) for (const s of sols) { g.point([s.x, s.y], 7, { fill: KIND_COL[s.kind], color: '#000000', width: 1.5 }); g.text([s.x, s.y], s.kind === 'degenerate' ? '?' : s.kind, { color: '#ffffff', font: '600 12.5px Inter, sans-serif' }, 9, 16); }
        g.handle({ id: 'p', at: [x0, y0], color: '#f2c14e', onDrag: ([X, Y]) => { const q = project(X, Y); if (q) { ctx.setParam('x0', q[0]); ctx.setParam('y0', q[1]); update(); } } });
      });
      void p;
      // λ as the rate df*/dc, measured at the best maximum by re-solving at c ± δ
      const best = sols.filter((s) => s.kind === 'max').sort((s, t) => t.f - s.f)[0];
      let rate = NaN;
      if (best) {
        const dc = 1e-4;
        const at = (cc: number) => lagrange2(F, (x, y) => [df.fx([x, y]), df.fy([x, y])], (x, y) => [df.fxx([x, y]), df.fxy([x, y]), df.fyy([x, y])], (x, y) => dg.f([x, y]) - cc, (x, y) => [dg.fx([x, y]), dg.fy([x, y])], (x, y) => [dg.fxx([x, y]), dg.fxy([x, y]), dg.fyy([x, y])], [[best.x, best.y]], R)[0];
        const up = at(cl + dc), dn = at(cl - dc);
        if (up && dn) rate = (up.f - dn.f) / (2 * dc);
      }
      const rows: Readout[] = [
        { label: 'point on g = c', value: `(${fmt(x0, 5)}, ${fmt(y0, 5)})` },
        { label: 'f there', value: fmt(z0, 7) },
        { label: '∇f', value: `(${fmt(fx, 4)}, ${fmt(fy, 4)})` },
        { label: '∇g', value: `(${fmt(gx, 4)}, ${fmt(gy, 4)})` },
        { label: 'angle between ∇f and ∇g', value: `${fmt(angle, 3)}°`, tone: angle < 1 ? 'good' : 'muted' },
        { label: 'λ = ∇f·∇g / |∇g|² here', value: fmt(lam, 6) },
      ];
      for (const s of sols.slice(0, 6)) rows.push({ label: `${KIND_NAME[s.kind] ?? s.kind} (${fmt(s.x, 4)}, ${fmt(s.y, 4)})`, value: `f = ${fmt(s.f, 6)}, λ = ${fmt(s.lambda, 5)}`, tone: s.kind === 'max' ? 'good' : s.kind === 'min' ? 'warn' : 'muted' });
      if (best) rows.push({ label: 'df*/dc at the best max (numerical)', value: Number.isFinite(rate) ? `${fmt(rate, 6)}  vs λ = ${fmt(best.lambda, 6)}` : '—' });
      if (dg.nx && dg.ny) rows.push({ label: '∇g', value: `\\left(${toTeX(dg.nx)},\\ ${toTeX(dg.ny)}\\right)`, tex: true });
      ctx.setReadouts(rows);
      ctx.setSteps([
        { title: 'Lagrange conditions', tex: `${df.nx ? toTeX(df.nx) : 'f_x'} = \\lambda\\,${dg.nx ? toTeX(dg.nx) : 'g_x'},\\quad ${df.ny ? toTeX(df.ny) : 'f_y'} = \\lambda\\,${dg.ny ? toTeX(dg.ny) : 'g_y'},\\quad ${toTeX(gN)} = ${fmt(cl)}` },
        ...sols.slice(0, 6).map((s) => ({ title: `(${fmt(s.x, 6)}, ${fmt(s.y, 6)})`, tex: `\\lambda = ${fmt(s.lambda, 6)},\\quad f = ${fmt(s.f, 8)}`, rule: `${KIND_NAME[s.kind] ?? s.kind} (bordered Hessian ${fmt(s.bordered, 3)})` })),
      ]);
      ctx.setNote(`Along the gold constraint the height of the surface varies; the white dashed curve is the level curve of $f$ through the point. Where it is **tangent** to the constraint, $\\nabla f$ (blue) and $\\nabla g$ (red) are parallel: the angle is now ${fmt(angle, 3)}°. On the surface, the fence rises from the constraint to the graph — its top edge is $f$ restricted to the curve.`);
      void p;
    };
    return { update, dispose() { v.clear(); } };
  },
};
