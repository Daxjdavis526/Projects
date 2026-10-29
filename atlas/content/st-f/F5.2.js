// Gaussian quadrature — free nodes double the degree: n nodes and n weights
// match 2n moments, so the n-point Gauss–Legendre rule is exact up to degree
// 2n − 1. The nodes are the zeros of the Legendre polynomial Pₙ (the
// orthogonality argument), the weights are all positive, the error carries
// f⁽²ⁿ⁾, and convergence for analytic integrands is geometric. Mapping to
// [a, b]; nested estimates (Gauss–Kronrod); an orbital period from the
// time-of-flight integral.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { gaussLegendre, gauss, simpson, legendre } from './_lin.js';

const t = String.raw;

const LEG = ['x', '(3x^2 - 1)/2', '(5x^3 - 3x)/2', '(35x^4 - 30x^2 + 3)/8', '(63x^5 - 70x^3 + 15x)/8', '(231x^6 - 315x^4 + 105x^2 - 5)/16'];
const GL = [1, 2, 3, 4, 5, 6].map(gaussLegendre);
const EXA = Math.E - 1 / Math.E;
const EXP_ERR = GL.map((_, i) => gauss(Math.exp, -1, 1, i + 1) - EXA);
const EXP_RATIOS = EXP_ERR.slice(1).map((e, i) => Math.round(EXP_ERR[i] / e)).join(', ');

// the worked example: ∫₀¹ dx/(1 + x) by Gauss and by Simpson
const LN2 = Math.log(2), inv1 = (x) => 1 / (1 + x);
const G2 = gauss(inv1, 0, 1, 2), G3 = gauss(inv1, 0, 1, 3), S2 = simpson(inv1, 0, 1, 2), S4 = simpson(inv1, 0, 1, 4);
const X2 = 1 / Math.sqrt(3);
const G2N = [0.5 - 0.5 * X2, 0.5 + 0.5 * X2];

// x^{2n} on [−1, 1]: the first power the n-point rule misses
const missErr = (n) => 2 / (2 * n + 1) - GL[n - 1].x.reduce((s, x, i) => s + GL[n - 1].w[i] * x ** (2 * n), 0);

// the time-of-flight integral ∫₀^π dθ/(1 + e cos θ)² = π/(1 − e²)^{3/2}
const kep = (e, n) => gauss((th) => 1 / (1 + e * Math.cos(th)) ** 2, 0, Math.PI, n);
const kepRel = (e, n) => Math.abs(kep(e, n) / (Math.PI / (1 - e * e) ** 1.5) - 1);
// the code exercise: a Molniya orbit
const MU = 398600.4418, MA = 26600, ME = 0.74, MP = MA * (1 - ME * ME), MH = Math.sqrt(MU * MP);
const TK = 2 * Math.PI * Math.sqrt(MA ** 3 / MU);
const MOL = [4, 8, 16, 32].map((n) => Math.abs((2 * MP * MP / MH) * kep(ME, n) - TK) / TK);

// map-interval cases: [TeX, Atlas fn, f, a, b, exact TeX, exact]
const MAP_CASES = [
  [t`\int_1^4 \frac{dx}{x}`, '1/x', (x) => 1 / x, 1, 4, t`\ln 4`, Math.log(4)],
  [t`\int_1^4 \sqrt{x}\,dx`, 'sqrt(x)', Math.sqrt, 1, 4, t`\tfrac{14}{3}`, 14 / 3],
  [t`\int_0^1 \frac{dx}{1+x^2}`, '1/(1 + x^2)', (x) => 1 / (1 + x * x), 0, 1, t`\pi/4`, Math.PI / 4],
  [t`\int_0^3 e^{-x}\,dx`, 'exp(-x)', (x) => Math.exp(-x), 0, 3, t`1 - e^{-3}`, 1 - Math.exp(-3)],
];

const stems = (k, color = 'gold') => GL[k - 1].x.map((x, i) => ({ param: [n12(x), `${n12(GL[k - 1].w[i])}*t`], t: [0, 1], color, width: 3, when: `step(0.5 - abs(n - ${k}))` }));

