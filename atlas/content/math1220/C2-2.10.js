// Simpson's rule and the error bounds for the midpoint, trapezoid and Simpson rules.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { midpoint, trapezoid, simpsonRule, simpsonData, errorBound, nForTolerance, reference } from '../../src/viz/model/calc-quadrature.js';

const t = String.raw;

// integrands with exact bounds K2 ≥ |f″| and K4 ≥ |f⁗| on [a, b] (checked numerically)
const BOUNDED = [
  { txt: 'exp(x)', tex: t`e^{x}`, f: Math.exp, a: 0, b: 1, bTeX: '1', K2: Math.E, K2TeX: 'e', K4: Math.E, K4TeX: 'e', why2: t`f'' = e^x \le e`, why4: t`f^{(4)} = e^x \le e`, d2: 'exp(x)', d4: 'exp(x)' },
  { txt: 'sin(2x)', tex: t`\sin 2x`, f: (x) => Math.sin(2 * x), a: 0, b: Math.PI, bTeX: t`\pi`, K2: 4, K2TeX: '4', K4: 16, K4TeX: '16', why2: t`f'' = -4\sin 2x`, why4: t`f^{(4)} = 16\sin 2x`, d2: 'abs(4sin(2x))', d4: 'abs(16sin(2x))' },
  { txt: 'x^4', tex: t`x^4`, f: (x) => x ** 4, a: 0, b: 2, bTeX: '2', K2: 48, K2TeX: '48', K4: 24, K4TeX: '24', why2: t`f'' = 12x^2 \le 48`, why4: t`f^{(4)} = 24`, d2: '12x^2', d4: '24' },
  { txt: '1/x', tex: t`\frac1x`, f: (x) => 1 / x, a: 1, b: 2, bTeX: '2', K2: 2, K2TeX: '2', K4: 24, K4TeX: '24', why2: t`f'' = 2/x^3 \le 2`, why4: t`f^{(4)} = 24/x^5 \le 24`, d2: '2/x^3', d4: '24/x^5' },
  { txt: 'cos(x)', tex: t`\cos x`, f: Math.cos, a: 0, b: 1, bTeX: '1', K2: 1, K2TeX: '1', K4: 1, K4TeX: '1', why2: t`\lvert f''\rvert = \lvert\cos x\rvert \le 1`, why4: t`\lvert f^{(4)}\rvert = \lvert\cos x\rvert \le 1`, d2: 'abs(cos(x))', d4: 'abs(cos(x))' },
];
const SIMPLE = [
  ['x^4', t`x^4`, (x) => x ** 4, 0, 2],
  ['1/x', t`\frac{1}{x}`, (x) => 1 / x, 1, 3],
  ['sqrt(x)', t`\sqrt{x}`, Math.sqrt, 0, 4],
  ['exp(-x^2)', t`e^{-x^2}`, (x) => Math.exp(-x * x), 0, 2],
  ['1/(1 + x^2)', t`\frac{1}{1 + x^2}`, (x) => 1 / (1 + x * x), 0, 2],
];

// |f″| or |f⁗| across [a, b], with its maximum K dashed — what an error bound needs
const boundGraph = (expr, a, b, K, which, KTeX) => ({
  type: 'graph',
  params: { x: [a, b], y: [0, Math.max(K, 1e-9) * 1.3], ylabel: which === 2 ? '|f″|' : '|f⁗|', curves: [{ fn: expr, color: 'violet' }], hlines: [{ y: K, label: which === 2 ? 'K₂' : 'K₄' }] },
  caption: which === 2 ? t`$\lvert f''(x)\rvert$ across the interval; its largest value is $K_2 = ${KTeX}$ (dashed).` : t`$\lvert f^{(4)}(x)\rvert$ across the interval; its largest value is $K_4 = ${KTeX}$ (dashed).`,
});

