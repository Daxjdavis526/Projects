// The derivative: secant lines turning into the tangent as Δx → 0, and the
// shape of a graph read from f′ and f″ shown side by side.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { FxInput, fmt, fmtc, fmtTeX, fitView, yRange, ink, muted, SERIES, FONT, SMALL, shortTeX, clamp, txt } from './common';
import { findRoots } from '../../core/numeric/roots';

// ── secant → tangent ───────────────────────────────────────────────────────
function secantDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  const fin = new FxInput('x^3/4 - x + 1');
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot2.opts.xLabel = 'Δx'; plot2.opts.yLabel = 'Δy/Δx';
  let lastX0 = NaN, lastKey = '';
  let q: (h: number) => number = () => NaN;

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const { f, D1, D2 } = fx;
    if (changed) { fitView(plot, [f], -3, 3.5); fin.warn(ctx, ''); }
    const x0 = ctx.params.x0, h = ctx.params.dx, central = ctx.choices.rule === 'central';
    const y0 = f(x0), m = D1(x0);
    q = central ? (t: number) => (f(x0 + t) - f(x0 - t)) / (2 * t) : (t: number) => (f(x0 + t) - f(x0)) / t;
    const qh = h === 0 ? NaN : q(h);
    const x1 = x0 + h, y1 = f(x1);
    const xa = central ? x0 - h : x0, ya = f(xa);
    const key = `${fx.src}|${central}`;
    if (changed || key !== lastKey || Math.abs(x0 - lastX0) > 1e-9) {
      const [lo, hi] = yRange([q, () => m], -2.2, 2.2, { include0: false, pad: 0.25 });
      plot2.setView({ x0: -2.4, x1: 2.4, y0: lo, y1: hi });
      lastX0 = x0; lastKey = key;
    }
    const tan = ctx.toggles.tangent;
    plot.setDraw((g) => {
      g.fn(f, { color: SERIES[0], width: 2.6 });
      const span = g.view.x1 - g.view.x0;
      if (tan && Number.isFinite(m)) g.line([x0 - span, y0 - m * span], [x0 + span, y0 + m * span], { color: SERIES[3], width: 1.8, dash: [7, 5] });
      if (Number.isFinite(qh) && Number.isFinite(ya)) {
        // the secant through the two sample points, extended across the view
        g.line([xa - span, ya - qh * span], [xa + span, ya + qh * span], { color: SERIES[1], width: 2.2 });
        if (ctx.toggles.triangle) {
          const xl = Math.min(xa, x1), xr = Math.max(xa, x1);
          const yl = xl === xa ? ya : y1, yr = xr === xa ? ya : y1;
          g.polygon([[xl, yl], [xr, yl], [xr, yr]], { fill: 'rgba(242,193,78,0.12)' });
          g.line([xl, yl], [xr, yl], { color: SERIES[1], width: 1.4, dash: [3, 3] });
          g.line([xr, yl], [xr, yr], { color: SERIES[1], width: 1.4, dash: [3, 3] });
          g.text([(xl + xr) / 2, yl], `Δx = ${fmt(central ? 2 * h : h, 3)}`, { color: txt(ctx, SERIES[1]), font: SMALL, align: 'center', baseline: yr > yl ? 'top' : 'bottom' }, 0, yr > yl ? 6 : -6);
          g.text([xr, (yl + yr) / 2], `Δy = ${fmt(yr - yl, 3)}`, { color: txt(ctx, SERIES[1]), font: SMALL, align: 'left', baseline: 'middle' }, 6, 0);
        }
      }
      if (central && Number.isFinite(ya)) g.point([xa, ya], 5, { fill: SERIES[1] });
      if (Number.isFinite(y1)) g.handle({ id: 'Q', at: [x1, y1], color: SERIES[1], label: 'Q', onDrag: ([px]) => { ctx.setParam('dx', clamp(px - x0, -4, 4)); update(); }, constrain: ([px]) => [px, f(px)] });
      if (Number.isFinite(y0)) g.handle({ id: 'P', at: [x0, y0], color: ink(ctx), label: 'P', onDrag: ([px]) => { ctx.setParam('x0', clamp(px, -10, 10)); update(); }, constrain: ([px]) => [px, f(px)] });
    });
    plot2.setDraw((g) => {
      g.line([g.view.x0, m], [g.view.x1, m], { color: SERIES[3], width: 1.4, dash: [6, 5] });
      g.text([g.view.x0, m], `f′(x₀) = ${fmt(m, 6)}`, { color: txt(ctx, SERIES[3]), font: FONT }, 8, -6);
      g.fn(q, { color: SERIES[1], width: 2.4 });
      // the hole: the quotient is undefined at Δx = 0, but its limit is f′(x₀)
      g.point([0, m], 6, { fill: ctx.dark ? '#0d1017' : '#f7f8fa', color: SERIES[3], width: 2 });
      if (Number.isFinite(qh)) {
        g.line([h, g.view.y0], [h, qh], { color: muted(ctx), width: 1, dash: [2, 4] });
        g.handle({ id: 'h', at: [h, qh], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('dx', clamp(px, -4, 4)); update(); }, constrain: ([px]) => [px, q(px)] });
      }
      g.text([g.view.x1, g.view.y0], central ? 'central quotient: error shrinks like Δx²' : 'forward quotient: error shrinks like Δx', { color: muted(ctx), font: SMALL, align: 'right', baseline: 'bottom' }, -10, -10);
    });
    const err = Math.abs(qh - m);
    const rows: Readout[] = [
      { label: 'Δx', value: fmt(h, 6) },
      { label: 'difference quotient Δy/Δx', value: fmt(qh, 10) },
      { label: `f′(x₀) (exact${fx.exact1 ? ', symbolic' : ' — numerical derivative'})`, value: fmt(m, 10), tone: fx.exact1 ? 'good' : 'warn' },
      { label: '|quotient − f′(x₀)|', value: fmt(err, 3), tone: err < 1e-3 ? 'good' : undefined },
      central
        ? { label: 'error / Δx²   (→ |f‴(x₀)|/6)', value: fmt(err / (h * h), 4), tone: 'muted' }
        : { label: 'error / |Δx|   (→ |f″(x₀)|/2)', value: fmt(err / Math.abs(h), 4) + `   vs ${fmt(Math.abs(D2(x0)) / 2, 4)}`, tone: 'muted' },
    ];
    const d1tex = shortTeX(fx.d1);
    if (d1tex) rows.push({ label: 'f′(x)', value: d1tex, tex: true });
    ctx.setReadouts(rows);
    ctx.setNote(`${central ? '$\\dfrac{f(x_0+\\Delta x)-f(x_0-\\Delta x)}{2\\,\\Delta x}$' : '$\\dfrac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}$'} $= ${fmtTeX(qh, 8)}$ is the slope of the gold secant. As $\\Delta x \\to 0$ it tends to $f'(${fmtTeX(x0, 4)}) = ${fmtTeX(m, 8)}$, the slope of the green tangent. The right panel graphs the quotient as a function of $\\Delta x$: it has a **hole** at $\\Delta x = 0$ (you cannot divide by zero), and the derivative is the height that fills the hole.`);
    if (!Number.isFinite(y0)) fin.warn(ctx, `f is not defined at x₀ = ${fmt(x0)} — move P.`);
    else if (!Number.isFinite(y1)) fin.warn(ctx, `f is not defined at x₀ + Δx = ${fmt(x1)} — shrink Δx or move P.`);
    else if (h === 0) fin.warn(ctx, 'Δx = 0: the quotient 0/0 is undefined. The derivative is the limit as Δx approaches 0, never the value at 0.');
    else if (Math.abs(h) < 1e-7) fin.warn(ctx, 'Δx is so small that floating-point rounding in f(x₀+Δx) − f(x₀) dominates: the computed quotient gets worse, not better. The exact derivative does not have this problem.');
    else if (!Number.isFinite(m)) fin.warn(ctx, `f′(x₀) does not exist here: the quotients do not settle.`);
    else fin.warn(ctx, '');
  };
  return {
    update,
    tick(dt) {
      const h = ctx.params.dx;
      if (Math.abs(h) <= 2e-4) return;
      const next = h * Math.exp(-0.9 * dt);
      ctx.setParam('dx', Math.abs(next) < 2e-4 ? Math.sign(h) * 2e-4 : next);
      update();
    },
    reset() { ctx.setParam('dx', 1.5); },
    csv() {
      const rows = ['dx,difference_quotient'];
      for (let i = 0; i <= 200; i++) { const t = -2 + (4 * i) / 200; if (t !== 0) rows.push(`${t},${q(t)}`); }
      return rows.join('\n');
    },
    dispose() {},
  };
}

