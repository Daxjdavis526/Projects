// Statistics for the lab course (lab.A1–A4), in five pictures:
//   target    darts on a target: bias (accuracy), scatter (precision) and a
//             coarse grid that snaps every shot to it (resolution); or a row
//             of fixed targets side by side for comparison
//   readings  one instrument read again and again on a number line: the
//             readings rounded to its display resolution, their mean, the
//             true value, and the band its accuracy specification allows,
//             ±(p % of reading + d digits) (+ q % of full scale)
//   hist      a seeded sample from a normal, rectangular, triangular or
//             Poisson distribution as a histogram over its density, with the
//             mean, the ±1 s band, the SEM bar and a shaded ±kσ region; or the
//             means of m draws each (the central limit theorem)
//   mc        Monte Carlo propagation: a cloud of (possibly correlated) normal
//             inputs and the histogram of f(x, y) beside the Gaussian that
//             linear (partial-derivative) propagation predicts
//   tail      a test statistic's distribution (z one- or two-sided, or χ² with
//             ν degrees of freedom) with the tail beyond an observed value
//             shaded and its p-value
// Statistics in model/labx-stats.js (tested in test/labx-stats.test.mjs).
//
//   { type: 'labx-stats', params: {
//       mode: 'hist', seed: 1, controls: null, readout: true, hide: [],
//       // target
//       bias: 0, spread: 0.6, res: 0, n: 12, angle: 30, targets: null,   // targets: [{ bias, spread, res, label, angle }]
//       // readings
//       truth: 5, sd: 0.001, specPct: 0, specDigits: 0, specFS: 0, fullScale: 0, unit: 'V', xr: null,
//       // hist
//       dist: 'normal', mu: 0, sigma: 1, a: 1, lam: 4, m: 1, bins: null, data: null, xr: null, pdf: true, band: 0,
//       stats: true, gauss: false, xlabel: null, data: null,   // data: fixed readings shown instead of draws
//       // mc
//       f: 'x*y', x: [1, 0.1], y: null, rho: 0, N: 20000, xname: 'x', yname: 'y', fname: 'f', lin: true, fr: null,
//       // tail
//       test: 'z2', nu: 5, stat: 2, xr: null,
//   } }
// controls (true, false, or a list): target bias spread res · readings bias sd res ·
// hist n sigma a lam m band dist · mc sx sy rho N · tail stat nu.
// hide (readouts shown as “?”): mean sd sem cover frac mc lin p.

import { Plot } from '../plot.js';
import * as M from '../model/labx-stats.js';
import { fn as compileFn } from '../model/exprfn.js';
import { makeRng } from '../../core/rng.js';

export const defaults = {
  mode: 'hist', seed: 1, controls: null, readout: true, hide: [], caption: null, alt: null,
  bias: 0, spread: 0.6, res: 0, n: 12, angle: 30, targets: null,
  truth: 5, sd: 0.001, specPct: 0, specDigits: 0, specFS: 0, fullScale: 0, unit: '', xr: null,
  dist: 'normal', mu: 0, sigma: 1, a: 1, lam: 4, m: 1, bins: null, data: null, pdf: true, band: 0, stats: true, gauss: false, xlabel: null,
  f: 'x*y', x: [1, 0.1], y: null, rho: 0, N: 20000, xname: 'x', yname: 'y', fname: 'f', lin: true, fr: null,
  test: 'z2', nu: 5, stat: 2,
};
const MODES = ['target', 'readings', 'hist', 'mc', 'tail'];
const CONTROLS = { target: ['bias', 'spread', 'res'], readings: ['bias', 'sd', 'res'], hist: ['n', 'sigma', 'a', 'lam', 'm', 'band', 'dist'], mc: ['sx', 'sy', 'rho', 'N'], tail: ['stat', 'nu'] };
const DEFAULT_CONTROLS = { target: ['bias', 'spread', 'res'], readings: ['bias', 'sd'], hist: ['n'], mc: ['sx', 'rho'], tail: ['stat'] };
const HIDE = ['mean', 'sd', 'sem', 'cover', 'frac', 'mc', 'lin', 'p'];
const TESTS = ['z1', 'z2', 'chi2'];

