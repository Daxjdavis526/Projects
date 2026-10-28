// Resonance of the driven damped oscillator ẍ + 2βẋ + ω₀²x = f₀ cos ωt, in
// three linked panels:
//   amp    the steady amplitude A(ω) — or, with y: 'A2', A² as a fraction of
//          its peak, with the Lorentzian approximation dashed and the full
//          width at half maximum (≈ 2β) marked;
//   phase  the phase lag δ(ω), climbing from 0 through 90° at ω₀ to 180°;
//   time   the drive (as cos ωt) and the steady response (as cos(ωt − δ)),
//          each scaled to its own peak, so the lag is the gap between their
//          crests.
// The drive frequency ω is a slider and is marked on every panel. The physics
// is model/cm-osc.js (tested in test/cm-osc.test.mjs).
//
//   { type: 'cm-resonance', params: {
//       w0: 10, beta: 1, w: 9, f0: 1,     // ω₀ (rad/s), β (s⁻¹), drive ω (rad/s), f₀ = F₀/m (m/s²)
//       wmax: 20,                         // the frequency axis runs from 0 to wmax (rad/s)
//       panels: ['amp', 'phase', 'time'], // which panels, top to bottom
//       y: 'A',                           // the amp panel: 'A' (amplitude, m) or 'A2' (A² over its peak)
//       lorentz: true,                    // with y: 'A2', the Lorentzian approximation, dashed
//       width: true,                      // with y: 'A2', the half-maximum line and the width marked
//       sliders: ['w', 'beta'],           // any of w beta w0 (true: all three; false or []: a still picture)
//       ranges: { beta: [0.1, 5], w0: [2, 15] },   // slider ranges
//       marks: true,                      // the drive's marker on each panel (false when a question asks for it)
//       readouts: ['A', 'delta', 'Q'],    // any of A delta Q width P w1; [] for none
//       cycles: 2,                        // time panel: how many drive periods to show
//   } }
//
// A picture must not show its answer: leave the asked-for quantity out of
// readouts, and set marks: false or width: false when it is read off a curve.

import { Plot } from '../plot.js';
import * as O from '../model/cm-osc.js';

