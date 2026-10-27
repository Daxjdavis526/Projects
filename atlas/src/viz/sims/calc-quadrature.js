// Numerical integration, drawn. The approximation to ∫ₐᵇ f(x) dx by the
// midpoint rule (rectangles), the trapezoid rule (trapezoids) or Simpson's
// rule (the parabolic arcs it actually integrates, one through each pair of
// subintervals), with an optional log–log panel of |error| against n in which
// the midpoint and trapezoid errors fall like 1/n² and Simpson's like 1/n⁴.
// It also takes equally spaced samples (a thrust curve, an accelerometer log)
// instead of a formula. Lessons configure it from data:
//
//   { type: 'calc-quadrature', params: {
//       functions: [{ fn: 'exp(-x^2)', a: 0, b: 2, label: 'e^(−x²)', exact, K2, K4 }],  // several → a choice
//       rule: 'simpson', rules: ['mid', 'trap', 'simpson'],   // the starting rule, and those offered
//       n: 4, nMax: 32, nSlider: true,                       // subintervals (kept even), and the slider
//       errorPlot: true,                                     // the log–log error panel
//       readout: true,                                       // false hides the numbers (for questions)
//       data: { y: [0, 9.8, …], x0: 0, h: 0.2 },             // or samples instead of a function (trap, simpson)
//       x, y, xlabel, ylabel } }
//
// `exact` defaults to a Gauss–Legendre reference value; K2 and K4 — bounds on
// |f″| and |f⁗| over [a, b] — switch on the error-bound readout.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { RULES, RULE_NAMES, applyRule, simpsonWeights, parabola, trapezoidData, simpsonData, errorBound, reference, errorTable } from '../model/calc-quadrature.js';

const t = String.raw;

export const defaults = {
  functions: [{ fn: 'exp(-x^2)', a: 0, b: 2, label: 'e^(−x²)' }],
  rule: 'simpson', rules: RULES, n: 4, nMax: 32, nSlider: true, errorPlot: true,
};

const ERR_COLORS = { mid: 'teal', trap: 'warn', simpson: 'violet' };
const NS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

