// A data-driven 2D graph: functions, parametric and polar curves, sums of
// series, shaded integrals, Riemann sums, a draggable tangent (with an
// optional secant), points and lines — all written as expressions of x (or t,
// θ, k) and of slider parameters. Lessons configure it entirely from data:
//
//   { type: 'graph', params: {
//       x: [-4, 4], y: [-2, 2],
//       sliders: [{ key: 'a', label: 'Amplitude $a$', min: 0, max: 2, value: 1, unit: '', explain: '…' }],
//       curves: [{ fn: 'a*sin(x)', color: 'accent', label: 'f(x) = a sin x' }],
//       tangent: { fn: 'a*sin(x)', at: 1, secant: 'h' },
//       riemann: { fn: 'x^2', from: 0, to: 2, n: 'n', rule: 'left' },
//       readouts: [{ label: 'slope', expr: 'a*cos(x0)' }] } }

import { Plot, PALETTE, pow10Label } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { simpson } from '../model/numeric.js';

export const defaults = { x: [-5, 5], y: [-3, 3] };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'Interactive graph' });
  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: !!P.equal, xlabel: P.xlabel ?? 'x', ylabel: P.ylabel ?? 'y', xticks: P.xticks, yticks: P.yticks, grid: P.grid ?? true, axes: P.axes ?? true, axesAt: P.axesAt,
    // xlog / ylog: the coordinates are log₁₀ of the quantity, and the axis is labelled in decades
    xfmt: P.xlog ? pow10Label : undefined, yfmt: P.ylog ? pow10Label : undefined });
  const sliders = P.sliders || [];
  for (const s of sliders) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const keys = [...sliders.map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
  const env = () => ({ ...(P.constants || {}), ...pick(F.params, keys) });

  // draggable tangent point
  const T = P.tangent ? { x: typeof P.tangent.at === 'number' ? P.tangent.at : 1 } : null;
  if (T) {
    plot.handle(() => [T.x, tanFn()(T.x)], (x) => { T.x = Math.max(plot.vx0, Math.min(plot.vx1, x)); });
    plot.onDrag = () => { draw(); F.notify('x0'); };
  }
  const pointsDrag = (P.drag || []).map((d) => ({ ...d, x: d.x, y: d.y }));
  for (const d of pointsDrag) plot.handle(() => [d.x, d.y], (x, y) => { d.x = d.lockY ? x : x; d.y = d.lockY ? d.y : y; if (d.snap) { d.x = Math.round(d.x / d.snap) * d.snap; d.y = Math.round(d.y / d.snap) * d.snap; } });
  // a dragged point is a point item's answer: tell the question to re-read it
  if (pointsDrag.length) plot.onDrag = () => { draw(); F.notify('point'); };

  function tanFn() { const f = fn(P.tangent.fn, ['x', ...keys]); return (x) => f({ ...env(), x }); }

  F.onChange(() => draw());

  function draw() {
    plot.clear();
    const E = env();
    if (T) E.x0 = T.x;
    for (const d of pointsDrag) { E[d.key + 'x'] = d.x; E[d.key + 'y'] = d.y; }
    const vars = ['x', 'x0', ...keys, ...pointsDrag.flatMap((d) => [d.key + 'x', d.key + 'y'])];
    // shaded areas under curves
    const shown = (o) => !o.when || ev(o.when, E, vars);     // `when`: draw only while the expression is nonzero
    for (const s of P.shade || []) {
      if (!shown(s)) continue;
      const f = fn(s.fn, vars), lo = s.lower ? fn(s.lower, vars) : () => 0;
      const a = ev(s.from, E, vars), b = ev(s.to, E, vars);
      if (b > a) plot.area((x) => f({ ...E, x }), a, b, { color: s.color || 'accent', alpha: s.alpha ?? 0.2, lower: (x) => lo({ ...E, x }) });
    }
    // Riemann rectangles
    let riemannSum = null;
    if (P.riemann) {
      const R = P.riemann;
      const f = fn(R.fn, vars);
      const a = ev(R.from, E, vars), b = ev(R.to, E, vars), n = Math.max(1, Math.round(ev(R.n, E, vars)));
      const rule = typeof R.rule === 'string' && F.params[R.rule] !== undefined ? F.params[R.rule] : R.rule || 'left';
      const h = (b - a) / n;
      riemannSum = 0;
      for (let i = 0; i < n; i++) {
        const x0 = a + i * h, x1 = x0 + h;
        if (rule === 'trap') {
          const y0 = f({ ...E, x: x0 }), y1 = f({ ...E, x: x1 });
          plot.path([[x0, 0], [x0, y0], [x1, y1], [x1, 0]], { close: true, fill: 'warn', fillAlpha: 0.25, color: 'warn', width: 1 });
          riemannSum += (h * (y0 + y1)) / 2;
        } else {
          const xs = rule === 'right' ? x1 : rule === 'mid' ? (x0 + x1) / 2 : x0;
          const y = f({ ...E, x: xs });
          plot.rect(x0, Math.min(0, y), h, Math.abs(y), { color: 'warn', alpha: 0.22, width: 1 });
          riemannSum += h * y;
        }
      }
      E.riemann = riemannSum;
      E.integral = simpson((x) => f({ ...E, x }), a, b, 400);
    }
    // an integral readout without Riemann rectangles: integral: { fn, from, to }
    if (P.integral && !P.riemann) {
      const f = fn(P.integral.fn, vars);
      const a = ev(P.integral.from, E, vars), b = ev(P.integral.to, E, vars);
      E.integral = simpson((x) => f({ ...E, x }), a, b, 400);
    }
    // curves
    (P.curves || []).forEach((c, k) => {
      const color = c.color || PALETTE[k % PALETTE.length];
      const style = { color, width: c.width || 2.4, dash: dashOf(c.dash) };
      if (c.when && !ev(c.when, E, vars)) return;
      if (c.fn) { const f = fn(c.fn, vars); plot.fn((x) => f({ ...E, x }), { ...style, domain: c.domain ? [ev(c.domain[0], E, vars), ev(c.domain[1], E, vars)] : undefined }); }
      else if (c.param) {
        const fx = fn(c.param[0], ['t', ...vars]), fy = fn(c.param[1], ['t', ...vars]);
        plot.curve((t) => fx({ ...E, t }), (t) => fy({ ...E, t }), ev(c.t[0], E, vars), ev(c.t[1], E, vars), style);
      } else if (c.polar) {
        const r = fn(c.polar, ['theta', ...vars]);
        plot.curve((th) => r({ ...E, theta: th }) * Math.cos(th), (th) => r({ ...E, theta: th }) * Math.sin(th), ev(c.theta[0], E, vars), ev(c.theta[1], E, vars), style);
      } else if (c.sum) {
        const term = fn(c.sum, ['k', ...vars]);
        const k0 = ev(c.k[0], E, vars), k1 = Math.round(ev(c.k[1], E, vars));
        plot.fn((x) => { let s = 0; for (let j = k0; j <= k1; j++) s += term({ ...E, x, k: j }); return s; }, style);
      }
      if (c.label && c.labelAt !== undefined) {
        // labelAt is x for fn curves, t for param curves, θ for polar ones
        const at = ev(c.labelAt, E, vars);
        let lx = at, ly = 0;
        if (c.fn) ly = fn(c.fn, vars)({ ...E, x: at });
        else if (c.param) { lx = fn(c.param[0], ['t', ...vars])({ ...E, t: at }); ly = fn(c.param[1], ['t', ...vars])({ ...E, t: at }); }
        else if (c.polar) { const r = fn(c.polar, ['theta', ...vars])({ ...E, theta: at }); lx = r * Math.cos(at); ly = r * Math.sin(at); }
        else if (c.sum) { const term = fn(c.sum, ['k', ...vars]), k0 = ev(c.k[0], E, vars), k1 = Math.round(ev(c.k[1], E, vars)); ly = 0; for (let j = k0; j <= k1; j++) ly += term({ ...E, x: at, k: j }); }
        plot.text(c.label, lx, ly, { color, dx: c.labelDx ?? 6, dy: c.labelDy ?? -12, weight: 650, align: c.labelAlign });
      }
    });
    for (const l of P.vlines || []) { if (!shown(l)) continue; const x = ev(l.x, E, vars); plot.line(x, plot.vy0, x, plot.vy1, { color: l.color || 'ink3', width: 1.2, dash: [5, 5] }); if (l.label) plot.text(l.label, x, plot.vy1, { dx: 4, dy: 10, color: l.color || 'ink3' }); }
    for (const l of P.hlines || []) { if (!shown(l)) continue; const y = ev(l.y, E, vars); plot.line(plot.vx0, y, plot.vx1, y, { color: l.color || 'ink3', width: 1.2, dash: [5, 5] }); if (l.label) plot.text(l.label, plot.vx1, y, { dx: -4, dy: -10, align: 'right', color: l.color || 'ink3' }); }
    // tangent and secant
    if (T) {
      const f = tanFn();
      const h = 1e-5, x0 = T.x, y0 = f(x0), m = (f(x0 + h) - f(x0 - h)) / (2 * h);
      E.slope = m; E.y0 = y0;
      plot.slopeLine(x0, y0, m, { color: 'gold', width: 2 });
      if (P.tangent.secant) {
        const dh = ev(P.tangent.secant, E, vars);
        if (Math.abs(dh) > 1e-9) {
          const y1 = f(x0 + dh), ms = (y1 - y0) / dh;
          E.secant = ms;
          plot.slopeLine(x0, y0, ms, { color: 'violet', width: 1.6, dash: [6, 5] });
          plot.point(x0 + dh, y1, { color: 'violet', r: 4 });
        }
      }
      plot.point(x0, y0, { color: 'gold', r: 3 });
    }
    for (const p of P.points || []) {
      if (p.when && !ev(p.when, E, vars)) continue;
      plot.point(ev(p.x, E, vars), ev(p.y, E, vars), { color: p.color || 'accent2', label: p.label, r: p.r, ldx: p.labelDx, ldy: p.labelDy, lalign: p.labelAlign });
    }
    for (const a of (P.arrows || []).filter(shown)) plot.arrow(ev(a.from[0], E, vars), ev(a.from[1], E, vars), ev(a.to[0], E, vars), ev(a.to[1], E, vars), { color: a.color || 'accent', width: a.width || 2.2, dash: dashOf(a.dash), label: a.label, ldx: a.labelDx, ldy: a.labelDy, lalign: a.labelAlign });
    plot.drawHandles();
    if (P.legend?.length) drawLegend(plot, P.legend, P.legendAt || 'tr');
    if (P.readouts) F.readout(P.readouts.map((r) => [r.label, fmtVal(ev(r.expr, E, ['slope', 'secant', 'riemann', 'integral', 'y0', ...vars]), r)]));
  }
  F.draw(draw);
  if (P.caption) F.caption(P.caption);
  return { get: (k) => (k === 'point' && pointsDrag[0] ? { x: pointsDrag[0].x, y: pointsDrag[0].y } : k === 'x0' && T ? T.x : F.params[k]) };
}

