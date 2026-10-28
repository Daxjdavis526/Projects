// A Fourier series converging — or not — three ways at once. Panels:
//   x     one period of f (grey, dashed) and its partial sum S_N (blue), with a
//         probe line at x₀ (gold): the dot is S_N(x₀), the ring f(x₀) (at a
//         jump, the midpoint). Optional gold lines at the Gibbs limit, the
//         level the peak of S_N tends to beside each jump;
//   err   three errors against N on log–log axes: the root-mean-square error
//         ‖f − S_N‖ (blue, exact from Parseval), the pointwise error
//         |f(x₀) − S_N(x₀)| at the probe (gold) and the uniform error
//         max |f − S_N| (red, dashed) — the current N marked;
//   spec  the energy (aₙ² + bₙ²)/2 in each harmonic as a share of ⟨f²⟩,
//         harmonics in the sum blue and those left out grey (Bessel's sum
//         grows to Parseval's total), or with spec: 'log' the amplitudes
//         √(aₙ² + bₙ²) on a log scale, where a jump shows as a 1/n fall, a
//         kink as 1/n² and a smooth wave as a straight (exponential) drop.
// Summation: Dirichlet (plain partial sums), Fejér (the average of the first
// N + 1 partial sums) or Lanczos (σ-factors). Model and numbers in
// model/fa-series.js (test/fa-series.test.mjs).
//
//   { type: 'fa-series', params: {
//       wave: 'square',          // square saw triangle parabola smooth pulse
//       waves: null,             // a choice between waves, e.g. ['square', 'triangle', 'smooth']
//       N: 9, Nmax: 60,          // harmonics in the sum, and the slider's top (≤ 200)
//       method: 'dirichlet',     // dirichlet fejer lanczos
//       methods: null,           // a choice between methods
//       x0: 1,                   // the probe point (rad, −π … π)
//       panels: ['x', 'err'],    // any of x err spec, in this order
//       controls: null,          // null: the natural ones; or a list of wave N method x0; false: none
//       errN: 200,               // the err panel's last N
//       spec: 'energy', nshow: 15,   // energy or log; harmonics shown in the spec panel
//       gibbs: false,            // gold lines at the Gibbs limit beside the jumps
//       mark: false,             // mark the highest point of S_N
//       probe: true,             // the probe line in the x panel
//       window: null,            // [a, b]: the x panel's range (default −π … π)
//       readouts: ['N', 'pt', 'rms', 'sup'],   // any of N Sx pt rms sup peak over energy
//       hide: [],                // readouts shown as “?”
//       labels: true,            // the legend text on the canvases
//   } }
//
// A slider item may read N (or x0) with get. A problem's picture must not
// show its answer: hide the readout that gives it away.

import { Plot, pow10Label } from '../plot.js';
import * as M from '../model/fa-series.js';

