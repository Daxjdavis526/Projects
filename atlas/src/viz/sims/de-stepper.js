// Numerical methods for y′ = f(t, y), taken apart. The Whole-run view draws
// the true solution and the polygon a method builds with step h (Euler,
// improved Euler, midpoint or RK4), with its error at the end. The One-step
// view zooms in on a single step and draws every stage: the point where each
// slope k₁ … k₄ is evaluated, a short segment of that slope, the trial lines
// that lead to the stages, the dashed exact solution through the step's
// start (the curve the step is trying to follow), the weighted step itself
// in gold, and its local error. A log–log panel shows each method's global
// error at the end against h: straight lines of slope 1, 2 and 4 — the
// methods' orders. Numerics in model/de-ode.js (test/de-ode.test.mjs).
//
//   { type: 'de-stepper', params: {
//       f: '-2*y + t',                 // y′ = f(t, y): an expression of t, y and the slider keys
//       exact: 't/2 - 1/4 + 1.25*exp(-2t)',   // the exact solution through (t0, y0) (else a fine RK4 reference)
//       t0: 0, y0: 1, T: 2,            // the start and the end of the run
//       hs: [0.5, 0.25, 0.125],        // the step sizes offered (each half the last, for halving experiments)
//       h: 0.5,                        // the starting step size (one of hs)
//       methods: ['euler', 'heun', 'rk4'], method: 'euler',   // those offered (euler heun midpoint rk4), the starting one
//       views: ['run', 'stage'], view: 'run',                 // those offered, the starting one
//       step: 0,                       // One-step view: which step (a slider picks another)
//       compare: false,                // Whole run: draw every offered method, not only the chosen one
//       errorPlot: null,               // the log–log error panel: by default in the Explore view, not in a problem's picture
//       x, y,                          // the Whole-run window (default: fitted)
//       xlabel: 't', ylabel: 'y',      // axis titles (plain text)
//       readout: true,                 // false hides the numbers (for questions)
//       sliders, constants } }

import { Plot, pow10Label } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { METHODS, METHOD_NAMES, ORDER, stages, solve, errorTable, reference, observedOrder } from '../model/de-ode.js';

export const defaults = {
  f: '-2*y + t', exact: 't/2 - 1/4 + 1.25*exp(-2t)', t0: 0, y0: 1, T: 2, hs: [0.5, 0.25, 0.125], h: null,
  methods: ['euler', 'heun', 'rk4'], method: null, views: ['run', 'stage'], view: null, step: 0,
  compare: false, errorPlot: null, xlabel: 't', ylabel: 'y', readout: true,
};

