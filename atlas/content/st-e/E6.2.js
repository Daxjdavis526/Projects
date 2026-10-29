// Hermite and Laguerre polynomials as a mathematician meets them: the weight
// and the interval choose the family (e^{−x²} on ℝ, e^{−x} on [0, ∞)),
// Rodrigues formulas, recurrences, the generating function e^{2xt − t²} and the
// norm 2ⁿn!√π proved from it, physicists' Hₙ against probabilists' Heₙ,
// Laguerre moments, and Gauss–Hermite / Gauss–Laguerre quadrature. Overlaps:
// phys4700 M3.3 builds Hₙ from ladder operators and M5.2 uses Laguerre in
// hydrogen — linked, no oscillator or hydrogen examples repeated here.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { SF, SRC, gpic, hermiteCoef, laguerreCoef, polyExpr, polyTeXDesc, r3, r4, SQPI } from './_sf.js';

const t = String.raw;
const fact = SF.fact;
const H = SF.hermite, L = SF.laguerre;
const hNorm = (n) => 2 ** n * fact(n) * SQPI;                     // ∫Hₙ² e^{−x²}
const psi = (n) => `(${polyExpr(hermiteCoef(n))})*e^(-x^2/2)/${Math.sqrt(hNorm(n)).toPrecision(12)}`;   // Hermite function
const choose = (k, n) => fact(k) / (fact(n) * fact(k - n));
const SUB = '₀₁₂₃₄₅₆₇₈₉';
// Gauss–Laguerre nodes (zeros of Lₙ) and weights xᵢ / ((n+1)² L_{n+1}(xᵢ)²)
const gl = (n) => { const x = SF.roots((z) => L(n, z), 0.01, 30, 0.01); return { x, w: x.map((z) => z / ((n + 1) ** 2 * L(n + 1, z) ** 2)) }; };

