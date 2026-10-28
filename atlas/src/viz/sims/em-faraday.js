// Electromagnetic induction, live: a changing magnetic flux and the emf it
// induces, ε = −dΦ/dt, with the flux and the emf (or current, or speed)
// graphed against time beneath the picture and a cursor at the present
// moment. Five set-ups (the physics is model/em-faraday.js, tested in
// test/em-faraday.test.mjs):
//
//   slide        a rectangular loop crossing a region of uniform field at a
//                steady speed: flux in, emf only while an edge is crossing;
//   magnet       a bar magnet pushed into a coil and pulled out, moved through
//                at a steady speed, or dropped through it, with a centre-zero
//                meter on the coil;
//   ramp         a field in a circular region (a long solenoid end on) ramped
//                up and down: the induced electric field E circling it, inside
//                and outside, with a conducting ring — or no ring at all;
//   rails        a bar sliding on rails through a field, closed by a
//                resistor: pushed at a steady speed, coasting, or pulled by a
//                steady force to its terminal speed;
//   transformer  an iron core with two windings on an AC (or DC) source.
//
//   { type: 'em-faraday', params: {
//       mode: 'slide',
//       // slide:  B (T), dir: 'in' | 'out', Lf (m, the region's length), w, h (m, the loop), v (m/s), R (Ω), x0 (m)
//       // magnet: m (A m²), ml (m, its length), a (m, coil radius), N, Lc (m, coil length), R (Ω, circuit),
//       //         motion: 'inout' | 'const' | 'drop', z0 (m, start), zs (m, where 'inout' stops), T1, T2 (s), v (m/s, 'const'),
//       //         pole: 'N' | 'S' (the end that meets the coil first), poles: false (label the coil's own N and S), meter: true
//       // ramp:   B0 (T), dir, Rf (m, the field's radius), r (m, the ring), ring: true, R (Ω, the ring), path: true (with no ring, draw the circle of radius r),
//       //         profile: 'trapezoid' | 'sine', tr (s, each ramp), f (Hz, sine)
//       // rails:  B, dir, L (m, rail spacing), len (m, rail length), R (Ω), mass (kg), x0 (m),
//       //         motion: 'push' | 'coast' | 'pull', v (m/s: push or launch speed), Fa (N, the pull)
//       // transformer: Np, Ns, Vp (V rms), f (Hz), RL (Ω), source: 'ac' | 'dc', tau (s, DC switch-on)
//       sliders: ['B', 'v', 't', …],                 // built-in sliders — slide: B v w h R t · magnet: v T1 N m R t ·
//                                                    // ramp: B0 tr f r R t · rails: B v L R mass Fa t · transformer: Np Ns Vp f RL t
//                                                    // (or objects { key, … } overriding a built-in's label, range or value)
//       dirChoice, motionChoice, poleChoice, ringToggle, sourceChoice,   // offer those choices
//       motions: ['inout', 'const'],                 // with motionChoice, which motions to offer (default: all)
//       graphs: ['flux', 'emf'],                     // slide: flux emf I F · magnet: flux emf I · ramp: B emf E ·
//                                                    // rails: v x emf I F · transformer: vp vs flux is ip — [] for none
//       readouts: [...],                             // slide: flux emf I F P emax · magnet: flux emf I v · ramp: B dB E emf I ·
//                                                    // rails: flux emf I F P v vt tau · transformer: Vs Is Ip P ratio phi
//       arrows: [...],                               // slide: v I F · magnet: v I · ramp: E I · rails: v I F Fapp · transformer: flux
//       play: true, t: null,                         // animate; or a still at time t (s) — play: false with no t picks
//                                                    // a telling moment (loop half in, magnet's biggest emf, mid-ramp…)
//       playSeconds: 6, unit: 'cm', labels: true } }
//
// The animation runs in real time when a run lasts 1.5–12 s; otherwise it is
// slowed or sped up to last about playSeconds, and the caption says so — the
// graphs and readouts always use the true times. In a problem's (compact)
// picture the graphs appear only if `graphs` is given. Graphs take the flux
// as positive (the loop's normal along the field), so the emf is negative
// while the flux grows. A picture must not show its answer: leave the
// asked-for quantity out of readouts and graphs.

import { Plot } from '../plot.js';
import * as M from '../model/em-faraday.js';

const MODES = ['slide', 'magnet', 'ramp', 'rails', 'transformer'];
const UNIT = { m: 1, cm: 100, mm: 1000 };
const MODE_DEFAULTS = {
  slide: { B: 0.5, dir: 'in', Lf: 0.1, w: 0.04, h: 0.03, v: 0.05, R: 0.5, x0: -0.02, graphs: ['flux', 'emf'], readouts: ['flux', 'emf', 'I'], arrows: ['v', 'I', 'F'] },
  magnet: { m: 1.5, ml: 0.05, a: 0.025, N: 200, Lc: 0.03, R: 20, motion: 'inout', z0: 0.12, zs: 0, T1: 0.4, T2: 1.2, v: 1, pole: 'N', poles: false, meter: true, graphs: ['flux', 'emf'], readouts: ['emf'], arrows: ['v', 'I'] },
  ramp: { B0: 0.4, dir: 'in', Rf: 0.05, r: 0.03, ring: true, R: 0.02, profile: 'trapezoid', tr: 1, f: 0.5, graphs: ['B', 'emf'], readouts: ['dB', 'E', 'emf'], arrows: ['E', 'I'] },
  rails: { B: 0.5, dir: 'in', L: 0.2, len: 1, R: 0.5, mass: 0.05, x0: 0.1, motion: 'push', v: 0.5, Fa: 0.01, graphs: ['v', 'I'], readouts: ['emf', 'I', 'F'], arrows: ['v', 'I', 'F', 'Fapp'] },
  transformer: { Np: 400, Ns: 20, Vp: 230, f: 50, RL: 4, source: 'ac', tau: 0.004, graphs: ['vp', 'vs'], readouts: ['Vs', 'Is', 'Ip'], arrows: ['flux'] },
};
const GRAPHS = { slide: ['flux', 'emf', 'I', 'F'], magnet: ['flux', 'emf', 'I'], ramp: ['B', 'emf', 'E'], rails: ['v', 'x', 'emf', 'I', 'F'], transformer: ['vp', 'vs', 'flux', 'is', 'ip'] };
const READOUTS = { slide: ['flux', 'emf', 'I', 'F', 'P', 'emax'], magnet: ['flux', 'emf', 'I', 'v'], ramp: ['B', 'dB', 'E', 'emf', 'I'], rails: ['flux', 'emf', 'I', 'F', 'P', 'v', 'vt', 'tau'], transformer: ['Vs', 'Is', 'Ip', 'P', 'ratio', 'phi'] };
const ARROWS = { slide: ['v', 'I', 'F'], magnet: ['v', 'I'], ramp: ['E', 'I'], rails: ['v', 'I', 'F', 'Fapp'], transformer: ['flux'] };
const SLIDERS = { slide: ['B', 'v', 'w', 'h', 'R', 't'], magnet: ['v', 'T1', 'N', 'm', 'R', 't'], ramp: ['B0', 'tr', 'f', 'r', 'R', 't'], rails: ['B', 'v', 'L', 'R', 'mass', 'Fa', 't'], transformer: ['Np', 'Ns', 'Vp', 'f', 'RL', 't'] };
const MOTIONS = { magnet: [['inout', 'In, hold, out'], ['const', 'Steady speed'], ['drop', 'Dropped']], rails: [['push', 'Pushed'], ['coast', 'Coasting'], ['pull', 'Pulled']] };

