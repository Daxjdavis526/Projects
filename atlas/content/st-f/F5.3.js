// Adaptive quadrature — spend evaluations where the integrand is hard. The
// error estimate from one panel and its two halves, (S₂ − S₁)/15, which
// rests on Simpson's h⁴ scaling; the recursive accept-or-split rule with the
// tolerance halved for each half; the Richardson-corrected value; where the
// estimate is too optimistic (√x) or blind (a spike between samples); when
// adaptivity pays (singularities) and when it barely does (smooth peaks);
// QUADPACK's Gauss–Kronrod version behind scipy.integrate.quad.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { simpson, adaptiveSimpson } from './_lin.js';

const t = String.raw;

// one Simpson panel
const S = (f, a, b) => ((b - a) / 6) * (f(a) + 4 * f((a + b) / 2) + f(b));
const S12 = (f, a, b) => { const m = (a + b) / 2; return [S(f, a, b), S(f, a, m) + S(f, m, b)]; };

/** Evaluations uniform Simpson needs to reach |error| ≤ err (doubling, then bisection over even n). */
function uniformEvals(f, a, b, exact, err) {
  let hi = 2;
  while (Math.abs(simpson(f, a, b, hi) - exact) > err) hi *= 2;
  let lo = hi / 2;
  while (hi - lo > 2) { const m = Math.round((lo + hi) / 4) * 2; if (Math.abs(simpson(f, a, b, m) - exact) > err) lo = m; else hi = m; }
  return hi + 1;
}

// ── the Explore: √x on [0, 1] and two sharp peaks on [0, 2], three tolerances ──
const D1 = 0.001, D2 = 0.004;
const peaks = (x) => 1 / ((x - 0.3) ** 2 + D1) + 1 / ((x - 0.9) ** 2 + D2);
const PEAKS_EXACT = (() => { const G = (x) => Math.atan((x - 0.3) / Math.sqrt(D1)) / Math.sqrt(D1) + Math.atan((x - 0.9) / Math.sqrt(D2)) / Math.sqrt(D2); return G(2) - G(0); })();
const FNS = [
  { key: 1, label: '√x on [0, 2]', fn: 'sqrt(x)', f: Math.sqrt, a: 0, b: 2, exact: (4 * Math.SQRT2) / 3 },
  { key: 2, label: 'two sharp peaks on [0, 2]', fn: `1/((x - 0.3)^2 + ${D1}) + 1/((x - 0.9)^2 + ${D2})`, f: peaks, a: 0, b: 2, exact: PEAKS_EXACT },
];
const TOLS = [[1, 1e-2, '10⁻²'], [2, 1e-4, '10⁻⁴'], [3, 1e-6, '10⁻⁶']];
const RUNS = FNS.map((F) => TOLS.map(([, tol]) => {
  const r = adaptiveSimpson(F.f, F.a, F.b, tol), err = Math.abs(r.value - F.exact);
  return { ...r, err, uni: uniformEvals(F.f, F.a, F.b, F.exact, err) };
}));
const when = (fk, tk) => `step(0.5 - abs(fn - ${fk}))*step(0.5 - abs(tl - ${tk}))`;
const sel = (fn) => FNS.flatMap((F, i) => TOLS.map(([tk], j) => `${when(F.key, tk)}*(${fn(RUNS[i][j])})`)).join(' + ');

// ── the worked example: √x with τ = 10⁻³ ──
const [SQ1, SQ2] = S12(Math.sqrt, 0, 1);
const [SL1, SL2] = S12(Math.sqrt, 0, 0.5), [SR1, SR2] = S12(Math.sqrt, 0.5, 1);
const SQ_RUN3 = adaptiveSimpson(Math.sqrt, 0, 1, 1e-3), SQ_RUN5 = adaptiveSimpson(Math.sqrt, 0, 1, 1e-5);
// the code exercise: √x on [0, 1] with tol = 10⁻⁶
const SQ_RUN6 = adaptiveSimpson(Math.sqrt, 0, 1, 1e-6), SQ_ERR6 = Math.abs(SQ_RUN6.value - 2 / 3), SQ_UNI6 = uniformEvals(Math.sqrt, 0, 1, 2 / 3, SQ_ERR6);
const LN_A = S12((x) => 1 / (1 + x), 0, 1);

