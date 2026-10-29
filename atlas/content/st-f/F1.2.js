// Round-off and cancellation — the analyst's view: how rounding errors
// propagate through a subtraction (the amplification factor
// (|a| + |b|)/|a − b|), why the subtraction itself is exact (Sterbenz) and
// only reveals earlier errors, the error bound of a long sum and how order
// and compensation (Kahan) change it; (1 − cos x)/x², a drifting clock, and
// the gravitational rate of a GPS clock.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { U, U32, n12, polyline, seg } from './_num.js';

const t = String.raw;

// ── the worked example: (1 − cos x)/x² at x = 10⁻⁵, in JavaScript's doubles (identical to Python's) ──
const X = 1e-5;
const COS = Math.cos(X);                         // 0.99999999995
const DIFF = 1 - COS;                            // exact subtraction (Sterbenz)
const NAIVE = DIFF / X ** 2;
const STABLE = (2 * Math.sin(X / 2) ** 2) / X ** 2;
const TRUE = 0.5 - X ** 2 / 24 + X ** 4 / 720;   // the series, accurate to double precision at this x
const REL_NAIVE = Math.abs(NAIVE - TRUE) / TRUE;
const AMP = (1 + COS) / DIFF;                    // (|a| + |b|)/|a − b|
const COS_THRESH = 2 ** -26.5;                   // below it cos x rounds to exactly 1
const grp = (x) => String(x).replace(/(?<=\.\d*)(\d{3})(?=\d)/g, '$1\\,');   // digits in threes (0.999\,999\,999\,95), for reading

// ── a clock advanced by t += 0.1 s, as an orbit propagator might ──
const DRIFT = {};
{
  let tt = 0, k = 0;
  const marks = new Set([1, 2, 5, 10].map((d) => d * 864000));
  for (let i = 1; i <= 8640000; i++) { tt += 0.1; if (marks.has(i)) DRIFT[i / 864000] = tt - i / 10; }
  void k;
}
// the drift over the first 100 000 steps, for the picture
const DRIFT_PTS = [];
{
  let tt = 0;
  for (let i = 1; i <= 100000; i++) { tt += 0.1; if (i % 2000 === 0) DRIFT_PTS.push([i / 1000, (tt - i / 10) * 1e9]); }
}

// ── float32 sum of 0.1, n times: measured error against the bound (n − 1)u ──
const SUM32 = [];
{
  let s = 0;
  const tenth = Math.fround(0.1);
  for (let i = 1; i <= 1e6; i++) {
    s = Math.fround(s + tenth);
    if ([10, 30, 100, 300, 1e3, 3e3, 1e4, 3e4, 1e5, 3e5, 1e6].includes(i)) SUM32.push([i, Math.abs(s - i * tenth) / (i * tenth)]);
  }
}

// ── GPS: the rate of a static clock at radius r against one far away, √(1 − 2GM/(rc²)) ──
const GM = 3.986004418e14, C2 = 299792458 ** 2;

// the staircase of 1 − fl(cos x) near x = 10⁻⁸ (x in units of 10⁻⁸, y in units of 2⁻⁵³)
const STAIR = [];
for (let k = 0; k <= 400; k++) { const xx = (4 * k) / 400; STAIR.push([xx, (1 - Math.cos(xx * 1e-8)) / 2 ** -53]); }

