// ∫ sinᵐx cosⁿx dx: with an odd power, save one factor and substitute — the
// area moves, unchanged, to a polynomial in u; with both powers even, the
// half-angle identities turn the integrand into a constant plus cosines.

import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import { integrate } from '../../core/numeric/quad';
import { fr, fracTeX, Frac, fadd, fzero } from '../../core/numeric/fraction';
import { fmt, texNum, ink, muted, rgba, BLUE, GOLD, GREEN, VIOLET, CYAN, ORANGE, PINK, RED, FONT, symbolicRunner, sympyIntegralRows } from './util';

const binom = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

/** sinᵐ cosⁿ = Σ_k A_k cos(2k x) for m, n even: exact rational A_k. */
export function evenExpansion(m: number, n: number): Frac[] {
  // (z − 1/z)^m (z + 1/z)^n = Σ P_j z^j, j from −(m+n) to m+n
  const N = m + n, P = new Array(2 * N + 1).fill(0);
  for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) {
    const pw = (m - 2 * i) + (n - 2 * j);
    P[pw + N] += binom(m, i) * (i % 2 ? -1 : 1) * binom(n, j);
  }
  const D = (m / 2) % 2 ? -(2 ** N) : 2 ** N;     // (2i)^m 2^n with m even
  const out: Frac[] = [];
  for (let k = 0; 2 * k <= N; k++) out.push(fr(k === 0 ? P[N] : 2 * P[N + 2 * k], D));
  return out;
}

function powTeX(fn: string, p: number) { return p === 0 ? '' : p === 1 ? `\\${fn} x` : `\\${fn}^{${p}} x`; }
function integrandTeX(m: number, n: number) { const s = [powTeX('sin', m), powTeX('cos', n)].filter(Boolean).join('\\,'); return s || '1'; }
function signedTerms(terms: { c: Frac; body: string }[]): string {
  const out = terms.filter((t) => !fzero(t.c)).map((t, i) => {
    const neg = t.c.n < 0, mag = fr(Math.abs(t.c.n), t.c.d);
    const coef = mag.n === 1 && mag.d === 1 && t.body ? '' : fracTeX(mag);
    return `${neg ? '-' : i ? '+' : ''}${coef}${t.body}`;
  });
  return out.join(' ') || '0';
}

interface Plan { kind: 'cos-odd' | 'sin-odd' | 'even'; F: (x: number) => number; FTeX: string; uTeX: string; g?: (u: number) => number; u?: (x: number) => number; expansion?: Frac[]; steps: StepRow[] }

