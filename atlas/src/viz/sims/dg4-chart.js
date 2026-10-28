// A two-dimensional metric drawn on its own coordinate chart (a across, b
// up), Riemannian or Lorentzian. The geometry is model/dg4-metric2d.js,
// tested in test/dg4-metric2d.test.mjs.
//
// At grid points the chart carries what the metric says about small steps:
// Riemannian, the "unit circle" of steps of one fixed length ε (a Tissot
// ellipse); Lorentzian, the light cone — the two null directions, the future
// half shaded. A probe P (drag it) reads the metric, the Christoffel symbols
// (from the formula, and optionally checked by finite differences of g
// alone) and the curvature K = R/2.
//
//   mode 'chart'     — the field of ellipses or cones and the probe.
//   mode 'geodesic'  — the solution of ẍ^μ + Γ^μ_νλ ẋ^ν ẋ^λ = 0 from P
//     (RK4), launched at `heading` degrees from ê_a toward ê_b (Riemannian, unit
//     speed) or at `speed` v relative to the local observer whose velocity is
//     orthogonal to ∂_a (Lorentzian; |v| = 1 is a light ray), followed for an
//     affine `length` (arc length or proper time). `fan` adds that many more
//     launched `spread` degrees (or speed units) apart. Readouts follow the
//     momentum p_μ = g_μν ẋ^ν of each coordinate the metric does not contain.
//   mode 'transport' — a vector at P carried to Q along the two routes round
//     the coordinate rectangle (a first, then b; or b first): flat metrics
//     return the same arrow, curved ones do not. Riemannian: the vector starts
//     at `angle` degrees from ê_a; Lorentzian: it is the 4-velocity of `speed`.
//   mode 'vary'      — the geodesic from P (as above) and the same path
//     pushed sideways by α sin(πλ/Λ) along its unit normal, ends fixed; the
//     readout and the optional panel give the length (or proper time) against α.
//
//   { type: 'dg4-chart', params: {
//       metric: 'sphere',            // plane polar sphere stereo halfplane cylinder torus arm minkowski ring rindler desitter schwarzschild ef
//       metrics: null,               // a list to offer as a choice (key 'metric')
//       k: null,                     // the metric's parameter (sphere/cylinder radius, ring ω, de Sitter H, Schwarzschild M); null = default
//       mode: 'chart', view: null,   // view: { a: [min, max], b: [min, max] } (default per metric)
//       P: null, Q: null, drag: true,   // P, Q as [a, b]; drag: false fixes them
//       heading: 30, speed: 0, length: 4, fan: 0, spread: 15,
//       angle: 90, alpha: 0, alphaMax: 0.3,
//       sliders: null,               // any of heading speed length alpha angle k (default: what the mode needs; none when drag: false)
//       field: true, cells: 8,       // ellipses or cones; about how many across
//       eps: null,                   // the ellipses' step length (chart units at a unit metric)
//       panel: false,                // vary mode: the length-against-α panel
//       readout: true,               // false, or a list of: P g gamma check K conserved norm length end turn area F
//       curves: [],                  // extra curves: [{ pts: [[a, b], …], color, width, dash, label }]
//       points: [], lines: [],       // [{ a, b, label, color }]; lines: [{ a } or { b }, label, color, dash]
//       labels: true, equal: true, aspect: '',
//       probe: true } }                // chart mode: false hides P (and its drag handle)
//
// A picture must not show its answer: readout: false (or a shorter list) when
// a question asks for a number the readout would print.

import { Plot, tickLabel } from '../plot.js';
import * as D from '../model/dg4-metric2d.js';

export const defaults = {
  metric: 'sphere', metrics: null, k: null, mode: 'chart', view: null, P: null, Q: null, drag: true,
  heading: 30, speed: 0, length: 4, fan: 0, spread: 15, angle: 90, alpha: 0, alphaMax: 0.3,
  sliders: null, field: true, cells: 8, eps: null, panel: false, readout: true,
  curves: [], points: [], lines: [], labels: true, equal: true, aspect: '', lengthMax: null, probe: true,
};

