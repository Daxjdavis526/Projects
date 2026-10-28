// Uniform convergence and why it matters. Pointwise convergence lets each x
// pick its own N; uniform convergence asks one N for every x, which is the
// sup norm going to zero. xⁿ on [0, 1] (continuous terms, discontinuous limit,
// sup gap stuck at 1, the point 1 − 1/n tending to 1/e), the travelling bump
// n x e^(−n x²) whose integrals tend to ½ while the functions tend to 0, and
// the theorems that make limit–integral swaps — a constant move in physics — safe.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;

const bump = (ns, { shade = null, caption, y = [-0.1, 2.1] }) => ({
  type: 'graph',
  params: {
    x: [0, 1], y, aspect: 'wide', xlabel: 'x', ylabel: 'gₙ(x)',
    curves: ns.map((n, i) => ({ fn: `${n}*x*e^(-${n}*x^2)`, color: ['gold', 'accent2', 'accent', 'violet'][i % 4], width: 2, label: `n = ${n}`, labelAt: +(1 / Math.sqrt(2 * n)).toFixed(4), labelDx: 6, labelDy: -8 })),
    ...(shade ? { shade: [{ fn: `${shade}*x*e^(-${shade}*x^2)`, from: 0, to: 1, color: 'accent', alpha: 0.2 }] } : {}),
  },
  caption,
});