function plan(m: number, n: number): Plan {
  const I = integrandTeX(m, n);
  if (n % 2 === 1) {
    const k = (n - 1) / 2;
    const terms = Array.from({ length: k + 1 }, (_, j) => ({ c: fr(binom(k, j) * (j % 2 ? -1 : 1), m + 2 * j + 1), p: m + 2 * j + 1 }));
    const F = (x: number) => terms.reduce((s, t) => s + (t.c.n / t.c.d) * Math.sin(x) ** t.p, 0);
    const FTeX = signedTerms(terms.map((t) => ({ c: t.c, body: `\\sin^{${t.p}} x` }))).replace(/\^\{1\}/g, '');
    const uPoly = k === 0 ? (m ? `u^{${m}}` : '1') : `${m ? `u^{${m}}` : ''}(1-u^2)^{${k}}`.replace('^{1}', '');
    return {
      kind: 'cos-odd', F, FTeX, uTeX: uPoly.replace(/\^\{1\}/g, ''), u: Math.sin, g: (u) => u ** m * (1 - u * u) ** k,
      steps: [
        { title: 'The power of cosine is odd: save one cos x', tex: `${I} = \\sin^{${m}} x\\,(\\cos^2 x)^{${k}}\\cos x`.replace(/\(([^()]*)\)\^\{0\}/g, '').replace(/\^\{1\}/g, '').replace('\\sin^{0} x\\,', ''), rule: 'trig' },
        { title: 'Use cos²x = 1 − sin²x', tex: `= \\sin^{${m}} x\\,(1-\\sin^2 x)^{${k}}\\cos x`.replace(/\(([^()]*)\)\^\{0\}/g, '').replace(/\^\{1\}/g, '').replace('\\sin^{0} x\\,', ''), rule: 'identity' },
        { title: 'Substitute u = sin x, du = cos x dx', tex: `\\int ${I}\\,dx = \\int ${uPoly.replace(/\^\{1\}/g, '')}\\,du`, rule: 'substitution' },
        { title: 'Expand and integrate the polynomial, then put u = sin x back', tex: `= ${FTeX} + C`, rule: 'power rule' },
      ],
    };
  }
  if (m % 2 === 1) {
    const k = (m - 1) / 2;
    const terms = Array.from({ length: k + 1 }, (_, j) => ({ c: fr(-binom(k, j) * (j % 2 ? -1 : 1), n + 2 * j + 1), p: n + 2 * j + 1 }));
    const F = (x: number) => terms.reduce((s, t) => s + (t.c.n / t.c.d) * Math.cos(x) ** t.p, 0);
    const FTeX = signedTerms(terms.map((t) => ({ c: t.c, body: `\\cos^{${t.p}} x` }))).replace(/\^\{1\}/g, '');
    const uPoly = `${n ? `u^{${n}}` : ''}(1-u^2)^{${k}}`;
    return {
      kind: 'sin-odd', F, FTeX, uTeX: (k === 0 ? (n ? `u^{${n}}` : '1') : uPoly).replace(/\^\{1\}/g, ''), u: Math.cos, g: (u) => -(u ** n) * (1 - u * u) ** k,
      steps: [
        { title: 'The power of sine is odd: save one sin x', tex: `${I} = (\\sin^2 x)^{${k}}\\cos^{${n}} x\\,\\sin x`.replace(/\(([^()]*)\)\^\{0\}/g, '').replace(/\^\{1\}/g, '').replace('\\cos^{0} x\\,', ''), rule: 'trig' },
        { title: 'Use sin²x = 1 − cos²x', tex: `= (1-\\cos^2 x)^{${k}}\\cos^{${n}} x\\,\\sin x`.replace(/\(([^()]*)\)\^\{0\}/g, '').replace(/\^\{1\}/g, '').replace('\\cos^{0} x\\,', ''), rule: 'identity' },
        { title: 'Substitute u = cos x, du = −sin x dx', tex: `\\int ${I}\\,dx = -\\int ${(k === 0 ? (n ? `u^{${n}}` : '1') : uPoly).replace(/\^\{1\}/g, '')}\\,du`, rule: 'substitution' },
        { title: 'Integrate the polynomial, then put u = cos x back', tex: `= ${FTeX} + C`, rule: 'power rule' },
      ],
    };
  }
  const A = evenExpansion(m, n);
  const F = (x: number) => A.reduce((s, c, k) => s + (k === 0 ? (c.n / c.d) * x : ((c.n / c.d) * Math.sin(2 * k * x)) / (2 * k)), 0);
  const expTeX = signedTerms(A.map((c, k) => ({ c, body: k === 0 ? '' : `\\cos ${2 * k}x` })));
  const FTeX = signedTerms(A.map((c, k) => ({ c: k === 0 ? c : fr(c.n, c.d * 2 * k), body: k === 0 ? 'x' : `\\sin ${2 * k}x` })));
  return {
    kind: 'even', F, FTeX, uTeX: '', expansion: A,
    steps: [
      { title: 'Both powers even: use the half-angle identities', tex: '\\sin^2 x = \\tfrac{1 - \\cos 2x}{2},\\qquad \\cos^2 x = \\tfrac{1 + \\cos 2x}{2}', rule: 'identity' },
      { title: 'Expand (repeat for any cos² 2x that appears)', tex: `${I} = ${expTeX}`, detail: 'Equivalently: a trigonometric polynomial — a finite Fourier series. Its constant term is the average value.', rule: 'algebra' },
      { title: 'Integrate term by term', tex: `\\int ${I}\\,dx = ${FTeX} + C`, rule: 'table' },
    ],
  };
}

