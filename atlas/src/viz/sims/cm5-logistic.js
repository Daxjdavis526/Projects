// The logistic map xₙ₊₁ = r xₙ(1 − xₙ), the simplest route to chaos
// (PHYS 3550, M10.3). Panels, top to bottom (any subset, in this order):
//   cobweb  the parabola y = r x(1 − x) and the line y = x; the orbit from
//           x₀ walked between them (up to the curve, across to the line),
//           with the fixed points marked
//   series  xₙ against n (with `two`, a second orbit started Δx₀ away)
//   bif     the bifurcation diagram: the attractor (200 iterates after 600)
//           for each r in the `bif` window, with the current r marked and,
//           optionally, the period-doubling parameters r₁, r₂, … as lines
//   lyap    the Lyapunov exponent λ(r) = ⟨ln|r(1 − 2x)|⟩ across the same
//           window: negative on periodic windows, positive in chaos
// Physics: model/cm5-chaos.js, tested in test/cm5-chaos.test.mjs.
//
//   { type: 'cm5-logistic', params: {
//       r: 3.2, x0: 0.2,          // the parameter (0–4) and the start (0–1)
//       n: 40,                    // iterations drawn (cobweb and series)
//       skip: 0,                  // cobweb: iterations run before drawing (to show only the attractor)
//       two: false, dx: 1e-3,     // a second orbit from x₀ + Δx₀ (series panel)
//       panels: ['cobweb', 'series'],
//       fixed: true,              // cobweb: mark the fixed points (0 and 1 − 1/r)
//       bif: [2.8, 4],            // bif and lyap: the r window
//       bifY: [0, 1],             // bif: the x window (zoom into a branch)
//       doublings: false,         // bif: dashed lines at r₁, r₂, r₃, … inside the window
//       marks: true,              // bif and lyap: the current r's line
//       controls: ['r', 'x0'],    // any of r x0 two ([] for a still picture)
//       rRange: [2.5, 4],         // the r slider's range
//       readout: true, readouts: null,   // rows: r fixed slope period lambda (default: r period lambda)
//       hide: [],                 // rows printed as “?”
//   } }
//
// A picture must not show its answer: drop the readout a question asks for,
// and set fixed: false when the question is where the fixed point is.

import { Plot } from '../plot.js';
import * as K from '../model/cm5-chaos.js';

export const defaults = {
  r: 3.2, x0: 0.2, n: 40, skip: 0, two: false, dx: 1e-3, panels: ['cobweb', 'series'], fixed: true, bif: [2.8, 4], bifY: [0, 1],
  doublings: false, marks: true, controls: ['r', 'x0'], rRange: [2.5, 4], readout: true, readouts: null, hide: [],
};
const PANELS = ['cobweb', 'series', 'bif', 'lyap'];
const CONTROLS = ['r', 'x0', 'two'];
const ROWS = ['r', 'fixed', 'slope', 'period', 'lambda'];
const R_DOUBLE = K.doublings(9);

const trim = (x, d = 3) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) { const [mm, e] = x.toExponential(d - 1).split('e'); return `${+mm}\\times10^{${+e}}`; }
  return String(+(+x).toPrecision(d));
};

/** The period of the attractor at r (up to 64), or 0 when none repeats (chaos, or not yet settled). */
export function periodOf(r) {
  const xs = K.attractor(r, { skip: 4000, keep: 200 });
  for (let m = 1; m <= 64; m++) {
    let ok = true;
    for (let k = xs.length - 1; k >= xs.length - 64 && ok; k--) if (Math.abs(xs[k] - xs[k - m]) > 1e-6) ok = false;
    if (ok) return m;
  }
  return 0;
}

