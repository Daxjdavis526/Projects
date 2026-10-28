// A (0,2) tensor — above all the metric — drawn as what it does. The algebra
// is in model/ten-metric.js (test/ten-metric.test.mjs).
//
//   mode 'form' — one plane of vectors, drawn on component axes (x¹ across,
//     x² up; the paper's own lengths and angles mean nothing here). A tensor
//     T_μν eats two arrows U and V (drag their tips) and returns T(U, V).
//     Feeding it U alone leaves a covector T(U, ·), drawn as its stack of
//     lines: T(U, V) is the number of lines V crosses (bold). For the metric,
//     T(U, ·) is U with its index lowered, U_ν = g_μν U^μ. indicatrix: true
//     draws the "unit circle" T(X, X) = 1 of the symmetric part — an ellipse
//     for a positive-definite metric, hyperbolae T(X, X) = ±1 and the null
//     lines T(X, X) = 0 for an indefinite one. covector: [ω₁, ω₂] instead
//     draws ω's stack and the vector ω^μ = g^{μν}ω_ν it raises to.
//   mode 'chart' — a metric field on a coordinate chart (polar (r, θ), the
//     2-sphere (φ across, θ down from the north pole), the half-plane
//     (dx² + dy²)/y², Minkowski (x across, t up, c = 1), skewed axes or
//     Cartesian), drawn as the chart's own square grid with, at grid points,
//     the set of small steps of one fixed length ε: g's "unit circles" (Tissot
//     ellipses), hyperbolae in Minkowski space. A probe P (drag it) reads g at
//     a point; a segment (drag its ends) has its length measured with the
//     metric and naively. space: true adds the true flat plane beside the
//     chart (polar, skew, Cartesian), where every one of those ellipses is a
//     circle of radius ε.
//
//   { type: 'ten-metric', params: {
//       mode: 'form',
//       T: [[1, 0], [0, 1]],            // T_μν (rows μ, columns ν)
//       sliders: false,                 // 'full' (T11 T12 T21 T22) | 'sym' (g11 g12 g22) | 'product' (ω₁ ω₂ η₁ η₂: T = ω ⊗ η)
//       range: 3,                       // slider range ±range (step 0.1)
//       presets: null,                  // [{ label, T }] — a choice (key 'preset'); the first must be T
//       U: [1, 0.5], V: [1.2, 1.4],     // the arrows' components; dragU / dragV: true
//       showU: true, showV: true, uname: 'U', vname: 'V', tname: 'T',   // canvas names (plain text); tname is also the readout's symbol (TeX)
//       feed: 'first',                  // the stack T(U, ·) | 'second' (T(·, U)) | false (no stack)
//       crossings: true, levelLabels: true,
//       indicatrix: false, indicatrixLabels: true,
//       covector: null,                 // [ω₁, ω₂]: the stack of ω and its raised vector (sliders w1, w2 unless covSliders: false); wname 'ω'
//       axes: ['x¹', 'x²'],             // the component axes' labels
//       view: 2.2, snap: 0.1,           // the window's half-height; drag snap
//       readout: true } }               // false, or a list of: T inv parts U V low TUV TVU UU VV len angle sig det kind w raised
//
//   { type: 'ten-metric', params: {
//       mode: 'chart', chart: 'polar',  // cartesian | polar | sphere | halfplane | minkowski | skew
//       charts: null,                   // a list of charts to offer as a choice (key 'chart')
//       probe: [2, 1], dragProbe: true, // P in chart coordinates (a across, b up; sphere: [φ, θ], minkowski: [x, t])
//       eps: null,                      // the step length the ellipses stand for (default per chart)
//       ellipses: true, space: false,
//       segment: null,                  // [[a, b], [a, b]]: a chart segment with draggable ends, measured
//       R: 1, skew: 60,                 // the sphere's radius; the skewed axes' angle (degrees)
//       readout: true } }               // false, or a list of: P g lengths sqrtg seg
//
// A point item reads V's tip (get('point')); a picture must not show its
// answer: readout: false, crossings: false, levelLabels: false as needed.

import { Plot, tickLabel } from '../plot.js';
import * as M from '../model/ten-metric.js';

export const defaults = {
  mode: 'form', T: [[1, 0], [0, 1]], sliders: false, range: 3, presets: null,
  U: [1, 0.5], V: [1.2, 1.4], dragU: true, dragV: true, showU: true, showV: true, uname: 'U', vname: 'V', tname: 'T',
  feed: 'first', crossings: true, levelLabels: true, indicatrix: false, indicatrixLabels: true,
  covector: null, covSliders: true, product: null, wname: 'ω', axes: ['x¹', 'x²'], view: 2.2, snap: 0.1, readout: true, aspect: '',
  chart: 'polar', charts: null, probe: null, dragProbe: true, eps: null, ellipses: true, space: false, segment: null, R: 1, skew: 60,
};