// ── the spike that fools it ──
const SPIKE = (x) => Math.exp(-(((x - 0.37) / 0.01) ** 2));
const SPIKE_RUN = adaptiveSimpson(SPIKE, 0, 1, 1e-8);

// ── estimate cases: [TeX integrand, Atlas fn, f, a, b, exact] ──
const EST_CASES = [
  [t`\int_0^{1/2} \frac{dx}{1+x}`, '1/(1 + x)', (x) => 1 / (1 + x), 0, 0.5, Math.log(1.5)],
  [t`\int_0^{1} e^{-x}\,dx`, 'exp(-x)', (x) => Math.exp(-x), 0, 1, 1 - Math.exp(-1)],
  [t`\int_0^{1} \cos x\,dx`, 'cos(x)', Math.cos, 0, 1, Math.sin(1)],
  [t`\int_1^{2} \ln x\,dx`, 'ln(x)', Math.log, 1, 2, 2 * Math.log(2) - 1],
];
const r7 = (x) => Number(x.toFixed(7));

// the transfer: Δv = ∫ F/(m₀ − ṁt) dt over one panel
const burn = (F, m0, md) => (tt) => F / (m0 - md * tt);

export default lesson({
  id: 'st-f.F5.3',
  title: 'Adaptive quadrature',
  minutes: 13, difficulty: 3,
  intro: t`A uniform grid spends as many samples where $f$ is boring as where it is hard. An **adaptive** rule refines only where it must, and it decides where by estimating its own error. Compute Simpson’s rule on a panel, $S_1$, and again on its two halves, $S_2$. If the error behaves like $Ch^4$, halving $h$ divides it by 16, so $I - S_1 \approx 16(I - S_2)$, and subtracting gives an estimate built only from computed numbers:

$$I - S_2 \approx \frac{S_2 - S_1}{15}, \qquad \text{accept the panel if } \lvert S_2 - S_1\rvert \le 15\,\tau$$

Otherwise split the panel and give each half the tolerance $\tau/2$, so the accepted errors add up to at most the total. Accepted panels return $S_2 + (S_2 - S_1)/15$, a free Richardson correction. The estimate is only as good as the $h^4$ assumption behind it — near a singularity it is optimistic, and a feature hidden between samples it cannot see at all.`,
  symbols: [
    { tex: 'I', text: 'the true integral over the panel' },
    { tex: 'S_1', text: 'Simpson’s rule on the whole panel: three samples, at the ends and the middle' },
    { tex: 'S_2', text: 'Simpson’s rule on its two halves: five samples, two of them new' },
    { tex: '15', text: '$2^4 - 1$: Simpson’s error falls by $2^4$ when $h$ halves. For the trapezoid rule it would be $2^2 - 1 = 3$' },
    { tex: t`\tau`, text: 'the error tolerance allotted to this panel; the whole interval starts with the user’s tolerance and each split halves it' },
  ],
  why: 'Library integrators (scipy.integrate.quad, MATLAB’s integral, the step-size control of every adaptive ODE solver in F9) all run on this idea: estimate the error from two computations of different accuracy, and refine only where the estimate says so.',
  visual: {
    type: 'graph',
    title: 'Where the panels go',
    lead: t`Choose an integrand and a tolerance $\tau$. The grey lines are the edges of the panels adaptive Simpson accepted. The readouts compare its cost with uniform Simpson’s for the **same** achieved error.`,
    tasks: [
      `For √x, panels halve again and again towards x = 0, where √x has no bounded derivatives; at τ = 10⁻⁶ adaptive needs ${RUNS[0][2].evals} evaluations, uniform Simpson ${RUNS[0][2].uni} for the same error.`,
      'For the two peaks, panels crowd onto the steep flanks, not the flat tops or the empty tail.',
      'Compare the evaluation counts for the peaks at τ = 10⁻⁶: here adaptivity barely pays. It wins big at singularities, little on smooth bumps.',
    ],
    params: {
      x: [-0.06, 2.06], y: [-60, 1080], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)', yticks: 0,
      choices: [
        { key: 'fn', label: 'Integrand', options: FNS.map((F) => [F.key, F.label]), value: 1, explain: 'A singular derivative at an endpoint, or two narrow smooth peaks.' },
        { key: 'tl', label: 'Tolerance $\\tau$', options: TOLS.map(([k, , l]) => [k, l]), value: 2, explain: 'The total error the integrator is asked to stay below.' },
      ],
      curves: [
        { fn: 'sqrt(x)*700', color: 'accent', width: 2.2, domain: [0, 2], samples: 2000, when: 'step(0.5 - abs(fn - 1))' },
        { fn: FNS[1].fn, color: 'accent', width: 2.2, domain: [0, 2], samples: 4000, when: 'step(0.5 - abs(fn - 2))' },
      ],
      vlines: FNS.flatMap((F, i) => TOLS.flatMap(([tk], j) => [F.a, ...RUNS[i][j].panels.map((p) => p[1])].map((x) => ({ x: n12(x), color: 'ink4', when: when(F.key, tk) })))),
      readouts: [
        { label: 'adaptive evaluations', expr: sel((r) => r.evals), digits: 5 },
        { label: 'actual error', expr: sel((r) => n12(r.err)), digits: 2, zero: 0 },
        { label: 'uniform Simpson, same error', expr: sel((r) => r.uni), digits: 6 },
      ],
    },
    caption: 'Exact runs of the classic recursive adaptive Simpson in float64. The two integrands are drawn to different vertical scales, so the y-axis carries no numbers. The uniform counts are the fewest evaluations that reach the same error.',
  },
  example: {
    prompt: t`Run adaptive Simpson on $\int_0^1 \sqrt x\,dx = \tfrac23$ with $\tau = 10^{-3}$, by hand for the first levels. Is the error estimate trustworthy here?`,
    visual: {
      type: 'graph',
      params: { x: [-0.03, 1.05], y: [-0.05, 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '√x',
        curves: [{ fn: 'sqrt(x)', color: 'accent', width: 2.2, domain: [0, 1], samples: 2000 }],
        points: [0, 0.25, 0.5, 0.75, 1].map((x, i) => ({ x, y: n12(Math.sqrt(x)), r: 5, color: i % 2 ? 'gold' : 'accent' })),
        vlines: [{ x: 0.5, color: 'ink4' }] },
      caption: 'The five samples behind S₁ (blue: 0, ½, 1) and S₂ (gold: the two new ones at ¼ and ¾).',
    },
    steps: [
      { label: 'Whole panel', text: t`$S_1 = \tfrac16\left[\sqrt0 + 4\sqrt{0.5} + \sqrt1\right] = ${SQ1.toFixed(6)}$. Halves: $S(0, \tfrac12) = ${SL1.toFixed(6)}$ and $S(\tfrac12, 1) = ${SR1.toFixed(6)}$, so $S_2 = ${SQ2.toFixed(6)}$.` },
      { label: 'Test', text: t`$\lvert S_2 - S_1\rvert = ${(SQ2 - SQ1).toFixed(6)} > 15\tau = 0.015$: split, and give each half $\tau = 5\times10^{-4}$, threshold $0.0075$.` },
      { label: 'Right half', text: t`On $[\tfrac12, 1]$, $\sqrt x$ is smooth: $\lvert S_2 - S_1\rvert = ${tex(Math.abs(SR2 - SR1), 2)}$. Accept.` },
      { label: 'Left half', text: t`On $[0, \tfrac12]$: $\lvert S_2 - S_1\rvert = ${(SL2 - SL1).toFixed(6)} \le 0.0075$. Accept too. Total: $${SQ_RUN3.evals}$ evaluations, result $${SQ_RUN3.value.toFixed(6)}$.` },
      { label: 'Check the truth', text: t`The true error is $${tex(Math.abs(SQ_RUN3.value - 2 / 3), 2)}$ — **three times the tolerance**. On the first panel the estimate $(S_2 - S_1)/15 = ${tex((SQ2 - SQ1) / 15, 2)}$ undershot the true $I - S_2 = ${tex(2 / 3 - SQ2, 2)}$ eightfold. The 15 assumed an $h^4$ error; on a panel touching $x = 0$ the error of $\sqrt x$ shrinks only like $h^{1.5}$, so halving divides it by $2^{1.5} \approx 2.8$, not 16.` },
      { label: 'Contrast', text: t`For the smooth $\int_0^1 \frac{dx}{1+x}$ the same first test gives an estimate $${tex((LN_A[1] - LN_A[0]) / 15, 2)}$ against a true $${tex(Math.log(2) - LN_A[1], 2)}$ — the right size, and better on smaller panels. With $\tau = 10^{-5}$, $\sqrt x$ is handled too: $${SQ_RUN5.evals}$ evaluations, error $${tex(Math.abs(SQ_RUN5.value - 2 / 3), 2)}$, panels halving towards 0.` },
    ],
    answer: t`$S_2 - S_1 = ${(SQ2 - SQ1).toFixed(4)}$ forces one split; both halves pass, giving $${SQ_RUN3.value.toFixed(5)}$ with $${SQ_RUN3.evals}$ evaluations — but an error of $${tex(Math.abs(SQ_RUN3.value - 2 / 3), 2)}$, over the tolerance: the $h^4$ estimate is optimistic at a singularity.`,
  },
  practice: [
    num({
      id: 'estimate', difficulty: 2,
      gen(r) {
        const [Itex, fx, f, a, b, exact] = r.pick(EST_CASES);
        const [s1, s2] = S12(f, a, b).map(r7), ans = (s2 - s1) / 15;
        return {
          prompt: t`For $${Itex}$, Simpson’s rule on the whole interval gives $S_1 = ${s1}$ and on its two halves $S_2 = ${s2}$. Estimate the error $I - S_2$.`,
          visual: {
            type: 'graph',
            params: { x: [a - 0.06 * (b - a), b + 0.06 * (b - a)], y: [0, Math.max(f(a), f(b)) * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
              curves: [{ fn: fx, color: 'accent', width: 2.2, domain: [a, b] }],
              points: [0, 1, 2, 3, 4].map((k) => ({ x: n12(a + ((b - a) * k) / 4), y: n12(f(a + ((b - a) * k) / 4)), r: 4.5, color: k % 2 ? 'gold' : 'accent' })) },
            caption: 'The five samples: S₁ uses the blue ones, S₂ all five.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: s2 - s1, feedback: 'That is the difference itself. Simpson’s error drops 16-fold when h halves, so the error left in S₂ is about one fifteenth of it.' }, { value: (s2 - s1) / 3, feedback: 'Dividing by 3 = 2² − 1 is right for an order-2 rule such as the trapezoid. Simpson is order 4.' }],
          hints: [t`If $I - S_1 \approx 16(I - S_2)$, subtract: $S_2 - S_1 \approx 15(I - S_2)$.`, t`$(${s2} - ${s1})/15$.`],
          teach: 'Two estimates of known order give an error estimate for the better one: divide their difference by 2ᵖ − 1.',
          explain: t`$(S_2 - S_1)/15 = ${tex(ans, 3)}$. The true $I - S_2$ is $${tex(exact - s2, 3)}$: the estimate is right to within $${Math.round((100 * Math.abs(ans - (exact - s2))) / Math.abs(exact - s2))}\%$, good enough to decide whether to refine. Adding it, $S_2 + (S_2 - S_1)/15$, cancels the $h^4$ term and leaves an error of $${tex(Math.abs(exact - s2 - ans), 2)}$.`,
        };
      },
    }),
    mcq({
      id: 'why-15', difficulty: 2,
      prompt: t`Adaptive Simpson divides $S_2 - S_1$ by 15. Where does the 15 come from?`,
      visual: {
        type: 'graph',
        params: { x: [-1.4, 0.15], y: [-6.2, -0.8], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'panel width h', ylabel: '|error|',
          curves: [{ fn: '-1.5 + 4*x', color: 'violet', width: 2, dash: true, domain: [-1.35, 0.1] }],
          points: [{ x: 0, y: -1.5, r: 5, color: 'violet', label: 'S₁ (width h)', labelDx: -90, labelDy: -10 }, { x: n12(lg(0.5)), y: n12(-1.5 - 4 * lg(2)), r: 5, color: 'gold', label: 'S₂ (width h/2)', labelDx: 10, labelDy: 6 }] },
        caption: 'Simpson’s error against panel width on log–log axes: a line of slope 4, so halving h moves down by a factor of 2⁴ = 16.',
      },
      choices: [
        t`Simpson’s error scales as $h^4$, so $I - S_1 \approx 16(I - S_2)$; subtracting the two gives $S_2 - S_1 \approx 15(I - S_2)$`,
        'S₂ uses 15 more function evaluations than S₁',
        'It is an empirical safety factor chosen by experiment',
        t`$15 = 3 \times 5$: one factor for Simpson’s $\tfrac13$, one for the five samples`,
      ],
      answer: 0,
      why: {
        1: 'S₂ reuses S₁’s three samples and adds only two.',
        2: 'It follows from the order of the rule; a trapezoid-based scheme would use 3, a Boole-based one 63.',
        3: 'A numerological coincidence: the 15 is 2⁴ − 1, set by the order.',
      },
      hints: ['How much smaller is Simpson’s error on a panel half as wide (globally, over the same interval)?', 'Write I − S₁ = 16E and I − S₂ = E; subtract the two equations.'],
      teach: 'The divisor is 2ᵖ − 1 for an order-p rule: the error estimate is Richardson extrapolation run backwards.',
      explain: t`With $I - S_1 = 16E$ and $I - S_2 = E$, subtracting gives $S_2 - S_1 = 15E$. The same reasoning for a rule of order $p$ gives $2^p - 1$; [Richardson extrapolation](#/lesson/st-f.F13.2) uses it to improve the estimate rather than just to measure it.`,
    }),
    num({
      id: 'panel-threshold', difficulty: 2,
      gen(r) {
        const k = r.int(3, 7), [tau, tauTeX] = r.pick([[1e-6, '10^{-6}'], [1e-8, '10^{-8}'], [1e-4, '10^{-4}']]);
        const ans = (15 * tau) / 2 ** k;
        return {
          prompt: t`Adaptive Simpson runs on $[0, 1]$ with total tolerance $\tau = ${tauTeX}$. A panel produced by $${k}$ successive halvings (width $2^{-${k}}$) is accepted when $\lvert S_2 - S_1\rvert$ is at most what?`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.05], y: [-0.6, k + 0.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'level', yticks: 0,
              curves: Array.from({ length: k + 1 }, (_, lv) => ({ param: [`${n12(0.3 - (0.3 % 2 ** -lv))} + ${n12(2 ** -lv)}*t`, String(k - lv)], t: [0, 1], color: lv === k ? 'gold' : 'accent', width: 3 })) },
            caption: 'One branch of the subdivision tree, the whole interval at the top. Each level halves the width — and the tolerance.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: tau / 2 ** k, feedback: 'That is the panel’s tolerance τ/2ᵏ. The test compares |S₂ − S₁| with 15 times it.' }, { value: 15 * tau, feedback: 'Each split halves the tolerance, so a panel k levels down gets τ/2ᵏ.' }],
          hints: [t`Each split gives each half half the tolerance: $\tau_k = \tau/2^{${k}}$.`, t`The test is $\lvert S_2 - S_1\rvert \le 15\,\tau_k$.`],
          teach: 'Halving the tolerance at each split makes the accepted panels’ tolerances add up to at most the total, since a level-k panel has width 2⁻ᵏ of the interval.',
          explain: t`$15\times${tauTeX}/2^{${k}} = ${tex(ans, 3)}$. The tolerances of the accepted panels add up to at most $\tau$, because they sum like their widths. (This is conservative — errors of different signs partly cancel — which is why the achieved error is usually far below $\tau$.)`,
        };
      },
    }),
    mcq({
      id: 'spike', difficulty: 3,
      prompt: t`Adaptive Simpson, asked for $\tau = 10^{-8}$, returns $${tex(SPIKE_RUN.value, 1)}$ for $\int_0^1 e^{-((x - 0.37)/0.01)^2}\,dx$, whose true value is $\sqrt\pi\times0.01 = 0.0177$ — after only $${SPIKE_RUN.evals}$ evaluations. What went wrong?`,
      visual: {
        type: 'graph',
        params: { x: [-0.03, 1.03], y: [-0.08, 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
          curves: [{ fn: 'exp(-((x - 0.37)/0.01)^2)', color: 'accent', width: 2, domain: [0, 1], samples: 4000 }],
          points: [0, 0.25, 0.5, 0.75, 1].map((x) => ({ x, y: 0, r: 5, color: 'gold' })) },
        caption: 'The narrow pulse and the five points sampled before the first decision (gold). Every sample sees f ≈ 0.',
      },
      choices: [
        'All five first samples miss the spike, so S₁ = S₂ ≈ 0 and the panel is accepted: the estimate can only judge what has been sampled',
        'The tolerance was too tight, so the recursion stopped early',
        'Simpson’s rule cannot integrate a Gaussian',
        'Round-off error cancelled the spike’s contribution',
      ],
      answer: 0,
      why: {
        1: 'A tighter tolerance makes the test harder to pass, not easier; here it passed trivially because both estimates agreed.',
        2: 'Once sampled finely, Simpson integrates a Gaussian very accurately.',
        3: 'The samples are e⁻¹⁴⁴ or smaller — tiny but computed correctly; there was simply nothing there to add.',
      },
      hints: ['Evaluate f at 0, 0.25, 0.5, 0.75 and 1.', 'If S₁ and S₂ agree, the test passes, whatever lies between the samples.'],
      teach: 'Error estimates are built from samples, so a feature narrower than the first sample spacing can be missed entirely; give the integrator breakpoints, or a minimum number of panels, where you know a feature lies.',
      explain: t`Every sample is about $e^{-${Math.round(((0.25 - 0.37) / 0.01) ** 2)}}$, so $S_1 = S_2 \approx 0$ and $\lvert S_2 - S_1\rvert$ is far below $15\tau$. No adaptive method can be made foolproof — any finite set of samples misses something. Remedies: split at known features (\`points=\` in \`scipy.integrate.quad\`), force a minimum depth, or rescale the variable.`,
    }),
    code({
      id: 'adaptive', difficulty: 3,
      prompt: t`Write \`adaptive_simpson(f, a, b, tol)\` returning \`(value, evals)\`: compute $S_1$ on $[a, b]$ and $S_2$ on the halves; if $\lvert S_2 - S_1\rvert \le 15\,\text{tol}$ return $S_2 + (S_2 - S_1)/15$, otherwise recurse on each half with \`tol / 2\`. Count every call of \`f\`, reusing values so each point is evaluated once. Run it on $\int_0^1 \sqrt x\,dx$ with \`tol = 1e-6\`.`,
      starter: t`import math

def adaptive_simpson(f, a, b, tol):
    count = [0]
    def F(x):
        count[0] += 1
        return f(x)
    def S(a, b, fa, fm, fb):
        return (b - a) / 6 * (fa + 4 * fm + fb)
    def rec(a, b, fa, fm, fb, whole, tol):
        # split at m, evaluate the two quarter points, compare left + right with whole
        return whole
    fa, fm, fb = F(a), F((a + b) / 2), F(b)
    value = rec(a, b, fa, fm, fb, S(a, b, fa, fm, fb), tol)
    return value, count[0]

value, evals = adaptive_simpson(math.sqrt, 0, 1, 1e-6)
print(value, abs(value - 2 / 3), evals)
`,
      answer: t`import math

def adaptive_simpson(f, a, b, tol):
    count = [0]
    def F(x):
        count[0] += 1
        return f(x)
    def S(a, b, fa, fm, fb):
        return (b - a) / 6 * (fa + 4 * fm + fb)
    def rec(a, b, fa, fm, fb, whole, tol):
        m = (a + b) / 2
        flm, frm = F((a + m) / 2), F((m + b) / 2)
        left, right = S(a, m, fa, flm, fm), S(m, b, fm, frm, fb)
        d = left + right - whole
        if abs(d) <= 15 * tol:
            return left + right + d / 15
        return rec(a, m, fa, flm, fm, left, tol / 2) + rec(m, b, fm, frm, fb, right, tol / 2)
    fa, fm, fb = F(a), F((a + b) / 2), F(b)
    value = rec(a, b, fa, fm, fb, S(a, b, fa, fm, fb), tol)
    return value, count[0]

value, evals = adaptive_simpson(math.sqrt, 0, 1, 1e-6)
print(value, abs(value - 2 / 3), evals)`,
      tests: [
        { name: 'a cubic is exact after the first test: 5 evaluations', code: 'abs(adaptive_simpson(lambda x: x**3, 0, 2, 1e-10)[0] - 4) < 1e-12 and adaptive_simpson(lambda x: x**3, 0, 2, 1e-10)[1] == 5' },
        { name: t`$\sqrt x$ to within $10^{-6}$`, code: 'abs(value - 2 / 3) < 1e-6' },
        { name: t`in fewer than 150 evaluations (uniform Simpson needs $${SQ_UNI6}$)`, code: 'evals < 150' },
      ],
      hints: ['In rec: m = (a + b)/2, evaluate F at the two quarter points, form left and right with S, and d = left + right − whole.', 'If abs(d) ≤ 15·tol return left + right + d/15; otherwise return rec on [a, m] plus rec on [m, b], each with tol/2 and its own whole.'],
      teach: 'Passing the already computed samples down the recursion makes each refinement cost only two new evaluations.',
      explain: t`It returns an error of $${tex(SQ_ERR6, 2)}$ after $${SQ_RUN6.evals}$ evaluations, with panels shrinking by halves towards $x = 0$. Uniform Simpson needs $${SQ_UNI6}$ evaluations to do as well, because its order drops to 1.5 on $\sqrt x$.`,
    }),
    mcq({
      id: 'quad-abserr', difficulty: 2,
      prompt: t`A test engineer integrates a thrust model with SciPy:

\`\`\`python
from scipy.integrate import quad
impulse, err = quad(thrust, 0.0, 4.0, points=[2.3])
\`\`\`

What is \`err\`?`,
      choices: [
        'An estimate of the absolute error, from comparing two embedded Gauss–Kronrod rules on each panel — usually reliable, never a guarantee',
        'A rigorous upper bound on |impulse − true integral|',
        'The tolerance that was requested',
        'The round-off error of the floating-point sum',
      ],
      answer: 0,
      why: {
        1: 'No method that only samples f can bound its error rigorously: a spike between samples is invisible to it.',
        2: 'The request is epsabs and epsrel (1.49 × 10⁻⁸ by default); err reports what was achieved by its own estimate.',
        3: 'Round-off is one ingredient QUADPACK guards against, but err is mainly the truncation estimate.',
      },
      hints: ['quad is adaptive, like adaptive Simpson, but compares a 10-point Gauss rule with a 21-point Kronrod rule on each panel.', 'Could any sampling method guarantee an error bound for an arbitrary function?'],
      teach: 'Adaptive integrators report an estimated error, built from two rules of different accuracy; points= tells them where the integrand is not smooth.',
      explain: t`QUADPACK’s QAGS splits the panel with the largest estimated error, comparing the 10-point Gauss and 21-point Kronrod values, until the sum of estimates meets the tolerance; \`err\` is that sum. \`points=[2.3]\` puts a breakpoint at the burn-out, so the jump is never inside a panel ([F5.1](#/lesson/st-f.F5.1)). Treat \`err\` as a good estimate for smooth pieces, and a hopeful one otherwise.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-heating', difficulty: 3, transfer: true,
      prompt: t`A re-entry code integrates the stagnation-point heat flux $\dot q(t)$ over the entry to get the total heat load. The flux is near zero at first, rises to a sharp peak around $t = 75$ s, and decays slowly. Where does an adaptive integrator put most of its panels?`,
      visual: {
        type: 'graph',
        params: { x: [0, 300], y: [-0.05, 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'q̇ / q̇ (peak)',
          curves: [{ fn: '(x/75)^5*exp(5*(1 - x/75))', color: 'accent', width: 2.2, domain: [0, 300], samples: 2000 }] },
        caption: 'A schematic heat pulse, normalised to its peak (shape illustrative: a fast rise and a slow decay). Real heating follows from the trajectory and an engineering correlation.',
      },
      choices: [
        'Where the curve bends quickly — the rise and the turn over the peak — that is, where its fourth derivative is large; not simply where q̇ is large',
        'Evenly, because the tolerance applies to the whole interval',
        'In the long, slow tail, because it contributes most of the area',
        'At the very start, where q̇ is near zero and relative errors are largest',
      ],
      answer: 0,
      why: {
        1: 'The tolerance is shared out, but panels are split only where their own estimate fails — that is the whole point of adaptivity.',
        2: 'A slowly varying tail is integrated accurately by a few wide panels, however much area it holds.',
        3: 'The test uses absolute differences |S₂ − S₁|; where f is nearly flat and small they are tiny, so wide panels pass.',
      },
      hints: ['The local error of Simpson’s rule is about h⁵ f⁽⁴⁾/2880: what makes a panel fail?', 'Large f does not make a large error; large curvature (and its derivatives) does.'],
      teach: 'Adaptive refinement follows the integrand’s higher derivatives, not its size: panels crowd where the shape changes quickly.',
      explain: t`Each panel’s error is set by $h^5 f^{(4)}$, so the integrator narrows panels where $\dot q$ bends sharply: the rise and the turn at the peak. The long tail, despite its area, is smooth and takes a few wide panels.`,
    }),
    num({
      id: 'cp-dv-corrected', difficulty: 3, transfer: true,
      gen(r) {
        const F = r.pick([40, 60, 90]) * 1e3, m0 = r.pick([4000, 5000]), md = r.pick([15, 20]), tb = 100;
        const f = burn(F, m0, md), exact = (F / md) * Math.log(m0 / (m0 - md * tb));
        const [s1, s2] = S12(f, 0, tb).map((v) => Number(v.toFixed(4))), ans = s2 + (s2 - s1) / 15;
        return {
          prompt: t`An adaptive integrator computing a stage’s $\Delta v = \int_0^{100} \dfrac{F}{m_0 - \dot m t}\,dt$ ($F = ${F / 1e3}$ kN, $m_0 = ${m0}$ kg, $\dot m = ${md}$ kg/s) gets $S_1 = ${s1}$ m/s on the whole burn and $S_2 = ${s2}$ m/s on its halves. What value does it return if it accepts this panel?`,
          visual: {
            type: 'graph',
            params: { x: [-4, 104], y: [0, f(tb) * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'a (m/s²)',
              curves: [{ fn: `${F}/(${m0} - ${md}*x)`, color: 'accent', width: 2.2, domain: [0, tb] }],
              points: [0, 25, 50, 75, 100].map((x, k) => ({ x, y: n12(f(x)), r: 4.5, color: k % 2 ? 'gold' : 'accent' })) },
            caption: 'The acceleration of a constant-thrust stage (no gravity or drag) and the five samples behind S₁ and S₂.',
          },
          answer: ans, units: 'm/s', tol: { rel: 2e-6 },
          errors: [{ value: s2, feedback: 'That is S₂ without the correction. An accepted panel returns S₂ + (S₂ − S₁)/15.' }, { value: s2 + (s2 - s1) / 3, feedback: 'Simpson is order 4: divide by 15, not 3.' }].filter((e) => Math.abs(e.value - ans) > 4e-6 * ans),
          hints: ['Accepted panels return the Richardson-corrected value.', t`$S_2 + (S_2 - S_1)/15$ with $S_2 - S_1 = ${(s2 - s1).toFixed(4)}$ m/s.`],
          teach: 'The difference that estimates the error also corrects it: S₂ + (S₂ − S₁)/15 is a sixth-order result for free.',
          explain: t`$${s2} + ${(s2 - s1).toFixed(4)}/15 = ${ans.toFixed(4)}$ m/s. The exact value, $v_e\ln(m_0/m_1)$ with $v_e = F/\dot m$, is $${exact.toFixed(4)}$ m/s: the correction cut the error from $${tex(Math.abs(s2 - exact), 2)}$ to $${tex(Math.abs(ans - exact), 2)}$ m/s (part of what remains is the rounding of $S_1$ and $S_2$ to four decimals).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Lyness (1969), Notes on the adaptive Simpson quadrature routine, J. ACM 16, 483', url: 'https://doi.org/10.1145/321526.321537' },
    { label: 'Gander & Gautschi (2000), Adaptive quadrature — revisited, BIT 40, 84', url: 'https://doi.org/10.1023/A:1022318402393' },
    { label: 'SciPy documentation: scipy.integrate.quad', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.quad.html' },
  ],
});
