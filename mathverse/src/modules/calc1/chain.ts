// The chain rule as linked machines: x feeds g, u = g(x) feeds f. A small
// interval of x is stretched by g′ on the u-line and again by f′ on the y-line,
// and three dials turn at dx/dt, du/dt and dy/dt — rates multiply.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { Node, parse, compile, toTeX, toText, freeSymbols, CONSTANTS, substitute, sym } from '../../core/expr';
import { fmt, fmtTeX, dx, ink, muted, SERIES, FONT, SMALL, yRange, clamp, txt } from './common';

interface Chain { f: Node; g: Node; comp: Node; src: string }

function readChain(src: string): Chain {
  const parts = src.split(';');
  if (parts.length !== 2) throw new Error('Type the outer and inner functions separated by a semicolon, e.g.  sin(u) ; x^2');
  const strip = (s: string) => s.replace(/^\s*[A-Za-z]\s*\(\s*[A-Za-z]\s*\)\s*=/, '');
  let f = parse(strip(parts[0]), { names: ['u', 'x'] });
  const g = parse(strip(parts[1]), { names: ['x'] });
  const fs = freeSymbols(f);
  // the outer function may be written in x (sin(x) ; x^2) — rename to u
  if (!fs.has('u') && fs.has('x')) f = substitute(f, { x: sym('u') });
  for (const [n, v, name] of [[f, 'u', 'f'], [g, 'x', 'g']] as const) {
    const stray = [...freeSymbols(n)].filter((s) => s !== v && !(s in CONSTANTS));
    if (stray.length) throw new Error(`“${stray[0]}” has no value in ${name} — write ${name} in ${v} only`);
  }
  return { f, g, comp: substitute(f, { u: g }), src };
}

function circle(g: Graphics, c: [number, number], r: number, style: { color?: string; fill?: string; width?: number }, n = 64) {
  g.polygon(Array.from({ length: n }, (_, i) => [c[0] + r * Math.cos((2 * Math.PI * i) / n), c[1] + r * Math.sin((2 * Math.PI * i) / n)] as [number, number]), style);
}

/** A gear-like dial whose needle points at angle θ (radians). */
function dial(g: Graphics, c: [number, number], r: number, theta: number, color: string, label: string, ctx: DemoCtx) {
  const teeth = 18, pts: [number, number][] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (2 * Math.PI * i) / (teeth * 4) + theta, rr = i % 4 < 2 ? r * 1.1 : r;
    pts.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]);
  }
  g.polygon(pts, { fill: ctx.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color, width: 1.6 });
  circle(g, c, r * 0.18, { fill: color });
  g.line(c, [c[0] + r * 0.92 * Math.cos(theta), c[1] + r * 0.92 * Math.sin(theta)], { color, width: 3 });
  g.text([c[0], c[1] - r * 1.1], label, { color: txt(ctx, color), font: FONT, align: 'center', baseline: 'top' }, 0, 8);
}

function chainDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.axes = false; plot.opts.grid = false; plot.opts.pan = false;
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 'y = f(g(x))';
  const fallback = 'sin(u) ; x^2';
  let ch = readChain(fallback), lastSrc = '', perr = '';
  let F = (u: number) => Math.sin(u), G = (x: number) => x * x, C = (x: number) => Math.sin(x * x);
  let Fp: (u: number) => number = Math.cos, Gp = (x: number) => 2 * x, Cp = (x: number) => 2 * x * Math.cos(x * x);
  let nodes: { df: Node | null; dg: Node | null; dc: Node | null } = { df: null, dg: null, dc: null };
  let dir = 1;

  const rebuild = () => {
    const src = ctx.input || fallback;
    if (src === lastSrc) return;
    try { ch = readChain(src); perr = ''; } catch (e) { perr = `${(e as Error).message}. Showing the last pair that worked.`; lastSrc = src; return; }
    lastSrc = src;
    const cf = compile(ch.f, ['u']), cg = compile(ch.g, ['x']), cc = compile(ch.comp, ['x']);
    F = (u) => cf([u]); G = (x) => cg([x]); C = (x) => cc([x]);
    nodes = { df: dx(ch.f, 'u'), dg: dx(ch.g, 'x'), dc: dx(ch.comp, 'x') };
    const num1 = (h: (t: number) => number) => (t: number) => (h(t + 1e-5) - h(t - 1e-5)) / 2e-5;
    const k = (n: Node | null, v: string, h: (t: number) => number) => { if (!n) return num1(h); const c = compile(n, [v]); return (t: number) => c([t]); };
    Fp = k(nodes.df, 'u', F); Gp = k(nodes.dg, 'x', G); Cp = k(nodes.dc, 'x', C);
    const [lo, hi] = yRange([C], -3, 3);
    plot2.setView({ x0: -3, x1: 3, y0: lo, y1: hi });
  };

  const update = () => {
    rebuild();
    plot.setView({ x0: 0, x1: 10, y0: 0, y1: 12.4 });
    const x = ctx.params.x, h = ctx.params.dx;
    const u = G(x), y = F(u), gp = Gp(x), fp = Fp(u), cp = Cp(x);
    const u1 = G(x + h), y1 = F(u1);
    const du = u1 - u, dy = y1 - y;
    // one common scale for the three number lines, so lengths compare honestly
    const longest = Math.max(Math.abs(h), Math.abs(du), Math.abs(dy), 1e-9);
    const s = Math.min(3.4 / longest, 6);
    const lines: [string, number, number, number, string][] = [['x', 11, x, h, SERIES[0]], ['u = g(x)', 8, u, du, SERIES[3]], ['y = f(u)', 5, y, dy, SERIES[1]]];
    const X = (center: number, v: number) => 2.4 + (v - center) * s;
    plot.setDraw((g) => {
      const c = ink(ctx), mc = muted(ctx);
      // the machines
      const box = (yc: number, name: string, body: string, gain: number, color: string) => {
        g.polygon([[0.15, yc - 0.55], [1.35, yc - 0.55], [1.35, yc + 0.55], [0.15, yc + 0.55]], { fill: ctx.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color, width: 1.5 });
        g.text([0.75, yc], name, { color: txt(ctx, color), font: '700 16px Inter, sans-serif', align: 'center', baseline: 'middle' });
        g.text([1.55, yc], `${body}`, { color: mc, font: SMALL, baseline: 'middle' }, 0, -9);
        g.text([1.55, yc], `stretch ×${fmt(gain, 3)}`, { color: txt(ctx, color), font: FONT, baseline: 'middle' }, 0, 9);
      };
      box(9.5, 'g', `g(x) = ${toText(ch.g)}`, gp, SERIES[3]);
      box(6.5, 'f', `f(u) = ${toText(ch.f)}`, fp, SERIES[1]);
      // number lines with the image of [x, x + Δx]
      const ends: [number, number][] = [];
      for (const [name, yy, center, d, col] of lines) {
        g.line([1.6, yy], [9.8, yy], { color: mc, width: 1.2 });
        const step = niceStep(8.2 / s / 6);
        for (let t = Math.ceil((center + (1.6 - 2.4) / s) / step) * step; t <= center + (9.8 - 2.4) / s; t += step) {
          const px = X(center, t);
          g.line([px, yy - 0.12], [px, yy + 0.12], { color: mc, width: 1 });
          g.text([px, yy], fmt(+t.toPrecision(6), 4), { color: mc, font: '10px Inter, sans-serif', align: 'center', baseline: 'top' }, 0, 7);
        }
        const a = X(center, center), b = X(center, center + d);
        g.line([a, yy], [b, yy], { color: col, width: 6 });
        g.point([a, yy], 4.5, { fill: col });
        g.text([9.8, yy], name, { color: txt(ctx, col), font: FONT, align: 'right', baseline: 'bottom' }, 0, -8);
        g.text([(a + b) / 2, yy], `Δ = ${fmt(d, 3)}`, { color: txt(ctx, col), font: SMALL, align: 'center', baseline: 'bottom' }, 0, -8);
        ends.push([a, b]);
      }
      // funnels between consecutive lines: how the interval is carried along
      for (let k = 0; k < 2; k++) {
        const [a0, b0] = ends[k], [a1, b1] = ends[k + 1], y0 = lines[k][1], y1 = lines[k + 1][1];
        g.polygon([[a0, y0 - 0.25], [b0, y0 - 0.25], [b1, y1 + 0.25], [a1, y1 + 0.25]], { fill: k ? 'rgba(242,193,78,0.12)' : 'rgba(111,207,151,0.12)' });
      }
      // dials: needles turn at the actual rates (angles are the values themselves)
      const r = 1.05;
      dial(g, [2.0, 1.9], r, x * 1.5, SERIES[0], 'x', ctx);
      dial(g, [5.0, 1.9], r, u * 1.5, SERIES[3], 'u', ctx);
      dial(g, [8.0, 1.9], r, y * 1.5, SERIES[1], 'y', ctx);
      g.arrow([3.25, 1.9], [3.75, 1.9], { color: c, width: 1.5 });
      g.arrow([6.25, 1.9], [6.75, 1.9], { color: c, width: 1.5 });
      g.text([3.5, 1.9], `×${fmt(gp, 3)}`, { color: txt(ctx, SERIES[3]), font: FONT, align: 'center', baseline: 'bottom' }, 0, -10);
      g.text([6.5, 1.9], `×${fmt(fp, 3)}`, { color: txt(ctx, SERIES[1]), font: FONT, align: 'center', baseline: 'bottom' }, 0, -10);
      g.text([5, 3.7], `dy/dt = f′(u) · g′(x) · dx/dt = ${fmt(fp, 3)} × ${fmt(gp, 3)} × 1 = ${fmt(cp, 4)}`, { color: c, font: FONT, align: 'center', baseline: 'middle' });
    });
    plot2.setDraw((g) => {
      g.fn(G, { color: SERIES[3], width: 1.4, dash: [5, 5] });
      g.fn(C, { color: SERIES[1], width: 2.8 });
      const span = (g.view.x1 - g.view.x0) * 0.18;
      if (Number.isFinite(y) && Number.isFinite(cp)) g.line([x - span, y - cp * span], [x + span, y + cp * span], { color: SERIES[2], width: 2 });
      if (Number.isFinite(y1)) g.point([x + h, y1], 4, { fill: SERIES[1] });
      g.text([g.view.x1, g.view.y0], 'f(g(x)) (gold), g(x) (green dashed)', { color: muted(ctx), font: SMALL, align: 'right', baseline: 'bottom' }, -12, -10);
      if (Number.isFinite(y)) g.handle({ id: 'x', at: [x, y], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('x', clamp(px, -3, 3)); update(); }, constrain: ([px]) => [px, C(px)] });
    });
    const exactMatch = Math.abs(fp * gp - cp) <= 1e-9 * (1 + Math.abs(cp));
    const rows: Readout[] = [
      { label: 'u = g(x)', value: fmt(u, 6) },
      { label: 'g′(x)  (stretch of the x-interval)', value: fmt(gp, 6) },
      { label: 'f′(u)  (stretch of the u-interval)', value: fmt(fp, 6) },
      { label: 'f′(g(x)) · g′(x)', value: fmt(fp * gp, 10) },
      { label: '(f∘g)′(x) by direct differentiation', value: fmt(cp, 10), tone: exactMatch ? 'good' : 'warn' },
      { label: 'Δu/Δx · Δy/Δu = Δy/Δx', value: `${fmt(du / h, 4)} × ${fmt(dy / du, 4)} = ${fmt(dy / h, 4)}`, tone: 'muted' },
    ];
    ctx.setReadouts(rows);
    const t = (n: Node | null) => (n ? toTeX(n) : '\\text{(numerical)}');
    const steps: StepRow[] = [
      { title: 'Inner and outer', tex: `u = g(x) = ${toTeX(ch.g)},\\qquad y = f(u) = ${toTeX(ch.f)}` },
      { title: 'Differentiate each machine', tex: `\\frac{du}{dx} = ${t(nodes.dg)},\\qquad \\frac{dy}{du} = ${t(nodes.df)}`, rule: 'exact' },
      { title: 'Multiply the rates', tex: `\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx} = \\left.${t(nodes.df)}\\right|_{u = ${toTeX(ch.g)}} \\cdot \\left(${t(nodes.dg)}\\right)`, rule: 'chain rule' },
      { title: `At x = ${fmt(x)}`, tex: `\\frac{dy}{dx} = ${fmtTeX(fp, 6)} \\times ${fmtTeX(gp, 6)} = ${fmtTeX(fp * gp, 8)}` },
    ];
    ctx.setSteps(steps);
    ctx.setNote(`A short interval of length $\\Delta x$ (blue) goes into machine $g$ and comes out about $|g'(x)| = ${fmtTeX(Math.abs(gp), 3)}$ times as long (green); machine $f$ stretches that by $|f'(u)| = ${fmtTeX(Math.abs(fp), 3)}$ (gold). Stretch factors multiply, so $\\dfrac{dy}{dx} = f'(g(x))\\,g'(x)$. Press play: $x$ moves at unit speed and the dials turn at $\\tfrac{dx}{dt}$, $\\tfrac{du}{dt}$ and $\\tfrac{dy}{dt}$ — like gear ratios, rates multiply (a negative factor turns the next dial backwards; shrink $\\Delta x$ to see the factors exactly).`);
    ctx.warn(perr || (!Number.isFinite(y) ? `f(g(x)) is not defined at x = ${fmt(x)}.` : ''));
  };
  return {
    update,
    tick(dt) {
      let x = ctx.params.x + dir * dt * 0.5;
      if (x > 3) { x = 3; dir = -1; } else if (x < -3) { x = -3; dir = 1; }
      ctx.setParam('x', x); update();
    },
    dispose() {},
  };
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

