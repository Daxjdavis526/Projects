// The fate of the universe: solutions a(t) of the Friedmann equation for
// matter plus a cosmological constant, with whatever spatial curvature makes
// the total come out. Every solution passes through today (a = 1) with the
// same slope — the measured expansion rate H₀ — and the contents decide the
// rest: how long ago a was 0 (the age), and whether the expansion goes on
// forever, speeds up, or turns round into a Big Crunch. Dashed: the Planck
// 2018 best fit. Physics in model/gr-cosmology.js (tested).
//
//   { type: 'gr-friedmann', params: { Om: 0.315, OL: 0.685, H0: 67.4 } }
//   sliders: false fixes the model; models: [[Om, OL, label, color], …]
//   draws several fixed models at once; readout: false hides the numbers
//   (so a question does not print its own answer); t and a set the ranges.

import { Plot } from '../plot.js';
import { history, hubbleTime, q0, fate } from '../model/gr-cosmology.js';

export const defaults = { Om: 0.315, OL: 0.685, H0: 67.4, sliders: true, readout: true, reference: true, tangent: true, models: null, t: [-20, 30], a: [0, 3] };

export function mount(F, P) {
  const { canvas } = F.canvas({ label: P.alt || 'The size of the universe (scale factor) against time, for the chosen contents' });
  if (P.sliders !== false) {
    F.slider({ key: 'Om', label: 'Matter $\\Omega_m$', min: 0, max: 3, step: 0.005, value: P.Om, explain: 'Matter, ordinary and dark, as a fraction of the critical density today. It dilutes as $1/a^3$ and slows the expansion.' });
    F.slider({ key: 'OL', label: 'Dark energy $\\Omega_\\Lambda$', min: -1, max: 2.5, step: 0.005, value: P.OL, explain: 'A cosmological constant, as a fraction of the critical density. It never dilutes, and it speeds the expansion up.' });
    F.choice({ key: 'H0', label: 'Expansion rate today $H_0$', options: [[67.4, '67.4 (from the CMB)'], [73, '73.0 (local ladder)']], value: P.H0, explain: 'In km/s/Mpc. Two measurements that disagree — the Hubble tension, an open question. It only rescales the time axis.' });
    F.button({ label: 'Planck 2018', onClick: () => { F.set('Om', 0.315); F.set('OL', 0.685); } });
    F.button({ label: 'Matter only', onClick: () => { F.set('Om', 1); F.set('OL', 0); } });
  } else Object.assign(F.params, { Om: P.Om, OL: P.OL, H0: P.H0 });
  F.onChange(() => draw());

  function draw() {
    const pl = new Plot(canvas, { x: P.t, y: P.a, xlabel: 'time from today (billions of years)', ylabel: 'scale factor a' });
    pl.clear();
    const H0 = F.params.H0, tH = hubbleTime(H0), g = pl.ctx;
    const opts = { tPast: -P.t[0] + 3, tFuture: P.t[1] + 3, aMax: P.a[1] * 1.15 };
    g.save();
    g.beginPath(); g.rect(pl.L, pl.T, pl.R - pl.L, pl.B - pl.T); g.clip();
    if (P.tangent !== false) pl.line(pl.vx0, 1 + pl.vx0 / tH, pl.vx1, 1 + pl.vx1 / tH, { color: 'ink4', width: 1.2, dash: [5, 5] });
    pl.line(0, pl.vy0, 0, pl.vy1, { color: 'ink3', width: 1, dash: [3, 4] });
    if (P.reference !== false && P.sliders !== false) pl.path(history({ Om: 0.315, OL: 0.685 }, H0, opts).pts, { color: 'ink3', width: 1.6, dash: [7, 5] });
    const models = P.models || [[F.params.Om, F.params.OL, null, 'gold']];
    const marks = [];
    let main = null;
    for (const [Om, OL, label, color] of models) {
      const hst = history({ Om, OL }, H0, opts);
      main ??= hst;
      pl.path(hst.pts, { color: color || 'gold', width: 2.8 });
      if (hst.age !== null) marks.push([-hst.age, 0, 'bad']);
      if (hst.crunch !== null) marks.push([hst.crunch, 0, 'violet']);
      if (label) {
        const tl = P.t[1] * 0.55, inView = hst.pts.filter(([tt, a]) => tt <= tl && a <= P.a[1] * 0.97);
        const [lx, ly] = inView.length ? inView[inView.length - 1] : hst.pts[hst.pts.length - 1];
        pl.text(label, lx, ly, { color: color || 'gold', dx: 6, dy: -12, weight: 650 });
      }
    }
    g.restore();
    for (const [x, y, c] of marks) if (x >= pl.vx0 && x <= pl.vx1) pl.point(x, y, { color: c, r: 4.5 });
    pl.point(0, 1, { color: 'ink', r: 4.5, label: 'today' });
    if (P.readout !== false && !P.models) {
      const M = { Om: F.params.Om, OL: F.params.OL }, q = q0(M), Ok = 1 - M.Om - M.OL;
      const f = fate(M, H0);
      F.readout([
        ['curvature $\\Omega_k = 1 - \\Omega_m - \\Omega_\\Lambda$', (Math.abs(Ok) < 5e-4 ? 0 : Ok).toFixed(3)],
        ['age', main.age !== null ? `${main.age.toFixed(2)}\\ \\mathrm{billion\\ years}` : '\\text{no Big Bang — a bounce}'],
        ['today $q_0$', `${q.toFixed(3)}\\ \\text{(${q < 0 ? 'speeding up' : 'slowing down'})}`],
        ['fate', `\\text{${f.text}}`],
      ]);
    }
  }
  F.draw(draw);
  F.caption('Solutions of the Friedmann equation for matter and a cosmological constant, with whatever spatial curvature makes the total come out: Ω_k = 1 − Ω_m − Ω_Λ. Radiation, important only in the first few hundred thousand years, is left out. Every curve passes through today (a = 1) with the same slope — the measured expansion rate H₀, grey dashed line — and differs in its past (red dot: the Big Bang) and its future (violet dot: a Big Crunch). Dashed curve: the Planck 2018 best fit.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const problems = [];
  if (!(P.Om >= 0 && P.Om <= 3)) problems.push('gr-friedmann: Om must lie in [0, 3]');
  if (!(P.OL >= -1 && P.OL <= 2.5)) problems.push('gr-friedmann: OL must lie in [−1, 2.5]');
  if (!(typeof P.H0 === 'number' && P.H0 > 0)) problems.push('gr-friedmann: H0 must be a positive number, in km/s/Mpc');
  else if (P.sliders !== false && ![67.4, 73].includes(P.H0)) problems.push('gr-friedmann: with sliders, H0 must be 67.4 or 73 (the two choices)');
  for (const m of P.models || []) if (!(Array.isArray(m) && m[0] >= 0 && Number.isFinite(m[1]))) problems.push('gr-friedmann: each model is [Om, OL, label?, color?] with Om ≥ 0');
  if (!(P.t[0] < 0 && P.t[1] > 0 && P.a[0] < 1 && P.a[1] > 1)) problems.push('gr-friedmann: the ranges t and a must contain today, (0, 1)');
  return problems;
}
