// Calculus III — vector fields: arrows and flow in space with field lines,
// divergence and curl as local expansion and rotation (particles, a paddle
// wheel and a shrinking flux circle), and line integrals as work along a path.

import type { DemoDef, DemoCtx, Readout } from '../types';
import { Node, compile, simplify } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { lineIntegral, streamline, Vec3 } from '../../core/numeric/vcalc';
import { colormapCss } from '../../engine/colors';
import type { V3 } from '../../engine/viewport3d';
import { fmt, fmtV, clamp, paramSpecs, paramVals, readFormula, curlDiv3, palette, addSegments, dSym, texOf, memo, showArrow } from './common';

type View3 = NonNullable<DemoCtx['view3d']>;
type Field = ReturnType<View3['addVectorField']>;
type Point = ReturnType<View3['addPoint']>;
type Arrow = ReturnType<View3['addArrow']>;

/** Read a 2D field (P, Q) and its symbolic divergence and curl. */
function field2Reader(ctx: DemoCtx) {
  let src = '', out: { P: Node; Q: Node; div: Node | null; curl: Node | null } | null = null, err = '';
  return () => {
    if (ctx.input !== src) {
      src = ctx.input;
      const r = readFormula(src, ['x', 'y'], 2, 'a field (P(x, y), Q(x, y))');
      if (r.items) {
        const [P, Q] = r.items, Px = dSym(P, 'x'), Py = dSym(P, 'y'), Qx = dSym(Q, 'x'), Qy = dSym(Q, 'y');
        out = { P, Q, div: Px && Qy ? simplify({ t: 'add', a: Px, b: Qy }) : null, curl: Qx && Py ? simplify({ t: 'sub', a: Qx, b: Py }) : null }; err = '';
      } else err = r.error;
    }
    return { f: out, err };
  };
}

/** Compiled 2D field with divergence and curl (central differences when no symbolic form). */
function compile2(f: { P: Node; Q: Node; div: Node | null; curl: Node | null }, pv: Record<string, number>) {
  const P = compile(f.P, ['x', 'y'], pv), Q = compile(f.Q, ['x', 'y'], pv);
  const h = 1e-5;
  const F = (x: number, y: number): [number, number] => [P([x, y]), Q([x, y])];
  const div = f.div ? ((d) => (x: number, y: number) => d([x, y]))(compile(f.div, ['x', 'y'], pv)) : (x: number, y: number) => (P([x + h, y]) - P([x - h, y]) + Q([x, y + h]) - Q([x, y - h])) / (2 * h);
  const curl = f.curl ? ((d) => (x: number, y: number) => d([x, y]))(compile(f.curl, ['x', 'y'], pv)) : (x: number, y: number) => (Q([x + h, y]) - Q([x - h, y]) - P([x, y + h]) + P([x, y - h])) / (2 * h);
  return { F, div, curl };
}

/** Field arrows drawn with constant length, coloured by magnitude. */
function drawField(g: Parameters<Parameters<NonNullable<DemoCtx['plot']>['setDraw']>[0]>[0], F: (x: number, y: number) => [number, number], n: number, alpha = 1) {
  const { x0, x1, y0, y1 } = g.view;
  const hx = (x1 - x0) / n, ny = Math.max(2, Math.round(((y1 - y0) / (x1 - x0)) * n)), hy = (y1 - y0) / ny;
  const items: [number, number, number, number, number][] = [];
  let mx = 1e-12;
  for (let j = 0; j < ny; j++) for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * hx, y = y0 + (j + 0.5) * hy, [a, b] = F(x, y), m = Math.hypot(a, b); if (Number.isFinite(m)) { items.push([x, y, a, b, m]); if (m > mx) mx = m; } }
  for (const [x, y, a, b, m] of items) {
    if (m < 1e-12) continue;
    const L = 0.4 * Math.min(hx, hy) * (0.35 + 0.65 * Math.sqrt(m / mx));
    g.arrow([x - (a / m) * L, y - (b / m) * L], [x + (a / m) * L, y + (b / m) * L], { color: colormapCss('plasma', 0.25 + 0.75 * Math.sqrt(m / mx)), width: 1.3, alpha });
  }
}

