// A rotatable 3D surface: z = f(x, y) or a parametric surface (u, v) ↦ (x, y, z),
// written as expressions of slider parameters. Optional extras: the tangent
// plane and gradient at a point you move with sliders, level curves on the
// floor, and curves drawn on the surface. (For parallel transport on a
// sphere, see gr-sphere-transport.)
//
//   { type: 'surface3d', params: {
//       z: 'x^2 - y^2', domain: [[-2, 2], [-2, 2]], tangentAt: ['px', 'py'],
//       sliders: [{ key: 'px', label: '$x_0$', min: -2, max: 2, value: 0.8 }, …],
//       levels: 9 } }

import { View3D, add, mul, sub, cross, norm } from '../three-d.js';
import { fn } from '../model/exprfn.js';

export const defaults = { domain: [[-2, 2], [-2, 2]], n: 36 };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A rotatable 3D surface — drag to turn it' });
  const view = new View3D(canvas, { yaw: P.yaw, pitch: P.pitch, dist: P.dist ?? 9, scale: P.scale ?? 1, target: P.target });
  view.onChange = () => draw();
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = F.params[k]; return e; };
  F.onChange(() => draw());

  function draw() {
    view.begin();
    const E = env();
    const [[x0, x1], [y0, y1]] = P.domain;
    const n = P.n;
    let Z = null, grid;
    if (P.z) {
      Z = fn(P.z, ['x', 'y', ...keys]);
      grid = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => {
        const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * j) / n;
        const z = Z({ ...E, x, y });
        return Number.isFinite(z) && Math.abs(z) < (P.zclip ?? 50) ? [x, y, z * (P.zscale ?? 1)] : [NaN, NaN, NaN];
      }));
    } else {
      const fx = fn(P.surface[0], ['u', 'v', ...keys]), fy = fn(P.surface[1], ['u', 'v', ...keys]), fz = fn(P.surface[2], ['u', 'v', ...keys]);
      grid = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => {
        const u = x0 + ((x1 - x0) * i) / n, v = y0 + ((y1 - y0) * j) / n;
        return [fx({ ...E, u, v }), fy({ ...E, u, v }), fz({ ...E, u, v }) * (P.zscale ?? 1)];
      }));
    }
    const zs = grid.flat().map((p) => p[2]).filter(Number.isFinite);
    const zmin = Math.min(...zs), zmax = Math.max(...zs);
    if (P.axes !== false) view.axes(P.axisLen ?? 2.6, P.axisLabels || ['x', 'y', 'z']);
    view.surface(grid, { colorBy: P.colorBy === false ? null : (p) => (p[2] - zmin) / Math.max(1e-9, zmax - zmin), alpha: P.alpha ?? 0.9 });
    // level curves projected on the floor (marching squares, coarse)
    if (P.levels && Z) {
      const floor = zmin - 0.05 * (zmax - zmin) - (P.floorGap ?? 0.6);
      for (let k = 1; k < P.levels; k++) {
        const c = zmin + ((zmax - zmin) * k) / P.levels;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const a = grid[i][j], b = grid[i + 1][j], cc = grid[i + 1][j + 1], d = grid[i][j + 1];
          const segs = contour([a, b, cc, d], c);
          for (const [p, q] of segs) view.line([[p[0], p[1], floor], [q[0], q[1], floor]], { color: 'accent2', width: 1, bias: 0 });
        }
      }
    }
    // tangent plane and gradient at a point (z-graphs only)
    let readout = [];
    if (P.tangentAt && Z) {
      const px = num(P.tangentAt[0], E), py = num(P.tangentAt[1], E);
      const h = 1e-4;
      const z0 = Z({ ...E, x: px, y: py });
      const fx = (Z({ ...E, x: px + h, y: py }) - Z({ ...E, x: px - h, y: py })) / (2 * h);
      const fy = (Z({ ...E, x: px, y: py + h }) - Z({ ...E, x: px, y: py - h })) / (2 * h);
      const s = P.planeSize ?? 0.8;
      const plane = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [px + a * s, py + b * s, (z0 + fx * a * s + fy * b * s) * (P.zscale ?? 1)]);
      view.surface([[plane[0], plane[3]], [plane[1], plane[2]]], { color: 'gold', alpha: 0.45, wire: false });
      view.point([px, py, z0 * (P.zscale ?? 1)], { color: 'gold' });
      if (P.gradient !== false) {
        const g = [fx, fy];
        const L = Math.hypot(...g) || 1;
        const sc = Math.min(1.2, L) / L;
        view.arrow([px, py, zmin - 0.6], [px + g[0] * sc, py + g[1] * sc, zmin - 0.6], { color: 'bad', width: 2.4 });
        view.label([px + g[0] * sc * 1.15, py + g[1] * sc * 1.15, zmin - 0.6], '∇f', { color: 'bad' });
      }
      readout = [['point', `(${px.toFixed(2)}, ${py.toFixed(2)})`], ['$f$', z0.toFixed(3)], ['$\\partial f/\\partial x$', fx.toFixed(3)], ['$\\partial f/\\partial y$', fy.toFixed(3)], ['$|\\nabla f|$', Math.hypot(fx, fy).toFixed(3)]];
    }
    for (const c of P.curves || []) {
      if (c.when && !num(c.when, E)) continue;           // drawn only while `when` is nonzero
      const fx = fn(c.param[0], ['t', ...keys]), fy = fn(c.param[1], ['t', ...keys]), fz = fn(c.param[2], ['t', ...keys]);
      const [t0, t1] = c.t.map((v) => num(v, E));
      const zs = P.zscale ?? 1;                          // curves share the surface's vertical scale
      const pts = Array.from({ length: 161 }, (_, k) => { const t = t0 + ((t1 - t0) * k) / 160; return [fx({ ...E, t }), fy({ ...E, t }), fz({ ...E, t }) * zs]; });
      view.line(pts, { color: c.color || 'gold', width: c.width || 2.6, bias: 0.04 });
    }
    view.end();
    if (P.readouts) readout = P.readouts.map((r) => {
      const v = num(r.expr, E);
      const s = r.digits ? String(+v.toPrecision(r.digits)) : fmt(v);
      return [r.label, r.unit ? `${s}\\,${r.unit}` : s];
    });
    if (readout.length) F.readout(readout);
  }
  const num = (src, E) => (typeof src === 'number' ? src : fn(src, Object.keys(E))(E));
  F.draw(draw);
  F.caption(P.caption || 'Drag to rotate; scroll or pinch to zoom; arrow keys also turn it.');
}

