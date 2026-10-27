// Sound as a pressure wave. Air is drawn as rows of parcels (dots) that move
// back and forth along the direction the sound travels, crowding into
// compressions and spreading into rarefactions; underneath, the displacement
// s(x) and the pressure variation Δp(x) along the same axis. Physics in
// model/wave-physics.js (tested headlessly). Three modes:
//
//   travel  a sound wave travelling through a gas: frequency, gas and temperature set
//           v = √(γRT/M) and λ = v/f. Pressure peaks where the displacement is zero.
//   pipe    standing sound waves in an air column, open or closed at each end: the k-th
//           resonance, its harmonic number n, displacement and pressure nodes and antinodes.
//   beats   two tones of nearly equal frequency: the loudness envelope over one second,
//           a zoom on the waveform, and (on request) the sound itself.
//
//   { type: 'wave-sound', params: {
//       mode: 'travel',                 // travel pipe beats
//       controls: true, play: true, readout: true,
//       // travel: f (Hz) 343, gas 'air' | 'helium' | 'co2', T (°C) 20, view (m) 2
//       // pipe:   ends 'open-open' | 'closed-open' | 'closed-closed', k 1 (the k-th resonance), L (m) 0.5, T (°C) 20,
//       //         ask: false (hide the frequencies)
//       // beats:  f1 (Hz) 440, f2 (Hz) 444, listen: true (offer a Listen button)
//   } }

import { Plot } from '../plot.js';
import * as W from '../model/wave-physics.js';

const MODES = ['travel', 'pipe', 'beats'];
const ENDS = ['open-open', 'closed-open', 'closed-closed'];
const MODE_DEFAULTS = {
  travel: { f: 343, gas: 'air', T: 20, view: 2 },
  pipe: { ends: 'open-open', k: 1, L: 0.5, T: 20, ask: false },
  beats: { f1: 440, f2: 444, listen: true },
};
export const defaults = { mode: 'travel', controls: true, play: true, readout: true };
const ENDS_TEXT = { 'open-open': 'open at both ends', 'closed-open': 'closed at the left, open at the right', 'closed-closed': 'closed at both ends' };
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
/** The harmonic number of the k-th resonance of a pipe. */
export const harmonicOf = (ends, k) => (ends === 'closed-open' ? 2 * k - 1 : k);