const CACHE = new Map();
function bifData(lo, hi, cols) {
  const key = `${lo}|${hi}|${cols}`;
  if (!CACHE.has(key)) {
    const out = [];
    for (let i = 0; i < cols; i++) {
      const r = lo + ((hi - lo) * (i + 0.5)) / cols;
      out.push({ r, xs: K.attractor(r, { skip: 600, keep: 200 }), lam: K.lyapLogistic(r, { skip: 300, n: 3000 }) });
    }
    CACHE.set(key, out);
  }
  return CACHE.get(key);
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = PANELS.filter((p) => (P.panels || []).includes(p));
  const C0 = new Set(P.controls || []);
  const label = {
    cobweb: 'A cobweb: the orbit walked between the parabola and the line y = x', series: 'The iterates against step number',
    bif: 'The bifurcation diagram: the long-run values of x against r', lyap: 'The Lyapunov exponent against r',
  };
  const cv = {};
  for (const p of panels) cv[p] = F.canvas({ aspect: p === 'cobweb' && !F.compact ? '' : 'wide', label: label[p] });
  if (C0.has('r')) F.slider({ key: 'r', label: 'Growth parameter $r$', min: P.rRange[0], max: P.rRange[1], step: 0.0005, value: P.r, explain: 'How steeply each step multiplies $x$: the height of the parabola is $r/4$.' });
  else F.params.r = P.r;
  if (C0.has('x0')) F.slider({ key: 'x0', label: 'Start $x_0$', min: 0.01, max: 0.99, step: 0.01, value: P.x0, explain: 'Where the orbit begins. Periodic attractors forget it; chaos remembers every digit.' });
  else F.params.x0 = P.x0;
  if (C0.has('two')) F.toggle({ key: 'two', label: 'Second orbit', value: !!P.two, explain: `A second orbit started $\\Delta x_0 = ${trim(P.dx)}$ higher.` });
  else F.params.two = !!P.two;
  F.onChange(() => draw());

  const plot = {};
  if (cv.cobweb) plot.cobweb = new Plot(cv.cobweb.canvas, { x: [0, 1], y: [0, 1], xlabel: 'xₙ', ylabel: 'xₙ₊₁', pad: { l: 46, r: 14, t: 12, b: 34 } });
  if (cv.series) plot.series = new Plot(cv.series.canvas, { x: [0, P.n], y: [0, 1], xlabel: 'step n', ylabel: 'xₙ', pad: { l: 46, r: 14, t: 12, b: 34 } });
  if (cv.bif) plot.bif = new Plot(cv.bif.canvas, { x: P.bif, y: P.bifY, xlabel: 'r', ylabel: 'x (long run)', pad: { l: 46, r: 14, t: 12, b: 34 } });
  if (cv.lyap) plot.lyap = new Plot(cv.lyap.canvas, { x: P.bif, y: [-2, 1], xlabel: 'r', ylabel: 'λ (per step)', pad: { l: 46, r: 14, t: 12, b: 34 } });

  const r = () => +F.params.r, x0 = () => +F.params.x0;

  function drawCobweb() {
    const p = plot.cobweb, rr = r();
    p.clear();
    p.fn((x) => x, { domain: [0, 1], color: 'ink3', width: 1.4 });
    p.fn((x) => K.logistic(rr, x), { domain: [0, 1], color: 'accent', width: 2.2 });
    let x = x0();
    for (let i = 0; i < P.skip; i++) x = K.logistic(rr, x);
    const pts = K.cobweb(rr, x, P.n);
    if (P.skip) pts[0] = [x, x];
    p.path(pts, { color: 'gold', width: 1.3, alpha: 0.9 });
    if (!P.skip) p.point(x0(), 0, { color: 'gold', r: 4 });
    if (P.fixed) {
      const fp = K.fixedPoints(rr);
      p.point(0, 0, { color: Math.abs(fp.slope0) < 1 ? 'good' : 'bad', r: 5 });
      if (fp.x1 > 0) p.point(fp.x1, fp.x1, { color: Math.abs(fp.slope1) < 1 ? 'good' : 'bad', r: 5, label: Math.abs(fp.slope1) < 1 ? 'stable' : 'unstable', ldx: 10, ldy: 12 });
    }
  }

  function drawSeries() {
    const p = plot.series, rr = r();
    p.setView([0, P.n], [0, 1]);
    p.clear();
    const draw1 = (xs, color) => {
      p.path(xs.map((x, i) => [i, x]), { color, width: 1.2, alpha: 0.6 });
      xs.forEach((x, i) => p.point(i, x, { color, r: 2.6 }));
    };
    if (F.params.two) draw1(K.orbit(rr, x0() + P.dx, P.n), 'warn');
    draw1(K.orbit(rr, x0(), P.n), 'accent');
  }

  function drawBif() {
    const p = plot.bif, cols = Math.max(120, Math.round(p.R - p.L) || 400);
    const data = bifData(P.bif[0], P.bif[1], cols);
    p.clear();
    const g = p.ctx;
    g.save(); p._clip(); g.fillStyle = p.color('ink'); g.globalAlpha = 0.55;
    for (const d of data) for (const x of d.xs) if (x >= P.bifY[0] && x <= P.bifY[1]) g.fillRect(p.X(d.r) - 0.6, p.Y(x) - 0.6, 1.2, 1.2);
    g.restore();
    if (P.doublings) R_DOUBLE.forEach((rk, k) => {
      if (rk <= P.bif[0] || rk >= P.bif[1]) return;
      p.line(rk, p.vy0, rk, p.vy1, { color: 'violet', width: 1, dash: [3, 4] });
      if (k < 4 && (k === 0 || p.X(rk) - p.X(R_DOUBLE[k - 1]) > 22)) p.text(`r${'₁₂₃₄'[k]}`, p.X(rk), p.T + 8, { screen: true, color: 'violet', size: 11, align: 'center' });
    });
    if (P.marks) p.line(r(), p.vy0, r(), p.vy1, { color: 'accent', width: 1.6, dash: [5, 4] });
  }

  function drawLyap() {
    const p = plot.lyap, cols = Math.max(120, Math.round(p.R - p.L) || 400);
    const data = bifData(P.bif[0], P.bif[1], cols);
    p.clear();
    p.line(P.bif[0], 0, P.bif[1], 0, { color: 'ink3', width: 1 });
    p.path(data.map((d) => [d.r, Math.max(-2, d.lam)]), { color: 'teal', width: 1.4 });
    if (P.marks) p.line(r(), p.vy0, r(), p.vy1, { color: 'accent', width: 1.6, dash: [5, 4] });
  }

  function readout() {
    if (P.readout === false) { F.readout([]); return; }
    const hide = new Set(P.hide || []), want = P.readouts || ['r', 'period', 'lambda'], rr = r(), fp = K.fixedPoints(rr);
    const per = want.includes('period') ? periodOf(rr) : 0;
    const val = {
      r: ['$r$', trim(rr, 4)],
      fixed: ['fixed point $1 - 1/r$', rr > 1 ? trim(fp.x1, 4) : '\\text{— (only } x = 0)'],
      slope: ['slope there, $2 - r$', trim(fp.slope1, 3)],
      period: ['period', per ? String(per) : '\\text{none (chaos)}'],
      lambda: ['$\\lambda$', `${trim(K.lyapLogistic(rr), 3)}\\ \\text{per step}`],
    };
    F.readout(want.filter((k) => val[k]).map((k) => [val[k][0], hide.has(k) ? '?' : val[k][1]]));
  }

  function draw() {
    if (plot.cobweb) drawCobweb();
    if (plot.series) drawSeries();
    if (plot.bif) drawBif();
    if (plot.lyap) drawLyap();
    readout();
  }
  F.draw(draw);
  F.caption('The logistic map, computed exactly in double precision. A cobweb goes up to the parabola (one step) and across to y = x (the output becomes the next input). The bifurcation diagram plots 200 iterates after 600 transients; near each doubling the transient decays slowly, so the branches there look fuzzy.');
  return { get: (k) => (k === 'period' ? periodOf(r()) : F.params[k]) };
}

