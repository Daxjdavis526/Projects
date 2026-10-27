// The Doppler effect and the Mach cone, seen from above. A source moving to
// the right at Mach M emits a circular wavefront every period; each circle is
// centred where the source was when it emitted it. Ahead the fronts crowd
// together (higher frequency), behind they spread out (lower). At M = 1 they
// pile into a wall at the nose; above it they form a cone of half-angle
// sin θ = 1/M, dragged along behind the source — the sonic boom. A microphone
// off to the side records the pitch it hears as the source passes (graph
// below). Physics in model/wave-physics.js (tested headlessly).
//
//   { type: 'wave-doppler', params: {
//       M: 0.5,              // Mach number of the source, 0–2.5
//       f: 500,              // source frequency (Hz), for the readouts
//       T: 20,               // air temperature (°C), which sets the speed of sound
//       controls: true,      // false: no sliders or buttons (a problem's picture)
//       play: true,          // animate (unless reduced motion is on; Play then starts it)
//       time: 0.62,          // a static picture: where the source is, as a fraction of its crossing (0–1)
//       trace: true,         // the graph of the pitch heard by the side microphone
//       mics: true,          // draw the microphones
//       ask: false,          // hide the frequencies and the cone angle (labels and readout)
//       readout: true,
//   } }

import { Plot } from '../plot.js';
import * as W from '../model/wave-physics.js';

export const defaults = { M: 0.5, f: 500, T: 20, controls: true, play: true, time: 0.62, trace: true, mics: true, ask: false, readout: true };
const X = 10, Y = 4.2;                    // half-width and half-height of the view (display units)
const CD = 4;                             // display speed of sound, units per (display) second
const LAM0 = 1.6;                         // wavelength of the source at rest, display units
const TD = LAM0 / CD;                     // emission period, display seconds
const MIC = [3, 2.6];                     // the side microphone
const trim = (x, n = 3) => String(+(+x).toPrecision(n));