const f3 = (v) => (Number.isFinite(v) ? String(+v.toFixed(3)).replace(/^-0$/, '0') : '\\text{—}');
const vec = (a) => `(${f3(a[0])},\\ ${f3(a[1])})`;
const mat = (A) => (A ? `\\begin{pmatrix} ${f3(A[0][0])} & ${f3(A[0][1])} \\\\ ${f3(A[1][0])} & ${f3(A[1][1])} \\end{pmatrix}` : '\\text{none (degenerate)}');
const KEYS = { full: ['T11', 'T12', 'T21', 'T22'], sym: ['g11', 'g12', 'g22'], product: ['a1', 'a2', 'b1', 'b2'] };

export function mount(F, P) {
  return P.mode === 'chart' ? mountChart(F, P) : mountForm(F, P);
}

// ── form: one tensor on one plane of vectors ─────────────────────────────────
function mountForm(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect, label: P.alt || 'Two arrows on component axes, and the stack of lines a tensor makes from one of them' });
  const tt = P.tname, R = P.range;
  const raiseMode = Array.isArray(P.covector);
  let T = P.T.map((r) => r.slice());
  if (P.sliders === 'full') [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([i, j]) => F.slider({ key: `T${i + 1}${j + 1}`, label: `$${tt}_{${i + 1}${j + 1}}$`, min: -R, max: R, step: 0.1, value: T[i][j], explain: `$${tt}(\\mathbf e_${i + 1}, \\mathbf e_${j + 1})$: what the machine gives for basis arrow ${i + 1} in the first slot and ${j + 1} in the second.` }));
  if (P.sliders === 'sym') {
    F.slider({ key: 'g11', label: `$${tt}_{11}$`, min: -R, max: R, step: 0.1, value: T[0][0], explain: `$${tt}(\\mathbf e_1, \\mathbf e_1)$: for a metric, the squared length of $\\mathbf e_1$.` });
    F.slider({ key: 'g12', label: `$${tt}_{12} = ${tt}_{21}$`, min: -R, max: R, step: 0.1, value: T[0][1], explain: `$${tt}(\\mathbf e_1, \\mathbf e_2)$: for a metric, the dot product of the two basis arrows — zero when they are perpendicular.` });
    F.slider({ key: 'g22', label: `$${tt}_{22}$`, min: -R, max: R, step: 0.1, value: T[1][1], explain: `$${tt}(\\mathbf e_2, \\mathbf e_2)$: for a metric, the squared length of $\\mathbf e_2$.` });
  }
  if (P.sliders === 'product') {
    const a = P.product?.[0] || [1, 0.5], b = P.product?.[1] || [0.5, 1];
    F.slider({ key: 'a1', label: '$\\omega_1$', min: -R, max: R, step: 0.1, value: a[0], explain: 'The first factor ω: its component on e₁.' });
    F.slider({ key: 'a2', label: '$\\omega_2$', min: -R, max: R, step: 0.1, value: a[1], explain: 'The first factor ω: its component on e₂.' });
    F.slider({ key: 'b1', label: '$\\eta_1$', min: -R, max: R, step: 0.1, value: b[0], explain: 'The second factor η: its component on e₁.' });
    F.slider({ key: 'b2', label: '$\\eta_2$', min: -R, max: R, step: 0.1, value: b[1], explain: 'The second factor η: its component on e₂.' });
  }
  if (P.presets?.length) F.choice({ key: 'preset', label: P.presetLabel || 'Tensor', options: P.presets.map((p, i) => [i, p.label]), value: 0, explain: 'The same arrows fed to a different machine.' });
  if (raiseMode && P.covSliders) {
    F.slider({ key: 'w1', label: `$\\omega_1$`, min: -R, max: R, step: 0.1, value: P.covector[0], explain: 'The covector’s first component: how many of its lines e₁ crosses.' });
    F.slider({ key: 'w2', label: `$\\omega_2$`, min: -R, max: R, step: 0.1, value: P.covector[1], explain: 'The covector’s second component: how many lines e₂ crosses.' });
  }
  const tensor = () => {
    const p = F.params;
    if (P.sliders === 'full') return [[p.T11, p.T12], [p.T21, p.T22]];
    if (P.sliders === 'sym') return [[p.g11, p.g12], [p.g12, p.g22]];
    if (P.sliders === 'product') return M.outer([p.a1, p.a2], [p.b1, p.b2]);
    if (P.presets?.length) return P.presets[p.preset ?? 0].T;
    return T;
  };
  const cov = () => (raiseMode ? (P.covSliders ? [F.params.w1, F.params.w2] : P.covector) : null);
  const U = P.U.slice(), V = P.V.slice();
  const ratio = P.aspect === 'wide' ? 2 : P.aspect === 'square' ? 1 : 1.6, view = P.view;
  const plot = new Plot(canvas, { x: [-view * ratio, view * ratio], y: [-view, view], equal: true, grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const snap = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
  const inside = (x, y) => [Math.max(plot.vx0 + 0.1, Math.min(plot.vx1 - 0.1, snap(x))), Math.max(plot.vy0 + 0.1, Math.min(plot.vy1 - 0.1, snap(y)))];
  if (P.showU && P.dragU && !raiseMode) plot.handle(() => U, (x, y) => { [U[0], U[1]] = inside(x, y); }, { hollow: true, label: `the tip of ${P.uname}` });
  if (P.showV && P.dragV && !raiseMode) plot.handle(() => V, (x, y) => { [V[0], V[1]] = inside(x, y); }, { hollow: true, label: `the tip of ${P.vname}` });
  plot.onDrag = () => { draw(); F.notify('point'); };
  F.onChange(() => draw());
  const px = () => plot.X(1) - plot.X(0);
  const win = () => [[plot.vx0, plot.vx1], [plot.vy0, plot.vy1]];

  function stack(w, { color = 'teal', labels = true, bold = [], name = '' } = {}) {
    const [wx, wy] = win();
    const n = Math.hypot(w[0], w[1]);
    if (!(n > 1e-9) || px() / n < 3) return;
    for (const k of M.levelsIn(w, wx, wy)) {
      const seg = M.clipLine(w, k, wx, wy);
      if (!seg) continue;
      const b = bold.includes(k);
      plot.line(seg[0][0], seg[0][1], seg[1][0], seg[1][1], { color: b ? 'warn' : color, width: b ? 3 : k === 0 ? 2.2 : 1.3, alpha: b ? 1 : 0.85 });
      if (labels && (px() / n > 17 || k % 2 === 0)) {
        const [p, q] = seg[0][1] >= seg[1][1] ? seg : [seg[1], seg[0]];
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, inw = 14 / px();
        plot.text(k === 1 && name ? `${name} = 1` : String(k).replace('-', '−'), p[0] + ((q[0] - p[0]) / L) * inw, p[1] + ((q[1] - p[1]) / L) * inw, { color: b ? 'warn' : color, size: 11.5, weight: 650, align: 'center' });
      }
    }
  }

  function draw() {
    plot.clear();
    const g = plot.ctx;
    g.save(); plot._clip();
    const [wx, wy] = win();
    const Tm = tensor();
    // the component axes and a faint integer grid
    for (let x = Math.ceil(wx[0]); x <= wx[1]; x++) plot.line(x, wy[0], x, wy[1], { color: 'ink4', width: 1, alpha: x === 0 ? 0.8 : 0.28 });
    for (let y = Math.ceil(wy[0]); y <= wy[1]; y++) plot.line(wx[0], y, wx[1], y, { color: 'ink4', width: 1, alpha: y === 0 ? 0.8 : 0.28 });
    plot.text(P.axes[0], wx[1], 0, { color: 'ink3', dx: -8, dy: 11, align: 'right', size: 12 });
    plot.text(P.axes[1], 0, wy[1] - 0.12 * (wy[1] - wy[0]), { color: 'ink3', dx: -7, dy: 0, align: 'right', size: 12 });
    const rmax = 3 * Math.hypot(wx[1] - wx[0], wy[1] - wy[0]);
    if (P.indicatrix) {
      const S = M.sym(Tm);
      for (const d of M.nullDirs(S)) plot.line(-rmax * d[0], -rmax * d[1], rmax * d[0], rmax * d[1], { color: 'ink3', width: 1.4, dash: [5, 5] });
      for (const [lev, col] of [[1, 'gold'], [-1, 'violet']]) {
        const runs = M.conic(S, lev, rmax);
        runs.forEach((run) => plot.path(run, { color: col, width: 1.8, alpha: 0.9 }));
        if (P.indicatrixLabels && runs.length) {
          // label the curve where it is highest on the screen inside the window
          let best = null;
          for (const run of runs) for (const p of run) if (p[0] > wx[0] + 0.4 && p[0] < wx[1] - 0.4 && p[1] < wy[1] - 0.25 && p[1] > wy[0] + 0.25 && (!best || p[1] > best[1])) best = p;
          if (best) plot.text(`${tt}(X, X) = ${lev > 0 ? '1' : '−1'}`, best[0], best[1], { color: col, dy: -11, align: 'center', size: 11.5, weight: 650 });
        }
      }
    }
    let w = null, Vr = null;
    if (raiseMode) {
      w = cov();
      Vr = M.raise(Tm, w);
      stack(w, { labels: P.levelLabels, name: P.wname, bold: P.crossings && Vr ? M.crossed(w, Vr) : [] });
      if (Vr) plot.arrow(0, 0, Vr[0], Vr[1], { color: 'gold', width: 3.2, label: `${P.wname}♯`, ldx: 8, ldy: -10 });
    } else {
      if (P.feed && P.showU) {
        w = P.feed === 'second' ? M.feedSecond(Tm, U) : M.feedFirst(Tm, U);
        stack(w, { labels: P.levelLabels, bold: P.crossings && P.showV ? M.crossed(w, V) : [] });
      }
      if (P.showU) plot.arrow(0, 0, U[0], U[1], { color: 'accent', width: 3, label: P.uname, ldx: 8, ldy: -10 });
      if (P.showV) plot.arrow(0, 0, V[0], V[1], { color: 'gold', width: 3.2, label: P.vname, ldx: 8, ldy: -10 });
    }
    plot.point(0, 0, { color: 'ink2', r: 3 });
    g.restore();
    plot.drawHandles();

    if (P.readout === false) return;
    const list = P.readout === true ? (raiseMode ? ['T', 'inv', 'w', 'raised'] : ['T', 'U', 'V', 'low', 'TUV']) : P.readout;
    const want = (k) => list.includes(k);
    const bold = (n) => (/^[A-Za-z]$/.test(n) ? `\\mathbf ${n}` : `\\text{${n}}`);
    const plainN = (n) => (/^[A-Za-z]$/.test(n) ? n : `\\text{${n}}`);
    const rows = [], un = plainN(P.uname), vn = plainN(P.vname), ub = bold(P.uname), vb = bold(P.vname);
    if (want('T')) rows.push([`$${tt}_{\\mu\\nu}$`, mat(Tm)]);
    if (want('inv')) rows.push([`$${tt}^{\\mu\\nu}$`, mat(M.inv2(Tm))]);
    if (want('parts')) rows.push([`symmetric part $${tt}_{(\\mu\\nu)}$`, mat(M.sym(Tm))], [`antisymmetric part $${tt}_{[\\mu\\nu]}$`, mat(M.anti(Tm))]);
    if (raiseMode) {
      if (want('w')) rows.push([`$\\omega_\\nu$`, vec(w)]);
      if (want('raised')) rows.push([`$\\omega^\\mu = ${tt}^{\\mu\\nu}\\omega_\\nu$`, Vr ? vec(Vr) : '\\text{—}']);
      if (want('len') && Vr) rows.push([`$${tt}^{\\mu\\nu}\\omega_\\mu\\omega_\\nu$`, f3(M.pair(w, Vr))]);
    } else {
      if (want('U') && P.showU) rows.push([`$${un}^\\mu$`, vec(U)]);
      if (want('V') && P.showV) rows.push([`$${vn}^\\mu$`, vec(V)]);
      if (want('low') && P.showU) rows.push([P.feed === 'second' ? `$${tt}(\\cdot, ${ub})_\\mu = ${tt}_{\\mu\\nu}${un}^\\nu$` : `$${tt}(${ub}, \\cdot)_\\nu = ${un}^\\mu ${tt}_{\\mu\\nu}$`, vec(P.feed === 'second' ? M.feedSecond(Tm, U) : M.feedFirst(Tm, U))]);
      if (want('TUV') && P.showU && P.showV) rows.push([`$${tt}(${ub}, ${vb})$`, f3(M.bil(Tm, U, V))]);
      if (want('TVU') && P.showU && P.showV) rows.push([`$${tt}(${vb}, ${ub})$`, f3(M.bil(Tm, V, U))]);
      if (want('UU') && P.showU ) rows.push([`$${tt}(${ub}, ${ub})$`, f3(M.bil(Tm, U, U))]);
      if (want('VV') && P.showV ) rows.push([`$${tt}(${vb}, ${vb})$`, f3(M.bil(Tm, V, V))]);
      if (want('len')) for (const [n, X] of [[ub, U], [vb, V]]) if ((n === ub ? P.showU : P.showV)) rows.push([`$\\sqrt{|${tt}(${n}, ${n})|}$`, f3(Math.sqrt(Math.abs(M.bil(Tm, X, X))))]);
      if (want('angle')) {
        const s = M.signature(Tm), uu = M.bil(Tm, U, U), vv = M.bil(Tm, V, V);
        const c = M.bil(Tm, U, V) / Math.sqrt(uu * vv);
        rows.push(['angle between them', s.pos === 2 && uu > 0 && vv > 0 ? `${f3((Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI)}^\\circ` : '\\text{(needs a positive-definite metric)}']);
      }
      if (want('kind')) for (const [n, X] of [[ub, U], [vb, V]]) if ((n === ub ? P.showU : P.showV)) rows.push([`$${n}$ is`, `\\text{${M.kind(Tm, X)}}`]);
    }
    if (want('det') ) rows.push([`$\\det ${tt}_{\\mu\\nu}$`, f3(M.det2(Tm))]);
    if (want('sig') ) rows.push(['signature', `\\text{${M.sigText(M.signature(Tm))}}`]);
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(raiseMode
    ? `The teal stack is the covector $\\omega$; the gold arrow is the vector $\\omega^\\mu = ${tt}^{\\mu\\nu}\\omega_\\nu$ the inverse metric makes from it. Axes are components: their paper lengths and angles mean nothing — the metric decides lengths.`
    : `Axes are components ($${P.vname}^1$ across, $${P.vname}^2$ up); their paper lengths and angles mean nothing — the tensor decides. The teal lines are the covector $${tt}(${P.uname}, \\cdot)$; $${tt}(${P.uname}, ${P.vname})$ is the signed number of them the gold arrow crosses (bold).`);
  return { get: (k) => (k === 'point' ? { x: V[0], y: V[1] } : F.params[k]) };
}

// ── chart: a metric field on a coordinate chart ──────────────────────────────
const EPS = { cartesian: 0.25, polar: 0.22, sphere: 0.13, halfplane: 0.16, minkowski: 0.2, skew: 0.22 };
const LABEL = { cartesian: 'Cartesian (x, y)', polar: 'Polar (r, θ)', sphere: 'The 2-sphere (θ, φ)', halfplane: 'The half-plane', minkowski: 'Minkowski (t, x)', skew: 'Skewed axes (u, v)' };
// grid points for the ellipses, in chart coordinates
function gridPoints(chart) {
  const pts = [];
  const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
  if (chart === 'polar') for (const r of range(0.5, 3.5, 0.5)) for (const th of range(0.25, 2.25, 0.5)) pts.push([r, th]);
  else if (chart === 'sphere') for (const ph of range(Math.PI / 12, 2 * Math.PI, Math.PI / 6)) for (const th of range(Math.PI / 12, Math.PI, Math.PI / 6)) pts.push([ph, th]);
  else if (chart === 'halfplane') for (const x of range(-1.5, 1.5, 0.5)) for (const y of range(0.25, 2.25, 0.5)) pts.push([x, y]);
  else for (const a of range(-1.6, 1.6, 0.8)) for (const b of range(-0.8, 0.8, 0.8)) pts.push([a, b]);
  return pts;
}
// the chart's natural component order for the readout (sphere: θ, φ; Minkowski: t, x) and the TeX names
const ORDER = {
  cartesian: { swap: false, tex: ['x', 'y'] }, polar: { swap: false, tex: ['r', '\\theta'] }, sphere: { swap: true, tex: ['\\theta', '\\phi'] },
  halfplane: { swap: false, tex: ['x', 'y'] }, minkowski: { swap: true, tex: ['t', 'x'] }, skew: { swap: false, tex: ['u', 'v'] },
};

function mountChart(F, P) {
  const { canvas, box } = F.canvas({ aspect: P.space ? 'wide' : P.aspect, label: P.alt || 'A coordinate chart with, at grid points, the small steps of one fixed length the metric allows' });
  if (P.charts?.length) F.choice({ key: 'chart', label: 'Chart', options: P.charts.map((c) => [c, LABEL[c]]), value: P.chart, explain: 'The same idea on another space: each ellipse is every small step of one fixed true length.' });
  else F.params.chart = P.chart;
  const o = { R: P.R, alpha: (P.skew * Math.PI) / 180 };
  const toPlot = (c, a, b) => (c === 'sphere' ? [a, -b] : [a, b]);
  const fromPlot = (c, x, y) => (c === 'sphere' ? [x, -y] : [x, y]);
  const startProbe = (c) => (P.probe && c === P.chart ? P.probe.slice() : { cartesian: [0.6, 0.4], polar: [2, 1], sphere: [2, 1], halfplane: [0.5, 1], minkowski: [0.4, 0.4], skew: [0.6, 0.4] }[c]);
  let probe = startProbe(P.chart);
  const seg = P.segment ? P.segment.map((p) => p.slice()) : null;
  const chartPlot = new Plot(canvas, { x: [0, 1], y: [0, 1], equal: true, grid: true, axes: true, axesAt: 'edge' });
  const spacePlot = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, axes: false });
  const clampTo = (c, a, b) => {
    const [[a0, a1], [b0, b1]] = M.CHARTS[c].window, e = 0.02;
    return [Math.max(a0 + e, Math.min(a1 - e, a)), Math.max(b0 + e, Math.min(b1 - e, b))];
  };
  if (P.dragProbe) chartPlot.handle(() => toPlot(F.params.chart, ...probe), (x, y) => { probe = clampTo(F.params.chart, ...fromPlot(F.params.chart, x, y)); }, { hollow: true, label: 'the probe P' });
  if (seg) seg.forEach((p, i) => chartPlot.handle(() => toPlot(F.params.chart, ...p), (x, y) => { [p[0], p[1]] = clampTo(F.params.chart, ...fromPlot(F.params.chart, x, y)); }, { hollow: true, label: `end ${i + 1} of the segment` }));
  chartPlot.onDrag = () => draw();
  F.onChange((key) => { if (key === 'chart') probe = startProbe(F.params.chart); draw(); });

  // the set of steps of true length ε about the chart point c (in plot coordinates)
  function indicatrix(pl, chart, a, b, eps, style) {
    const g = M.chartMetric(chart, a, b, o);
    if (!g) return;
    const [x, y] = toPlot(chart, a, b);
    const flip = chart === 'sphere' ? -1 : 1;
    const levels = M.signature(g).neg ? [eps * eps, -eps * eps] : [eps * eps];
    const rmax = levels.length > 1 ? 2.4 * eps : 1e3;
    for (const lev of levels) for (const run of M.conic(g, lev, rmax)) pl.path(run.map(([u, v]) => [x + u, y + flip * v]), { ...style, color: lev < 0 ? 'violet' : style.color });
    if (levels.length > 1) for (const d of M.nullDirs(g)) pl.line(x - 2.4 * eps * d[0], y - 2.4 * eps * d[1], x + 2.4 * eps * d[0], y + 2.4 * eps * d[1], { color: 'ink3', width: 1, dash: [3, 3], alpha: style.alpha ?? 1 });
  }

  function draw() {
    const chart = F.params.chart, C = M.CHARTS[chart];
    const both = !!(P.space && C.space);
    const ctx = canvas.getContext('2d');
    const W = canvas.clientWidth || 600, small = W < 560;
    const want = both && small ? '10 / 13' : '';
    if (box.style.aspectRatio !== want) box.style.aspectRatio = want;
    const H = canvas.clientHeight || W / 2;
    const [[a0, a1], [b0, b1]] = C.window;
    const [x0, y0] = toPlot(chart, a0, b0), [x1, y1] = toPlot(chart, a1, b1);
    chartPlot.setView([Math.min(x0, x1), Math.max(x0, x1)], [Math.min(y0, y1), Math.max(y0, y1)]);
    chartPlot.o.yfmt = chart === 'sphere' ? (t) => tickLabel(Math.abs(t) < 1e-12 ? 0 : -t) : null;
    chartPlot.o.xlabel = C.names[0] + (chart === 'sphere' ? ' (rad)' : '');
    chartPlot.o.ylabel = '';
    if (both && small) { spacePlot.o.pad = { l: 6, r: 6, t: 6, b: H * 0.5 + 4 }; chartPlot.o.pad = { l: 36, r: 10, t: H * 0.5 + 18, b: 32 }; }
    else if (both) { spacePlot.o.pad = { l: 6, r: W / 2 + 6, t: 6, b: 6 }; chartPlot.o.pad = { l: W / 2 + 40, r: 10, t: 14, b: 34 }; }
    else chartPlot.o.pad = { l: 40, r: 12, t: 14, b: 34 };
    chartPlot.resize(); chartPlot.refreshTheme();
    ctx.clearRect(0, 0, chartPlot.w, chartPlot.h);
    const eps = P.eps || EPS[chart];
    const style = { color: 'gold', width: 1.5, alpha: 0.85 };

    if (both) {
      // the true plane: the chart's grid lines mapped into it, and every indicatrix a circle of radius ε
      const S = (a, b) => C.space(a, b, o.R, o.alpha);
      const corners = [];
      for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) corners.push(S(a0 + ((a1 - a0) * i) / 20, b0 + ((b1 - b0) * j) / 20));
      const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]), m = 0.3;
      spacePlot.setView([Math.min(...xs) - m, Math.max(...xs) + m], [Math.min(...ys) - m, Math.max(...ys) + m]);
      spacePlot.resize(); spacePlot.refreshTheme();
      ctx.save(); ctx.beginPath(); ctx.rect(spacePlot.L, spacePlot.T, spacePlot.R - spacePlot.L, spacePlot.B - spacePlot.T); ctx.clip();
      const lines = (fixedA, v) => { const pts = []; for (let i = 0; i <= 120; i++) { const t = (fixedA ? b0 + ((b1 - b0) * i) / 120 : a0 + ((a1 - a0) * i) / 120); pts.push(fixedA ? S(v, t) : S(t, v)); } spacePlot.path(pts, { color: 'accent2', width: 1, alpha: 0.45 }); };
      for (const t of Plot.ticks(a0, a1, 8)) lines(true, t);
      for (const t of Plot.ticks(b0, b1, 6)) lines(false, t);
      if (P.ellipses) for (const [a, b] of gridPoints(chart)) { const [X, Y] = S(a, b); spacePlot.circle(X, Y, eps, { color: 'gold', width: 1.5, alpha: 0.85 }); }
      if (seg) { const pts = []; for (let i = 0; i <= 200; i++) { const t = i / 200; pts.push(S(seg[0][0] + t * (seg[1][0] - seg[0][0]), seg[0][1] + t * (seg[1][1] - seg[0][1]))); } spacePlot.path(pts, { color: 'accent', width: 2.6 }); }
      const [PX, PY] = S(...probe);
      spacePlot.circle(PX, PY, eps, { color: 'warn', width: 2.6 });
      spacePlot.point(PX, PY, { color: 'warn', r: 3.5, label: 'P' });
      ctx.restore();
      spacePlot.text('the true plane', spacePlot.L + 6, spacePlot.T + 12, { screen: true, color: 'ink2', size: small ? 10.5 : 12 });
      ctx.save(); ctx.strokeStyle = chartPlot.col.line2; ctx.beginPath();
      if (small) { ctx.moveTo(6, H * 0.5); ctx.lineTo(W - 6, H * 0.5); } else { ctx.moveTo(W / 2, 6); ctx.lineTo(W / 2, chartPlot.h - 6); }
      ctx.stroke(); ctx.restore();
    }

    chartPlot.grid(); chartPlot.axes();
    chartPlot.text(C.names[1] + (chart === 'sphere' ? ' (rad, down)' : chart === 'polar' ? ' (rad)' : ''), chartPlot.L + 6, chartPlot.T + 10, { screen: true, color: 'ink2', size: 12 });
    ctx.save(); ctx.beginPath(); ctx.rect(chartPlot.L, chartPlot.T, chartPlot.R - chartPlot.L, chartPlot.B - chartPlot.T); ctx.clip();
    if (P.ellipses) for (const [a, b] of gridPoints(chart)) indicatrix(chartPlot, chart, a, b, eps, style);
    if (seg) {
      const [p0, p1] = seg.map((p) => toPlot(chart, ...p));
      chartPlot.line(p0[0], p0[1], p1[0], p1[1], { color: 'accent', width: 2.6 });
    }
    indicatrix(chartPlot, chart, ...probe, eps, { color: 'warn', width: 2.6 });
    chartPlot.point(...toPlot(chart, ...probe), { color: 'warn', r: 3.5, label: 'P' });
    ctx.restore();
    chartPlot.drawHandles();

    if (P.readout === false) return;
    const wantR = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
    const rows = [];
    const { swap, tex: nm } = ORDER[chart];
    const g = M.chartMetric(chart, ...probe, o);
    const nat = (A) => (A && swap ? [[A[1][1], A[1][0]], [A[0][1], A[0][0]]] : A);
    const pr = swap ? [probe[1], probe[0]] : probe;
    if (wantR('P')) rows.push([`P: $(${nm[0]}, ${nm[1]})$`, vec(pr)]);
    if (wantR('g')) rows.push([`$g_{\\mu\\nu}$ at P, order $(${nm[0]}, ${nm[1]})$`, mat(nat(g))]);
    if (wantR('lengths') && g) rows.push([`$|\\partial_{${nm[0]}}|,\\ |\\partial_{${nm[1]}}|$`, vec(nat(g) ? [Math.sqrt(Math.abs(nat(g)[0][0])), Math.sqrt(Math.abs(nat(g)[1][1]))] : [NaN, NaN])]);
    if (wantR('sqrtg') && g) rows.push(['$\\sqrt{|g|}$', f3(Math.sqrt(Math.abs(M.det2(g))))]);
    if (wantR('seg') && seg) {
      const L = M.segmentLength(chart, seg[0], seg[1], o);
      if (chart === 'minkowski') rows.push(['$\\Delta s^2$ along the segment', f3(L.s2)], ['kind', `\\text{${Math.abs(L.s2) < 1e-6 ? 'null' : L.s2 < 0 ? 'timelike' : 'spacelike'}}`]);
      else rows.push(['length with the metric, $\\int ds$', f3(L.length)]);
      rows.push(['naive $\\sqrt{\\Delta a^2 + \\Delta b^2}$ of the coordinates', f3(L.naive)]);
    }
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(`Each gold ellipse is every small step of one true length $\\varepsilon$ from its centre, drawn in the chart’s own coordinates — the metric’s “unit circle”, enlarged. Where the chart stretches the space, the ellipse is squeezed; where an ellipse is a circle, the chart is undistorted there. In Minkowski space the steps of length $\\varepsilon$ form hyperbolae (gold spacelike, violet timelike) about the light cone (dashed).`);
  return { get: (k) => (k === 'point' ? { x: probe[0], y: probe[1] } : F.params[k]) };
}

