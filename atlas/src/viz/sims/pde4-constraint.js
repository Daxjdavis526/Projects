// Constraints riding along with an evolution (module B14 of the PDE course).
// Top: the fields at time t and the constraint violation C(x) beneath them.
// Bottom: the largest violation max|C| against time on a logarithmic scale.
//   maxwell — a blob of charge drifting through a neutralizing background,
//             E_t = −J, checked against Gauss's law E_x = ρ (ε₀ = 1). The
//             staggered scheme updates E with the very flux that moves the
//             charge; the collocated one does not, and Gauss's law drifts.
//   wave    — the first-order wave system u_t = π, π_t = φ_x,
//             φ_t = π_x − γ(φ − u_x), started with φ wrong by a fraction ε;
//             the violation C = φ − u_x obeys C_t = −γC (dashed reference).
// Numerics in model/pde4-constraint.js (test/pde4-fd.test.mjs).
//
//   { type: 'pde4-constraint', params: {
//       mode: 'maxwell',          // maxwell | wave
//       scheme: 'collocated',     // maxwell: staggered | collocated
//       schemes: null,            // maxwell: a choice between them, e.g. ['staggered', 'collocated']
//       N: 100, Ns: null,         // grid points; Ns: a choice, e.g. [50, 100, 200]
//       gamma: 0, gmin: -1, gmax: 3,   // wave: the damping rate γ (1/s) and its slider's range
//       eps: 0.1,                 // wave: the fractional error put into φ at t = 0
//       t: 0, tmax: 10,           // the moment shown; the length of the run (s)
//       logmin: -16,              // the history panel's floor, a power of ten
//       controls: null,           // true, false, or a list of: scheme N gamma eps t
//       play: null,
//       readout: true,
//       hide: [],                 // readouts shown as “?”: C ratio
//   } }

import { Plot } from '../plot.js';
import * as K from '../model/pde4-constraint.js';

