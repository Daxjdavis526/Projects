// A functional explorer: one true path, a family of varied paths y + α η_n
// (η_n = sin nπs vanishes at both ends, so every path joins the same two
// points), and the functional's value F(α) for each — the length of a curve,
// a bead's travel time, or the action ∫(T − U)dt of a motion. Two panels:
//   path  the true path (solid), faint members of the family, and the path
//         at the current α (orange);
//   F     F(α) against α, with the current α marked. At the true path the
//         curve is flat: F is STATIONARY there (a minimum, or — for the spring
//         over more than half a period — a maximum along the first mode).
// A second slider β shifts the BASE path along η₁; then the curve is no
// longer flat at α = 0, which is what "not an extremal" looks like.
// The physics is model/cm2-var.js (tested in test/cm2-var.test.mjs).
//
//   { type: 'cm2-vary', params: {
//       preset: 'length',          // 'length' (plane, A to B) | 'brach' (bead time on the cycloid)
//                                  // | 'ball' (action of a thrown ball) | 'spring' (action of a mass on a spring)
//       n: 1,                      // the variation's mode, 1–3
//       alpha: 0, beta: 0,         // the variation's amplitude, and the base offset along mode 1
//       T: 0.7,                    // spring only: the duration (s); the period is 1 s
//       sliders: ['alpha'],        // any of alpha beta T ([] for a still picture)
//       modes: true,               // a choice of n (1, 2, 3)
//       panels: ['path', 'F'],     // which panels, top to bottom
//       ghosts: true,              // faint members of the family
//       marks: true,               // the current α on the F panel (and its value line)
//       readouts: ['F', 'dF'],     // any of F dF slope; [] for none
//       labels: true,              // end-point labels on the path panel
//   } }
//
// A picture must not show its answer: drop the readout a question asks for.

import { Plot } from '../plot.js';
import * as V from '../model/cm2-var.js';

