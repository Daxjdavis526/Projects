// A contour map of z = f(x, y): level curves at chosen heights, each labelled
// with its value, optionally shaded by height; one highlighted level c that a
// slider moves; a draggable probe that reads f where it stands; and a 3D view
// of the same function in which the plane z = c slices the surface and the
// cut drops to the floor — the picture behind every contour map.
//
//   { type: 'c3-contour', params: {
//       f: 'x^2 - y^2',                  // expression of x, y and the slider/choice keys
//       x: [-3, 3], y: [-3, 3],          // the map's window (equal scales: circles look round)
//       levels: 9,                       // a count (nice, evenly spaced), a list [-4, -2, 0, 2, 4], or { from, to, step }
//       labels: true,                    // write each level's value on its curve
//       fill: true,                      // shade the bands between levels (low blue → high gold)
//       highlight: 'c',                  // an expression: that level is drawn thick in gold (usually a slider key)
//       sliders, choices, constants,     // as in graph; choice values should be numbers
//       probe: [1, 0.5],                 // a draggable point (a point item's answer); readouts may use px, py and fp = f(px, py)
//       view: '2d',                      // '2d' (the map) or '3d' (the surface); toggle3d: true offers the choice
//       zscale: 1,                       // 3D heights are multiplied by this
//       yaw, pitch, dist,                // the 3D camera
//       points: [{ x, y, label, color, when }],                     // on the map (and on the surface in 3D)
//       curves: [{ param: ['x(t)', 'y(t)'], t: [a, b], color, width, dash, label, when }],
//       arrows: [{ from: [x, y], to: [x, y], color, label, when }], // map only
//       readouts: [{ label, expr, unit, digits }],
//       xlabel: 'x', ylabel: 'y', grid: false, n: 110, aspect: 'wide' } }
//
// The contouring (marching squares) lives in model/c3-contour.js, tested in
// test/c3-contour.test.mjs. A picture must not show its answer: leave the
// labels off, or the probe's readout out, when a question asks for them.

import { Plot } from '../plot.js';
import { View3D } from '../three-d.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-contour.js';

export const defaults = {
  x: [-3, 3], y: [-3, 3], levels: 9, labels: true, fill: true, highlight: null, probe: null, view: '2d', toggle3d: false,
  zscale: 1, xlabel: 'x', ylabel: 'y', grid: false, n: 110, aspect: '',
};

