// Derivative Explorer: drag a point along a curve; the tangent line rides with
// it and a needle gauge shows its slope. Optional secant, rise-over-run
// triangle, the derivative curve, and concavity colouring.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../modules/types';
import type { Graphics } from '../engine/plot2d';
import { SERIES } from '../engine/colors';
import { parse, compile, derivative, toTeX, freeSymbols, NotDifferentiable, CONSTANTS, Node } from '../core/expr';
import { approach } from '../core/numeric/fidget';
import { fmt, tx, ping, frameLoop, rhs } from './common';

type F1 = (x: number) => number;

/** compile f, f′, f″ from typed text; throws a readable message */
export function compileFunction(src: string): { node: Node; f: F1; d1: F1; d2: F1; d1n: Node; d2n: Node } {
  const node = parse(rhs(src));
  const free = [...freeSymbols(node)].filter((s) => s !== 'x' && !(s in CONSTANTS));
  if (free.length) throw new Error(`“${free[0]}” has no value here — write f in terms of x only`);
  let d1n: Node, d2n: Node;
  try { d1n = derivative(node, 'x'); d2n = derivative(d1n, 'x'); }
  catch (e) { if (e instanceof NotDifferentiable) throw new Error('this function has no derivative formula here (floor, Γ, step functions …) — try a smooth one'); throw e; }
  const c = (n: Node) => { const g = compile(n, ['x']); const buf = [0]; return (x: number) => { buf[0] = x; return g(buf); }; };
  return { node, f: c(node), d1: c(d1n), d2: c(d2n), d1n, d2n };
}

/** a slope gauge in the top-left corner of the plot: a half dial from −∞ to ∞, needle at atan(m) */
export function drawGauge(g: Graphics, m: number, dark: boolean, title = 'slope') {
  const { x0, x1, y0, y1 } = g.view;
  const sx = (x1 - x0) / g.pxW, sy = (y1 - y0) / g.pxH;
  const R = 64, cxp = 22, cyp = 22 + R + 10;           // pixels from the top-left: a half dial, flat side left
  const P = (px: number, py: number): [number, number] => [x0 + px * sx, y1 - py * sy];
  const at = (phi: number, r: number) => P(cxp + r * Math.cos(phi), cyp - r * Math.sin(phi));
  // the half disc, angles −90° … 90° measured from the +x direction
  const disc: [number, number][] = [];
  for (let i = 0; i <= 48; i++) disc.push(at(-Math.PI / 2 + (Math.PI * i) / 48, R + 20));
  g.polygon([P(cxp - 10, cyp + R + 20), ...disc, P(cxp - 10, cyp - R - 20), P(cxp - 10, cyp + R + 40), P(cxp + R + 50, cyp + R + 40), P(cxp + R + 50, cyp + R + 20)], { fill: dark ? 'rgba(22,27,38,0.88)' : 'rgba(255,255,255,0.9)', color: dark ? '#2a3142' : '#d5d9e2', width: 1 });
  const ink = dark ? '#8b93a7' : '#5b6375';
  const rim: [number, number][] = [];
  for (let i = 0; i <= 48; i++) rim.push(at(-Math.PI / 2 + (Math.PI * i) / 48, R));
  g.path(rim, { color: ink, width: 1.2 });
  for (const t of [-5, -2, -1, -0.5, 0, 0.5, 1, 2, 5]) {
    const phi = Math.atan(t);
    g.line(at(phi, R - 6), at(phi, R), { color: ink, width: t === 0 ? 2 : 1.2 });
    if (Math.abs(t) < 5) g.text(at(phi, R + 9), t === 0.5 ? '½' : t === -0.5 ? '−½' : String(t).replace('-', '−'), { color: ink, font: '10px Inter, sans-serif', align: 'center', baseline: 'middle' });
  }
  g.text(at(Math.PI / 2, R + 9), '∞', { color: ink, font: '10px Inter, sans-serif', align: 'left', baseline: 'middle' }, 4, 0);
  g.text(at(-Math.PI / 2, R + 9), '−∞', { color: ink, font: '10px Inter, sans-serif', align: 'left', baseline: 'middle' }, 4, 0);
  if (Number.isFinite(m)) {
    const phi = Math.atan(m);
    const col = Math.abs(m) < 1e-3 ? (dark ? '#e6e9ef' : '#1b1f2a') : m > 0 ? SERIES[3] : SERIES[2];
    g.line(at(phi + Math.PI, 8), at(phi, R - 3), { color: col, width: 3 });
    g.point(P(cxp, cyp), 4, { fill: col });
  }
  g.text(P(cxp - 2, cyp + R + 24), title, { color: ink, font: '600 11px Inter, sans-serif', baseline: 'top' });
  g.text(P(cxp + R + 44, cyp + R + 23), Number.isFinite(m) ? fmt(m, 4) : '—', { color: dark ? '#e6e9ef' : '#1b1f2a', font: '600 12px JetBrains Mono, Consolas, monospace', align: 'right', baseline: 'top' });
}