const MODES = ['chart', 'geodesic', 'transport', 'vary'];
const SLIDERS = ['heading', 'speed', 'length', 'alpha', 'angle', 'k'];
const READS = ['P', 'g', 'gamma', 'check', 'K', 'torsion', 'conserved', 'norm', 'length', 'end', 'turn', 'area', 'F'];
const PI = Math.PI, DEG = PI / 180;
const P0 = {
  plane: [0, 0], polar: [1.5, 0.3], sphere: [1.2, 1.0], stereo: [0.5, 0.3], halfplane: [0, 1], cylinder: [1, 0], torus: [1, 0],
  arm: [0, 1], minkowski: [0, -1], ring: [1, 0.4], rindler: [1, 0], desitter: [0, 0], schwarzschild: [6, 0], ef: [5, 0], compass: [1.2, 1.0], stretch: [-1, -0.5],
};
const Q0 = { plane: [1.5, 1], polar: [2.5, 1.2], sphere: [2.4, 1.7], stereo: [1.2, 1], halfplane: [1.2, 1.8], cylinder: [3, 1], torus: [2.5, 1.2], arm: [1, 2], minkowski: [1, 1], ring: [2, 1.5], rindler: [2, 1], desitter: [1, 1], schwarzschild: [9, 3], ef: [7, 3], compass: [2.4, 1.7], stretch: [1.5, 1] };
const K_RANGE = { sphere: [0.5, 2], stereo: [0.5, 2], cylinder: [0.5, 2], compass: [0.5, 2], stretch: [-1, 1], ring: [0, 0.95], desitter: [0.2, 2], schwarzschild: [0.5, 3], ef: [0.5, 2] };
// where a chart ends inside the default view: a line, and which side is outside it
const EDGE = {
  polar: () => [{ a: 0, side: -1, label: 'r = 0' }],
  sphere: () => [{ b: 0, side: -1, label: 'north pole' }, { b: PI, side: 1, label: 'south pole' }],
  compass: () => [{ b: 0, side: -1, label: 'north pole' }, { b: PI, side: 1, label: 'south pole' }],
  halfplane: () => [{ b: 0, side: -1, label: 'y = 0 (infinitely far)' }],
  rindler: () => [{ a: 0, side: -1, label: 'ρ = 0 (horizon)' }],
  schwarzschild: (k) => [{ a: 2 * k, side: -1, label: 'r = 2M' }],
  ef: (k) => [{ a: 2 * k, side: 0, label: 'r = 2M' }],
};

const num = (x, n = 3) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (Math.abs(x) < 5e-12) return '0';
  const a = Math.abs(x);
  if (a >= 1e4 || a < 1e-3) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  return String(+x.toPrecision(n));
};

export function validate(P0in) {
  const P = { ...defaults, ...P0in }, out = [];
  const M = D.METRICS[P.metric];
  if (!M) return [`dg4-chart: unknown metric “${P.metric}” (use ${Object.keys(D.METRICS).join(', ')})`];
  if (P.metrics) {
    for (const m of P.metrics) if (!D.METRICS[m]) out.push(`dg4-chart: unknown metric “${m}” in metrics`);
    if (!P.metrics.includes(P.metric)) out.push('dg4-chart: metric must be one of metrics');
  }
  if (!MODES.includes(P.mode)) out.push(`dg4-chart: unknown mode “${P.mode}” (use ${MODES.join(', ')})`);
  const k = D.kOf(M, P.k);
  for (const [name, pt] of [['P', P.P], ['Q', P.Q]]) {
    if (pt == null) continue;
    if (!Array.isArray(pt) || pt.length !== 2 || !pt.every(Number.isFinite)) { out.push(`dg4-chart: ${name} must be [a, b]`); continue; }
    if (!M.valid(pt[0], pt[1], k)) out.push(`dg4-chart: ${name} = (${pt}) lies outside the ${P.metric} chart`);
  }
  if (P.view) for (const ax of ['a', 'b']) if (!(Array.isArray(P.view[ax]) && P.view[ax][1] > P.view[ax][0])) out.push(`dg4-chart: view.${ax} must be [min, max] with min < max`);
  if (!(P.heading >= -180 && P.heading <= 180)) out.push('dg4-chart: heading must lie in [−180, 180]');
  if (!(P.angle >= -180 && P.angle <= 180)) out.push('dg4-chart: angle must lie in [−180, 180]');
  if (!(P.speed >= -1 && P.speed <= 1)) out.push('dg4-chart: speed must lie in [−1, 1]');
  if (!(P.length > 0 && P.length <= 80)) out.push('dg4-chart: length must lie in (0, 80]');
  if (!(Number.isInteger(P.fan) && P.fan >= 0 && P.fan <= 12)) out.push('dg4-chart: fan must be a whole number 0–12');
  if (!(P.alphaMax > 0) || Math.abs(P.alpha) > P.alphaMax + 1e-12) out.push('dg4-chart: alpha must lie within ±alphaMax');
  for (const s of P.sliders || []) if (!SLIDERS.includes(s)) out.push(`dg4-chart: unknown slider “${s}”`);
  if ((P.sliders || []).includes('k') && !K_RANGE[P.metric]) out.push(`dg4-chart: the ${P.metric} metric has no parameter to slide`);
  if (P.k != null && K_RANGE[P.metric] && (P.k < K_RANGE[P.metric][0] || P.k > K_RANGE[P.metric][1])) out.push(`dg4-chart: k must lie in [${K_RANGE[P.metric]}]`);
  if (Array.isArray(P.readout)) for (const r of P.readout) if (!READS.includes(r)) out.push(`dg4-chart: unknown readout “${r}”`);
  for (const c of P.curves || []) if (!Array.isArray(c.pts) || !c.pts.every((p) => Array.isArray(p) && p.length === 2)) out.push('dg4-chart: each curve needs pts: [[a, b], …]');
  for (const s of [...(P.curves || []), ...(P.points || []), ...(P.lines || [])].map((x) => x.label).filter(Boolean)) if (/\$|\\[A-Za-z]/.test(s)) out.push(`dg4-chart: label “${s}” is drawn on the canvas — plain text, not TeX`);
  return out;
}

