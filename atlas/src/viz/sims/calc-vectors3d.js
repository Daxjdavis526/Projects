// A rotatable 3D scene for the vector lessons: vectors (arrows with TeX
// labels), their component paths, points, segments, lines, planes,
// parallelograms and triangles — every coordinate an expression of slider,
// choice or toggle parameters, so a lesson configures it entirely from data:
//
//   { type: 'calc-vectors3d', params: {
//       range: 3,                                              // half-length of the axes
//       sliders: [{ key: 'ax', label: '$a_x$', min: -3, max: 3, step: 0.5, value: 2, explain: '…' }, …],
//       vectors: [{ to: ['ax', 'ay', 'az'], color: 'accent', label: '\\vec a' },        // from the origin
//                 { from: ['ax', 'ay', 'az'], to: ['ax + bx', 'ay + by', 'az + bz'], color: 'warn', dash: true }],
//       components: [{ to: ['ax', 'ay', 'az'], color: 'accent' }],    // dashed path: along x, then y, then z
//       points: [{ at: [1, 2, 0], color: 'gold', label: 'P' }],
//       segments: [{ from: [0, 0, 0], to: [1, 1, 1], color: 'ink3', dash: true }],
//       lines: [{ point: [0, 0, 1], dir: [1, 2, 0], t: [-3, 3], color: 'teal', label: 'L' }],
//       planes: [{ normal: [0, 0, 1], d: 0, size: 2.5, color: 'violet', alpha: 0.25, showNormal: true }],  // n·r = d, or point: […]
//       parallelograms: [{ at: [0, 0, 0], u: […], v: […], color: 'gold', alpha: 0.3 }],
//       triangles: [{ pts: [[…], […], […]], color: 'gold' }],
//       curves: [{ param: ['2*cos(t)', '2*sin(t)', 0], t: [0, 2*pi], color: 'teal' }],   // any 3D curve in t
//       spheres: [{ centre: [0, 0, 0], radius: 2, color: 'teal' }],          // drawn as three great circles
//       readouts: [{ label: '$|\\vec a|$', expr: 'sqrt(ax^2 + ay^2 + az^2)', digits: 3 },
//                  { label: '$\\vec a\\times\\vec b$', vec: ['ay*bz - az*by', '…', '…'] }] } }
//
// Any element may carry `when: 'expr'` and is drawn only while that is nonzero
// (choice values should be numbers; toggles count as 1 and 0). Labels are TeX,
// placed in the overlay above the canvas. Arrows are drawn to scale in the
// axes' units. The geometry lives in model/calc-vectors3d.js.

import { View3D } from '../three-d.js';
import { fn } from '../model/exprfn.js';
import { tex } from '../../ui/dom.js';
import * as G from '../model/calc-vectors3d.js';

export const defaults = { range: 3 };

const CSSVAR = { accent: '--accent', accent2: '--accent-2', good: '--good', warn: '--warn', bad: '--bad', violet: '--violet', gold: '--gold', teal: '--teal', ink: '--ink', ink2: '--ink-2', ink3: '--ink-3', ink4: '--ink-4' };
const cssColor = (name) => (CSSVAR[name] ? `var(${CSSVAR[name]})` : 'var(--ink)');
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...(P.toggles || []).map((t) => t.key), ...Object.keys(P.constants || {})];

