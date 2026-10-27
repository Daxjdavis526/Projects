// Waves on a stretched string, drawn as a row of beads so the medium can be
// seen moving: the pattern travels along, each bead only moves up and down.
// Physics in model/wave-physics.js (tested headlessly). Four modes:
//
//   travel    a sinusoidal wave y = A sin(kx ∓ ωt). The medium's speed v and the source's
//             frequency f set λ = v/f. A tagged bead (red), and optional arrows on the beads:
//             their velocity, or their acceleration — which follows the string's curvature,
//             as the wave equation says.
//   medium    a 20 m rope whose tension F_T and linear density μ set v = √(F_T/μ). Send
//             pulses of any height and flick duration, or drive it continuously at frequency f.
//             The far end is matched (nothing reflects).
//   two       superposition: two pulses on a collision course (a time slider freezes the
//             overlap), or two waves in the same direction with a phase difference φ.
//   standing  a string of length L fixed at both ends: one normal mode n, or the left end
//             shaken at frequency f with a resonance curve underneath (light damping).
//
//   { type: 'wave-string', params: {
//       mode: 'travel',               // travel medium two standing
//       controls: true,               // false: no sliders or buttons (a problem's picture)
//       play: true,                   // animate (unless the learner asked for reduced motion; Play then starts it)
//       time: 0,                      // the moment shown when play is false (s)
//       readout: true,                // numbers under the picture
//       // travel:   A (cm) 1, v (m/s) 2, f (Hz) 0.5, dir 1 | -1, view (m) 10, tag (m) 2.5 (null: none),
//       //           arrows 'none' | 'velocity' | 'acceleration', ask: false (hide λ, v, f in the readout)
//       // medium:   FT (N) 40, mu (kg/m) 0.4, L (m) 20, drive 'pulse' | 'wave', h (m) 0.3, dur (s) 0.3,
//       //           Aw (m) 0.2, fw (Hz) 1, pulses: [{ t0, h, dur }] already sent (for a static picture)
//       // two:      kind 'pulses' | 'waves', h1 0.8, h2 0.8 (m, ±), width (m) 1.6, A1 1, A2 1 (cm), phase (deg) 0
//       //           (pulses start centred at 2 m and 8 m on a 10 m string, moving toward each other at 2 m/s)
//       // standing: Ls (m) 1, FT (N) 50, mu (kg/m) 0.005, show 'mode' | 'drive', n 2, fd (Hz) 40, fmax (Hz) 300
//   } }

import { Plot } from '../plot.js';
import * as W from '../model/wave-physics.js';

const MODES = ['travel', 'medium', 'two', 'standing'];
const MODE_DEFAULTS = {
  travel: { A: 1, v: 2, f: 0.5, dir: 1, view: 10, tag: 2.5, arrows: 'none', ask: false },
  medium: { FT: 40, mu: 0.4, L: 20, drive: 'pulse', h: 0.3, dur: 0.3, Aw: 0.2, fw: 1, pulses: [] },
  two: { kind: 'pulses', h1: 0.8, h2: 0.8, width: 1.6, A1: 1, A2: 1, phase: 0 },
  standing: { Ls: 1, FT: 50, mu: 0.005, show: 'mode', n: 2, fd: 40, fmax: 300 },
};
export const defaults = { mode: 'travel', controls: true, play: true, time: 0, readout: true };
const GAIN = 25;               // standing/drive: the height of every resonance peak, in driver amplitudes
const V2 = 2, L2 = 10;         // two: wave speed (m/s) and string length (m)
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const texn = (x, n = 3) => { const a = Math.abs(x); if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; } return trim(x, n); };