export default lesson({
  id: 'st-f.F1.2',
  title: 'Round-off and cancellation',
  minutes: 13, difficulty: 3,
  intro: t`Every operation adds a relative error of at most $u$, so long computations accumulate many small errors — but the dramatic losses come from one place. When $a$ and $b$ already carry relative errors $\delta_a$ and $\delta_b$ (from rounding, measurement or an earlier step), their difference obeys

$$\frac{\lvert(\hat a - \hat b) - (a - b)\rvert}{\lvert a - b\rvert} \le \frac{\lvert a\rvert + \lvert b\rvert}{\lvert a - b\rvert}\,\max\bigl(\lvert\delta_a\rvert, \lvert\delta_b\rvert\bigr)$$

When $a \approx b$ the factor in front is huge: the leading digits cancel and the errors in the trailing digits are all that is left. This is **catastrophic cancellation**. The subtraction itself is innocent — it is usually exact — it only *reveals* errors that were already there. [Scientific Programming](#/lesson/prog.P6.2) fixed the quadratic formula this way; here you learn to predict the damage before it happens.`,
  symbols: [
    { tex: t`a,\ b`, text: 'the exact values you wish you had' },
    { tex: t`\hat a,\ \hat b`, text: t`the values you actually hold: $\hat a = a(1 + \delta_a)$, $\hat b = b(1 + \delta_b)$` },
    { tex: t`\delta_a,\ \delta_b`, text: 'their relative errors, pure numbers: at least $u$ for anything rounded, far more for a measurement' },
    { tex: t`\frac{\lvert a\rvert + \lvert b\rvert}{\lvert a - b\rvert}`, text: t`the **amplification factor** of subtraction (its condition number, the subject of [F2.2](#/lesson/st-f.F2.2)): about $2\lvert a\rvert/\lvert a - b\rvert$ when $a \approx b$` },
    { tex: t`u`, text: 'unit roundoff, $2^{-53} \\approx 1.1\\times10^{-16}$ for float64 ([F1.1](#/lesson/st-f.F1.1))' },
  ],
  why: 'Finite differences, energy differences, small redshifts and perturbations of an orbit are all differences of nearly equal numbers; knowing the amplification factor tells you how many digits survive before you trust a result.',
  visual: {
    type: 'code-runner',
    title: 'Watching the digits cancel',
    lead: t`Press **Run**. Both columns compute $(1 - \cos x)/x^2$, which tends to $\tfrac12$. The naive one loses about two digits each time $x$ shrinks tenfold, until at $x = 10^{-8}$ nothing is left; the rewritten one, $2\sin^2(x/2)/x^2$, subtracts nothing and stays right. The plot compares the measured error with the bound $4u/x^2$.`,
    tasks: [
      'Change the formula for `naive` to (1 - np.cos(x)) / x / x: the cancellation does not care how you divide afterwards.',
      'Extend the range with np.arange(1, 13): beyond 10⁻⁸ the naive answer is exactly 0, a 100% error.',
      'Try the same with x in float32 (x = (10.0 ** -np.arange(1, 10)).astype(np.float32)): the damage starts around 10⁻³ instead.',
    ],
    params: {
      rows: 22,
      code: t`import numpy as np
import matplotlib.pyplot as plt

x = 10.0 ** -np.arange(1, 10)          # 0.1, 0.01, …, 1e-9
naive  = (1 - np.cos(x)) / x**2
stable = 2 * np.sin(x / 2)**2 / x**2   # no subtraction: accurate to a few u

for xi, a, b in zip(x, naive, stable):
    print(f"x = {xi:5.0e}   naive {a:.16f}   stable {b:.16f}")

u = 2.0**-53
rel = np.maximum(np.abs(naive - stable) / stable, 1e-17)
fig, ax = plt.subplots()
ax.loglog(x, rel, "o-", label="naive formula: relative error")
ax.loglog(x, np.minimum(4 * u / x**2, 1), "--", label="bound 4u/x²")
ax.set_xlabel("x")
ax.set_ylabel("relative error")
ax.legend()
plt.show()`,
    },
    caption: 'Real float64 arithmetic. The stable formula serves as the reference because it is accurate to a few u; the bound assumes fl(cos x) is off by at most u.',
  },
  example: {
    prompt: t`Predict, then explain, the error of \`(1 - math.cos(x)) / x**2\` at $x = 10^{-5}$, where the true value is $\tfrac12 - \tfrac{x^2}{24} + \ldots = 0.499\,999\,999\,995\,833\,3$.`,
    visual: {
      type: 'graph',
      params: { x: [-9.3, -0.7], y: [-16.5, 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'relative error of the naive formula',
        curves: [{ fn: `min(0, ${n12(Math.log10(4 * U))} - 2x)`, color: 'bad', dash: true, domain: [-9.2, -0.8], label: 'bound 4u/x²', labelAt: -2.2, labelDx: 6, labelDy: 14 }],
        points: [-1, -2, -3, -4, -6, -7].map((e) => { const xx = 10 ** e, nv = (1 - Math.cos(xx)) / xx ** 2, sv = (2 * Math.sin(xx / 2) ** 2) / xx ** 2; return { x: e, y: n12(Math.log10(Math.max(1e-17, Math.abs(nv - sv) / sv))), r: 4, color: 'accent' }; }).concat([{ x: -8, y: 0, r: 4, color: 'accent' }, { x: -5, y: n12(Math.log10(REL_NAIVE)), r: 5.5, color: 'gold', label: 'x = 10⁻⁵', labelDx: 10, labelDy: 10 }]) },
      caption: 'The measured relative error (blue) at x = 10⁻¹ … 10⁻⁸, under the worst-case bound (red). Both axes are logarithmic; at 10⁻⁸ the error is 100%.',
    },
    steps: [
      { label: 'Find the subtraction', text: t`$\cos(10^{-5}) = 1 - 5\times10^{-11} + \ldots$, so $1 - \cos x$ subtracts two numbers that agree in their first ten digits.` },
      { label: 'Error coming in', text: t`\`math.cos\` returns $\hat b = ${grp(COS)}$, correct to within $u$ relative, so $\lvert\delta_b\rvert \le u \approx 1.1\times10^{-16}$. The 1 is exact, $\delta_a = 0$.` },
      { label: 'Amplify', text: t`The factor is $\dfrac{1 + \cos x}{1 - \cos x} \approx \dfrac{2}{5\times10^{-11}} = ${tex(AMP, 2)}$, so the result may be wrong by up to $${tex(AMP, 2)} \times 1.1\times10^{-16} \approx ${tex(AMP * U, 2)}$ relative: about **six** of sixteen digits are at risk before anything else happens.` },
      { label: 'Measure', text: t`Python prints $${grp(NAIVE)}$: a relative error of $${tex(REL_NAIVE, 2)}$, inside the bound. The subtraction $1 - \hat b = ${tex(DIFF, 16)}$ was **exact** (Sterbenz's lemma: if $b/2 \le a \le 2b$, $a - b$ is a float), and so was the division up to $u$; every lost digit was lost in $\hat b$ and merely exposed.` },
      { label: 'Remove it', text: t`Since $1 - \cos x = 2\sin^2(x/2)$, compute \`2 * math.sin(x/2)**2 / x**2\`: no subtraction, five operations each adding at most $u$, so the error is a few $u$. It prints $${grp(STABLE)}$, correct to every digit.` },
      { label: 'Sense check', text: t`Below $x = 2^{-26.5} \approx ${tex(COS_THRESH, 4)}$, $\cos x$ rounds to exactly 1 and the naive formula returns 0: a 100% error from an answer that should be $\tfrac12$.` },
    ],
    answer: t`Up to $\sim${tex(AMP * U, 1)}$ relative error is predicted, $${tex(REL_NAIVE, 2)}$ is measured; the rewrite $2\sin^2(x/2)/x^2$ is accurate to full precision.`,
  },
  practice: [
    mcq({
      id: 'sterbenz', difficulty: 2,
      prompt: t`In \`1 - math.cos(x)\` with $x = 3\times10^{-8}$, how much rounding error does the **subtraction itself** add?`,
      visual: {
        type: 'graph',
        params: { x: [0, 4.1], y: [-0.3, 8], aspect: 'wide', axesAt: 'edge', xlabel: 'x, in units of 10⁻⁸', ylabel: '1 − cos x, in units of 2⁻⁵³',
          curves: [{ fn: `${n12(0.5e-16 * 2 ** 53)}*x^2`, color: 'ink3', dash: true, label: 'exact 1 − cos x', labelAt: 3.3, labelDx: -110, labelDy: -6 }, ...polyline(STAIR, { color: 'accent', width: 2 })] },
        caption: t`The computed $1 - \mathrm{fl}(\cos x)$ (blue) against the exact value (dashed). It only takes whole multiples of $2^{-53}$, the gap between floats just below 1.`,
      },
      choices: ['None: the difference of two floats this close is itself a float, so it is computed exactly', t`Up to $u$ relative to the result, like any other operation`, t`Up to $2u$: one rounding for each operand`, 'Nearly all of it: the subtraction is where the digits are lost'],
      answer: 0,
      why: {
        1: t`The standard model *allows* an error of $u$, but here none occurs: by Sterbenz's lemma, if $b/2 \le a \le 2b$ the exact difference $a - b$ is a float.`,
        2: 'The operands are already floats; the subtraction rounds at most once — and here not even once.',
        3: t`The digits were lost when $\cos x$ was rounded to a float; the subtraction exposes that error but adds none of its own.`,
      },
      hints: ['Both 1 and fl(cos x) are floats between ½ and 2. How many significant bits can their difference need?', t`Sterbenz's lemma: if $b/2 \le a \le 2b$, then $a - b$ is exactly representable.`],
      teach: 'Cancellation adds no new error: subtracting nearby floats is exact, and the damage is the relative error the operands already carried, magnified.',
      explain: t`The difference of two floats within a factor of 2 of each other needs no more bits than they have, so it is exact. The staircase in the picture is the grid of floats below 1, inherited from $\mathrm{fl}(\cos x)$. To fix cancellation you must avoid creating the error (rewrite the formula), not compute the difference more carefully.`,
    }),
    num({
      id: 'amplify', difficulty: 2,
      gen(r) {
        const R = r.int(20180, 20220) + r.pick([0.25, 0.5, 0.75]);
        const D = r.pick([0.5, 2, 15]);
        const [d, dname] = r.pick([[1e-7, t`$10^{-7}$, a good ranging measurement`], [U32, t`$u = 2^{-24} \approx 6.0\times10^{-8}$, because they were stored as float32`]]);
        const a = R + D, b = R;
        const ans = ((a + b) / D) * d;
        return {
          prompt: t`Two ground stations measure their distances to a GPS satellite as $a = ${a}$ km and $b = ${b}$ km, each with relative error at most ${dname}. Bound the **relative** error of the computed difference $a - b$. (Give it as a fraction, not a percentage.)`,
          visual: {
            type: 'graph',
            params: { x: [-1.5, 2], y: [0, 6.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'a − b (km)', ylabel: 'amplification (|a| + |b|)/|a − b|',
              curves: [{ fn: `${n12(Math.log10(2 * R))} - x`, color: 'accent', width: 2 }] },
            caption: t`The amplification factor for two distances near $${R}$ km, against their difference (logarithmic axes). Halve the difference and the factor doubles.`,
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: d, feedback: 'That is the error of each distance. The difference is far smaller than either distance, so its relative error is far larger.' }, { value: (a + b) / D, feedback: 'That is the amplification factor alone; multiply it by the relative error it amplifies.' }],
          hints: [t`Use $\dfrac{\lvert a\rvert + \lvert b\rvert}{\lvert a - b\rvert}\max\lvert\delta\rvert$.`, t`$\lvert a\rvert + \lvert b\rvert = ${a + b}$ km and $a - b = ${D}$ km.`],
          teach: 'The relative error of a difference is the operands’ relative error times (|a| + |b|)/|a − b| — and that factor is large whenever the difference is small.',
          explain: t`$\dfrac{${a + b}}{${D}} \times ${tex(d, 3)} = ${tex(ans, 3)}$. The absolute errors of about $${tex(d * R, 2)}$ km each are unchanged by subtracting; it is the result that has shrunk.`,
        };
      },
    }),
    match({
      id: 'rewrites', difficulty: 2,
      prompt: t`Each expression on the left cancels badly for the $x$ given. Match it with an algebraically equal form that does not.`,
      left: [t`$1 - \cos x$, small $x$`, t`$\sqrt{x + 1} - \sqrt{x}$, large $x$`, t`$\ln(1 + x)$, small $x$`, t`$x - \sin x$, small $x$`],
      right: ['2 sin²(x/2)', '1 / (√(x + 1) + √x)', 'math.log1p(x)', 'x³/6 − x⁵/120 + … (the series)', 'math.expm1(x)', '(1 − cos x)·(1 + cos x)'],
      answer: [0, 1, 2, 3],
      hints: ['Look for an identity that turns the difference into a product or a sum of same-signed terms.', 'For ln(1 + x) the problem is forming 1 + x itself: the low digits of x are lost before the log is taken. Libraries provide a function that never forms it.'],
      teach: 'Cancellation is removed by algebra done before the computer sees the numbers: a trigonometric identity, rationalising, a library function such as log1p, or a Taylor series.',
      explain: t`$1 - \cos x = 2\sin^2(x/2)$; multiplying by the conjugate gives $1/(\sqrt{x+1} + \sqrt x)$; \`log1p\` computes $\ln(1 + x)$ without forming $1 + x$; and $x - \sin x = x^3/6 - x^5/120 + \ldots$, whose terms are all known accurately. \`expm1\` is the cure for $e^x - 1$, and $(1 - \cos x)(1 + \cos x)$ is $\sin^2 x$, still computed by a subtraction.`,
    }),
    num({
      id: 'cos-one', difficulty: 3,
      gen(r) {
        const [fmt, gap, uu] = r.pick([['float64', '2^{-53}', 2 ** -53], ['float32', '2^{-24}', 2 ** -24]]);
        const ans = Math.sqrt(uu);              // x²/2 < gap/2  ⇒  x < √gap
        return {
          prompt: t`In ${fmt}, the floats just below 1 are $${gap}$ apart. Using $\cos x \approx 1 - x^2/2$, below what $x$ does a correctly rounded $\cos x$ come out as **exactly 1** — so that $(1 - \cos x)/x^2$ returns 0?`,
          visual: {
            type: 'graph',
            params: { x: [0, 2], y: [-2.4, 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'cos x near 1', xticks: 0, yticks: 0,
              curves: [{ fn: '-0.9*x^2', color: 'accent', domain: [0, 1.75], label: 'cos x', labelAt: 1.55, labelDx: 8, labelDy: -2 }],
              hlines: [{ y: 0, label: '1', color: 'gold' }, { y: -1, label: `1 − ${gap.replace(/\^\{(-?\d+)\}/, (m, e) => [...e].map((c) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]).join(''))}`, color: 'gold' }, { y: -2, color: 'gold' }] },
            caption: 'Schematic: the curve cos x and the floats just below 1 (gold lines, one gap apart). A correctly rounded cos x jumps to the nearest gold line.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: Math.sqrt(2 * uu), feedback: 'That is where cos x reaches the next float below 1. Rounding to nearest already gives 1 at half that gap.' }, { value: 2 * uu, feedback: t`Solve $x^2/2 < \text{half a gap}$ for $x$: take a square root.` }],
          hints: ['A correctly rounded result is 1 if the exact cos x is closer to 1 than to the next float down — within half a gap.', t`Solve $\dfrac{x^2}{2} < \dfrac12 \cdot ${gap}$.`],
          teach: 'A quantity changes the stored value only when it moves the result by more than half a gap; below that, rounding erases it completely.',
          explain: t`$x^2/2 < \tfrac12\cdot${gap}$ gives $x < \sqrt{${gap}} = ${tex(ans, 3)}$. Python agrees: in ${fmt} \`cos(x) == 1\` holds just below that value and fails just above it.`,
        };
      },
    }),
    num({
      id: 'sum-bound', difficulty: 2,
      gen(r) {
        const k = r.pick([4, 5, 6, 7, 8]);
        const n = 10 ** k;
        const ans = (n - 1) * U;
        const what = r.pick(['photon weights in a Monte Carlo radiation code', 'mass elements of a gas cloud', 'energy deposits in a calorimeter simulation']);
        return {
          prompt: t`A code adds $n = 10^{${k}}$ positive ${what} one at a time, in float64 ($u = 2^{-53}$). To first order, the error of recursive summation obeys $\lvert\hat s - s\rvert \le (n - 1)\,u\sum\lvert x_i\rvert$. What worst-case **relative** error does this bound allow for the sum?`,
          visual: {
            type: 'graph',
            params: { x: [0.8, 6.2], y: [-9, -1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n, terms added', ylabel: 'relative error',
              curves: [{ fn: `x + ${n12(Math.log10(U32))}`, color: 'bad', dash: true, label: '(n − 1)u, float32', labelAt: 1.3, labelDx: 0, labelDy: -16 }],
              points: SUM32.map(([m, e]) => ({ x: n12(Math.log10(m)), y: n12(Math.log10(Math.max(e, 1e-9))), r: 4, color: 'accent' })) },
            caption: 'An experiment in float32 (u = 2⁻²⁴), not float64: adding 0.1 again and again, the measured relative error (blue) against the worst-case bound (red). Logarithmic axes.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.sqrt(n) * U, feedback: t`$\sqrt n\,u$ is the typical size when the roundings are random and cancel; the question asks for the worst case the bound allows.` }, { value: U, feedback: 'One addition errs by u; n − 1 additions can each add another.' }],
          hints: [t`With all $x_i > 0$, $\sum\lvert x_i\rvert = s$, so the relative error bound is just $(n - 1)u$.`, t`$(10^{${k}} - 1) \times 1.11\times10^{-16}$.`],
          teach: 'Recursive summation can lose (n − 1)u relative to the sum of magnitudes: a linear growth that is reached when the rounding errors all push the same way.',
          explain: t`$(n - 1)u \approx ${tex(ans, 3)}$. In float64 even $10^{8}$ terms leave about eight good digits in the worst case; in float32 the same bound is useless beyond $10^{7}$ terms — and summing 0.1 repeatedly, as in the picture, really does follow it, because every rounding has the same sign.`,
        };
      },
    }),
    code({
      id: 'kahan', difficulty: 3,
      prompt: t`Write \`kahan_sum(xs)\`, Kahan's **compensated summation**: keep a running sum \`s\` and a correction \`c\` (both starting at 0.0), and for each value \`v\` do

\`\`\`python
y = v - c          # the value, corrected by what was lost last time
t = s + y          # the low digits of y are lost here …
c = (t - s) - y    # … and recovered here (algebraically zero)
s = t
\`\`\`

Then return \`s\`. Do not call \`sum\` or \`math.fsum\`.`,
      starter: t`import math

def kahan_sum(xs):
    s = 0.0
    c = 0.0
    # loop over xs here
    return s

data = [0.1] * 100_000
naive = 0.0
for v in data:
    naive += v
print("naive loop:", naive)
print("Kahan:     ", kahan_sum(data))
print("fsum:      ", math.fsum(data))
`,
      answer: t`import math

def kahan_sum(xs):
    s = 0.0
    c = 0.0
    for v in xs:
        y = v - c
        t = s + y
        c = (t - s) - y
        s = t
    return s

data = [0.1] * 100_000
naive = 0.0
for v in data:
    naive += v
print("naive loop:", naive)
print("Kahan:     ", kahan_sum(data))
print("fsum:      ", math.fsum(data))`,
      tests: [
        { name: 'Kahan sums 10⁵ copies of 0.1 to the correctly rounded 10000.0', code: 'kahan_sum([0.1] * 100_000) == math.fsum([0.1] * 100_000)' },
        { name: 'the naive loop really is off (by about 1.9 × 10⁻⁸)', code: 'abs(naive - 10000.0) > 1e-8' },
        { name: 'small terms after a huge one are not lost', code: 'kahan_sum([1e16] + [1.0] * 1000) == 1e16 + 1000' },
        { name: 'it works on an empty list', code: 'kahan_sum([]) == 0.0' },
      ],
      hints: ['Put the four lines from the prompt inside `for v in xs:`.', 'Keep the order exactly: `y = v - c`, `t = s + y`, `c = (t - s) - y`, `s = t`. Reordering or simplifying `c` algebraically to 0 destroys it.'],
      teach: 'Compensated summation carries the rounding error of each addition forward as a correction, so the error bound no longer grows with n: about 2u relative, plus a term of order nu² that matters only for astronomically long sums.',
      explain: t`\`(t - s) - y\` is exactly the part of \`y\` that did not make it into \`t\` — it would be zero in exact arithmetic, which is why an over-eager optimiser that "simplifies" it ruins the method. The naive loop is off by $1.9\times10^{-8}$ after $10^5$ terms; Kahan's result is the correctly rounded sum. Python 3.12's built-in \`sum\` of floats now does a compensated sum of this kind internally.`,
    }),
    mcq({
      id: 'order', difficulty: 2,
      prompt: t`The series $\sum_{n=1}^{10^6} 1/n^2 \approx \pi^2/6 = 1.6449340\ldots$ is summed in **float32** two ways. Forward ($n = 1, 2, \ldots$) gives $1.6447253$; backward ($n = 10^6, \ldots, 1$) gives $1.6449330$. Why is backward better?`,
      visual: {
        type: 'graph',
        params: { x: [-0.2, 6.2], y: [-12.5, 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: 'size',
          curves: [{ fn: '-2x', color: 'accent', domain: [0, 6], label: 'term 1/n²', labelAt: 4.6, labelDx: 6, labelDy: -14 }, { fn: `${n12(Math.log10(U32))}`, color: 'bad', dash: true, domain: [0, 6], label: 'half the float32 gap at 1.64', labelAt: 0.3, labelDx: 0, labelDy: -12 }] },
        caption: 'Term size against n (logarithmic axes). Terms below the red line are smaller than half a gap of a running sum near 1.64: added to it, they vanish completely.',
      },
      choices: [
        'Adding the small terms first lets them build up to a size the large running sum can register',
        'Backward summation makes fewer additions',
        'Float32 is more accurate for small numbers, so starting small is more precise',
        'The forward sum overflows',
      ],
      answer: 0,
      why: {
        1: 'Both orders make exactly 10⁶ − 1 additions.',
        2: 'Relative precision is the same at every size; what matters is the size of each term relative to the running sum it is added to.',
        3: 'Nothing here comes close to the float32 maximum of about 3.4 × 10³⁸.',
      },
      hints: ['In the forward order, how big is the running sum when the term 1/n² is added, for large n?', 'Once the sum is near 1.64, any term below about 6 × 10⁻⁸ is less than half a gap and is lost entirely — every term beyond n ≈ 4 000.'],
      teach: 'An addend smaller than half the gap of the running sum is lost; summing from small to large keeps the running sum small while the small terms accumulate.',
      explain: 'Forward, the sum reaches 1.64 early, and every term beyond n ≈ 4 000 is smaller than half its gap and simply disappears — the forward answer stalls about 2 × 10⁻⁴ low. Backward, the tiny terms are added to each other first, and their total registers when the large terms arrive. The bound (n − 1)u Σ|x| was the same for both; the actual error depends on the partial sums, which is why order matters.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-clock', difficulty: 2, transfer: true,
      gen(r) {
        const days = r.pick([1, 2, 5, 10]);
        const N = days * 864000;
        const ans = Math.abs(DRIFT[days]);
        return {
          prompt: t`An orbit propagator advances its clock with \`t += 0.1\` at every step, starting from \`t = 0.0\`. After ${days} day${days > 1 ? 's' : ''} ($${(N).toLocaleString('en-US').replace(/,/g, '{,}')}$ steps) the clock should read exactly $${N / 10}$ s. By how many seconds does it differ? (Every addition rounds; the picture shows the first $10^5$ steps.)`,
          visual: {
            type: 'graph',
            params: { x: [0, 102], y: [-4, 21], aspect: 'wide', axesAt: 'edge', xlabel: 'steps (thousands)', ylabel: 'clock error (ns)',
              curves: polyline(DRIFT_PTS, { color: 'accent', width: 2 }) },
            caption: 'The clock error, t − 0.1 n, over the first 100 000 steps, measured in float64 (nanoseconds). It does not grow steadily: its rate changes each time t crosses a power of two and the gap doubles.',
          },
          answer: ans, units: 's', tol: { rel: 0.02 },
          errors: [{ value: N * U * (N / 10), feedback: 'That is the worst-case bound (n − 1)u times the sum. The actual drift is smaller: run the loop, or reason about the gap at each stage.' }],
          hints: ['This one is quickest to measure: a loop of a few million additions takes a moment in Python.', '`t = 0.0`, then `for i in range(N): t += 0.1`, then compare `t` with `N / 10` — which is exact here.'],
          teach: 'Accumulating a time step that is not exact in binary drifts; computing t = n·dt from an integer step count rounds only once.',
          explain: t`The loop ends $${tex(ans, 3)}$ s ${DRIFT[days] > 0 ? 'ahead' : 'behind'}. Each addition rounds to the gap at the current $t$, which doubles at every power of two, so the drift is a sum of piecewise-linear pieces. Writing \`t = n * 0.1\` instead rounds once and is off by at most half a gap — about $${tex(N / 10 * U, 1)}$ s here.`,
        };
      },
    }),
    num({
      id: 'cp-gps-rate', difficulty: 3, transfer: true,
      gen(r) {
        const [R, where] = r.pick([[6.371e6, 'on Earth’s surface, $r = 6371$ km'], [2.656e7, 'aboard a GPS satellite, $r = 26\\,560$ km']]);
        const p = (2 * GM) / (R * C2), b = Math.sqrt(1 - p);
        const ans = ((1 + b) / (1 - b)) * U;
        return {
          prompt: t`A static clock ${where} ticks slower than one far from Earth by the fraction $1 - \sqrt{1 - 2GM/(rc^2)}$, with $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$. A program computes it as \`1 - math.sqrt(1 - 2*GM/(r*c**2))\`, where the square root carries a relative error of at most $u = 2^{-53}$. Bound the relative error of the result.`,
          visual: {
            type: 'graph',
            params: { x: [6.6, 8.2], y: [-10.5, -8], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'r (m)', ylabel: '1 − √(1 − 2GM/rc²)',
              curves: [{ fn: `${n12(Math.log10(GM / C2))} - x`, color: 'accent', width: 2 }],
              vlines: [{ x: n12(Math.log10(6.371e6)), label: 'surface', color: 'ink3' }, { x: n12(Math.log10(2.656e7)), label: 'GPS orbit', color: 'ink3' }] },
            caption: 'The fractional rate deficit of a static clock against distance from Earth’s centre (logarithmic axes): about GM/(rc²), a few parts in 10¹⁰. Orbital speed, which slows a moving clock further, is left out.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: U, feedback: 'That is the error of the square root itself. Subtracting it from 1 amplifies it.' }],
          hints: [t`Here $a = 1$ (exact) and $b = \sqrt{1 - 2GM/(rc^2)} \approx 1$: use the amplification factor $(\lvert a\rvert + \lvert b\rvert)/\lvert a - b\rvert$.`, t`$1 - b \approx GM/(rc^2) = ${tex(1 - b, 3)}$, so the factor is about $2/${tex(1 - b, 3)}$.`],
          teach: 'A tiny relativistic correction computed as 1 minus something close to 1 keeps only as many digits as the correction is far from u: the cure is the rewrite p/(1 + √(1 − p)).',
          explain: t`$(1 + b)/(1 - b) \times u = ${tex((1 + b) / (1 - b), 3)} \times 1.11\times10^{-16} = ${tex(ans, 2)}$: only about ${Math.round(-Math.log10(ans))} significant digits survive. Rationalising, $1 - \sqrt{1 - p} = \dfrac{p}{1 + \sqrt{1 - p}}$ with $p = 2GM/(rc^2)$, subtracts only the tiny $p$ from 1 inside the root, where its error is harmless, and keeps full precision.`,
        };
      },
    }),
    mcq({
      id: 'cp-diagnose', difficulty: 2,
      prompt: t`A colleague says: “Our energy-conservation check $E(t) - E(0)$ shows only noise at the $10^{-9}$ level, but $E \approx 10^{7}$ J and float64 has 16 digits, so the integrator must be leaking energy.” What is the right response?`,
      visual: {
        type: 'graph',
        params: { x: [-9.3, -0.7], y: [-16.5, 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'size of the difference, relative to the operands', ylabel: 'relative error of the difference',
          curves: [{ fn: `min(0, ${n12(Math.log10(2 * U))} - x)`, color: 'bad', width: 2, domain: [-9.2, -0.8], label: '2u ÷ relative size', labelAt: -6, labelDx: 8, labelDy: -12 }] },
        caption: 'The amplification of a difference: the smaller the difference relative to the numbers subtracted, the larger the relative error it inherits from their last digits (logarithmic axes).',
      },
      choices: [
        t`The difference of two numbers near $10^7$ J inherits their errors of about $u \times 10^{7}\ \text{J} \approx 10^{-9}$ J: noise at that level is round-off, not a leak`,
        'Agreed: 16 digits means the difference should be exact to 10⁻¹⁶ J',
        'The integrator must be switched to float32 to see the true drift',
        'Subtracting two floats always adds an error of u relative to the difference, so the check is meaningless',
      ],
      answer: 0,
      why: {
        1: t`Sixteen digits are *relative* to the size of the numbers: an energy of $10^7$ J is known to about $10^{-9}$ J, and so is the difference of two of them.`,
        2: 'Fewer digits make the noise larger, not more informative.',
        3: 'The subtraction itself is exact here; the check is meaningful above the round-off floor, and a real leak would grow steadily beyond it.',
      },
      hints: ['How large is the gap between floats near 10⁷?', t`Each $E$ carries an absolute error of about $u\lvert E\rvert \approx 10^{-9}$ J, and subtraction passes it straight through.`],
      teach: 'Round-off sets a floor of about u|E| on any difference of E values: look for a signal above it, growing with time, before diagnosing a leak.',
      explain: t`The gap between floats near $10^7$ is $2^{23-52} \approx 1.9\times10^{-9}$, so each energy is uncertain at that level and their difference cannot be cleaner. Watch how the difference grows with time and with the step size instead: a real integrator error changes with $h$; a round-off floor does not.`,
    }),
  ],
  sources: [
    { label: 'Higham (2002), Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, ch. 1–4 (cancellation, Sterbenz’s lemma, summation)', url: 'https://doi.org/10.1137/1.9780898718027' },
    { label: 'Goldberg (1991), What every computer scientist should know about floating-point arithmetic, ACM Computing Surveys 23, 5', url: 'https://doi.org/10.1145/103162.103163' },
    { label: 'Kahan (1965), Further remarks on reducing truncation errors, Communications of the ACM 8, 40', url: 'https://doi.org/10.1145/363707.363723' },
    { label: 'Ashby (2003), Relativity in the Global Positioning System, Living Reviews in Relativity 6, 1', url: 'https://doi.org/10.12942/lrr-2003-1' },
  ],
});
