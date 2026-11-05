// Calculus III — surface integrals and the three great theorems of vector
// calculus, each with both sides computed numerically (with error estimates)
// and shown equal: flux through surfaces (Gauss's law), Green's theorem,
// Stokes' theorem and the divergence theorem (tutorials).

import type { DemoDef, DemoCtx, Readout } from '../types';
import { Node, compile, simplify } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { integrate2e, integrate3e, fluxIntegral, surfaceArea, lineIntegral, findBlowup, NestedResult } from '../../core/numeric/vcalc';
import type { V3 } from '../../engine/viewport3d';
import { fmt, fmtQ, fmtV, clamp, paramSpecs, paramVals, readFormula, curlDiv3, palette, addArrows, dSym, texOf, memo, dot, norm, scaleV, unit, fitBounds } from './common';

type View3 = NonNullable<DemoCtx['view3d']>;
type Surf = ReturnType<View3['addSurface']>;
type Point = ReturnType<View3['addPoint']>;
type Curve = ReturnType<View3['addCurve']>;
type Field = ReturnType<View3['addVectorField']>;

const { PI, sin, cos, sqrt } = Math;

interface Patch { S: (u: number, v: number) => V3; N: (u: number, v: number) => V3; u: [number, number]; v: [number, number] }

/** Read a 3D field with symbolic curl and divergence; keeps the last good one on error. */
function field3Reader(ctx: DemoCtx) {
  let src = '', out: { F: Node[]; cd: ReturnType<typeof curlDiv3> } | null = null, err = '';
  return () => {
    if (ctx.input !== src) {
      src = ctx.input;
      const r = readFormula(src, ['x', 'y', 'z'], 3, 'a field (P, Q, R)');
      if (r.items) { out = { F: r.items, cd: curlDiv3(r.items) }; err = ''; } else err = r.error;
    }
    return { f: out, err };
  };
}
const compile3 = (ns: Node[], pv: Record<string, number>) => { const fs = ns.map((n) => compile(n, ['x', 'y', 'z'], pv)); return (p: ArrayLike<number>): V3 => [fs[0](p), fs[1](p), fs[2](p)]; };
/** curl F compiled: exact when every component has a symbolic form, else central differences */
function curlFn(F: (p: ArrayLike<number>) => V3, cd: ReturnType<typeof curlDiv3>, pv: Record<string, number>): { f: (p: ArrayLike<number>) => V3; exact: boolean } {
  if (cd.curl.every(Boolean)) return { f: compile3(cd.curl as Node[], pv), exact: true };
  const h = 1e-5;
  return { exact: false, f: (p) => {
    const d = (i: number, k: number) => { const a = [p[0], p[1], p[2]], b = [p[0], p[1], p[2]]; a[k] += h; b[k] -= h; return (F(a)[i] - F(b)[i]) / (2 * h); };
    return [d(2, 1) - d(1, 2), d(0, 2) - d(2, 0), d(1, 0) - d(0, 1)];
  } };
}
function divFn(F: (p: ArrayLike<number>) => V3, cd: ReturnType<typeof curlDiv3>, pv: Record<string, number>): { f: (p: ArrayLike<number>) => number; exact: boolean } {
  if (cd.div) { const g = compile(cd.div, ['x', 'y', 'z'], pv); return { f: (p) => g(p), exact: true }; }
  const h = 1e-5;
  return { exact: false, f: (p) => { let s = 0; for (let k = 0; k < 3; k++) { const a = [p[0], p[1], p[2]], b = [p[0], p[1], p[2]]; a[k] += h; b[k] -= h; s += (F(a)[k] - F(b)[k]) / (2 * h); } return s; } };
}

/** Draw a patch coloured by g(p)·n̂ on a diverging scale; returns the max |value| sampled. */
function patchColor(p: Patch, g: (q: V3) => V3): { colorBy: (q: V3, u: number, v: number) => number; m: number } {
  const val = (u: number, v: number) => { const n = p.N(u, v), l = norm(n); return l > 0 ? dot(g(p.S(u, v)), n) / l : 0; };
  let m = 1e-9;
  for (let j = 0; j <= 16; j++) for (let i = 0; i <= 16; i++) { const x = Math.abs(val(p.u[0] + ((p.u[1] - p.u[0]) * i) / 16, p.v[0] + ((p.v[1] - p.v[0]) * j) / 16)); if (Number.isFinite(x) && x > m) m = x; }
  return { colorBy: (_q, u, v) => val(u, v), m };
}

/** Patches of a few standard surfaces. */
function spherePatch(c: V3, R: number, ph1 = PI, lower = false): Patch {
  return lower
    ? { S: (u, v) => [c[0] + R * sin(u) * cos(v), c[1] + R * sin(u) * sin(v), c[2] - R * cos(u)], N: (u, v) => [-R * R * sin(u) * sin(u) * cos(v), -R * R * sin(u) * sin(u) * sin(v), R * R * sin(u) * cos(u)], u: [0, ph1], v: [0, 2 * PI] }
    : { S: (u, v) => [c[0] + R * sin(u) * cos(v), c[1] + R * sin(u) * sin(v), c[2] + R * cos(u)], N: (u, v) => [R * R * sin(u) * sin(u) * cos(v), R * R * sin(u) * sin(u) * sin(v), R * R * sin(u) * cos(u)], u: [0, ph1], v: [0, 2 * PI] };
}