function create(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'f(x)';
  let fn: ReturnType<typeof compileFunction> | null = null;
  let lastSrc = '';
  let shown = ctx.params.x0, target = ctx.params.x0;
  let lastSign = 0, flash = 0, flashAt: [number, number] = [0, 0];
  let dir = 1;

  const draw = (g: Graphics) => {
    if (!fn) return;
    const { f, d1, d2 } = fn;
    const x = shown, y = f(x), m = d1(x);
    const span = g.view.x1 - g.view.x0;
    if (ctx.toggles.deriv) g.fn(d1, { color: SERIES[3], width: 1.5, alpha: 0.55 });   // solid: a long dashed path is slow to stroke every frame
    if (ctx.toggles.concavity) {
      g.fn((t) => (d2(t) >= 0 ? f(t) : NaN), { color: SERIES[5], width: 2.8 });
      g.fn((t) => (d2(t) < 0 ? f(t) : NaN), { color: SERIES[6], width: 2.8 });
    } else g.fn(f, { color: SERIES[0], width: 2.8 });
    if (!Number.isFinite(y) || !Number.isFinite(m)) return;
    const tcol = Math.abs(m) < 1e-3 ? (ctx.dark ? '#e6e9ef' : '#1b1f2a') : m > 0 ? SERIES[3] : SERIES[2];
    // rise over run: one unit across, m units up
    if (ctx.toggles.triangle) {
      g.polygon([[x, y], [x + 1, y], [x + 1, y + m]], { fill: tcol, alpha: 0.12 });
      g.line([x, y], [x + 1, y], { color: tcol, width: 1.4, dash: [4, 3] });
      g.line([x + 1, y], [x + 1, y + m], { color: tcol, width: 1.4, dash: [4, 3] });
      g.text([x + 0.5, y], '1', { color: tcol, align: 'center', baseline: m >= 0 ? 'top' : 'bottom', font: '12px Inter, sans-serif' }, 0, m >= 0 ? 4 : -4);
      g.text([x + 1, y + m / 2], `m = ${fmt(m, 3)}`, { color: tcol, baseline: 'middle', font: '600 12px Inter, sans-serif' }, 6, 0);
    }
    if (ctx.toggles.secant) {
      const h = ctx.params.h, y2 = f(x + h);
      if (Number.isFinite(y2)) {
        const ms = (y2 - y) / h;
        g.line([x - span, y - ms * span], [x + span, y + ms * span], { color: SERIES[4], width: 1.6, alpha: 0.85 });
        g.point([x + h, y2], 4.5, { fill: SERIES[4] });
      }
    }
    // the tangent line, long enough to read
    g.line([x - span, y - m * span], [x + span, y + m * span], { color: tcol, width: 2.2 });
    if (ctx.toggles.deriv) { g.line([x, y], [x, m], { color: SERIES[3], width: 1, dash: [2, 4], alpha: 0.7 }); g.point([x, m], 4.5, { fill: SERIES[3] }); }
    if (flash > 0) {
      const r = 6 + (1 - flash) * 26;
      for (let k = 0; k < 3; k++) g.point(flashAt, r - k * 2, { fill: 'rgba(0,0,0,0)', color: '#f2c14e', width: 1.5, alpha: flash * (1 - k * 0.3) });
    }
    g.handle({ id: 'x0', at: [x, y], color: SERIES[1], r: 8, onDrag: ([px]) => { target = px; ctx.setParam('x0', +px.toFixed(4)); report(); }, constrain: ([px]) => [px, fn ? fn.f(px) : 0] });
    drawGauge(g, m, ctx.dark);
  };

  const report = () => {
    if (!fn) return;
    const x = target, y = fn.f(x), m = fn.d1(x), k = fn.d2(x);
    const rows: Readout[] = [
      { label: 'x₀', value: fmt(x, 5) },
      { label: 'f(x₀)', value: fmt(y, 6) },
      { label: 'f′(x₀)  slope', value: fmt(m, 6), tone: Math.abs(m) < 1e-3 ? 'good' : undefined },
      { label: 'f″(x₀)', value: fmt(k, 6), tone: k > 0 ? 'good' : k < 0 ? 'warn' : 'muted' },
      { label: 'tangent angle', value: Number.isFinite(m) ? `${fmt((Math.atan(m) * 180) / Math.PI, 4)}°` : '—' },
    ];
    if (ctx.toggles.secant) {
      const h = ctx.params.h, ms = (fn.f(x + h) - y) / h;
      rows.push({ label: `secant slope, h = ${fmt(h, 3)}`, value: fmt(ms, 6) }, { label: 'secant − tangent', value: fmt(ms - m, 3), tone: 'muted' });
    }
    rows.push({ label: 'f′(x)', value: toTeX(fn.d1n), tex: true });
    ctx.setReadouts(rows);
    ctx.setNote(Number.isFinite(y) && Number.isFinite(m)
      ? `Tangent at $x_0 = ${tx(x)}$: $\\;y = ${tx(y)} ${m < 0 ? '-' : '+'} ${tx(Math.abs(m))}\\,(x - ${tx(x)})$. ${Math.abs(m) < 1e-3 ? '**Flat tangent — a critical point.** ' : ''}The curve is concave ${k > 0 ? '**up** (the tangent lies below it)' : k < 0 ? '**down** (the tangent lies above it)' : 'neither way here'}.`
      : `f is not defined at $x_0 = ${tx(x)}$ — drag the point somewhere else.`);
    ctx.warn(Number.isFinite(y) ? '' : `f is undefined at x₀ = ${fmt(x)}`);
  };

  const update = () => {
    if (ctx.input !== lastSrc) {
      lastSrc = ctx.input;
      try { fn = compileFunction(ctx.input); ctx.warn(''); }
      catch (e) { ctx.warn(`Could not read f: ${(e as Error).message}`); }
    }
    if (Math.abs(ctx.params.x0 - target) > 1e-9) target = ctx.params.x0;
    report();
    plot.setDraw(draw);
  };

  let sinceParam = 0;
  const stop = frameLoop((dt) => {
    if (!fn) return;
    let changed = false;
    if (ctx.toggles.glide) {
      const { x0, x1 } = plot.view, margin = (x1 - x0) * 0.04;
      target += dir * ctx.params.speed * dt;
      if (target > x1 - margin) { target = x1 - margin; dir = -1; }
      if (target < x0 + margin) { target = x0 + margin; dir = 1; }
      sinceParam += dt;
      if (sinceParam > 0.08) { sinceParam = 0; ctx.setParam('x0', +target.toFixed(4)); report(); }
    }
    if (Math.abs(shown - target) > 1e-6) { shown = ctx.toggles.glide ? target : approach(shown, target, 20, dt); changed = true; }
    // a critical point passed: a soft tick and a ripple
    const m = fn.d1(shown), s = Math.sign(m);
    if (changed && s !== 0 && lastSign !== 0 && s !== lastSign) {
      flash = 1; flashAt = [shown, fn.f(shown)];
      ping(fn.d2(shown) < 0 ? 0.85 : 0.35);
    }
    if (s !== 0) lastSign = s;
    if (flash > 0) { flash = Math.max(0, flash - dt * 1.8); changed = true; }
    if (changed) plot.render();
  });

  return { update, dispose() { stop(); } };
}