export const trigintDemo: DemoDef = {
  id: 'calc2.trigint', module: 'calc2', title: 'Trigonometric integrals', topic: 'Trigonometric integrals: sinᵐx cosⁿx',
  summary: 'An odd power lets you save one factor and substitute: the area moves, unchanged, to a polynomial. Even powers need the half-angle identities — the integrand becomes a constant plus cosines.',
  tex: '\\int \\sin^m x\\cos^n x\\,dx',
  view: 'split2d',
  params: [
    { key: 'm', label: 'power of sin, m', value: 2, min: 0, max: 7, step: 1 },
    { key: 'n', label: 'power of cos, n', value: 3, min: 0, max: 7, step: 1 },
    { key: 'a', label: 'lower limit a', value: 0, min: -3.2, max: 6.3, step: 0.01 },
    { key: 'b', label: 'upper limit b', value: 1.2, min: -3.2, max: 6.3, step: 0.01 },
  ],
  experiments: [
    'With n odd, compare the two shaded areas: the x-integral and the u-integral are equal for every a and b — substitution moves area, it does not change it.',
    'Push b past π/2 when u = sin x: u turns back, and the u-integral retraces part of its path. The signed areas still agree.',
    'Set m = n = 2: no odd power. The right plot shows the integrand as a constant (its average, 1/8) plus cos 4x — integrate each piece.',
    'With both powers even, take a = 0 and b = 2π: only the constant term survives — every cos(2kx) integrates to zero over a period.',
  ],
  connections: ['calc2.trigsub', 'calc2.parts'],
  accuracy: 'Antiderivatives are exact: binomial expansion for an odd power, and exact rational Fourier coefficients (from (e^{ix} ± e^{−ix})ⁿ) for even powers. Areas are adaptive quadrature (≈1e−10). SymPy’s steps are shown beside MathVerse’s.',
  create: (ctx) => createTrig(ctx),
};