export const defaults = {
  mode: 'slide', sliders: [], play: true, t: null, playSeconds: 6, unit: 'cm', labels: true,
  dirChoice: false, motionChoice: false, poleChoice: false, ringToggle: false, sourceChoice: false,
};

// ─── numbers ────────────────────────────────────────────────────────────────
const PREF = [[1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, '\\mu '], [1e-9, 'n']];
const PREF_TXT = { k: 'k', '': '', m: 'm', '\\mu ': 'μ', n: 'n' };
function prefixFor(maxAbs, unit) {
  if (unit === 'm/s' || unit === 'T' || unit === 'm') { const [f, p] = maxAbs < 0.1 && unit !== 'm/s' ? (unit === 'm' ? [1e-2, 'c'] : [1e-3, 'm']) : [1, '']; return { f, p }; }
  const [f, p] = PREF.find(([f]) => maxAbs >= f * 0.9995) || PREF[PREF.length - 1];
  return { f, p };
}
/** A value with a sensible SI prefix, as TeX. */
function qty(v, unit, n = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (Math.abs(v) < 1e-15) return `0\\ \\mathrm{${unit}}`;
  const { f, p } = prefixFor(Math.abs(v), unit);
  return `${+(v / f).toPrecision(n)}\\ \\mathrm{${p}${unit}}`;
}
const fmtNum = (v, n = 3) => String(+v.toPrecision(n));

// ─── built-in sliders: values in display units, with the conversion to SI ───
function sliderSpec(s, P, mode, U, ut, tEnd) {
  const key = typeof s === 'string' ? s : s.key;
  const L = (k) => (P[k] ?? 0) * U;   // a length in display units
  const base = {
    B: { label: 'Field $B$', min: 0.05, max: 1, step: 0.05, value: P.B, unit: '\\mathrm{T}', si: 1, explain: 'The strength of the uniform field.' },
    B0: { label: 'Field $B_0$', min: 0.05, max: 1, step: 0.05, value: P.B0, unit: '\\mathrm{T}', si: 1, explain: 'The field the ramp reaches (or the sine wave’s amplitude).' },
    v: mode === 'slide'
      ? { label: 'Speed $v$', min: 1, max: 20, step: 1, value: P.v * 100, unit: '\\mathrm{cm/s}', si: 0.01, explain: 'Faster: the flux changes faster, so the emf is bigger — for a shorter time.' }
      : mode === 'magnet'
        ? { label: 'Speed $v$', min: 0.2, max: 3, step: 0.1, value: Math.abs(P.v), unit: '\\mathrm{m/s}', si: 1, explain: 'The magnet’s speed through the coil.' }
        : { label: 'Speed $v$', min: 0.1, max: 2, step: 0.1, value: P.v, unit: '\\mathrm{m/s}', si: 1, explain: P.motionChoice ? 'Pushed: its steady speed. Coasting: its speed when let go.' : P.motion === 'coast' ? 'The bar’s speed when it is let go.' : 'The bar is pushed at this steady speed.' },
    w: { label: 'Loop width $w$', min: 1, max: 15, step: 0.5, value: L('w'), unit: `\\mathrm{${ut}}`, si: 1 / U, explain: 'Along the direction of motion.' },
    h: { label: 'Loop height $h$', min: 1, max: 8, step: 0.5, value: L('h'), unit: `\\mathrm{${ut}}`, si: 1 / U, explain: 'The length of the edge that crosses into the field.' },
    R: { label: mode === 'ramp' ? 'Ring’s resistance $R$' : 'Resistance $R$', min: mode === 'ramp' ? 0.005 : mode === 'magnet' ? 2 : 0.1, max: mode === 'ramp' ? 0.2 : mode === 'magnet' ? 100 : 5, step: mode === 'ramp' ? 0.005 : mode === 'magnet' ? 1 : 0.1, value: P.R, unit: '\\Omega', si: 1, explain: 'The current is the emf divided by the resistance.' },
    N: { label: 'Turns $N$', min: 10, max: 500, step: 10, value: P.N, unit: '', si: 1, explain: 'Each turn adds its own emf.' },
    T1: { label: 'Time to push it in', min: 0.1, max: 1, step: 0.05, value: P.T1, unit: '\\mathrm{s}', si: 1, explain: 'The same change of flux, made quickly or slowly.' },
    m: { label: 'Magnet’s strength $m$', min: 0.2, max: 5, step: 0.1, value: P.m, unit: '\\mathrm{A\\,m^2}', si: 1, explain: 'Its magnetic moment: a stronger magnet carries more flux.' },
    tr: { label: 'Ramp time', min: 0.2, max: 3, step: 0.1, value: P.tr, unit: '\\mathrm{s}', si: 1, explain: 'How long each ramp of the field takes: a quicker ramp, a bigger dB/dt.' },
    f: mode === 'transformer'
      ? { label: 'Frequency $f$', min: 10, max: 400, step: 10, value: P.f, unit: '\\mathrm{Hz}', si: 1, explain: 'The supply’s frequency.' }
      : { label: 'Frequency $f$', min: 0.1, max: 2, step: 0.1, value: P.f, unit: '\\mathrm{Hz}', si: 1, explain: 'How often the field swings back and forth.' },
    r: { label: 'Ring radius $r$', min: 0.5, max: Math.round(2.4 * L('Rf') * 2) / 2, step: 0.5, value: L('r'), unit: `\\mathrm{${ut}}`, si: 1 / U, explain: 'Inside the field region the flux grows as r²; outside, it is all the flux there is.' },
    L: { label: 'Rail spacing $L$', min: 5, max: 40, step: 1, value: L('L'), unit: `\\mathrm{${ut}}`, si: 1 / U, explain: 'The length of the bar between the rails.' },
    mass: { label: 'Bar’s mass $m$', min: 0.01, max: 0.5, step: 0.01, value: P.mass, unit: '\\mathrm{kg}', si: 1, explain: 'A heavier bar takes longer to speed up or slow down.' },
    Fa: { label: 'Pulling force $F$', min: 0.002, max: 0.05, step: 0.002, value: P.Fa, unit: '\\mathrm{N}', si: 1, explain: 'A steady pull on the bar.' },
    Np: { label: 'Primary turns $N_p$', min: 10, max: 1000, step: 10, value: P.Np, unit: '', si: 1, explain: 'Turns on the winding fed by the supply.' },
    Ns: { label: 'Secondary turns $N_s$', min: 5, max: 1000, step: 5, value: P.Ns, unit: '', si: 1, explain: 'Turns on the winding that feeds the load.' },
    Vp: { label: 'Supply voltage $V_p$', min: 1, max: 400, step: 1, value: P.Vp, unit: '\\mathrm{V}', si: 1, explain: 'rms voltage across the primary.' },
    RL: { label: 'Load $R_L$', min: 1, max: 100, step: 1, value: P.RL, unit: '\\Omega', si: 1, explain: 'The resistance the secondary feeds.' },
    t: { label: 'Time $t$', min: 0, max: +tEnd.toPrecision(3), step: +(tEnd / 200).toPrecision(2), value: Math.min(P.t ?? 0, +tEnd.toPrecision(3)), unit: '\\mathrm{s}', si: 1, explain: 'Scrub through the run.' },
  }[key] || {};
  return typeof s === 'string' ? { ...base, key } : { ...base, ...s };
}

