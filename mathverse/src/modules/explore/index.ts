// The universal input's visualizers: whatever the input classifier recognizes
// becomes a live, interactive demo — sliders for every parameter, draggable
// points, derivatives, tangent planes, flows and solution curves.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { classify, Classified } from '../../core/input/classify';
import { Node, compile, derivative, toTeX, NotDifferentiable, freeSymbols, Fn, simplify } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { solveAdaptive } from '../../core/numeric/ode';
import { eig, det, Mat } from '../../core/numeric/linalg';
import { findRoots, criticalPoints, inflectionPoints } from '../../core/numeric/roots';
import { SERIES, colormapCss } from '../../engine/colors';
import type { V3 } from '../../engine/viewport3d';

const fmt = (v: number, d = 4) => (Number.isFinite(v) ? String(+v.toPrecision(d)) : v > 0 ? '∞' : v < 0 ? '−∞' : 'undefined');

/** Build a demo for a classified statement. */
export function exploreDemo(src: string): DemoDef {
  const c = classify(src);
  const base = {
    id: 'explore', module: 'explore' as const, title: titleFor(c), topic: c.describe, summary: c.describe, tex: c.tex,
    params: c.params, experiments: experimentsFor(c), connections: [] as string[],
    input: { label: 'Expression', value: src },
  };
  switch (c.kind) {
    case 'function': return { ...base, view: '2d', toggles: [{ key: 'd1', label: "Show f′", value: true }, { key: 'd2', label: 'Show f″', value: false }, { key: 'area', label: 'Shade ∫ from a to b', value: false }, { key: 'marks', label: 'Mark roots and extrema', value: true }],
      params: [...c.params, { key: 'x0', label: 'x₀ (drag the point)', value: 1, min: -10, max: 10, step: 0.01 }, { key: 'a', label: 'a', value: 0, min: -10, max: 10, step: 0.01 }, { key: 'b', label: 'b', value: 2, min: -10, max: 10, step: 0.01 }].filter((p, i, arr) => arr.findIndex((q) => q.key === p.key) === i),
      accuracy: 'Derivatives are exact (symbolic). Roots and extrema are found numerically (Brent’s method, ~1e−13). The area is adaptive Gauss–Kronrod quadrature with its error estimate.',
      create: (ctx) => functionDemo(ctx, c) };
    case 'surface': return { ...base, view: '3d', toggles: [{ key: 'plane', label: 'Tangent plane', value: true }, { key: 'grad', label: 'Gradient ∇f', value: true }, { key: 'contours', label: 'Level curves', value: false }],
      params: [...c.params, { key: 'px', label: 'x₀', value: 0.5, min: -3, max: 3, step: 0.01 }, { key: 'py', label: 'y₀', value: 0.5, min: -3, max: 3, step: 0.01 }, { key: 'range', label: 'Domain half-width', value: 3, min: 0.5, max: 10, step: 0.1 }],
      accuracy: 'Partial derivatives, the tangent plane and the gradient are exact (symbolic).', create: (ctx) => surfaceDemo(ctx, c) };
    case 'curve2d': case 'polar': return { ...base, view: '2d', animated: true, params: [...c.params, { key: 't0', label: 'from', value: c.kind === 'polar' ? 0 : -Math.PI, min: -20, max: 20, step: 0.01 }, { key: 't1', label: 'to', value: c.kind === 'polar' ? 2 * Math.PI : Math.PI, min: -20, max: 20, step: 0.01 }, { key: 'tt', label: 'parameter now', value: 0, min: -20, max: 20, step: 0.01 }],
      toggles: [{ key: 'vel', label: 'Velocity vector', value: true }], create: (ctx) => curve2dDemo(ctx, c) };
    case 'curve3d': return { ...base, view: '3d', animated: true, params: [...c.params, { key: 't0', label: 'from', value: 0, min: -20, max: 20, step: 0.01 }, { key: 't1', label: 'to', value: 4 * Math.PI, min: -20, max: 20, step: 0.01 }, { key: 'tt', label: 'parameter now', value: 1, min: -20, max: 20, step: 0.01 }],
      toggles: [{ key: 'frame', label: 'Frenet frame T, N, B', value: true }], accuracy: 'Tangent, normal, binormal, curvature and torsion use exact symbolic derivatives.', create: (ctx) => curve3dDemo(ctx, c) };
    case 'paramSurface': return { ...base, view: '3d', params: [...c.params, { key: 'u0', label: 'u from', value: 0, min: -10, max: 10, step: 0.01 }, { key: 'u1', label: 'u to', value: 2 * Math.PI, min: -10, max: 10, step: 0.01 }, { key: 'v0', label: 'v from', value: 0, min: -10, max: 10, step: 0.01 }, { key: 'v1', label: 'v to', value: Math.PI, min: -10, max: 10, step: 0.01 }], create: (ctx) => paramSurfaceDemo(ctx, c) };
    case 'field2d': return { ...base, view: '2d', animated: true, toggles: [{ key: 'particles', label: 'Particles in the flow', value: true }], create: (ctx) => field2dDemo(ctx, c) };
    case 'field3d': return { ...base, view: '3d', animated: true, toggles: [{ key: 'particles', label: 'Particles in the flow', value: true }], create: (ctx) => field3dDemo(ctx, c) };
    case 'matrix': return { ...base, view: '2d', animated: true, params: [...c.params, { key: 'mix', label: 'Transformation progress', value: 1, min: 0, max: 1, step: 0.01 }], toggles: [{ key: 'eig', label: 'Eigenvectors', value: true }], create: (ctx) => matrixDemo(ctx, c) };
    case 'ode1': case 'ode2': case 'odeSystem': return { ...base, view: c.kind === 'ode2' ? 'split2d' : '2d', animated: false,
      params: [...c.params, { key: 'T', label: 'solve until t =', value: 10, min: 1, max: 60, step: 0.1 }], accuracy: 'Solutions are numerical (adaptive Dormand–Prince 5(4), relative tolerance 1e−8). Click the field to start a solution there.', create: (ctx) => odeDemo(ctx, c) };
    case 'implicit2d': return { ...base, view: '2d', create: (ctx) => implicitDemo(ctx, c) };
    case 'value': return { ...base, view: '2d', create: (ctx) => { ctx.setReadouts([{ label: 'Value', value: fmt(c.value!, 15) }]); return { update() {}, dispose() {} }; } };
    default: return { ...base, view: '2d', create: (ctx) => { ctx.setNote(c.describe + ' — open the matching module for its full interactive demonstration.'); return { update() {}, dispose() {} }; } };
  }
}

