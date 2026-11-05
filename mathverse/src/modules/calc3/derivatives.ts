// Calculus III — derivatives of functions of several variables: partial and
// directional derivatives as slopes of slices, the gradient with level curves
// and the tangent plane (tutorial), and the multivariable chain rule.

import type { DemoDef, DemoCtx, Readout } from '../types';
import { Node, substitute, toTeX, simplify, compile } from '../../core/expr';
import { contourSegments, chainSegments } from '../../core/numeric/vcalc';
import { colormap } from '../../engine/colors';
import type { V3 } from '../../engine/viewport3d';
import { fmt, deg, clamp, paramSpecs, paramVals, readFormula, derivs2, D2, palette, makeGraph, addSegments, splitParts, dSym, texOf, memo, showArrow } from './common';

type Curve = ReturnType<NonNullable<DemoCtx['view3d']>['addCurve']>;
type Arrow = ReturnType<NonNullable<DemoCtx['view3d']>['addArrow']>;
type Point = ReturnType<NonNullable<DemoCtx['view3d']>['addPoint']>;
type Plane = ReturnType<NonNullable<DemoCtx['view3d']>['addPlane']>;

/** Read z = f(x, y) from the input; keeps the last good formula when the new one has an error. */
function formulaReader(ctx: DemoCtx) {
  let src = '', node: Node | null = null, err = '';
  return () => {
    if (ctx.input !== src) {
      src = ctx.input;
      const r = readFormula(src, ['x', 'y'], 1, 'a function f(x, y)');
      if (r.items) { node = r.items[0]; err = ''; } else err = r.error;
    }
    return { node, err };
  };
}

