// A region cut into cells: the picture behind Green's theorem, its flux form
// and — on an interval — the fundamental theorem of calculus. Each cell is
// walked anticlockwise, and its circulation ∮F·dr (or its outward flux
// ∮F·n ds) tints it: blue for positive, red for negative, deeper for more per
// unit area. Neighbouring cells walk their shared edge in opposite
// directions, so the interior edges cancel in pairs and the cells add up to
// the boundary alone. Shrink the cells and one cell's circulation per unit
// area approaches the curl at its centre (its flux per area, the
// divergence). In interval mode the "cells" are pieces of [a, b]: each
// contributes f(right end) − f(left end), and the interior ends cancel.
//
//   { type: 'c3-cells', params: {
//       mode: 'circ',                  // 'circ' (circulation, curl) | 'flux' (outward flux, divergence) | 'interval'
//       modes: null,                   // e.g. ['interval', 'circ', 'flux'] → a choice between them
//       P: '-y', Q: 'x', x: [-2.6, 2.6], y: [-1.8, 1.8],    // the field; the window (equal scales)
//       region: { kind: 'rect', x: [-1.5, 1.5], y: [-1, 1] }   // or { kind: 'disk', c: [0, 0], r: 1.5 }
//                                                           //    { kind: 'annulus', c: [0, 0], r: [0.6, 1.8] }
//       n: 3, nSlider: true, nMax: 10, // cells across (a rectangle: n columns; a disk or annulus: n rings × 4n sectors)
//       probe: [0.4, 0.3],             // a draggable point (null: none): its cell is outlined and read out
//       edges: true,                   // little arrows round every cell (shown while there are few cells)
//       arrows: true, density: 13,     // the field's arrows (lengths compressed)
//       f: 'x^3/3 - x', a: -1.5, b: 2, // interval mode: the function and the interval
//       readout: true,                 // false hides every number
//       sliders, choices, constants } }
//
// The cells and their integrals live in model/c3-vector.js.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-vector.js';

export const defaults = {
  mode: 'circ', modes: null, P: '-y', Q: 'x', x: [-2.6, 2.6], y: [-1.8, 1.8],
  region: { kind: 'rect', x: [-1.5, 1.5], y: [-1, 1] }, n: 3, nSlider: true, nMax: 10, probe: [0.4, 0.3],
  edges: true, arrows: true, density: 13, f: 'x^3/3 - x', a: -1.5, b: 2, readout: true,
};

const MODES = ['circ', 'flux', 'interval'];
const NAMES = { circ: 'Circulation (Green)', flux: 'Flux (Green, flux form)', interval: 'Interval (FTC)' };
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
const tx = (v) => (Number.isFinite(v) ? String(+(Math.abs(v) < 5e-10 ? 0 : v).toPrecision(4)) : '\\text{—}');