function createTrig(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  const runner = symbolicRunner(ctx);
  L.opts.xLabel = 'x'; R.opts.xLabel = 'u';
  L.setView({ x0: -0.6, x1: 6.6, y0: -1.25, y1: 1.25 });
  R.setView({ x0: -1.35, x1: 1.35, y0: -1.25, y1: 1.25 });
  let lastKind = '';
  const update = () => {
    const m = Math.round(ctx.params.m), n = Math.round(ctx.params.n), a = ctx.params.a, b = ctx.params.b;
    const f = (x: number) => Math.sin(x) ** m * Math.cos(x) ** n;
    const P = plan(m, n);
    const q = integrate(f, a, b, 1e-11);
    const exact = P.F(b) - P.F(a);
    const t = ink(ctx);
    L.setDraw((g) => {
      g.fillBetween(f, () => 0, Math.min(a, b), Math.max(a, b), { fill: rgba(GOLD, 0.3) });
      g.fn(f, { color: GOLD, width: 2.6 });
      for (const [x, lab] of [[Math.PI / 2, 'π/2'], [Math.PI, 'π'], [1.5 * Math.PI, '3π/2'], [2 * Math.PI, '2π']] as [number, string][]) g.text([x, 0], lab, { color: muted(ctx), font: '11px Inter, sans-serif', align: 'center', baseline: 'top' }, 0, 16);
      g.text([g.view.x1, g.view.y1], `y = ${m ? `sin${m > 1 ? superscript(m) : ''}x` : ''}${m && n ? ' · ' : ''}${n ? `cos${n > 1 ? superscript(n) : ''}x` : ''}${!m && !n ? '1' : ''}`, { color: GOLD, font: FONT, align: 'right' }, -12, 22);
      g.handle({ id: 'a', at: [a, 0], color: GREEN, label: 'a', onDrag: ([x]) => ctx.setParam('a', +x.toFixed(3)) });
      g.handle({ id: 'b', at: [b, 0], color: GREEN, label: 'b', onDrag: ([x]) => ctx.setParam('b', +x.toFixed(3)) });
    });
    if (`${m},${n}` !== lastKind) {
      // fit both views to this integrand's size
      lastKind = `${m},${n}`;
      let M = 0;
      for (let i = 0; i <= 400; i++) M = Math.max(M, Math.abs(f((2 * Math.PI * i) / 400)));
      let Mu = 0;
      if (P.g) for (let i = 0; i <= 400; i++) Mu = Math.max(Mu, Math.abs(P.g(-1 + (2 * i) / 400)));
      const yl = Math.max(M, 0.05) * 1.35, yu = Math.max(Mu, 0.05) * 1.35;
      L.setView({ x0: -0.6, x1: 6.6, y0: -yl, y1: yl });
      if (P.kind === 'even') { R.opts.xLabel = 'x'; R.setView({ x0: -0.6, x1: 6.6, y0: -yl, y1: yl }); }
      else { R.opts.xLabel = 'u'; R.setView({ x0: -1.35, x1: 1.35, y0: -yu, y1: yu }); }
    }
    let rightVal = NaN;
    if (P.kind !== 'even') {
      const ua = P.u!(a), ub = P.u!(b), gg = P.g!;
      rightVal = integrate(gg, ua, ub, 1e-11).value;
      R.setDraw((g) => {
        g.fillBetween(gg, () => 0, Math.min(ua, ub), Math.max(ua, ub), { fill: rgba(BLUE, 0.3) });
        g.fn(gg, { color: BLUE, width: 2.6 }, [-1, 1]);
        g.line([-1, g.view.y0], [-1, g.view.y1], { color: muted(ctx), width: 1, dash: [3, 4] });
        g.line([1, g.view.y0], [1, g.view.y1], { color: muted(ctx), width: 1, dash: [3, 4] });
        g.point([ua, 0], 5, { fill: GREEN }); g.point([ub, 0], 5, { fill: GREEN });
        g.text([ua, 0], `u(a)`, { color: GREEN, font: FONT, align: 'center' }, 0, -10);
        g.text([ub, 0], `u(b)`, { color: GREEN, font: FONT, align: 'center' }, 0, 22);
        g.text([g.view.x0, g.view.y1], `${P.kind === 'cos-odd' ? 'u = sin x' : 'u = cos x  (du = −sin x dx: the sign flips)'}`, { color: t, font: FONT }, 10, 22);
      });
    } else {
      const A = P.expansion!, cols = [VIOLET, CYAN, ORANGE, PINK, RED, GREEN, BLUE, GOLD];
      R.setDraw((g) => {
        g.fillBetween(f, () => 0, Math.min(a, b), Math.max(a, b), { fill: rgba(GOLD, 0.16) });
        A.forEach((c, k) => { const v = c.n / c.d; if (v) g.fn((x) => v * Math.cos(2 * k * x), { color: cols[k % cols.length], width: 1.6, dash: k ? [5, 4] : undefined }); });
        g.fn(f, { color: GOLD, width: 2.6 });
        A.forEach((c, k) => { if (c.n) g.text([g.view.x0, g.view.y1], `${k === 0 ? 'constant' : `cos ${2 * k}x`}: ${c.n}/${c.d}`, { color: cols[k % cols.length], font: FONT }, 10, 22 + 18 * k); });
      });
    }
    const agree = Math.abs(exact - q.value) <= 1e-8 * Math.max(1, Math.abs(q.value));
    ctx.setReadouts([
      { label: 'strategy', value: P.kind === 'cos-odd' ? 'n odd → u = sin x' : P.kind === 'sin-odd' ? 'm odd → u = cos x' : 'both even → half angles' },
      { label: 'antiderivative F(x)', value: P.FTeX, tex: true },
      { label: 'F(b) − F(a)  (exact formula)', value: fmt(exact, 10), tone: agree ? 'good' : 'bad' },
      { label: '∫ₐᵇ in x  (quadrature)', value: fmt(q.value, 10) },
      ...(P.kind !== 'even' ? [{ label: '∫ in u from u(a) to u(b)  (quadrature)', value: fmt(rightVal, 10) }] : [{ label: 'average value (constant term)', value: `${P.expansion![0].n}/${P.expansion![0].d}` }]),
    ]);
    ctx.setNote(P.kind === 'even'
      ? `Both powers are even, so no factor can be saved. The identities $\\sin^2x = \\tfrac{1-\\cos 2x}{2}$, $\\cos^2x = \\tfrac{1+\\cos 2x}{2}$ rewrite $${integrandTeX(m, n)}$ as a constant plus cosines (right): each cosine integrates to a sine, and over a full period only the constant survives.`
      : `Saving one factor of ${P.kind === 'cos-odd' ? '$\\cos x$ makes $du = \\cos x\\,dx$' : '$\\sin x$ makes $du = -\\sin x\\,dx$'}, and the rest converts with $\\sin^2 + \\cos^2 = 1$. The gold area (in $x$) equals the blue area (in $u$): $\\int_a^b ${integrandTeX(m, n)}\\,dx = ${texNum(exact, 8)}$.`);
    const src = `${m ? `sin(x)^${m}` : ''}${m && n ? '*' : ''}${n ? `cos(x)^${n}` : ''}` || '1';
    runner.request(src, [...P.steps, { title: `Definite: F(${fmt(b, 3)}) − F(${fmt(a, 3)})`, tex: `= ${texNum(exact, 10)}`, detail: `Quadrature agrees to ${Math.abs(exact - q.value).toExponential(1)}.`, rule: 'check' }], () => sympyIntegralRows(src));
  };
  return { update, dispose() { runner.dispose(); } };
}

const superscript = (k: number) => String(k).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');
void fadd;