function titleFor(c: Classified): string {
  return ({ function: 'Function explorer', surface: 'Surface explorer', curve2d: 'Parametric curve', polar: 'Polar curve', curve3d: 'Space curve', paramSurface: 'Parametric surface', field2d: 'Vector field', field3d: 'Vector field in space', matrix: 'Matrix as a transformation', vector: 'Vector', ode1: 'First-order ODE', ode2: 'Second-order ODE', odeSystem: 'System of ODEs', pde: 'PDE', implicit2d: 'Implicit curve', implicit3d: 'Implicit surface', value: 'Evaluate' } as Record<string, string>)[c.kind] ?? 'Explore';
}

function experimentsFor(c: Classified): string[] {
  switch (c.kind) {
    case 'function': return ['Drag the point along the curve: watch the tangent and the slope f′(x₀).', 'Turn on f″ — where it crosses zero, the curve changes concavity.', 'Shade the area from a to b and compare it with F(b) − F(a).'];
    case 'surface': return ['Drag the point on the surface: the tangent plane and gradient follow.', 'Find where the gradient vanishes — a peak, a pit, or a saddle?', 'Turn on level curves: the gradient is always perpendicular to them.'];
    case 'ode1': case 'odeSystem': return ['Click anywhere to start a solution there.', 'Find the equilibria — where do nearby solutions go?'];
    case 'matrix': return ['Slide the transformation progress from 0 to 1.', 'The eigenvectors stay on their own lines — only stretched.', 'Make the determinant zero: the plane collapses onto a line.'];
    default: return ['Move the sliders and watch what changes.'];
  }
}

function paramVals(ctx: DemoCtx, c: Classified): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of c.params) out[p.key] = ctx.params[p.key] ?? p.value;
  return out;
}

function safeDeriv(n: Node, x: string): Node | null { try { return derivative(n, x); } catch (e) { if (e instanceof NotDifferentiable) return null; throw e; } }

// ── f(x) ──────────────────────────────────────────────────────────────────
function functionDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const plot = ctx.plot!;
  const x = c.vars[0];
  plot.opts.xLabel = x; plot.opts.yLabel = c.name && c.name !== 'y' ? `${c.name}(${x})` : 'y';
  const d1n = safeDeriv(c.exprs[0], x), d2n = d1n ? safeDeriv(d1n, x) : null;
  const update = () => {
    const pv = paramVals(ctx, c);
    const f = compile(c.exprs[0], [x], pv), F = (t: number) => f([t]);
    const d1 = d1n ? compile(d1n, [x], pv) : null, D1 = (t: number) => (d1 ? d1([t]) : (F(t + 1e-5) - F(t - 1e-5)) / 2e-5);
    const d2 = d2n ? compile(d2n, [x], pv) : null, D2 = (t: number) => (d2 ? d2([t]) : (F(t + 1e-3) - 2 * F(t) + F(t - 1e-3)) / 1e-6);
    const x0 = ctx.params.x0, y0 = F(x0), m = D1(x0);
    const { a, b } = ctx.params;
    let area: ReturnType<typeof integrate> | null = null;
    if (ctx.toggles.area) area = integrate(F, Math.min(a, b), Math.max(a, b));
    plot.setDraw((g) => {
      if (ctx.toggles.area && area) g.fillBetween(F, () => 0, Math.min(a, b), Math.max(a, b), { fill: 'rgba(106,169,255,0.22)' });
      if (ctx.toggles.d2) g.fn(D2, { color: SERIES[4], width: 1.6, dash: [4, 4] });
      if (ctx.toggles.d1) g.fn(D1, { color: SERIES[3], width: 1.8, dash: [7, 5] });
      g.fn(F, { color: SERIES[0], width: 2.6 });
      if (Number.isFinite(y0) && Number.isFinite(m)) {
        const span = (g.view.x1 - g.view.x0) * 0.25;
        g.line([x0 - span, y0 - m * span], [x0 + span, y0 + m * span], { color: SERIES[1], width: 2 });
      }
      if (ctx.toggles.marks) {
        const { x0: lo, x1: hi } = g.view;
        for (const r of findRoots(F, lo, hi)) g.point([r, 0], 4, { fill: SERIES[2] });
        for (const cp of criticalPoints(F, D1, D2, lo, hi)) g.point([cp.x, cp.y], 5, { fill: cp.kind === 'max' ? '#ff9f5a' : '#4fd1d9' });
        for (const ip of inflectionPoints(F, D2, lo, hi)) g.point([ip.x, ip.y], 4, { fill: SERIES[4] });
      }
      g.handle({ id: 'x0', at: [x0, Number.isFinite(y0) ? y0 : 0], color: SERIES[1], onDrag: ([px]) => ctx.setParam('x0', px), constrain: ([px]) => [px, F(px)] });
    });
    const rows: Readout[] = [
      { label: `${c.name ?? 'f'}(x₀)`, value: fmt(y0) },
      { label: `${c.name ?? 'f'}′(x₀)  slope`, value: fmt(m) + (d1n ? '' : ' (numerical)') },
      { label: `${c.name ?? 'f'}″(x₀)`, value: fmt(D2(x0)) + (d2n ? '' : ' (numerical)'), tone: D2(x0) > 0 ? 'good' : D2(x0) < 0 ? 'warn' : 'muted' },
    ];
    if (d1n) rows.push({ label: 'f′(x)', value: toTeX(d1n), tex: true });
    if (area) rows.push({ label: `∫ from ${fmt(a, 3)} to ${fmt(b, 3)}`, value: `${fmt(area.value * Math.sign(b - a || 1), 10)} ± ${area.error.toExponential(1)}`, tone: area.warning ? 'warn' : undefined });
    ctx.setReadouts(rows);
    ctx.warn(area?.warning ?? (!Number.isFinite(y0) ? `${c.name ?? 'f'} is not defined at x₀ = ${fmt(x0)}` : ''));
    ctx.setNote(`Tangent line at $x_0$: $y = ${fmt(y0)} + ${fmt(m)}\\,(x - ${fmt(x0)})$. Concave ${D2(x0) > 0 ? 'up' : D2(x0) < 0 ? 'down' : 'flat'} there. Roots are red, maxima orange, minima cyan, inflection points violet.`);
  };
  return { update, dispose() {} };
}

