// Calculus III — double integrals as limits of Riemann boxes over adjustable
// regions, and change of variables: a grid mapped by T(u, v) with each area
// element scaled by |det J| (tutorial).

import * as THREE from 'three';
import type { DemoDef, DemoCtx, Readout } from '../types';
import { Node, toTeX, simplify, compile } from '../../core/expr';
import { integrate2e, riemann2, polygonArea, SampleRule } from '../../core/numeric/vcalc';
import { colormap } from '../../engine/colors';
import type { V3 } from '../../engine/viewport3d';
import { fmt, fmtQ, clamp, paramSpecs, paramVals, readFormula, palette, addSegments, addBoxes, dSym, memo, fitBounds } from './common';

type View3 = NonNullable<DemoCtx['view3d']>;
type Surf = ReturnType<View3['addSurface']>;
type Point = ReturnType<View3['addPoint']>;

interface Region { x0: number; x1: number; lo: (x: number) => number; hi: (x: number) => number; tex: (f: string) => string; name: string }

function regionOf(kind: string, P: Record<string, number>): Region {
  const xa = Math.min(P.xa, P.xb), xb = Math.max(P.xa, P.xb), ya = Math.min(P.ya, P.yb), yb = Math.max(P.ya, P.yb), Rd = P.Rd;
  const f3 = (v: number) => fmt(v, 3);
  switch (kind) {
    case 'typeI': return { name: `between y = ${f3(ya)} + x²/4 and y = ${f3(yb)}`, x0: xa, x1: xb, lo: (x) => ya + (x * x) / 4, hi: () => yb, tex: (f) => `\\int_{${f3(xa)}}^{${f3(xb)}}\\int_{${f3(ya)}+x^2/4}^{${f3(yb)}} ${f}\\,dy\\,dx` };
    case 'disk': return { name: `disk x² + y² ≤ ${f3(Rd)}²`, x0: -Rd, x1: Rd, lo: (x) => -Math.sqrt(Math.max(0, Rd * Rd - x * x)), hi: (x) => Math.sqrt(Math.max(0, Rd * Rd - x * x)), tex: (f) => `\\int_{-${f3(Rd)}}^{${f3(Rd)}}\\int_{-\\sqrt{${f3(Rd * Rd)}-x^2}}^{\\sqrt{${f3(Rd * Rd)}-x^2}} ${f}\\,dy\\,dx` };
    case 'tri': return { name: 'triangle', x0: xa, x1: xb, lo: () => ya, hi: (x) => ya + ((yb - ya) * (x - xa)) / (xb - xa || 1), tex: (f) => `\\int_{${f3(xa)}}^{${f3(xb)}}\\int_{${f3(ya)}}^{${f3(ya)} + ${f3((yb - ya) / (xb - xa || 1))}(x - ${f3(xa)})} ${f}\\,dy\\,dx` };
    default: return { name: `rectangle [${f3(xa)}, ${f3(xb)}] × [${f3(ya)}, ${f3(yb)}]`, x0: xa, x1: xb, lo: () => ya, hi: () => yb, tex: (f) => `\\int_{${f3(xa)}}^{${f3(xb)}}\\int_{${f3(ya)}}^{${f3(yb)}} ${f}\\,dy\\,dx` };
  }
}

