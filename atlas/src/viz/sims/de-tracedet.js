// The trace–determinant map: every linear system x′ = Ax in the plane is a
// point (τ, Δ) = (trace, determinant), and its point alone decides the
// portrait's type. Left: the map, with the saddles below the axis, the
// parabola τ² = 4Δ between nodes and spirals, the centres on the positive Δ
// axis and a line of equilibria along Δ = 0 — and a point you drag. Right:
// the phase portrait of a matrix with that trace and determinant, with its
// eigenvector lines. The matrix is the companion matrix [[0, 1], [−Δ, τ]] —
// the system of x″ − τx′ + Δx = 0 (x across, x′ up) — unless `matrix` gives
// one written in slider keys, in which case the sliders move the point.
// Numerics in model/de-plane.js (test/de-plane.test.mjs).
//
//   { type: 'de-tracedet', params: {
//       tau: -1, Delta: 2,               // the starting point (input 'drag')
//       drag: true, snap: 0.05,          // the point can be dragged (snapped to a grid, and onto the parabola when close)
//       marker: true,                    // with drag: false, marker: false hides the point (a map of fixed points only)
//       matrix: null,                    // or [[a, b], [c, d]] in slider keys: the point follows the matrix
//       sliders, constants,              // for matrix (as in graph)
//       map: { tau: [-4, 4], Delta: [-2.5, 5] },   // the map's window
//       view: 3,                         // the portrait's half-width
//       panels: 'both',                  // or 'map' or 'portrait'
//       labels: true,                    // the names of the regions on the map (false: a question asks for them)
//       eigen: true,                     // the eigenvector lines in the portrait
//       points: [{ tau, Delta, label, color }],      // fixed marks on the map (plain-text labels)
//       paths: [{ tau: '-c', Delta: '4', t: [0, 5], color, label }],   // parametric paths on the map (expressions of t)
//       readout: true,                   // τ, Δ, τ² − 4Δ, the eigenvalues and the type (false hides them)
//   } }

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { classify2, eig2, orbit, eqColor } from '../model/de-plane.js';

export const defaults = {
  tau: -1, Delta: 2, drag: true, snap: 0.05, matrix: null, map: { tau: [-4, 4], Delta: [-2.5, 5] }, view: 3,
  panels: 'both', labels: true, eigen: true, points: [], paths: [], readout: true,
};

const num = (v, d = 3) => (!Number.isFinite(v) ? '\\text{—}' : Math.abs(v) < 5e-13 ? '0' : String(+v.toPrecision(d)));
const plain = (v, d = 3) => String(+(+v).toPrecision(d)).replace('-', '−');

