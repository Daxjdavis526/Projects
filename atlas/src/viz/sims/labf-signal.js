// Signals buried in noise, and what a lab does about it — three modes for the
// lab course's noise, lock-in and sampling lessons (lab.A8–A9). The physics
// and statistics are model/labf-signal.js (tested in test/labf-signal.test.mjs).
//
//   lockin  A 1 kHz signal of amplitude 1 under 60 Hz hum and white noise
//           (by default the input's rms is about 1000 times the signal), fed to a
//           lock-in: a 50 ms stretch of the input (the signal drawn ×100), then
//           the outputs X and Y settling over 12 s toward A cos(φ − θ) and
//           A sin(φ − θ), with the predicted ±σ band from the ENBW.
//   allan   Readings at fs (white + flicker + random-walk noise): the trace and
//           its one-minute running mean, then the Allan deviation against averaging
//           time on log–log axes beside the white-noise 1/√N line.
//   strobe  A wheel turning at f rev/s lit by a strobe at fs flashes/s: where
//           the marked spoke is at each flash (Play animates it: the apparent,
//           aliased rotation), and its height against time — the true motion,
//           the samples, and the slower alias sine that fits them equally well.
//
//   { type: 'labf-signal', params: {
//       mode: 'lockin',
//       // lockin
//       white: 10, hum: 1400, tau: 0.3, poles: 2, theta: 0, phi: 35, T: 12, seed: 1,
//       // allan
//       sw: 0.3, flick: 0.02, walk: 0, fs: 10, n: 32768, unit: 'K',
//       // strobe
//       f: 24, fsamp: 25, play: null,
//       controls: null,       // true, false, or a list of control keys (default: all of the mode's, not in a compact picture)
//       readout: true, hide: [],   // readouts shown as “?”: lockin R X Y sigma rms; allan best floor; strobe alias rpm nyquist
//   } }

import { Plot, pow10Label } from '../plot.js';
import * as M from '../model/labf-signal.js';

