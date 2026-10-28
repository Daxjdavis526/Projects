// A double integral as a sum of boxes. The rectangle [a, b] × [c, d] on the
// floor is cut into m × n cells; on each stands a box whose height is f at
// the cell's sample point, so its volume is f(x*, y*) ΔA. The boxes approach
// the solid under the graph as the cells shrink, and their total — the
// Riemann sum — approaches ∬ f dA. Boxes below the floor (f < 0) are red:
// they count negatively. Optional: the graph itself, translucent; only the
// cells inside a region D (f taken as 0 elsewhere); and a slice at x = x₀,
// whose area A(x₀) = ∫ f(x₀, y) dy is the inner integral of Fubini's theorem.
//
//   { type: 'c3-boxes', params: {
//       f: '4 - x^2/2 - y^2/4', x: [0, 2], y: [0, 3],   // the integrand and the rectangle
//       m: 4, n: 4, cellSliders: true, maxCells: 16,      // cells in x and in y; sliders for them
//       rule: 'mid', rules: ['mid', 'll', 'ur'],          // sample point: centre, lower-left or upper-right corner;
//                                                         //   two or more rules → a choice
//       inside: 'step(x - y)',                            // optional: nonzero inside a region D of the rectangle
//       outline: [{ param: ['t', 't'], t: [0, 2] }],      // curves drawn on the floor (D's boundary)
//       surface: true, samples: false,                    // the translucent graph of f; the sample points on the floor
//       slice: false,                                     // true: a toggle and a slider for a slice at x = x₀
//       sliceOn: false, sliceAt: 1,                       //   (shown at first; where it starts) — the boxes fade while it shows
//       exact: 15.5,                                      // the integral, if you know it (else computed numerically)
//       readout: true,                                    // false hides every number (for a question's picture)
//       sliders, choices, constants,                      // for f
//       zscale: 1, yaw, pitch, dist, target, axisLabels } }
//
// The sums and integrals live in model/c3-integrals.js. Heights are drawn
// times zscale; the readouts are in f's own units.

import { View3D } from '../three-d.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-integrals.js';

export const defaults = {
  f: '4 - x^2/2 - y^2/4', x: [0, 2], y: [0, 3], m: 4, n: 4, cellSliders: true, maxCells: 16, rule: 'mid', rules: null,
  inside: null, outline: [], surface: true, samples: false, slice: false, sliceOn: false, sliceAt: null, exact: null, readout: true, zscale: 1,
};