export default lesson({
  id: 'st-g.G2.3',
  title: 'Uniform convergence and why it matters',
  minutes: 14, difficulty: 3,
  intro: t`A sequence of functions $f_n$ converges **pointwise** to $f$ when $f_n(x) \to f(x)$ at each $x$ separately — each point may need its own $N$. It converges **uniformly** when one $N$ serves every $x$ at once, which is the same as the largest gap going to zero:

$$\begin{gathered}\lVert f_n - f\rVert_\infty = \sup_{x \in I}\,|f_n(x) - f(x)| \\ \longrightarrow\; 0\end{gathered}$$

The difference decides whether limits can be swapped. A uniform limit of continuous functions is continuous, and on a bounded interval $\int f_n \to \int f$. Under mere pointwise convergence both can fail. Physics swaps limits all the time — integrating a perturbation series term by term, differentiating under an integral sign, taking a continuum limit — and uniform convergence is the usual licence. Fourier series meet these ideas in [pointwise and mean-square convergence](#/lesson/st-e.E2.1).`,
  symbols: [
    { tex: 'f_n', text: t`the $n$-th function of the sequence, defined on the interval $I$` },
    { tex: 'f', text: 'the pointwise limit: f(x) = lim fₙ(x) at each x' },
    { tex: '\\sup_{x \\in I}', text: t`the supremum: the least upper bound over every $x$ in $I$ — the largest gap, or the value it approaches if no point attains it` },
    { tex: '\\lVert f_n - f\\rVert_\\infty', text: t`the **sup norm** of the gap: one number measuring the worst disagreement anywhere on $I$` },
  ],
  why: 'Every time a physics derivation moves a limit, sum or derivative through an integral, it silently assumes a convergence that is strong enough; uniform convergence is the condition you can check.',
  visual: {
    type: 'graph',
    title: 'A gap that never closes',
    lead: t`The blue curve is $x^n$ on $[0, 1]$; its pointwise limit (gold) is $0$ for $x < 1$ and $1$ at $x = 1$. The shading is the gap $|x^n - f(x)|$ over $[0, b]$. Raise $n$: the gap retreats toward $x = 1$ but its height there never shrinks.`,
    tasks: [
      t`With $b = 1$ the readout stays at $1$ for every $n$: the sup norm does not go to $0$, so the convergence is not uniform on $[0, 1]$.`,
      t`Follow the red point at $x = 1 - 1/n$: its height $(1 - 1/n)^n$ tends to $1/e \approx 0.368$, not to $0$. Each $n$ has a point that is still far from the limit.`,
      t`Pull $b$ down to $0.9$: now the sup is $0.9^n$, which does go to $0$ — uniform convergence on $[0, 0.9]$. Staying away from the trouble restores it.`,
    ],
    params: {
      x: [0, 1.05], y: [-0.08, 1.15], aspect: 'wide', xlabel: 'x', ylabel: 'y',
      sliders: [
        { key: 'n', label: t`Index $n$`, min: 1, max: 60, step: 1, value: 5, explain: t`Which function of the sequence $x^n$ is drawn.` },
        { key: 'b', label: t`Right end $b$ of the interval`, min: 0.5, max: 1, step: 0.01, value: 1, explain: t`The convergence is examined on $[0, b]$.` },
      ],
      shade: [{ fn: 'x^n', lower: '0', from: 0, to: 'min(b, 0.999)', color: 'bad', alpha: 0.22 }],
      curves: [
        { fn: 'x^n', color: 'accent', width: 2.4, domain: [0, 1], label: 'xⁿ', labelAt: 0.97, labelDx: -26, labelDy: -10 },
        { fn: '0', color: 'gold', width: 2.4, domain: [0, 0.995], label: 'limit f', labelAt: 0.3, labelDy: 12 },
      ],
      points: [{ x: 1, y: 1, r: 5, color: 'gold' }, { x: 1, y: 0, r: 5, hollow: true, color: 'gold' }, { x: '1 - 1/n', y: '(1 - 1/n)^n', r: 5, color: 'bad', label: 'x = 1 − 1/n', labelDx: -86, labelDy: -10, when: 'step(n - 1.5)' }],
      vlines: [{ x: 'b', color: 'ink3', label: 'b' }],
      readouts: [
        { label: t`$\sup_{[0, b]}|x^n - f(x)|$`, expr: 'step(0.9999 - b)*b^n + step(b - 0.9999)', digits: 4 },
        { label: t`gap at $x = 1 - 1/n$`, expr: '(1 - 1/n)^n', digits: 4 },
        { label: t`$1/e$`, expr: '1/e', digits: 4 },
      ],
    },
    caption: t`On $[0, 1]$ the gap equals $x^n$ for $x < 1$ and $0$ at $x = 1$, so its supremum is $1$ — approached, never attained. For $b < 1$ the supremum is $b^n$, attained at $x = b$.`,
  },
  example: {
    prompt: t`Let $g_n(x) = n x\,e^{-n x^2}$ on $[0, 1]$. Find the pointwise limit $g$, compare $\displaystyle\lim_{n\to\infty}\int_0^1 g_n\,dx$ with $\displaystyle\int_0^1 g\,dx$, and explain the mismatch.`,
    visual: bump([2, 10, 50], { shade: 50, y: [-0.1, 3.4], caption: t`$g_n$ for $n = 2, 10, 50$, with the area under $g_{50}$ shaded. Each bump is narrower and taller; every area is close to $\tfrac12$.` }),
    steps: [
      { label: 'Pointwise limit', text: t`At $x = 0$, $g_n(0) = 0$. At any fixed $x > 0$, $n e^{-n x^2} \to 0$ because the exponential beats the factor $n$. So $g = 0$ on all of $[0, 1]$, and $\int_0^1 g\,dx = 0$.` },
      { label: 'Integrate first', text: t`With $u = n x^2$: $\displaystyle\int_0^1 n x\,e^{-n x^2}dx = \Bigl[-\tfrac12 e^{-n x^2}\Bigr]_0^1 = \tfrac12\bigl(1 - e^{-n}\bigr) \to \tfrac12$.` },
      { label: 'The mismatch', text: t`$\displaystyle\lim\int g_n = \tfrac12$ but $\displaystyle\int\lim g_n = 0$. The area does not vanish; it piles up in a bump that slides toward $x = 0$, where no fixed point can see it.` },
      { label: 'Measure the gap', text: t`$g_n$ peaks where $g_n' = n e^{-n x^2}(1 - 2n x^2) = 0$, at $x = 1/\sqrt{2n}$, with height $\sqrt{n/2}\,e^{-1/2}$. So $\lVert g_n - 0\rVert_\infty = \sqrt{n/2}\,e^{-1/2} \to \infty$: far from uniform.` },
      { label: 'The theorem it escapes', text: t`If $f_n \to f$ uniformly on $[a, b]$, then $\left|\int_a^b f_n - \int_a^b f\right| \le (b - a)\,\lVert f_n - f\rVert_\infty \to 0$. Here the sup norm grows, so nothing protects the swap — and it fails.` },
    ],
    answer: t`$g_n \to 0$ pointwise, $\int_0^1 g_n = \tfrac12(1 - e^{-n}) \to \tfrac12 \ne 0$. The swap fails because the convergence is not uniform: the peak height $\sqrt{n/2}\,e^{-1/2}$ grows without bound.`,
  },
  practice: [
    num({
      id: 'sup-N', difficulty: 2,
      gen(r) {
        const b = r.pick([0.5, 0.8, 0.9, 0.95]), [eps, epsT] = r.pick([[0.01, '0.01'], [0.001, '0.001']]);
        const ans = Math.floor(Math.log(eps) / Math.log(b)) + 1;
        return {
          prompt: t`On $[0, ${b}]$, $x^n \to 0$ uniformly, since $\sup_{[0, ${b}]} x^n = ${b}^n$. What is the **smallest** $N$ such that $|x^n| < ${epsT}$ for **every** $x \in [0, ${b}]$ and every $n \ge N$?`,
          visual: { type: 'graph', params: { x: [0, 1.02], y: [0, 1.05], aspect: 'wide', curves: [1, 3, 10, 30].map((n, i) => ({ fn: `x^${n}`, color: ['gold', 'accent2', 'accent', 'violet'][i], width: 1.8, label: `n = ${n}`, labelAt: 0.98 - 0.06 * i, labelDx: -50, labelDy: -6 })), vlines: [{ x: b, color: 'bad', label: `b = ${b}` }] }, caption: t`$x^n$ for $n = 1, 3, 10, 30$. On $[0, ${b}]$ (left of the red line) the largest value is always at the right edge.` },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: ans - 1, feedback: t`$${b}^{${ans - 1}} = ${tex(b ** (ans - 1), 3)}$, not yet below $${epsT}$.` }],
          hints: [t`The worst point is $x = ${b}$, so you need $${b}^n < ${epsT}$.`, t`$n > \dfrac{\ln ${epsT}}{\ln ${b}} = ${nice(Math.log(eps) / Math.log(b), 4)}$.`],
          teach: t`Uniform convergence means one $N$ for every $x$: find it at the worst point, here the right end $x = b$.`,
          explain: t`$${b}^{${ans}} = ${tex(b ** ans, 3)} < ${epsT}$ while $${b}^{${ans - 1}} = ${tex(b ** (ans - 1), 3)}$ is not, so $N = ${ans}$; every $x$ to the left is smaller still. On $[0, 1)$ no $N$ exists, because the worst point slides to $1$.`,
        };
      },
    }),
    mcq({
      id: 'continuous-limit', difficulty: 2,
      prompt: t`Each $x^n$ is continuous on $[0, 1]$, but the pointwise limit jumps from $0$ to $1$ at $x = 1$. Combined with the theorem “a uniform limit of continuous functions is continuous”, what does this show?`,
      visual: { type: 'graph', params: { x: [0, 1.1], y: [-0.15, 1.2], aspect: 'wide', curves: [{ fn: '0', color: 'gold', width: 3, domain: [0, 0.99] }, { fn: 'x^8', color: 'accent', width: 1.4, dash: true }], points: [{ x: 1, y: 1, r: 5, color: 'gold', label: 'f(1) = 1', labelDx: -60, labelDy: -6 }, { x: 1, y: 0, r: 5, hollow: true, color: 'gold' }] }, caption: t`The pointwise limit of $x^n$ (gold), with $x^8$ (dashed) for comparison.` },
      choices: [t`The convergence of $x^n$ on $[0, 1]$ is not uniform`, t`The theorem is false`, t`$x^n$ is not continuous at $x = 1$ for large $n$`, t`The limit is in fact continuous: it is $0$ everywhere`],
      answer: 0,
      why: {
        1: t`The theorem is proved (by an $\varepsilon/3$ argument); its hypothesis — uniform convergence — fails here.`,
        2: t`Every $x^n$ is a polynomial, continuous everywhere.`,
        3: t`At $x = 1$, $1^n = 1$ for every $n$, so the limit there is $1$.`,
      },
      hints: [t`The theorem has the form $P \Rightarrow Q$. Here $Q$ fails.`, 'Use the contrapositive.'],
      teach: t`“Uniform limits of continuous functions are continuous”, read backwards: a discontinuous limit proves the convergence was not uniform.`,
      explain: t`Contrapositive: limit not continuous $\Rightarrow$ convergence not uniform. It agrees with the direct computation: $\sup_{[0,1]}|x^n - f| = 1$ for every $n$.`,
    }),
    num({
      id: 'bump-integral', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, 4]);
        const ans = (1 - Math.exp(-n)) / 2;
        return {
          prompt: t`Compute $\displaystyle\int_0^1 ${n === 1 ? '' : n}x\,e^{-${n === 1 ? '' : n}x^2}\,dx$. Give three significant figures.`,
          visual: bump([n], { shade: n, y: [-0.05, 1.3], caption: t`$g_{${n}}(x) = ${n === 1 ? '' : n}x\,e^{-${n === 1 ? '' : n}x^2}$ on $[0, 1]$ and the area asked for.` }),
          answer: ans, tol: { rel: 0.005 }, integrand: `${n}*x*e^(-${n}*x^2)`, limits: [0, 1],
          errors: [{ value: 0.5, feedback: t`$\tfrac12$ is the limit as $n \to \infty$. For $n = ${n}$ the factor $1 - e^{-${n}}$ matters.` }, { value: 1 - Math.exp(-n), feedback: t`With $u = ${n}x^2$, $du = ${2 * n}x\,dx$: the antiderivative is $-\tfrac12 e^{-${n}x^2}$, so keep the $\tfrac12$.` }],
          hints: [t`Substitute $u = ${n}x^2$, $du = ${2 * n}x\,dx$.`, t`An antiderivative is $-\tfrac12 e^{-${n}x^2}$.`],
          teach: t`$\int_0^1 n x\,e^{-n x^2}dx = \tfrac12(1 - e^{-n})$: it tends to $\tfrac12$ even though the functions tend to $0$ at every point.`,
          explain: t`$\Bigl[-\tfrac12 e^{-${n}x^2}\Bigr]_0^1 = \tfrac12(1 - e^{-${n}}) = ${nice(ans, 4)}$. As $n$ grows this tends to $\tfrac12$, while $\int_0^1 \lim g_n = 0$.`,
        };
      },
    }),
    num({
      id: 'bump-sup', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 8, 18, 32, 50]);
        const ans = Math.sqrt(n / 2) * Math.exp(-0.5);
        return {
          prompt: t`The sup-norm distance between $g_{${n}}(x) = ${n}x\,e^{-${n}x^2}$ and its pointwise limit $0$ on $[0, 1]$ is the height of its peak. Find $\lVert g_{${n}}\rVert_\infty$ to three significant figures.`,
          visual: bump([n], { y: [-0.1, Math.max(1.2, ans * 1.3)], caption: t`$g_{${n}}$ on $[0, 1]$. The peak is asked for, so it is not marked.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(n / 2), feedback: t`At the peak, $e^{-${n}x^2} = e^{-1/2}$: keep that factor.` }, { value: n * Math.exp(-n), feedback: t`That is $g_{${n}}(1)$, the value at the right end, not the peak.` }],
          hints: [t`$g' = ${n}e^{-${n}x^2}(1 - ${2 * n}x^2)$ vanishes at $x = 1/\sqrt{${2 * n}}$.`, t`Substitute: $g = ${n}\cdot\frac{1}{\sqrt{${2 * n}}}\cdot e^{-1/2} = \sqrt{${n}/2}\,e^{-1/2}$.`],
          teach: t`The sup norm of $n x e^{-n x^2}$ is $\sqrt{n/2}\,e^{-1/2}$: it grows, so the convergence to $0$ is pointwise only.`,
          explain: t`The peak is at $x = 1/\sqrt{${2 * n}} = ${nice(1 / Math.sqrt(2 * n), 3)}$ with height $\sqrt{${n}/2}\,e^{-1/2} = ${nice(ans, 4)}$. It grows like $\sqrt n$ — the bumps get taller as they get thinner, keeping their area near $\tfrac12$.`,
        };
      },
    }),
    order({
      id: 'swap-proof', difficulty: 3,
      prompt: t`Prove: **if $f_n \to f$ uniformly on $[a, b]$ (all integrable), then $\int_a^b f_n \to \int_a^b f$.** Put the steps in order.`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.2, 1.6], aspect: 'wide', shade: [{ fn: '0.6 + 0.4*sin(2x) + 0.15', lower: '0.6 + 0.4*sin(2x) - 0.15', from: 0, to: 3, color: 'good', alpha: 0.2 }], curves: [{ fn: '0.6 + 0.4*sin(2x)', color: 'gold', width: 2, label: 'f', labelAt: 0.3, labelDy: -10 }, { fn: '0.6 + 0.4*sin(2x) + 0.1*sin(9x)', color: 'accent', width: 1.6, label: 'fₙ', labelAt: 2.5, labelDy: 18 }] }, caption: t`Once $f_n$ is inside a band of half-width $\eta$ around $f$ on all of $[a, b]$ (here $\eta = 0.15$ on $[0, 3]$), the integrals differ by at most $\eta\,(b - a)$.` },
      items: [
        t`Let $\varepsilon > 0$.`,
        t`By uniform convergence choose $N$ with $\sup_{[a,b]}|f_n - f| < \dfrac{\varepsilon}{b - a}$ for all $n \ge N$.`,
        t`For $n \ge N$: $\left|\int_a^b f_n - \int_a^b f\right| \le \int_a^b |f_n - f|$.`,
        t`$\le (b - a)\sup_{[a,b]}|f_n - f| < \varepsilon$, so $\int_a^b f_n \to \int_a^b f$.`,
      ],
      hints: [t`The tolerance asked of the sup norm is $\varepsilon/(b - a)$.`, t`Bound the integral of $|f_n - f|$ by length times the largest value.`],
      teach: t`On a bounded interval, $|\int f_n - \int f| \le (b - a)\lVert f_n - f\rVert_\infty$: uniform convergence carries the integral with it.`,
      explain: t`The key line is the estimate “integral $\le$ length $\times$ sup”. It needs both a finite length and a sup that goes to $0$ — exactly what the travelling bump lacks.`,
    }),
    mcq({
      id: 'm-test', difficulty: 3,
      prompt: t`The **Weierstrass M-test**: if $|u_k(x)| \le M_k$ for every $x$ and $\sum M_k$ converges, then $\sum u_k(x)$ converges uniformly. Which series does it show converges uniformly on all of $\mathbb R$?`,
      visual: { type: 'graph', params: { x: [-6.3, 6.3], y: [-1.2, 1.9], aspect: 'wide', sliders: [{ key: 'N', label: t`Terms $N$`, min: 1, max: 30, step: 1, value: 6, explain: 'How many terms of the partial sum are drawn.' }], curves: [{ sum: 'cos(k*x)/k^2', k: [1, 'N'], color: 'accent', width: 2 }] }, caption: t`Partial sums of $\sum\cos(kx)/k^2$. The terms are bounded by $1/k^2$ wherever $x$ is.` },
      choices: [t`$\sum_{k\ge1}\dfrac{\cos kx}{k^2}$`, t`$\sum_{k\ge1}\dfrac{\cos kx}{k}$`, t`$\sum_{k\ge0}\dfrac{x^k}{k!}$`, t`$\sum_{k\ge1}\dfrac{x}{k^2}$`],
      answer: 0,
      why: {
        1: t`The best bound is $M_k = 1/k$, whose sum diverges: the test says nothing (and near $x = 0$ the series does diverge).`,
        2: t`On $\mathbb R$ no bound $M_k$ independent of $x$ exists: $x^k/k!$ is unbounded. It converges uniformly on each bounded interval, not on all of $\mathbb R$.`,
        3: t`$|x|/k^2$ has no bound independent of $x$ on $\mathbb R$; the partial sums differ from the limit by $|x|\sum_{k > N}1/k^2$, unbounded in $x$.`,
      },
      hints: [t`Look for a bound $M_k$ that does not depend on $x$ at all.`, t`$|\cos kx| \le 1$ for every $x$.`],
      teach: t`The M-test needs bounds $M_k$ valid for every $x$ at once, with $\sum M_k < \infty$; a bound that depends on $x$ gives no uniformity.`,
      explain: t`$|\cos(kx)/k^2| \le 1/k^2$ for all $x$, and $\sum 1/k^2 = \pi^2/6$ converges. So the series converges uniformly on $\mathbb R$; its sum is continuous and may be integrated term by term.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-term-by-term', difficulty: 3, transfer: true,
      prompt: t`A perturbation calculation writes an energy shift as $\Delta E(\lambda) = \int_0^L \sum_{k=1}^{\infty}\lambda^k f_k(x)\,dx$ and then integrates term by term: $\sum_k \lambda^k\int_0^L f_k\,dx$. Which condition makes this step legitimate?`,
      visual: bump([2, 10, 50], { y: [-0.1, 3.4], caption: t`The warning case: functions that tend to $0$ at every point while their integrals stay near $\tfrac12$. Pointwise convergence alone cannot license a swap.` }),
      choices: [t`The partial sums converge uniformly on $[0, L]$ — for instance, $|\lambda^k f_k(x)| \le M_k$ for all $x$ with $\sum M_k < \infty$`, t`The series converges at every point $x$`, t`Each $f_k$ is continuous`, t`Nothing: summing and integrating can always be swapped`],
      answer: 0,
      why: {
        1: t`Pointwise convergence is exactly what the sliding bump has, and there the swap fails.`,
        2: t`Continuity of each term is not enough: $x^n$ is continuous and its limit is not, and its sums need not commute with integrals.`,
        3: t`The bump sequence is a counterexample.`,
      },
      hints: [t`Which kind of convergence carries $\int$ through the limit on a bounded interval?`, 'The M-test is one practical way to check it.'],
      teach: t`Uniform convergence on a bounded interval licenses term-by-term integration; in practice the M-test is the quickest check.`,
      explain: t`With uniform convergence, $|\int(\text{sum}) - \int(\text{partial sum})| \le L\,\sup|\text{tail}| \to 0$. When only weaker convergence holds, physicists invoke stronger theorems (dominated convergence) or check the swap another way.`,
    }),
    num({
      id: 'cp-N-uniform', difficulty: 3,
      gen(r) {
        const [eps, epsT, q] = r.pick([[0.1, '0.1', 25], [0.05, '0.05', 100], [0.02, '0.02', 625], [0.01, '0.01', 2500]]);
        const ans = q + 1;
        return {
          prompt: t`$h_n(x) = \dfrac{x}{1 + n x^2}$ converges to $0$ on all of $\mathbb R$. Its largest value is at $x = 1/\sqrt n$, so $\lVert h_n\rVert_\infty = \dfrac{1}{2\sqrt n}$. What is the smallest $N$ such that $|h_n(x)| < ${epsT}$ for **every** real $x$ and every $n \ge N$?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-0.6, 0.6], aspect: 'wide', curves: [1, 4, 16].map((n, i) => ({ fn: `x/(1 + ${n}*x^2)`, color: ['gold', 'accent2', 'accent'][i], width: 2, label: `n = ${n}`, labelAt: +(1 / Math.sqrt(n)).toFixed(3), labelDx: 4, labelDy: -8 })) }, caption: t`$h_n$ for $n = 1, 4, 16$: the peaks shrink like $1/(2\sqrt n)$ and move toward $0$ — unlike the bumps of the worked example, which grew.` },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: q, feedback: t`At $n = ${q}$ the peak is exactly $${epsT}$, not below it.` }],
          hints: [t`You need $\dfrac{1}{2\sqrt n} < ${epsT}$.`, t`That is $\sqrt n > ${nice(1 / (2 * eps))}$, so $n > ${q}$.`],
          teach: t`When the sup norm is known as a formula in $n$, the uniform $N$ is found by solving one inequality — no $x$ involved.`,
          explain: t`$\frac{1}{2\sqrt n} < ${epsT}$ exactly when $n > ${q}$, so $N = ${ans}$. Since the bound is the maximum over all $x$, the same $N$ serves every point: uniform convergence.`,
        };
      },
    }),
    mcq({
      id: 'cp-negation', difficulty: 3,
      prompt: t`Not uniform on $[0, 1)$ means: $\exists\varepsilon > 0\ \forall N\ \exists n \ge N\ \exists x \in [0, 1):\ |x^n - 0| \ge \varepsilon$. Which choice of $\varepsilon$, and of $x$ for each $n \ge 2$, proves it?`,
      visual: { type: 'graph', params: { x: [0, 51], y: [0, 0.5], aspect: 'wide', xlabel: 'n', ylabel: '', points: Array.from({ length: 49 }, (_, i) => { const n = i + 2; return { x: n, y: +((1 - 1 / n) ** n).toFixed(5), r: 3, color: 'accent' }; }), hlines: [{ y: +(1 / Math.E).toFixed(5), color: 'good', label: '1/e' }] }, caption: t`The values $(1 - 1/n)^n$ for $n = 2, \dots, 50$: they rise from $0.25$ toward $1/e$.` },
      choices: [t`$\varepsilon = \tfrac14$ and $x = 1 - \tfrac1n$`, t`$\varepsilon = \tfrac14$ and $x = \tfrac12$`, t`$\varepsilon = 1$ and $x = 1 - \tfrac1n$`, t`$\varepsilon = \tfrac14$ and $x = 0$`],
      answer: 0,
      why: {
        1: t`$(\tfrac12)^n \to 0$: a fixed point is eventually inside every band. The witness must move with $n$.`,
        2: t`$(1 - 1/n)^n < 1$ always, so the gap never reaches $\varepsilon = 1$ inside $[0, 1)$.`,
        3: t`$0^n = 0$: no gap at all.`,
      },
      hints: [t`A fixed $x < 1$ cannot work: $x^n \to 0$. Let $x$ slide toward $1$ as $n$ grows.`, t`The plotted values are $(1 - 1/n)^n$; read off their smallest value.`],
      teach: t`Disproving uniform convergence needs one $\varepsilon$ and, for each $n$, a point — usually a moving one — where the gap is still at least $\varepsilon$.`,
      explain: t`$(1 - 1/n)^n$ increases from $0.25$ at $n = 2$ toward $1/e$, so it is $\ge \tfrac14$ for every $n \ge 2$. With $\varepsilon = \tfrac14$, the sliding points $x = 1 - 1/n$ defeat every $N$.`,
    }),
  ],
  sources: [
    { label: 'Abbott, Understanding Analysis, 2nd ed. (Springer, 2015), §§6.2–6.4 (uniform convergence, M-test)', url: 'https://doi.org/10.1007/978-1-4939-2712-8' },
    { label: 'Lebl, Basic Analysis I, §6.2 (interchange of limits; free online)', url: 'https://www.jirka.org/ra/' },
  ],
});