export async function mount(F, P0) {
  const mode = P0.mode || 'travel';
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const ctl = P.controls !== false;
  const { canvas } = F.canvas({ aspect: '', label: P.alt || (mode === 'beats' ? 'Two tones adding up to beats' : 'Air parcels in a sound wave, with graphs of displacement and pressure') });
  const ctx = canvas.getContext('2d');
  const S = { t: 0, running: !!P.play && !reduced && mode !== 'beats' };
  const slider = (o) => (ctl ? F.slider(o) : (F.params[o.key] = o.value));
  const choice = (o) => (ctl ? F.choice(o) : (F.params[o.key] = o.value));

  if (mode === 'travel') {
    slider({ key: 'f', label: 'Frequency $f$', min: 100, max: 1000, step: 1, value: P.f, unit: '\\mathrm{Hz}', explain: 'How many times per second each parcel of air moves back and forth. Set by the source.' });
    choice({ key: 'gas', label: 'Gas', options: [['air', 'Air'], ['helium', 'Helium'], ['co2', 'Carbon dioxide']], value: P.gas, explain: 'Lighter molecules (smaller molar mass $M$) carry sound faster.' });
    slider({ key: 'T', label: 'Temperature', min: -60, max: 40, step: 1, value: P.T, unit: '^\\circ\\mathrm{C}', explain: 'Warmer gas, faster molecules, faster sound: $v \\propto \\sqrt{T}$ with $T$ in kelvin.' });
  } else if (mode === 'pipe') {
    choice({ key: 'ends', label: 'Pipe', options: [['open-open', 'Open–open'], ['closed-open', 'Closed–open'], ['closed-closed', 'Closed–closed']], value: P.ends, explain: 'An open end lets air move freely; a closed end stops it.' });
    slider({ key: 'k', label: 'Resonance', min: 1, max: 5, step: 1, value: P.k, unit: '', explain: 'The 1st, 2nd, 3rd… frequency at which this pipe resonates.' });
    slider({ key: 'L', label: 'Length $L$', min: 0.2, max: 2, step: 0.01, value: P.L, unit: '\\mathrm{m}', explain: 'A longer pipe resonates at lower frequencies.' });
    slider({ key: 'T', label: 'Air temperature', min: -60, max: 40, step: 1, value: P.T, unit: '^\\circ\\mathrm{C}', explain: 'Sets the speed of sound, and so every resonant frequency.' });
  } else {
    slider({ key: 'f1', label: 'Tone 1, $f_1$', min: 200, max: 600, step: 0.5, value: P.f1, unit: '\\mathrm{Hz}', explain: 'The first tone.' });
    slider({ key: 'f2', label: 'Tone 2, $f_2$', min: 200, max: 600, step: 0.5, value: P.f2, unit: '\\mathrm{Hz}', explain: 'The second tone. Bring it close to the first.' });
  }

  let playBtn = null;
  const anim = F.animate((dt) => { if (!S.running) return; S.t += dt; draw(); }, { force: true });
  if (ctl && mode !== 'beats') {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => {
      S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play';
      if (S.running) anim.start();
    } });
  }
  // the beats can be heard: two quiet sine tones for three seconds, started by the learner
  let audio = null;
  if (ctl && mode === 'beats' && P.listen) {
    F.button({ label: 'Listen (3 s)', primary: true, onClick: () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio ??= new AC();
        const now = audio.currentTime, g = audio.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.1);
        g.gain.setValueAtTime(0.08, now + 2.8);
        g.gain.linearRampToValueAtTime(0, now + 3);
        g.connect(audio.destination);
        for (const f of [F.params.f1, F.params.f2]) {
          const o = audio.createOscillator();
          o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(now); o.stop(now + 3.05);
        }
      } catch { /* no audio available: the picture still shows the beats */ }
    } });
    F.onDestroy(() => { try { audio?.close(); } catch { /* ignore */ } });
  }
  F.onChange(() => draw());

  const top = new Plot(canvas, { x: [0, 1], y: [-1, 1], grid: false, axes: false });
  const bot = new Plot(canvas, { x: [0, 1], y: [-1.3, 1.3], xlabel: 'x (m)', ylabel: '' });

  function speed() {
    const g = W.GASES[mode === 'travel' ? F.params.gas : 'air'];
    return W.soundSpeed(g.gamma, F.params.T + 273.15, g.M);
  }
  function regions() {
    top.resize(); top.refreshTheme(); bot.resize(); bot.refreshTheme();
    const H = top.h, split = Math.round(H * 0.5);
    ctx.clearRect(0, 0, top.w, H);
    return { H, split };
  }
  // rows of parcels displaced by disp(x) (in world units, m), with a few tracers
  function parcels(pl, X0, X1, disp, { rows = 7, cols = 64, tracers = [] } = {}) {
    const dx = (X1 - X0) / cols;
    for (let j = 0; j < rows; j++) {
      const y = -0.8 + (1.6 * j) / (rows - 1);
      for (let i = 0; i <= cols; i++) {
        const x0 = X0 + (i + (j % 2) * 0.5) * dx;
        if (x0 > X1) continue;
        pl.point(x0 + disp(x0), y, { color: 'accent2', r: 2.3 });
      }
    }
    for (const xt of tracers) {
      pl.line(xt, -0.95, xt, 0.95, { color: 'bad', width: 1, dash: [2, 4], alpha: 0.6 });
      pl.point(xt + disp(xt), 0, { color: 'bad', r: 5 });
    }
  }

  function draw() {
    if (mode === 'beats') { drawBeats(); return; }
    const { H, split } = regions();
    const ph = W.TAU * 0.5 * S.t;                         // slow motion: half a cycle a second
    if (mode === 'travel') {
      const v = speed(), f = F.params.f, lam = v / f, X = P.view, k = W.TAU / lam;
      top.o.pad = { l: 46, r: 16, t: 26, b: H - split + 6 };
      top.setView([0, X], [-1, 1]);
      const s = (x) => Math.cos(k * x - ph);              // displacement / s_max
      const dp = (x) => Math.sin(k * x - ph);             // pressure variation / Δp_max
      // drawn displacement: enough to make the density swing by about ±50% (capped for very long waves)
      const D = Math.min(0.5 / k, 0.08 * X);
      parcels(top, 0, X, (x) => D * s(x), { tracers: [0.25 * X, 0.62 * X] });
      top.text('sound travels →', top.R - 4, 12, { screen: true, align: 'right', color: 'ink2', size: 12, weight: 600 });
      top.text('air parcels (red: two tracers and their home positions)', top.L + 2, 12, { screen: true, color: 'ink3', size: 11.5 });
      bot.o.pad = { l: 46, r: 16, t: split + 14, b: 34 };
      bot.o.yfmt = () => '';
      bot.setView([0, X], [-1.3, 1.3]);
      bot.grid(); bot.axes();
      bot.fn(s, { color: 'accent', width: 2.4 });
      bot.fn(dp, { color: 'warn', width: 2.4, dash: [7, 5] });
      bot.text('displacement s (solid)', bot.L + 6, bot.T + 2, { screen: true, color: 'accent', size: 11.5, weight: 650, baseline: 'top' });
      bot.text('pressure Δp (dashed)', bot.L + 170, bot.T + 2, { screen: true, color: 'warn', size: 11.5, weight: 650, baseline: 'top' });
      if (P.readout !== false) F.readout([['speed of sound $v = \\sqrt{\\gamma RT/M}$', `${trim(v)}\\,\\mathrm{m/s}`], ['wavelength $\\lambda = v/f$', `${trim(lam)}\\,\\mathrm{m}`], ['period $1/f$', `${trim(1000 / f)}\\,\\mathrm{ms}`]]);
      return;
    }
    // a pipe
    const ends = F.params.ends, kk = F.params.k, L = F.params.L, v = speed();
    const n = harmonicOf(ends, kk), M = W.pipeMode(ends, n, v, L);
    const f1 = ends === 'closed-open' ? W.closedPipeMode(1, v, L) : W.harmonic(1, v, L);
    top.o.pad = { l: 46, r: 16, t: 26, b: H - split + 6 };
    top.setView([-0.04 * L, 1.04 * L], [-1.15, 1.15]);
    // the pipe walls and its ends
    top.line(0, 1, L, 1, { color: 'ink2', width: 3 }); top.line(0, -1, L, -1, { color: 'ink2', width: 3 });
    if (ends !== 'open-open') top.line(0, -1, 0, 1, { color: 'ink', width: 5 });
    if (ends === 'closed-closed') top.line(L, -1, L, 1, { color: 'ink', width: 5 });
    const c = Math.cos(ph);
    const kn = (n * Math.PI) / (ends === 'closed-open' ? 2 * L : L), D = Math.min(0.5 / kn, 0.1 * L);
    parcels(top, 0, L, (x) => D * M.s(x) * c, { cols: 56, tracers: [0.18 * L, 0.5 * L] });
    top.text(`${ENDS_TEXT[ends]} — resonance ${kk}: harmonic n = ${n} (slowed down)`, top.L + 2, 12, { screen: true, color: 'ink2', size: 12, weight: 600 });
    bot.o.pad = { l: 46, r: 16, t: split + 14, b: 34 };
    bot.o.yfmt = () => '';
    bot.setView([-0.04 * L, 1.04 * L], [-1.3, 1.3]);
    bot.grid(); bot.axes();
    const h = 1e-6 * L, ds = (x) => (M.s(x + h) - M.s(x - h)) / (2 * h);
    const pmax = (n * Math.PI) / (ends === 'closed-open' ? 2 * L : L);
    bot.fn((x) => M.s(x), { color: 'accent', width: 1.2, dash: [3, 4], domain: [0, L] });
    bot.fn((x) => -M.s(x), { color: 'accent', width: 1.2, dash: [3, 4], domain: [0, L] });
    bot.fn((x) => M.s(x) * c, { color: 'accent', width: 2.4, domain: [0, L] });
    bot.fn((x) => (-ds(x) / pmax) * c, { color: 'warn', width: 2.4, dash: [7, 5], domain: [0, L] });
    bot.text('displacement (solid; envelope dotted)', bot.L + 6, bot.T + 2, { screen: true, color: 'accent', size: 11.5, weight: 650, baseline: 'top' });
    bot.text('pressure (dashed)', bot.L + 240, bot.T + 2, { screen: true, color: 'warn', size: 11.5, weight: 650, baseline: 'top' });
    if (P.readout !== false) F.readout(P.ask ? [['harmonic number $n$', String(n)], ['speed of sound $v$', `${trim(v)}\\,\\mathrm{m/s}`]] : [
      ['harmonic number $n$', String(n)], ['frequency $f_n$', `${trim(M.f)}\\,\\mathrm{Hz}`], ['fundamental $f_1$', `${trim(f1)}\\,\\mathrm{Hz}`],
      ['wavelength $\\lambda_n$', `${trim(M.lambda)}\\,\\mathrm{m}`], ['speed of sound $v$', `${trim(v)}\\,\\mathrm{m/s}`],
    ]);
  }

  function drawBeats() {
    const { H, split } = regions();
    const f1 = F.params.f1, f2 = F.params.f2, fb = W.beatFrequency(f1, f2);
    // top: one second of loudness — the envelope, filled
    top.o.pad = { l: 46, r: 16, t: 24, b: H - split + 26 };
    top.o.grid = true; top.o.axes = true; top.o.xlabel = 't (s)'; top.o.yfmt = () => '';
    top.setView([0, 1], [-2.4, 2.4]);
    top.grid(); top.axes();
    const env = (t) => W.beatEnvelope(t, f1, f2);
    top.area(env, 0, 1, { color: 'accent', alpha: 0.35, lower: (t) => -env(t), samples: 600 });
    top.fn(env, { color: 'accent', width: 1.8 }); top.fn((t) => -env(t), { color: 'accent', width: 1.8 });
    top.text(`one second of the sum: the loudness swells ${trim(fb)} times (the tones themselves are too fast to draw here)`, top.L + 2, 12, { screen: true, color: 'ink2', size: 11.5, weight: 600 });
    // bottom: a 20 ms zoom on the waveform
    bot.o.pad = { l: 46, r: 16, t: split + 16, b: 34 };
    bot.o.xlabel = 't (ms)'; bot.o.yfmt = () => '';
    bot.setView([0, 20], [-2.4, 2.4]);
    bot.grid(); bot.axes();
    bot.fn((ms) => Math.cos(W.TAU * f1 * ms / 1000), { color: 'ink3', width: 1.1, dash: [4, 4] });
    bot.fn((ms) => Math.cos(W.TAU * f2 * ms / 1000), { color: 'ink4', width: 1.1, dash: [2, 3] });
    bot.fn((ms) => W.twoTones(ms / 1000, f1, f2), { color: 'good', width: 2.2 });
    bot.text('zoom on the first 20 ms: the two tones (dashed) and their sum (green)', bot.L + 2, bot.T - 4, { screen: true, color: 'ink2', size: 11.5, weight: 600 });
    if (P.readout !== false) F.readout([['beat frequency $|f_1 - f_2|$', `${trim(fb)}\\,\\mathrm{Hz}`], ['time between loud moments', fb > 0 ? `${trim(1 / fb)}\\,\\mathrm{s}` : '\\infty'], ['pitch heard $(f_1 + f_2)/2$', `${trim((f1 + f2) / 2, 4)}\\,\\mathrm{Hz}`]]);
  }

  F.draw(draw);
  F.caption({
    travel: 'Ideal gas, small amplitude. The parcels’ motion is exaggerated many thousands of times (in a real sound it is far less than a millimetre) and slowed to half a cycle per second. Pressure and displacement are each scaled to the same height.',
    pipe: 'Ideal pipe, small amplitude: open ends are treated as exact pressure nodes (a real open end acts as if the pipe were longer by about 0.6 of its radius). Motion exaggerated and slowed down; the curves below are scaled to the same height.',
    beats: 'Two pure tones of equal amplitude. Top: the envelope of their sum over one second; bottom: the waveform itself over the first 20 ms. The Listen button plays both tones quietly for three seconds.',
  }[mode]);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const problems = [];
  const mode = P0.mode ?? 'travel';
  if (!MODES.includes(mode)) return [`mode must be one of ${MODES.join(', ')}`];
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  const inr = (k, lo, hi) => { if (!(typeof P[k] === 'number' && P[k] >= lo && P[k] <= hi)) problems.push(`${k} must lie in [${lo}, ${hi}]`); };
  if (mode === 'travel') {
    inr('f', 100, 1000); inr('T', -60, 40); inr('view', 0.2, 20);
    if (!W.GASES[P.gas]) problems.push('gas must be air, helium or co2');
  } else if (mode === 'pipe') {
    if (!ENDS.includes(P.ends)) problems.push(`ends must be one of ${ENDS.join(', ')}`);
    if (!(Number.isInteger(P.k) && P.k >= 1 && P.k <= 5)) problems.push('k must be a whole number from 1 to 5');
    inr('L', 0.2, 2); inr('T', -60, 40);
  } else {
    inr('f1', 200, 600); inr('f2', 200, 600);
  }
  for (const k of ['controls', 'play', 'readout']) if (typeof P[k] !== 'boolean') problems.push(`${k} must be true or false`);
  return problems;
}
