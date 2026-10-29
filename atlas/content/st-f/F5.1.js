// Newton–Cotes rules and their error — the analyst's view of the rules met
// in Calculus II: degree of exactness, the local error from a Taylor
// expansion about the panel's midpoint, why a local h³ becomes a global h²,
// why Simpson gains two orders (symmetry), measured orders on a log–log
// plot, the leading Euler–Maclaurin term, and where the theory's smoothness
// assumption fails (√x, a thrust cut-off) or is beaten (periodic integrands).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg, sci } from './_num.js';
import { trap, simpson, midpoint } from './_lin.js';
import { solve } from '../prog/_solvers.js';

const t = String.raw;

const LN2 = Math.log(2);
const inv1 = (x) => 1 / (1 + x);
// I₀(1) by its power series Σ (1/4)ᵏ/(k!)²; ∫₀^{2π} e^{cos x} dx = 2π I₀(1)
const I01 = (() => { let s = 0, term = 1; for (let k = 0; k < 30; k++) { s += term; term *= 0.25 / ((k + 1) * (k + 1)); } return s; })();
const PER = 2 * Math.PI * I01;
const ecos = (x) => Math.exp(Math.cos(x));

// the worked example: trapezoid on ∫₀¹ dx/(1 + x) = ln 2
const NS = [2, 4, 8, 16, 32, 64];
const ET = NS.map((n) => trap(inv1, 0, 1, n) - LN2);
const EM = NS.map((n) => midpoint(inv1, 0, 1, n) - LN2);
const ES = NS.map((n) => simpson(inv1, 0, 1, n) - LN2);
const lead = (n) => 1 / (16 * n * n);                       // (h²/12)(f′(1) − f′(0)) = h²/16

// periodic integrand: trapezoid and Simpson errors
const PN = [2, 4, 6, 8, 10, 12];
const PT = PN.map((n) => Math.abs(trap(ecos, 0, 2 * Math.PI, n) - PER));
const PS = PN.map((n) => Math.abs(simpson(ecos, 0, 2 * Math.PI, n) - PER));

// closed Newton–Cotes weights on [0, 1] with N + 1 equally spaced points (solve the moment equations)
const ncWeights = (N) => solve(Array.from({ length: N + 1 }, (_, k) => Array.from({ length: N + 1 }, (_, j) => (j / N) ** k)), Array.from({ length: N + 1 }, (_, k) => 1 / (k + 1)));
const W10 = ncWeights(10), W10ABS = W10.reduce((s, w) => s + Math.abs(w), 0);

// the code exercise: Simpson on ∫₀^π sin x dx = 2
const SIN_ERR = [4, 8, 16, 32].map((n) => Math.abs(simpson(Math.sin, 0, Math.PI, n) - 2));
const SIN_ORD = SIN_ERR.slice(1).map((e, k) => Math.log2(SIN_ERR[k] / e));

// observed-order cases: [rule name, TeX integrand, rule, f, exact, n]
const ORDER_CASES = [
  ['trapezoid', t`\int_0^1 \frac{dx}{1+x}`, trap, inv1, LN2, 8],
  ['midpoint', t`\int_0^1 \frac{dx}{1+x}`, midpoint, inv1, LN2, 4],
  ['Simpson', t`\int_0^1 \frac{dx}{1+x}`, simpson, inv1, LN2, 8],
  ['Simpson', t`\int_0^1 \sqrt{x}\,dx`, simpson, Math.sqrt, 2 / 3, 16],
  ['trapezoid', t`\int_0^1 \sqrt{x}\,dx`, trap, Math.sqrt, 2 / 3, 32],
];

// leading-term cases: [TeX integrand, Atlas fn, f, f′, a, b, exact integral]
const LEAD_CASES = [
  [t`\int_0^1 \frac{dx}{1+x}`, '1/(1 + x)', inv1, (x) => -1 / (1 + x) ** 2, 0, 1, LN2],
  [t`\int_0^2 e^{-x}\,dx`, 'exp(-x)', (x) => Math.exp(-x), (x) => -Math.exp(-x), 0, 2, 1 - Math.exp(-2)],
  [t`\int_0^{\pi/2} \sin x\,dx`, 'sin(x)', Math.sin, Math.cos, 0, Math.PI / 2, 1],
  [t`\int_1^3 \ln x\,dx`, 'ln(x)', Math.log, (x) => 1 / x, 1, 3, 3 * Math.log(3) - 2],
];

// the burn: a(t) = F/(m₀ − ṁt), Δv = vₑ ln(m₀/m₁) exactly
const burnErr = (F, m0, mdot, tb, n) => Math.abs(simpson((tt) => F / (m0 - mdot * tt), 0, tb, n) - (F / mdot) * Math.log(m0 / (m0 - mdot * tb)));

const s3 = (x) => Number(x.toPrecision(3));
// Simpson's parabola αx + βx² through (0, 0), (h, √h), (2h, √(2h)) with h = 1/8
const SQ_H = 0.125, SQ_B = (Math.sqrt(2 * SQ_H) - 2 * Math.sqrt(SQ_H)) / (2 * SQ_H * SQ_H), SQ_A = (Math.sqrt(SQ_H) - SQ_B * SQ_H * SQ_H) / SQ_H;
const W10NEG = W10.filter((w) => w < 0).length;
// a check sentence: does the order-4 prediction meet the tolerance at n?
const verdict = (err, tol, nn) => (err < tol ? t`Check: the actual error at $n = ${nn}$ is $${tex(err, 2)}$, below the target.` : t`Check: the actual error at $n = ${nn}$ is $${tex(err, 2)}$, a few per cent above the target — the starting error was not yet fully in its asymptotic regime, so in practice add a margin or measure again.`);

