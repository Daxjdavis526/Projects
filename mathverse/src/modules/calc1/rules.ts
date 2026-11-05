// Differentiation rules as pictures: the product rule as a growing rectangle,
// the quotient rule as the same rectangle read backwards (u = q·v), and the
// power rule as the product rule applied to x · xⁿ⁻¹.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { Node, parse, compile, toTeX, freeSymbols, CONSTANTS, sym, num, pow, mul, div, add } from '../../core/expr';
import { fmt, fmtTeX, dx, tidy, ink, muted, SERIES, FONT, SMALL, yRange, clamp, txt } from './common';

interface Pair { u: Node; v: Node; src: string }

function readPair(src: string): Pair {
  const parts = src.split(';');
  if (parts.length !== 2) throw new Error('Type two functions separated by a semicolon, e.g.  x^2 + 1 ; sin(x) + 2');
  const [u, v] = parts.map((p, i) => {
    const body = p.replace(/^\s*[uv]\s*(\(\s*x\s*\))?\s*=/, '');
    const n = parse(body, { names: ['x'] });
    const stray = [...freeSymbols(n)].filter((s) => s !== 'x' && !(s in CONSTANTS));
    if (stray.length) throw new Error(`“${stray[0]}” has no value in ${i ? 'v' : 'u'} — use x only`);
    return n;
  });
  return { u, v, src };
}

function rulesDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.grid = false; plot.opts.axes = false; plot.opts.xLabel = ''; plot.opts.yLabel = '';
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 'y';
  const fallback = 'x^2/2 + 1 ; sin(x) + 2';
  let pair: Pair = readPair(fallback), lastSrc = '', lastRule = '', lastN = NaN, perr = '';

  const update = () => {
    const src = ctx.input || fallback;
    if (src !== lastSrc) {
      try { pair = readPair(src); perr = ''; } catch (e) { perr = `${(e as Error).message}. Showing the last pair that worked.`; }
    }
    const rule = ctx.choices.rule, n = Math.round(ctx.params.n);
    // the two factors of the picture: width W(x) and height Hh(x), and the function w being differentiated
    let U = pair.u, V = pair.v;
    if (rule === 'power') { U = sym('x'); V = n === 1 ? num(1) : n === 2 ? sym('x') : pow(sym('x'), num(n - 1)); }
    const wNode: Node = rule === 'quotient' ? div(U, V) : rule === 'power' ? (n === 1 ? sym('x') : pow(sym('x'), num(n))) : mul(U, V);
    const du = dx(U, 'x'), dv = dx(V, 'x'), dw = dx(wNode, 'x');
    const cu = compile(U, ['x']), cv = compile(V, ['x']), cw = compile(wNode, ['x']);
    const u = (t: number) => cu([t]), v = (t: number) => cv([t]), w = (t: number) => cw([t]);
    const Du = du ? compile(du, ['x']) : null, Dv = dv ? compile(dv, ['x']) : null, Dw = dw ? compile(dw, ['x']) : null;
    const x = ctx.params.x, h = ctx.params.dx;
    // picture sides: product → (u, v); quotient → (v, q) with area u; power → (x, xⁿ⁻¹)
    const side1 = rule === 'quotient' ? v : u, side2 = rule === 'quotient' ? (t: number) => u(t) / v(t) : v;
    const a0 = side1(x), b0 = side2(x), a1 = side1(x + h), b1 = side2(x + h);
    const da = a1 - a0, db = b1 - b0;
    const ok = [a0, b0, a1, b1].every(Number.isFinite) && a0 > 0 && b0 > 0 && a1 > 0 && b1 > 0;
    const big = Math.max(a0, a1, b0, b1, 0.5);
    if (src !== lastSrc || rule !== lastRule || n !== lastN || ok) {
      const pad = big * 0.22;
      plot.setView({ x0: -pad, x1: big + pad * 1.6, y0: -pad, y1: big + pad });
    }
    if (src !== lastSrc || rule !== lastRule || n !== lastN) {
      const [lo, hi] = yRange([u, v, w], -0.5, 3.5);
      plot2.setView({ x0: -0.5, x1: 3.5, y0: lo, y1: hi });
      lastSrc = src; lastRule = rule; lastN = n;
    }
    const Aplain = rule === 'quotient' ? 'v' : rule === 'power' ? 'x' : 'u', Bplain = rule === 'quotient' ? 'q' : rule === 'power' ? `x${n - 1 === 1 ? '' : superscript(n - 1)}` : 'v';
    plot.setDraw((g: Graphics) => {
      if (!ok) { g.text([big / 2, big / 2], 'The picture needs both sides positive at x and x + Δx.', { color: muted(ctx), font: FONT, align: 'center' }); return; }
      const rect = (x0: number, y0: number, x1: number, y1: number, fill: string, stroke?: string) => g.polygon([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { fill, color: stroke ?? 'rgba(0,0,0,0)', width: 1.2 });
      const lo = Math.min(a0, a1), lo2 = Math.min(b0, b1);
      rect(0, 0, a0, b0, 'rgba(106,169,255,0.30)', SERIES[0]);
      // the three pieces of the change (drawn for growth; for shrinking, they are the parts removed)
      rect(lo, 0, Math.max(a0, a1), lo2, da >= 0 ? 'rgba(242,193,78,0.45)' : 'rgba(242,193,78,0.2)', SERIES[1]);
      rect(0, lo2, lo, Math.max(b0, b1), db >= 0 ? 'rgba(111,207,151,0.45)' : 'rgba(111,207,151,0.2)', SERIES[3]);
      rect(lo, lo2, Math.max(a0, a1), Math.max(b0, b1), 'rgba(239,107,115,0.55)', SERIES[2]);
      const c = ink(ctx);
      g.text([a0 / 2, b0 / 2], `${Aplain}·${Bplain}`, { color: c, font: '600 15px Inter, sans-serif', align: 'center', baseline: 'middle' });
      g.text([(a0 + a1) / 2, lo2 / 2], `Δ${Aplain}·${Bplain}`, { color: txt(ctx, SERIES[1]), font: FONT, align: 'center', baseline: 'middle' });
      g.text([lo / 2, (b0 + b1) / 2], `${Aplain}·Δ${Bplain}`, { color: txt(ctx, SERIES[3]), font: FONT, align: 'center', baseline: 'middle' });
      g.text([Math.max(a0, a1), Math.max(b0, b1)], `Δ${Aplain}·Δ${Bplain}`, { color: txt(ctx, SERIES[2]), font: FONT, align: 'left', baseline: 'bottom' }, 4, -4);
      g.text([a0 / 2, 0], `${Aplain} = ${fmt(a0, 3)}`, { color: muted(ctx), font: SMALL, align: 'center', baseline: 'top' }, 0, 6);
      g.text([0, b0 / 2], `${Bplain} = ${fmt(b0, 3)}`, { color: muted(ctx), font: SMALL, align: 'right', baseline: 'middle' }, -6, 0);
      // drag the outer corner to change Δx
      g.handle({ id: 'corner', at: [a1, b1], color: SERIES[2], onDrag: ([px, py]) => {
        // choose the Δx whose corner lands nearest the pointer
        let best = h, bd = Infinity;
        for (let i = 0; i <= 200; i++) { const t = -0.2 + (1.2 * i) / 200; const p = side1(x + t), q = side2(x + t); const d = Math.hypot(p - px, q - py); if (d < bd) { bd = d; best = t; } }
        ctx.setParam('dx', best); update();
      } });
    });
    plot2.setDraw((g) => {
      g.fn(u, { color: SERIES[0], width: 2, dash: rule === 'power' ? [5, 4] : undefined });
      if (rule !== 'power') g.fn(v, { color: SERIES[3], width: 2 });
      g.fn(w, { color: SERIES[1], width: 2.8 });
      const m = Dw ? Dw([x]) : NaN, y0 = w(x), span = (g.view.x1 - g.view.x0) * 0.2;
      if (Number.isFinite(m) && Number.isFinite(y0)) g.line([x - span, y0 - m * span], [x + span, y0 + m * span], { color: SERIES[2], width: 2 });
      g.line([x + h, g.view.y0], [x + h, g.view.y1], { color: muted(ctx), width: 1, dash: [2, 4] });
      const label = rule === 'quotient' ? 'q = u/v' : rule === 'power' ? `xⁿ, n = ${n}` : 'u·v';
      g.text([g.view.x1, g.view.y0], rule === 'power' ? `x (dashed), ${label} (gold)` : `u (blue), v (green), ${label} (gold)`, { color: muted(ctx), font: SMALL, align: 'right', baseline: 'bottom' }, -12, -10);
      if (Number.isFinite(y0)) g.handle({ id: 'x', at: [x, y0], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('x', clamp(px, -0.5, 3.5)); update(); }, constrain: ([px]) => [px, w(px)] });
    });
    // the numbers: ΔA = Δa·b + a·Δb + Δa·Δb, divided by Δx
    const pieces = { da_b: da * b0, a_db: a0 * db, da_db: da * db };
    const exact = Dw ? Dw([x]) : NaN;
    const formula = rule === 'quotient'
      ? (Du && Dv ? (Du([x]) * v(x) - u(x) * Dv([x])) / (v(x) * v(x)) : NaN)
      : (Du && Dv ? Du([x]) * v(x) + u(x) * Dv([x]) : NaN);
    const rows: Readout[] = rule === 'quotient' ? [
      { label: 'Δu = v·Δq + q·Δv + Δq·Δv', value: `${fmt(pieces.a_db, 4)} + ${fmt(pieces.da_b, 4)} + ${fmt(pieces.da_db, 4)}` },
      { label: 'Δq/Δx (the quotient’s slope over Δx)', value: fmt(db / h, 8) },
      { label: "(u′v − uv′)/v²  at x", value: fmt(formula, 10) },
      { label: "q′(x) by direct differentiation", value: fmt(exact, 10), tone: Math.abs(formula - exact) < 1e-9 * (1 + Math.abs(exact)) ? 'good' : 'warn' },
    ] : [
      { label: `Δ(area) = Δ${Aplain}·${Bplain} + ${Aplain}·Δ${Bplain} + Δ${Aplain}·Δ${Bplain}`, value: `${fmt(pieces.da_b, 4)} + ${fmt(pieces.a_db, 4)} + ${fmt(pieces.da_db, 4)}` },
      { label: 'Δ(area)/Δx', value: fmt((a1 * b1 - a0 * b0) / h, 8) },
      { label: 'corner Δ·Δ / Δx  (→ 0)', value: fmt(pieces.da_db / h, 4), tone: 'muted' },
      { label: rule === 'power' ? `n·xⁿ⁻¹ at x` : "u′v + uv′  at x", value: fmt(rule === 'power' ? n * Math.pow(x, n - 1) : formula, 10) },
      { label: 'derivative by direct differentiation', value: fmt(exact, 10), tone: 'good' },
    ];
    ctx.setReadouts(rows);
    const tx = (nd: Node | null) => (nd ? toTeX(tidy(nd)) : '\\text{(no formula)}');
    const steps: StepRow[] = rule === 'quotient' ? [
      { title: 'Read the rectangle backwards', tex: 'u = q\\,v \\;\\Rightarrow\\; u\' = q\'v + q v\' \\;\\Rightarrow\\; q\' = \\frac{u\' - q v\'}{v} = \\frac{u\'v - u v\'}{v^2}', rule: 'product rule' },
      { title: 'The pieces', tex: `u = ${toTeX(pair.u)},\\quad v = ${toTeX(pair.v)},\\quad u' = ${tx(du)},\\quad v' = ${tx(dv)}` },
      { title: 'Quotient rule', tex: `\\left(\\frac{u}{v}\\right)' = \\frac{\\left(${tx(du)}\\right)\\left(${toTeX(pair.v)}\\right) - \\left(${toTeX(pair.u)}\\right)\\left(${tx(dv)}\\right)}{\\left(${toTeX(pair.v)}\\right)^2}`, rule: 'exact' },
      { title: `At x = ${fmt(x)}`, tex: `q'(${fmtTeX(x)}) = ${fmtTeX(formula, 10)}` },
    ] : rule === 'power' ? [
      { title: 'xⁿ is a rectangle x by xⁿ⁻¹', tex: 'x^n = x\\cdot x^{n-1}', rule: 'factor' },
      { title: 'Product rule', tex: '(x^n)\' = 1\\cdot x^{n-1} + x\\,(x^{n-1})\'', rule: 'product rule' },
      { title: 'Induction', tex: '(x^{n-1})\' = (n-1)x^{n-2} \\Rightarrow (x^n)\' = x^{n-1} + (n-1)x^{n-1} = n\\,x^{n-1}', rule: 'induction on n' },
      { title: `n = ${n}, x = ${fmt(x)}`, tex: `${n}\\cdot ${fmtTeX(x)}^{${n - 1}} = ${fmtTeX(n * Math.pow(x, n - 1), 10)}` },
    ] : [
      { title: 'Change in area', tex: '\\Delta(uv) = \\Delta u\\, v + u\\, \\Delta v + \\Delta u\\, \\Delta v', rule: 'geometry' },
      { title: 'Divide by Δx and let Δx → 0', tex: '\\frac{\\Delta(uv)}{\\Delta x} = \\frac{\\Delta u}{\\Delta x} v + u \\frac{\\Delta v}{\\Delta x} + \\underbrace{\\frac{\\Delta u}{\\Delta x}\\,\\Delta v}_{\\to\\, u\'\\cdot 0} \\;\\longrightarrow\\; u\'v + uv\'', rule: 'limit' },
      { title: 'The pieces', tex: `u = ${toTeX(pair.u)},\\quad v = ${toTeX(pair.v)},\\quad u' = ${tx(du)},\\quad v' = ${tx(dv)}` },
      { title: 'Product rule', tex: `(uv)' = ${tx(add(mul(du ?? num(NaN), pair.v), mul(pair.u, dv ?? num(NaN))))}`, rule: 'exact' },
      { title: `At x = ${fmt(x)}`, tex: `(uv)'(${fmtTeX(x)}) = ${fmtTeX(formula, 10)}` },
    ];
    ctx.setSteps(steps);
    ctx.setNote(rule === 'quotient'
      ? 'The rectangle has width $v$ and height $q = u/v$, so its area is $u$. When $x$ grows by $\\Delta x$, the area changes by $\\Delta u = v\\,\\Delta q + q\\,\\Delta v + \\Delta q\\,\\Delta v$. Solve for $\\Delta q$, divide by $\\Delta x$ and let $\\Delta x \\to 0$: the quotient rule $q\' = \\dfrac{u\'v - uv\'}{v^2}$. The red corner is second-order small and disappears in the limit.'
      : rule === 'power'
        ? `$x^${n}$ is the area of a rectangle with sides $x$ and $x^{${n - 1}}$. Growing $x$ adds a gold strip ($\\Delta x \\cdot x^{${n - 1}}$), a green strip ($x\\cdot\\Delta(x^{${n - 1}})$) and a red corner. The product rule plus induction give $(x^n)' = n\\,x^{n-1}$ — here $${n}\\,x^{${n - 1}}$.`
        : 'Area $= u\\cdot v$. When $x$ grows by $\\Delta x$, the area grows by a gold strip $\\Delta u\\cdot v$, a green strip $u\\cdot\\Delta v$ and a red corner $\\Delta u\\cdot\\Delta v$. Divide by $\\Delta x$: the strips give $u\'v + uv\'$, while the corner is $\\tfrac{\\Delta u}{\\Delta x}\\Delta v \\to u\'\\cdot 0 = 0$. Drag the red corner and watch its share vanish as $\\Delta x$ shrinks.');
    ctx.warn(perr || (!ok ? 'The area picture needs positive sides at x and x + Δx; the numbers in the readouts still hold.' : ''));
  };
  return { update, dispose() {} };
}