// ─── drawing helpers ────────────────────────────────────────────────────────
/** × (into the page) or • (out of it) on a grid over a box, in the field's colour. */
function fieldMarks(plot, x0, x1, y0, y1, step, sign, alpha, skip = () => false) {
  const g = plot.ctx, col = plot.color('teal');
  const nx = Math.max(1, Math.round((x1 - x0) / step)), ny = Math.max(1, Math.round((y1 - y0) / step));
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.globalAlpha = alpha; g.lineWidth = 1.3;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = x0 + ((i + 0.5) * (x1 - x0)) / nx, y = y0 + ((j + 0.5) * (y1 - y0)) / ny;
    if (skip(x, y)) continue;
    const X = plot.X(x), Y = plot.Y(y);
    g.beginPath();
    if (sign < 0) { g.moveTo(X - 3.2, Y - 3.2); g.lineTo(X + 3.2, Y + 3.2); g.moveTo(X - 3.2, Y + 3.2); g.lineTo(X + 3.2, Y - 3.2); g.stroke(); }
    else { g.arc(X, Y, 2.1, 0, M.TAU); g.fill(); }
  }
  g.restore();
}
/** A zigzag resistor from (x0, y0) to (x1, y1). */
function resistor(plot, x0, y0, x1, y1, o = {}) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const lead = 0.28 * len, amp = 0.09 * len, n = 6, pts = [[x0, y0], [x0 + ux * lead, y0 + uy * lead]];
  for (let k = 0; k < n; k++) { const s = lead + ((len - 2 * lead) * (k + 0.5)) / n, side = k % 2 ? -1 : 1; pts.push([x0 + ux * s + nx * amp * side, y0 + uy * s + ny * amp * side]); }
  pts.push([x1 - ux * lead, y1 - uy * lead], [x1, y1]);
  plot.path(pts, { color: o.color || 'ink2', width: o.width || 2 });
}
/** A centre-zero meter at a world point; the needle swings by frac (−1…1) of full scale. */
function meter(plot, x, y, frac, label = '') {
  const g = plot.ctx, X = plot.X(x), Y = plot.Y(y), R = 26;
  g.save();
  g.fillStyle = plot.color('panel'); g.strokeStyle = plot.color('ink3'); g.lineWidth = 1.5;
  g.beginPath(); g.roundRect ? g.roundRect(X - R - 8, Y - R - 6, 2 * R + 16, R + 18, 6) : g.rect(X - R - 8, Y - R - 6, 2 * R + 16, R + 18); g.fill(); g.stroke();
  g.strokeStyle = plot.color('ink3'); g.lineWidth = 1.2;
  g.beginPath(); g.arc(X, Y + 6, R, -Math.PI / 2 - 1.0, -Math.PI / 2 + 1.0); g.stroke();
  for (const k of [-1, -0.5, 0, 0.5, 1]) { const a = k * 1.0; g.beginPath(); g.moveTo(X + R * Math.sin(a), Y + 6 - R * Math.cos(a)); g.lineTo(X + (R - (k === 0 ? 7 : 4)) * Math.sin(a), Y + 6 - (R - (k === 0 ? 7 : 4)) * Math.cos(a)); g.stroke(); }
  const a = Math.max(-1.1, Math.min(1.1, frac)) * 1.0;
  g.strokeStyle = plot.color('bad'); g.lineWidth = 2;
  g.beginPath(); g.moveTo(X, Y + 6); g.lineTo(X + (R - 2) * Math.sin(a), Y + 6 - (R - 2) * Math.cos(a)); g.stroke();
  g.fillStyle = plot.color('ink2'); g.beginPath(); g.arc(X, Y + 6, 2.5, 0, M.TAU); g.fill();
  if (label) { g.font = '600 10px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(label, X, Y + 1); }
  g.restore();
  return { left: [plot.ix(X - R + 2), plot.iy(Y - R - 6)], right: [plot.ix(X + R - 2), plot.iy(Y - R - 6)] };
}

export async function mount(F, P0) {
  const mode = MODES.includes(P0.mode) ? P0.mode : 'slide';
  const P = { ...MODE_DEFAULTS[mode], ...P0 };
  const compact = !!F.compact, U = UNIT[P.unit] ?? 100, ut = P.unit in UNIT ? P.unit : 'cm';
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }

  // choices
  if (P.dirChoice && ['slide', 'ramp', 'rails'].includes(mode)) F.choice({ key: 'dir', label: 'Field', options: [['in', 'into the page'], ['out', 'out of the page']], value: P.dir });
  if (P.motionChoice && MOTIONS[mode]) F.choice({ key: 'motion', label: mode === 'magnet' ? 'The magnet is' : 'The bar is', options: MOTIONS[mode].filter(([k]) => !P.motions || P.motions.includes(k)), value: P.motion, explain: mode === 'rails' ? 'Pushed at a steady speed, launched and left to coast, or pulled by a steady force.' : '' });
  if (P.poleChoice && mode === 'magnet') F.choice({ key: 'pole', label: 'The end that meets the coil first', options: [['N', 'north pole'], ['S', 'south pole']], value: P.pole });
  if (P.ringToggle && mode === 'ramp') F.toggle({ key: 'ring', label: 'A conducting ring there', value: !!P.ring, explain: 'Take the ring away: the electric field is still there. The ring only gives it charges to push round.' });
  if (P.sourceChoice && mode === 'transformer') F.choice({ key: 'source', label: 'Supply', options: [['ac', 'AC'], ['dc', 'DC, switched on at t = 0']], value: P.source });

  const specs = {};
  // the t slider spans the run as the parameters start
  const tEnd0 = duration(P);
  for (const s of P.sliders || []) { const o = sliderSpec(s, P, mode, U, ut, tEnd0); specs[o.key] = o; F.slider(o); }
  /** The model's parameters now, in SI units. */
  function params() {
    const q = { ...P };
    for (const k of ['dir', 'motion', 'pole', 'ring', 'source']) if (F.params[k] !== undefined) q[k] = F.params[k];
    for (const [k, o] of Object.entries(specs)) if (k !== 't') q[k] = +F.params[k] * (o.si ?? 1);
    if (specs.T1) q.T2 = q.T1 + (P.T2 - P.T1);      // the hold keeps its length
    return q;
  }

  // canvases
  const vertical = mode === 'magnet' && P.motion === 'drop';
  const { canvas } = F.canvas({ aspect: P.aspect ?? (vertical ? '' : 'wide'), label: P.alt || ALT[mode] });
  // graphs: in a problem's (compact) picture only when the author asks for them
  const gkeys = compact && !P0.graphs ? [] : (P.graphs || []).filter((k) => GRAPHS[mode].includes(k));
  const gcan = gkeys.map((k) => F.canvas({ height: compact ? '96px' : '112px', label: `${k} against time` }));
  const plot = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const gplots = gcan.map((c) => new Plot(c.canvas, { x: [0, 1], y: [-1, 1], xlabel: 't', ylabel: '', pad: { l: 58, r: 14, t: 10, b: 30 }, yticks: 3 }));

  // time
  const S = { t: P.t ?? 0, hold: 0, running: P.play !== false && P.t === null && !reduced };
  let playBtn = null;
  if (P.play !== false && !compact) {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) { if (S.t >= duration(params()) - 1e-9) S.t = 0; anim?.start?.(); } } });
    F.button({ label: 'Restart', onClick: () => { S.t = 0; S.hold = 0; if (specs.t) F.set('t', 0); else draw(); } });
  }
  const anim = P.play === false ? null : F.animate((dt) => {
    if (!S.running) return;
    const q = params(), T = duration(q), rate = rateOf(T, P.playSeconds);
    if (S.t >= T) { S.hold += dt; if (S.hold < 0.9) return; S.t = 0; S.hold = 0; }
    else S.t = Math.min(T, S.t + dt * rate);
    if (specs.t) F.set('t', +S.t.toPrecision(4)); else draw();
  }, { force: true });
  F.onChange((key) => { if (key === 't') S.t = +F.params.t; draw(); });

  function draw() {
    const q = params(), T = duration(q);
    if (P.play === false && P.t === null) S.t = stillTime(q, T);    // a still: the moment that shows the most
    if (S.t > T) S.t = T;
    const st = stateAt(q, S.t);
    plot.refreshTheme?.();
    SCENES[mode](plot, q, st, S.t, T, { U, ut, labels: P.labels, arrows: P.arrows || [], vertical: mode === 'magnet' && q.motion === 'drop', compact, rMax: specs.r ? specs.r.max * specs.r.si : 0 });
    gkeys.forEach((k, i) => drawGraph(gplots[i], mode, k, q, T, S.t));
    F.readout(readoutRows(mode, P.readouts || [], q, st, T));
  }

  F.draw(draw);
  const T0 = duration(params()), r0 = rateOf(T0, P.playSeconds);
  F.caption(P.caption || `${CAPTION[mode](gkeys)}${P.play !== false && Math.abs(r0 - 1) > 1e-9 ? ` The animation runs ${r0 < 1 ? `${fmtNum(1 / r0, 2)} times slower` : `${fmtNum(r0, 2)} times faster`} than real time; the graphs and readouts use the true times.` : ''}`);
  return { get: (k) => (k === 't' ? S.t : F.params[k]) };
}