// ── z = f(x, y) ───────────────────────────────────────────────────────────
function surfaceDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const v = ctx.view3d!;
  const [xs, ys] = c.vars;
  const fx = safeDeriv(c.exprs[0], xs), fy = safeDeriv(c.exprs[0], ys);
  let surf: ReturnType<typeof v.addGraph> | null = null, plane: ReturnType<typeof v.addPlane> | null = null;
  let grad: ReturnType<typeof v.addArrow> | null = null, pt: ReturnType<typeof v.addPoint> | null = null;
  const contours: ReturnType<typeof v.addCurve>[] = [];
  let f: Fn = () => 0, Fx: Fn = () => 0, Fy: Fn = () => 0, R = 3;
  const update = () => {
    const pv = paramVals(ctx, c);
    f = compile(c.exprs[0], [xs, ys], pv);
    Fx = fx ? compile(fx, [xs, ys], pv) : (p) => (f([p[0] + 1e-5, p[1]]) - f([p[0] - 1e-5, p[1]])) / 2e-5;
    Fy = fy ? compile(fy, [xs, ys], pv) : (p) => (f([p[0], p[1] + 1e-5]) - f([p[0], p[1] - 1e-5])) / 2e-5;
    R = ctx.params.range;
    // z bounds from a coarse sample, clipped to keep the picture readable
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 30; i++) for (let j = 0; j <= 30; j++) { const z = f([-R + (2 * R * i) / 30, -R + (2 * R * j) / 30]); if (Number.isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); } }
    if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
    const zr = Math.max(hi - lo, 1e-6), zl = Math.max(lo, -4 * R), zh = Math.min(hi, 4 * R);
    const bnds = v.getBounds();
    if (bnds.x[1] !== R || Math.abs(bnds.z[0] - zl) > zr * 0.2 || Math.abs(bnds.z[1] - zh) > zr * 0.2) v.setBounds({ x: [-R, R], y: [-R, R], z: [Math.min(zl, 0), Math.max(zh, 0)] });
    const g = (X: number, Y: number) => { const z = f([X, Y]); return z < zl - zr || z > zh + zr ? NaN : z; };
    if (!surf) surf = v.addGraph(g, [-R, R], [-R, R], { res: 90 }); else surf.update((X, Y) => { const z = g(X, Y); return Number.isFinite(z) ? [X, Y, z] : null; }, { uRange: [-R, R], vRange: [-R, R] });
    const px = Math.max(-R, Math.min(R, ctx.params.px)), py = Math.max(-R, Math.min(R, ctx.params.py));
    const z0 = f([px, py]), gx = Fx([px, py]), gy = Fy([px, py]);
    const P: V3 = [px, py, z0];
    if (!pt) pt = v.addPoint(P, { color: '#ffffff', drag: { constrain: ([X, Y]) => [X, Y, f([X, Y])], onDrag: ([X, Y]) => { ctx.setParam('px', X); ctx.setParam('py', Y); } } }); else pt.set(P);
    if (ctx.toggles.plane) { if (!plane) plane = v.addPlane(P, [-gx, -gy, 1], R * 0.9, { color: '#b48cff', opacity: 0.5 }); else plane.set(P, [-gx, -gy, 1]); plane.visible(true); } else plane?.visible(false);
    const gl = Math.hypot(gx, gy), sc = gl > 0 ? Math.min(R * 0.6, gl) / gl : 0;
    if (ctx.toggles.grad) { if (!grad) grad = v.addArrow([px, py, z0], [gx * sc, gy * sc, 0], { color: '#f2c14e', label: '∇f' }); else grad.set([px, py, z0], [gx * sc, gy * sc, 0]); grad.visible(true); } else grad?.visible(false);
    contours.splice(0).forEach((h) => h.dispose());
    if (ctx.toggles.contours) {
      for (let k = 1; k < 10; k++) {
        const level = lo + ((hi - lo) * k) / 10;
        const segs = marchingSquares((X, Y) => f([X, Y]) - level, R, 70);
        for (const s of segs) contours.push(v.addCurve(s.map(([X, Y]) => [X, Y, level] as V3), { color: colormapCss('turbo', k / 10), radius: 0 }));
      }
    }
    ctx.setReadouts([
      { label: 'f(x₀, y₀)', value: fmt(z0) },
      { label: '∂f/∂x', value: fmt(gx) + (fx ? '' : ' (numerical)') },
      { label: '∂f/∂y', value: fmt(gy) + (fy ? '' : ' (numerical)') },
      { label: '|∇f|  steepest slope', value: fmt(gl) },
      ...(fx ? [{ label: '∂f/∂x', value: toTeX(fx), tex: true }] : []),
      ...(fy ? [{ label: '∂f/∂y', value: toTeX(fy), tex: true }] : []),
    ]);
    ctx.setNote(`Tangent plane: $z = ${fmt(z0)} + ${fmt(gx)}(x - ${fmt(px)}) + ${fmt(gy)}(y - ${fmt(py)})$. The gradient points uphill, as steeply as possible, and is perpendicular to the level curve through the point.`);
  };
  return { update, dispose() { v.clear(); } };
}

