// Sequences and series, term by term. A lesson gives the n-th term as an
// expression of n and of its slider keys ('1/n^p', '(-1)^(n+1)/n', 'r^n'),
// or a recursion a_{n+1} = f(a, n) with a starting value a1, and picks a view:
//
//   sums      the terms aₙ as thin bars and the partial sums Sₙ as dots joined
//             in order (an alternating series shows its zig-zag), the sum as a
//             dashed line when it is known (`limit`), and with bound: 'alt' the
//             band between S_N and S_{N+1} that must contain the sum
//   terms     the sequence aₙ as dots, its limit, and with `eps` (a slider key)
//             an ε-band and the index after which every plotted term stays in it
//   ratio     |a_{n+1}/a_n| for the ratio test (or root: |a_n|^{1/n}), with the
//             line at 1 that decides it and the limit L when it is given
//   cobweb    a recursion a_{n+1} = f(a_n) walked on the curve y = f(x) and y = x
//   integral  the integral test: f(x) = the term with n → x, and rectangles of
//             height a_k on [k, k+1] (above a decreasing curve) or [k−1, k] (below)
//
//   { type: 'calc-series', params: {
//       view: 'sums', term: '(-1)^(n+1)/n', limit: 'ln(2)', bound: 'alt',
//       N: { min: 1, max: 40, value: 8 },               // a slider 'N' (or a fixed number of terms)
//       sliders: [{ key: 'p', … }], y: [lo, hi],         // x and y are fitted to the picture if omitted
//       compare: { term: '1/n^2', label: '1/n²' },       // a second sequence or series (or a list), dashed
//       guide: { fn: 'ln(n) + 0.5772', label: 'ln n + γ' },   // a smooth curve of n drawn dashed (sums and terms views)
//       presets: [{ label: 'harmonic', term: '1/n', limit: null }, …],   // a choice; each entry overrides options
//       readouts: [{ label, expr }] } }                   // expressions of the slider keys and N, SN, aN, L
//
// Only finitely many terms can ever be drawn; captions should say so.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { simpson } from '../model/numeric.js';
import { terms, partialSums, settleIndex, ratios, roots, cobweb, integralRects } from '../model/calc-series.js';

export const VIEWS = ['sums', 'terms', 'ratio', 'root', 'cobweb', 'integral'];
export const defaults = { view: 'sums', term: '1/2^n', n0: 1, N: { min: 1, max: 30, value: 8 } };

