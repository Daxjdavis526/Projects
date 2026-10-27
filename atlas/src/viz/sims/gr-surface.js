// Geometry measured from inside a curved surface, computed from its metric
// alone (model/gr-surface.js, tested headlessly): a sphere, a torus, a
// cylinder, a cone and a catenoid, coloured by their Gaussian curvature
// (gold positive, teal zero, blue negative).
//
//   mode 'basis'    — a point P with its coordinate basis vectors e_u and e_v
//     (and fainter copies a step away along each coordinate line); the
//     readout gives the metric, the three non-zero Christoffel symbols and
//     the curvature K there.
//   mode 'geodesic' — the solution of the geodesic equation launched from P
//     at a chosen heading (0° = along the circle through P, 90° = along the
//     meridian); the readout follows Clairaut's ρ²u̇, the conserved quantity
//     the Euler–Lagrange equation for u gives.
//   mode 'loop'     — a small coordinate rectangle around P, travelled
//     anticlockwise (seen from outside); a vector carried around it without
//     turning comes back rotated by ∫K dA, so rotation ÷ area → K.
//
//   { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: 0.6 } }
//   surfaces: ['sphere', 'torus', …] offers a choice (false: none); v fixes P's
//   meridian coordinate (otherwise a 0–1 slider places it); heading (degrees),
//   length, size (the loop's half-width); controls: false draws a still
//   picture; readout: false hides every number.

import { View3D } from '../three-d.js';
import { SURFACES, metric, christoffel, curvature, embed, basis, toVec3, geodesic, loopHolonomy, parallel, meridian } from '../model/gr-surface.js';

export const defaults = {
  mode: 'basis', surface: 'sphere', surfaces: null, v: null, pos: 0.35, heading: 35, length: 8, size: 0.25,
  controls: true, readout: true, colorK: true, yaw: null, pitch: null,
};

const DEG = Math.PI / 180;
const VIEW = {
  sphere: { dist: 3.4, pitch: 0.42, target: [0, 0, 0] },
  torus: { dist: 8.2, pitch: 0.62, target: [0, 0, 0] },
  cylinder: { dist: 5.6, pitch: 0.35, target: [0, 0, 0] },
  cone: { dist: 5.4, pitch: 0.38, target: [0, 0, 0.1] },
  catenoid: { dist: 6.4, pitch: 0.3, target: [0, 0, 0] },
};
const U0 = -0.5;                                     // P's angle around the axis (the camera starts facing it)
const SCALE = { sphere: 0.42, torus: 0.42, cylinder: 0.55, cone: 0.32, catenoid: 0.38 };

export function validate(P) {
  const p = [];
  if (!['basis', 'geodesic', 'loop'].includes(P.mode)) p.push(`gr-surface: unknown mode “${P.mode}” (use basis, geodesic, loop)`);
  const list = P.surfaces || [P.surface];
  for (const s of new Set([P.surface, ...list])) if (!SURFACES[s]) p.push(`gr-surface: unknown surface “${s}” (use ${Object.keys(SURFACES).join(', ')})`);
  if (P.surfaces && !P.surfaces.includes(P.surface)) p.push('gr-surface: surface must be one of surfaces');
  if (P.v !== null && P.v !== undefined && SURFACES[P.surface]) {
    const [a, b] = SURFACES[P.surface].vRange;
    if (!(P.v >= a && P.v <= b)) p.push(`gr-surface: v = ${P.v} lies outside [${a.toFixed(3)}, ${b.toFixed(3)}] for ${P.surface}`);
  }
  if (!(P.pos >= 0 && P.pos <= 1)) p.push('gr-surface: pos must lie in [0, 1]');
  if (!(P.heading >= -180 && P.heading <= 180)) p.push('gr-surface: heading must lie in [−180, 180] degrees');
  if (!(P.length > 0 && P.length <= 40)) p.push('gr-surface: length must lie in (0, 40]');
  if (!(P.size >= 0.02 && P.size <= 0.6)) p.push('gr-surface: size must lie in [0.02, 0.6]');
  return p;
}