/** Node-side check used by the content tests: every expression must parse with the names it may use. */
export function validate(P) {
  const problems = [];
  if (P.legend && !(Array.isArray(P.legend) && P.legend.every((it) => typeof it.label === 'string'))) problems.push('graph: legend must be [{ label, color, dash, point }]');
  if (P.legendAt && !['tl', 'tr', 'bl', 'br'].includes(P.legendAt)) problems.push('graph: legendAt must be tl, tr, bl or br');
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
  const drag = (P.drag || []).flatMap((d) => [d.key + 'x', d.key + 'y']);
  const base = ['x', 'x0', ...keys, ...drag];
  const tryParse = (src, extra = [], where = '') => {
    if (typeof src === 'number' || src === undefined) return;
    try { fn(src, [...base, ...extra]); } catch (e) { problems.push(`graph ${where}: “${src}” — ${e.message}`); }
  };
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  for (const c of P.curves || []) {
    if (c.fn) tryParse(c.fn, [], 'curve');
    if (c.param) { tryParse(c.param[0], ['t'], 'param x'); tryParse(c.param[1], ['t'], 'param y'); (c.t || []).forEach((v) => tryParse(v, [], 't range')); }
    if (c.polar) { tryParse(c.polar, ['theta'], 'polar'); (c.theta || []).forEach((v) => tryParse(v, [], 'theta range')); }
    if (c.sum) { tryParse(c.sum, ['k'], 'sum'); (c.k || []).forEach((v) => tryParse(v, [], 'k range')); }
  }
  for (const s of P.shade || []) { tryParse(s.fn, [], 'shade'); tryParse(s.from); tryParse(s.to); if (s.lower) tryParse(s.lower); }
  if (P.riemann) { tryParse(P.riemann.fn, [], 'riemann'); tryParse(P.riemann.from); tryParse(P.riemann.to); tryParse(P.riemann.n); }
  if (P.integral) { tryParse(P.integral.fn, [], 'integral'); tryParse(P.integral.from); tryParse(P.integral.to); }
  if (P.tangent) { tryParse(P.tangent.fn, [], 'tangent'); if (P.tangent.secant) tryParse(P.tangent.secant); }
  for (const p of P.points || []) { tryParse(p.x, ['slope', 'secant', 'riemann', 'integral', 'y0'], 'point'); tryParse(p.y, ['slope', 'secant', 'riemann', 'integral', 'y0'], 'point'); if (p.when) tryParse(p.when, [], 'point when'); }
  for (const o of [...(P.shade || []), ...(P.vlines || []), ...(P.hlines || []), ...(P.arrows || [])]) if (o.when) tryParse(o.when, [], 'when');
  for (const l of P.vlines || []) tryParse(l.x, [], 'vline');
  for (const l of P.hlines || []) tryParse(l.y, [], 'hline');
  for (const a of P.arrows || []) [...a.from, ...a.to].forEach((v) => tryParse(v, [], 'arrow'));
  for (const c of P.curves || []) { if (c.when) tryParse(c.when, [], 'curve when'); (c.domain || []).forEach((v) => tryParse(v, [], 'curve domain')); if (c.labelAt !== undefined) tryParse(c.labelAt, [], 'curve labelAt'); }
  for (const r of P.readouts || []) {
    tryParse(r.expr, ['slope', 'secant', 'riemann', 'integral', 'y0'], 'readout');
    if (r.digits !== undefined && !(Number.isInteger(r.digits) && r.digits >= 1 && r.digits <= 15)) problems.push(`graph: readout digits are significant figures, a whole number from 1 to 15 (got ${r.digits})`);
  }
  return problems;
}