const fmt = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '\\text{—}');

// marching squares for one cell: returns line segments where z crosses c
function contour(q, c) {
  const pts = [];
  for (let k = 0; k < 4; k++) {
    const a = q[k], b = q[(k + 1) % 4];
    if (!a || !b || !Number.isFinite(a[2]) || !Number.isFinite(b[2])) return [];
    if ((a[2] - c) * (b[2] - c) < 0) { const t = (c - a[2]) / (b[2] - a[2]); pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return pts.length === 2 ? [[pts[0], pts[1]]] : pts.length === 4 ? [[pts[0], pts[1]], [pts[2], pts[3]]] : [];
}

export function validate(P) {
  const problems = [];
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
  const tryParse = (src, vars, where) => { if (typeof src === 'number' || src === undefined) return; try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`surface3d ${where}: “${src}” — ${e.message}`); } };
  if (P.z) tryParse(P.z, ['x', 'y'], 'z');
  else if (P.surface) P.surface.forEach((s) => tryParse(s, ['u', 'v'], 'surface'));
  else problems.push('surface3d needs z or surface');
  for (const c of P.curves || []) { c.param.forEach((s) => tryParse(s, ['t'], 'curve')); (c.t || []).forEach((s) => tryParse(s, [], 'curve t range')); if (c.when) tryParse(c.when, [], 'curve when'); }
  for (const r of P.readouts || []) tryParse(r.expr, [], 'readout');
  if (P.target && !(P.target.length === 3 && P.target.every(Number.isFinite))) problems.push('surface3d target must be [x, y, z] numbers');
  if (P.tangentAt) P.tangentAt.forEach((s) => tryParse(s, [], 'tangentAt'));
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
  return problems;
}
void add; void mul; void sub; void cross; void norm;