// ── f, f′ and f″ side by side ─────────────────────────────────────────────
function shapeDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  const fin = new FxInput('x^4/4 - x^3/3 - x^2 + 1');
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'f';
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = "f′, f″";
  // the two panels share their x-range
  plot.onViewChange = (v) => plot2.setView({ ...plot2.view, x0: v.x0, x1: v.x1 });
  plot2.onViewChange = (v) => plot.setView({ ...plot.view, x0: v.x0, x1: v.x1 });

  const bands = (g: Graphics, D2: (x: number) => number) => {
    const { x0, x1, y0, y1 } = g.view, n = 240;
    let start = x0, sgn = Math.sign(D2(x0));
    const flush = (end: number) => { if (sgn !== 0 && Number.isFinite(sgn)) g.polygon([[start, y0], [end, y0], [end, y1], [start, y1]], { fill: sgn > 0 ? 'rgba(79,209,217,0.07)' : 'rgba(255,159,90,0.08)' }); };
    for (let i = 1; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, s = Math.sign(D2(x));
      if (s !== sgn || i === n) { flush(x); start = x; sgn = s; }
    }
  };

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const { f, D1, D2 } = fx;
    if (changed) {
      fitView(plot, [f], -2.5, 3, { q: 0.1 });
      const [lo, hi] = yRange([D1, D2], -2.5, 3, { q: 0.1 });
      plot2.setView({ x0: plot.view.x0, x1: plot.view.x1, y0: lo, y1: hi });
      fin.warn(ctx, '');
    }
    const x0 = ctx.params.x0, y0 = f(x0), m = D1(x0), c = D2(x0);
    const { x0: vx0, x1: vx1 } = plot.view;
    const crit = findRoots(D1, vx0, vx1), infl = findRoots(D2, vx0, vx1);
    const marks = ctx.toggles.marks;
    const guide = (g: Graphics) => {
      if (!marks) return;
      for (const r of crit) g.line([r, g.view.y0], [r, g.view.y1], { color: 'rgba(242,193,78,0.35)', width: 1, dash: [4, 5] });
      for (const r of infl) g.line([r, g.view.y0], [r, g.view.y1], { color: 'rgba(180,140,255,0.35)', width: 1, dash: [4, 5] });
    };
    plot.setDraw((g) => {
      if (ctx.toggles.concavity) bands(g, D2);
      guide(g);
      // f coloured by the sign of f′: green rising, red falling
      const n = Math.max(300, Math.ceil(g.pxW));
      let run: [number, number][] = [], s0 = 0;
      const flush = () => { if (run.length > 1) g.path(run, { color: s0 > 0 ? SERIES[3] : s0 < 0 ? SERIES[2] : SERIES[0], width: 2.8 }); };
      for (let i = 0; i <= n; i++) {
        const x = g.view.x0 + ((g.view.x1 - g.view.x0) * i) / n, y = f(x), s = Math.sign(D1(x));
        if (!Number.isFinite(y)) { flush(); run = []; continue; }
        if (s !== s0 && run.length) { run.push([x, y]); flush(); run = [[x, y]]; s0 = s; continue; }
        s0 = s; run.push([x, y]);
      }
      flush();
      if (Number.isFinite(y0) && Number.isFinite(m)) {
        const span = (g.view.x1 - g.view.x0) * 0.22;
        if (ctx.toggles.parabola && Number.isFinite(c)) g.fn((x) => y0 + m * (x - x0) + 0.5 * c * (x - x0) ** 2, { color: SERIES[4], width: 1.6, dash: [5, 4] }, [x0 - span * 1.6, x0 + span * 1.6]);
        g.line([x0 - span, y0 - m * span], [x0 + span, y0 + m * span], { color: SERIES[1], width: 2 });
      }
      if (marks) {
        for (const r of crit) { const cc = D2(r); g.point([r, f(r)], 5.5, { fill: cc < 0 ? '#ff9f5a' : cc > 0 ? '#4fd1d9' : SERIES[1] }); }
        for (const r of infl) g.point([r, f(r)], 4.5, { fill: SERIES[4] });
      }
      if (Number.isFinite(y0)) g.handle({ id: 'x0', at: [x0, y0], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('x0', px); update(); }, constrain: ([px]) => [px, f(px)] });
    });
    plot2.setDraw((g) => {
      guide(g);
      if (ctx.toggles.d2) g.fn(D2, { color: SERIES[4], width: 2, dash: [6, 4] });
      g.fn(D1, { color: SERIES[3], width: 2.6 });
      g.line([x0, g.view.y0], [x0, g.view.y1], { color: muted(ctx), width: 1, dash: [2, 4] });
      if (marks) for (const r of crit) g.point([r, 0], 4, { fill: SERIES[1] });
      if (Number.isFinite(m)) g.point([x0, m], 5.5, { fill: SERIES[3] });
      if (ctx.toggles.d2 && Number.isFinite(c)) g.point([x0, c], 5, { fill: SERIES[4] });
      g.text([g.view.x0, g.view.y1], "f′ (solid)", { color: txt(ctx, SERIES[3]), font: FONT, baseline: 'top' }, 10, 10);
      if (ctx.toggles.d2) g.text([g.view.x0, g.view.y1], "f″ (dashed)", { color: txt(ctx, SERIES[4]), font: FONT, baseline: 'top' }, 10, 28);
      g.handle({ id: 'x0b', at: [x0, Number.isFinite(m) ? m : 0], color: SERIES[3], onDrag: ([px]) => { ctx.setParam('x0', px); update(); }, constrain: ([px]) => [px, D1(px)] });
    });
    const rising = m > 1e-12 ? 'increasing' : m < -1e-12 ? 'decreasing' : 'stationary';
    const bend = c > 1e-12 ? 'concave up' : c < -1e-12 ? 'concave down' : 'no concavity (f″ = 0)';
    const rows: Readout[] = [
      { label: 'f(x₀)', value: fmt(y0, 6) },
      { label: `f′(x₀) slope${fx.exact1 ? '' : ' (numerical)'}`, value: fmt(m, 6), tone: m > 0 ? 'good' : m < 0 ? 'bad' : 'muted' },
      { label: `f″(x₀) bending${fx.exact2 ? '' : ' (numerical)'}`, value: fmt(c, 6), tone: c > 0 ? 'good' : c < 0 ? 'warn' : 'muted' },
      { label: 'at x₀ the graph is', value: `${rising}, ${bend}` },
      { label: 'critical points in view (f′ = 0)', value: crit.length ? crit.map((r) => fmtc(r, 4)).join(', ') : 'none' },
      { label: 'inflection candidates (f″ = 0)', value: infl.length ? infl.map((r) => fmtc(r, 4)).join(', ') : 'none' },
    ];
    const t1 = shortTeX(fx.d1), t2 = shortTeX(fx.d2);
    if (t1) rows.push({ label: 'f′(x)', value: t1, tex: true });
    if (t2) rows.push({ label: 'f″(x)', value: t2, tex: true });
    ctx.setReadouts(rows);
    ctx.setNote('Left: $f$, green where it rises ($f\' > 0$), red where it falls ($f\' < 0$); cyan bands where it is concave up ($f\'\' > 0$), orange where concave down. Right: $f\'$ (solid) and $f\'\'$ (dashed) on the same $x$-axis. Where $f\'$ crosses zero, $f$ has a flat tangent (gold guides); where $f\'\'$ changes sign, the bending flips (violet guides, inflection points). The dashed violet parabola $f(x_0) + f\'(x_0)(x-x_0) + \\tfrac12 f\'\'(x_0)(x-x_0)^2$ hugs the curve: $f\'\'$ is its curvature in disguise.');
  };
  return {
    update,
    csv() {
      const fx = fin.cur!; const rows = ['x,f,f1,f2'];
      for (let i = 0; i <= 400; i++) { const x = plot.view.x0 + ((plot.view.x1 - plot.view.x0) * i) / 400; rows.push(`${x},${fx.f(x)},${fx.D1(x)},${fx.D2(x)}`); }
      return rows.join('\n');
    },
    dispose() { plot.onViewChange = undefined; plot2.onViewChange = undefined; },
  };
}

