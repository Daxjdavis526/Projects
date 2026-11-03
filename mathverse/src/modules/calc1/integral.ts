// The integral: Riemann sums you can build by hand (and their error against
// n), the accumulation function A(x) = ∫ₐˣ f traced live with A′ = f made
// visible, and the Fundamental Theorem with the whole family F + C.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { Node, toTeX } from '../../core/expr';
import { compile } from '../../core/expr';
import { FxInput, singularity, fmt, fmtTeX, yRange, ink, muted, SERIES, FONT, SMALL, clamp, txt } from './common';
import { integrate, riemann } from '../../core/numeric/quad';
import { cumulativeIntegral, sampleCumulative, partitionSum, uniformPartition, Tag, Cumulative } from '../../core/numeric/accumulation';
import { integrateSymbolic, cas } from '../../cas/client';

const POS = 'rgba(106,169,255,0.32)', NEG = 'rgba(239,107,115,0.32)';

/** Signed area between f and the axis, blue above and red below. */
function signedArea(g: Graphics, f: (x: number) => number, a: number, b: number) {
  if (a === b) return;
  const lo = Math.min(a, b), hi = Math.max(a, b);
  g.fillBetween((x) => Math.max(f(x), 0), () => 0, lo, hi, { fill: POS });
  g.fillBetween((x) => Math.min(f(x), 0), () => 0, lo, hi, { fill: NEG });
}

// ── Riemann sums ───────────────────────────────────────────────────────────
const NS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024];
const RULES: ['left' | 'right' | 'mid' | 'trap', string][] = [['left', SERIES[2]], ['right', SERIES[6]], ['mid', SERIES[3]], ['trap', SERIES[4]]];

function riemannDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  const fin = new FxInput('x^2/4 + sin(2x)/2 + 1');
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot2.opts.xLabel = 'log₁₀ n'; plot2.opts.yLabel = 'log₁₀ |error|';
  let pts: number[] = [], mode = '', lastAB = '', errKey = '';
  let curves: { rule: string; color: string; pts: [number, number][] }[] = [];
  let ref = integrate(Math.sin, 0, 1), sing: number | null = null;

  const ab = () => { const a = ctx.params.a, b = ctx.params.b; return a <= b ? [a, b] : [b, a]; };

  plot.onClick = ([px]) => {
    if (ctx.choices.partition !== 'custom') return;
    const [a, b] = ab();
    if (px <= a || px >= b) return;
    const tolX = 9 / plot.canvas.clientWidth * (plot.view.x1 - plot.view.x0);
    const near = pts.findIndex((p, i) => i > 0 && i < pts.length - 1 && Math.abs(p - px) < tolX);
    if (near >= 0) pts.splice(near, 1);
    else { pts.push(px); pts.sort((p, q) => p - q); }
    update();
  };

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const f = fx.f;
    const [a, b] = ab();
    const n = Math.max(1, Math.round(ctx.params.n));
    const tag = ctx.choices.rule as Tag, custom = ctx.choices.partition === 'custom';
    if (changed) {
      const L = Math.max(b - a, 0.5), [lo, hi] = yRange([f], a - 0.3 * L, b + 0.3 * L, { q: 0.02, pad: 0.25 });
      plot.setView({ x0: a - 0.3 * L, x1: b + 0.3 * L, y0: Math.min(lo, -0.1 * (hi - lo)), y1: hi });
      fin.warn(ctx, '');
    }
    // the custom partition starts from the uniform one and follows a and b
    const abKey = `${a}|${b}`;
    if (custom && (mode !== 'custom' || pts.length < 2)) pts = uniformPartition(a, b, n);
    else if (custom && abKey !== lastAB && pts.length >= 2) { const a0 = pts[0], b0 = pts[pts.length - 1]; pts = pts.map((p) => a + ((p - a0) * (b - a)) / (b0 - a0 || 1)); }
    mode = ctx.choices.partition; lastAB = abKey;
    const P = custom ? pts : uniformPartition(a, b, n);
    const sum = partitionSum(f, P, tag);
    const lower = partitionSum(f, P, 'lower').sum, upper = partitionSum(f, P, 'upper').sum;
    const mesh = Math.max(...P.slice(1).map((p, i) => p - P[i]));
    const key = `${fx.src}|${a}|${b}`;
    if (key !== errKey) {
      errKey = key;
      sing = singularity(f, a, b);
      ref = integrate(f, a, b, 1e-12);
      // errors at rounding level (≲ 1e−13 relative) carry no information and are left out
      const floor = 1e-13 * (1 + Math.abs(ref.value));
      curves = RULES.map(([rule, color]) => ({ rule, color, pts: NS.map((k) => [Math.log10(k), Math.abs(riemann(f, a, b, k, rule) - ref.value)] as [number, number]).filter((p) => p[1] > floor).map(([x, e]) => [x, Math.log10(e)] as [number, number]) }));
      const ys = curves.flatMap((c) => c.pts.map((p) => p[1]));
      if (!ys.length) ys.push(-13, 0);
      plot2.setView({ x0: -0.25, x1: 3.25, y0: Math.max(-16.5, Math.min(...ys) - 0.6), y1: Math.max(...ys) + 0.8 });
    }
    const err = sum.sum - ref.value;
    plot.setDraw((g) => {
      for (const r of sum.rects) {
        if (tag === 'trap') {
          if (!Number.isFinite(r.h0) || !Number.isFinite(r.h1)) continue;
          g.polygon([[r.x0, 0], [r.x1, 0], [r.x1, r.h1], [r.x0, r.h0]], { fill: (r.h0 + r.h1) >= 0 ? POS : NEG, color: SERIES[4], width: 1.2 });
        } else {
          if (!Number.isFinite(r.h)) continue;
          g.polygon([[r.x0, 0], [r.x1, 0], [r.x1, r.h], [r.x0, r.h]], { fill: r.h >= 0 ? POS : NEG, color: r.h >= 0 ? SERIES[0] : SERIES[2], width: 1.2 });
          if (Number.isFinite(r.tag) && (r.x1 - r.x0) * g.ppx > 5) g.point([r.tag, r.h], 3.2, { fill: SERIES[1] });
        }
      }
      g.fn(f, { color: ink(ctx), width: 2.4 });
      g.handle({ id: 'a', at: [a, 0], color: SERIES[1], label: 'a', onDrag: ([px]) => { ctx.setParam('a', px); update(); }, constrain: ([px]) => [px, 0] });
      g.handle({ id: 'b', at: [b, 0], color: SERIES[1], label: 'b', onDrag: ([px]) => { ctx.setParam('b', px); update(); }, constrain: ([px]) => [px, 0] });
      if (custom) {
        for (let i = 1; i < pts.length - 1; i++) {
          const k = i;
          g.handle({ id: `p${k}`, at: [pts[k], 0], r: 5, color: SERIES[5], onDrag: ([px]) => { pts[k] = clamp(px, pts[k - 1] + 1e-6, pts[k + 1] - 1e-6); update(); }, constrain: ([px]) => [px, 0] });
        }
        g.text([g.view.x0, g.view.y0], 'click to add a divider · click a divider to remove it · drag to resize', { color: muted(ctx), font: SMALL, baseline: 'bottom' }, 12, -10);
      }
    });
    plot2.setDraw((g) => {
      // reference slopes: errors ∝ 1/n and ∝ 1/n² are straight lines of slope −1 and −2
      const y0 = curves[0]?.pts[0]?.[1] ?? 0;
      for (const [slope, label] of [[-1, '∝ 1/n'], [-2, '∝ 1/n²']] as const) {
        const yy = (y0 + 0.4) + slope * 3;
        g.line([0, y0 + 0.4], [3, yy], { color: muted(ctx), width: 1, dash: [3, 5] });
        g.text([3, yy], label, { color: muted(ctx), font: SMALL, align: 'right', baseline: 'bottom' }, -2, -4);
      }
      for (const c of curves) { g.path(c.pts, { color: c.color, width: c.rule === tag ? 3 : 1.6, alpha: c.rule === tag || tag === 'lower' || tag === 'upper' ? 1 : 0.55 }); c.pts.forEach((p) => g.point(p, 2.2, { fill: c.color })); }
      const cnt = P.length - 1, e = Math.log10(Math.max(1e-16, Math.abs(err)));
      if (Number.isFinite(e)) g.point([Math.log10(cnt), e], 6.5, { fill: ink(ctx), color: SERIES[1], width: 2 });
      RULES.forEach(([rule, color], i) => g.text([g.view.x1, g.view.y0], rule === 'mid' ? 'midpoint' : rule === 'trap' ? 'trapezoid' : rule, { color, font: FONT, align: 'right', baseline: 'bottom' }, -12, -10 - (3 - i) * 17));
      g.text([g.view.x0, g.view.y0], 'uniform partitions; white dot = yours', { color: muted(ctx), font: SMALL, baseline: 'bottom' }, 10, -10);
    });
    const rows: Readout[] = [
      { label: `${tagName(tag)} sum, ${P.length - 1} pieces`, value: fmt(sum.sum, 10) },
      { label: 'reference ∫ (adaptive quadrature)', value: `${fmt(ref.value, 12)} ± ${ref.error.toExponential(0)}` },
      { label: 'error = sum − integral', value: fmt(err, 4), tone: Math.abs(err) < 1e-3 * (1 + Math.abs(ref.value)) ? 'good' : undefined },
      { label: 'lower ≤ integral ≤ upper (sampled)', value: `${fmt(lower, 6)} … ${fmt(upper, 6)}` },
      { label: 'mesh ‖P‖ (widest piece)', value: fmt(mesh, 4) },
    ];
    ctx.setReadouts(rows);
    ctx.setNote(`The ${tagName(tag)} sum $\\sum f(x_i^*)\\,\\Delta x_i = ${fmtTeX(sum.sum, 8)}$ approximates $\\int_{${fmtTeX(a, 3)}}^{${fmtTeX(b, 3)}} f(x)\\,dx = ${fmtTeX(ref.value, 10)}$. Areas below the axis count **negative** (red). The integral is the limit as the widest piece shrinks to zero — for any choice of sample points, squeezed between the lower and upper sums. Right: the error against $n$ on log–log axes. Left and right sums fall like $1/n$ (slope −1); midpoint and trapezoid like $1/n^2$ (slope −2), and the midpoint error is about half the trapezoid’s.`);
    fin.warn(ctx, sum.undefinedAt !== null ? `f is not defined at x ≈ ${fmt(sum.undefinedAt, 4)}: that rectangle has no height, and the integral may be improper.`
      : sing !== null ? `f has a singularity near x ≈ ${fmt(sing, 4)} inside [a, b]. The integral is improper — it may not exist, the Riemann sums need not converge, and the reference value is not trustworthy.`
      : ref.warning ?? '');
  };
  return {
    update,
    csv() { const [a, b] = ab(); const rows = ['n,left,right,mid,trap']; for (const k of NS) rows.push([k, ...RULES.map(([r]) => riemann(fin.cur!.f, a, b, k, r))].join(',')); return rows.join('\n'); },
    dispose() { plot.onClick = undefined; },
  };
}