export const defaults = {
  mode: 'lockin',
  white: 10, hum: 1400, tau: 0.3, poles: 2, theta: 0, phi: 35, T: 12, seed: 1,
  sw: 0.3, flick: 0.02, walk: 0, fs: 10, n: 32768, unit: 'K',
  f: 24, fsamp: 25, play: null,
  controls: null, readout: true, hide: [], caption: null, alt: null,
};
const MODES = ['lockin', 'allan', 'strobe'];
const CONTROLS = { lockin: ['tau', 'white', 'hum', 'theta', 'poles'], allan: ['sw', 'flick', 'walk'], strobe: ['f', 'fsamp'] };
const HIDE = ['R', 'X', 'Y', 'sigma', 'rms', 'best', 'floor', 'alias', 'rpm', 'nyquist'];
const D2R = Math.PI / 180;
const f3 = (x) => (Number.isFinite(x) ? String(+x.toPrecision(3)) : '—');
const texNum = (x, n = 3) => {
  if (!Number.isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  return String(+x.toPrecision(n));
};

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const q = (k, v) => (hide.has(k) ? '?' : v);
  const all = CONTROLS[P.mode];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? all : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  const narrow = (cv) => (cv.clientWidth || 600) < 520;

  if (P.mode === 'lockin') return lockinMode();
  if (P.mode === 'allan') return allanMode();
  return strobeMode();

  // ─── lock-in ─────────────────────────────────────────────────────────────
  function lockinMode() {
    ctl('tau', () => F.slider({ key: 'tau', label: 'Time constant $\\tau$', min: 0.003, max: 1.5, value: P.tau, logScale: true, unit: '\\mathrm{s}', explain: 'Each RC stage of the output filter. Longer: less noise, slower response (it takes several τ to settle).' }));
    ctl('white', () => F.slider({ key: 'white', label: 'White noise (× signal)', min: 0, max: 100, step: 1, value: P.white, unit: '', explain: 'The rms of broadband white noise in the input, in units of the signal’s amplitude, over the 10 kHz the input is sampled in.' }));
    ctl('hum', () => F.slider({ key: 'hum', label: '60 Hz hum (× signal)', min: 0, max: 2000, step: 10, value: P.hum, unit: '', explain: 'Mains pickup, as an amplitude in units of the signal’s amplitude.' }));
    ctl('theta', () => F.slider({ key: 'theta', label: 'Reference phase $\\theta$', min: 0, max: 360, step: 1, value: P.theta, unit: '^\\circ', explain: 'The phase of the lock-in’s reference. X peaks when it matches the signal’s phase; Y when it is 90° away.' }));
    ctl('poles', () => F.choice({ key: 'poles', label: 'Filter slope', options: [[1, '6 dB/oct (1 stage)'], [2, '12 dB/oct (2)'], [4, '24 dB/oct (4)']], value: P.poles, explain: 'How many RC stages are cascaded. More stages reject nearby frequencies (the hum) far better.' }));
    const a = F.canvas({ aspect: 'wide', label: P.alt || 'The lock-in’s input: noise and hum many times larger than the signal' });
    const pa = new Plot(a.canvas, { x: [0, 50], y: [-1, 1], xlabel: 't (ms)', ylabel: 'input', axesAt: 'edge' });
    const b = F.canvas({ aspect: 'wide', label: 'The lock-in outputs X and Y settling toward the signal' });
    const pb = new Plot(b.canvas, { x: [0, P.T], y: [-2, 2], xlabel: 't (s)', ylabel: 'output (× signal)', axesAt: 'edge' });
    let L = null;
    const run = () => {
      const p = F.params;
      L = M.lockin({ A: 1, phi: P.phi * D2R, theta: p.theta * D2R, white: p.white, hum: p.hum, tau: p.tau, poles: p.poles, T: P.T, seed: P.seed, fs: 20000, f: 1000 });
    };
    function draw() {
      if (!L) run();
      const fs = narrow(a.canvas) ? 10 : 11.5;
      const m = Math.max(1e-9, ...L.snip.map(Math.abs));
      pa.setView([0, 50], [-1.15 * m, 1.15 * m]);
      pa.clear();
      pa.path(L.snip.map((v, i) => [1000 * i * L.dtSnip, v]), { color: 'accent', width: 1 });
      pa.path(L.sig.map((v, i) => [1000 * i * L.dtSnip, 100 * v]), { color: 'gold', width: 1.8 });
      pa.text('signal ×100', 49, 100, { color: 'gold', align: 'right', size: fs, dy: -10 });
      pa.text(`input rms = ${Math.round(L.rms)} × the signal’s amplitude`, 1, 1.15 * m, { color: 'ink2', size: fs, dx: 4, dy: 12 });
      const th = F.params.theta * D2R, ph = P.phi * D2R;
      const X0 = Math.cos(ph - th), Y0 = Math.sin(ph - th);
      const lim = Math.min(12, Math.max(1.6, 4 * L.sigmaOut + 1.2));
      pb.setView([0, P.T], [-lim, lim]);
      pb.clear();
      pb.rect(0, X0 - L.sigmaOut, P.T, 2 * L.sigmaOut, { color: 'accent', alpha: 0.12, stroke: false });
      pb.line(0, X0, P.T, X0, { color: 'accent', width: 1.2, dash: [6, 5] });
      pb.line(0, Y0, P.T, Y0, { color: 'violet', width: 1.2, dash: [6, 5] });
      const clip = (v) => Math.max(-lim * 1.05, Math.min(lim * 1.05, v));
      pb.path(L.t.map((t, i) => [t, clip(L.Y[i])]), { color: 'violet', width: 1.5 });
      pb.path(L.t.map((t, i) => [t, clip(L.X[i])]), { color: 'accent', width: 2 });
      pb.text('X', P.T, clip(L.x), { color: 'accent', size: fs + 1, weight: 700, dx: -14, dy: -10 });
      pb.text('Y', P.T, clip(L.y), { color: 'violet', size: fs + 1, weight: 700, dx: -14, dy: 14 });
      if (P.readout !== false) F.readout([
        ['input rms ÷ signal', q('rms', String(Math.round(L.rms)))],
        ['$X$ at the end', q('X', f3(L.x))], ['$Y$ at the end', q('Y', f3(L.y))],
        ['$R = \\sqrt{X^2 + Y^2}$', q('R', f3(L.R))],
        ['predicted $\\sigma_X$', q('sigma', texNum(L.sigmaOut))],
        ['ENBW', `${texNum(L.enbw)}\\,\\text{Hz}`],
      ]);
    }
    F.onChange(() => { run(); draw(); });
    F.draw(draw);
    F.caption('A simulated lock-in amplifier with amplitude outputs (X → A cos(φ − θ), Y → A sin(φ − θ)); real instruments usually display rms, A/√2. The input is sampled at 20 kHz; the shaded band is ±1 predicted σ of X from white noise alone. Simulated data: a browser cannot replace bench work.');
    return { get: (k) => (k === 'R' ? L?.R : F.params[k]) };
  }

  // ─── Allan deviation ─────────────────────────────────────────────────────
  function allanMode() {
    ctl('sw', () => F.slider({ key: 'sw', label: 'White noise per reading', min: 0, max: 1, step: 0.01, value: P.sw, unit: `\\mathrm{${P.unit}}`, explain: 'Independent from reading to reading: it averages away as 1/√N.' }));
    ctl('flick', () => F.slider({ key: 'flick', label: 'Flicker (1/f) noise', min: 0, max: 0.1, step: 0.001, value: P.flick, unit: `\\mathrm{${P.unit}}`, explain: 'Slow wandering on every time scale: averaging longer stops helping, and the Allan deviation levels off.' }));
    ctl('walk', () => F.slider({ key: 'walk', label: 'Random-walk drift per reading', min: 0, max: 0.005, step: 0.0001, value: P.walk, unit: `\\mathrm{${P.unit}}`, explain: 'Each reading’s offset steps at random from the last one’s: a drift that makes long averages worse.' }));
    const a = F.canvas({ aspect: 'wide', label: P.alt || 'A long record of readings with its running mean' });
    const pa = new Plot(a.canvas, { x: [0, 1], y: [-1, 1], xlabel: 't (min)', ylabel: `reading (${P.unit})`, axesAt: 'edge' });
    const b = F.canvas({ aspect: 'wide', label: 'The Allan deviation against averaging time, on log–log axes' });
    const pb = new Plot(b.canvas, { x: [-1, 3], y: [-3, 0], xlabel: 'averaging time τ (s)', ylabel: `Allan deviation (${P.unit})`, axesAt: 'edge', xfmt: pow10Label, yfmt: pow10Label });
    let X = null, C = null;
    const run = () => {
      const p = F.params;
      X = M.noise({ n: P.n, fs: P.fs, white: p.sw, flicker: p.flick, walk: p.walk, seed: P.seed });
      C = M.allanCurve(X, P.fs);
    };
    function draw() {
      if (!X) run();
      const fs = narrow(a.canvas) ? 10 : 11.5;
      const n = X.length, Tm = n / P.fs / 60, step = Math.max(1, Math.floor(n / 1500));
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i < n; i += step) { lo = Math.min(lo, X[i]); hi = Math.max(hi, X[i]); }
      const pad = 0.08 * (hi - lo || 1);
      pa.setView([0, Tm], [lo - pad, hi + pad]);
      pa.clear();
      const pts = []; for (let i = 0; i < n; i += step) pts.push([i / P.fs / 60, X[i]]);
      pa.path(pts, { color: 'accent', width: 0.8, alpha: 0.6 });
      const w = Math.max(1, Math.round(60 * P.fs)); const run1 = []; let s = 0;
      for (let i = 0; i < n; i++) { s += X[i]; if (i >= w) s -= X[i - w]; if (i >= w - 1 && i % step === 0) run1.push([i / P.fs / 60, s / w]); }
      pa.path(run1, { color: 'gold', width: 2.2 });
      pa.text('1-minute running mean', Tm, hi + pad, { color: 'gold', align: 'right', size: fs, dx: -4, dy: 12 });
      const L = C.filter((c) => c.adev > 0).map((c) => [Math.log10(c.tau), Math.log10(c.adev)]);
      const ys = L.map((p) => p[1]);
      const y0 = Math.floor(Math.min(...ys) - 0.3), y1 = Math.ceil(Math.max(...ys) + 0.2);
      const x0 = Math.log10(1 / P.fs) - 0.1, x1 = Math.log10(C[C.length - 1].tau) + 0.1;
      pb.setView([x0, x1], [y0, y1]);
      pb.clear();
      if (F.params.sw > 0) pb.line(x0, Math.log10(F.params.sw) - 0.5 * (x0 + Math.log10(P.fs)), x1, Math.log10(F.params.sw) - 0.5 * (x1 + Math.log10(P.fs)), { color: 'ink3', width: 1.3, dash: [6, 5] });
      pb.path(L, { color: 'accent', width: 2 });
      L.forEach(([x, y]) => pb.point(x, y, { color: 'accent', r: 3 }));
      let best = C[0]; for (const c of C) if (c.adev < best.adev) best = c;
      pb.point(Math.log10(best.tau), Math.log10(best.adev), { color: 'gold', r: 5 });
      if (F.params.sw > 0) pb.text('white noise alone: σ/√N', x1, Math.log10(F.params.sw) - 0.5 * (x1 + Math.log10(P.fs)), { color: 'ink3', size: fs, align: 'right', dx: -6, dy: 16 });
      if (P.readout !== false) F.readout([
        ['record', `${texNum(n / P.fs / 60)}\\,\\text{min at }${P.fs}\\,\\text{Hz}`],
        ['best averaging time', q('best', `${texNum(best.tau)}\\,\\text{s}`)],
        ['lowest Allan deviation', q('floor', `${texNum(best.adev)}\\,\\text{${P.unit}}`)],
      ]);
    }
    F.onChange(() => { run(); draw(); });
    F.draw(draw);
    F.caption('Simulated readings: white noise, flicker noise built from a sum of slow random processes (a teaching model of 1/f noise), and a random walk. The Allan deviation is the overlapping estimator at averaging times 1, 2, 4 … samples; at the longest times it rests on few averages and is itself noisy. Simulated data: a browser cannot replace bench work.');
    return { get: (k) => F.params[k] };
  }

  // ─── stroboscope and aliasing ────────────────────────────────────────────
  function strobeMode() {
    ctl('f', () => F.slider({ key: 'f', label: 'Wheel speed $f$', min: 0, max: 60, step: 0.5, value: P.f, unit: '\\mathrm{rev/s}', explain: 'The true rotation rate: the frequency of the signal being sampled.' }));
    ctl('fsamp', () => F.slider({ key: 'fsamp', label: 'Flash rate $f_s$', min: 5, max: 60, step: 0.5, value: P.fsamp, unit: '\\mathrm{Hz}', explain: 'Flashes per second: the sampling rate. You only ever see the wheel at the flashes.' }));
    const a = F.canvas({ aspect: 'wide', label: P.alt || 'A wheel lit by a strobe, and its spoke’s height sampled at each flash' });
    const pl = new Plot(a.canvas, { x: [-1.3, 7.3], y: [-1.35, 1.35], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
    const b = F.canvas({ aspect: 'wide', label: 'The spoke’s height against time: the true motion, the flashes and the alias' });
    const pb = new Plot(b.canvas, { x: [0, 1], y: [-1.3, 1.3], xlabel: 't (s)', ylabel: 'spoke height', axesAt: 'edge' });
    let k = 0, acc = 0;
    function draw() {
      const f = F.params.f, fs = F.params.fsamp, fa = M.alias(f, fs);
      const sz = narrow(a.canvas) ? 10 : 11.5;
      pl.clear();
      // the wheel
      pl.circle(0, 0, 1, { color: 'ink3', width: 1.5 });
      pl.point(0, 0, { color: 'ink3', r: 3 });
      const show = running ? [k] : [0, 1, 2, 3, 4, 5];
      show.forEach((j, idx) => {
        const th = 2 * Math.PI * f * (j / fs) + Math.PI / 2;
        const op = running ? 1 : 0.25 + 0.15 * idx;
        pl.line(0, 0, Math.cos(th), Math.sin(th), { color: 'gold', width: running ? 3 : 2, alpha: op });
        pl.point(Math.cos(th), Math.sin(th), { color: 'gold', r: running ? 5 : 4 });
        if (!running) pl.text(String(j + 1), 1.17 * Math.cos(th), 1.17 * Math.sin(th), { color: 'ink2', size: sz, align: 'center', dy: 4 });
      });
      pl.text(running ? `flash ${k + 1}` : 'flashes 1–6', 0, -1.3, { color: 'ink2', size: sz, align: 'center' });
      // the alias as words
      const dir = fa === 0 ? 'stands still' : fa > 0 ? 'turns forwards' : 'turns backwards';
      pl.text(`seen under the strobe, the wheel ${dir}`, 1.6, 0.85, { color: 'ink', size: sz + 0.5 });
      pl.text(hide.has('alias') ? 'at ? rev/s' : `at ${f3(Math.abs(fa))} rev/s (it really turns at ${f3(f)})`, 1.6, 0.45, { color: 'ink2', size: sz });
      pl.text(`Nyquist: flashes resolve up to ${f3(fs / 2)} rev/s`, 1.6, 0.0, { color: 'ink3', size: sz });
      // the time plot: 12 flashes
      const Tw = 12 / fs;
      pb.setView([0, Tw], [-1.3, 1.3]);
      pb.clear();
      pb.fn((t) => Math.sin(2 * Math.PI * f * t), { color: 'ink3', width: 1, samples: 2400 });
      if (!hide.has('alias')) pb.fn((t) => Math.sin(2 * Math.PI * fa * t), { color: 'warn', width: 1.8, dash: [6, 4], samples: 600 });
      for (let j = 0; j <= 12; j++) pb.point(j / fs, Math.sin(2 * Math.PI * f * j / fs), { color: 'gold', r: running && j === k % 13 ? 6 : 4 });
      if (P.readout !== false) F.readout([
        ['Nyquist frequency $f_s/2$', q('nyquist', `${f3(fs / 2)}\\,\\text{Hz}`)],
        ['apparent frequency', q('alias', `${f3(fa)}\\,\\text{Hz}`)],
        ['apparent speed', q('rpm', `${f3(60 * fa)}\\,\\text{rpm}`)],
      ]);
    }
    const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let running = !!P.play && !F.compact && !reduced();
    const step = (dt) => { acc += dt * 6; if (acc >= 1) { acc -= 1; k = (k + 1) % 240; draw(); } };   // six flashes a second, on screen
    let loop = F.animate((dt) => { if (running) step(dt); });
    if (!F.compact && P.play !== false) {
      const btn = F.button({ label: running ? 'Pause' : 'Play the flashes', onClick: () => {
        running = !running; btn.textContent = running ? 'Pause' : 'Play the flashes';
        loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running }); draw();
      } });
    }
    F.onChange(() => { k = 0; draw(); });
    F.draw(draw);
    F.caption('One marked spoke, lit only at the flashes (Play shows them six to the second, slowed down). Gold dots: the spoke’s height at each flash. Grey: its true motion between flashes, which the flashes never see. Dashed orange: the slowest sine through the same dots — the alias.');
    return { get: (key) => F.params[key] };
  }
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  if (!MODES.includes(P.mode)) { p.push(`labf-signal: mode is one of ${MODES.join(', ')}`); return p; }
  if (P.mode === 'lockin') {
    if (![1, 2, 4].includes(P.poles)) p.push('labf-signal: poles is 1, 2 or 4');
    if (!(P.tau >= 0.003 && P.tau <= 1.5)) p.push('labf-signal: tau lies in 0.003–1.5 s');
    if (!(P.white >= 0 && P.white <= 100)) p.push('labf-signal: white lies in 0–100');
    if (!(P.hum >= 0 && P.hum <= 2000)) p.push('labf-signal: hum lies in 0–2000');
    if (!(P.T >= 1 && P.T <= 20)) p.push('labf-signal: T lies in 1–20 s');
  }
  if (P.mode === 'allan') {
    if (!(P.sw >= 0 && P.sw <= 1 && P.flick >= 0 && P.flick <= 0.1 && P.walk >= 0 && P.walk <= 0.005)) p.push('labf-signal: sw 0–1, flick 0–0.1, walk 0–0.005');
    if (!(P.sw > 0 || P.flick > 0 || P.walk > 0)) p.push('labf-signal: some noise is needed');
    if (!(Number.isInteger(P.n) && P.n >= 1024 && P.n <= 131072)) p.push('labf-signal: n is a whole number of readings, 1024–131072');
    if (!(P.fs > 0)) p.push('labf-signal: fs must be positive');
    if (typeof P.unit !== 'string' || !/^[A-Za-z]{0,4}$/.test(P.unit)) p.push('labf-signal: unit is a short plain unit such as K or mV');
  }
  if (P.mode === 'strobe') {
    if (!(P.f >= 0 && P.f <= 60)) p.push('labf-signal: f lies in 0–60 rev/s');
    if (!(P.fsamp >= 5 && P.fsamp <= 60)) p.push('labf-signal: fsamp lies in 5–60 Hz');
  }
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS[P.mode].includes(c)) p.push(`labf-signal: unknown control “${c}” for mode ${P.mode}`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`labf-signal: unknown hide “${h}”`);
  return p;
}