export function mount(F, P) {
  const compact = F.compact;
  const wantPanel = P.mode === 'vary' && P.panel && !compact;
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A coordinate chart with the metric drawn at grid points and paths across it' });
  const panelCv = wantPanel ? F.canvas({ aspect: 'wide', label: 'Length or proper time of the varied path against the amplitude α' }) : null;

  const list = P.metrics || null;
  if (list && list.length > 1) F.choice({ key: 'metric', label: 'Metric', options: list.map((m) => [m, D.METRICS[m].label]), value: P.metric });
  else F.params.metric = P.metric;

  const defaultSliders = { chart: [], geodesic: ['heading', 'speed', 'length'], transport: ['angle', 'speed'], vary: ['alpha'] }[P.mode];
  const sl = P.sliders || (P.drag === false ? [] : defaultSliders);   // a fixed picture (drag: false) gets no sliders unless asked
  const ctl = {};
  const mk = (key, o) => { if (sl.includes(key)) ctl[key] = F.slider({ key, ...o }); else F.params[key] = o.value; };
  mk('heading', { label: 'Launch direction at P', min: -180, max: 180, step: 1, value: P.heading, unit: '^\\circ', explain: 'Measured with the metric: 0° along $\\hat e_a$ (the first coordinate increasing), 90° along the unit vector at right angles to it.' });
  mk('speed', { label: 'Launch speed $v$', min: -1, max: 1, step: 0.01, value: P.speed, explain: 'Relative to the local observer at P who is at rest in the chart’s first coordinate (c = 1). At ±1 the path is a light ray.' });
  mk('angle', { label: 'Vector at P', min: -180, max: 180, step: 1, value: P.angle, unit: '^\\circ', explain: 'Its direction, measured with the metric from $\\hat e_a$.' });
  const lmax = P.lengthMax || Math.max(P.length * 2, 1);
  mk('length', { label: 'How far to follow it', min: Math.min(0.1, P.length), max: lmax, step: lmax / 200, value: P.length, explain: 'The affine parameter: distance along a Riemannian geodesic, proper time along a timelike one.' });
  mk('alpha', { label: 'Push sideways by $\\alpha$', min: -P.alphaMax, max: P.alphaMax, step: P.alphaMax / 100, value: P.alpha, explain: 'The varied path is the geodesic moved by $\\alpha\\sin(\\pi\\lambda/\\Lambda)$ along its unit normal: zero at both ends.' });
  if (sl.includes('k') && K_RANGE[P.metric]) {
    const M0 = D.METRICS[P.metric], [lo, hi] = K_RANGE[P.metric];
    ctl.k = F.slider({ key: 'k', label: `Parameter ${M0.kName}`, min: lo, max: hi, step: (hi - lo) / 100, value: D.kOf(M0, P.k), explain: { radius: 'The radius.', 'κ': 'The connection coefficient $\\Gamma^x{}_{xx} = \\kappa$: how fast a carried vector’s x-part shrinks per unit of x.', H: 'The expansion rate $H$ (c = 1): the scale factor is $e^{Ht}$.', M: 'The mass $M$ in geometric units ($G = c = 1$): the horizon sits at $r = 2M$.', 'ω': 'The ring’s rotation rate (radius 1, c = 1): its rim moves at $\\omega$.' }[M0.kName] || '' });
  } else F.params.k = P.k;

  const cur = () => D.METRICS[F.params.metric];
  const kk = () => D.kOf(cur(), F.params.k);
  let Pp = (P.P || P0[P.metric]).slice(), Qq = (P.Q || Q0[P.metric]).slice();
  const showFor = () => {
    const L = cur().lorentz;
    if (ctl.heading) ctl.heading.node.hidden = L;
    if (ctl.angle) ctl.angle.node.hidden = L;
    if (ctl.speed) ctl.speed.node.hidden = !L;
  };
  showFor();

  const viewOf = () => (P.view && F.params.metric === P.metric ? P.view : cur().view);
  const flip = () => !!cur().flipB;
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], equal: P.equal !== false });
  const panel = panelCv ? new Plot(panelCv.canvas, { x: [-P.alphaMax, P.alphaMax], y: [0, 1], xlabel: 'α', yticks: 4 }) : null;
  const toY = (b) => (flip() ? -b : b), fromY = (y) => (flip() ? -y : y);
  const clampIn = (a, b, prev) => {
    const V = viewOf(), M = cur();
    const x = Math.min(V.a[1], Math.max(V.a[0], a)), y = Math.min(V.b[1], Math.max(V.b[0], b));
    return M.valid(x, y, kk()) ? [x, y] : prev;
  };
  if (P.drag !== false && !(P.mode === 'chart' && P.probe === false)) {
    plot.handle(() => [Pp[0], toY(Pp[1])], (x, y) => { Pp = clampIn(x, fromY(y), Pp); }, { hollow: true, label: 'the point P' });
    if (P.mode === 'transport') plot.handle(() => [Qq[0], toY(Qq[1])], (x, y) => { Qq = clampIn(x, fromY(y), Qq); }, { hollow: true, label: 'the point Q' });
    plot.onDrag = () => { draw(); F.notify('point'); };
  }
  F.onChange((key) => {
    if (key === 'metric') { Pp = P0[F.params.metric].slice(); Qq = Q0[F.params.metric].slice(); showFor(); }
    draw();
  });

  // periodic coordinates: wrap into the view and break the line where it jumps
  function wrap(pts) {
    const M = cur(), V = viewOf(), per = M.periodic || {};
    const out = [];
    let prev = null;
    for (const p of pts) {
      let [a, b] = p;
      if (per.a) a = V.a[0] + ((((a - V.a[0]) % per.a) + per.a) % per.a);
      if (per.b) b = V.b[0] + ((((b - V.b[0]) % per.b) + per.b) % per.b);
      if (prev && (Math.abs(a - prev[0]) > (per.a || Infinity) / 2 || Math.abs(b - prev[1]) > (per.b || Infinity) / 2)) out.push([NaN, NaN]);
      out.push([a, toY(b)]);
      prev = [a, b];
    }
    return out;
  }

  const gammaName = (M, l, m, n) => { const nm = [M.a[0], M.b[0]]; return `\\Gamma^{${nm[l]}}{}_{${nm[m]}${nm[n]}}`; };
  let panelKey = '', panelCurve = null;

  function draw() {
    const M = cur(), k = kk(), V = viewOf();
    plot.o.xlabel = M.a[1]; plot.o.ylabel = M.b[1];
    plot.o.yfmt = flip() ? (t) => tickLabel(Math.abs(t) < 1e-12 ? 0 : -t) : null;
    plot.setView(V.a, flip() ? [-V.b[1], -V.b[0]] : V.b);
    plot.clear();
    const vx0 = plot.vx0, vx1 = plot.vx1, vy0 = plot.vy0, vy1 = plot.vy1;

    // where the chart ends
    for (const e of (EDGE[F.params.metric] || (() => []))(k)) {
      if (e.a !== undefined) {
        if (e.side) plot.rect(e.side < 0 ? vx0 : e.a, vy0, e.side < 0 ? e.a - vx0 : vx1 - e.a, vy1 - vy0, { color: 'ink4', alpha: 0.18, stroke: false });
        plot.line(e.a, vy0, e.a, vy1, { color: 'ink3', width: 1.4, dash: [6, 4] });
        if (P.labels !== false) plot.text(e.label, e.a, vy1, { color: 'ink2', size: 11, dx: 5, dy: 10 });
      } else {
        const y = toY(e.b);
        const lo = Math.min(y, e.side * (flip() ? -1 : 1) < 0 ? vy0 : vy1), hi = Math.max(y, e.side * (flip() ? -1 : 1) < 0 ? vy0 : vy1);
        if (e.side) plot.rect(vx0, lo, vx1 - vx0, hi - lo, { color: 'ink4', alpha: 0.18, stroke: false });
        plot.line(vx0, y, vx1, y, { color: 'ink3', width: 1.4, dash: [6, 4] });
        if (P.labels !== false) plot.text(e.label, vx1, y, { color: 'ink2', size: 11, dx: -5, dy: (y > (vy0 + vy1) / 2 ? 10 : -10), align: 'right' });
      }
    }

    // the field of ellipses or light cones
    if (P.field !== false) {
      // cells about square on the screen, whatever the two axes' scales
      const sx = (plot.R - plot.L) / (vx1 - vx0), sy = (plot.B - plot.T) / (vy1 - vy0);
      const n = Math.max(3, P.cells || 8), cw = (vx1 - vx0) / n;
      const rows = Math.max(2, Math.round(((vy1 - vy0) * sy) / (cw * sx)));
      const ch = (vy1 - vy0) / rows;
      const cap = 0.46 * Math.min(cw, ch), capPx = 0.46 * Math.min(cw * sx, ch * sy);
      // ε: the given step length, or one that makes the typical ellipse about a third of a cell
      let eps = P.eps;
      if (!eps) {
        const sz = [];
        for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
          const a = vx0 + (i + 0.5) * cw, b = fromY(vy0 + (j + 0.5) * ch);
          if (M.valid(a, b, k)) { const [[p, , ], [, r]] = D.gMat(M, a, b, k); sz.push(1 / Math.sqrt(Math.sqrt(Math.abs(p * r)))); }
        }
        sz.sort((x, y) => x - y);
        eps = (0.3 * Math.min(cw, ch)) / (sz[Math.floor(sz.length / 2)] || 1);
      }
      for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
        const x = vx0 + (i + 0.5) * cw, y = vy0 + (j + 0.5) * ch, a = x, b = fromY(y);
        if (!M.valid(a, b, k)) continue;
        if (!M.lorentz) {
          const pts = [];
          for (let s = 0; s <= 48; s++) {
            const t = (s / 48) * 2 * PI, d = [Math.cos(t), flip() ? -Math.sin(t) : Math.sin(t)];
            const L = Math.min(cap, eps / Math.sqrt(D.dot(M, a, b, k, d, d)));
            pts.push([x + L * Math.cos(t), y + L * Math.sin(t)]);
          }
          plot.path(pts, { color: 'teal', width: 1.2, fill: 'teal', fillAlpha: 0.1 });
        } else {
          // each edge drawn the same length on the screen
          const dirs = D.nullDirections(M, a, b, k).map((A) => { const m = Math.hypot(A * sx, sy) / (0.95 * capPx); return [A / m, 1 / m]; });
          const L = 1;
          // the past half faint, the future half bold and shaded
          plot.path([[x - L * dirs[0][0], y - L * dirs[0][1]], [x, y], [x - L * dirs[1][0], y - L * dirs[1][1]]], { color: 'gold', width: 1, alpha: 0.45 });
          plot.path([[x + L * dirs[0][0], y + L * dirs[0][1]], [x, y], [x + L * dirs[1][0], y + L * dirs[1][1]]], { color: 'gold', width: 1.4, fill: 'gold', fillAlpha: 0.22 });
        }
      }
    }

    // extra lines, curves and points
    for (const l of P.lines || []) {
      if (l.a !== undefined) plot.line(l.a, vy0, l.a, vy1, { color: l.color || 'ink3', width: l.width || 1.4, dash: l.dash || [5, 4] });
      else plot.line(vx0, toY(l.b), vx1, toY(l.b), { color: l.color || 'ink3', width: l.width || 1.4, dash: l.dash || [5, 4] });
      if (l.label) plot.text(l.label, l.a !== undefined ? l.a : vx1, l.a !== undefined ? vy1 : toY(l.b), { color: l.color || 'ink2', size: 11, dx: l.a !== undefined ? 5 : -5, dy: 10, align: l.a !== undefined ? 'left' : 'right' });
    }
    for (const c of P.curves || []) {
      plot.path(wrap(c.pts), { color: c.color || 'violet', width: c.width || 2, dash: c.dash || [] });
      if (c.label) { const p = c.labelAt ?? Math.floor(c.pts.length / 2), q = c.pts[Math.min(c.pts.length - 1, p)]; plot.text(c.label, q[0], toY(q[1]), { color: c.color || 'violet', size: 12, dx: c.labelDx ?? 6, dy: c.labelDy ?? -10 }); }
    }

    const rows = [];
    const want = (key) => (P.readout === true ? ['P', 'g', 'gamma', 'K', 'conserved', 'norm', 'length', 'turn', 'area', 'F'].includes(key) : Array.isArray(P.readout) && P.readout.includes(key));
    const [a0, b0] = Pp;
    const Pname = (P.labels !== false) ? 'P' : '';

    if (P.mode === 'geodesic' || P.mode === 'vary') {
      const L = M.lorentz;
      const launchAt = (h, s) => D.launch(M, a0, b0, k, L ? { speed: Math.max(-1, Math.min(1, s)) } : { heading: h * DEG });
      const len = +F.params.length;
      const steps = Math.min(4000, Math.max(400, Math.round(len * 160)));
      const box = { a: [V.a[0] - 50, V.a[1] + 50], b: [V.b[0] - 50, V.b[1] + 50] }, dmax = Math.hypot(V.a[1] - V.a[0], V.b[1] - V.b[0]) / 400;
      if (M.periodic?.a) box.a = [-1e9, 1e9];
      if (M.periodic?.b) box.b = [-1e9, 1e9];
      const h0 = +F.params.heading, s0 = +F.params.speed;
      for (let f = 1; P.mode === 'geodesic' && f <= P.fan; f++) {
        const off = (f % 2 ? 1 : -1) * Math.ceil(f / 2) * P.spread * (L ? 0.01 : 1);
        const g = D.geodesic(M, { a: a0, b: b0, k, u: launchAt(h0 + off, s0 + off), length: len, steps, box, dmax });
        plot.path(wrap(g.pts), { color: 'gold', width: 1.4, alpha: 0.55 });
      }
      const geo = D.geodesic(M, { a: a0, b: b0, k, u: launchAt(h0, s0), length: len, steps, box, dmax });
      if (P.mode === 'vary') {
        const al = +F.params.alpha;
        for (const f of [-1, -0.5, 0.5, 1]) plot.path(wrap(D.varied(M, geo, f * P.alphaMax, k)), { color: 'ink4', width: 1, alpha: 0.7 });
        if (al !== 0) plot.path(wrap(D.varied(M, geo, al, k)), { color: 'warn', width: 2.4 });
      }
      plot.path(wrap(geo.pts), { color: 'gold', width: 2.6 });
      const u0 = geo.vel[0];
      const c = Math.hypot(u0[0], toY(u0[1]) * 1) || 1, arrowLen = 0.09 * (vy1 - vy0);
      plot.arrow(a0, toY(b0), a0 + (arrowLen * u0[0]) / c, toY(b0) + (arrowLen * (flip() ? -u0[1] : u0[1])) / c, { color: 'bad', width: 2.6 });
      const end = geo.pts[geo.pts.length - 1];
      const endW = wrap([end])[0];
      plot.point(endW[0], endW[1], { color: 'gold', r: 3.5, label: P.mode === 'vary' && P.labels !== false ? 'Q' : '', ldx: 8, ldy: -10 });
      plot.point(a0, toY(b0), { color: 'ink', r: 4, label: Pname, ldx: -14, ldy: 12 });
      const kind = L ? (Math.abs(s0) >= 1 ? 'null' : 'time') : 'space';
      if (want('P')) rows.push([`$${Pname || 'P'}$`, `(${num(a0)},\\ ${num(b0)})`]);
      if (want('conserved')) for (const [ax, arr, nm] of [['a', geo.pa, M.a[0]], ['b', geo.pb, M.b[0]]]) {
        if (!M.cyclic.includes(ax)) continue;
        rows.push([`$p_{${nm}} = g_{${nm}\\mu}\\dot x^\\mu$, start → end`, `${num(arr[0], 4)} \\to ${num(arr[arr.length - 1], 4)}`]);
      }
      if (want('norm')) rows.push([`$g(\\dot x, \\dot x)$, start → end`, `${num(geo.norm[0], 4)} \\to ${num(geo.norm[geo.norm.length - 1], 4)}`]);
      if (want('length') && P.mode === 'geodesic') rows.push([kind === 'time' ? 'proper time $\\tau$ elapsed' : kind === 'null' ? 'affine parameter $\\lambda$ elapsed' : 'length $s$ along it', num(end[2], 4)]);
      if (want('end')) rows.push(['end point', `(${num(end[0])},\\ ${num(end[1])})`]);
      if (geo.stopped === 'chart') rows.push(['', '\\text{the path left the chart}']);
      if (P.mode === 'vary') {
        const al = +F.params.alpha;
        const Lv = (x) => D.pathLength(M, x === 0 ? geo.pts : D.varied(M, geo, x, k), k);
        const F0 = Lv(0), Fa = Lv(al);
        const nm = kind === 'time' ? '\\tau' : 'L';
        if (want('F')) rows.push([`$${nm}(\\alpha)$`, num(Fa, 5)], [`$${nm}(\\alpha) - ${nm}(0)$`, num(Fa - F0, 3)]);
        if (panel) {
          const key = `${F.params.metric}|${a0}|${b0}|${h0}|${s0}|${len}|${k}`;
          if (key !== panelKey) {
            panelKey = key;
            panelCurve = Array.from({ length: 41 }, (_, i) => { const x = -P.alphaMax + (2 * P.alphaMax * i) / 40; return [x, Lv(x)]; });
          }
          const ys = panelCurve.map((p) => p[1]);
          let lo = Math.min(...ys), hi = Math.max(...ys);
          const pad = (hi - lo) * 0.15 || Math.abs(hi) * 0.02 || 1;
          panel.o.ylabel = kind === 'time' ? 'τ' : 'L';
          panel.setView([-P.alphaMax, P.alphaMax], [lo - pad, hi + pad]);
          panel.clear();
          panel.line(0, panel.vy0, 0, panel.vy1, { color: 'ink3', width: 1, dash: [3, 4] });
          panel.path(panelCurve, { color: 'violet', width: 2.4 });
          panel.point(al, Fa, { color: 'warn', r: 5 });
          panel.text('geodesic', 0, panel.vy1, { color: 'ink3', size: 11, dx: 5, dy: 9 });
        }
      }
    } else if (P.mode === 'transport') {
      const [a1, b1] = Qq;
      const R = D.routes(a0, b0, a1, b1, 60);
      const L = M.lorentz;
      const V0 = L ? D.launch(M, a0, b0, k, { speed: Math.max(-0.95, Math.min(0.95, +F.params.speed)) }) : D.launch(M, a0, b0, k, { heading: +F.params.angle * DEG });
      const T1 = D.transport(M, R.first, V0, k), T2 = D.transport(M, R.second, V0, k);
      plot.path(R.first.map(([a, b]) => [a, toY(b)]), { color: 'accent', width: 2.2 });
      plot.path(R.second.map(([a, b]) => [a, toY(b)]), { color: 'violet', width: 2.2 });
      const c = 0.14 * (vy1 - vy0) / (Math.hypot(V0[0], V0[1]) || 1);
      const arr = (p, W, o) => plot.arrow(p[0], toY(p[1]), p[0] + c * W[0], toY(p[1]) + c * (flip() ? -W[1] : W[1]), o);
      for (let i = 20; i < R.first.length - 1; i += 20) { arr(R.first[i], T1[i], { color: 'accent', width: 1.4, alpha: 0.7 }); arr(R.second[i], T2[i], { color: 'violet', width: 1.4, alpha: 0.7 }); }
      arr([a0, b0], V0, { color: 'ink', width: 2.6 });
      const E1 = T1[T1.length - 1], E2 = T2[T2.length - 1];
      arr([a1, b1], E1, { color: 'accent', width: 2.8 });
      arr([a1, b1], E2, { color: 'violet', width: 2.8 });
      plot.point(a0, toY(b0), { color: 'ink', r: 4, label: Pname, ldx: -14, ldy: 12 });
      plot.point(a1, toY(b1), { color: 'ink', r: 4, label: P.labels !== false ? 'Q' : '', ldx: 10, ldy: 12 });
      if (want('P')) rows.push(['$P \\to Q$', `(${num(a0)},\\ ${num(b0)}) \\to (${num(a1)},\\ ${num(b1)})`]);
      const tr = D.turn(M, a1, b1, k, E1, E2);
      if (want('turn')) rows.push(L ? ['rapidity between the two arrivals', num(tr, 3)] : ['angle between the two arrivals', `${num(tr / DEG, 3)}^\\circ`]);
      if (want('area')) {
        // ∫∫ K √|g| da db over the rectangle, by the midpoint rule
        let A = 0, KA = 0;
        const N = 24, da = (a1 - a0) / N, db = (b1 - b0) / N;
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const a = a0 + (i + 0.5) * da, b = b0 + (j + 0.5) * db;
          const [[p, q], [, r]] = D.gMat(M, a, b, k), w = Math.sqrt(Math.abs(p * r - q * q)) * Math.abs(da * db);
          A += w; KA += D.curvature(M, a, b, k).K * w;
        }
        rows.push(['enclosed area', num(A, 3)], [L ? '$\\iint K\\,dA$ ($K = R/2$)' : '$\\iint K\\,dA$ (radians)', num(KA, 3)]);
      }
    } else if (P.probe !== false) {
      plot.point(a0, toY(b0), { color: 'ink', r: 4.5, label: Pname, ldx: -14, ldy: 12 });
    }

    if (P.mode === 'chart' || P.mode === 'transport' ? true : false) {
      if (P.mode === 'chart' && want('P')) rows.push([`$${Pname || 'P'}$`, `(${num(a0)},\\ ${num(b0)})`]);
    }
    if (want('g')) {
      const [[p, q], [, r]] = D.gMat(M, a0, b0, k), A = M.a[0], B = M.b[0];
      rows.push([`$g_{${A}${A}}$`, num(p, 4)]);
      if (Math.abs(q) > 1e-12) rows.push([`$g_{${A}${B}}$`, num(q, 4)]);
      rows.push([`$g_{${B}${B}}$`, num(r, 4)]);
    }
    if (want('gamma') || want('check')) {
      const G = D.christoffel(M, a0, b0, k), H = D.christoffelFD(M, a0, b0, k);
      let any = false;
      for (let l = 0; l < 2; l++) for (let m = 0; m < 2; m++) for (let n = M.gamma ? 0 : m; n < 2; n++) {
        if (Math.abs(G[l][m][n]) < 1e-10) continue;
        any = true;
        rows.push([`$${gammaName(M, l, m, n)}$${want('check') ? ' (by differences)' : ''}`, want('check') ? `${num(G[l][m][n], 4)}\\ \\ (${num(H[l][m][n], 4)})` : num(G[l][m][n], 4)]);
      }
      if (!any) rows.push(['every $\\Gamma$', '0']);
    }
    if (want('K') && P.mode !== 'transport') rows.push([M.lorentz ? '$K = R/2$ at P' : M.gamma ? 'curvature of this connection at P' : '$K$ at P', num(D.curvature(M, a0, b0, k).K, 4)]);
    if (want('torsion')) {
      const T = D.torsion(M, a0, b0, k), nm = [M.a[0], M.b[0]];
      const tw = [0, 1].map((l) => T[l][0][1]);
      rows.push(...(tw.every((x) => Math.abs(x) < 1e-12) ? [['torsion', '0']] : tw.map((x, l) => [`$T^{${nm[l]}}{}_{${nm[0]}${nm[1]}}$`, num(x, 4)]).filter((r) => r[1] !== '0')));
    }
    if (P.readout !== false) F.readout(rows);
    plot.drawHandles();
  }

  F.draw(draw);
  F.caption({
    chart: 'The chart drawn as plain coordinates. Ellipses: the steps of one fixed length ε at each grid point (capped near a singular edge). Cones: the light cone at each grid point, future half shaded. Drag P.',
    geodesic: 'Gold: the geodesic from P, integrated step by step (RK4) from the Christoffel symbols; red: its starting direction. Drawn on the coordinate chart, not on the curved space itself. Drag P.',
    transport: 'A vector at P carried to Q without turning (parallel transport, RK4), blue along the first coordinate first, violet along the second first. Arrows are drawn as chart components; transport keeps their length as the metric measures it.',
    vary: 'Gold: the geodesic from P to Q. Orange: the same path pushed sideways by α sin(πλ/Λ), ends fixed; grey: other members of the family.',
  }[P.mode]);
  return { get: (key) => (key === 'point' ? { x: Pp[0], y: Pp[1] } : F.params[key]) };
}