const num = (x, n = 3) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (Math.abs(x) < 5e-13) return '0';
  const a = Math.abs(x);
  if (a >= 1e4 || a < 1e-3) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  return String(+x.toPrecision(n));
};

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A curved surface with a point, its coordinate arrows and paths drawn on it' });
  const interactive = P.controls !== false;
  const list = P.surfaces || null;
  if (interactive && list && list.length > 1) {
    F.choice({ key: 'surface', label: 'Surface', options: list.map((k) => [k, SURFACES[k].label]), value: P.surface, explain: 'Colour shows the Gaussian curvature K: gold where it is positive, teal where it is zero, blue where it is negative.' });
  } else F.params.surface = P.surface;
  const fixedV = P.v !== null && P.v !== undefined;
  if (interactive && !fixedV) F.slider({ key: 'pos', label: 'Where P sits along a meridian', min: 0, max: 1, step: 0.005, value: P.pos, explain: 'From one end of the drawn surface to the other (once round the tube on the torus, with the outer equator in the middle). The readout gives P’s coordinate.', fmt: (x) => x.toFixed(2) });
  else F.params.pos = P.pos;
  if (interactive && P.mode === 'geodesic') {
    F.slider({ key: 'heading', label: 'Launch direction at P', min: -180, max: 180, step: 1, value: P.heading, unit: '^\\circ', explain: '0° sets off along the circle through P (increasing $u$); 90° along the meridian (increasing $v$).' });
    F.slider({ key: 'length', label: 'How far to follow it', min: 0.5, max: 30, step: 0.1, value: P.length, explain: 'Distance along the surface, in the units of the drawing.' });
  } else { F.params.heading = P.heading; F.params.length = P.length; }
  if (interactive && P.mode === 'loop') F.slider({ key: 'size', label: 'Size of the loop', min: 0.02, max: 0.6, step: 0.01, value: P.size, explain: 'Half the width of the coordinate rectangle in each coordinate. Shrink it and rotation ÷ area settles on K at P.' });
  else F.params.size = P.size;

  const key0 = F.params.surface;
  const view = new View3D(canvas, { yaw: P.yaw ?? U0, pitch: P.pitch ?? VIEW[key0].pitch, dist: VIEW[key0].dist, target: VIEW[key0].target });
  view.onChange = () => draw();
  let lastSurface = key0;
  F.onChange((k) => {
    if (k === 'surface' && F.params.surface !== lastSurface) {
      const V = VIEW[F.params.surface];
      view.dist = V.dist; view.pitch = V.pitch; view.target = V.target; view.yaw = U0;
      lastSurface = F.params.surface;
    }
    draw();
  });

  const meshCache = new Map();
  function mesh(S, key) {
    if (meshCache.has(key)) return meshCache.get(key);
    const nu = 48, nv = key === 'torus' ? 32 : 24;
    const [a, b] = S.vRange, lo = key === 'cone' ? 0.02 : a, hi = b;
    const grid = Array.from({ length: nv + 1 }, (_, i) => Array.from({ length: nu + 1 }, (_, j) => embed(S, (2 * Math.PI * j) / nu, lo + ((hi - lo) * i) / nv).map((x) => x * 0.995)));
    const vAt = (i) => lo + ((hi - lo) * i) / nv;
    const out = { grid, vAt, nv };
    meshCache.set(key, out);
    return out;
  }
  const vOf = (S, key, p) => {
    if (key === 'sphere') return Math.acos(Math.max(-1, Math.min(1, p[2] / 0.995)));
    if (key === 'torus') return Math.atan2(p[2], Math.hypot(p[0], p[1]) - S.R * 0.995);
    if (key === 'cone') return (1.2 - p[2] / 0.995) / Math.cos(S.alpha);
    return p[2] / 0.995;
  };
  const tint = (K, S) => 0.5 + 0.5 * Math.tanh((2.5 * K) / S.kScale);

  function draw() {
    const key = F.params.surface, S = SURFACES[key];
    const [a, b] = S.vRange;
    const v0 = fixedV ? P.v : a + (b - a) * F.params.pos;
    // on the torus's inner half the near wall faces away from the camera: use the far one, seen through the hole
    const u0 = key === 'torus' && Math.cos(v0) < 0 ? U0 + Math.PI : U0;
    view.begin();
    const M = mesh(S, key);
    view.surface(M.grid, { color: 'accent', alpha: 0.82, wireAlpha: 0.08, ...(P.colorK !== false ? { colorBy: (p, q) => tint(curvature(S, vOf(S, key, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2])), S) } : {}) });
    const X = (u, v) => embed(S, u, v);
    const line = (pts, o) => view.line(pts.map(([u, v]) => X(u, v)), o);
    const P0 = X(u0, v0);
    const sc = SCALE[key];
    const rows = [];
    const names = { u: S.u, v: S.v };
    rows.push([`P: $${names.v}$`, num(v0)]);

    if (P.mode === 'basis') {
      line(parallel(v0, 160), { color: 'ink3', width: 1.2, dash: [5, 4], bias: 0.04 });
      line(meridian(S, u0, 160), { color: 'ink4', width: 1.2, dash: [5, 4], bias: 0.04 });
      const arrows = (u, v, faint) => {
        const { eu, ev } = basis(S, u, v), p = X(u, v);
        view.arrow(p, p.map((x, i) => x + sc * eu[i]), { color: faint ? 'ink3' : 'accent', width: faint ? 1.5 : 3, bias: 0.07 });
        view.arrow(p, p.map((x, i) => x + sc * ev[i]), { color: faint ? 'ink3' : 'violet', width: faint ? 1.5 : 3, bias: 0.07 });
      };
      const dv = Math.min(0.45, (b - a) * 0.15);
      arrows(u0 + 0.6, v0, true);
      if (v0 + dv <= b || S.periodic) arrows(u0, v0 + dv, true);
      arrows(u0, v0, false);
      const { eu, ev } = basis(S, u0, v0);
      view.label(P0.map((x, i) => x + sc * 1.25 * eu[i]), `e_${plain(S.u)}`, { color: 'accent' });
      view.label(P0.map((x, i) => x + sc * 1.25 * ev[i]), `e_${plain(S.v)}`, { color: 'violet' });
      view.point(P0, { color: 'gold', r: 4.5 });
      view.label(P0.map((x, i) => x - 0.12 * ev[i] / Math.hypot(...ev) - 0.1 * eu[i] / Math.hypot(...eu)), 'P', { color: 'ink' });
      const g = metric(S, v0), G = christoffel(S, v0);
      rows.push([`$g_{${names.u}${names.u}}$`, num(g.guu)], [`$g_{${names.v}${names.v}}$`, num(g.gvv)],
        [`$\\Gamma^{${names.u}}{}_{${names.u}${names.v}}$`, num(G.uuv)], [`$\\Gamma^{${names.v}}{}_{${names.u}${names.u}}$`, num(G.vuu)], [`$\\Gamma^{${names.v}}{}_{${names.v}${names.v}}$`, num(G.vvv)],
        ['$K$', num(curvature(S, v0))]);
    } else if (P.mode === 'geodesic') {
      line(parallel(v0, 160), { color: 'ink3', width: 1.2, dash: [5, 4], bias: 0.04 });
      const hd = F.params.heading * DEG;
      const geo = geodesic(S, { u: u0, v: v0, heading: hd, length: F.params.length, steps: Math.max(200, Math.round(F.params.length * 60)) });
      line(geo.pts, { color: 'gold', width: 2.8, bias: 0.06 });
      const g = metric(S, v0);
      const dir = toVec3(S, u0, v0, [Math.cos(hd) / Math.sqrt(g.guu), Math.sin(hd) / Math.sqrt(g.gvv)]);
      view.arrow(P0, P0.map((x, i) => x + 0.45 * dir[i]), { color: 'bad', width: 3, bias: 0.08 });
      view.point(P0, { color: 'ink', r: 4 });
      const end = geo.pts[geo.pts.length - 1];
      view.point(X(end[0], end[1]), { color: 'gold', r: 3.5 });
      const C0 = geo.clairaut[0], C1 = geo.clairaut[geo.clairaut.length - 1];
      rows.push(['$\\rho^2\\dot u$ at the start', num(C0, 4)], ['$\\rho^2\\dot u$ at the end', num(C1, 4)], ['closest the path can come to the axis, $\\rho_{\\min} = |\\rho^2\\dot u|$', num(Math.abs(C0), 3)]);
      if (geo.pts.length < Math.max(200, Math.round(F.params.length * 60)) + 1) rows.push(['', '\\text{the path ran off the drawn surface}']);
    } else {
      const d = F.params.size;
      const L = loopHolonomy(S, u0, v0, d, d);
      line(L.path, { color: 'gold', width: 2.6, bias: 0.06 });
      const n = L.path.length - 1, len = Math.min(0.42, 1.6 * d * Math.sqrt(metric(S, v0).gvv));
      const tip = (k, V) => { const p = X(L.path[k][0], L.path[k][1]), w = toVec3(S, L.path[k][0], L.path[k][1], V), m = Math.hypot(...w) || 1; return [p, p.map((x, i) => x + (len * w[i]) / m)]; };
      for (let j = 1; j < 12; j++) { const k = Math.round((j / 12) * n); const [p, q] = tip(k, L.Vs[k]); view.arrow(p, q, { color: 'gold', width: 1.4, bias: 0.07 }); }
      const [p0, q0] = tip(0, L.Vs[0]), [p1, q1] = tip(n, L.Vs[n]);
      view.arrow(p0, q0, { color: 'ink', width: 2.4, bias: 0.08 });
      view.arrow(p1, q1, { color: 'bad', width: 3, bias: 0.09 });
      view.point(P0, { color: 'ink2', r: 3 });
      rows.push(['rotation after one loop', `${num(L.angle / DEG, 3)}^\\circ`], ['enclosed area $A$', num(L.area, 3)], ['rotation (rad) $\\div A$', num(L.angle / L.area, 4)], ['$K$ at P', num(curvature(S, v0), 4)]);
    }
    view.end();
    if (P.readout !== false) F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || (P.mode === 'basis'
    ? 'Blue and violet: the coordinate basis vectors $\\mathbf e_u$ and $\\mathbf e_v$ at P — not unit vectors: their lengths are $\\sqrt{g_{uu}}$ and $\\sqrt{g_{vv}}$. Grey: the same two arrows a step away along each coordinate line; how they turn and stretch is what the Christoffel symbols record. Dashed: the coordinate lines through P. Colour: Gaussian curvature (gold positive, teal zero, blue negative). Drag to turn the surface.'
    : P.mode === 'geodesic'
      ? 'Gold: the geodesic from P, found by integrating $\\ddot x^a + \\Gamma^a{}_{bc}\\dot x^b\\dot x^c = 0$ step by step from the metric; red: its starting direction; dashed: the circle through P, for comparison. Colour: Gaussian curvature. Drag to turn the surface.'
      : 'Black: a vector at the point where the loop starts and ends. Gold: the same vector carried around the coordinate rectangle without turning (parallel transport, computed from the Christoffel symbols). Red: what comes back. Colour: Gaussian curvature. Drag to turn the surface.'));
  return { get: (k) => F.params[k] };
}

// coordinate names for canvas labels (plain text, not TeX)
function plain(tex) { return tex.replace('\\phi', 'φ').replace('\\theta', 'θ'); }