const rateOf = (T, play = 6) => (T >= 1.5 && T <= 12 ? 1 : T / play);
/** For a still picture with no time given: the loop half in, the magnet at its strongest emf going in, mid-ramp, mid-run, a quarter cycle. */
function stillTime(q, T) {
  switch (q.mode) {
    case 'slide': return Math.min(T, Math.max(0, (q.w / 2 - q.x0) / q.v));
    case 'magnet': { let best = 0, bt = 0; for (let i = 0; i <= 200; i++) { const t = (0.5 * T * i) / 200, e = Math.abs(magnetState(q, t).emf); if (e > best) { best = e; bt = t; } } return bt; }
    case 'ramp': return q.profile === 'sine' ? 0 : q.tr;
    case 'transformer': return q.source === 'dc' ? 0.5 * q.tau : 1 / (4 * q.f);
    default: return T / 2;
  }
}
const ALT = {
  slide: 'A rectangular loop crossing a region of magnetic field',
  magnet: 'A bar magnet moving along the axis of a coil connected to a meter',
  ramp: 'A changing magnetic field in a circular region and the electric field it induces',
  rails: 'A bar sliding on two rails in a magnetic field, closed by a resistor',
  transformer: 'A transformer: two windings on an iron core',
};
const CAPTION = {
  slide: (g) => `Top view. The field (teal ×: into the page; •: out of it) fills the shaded region and nothing outside it; the loop’s flux is the field times the part of the loop inside (tinted). Blue arrows: the induced current; violet: the magnetic force on the loop, which always opposes the motion.${g.includes('emf') ? ' The graphs take the flux as positive and the emf as negative while that flux grows: ε = −dΦ/dt.' : ''}`,
  magnet: (g) => `Side view, the coil cut away along its axis to show the magnet inside. The magnet’s field is that of a uniformly magnetised bar.${g.includes('flux') && g.includes('emf') ? ' The graphs give the flux linkage NΦ through the coil’s turns and the emf ε = −d(NΦ)/dt.' : g.includes('flux') ? ' The graph gives the flux linkage NΦ through the coil’s turns.' : g.includes('emf') ? ' The graph gives the emf ε = −d(NΦ)/dt.' : ''} The meter reads the induced current.`,
  ramp: (g) => `Top view of a long solenoid’s cross-section: the field (teal) is uniform inside the dashed circle and zero outside. Gold arrows: the induced electric field, E = (r/2)|dB/dt| inside and (R²/2r)|dB/dt| outside — there whether or not a ring is present.${g.includes('emf') ? ' The emf is round the circle of radius r: −dΦ/dt.' : ''}`,
  rails: () => 'Top view. The field fills the whole picture; the circuit is the resistor, the two rails and the sliding bar, and its flux is the field times the tinted area. Blue arrows: the induced current; violet: the magnetic force on the bar.',
  transformer: () => 'Schematic: an ideal transformer — every line of flux links both windings, and no energy is lost. Teal arrows: the flux in the core.',
};

// ─── the run ────────────────────────────────────────────────────────────────
function duration(q) {
  switch (q.mode) {
    case 'magnet': return M.magnetDuration(q);
    case 'ramp': return M.rampDuration(q);
    case 'rails': {
      const end = q.len - 0.03, k = q.B * q.B * q.L * q.L / q.R, tau = q.mass / k;
      const cap = q.motion === 'push' ? (end - q.x0) / q.v : 5 * tau;
      let lo = 0, hi = cap;
      if (railsState(q, hi).x <= end) return cap;
      for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (railsState(q, mid).x > end) hi = mid; else lo = mid; }
      return lo;
    }
    case 'transformer': return q.source === 'dc' ? 6 * q.tau : 2 / q.f;
    default: return M.slideDuration(q);
  }
}
const sgnB = (q) => (q.dir === 'out' ? 1 : -1);
const slideState = (q, t) => M.slide({ ...q, Bz: sgnB(q) * q.B }, t);
const magnetMz = (q) => (q.pole === 'S' ? 1 : -1) * q.m;      // the leading (lower, −z) end is N: m points −z
const magnetState = (q, t) => M.magnet({ ...q, m: magnetMz(q), l: q.ml, v: q.motion === 'const' ? -Math.abs(q.v) : q.v }, t);
const rampState = (q, t) => {
  const { B, dB } = M.rampField({ ...q, B0: sgnB(q) * q.B0 }, t);
  const emf = M.ringEmf(q.r, q.Rf, dB);
  return { B, dB, emf, E: M.inducedE(q.r, q.Rf, dB), I: q.ring ? emf / q.R : 0 };
};
const railsState = (q, t) => M.rails({ ...q, Bz: sgnB(q) * q.B, F: q.Fa }, t);
const xfState = (q, t) => M.transformer(q, t);
function stateAt(q, t) {
  return { slide: slideState, magnet: magnetState, ramp: rampState, rails: railsState, transformer: xfState }[q.mode](q, t);
}