export function mount(F, P) {
  const keys = keysOf(P), vars = ['x', 'y', ...keys];
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A region cut into cells, each tinted by its circulation or flux' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const modes = (P.modes || []).filter((m) => MODES.includes(m));
  if (modes.length > 1) F.choice({ key: '__mode', label: 'Picture', options: modes.map((m) => [m, NAMES[m]]), value: modes.includes(P.mode) ? P.mode : modes[0], explain: 'The same idea in each: cut into pieces, and the inside boundaries cancel.' });
  else F.params.__mode = MODES.includes(P.mode) ? P.mode : 'circ';
  if (P.nSlider !== false && !F.compact) F.slider({ key: '__n', label: 'Cells across', min: 1, max: P.nMax || 10, step: 1, value: P.n ?? 3, explain: 'Cut finer: the cells always add up to the boundary, and each cell’s value per unit size settles on the derivative at its centre.' });
  else F.params.__n = P.n ?? 3;

  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: true, xlabel: 'x', ylabel: 'y' });
  const probe = P.probe ? { x: P.probe[0], y: P.probe[1] } : null;
  if (probe && !F.compact) { plot.handle(() => [probe.x, probe.y], (x, y) => { probe.x = x; probe.y = y; }, { hollow: true }); plot.onDrag = () => draw(); }

  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  let cache = null;
  F.onChange(() => { cache = null; draw(); });

  function build() {
    const E = env(), mode = F.params.__mode, n = Math.max(1, Math.round(+F.params.__n));
    if (mode === 'interval') {
      const f = fn(P.f, ['x', ...keys]), fx = (x) => f({ ...E, x });
      const a = +P.a, b = +P.b, h = (b - a) / n;
      const cuts = Array.from({ length: n + 1 }, (_, k) => a + k * h);
      return { mode, E, f: fx, a, b, n, cuts, total: fx(b) - fx(a), integral: M.gauss((x) => M.d1(fx, x), a, b, 64) };
    }
    const p = fn(P.P ?? 0, vars), q = fn(P.Q ?? 0, vars);
    const field = (x, y) => [p({ ...E, x, y }), q({ ...E, x, y })];
    const R0 = P.region || defaults.region;
    let R;
    if (R0.kind === 'rect') {
      const w = R0.x[1] - R0.x[0], hgt = R0.y[1] - R0.y[0];
      R = { ...R0, m: n, n: Math.max(1, Math.round((n * hgt) / w)) };
    } else R = { ...R0, m: n, n: 4 * n };
    const { cells, boundary } = M.cellsOf(R);
    const kind = mode === 'flux' ? 'flux' : 'circ';
    for (const c of cells) { c.value = M.loopValue(field, c.edges, kind); c.density = c.value / c.area; }
    const sum = cells.reduce((s, c) => s + c.value, 0);
    const edge = M.loopValue(field, [...boundary.outer, ...boundary.inner], kind, 64);
    const g = kind === 'flux' ? (x, y) => M.div2(field, x, y) : (x, y) => M.curl2(field, x, y);
    const dbl = M.regionIntegral(g, R0.kind === 'rect' ? { ...R0, m: 6, n: 6 } : { ...R0, m: 6, n: 24 });
    const maxD = Math.max(1e-9, ...cells.map((c) => Math.abs(c.density)).filter(Number.isFinite));
    return { mode, kind, E, field, R, cells, boundary, sum, edge, dbl, maxD, g };
  }

  // a cell's outline as a polygon (arcs sampled)
  const outline = (c) => c.edges.flatMap((e) => Array.from({ length: 12 }, (_, k) => [e.X(k / 12), e.Y(k / 12)]));
  const inside = (c, x, y) => {
    if (c.box) { const [a, b, cc, d] = c.box; return x >= a && x <= b && y >= cc && y <= d; }
    const [ra, rb, a0, a1] = c.polar, [cx, cy] = cache.R.c || [0, 0];
    const r = Math.hypot(x - cx, y - cy);
    let th = Math.atan2(y - cy, x - cx); if (th < 0) th += 2 * Math.PI;
    return r >= ra && r <= rb && th >= a0 && th <= a1;
  };

  function draw() {
    if (!cache) cache = build();
    const C = cache;
    if (C.mode === 'interval') return drawInterval(C);
    plot.o.equal = true;
    plot.setView(P.x, P.y);
    plot.clear();
    // the field, faint
    if (P.arrows !== false) {
      const nA = P.density || 13, dx = (plot.vx1 - plot.vx0) / nA, grid = [];
      let maxM = 1e-12;
      for (let x = plot.vx0 + dx / 2; x < plot.vx1; x += dx) for (let y = plot.vy0 + dx / 2; y < plot.vy1; y += dx) {
        const [u, v] = C.field(x, y), m = Math.hypot(u, v);
        if (Number.isFinite(m)) { grid.push([x, y, u, v, m]); maxM = Math.max(maxM, m); }
      }
      for (const [x, y, u, v, m] of grid) {
        if (m < 1e-12) continue;
        const s = (dx * 0.8 * (0.35 + 0.65 * Math.min(1, m / maxM))) / m;
        plot.arrow(x - (u * s) / 2, y - (v * s) / 2, x + (u * s) / 2, y + (v * s) / 2, { color: 'ink4', width: 1.1, head: 5 });
      }
    }
    // the cells, tinted by value per unit area
    for (const c of C.cells) {
      const t = Number.isFinite(c.density) ? c.density / C.maxD : 0;
      plot.path(outline(c), { close: true, fill: t >= 0 ? 'accent' : 'bad', fillAlpha: 0.06 + 0.5 * Math.abs(t), color: 'ink3', width: 1, alpha: 0.8 });
    }
    // arrows round each cell's edges, nudged inside it, so a shared edge carries two opposite arrows
    const few = C.cells.length <= 40;
    if (P.edges !== false && few) {
      for (const c of C.cells) {
        const [cx, cy] = c.mid || c.centre;
        for (const e of c.edges) {
          const a = [e.X(0.38), e.Y(0.38)], b = [e.X(0.62), e.Y(0.62)];
          const k = 0.16, pull = (p) => [p[0] + (cx - p[0]) * k, p[1] + (cy - p[1]) * k];
          const [p0, p1] = [pull(a), pull(b)];
          if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 1e-6) plot.arrow(p0[0], p0[1], p1[0], p1[1], { color: 'ink2', width: 1.3, head: 7 });
        }
        if (Math.abs(c.density) / C.maxD > 0.08) {
          const glyph = C.kind === 'flux' ? (c.value > 0 ? '+' : '−') : c.value > 0 ? '↺' : '↻';
          plot.text(glyph, c.mid?.[0] ?? cx, c.mid?.[1] ?? cy, { color: c.value > 0 ? 'accent' : 'bad', size: 15, weight: 700, align: 'center' });
        }
      }
    }
    // the boundary, walked with the region on its left
    for (const e of [...C.boundary.outer, ...C.boundary.inner]) {
      const pts = Array.from({ length: 121 }, (_, k) => [e.X(k / 120), e.Y(k / 120)]);
      plot.path(pts, { color: 'gold', width: 2.6 });
      const marks = C.R.kind === 'rect' ? [0.55] : [0.13, 0.38, 0.63, 0.88];
      for (const f of marks) plot.arrow(e.X(f - 0.03), e.Y(f - 0.03), e.X(f), e.Y(f), { color: 'gold', width: 2.6, head: 10 });
    }
    // the probe's cell
    const rows = [];
    let pc = null;
    if (probe) {
      pc = C.cells.find((c) => inside(c, probe.x, probe.y)) || null;
      if (pc) plot.path(outline(pc), { close: true, color: 'ink', width: 2.6 });
      plot.drawHandles();
    }
    if (P.readout === false) { F.readout([]); return; }
    const flux = C.kind === 'flux';
    rows.push(['sum over the cells', tx(C.sum)]);
    rows.push([flux ? 'out through the boundary $\\oint \\vec F\\cdot\\hat n\\,ds$' : 'round the boundary $\\oint \\vec F\\cdot d\\vec r$', tx(C.edge)]);
    rows.push([flux ? '$\\iint_D (P_x + Q_y)\\,dA$' : '$\\iint_D (Q_x - P_y)\\,dA$', tx(C.dbl)]);
    if (pc) {
      rows.push([flux ? 'probe’s cell: flux ÷ area' : 'probe’s cell: circulation ÷ area', tx(pc.density)]);
      rows.push([flux ? 'divergence at its centre' : 'curl at its centre', tx(C.g(...pc.centre))]);
    }
    F.readout(rows);
  }

  function drawInterval(C) {
    const { f, a, b, cuts } = C;
    // the graph of f, the pieces, and each piece's rise
    const ys = Array.from({ length: 101 }, (_, k) => f(a + ((b - a) * k) / 100)).filter(Number.isFinite);
    const lo = Math.min(0, ...ys), hi = Math.max(0, ...ys), pad = 0.18 * (hi - lo || 1), span = b - a;
    plot.o.equal = false;
    plot.setView([a - 0.12 * span, b + 0.12 * span], [lo - 2 * pad, hi + pad]);
    plot.clear();
    plot.fn(f, { color: 'accent', width: 2.4, domain: [a - 0.1 * span, b + 0.1 * span] });
    const base = lo - 1.2 * pad;      // the row of + and − signs, below the graph
    plot.line(a, base, b, base, { color: 'ink3', width: 1.4 });
    for (let k = 0; k < cuts.length - 1; k++) {
      const x0 = cuts[k], x1 = cuts[k + 1], y0 = f(x0), y1 = f(x1);
      plot.line(x0, y0, x1, y0, { color: 'ink3', width: 1.2, dash: [4, 4] });
      plot.arrow(x1, y0, x1, y1, { color: y1 >= y0 ? 'gold' : 'bad', width: 2.4, head: Math.min(9, 4 + Math.abs(plot.Y(y1) - plot.Y(y0)) / 4) });
    }
    cuts.forEach((x, k) => {
      plot.point(x, f(x), { color: 'ink', r: 3.2 });
      plot.line(x, base - 0.04 * (hi - lo + 1e-9), x, base + 0.04 * (hi - lo + 1e-9), { color: 'ink3', width: 1.2 });
      const end = k === 0 || k === cuts.length - 1;
      if (k > 0) plot.text('+', x, base, { dx: -9, dy: -11, color: end ? 'gold' : 'ink3', size: 14, weight: 700, align: 'center' });
      if (k < cuts.length - 1) plot.text('−', x, base, { dx: 9, dy: -11, color: end ? 'gold' : 'ink3', size: 14, weight: 700, align: 'center' });
    });
    plot.text('a', a, base, { dy: 13, color: 'ink2', align: 'center' });
    plot.text('b', b, base, { dy: 13, color: 'ink2', align: 'center' });
    if (P.readout === false) { F.readout([]); return; }
    const rises = cuts.slice(1).reduce((s, x, k) => s + (f(x) - f(cuts[k])), 0);
    F.readout([['sum of the rises', tx(rises)], ['$f(b) - f(a)$', tx(C.total)], ['$\\int_a^b f\'(x)\\,dx$', tx(C.integral)]]);
  }

  F.draw(draw);
  F.caption(P.caption || 'Each cell is walked anticlockwise; its tint is its circulation (or outward flux) per unit area, blue positive and red negative. Field arrows show direction only. Integrals are computed numerically.');
  return { get: (k) => (k === 'point' && probe ? { x: probe.x, y: probe.y } : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const keys = keysOf(P);
  const tryParse = (src, vars, where) => { if (src === undefined || src === null || typeof src === 'number') return; try { fn(src, [...vars, ...keys]); } catch (e) { out.push(`c3-cells ${where}: “${src}” — ${e.message}`); } };
  const modes = P.modes || [P.mode];
  for (const m of modes) if (!MODES.includes(m)) out.push(`c3-cells mode “${m}” is not one of ${MODES.join(', ')}`);
  if (modes.some((m) => m !== 'interval')) {
    tryParse(P.P, ['x', 'y'], 'P'); tryParse(P.Q, ['x', 'y'], 'Q');
    const R = P.region || {};
    if (R.kind === 'rect') { if (!(R.x?.[0] < R.x?.[1] && R.y?.[0] < R.y?.[1])) out.push('c3-cells rect region needs x: [lo, hi] and y: [lo, hi]'); }
    else if (R.kind === 'disk') { if (!(R.r > 0)) out.push('c3-cells disk region needs r > 0'); }
    else if (R.kind === 'annulus') { if (!(Array.isArray(R.r) && R.r[0] > 0 && R.r[0] < R.r[1])) out.push('c3-cells annulus region needs r: [inner, outer] with 0 < inner < outer'); }
    else out.push(`c3-cells region kind “${R.kind}” must be rect, disk or annulus`);
  }
  if (modes.includes('interval')) { tryParse(P.f, ['x'], 'f'); if (!(+P.a < +P.b)) out.push('c3-cells interval mode needs a < b'); }
  if (!(Number.isInteger(P.n) && P.n >= 1 && P.n <= (P.nMax || 10))) out.push('c3-cells n must be a whole number from 1 to nMax');
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
  return out;
}