export function mount(F, P0) {
  const P = { ...defaults, ...P0, map: { ...defaults.map, ...(P0.map || {}) } };
  const showMap = P.panels !== 'portrait', showPortrait = P.panels !== 'map';
  const both = showMap && showPortrait;
  const cm = showMap ? F.canvas({ aspect: 'square', label: 'The trace–determinant map with a draggable point' }) : null;
  const cp = showPortrait ? F.canvas({ aspect: 'square', label: 'The phase portrait of a system with that trace and determinant' }) : null;
  if (both) {
    // side by side when there is room, one above the other on a phone
    const stage = cm.box.parentElement;
    Object.assign(stage.style, { display: 'flex', flexWrap: 'wrap', gap: '10px' });
    for (const b of [cm.box, cp.box]) Object.assign(b.style, { flex: '1 1 260px', width: 'auto', minWidth: '0' });
  }
  for (const s of P.sliders || []) F.slider(s);
  const keys = [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
  const env = () => { const e = { ...(P.constants || {}) }; for (const s of P.sliders || []) e[s.key] = +F.params[s.key]; return e; };
  const ev = (src, E, extra = []) => (typeof src === 'number' ? src : fn(src, [...keys, ...extra])(E));
  const pm = cm && new Plot(cm.canvas, { x: P.map.tau, y: P.map.Delta, xlabel: 'τ (trace)', ylabel: 'Δ (det)', pad: { l: 40, r: 12, t: 12, b: 34 } });
  const pp = cp && new Plot(cp.canvas, { x: [-P.view, P.view], y: [-P.view, P.view], equal: true, xlabel: P.matrix ? 'x' : 'x', ylabel: P.matrix ? 'y' : 'x′', pad: { l: 34, r: 12, t: 12, b: 34 } });

  const pt = { tau: P.tau, Delta: P.Delta };
  if (pm && P.drag && !P.matrix) {
    const sn = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
    pm.handle(() => [pt.tau, pt.Delta], (x, y) => {
      let tau = sn(Math.max(pm.vx0, Math.min(pm.vx1, x))), Delta = sn(Math.max(pm.vy0, Math.min(pm.vy1, y)));
      // onto the parabola (degenerate nodes) when close to it
      if (Math.abs(Delta - (tau * tau) / 4) < 0.06) Delta = (tau * tau) / 4;
      pt.tau = +tau.toFixed(6); pt.Delta = +Delta.toFixed(6);
    });
    pm.onDrag = () => { draw(); F.notify('point'); };
  }
  F.onChange(() => draw());

  function matrix(E) {
    if (P.matrix) return P.matrix.map((row) => row.map((s) => ev(s, E)));
    return [[0, 1], [-pt.Delta, pt.tau]];
  }

  function draw() {
    const E = env();
    const A = matrix(E), [[a, b], [c, d]] = A;
    const type = classify2(a, b, c, d, 1e-7), e = eig2(a, b, c, d, 1e-7);
    if (P.matrix) { pt.tau = a + d; pt.Delta = a * d - b * c; }
    if (pm) drawMap(E, type);
    if (pp) drawPortrait(A, type, e);
    if (P.readout !== false) {
      const lam = e.values[0].im === 0
        ? (Math.abs(e.values[0].re - e.values[1].re) < 1e-9 ? `${num(e.values[0].re)}\\ (\\text{twice})` : `${num(e.values[0].re)},\\ ${num(e.values[1].re)}`)
        : `${num(e.values[0].re)} \\pm ${num(e.values[0].im)}i`;
      F.readout([
        ['$A$', `\\begin{bmatrix} ${num(a)} & ${num(b)} \\\\ ${num(c)} & ${num(d)} \\end{bmatrix}`],
        ['$\\tau$', num(e.tr)], ['$\\Delta$', num(e.det)], ['$\\tau^2 - 4\\Delta$', num(e.disc)], ['$\\lambda$', lam], ['type', `\\text{${type.name}}`],
      ]);
    }
  }

  function drawMap(E, type) {
    pm.clear();
    const X0 = pm.vx0, X1 = pm.vx1, Y0 = pm.vy0, Y1 = pm.vy1;
    // tint the regions: saddles below the axis; above it, nodes under the parabola and spirals over it
    if (Y0 < 0) pm.rect(X0, Y0, X1 - X0, -Y0, { fill: 'warn', alpha: 0.1, stroke: false });
    const para = (x) => (x * x) / 4;
    pm.area((x) => Y1, X0, 0, { color: 'good', alpha: 0.07, lower: (x) => Math.min(Y1, para(x)) });
    pm.area((x) => Y1, 0, X1, { color: 'bad', alpha: 0.07, lower: (x) => Math.min(Y1, para(x)) });
    // the borders: the parabola τ² = 4Δ, the centres on τ = 0, and Δ = 0
    pm.fn(para, { color: 'ink2', width: 2 });
    pm.line(0, 0, 0, Y1, { color: 'gold', width: 3 });
    pm.line(X0, 0, X1, 0, { color: 'ink3', width: 2 });
    if (P.labels !== false) {
      const L = (s, x, y, o = {}) => pm.text(s, x, y, { size: 11.5, weight: 650, color: 'ink2', align: 'center', ...o });
      L('saddles', (X0 + X1) / 2, Y0 / 2, { color: 'warn' });
      L('stable', X0 * 0.42, Y1 * 0.8, { color: 'good' }); L('spirals', X0 * 0.42, Y1 * 0.8, { color: 'good', dy: 14 });
      L('unstable', X1 * 0.42, Y1 * 0.8, { color: 'bad' }); L('spirals', X1 * 0.42, Y1 * 0.8, { color: 'bad', dy: 14 });
      const nx = 0.78, ny = Math.min(Y1 * 0.5, para(X1 * nx) * 0.42);
      L('stable', X0 * nx, ny, { color: 'good' }); L('nodes', X0 * nx, ny, { color: 'good', dy: 14 });
      L('unstable', X1 * nx, ny, { color: 'bad' }); L('nodes', X1 * nx, ny, { color: 'bad', dy: 14 });
      pm.text('centres', 0, Y1 * 0.55, { size: 11.5, weight: 650, color: 'gold', dx: 7, align: 'left' });
      const px = Math.min(X1 * 0.92, 2 * Math.sqrt(Math.max(0, Y1 * 0.92)));
      pm.text('τ² = 4Δ', px, para(px), { size: 11.5, weight: 650, color: 'ink2', dx: -8, dy: -2, align: 'right' });
    }
    for (const p of P.paths || []) {
      const ft = fn(p.tau, ['t', ...keys]), fd = fn(p.Delta, ['t', ...keys]);
      pm.curve((t) => ft({ ...E, t }), (t) => fd({ ...E, t }), ev(p.t[0], E), ev(p.t[1], E), { color: p.color || 'violet', width: 2.2, dash: [6, 4] });
      if (p.label) { const t1 = ev(p.t[1], E); pm.text(p.label, ft({ ...E, t: t1 }), fd({ ...E, t: t1 }), { color: p.color || 'violet', dx: 6, dy: -10, weight: 650 }); }
    }
    for (const p of P.points || []) pm.point(ev(p.tau, E), ev(p.Delta, E), { color: p.color || 'violet', r: 4.5, label: p.label, ldx: p.labelDx, ldy: p.labelDy });
    if (P.marker === false) { /* fixed marks only */ } else if (!(P.drag && !P.matrix) || P.panels === 'portrait') {
      pm.point(pt.tau, pt.Delta, { color: eqColor(type), r: 6, ring: 'ink' });
    } else {
      pm.point(pt.tau, pt.Delta, { color: eqColor(type), r: 5 });
      pm.drawHandles();
    }
  }

  function drawPortrait(A, type, e) {
    pp.clear();
    const [[a, b], [c, d]] = A, f = (x, y) => [a * x + b * y, c * x + d * y];
    const box = [[pp.vx0, pp.vx1], [pp.vy0, pp.vy1]];
    // direction arrows
    const g = pp.ctx, n = 15, pxW = pp.R - pp.L, pxH = pp.B - pp.T, cell = Math.min(pxW, pxH) / n, len = cell * 0.6;
    const nx = Math.round(pxW / cell), ny = Math.round(pxH / cell);
    g.save(); g.strokeStyle = pp.col.ink4; g.fillStyle = pp.col.ink4; g.lineWidth = 1.1;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = pp.vx0 + ((i + 0.5) * (pp.vx1 - pp.vx0)) / nx, y = pp.vy0 + ((j + 0.5) * (pp.vy1 - pp.vy0)) / ny;
      const [u, v] = f(x, y), ex = u * (pxW / (pp.vx1 - pp.vx0)), ey = -v * (pxH / (pp.vy1 - pp.vy0)), el = Math.hypot(ex, ey);
      if (!(el > 0)) continue;
      const ux = ex / el, uy = ey / el, cx = pp.X(x), cy = pp.Y(y), x1 = cx + (ux * len) / 2, y1 = cy + (uy * len) / 2;
      g.beginPath(); g.moveTo(cx - (ux * len) / 2, cy - (uy * len) / 2); g.lineTo(x1 - ux * 3, y1 - uy * 3); g.stroke();
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - ux * 5 - uy * 2.5, y1 - uy * 5 + ux * 2.5); g.lineTo(x1 - ux * 5 + uy * 2.5, y1 - uy * 5 - ux * 2.5); g.closePath(); g.fill();
    }
    g.restore();
    // eigenvector lines
    const R = 4 * P.view;
    if (P.eigen && Array.isArray(e.vectors)) e.vectors.forEach((v, k) => {
      pp.line(-R * v.dir[0], -R * v.dir[1], R * v.dir[0], R * v.dir[1], { color: 'gold', width: 1.8, dash: [8, 6] });
    });
    // a line of equilibria when Δ = 0
    if (type.kind === 'line' || type.kind === 'zero') {
      const r1 = [a, b], r2 = [c, d], row = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2, nn = Math.hypot(...row);
      if (nn > 0) pp.line(R * row[1] / nn, -R * row[0] / nn, -R * row[1] / nn, R * row[0] / nn, { color: eqColor(type), width: 3 });
    }
    // trajectories from a ring of starts, both ways, scaled in time so every type is visible
    const seeds = [];
    for (let k = 0; k < 10; k++) { const th = (2 * Math.PI * (k + 0.25)) / 10; seeds.push([0.55 * P.view * Math.cos(th), 0.55 * P.view * Math.sin(th)]); }
    const size = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 0.2);
    const pal = ['accent2', 'violet', 'teal'];
    seeds.forEach(([x0, y0], k) => {
      const pts = orbit(f, x0, y0, { T: 14 / size, box, dtMax: 0.04 / size }).map((p) => [p.x, p.y]);
      pp.ctx.save(); pp._clip(); pp.path(pts, { color: pal[k % 3], width: 1.8 }); pp.ctx.restore();
      // one arrowhead a little after the start, pointing forward in time
      const i0 = pts.findIndex((p) => p[0] === x0 && p[1] === y0);
      const j = Math.min(pts.length - 1, i0 + 6);
      if (i0 >= 0 && j > i0) pp.arrow(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], { color: pal[k % 3], width: 1.8, head: 9 });
    });
    if (P.eigen && Array.isArray(e.vectors)) e.vectors.forEach((v, k) => {
      const s = 0.82 * P.view, d2 = [v.dir[0] * (v.dir[1] < 0 ? -1 : 1), Math.abs(v.dir[1])];
      const m = Math.max(Math.abs(d2[0]), Math.abs(d2[1]));
      const q = k ? [-d2[0] * s / m, -d2[1] * s / m] : [d2[0] * s / m, d2[1] * s / m];
      pp.text(`λ = ${plain(v.lambda)}`, q[0], q[1], { color: 'gold', weight: 650, size: 12, dx: q[0] > 0 ? -8 : 8, dy: q[1] > 0 ? 12 : -12, align: q[0] > 0 ? 'right' : 'left' });
    });
    if (type.kind !== 'line' && type.kind !== 'zero') {
      const col = pp.color(eqColor(type)), filled = type.stability === 'stable' || type.kind === 'saddle';
      g.save(); g.lineWidth = 2.4; g.strokeStyle = col; g.fillStyle = filled ? col : pp.col.panel;
      g.beginPath(); g.arc(pp.X(0), pp.Y(0), 6, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
    }
  }

  F.draw(draw);
  F.caption(P.caption || (P.matrix
    ? 'Left: the trace–determinant map; the point is the matrix set by the sliders. Right: its phase portrait (arrows show direction only; trajectories traced numerically, time scaled so each type shows clearly).'
    : 'Left: drag the point (τ, Δ). Right: the portrait of x′ = Ax for A = [[0, 1], [−Δ, τ]], the system of x″ − τx′ + Δx = 0 — any matrix with the same τ and Δ has the same type, though its eigenvector lines may point elsewhere. Arrows show direction only.'));
  return { get: (k) => (k === 'point' ? { x: pt.tau, y: pt.Delta } : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
  const tryParse = (src, vars, where) => {
    if (typeof src === 'number' || src === undefined || src === null) return;
    try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`de-tracedet ${where}: “${src}” — ${e.message}`); }
  };
  if (!Number.isFinite(P.tau) || !Number.isFinite(P.Delta)) problems.push('de-tracedet: tau and Delta must be numbers');
  const m = { ...defaults.map, ...(P.map || {}) };
  for (const k of ['tau', 'Delta']) if (!Array.isArray(m[k]) || m[k].length !== 2 || !(m[k][0] < m[k][1])) problems.push(`de-tracedet: map.${k} must be [min, max]`);
  if (!['both', 'map', 'portrait'].includes(P.panels)) problems.push('de-tracedet: panels must be both, map or portrait');
  if (P.matrix) {
    if (!(Array.isArray(P.matrix) && P.matrix.length === 2 && P.matrix.every((r) => Array.isArray(r) && r.length === 2))) problems.push('de-tracedet: matrix must be [[a, b], [c, d]]');
    else for (const r of P.matrix) for (const s of r) tryParse(s, [], 'matrix entry');
  }
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.explain) problems.push(`slider ${s.key} needs an explain line`);
  }
  for (const p of P.points || []) { tryParse(p.tau, [], 'point tau'); tryParse(p.Delta, [], 'point Delta'); }
  for (const p of P.paths || []) { tryParse(p.tau, ['t'], 'path tau'); tryParse(p.Delta, ['t'], 'path Delta'); if (!Array.isArray(p.t)) problems.push('de-tracedet: a path needs t: [from, to]'); }
  for (const o of [...(P.points || []), ...(P.paths || [])]) {
    const L = o && o.label;
    if (typeof L !== 'string') continue;
    const bad = /\$|\\[A-Za-z]|(?<![\w])[A-Za-zα-ωΑ-Ω]{1,2}[_^](?:\{|\(|[A-Za-z0-9α-ωΑ-Ω])|\)[_^]/.exec(L);
    if (bad) problems.push(`de-tracedet label “${L}”: “${bad[0]}” would print literally on the canvas`);
  }
  return problems;
}