export const chainDemos: DemoDef[] = [
  {
    id: 'calc1.chain', module: 'calc1', title: 'The chain rule: linked machines',
    topic: 'Chain rule · composition of functions · rates multiplying',
    summary: 'Composition as two machines in a row. An interval of x is stretched by g′ and then by f′, so derivatives of compositions multiply; three dials turning at dx/dt, du/dt and dy/dt make the same point with rates.',
    tex: "\\frac{dy}{dx} = \\frac{dy}{du}\\,\\frac{du}{dx} = f'(g(x))\\,g'(x)",
    view: 'split2d', animated: true,
    input: { label: 'f(u) ; g(x)', value: 'sin(u) ; x^2', placeholder: 'outer ; inner — e.g. e^u ; -x^2/2' },
    params: [
      { key: 'x', label: 'x (drag on the graph, or play)', value: 1, min: -3, max: 3, step: 0.01 },
      { key: 'dx', label: 'Δx (the interval fed in)', value: 0.25, min: 0.001, max: 1, step: 0.001 },
    ],
    experiments: [
      'Shrink Δx: the measured stretch factors Δu/Δx and Δy/Δu approach g′(x) and f′(u), and their product approaches (f∘g)′(x).',
      'Move x to 0 with g = x²: the first machine squashes the interval to nothing (g′ = 0) and the whole chain stalls — whatever f does.',
      'Press play and watch the dials: when g′ < 0 the u dial turns backwards; when both factors are negative, y turns forwards again.',
      'Type e^u ; -x^2/2 — the bell curve. Its slope is e^(−x²/2) · (−x): the chain rule in one line.',
      'Type sqrt(u) ; 1 - x^2 and move toward x = ±1: f′(u) blows up at u = 0 — a vertical tangent of the semicircle.',
    ],
    connections: ['calc1.rules', 'calc1.implicit', 'calc1.relatedrates'],
    accuracy: 'g′, f′ and (f∘g)′ are exact symbolic derivatives; the agreement f′(g(x))·g′(x) = (f∘g)′(x) is checked to 10 digits. The interval stretches use the actual finite Δx, so they match the derivatives only as Δx → 0. The dials are an analogy: their angles are the values x, u, y themselves, so they turn at the true rates.',
    tutorial: [
      { text: '**Two machines.** $y = \\sin(x^2)$ is built in two steps: first $u = g(x) = x^2$, then $y = f(u) = \\sin u$. The left panel draws them as machines in a row.', set: { input: 'sin(u) ; x^2', params: { x: 1, dx: 0.25 } }, task: 'Drag the gold point on the right-hand graph and watch u and y follow on the number lines.', done: (c) => Math.abs(c.params.x - 1) > 0.3 },
      { text: '**Stretching.** Feed a small interval $[x, x+\\Delta x]$ into $g$. It comes out roughly $|g\'(x)|$ times as long — that is what a derivative *is*: a local stretch factor.', set: { params: { x: 1, dx: 0.25 } }, task: 'Shrink Δx below 0.01 and compare Δu/Δx with g′(x) = 2x.', done: (c) => c.params.dx < 0.01 },
      { text: '**Stretch twice.** The $u$-interval goes into $f$ and is stretched again, by $|f\'(u)|$. Two stretches in a row multiply: $$\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u}\\cdot\\frac{\\Delta u}{\\Delta x} \\;\\longrightarrow\\; f\'(g(x))\\,g\'(x).$$ (The proof has to be careful when $\\Delta u = 0$; the result holds regardless.)', task: 'Check the readouts: f′(g(x))·g′(x) equals the directly computed derivative.' },
      { text: '**Rates in time.** Press play. $x$ moves at speed 1, so $u$ moves at $g\'(x)$ and $y$ at $f\'(u)g\'(x)$. Like a gear train, the ratios multiply.', task: 'Play the animation and watch the u dial reverse as x passes 0.', done: (c) => c.time.t > 3 },
      { text: '**A stalled chain.** At $x = 0$, $g\'(0) = 0$: the first machine crushes every interval to a point, so $(f\\circ g)\'(0) = 0$ whatever $f$ is.', set: { params: { x: 0, dx: 0.1 } }, task: 'Try a different outer function, e.g. type e^u ; x^2, and confirm the slope at 0 is still 0.', done: (c) => c.input.trim().startsWith('e^u') || c.input.includes('exp') },
    ],
    create: chainDemo,
  },
];