const YLABEL = { sums: 'Sₙ and aₙ', terms: 'aₙ', ratio: '|aₙ₊₁ / aₙ|', root: '|aₙ|^(1/n)', cobweb: 'aₙ₊₁', integral: 'f(x)' };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'Terms and partial sums of a sequence or series' });
  const presets = P.presets?.length ? P.presets : null;
  // choices get a whole row of the control grid: a segmented control does not wrap
  const wide = (c) => {
    if (!c?.node) return c;
    c.node.style.gridColumn = '1 / -1';
    const seg = c.node.querySelector('.seg');
    if (seg) seg.style.flexWrap = 'wrap';
    return c;
  };
  if (presets) wide(F.choice({ key: 'preset', label: P.presetLabel || 'Example', options: presets.map((q, i) => [i, q.label]), value: P.preset ?? 0, explain: P.presetExplain || '' }));
  const Nspec = typeof P.N === 'object' ? P.N : null;
  if (Nspec) F.slider({ key: 'N', label: Nspec.label || 'Terms shown $N$', min: Nspec.min ?? 1, max: Nspec.max, step: 1, value: Nspec.value, explain: Nspec.explain || 'How many terms are computed and drawn.' });
  const sliders = P.sliders || [];
  for (const s of sliders) F.slider(s);
  const views = presets ? presets.map((q) => q.view || P.view) : [P.view];
  if (views.includes('integral')) wide(F.choice({ key: 'rects', label: 'Rectangles', options: [['upper', 'Above'], ['lower', 'Below'], ['both', 'Both']], value: P.rects || 'upper', explain: 'Heights $a_k = f(k)$ and width 1: above the curve on $[k, k+1]$, below it on $[k-1, k]$.' }));
  const keys = sliders.map((s) => s.key);
  const plot = new Plot(canvas, { x: [0, 10], y: [0, 1], xlabel: 'n', ylabel: '' });
  let occupied = [];   // screen positions of the drawn points, so the legend can avoid them
  const mark = (x, y) => occupied.push([plot.X(x), plot.Y(y)]);
  F.onChange(() => draw());

  function draw() {
    const Q = presets ? { ...P, ...presets[F.params.preset] } : P;
    const view = Q.view || 'sums';
    const env = {};
    for (const k of keys) env[k] = F.params[k];
    const val = (src) => (typeof src === 'number' ? src : fn(src, keys)(env));
    const Nmax = Nspec ? Nspec.max : Q.N;
    const N = Math.max(1, Math.round(Nspec ? F.params.N : Q.N));
    const n0 = Q.n0 ?? 1;
    const seqOf = (spec, count) => {
      const tf = spec.term !== undefined && spec.term !== null ? fn(spec.term, ['n', ...keys]) : null;
      const rf = spec.rec ? fn(spec.rec, ['a', 'n', ...keys]) : null;
      return terms({
        term: tf && ((n) => tf({ ...env, n })),
        rec: rf && ((a, n) => rf({ ...env, a, n })),
        a1: spec.rec ? val(spec.a1 ?? 1) : 1,
        n0: spec.n0 ?? n0,
      }, count);
    };
    const full = seqOf(Q, Nmax + 1);                  // one spare term: S_{N+1}, the next ratio
    const shown = full.slice(0, N);
    const L = Q.limit !== undefined && Q.limit !== null && (Q.limitWhen === undefined || val(Q.limitWhen) > 0) ? val(Q.limit) : null;
    const comps = [].concat(Q.compare || []).map((c, i) => ({ ...c, color: c.color || ['warn', 'teal', 'violet'][i % 3], seq: seqOf(c, Nmax + 1) }));
    const last = shown[shown.length - 1];
    const xr = Q.x || [n0 - 1, n0 + Nmax];
    plot.o.xlabel = Q.xlabel || (view === 'cobweb' ? 'aₙ' : view === 'integral' ? 'x' : 'n');
    plot.o.ylabel = Q.ylabel || YLABEL[view];
    const rows = [];
    const legend = [];
    occupied = [];

    if (view === 'sums') {
      const S = partialSums(full), Sn = S.slice(0, N);
      const showTerms = Q.showTerms !== false;
      if (!Q.ylabel) plot.o.ylabel = showTerms ? YLABEL.sums : 'Sₙ';
      const cS = comps.map((c) => partialSums(c.seq).slice(0, N));
      plot.setView(xr, Q.y || fit([0, ...Sn.map((p) => p.s), ...(showTerms ? Sn.map((p) => p.a) : []), ...(L !== null ? [L] : []), ...cS.flat().map((p) => p.s)], true));
      plot.clear();
      const SN = Sn[N - 1].s, next = S[N];
      clip(() => {
        if (Q.bound === 'alt' && next) {
          const lo = Math.min(SN, next.s), hi = Math.max(SN, next.s);
          plot.rect(plot.vx0, lo, plot.vx1 - plot.vx0, hi - lo, { color: 'gold', alpha: 0.13, stroke: false });
          bracket(N + 0.45, SN, next.s, 'gold');
        }
        if (showTerms) for (const { n, a } of Sn) plot.rect(n - 0.17, Math.min(0, a), 0.34, Math.abs(a), { color: 'violet', alpha: 0.45, width: 1 });
        cS.forEach((list, i) => { plot.path(list.map((p) => [p.n, p.s]), { color: comps[i].color, width: 1.4, dash: [5, 4] }); for (const p of list) plot.point(p.n, p.s, { color: comps[i].color, r: dot(N) - 0.6 }); });
        if (L !== null) plot.line(plot.vx0, L, plot.vx1, L, { color: 'good', width: 1.5, dash: [7, 5] });
        guide(Q, env, n0);
        plot.path(Sn.map((p) => [p.n, p.s]), { color: 'accent', width: 1.7 });
        for (const p of Sn) { plot.point(p.n, p.s, { color: 'accent', r: dot(N) }); mark(p.n, p.s); }
        cS.forEach((list) => list.forEach((p) => mark(p.n, p.s)));
        if (showTerms) for (const p of Sn) mark(p.n, p.a);
      });
      if (L !== null) lineLabel(`${Q.limitLabel || 'sum'} = ${short(L)}`, L, 'good');
      if (showTerms) legend.push(['terms aₙ', 'violet']);
      legend.push(['partial sums Sₙ', 'accent']);
      comps.forEach((c) => { if (c.label !== '') legend.push([c.label || 'comparison', c.color]); });
      if (Q.guide?.label) legend.push([Q.guide.label, 'ink2']);
      if (Q.bound === 'alt') legend.push(['sum lies in this band', 'gold']);
      rows.push(['$N$', String(N)], [n0 === 1 ? '$S_N$' : `sum of the first $N$ terms`, num(SN)]);
      if (L !== null) rows.push([Q.limitLabel || 'sum $S$', num(L)], ['$|S - S_N|$', num(Math.abs(L - SN))]);
      if (Q.bound === 'alt' && next) rows.push(['bound $|a_{N+1}|$', num(Math.abs(next.a))]);
      comps.forEach((c, i) => { if (c.label !== '') rows.push([`${c.label || 'comparison'}: $S_N$`, num(cS[i][N - 1].s)]); });
      custom(Q, rows, { N, SN, aN: last.a, L: L ?? NaN }, env);
    } else if (view === 'terms') {
      const eps = Q.eps ? F.params[Q.eps] : null;
      const cT = comps.map((c) => c.seq.slice(0, N));
      plot.setView(xr, Q.y || fit([...shown.map((p) => p.a), ...(L !== null ? [L - (eps || 0), L + (eps || 0)] : []), ...cT.flat().map((p) => p.a)], !!Q.zero));
      plot.clear();
      clip(() => {
        if (eps && L !== null) {
          plot.rect(plot.vx0, L - eps, plot.vx1 - plot.vx0, 2 * eps, { color: 'good', alpha: 0.12, stroke: false });
          for (const y of [L - eps, L + eps]) plot.line(plot.vx0, y, plot.vx1, y, { color: 'good', width: 1, dash: [3, 4] });
        }
        if (L !== null) plot.line(plot.vx0, L, plot.vx1, L, { color: 'good', width: 1.5, dash: [7, 5] });
        cT.forEach((list, i) => { if (comps[i].join !== false) plot.path(list.map((p) => [p.n, p.a]), { color: comps[i].color, width: 1.2, dash: [5, 4] }); for (const p of list) plot.point(p.n, p.a, { color: comps[i].color, r: dot(N) - 0.8 }); });
        guide(Q, env, n0);
        if (Q.join) plot.path(shown.map((p) => [p.n, p.a]), { color: 'accent', width: 1.3, alpha: 0.6 });
        for (const p of shown) { plot.point(p.n, p.a, { color: eps && L !== null && Math.abs(p.a - L) < eps ? 'good' : 'accent', r: dot(N) }); mark(p.n, p.a); }
        cT.forEach((list) => list.forEach((p) => mark(p.n, p.a)));
      });
      if (L !== null) lineLabel(`${Q.limitLabel || 'limit'} = ${short(L)}`, L, 'good');
      legend.push([Q.termLabel || 'aₙ', 'accent']);
      comps.forEach((c) => { if (c.label !== '') legend.push([c.label || 'comparison', c.color]); });
      if (Q.guide?.label) legend.push([Q.guide.label, 'ink2']);
      if (eps && L !== null) legend.push(['within ε of the limit', 'good']);
      rows.push(['$N$', String(N)], ['$a_N$', num(last.a, 7)]);
      if (L !== null) rows.push([Q.limitLabel || 'limit $L$', num(L)], ['$|a_N - L|$', num(Math.abs(last.a - L))]);
      if (eps && L !== null) {
        const k = settleIndex(full.slice(0, Nmax), L, eps);
        rows.push(['$\\varepsilon$', num(eps)], [`inside the band for every $n$ from`, k === null ? `\\text{— (not by } n = ${n0 + Nmax - 1})` : `n = ${k}\\ \\text{(checked to } n = ${n0 + Nmax - 1})`]);
      }
      custom(Q, rows, { N, SN: NaN, aN: last.a, L: L ?? NaN }, env);
    } else if (view === 'ratio' || view === 'root') {
      const R = (view === 'ratio' ? ratios(full) : roots(full)).slice(0, N);
      plot.setView(xr, Q.y || fit([0, 1.2, ...R.map((p) => p.r).filter((v) => v < 50), ...(L !== null ? [L] : [])], true));
      plot.clear();
      clip(() => {
        plot.rect(plot.vx0, 1, plot.vx1 - plot.vx0, Math.max(0, plot.vy1 - 1), { color: 'bad', alpha: 0.06, stroke: false });
        plot.line(plot.vx0, 1, plot.vx1, 1, { color: 'bad', width: 1.4, dash: [4, 4] });
        if (L !== null) plot.line(plot.vx0, L, plot.vx1, L, { color: 'good', width: 1.5, dash: [7, 5] });
        for (const p of R) { plot.point(p.n, p.r, { color: 'accent', r: dot(N) }); mark(p.n, p.r); }
      });
      lineLabel('1', 1, 'bad');
      if (L !== null && Math.abs(L - 1) > 0.06 * (plot.vy1 - plot.vy0)) lineLabel(`L = ${short(L)}`, L, 'good');
      legend.push([view === 'ratio' ? '|aₙ₊₁ / aₙ|' : '|aₙ|^(1/n)', 'accent']);
      const rN = R[R.length - 1].r;
      rows.push(['$N$', String(N)], [view === 'ratio' ? '$|a_{N+1}/a_N|$' : '$|a_N|^{1/N}$', num(rN)]);
      if (L !== null) rows.push(['limit $L$', num(L)], ['verdict', L < 1 - 1e-9 ? '\\text{converges absolutely}' : L > 1 + 1e-9 ? '\\text{diverges}' : '\\text{no decision}']);
      custom(Q, rows, { N, SN: NaN, aN: last.a, L: L ?? NaN }, env);
    } else if (view === 'cobweb') {
      const xs = shown.map((p) => p.a);
      const rf = fn(Q.rec, ['a', 'n', ...keys]);
      const f = (x) => rf({ ...env, a: x, n: n0 });
      const range = Q.x || fit([0, ...xs, ...(L !== null ? [L] : [])], true);
      plot.setView(range, Q.y || range);
      plot.clear();
      clip(() => {
        plot.line(plot.vx0, plot.vx0, plot.vx1, plot.vx1, { color: 'ink3', width: 1.2, dash: [5, 5] });
        plot.fn(f, { color: 'accent', width: 2.2 });
        plot.path(cobweb(shown), { color: 'gold', width: 1.6 });
        for (const [x, y] of cobweb(shown)) mark(x, y);
        for (let i = 0; i <= 40; i++) { const x = plot.vx0 + ((plot.vx1 - plot.vx0) * i) / 40; mark(x, f(x)); }
        shown.forEach((p, i) => plot.point(p.a, 0, { color: 'gold', r: i ? 2.6 : 4, label: i < 3 ? `a${'₁₂₃'[i]}` : undefined, ldy: -10 }));
        if (L !== null) plot.point(L, L, { color: 'good', r: 4.5, ring: 'good' });
      });
      legend.push([Q.curveLabel || 'y = f(x)', 'accent'], ['y = x', 'ink3'], ['the sequence', 'gold']);
      rows.push(['$N$', String(N)], ['$a_N$', num(last.a, 7)]);
      if (L !== null) rows.push([Q.limitLabel || 'fixed point $L$', num(L)], ['$|a_N - L|$', num(Math.abs(last.a - L))]);
      custom(Q, rows, { N, SN: NaN, aN: last.a, L: L ?? NaN }, env);
    } else if (view === 'integral') {
      const tf = fn(Q.term, ['n', ...keys]);
      const f = (x) => tf({ ...env, n: x });
      const { upper, lower } = integralRects(shown);
      const which = F.params.rects || 'upper';
      plot.setView(Q.x || [n0 - 1, n0 + Nmax + 1], Q.y || fit([0, shown[0].a], true));
      plot.clear();
      clip(() => {
        if (which !== 'lower') for (const r of upper) plot.rect(r.x0, 0, 1, r.h, { color: 'warn', alpha: 0.22, width: 1 });
        if (which !== 'upper') for (const r of lower) plot.rect(r.x0, 0, 1, r.h, { color: 'good', alpha: 0.28, width: 1 });
        plot.fn((x) => (x >= n0 - 0.5 ? f(x) : NaN), { color: 'accent', width: 2.2 });
        for (const r of upper) mark(r.x0, r.h);
      });
      const SN = shown.reduce((s, p) => s + p.a, 0), b = n0 + N - 1;
      if (which !== 'lower') legend.push(['above: area S_N', 'warn']);
      if (which !== 'upper') legend.push(['below: area S_N − first term', 'good']);
      legend.push([Q.curveLabel || 'y = f(x)', 'accent']);
      rows.push(['$N$', String(N)], ['$S_N$', num(SN)], [`$\\int_{${n0}}^{${b + 1}} f\\,dx$`, num(simpson(f, n0, b + 1, 600))]);
      if (Q.integralInf !== undefined) {
        const I = val(Q.integralInf);
        rows.push([`$\\int_{${n0}}^{\\infty} f\\,dx$`, num(I)]);
        if (Number.isFinite(I)) rows.push(['so the whole sum lies in', `[${short(I)},\\ ${short(I + shown[0].a)}]`]);
      }
      custom(Q, rows, { N, SN, aN: last.a, L: L ?? NaN }, env);
    }
    drawLegend(legend);
    // readout: false hides the numbers (a problem's picture must not show its answer)
    F.readout(P.readout === false ? [] : rows);
  }

  function clip(body) {
    const g = plot.ctx;
    g.save(); g.beginPath(); g.rect(plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); g.clip();
    body();
    g.restore();
  }
  function guide(Q, env, n0) {
    if (!Q.guide?.fn) return;
    const g = fn(Q.guide.fn, ['n', ...keys]);
    plot.fn((x) => (x >= (Q.guide.from ?? n0) ? g({ ...env, n: x }) : NaN), { color: 'ink2', width: 1.5, dash: [3, 4] });
  }
  function bracket(x, y0, y1, color) {
    plot.line(x, y0, x, y1, { color, width: 2 });
    const w = 0.12 * (plot.vx1 - plot.vx0) / 20;
    plot.line(x - w, y0, x + w, y0, { color, width: 2 });
    plot.line(x - w, y1, x + w, y1, { color, width: 2 });
  }
  function lineLabel(text, y, color) {
    if (y < plot.vy0 || y > plot.vy1) return;
    plot.text(text, plot.vx1, y, { color, dx: -6, dy: -9, align: 'right', weight: 650, size: 12 });
    for (let k = 0; k <= 6; k++) occupied.push([plot.R - 6 - 18 * k, plot.Y(y) - 9]);   // keep the legend off the label
  }
  function drawLegend(items) {
    if (!items.length) return;
    const g = plot.ctx;
    g.save();
    const small = plot.R - plot.L < 480;
    g.font = `500 ${small ? 10.5 : 11.5}px Inter, system-ui, sans-serif`;
    const pad = 7, row = small ? 14 : 16;
    const w = Math.max(...items.map(([s]) => g.measureText(s).width)) + 30, hgt = items.length * row + pad;
    // the top corner that covers fewer of the drawn points
    const inside = (x0) => occupied.filter(([px, py]) => px >= x0 - 4 && px <= x0 + w + 4 && py >= plot.T && py <= plot.T + 6 + hgt + 4).length;
    const left = plot.L + 8, right = plot.R - 8 - w;
    const x = inside(right) < inside(left) ? right : left, y = plot.T + 6;
    g.fillStyle = plot.col.panel; g.globalAlpha = 0.86;
    g.fillRect(x, y, w, hgt);
    g.globalAlpha = 1;
    items.forEach(([s, c], i) => {
      const yy = y + pad / 2 + i * row + row / 2;
      g.fillStyle = plot.color(c);
      g.fillRect(x + 7, yy - 4, 12, 8);
      g.fillStyle = plot.col.ink2; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillText(s, x + 25, yy);
    });
    g.restore();
  }
  function custom(Q, rows, vars, env) {
    for (const r of Q.readouts || []) {
      const v = fn(r.expr, [...keys, 'N', 'SN', 'aN', 'L'])({ ...env, ...vars });
      rows.push([r.label, num(v, r.digits) + (r.unit ? `\\,${r.unit}` : '')]);
    }
  }

  F.draw(draw);
}