function marchingSquares(F: (x: number, y: number) => number, R: number, n: number): [number, number][][] {
  const h = (2 * R) / n, segs: [number, number][][] = [];
  const val = (i: number, j: number) => F(-R + i * h, -R + j * h);
  const lerp = (a: number, b: number) => a / (a - b);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = val(i, j), b = val(i + 1, j), cc = val(i + 1, j + 1), d = val(i, j + 1);
    if (![a, b, cc, d].every(Number.isFinite)) continue;
    const X = -R + i * h, Y = -R + j * h, e: [number, number][] = [];
    if ((a < 0) !== (b < 0)) e.push([X + lerp(a, b) * h, Y]);
    if ((b < 0) !== (cc < 0)) e.push([X + h, Y + lerp(b, cc) * h]);
    if ((cc < 0) !== (d < 0)) e.push([X + (1 - lerp(cc, d)) * h, Y + h]);
    if ((d < 0) !== (a < 0)) e.push([X, Y + (1 - lerp(d, a)) * h]);
    if (e.length >= 2) segs.push([e[0], e[1]]);
  }
  return segs;
}

// ── parametric and polar curves in the plane ──────────────────────────────
function curve2dDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  const t = c.vars[0];
  const comps = c.kind === 'polar' ? null : c.exprs;
  const dx = comps ? safeDeriv(comps[0], t) : null, dy = comps ? safeDeriv(comps[1], t) : null;
  const update = () => {
    const pv = paramVals(ctx, c);
    let X: (s: number) => number, Y: (s: number) => number;
    if (c.kind === 'polar') { const r = compile(c.exprs[0], [t], pv); X = (s) => r([s]) * Math.cos(s); Y = (s) => r([s]) * Math.sin(s); }
    else { const fx = compile(c.exprs[0], [t], pv), fy = compile(c.exprs[1], [t], pv); X = (s) => fx([s]); Y = (s) => fy([s]); }
    const { t0, t1 } = ctx.params;
    const tt = Math.min(Math.max(ctx.params.tt, Math.min(t0, t1)), Math.max(t0, t1));
    const vx = dx ? compile(dx, [t], pv)([tt]) : (X(tt + 1e-5) - X(tt - 1e-5)) / 2e-5;
    const vy = dy ? compile(dy, [t], pv)([tt]) : (Y(tt + 1e-5) - Y(tt - 1e-5)) / 2e-5;
    const speed = Math.hypot(vx, vy);
    const L = integrate((s) => { const a = (X(s + 1e-6) - X(s - 1e-6)) / 2e-6, b = (Y(s + 1e-6) - Y(s - 1e-6)) / 2e-6; return Math.hypot(a, b); }, t0, t1, 1e-8);
    plot.setDraw((g) => {
      g.parametric(X, Y, t0, t1, { color: SERIES[0], width: 1.4, alpha: 0.45 }, 1200);
      g.parametric(X, Y, t0, tt, { color: SERIES[0], width: 2.6 }, 900);
      if (ctx.toggles.vel) g.arrow([X(tt), Y(tt)], [X(tt) + vx * 0.3, Y(tt) + vy * 0.3], { color: SERIES[1], width: 2 });
      g.handle({ id: 'p', at: [X(tt), Y(tt)], color: SERIES[1], onDrag: (p) => {
        // move the parameter to the nearest point of the curve
        let best = tt, bd = Infinity;
        for (let i = 0; i <= 600; i++) { const s = t0 + ((t1 - t0) * i) / 600; const d = Math.hypot(X(s) - p[0], Y(s) - p[1]); if (d < bd) { bd = d; best = s; } }
        ctx.setParam('tt', best);
      } });
    });
    ctx.setReadouts([{ label: `${t}`, value: fmt(tt) }, { label: 'point', value: `(${fmt(X(tt))}, ${fmt(Y(tt))})` }, { label: 'speed |r′|', value: fmt(speed) }, { label: `arc length ${fmt(t0, 3)}…${fmt(t1, 3)}`, value: `${fmt(L.value, 8)} (numerical)` }]);
  };
  let dir = 1;
  return {
    update,
    tick(dt) { const { t0, t1 } = ctx.params; let v = ctx.params.tt + dir * dt * (t1 - t0) / 8; if (v > Math.max(t0, t1)) { v = Math.max(t0, t1); dir = -1; } if (v < Math.min(t0, t1)) { v = Math.min(t0, t1); dir = 1; } ctx.setParam('tt', v); update(); },
    dispose() {},
  };
}

