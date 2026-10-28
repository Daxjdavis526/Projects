// A periodic force driving a damped oscillator, taken apart by Fourier
// series — ẍ + 2βẋ + ω₀²x = f(t), with f of period τ. Three linked panels:
//   force     f(t) over two periods (grey) and its partial sum with N
//             harmonics (blue);
//   spectrum  the harmonics: bars of the force amplitudes |fₙ| at nω
//             (ω = 2π/τ), with the oscillator's gain curve 1/√((ω₀² − ω²)² + 4β²ω²)
//             dashed across them — and, beside each, the response amplitude
//             |xₙ| = |fₙ| × gain, so the harmonic that lands on the resonance
//             stands out;
//   response  the steady motion x(t), the sum of every harmonic's response
//             (blue), with the largest single harmonic's response dashed.
// Sliders: the period (or the pulse rate), the number of harmonics, and the
// pulse's duty cycle. The physics is model/cm-osc.js (test/cm-osc.test.mjs).
//
//   { type: 'cm-fourier', params: {
//       wave: 'pulse',            // pulse (height h for a fraction d of each period), square (±h), sawtooth, triangle
//       h: 1, d: 0.5,             // height (m/s², force per unit mass) and the pulse's duty cycle
//       tau: 2,                   // the period (s)
//       w0: 9.42, beta: 0.1,      // the oscillator: ω₀ (rad/s), β (s⁻¹)
//       N: 9,                     // harmonics in the partial sum and the spectrum (the response always uses 60)
//       panels: ['force', 'spectrum', 'response'],
//       sliders: ['tau', 'N', 'd'],   // any of tau N d beta (false or []: a still picture)
//       ranges: { tau: [0.5, 4] },
//       nmax: 9,                  // how many harmonics the spectrum shows
//       units: { t: 's', x: 'm' },
//       readouts: ['w', 'near', 'share'],   // any of w near share xrms; [] for none
//       values: true,             // numbers on the spectrum bars
//       response: true,           // false: the spectrum shows the force alone (no gain curve, no response bars)
//   } }

import { Plot } from '../plot.js';
import * as O from '../model/cm-osc.js';