// ─── graphs ─────────────────────────────────────────────────────────────────
// Graphs (and signed readouts) take the loop's positive direction along the field — the
// right-hand way round the field (slide, ramp) or round the magnet's moment (magnet) — so the
// flux is positive and, as in most textbooks, the emf is negative while the flux grows.
const along = (q) => (q.mode === 'magnet' ? Math.sign(magnetMz(q)) : sgnB(q));
const GRAPH = {
  slide: { flux: ['Φ', 'Wb', 'teal', (s, q) => s.flux * along(q)], emf: ['ε', 'V', 'accent', (s, q) => s.emf * along(q)], I: ['I', 'A', 'accent', (s, q) => s.I * along(q)], F: ['Fₓ', 'N', 'violet', (s) => s.Fx] },
  magnet: { flux: ['NΦ', 'Wb', 'teal', (s, q) => s.flux * along(q)], emf: ['ε', 'V', 'accent', (s, q) => s.emf * along(q)], I: ['I', 'A', 'accent', (s, q) => s.I * along(q)] },
  ramp: { B: ['B', 'T', 'teal', (s, q) => s.B * along(q)], emf: ['ε', 'V', 'accent', (s, q) => s.emf * along(q)], E: ['E', 'V/m', 'gold', (s, q) => s.E * along(q)] },
  rails: { v: ['v', 'm/s', 'good', (s) => s.vx], x: ['x', 'm', 'ink2', (s) => s.x], emf: ['ε', 'V', 'accent', (s) => Math.abs(s.emf)], I: ['I', 'A', 'accent', (s) => Math.abs(s.I)], F: ['F', 'N', 'violet', (s) => Math.abs(s.Fmag)] },
  transformer: { vp: ['v_p', 'V', 'accent', (s) => s.vp], vs: ['v_s', 'V', 'warn', (s) => s.vs], flux: ['Φ', 'Wb', 'teal', (s) => s.flux], is: ['i_s', 'A', 'warn', (s) => s.is], ip: ['i_p', 'A', 'accent', (s) => s.ip] },
};
function drawGraph(gp, mode, key, q, T, tNow) {
  const [sym, unit, color, f] = GRAPH[mode][key];
  const n = 400, ts = Array.from({ length: n + 1 }, (_, i) => (T * i) / n), vals = ts.map((t) => f(stateAt(q, t), q));
  const maxAbs = Math.max(...vals.map(Math.abs)) || 1, signed = vals.some((v) => v < -1e-6 * maxAbs);
  const { f: pf, p } = prefixFor(maxAbs, unit), tu = T < 1 ? 1e3 : 1, tl = T < 1 ? 'ms' : 's';
  const top = (Math.max(...vals) / pf) || 0, bot = (Math.min(...vals) / pf) || 0, span = Math.max(top, -bot, 1e-12);
  gp.o.xlabel = `t (${tl})`; gp.o.ylabel = `${sym.replace('_p', 'ₚ').replace('_s', 'ₛ')} (${PREF_TXT[p] ?? p}${unit})`;
  gp.setView([0, T * tu], signed ? [-1.2 * span, 1.2 * span] : [Math.min(0, bot) - 0.08 * span, 1.2 * span]);
  gp.clear();
  gp.path(ts.map((t, i) => [t * tu, vals[i] / pf]), { color, width: 2.2 });
  gp.line(tNow * tu, gp.vy0, tNow * tu, gp.vy1, { color: 'ink3', width: 1.2, dash: [4, 3] });
  gp.point(tNow * tu, f(stateAt(q, tNow), q) / pf, { color, r: 4 });
}

// ─── readouts ───────────────────────────────────────────────────────────────
function readoutRows(mode, want, q, s, T) {
  const rows = [], has = (k) => want.includes(k);
  const sense = (I, seen) => (Math.abs(I) < 1e-15 ? '' : `\\ \\text{${I > 0 ? 'anticlockwise' : 'clockwise'}${seen}}`);
  if (mode === 'slide') {
    if (has('flux')) rows.push(['flux $\\Phi$', qty(s.flux * along(q), 'Wb')]);
    if (has('emf')) rows.push(['emf $|\\mathcal{E}|$', qty(Math.abs(s.emf), 'V')]);
    if (has('I')) rows.push(['current $I$', qty(Math.abs(s.I), 'A') + sense(s.I, '')]);
    if (has('F')) rows.push(['magnetic force on the loop', qty(Math.abs(s.Fx), 'N')]);
    if (has('P')) rows.push(['power dissipated $I^2R$', qty(s.I * s.I * q.R, 'W')]);
    if (has('emax')) rows.push(['emf while an edge crosses, $Bhv$', qty(q.B * q.h * q.v, 'V')]);
  } else if (mode === 'magnet') {
    const seen = q.motion === 'drop' ? ', seen from above' : ', seen from the magnet’s side';
    if (has('flux')) rows.push(['flux linkage $N\\Phi$', qty(s.flux * along(q), 'Wb')]);
    if (has('emf')) rows.push(['emf $|\\mathcal{E}|$', qty(Math.abs(s.emf), 'V')]);
    if (has('I')) rows.push(['current $I$', qty(Math.abs(s.I), 'A') + sense(s.I, seen)]);
    if (has('v')) rows.push(['magnet’s speed', qty(Math.abs(s.vz), 'm/s')]);
  } else if (mode === 'ramp') {
    if (has('B')) rows.push(['field $B$', qty(Math.abs(s.B), 'T')]);
    if (has('dB')) rows.push(['$dB/dt$', `${qty(Math.abs(s.dB), 'T')}/\\mathrm{s}`]);
    if (has('E')) rows.push(['induced $E$ at radius $r$', qty(Math.abs(s.E), 'V/m')]);
    if (has('emf')) rows.push([`emf round the ${q.ring ? 'ring' : 'circle of radius $r$'}`, qty(Math.abs(s.emf), 'V')]);
    if (has('I')) rows.push(['current in the ring', qty(Math.abs(s.I), 'A') + sense(s.I, '')]);
  } else if (mode === 'rails') {
    if (has('flux')) rows.push(['flux $\\Phi$', qty(Math.abs(s.flux), 'Wb')]);
    if (has('emf')) rows.push(['emf $BLv$', qty(Math.abs(s.emf), 'V')]);
    if (has('I')) rows.push(['current $I$', qty(Math.abs(s.I), 'A')]);
    if (has('F')) rows.push(['magnetic force on the bar', qty(Math.abs(s.Fmag), 'N')]);
    if (has('P')) rows.push(['power in the resistor', qty(s.P, 'W')]);
    if (has('v')) rows.push(['speed $v$', qty(s.vx, 'm/s')]);
    if (has('vt') && s.vt !== null) rows.push(['terminal speed', qty(s.vt, 'm/s')]);
    if (has('tau') && Number.isFinite(s.tau) && q.motion !== 'push') rows.push(['time constant $\\tau = mR/(B^2L^2)$', qty(s.tau, 's')]);
  } else if (mode === 'transformer') {
    const r = M.transformerRms(q), dc = q.source === 'dc';
    if (has('Vs')) rows.push(dc ? ['secondary voltage now', qty(Math.abs(s.vs), 'V')] : ['secondary voltage $V_s$ (rms)', qty(r.Vs, 'V')]);
    if (has('Is') && !dc) rows.push(['secondary current $I_s$ (rms)', qty(r.Is, 'A')]);
    if (has('Ip') && !dc) rows.push(['primary current $I_p$ (rms)', qty(r.Ip, 'A')]);
    if (has('P') && !dc) rows.push(['power delivered', qty(r.P, 'W')]);
    if (has('ratio')) rows.push(['turns ratio $N_s/N_p$', fmtNum(q.Ns / q.Np)]);
    if (has('phi') && !dc) rows.push(['peak flux in the core', qty(r.phiPeak, 'Wb')]);
  }
  return rows;
}