const COLOR = { euler: 'warn', heun: 'violet', midpoint: 'teal', rk4: 'good' };
const STAGE_COLOR = ['violet', 'teal', 'good', 'accent2'];
const SUB = ['₁', '₂', '₃', '₄'];
const VIEW_NAMES = { run: 'Whole run', stage: 'One step' };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const methods = (P.methods || METHODS).filter((m) => METHODS.includes(m));
  const views = (P.views || ['run']).filter((v) => v === 'run' || v === 'stage');
  const hs = P.hs.slice().sort((a, b) => b - a);
  const { canvas } = F.canvas({ aspect: P.aspect ?? 'wide', label: P.alt || 'A numerical solution built step by step, with the exact solution for comparison' });
  const showErr = (P.errorPlot ?? !F.compact) && P.readout !== false;
  let eplot = null;
  if (showErr) {
    const { canvas: c2 } = F.canvas({ aspect: 'wide', label: 'The error at the end of the run against the step size, both on logarithmic scales' });
    eplot = new Plot(c2, { xlabel: 'step size h (log scale)', ylabel: '|error at end| (log scale)', xfmt: pow10Label, yfmt: pow10Label, axesAt: 'edge', pad: { l: 52, r: 20, t: 14, b: 34 } });
  }
  const plot = new Plot(canvas, { x: P.x || [P.t0, P.T], y: P.y || [0, 1], xlabel: P.xlabel, ylabel: P.ylabel });
  for (const s of P.sliders || []) F.slider(s);
  if (methods.length > 1) F.choice({ key: 'method', label: 'Method', options: methods.map((m) => [m, METHOD_NAMES[m]]), value: methods.includes(P.method) ? P.method : methods[0] });
  if (hs.length > 1) F.choice({ key: 'h', label: 'Step size $h$', options: hs.map((h) => [h, String(h)]), value: hs.includes(P.h) ? P.h : hs[0] });
  if (views.length > 1) F.choice({ key: 'view', label: 'View', options: views.map((v) => [v, VIEW_NAMES[v]]), value: views.includes(P.view) ? P.view : views[0] });
  const nMax = Math.max(1, Math.round((P.T - P.t0) / hs[hs.length - 1]));
  if (views.includes('stage') && nMax > 1) F.slider({ key: 'k', label: 'Step to take apart', min: 0, max: nMax - 1, step: 1, value: Math.min(P.step || 0, nMax - 1), explain: 'Used by the One-step view: step 0 starts at the initial point (it stops at the last step for the chosen $h$).' });
  const keys = [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = F.params[k]; return e; };
  const method = () => (methods.includes(F.params.method) ? F.params.method : methods.includes(P.method) ? P.method : methods[0]);
  const hNow = () => +(F.params.h ?? (hs.includes(P.h) ? P.h : hs[0]));
  const view = () => F.params.view ?? (views.includes(P.view) ? P.view : views[0]);
  F.onChange(() => draw());

  function draw() {
    const E = env();
    const fc = fn(P.f, ['t', 'y', ...keys]);
    const f = (t, y) => fc({ ...E, t, y });
    const ex = P.exact ? fn(P.exact, ['t', ...keys]) : null;
    const Y = ex ? (t) => ex({ ...E, t }) : null;
    const exactEnd = Y ? Y(P.T) : reference(f, P.t0, P.y0, P.T);
    const m = method(), h = hNow(), n = Math.max(1, Math.round((P.T - P.t0) / h));
    const run = solve(m, f, P.t0, P.y0, h, n);
    // the true solution as a polyline (exact if given, else fine RK4 steps)
    const truth = Y ? null : solve('rk4', f, P.t0, P.y0, (P.T - P.t0) / 600, 600);
    if (view() === 'stage') drawStage(f, Y, truth, run, m, h, n);
    else drawRun(f, Y, truth, run, m, h, n, exactEnd);
    if (eplot) drawErrors(f, exactEnd, m, h);
  }

  function trueCurve(Y, truth, o) {
    if (Y) plot.fn(Y, { domain: [P.t0, P.T], ...o });
    else plot.path(truth, o);
  }

  function drawRun(f, Y, truth, run, m, h, n, exactEnd) {
    const others = P.compare ? methods.filter((q) => q !== m) : [];
    const runs = others.map((q) => [q, solve(q, f, P.t0, P.y0, h, n)]);
    if (!P.x || !P.y) {
      const ys = [...run, ...runs.flatMap((r) => r[1])].map((p) => p[1]);
      const tv = Y ? Array.from({ length: 101 }, (_, i) => Y(P.t0 + ((P.T - P.t0) * i) / 100)) : truth.map((p) => p[1]);
      const all = [...ys, ...tv].filter(Number.isFinite);
      const lo = Math.min(...all), hi = Math.max(...all), pad = 0.08 * (hi - lo || 1);
      plot.setView(P.x || [P.t0, P.T + 0.02 * (P.T - P.t0)], P.y || [lo - pad, hi + pad]);
    }
    plot.clear();
    trueCurve(Y, truth, { color: 'accent', width: 2.6 });
    for (const [q, pts] of runs) { plot.path(pts, { color: COLOR[q], width: 1.6, alpha: 0.75 }); for (const [a, b] of pts) plot.point(a, b, { color: COLOR[q], r: 2.4 }); }
    plot.path(run, { color: COLOR[m], width: 2.2 });
    for (const [a, b] of run) plot.point(a, b, { color: COLOR[m], r: n <= 40 ? 3.4 : 2.2 });
    const last = run[run.length - 1];
    plot.text(METHOD_NAMES[m], last[0], last[1], { color: COLOR[m], dx: -8, dy: last[1] > exactEnd ? -14 : 14, align: 'right', weight: 650 });
    if (P.readout !== false) {
      const err = last[1] - exactEnd;
      const half = solve(m, f, P.t0, P.y0, h / 2, 2 * n), err2 = half[half.length - 1][1] - exactEnd;
      const tiny = 1e-13 * Math.max(1, Math.abs(exactEnd));
      F.readout([
        [`${METHOD_NAMES[m]}, $${n}$ steps: $y_{${n}}$`, num(last[1])],
        [`exact $y(${num(P.T, 4)})$`, num(exactEnd)],
        ['error', num(err, 3)],
        ['error with $h/2$', num(err2, 3)],
        ['observed order $\\log_2(E_h/E_{h/2})$', Math.abs(err2) > tiny && Math.abs(err) > tiny ? num(observedOrder(err, err2), 3) : '\\text{—}'],
      ]);
    }
  }

  function drawStage(f, Y, truth, run, m, h, n) {
    const k = Math.min(n - 1, Math.max(0, Math.round(F.params.k ?? P.step ?? 0)));
    const [tk, yk] = run[k];
    const S = stages(m, f, tk, yk, h);
    // the exact solution through (t_k, y_k): what this one step is trying to follow
    const local = solve('rk4', f, tk, yk, h / 200, 240);       // a little past t_k + h
    const yLocal = local[200][1];
    const ys = [yk, S.y1, yLocal, ...S.stages.map((s) => s.y), ...local.map((p) => p[1])];
    const lo = Math.min(...ys), hi = Math.max(...ys), pad = 0.22 * (hi - lo || Math.abs(yk) || 1);
    plot.setView([tk - 0.2 * h, tk + 1.35 * h], [lo - pad, hi + pad]);
    plot.clear();
    plot.path(local, { color: 'accent', width: 2, dash: [7, 5] });
    const seg = 0.22 * h;
    // trial lines: from the start of the step, along a slope, to the next stage point
    S.stages.forEach((s, i) => { if (i > 0) plot.line(tk, yk, s.t, s.y, { color: STAGE_COLOR[i], width: 1.2, dash: [3, 4] }); });
    S.stages.forEach((s, i) => {
      plot.line(s.t - seg, s.y - seg * s.k, s.t + seg, s.y + seg * s.k, { color: STAGE_COLOR[i], width: 3 });
      plot.point(s.t, s.y, { color: 'panel', r: 5, ring: STAGE_COLOR[i] });
      const label = S.stages.length > 1 ? `k${SUB[i]}` : 'slope k₁';
      plot.text(label, s.t + seg, s.y + seg * s.k, { color: STAGE_COLOR[i], dx: 6, dy: 0, weight: 700 });
    });
    plot.arrow(tk, yk, tk + h, S.y1, { color: 'gold', width: 2.6, head: 11 });
    plot.point(tk, yk, { color: 'ink', r: 4.5 });
    plot.point(tk + h, yLocal, { color: 'ink2', r: 3.5 });
    plot.line(tk + h, yLocal, tk + h, S.y1, { color: 'bad', width: 2 });
    plot.text('local error', tk + h, (yLocal + S.y1) / 2, { color: 'bad', dx: 8, dy: 0, size: 11.5 });
    if (P.readout !== false) {
      const rows = S.stages.map((s, i) => [`$k_{${i + 1}}$ at $(${num(s.t, 4)},\\ ${num(s.y, 4)})$`, num(s.k, 5)]);
      rows.push([m === 'rk4' ? 'step slope $\\tfrac16(k_1 + 2k_2 + 2k_3 + k_4)$' : m === 'heun' ? 'step slope $\\tfrac12(k_1 + k_2)$' : 'step slope', num(S.slope, 5)]);
      rows.push([`$y_{${k + 1}}$`, num(S.y1, 6)], ['local error', num(S.y1 - yLocal, 3)]);
      F.readout(rows);
    }
  }

  function drawErrors(f, exactEnd, m, h) {
    const H = hs[0], n0 = Math.max(1, Math.round((P.T - P.t0) / H));
    const floor = 1e-13 * Math.max(1, Math.abs(exactEnd));
    let ymin = Infinity, ymax = -Infinity;
    const series = methods.map((q) => {
      const pts = errorTable(q, f, P.t0, P.y0, P.T, exactEnd, { n0, levels: 9 })
        .filter((r) => Math.abs(r.error) > floor).map((r) => [Math.log10(r.h), Math.log10(Math.abs(r.error))]);
      for (const [, y] of pts) { ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
      return [q, pts];
    });
    if (!Number.isFinite(ymin)) { ymin = -13; ymax = 0; }
    const x1 = Math.log10(H), x0 = Math.log10((P.T - P.t0) / (n0 * 256));
    eplot.setView([x0 - 0.1, x1 + 0.1], [Math.floor(ymin) - 0.3, Math.ceil(ymax) + 0.3]);
    eplot.clear();
    series.forEach(([q, pts], i) => {
      const on = q === m;
      if (pts.length) {
        eplot.path(pts, { color: COLOR[q], width: on ? 2.6 : 1.5, alpha: on ? 1 : 0.6 });
        for (const [x, y] of pts) eplot.point(x, y, { color: COLOR[q], r: on ? 2.8 : 2 });
      }
      // a legend in the top-left corner, where small steps never have large errors
      eplot.text(`${METHOD_NAMES[q]}: order ${ORDER[q]}`, eplot.L + 10, eplot.T + 10 + 16 * i, { screen: true, color: COLOR[q], weight: on ? 700 : 500, size: 11.5 });
    });
    const cur = series.find(([q]) => q === m)?.[1].find(([x]) => Math.abs(x - Math.log10(h)) < 0.03 * Math.abs(x1 - x0) + 1e-9);
    if (cur) eplot.point(cur[0], cur[1], { color: 'gold', r: 6, ring: 'ink' });
  }

  F.draw(draw);
  F.caption(P.caption || 'Blue: the exact solution (dashed in One step: the exact solution through the start of that step). Each method moves in straight steps whose slope it builds from f; the gold arrow is one step. On the log–log panel a straight line of slope p means the error falls like hᵖ.');
  return { get: (key) => F.params[key] };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
  const tryParse = (src, vars, where) => { try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`de-stepper ${where}: “${src}” — ${e.message}`); } };
  tryParse(P.f, ['t', 'y'], 'f');
  if (P.exact) tryParse(P.exact, ['t'], 'exact');
  if (![P.t0, P.y0, P.T].every(Number.isFinite) || !(P.T > P.t0)) problems.push('de-stepper: needs numbers t0 < T and y0');
  if (!Array.isArray(P.hs) || !P.hs.length || !P.hs.every((h) => h > 0)) problems.push('de-stepper: hs must be a list of positive step sizes');
  else {
    for (const h of P.hs) { const n = (P.T - P.t0) / h; if (Math.abs(n - Math.round(n)) > 1e-9 * n) problems.push(`de-stepper: h = ${h} does not divide T − t0 = ${P.T - P.t0} into whole steps`); }
    if (P.h !== null && P.h !== undefined && !P.hs.includes(P.h)) problems.push('de-stepper: h must be one of hs');
  }
  for (const m of P.methods || []) if (!METHODS.includes(m)) problems.push(`de-stepper: unknown method “${m}” (use ${METHODS.join(', ')})`);
  if (P.method && !(P.methods || METHODS).includes(P.method)) problems.push('de-stepper: method must be one of methods');
  for (const v of P.views || []) if (v !== 'run' && v !== 'stage') problems.push(`de-stepper: unknown view “${v}” (run or stage)`);
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  for (const L of [P.xlabel, P.ylabel]) {
    if (typeof L === 'string' && /\$|\\[A-Za-z]|(?<![\w])[A-Za-z]{1,2}[_^](?:\{|[A-Za-z0-9])/.test(L)) problems.push(`de-stepper axis title “${L}” must be plain text`);
  }
  return problems;
}

// a number as TeX: plain decimals in the middle range, ×10ⁿ outside it
function num(v, digits = 7) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e6)) {
    const [mm, e] = v.toExponential(Math.min(digits, 4) - 1).split('e');
    return `${mm}\\times10^{${+e}}`;
  }
  return String(+v.toPrecision(digits));
}