const tagName = (t: string) => ({ left: 'left', right: 'right', mid: 'midpoint', trap: 'trapezoid', lower: 'lower', upper: 'upper' } as Record<string, string>)[t] ?? t;

// ── accumulation A(x) = ∫ₐˣ f ─────────────────────────────────────────────
function accumulateDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  const fin = new FxInput('sin(1.5x) + 0.4');
  let cum: Cumulative | null = null, cumKey = '';
  let dir = 1;
  const DOM: [number, number] = [-8, 8];

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const f = fx.f, a = ctx.params.a, x = ctx.params.x;
    const meaning = ctx.choices.meaning;
    const key = `${fx.src}|${a}`;
    if (key !== cumKey) { cum = cumulativeIntegral(f, a, DOM[0], DOM[1], 1600, 1e-11); cumKey = key; }
    const A = (t: number) => sampleCumulative(cum!, t);
    if (changed) {
      const [lo, hi] = yRange([f], -4, 5, { pad: 0.3 });
      plot.setView({ x0: -4, x1: 5, y0: lo, y1: hi });
      const [lo2, hi2] = yRange([A], -4, 5, { q: 0, pad: 0.15 });
      plot2.setView({ x0: -4, x1: 5, y0: lo2, y1: hi2 });
      fin.warn(ctx, '');
    }
    const names = meaning === 'work' ? ['F(x)  force', 'W(x)  work done'] : meaning === 'motion' ? ['v(t)  velocity', 's(t) − s(a)  displacement'] : ['f(x)', 'A(x)'];
    plot.opts.xLabel = meaning === 'motion' ? 't' : 'x'; plot.opts.yLabel = names[0];
    plot2.opts.xLabel = plot.opts.xLabel; plot2.opts.yLabel = names[1];
    const exact = integrate(f, a, x, 1e-12);
    const Ax = exact.value, fxv = f(x);
    const h = 1e-3, slopeNum = (integrate(f, a, x + h, 1e-13).value - integrate(f, a, x - h, 1e-13).value) / (2 * h);
    const strip = (plot.view.x1 - plot.view.x0) * 0.025;
    plot.setDraw((g) => {
      signedArea(g, f, a, x);
      // the leading edge: the next thin strip adds about f(x)·Δx
      if (Number.isFinite(fxv)) g.polygon([[x, 0], [x + strip * Math.sign(x - a || 1), 0], [x + strip * Math.sign(x - a || 1), fxv], [x, fxv]], { fill: 'rgba(242,193,78,0.75)' });
      g.fn(f, { color: SERIES[0], width: 2.6 });
      g.line([a, g.view.y0], [a, g.view.y1], { color: muted(ctx), width: 1, dash: [4, 4] });
      if (meaning === 'work') {
        // a block on a track along the bottom, pushed by the force F(x)
        const H = g.view.y1 - g.view.y0, W = g.view.x1 - g.view.x0, yt = g.view.y0 + 0.07 * H;
        const hs = 0.03 * H, ws = hs * (W / H) * (g.pxH / g.pxW);
        g.line([g.view.x0, yt - hs], [g.view.x1, yt - hs], { color: muted(ctx), width: 1.5 });
        g.polygon([[x - ws, yt - hs], [x + ws, yt - hs], [x + ws, yt + hs], [x - ws, yt + hs]], { fill: SERIES[6], color: ink(ctx), width: 1 });
        const fm = Math.max(Math.abs(g.view.y0), Math.abs(g.view.y1), 1e-9), len = (fxv / fm) * 0.15 * W;
        if (Math.abs(len) > 1e-6) g.arrow([x + Math.sign(len) * ws, yt], [x + Math.sign(len) * ws + len, yt], { color: SERIES[2], width: 3 });
        g.text([x, yt + hs], `F = ${fmt(fxv, 3)}`, { color: txt(ctx, SERIES[2]), font: SMALL, align: 'center', baseline: 'bottom' }, 0, -4);
      }
      g.handle({ id: 'a', at: [a, 0], color: muted(ctx), label: 'a', onDrag: ([px]) => { ctx.setParam('a', clamp(px, DOM[0], DOM[1])); update(); }, constrain: ([px]) => [px, 0] });
      if (Number.isFinite(fxv)) g.handle({ id: 'x', at: [x, fxv], color: SERIES[1], label: meaning === 'motion' ? 't' : 'x', onDrag: ([px]) => { ctx.setParam('x', clamp(px, DOM[0], DOM[1])); update(); }, constrain: ([px]) => [px, f(px)] });
    });
    plot2.setDraw((g) => {
      g.fn(A, { color: SERIES[3], width: 1.4, dash: [5, 5], alpha: 0.6 });
      g.fn(A, { color: SERIES[3], width: 2.8 }, [Math.min(a, x), Math.max(a, x)]);
      g.line([a, g.view.y0], [a, g.view.y1], { color: muted(ctx), width: 1, dash: [4, 4] });
      if (Number.isFinite(Ax) && Number.isFinite(fxv)) {
        const span = (g.view.x1 - g.view.x0) * 0.16;
        g.line([x - span, Ax - fxv * span], [x + span, Ax + fxv * span], { color: SERIES[1], width: 2 });
        // slope triangle: run 1, rise f(x)
        const run = (g.view.x1 - g.view.x0) * 0.08;
        g.path([[x, Ax], [x + run, Ax], [x + run, Ax + fxv * run]], { color: SERIES[1], width: 1.2, dash: [3, 3] });
        g.text([x + run, Ax + (fxv * run) / 2], `slope = ${fmt(fxv, 3)} = ${meaning === 'work' ? 'F' : meaning === 'motion' ? 'v' : 'f'}(${plot.opts.xLabel})`, { color: txt(ctx, SERIES[1]), font: SMALL, baseline: 'middle' }, 6, 0);
        g.point([x, Ax], 6, { fill: SERIES[3] });
      }
      g.handle({ id: 'x2', at: [x, Number.isFinite(Ax) ? Ax : 0], color: SERIES[3], onDrag: ([px]) => { ctx.setParam('x', clamp(px, DOM[0], DOM[1])); update(); }, constrain: ([px]) => [px, A(px)] });
    });
    const v = meaning === 'motion' ? 't' : 'x';
    ctx.setReadouts([
      { label: `${v}`, value: fmt(x, 5) },
      { label: names[1].split('  ')[0] + ` = ∫ from a to ${v}`, value: `${fmt(Ax, 10)} ± ${exact.error.toExponential(0)}` },
      { label: `${names[0].split('  ')[0]} (the integrand at ${v})`, value: fmt(fxv, 10) },
      { label: `slope of ${names[1].split('  ')[0].split('(')[0]} at ${v} (numerical)`, value: fmt(slopeNum, 8), tone: Math.abs(slopeNum - fxv) < 1e-5 * (1 + Math.abs(fxv)) ? 'good' : 'warn' },
    ]);
    ctx.setNote(meaning === 'work'
      ? `A variable force $F(x)$ pushes the block from $a$ to $x$. Each short step $\\Delta x$ does work $F(x)\\,\\Delta x$ (the gold strip), so the total is $W(x) = \\int_a^x F(s)\\,ds$ — the area under the force curve. The rate at which work accumulates per unit distance is the force: $W'(x) = F(x)$.`
      : meaning === 'motion'
        ? `With velocity $v(t)$, each short time step $\\Delta t$ moves you $v(t)\\,\\Delta t$ (the gold strip). Adding these up gives the displacement $s(t) - s(a) = \\int_a^t v(\\tau)\\,d\\tau$ — and its rate of change is the velocity again.`
        : `$A(x) = \\int_a^x f(t)\\,dt$ is the signed area from $a$ to $x$ (blue counts $+$, red $-$). Moving $x$ a little adds a thin strip of height $f(x)$ (gold), so $A$ grows at the rate $f(x)$: $A'(x) = f(x)$ — the **Fundamental Theorem of Calculus, part 1**. Where $f > 0$, $A$ rises; where $f$ crosses zero, $A$ has a peak or a valley. Press play to sweep $x$.`);
    if (cum!.badAt !== null && Math.abs(cum!.badAt - a) < Math.abs(x - a) + 1e-9 && Math.sign(cum!.badAt - a) === Math.sign(x - a)) fin.warn(ctx, `f is not integrable near ${v} ≈ ${fmt(cum!.badAt, 4)}: the accumulated area is not finite past that point.`);
    else { const sg = singularity(f, a, x); fin.warn(ctx, sg !== null ? `f has a singularity near ${v} ≈ ${fmt(sg, 4)} between a and ${v}: the accumulated area there is an improper integral and may not exist.` : exact.warning ?? ''); }
  };
  return {
    update,
    tick(dt) {
      let x = ctx.params.x + dir * dt * 0.8;
      if (x > 5) { x = 5; dir = -1; } else if (x < -4) { x = -4; dir = 1; }
      ctx.setParam('x', x); update();
    },
    reset() { ctx.setParam('x', ctx.params.a); },
    csv() { const rows = ['x,f,A']; for (let i = 0; i <= 400; i++) { const t = -4 + (9 * i) / 400; rows.push(`${t},${fin.cur!.f(t)},${sampleCumulative(cum!, t)}`); } return rows.join('\n'); },
    dispose() {},
  };
}