// ── space curves with the Frenet frame ────────────────────────────────────
function curve3dDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const v = ctx.view3d!;
  const t = c.vars[0];
  const d1 = c.exprs.map((e) => safeDeriv(e, t)), d2 = d1.map((e) => (e ? safeDeriv(e, t) : null)), d3 = d2.map((e) => (e ? safeDeriv(e, t) : null));
  let curve: ReturnType<typeof v.addCurve> | null = null, pt: ReturnType<typeof v.addPoint> | null = null;
  const arrows: ReturnType<typeof v.addArrow>[] = [];
  const update = () => {
    const pv = paramVals(ctx, c);
    const r = c.exprs.map((e) => compile(e, [t], pv));
    const num = (k: number, s: number, order: number) => { const h = 1e-4; const f = (q: number) => r[k]([q]); return order === 1 ? (f(s + h) - f(s - h)) / (2 * h) : order === 2 ? (f(s + h) - 2 * f(s) + f(s - h)) / (h * h) : (f(s + 2 * h) - 2 * f(s + h) + 2 * f(s - h) - f(s - 2 * h)) / (2 * h * h * h); };
    const D = (arr: (Node | null)[], order: number) => arr.map((e, k) => (e ? ((q: number) => compile(e, [t], pv)([q])) : (q: number) => num(k, q, order)));
    const R1 = D(d1, 1), R2 = D(d2, 2), R3 = D(d3, 3);
    const { t0, t1 } = ctx.params, tt = ctx.params.tt;
    const pts: V3[] = [];
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i <= 800; i++) { const s = t0 + ((t1 - t0) * i) / 800; const p = r.map((f) => f([s])) as V3; pts.push(p); p.forEach((x, k) => { if (Number.isFinite(x)) { lo[k] = Math.min(lo[k], x); hi[k] = Math.max(hi[k], x); } }); }
    const m = Math.max(1, ...hi.map((h, k) => Math.max(Math.abs(h), Math.abs(lo[k]))));
    if (Math.abs(v.getBounds().x[1] - m * 1.1) > m * 0.3) v.setBounds({ x: [-m * 1.1, m * 1.1], y: [-m * 1.1, m * 1.1], z: [-m * 1.1, m * 1.1] });
    if (!curve) curve = v.addCurve(pts, { color: SERIES[0] }); else curve.set(pts);
    const P = r.map((f) => f([tt])) as V3, v1 = R1.map((f) => f(tt)) as V3, a = R2.map((f) => f(tt)) as V3, j = R3.map((f) => f(tt)) as V3;
    const crossv = (p: V3, q: V3): V3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
    const len = (p: V3) => Math.hypot(...p), unit = (p: V3): V3 => { const l = len(p); return l ? [p[0] / l, p[1] / l, p[2] / l] : [0, 0, 0]; };
    const T = unit(v1), vxa = crossv(v1, a), B = unit(vxa), N = crossv(B, T);
    const kappa = len(vxa) / Math.pow(len(v1), 3);
    const tau = len(vxa) > 1e-12 ? (vxa[0] * j[0] + vxa[1] * j[1] + vxa[2] * j[2]) / (len(vxa) ** 2) : 0;
    if (!pt) pt = v.addPoint(P, { color: '#ffffff' }); else pt.set(P);
    arrows.splice(0).forEach((h) => h.dispose());
    if (ctx.toggles.frame) {
      const s = m * 0.35;
      arrows.push(v.addArrow(P, [T[0] * s, T[1] * s, T[2] * s], { color: '#ef6b73', label: 'T' }), v.addArrow(P, [N[0] * s, N[1] * s, N[2] * s], { color: '#6fcf97', label: 'N' }), v.addArrow(P, [B[0] * s, B[1] * s, B[2] * s], { color: '#6aa9ff', label: 'B' }));
    }
    ctx.setReadouts([{ label: `${t}`, value: fmt(tt) }, { label: 'speed |r′|', value: fmt(len(v1)) }, { label: 'curvature κ', value: fmt(kappa) }, { label: 'torsion τ', value: fmt(tau) }, { label: 'radius of curvature 1/κ', value: fmt(1 / kappa) }]);
    ctx.setNote('$\\kappa = \\dfrac{|\\mathbf r\' \\times \\mathbf r\'\'|}{|\\mathbf r\'|^3}$, $\\tau = \\dfrac{(\\mathbf r\' \\times \\mathbf r\'\') \\cdot \\mathbf r\'\'\'}{|\\mathbf r\' \\times \\mathbf r\'\'|^2}$. T is the direction of motion, N points toward the centre of curvature, B = T × N.');
  };
  let dir = 1;
  return { update, tick(dt) { const { t0, t1 } = ctx.params; let s = ctx.params.tt + dir * dt * (t1 - t0) / 10; if (s > t1) { s = t1; dir = -1; } if (s < t0) { s = t0; dir = 1; } ctx.setParam('tt', s); update(); }, dispose() { v.clear(); } };
}

function paramSurfaceDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const v = ctx.view3d!;
  let s: ReturnType<typeof v.addSurface> | null = null;
  const update = () => {
    const pv = paramVals(ctx, c);
    const [u, w] = c.vars;
    const r = c.exprs.map((e) => compile(e, [u, w], pv));
    const f = (a: number, b: number): V3 | null => { const p = r.map((g) => g([a, b])) as V3; return p.every(Number.isFinite) ? p : null; };
    let m = 1;
    for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) { const p = f(ctx.params.u0 + ((ctx.params.u1 - ctx.params.u0) * i) / 20, ctx.params.v0 + ((ctx.params.v1 - ctx.params.v0) * j) / 20); if (p) m = Math.max(m, ...p.map(Math.abs)); }
    if (Math.abs(v.getBounds().x[1] - m * 1.2) > m * 0.3) v.setBounds({ x: [-m * 1.2, m * 1.2], y: [-m * 1.2, m * 1.2], z: [-m * 1.2, m * 1.2] });
    const opts = { uRange: [ctx.params.u0, ctx.params.u1] as [number, number], vRange: [ctx.params.v0, ctx.params.v1] as [number, number], res: 100, colorBy: 'height' as const };
    if (!s) s = v.addSurface(f, opts); else s.update(f, opts);
  };
  return { update, dispose() { v.clear(); } };
}

// ── vector fields ─────────────────────────────────────────────────────────
function field2dDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  const [xs, ys] = c.vars;
  const P = c.exprs[0], Q = c.exprs[1];
  const div = (() => { try { return simplify({ t: 'add', a: derivative(P, xs), b: derivative(Q, ys) }); } catch { return null; } })();
  const curl = (() => { try { return simplify({ t: 'sub', a: derivative(Q, xs), b: derivative(P, ys) }); } catch { return null; } })();
  let F: (x: number, y: number) => [number, number] = () => [0, 0];
  const parts: [number, number, number][] = [];
  const seed = () => { const { x0, x1, y0, y1 } = plot.view; return [x0 + Math.random() * (x1 - x0), y0 + Math.random() * (y1 - y0), Math.random() * 4] as [number, number, number]; };
  const draw = () => plot.setDraw((g) => {
    g.field((x, y) => F(x, y), 22);
    if (ctx.toggles.particles) for (const p of parts) g.point([p[0], p[1]], 2.2, { fill: '#ffe08a' });
  });
  const update = () => {
    const pv = paramVals(ctx, c);
    const fp = compile(P, [xs, ys], pv), fq = compile(Q, [xs, ys], pv);
    F = (x, y) => [fp([x, y]), fq([x, y])];
    if (!parts.length) for (let i = 0; i < 400; i++) parts.push(seed());
    const rows: Readout[] = [];
    if (div) rows.push({ label: 'div F = ∂P/∂x + ∂Q/∂y', value: toTeX(div), tex: true });
    if (curl) rows.push({ label: 'curl F (scalar) = ∂Q/∂x − ∂P/∂y', value: toTeX(curl), tex: true });
    ctx.setReadouts(rows);
    ctx.setNote('Particles are carried by the flow. Where the divergence is positive the flow spreads out (a source); where the curl is nonzero it rotates.');
    draw();
  };
  return {
    update,
    tick(dt) {
      const { x0, x1, y0, y1 } = plot.view;
      const scale = (x1 - x0) * 0.05;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const [u, w] = F(p[0], p[1]);
        const m = Math.hypot(u, w);
        const k = m > 0 ? Math.min(1, 6 / m) : 0;      // keep fast regions from teleporting particles
        p[0] += u * k * dt * scale; p[1] += w * k * dt * scale; p[2] -= dt;
        if (p[2] < 0 || p[0] < x0 || p[0] > x1 || p[1] < y0 || p[1] > y1 || !Number.isFinite(p[0] + p[1])) parts[i] = seed();
      }
      draw();
    },
    dispose() {},
  };
}

