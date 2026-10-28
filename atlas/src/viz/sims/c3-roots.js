// Characteristic roots and the motion they make, for the oscillator
// x″ + 2ζω₀x′ + ω₀²x = ω₀²X cos(ωt).
//
//   mode 'free'   — top: the complex plane, with the two roots of
//                   r² + 2ζω₀r + ω₀² = 0 and the path they follow as the
//                   damping ratio ζ changes (round the circle |r| = ω₀ while
//                   |ζ| < 1, then along the real axis); left of the imaginary
//                   axis motions decay, right of it they grow. Below: x(t)
//                   from x(0) = x0, x′(0) = v0, with its envelope ±Re^{−ζω₀t}.
//   mode 'forced' — top: the steady amplitude over the static deflection
//                   against ω/ω₀ (the resonance curve) for the current ζ,
//                   with fainter curves for other ζ and the drive marked.
//                   Below: x(t)/X from rest — transient plus steady state —
//                   with the steady part dashed.
//
//   { type: 'c3-roots', params: {
//       mode: 'free',           // or 'forced'
//       zeta: 0.2, w0: 2,       // damping ratio, natural angular frequency (rad/s)
//       x0: 1, v0: 0,           // free mode: starting position and velocity
//       W: 0.8,                 // forced mode: driving frequency over ω₀
//       T: 10,                  // the time window of x(t), s
//       sliders: true,          // ζ and ω₀ (free) or ζ and ω/ω₀ (forced); false: a still picture
//       zetaRange: [-0.3, 2.5], w0Range: [0.5, 4],
//       panels: 'both',         // 'both', 'top' (roots or resonance curve) or 'motion' (x(t) alone)
//       readout: true,          // false hides the numbers, so a problem does not print its answer
//       yname: 'x',             // the name of the unknown on the time plot's axis (y, θ, q …)
//       marks: true,            // forced: the drive point and the peak dot (false when a question asks for them)
//   } }
//
// The physics is model/c3-roots.js, tested headlessly in test/c3-roots.test.mjs.

import { Plot } from '../plot.js';
import * as M from '../model/c3-roots.js';

export const defaults = {
  mode: 'free', zeta: 0.2, w0: 2, x0: 1, v0: 0, W: 0.8, T: 10, sliders: true, zetaRange: null, w0Range: [0.5, 4], panels: 'both', readout: true, yname: 'x', marks: true,
};

const fmt = (v, d = 3) => (Number.isFinite(v) ? String(+v.toPrecision(d)) : '\\infty');