export function mount(F, P) {
  const { canvas, overlay } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A rotatable 3D picture of vectors — drag to turn it' });
  const R = P.range;
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  for (const tg of P.toggles || []) F.toggle(tg);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  // default camera: the textbook view (x toward the lower left, y to the right,
  // z up), aimed so that the floor grid, the z-axis and the scene's own highest
  // and lowest points (at the starting slider values) all fit; then framed so
  // that nothing the scene draws at those values (plane corners, labelled tips,
  // curves, spheres) falls outside the picture
  const E0 = env(), z0 = (s) => (typeof s === 'number' ? s : fn(s, keys)(E0));
  const zs = [...(P.vectors || []).flatMap((v) => [v.to[2], v.from ? v.from[2] : 0]), ...(P.points || []).map((p) => p.at[2]),
    ...(P.segments || []).flatMap((sg) => [sg.from[2], sg.to[2]]), ...(P.components || []).map((c) => c.to[2])].map(z0).filter(Number.isFinite);
  for (const sp of P.spheres || []) { const c = z0(sp.centre[2]), rr = z0(sp.radius); zs.push(c + rr, c - rr); }
  for (const pl of P.planes || []) {   // a plane patch reaches up to its half-width above and below its centre
    const n = pl.normal.map(z0), c = pl.centre || pl.point, half = z0(pl.size ?? R * 0.8);
    const cz = c ? z0(c[2]) : (n[2] * z0(pl.d ?? 0)) / (n[0] ** 2 + n[1] ** 2 + n[2] ** 2 || 1);
    const reach = half * Math.hypot(n[0], n[1]) / (Math.hypot(...n) || 1);
    zs.push(cz + reach, cz - reach);
  }
  const tz = (Math.max(R, ...zs) - Math.max(0.55 * R, ...zs.map((z) => -z))) / 2;
  const yaw = P.yaw ?? 0.55, pitch = P.pitch ?? 0.38, zoom = P.scale ?? 1.35;
  const across = P.aspect === 'square' ? 1 : P.aspect === 'wide' ? 2 : 1.6;   // the canvas's width : height
  const framed = G.frameScene(scenePoints(P, R, keys, E0), {
    yaw, pitch, target: P.target || [0, 0, tz], dist: P.dist ?? R * 3.6,
    halfH: 0.92 / (2.2 * zoom), halfW: (0.95 * across) / (2.2 * zoom), fixTarget: !!P.target, fixDist: P.dist != null,
  });
  const view = new View3D(canvas, { yaw, pitch, dist: framed.dist, scale: zoom, target: framed.target });
  view.onChange = () => draw();
  F.onChange(() => draw());

  // overlay: TeX labels, and a standing hint that the picture turns
  const pool = [];
  const hint = document.createElement('div');
  hint.textContent = 'drag to rotate';
  Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
  overlay.append(hint);

  function draw() {
    view.begin();
    const E = env();
    const num = (s) => (typeof s === 'number' ? s : fn(s, keys)(E));
    const V = (a) => a.map(num);
    const on = (el) => !el.when || !!num(el.when);
    const marks = [];   // [world point, TeX, colour, screen nudge]
    const tipLabel = (from, to, label, color) => {
      const d = G.sub(to, from), L = G.length(d);
      if (L > 1e-9) marks.push([G.add(to, G.scale(d, (0.13 * R) / L)), label, color, [0, 0]]);
    };

    if (P.grid !== false) {
      for (let k = -Math.floor(R); k <= Math.floor(R); k++) {
        view.line([[k, -R, 0], [k, R, 0]], { color: 'line2', width: 0.8, bias: -0.4 });
        view.line([[-R, k, 0], [R, k, 0]], { color: 'line2', width: 0.8, bias: -0.4 });
      }
    }
    if (P.axes !== false) {
      view.axes(R, P.axisLabels || ['x', 'y', 'z']);
      for (const a of [[-R, 0, 0], [0, -R, 0], [0, 0, -R]]) view.line([a, [0, 0, 0]], { color: 'ink4', width: 1, dash: [3, 4], bias: 0 });
    }
    for (const pl of P.planes || []) {
      if (!on(pl)) continue;
      const n = V(pl.normal);
      if (G.length(n) < 1e-12) continue;
      const centre = pl.centre ? V(pl.centre) : pl.point ? V(pl.point) : G.footOfPlane(n, num(pl.d ?? 0));
      const half = num(pl.size ?? R * 0.8), color = pl.color || 'violet';
      view.surface(G.planePatch(n, centre, half, 10), { color, alpha: pl.alpha ?? 0.25, wire: false });
      const c = G.planeCorners(n, centre, half);
      view.line([...c, c[0]], { color, width: 1.2, bias: 0 });
      if (pl.showNormal) {
        const tip = G.add(centre, G.scale(G.unit(n), half * 0.7));
        view.arrow(centre, tip, { color, width: 2.2 });
        if (pl.normalLabel) tipLabel(centre, tip, pl.normalLabel, color);
      }
      if (pl.label) marks.push([c[2], pl.label, color, [0, 0]]);
    }
    for (const pg of P.parallelograms || []) {
      if (!on(pg)) continue;
      const at = V(pg.at || [0, 0, 0]), u = V(pg.u), v = V(pg.v), color = pg.color || 'gold';
      view.surface(G.parallelogramGrid(at, u, v, 6), { color, alpha: pg.alpha ?? 0.3, wire: false });
      view.line([at, G.add(at, u), G.add(at, G.add(u, v)), G.add(at, v), at], { color, width: 1, bias: 0 });
      if (pg.label) marks.push([G.add(at, G.scale(G.add(u, v), 0.5)), pg.label, color, [0, 0]]);
    }
    for (const tr of P.triangles || []) {
      if (!on(tr)) continue;
      const [a, b, c] = tr.pts.map(V), color = tr.color || 'gold';
      view.surface(G.triangleGrid(a, b, c, 6), { color, alpha: tr.alpha ?? 0.3, wire: false });
      view.line([a, b, c, a], { color, width: 1.2, bias: 0 });
    }
    for (const ln of P.lines || []) {
      if (!on(ln)) continue;
      const p0 = V(ln.point), d = V(ln.dir), [t0, t1] = (ln.t || [-R, R]).map(num), color = ln.color || 'teal';
      view.line(G.linePoints(p0, d, t0, t1, 24), { color, width: ln.width || 2.2, dash: ln.dash ? [6, 5] : [] });
      if (ln.label) marks.push([G.add(p0, G.scale(d, t1)), ln.label, color, [10, -10]]);
    }
    for (const cv of P.curves || []) {
      if (!on(cv)) continue;
      const [t0, t1] = (cv.t || [0, 2 * Math.PI]).map(num), m = cv.samples || 96, f = cv.param.map((s) => fn(s, [...keys, 't']));
      const pts = Array.from({ length: m + 1 }, (_, k) => { const Et = { ...E, t: t0 + ((t1 - t0) * k) / m }; return f.map((g) => g(Et)); });
      view.line(pts, { color: cv.color || 'ink3', width: cv.width || 1.6, dash: cv.dash ? [5, 5] : [] });
      if (cv.label) marks.push([pts[Math.round(m * (cv.labelAt ?? 0.15))], cv.label, cv.color || 'ink3', [10, -10]]);
    }
    for (const sp of P.spheres || []) {
      if (!on(sp)) continue;
      const c = V(sp.centre), rr = num(sp.radius), color = sp.color || 'teal';
      for (const [u, w] of [[[1, 0, 0], [0, 1, 0]], [[1, 0, 0], [0, 0, 1]], [[0, 1, 0], [0, 0, 1]]]) {
        view.line(Array.from({ length: 97 }, (_, k) => { const a = (2 * Math.PI * k) / 96; return G.add(c, G.add(G.scale(u, rr * Math.cos(a)), G.scale(w, rr * Math.sin(a)))); }), { color, width: 1.3, bias: 0 });
      }
      if (sp.label) marks.push([G.add(c, [0, 0, rr]), sp.label, color, [12, -10]]);
    }
    for (const sg of P.segments || []) {
      if (!on(sg)) continue;
      view.line([V(sg.from), V(sg.to)], { color: sg.color || 'ink3', width: sg.width || 1.4, dash: sg.dash ? [5, 5] : [] });
    }
    for (const cp of P.components || []) {
      if (!on(cp)) continue;
      const f = V(cp.from || [0, 0, 0]), t = V(cp.to), color = cp.color || 'ink3';
      const a = [t[0], f[1], f[2]], b = [t[0], t[1], f[2]];
      view.line([f, a, b, t], { color, width: 1.3, dash: [4, 4] });
    }
    for (const vc of P.vectors || []) {
      if (!on(vc)) continue;
      const from = V(vc.from || [0, 0, 0]), to = V(vc.to), color = vc.color || 'accent';
      if (G.length(G.sub(to, from)) < 1e-9) continue;
      view.arrow(from, to, { color, width: vc.width || 2.8, dash: vc.dash ? [6, 5] : [] });
      if (vc.label) tipLabel(from, to, vc.label, color);
    }
    for (const pt of P.points || []) {
      if (!on(pt)) continue;
      const p = V(pt.at), color = pt.color || 'gold';
      view.point(p, { color, r: pt.r || 4.5 });
      if (pt.label) marks.push([p, pt.label, color, [14, -12]]);
    }
    view.end();

    // TeX labels at the projected points
    marks.forEach(([p, label, color, [dx, dy]], k) => {
      let el = pool[k];
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; overlay.append(el); pool.push(el); }
      const [sx, sy, z] = view.project(p);
      el.style.display = z > 0.05 ? '' : 'none';
      el.style.left = `${sx + dx}px`; el.style.top = `${sy + dy}px`;
      el.style.color = cssColor(color);
      if (el.dataset.src !== label) { el.dataset.src = label; el.innerHTML = tex(label); }
    });
    for (let k = marks.length; k < pool.length; k++) pool[k].style.display = 'none';

    if (P.readouts) {
      F.readout(P.readouts.filter(on).map((r) => [r.label, r.vec ? vecTeX(V(r.vec), r.digits) : fmtVal(num(r.expr), r)]));
    }
  }
  F.draw(draw);
  F.caption(P.caption || 'Drag to rotate; scroll or pinch to zoom; arrow keys also turn it. Arrows are to scale in the units of the axes.');
}