// a perceptual-ish blue → teal → gold ramp, as in three-d.js
const STOPS = [[38, 70, 160], [60, 140, 230], [51, 196, 180], [242, 193, 78]];
function ramp(t) {
  t = Math.max(0, Math.min(1, t));
  const x = t * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i;
  return STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f));
}
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A contour map: level curves of a function of two variables' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.toggle3d) F.choice({ key: '__view', label: 'View', options: [['2d', 'Contour map'], ['3d', 'Surface']], value: P.view === '3d' ? '3d' : '2d', explain: 'The same function: from above, or as a landscape you can turn.' });
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const vars = ['x', 'y', ...keys];
  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: true, xlabel: P.xlabel, ylabel: P.ylabel, grid: !!P.grid });
  // the 3D view exists only when it can be shown (it captures drags and the wheel)
  const view = P.toggle3d || P.view === '3d' ? new View3D(canvas, { yaw: P.yaw ?? -0.75, pitch: P.pitch ?? 0.55, dist: P.dist ?? 9.5, target: P.target || [0, 0, 0] }) : null;
  if (view) view.onChange = () => { if (mode() === '3d') draw(); };
  const mode = () => (P.toggle3d ? F.params.__view : P.view === '3d' ? '3d' : '2d');
  const probe = P.probe ? { x: P.probe[0], y: P.probe[1] } : null;
  if (probe) {
    plot.handle(() => [probe.x, probe.y], (x, y) => { if (mode() !== '2d') return; probe.x = Math.max(plot.vx0, Math.min(plot.vx1, x)); probe.y = Math.max(plot.vy0, Math.min(plot.vy1, y)); }, { hollow: true });
    plot.onDrag = () => { draw(); F.notify('point'); };
  }
  F.onChange(() => draw());
  const off = document.createElement('canvas');

  function draw() {
    const E = env();
    const f = fn(P.f, vars);
    const fxy = (x, y) => f({ ...E, x, y });
    const num = (s, extra = {}) => (typeof s === 'number' ? s : fn(s, [...keys, ...Object.keys(extra)])({ ...E, ...extra }));
    const on = (o) => !o.when || !!num(o.when);
    // levels come from the function's range over the requested window
    const coarse = M.sampleGrid(fxy, P.x, P.y, 60);
    const [lo, hi] = M.range(coarse);
    const levels = M.levelsFrom(P.levels, lo, hi);
    const c = P.highlight != null ? num(P.highlight) : null;
    if (mode() === '3d') draw3d(fxy, levels, c, lo, hi, num, on);
    else draw2d(fxy, levels, c, lo, hi, num, on);
    if (P.readouts) {
      const extra = probe ? { px: probe.x, py: probe.y, fp: fxy(probe.x, probe.y) } : {};
      F.readout(P.readouts.map((r) => [r.label, fmtVal(num(r.expr, extra), r)]));
    }
  }

  function draw2d(fxy, levels, c, lo, hi, num, on) {
    plot.o.grid = !!P.grid; plot.o.axes = P.axes !== false;
    plot.clear();
    const g = plot.ctx, col = plot.col;
    // sample over the whole visible frame (equal scales may widen the window)
    const n = P.n, win = [[plot.vx0, plot.vx1], [plot.vy0, plot.vy1]];
    const ny = Math.max(20, Math.round((n * (plot.vy1 - plot.vy0)) / (plot.vx1 - plot.vx0)));
    const grid = M.sampleGrid(fxy, win[0], win[1], n, ny);
    if (P.fill !== false && levels.length) {
      // shade by band: each pixel of a small offscreen image is one grid cell
      off.width = n; off.height = ny;
      const ox = off.getContext('2d'), img = ox.createImageData(n, ny);
      // colour by the band's rank, so unevenly spaced levels still span the palette
      const cuts = levels.slice().sort((a, b) => a - b), nb = cuts.length;
      for (let i = 0; i < n; i++) for (let j = 0; j < ny; j++) {
        const v = (grid.z[i][j] + grid.z[i + 1][j] + grid.z[i][j + 1] + grid.z[i + 1][j + 1]) / 4;
        const k = 4 * ((ny - 1 - j) * n + i);
        if (!Number.isFinite(v)) { img.data[k + 3] = 0; continue; }
        let b = 0; while (b < nb && v >= cuts[b]) b++;
        const rgb = ramp(nb ? b / nb : 0.5);
        img.data[k] = rgb[0]; img.data[k + 1] = rgb[1]; img.data[k + 2] = rgb[2]; img.data[k + 3] = 255;
      }
      ox.putImageData(img, 0, 0);
      g.save(); plot._clip();
      g.globalAlpha = P.fillAlpha ?? 0.4; g.imageSmoothingEnabled = false;
      g.drawImage(off, plot.X(plot.vx0), plot.Y(plot.vy1), plot.X(plot.vx1) - plot.X(plot.vx0), plot.Y(plot.vy0) - plot.Y(plot.vy1));
      g.restore();
      if (plot.o.axes) plot.axes();
    }
    // the level curves, then their labels
    const taken = [];
    const inside = ([x, y]) => x > plot.vx0 + 0.06 * (plot.vx1 - plot.vx0) && x < plot.vx1 - 0.06 * (plot.vx1 - plot.vx0) && y > plot.vy0 + 0.07 * (plot.vy1 - plot.vy0) && y < plot.vy1 - 0.07 * (plot.vy1 - plot.vy0);
    const pxDist = (a, b) => Math.hypot(plot.X(a[0]) - plot.X(b[0]), plot.Y(a[1]) - plot.Y(b[1]));
    const labelled = [];
    for (const lev of levels) {
      const lines = M.joinSegments(M.contourSegments(grid, lev));
      const rank = levels.length > 1 ? levels.slice().sort((a, b) => a - b).indexOf(lev) / (levels.length - 1) : 0.5;
      const stroke = P.fill !== false ? col.ink2 : `rgb(${ramp(0.15 + 0.85 * rank).join(',')})`;
      for (const line of lines) plot.path(line, { color: stroke, width: 1.3, alpha: 0.85 });
      if (P.labels !== false) {
        // every piece long enough on screen gets a label, if there is room for it
        const pxLen = (line) => line.reduce((s, p, k) => (k ? s + pxDist(p, line[k - 1]) : 0), 0);
        for (const line of lines.filter((l) => pxLen(l) > 70).sort((a, b) => pxLen(b) - pxLen(a))) {
          const spot = M.labelSpot(line, { at: 0.35, inside, taken, gap: 34, dist: pxDist });
          if (spot) { taken.push(spot); labelled.push([spot, M.levelText(lev)]); }
        }
      }
    }
    if (c !== null && Number.isFinite(c)) {
      for (const line of M.joinSegments(M.contourSegments(grid, c))) plot.path(line, { color: 'gold', width: 3 });
    }
    for (const [p, s] of labelled) plot.text(s, p[0], p[1], { size: 11, weight: 650, align: 'center', color: 'ink' });
    // overlays
    for (const cv of P.curves || []) {
      if (!on(cv)) continue;
      const [t0, t1] = cv.t.map((v) => num(v)), fx = fn(cv.param[0], ['t', ...keys]), fy = fn(cv.param[1], ['t', ...keys]);
      const E = env();
      plot.curve((t) => fx({ ...E, t }), (t) => fy({ ...E, t }), t0, t1, { color: cv.color || 'violet', width: cv.width || 2.4, dash: cv.dash ? [6, 5] : [] });
      if (cv.label) { const tm = t0 + (t1 - t0) * (cv.labelAt ?? 0.5); plot.text(cv.label, fx({ ...E, t: tm }), fy({ ...E, t: tm }), { dx: cv.labelDx ?? 8, dy: cv.labelDy ?? -10, color: cv.color || 'violet', weight: 650 }); }
    }
    for (const a of P.arrows || []) {
      if (!on(a)) continue;
      plot.arrow(num(a.from[0]), num(a.from[1]), num(a.to[0]), num(a.to[1]), { color: a.color || 'bad', width: 2.4, label: a.label, ldx: a.labelDx, ldy: a.labelDy });
    }
    for (const p of P.points || []) {
      if (!on(p)) continue;
      plot.point(num(p.x), num(p.y), { color: p.color || 'gold', label: p.label, r: p.r || 5, ldx: p.labelDx, ldy: p.labelDy, lalign: p.labelAlign });
    }
    if (probe) plot.drawHandles();
  }

  function draw3d(fxy, levels, c, lo, hi, num, on) {
    view.begin();
    const zs = P.zscale ?? 1, [[x0, x1], [y0, y1]] = [P.x, P.y];
    const span = hi - lo || 1, floor = lo * zs - 0.12 * span * zs - 0.5;
    const m = 40;
    const grid = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => {
      const x = x0 + ((x1 - x0) * i) / m, y = y0 + ((y1 - y0) * j) / m, z = fxy(x, y);
      return Number.isFinite(z) ? [x, y, z * zs] : [NaN, NaN, NaN];
    }));
    if (P.axes !== false) view.axes(Math.max(x1, y1) * 1.1, [P.xlabel || 'x', P.ylabel || 'y', 'z']);
    view.surface(grid, { colorBy: (p) => (p[2] / zs - lo) / span, alpha: 0.82 });
    const fine = M.sampleGrid(fxy, P.x, P.y, 90);
    for (const lev of levels) {
      for (const line of M.joinSegments(M.contourSegments(fine, lev))) {
        view.line(line.map(([x, y]) => [x, y, lev * zs]), { color: 'ink2', width: 1, bias: 0.03 });
        view.line(line.map(([x, y]) => [x, y, floor]), { color: 'ink3', width: 1, bias: 0 });
      }
    }
    if (c !== null && Number.isFinite(c)) {
      // the plane z = c, split into tiles so it sorts properly against the surface
      const k = 10, h = c * zs;
      const tiles = Array.from({ length: k + 1 }, (_, i) => Array.from({ length: k + 1 }, (_, j) => [x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * j) / k, h]));
      view.surface(tiles, { color: 'gold', alpha: 0.2, wire: false });
      for (const line of M.joinSegments(M.contourSegments(fine, c))) {
        view.line(line.map(([x, y]) => [x, y, h]), { color: 'gold', width: 3, bias: 0.05 });
        view.line(line.map(([x, y]) => [x, y, floor]), { color: 'gold', width: 2.6, bias: 0 });
      }
    }
    // the floor's outline, where the contour map lies
    view.line([[x0, y0, floor], [x1, y0, floor], [x1, y1, floor], [x0, y1, floor], [x0, y0, floor]], { color: 'ink4', width: 1, bias: 0 });
    for (const cv of P.curves || []) {
      if (!on(cv)) continue;
      const [t0, t1] = cv.t.map((v) => num(v)), fx = fn(cv.param[0], ['t', ...keys]), fy = fn(cv.param[1], ['t', ...keys]);
      const E = env(), pts = [];
      for (let s = 0; s <= 120; s++) { const t = t0 + ((t1 - t0) * s) / 120, x = fx({ ...E, t }), y = fy({ ...E, t }); pts.push([x, y, fxy(x, y) * zs]); }
      view.line(pts, { color: cv.color || 'violet', width: cv.width || 2.4, bias: 0.06 });
    }
    for (const p of P.points || []) {
      if (!on(p)) continue;
      const x = num(p.x), y = num(p.y), z = fxy(x, y) * zs;
      view.point([x, y, z], { color: p.color || 'gold' });
      if (p.label) view.label([x, y, z + 0.35], p.label, { color: p.color || 'gold' });
    }
    if (probe) {
      const z = fxy(probe.x, probe.y) * zs;
      view.line([[probe.x, probe.y, floor], [probe.x, probe.y, z]], { color: 'accent2', width: 1.2, dash: [4, 4], bias: 0 });
      view.point([probe.x, probe.y, z], { color: 'accent2' });
    }
    view.end();
  }

  F.draw(draw);
  F.caption(P.caption || 'Level curves are drawn at evenly spaced values, so where they crowd together the function changes fast.');
  return { get: (k) => (k === 'point' && probe ? { x: probe.x, y: probe.y } : F.params[k]) };
}