export function mount(F, P) {
  const forced = P.mode === 'forced';
  const showTop = P.panels !== 'motion', showMotion = P.panels !== 'top';
  const top = showTop ? F.canvas({ aspect: 'wide', label: forced ? 'The resonance curve: steady amplitude against driving frequency' : 'The complex plane with the two characteristic roots' }) : null;
  const bot = showMotion ? F.canvas({ aspect: 'wide', label: forced ? 'The motion from rest under a periodic drive' : 'The free motion x(t)' }) : null;
  const zr = P.zetaRange || (forced ? [0, 1.2] : [-0.3, 2.5]);
  if (P.sliders !== false) {
    F.slider({ key: 'zeta', label: 'Damping ratio $\\zeta$', min: zr[0], max: zr[1], step: 0.01, value: P.zeta, explain: '$\\zeta = c/(2\\sqrt{mk})$: below 1 the motion oscillates, at 1 it is critically damped, above 1 it creeps back. Negative means energy is fed in.' });
    if (forced) F.slider({ key: 'W', label: 'Driving frequency $\\omega/\\omega_0$', min: 0.1, max: 3, step: 0.01, value: P.W, explain: 'The drive’s angular frequency as a multiple of the natural one.' });
    else F.slider({ key: 'w0', label: 'Natural frequency $\\omega_0$', min: P.w0Range[0], max: P.w0Range[1], step: 0.05, value: P.w0, unit: '\\mathrm{rad/s}', explain: '$\\omega_0 = \\sqrt{k/m}$: it sets the radius of the circle the complex roots lie on.' });
  } else Object.assign(F.params, { zeta: P.zeta, w0: P.w0, W: P.W });
  if (forced && F.params.w0 === undefined) F.params.w0 = P.w0;
  const pTop = top && new Plot(top.canvas, forced ? { x: [0, 3], y: [0, 5], xlabel: 'ω/ω₀', ylabel: 'amplitude / static' } : { x: [-5, 2], y: [-2.5, 2.5], equal: true, xlabel: 'Re r (1/s)', ylabel: 'Im r (1/s)' });
  const pBot = bot && new Plot(bot.canvas, { x: [0, P.T], y: [-1.5, 1.5], xlabel: 't (s)', ylabel: forced ? `${P.yname} / X` : P.yname });
  F.onChange(() => draw());

  function draw() {
    const zeta = +F.params.zeta, w0 = +(F.params.w0 ?? P.w0), W = +(F.params.W ?? P.W);
    if (forced) drawForced(zeta, w0, W); else drawFree(zeta, w0);
  }

  function drawFree(zeta, w0) {
    const rts = M.roots(zeta, w0), kind = M.regime(zeta);
    if (pTop) {
      // frame the roots: the circle |r| = ω₀, and the outlying real root when overdamped
      const lo = Math.min(-1.25 * w0, ...rts.map((r) => r.re * 1.12)), hi = Math.max(0.55 * w0, ...rts.map((r) => r.re * 1.15 + 0.3));
      pTop.setView([lo, hi], [-1.3 * w0, 1.3 * w0]);
      pTop.clear();
      pTop.rect(0, pTop.vy0, pTop.vx1, pTop.vy1 - pTop.vy0, { fill: 'bad', alpha: 0.07, stroke: false });
      pTop.text('grows', pTop.vx1, pTop.vy1, { dx: -6, dy: 12, align: 'right', color: 'bad', size: 11.5 });
      pTop.text('decays', pTop.vx0, pTop.vy1, { dx: 6, dy: 12, color: 'good', size: 11.5 });
      pTop.circle(0, 0, w0, { color: 'ink3', width: 1.2, dash: [5, 5] });
      pTop.text('|r| = ω₀', w0 * Math.cos(2.4), w0 * Math.sin(2.4), { dx: -8, dy: -8, align: 'right', color: 'ink3', size: 11 });
      const same = Math.abs(rts[0].re - rts[1].re) < 1e-9 && Math.abs(rts[0].im - rts[1].im) < 1e-9;
      rts.forEach((r, k) => {
        if (same && k === 1) return;
        pTop.point(r.re, r.im, { color: 'accent', r: 6, label: same ? 'r₁ = r₂' : k ? 'r₂' : 'r₁', ldx: 9, ldy: r.im < 0 ? 12 : -10 });
      });
    }
    if (pBot) {
      const { x, R } = M.free(zeta, w0, P.x0, P.v0);
      // fit the motion, but let a growing one run off the top rather than shrink everything
      let big = Math.max(Math.abs(P.x0), 0.5);
      for (let k = 0; k <= 200; k++) { const v = Math.abs(x((P.T * k) / 200)); if (Number.isFinite(v)) big = Math.max(big, v); }
      const A = 1.15 * Math.min(big, 6 * Math.max(Math.abs(P.x0), 0.5));
      pBot.setView([0, P.T], [-A, A]);
      pBot.clear();
      if (R !== null && Math.abs(zeta) > M.EPS) {
        const env = (t) => R * Math.exp(-zeta * w0 * t);
        pBot.fn(env, { color: 'ink3', width: 1.2, dash: [5, 5] });
        pBot.fn((t) => -env(t), { color: 'ink3', width: 1.2, dash: [5, 5] });
      }
      pBot.fn(x, { color: 'accent', width: 2.4 });
    }
    if (P.readout === false) return;
    const complex = Math.abs(rts[0].im) > 1e-12, repeated = !complex && Math.abs(rts[0].re - rts[1].re) < 1e-12;
    const rows = [
      ['roots', complex ? `${fmt(rts[0].re)} \\pm ${fmt(rts[0].im)}\\,i` : repeated ? `${fmt(rts[0].re)}\\ (\\text{twice})` : `${fmt(rts[0].re)},\\ ${fmt(rts[1].re)}`],
      ['motion', `\\text{${kind}}`],
    ];
    if (complex) rows.push(['period $2\\pi/\\omega_d$', `${fmt(2 * Math.PI / rts[0].im)}\\,\\mathrm{s}`]);
    // the slowest exponential: e^{rt} with the root nearest the imaginary axis
    const slow = Math.max(rts[0].re, rts[1].re);
    if (Math.abs(slow) > 1e-9) rows.push([slow < 0 ? 'decay time' : 'growth time', `${fmt(1 / Math.abs(slow))}\\,\\mathrm{s}`]);
    F.readout(rows);
  }

  function drawForced(zeta, w0, W) {
    const pk = M.peak(zeta);
    const g = M.gain(W, zeta);
    if (pTop) {
      const cap = P.gainMax ?? 120;          // the gain axis follows the peak up to this
      const ymax = Math.min(cap, Math.max(3, 1.15 * (Number.isFinite(pk.M) ? pk.M : cap), 1.15 * g));
      pTop.setView([0, 3], [0, ymax]);
      pTop.clear();
      for (const z of [0.05, 0.1, 0.2, 0.4, 0.7, 1]) if (Math.abs(z - zeta) > 0.004) pTop.fn((u) => M.gain(u, z), { color: 'ink4', width: 1 });
      pTop.line(1, pTop.vy0, 1, pTop.vy1, { color: 'ink3', width: 1, dash: [5, 5] });
      pTop.fn((u) => M.gain(u, zeta), { color: 'accent', width: 2.6 });
      if (P.marks !== false && Number.isFinite(g)) pTop.point(W, Math.min(g, ymax), { color: 'gold', r: 5.5, label: 'drive', ldx: W > 2.4 ? -10 : 8, ldy: -12, lalign: W > 2.4 ? 'right' : 'left' });
      if (P.marks !== false && zeta > 0 && zeta < Math.SQRT1_2) pTop.point(pk.W, Math.min(pk.M, ymax), { color: 'bad', r: 3.5 });
    }
    if (pBot) {
      const { steady, x } = M.forced(zeta, w0, W);
      let A = 1.2;
      for (let k = 0; k <= 400; k++) { const v = Math.abs(x((P.T * k) / 400)); if (Number.isFinite(v)) A = Math.max(A, 1.12 * v); }
      pBot.setView([0, P.T], [-A, A]);
      pBot.clear();
      if (steady) pBot.fn(steady, { color: 'gold', width: 1.4, dash: [6, 5] });
      pBot.fn(x, { color: 'accent', width: 2.2 });
    }
    if (P.readout === false) return;
    const rows = [
      ['steady amplitude / static', Number.isFinite(g) ? fmt(g) : '\\infty'],
      ['phase lag', `${fmt(M.lag(W, zeta) * 180 / Math.PI)}^\\circ`],
    ];
    if (zeta > 0 && zeta < Math.SQRT1_2) rows.push(['peak', `${fmt(pk.M)}\\ \\text{at}\\ \\omega/\\omega_0 = ${fmt(pk.W)}`]);
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(forced
    ? 'Top: steady amplitude over the static deflection F₀/k against ω/ω₀ — blue for the current ζ, grey for ζ = 0.05, 0.1, 0.2, 0.4, 0.7 and 1; the red dot marks the peak. Bottom: the motion from rest (blue) settling onto the steady oscillation (gold, dashed). Linear spring and viscous damping.'
    : `Top: the two roots of r² + 2ζω₀r + ω₀² = 0 in the complex plane; while they are complex they sit on the dashed circle of radius ω₀. Bottom: ${P.yname}(t) starting from ${P.yname} = ${P.x0} with rate ${P.v0}, and, when it oscillates, the envelope $\\pm Re^{-\\zeta\\omega_0 t}$ dashed. Linear spring and viscous damping.`);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  if (!['free', 'forced'].includes(P.mode)) out.push("c3-roots: mode must be 'free' or 'forced'");
  for (const k of ['zeta', 'w0', 'x0', 'v0', 'W', 'T']) if (!Number.isFinite(P[k])) out.push(`c3-roots: ${k} must be a number`);
  if (!(P.w0 > 0)) out.push('c3-roots: w0 must be positive');
  if (!(P.T > 0)) out.push('c3-roots: T must be positive');
  if (!(P.W > 0)) out.push('c3-roots: W must be positive');
  if (!['both', 'top', 'motion'].includes(P.panels)) out.push("c3-roots: panels must be 'both', 'top' or 'motion'");
  const zr = P.zetaRange || (P.mode === 'forced' ? [0, 1.2] : [-0.3, 2.5]);
  if (P.sliders !== false && !(P.zeta >= zr[0] && P.zeta <= zr[1])) out.push('c3-roots: zeta must lie in its slider range');
  if (P.sliders !== false && P.mode === 'forced' && !(P.W >= 0.1 && P.W <= 3)) out.push('c3-roots: W must lie in [0.1, 3]');
  if (P.sliders !== false && P.mode !== 'forced' && !(P.w0 >= P.w0Range[0] && P.w0 <= P.w0Range[1])) out.push('c3-roots: w0 must lie in its slider range');
  return out;
}
