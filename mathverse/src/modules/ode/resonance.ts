// Forced oscillations and resonance: the transient and the steady state of a
// driven, damped oscillator, beside the amplitude–frequency (or phase)
// response curve with the driving frequency draggable along it.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveLinear2, response, resonantFrequency } from '../../core/numeric/dynamics';
import { fmt, tx, pal, csvOf, P, label, loopTime, changed } from './common';

const ZETAS = [0.05, 0.1, 0.2, 0.35, 0.5, 0.707, 1];

export const resonance: DemoDef = {
  id: 'ode.resonance', module: 'ode', title: 'Forced oscillations and resonance',
  topic: 'Forced oscillations · resonance · amplitude and phase response · beats · Q factor',
  summary: 'Drive a damped oscillator at frequency ω. After the transient dies, it oscillates at ω with an amplitude and phase lag set by ω/ω₀ and ζ. Drag ω along the response curve and watch the motion change.',
  tex: "x'' + 2\\zeta\\omega_0 x' + \\omega_0^2 x = F\\cos\\omega t",
  view: 'split2d', animated: true,
  params: [
    { key: 'w0', label: 'natural frequency ω₀', value: 2, min: 0.5, max: 4, step: 0.01 },
    { key: 'zeta', label: 'damping ratio ζ', value: 0.1, min: 0, max: 1.2, step: 0.005 },
    { key: 'F', label: 'force per unit mass F', value: 1, min: 0.1, max: 3, step: 0.01 },
    { key: 'w', label: 'driving frequency ω', value: 1.2, min: 0.05, max: 6, step: 0.005 },
    { key: 'x0', label: 'x(0)', value: 0, min: -2, max: 2, step: 0.01 },
    { key: 'v0', label: "x′(0)", value: 0, min: -4, max: 4, step: 0.01 },
    { key: 'T', label: 'time window T', value: 40, min: 10, max: 120, step: 1 },
  ],
  choices: [{ key: 'curve', label: 'Response curve', value: 'amp', options: [['amp', 'Amplitude A(ω)'], ['phase', 'Phase lag φ(ω)']] }],
  toggles: [{ key: 'family', label: 'Curves for other ζ', value: true }, { key: 'steady', label: 'Steady state x_p (dashed)', value: true }],
  experiments: [
    'Drag the gold point along the response curve. On the left, the steady-state amplitude (dashed band) follows the curve’s height.',
    'Below resonance the mass moves with the force (lag ≈ 0); far above, against it (lag ≈ π). At ω = ω₀ the lag is exactly π/2 whatever ζ is.',
    'Halve ζ: the peak doubles (≈ 1/2ζ in units of F/ω₀²) and narrows; the transient takes twice as long to die.',
    'Set ζ = 0 and ω = ω₀ exactly: no steady state exists — the amplitude grows like t (pure resonance).',
    'Set ζ = 0 and ω slightly off ω₀: beats, an oscillation inside a slow envelope of frequency |ω − ω₀|/2.',
  ],
  connections: ['ode.spring', 'ode.nonhomog', 'ode.charroots'],
  accuracy: 'Exact: the response A = F/√((ω₀² − ω²)² + (2ζω₀ω)²) and φ = atan2(2ζω₀ω, ω₀² − ω²); the time solution is the closed form (particular + homogeneous, including the resonant t·sin case). The half-power points are solved exactly from a quadratic in ω².',
  tutorial: [
    { text: 'A periodic force puts energy in; damping takes it out. After the **transient** (the homogeneous solution, which decays like $e^{-\\zeta\\omega_0 t}$) only the **steady state** remains: $x_p = A\\cos(\\omega t - \\varphi)$, at the driving frequency, with\n$$A(\\omega) = \\frac{F}{\\sqrt{(\\omega_0^2-\\omega^2)^2 + (2\\zeta\\omega_0\\omega)^2}}.$$', task: 'Drag the gold point on the curve to the peak (ω near ω₀ = 2).', set: { params: { w0: 2, zeta: 0.1, F: 1, w: 0.8, x0: 0, v0: 0 }, choices: { curve: 'amp' } }, done: (c) => Math.abs(c.params.w - c.params.w0) < 0.08 },
    { text: 'The response also **lags** the force by $\\varphi(\\omega) = \\operatorname{atan2}(2\\zeta\\omega_0\\omega,\\ \\omega_0^2 - \\omega^2)$: about $0$ for slow driving (the spring just follows), exactly $\\pi/2$ at $\\omega = \\omega_0$ (the force is in phase with the **velocity**, so it does the most work), about $\\pi$ for fast driving (inertia wins).', task: 'Switch the curve to the phase lag.', done: (c) => c.choices.curve === 'phase' },
    { text: 'Smaller damping makes a taller, narrower peak: $A_{max} \\approx F/(2\\zeta\\omega_0^2)$ and width $\\Delta\\omega \\approx 2\\zeta\\omega_0$. Their ratio is the **quality factor** $Q = 1/2\\zeta$. A quartz crystal has $Q \\sim 10^5$; that is why it keeps time.', task: 'Lower ζ below 0.05 and watch the peak and the transient.', set: { choices: { curve: 'amp' }, params: { zeta: 0.15, w: 2 } }, done: (c) => c.params.zeta < 0.05 },
    { text: 'With **no damping** and $\\omega = \\omega_0$ there is no steady state. The trial solution $P\\cos\\omega t + Q\\sin\\omega t$ solves the homogeneous equation, so undetermined coefficients gives $x_p = \\frac{F}{2\\omega_0}\\,t\\sin\\omega_0 t$: the amplitude grows linearly forever (until the model breaks).', task: 'Look at the left plot: the envelope is a straight line.', set: { params: { zeta: 0, w: 2, w0: 2, x0: 0, v0: 0 } }, done: (c) => c.params.zeta === 0 },
    { text: 'Undamped and slightly off resonance you get **beats**: $\\cos\\omega t - \\cos\\omega_0 t = -2\\sin\\frac{(\\omega-\\omega_0)t}{2}\\sin\\frac{(\\omega+\\omega_0)t}{2}$ — a fast oscillation inside a slow envelope. Musicians tune by listening for them to slow down.', task: 'Set ω a little away from ω₀ (by 0.1 to 0.3).', set: { params: { zeta: 0, w: 2.2, T: 80 } }, done: (c) => c.params.zeta === 0 && Math.abs(c.params.w - c.params.w0) > 0.05 && Math.abs(c.params.w - c.params.w0) < 0.35 },
    { text: 'For $\\zeta > 1/\\sqrt 2$ the peak disappears: the amplitude falls monotonically from $F/\\omega_0^2$. Engineers design shock absorbers and building dampers here. (The Tacoma Narrows bridge, often quoted as resonance, was really aeroelastic flutter — a self-excited oscillation, closer to the van der Pol demo.)', task: 'Raise ζ above 0.71 and watch the peak vanish.', set: { params: { zeta: 0.4, T: 40 } }, done: (c) => c.params.zeta > 0.71 },
  ],
  create: (ctx) => resInst(ctx),
};

function resInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, rp = ctx.plot2!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'x';
  rp.opts.xLabel = 'ω';
  const reframe = changed();
  let X: (t: number) => number = () => 0, XP: (t: number) => number = () => 0;
  let tl = 0;

  function update() {
    const { w0, zeta, F, w, x0, v0, T } = ctx.params;
    const P = pal(ctx);
    const sol = solveLinear2(2 * zeta * w0, w0 * w0, { kind: 'cos', A: F, w }, x0, v0);
    X = sol.y; XP = sol.yp;
    const { amp, phase } = response(w0, zeta, F, w);
    const resonant = zeta === 0 && Math.abs(w - w0) < 1e-12;
    const xs = Array.from({ length: 801 }, (_, i) => { const t = (T * i) / 800; return [t, X(t)] as P; });
    const ymax = Math.max(0.5, ...xs.map((p) => Math.abs(p[1])));
    plot.setView({ x0: -T * 0.03, x1: T * 1.02, y0: -ymax * 1.15, y1: ymax * 1.15 });
    plot.setDraw((g) => {
      if (ctx.toggles.steady && Number.isFinite(amp) && !resonant) {
        g.polygon([[0, -amp], [T, -amp], [T, amp], [0, amp]], { fill: P.fill(P.green, 0.07) });
        g.fn(XP, { color: P.green, width: 1.6, dash: [6, 5] }, [0, T]);
      }
      if (resonant) { const k = F / (2 * w0); g.fn((t) => k * t, { color: P.red, width: 1.3, dash: [3, 4] }, [0, T]); g.fn((t) => -k * t, { color: P.red, width: 1.3, dash: [3, 4] }, [0, T]); }
      g.path(xs, { color: P.blue, width: 1.5, alpha: 0.45 });
      const n = Math.max(2, Math.floor((tl / T) * 800) + 1);
      g.path(xs.slice(0, n).concat([[tl, X(tl)]]), { color: P.blue, width: 2.6 });
      g.point([tl, X(tl)], 5.5, { fill: P.orange });
      g.text([g.view.x0, g.view.y1], resonant ? 'pure resonance: x_p = (F/2ω₀) t sin ω₀t' : 'green band: steady-state amplitude A(ω)', { color: resonant ? P.red : P.green, font: '12px Inter, sans-serif', baseline: 'top' }, 44, 8);
    });
    // the response curve
    const wr = resonantFrequency(w0, zeta);
    const Astatic = F / (w0 * w0);
    const cap = Astatic * 12;
    const isAmp = (ctx.choices.curve ?? 'amp') === 'amp';
    rp.opts.yLabel = isAmp ? 'amplitude A' : 'phase lag φ (rad)';
    const W1 = 6;
    if (reframe(`${ctx.choices.curve}|${w0}|${F}`) || isAmp) rp.setView(isAmp ? { x0: -0.2, x1: W1 + 0.1, y0: -cap * 0.05, y1: cap * 1.05 } : { x0: -0.2, x1: W1 + 0.1, y0: -0.25, y1: Math.PI + 0.35 });
    const curveY = (z: number) => (om: number) => { const r = response(w0, z, F, om); return isAmp ? Math.min(r.amp, cap * 2) : r.phase; };
    // half-power (−3 dB) points, exactly
    let band: [number, number] | null = null;
    if (zeta > 0 && zeta < Math.SQRT1_2) {
      const Dmin = 4 * zeta * zeta * w0 ** 4 * (1 - zeta * zeta);
      const a = w0 * w0 * (1 - 2 * zeta * zeta), disc = a * a - w0 ** 4 + 2 * Dmin;
      if (disc >= 0) { const u1 = a - Math.sqrt(disc), u2 = a + Math.sqrt(disc); band = [u1 > 0 ? Math.sqrt(u1) : 0, Math.sqrt(u2)]; }
    }
    rp.setDraw((g) => {
      if (ctx.toggles.family) for (const z of ZETAS) if (Math.abs(z - zeta) > 0.01) { g.fn(curveY(z), { color: P.faint, width: 1.2 }, [0.001, W1]); }
      if (ctx.toggles.family && isAmp) label(g, [w0, Math.min(response(w0, 0.05, F, w0).amp, cap) ], 'ζ = 0.05', P.muted, { dx: 6, dy: 8, size: 11 });
      g.line([w0, g.view.y0], [w0, g.view.y1], { color: P.muted, width: 1, dash: [4, 4] });
      label(g, [w0, g.view.y1], 'ω₀', P.muted, { dx: 4, dy: 10 });
      if (isAmp && band) { const [l, r] = band; const h = response(w0, zeta, F, wr).amp / Math.SQRT2; g.line([l, h], [r, h], { color: P.violet, width: 2 }); label(g, [r, h], `Δω = ${fmt(r - l, 3)}`, P.violet, { dx: 6, size: 11 }); }
      if (!isAmp) { g.line([g.view.x0, Math.PI / 2], [W1, Math.PI / 2], { color: P.muted, width: 1, dash: [2, 5] }); label(g, [W1, Math.PI / 2], 'π/2', P.muted, { align: 'right', dy: -9 }); g.line([g.view.x0, Math.PI], [W1, Math.PI], { color: P.muted, width: 1, dash: [2, 5] }); label(g, [W1, Math.PI], 'π', P.muted, { align: 'right', dy: -9 }); }
      g.fn(curveY(zeta), { color: P.blue, width: 3 }, [0.001, W1]);
      const hy = isAmp ? Math.min(amp, cap) : phase;
      g.handle({ id: 'w', at: [w, Number.isFinite(hy) ? hy : cap], color: P.gold, label: `ω = ${fmt(w, 3)}`, constrain: ([om]) => { const o = Math.max(0.05, Math.min(W1, om)); return [o, curveY(zeta)(o)]; }, onDrag: ([om]) => { ctx.setParam('w', Math.max(0.05, Math.min(W1, om))); update(); } });
    });
    const rows: Readout[] = [
      { label: 'ω / ω₀', value: fmt(w / w0) },
      { label: 'steady-state amplitude A', value: resonant ? '∞ (grows like t)' : fmt(amp), tone: resonant ? 'bad' : undefined },
      { label: 'gain A / (F/ω₀²)', value: resonant ? '∞' : fmt(amp / Astatic) },
      { label: 'phase lag φ', value: `${fmt(phase)} rad  (${fmt((phase * 180) / Math.PI, 3)}°)` },
      { label: 'peak at ω_r = ω₀√(1 − 2ζ²)', value: wr > 0 ? fmt(wr) : 'no peak (ζ ≥ 1/√2)' },
    ];
    if (wr > 0) rows.push({ label: 'peak amplitude', value: zeta > 0 ? fmt(response(w0, zeta, F, wr).amp) : '∞' });
    if (band) rows.push({ label: 'half-power bandwidth Δω', value: fmt(band[1] - band[0]) }, { label: 'quality factor Q = 1/(2ζ)', value: fmt(1 / (2 * zeta)) });
    if (zeta > 0) rows.push({ label: 'transient decays like', value: `e^(−t/${fmt(1 / (zeta * w0), 3)})` });
    ctx.setReadouts(rows);
    ctx.warn(resonant ? 'Undamped resonance: the amplitude grows without bound. Real systems have some damping — or break.' : '');
    ctx.setNote(resonant
      ? `Pure resonance: $x_p = \\frac{F}{2\\omega_0}\\,t\\sin\\omega_0 t$.`
      : `Steady state $x_p = ${tx(amp)}\\cos(${tx(w)}t - ${tx(phase)})$. ${zeta > 0 ? `The transient dies in a few multiples of $1/\\zeta\\omega_0 = ${tx(1 / (zeta * w0))}$.` : 'Without damping the transient never dies.'} The same curve describes an **RLC circuit** (a radio tuner selects the station at its peak), a child on a swing, and the response of atoms to light near an absorption line.`);
  }
  return {
    update,
    tick() { tl = loopTime(ctx.time.t, ctx.params.T); plot.render(); },
    reset() { tl = 0; },
    csv() {
      const { T, w0, zeta, F } = ctx.params;
      const rows = Array.from({ length: 1001 }, (_, i) => { const t = (T * i) / 1000; return [t, X(t), XP(t)]; });
      const resp = Array.from({ length: 301 }, (_, i) => { const om = (6 * i) / 300; const r = response(w0, zeta, F, om); return [om, r.amp, r.phase]; });
      return csvOf(['t', 'x(t)', 'x_p(t)'], rows) + '\n\n' + csvOf(['omega', 'amplitude', 'phase lag'], resp);
    },
    dispose() {},
  };
}
