// Circuits with inductors, and alternating current, as live pictures beside
// their graphs. The physics is model/em-ac.js (tested headlessly in
// test/em-ac.test.mjs); everything is lumped and ideal unless a resistance is
// drawn. Five modes:
//
//   coil       a current driven through an ideal coil (ramp-and-hold or sine),
//              the field inside it, and the emf ε = −L dI/dt it induces in
//              itself — present only while the current CHANGES;
//   rl         battery, two-way switch, R and L in series: the current builds
//              up (or dies away) with τ = L/R; voltages or energies below it;
//   lc         a charged capacitor across a coil (and a resistance): charge,
//              current and the energy sloshing between them, beside the
//              spring–mass oscillator that obeys the same equation;
//   ac         a sinusoidal source driving R, L and/or C in series: rotating
//              phasors beside v(t) and i(t), the phase angle marked;
//   resonance  the current (or power) of a series RLC against frequency,
//              with f₀, the half-power bandwidth and Q, and the phasors at
//              the drive frequency.
//
//   { type: 'em-ac', params: {
//       mode: 'rl',
//       // coil:  L (H), Imax (A), tr (s, the ramp time), th (s, the hold time), wave: 'trapezoid' | 'sine',
//       //        graphs: ['I', 'emf'] (drop 'emf' to show the current alone)
//       // rl:    E (V), R (Ω), L (H), on: true (switch to the battery; false: to the short, decaying from ℰ/R),
//       //        panel: 'v' | 'energy' (what the lower graph shows), graphs: ['i', 'v'] (fewer, or [] for the circuit alone)
//       // lc:    L (H), C (F), R (Ω, default 0), V0 (V, the capacitor's starting voltage), analog: true (the spring–mass twin; 'always' shows it in a problem's picture too),
//       //        graphs: ['q', 'i'] (fewer, or []), bars: true (the energy bars)
//       // ac:    elements: 'R' | 'L' | 'C' | 'RL' | 'RC' | 'LC' | 'RLC', elementChoice: false (offer R / L / C),
//       //        V0 (V, amplitude), f (Hz), R, L, C, phasors / traces: lists of v i R L C (default: all that apply),
//       //        stack: true (the element phasors head to tail, summing to v)
//       // resonance: V0, R, L, C, f (the drive), y: 'I' | 'P', band: true (shade the half-power band)
//       controls: true,          // or a list of: L Imax tr wave · E R L switch · L C R V0 · element f R L C · f R L C y
//       ranges: {},              // slider ranges in SI units: { L: [min, max] }
//       readouts: null,          // a list (coil: I dIdt emf · rl: tau i vL U heat work · lc: f0 q i UE UB ·
//                                //   ac: XL XC Z I0 phi · resonance: f0 Q df I P pf); readout: false hides the bar
//       t: null,                 // coil/rl/lc: a still picture t seconds in; ac: phase: ωt in degrees
//       hide: [],                // printed as “?”: E R L C f V0 Imax; or emf (no polarity marks), element, tau, final
//       window: null,            // rl/lc/coil: the time axis's length in seconds (default 5τ, 3 periods, 2 periods)
//       speed: null,             // coil: animation s per real s (1); rl: s per τ (1.6); lc, ac: s per period (4)
//   } }

import { themeColors } from '../plot.js';
import * as M from '../model/em-ac.js';

export const defaults = { mode: 'rl', controls: null, readout: null, readouts: null, t: null, phase: null, hide: [], ranges: {}, window: null, speed: null };

const MODES = ['coil', 'rl', 'lc', 'ac', 'resonance'];
const MODE_DEFAULTS = {
  coil: { L: 0.5, Imax: 2, tr: 1, th: 1.5, wave: 'trapezoid', speed: 1 },
  rl: { E: 12, R: 4, L: 0.2, on: true, panel: 'v', speed: 1.6 },
  lc: { L: 2e-3, C: 5e-6, R: 0, V0: 10, analog: true, speed: 4 },
  ac: { elements: 'RLC', elementChoice: false, V0: 10, f: 120, R: 40, L: 0.1, C: 50e-6, phasors: null, traces: null, stack: true, speed: 4 },
  resonance: { V0: 10, R: 10, L: 0.1, C: 10e-6, f: 140, y: 'I', band: true },
};
const CONTROLS = { coil: ['L', 'Imax', 'tr', 'wave'], rl: ['E', 'R', 'L', 'switch'], lc: ['L', 'C', 'R', 'V0'], ac: ['element', 'f', 'R', 'L', 'C', 'V0'], resonance: ['f', 'R', 'L', 'C', 'y'] };
const READOUTS = { coil: ['I', 'dIdt', 'emf'], rl: ['tau', 'i', 'vL', 'U', 'heat', 'work'], lc: ['f0', 'q', 'i', 'UE', 'UB'], ac: ['XL', 'XC', 'Z', 'I0', 'phi'], resonance: ['f0', 'Q', 'df', 'I', 'P', 'pf'] };
const HIDE = ['E', 'R', 'L', 'C', 'f', 'V0', 'Imax', 'emf', 'element', 'tau', 'final', 'f0', 'i'];
const ELEMENTS = ['R', 'L', 'C', 'RL', 'RC', 'LC', 'RLC'];
const PHASOR_KEYS = ['v', 'i', 'R', 'L', 'C'];
// starting ranges for the sliders, SI units (used when the starting value lies inside)
const RANGE = {
  coil: { L: [0.05, 2], Imax: [0.5, 5], tr: [0.2, 3] },
  rl: { E: [1, 30], R: [1, 50], L: [0.02, 1] },
  lc: { L: [0.5e-3, 10e-3], C: [1e-6, 20e-6], R: [0, 20], V0: [1, 20] },
  ac: { f: [10, 5000], R: [1, 200], L: [0.01, 0.5], C: [1e-6, 100e-6], V0: [1, 20] },
  resonance: {},
};

// ─── numbers ────────────────────────────────────────────────────────────────
const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
/** a measured value, 3 significant figures with an SI prefix: "12.0 mA" */
function eng(x, unit, n = 3) {
  if (!Number.isFinite(x)) return '—';
  if (Math.abs(x) < 1e-15) return `0 ${unit}`;
  if (unit === '°' || unit === '') return `${(+x.toPrecision(n)).toString()}${unit}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  let s = (x / f).toPrecision(n);
  if (/e/.test(s)) s = String(+s);
  return `${s} ${p}${unit}`;
}
/** a given value, as short as it can be: "4.7 kΩ", "20 µF" */
function given(x, unit) {
  if (Math.abs(x) < 1e-15) return `0 ${unit}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  return `${+(x / f).toPrecision(4)} ${p}${unit}`;
}
/** the same as TeX for the readout bar */
const texOf = (s) => s.replace(/−/g, '-').replace(/ ([GMkmµnp]?)(Ω|A\/s|A|V|W|F|H|J|C|s|Hz|°)$/, (m, p, u) => (u === '°' ? '^\\circ' : `\\,\\mathrm{${p === 'µ' ? '\\mu ' : p}${u === 'Ω' ? '\\Omega' : u}}`)).replace(/°$/, '^\\circ');
const tx = (x, unit, n = 3) => texOf(eng(x, unit, n));
const niceUp = (x) => { if (!(x > 0)) return 1; const e = 10 ** Math.floor(Math.log10(x)); return [1, 2, 2.5, 5, 10].map((m) => m * e).find((v) => v >= x * 0.9999); };
/** an axis top just above x: 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10 × 10ⁿ */
const axisUp = (x) => { if (!(x > 0)) return 1; const e = 10 ** Math.floor(Math.log10(x)); return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * e).find((v) => v >= x * 0.9999); };
function ticks(a, b, target = 6) {
  const span = b - a;
  if (!(span > 0)) return [];
  const raw = span / target, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= target + 1) || 10 * mag;
  const out = [];
  for (let t = Math.ceil(a / step - 1e-9) * step; t <= b + 1e-9 * span; t += step) out.push(+t.toFixed(12));
  return out;
}
/** a time unit for an axis that runs to tmax */
const timeUnit = (tmax) => (tmax >= 2 ? [1, 's'] : tmax >= 2e-3 ? [1e-3, 'ms'] : tmax >= 2e-6 ? [1e-6, 'µs'] : [1e-9, 'ns']);
const freqUnit = (fmax) => (fmax >= 2e6 ? [1e6, 'MHz'] : fmax >= 2e3 ? [1e3, 'kHz'] : [1, 'Hz']);
const tickText = (v) => String(+v.toPrecision(6)).replace('-', '−');

// slider display units: [SI factor, label, TeX]
const SLIDER_UNIT = {
  L: (max) => (max >= 1 ? [1, 'H'] : max >= 1e-3 ? [1e-3, 'mH'] : [1e-6, 'µH']),
  C: (max) => (max >= 1e-3 ? [1e-3, 'mF'] : max >= 1e-6 ? [1e-6, 'µF'] : max >= 1e-9 ? [1e-9, 'nF'] : [1e-12, 'pF']),
  R: (max) => (max >= 1e4 ? [1e3, 'kΩ'] : [1, 'Ω']),
  f: (max) => (max >= 1e7 ? [1e6, 'MHz'] : max >= 1e4 ? [1e3, 'kHz'] : [1, 'Hz']),
  E: () => [1, 'V'], V0: () => [1, 'V'], Imax: () => [1, 'A'], tr: () => [1, 's'],
};
const unitTeX = (u) => `\\mathrm{${u.replace('µ', '\\mu ').replace('Ω', '\\Omega')}}`;