export const defaults = {
  wave: 'square', waves: null, N: 9, Nmax: 60, method: 'dirichlet', methods: null, x0: 1, panels: ['x', 'err'], controls: null,
  errN: 200, spec: 'energy', nshow: 15, gibbs: false, mark: false, probe: true, window: null, readouts: ['N', 'pt', 'rms', 'sup'], hide: [], labels: true,
};
const PANELS = ['x', 'err', 'spec'], CONTROLS = ['wave', 'N', 'method', 'x0'], READS = ['N', 'Sx', 'pt', 'rms', 'sup', 'peak', 'over', 'energy'];
const WLABEL = { square: 'Square wave (jumps)', saw: 'Sawtooth (one jump)', triangle: 'Triangle (kinks)', parabola: 'Parabola (kink at ±π)', smooth: 'Smooth: e^(cos x − 1)', pulse: 'Pulse (two jumps)' };
const MLABEL = { dirichlet: 'Plain partial sums', fejer: 'Fejér averages', lanczos: 'Lanczos σ-factors' };
const g4 = (x) => (Number.isFinite(x) ? String(+x.toPrecision(4)) : '\\text{—}');
const g3 = (x) => (Number.isFinite(x) ? (Math.abs(x) < 1e-3 && x !== 0 ? (() => { const [m, e] = x.toExponential(2).split('e'); return `${m}\\times10^{${+e}}`; })() : String(+x.toPrecision(3))) : '\\text{—}');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const waves = Array.isArray(P.waves) && P.waves.length ? P.waves : [P.wave];
  const methods = Array.isArray(P.methods) && P.methods.length ? P.methods : [P.method];
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const natural = [...(waves.length > 1 ? ['wave'] : []), 'N', ...(methods.length > 1 ? ['method'] : []), ...(panels.includes('err') && P.probe !== false ? ['x0'] : [])];
  const wanted = P.controls === false ? [] : Array.isArray(P.controls) ? P.controls : natural;
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('wave', () => F.choice({ key: 'wave', label: 'Function', options: waves.map((w) => [w, WLABEL[w]]), value: P.wave, explain: 'Each is periodic with period $2\\pi$; how rough it is decides how fast its series converges.' }));
  ctl('N', () => F.slider({ key: 'N', label: 'Harmonics $N$', min: 1, max: P.Nmax, step: 1, value: P.N, unit: '', explain: 'The partial sum keeps $n = 0, 1, \\dots, N$.' }));
  ctl('method', () => F.choice({ key: 'method', label: 'Summation', options: methods.map((m) => [m, MLABEL[m]]), value: P.method, explain: 'Fejér averages the partial sums $S_0, \\dots, S_N$; Lanczos tapers each term by $\\sin u/u$ with $u = n\\pi/(N+1)$.' }));
  ctl('x0', () => F.slider({ key: 'x0', label: 'Probe $x_0$', min: -3.14, max: 3.14, step: 0.01, value: P.x0, unit: '\\mathrm{rad}', explain: 'Where the pointwise error $|f(x_0) - S_N(x_0)|$ is measured.' }));

  const cv = {};
  for (const p of panels) cv[p] = F.canvas({ aspect: 'wide', label: { x: 'One period of the function and its Fourier partial sum', err: 'Three errors of the partial sum against the number of harmonics, on log–log axes', spec: 'The energy in each harmonic' }[p] });
  const plots = {};
  const win = P.window || [-Math.PI, Math.PI];
  if (cv.x) plots.x = new Plot(cv.x.canvas, { x: win, y: [-1.3, 1.3], xlabel: 'x (rad)', ylabel: 'f', axesAt: 'edge' });
  if (cv.err) plots.err = new Plot(cv.err.canvas, { x: [0, Math.log10(P.errN)], y: [-4, 0.5], xlabel: 'N', ylabel: 'error', xfmt: pow10Label, yfmt: pow10Label, axesAt: 'edge' });
  if (cv.spec) plots.spec = new Plot(cv.spec.canvas, { x: [-0.6, P.nshow + 0.6], y: [0, 1], xlabel: 'harmonic n', ylabel: P.spec === 'log' ? 'amplitude' : 'share of ⟨f²⟩', yfmt: P.spec === 'log' ? pow10Label : undefined, axesAt: 'edge' });

  let cacheKey = '', curves = null;
  function draw() {
    const wave = F.params.wave, N = Math.round(+F.params.N), method = F.params.method, x0 = +F.params.x0;
    const W = M.WAVE[wave];
    const C = M.coeffs(wave, Math.max(N, P.nshow));
    const narrow = (Object.values(cv)[0]?.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    const jumpSize = W.jumps.length ? Math.max(...W.jumps.map((j) => Math.abs(M.f(wave, j + 1e-9) - M.f(wave, j - 1e-9)))) : 0;
    const pk = (P.mark || (P.readouts || []).some((r) => r === 'peak' || r === 'over')) ? M.peak(wave, N, method) : null;
    if (plots.x) {
      const px = plots.x;
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i <= 400; i++) { const x = win[0] + ((win[1] - win[0]) * i) / 400; const v = M.f(wave, x); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const pad = 0.28 * (hi - lo);
      px.setView(win, [lo - pad, hi + pad]);
      px.clear();
      if (P.gibbs && jumpSize) for (const y of [hi + M.GIBBS_FRAC * jumpSize, lo - M.GIBBS_FRAC * jumpSize]) px.line(win[0], y, win[1], y, { color: 'gold', width: 1.1, dash: [5, 4] });
      px.fn((x) => M.f(wave, x), { color: 'ink3', width: 1.5, dash: [5, 4], samples: 1200 });
      px.fn((x) => M.partial(C, x, N, method), { color: 'accent', width: 2.3, samples: Math.max(900, 12 * N) });
      if (P.probe !== false && panels.includes('err')) {
        px.line(x0, lo - pad, x0, hi + pad, { color: 'gold', width: 1.2, dash: [3, 3] });
        px.point(x0, M.f(wave, x0), { color: 'bg', ring: 'gold', r: 4.5 });
        px.point(x0, M.partial(C, x0, N, method), { color: 'gold', r: 3.5 });
      }
      if (P.mark && pk && pk.x >= win[0] && pk.x <= win[1]) px.point(pk.x, pk.y, { color: 'bad', r: 4, label: 'peak', ldx: 7, ldy: -9 });
      if (P.labels !== false) {
        px.text(`partial sum, N = ${N}`, win[1], hi + pad, { color: 'accent', align: 'right', size: fs, dx: -6, dy: 12, weight: 650 });
        px.text('f (dashed)', win[1], hi + pad, { color: 'ink3', align: 'right', size: fs, dx: -6, dy: 28, weight: 650 });
        if (P.gibbs && jumpSize) px.text('Gibbs limit', win[0], hi + M.GIBBS_FRAC * jumpSize, { color: 'gold', size: fs, dx: 6, dy: -9 });
      }
    }
    if (plots.err) {
      const key = `${wave}|${method}|${x0}`;
      if (key !== cacheKey) { curves = M.errorCurves(wave, method, x0, P.errN); cacheKey = key; }
      const pe = plots.err;
      const L = (v) => Math.log10(Math.max(v, 1e-16));
      const all = [...curves.rms, ...curves.sup].map(L);
      const ymin = Math.max(-16, Math.floor(Math.min(...all, L(curves.pt[curves.pt.length - 1])) - 0.2));
      const ymax = Math.max(0.5, Math.ceil(Math.max(...all) + 0.3));
      pe.setView([0, Math.log10(P.errN)], [Math.max(ymin, -16), ymax]);
      pe.clear();
      const lo = pe.vy0, line = (arr, o) => pe.path(arr.map((v, i) => [Math.log10(i + 1), Math.max(lo, L(v))]), o);
      line(curves.sup, { color: 'bad', width: 1.8, dash: [6, 4] });
      line(curves.pt, { color: 'gold', width: 1.8 });
      line(curves.rms, { color: 'accent', width: 2.4 });
      pe.line(Math.log10(N), pe.vy0, Math.log10(N), pe.vy1, { color: 'ink3', width: 1.2, dash: [3, 4] });
      if (P.labels !== false) {
        const R = Math.log10(P.errN);
        pe.text('rms error', R, pe.vy1, { color: 'accent', align: 'right', size: fs, dx: -6, dy: 12, weight: 650 });
        pe.text('error at x₀', R, pe.vy1, { color: 'gold', align: 'right', size: fs, dx: -6, dy: 28, weight: 650 });
        pe.text('largest error', R, pe.vy1, { color: 'bad', align: 'right', size: fs, dx: -6, dy: 44, weight: 650 });
      }
    }
    if (plots.spec) {
      const ps = plots.spec, nshow = P.nshow;
      const E = M.energies(wave, nshow).map((e) => e / W.msq);
      const wts = E.map((_, n) => M.weight(method, n, N));
      if (P.spec === 'log') {
        const A = C.a.slice(0, nshow + 1).map((a, n) => (n === 0 ? Math.abs(a) : Math.hypot(a, C.b[n])));
        const pos = A.filter((v) => v > 1e-16).map(Math.log10);
        ps.setView([-0.6, nshow + 0.6], [Math.floor(Math.min(...pos)) - 0.2, Math.ceil(Math.max(...pos)) + 0.2]);
        ps.clear();
        A.forEach((v, n) => { if (v > 1e-16) { ps.line(n, ps.vy0, n, Math.log10(v), { color: n <= N ? 'accent' : 'ink4', width: 2 }); ps.point(n, Math.log10(v), { color: n <= N ? 'accent' : 'ink4', r: 3.2 }); } });
      } else {
        const top = Math.max(...E) * 1.18;
        ps.setView([-0.6, nshow + 0.6], [0, top]);
        ps.clear();
        E.forEach((e, n) => { if (e > 1e-12) ps.rect(n - 0.32, 0, 0.64, e, { color: n <= N ? 'accent' : 'ink4', alpha: n <= N ? 0.4 + 0.45 * wts[n] : 0.25, width: 1 }); });
      }
      if (P.labels !== false) ps.text(`kept: n ≤ ${N}`, nshow + 0.6, ps.vy1, { color: 'accent', align: 'right', size: fs, dx: -6, dy: 12, weight: 650 });
    }
    const q = (k, v) => (hide.has(k) ? '?' : v);
    const fx = M.f(wave, x0), Sx = M.partial(C, x0, N, method);
    const rows = (P.readouts || []).map((k) => ({
      N: ['harmonics $N$', String(N)],
      Sx: ['$S_N(x_0)$ vs $f(x_0)$', q('Sx', `${g4(Sx)}\\ \\text{vs}\\ ${g4(fx)}`)],
      pt: ['error at $x_0$', q('pt', g3(Math.abs(fx - Sx)))],
      rms: ['rms error $\\lVert f - S_N\\rVert$', q('rms', g3(M.rmsError(wave, N, method)))],
      sup: ['largest error $\\max|f - S_N|$', q('sup', g3(M.supError(wave, N, method, M.supGrid(wave, 600))))],
      peak: ['highest point of $S_N$', q('peak', pk ? `${g4(pk.y)}\\ \\text{at}\\ x = ${g3(pk.x)}` : '\\text{—}')],
      over: ['overshoot ÷ jump', q('over', pk && jumpSize ? `${g3((100 * (pk.y - W.hi)) / jumpSize)}\\%` : '\\text{—}')],
      energy: ['share of $\\langle f^2\\rangle$ kept', q('energy', `${g4(100 * M.captured(wave, N))}\\%`)],
    }[k]));
    if (rows.length) F.readout(rows);
  }
  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'Exact coefficients; the rms error comes from Parseval’s identity, the largest error from a fine grid that includes points a hair from each jump. Every function has period 2π; at a jump its value is taken as the midpoint.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!M.WAVES.includes(P.wave)) out.push(`fa-series: wave is one of ${M.WAVES.join(', ')}`);
  if (P.waves != null && !(Array.isArray(P.waves) && P.waves.every((w) => M.WAVES.includes(w)) && P.waves.includes(P.wave))) out.push('fa-series: waves lists known waves and includes wave');
  if (!M.METHODS.includes(P.method)) out.push(`fa-series: method is one of ${M.METHODS.join(', ')}`);
  if (P.methods != null && !(Array.isArray(P.methods) && P.methods.every((m) => M.METHODS.includes(m)) && P.methods.includes(P.method))) out.push('fa-series: methods lists known methods and includes method');
  if (!(Number.isInteger(P.Nmax) && P.Nmax >= 2 && P.Nmax <= 200)) out.push('fa-series: Nmax is a whole number from 2 to 200');
  if (!(Number.isInteger(P.N) && P.N >= 1 && P.N <= P.Nmax)) out.push('fa-series: N is a whole number from 1 to Nmax');
  if (!(Number.isInteger(P.errN) && P.errN >= 10 && P.errN <= 400)) out.push('fa-series: errN is a whole number from 10 to 400');
  if (!(Number.isInteger(P.nshow) && P.nshow >= 3 && P.nshow <= 60)) out.push('fa-series: nshow is a whole number from 3 to 60');
  if (!(typeof P.x0 === 'number' && Math.abs(P.x0) <= 3.14)) out.push('fa-series: x0 lies in −3.14 … 3.14');
  if (!['energy', 'log'].includes(P.spec)) out.push('fa-series: spec is energy or log');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`fa-series: unknown panel “${p}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) out.push(`fa-series: unknown control “${c}”`);
  for (const r of P.readouts || []) if (!READS.includes(r)) out.push(`fa-series: unknown readout “${r}”`);
  for (const r of P.hide || []) if (!READS.includes(r)) out.push(`fa-series: unknown hide “${r}”`);
  if (P.window != null && !(Array.isArray(P.window) && P.window.length === 2 && P.window[0] < P.window[1])) out.push('fa-series: window is [a, b] with a < b');
  return out;
}
