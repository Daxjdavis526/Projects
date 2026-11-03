// Partial fractions: an exact decomposition (rational arithmetic), each
// piece drawn in its own colour, and a probe that stacks the pieces' values
// end to end to land exactly on the original function. The right plot builds
// the antiderivative from the pieces' logarithms and arctangents.

import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import { integrate } from '../../core/numeric/quad';
import { Factor, partialFractions, polyFromInts, polyTeX, termValue, termAntiderivative, termTeX, termAntiderivativeTeX, factorTeX, fnum, fr, fracTeX, Poly, peval, PFTerm, ZERO, fzero } from '../../core/numeric/fraction';
import { fmt, texNum, ink, muted, rgba, BLUE, GOLD, GREEN, RED, VIOLET, CYAN, ORANGE, PINK, FONT, symbolicRunner, sympyIntegralRows, safeTutorial } from './util';

const DENOMS: Record<string, { label: string; fs: Factor[]; src: string }> = {
  lin2: { label: '(x − 1)(x + 2)', fs: [{ kind: 'linear', r: 1, k: 1 }, { kind: 'linear', r: -2, k: 1 }], src: '(x-1)*(x+2)' },
  lin3: { label: 'x(x − 1)(x + 3)', fs: [{ kind: 'linear', r: 0, k: 1 }, { kind: 'linear', r: 1, k: 1 }, { kind: 'linear', r: -3, k: 1 }], src: 'x*(x-1)*(x+3)' },
  rep: { label: 'x(x − 1)²  (repeated)', fs: [{ kind: 'linear', r: 0, k: 1 }, { kind: 'linear', r: 1, k: 2 }], src: 'x*(x-1)^2' },
  quad: { label: '(x + 1)(x² + 1)  (irreducible)', fs: [{ kind: 'linear', r: -1, k: 1 }, { kind: 'quad', p: 0, q: 1, k: 1 }], src: '(x+1)*(x^2+1)' },
  quad2: { label: 'x²(x² + 4)', fs: [{ kind: 'linear', r: 0, k: 2 }, { kind: 'quad', p: 0, q: 4, k: 1 }], src: 'x^2*(x^2+4)' },
  quad3: { label: '(x − 2)(x² + 2x + 5)', fs: [{ kind: 'linear', r: 2, k: 1 }, { kind: 'quad', p: 2, q: 5, k: 1 }], src: '(x-2)*(x^2+2*x+5)' },
};
const COLS = [BLUE, RED, GREEN, VIOLET, CYAN, ORANGE, PINK];
const LETTERS = 'ABCDEFGH';

