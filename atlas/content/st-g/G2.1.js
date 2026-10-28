// Sequences, limits and completeness. Convergence as ∀ε ∃N ∀n ≥ N; the
// Cauchy criterion, which never mentions the limit; completeness of ℝ as the
// property that every Cauchy sequence converges, and its failure in ℚ: Newton's
// rationals 1, 3/2, 17/12, 577/408 close in on √2, which ℚ does not contain.
// GR tie: numerical-relativity convergence tests are Cauchy tests.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const SQ2 = Math.SQRT2;

// points of a sequence against n, with an optional horizontal line (its limit)
function seqPlot({ vals, n0 = 1, limit = null, x, y, caption, color = 'accent', band = null, ylabel = 'aₙ', extra = {} }) {
  return {
    type: 'graph',
    params: {
      x: x || [0, vals.length + n0], y, aspect: 'wide', xlabel: 'n', ylabel,
      ...(band ? { shade: [{ fn: String(band[1]), lower: String(band[0]), from: x ? x[0] : 0, to: x ? x[1] : vals.length + n0, color: 'good', alpha: 0.15 }] } : {}),
      ...(limit !== null ? { hlines: [{ y: limit, color: 'good' }] } : {}),
      points: vals.map((v, i) => ({ x: i + n0, y: +v.toPrecision(10), r: 4, color })),
      ...extra,
    },
    caption,
  };
}

const newton = (k) => { const out = [1]; for (let i = 1; i < k; i++) out.push(out[i - 1] / 2 + 1 / out[i - 1]); return out; };