const RULES = { mid: 'Centre', ll: 'Lower-left corner', ur: 'Upper-right corner' };
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'Boxes standing on a grid of cells under a surface: a Riemann sum for a double integral — drag to turn it' });
  const [[x0, x1], [y0, y1]] = [P.x, P.y];
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const keys = keysOf(P);
  if (P.cellSliders !== false) {
    const top = P.maxCells || 16;
    F.slider({ key: '__m', label: 'Cells along $x$, $m$', min: 1, max: top, step: 1, value: P.m, explain: 'The rectangle is cut into $m$ strips across $x$ …' });
    F.slider({ key: '__n', label: 'Cells along $y$, $n$', min: 1, max: top, step: 1, value: P.n, explain: '… and $n$ across $y$: $mn$ boxes, each on a cell of area $\\Delta A = \\Delta x\\,\\Delta y$.' });
  }
  const rules = (P.rules || []).filter((r) => RULES[r]);
  if (rules.length > 1) F.choice({ key: '__rule', label: 'Sample point', options: rules.map((r) => [r, RULES[r]]), value: rules.includes(P.rule) ? P.rule : rules[0], explain: 'Where in each cell $f$ is evaluated to set the height of its box.' });
  if (P.slice) {
    F.toggle({ key: '__slice', label: 'Show the slice at $x_0$', value: !!P.sliceOn, explain: 'The cut through the solid by the plane $x = x_0$ (the boxes fade so it shows). Its area is the inner integral $A(x_0) = \\int f(x_0, y)\\,dy$.' });
    F.slider({ key: '__s', label: 'Slice at $x_0$', min: x0, max: x1, step: (x1 - x0) / 100, value: P.sliceAt ?? (x0 + x1) / 2, explain: 'Where the plane $x = x_0$ cuts the solid.' });
  }
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const F2 = fn(P.f, ['x', 'y', ...keys]), IN = P.inside ? fn(P.inside, ['x', 'y', ...keys]) : null;

  const zs = P.zscale ?? 1;
  // frame the scene from the function's own heights at the starting values
  const E0 = env();
  let zlo = 0, zhi = 0;
  for (let i = 0; i <= 12; i++) for (let j = 0; j <= 12; j++) {
    const z = F2({ ...E0, x: x0 + ((x1 - x0) * i) / 12, y: y0 + ((y1 - y0) * j) / 12 }) * zs;
    if (Number.isFinite(z)) { zlo = Math.min(zlo, z); zhi = Math.max(zhi, z); }
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, size = Math.hypot(x1 - x0, y1 - y0, zhi - zlo);
  const view = new View3D(canvas, { yaw: P.yaw ?? 0.6, pitch: P.pitch ?? 0.42, dist: P.dist ?? 1.55 * size + 1.2, target: P.target || [cx, cy, (zlo + zhi) / 2.3] });
  view.onChange = () => draw();
  F.onChange(() => draw());

  function draw() {
    view.begin();
    const E = env();
    const f = (x, y) => F2({ ...E, x, y });
    const inside = IN ? (x, y) => !!IN({ ...E, x, y }) : null;
    const m = P.cellSliders !== false ? F.params.__m : P.m, n = P.cellSliders !== false ? F.params.__n : P.n;
    const rule = rules.length > 1 ? F.params.__rule : P.rule;
    const { list, sum, dx, dy } = M.boxes(f, [x0, x1], [y0, y1], m, n, rule, inside);

    // axes, floor rectangle and the cell lines
    if (P.axes !== false) view.axes(P.axisLen ?? Math.max(x1, y1, zhi, 1) * 1.15, P.axisLabels || ['x', 'y', 'z']);
    view.line([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0], [x0, y0, 0]], { color: 'ink3', width: 1.4, bias: 0 });
    for (let i = 1; i < m; i++) view.line([[x0 + i * dx, y0, 0], [x0 + i * dx, y1, 0]], { color: 'ink4', width: 0.8, bias: 0 });
    for (let j = 1; j < n; j++) view.line([[x0, y0 + j * dy, 0], [x1, y0 + j * dy, 0]], { color: 'ink4', width: 0.8, bias: 0 });
    for (const c of P.outline || []) {
      const X = fn(c.param[0], ['t', ...keys]), Y = fn(c.param[1], ['t', ...keys]);
      const pts = Array.from({ length: 121 }, (_, k) => { const t = c.t[0] + ((c.t[1] - c.t[0]) * k) / 120; return [X({ ...E, t }), Y({ ...E, t }), 0]; });
      view.line(pts, { color: c.color || 'accent2', width: c.width || 2.2, bias: 0.01 });
    }

    // the boxes: a top on each cell, and each wall once — between two neighbours
    // it runs from one's height to the other's (outside cells count as 0)
    const H = (i, j) => (i < 0 || j < 0 || i >= m || j >= n ? 0 : list[i * n + j].h);
    const colour = (h) => (h >= 0 ? 'accent' : 'bad');
    const sliced = P.slice && F.params.__slice, fade = sliced ? 0.32 : 1;
    const quad = (a, b, c, d, color, alpha) => view.surface([[a, d], [b, c]], { color, alpha, wire: false });
    const wall = (p, q, h1, h2) => {
      if (Math.abs(h1 - h2) < 1e-12) return;
      const lo = Math.min(h1, h2), hi = Math.max(h1, h2);
      // split at the floor so each part takes its own colour
      for (const [s0, s1] of lo < 0 && hi > 0 ? [[lo, 0], [0, hi]] : [[lo, hi]]) {
        quad([...p, s0 * zs], [...q, s0 * zs], [...q, s1 * zs], [...p, s1 * zs], colour((s0 + s1) / 2), 0.78 * fade);
      }
    };
    for (let i = 0; i <= m; i++) for (let j = 0; j < n; j++) wall([x0 + i * dx, y0 + j * dy], [x0 + i * dx, y0 + (j + 1) * dy], H(i - 1, j), H(i, j));
    for (let i = 0; i < m; i++) for (let j = 0; j <= n; j++) wall([x0 + i * dx, y0 + j * dy], [x0 + (i + 1) * dx, y0 + j * dy], H(i, j - 1), H(i, j));
    for (const b of list) {
      if (!b.inD || Math.abs(b.h) < 1e-12) continue;
      const z = b.h * zs;
      quad([b.x0, b.y0, z], [b.x1, b.y0, z], [b.x1, b.y1, z], [b.x0, b.y1, z], colour(b.h), 0.88 * fade);
      view.line([[b.x0, b.y0, z], [b.x1, b.y0, z], [b.x1, b.y1, z], [b.x0, b.y1, z], [b.x0, b.y0, z]], { color: 'ink4', width: 0.8, bias: 0.01 });
    }
    // sample points: on the floor (faint) and on the graph, at the top of each box
    if (P.samples) for (const b of list) if (b.inD) { view.line([[b.sx, b.sy, 0], [b.sx, b.sy, b.h * zs]], { color: 'gold', width: 1, dash: [3, 3], bias: 0.05 }); view.point([b.sx, b.sy, b.h * zs], { color: 'gold', r: 4, bias: 0.08 }); }

    // the graph of f, translucent, over the rectangle (or over D)
    if (P.surface !== false) {
      const N = 30;
      const grid = Array.from({ length: N + 1 }, (_, i) => Array.from({ length: N + 1 }, (_, j) => {
        const x = x0 + ((x1 - x0) * i) / N, y = y0 + ((y1 - y0) * j) / N;
        if (inside && !inside(x, y)) return [NaN, NaN, NaN];
        const z = f(x, y);
        return Number.isFinite(z) ? [x, y, z * zs] : [NaN, NaN, NaN];
      }));
      view.surface(grid, { color: 'gold', alpha: sliced ? 0.18 : 0.3, wire: true, wireAlpha: 0.05 });
    }

    // the slice x = x₀: the cross-section whose area is the inner integral
    let A = null;
    if (sliced) {
      const a = F.params.__s, k = 60;
      const ys = Array.from({ length: k + 1 }, (_, j) => y0 + ((y1 - y0) * j) / k);
      const top = ys.map((y) => [a, y, (Number.isFinite(f(a, y)) ? f(a, y) : 0) * zs]);
      view.surface([ys.map((y) => [a, y, 0]), top], { color: 'violet', alpha: 0.8, wire: false });
      view.line(top, { color: 'violet', width: 2.6, bias: 0.03 });
      view.line([[a, y0, 0], [a, y1, 0]], { color: 'violet', width: 1.6, bias: 0.02 });
      A = M.sliceArea(f, a, [y0, y1]);
    }
    view.end();

    if (P.readout === false) { F.readout([]); return; }
    const exact = typeof P.exact === 'number' ? P.exact : M.rectIntegral(f, [x0, x1], [y0, y1], inside);
    const rows = [[`Riemann sum, ${m * n} box${m * n === 1 ? '' : 'es'}`, tx(sum)], [inside ? '$\\iint_D f\\,dA$' : '$\\iint_R f\\,dA$', `${inside && typeof P.exact !== 'number' ? '\\approx ' : ''}${tx(exact)}`]];
    if (A !== null) rows.push(['slice area $A(x_0)$', tx(A)]);
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'Drag to rotate; scroll or pinch to zoom. Blue boxes stand above the floor, red ones hang below it and count negatively; the gold sheet is the graph of f.');
}