export function validate(P) {
  const out = [];
  if (!(P.r >= 0 && P.r <= 4)) out.push('cm5-logistic: r must be from 0 to 4');
  if (!(P.x0 > 0 && P.x0 < 1)) out.push('cm5-logistic: x0 must be between 0 and 1');
  if (!(Number.isInteger(P.n) && P.n >= 1 && P.n <= 500)) out.push('cm5-logistic: n must be a whole number from 1 to 500');
  if (!(Number.isInteger(P.skip) && P.skip >= 0 && P.skip <= 5000)) out.push('cm5-logistic: skip must be a whole number from 0 to 5000');
  if (!(P.dx > 0 && P.dx < 0.5)) out.push('cm5-logistic: dx must be between 0 and 0.5');
  if (!Array.isArray(P.panels) || !P.panels.length || P.panels.some((p) => !PANELS.includes(p))) out.push(`cm5-logistic: panels must be a list of ${PANELS.join(', ')}`);
  if (!(Array.isArray(P.bif) && P.bif[0] < P.bif[1] && P.bif[0] >= 0 && P.bif[1] <= 4)) out.push('cm5-logistic: bif must be [lo, hi] inside 0–4');
  if (!(Array.isArray(P.bifY) && P.bifY[0] < P.bifY[1])) out.push('cm5-logistic: bifY must be [lo, hi]');
  if (!(Array.isArray(P.rRange) && P.rRange[0] < P.rRange[1] && P.rRange[0] >= 0 && P.rRange[1] <= 4)) out.push('cm5-logistic: rRange must lie in 0–4');
  else if ((P.controls || []).includes('r') && !(P.r >= P.rRange[0] && P.r <= P.rRange[1])) out.push('cm5-logistic: with an r slider, rRange must contain r');
  for (const c of P.controls || []) if (!CONTROLS.includes(c)) out.push(`cm5-logistic: unknown control “${c}”`);
  for (const k of [...(P.hide || []), ...(P.readouts || [])]) if (!ROWS.includes(k)) out.push(`cm5-logistic: unknown readout “${k}”`);
  return out;
}