export function validate(P) {
  const p = [];
  const isVec = (v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite);
  const isMat = (A) => Array.isArray(A) && A.length === 2 && A.every(isVec);
  const plain = (s) => typeof s !== 'string' || !/\$|\\[A-Za-z]|_[{A-Za-z0-9]|\^[{A-Za-z0-9]/.test(s);
  if (!['form', 'chart'].includes(P.mode)) p.push(`ten-metric: unknown mode “${P.mode}” (use form or chart)`);
  if (P.mode === 'form') {
    if (!isMat(P.T)) p.push('ten-metric: T must be [[T11, T12], [T21, T22]]');
    if (![false, 'full', 'sym', 'product'].includes(P.sliders)) p.push('ten-metric: sliders must be false, full, sym or product');
    if (P.sliders === 'sym' && isMat(P.T) && P.T[0][1] !== P.T[1][0]) p.push('ten-metric: sliders: sym needs a symmetric T');
    if (P.sliders && P.presets) p.push('ten-metric: use sliders or presets, not both');
    if (P.sliders && isMat(P.T) && P.T.flat().some((v) => Math.abs(v) > P.range)) p.push('ten-metric: T’s entries must lie within ±range for the sliders');
    if (P.presets && !(Array.isArray(P.presets) && P.presets.length && P.presets.every((q) => typeof q.label === 'string' && isMat(q.T)))) p.push('ten-metric: presets must be [{ label, T: [[…], […]] }]');
    if (P.presets?.length && JSON.stringify(P.presets[0].T) !== JSON.stringify(P.T)) p.push('ten-metric: the first preset must be T');
    if (!isVec(P.U) || !isVec(P.V)) p.push('ten-metric: U and V must be [x, y]');
    if (![false, 'first', 'second'].includes(P.feed)) p.push('ten-metric: feed must be first, second or false');
    if (P.covector !== null && !isVec(P.covector)) p.push('ten-metric: covector must be [ω₁, ω₂] or null');
    if (isVec(P.covector) && isMat(P.T) && !P.sliders && !P.presets && Math.abs(M.det2(P.T)) < 1e-9) p.push('ten-metric: a covector cannot be raised with a degenerate T');
    if (isVec(P.covector) && P.covSliders && P.covector.some((v) => Math.abs(v) > P.range)) p.push('ten-metric: covector components must lie within ±range');
    if (P.product && !(Array.isArray(P.product) && P.product.length === 2 && P.product.every(isVec))) p.push('ten-metric: product must be [[ω₁, ω₂], [η₁, η₂]]');
    if (!(Array.isArray(P.axes) && P.axes.length === 2)) p.push('ten-metric: axes must be two labels');
    if (!(P.view > 0.5 && P.view < 30)) p.push('ten-metric: view (the half-height) must lie in (0.5, 30)');
    const KR = ['T', 'inv', 'parts', 'U', 'V', 'low', 'TUV', 'TVU', 'UU', 'VV', 'len', 'angle', 'sig', 'det', 'kind', 'w', 'raised'];
    if (!(P.readout === true || P.readout === false || (Array.isArray(P.readout) && P.readout.every((k) => KR.includes(k))))) p.push(`ten-metric: readout must be true, false or a list of ${KR.join(' ')}`);
    for (const s of [P.uname, P.vname, P.wname, ...(P.axes || [])]) if (!plain(s)) p.push(`ten-metric: canvas label “${s}” must be plain text (Unicode), not TeX`);
    if (typeof P.tname !== 'string' || !/^[A-Za-z]$|^\\[a-zA-Z]+$/.test(P.tname)) p.push('ten-metric: tname must be one letter or a TeX command such as \\eta');
  }
  if (P.mode === 'chart') {
    const ok = (c) => Object.keys(M.CHARTS).includes(c);
    if (!ok(P.chart)) p.push(`ten-metric: unknown chart “${P.chart}” (use ${Object.keys(M.CHARTS).join(', ')})`);
    if (P.charts && !(Array.isArray(P.charts) && P.charts.every(ok) && P.charts.includes(P.chart))) p.push('ten-metric: charts must list known charts, including chart');
    if (P.probe !== null && !isVec(P.probe)) p.push('ten-metric: probe must be [a, b] in chart coordinates');
    if (isVec(P.probe) && ok(P.chart)) {
      const [[a0, a1], [b0, b1]] = M.CHARTS[P.chart].window;
      if (P.probe[0] < a0 || P.probe[0] > a1 || P.probe[1] < b0 || P.probe[1] > b1) p.push(`ten-metric: the probe lies outside the ${P.chart} chart’s window [${a0}, ${a1}] × [${b0}, ${b1}]`);
      else if (!M.chartMetric(P.chart, ...P.probe, { R: P.R })) p.push('ten-metric: the probe sits where the chart’s metric is singular');
    }
    if (P.segment && !(Array.isArray(P.segment) && P.segment.length === 2 && P.segment.every(isVec))) p.push('ten-metric: segment must be [[a, b], [a, b]]');
    if (P.eps !== null && !(P.eps > 0 && P.eps < 1)) p.push('ten-metric: eps must lie in (0, 1)');
    if (!(P.R > 0)) p.push('ten-metric: R must be positive');
    const KR = ['P', 'g', 'lengths', 'sqrtg', 'seg'];
    if (!(P.readout === true || P.readout === false || (Array.isArray(P.readout) && P.readout.every((k) => KR.includes(k))))) p.push(`ten-metric: readout must be true, false or a list of ${KR.join(' ')}`);
  }
  return p;
}