export default lesson({
  id: 'st-e.E6.2',
  title: 'Hermite and Laguerre polynomials',
  minutes: 16, difficulty: 3,
  intro: t`Choose a weight $w(x) > 0$ and an interval, run Gram–Schmidt on $1, x, x^2, \dots$ in the inner product $\int f\,g\,w\,dx$, and out comes a family of orthogonal polynomials. Weight 1 on $[-1, 1]$ gave Legendre ([E6.1](#/lesson/st-e.E6.1)). The Gaussian on the whole line gives **Hermite** polynomials, and $e^{-x}$ on the half-line gives **Laguerre** polynomials:

$$\int_{-\infty}^{\infty}H_mH_n\,e^{-x^2}dx = 2^nn!\sqrt\pi\,\delta_{mn}, \qquad \int_0^{\infty}L_mL_n\,e^{-x}dx = \delta_{mn}.$$

Each has a Rodrigues formula — $H_n = (-1)^ne^{x^2}\frac{d^n}{dx^n}e^{-x^2}$, $L_n = \frac{e^x}{n!}\frac{d^n}{dx^n}\big(x^ne^{-x}\big)$ — a three-term recurrence, and a generating function, $e^{2xt - t^2} = \sum H_n\frac{t^n}{n!}$. In physics $H_n$ shape the harmonic oscillator’s states ([PHYS 4700](#/lesson/phys4700.M3.3) builds them with ladder operators) and $L_n^{(\alpha)}$, weight $x^\alpha e^{-x}$, the hydrogen atom’s radial ones ([PHYS 4700](#/lesson/phys4700.M5.2)). Here they are the mathematician’s tools: expansions, identities and quadrature rules on infinite intervals.`,
  symbols: [
    { tex: 'H_n(x)', text: 'the (physicists’) Hermite polynomial of degree $n$, leading term $2^nx^n$' },
    { tex: 'L_n(x)', text: 'the Laguerre polynomial of degree $n$, normalized so $L_n(0) = 1$' },
    { tex: 'e^{-x^2},\\ e^{-x}', text: 'the weights: they make every polynomial integrable over an infinite interval' },
    { tex: '2^nn!\\sqrt\\pi', text: 'the squared norm of $H_n$ in the weighted inner product' },
    { tex: '\\delta_{mn}', text: 'the Kronecker delta: 1 if $m = n$, else 0' },
  ],
  why: t`Wherever a Gaussian or an exponential weights an integral — thermal distributions, Gaussian beams in lasers and interferometers, radial wavefunctions, Planck’s spectrum — these polynomials diagonalize the problem and supply the optimal quadrature nodes.`,
  visual: {
    type: 'graph',
    title: 'Hermite functions spread out as n grows',
    lead: t`The curves are the normalized **Hermite functions** $\psi_n = H_n(x)\,e^{-x^2/2}/\sqrt{2^nn!\sqrt\pi}$: orthonormal with weight 1, because half of the Gaussian weight rides on each factor. The gold lines sit at $\pm\sqrt{2n + 1}$.`,
    tasks: [
      'Count the zeros for each n: always n, all real — the orthogonality argument of E6.1 again.',
      'Every zero stays inside ±√(2n + 1); beyond it the Gaussian wins and ψₙ decays.',
      'Watch the norm readout: 2ⁿ n! √π grows faster than exponentially — H₆ is about 64x⁶ at large x.',
    ],
    params: {
      x: [-5.5, 5.5], y: [-0.8, 0.8], xlabel: 'x', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [{ key: 'n', label: 'Degree $n$', min: 0, max: 6, step: 1, value: 2, unit: '', explain: 'The Hermite function built from $H_n$.' }],
      curves: [0, 1, 2, 3, 4, 5, 6].map((k) => ({ fn: psi(k), color: 'accent', width: 2.3, when: `step(0.5 - abs(n - ${k}))` })).concat([{ fn: 'e^(-x^2/2)/sqrt(sqrt(pi))', color: 'ink4', width: 1.2, dash: [3, 4] }]),
      vlines: [{ x: 'sqrt(2n + 1)', color: 'gold' }, { x: '-sqrt(2n + 1)', color: 'gold' }],
      readouts: [{ label: '$\\int H_n^2e^{-x^2}dx = 2^nn!\\sqrt\\pi =$', expr: '2^n*gamma(n + 1)*sqrt(pi)', digits: 5 }],
    },
    caption: 'Hermite polynomials from the recurrence Hₙ₊₁ = 2xHₙ − 2nHₙ₋₁; dotted: ψ₀, the Gaussian itself.',
  },
  example: {
    prompt: t`Prove $\int_{-\infty}^{\infty}H_n^2\,e^{-x^2}dx = 2^nn!\sqrt\pi$ (and orthogonality) from the generating function $e^{2xt - t^2} = \sum_n H_n(x)\,t^n/n!$, using only $\int e^{-u^2}du = \sqrt\pi$.`,
    visual: gpic({ x: [-4, 4], y: [-0.2, 2.8], xlabel: 'x', curves: [{ fn: 'e^(2*x*0.6 - 0.36)*e^(2*x*0.5 - 0.25)*e^(-x^2)', color: 'accent', width: 2.3 }], shade: [{ fn: 'e^(2*x*0.6 - 0.36)*e^(2*x*0.5 - 0.25)*e^(-x^2)', from: -4, to: 4, alpha: 0.15 }] }, t`The product of two generating functions (s = 0.5, t = 0.6) under the weight: a shifted Gaussian, with area √π·exp(2st) = ${r4(SQPI * Math.exp(0.6))}.`),
    steps: [
      { label: 'Multiply two copies', text: t`$e^{2xs - s^2}\,e^{2xt - t^2}\,e^{-x^2} = \displaystyle\sum_{m,n}H_mH_n\,e^{-x^2}\frac{s^mt^n}{m!\,n!}$.` },
      { label: 'Complete the square', text: t`The exponent on the left is $-x^2 + 2x(s + t) - s^2 - t^2 = -\big(x - (s + t)\big)^2 + 2st$.` },
      { label: 'Integrate', text: t`$\displaystyle\int_{-\infty}^{\infty}e^{-(x - s - t)^2 + 2st}dx = \sqrt\pi\,e^{2st} = \sqrt\pi\sum_n\frac{2^ns^nt^n}{n!}$.` },
      { label: 'Compare', text: t`The right side has only $s^nt^n$ terms: every $m \ne n$ integral vanishes (orthogonality), and matching $s^nt^n$ gives $\dfrac{1}{(n!)^2}\displaystyle\int H_n^2e^{-x^2} = \frac{2^n\sqrt\pi}{n!}$.` },
      { label: 'Check', text: t`$n = 3$: $H_3 = ${polyTeXDesc(hermiteCoef(3))}$ and $2^3\cdot3!\cdot\sqrt\pi = 48\sqrt\pi = ${r4(hNorm(3))}$, which quadrature confirms ($${r4(SF.integrate((x) => H(3, x) ** 2 * Math.exp(-x * x), -10, 10, 80))}$).` },
    ],
    answer: t`$\int H_mH_n\,e^{-x^2}dx = 2^nn!\sqrt\pi\,\delta_{mn}$: the generating function turns the whole table of integrals into one Gaussian integral.`,
  },
  practice: [
    num({
      id: 'herm-rec', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5]), x0 = r.pick([0.3, 0.5, 0.8, 1.2, -0.6]);
        const ans = H(n, x0);
        return {
          prompt: t`Starting from $H_0 = 1$ and $H_1 = 2x$, use $H_{k + 1} = 2x\,H_k - 2k\,H_{k - 1}$ to evaluate $H_{${n}}(${x0})$.`,
          visual: gpic({ x: [-3, 3], y: [-0.8, 0.8], xlabel: 'x', curves: [{ fn: psi(n - 1), color: 'violet', width: 1.8 }, { fn: psi(n - 2), color: 'ink3', width: 1.6, dash: [5, 4] }], vlines: [{ x: x0, color: 'gold' }] }, t`The Hermite functions for degrees ${n - 1} (violet) and ${n - 2} (dashed), with $x = ${x0}$ marked.`),
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          errors: [{ value: 2 * x0 * H(n - 1, x0) - 2 * n * H(n - 2, x0), feedback: t`Use $k = ${n - 1}$ to reach $H_{${n}}$: the second coefficient is $2(${n - 1})$, not $2(${n})$.` }, { value: SF.hermiteHe(n, x0), feedback: t`That is the probabilists’ $\mathrm{He}_{${n}}$, from $\mathrm{He}_{k+1} = x\,\mathrm{He}_k - k\,\mathrm{He}_{k-1}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.max(1, Math.abs(ans))),
          hints: [t`$H_2 = 2x\cdot2x - 2\cdot1\cdot1 = 4x^2 - 2$.`, t`Keep going with numbers: at $x = ${x0}$, $H_2 = ${r4(H(2, x0))}$, $H_3 = ${r4(H(3, x0))}$.`],
          teach: 'The three-term recurrence is how Hermite polynomials are computed in practice — stable and cheap.',
          explain: t`$H_{${n}}(${x0}) = ${r4(ans)}$; in closed form $H_{${n}} = ${polyTeXDesc(hermiteCoef(n))}$.`,
        };
      },
    }),
    num({
      id: 'herm-norm', difficulty: 2,
      gen(r) {
        const n = r.int(2, 6), ans = hNorm(n);
        const f = `(${polyExpr(hermiteCoef(n))})^2*e^(-x^2)`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}H_{${n}}(x)^2\,e^{-x^2}dx$.`,
          visual: gpic({ x: [-4.5, 4.5], y: [0, 1.1 * Math.max(...Array.from({ length: 200 }, (_, i) => { const x = -4.5 + 0.045 * i; return H(n, x) ** 2 * Math.exp(-x * x); }))], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.2 }], shade: [{ fn: f, from: -4.5, to: 4.5, alpha: 0.15 }] }, t`The integrand $H_{${n}}^2e^{-x^2}$; its area is asked for.`),
          answer: ans, tol: { rel: 0.002 },
          integrand: f, limits: ['-inf', 'inf'], vars: { x: [-3, 3] },
          errors: [{ value: fact(n) * SQPI, feedback: t`You dropped the $2^n$: $H_n$ has leading coefficient $2^n$. (The probabilists’ $\mathrm{He}_n$, weight $e^{-x^2/2}$, have norm $n!\sqrt{2\pi}$.)` }, { value: 2 ** n * fact(n), feedback: t`Missing $\sqrt\pi = \int e^{-x^2}dx$.` }],
          hints: [t`The squared norm is $2^nn!\sqrt\pi$.`],
          teach: 'Hermite polynomials are orthogonal but far from normalized: $\\int H_n^2e^{-x^2} = 2^n n!\\sqrt{\\pi}$.',
          explain: t`$2^{${n}}\cdot${n}!\cdot\sqrt\pi = ${r4(ans)}$.`,
        };
      },
    }),
    mcq({
      id: 'he-convert', difficulty: 2,
      prompt: t`Probabilists use the weight $e^{-x^2/2}$ and **monic** polynomials $\mathrm{He}_n$ (leading coefficient 1), with $\mathrm{He}_2 = x^2 - 1$. Which is $\mathrm{He}_3$?`,
      visual: gpic({ x: [-4, 4], y: [0, 1.15], xlabel: 'x', curves: [{ fn: 'e^(-x^2)', color: 'accent', width: 2.2, label: 'e^(−x²)', labelAt: 0.75, labelDx: 6, labelDy: -6 }, { fn: 'e^(-x^2/2)', color: 'warn', width: 2.2, label: 'e^(−x²/2)', labelAt: 1.6, labelDx: 6 }] }, 'The two Gaussian weights: physicists’ (blue) and probabilists’ (orange).'),
      choices: [t`$x^3 - 3x$`, t`$8x^3 - 12x$`, t`$x^3 - \tfrac32x$`, t`$x^3 - x$`],
      answer: 0,
      why: {
        1: t`That is the physicists’ $H_3$, for the weight $e^{-x^2}$.`,
        2: t`That is $H_3/8$: monic, but orthogonal for $e^{-x^2}$, not $e^{-x^2/2}$.`,
        3: t`Orthogonality to $x$ needs $\int x(x^3 - cx)e^{-x^2/2} = 3\sqrt{2\pi} - c\sqrt{2\pi} = 0$, so $c = 3$.`,
      },
      hints: [t`$\mathrm{He}_3 = x^3 - cx$ by parity; make it orthogonal to $x$ under $e^{-x^2/2}$.`, t`With weight $e^{-x^2/2}$: $\int x^2 = \sqrt{2\pi}$ and $\int x^4 = 3\sqrt{2\pi}$.`],
      teach: 'Two normalizations of Hermite polynomials are in use; $H_n(x) = 2^{n/2}\\, \\mathit{He}_n(\\sqrt2\\, x)$.',
      explain: t`$\mathrm{He}_3 = x^3 - 3x$ (recurrence $\mathrm{He}_{k+1} = x\,\mathrm{He}_k - k\,\mathrm{He}_{k-1}$). Check: $H_3(x) = 2^{3/2}\mathrm{He}_3(\sqrt2x) = 2^{3/2}(2^{3/2}x^3 - 3\sqrt2x) = 8x^3 - 12x$. Always check which convention a table or library uses — SciPy’s \`eval_hermite\` is $H_n$, \`eval_hermitenorm\` is $\mathrm{He}_n$.`,
    }),
    num({
      id: 'lag-moment', difficulty: 3,
      gen(r) {
        const k = r.int(2, 5), n = r.int(1, k);
        const ans = (n % 2 ? -1 : 1) * fact(k) * choose(k, n);
        const f = `x^${k}*(${polyExpr(laguerreCoef(n))})*e^(-x)`;
        return {
          prompt: t`With $L_{${n}}(x) = ${polyTeXDesc(laguerreCoef(n), 'x', true)}$, evaluate $\displaystyle\int_0^{\infty}x^{${k}}L_{${n}}(x)\,e^{-x}dx$ — the $L_{${n}}$ coefficient of $x^{${k}}$ in a Laguerre series.`,
          visual: gpic({ x: [0, 12], y: [-3, 3], xlabel: 'x', curves: [{ fn: polyExpr(laguerreCoef(n)), color: 'accent', width: 2.2, label: `L${SUB[n]}`, labelAt: 0.4, labelDy: -8 }, { fn: 'e^(-x)', color: 'ink3', width: 1.5, dash: [5, 4], label: 'e^(−x)', labelAt: 1.3, labelDx: 4, labelDy: -4 }] }, t`$L_{${n}}$ and the weight $e^{-x}$ on the half-line.`),
          answer: ans, tol: { rel: 1e-6, abs: 1e-6 },
          integrand: f, limits: [0, 'inf'], vars: { x: [0, 5] },
          errors: [{ value: -ans, feedback: t`Check the sign: $L_n$ has leading term $(-x)^n/n!$.` }, { value: fact(k), feedback: t`That is $\int x^ke^{-x} = k!$ alone; $L_{${n}}$ multiplies the integrand.` }].filter((e) => Math.abs(e.value - ans) > 1e-3),
          hints: [t`$\int_0^\infty x^je^{-x}dx = j!$: integrate term by term.`, t`Or use Rodrigues and integrate by parts $n$ times: $\int x^kL_ne^{-x} = \dfrac{(-1)^n}{n!}\dfrac{k!}{(k - n)!}\int x^ke^{-x}\cdots$ — the result is $(-1)^nk!\binom{k}{n}$.`],
          teach: 'Moments of Laguerre polynomials reduce to factorials, ∫xʲe^(−x)dx = j!.',
          explain: t`$\int x^kL_ne^{-x}dx = (-1)^nk!\binom{k}{n} = ${ans}$. So $x^{${k}} = \sum_n(-1)^nk!\binom{k}{n}L_n$ — for example $x^2 = 2L_0 - 4L_1 + 2L_2$.`,
        };
      },
    }),
    num({
      id: 'gauss-hermite', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1, 1.5, 2, 2.5]);
        const ans = SQPI * Math.cos(a / Math.SQRT2), exact = SQPI * Math.exp(-a * a / 4);
        return {
          prompt: t`The two-point **Gauss–Hermite** rule $\int_{-\infty}^{\infty}e^{-x^2}f(x)\,dx \approx w\,\big(f(-x_1) + f(x_1)\big)$ puts its nodes at the zeros of $H_2 = 4x^2 - 2$ and has $w = \sqrt\pi/2$. Use it to estimate $\int_{-\infty}^{\infty}e^{-x^2}\cos(${a}x)\,dx$.`,
          visual: gpic({ x: [-3.5, 3.5], y: [-0.5, 1.1], xlabel: 'x', curves: [{ fn: `e^(-x^2)*cos(${a}*x)`, color: 'accent', width: 2.2 }, { fn: `cos(${a}*x)`, color: 'ink3', width: 1.4, dash: [5, 4] }], points: [{ x: -Math.SQRT1_2, y: Math.cos(a * Math.SQRT1_2), color: 'gold', r: 5 }, { x: Math.SQRT1_2, y: Math.cos(a * Math.SQRT1_2), color: 'gold', r: 5 }] }, 'The integrand (blue), f = cos(ax) (dashed) and f sampled at the two nodes (gold).'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: exact, feedback: t`That is the exact value, $\sqrt\pi e^{-a^2/4}$. The question asks what the two-point rule gives.` }, { value: SQPI * Math.cos(a), feedback: t`The nodes are the zeros of $4x^2 - 2$: $x_1 = 1/\sqrt2$, not 1.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * Math.abs(ans)),
          hints: [t`$4x^2 - 2 = 0$ gives $x_1 = 1/\sqrt2$.`, t`Estimate $= \frac{\sqrt\pi}2\cdot2\cos\big(${a}/\sqrt2\big)$.`],
          teach: 'Gauss rules for a weight put their nodes at the zeros of that weight’s orthogonal polynomial, and are exact for polynomials of degree 2n − 1.',
          explain: t`$\sqrt\pi\cos(${a}/\sqrt2) = ${r4(ans)}$, against the exact $\sqrt\pi\,e^{-${a}^2/4} = ${r4(exact)}$. Two points are exact for cubics; $\cos ax$ wiggles more as $a$ grows, so the estimate degrades — more nodes (zeros of $H_n$) fix that.`,
        };
      },
    }),
    num({
      id: 'herm-zero', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 4, 6, 8]), ans = H(n, 0);
        return {
          prompt: t`At $x = 0$ the generating function is $e^{-t^2} = \sum_nH_n(0)\,\dfrac{t^n}{n!}$. Read off $H_{${n}}(0)$.`,
          visual: gpic({ x: [0, 2], y: [-0.2, 1.1], xlabel: 't', curves: [{ fn: 'e^(-x^2)', color: 'ink3', width: 1.6, dash: [6, 4] }, { fn: '1 - x^2 + x^4/2', color: 'accent', width: 2, label: '3 terms', labelAt: 1.25, labelDx: 6 }] }, '$e^{-t^2}$ (dashed) and its Taylor sum through $t^4$.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: (n / 2 % 2 ? -1 : 1) / fact(n / 2), feedback: t`That is the coefficient of $t^{${n}}$ itself. The series carries $t^n/n!$, so multiply by $${n}!$.` }, { value: -ans, feedback: t`Sign: $e^{-t^2} = \sum_k(-1)^kt^{2k}/k!$.` }],
          hints: [t`$e^{-t^2} = \sum_k\dfrac{(-1)^kt^{2k}}{k!}$; you need $2k = ${n}$.`, t`$H_{${n}}(0) = ${n}!\times\dfrac{(-1)^{${n / 2}}}{${n / 2}!}$.`],
          teach: 'Values of Hₙ at special points come straight out of the generating function.',
          explain: t`$H_{${n}}(0) = (-1)^{${n / 2}}\dfrac{${n}!}{${n / 2}!} = ${ans}$; odd $H_n$ vanish at 0.`,
        };
      },
    }),
    code({
      id: 'gh-code', difficulty: 3,
      prompt: t`Write \`hermite(n, x)\` by the recurrence $H_{k+1} = 2xH_k - 2kH_{k-1}$, and \`gh(f, n)\`, the $n$-point Gauss–Hermite estimate of $\int e^{-x^2}f\,dx$, using \`np.polynomial.hermite.hermgauss(n)\` (it returns nodes and weights). Then check that $n + 1$ nodes integrate $H_n^2$ exactly.`,
      starter: t`import numpy as np
from scipy.special import eval_hermite

def hermite(n, x):
    pass

def gh(f, n):
    pass

print(hermite(5, 0.7), eval_hermite(5, 0.7))
print(gh(lambda x: hermite(4, x)**2, 5), 2**4 * 24 * np.sqrt(np.pi))
`,
      answer: t`import numpy as np
from scipy.special import eval_hermite

def hermite(n, x):
    h0, h1 = 1.0 + 0 * x, 2.0 * x
    if n == 0:
        return h0
    for k in range(1, n):
        h0, h1 = h1, 2 * x * h1 - 2 * k * h0
    return h1

def gh(f, n):
    x, w = np.polynomial.hermite.hermgauss(n)
    return np.sum(w * f(x))

print(hermite(5, 0.7), eval_hermite(5, 0.7))
print(gh(lambda x: hermite(4, x)**2, 5), 2**4 * 24 * np.sqrt(np.pi))
`,
      tests: [
        { name: 'hermite(5, 0.7) matches SciPy’s eval_hermite', code: 'abs(hermite(5, 0.7) - eval_hermite(5, 0.7)) < 1e-9' },
        { name: 'hermite works on arrays', code: 'np.allclose(hermite(3, np.array([0.0, 1.0, 2.0])), [0, -4, 40])' },
        { name: 'gh(x⁴, 3) = 3√π/4 exactly', code: 'abs(gh(lambda x: x**4, 3) - 3 * np.sqrt(np.pi) / 4) < 1e-12' },
        { name: 'five nodes give $\\int H_4^2\\, e^{-x^2} = 2^4\\cdot 4!\\cdot\\sqrt{\\pi}$', code: 'abs(gh(lambda x: hermite(4, x)**2, 5) - 384 * np.sqrt(np.pi)) < 1e-8' },
        { name: 'twelve nodes give $\\int e^{-x^2} \\cos x \\approx \\sqrt{\\pi}\\, e^{-1/4}$', code: 'abs(gh(np.cos, 12) - np.sqrt(np.pi) * np.exp(-0.25)) < 1e-12' },
      ],
      hints: ['Keep two running values h0, h1 and update them together.', '`x, w = np.polynomial.hermite.hermgauss(n)`, then `np.sum(w * f(x))`.'],
      teach: 'An n-point Gauss rule is exact for polynomials of degree up to 2n − 1, which is why n + 1 nodes integrate Hₙ² exactly.',
      explain: t`$H_4^2$ has degree 8 and five nodes are exact to degree 9, so \`gh\` returns $2^4\cdot4!\sqrt\pi$ to rounding. For $\cos x$ the error falls faster than any power of $1/n$: the integrand is entire.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-planck', difficulty: 3, transfer: true,
      gen(r) {
        const [p, exact, name] = r.pick([[3, Math.PI ** 4 / 15, 'the total radiated power (Stefan–Boltzmann)'], [2, 2 * SF.zeta(3), 'the photon number density']]);
        const n = 2, { x, w } = gl(n);
        const f = (z) => z ** p / (1 - Math.exp(-z));
        const ans = x.reduce((s, z, i) => s + w[i] * f(z), 0);
        return {
          prompt: t`The blackbody integral behind ${name} is $I = \displaystyle\int_0^\infty\frac{x^{${p}}}{e^x - 1}dx = \int_0^\infty e^{-x}\,\frac{x^{${p}}}{1 - e^{-x}}\,dx$. Estimate it with the two-point **Gauss–Laguerre** rule: nodes at the zeros of $L_2 = \tfrac12x^2 - 2x + 1$, $x_{1,2} = 2 \mp \sqrt2$, with weights $w_{1,2} = (2 \pm \sqrt2)/4$.`,
          visual: gpic({ x: [0, 12], y: [0, 1.15 * (p === 3 ? 1.42 : 0.65)], xlabel: 'x = hν / kT', curves: [{ fn: `x^${p}/(e^x - 1)`, color: 'gold', width: 2.3 }], shade: [{ fn: `x^${p}/(e^x - 1)`, from: 0.001, to: 12, color: 'gold', alpha: 0.15 }], vlines: x.map((z) => ({ x: z, color: 'accent' })) }, 'The Planck integrand and the Gauss–Laguerre nodes (blue lines).'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: exact, feedback: t`That is the exact value, $${p === 3 ? '\\pi^4/15' : '2\\zeta(3)'}$. The question asks for the ${n}-point estimate.` }, { value: x.reduce((s, z, i) => s + w[i] * z ** p / (Math.exp(z) - 1), 0), feedback: t`The weight $e^{-x}$ is already built into the rule: apply it to $f = x^{${p}}/(1 - e^{-x})$, not to the whole integrand.` }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`Gauss–Laguerre: $\int_0^\infty e^{-x}f(x)\,dx \approx \sum_iw_if(x_i)$ with $f = x^{${p}}/(1 - e^{-x})$.`, t`At the first node $f = ${r4(f(x[0]))}$.`],
          teach: 'Factor out the weight, then let the Gauss rule handle the smooth remainder at the zeros of the matching orthogonal polynomial.',
          explain: t`$\sum w_if(x_i) = ${r4(ans)}$ against the exact $${r4(exact)}$ (${r3(100 * Math.abs(ans - exact) / exact)}% off with only ${n} evaluations). The exact values, $\pi^4/15$ and $2\zeta(3)$, are [E9.1](#/lesson/st-e.E9.1)’s $\Gamma(s)\zeta(s)$.`,
        };
      },
    }),
    match({
      id: 'cp-match', difficulty: 2,
      prompt: 'Each weight on its interval generates one family of orthogonal polynomials. Match them.',
      visual: gpic({ x: [-1.5, 6], y: [0, 2.2], xlabel: 'x', curves: [{ fn: '1', domain: [-1, 1], color: 'accent', width: 2 }, { fn: 'e^(-x^2)', color: 'warn', width: 2 }, { fn: 'e^(-x)', domain: [0, 6], color: 'good', width: 2 }, { fn: 'x^2*e^(-x)', domain: [0, 6], color: 'violet', width: 2 }, { fn: '1/sqrt(1 - x^2)', domain: [-0.97, 0.97], color: 'gold', width: 2 }] }, 'The five weights on their intervals (colours in the order listed).'),
      left: [t`$1$ on $[-1, 1]$`, t`$e^{-x^2}$ on $(-\infty, \infty)$`, t`$e^{-x}$ on $[0, \infty)$`, t`$x^2e^{-x}$ on $[0, \infty)$`, t`$1/\sqrt{1 - x^2}$ on $(-1, 1)$`],
      right: ['Legendre Pₙ', 'Hermite Hₙ', 'Laguerre Lₙ', 'associated Laguerre Lₙ⁽²⁾', 'Chebyshev Tₙ', 'Bessel Jₙ'],
      answer: [0, 1, 2, 3, 4],
      hints: ['The interval and the weight’s decay decide: a finite interval with no decay, the whole line, the half-line.', 'A power xᵅ in front of $e^{-x}$ gives the associated (generalized) family with index α.'],
      teach: 'The weight and the interval determine the orthogonal polynomials completely (up to normalization).',
      explain: t`Legendre: $1$ on $[-1, 1]$; Hermite: $e^{-x^2}$; Laguerre: $e^{-x}$; $L_n^{(\alpha)}$: $x^\alpha e^{-x}$; Chebyshev: $(1 - x^2)^{-1/2}$ ([E12.1](#/lesson/st-e.E12.1)). Bessel functions are not polynomials — they are orthogonal through a Sturm–Liouville problem on a disk ([E8.1](#/lesson/st-e.E8.1)).`,
    }),
    num({
      id: 'cp-deriv', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 4, 5, 6]), x0 = r.pick([0.4, 0.9, 1.3]);
        const ans = 2 * n * H(n - 1, x0);
        return {
          prompt: t`Differentiating the generating function in $x$ gives $H_n'(x) = 2n\,H_{n - 1}(x)$. Use it to find $H_{${n}}'(${x0})$.`,
          visual: gpic({ x: [-2.5, 2.5], y: [-0.8, 0.8], xlabel: 'x', curves: [{ fn: psi(n), color: 'accent', width: 2.2 }], vlines: [{ x: x0, color: 'gold' }] }, t`The Hermite function of degree ${n}, with $x = ${x0}$ marked.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: n * H(n - 1, x0), feedback: t`The factor is $2n$: $\partial_x e^{2xt - t^2} = 2t\,e^{2xt - t^2}$.` }, { value: H(n - 1, x0), feedback: t`Multiply by $2n = ${2 * n}$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * Math.max(1, Math.abs(ans))),
          hints: [t`$\partial_x\sum H_n\frac{t^n}{n!} = 2t\sum H_{n - 1}\frac{t^{n - 1}}{(n - 1)!}$; match powers of $t$.`, t`You need $H_{${n - 1}}(${x0}) = ${r4(H(n - 1, x0))}$.`],
          teach: 'Differentiating a generating function turns derivative identities into bookkeeping of powers.',
          explain: t`$H_{${n}}'(${x0}) = ${2 * n}\times${r4(H(n - 1, x0))} = ${r4(ans)}$. Together with the recurrence this gives Hermite’s equation $H'' - 2xH' + 2nH = 0$.`,
        };
      },
    }),
  ],
  sources: [SRC.dlmf18, SRC.arfken, SRC.boas],
});