// ── surface integrals: flux ────────────────────────────────────────────────
export const flux: DemoDef = {
  id: 'calc3.flux', module: 'calc3', title: 'Surface integrals: flux through a surface',
  topic: 'Parametrized surfaces · surface area · surface integrals · flux · Gauss’s law',
  summary: 'The flux of a field through a surface counts how much of it passes through: add up F · n dS over the surface. With F the velocity of a fluid it is volume per second; with F an electric field it is the electric flux of Gauss’s law.',
  tex: '\\Phi = \\iint_S \\mathbf F\\cdot\\mathbf n\\,dS = \\iint_D \\mathbf F\\big(\\mathbf r(u,v)\\big)\\cdot(\\mathbf r_u\\times\\mathbf r_v)\\,du\\,dv,\\qquad \\oint_S \\mathbf E\\cdot d\\mathbf A = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}',
  view: '3d',
  params: [
    { key: 'R', label: 'size R', value: 1.2, min: 0.2, max: 2.2, step: 0.01 },
    { key: 'h', label: 'height of the centre', value: 0, min: -2, max: 2, step: 0.01 },
    { key: 'cx', label: 'centre x (move the surface sideways)', value: 0, min: -2, max: 2, step: 0.01 },
    ...paramSpecs(1, 1),
  ],
  choices: [{ key: 'surf', label: 'Surface', value: 'sphere', options: [['sphere', 'Sphere (closed, outward normal)'], ['hemi', 'Upper hemisphere'], ['disk', 'Flat disk (normal up)'], ['para', 'Paraboloid cap'], ['cyl', 'Cylinder side (outward)']] }],
  toggles: [{ key: 'normals', label: 'Unit normals', value: false }, { key: 'onsurf', label: 'F on the surface', value: true }, { key: 'arrows', label: 'Field arrows in space', value: false }],
  input: { label: 'F(x, y, z) = (P, Q, R)', value: 'a*(x, y, z)/(x^2 + y^2 + z^2)^(3/2)', placeholder: '(0, 0, 1 - x^2 - y^2)' },
  experiments: [
    'The default field is a point charge at the origin (kq = a). Change R: the flux through the sphere stays 4πa — Gauss’s law.',
    'Slide the sphere sideways (centre x) until the charge is outside: the flux drops to 0 — field lines enter and leave.',
    'Switch to the hemisphere: exactly half, 2πa. The flat disk below it gets the same flux as the hemisphere only if no charge sits between them.',
    'Fluid through a pipe: F = (0, 0, 1 - x^2 - y^2) with the disk, R = 1: flux π/2 (the Poiseuille profile). With the cylinder side: 0.',
    'Constant field (0, 0, a) through the paraboloid cap: the flux equals a times the area of the shadow, πR², whatever the shape.',
  ],
  connections: ['calc3.divthm', 'calc3.stokes', 'calc3.fields'],
  accuracy: 'The surfaces are given analytically with exact r_u × r_v. Flux and area are nested adaptive Gauss–Kronrod quadrature with error estimates. A singularity of F inside a closed surface is detected numerically (grid search with zooming).',
  create(ctx) {
    const v = ctx.view3d!;
    v.setBounds({ x: [-2.5, 2.5], y: [-2.5, 2.5], z: [-2.5, 2.5] }); v.resetCamera();
    const read = field3Reader(ctx);
    let surf: Surf | null = null, field: Field | null = null;
    const arr = addArrows(v, 400, 0.025);
    const res = memo<{ fl: NestedResult; area: NestedResult; sing: number[] | null }>();
    const update = () => {
      const { f, err } = read();
      ctx.warn(err);
      if (!f) return;
      const pv = paramVals(ctx.params), F = compile3(f.F, pv);
      const R = ctx.params.R, h = ctx.params.h, cx = ctx.params.cx, kind = ctx.choices.surf;
      const c: V3 = [cx, 0, h];
      let p: Patch;
      if (kind === 'sphere') p = spherePatch(c, R);
      else if (kind === 'hemi') p = spherePatch(c, R, PI / 2);
      else if (kind === 'disk') p = { S: (r, t) => [cx + r * cos(t), r * sin(t), h], N: (r) => [0, 0, r], u: [0, R], v: [0, 2 * PI] };
      else if (kind === 'para') p = { S: (r, t) => [cx + r * cos(t), r * sin(t), h + (R * R - r * r) / R], N: (r, t) => [(2 * r * r * cos(t)) / R, (2 * r * r * sin(t)) / R, r], u: [0, R], v: [0, 2 * PI] };
      else p = { S: (t, z) => [cx + R * cos(t), R * sin(t), z], N: (t) => [R * cos(t), R * sin(t), 0], u: [0, 2 * PI], v: [h - R, h + R] };
      const col = patchColor(p, F);
      const so = { uRange: p.u, vRange: p.v, res: 64, colorBy: col.colorBy, colormap: 'coolwarm' as const, colorRange: [-col.m, col.m] as [number, number], opacity: 0.85 };
      const Sf = (u: number, w: number) => { const q = p.S(u, w); return q.every(Number.isFinite) ? q : null; };
      if (!surf) surf = v.addSurface(Sf, so); else surf.update(Sf, so);
      if (ctx.toggles.arrows) { if (!field) field = v.addVectorField((q) => F(q), { n: 6 }); else field.update((q) => F(q)); field.visible(true); } else field?.visible(false);
      // arrows on the surface
      arr.begin();
      let fmax = 1e-12;
      const samples: { q: V3; n: V3; w: V3 }[] = [];
      for (let j = 0; j < 12; j++) for (let i = 0; i < 12; i++) {
        const u = p.u[0] + ((p.u[1] - p.u[0]) * (i + 0.5)) / 12, w = p.v[0] + ((p.v[1] - p.v[0]) * (j + 0.5)) / 12;
        const q = p.S(u, w), n = unit(p.N(u, w)), Fw = F(q);
        if (!q.every(Number.isFinite) || !Fw.every(Number.isFinite)) continue;
        samples.push({ q, n, w: Fw }); fmax = Math.max(fmax, norm(Fw));
      }
      for (const s of samples) {
        if (ctx.toggles.onsurf) { const L = 0.45 * Math.sqrt(norm(s.w) / fmax); arr.push(s.q, scaleV(unit(s.w), L), dot(s.w, s.n) >= 0 ? '#ef6b73' : '#6aa9ff'); }
        if (ctx.toggles.normals) arr.push(s.q, scaleV(s.n, 0.3), '#e6e9ef');
      }
      arr.end();
      const key = `${ctx.input}|${pv.a}|${pv.b}|${R}|${h}|${cx}|${kind}`;
      const r = res(key, () => {
        const fl = fluxIntegral((q) => F(q), (u, w) => p.S(u, w), (u, w) => p.N(u, w), p.u[0], p.u[1], p.v[0], p.v[1], 1e-9);
        const area = surfaceArea((u, w) => p.N(u, w), p.u[0], p.u[1], p.v[0], p.v[1]);
        const sing = kind === 'sphere' ? findBlowup((q) => norm(F(q)), [cx - R, -R, h - R], [cx + R, R, h + R], (q) => Math.hypot(q[0] - cx, q[1], q[2] - h) < R * 0.999) : null;
        return { fl, area, sing };
      });
      const rows: Readout[] = [
        { label: 'flux Φ = ∬ F·n dS', value: fmtQ(r.fl), tone: r.fl.ok ? 'good' : 'warn' },
        { label: 'Φ / 4π', value: fmt(r.fl.value / (4 * PI), 8), tone: 'muted' },
        { label: 'surface area ∬ dS', value: fmtQ(r.area) },
        { label: 'average normal component Φ / area', value: fmt(r.fl.value / r.area.value, 6) },
      ];
      if (kind === 'sphere') rows.push({ label: 'F singular inside the sphere?', value: r.sing ? `yes, near ${fmtV(r.sing, 3)}` : 'no', tone: r.sing ? 'warn' : 'muted' });
      if (f.cd.div) rows.push({ label: '∇·F', value: texOf(f.cd.div), tex: true });
      ctx.setReadouts(rows);
      ctx.warn(err || (r.fl.warning ? `F is not finite on the surface (${r.fl.warning}) — move the surface off the singularity.` : ''));
      ctx.setNote(`Colour shows $\\mathbf F\\cdot\\mathbf n$: red where the field leaves through the surface, blue where it enters. ${kind === 'sphere' ? (r.sing ? `The field blows up inside the sphere (a charge at ${fmtV(r.sing, 2)}): by Gauss’s law the flux measures what is enclosed, not the size of the sphere.` : 'Nothing singular is enclosed: the flux equals the integral of $\\nabla\\cdot\\mathbf F$ over the ball (divergence theorem).') : 'This surface is open: its flux depends on its shape and on its boundary.'}`);
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── Green's theorem ────────────────────────────────────────────────────────
const GR = { diff: NaN, R: NaN, cx: NaN, cy: NaN, lhs: NaN, rhs: NaN };

interface Shape { pieces: { r: (t: number) => [number, number]; rp: (t: number) => [number, number]; t0: number; t1: number }[]; rho?: (t: number) => number; rect?: [number, number, number, number]; inside: (x: number, y: number) => boolean; outline: (t: number) => [number, number] }

function shapeOf(kind: string, cx: number, cy: number, R: number, e: number): Shape {
  if (kind === 'square') {
    const c: [number, number][] = [[cx - R, cy - R], [cx + R, cy - R], [cx + R, cy + R], [cx - R, cy + R]];
    const pieces = c.map((a, i) => { const b = c[(i + 1) % 4]; return { r: (t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], rp: (): [number, number] => [b[0] - a[0], b[1] - a[1]], t0: 0, t1: 1 }; });
    return { pieces, rect: [cx - R, cx + R, cy - R, cy + R], inside: (x, y) => Math.abs(x - cx) <= R && Math.abs(y - cy) <= R, outline: (t) => { const k = Math.min(3, Math.floor((t / (2 * PI)) * 4)), s = (t / (2 * PI)) * 4 - k; return pieces[k].r(s); } };
  }
  let rho: (t: number) => number, drho: (t: number) => number;
  if (kind === 'ellipse') { const b = R * e; rho = (t) => (R * b) / sqrt((b * cos(t)) ** 2 + (R * sin(t)) ** 2); drho = () => 0; }
  else if (kind === 'flower') { rho = (t) => R * (1 + 0.3 * cos(5 * t)); drho = (t) => -1.5 * R * sin(5 * t); }
  else { rho = () => R; drho = () => 0; }
  const piece = kind === 'ellipse'
    ? { r: (t: number): [number, number] => [cx + R * cos(t), cy + R * e * sin(t)], rp: (t: number): [number, number] => [-R * sin(t), R * e * cos(t)], t0: 0, t1: 2 * PI }
    : { r: (t: number): [number, number] => [cx + rho(t) * cos(t), cy + rho(t) * sin(t)], rp: (t: number): [number, number] => [drho(t) * cos(t) - rho(t) * sin(t), drho(t) * sin(t) + rho(t) * cos(t)], t0: 0, t1: 2 * PI };
  return { pieces: [piece], rho, inside: (x, y) => { const d = Math.hypot(x - cx, y - cy); return d <= rho(Math.atan2(y - cy, x - cx)); }, outline: piece.r };
}

export const green: DemoDef = {
  id: 'calc3.green', module: 'calc3', title: 'Green’s theorem',
  topic: 'Green’s theorem · circulation and flux in the plane',
  summary: 'The circulation of F around a closed curve equals the total curl inside it: each tiny loop’s circulation is curl × area, and the inner edges of neighbouring loops cancel, leaving only the boundary. The flux form says the same about divergence. Both sides are computed independently and agree.',
  tex: '\\oint_{\\partial D} P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA,\\qquad \\oint_{\\partial D}\\mathbf F\\cdot\\mathbf n\\,ds = \\iint_D \\nabla\\cdot\\mathbf F\\,dA',
  view: '2d',
  params: [
    { key: 'cx', label: 'centre x (drag the region)', value: 0.4, min: -3, max: 3, step: 0.01 },
    { key: 'cy', label: 'centre y', value: 0.2, min: -3, max: 3, step: 0.01 },
    { key: 'R', label: 'size R (drag the edge handle)', value: 1.4, min: 0.1, max: 3, step: 0.01 },
    { key: 'e', label: 'ellipse aspect ratio', value: 0.6, min: 0.2, max: 2, step: 0.01 },
    ...paramSpecs(1, 1),
  ],
  choices: [
    { key: 'shape', label: 'Region', value: 'disk', options: [['disk', 'Disk'], ['ellipse', 'Ellipse'], ['flower', 'Flower (r = R(1 + 0.3 cos 5θ))'], ['square', 'Square (corners)']] },
    { key: 'form', label: 'Form', value: 'tan', options: [['tan', 'Circulation ∮ F·dr = ∬ curl F dA'], ['norm', 'Flux ∮ F·n ds = ∬ div F dA']] },
  ],
  toggles: [{ key: 'micro', label: 'Microscopic circulation (little loops)', value: false }, { key: 'field', label: 'Field arrows', value: true }],
  input: { label: 'F(x, y) = (P, Q)', value: '(-y^3/3 + a*x*y, x^3/3 + b*x)', placeholder: '(P, Q)' },
  experiments: [
    'Drag and resize the region: the two numbers change together and always agree.',
    'Choose the flower or the square: corners and wiggles do not matter, only the curl inside.',
    'Area from a line integral: F = (-y/2, x/2) has curl 1, so the circulation equals the area — the principle of the planimeter.',
    'A field with curl 0 has zero circulation around every loop that encloses no singularity: try (2x y, x^2).',
    'Where Green fails: F = (-y, x)/(x^2 + y^2) around the origin gives 2π although curl F = 0 everywhere else — F is not defined at the origin.',
  ],
  connections: ['calc3.lineint', 'calc3.divcurl', 'calc3.stokes', 'calc3.divthm', 'calc3.double'],
  accuracy: 'Both sides are numerical and independent: the line integral is adaptive Gauss–Kronrod along an exact parametrization of the boundary; the area integral uses the symbolic curl (or divergence) with nested adaptive quadrature in polar coordinates about the centre (Cartesian for the square). Errors are estimates. A singularity inside the region is detected numerically and reported.',
  tutorial: [
    { text: '**Circulation.** Walk once around the boundary of the region, counter-clockwise, adding up the component of $\\mathbf F$ along your step: $\\oint \\mathbf F\\cdot d\\mathbf r$. The arrows on the boundary show the direction of travel.', task: 'Drag the region (its centre handle) somewhere else and watch the circulation change.', set: { input: '(-y^3/3 + a*x*y, x^3/3 + b*x)', choices: { shape: 'disk', form: 'tan' }, params: { cx: 0.4, cy: 0.2, R: 1.4, a: 1, b: 1 }, toggles: { micro: false } }, done: (c) => Math.hypot(c.params.cx - 0.4, c.params.cy - 0.2) > 0.5 },
    { text: '**Microscopic circulation.** Cut the region into tiny loops. Each loop’s circulation is about $(Q_x - P_y)\\,\\Delta A$ — the curl times its area (red loops turn counter-clockwise, blue clockwise). Where two loops share an edge they traverse it in opposite directions, so all inner edges **cancel** and only the outer boundary survives.', task: 'Turn on **Microscopic circulation**.', done: (c) => !!c.toggles.micro },
    { text: 'So the circulation around the boundary equals the integral of the curl over the region: $$\\oint_{\\partial D}\\mathbf F\\cdot d\\mathbf r = \\iint_D (Q_x - P_y)\\,dA.$$ MathVerse computes both sides independently — a one-dimensional integral along the curve and a two-dimensional integral over the inside.', task: 'Resize the region with the edge handle (R > 2): the two sides still agree to about 10 digits.', done: () => GR.R > 2 && Math.abs(GR.diff) < 1e-6 * (1 + Math.abs(GR.lhs)) },
    { text: 'The boundary can be any piecewise-smooth closed curve.', task: 'Choose the **flower** or the **square** region.', done: (c) => c.choices.shape === 'flower' || c.choices.shape === 'square' },
    { text: '**Flux form.** Replace the tangent by the outward normal: the net outflow across the boundary equals the total divergence inside, $\\oint \\mathbf F\\cdot\\mathbf n\\,ds = \\iint \\nabla\\cdot\\mathbf F\\,dA$ — the two-dimensional divergence theorem.', task: 'Switch the form to **Flux**.', set: { choices: { form: 'tan' } }, done: (c) => c.choices.form === 'norm' },
    { text: '**Area by walking around.** $\\mathbf F = (-y/2,\\ x/2)$ has curl exactly 1, so its circulation *is* the area enclosed. Planimeters measure areas of maps this way, by tracing the boundary.', task: 'Compare the circulation with the area of the disk, $\\pi R^2$.', set: { input: '(-y/2, x/2)', choices: { form: 'tan', shape: 'disk' }, params: { R: 1.5 } } },
    { text: '**When Green does not apply.** $\\mathbf F = (-y, x)/(x^2+y^2)$ circulates around the origin, where it is undefined. Its curl is 0 everywhere else, yet the circulation around the origin is $2\\pi$. Green’s theorem needs $\\mathbf F$ smooth on the *whole* region.', task: 'Move the region so that it no longer contains the origin: now both sides are 0.', set: { input: '(-y, x)/(x^2 + y^2)', choices: { form: 'tan', shape: 'disk' }, params: { cx: 0, cy: 0, R: 1.2 } }, done: () => Math.hypot(GR.cx, GR.cy) > GR.R * 1.02 && Math.abs(GR.lhs) < 1e-6 },
  ],
  create(ctx) {
    const plot = ctx.plot!;
    plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
    plot.setView({ x0: -3.2, x1: 3.2, y0: -3, y1: 3 });
    let src = '', fN: { P: Node; Q: Node; div: Node | null; curl: Node | null } | null = null, err = '';
    const res = memo<{ lhs: ReturnType<typeof integrate>; rhs: NestedResult; sing: number[] | null; m: number }>();
    const update = () => {
      if (ctx.input !== src) {
        src = ctx.input;
        const r = readFormula(src, ['x', 'y'], 2, 'a field (P, Q)');
        if (r.items) {
          const [P, Q] = r.items, Px = dSym(P, 'x'), Py = dSym(P, 'y'), Qx = dSym(Q, 'x'), Qy = dSym(Q, 'y');
          fN = { P, Q, div: Px && Qy ? simplify({ t: 'add', a: Px, b: Qy }) : null, curl: Qx && Py ? simplify({ t: 'sub', a: Qx, b: Py }) : null }; err = '';
        } else err = r.error;
      }
      ctx.warn(err);
      if (!fN) return;
      const f = fN;
      const pv = paramVals(ctx.params), Pc = compile(f.P, ['x', 'y'], pv), Qc = compile(f.Q, ['x', 'y'], pv);
      const F = (x: number, y: number): [number, number] => [Pc([x, y]), Qc([x, y])];
      const tan = ctx.choices.form === 'tan';
      const sym = tan ? f.curl : f.div;
      const hh = 1e-5;
      const g = sym ? ((c) => (x: number, y: number) => c([x, y]))(compile(sym, ['x', 'y'], pv))
        : tan ? (x: number, y: number) => (Qc([x + hh, y]) - Qc([x - hh, y]) - Pc([x, y + hh]) + Pc([x, y - hh])) / (2 * hh)
        : (x: number, y: number) => (Pc([x + hh, y]) - Pc([x - hh, y]) + Qc([x, y + hh]) - Qc([x, y - hh])) / (2 * hh);
      const cx = ctx.params.cx, cy = ctx.params.cy, R = ctx.params.R, e = ctx.params.e, kind = ctx.choices.shape;
      const sh = shapeOf(kind, cx, cy, R, e);
      const key = `${src}|${pv.a}|${pv.b}|${cx}|${cy}|${R}|${e}|${kind}|${tan}`;
      const r = res(key, () => {
        let lv = 0, le = 0, warn: string | undefined;
        for (const pc of sh.pieces) {
          const q = integrate((t) => { const [x, y] = pc.r(t), [dx, dy] = pc.rp(t), [P, Q] = F(x, y); return tan ? P * dx + Q * dy : P * dy - Q * dx; }, pc.t0, pc.t1, 1e-11);
          lv += q.value; le += q.error; warn = warn ?? q.warning;
        }
        const rhs = sh.rect ? integrate2e((x, y) => g(x, y), sh.rect[0], sh.rect[1], () => sh.rect![2], () => sh.rect![3], 1e-10)
          : integrate2e((t, rr) => g(cx + rr * cos(t), cy + rr * sin(t)) * rr, 0, 2 * PI, () => 0, (t) => sh.rho!(t), 1e-10);
        const ext = (kind === 'flower' ? 1.3 : kind === 'ellipse' ? Math.max(1, e) : kind === 'square' ? 1.42 : 1) * R;
        const sing = findBlowup((p) => Math.hypot(...F(p[0], p[1])), [cx - ext, cy - ext], [cx + ext, cy + ext], (p) => sh.inside(p[0], p[1]), 40);
        let m = 1e-9;
        for (let j = 0; j <= 40; j++) for (let i = 0; i <= 40; i++) { const val = Math.abs(g(-3.2 + (6.4 * i) / 40, -3 + (6 * j) / 40)); if (Number.isFinite(val) && val > m && val < 1e6) m = val; }
        return { lhs: { value: lv, error: le, evals: 0, ok: !warn, warning: warn }, rhs, sing, m };
      });
      Object.assign(GR, { diff: r.lhs.value - r.rhs.value, R, cx, cy, lhs: r.lhs.value, rhs: r.rhs.value });
      const p = palette(ctx.dark);
      plot.setDraw((G) => {
        G.heatmap((x, y) => g(x, y), [-r.m, r.m], 'coolwarm', 120);
        if (ctx.toggles.field) drawArrows(G, F, 18);
        const out: [number, number][] = [];
        for (let i = 0; i <= 400; i++) out.push(sh.outline((2 * PI * i) / 400));
        G.polygon(out, { color: 'rgba(0,0,0,0.7)', width: 5.5 });
        G.polygon(out, { color: p.gold, width: 3, fill: 'rgba(242,193,78,0.10)' });
        for (let k = 0; k < 8; k++) { const t = (2 * PI * (k + 0.5)) / 8, a = sh.outline(t), b = sh.outline(t + 0.02); G.arrow(a, [a[0] + (b[0] - a[0]) * 12, a[1] + (b[1] - a[1]) * 12], { color: p.gold, width: 2.6 }); }
        if (ctx.toggles.micro) {
          const hs = R / 2.6;
          for (let y = cy - 3 * R; y <= cy + 3 * R; y += hs) for (let x = cx - 3 * R; x <= cx + 3 * R; x += hs) {
            if (!sh.inside(x, y)) continue;
            const val = g(x, y); if (!Number.isFinite(val)) continue;
            const rr = hs * 0.32 * (0.35 + 0.65 * Math.sqrt(Math.min(1, Math.abs(val) / r.m)));
            const col = val >= 0 ? '#b40426' : '#3b4cc0';
            if (tan) {
              const s = val >= 0 ? 1 : -1, arc: [number, number][] = [];
              for (let i = 0; i <= 20; i++) { const t = s * (0.4 + (2 * PI - 0.8) * (i / 20)); arc.push([x + rr * cos(t), y + rr * sin(t)]); }
              G.path(arc, { color: col, width: 1.8 });
              G.arrow(arc[18], arc[20], { color: col, width: 1.8 });
            } else for (let k = 0; k < 4; k++) { const t = (k * PI) / 2 + PI / 4, s = val >= 0 ? 1 : -1; const a: [number, number] = [x + (s > 0 ? 0.3 : 1) * rr * cos(t), y + (s > 0 ? 0.3 : 1) * rr * sin(t)], b: [number, number] = [x + (s > 0 ? 1 : 0.3) * rr * cos(t), y + (s > 0 ? 1 : 0.3) * rr * sin(t)]; G.arrow(a, b, { color: col, width: 1.6 }); }
          }
        }
        if (r.sing) { G.point([r.sing[0], r.sing[1]], 6, { fill: '#000000', color: '#ffffff', width: 2 }); G.text([r.sing[0], r.sing[1]], 'singular', { color: p.ink, font: '600 12px Inter, sans-serif' }, 8, -8); }
        G.handle({ id: 'c', at: [cx, cy], color: p.gold, onDrag: ([x, y]) => { ctx.setParam('cx', clamp(x, -3, 3)); ctx.setParam('cy', clamp(y, -3, 3)); update(); } });
        G.handle({ id: 'R', at: [cx + R, cy], r: 5.5, color: p.ink, onDrag: ([x]) => { ctx.setParam('R', clamp(Math.abs(x - cx), 0.1, 3)); update(); } });
      });
      const rows: Readout[] = [
        { label: tan ? 'circulation ∮ F·dr  (boundary)' : 'outward flux ∮ F·n ds  (boundary)', value: `${fmt(r.lhs.value, 11)} ± ${r.lhs.error.toExponential(1)}`, tone: 'good' },
        { label: tan ? '∬ (Q_x − P_y) dA  (inside)' : '∬ div F dA  (inside)', value: fmtQ(r.rhs, 11), tone: 'good' },
        { label: 'difference', value: fmt(r.lhs.value - r.rhs.value, 3), tone: Math.abs(r.lhs.value - r.rhs.value) < 1e-6 * (1 + Math.abs(r.lhs.value)) ? 'muted' : 'warn' },
        { label: tan ? 'curl F = Q_x − P_y' : 'div F = P_x + Q_y', value: texOf(sym), tex: true },
      ];
      ctx.setReadouts(rows);
      ctx.warn(err || (r.sing ? `F is not finite at (${fmt(r.sing[0], 3)}, ${fmt(r.sing[1], 3)}) inside the region. Green’s theorem needs F smooth on the whole region, so the two sides need not agree — the boundary integral also counts what happens at the singularity.` : r.lhs.warning ? `The boundary passes through a point where F is not finite.` : ''));
      ctx.setNote(`Colour: ${tan ? 'curl $Q_x - P_y$' : 'divergence $P_x + Q_y$'} (red positive, blue negative). The gold boundary is traversed counter-clockwise, with the region on the left. ${tan ? 'Circulation' : 'Outward flux'} along it: ${fmt(r.lhs.value, 8)}; total ${tan ? 'curl' : 'divergence'} inside: ${fmt(r.rhs.value, 8)}.`);
    };
    return { update, dispose() {} };
  },
};

function drawArrows(g: Parameters<Parameters<NonNullable<DemoCtx['plot']>['setDraw']>[0]>[0], F: (x: number, y: number) => [number, number], n: number) {
  const { x0, x1, y0, y1 } = g.view;
  const hx = (x1 - x0) / n, ny = Math.max(2, Math.round(((y1 - y0) / (x1 - x0)) * n)), hy = (y1 - y0) / ny;
  let mx = 1e-12;
  const items: [number, number, number, number, number][] = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * hx, y = y0 + (j + 0.5) * hy, [a, b] = F(x, y), m = Math.hypot(a, b); if (Number.isFinite(m) && m > 1e-12) { items.push([x, y, a, b, m]); mx = Math.max(mx, m); } }
  for (const [x, y, a, b, m] of items) { const L = 0.4 * Math.min(hx, hy) * (0.35 + 0.65 * Math.sqrt(Math.min(1, m / mx))); g.arrow([x - (a / m) * L, y - (b / m) * L], [x + (a / m) * L, y + (b / m) * L], { color: 'rgba(20,24,33,0.75)', width: 1.3 }); }
}

// ── Stokes' theorem ────────────────────────────────────────────────────────
const SK = { diff: NaN, h: 0, lhs: NaN };

export const stokes: DemoDef = {
  id: 'calc3.stokes', module: 'calc3', title: 'Stokes’ theorem',
  topic: 'Stokes’ theorem · curl · orientation · surface independence',
  summary: 'The circulation of F around a closed curve in space equals the flux of curl F through any surface spanning it, oriented by the right-hand rule. Inflate the surface from a flat disk into a dome or a bowl: the flux of the curl does not change, because only the boundary matters.',
  tex: '\\oint_{\\partial S}\\mathbf F\\cdot d\\mathbf r = \\iint_S (\\nabla\\times\\mathbf F)\\cdot\\mathbf n\\,dS',
  view: '3d',
  params: [
    { key: 'R', label: 'radius of the boundary circle', value: 1.3, min: 0.3, max: 2, step: 0.01 },
    { key: 'h', label: 'bulge h (0 = flat disk; negative = bowl)', value: 1, min: -2, max: 2, step: 0.01 },
    { key: 'tilt', label: 'tilt of the circle (degrees about the x-axis)', value: 0, min: 0, max: 180, step: 0.5 },
    ...paramSpecs(1, 1),
  ],
  choices: [{ key: 'surf', label: 'Spanning surface', value: 'cap', options: [['cap', 'Paraboloid cap z = h(1 − r²/R²)'], ['hemi', 'Hemisphere (dome if h ≥ 0, bowl if h < 0)']] }],
  toggles: [{ key: 'curl', label: 'curl F on the surface', value: true }, { key: 'bF', label: 'F along the boundary', value: true }, { key: 'normals', label: 'Normals (orientation)', value: false }],
  input: { label: 'F(x, y, z) = (P, Q, R)', value: '(-y + a*z, x + b*z^2, x*y)', placeholder: '(P, Q, R)' },
  experiments: [
    'Move the bulge h from −2 to 2: the surface changes completely but the flux of curl F stays equal to the circulation.',
    'Tilt the circle: for a field with constant curl c, the circulation is (c · n) πR² — largest when the circle faces the curl.',
    'Tilt by 180°: the orientation reverses and both sides change sign together.',
    'Gradient fields have zero curl: try (y z, x z, x y) — the circulation is 0 for every circle.',
    'Physics: Ampère’s law ∮ B·dl = μ₀I. The field of a wire, (-y, x, 0)/(x^2 + y^2), circulates 2π around the z-axis, but its curl is 0 off the wire — the current is concentrated on the axis, where F is singular.',
  ],
  connections: ['calc3.green', 'calc3.divthm', 'calc3.flux', 'calc3.fields'],
  accuracy: 'The circulation is adaptive Gauss–Kronrod along the exact circle; the flux uses the exact symbolic curl and the exact normal r_u × r_v with nested adaptive quadrature. Both carry error estimates. A singularity on the surface is detected numerically.',
  tutorial: [
    { text: 'The gold circle is the **boundary** curve $C$, oriented counter-clockwise when seen from above (arrows). The **circulation** $\\oint_C \\mathbf F\\cdot d\\mathbf r$ adds up the component of $\\mathbf F$ along the circle — the white/red arrows show $\\mathbf F$ on it.', task: 'Turn on **F along the boundary** and read the circulation.', set: { input: '(-y + a*z, x + b*z^2, x*y)', choices: { surf: 'cap' }, params: { R: 1.3, h: 0, tilt: 0, a: 1, b: 1 }, toggles: { curl: true, bF: false, normals: false } }, done: (c) => !!c.toggles.bF },
    { text: 'With $h = 0$ the spanning surface is the **flat disk**. Green’s theorem, applied in that plane, says the circulation equals the flux of the curl’s normal component through the disk. The green arrows show $\\nabla\\times\\mathbf F$ on the surface; colour is $(\\nabla\\times\\mathbf F)\\cdot\\mathbf n$.', task: 'Compare the two numbers in the readouts.' },
    { text: '**Stokes’ theorem** says the same holds for *any* surface with this boundary: $$\\oint_{\\partial S}\\mathbf F\\cdot d\\mathbf r = \\iint_S(\\nabla\\times\\mathbf F)\\cdot\\mathbf n\\,dS.$$ Inside the surface, neighbouring loops cancel just as in Green’s theorem.', task: 'Inflate the surface: set the bulge $h$ above 1.5. The flux of the curl does not move.', done: () => SK.h > 1.5 && Math.abs(SK.diff) < 1e-6 * (1 + Math.abs(SK.lhs)) },
    { text: 'The surface can even turn into a bowl or a hemisphere. The **orientation** must match: the normal follows the right-hand rule (fingers along $C$, thumb along $\\mathbf n$).', task: 'Choose the hemisphere and turn on **Normals**.', done: (c) => c.choices.surf === 'hemi' && !!c.toggles.normals },
    { text: '**Tilting** the circle changes the circulation: for small circles $\\oint \\mathbf F\\cdot d\\mathbf r \\approx (\\nabla\\times\\mathbf F)\\cdot\\mathbf n\\,\\pi R^2$, largest when the circle faces the curl. Tilt by 180° and the orientation flips — both sides change sign.', task: 'Tilt the circle past 90°.', set: { choices: { surf: 'cap' }, params: { h: 0.8 } }, done: (c) => c.params.tilt > 90 },
    { text: '**Physics.** Ampère’s law $\\oint \\mathbf B\\cdot d\\mathbf l = \\mu_0 I$ and Faraday’s law $\\oint\\mathbf E\\cdot d\\mathbf l = -\\frac{d\\Phi_B}{dt}$ are Stokes’ theorem applied to Maxwell’s equations. The field of a straight wire, $(-y, x, 0)/(x^2+y^2)$, has circulation $2\\pi$ around the axis but zero curl off the axis — all of its curl sits on the wire, where the field is singular, so the surface integral misses it.', set: { input: '(-y, x, 0)/(x^2 + y^2)', params: { tilt: 0, h: 0.8 } } },
  ],
  create(ctx) {
    const v = ctx.view3d!;
    v.setBounds({ x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] }); v.resetCamera();
    const read = field3Reader(ctx);
    let surf: Surf | null = null, bnd: Curve | null = null;
    const arr = addArrows(v, 300, 0.022), orient = addArrows(v, 20, 0.035);
    const res = memo<{ lhs: ReturnType<typeof integrate>; rhs: NestedResult; disk: NestedResult; sing: number[] | null }>();
    const update = () => {
      const { f, err } = read();
      ctx.warn(err);
      if (!f) return;
      const pv = paramVals(ctx.params), F = compile3(f.F, pv), C = curlFn(F, f.cd, pv);
      const R = ctx.params.R, h = ctx.params.h, al = (ctx.params.tilt * PI) / 180, kind = ctx.choices.surf;
      SK.h = h;
      const rot = (p: V3): V3 => [p[0], p[1] * cos(al) - p[2] * sin(al), p[1] * sin(al) + p[2] * cos(al)];
      let p: Patch;
      if (kind === 'hemi') { const s = spherePatch([0, 0, 0], R, PI / 2, h < 0); p = { S: (u, w) => rot(s.S(u, w)), N: (u, w) => rot(s.N(u, w)), u: s.u, v: s.v }; }
      else p = { S: (r, t) => rot([r * cos(t), r * sin(t), h * (1 - (r * r) / (R * R))]), N: (r, t) => rot([(2 * h * r * r * cos(t)) / (R * R), (2 * h * r * r * sin(t)) / (R * R), r]), u: [0, R], v: [0, 2 * PI] };
      const disk: Patch = { S: (r, t) => rot([r * cos(t), r * sin(t), 0]), N: (r) => rot([0, 0, r]), u: [0, R], v: [0, 2 * PI] };
      const Cc = (t: number): V3 => rot([R * cos(t), R * sin(t), 0]), Cp = (t: number): V3 => rot([-R * sin(t), R * cos(t), 0]);
      const col = patchColor(p, (q) => C.f(q));
      const so = { uRange: p.u, vRange: p.v, res: 56, colorBy: col.colorBy, colormap: 'coolwarm' as const, colorRange: [-col.m, col.m] as [number, number], opacity: 0.8 };
      const Sf = (u: number, w: number) => { const q = p.S(u, w); return q.every(Number.isFinite) ? q : null; };
      if (!surf) surf = v.addSurface(Sf, so); else surf.update(Sf, so);
      const circle: V3[] = []; for (let i = 0; i <= 160; i++) circle.push(Cc((2 * PI * i) / 160));
      if (!bnd) bnd = v.addCurve(circle, { color: '#f2c14e', radius: 0.035 }); else bnd.set(circle);
      orient.begin();
      for (let k = 0; k < 6; k++) { const t = (2 * PI * (k + 0.25)) / 6; orient.push(Cc(t), scaleV(unit(Cp(t)), 0.28), '#f2c14e'); }
      orient.end();
      arr.begin();
      let cmax = 1e-12, fmax = 1e-12;
      const pts: { q: V3; c: V3; n: V3 }[] = [];
      for (let j = 0; j < 12; j++) for (let i = 0; i < 9; i++) {
        const u = p.u[0] + ((p.u[1] - p.u[0]) * (i + 0.5)) / 9, w = p.v[0] + ((p.v[1] - p.v[0]) * (j + 0.5)) / 12, q = p.S(u, w), c = C.f(q);
        if (q.every(Number.isFinite) && c.every(Number.isFinite)) { pts.push({ q, c, n: unit(p.N(u, w)) }); cmax = Math.max(cmax, norm(c)); }
      }
      if (ctx.toggles.curl) for (const s of pts) arr.push(s.q, scaleV(s.c, 0.4 / cmax), '#6fcf97');
      if (ctx.toggles.normals) for (const s of pts) arr.push(s.q, scaleV(s.n, 0.28), '#e6e9ef');
      if (ctx.toggles.bF) {
        const bs: { q: V3; F: V3; T: V3 }[] = [];
        for (let k = 0; k < 16; k++) { const t = (2 * PI * k) / 16, q = Cc(t), Fq = F(q); if (Fq.every(Number.isFinite)) { bs.push({ q, F: Fq, T: unit(Cp(t)) }); fmax = Math.max(fmax, norm(Fq)); } }
        for (const s of bs) arr.push(s.q, scaleV(s.F, 0.5 / fmax), dot(s.F, s.T) >= 0 ? '#ffffff' : '#ef6b73');
      }
      arr.end();
      const key = `${ctx.input}|${pv.a}|${pv.b}|${R}|${h}|${al}|${kind}`;
      const r = res(key, () => {
        const lhs = lineIntegral((q) => F(q), (t) => Cc(t), (t) => Cp(t), 0, 2 * PI, 1e-11);
        const rhs = fluxIntegral((q) => C.f(q), p.S, p.N, p.u[0], p.u[1], p.v[0], p.v[1], 1e-10);
        const dk = fluxIntegral((q) => C.f(q), disk.S, disk.N, 0, R, 0, 2 * PI, 1e-10);
        const sing = findBlowup((uv) => norm(F(p.S(uv[0], uv[1]))), [p.u[0], p.v[0]], [p.u[1], p.v[1]], undefined, 40);
        return { lhs, rhs, disk: dk, sing };
      });
      SK.diff = r.lhs.value - r.rhs.value; SK.lhs = r.lhs.value;
      const nC = rot([0, 0, 1]);
      ctx.setReadouts([
        { label: 'circulation ∮_C F·dr', value: `${fmt(r.lhs.value, 11)} ± ${r.lhs.error.toExponential(1)}`, tone: 'good' },
        { label: 'flux of curl through this surface', value: fmtQ(r.rhs, 11), tone: 'good' },
        { label: 'difference', value: fmt(r.lhs.value - r.rhs.value, 3), tone: Math.abs(r.lhs.value - r.rhs.value) < 1e-6 * (1 + Math.abs(r.lhs.value)) ? 'muted' : 'warn' },
        { label: 'flux of curl through the flat disk', value: fmtQ(r.disk, 11) },
        { label: 'normal of the circle’s plane', value: fmtV(nC, 3) },
        { label: '∇×F', value: `\\left(${f.cd.curl.map(texOf).join(',\\ ')}\\right)`, tex: true },
      ]);
      ctx.warn(err || (r.sing ? `F is singular on the surface near ${fmtV(p.S(r.sing[0], r.sing[1]), 3)}: Stokes’ theorem needs F smooth on the whole surface, so the sides need not agree.` : !C.exact ? 'curl F is computed by finite differences (no symbolic derivative available).' : ''));
      ctx.setNote(`Colour: $(\\nabla\\times\\mathbf F)\\cdot\\mathbf n$ on the surface (red positive). Green arrows: $\\nabla\\times\\mathbf F$. On the gold boundary, white arrows show $\\mathbf F$ where it pushes along the orientation and red where against. Whatever the bulge, the surface integral equals the circulation: ${fmt(r.lhs.value, 8)}.`);
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── the divergence theorem ─────────────────────────────────────────────────
const DT = { diff: NaN, R: NaN, c: [0, 0, 0] as number[], lhs: NaN, moved: false };

export const divthm: DemoDef = {
  id: 'calc3.divthm', module: 'calc3', title: 'The divergence theorem',
  topic: 'Divergence (Gauss) theorem · flux through closed surfaces · Gauss’s law',
  summary: 'The net flux of F out of a closed surface equals the total divergence inside: whatever flows out must be produced by sources within. Move and resize the region; the surface integral and the volume integral are computed separately and agree.',
  tex: '\\oiint_{\\partial E}\\mathbf F\\cdot\\mathbf n\\,dS = \\iiint_E \\nabla\\cdot\\mathbf F\\,dV',
  view: '3d', animated: true,
  params: [
    { key: 'R', label: 'size R (radius / half-side)', value: 1, min: 0.1, max: 1.8, step: 0.01 },
    { key: 'cx', label: 'centre x (drag the centre)', value: 0.3, min: -1.5, max: 1.5, step: 0.01 },
    { key: 'cy', label: 'centre y', value: 0, min: -1.5, max: 1.5, step: 0.01 },
    { key: 'cz', label: 'centre z', value: 0.2, min: -1.5, max: 1.5, step: 0.01 },
    ...paramSpecs(1, 1),
  ],
  choices: [{ key: 'region', label: 'Region', value: 'ball', options: [['ball', 'Ball'], ['cube', 'Cube'], ['cyl', 'Cylinder']] }],
  toggles: [{ key: 'particles', label: 'Particles in the flow', value: true }, { key: 'normals', label: 'F on the surface', value: true }, { key: 'arrows', label: 'Field arrows in space', value: false }],
  input: { label: 'F(x, y, z) = (P, Q, R)', value: '(x + a*y^2, y*z, z^2/2 - x)', placeholder: '(P, Q, R)' },
  experiments: [
    'Drag the centre around: both sides change together and always agree.',
    'Shrink R: flux / volume tends to div F at the centre — divergence is outflow per unit volume.',
    'An incompressible field such as (y, z, x) or (−y, x, 0): every closed surface has zero net flux.',
    'Gauss’s law: the point charge (x, y, z)/(x^2 + y^2 + z^2)^(3/2). With the origin inside, the flux is 4π although div F = 0 — the charge is a δ-function the volume integral cannot see. Move the region off the origin and both sides are 0.',
    'Physics: for a fluid of density ρ and velocity v, ∂ρ/∂t = −∇·(ρv) — mass is conserved because whatever leaves the region crosses its surface.',
  ],
  connections: ['calc3.flux', 'calc3.stokes', 'calc3.green', 'calc3.triple', 'calc3.fields'],
  accuracy: 'Both sides are numerical and independent: the flux through each face uses the exact normal and nested adaptive quadrature; the volume integral uses the exact symbolic divergence with three-level adaptive quadrature (spherical, Cartesian or cylindrical coordinates). Errors are estimates. A singularity inside the region is detected numerically and reported.',
  tutorial: [
    { text: 'Think of $\\mathbf F$ as the velocity of a fluid. The **outward flux** $\\oiint \\mathbf F\\cdot\\mathbf n\\,dS$ through the closed surface is the net volume leaving per second. Red on the surface: fluid leaving; blue: entering. Press play to see the particles.', task: 'Drag the white centre point (or use the sliders) to move the ball.', set: { input: '(x + a*y^2, y*z, z^2/2 - x)', choices: { region: 'ball' }, params: { R: 1, cx: 0.3, cy: 0, cz: 0.2, a: 1 } }, done: () => DT.moved },
    { text: 'Net outflow must come from **sources** inside. The local source strength is the divergence $\\nabla\\cdot\\mathbf F$ (outflow per unit volume), so $$\\oiint_{\\partial E}\\mathbf F\\cdot\\mathbf n\\,dS = \\iiint_E \\nabla\\cdot\\mathbf F\\,dV.$$ The two sides are computed independently and agree.', task: 'Try another region shape: the cube or the cylinder.', done: (c) => c.choices.region !== 'ball' },
    { text: 'Divergence **is** outflow per unit volume: as the region shrinks to a point, flux ÷ volume tends to $\\nabla\\cdot\\mathbf F$ there.', task: 'Shrink $R$ below 0.2 and compare **flux / volume** with **div F at the centre**.', done: (c) => c.params.R < 0.2 },
    { text: 'An **incompressible** flow has $\\nabla\\cdot\\mathbf F = 0$: as much enters as leaves, through every closed surface. Water is nearly incompressible; that is why a garden hose’s flow rate is the same all along it.', task: 'Move the region around: the flux stays 0.', set: { input: '(y, z, x)', params: { R: 1 } }, done: () => Math.abs(DT.lhs) < 1e-8 },
    { text: '**Gauss’s law.** The electric field of a point charge, $\\mathbf E = \\mathbf r/|\\mathbf r|^3$, has $\\nabla\\cdot\\mathbf E = 0$ away from the charge, yet the flux through a sphere around it is $4\\pi$ (that is $q/\\varepsilon_0$ in SI units). The divergence theorem fails because $\\mathbf E$ is singular inside: the charge is a point source, $\\nabla\\cdot\\mathbf E = 4\\pi\\,\\delta^3(\\mathbf r)$.', task: 'Move the region until the charge is outside: both sides become 0.', set: { input: '(x, y, z)/(x^2 + y^2 + z^2)^(3/2)', choices: { region: 'ball' }, params: { R: 1, cx: 0.2, cy: 0, cz: 0.1 } }, done: () => Math.hypot(DT.c[0], DT.c[1], DT.c[2]) > DT.R * 1.05 && Math.abs(DT.lhs) < 1e-5 },
    { text: 'Together with Green’s and Stokes’ theorems this is one statement — $\\int_{\\partial\\Omega}\\omega = \\int_\\Omega d\\omega$ — the integral of a derivative over a region equals the integral of the original over its boundary, just like $\\int_a^b f\\,dx = F(b) - F(a)$. Try your own field.', set: { input: '(x^3, y^3, z^3)' } },
  ],
  create(ctx) {
    const v = ctx.view3d!;
    v.setBounds({ x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] }); v.resetCamera();
    const read = field3Reader(ctx);
    const S: Surf[] = [];
    let field: Field | null = null, ctr: Point | null = null;
    const arr = addArrows(v, 400, 0.022);
    const NP = 1200, parts = v.addParticles(NP), pos = new Float32Array(NP * 3), life = new Float32Array(NP);
    const seed = (i: number) => { for (let k = 0; k < 3; k++) pos[3 * i + k] = (Math.random() * 2 - 1) * 2.1; life[i] = 1 + Math.random() * 4; };
    for (let i = 0; i < NP; i++) seed(i);
    parts.set(pos, NP);
    let F: (p: ArrayLike<number>) => V3 = () => [0, 0, 0];
    const st = { fitted: true };
    DT.moved = false;
    const res = memo<{ lhs: NestedResult; rhs: NestedResult; sing: number[] | null; vol: number }>();
    const update = () => {
      const { f, err } = read();
      ctx.warn(err);
      if (!f) return;
      const pv = paramVals(ctx.params);
      F = compile3(f.F, pv);
      const D = divFn(F, f.cd, pv);
      const R = ctx.params.R, c: V3 = [ctx.params.cx, ctx.params.cy, ctx.params.cz], kind = ctx.choices.region;
      Object.assign(DT, { R, c });
      fitBounds(v, { x: [-2.2, 2.2], y: [-2.2, 2.2], z: [-2.2, 2.2] }, st);
      let patches: Patch[];
      if (kind === 'cube') {
        const face = (ax: number, s: number): Patch => {
          const S0 = (u: number, w: number): V3 => { const q: V3 = [0, 0, 0]; q[ax] = c[ax] + s * R; q[(ax + 1) % 3] = c[(ax + 1) % 3] + u; q[(ax + 2) % 3] = c[(ax + 2) % 3] + w; return q; };
          const n: V3 = [0, 0, 0]; n[ax] = s;
          return { S: S0, N: () => n, u: [-R, R], v: [-R, R] };
        };
        patches = [face(0, 1), face(0, -1), face(1, 1), face(1, -1), face(2, 1), face(2, -1)];
      } else if (kind === 'cyl') {
        patches = [
          { S: (t, z) => [c[0] + R * cos(t), c[1] + R * sin(t), z], N: (t) => [R * cos(t), R * sin(t), 0], u: [0, 2 * PI], v: [c[2] - R, c[2] + R] },
          { S: (r, t) => [c[0] + r * cos(t), c[1] + r * sin(t), c[2] + R], N: (r) => [0, 0, r], u: [0, R], v: [0, 2 * PI] },
          { S: (r, t) => [c[0] + r * cos(t), c[1] + r * sin(t), c[2] - R], N: (r) => [0, 0, -r], u: [0, R], v: [0, 2 * PI] },
        ];
      } else patches = [spherePatch(c, R)];
      // draw the faces coloured by F·n
      let m = 1e-9;
      const cols = patches.map((p) => { const pc = patchColor(p, F); m = Math.max(m, pc.m); return pc; });
      patches.forEach((p, i) => {
        const o = { uRange: p.u, vRange: p.v, res: kind === 'ball' ? 56 : 20, colorBy: cols[i].colorBy, colormap: 'coolwarm' as const, colorRange: [-m, m] as [number, number], opacity: 0.55 };
        if (!S[i]) S[i] = v.addSurface(p.S, o); else S[i].update(p.S, o);
        S[i].visible(true);
      });
      for (let i = patches.length; i < S.length; i++) S[i].visible(false);
      if (!ctr) ctr = v.addPoint(c, { color: '#ffffff', drag: { onDrag: (q) => { ctx.setParam('cx', clamp(q[0], -1.5, 1.5)); ctx.setParam('cy', clamp(q[1], -1.5, 1.5)); ctx.setParam('cz', clamp(q[2], -1.5, 1.5)); DT.moved = true; update(); } } });
      ctr.set(c);
      if (ctx.toggles.arrows) { if (!field) field = v.addVectorField((q) => F(q), { n: 6 }); else field.update((q) => F(q)); field.visible(true); } else field?.visible(false);
      parts.visible(!!ctx.toggles.particles);
      arr.begin();
      if (ctx.toggles.normals) {
        let fmax = 1e-12;
        const smp: { q: V3; w: V3; n: V3 }[] = [];
        for (const p of patches) { const k = kind === 'cube' ? 4 : 9; for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const u = p.u[0] + ((p.u[1] - p.u[0]) * (i + 0.5)) / k, w = p.v[0] + ((p.v[1] - p.v[0]) * (j + 0.5)) / k, q = p.S(u, w), Fw = F(q); if (Fw.every(Number.isFinite)) { smp.push({ q, w: Fw, n: unit(p.N(u, w)) }); fmax = Math.max(fmax, norm(Fw)); } } }
        for (const s of smp) arr.push(s.q, scaleV(s.w, 0.4 / fmax), dot(s.w, s.n) >= 0 ? '#ef6b73' : '#6aa9ff');
      }
      arr.end();
      const key = `${ctx.input}|${pv.a}|${pv.b}|${R}|${c.join(',')}|${kind}`;
      const r = res(key, () => {
        let lv = 0, le = 0, ok = true, warning: string | undefined;
        for (const p of patches) { const q = fluxIntegral((x) => F(x), p.S, p.N, p.u[0], p.u[1], p.v[0], p.v[1], 1e-9); lv += q.value; le += q.error; ok = ok && q.ok; warning = warning ?? q.warning; }
        const g = (x: number, y: number, z: number) => D.f([x, y, z]);
        const rhs = kind === 'cube' ? integrate3e(g, c[0] - R, c[0] + R, () => c[1] - R, () => c[1] + R, () => c[2] - R, () => c[2] + R, 1e-8)
          : kind === 'cyl' ? integrate3e((t, rr, z) => g(c[0] + rr * cos(t), c[1] + rr * sin(t), z) * rr, 0, 2 * PI, () => 0, () => R, () => c[2] - R, () => c[2] + R, 1e-8)
          : integrate3e((t, ph, rho) => { const s = sin(ph); return g(c[0] + rho * s * cos(t), c[1] + rho * s * sin(t), c[2] + rho * cos(ph)) * rho * rho * s; }, 0, 2 * PI, () => 0, () => PI, () => 0, () => R, 1e-8);
        const inside = (q: number[]) => (kind === 'cube' ? Math.max(Math.abs(q[0] - c[0]), Math.abs(q[1] - c[1]), Math.abs(q[2] - c[2])) <= R : kind === 'cyl' ? Math.hypot(q[0] - c[0], q[1] - c[1]) <= R && Math.abs(q[2] - c[2]) <= R : Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]) <= R);
        const sing = findBlowup((q) => norm(F(q)), [c[0] - R, c[1] - R, c[2] - R], [c[0] + R, c[1] + R, c[2] + R], inside, 16);
        const vol = kind === 'cube' ? 8 * R ** 3 : kind === 'cyl' ? 2 * PI * R ** 3 : (4 / 3) * PI * R ** 3;
        return { lhs: { value: lv, error: le, evals: 0, ok, warning }, rhs, sing, vol };
      });
      DT.diff = r.lhs.value - r.rhs.value; DT.lhs = r.lhs.value;
      ctx.setReadouts([
        { label: 'outward flux ∯ F·n dS', value: fmtQ(r.lhs, 11), tone: 'good' },
        { label: '∭ div F dV', value: fmtQ(r.rhs, 11), tone: 'good' },
        { label: 'difference', value: fmt(r.lhs.value - r.rhs.value, 3), tone: Math.abs(r.lhs.value - r.rhs.value) < 1e-6 * (1 + Math.abs(r.lhs.value)) ? 'muted' : 'warn' },
        { label: 'flux / volume', value: fmt(r.lhs.value / r.vol, 7) },
        { label: 'div F at the centre', value: fmt(D.f(c), 7) },
        { label: 'div F', value: texOf(f.cd.div), tex: true },
      ]);
      ctx.warn(err || (r.sing ? `F is singular inside the region near ${fmtV(r.sing, 3)}. The divergence theorem needs F smooth throughout; here the flux counts a point source the volume integral cannot see (for a point charge, flux = 4π·q).` : r.lhs.warning ? 'F is not finite on the surface — move the region.' : ''));
      ctx.setNote(`Red patches: fluid leaving the region; blue: entering. Net outflow ${fmt(r.lhs.value, 8)} = total source strength inside ${fmt(r.rhs.value, 8)}. Particles drift with $\\mathbf F$ (press play).`);
    };
    return {
      update,
      tick(dt) {
        for (let i = 0; i < NP; i++) {
          const w = F([pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]]), mm = Math.hypot(w[0], w[1], w[2]), k = mm > 0 ? Math.min(1, 2.5 / mm) : 0;
          for (let j = 0; j < 3; j++) pos[3 * i + j] += w[j] * k * dt * 0.5;
          life[i] -= dt;
          if (life[i] < 0 || !Number.isFinite(pos[3 * i] + pos[3 * i + 1] + pos[3 * i + 2]) || Math.abs(pos[3 * i]) > 2.2 || Math.abs(pos[3 * i + 1]) > 2.2 || Math.abs(pos[3 * i + 2]) > 2.2) seed(i);
        }
        parts.set(pos, NP);
      },
      dispose() { v.clear(); },
    };
  },
};

