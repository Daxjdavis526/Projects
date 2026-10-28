// A chirp hidden in noise, found by a matched filter (Foundations course G4).
// A one-second record of white Gaussian noise holds a leading-order inspiral
// chirp (30 → 250 Hz, cut off there) whose peak is `amp` times the noise's
// standard deviation. Panels, top to bottom (any subset, any order):
//   data  the record (grey), with the hidden signal drawn over it when
//         "reveal" is on;
//   snr   the filter's output ρ(t) for the current template — its SNR at every
//         arrival time, maximized over phase — with the noise-only mean √(π/2);
//   scan  the peak SNR against the template's chirp mass (the template bank);
//   post  the chirp-mass posterior under a flat prior — the likelihood
//         exp(ρ²/2), maximized over amplitude and phase, summed over arrival
//         times — with its central credible interval shaded; the axis zooms to it.
// Model, numbers and tests: model/sg2-matched.js, test/sg2-matched.test.mjs.
//
//   { type: 'sg2-matched', params: {
//       Mc: 30,                 // the hidden signal's chirp mass (M☉), 15–60
//       tpl: 24,                // the template's chirp mass (M☉), 15–60
//       amp: 1,                 // the signal's peak ÷ the noise σ, 0–3
//       seed: 2,                // the noise realization (a whole number)
//       panels: ['data', 'snr', 'scan'],
//       controls: null,         // true, false, or a list of: tpl amp Mc noise reveal
//       reveal: false,          // draw the hidden signal and mark its chirp mass
//       level: 0.9,             // the credible interval's probability
//       readout: true,
//       hide: [],               // readouts shown as “?”: opt peak time ci
//   } }
// get('tpl') answers a slider item (“find the template that rings loudest”).

import { Plot } from '../plot.js';
import * as M from '../model/sg2-matched.js';
import { cyclesBetween } from '../model/gr-waves.js';

