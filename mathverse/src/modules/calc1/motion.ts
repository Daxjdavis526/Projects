// Motion on a line: position s(t), velocity v = s′ and acceleration a = s″
// from exact derivatives, a particle running along its worldline, and the
// difference between displacement and distance travelled.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { FxInput, fmt, fmtTeX, yRange, ink, muted, SERIES, FONT, SMALL, shortTeX, clamp, txt } from './common';
import { integrate } from '../../core/numeric/quad';
import { findRoots } from '../../core/numeric/roots';

function motionDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  const fin = new FxInput('t^3 - 6t^2 + 9t', 't');
  plot.opts.xLabel = 't'; plot.opts.yLabel = 's, v, a';
  plot2.opts.xLabel = 'position s'; plot2.opts.yLabel = 'time t';
  let lastKey = '';

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const s = fx.f, v = fx.D1, a = fx.D2;
    const T = ctx.params.T, t = clamp(ctx.params.t, 0, T);
    const key = `${fx.src}|${T}`;
    if (changed || key !== lastKey) {
      lastKey = key;
      const [lo, hi] = yRange([s, ctx.toggles.v ? v : s, ctx.toggles.a ? a : s], 0, T, { q: 0.02, pad: 0.15 });
      plot.setView({ x0: -0.06 * T, x1: T * 1.06, y0: lo, y1: hi });
      const [slo, shi] = yRange([s], 0, T, { q: 0, pad: 0.25, include0: false });
      plot2.setView({ x0: slo, x1: shi, y0: -0.12 * T, y1: T * 1.08 });
      fin.warn(ctx, '');
    }
    const st = s(t), vt = v(t), at = a(t);
    const turns = findRoots(v, 0, T, 600);
    const dist = integrate((u) => Math.abs(v(u)), 0, t, 1e-10);
    plot.setDraw((g) => {
      for (const r of turns) g.line([r, g.view.y0], [r, g.view.y1], { color: 'rgba(242,193,78,0.3)', width: 1, dash: [4, 4] });
      if (ctx.toggles.a) g.fn(a, { color: SERIES[2], width: 1.8, dash: [6, 4] }, [0, T]);
      if (ctx.toggles.v) g.fn(v, { color: SERIES[3], width: 2.2 }, [0, T]);
      g.fn(s, { color: SERIES[0], width: 2.8 }, [0, T]);
      g.line([t, g.view.y0], [t, g.view.y1], { color: muted(ctx), width: 1, dash: [2, 4] });
      if (ctx.toggles.v) { g.point([t, vt], 5, { fill: SERIES[3] }); const span = T * 0.1; g.line([t - span, st - vt * span], [t + span, st + vt * span], { color: SERIES[1], width: 2 }); }
      if (ctx.toggles.a) g.point([t, at], 5, { fill: SERIES[2] });
      g.handle({ id: 't', at: [t, st], color: SERIES[0], onDrag: ([px]) => { ctx.setParam('t', clamp(px, 0, T)); update(); }, constrain: ([px]) => [clamp(px, 0, T), s(clamp(px, 0, T))] });
      const legend: [string, string][] = [['s(t) position', SERIES[0]], ...(ctx.toggles.v ? [['v = s′ velocity', SERIES[3]] as [string, string]] : []), ...(ctx.toggles.a ? [['a = s″ acceleration', SERIES[2]] as [string, string]] : [])];
      legend.forEach(([label, col], i) => g.text([g.view.x1, g.view.y1], label, { color: txt(ctx, col), font: FONT, align: 'right', baseline: 'top' }, -12, 10 + i * 17));
    });
    plot2.setDraw((g) => {
      // the worldline: position across, time up
      g.parametric(s, (u) => u, 0, T, { color: SERIES[0], width: 1.4, alpha: 0.45 }, 600);
      g.parametric(s, (u) => u, 0, t, { color: SERIES[0], width: 2.8 }, 600);
      // stroboscope: equal time steps — crowded dots mean slow, spread dots fast
      for (let k = 0; k <= 40; k++) { const u = (T * k) / 40; if (u <= t) g.point([s(u), -0.06 * T], 2.6, { fill: SERIES[5], alpha: 0.5 + 0.5 * (u / Math.max(t, 1e-9)) }); }
      g.line([g.view.x0, -0.06 * T], [g.view.x1, -0.06 * T], { color: muted(ctx), width: 1 });
      const W = g.view.x1 - g.view.x0, k = (0.12 * W) / Math.max(1e-9, Math.max(Math.abs(vt), 1));
      if (ctx.toggles.v && Math.abs(vt) > 1e-9) g.arrow([st, t + 0.025 * T], [st + vt * k, t + 0.025 * T], { color: SERIES[3], width: 2.5 });
      if (ctx.toggles.a && Math.abs(at) > 1e-9) g.arrow([st, t - 0.025 * T], [st + clamp(at * k, -0.3 * W, 0.3 * W), t - 0.025 * T], { color: SERIES[2], width: 2.5 });
      g.point([st, t], 7, { fill: ink(ctx), color: SERIES[0], width: 2 });
      g.point([st, -0.06 * T], 7, { fill: SERIES[1] });
      g.text([g.view.x1, g.view.y1], 'worldline (s, t); dots below: equal time steps', { color: muted(ctx), font: SMALL, align: 'right', baseline: 'top' }, -12, 50);
    });
    const speeding = vt * at > 0 ? 'speeding up (v and a same sign)' : vt * at < 0 ? 'slowing down (v and a opposite)' : 'neither (v or a is zero)';
    ctx.setReadouts([
      { label: 't', value: fmt(t, 5) },
      { label: 'position s(t)', value: fmt(st, 8) },
      { label: `velocity v = s′(t)${fx.exact1 ? '' : ' (numerical)'}`, value: fmt(vt, 8), tone: vt > 0 ? 'good' : vt < 0 ? 'bad' : 'muted' },
      { label: `acceleration a = s″(t)${fx.exact2 ? '' : ' (numerical)'}`, value: fmt(at, 8) },
      { label: 'speed |v|', value: fmt(Math.abs(vt), 6) },
      { label: 'motion', value: `${vt > 0 ? 'forward' : vt < 0 ? 'backward' : 'at rest'}, ${speeding}` },
      { label: 'displacement s(t) − s(0)', value: fmt(st - s(0), 8) },
      { label: 'distance travelled ∫₀ᵗ |v| dt (numerical)', value: `${fmt(dist.value, 8)} ± ${dist.error.toExponential(0)}` },
      { label: 'turning points (v = 0)', value: turns.length ? turns.map((r) => fmt(r, 4)).join(', ') : 'none' },
      ...(shortTeX(fx.d1) ? [{ label: 'v(t)', value: shortTeX(fx.d1)!, tex: true }] : []),
      ...(shortTeX(fx.d2) ? [{ label: 'a(t)', value: shortTeX(fx.d2)!, tex: true }] : []),
    ]);
    ctx.setNote(`Velocity is the slope of the position graph, $v = \\tfrac{ds}{dt}$, and acceleration is the slope of the velocity graph, $a = \\tfrac{dv}{dt} = \\tfrac{d^2s}{dt^2}$. Now: $v = ${fmtTeX(vt, 4)}$, $a = ${fmtTeX(at, 4)}$. The particle turns around where $v = 0$ (gold guides). It speeds up when $v$ and $a$ have the same sign and slows down when they differ. Displacement $\\int v\\,dt$ can be smaller than the distance travelled $\\int |v|\\,dt$: going back cancels going forward.`);
  };
  return {
    update,
    tick(dt) { let t = ctx.params.t + dt * 0.6; if (t > ctx.params.T) t = 0; ctx.setParam('t', t); update(); },
    reset() { ctx.setParam('t', 0); },
    csv() { const fx = fin.cur!, T = ctx.params.T, rows = ['t,s,v,a']; for (let i = 0; i <= 400; i++) { const u = (T * i) / 400; rows.push(`${u},${fx.f(u)},${fx.D1(u)},${fx.D2(u)}`); } return rows.join('\n'); },
    dispose() {},
  };
}