// ── vector fields in space ─────────────────────────────────────────────────
export const fields: DemoDef = {
  id: 'calc3.fields', module: 'calc3', title: 'Vector fields in space',
  topic: 'Vector fields · field lines · divergence and curl (formulas)',
  summary: 'A vector field attaches an arrow F(x, y, z) to every point: a velocity of a fluid, a force, an electric field. Move the parameters and the arrows respond; particles drift with the flow and field lines follow the arrows. Probe any point for F, ∇·F and ∇×F.',
  tex: '\\mathbf F = (P, Q, R),\\qquad \\nabla\\cdot\\mathbf F = P_x + Q_y + R_z,\\qquad \\nabla\\times\\mathbf F = (R_y - Q_z,\\ P_z - R_x,\\ Q_x - P_y)',
  view: '3d', animated: true,
  params: [
    { key: 'n', label: 'arrows per side', value: 5, min: 3, max: 11, step: 1 },
    { key: 'px', label: 'probe x (drag the white probe)', value: 1, min: -2, max: 2, step: 0.01 },
    { key: 'py', label: 'probe y', value: 0.5, min: -2, max: 2, step: 0.01 },
    { key: 'pz', label: 'probe z', value: 0.5, min: -2, max: 2, step: 0.01 },
    ...paramSpecs(0.3, -0.4),
  ],
  toggles: [{ key: 'particles', label: 'Particles carried by the flow', value: true }, { key: 'lines', label: 'Field lines', value: true }, { key: 'arrows', label: 'Arrows', value: true }, { key: 'curl', label: 'Curl at the probe', value: true }],
  input: { label: 'F(x, y, z) = (P, Q, R)', value: '(-y + a*x, x + a*y, b*z)', placeholder: '(-y, x, 0)' },
  experiments: [
    'With a = 0 and b = 0 the field is a pure rotation: div F = 0, curl F = (0, 0, 2). Raise a: the flow spirals outward and div F = 2a.',
    'Make b negative: particles are squeezed toward the plane z = 0 while swirling.',
    'Electric field of a point charge: (x, y, z)/(x^2 + y^2 + z^2)^(3/2). Field lines radiate; div F = 0 everywhere except at the charge.',
    'Magnetic field of a straight wire: (-y, x, 0)/(x^2 + y^2) — circles around the z-axis, yet curl F = 0 away from the wire.',
    'A shear flow (z, 0, 0): straight streamlines, yet curl F ≠ 0 — a paddle wheel would still turn.',
  ],
  connections: ['calc3.divcurl', 'calc3.flux', 'calc3.divthm', 'calc3.stokes'],
  accuracy: 'Divergence and curl are exact symbolic derivatives. Field lines are integrated with fixed-step RK4 along the normalized field; particles move with explicit steps (visual only).',
  create(ctx) {
    const v = ctx.view3d!;
    v.setBounds({ x: [-2, 2], y: [-2, 2], z: [-2, 2] }); v.resetCamera();
    let src = '', fN: Node[] | null = null, cd: ReturnType<typeof curlDiv3> | null = null, err = '';
    let field: Field | null = null, fieldN = 0;
    const N = 1500, parts = v.addParticles(N), pos = new Float32Array(N * 3), life = new Float32Array(N);
    const seed = (i: number) => { pos[3 * i] = (Math.random() * 2 - 1) * 2; pos[3 * i + 1] = (Math.random() * 2 - 1) * 2; pos[3 * i + 2] = (Math.random() * 2 - 1) * 2; life[i] = 1 + Math.random() * 5; };
    for (let i = 0; i < N; i++) seed(i);
    parts.set(pos, N);
    const lines = addSegments(v, '#9fb8ff', 0.75);
    let probe: Point | null = null, fA: Arrow | null = null, cA: Arrow | null = null;
    let F: (p: V3) => V3 = () => [0, 0, 0];
    const update = () => {
      if (ctx.input !== src) {
        src = ctx.input;
        const r = readFormula(src, ['x', 'y', 'z'], 3, 'a field (P, Q, R)');
        if (r.items) { fN = r.items; cd = curlDiv3(r.items); err = ''; } else err = r.error;
      }
      ctx.warn(err);
      if (!fN || !cd) return;
      const pv = paramVals(ctx.params), vs = ['x', 'y', 'z'];
      const fs = fN.map((n) => compile(n, vs, pv));
      F = (p) => [fs[0](p), fs[1](p), fs[2](p)];
      const n = Math.round(ctx.params.n);
      if (!field || n !== fieldN) { field?.dispose(); field = v.addVectorField(F, { n }); fieldN = n; } else field.update(F);
      field.visible(!!ctx.toggles.arrows);
      parts.visible(!!ctx.toggles.particles);
      // field lines from a few seeds, forward and backward
      if (ctx.toggles.lines) {
        const segs: number[] = [];
        const box = { lo: [-2, -2, -2] as Vec3, hi: [2, 2, 2] as Vec3 };
        const seeds: Vec3[] = [];
        for (let k = 0; k < 8; k++) { const a = (2 * Math.PI * k) / 8; seeds.push([1.1 * Math.cos(a), 1.1 * Math.sin(a), 0.6], [0.6 * Math.cos(a + 0.4), 0.6 * Math.sin(a + 0.4), -0.8]); }
        for (const s of seeds) for (const back of [false, true]) {
          const pl = streamline(F, s, 0.04, 400, box, back);
          for (let i = 0; i + 1 < pl.length; i++) segs.push(...pl[i], ...pl[i + 1]);
        }
        lines.set(segs);
      }
      lines.handle.visible(!!ctx.toggles.lines);
      // the probe
      const P: V3 = [ctx.params.px, ctx.params.py, ctx.params.pz];
      if (!probe) probe = v.addPoint(P, { color: '#ffffff', drag: { onDrag: (q) => { ctx.setParam('px', clamp(q[0], -2, 2)); ctx.setParam('py', clamp(q[1], -2, 2)); ctx.setParam('pz', clamp(q[2], -2, 2)); update(); } } });
      probe.set(P);
      const FP = F(P), fm = Math.hypot(...FP);
      const dv = cd.div ? compile(cd.div, vs, pv)(P) : NaN;
      const cv = cd.curl.map((c) => (c ? compile(c, vs, pv)(P) : NaN)) as V3;
      if (!fA) fA = v.addArrow(P, [1, 0, 0], { color: '#ffffff', label: 'F' });
      if (!cA) cA = v.addArrow(P, [0, 0, 1], { color: '#6fcf97', label: '∇×F' });
      showArrow(fA, P, fm > 0 ? [(FP[0] / fm) * 0.8, (FP[1] / fm) * 0.8, (FP[2] / fm) * 0.8] : [0, 0, 0]);
      const cm = Math.hypot(...cv);
      showArrow(cA, P, cm > 1e-12 && Number.isFinite(cm) ? [(cv[0] / cm) * 0.8, (cv[1] / cm) * 0.8, (cv[2] / cm) * 0.8] : [0, 0, 0], !!ctx.toggles.curl);
      const rows: Readout[] = [
        { label: 'probe point', value: fmtV(P, 3) },
        { label: 'F at the probe', value: fmtV(FP, 4) },
        { label: '|F|', value: fmt(fm, 5) },
        { label: '∇·F at the probe', value: fmt(dv, 5), tone: dv > 1e-9 ? 'good' : dv < -1e-9 ? 'warn' : 'muted' },
        { label: '∇×F at the probe', value: fmtV(cv, 4) },
        { label: '∇·F', value: texOf(cd.div), tex: true },
        { label: '∇×F', value: `\\left(${cd.curl.map(texOf).join(',\\ ')}\\right)`, tex: true },
      ];
      ctx.setReadouts(rows);
      ctx.setNote(`Arrows show direction, coloured by magnitude (they are normalized to the grid spacing). Field lines (blue) are tangent to $\\mathbf F$ everywhere. At the probe, $\\nabla\\cdot\\mathbf F = ${fmt(dv)}$ ${dv > 1e-9 ? '(a source: particles spread out here)' : dv < -1e-9 ? '(a sink: particles crowd together)' : '(incompressible here)'}; the green arrow is the axis about which the flow rotates, $\\nabla\\times\\mathbf F$.`);
      if (!Number.isFinite(fm)) ctx.warn('F is not defined at the probe point.');
    };
    return {
      update,
      tick(dt) {
        for (let i = 0; i < N; i++) {
          const p: V3 = [pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]];
          const w = F(p), m = Math.hypot(w[0], w[1], w[2]), k = m > 0 ? Math.min(1, 2.5 / m) : 0;
          pos[3 * i] += w[0] * k * dt * 0.6; pos[3 * i + 1] += w[1] * k * dt * 0.6; pos[3 * i + 2] += w[2] * k * dt * 0.6;
          life[i] -= dt;
          if (life[i] < 0 || !Number.isFinite(pos[3 * i] + pos[3 * i + 1] + pos[3 * i + 2]) || Math.abs(pos[3 * i]) > 2.1 || Math.abs(pos[3 * i + 1]) > 2.1 || Math.abs(pos[3 * i + 2]) > 2.1) seed(i);
        }
        parts.set(pos, N);
      },
      dispose() { v.clear(); },
    };
  },
};

