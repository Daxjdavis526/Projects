// Polar and parametric curves with what calculus measures on them: a polar
// grid of rings and spokes, curves r = f(θ) and (x(t), y(t)), the region a ray
// sweeps (shaded, with its area ½∫r²dθ), the thin wedges whose sum becomes
// that integral, a ray to the point at angle θ, tangent lines and velocity
// arrows, conics r = p/(1 + e cos θ) with the focus at the pole, and a body
// orbiting by Kepler's equation with equal-time sectors (Kepler's second law).
// Lessons configure it from data, as with `graph`:
//
//   { type: 'calc-polar', params: {
//       x: [-2, 2], y: [-2, 2], aspect: 'wide',            // the view; one unit is the same length on both axes
//       grid: 'polar',                                      // 'polar' (rings and spokes) | 'cartesian' | 'none'
//       spokes: 30, angles: 'rad', rstep: 0.5,              // polar grid: spoke spacing (degrees), angle labels ('rad' | 'deg' | 'none'), ring spacing
//       sliders, choices, constants,                        // as in graph
//       presets: [{ label, set: { e: 0.2056 }, show: ['e'], …overrides }],   // a choice; each entry may set slider values,
//                                                           //   show only some sliders, and override any params
//       curves: [{ polar: '1 + cos(theta)', theta: [0, '2*pi'] }            // or param: ['t - sin(t)', '1 - cos(t)'], t: [a, b]
//                                                           //   or fn: 'x^2' (domain) or conic: ['e', 'p'] — r = p/(1 + e cos θ), the branch round the focus
//                 + color, width, dash, label, labelAt (a θ, t or x), labelDx, labelDy, when, samples],
//       fills: [{ polar, inner, theta } | { conic, theta } | { param, t, to: 'axis' | 'pole' } | { fn, lower, from, to }  + color, alpha, when],
//       wedges: { polar, theta: [α, β], n: 'n', rule: 'mid' }, // n circular wedges: the Riemann sum of ½∫r²dθ
//       rays: [{ polar | conic, at: 'th', arc: true, color, label }],      // pole → the point at θ = at, with the angle marked
//       tangents: [{ param | polar | conic, at: 'T', len: 1, velocity: 0.5, color }],   // tangent line; velocity arrow scaled by `velocity`
//       kepler: { e, p, n: 8, at: 'tau', play: true },       // a body a fraction `at` of a period past perihelion; n equal-time sectors
//       points: [{ x, y } | { r, theta }  + label, color, when, size], segments: [{ from, to, color, dash, label, when }],
//       arrows: [{ from, to, color, label }], vlines: [{ x, label }], hlines: [{ y, label }], texts: [{ text, x, y, color, align }],
//       drag: [{ key: 'p', x, y, snap, polarSnap: [dr, dθ] }],   // the first drag point is an item's answer (get('point'))
//       readouts: [{ label, expr, unit, digits } | { label, classify: 'e' }] } }
//
// Positions and ranges are expressions of the slider keys and of the derived
// values rr, rx, ry, rtheta (the first ray: r and its point), tx, ty, slope,
// speed (the first tangent), kx, ky, kr, ktheta (the orbiting body) and px, py
// (drag point p). Readouts may also use area (the first fill’s area), area1,
// area2, …, len (the first curve’s arc length), len1, …, and wsum (the wedge
// sum). Areas and lengths are computed numerically from the curves.

import { Plot, PALETTE } from '../plot.js';
import { fn } from '../model/exprfn.js';
import {
  TAU, samplePolar, sampleParam, polarArea, paramAreaToAxis, paramAreaFromPole, paramLength, polarLength,
  simpson, wedges as wedgeList, conicRange, conicType, keplerAt, equalTimeSectors,
} from '../model/calc-polar.js';

export const defaults = { x: [-2.4, 2.4], y: [-2.4, 2.4], grid: 'polar', spokes: 30, angles: 'rad' };