// ─── the scenes ─────────────────────────────────────────────────────────────
const SCENES = {
  slide(plot, q, s, t, T, o) {
    const U = o.U, Lf = q.Lf * U, w = q.w * U, h = q.h * U, xr = s.xr * U, x0 = q.x0 * U, xEnd = (q.Lf + q.w + 0.02) * U;
    const vx0 = x0 - w - 0.06 * xEnd, vx1 = xEnd + 0.06 * xEnd, room = Math.max(0, (vx1 - vx0) / 2.1 - h) / 2;
    plot.setView([vx0, vx1], [-room, h + room]);
    plot.clear();
    const y0 = -Math.max(1.2, 0.72 * room), y1 = h + Math.max(1.2, 0.72 * room), sign = sgnB(q);
    plot.rect(0, y0, Lf, y1 - y0, { fill: 'teal', alpha: 0.08, stroke: 'teal', width: 1 });
    const pxStep = 30 / Math.abs(plot.X(1) - plot.X(0));          // about 30 px between marks, whatever the scale
    fieldMarks(plot, 0, Lf, y0, y1, Math.max(pxStep, Lf / 12), sign, 0.6);
    if (o.labels) plot.text(`B ${sign < 0 ? 'into' : 'out of'} the page`, 0, y1, { dx: 4, dy: -9, color: 'teal', size: 11.5 });
    const a = Math.max(0, xr - w), b = Math.min(Lf, xr);
    if (b > a) plot.rect(a, 0, b - a, h, { fill: 'teal', alpha: 0.28, stroke: false });
    plot.path([[xr - w, 0], [xr, 0], [xr, h], [xr - w, h]], { color: 'ink2', width: 3.4, close: true });
    const Imax = q.B * q.h * q.v / q.R, rel = Imax > 0 ? Math.abs(s.I) / Imax : 0;
    if (o.arrows.includes('I') && rel > 0.02) {
      const dir = Math.sign(s.I), len = 0.28 * w;      // anticlockwise: right along the bottom, left along the top
      plot.arrow(xr - w / 2 - dir * len / 2, -0.22 * h - 0.25, xr - w / 2 + dir * len / 2, -0.22 * h - 0.25, { color: 'accent', width: 2.4, head: 9 });
      plot.arrow(xr - w / 2 + dir * len / 2, h + 0.22 * h + 0.25, xr - w / 2 - dir * len / 2, h + 0.22 * h + 0.25, { color: 'accent', width: 2.4, head: 9, label: 'I', ldx: dir > 0 ? -14 : 8, ldy: -8 });
    }
    if (o.arrows.includes('v')) plot.arrow(xr + 0.25, h * 0.62, xr + 0.25 + Math.max(1.6, 0.4 * w), h * 0.62, { color: 'good', width: 2.6, head: 10, label: 'v', ldx: 6, ldy: -8 });
    if (o.arrows.includes('F') && rel > 0.02) {
      // the force acts on the edge inside the field, and points back against the motion
      const edge = within(xr, Lf) ? xr : xr - w, len = Math.max(1.4, 0.35 * w);
      plot.arrow(edge, h * 0.3, edge - len, h * 0.3, { color: 'violet', width: 2.6, head: 10, label: 'F', ldx: -12, ldy: -9 });
    }
  },

  magnet(plot, q, s, t, T, o) {
    const U = o.U, a = q.a * U, Lc = Math.max(q.Lc * U, 0.6 * a), ml = q.ml * U, zc = s.z * U, e = 0.28 * a;
    const vert = o.vertical, P2 = vert ? (sx, r) => [r, sx] : (sx, r) => [sx, r];   // (along the axis, across it) → page
    const reach = Math.abs(q.z0) * U + ml / 2 + 0.8, behind = q.motion === 'inout' ? Math.max(Lc / 2 + e + 3, -q.zs * U + ml / 2 + 0.8) : reach;
    if (vert) plot.setView([-a - 2, a + (q.meter ? 9 : 2)], [-reach, reach]);
    else plot.setView([-behind, reach], [-(q.meter ? a + 5.3 : a + 1.5), a + 1.4]);
    plot.clear();
    const nd = Math.max(4, Math.min(12, Math.round(q.N / 20))), turns = Array.from({ length: nd }, (_, k) => -Lc / 2 + (Lc * (k + 0.5)) / nd);
    const at = (sk, p) => P2(sk - e * Math.sin(p), a * Math.cos(p));    // a point on a turn, seen slightly from the side (front half: 0 < p < π)
    const ell = (sk, p0, p1) => Array.from({ length: 25 }, (_, i) => at(sk, p0 + ((p1 - p0) * i) / 24));
    // back halves of the turns, then the magnet, then the front halves
    for (const sk of turns) plot.path(ell(sk, Math.PI, 2 * Math.PI), { color: 'ink3', width: 1.6, alpha: 0.7 });
    const th = 0.5 * a, lead = q.pole === 'S' ? 'S' : 'N', back = lead === 'N' ? 'S' : 'N';
    const half = (s0, s1, letter) => {
      const col = letter === 'N' ? 'bad' : 'accent';
      plot.path([P2(s0, -th), P2(s1, -th), P2(s1, th), P2(s0, th)], { color: col, width: 1.5, close: true, fill: col, fillAlpha: 0.85 });
      const m = P2((s0 + s1) / 2, 0);
      plot.text(letter, m[0], m[1], { align: 'center', color: 'bg', size: 12, weight: 700, halo: false });
    };
    half(zc - ml / 2, zc, lead);          // the lower (−z) end leads
    half(zc, zc + ml / 2, back);
    for (const sk of turns) plot.path(ell(sk, 0, Math.PI), { color: 'ink2', width: 2.2 });
    // the meter, wired to the coil's two ends
    const emax = maxAbs((tt) => magnetState(q, tt).emf, T) || 1;
    if (q.meter) {
      const m = vert ? meter(plot, a + 5, -Lc / 2 - 3.2, s.emf / emax) : meter(plot, 0, -a - 3.6, s.emf / emax);
      const lo = at(turns[0], vert ? 0 : Math.PI), hi = at(turns[nd - 1], vert ? 0 : Math.PI);   // the ends, on the meter's side
      if (vert) {
        plot.path([lo, [m.left[0], lo[1]], m.left], { color: 'ink3', width: 1.4 });
        plot.path([hi, [m.right[0], hi[1]], m.right], { color: 'ink3', width: 1.4 });
      } else {
        const ymid = (lo[1] + m.left[1]) / 2;
        plot.path([lo, [lo[0], ymid], [m.left[0], ymid], m.left], { color: 'ink3', width: 1.4 });
        plot.path([hi, [hi[0], ymid], [m.right[0], ymid], m.right], { color: 'ink3', width: 1.4 });
      }
    }
    // the induced current, drawn along the front of the end turns: a positive emf circulates
    // anticlockwise about +z, which runs toward −r (down) on the front here, or toward +r when the axis is vertical
    const rel = Math.abs(s.emf) / emax;
    if (o.arrows.includes('I') && rel > 0.03) {
      const up = Math.sign(s.emf) * (vert ? -1 : 1) > 0;     // along increasing p?
      [turns[0], turns[nd - 1]].forEach((sk, k) => {
        const [pa, pb] = up ? [Math.PI / 2 - 0.62, Math.PI / 2 + 0.62] : [Math.PI / 2 + 0.62, Math.PI / 2 - 0.62];
        const A = at(sk, pa), B = at(sk, pb);
        plot.arrow(A[0], A[1], B[0], B[1], { color: 'accent', width: 3, head: 10, label: k ? 'I' : '', ldx: 8, ldy: 0 });
      });
    }
    // the coil's own poles while a current flows: N at the end its moment points to
    if (q.poles && rel > 0.06) {
      const top = Math.sign(s.emf) > 0 ? 'N' : 'S', bot = top === 'N' ? 'S' : 'N', far = Lc / 2, side = vert ? -(a + 1.0) : a + 1.0;
      const pu = P2(far, side), pd = P2(-far, side);
      plot.text(top, pu[0], pu[1], { align: 'center', color: top === 'N' ? 'bad' : 'accent', size: 13, weight: 700 });
      plot.text(bot, pd[0], pd[1], { align: 'center', color: bot === 'N' ? 'bad' : 'accent', size: 13, weight: 700 });
    }
    if (o.arrows.includes('v') && Math.abs(s.vz) > 1e-6) {
      // drawn on the magnet's far side from the coil: pushing it in, or leading it away
      const sv = Math.sign(s.vz), side = zc >= 0 ? 1 : -1, end = zc + side * (ml / 2 + 0.3), len = Math.max(1.5, 0.1 * reach);
      const [from, to] = sv === side ? [end, end + sv * len] : [end + side * len, end];
      const p0 = P2(from, 0), p1 = P2(to, 0);
      plot.arrow(p0[0], p0[1], p1[0], p1[1], { color: 'good', width: 2.6, head: 10, label: 'v', ldx: 6, ldy: -9 });
    }
  },

  ramp(plot, q, s, t, T, o) {
    const U = o.U, R = q.Rf * U, r = q.r * U, sign = sgnB(q);
    // the view holds the field region and the largest circle the ring can have
    const H = Math.max(1.4 * R, 1.2 * Math.max(r, (o.rMax || 0) * U)), W = Math.max(2.65 * R, 2 * H);
    plot.setView([-W, W], [-H, H]);
    plot.clear();
    const B0 = q.B0, rel = B0 > 0 ? Math.abs(s.B) / B0 : 0;
    plot.circle(0, 0, R, { fill: 'teal', alpha: 0.05 + 0.13 * rel, stroke: false });
    plot.circle(0, 0, R, { color: 'teal', width: 1.4, dash: [5, 4] });
    if (rel > 0.01) fieldMarks(plot, -R, R, -R, R, R / 4.2, Math.sign(s.B) || sign, 0.15 + 0.6 * rel, (x, y) => Math.hypot(x, y) > 0.93 * R);
    if (o.labels) plot.text(rel < 0.005 ? 'B = 0 now' : `B ${s.B < 0 ? 'into' : 'out of'} the page`, -0.72 * R, 1.08 * R, { color: 'teal', size: 11.5, align: 'right' });
    // the induced electric field, on circles inside and outside — kept off the ring so it stays visible
    const dBmax = maxAbs((tt) => M.rampField(q, tt).dB, T) || 1, Emax = (q.Rf / 2) * dBmax, showPath = q.ring || q.path !== false;
    if (o.arrows.includes('E') && Math.abs(s.dB) > 1e-12) {
      const u = Math.max(R, H / 1.4), step = 0.56 * u, radii = [0.38 * R, 0.72 * R];   // u: the arrows' spacing scale
      for (let rad = R + 0.3 * u; rad < Math.hypot(W, H); rad += step) radii.push(rad);
      for (let rad of radii) {
        if (showPath && Math.abs(rad - r) < 0.14 * u) rad = rad < r ? r - 0.16 * u : r + 0.16 * u;
        if (rad <= 0.15 * R) continue;
        const E = M.inducedE(rad / U, q.Rf, s.dB), len = 0.235 * u * Math.abs(E) / Emax, d = Math.sign(E);
        const n = Math.max(6, Math.round((M.TAU * rad) / (rad < R ? 0.62 * R : 0.62 * u)));
        for (let k = 0; k < n; k++) {
          const th = (M.TAU * (k + (rad > R ? 0.5 : 0))) / n, cx = rad * Math.cos(th), cy = rad * Math.sin(th);
          if (Math.abs(cy) > 0.94 * H || Math.abs(cx) > 0.97 * W) continue;
          const tx = -Math.sin(th) * d, ty = Math.cos(th) * d;
          plot.arrow(cx - (tx * len) / 2, cy - (ty * len) / 2, cx + (tx * len) / 2, cy + (ty * len) / 2, { color: 'gold', width: 1.8, head: 7 });
        }
      }
    }
    // the ring (or just a path)
    if (q.ring) plot.circle(0, 0, r, { color: 'ink2', width: 3.2 });
    else if (showPath) plot.circle(0, 0, r, { color: 'ink3', width: 1.4, dash: [3, 4] });
    if (o.labels && showPath) plot.text(q.ring ? 'ring' : 'no ring: just a path', r * Math.cos(-0.62), r * Math.sin(-0.62), { dx: 8, dy: 10, color: q.ring ? 'ink2' : 'ink3', size: 11.5 });
    if (q.ring && o.arrows.includes('I') && Math.abs(s.I) > 1e-12) {
      const d = Math.sign(s.I), len = 0.5 * r;     // anticlockwise: leftward along the top
      plot.arrow(d * len / 2, r, -d * len / 2, r, { color: 'accent', width: 2.6, head: 10, label: 'I', ldx: -14, ldy: -9 });
      plot.arrow(-d * len / 2, -r, d * len / 2, -r, { color: 'accent', width: 2.6, head: 10 });
    }
  },

  rails(plot, q, s, t, T, o) {
    const U = o.U, L = q.L * U, len = q.len * U, x = s.x * U, sign = sgnB(q);
    plot.setView([-0.1 * len, 1.04 * len], [-0.42 * L, 1.42 * L]);
    plot.clear();
    const pxStep = 28 / Math.abs(plot.X(1) - plot.X(0));
    fieldMarks(plot, -0.08 * len, 1.02 * len, -0.38 * L, 1.38 * L, pxStep, sign, 0.45, (xx, yy) => o.labels && xx > 0.78 * len && yy > 1.2 * L);
    if (o.labels) plot.text(`B ${sign < 0 ? 'into' : 'out of'} the page`, 1.02 * len, 1.3 * L, { color: 'teal', size: 11.5, align: 'right' });
    plot.rect(0, 0, x, L, { fill: 'teal', alpha: 0.16, stroke: false });
    plot.line(0, 0, len, 0, { color: 'ink2', width: 3.2 });
    plot.line(0, L, len, L, { color: 'ink2', width: 3.2 });
    resistor(plot, 0, 0, 0, L, { color: 'ink2', width: 2.2 });
    if (o.labels) plot.text('R', 0, L / 2, { dx: -12, color: 'ink2', size: 12.5, weight: 600, align: 'right' });
    plot.line(x, -0.14 * L, x, 1.14 * L, { color: 'ink', width: 5 });
    const ref = maxAbs((tt) => railsState(q, tt).I, T) || 1, rel = Math.abs(s.I) / ref, d = Math.sign(s.I);
    if (o.arrows.includes('I') && rel > 0.02) {
      plot.arrow(x + 0.025 * len, L / 2 - d * 0.18 * L, x + 0.025 * len, L / 2 + d * 0.18 * L, { color: 'accent', width: 2.4, head: 9, label: 'I', ldx: 7, ldy: 0 });
      if (x > 0.16 * len) plot.arrow(x / 2 + d * 0.05 * len, L + 0.09 * L, x / 2 - d * 0.05 * len, L + 0.09 * L, { color: 'accent', width: 2.4, head: 9 });
    }
    const aw = 0.11 * len;
    if (o.arrows.includes('v') && s.vx > 1e-9) plot.arrow(x + 0.01 * len, 0.74 * L, x + 0.01 * len + aw, 0.74 * L, { color: 'good', width: 2.6, head: 10, label: 'v', ldx: 6, ldy: -8 });
    const Fref = maxAbs((tt) => railsState(q, tt).Fmag, T) || 1;
    if (o.arrows.includes('F') && Math.abs(s.Fmag) > 1e-3 * Fref) plot.arrow(x - 0.01 * len, 0.3 * L, x - 0.01 * len - aw * Math.max(0.25, Math.abs(s.Fmag) / Fref), 0.3 * L, { color: 'violet', width: 2.6, head: 10, label: 'F', ldx: -12, ldy: -9 });
    if (o.arrows.includes('Fapp') && q.motion !== 'coast') {
      const Fa = q.motion === 'pull' ? q.Fa : Math.abs(s.Fmag), Fr = q.motion === 'pull' ? q.Fa : Fref;
      if (Fa > 1e-9) plot.arrow(x + 0.01 * len, 0.3 * L, x + 0.01 * len + aw * Math.max(0.25, Fa / Fr), 0.3 * L, { color: 'ink3', width: 2.4, head: 10, label: q.motion === 'pull' ? 'pull' : 'push', ldx: 6, ldy: 9 });
    }
  },

  transformer(plot, q, s, t, T, o) {
    plot.setView([-6.2, 6.2], [-2.9, 2.9]);
    plot.clear();
    // the core: a square ring
    const X0 = 2.6, Y0 = 2.2, X1 = 1.2, Y1 = 0.85;
    plot.path([[-X0, -Y0], [X0, -Y0], [X0, Y0], [-X0, Y0]], { color: 'ink3', width: 1.5, close: true, fill: 'ink3', fillAlpha: 0.22 });
    plot.path([[-X1, -Y1], [X1, -Y1], [X1, Y1], [-X1, Y1]], { color: 'ink3', width: 1.5, close: true, fill: 'bg', fillAlpha: 1 });
    const xm = (X0 + X1) / 2, ym = (Y0 + Y1) / 2, dm = (X0 - X1) / 2;
    // flux arrows round the core's middle line (anticlockwise for Φ > 0)
    const pk = maxAbs((tt) => xfState(q, tt).flux, T) || 1, rel = s.flux / pk;
    if (o.arrows.includes('flux') && Math.abs(rel) > 0.03) {
      const d = Math.sign(rel), L = 0.75 * Math.abs(rel);
      for (const [cx, cy, ux, uy] of [[0, -ym, 1, 0], [xm, 0, 0, 1], [0, ym, -1, 0], [-xm, 0, 0, -1]]) plot.arrow(cx - d * ux * L, cy - d * uy * L, cx + d * ux * L, cy + d * uy * L, { color: 'teal', width: 2.6, head: 10 });
      if (o.labels) plot.text('Φ', 0, ym, { dy: -15, color: 'teal', size: 13, weight: 600, align: 'center' });
    }
    // windings: a few slanted turns on each leg
    const nmax = Math.max(q.Np, q.Ns), draw = (n) => Math.max(2, Math.min(12, Math.round((12 * n) / nmax)));
    const wind = (xc, n) => {
      const k = draw(n), h = 1.5;
      for (let i = 0; i < k; i++) { const y = -h + (2 * h * (i + 0.5)) / k; plot.line(xc - dm - 0.12, y - 0.1, xc + dm + 0.12, y + 0.1, { color: 'warn', width: 2.4 }); }
      return [-h, h];
    };
    const [p0, p1] = wind(-xm, q.Np), [s0, s1] = wind(xm, q.Ns);
    // primary leads to the source, secondary leads to the load
    const xl = -xm - dm - 0.12, xr = xm + dm + 0.12;
    plot.path([[xl, p1 + 0.1], [-5.0, p1 + 0.1], [-5.0, 0.55]], { color: 'ink3', width: 1.6 });
    plot.path([[xl, p0 - 0.1], [-5.0, p0 - 0.1], [-5.0, -0.55]], { color: 'ink3', width: 1.6 });
    plot.circle(-5.0, 0, 0.55, { color: 'ink2', width: 1.8 });
    plot.text(q.source === 'dc' ? 'DC' : '~', -5.0, 0, { align: 'center', color: 'ink2', size: q.source === 'dc' ? 11 : 18, weight: 600, halo: false });
    plot.path([[xr, s1 + 0.1], [5.0, s1 + 0.1], [5.0, 0.75]], { color: 'ink3', width: 1.6 });
    plot.path([[xr, s0 - 0.1], [5.0, s0 - 0.1], [5.0, -0.75]], { color: 'ink3', width: 1.6 });
    resistor(plot, 5.0, -0.75, 5.0, 0.75, { color: 'ink2', width: 2 });
    if (o.labels) {
      plot.text(`Nₚ = ${q.Np}`, -xm, -Y0, { dy: 13, align: 'center', color: 'ink2', size: 12, weight: 600 });
      plot.text(`Nₛ = ${q.Ns}`, xm, -Y0, { dy: 13, align: 'center', color: 'ink2', size: 12, weight: 600 });
      plot.text('supply', -5.0, -0.55, { dy: 12, align: 'center', color: 'ink3', size: 11 });
      plot.text('load', 5.0, -0.75, { dy: 12, align: 'center', color: 'ink3', size: 11 });
    }
  },
};
const within = (u, Lf) => u > 0 && u < Lf;
function maxAbs(f, T, n = 200) { let m = 0; for (let i = 0; i <= n; i++) m = Math.max(m, Math.abs(f((T * i) / n)) || 0); return m; }

