// Integration by parts as a picture: the curve (u(x), v(x)) splits the
// rectangle u(b)v(b) − u(a)v(a) into ∫u dv (left of the curve) and ∫v du
// (below it). Worked steps are MathVerse's own; SymPy's appear beside them.

import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import { integrate } from '../../core/numeric/quad';
import { fmt, texNum, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, FONT, symbolicRunner, sympyIntegralRows } from './util';

interface Choice { u: (x: number) => number; v: (x: number) => number; du: (x: number) => number; dv: (x: number) => number; uTeX: string; dvTeX: string; duTeX: string; vTeX: string; restTeX: string }
interface Preset {
  label: string; src: string; tex: string; dom: [number, number]; def: [number, number];
  main: Choice; why: string; alt?: Choice & { verdict: string };
  F: (x: number) => number; FTeX: string; restTeX: string;
}

const PRESETS: Record<string, Preset> = {
  xex: {
    label: 'x eˣ', src: 'x*exp(x)', tex: 'x e^{x}', dom: [0, 2.5], def: [0, 1.5],
    main: { u: (x) => x, du: () => 1, v: Math.exp, dv: Math.exp, uTeX: 'x', dvTeX: 'e^{x}\\,dx', duTeX: 'dx', vTeX: 'e^{x}', restTeX: '\\int e^{x}\\,dx' },
    why: 'LIATE: the algebraic factor x becomes simpler when differentiated (to 1), while eˣ is unchanged by integration.',
    alt: { u: Math.exp, du: Math.exp, v: (x) => x * x / 2, dv: (x) => x, uTeX: 'e^{x}', dvTeX: 'x\\,dx', duTeX: 'e^{x}dx', vTeX: '\\tfrac{x^2}{2}', restTeX: '\\int \\tfrac{x^2}{2} e^{x}\\,dx', verdict: 'The leftover integral ∫ (x²/2) eˣ dx is harder than the one we started with — the power of x went up.' },
    F: (x) => (x - 1) * Math.exp(x), FTeX: '(x-1)e^{x}', restTeX: 'e^{x}',
  },
  xsin: {
    label: 'x sin x', src: 'x*sin(x)', tex: 'x\\sin x', dom: [0, Math.PI], def: [0, 2.2],
    main: { u: (x) => x, du: () => 1, v: (x) => 1 - Math.cos(x), dv: Math.sin, uTeX: 'x', dvTeX: '\\sin x\\,dx', duTeX: 'dx', vTeX: '1-\\cos x', restTeX: '\\int (1-\\cos x)\\,dx' },
    why: 'Differentiate the polynomial, integrate the sine. We chose the constant in v = 1 − cos x so the picture starts at the origin — any antiderivative works, the constants cancel in uv − ∫v du.',
    alt: { u: Math.sin, du: Math.cos, v: (x) => x * x / 2, dv: (x) => x, uTeX: '\\sin x', dvTeX: 'x\\,dx', duTeX: '\\cos x\\,dx', vTeX: '\\tfrac{x^2}{2}', restTeX: '\\int \\tfrac{x^2}{2}\\cos x\\,dx', verdict: 'The leftover ∫ (x²/2) cos x dx has a higher power of x — this choice goes the wrong way.' },
    F: (x) => Math.sin(x) - x * Math.cos(x), FTeX: '\\sin x - x\\cos x', restTeX: 'x - \\sin x',
  },
  xlnx: {
    label: 'x ln x', src: 'x*ln(x)', tex: 'x\\ln x', dom: [1, 4], def: [1, 3],
    main: { u: Math.log, du: (x) => 1 / x, v: (x) => x * x / 2, dv: (x) => x, uTeX: '\\ln x', dvTeX: 'x\\,dx', duTeX: '\\tfrac{1}{x}dx', vTeX: '\\tfrac{x^2}{2}', restTeX: '\\int \\tfrac{x}{2}\\,dx' },
    why: 'LIATE: Logarithms come first — ln x has a simple derivative 1/x but no simple antiderivative to integrate against.',
    F: (x) => (x * x / 2) * Math.log(x) - x * x / 4, FTeX: '\\tfrac{x^2}{2}\\ln x - \\tfrac{x^2}{4}', restTeX: '\\tfrac{x^2}{4}',
  },
  lnx: {
    label: 'ln x', src: 'ln(x)', tex: '\\ln x', dom: [1, 6], def: [1, 4],
    main: { u: Math.log, du: (x) => 1 / x, v: (x) => x, dv: () => 1, uTeX: '\\ln x', dvTeX: 'dx', duTeX: '\\tfrac{1}{x}dx', vTeX: 'x', restTeX: '\\int 1\\,dx' },
    why: 'The trick: take dv = dx. There is only one factor, and its derivative 1/x is simpler than it is.',
    F: (x) => x * Math.log(x) - x, FTeX: 'x\\ln x - x', restTeX: 'x',
  },
  atan: {
    label: 'arctan x', src: 'atan(x)', tex: '\\arctan x', dom: [0, 4], def: [0, 2],
    main: { u: Math.atan, du: (x) => 1 / (1 + x * x), v: (x) => x, dv: () => 1, uTeX: '\\arctan x', dvTeX: 'dx', duTeX: '\\tfrac{dx}{1+x^2}', vTeX: 'x', restTeX: '\\int \\tfrac{x}{1+x^2}\\,dx' },
    why: 'Inverse trigonometric functions have algebraic derivatives: dv = dx, u = arctan x, and the rest is a substitution w = 1 + x².',
    F: (x) => x * Math.atan(x) - 0.5 * Math.log(1 + x * x), FTeX: 'x\\arctan x - \\tfrac12\\ln(1+x^2)', restTeX: '\\tfrac12\\ln(1+x^2)',
  },
  x2ex: {
    label: 'x² eˣ (twice)', src: 'x^2*exp(x)', tex: 'x^{2} e^{x}', dom: [0, 2], def: [0, 1.4],
    main: { u: (x) => x * x, du: (x) => 2 * x, v: Math.exp, dv: Math.exp, uTeX: 'x^{2}', dvTeX: 'e^{x}\\,dx', duTeX: '2x\\,dx', vTeX: 'e^{x}', restTeX: '\\int 2x e^{x}\\,dx' },
    why: 'Each application lowers the power of x by one, so parts is used twice; the second time is the x eˣ example.',
    alt: { u: Math.exp, du: Math.exp, v: (x) => x ** 3 / 3, dv: (x) => x * x, uTeX: 'e^{x}', dvTeX: 'x^2\\,dx', duTeX: 'e^{x}dx', vTeX: '\\tfrac{x^3}{3}', restTeX: '\\int \\tfrac{x^3}{3}e^{x}\\,dx', verdict: 'The power climbs to x³ — every further step makes it worse.' },
    F: (x) => (x * x - 2 * x + 2) * Math.exp(x), FTeX: '(x^2-2x+2)e^{x}', restTeX: '2(x-1)e^{x}',
  },
};