export function mount(F, P0) {
  const mode = MODES.includes(P0.mode) ? P0.mode : 'rl';
  const P = { ...MODE_DEFAULTS[mode], ...Object.fromEntries(Object.entries(P0).filter(([, v]) => v !== undefined && v !== null)), hide: P0.hide || [], ranges: P0.ranges || {} };
  for (const k of ['t', 'phase', 'window', 'readouts', 'readout', 'controls', 'phasors', 'traces']) if (P0[k] === null || P0[k] === undefined) P[k] = null;
  if (P.speed === null || P.speed === undefined) P.speed = MODE_DEFAULTS[mode].speed;
  const compact = F.compact;
  const hid = (k) => P.hide.includes(k);
  const still = mode === 'ac' ? P.phase !== null : mode === 'resonance' ? true : P.t !== null;

  // ── controls ──
  const wanted = P.controls === true || (P.controls === null && !compact) ? CONTROLS[mode] : Array.isArray(P.controls) ? P.controls : [];
  const elemsNow = () => (mode === 'ac' && P.elementChoice ? F.params.element ?? P.elements[0] : P.elements);
  const SCALE = {};       // key → SI factor of the slider
  const sliderInfo = {
    L: { label: 'Inductance $L$', explain: mode === 'lc' ? 'The circuit’s inertia: a bigger $L$ opposes changes in current more strongly, so the charge sloshes more slowly.' : mode === 'coil' ? 'Flux linked per ampere, $L = N\\Phi_B/I$: the emf for a given $dI/dt$ grows in proportion.' : mode === 'rl' ? 'Sets how strongly the coil opposes changes in current: $\\tau = L/R$. It does not change the final current.' : 'Sets the inductor’s reactance $X_L = \\omega L$.' },
    C: { label: 'Capacitance $C$', explain: mode === 'lc' ? 'Charge held per volt. A bigger $C$ pushes back more gently on the charge, so the oscillation is slower.' : 'Sets the capacitor’s reactance $X_C = 1/\\omega C$: a bigger $C$ lets more current through.' },
    R: { label: 'Resistance $R$', explain: mode === 'lc' ? 'Turns energy into heat every cycle, so the oscillation dies away. $R = 0$ is an ideal, lossless circuit.' : mode === 'rl' ? 'All the loop’s resistance, the coil’s own included. It sets the final current $\\mathcal{E}/R$ and, with $L$, the time constant.' : mode === 'resonance' ? 'Only the resistance takes energy out, so it sets the height of the peak, $I_0 = V_0/R$, and its width.' : 'The only element that turns electrical energy into heat.' },
    E: { label: 'Battery emf $\\mathcal{E}$', explain: 'Sets the final current, $\\mathcal{E}/R$, and the voltage across the coil at the instant the switch closes.' },
    V0: { label: mode === 'lc' ? 'Starting voltage $V_0$' : 'Source amplitude $V_0$', explain: mode === 'lc' ? 'The capacitor is charged to this voltage, then connected across the coil at $t = 0$.' : 'The peak voltage of the source, $v = V_0\\sin\\omega t$.' },
    Imax: { label: 'Peak current $I_{\\max}$', explain: 'The largest current the supply drives through the coil. A larger current does not by itself mean a larger emf.' },
    tr: { label: 'Ramp time $t_r$', explain: 'How long the current takes to rise (and later to fall). A faster ramp is a larger $dI/dt$, and so a larger emf.' },
    f: { label: mode === 'resonance' ? 'Drive frequency $f$' : 'Frequency $f$', explain: 'Cycles per second of the source; $\\omega = 2\\pi f$. Reactances depend on it — resistance does not.' },
  };
  const relevant = (k) => {
    if (mode !== 'ac') return true;
    const el = P.elementChoice ? 'RLC' : P.elements;
    return k === 'f' || k === 'V0' || el.includes(k);
  };
  for (const k of wanted) {
    if (k === 'wave' && mode === 'coil') { F.choice({ key: 'wave', label: 'Current through the coil', options: [['trapezoid', 'ramp and hold'], ['sine', 'sine wave']], value: P.wave, explain: 'Ramp and hold: the current rises, holds, falls and rests. Sine: it swings smoothly both ways.' }); continue; }
    if (k === 'switch' && mode === 'rl') { F.choice({ key: 'switch', label: 'Switch', options: [['on', 'to the battery'], ['off', 'to the short']], value: P.on ? 'on' : 'off', explain: 'To the battery: the current builds up. To the short: the battery is cut out, and the coil keeps the current flowing while it dies away.' }); continue; }
    if (k === 'element' && mode === 'ac') { if (P.elementChoice) F.choice({ key: 'element', label: 'The source drives', options: [['R', 'a resistor'], ['L', 'an inductor'], ['C', 'a capacitor']], value: P.elements.length === 1 ? P.elements : 'L', explain: 'One element alone across the source: watch when the current peaks compared with the voltage.' }); continue; }
    if (k === 'y' && mode === 'resonance') { F.choice({ key: 'y', label: 'Plot', options: [['I', 'current amplitude'], ['P', 'average power']], value: P.y, explain: 'The power, $\\tfrac12 I_0^2R$, falls to half its peak where the current falls to $1/\\sqrt2$ of its peak.' }); continue; }
    if (!sliderInfo[k] || P[k] === undefined || !relevant(k)) continue;
    const v = P[k];
    let [lo, hi] = P.ranges[k] || RANGE[mode][k] || [];
    if (mode === 'resonance' && !P.ranges[k]) {
      const r0 = M.resonance(P);
      if (k === 'f') [lo, hi] = [r0.f0 * 0.1, r0.f0 * 2.4];
      if (k === 'L' || k === 'C') [lo, hi] = [v / 2.5, v * 2.5];
      if (k === 'R') [lo, hi] = [Math.max(0.5, v / 10), v * 5];
    }
    if (lo === undefined || !(v >= lo && v <= hi)) { lo = k === 'R' && mode === 'lc' ? 0 : v / 5; hi = v * 5; }
    const [fac, u] = SLIDER_UNIT[k](Math.max(hi, v));
    SCALE[k] = fac;
    const mn = lo / fac, mx = hi / fac, step = niceUp((mx - mn) / 200);
    const log = k === 'f' && mode === 'ac';
    F.slider({ key: k, label: sliderInfo[k].label, min: log ? Math.max(mn, 1e-9) : Math.floor(mn / step + 1e-9) * step, max: Math.ceil(mx / step - 1e-9) * step, step, value: v / fac, unit: unitTeX(u), explain: sliderInfo[k].explain, logScale: log });
  }
  const val = (k) => (F.params[k] !== undefined && SCALE[k] ? F.params[k] * SCALE[k] : P[k]);

  // ── state: the running clock and the transient segment ──
  const S = { t: still ? (mode === 'ac' ? 0 : P.t) : 0, seg: null, playing: false, done: false, sticky: {} };
  const sticky = (name, v) => (S.sticky[name] = Math.max(S.sticky[name] || 0, v));
  // fixed time windows, from the starting values
  const T0 = (() => {
    if (mode === 'coil') return 2 * (2 * P.tr + 2 * P.th);
    if (mode === 'rl') return 5 * (P.L / P.R);
    if (mode === 'lc') { const o = M.rlc({ L: P.L, C: P.C, R: P.R, q0: P.C * P.V0 }); return 3 * (o.wd > 0 ? (2 * Math.PI) / o.wd : o.T0); }
    return 2 / P.f;
  })();
  const windowT = P.window ?? T0;

  function newSegment(i0) {
    if (mode === 'rl') {
      const on = (F.params.switch ?? (P.on ? 'on' : 'off')) === 'on';
      const E = val('E'), R = val('R'), L = val('L');
      if (i0 === undefined) i0 = on ? 0 : E / R;
      S.seg = { kind: 'rl', on, E, R, L, c: M.rl({ E, R, L, i0, on }) };
    } else if (mode === 'lc') {
      const L = val('L'), C = val('C'), R = val('R') ?? 0, V0 = val('V0');
      S.seg = { kind: 'lc', L, C, R, V0, c: M.rlc({ L, C, R, q0: C * V0, i0: 0 }) };
    }
    if (!still) S.t = 0;
    S.done = false;
  }
  newSegment();

  F.onChange((key) => {
    if (mode === 'rl') {
      if (key === 'switch') { const iNow = S.seg.c.i(S.t); newSegment(iNow); }
      else newSegment();
    } else if (mode === 'lc') newSegment();
    if (!still && !S.playing && mode !== 'resonance') { /* a paused or reduced-motion picture: redraw only */ }
    draw();
  });

  // ── the canvas ──
  const tallDefault = mode === 'ac' || mode === 'lc';
  const { canvas, box } = F.canvas({ aspect: tallDefault ? '' : 'wide', label: P.alt || ALT[mode] });
  const ctx = canvas.getContext('2d');
  let C = themeColors();
  let W = 600, H = 300, FS = 12, narrow = false;

  // ── animation ──
  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!still) {
    const rate = () => {
      if (mode === 'coil') return 1 / P.speed;
      if (mode === 'rl') return (P.L / P.R) / P.speed;
      if (mode === 'lc') return (windowT / 3) / P.speed;
      return 1 / (val('f') * P.speed);
    };
    const step = (dt) => {
      if (!S.playing) return;
      S.t += dt * rate();
      if (mode === 'rl' || mode === 'lc') {
        const i = S.seg.c.i(Math.min(S.t, windowT));
        const ref = mode === 'rl' ? S.seg.E / S.seg.R : S.seg.C * S.seg.V0 * S.seg.c.w0;
        S.flowPh = (S.flowPh || 0) + Math.max(-120, Math.min(120, 70 * (i / (ref || 1)))) * dt;
      }
      if (mode === 'rl' && S.t >= windowT) { S.t = windowT; S.done = true; }
      if (mode === 'lc') {
        if (S.t >= windowT) { if ((val('R') ?? 0) > 0) { S.t = windowT; S.done = true; } else S.t -= windowT; }
      }
      if (mode === 'coil' && S.t >= windowT) S.t -= windowT;
      if (mode === 'ac') { const T = 1 / val('f'); if (S.t >= 2 * T) S.t -= 2 * T; }
      draw();
    };
    S.playing = !reduced();
    let anim = F.animate(step);
    const btn = F.button({
      label: S.playing ? 'Pause' : 'Play',
      onClick: () => {
        S.playing = !S.playing;
        btn.textContent = S.playing ? 'Pause' : 'Play';
        if (S.playing && S.done) { S.t = 0; S.done = false; }
        anim.stop();
        if (S.playing) anim = F.animate(step, { force: true });
      },
    });
    if (mode === 'rl' || mode === 'lc') F.button({ label: 'Restart', onClick: () => { newSegment(); S.t = 0; draw(); } });
  }

  // ─── drawing primitives ───
  function line(x0, y0, x1, y1, col, w = 2.2, dash = []) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
  function poly(pts, col, w = 2.2, dash = []) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash); ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); }
  function text(s, x, y, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 600} ${o.size || FS}px Inter, system-ui, sans-serif`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    if (o.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1; }
    ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
    ctx.restore();
  }
  /** text with subscripts: parts [['v', 0], ['L', 1], [' = 3 V', 0]] (1 = subscript) */
  function rich(parts, x, y, o = {}) {
    const size = o.size || FS, w0 = o.weight || 600;
    ctx.save();
    const fontOf = (sub) => `${w0} ${sub ? size * 0.74 : size}px Inter, system-ui, sans-serif`;
    let total = 0;
    for (const [s, sub] of parts) { ctx.font = fontOf(sub); total += ctx.measureText(s).width; }
    let x0 = o.align === 'right' ? x - total : o.align === 'left' ? x : x - total / 2;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const [s, sub] of parts) {
      ctx.font = fontOf(sub);
      const yy = y + (sub ? size * 0.3 : 0);
      if (o.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x0, yy); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x0, yy);
      x0 += ctx.measureText(s).width;
    }
    ctx.restore();
    return total;
  }
  function arrowHead(x, y, ux, uy, col, sz = 8) {
    ctx.save(); ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x - ux * sz - uy * sz * 0.5, y - uy * sz + ux * sz * 0.5); ctx.lineTo(x - ux * sz + uy * sz * 0.5, y - uy * sz - ux * sz * 0.5);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function arrow(x0, y0, x1, y1, col, w = 2.4, head = 9) {
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (L < 1.5) return;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hd = Math.min(head, L * 0.5);
    line(x0, y0, x1 - ux * hd * 0.7, y1 - uy * hd * 0.7, col, w);
    arrowHead(x1, y1, ux, uy, col, hd);
  }
  // circuit symbols along the segment a → b; each returns nothing
  function zig(a, b, col) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux, amp = Math.min(7, L * 0.16), n = 6;
    const pts = [a];
    for (let k = 0; k < n; k++) { const f = (k + 0.5) / n, s = k % 2 ? -1 : 1; pts.push([a[0] + ux * L * f + nx * amp * s, a[1] + uy * L * f + ny * amp * s]); }
    pts.push(b);
    poly(pts, col, 2.4);
  }
  function coilSym(a, b, col, side = 1, n = 4) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy * side, ny = ux * side, r = L / (2 * n);
    const pts = [];
    for (let k = 0; k < n; k++) {
      const cx = a[0] + ux * r * (2 * k + 1), cy = a[1] + uy * r * (2 * k + 1);
      for (let j = 0; j <= 16; j++) { const th = Math.PI - (Math.PI * j) / 16; pts.push([cx + r * (Math.cos(th) * ux + Math.sin(th) * nx * 1.15), cy + r * (Math.cos(th) * uy + Math.sin(th) * ny * 1.15)]); }
    }
    poly(pts, col, 2.4);
  }
  function plates(a, b, col, half, q = 0, qref = 1, fieldCol = null) {
    // two plates perpendicular to a → b, at a and b; q is the charge on the plate at a
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
    const f = Math.min(1, Math.abs(q) / (qref || 1));
    if (fieldCol && f > 0.01) {
      ctx.save(); ctx.fillStyle = fieldCol; ctx.globalAlpha = 0.08 + 0.32 * f; ctx.beginPath();
      ctx.moveTo(a[0] + nx * half, a[1] + ny * half); ctx.lineTo(b[0] + nx * half, b[1] + ny * half); ctx.lineTo(b[0] - nx * half, b[1] - ny * half); ctx.lineTo(a[0] - nx * half, a[1] - ny * half); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    for (const p of [a, b]) line(p[0] - nx * half, p[1] - ny * half, p[0] + nx * half, p[1] + ny * half, col, 3.2);
    const nq = f > 0.03 ? Math.max(1, Math.round(4 * f)) : 0;
    for (let k = 0; k < nq; k++) {
      const s = ((k + 0.5) / nq - 0.5) * 1.6 * half;
      const pa = [a[0] + nx * s - ux * 8, a[1] + ny * s - uy * 8], pb = [b[0] + nx * s + ux * 8, b[1] + ny * s + uy * 8];
      text(q > 0 ? '+' : '−', pa[0], pa[1], { color: q > 0 ? C.bad : C.accent, weight: 700, size: FS + 1, halo: false });
      text(q > 0 ? '−' : '+', pb[0], pb[1], { color: q > 0 ? C.accent : C.bad, weight: 700, size: FS + 1, halo: false });
    }
  }
  function battery(a, b, half) {
    // + plate (long) at b's side, − plate (short, thick) at a's side
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
    line(b[0] - nx * half, b[1] - ny * half, b[0] + nx * half, b[1] + ny * half, C.ink, 2.6);
    line(a[0] - nx * half * 0.5, a[1] - ny * half * 0.5, a[0] + nx * half * 0.5, a[1] + ny * half * 0.5, C.ink, 5.5);
  }
  function source(cx, cy, r) {
    ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore();
    const pts = []; for (let k = 0; k <= 24; k++) { const x = -0.6 + (1.2 * k) / 24; pts.push([cx + x * r, cy - Math.sin(x * Math.PI / 0.6) * r * 0.35]); }
    poly(pts, C.ink2, 1.8);
  }
  function dot(x, y, col, r = 4) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); }
  /** moving charges along a polyline, `phase` px along it, `spacing` px apart */
  function flow(pts, phase, spacing = 18) {
    const segs = []; let total = 0;
    for (let k = 1; k < pts.length; k++) { const L = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); segs.push([pts[k - 1], pts[k], total, L]); total += L; }
    if (total < 1) return;
    const n = Math.max(1, Math.round(total / spacing)), sp = total / n, ph = ((phase % sp) + sp) % sp;
    ctx.save(); ctx.fillStyle = C.ink;
    for (let k = 0; k < n; k++) {
      const s = ph + k * sp;
      const seg = segs.find(([, , s0, L]) => s >= s0 && s <= s0 + L);
      if (!seg) continue;
      const [p, q, s0, L] = seg, f = (s - s0) / L;
      ctx.beginPath(); ctx.arc(p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, 2.4, 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
  }
  const pathLen = (pts) => pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);

  /**
   * A graph panel: r = { x, y, w, h }; x-axis [x0, x1] with its own tick text; curves are functions of x.
   * o: { x0, x1, y0, y1, xfac, xunit, title, curves: [{ f, color, width, dash, label }], cursor, hl: [{ y, color, label }], vl: [{ x, color, label }], band: [a, b, color] }
   */
  function graph(r, o) {
    const padL = o.padL ?? (narrow || compact ? 34 : 42), padB = o.noX ? 6 : 18, padT = o.title ? 18 : 6;
    const X0 = r.x + padL, X1 = r.x + r.w - 6, Y0 = r.y + padT, Y1 = r.y + r.h - padB;
    const X = (x) => X0 + ((x - o.x0) / (o.x1 - o.x0)) * (X1 - X0), Y = (y) => Y1 - ((y - o.y0) / (o.y1 - o.y0)) * (Y1 - Y0);
    ctx.save();
    ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.strokeRect(X0 + 0.5, Y0 + 0.5, X1 - X0, Y1 - Y0);
    // y ticks
    ctx.font = `500 ${FS - 2}px Inter, system-ui, sans-serif`; ctx.fillStyle = C.ink3; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (const v of o.yticks ?? ticks(o.y0, o.y1, r.h > 150 ? 4 : 2)) {
      const y = Y(v);
      if (y < Y0 - 0.5 || y > Y1 + 0.5) continue;
      ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.line3 : C.line; ctx.beginPath(); ctx.moveTo(X0, Math.round(y) + 0.5); ctx.lineTo(X1, Math.round(y) + 0.5); ctx.stroke();
      ctx.fillText(tickText(v), X0 - 4, y);
    }
    // x ticks
    if (!o.noX) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const xt = ticks(o.x0 / o.xfac, o.x1 / o.xfac, Math.max(3, Math.floor((X1 - X0) / 70)));
      const uw = o.xunit ? ctx.measureText(o.xunit).width + 10 : 0;
      for (const v of xt) {
        const x = X(v * o.xfac);
        if (x < X0 - 1 || x > X1 + 1) continue;
        ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, Y0); ctx.lineTo(Math.round(x) + 0.5, Y1); ctx.stroke();
        const tw = ctx.measureText(tickText(v)).width / 2;
        if (x + tw < X1 - uw) ctx.fillText(tickText(v), x, Y1 + 3);
      }
      ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = C.ink2; ctx.fillText(o.xunit, X1, Y1 + 3);
    }
    ctx.restore();
    if (o.band) { const [a, b, col] = o.band; ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.16; ctx.fillRect(X(a), Y0, X(b) - X(a), Y1 - Y0); ctx.restore(); }
    for (const h of o.hl || []) { if (h.y < o.y0 || h.y > o.y1) continue; line(X0, Y(h.y), X1, Y(h.y), h.color || C.ink3, 1.2, [5, 4]); if (h.label) text(h.label, X1 - 4, Y(h.y) - 9, { align: 'right', color: h.color || C.ink3, size: FS - 1.5, weight: 600 }); }
    for (const v of o.vl || []) { if (v.x < o.x0 || v.x > o.x1) continue; line(X(v.x), Y0, X(v.x), Y1, v.color || C.ink3, 1.2, [5, 4]); if (v.label) text(v.label, X(v.x) + 4, Y0 + 9, { align: 'left', color: v.color || C.ink3, size: FS - 1.5, weight: 650 }); }
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0 - 1, X1 - X0, Y1 - Y0 + 2); ctx.clip();
    for (const c of o.curves) {
      const n = Math.max(80, Math.round(X1 - X0)), pts = [];
      for (let k = 0; k <= n; k++) { const x = o.x0 + ((o.x1 - o.x0) * k) / n, y = c.f(x); if (Number.isFinite(y)) pts.push([X(x), Y(Math.max(o.y0 - (o.y1 - o.y0), Math.min(o.y1 + (o.y1 - o.y0), y)))]); }
      poly(pts, c.color, c.width || 2.2, c.dash || []);
    }
    ctx.restore();
    if (o.title) (Array.isArray(o.title) ? rich(o.title, X0 + 2, r.y + 8, { align: 'left', size: FS - 1, color: C.ink2, weight: 600 }) : text(o.title, X0 + 2, r.y + 8, { align: 'left', size: FS - 1, color: C.ink2, weight: 600 }));
    for (const c of o.curves) if (c.label) rich(c.label, c.lx !== undefined ? X(c.lx) : X1 - 4, c.ly !== undefined ? Y(c.ly) : Y(c.f(o.x1)) + (c.ldy ?? -10), { align: c.lx !== undefined ? 'left' : 'right', color: c.color, size: FS - 0.5, weight: 700 });
    if (o.cursor !== undefined && o.cursor !== null && o.cursor >= o.x0 && o.cursor <= o.x1) {
      const xc = X(o.cursor);
      line(xc, Y0, xc, Y1, C.ink3, 1.2);
      for (const c of o.curves) if (!c.noDot) { const y = c.f(o.cursor); if (Number.isFinite(y) && y >= o.y0 && y <= o.y1) dot(xc, Y(y), c.color, 4); }
    }
    return { X, Y, X0, X1, Y0, Y1 };
  }

  // ─── the modes ───
  function draw() {
    C = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = canvas.clientWidth || 600; H = canvas.clientHeight || 300;
    narrow = W < 520;
    const want = narrow ? (mode === 'resonance' ? '4 / 4.6' : mode === 'coil' || mode === 'rl' ? '4 / 4.4' : '4 / 5.2') : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    FS = compact || narrow ? 11 : 12.5;
    ({ coil: drawCoil, rl: drawRL, lc: drawLC, ac: drawAC, resonance: drawRes })[mode]();
  }

  // split the canvas into a picture area and a graph area
  function split(fracPic) {
    if (narrow) { const hp = Math.round(H * fracPic); return { pic: { x: 6, y: 4, w: W - 12, h: hp - 6 }, gr: { x: 4, y: hp + 2, w: W - 8, h: H - hp - 6 } }; }
    const wp = Math.round(W * fracPic);
    return { pic: { x: 8, y: 6, w: wp - 12, h: H - 12 }, gr: { x: wp, y: 6, w: W - wp - 6, h: H - 12 } };
  }

  // ── coil ──
  function drawCoil() {
    const wave = F.params.wave ?? P.wave, L = val('L'), Imax = val('Imax'), tr = val('tr');
    const Wv = M.rampWave({ kind: wave, L, Imax, tr, th: P.th });
    const t = S.t, I = Wv.I(t), dIdt = Wv.dIdt(t), emf = Wv.emf(t);
    const emfScale = sticky('emf', axisUp(1.15 * L * Imax * (wave === 'sine' ? (2 * Math.PI) / Wv.T : 1 / tr)));
    const Iscale = sticky('I', axisUp(1.1 * Imax));
    const { pic, gr } = split(narrow ? 0.42 : 0.42);
    // the coil: a solenoid seen from the side
    const cx = pic.x + pic.w / 2, cy = pic.y + pic.h * 0.5;
    const len = Math.min(pic.w * 0.62, 230), rad = Math.min(pic.h * 0.2, 46), n = 9;
    const xa = cx - len / 2, xb = cx + len / 2;
    // field lines inside, as many as the current deserves, pointing along +x for I > 0
    const fI = Math.abs(I) / Iscale, nLines = Math.round(5 * fI);
    for (let k = 0; k < nLines; k++) {
      const y = cy + ((k + 0.5) / nLines - 0.5) * 1.5 * rad;
      line(xa - 16, y, xb + 16, y, C.teal, 1.6);
      const dir = Math.sign(I) || 1;
      arrowHead(dir > 0 ? xb + 24 : xa - 24, y, dir, 0, C.teal, 8);
    }
    // the windings: back halves faint, front halves solid
    for (let k = 0; k < n; k++) {
      const x = xa + (len * (k + 0.5)) / n;
      ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, cy, rad * 0.22, rad, 0, -Math.PI / 2, Math.PI / 2, true); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(x, cy, rad * 0.22, rad, 0, -Math.PI / 2, Math.PI / 2, false); ctx.stroke(); ctx.restore();
    }
    // leads
    const lx0 = xa + len * 0.5 / n, lx1 = xb - len * 0.5 / n;
    const leadY = cy + rad + 26;
    poly([[lx0, cy + rad], [lx0, leadY], [pic.x + 14, leadY]], C.ink2, 2.2);
    poly([[lx1, cy + rad], [lx1, leadY], [pic.x + pic.w - 14, leadY]], C.ink2, 2.2);
    // the current: an arrow on the left lead, into the coil for I > 0
    if (Math.abs(I) > 1e-3 * Imax) {
      const s = Math.sign(I), xm = (pic.x + 14 + lx0) / 2, l = 12 + 22 * Math.min(1, Math.abs(I) / Iscale);
      arrow(xm - (s * l) / 2, leadY, xm + (s * l) / 2, leadY, C.accent, 2.6, 9);
    }
    rich([['I = ', 0], [hid('Imax') ? '?' : eng(I, 'A').replace('-', '−'), 0]], (pic.x + 14 + lx0) / 2, leadY + 16, { color: C.accent, size: FS });
    // the induced emf, as + and − at the leads, and an arrow for the way it pushes
    if (!hid('emf')) {
      const big = Math.abs(emf) > 0.02 * emfScale;
      if (big) {
        // the emf drives current opposite to the change: ε = −L dI/dt along the current direction (+x)
        const s = Math.sign(emf), ym = cy - rad - 22, l = 18 + 34 * Math.min(1, Math.abs(emf) / emfScale);
        arrow(cx - (s * l) / 2, ym, cx + (s * l) / 2, ym, C.gold, 2.6, 9);
        rich([['ε', 0], ['L', 1]], cx + (s * l) / 2 + s * 14, ym, { color: C.gold, size: FS + 0.5, weight: 700 });
        text(dIdt > 0 ? 'opposes the rise' : 'opposes the fall', cx, ym - 17, { color: C.gold, size: FS - 1.5, weight: 600 });
      } else text('steady current: no emf', cx, cy - rad - 22, { color: C.ink3, size: FS - 1, weight: 600 });
    }
    if (narrow) rich([['L = ', 0], [hid('L') ? '?' : given(L, 'H'), 0]], pic.x + pic.w - 14, leadY + 16, { color: C.ink2, size: FS - 0.5, align: 'right' });
    else rich([['L = ', 0], [hid('L') ? '?' : given(L, 'H'), 0]], cx, cy + rad + 44, { color: C.ink2, size: FS - 0.5 });
    // graphs
    const [tf, tu] = timeUnit(windowT);
    const both = (P.graphs || ['I', 'emf']).includes('emf'), half = both ? (gr.h - 6) / 2 : gr.h;
    const top = { x: gr.x, y: gr.y, w: gr.w, h: half }, bot = { x: gr.x, y: gr.y + half + 6, w: gr.w, h: half };
    graph(top, { x0: 0, x1: windowT, xfac: tf, xunit: both ? '' : `t (${tu})`, y0: wave === 'sine' ? -Iscale : 0, y1: Iscale, noX: both, title: 'current I (A)', curves: [{ f: Wv.I, color: C.accent, width: 2.4 }], cursor: t });
    if (both) graph(bot, { x0: 0, x1: windowT, xfac: tf, xunit: `t (${tu})`, y0: -emfScale, y1: emfScale, title: [['emf ε', 0], ['L', 1], [' = −L dI/dt (V)', 0]], curves: [{ f: Wv.emf, color: C.gold, width: 2.4 }], cursor: t });
    if (wantReadout()) readout({ I: ['current $I$', tx(I, 'A')], dIdt: ['rate $dI/dt$', tx(dIdt, 'A/s')], emf: ['emf $\\mathcal{E}_L = -L\\,dI/dt$', tx(emf, 'V')] });
  }

  // ── rl ──
  function drawRL() {
    const seg = S.seg, c = seg.c, t = Math.min(S.t, windowT);
    const i = c.i(t), vL = c.vL(t), vR = c.vR(t);
    const Iref = sticky('I', axisUp(1.12 * Math.max(seg.E / seg.R, Math.abs(c.i(0)))));
    const gs = P.graphs ?? ['i', 'v'];
    const { pic, gr } = gs.length ? split(narrow ? 0.46 : 0.44) : { pic: narrow ? { x: 6, y: 6, w: W - 12, h: H - 12 } : { x: W * 0.22, y: 6, w: W * 0.56, h: H - 12 }, gr: null };
    // geometry
    ctx.save(); ctx.font = `600 ${FS}px Inter, system-ui, sans-serif`;
    const mL = Math.max(narrow ? 56 : 70, ctx.measureText(`ℰ = ${hid('E') ? '?' : given(seg.E, 'V')}`).width + 30);
    const mR = Math.max(narrow ? 86 : 100, ctx.measureText(`L = ${hid('L') ? '?' : given(seg.L, 'H')}`).width + 30, ctx.measureText('i = 0.000 mA').width + 28);
    ctx.restore();
    const xl = pic.x + mL, xr = pic.x + pic.w - mR, yt = pic.y + 34, yb = pic.y + pic.h - 22;
    const ym = (yt + yb) / 2, span = xr - xl;
    const xp = xl + span * 0.42, lev = Math.min(span * 0.26, 70), ang = 0.85;
    const c1 = [xp - lev, yt], c2 = [xp - lev * Math.cos(ang), yt + lev * Math.sin(ang)];
    const on = seg.on;
    const wcol = C.ink2;
    // wires
    poly([c1, [xl, yt], [xl, ym - 16]], wcol); poly([[xl, ym + 16], [xl, yb], [xr, yb], [xr, ym + 34]], wcol);
    poly([c2, [c2[0], yb]], wcol);
    const xR0 = xp + (xr - xp) * 0.3, xR1 = xp + (xr - xp) * 0.75;
    poly([[xp, yt], [xR0, yt]], wcol); zig([xR0, yt], [xR1, yt], wcol); poly([[xR1, yt], [xr, yt], [xr, ym - 34]], wcol);
    coilSym([xr, ym - 34], [xr, ym + 34], wcol, -1, 4);
    battery([xl, ym + 7], [xl, ym - 7], 16);
    // the field of the coil, as faint teal loops growing with the current
    const fi = Math.min(1, Math.abs(i) / Iref);
    if (fi > 0.02) { ctx.save(); ctx.strokeStyle = C.teal; ctx.globalAlpha = 0.25 + 0.6 * fi; ctx.lineWidth = 1.5; for (const k of [1, 2]) { ctx.beginPath(); ctx.ellipse(xr, ym, 16 + 9 * k * fi, 42 + 6 * k, 0, 0, 2 * Math.PI); ctx.stroke(); } ctx.restore(); }
    // the switch
    const to = on ? c1 : c2;
    line(xp, yt, to[0], to[1], C.ink, 2.8);
    for (const p of [c1, c2]) { ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(p[0], p[1], 3.4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); }
    dot(xp, yt, C.ink2, 3.6);
    text('battery', c1[0] - 2, yt - 13, { color: on ? C.ink2 : C.ink3, size: FS - 2, weight: 600 });
    text('short', c2[0] + 8, c2[1] + 2, { color: on ? C.ink3 : C.ink2, size: FS - 2, weight: 600, align: 'left' });
    // moving charges along the live loop
    const loop = on ? [[xl, yb], [xl, yt], c1, [xp, yt], [xr, yt], [xr, yb], [xl, yb]] : [[c2[0], yb], c2, [xp, yt], [xr, yt], [xr, yb], [c2[0], yb]];
    if (!still) flow(loop, S.flowPh || 0, 20);
    // labels
    rich([['ℰ = ', 0], [hid('E') ? '?' : given(seg.E, 'V'), 0]], xl - 22, ym, { align: 'right', color: C.ink, size: FS });
    text('+', xl + 20, ym - 10, { color: C.ink3, size: FS - 1 });
    rich([['R = ', 0], [hid('R') ? '?' : given(seg.R, 'Ω'), 0]], (xR0 + xR1) / 2, yt - 17, { color: C.ink, size: FS });
    rich([['L = ', 0], [hid('L') ? '?' : given(seg.L, 'H'), 0]], xr + 20, ym - 9, { align: 'left', color: C.ink, size: FS });
    // the coil's polarity: the drop L di/dt along the current (down through the coil)
    if (!hid('emf') && Math.abs(vL) > 0.03 * seg.E) {
      const top = vL > 0 ? '+' : '−', bot = vL > 0 ? '−' : '+';
      text(top, xr - 14, ym - 30, { color: C.teal, weight: 800, size: FS + 2 }); text(bot, xr - 14, ym + 30, { color: C.teal, weight: 800, size: FS + 2 });
    }
    if (!hid('i')) rich([['i = ', 0], [eng(i, 'A'), 0]], xr + 20, ym + 11, { align: 'left', color: C.accent, size: FS - 0.5 });
    // graphs
    const [tf, tu] = timeUnit(windowT);
    const tau = c.tau;
    const vls = hid('tau') ? [] : [{ x: tau, color: C.gold, label: 'τ' }];
    const both = gs.includes('i') && gs.includes('v'), half = gr ? (both ? (gr.h - 6) / 2 : gr.h) : 0;
    const top = gr && { x: gr.x, y: gr.y, w: gr.w, h: half }, bot = gr && (both ? { x: gr.x, y: gr.y + half + 6, w: gr.w, h: half } : top);
    if (gs.includes('i')) graph(top, { x0: 0, x1: windowT, xfac: tf, xunit: both ? '' : `t (${tu})`, y0: 0, y1: Iref, noX: both, title: 'current i (A)', curves: [{ f: c.i, color: C.accent, width: 2.5 }], hl: hid('final') ? [] : [{ y: seg.on ? seg.E / seg.R : 0, color: C.ink3, label: seg.on ? 'ℰ/R' : '' }], vl: vls, cursor: t });
    if (!gs.includes('v')) { /* the current alone, or the circuit alone */ }
    else if ((P.panel ?? 'v') === 'energy') {
      const Uref = sticky('U', axisUp(1.1 * Math.max(c.work(windowT), c.heat(windowT) + c.stored(windowT), c.stored(0), 1e-12)));
      graph(bot, { x0: 0, x1: windowT, xfac: tf, xunit: `t (${tu})`, y0: 0, y1: Uref, title: 'energy since t = 0 (J)', vl: vls, cursor: t, curves: [
        ...(seg.on ? [{ f: c.work, color: C.ink2, width: 2.2, dash: [6, 4], label: [['battery’s work', 0]], ldy: -10 }] : []),
        { f: c.stored, color: C.teal, width: 2.6, label: [['stored ½Li²', 0]], ldy: seg.on ? -10 : -10 },
        { f: c.heat, color: C.warn, width: 2.4, label: [['heat in R', 0]], ...(seg.on ? { lx: windowT * 0.58, ly: c.heat(windowT * 0.58) - Uref * 0.1 } : { ldy: -10 }) },
      ] });
    } else {
      const Vref = sticky('V', axisUp(1.1 * seg.E));
      graph(bot, { x0: 0, x1: windowT, xfac: tf, xunit: `t (${tu})`, y0: seg.on ? 0 : -Vref, y1: Vref, title: 'voltage (V)', vl: vls, cursor: t, curves: [
        { f: c.vR, color: C.warn, width: 2.2, label: [['v', 0], ['R', 1]], lx: windowT * 0.86, ly: seg.on ? Vref * 0.8 : Vref * 0.5 },
        { f: c.vL, color: C.teal, width: 2.4, label: [['v', 0], ['L', 1]], lx: windowT * 0.86, ly: seg.on ? Vref * 0.16 : -Vref * 0.55 },
      ] });
    }
    if (wantReadout()) readout({ tau: ['time constant $\\tau = L/R$', tx(tau, 's')], i: ['current $i$', tx(i, 'A')], vL: ['coil voltage $v_L = L\\,di/dt$', tx(vL, 'V')], U: ['stored $\\tfrac12 Li^2$', tx(c.stored(t), 'J')], heat: ['heat in $R$', tx(c.heat(t), 'J')], work: ['battery’s work', tx(c.work(t), 'J')] }, P.panel === 'energy' ? ['tau', 'i', 'U', 'heat'] : ['tau', 'i', 'vL']);
    void vR;
  }

  // ── lc ──
  function drawLC() {
    const seg = S.seg, c = seg.c, t = Math.min(S.t, windowT);
    const q = c.q(t), i = c.i(t), Q0 = seg.C * seg.V0, I0 = Q0 * c.w0;
    const Qref = sticky('Q', axisUp(1.08 * Q0)), Iref = sticky('I', axisUp(1.08 * I0));
    const showR = (val('R') ?? 0) > 0 || CONTROLS.lc.includes('R') && wanted.includes('R');
    const analog = P.analog === 'always' || (P.analog && !compact);
    const gs = P.graphs ?? ['q', 'i'], showBars = P.bars ?? true;
    // layout: picture (schematic + analog) | graphs | energy bars
    let pic, gr, bars;
    if (!gs.length && !showBars) {
      pic = narrow ? { x: 6, y: 4, w: W - 12, h: H - 8 } : { x: W * 0.2, y: 6, w: W * 0.6, h: H - 12 };
    } else if (!gs.length) {
      const wb = 96;
      pic = { x: narrow ? 6 : W * 0.12, y: 6, w: (narrow ? W - 12 : W * 0.66) - wb, h: H - 12 };
      bars = { x: pic.x + pic.w + 14, y: 6, w: wb - 8, h: H - 12 };
    } else if (narrow) {
      const h1 = Math.round(H * (analog ? 0.4 : 0.34));
      pic = { x: 6, y: 4, w: W - 12, h: h1 };
      bars = { x: W - 74, y: h1 + 4, w: 70, h: H - h1 - 8 };
      gr = { x: 4, y: h1 + 4, w: W - 84, h: H - h1 - 8 };
    } else {
      const wp = Math.round(W * 0.38), wb = showBars ? 88 : 0;
      pic = { x: 8, y: 6, w: wp - 12, h: H - 12 };
      gr = { x: wp, y: 6, w: W - wp - wb - 8, h: H - 12 };
      bars = showBars ? { x: W - wb, y: 6, w: wb - 6, h: H - 12 } : null;
    }
    if (narrow && gs.length && !showBars) { gr.w = W - 8; bars = null; }
    const sch = analog && !narrow ? { x: pic.x, y: pic.y, w: pic.w, h: pic.h * 0.62 } : analog ? { x: pic.x, y: pic.y, w: pic.w * 0.56, h: pic.h } : pic;
    const xl = sch.x + (narrow ? 66 : 76), xr = sch.x + sch.w - (narrow ? 60 : 80), yt = sch.y + 22, yb = sch.y + sch.h - 22, ym = (yt + yb) / 2;
    const wcol = C.ink2, gap = 12;
    const pa = [xl, ym - gap / 2], pb = [xl, ym + gap / 2];
    poly([pa, [xl, yt], [xr, yt], [xr, ym - 32]], wcol);
    poly([[xr, ym + 32], [xr, yb], ...(showR ? [[(xl + xr) / 2 + 22, yb]] : [[xl, yb]])], wcol);
    if (showR) { zig([(xl + xr) / 2 + 22, yb], [(xl + xr) / 2 - 22, yb], wcol); poly([[(xl + xr) / 2 - 22, yb], [xl, yb], pb], wcol); }
    else poly([[xl, yb], pb], wcol);
    coilSym([xr, ym - 32], [xr, ym + 32], wcol, -1, 4);
    plates(pa, pb, C.ink, 20, q, Qref, C.violet);
    const fi = Math.min(1, Math.abs(i) / Iref);
    if (fi > 0.02) { ctx.save(); ctx.strokeStyle = C.teal; ctx.globalAlpha = 0.2 + 0.65 * fi; ctx.lineWidth = 1.5; for (const k of [1, 2]) { ctx.beginPath(); ctx.ellipse(xr, ym, 14 + 8 * k * fi, 40 + 6 * k, 0, 0, 2 * Math.PI); ctx.stroke(); } ctx.restore(); }
    // charges flowing: positive i is onto the top plate (bottom plate → wires → coil → top plate)
    const path = [pb, [xl, yb], [xr, yb], [xr, yt], [xl, yt], pa];
    if (!still) flow(path, S.flowPh || 0, 20);
    rich([['C = ', 0], [hid('C') ? '?' : given(seg.C, 'F'), 0]], xl - 26, ym, { align: 'right', color: C.ink, size: FS });
    rich([['L = ', 0], [hid('L') ? '?' : given(seg.L, 'H'), 0]], xr + 20, ym, { align: 'left', color: C.ink, size: FS });
    if (showR) rich([['R = ', 0], [hid('R') ? '?' : given(seg.R, 'Ω'), 0]], (xl + xr) / 2, yb + 15, { color: C.ink, size: FS - 0.5 });
    // the spring–mass twin: x ↔ q, v ↔ i
    if (analog) {
      const an = narrow ? { x: pic.x + pic.w * 0.58, y: pic.y + 8, w: pic.w * 0.42, h: pic.h - 16 } : { x: pic.x, y: pic.y + pic.h * 0.64, w: pic.w, h: pic.h * 0.36 };
      const wallX = an.x + 10, yb2 = an.y + an.h * 0.62, eq = an.x + an.w * 0.55, amp = an.w * 0.22, bw = Math.min(30, an.w * 0.16);
      const xm = eq + amp * (q / Qref);
      line(wallX, an.y + an.h * 0.25, wallX, yb2 + 14, C.ink3, 3);
      line(wallX, yb2 + 14, an.x + an.w - 6, yb2 + 14, C.ink3, 1.5);
      // spring from the wall to the block
      const sx0 = wallX + 2, sx1 = xm - bw / 2, nz = 10, pts = [[sx0, yb2]];
      for (let k = 0; k < nz; k++) pts.push([sx0 + ((sx1 - sx0) * (k + 0.5)) / nz, yb2 + (k % 2 ? -7 : 7)]);
      pts.push([sx1, yb2]);
      poly(pts, C.violet, 1.8);
      ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.fillRect(xm - bw / 2, yb2 - bw / 2, bw, bw); ctx.strokeRect(xm - bw / 2, yb2 - bw / 2, bw, bw); ctx.restore();
      line(eq, yb2 + 18, eq, yb2 + 24, C.ink3, 1.2);
      if (Math.abs(i) > 0.03 * Iref) arrow(xm, yb2 - bw / 2 - 9, xm + (i / Iref) * 34, yb2 - bw / 2 - 9, C.accent, 2.2, 8);
      text(narrow ? 'x ↔ q,  v ↔ i' : 'the same equation: x ↔ q, v ↔ i, m ↔ L, k ↔ 1/C', an.x + an.w / 2, an.y + an.h - 4, { color: C.ink3, size: FS - 2, weight: 500 });
    }
    // graphs
    const [tf, tu] = timeUnit(windowT);
    const qf = (Qref >= 1e-3 ? [1e-3, 'mC'] : Qref >= 1e-6 ? [1e-6, 'µC'] : [1e-9, 'nC']), If = Iref >= 1 ? [1, 'A'] : Iref >= 1e-3 ? [1e-3, 'mA'] : [1e-6, 'µA'];
    if (gs.length) {
      const both = gs.includes('q') && gs.includes('i'), half = both ? (gr.h - 6) / 2 : gr.h;
      const top = { x: gr.x, y: gr.y, w: gr.w, h: half }, bot = both ? { x: gr.x, y: gr.y + half + 6, w: gr.w, h: half } : top;
      if (gs.includes('q')) graph(top, { x0: 0, x1: windowT, xfac: tf, xunit: both ? '' : `t (${tu})`, y0: -Qref / qf[0], y1: Qref / qf[0], noX: both, title: `charge q (${qf[1]})`, curves: [{ f: (x) => c.q(x) / qf[0], color: C.violet, width: 2.4 }], cursor: t });
      if (gs.includes('i')) graph(bot, { x0: 0, x1: windowT, xfac: tf, xunit: `t (${tu})`, y0: -Iref / If[0], y1: Iref / If[0], title: `current i (${If[1]})`, curves: [{ f: (x) => c.i(x) / If[0], color: C.accent, width: 2.4 }], cursor: t });
    }
    // energy bars
    const U0 = c.U0, UE = c.UE(t), UB = c.UB(t), heat = Math.max(0, c.heat(t));
    if (bars) {
      const bx = bars.x, by = bars.y + 18, bh = bars.h - 44, bwid = Math.min(16, (bars.w - 10) / 3 - 4);
      text('energy', bx + bars.w / 2, bars.y + 6, { color: C.ink2, size: FS - 1.5, weight: 600 });
      [[UE, C.violet, ['U', 'E']], [UB, C.teal, ['U', 'B']], [heat, C.warn, ['heat', '']]].forEach(([u, col, [a, b]], k) => {
        const x = bx + 6 + k * (bwid + 8), hh = (bh * Math.min(1, u / (U0 || 1)));
        ctx.save(); ctx.strokeStyle = C.line3; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, by + 0.5, bwid, bh); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x, by + bh - hh, bwid, hh); ctx.restore();
        if (b) rich([[a, 0], [b, 1]], x + bwid / 2, by + bh + 12, { color: col, size: FS - 1.5, weight: 700 }); else text(a, x + bwid / 2, by + bh + 12, { color: col, size: FS - 2.5, weight: 700 });
      });
    }
    if (wantReadout()) readout({ f0: ['natural frequency $f_0 = \\dfrac{1}{2\\pi\\sqrt{LC}}$', tx(c.f0, 'Hz')], q: ['charge $q$', tx(q, 'C')], i: ['current $i$', tx(i, 'A')], UE: ['$U_E = q^2/2C$', tx(UE, 'J')], UB: ['$U_B = \\tfrac12 Li^2$', tx(UB, 'J')] }, ['f0', 'q', 'i']);
  }

  // ── ac ──
  function drawAC() {
    const els = elemsNow();
    const R = els.includes('R') ? val('R') : 0, L = els.includes('L') ? val('L') : 0, Cc = els.includes('C') ? val('C') : null, f = val('f'), V0 = val('V0');
    const s = M.series({ V0, f, R, L, C: Cc });
    const T = 1 / f;
    const t = still ? ((P.phase * Math.PI) / 180) / s.w : S.t;
    const ang = s.angle(t);
    const shownPh = (P.phasors ? P.phasors : ['v', 'i', ...(els.length > 1 ? els.split('') : [])]).filter((k) => k === 'v' || k === 'i' || els.includes(k));
    const shownTr = (P.traces ? P.traces : ['v', 'i', ...(els.length > 1 ? els.split('') : [])]).filter((k) => k === 'v' || k === 'i' || els.includes(k));
    const amp = { v: V0, R: s.VR, L: s.VL, C: s.VC };
    const Vref = sticky(`V${els}`, Math.max(V0, ...shownPh.filter((k) => k !== 'i').map((k) => amp[k]), ...shownTr.filter((k) => k !== 'i').map((k) => amp[k])) * 1.04);
    const Iref = sticky(`I${els}`, s.I0 * 1.04);
    const COL = { v: C.gold, i: C.accent, R: C.warn, L: C.teal, C: C.violet };
    const NAME = { v: [['v', 0]], i: [['i', 0]], R: [['v', 0], ['R', 1]], L: [['v', 0], ['L', 1]], C: [['v', 0], ['C', 1]] };
    const value = { v: s.v, i: s.i, R: s.vR, L: s.vL, C: s.vC };
    // layout
    const stripH = compact ? 0 : narrow ? 66 : 54;
    const legendH = shownTr.length > 1 ? 18 : 0;
    let cx, cy, Rp, tr;
    if (narrow) {
      Rp = Math.min(W / 2 - 24, (H - stripH) * 0.24);
      cx = W / 2; cy = stripH + Rp + 12;
      const top = cy + Rp + 12 + legendH;
      tr = { x: 4, y: top, w: W - 8, h: H - top - 4 };
    } else {
      Rp = Math.min(W * 0.2, (H - stripH - 30) / 2);
      cx = 14 + Rp + 10; cy = stripH + (H - stripH) / 2;
      tr = { x: cx + Rp + 26, y: cy - Rp - 6, w: W - (cx + Rp + 26) - 6, h: 2 * Rp + 24 };
    }
    // the circuit strip: the source and the elements in series
    if (stripH) {
      const y0 = 12, y1 = narrow ? 44 : stripH - 10, x0 = narrow ? 18 : 20, x1 = narrow ? W - 18 : Math.min(W * 0.46, 330);
      const items = hid('element') ? ['?'] : els.split('');
      poly([[x0, (y0 + y1) / 2 - 12], [x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, (y0 + y1) / 2 + 12]], C.ink3, 1.8);
      source(x0, (y0 + y1) / 2, 12);
      const n = items.length, slot = (x1 - x0 - 24) / n, ew = Math.min(slot * 0.62, 58);
      items.forEach((k, j) => {
        const xm = x0 + 24 + slot * (j + 0.5), xa = xm - ew / 2, xb = xm + ew / 2;
        ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(xa - 1, y0 - 9, xb - xa + 2, 18); ctx.restore();
        if (k === 'R') zig([xa, y0], [xb, y0], COL.R);
        else if (k === 'L') coilSym([xa + ew * 0.1, y0], [xb - ew * 0.1, y0], COL.L, -1, 3);
        else if (k === 'C') { line(xa, y0, xm - 4, y0, C.ink3, 1.8); line(xm + 4, y0, xb, y0, C.ink3, 1.8); line(xm - 4, y0 - 9, xm - 4, y0 + 9, COL.C, 2.6); line(xm + 4, y0 - 9, xm + 4, y0 + 9, COL.C, 2.6); }
        else { ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.8; ctx.fillStyle = C.panel; ctx.fillRect(xa, y0 - 9, xb - xa, 18); ctx.strokeRect(xa, y0 - 9, xb - xa, 18); ctx.restore(); text('?', xm, y0, { color: C.ink, weight: 800 }); }
        const lab = k === 'R' ? `R = ${hid('R') ? '?' : given(R, 'Ω')}` : k === 'L' ? `L = ${hid('L') ? '?' : given(L, 'H')}` : k === 'C' ? `C = ${hid('C') ? '?' : given(Cc, 'F')}` : '';
        if (lab) text(lab, xm, y0 + 17, { color: COL[k], size: FS - 1.5, weight: 650 });
      });
      const vTxt = hid('V0') ? 'V₀ = ?' : `V₀ = ${given(V0, 'V')}`, fTxt = `f = ${hid('f') ? '?' : given(f, 'Hz')}`;
      if (narrow) text(`${vTxt},  ${fTxt}`, (x0 + x1) / 2 + 8, y1 + 12, { color: C.ink2, size: FS - 1, weight: 600 });
      else text(`${vTxt},  ${fTxt}`, x1 + 12, (y0 + y1) / 2, { align: 'left', color: C.ink2, size: FS - 1, weight: 600 });
    }
    // phasor diagram
    ctx.save(); ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - Rp - 6, cy); ctx.lineTo(cx + Rp + 6, cy); ctx.moveTo(cx, cy - Rp - 6); ctx.lineTo(cx, cy + Rp + 6); ctx.stroke(); ctx.restore();
    const kV = Rp / Vref, kI = (Rp * 0.62) / Iref;
    const tip = (len, a) => [cx + len * Math.cos(a), cy - len * Math.sin(a)];
    const order = [];
    const stack = P.stack && els.length > 1;
    let base = [cx, cy];
    for (const k of ['R', 'L', 'C']) {
      if (!shownPh.includes(k)) continue;
      const from = stack ? base : [cx, cy], len = amp[k] * kV, a = ang[k];
      const to = [from[0] + len * Math.cos(a), from[1] - len * Math.sin(a)];
      order.push([k, from, to]);
      if (stack) base = to;
    }
    // the phase angle between v and i, as an arc
    if (shownPh.includes('v') && shownPh.includes('i') && Math.abs(s.phi) > 0.02) {
      const r0 = Math.min(Rp * 0.28, 34), a0 = ang.i, a1 = ang.v;
      ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, r0, -a0, -a1, s.phi > 0); ctx.stroke(); ctx.restore();
      const am = (a0 + a1) / 2;
      text('φ', cx + (r0 + 10) * Math.cos(am), cy - (r0 + 10) * Math.sin(am), { color: C.ink2, size: FS, weight: 700 });
    }
    for (const [k, from, to] of order) arrow(from[0], from[1], to[0], to[1], COL[k], 2.4, 9);
    if (shownPh.includes('i')) { const [x, y] = tip(s.I0 * kI, ang.i); arrow(cx, cy, x, y, COL.i, 3, 10); }
    if (shownPh.includes('v')) { const [x, y] = tip(V0 * kV, ang.v); arrow(cx, cy, x, y, COL.v, 3, 10); }
    // labels: v and i beyond their tips; element phasors beside their middles, on the side away from the origin
    const labelAt = (k, x, y, a) => rich(NAME[k], x + 13 * Math.cos(a), y - 13 * Math.sin(a), { color: COL[k], size: FS, weight: 750 });
    for (const [k, from, to] of order) {
      const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
      if (len < 4) continue;
      if (!stack) { labelAt(k, to[0], to[1], ang[k]); continue; }
      const dx = (to[0] - from[0]) / len, dy = (to[1] - from[1]) / len, mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2;
      let nx = dy, ny = -dx;
      if ((mx - cx) * nx + (my - cy) * ny < (mx - cx) * -nx + (my - cy) * -ny) { nx = -nx; ny = -ny; }
      rich(NAME[k], mx + nx * 13, my + ny * 13, { color: COL[k], size: FS - 0.5, weight: 750 });
    }
    if (shownPh.includes('i')) { const [x, y] = tip(s.I0 * kI, ang.i); labelAt('i', x, y, ang.i); }
    if (shownPh.includes('v')) { const [x, y] = tip(V0 * kV, ang.v); labelAt('v', x, y, ang.v); }
    // traces: two periods, the cursor at t (mod 2T)
    const tc = ((t % (2 * T)) + 2 * T) % (2 * T);
    const [tf, tu] = timeUnit(2 * T);
    const curves = shownTr.map((k) => ({ f: k === 'i' ? (x) => (value.i(x) / Iref) * (0.62 * Vref) : value[k], color: COL[k], width: k === 'v' || k === 'i' ? 2.6 : 1.8, dash: k === 'v' || k === 'i' ? [] : [6, 4] }));
    const g = graph(tr, { x0: 0, x1: 2 * T, xfac: tf, xunit: `t (${tu})`, y0: -Vref, y1: Vref, yticks: [], padL: narrow ? 8 : 10, curves, cursor: tc, title: null });
    // a legend above the traces
    if (legendH) {
      let x = g.X0 + 2;
      const y = g.Y0 - 11;
      for (const k of shownTr) {
        const solid = k === 'v' || k === 'i';
        line(x, y, x + 16, y, COL[k], solid ? 2.6 : 1.8, solid ? [] : [5, 3]);
        x += 20 + rich(NAME[k], x + 20, y, { align: 'left', color: COL[k], size: FS - 0.5, weight: 750 }) + 12;
      }
      if (shownTr.includes('i')) text('(current to its own scale)', g.X1, y, { align: 'right', color: C.ink3, size: FS - 2.5, weight: 500 });
    }
    // projection lines from the phasor tips to the cursor (wide layout: same height and scale)
    if (!narrow) {
      const xc = g.X(tc);
      for (const k of ['v', 'i']) {
        if (!shownPh.includes(k) || !shownTr.includes(k)) continue;
        const [x, y] = k === 'i' ? tip(s.I0 * kI, ang.i) : tip(V0 * kV, ang.v);
        line(x, y, xc, y, COL[k], 1, [3, 4]);
      }
    }
    if (wantReadout()) {
      const deg = (s.phi * 180) / Math.PI;
      readout({ XL: ['$X_L = \\omega L$', tx(s.XL, 'Ω')], XC: ['$X_C = 1/\\omega C$', tx(s.XC, 'Ω')], Z: ['impedance $Z$', tx(s.Z, 'Ω')], I0: ['current amplitude $I_0$', tx(s.I0, 'A')], phi: ['phase $\\phi$ (v ahead of i)', `${+deg.toFixed(1)}^\\circ`] },
        els === 'R' ? ['I0', 'phi'] : els === 'L' ? ['XL', 'I0', 'phi'] : els === 'C' ? ['XC', 'I0', 'phi'] : ['XL', 'XC', 'Z', 'I0', 'phi'].filter((k) => (k !== 'XL' || els.includes('L')) && (k !== 'XC' || els.includes('C'))));
    }
  }

  // ── resonance ──
  function drawRes() {
    const R = val('R'), L = val('L'), Cc = val('C'), f = val('f'), V0 = val('V0'), y = F.params.y ?? P.y;
    const res = M.resonance({ R, L, C: Cc }), r0 = M.resonance({ R: P.R, L: P.L, C: P.C });
    const fmax = r0.f0 * 2.4;
    const s = M.series({ V0, f, R, L, C: Cc });
    const Ipk = V0 / R, Ppk = (V0 * V0) / (2 * R);
    const Iref = sticky('I', axisUp(1.1 * Ipk)), Pref = sticky('P', axisUp(1.1 * Ppk));
    const isP = y === 'P';
    const fn = (ff) => { const ss = M.series({ V0, f: ff, R, L, C: Cc }); return isP ? ss.Pavg : ss.I0; };
    const ref = isP ? Pref : Iref;
    const [ff, fu] = freqUnit(fmax);
    const iu = isP ? (ref >= 1 ? [1, 'W'] : [1e-3, 'mW']) : (ref >= 1 ? [1, 'A'] : [1e-3, 'mA']);
    const pic = narrow ? { x: 4, y: H * 0.55, w: W - 8, h: H * 0.45 - 4 } : { x: W * 0.66, y: 6, w: W * 0.34 - 6, h: H - 12 };
    const gr = narrow ? { x: 4, y: 4, w: W - 8, h: H * 0.55 - 8 } : { x: 4, y: 6, w: W * 0.66 - 8, h: H - 12 };
    const half = isP ? Ppk / 2 : Ipk / Math.SQRT2;
    const band = P.band && !hid('final') ? [res.f1, res.f2, C.gold] : null;
    graph(gr, { x0: 0, x1: fmax, xfac: ff, xunit: `f (${fu})`, y0: 0, y1: ref / iu[0], title: isP ? `average power (${iu[1]})` : `current amplitude I₀ (${iu[1]})`, band, curves: [{ f: (x) => fn(x) / iu[0], color: isP ? C.warn : C.accent, width: 2.6 }],
      hl: P.band && !hid('final') ? [{ y: half / iu[0], color: C.ink3, label: isP ? 'half power' : '1/√2 of the peak' }] : [],
      vl: hid('f0') ? [] : [{ x: res.f0, color: C.gold, label: 'f₀' }], cursor: f });
    // phasors at the drive frequency, the current as the reference (along +x):
    // v_R along i, the net reactive voltage v_L − v_C at right angles, v their sum
    const Rp = narrow ? Math.min(pic.w * 0.32, pic.h * 0.36) : Math.min(pic.w * 0.5, pic.h * 0.3), cx = pic.x + Math.max(30, pic.w * (narrow ? 0.12 : 0.22)), cy = pic.y + pic.h * (narrow ? 0.54 : 0.46), k = Rp / V0;
    line(cx - 6, cy, cx + Rp + 14, cy, C.line3, 1); line(cx, cy - Rp - 4, cx, cy + Rp + 4, C.line3, 1);
    const pR = [cx + s.VR * k, cy], pV = [pR[0], cy - (s.VL - s.VC) * k];
    const net = s.VL - s.VC;
    if (Math.abs(s.phi) > 0.03) {
      const r0a = Math.min(26, s.VR * k * 0.6);
      ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r0a, 0, -s.phi, s.phi > 0); ctx.stroke(); ctx.restore();
      text('φ', cx + (r0a + 9) * Math.cos(s.phi / 2), cy - (r0a + 9) * Math.sin(s.phi / 2), { color: C.ink2, size: FS - 1, weight: 700 });
    }
    arrow(cx, cy, pR[0], pR[1], C.warn, 2.4, 9);
    if (Math.abs(net) * k > 3) arrow(pR[0], pR[1], pV[0], pV[1], net > 0 ? C.teal : C.violet, 2.2, 9);
    arrow(cx, cy, pV[0], pV[1], C.gold, 3, 10);
    rich([['v', 0], ['R', 1]], (cx + pR[0]) / 2, cy + (net >= 0 ? 13 : -13), { color: C.warn, size: FS - 1, weight: 700 });
    if (Math.abs(net) * k > 12) rich([['v', 0], ['L', 1], [' − ', 0], ['v', 0], ['C', 1]], pR[0] + 8, (cy + pV[1]) / 2, { color: net > 0 ? C.teal : C.violet, size: FS - 1.5, weight: 700, align: 'left' });
    rich([['v', 0]], (cx + pV[0]) / 2 - 8, (cy + pV[1]) / 2 + (net >= 0 ? -10 : 10), { color: C.gold, size: FS, weight: 750, align: 'right' });
    text('i →', cx + Rp + 12, cy + 12, { color: C.accent, size: FS - 1.5, weight: 700, align: 'right' });
    text(f < res.f0 * 0.995 ? 'below f₀: capacitive, i leads v' : f > res.f0 * 1.005 ? 'above f₀: inductive, i lags v' : 'at f₀: v and i in phase', pic.x + pic.w / 2, pic.y + 10, { color: C.ink2, size: FS - 1.5, weight: 600 });
    const yv = narrow ? pic.y + pic.h * 0.42 : pic.y + pic.h - 30, xv = narrow ? pic.x + pic.w * 0.78 : pic.x + pic.w / 2;
    rich([['v', 0], ['L', 1], [` = ${eng(s.VL, 'V')}`, 0]], xv, yv - 16, { color: C.teal, size: FS - 1, weight: 650 });
    rich([['v', 0], ['C', 1], [` = ${eng(s.VC, 'V')}`, 0]], xv, yv, { color: C.violet, size: FS - 1, weight: 650 });
    text(`(source amplitude ${given(V0, 'V')})`, xv, yv + 16, { color: C.ink3, size: FS - 2, weight: 500 });
    if (wantReadout()) {
      const rows = { f0: ['resonance $f_0$', tx(res.f0, 'Hz')], Q: ['quality factor $Q = \\omega_0L/R$', String(+res.Q.toPrecision(3))], df: ['bandwidth $\\Delta f = R/2\\pi L$', tx(res.df, 'Hz')], I: ['current amplitude $I_0$', tx(s.I0, 'A')], P: ['average power $P$', tx(s.Pavg, 'W')], pf: ['power factor $\\cos\\phi$', (+s.pf.toFixed(3)).toString()] };
      readout(rows, ['f0', 'Q', 'df', isP ? 'P' : 'I', 'pf']);
    }
  }

  // ── readout ──
  function wantReadout() { return P.readout ?? !compact; }
  function readout(rows, dflt) {
    const keys = P.readouts || dflt || Object.keys(rows);
    F.readout(keys.filter((k) => rows[k]).map((k) => rows[k]));
  }

  F.draw(draw);
  F.caption(CAPTION[mode](P));
  return { get: (k) => (k === 't' ? S.t : F.params[k]) };
}

const ALT = {
  coil: 'A coil carrying a changing current, with graphs of the current and of the emf it induces in itself',
  rl: 'A battery, a two-way switch, a resistor and an inductor in series, with graphs of the current and the voltages',
  lc: 'A charged capacitor connected across a coil, with graphs of charge and current and bars of stored energy',
  ac: 'Rotating phasors beside graphs of the source voltage and the current',
  resonance: 'The current in a series RLC circuit against the driving frequency, with the resonance peak',
};
const CAPTION = {
  coil: (P) => `An ideal coil (no resistance), so the voltage across it is its emf alone. The field lines inside are schematic: more of them means a stronger field. Real time${P.speed !== 1 ? ', slowed' : ''}.`,
  rl: () => 'Ideal battery, switch and wires; the coil’s own resistance is lumped into R. The moving dots show the current’s size and direction, not real drift speeds. Time is slowed down; the axis shows real time.',
  lc: (P) => `Ideal wires${P.R > 0 ? '' : ' and coil, no resistance'} and no radiation. Time is slowed down; the axis shows real time. ${P.analog ? 'The block on the spring is the mechanical twin, not part of the circuit: the same equation moves both.' : ''}`.trim(),
  ac: () => 'The steady state, long after the source was switched on. Slowed down: one cycle every few seconds, while the time axis shows real time. Voltage phasors are drawn to one scale and the current to its own; each phasor’s height is the value at that instant.',
  resonance: () => 'Steady-state amplitudes at each frequency, for ideal L and C with all resistance lumped into R. Phasors on the right are at the drive frequency, with the current as the reference.',
};

/** Node-side check used by the content tests. */
export function validate(P0) {
  const p = [];
  const mode = P0.mode ?? 'rl';
  if (!MODES.includes(mode)) { p.push(`mode must be one of ${MODES.join(', ')}`); return p; }
  const P = { ...MODE_DEFAULTS[mode], ...Object.fromEntries(Object.entries(P0).filter(([, v]) => v !== undefined && v !== null)) };
  const pos = (k) => { if (P[k] !== undefined && !(P[k] > 0)) p.push(`${k} must be positive`); };
  if (mode === 'coil') {
    ['L', 'Imax', 'tr'].forEach(pos); if (!(P.th >= 0)) p.push('th must be ≥ 0'); if (!['trapezoid', 'sine'].includes(P.wave)) p.push('wave must be trapezoid or sine');
    if (P.graphs && (!Array.isArray(P.graphs) || P.graphs.some((g) => !['I', 'emf'].includes(g)))) p.push('graphs is a list of I and emf');
  }
  if (mode === 'rl') {
    ['E', 'R', 'L'].forEach(pos); if (!['v', 'energy'].includes(P.panel)) p.push('panel must be v or energy');
    if (P.graphs && (!Array.isArray(P.graphs) || P.graphs.some((g) => !['i', 'v'].includes(g)))) p.push('graphs is a list of i and v');
  }
  if (mode === 'lc') {
    ['L', 'C', 'V0'].forEach(pos); if (!(P.R >= 0)) p.push('R must be ≥ 0');
    if (P.graphs && (!Array.isArray(P.graphs) || P.graphs.some((g) => !['q', 'i'].includes(g)))) p.push('graphs is a list of q and i');
  }
  if (mode === 'ac') {
    if (!ELEMENTS.includes(P.elements)) p.push(`elements must be one of ${ELEMENTS.join(', ')}`);
    ['f', 'V0'].forEach(pos);
    for (const k of ['R', 'L', 'C']) if ((P.elements || '').includes(k)) pos(k);
    for (const k of [...(P.phasors || []), ...(P.traces || [])]) if (!PHASOR_KEYS.includes(k)) p.push(`unknown phasor or trace “${k}” (use ${PHASOR_KEYS.join(' ')})`);
    if (P.elementChoice && P.elements.length !== 1) p.push('elementChoice needs a single starting element (R, L or C)');
  }
  if (mode === 'resonance') { ['R', 'L', 'C', 'f', 'V0'].forEach(pos); if (!['I', 'P'].includes(P.y)) p.push('y must be I or P'); }
  if (Array.isArray(P0.controls)) for (const k of P0.controls) if (!CONTROLS[mode].includes(k)) p.push(`${mode}: unknown control “${k}” (use ${CONTROLS[mode].join(', ')})`);
  if (Array.isArray(P0.readouts)) for (const k of P0.readouts) if (!READOUTS[mode].includes(k)) p.push(`${mode}: unknown readout “${k}” (use ${READOUTS[mode].join(', ')})`);
  for (const k of P0.hide || []) if (!HIDE.includes(k)) p.push(`hide: unknown “${k}” (use ${HIDE.join(', ')})`);
  for (const [k, r] of Object.entries(P0.ranges || {})) if (!Array.isArray(r) || !(r[0] < r[1])) p.push(`ranges.${k} must be [min, max]`);
  if (P0.t !== null && P0.t !== undefined && !(P0.t >= 0)) p.push('t must be ≥ 0');
  return p;
}