export default lesson({
  id: 'st-f.F5.2',
  title: 'Gaussian quadrature',
  minutes: 13, difficulty: 3,
  intro: t`Newton–Cotes rules fix the nodes and choose only the weights. **Gaussian quadrature** chooses both. An $n$-point rule has $2n$ free numbers — $n$ nodes $x_i$ and $n$ weights $w_i$ — so it can be made to integrate $1, x, x^2, \ldots, x^{2n-1}$ exactly: twice the degree of a Newton–Cotes rule with the same number of samples.

$$\int_{-1}^{1} f(x)\,dx \approx \sum_{i=1}^{n} w_i\,f(x_i), \qquad \text{exact for every polynomial of degree} \le 2n - 1$$

The nodes turn out to be the zeros of the Legendre polynomial $P_n$, and every weight is positive. For a smooth integrand the error carries $f^{(2n)}$, and for an analytic one it falls **geometrically** with $n$ — a fixed factor per added point. On an interval $[a, b]$, substitute $x = \tfrac{a+b}{2} + \tfrac{b-a}{2}s$, which multiplies the sum by $\tfrac{b-a}{2}$.`,
  symbols: [
    { tex: 'x_i', text: 'the **nodes**: the $n$ zeros of $P_n$, all inside $(-1, 1)$, crowded towards the ends; never the endpoints themselves' },
    { tex: 'w_i', text: 'the **weights**, all positive, summing to 2 (the length of $[-1, 1]$)' },
    { tex: 'n', text: 'the number of points — and of function evaluations' },
    { tex: 'P_n', text: 'the Legendre polynomial of degree $n$: $P_2 = \\tfrac12(3x^2 - 1)$, $P_3 = \\tfrac12(5x^3 - 3x)$, … — orthogonal on $[-1, 1]$, $\\int P_mP_n\\,dx = 0$ for $m \\ne n$' },
    { tex: '2n - 1', text: 'the **degree of exactness**: the highest power integrated exactly. The best possible: no $n$-point rule integrates $\\prod(x - x_i)^2$, of degree $2n$' },
  ],
  why: 'Gauss–Legendre is the workhorse inside finite-element codes, spectral solvers, collocation integrators (the implicit Gauss–Runge–Kutta methods are built on its nodes) and adaptive library routines such as scipy.integrate.quad; whenever you can choose where to sample, it gets the most accuracy per evaluation.',
  visual: {
    type: 'graph',
    title: 'Nodes, weights and Legendre’s polynomials',
    lead: t`Slide $n$. The blue curve is $P_n(x)$; the gold stems stand on its zeros — the Gauss nodes — with heights equal to the weights. The readouts give the degree integrated exactly and the error of the rule on $\int_{-1}^1 e^x\,dx$.`,
    tasks: [
      `From n = 1 to 6, watch the error on ∫eˣ dx shrink by a factor that grows with n — ${EXP_RATIOS} — at least geometric convergence.`,
      'The stems always sum to 2, and they shrink towards the ends, where the nodes crowd together.',
      'The nodes never sit at ±1: a Gauss rule never evaluates f at the endpoints, which helps when f misbehaves there.',
    ],
    params: {
      x: [-1.15, 1.15], y: [-1.15, 2.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
      sliders: [{ key: 'n', label: 'Points $n$', min: 1, max: 6, step: 1, value: 3, explain: 'The number of nodes, and of evaluations of f.' }],
      curves: [...LEG.map((fn, i) => ({ fn, color: 'accent', width: 2.2, domain: [-1, 1], when: `step(0.5 - abs(n - ${i + 1}))` })), ...[1, 2, 3, 4, 5, 6].flatMap((k) => stems(k))],
      points: [1, 2, 3, 4, 5, 6].flatMap((k) => GL[k - 1].x.map((x, i) => ({ x: n12(x), y: n12(GL[k - 1].w[i]), r: 4, color: 'gold', when: `step(0.5 - abs(n - ${k}))` }))),
      hlines: [{ y: 0, color: 'ink4' }],
      legend: [{ label: 'Pₙ(x)', color: 'accent' }, { label: 'weight wᵢ at node xᵢ', color: 'gold' }], legendAt: 'tl',
      readouts: [
        { label: 'exact up to degree', expr: '2n - 1', digits: 2 },
        { label: 'error on ∫ eˣ dx', expr: EXP_ERR.map((e, i) => `step(0.5 - abs(n - ${i + 1}))*(${n12(e)})`).join(' + '), digits: 3, zero: 1e-15 },
      ],
    },
    caption: 'Nodes and weights computed by Newton’s method on Pₙ; the errors are the n-point rule against e − 1/e, in float64.',
  },
  example: {
    prompt: t`Derive the 2-point Gauss rule on $[-1, 1]$ from exactness alone, show that its degree is exactly 3, and use it on $\displaystyle\int_0^1 \frac{dx}{1+x} = \ln 2$ against Simpson’s rule.`,
    visual: {
      type: 'graph',
      params: { x: [-0.05, 1.05], y: [0, 1.08], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '1/(1 + x)',
        curves: [{ fn: '1/(1 + x)', color: 'accent', width: 2.2, domain: [0, 1] }],
        shade: [{ fn: n12(inv1(G2N[0])), from: 0, to: 0.5, color: 'gold', alpha: 0.22 }, { fn: n12(inv1(G2N[1])), from: 0.5, to: 1, color: 'gold', alpha: 0.22 }],
        vlines: G2N.map((x) => ({ x: n12(x), color: 'gold' })),
        points: G2N.map((x, i) => ({ x: n12(x), y: n12(inv1(x)), r: 5, color: 'gold', label: `x${'₁₂'[i]}`, labelDx: 8, labelDy: -10 })) },
      caption: 'The two Gauss nodes mapped to [0, 1], at 0.211 and 0.789. With equal weights the rule is the area of two rectangles of width ½ whose heights are f at the nodes.',
    },
    steps: [
      { label: 'Count unknowns', text: t`Two nodes and two weights: four unknowns, so demand exactness for $1, x, x^2, x^3$. By symmetry take $x_{1,2} = \mp\xi$ and $w_1 = w_2 = w$; then $x$ and $x^3$ are integrated exactly automatically (both sides are 0).` },
      { label: 'Solve', text: t`$f = 1$: $2w = \int_{-1}^1 1\,dx = 2$, so $w = 1$. $f = x^2$: $2\xi^2 = \tfrac23$, so $\xi = 1/\sqrt3 = ${X2.toFixed(6)}$. And indeed $P_2 = \tfrac12(3x^2 - 1)$ vanishes at $\pm1/\sqrt3$.` },
      { label: 'Degree exactly 3', text: t`$f = x^4$: the rule gives $2\xi^4 = \tfrac29$, the integral is $\tfrac25$. The error $\tfrac25 - \tfrac29 = \tfrac{8}{45}$ is not zero, so the degree of exactness is $3 = 2n - 1$. The general error term is $\dfrac{2^{2n+1}(n!)^4}{(2n+1)[(2n)!]^3}f^{(2n)}(\xi)$, which for $n = 2$ is $\tfrac{1}{135}f^{(4)}$: $\tfrac{24}{135} = \tfrac{8}{45}$. ✓` },
      { label: 'Map to the interval', text: t`$x = \tfrac12 + \tfrac12 s$ sends the nodes to $${G2N[0].toFixed(4)}$ and $${G2N[1].toFixed(4)}$, and the weights become $\tfrac12$ each: $G_2 = \tfrac12\left[f(${G2N[0].toFixed(4)}) + f(${G2N[1].toFixed(4)})\right] = ${G2.toFixed(6)}$.` },
      { label: 'Compare', text: t`$\ln 2 = ${LN2.toFixed(6)}$, so $G_2$ errs by $${tex(G2 - LN2, 2)}$ with **two** evaluations; Simpson with $n = 2$ errs by $${tex(S2 - LN2, 2)}$ with three. Three Gauss points err by $${tex(G3 - LN2, 2)}$, against Simpson’s $${tex(S4 - LN2, 2)}$ with five.` },
    ],
    answer: t`$\int_{-1}^1 f \approx f(-1/\sqrt3) + f(1/\sqrt3)$, exact to degree 3. On $\ln 2$: $G_2 = ${G2.toFixed(6)}$ (error $${tex(G2 - LN2, 2)}$), better than Simpson with more evaluations.`,
  },
  practice: [
    mcq({
      id: 'degree', difficulty: 1,
      prompt: t`An $n$-point Gauss–Legendre rule is exact for all polynomials of degree up to what, and why?`,
      visual: {
        type: 'graph',
        params: { x: [-1.15, 1.15], y: [-1.1, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
          curves: [{ fn: LEG[2], color: 'accent', width: 2.2, domain: [-1, 1], label: 'P₃', labelAt: 0.95, labelDx: 8, labelDy: 0 }],
          points: GL[2].x.map((x) => ({ x: n12(x), y: 0, r: 5, color: 'gold' })) },
        caption: 'The three nodes of the 3-point rule, at the zeros of P₃: three positions and three weights to choose.',
      },
      choices: [
        t`$2n - 1$: $n$ nodes and $n$ weights are $2n$ free numbers, enough to match the $2n$ moments $\int x^k\,dx$, $k = 0, \ldots, 2n - 1$`,
        t`$n - 1$: $n$ points determine a polynomial of degree $n - 1$`,
        t`$2n$: each node contributes a node and a weight, and the rule can match one more moment by symmetry`,
        t`$n$: like Simpson’s rule, symmetry adds one degree to the $n - 1$ of interpolation`,
      ],
      answer: 0,
      why: {
        1: 'That is what equally spaced (Newton–Cotes) nodes give. Gauss also chooses the nodes, which doubles the count of free parameters.',
        2: 'No n-point rule can integrate the degree-2n polynomial ∏(x − xᵢ)²: it is positive, yet vanishes at every node, so the rule returns 0.',
        3: 'Symmetry adds one degree to Newton–Cotes rules with an odd number of points; Gauss rules reach 2n − 1 for every n.',
      },
      hints: ['Count the free parameters in Σ wᵢ f(xᵢ) when both the wᵢ and the xᵢ may be chosen.', 'Each free parameter can satisfy one equation ∫ xᵏ dx = Σ wᵢ xᵢᵏ.'],
      teach: 'Choosing the nodes as well as the weights doubles the degree of exactness: 2n − 1 from n evaluations, the most any n-point rule can achieve.',
      explain: t`$2n$ unknowns match $2n$ moment equations, so degree $2n - 1$. It cannot do better: $\prod_i (x - x_i)^2$ has degree $2n$, a positive integral, and is zero at every node.`,
    }),
    num({
      id: 'points-needed', difficulty: 2,
      gen(r) {
        const d = r.int(4, 11), ans = Math.ceil((d + 1) / 2);
        return {
          prompt: t`A polynomial of degree $${d}$ must be integrated exactly with Gauss–Legendre. What is the smallest number of points $n$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.1, 1.1], y: [-1.2, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
              curves: [{ fn: `${d % 2 ? 'x*' : ''}cos(${d % 2 ? d - 1 : d}*acos(x))`, color: 'accent', width: 2, domain: [-1, 1] }] },
            caption: `An example polynomial of degree ${d} on [−1, 1]: Gauss integrates it exactly once 2n − 1 ≥ ${d}.`,
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: d + 1, feedback: 'That is what interpolating with n points needs. Gauss reaches degree 2n − 1.' }, { value: Math.ceil(d / 2), feedback: `Check: 2n − 1 must be at least ${d}.` }].filter((e) => e.value !== ans),
          hints: [t`Solve $2n - 1 \ge ${d}$.`, t`$n \ge ${(d + 1) / 2}$; round up.`],
          teach: 'An n-point Gauss rule handles degree 2n − 1, so degree d needs ⌈(d + 1)/2⌉ points.',
          explain: t`$2n - 1 \ge ${d}$ gives $n \ge ${(d + 1) / 2}$, so $n = ${ans}$: degree $${2 * ans - 1}$. A Newton–Cotes rule would need $${d % 2 ? d : d + 1}$ equally spaced points for the same polynomial.`,
        };
      },
    }),
    num({
      id: 'map-interval', difficulty: 2,
      gen(r) {
        const [Itex, fx, f, a, b, exTeX, exact] = r.pick(MAP_CASES);
        const c = (a + b) / 2, hw = (b - a) / 2, xs = [c - hw * X2, c + hw * X2];
        const ans = hw * (f(xs[0]) + f(xs[1]));
        return {
          prompt: t`Apply the 2-point Gauss rule (nodes $\pm1/\sqrt3$, weights 1 on $[-1, 1]$) to $${Itex}$. Give 4 significant figures.`,
          visual: {
            type: 'graph',
            params: { x: [a - 0.1 * (b - a), b + 0.1 * (b - a)], y: [0, Math.max(f(a), f(b)) * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
              curves: [{ fn: fx, color: 'accent', width: 2.2, domain: [a, b] }],
              shade: [{ fn: fx, from: a, to: b, color: 'accent', alpha: 0.15 }],
              vlines: [{ x: a, color: 'ink4' }, { x: b, color: 'ink4' }] },
            caption: 'The integrand over the interval. The nodes must first be moved from [−1, 1] to here.',
          },
          answer: ans, tol: { rel: 5e-4 },
          errors: [
            { value: f(xs[0]) + f(xs[1]), feedback: t`You mapped the nodes but forgot the factor $\tfrac{b-a}{2} = ${hw}$: the weights stretch with the interval.` },
            { value: hw * (f(-X2) + f(X2)), feedback: 'You evaluated f at ±1/√3 themselves. Map them first: x = (a + b)/2 + (b − a)/2 · s.' },
          ].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`Nodes: $x = ${c} \pm ${hw}/\sqrt3$; weights $${hw}$ each.`, t`The nodes are $${xs[0].toFixed(4)}$ and $${xs[1].toFixed(4)}$.`],
          teach: 'On [a, b] the Gauss nodes move to (a + b)/2 + (b − a)/2 · xᵢ and the weights scale by (b − a)/2.',
          explain: t`$${hw}\left[f(${xs[0].toFixed(4)}) + f(${xs[1].toFixed(4)})\right] = ${ans.toFixed(5)}$, against the exact $${exTeX} = ${exact.toFixed(5)}$ (error $${tex(ans - exact, 2)}$) — from just two evaluations.`,
        };
      },
    }),
    num({
      id: 'first-miss', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2, 3]), p = 2 * n, ans = missErr(n);
        return {
          prompt: t`The ${n}-point Gauss–Legendre rule on $[-1, 1]$ has degree of exactness $${2 * n - 1}$. What is its error $\int_{-1}^1 x^{${p}}\,dx - \sum w_i x_i^{${p}}$ on the first power it misses? (${n === 1 ? t`Node $0$, weight $2$.` : n === 2 ? t`Nodes $\pm1/\sqrt3$, weights $1$.` : t`Nodes $0$ and $\pm\sqrt{3/5}$, weights $\tfrac89$ and $\tfrac59$.`})`,
          visual: {
            type: 'graph',
            params: { x: [-1.15, 1.15], y: [-0.1, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
              curves: [{ fn: `x^${p}`, color: 'accent', width: 2.2, domain: [-1, 1], label: `x^${p}`.replace('^2', '²').replace('^4', '⁴').replace('^6', '⁶'), labelAt: 0.92, labelDx: 8, labelDy: 0 }],
              points: GL[n - 1].x.map((x) => ({ x: n12(x), y: n12(x ** p), r: 5, color: 'gold' })) },
            caption: 'The integrand and the values the rule sees at its nodes (gold).',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`The rule is exact only up to degree $${2 * n - 1}$; $x^{${p}}$ is one beyond.` }, { value: 2 / (p + 1), feedback: 'That is the integral itself; subtract what the rule returns.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\int_{-1}^1 x^{${p}}\,dx = \tfrac{2}{${p + 1}}$.`, `Add up $w_i x_i^{${p}}$ over the ${n} node${n > 1 ? 's' : ''}.`],
          teach: 'The first monomial a rule misses, $x^{2n}$ for Gauss, measures its error constant: the error of any smooth f is that constant times f⁽²ⁿ⁾/(2n)!.',
          explain: t`The integral is $\tfrac{2}{${p + 1}}$, the rule gives $${tex(2 / (p + 1) - ans, 4)}$, so the error is $${tex(ans, 4)}$${n === 2 ? t` $= \tfrac{8}{45}$` : n === 3 ? t` $= \tfrac{8}{175}$` : t` $= \tfrac23$`}. It shrinks fast with $n$, roughly like $\pi\cdot 4^{-n}$; for a general $f$, divide by $(2n)!$ and multiply by $f^{(2n)}(\xi)$.`,
        };
      },
    }),
    mcq({
      id: 'why-zeros', difficulty: 3,
      prompt: t`Why must the nodes of an $n$-point Gauss rule be the zeros of $P_n$? Take any polynomial $f$ of degree $\le 2n - 1$ and divide it by $P_n$: $f = qP_n + r$, with $q$ and $r$ of degree $\le n - 1$.`,
      visual: {
        type: 'graph',
        params: { x: [-1.15, 1.15], y: [-1.1, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
          curves: [{ fn: LEG[3], color: 'accent', width: 2.2, domain: [-1, 1], label: 'P₄', labelAt: 0.97, labelDx: 8, labelDy: 0 }],
          points: GL[3].x.map((x) => ({ x: n12(x), y: 0, r: 5, color: 'gold' })) },
        caption: 'P₄ and its four zeros. At the zeros, any multiple qP₄ is invisible to the rule.',
      },
      choices: [
        t`$\int qP_n\,dx = 0$ because $P_n$ is orthogonal to every lower-degree polynomial, and at the zeros of $P_n$ the rule sees $qP_n = 0$ too; so both reduce to $r$, which $n$ points integrate exactly`,
        t`The zeros of $P_n$ are equally spaced, which keeps the weights positive`,
        t`$P_n$ is the polynomial that best approximates $f$, so sampling at its zeros minimises the error`,
        t`Only at the zeros of $P_n$ is the Vandermonde system for the weights invertible`,
      ],
      answer: 0,
      why: {
        1: 'They are not equally spaced; they crowd towards ±1 like Chebyshev points.',
        2: 'Pₙ is a fixed polynomial that knows nothing about f; the argument is orthogonality, not approximation.',
        3: 'Any n distinct nodes give an invertible system — that is how Newton–Cotes weights are found. Only the zeros of Pₙ also kill the qPₙ part.',
      },
      hints: ['What is ∫₋₁¹ q(x) Pₙ(x) dx when q has degree below n?', 'What does Σ wᵢ q(xᵢ) Pₙ(xᵢ) equal if every xᵢ is a zero of Pₙ?'],
      teach: 'Orthogonality makes the integral of qPₙ vanish, and choosing the nodes at Pₙ’s zeros makes the rule’s sum of qPₙ vanish too — so exactness for degree n − 1 becomes exactness for 2n − 1.',
      explain: t`$\int f = \int qP_n + \int r = 0 + \int r$ by orthogonality, and $\sum w_if(x_i) = \sum w_i q(x_i)\cdot 0 + \sum w_i r(x_i)$. Since $r$ has degree $\le n - 1$, the interpolatory weights integrate it exactly. Both sides agree: exact to degree $2n - 1$. The same argument, with other orthogonal polynomials, gives Gauss–Laguerre, Gauss–Hermite and Gauss–Chebyshev rules for weighted integrals.`,
    }),
    mcq({
      id: 'kronrod', difficulty: 2,
      prompt: t`To estimate the error of a Gauss rule you would like a second, better estimate. Why is using the $n$- and $2n$-point Gauss rules wasteful, and what do library routines (QUADPACK, scipy.integrate.quad) do instead?`,
      visual: {
        type: 'graph',
        params: { x: [-1.15, 1.15], y: [-0.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', yticks: 0,
          points: [...GL[2].x.map((x) => ({ x: n12(x), y: 1, r: 5, color: 'gold' })), ...gaussLegendre(6).x.map((x) => ({ x: n12(x), y: 0, r: 5, color: 'accent' }))],
          hlines: [{ y: 1, color: 'ink4', label: '3-point Gauss' }, { y: 0, color: 'ink4', label: '6-point Gauss' }] },
        caption: 'The nodes of the 3-point (gold) and 6-point (blue) Gauss rules: not one is shared.',
      },
      choices: [
        'Gauss nodes for different n do not coincide, so the 2n-point rule reuses none of the n evaluations; a Gauss–Kronrod rule adds n + 1 nodes to the n Gauss nodes and reuses them',
        'The 2n-point rule is less accurate than the n-point rule',
        'Gauss rules cannot be combined because their weights are irrational',
        'Libraries use Simpson’s rule for the second estimate, which shares the Gauss nodes',
      ],
      answer: 0,
      why: {
        1: 'More points means higher degree: the 2n-point rule is more accurate. The problem is cost, not accuracy.',
        2: 'Weights are just numbers in floating point; irrationality is no obstacle.',
        3: 'Simpson’s equally spaced nodes do not include the Gauss nodes either.',
      },
      hints: ['Compare the node positions in the picture: how many function values can be reused?', 'A Kronrod extension keeps the n Gauss nodes and adds n + 1 more, chosen for the highest degree.'],
      teach: 'Gauss rules are not nested; Gauss–Kronrod pairs are, giving an error estimate almost free — the basis of adaptive library integrators.',
      explain: t`The $n$- and $2n$-point rules share no nodes, so the pair costs $3n$ evaluations. Kronrod’s $2n + 1$-point extension reuses the $n$ Gauss values; QUADPACK’s QAGS, behind \`scipy.integrate.quad\`, uses the 10-point Gauss rule inside a 21-point Kronrod rule and returns their difference as \`abserr\`. Adaptivity is the [next lesson](#/lesson/st-f.F5.3).`,
    }),
    code({
      id: 'molniya', difficulty: 3,
      prompt: t`An orbit with semi-major axis $a$, eccentricity $e$ and semi-latus rectum $p = a(1 - e^2)$ has specific angular momentum $h = \sqrt{\mu p}$, and $dt = r^2\,d\theta/h$ with $r = p/(1 + e\cos\theta)$. So its period is
$$T = \frac{2p^2}{h}\int_0^\pi \frac{d\theta}{(1 + e\cos\theta)^2}.$$
For a Molniya orbit ($a = 26\,600$ km, $e = 0.74$, $\mu = 398\,600.4418\ \text{km}^3/\text{s}^2$), write \`period_gauss(n)\` computing $T$ with the $n$-point Gauss–Legendre rule (\`np.polynomial.legendre.leggauss(n)\` gives nodes and weights on $[-1, 1]$). Store the relative errors against Kepler’s third law, $T = 2\pi\sqrt{a^3/\mu}$, for $n = 4, 8, 16, 32$ in a list \`rel\`.`,
      starter: t`import numpy as np

mu, a, e = 398600.4418, 26600.0, 0.74
p = a * (1 - e**2)
h = np.sqrt(mu * p)
T_kepler = 2 * np.pi * np.sqrt(a**3 / mu)

def period_gauss(n):
    x, w = np.polynomial.legendre.leggauss(n)
    theta = x            # map [-1, 1] to [0, pi]
    f = 1 / (1 + e * np.cos(theta))**2
    return 0.0

rel = [abs(period_gauss(n) - T_kepler) / T_kepler for n in [4, 8, 16, 32]]
print(T_kepler, rel)
`,
      answer: t`import numpy as np

mu, a, e = 398600.4418, 26600.0, 0.74
p = a * (1 - e**2)
h = np.sqrt(mu * p)
T_kepler = 2 * np.pi * np.sqrt(a**3 / mu)

def period_gauss(n):
    x, w = np.polynomial.legendre.leggauss(n)
    theta = np.pi / 2 * (x + 1)          # map [-1, 1] to [0, pi]
    f = 1 / (1 + e * np.cos(theta))**2
    return 2 * p**2 / h * (np.pi / 2) * np.sum(w * f)

rel = [abs(period_gauss(n) - T_kepler) / T_kepler for n in [4, 8, 16, 32]]
print(T_kepler, rel)`,
      tests: [
        { name: t`32 points reproduce Kepler’s period, $${(TK / 3600).toFixed(3)}$ h, to $10^{-12}$`, code: 'abs(period_gauss(32) / T_kepler - 1) < 1e-12' },
        { name: 'the 4-point estimate errs by about 1%', code: '0.005 < rel[0] < 0.02' },
        { name: 'the errors fall with every doubling of n', code: 'len(rel) == 4 and all(rel[k + 1] < rel[k] for k in range(2))' },
      ],
      hints: ['θ = (π/2)(x + 1) maps the nodes; the weights then scale by π/2.', 'Return 2p²/h × (π/2) × Σ wᵢ f(θᵢ).'],
      teach: 'Gauss–Legendre converges geometrically on an analytic integrand: each doubling of n here multiplies the number of correct digits rather than adding to it.',
      explain: t`The relative errors come out near $${MOL.slice(0, 3).map((x) => tex(x, 2)).join(',\\ ')}$ and round-off at $n = 32$: $T = ${(TK / 3600).toFixed(4)}$ h, half a sidereal day — why Molniya orbits were chosen. Geometric convergence means the digit count roughly doubles with each doubling of $n$, not a fixed gain as for an order-$p$ rule.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-halley', difficulty: 3, transfer: true,
      prompt: t`The same period integral for two orbits, with $n$-point Gauss–Legendre on $[0, \pi]$: for $e = 0.2$ the relative errors at $n = 5, 10, 20$ are $${[5, 10, 20].map((n) => tex(kepRel(0.2, n), 2)).join(',\\ ')}$; for Halley’s comet, $e = 0.967$, they are $${[5, 10, 20].map((n) => tex(kepRel(0.967, n), 2)).join(',\\ ')}$. Why does the comet need so many more points?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3.25], y: [-1, 3.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'true anomaly θ (rad)', ylabel: '1/(1 + e cos θ)²',
          curves: [{ fn: '-2*log10(1 + 0.967*cos(x))', color: 'bad', width: 2.2, domain: [0, Math.PI], label: 'e = 0.967', labelAt: 2.2, labelDx: -40, labelDy: -14 }, { fn: '-2*log10(1 + 0.2*cos(x))', color: 'accent', width: 2.2, domain: [0, Math.PI], label: 'e = 0.2', labelAt: 2.2, labelDx: 0, labelDy: -12 }] },
        caption: `The integrand (time per radian, up to a constant) on a logarithmic axis. Halley’s comet spends almost all its time near aphelion, θ = π, where the integrand is about ${Math.round(((1.967 / 0.033) ** 2) / 100) * 100} times its perihelion value.`,
      },
      choices: [
        'The integrand is sharply peaked near aphelion; its complex pole, at θ = π ± 0.26i, lies close to the interval, and Gauss’s geometric rate is set by that distance — still geometric, but slow to start',
        'Gauss–Legendre cannot integrate rational functions of cos θ',
        'The comet’s orbit is not closed, so the period integral does not converge',
        'Round-off grows with the eccentricity, so more points are needed to average it out',
      ],
      answer: 0,
      why: {
        1: 'It integrates them, and very well when the poles are far from the interval: e = 0.2 is at round-off by n = 20.',
        2: t`$e < 1$ is a closed ellipse; Halley’s period is about 75 years, and the 40-point estimate of the integral is good to $${tex(kepRel(0.967, 40), 1)}$ relative.`,
        3: 'The errors at n = 5 and 10 are percents, far above round-off; it is the shape of the integrand.',
      },
      hints: ['Where does 1 + e cos θ come closest to zero, and how close for e = 0.967?', 'Geometric convergence rates depend on how far the integrand can be continued into the complex plane before it blows up.'],
      teach: 'For analytic integrands Gauss quadrature converges geometrically at a rate set by the distance to the nearest complex singularity; a sharp peak signals a nearby one and a slow rate.',
      explain: t`$1 + e\cos\theta = 0$ at $\cos\theta = -1/e$: for $e = 0.967$, $\theta = \pi \pm i\,\text{arccosh}(1/e) = \pi \pm ${Math.acosh(1 / 0.967).toFixed(2)}i$, close to the endpoint. For $e = 0.2$ the pole is at $\pi \pm ${Math.acosh(5).toFixed(2)}i$, far away. Remedies: more points (40 give $${tex(kepRel(0.967, 40), 1)}$), panels split near aphelion, or integrate in the eccentric anomaly $E$, where $dt \propto (1 - e\cos E)\,dE$ is so gentle that the trapezoid rule over a full period integrates it exactly with two points.`,
    }),
    num({
      id: 'cp-thrust-fit', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([5, 6, 7, 8, 9]), ans = Math.ceil((d + 1) / 2);
        return {
          prompt: t`A motor’s thrust curve over its burn is represented by a degree-$${d}$ polynomial fit, and a trajectory code needs its total impulse many thousands of times. How many Gauss–Legendre points make the integral **exact** (up to round-off)?`,
          visual: {
            type: 'graph',
            params: { x: [-0.1, 3.1], y: [0, 1300], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'thrust (N)',
              curves: [{ fn: '1000*(1 - exp(-6x)) - 80*x + 40*sin(2x)', color: 'accent', width: 2.2, domain: [0, 3] }],
              shade: [{ fn: '1000*(1 - exp(-6x)) - 80*x + 40*sin(2x)', from: 0, to: 3, color: 'accent', alpha: 0.15 }] },
            caption: 'A schematic thrust curve; the code stores a polynomial fit to it. Total impulse is the shaded area.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: d + 1, feedback: 'That many points interpolate the polynomial; Gauss needs only half, since it is exact to degree 2n − 1.' }].filter((e) => e.value !== ans),
          hints: [t`$2n - 1 \ge ${d}$.`, 'Round (d + 1)/2 up.'],
          teach: 'For polynomial integrands, Gauss–Legendre with ⌈(d + 1)/2⌉ points is exact — the cheapest way to integrate a fitted model repeatedly.',
          explain: t`$n = ${ans}$ points give degree $${2 * ans - 1} \ge ${d}$: exact for the fit, at $${ans}$ evaluations per impulse.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Trefethen (2008), Is Gauss quadrature better than Clenshaw–Curtis? SIAM Review 50, 67', url: 'https://doi.org/10.1137/060659831' },
    { label: 'Golub & Welsch (1969), Calculation of Gauss quadrature rules, Math. Comp. 23, 221', url: 'https://doi.org/10.1090/S0025-5718-69-99647-1' },
    { label: 'Piessens et al. (1983), QUADPACK, Springer (Gauss–Kronrod rules behind scipy.integrate.quad)', url: 'https://doi.org/10.1007/978-3-642-61786-7' },
  ],
});