export const partsDemo: DemoDef = {
  id: 'calc2.parts', module: 'calc2', title: 'Integration by parts', topic: 'Integration by parts',
  summary: 'The product rule run backwards. The curve (u, v) splits a rectangle of area uv into ∫u dv and ∫v du — so one integral can be traded for the other.',
  tex: '\\int_a^b u\\,dv = \\Big[uv\\Big]_a^b - \\int_a^b v\\,du',
  view: 'split2d',
  params: [
    { key: 'a', label: 'lower limit a', value: 0, min: 0, max: 6, step: 0.01 },
    { key: 'b', label: 'upper limit b (drag the end of the curve)', value: 1.5, min: 0, max: 6, step: 0.01 },
  ],
  choices: [{ key: 'f', label: 'Integrand', value: 'xex', options: Object.entries(PRESETS).map(([k, p]) => [k, p.label] as [string, string]) }],
  toggles: [{ key: 'swap', label: 'Swap the roles of u and dv', value: false }, { key: 'rects', label: 'Show the rectangles uv', value: true }],
  experiments: [
    'Drag the end of the curve: the gold and blue areas change, but together they always fill the rectangle u(b)v(b) minus the small one u(a)v(a).',
    'Turn on “Swap the roles”: the picture still balances, but the blue integral you are left with is harder than the one you started with.',
    'Choose ln x: with dv = dx the curve is (ln x, x), and ∫ ln x dx becomes the much easier ∫ x · (1/x) dx.',
    'Raise a above 0 for x eˣ: a small rectangle u(a)v(a) is cut out — that is the −u(a)v(a) in [uv]ₐᵇ.',
  ],
  connections: ['calc2.trigint', 'calc2.partfrac', 'calc2.taylor'],
  accuracy: 'Antiderivatives and the worked steps are exact (hand-derived and checked by differentiation in the test suite); the areas are adaptive Gauss–Kronrod quadrature (error ≲ 1e−10). SymPy’s steps are its own, verified by differentiating its antiderivative.',
  tutorial: [
    { text: '**The product rule backwards.** Since $(uv)\' = u\'v + uv\'$, integrating both sides gives $uv = \\int v\\,du + \\int u\\,dv$. Integration by parts is just this, rearranged. The left picture shows it: the curve $(u(x), v(x))$ cuts the rectangle of area $uv$ into two pieces.', set: { choices: { f: 'xex' }, toggles: { swap: false, rects: true }, params: { a: 0, b: 1.5 } }, task: 'Read the readouts: gold + blue = u(b)v(b) − u(a)v(a).' },
    { text: 'The **gold** region lies between the curve and the $v$-axis: its area is $\\int u\\,dv$ (strips of width $u$, height $dv$). The **blue** region lies under the curve: its area is $\\int v\\,du$. On the right, the same two areas appear as ordinary areas under $u\\,v\'$ and $v\\,u\'$ in $x$.', task: 'Drag the end of the curve (left) until b = 2.', done: (c) => Math.abs(c.params.b - 2) < 0.05 },
    { text: 'For $\\int x e^x\\,dx$ choose $u = x$, $dv = e^x dx$. Then $du = dx$, $v = e^x$, and $$\\int x e^x\\,dx = x e^x - \\int e^x dx = (x-1)e^x + C.$$ The blue integral is *easier* than the gold one — that is the whole point of the method.', task: 'Open the Steps tab to see the working, then SymPy’s own steps.' },
    { text: 'A bad choice still balances the picture, but trades for something worse. With $u = e^x$, $dv = x\\,dx$ the leftover is $\\int \\tfrac{x^2}{2}e^x dx$. **LIATE** (Logarithmic, Inverse trig, Algebraic, Trig, Exponential) suggests which factor to call $u$: the one earlier in the list.', set: { toggles: { swap: true } }, task: 'Compare the blue integrand on the right with the original gold one.' },
    { text: 'Sometimes $dv = dx$ is the trick: $\\int \\ln x\\,dx = x\\ln x - \\int x\\cdot\\tfrac1x\\,dx = x\\ln x - x + C$. The curve is $(\\ln x, x)$ — the region left of it is $\\int \\ln x\\,dx$ read sideways.', set: { choices: { f: 'lnx' }, toggles: { swap: false }, params: { a: 1, b: 4 } }, task: 'Move b to e ≈ 2.72 and check that gold = e·1 − (e − 1) = 1.', done: (c) => Math.abs(c.params.b - Math.E) < 0.03 },
    { text: 'Parts may be needed more than once: $\\int x^2 e^x dx$ lowers $x^2 \\to 2x \\to 2$. In physics the same move gives the **Taylor remainder** in integral form, and it is how one proves $\\langle p\\rangle$ is real in quantum mechanics: the boundary term $[uv]$ vanishes and the derivative moves onto the other factor.', set: { choices: { f: 'x2ex' }, params: { a: 0, b: 1.4 } } },
  ],
  create: (ctx) => createParts(ctx),
};