export const defaults = { Mc: 30, tpl: 24, amp: 1, seed: 2, panels: ['data', 'snr', 'scan'], controls: null, reveal: false, level: 0.9, readout: true, hide: [] };
const PANELS = ['data', 'snr', 'scan', 'post'];
const CONTROLS = ['tpl', 'amp', 'Mc', 'noise', 'reveal'];
const HIDE = ['opt', 'peak', 'time', 'ci'];
const ROOT_HALF_PI = Math.sqrt(Math.PI / 2);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const panels = P.panels;
  const auto = [...(panels.some((p) => p === 'data' || p === 'snr' || p === 'scan') ? ['tpl'] : []), 'amp', 'noise', 'reveal'];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? auto : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));

  ctl('tpl', () => F.slider({ key: 'tpl', label: 'Template chirp mass', min: M.MC_MIN, max: M.MC_MAX, step: 0.5, value: P.tpl, unit: 'M_\\odot', explain: 'The filter slides this template along the record. A heavier chirp sweeps the same band faster, in fewer cycles.' }));
  ctl('amp', () => F.slider({ key: 'amp', label: 'Signal peak ÷ noise $\\sigma$', min: 0, max: 3, step: 0.05, value: P.amp, explain: 'The largest the chirp ever gets, sample by sample, in units of the noise’s standard deviation. Most of the chirp is smaller still.' }));
  ctl('Mc', () => F.slider({ key: 'Mc', label: 'True chirp mass', min: M.MC_MIN, max: M.MC_MAX, step: 0.5, value: P.Mc, unit: 'M_\\odot', explain: 'The chirp mass of the signal hidden in the record.' }));
  if (!wanted.includes('Mc')) F.params.Mc = P.Mc;
  F.params.seed = P.seed;
  if (wanted.includes('noise')) F.button({ label: 'New noise', onClick: () => F.set('seed', F.params.seed + 1) });
  ctl('reveal', () => F.toggle({ key: 'reveal', label: 'Reveal the hidden signal', value: P.reveal, explain: 'Draw the signal over the record and mark its true chirp mass.' }));

  const canv = {};
  const labels = { data: 'The noisy record, one second long', snr: 'The matched filter’s output: SNR against arrival time', scan: 'Peak SNR against the template’s chirp mass', post: 'The chirp-mass posterior' };
  for (const p of panels) {
    const { canvas } = F.canvas({ aspect: 'wide', label: labels[p] });
    canv[p] = new Plot(canvas, p === 'data' ? { x: [0, 1], y: [-4, 4], xlabel: 't (s)', ylabel: '', axesAt: 'edge', yticks: 0 }
      : p === 'snr' ? { x: [0, 1], y: [0, 10], xlabel: 't (s)', ylabel: 'SNR ρ', axesAt: 'edge' }
      : p === 'scan' ? { x: [M.MC_MIN, M.MC_MAX], y: [0, 10], xlabel: 'template chirp mass (M☉)', ylabel: 'peak ρ', axesAt: 'edge' }
      : { x: [M.MC_MIN, M.MC_MAX], y: [0, 1], xlabel: 'chirp mass (M☉)', ylabel: 'posterior', axesAt: 'edge', yticks: 0 });
  }

  // caches: the record (Mc, seed); the bank's noise and signal correlations (Mc, seed); the current template's
  let recKey = '', rec = null, parts = null, BANK = [], tplKey = '', tplCorr = null;
  const needScan = panels.includes('scan') || panels.includes('post');
  const state = () => {
    const p = F.params, key = `${p.Mc}|${p.seed}`;
    if (key !== recKey) { recKey = key; rec = M.record({ Mc: p.Mc, amp: 1, seed: p.seed }); BANK = M.bankFor(p.Mc); parts = needScan ? M.scanParts(rec, BANK) : null; tplKey = ''; }
    const tk = `${key}|${p.tpl}`;
    if (tk !== tplKey) { tplKey = tk; const T = M.cachedTemplate(p.tpl); tplCorr = { T, n: M.correlate(rec.noise, T), u: M.correlate(rec.unit, T) }; }
    const rho = M.snrFrom(tplCorr.n, tplCorr.u, p.amp);
    const pk = M.peak(rho);
    const both = parts ? M.scanBoth(parts, p.amp) : null;
    const scan = both ? both.rho : null;
    const post = both ? M.posteriorLog(BANK, both.logL) : null;
    const ci = post ? M.credible(BANK, post, P.level) : null;
    return { p, rho, pk, scan, post, ci, T: tplCorr.T, opt: p.amp * rec.optimal };
  };

  const fsz = (plot) => ((plot.c.clientWidth || 600) < 520 ? 9.5 : 11);

  function drawData(pl, S) {
    const { p } = S, n = rec.noise, u = rec.unit;
    const top = Math.max(4, 1.15 * p.amp + 3.2);
    pl.setView([0, 1], [-top, top]);
    pl.clear();
    const stride = Math.max(1, Math.floor(M.N / Math.max(600, 2 * (pl.R - pl.L))));
    const pts = [];
    for (let i = 0; i < M.N; i += stride) pts.push([i / M.FS, n[i] + p.amp * u[i]]);
    pl.path(pts, { color: 'ink3', width: 1 });
    if (p.reveal) {
      const sp = [];
      for (let i = 0; i < M.N; i++) if (u[i] !== 0 || (i > 0 && u[i - 1] !== 0)) sp.push([i / M.FS, p.amp * u[i]]);
      pl.path(sp, { color: 'gold', width: 1.6 });
      pl.text('hidden signal', M.T_END, top * 0.82, { align: 'right', dx: -6, color: 'gold', size: fsz(pl) });
    }
    pl.text('record = noise + signal', 0, top * 0.82, { dx: 6, color: 'ink2', size: fsz(pl) });
  }

  function drawSnr(pl, S) {
    const { rho, pk, p } = S;
    const ymax = Math.max(6, Math.ceil(Math.max(pk.rho, S.opt) * 1.25));
    pl.setView([0, 1], [0, ymax]);
    pl.clear();
    const pts = [];
    for (let j = 0; j < M.N; j += 2) pts.push([j / M.FS, rho[j]]);
    pl.path(pts, { color: 'accent', width: 1.4 });
    pl.line(0, ROOT_HALF_PI, 1, ROOT_HALF_PI, { color: 'ink3', width: 1, dash: [4, 4] });
    pl.text('noise alone: mean 1.25', 0.01, ROOT_HALF_PI, { dy: -9, color: 'ink3', size: fsz(pl) });
    pl.point(pk.t, pk.rho, { color: 'accent', r: 4 });
    if (p.reveal) pl.line(M.T_END, 0, M.T_END, ymax, { color: 'gold', width: 1.2, dash: [6, 4] });
    const startT = (S.T.L - 1) / M.FS;
    if (startT > 0.02) { pl.rect(0, 0, startT, ymax, { fill: 'ink4', alpha: 0.12, stroke: false }); pl.text('template longer than this', startT / 2, ymax * 0.88, { align: 'center', color: 'ink3', size: fsz(pl) - 0.5 }); }
  }

  function drawScan(pl, S) {
    const { scan, p } = S;
    const ymax = Math.max(6, Math.ceil(Math.max(...scan, S.opt) * 1.2));
    pl.setView([M.MC_MIN, M.MC_MAX], [0, ymax]);
    pl.clear();
    pl.path(BANK.map((m, i) => [m, scan[i]]), { color: 'violet', width: 2 });
    pl.line(M.MC_MIN, ROOT_HALF_PI, M.MC_MAX, ROOT_HALF_PI, { color: 'ink3', width: 1, dash: [4, 4] });
    if (panels.includes('data') || panels.includes('snr')) {
      pl.line(p.tpl, 0, p.tpl, ymax, { color: 'accent', width: 1.6 });
      pl.text('template', p.tpl, ymax * 0.92, { dx: 5, color: 'accent', size: fsz(pl) });
    }
    if (p.reveal) {
      pl.line(p.Mc, 0, p.Mc, ymax, { color: 'gold', width: 1.2, dash: [6, 4] });
      pl.text('true', p.Mc, ymax * 0.8, { dx: 5, color: 'gold', size: fsz(pl) });
    }
  }

  function drawPost(pl, S) {
    const { post, ci, p } = S;
    const ymax = Math.max(...post) * 1.15;
    const w = Math.max(1.5, ci.hi - ci.lo);
    const x0 = Math.max(M.MC_MIN, ci.lo - 2 * w), x1 = Math.min(M.MC_MAX, ci.hi + 2 * w);
    pl.setView([x0, x1], [0, ymax]);
    pl.clear();
    const inside = BANK.map((m, i) => [m, post[i]]).filter(([m]) => m >= ci.lo && m <= ci.hi);
    if (inside.length > 1) pl.path([[ci.lo, 0], ...inside, [ci.hi, 0]], { color: 'good', fill: 'good', fillAlpha: 0.25, stroke: false });
    pl.path(BANK.map((m, i) => [m, post[i]]), { color: 'good', width: 2 });
    pl.text(`${Math.round(P.level * 100)}% credible`, ci.hi, ymax * 0.5, { dx: 6, color: 'good', size: fsz(pl) });
    if (p.reveal) {
      pl.line(p.Mc, 0, p.Mc, ymax, { color: 'gold', width: 1.2, dash: [6, 4] });
      pl.text('true', p.Mc, ymax * 0.9, { dx: 5, color: 'gold', size: fsz(pl) });
    }
  }

  const num = (x, d = 2) => String(+x.toFixed(d));
  function readout(S) {
    if (P.readout === false) return;
    const q = (k, v) => (hide.has(k) ? '?' : v);
    const rows = [];
    if (panels.includes('data') || panels.includes('snr')) {
      rows.push(['template length', `${num(S.T.duration, 3)}\\ \\text{s},\\ ${num(cyclesBetween(M.F_LOW, M.F_HIGH, S.p.tpl), 1)}\\ \\text{cycles}`]);
      rows.push(['peak SNR $\\rho$', q('peak', num(S.pk.rho))]);
      rows.push(['at $t$', q('time', `${num(S.pk.t, 3)}\\ \\text{s}`)]);
    }
    rows.push(['optimal SNR $\\rho_{\\text{opt}}$', q('opt', num(S.opt))]);
    if (S.ci && panels.includes('post')) rows.push([`${Math.round(P.level * 100)}% credible interval`, q('ci', `${num(S.ci.lo, 1)}\\text{–}${num(S.ci.hi, 1)}\\ M_\\odot`)]);
    F.readout(rows);
  }

  function drawAll() {
    const S = state();
    for (const p of panels) ({ data: drawData, snr: drawSnr, scan: drawScan, post: drawPost })[p](canv[p], S);
    readout(S);
  }
  F.onChange(() => drawAll());
  F.draw(drawAll);
  F.caption(P.caption || 'A one-second toy record sampled at 4096 Hz: white Gaussian noise (real detector noise is coloured, and real filters weight each frequency by it) plus a leading-order inspiral chirp from 30 to 250 Hz, cut off there — no merger or ringdown. The SNR is maximized over phase and arrival time. The posterior sums the likelihood over arrival time but maximizes it over amplitude and phase, a shortcut for the full marginalization real analyses do.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  const inMc = (v) => typeof v === 'number' && v >= M.MC_MIN && v <= M.MC_MAX;
  if (!inMc(P.Mc)) p.push('sg2-matched: Mc is a chirp mass from 15 to 60');
  if (!inMc(P.tpl) || Math.abs(P.tpl * 2 - Math.round(P.tpl * 2)) > 1e-9) p.push('sg2-matched: tpl is a chirp mass from 15 to 60 in steps of 0.5');
  if (!(typeof P.amp === 'number' && P.amp >= 0 && P.amp <= 3)) p.push('sg2-matched: amp lies in [0, 3]');
  if (!(Number.isInteger(P.seed) && P.seed >= 0)) p.push('sg2-matched: seed is a whole number');
  if (!(Array.isArray(P.panels) && P.panels.length && P.panels.every((x) => PANELS.includes(x)))) p.push(`sg2-matched: panels lists some of ${PANELS.join(', ')}`);
  if (!(P.level > 0 && P.level < 1)) p.push('sg2-matched: level lies strictly between 0 and 1');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`sg2-matched: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`sg2-matched: unknown hide “${h}”`);
  return p;
}