export const DERIVED = ['rr', 'rx', 'ry', 'rtheta', 'tx', 'ty', 'slope', 'speed', 'kx', 'ky', 'kr', 'ktheta'];
const MEASURES = ['area', 'len', 'wsum', ...[1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((k) => [`area${k}`, `len${k}`])];
const GRIDS = ['polar', 'cartesian', 'none'];

export function mount(F, P0) {
  const presets = P0.presets?.length ? P0.presets : null;
  const { canvas } = F.canvas({ aspect: P0.aspect || '', label: P0.alt || 'Polar and parametric curves' });
  if (presets) {
    const c = F.choice({ key: 'preset', label: P0.presetLabel || 'Curve', options: presets.map((q, i) => [i, q.label]), value: P0.preset ?? 0, explain: P0.presetExplain || '' });
    c.node.style.gridColumn = '1 / -1';
    const seg = c.node.querySelector('.seg');
    if (seg) seg.style.flexWrap = 'wrap';
  }
  const sliderSpecs = allSliders(P0);
  const ctrls = {};
  for (const s of sliderSpecs) ctrls[s.key] = F.slider(s);
  for (const c of P0.choices || []) F.choice(c);
  const keys = names(P0);
  const plot = new Plot(canvas, { x: P0.x, y: P0.y, equal: true, grid: false, axes: false });

  // draggable points (an item reads the first one as its answer)
  const drags = (P0.drag || []).map((d) => ({ ...d }));
  for (const d of drags) {
    plot.handle(() => [d.x, d.y], (x, y) => {
      if (d.polarSnap) {
        const [dr, dt] = d.polarSnap;
        const r = Math.round(Math.hypot(x, y) / dr) * dr, th = Math.round(Math.atan2(y, x) / dt) * dt;
        d.x = r * Math.cos(th); d.y = r * Math.sin(th);
      } else if (d.snap) { d.x = Math.round(x / d.snap) * d.snap; d.y = Math.round(y / d.snap) * d.snap; } else { d.x = x; d.y = y; }
    });
  }
  if (drags.length) plot.onDrag = () => draw();

  const Q = () => (presets ? { ...P0, ...presets[F.params.preset] } : P0);
  const applyPreset = (silent) => {
    if (!presets) return;
    const q = presets[F.params.preset] || {};
    for (const [k, v] of Object.entries(q.set || {})) { if (ctrls[k]) { if (silent) ctrls[k].set(v); else F.set(k, v); } }
    const show = q.show || P0.show || null;
    for (const s of sliderSpecs) ctrls[s.key].node.style.display = !show || show.includes(s.key) ? '' : 'none';
  };
  applyPreset(true);

  // Kepler: Play advances the time slider
  let anim = null;
  const K0 = P0.kepler;
  if (K0?.play && typeof K0.at === 'string' && ctrls[K0.at]) {
    const btn = F.button({ label: 'Play ▶', onClick: () => {
      if (anim) { anim.stop(); anim = null; btn.textContent = 'Play ▶'; return; }
      btn.textContent = 'Pause ❚❚';
      anim = F.animate((dt) => F.set(K0.at, (F.params[K0.at] + dt / (K0.period || 10)) % 1), { force: true });
    } });
  }

  F.onChange((key) => { if (key === 'preset') applyPreset(false); draw(); });

  function draw() {
    const S = Q();
    const grid = S.grid || 'polar';
    plot.o.grid = grid === 'cartesian'; plot.o.axes = grid === 'cartesian';
    plot.o.xlabel = S.xlabel ?? (grid === 'cartesian' ? 'x' : ''); plot.o.ylabel = S.ylabel ?? (grid === 'cartesian' ? 'y' : '');
    plot.o.xticks = S.xticks; plot.o.yticks = S.yticks;
    plot.setView(S.x || defaults.x, S.y || defaults.y);
    plot.clear();
    if (grid === 'polar') polarGrid(plot, S);

    const E = { ...(S.constants || {}) };
    for (const k of keys) if (typeof F.params[k] === 'number') E[k] = F.params[k];
    for (const d of drags) { E[d.key + 'x'] = d.x; E[d.key + 'y'] = d.y; }
    for (const k of DERIVED) E[k] ??= NaN;
    const vars = [...keys, ...drags.flatMap((d) => [d.key + 'x', d.key + 'y']), ...DERIVED];
    const ev = (src) => (typeof src === 'number' ? src : fn(src, vars)(E));
    const shown = (o) => !o.when || !!ev(o.when);

    // derived values first, so everything drawn can use them
    const ray = (S.rays || [])[0];
    if (ray && shown(ray)) {
      const c = curveOf(ray, ev, vars, E);
      const th = ev(ray.at), r = c.R(th);
      Object.assign(E, { rtheta: th, rr: r, rx: r * Math.cos(th), ry: r * Math.sin(th) });
    }
    const tan = (S.tangents || [])[0];
    if (tan && shown(tan)) Object.assign(E, tangentAt(curveOf(tan, ev, vars, E), ev(tan.at)));
    const K = S.kepler;
    let orbit = null;
    if (K) {
      const e = ev(K.e), p = ev(K.p);
      if (e >= 0 && e < 0.995 && p > 0) {
        const at = K.at !== undefined ? ev(K.at) : 0;
        orbit = { e, p, n: Math.max(1, Math.round(ev(K.n ?? 8))), body: keplerAt(e, p, at) };
        Object.assign(E, { kx: orbit.body.x, ky: orbit.body.y, kr: orbit.body.r, ktheta: orbit.body.theta });
      }
    }

    // shaded regions and their areas
    const areas = [];
    (S.fills || []).forEach((f) => {
      if (!shown(f)) { areas.push(NaN); return; }
      areas.push(drawFill(plot, f, ev, vars, E));
    });
    // Riemann wedges
    let wsum = NaN;
    if (S.wedges && shown(S.wedges)) {
      const W = S.wedges, c = curveOf(W, ev, vars, E);
      const [a, b] = W.theta.map(ev), n = Math.max(1, Math.round(ev(W.n ?? 8)));
      const { list, sum } = wedgeList(c.R, a, b, n, W.rule || 'mid');
      wsum = sum;
      list.forEach((w, k) => drawWedge(plot, w, { color: W.color || 'warn', alpha: k % 2 ? 0.2 : 0.3 }));
    }
    // the orbit and its equal-time sectors
    if (orbit) {
      const { e, p, n, body } = orbit;
      const R = (th) => p / (1 + e * Math.cos(th));
      equalTimeSectors(e, p, n).forEach((s, k) => {
        const pts = [[0, 0], ...samplePolar(R, s.t0, s.t1, 48).map(([x, y]) => [x, y])];
        plot.path(pts, { close: true, fill: k % 2 ? (K.color2 || 'violet') : (K.color || 'accent'), fillAlpha: k % 2 ? 0.2 : 0.3, color: 'ink4', width: 0.8 });
      });
      strokePts(plot, samplePolar(R, -Math.PI, Math.PI, 720), { color: K.orbitColor || 'ink2', width: 2 });
      plot.line(0, 0, body.x, body.y, { color: 'ink3', width: 1.2, dash: [4, 4] });
      plot.point(0, 0, { color: 'gold', r: 7 });
      plot.point(body.x, body.y, { color: 'accent2', r: 5.5 });
    }
    // curves
    const lens = [];
    (S.curves || []).forEach((c, k) => {
      if (!shown(c)) { lens.push(NaN); return; }
      const C = curveOf(c, ev, vars, E);
      const color = c.color || PALETTE[k % PALETTE.length];
      strokePts(plot, C.sample(c.samples || 720), { color, width: c.width || 2.4, dash: c.dash ? [6, 5] : [] });
      lens.push(C);
      if (c.label && c.labelAt !== undefined) {
        const [lx, ly] = C.at(ev(c.labelAt));
        if (Number.isFinite(lx) && Number.isFinite(ly)) plot.text(c.label, lx, ly, { color, dx: c.labelDx ?? 8, dy: c.labelDy ?? -10, weight: 650 });
      }
    });
    for (const l of S.vlines || []) {
      if (!shown(l)) continue;
      const x = ev(l.x);
      plot.line(x, plot.vy0, x, plot.vy1, { color: l.color || 'ink3', width: 1.4, dash: [6, 5] });
      if (l.label) plot.text(l.label, x, plot.vy1, { dx: 5, dy: 11, color: l.color || 'ink3' });
    }
    for (const l of S.hlines || []) {
      if (!shown(l)) continue;
      const y = ev(l.y);
      plot.line(plot.vx0, y, plot.vx1, y, { color: l.color || 'ink3', width: 1.4, dash: [6, 5] });
      if (l.label) plot.text(l.label, plot.vx1, y, { dx: -5, dy: -10, align: 'right', color: l.color || 'ink3' });
    }
    for (const s of S.segments || []) {
      if (!shown(s)) continue;
      const [x0, y0, x1, y1] = [ev(s.from[0]), ev(s.from[1]), ev(s.to[0]), ev(s.to[1])];
      plot.line(x0, y0, x1, y1, { color: s.color || 'ink2', width: s.width || 1.8, dash: s.dash ? [5, 4] : [] });
      if (s.label) plot.text(s.label, (x0 + x1) / 2, (y0 + y1) / 2, { color: s.color || 'ink2', dx: s.labelDx ?? 6, dy: s.labelDy ?? -9, weight: 650 });
    }
    // rays
    (S.rays || []).forEach((r, k) => {
      if (!shown(r)) return;
      const C = curveOf(r, ev, vars, E);
      const th = ev(r.at), rv = C.R(th);
      const color = r.color || 'gold';
      const x = rv * Math.cos(th), y = rv * Math.sin(th);
      if (rv < 0) {   // the point lies on the opposite ray: show the direction θ faintly
        const far = 0.9 * Math.max(Math.abs(plot.vx1 - plot.vx0), Math.abs(plot.vy1 - plot.vy0));
        plot.line(0, 0, far * Math.cos(th), far * Math.sin(th), { color: 'ink3', width: 1.2, dash: [3, 5] });
      }
      if (Number.isFinite(x) && Number.isFinite(y)) plot.line(0, 0, x, y, { color, width: 2, dash: [6, 4] });
      if (r.arc !== false) angleArc(plot, th, { color, label: r.arcLabel ?? 'θ' });
      if (Number.isFinite(x) && Number.isFinite(y)) plot.point(x, y, { color, r: 5, label: r.label, ldx: r.labelDx, ldy: r.labelDy });
      if (k === 0) Object.assign(E, { rtheta: th, rr: rv, rx: x, ry: y });
    });
    // tangent lines and velocity arrows
    for (const tg of S.tangents || []) {
      if (!shown(tg)) continue;
      const C = curveOf(tg, ev, vars, E);
      const T = tangentAt(C, ev(tg.at));
      const color = tg.color || 'gold';
      if (!Number.isFinite(T.tx) || !Number.isFinite(T.ty)) continue;
      const half = tg.len !== undefined ? ev(tg.len) : 0.3 * Math.min(plot.vx1 - plot.vx0, plot.vy1 - plot.vy0);
      if (T.speed > 1e-9 && tg.line !== false) {
        const ux = T.dx / T.speed, uy = T.dy / T.speed;
        plot.line(T.tx - half * ux, T.ty - half * uy, T.tx + half * ux, T.ty + half * uy, { color, width: 2 });
      }
      if (tg.velocity && T.speed > 1e-9) {
        const s = ev(tg.velocity);
        plot.arrow(T.tx, T.ty, T.tx + s * T.dx, T.ty + s * T.dy, { color: tg.velocityColor || 'good', width: 2.2, label: tg.velocityLabel });
      }
      plot.point(T.tx, T.ty, { color, r: 4.5, label: tg.label });
    }
    for (const a of S.arrows || []) {
      if (!shown(a)) continue;
      plot.arrow(ev(a.from[0]), ev(a.from[1]), ev(a.to[0]), ev(a.to[1]), { color: a.color || 'accent', width: 2.2, label: a.label, ldx: a.labelDx, ldy: a.labelDy });
    }
    for (const p of S.points || []) {
      if (!shown(p)) continue;
      let x, y;
      if (p.r !== undefined) { const r = ev(p.r), th = ev(p.theta); x = r * Math.cos(th); y = r * Math.sin(th); } else { x = ev(p.x); y = ev(p.y); }
      if (Number.isFinite(x) && Number.isFinite(y)) plot.point(x, y, { color: p.color || 'accent2', label: p.label, r: p.size, ldx: p.labelDx, ldy: p.labelDy });
    }
    for (const tx of S.texts || []) {
      if (!shown(tx)) continue;
      plot.text(tx.text, ev(tx.x), ev(tx.y), { color: tx.color || 'ink2', align: tx.align || 'center', size: tx.size || 12.5, weight: tx.weight || 600 });
    }
    plot.drawHandles();

    if (S.readouts) {
      const needLen = S.readouts.some((r) => r.expr && /\blen\d*\b/.test(String(r.expr)));
      E.wsum = wsum;
      areas.forEach((A, k) => { E[`area${k + 1}`] = A; });
      E.area = areas[0] ?? NaN;
      if (needLen) lens.forEach((C, k) => { E[`len${k + 1}`] = C && C.length ? C.length() : NaN; });
      E.len = E.len1 ?? NaN;
      const rvars = [...vars, ...MEASURES];
      F.readout(S.readouts.map((r) => {
        if (r.classify !== undefined) return [r.label, `\\text{${conicType(typeof r.classify === 'number' ? r.classify : fn(r.classify, vars)(E))}}`];
        let v = NaN;
        try { v = typeof r.expr === 'number' ? r.expr : fn(r.expr, rvars)(E); } catch { v = NaN; }
        return [r.label, fmtVal(v, r)];
      }));
    }
  }
  F.draw(draw);
  return {
    get: (k) => (k === 'point' && drags[0] ? { x: drags[0].x, y: drags[0].y } : F.params[k]),
    destroy: () => anim?.stop(),
  };
}

// every slider, from the params and from the presets (each key once)
function allSliders(P) {
  const seen = new Set(), out = [];
  for (const s of [...(P.sliders || []), ...(P.presets || []).flatMap((q) => q.sliders || [])]) if (!seen.has(s.key)) { seen.add(s.key); out.push(s); }
  return out;
}
function names(P) {
  return [...allSliders(P).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {}), ...(P.presets?.length ? ['preset'] : [])];
}