export const partfracDemo: DemoDef = {
  id: 'calc2.partfrac', module: 'calc2', title: 'Partial fractions', topic: 'Partial fraction decomposition',
  summary: 'A rational function splits into simple fractions — one per factor of the denominator — each of which integrates to a logarithm, a power, or an arctangent. Watch the pieces add up to the original, point by point.',
  tex: '\\frac{3x+5}{(x-1)(x+2)} = \\frac{8/3}{x-1} + \\frac{1/3}{x+2}',
  view: 'split2d',
  params: [
    { key: 'c3', label: 'numerator: coefficient of x³', value: 0, min: -6, max: 6, step: 1 },
    { key: 'c2', label: 'coefficient of x²', value: 0, min: -6, max: 6, step: 1 },
    { key: 'c1', label: 'coefficient of x', value: 3, min: -6, max: 6, step: 1 },
    { key: 'c0', label: 'constant term', value: 5, min: -6, max: 6, step: 1 },
    { key: 'probe', label: 'probe x (drag)', value: 2.2, min: -6, max: 6, step: 0.01 },
    { key: 'a', label: 'integrate from a', value: 2, min: -6, max: 6, step: 0.01 },
    { key: 'b', label: 'to b', value: 4, min: -6, max: 6, step: 0.01 },
  ],
  choices: [{ key: 'den', label: 'Denominator', value: 'lin2', options: Object.entries(DENOMS).map(([k, d]) => [k, d.label] as [string, string]) }],
  toggles: [{ key: 'pieces', label: 'Show each piece', value: true }, { key: 'stack', label: 'Stack the pieces at the probe', value: true }],
  experiments: [
    'Drag the probe: the coloured arrows are the values of the pieces, laid end to end — they always land exactly on the thick curve.',
    'Move the probe close to x = 1: one piece blows up, and it alone is responsible for the vertical asymptote there.',
    'Choose x(x − 1)²: a repeated factor needs two pieces, A/(x − 1) and B/(x − 1)². The second integrates to a power, not a logarithm.',
    'Choose (x + 1)(x² + 1): the irreducible quadratic gets a linear numerator Cx + D, and integrates to a logarithm plus an arctangent.',
    'Set the x³ coefficient to 1 with a quadratic denominator: the fraction is improper, and long division comes first.',
  ],
  connections: ['calc2.parts', 'calc2.improper', 'calc2.trigsub'],
  accuracy: 'The decomposition is exact: the coefficient equations are solved in rational arithmetic (no rounding), and the antiderivative is exact. Definite integrals are evaluated from it and compared with adaptive quadrature.',
  tutorial: safeTutorial([
    { text: '**The idea.** Adding fractions is easy: $\\frac{8/3}{x-1} + \\frac{1/3}{x+2} = \\frac{3x+5}{(x-1)(x+2)}$. Partial fractions runs that backwards — and the simple pieces are easy to integrate, each one a logarithm.', set: { choices: { den: 'lin2' }, params: { c3: 0, c2: 0, c1: 3, c0: 5, probe: 2.2, a: 2, b: 4 }, toggles: { pieces: true, stack: true } }, task: 'Drag the probe (the point on the thick curve) anywhere: the stacked arrows always land on the curve.' },
    { text: '**Finding the coefficients.** Write $\\frac{3x+5}{(x-1)(x+2)} = \\frac{A}{x-1} + \\frac{B}{x+2}$ and multiply by the denominator: $3x + 5 = A(x+2) + B(x-1)$. Put $x = 1$: $8 = 3A$. Put $x = -2$: $-1 = -3B$. (The “cover-up” rule.) The Steps tab shows the general method: match the coefficients of each power of $x$.', task: 'Open the Steps tab.' },
    { text: '**Asymptotes belong to pieces.** Near $x = 1$ only $\\frac{A}{x-1}$ is large: the coefficient $A$ is the strength of that pole — in complex analysis it is called the *residue*.', task: 'Drag the probe to within 0.1 of x = 1.', done: (c) => Math.abs(c.params.probe - 1) < 0.1 },
    { text: '**Repeated factors** need every power: $\\frac{x^2+1}{x(x-1)^2} = \\frac{A}{x} + \\frac{B}{x-1} + \\frac{C}{(x-1)^2}$. The last piece integrates to $-\\frac{C}{x-1}$ — a power, not a logarithm.', set: { choices: { den: 'rep' }, params: { c3: 0, c2: 1, c1: 0, c0: 1, probe: 2, a: 1.5, b: 3 } } },
    { text: '**Irreducible quadratics** get a linear numerator: $\\frac{Cx + D}{x^2+1}$ integrates to $\\frac{C}{2}\\ln(x^2+1) + D\\arctan x$. Real-valued arctangents appear exactly where the denominator has complex roots.', set: { choices: { den: 'quad' }, params: { c3: 0, c2: 2, c1: 1, c0: 1, probe: 1, a: 0, b: 2 } }, task: 'Read the antiderivative: a log from (x + 1), a log and an arctangent from (x² + 1).' },
    { text: '**Improper fractions** (degree of the top ≥ degree of the bottom) need long division first: the quotient is a polynomial, and only the remainder is decomposed.', set: { choices: { den: 'lin2' }, params: { c3: 1, c2: 0, c1: 0, c0: 1, probe: 2.5, a: 2, b: 4 } }, task: 'Find the polynomial part in the Steps tab.' },
  ]),
  create: (ctx) => createPF(ctx),
};

function prodTeX(fs: Factor[], skip: number, lessBy: number): string {
  const parts: string[] = [];
  fs.forEach((f, i) => { const k = i === skip ? f.k - lessBy : f.k; if (k > 0) parts.push(k === 1 ? factorTeX(f) : `${factorTeX(f)}^{${k}}`); });
  return parts.join('') || '1';
}