export default lesson({
  id: 'math1220.C2-2.10',
  title: 'Simpson’s rule and error bounds',
  minutes: 12, difficulty: 3,
  intro: t`Simpson’s rule fits a **parabola through each pair of strips** and integrates the parabolas exactly. With an even number $n$ of strips,

$$S_n = \frac{\Delta x}{3}\Big[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + \cdots + 4f(x_{n-1}) + f(x_n)\Big]$$

It is exact for every cubic, and its error falls like $1/n^4$: **double the number of strips and the error drops sixteenfold**. The error bounds turn this into a guarantee you can compute before you start:

$$\lvert E_M\rvert \le \frac{K_2(b - a)^3}{24n^2}, \qquad \lvert E_T\rvert \le \frac{K_2(b - a)^3}{12n^2}, \qquad \lvert E_S\rvert \le \frac{K_4(b - a)^5}{180n^4}$$

Simpson’s rule is the workhorse for integrals with no formula — arc lengths, orbital periods, the normal distribution — and for smooth sampled data.`,
  symbols: [
    { tex: 'S_n', text: 'the Simpson estimate with n strips; n must be even, because each parabola spans two strips' },
    { tex: '1,\\ 4,\\ 2,\\ 4,\\ \\ldots,\\ 4,\\ 1', text: t`the weights: one parabola over two strips has area exactly $\tfrac{\Delta x}{3}(y_0 + 4y_1 + y_2)$, and samples shared by two parabolas add up to 2` },
    { tex: t`\Delta x = \frac{b - a}{n}`, text: 'the strip width' },
    { tex: 'K_2', text: t`any number with $\lvert f''(x)\rvert \le K_2$ for every $x$ in $[a, b]$` },
    { tex: 'K_4', text: t`any number with $\lvert f^{(4)}(x)\rvert \le K_4$ on $[a, b]$ — for a cubic it is 0, so Simpson is exact` },
    { tex: t`E_M,\ E_T,\ E_S`, text: 'the errors of the midpoint, trapezoid and Simpson estimates (estimate minus exact value)' },
  ],
  why: t`Because Simpson’s error is controlled by $f^{(4)}$ and $n^4$, a smooth integrand needs only a handful of samples for many correct digits — which is why it is the default rule for smooth data.`,
  visual: {
    type: 'calc-quadrature',
    title: 'Parabolas beat straight lines',
    lead: t`With Simpson selected, the gold dashed arcs are the parabolas through each pair of strips, and the small labels are the weights $1, 4, 2, \ldots$. The lower panel shows all three rules’ errors against $n$ on logarithmic scales: Simpson’s line falls twice as steeply, and its error ratio $E_n/E_{2n}$ settles near 16. The readout also compares the actual error with its guaranteed bound.`,
    tasks: [
      'On e^(−x²), compare the rules at n = 4 and then at n = 16: Simpson’s lead grows from about 5 times to about 100 times.',
      'Pick 1/(1 + x²) at n = 4: Simpson is worse than both other rules! Its 1/n⁴ advantage only takes over once the strips resolve the peak — by about n = 12 here.',
      'Pick x³: Simpson’s error is exactly zero for every n, and so is its bound, because f⁗ = 0.',
    ],
    params: {
      functions: [
        { fn: 'exp(-x^2)', a: 0, b: 2, exact: 0.882081390762422, label: 'e^(−x²)', K2: 2, K4: 12 },
        { fn: '1/(1 + x^2)', a: 0, b: 4, exact: Math.atan(4), label: '1/(1 + x²)', K2: 2, K4: 24 },
        { fn: 'x^3', a: 0, b: 2, exact: 4, label: 'x³', K2: 12, K4: 0 },
      ],
      rules: ['mid', 'trap', 'simpson'], rule: 'simpson', n: 4, nMax: 32, errorPlot: true,
    },
    caption: 'Exact errors against the true integrals; bounds use the largest |f″| or |f⁗| on the interval. Below about 10⁻¹⁴ rounding error would take over, so such points are not drawn.',
  },
  example: {
    title: 'The Gaussian integral, with a guarantee',
    prompt: t`Estimate $\displaystyle\int_0^1 e^{-x^2}\,dx$ with Simpson’s rule, $n = 4$, and bound the error. (This integral has no elementary antiderivative; it gives probabilities for the normal distribution.)`,
    visual: { type: 'calc-quadrature', params: { functions: [{ fn: 'exp(-x^2)', a: 0, b: 1, exact: 0.746824132812427, label: 'e^(−x²)', K4: 12 }], rules: ['simpson'], n: 4, nSlider: false, errorPlot: false }, caption: 'Two parabolic arcs (gold dashes) over four strips; they hug the curve closely.' },
    steps: [
      { label: 'Grid', text: t`$\Delta x = 0.25$; nodes $0, 0.25, 0.5, 0.75, 1$; values $1,\ 0.939413,\ 0.778801,\ 0.569783,\ 0.367879$.` },
      { label: 'Weights 1, 4, 2, 4, 1', text: t`$1 + 4(0.939413) + 2(0.778801) + 4(0.569783) + 0.367879 = 8.962265$.` },
      { label: 'Simpson', text: t`$S_4 = \dfrac{0.25}{3}\times 8.962265 = 0.746855$.` },
      { label: 'Bound the error', text: t`$f^{(4)}(x) = (16x^4 - 48x^2 + 12)\,e^{-x^2}$, whose largest size on $[0, 1]$ is $12$, at $x = 0$. So $$\lvert E_S\rvert \le \frac{12\,(1)^5}{180\cdot 4^4} = \frac{12}{46\,080} \approx 2.6\times10^{-4}.$$` },
      { label: 'Compare', text: t`The true value is $0.746824$, so the actual error is $3.1\times10^{-5}$ — well inside the bound. A bound is a worst-case guarantee, usually pessimistic.` },
    ],
    answer: t`$S_4 = 0.746855$, guaranteed within $2.6\times10^{-4}$ (actually within $3.1\times10^{-5}$) of $\int_0^1 e^{-x^2}dx = 0.746824$.`,
  },
  practice: [
    num({
      id: 'simpson', difficulty: 2,
      gen(r) {
        const [ftxt, ftex, f, a, b] = r.pick(SIMPLE), n = r.pick([2, 4]);
        const h = (b - a) / n, xs = Array.from({ length: n + 1 }, (_, i) => a + i * h), w = xs.map((_, i) => (i === 0 || i === n ? 1 : i % 2 ? 4 : 2));
        const S = simpsonRule(f, a, b, n);
        return {
          prompt: t`Estimate $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ with Simpson’s rule, $n = ${n}$, to 3 significant figures.`,
          answer: S, tol: { rel: 0.005 },
          errors: [{ value: trapezoid(f, a, b, n), feedback: t`That is the trapezoid estimate. Simpson weights the samples $1, 4, 2, \ldots, 4, 1$ and multiplies by $\Delta x/3$.` }, { value: 3 * S, feedback: t`Multiply by $\Delta x/3$, not $\Delta x$.` }].filter((e) => Math.abs(e.value - S) > 0.02 * Math.abs(S)),
          hints: [t`$\Delta x = ${nice(h)}$; nodes $${xs.map((x) => nice(x)).join(',\\ ')}$; weights $${w.join(',\\ ')}$.`, t`$S_{${n}} = \tfrac{${nice(h)}}{3}\big[${xs.map((x, i) => `${w[i] === 1 ? '' : w[i]}f(${nice(x)})`).join(' + ')}\big]$.`],
          teach: 'Simpson’s rule: Δx/3 times the samples weighted 1, 4, 2, …, 4, 1.',
          explain: t`$S_{${n}} = \tfrac{${nice(h)}}{3}\big(${xs.map((x, i) => `${w[i] === 1 ? '' : `${w[i]}\\cdot`}${nice(+f(x).toFixed(4))}`).join(' + ')}\big) = ${fmt(S, 4)}$.`,
          visual: { type: 'calc-quadrature', params: { functions: [{ fn: ftxt, a, b }], rules: ['simpson'], n, nSlider: false, errorPlot: false, readout: false }, caption: 'The parabolic arcs Simpson’s rule integrates, with each sample’s weight.' },
        };
      },
    }),
    mcq({
      id: 'why-even', difficulty: 1,
      prompt: 'Why does Simpson’s rule need an even number of strips?',
      choices: ['Each parabola spans two strips, so the strips must pair up', 'The weights 4 and 2 must balance', 'It needs a midpoint in every strip', 'An odd n would make Δx negative'],
      answer: 0,
      why: { 1: 'The weights follow from the pairing, not the other way round.', 2: 'That is the midpoint rule. Simpson uses the strip edges, three at a time.', 3: 'Δx = (b − a)/n is positive for any n.' },
      hints: ['How many points determine a parabola?', 'Three equally spaced points span two strips.'],
      teach: 'Three points fix a parabola, so Simpson’s rule works in pairs of strips.',
      explain: 'A parabola needs three points, x₀, x₁, x₂ — two strips. Covering [a, b] with such pairs needs an even number of strips.',
      visual: { type: 'calc-quadrature', params: { functions: [{ fn: '1 + sin(2x)/2', a: 0, b: 3, label: 'f' }], rules: ['simpson'], n: 4, nSlider: false, errorPlot: false, readout: false }, caption: 'Each gold parabola passes through three sample points and spans two strips.' },
    }),
    num({
      id: 'trap-bound', difficulty: 2,
      gen(r) {
        const g = r.pick(BOUNDED), n = r.pick([4, 8, 10]);
        const B = errorBound('trap', g.K2, g.a, g.b, n);
        return {
          prompt: t`Use $\lvert E_T\rvert \le \dfrac{K_2(b - a)^3}{12n^2}$ to bound the error of $T_{${n}}$ for $\displaystyle\int_{${g.a}}^{${g.bTeX}} ${g.tex}\,dx$. (Give the bound to 3 significant figures.)`,
          answer: B, tol: { rel: 0.005 },
          errors: [{ value: errorBound('mid', g.K2, g.a, g.b, n), feedback: 'That is the midpoint bound (24 in the denominator). The trapezoid bound has 12.' }, { value: (g.K2 * (g.b - g.a) ** 3) / (12 * n), feedback: 'Square n: the bound has n² in the denominator.' }],
          hints: [t`Find $K_2$: $${g.why2}$, so $K_2 = ${g.K2TeX}$ on $[${g.a}, ${g.bTeX}]$.`, t`$\dfrac{${g.K2TeX}\,(${g.bTeX} - ${g.a})^3}{12\cdot ${n}^2}$.`],
          teach: 'An error bound needs the largest size of f″ on the interval — then it is arithmetic.',
          explain: t`$K_2 = ${g.K2TeX}$, so $\lvert E_T\rvert \le \dfrac{${g.K2TeX}(${g.bTeX} - ${g.a})^3}{12\cdot${n * n}} = ${tex(B, 3)}$.`,
          visual: boundGraph(g.d2, g.a, g.b, g.K2, 2, g.K2TeX),
        };
      },
    }),
    num({
      id: 'n-trap', difficulty: 3,
      gen(r) {
        const [ftex, a, b, K, kwhy, d2] = r.pick([[t`5x^2 + 8`, 1, 4, 10, t`f'' = 10`, '10'], [t`\frac1x`, 1, 2, 2, t`f'' = 2/x^3 \le 2`, '2/x^3'], [t`e^{x}`, 0, 1, Math.E, t`f'' = e^x \le e`, 'exp(x)'], [t`\sin x`, 0, Math.PI, 1, t`\lvert f''\rvert \le 1`, 'abs(sin(x))']]);
        // avoid tolerances where the bound lands exactly on an integer n (then "round up" would mislead)
        const tol = r.pick([1e-3, 1e-4, 1e-5].filter((e) => { const x = Math.sqrt((K * (b - a) ** 3) / (12 * e)); return Math.abs(x - Math.round(x)) > 1e-6; }));
        const n = nForTolerance('trap', K, a, b, tol);
        const bTeX = b === Math.PI ? t`\pi` : String(b);
        return {
          prompt: t`What is the smallest $n$ that guarantees $\lvert E_T\rvert \le ${tex(tol, 1)}$ for $\displaystyle\int_{${a}}^{${bTeX}} ${ftex}\,dx$ by the trapezoid bound?`,
          answer: n, tol: { rel: 1e-6 },
          errors: [{ value: n - 1, feedback: 'Round up, not to the nearest integer: n must make the bound no larger than the tolerance.' }, { value: nForTolerance('mid', K, a, b, tol), feedback: 'That uses the midpoint bound (24). The trapezoid bound has 12 in the denominator.' }],
          hints: [t`Here $${kwhy}$, so $K_2 = ${K === Math.E ? 'e' : K}$. Solve $\dfrac{K_2(b - a)^3}{12n^2} \le ${tex(tol, 1)}$ for $n$.`, t`$n \ge \sqrt{\dfrac{K_2(b - a)^3}{12\times ${tex(tol, 1)}}} = ${fmt(Math.sqrt((K * (b - a) ** 3) / (12 * tol)), 4)}$; round up.`],
          teach: 'Choosing n for a tolerance: solve the error bound for n and round up.',
          explain: t`$n \ge ${fmt(Math.sqrt((K * (b - a) ** 3) / (12 * tol)), 4)}$, so $n = ${n}$.${ftex === t`5x^2 + 8` && tol === 1e-4 ? ' (This is the textbook’s n = 475.)' : ''}`,
          visual: boundGraph(d2, a, b, K, 2, K === Math.E ? 'e' : String(K)),
        };
      },
    }),
    num({
      id: 'n-simpson', difficulty: 3,
      gen(r) {
        const g = r.pick(BOUNDED.filter((x) => x.K4 > 0)), tol = r.pick([1e-6, 1e-8]);
        const n = nForTolerance('simpson', g.K4, g.a, g.b, tol), raw = ((g.K4 * (g.b - g.a) ** 5) / (180 * tol)) ** 0.25;
        return {
          prompt: t`What is the smallest $n$ for which the Simpson bound guarantees $\lvert E_S\rvert \le ${tex(tol, 1)}$ for $\displaystyle\int_{${g.a}}^{${g.bTeX}} ${g.tex}\,dx$?`,
          answer: n, tol: { rel: 1e-6 },
          errors: [{ value: Math.ceil(raw), feedback: 'Simpson needs an even n: round up to the next even number.' }].filter((e) => e.value !== n),
          hints: [t`$${g.why4}$, so $K_4 = ${g.K4TeX}$. Solve $\dfrac{K_4(b - a)^5}{180n^4} \le ${tex(tol, 1)}$.`, t`$n \ge \left(\dfrac{K_4(b - a)^5}{180\times${tex(tol, 1)}}\right)^{1/4} = ${fmt(raw, 4)}$; round up to an even number.`],
          teach: 'For Simpson, solve the bound for n, round up, and make n even.',
          explain: t`$n \ge ${fmt(raw, 4)}$, and the next even integer is $${n}$. For the same guarantee the trapezoid bound would need $n = ${nForTolerance('trap', g.K2, g.a, g.b, tol)}$.`,
          visual: boundGraph(g.d4, g.a, g.b, g.K4, 4, g.K4TeX),
        };
      },
    }),
    mcq({
      id: 'cubic-exact', difficulty: 2,
      gen(r) {
        const c = r.int(1, 3), d = r.intExcept(-3, 3, [0]), b = r.int(1, 3);
        return {
          prompt: t`Simpson’s rule with $n = 2$ is applied to $\displaystyle\int_0^{${b}} (x^3 ${c === 1 ? '-' : `- ${c}`}x ${d < 0 ? '-' : '+'} ${Math.abs(d)})\,dx$. What can you say about $S_2$?`,
          choices: ['It equals the exact value', 'It overestimates: Simpson always does for cubics', 'It underestimates the exact value', 'It is off by at most K₂(b − a)³/12n²'],
          answer: 0,
          why: { 1: 'For a cubic f⁗ = 0, so the Simpson error bound is zero: no error at all.', 2: 'For a cubic f⁗ = 0, so the Simpson error bound is zero: no error at all.', 3: 'That is the trapezoid bound. Simpson’s bound uses f⁗, which is 0 here.' },
          hints: [t`Simpson’s bound involves $f^{(4)}$.`, t`What is the fourth derivative of a cubic?`],
          teach: 'Simpson’s rule integrates every polynomial of degree 3 or less exactly.',
          explain: t`$f^{(4)} = 0$ for a cubic, so $\lvert E_S\rvert \le 0$: $S_2$ is exact. (Surprisingly, parabolas integrate cubics exactly — the cubic’s extra area cancels across each pair of strips.)`,
          visual: { type: 'calc-quadrature', params: { functions: [{ fn: `x^3 - ${c}*x + ${d}`, a: 0, b, label: 'cubic' }], rules: ['simpson'], n: 2, nSlider: false, errorPlot: false, readout: false }, caption: 'The gold parabola is not the cubic — it crosses it three times — yet the two areas are equal: the cubic’s excess over one strip exactly cancels its shortfall over the other.' },
        };
      },
    }),
    num({
      id: 'combine', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 4]), [ftex, f, a, b, ftxt] = r.pick([[t`e^{-x^2}`, (x) => Math.exp(-x * x), 0, 1, 'exp(-x^2)'], [t`\frac{1}{1 + x^2}`, (x) => 1 / (1 + x * x), 0, 1, '1/(1 + x^2)'], [t`\sqrt{1 + x^3}`, (x) => Math.sqrt(1 + x ** 3), 0, 1, 'sqrt(1 + x^3)']]);
        const M = +midpoint(f, a, b, n).toFixed(6), T = +trapezoid(f, a, b, n).toFixed(6), S = (2 * M + T) / 3;
        return {
          prompt: t`For $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ you have $M_{${n}} = ${M}$ and $T_{${n}} = ${T}$. Find $S_{${2 * n}}$ without evaluating $f$ again.`,
          answer: S, tol: { rel: 2e-6, abs: 2e-7 },
          errors: [{ value: (M + T) / 2, feedback: t`$(M_n + T_n)/2$ is $T_{2n}$. Simpson weights the midpoint estimate twice: $(2M_n + T_n)/3$.` }],
          hints: [t`The midpoint rule’s error is about $-\tfrac12$ the trapezoid rule’s, so a weighted average cancels the leading error.`, t`Weight $M_n$ twice and $T_n$ once: $S_{2n} = \tfrac{2M_n + T_n}{3}$.`],
          teach: 'Simpson’s rule is the weighted average (2M + T)/3 that cancels the midpoint and trapezoid errors.',
          explain: t`$S_{${2 * n}} = \tfrac{2(${M}) + ${T}}{3} = ${nice(+S.toFixed(7))}$. (Exact: $${reference(f, a, b).toFixed(6)}$.)`,
          visual: { type: 'calc-quadrature', params: { functions: [{ fn: ftxt, a, b, label: 'f' }], rules: ['mid', 'trap'], rule: 'mid', n, nSlider: false, errorPlot: false, readout: false }, caption: 'Switch between the midpoint rectangles and the trapezoids: they err in opposite directions, the trapezoids by about twice as much — so the weighted average (2M + T)/3 cancels most of both errors.' },
        };
      },
    }),
    mcq({
      id: 'ratio-16', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 4, 6, 8]), e = r.pick([-5, -6, -7]);
        const val = m * 10 ** e;
        return {
          prompt: t`Simpson’s rule with $n = 10$ has an error of about $${tex(val, 2)}$ for a smooth integrand. About how large is it with $n = 20$?`,
          choices: [t`$${tex(val / 16, 2)}$`, t`$${tex(val / 4, 2)}$`, t`$${tex(val / 2, 2)}$`, t`$${tex(val / 256, 2)}$`],
          answer: 0,
          why: { 1: 'Divide by 4 for the trapezoid or midpoint rule (1/n²). Simpson’s error falls like 1/n⁴.', 2: 'That assumes an error ∝ 1/n.', 3: 'Doubling n multiplies 1/n⁴ by 1/16, not 1/256.' },
          hints: [t`Simpson’s error is roughly proportional to $1/n^4$.`, t`$2^4 = 16$.`],
          teach: 'Simpson’s error scales like 1/n⁴: double n, divide the error by 16.',
          explain: t`$E \propto 1/n^4$: doubling $n$ divides the error by $2^4 = 16$, giving about $${tex(val / 16, 2)}$.`,
          visual: { type: 'calc-quadrature', params: { functions: [{ fn: 'exp(x)', a: 0, b: 1, exact: Math.E - 1, label: 'eˣ' }], rules: ['simpson'], n: 10, nSlider: false, errorPlot: true, readout: false }, caption: t`Simpson’s rule on $\int_0^1 e^x\,dx$ at $n = 10$ (top) and its error for every $n$ on log–log axes (bottom): a straight line of slope $-4$.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-simpson', difficulty: 2,
      gen(r) {
        const [ftxt, ftex, f, a, b] = r.pick(SIMPLE.slice(1)), S = simpsonRule(f, a, b, 4);
        return {
          prompt: t`Estimate $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ with Simpson’s rule, $n = 4$, to 3 significant figures.`,
          answer: S, tol: { rel: 0.005 },
          hints: [t`Weights $1, 4, 2, 4, 1$; multiply by $\Delta x/3$.`],
          teach: 'Simpson: Δx/3 × (1, 4, 2, 4, 1)-weighted samples.',
          explain: t`$S_4 = ${fmt(S, 4)}$ (exact $${fmt(reference(f, a, b), 5)}$).`,
          visual: { type: 'calc-quadrature', params: { functions: [{ fn: ftxt, a, b, label: 'f' }], rules: ['simpson'], n: 4, nSlider: false, errorPlot: false, readout: false }, caption: 'The two parabolic arcs Simpson’s rule integrates, with each sample’s weight.' },
        };
      },
    }),
    num({
      id: 'cp-n-simpson', difficulty: 3,
      gen(r) {
        const g = r.pick(BOUNDED.filter((x) => x.K4 > 0)), tol = r.pick([1e-5, 1e-7]);
        const n = nForTolerance('simpson', g.K4, g.a, g.b, tol);
        return {
          prompt: t`What is the smallest $n$ for which the Simpson bound guarantees $\lvert E_S\rvert \le ${tex(tol, 1)}$ for $\displaystyle\int_{${g.a}}^{${g.bTeX}} ${g.tex}\,dx$?`,
          answer: n, tol: { rel: 1e-6 },
          hints: [t`$${g.why4}$, so $K_4 = ${g.K4TeX}$.`, t`Solve $\dfrac{K_4(b - a)^5}{180n^4} \le ${tex(tol, 1)}$ for $n$, then round up to an even integer.`],
          teach: 'Solve the bound for n, round up, make it even.',
          explain: t`$n \ge \left(\dfrac{${g.K4TeX}(${g.bTeX} - ${g.a})^5}{180\times${tex(tol, 1)}}\right)^{1/4} = ${fmt(((g.K4 * (g.b - g.a) ** 5) / (180 * tol)) ** 0.25, 4)}$, so $n = ${n}$.`,
          visual: boundGraph(g.d4, g.a, g.b, g.K4, 4, g.K4TeX),
        };
      },
    }),
    num({
      id: 'cp-imu', difficulty: 3, transfer: true,
      gen(r) {
        // a = T/m(t) − g with the mass falling linearly by 40% over the burn (a simple vertical-flight model)
        const T = r.pick([1800, 2000, 2400]), m0 = r.pick([50, 60]);
        const acc = Array.from({ length: 9 }, (_, i) => Math.round((T / (m0 * (1 - 0.1 * i * 0.5)) - 9.8) * 10) / 10);
        const h = 0.5, dv = simpsonData(acc, h);
        return {
          prompt: t`An inertial measurement unit on a sounding rocket logs its acceleration every 0.5 s during the 4-second burn, in m/s²: $\;${acc.join(',\\ ')}$. Estimate the velocity gained, $\Delta v = \int_0^4 a\,dt$, with Simpson’s rule, to 3 significant figures.`,
          answer: dv, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: (h / 2) * acc.reduce((s, x, i) => s + (i === 0 || i === 8 ? x : 2 * x), 0), feedback: 'That is the trapezoid estimate — close, but the question asks for Simpson’s weights 1, 4, 2, …, 4, 1 and Δt/3.' }].filter((e) => Math.abs(e.value - dv) > 0.006 * dv),
          hints: [t`Velocity change is the integral of acceleration. There are 8 intervals — even, so Simpson applies.`, t`$\Delta v \approx \tfrac{0.5}{3}\big[a_0 + 4a_1 + 2a_2 + 4a_3 + 2a_4 + 4a_5 + 2a_6 + 4a_7 + a_8\big]$.`],
          teach: 'Integrating sampled acceleration gives velocity change; Simpson’s rule does it accurately for smooth data.',
          explain: t`$\Delta v \approx \tfrac{0.5}{3}\big[${acc.map((x, i) => (i === 0 || i === 8 ? x : `${i % 2 ? 4 : 2}(${x})`)).join(' + ')}\big] = ${fmt(dv, 4)}$ m/s. The acceleration climbs as propellant burns off and the rocket gets lighter.`,
          visual: { type: 'calc-quadrature', params: { data: { y: acc, x0: 0, h }, rules: ['simpson'], readout: false, xlabel: 't (s)', ylabel: 'a (m/s²)' }, caption: 'Illustrative IMU samples and the parabolic arcs through them. Real flight software integrates at hundreds of samples per second.' },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.6', url: 'https://openstax.org/books/calculus-volume-2/pages/3-6-numerical-integration' }],
});