function field3dDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const v = ctx.view3d!;
  v.setBounds({ x: [-2, 2], y: [-2, 2], z: [-2, 2] });
  let field: ReturnType<typeof v.addVectorField> | null = null;
  const parts = v.addParticles(1500);
  const pos = new Float32Array(1500 * 3), life = new Float32Array(1500);
  let F: (p: V3) => V3 = () => [0, 0, 0];
  const seed = (i: number) => { pos[3 * i] = (Math.random() * 2 - 1) * 2; pos[3 * i + 1] = (Math.random() * 2 - 1) * 2; pos[3 * i + 2] = (Math.random() * 2 - 1) * 2; life[i] = Math.random() * 5; };
  for (let i = 0; i < 1500; i++) seed(i);
  const vs = ['x', 'y', 'z'];
  let divN: Node | null = null, curlN: Node[] | null = null;
  try { divN = simplify({ t: 'add', a: { t: 'add', a: derivative(c.exprs[0], 'x'), b: derivative(c.exprs[1], 'y') }, b: derivative(c.exprs[2], 'z') }); } catch { divN = null; }
  try { curlN = ([{ t: 'sub', a: derivative(c.exprs[2], 'y'), b: derivative(c.exprs[1], 'z') }, { t: 'sub', a: derivative(c.exprs[0], 'z'), b: derivative(c.exprs[2], 'x') }, { t: 'sub', a: derivative(c.exprs[1], 'x'), b: derivative(c.exprs[0], 'y') }] as Node[]).map(simplify); } catch { curlN = null; }
  const update = () => {
    const pv = paramVals(ctx, c);
    const f = c.exprs.map((e) => compile(e, vs, pv));
    F = (p) => f.map((g) => g(p)) as V3;
    if (!field) field = v.addVectorField(F, { n: 7 }); else field.update(F);
    parts.visible(!!ctx.toggles.particles);
    const rows: Readout[] = [];
    if (divN) rows.push({ label: '∇·F', value: toTeX(divN), tex: true });
    if (curlN) rows.push({ label: '∇×F', value: `\\left(${curlN.map((n) => toTeX(n)).join(',\\ ')}\\right)`, tex: true });
    ctx.setReadouts(rows);
  };
  return {
    update,
    tick(dt) {
      for (let i = 0; i < 1500; i++) {
        const p: V3 = [pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]];
        const w = F(p), m = Math.hypot(...w), k = m > 0 ? Math.min(1, 3 / m) : 0;
        pos[3 * i] += w[0] * k * dt * 0.5; pos[3 * i + 1] += w[1] * k * dt * 0.5; pos[3 * i + 2] += w[2] * k * dt * 0.5;
        life[i] -= dt;
        if (life[i] < 0 || Math.max(Math.abs(pos[3 * i]), Math.abs(pos[3 * i + 1]), Math.abs(pos[3 * i + 2])) > 2.2 || !Number.isFinite(pos[3 * i])) seed(i);
      }
      parts.set(pos, 1500);
    },
    dispose() { v.clear(); },
  };
}

// ── a matrix as a transformation ──────────────────────────────────────────
function matrixDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -4, x1: 4, y0: -4, y1: 4 });
  const node = c.exprs[0] as Extract<Node, { t: 'matrix' }>;
  const update = () => {
    const pv = paramVals(ctx, c);
    const A: Mat = node.rows.map((r) => r.map((e) => compile(e, [], pv)([])));
    if (A.length !== 2 || A[0].length !== 2) {
      ctx.setNote('MathVerse shows 2×2 matrices here as transformations of the plane; open Linear Algebra for 3×3 matrices in space.');
      ctx.setReadouts([{ label: 'determinant', value: A.length === A[0].length ? fmt(det(A)) : '— (not square)' }]);
      return;
    }
    const s = ctx.params.mix;
    const M: Mat = [[1 + s * (A[0][0] - 1), s * A[0][1]], [s * A[1][0], 1 + s * (A[1][1] - 1)]];
    const T = (p: [number, number]): [number, number] => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
    const ev = eig(A);
    plot.setDraw((g) => {
      for (let k = -6; k <= 6; k++) {
        g.path(Array.from({ length: 2 }, (_, i) => T([k, i ? 6 : -6])), { color: 'rgba(106,169,255,0.35)', width: 1 });
        g.path(Array.from({ length: 2 }, (_, i) => T([i ? 6 : -6, k])), { color: 'rgba(106,169,255,0.35)', width: 1 });
      }
      g.polygon([T([0, 0]), T([1, 0]), T([1, 1]), T([0, 1])], { fill: 'rgba(242,193,78,0.25)', color: '#f2c14e', width: 1.5 });
      g.arrow([0, 0], T([1, 0]), { color: '#ef6b73', width: 2.5 });
      g.arrow([0, 0], T([0, 1]), { color: '#6fcf97', width: 2.5 });
      if (ctx.toggles.eig) for (const e of ev) if (e.im === 0 && e.vector) {
        const d = e.vector;
        g.line([-d[0] * 10, -d[1] * 10], [d[0] * 10, d[1] * 10], { color: 'rgba(180,140,255,0.6)', width: 1.5, dash: [6, 5] });
        g.arrow([0, 0], T([d[0] * 1.5, d[1] * 1.5]), { color: '#b48cff', width: 2.5 });
      }
    });
    ctx.setReadouts([
      { label: 'determinant (area scale)', value: fmt(det(A)), tone: det(A) < 0 ? 'warn' : undefined },
      ...ev.map((e, i) => ({ label: `λ${i + 1}`, value: e.im === 0 ? fmt(e.re) : `${fmt(e.re)} ${e.im < 0 ? '−' : '+'} ${fmt(Math.abs(e.im))}i` })),
    ]);
    ctx.setNote(det(A) < 0 ? 'The determinant is negative: the transformation flips orientation (the red and green basis vectors swap their order).' : 'The unit square (gold) becomes a parallelogram whose area is |det A|. Eigenvectors (violet) keep their direction.');
  };
  return { update, tick() { /* the progress slider can be animated */ }, dispose() {} };
}

