// Newton's method and its convergence — the analyst's view: the error
// recursion e₍ₙ₊₁₎ ≈ C eₙ² from Taylor's theorem, the asymptotic constant
// C = |f″/(2f′)|, measuring the order from successive errors, local
// convergence and its basin (arctan), multiple roots and linear convergence,
// and division by Newton's method (the reciprocal iteration).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg, seg, newton } from './_num.js';

const t = String.raw;

// ── Explore: Newton on arctan, iterates as nested graph expressions of the dragged start px ──
const N = (x) => `((${x}) - atan(${x})*(1 + (${x})^2))`;
const XS = ['px'];
for (let k = 1; k <= 4; k++) XS.push(N(XS[k - 1]));
const CRIT = 1.3917452002707;                           // |x₀| where Newton on arctan cycles: x₁ = −x₀

// ── the worked example: 1/7 by x ← x(2 − 7x), from x₀ = 0.1 ──
const A = 7, RX = [0.1];
for (let k = 0; k < 6; k++) RX.push(RX[k] * (2 - A * RX[k]));
const REPS = RX.map((x) => 1 - A * x);                  // relative errors ε = 1 − a x

// ── Newton on x eˣ = 1 (the omega constant), errors and observed orders ──
const OMEGA = 0.5671432904097838;
const OM = newton((x) => x * Math.exp(x) - 1, (x) => Math.exp(x) * (x + 1), 1, 6).map((x) => Math.abs(x - OMEGA));

// ── a double root: Newton on (x − 1)²(x + 2) from 2 ──
const DBL = newton((x) => (x - 1) ** 2 * (x + 2), (x) => 2 * (x - 1) * (x + 2) + (x - 1) ** 2, 2, 12).map((x) => Math.abs(x - 1));
const MOD = (() => { const xs = [2]; for (let k = 0; k < 5; k++) { const x = xs[k], f = (x - 1) ** 2 * (x + 2), d = 2 * (x - 1) * (x + 2) + (x - 1) ** 2; xs.push(d === 0 ? x : x - (2 * f) / d); } return xs.map((x) => Math.abs(x - 1)); })();

// ── the transfer: burn time of a rocket stage climbing vertically ──
const G0 = 9.81;
function burnTime(ve, m0, mdot, dv) {
  const f = (t) => ve * Math.log(m0 / (m0 - mdot * t)) - G0 * t - dv;
  const df = (t) => (ve * mdot) / (m0 - mdot * t) - G0;
  let x = 225;
  for (let k = 0; k < 60; k++) x -= f(x) / df(x);
  return x;
}

const s2 = (x) => Number(x.toPrecision(2));
const ord = (e1, e2, e3) => Math.log(e3 / e2) / Math.log(e2 / e1);