// ── divergence and curl in the plane ───────────────────────────────────────
export const divcurl: DemoDef = {
  id: 'calc3.divcurl', module: 'calc3', title: 'Divergence and curl: sources and paddle wheels',
  topic: 'Divergence · curl · flux and circulation per unit area',
  summary: 'Divergence is outflow per unit area: the net flux out of a tiny circle divided by its area. Curl is circulation per unit area: it spins a tiny paddle wheel at angular velocity ½ curl F. Shrink the circle and watch both ratios converge to the formulas.',
  tex: '\\nabla\\cdot\\mathbf F = \\lim_{r\\to0}\\frac{1}{\\pi r^2}\\oint_{C_r}\\mathbf F\\cdot\\mathbf n\\,ds,\\qquad (\\nabla\\times\\mathbf F)_z = \\lim_{r\\to 0}\\frac{1}{\\pi r^2}\\oint_{C_r}\\mathbf F\\cdot\\mathbf T\\,ds',
  view: '2d', animated: true,
  params: [
    { key: 'px', label: 'wheel x (drag it)', value: 0.8, min: -4, max: 4, step: 0.01 },
    { key: 'py', label: 'wheel y', value: 0.6, min: -4, max: 4, step: 0.01 },
    { key: 'r', label: 'radius r of the test circle', value: 0.6, min: 0.01, max: 2, step: 0.005 },
    ...paramSpecs(1, 1),
  ],
  choices: [{ key: 'heat', label: 'Colour the plane by', value: 'curl', options: [['curl', 'curl F (rotation)'], ['div', 'div F (expansion)'], ['none', 'nothing']] }],
  toggles: [{ key: 'particles', label: 'Particles in the flow', value: true }, { key: 'flux', label: 'Normal-component arrows on the circle', value: true }],
  input: { label: 'F(x, y) = (P, Q)', value: '(cos(x + 2y), a*sin(x - 2y))', placeholder: '(-y, x)' },
  experiments: [
    'Pure rotation (-y, x): curl = 2 everywhere and the wheel turns at 1 rad/s wherever you put it.',
    'Shear flow (y, 0): the streamlines are straight, but the wheel turns — curl F = −1. Rotation of the flow and spinning of a wheel are different things.',
    'Irrotational vortex (-y, x)/(x^2 + y^2): particles circle the origin, but away from it the wheel does not spin (curl = 0).',
    'Source (x, y): div = 2; every circle has net outflow 2πr². Sink: (-x, -y).',
    'Shrink r: flux/area → div F and circulation/area → curl F at the centre — that is what the derivative formulas mean.',
  ],
  connections: ['calc3.fields', 'calc3.green', 'calc3.divthm', 'calc3.stokes'],
  accuracy: 'div F and curl F are exact symbolic derivatives. The flux and circulation around the circle are adaptive Gauss–Kronrod quadrature (error ~10⁻¹⁰). The wheel turns at ½ curl F at its centre; particles move by explicit steps (visual).',
  create(ctx) {
    const plot = ctx.plot!;
    plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
    plot.setView({ x0: -3, x1: 3, y0: -3, y1: 3 });
    const read = field2Reader(ctx);
    let C: ReturnType<typeof compile2> | null = null;
    const parts: [number, number, number][] = [];
    let ang = 0;
    const seedP = (): [number, number, number] => { const { x0, x1, y0, y1 } = plot.view; return [x0 + Math.random() * (x1 - x0), y0 + Math.random() * (y1 - y0), 1 + Math.random() * 4]; };
    for (let i = 0; i < 500; i++) parts.push(seedP());
    let hm: { range: number } = { range: 1 };
    const hmKey = memo<{ range: number }>();
    let circ = { flux: 0, circ: 0 };
    const draw = () => {
      if (!C) return;
      const p = palette(ctx.dark), cc = C;
      const px = ctx.params.px, py = ctx.params.py, r = ctx.params.r;
      plot.setDraw((g) => {
        if (ctx.choices.heat !== 'none') g.heatmap(ctx.choices.heat === 'div' ? cc.div : cc.curl, [-hm.range, hm.range], 'coolwarm', 120);
        drawField(g, cc.F, 20, 0.9);
        if (ctx.toggles.particles) for (const q of parts) g.point([q[0], q[1]], 2, { fill: ctx.dark ? '#ffe08a' : '#7a5a00' });
        // test circle with normal-component arrows
        g.parametric((t) => px + r * Math.cos(t), (t) => py + r * Math.sin(t), 0, 2 * Math.PI, { color: p.ink, width: 1.6, dash: [5, 4] }, 120);
        if (ctx.toggles.flux) for (let k = 0; k < 16; k++) {
          const t = (2 * Math.PI * k) / 16, nx = Math.cos(t), ny = Math.sin(t), [a, b] = cc.F(px + r * nx, py + r * ny), fn = a * nx + b * ny;
          const L = clamp(fn, -1.5, 1.5) * r * 0.5, bx = px + r * nx, by = py + r * ny;
          if (Math.abs(L) > 1e-6) g.arrow([bx, by], [bx + nx * L, by + ny * L], { color: fn > 0 ? p.red : p.blue, width: 2 });
        }
        // the paddle wheel
        const W = Math.min(0.35, Math.max(0.12, r * 0.6));
        for (let k = 0; k < 4; k++) { const t = ang + (k * Math.PI) / 2; g.line([px, py], [px + W * Math.cos(t), py + W * Math.sin(t)], { color: k === 0 ? p.gold : p.ink, width: 3.2 }); }
        g.handle({ id: 'w', at: [px, py], color: p.gold, onDrag: ([x, y]) => { ctx.setParam('px', x); ctx.setParam('py', y); update(); } });
      });
    };
    const update = () => {
      const { f, err } = read();
      ctx.warn(err);
      if (!f) return;
      const pv = paramVals(ctx.params);
      C = compile2(f, pv);
      const cc = C;
      hm = hmKey(`${ctx.input}|${pv.a}|${pv.b}|${ctx.choices.heat}`, () => {
        let m = 1e-9; const g = ctx.choices.heat === 'div' ? cc.div : cc.curl;
        for (let j = 0; j <= 40; j++) for (let i = 0; i <= 40; i++) { const val = Math.abs(g(-3 + (6 * i) / 40, -3 + (6 * j) / 40)); if (Number.isFinite(val) && val > m) m = val; }
        return { range: m };
      });
      const px = ctx.params.px, py = ctx.params.py, r = ctx.params.r;
      const fl = integrate((t) => { const c = Math.cos(t), s = Math.sin(t), [a, b] = cc.F(px + r * c, py + r * s); return (a * c + b * s) * r; }, 0, 2 * Math.PI, 1e-11);
      const ci = integrate((t) => { const c = Math.cos(t), s = Math.sin(t), [a, b] = cc.F(px + r * c, py + r * s); return (-a * s + b * c) * r; }, 0, 2 * Math.PI, 1e-11);
      circ = { flux: fl.value, circ: ci.value };
      const A = Math.PI * r * r, dv = cc.div(px, py), cu = cc.curl(px, py);
      ctx.setReadouts([
        { label: 'div F at the centre', value: fmt(dv, 6) + (f.div ? '' : ' (numerical)'), tone: dv > 1e-9 ? 'warn' : dv < -1e-9 ? 'good' : 'muted' },
        { label: 'outward flux ∮ F·n ds / (πr²)', value: fmt(circ.flux / A, 6) },
        { label: 'curl F at the centre', value: fmt(cu, 6) + (f.curl ? '' : ' (numerical)'), tone: cu > 1e-9 ? 'warn' : cu < -1e-9 ? 'good' : 'muted' },
        { label: 'circulation ∮ F·T ds / (πr²)', value: fmt(circ.circ / A, 6) },
        { label: 'wheel angular velocity ½ curl F', value: `${fmt(cu / 2, 5)} rad/s` },
        { label: 'div F', value: texOf(f.div), tex: true },
        { label: 'curl F = Q_x − P_y', value: texOf(f.curl), tex: true },
      ]);
      ctx.warn(err || (fl.warning ?? ci.warning ? 'F is singular on or near the test circle — move or resize it.' : ''));
      ctx.setNote(`Colour: ${ctx.choices.heat === 'div' ? 'divergence (red = source, blue = sink)' : ctx.choices.heat === 'curl' ? 'curl (red = counter-clockwise, blue = clockwise)' : 'none'}. On the dashed circle, red arrows point out where $\\mathbf F$ leaves, blue where it enters. The wheel turns at $\\tfrac12(\\nabla\\times\\mathbf F)$ — press play.`);
      draw();
    };
    return {
      update,
      tick(dt) {
        if (!C) return;
        const cc = C;
        ang += 0.5 * cc.curl(ctx.params.px, ctx.params.py) * dt;
        const { x0, x1, y0, y1 } = plot.view, sc = (x1 - x0) * 0.04;
        for (let i = 0; i < parts.length; i++) {
          const q = parts[i], [a, b] = cc.F(q[0], q[1]), m = Math.hypot(a, b), k = m > 0 ? Math.min(1, 4 / m) : 0;
          q[0] += a * k * dt * sc; q[1] += b * k * dt * sc; q[2] -= dt;
          if (q[2] < 0 || !Number.isFinite(q[0] + q[1]) || q[0] < x0 || q[0] > x1 || q[1] < y0 || q[1] > y1) parts[i] = seedP();
        }
        draw();
      },
      dispose() {},
    };
  },
};