// ── partial and directional derivatives ───────────────────────────────────
export const partials: DemoDef = {
  id: 'calc3.partials', module: 'calc3', title: 'Partial and directional derivatives',
  topic: 'Partial derivatives · directional derivatives',
  summary: 'Cut the surface z = f(x, y) with a vertical plane through a point: the cut is an ordinary curve, and its slope is a derivative. The planes y = y₀ and x = x₀ give ∂f/∂x and ∂f/∂y; a plane along any unit direction u gives the directional derivative D_u f = ∇f · u.',
  tex: '\\frac{\\partial f}{\\partial x}(x_0,y_0)=\\lim_{h\\to 0}\\frac{f(x_0+h,\\,y_0)-f(x_0,y_0)}{h},\\qquad D_{\\mathbf u}f=\\frac{d}{ds}f(\\mathbf p+s\\mathbf u)\\Big|_{s=0}=\\nabla f\\cdot\\mathbf u',
  view: 'split3d',
  params: [
    { key: 'x0', label: 'x₀ (drag the point)', value: 0.8, min: -4, max: 4, step: 0.01 },
    { key: 'y0', label: 'y₀', value: 0.6, min: -4, max: 4, step: 0.01 },
    { key: 'theta', label: 'direction θ of u (degrees; drag the gold tip)', value: 30, min: 0, max: 360, step: 0.5 },
    { key: 'R', label: 'domain half-width', value: 2, min: 1, max: 6, step: 0.1 },
    ...paramSpecs(1, 1),
  ],
  choices: [{ key: 'mode', label: 'Slice the surface by', value: 'xy', options: [['xy', 'the planes y = y₀ and x = x₀ (partials)'], ['dir', 'a vertical plane along u (directional)']] }],
  toggles: [{ key: 'tangent', label: 'Tangent lines in the slices', value: true }, { key: 'grad', label: 'Gradient ∇f (directional mode)', value: true }],
  input: { label: 'z = f(x, y)', value: 'a*x^2/2 - b*y^2/3 + sin(x*y)/2', placeholder: 'e.g. x^2 y - y^3/3' },
  experiments: [
    'In partials mode, drag the point along the red slice: ∂f/∂x is the slope of the red curve in the left plot, and it changes as you move.',
    'Find a point where ∂f/∂x = 0 but ∂f/∂y ≠ 0: the red tangent line is level, the green one is not.',
    'Switch to the directional slice and spin u with the gold tip. D_u f is largest when u points along ∇f and zero when u is perpendicular to it.',
    'Set θ = 0 and θ = 90: the directional derivative becomes ∂f/∂x and ∂f/∂y — partials are just two special directions.',
    'Try f = sqrt(x^2 + y^2) at the origin (drag there): every slice has a corner, so no partial derivative exists.',
  ],
  connections: ['calc3.gradient', 'calc3.chain', 'calc3.optimize'],
  accuracy: 'Partial derivatives, the gradient and D_u f are exact symbolic derivatives evaluated at the point; the readout “difference quotient” is a numerical check (central difference, h = 10⁻⁴). Functions without a derivative formula fall back to a labelled central difference.',
  create(ctx) {
    const v = ctx.view3d!, plot = ctx.plot!;
    const read = formulaReader(ctx);
    const graph = makeGraph(v, { opacity: 0.8 });
    plot.opts.xLabel = 's  (step from the point)'; plot.opts.yLabel = 'z';
    let o: { pX: Plane; pY: Plane; pU: Plane; tX: Curve; tY: Curve; tU: Curve; lX: Curve; lY: Curve; lU: Curve; pt: Point; tip: Point; uA: Arrow; gA: Arrow } | null = null;
    let d: D2 | null = null;
    const viewKey = memo<boolean>();
    const update = () => {
      const { node, err } = read();
      ctx.warn(err);
      if (!node) return;
      const pv = paramVals(ctx.params);
      d = derivs2(node, pv);
      const D = d;
      const F = (x: number, y: number) => D.f([x, y]);
      const R = ctx.params.R;
      const x0 = clamp(ctx.params.x0, -R, R), y0 = clamp(ctx.params.y0, -R, R);
      const [zl, zh] = graph.draw(F, -R, R, -R, R);
      const z0 = F(x0, y0), fx = D.fx([x0, y0]), fy = D.fy([x0, y0]);
      const th = (ctx.params.theta * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
      const Du = fx * c + fy * s;
      const zm = (zl + zh) / 2, size = Math.max(2 * R, zh - zl) * 1.1;
      if (!o) {
        o = {
          pX: v.addPlane([0, 0, 0], [1, 0, 0], size, { color: '#6fcf97', opacity: 0.16 }),
          pY: v.addPlane([0, 0, 0], [0, 1, 0], size, { color: '#ef6b73', opacity: 0.16 }),
          pU: v.addPlane([0, 0, 0], [0, 1, 0], size, { color: '#f2c14e', opacity: 0.16 }),
          tX: v.addCurve([], { color: '#ff5c69', radius: R * 0.02 }), tY: v.addCurve([], { color: '#3ee08a', radius: R * 0.02 }), tU: v.addCurve([], { color: '#ffd23f', radius: R * 0.02 }),
          lX: v.addCurve([], { color: '#ffffff', radius: R * 0.013 }), lY: v.addCurve([], { color: '#ffffff', radius: R * 0.013 }), lU: v.addCurve([], { color: '#ffffff', radius: R * 0.013 }),
          pt: v.addPoint([x0, y0, z0], { color: '#ffffff', size: R * 0.05, drag: { constrain: ([X, Y]) => { const r = ctx.params.R; const a = clamp(X, -r, r), b = clamp(Y, -r, r); return [a, b, F(a, b)]; }, onDrag: ([X, Y]) => { ctx.setParam('x0', X); ctx.setParam('y0', Y); update(); } } }),
          tip: v.addPoint([x0, y0, z0], { color: '#f2c14e', size: R * 0.04, drag: {
            constrain: (p) => { const P = o!.pt.get(), dx = p[0] - P[0], dy = p[1] - P[1], m = Math.hypot(dx, dy) || 1, L = ctx.params.R * 0.45; return [P[0] + (dx / m) * L, P[1] + (dy / m) * L, P[2]]; },
            onDrag: (p) => { const P = o!.pt.get(); let a = deg(Math.atan2(p[1] - P[1], p[0] - P[0])); if (a < 0) a += 360; ctx.setParam('theta', a); update(); },
          } }),
          uA: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#f2c14e', label: 'u' }),
          gA: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#b48cff', label: '∇f' }),
        };
      }
      const dir = ctx.choices.mode === 'dir', tan = ctx.toggles.tangent;
      o.pt.set([x0, y0, z0]);
      const trace = (px: number, py: number, ux: number, uy: number): V3[] => {
        const pts: V3[] = [];
        for (let i = 0; i <= 240; i++) {
          const t = -3 * R + (6 * R * i) / 240, X = px + t * ux, Y = py + t * uy;
          if (Math.abs(X) > R + 1e-9 || Math.abs(Y) > R + 1e-9) continue;
          const z = F(X, Y);
          pts.push([X, Y, z >= zl - (zh - zl) * 0.3 && z <= zh + (zh - zl) * 0.3 ? z : NaN]);
        }
        return pts;
      };
      const tline = (ux: number, uy: number, slope: number): V3[] => {
        const L = R * 0.5 / Math.hypot(1, slope);
        return [[x0 - ux * L, y0 - uy * L, z0 - slope * L], [x0 + ux * L, y0 + uy * L, z0 + slope * L]];
      };
      o.pX.visible(!dir); o.pY.visible(!dir); o.tX.visible(!dir); o.tY.visible(!dir); o.lX.visible(!dir && tan); o.lY.visible(!dir && tan);
      o.pU.visible(dir); o.tU.visible(dir); o.lU.visible(dir && tan); o.uA.visible(dir); o.tip.visible(dir); o.gA.visible(false);
      if (!dir) {
        o.pY.set([0, y0, zm], [0, 1, 0]); o.pX.set([x0, 0, zm], [1, 0, 0]);
        o.tX.set(trace(x0, y0, 1, 0)); o.tY.set(trace(x0, y0, 0, 1));
        if (tan) { o.lX.set(tline(1, 0, fx)); o.lY.set(tline(0, 1, fy)); }
      } else {
        o.pU.set([x0, y0, zm], [-s, c, 0]);
        o.tU.set(trace(x0, y0, c, s));
        if (tan) o.lU.set(tline(c, s, Du));
        const L = R * 0.45;
        o.uA.set([x0, y0, z0], [c * L * 0.93, s * L * 0.93, 0]);
        o.tip.set([x0 + c * L, y0 + s * L, z0]);
        const gl = Math.hypot(fx, fy), k = gl > 0 ? Math.min(gl, R * 0.7) / gl : 0;
        showArrow(o.gA, [x0, y0, z0], [fx * k, fy * k, 0], !!ctx.toggles.grad);
      }
      // the slices as ordinary graphs
      const p = palette(ctx.dark);
      viewKey(`${ctx.input}|${R}|${pv.a}|${pv.b}`, () => { const pad = (zh - zl) * 0.15 + 0.1; plot.setView({ x0: -1.05 * R, x1: 1.05 * R, y0: zl - pad, y1: zh + pad }); return true; });
      plot.setDraw((g) => {
        const lab = (t: number, f: (s: number) => number, text: string, color: string) => { const y = f(t); if (Number.isFinite(y)) g.text([t, y], text, { color, font: '600 13px Inter, sans-serif' }, 6, -8); };
        const span = R * 0.55;
        if (!dir) {
          const gx = (t: number) => F(x0 + t, y0), gy = (t: number) => F(x0, y0 + t);
          g.fn(gx, { color: p.red, width: 2.6 }); g.fn(gy, { color: p.green, width: 2.6 });
          if (tan) { g.line([-span, z0 - fx * span], [span, z0 + fx * span], { color: p.red, width: 1.6, dash: [6, 4] }); g.line([-span, z0 - fy * span], [span, z0 + fy * span], { color: p.green, width: 1.6, dash: [6, 4] }); }
          lab(R * 0.62, gx, 'f(x₀+s, y₀)', p.red); lab(-R * 0.9, gy, 'f(x₀, y₀+s)', p.green);
        } else {
          const gu = (t: number) => F(x0 + t * c, y0 + t * s);
          g.fn(gu, { color: p.gold, width: 2.6 });
          if (tan) g.line([-span, z0 - Du * span], [span, z0 + Du * span], { color: p.gold, width: 1.6, dash: [6, 4] });
          lab(R * 0.62, gu, 'f(p + s u)', p.gold);
        }
        g.point([0, z0], 5, { fill: p.ink });
      });
      const h = 1e-4;
      const num = dir ? (F(x0 + h * c, y0 + h * s) - F(x0 - h * c, y0 - h * s)) / (2 * h) : (F(x0 + h, y0) - F(x0 - h, y0)) / (2 * h);
      const lbl = d.exact1 ? '' : ' (numerical)';
      const rows: Readout[] = [
        { label: 'f(x₀, y₀)', value: fmt(z0, 6) },
        { label: '∂f/∂x  (slope of the red slice)', value: fmt(fx, 6) + lbl },
        { label: '∂f/∂y  (slope of the green slice)', value: fmt(fy, 6) + lbl },
      ];
      if (dir) {
        const gl = Math.hypot(fx, fy);
        rows.push({ label: 'u = (cos θ, sin θ)', value: `(${fmt(c, 4)}, ${fmt(s, 4)})` });
        rows.push({ label: 'D_u f = ∇f · u', value: fmt(Du, 6) + lbl, tone: Du > 1e-9 ? 'good' : Du < -1e-9 ? 'warn' : 'muted' });
        rows.push({ label: '|∇f|  (largest possible D_u f)', value: fmt(gl, 6) });
        rows.push({ label: 'angle between u and ∇f', value: gl > 1e-12 ? `${fmt(deg(Math.acos(clamp(Du / gl, -1, 1))), 4)}°` : '— (∇f = 0)' });
      }
      rows.push({ label: 'difference quotient (numerical check)', value: fmt(num, 6), tone: 'muted' });
      if (d.nx) rows.push({ label: '∂f/∂x', value: toTeX(d.nx), tex: true });
      if (d.ny) rows.push({ label: '∂f/∂y', value: toTeX(d.ny), tex: true });
      ctx.setReadouts(rows);
      if (!Number.isFinite(z0)) ctx.warn(`f is not defined at (${fmt(x0)}, ${fmt(y0)}) — move the point.`);
      else if (!Number.isFinite(fx) || !Number.isFinite(fy)) ctx.warn(`f has no partial derivative at (${fmt(x0)}, ${fmt(y0)}) (a corner, cusp or vertical tangent).`);
      ctx.setNote(dir
        ? `The gold plane contains the direction $\\mathbf u = (\\cos\\theta, \\sin\\theta)$. Along it $s \\mapsto f(\\mathbf p + s\\mathbf u)$ is a curve whose slope at $s = 0$ is $D_{\\mathbf u} f = f_x\\cos\\theta + f_y\\sin\\theta = ${fmt(Du)}$. Since $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$, it is largest along $\\nabla f$ (violet) and zero along the level curve.`
        : `Holding $y = ${fmt(y0)}$ fixed leaves a curve in $x$ (red); its slope is $\\partial f/\\partial x = ${fmt(fx)}$. Holding $x = ${fmt(x0)}$ fixed leaves a curve in $y$ (green) with slope $\\partial f/\\partial y = ${fmt(fy)}$. The left plot shows both slices against the step $s$.`);
    };
    return { update, dispose() { v.clear(); } };
  },
};

/** flat [x, y, x, y, …] → points */
const pairs = (l: number[]): [number, number][] => { const o: [number, number][] = []; for (let i = 0; i + 1 < l.length; i += 2) o.push([l[i], l[i + 1]]); return o; };

// ── gradient, level curves, tangent plane ─────────────────────────────────
const G = { grad: NaN, moved: false };

export const gradient: DemoDef = {
  id: 'calc3.gradient', module: 'calc3', title: 'Gradient, level curves and the tangent plane',
  topic: 'Gradients · level curves · tangent planes · linear approximation',
  summary: 'The contour map and the surface side by side. The gradient ∇f = (f_x, f_y) points uphill as steeply as possible, is perpendicular to the level curve through the point, and with f(p) it determines the tangent plane — the best linear approximation of f near p.',
  tex: 'z = f(x_0,y_0) + f_x(x_0,y_0)(x-x_0) + f_y(x_0,y_0)(y-y_0),\\qquad \\nabla f \\perp \\{f = f(x_0,y_0)\\}',
  view: 'split3d',
  params: [
    { key: 'x0', label: 'x₀ (drag the point)', value: 0.9, min: -6, max: 6, step: 0.01 },
    { key: 'y0', label: 'y₀', value: -0.5, min: -6, max: 6, step: 0.01 },
    { key: 'h', label: 'step h for the linearization check', value: 0.4, min: 0.001, max: 1.5, step: 0.001 },
    { key: 'levels', label: 'number of level curves', value: 12, min: 3, max: 30, step: 1 },
    { key: 'R', label: 'domain half-width', value: 3, min: 1, max: 6, step: 0.1 },
    ...paramSpecs(1.5, 1),
  ],
  toggles: [{ key: 'plane', label: 'Tangent plane', value: true }, { key: 'contours', label: 'Level curves on the surface', value: true }, { key: 'field', label: 'Gradient field on the map', value: false }, { key: 'normal', label: 'Normal vector (−f_x, −f_y, 1)', value: false }],
  input: { label: 'z = f(x, y)', value: 'a*sin(x)*cos(y)', placeholder: 'e.g. x^2 + 3y^2' },
  experiments: [
    'Drag the point on the map: the white arrow ∇f always crosses the gold level curve at a right angle.',
    'Turn on the gradient field: arrows are short where level curves are far apart and long where they crowd together.',
    'Shrink h from 1 to 0.01: the linearization error falls like h², so error/h² settles to a constant (half a second derivative).',
    'Park the point on a peak, pit or saddle: the tangent plane is horizontal and ∇f = 0.',
    'Physics: if f is a temperature, heat flows along −∇f (Fourier’s law); if f is a potential energy, the force is −∇f.',
  ],
  connections: ['calc3.partials', 'calc3.optimize', 'calc3.lagrange', 'calc3.chain'],
  accuracy: 'f_x, f_y and the tangent plane are exact (symbolic derivatives). Level curves are traced numerically (marching squares refined by bisection) and are accurate to well under a pixel. The linearization error is computed by evaluating f directly.',
  tutorial: [
    { text: 'A function of two variables is a **landscape**: the right view is the surface $z = f(x, y)$, the left view its **contour map** — the level curves $f = \\text{const}$ seen from above, coloured by height like a hiking map.', task: 'Drag the white point (on the map or on the surface) to somewhere steep, where $|\\nabla f| > 1$.', set: { input: 'a*sin(x)*cos(y)', params: { a: 1.5, x0: 0.9, y0: -0.5 }, toggles: { plane: false, contours: true, field: false } }, done: () => G.grad > 1 },
    { text: 'The **gradient** $\\nabla f = (f_x, f_y)$ is the white arrow. It points in the direction of steepest ascent, its length is the steepest slope, and it is **perpendicular to the level curve** (gold) through the point: walking along a level curve, $f$ does not change, so $\\nabla f\\cdot \\mathbf T = 0$.', task: 'Turn on **Gradient field on the map** and see that every arrow crosses the level curves at right angles.', done: (c) => !!c.toggles.field },
    { text: 'The **tangent plane** $z = f(\\mathbf p) + \\nabla f(\\mathbf p)\\cdot(\\mathbf x - \\mathbf p)$ is the best linear approximation. Being *best* means the error is smaller than linear: $f(\\mathbf p + \\mathbf h) - L(\\mathbf p + \\mathbf h) = O(|\\mathbf h|^2)$ — that is what differentiable means in several variables.', task: 'Shrink the step $h$ to 0.02 or less and watch **error / h²** settle to a constant.', set: { toggles: { plane: true, field: false } }, done: (c) => c.params.h <= 0.02 },
    { text: 'Where $\\nabla f = \\mathbf 0$ the tangent plane is horizontal. These **critical points** are the candidates for maxima and minima — and also saddles, where the surface rises one way and falls the other.', task: 'Find a point with $|\\nabla f| < 0.05$.', done: () => G.grad < 0.05 },
    { text: 'The **directional derivative** along a unit vector $\\mathbf u$ is $D_{\\mathbf u} f = \\nabla f \\cdot \\mathbf u = |\\nabla f|\\cos\\alpha$. It is largest ($|\\nabla f|$) along $\\nabla f$, zero along the level curve and most negative against $\\nabla f$. In physics a force derived from a potential energy is $\\mathbf F = -\\nabla U$: it pushes straight downhill, across the equipotentials.', task: 'Turn on the **normal vector**: $(-f_x, -f_y, 1)$ is perpendicular to the tangent plane.', set: { toggles: { normal: false } }, done: (c) => !!c.toggles.normal },
    { text: 'Now a function of your own. Elongated bowls show the perpendicularity most clearly: the gradient does **not** point at the bottom of the bowl, only across the nearest level curve.', task: 'Type your own function into the input box (for example `x^2 + 4y^2`).', set: { input: 'x^2 + 4*y^2', params: { x0: 2, y0: 1 } }, done: (c) => c.input.replace(/\s/g, '') !== 'x^2+4*y^2' && c.input.replace(/\s/g, '') !== 'a*sin(x)*cos(y)' },
  ],
  create(ctx) {
    const v = ctx.view3d!, plot = ctx.plot!;
    plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
    const read = formulaReader(ctx);
    const graph = makeGraph(v, { opacity: 0.93 });
    const contour3 = addSegments(v, '#ffffff', 0.9), floor3 = addSegments(v, '#ffffff', 0.55), level3 = addSegments(v, '#f2c14e');
    let o: { pt: Point; plane: Plane; gF: Arrow; up: Arrow; nA: Arrow; drop: Curve } | null = null;
    const viewKey = memo<boolean>();
    G.moved = false;
    const update = () => {
      const { node, err } = read();
      ctx.warn(err);
      if (!node) return;
      const pv = paramVals(ctx.params);
      const d = derivs2(node, pv);
      const F = (x: number, y: number) => d.f([x, y]);
      const R = ctx.params.R;
      const x0 = clamp(ctx.params.x0, -R, R), y0 = clamp(ctx.params.y0, -R, R);
      const [zl, zh] = graph.draw(F, -R, R, -R, R);
      const floor = v.getBounds().z[0];
      const z0 = F(x0, y0), fx = d.fx([x0, y0]), fy = d.fy([x0, y0]), gl = Math.hypot(fx, fy);
      G.grad = gl;
      // level curves: the same levels on the map and on the surface
      const nl = Math.round(ctx.params.levels);
      const levels: { z: number; segs: number[] }[] = [];
      for (let k = 1; k <= nl; k++) { const z = zl + ((zh - zl) * k) / (nl + 1); levels.push({ z, segs: contourSegments((x, y) => F(x, y) - z, -R, R, -R, R, 90, 90) }); }
      const through = Number.isFinite(z0) ? contourSegments((x, y) => F(x, y) - z0, -R, R, -R, R, 120, 120) : [];
      const c3: number[] = [], col: number[] = [], fl: number[] = [];
      for (const L of levels) {
        const cc = colormap('turbo', (L.z - zl) / (zh - zl || 1)).lerp(colormap('turbo', 0).set('#ffffff'), 0.35);
        for (let i = 0; i < L.segs.length; i += 4) {
          c3.push(L.segs[i], L.segs[i + 1], L.z, L.segs[i + 2], L.segs[i + 3], L.z);
          col.push(cc.r, cc.g, cc.b, cc.r, cc.g, cc.b);
          fl.push(L.segs[i], L.segs[i + 1], floor, L.segs[i + 2], L.segs[i + 3], floor);
        }
      }
      contour3.set(c3, col); floor3.set(fl, col);
      contour3.handle.visible(!!ctx.toggles.contours); floor3.handle.visible(!!ctx.toggles.contours);
      const levelLines = levels.map((L) => chainSegments(L.segs)), throughLines = chainSegments(through);
      const lv: number[] = [];
      for (let i = 0; i < through.length; i += 4) lv.push(through[i], through[i + 1], z0, through[i + 2], through[i + 3], z0);
      level3.set(lv);
      // 3D objects
      if (!o) {
        o = {
          pt: v.addPoint([x0, y0, z0], { color: '#ffffff', drag: { constrain: ([X, Y]) => { const r = ctx.params.R; const a = clamp(X, -r, r), b = clamp(Y, -r, r); return [a, b, F(a, b)]; }, onDrag: ([X, Y]) => { ctx.setParam('x0', X); ctx.setParam('y0', Y); G.moved = true; update(); } } }),
          plane: v.addPlane([0, 0, 0], [0, 0, 1], R * 1.1, { color: '#b48cff', opacity: 0.45 }),
          gF: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#f2c14e', label: '∇f' }),
          up: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#ff9f5a', label: 'uphill' }),
          nA: v.addArrow([0, 0, 0], [0, 0, 1], { color: '#4fd1d9', label: 'n' }),
          drop: v.addCurve([], { color: '#8b93a7', radius: 0 }),
        };
      }
      const P: V3 = [x0, y0, z0];
      o.pt.set(P);
      if (ctx.toggles.plane && Number.isFinite(fx + fy)) { o.plane.set(P, [-fx, -fy, 1]); o.plane.visible(true); } else o.plane.visible(false);
      // gradient on the floor, at the shadow of the point, at a scale shared by the whole map
      let gmax = 1e-12;
      for (let j = 0; j <= 12; j++) for (let i = 0; i <= 12; i++) { const q = Math.hypot(d.fx([-R + (2 * R * i) / 12, -R + (2 * R * j) / 12]), d.fy([-R + (2 * R * i) / 12, -R + (2 * R * j) / 12])); if (Number.isFinite(q) && q > gmax) gmax = q; }
      const sg = (0.45 * R) / gmax;
      showArrow(o.gF, [x0, y0, floor], [fx * sg, fy * sg, 0]);
      o.drop.set([[x0, y0, floor], P]);
      const upv: V3 = [fx, fy, fx * fx + fy * fy], ul = Math.hypot(...upv);
      showArrow(o.up, P, ul > 1e-12 ? [(upv[0] / ul) * R * 0.4, (upv[1] / ul) * R * 0.4, (upv[2] / ul) * R * 0.4] : [0, 0, 0]);
      const nl2 = Math.hypot(fx, fy, 1);
      o.nA.set(P, [(-fx / nl2) * R * 0.4, (-fy / nl2) * R * 0.4, (1 / nl2) * R * 0.4]);
      o.nA.visible(!!ctx.toggles.normal);
      // the contour map
      viewKey(`${R}`, () => { plot.setView({ x0: -R * 1.02, x1: R * 1.02, y0: -R * 1.02, y1: R * 1.02 }); return true; });
      plot.setDraw((g) => {
        g.heatmap((x, y) => (Math.abs(x) <= R && Math.abs(y) <= R ? F(x, y) : NaN), [zl, zh], 'turbo', 150);
        g.line([-R, 0], [R, 0], { color: 'rgba(255,255,255,0.35)', width: 1 }); g.line([0, -R], [0, R], { color: 'rgba(255,255,255,0.35)', width: 1 });
        for (const L of levelLines) for (const l of L) g.path(pairs(l), { color: 'rgba(0,0,0,0.45)', width: 1.1 });
        for (const l of throughLines) g.path(pairs(l), { color: 'rgba(0,0,0,0.75)', width: 5.5 });
        for (const l of throughLines) g.path(pairs(l), { color: '#f2c14e', width: 2.8 });
        if (ctx.toggles.field) {
          const n = 15, hs = (2 * R) / n;
          for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
            const X = -R + (i + 0.5) * hs, Y = -R + (j + 0.5) * hs, a = d.fx([X, Y]), b = d.fy([X, Y]), m = Math.hypot(a, b);
            if (!(m > 1e-12) || !Number.isFinite(m)) continue;
            const L = hs * 0.42 * (0.25 + 0.75 * Math.sqrt(m / gmax));
            g.arrow([X - (a / m) * L, Y - (b / m) * L], [X + (a / m) * L, Y + (b / m) * L], { color: 'rgba(255,255,255,0.85)', width: 1.3 });
          }
        }
        if (gl > 1e-12) {
          const tx = (-fy / gl) * R * 0.3, ty = (fx / gl) * R * 0.3;
          g.line([x0 - tx, y0 - ty], [x0 + tx, y0 + ty], { color: '#ffffff', width: 1.6, dash: [5, 4] });
          g.arrow([x0, y0], [x0 + fx * sg, y0 + fy * sg], { color: 'rgba(0,0,0,0.75)', width: 5 });
          g.arrow([x0, y0], [x0 + fx * sg, y0 + fy * sg], { color: '#ffffff', width: 2.6 });
          g.text([x0 + fx * sg, y0 + fy * sg], '∇f', { color: '#ffffff', font: '600 14px Inter, sans-serif' }, 6, -6);
        }
        g.handle({ id: 'p', at: [x0, y0], color: '#ffffff', onDrag: ([X, Y]) => { ctx.setParam('x0', clamp(X, -R, R)); ctx.setParam('y0', clamp(Y, -R, R)); G.moved = true; update(); } });
      });
      const h = ctx.params.h;
      const E = F(x0 + h, y0 + h) - (z0 + fx * h + fy * h);
      const lbl = d.exact1 ? '' : ' (numerical)';
      ctx.setReadouts([
        { label: 'f(x₀, y₀)', value: fmt(z0, 6) },
        { label: '∇f = (f_x, f_y)', value: `(${fmt(fx, 5)}, ${fmt(fy, 5)})${lbl}` },
        { label: '|∇f|  steepest slope', value: fmt(gl, 6), tone: gl < 0.05 ? 'good' : undefined },
        { label: 'direction of steepest ascent', value: gl > 1e-12 ? `${fmt((deg(Math.atan2(fy, fx)) + 360) % 360, 4)}°` : '— (critical point)' },
        { label: 'error f − L at (x₀+h, y₀+h)', value: fmt(E, 4) },
        { label: 'error / h²  (→ constant)', value: fmt(E / (h * h), 5), tone: 'muted' },
        ...(d.nx ? [{ label: 'f_x', value: toTeX(d.nx), tex: true }] : []),
        ...(d.ny ? [{ label: 'f_y', value: toTeX(d.ny), tex: true }] : []),
      ]);
      if (!Number.isFinite(z0)) ctx.warn(`f is not defined at (${fmt(x0)}, ${fmt(y0)}).`);
      ctx.setNote(`Tangent plane at $(${fmt(x0, 3)}, ${fmt(y0, 3)})$: $z = ${fmt(z0)} ${fx < 0 ? '-' : '+'} ${fmt(Math.abs(fx))}(x - ${fmt(x0, 3)}) ${fy < 0 ? '-' : '+'} ${fmt(Math.abs(fy))}(y - ${fmt(y0, 3)})$. The gold curve is the level curve $f = ${fmt(z0)}$ through the point; $\\nabla f$ (white) crosses it at a right angle, the dashed line is its tangent. On the surface the orange arrow is the uphill direction $(f_x, f_y, |\\nabla f|^2)$, the gold arrow on the floor is $\\nabla f$ itself.`);
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── the chain rule ─────────────────────────────────────────────────────────
export const chain: DemoDef = {
  id: 'calc3.chain', module: 'calc3', title: 'The multivariable chain rule',
  topic: 'Chain rule for functions of several variables',
  summary: 'Walk along a path (x(t), y(t)) across the landscape z = f(x, y). The height you feel changes at the rate dz/dt = f_x x′(t) + f_y y′(t) = ∇f · r′(t): each variable contributes its own rate, weighted by how sensitive f is to it.',
  tex: '\\frac{dz}{dt} = \\frac{\\partial f}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial f}{\\partial y}\\frac{dy}{dt} = \\nabla f\\big(\\mathbf r(t)\\big)\\cdot \\mathbf r\'(t)',
  view: 'split3d', animated: true,
  params: [
    { key: 't', label: 't (now; press play)', value: 0.6, min: -20, max: 20, step: 0.001 },
    { key: 't0', label: 't from', value: 0, min: -20, max: 20, step: 0.01 },
    { key: 't1', label: 't to', value: 6.2832, min: -20, max: 20, step: 0.01 },
    ...paramSpecs(1, 1),
  ],
  toggles: [{ key: 'terms', label: 'Show the two terms f_x x′ and f_y y′', value: true }],
  input: { label: 'f(x, y) ; path (x(t), y(t))', value: 'x^2 - y^2/2 + a*x*y/2 ; (1.5 cos(t), sin(t))', placeholder: 'f ; (x(t), y(t))' },
  experiments: [
    'Press play: the slope of z(t) in the left plot is exactly the sum of the two dashed curves.',
    'Find a moment where the path crosses a level curve tangentially: there dz/dt = 0 although you are moving.',
    'Make the path a level curve, e.g. f = x^2 + y^2 ; (cos t, sin t): dz/dt = 0 for all t because r′ ⟂ ∇f.',
    'Physics: a probe carried by a current through a temperature field T(x, y) measures dT/dt = ∇T · v — the advective (material) derivative.',
  ],
  connections: ['calc3.gradient', 'calc3.partials', 'calc3.vecfn'],
  accuracy: 'Both sides are exact: the chain-rule sum uses the symbolic partials of f and the symbolic derivatives of x(t), y(t); dz/dt “direct” is the symbolic derivative of the composite f(x(t), y(t)). They agree to rounding (~10⁻¹⁵).',
  create(ctx) {
    const v = ctx.view3d!, plot = ctx.plot!;
    plot.opts.xLabel = 't'; plot.opts.yLabel = 'z';
    const graph = makeGraph(v, { opacity: 0.9 });
    let src = '', parts: { f: Node; X: Node; Y: Node; dX: Node | null; dY: Node | null; comp: Node; dcomp: Node | null } | null = null, err = '';
    let o: { floorP: Curve; liftP: Curve; pt: Point; vel: Arrow; grd: Arrow; tan: Arrow; drop: Curve } | null = null;
    let lastScene = '';
    const viewKey = memo<boolean>();
    const update = () => {
      if (ctx.input !== src) {
        src = ctx.input;
        const ps = splitParts(src);
        if (ps.length < 2) err = 'Type f(x, y), then a semicolon, then the path (x(t), y(t))';
        else {
          const rf = readFormula(ps[0], ['x', 'y'], 1, 'f(x, y)'), rp = readFormula(ps[1], ['t'], 2, 'the path (x(t), y(t))');
          if (rf.error || rp.error) err = (rf.error ?? rp.error)!;
          else {
            err = '';
            const [X, Y] = rp.items!;
            const comp = simplify(substitute(rf.items![0], { x: X, y: Y }));
            parts = { f: rf.items![0], X, Y, dX: dSym(X, 't'), dY: dSym(Y, 't'), comp, dcomp: dSym(comp, 't') };
          }
        }
      }
      ctx.warn(err);
      if (!parts) return;
      const pv = paramVals(ctx.params);
      const d = derivs2(parts.f, pv);
      const xt = compile(parts.X, ['t'], pv), yt = compile(parts.Y, ['t'], pv);
      const h = 1e-5;
      const dxt = parts.dX ? compile(parts.dX, ['t'], pv) : (a: ArrayLike<number>) => (xt([a[0] + h]) - xt([a[0] - h])) / (2 * h);
      const dyt = parts.dY ? compile(parts.dY, ['t'], pv) : (a: ArrayLike<number>) => (yt([a[0] + h]) - yt([a[0] - h])) / (2 * h);
      const zt = compile(parts.comp, ['t'], pv);
      const dzt = parts.dcomp ? compile(parts.dcomp, ['t'], pv) : (a: ArrayLike<number>) => (zt([a[0] + h]) - zt([a[0] - h])) / (2 * h);
      const t0 = Math.min(ctx.params.t0, ctx.params.t1), t1 = Math.max(ctx.params.t0, ctx.params.t1);
      const t = clamp(ctx.params.t, t0, t1);
      const termX = (s: number) => d.fx([xt([s]), yt([s])]) * dxt([s]), termY = (s: number) => d.fy([xt([s]), yt([s])]) * dyt([s]);
      // domain from the path
      let m = 0;
      const path: [number, number][] = [];
      for (let i = 0; i <= 300; i++) { const s = t0 + ((t1 - t0) * i) / 300, X = xt([s]), Y = yt([s]); path.push([X, Y]); if (Number.isFinite(X + Y)) m = Math.max(m, Math.abs(X), Math.abs(Y)); }
      const R = Math.max(1.5, Math.min(10, m * 1.3));
      const F = (x: number, y: number) => d.f([x, y]);
      const sceneKey = `${src}|${pv.a}|${pv.b}|${t0}|${t1}`;
      const fresh = sceneKey !== lastScene;
      if (fresh) { lastScene = sceneKey; graph.draw(F, -R, R, -R, R); }
      const floor = v.getBounds().z[0];
      const X = xt([t]), Y = yt([t]), Z = F(X, Y), vx = dxt([t]), vy = dyt([t]), fx = d.fx([X, Y]), fy = d.fy([X, Y]);
      const chainV = fx * vx + fy * vy, direct = dzt([t]);
      if (!o) o = {
        floorP: v.addCurve([], { color: '#8b93a7' }), liftP: v.addCurve([], { color: '#f2c14e' }),
        pt: v.addPoint([X, Y, Z], { color: '#ffffff' }),
        vel: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#4fd1d9', label: 'r′(t)' }), grd: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#b48cff', label: '∇f' }),
        tan: v.addArrow([0, 0, 0], [1, 0, 0], { color: '#ff9f5a', label: '(x′, y′, dz/dt)' }), drop: v.addCurve([], { color: '#8b93a7', radius: 0 }),
      };
      if (fresh) { o.floorP.set(path.map(([a, b]) => [a, b, floor] as V3)); o.liftP.set(path.map(([a, b]) => [a, b, F(a, b)] as V3)); }
      o.pt.set([X, Y, Z]);
      o.drop.set([[X, Y, floor], [X, Y, Z]]);
      const sp = Math.hypot(vx, vy), sv = sp > 0 ? (R * 0.4) / Math.max(sp, 1) : 0;
      showArrow(o.vel, [X, Y, floor], [vx * sv, vy * sv, 0]);
      const gl = Math.hypot(fx, fy), sg = gl > 0 ? (R * 0.4) / Math.max(gl, 1) : 0;
      showArrow(o.grd, [X, Y, floor], [fx * sg, fy * sg, 0]);
      showArrow(o.tan, [X, Y, Z], [vx * sv, vy * sv, direct * sv]);
      // z(t) and the two terms
      const p = palette(ctx.dark);
      viewKey(`${src}|${t0}|${t1}|${pv.a}|${pv.b}|${ctx.toggles.terms}`, () => {
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i <= 200; i++) { const s = t0 + ((t1 - t0) * i) / 200; for (const y of [zt([s]), ctx.toggles.terms ? termX(s) : NaN, ctx.toggles.terms ? termY(s) : NaN, ctx.toggles.terms ? dzt([s]) : NaN]) if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
        if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
        const pad = (hi - lo) * 0.1 + 0.1;
        plot.setView({ x0: t0 - (t1 - t0) * 0.03, x1: t1 + (t1 - t0) * 0.03, y0: lo - pad, y1: hi + pad });
        return true;
      });
      plot.setDraw((g) => {
        if (ctx.toggles.terms) {
          g.fn(termX, { color: p.red, width: 1.6, dash: [6, 4] }, [t0, t1]);
          g.fn(termY, { color: p.green, width: 1.6, dash: [6, 4] }, [t0, t1]);
          g.fn((s) => dzt([s]), { color: p.orange, width: 1.6 }, [t0, t1]);
        }
        g.fn((s) => zt([s]), { color: p.gold, width: 2.8 }, [t0, t1]);
        const sp2 = (t1 - t0) * 0.12;
        g.line([t - sp2, Z - direct * sp2], [t + sp2, Z + direct * sp2], { color: p.ink, width: 1.6, dash: [6, 4] });
        g.line([t, g.view.y0], [t, g.view.y1], { color: p.muted, width: 1, alpha: 0.5 });
        const lab = (s: number, y: number, text: string, color: string) => { if (Number.isFinite(y)) g.text([s, y], text, { color, font: '600 12.5px Inter, sans-serif' }, 4, -6); };
        const tl = t0 + (t1 - t0) * 0.82;
        lab(tl, zt([tl]), 'z(t)', p.gold);
        if (ctx.toggles.terms) { lab(t0 + (t1 - t0) * 0.05, termX(t0 + (t1 - t0) * 0.05), 'f_x x′', p.red); lab(t0 + (t1 - t0) * 0.3, termY(t0 + (t1 - t0) * 0.3), 'f_y y′', p.green); lab(t0 + (t1 - t0) * 0.55, dzt([t0 + (t1 - t0) * 0.55]), 'dz/dt', p.orange); }
        g.handle({ id: 't', at: [t, Z], color: p.gold, onDrag: ([s]) => { ctx.setParam('t', clamp(s, t0, t1)); update(); }, constrain: ([s]) => [clamp(s, t0, t1), zt([clamp(s, t0, t1)])] });
      });
      ctx.setReadouts([
        { label: 't', value: fmt(t, 5) },
        { label: 'r(t) = (x, y)', value: `(${fmt(X, 5)}, ${fmt(Y, 5)})` },
        { label: 'z = f(r(t))', value: fmt(Z, 6) },
        { label: 'f_x · x′(t)', value: `${fmt(fx, 4)} × ${fmt(vx, 4)} = ${fmt(fx * vx, 6)}` },
        { label: 'f_y · y′(t)', value: `${fmt(fy, 4)} × ${fmt(vy, 4)} = ${fmt(fy * vy, 6)}` },
        { label: 'chain rule:  ∇f · r′', value: fmt(chainV, 10), tone: 'good' },
        { label: 'direct:  d/dt f(x(t), y(t))', value: fmt(direct, 10) + (parts.dcomp ? '' : ' (numerical)') },
        { label: '|difference|', value: Math.abs(chainV - direct).toExponential(1), tone: 'muted' },
      ]);
      ctx.setSteps([
        { title: 'Partial derivatives of f', tex: `f_x = ${texOf(d.nx)},\\qquad f_y = ${texOf(d.ny)}` },
        { title: 'Derivatives of the path', tex: `x'(t) = ${texOf(parts.dX)},\\qquad y'(t) = ${texOf(parts.dY)}` },
        { title: `At t = ${fmt(t)}`, tex: `\\frac{dz}{dt} = (${fmt(fx)})(${fmt(vx)}) + (${fmt(fy)})(${fmt(vy)}) = ${fmt(chainV, 8)}`, rule: 'chain rule' },
        { title: 'Check: differentiate the composite directly', tex: `z(t) = ${toTeX(parts.comp).slice(0, 400)}`, detail: parts.dcomp ? `Its derivative at $t = ${fmt(t)}$ is $${fmt(direct, 8)}$ — the same number.` : 'No symbolic derivative available for the composite; checked numerically.' },
      ]);
      ctx.setNote(`The gold curve on the surface is the path lifted to $z = f(x(t), y(t))$. At this moment $\\nabla f = (${fmt(fx)}, ${fmt(fy)})$ (violet, on the floor) and $\\mathbf r'(t) = (${fmt(vx)}, ${fmt(vy)})$ (cyan), so $dz/dt = \\nabla f\\cdot\\mathbf r' = ${fmt(chainV)}$ — the slope of the dashed tangent in the left plot. Arrows on the floor are scaled to fit.`);
    };
    let dir = 1;
    return {
      update,
      tick(dt) {
        const t0 = Math.min(ctx.params.t0, ctx.params.t1), t1 = Math.max(ctx.params.t0, ctx.params.t1);
        let t = ctx.params.t + dir * dt * (t1 - t0) / 10;
        if (t > t1) { t = t1; dir = -1; } if (t < t0) { t = t0; dir = 1; }
        ctx.setParam('t', t); update();
      },
      dispose() { v.clear(); },
    };
  },
};