export const defaults = {
  w0: 10, beta: 1, w: 9, f0: 1, wmax: 20, panels: ['amp', 'phase', 'time'], y: 'A', lorentz: true, width: true,
  sliders: ['w', 'beta'], ranges: null, marks: true, readouts: ['A', 'delta', 'Q'], cycles: 2,
};
const PANELS = ['amp', 'phase', 'time'], READS = ['A', 'delta', 'Q', 'width', 'P', 'w1'];
const trim = (x, n = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(n)) : '\\text{—}');
const texNum = (x, n = 3) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  return trim(x, n);
};

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const cv = {};
  for (const p of panels) cv[p] = F.canvas({ aspect: 'wide', label: { amp: 'The steady amplitude against drive frequency', phase: 'The phase lag against drive frequency', time: 'The drive and the response against time' }[p] });
  const rg = { w: [0.05 * P.wmax, P.wmax], beta: [0.05, 5], w0: [0.2 * P.wmax, 0.8 * P.wmax], ...(P.ranges || {}) };
  const sl = P.sliders === true ? ['w', 'beta', 'w0'] : P.sliders || [];
  const meta = {
    w: ['Drive frequency $\\omega$', '\\mathrm{rad/s}', 'The angular frequency of the push $f_0\\cos\\omega t$.'],
    beta: ['Damping $\\beta$', '\\mathrm{s^{-1}}', '$\\beta = b/2m$: the free motion dies like $e^{-\\beta t}$.'],
    w0: ['Natural frequency $\\omega_0$', '\\mathrm{rad/s}', '$\\omega_0 = \\sqrt{k/m}$: where the undamped system would ring.'],
  };
  for (const k of ['w', 'beta', 'w0']) {
    if (sl.includes(k)) F.slider({ key: k, label: meta[k][0], min: rg[k][0], max: rg[k][1], step: (rg[k][1] - rg[k][0]) / 400, value: P[k], unit: meta[k][1], explain: meta[k][2] });
    else F.params[k] = P[k];
  }
  F.onChange(() => draw());
  const plots = {};
  if (cv.amp) plots.amp = new Plot(cv.amp.canvas, { x: [0, P.wmax], y: [0, 1], xlabel: 'ω (rad/s)', ylabel: P.y === 'A2' ? 'A² / peak' : 'A (m)' });
  if (cv.phase) plots.phase = new Plot(cv.phase.canvas, { x: [0, P.wmax], y: [0, 180], xlabel: 'ω (rad/s)', ylabel: 'δ (°)', yticks: 4 });
  if (cv.time) plots.time = new Plot(cv.time.canvas, { x: [0, 1], y: [-1.3, 1.3], xlabel: 't (s)', ylabel: '', yticks: 0 });

  function draw() {
    const w0 = +F.params.w0, beta = +F.params.beta, w = +F.params.w, f0 = P.f0;
    const A = O.amp(w, w0, beta, f0), dl = O.phase(w, w0, beta);
    const marks = P.marks !== false;
    if (plots.amp) {
      const pa = plots.amp;
      if (P.y === 'A2') {
        const pk = O.amp(O.wPeak(w0, beta), w0, beta, f0) ** 2;
        pa.setView([0, P.wmax], [0, 1.12]);
        pa.clear();
        if (P.width !== false) {
          const half = 0.5;
          pa.line(0, half, P.wmax, half, { color: 'ink3', width: 1, dash: [4, 4] });
          pa.text('half maximum', P.wmax * 0.99, half, { color: 'ink3', size: 11, align: 'right', dy: -9 });
          const lo = w0 - beta, hi = w0 + beta;
          pa.arrow(w0, half, lo, half, { color: 'gold', width: 1.6, head: 7 });
          pa.arrow(w0, half, hi, half, { color: 'gold', width: 1.6, head: 7 });
          pa.text('2β', w0, half, { color: 'gold', size: 12, align: 'center', dy: 12, weight: 700 });
        }
        if (P.lorentz !== false) pa.fn((x) => O.lorentzA2(x, w0, beta, f0) / pk, { color: 'violet', width: 1.8, dash: [6, 4] });
        pa.fn((x) => O.amp(x, w0, beta, f0) ** 2 / pk, { color: 'accent', width: 2.4 });
        if (marks) pa.point(w, A * A / pk, { color: 'warn', r: 5.5 });
      } else {
        const top = Math.max(O.amp(O.wPeak(w0, beta), w0, beta, f0), f0 / (w0 * w0)) * 1.15;
        pa.setView([0, P.wmax], [0, top]);
        pa.clear();
        pa.line(0, f0 / (w0 * w0), P.wmax, f0 / (w0 * w0), { color: 'ink3', width: 1, dash: [3, 4] });
        pa.text('static: f₀/ω₀²', P.wmax * 0.99, f0 / (w0 * w0), { color: 'ink3', size: 11, align: 'right', dy: -9 });
        pa.fn((x) => O.amp(x, w0, beta, f0), { color: 'accent', width: 2.4 });
        if (marks) pa.point(w, A, { color: 'warn', r: 5.5 });
      }
      pa.line(w0, pa.vy0, w0, pa.vy1, { color: 'ink3', width: 1, dash: [2, 4] });
      pa.text('ω₀', w0, pa.vy1, { color: 'ink2', size: 11.5, dx: 4, dy: 8 });
      if (marks) pa.line(w, pa.vy0, w, pa.vy1, { color: 'warn', width: 1.2, alpha: 0.6 });
    }
    if (plots.phase) {
      const pp = plots.phase;
      pp.clear();
      pp.line(0, 90, P.wmax, 90, { color: 'ink3', width: 1, dash: [3, 4] });
      pp.line(w0, 0, w0, 180, { color: 'ink3', width: 1, dash: [2, 4] });
      pp.text('90°', P.wmax * 0.99, 90, { color: 'ink3', size: 11, align: 'right', dy: -9 });
      pp.fn((x) => (O.phase(x, w0, beta) * 180) / Math.PI, { color: 'violet', width: 2.4 });
      if (marks) { pp.point(w, (dl * 180) / Math.PI, { color: 'warn', r: 5.5 }); pp.line(w, 0, w, 180, { color: 'warn', width: 1.2, alpha: 0.6 }); }
    }
    if (plots.time) {
      const pt = plots.time, Tp = (2 * Math.PI) / w, span = (P.cycles || 2) * Tp;
      pt.setView([0, span], [-1.35, 1.35]);
      pt.clear();
      pt.fn((t) => Math.cos(w * t), { color: 'ink2', width: 2, dash: [6, 4] });
      pt.fn((t) => Math.cos(w * t - dl), { color: 'accent', width: 2.6 });
      pt.text('drive', span * 0.995, 1.22, { color: 'ink2', size: 11.5, align: 'right' });
      pt.text('response', span * 0.995, -1.22, { color: 'accent', size: 11.5, align: 'right' });
      if (marks) {
        // the first drive crest after t = 0 is at 0; the response crest trails it by δ/ω
        const lag = dl / w;
        pt.line(Tp, -1.1, Tp, 1.1, { color: 'ink3', width: 1, dash: [2, 3] });
        pt.line(Tp + lag, -1.1, Tp + lag, 1.1, { color: 'accent', width: 1, dash: [2, 3] });
        if (lag > span * 0.01) pt.arrow(Tp, 1.08, Tp + lag, 1.08, { color: 'warn', width: 1.6, head: 7 });
        pt.text('lag δ/ω', Tp + lag / 2, 1.08, { color: 'warn', size: 11, align: 'center', dy: -11 });
      }
    }
    const rows = (P.readouts || []).map((k) => ({
      A: ['$A$', `${texNum(A)}\\,\\mathrm{m}`],
      delta: ['$\\delta$', `${trim((dl * 180) / Math.PI)}^\\circ`],
      Q: ['$Q = \\omega_0/2\\beta$', trim(O.Q(w0, beta))],
      width: ['FWHM of $A^2$', `${trim(O.fwhmA2(w0, beta))}\\,\\mathrm{rad/s}`],
      P: ['$\\langle P\\rangle/m$', `${texNum(O.power(w, w0, beta, f0))}\\,\\mathrm{W/kg}`],
      w1: ['$\\omega_1$', `${trim(O.w1(w0, beta))}\\,\\mathrm{rad/s}`],
    }[k]));
    F.readout(rows);
  }
  F.draw(draw);
  F.caption('Linear spring, viscous damping, steady state only (the transient that dies like $e^{-\\beta t}$ is left out). In the time panel both curves are scaled to the same height: only their timing is to scale.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  for (const k of ['w0', 'beta', 'w', 'f0', 'wmax']) if (!(typeof P[k] === 'number' && P[k] > 0)) out.push(`${k} must be a positive number`);
  if (P.w0 >= P.wmax) out.push('w0 must lie inside the frequency axis (below wmax)');
  if (P.w > P.wmax) out.push('w must not exceed wmax');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`unknown panel “${p}”`);
  if (!['A', 'A2'].includes(P.y)) out.push("y must be 'A' or 'A2'");
  if (P.y === 'A2' && !(O.wPeak(P.w0, P.beta) > 0)) out.push('with y: A2 the damping must leave a peak (β < ω₀/√2)');
  for (const r of P.readouts || []) if (!READS.includes(r)) out.push(`unknown readout “${r}”`);
  const sl = P.sliders === true ? ['w', 'beta', 'w0'] : P.sliders || [];
  const rg = { w: [0.05 * P.wmax, P.wmax], beta: [0.05, 5], w0: [0.2 * P.wmax, 0.8 * P.wmax], ...(P.ranges || {}) };
  for (const k of sl) {
    if (!['w', 'beta', 'w0'].includes(k)) { out.push(`unknown slider “${k}”`); continue; }
    if (!(rg[k][0] < rg[k][1]) || P[k] < rg[k][0] || P[k] > rg[k][1]) out.push(`slider ${k}: value ${P[k]} must lie in its range [${rg[k]}]`);
  }
  return out;
}