/**
 * A curve from its spec: R(θ) for polar curves and conics, a point at a
 * parameter value, a sampler and an arc length.
 */
function curveOf(c, ev, vars, E) {
  if (c.conic) {
    const e = ev(c.conic[0]), p = ev(c.conic[1]);
    const R = (th) => p / (1 + e * Math.cos(th));
    const [a, b] = c.theta ? c.theta.map(ev) : conicRange(e);
    return polarCurve(R, a, b);
  }
  if (c.polar !== undefined) {
    const f = fn(c.polar, ['theta', ...vars]);
    const R = (th) => f({ ...E, theta: th });
    const [a, b] = (c.theta || [0, TAU]).map(ev);
    return polarCurve(R, a, b);
  }
  if (c.param) {
    const gx = fn(c.param[0], ['t', ...vars]), gy = fn(c.param[1], ['t', ...vars]);
    const X = (t) => gx({ ...E, t }), Y = (t) => gy({ ...E, t });
    const [a, b] = (c.t || [0, 1]).map(ev);
    return { X, Y, a, b, at: (t) => [X(t), Y(t)], sample: (n) => sampleParam(X, Y, a, b, n), length: () => paramLength(X, Y, a, b) };
  }
  if (c.fn !== undefined) {
    const f = fn(c.fn, vars);
    const Y = (x) => f({ ...E, x });
    const [a, b] = c.domain ? c.domain.map(ev) : [-1e3, 1e3];
    return { X: (x) => x, Y, a, b, at: (x) => [x, Y(x)], sample: (n) => sampleParam((x) => x, Y, a, b, n), length: () => paramLength((x) => x, Y, a, b) };
  }
  throw new Error('a curve needs polar, param, fn or conic');
}
function polarCurve(R, a, b) {
  const X = (th) => R(th) * Math.cos(th), Y = (th) => R(th) * Math.sin(th);
  return { R, X, Y, a, b, at: (th) => [X(th), Y(th)], sample: (n) => samplePolar(R, a, b, n), length: () => polarLength(R, a, b) };
}