const dot = (N) => (N > 120 ? 1.8 : N > 60 ? 2.4 : 3.4);

// a range that shows every value, with a little room
function fit(vals, zero) {
  const v = vals.filter(Number.isFinite);
  let lo = Math.min(...v, zero ? 0 : Infinity), hi = Math.max(...v, zero ? 0 : -Infinity);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
  if (!(hi > lo)) { lo -= 0.5; hi += 0.5; }
  const span = hi - lo;
  return [lo === 0 ? -0.03 * span : lo - 0.08 * span, hi + 0.1 * span];
}

// a number as TeX for the readout
function num(v, d = 6) {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : v < 0 ? '-\\infty' : '\\text{—}';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e6 || a < 1e-4)) return v.toExponential(Math.max(1, d - 2)).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(d));
}
// a short plain-text number for labels drawn on the canvas
function short(v) {
  if (!Number.isFinite(v)) return '∞';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(2);
  return String(+v.toPrecision(4));
}

/** Node-side check used by the content tests: every expression parses, every option makes sense. */
export function validate(P) {
  const out = [];
  const keys = (P.sliders || []).map((s) => s.key);
  const tryF = (src, vars, where) => {
    if (src === undefined || src === null || typeof src === 'number') return;
    try { fn(src, [...vars, ...keys]); } catch (e) { out.push(`calc-series ${where}: “${src}” — ${e.message}`); }
  };
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) out.push(`slider ${s.key} needs a label`);
    if (['N', 'n', 'SN', 'aN', 'L', 'preset', 'rects'].includes(s.key)) out.push(`slider key ${s.key} is reserved`);
    if (s.key === 'a' && [P, ...(P.presets || []), ...[].concat(P.compare || [])].some((q) => q.rec)) out.push('slider key a is reserved for the recursion variable');
  }
  if (typeof P.N === 'object') {
    const lo = P.N.min ?? 1;
    if (!(Number.isInteger(P.N.max) && P.N.max >= lo && lo >= 1) || !(P.N.value >= lo && P.N.value <= P.N.max)) out.push('N: needs integers 1 ≤ min ≤ value ≤ max');
  } else if (!(Number.isInteger(P.N) && P.N >= 1)) out.push('N must be a positive integer or { min, max, value }');
  const configs = P.presets?.length ? P.presets.map((q) => ({ ...P, ...q })) : [P];
  if (P.presets && !P.presets.every((q) => q.label)) out.push('every preset needs a label');
  for (const Q of configs) {
    const where = Q.label ? `preset “${Q.label}”` : 'params';
    const view = Q.view || 'sums';
    if (!VIEWS.includes(view)) out.push(`${where}: unknown view ${view}`);
    if ((Q.term === undefined || Q.term === null) && !Q.rec) out.push(`${where}: needs a term (in n) or a recursion rec (in a and n)`);
    if (view === 'cobweb' && !Q.rec) out.push(`${where}: the cobweb view needs a recursion rec`);
    if (view === 'cobweb' && Q.rec && /\bn\b/.test(String(Q.rec))) out.push(`${where}: a cobweb needs a recursion that does not depend on n`);
    if (view === 'integral' && (Q.term === undefined || Q.term === null || Q.rec)) out.push(`${where}: the integral view needs a term formula, not a recursion`);
    if (Q.bound && Q.bound !== 'alt') out.push(`${where}: bound must be 'alt'`);
    if (Q.eps && !keys.includes(Q.eps)) out.push(`${where}: eps must name a slider key`);
    tryF(Q.term, ['n'], `${where} term`);
    tryF(Q.rec, ['a', 'n'], `${where} rec`);
    tryF(Q.a1, [], `${where} a1`);
    tryF(Q.limit, [], `${where} limit`);
    tryF(Q.limitWhen, [], `${where} limitWhen`);
    tryF(Q.integralInf, [], `${where} integralInf`);
    if (Q.guide) tryF(Q.guide.fn, ['n'], `${where} guide`);
    for (const c of [].concat(Q.compare || [])) {
      if ((c.term === undefined || c.term === null) && !c.rec) out.push(`${where}: a comparison needs a term or rec`);
      tryF(c.term, ['n'], `${where} compare term`); tryF(c.rec, ['a', 'n'], `${where} compare rec`); tryF(c.a1, [], `${where} compare a1`);
    }
    for (const r of Q.readouts || []) tryF(r.expr, ['N', 'SN', 'aN', 'L'], `${where} readout`);
    for (const k of ['x', 'y']) if (Q[k] && !(Array.isArray(Q[k]) && Q[k].length === 2 && Q[k][0] < Q[k][1])) out.push(`${where}: ${k} must be [lo, hi]`);
  }
  return out;
}
