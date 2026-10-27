// Alternating series: the alternating series test and its error bound.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';

const t = String.raw;
const fact = (n) => { let p = 1; for (let k = 2; k <= n; k++) p *= k; return p; };
const altSum = (b, N) => { let s = 0; for (let n = 1; n <= N; n++) s += (-1) ** (n + 1) * b(n); return s; };

export default lesson({
  id: 'math1220.C2-4.7',
  title: 'Alternating series and their error',
  minutes: 12, difficulty: 3,
  intro: t`When the signs alternate, each term partly undoes the one before, and the partial sums zig-zag. If the steps shrink steadily to zero, the zig-zag closes in on a limit — the **alternating series test** (Leibniz’s test) — and the sum is always trapped between two consecutive partial sums:

$$\sum_{n=1}^{\infty}(-1)^{n+1}b_n \text{ converges when } b_{n+1} \le b_n \text{ and } b_n \to 0, \quad\text{and then}\quad |S - S_N| \le b_{N+1}$$

That error bound is the most practical result in this module: the error of stopping after $N$ terms is no bigger than the first term you leave out, and has its sign. It tells you when you can stop summing a series such as the one for $\sin x$, and it explains why $1 - \frac12 + \frac13 - \cdots$ converges even though $1 + \frac12 + \frac13 + \cdots$ does not.`,
  symbols: [
    { tex: t`b_n`, text: 'the size of the $n$-th term, positive; the test needs it **decreasing** and **tending to 0**' },
    { tex: t`(-1)^{n+1}`, text: 'the alternating sign: $+, -, +, -, \\dots$ (with $(-1)^n$ the series starts with a minus; the test is the same)' },
    { tex: t`S_N`, text: 'the partial sum after $N$ terms' },
    { tex: t`S`, text: 'the sum of the series, which lies between $S_N$ and $S_{N+1}$ for every $N$' },
    { tex: t`b_{N+1}`, text: 'the first term left out: a bound on the error $|S - S_N|$, and the error has its sign' },
  ],
  why: t`Many series you will meet in physics — the Taylor series of $\sin x$ and $\cos x$, Fourier series, the energy of an ionic crystal — alternate, and this bound tells you how many terms an answer needs.`,
  visual: {
    type: 'calc-series',
    title: 'The zig-zag and its error band',
    lead: t`Blue dots are the partial sums. Each one overshoots the sum and the next pulls back. The gold band runs from $S_N$ to $S_{N+1}$, and the sum (green line) must lie inside it — so its height, $b_{N+1}$, bounds the error.`,
    tasks: [
      'Slide N: the gold band always contains the green line, and narrows as the terms shrink.',
      t`Compare the readouts: the true error $|S - S_N|$ always comes out smaller than the bound, the first term left out.`,
      'Leibniz’s series for π/4 crawls (error about 1/(2N)); the 1/n! series is done in a handful of terms; n/(n+1) never settles, because its terms do not go to 0.',
    ],
    params: {
      view: 'sums', bound: 'alt', showTerms: false,
      N: { min: 1, max: 40, value: 6, label: 'Terms added $N$' },
      presetLabel: 'Series',
      presets: [
        { label: '(−1)ⁿ⁺¹/n', term: '(-1)^(n+1)/n', limit: 'ln(2)', limitLabel: 'ln 2', y: [0.4, 1.05] },
        { label: 'Leibniz', term: '4*(-1)^(n+1)/(2n - 1)', limit: 'pi', limitLabel: 'π', y: [2.5, 4.1] },
        { label: '(−1)ⁿ⁺¹/n²', term: '(-1)^(n+1)/n^2', limit: 'pi^2/12', limitLabel: 'π²/12', y: [0.7, 1.03] },
        { label: '(−1)ⁿ⁺¹/n!', term: '(-1)^(n+1)/n!', limit: '1 - exp(-1)', limitLabel: '1 − 1/e', y: [0.45, 1.03] },
        { label: '(−1)ⁿ⁺¹ n/(n+1)', term: '(-1)^(n+1)*n/(n + 1)', limit: null, y: [-0.6, 1.2] },
      ],
    },
    caption: t`The Leibniz series is shown times 4, so it approaches $\pi$: $4\left(1 - \frac13 + \frac15 - \cdots\right) = \pi$. The band is drawn between two partial sums that are computed exactly; the sums marked by the green lines are known results ($\ln 2$, $\pi$, $\pi^2/12$, $1 - 1/e$).`,
  },
  example: {
    prompt: t`How many terms of $\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n^2}$ guarantee an error below $0.001$? Find that partial sum and compare it with the exact sum $\frac{\pi^2}{12}$.`,
    visual: { type: 'calc-series', params: { view: 'sums', bound: 'alt', showTerms: false, term: '(-1)^(n+1)/n^2', limit: 'pi^2/12', limitLabel: 'π²/12', N: { min: 1, max: 40, value: 31 }, y: [0.8, 0.85] }, caption: 'Zoomed in near the sum: at N = 31 the band is less than 0.001 high.' },
    steps: [
      { label: 'Check the test', text: t`$b_n = \frac{1}{n^2}$ is positive, decreasing and tends to 0, so the series converges and $|S - S_N| \le b_{N+1} = \frac{1}{(N + 1)^2}$.` },
      { label: 'Solve for N', text: t`$\frac{1}{(N + 1)^2} < 0.001 \iff (N + 1)^2 > 1000 \iff N + 1 \ge 32$, since $31^2 = 961$ and $32^2 = 1024$. So $N = 31$.` },
      { label: 'Compute', text: t`$S_{31} = 1 - \frac14 + \frac19 - \cdots + \frac{1}{961} \approx ${fmt(altSum((n) => 1 / n ** 2, 31), 6)}$.` },
      { label: 'Sign of the error', text: t`The first term left out, $-\frac{1}{1024}$, is negative, so $S_{31}$ is an **over**-estimate: $\;${fmt(altSum((n) => 1 / n ** 2, 31) - 1 / 1024, 6)} \le S \le ${fmt(altSum((n) => 1 / n ** 2, 31), 6)}$.` },
      { label: 'Compare', text: t`$\frac{\pi^2}{12} \approx ${fmt(Math.PI ** 2 / 12, 6)}$: the actual error is $${fmt(altSum((n) => 1 / n ** 2, 31) - Math.PI ** 2 / 12, 2)}$, about half the bound — typical, because the sum sits near the middle of the band.` },
    ],
    answer: t`$N = 31$ terms; $S_{31} \approx ${fmt(altSum((n) => 1 / n ** 2, 31), 5)}$, within $0.001$ of (and just above) $\pi^2/12 \approx ${fmt(Math.PI ** 2 / 12, 5)}$.`,
  },
  practice: [
    mcq({
      id: 'conditions', difficulty: 1,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, term: '(-1)^(n+1)/n', limit: 'ln(2)', limitLabel: 'ln 2', compare: { term: '(-1)^(n+1)*(1 + 1/n)', label: 'sizes 1 + 1/n: decreasing, but not to 0' }, N: 30, y: [0, 2.2] }, caption: 'Blue: sizes 1/n, decreasing to 0 — the partial sums settle. Dashed: sizes 1 + 1/n, also decreasing, but towards 1 — the partial sums never settle.' },
      prompt: t`What does the alternating series test require of $b_n$ in $\sum (-1)^{n+1} b_n$?`,
      choices: [t`$b_n > 0$, $b_n$ decreasing, and $b_n \to 0$`, t`Only $b_n \to 0$`, t`That $\sum b_n$ converges`, t`Only that $b_n$ is decreasing`],
      answer: 0,
      why: {
        1: 'Shrinking to 0 matters, but the test also needs the terms to shrink steadily (decreasing) so that each overshoot is smaller than the last.',
        2: t`If $\sum b_n$ converged you would not need the test at all: that is absolute convergence. The test works even when $\sum b_n$ diverges, as for $\frac1n$.`,
        3: t`Decreasing to what? $b_n = 1 + \frac1n$ decreases but tends to 1, and that series diverges.`,
      },
      hints: ['Two conditions on the sizes of the terms, besides being positive.'],
      teach: 'The alternating series test needs the sizes of the terms to decrease and to tend to 0.',
      explain: t`With $b_n$ positive, decreasing and tending to 0, each partial sum overshoots the last by less, and the zig-zag closes in on a limit.`,
    }),
    multi({
      id: 'which-converge', difficulty: 2,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, N: { min: 5, max: 60, value: 40 }, presetLabel: 'Series', presets: [{ label: '(−1)ⁿ/√n', term: '(-1)^n/sqrt(n)' }, { label: '(−1)ⁿ n/(n+1)', term: '(-1)^n*n/(n + 1)' }, { label: '(−1)ⁿ/ln n', term: '(-1)^n/ln(n)', n0: 2 }, { label: '(−1)ⁿ(1 + 1/n)', term: '(-1)^n*(1 + 1/n)' }, { label: '(−1)ⁿ/n³', term: '(-1)^n/n^3' }] }, caption: 'The partial sums of each series: a zig-zag that narrows, or one that does not.' },
      prompt: 'Which of these series converge? Select all that do.',
      choices: [t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{\sqrt n}$`, t`$\displaystyle\sum_{n=1}^\infty (-1)^n\frac{n}{n + 1}$`, t`$\displaystyle\sum_{n=2}^\infty \frac{(-1)^n}{\ln n}$`, t`$\displaystyle\sum_{n=1}^\infty (-1)^n\left(1 + \frac1n\right)$`, t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{n^3}$`],
      answer: [0, 2, 4],
      why: {
        1: t`$\frac{n}{n+1} \to 1$, so the terms swing towards $\pm1$: the divergence test says it diverges.`,
        3: t`$1 + \frac1n \to 1$, not 0: the terms do not shrink to zero, so it diverges.`,
      },
      hints: ['For each, look at the size bₙ (without the sign): does it decrease to 0?'],
      teach: 'Alternating signs help only when the sizes of the terms shrink to zero.',
      explain: t`$\frac{1}{\sqrt n}$, $\frac{1}{\ln n}$ and $\frac{1}{n^3}$ all decrease to 0, so those series converge by the alternating series test (even the first two, whose absolute series diverge). The other two have terms that do not go to 0.`,
    }),
    num({
      id: 'error-bound', difficulty: 2,
      gen(r) {
        const [lab, b, bT] = r.pick([[1, (n) => 1 / n, t`\frac{1}{n}`], [2, (n) => 1 / n ** 2, t`\frac{1}{n^2}`], [3, (n) => 1 / n ** 3, t`\frac{1}{n^3}`], [4, (n) => 1 / fact(n), t`\frac{1}{n!}`]]);
        const N = lab === 4 ? r.pick([4, 5, 6]) : r.pick([4, 9, 19]);
        const bound = b(N + 1);
        return {
          prompt: t`You approximate $\displaystyle\sum_{n=1}^\infty (-1)^{n+1}${bT}$ by its partial sum $S_{${N}}$. What is the alternating-series bound on the error $|S - S_{${N}}|$?`,
          answer: bound, tol: { rel: 1e-3 },
          errors: [{ value: b(N), feedback: t`$b_{${N}}$ is the last term you **kept**. The bound is the first term you left out, $b_{${N + 1}}$.` }],
          hints: [t`The error is at most the size of the first omitted term, $b_{N+1}$.`, t`Here that is $b_{${N + 1}}$.`],
          teach: 'For an alternating series that passes the test, the error after N terms is at most the next term’s size.',
          explain: t`$|S - S_{${N}}| \le b_{${N + 1}} = ${tex(bound, 3)}$.`,
          visual: { type: 'graph', params: { x: [0, N + 5], y: [Math.floor(Math.log10(b(N + 4))) - 0.5, 0.4], xlabel: 'n', ylabel: 'log₁₀ bₙ', points: [...Array.from({ length: N }, (_, j) => ({ x: j + 1, y: Math.log10(b(j + 1)), color: 'accent' })), ...Array.from({ length: 4 }, (_, j) => ({ x: N + 1 + j, y: Math.log10(b(N + 1 + j)), color: 'gold', label: j === 0 ? 'first term left out' : undefined }))] }, caption: t`The sizes $b_n$ on a logarithmic scale: blue, the ${N} terms kept; gold, the terms left out.` },
        };
      },
    }),
    num({
      id: 'terms-needed', difficulty: 3,
      gen(r) {
        const C = r.pick([
          { bT: t`\frac{1}{n^2}`, b: (n) => 1 / n ** 2, tol: 0.001, tolT: '0.001', lg: '-2*log10(x)' },
          { bT: t`\frac{1}{n^3}`, b: (n) => 1 / n ** 3, tol: 1e-4, tolT: t`10^{-4}`, lg: '-3*log10(x)' },
          { bT: t`\frac{1}{n!}`, b: (n) => 1 / fact(n), tol: 1e-6, tolT: t`10^{-6}`, lg: '-log10(gamma(x + 1))' },
          { bT: t`\frac{1}{2n - 1}`, b: (n) => 1 / (2 * n - 1), tol: 0.001, tolT: '0.001', lg: '-log10(2x - 1)' },
        ]);
        let N = 0;
        while (!(C.b(N + 1) < C.tol)) N++;
        return {
          prompt: t`What is the smallest $N$ for which the alternating series bound guarantees $|S - S_N| < ${C.tolT}$, for $\displaystyle\sum_{n=1}^\infty (-1)^{n+1}${C.bT}$?`,
          answer: N, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: N + 1, feedback: t`That makes $b_N$ small enough, but the bound uses $b_{N+1}$ — one term fewer suffices.` }, { value: N - 1, feedback: t`Check it: $b_{N+1}$ is still at least ${C.tol} there.` }],
          hints: [t`You need $b_{N+1} < ${C.tolT}$.`, 'Solve for N + 1 first, then subtract 1.'],
          teach: 'To reach a tolerance, find the first index whose term is below it — then stop one term before it.',
          explain: t`$b_{${N + 1}} = ${tex(C.b(N + 1), 3)} < ${C.tolT}$ but $b_{${N}} = ${tex(C.b(N), 3)}$ is not, so $N = ${N}$ terms are needed.`,
          visual: { type: 'graph', params: { x: [1, Math.ceil(1.6 * (N + 1))], y: [Math.floor(Math.log10(C.tol)) - 1, 0.3], xlabel: 'n', ylabel: 'log₁₀ bₙ', curves: [{ fn: C.lg, color: 'accent' }], hlines: [{ y: Math.log10(C.tol), label: 'tolerance', color: 'gold' }] }, caption: t`The size of the $n$-th term on a logarithmic scale. The bound uses the first term left out, $b_{N+1}$.` },
        };
      },
    }),
    mcq({
      id: 'error-sign', difficulty: 3,
      prompt: t`For $1 - \frac12 + \frac13 - \frac14 + \cdots$, the partial sum $S_4 = \frac{7}{12} \approx 0.583$. What does the alternating series bound say about the true sum $S$?`,
      choices: [t`$S$ is larger than $S_4$, by at most $\frac15$`, t`$S$ is smaller than $S_4$, by at most $\frac15$`, t`$S$ is larger than $S_4$, by at most $\frac14$`, t`$S$ is smaller than $S_4$, by at most $\frac14$`],
      answer: 0,
      why: {
        1: t`The first omitted term is $+\frac15$: positive, so the sum is above $S_4$.`,
        2: t`$\frac14$ is the last term **included**. The bound is the first one left out, $\frac15$.`,
        3: t`Both the sign and the size are off: the first omitted term is $+\frac15$.`,
      },
      hints: ['Which term is the first one left out, and what is its sign?', t`The terms after $-\frac14$ are $+\frac15, -\frac16, \dots$ — the sum lies between $S_4$ and $S_5 = S_4 + \frac15$.`],
      teach: 'The error of an alternating partial sum has the sign of the first omitted term and is no larger than it.',
      explain: t`The next term is $+\frac15$, so $S_4 < S < S_5 = S_4 + \frac15 \approx 0.783$. Indeed $S = \ln 2 \approx 0.693$.`,
      visual: { type: 'calc-series', params: { view: 'sums', bound: 'alt', showTerms: false, term: '(-1)^(n+1)/n', limit: 'ln(2)', limitLabel: 'ln 2', N: { min: 1, max: 12, value: 4 }, y: [0.4, 1.05] }, caption: 'The gold band from S₄ to S₅ contains the sum.' },
    }),
    mcq({
      id: 'conditional', difficulty: 2,
      prompt: t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n}$ converges, but $\displaystyle\sum_{n=1}^\infty \frac{1}{n}$ diverges. Such a series is called:`,
      choices: ['conditionally convergent', 'absolutely convergent', 'divergent', 'telescoping'],
      answer: 0,
      why: {
        1: t`Absolute convergence would need $\sum |a_n| = \sum\frac1n$ to converge, and it does not.`,
        2: 'It does converge — to ln 2 — by the alternating series test.',
        3: t`Its terms do not cancel in pairs to collapse the partial sums; it converges by alternating, not by telescoping.`,
      },
      hints: ['The series converges only thanks to its signs.'],
      teach: 'A series that converges while the series of absolute values diverges is conditionally convergent.',
      explain: t`It converges only because of the cancellation between signs. Such sums are fragile: Riemann showed that rearranging the terms of a conditionally convergent series can make it add up to **any** number you like.`,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, term: '(-1)^(n+1)/n', compare: { term: '1/n', label: 'Σ 1/n (absolute values)' }, N: 40, y: [0, 4.5] }, caption: 'The alternating series (blue) settles; the series of absolute values (dashed) does not.' },
    }),
    mcq({
      id: 'not-to-zero', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “$\displaystyle\sum_{n=1}^\infty (-1)^n\frac{n}{2n + 1}$ converges by the alternating series test, because the signs alternate.” What is wrong?`,
      choices: [
        t`The sizes $b_n = \frac{n}{2n+1}$ tend to $\frac12$, not 0, so the series diverges`,
        'Nothing: alternating signs guarantee convergence',
        t`The sizes $\frac{n}{2n+1}$ are increasing, but the series still converges`,
        t`It converges, but to $\frac12$`,
      ],
      answer: 0,
      why: {
        1: t`Alternation is not enough: $1 - 1 + 1 - 1 + \cdots$ alternates and never settles.`,
        2: t`They are increasing (towards $\frac12$), which already breaks the test — and the divergence test then shows the series diverges.`,
        3: t`$\frac12$ is the limit of the sizes of the terms, not a sum. The partial sums keep jumping by about $\frac12$.`,
      },
      hints: ['Check both conditions of the test, not just the alternating signs.', t`What is $\lim_{n\to\infty}\frac{n}{2n + 1}$? Is it 0?`],
      teach: 'Before using the alternating series test, check that the sizes of the terms really go to 0.',
      explain: t`$\frac{n}{2n+1} \to \frac12$, so the terms approach $\pm\frac12$ and the partial sums keep jumping by about $\frac12$. By the divergence test the series diverges.`,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: true, term: '(-1)^n*n/(2n + 1)', N: 30, y: [-0.8, 0.8] }, caption: 'The partial sums keep jumping by about 1/2 and never settle.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bound', difficulty: 2,
      gen(r) {
        const N = r.pick([15, 24, 99]);
        return {
          prompt: t`Using $S_{${N}}$ to approximate $\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{\sqrt n}$, what bound does the alternating series test give on the error?`,
          answer: 1 / Math.sqrt(N + 1), tol: { rel: 1e-3 },
          errors: [{ value: 1 / Math.sqrt(N), feedback: 'That is the last term kept; use the first term left out.' }],
          hints: [t`The bound is $b_{N+1} = \frac{1}{\sqrt{N + 1}}$.`],
          teach: 'Error after N terms ≤ the size of term N + 1.',
          explain: t`$b_{${N + 1}} = \frac{1}{\sqrt{${N + 1}}} = ${nice(1 / Math.sqrt(N + 1))}$ — a series this slow would need about four million terms to guarantee an error below $0.0005$.`,
        };
      },
    }),
    num({
      id: 'cp-sine', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([0.1, 0.2, 0.3, 0.5]);
        const bound = th ** 5 / 120, err = Math.abs(Math.sin(th) - (th - th ** 3 / 6));
        return {
          prompt: t`A guidance computer approximates $\sin\theta$ by $\theta - \frac{\theta^3}{6}$, keeping the first two terms of $\sin\theta = \theta - \dfrac{\theta^3}{3!} + \dfrac{\theta^5}{5!} - \dfrac{\theta^7}{7!} + \cdots$, which for small $\theta > 0$ is an alternating series with decreasing terms. For $\theta = ${th}$ rad, what is the alternating-series bound on the error?`,
          answer: bound, tol: { rel: 0.005 },
          errors: [{ value: th ** 3 / 6, feedback: t`$\frac{\theta^3}{6}$ is a term you kept. The bound is the first term left out, $\frac{\theta^5}{5!}$.` }, { value: th ** 5 / 5, feedback: t`Divide by $5! = 120$, not by 5.` }],
          hints: [t`The first omitted term is $\dfrac{\theta^5}{5!}$.`, t`$5! = 120$; compute $\dfrac{${th}^5}{120}$.`],
          teach: 'The alternating series bound turns a truncated series into a guaranteed accuracy — how small-angle approximations are justified.',
          explain: t`Error $\le \dfrac{${th}^5}{120} = ${tex(bound, 3)}$. The actual error is $${tex(err, 3)}$, just under the bound.`,
          visual: { type: 'graph', params: { x: [0, 1.4], y: [0, 1.05], xlabel: 'θ (rad)', ylabel: '', curves: [{ fn: 'sin(x)', color: 'accent', label: 'sin θ', labelAt: 1.25, labelDy: -14 }, { fn: 'x - x^3/6', color: 'warn', dash: true, label: 'θ − θ³/6', labelAt: 1.3, labelDy: 14 }], vlines: [{ x: th, label: `θ = ${th}`, color: 'gold' }] }, caption: t`$\sin\theta$ and its two-term approximation: indistinguishable at small angles, parting company near 1 rad.` },
        };
      },
    }),
    num({
      id: 'cp-madelung', difficulty: 3, transfer: true,
      gen(r) {
        const tol = r.pick([0.003, 0.004, 0.006]);
        let N = 0;
        while (!(2 / (N + 1) < tol)) N++;
        return {
          prompt: t`In a one-dimensional model of an ionic crystal (alternating $+$ and $-$ ions in a line), the binding energy of one ion involves the **Madelung constant** $\alpha = 2\left(1 - \frac12 + \frac13 - \frac14 + \cdots\right) = 2\ln 2$. If you compute $\alpha$ from the partial sums $2S_N$, how many terms does the alternating series bound say you need for an error below ${tol}?`,
          answer: N, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: Math.ceil(1 / tol), feedback: t`Remember the factor 2: the error of $2S_N$ is at most $2\,b_{N+1} = \frac{2}{N + 1}$.` }],
          hints: [t`The error of $2S_N$ is at most $2b_{N+1} = \dfrac{2}{N + 1}$.`, t`Solve $\dfrac{2}{N + 1} < ${tol}$.`],
          teach: 'Conditionally convergent series converge slowly: their error bounds shrink only like 1/N.',
          explain: t`$\frac{2}{N + 1} < ${tol} \iff N + 1 > ${fmt(2 / tol, 5)}$, so $N = ${N}$ — hundreds of terms for three decimal places of $\alpha = 2\ln 2 \approx ${fmt(2 * Math.log(2), 5)}$. Physicists sum such lattice series by smarter methods (Ewald summation) for exactly this reason.`,
          visual: { type: 'graph', params: { x: [-4.6, 4.6], y: [-1, 1], grid: false, axes: false, xlabel: '', ylabel: '', points: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => ({ x: k, y: 0, color: k % 2 === 0 ? 'bad' : 'accent', label: k % 2 === 0 ? '+' : '−', r: k === 0 ? 8 : 6 })), arrows: [{ from: [0, 0.75], to: [0, 0.18], label: 'this ion', color: 'gold' }, { from: [0, -0.45], to: [1, -0.45], label: 'd', color: 'ink3' }] }, caption: t`A one-dimensional ionic crystal: ions of alternating charge, spaced $d$ apart and continuing forever both ways. The marked ion feels neighbours at $d, 2d, 3d, \dots$ with alternating signs, hence the alternating series.` },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.5 Alternating series', url: 'https://openstax.org/books/calculus-volume-2/pages/5-5-alternating-series' }],
});