// Every point the scene draws at the parameter values E (lines only by their
// anchor point: they are infinite, and may leave the picture), for framing.
export function scenePoints(P, R, keys, E) {
  const num = (s) => (typeof s === 'number' ? s : fn(s, keys)(E)), V = (a) => a.map(num);
  const tip = (from, to) => { const d = G.sub(to, from), L = G.length(d); return L > 1e-9 ? G.add(to, G.scale(d, (0.13 * R) / L)) : to; };
  const pts = [[0, 0, R * 1.12], [0, 0, -0.55 * R]];
  if (P.axes !== false) pts.push([R * 1.12, 0, 0], [0, R * 1.12, 0]);
  if (P.grid !== false) pts.push([R, R, 0], [R, -R, 0], [-R, R, 0], [-R, -R, 0]);
  for (const v of P.vectors || []) { const f = V(v.from || [0, 0, 0]), t = V(v.to); pts.push(f, v.label ? tip(f, t) : t); }
  for (const p of P.points || []) pts.push(V(p.at));
  for (const sg of P.segments || []) pts.push(V(sg.from), V(sg.to));
  for (const c of P.components || []) pts.push(V(c.from || [0, 0, 0]), V(c.to));
  for (const ln of P.lines || []) pts.push(V(ln.point));
  for (const pl of P.planes || []) {
    const n = V(pl.normal);
    if (!(G.length(n) > 1e-12)) continue;
    const c = pl.centre ? V(pl.centre) : pl.point ? V(pl.point) : G.footOfPlane(n, num(pl.d ?? 0)), half = num(pl.size ?? R * 0.8);
    pts.push(...G.planeCorners(n, c, half));
    if (pl.showNormal) pts.push(tip(c, G.add(c, G.scale(G.unit(n), half * 0.7))));
  }
  for (const pg of P.parallelograms || []) { const at = V(pg.at || [0, 0, 0]), u = V(pg.u), v = V(pg.v); pts.push(at, G.add(at, u), G.add(at, v), G.add(at, G.add(u, v))); }
  for (const tr of P.triangles || []) pts.push(...tr.pts.map(V));
  for (const cv of P.curves || []) {
    const [t0, t1] = (cv.t || [0, 2 * Math.PI]).map(num), f = cv.param.map((s) => fn(s, [...keys, 't']));
    for (let k = 0; k <= 48; k++) { const Et = { ...E, t: t0 + ((t1 - t0) * k) / 48 }; pts.push(f.map((g) => g(Et))); }
  }
  for (const sp of P.spheres || []) {
    const c = V(sp.centre), r = num(sp.radius);
    for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6, co = r * Math.cos(a), si = r * Math.sin(a); pts.push(G.add(c, [co, si, 0]), G.add(c, [co, 0, si]), G.add(c, [0, co, si])); }
  }
  return pts.filter((p) => p.every(Number.isFinite));
}