// ── the Fundamental Theorem: area = F(b) − F(a), for every F + C ───────────
function ftcDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  const fin = new FxInput('cos(x) + 0.5');
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'f(x)';
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 'F(x) + C';
  let sym: { src: string; node: Node | null; tex: string; verified: boolean; state: 'pending' | 'done' | 'failed' } = { src: '', node: null, tex: '', verified: false, state: 'failed' };
  let cum: Cumulative | null = null, cumSrc = '';
  let disposed = false;

  const askSympy = (src: string, node: Node) => {
    if (cas.status === 'error') return;
    sym = { src, node: null, tex: '', verified: false, state: 'pending' };
    integrateSymbolic(node, fin.cur!.v, {}).then((r) => {
      if (disposed || sym.src !== src) return;
      sym = r.antiderivative?.node && r.antiderivative.verified ? { src, node: r.antiderivative.node, tex: r.antiderivative.tex, verified: true, state: 'done' } : { src, node: null, tex: r.antiderivative?.tex ?? '', verified: false, state: 'failed' };
      update();
    }).catch(() => { if (!disposed && sym.src === src) { sym.state = 'failed'; update(); } });
  };

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const f = fx.f;
    const a = ctx.params.a, b = ctx.params.b, C = ctx.params.C;
    if (fx.src !== cumSrc) { cum = cumulativeIntegral(f, 0, -10, 10, 1600, 1e-11); cumSrc = fx.src; askSympy(fx.src, fx.node); }
    // the antiderivative drawn: SymPy's (verified by differentiating back) or the numerical one
    let F0: (x: number) => number = (x) => sampleCumulative(cum!, x);
    let label = 'numerical antiderivative F(x) = ∫₀ˣ f';
    if (sym.state === 'done' && sym.node && sym.src === fx.src) {
      const c = compile(sym.node, [fx.v]);
      const off = c([0]);
      F0 = Number.isFinite(off) ? (x) => c([x]) - off : (x) => c([x]);
      label = 'exact antiderivative (SymPy, verified)';
    }
    const F = (x: number) => F0(x) + C;
    if (changed) {
      const L = Math.max(Math.abs(b - a), 1);
      const x0 = Math.min(a, b) - 0.6 * L, x1 = Math.max(a, b) + 0.6 * L;
      const [lo, hi] = yRange([f], x0, x1, { pad: 0.3 });
      plot.setView({ x0, x1, y0: lo, y1: hi });
      const [lo2, hi2] = yRange([F0], x0, x1, { q: 0.1, pad: 0.3, include0: false });
      const m2 = Math.max(1, 0.35 * (hi2 - lo2));
      plot2.setView({ x0, x1, y0: lo2 - m2, y1: hi2 + m2 });
      fin.warn(ctx, '');
    }
    const area = integrate(f, a, b, 1e-12);
    const rise = F(b) - F(a);
    plot.setDraw((g) => {
      signedArea(g, f, a, b);
      g.fn(f, { color: SERIES[0], width: 2.6 });
      for (const [k, p] of [['a', a], ['b', b]] as const) g.handle({ id: k, at: [p, 0], color: SERIES[1], label: k, onDrag: ([px]) => { ctx.setParam(k, clamp(px, -10, 10)); update(); }, constrain: ([px]) => [px, 0] });
      g.text([(a + b) / 2, 0], `∫ = ${fmt(area.value, 6)}`, { color: ink(ctx), font: FONT, align: 'center', baseline: 'top' }, 0, 22);
    });
    plot2.setDraw((g) => {
      const sp = (g.view.y1 - g.view.y0) / 7;
      for (let k = -3; k <= 3; k++) if (k) g.fn((x) => F(x) + k * sp, { color: SERIES[3], width: 1.1, alpha: 0.35 });
      g.fn(F, { color: SERIES[3], width: 2.8 });
      const Fa = F(a), Fb = F(b);
      if (Number.isFinite(Fa) && Number.isFinite(Fb)) {
        g.line([a, Fa], [b, Fa], { color: muted(ctx), width: 1.2, dash: [4, 4] });
        const top = Math.max(Fa, Fb), bot = Math.min(Fa, Fb);
        g.line([b, bot], [b, top], { color: rise >= 0 ? SERIES[0] : SERIES[2], width: 5 });
        const rightHalf = b > (g.view.x0 + g.view.x1) / 2;
        g.text([b, (Fa + Fb) / 2], `F(b) − F(a) = ${fmt(rise, 6)}`, { color: rise >= 0 ? txt(ctx, SERIES[0]) : txt(ctx, SERIES[2]), font: FONT, align: rightHalf ? 'right' : 'left', baseline: 'middle' }, rightHalf ? -10 : 10, 0);
        g.point([a, Fa], 5.5, { fill: SERIES[3] }); g.point([b, Fb], 5.5, { fill: SERIES[3] });
        g.handle({ id: 'C', at: [a, Fa], color: SERIES[3], label: 'C', onDrag: ([, py]) => { ctx.setParam('C', clamp(py - F0(a), -50, 50)); update(); }, constrain: ([, py]) => [a, py] });
      }
      g.text([g.view.x0, g.view.y0], label, { color: muted(ctx), font: SMALL, baseline: 'bottom' }, 12, -10);
    });
    const agree = Math.abs(rise - area.value) <= Math.max(1e-7 * (1 + Math.abs(area.value)), 10 * area.error + (cum!.error || 0) * 10);
    const rows: Readout[] = [
      { label: '∫ₐᵇ f(x) dx  (adaptive quadrature)', value: `${fmt(area.value, 12)} ± ${area.error.toExponential(0)}` },
      { label: `F(b) − F(a)  (${sym.state === 'done' ? 'exact F' : 'numerical F'})`, value: fmt(rise, 12), tone: agree ? 'good' : 'warn' },
      { label: 'C (any value — it cancels)', value: fmt(C, 4), tone: 'muted' },
      { label: 'antiderivative', value: sym.state === 'done' ? `${sym.tex} + C` : sym.state === 'pending' ? '\\text{asking SymPy…}' : '\\text{no closed form found — numerical}', tex: true },
    ];
    ctx.setReadouts(rows);
    ctx.setSteps(sym.state === 'done' ? [
      { title: 'An antiderivative', tex: `F(x) = ${sym.tex},\\qquad F'(x) = ${toTeX(fx.node)}`, rule: 'SymPy, checked by differentiating back' },
      { title: 'Evaluate at the limits', tex: `\\int_{${fmtTeX(a, 4)}}^{${fmtTeX(b, 4)}} f(x)\\,dx = F(${fmtTeX(b, 4)}) - F(${fmtTeX(a, 4)}) = ${fmtTeX(rise, 10)}`, rule: 'FTC part 2' },
    ] : []);
    ctx.setNote(`**Fundamental Theorem of Calculus, part 2.** If $F' = f$, then $$\\int_a^b f(x)\\,dx = F(b) - F(a).$$ Left: the signed area under $f$. Right: the antiderivatives $F + C$ — all vertical shifts of one curve, because $C$ has derivative zero. The **rise** of any of them from $a$ to $b$ (the bar) equals the area, and $C$ cancels. Drag the green point to change $C$; drag $a$ and $b$ to change the area. Where $f > 0$ the curves climb, where $f < 0$ they fall.`);
    const sg = singularity(f, a, b);
    fin.warn(ctx, sg !== null ? `f has a singularity near x ≈ ${fmt(sg, 4)} inside [a, b]. The Fundamental Theorem needs f continuous on [a, b]: across a singularity F(b) − F(a) can be finite while the area does not exist.` : area.warning ?? '');
  };
  return { update, dispose() { disposed = true; } };
}