function fmtVal(v, r) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const d = r.digits ?? 3, a = Math.abs(v);
  const s = a !== 0 && (a >= 1e5 || a < 1e-3) ? v.toExponential(d - 1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`) : String(+v.toPrecision(d));
  return r.unit ? `${s}\\,${r.unit}` : s;
}

/** Node-side check used by the content tests: every expression must parse with the names it may use. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const tryParse = (src, vars, where) => {
    if (typeof src === 'number') return;
    if (typeof src !== 'string') { problems.push(`c3-contour ${where}: expected a number or an expression`); return; }
    try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`c3-contour ${where}: “${src}” — ${e.message}`); }
  };
  if (!P.f) problems.push('c3-contour needs f, an expression of x and y');
  else tryParse(P.f, ['x', 'y'], 'f');
  for (const [name, r] of [['x', P.x], ['y', P.y]]) if (!(Array.isArray(r) && r.length === 2 && r[0] < r[1])) problems.push(`c3-contour: ${name} must be [min, max] with min < max`);
  const L = P.levels;
  if (!(typeof L === 'number' ? L >= 1 : Array.isArray(L) ? L.every(Number.isFinite) : L && L.step > 0 && L.from <= L.to)) problems.push('c3-contour: levels must be a count, a list of numbers, or { from, to, step }');
  if (P.highlight != null) tryParse(P.highlight, [], 'highlight');
  if (P.probe && !(P.probe.length === 2 && P.probe.every(Number.isFinite))) problems.push('c3-contour: probe must be [x, y] numbers');
  if (!['2d', '3d'].includes(P.view)) problems.push("c3-contour: view must be '2d' or '3d'");
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
  for (const p of P.points || []) { tryParse(p.x, [], 'point x'); tryParse(p.y, [], 'point y'); if (p.when) tryParse(p.when, [], 'point when'); }
  for (const a of P.arrows || []) { [...(a.from || []), ...(a.to || [])].forEach((v) => tryParse(v, [], 'arrow')); if (!(a.from?.length === 2 && a.to?.length === 2)) problems.push('c3-contour: an arrow needs from: [x, y] and to: [x, y]'); }
  for (const cv of P.curves || []) {
    if (!(Array.isArray(cv.param) && cv.param.length === 2)) { problems.push('c3-contour: a curve needs param: [x(t), y(t)]'); continue; }
    cv.param.forEach((s) => tryParse(s, ['t'], 'curve'));
    if (!(Array.isArray(cv.t) && cv.t.length === 2)) problems.push('c3-contour: a curve needs t: [a, b]'); else cv.t.forEach((s) => tryParse(s, [], 'curve t'));
    if (cv.when) tryParse(cv.when, [], 'curve when');
  }
  for (const r of P.readouts || []) { if (!r.label) problems.push('c3-contour: a readout needs a label'); tryParse(r.expr, ['px', 'py', 'fp'], 'readout'); }
  return problems;
}