function numTeX(v, digits = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (Math.abs(v) < 1e-9) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(digits - 1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(digits));
}
const vecTeX = (v, digits) => `\\langle ${v.map((x) => numTeX(x, digits)).join(',\\ ')} \\rangle`;
const fmtVal = (v, r) => `${numTeX(v, r.digits ?? 3)}${r.unit && Number.isFinite(v) ? `\\,${r.unit}` : ''}`;

/** Node-side check used by the content tests: every expression must parse with the names it may use. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where) => {
    if (typeof src === 'number') return;
    if (typeof src !== 'string') { problems.push(`calc-vectors3d ${where}: expected a number or an expression`); return; }
    try { fn(src, keys); } catch (e) { problems.push(`calc-vectors3d ${where}: “${src}” — ${e.message}`); }
  };
  const vec3 = (a, where) => {
    if (!Array.isArray(a) || a.length !== 3) { problems.push(`calc-vectors3d ${where}: needs three coordinates`); return; }
    a.forEach((s, k) => check(s, `${where}[${k}]`));
  };
  const each = (list, name, fields) => (list || []).forEach((el, i) => {
    for (const [f, kind, optional] of fields) {
      if (el[f] === undefined) { if (!optional) problems.push(`calc-vectors3d ${name}[${i}] needs ${f}`); continue; }
      if (kind === 'vec') vec3(el[f], `${name}[${i}].${f}`);
      else if (kind === 'vecs') (el[f] || []).forEach((v, k) => vec3(v, `${name}[${i}].${f}[${k}]`));
      else if (kind === 'range') (Array.isArray(el[f]) && el[f].length === 2 ? el[f] : [NaN]).forEach((v, k) => check(v, `${name}[${i}].${f}[${k}]`));
      else check(el[f], `${name}[${i}].${f}`);
    }
    if (el.when !== undefined) check(el.when, `${name}[${i}].when`);
  });
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  if (!(P.range > 0)) problems.push('calc-vectors3d: range must be a positive number');
  each(P.vectors, 'vectors', [['to', 'vec'], ['from', 'vec', true]]);
  each(P.components, 'components', [['to', 'vec'], ['from', 'vec', true]]);
  each(P.points, 'points', [['at', 'vec']]);
  each(P.segments, 'segments', [['from', 'vec'], ['to', 'vec']]);
  each(P.lines, 'lines', [['point', 'vec'], ['dir', 'vec'], ['t', 'range', true]]);
  each(P.planes, 'planes', [['normal', 'vec'], ['point', 'vec', true], ['centre', 'vec', true], ['d', 'expr', true], ['size', 'expr', true]]);
  each(P.parallelograms, 'parallelograms', [['at', 'vec', true], ['u', 'vec'], ['v', 'vec']]);
  each(P.triangles, 'triangles', [['pts', 'vecs']]);
  each(P.spheres, 'spheres', [['centre', 'vec'], ['radius', 'expr']]);
  (P.curves || []).forEach((cv, i) => {
    if (!Array.isArray(cv.param) || cv.param.length !== 3) { problems.push(`calc-vectors3d curves[${i}] needs param: [x(t), y(t), z(t)]`); return; }
    cv.param.forEach((src, k) => { if (typeof src === 'number') return; try { fn(src, [...keys, 't']); } catch (e) { problems.push(`calc-vectors3d curves[${i}].param[${k}]: “${src}” — ${e.message}`); } });
    (cv.t || []).forEach((v, k) => check(v, `curves[${i}].t[${k}]`));
    if (cv.when !== undefined) check(cv.when, `curves[${i}].when`);
  });
  for (const r of P.readouts || []) {
    if (!r.label) problems.push('calc-vectors3d readout needs a label');
    if (r.vec) vec3(r.vec, 'readout vec'); else check(r.expr, 'readout expr');
    if (r.when !== undefined) check(r.when, 'readout when');
  }
  return problems;
}