// ── line integrals: work along a path ──────────────────────────────────────
const bez = (P: number[][], t: number): [number, number] => { const s = 1 - t; return [s * s * s * P[0][0] + 3 * s * s * t * P[1][0] + 3 * s * t * t * P[2][0] + t * t * t * P[3][0], s * s * s * P[0][1] + 3 * s * s * t * P[1][1] + 3 * s * t * t * P[2][1] + t * t * t * P[3][1]]; };
const bezD = (P: number[][], t: number): [number, number] => { const s = 1 - t; return [3 * s * s * (P[1][0] - P[0][0]) + 6 * s * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]), 3 * s * s * (P[1][1] - P[0][1]) + 6 * s * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1])]; };

export const lineint: DemoDef = {
  id: 'calc3.lineint', module: 'calc3', title: 'Line integrals: work along a path',
  topic: 'Line integrals · work · conservative fields · path independence',
  summary: 'The work done by a force field on a particle moving along a path is ∫ F · dr: add up the component of F along the path. Drag the path’s endpoints and control points. For a conservative field (curl 0, F = ∇φ) the work depends only on the endpoints; otherwise the path matters and a closed loop does net work.',
  tex: 'W = \\int_C \\mathbf F\\cdot d\\mathbf r = \\int_0^1 \\mathbf F\\big(\\mathbf r(t)\\big)\\cdot\\mathbf r\'(t)\\,dt,\\qquad \\mathbf F = \\nabla\\varphi \\;\\Rightarrow\\; W = \\varphi(B) - \\varphi(A)',
  view: 'split2d', animated: true,
  params: [
    { key: 'ax', label: 'start A: x', value: -2, min: -4, max: 4, step: 0.01 }, { key: 'ay', label: 'start A: y', value: -1, min: -4, max: 4, step: 0.01 },
    { key: 'bx', label: 'end B: x', value: 2, min: -4, max: 4, step: 0.01 }, { key: 'by', label: 'end B: y', value: 1.2, min: -4, max: 4, step: 0.01 },
    { key: 'c1x', label: 'control 1: x', value: -1.5, min: -4, max: 4, step: 0.01 }, { key: 'c1y', label: 'control 1: y', value: 2, min: -4, max: 4, step: 0.01 },
    { key: 'c2x', label: 'control 2: x', value: 1, min: -4, max: 4, step: 0.01 }, { key: 'c2y', label: 'control 2: y', value: -2, min: -4, max: 4, step: 0.01 },
    { key: 's', label: 'particle position along the path (press play)', value: 0.5, min: 0, max: 1, step: 0.001 },
    ...paramSpecs(0, 1),
  ],
  choices: [{ key: 'path', label: 'Path', value: 'open', options: [['open', 'Curve from A to B (compare with the straight segment)'], ['closed', 'Closed loop: curve A → B, then straight back to A']] }],
  input: { label: 'force F(x, y) = (P, Q)', value: '(2x y - a*y, x^2 + a*x)', placeholder: '(P, Q)' },
  experiments: [
    'With a = 0 the field is ∇(x²y): bend the path any way you like — the work stays x²y at B minus x²y at A.',
    'Raise a: the field gets a rotational part with curl 2a. Now the curved path and the straight one do different work.',
    'Choose the closed loop: with a = 0 the net work is 0; with a ≠ 0 it equals 2a × (signed enclosed area) — Green’s theorem.',
    'Gravity (0, -a): only the change in height matters. Friction-like (-y, x) (a whirlpool) always does work around a loop.',
    'Press play: the right plot shows F · r′(t) along the way, and the shaded area so far is the work done up to that moment.',
  ],
  connections: ['calc3.green', 'calc3.divcurl', 'calc3.stokes', 'calc3.vecfn'],
  accuracy: 'The path is a cubic Bézier curve with exact derivative; the work is adaptive Gauss–Kronrod quadrature with its error. “Conservative” is decided from the symbolic curl (exactly 0) or, if it does not simplify to 0, from its values on a 30 × 30 grid (|curl| < 10⁻¹⁰).',
  create(ctx) {
    const pl = ctx.plot!, p2 = ctx.plot2!;
    pl.opts.equal = true; pl.opts.xLabel = 'x'; pl.opts.yLabel = 'y';
    p2.opts.xLabel = 't'; p2.opts.yLabel = 'F · r′(t)';
    pl.setView({ x0: -3.5, x1: 3.5, y0: -3, y1: 3 });
    const read = field2Reader(ctx);
    let C: ReturnType<typeof compile2> | null = null;
    const vk = memo<boolean>();
    const update = () => {
      const { f, err } = read();
      ctx.warn(err);
      if (!f) return;
      const pv = paramVals(ctx.params);
      C = compile2(f, pv);
      const cc = C;
      const P = [[ctx.params.ax, ctx.params.ay], [ctx.params.c1x, ctx.params.c1y], [ctx.params.c2x, ctx.params.c2y], [ctx.params.bx, ctx.params.by]];
      const A = P[0], B = P[3];
      const closed = ctx.choices.path === 'closed';
      // the whole path: t ∈ [0, 1] the curve, t ∈ [1, 2] the straight return (closed loop)
      const r = (t: number): [number, number] => (t <= 1 ? bez(P, t) : [B[0] + (A[0] - B[0]) * (t - 1), B[1] + (A[1] - B[1]) * (t - 1)]);
      const rp = (t: number): [number, number] => (t <= 1 ? bezD(P, t) : [A[0] - B[0], A[1] - B[1]]);
      const Fv = (p: number[]) => cc.F(p[0], p[1]);
      const W = lineIntegral(Fv, r, rp, 0, 1);
      const Wline = lineIntegral(Fv, (t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t], () => [B[0] - A[0], B[1] - A[1]], 0, 1);
      const T1 = closed ? 2 : 1;
      const s = ctx.params.s * T1;
      const integrand = (t: number) => { const [x, y] = r(t), [a, b] = rp(t), [u, w] = cc.F(x, y); return u * a + w * b; };
      const sofar = integrate(integrand, 0, s, 1e-10);
      // conservative?
      let exactZero = false, maxCurl = 0;
      if (f.curl && f.curl.t === 'num' && f.curl.v === 0) exactZero = true;
      for (let j = 0; j <= 30; j++) for (let i = 0; i <= 30; i++) { const c = Math.abs(cc.curl(-3.5 + (7 * i) / 30, -3 + (6 * j) / 30)); if (Number.isFinite(c)) maxCurl = Math.max(maxCurl, c); }
      const conservative = exactZero || maxCurl < 1e-10;
      const p = palette(ctx.dark);
      const [sx, sy] = r(s), [vx, vy] = rp(s), [Fx, Fy] = cc.F(sx, sy);
      pl.setDraw((g) => {
        drawField(g, cc.F, 18, 0.55);
        if (!closed) g.line(A as [number, number], B as [number, number], { color: p.muted, width: 2, dash: [6, 5] });
        g.line(A as [number, number], P[1] as [number, number], { color: p.faint, width: 1 }); g.line(B as [number, number], P[2] as [number, number], { color: p.faint, width: 1 });
        // the path coloured by the sign of F · T (green: F helps, red: F opposes)
        const n = 160;
        for (let i = 0; i < n * T1; i++) { const t0 = i / n, t1 = (i + 1) / n, v0 = integrand((t0 + t1) / 2); g.line(r(t0), r(t1), { color: v0 >= 0 ? p.green : p.red, width: 3.4 }); }
        for (const k of [0.25, 0.5, 0.75].map((x) => x * T1)) { const a = r(k), d = rp(k), m = Math.hypot(...d) || 1; g.arrow(a, [a[0] + (d[0] / m) * 0.25, a[1] + (d[1] / m) * 0.25], { color: p.ink, width: 2 }); }
        const fm = Math.hypot(Fx, Fy) || 1;
        g.arrow([sx, sy], [sx + (Fx / fm) * 0.6, sy + (Fy / fm) * 0.6], { color: p.gold, width: 2.6 });
        g.point([sx, sy], 5, { fill: p.gold });
        g.text(A as [number, number], 'A', { color: p.ink, font: '600 14px Inter, sans-serif' }, -16, 16); g.text(B as [number, number], 'B', { color: p.ink, font: '600 14px Inter, sans-serif' }, 8, -8);
        const H = (id: string, k: number) => g.handle({ id, at: P[k] as [number, number], r: k === 0 || k === 3 ? 7 : 5.5, color: k === 0 || k === 3 ? p.ink : p.violet, onDrag: ([x, y]) => { const keys = ['a', 'c1', 'c2', 'b'][k]; ctx.setParam(keys + 'x', clamp(x, -4, 4)); ctx.setParam(keys + 'y', clamp(y, -4, 4)); update(); } });
        H('A', 0); H('C1', 1); H('C2', 2); H('B', 3);
      });
      vk(`${ctx.input}|${pv.a}|${pv.b}|${T1}|${P.flat().join(',')}`, () => {
        let lo = 0, hi = 0;
        for (let i = 0; i <= 300; i++) { const y = integrand((T1 * i) / 300); if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
        const pad = (hi - lo) * 0.12 + 0.2;
        p2.setView({ x0: -0.05 * T1, x1: 1.05 * T1, y0: lo - pad, y1: hi + pad });
        return true;
      });
      p2.setDraw((g) => {
        g.fillBetween((t) => Math.max(0, integrand(t)), () => 0, 0, s, { fill: ctx.dark ? 'rgba(111,207,151,0.35)' : 'rgba(35,147,90,0.3)' });
        g.fillBetween((t) => Math.min(0, integrand(t)), () => 0, 0, s, { fill: ctx.dark ? 'rgba(239,107,115,0.35)' : 'rgba(209,65,76,0.3)' });
        g.fn(integrand, { color: p.ink, width: 2.2 }, [0, T1]);
        g.line([s, g.view.y0], [s, g.view.y1], { color: p.gold, width: 1.4 });
        if (closed) g.line([1, g.view.y0], [1, g.view.y1], { color: p.muted, width: 1, dash: [4, 4] });
        g.handle({ id: 's', at: [s, integrand(s)], color: p.gold, constrain: ([t]) => [clamp(t, 0, T1), integrand(clamp(t, 0, T1))], onDrag: ([t]) => { ctx.setParam('s', clamp(t / T1, 0, 1)); update(); } });
      });
      const loop = closed ? W.value - Wline.value : NaN;
      const rows: Readout[] = [
        { label: closed ? 'work along the curve A → B' : 'work W along the curve', value: `${fmt(W.value, 10)} ± ${W.error.toExponential(1)}`, tone: 'good' },
        { label: 'work along the straight segment A → B', value: fmt(Wline.value, 10) },
      ];
      if (closed) rows.push({ label: 'net work around the loop ∮ F·dr', value: fmt(loop, 10), tone: Math.abs(loop) < 1e-8 ? 'muted' : 'warn' });
      else rows.push({ label: 'difference (path dependence)', value: fmt(W.value - Wline.value, 4), tone: Math.abs(W.value - Wline.value) < 1e-8 ? 'muted' : 'warn' });
      rows.push({ label: 'work done so far (shaded area)', value: fmt(sofar.value, 8) });
      rows.push({ label: 'F at the particle · velocity', value: `${fmtV([Fx, Fy], 3)} · ${fmtV([vx, vy], 3)} = ${fmt(Fx * vx + Fy * vy, 5)}` });
      rows.push({ label: 'conservative?', value: conservative ? (exactZero ? 'yes — curl F simplifies to 0' : 'yes — curl F = 0 on the grid') : `no — |curl F| up to ${fmt(maxCurl, 3)}`, tone: conservative ? 'good' : 'warn' });
      rows.push({ label: 'curl F = Q_x − P_y', value: texOf(f.curl), tex: true });
      ctx.setReadouts(rows);
      ctx.setNote(`The path is green where $\\mathbf F$ pushes the particle forward ($\\mathbf F\\cdot\\mathbf T > 0$) and red where it holds it back. ${conservative ? 'This field is conservative, so every path from A to B does the same work.' : 'This field is not conservative: different paths from A to B do different work, and a closed loop does net work.'} Drag A, B (white) and the violet control points.`);
      ctx.warn(err || (W.warning ? `The path passes through a point where F is not finite: ${W.warning}` : ''));
    };
    let dir = 1;
    return {
      update,
      tick(dt) { let s = ctx.params.s + dir * dt * 0.12; if (s > 1) { s = 1; dir = -1; } if (s < 0) { s = 0; dir = 1; } ctx.setParam('s', s); update(); },
      dispose() {},
    };
  },
};