export const defaults = { mode: 'maxwell', scheme: 'collocated', schemes: null, N: 100, Ns: null, gamma: 0, gmin: -1, gmax: 3, eps: 0.1, t: 0, tmax: 10, logmin: -16, controls: null, play: null, readout: true, hide: [] };
const CONTROLS = ['scheme', 'N', 'gamma', 'eps', 't'];
const HIDE = ['C', 'ratio'];
const texNum = (x) => {
  if (!Number.isFinite(x)) return '\\infty';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e4)) { const [mm, e] = x.toExponential(2).split('e'); return `${+mm}\\times10^{${+e}}`; }
  return String(+x.toPrecision(3));
};

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const mx = P.mode === 'maxwell';
  const schemes = mx && Array.isArray(P.schemes) && P.schemes.length ? P.schemes : [P.scheme];
  const auto = mx ? [...(schemes.length > 1 ? ['scheme'] : []), ...(P.Ns ? ['N'] : []), 't'] : ['gamma', ...(P.Ns ? ['N'] : []), 't'];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? auto : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));

  ctl('scheme', () => F.choice({ key: 'scheme', label: 'Where E lives', options: schemes.map((s) => [s, s === 'staggered' ? 'between grid points' : 'on grid points']), value: P.scheme, explain: 'Between grid points, $E$ is updated by the same flux that moves the charge. On them, it is updated with $J_j = v\\rho_j$ and checked with a centred difference.' }));
  ctl('N', () => F.choice({ key: 'N', label: 'Grid points $N$', options: (P.Ns || [P.N]).map((n) => [n, String(n)]), value: P.N, explain: 'More points, smaller $\\Delta x$.' }));
  ctl('gamma', () => F.slider({ key: 'gamma', label: 'Damping rate $\\gamma$', min: P.gmin, max: P.gmax, step: 0.05, value: P.gamma, unit: '\\mathrm{s^{-1}}', explain: 'The coefficient of the term $-\\gamma(\\varphi - u_x)$ added to the $\\varphi$ equation. Negative values stand for a formulation that amplifies violations.' }));
  ctl('eps', () => F.slider({ key: 'eps', label: 'Initial error in $\\varphi$', min: 0, max: 0.3, step: 0.01, value: P.eps, explain: 'At $t = 0$, $\\varphi = (1 + \\varepsilon)u_x$: initial data that break the constraint.' }));
  ctl('t', () => F.slider({ key: 't', label: 'Time $t$', min: 0, max: P.tmax, step: P.tmax / 200, value: P.t, unit: '\\mathrm{s}', explain: 'The moment shown above, and the gold line below.' }));

  const top = F.canvas({ aspect: 'wide', label: P.alt || (mx ? 'Charge density, electric field and the Gauss-law violation along the line' : 'The wave, its auxiliary field and the constraint violation along the line') });
  const bot = F.canvas({ aspect: 'wide', label: 'The largest constraint violation against time, on a logarithmic scale' });
  const tp = new Plot(top.canvas, { x: [0, 1], y: [-1, 1], xlabel: 'x (m)', ylabel: '', axesAt: 'edge', yticks: 0 });
  const hp = new Plot(bot.canvas, { x: [0, P.tmax], y: [P.logmin, 1], xlabel: 't (s)', ylabel: 'max |C|', axesAt: 'edge', ylog: true, yfmt: (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? (Math.round(v) === 0 ? '1' : `10${String(Math.round(v)).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`) : '') });

  let cache = { key: '' };
  const result = () => {
    const p = F.params;
    const o = mx ? { N: +p.N, scheme: p.scheme, tmax: P.tmax } : { N: +p.N, gamma: p.gamma, eps: p.eps, tmax: P.tmax };
    const key = JSON.stringify(o);
    if (key !== cache.key) cache = { key, o, R: mx ? K.runMaxwell(o) : K.runWave(o) };
    return cache;
  };

  function drawTop() {
    const { R } = result(), S = K.at(R, F.params.t);
    const narrow = (top.canvas.clientWidth || 600) < 520, fs = narrow ? 9.5 : 11;
    const XR = mx ? 10 : 2 * Math.PI;
    const Cmax = Math.max(1e-300, ...S.C.map(Math.abs));
    const cs = (mx ? 0.35 : 0.45) / Math.max(Cmax, 1e-300);   // the violation, drawn to its own scale in the bottom band
    tp.setView([0, XR], [-1.25, mx ? 1.25 : 1.3]);
    tp.clear();
    tp.line(0, -0.8, XR, -0.8, { color: 'ink4', width: 1 });
    if (mx) {
      tp.path(R.x.map((x, j) => [x, 0.25 + 0.75 * S.rho[j]]), { color: 'warn', width: 2 });
      tp.path(R.xE.map((x, j) => [x, 0.25 + 0.75 * S.E[j] / 0.6]), { color: 'accent', width: 2.2 });
      tp.text('ρ (charge)', 0.2, 1.1, { color: 'warn', size: fs });
      tp.text('E', narrow ? 2.2 : 1.7, 1.1, { color: 'accent', size: fs });
    } else {
      tp.path(R.x.map((x, j) => [x, 0.1 + 0.9 * S.u[j]]), { color: 'accent', width: 2.2 });
      tp.path(R.x.map((x, j) => [x, 0.1 + 0.25 * S.phi[j]]), { color: 'gold', width: 1.8 });
      tp.path(R.x.map((x, j) => [x, 0.1 + 0.25 * S.ux[j]]), { color: 'ink2', width: 1.4, dash: [4, 3] });
      tp.text('u', 0.15, 1.15, { color: 'accent', size: fs });
      tp.text('φ', narrow ? 0.65 : 0.5, 1.15, { color: 'gold', size: fs });
      tp.text('uₓ (dashed)', narrow ? 1.1 : 0.85, 1.15, { color: 'ink2', size: fs });
    }
    const tiny = Cmax < 1e-12;
    tp.path(R.x.map((x, j) => [x, -0.8 + (tiny ? 0 : cs * S.C[j])]), { color: 'bad', width: 2 });
    tp.text(tiny ? `violation C: round-off only (largest ${texPlain(Cmax)})` : `violation C, scaled to its largest value, ${texPlain(Cmax)}`, XR, -1.18, { align: 'right', dx: -4, size: fs, color: 'bad' });
    tp.text(`t = ${S.t.toFixed(2)} s`, XR, 1.15, { align: 'right', dx: -4, size: fs, color: 'ink2' });
  }

  function drawHist() {
    const { R } = result();
    const lo = P.logmin, ytop = Math.max(1, Math.ceil(Math.log10(Math.max(...R.hist.map((h) => h[1])))) + 0.3);
    hp.setView([0, P.tmax], [lo, ytop]);
    hp.clear();
    const L10 = (v) => Math.max(lo - 1, Math.log10(Math.max(v, 1e-300)));
    const stride = Math.max(1, Math.floor(R.hist.length / 800));
    hp.path(R.hist.filter((_, i) => i % stride === 0).map(([t, c]) => [t, L10(c)]), { color: 'bad', width: 2.2 });
    if (!mx) {
      const c0 = R.hist[0][1], g = F.params.gamma;
      hp.fn((t) => L10(c0 * Math.exp(-g * t)), { color: 'ink2', width: 1.4, dash: [5, 4] });
    }
    hp.line(F.params.t, lo, F.params.t, ytop, { color: 'gold', width: 1.4, dash: [6, 4] });
    const narrow = (bot.canvas.clientWidth || 600) < 520, fs = narrow ? 9.5 : 11;
    if (!mx) hp.text('dashed: C(0) e^(−γt)', P.tmax, ytop, { align: 'right', dx: -4, dy: 10, size: fs, color: 'ink2' });
  }

  function readout() {
    if (P.readout === false) return;
    const { R } = result(), S = K.at(R, F.params.t);
    const Cm = Math.max(...S.C.map(Math.abs)), C0 = R.hist[0][1];
    const q = (k, v) => (hide.has(k) ? '?' : v);
    F.readout([
      ['$t$', `${S.t.toFixed(2)}\\,\\text{s}`],
      ['$\\Delta x$', `${texNum(R.dx)}\\,\\text{m}`],
      ['$\\max|C|$', q('C', texNum(Cm))],
      mx ? null : ['$\\max|C|$ now ÷ at $t = 0$', q('ratio', texNum(Cm / C0))],
    ]);
  }

  function drawAll() { drawTop(); drawHist(); readout(); }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = wanted.includes('t') && (P.play ?? !F.compact) && !reduced();
  const tick = (dt) => { let v = F.params.t + (dt * P.tmax) / 10; if (v > P.tmax) v = 0; F.set('t', +v.toFixed(4)); };
  let loop = F.animate((dt) => { if (running) tick(dt); });
  if (wanted.includes('t') && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) tick(dt); }, { force: running });
    } });
    F.button({ label: 'Back to t = 0', onClick: () => F.set('t', 0) });
  }
  F.onChange(() => drawAll());
  F.draw(drawAll);
  F.caption(P.caption || (mx
    ? 'One dimension of Maxwell’s equations (ε₀ = 1) on a periodic line 10 m long: a charge blob drifting at 1 m/s, moved by the upwind scheme with Courant number 0.5. Field and charge are drawn to arbitrary scales; the violation (red) is drawn to its own scale, printed beside it.'
    : 'The first-order wave system on a periodic line of length 2π, centred differences and RK4 with Δt = Δx/2. u, φ and the violation are drawn to their own scales.'));
  return { get: (k) => F.params[k] };
}