function createPF(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  L.opts.xLabel = 'x'; R.opts.xLabel = 'x';
  L.setView({ x0: -5, x1: 5, y0: -8, y1: 8 });
  R.setView({ x0: -5, x1: 5, y0: -6, y1: 6 });
  const runner = symbolicRunner(ctx);
  const update = () => {
    const D = DENOMS[ctx.choices.den] ?? DENOMS.lin2;
    const ci = [ctx.params.c0, ctx.params.c1, ctx.params.c2, ctx.params.c3].map(Math.round);
    const N: Poly = polyFromInts(ci);
    if (ci.every((c) => c === 0)) { ctx.warn('The numerator is zero: there is nothing to decompose. Give it a nonzero coefficient.'); ctx.setReadouts([]); L.setDraw(() => {}); R.setDraw(() => {}); return; }
    const pf = partialFractions(N, D.fs);
    const f = (x: number) => peval(N, x) / peval(pf.denominator, x);
    const quot = (x: number) => peval(pf.quotient, x);
    const hasQ = !(pf.quotient.length === 1 && fzero(pf.quotient[0]));
    const pieces = pf.terms.map((t) => (x: number) => termValue(t, D.fs[t.factor], x));
    const Fq = (x: number) => pf.quotient.reduce((s, c, k) => s + (fnum(c) * x ** (k + 1)) / (k + 1), 0);
    const antis = pf.terms.map((t) => (x: number) => termAntiderivative(t, D.fs[t.factor], x));
    const F = (x: number) => Fq(x) + antis.reduce((s, g) => s + g(x), 0);
    // real poles that survive (a factor whose coefficients are all zero cancels)
    const poles = D.fs.flatMap((fa, i) => (fa.kind === 'linear' && pf.terms.some((t) => t.factor === i && t.A && !fzero(t.A)) ? [fa.r] : []));
    const t = ink(ctx), probe = ctx.params.probe, a = Math.min(ctx.params.a, ctx.params.b), b = Math.max(ctx.params.a, ctx.params.b);
    const poleInside = poles.find((p) => p >= a && p <= b);

    L.setDraw((g) => {
      for (const p of poles) g.line([p, g.view.y0], [p, g.view.y1], { color: muted(ctx), width: 1, dash: [4, 5] });
      if (ctx.toggles.pieces) {
        if (hasQ) g.fn(quot, { color: GOLD, width: 1.8, dash: [3, 3] });
        pieces.forEach((pc, i) => g.fn(pc, { color: COLS[i % COLS.length], width: 1.8 }));
      }
      g.fn(f, { color: t, width: 3 });
      if (ctx.toggles.stack) {
        let y = 0;
        const step = (g.view.x1 - g.view.x0) * 0.012;
        const items: { v: number; c: string }[] = [...(hasQ ? [{ v: quot(probe), c: GOLD }] : []), ...pieces.map((pc, i) => ({ v: pc(probe), c: COLS[i % COLS.length] }))];
        items.forEach((it, i) => { if (Number.isFinite(it.v)) { const xx = probe + (i + 1) * step; g.arrow([xx, y], [xx, y + it.v], { color: it.c, width: 3 }); g.line([probe, y + it.v], [xx, y + it.v], { color: it.c, width: 1, alpha: 0.6 }); y += it.v; } });
        g.line([probe, 0], [probe, f(probe)], { color: t, width: 1, dash: [2, 3] });
      }
      g.handle({ id: 'p', at: [probe, Number.isFinite(f(probe)) ? Math.max(g.view.y0, Math.min(g.view.y1, f(probe))) : 0], color: t, label: `x = ${fmt(probe, 3)}`, onDrag: ([x]) => ctx.setParam('probe', +x.toFixed(3)) });
      // a legend of the pieces
      const legend = [...(hasQ ? [{ s: `polynomial ${polyTeXPlain(pf.quotient)}`, c: GOLD }] : []), ...pf.terms.map((tm, i) => ({ s: termPlain(tm, D.fs[tm.factor]), c: COLS[i % COLS.length] }))];
      legend.forEach((l, i) => g.text([g.view.x0, g.view.y1], l.s, { color: l.c, font: FONT }, 10, 22 + 18 * i));
      g.text([g.view.x1, g.view.y1], 'thick: the original fraction', { color: t, font: FONT, align: 'right' }, -12, 22);
    });

    let q: ReturnType<typeof integrate> | null = null;
    if (!poleInside) q = integrate(f, a, b, 1e-11);
    R.setDraw((g) => {
      for (const p of poles) g.line([p, g.view.y0], [p, g.view.y1], { color: muted(ctx), width: 1, dash: [4, 5] });
      if (!poleInside) g.fillBetween(f, () => 0, a, b, { fill: rgba(GOLD, 0.25) });
      g.fn(f, { color: muted(ctx), width: 1.4 });
      if (ctx.toggles.pieces) antis.forEach((A, i) => g.fn(A, { color: COLS[i % COLS.length], width: 1.5, dash: [6, 4] }));
      g.fn(F, { color: GOLD, width: 2.8 });
      g.text([g.view.x0, g.view.y1], 'gold: F(x), an antiderivative (dashed: each piece’s)', { color: GOLD, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], 'grey: the integrand; shaded: ∫ₐᵇ', { color: muted(ctx), font: FONT }, 10, 40);
      g.handle({ id: 'a', at: [a, 0], color: GREEN, label: 'a', onDrag: ([x]) => ctx.setParam('a', +x.toFixed(3)) });
      g.handle({ id: 'b', at: [b, 0], color: GREEN, label: 'b', onDrag: ([x]) => ctx.setParam('b', +x.toFixed(3)) });
    });

    const exact = F(b) - F(a);
    const decTeX = (hasQ ? polyTeX(pf.quotient) + ' + ' : '') + pf.terms.map((tm) => termTeX(tm, D.fs[tm.factor])).join(' + ').replace(/\+ \\frac\{-/g, '- \\frac{');
    const antiTeX = (hasQ ? polyTeX(integratePoly(pf.quotient)) : '') + pf.terms.map((tm) => termAntiderivativeTeX(tm, D.fs[tm.factor])).join('');
    const fTeX = `\\frac{${polyTeX(N)}}{${D.fs.map((fa) => (fa.k === 1 ? factorTeX(fa) : `${factorTeX(fa)}^{${fa.k}}`)).join('')}}`;
    ctx.warn(poleInside !== undefined ? `The interval [${fmt(a, 3)}, ${fmt(b, 3)}] contains the pole x = ${poleInside}: the integral is improper there and diverges (|ln| or a power blows up). Move a and b to one side of it.` : '');
    ctx.setReadouts([
      { label: 'the fraction', value: fTeX, tex: true },
      { label: 'decomposed (exact)', value: decTeX, tex: true },
      { label: 'antiderivative', value: antiTeX.replace(/^\+/, '') + ' + C', tex: true },
      { label: `pieces summed at x = ${fmt(probe, 3)}`, value: fmt(quot(probe) * (hasQ ? 1 : 0) + pieces.reduce((s, pc) => s + pc(probe), 0), 10) },
      { label: 'the fraction at x', value: fmt(f(probe), 10) },
      ...(q ? [{ label: `F(b) − F(a)`, value: fmt(exact, 10), tone: (Math.abs(exact - q.value) < 1e-8 * Math.max(1, Math.abs(q.value)) ? 'good' : 'bad') as 'good' | 'bad' }, { label: '∫ₐᵇ by quadrature', value: `${fmt(q.value, 10)}` }] : [{ label: '∫ₐᵇ', value: 'diverges (pole inside)', tone: 'bad' as const }]),
    ]);
    ctx.setNote(`$$${fTeX} = ${decTeX}$$ Each piece integrates on its own: $\\frac{A}{x-r}\\to A\\ln|x-r|$, $\\frac{A}{(x-r)^k}\\to -\\frac{A}{(k-1)(x-r)^{k-1}}$, $\\frac{Cx+D}{x^2+q}\\to\\frac{C}{2}\\ln(x^2+q) + \\frac{D}{q^{1/2}}\\arctan\\frac{x}{q^{1/2}}$.`);

    // exact working
    let letter = 0;
    const unknown = pf.terms.map((tm) => { const fa = D.fs[tm.factor]; if (fa.kind === 'linear') return { tm, num: LETTERS[letter++] }; const B = LETTERS[letter++], C = LETTERS[letter++]; return { tm, num: `${B}x + ${C}` }; });
    const den = (tm: PFTerm) => { const fa = D.fs[tm.factor]; return tm.power === 1 ? factorTeX(fa) : `${factorTeX(fa)}^{${tm.power}}`; };
    const rows: StepRow[] = [];
    const R0 = pf.remainder;
    if (hasQ) rows.push({ title: 'The top has degree ≥ the bottom: divide first', tex: `${fTeX} = ${polyTeX(pf.quotient)} + \\frac{${polyTeX(R0)}}{${D.fs.map((fa) => (fa.k === 1 ? factorTeX(fa) : `${factorTeX(fa)}^{${fa.k}}`)).join('')}}`, rule: 'long division' });
    rows.push({ title: 'One fraction per factor (every power of a repeated factor; a linear top over a quadratic)', tex: `\\frac{${polyTeX(R0)}}{\\cdots} = ${unknown.map((u) => `\\frac{${u.num}}{${den(u.tm)}}`).join(' + ')}`, rule: 'form' });
    rows.push({ title: 'Multiply by the denominator', tex: `${polyTeX(R0)} = ${unknown.map((u) => `${u.num.includes('+') ? `(${u.num})` : u.num}${prodTeX(D.fs, u.tm.factor, u.tm.power)}`).join(' + ')}`, detail: 'This must hold for every x. Matching the coefficients of each power of x gives a square linear system (or plug in the roots — the “cover-up” shortcut).', rule: 'algebra' });
    const solved = unknown.map((u) => { const fa = D.fs[u.tm.factor]; if (fa.kind === 'linear') return `${u.num} = ${fracTeX(u.tm.A!)}`; const [B, , C] = u.num.split(' '); return `${B.replace('x', '')} = ${fracTeX(u.tm.B!)},\\ ${C} = ${fracTeX(u.tm.C!)}`; });
    rows.push({ title: 'Solve (exactly, in fractions)', tex: solved.join(',\\quad '), rule: 'linear system' });
    rows.push({ title: 'The decomposition', tex: `${fTeX} = ${decTeX}`, rule: 'result' });
    rows.push({ title: 'Integrate each piece', tex: `\\int ${fTeX}\\,dx = ${antiTeX.replace(/^\+/, '')} + C`, rule: 'table' });
    if (q) rows.push({ title: `Definite, from ${fmt(a, 3)} to ${fmt(b, 3)}`, tex: `F(b) - F(a) = ${texNum(exact, 10)}`, detail: `Quadrature: ${fmt(q.value, 10)}.`, rule: 'check' });
    const src = `(${ci[3]}*x^3 + ${ci[2]}*x^2 + ${ci[1]}*x + ${ci[0]})/(${D.src})`.replace(/\+ -/g, '- ');
    runner.request(src, rows, () => sympyIntegralRows(src));
  };
  return { update, dispose() { runner.dispose(); } };
}

function integratePoly(p: Poly): Poly { return [ZERO, ...p.map((c, k) => fr(c.n, c.d * (k + 1)))]; }
function polyTeXPlain(p: Poly): string { return polyTeX(p).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\^\{(\d+)\}/g, '^$1').replace(/\s+/g, ' '); }
function termPlain(t: PFTerm, f: Factor): string {
  const den = f.kind === 'linear' ? (f.r === 0 ? 'x' : `(x ${f.r > 0 ? '−' : '+'} ${Math.abs(f.r)})`) : `(${polyTeXPlain(polyFromInts([f.q, f.p, 1]))})`;
  const num = f.kind === 'linear' ? fracPlain(t.A!.n, t.A!.d) : `(${polyTeXPlain([t.C!, t.B!])})`;
  return `${num} / ${den}${t.power > 1 ? superscript(t.power) : ''}`;
}
const fracPlain = (n: number, d: number) => (d === 1 ? String(n) : `${n}/${d}`).replace('-', '−');
const superscript = (k: number) => String(k).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');