// ── ODEs ──────────────────────────────────────────────────────────────────
function odeDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const plot = ctx.plot!;
  const starts: number[][] = c.kind === 'ode2' ? [[0, 1, 0]] : c.kind === 'odeSystem' ? [[0, 1, 0], [0, -1.5, 0.5]] : [[0, 1], [0, -1], [0, 2]];
  plot.onClick = (p) => {
    if (c.kind === 'ode2') starts.splice(0, starts.length, [0, p[1], 0]);
    else if (c.kind === 'odeSystem') starts.push([0, p[0], p[1]]);
    else starts.push([p[0], p[1]]);
    update();
  };
  const update = () => {
    const pv = paramVals(ctx, c);
    const T = ctx.params.T;
    if (c.kind === 'ode1') {
      const [t] = c.vars, [y] = c.dependent!;
      const f = compile(c.exprs[0], [t, y], pv);
      const sols = starts.map(([t0, y0]) => [solveAdaptive((s, Y) => [f([s, Y[0]])], [y0], t0, t0 + T, { maxStep: T / 200 }), solveAdaptive((s, Y) => [f([s, Y[0]])], [y0], t0, t0 - T, { maxStep: T / 200 })]);
      plot.opts.xLabel = t; plot.opts.yLabel = y;
      plot.setDraw((g) => {
        g.slopeField((a, b) => f([a, b]));
        sols.forEach((pair, i) => pair.forEach((tr) => g.path(tr.t.map((s, k) => [s, tr.y[k][0]]), { color: SERIES[i % SERIES.length], width: 2.4 })));
        starts.forEach(([a, b], i) => g.point([a, b], 4.5, { fill: SERIES[i % SERIES.length] }));
      });
      ctx.warn(sols.flat().find((s) => !s.ok)?.warning ?? '');
      ctx.setNote('Each short segment has the slope the equation prescribes at that point; a solution is a curve tangent to all of them. Click to start a new solution.');
    } else if (c.kind === 'odeSystem') {
      const vars = [c.vars[0], ...c.dependent!];
      const fs = c.exprs.map((e) => compile(e, vars, pv));
      const rhs = (s: number, Y: number[]) => fs.map((f) => f([s, ...Y]));
      if (c.dependent!.length !== 2) { ctx.setNote('Phase portraits are drawn for systems of two equations.'); return; }
      const sols = starts.map(([t0, a, b]) => solveAdaptive(rhs, [a, b], t0, t0 + T, { maxStep: T / 400 }));
      plot.opts.equal = true; plot.opts.xLabel = c.dependent![0]; plot.opts.yLabel = c.dependent![1];
      plot.setDraw((g) => {
        g.field((a, b) => rhs(0, [a, b]) as [number, number], 22, 'viridis');
        sols.forEach((tr, i) => { g.path(tr.y.map((Y) => [Y[0], Y[1]] as [number, number]), { color: SERIES[(i + 1) % SERIES.length], width: 2.4 }); g.point([tr.y[0][0], tr.y[0][1]], 4.5, { fill: SERIES[(i + 1) % SERIES.length] }); });
      });
      ctx.warn(sols.find((s) => !s.ok)?.warning ?? '');
      ctx.setNote('The phase portrait: arrows show the direction of motion in the (x, y) plane. Click to release a new trajectory.');
    } else {
      const [y] = c.dependent!;
      const f = compile(c.exprs[0], ['t', y, `${y}_p`], pv);
      const [, y0, v0] = starts[0];
      const tr = solveAdaptive((s, Y) => [Y[1], f([s, Y[0], Y[1]])], [y0, v0], 0, T, { maxStep: T / 600 });
      plot.opts.xLabel = 't'; plot.opts.yLabel = y;
      const ymax = Math.max(1, ...tr.y.map((Y) => Math.abs(Y[0])).filter(Number.isFinite));
      plot.setView({ x0: -T * 0.03, x1: T * 1.03, y0: -ymax * 1.2, y1: ymax * 1.2 });
      plot.setDraw((g) => { g.path(tr.t.map((s, k) => [s, tr.y[k][0]]), { color: SERIES[0], width: 2.4 }); g.handle({ id: 'y0', at: [0, y0], color: SERIES[1], onDrag: ([, b]) => { starts[0][1] = b; update(); } }); });
      const p2 = ctx.plot2!;
      p2.opts.equal = false; p2.opts.xLabel = y; p2.opts.yLabel = `${y}′`;
      const vmax = Math.max(1, ...tr.y.map((Y) => Math.abs(Y[1])).filter(Number.isFinite));
      p2.setView({ x0: -ymax * 1.3, x1: ymax * 1.3, y0: -vmax * 1.3, y1: vmax * 1.3 });
      p2.setDraw((g) => {
        g.field((a, b) => [b, f([0, a, b])], 18, 'viridis');
        g.path(tr.y.map((Y) => [Y[0], Y[1]] as [number, number]), { color: SERIES[1], width: 2.2 });
        g.handle({ id: 'ic', at: [y0, v0], color: SERIES[1], onDrag: ([a, b]) => { starts[0][1] = a; starts[0][2] = b; update(); } });
      });
      ctx.warn(tr.ok ? '' : tr.warning ?? '');
      ctx.setNote(`Left: ${y}(t). Right: the phase plane (${y}, ${y}′) — drag the starting point. A spiral inward means damping; a closed loop, a conserved energy.`);
    }
  };
  return { update, dispose() { plot.onClick = undefined; } };
}

function implicitDemo(ctx: DemoCtx, c: Classified): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  const update = () => {
    const pv = paramVals(ctx, c);
    const F = compile(c.exprs[0], ['x', 'y'], pv);
    plot.setDraw((g) => g.implicit((x, y) => F([x, y]), { color: SERIES[0], width: 2.4 }, 260));
    void freeSymbols;
  };
  return { update, dispose() {} };
}