function texPlain(x) {
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e4)) {
    const e = Math.floor(Math.log10(a)), m = +(x / 10 ** e).toPrecision(2);
    return `${m}×10${String(e).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`;
  }
  return String(+x.toPrecision(2));
}

export function validate(P) {
  const p = [];
  if (!['maxwell', 'wave'].includes(P.mode)) p.push('pde4-constraint: mode is maxwell or wave');
  if (!['staggered', 'collocated'].includes(P.scheme)) p.push('pde4-constraint: scheme is staggered or collocated');
  if (P.schemes != null && !(Array.isArray(P.schemes) && P.schemes.every((s) => ['staggered', 'collocated'].includes(s)) && P.schemes.includes(P.scheme))) p.push('pde4-constraint: schemes lists staggered/collocated and includes scheme');
  if (!(Number.isInteger(P.N) && P.N >= 20 && P.N <= 400 && P.N % 2 === 0)) p.push('pde4-constraint: N is an even whole number from 20 to 400');
  if (P.Ns != null && !(Array.isArray(P.Ns) && P.Ns.includes(P.N) && P.Ns.every((n) => Number.isInteger(n) && n >= 20 && n <= 400 && n % 2 === 0))) p.push('pde4-constraint: Ns lists grid sizes (20–400) and includes N');
  if (!(P.gmin <= P.gamma && P.gamma <= P.gmax && P.gmin >= -2 && P.gmax <= 10)) p.push('pde4-constraint: gmin ≤ gamma ≤ gmax, within [−2, 10]');
  if (!(P.eps >= 0 && P.eps <= 0.3)) p.push('pde4-constraint: eps lies in [0, 0.3]');
  if (!(P.t >= 0 && P.t <= P.tmax && P.tmax > 0 && P.tmax <= 40)) p.push('pde4-constraint: 0 ≤ t ≤ tmax ≤ 40');
  if (!(Number.isInteger(P.logmin) && P.logmin < 0 && P.logmin >= -18)) p.push('pde4-constraint: logmin is a negative whole number ≥ −18');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde4-constraint: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde4-constraint: unknown hide “${h}”`);
  return p;
}