const superscript = (k: number) => String(k).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');

export const ruleDemos: DemoDef[] = [
  {
    id: 'calc1.rules', module: 'calc1', title: 'Product, quotient and power rules',
    topic: 'Differentiation rules · product rule · quotient rule · power rule',
    summary: 'The product rule is the growth of a rectangle with sides u and v: two strips and a vanishing corner. Read backwards, the same rectangle gives the quotient rule; with sides x and xⁿ⁻¹ it gives the power rule by induction.',
    tex: "(uv)' = u'v + uv',\\qquad \\left(\\tfrac{u}{v}\\right)' = \\tfrac{u'v - uv'}{v^2}",
    view: 'split2d',
    input: { label: 'u(x) ; v(x)', value: 'x^2/2 + 1 ; sin(x) + 2', placeholder: 'two functions separated by ;' },
    params: [
      { key: 'x', label: 'x (drag on the graph)', value: 1, min: -0.5, max: 3.5, step: 0.01 },
      { key: 'dx', label: 'Δx (drag the red corner)', value: 0.45, min: -0.2, max: 1, step: 0.001 },
      { key: 'n', label: 'n (power rule)', value: 3, min: 1, max: 6, step: 1 },
    ],
    choices: [{ key: 'rule', label: 'Rule', options: [['product', 'Product  (uv)′'], ['quotient', 'Quotient  (u/v)′'], ['power', 'Power  (xⁿ)′']], value: 'product' }],
    experiments: [
      'Drag the red corner toward the blue rectangle. The strips shrink like Δx but the corner shrinks like Δx² — its share of Δ(area)/Δx goes to zero.',
      'Compare the readouts: u′v + uv′ equals the derivative found by differentiating u·v directly, to every digit.',
      'Switch to the quotient rule: the same picture, now with area u and sides v and q = u/v.',
      'Switch to the power rule and step n from 1 to 6: (xⁿ)′ = n xⁿ⁻¹ follows from the product rule one n at a time.',
      'Type x ; x for the product: the rectangle is a square and you see (x²)′ = 2x as two equal strips.',
    ],
    connections: ['calc1.secant', 'calc1.chain'],
    accuracy: 'All derivatives are exact (symbolic); the agreement between u′v + uv′ and the direct derivative is checked numerically to 10 digits. The rectangle picture needs positive sides; the formulas do not.',
    create: rulesDemo,
  },
];