export default lesson({
  id: 'st-f.F3.2',
  title: 'Newton’s method and its convergence',
  minutes: 13, difficulty: 3,
  intro: t`Newton’s method replaces $f$ by its tangent line at $x_n$ and takes the tangent’s zero as the next guess, $x_{n+1} = x_n - f(x_n)/f'(x_n)$. You met it as a recipe in [Calculus I](#/lesson/math1210.C1-4.8); here is why it is fast. Taylor’s theorem with the Lagrange remainder ([Calculus II](#/lesson/math1220.C2-5.5)) about $x_n$, evaluated at the root $r$, gives $0 = f(x_n) + f'(x_n)(r - x_n) + \tfrac12 f''(\xi_n)(r - x_n)^2$. Divide by $f'(x_n)$ and rearrange:

$$r - x_{n+1} = -\frac{f''(\xi_n)}{2f'(x_n)}\,(r - x_n)^2 \quad\Longrightarrow\quad \lvert e_{n+1}\rvert \approx C\,\lvert e_n\rvert^2, \quad C = \left\lvert\frac{f''(r)}{2f'(r)}\right\rvert$$

The error is **squared** at every step: once it is small, the number of correct digits doubles each time. That is **quadratic convergence**, order $p = 2$. The proof needs $f'(r) \ne 0$ and a start close enough to $r$; drop either, and the method slows down or wanders off.`,
  symbols: [
    { tex: t`x_n`, text: 'the $n$-th iterate; $x_0$ is your starting guess' },
    { tex: t`e_n = x_n - r`, text: 'its error, measured from the root $r$ (in the units of $x$)' },
    { tex: t`f'(x_n)`, text: 'the slope of the tangent: Newton needs the derivative, one extra evaluation per step' },
    { tex: t`\xi_n`, text: 'some point between $x_n$ and $r$, supplied by the Lagrange remainder' },
    { tex: 'C', text: 'the **asymptotic error constant** $\\lvert f\'\'(r)/(2f\'(r))\\rvert$, in units of $1/x$: curvature over slope' },
    { tex: 'p', text: 'the **order** of convergence, $\\lvert e_{n+1}\\rvert \\approx C\\lvert e_n\\rvert^p$; measured as $p \\approx \\dfrac{\\ln(e_{n+1}/e_n)}{\\ln(e_n/e_{n-1})}$' },
  ],
  why: 'Newton’s method — and its many-variable form, which solves a linear system at every step — is inside every implicit ODE solver, every equilibrium and initial-data solver in numerical relativity, and every orbit-determination code; knowing when it converges quadratically, and when it does not, is what lets you trust them.',
  visual: {
    type: 'graph',
    title: 'Tangents to arctan',
    lead: t`Drag the starting point $x_0$ along the axis. Each gold tangent runs from the curve $y = \arctan x$ to the axis, where the next iterate starts. The readouts list the first four iterates.`,
    tasks: [
      'Start at x₀ = 1: the iterates reach 0 to 10 digits in four steps.',
      'Start at x₀ = 1.3, then 1.45: just past |x₀| ≈ 1.392 the iterates overshoot, alternate in sign and grow.',
      'Watch the readouts near the root: the number of zeros after the point doubles each step.',
    ],
    params: {
      x: [-4.2, 4.2], y: [-1.8, 1.8], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
      drag: [{ key: 'p', x: 1, y: 0, lockY: true }],
      curves: [{ fn: 'atan(x)', color: 'accent', width: 2.4 },
        ...[0, 1, 2].flatMap((k) => [
          { param: [`${XS[k]} + (${XS[k + 1]} - ${XS[k]})*t`, `atan(${XS[k]})*(1 - t)`], t: [0, 1], color: 'gold', width: 1.8 },
          { param: [XS[k + 1], `atan(${XS[k + 1]})*t`], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
        ])],
      points: [1, 2, 3].map((k) => ({ x: XS[k], y: 0, r: 4, color: 'gold', label: `x${'₁₂₃'[k - 1]}`, labelDx: -6, labelDy: 14 })),
      vlines: [{ x: CRIT, color: 'bad' }, { x: -CRIT, color: 'bad' }],
      readouts: [1, 2, 3, 4].map((k) => ({ label: `x${'₁₂₃₄'[k - 1]}`, expr: XS[k], digits: 6 })),
    },
    caption: 'Exact Newton iterates for f(x) = arctan x, whose only root is 0. The red lines at ±1.3917 mark the edge of the basin: started there, Newton jumps back and forth for ever.',
  },
  example: {
    prompt: t`Division is the slowest of the four operations in hardware, and many processors and math libraries compute $1/a$ by Newton’s method on $f(x) = 1/x - a$, which needs only multiplications. Derive the iteration, show that its error is squared exactly, and compute $1/7$ from $x_0 = 0.1$.`,
    visual: {
      type: 'graph',
      params: { x: [-0.3, 5.3], y: [-17, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step n', ylabel: 'relative error |1 − 7xₙ|',
        points: REPS.slice(0, 6).map((e, n) => ({ x: n, y: n12(lg(Math.max(Math.abs(e), 1e-17))), r: 4.5, color: 'accent' })),
        curves: [{ fn: `${n12(lg(0.3))}*2^x`, color: 'ink3', dash: true, width: 1.4, domain: [0, 5.2], label: 'ε₀^(2ⁿ)', labelAt: 3.2, labelDx: 8, labelDy: -6 }] },
      caption: 'Relative error of each iterate on a logarithmic axis: the exponent doubles every step until round-off (2⁻⁵² here) takes over.',
    },
    steps: [
      { label: 'The iteration', text: t`$f'(x) = -1/x^2$, so $x_{n+1} = x_n - \dfrac{1/x_n - a}{-1/x_n^2} = x_n + x_n - a x_n^2 = x_n(2 - ax_n)$: **no division** anywhere.` },
      { label: 'The error', text: t`Write $\varepsilon_n = 1 - ax_n$, the relative error. Then $1 - ax_{n+1} = 1 - 2ax_n + a^2x_n^2 = (1 - ax_n)^2$: $\varepsilon_{n+1} = \varepsilon_n^2$ **exactly**. In absolute terms $e_{n+1} = -a\,e_n^2$, and indeed $C = \lvert f''/(2f')\rvert = \lvert (2/r^3)/(-2/r^2)\rvert = 1/r = a$.` },
      { label: 'Run it', text: t`From $x_0 = 0.1$: $\varepsilon_0 = 0.3$, then $${REPS.slice(1, 5).map((e) => tex(e, 2)).join(',\\ ')}$, and $x_5 = ${RX[5]}$, correct to the last bit of float64.` },
      { label: 'Basin', text: t`$\varepsilon_{n+1} = \varepsilon_n^2$ converges exactly when $\lvert\varepsilon_0\rvert < 1$, that is $0 < x_0 < 2/a$. Start at $x_0 = 0.3 > 2/7$ and $\varepsilon_0 = -1.1$: the errors $1.21, 1.46, 2.14, \ldots$ grow without bound. Quadratic convergence is a **local** promise.` },
      { label: 'In hardware', text: t`A table lookup gives a few correct bits; each step doubles them: 8 bits become 16, 32, 64 — three steps to full float64 precision. That is the scheme of Newton–Raphson division in hardware and software: a short table, then a few multiply-only steps.` },
    ],
    answer: t`$x_{n+1} = x_n(2 - ax_n)$ with $\varepsilon_{n+1} = \varepsilon_n^2$; from $0.1$, five steps give $1/7 = ${RX[5]}$.`,
  },
  practice: [
    num({
      id: 'measure-order', difficulty: 2,
      gen(r) {
        const [errs, what] = r.pick([[OM.slice(1, 4), t`Newton’s method on $xe^x = 1$`], [OM.slice(2, 5), t`Newton’s method on $xe^x = 1$`], [DBL.slice(4, 7), t`Newton’s method on $(x - 1)^2(x + 2) = 0$`], [DBL.slice(7, 10), t`Newton’s method on $(x - 1)^2(x + 2) = 0$`]]);
        const [e1, e2, e3] = errs.map(s2);
        const ans = ord(e1, e2, e3);
        return {
          prompt: t`Three successive errors of ${what} are $e_1 = ${tex(e1, 2)}$, $e_2 = ${tex(e2, 2)}$ and $e_3 = ${tex(e3, 2)}$. Estimate the order of convergence $p$ from $\lvert e_{n+1}\rvert \approx C\lvert e_n\rvert^p$.`,
          visual: {
            type: 'graph',
            params: { x: [0.5, 3.5], y: [Math.floor(lg(e3)) - 0.5, Math.ceil(lg(e1)) + 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step', ylabel: 'error', xticks: 3,
              points: [e1, e2, e3].map((e, k) => ({ x: k + 1, y: n12(lg(e)), r: 5, color: 'accent' })) },
            caption: 'The three errors on a logarithmic axis. A constant drop per step means order 1; a drop that doubles each step means order 2.',
          },
          answer: ans, tol: { rel: 0, abs: 0.12 },
          errors: [{ value: e3 / e2, feedback: 'That is the ratio of two errors — the rate if the convergence were linear. The order compares the logarithms of successive ratios.' }],
          hints: [t`Divide the two relations: $\dfrac{e_3}{e_2} \approx \left(\dfrac{e_2}{e_1}\right)^p$, so $p \approx \dfrac{\ln(e_3/e_2)}{\ln(e_2/e_1)}$.`, t`$\ln(e_3/e_2) = ${Math.log(e3 / e2).toFixed(3)}$ and $\ln(e_2/e_1) = ${Math.log(e2 / e1).toFixed(3)}$.`],
          teach: 'The order is read from how the logarithm of the error changes: p ≈ ln(e₍ₙ₊₁₎/eₙ)/ln(eₙ/e₍ₙ₋₁₎), which cancels the unknown constant C.',
          explain: t`$p \approx ${Math.log(e3 / e2).toFixed(3)}/${Math.log(e2 / e1).toFixed(3)} = ${ans.toFixed(2)}$. ${ans > 1.5 ? 'Close to 2: a simple root, quadratic convergence (the estimate tends to 2 as the errors shrink).' : 'Close to 1: linear convergence — this root is a double root, where Newton loses its quadratic speed.'}`,
        };
      },
    }),
    num({
      id: 'predict-next', difficulty: 2,
      gen(r) {
        const [fTeX, Cf, rTeX] = r.pick([
          [t`x^3 - 8`, () => 1 / 2, t`r = 2`],
          [t`e^x - 5`, () => 1 / 2, t`r = \ln 5`],
          [t`\frac1x - 4`, () => 4, t`r = \tfrac14`],
          [t`x^2 - 9`, () => 1 / 6, t`r = 3`],
        ]);
        const k = r.int(3, 6);
        const C = Cf();
        const ans = C * 10 ** (-2 * k);
        return {
          prompt: t`Newton’s method is solving $${fTeX} = 0$ (root ${'$'}${rTeX}${'$'}). One iterate has error $e_n = 10^{-${k}}$. Using $C = \lvert f''(r)/(2f'(r))\rvert$, predict $\lvert e_{n+1}\rvert$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 5], y: [-2 * k - 3, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step', ylabel: 'error', xticks: 5,
              points: [{ x: 1, y: -k + 3 - Math.floor(k / 2) * 0, r: 4, color: 'ink3' }, { x: 2, y: -k, r: 5, color: 'accent', label: 'eₙ', labelDx: 8, labelDy: -10 }, { x: 3, y: -2 * k - 1.5, r: 6, color: 'gold', hollow: true, label: 'eₙ₊₁ = ?', labelDx: 10, labelDy: -10 }] },
            caption: 'Schematic error history on a logarithmic axis; the next error is the question.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: 10 ** (-2 * k), feedback: 'Squaring the error is right, but the constant C multiplies it.' }, { value: C * 10 ** -k, feedback: 'Newton squares the error: C eₙ², not C eₙ.' }],
          hints: ['Compute f′(r) and f″(r), then C = |f″(r)/(2f′(r))|.', t`Then $\lvert e_{n+1}\rvert \approx C \times (10^{-${k}})^2$.`],
          teach: 'Near a simple root each Newton step multiplies the squared error by C = |f″/(2f′)|: the curvature of f relative to its slope.',
          explain: t`$C = ${tex(C, 3)}$, so $\lvert e_{n+1}\rvert \approx ${tex(C, 3)} \times 10^{-${2 * k}} = ${tex(ans, 2)}$. A large $C$ (a sharply curved $f$ with a gentle slope) delays the quadratic phase; a small one hastens it.`,
        };
      },
    }),
    mcq({
      id: 'double-root', difficulty: 2,
      prompt: t`Newton’s method on $f(x) = (x - 1)^2(x + 2)$ from $x_0 = 2$ gives errors $${DBL.slice(0, 5).map((e) => tex(e, 2)).join(',\\ ')}, \ldots$ — each about half the last. Why, and what restores quadratic convergence?`,
      visual: {
        type: 'graph',
        params: { x: [-0.3, 11.3], y: [-6, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step n', ylabel: 'error',
          points: DBL.slice(0, 12).map((e, n) => ({ x: n, y: n12(lg(e)), r: 4, color: 'accent' })).concat(MOD.slice(0, 5).filter((e) => e > 1e-16).map((e, n) => ({ x: n, y: n12(lg(e)), r: 4, color: 'gold' }))),
          legend: [{ label: 'Newton', color: 'accent', point: true }, { label: 'x − 2f/f′', color: 'gold', point: true }], legendAt: 'tr' },
        caption: 'Errors of plain Newton (blue) and of the modified step x − 2f(x)/f′(x) (gold), logarithmic axis.',
      },
      choices: [
        t`$x = 1$ is a double root, so $f'(1) = 0$ and the analysis fails: the error ratio tends to $\tfrac12$. The step $x - 2f/f'$ restores order 2`,
        'The start x₀ = 2 is outside the basin of convergence; a closer start is needed',
        'Round-off error dominates; switching to higher precision restores order 2',
        'Newton’s method is always linear for cubics',
      ],
      answer: 0,
      why: {
        1: 'It does converge — just slowly. A closer start would still halve the error at every step.',
        2: 'The errors are far above 10⁻¹⁶; round-off plays no part.',
        3: 'At the simple root −2 the same cubic gives quadratic convergence.',
      },
      hints: [t`What is $f'(1)$? The derivation divided by $f'(x_n)$ and assumed $f'(r) \ne 0$.`, t`Near a root of multiplicity $m$, $f \approx c(x - r)^m$, and Newton gives $e_{n+1} = \tfrac{m-1}{m}e_n$.`],
      teach: 'At a root of multiplicity m Newton converges only linearly, with rate (m − 1)/m; multiplying the step by m restores quadratic convergence if m is known.',
      explain: t`For $f = c(x - r)^m$: $x - f/f' = x - (x - r)/m$, so $e_{n+1} = \tfrac{m-1}{m}e_n$ — rate $\tfrac12$ for a double root. The step $x - mf/f'$ cancels that exactly. In practice $m$ is often unknown; then apply Newton to $f/f'$, which has only simple roots.`,
    }),
    num({
      id: 'multiplicity', difficulty: 3,
      gen(r) {
        const m = r.pick([2, 3, 4, 5]);
        const ratio = (m - 1) / m;
        return {
          prompt: t`Newton’s method creeps towards a root: successive errors shrink by a nearly constant factor of $${ratio.toFixed(3)}$. Assuming $f \approx c(x - r)^m$ near the root, what is the multiplicity $m$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.2, 1.2], y: [-0.3, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'x − r', ylabel: 'f',
              curves: [2, 3, 4, 5].map((q, i) => ({ fn: q % 2 ? `x^${q}` : `x^${q}`, color: ['accent', 'warn', 'good', 'violet'][i], width: 1.8, domain: [-1.05, 1.05] })),
              legend: [{ label: '(x − r)²', color: 'accent' }, { label: '(x − r)³', color: 'warn' }, { label: '(x − r)⁴', color: 'good' }, { label: '(x − r)⁵', color: 'violet' }], legendAt: 'tl' },
            caption: 'Roots of multiplicity 2 to 5: the higher the multiplicity, the flatter f is near the root — and the less each tangent step achieves.',
          },
          answer: m, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 1 / (1 - ratio) - 1, feedback: t`Invert carefully: the rate is $(m - 1)/m = 1 - 1/m$, so $m = 1/(1 - \text{rate})$.` }],
          hints: [t`For $f = c(x - r)^m$, the Newton step is $x - \dfrac{(x - r)}{m}$.`, t`So $e_{n+1} = \left(1 - \tfrac1m\right)e_n$: solve $1 - 1/m = ${ratio.toFixed(3)}$.`],
          teach: 'A linear rate of (m − 1)/m from Newton’s method is the fingerprint of a root of multiplicity m.',
          explain: t`$1 - 1/m = ${ratio.toFixed(3)}$ gives $m = 1/(1 - ${ratio.toFixed(3)}) = ${m}$. With $m$ known, the step $x - ${m}f/f'$ converges quadratically.`,
        };
      },
    }),
    mcq({
      id: 'basin', difficulty: 2,
      prompt: t`Newton’s method on $f(x) = \arctan x$ (root 0) converges from $x_0 = 1.3$ but diverges from $x_0 = 1.45$, though $\arctan$ is smooth with $f'(0) = 1$. What explains it?`,
      visual: {
        type: 'graph',
        params: { x: [-3.2, 3.2], y: [-1.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'arctan x',
          curves: [{ fn: 'atan(x)', color: 'accent', width: 2.2 }, seg(1.45, Math.atan(1.45), 1.45 - Math.atan(1.45) * (1 + 1.45 ** 2), 0, { color: 'gold', width: 1.8 })],
          points: [{ x: 1.45, y: n12(Math.atan(1.45)), r: 4.5, color: 'gold', label: 'x₀ = 1.45', labelDx: 8, labelDy: -8 }, { x: n12(1.45 - Math.atan(1.45) * (1 + 1.45 ** 2)), y: 0, r: 4.5, color: 'gold', label: 'x₁', labelDx: -6, labelDy: 14 }] },
        caption: 'The first tangent from x₀ = 1.45: the curve has flattened, so the tangent reaches the axis beyond −1.45.',
      },
      choices: [
        'Quadratic convergence is local: far from the root arctan flattens, the tangents overshoot, and |x₁| > |x₀|',
        'f″(0) = 0, which breaks the convergence proof',
        'Round-off error in arctan near 1.45',
        'Newton’s method needs a bracket with a sign change',
      ],
      answer: 0,
      why: {
        1: t`$f''(0) = 0$ only makes $C = 0$: near 0 convergence is even faster (cubic). The trouble is far from the root.`,
        2: 'The overshoot is a matter of geometry: it happens in exact arithmetic.',
        3: 'That is bisection’s requirement, not Newton’s — and Newton’s lack of one is exactly why it can wander away.',
      },
      hints: ['Draw the tangent at x₀ = 1.45: where does it hit the axis?', 'Since arctan is odd, divergence starts when x₁ = −x₀ is overshot: that happens for |x₀| > 1.3917.'],
      teach: 'Newton’s method converges quadratically only from close enough to a simple root; outside that basin it can overshoot, cycle or diverge.',
      explain: t`The iteration is $x_{n+1} = x_n - (1 + x_n^2)\arctan x_n$. For $\lvert x_0\rvert$ above $1.3917$ (where $x_1 = -x_0$ exactly) each step lands farther out on the other side: from 1.45 the iterates are about $-1.55, 1.85, -2.89, 8.68, \ldots$. Safeguards (next lesson) keep Newton inside a bracket.`,
    }),
    num({
      id: 'table-start', difficulty: 2,
      gen(r) {
        const b = r.pick([4, 7, 8, 12, 14]);
        const ans = Math.ceil(Math.log2(53 / b));
        return {
          prompt: t`A processor computes $1/a$ by looking up a first approximation with $${b}$ correct bits (relative error $\varepsilon_0 = 2^{-${b}}$) and then applying $x \leftarrow x(2 - ax)$, which squares the relative error each time. How many iterations reach float64 accuracy, $\lvert\varepsilon\rvert \le 2^{-53}$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, 4.3], y: [0, 70], aspect: 'wide', axesAt: 'edge', xlabel: 'iteration', ylabel: 'correct bits', xticks: 5,
              hlines: [{ y: 53, label: 'float64: 53 bits', color: 'gold' }],
              points: [0, 1, 2, 3, 4].map((n) => ({ x: n, y: Math.min(69, 3 * 2 ** n), r: 4, color: 'ink3' })),
              curves: [{ fn: '3*2^x', color: 'ink3', dash: true, width: 1.2, domain: [0, 4.3] }] },
            caption: 'An example starting from 3 correct bits (grey): squaring the error doubles the number of correct bits every iteration.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.ceil(53 / b), feedback: 'Correct bits double each step; they do not grow by a fixed amount.' }],
          hints: [t`After $n$ iterations $\varepsilon_n = \varepsilon_0^{2^n} = 2^{-${b}\cdot 2^n}$.`, t`Find the smallest $n$ with $${b}\cdot 2^n \ge 53$.`],
          teach: 'Quadratic convergence doubles the number of correct digits per step, so a modest first guess needs only a few iterations.',
          explain: t`$${b}\cdot2^n \ge 53$ first holds at $n = ${ans}$ (${b} → ${[0, 1, 2, 3, 4].map((n) => b * 2 ** n).filter((v, i, a) => i === 0 || a[i - 1] < 53).join(' → ')} bits). A linearly convergent method gaining one bit per step would need $${53 - b}$.`,
        };
      },
    }),
    code({
      id: 'orders', difficulty: 2,
      prompt: t`Write \`observed_orders(e)\`, returning the list of estimates $p_n = \dfrac{\ln(e_{n+1}/e_n)}{\ln(e_n/e_{n-1})}$ for a list of errors \`e\` (one estimate per three consecutive errors). Then run Newton’s method on $f(x) = xe^x - 1$ from $x_0 = 1$, record the errors $\lvert x_n - W\rvert$ against the omega constant $W = 0.5671432904097838$ for $n = 0 \ldots 4$ in a list \`errs\`, and print the orders.`,
      starter: t`import math

W = 0.5671432904097838

def observed_orders(e):
    return []

f = lambda x: x * math.exp(x) - 1
df = lambda x: math.exp(x) * (x + 1)
x = 1.0
errs = []
# record abs(x - W), then take a Newton step — five errors in all

print(errs)
print(observed_orders(errs))
`,
      answer: t`import math

W = 0.5671432904097838

def observed_orders(e):
    return [math.log(e[k + 2] / e[k + 1]) / math.log(e[k + 1] / e[k]) for k in range(len(e) - 2)]

f = lambda x: x * math.exp(x) - 1
df = lambda x: math.exp(x) * (x + 1)
x = 1.0
errs = []
for n in range(5):
    errs.append(abs(x - W))
    x = x - f(x) / df(x)

print(errs)
print(observed_orders(errs))`,
      tests: [
        { name: 'exact powers: errors 10⁻¹, 10⁻², 10⁻⁴, 10⁻⁸ give orders 2, 2', code: 'all(abs(p - 2) < 1e-9 for p in observed_orders([1e-1, 1e-2, 1e-4, 1e-8]))' },
        { name: 'a linear sequence gives order 1', code: 'all(abs(p - 1) < 1e-9 for p in observed_orders([0.5, 0.25, 0.125, 0.0625]))' },
        { name: t`\`errs\` holds the five Newton errors, starting at $0.4329$`, code: 'len(errs) == 5 and abs(errs[0] - 0.43285670959021616) < 1e-12' },
        { name: 'the last estimate is within 0.01 of 2', code: 'abs(observed_orders(errs)[-1] - 2) < 0.01' },
      ],
      hints: ['A list comprehension over k in range(len(e) − 2) gives one estimate per window of three errors.', 'In the loop: append abs(x − W) first, then x = x − f(x)/df(x).'],
      teach: 'Three consecutive errors determine the order, because the ratio of logarithms cancels the unknown constant C.',
      explain: t`The estimates come out $1.85, 1.97, 2.00$: they approach 2 as the errors shrink and the asymptotic regime takes over — the first one is “pre-asymptotic”. Stop before the errors reach $10^{-16}$: there round-off, not the method, sets the error, and the estimates become meaningless.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-burn-time', difficulty: 3, transfer: true,
      gen(r) {
        const ve = r.pick([2600, 3100, 3500]), m0 = 1e5, mdot = 400, dv = r.pick([1800, 2000, 2200]);
        const ans = burnTime(ve, m0, mdot, dv);
        return {
          prompt: t`A stage of initial mass $m_0 = 100$ t burns $\dot m = 400$ kg/s with exhaust speed $v_e = ${ve}$ m/s, climbing vertically against $g_0 = 9.81\ \text{m/s}^2$ (no drag). Its speed after burning for $t$ seconds is $v(t) = v_e\ln\dfrac{m_0}{m_0 - \dot mt} - g_0t$. How long must it burn to reach $${dv}$ m/s? Give $t$ to 3 significant figures (Newton’s method converges in a few steps from $t_0 = 225$ s).`,
          visual: {
            type: 'graph',
            params: { x: [0, 245], y: [-200, 5200], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${ve}*ln(${m0}/(${m0} - ${mdot}*x)) - 9.81*x`, color: 'accent', width: 2.2, domain: [0, 240] }],
              hlines: [{ y: dv, label: `${dv} m/s`, color: 'gold' }] },
            caption: 'Speed against burn time for this stage (Tsiolkovsky with gravity loss, no drag, no change of g with height).',
          },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: (m0 / mdot) * (1 - Math.exp(-dv / ve)), feedback: 'That ignores gravity: you solved vₑ ln(m₀/m) = Δv. The −g₀t term costs extra burn time.' }],
          hints: [t`Solve $F(t) = v_e\ln\dfrac{m_0}{m_0 - \dot mt} - g_0t - ${dv} = 0$, with $F'(t) = \dfrac{v_e\dot m}{m_0 - \dot mt} - g_0$.`, t`Iterate $t \leftarrow t - F(t)/F'(t)$ from $t_0 = 225$ s until $t$ stops changing in the third figure.`],
          teach: 'Newton’s method solves a physics equation with no closed-form inverse in a handful of steps, as long as F′ is easy to write down.',
          explain: t`$t = ${ans.toFixed(2)}$ s. From $225$ s the iterates fall monotonically onto the root in about four steps: $F$ is increasing and convex, so a start to the right of the root can never overshoot. From $125$ s, on the left, the first tangent can overshoot past burn-out ($t = 250$ s) and the logarithm fails — the basin matters even here. The gravity loss, $g_0 t = ${(G0 * ans).toFixed(0)}$ m/s, is why the burn is longer than the rocket equation alone suggests.`,
        };
      },
    }),
    mcq({
      id: 'cp-graze', difficulty: 3, transfer: true,
      prompt: t`A collision-avoidance code finds when a satellite’s altitude $h(t)$ first equals a safety threshold $h_*$, by Newton’s method on $F(t) = h(t) - h_*$. On one pass its errors fall only by about half per step instead of squaring. The orbit’s lowest point happens to sit almost exactly at $h_*$. Why does Newton slow down?`,
      visual: {
        type: 'graph',
        params: { x: [-2.2, 2.2], y: [-0.25, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'time from closest approach', ylabel: 'altitude',
          curves: [{ fn: '0.25*x^2', color: 'accent', width: 2.2, label: 'h(t)', labelAt: 1.8, labelDx: 6, labelDy: -6 }],
          hlines: [{ y: 0, label: 'threshold h*', color: 'bad' }] },
        caption: 'Schematic: the altitude near its minimum, touching the threshold. Near a tangency F(t) behaves like c(t − t*)².',
      },
      choices: [
        'The threshold is touched tangentially, so t* is a double root of F (F′(t*) = 0) and Newton converges only linearly, with rate ½',
        'The orbit model is too inaccurate near perigee',
        'Newton’s method always needs a bracket around the root',
        'The threshold crossing is ill-conditioned, so round-off dominates',
      ],
      answer: 0,
      why: {
        1: 'Even an exact model of a grazing orbit gives a double root; accuracy of the model is not the issue.',
        2: 'Newton needs no bracket, and having one would not change its order.',
        3: 'A double root is indeed ill-conditioned, but the halving appears far above round-off: it is the multiplicity, not rounding, that slows Newton.',
      },
      hints: ['What is the slope of h(t) − h* at the moment it touches zero?', 'A root where F and F′ both vanish has multiplicity 2: Newton’s error ratio tends to (m − 1)/m.'],
      teach: 'A tangency — a grazing orbit, a critically damped system, a repeated eigenvalue — is a multiple root, and multiple roots turn Newton’s quadratic convergence into linear.',
      explain: t`At a grazing minimum $F \approx \tfrac12h''(t^*)(t - t^*)^2$, a double root: Newton’s errors halve each step. The time of the event is also ill-conditioned — a centimetre’s change in $h_*$ moves it a lot (by $\sqrt{\ }$ of the change) — so a robust code reports the closest approach instead of a crossing.`,
    }),
  ],
  sources: [
    { label: 'Süli & Mayers (2003), An Introduction to Numerical Analysis, Cambridge, §1.4 (Newton’s method, quadratic convergence)', url: 'https://doi.org/10.1017/CBO9780511801181' },
    { label: 'Sauer (2018), Numerical Analysis, 3rd ed., Pearson, §1.4 (Newton’s method; multiple roots)', url: 'https://openlibrary.org/isbn/9780134696454' },
    { label: 'Division algorithm: Newton–Raphson division (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Division_algorithm' },
  ],
});