export const defaults = {
  preset: 'length', n: 1, alpha: 0, beta: 0, T: 0.7, sliders: ['alpha'], modes: true, panels: ['path', 'F'],
  ghosts: true, marks: true, readouts: ['F', 'dF'], labels: true,
};
const PANELS = ['path', 'F'], READS = ['F', 'dF', 'slope'], SLIDERS = ['alpha', 'beta', 'T'];
const UNIT = { length: '\\mathrm{m}', brach: '\\mathrm{s}', ball: '\\mathrm{J\\,s}', spring: '\\mathrm{J\\,s}' };
const FNAME = { length: 'L', brach: 'T', ball: 'S', spring: 'S' };
const trim = (x, n = 4) => (Number.isFinite(x) ? String(+(+x).toPrecision(n)).replace(/e\+?(-?\d+)/, '\\times10^{$1}') : '\\text{—}');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const pre = V.PRESETS[P.preset], amax = pre.amax;
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const cv = {};
  for (const p of panels) cv[p] = F.canvas({ aspect: 'wide', label: p === 'path' ? 'A true path and a family of varied paths with the same end points' : 'The functional’s value against the variation’s amplitude' });
  const sl = P.sliders || [];
  const aUnit = P.preset === 'brach' ? '' : '\\mathrm{m}';
  if (sl.includes('alpha')) F.slider({ key: 'alpha', label: 'Amplitude $\\alpha$', min: -amax, max: amax, step: amax / 100, value: P.alpha, unit: aUnit, explain: P.preset === 'brach' ? 'The varied path’s depth is the cycloid’s times $(1 + \\alpha\\sin n\\pi s)$, so it never rises above the start.' : 'How far the varied path is pushed along $\\eta_n = \\sin(n\\pi s)$, which is zero at both ends.' });
  else F.params.alpha = P.alpha;
  if (sl.includes('beta')) F.slider({ key: 'beta', label: 'Base offset $\\beta$', min: -amax / 2, max: amax / 2, step: amax / 200, value: P.beta, unit: aUnit, explain: 'Start the family from a path that is NOT the true one: the true path pushed by $\\beta$ along mode 1.' });
  else F.params.beta = P.beta;
  if (P.preset === 'spring' && sl.includes('T')) F.slider({ key: 'T', label: 'Duration $T$', min: 0.2, max: 0.9, step: 0.01, value: P.T, unit: '\\mathrm{s}', explain: 'How long the motion lasts. The spring’s period is 1 s: watch the first mode as $T$ passes half a period.' });
  else F.params.T = P.T;
  if (P.modes) F.choice({ key: 'n', label: 'Variation $\\eta_n$', options: [[1, '$n = 1$'], [2, '$n = 2$'], [3, '$n = 3$']], value: P.n });
  else F.params.n = P.n;
  F.onChange(() => draw());

  const X = () => (P.preset === 'spring' ? +F.params.T : pre.X);
  const plots = {};
  if (cv.path) plots.path = new Plot(cv.path.canvas, { x: [0, 1], y: [0, 1], xlabel: pre.xlabel, ylabel: P.preset === 'brach' ? 'height (m)' : pre.ylabel, yticks: 5 });
  if (cv.F) plots.F = new Plot(cv.F.canvas, { x: [-amax, amax], y: [0, 1], xlabel: P.preset === 'brach' ? 'α' : 'α (m)', ylabel: `${FNAME[P.preset]} (${pre.unit})`, yticks: 5 });
  const flip = (pts) => (P.preset === 'brach' ? pts.map(([x, y]) => [x, -y]) : pts);
  const opts = () => ({ T: X(), N: 300 });

  let cacheKey = '', curve = null;
  function curveOf(n, beta) {
    const key = `${n}|${beta}|${X()}`;
    if (key !== cacheKey) {
      cacheKey = key;
      curve = [];
      for (let i = 0; i <= 80; i++) { const a = -amax + (2 * amax * i) / 80; curve.push([a, V.F(P.preset, n, a, beta, opts())]); }
    }
    return curve;
  }

  function draw() {
    const n = +F.params.n, alpha = +F.params.alpha, beta = +F.params.beta;
    const o = opts();
    const F0 = V.F(P.preset, n, 0, 0, o), Fa = V.F(P.preset, n, alpha, beta, o);
    const h = amax * 1e-3, slope = (V.F(P.preset, n, alpha + h, beta, o) - V.F(P.preset, n, alpha - h, beta, o)) / (2 * h);
    if (plots.path) {
      const pp = plots.path, Xn = X();
      const y = P.preset === 'brach' ? [-1.05, 0.08] : P.preset === 'spring' ? [-0.3, 0.3] : pre.y;
      pp.setView([P.preset === 'length' ? -0.05 : 0, P.preset === 'length' ? 1.05 : Xn], y);
      pp.clear();
      if (P.ghosts) {
        for (const f of [-1, -2 / 3, -1 / 3, 1 / 3, 2 / 3, 1]) pp.path(flip(V.samplePath(P.preset, n, f * amax, beta, o)), { color: 'ink4', width: 1, alpha: 0.7 });
      }
      pp.path(flip(V.samplePath(P.preset, n, 0, 0, o)), { color: 'accent', width: 2.6 });
      if (alpha !== 0 || beta !== 0) pp.path(flip(V.samplePath(P.preset, n, alpha, beta, o)), { color: 'warn', width: 2.4 });
      const ends = flip([[0, 0], P.preset === 'length' ? [1, 0.5] : P.preset === 'brach' ? [1, 0.6] : [Xn, 0]]);
      for (const [i, e] of ends.entries()) {
        const name = P.labels ? ({ length: ['A', 'B'], brach: ['A', 'B'], ball: ['thrown', 'caught'], spring: ['t = 0', 't = T'] }[P.preset][i]) : '';
        pp.point(e[0], e[1], { color: 'ink', r: 4.5, label: name, ldx: i ? -8 : 8, ldy: P.preset === 'brach' && i ? 14 : -12, lalign: i ? 'right' : 'left' });
      }
    }
    if (plots.F) {
      const pf = plots.F, c = curveOf(n, beta);
      const vals = c.map((r) => r[1]).filter(Number.isFinite);
      let lo = Math.min(...vals, F0), hi = Math.max(...vals, F0);
      const pad = (hi - lo) * 0.12 || Math.abs(hi) * 0.05 || 1;
      pf.setView([-amax, amax], [lo - pad, hi + pad]);
      pf.clear();
      pf.line(0, pf.vy0, 0, pf.vy1, { color: 'ink3', width: 1, dash: [3, 4] });
      pf.line(-amax, F0, amax, F0, { color: 'accent', width: 1, dash: [5, 4], alpha: 0.7 });
      pf.text('true path', 0, pf.vy1, { color: 'ink3', size: 11, dx: 5, dy: 9 });
      pf.path(c, { color: 'violet', width: 2.4 });
      if (P.marks) {
        pf.point(alpha, Fa, { color: 'warn', r: 5.5 });
        // the tangent at the current α: zero slope means stationary
        const dx = amax * 0.25;
        pf.line(alpha - dx, Fa - slope * dx, alpha + dx, Fa + slope * dx, { color: 'gold', width: 1.6 });
      }
    }
    const u = UNIT[P.preset], nm = FNAME[P.preset];
    F.readout((P.readouts || []).map((k) => ({
      F: [`$${nm}$`, `${trim(Fa, 5)}\\,${u}`],
      dF: [`$${nm} - ${nm}_{\\text{true}}$`, `${trim(Fa - F0, 3)}\\,${u}`],
      slope: [`$d${nm}/d\\alpha$`, `${trim(Math.abs(slope) < 1e-9 ? 0 : slope, 3)}`],
    }[k])));
  }
  F.draw(draw);
  F.caption({
    length: 'Straight line from A to B (blue), varied paths (grey, orange) with the same ends. Lengths computed from 300 chords.',
    brach: 'A frictionless bead from rest; depth measured down from the start. The true path is the cycloid (blue). Times computed numerically.',
    ball: 'A 0.5 kg ball thrown up and caught 2 s later, $g = 9.8$ m/s², no air resistance. Height against time — a graph, not the trajectory in space.',
    spring: 'A 1 kg mass on a spring with a 1 s period, at $x = 0$ at both ends. True path: stay at rest. Position against time.',
  }[P.preset]);
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  const pre = V.PRESETS[P.preset];
  if (!pre) return [`unknown preset “${P.preset}” (length, brach, ball, spring)`];
  if (![1, 2, 3].includes(P.n)) out.push('n must be 1, 2 or 3');
  for (const k of ['alpha', 'beta']) if (typeof P[k] !== 'number' || Math.abs(P[k]) > (k === 'beta' ? pre.amax / 2 : pre.amax) + 1e-12) out.push(`${k} must be a number within ±${k === 'beta' ? pre.amax / 2 : pre.amax}`);
  if (!(typeof P.T === 'number' && P.T >= 0.2 && P.T <= 0.9)) out.push('T must lie in [0.2, 0.9] s');
  for (const s of P.sliders || []) if (!SLIDERS.includes(s)) out.push(`unknown slider “${s}”`);
  if ((P.sliders || []).includes('T') && P.preset !== 'spring') out.push('the T slider is for the spring preset only');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`unknown panel “${p}”`);
  for (const r of P.readouts || []) if (!READS.includes(r)) out.push(`unknown readout “${r}”`);
  return out;
}