export const derivativeExplorer: DemoDef = {
  id: 'fidget.derivative', module: 'fidget', title: 'Derivative Explorer', topic: 'Tangent lines, slope, the derivative as a function',
  summary: 'Slide a point along a curve: the tangent line rides along and a needle gauge swings with the slope. Peaks and valleys answer with a ripple.',
  tex: "f'(x_0) = \\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}",
  view: '2d',
  input: { label: 'f(x) =', value: 'f(x) = sin(2x) + x^2/8 - 1', placeholder: 'e.g. x^3 - 3x, exp(-x^2), sin(x)/x' },
  params: [
    { key: 'x0', label: 'x₀ (drag the point)', value: 0.6, min: -10, max: 10, step: 0.001 },
    { key: 'h', label: 'secant gap h', value: 1, min: -3, max: 3, step: 0.001 },
    { key: 'speed', label: 'glide speed', value: 0.8, min: 0.1, max: 3, step: 0.01 },
  ],
  toggles: [
    { key: 'triangle', label: 'Rise over run', value: true },
    { key: 'deriv', label: "Derivative curve f′", value: false },
    { key: 'secant', label: 'Secant line', value: false },
    { key: 'concavity', label: 'Colour by concavity', value: false },
    { key: 'glide', label: 'Glide along by itself', value: false },
  ],
  experiments: [
    'Drag the point over a hill: the needle swings through zero and the curve answers with a ripple.',
    'Turn on **f′** and glide: the green dot on the derivative curve is exactly the needle’s reading.',
    'Turn on the **secant** and shrink h toward 0 — the violet line falls onto the tangent. The gap shrinks like h.',
    'Colour by concavity: where the colour changes (an inflection point), the tangent crosses the curve.',
    'Try `abs(x)` near 0, or `x^(1/3)`: what does the needle do where the derivative fails to exist?',
  ],
  connections: ['fidget.taylor', 'fidget.flow'],
  accuracy: 'f′ and f″ are exact symbolic derivatives evaluated in floating point. The gauge needle is at angle atan(f′(x₀)); it is parallel to the tangent line only when both axes have the same scale. The point eases to where you drag it (a few hundredths of a second); the readouts show the exact values at the target.',
  create,
};