/** A number as TeX with n significant figures (×10ⁿ outside 10⁻³ … 10⁵). */
function T(x, n = 3) {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  const p = Math.floor(Math.log10(a));
  return x.toFixed(Math.max(0, n - 1 - p));
}
/** Plain text for canvas labels. */
function P3(x, n = 3) {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}×10${sup(+e)}`; }
  const p = Math.floor(Math.log10(a));
  return x.toFixed(Math.max(0, n - 1 - p));
}
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = (e) => String(e).split('').map((c) => SUP[c] || c).join('');
const roundTo = (x, step) => (step > 0 ? Math.round(x / step) * step : x);
const decOf = (step) => (step > 0 ? Math.max(0, Math.ceil(-Math.log10(step) - 1e-9)) : 4);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const q = (k, v) => (hide.has(k) ? '?' : v);
  const mode = P.mode;
  const wanted = P.controls === true ? CONTROLS[mode] : P.controls === null ? (F.compact ? [] : DEFAULT_CONTROLS[mode]) : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  let seed = P.seed;
  const narrowOf = (c) => (c.clientWidth || 600) < 520;

  // ─── target ─────────────────────────────────────────────────────────────
  if (mode === 'target') {
    ctl('bias', () => F.slider({ key: 'bias', label: 'Bias (systematic offset)', min: 0, max: 3, step: 0.1, value: P.bias, unit: '\\text{rings}', explain: 'How far the centre of the scatter sits from the bullseye: an **accuracy** problem. Averaging more shots does not move it.' }));
    ctl('spread', () => F.slider({ key: 'spread', label: 'Scatter (random error, 1σ)', min: 0.1, max: 2, step: 0.05, value: P.spread, unit: '\\text{rings}', explain: 'The standard deviation of each shot about the centre of the scatter: a **precision** problem. Averaging beats it down.' }));
    ctl('res', () => F.slider({ key: 'res', label: 'Resolution (grid step)', min: 0, max: 2, step: 0.25, value: P.res, unit: '\\text{rings}', explain: 'Every shot is recorded only as the centre of the grid square it lands in, like a display that shows only so many digits. 0: no rounding.' }));
    const many = Array.isArray(P.targets) && P.targets.length;
    const a = F.canvas({ aspect: many ? 'wide' : 'square', label: P.alt || (many ? 'Several targets side by side, each with a group of shots' : 'Shots on a target, with their mean marked') });
    const K = many ? P.targets.length : 1;
    const pl = new Plot(a.canvas, { x: [0, 10 * K], y: [many ? -1.6 : 0, 10], equal: true, grid: false, axes: false, pad: { l: 4, r: 4, t: 4, b: 4 } });
    let N = P.n;
    const shots = (spec, s, n) => {
      const rng = makeRng(s), ang = ((spec.angle ?? P.angle) * Math.PI) / 180;
      const cx = spec.bias * Math.cos(ang), cy = spec.bias * Math.sin(ang);
      return Array.from({ length: n }, () => {
        let x = cx + spec.spread * M.gauss(rng), y = cy + spec.spread * M.gauss(rng);
        if (spec.res > 0) { x = roundTo(x, spec.res); y = roundTo(y, spec.res); }
        return [x, y];
      });
    };
    function drawTarget(ox, spec, list, fs) {
      const c = [ox + 5, 5];
      for (let r = 4; r >= 1; r--) pl.circle(c[0], c[1], r, { fill: r % 2 ? 'ink4' : 'panel', alpha: r % 2 ? 0.35 : 0.0, color: 'ink3', width: 1, strokeAlpha: 0.9 });
      pl.circle(c[0], c[1], 0.5, { fill: 'good', alpha: 0.5, color: 'good', width: 1.4 });
      if (spec.res > 0) {
        for (let g = -4.5; g <= 4.5 + 1e-9; g += spec.res) {
          const v = roundTo(g, spec.res) + spec.res / 2;
          if (Math.abs(v) > 4.6) continue;
          pl.line(c[0] + v, c[1] - 4.6, c[0] + v, c[1] + 4.6, { color: 'ink3', width: 0.6, alpha: 0.5 });
          pl.line(c[0] - 4.6, c[1] + v, c[0] + 4.6, c[1] + v, { color: 'ink3', width: 0.6, alpha: 0.5 });
        }
      }
      const g = pl.ctx;
      g.save(); g.fillStyle = pl.color('accent'); g.strokeStyle = pl.color('bg'); g.lineWidth = 1;
      for (const [x, y] of list) { if (Math.abs(x) > 4.9 || Math.abs(y) > 4.9) continue; g.beginPath(); g.arc(pl.X(c[0] + x), pl.Y(c[1] + y), fs > 11 ? 4.2 : 3.4, 0, 2 * Math.PI); g.fill(); g.stroke(); }
      g.restore();
      if (P.stats !== false && list.length) {
        const mx = list.reduce((s, p) => s + p[0], 0) / list.length, my = list.reduce((s, p) => s + p[1], 0) / list.length;
        const X = pl.X(c[0] + mx), Y = pl.Y(c[1] + my), d = 7;
        g.save(); g.strokeStyle = pl.color('gold'); g.lineWidth = 2.6;
        g.beginPath(); g.moveTo(X - d, Y - d); g.lineTo(X + d, Y + d); g.moveTo(X - d, Y + d); g.lineTo(X + d, Y - d); g.stroke(); g.restore();
      }
      if (spec.label) pl.text(spec.label, c[0], -0.75, { align: 'center', size: fs, color: 'ink2' });
    }
    function draw() {
      pl.clear();
      const fs = narrowOf(a.canvas) ? 10.5 : 12.5;
      if (many) P.targets.forEach((spec, i) => drawTarget(10 * i, { bias: 0, spread: 0.6, res: 0, ...spec }, shots({ bias: 0, spread: 0.6, res: 0, ...spec }, seed + 17 * i, spec.n ?? N), fs));
      else {
        const spec = { bias: F.params.bias, spread: F.params.spread, res: F.params.res };
        const list = shots(spec, seed, N);
        drawTarget(0, spec, list, fs);
        if (P.readout !== false) {
          const mx = list.reduce((s, p) => s + p[0], 0) / N, my = list.reduce((s, p) => s + p[1], 0) / N;
          const rms = Math.sqrt(list.reduce((s, p) => s + (p[0] - mx) ** 2 + (p[1] - my) ** 2, 0) / Math.max(1, 2 * (N - 1)));
          F.readout([['shots', String(N)], ['mean’s offset from centre', q('mean', `${T(Math.hypot(mx, my), 2)}\\ \\text{rings}`)], ['scatter (1σ per axis)', q('sd', `${T(rms, 2)}\\ \\text{rings}`)], ['offset of the mean expected from scatter alone', q('sem', `\\approx ${T(F.params.spread / Math.sqrt(N), 2)}\\ \\text{rings}`)]]);
        }
      }
    }
    if (!F.compact && !many) {
      F.button({ label: 'New shots', onClick: () => { seed++; draw(); } });
      F.button({ label: '4× as many', onClick: () => { N = Math.min(N * 4, 768); draw(); } });
      F.button({ label: 'Back to 12', onClick: () => { N = P.n; draw(); } });
    }
    F.onChange(draw);
    F.draw(draw);
    F.caption('A target is a picture of a measurement: the bullseye is the true value, which a real experiment never sees. The gold × is the mean of the shots. Shots are drawn from a 2D Gaussian; the grid rounds each one to the centre of its square.');
    return { get: (k) => F.params[k] };
  }

  // ─── readings ───────────────────────────────────────────────────────────
  if (mode === 'readings') {
    const res0 = P.res || 0;
    ctl('bias', () => F.slider({ key: 'bias', label: 'Instrument offset', min: -4 * (res0 || P.sd), max: 4 * (res0 || P.sd), step: (res0 || P.sd) / 4, value: P.bias, unit: P.unit ? `\\text{${P.unit}}` : '', explain: 'A fixed error in every reading — a zero or calibration error. The accuracy specification is the maker’s promise that it stays inside the band.' }));
    ctl('sd', () => F.slider({ key: 'sd', label: 'Noise per reading (1σ)', min: (res0 || P.sd) / 10, max: 4 * (res0 || P.sd), step: (res0 || P.sd) / 20, value: P.sd, unit: P.unit ? `\\text{${P.unit}}` : '', explain: 'Random scatter from one reading to the next: what repeat readings reveal and averaging reduces.' }));
    ctl('res', () => F.choice({ key: 'res', label: 'Display resolution', options: [[res0, `${res0} ${P.unit}`], [res0 / 10, `${+(res0 / 10).toPrecision(3)} ${P.unit}`], [res0 * 10, `${+(res0 * 10).toPrecision(3)} ${P.unit}`]], value: res0, explain: 'The size of one step in the last digit. Readings are rounded to it before you see them.' }));
    const a = F.canvas({ aspect: 'wide', label: P.alt || 'Readings stacked on a number line, with the true value and the specification band' });
    const halfSpan = Math.max(6 * (res0 || P.sd), 6 * P.sd, 1.3 * specHalf(P.truth));
    const xr = P.xr || [P.truth - halfSpan, P.truth + halfSpan];
    const pl = new Plot(a.canvas, { x: xr, y: [0, 10], yticks: 0, xticks: 7, xlabel: P.xlabel || `reading (${P.unit})`, axesAt: 'edge', pad: { l: 14, r: 16, t: 14, b: 34 } });
    function specHalf(reading) { return (P.specPct / 100) * Math.abs(reading) + P.specDigits * (P.res || 0) + (P.specFS / 100) * P.fullScale; }
    function draw() {
      const res = F.params.res ?? res0, bias = F.params.bias, sd = F.params.sd;
      const xs = M.instrumentReadings({ truth: P.truth, bias, sd, res, n: P.n, seed });
      const st = M.stats(xs);
      const fs = narrowOf(a.canvas) ? 10.5 : 12;
      pl.clear();
      const half = specHalf(st.mean);
      if (half > 0) {
        pl.rect(st.mean - half, 0, 2 * half, 8.6, { color: 'violet', alpha: 0.13, width: 1 });
        pl.text('accuracy spec around the mean reading', st.mean, 9.3, { align: 'center', size: fs, color: 'violet' });
      }
      pl.line(P.truth, 0, P.truth, 8.6, { color: 'good', width: 2, dash: [6, 4] });
      pl.text('true value', P.truth, 0.5, { size: fs, color: 'good', dx: 6 });
      // stacked dots
      const keyOf = (x) => (res > 0 ? Math.round(x / res) : Math.round(x / ((xr[1] - xr[0]) / 120)));
      const tall = new Map();
      for (const x of xs) tall.set(keyOf(x), (tall.get(keyOf(x)) || 0) + 1);
      const stack = new Map(), dotH = Math.min(0.62, 6.6 / Math.max(1, ...tall.values()));
      const g = pl.ctx;
      g.save(); g.fillStyle = pl.color('accent');
      for (const x of xs) {
        const key = keyOf(x);
        const k = stack.get(key) || 0; stack.set(key, k + 1);
        g.beginPath(); g.arc(pl.X(x), pl.Y(1.3 + k * dotH), Math.min(fs > 11 ? 4.4 : 3.6, Math.max(2, 0.45 * (pl.Y(0) - pl.Y(dotH)))), 0, 2 * Math.PI); g.fill();
      }
      g.restore();
      if (P.stats !== false) {
        pl.line(st.mean, 0.9, st.mean, 8.2, { color: 'gold', width: 2.2 });
        pl.text('mean', st.mean, 8.2, { size: fs, color: 'gold', dx: 5, dy: -4 });
      }
      if (P.readout !== false) {
        const d = decOf(res) + 1;
        F.readout([
          ['readings', String(P.n)], ['mean', q('mean', `${st.mean.toFixed(d)}\\ \\text{${P.unit}}`)],
          ['scatter $s$', q('sd', `${T(st.sd, 2)}\\ \\text{${P.unit}}`)],
          ['resolution', `${T(res, 2)}\\ \\text{${P.unit}}`],
          ...(half > 0 ? [['spec half-width', q('cover', `\\pm ${T(half, 2)}\\ \\text{${P.unit}}`)]] : []),
        ]);
      }
    }
    if (!F.compact) F.button({ label: 'Read again', onClick: () => { seed++; draw(); } });
    F.onChange(draw);
    F.draw(draw);
    F.caption('Each dot is one reading, rounded to the display’s last digit before you ever see it. The shaded band is what the maker’s accuracy specification allows; it is a bound on the instrument’s error, not a measured scatter. Noise is modelled as Gaussian.');
    return { get: (k) => F.params[k] };
  }

  // ─── hist ───────────────────────────────────────────────────────────────
  if (mode === 'hist') {
    const nOpts = [[10, '10'], [100, '100'], [1000, '1 000'], [10000, '10 000']];
    ctl('dist', () => F.choice({ key: 'dist', label: 'Distribution', options: [['normal', 'normal'], ['uniform', 'rectangular'], ['triangular', 'triangular'], ['poisson', 'Poisson']], value: P.dist, explain: 'The shape of the scatter a single reading is drawn from.' }));
    ctl('n', () => F.choice({ key: 'n', label: 'Readings $N$', options: nOpts.some(([v]) => v === P.n) ? nOpts : [[P.n, String(P.n)], ...nOpts], value: P.n, explain: 'More readings fill in the shape; they do not change it.' }));
    ctl('sigma', () => F.slider({ key: 'sigma', label: 'Standard deviation $\\sigma$', min: 0.2, max: 2, step: 0.05, value: P.sigma, unit: '', explain: 'The width of the normal distribution.' }));
    ctl('a', () => F.slider({ key: 'a', label: 'Half-width $a$', min: 0.2, max: 2, step: 0.05, value: P.a, unit: '', explain: 'Every value lies within $\\pm a$ of the centre. The standard deviation is $a/\\sqrt3$ (rectangular) or $a/\\sqrt6$ (triangular).' }));
    ctl('lam', () => F.slider({ key: 'lam', label: 'Expected count $\\lambda$', min: 0.5, max: 100, step: 0.5, value: P.lam, unit: '', explain: 'The mean number of counts per interval. The spread is $\\sqrt\\lambda$.' }));
    ctl('m', () => F.choice({ key: 'm', label: 'Each sample is the mean of', options: [[1, '1 draw'], [2, '2'], [4, '4'], [16, '16']], value: P.m, explain: 'Average several draws and plot the averages: their spread shrinks as $1/\\sqrt m$ and their shape turns Gaussian (the central limit theorem).' }));
    ctl('band', () => F.slider({ key: 'band', label: 'Shade within $\\pm k\\sigma$', min: 0, max: 4, step: 0.1, value: P.band, unit: '', explain: '$k$: how many standard deviations either side of the mean to shade.' }));
    const a = F.canvas({ aspect: 'wide', label: P.alt || 'A histogram of readings over the distribution they were drawn from' });
    const pl = new Plot(a.canvas, { x: [0, 1], y: [0, 1], xticks: 8, yticks: 5, xlabel: P.xlabel ?? 'value', ylabel: 'probability density', axesAt: 'edge' });
    function draw() {
      const given = Array.isArray(P.data) ? P.data : null;                 // fixed readings to show instead of draws
      const dist = F.params.dist, n = given ? given.length : F.params.n, m = given ? 1 : F.params.m || 1, k = F.params.band;
      const par = { mu: P.mu, sigma: F.params.sigma, a: F.params.a, lam: F.params.lam };
      const mo = M.moments(dist, par), sdm = mo.sd / Math.sqrt(m);
      const xs = given || M.samples(dist, par, n, seed, m);
      const st = M.stats(xs);
      const discrete = dist === 'poisson' && m === 1;
      const flat = m === 1 && (dist === 'uniform' || dist === 'triangular');   // bin edges on ±a
      const xr = P.xr || (discrete ? [Math.max(-0.5, Math.floor(mo.mean - 4.5 * mo.sd) - 0.5), Math.ceil(mo.mean + 4.5 * mo.sd) + 0.5] : flat ? [P.mu - 1.5 * par.a, P.mu + 1.5 * par.a] : [mo.mean - 4.5 * sdm, mo.mean + 4.5 * sdm]);
      let nb = P.bins || (discrete ? 0 : flat && !P.xr ? (n < 300 ? 12 : 36) : Math.max(8, Math.min(60, Math.round(2.2 * Math.sqrt(n)))));
      let w, h;
      if (discrete) {
        const step = Math.max(1, Math.ceil((xr[1] - xr[0]) / 60));
        const lo = Math.floor(xr[0] + 0.5) - 0.5;
        nb = Math.ceil((xr[1] - lo) / step);
        h = M.histogram(xs, lo, lo + nb * step, nb); w = step; h.lo = lo;
      } else { h = M.histogram(xs, xr[0], xr[1], nb); w = h.w; h.lo = xr[0]; }
      const dens = h.counts.map((c) => c / (n * w));
      const peakPdf = discrete ? M.poissonPmf(Math.floor(mo.mean), par.lam) : m > 1 ? M.normalPdf(0) / sdm : Math.max(M.density(dist, par, mo.mean), M.normalPdf(0) / mo.sd * (dist === 'normal' ? 1 : 0));
      const ymax = 1.22 * Math.max(peakPdf, ...dens.slice(0, nb)) || 1;
      pl.setView(xr, [0, ymax]);
      pl.clear();
      const fs = narrowOf(a.canvas) ? 10.5 : 12;
      // shaded ±kσ band under the true density
      const curve = (x) => (m > 1 ? M.normalPdf((x - mo.mean) / sdm) / sdm : discrete ? M.poissonPmf(Math.round(x), par.lam) : M.density(dist, par, x));
      if (k > 0 && P.pdf !== false) {
        if (discrete) {
          for (let c = Math.ceil(mo.mean - k * mo.sd); c <= Math.floor(mo.mean + k * mo.sd); c++) pl.rect(c - 0.5, 0, 1, M.poissonPmf(c, par.lam), { color: 'gold', alpha: 0.3, stroke: false });
        } else pl.area(curve, Math.max(xr[0], mo.mean - k * sdm), Math.min(xr[1], mo.mean + k * sdm), { color: 'gold', alpha: 0.28, samples: 300 });
      }
      for (let i = 0; i < nb; i++) if (h.counts[i]) pl.rect(h.lo + i * w, 0, w, dens[i], { color: 'accent', alpha: 0.32, width: 1 });
      if (P.pdf !== false) {
        if (discrete) for (let c = Math.ceil(xr[0]); c <= xr[1]; c++) { const p = M.poissonPmf(c, par.lam); if (p > ymax * 0.004) pl.point(c, p, { r: 3, color: 'violet' }); }
        else pl.fn(curve, { color: 'violet', width: 2.2, samples: 600 });
        if (P.gauss) pl.fn((x) => M.normalPdf((x - mo.mean) / mo.sd) / mo.sd, { color: 'warn', width: 1.8, dash: [6, 4] });
      }
      if (P.stats !== false && n > 1) {
        const yb = ymax * 0.93;
        pl.rect(st.mean - st.sd, 0, 2 * st.sd, yb, { color: 'teal', alpha: 0.08, stroke: false });
        pl.line(st.mean, 0, st.mean, yb, { color: 'gold', width: 2 });
        pl.line(st.mean - st.sd, yb, st.mean + st.sd, yb, { color: 'teal', width: 1.6 });
        pl.text('±1 s', st.mean + st.sd, yb, { size: fs, color: 'teal', dx: 5 });
        pl.line(st.mean - st.sem, yb * 0.9, st.mean + st.sem, yb * 0.9, { color: 'gold', width: 4 });
        pl.text('mean ± SEM', st.mean + Math.max(st.sem, 0.02 * (xr[1] - xr[0])), yb * 0.9, { size: fs, color: 'gold', dx: 6 });
      }
      if (P.readout !== false) {
        const inside = k > 0 ? xs.filter((x) => Math.abs(x - mo.mean) <= k * sdm + 1e-12).length / n : NaN;
        const cover = k > 0 ? (discrete ? M.poissonCdf(Math.floor(mo.mean + k * mo.sd + 1e-9), par.lam) - M.poissonCdf(Math.ceil(mo.mean - k * mo.sd - 1e-9) - 1, par.lam) : m > 1 || dist === 'normal' ? M.within(k) : dist === 'uniform' ? Math.min(1, (k * sdm) / par.a) : (() => { const u = Math.min(1, (k * sdm) / par.a); return 1 - (1 - u) ** 2; })()) : NaN;
        F.readout([
          ['$N$', String(n)], ['mean', q('mean', T(st.mean, 4))], ['$s$', q('sd', T(st.sd, 3))], ['SEM $= s/\\sqrt N$', q('sem', T(st.sem, 2))],
          [m > 1 ? 'true $\\sigma/\\sqrt m$' : 'true $\\sigma$', q('sd', T(sdm, 3))],
          ...(k > 0 ? [[`theory: inside $\\pm${k}\\sigma$`, q('cover', `${(100 * cover).toFixed(1)}\\%`)], ['sample: inside', q('frac', `${(100 * inside).toFixed(1)}\\%`)]] : []),
        ]);
      }
    }
    if (!F.compact && !Array.isArray(P.data)) F.button({ label: 'New sample', onClick: () => { seed++; draw(); } });
    F.onChange(draw);
    F.draw(draw);
    F.caption(P.dist === 'poisson' ? 'Seeded random counts: bars are the sample, violet dots the exact Poisson probabilities. The gold line is the sample mean, the gold bar its ±1 SEM, the teal band ±1 sample SD.' : 'Seeded random draws: bars are the sample, the violet curve the distribution they were drawn from. The gold line is the sample mean, the gold bar its ±1 SEM, the teal band ±1 sample SD.');
    return { get: (k) => F.params[k] };
  }

  // ─── mc ─────────────────────────────────────────────────────────────────
  if (mode === 'mc') {
    const two = Array.isArray(P.y);
    const f = compileFn(P.f, ['x', 'y']);
    const fx = (v) => f({ x: v[0], y: two ? v[1] : 0 });
    ctl('sx', () => F.slider({ key: 'sx', label: `Uncertainty of ${P.xname}`, min: P.x[1] / 5, max: P.x[1] * 5, step: P.x[1] / 20, value: P.x[1], unit: '', explain: `The standard uncertainty of the input ${P.xname} (its mean stays at ${P.x[0]}).` }));
    ctl('sy', () => two && F.slider({ key: 'sy', label: `Uncertainty of ${P.yname}`, min: P.y[1] / 5, max: P.y[1] * 5, step: P.y[1] / 20, value: P.y[1], unit: '', explain: `The standard uncertainty of the input ${P.yname}.` }));
    ctl('rho', () => two && F.slider({ key: 'rho', label: 'Correlation $\\rho$', min: -0.95, max: 0.95, step: 0.05, value: P.rho, unit: '', explain: 'How strongly the two inputs’ errors move together: +1 always the same way, −1 always opposite, 0 independent.' }));
    ctl('N', () => F.choice({ key: 'N', label: 'Draws', options: [[1000, '1 000'], [20000, '20 000'], [200000, '200 000']], value: [1000, 20000, 200000].includes(P.N) ? P.N : 20000, explain: 'Monte Carlo’s own error falls as $1/\\sqrt{\\text{draws}}$.' }));
    if (F.params.sx === undefined || !wanted.includes('sx')) F.params.sx = P.x[1];
    if (two && (F.params.sy === undefined || !wanted.includes('sy'))) F.params.sy = P.y[1];
    const a = F.canvas({ aspect: 'wide', label: two ? 'The cloud of input draws' : 'The input draws' });
    const pa = new Plot(a.canvas, { x: [0, 1], y: [0, 1], xticks: 6, yticks: 5, xlabel: P.xname, ylabel: two ? P.yname : 'density', axesAt: 'edge' });
    const b = F.canvas({ aspect: 'wide', label: 'The histogram of the output against linear propagation' });
    const pb = new Plot(b.canvas, { x: [0, 1], y: [0, 1], xticks: 7, yticks: 5, xlabel: P.fname, ylabel: 'density', axesAt: 'edge' });
    const view = { x: null, y: null, f: null };
    function draw() {
      const mu = two ? [P.x[0], P.y[0]] : [P.x[0]], sg = two ? [F.params.sx, F.params.sy] : [F.params.sx];
      const rho = two ? F.params.rho ?? P.rho : 0, N = F.params.N || P.N;
      const mc = M.monteCarlo(fx, mu, sg, { rho, N, seed });
      const lin = M.linear(fx, mu, sg, rho);
      const fs = narrowOf(a.canvas) ? 10.5 : 12;
      // inputs
      // views stay put while the draws fit, so a narrower spread looks narrower
      if (!view.x || 4 * sg[0] > view.x[1] - mu[0] || 2 * sg[0] < 0.25 * (view.x[1] - mu[0])) view.x = [mu[0] - 4.5 * sg[0], mu[0] + 4.5 * sg[0]];
      if (two && (!view.y || 4 * sg[1] > view.y[1] - mu[1] || 2 * sg[1] < 0.25 * (view.y[1] - mu[1]))) view.y = [mu[1] - 4.5 * sg[1], mu[1] + 4.5 * sg[1]];
      const xr = view.x;
      if (two) {
        pa.setView(xr, view.y);
        pa.clear();
        const g = pa.ctx, show = Math.min(N, 2500);
        g.save(); g.fillStyle = pa.color('accent'); g.globalAlpha = 0.45;
        for (let i = 0; i < show; i++) { g.beginPath(); g.arc(pa.X(mc.inputs[0][i]), pa.Y(mc.inputs[1][i]), 1.6, 0, 2 * Math.PI); g.fill(); }
        g.restore();
        pa.point(mu[0], mu[1], { r: 4, color: 'gold' });
        pa.text(`${show} of ${N} draws`, xr[1], view.y[1], { align: 'right', size: fs - 0.5, color: 'ink3', dx: -6, dy: 10 });
      } else {
        const hx = M.histogram(mc.inputs[0], xr[0], xr[1], 50), dx = hx.counts.map((c) => c / (N * hx.w));
        pa.setView(xr, [0, 1.2 * Math.max(...dx)]);
        pa.clear();
        hx.counts.forEach((c, i) => c && pa.rect(xr[0] + i * hx.w, 0, hx.w, dx[i], { color: 'accent', alpha: 0.3, width: 0.8 }));
      }
      // output
      const s = mc.sd, lo = Math.min(mc.lo95, lin.value - 3.2 * lin.sigma), hi = Math.max(mc.hi95, lin.value + 3.2 * lin.sigma);
      if (!view.f || mc.lo95 < view.f[0] || mc.hi95 > view.f[1] || (hi - lo) < 0.12 * (view.f[1] - view.f[0])) view.f = [lo - 0.6 * (hi - lo), hi + 0.6 * (hi - lo)];
      const fr = P.fr || view.f;
      const hf = M.histogram(mc.samples, fr[0], fr[1], 70), df = hf.counts.map((c) => c / (N * hf.w));
      const linPeak = lin.sigma > 0 ? M.normalPdf(0) / lin.sigma : 0;
      pb.setView(fr, [0, 1.18 * Math.max(...df, Math.min(linPeak, 3 * Math.max(...df)))]);
      pb.clear();
      hf.counts.forEach((c, i) => c && pb.rect(fr[0] + i * hf.w, 0, hf.w, df[i], { color: 'accent', alpha: 0.3, width: 0.8 }));
      if (P.lin !== false && lin.sigma > 0) pb.fn((x) => M.normalPdf((x - lin.value) / lin.sigma) / lin.sigma, { color: 'gold', width: 2, dash: [7, 4], samples: 500 });
      if (P.lin !== false && !(lin.sigma > 0)) pb.line(lin.value, 0, lin.value, pb.vy1, { color: 'gold', width: 2, dash: [7, 4] });
      const yT = pb.vy1 * 0.92;
      if (!hide.has('mc')) {                       // hide: ['mc'] keeps the interval off the picture too
        pb.line(mc.lo, yT, mc.hi, yT, { color: 'violet', width: 3 });
        pb.point(mc.median, yT, { r: 3.5, color: 'violet' });
        pb.text('MC 68% interval', mc.hi, yT, { size: fs, color: 'violet', dx: 6 });
      }
      if (P.lin !== false) pb.text('linear prediction', fr[1], pb.vy1 * 0.78, { size: fs, color: 'gold', align: 'right', dx: -6 });
      if (P.readout !== false) {
        F.readout([
          ['linear: $f(\\bar x) \\pm \\sigma_f$', q('lin', `${T(lin.value, 4)} \\pm ${T(lin.sigma, 2)}`)],
          ['Monte Carlo mean ± SD', q('mc', `${T(mc.mean, 4)} \\pm ${T(s, 2)}`)],
          ['MC median, 68% interval', q('mc', `${T(mc.median, 4)}\\ [${T(mc.lo, 3)}, ${T(mc.hi, 3)}]`)],
          ...(mc.bad ? [['draws with no value', String(mc.bad)]] : []),
        ]);
      }
    }
    if (!F.compact) F.button({ label: 'New draws', onClick: () => { seed++; draw(); } });
    F.onChange(draw);
    F.draw(draw);
    F.caption(`Monte Carlo propagation: every dot is one draw of the inputs (normal, with the uncertainties set), every bar of the lower histogram one value of ${P.fname} computed from a draw. The dashed gold curve is the Gaussian that linear propagation predicts.`);
    return { get: (k) => F.params[k] };
  }

  // ─── tail ───────────────────────────────────────────────────────────────
  const chi = P.test === 'chi2';
  ctl('nu', () => chi && F.slider({ key: 'nu', label: 'Degrees of freedom $\\nu$', min: 1, max: 40, step: 1, value: P.nu, unit: '', explain: 'For a fit: the number of data points minus the number of fitted parameters.' }));
  const smax = chi ? (wanted.includes('nu') ? 130 : Math.max(3 * P.nu + 10, 2 * P.stat)) : 6;
  ctl('stat', () => F.slider({ key: 'stat', label: chi ? 'Observed $\\chi^2$' : 'Observed $z$', min: 0, max: chi ? Math.ceil(smax) : 6, step: chi ? 0.1 : 0.05, value: P.stat, unit: '', explain: chi ? 'The χ² your data gave: the sum of squared normalized residuals.' : 'How many standard uncertainties apart the measurement and the prediction are.' }));
  const a = F.canvas({ aspect: 'wide', label: P.alt || 'A test statistic’s distribution with the tail beyond the observed value shaded' });
  const pl = new Plot(a.canvas, { x: [0, 1], y: [0, 1], xticks: 8, yticks: 5, xlabel: chi ? 'χ²' : 'z', ylabel: 'probability density', axesAt: 'edge' });
  function draw() {
    const nu = chi ? F.params.nu ?? P.nu : 0, s = F.params.stat;
    const fs = narrowOf(a.canvas) ? 10.5 : 12;
    const xr = P.xr || (chi ? [0, Math.max(nu + 5 * Math.sqrt(2 * nu) + 2, s * 1.15)] : [-5, 5]);
    const pdf = chi ? (x) => M.chi2Pdf(x, nu) : M.normalPdf;
    let peak = chi ? (nu > 2 ? M.chi2Pdf(nu - 2, nu) : nu === 2 ? 0.5 : 0.6) : M.normalPdf(0);
    peak = Math.min(peak, 0.6);
    pl.setView(xr, [0, 1.25 * peak]);
    pl.clear();
    const p = chi ? M.chi2Sf(s, nu) : P.test === 'z1' ? M.normalSf(s) : M.pTwo(s);
    pl.area(pdf, Math.max(s, xr[0]), xr[1], { color: 'warn', alpha: 0.45, samples: 300 });
    if (P.test === 'z2') pl.area(pdf, xr[0], -s, { color: 'warn', alpha: 0.45, samples: 300 });
    pl.fn(pdf, { color: 'accent', width: 2.2, samples: 600, domain: chi && nu === 1 ? [0.004, xr[1]] : undefined });
    pl.line(s, 0, s, 1.1 * peak, { color: 'gold', width: 2 });
    pl.text(chi ? `observed χ² = ${P3(s)}` : `observed z = ${P3(s)}`, s, 1.1 * peak, { size: fs, color: 'gold', dx: s > (xr[0] + xr[1]) / 2 ? -6 : 6, align: s > (xr[0] + xr[1]) / 2 ? 'right' : 'left' });
    if (P.test === 'z2') pl.line(-s, 0, -s, 1.1 * peak, { color: 'gold', width: 1.4, dash: [5, 4] });
    if (chi) { pl.line(nu, 0, nu, 0.15 * peak, { color: 'ink3', width: 1.5 }); pl.text('ν', nu, 0.15 * peak, { size: fs, color: 'ink3', dy: -9, align: 'center' }); }
    if (P.readout !== false) {
      F.readout([
        ...(chi ? [['$\\nu$', String(nu)], ['$\\chi^2/\\nu$', T(s / nu, 3)]] : []),
        [P.test === 'z2' ? 'p-value (both tails)' : 'p-value (upper tail)', q('p', T(p, 3))],
      ]);
    }
  }
  F.onChange(draw);
  F.draw(draw);
  F.caption(chi ? 'The χ² distribution: how χ² would scatter if the model were right and the error bars honest and Gaussian. The shaded tail’s area is the p-value.' : 'The standard normal distribution of z if the null hypothesis is true. The shaded tail’s area is the p-value.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  if (!MODES.includes(P.mode)) { p.push(`labx-stats: mode must be one of ${MODES.join(', ')}`); return p; }
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS[P.mode].includes(c)) p.push(`labx-stats: control “${c}” does not belong to mode ${P.mode} (${CONTROLS[P.mode].join(', ')})`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`labx-stats: unknown hide “${h}”`);
  if (!Number.isInteger(P.seed)) p.push('labx-stats: seed is an integer');
  if (P.mode === 'target') {
    if (!(P.n >= 1 && P.n <= 768)) p.push('labx-stats: n is 1–768 shots');
    const specs = Array.isArray(P.targets) ? P.targets : [P];
    if (P.targets && !(Array.isArray(P.targets) && P.targets.length >= 1 && P.targets.length <= 5)) p.push('labx-stats: targets is a list of 1–5 targets');
    for (const s of specs) {
      if (s.bias !== undefined && !(s.bias >= 0 && s.bias <= 3.5)) p.push('labx-stats: bias lies in 0–3.5 rings');
      if (s.spread !== undefined && !(s.spread > 0 && s.spread <= 2.5)) p.push('labx-stats: spread lies in (0, 2.5] rings');
      if (s.res !== undefined && !(s.res >= 0 && s.res <= 3)) p.push('labx-stats: res lies in 0–3 rings');
    }
  }
  if (P.mode === 'readings') {
    if (!(P.sd > 0)) p.push('labx-stats: sd must be positive');
    if (!(P.res >= 0)) p.push('labx-stats: res must be ≥ 0');
    if (!(P.n >= 1 && P.n <= 400)) p.push('labx-stats: n is 1–400 readings');
    if (!Number.isFinite(P.truth)) p.push('labx-stats: truth must be a number');
    if (P.xr && !(Array.isArray(P.xr) && P.xr[1] > P.xr[0])) p.push('labx-stats: xr is [lo, hi]');
  }
  if (P.mode === 'hist') {
    if (!M.DISTS.includes(P.dist)) p.push(`labx-stats: dist must be one of ${M.DISTS.join(', ')}`);
    if (!(Number.isInteger(P.n) && P.n >= 2 && P.n <= 100000)) p.push('labx-stats: n is 2–100000 readings');
    if (P.data !== null && !(Array.isArray(P.data) && P.data.length >= 2 && P.data.every(Number.isFinite))) p.push('labx-stats: data is a list of at least two numbers');
    if (!(P.sigma > 0 && P.a > 0 && P.lam > 0)) p.push('labx-stats: sigma, a and lam must be positive');
    if (![1, 2, 4, 16].includes(P.m) && !(Number.isInteger(P.m) && P.m >= 1 && P.m <= 100)) p.push('labx-stats: m is a whole number of draws, 1–100');
    if (!(P.band >= 0 && P.band <= 5)) p.push('labx-stats: band is 0–5 standard deviations');
    if (P.xr && !(Array.isArray(P.xr) && P.xr[1] > P.xr[0])) p.push('labx-stats: xr is [lo, hi]');
  }
  if (P.mode === 'mc') {
    try { const f = compileFn(P.f, ['x', 'y']); if (typeof f({ x: Array.isArray(P.x) ? P.x[0] : 1, y: Array.isArray(P.y) ? P.y[0] : 0 }) !== 'number') p.push('labx-stats: f does not evaluate'); }
    catch (e) { p.push(`labx-stats: f does not parse (${e.message})`); }
    if (!(Array.isArray(P.x) && P.x.length === 2 && P.x[1] > 0)) p.push('labx-stats: x is [mean, sigma > 0]');
    if (P.y !== null && !(Array.isArray(P.y) && P.y.length === 2 && P.y[1] > 0)) p.push('labx-stats: y is null or [mean, sigma > 0]');
    if (!(Math.abs(P.rho) < 1)) p.push('labx-stats: rho lies strictly between −1 and 1');
    if (!(P.N >= 100 && P.N <= 200000)) p.push('labx-stats: N is 100–200000 draws');
    if (P.fr && !(Array.isArray(P.fr) && P.fr[1] > P.fr[0])) p.push('labx-stats: fr is [lo, hi]');
  }
  if (P.mode === 'tail') {
    if (!TESTS.includes(P.test)) p.push(`labx-stats: test must be one of ${TESTS.join(', ')}`);
    if (!(Number.isInteger(P.nu) && P.nu >= 1 && P.nu <= 200)) p.push('labx-stats: nu is a whole number 1–200');
    if (!(P.stat >= 0)) p.push('labx-stats: stat must be ≥ 0');
  }
  return p;
}