export async function mount(F, P) {
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const ctl = P.controls !== false;
  const { canvas } = F.canvas({ aspect: P.trace ? '' : 'wide', label: P.alt || 'Wavefronts from a moving source, seen from above' });
  const ctx = canvas.getContext('2d');
  if (ctl) {
    F.slider({ key: 'M', label: 'Source speed, Mach $M$', min: 0, max: 2.5, step: 0.01, value: P.M, unit: '', explain: 'The source’s speed divided by the speed of sound. Above 1 it outruns its own sound.' });
    F.slider({ key: 'f', label: 'Source frequency $f_s$', min: 100, max: 1000, step: 10, value: P.f, unit: '\\mathrm{Hz}', explain: 'The frequency the source emits, as heard by someone moving with it.' });
  } else { F.params.M = P.M; F.params.f = P.f; }
  F.params.T = P.T;

  // the source crosses from x = −1.15X to +1.15X; a stationary source sits at x = 0
  const x0 = -1.15 * X;
  const crossing = () => (F.params.M > 0.02 ? (2.3 * X) / (F.params.M * CD) : 12);
  const S = { t: (P.time ?? 0.62) * crossing(), running: !!P.play && !reduced && ctl };
  const srcX = (t) => (F.params.M > 0.02 ? x0 + F.params.M * CD * t : 0);
  let playBtn = null;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    S.t += dt;
    if (S.t > crossing() + 1.5) S.t = 0;
    draw();
  }, { force: true });
  if (ctl) {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => {
      S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play';
      if (S.running) anim.start();
    } });
    F.button({ label: 'Restart', onClick: () => { S.t = 0; draw(); } });
  }
  F.onChange((key) => { if (key === 'M') S.t = Math.min(S.t, crossing()); draw(); });

  const view = new Plot(canvas, { x: [-X, X], y: [-Y, Y], equal: true, grid: false, axes: false });
  const graph = new Plot(canvas, { x: [0, 1], y: [0, 2], xlabel: 'time (as the source passes)', ylabel: '' });

  function draw() {
    view.resize(); view.refreshTheme(); graph.resize(); graph.refreshTheme();
    const H = view.h, Wd = view.w, split = P.trace ? Math.round(H * 0.66) : H;
    ctx.clearRect(0, 0, Wd, H);
    const M = F.params.M, f = F.params.f, v = W.soundSpeedAir(F.params.T), t = S.t;
    view.o.pad = { l: 8, r: 8, t: 8, b: H - split + 8 };
    view.setView([-X, X], [-Y, Y]);
    ctx.save();
    view._clip();                                  // circles and the cone stay inside the top panel
    // the track
    view.line(-X * 1.2, 0, X * 1.2, 0, { color: 'ink4', width: 1, dash: [4, 6] });
    // wavefronts: emitted at te = k·TD, centred on the source's position then
    const xs = srcX(t);
    const kmin = Math.max(0, Math.floor((t - 2.6 * X / CD) / TD));
    for (let k = kmin; k * TD <= t; k++) {
      const te = k * TD, r = CD * (t - te);
      if (r < 0.02) continue;
      const cx = srcX(te);
      view.circle(cx, 0, r, { color: 'accent', width: 1.4, alpha: Math.max(0.25, 1 - r / (2.6 * X)) });
    }
    // the Mach cone
    if (M > 1.0005) {
      const th = W.machAngle(M), len = 2.4 * X;
      view.line(xs, 0, xs - len * Math.cos(th), len * Math.sin(th), { color: 'bad', width: 2.4 });
      view.line(xs, 0, xs - len * Math.cos(th), -len * Math.sin(th), { color: 'bad', width: 2.4 });
      const lx = Math.max(-X + 3, xs - 3), ly = Math.max(-Y + 0.5, -(xs - lx) * Math.tan(th) - 0.7);
      if (!P.ask) view.text(`Mach cone: θ = ${trim((th * 180) / Math.PI, 3)}°`, lx, ly, { color: 'bad', size: 12, weight: 650, align: 'center' });
      // the half-angle marker
      view.curve((a) => xs - 1.6 * Math.cos(a), (a) => 1.6 * Math.sin(a), 0, th, { color: 'gold', width: 1.6 });
      view.text('θ', xs - 2.05 * Math.cos(th / 2), 2.05 * Math.sin(th / 2), { color: 'gold', size: 13, weight: 700, align: 'center' });
    } else if (M >= 0.995) {
      view.line(xs, -Y, xs, Y, { color: 'bad', width: 2.4 });
    }
    ctx.restore();
    // the source and its velocity
    view.point(xs, 0, { color: 'warn', r: 7 });
    if (M > 0.02) view.arrow(xs + 0.35, 0, xs + 0.35 + 0.9 + 0.5 * M, 0, { color: 'warn', width: 2.2, head: 9 });
    // microphones
    if (P.mics) {
      view.point(MIC[0], MIC[1], { color: 'good', r: 5, label: 'side microphone', ldy: -12 });
    }
    // the heard pitch at the side microphone, over the whole pass
    if (P.trace) {
      graph.o.pad = { l: 46, r: 16, t: split + 14, b: 34 };
      graph.o.xfmt = () => '';
      const T = crossing(), fmax = M < 1 ? Math.min(f / (1 - Math.min(M, 0.92)), 5 * f) : 5 * f;
      graph.setView([0, T], [0, Math.max(2.2 * f, fmax * 1.12)]);
      graph.grid(); graph.axes();
      if (M < 0.98) {
        const pts = [];
        for (let i = 0; i <= 300; i++) {
          const tt = (T * i) / 300, r = heard(tt, M);
          pts.push([tt, r === null ? NaN : r * f]);
        }
        graph.path(pts, { color: 'good', width: 2.2 });
        graph.line(0, f, T, f, { color: 'ink3', width: 1.2, dash: [5, 5] });
        graph.text(P.ask ? 'source frequency' : `source: ${trim(f)} Hz`, graph.R - 4, graph.Y(f) - 9, { screen: true, align: 'right', color: 'ink3', size: 11.5 });
        const now = heard(Math.min(t, T), M);
        if (now !== null) graph.point(Math.min(t, T), now * f, { color: 'good', r: 5 });
        graph.text('pitch heard by the side microphone (Hz)', graph.L + 6, graph.T + 2, { screen: true, color: 'good', size: 11.5, weight: 650, baseline: 'top' });
      } else {
        graph.text('Near Mach 1 and above, the microphone hears nothing until the shock sweeps over it — then a sudden boom.', graph.L + 6, graph.T + 16, { screen: true, color: 'ink2', size: 12, weight: 600, baseline: 'top' });
        const tb = boomTime(M);
        if (tb !== null && tb <= T) { graph.line(tb, 0, tb, graph.vy1, { color: 'bad', width: 2.4 }); graph.text('boom', tb, graph.vy1, { dx: 6, dy: 14, color: 'bad', size: 12, weight: 700 }); }
        graph.line(Math.min(t, T), 0, Math.min(t, T), graph.vy1, { color: 'ink3', width: 1, dash: [3, 4] });
      }
    }
    if (P.readout !== false) {
      const rows = [['Mach $M$', trim(M)], ['source speed $u = Mv$', `${trim(M * v)}\\,\\mathrm{m/s}`]];
      if (!P.ask) {
        if (M < 1) rows.push(['heard straight ahead $f_s/(1 - M)$', `${trim(f / (1 - M))}\\,\\mathrm{Hz}`], ['heard straight behind $f_s/(1 + M)$', `${trim(f / (1 + M))}\\,\\mathrm{Hz}`]);
        else rows.push(['heard ahead', '\\text{nothing until the boom}'], ['cone half-angle $\\theta$', M > 1 ? `${trim((W.machAngle(M) * 180) / Math.PI)}^\\circ` : '90^\\circ']);
      }
      rows.push(['speed of sound $v$', `${trim(v)}\\,\\mathrm{m/s}`]);
      F.readout(rows);
    }
  }

  // ratio heard/emitted at the side microphone at display time tt (null: nothing has arrived yet)
  function heard(tt, M) {
    if (M <= 0.02) return 1;
    // shift time so the source passes x = 0 at t = 0, as the model expects
    const tPass = -x0 / (M * CD);
    const r = W.heardFrequency(MIC[0], MIC[1], tt - tPass, { M, v: CD, f: 1 / TD });
    if (r === null || !Number.isFinite(r)) return null;
    // the model starts emitting at t = −∞; our source starts at x0: nothing arrives before its first front does
    const first = Math.hypot(MIC[0] - x0, MIC[1]) / CD;
    return tt < first ? null : r * TD;
  }
  // when the cone reaches the side microphone (display time), for M > 1
  function boomTime(M) {
    if (M <= 1) return null;
    const th = W.machAngle(M);
    // the cone's edge passes a point at height y when the source is y / tan θ beyond it
    const xsAt = MIC[0] + MIC[1] / Math.tan(th);
    return (xsAt - x0) / (M * CD);
  }

  F.draw(draw);
  F.caption(`Seen from above, in still air with one speed of sound everywhere (${trim(W.soundSpeedAir(P.T))} m/s). Distances and times are scaled for the picture: the wavelengths are drawn far longer, and the motion far slower, than for real sound. The pitches are computed for the chosen source frequency.`);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!(P.M >= 0 && P.M <= 2.5)) problems.push('M must lie in [0, 2.5]');
  if (!(P.f >= 100 && P.f <= 1000)) problems.push('f must lie in [100, 1000] Hz');
  if (!(P.T >= -60 && P.T <= 40)) problems.push('T must lie in [−60, 40] °C');
  if (!(P.time >= 0 && P.time <= 1)) problems.push('time must lie in [0, 1]');
  for (const k of ['controls', 'play', 'trace', 'mics', 'ask', 'readout']) if (typeof P[k] !== 'boolean') problems.push(`${k} must be true or false`);
  return problems;
}