// position, velocity (by central differences) and slope at parameter t
function tangentAt(C, t) {
  const h = 1e-5 * Math.max(1, Math.abs(t));
  const x = C.X(t), y = C.Y(t);
  const dx = (C.X(t + h) - C.X(t - h)) / (2 * h), dy = (C.Y(t + h) - C.Y(t - h)) / (2 * h);
  return { tx: x, ty: y, dx, dy, slope: Math.abs(dx) < 1e-9 ? NaN : dy / dx, speed: Math.hypot(dx, dy) };
}

// a shaded region; returns its area
function drawFill(plot, f, ev, vars, E) {
  const color = f.color || 'accent', alpha = f.alpha ?? 0.22;
  if (f.fn !== undefined) {
    const g = fn(f.fn, vars), lo = f.lower !== undefined ? fn(f.lower, vars) : () => 0;
    const a = ev(f.from), b = ev(f.to);
    const top = (x) => g({ ...E, x }), bot = (x) => lo({ ...E, x });
    if (b > a) plot.area(top, a, b, { color, alpha, lower: bot });
    return simpson((x) => top(x) - bot(x), a, b, 400);
  }
  if (f.param) {
    const gx = fn(f.param[0], ['t', ...vars]), gy = fn(f.param[1], ['t', ...vars]);
    const X = (t) => gx({ ...E, t }), Y = (t) => gy({ ...E, t });
    const [a, b] = (f.t || [0, 1]).map(ev);
    const pts = sampleParam(X, Y, a, b, 600).map(([x, y]) => [x, y]);
    const poly = f.to === 'pole' ? [[0, 0], ...pts] : [...pts, [X(b), 0], [X(a), 0]];
    plot.path(poly, { close: true, fill: color, fillAlpha: alpha, stroke: false });
    return f.to === 'pole' ? paramAreaFromPole(X, Y, a, b) : paramAreaToAxis(X, Y, a, b);
  }
  const C = curveOf(f, ev, vars, E);
  const [a, b] = f.theta ? f.theta.map(ev) : [C.a, C.b];
  const outer = samplePolar(C.R, a, b, 720).map(([x, y]) => [x, y]);
  let inner = [[0, 0]], Rin = null;
  if (f.inner !== undefined) {
    const gi = fn(f.inner, ['theta', ...vars]);
    Rin = (th) => gi({ ...E, theta: th });
    inner = samplePolar(Rin, a, b, 720).map(([x, y]) => [x, y]).reverse();
  }
  plot.path([...outer, ...inner], { close: true, fill: color, fillAlpha: alpha, stroke: false });
  return Math.abs(polarArea(C.R, a, b, Rin));
}