export async function mount(F, P0) {
  const mode = P0.mode || 'travel';
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const ctl = P.controls !== false;
  const { canvas, box } = F.canvas({ aspect: mode === 'standing' && P.show === 'drive' ? '' : 'wide', label: P.alt || 'Waves on a string, drawn as beads' });
  const ctx = canvas.getContext('2d');
  const S = { t: P.time, running: !!P.play && !reduced, pulses: (P.pulses || []).map((q) => ({ ...q })), start: 0 };
  // an explorable rope starts with one pulse on its way
  if (mode === 'medium' && ctl && !S.pulses.length && P.drive === 'pulse') S.pulses.push({ t0: 0.2, h: P.h, dur: P.dur });

  // ─── controls ──────────────────────────────────────────────────────────
  const slider = (o) => (ctl ? F.slider(o) : (F.params[o.key] = o.value));
  const choice = (o) => (ctl ? F.choice(o) : (F.params[o.key] = o.value));
  if (mode === 'travel') {
    slider({ key: 'A', label: 'Amplitude $A$', min: 0.2, max: 2, step: 0.05, value: P.A, unit: '\\mathrm{cm}', explain: 'How far each bead swings from the straight line. Set by the source.' });
    slider({ key: 'f', label: 'Frequency $f$', min: 0.1, max: 2, step: 0.05, value: P.f, unit: '\\mathrm{Hz}', explain: 'How many times per second each bead swings up and down. Set by the source.' });
    slider({ key: 'v', label: 'Wave speed $v$', min: 0.5, max: 5, step: 0.1, value: P.v, unit: '\\mathrm{m/s}', explain: 'How fast the pattern moves along. Set by the string (its tension and mass per metre).' });
    choice({ key: 'dir', label: 'Direction', options: [[1, 'toward +x'], [-1, 'toward −x']], value: P.dir, explain: 'The sign between $kx$ and $\\omega t$: opposite signs, toward $+x$; the same sign, toward $-x$.' });
    choice({ key: 'arrows', label: 'Arrows on the beads', options: [['none', 'None'], ['velocity', 'Velocity'], ['acceleration', 'Acceleration']], value: P.arrows, explain: 'Each bead’s velocity (green) or acceleration (gold). Accelerations follow the curvature of the string.' });
  } else if (mode === 'medium') {
    slider({ key: 'FT', label: 'Tension $F_T$', min: 5, max: 200, step: 1, value: P.FT, unit: '\\mathrm{N}', explain: 'How hard the rope is pulled at its ends. A tighter rope snaps back faster.' });
    slider({ key: 'mu', label: 'Linear density $\\mu$', min: 0.1, max: 2, step: 0.05, value: P.mu, unit: '\\mathrm{kg/m}', explain: 'Mass per metre of rope. A heavier rope responds more sluggishly.' });
    choice({ key: 'drive', label: 'Hand', options: [['pulse', 'Single flicks'], ['wave', 'Keep shaking']], value: P.drive, explain: 'Send one pulse at a time, or shake the end steadily.' });
    slider({ key: 'h', label: 'Pulse height', min: 0.05, max: 0.5, step: 0.01, value: P.h, unit: '\\mathrm{m}', explain: 'How far the hand moves up in a flick.' });
    slider({ key: 'dur', label: 'Flick duration', min: 0.1, max: 1, step: 0.05, value: P.dur, unit: '\\mathrm{s}', explain: 'How long the hand takes for one up-and-down flick. A quicker flick makes a narrower pulse.' });
    slider({ key: 'fw', label: 'Shaking frequency $f$', min: 0.2, max: 4, step: 0.05, value: P.fw, unit: '\\mathrm{Hz}', explain: 'Up-and-down cycles of the hand per second.' });
    slider({ key: 'Aw', label: 'Shaking amplitude', min: 0.05, max: 0.4, step: 0.01, value: P.Aw, unit: '\\mathrm{m}', explain: 'How far the hand moves each way.' });
    if (ctl) F.toggle({ key: 'slow', label: 'Slow motion (¼ speed)', value: false, explain: 'Run the clock at a quarter of real time.' });
    else F.params.slow = false;
  } else if (mode === 'two') {
    choice({ key: 'kind', label: 'Show', options: [['pulses', 'Two pulses'], ['waves', 'Two waves']], value: P.kind, explain: 'Two pulses heading for each other, or two waves travelling the same way.' });
    slider({ key: 'h1', label: 'Left pulse height', min: -1, max: 1, step: 0.05, value: P.h1, unit: '\\mathrm{m}', explain: 'Negative: an inverted pulse.' });
    slider({ key: 'h2', label: 'Right pulse height', min: -1, max: 1, step: 0.05, value: P.h2, unit: '\\mathrm{m}', explain: 'Negative: an inverted pulse.' });
    slider({ key: 'time', label: 'Time $t$', min: 0, max: 3, step: 0.01, value: Math.min(3, P.time), unit: '\\mathrm{s}', explain: 'They start 6 m apart, each moving at 2 m/s.' });
    slider({ key: 'A1', label: 'Amplitude $A_1$', min: 0, max: 1.5, step: 0.05, value: P.A1, unit: '\\mathrm{cm}', explain: 'The first wave (blue, dashed).' });
    slider({ key: 'A2', label: 'Amplitude $A_2$', min: 0, max: 1.5, step: 0.05, value: P.A2, unit: '\\mathrm{cm}', explain: 'The second wave (orange, dashed).' });
    slider({ key: 'phase', label: 'Phase difference $\\phi$', min: 0, max: 360, step: 5, value: P.phase, unit: '^\\circ', explain: 'How far the second wave is shifted along its cycle: 360° is one whole wavelength.' });
  } else {
    if (P.show === 'drive') slider({ key: 'fd', label: 'Driving frequency $f$', min: 0, max: P.fmax, step: 0.5, value: P.fd, unit: '\\mathrm{Hz}', explain: 'How fast the left end is shaken, by a tiny amount.' });
    else slider({ key: 'n', label: 'Mode $n$', min: 1, max: 8, step: 1, value: P.n, unit: '', explain: 'The number of loops: $n$ half-wavelengths fit on the string.' });
    slider({ key: 'FT', label: 'Tension $F_T$', min: 10, max: 200, step: 1, value: P.FT, unit: '\\mathrm{N}', explain: 'Tighten the string to raise every mode’s frequency.' });
  }
  // show only the sliders that belong to the current sub-choice
  const groups = { pulse: ['h', 'dur'], wave: ['fw', 'Aw'], pulses: ['h1', 'h2', 'time'], waves: ['A1', 'A2', 'phase'] };

  let playBtn = null, actionBtn = null;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    const rate = mode === 'medium' && F.params.slow ? 0.25 : 1;
    if (mode === 'two' && F.params.kind === 'pulses') {
      let t = F.params.time + dt;
      if (t >= 3) { t = 3; S.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
      F.set('time', +t.toFixed(4));
      return;
    }
    S.t += dt * rate;
    draw();
  }, { force: true });
  if (ctl) {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => {
      if (mode === 'two' && F.params.kind === 'pulses' && F.params.time >= 3 - 1e-9) F.set('time', 0);
      S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play';
      if (S.running) anim.start();
    } });
    if (mode === 'medium') actionBtn = F.button({ label: F.params.drive === 'wave' ? 'Restart' : 'Send pulse', onClick: () => {
      if (F.params.drive === 'wave') { S.start = S.t; }
      else { S.pulses.push({ t0: S.t, h: F.params.h, dur: F.params.dur }); if (S.pulses.length > 8) S.pulses.shift(); }
      if (!S.running) { S.running = true; playBtn.textContent = 'Pause'; anim.start(); }
      draw();
    } });
  }
  // the sliders that belong to the other sub-choice are hidden
  const showGroups = () => {
    if (!ctl) return;
    const sub = mode === 'medium' ? F.params.drive : mode === 'two' ? F.params.kind : null;
    if (!sub) return;
    const hide = Object.entries(groups).filter(([g]) => g !== sub && (mode === 'medium' ? ['pulse', 'wave'] : ['pulses', 'waves']).includes(g)).flatMap(([, keys]) => keys);
    const show = groups[sub] || [];
    for (const node of F.el.querySelectorAll('.viz-controls .ctl')) {
      const key = node.dataset.key || keyOf(node);
      if (!key) continue;
      node.style.display = hide.includes(key) && !show.includes(key) ? 'none' : '';
    }
    if (actionBtn) actionBtn.textContent = F.params.drive === 'wave' ? 'Restart' : 'Send pulse';
  };
  // which parameter a control row belongs to, from its slider's aria-label
  const LABELS = { h: 'Pulse height', dur: 'Flick duration', fw: 'Shaking frequency $f$', Aw: 'Shaking amplitude', h1: 'Left pulse height', h2: 'Right pulse height', time: 'Time $t$', A1: 'Amplitude $A_1$', A2: 'Amplitude $A_2$', phase: 'Phase difference $\\phi$' };
  function keyOf(node) {
    const inp = node.querySelector('input[type=range]');
    if (!inp) return null;
    const lab = inp.getAttribute('aria-label');
    const hit = Object.entries(LABELS).find(([, l]) => l === lab);
    if (hit) node.dataset.key = hit[0];
    return hit ? hit[0] : null;
  }
  F.onChange((key) => {
    if (key === 'drive' || key === 'kind') { showGroups(); if (key === 'drive') { S.start = S.t; S.pulses = []; } }
    if (mode === 'standing' && key === 'FT') gainCurve = null;
    draw();
  });

  // ─── drawing ───────────────────────────────────────────────────────────
  const plot = new Plot(canvas, { x: [0, 10], y: [-1, 1], xlabel: 'x (m)', ylabel: '' });
  const resp = new Plot(canvas, { x: [0, 1], y: [0, 1], xlabel: 'driving frequency f (Hz)', ylabel: '' });
  let gainCurve = null;

  function frame(pl, x, y, pad) {
    pl.o.pad = pad;
    pl.resize(); pl.refreshTheme();
    pl.setView(x, y);
    pl.grid(); pl.axes();
  }
  function beads(pl, X, yfn, { n = 40, color = 'accent2', r = 3 } = {}) {
    for (let i = 0; i <= n; i++) { const x = (X * i) / n; pl.point(x, yfn(x), { color, r }); }
  }

  function draw() {
    plot.resize(); plot.refreshTheme();
    ctx.clearRect(0, 0, plot.w, plot.h);
    if (mode === 'travel') drawTravel();
    else if (mode === 'medium') drawMedium();
    else if (mode === 'two') drawTwo();
    else drawStanding();
  }

  function drawTravel() {
    const A = F.params.A, f = F.params.f, v = F.params.v, dir = +F.params.dir, X = P.view;
    const lam = v / f, w = { A, lambda: lam, f, dir }, t = S.t, om = W.TAU * f;
    plot.o.ylabel = 'y (cm)';
    frame(plot, [0, X], [-2.7, 2.7], { l: 46, r: 16, t: 26, b: 34 });
    const y = (x) => W.travelling(x, t, w);
    plot.fn(y, { color: 'accent', width: 2.2 });
    beads(plot, X, y);
    const arrows = F.params.arrows;
    if (arrows !== 'none') {
      for (let i = 0; i <= 40; i += 2) {
        const x = (X * i) / 40, y0 = y(x);
        const q = arrows === 'velocity' ? W.travellingVelocity(x, t, w) / (A * om) : W.travellingAcceleration(x, t, w) / (A * om * om);
        if (Math.abs(q) > 0.04) plot.arrow(x, y0, x, y0 + 1.3 * q, { color: arrows === 'velocity' ? 'good' : 'gold', width: 1.8, head: 7 });
      }
    }
    // one crest, followed as it moves
    const m = dir > 0 ? f * t : -f * t;
    let xc = lam * (0.25 + m);
    xc = ((xc % lam) + lam) % lam;
    if (xc <= X) plot.point(xc, A, { color: 'gold', r: 5, label: 'crest', ldy: -12 });
    if (P.tag !== null && P.tag !== undefined) {
      plot.line(P.tag, -A, P.tag, A, { color: 'bad', width: 1.2, dash: [3, 4], alpha: 0.7 });
      plot.point(P.tag, y(P.tag), { color: 'bad', r: 6 });
    }
    plot.text(dir > 0 ? 'wave travels →' : '← wave travels', dir > 0 ? plot.R - 6 : plot.L + 6, 13, { screen: true, align: dir > 0 ? 'right' : 'left', color: 'ink2', size: 12, weight: 600 });
    if (P.readout !== false) F.readout(P.ask ? [['bead’s greatest speed $A\\omega$', `${trim((A / 100) * om)}\\,\\mathrm{m/s}`]] : [
      ['wavelength $\\lambda = v/f$', `${trim(lam)}\\,\\mathrm{m}`], ['period $T = 1/f$', `${trim(1 / f)}\\,\\mathrm{s}`],
      ['$k = 2\\pi/\\lambda$', `${trim(W.TAU / lam)}\\,\\mathrm{rad/m}`], ['$\\omega = 2\\pi f$', `${trim(om)}\\,\\mathrm{rad/s}`],
      ['bead’s greatest speed $A\\omega$', `${trim((A / 100) * om)}\\,\\mathrm{m/s}`],
    ]);
  }

  function drawMedium() {
    const FT = F.params.FT, mu = F.params.mu, L = P.L, v = W.stringSpeed(FT, mu), t = S.t;
    const wave = F.params.drive === 'wave';
    const y = wave
      ? (x) => W.wavetrain(x, t - S.start, { A: F.params.Aw, f: F.params.fw, v })
      : (x) => S.pulses.reduce((s, q) => s + W.pulseRight(x, t, { h: q.h, dur: q.dur, v, t0: q.t0 }), 0);
    plot.o.ylabel = 'y (m)';
    frame(plot, [0, L], [-0.65, 0.65], { l: 46, r: 16, t: 26, b: 34 });
    plot.fn(y, { color: 'accent', width: 2.4 });
    beads(plot, L, y, { n: 50, r: 2.4 });
    // the hand at the left end
    const yh = y(0);
    plot.rect(-0.25, yh - 0.06, 0.5, 0.12, { color: 'warn', alpha: 0.9 });
    // the newest pulse's peak or the wave's front, with a stopwatch
    let note = '';
    if (wave) {
      const front = v * (t - S.start);
      if (front > 0 && front < L) { plot.line(front, -0.6, front, 0.6, { color: 'gold', width: 1.2, dash: [4, 4] }); plot.text('front', front, 0.6, { dx: 4, dy: 8, color: 'gold', size: 11.5 }); }
      note = `t = ${trim(Math.max(0, t - S.start), 2)} s since the shaking began`;
    } else if (S.pulses.length) {
      const q = S.pulses[S.pulses.length - 1], xp = v * (t - q.t0 - q.dur / 2);
      if (xp > 0 && xp < L) { plot.line(xp, -0.6, xp, 0.6, { color: 'gold', width: 1.2, dash: [4, 4] }); plot.point(xp, 0.6, { color: 'gold', r: 0.01, label: 'newest pulse', ldy: 6 }); }
      note = `t = ${trim(Math.max(0, t - q.t0), 2)} s since the newest flick began`;
    } else note = ctl ? 'Press “Send pulse”' : '';
    if (note) plot.text(note, plot.L + 6, 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
    if (P.readout !== false) F.readout([
      ['wave speed $v = \\sqrt{F_T/\\mu}$', `${trim(v)}\\,\\mathrm{m/s}`], ['time to cross 20 m', `${trim(L / v)}\\,\\mathrm{s}`],
      wave ? ['wavelength $\\lambda = v/f$', `${trim(v / F.params.fw)}\\,\\mathrm{m}`] : ['pulse width on the rope $\\approx v\\,\\Delta t$', `${trim(v * F.params.dur)}\\,\\mathrm{m}`],
    ]);
  }

  function drawTwo() {
    if (F.params.kind === 'waves') {
      const A1 = F.params.A1, A2 = F.params.A2, ph = (F.params.phase * Math.PI) / 180, t = S.t;
      const w = { lambda: 4, f: 0.5, dir: 1 };
      const y1 = (x) => W.travelling(x, t, { ...w, A: A1 }), y2 = (x) => W.travelling(x, t, { ...w, A: A2, phi: ph });
      plot.o.ylabel = 'y (cm)';
      frame(plot, [0, L2], [-3.3, 3.3], { l: 46, r: 16, t: 26, b: 34 });
      plot.fn(y1, { color: 'accent', width: 1.5, dash: [6, 5] });
      plot.fn(y2, { color: 'warn', width: 1.5, dash: [3, 4] });
      plot.fn((x) => y1(x) + y2(x), { color: 'good', width: 2.8 });
      const R = W.resultantAmplitude(A1, A2, ph);
      const kind = R > Math.max(A1, A2) + 1e-9 ? (Math.abs(Math.cos(ph) - 1) < 1e-9 ? 'fully constructive' : 'partly constructive') : R < 1e-9 ? 'complete cancellation' : 'partly destructive';
      plot.text(`sum (green): ${kind}`, plot.L + 6, 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
      if (P.readout !== false) F.readout([['amplitude of the sum', `${trim(R)}\\,\\mathrm{cm}`], ['$A_1 + A_2$', `${trim(A1 + A2)}\\,\\mathrm{cm}`], ['$|A_1 - A_2|$', `${trim(Math.abs(A1 - A2))}\\,\\mathrm{cm}`]]);
      return;
    }
    const t = F.params.time, h1 = F.params.h1, h2 = F.params.h2, wd = P.width;
    const g = (s) => (Math.abs(s) < wd / 2 ? Math.cos((Math.PI * s) / wd) ** 2 : 0);
    const y1 = (x) => h1 * g(x - 2 - V2 * t), y2 = (x) => h2 * g(x - 8 + V2 * t);
    plot.o.ylabel = 'y (m)';
    frame(plot, [0, L2], [-2.1, 2.1], { l: 46, r: 16, t: 26, b: 34 });
    plot.fn(y1, { color: 'accent', width: 1.6, dash: [6, 5] });
    plot.fn(y2, { color: 'warn', width: 1.6, dash: [3, 4] });
    const sum = (x) => y1(x) + y2(x);
    plot.fn(sum, { color: 'good', width: 2.8 });
    beads(plot, L2, sum, { n: 50, r: 2.2, color: 'good' });
    plot.text(`t = ${trim(t, 3)} s   (dashed: each pulse alone; green: the string)`, plot.L + 6, 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
    if (P.readout !== false) F.readout([['time $t$', `${trim(t, 3)}\\,\\mathrm{s}`], ['left pulse’s centre', `${trim(2 + V2 * t)}\\,\\mathrm{m}`], ['right pulse’s centre', `${trim(8 - V2 * t)}\\,\\mathrm{m}`]]);
  }

  function drawStanding() {
    const L = P.Ls, FT = F.params.FT, mu = P.mu, v = W.stringSpeed(FT, mu), f1 = W.harmonic(1, v, L);
    const ph = W.TAU * 0.8 * S.t;          // slow motion: about one cycle per 1.25 s whatever the frequency
    if (P.show !== 'drive') {
      const n = F.params.n, A = 1;
      plot.o.ylabel = 'y';
      frame(plot, [0, L], [-1.45, 1.45], { l: 46, r: 16, t: 26, b: 34 });
      const shape = (x) => A * Math.sin((n * Math.PI * x) / L);
      plot.fn(shape, { color: 'ink4', width: 1, dash: [3, 4] });
      plot.fn((x) => -shape(x), { color: 'ink4', width: 1, dash: [3, 4] });
      const y = (x) => shape(x) * Math.cos(ph);
      plot.fn(y, { color: 'accent', width: 2.6 });
      beads(plot, L, y, { n: 40, r: 2.4 });
      W.nodes(n, L).forEach((x, j) => plot.point(x, 0, { color: 'warn', r: 5, label: j === 0 && n <= 4 ? 'node' : undefined, ldy: 14 }));
      if (n <= 4) plot.text('antinode', L / (2 * n), A, { dx: 0, dy: -10, color: 'ink3', size: 11.5, align: 'center' });
      plot.text(`mode n = ${n}: ${n} half-wavelength${n > 1 ? 's' : ''} fit on the string (motion slowed down)`, plot.L + 6, 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
      if (P.readout !== false) F.readout([['wave speed $v = \\sqrt{F_T/\\mu}$', `${trim(v)}\\,\\mathrm{m/s}`], ['$\\lambda_n = 2L/n$', `${trim((2 * L) / n)}\\,\\mathrm{m}`], ['$f_n = nv/2L$', `${trim(W.harmonic(n, v, L))}\\,\\mathrm{Hz}`], ['fundamental $f_1$', `${trim(f1)}\\,\\mathrm{Hz}`]]);
      return;
    }
    // driven: the string above, its resonance curve below
    const fd = F.params.fd, gamma = W.dampingForGain(GAIN, v, L);
    const H = plot.h, split = Math.round(H * 0.55);
    plot.o.ylabel = 'y';
    frame(plot, [0, L], [-1.25, 1.25], { l: 46, r: 16, t: 24, b: H - split + 26 });
    const p = { f: fd, v, L, gamma, a: 1 / GAIN };
    const y = (x) => { const Y = W.drivenString(x, p); return Y.re * Math.cos(ph) - Y.im * Math.sin(ph); };
    plot.fn(y, { color: 'accent', width: 2.6 });
    beads(plot, L, y, { n: 40, r: 2.4 });
    plot.rect(-0.012 * L, y(0) - 0.12, 0.024 * L, 0.24, { color: 'warn', alpha: 0.9 });
    const g = W.drivenGain({ ...p, a: 1 });
    plot.text(`shaken end (orange) moves 1 unit; the string swings up to ${trim(g, 2)} units (slowed down)`, plot.L + 6, 12, { screen: true, color: 'ink2', size: 12, weight: 600 });
    // the resonance curve
    if (!gainCurve) {
      gainCurve = [];
      for (let i = 0; i <= 360; i++) { const fq = (P.fmax * i) / 360; gainCurve.push([fq, W.drivenGain({ f: fq, v, L, gamma }, 120)]); }
    }
    resp.o.pad = { l: 46, r: 16, t: split + 8, b: 34 };
    resp.resize(); resp.refreshTheme();
    resp.setView([0, P.fmax], [0, GAIN * 1.15]);
    resp.grid(); resp.axes();
    resp.text('response (string ÷ shaken end)', resp.L + 6, resp.T + 2, { screen: true, color: 'ink2', size: 11.5, baseline: 'top' });
    resp.path(gainCurve, { color: 'violet', width: 2 });
    resp.line(fd, 0, fd, GAIN * 1.15, { color: 'gold', width: 1.2, dash: [4, 4] });
    resp.point(fd, Math.min(g, GAIN * 1.12), { color: 'gold', r: 5 });
    if (P.readout !== false) F.readout([['driving frequency $f$', `${trim(fd)}\\,\\mathrm{Hz}`], ['wave speed $v$', `${trim(v)}\\,\\mathrm{m/s}`], ['response', `${trim(g, 2)}\\times`]]);
  }

  F.draw(draw);
  showGroups();
  const caps = {
    travel: 'A sinusoidal wave on an ideal string (small amplitude, no damping). The vertical scale is in centimetres and the horizontal in metres, so the wave’s height is exaggerated about 100 times. The red bead stays at its own x.',
    medium: 'An ideal rope (small amplitude, no damping), 20 m long; its far end is joined to more of the same rope, so nothing reflects. The speed comes from the rope alone: $v = \\sqrt{F_T/\\mu}$.',
    two: 'Ideal string, small amplitudes: the displacements simply add (linear superposition). Pulses move at 2 m/s; the waves have λ = 4 m and f = 0.5 Hz.',
    standing: P.show === 'drive'
      ? `A 1 m string fixed at the right, its left end shaken by a tiny amount, with light damping chosen so that every resonance reaches ${GAIN} times the shaking. μ = 5 g/m. The oscillation is drawn slowed down to about one cycle a second.`
      : 'A string fixed at both ends (μ = 5 g/m, L = 1 m) vibrating in one normal mode; dashed: its envelope. The motion is drawn slowed down to about one cycle a second, whatever the real frequency.',
  };
  F.caption(caps[mode]);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const problems = [];
  const mode = P0.mode ?? 'travel';
  if (!MODES.includes(mode)) return [`mode must be one of ${MODES.join(', ')}`];
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  const pos = (k) => { if (!(typeof P[k] === 'number' && P[k] > 0)) problems.push(`${k} must be a positive number`); };
  const inr = (k, lo, hi) => { if (!(typeof P[k] === 'number' && P[k] >= lo && P[k] <= hi)) problems.push(`${k} must lie in [${lo}, ${hi}]`); };
  if (mode === 'travel') {
    inr('A', 0.2, 2); inr('f', 0.1, 2); inr('v', 0.5, 5); pos('view');
    if (![1, -1].includes(P.dir)) problems.push('dir must be 1 or -1');
    if (!['none', 'velocity', 'acceleration'].includes(P.arrows)) problems.push('arrows must be none, velocity or acceleration');
    if (P.tag !== null && !(P.tag >= 0 && P.tag <= P.view)) problems.push('tag must lie on the string (or be null)');
  } else if (mode === 'medium') {
    inr('FT', 5, 200); inr('mu', 0.1, 2); inr('h', 0.05, 0.5); inr('dur', 0.1, 1); inr('fw', 0.2, 4); inr('Aw', 0.05, 0.4); pos('L');
    if (!['pulse', 'wave'].includes(P.drive)) problems.push('drive must be pulse or wave');
    for (const q of P.pulses || []) if (!(Number.isFinite(q.t0) && Math.abs(q.h) <= 0.6 && q.dur > 0)) problems.push('each pulse needs t0, h (|h| ≤ 0.6 m) and dur > 0');
  } else if (mode === 'two') {
    if (!['pulses', 'waves'].includes(P.kind)) problems.push('kind must be pulses or waves');
    inr('h1', -1, 1); inr('h2', -1, 1); inr('A1', 0, 1.5); inr('A2', 0, 1.5); inr('phase', 0, 360); inr('width', 0.4, 3);
    if (!(P.time >= 0 && P.time <= 3)) problems.push('time must lie in [0, 3] s');
  } else {
    pos('Ls'); inr('FT', 10, 200); pos('mu'); pos('fmax');
    if (!['mode', 'drive'].includes(P.show)) problems.push('show must be mode or drive');
    if (!(Number.isInteger(P.n) && P.n >= 1 && P.n <= 8)) problems.push('n must be a whole number from 1 to 8');
    if (!(P.fd >= 0 && P.fd <= P.fmax)) problems.push('fd must lie in [0, fmax]');
  }
  if (typeof P.controls !== 'boolean' || typeof P.play !== 'boolean') problems.push('controls and play must be true or false');
  return problems;
}