export const defaults = {
  wave: 'pulse', h: 1, d: 0.5, tau: 2, w0: 9.42, beta: 0.1, N: 9, panels: ['force', 'spectrum', 'response'],
  sliders: ['tau', 'N', 'd'], ranges: null, nmax: 9, readouts: ['w', 'near', 'share'], values: true, response: true,
};
const PANELS = ['force', 'spectrum', 'response'], READS = ['w', 'near', 'share', 'xrms'];
const NRESP = 60;
const trim = (x, n = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(n)) : '\\text{—}');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const cv = {};
  for (const p of panels) cv[p] = F.canvas({ aspect: 'wide', label: { force: 'The periodic force and its Fourier partial sum', spectrum: 'The force’s harmonics against frequency, with the oscillator’s gain curve', response: 'The steady response of the oscillator' }[p] });
  const sl = P.sliders === true ? ['tau', 'N', 'd', 'beta'] : P.sliders || [];
  const rg = { tau: [0.5, 4], N: [1, 25], d: [0.05, 0.95], beta: [0.02, 2], ...(P.ranges || {}) };
  const meta = {
    tau: ['Period $\\tau$', '\\mathrm{s}', 'The time between pulses; the harmonics sit at $n\\omega = 2\\pi n/\\tau$.', (rg.tau[1] - rg.tau[0]) / 300],
    N: ['Harmonics $N$', '', 'How many terms of the series the top panel and the spectrum show.', 1],
    d: ['Duty cycle $d$', '', 'The fraction of each period the pulse is on.', 0.01],
    beta: ['Damping $\\beta$', '\\mathrm{s^{-1}}', 'The oscillator’s damping, $b/2m$.', (rg.beta[1] - rg.beta[0]) / 200],
  };
  for (const k of ['tau', 'N', 'd', 'beta']) {
    if (sl.includes(k) && !(k === 'd' && P.wave !== 'pulse')) F.slider({ key: k, label: meta[k][0], min: rg[k][0], max: rg[k][1], step: meta[k][3], value: P[k], unit: meta[k][1], explain: meta[k][2] });
    else F.params[k] = P[k];
  }
  F.onChange(() => draw());
  const plots = {};
  if (cv.force) plots.force = new Plot(cv.force.canvas, { x: [0, 1], y: [-1, 1], xlabel: `t (${P.units?.t || 's'})`, ylabel: 'f (m/s²)' });
  if (cv.spectrum) plots.spectrum = new Plot(cv.spectrum.canvas, { x: [0, 1], y: [0, 1.15], xlabel: 'ω (rad/s)', ylabel: 'relative size', yticks: 0 });
  if (cv.response) plots.response = new Plot(cv.response.canvas, { x: [0, 1], y: [-1, 1], xlabel: `t (${P.units?.t || 's'})`, ylabel: `x (${P.units?.x || 'm'})` });

  function draw() {
    const tau = +F.params.tau, N = Math.round(+F.params.N), d = +F.params.d, beta = +F.params.beta;
    const w = (2 * Math.PI) / tau, h = P.h, w0 = P.w0;
    const C = O.coeffs(P.wave, NRESP, h, d);
    const R = O.response(C, tau, w0, beta, NRESP);
    const span = 2 * tau, t0 = -tau / 2;
    if (plots.force) {
      const pf = plots.force;
      pf.setView([0, span], [P.wave === 'pulse' ? -0.25 * h : -1.35 * h, h * 1.3]);
      pf.clear();
      pf.fn((t) => O.wave(P.wave, t + t0, tau, h, d), { color: 'ink3', width: 1.6, samples: 900 });
      pf.fn((t) => O.partial(C, t + t0, tau, N), { color: 'accent', width: 2.2, samples: 900 });
    }
    const nmax = P.nmax || 9;
    const harm = R.harm.slice(0, nmax);
    const best = R.harm.slice(0, NRESP).reduce((b, x) => (x.A > b.A ? x : b), { A: -1 });
    if (plots.spectrum) {
      const ps = plots.spectrum, wtop = P.response === false ? (nmax + 0.6) * w : Math.max((nmax + 0.6) * w, w0 * 1.25);
      ps.setView([0, wtop], [0, 1.18]);
      ps.clear();
      const fmax = Math.max(1e-12, Math.abs(C.c0), ...harm.map((x) => x.f));
      const Amax = Math.max(1e-12, ...harm.map((x) => x.A));
      const gmax = O.amp(O.wPeak(w0, beta) || w0, w0, beta);
      const resp = P.response !== false;
      if (resp) {
        ps.fn((x) => O.amp(x, w0, beta) / gmax, { color: 'violet', width: 1.6, dash: [6, 4], domain: [0, wtop] });
        ps.line(w0, 0, w0, 1.18, { color: 'ink3', width: 1, dash: [2, 4] });
        ps.text('ω₀', w0, 1.12, { color: 'violet', size: 11.5, dx: 4 });
      }
      const bw = Math.min(w * 0.18, wtop * 0.012);
      harm.forEach((x, i) => {
        if (i + 1 > N) return;
        const yf = x.f / fmax, yx = x.A / Amax;
        if (yf > 1e-9) ps.rect(x.w - bw * 1.05, 0, bw, yf, { color: 'accent', alpha: 0.55, width: 1 });
        if (resp && yx > 1e-9) ps.rect(x.w + bw * 0.05, 0, bw, yx, { color: 'gold', alpha: 0.75, width: 1 });
        if (P.values !== false && N <= 12 && (yf > 1e-9 || yx > 1e-9)) ps.text(`${x.n}ω`, x.w, Math.max(yf, yx), { color: 'ink3', size: 10, align: 'center', dy: -9 });
      });
      ps.text('force harmonics', 6, 14, { screen: true, color: 'accent', size: 11.5, weight: 650, dx: ps.L });
      if (resp) {
        ps.text('response harmonics', 6, 30, { screen: true, color: 'gold', size: 11.5, weight: 650, dx: ps.L });
        ps.text('gain curve', 6, 46, { screen: true, color: 'violet', size: 11.5, weight: 650, dx: ps.L });
      }
    }
    if (plots.response) {
      const pr = plots.response;
      let lo = Math.min(0, R.x0), hi = Math.max(0, R.x0);
      for (let i = 0; i <= 600; i++) { const v = R.x(t0 + (span * i) / 600); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const pad = Math.max(1e-12, hi - lo) * 0.15;
      pr.setView([0, span], [lo - pad, hi + pad]);
      pr.clear();
      if (best.A > 0) {
        const n = best.n, a = C.a[n - 1], b = C.b[n - 1], g = O.amp(n * w, w0, beta), dl = O.phase(n * w, w0, beta);
        pr.fn((t) => R.x0 + g * (a * Math.cos(n * w * (t + t0) - dl) + b * Math.sin(n * w * (t + t0) - dl)), { color: 'gold', width: 1.6, dash: [6, 4], samples: 900 });
      }
      pr.fn((t) => R.x(t + t0), { color: 'accent', width: 2.4, samples: 900 });
    }
    const near = R.harm.reduce((b, x) => (Math.abs(x.w - w0) < Math.abs(b.w - w0) ? x : b), R.harm[0]);
    const tot = R.harm.reduce((s, x) => s + x.A * x.A, 0);
    const rows = (P.readouts || []).map((k) => ({
      w: ['$\\omega = 2\\pi/\\tau$', `${trim(w)}\\,\\mathrm{rad/s}`],
      near: ['harmonic nearest $\\omega_0$', `n = ${near.n}`],
      share: ['its share of $\\langle x^2\\rangle$', `${trim((100 * near.A * near.A) / Math.max(tot, 1e-300), 3)}\\%`],
      xrms: ['$x_\\text{rms}$ (oscillating part)', `${trim(Math.sqrt(tot / 2))}\\,\\mathrm{${P.units?.x || 'm'}}`],
    }[k]));
    F.readout(rows);
  }
  F.draw(draw);
  F.caption('Steady state only, after the start-up transient has died away. The response sums 60 harmonics; the spectrum shows each set of bars relative to its own largest, so compare heights within a colour, not across. Linear oscillator, so superposition is exact.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!O.WAVES.includes(P.wave)) out.push(`wave must be one of ${O.WAVES.join(', ')}`);
  for (const k of ['h', 'tau', 'w0', 'beta']) if (!(typeof P[k] === 'number' && P[k] > 0)) out.push(`${k} must be a positive number`);
  if (!(P.d > 0 && P.d < 1)) out.push('d must lie in (0, 1)');
  if (!(Number.isInteger(P.N) && P.N >= 1 && P.N <= 60)) out.push('N must be a whole number from 1 to 60');
  if (!(Number.isInteger(P.nmax) && P.nmax >= 1 && P.nmax <= 30)) out.push('nmax must be a whole number from 1 to 30');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`unknown panel “${p}”`);
  for (const r of P.readouts || []) if (!READS.includes(r)) out.push(`unknown readout “${r}”`);
  const sl = P.sliders === true ? ['tau', 'N', 'd', 'beta'] : P.sliders || [];
  const rg = { tau: [0.5, 4], N: [1, 25], d: [0.05, 0.95], beta: [0.02, 2], ...(P.ranges || {}) };
  for (const k of sl) {
    if (!['tau', 'N', 'd', 'beta'].includes(k)) { out.push(`unknown slider “${k}”`); continue; }
    if (!(rg[k][0] < rg[k][1]) || P[k] < rg[k][0] || P[k] > rg[k][1]) out.push(`slider ${k}: value ${P[k]} must lie in [${rg[k]}]`);
  }
  return out;
}