export const derivativeDemos: DemoDef[] = [
  {
    id: 'calc1.secant', module: 'calc1', title: 'The derivative as a limit',
    topic: 'Derivatives and tangent lines · secant lines · difference quotient · Δx → 0',
    summary: 'A secant through P and Q turns into the tangent as Q slides into P. The difference quotient Δy/Δx, graphed against Δx, has a hole at 0 that the derivative fills.',
    tex: "f'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}",
    view: 'split2d', animated: true,
    input: { label: 'f(x) =', value: 'x^3/4 - x + 1', placeholder: 'e.g. sin(x), x^2, e^x, sqrt(x)' },
    params: [
      { key: 'x0', label: 'x₀ (drag P)', value: 1, min: -4, max: 4, step: 0.01 },
      { key: 'dx', label: 'Δx (drag Q, or press play to shrink it)', value: 1.5, min: -2, max: 2, step: 0.0001 },
    ],
    choices: [{ key: 'rule', label: 'Quotient', options: [['forward', 'Forward  [f(x+Δx) − f(x)]/Δx'], ['central', 'Central  [f(x+Δx) − f(x−Δx)]/2Δx']], value: 'forward' }],
    toggles: [{ key: 'tangent', label: 'Tangent line', value: true }, { key: 'triangle', label: 'Rise / run triangle', value: true }],
    experiments: [
      'Press play: Δx shrinks toward 0 and the gold secant settles onto the green tangent. Watch the error column fall.',
      'Halve Δx a few times by typing values. With the forward quotient the error halves too (first order); switch to central and it quarters (second order).',
      'Type sqrt(abs(x)) and put P at x₀ = 0: the quotients from the left and the right head to −∞ and +∞ — there is no tangent slope there.',
      'Type abs(x) with P at 0: from the right the quotient is +1, from the left −1. A corner has no derivative.',
      'Type 1e-9 as Δx: the computed quotient gets worse. Below ~10⁻⁸, rounding error in f(x₀+Δx) − f(x₀) beats the truncation error.',
    ],
    connections: ['calc1.shape', 'calc1.rules', 'calc1.limits', 'calc1.motion'],
    accuracy: 'f′(x₀) is exact (symbolic differentiation, evaluated in double precision). The difference quotient is computed exactly as written, so for very small Δx it shows real floating-point cancellation — that is part of the lesson, not a bug. The error ratios approach |f″|/2 (forward) and |f‴|/6 (central) by Taylor’s theorem.',
    tutorial: [
      { text: '**Slope from two points.** A line through two points of the curve — a *secant* — has slope rise over run: $\\dfrac{\\Delta y}{\\Delta x} = \\dfrac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}$. That is an *average* rate of change over the interval.', set: { params: { x0: 1, dx: 1.5 }, choices: { rule: 'forward' }, toggles: { tangent: false, triangle: true }, input: 'x^3/4 - x + 1' }, task: 'Drag Q along the curve and watch the gold secant and its slope readout change.', done: (c) => Math.abs(c.params.dx - 1.5) > 0.2 },
      { text: '**Bring Q closer.** The slope at a single point needs a run of zero, and $0/0$ means nothing. So we do the next best thing: let $\\Delta x$ get *small* and see whether the slopes settle down.', task: 'Make |Δx| smaller than 0.1 (drag Q close to P, or press play).', done: (c) => Math.abs(c.params.dx) < 0.1 },
      { text: '**The limit.** Turn on the tangent line. As $\\Delta x \\to 0$ the secant locks onto it. Its slope is the derivative $$f\'(x_0) = \\lim_{\\Delta x\\to0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}.$$ Note the order: first form the quotient for $\\Delta x \\ne 0$, *then* take the limit.', set: { toggles: { tangent: true } }, task: 'Get the error |quotient − f′(x₀)| below 0.001.', done: (c) => Math.abs(c.params.dx) < 0.0013 },
      { text: '**The hole.** The right panel graphs the quotient against $\\Delta x$. It is a perfectly good function — except at $\\Delta x = 0$, where it is undefined (the open circle). The derivative is the value that *would* fill the hole: a limit, exactly as in the limits demo.', set: { params: { dx: 1.2 } }, task: 'Drag the gold point on the right-hand curve toward the hole, from the left side (Δx < 0).', done: (c) => c.params.dx < 0 && c.params.dx > -0.1 },
      { text: '**How fast it converges.** Taylor: $f(x_0+h) = f(x_0) + f\'(x_0)h + \\tfrac12 f\'\'(\\xi)h^2$, so the forward error is about $\\tfrac12|f\'\'|\\,|\\Delta x|$ — first order. The *central* quotient cancels the $h^2$ term and its error is about $\\tfrac16|f\'\'\'|\\,\\Delta x^2$.', set: { choices: { rule: 'central' }, params: { dx: 0.5 } }, task: 'With the central quotient, find a Δx whose error is below 10⁻⁴ while Δx is still bigger than 0.01.', done: (c) => c.choices.rule === 'central' && Math.abs(c.params.dx) > 0.01 && Math.abs(c.params.dx) < 0.02 },
      { text: '**When there is no derivative.** At a corner the two one-sided limits disagree. The derivative exists only if the quotient has the *same* limit from both sides.', set: { input: 'abs(x)', params: { x0: 0, dx: 0.8 }, choices: { rule: 'forward' } }, task: 'Make Δx negative: the quotient jumps from +1 to −1. No single slope works.', done: (c) => c.params.dx < 0 },
    ],
    create: secantDemo,
  },
  {
    id: 'calc1.shape', module: 'calc1', title: 'f, f′ and f″: the shape of a graph',
    topic: 'Derivative as a function · increasing/decreasing · concavity · inflection points',
    summary: 'The graph of f beside its derivatives on a shared x-axis: where f′ > 0 the curve rises, where f″ > 0 it bends up, and zeros of f′ and f″ line up with peaks, valleys and inflection points.',
    tex: "f' > 0:\\ \\nearrow \\qquad f'' > 0:\\ \\smile",
    view: 'split2d',
    input: { label: 'f(x) =', value: 'x^4/4 - x^3/3 - x^2 + 1', placeholder: 'e.g. x^3 - 3x, sin(x), x e^(-x)' },
    params: [{ key: 'x0', label: 'x₀ (drag on either panel)', value: 0.6, min: -6, max: 6, step: 0.01 }],
    toggles: [
      { key: 'concavity', label: 'Concavity bands', value: true },
      { key: 'd2', label: 'Show f″', value: true },
      { key: 'marks', label: 'Critical & inflection points', value: true },
      { key: 'parabola', label: 'Osculating parabola at x₀', value: false },
    ],
    experiments: [
      'Drag the point across a peak of f. On the right, f′ passes through zero from + to − at exactly that x.',
      'Put x₀ on a violet inflection point: f″ = 0 there and the tangent line crosses the curve.',
      'Turn on the osculating parabola and slide through an inflection point: the parabola flips from cup to cap.',
      'Type x^3: f′(0) = 0 but 0 is not a peak or a valley — the sign of f′ does not change. Critical point ≠ extremum.',
      'Type x^4: f″(0) = 0 but there is no inflection — f″ touches zero without changing sign.',
    ],
    connections: ['calc1.secant', 'calc1.extrema', 'calc1.motion'],
    accuracy: 'f′ and f″ are exact symbolic derivatives. Zeros of f′ and f″ are located numerically (sign changes on 400 samples, refined by Brent’s method to ~1e−13); a zero where the sign does not change (a double root) is not marked, which is the right call for extrema and inflections.',
    create: shapeDemo,
  },
];