// dash: true (the house dash), a pattern [on, off], or nothing
const dashOf = (d) => (Array.isArray(d) ? d : d ? [6, 5] : []);

// a legend box in a corner of the plotting area: [{ label, color, dash, point }]
function drawLegend(plot, items, at) {
  const g = plot.ctx, c = plot.col;
  g.save();
  g.font = '12px Inter, system-ui, sans-serif';
  const w = 34 + Math.max(...items.map((it) => g.measureText(it.label).width)), lh = 18, hgt = items.length * lh + 10;
  const x0 = at.includes('l') ? plot.L + 10 : plot.R - w - 10, y0 = at.includes('b') ? plot.B - hgt - 10 : plot.T + 10;
  g.globalAlpha = 0.88; g.fillStyle = c.panel; g.fillRect(x0, y0, w, hgt); g.globalAlpha = 1;
  g.strokeStyle = c.line2; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, w, hgt);
  items.forEach((it, k) => {
    const y = y0 + 5 + lh * k + lh / 2, col = plot.color(it.color || PALETTE[k % PALETTE.length]);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2.2; g.setLineDash(dashOf(it.dash));
    if (it.point) { g.beginPath(); g.arc(x0 + 17, y, 4.5, 0, Math.PI * 2); g.fill(); }
    else { g.beginPath(); g.moveTo(x0 + 8, y); g.lineTo(x0 + 26, y); g.stroke(); }
    g.setLineDash([]); g.fillStyle = c.ink2; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(it.label, x0 + 32, y);
  });
  g.restore();
}

function pick(obj, keys) { const o = {}; for (const k of keys) if (obj[k] !== undefined) o[k] = obj[k]; return o; }
function ev(src, env, vars) {
  if (typeof src === 'number') return src;
  if (env[src] !== undefined && typeof env[src] === 'number') return env[src];
  return fn(src, Object.keys(env).length ? [...new Set([...vars, ...Object.keys(env)])] : vars)(env);
}
function fmtVal(v, r) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const d = r.digits ?? 4;
  const a = Math.abs(v);
  const s = a !== 0 && (a >= 1e5 || a < 1e-3) ? `${v.toExponential(d - 1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`)}` : String(+v.toPrecision(d));
  return r.unit ? `${s}\\,${r.unit}` : s;
}