// ── double integrals ───────────────────────────────────────────────────────
export const double: DemoDef = {
  id: 'calc3.double', module: 'calc3', title: 'Double integrals: Riemann boxes under a surface',
  topic: 'Double integrals · iterated integrals · regions of type I',
  summary: 'The volume under z = f(x, y) over a region is the limit of sums of thin boxes: chop the region into n × n cells, stand a box of height f(sample point) on each, add up. Change the region and its boundaries and watch the sum and the exact value move together.',
  tex: '\\iint_R f\\,dA = \\lim_{n\\to\\infty}\\sum_{i,j} f(x_i^*, y_j^*)\\,\\Delta x\\,\\Delta y = \\int_a^b\\!\\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx',
  view: '3d',
  params: [
    { key: 'n', label: 'boxes per side n', value: 8, min: 1, max: 40, step: 1 },
    { key: 'xa', label: 'x from (a)', value: -2, min: -4, max: 4, step: 0.01 },
    { key: 'xb', label: 'x to (b)', value: 2, min: -4, max: 4, step: 0.01 },
    { key: 'ya', label: 'y from (c)', value: -1.5, min: -4, max: 4, step: 0.01 },
    { key: 'yb', label: 'y to (d)', value: 1.5, min: -4, max: 4, step: 0.01 },
    { key: 'Rd', label: 'disk radius', value: 2, min: 0.2, max: 4, step: 0.01 },
    ...paramSpecs(1, 1),
  ],
  choices: [
    { key: 'region', label: 'Region', value: 'rect', options: [['rect', 'Rectangle a ≤ x ≤ b, c ≤ y ≤ d'], ['typeI', 'Between y = c + x²/4 and y = d'], ['tri', 'Triangle under the line from (a, c) to (b, d)'], ['disk', 'Disk of radius R']] },
    { key: 'rule', label: 'Sample point in each cell', value: 'mid', options: [['ll', 'lower-left corner'], ['mid', 'midpoint'], ['ur', 'upper-right corner']] },
  ],
  toggles: [{ key: 'boxes', label: 'Riemann boxes', value: true }, { key: 'surface', label: 'Surface over the region', value: true }, { key: 'centroid', label: 'Centre of mass (f as a density)', value: false }],
  input: { label: 'z = f(x, y)', value: '2 + a*sin(x)*cos(y)', placeholder: 'e.g. 4 - x^2 - y^2' },
  experiments: [
    'Double n from 8 to 16 with the midpoint rule: the error falls by about 4 (second order). With a corner rule it only halves.',
    'Switch to the disk: cells that straddle the boundary are kept or dropped whole, so the sum converges more slowly — the boundary, not f, limits the accuracy.',
    'For the disk, the readouts also compute the same integral in polar coordinates — compare it with the Cartesian one.',
    'Make f negative somewhere (a = 3): boxes below the plane count negatively — the integral is signed volume.',
    'Physics: with f a surface density (kg/m²) the integral is the mass of a plate; turn on the centre of mass.',
  ],
  connections: ['calc3.triple', 'calc3.jacobian', 'calc3.green'],
  accuracy: 'The Riemann sum is computed exactly as drawn. The integral is nested adaptive Gauss–Kronrod quadrature; its error estimate (outer estimate + the largest inner estimate × width) is shown. Boxes on a curved boundary are included when their sample point is inside the region.',
  create(ctx) {
    const v = ctx.view3d!;
    let src = '', node: Node | null = null, err = '';
    const st = { fitted: false };
    const boxes = addBoxes(v, 1700);
    const edge = addSegments(v, '#f2c14e'), edgeTop = addSegments(v, '#f2c14e', 0.6);
    let surf: Surf | null = null, floorS: Surf | null = null, cm: Point | null = null;
    const integ = memo<{ I: ReturnType<typeof integrate2e>; mx: number; my: number; area: number; polar?: ReturnType<typeof integrate2e> }>();
    const update = () => {
      if (ctx.input !== src) { src = ctx.input; const r = readFormula(src, ['x', 'y'], 1, 'a function f(x, y)'); if (r.items) { node = r.items[0]; err = ''; } else err = r.error; }
      ctx.warn(err);
      if (!node) return;
      const pv = paramVals(ctx.params), fc = compile(node, ['x', 'y'], pv);
      const f = (x: number, y: number) => fc([x, y]);
      const reg = regionOf(ctx.choices.region, ctx.params);
      if (!(reg.x1 > reg.x0)) { ctx.warn('The region is empty: make b larger than a.'); return; }
      // bounding box of the region
      let ylo = Infinity, yhi = -Infinity, zlo = 0, zhi = 0;
      for (let i = 0; i <= 80; i++) { const x = reg.x0 + ((reg.x1 - reg.x0) * i) / 80, a = reg.lo(x), b = reg.hi(x); if (b >= a) { ylo = Math.min(ylo, a); yhi = Math.max(yhi, b); for (let j = 0; j <= 20; j++) { const z = f(x, a + ((b - a) * j) / 20); if (Number.isFinite(z)) { zlo = Math.min(zlo, z); zhi = Math.max(zhi, z); } } } }
      if (!Number.isFinite(ylo)) { ctx.warn('The region is empty for these limits (the lower boundary is above the upper one).'); return; }
      const m = Math.max(Math.abs(reg.x0), Math.abs(reg.x1), Math.abs(ylo), Math.abs(yhi)) * 1.1;
      fitBounds(v, { x: [-m, m], y: [-m, m], z: [Math.min(zlo, 0), Math.max(zhi, 0.5)] }, st);
      // surface and region over the parameter square
      const S = (u: number, w: number, z0?: number): V3 | null => { const x = reg.x0 + (reg.x1 - reg.x0) * u, a = reg.lo(x), b = reg.hi(x); if (b < a) return null; const y = a + (b - a) * w; const z = z0 ?? f(x, y); return Number.isFinite(z) ? [x, y, z] : null; };
      const so = { uRange: [0, 1] as [number, number], vRange: [0, 1] as [number, number], res: 60, colorBy: 'height' as const, opacity: 0.5, colorRange: [zlo, zhi] as [number, number] };
      if (!surf) surf = v.addSurface((u, w) => S(u, w), so); else surf.update((u, w) => S(u, w), so);
      surf.visible(!!ctx.toggles.surface);
      const fo = { uRange: [0, 1] as [number, number], vRange: [0, 1] as [number, number], res: 40, colorBy: 'uniform' as const, color: '#f2c14e', opacity: 0.22 };
      if (!floorS) floorS = v.addSurface((u, w) => S(u, w, 0.001), fo); else floorS.update((u, w) => S(u, w, 0.001), fo);
      // boundary on the floor and on the surface
      const bpts: [number, number][] = [];
      for (let i = 0; i <= 120; i++) { const x = reg.x0 + ((reg.x1 - reg.x0) * i) / 120; bpts.push([x, reg.lo(x)]); }
      for (let i = 120; i >= 0; i--) { const x = reg.x0 + ((reg.x1 - reg.x0) * i) / 120; bpts.push([x, reg.hi(x)]); }
      bpts.push(bpts[0]);
      const e1: number[] = [], e2: number[] = [];
      for (let i = 0; i + 1 < bpts.length; i++) {
        const [a, b] = bpts[i], [c, d] = bpts[i + 1];
        e1.push(a, b, 0, c, d, 0);
        const za = f(a, b), zb = f(c, d);
        if (Number.isFinite(za + zb)) e2.push(a, b, za, c, d, zb);
      }
      edge.set(e1); edgeTop.set(e2); edgeTop.handle.visible(!!ctx.toggles.surface);
      // Riemann boxes
      const n = Math.round(ctx.params.n), rule = ctx.choices.rule as SampleRule;
      const hx = (reg.x1 - reg.x0) / n, hy = (yhi - ylo) / n, o = rule === 'll' ? 0 : rule === 'mid' ? 0.5 : 1;
      const inside = (x: number, y: number) => x >= reg.x0 && x <= reg.x1 && y >= reg.lo(x) && y <= reg.hi(x);
      const sum = riemann2(f, reg.x0, reg.x1, ylo, yhi, n, n, rule, inside);
      let cells = 0;
      boxes.begin();
      const col = new THREE.Color();
      const zmax = Math.max(Math.abs(zlo), Math.abs(zhi), 1e-9);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const sx = reg.x0 + (i + o) * hx, sy = ylo + (j + o) * hy;
        if (!inside(sx, sy)) continue;
        const h = f(sx, sy);
        if (!Number.isFinite(h)) continue;
        cells++;
        if (h >= 0) col.copy(colormap('viridis', 0.25 + 0.75 * (h / zmax))); else col.set('#ef6b73');
        boxes.push([reg.x0 + (i + 0.5) * hx, ylo + (j + 0.5) * hy, h / 2], [hx * 0.94, hy * 0.94, Math.abs(h)], col);
      }
      boxes.end(); boxes.handle.visible(!!ctx.toggles.boxes);
      // the integral, area, moments (and the polar form for the disk)
      const key = `${src}|${pv.a}|${pv.b}|${ctx.choices.region}|${ctx.params.xa}|${ctx.params.xb}|${ctx.params.ya}|${ctx.params.yb}|${ctx.params.Rd}`;
      const res = integ(key, () => {
        const I = integrate2e(f, reg.x0, reg.x1, reg.lo, reg.hi, 1e-10);
        const area = integrate2e(() => 1, reg.x0, reg.x1, reg.lo, reg.hi, 1e-10).value;
        const mx = integrate2e((x, y) => x * f(x, y), reg.x0, reg.x1, reg.lo, reg.hi, 1e-8).value, my = integrate2e((x, y) => y * f(x, y), reg.x0, reg.x1, reg.lo, reg.hi, 1e-8).value;
        const polar = ctx.choices.region === 'disk' ? integrate2e((r, t) => f(r * Math.cos(t), r * Math.sin(t)) * r, 0, ctx.params.Rd, () => 0, () => 2 * Math.PI, 1e-10) : undefined;
        return { I, mx, my, area, polar };
      });
      if (ctx.toggles.centroid && Math.abs(res.I.value) > 1e-12) {
        const p: V3 = [res.mx / res.I.value, res.my / res.I.value, 0.02];
        if (!cm) cm = v.addPoint(p, { color: '#ffffff', label: 'centre of mass' }); else cm.set(p);
        cm.visible(true);
      } else cm?.visible(false);
      const errR = sum - res.I.value;
      const rows: Readout[] = [
        { label: 'region', value: reg.name },
        { label: `Riemann sum (${cells} boxes)`, value: fmt(sum, 10) },
        { label: '∬ f dA  (adaptive quadrature)', value: fmtQ(res.I), tone: res.I.ok ? 'good' : 'warn' },
        { label: 'Riemann error', value: fmt(errR, 4) },
        { label: rule === 'mid' ? 'error × n²  (→ constant: 2nd order)' : 'error × n  (→ constant: 1st order)', value: fmt(errR * (rule === 'mid' ? n * n : n), 4), tone: 'muted' },
        { label: 'area of the region', value: fmt(res.area, 10) },
        { label: 'average value of f', value: fmt(res.I.value / res.area, 6) },
      ];
      if (res.polar) rows.push({ label: 'same integral in polar ∫∫ f r dr dθ', value: fmtQ(res.polar) });
      if (ctx.toggles.centroid) rows.push({ label: 'centre of mass (x̄, ȳ)', value: Math.abs(res.I.value) > 1e-12 ? `(${fmt(res.mx / res.I.value, 5)}, ${fmt(res.my / res.I.value, 5)})` : '— (zero total mass)' });
      ctx.setReadouts(rows);
      const ft = toTeX(node);
      ctx.setSteps([
        { title: 'As an iterated integral', tex: reg.tex(`\\left(${ft}\\right)`) + ` \\approx ${fmt(res.I.value, 10)}`, detail: 'The inner integral (in y) runs between the lower and upper boundary at each x; the outer integral adds those slices.' },
        ...(ctx.choices.region === 'disk' ? [{ title: 'In polar coordinates', tex: `\\int_0^{2\\pi}\\!\\int_0^{${fmt(ctx.params.Rd, 3)}} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta \\approx ${fmt(res.polar!.value, 10)}`, detail: 'The factor r is the Jacobian of the polar map (see Change of variables).' }] : []),
      ]);
      const p = palette(ctx.dark); void p;
      ctx.warn(err || (res.I.warning ? `Quadrature: ${res.I.warning}` : ''));
      ctx.setNote(`${cells} boxes, each $\\Delta x\\,\\Delta y = ${fmt(hx, 3)} \\times ${fmt(hy, 3)}$, sampled at the ${rule === 'mid' ? 'midpoint' : rule === 'll' ? 'lower-left corner' : 'upper-right corner'} of its cell. Their total volume is ${fmt(sum, 6)}; the integral is ${fmt(res.I.value, 8)}. Boxes in red stand below the plane and subtract.`);
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── change of variables ────────────────────────────────────────────────────
const JS = { ratio: NaN };

export const jacobian: DemoDef = {
  id: 'calc3.jacobian', module: 'calc3', title: 'Change of variables and the Jacobian',
  topic: 'Change of variables · Jacobian determinant · polar coordinates',
  summary: 'A map T(u, v) = (x, y) carries a grid of small rectangles to a grid of small curved quadrilaterals. Each one is nearly the parallelogram spanned by T_u du and T_v dv, so its area is |det J| du dv. That factor is what a change of variables multiplies the integrand by.',
  tex: 'dA_{xy} = \\left|\\det\\frac{\\partial(x,y)}{\\partial(u,v)}\\right| du\\,dv,\\qquad \\iint_{T(D)} f\\,dx\\,dy = \\iint_D f\\big(T(u,v)\\big)\\,|J|\\,du\\,dv',
  view: 'split2d',
  params: [
    { key: 'u0', label: 'cell u (drag the gold cell)', value: 1, min: -6, max: 6, step: 0.001 },
    { key: 'v0', label: 'cell v', value: 0.8, min: -6, max: 7, step: 0.001 },
    { key: 'du', label: 'cell width du', value: 0.3, min: 0.005, max: 1.5, step: 0.001 },
    { key: 'dv', label: 'cell height dv', value: 0.4, min: 0.005, max: 1.5, step: 0.001 },
    { key: 'umin', label: 'region: u from', value: 0.2, min: -5, max: 5, step: 0.01 },
    { key: 'umax', label: 'region: u to', value: 2, min: -5, max: 5, step: 0.01 },
    { key: 'vmin', label: 'region: v from', value: 0, min: -7, max: 7, step: 0.01 },
    { key: 'vmax', label: 'region: v to', value: 4.71, min: -7, max: 7, step: 0.01 },
    ...paramSpecs(1, 1),
  ],
  toggles: [{ key: 'lin', label: 'Linear approximation (parallelogram J·cell)', value: true }],
  input: { label: 'the map (x(u, v), y(u, v))', value: '(u cos(v), u sin(v))', placeholder: '(x(u,v), y(u,v))' },
  experiments: [
    'Polar coordinates: drag the cell outward — the image cell grows in proportion to r, which is |J| = r.',
    'Shrink du and dv: the image cell becomes indistinguishable from the violet parallelogram and the area ratio tends to 1.',
    'A linear map such as (2u + v, u + 2v) scales every cell by the same factor |det| = 3 — the linear approximation is exact.',
    'Try (u^2 - v^2, 2u v) (squaring in the complex plane): small squares stay square but grow with 4(u² + v²).',
    'Try (v, u): the determinant is −1 — areas are kept but orientation flips, which is why the formula uses |J|.',
  ],
  connections: ['calc3.double', 'calc3.triple', 'calc3.coords'],
  accuracy: 'The Jacobian matrix and determinant are exact symbolic derivatives. The image cell area is the shoelace area of its mapped boundary (240 points; error ~10⁻⁵ relative). ∬|J| du dv is adaptive quadrature with an error estimate; the boundary area is the shoelace area of the mapped region boundary (1600 points), which equals ∬ J du dv (signed, counted with multiplicity) by Green’s theorem.',
  tutorial: [
    { text: '**Polar coordinates** as a map: $T(u, v) = (u\\cos v,\\ u\\sin v)$ sends the rectangle on the left (u is the radius r, v the angle θ) to the annular sector on the right. Vertical grid lines become circles, horizontal ones become rays.', task: 'Drag the gold cell outward until $u > 1.6$ and watch its image grow.', set: { input: '(u cos(v), u sin(v))', params: { u0: 0.6, v0: 0.8, du: 0.3, dv: 0.4, umin: 0.2, umax: 2, vmin: 0, vmax: 4.71 } }, done: (c) => c.params.u0 > 1.6 },
    { text: 'The image of a small cell is almost the **parallelogram** spanned by $T_u\\,du$ and $T_v\\,dv$ (violet). Its area is $|T_u \\times T_v|\\,du\\,dv = |\\det J|\\,du\\,dv$. For polar coordinates $\\det J = u\\cos^2 v + u\\sin^2 v = r$.', task: 'Shrink $du$ and $dv$ to 0.05 or less: the readout **area / (|J| du dv)** tends to 1.', done: (c) => c.params.du <= 0.05 && c.params.dv <= 0.05 && Math.abs(JS.ratio - 1) < 0.01 },
    { text: 'For a **linear** map the Jacobian is constant and the parallelogram *is* the image: every cell, large or small, is scaled by $|\\det A|$.', task: 'Compare the cell area with $|J|\\,du\\,dv$ for a big cell — they agree exactly.', set: { input: '(2u + v, u + 2v)', params: { u0: 0, v0: 0, du: 1, dv: 1, umin: -1, umax: 1, vmin: -1, vmax: 1 } }, done: () => Math.abs(JS.ratio - 1) < 1e-6 },
    { text: 'A **curved** map: $(u^2 - v^2,\\ 2uv)$ is $z \\mapsto z^2$ in the complex plane. Grid lines stay perpendicular (the map is conformal) and each cell is scaled by $|J| = 4(u^2+v^2)$.', set: { input: '(u^2 - v^2, 2u v)', params: { u0: 0.8, v0: 0.4, du: 0.2, dv: 0.2, umin: 0.3, umax: 1.5, vmin: 0, vmax: 1.2 } }, task: 'Drag the cell around: it grows with the distance from the origin.', done: (c) => Math.hypot(c.params.u0, c.params.v0) > 1.4 },
    { text: 'This is why integrals change by $|J|$: $\\iint_{T(D)} f\\,dx\\,dy = \\iint_D f(T(u,v))\\,|J|\\,du\\,dv$. With $f = 1$ it measures area: the full polar rectangle $0 \\le r \\le 2$, $0 \\le \\theta \\le 2\\pi$ gives $\\iint r\\,dr\\,d\\theta = 4\\pi$, the area of the disk. (The famous Gaussian integral $\\int e^{-x^2}dx = \\sqrt\\pi$ is computed exactly this way.)', set: { input: '(u cos(v), u sin(v))', params: { umin: 0, umax: 2, vmin: 0, vmax: 6.2832, u0: 1, v0: 1, du: 0.2, dv: 0.3 } }, task: 'Check that **∬|J| du dv** equals $4\\pi \\approx 12.566$.' },
    { text: 'Your turn: type any map, e.g. elliptic coordinates `(cosh(u) cos(v), sinh(u) sin(v))` or a shear `(u + a v, v)`. Watch for places where $J = 0$: there the map squashes cells flat and stops being invertible.', set: { input: '(cosh(u) cos(v), sinh(u) sin(v))', params: { umin: 0.1, umax: 1.4, vmin: 0, vmax: 6.2832, u0: 0.6, v0: 1, du: 0.2, dv: 0.3 } } },
  ],
  create(ctx) {
    const pl = ctx.plot!, p2 = ctx.plot2!;
    pl.opts.equal = true; p2.opts.equal = true;
    pl.opts.xLabel = 'u'; pl.opts.yLabel = 'v'; p2.opts.xLabel = 'x'; p2.opts.yLabel = 'y';
    let src = '', comp: { X: Node; Y: Node; J: (Node | null)[]; det: Node | null } | null = null, err = '';
    const vk1 = memo<boolean>(), vk2 = memo<boolean>();
    const regionQ = memo<{ I: ReturnType<typeof integrate2e>; shoe: number; signChange: boolean }>();
    const update = () => {
      if (ctx.input !== src) {
        src = ctx.input;
        const r = readFormula(src, ['u', 'v'], 2, 'the map (x(u, v), y(u, v))');
        if (r.items) {
          const [X, Y] = r.items, J = [dSym(X, 'u'), dSym(X, 'v'), dSym(Y, 'u'), dSym(Y, 'v')];
          comp = { X, Y, J, det: J.every(Boolean) ? simplify({ t: 'sub', a: { t: 'mul', a: J[0]!, b: J[3]! }, b: { t: 'mul', a: J[1]!, b: J[2]! } }) : null }; err = '';
        } else err = r.error;
      }
      ctx.warn(err);
      if (!comp) return;
      const pv = paramVals(ctx.params);
      const xf = compile(comp.X, ['u', 'v'], pv), yf = compile(comp.Y, ['u', 'v'], pv);
      const T = (u: number, w: number): [number, number] => [xf([u, w]), yf([u, w])];
      const h = 1e-6;
      const Jc = comp.J.map((n, k) => (n ? compile(n, ['u', 'v'], pv) : (a: ArrayLike<number>) => { const f = k < 2 ? xf : yf; return k % 2 === 0 ? (f([a[0] + h, a[1]]) - f([a[0] - h, a[1]])) / (2 * h) : (f([a[0], a[1] + h]) - f([a[0], a[1] - h])) / (2 * h); }));
      const detJ = (u: number, w: number) => Jc[0]([u, w]) * Jc[3]([u, w]) - Jc[1]([u, w]) * Jc[2]([u, w]);
      const umin = Math.min(ctx.params.umin, ctx.params.umax), umax = Math.max(ctx.params.umin, ctx.params.umax), vmin = Math.min(ctx.params.vmin, ctx.params.vmax), vmax = Math.max(ctx.params.vmin, ctx.params.vmax);
      const du = ctx.params.du, dv = ctx.params.dv;
      const u0 = ctx.params.u0, v0 = ctx.params.v0;
      // the cell's image (shoelace) and the linearization at its centre
      const edgePts = (a: number, b: number, w: number, hh: number, n: number) => {
        const pts: [number, number][] = [];
        for (let i = 0; i < n; i++) pts.push(T(a + (w * i) / n, b));
        for (let i = 0; i < n; i++) pts.push(T(a + w, b + (hh * i) / n));
        for (let i = 0; i < n; i++) pts.push(T(a + w - (w * i) / n, b + hh));
        for (let i = 0; i < n; i++) pts.push(T(a, b + hh - (hh * i) / n));
        return pts;
      };
      const cellImg = edgePts(u0, v0, du, dv, 60);
      const cellArea = Math.abs(polygonArea(cellImg));
      const uc = u0 + du / 2, vc = v0 + dv / 2, Jm = Jc.map((f) => f([uc, vc])), Jd = detJ(uc, vc);
      const approx = Math.abs(Jd) * du * dv;
      JS.ratio = cellArea / approx;
      // whole region: ∬|J| and the signed area enclosed by the image of the boundary
      const rq = regionQ(`${src}|${pv.a}|${pv.b}|${umin}|${umax}|${vmin}|${vmax}`, () => {
        const I = integrate2e((u, w) => Math.abs(detJ(u, w)), umin, umax, () => vmin, () => vmax, 1e-9);
        const shoe = polygonArea(edgePts(umin, vmin, umax - umin, vmax - vmin, 400));
        let pos = false, neg = false;
        for (let j = 0; j <= 30; j++) for (let i = 0; i <= 30; i++) { const d = detJ(umin + ((umax - umin) * i) / 30, vmin + ((vmax - vmin) * j) / 30); if (d > 1e-12) pos = true; if (d < -1e-12) neg = true; }
        return { I, shoe, signChange: pos && neg };
      });
      // views
      const p = palette(ctx.dark);
      vk1(`${umin}|${umax}|${vmin}|${vmax}`, () => { const pu = (umax - umin) * 0.12 + 0.2, pw = (vmax - vmin) * 0.12 + 0.2; pl.setView({ x0: umin - pu, x1: umax + pu, y0: vmin - pw, y1: vmax + pw }); return true; });
      vk2(`${src}|${pv.a}|${pv.b}|${umin}|${umax}|${vmin}|${vmax}`, () => {
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (let j = 0; j <= 30; j++) for (let i = 0; i <= 30; i++) { const [x, y] = T(umin + ((umax - umin) * i) / 30, vmin + ((vmax - vmin) * j) / 30); if (Number.isFinite(x + y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
        if (!Number.isFinite(x0)) { x0 = -1; x1 = 1; y0 = -1; y1 = 1; }
        const pad = Math.max(x1 - x0, y1 - y0) * 0.1 + 0.1;
        p2.setView({ x0: x0 - pad, x1: x1 + pad, y0: y0 - pad, y1: y1 + pad });
        return true;
      });
      const NG = 10;
      const uCol = p.blue, vCol = p.orange;
      pl.setDraw((g) => {
        g.polygon([[umin, vmin], [umax, vmin], [umax, vmax], [umin, vmax]], { fill: ctx.dark ? 'rgba(106,169,255,0.08)' : 'rgba(47,111,214,0.08)', color: p.muted, width: 1.2 });
        for (let i = 0; i <= NG; i++) { const u = umin + ((umax - umin) * i) / NG; g.line([u, vmin], [u, vmax], { color: uCol, width: 1.2, alpha: 0.7 }); }
        for (let j = 0; j <= NG; j++) { const w = vmin + ((vmax - vmin) * j) / NG; g.line([umin, w], [umax, w], { color: vCol, width: 1.2, alpha: 0.7 }); }
        g.polygon([[u0, v0], [u0 + du, v0], [u0 + du, v0 + dv], [u0, v0 + dv]], { fill: 'rgba(242,193,78,0.45)', color: p.gold, width: 2 });
        g.text([u0 + du, v0 + dv], `du dv = ${fmt(du * dv, 3)}`, { color: p.gold, font: '600 12.5px Inter, sans-serif' }, 6, -4);
        g.handle({ id: 'cell', at: [u0, v0], color: p.gold, onDrag: ([a, b]) => { ctx.setParam('u0', clamp(a, -6, 6)); ctx.setParam('v0', clamp(b, -6, 7)); update(); } });
        g.handle({ id: 'size', at: [u0 + du, v0 + dv], r: 5, color: p.ink, onDrag: ([a, b]) => { ctx.setParam('du', clamp(a - u0, 0.005, 1.5)); ctx.setParam('dv', clamp(b - v0, 0.005, 1.5)); update(); } });
      });
      p2.setDraw((g) => {
        for (let i = 0; i <= NG; i++) { const u = umin + ((umax - umin) * i) / NG; g.parametric((s) => T(u, s)[0], (s) => T(u, s)[1], vmin, vmax, { color: uCol, width: 1.2, alpha: 0.7 }, 160); }
        for (let j = 0; j <= NG; j++) { const w = vmin + ((vmax - vmin) * j) / NG; g.parametric((s) => T(s, w)[0], (s) => T(s, w)[1], umin, umax, { color: vCol, width: 1.2, alpha: 0.7 }, 160); }
        g.polygon(cellImg, { fill: 'rgba(242,193,78,0.45)', color: p.gold, width: 2 });
        if (ctx.toggles.lin) {
          const [cx, cy] = T(uc, vc);
          const a: [number, number] = [Jm[0] * du, Jm[2] * du], b: [number, number] = [Jm[1] * dv, Jm[3] * dv];
          const c0: [number, number] = [cx - (a[0] + b[0]) / 2, cy - (a[1] + b[1]) / 2];
          g.polygon([c0, [c0[0] + a[0], c0[1] + a[1]], [c0[0] + a[0] + b[0], c0[1] + a[1] + b[1]], [c0[0] + b[0], c0[1] + b[1]]], { color: p.violet, width: 2, dash: [5, 4] });
          const P0 = T(u0, v0);
          g.arrow(P0, [P0[0] + Jm[0] * du, P0[1] + Jm[2] * du], { color: uCol, width: 2.2 });
          g.arrow(P0, [P0[0] + Jm[1] * dv, P0[1] + Jm[3] * dv], { color: vCol, width: 2.2 });
          g.text([P0[0] + Jm[0] * du, P0[1] + Jm[2] * du], 'T_u du', { color: uCol, font: '600 12px Inter, sans-serif' }, 4, 12);
          g.text([P0[0] + Jm[1] * dv, P0[1] + Jm[3] * dv], 'T_v dv', { color: vCol, font: '600 12px Inter, sans-serif' }, 4, -4);
        }
      });
      const rows: Readout[] = [
        { label: 'J at the cell centre', value: `[[${fmt(Jm[0], 4)}, ${fmt(Jm[1], 4)}], [${fmt(Jm[2], 4)}, ${fmt(Jm[3], 4)}]]` },
        { label: 'det J at the cell centre', value: fmt(Jd, 6), tone: Jd < 0 ? 'warn' : undefined },
        { label: 'image cell area (numerical)', value: fmt(cellArea, 7) },
        { label: '|J| du dv', value: fmt(approx, 7) },
        { label: 'area / (|J| du dv)  (→ 1)', value: fmt(cellArea / approx, 6), tone: Math.abs(cellArea / approx - 1) < 0.01 ? 'good' : 'muted' },
        { label: '∬_D |J| du dv  (whole region)', value: fmtQ(rq.I) },
        { label: 'area enclosed by T(∂D) (shoelace)', value: fmt(rq.shoe, 9) },
      ];
      if (comp.det) rows.push({ label: 'det J', value: toTeX(comp.det), tex: true });
      if (comp.J.every(Boolean)) rows.push({ label: 'J', value: `\\begin{pmatrix}${toTeX(comp.J[0]!)} & ${toTeX(comp.J[1]!)}\\\\ ${toTeX(comp.J[2]!)} & ${toTeX(comp.J[3]!)}\\end{pmatrix}`, tex: true });
      ctx.setReadouts(rows);
      const warn = rq.signChange ? 'det J changes sign in the region: the map folds it over itself, so it is not one-to-one there and the change-of-variables formula does not apply to the whole region.'
        : !Number.isFinite(cellArea) ? 'The map is undefined somewhere on the cell.' : Math.abs(Jd) < 1e-10 ? 'det J = 0 at the cell: the map squashes it flat here.' : '';
      ctx.warn(err || warn);
      ctx.setNote(`Left: the $(u, v)$ rectangle with a grid (blue: $u$ = const, orange: $v$ = const). Right: its image under $T$. The gold cell of area $du\\,dv = ${fmt(du * dv, 3)}$ becomes a curved cell of area ${fmt(cellArea, 5)}; the violet parallelogram $J\\cdot$cell has area $|J|\\,du\\,dv = ${fmt(approx, 5)}$. ${Jd < 0 ? 'Here $\\det J < 0$: the map reverses orientation (the blue and orange arrows swap order).' : ''}`);
    };
    return { update, dispose() {} };
  },
};