// one circular wedge of radius |r| between two angles (on the opposite side if r < 0)
function drawWedge(plot, w, o) {
  if (!Number.isFinite(w.r)) return;
  const rr = Math.abs(w.r), shift = w.r < 0 ? Math.PI : 0, pts = [[0, 0]];
  const m = Math.max(2, Math.ceil(((w.t1 - w.t0) / TAU) * 180));
  for (let i = 0; i <= m; i++) { const th = w.t0 + ((w.t1 - w.t0) * i) / m + shift; pts.push([rr * Math.cos(th), rr * Math.sin(th)]); }
  plot.path(pts, { close: true, fill: o.color, fillAlpha: o.alpha, color: o.color, width: 1 });
}

// stroke sampled points, breaking at gaps, far-off points and jumps across an asymptote
function strokePts(plot, pts, style) {
  const spanX = plot.vx1 - plot.vx0, spanY = plot.vy1 - plot.vy0, span = Math.max(spanX, spanY);
  const cx = (plot.vx0 + plot.vx1) / 2, cy = (plot.vy0 + plot.vy1) / 2;
  const far = 12 * span, jump = 2.5 * span;
  const runs = [];
  let run = [], prev = null;
  for (const [x, y] of pts) {
    const ok = Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - cx) < far && Math.abs(y - cy) < far;
    if (!ok || (prev && Math.hypot(x - prev[0], y - prev[1]) > jump)) { if (run.length > 1) runs.push(run); run = []; }
    if (ok) { run.push([x, y]); prev = [x, y]; } else prev = null;
  }
  if (run.length > 1) runs.push(run);
  for (const r of runs) plot.path(r, style);
}