export const integralDemos: DemoDef[] = [
  {
    id: 'calc1.riemann', module: 'calc1', title: 'Riemann sums',
    topic: 'Riemann sums · left, right, midpoint, trapezoid · upper and lower sums · definite integral · error vs n',
    summary: 'Approximate the area under f with rectangles — as many as you like, as wide as you like. Compare the sampling rules, squeeze the integral between lower and upper sums, and watch the error fall on a log–log plot.',
    tex: '\\int_a^b f(x)\\,dx = \\lim_{\\|P\\|\\to 0}\\sum_{i} f(x_i^*)\\,\\Delta x_i',
    view: 'split2d',
    input: { label: 'f(x) =', value: 'x^2/4 + sin(2x)/2 + 1', placeholder: 'e.g. sin(x), e^(-x^2), sqrt(x)' },
    params: [
      { key: 'n', label: 'n (rectangles, uniform)', value: 6, min: 1, max: 100, step: 1 },
      { key: 'a', label: 'a (drag on the axis)', value: -1, min: -10, max: 10, step: 0.01 },
      { key: 'b', label: 'b (drag on the axis)', value: 3, min: -10, max: 10, step: 0.01 },
    ],
    choices: [
      { key: 'rule', label: 'Sample point', options: [['left', 'Left'], ['right', 'Right'], ['mid', 'Midpoint'], ['trap', 'Trapezoid'], ['lower', 'Lower (min)'], ['upper', 'Upper (max)']], value: 'left' },
      { key: 'partition', label: 'Partition', options: [['uniform', 'Uniform (n equal pieces)'], ['custom', 'Custom (click / drag)']], value: 'uniform' },
    ],
    experiments: [
      'Double n a few times with the left rule: the error halves each time. With the midpoint rule it quarters.',
      'Switch to the custom partition. Click to add rectangles where the curve bends most — can you beat the uniform error with the same number of pieces?',
      'Choose upper, then lower: the integral is trapped between them, and the gap closes as the pieces shrink.',
      'Type sin(x) and set b = 2π (6.2832): positive and negative areas cancel to 0.',
      'Type x^2 with the trapezoid rule: trapezoids always overshoot a convex curve; the midpoint rule always undershoots it.',
    ],
    connections: ['calc1.accumulate', 'calc1.ftc'],
    accuracy: 'Every Riemann sum is computed exactly as defined (in double precision). The reference integral is adaptive Gauss–Kronrod quadrature to a relative tolerance of 10⁻¹², with its error estimate shown. Lower and upper sums take the min/max of f on each piece from 33 samples, so they are numerical (a narrow spike can be missed).',
    tutorial: [
      { text: '**Rectangles under a curve.** Split $[a, b]$ into $n$ pieces, put a rectangle on each with the height of $f$ at its left end, and add up the areas. That number approximates the area under the curve.', set: { params: { n: 4, a: -1, b: 3 }, choices: { rule: 'left', partition: 'uniform' }, input: 'x^2/4 + sin(2x)/2 + 1' }, task: 'Increase n to 12 and watch the error readout shrink.', done: (c) => c.params.n >= 12 },
      { text: '**Where to sample.** Any point in each piece may set the height: left end, right end, midpoint… For small pieces they all give nearly the same total. The midpoint rule is usually far better than either end.', task: 'Switch the sample point to Midpoint and compare the error with the left rule at the same n.', done: (c) => c.choices.rule === 'mid' },
      { text: '**How fast the error falls.** The right panel plots $\\log|\\text{error}|$ against $\\log n$. A straight line of slope $-p$ means error $\\propto 1/n^p$: left and right sums are first order ($p = 1$); midpoint and trapezoid second order ($p = 2$).', set: { params: { n: 10 } }, task: 'Take n up to 64 and find your white dot on the midpoint line.', done: (c) => c.params.n >= 64 },
      { text: '**Squeezing the integral.** The *lower* sum uses the smallest value of $f$ on each piece, the *upper* sum the largest. Every other Riemann sum lies between them. The integral exists when the two meet as the pieces shrink: $$\\int_a^b f = \\lim_{\\|P\\|\\to0} \\sum f(x_i^*)\\,\\Delta x_i.$$', set: { params: { n: 6 } }, task: 'Choose Upper, then raise n until upper − lower < 0.1 (see the readout).', done: (c) => c.choices.rule === 'upper' && c.params.n >= 80 },
      { text: '**Your own rectangles.** The pieces need not be equal — only the widest one, the mesh $\\|P\\|$, has to shrink. Switch to the custom partition: click to add a divider, click a divider to remove it, drag dividers to resize.', set: { choices: { partition: 'custom', rule: 'mid' }, params: { n: 4 } }, task: 'Add rectangles where f changes fastest and watch the error drop.', done: (c) => c.choices.partition === 'custom' },
      { text: '**Signed area.** Where $f < 0$ the rectangles count negative (red). For $\\sin x$ over a full period the positive and negative parts cancel.', set: { input: 'sin(x)', params: { a: 0, b: 6.2832, n: 8 }, choices: { partition: 'uniform', rule: 'mid' } }, task: 'Move b so that the integral is (close to) 2 — half a period.', done: (c) => Math.abs(c.params.b - Math.PI) < 0.05 },
    ],
    create: riemannDemo,
  },
  {
    id: 'calc1.accumulate', module: 'calc1', title: 'Accumulation: A(x) = ∫ₐˣ f',
    topic: 'Accumulation functions · FTC part 1 · work as an integral · displacement from velocity',
    summary: 'Sweep x and watch the area under f pile up into a new function A(x), drawn live beside it. The slope of A at x is always the height of f at x: A′ = f.',
    tex: "A(x) = \\int_a^x f(t)\\,dt \\;\\Rightarrow\\; A'(x) = f(x)",
    view: 'split2d', animated: true,
    input: { label: 'f(x) =', value: 'sin(1.5x) + 0.4', placeholder: 'e.g. 2 - x, cos(x), e^(-x^2)' },
    params: [
      { key: 'x', label: 'x (drag on either panel, or play)', value: 1.5, min: -8, max: 8, step: 0.01 },
      { key: 'a', label: 'a (start of accumulation)', value: -1, min: -8, max: 8, step: 0.01 },
    ],
    choices: [{ key: 'meaning', label: 'Read it as', options: [['area', 'Area under f'], ['work', 'Work done by a force F(x)'], ['motion', 'Displacement from velocity v(t)']], value: 'area' }],
    experiments: [
      'Press play. Where f is positive A climbs; where f is negative A falls; where f crosses zero A has a peak or valley.',
      'Compare the two slope readouts: the numerical slope of A matches f(x) to many digits — that is FTC part 1.',
      'Move a: the whole A curve shifts up or down but keeps its shape. A different starting point only adds a constant.',
      'Read it as work: a spring force F = −k x (type -2x) does negative work as you stretch it; W(x) = −x² is the (negative of) stored energy.',
      'Type e^(-x^2): A(x) is (√π/2)·erf(x) − const — a function with no elementary formula, defined perfectly well as an integral.',
    ],
    connections: ['calc1.ftc', 'calc1.riemann', 'calc1.motion'],
    accuracy: 'A(x) in the readouts is adaptive Gauss–Kronrod quadrature (error estimate shown). The curve is a cumulative table over [−8, 8] (1600 cells, each integrated adaptively) and interpolated linearly. The slope of A is a numerical central difference of two quadratures; f(x) is exact.',
    create: accumulateDemo,
  },
  {
    id: 'calc1.ftc', module: 'calc1', title: 'The Fundamental Theorem of Calculus',
    topic: 'FTC part 2 · antiderivatives · indefinite integrals F + C · definite integrals · net change',
    summary: 'The signed area under f from a to b equals the rise of any antiderivative F from a to b. The whole family F + C is drawn; the constant cancels.',
    tex: '\\int_a^b f(x)\\,dx = F(b) - F(a),\\qquad F\' = f',
    view: 'split2d',
    input: { label: 'f(x) =', value: 'cos(x) + 0.5', placeholder: 'e.g. x^2 - 1, 1/x, x e^x' },
    params: [
      { key: 'a', label: 'a (drag on the axis)', value: -1, min: -10, max: 10, step: 0.01 },
      { key: 'b', label: 'b (drag on the axis)', value: 3, min: -10, max: 10, step: 0.01 },
      { key: 'C', label: 'C (drag the green point)', value: 0, min: -10, max: 10, step: 0.01 },
    ],
    experiments: [
      'Drag C: every curve of the family slides up and down together, but the bar F(b) − F(a) never changes.',
      'Drag b across a zero of f: the antiderivative turns around exactly there (F′ = f = 0).',
      'Make the area negative (f below the axis): F falls from a to b, and the bar turns red.',
      'Swap a and b: the integral changes sign — ∫ₐᵇ = −∫ᵇₐ.',
      'Physics: read f as a velocity v(t). F is a position, and ∫ v dt from a to b is the displacement — whatever the starting position C.',
    ],
    connections: ['calc1.accumulate', 'calc1.riemann', 'calc1.motion'],
    accuracy: 'The area is adaptive Gauss–Kronrod quadrature (error shown). The antiderivative comes from SymPy when the algebra engine is available and is accepted only after MathVerse differentiates it back and matches f at sample points; otherwise a numerical antiderivative (cumulative quadrature) is drawn and labelled as such.',
    tutorial: [
      { text: '**Two questions.** Left: *how much area* is under $f$ between $a$ and $b$ (signed: below the axis counts negative)? Right: a function $F$ whose *slope* is $f$ — an antiderivative.', set: { input: 'cos(x) + 0.5', params: { a: -1, b: 3, C: 0 } }, task: 'Drag b and watch the area change.', done: (c) => Math.abs(c.params.b - 3) > 0.3 },
      { text: '**Not one antiderivative but a family.** If $F\' = f$ then $(F + C)\' = f$ for every constant $C$. The indefinite integral $\\int f\\,dx = F(x) + C$ is the whole family of vertically shifted curves.', task: 'Drag the green point (or the C slider) to pick another member of the family.', done: (c) => Math.abs(c.params.C) > 0.5 },
      { text: '**The theorem.** The rise of $F$ from $a$ to $b$ — the vertical bar — equals the area on the left: $$\\int_a^b f(x)\\,dx = F(b) - F(a).$$ The constant $C$ cancels in the subtraction, which is why any antiderivative will do.', task: 'Move a and b anywhere and confirm the two readouts agree.', done: (c) => Math.abs(c.params.a + 1) > 0.3 },
      { text: '**Why it works.** By part 1, $A(x) = \\int_a^x f$ is itself an antiderivative, so $F = A + C$ for some $C$. Then $F(b) - F(a) = A(b) - A(a) = A(b) - 0$. (Open the accumulation demo to see $A$ built up.)', task: 'Set a = b: the area is 0 and so is the rise.', done: (c) => Math.abs(c.params.a - c.params.b) < 0.02 },
      { text: '**Signs.** Where $f < 0$, $F$ decreases and the area counts negative. Here $f = \\cos x$: over $[0, \\pi]$ the positive and negative parts cancel and $\\sin\\pi - \\sin 0 = 0$.', set: { input: 'cos(x)', params: { a: 0, b: 3.1416, C: 0 } }, task: 'Move b to π/2 ≈ 1.571: the area is exactly sin(π/2) − sin 0 = 1.', done: (c) => Math.abs(c.params.b - Math.PI / 2) < 0.02 },
    ],
    create: ftcDemo,
  },
];