export default lesson({
  id: 'st-g.G2.1',
  title: 'Sequences, limits and completeness',
  minutes: 13, difficulty: 3,
  intro: t`A sequence $a_n$ **converges** to $L$ when $\forall\varepsilon > 0\ \exists N\ \forall n \ge N:\ |a_n - L| < \varepsilon$ — eventually every term stays in any band you name. To use that you must know $L$. The **Cauchy criterion** asks only that the terms eventually crowd together:

$$\begin{gathered}\forall\varepsilon > 0\ \ \exists N\ \ \forall m, n \ge N: \\ |a_m - a_n| < \varepsilon\end{gathered}$$

Every convergent sequence is Cauchy. The converse is the defining property of the real numbers — **completeness**: in $\mathbb R$ every Cauchy sequence converges. The rationals $\mathbb Q$ fail it: a sequence of fractions can crowd together around $\sqrt2$, a point that is not there. Series convergence in [Calculus II](#/lesson/math1220.C2-4.1) silently relies on completeness at every step.`,
  symbols: [
    { tex: 'a_n', text: t`the $n$-th term of the sequence, $n = 1, 2, 3, \dots$` },
    { tex: '\\varepsilon', text: 'a tolerance, chosen first and as small as you like' },
    { tex: 'N', text: t`an index after which the promise holds; it may depend on $\varepsilon$` },
    { tex: 'm, n', text: t`any two indices beyond $N$ — not just neighbours: $|a_{n+1} - a_n| \to 0$ is **not** enough` },
    { tex: '\\mathbb Q,\\ \\mathbb R', text: 'the rational numbers (fractions) and the real numbers; ℝ is ℚ with its holes filled — its completion' },
  ],
  why: 'Physics computes almost everything as the limit of a sequence — partial sums of a perturbation series, iterations of a solver, simulations at finer and finer resolution — and usually without knowing the limit, which is exactly when the Cauchy criterion and completeness do the work.',
  visual: {
    type: 'calc-series',
    title: 'Crowding together, with and without a target',
    lead: t`Each preset is a sequence. Shrink $\varepsilon$: the readout gives the index after which every drawn term stays inside the green band around the limit. The first three crowd together for every $\varepsilon$; the last never does.`,
    tasks: [
      t`Newton’s rationals for $\sqrt2$: every term is a fraction ($1$, $\tfrac32$, $\tfrac{17}{12}$, $\tfrac{577}{408}$, …), yet at $\varepsilon = 0.001$ they are inside from $n = 4$. Their limit is irrational: in $\mathbb Q$ this Cauchy sequence has nothing to converge to.`,
      t`The decimal truncations $1$, $1.4$, $1.41$, … are fractions too, and also Cauchy. Two different rational routes to the same hole.`,
      t`$(-1)^n + 1/n$ has no limit drawn: its terms keep jumping by about $2$, so no $\varepsilon$ below $2$ can be met. It is not Cauchy, and no completion would help.`,
    ],
    params: {
      view: 'terms', eps: 'eps',
      N: { min: 1, max: 30, value: 12, explain: 'How many terms are computed and drawn.' },
      sliders: [{ key: 'eps', label: t`Tolerance $\varepsilon$`, min: 0.001, max: 0.5, step: 0.001, value: 0.05, logScale: true, explain: t`The half-width of the band around the limit.` }],
      presets: [
        { label: 'Newton for √2', term: null, rec: 'a/2 + 1/a', a1: 1, limit: 'sqrt(2)', y: [0.9, 1.6] },
        { label: 'decimals of √2', term: 'floor(10^(n - 1)*sqrt(2))/10^(n - 1)', limit: 'sqrt(2)', y: [0.9, 1.6] },
        { label: '(1 + 1/n)ⁿ', term: '(1 + 1/n)^n', limit: 'e', y: [1.9, 2.8] },
        { label: '(−1)ⁿ + 1/n', term: '(-1)^n + 1/n', limit: null, y: [-1.3, 1.8] },
      ],
    },
    caption: t`Only finitely many terms can be drawn, so the readout checks the drawn ones; the proofs cover the rest. The decimal truncations are computed in floating point, which is exact enough for the 30 terms shown.`,
  },
  example: {
    prompt: t`Newton’s method for $x^2 = 2$ gives $a_1 = 1$, $a_{n+1} = \dfrac{a_n}{2} + \dfrac{1}{a_n}$. Show that every term is rational, that $a_n^2 \to 2$, and conclude that $\mathbb Q$ is not complete.`,
    visual: {
      type: 'graph',
      params: {
        x: [0.95, 1.55], y: [-0.5, 0.5], aspect: 'wide', yticks: 0, ylabel: '', xlabel: 'the number line',
        points: [
          ...newton(4).map((v, i) => ({ x: +v.toFixed(8), y: 0, r: 5, color: 'gold', label: ['1', '3/2', '17/12', '577/408'][i], labelDx: [-4, -8, -46, 8][i], labelDy: -16 })),
          { x: +SQ2.toFixed(8), y: 0, r: 7, hollow: true, color: 'bad', label: 'the hole at √2', labelDx: -46, labelDy: 26 },
        ],
      },
      caption: t`The first four terms on the number line. The third and fourth differ by $0.0025$; the fourth is within $2.2\times10^{-6}$ of $\sqrt2$, too close to separate at this scale.`,
    },
    steps: [
      { label: 'Every term is rational', text: t`By induction: $a_1 = 1$ is rational, and if $a_n$ is a nonzero rational then $\frac{a_n}{2} + \frac1{a_n}$ is rational too. The terms are $1,\ \tfrac32,\ \tfrac{17}{12},\ \tfrac{577}{408},\ \dots$` },
      { label: 'Track the error', text: t`Algebra gives $a_{n+1}^2 - 2 = \left(\dfrac{a_n^2 - 2}{2a_n}\right)^2$. So $|a_n^2 - 2|$ runs $1,\ \tfrac14,\ \tfrac1{144},\ \tfrac{1}{166{,}464}$: each error is about the square of the last. And $a_n^2 - 2 \ge 0$ from $n = 2$ on, so $a_n \ge \sqrt2$ there.` },
      { label: 'It is Cauchy', text: t`From $n = 2$ on, $a_n^2 \ge 2$, so $a_{n+1} - a_n = \dfrac{2 - a_n^2}{2a_n} \le 0$: the terms decrease. For $m, n \ge N \ge 2$ both lie between $2/a_N$ and $a_N$ (because $a_m a_N \ge a_m^2 \ge 2$). Hence $|a_m - a_n| \le a_N - \dfrac{2}{a_N} = \dfrac{a_N^2 - 2}{a_N} \to 0$ — Cauchy, proved with fractions alone.` },
      { label: 'No rational limit', text: t`Suppose $a_n \to q$ with $q$ rational. Then $a_n^2 \to q^2$, and also $a_n^2 \to 2$, so $q^2 = 2$. But no rational squares to $2$. So this Cauchy sequence of rationals has no limit in $\mathbb Q$: **$\mathbb Q$ is incomplete.**` },
      { label: 'Sense check', text: t`$\tfrac{577}{408} = ${nice(577 / 408, 8)}$ against $\sqrt2 = ${nice(SQ2, 8)}$: they agree to six figures. In $\mathbb R$ the same sequence converges, to $\sqrt2$ — completeness is precisely the promise that such holes are filled.` },
    ],
    answer: t`Newton’s fractions are a Cauchy sequence in $\mathbb Q$ whose square tends to $2$; a rational limit $q$ would need $q^2 = 2$. So $\mathbb Q$ is not complete, and $\mathbb R$ — where the limit $\sqrt2$ exists — is.`,
  },
  practice: [
    num({
      id: 'find-N', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5), c = r.int(1, 4), b = r.intExcept(-3, 6, [k * c]);
        const d = Math.abs(b - k * c), q = r.pick([100, 1000, 50]);
        const ans = d * q - c + 1;
        const vals = Array.from({ length: 30 }, (_, i) => ((k * (i + 1) + b) / (i + 1 + c)));
        return {
          prompt: t`$a_n = \dfrac{${k}n ${b < 0 ? '-' : '+'} ${Math.abs(b)}}{n + ${c}}$ converges to $${k}$. For $\varepsilon = ${nice(1 / q)}$, what is the **smallest** $N$ such that $|a_n - ${k}| < \varepsilon$ for every $n \ge N$?`,
          visual: seqPlot({ vals, limit: k, y: [Math.min(...vals, k) - 0.3, Math.max(...vals, k) + 0.3], caption: t`The first 30 terms and the limit $${k}$. The required $N$ lies far beyond the picture: a picture shows a trend, the inequality settles it.` }),
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: ans - 1, feedback: t`At $n = ${ans - 1}$ the gap is exactly $\frac{${d}}{${ans - 1 + c}} = ${nice(1 / q)}$, which is not *less* than $\varepsilon$.` }, { value: d * q, feedback: t`Close: you need $n + ${c} > ${d * q}$, so subtract the $${c}$ and step past equality.` }].filter((e) => e.value !== ans),
          hints: [t`$a_n - ${k} = \dfrac{${k}n ${b < 0 ? '-' : '+'} ${Math.abs(b)} - ${k}(n + ${c})}{n + ${c}} = \dfrac{${b - k * c}}{n + ${c}}$.`, t`You need $\dfrac{${d}}{n + ${c}} < ${nice(1 / q)}$, i.e. $n + ${c} > ${d * q}$.`],
          teach: t`To find $N$, simplify $|a_n - L|$ to something that visibly decreases in $n$, then solve the inequality — strictly.`,
          explain: t`$|a_n - ${k}| = \dfrac{${d}}{n + ${c}} < ${nice(1 / q)}$ exactly when $n > ${d * q - c}$, so $N = ${ans}$. Because the gap decreases with $n$, every later term passes too.`,
        };
      },
    }),
    multi({
      id: 'which-cauchy', difficulty: 2,
      prompt: t`Which sequences are Cauchy? Select **every** one.`,
      visual: {
        type: 'graph',
        params: { x: [0, 41], y: [0, 7], aspect: 'wide', xlabel: 'n', ylabel: '', curves: [{ fn: 'sqrt(x)', color: 'gold', width: 1.4, dash: true, domain: [1, 41], label: '√n', labelAt: 36, labelDy: -8 }], points: (() => { let s = 0; return Array.from({ length: 40 }, (_, i) => { s += 1 / (i + 1); return { x: i + 1, y: +s.toFixed(6), r: 3.2, color: 'accent' }; }); })(), legend: [{ label: 'partial sums of Σ 1/k', color: 'accent', point: true }, { label: '√n', color: 'gold', dash: true }], legendAt: 'br' },
        caption: t`Two sequences whose steps shrink to zero: the harmonic partial sums $1 + \tfrac12 + \dots + \tfrac1n$ (dots) and $\sqrt n$ (dashed). Both keep climbing.`,
      },
      choices: [t`$a_n = 1/n$`, t`$a_n = (-1)^n$`, t`$a_n = \sum_{k=1}^{n} 1/k^2$`, t`$a_n = \sqrt n$`, t`$a_n = \sum_{k=1}^{n} 1/k$`, t`$a_n$ = $\pi$ truncated to $n$ decimal places`],
      answer: [0, 2, 5],
      why: {
        1: t`Its terms are $2$ apart forever: no $\varepsilon < 2$ can be met.`,
        3: t`$\sqrt{n+1} - \sqrt n \to 0$, but $\sqrt{4n} - \sqrt n = \sqrt n$ grows: terms far apart are far apart. Small steps are not enough.`,
        4: t`Each step $\tfrac1{n+1}$ shrinks, but the sums grow without bound (like $\ln n$): $a_{2n} - a_n \ge \tfrac12$ always.`,
      },
      hints: [t`Cauchy is about **any** two late terms, $a_m$ and $a_n$ with $m$ much bigger than $n$, not just neighbours.`, t`For the harmonic sums, compare $a_{2n}$ with $a_n$: there are $n$ terms each at least $\tfrac1{2n}$.`],
      teach: t`A Cauchy sequence needs $|a_m - a_n|$ small for all late $m, n$; consecutive differences tending to $0$ is not enough — $\sqrt n$ and the harmonic sums are the classic warnings.`,
      explain: t`$1/n$, the $\sum 1/k^2$ sums (bounded and increasing) and the truncations of $\pi$ (within $10^{-n}$ of each other beyond $n$) are Cauchy. $(-1)^n$, $\sqrt n$ and the harmonic sums are not; the last two fool a test that only compares neighbours.`,
    }),
    num({
      id: 'newton-c', difficulty: 2,
      gen(r) {
        const [c, a1] = r.pick([[3, 2], [5, 2], [7, 3], [6, 2]]);
        const a2 = (a1 + c / a1) / 2, a3 = (a2 + c / a2) / 2;
        return {
          prompt: t`Newton’s method for $\sqrt{${c}}$: $a_1 = ${a1}$, $a_{n+1} = \tfrac12\left(a_n + \dfrac{${c}}{a_n}\right)$. Every term is a fraction. Compute $a_3$ to **seven** significant figures.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: null, rec: `(a + ${c}/a)/2`, a1, N: 5, limit: `sqrt(${c})`, readout: false }, caption: t`The first five Newton iterates for $\sqrt{${c}}$. After two steps the dots sit on the limit line at this scale.` },
          answer: a3, tol: { rel: 2e-7 },
          errors: [{ value: Math.sqrt(c), feedback: t`That is $\sqrt{${c}}$, the limit, which no term reaches. Compute $a_3$ itself: $a_2 = ${nice(a2, 6)}$, then one more step.` }, { value: a2, feedback: t`That is $a_2$. Apply the recursion once more.` }],
          hints: [t`$a_2 = \tfrac12\left(${a1} + \tfrac{${c}}{${a1}}\right) = ${nice(a2, 6)}$.`, t`$a_3 = \tfrac12\left(a_2 + \tfrac{${c}}{a_2}\right)$.`],
          teach: t`Newton’s rationals approach $\sqrt c$ with the error roughly squaring each step, but stay rational — never equal to an irrational limit.`,
          explain: t`$a_3 = ${nice(a3, 8)}$, and $a_3^2 - ${c} = ${tex(a3 * a3 - c, 3)}$: close, never zero. The limit $\sqrt{${c}} = ${nice(Math.sqrt(c), 8)}$ is irrational, outside $\mathbb Q$.`,
        };
      },
    }),
    mcq({
      id: 'why-incomplete', difficulty: 2,
      prompt: t`What, exactly, does Newton’s sequence $1, \tfrac32, \tfrac{17}{12}, \tfrac{577}{408}, \dots$ show about $\mathbb Q$?`,
      visual: {
        type: 'graph',
        params: { x: [1.405, 1.425], y: [-0.5, 0.5], aspect: 'wide', yticks: 0, ylabel: '', xlabel: 'zoomed number line', points: [{ x: +(17 / 12).toFixed(8), y: 0, r: 5, color: 'gold', label: '17/12', labelDx: 8, labelDy: -14 }, { x: +(577 / 408).toFixed(10), y: 0, r: 5, color: 'gold', label: '577/408 and later', labelDx: -124, labelDy: -16 }, { x: +SQ2.toFixed(10), y: 0, r: 7, hollow: true, color: 'bad', label: '√2', labelDx: 6, labelDy: 24 }] },
        caption: t`Zoomed to $[1.405, 1.425]$: from the fourth term on, the fractions are indistinguishable from the hole at $\sqrt2$.`,
      },
      choices: [t`It is a Cauchy sequence in $\mathbb Q$ with no limit in $\mathbb Q$`, t`Its terms are irrational`, t`It does not converge in $\mathbb R$`, t`It is not a Cauchy sequence`],
      answer: 0,
      why: {
        1: t`Every term is a fraction; that is the point.`,
        2: t`In $\mathbb R$ it converges, to $\sqrt2$. Completeness of $\mathbb R$ guarantees a limit there.`,
        3: t`It is Cauchy: its terms crowd together faster and faster, as the zoom shows.`,
      },
      hints: [t`Completeness means: every Cauchy sequence in the space has a limit **in the space**.`],
      teach: t`A space is complete when every Cauchy sequence in it converges to a point of the same space; one rational Cauchy sequence with an irrational limit shows $\mathbb Q$ is not.`,
      explain: t`The terms are rational and Cauchy, and their only possible limit is $\sqrt2 \notin \mathbb Q$. So $\mathbb Q$ has a hole; $\mathbb R$ is $\mathbb Q$ with all such holes filled.`,
    }),
    order({
      id: 'convergent-cauchy', difficulty: 3,
      prompt: t`Prove: **every convergent sequence is Cauchy.** Suppose $a_n \to L$. Put the steps in order.`,
      visual: {
        type: 'graph',
        params: { x: [0, 21], y: [0.4, 1.6], aspect: 'wide', xlabel: 'n', ylabel: 'aₙ', shade: [{ fn: '1.15', lower: '0.85', from: 0, to: 21, color: 'good', alpha: 0.16 }], hlines: [{ y: 1, color: 'good', label: 'L' }], vlines: [{ x: 6, color: 'ink3', label: 'N' }], points: Array.from({ length: 20 }, (_, i) => { const n = i + 1; return { x: n, y: +(1 + 0.9 * (-1) ** n / n).toFixed(5), r: 4, color: n >= 6 ? 'accent' : 'ink4' }; }) },
        caption: t`A band of half-width $\varepsilon/2$ (here $\varepsilon = 0.3$) around $L$: beyond $N$ every term is inside, so any two of them are within $\varepsilon$ of each other.`,
      },
      items: [
        t`Let $\varepsilon > 0$.`,
        t`Since $a_n \to L$, choose $N$ with $|a_n - L| < \varepsilon/2$ for all $n \ge N$.`,
        t`Take any $m, n \ge N$.`,
        t`$|a_m - a_n| \le |a_m - L| + |L - a_n| < \tfrac\varepsilon2 + \tfrac\varepsilon2 = \varepsilon$.`,
      ],
      hints: ['The challenge ε comes first.', 'Ask the convergence for ε/2, then use the triangle inequality through L.'],
      teach: t`Convergent implies Cauchy by the triangle inequality through the limit; the converse is not a theorem but a property of the space — completeness.`,
      explain: t`Both terms are within $\varepsilon/2$ of $L$, so within $\varepsilon$ of each other. The proof needs $L$ to exist; going back from Cauchy to convergent needs completeness instead.`,
    }),
    num({
      id: 'sup-irrational', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 5, 7, 10]);
        return {
          prompt: t`The set $S = \{x \in \mathbb Q:\ x > 0,\ x^2 < ${c}\}$ is bounded above (by $${Math.ceil(Math.sqrt(c))}$, say). In $\mathbb R$ it has a **least** upper bound, $\sup S$. What is it? Give three decimals.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 12], aspect: 'wide', xlabel: 'x', ylabel: 'x²', curves: [{ fn: 'x^2', color: 'accent', width: 2 }], hlines: [{ y: c, color: 'gold', label: `y = ${c}` }], shade: [{ fn: '0.35', lower: '0', from: 0, to: +Math.sqrt(c).toFixed(6), color: 'gold', alpha: 0.4 }] }, caption: t`The positive $x$ with $x^2 < ${c}$ (the strip on the axis). The set $S$ keeps only its rational points.` },
          answer: Math.sqrt(c), tol: { rel: 0.0005 },
          errors: [{ value: c, feedback: t`$${c}$ bounds $x^2$, not $x$. The edge of the set is where $x^2 = ${c}$.` }, { value: Math.ceil(Math.sqrt(c)), feedback: t`$${Math.ceil(Math.sqrt(c))}$ is an upper bound, but not the least one: anything above $\sqrt{${c}}$ also works.` }],
          hints: [t`Every $x$ in $S$ has $x < \sqrt{${c}}$, and rationals come arbitrarily close to $\sqrt{${c}}$ from below.`],
          teach: t`The least-upper-bound property is another face of completeness: in $\mathbb R$ every bounded set has a supremum, but in $\mathbb Q$ this one has none, because $\sqrt{${c}}$ is irrational.`,
          explain: t`$\sup S = \sqrt{${c}} = ${nice(Math.sqrt(c), 6)}$. It is an upper bound, and nothing smaller is, since rationals squeeze in below it. Being irrational, it is not in $\mathbb Q$: inside $\mathbb Q$ the set has upper bounds but no least one.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-nr-convergence', difficulty: 3, transfer: true,
      prompt: t`A numerical-relativity code simulates a black-hole merger at grid spacings $h$, $h/2$, $h/4$, $h/8$ and reports the gravitational-wave phase at merger. Successive results differ by $0.08$, $0.02$ and $0.005$ rad. Nobody knows the exact phase. What can be concluded, and on what grounds?`,
      visual: { type: 'graph', params: { x: [0.5, 3.5], y: [-3, -0.5], ylog: true, aspect: 'wide', xlabel: 'refinement step', ylabel: 'difference (rad)', xticks: 3, points: [[1, 0.08], [2, 0.02], [3, 0.005]].map(([x, v]) => ({ x, y: +Math.log10(v).toFixed(5), r: 5, color: 'gold', label: String(v), labelDx: 8 })) }, caption: t`The differences between successive resolutions on a logarithmic scale: each is a quarter of the last, as a second-order method should give. The numbers are illustrative.` },
      choices: [t`The results form (to all appearances) a Cauchy sequence, so — $\mathbb R$ being complete — they converge to some phase, and the remaining error is about the size of the last differences`, t`Nothing: without the exact phase, convergence cannot be judged`, t`The finest result is exact, because the differences are small`, t`The results converge to $0$, because the differences go to $0$`],
      answer: 0,
      why: {
        1: t`The Cauchy criterion exists precisely to judge convergence without the limit.`,
        2: t`The next refinement would still change it, by about $0.00125$ rad; the error shrinks, it does not vanish.`,
        3: t`The *differences* go to $0$; the results themselves approach some nonzero phase.`,
      },
      hints: [t`Which definition of convergence does not mention the limit?`, t`If each difference is a quarter of the last, the later ones sum to about a third of the last one.`],
      teach: t`The Cauchy criterion turns “does my computation converge?” into a test that never needs the answer — the basis of convergence testing in numerical relativity.`,
      explain: t`Differences falling by four each step make the sequence Cauchy-like; completeness supplies the limit. Summing the remaining geometric tail, $0.005\,(\tfrac14 + \tfrac1{16} + \dots) \approx 0.0017$ rad, estimates the finest run’s error.`,
    }),
    num({
      id: 'cp-bounce', difficulty: 2, transfer: true,
      gen(r) {
        const rr = r.pick([0.6, 0.7, 0.8, 0.9]), h0 = r.pick([1, 2, 5]), [thr, thrT] = r.pick([[0.01, '1 cm'], [0.001, '1 mm']]);
        const N = Math.floor(Math.log(thr / h0) / Math.log(rr)) + 1;
        const vals = Array.from({ length: Math.min(N + 3, 40) }, (_, i) => h0 * rr ** (i + 1));
        return {
          prompt: t`A test mass dropped from $${h0}$ m onto a hard plate rebounds to $${rr}$ of its previous height each time: the $n$-th rebound reaches $h_n = ${h0}\times${rr}^n$ m. What is the **smallest** $N$ such that every rebound $h_n$ with $n \ge N$ is below ${thrT}?`,
          visual: seqPlot({ vals, y: [0, h0 * rr * 1.15], caption: t`Rebound heights $h_n$ against $n$, each $${rr}$ of the last. A real ball’s restitution varies with speed; the model keeps it fixed.`, color: 'gold', ylabel: 'hₙ (m)' }),
          answer: N, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: N - 1, feedback: t`$h_{${N - 1}} = ${tex(h0 * rr ** (N - 1), 3)}$ m is not below ${thrT} yet.` }],
          hints: [t`$h_n$ decreases, so find the first $n$ with $${h0}\times${rr}^n < ${thr}$; all later ones follow.`, t`$n > \dfrac{\ln(${thr}/${h0})}{\ln ${rr}} = ${nice(Math.log(thr / h0) / Math.log(rr), 4)}$.`],
          teach: t`For a decreasing sequence, the first index inside the band is the $N$ of the definition: every later term is inside too.`,
          explain: t`$h_{${N}} = ${tex(h0 * rr ** N, 3)}$ m $<$ ${thrT}, while $h_{${N - 1}} = ${tex(h0 * rr ** (N - 1), 3)}$ m is not. Since the heights decrease, $N = ${N}$ works for every later $n$ — the $\exists N\ \forall n \ge N$ of the definition, with $\varepsilon$ = ${thrT}.`,
        };
      },
    }),
    mcq({
      id: 'cp-not-cauchy', difficulty: 3,
      prompt: t`Which statement says that a sequence $a_n$ is **not** Cauchy?`,
      visual: seqPlot({ vals: Array.from({ length: 20 }, (_, i) => (-1) ** (i + 1) + 1 / (i + 1)), y: [-1.4, 2.2], caption: t`$a_n = (-1)^n + 1/n$: however late you start, two terms more than $1$ apart (one high, one low) are still to come.` }),
      choices: [t`$\exists\varepsilon > 0\ \forall N\ \exists m, n \ge N:\ |a_m - a_n| \ge \varepsilon$`, t`$\forall\varepsilon > 0\ \forall N\ \exists m, n \ge N:\ |a_m - a_n| \ge \varepsilon$`, t`$\exists\varepsilon > 0\ \exists N\ \forall m, n \ge N:\ |a_m - a_n| \ge \varepsilon$`, t`$\exists\varepsilon > 0\ \forall N\ \exists n \ge N:\ |a_{n+1} - a_n| \ge \varepsilon$`],
      answer: 0,
      why: {
        1: t`That says *every* tolerance fails, which is impossible: with $m = n$ the gap is $0$, never $\ge \varepsilon$.`,
        2: t`Too strong, and impossible: with $m = n$ the gap is $0$.`,
        3: t`That only says neighbours stay apart. A sequence like $\sqrt n$ has small neighbour steps and is still not Cauchy.`,
      },
      hints: ['Flip every quantifier: ∀ε → ∃ε, ∃N → ∀N, ∀m, n → ∃m, n.', 'Then negate the inequality.'],
      teach: t`Not Cauchy: one tolerance $\varepsilon$ such that, however far out you start, some two terms are still $\varepsilon$ apart.`,
      explain: t`Negating $\forall\varepsilon\ \exists N\ \forall m, n \ge N:\ |a_m - a_n| < \varepsilon$ gives $\exists\varepsilon\ \forall N\ \exists m, n \ge N:\ |a_m - a_n| \ge \varepsilon$. For $(-1)^n + 1/n$, $\varepsilon = 1$ works.`,
    }),
  ],
  sources: [
    { label: 'Abbott, Understanding Analysis, 2nd ed. (Springer, 2015), §§1.4, 2.2–2.6', url: 'https://doi.org/10.1007/978-1-4939-2712-8' },
    { label: 'Lebl, Basic Analysis I, §§1.2, 2.1–2.4 (free online)', url: 'https://www.jirka.org/ra/' },
    { label: 'Baumgarte & Shapiro, Numerical Relativity (Cambridge, 2010): convergence testing', url: 'https://doi.org/10.1017/CBO9781139193344' },
  ],
});