/** Node-side check used by the content tests. */
export function validate(P) {
  const p = [], mode = P.mode;
  if (!MODES.includes(mode)) return [`em-faraday: mode is one of ${MODES.join(', ')}`];
  const Q = { ...MODE_DEFAULTS[mode], ...P };
  for (const k of Q.graphs || []) if (!GRAPHS[mode].includes(k)) p.push(`em-faraday ${mode}: unknown graph “${k}” (use ${GRAPHS[mode].join(', ')})`);
  for (const k of Q.readouts || []) if (!READOUTS[mode].includes(k)) p.push(`em-faraday ${mode}: unknown readout “${k}” (use ${READOUTS[mode].join(', ')})`);
  for (const k of Q.arrows || []) if (!ARROWS[mode].includes(k)) p.push(`em-faraday ${mode}: unknown arrow “${k}” (use ${ARROWS[mode].join(', ')})`);
  if (!(Q.unit in UNIT)) p.push(`em-faraday: unit is ${Object.keys(UNIT).join(', ')}`);
  const T = duration(Q);
  if (!(T > 0) || !Number.isFinite(T)) p.push(`em-faraday ${mode}: the run has no length — check the speeds and sizes`);
  if (mode === 'magnet') {
    if (!['inout', 'const', 'drop'].includes(Q.motion)) p.push('em-faraday magnet: motion is inout, const or drop');
    if (!(Q.a > 0 && Q.N > 0 && Q.m > 0 && Q.ml > 0)) p.push('em-faraday magnet: a, N, m and ml must be positive');
  }
  if (mode === 'rails' && !['push', 'coast', 'pull'].includes(Q.motion)) p.push('em-faraday rails: motion is push, coast or pull');
  for (const m of Q.motions || []) if (!(MOTIONS[mode] || []).some(([k]) => k === m)) p.push(`em-faraday ${mode}: unknown motion “${m}” in motions`);
  if (mode === 'rails' && !(Q.x0 >= 0 && Q.x0 < Q.len)) p.push('em-faraday rails: x0 must lie on the rails');
  if (mode === 'ramp' && !['trapezoid', 'sine'].includes(Q.profile)) p.push('em-faraday ramp: profile is trapezoid or sine');
  if (mode === 'transformer' && !['ac', 'dc'].includes(Q.source)) p.push('em-faraday transformer: source is ac or dc');
  if (['slide', 'ramp', 'rails'].includes(mode) && !['in', 'out'].includes(Q.dir)) p.push('em-faraday: dir is in or out');
  for (const s of Q.sliders || []) {
    const key = typeof s === 'string' ? s : s?.key;
    if (!SLIDERS[mode].includes(key)) { p.push(`em-faraday ${mode}: slider “${key}” is not one of ${SLIDERS[mode].join(', ')}`); continue; }
    const o = sliderSpec(s, Q, mode, UNIT[Q.unit] ?? 100, Q.unit, T);
    if (!(o.min < o.max) || o.value < o.min - 1e-9 || o.value > o.max + 1e-9) p.push(`em-faraday: slider ${key} needs min ≤ value ≤ max (${o.min}, ${o.value}, ${o.max})`);
  }
  return p;
}