export const motionDemos: DemoDef[] = [
  {
    id: 'calc1.motion', module: 'calc1', title: 'Position, velocity, acceleration',
    topic: 'Derivatives in physics · velocity and acceleration · speeding up and slowing down · displacement vs distance',
    summary: 'Type a position s(t) and watch a particle move. Its velocity and acceleration are the first and second derivatives, drawn on the same time axis and as arrows on the particle’s worldline.',
    tex: "v(t) = \\frac{ds}{dt},\\qquad a(t) = \\frac{dv}{dt} = \\frac{d^2 s}{dt^2}",
    view: 'split2d', animated: true,
    input: { label: 's(t) =', value: 't^3 - 6t^2 + 9t', placeholder: 'e.g. 5 - 4.9t^2, sin(2t), t e^(-t)' },
    params: [
      { key: 't', label: 't (drag, or play)', value: 0.5, min: 0, max: 20, step: 0.01 },
      { key: 'T', label: 'time window T', value: 4.5, min: 0.5, max: 20, step: 0.1 },
    ],
    toggles: [{ key: 'v', label: 'Velocity', value: true }, { key: 'a', label: 'Acceleration', value: true }],
    experiments: [
      'Press play. The particle stops and reverses at t = 1 and t = 3, exactly where v crosses zero.',
      'Between t = 1 and t = 2 the particle moves backward but slows down; from t = 2 to 3 it moves backward and speeds up — a changes sign at t = 2.',
      'Compare displacement and distance travelled at t = 4: the particle has come back to s = 4 but has travelled 12.',
      'Type 20t - 4.9t^2 (a ball thrown up): a constant acceleration of −9.8, and v = 0 at the top.',
      'Type sin(2t): simple harmonic motion — the acceleration is always −4 times the position.',
    ],
    connections: ['calc1.secant', 'calc1.shape', 'calc1.accumulate', 'calc1.ftc'],
    accuracy: 'v and a are exact symbolic derivatives of s. Turning points are roots of v (Brent’s method); the distance travelled ∫|v| dt is adaptive quadrature with its error estimate.',
    create: motionDemo,
  },
];