export default lesson({
  id: 'st-f.F5.1',
  title: 'Newton–Cotes rules and their error',
  minutes: 14, difficulty: 3,
  intro: t`A **Newton–Cotes rule** replaces $f$ on each panel by the polynomial through equally spaced samples and integrates that polynomial exactly: a line through two points gives the trapezoid rule, a parabola through three gives Simpson’s. You met the rules and their error bounds in [Calculus II](#/lesson/math1220.C2-2.10); here you prove where the powers of $h$ come from and learn to **measure** them. The key number is a rule’s **degree of exactness** $d$ — the highest degree of polynomial it integrates exactly. A Taylor expansion then gives a local error of order $h^{d+2}$ per panel and, over $(b - a)/h$ panels, a global error of order $h^{d+1}$:

$$E_T = -\frac{(b-a)\,h^2}{12}\,f''(\xi), \qquad E_S = -\frac{(b-a)\,h^4}{180}\,f^{(4)}(\xi)$$

The trapezoid rule has $d = 1$ and order 2. Simpson’s rule, though built on a parabola, has $d = 3$ — symmetry hands it a free degree — and order 4. The proofs assume $f$ is smooth; when it is not, the measured order tells you.`,
  symbols: [
    { tex: 'h', text: 'the subinterval width, $(b - a)/n$ for $n$ subintervals (Simpson’s parabolas span two of them)' },
    { tex: t`E_T,\ E_S`, text: 'the errors $\\int_a^b f\\,dx - T_n$ and $\\int_a^b f\\,dx - S_n$ of the composite trapezoid and Simpson rules, in the units of the integral' },
    { tex: t`\xi`, text: 'some point in $[a, b]$, supplied by the mean value theorem: the formula says how big, not exactly how big' },
    { tex: t`f'',\ f^{(4)}`, text: 'the second and fourth derivatives: a rule of degree $d$ is blind to everything up to $x^d$, so its error is driven by $f^{(d+1)}$' },
    { tex: 'd', text: 'the **degree of exactness**: 1 for midpoint and trapezoid, 3 for Simpson' },
    { tex: 'p', text: 'the **order**, $\\lvert E\\rvert \\approx Ch^p$ with $p = d + 1$; measured as $p \\approx \\log_2(E_n/E_{2n})$' },
  ],
  why: 'Every integral a simulation cannot do by hand — an impulse, a heat load, an orbit average, a mode’s energy — is a quadrature, and the order you can prove and then measure is how you know the answer is converging and how many samples it needs.',
  visual: {
    type: 'calc-quadrature',
    title: 'Measured orders',
    lead: t`Choose an integrand and a rule, then slide $n$. The lower panel plots $\lvert E\rvert$ against $n$ on logarithmic axes: a straight line of slope $-p$ is order $p$, and the readout gives the ratio $E_n/E_{2n} = 2^p$.`,
    tasks: [
      'For 1/(1 + x): trapezoid and midpoint fall with slope −2 (ratio 4), Simpson with slope −4 (ratio 16).',
      'Switch to √x: all three rules fall with slope about −1.5. Simpson has lost its advantage — √x has no bounded derivatives at 0.',
      'Switch to $e^{\\cos x}$ over one period: the trapezoid rule reaches round-off by n = 14, far faster than any power of h — and Simpson is worse than the trapezoid rule it is built from.',
    ],
    params: {
      functions: [
        { fn: '1/(1 + x)', a: 0, b: 1, label: '1/(1 + x) on [0, 1]', exact: LN2 },
        { fn: 'sqrt(x)', a: 0, b: 1, label: '√x on [0, 1]', exact: 2 / 3 },
        { fn: 'exp(cos(x))', a: 0, b: 2 * Math.PI, label: 'e^(cos x) over one period', exact: PER },
      ],
      rule: 'trap', rules: ['mid', 'trap', 'simpson'], n: 4, nMax: 32, errorPlot: true,
    },
    caption: 'Exact errors in float64 against the true integrals: ln 2, 2/3 and 2π I₀(1). Errors below 10⁻¹⁴ are round-off and are not plotted.',
  },
  example: {
    prompt: t`Prove that the composite trapezoid rule has order 2 by expanding one panel in a Taylor series, find the leading error for $\displaystyle\int_0^1 \frac{dx}{1+x} = \ln 2$, and check it against the measured errors for $n = 4, 8, 16$.`,
    visual: {
      type: 'graph',
      params: { x: [0.15, 1.95], y: [-9, -0.8], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: '|error|',
        curves: [{ fn: `${n12(lg(1 / 16))} - 2*x`, color: 'ink3', dash: true, width: 1.4, domain: [0.25, 1.85], label: 'h²/16', labelAt: 0.5, labelDx: 8, labelDy: -8 }],
        points: [
          ...NS.map((n, i) => ({ x: n12(lg(n)), y: n12(lg(Math.abs(ET[i]))), r: 4, color: 'warn' })),
          ...NS.map((n, i) => ({ x: n12(lg(n)), y: n12(lg(Math.abs(EM[i]))), r: 4, color: 'teal' })),
          ...NS.map((n, i) => ({ x: n12(lg(n)), y: n12(lg(Math.abs(ES[i]))), r: 4, color: 'violet' })),
        ],
        legend: [{ label: 'trapezoid', color: 'warn', point: true }, { label: 'midpoint', color: 'teal', point: true }, { label: 'Simpson', color: 'violet', point: true }], legendAt: 'bl' },
      caption: 'Measured errors for ∫₀¹ dx/(1 + x), n = 2 … 64, on log–log axes, with the predicted trapezoid error h²/16 (dashed). Slopes −2, −2 and −4.',
    },
    steps: [
      { label: 'One panel', text: t`Put the panel’s midpoint at $c$, so it runs from $c - \tfrac h2$ to $c + \tfrac h2$, and write $f(c + s) = f + sf' + \tfrac{s^2}{2}f'' + \tfrac{s^3}{6}f''' + \ldots$, all derivatives at $c$. Integrating over $s \in [-\tfrac h2, \tfrac h2]$ kills the **odd** powers: $\int = hf + \tfrac{h^3}{24}f'' + O(h^5)$.` },
      { label: 'The rule', text: t`The trapezoid rule averages the ends: $\tfrac h2\left[f(c - \tfrac h2) + f(c + \tfrac h2)\right] = hf + \tfrac{h^3}{8}f'' + O(h^5)$ — the odd terms cancel again. Subtract: the local error is $\tfrac{h^3}{24}f'' - \tfrac{h^3}{8}f'' = -\tfrac{h^3}{12}f''(c)$. (The midpoint rule’s, $hf(c)$, is $+\tfrac{h^3}{24}f''$: half as big, opposite sign.)` },
      { label: 'Add up the panels', text: t`There are $n = (b - a)/h$ panels, so the local $h^3$ errors add to $-\tfrac{h^2}{12}\sum_i h\,f''(c_i) \approx -\tfrac{h^2}{12}\int_a^b f''\,dx = -\tfrac{h^2}{12}\left[f'(b) - f'(a)\right]$. **One power of $h$ is lost to the number of panels**: local order 3, global order 2.` },
      { label: 'Why Simpson gains two', text: t`$S_n = \tfrac13(2M_{n/2} + T_{n/2})$ on the same parabola-pairs, and the midpoint and trapezoid $h^3$ terms, $+\tfrac{1}{24}$ and $-\tfrac{1}{12}$, cancel exactly in that mix. Every odd term already vanished by symmetry, so the next survivor is $h^5f^{(4)}$ locally: $d = 3$, order 4.` },
      { label: 'Predict', text: t`For $f = 1/(1 + x)$, $f'(x) = -1/(1 + x)^2$, so $f'(1) - f'(0) = -\tfrac14 + 1 = \tfrac34$ and $T_n - \ln 2 \approx \tfrac{h^2}{12}\cdot\tfrac34 = \tfrac{h^2}{16}$. At $n = 8$ that is $${tex(lead(8), 4)}$.` },
      { label: 'Measure', text: t`The computed errors $T_n - \ln 2$ for $n = 4, 8, 16$ are $${tex(ET[1], 4)}$, $${tex(ET[2], 4)}$ and $${tex(ET[3], 4)}$. Successive ratios $${(ET[1] / ET[2]).toFixed(3)}$ and $${(ET[2] / ET[3]).toFixed(3)}$ approach $2^2 = 4$: observed orders $${Math.log2(ET[1] / ET[2]).toFixed(3)}$ and $${Math.log2(ET[2] / ET[3]).toFixed(3)}$. The prediction $h^2/16$ is within $${(100 * Math.abs(ET[2] - lead(8)) / ET[2]).toFixed(1)}\%$ at $n = 8$; the rest is the $h^4$ term.` },
    ],
    answer: t`Local error $-\tfrac{h^3}{12}f''$, global $-\tfrac{h^2}{12}[f'(b) - f'(a)]$: order 2. For $\ln 2$, $T_n - \ln 2 \approx h^2/16$, and the measured order is $${Math.log2(ET[2] / ET[3]).toFixed(3)}$.`,
  },
  practice: [
    mcq({
      id: 'simpson-cubic', difficulty: 2,
      prompt: t`Simpson’s rule integrates the parabola through three equally spaced points. Yet on one panel $[-1, 1]$ it integrates $x^3$ **exactly**. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-1.3, 1.3], y: [-1.25, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
          curves: [{ fn: 'x^3', color: 'accent', width: 2.2, label: 'x³', labelAt: 1.05, labelDx: 8, labelDy: 0 }, { fn: 'x', color: 'gold', width: 1.8, dash: true, label: 'parabola through the 3 samples', labelAt: -0.9, labelDx: 10, labelDy: 10 }],
          shade: [{ fn: 'x^3', lower: 'x', from: -1, to: 1, color: 'bad', alpha: 0.3 }],
          points: [-1, 0, 1].map((x) => ({ x, y: x ** 3, r: 4.5, color: 'gold' })) },
        caption: 'x³ and the interpolating “parabola” through (−1, −1), (0, 0), (1, 1) — which here is the line y = x. The shaded difference x³ − x is odd: its two lobes have equal and opposite areas.',
      },
      choices: [
        'The error x³ − p(x) is an odd function about the panel’s midpoint, so it integrates to zero',
        'Three points determine a cubic, so the parabola is the cubic',
        'Simpson’s weights 1, 4, 1 were chosen to fit cubics rather than parabolas',
        'It is a coincidence of the interval [−1, 1]; on [0, 2] it fails',
      ],
      answer: 0,
      why: {
        1: 'Three points determine a parabola; a cubic needs four. The interpolant here is not x³ at all.',
        2: 'The weights 1, 4, 1 are exactly those that integrate the parabola. Exactness for cubics is a bonus, not a design choice.',
        3: 'Shift the panel: x³ on [0, 2] is (x − 1)³ plus lower powers, and (x − 1)³ is odd about the midpoint 1. Simpson is exact on every panel.',
      },
      hints: ['What is the difference between x³ and the parabola through x = −1, 0, 1?', 'Any cubic’s error after quadratic interpolation is c(x − x₀)(x − x₁)(x − x₂), which is odd about the middle node.'],
      teach: 'A symmetric rule with an odd number of nodes integrates the next odd power for free, so Simpson’s degree of exactness is 3, not 2 — and its order is 4.',
      explain: t`Interpolating a cubic at three nodes leaves an error $c(x + 1)x(x - 1)$, an odd function about the midpoint, whose integral over the symmetric panel is 0. So Simpson is exact for degree $\le 3$, and its error starts with $f^{(4)}$. The same symmetry gives the midpoint rule (one node) degree 1, not 0.`,
    }),
    num({
      id: 'observed-order', difficulty: 2,
      gen(r) {
        const [name, Itex, rule, f, exact, n] = r.pick(ORDER_CASES);
        const e1 = s3(Math.abs(rule(f, 0, 1, n) - exact)), e2 = s3(Math.abs(rule(f, 0, 1, 2 * n) - exact));
        const ans = Math.log2(e1 / e2);
        return {
          prompt: t`The composite ${name} rule applied to $${Itex}$ has error $${tex(e1, 3)}$ with $n = ${n}$ and $${tex(e2, 3)}$ with $n = ${2 * n}$. What is the observed order $p$?`,
          visual: {
            type: 'graph',
            params: { x: [lg(n) - 0.3, lg(n) + 0.6], y: [Math.floor(lg(e2)) - 0.5, Math.ceil(lg(e1)) + 0.3], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: '|error|',
              points: [{ x: n12(lg(n)), y: n12(lg(e1)), r: 5, color: 'accent', label: `n = ${n}`, labelDx: 8, labelDy: -8 }, { x: n12(lg(2 * n)), y: n12(lg(e2)), r: 5, color: 'accent', label: `n = ${2 * n}`, labelDx: 8, labelDy: -8 }],
              curves: [{ param: [`${n12(lg(n))} + ${n12(lg(2))}*t`, `${n12(lg(e1))} + ${n12(lg(e2 / e1))}*t`], t: [0, 1], color: 'accent', width: 1.6 }] },
            caption: 'The two errors on log–log axes. The slope of the segment joining them is −p.',
          },
          answer: ans, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: e1 / e2, feedback: t`That is the ratio $E_n/E_{2n}$, which equals $2^p$. Take $\log_2$ of it.` }],
          hints: [t`Halving $h$ multiplies $Ch^p$ by $2^{-p}$, so $E_n/E_{2n} = 2^p$.`, t`$p = \log_2(${tex(e1, 3)}/${tex(e2, 3)}) = \ln(\text{ratio})/\ln 2$.`],
          teach: 'Doubling n divides an order-p error by 2ᵖ, so the order is the base-2 logarithm of the error ratio — the slope of the log–log plot.',
          explain: t`The ratio is $${(e1 / e2).toFixed(2)}$ and $p = \log_2 ${(e1 / e2).toFixed(2)} = ${ans.toFixed(2)}$. ${ans > 3 ? 'Order 4: Simpson on a smooth integrand.' : ans > 1.8 ? 'Order 2, as the theory promises for a smooth integrand.' : t`Order $1.5$: $\sqrt x$ has an unbounded $f''$ at 0, and the first panel’s error, $\propto h^{3/2}$, dominates everything else.`}`,
        };
      },
    }),
    num({
      id: 'n-for-tolerance', difficulty: 3,
      gen(r) {
        const n0 = r.pick([4, 8]), [tol, tolTeX] = r.pick([[1e-9, '10^{-9}'], [1e-10, '10^{-10}'], [1e-11, '10^{-11}']]);
        const e0 = s3(Math.abs(simpson(inv1, 0, 1, n0) - LN2));
        let ans = Math.ceil(n0 * (e0 / tol) ** 0.25); if (ans % 2) ans++;
        let wrong = Math.ceil(n0 * (e0 / tol) ** 0.5); if (wrong % 2) wrong++;
        return {
          prompt: t`Simpson’s rule with $n = ${n0}$ computes $\int_0^1 \frac{dx}{1+x}$ with error $${tex(e0, 3)}$. Assuming the error falls like $n^{-4}$, what is the smallest **even** $n$ that brings it below $${tolTeX}$?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 2.8], y: [-12, -2], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: '|error|',
              curves: [{ fn: `${n12(lg(e0))} - 4*(x - ${n12(lg(n0))})`, color: 'violet', width: 2, dash: true, domain: [0.5, 2.7] }],
              hlines: [{ y: n12(lg(tol)), label: 'tolerance', color: 'gold' }],
              points: [{ x: n12(lg(n0)), y: n12(lg(e0)), r: 5, color: 'violet', label: `n = ${n0}`, labelDx: 8, labelDy: -8 }] },
            caption: 'The measured error at one n and the line of slope −4 through it (log–log axes). Where it crosses the tolerance is the answer — if the error really is in its asymptotic regime.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: wrong, feedback: 'That assumes order 2. Simpson’s error falls like n⁻⁴, so the required n grows only like the fourth root of the error ratio.' }],
          hints: [t`$E(n) = E(${n0})\,(${n0}/n)^4$. Solve $E(n) = ${tolTeX}$ for $n$.`, t`$n = ${n0}\,\left(${tex(e0, 3)}/${tolTeX}\right)^{1/4}$, then round up to an even number.`],
          teach: 'With a known order p, one measured error predicts the n for any tolerance: n grows like (E/tol)^(1/p), so high order pays off fastest at tight tolerances.',
          explain: t`$n = ${n0}\times(${tex(e0 / tol, 3)})^{1/4} = ${(n0 * (e0 / tol) ** 0.25).toFixed(2)}$, rounded up to the even $${ans}$. An order-2 rule would need $n \approx ${wrong}$ from the same start. ${verdict(Math.abs(simpson(inv1, 0, 1, ans) - LN2), tol, ans)}`,
        };
      },
    }),
    num({
      id: 'leading-term', difficulty: 3,
      gen(r) {
        const [Itex, fx, f, df, a, b, exact] = r.pick(LEAD_CASES), n = r.pick([8, 10, 16, 20]);
        const h = (b - a) / n, ans = ((h * h) / 12) * (df(b) - df(a));
        const actual = trap(f, a, b, n) - exact;
        const ys = [];
        for (let i = 0; i <= 4; i++) ys.push([a + ((b - a) * i) / 4, f(a + ((b - a) * i) / 4)]);
        return {
          prompt: t`Use the leading term $T_n - \int_a^b f\,dx \approx \dfrac{h^2}{12}\left[f'(b) - f'(a)\right]$ to predict the error of the trapezoid rule with $n = ${n}$ for $${Itex}$. Give $T_n$ minus the integral, with its sign.`,
          visual: {
            type: 'graph',
            params: { x: [a - 0.08 * (b - a), b + 0.08 * (b - a)], y: [Math.min(0, ...ys.map((p) => p[1])) - 0.1, Math.max(...ys.map((p) => p[1])) * 1.2 + 0.05], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
              curves: [{ fn: fx, color: 'accent', width: 2.2, domain: [a, b] },
                ...ys.slice(1).map((p, i) => ({ param: [`${n12(ys[i][0])} + ${n12(p[0] - ys[i][0])}*t`, `${n12(ys[i][1])} + ${n12(p[1] - ys[i][1])}*t`], t: [0, 1], color: 'warn', width: 1.6 })),
                ...[a, b].map((x0) => ({ param: [`${n12(x0)} + ${n12(0.12 * (b - a))}*t`, `${n12(f(x0))} + ${n12(0.12 * (b - a) * df(x0))}*t`], t: [-1, 1], color: 'gold', width: 2.4 }))] },
            caption: 'The integrand with four trapezoids (orange; the question uses more) and its tangent slopes at the two ends (gold), which set the leading error.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: h * h * (df(b) - df(a)), feedback: 'You left out the 1/12.' }, { value: ((h * h) / 24) * (df(b) - df(a)), feedback: t`You used $\tfrac{1}{24}$, the **midpoint** rule’s constant; the trapezoid rule’s is $\tfrac{1}{12}$.` }],
          hints: [t`$h = (b - a)/n$, and you need $f'$ at the two ends only.`, t`$h = ${tex(h, 4)}$; $f'(b) - f'(a) = ${tex(df(b) - df(a), 4)}$.`],
          teach: 'Summed over the panels, the local errors −h³f″/12 telescope to (h²/12)[f′(b) − f′(a)] for T − I: the trapezoid error depends only on the slopes at the ends.',
          explain: t`$\dfrac{h^2}{12}\left[f'(b) - f'(a)\right] = \dfrac{(${tex(h, 4)})^2}{12}\times(${tex(df(b) - df(a), 4)}) = ${tex(ans, 3)}$. The true error is $${tex(actual, 3)}$: the leading term captures it to $${(100 * Math.abs(actual - ans) / Math.abs(actual)).toFixed(2)}\%$. ${ans < 0 ? 'Negative: the trapezoids sit under a concave curve.' : 'Positive: the chords sit above a convex curve.'}`,
        };
      },
    }),
    mcq({
      id: 'sqrt-order', difficulty: 2,
      prompt: t`For $\int_0^1 \sqrt x\,dx$, Simpson’s rule converges with order about $1.5$, no better than the trapezoid rule. Which explanation is right?`,
      visual: {
        type: 'graph',
        params: { x: [-0.03, 1.05], y: [-0.05, 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
          curves: [{ fn: 'sqrt(x)', color: 'accent', width: 2.2, domain: [0, 1], samples: 2000 },
            { fn: `${n12(SQ_A)}*x + ${n12(SQ_B)}*x^2`, color: 'gold', width: 1.8, dash: true, domain: [0, 0.25] }],
          vlines: [{ x: 0.25, color: 'ink4' }],
          points: [0, 0.125, 0.25].map((x) => ({ x, y: n12(Math.sqrt(x)), r: 4, color: 'gold' })) },
        caption: 'Simpson’s parabola (dashed) on the first pair of subintervals, n = 8. √x rises vertically at 0; no parabola can follow it, and that one pair dominates the error.',
      },
      choices: [
        t`$\sqrt x$ has unbounded derivatives at $x = 0$, so the error formula’s $f^{(4)}(\xi)$ does not exist; the first panel’s error, of size $h^{3/2}$, dominates`,
        'Round-off error from the square root grows as n increases',
        'Simpson’s rule needs an odd number of subintervals for this integrand',
        t`The integrand is not periodic, so Simpson’s rule cannot exceed order 2 on it`,
      ],
      answer: 0,
      why: {
        1: 'The errors here are near 10⁻⁴, a trillion times above round-off. The slowness is mathematical.',
        2: 'Simpson always needs an even number of subintervals; the choice of n does not change the order.',
        3: 'Simpson reaches order 4 on any integrand with a continuous fourth derivative, periodic or not.',
      },
      hints: [t`What is $f''(x)$ for $\sqrt x$, and what happens to it as $x \to 0$?`, t`On the first panel $[0, h]$, $\int_0^h \sqrt x\,dx = \tfrac23 h^{3/2}$, and any rule’s error there is a fixed fraction of that.`],
      teach: 'An error formula is a promise conditional on smoothness; at a singularity the panel touching it sets the order, and the measured order is how you find out.',
      explain: t`Every derivative of $\sqrt x$ blows up at 0, so the theorem does not apply. On $[0, h]$ the integral is $\tfrac23h^{3/2}$ and the rule misses a fixed fraction of it — an $h^{1.5}$ error that outweighs all the other panels’ $h^4$. Cures: substitute $x = s^2$ (the integrand becomes $2s^2$, smooth), or use a rule that does not sample the endpoint, such as Gauss–Legendre ([next lesson](#/lesson/st-f.F5.2)) or an adaptive one.`,
    }),
    mcq({
      id: 'periodic', difficulty: 3,
      prompt: t`For $\int_0^{2\pi} e^{\cos x}\,dx$, the trapezoid rule’s error with $n = 4, 8, 12$ is $${tex(PT[1], 2)}$, $${tex(PT[3], 2)}$, $${tex(PT[5], 2)}$ — faster than any power of $n$ — while Simpson’s with the same $n$ is far larger. Why?`,
      visual: {
        type: 'graph',
        params: { x: [1, 13], y: [-13, 1], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n (linear scale)', ylabel: '|error|',
          points: [...PN.map((n, i) => ({ x: n, y: n12(lg(PT[i])), r: 4.5, color: 'warn' })), ...PN.map((n, i) => ({ x: n, y: n12(lg(PS[i])), r: 4.5, color: 'violet' }))],
          legend: [{ label: 'trapezoid', color: 'warn', point: true }, { label: 'Simpson', color: 'violet', point: true }], legendAt: 'bl' },
        caption: 'Errors against n on a linear n-axis and a logarithmic error axis: the trapezoid errors fall on a straight line — geometric convergence, a fixed factor per added point.',
      },
      choices: [
        t`For a smooth periodic integrand over a full period, every endpoint term $f^{(k)}(b) - f^{(k)}(a)$ in the error expansion vanishes; Simpson, $\tfrac13(4T_n - T_{n/2})$, inherits the much larger error of $T_{n/2}$`,
        '$e^{\\cos x}$ is a polynomial in disguise, which the trapezoid rule integrates exactly',
        'The trapezoid rule has degree of exactness 3 on symmetric intervals',
        'The integrand is even, so half of the samples cancel',
      ],
      answer: 0,
      why: {
        1: '$e^{\\cos x}$ is no polynomial; its error is small but nonzero at every n shown.',
        2: 'The trapezoid rule is exact only for degree 1 on any interval; x² already defeats it.',
        3: 'Evenness alone does not help: x² is even, yet the trapezoid rule on [−1, 1] integrates it with an error of order h².',
      },
      hints: [t`The previous example found $T - I \approx \tfrac{h^2}{12}[f'(b) - f'(a)]$; the full Euler–Maclaurin series continues with $h^4[f'''(b) - f'''(a)]$, $h^6[\ldots]$.`, 'On a full period f and all its derivatives take the same values at both ends.'],
      teach: 'The trapezoid rule is spectrally accurate for smooth periodic integrands over a whole period — the best rule there, and the reason orbit averages and Fourier coefficients use equally spaced samples.',
      explain: t`The Euler–Maclaurin expansion of $T_n - I$ is a series in $h^2, h^4, \ldots$ whose coefficients are differences $f^{(2k-1)}(b) - f^{(2k-1)}(a)$. On a full period they are all zero, so no power of $h$ survives; for an integrand analytic in a strip the error falls like $e^{-cn}$. Simpson’s “improvement” mixes in $T_{n/2}$: at $n = 8$ its error, $${tex(PS[3], 2)}$, is a third of $T_4$’s.`,
    }),
    mcq({
      id: 'high-order-nc', difficulty: 3,
      prompt: t`Why do codes not simply use one high-degree Newton–Cotes rule — say the 11-point closed rule (degree of exactness 11) — on the whole interval?`,
      visual: {
        type: 'graph',
        params: { x: [-0.05, 1.05], y: [-0.5, 0.8], aspect: 'wide', axesAt: 'edge', xlabel: 'node position', ylabel: 'weight',
          curves: W10.map((w, j) => ({ param: [n12(j / 10), `${n12(w)}*t`], t: [0, 1], color: w < 0 ? 'bad' : 'accent', width: 3 })),
          points: W10.map((w, j) => ({ x: n12(j / 10), y: n12(w), r: 4, color: w < 0 ? 'bad' : 'accent' })),
          hlines: [{ y: 0, color: 'ink4' }] },
        caption: `The 11 weights of the closed Newton–Cotes rule on [0, 1], computed from the moment equations: ${W10NEG} are negative (red). They sum to 1, but their absolute values sum to ${W10ABS.toFixed(2)}.`,
      },
      choices: [
        t`Its weights turn negative and large (here $\sum\lvert w_i\rvert = ${W10ABS.toFixed(2)}$), amplifying data and round-off errors, and its interpolant suffers Runge’s phenomenon; composite low-order rules converge reliably`,
        'High-degree rules need more function evaluations than composite ones',
        'Polynomials of degree 10 cannot be integrated exactly in floating point',
        'Newton–Cotes rules exist only up to degree 4',
      ],
      answer: 0,
      why: {
        1: 'The 11-point rule uses 11 samples; a composite Simpson rule with 10 subintervals uses the same 11.',
        2: 'Exactness is a property of the weights; in float64 the error is only round-off-sized.',
        3: 'They exist for every number of points; Boole’s (5 points) and Weddle’s (7) are classics. The trouble starts at 9 points, where negative weights appear.',
      },
      hints: ['Look at the weights: what happens to the sum Σ wᵢ fᵢ when each fᵢ carries an error δ?', 'Equally spaced high-degree interpolation is the Runge phenomenon of F4.1 — and a Newton–Cotes rule integrates exactly that interpolant.'],
      teach: 'High-degree equally spaced rules integrate a wildly oscillating interpolant with negative weights; accuracy comes instead from many low-degree panels or from better-placed nodes (Gauss).',
      explain: t`An error $\delta$ in each sample can change the sum by up to $\sum\lvert w_i\rvert\,\delta = ${W10ABS.toFixed(2)}\,\delta$ per unit length, and the factor grows exponentially with the number of points. Worse, the rule integrates the equally spaced interpolant, which diverges for functions like $1/(1 + 25x^2)$ ([F4.1](#/lesson/st-f.F4.1)). Composite rules keep positive weights, and Gauss–Legendre rules put the nodes where the weights stay positive at any degree.`,
    }),
    code({
      id: 'simpson-order', difficulty: 2,
      prompt: t`Write \`simpson(f, a, b, n)\`, the composite Simpson rule with an even number \`n\` of subintervals. Then compute the errors of $\int_0^\pi \sin x\,dx = 2$ for $n = 4, 8, 16, 32$ in a list \`errs\`, and the observed orders $\log_2(E_n/E_{2n})$ in a list \`orders\`.`,
      starter: t`import math

def simpson(f, a, b, n):
    h = (b - a) / n
    s = f(a) + f(b)
    # add 4 f(x_k) for odd k and 2 f(x_k) for even k, k = 1 … n-1
    return 0.0

errs = [abs(simpson(math.sin, 0, math.pi, n) - 2) for n in [4, 8, 16, 32]]
orders = []
print(errs)
print(orders)
`,
      answer: t`import math

def simpson(f, a, b, n):
    h = (b - a) / n
    s = f(a) + f(b)
    for k in range(1, n):
        s += (4 if k % 2 else 2) * f(a + k * h)
    return h / 3 * s

errs = [abs(simpson(math.sin, 0, math.pi, n) - 2) for n in [4, 8, 16, 32]]
orders = [math.log2(errs[k] / errs[k + 1]) for k in range(len(errs) - 1)]
print(errs)
print(orders)`,
      tests: [
        { name: 'exact for a cubic: Simpson on $x^3$ over $[0, 2]$ with $n = 2$ gives 4', code: 'abs(simpson(lambda x: x**3, 0, 2, 2) - 4) < 1e-12' },
        { name: t`$n = 4$ on $\sin x$ gives $2.00456$`, code: `abs(simpson(math.sin, 0, math.pi, 4) - ${simpson(Math.sin, 0, Math.PI, 4)}) < 1e-12` },
        { name: '`orders` has three entries, each within 0.1 of 4', code: 'len(orders) == 3 and all(abs(p - 4) < 0.1 for p in orders)' },
      ],
      hints: ['Loop k over range(1, n); odd k gets weight 4, even k weight 2.', 'orders: [math.log2(errs[k] / errs[k + 1]) for k in range(3)].'],
      teach: 'The order of a rule is measured, not assumed: halve h repeatedly and take log₂ of successive error ratios.',
      explain: t`The errors are $${SIN_ERR.map((e) => tex(e, 2)).join(',\\ ')}$, and the orders $${SIN_ORD.map((p) => p.toFixed(3)).join(',\\ ')}$ — the fourth order of a degree-3 rule. Keep $n$ moderate: by $n \approx 1000$ the error reaches round-off and the ratios turn to noise.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-burn-n', difficulty: 3, transfer: true,
      gen(r) {
        const F = r.pick([60, 80, 100]) * 1e3, m0 = 5000, mdot = r.pick([20, 25]), tb = 120, n0 = 8, [tol, tolTeX] = r.pick([[1e-6, t`10^{-6}`], [1e-7, t`10^{-7}`]]);
        const e0 = s3(burnErr(F, m0, mdot, tb, n0));
        let ans = Math.ceil(n0 * (e0 / tol) ** 0.25); if (ans % 2) ans++;
        let wrong = Math.ceil(n0 * (e0 / tol) ** 0.5); if (wrong % 2) wrong++;
        return {
          prompt: t`A guidance post-processor finds a stage’s $\Delta v$ by integrating its acceleration $a(t) = F/(m_0 - \dot m t)$ (thrust $F = ${F / 1e3}$ kN, $m_0 = 5000$ kg, $\dot m = ${mdot}$ kg/s) over a $120$ s burn with Simpson’s rule. With $n = 8$ the error is $${tex(e0, 3)}$ m/s. What is the smallest even $n$ for an error below $${tolTeX}$ m/s, assuming order 4?`,
          visual: {
            type: 'graph',
            params: { x: [0, 125], y: [0, (F / (m0 - mdot * tb)) * 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'a (m/s²)',
              curves: [{ fn: `${F}/(${m0} - ${mdot}*x)`, color: 'accent', width: 2.2, domain: [0, tb] }],
              shade: [{ fn: `${F}/(${m0} - ${mdot}*x)`, from: 0, to: tb, color: 'accent', alpha: 0.15 }] },
            caption: 'The acceleration of a stage burning at constant thrust and mass flow (no gravity or drag): its area is Δv = vₑ ln(m₀/m₁) exactly, which supplies the error.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: wrong, feedback: 'That scaling is order 2. Simpson’s error falls like n⁻⁴.' }],
          hints: [t`$E(n) = E(8)\,(8/n)^4$.`, t`$n = 8\,(${tex(e0, 3)}/${tolTeX})^{1/4}$, rounded up to an even integer.`],
          teach: 'One measured error and a known order predict the work for any tolerance.',
          explain: t`$n = 8\times(${tex(e0 / tol, 3)})^{1/4} = ${(8 * (e0 / tol) ** 0.25).toFixed(2)} \to ${ans}$. ${verdict(burnErr(F, m0, mdot, tb, ans), tol, ans)} The acceleration is smooth (all derivatives bounded on the burn), so order 4 holds.`,
        };
      },
    }),
    mcq({
      id: 'cp-cutoff', difficulty: 3, transfer: true,
      prompt: t`A test engineer integrates a motor’s logged thrust to get total impulse with Simpson’s rule on a uniform time grid over $[0, 4]$ s. The motor burns out abruptly at $t = 2.3$ s, where the thrust drops to zero within a millisecond. Refining the grid, the error falls only like $1/n$. Why, and what is the fix?`,
      visual: {
        type: 'graph',
        params: { x: [-0.1, 4.1], y: [-80, 1150], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'thrust (N)',
          curves: [{ fn: '(900 + 150*sin(1.3x))*step(2.3 - x)', color: 'accent', width: 2.2, samples: 3000 }],
          vlines: [0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((x) => ({ x, color: 'ink4' })),
          points: [{ x: 2.3, y: 0, r: 0, label: 'burn-out, 2.3 s', labelDx: 6, labelDy: -14 }] },
        caption: 'A schematic thrust curve with a sharp cut-off between grid lines (every 0.5 s shown). Real tail-off lasts milliseconds; at this scale it is a jump.',
      },
      choices: [
        'The integrand jumps inside a panel, so no derivative bound holds there and that panel’s error is of size h; split the integral at the burn-out time so the jump falls on a node',
        'Simpson’s rule always converges like 1/n on measured data',
        'The thrust is not a polynomial, so Simpson’s rule cannot reach order 4',
        'The time grid is too coarse; once n is large enough the order returns to 4 by itself',
      ],
      answer: 0,
      why: {
        1: 'On smooth data Simpson reaches order 4; it is the jump that costs the order.',
        2: 'Order 4 needs a bounded fourth derivative, not a polynomial — and 900 + 150 sin(1.3t) has one.',
        3: 'The panel containing the jump has an error of order h for every n; refining moves the jump into ever smaller panels but never removes it.',
      },
      hints: ['Which assumption of the error formula fails on the panel that contains t = 2.3 s?', 'On that one panel the rule effectively guesses where the jump is, wrong by up to h; height × h is the error.'],
      teach: 'A discontinuity inside a panel drops any rule to order 1; put a breakpoint at the discontinuity and each smooth piece regains the full order.',
      explain: t`On the panel containing the jump the rule cannot know where inside it the thrust stops: an error of about $F\,h$. Every other panel is smooth and contributes $O(h^4)$, so the total is $O(h)$. Integrate $[0, 2.3]$ and $[2.3, 4]$ separately (or use an adaptive rule, [F5.3](#/lesson/st-f.F5.3), which refines around the jump) and order 4 returns.`,
    }),
  ],
  sources: [
    { label: 'Süli & Mayers (2003), An Introduction to Numerical Analysis, Cambridge, ch. 7 (Newton–Cotes formulae, composite rules, error)', url: 'https://doi.org/10.1017/CBO9780511801181' },
    { label: 'Trefethen & Weideman (2014), The exponentially convergent trapezoidal rule, SIAM Review 56, 385', url: 'https://doi.org/10.1137/130932132' },
    { label: 'Sauer (2018), Numerical Analysis, 3rd ed., Pearson, §5.2 (Newton–Cotes formulas)', url: 'https://openlibrary.org/isbn/9780134696454' },
  ],
});