function createParts(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, Rp = ctx.plot2!;
  const runner = symbolicRunner(ctx);
  let lastKey = '';
  L.opts.xLabel = 'u'; L.opts.yLabel = 'v';
  Rp.opts.xLabel = 'x'; Rp.opts.yLabel = 'y';

  const update = () => {
    const P = PRESETS[ctx.choices.f] ?? PRESETS.xex;
    const swapped = !!ctx.toggles.swap && !!P.alt;
    const C = swapped ? P.alt! : P.main;
    let a = clamp(ctx.params.a, P.dom[0], P.dom[1]), b = clamp(ctx.params.b, P.dom[0], P.dom[1]);
    if (b < a + 0.02) b = Math.min(P.dom[1], a + 0.02);
    if (a > b - 0.02) a = Math.max(P.dom[0], b - 0.02);
    const warn: string[] = [];
    if (a !== ctx.params.a || b !== ctx.params.b) warn.push(`For ${P.label} this picture uses ${fmt(P.dom[0], 3)} ≤ a < b ≤ ${fmt(P.dom[1], 3)}, where u and v are both increasing and non-negative.`);
    if (ctx.toggles.swap && !P.alt) warn.push('This integrand has no sensible second choice of u and dv — the swap is ignored.');
    ctx.warn(warn.join(' '));

    const key = `${ctx.choices.f}|${swapped}`;
    if (key !== lastKey) {
      lastKey = key;
      const um = C.u(P.dom[1]), vm = C.v(P.dom[1]);
      L.setView({ x0: -0.14 * um, x1: um * 1.12, y0: -0.12 * vm, y1: vm * 1.12 });
      let ylo = 0, yhi = 0;
      for (let i = 0; i <= 100; i++) { const x = P.dom[0] + ((P.dom[1] - P.dom[0]) * i) / 100; for (const y of [C.u(x) * C.dv(x), C.v(x) * C.du(x)]) { ylo = Math.min(ylo, y); yhi = Math.max(yhi, y); } }
      const span = P.dom[1] - P.dom[0];
      Rp.setView({ x0: P.dom[0] - span * 0.08, x1: P.dom[1] + span * 0.06, y0: ylo - (yhi - ylo) * 0.1, y1: yhi * 1.12 });
    }

    const n = 160, curve: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; curve.push([C.u(x), C.v(x)]); }
    const ua = C.u(a), va = C.v(a), ub = C.u(b), vb = C.v(b);
    const gold = integrate((x) => C.u(x) * C.dv(x), a, b, 1e-11), blue = integrate((x) => C.v(x) * C.du(x), a, b, 1e-11);
    const box = ub * vb - ua * va;
    const xm = (a + b) / 2;
    const tcol = ink(ctx);
    const um = () => C.u(P.dom[1]) - C.u(P.dom[0]), vm = () => C.v(P.dom[1]) - C.v(P.dom[0]);

    L.setDraw((g) => {
      g.polygon([[0, va], ...curve, [0, vb]], { fill: rgba(GOLD, 0.32) });
      g.polygon([[ua, 0], ...curve, [ub, 0]], { fill: rgba(BLUE, 0.32) });
      if (ctx.toggles.rects) {
        g.polygon([[0, 0], [ub, 0], [ub, vb], [0, vb]], { color: tcol, width: 1.4, dash: [6, 4] });
        if (ua * va > 1e-9) g.polygon([[0, 0], [ua, 0], [ua, va], [0, va]], { fill: ctx.dark ? 'rgba(140,150,170,0.35)' : 'rgba(90,100,120,0.25)', color: muted(ctx), width: 1 });
        g.text([0, vb], `u(b)v(b) = ${fmt(ub * vb, 4)}`, { color: tcol, font: FONT, align: 'left', baseline: 'bottom' }, 4, -6);
        if (ua * va > 1e-9) g.text([ua / 2, va / 2], 'u(a)v(a)', { color: muted(ctx), font: '12px Inter, sans-serif', align: 'center', baseline: 'middle' });
      }
      g.path(curve, { color: tcol, width: 2.8 });
      g.text([C.u(xm) * 0.45, C.v(xm) * 0.5 + (va + vb) * 0.25], '∫ u dv', { color: GOLD, font: '700 15px Inter, sans-serif', align: 'center', baseline: 'middle' });
      g.text([(C.u(xm) + ub) / 2, C.v(xm) * 0.4], '∫ v du', { color: BLUE, font: '700 15px Inter, sans-serif', align: 'center', baseline: 'middle' });
      g.point([ua, va], 4, { fill: tcol });
      g.handle({ id: 'b', at: [ub, vb], color: GREEN, label: `x = ${fmt(b, 3)}`, onDrag: (p) => {
        // nearest point of the curve over the whole domain
        let best = b, bd = Infinity;
        for (let i = 0; i <= 400; i++) { const x = P.dom[0] + ((P.dom[1] - P.dom[0]) * i) / 400; const d = Math.hypot((C.u(x) - p[0]) / (um() || 1), (C.v(x) - p[1]) / (vm() || 1)); if (d < bd) { bd = d; best = x; } }
        ctx.setParam('b', +best.toFixed(3));
      } });
    });

    const f1 = (x: number) => C.u(x) * C.dv(x), f2 = (x: number) => C.v(x) * C.du(x);
    Rp.setDraw((g) => {
      g.fillBetween(f1, () => 0, a, b, { fill: rgba(GOLD, 0.28) });
      g.fillBetween(f2, () => 0, a, b, { fill: rgba(BLUE, 0.22) });
      g.fn(f2, { color: BLUE, width: 2.2, dash: [7, 5] }, [P.dom[0], P.dom[1]]);
      g.fn(f1, { color: GOLD, width: 2.8 }, [P.dom[0], P.dom[1]]);
      g.line([a, 0], [a, f1(a)], { color: muted(ctx), width: 1 });
      g.line([b, 0], [b, f1(b)], { color: muted(ctx), width: 1 });
      g.text([P.dom[1], f1(P.dom[1])], 'u·v′  (gold area)', { color: GOLD, font: FONT, align: 'right', baseline: 'bottom' }, -6, -4);
      g.text([P.dom[1], f2(P.dom[1])], 'v·u′  (blue area)', { color: BLUE, font: FONT, align: 'right', baseline: 'top' }, -6, 6);
      g.handle({ id: 'bx', at: [b, 0], color: GREEN, onDrag: ([x]) => ctx.setParam('b', +clamp(x, P.dom[0], P.dom[1]).toFixed(3)) });
    });

    const exact = P.F(b) - P.F(a);
    ctx.setReadouts([
      { label: 'gold  ∫ u dv  (the integral we want)', value: `${fmt(gold.value, 8)}`, tone: 'good' },
      { label: 'blue  ∫ v du  (what parts trades it for)', value: fmt(blue.value, 8) },
      { label: 'u(b)v(b) − u(a)v(a)', value: fmt(box, 8) },
      { label: 'gold + blue − rectangle  (should be 0)', value: (gold.value + blue.value - box).toExponential(1), tone: Math.abs(gold.value + blue.value - box) < 1e-8 ? 'good' : 'bad' },
      ...(swapped ? [] : [{ label: 'exact  F(b) − F(a)', value: `F(x) = ${P.FTeX}`, tex: true }, { label: 'F(b) − F(a)', value: fmt(exact, 10) }]),
    ]);
    ctx.setNote(swapped
      ? `With $u = ${C.uTeX}$ and $dv = ${C.dvTeX}$ the identity still holds — the areas balance — but the leftover is $${C.restTeX}$. ${P.alt!.verdict}`
      : `$\\displaystyle\\int ${P.tex}\\,dx = ${C.uTeX}\\cdot ${C.vTeX} - ${C.restTeX} = ${P.FTeX} + C.$ ${P.why}`);

    // the worked steps (exact), then SymPy's own
    const rows: StepRow[] = [
      { title: 'Choose u and dv', tex: `u = ${C.uTeX},\\qquad dv = ${C.dvTeX}`, detail: swapped ? 'The deliberately poor choice.' : P.why, rule: 'parts' },
      { title: 'Differentiate u, integrate dv', tex: `du = ${C.duTeX},\\qquad v = ${C.vTeX}`, rule: 'parts' },
      { title: 'Apply ∫u dv = uv − ∫v du', tex: `\\int ${P.tex}\\,dx = ${C.uTeX}\\cdot ${C.vTeX} - ${C.restTeX}`, rule: 'parts' },
    ];
    if (!swapped) {
      rows.push({ title: 'Finish the remaining integral', tex: `${C.restTeX} = ${P.restTeX} + C`, rule: 'parts' });
      rows.push({ title: 'Result', tex: `\\int ${P.tex}\\,dx = ${P.FTeX} + C`, rule: 'parts' });
      rows.push({ title: `Definite: F(${fmt(b, 3)}) − F(${fmt(a, 3)})`, tex: `= ${texNum(exact, 10)}`, detail: `Adaptive quadrature agrees: ${fmt(gold.value, 10)} (difference ${Math.abs(exact - gold.value).toExponential(1)}).`, rule: 'check' });
    } else rows.push({ title: 'Stuck', detail: P.alt!.verdict, rule: 'parts' });
    runner.request(P.src, rows, () => sympyIntegralRows(P.src));
  };
  return { update, dispose() { runner.dispose(); } };
}
