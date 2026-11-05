// Taylor Builder: add terms one at a time and watch the polynomial wrap itself
// around the function; drag the centre and the whole approximation follows.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../modules/types';
import type { Graphics } from '../engine/plot2d';
import { SERIES, colormapCss } from '../engine/colors';
import { parse, compile, freeSymbols, CONSTANTS, Node } from '../core/expr';
import { taylorCoeffs, taylorEval, radiusEstimate, approach, smoothstep } from '../core/numeric/fidget';
import { fmt, tx, ping, frameLoop, rhs, keyboard } from './common';

const NMAX = 24;
const TOL = 0.01;

function create(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  let node: Node | null = null, f: (x: number) => number = () => NaN;
  let lastSrc = '';
  let coeffs: number[] | null = null;
  let aShown = ctx.params.a, aTarget = ctx.params.a;
  let nu = ctx.params.N;                       // the displayed (continuous) order

  const coeffsAt = (a: number) => {
    if (!node) return;
    try { coeffs = taylorCoeffs(node, 'x', a, NMAX); }
    catch { coeffs = null; }
  };

  /** the good zone: the interval around a where |f − P_N| < TOL (scanned outward) */
  const goodZone = (c: number[], a: number, N: number): [number, number] | null => {
    const ok = (x: number) => { const e = Math.abs(f(x) - taylorEval(c, a, x, N)); return Number.isFinite(e) && e < TOL; };
    if (!ok(a)) return null;
    const { x0, x1 } = plot.view, step = (x1 - x0) / 800;
    let lo = a, hi = a;
    while (lo - step > x0 - (x1 - x0) && ok(lo - step)) lo -= step;
    while (hi + step < x1 + (x1 - x0) && ok(hi + step)) hi += step;
    return [lo, hi];
  };

  const draw = (g: Graphics) => {
    g.fn(f, { color: SERIES[0], width: 3 });
    if (!coeffs) return;
    const a = aShown, order = Math.floor(nu), w = smoothstep(nu - order);
    const c = coeffs;
    if (ctx.toggles.zone) {
      const z = goodZone(c, a, order);
      if (z) {
        const { y0, y1 } = g.view;
        g.polygon([[z[0], y0], [z[1], y0], [z[1], y1], [z[0], y1]], { fill: SERIES[3], alpha: 0.07 });
        g.line([z[0], y0], [z[0], y1], { color: SERIES[3], width: 1, dash: [3, 4], alpha: 0.6 });
        g.line([z[1], y0], [z[1], y1], { color: SERIES[3], width: 1, dash: [3, 4], alpha: 0.6 });
      }
    }
    if (ctx.toggles.terms) {
      for (let k = 0; k <= Math.min(order + (w > 0 ? 1 : 0), NMAX); k++) {
        const ck = c[k] * (k === order + 1 ? w : 1);
        if (ck === 0) continue;
        g.fn((x) => ck * Math.pow(x - a, k), { color: colormapCss('plasma', 0.25 + 0.7 * (k / Math.max(1, ctx.params.N))), width: 1.1, alpha: 0.55 });
      }
    }
    // the polynomial so far, and the newest term growing in
    g.fn((x) => taylorEval(c, a, x, order, w), { color: SERIES[1], width: 2.4 });
    const ya = f(a);
    g.line([a, g.view.y0], [a, g.view.y1], { color: SERIES[1], width: 1, dash: [2, 5], alpha: 0.5 });
    g.text([a, g.view.y1], `degree ${order}${w > 0.02 ? ` → ${order + 1}` : ''}`, { color: SERIES[1], font: '600 12px Inter, sans-serif', align: 'center', baseline: 'top' }, 0, 8);
    g.handle({ id: 'a', at: [a, Number.isFinite(ya) ? ya : 0], color: SERIES[1], r: 8, label: 'a', onDrag: ([px]) => { aTarget = Math.round(px * 100) / 100; ctx.setParam('a', aTarget); report(); }, constrain: ([px]) => [px, f(px)] });
  };

  const polyTeX = (c: number[], a: number, N: number) => {
    const terms: string[] = [];
    const xa = Math.abs(a) < 1e-12 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${tx(Math.abs(a), 3)})`;
    let shownTerms = 0;
    for (let k = 0; k <= N; k++) {
      if (Math.abs(c[k]) < 1e-14) continue;
      if (shownTerms === 6) { terms.push('\\cdots'); break; }
      const coef = tx(Math.abs(c[k]), 4);
      const mon = k === 0 ? '' : k === 1 ? xa : `${xa}^{${k}}`;
      terms.push(`${terms.length ? (c[k] < 0 ? '- ' : '+ ') : c[k] < 0 ? '-' : ''}${k > 0 && coef === '1' ? '' : coef}${mon}`);
      shownTerms++;
    }
    return terms.length ? terms.join(' ') : '0';
  };

  const report = () => {
    const N = ctx.params.N, a = aTarget;
    if (!node) return;
    let c: number[];
    try { c = taylorCoeffs(node, 'x', a, NMAX); }
    catch (e) { ctx.setReadouts([]); ctx.warn(`No Taylor series about a = ${fmt(a)}: ${(e as Error).message}. Drag the centre elsewhere.`); return; }
    ctx.warn('');
    const z = goodZone(c, a, N);
    const R = radiusEstimate(c);
    let maxErr = 0;
    for (let i = 0; i <= 200; i++) { const x = a - 1 + (2 * i) / 200, e = Math.abs(f(x) - taylorEval(c, a, x, N)); if (Number.isFinite(e)) maxErr = Math.max(maxErr, e); else { maxErr = NaN; break; } }
    const rows: Readout[] = [
      { label: 'degree N', value: String(N) },
      { label: 'centre a', value: fmt(a, 4) },
      { label: `next term c_${N + 1}`, value: fmt(c[N + 1] ?? NaN, 4), tone: 'muted' },
      { label: `|f − P_N| < ${TOL} on`, value: z ? `[${fmt(z[0], 3)}, ${fmt(z[1], 3)}]` : 'nowhere (not even at a)' },
      { label: 'max |f − P_N| on [a−1, a+1]', value: Number.isFinite(maxErr) ? fmt(maxErr, 3) : 'f undefined there', tone: maxErr < TOL ? 'good' : undefined },
      { label: 'radius of convergence (estimate)', value: Number.isFinite(R) ? `≈ ${fmt(R, 2)}` : '∞ (no finite radius in sight)', tone: 'muted' },
      { label: 'P_N(x)', value: polyTeX(c, a, N), tex: true },
    ];
    ctx.setReadouts(rows);
    ctx.setNote(`$P_{${N}}(x) = \\sum_{k=0}^{${N}} \\frac{f^{(k)}(a)}{k!}(x-a)^k$ about $a = ${tx(a)}$. Press **+** / **−** to add or remove a term; drag the yellow centre. The green band is where the polynomial is within ${TOL} of $f$.`);
  };

  const update = () => {
    if (ctx.input !== lastSrc) {
      lastSrc = ctx.input;
      try {
        const n = parse(rhs(ctx.input));
        const free = [...freeSymbols(n)].filter((s) => s !== 'x' && !(s in CONSTANTS));
        if (free.length) throw new Error(`“${free[0]}” has no value — write f in terms of x only`);
        const g = compile(n, ['x']), buf = [0];
        node = n; f = (x) => { buf[0] = x; return g(buf); };
        coeffsAt(aShown);
      } catch (e) { ctx.warn(`Could not read f: ${(e as Error).message}`); }
    }
    if (Math.abs(ctx.params.a - aTarget) > 1e-12) aTarget = ctx.params.a;
    if (aShown === aTarget) coeffsAt(aShown);
    report();
    plot.setDraw(draw);
  };

  const keys = keyboard(['+', '=', '-', '_'], (k) => {
    const N = ctx.params.N + (k === '+' || k === '=' ? 1 : -1);
    if (N >= 0 && N <= 20) { ctx.setParam('N', N); report(); }
  });

  let lastOrder = Math.floor(nu);
  const stop = frameLoop((dt) => {
    let changed = false;
    if (Math.abs(aShown - aTarget) > 1e-6) {
      aShown = approach(aShown, aTarget, 16, dt);
      if (Math.abs(aShown - aTarget) <= 1e-6) aShown = aTarget;
      coeffsAt(aShown); changed = true;
    }
    const N = ctx.params.N;
    if (nu !== N) {
      // one term at a time, faster when far behind
      const rate = Math.max(2.6, Math.abs(N - nu) * 2.2);
      nu = N > nu ? Math.min(N, nu + rate * dt) : Math.max(N, nu - rate * dt);
      const o = Math.floor(nu);
      if (o !== lastOrder) { ping(0.25 + 0.035 * Math.max(o, lastOrder)); lastOrder = o; }
      changed = true;
    }
    if (changed) plot.render();
  });

  return { update, dispose() { stop(); keys.stop(); } };
}

export const taylorBuilder: DemoDef = {
  id: 'fidget.taylor', module: 'fidget', title: 'Taylor Builder', topic: 'Taylor polynomials, convergence, radius of convergence',
  summary: 'Add Taylor terms one by one — each grows into place — and watch the polynomial hug the function over a wider and wider stretch. Drag the centre anywhere.',
  tex: 'P_N(x) = \\sum_{k=0}^{N} \\frac{f^{(k)}(a)}{k!}(x-a)^k',
  view: '2d',
  input: { label: 'f(x) =', value: 'f(x) = sin(x)', placeholder: 'e.g. exp(x), 1/(1+x^2), ln(1+x), cos(x)' },
  params: [
    { key: 'N', label: 'number of terms: degree N', value: 3, min: 0, max: 20, step: 1 },
    { key: 'a', label: 'centre a (drag the point)', value: 0, min: -6, max: 6, step: 0.01 },
  ],
  toggles: [
    { key: 'zone', label: `Shade where |f − P| < ${TOL}`, value: true },
    { key: 'terms', label: 'Show the individual terms', value: false },
  ],
  experiments: [
    'Press **+** again and again: for sin(x) the green band widens with every second term, without end (infinite radius).',
    'Type `1/(1+x^2)`. However many terms you add, the band never passes |x| = 1 — the complex poles at ±i set the radius.',
    'Now drag the centre of `1/(1+x^2)` to a = 1: the radius grows to √2, the distance to i.',
    'Try `ln(1+x)` and drag the centre toward −1: the series fails at the singularity, and the warning tells you why.',
    'Turn on the individual terms for `exp(x)`: big terms cancel to make a small function for negative x.',
  ],
  connections: ['fidget.derivative'],
  accuracy: 'The coefficients f⁽ᵏ⁾(a)/k! are computed by Taylor-mode automatic differentiation — the exact recurrences for products, quotients, powers, exp, ln and the trigonometric family — so they are exact up to floating-point rounding, with no finite differences. The radius of convergence is a rough numerical estimate (Cauchy–Hadamard on the last coefficients); the green band is found by scanning |f − P_N| on a fine grid.',
  tutorial: [
    { text: 'The yellow curve is the Taylor polynomial of degree 3 for sin x about a = 0. Near the centre it is almost indistinguishable from sin x; far away it flies off.', task: 'Press + (or move the slider) until the degree is 7.', set: { input: 'f(x) = sin(x)', params: { N: 3, a: 0 }, toggles: { zone: true } }, done: (c) => c.params.N >= 7 },
    { text: 'The green band is where $|f - P_N| < 0.01$. Each new term is $\\frac{f^{(k)}(a)}{k!}(x-a)^k$ — for sin x the even ones vanish, so the band grows every second press. By Taylor’s theorem the error is at most $\\frac{|x-a|^{N+1}}{(N+1)!}$ here, which goes to 0 for every x: sin x equals its Taylor series everywhere.', task: 'Reach degree 15 and see how far the band reaches.', done: (c) => c.params.N >= 15 },
    { text: 'Now a function with a finite radius: $\\frac{1}{1+x^2}$ is perfectly smooth on the real line, yet its series about 0 diverges for |x| > 1. The reason is in the complex plane — poles at $x = \\pm i$, a distance 1 away.', task: 'Add terms: does the band ever pass |x| = 1?', set: { input: 'f(x) = 1/(1+x^2)', params: { N: 4, a: 0 } }, done: (c) => c.params.N >= 12 },
    { text: 'Move the centre: the radius of convergence is the distance from a to the nearest complex singularity, $(a^2+1)^{1/2}$.', task: 'Drag the centre to a = 1 and read the radius estimate (≈ 1.41).', done: (c) => Math.abs(c.params.a - 1) < 0.1 },
  ],
  create,
};