// a small arc from the polar axis to angle θ, labelled
function angleArc(plot, th, o) {
  if (!Number.isFinite(th) || Math.abs(th) < 1e-6) return;
  const unit = Math.abs(plot.X(1) - plot.X(0));
  const rad = (o.px || 22) / unit;
  const m = Math.max(4, Math.ceil(Math.abs(th) * 16));
  const pts = [];
  for (let i = 0; i <= m; i++) { const a = (th * i) / m; pts.push([rad * Math.cos(a), rad * Math.sin(a)]); }
  plot.path(pts, { color: o.color, width: 1.6 });
  if (o.label) { const a = th / 2, rl = rad + 12 / unit; plot.text(o.label, rl * Math.cos(a), rl * Math.sin(a), { color: o.color, align: 'center', size: 12, weight: 650 }); }
}

// rings, spokes and angle labels round the pole
function polarGrid(plot, S) {
  const g = plot.ctx, c = plot.col;
  const { vx0, vx1, vy0, vy1 } = plot;
  const Rmax = Math.max(Math.hypot(vx0, vy0), Math.hypot(vx0, vy1), Math.hypot(vx1, vy0), Math.hypot(vx1, vy1));
  const unit = Math.abs(plot.X(1) - plot.X(0));
  const step = S.rstep || niceStep(Math.min(vx1 - vx0, vy1 - vy0) / 5);
  const ox = plot.X(0), oy = plot.Y(0);
  g.save();
  g.lineWidth = 1;
  g.strokeStyle = c.line2;
  for (let k = 1; k * step <= Rmax + 1e-9 && k < 400; k++) { g.beginPath(); g.arc(ox, oy, k * step * unit, 0, TAU); g.stroke(); }
  const dDeg = S.spokes || 30;
  g.strokeStyle = c.line;
  for (let deg = 0; deg < 360 - 1e-9; deg += dDeg) {
    if (deg % 90 === 0) continue;
    const a = (deg * Math.PI) / 180;
    g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Rmax * unit * Math.cos(a), oy - Rmax * unit * Math.sin(a)); g.stroke();
  }
  g.strokeStyle = c.line3; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(plot.L, Math.round(oy) + 0.5); g.lineTo(plot.R, Math.round(oy) + 0.5); g.stroke();
  g.beginPath(); g.moveTo(Math.round(ox) + 0.5, plot.T); g.lineTo(Math.round(ox) + 0.5, plot.B); g.stroke();
  g.restore();
  // ring labels just below the polar axis
  const every = step * unit < 26 ? 2 : 1;
  for (let k = every; k * step <= Rmax && k < 400; k += every) {
    const r = k * step, x = plot.X(r);
    if (x > plot.R - 10 || x < plot.L) continue;
    if (oy < plot.T || oy > plot.B - 12) continue;
    plot.text(fmtTick(r), r, 0, { color: 'ink3', size: 10.5, dx: 0, dy: 9, align: 'center' });
  }
  // angle labels where each spoke leaves the view
  if (S.angles === 'none') return;
  const inside = ox > plot.L && ox < plot.R && oy > plot.T && oy < plot.B;
  if (!inside) return;
  const mx = 16, my = 10;
  for (let deg = 0; deg < 360 - 1e-9; deg += dDeg) {
    const a = (deg * Math.PI) / 180, ux = Math.cos(a), uy = -Math.sin(a);
    let s = Infinity;
    if (ux > 1e-9) s = Math.min(s, (plot.R - mx - ox) / ux); else if (ux < -1e-9) s = Math.min(s, (plot.L + mx - ox) / ux);
    if (uy > 1e-9) s = Math.min(s, (plot.B - my - oy) / uy); else if (uy < -1e-9) s = Math.min(s, (plot.T + my - oy) / uy);
    if (!(s > 40)) continue;
    const label = S.angles === 'deg' ? `${Math.round(deg)}°` : piLabel(deg);
    plot.text(label, ox + s * ux, oy + s * uy, { screen: true, color: 'ink3', size: 11, align: 'center' });
  }
}