export function mount(F, P) {
  const data = P.data || null;
  const rules = (P.rules || RULES).filter((r) => RULES.includes(r) && !(data && r === 'mid'));
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'An integral approximated by rectangles, trapezoids or parabolic arcs' });
  const plot = new Plot(canvas, { xlabel: P.xlabel || 'x', ylabel: P.ylabel || 'y' });
  let eplot = null, yOffset = 0;   // log-errors are drawn shifted down by yOffset so the n-axis sits at the bottom
  if (P.errorPlot && !data) {
    const { canvas: c2 } = F.canvas({ aspect: 'wide', label: 'Size of the error against the number of subintervals, both on logarithmic scales' });
    eplot = new Plot(c2, {
      xlabel: 'n (log scale)', ylabel: '|error| (log scale)', pad: { l: 50, r: 78, t: 14, b: 34 },
      xfmt: (t) => { const v = 10 ** t; return v < 9.5 ? String(+v.toPrecision(2)) : String(Math.round(v)); },
      yfmt: (t) => (Number.isInteger(t) ? `1e${t + yOffset}` : ''),
    });
  }
  const funcs = data ? [] : (P.functions?.length ? P.functions : defaults.functions);
  const compiled = funcs.map((g) => { const c = fn(g.fn, ['x']); return (x) => c({ x }); });
  if (funcs.length > 1) F.choice({ key: 'fi', label: 'Function', options: funcs.map((g, i) => [i, g.label || g.fn]), value: 0 });
  if (rules.length > 1) {
    F.choice({ key: 'rule', label: 'Rule', options: rules.map((r) => [r, RULE_NAMES[r]]), value: rules.includes(P.rule) ? P.rule : rules[0],
      explain: 'Each rule swaps f for a simpler shape on every subinterval and adds up those shapes’ exact areas.' });
  }
  if (!data && P.nSlider !== false) {
    F.slider({ key: 'n', label: 'Subintervals $n$', min: 2, max: P.nMax || 32, step: 2, value: P.n || 4, explain: 'Simpson’s rule needs an even number of subintervals, so n moves in steps of 2.' });
  }
  const rule = () => (rules.includes(F.params.rule) ? F.params.rule : rules.includes(P.rule) ? P.rule : rules[0]);
  const fi = () => Math.min(funcs.length - 1, +(F.params.fi ?? 0));
  const nVal = () => F.params.n ?? P.n ?? 4;
  const exactCache = new Map(), tableCache = new Map();
  let last = null;

  F.onChange(() => draw());

  function draw() {
    if (data) { drawData(); return; }
    const k = fi(), g = funcs[k], f = compiled[k], r = rule(), n = nVal();
    const a = g.a, b = g.b, L = b - a, h = L / n;
    if (!exactCache.has(k)) exactCache.set(k, Number.isFinite(g.exact) ? g.exact : reference(f, a, b, 400));
    const exact = exactCache.get(k);
    // view: the interval with a margin; y from 0 (or the minimum) to the maximum
    let lo = 0, hi = 0;
    for (let i = 0; i <= 240; i++) { const y = f(a + (L * i) / 240); if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
    const span = hi - lo || 1;
    plot.setView(P.x || [a - 0.05 * L, b + 0.05 * L], P.y || [lo - (lo < 0 ? 0.1 : 0.04) * span, hi + 0.12 * span]);
    plot.clear();
    if (r === 'mid') {
      for (let i = 0; i < n; i++) {
        const x0 = a + i * h, xm = x0 + h / 2, y = f(xm);
        plot.rect(x0, Math.min(0, y), h, Math.abs(y), { color: 'warn', alpha: 0.24, width: 1 });
        plot.point(xm, y, { color: 'gold', r: n <= 16 ? 3.5 : 2.5 });
      }
    } else if (r === 'trap') {
      for (let i = 0; i < n; i++) {
        const x0 = a + i * h, x1 = x0 + h;
        plot.path([[x0, 0], [x0, f(x0)], [x1, f(x1)], [x1, 0]], { close: true, fill: 'warn', fillAlpha: 0.24, color: 'warn', width: 1 });
      }
    } else {
      for (let j = 0; j < n / 2; j++) {
        const xa = a + 2 * j * h, xb = xa + h, xc = xa + 2 * h;
        const p = parabola(xa, f(xa), xb, f(xb), xc, f(xc));
        const arc = Array.from({ length: 25 }, (_, i) => { const x = xa + (2 * h * i) / 24; return [x, p(x)]; });
        plot.path([[xa, 0], ...arc, [xc, 0]], { close: true, fill: 'warn', fillAlpha: 0.24, color: 'warn', width: 1 });
        plot.path(arc, { color: 'gold', width: 1.8, dash: [5, 4] });
      }
    }
    plot.fn(f, { color: 'accent', width: 2.4, domain: [a, b] });
    if (r !== 'mid') for (let i = 0; i <= n; i++) plot.point(a + i * h, f(a + i * h), { color: 'accent2', r: n <= 16 ? 3.5 : 2.5 });
    if (r === 'simpson' && n <= 12) {
      simpsonWeights(n).forEach((w, i) => plot.text(`×${w}`, a + i * h, f(a + i * h), { color: 'ink2', align: 'center', dy: -14, size: 11.5, weight: 650 }));
    }
    const est = applyRule(r, f, a, b, n), err = est - exact;
    last = est;
    const rows = [[`${RULE_NAMES[r]} estimate`, num(est)], ['exact', num(exact)], ['error', num(err)]];
    const K = r === 'simpson' ? g.K4 : g.K2;
    if (Number.isFinite(K)) rows.push(['error bound', num(errorBound(r, K, a, b, n))]);
    if (eplot) {
      const err2 = applyRule(r, f, a, b, 2 * n) - exact;
      rows.push([t`error ratio $E_n / E_{2n}$`, Math.abs(err2) > 1e-14 * Math.max(1, Math.abs(exact)) ? num(err / err2, 3) : '\\text{—}']);
      drawErrors(k, f, a, b, exact, r, n, err);
    }
    if (P.readout !== false) F.readout(rows);
  }

  function drawErrors(k, f, a, b, exact, r, n, err) {
    if (!tableCache.has(k)) tableCache.set(k, errorTable(f, a, b, exact, NS));
    const tab = tableCache.get(k), floor = 1e-14 * Math.max(1, Math.abs(exact));
    const series = {};
    let ymin = Infinity, ymax = -Infinity;
    for (const key of rules) {
      series[key] = tab.map((row) => [Math.log10(row.n), Math.abs(row[key])]).filter(([, e]) => Number.isFinite(e) && e > floor).map(([x, e]) => [x, Math.log10(e)]);
      for (const [, y] of series[key]) { ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
    }
    if (!Number.isFinite(ymin)) { ymin = -15; ymax = 0; }
    yOffset = Math.ceil(ymax) + 1;
    eplot.setView([Math.log10(2) - 0.12, Math.log10(1024) + 0.12], [Math.floor(ymin) - yOffset - 0.4, Math.ceil(ymax) - yOffset + 0.4]);
    eplot.clear();
    for (const key of rules) {
      const pts = series[key].map(([x, y]) => [x, y - yOffset]), color = ERR_COLORS[key], on = key === r;
      if (!pts.length) continue;
      eplot.path(pts, { color, width: on ? 2.6 : 1.4, alpha: on ? 1 : 0.55 });
      for (const [x, y] of pts) eplot.point(x, y, { color, r: on ? 2.8 : 2 });
      const [lx, ly] = pts[pts.length - 1];
      eplot.text(RULE_NAMES[key], lx, ly, { color, dx: 7, dy: key === 'trap' ? -7 : key === 'mid' ? 7 : 0, weight: on ? 700 : 500 });
    }
    if (Math.abs(err) > floor) eplot.point(Math.log10(n), Math.log10(Math.abs(err)) - yOffset, { color: 'gold', r: 5.5, ring: 'ink' });
  }

  function drawData() {
    const ys = data.y, h = data.h ?? 1, x0 = data.x0 ?? 0, n = ys.length - 1, r = rule();
    const xs = ys.map((_, i) => x0 + i * h), L = n * h;
    const lo = Math.min(0, ...ys), hi = Math.max(0, ...ys), span = hi - lo || 1;
    plot.setView(P.x || [x0 - 0.04 * L, x0 + 1.04 * L], P.y || [lo - (lo < 0 ? 0.1 : 0.04) * span, hi + 0.14 * span]);
    plot.clear();
    let est = NaN;
    if (r === 'trap') {
      for (let i = 0; i < n; i++) plot.path([[xs[i], 0], [xs[i], ys[i]], [xs[i + 1], ys[i + 1]], [xs[i + 1], 0]], { close: true, fill: 'warn', fillAlpha: 0.24, color: 'warn', width: 1 });
      est = trapezoidData(ys, h);
    } else if (r === 'simpson' && n % 2 === 0) {
      for (let j = 0; j < n; j += 2) {
        const p = parabola(xs[j], ys[j], xs[j + 1], ys[j + 1], xs[j + 2], ys[j + 2]);
        const arc = Array.from({ length: 25 }, (_, i) => { const x = xs[j] + (2 * h * i) / 24; return [x, p(x)]; });
        plot.path([[xs[j], 0], ...arc, [xs[j + 2], 0]], { close: true, fill: 'warn', fillAlpha: 0.24, color: 'warn', width: 1 });
        plot.path(arc, { color: 'gold', width: 1.8, dash: [5, 4] });
      }
      est = simpsonData(ys, h);
      if (n <= 12) simpsonWeights(n).forEach((w, i) => plot.text(`×${w}`, xs[i], ys[i], { color: 'ink2', align: 'center', dy: -14, size: 11.5, weight: 650 }));
    }
    xs.forEach((x, i) => plot.point(x, ys[i], { color: 'accent', r: 4 }));
    last = est;
    if (P.readout !== false) F.readout([[`${RULE_NAMES[r]} estimate`, Number.isFinite(est) ? num(est) + (data.unit ? `\\;${data.unit}` : '') : '\\text{needs an even number of intervals}']]);
  }

  F.draw(draw);
  return { get: (key) => (key === 'estimate' ? last : F.params[key]) };
}

// a number as TeX: plain decimals in the middle range, ×10ⁿ outside it
function num(v, digits = 7) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e6)) {
    const [m, e] = v.toExponential(Math.min(digits, 4) - 1).split('e');
    return `${m}\\times10^{${+e}}`;
  }
  return String(+v.toPrecision(digits));
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const rules = P.rules || RULES;
  for (const r of rules) if (!RULES.includes(r)) problems.push(`unknown rule “${r}”`);
  if (P.rule !== undefined && !RULES.includes(P.rule)) problems.push(`unknown starting rule “${P.rule}”`);
  if (P.data) {
    const ys = P.data.y;
    if (!Array.isArray(ys) || ys.length < 3 || !ys.every(Number.isFinite)) problems.push('data.y needs 3 or more finite samples');
    else if (rules.includes('simpson') && (ys.length - 1) % 2) problems.push('Simpson’s rule on data needs an odd number of samples (an even number of intervals); offer rules: [\'trap\'] instead');
    if (P.data.h !== undefined && !(P.data.h > 0)) problems.push('data.h must be positive');
    return problems;
  }
  if (!Array.isArray(P.functions) || !P.functions.length) problems.push('needs functions (or data)');
  for (const g of P.functions || []) {
    try { fn(g.fn, ['x']); } catch (e) { problems.push(`function “${g.fn}”: ${e.message}`); }
    if (!(Number.isFinite(g.a) && Number.isFinite(g.b) && g.a < g.b)) problems.push(`function “${g.fn}”: needs finite a < b`);
  }
  const n = P.n ?? 4;
  if (!Number.isInteger(n) || n < 2 || n % 2) problems.push('n must be an even integer of at least 2');
  if (P.nMax !== undefined && !(Number.isInteger(P.nMax) && P.nMax >= n && P.nMax % 2 === 0)) problems.push('nMax must be an even integer no smaller than n');
  return problems;
}