const tx = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '\\text{—}');

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const keys = keysOf(P);
  const tryF = (src, vars, where) => { if (typeof src === 'number' || src == null) return; try { fn(src, [...vars, ...keys]); } catch (e) { out.push(`c3-boxes ${where}: “${src}” — ${e.message}`); } };
  if (!P.f) out.push('c3-boxes needs f');
  tryF(P.f, ['x', 'y'], 'f');
  tryF(P.inside, ['x', 'y'], 'inside');
  for (const k of ['x', 'y']) if (!(Array.isArray(P[k]) && P[k].length === 2 && P[k].every(Number.isFinite) && P[k][0] < P[k][1])) out.push(`c3-boxes ${k} must be [lo, hi] numbers`);
  for (const k of ['m', 'n']) if (!(Number.isInteger(P[k]) && P[k] >= 1 && P[k] <= (P.maxCells || 16))) out.push(`c3-boxes ${k} must be a whole number from 1 to maxCells`);
  if (P.rule && !RULES[P.rule]) out.push(`c3-boxes rule must be one of ${Object.keys(RULES).join(', ')}`);
  for (const r of P.rules || []) if (!RULES[r]) out.push(`c3-boxes rules: unknown rule ${r}`);
  for (const c of P.outline || []) { if (!Array.isArray(c.param) || c.param.length !== 2 || !Array.isArray(c.t)) out.push('c3-boxes outline needs param: [x(t), y(t)] and t: [a, b]'); else c.param.forEach((s) => tryF(s, ['t'], 'outline')); }
  for (const s of P.sliders || []) { if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`); if (!s.label) out.push(`slider ${s.key} needs a label`); }
  if (P.sliceAt != null && !(P.sliceAt >= P.x[0] && P.sliceAt <= P.x[1])) out.push('c3-boxes sliceAt must lie in the x range');
  return out;
}