function niceStep(raw) {
  if (!(raw > 0)) return 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw * 0.999) || 10 * mag;
}
function fmtTick(v) { return String(+v.toPrecision(6)); }
// an angle in degrees as a multiple of π: 30 → π/6, 135 → 3π/4
function piLabel(deg) {
  if (deg === 0) return '0';
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const n0 = Math.round(deg), g0 = gcd(n0, 180), n = n0 / g0, d = 180 / g0;
  return `${n === 1 ? '' : n}π${d === 1 ? '' : '/' + d}`;
}

function fmtVal(v, r) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const d = r.digits ?? 4;
  const a = Math.abs(v);
  const s = a !== 0 && (a >= 1e5 || a < 1e-3) ? `${v.toExponential(d - 1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`)}` : String(+v.toPrecision(d));
  return r.unit ? `${s}\\,${r.unit}` : s;
}

/** Node-side check used by the content tests: every expression parses with the names it may use. */
export function validate(P) {
  const out = [];
  const keys = names(P);
  const drag = (P.drag || []).flatMap((d) => [d.key + 'x', d.key + 'y']);
  const base = [...keys, ...drag, ...DERIVED];
  const tryF = (src, extra, where) => {
    if (src === undefined || src === null || typeof src === 'number') return;
    try { fn(src, [...base, ...extra]); } catch (e) { out.push(`calc-polar ${where}: “${src}” — ${e.message}`); }
  };
  for (const s of allSliders(P)) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) out.push(`slider ${s.key} needs a label`);
    if ([...DERIVED, ...MEASURES, 'theta', 't', 'x', 'preset'].includes(s.key)) out.push(`slider key ${s.key} is reserved`);
  }
  if (P.presets && !P.presets.every((q) => q.label)) out.push('every preset needs a label');
  const configs = P.presets?.length ? P.presets.map((q) => ({ ...P, ...q })) : [P];
  for (const S of configs) {
    const where = S.label ? `preset “${S.label}”` : 'params';
    if (S.grid && !GRIDS.includes(S.grid)) out.push(`${where}: grid must be ${GRIDS.join(', ')}`);
    for (const k of ['x', 'y']) if (S[k] && !(Array.isArray(S[k]) && S[k].length === 2 && S[k][0] < S[k][1])) out.push(`${where}: ${k} must be [lo, hi]`);
    for (const [k, v] of Object.entries(S.set || {})) if (!keys.includes(k) || typeof v !== 'number') out.push(`${where}: set.${k} must name a slider and give a number`);
    const curveLike = (c, what, allowFn = true, needRange = true) => {
      const kinds = ['polar', 'param', 'conic', ...(allowFn ? ['fn'] : [])].filter((k) => c[k] !== undefined);
      if (kinds.length !== 1) { out.push(`${where} ${what}: needs exactly one of polar, param, conic${allowFn ? ', fn' : ''}`); return; }
      if (c.polar !== undefined) { tryF(c.polar, ['theta'], `${what} polar`); (c.theta || []).forEach((v) => tryF(v, [], `${what} theta`)); }
      if (c.param) {
        if (!(Array.isArray(c.param) && c.param.length === 2)) out.push(`${where} ${what}: param must be [x(t), y(t)]`);
        else { tryF(c.param[0], ['t'], `${what} param x`); tryF(c.param[1], ['t'], `${what} param y`); }
        if (needRange && !(Array.isArray(c.t) && c.t.length === 2)) out.push(`${where} ${what}: param needs t: [a, b]`);
        (c.t || []).forEach((v) => tryF(v, [], `${what} t`));
      }
      if (c.conic) {
        if (!(Array.isArray(c.conic) && c.conic.length === 2)) out.push(`${where} ${what}: conic must be [e, p]`);
        else c.conic.forEach((v) => tryF(v, [], `${what} conic`));
        (c.theta || []).forEach((v) => tryF(v, [], `${what} theta`));
      }
      if (c.fn !== undefined) { tryF(c.fn, ['x'], `${what} fn`); (c.domain || []).forEach((v) => tryF(v, [], `${what} domain`)); }
      if (c.when) tryF(c.when, [], `${what} when`);
    };
    for (const c of S.curves || []) {
      curveLike(c, 'curve');
      if (c.labelAt !== undefined) tryF(c.labelAt, [], 'curve labelAt');
    }
    for (const f of S.fills || []) {
      if (f.fn !== undefined) { tryF(f.fn, ['x'], 'fill fn'); tryF(f.lower, ['x'], 'fill lower'); tryF(f.from, [], 'fill from'); tryF(f.to, [], 'fill to'); if (f.from === undefined || f.to === undefined) out.push(`${where} fill: fn needs from and to`); if (f.when) tryF(f.when, [], 'fill when'); }
      else {
        curveLike(f, 'fill', false);
        if (f.inner !== undefined) tryF(f.inner, ['theta'], 'fill inner');
        if (f.to !== undefined && !['axis', 'pole'].includes(f.to)) out.push(`${where} fill: to must be 'axis' or 'pole'`);
      }
    }
    if (S.wedges) {
      curveLike(S.wedges, 'wedges', false);
      if (!(Array.isArray(S.wedges.theta) && S.wedges.theta.length === 2)) out.push(`${where} wedges: needs theta: [α, β]`);
      tryF(S.wedges.n, [], 'wedges n');
      if (S.wedges.rule && !['left', 'mid', 'right'].includes(S.wedges.rule)) out.push(`${where} wedges: rule must be left, mid or right`);
    }
    for (const r of S.rays || []) { curveLike(r, 'ray', false); if (r.param) out.push(`${where} ray: needs a polar curve or a conic`); tryF(r.at, [], 'ray at'); if (r.at === undefined) out.push(`${where} ray: needs at`); }
    for (const tg of S.tangents || []) { curveLike(tg, 'tangent', true, false); tryF(tg.at, [], 'tangent at'); tryF(tg.len, [], 'tangent len'); tryF(tg.velocity, [], 'tangent velocity'); if (tg.at === undefined) out.push(`${where} tangent: needs at`); }
    if (S.kepler) {
      const K = S.kepler;
      ['e', 'p', 'n', 'at'].forEach((k) => tryF(K[k], [], `kepler ${k}`));
      if (K.e === undefined || K.p === undefined) out.push(`${where} kepler: needs e and p`);
      if (typeof K.e === 'number' && !(K.e >= 0 && K.e < 0.995)) out.push(`${where} kepler: e must lie in [0, 0.995)`);
      if (K.play && !(typeof K.at === 'string' && keys.includes(K.at))) out.push(`${where} kepler: play needs at to name a slider`);
    }
    for (const p of S.points || []) {
      if (p.r !== undefined) { tryF(p.r, [], 'point r'); tryF(p.theta, [], 'point theta'); if (p.theta === undefined) out.push(`${where} point: r needs theta`); }
      else { tryF(p.x, [], 'point x'); tryF(p.y, [], 'point y'); if (p.x === undefined || p.y === undefined) out.push(`${where} point: needs x and y (or r and theta)`); }
      if (p.when) tryF(p.when, [], 'point when');
    }
    for (const s of [...(S.segments || []), ...(S.arrows || [])]) {
      if (!(Array.isArray(s.from) && Array.isArray(s.to) && s.from.length === 2 && s.to.length === 2)) { out.push(`${where}: segments and arrows need from: [x, y] and to: [x, y]`); continue; }
      [...s.from, ...s.to].forEach((v) => tryF(v, [], 'segment'));
      if (s.when) tryF(s.when, [], 'segment when');
    }
    for (const l of S.vlines || []) tryF(l.x, [], 'vline');
    for (const l of S.hlines || []) tryF(l.y, [], 'hline');
    for (const tx of S.texts || []) { tryF(tx.x, [], 'text x'); tryF(tx.y, [], 'text y'); if (!tx.text) out.push(`${where} text: needs text`); }
    for (const r of S.readouts || []) {
      if (r.classify !== undefined) tryF(r.classify, [], 'readout classify');
      else tryF(r.expr, MEASURES, 'readout');
      if (!r.label) out.push(`${where} readout: needs a label`);
    }
  }
  for (const d of P.drag || []) if (!d.key || !Number.isFinite(d.x) || !Number.isFinite(d.y)) out.push('drag: needs key, x and y');
  return out;
}
