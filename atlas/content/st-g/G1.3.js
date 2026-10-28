// Contradiction and induction. Contradiction: assume the negation, reach a
// falsehood (log₂3 is irrational; Pythagorean triples; the logical skeleton of
// Penrose's singularity theorem). Induction: a base case and a step, pictured as
// a recursion that can never cross its bound (a cobweb), then the bound
// ‖Kⁿ‖ ≤ ‖K‖ⁿ that makes a perturbation (Neumann) series converge.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const L2 = Math.log2(3);

// a bundle of null rays converging on a focal point: a teaching sketch of focusing
const focus = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 6.4], y: [-1.6, 1.6], aspect: 'wide', axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
    curves: [-1.2, -0.6, 0, 0.6, 1.2].map((h) => ({ fn: `${h}*(1 - x/4.5)`, color: 'gold', width: 1.6, domain: [0.3, 5.4] })),
    points: [{ x: 4.5, y: 0, r: 5, color: 'bad', label: 'focal point', labelDx: 4, labelDy: -24 }, { x: 0.3, y: 1.45, r: 0, label: 'light rays leaving a trapped surface', labelDx: 0 }],
  },
  caption,
});

const pyth = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.5, 12.5], y: [-0.5, 3.6], aspect: 'wide', xlabel: 'n', ylabel: 'n² mod 4', yticks: 3, xticks: 12,
    points: Array.from({ length: 13 }, (_, n) => ({ x: n, y: (n * n) % 4, r: 5, color: n % 2 ? 'gold' : 'accent' })),
    hlines: [{ y: 2, color: 'bad', label: 'remainder 2: never' }, { y: 3, color: 'bad', label: 'remainder 3: never' }],
  },
  caption,
});

export default lesson({
  id: 'st-g.G1.3',
  title: 'Contradiction and induction',
  minutes: 13, difficulty: 3,
  intro: t`Two more ways to prove $P$. **Contradiction:** assume $\neg P$ and derive something false; since true premises cannot lead to a falsehood, $\neg P$ was false. It is the natural tool for “there is no …” and “… is impossible”. **Induction** proves a statement $P(n)$ for every whole number $n \ge 1$ in two moves — a base case and a step that carries truth from each $n$ to the next:

$$\begin{gathered}\Bigl[\,P(1)\ \wedge\ \forall n \ge 1:\ \bigl(P(n) \Rightarrow P(n + 1)\bigr)\Bigr] \\ \Rightarrow\; \forall n \ge 1:\ P(n)\end{gathered}$$

The gentle versions are [proof by contradiction](#/lesson/m0.M0-14.3) and [proof by induction](#/lesson/m0.M0-14.4). Here they prove irrationality, bound recursions and make a perturbation series converge.`,
  symbols: [
    { tex: 'P(n)', text: t`a statement about the whole number $n$, such as “$a_n < 2$” or “$1^3 + \dots + n^3 = \bigl(n(n+1)/2\bigr)^2$”` },
    { tex: 'P(1)', text: 'the base case: the statement checked directly for the first value' },
    { tex: 'P(n) \\Rightarrow P(n + 1)', text: t`the inductive step: assuming the statement for one $n$ (the **inductive hypothesis**), prove it for the next` },
    { tex: '\\forall n \\ge 1', text: t`for every whole number from $1$ on; the base case can start anywhere, and the conclusion then starts there too` },
    { tex: '\\wedge', text: 'and: both pieces are required — a step without a base case proves nothing' },
  ],
  why: 'The singularity theorems of general relativity are proofs by contradiction, and every perturbation series in physics — post-Newtonian, Born, Dyson — is controlled order by order, which is induction.',
  visual: {
    type: 'calc-series',
    title: 'A recursion that cannot cross its bound',
    lead: t`The sequence $a_1 = c$, $a_{n+1} = \sqrt{2 + a_n}$, drawn as a cobweb on the curve $y = \sqrt{2 + x}$ and the diagonal $y = x$. The inductive step is visible: if $a_n < 2$, the next value $\sqrt{2 + a_n}$ is below $\sqrt{4} = 2$ too, so no step can cross $2$.`,
    tasks: [
      t`Start at $c = 0$: the staircase climbs toward $2$ but never reaches it. Induction proves $a_n < 2$ for every $n$, however many terms you show.`,
      t`Start above, at $c = 4$: now induction proves $a_n > 2$ for every $n$, and the staircase comes down.`,
      t`Switch to the terms view: the sequence is monotone and bounded, which is why it converges — the subject of [the next module](#/lesson/st-g.G2.1).`,
    ],
    params: {
      view: 'cobweb', rec: 'sqrt(2 + a)', a1: 'c', limit: 2,
      N: { min: 1, max: 12, value: 6, explain: 'How many terms of the sequence are computed and drawn.' },
      sliders: [{ key: 'c', label: t`Starting value $a_1 = c$`, min: 0, max: 4, step: 0.1, value: 0, explain: t`The base case: where the sequence starts. The bound $2$ is the fixed point, where $\sqrt{2 + x} = x$.` }],
      x: [-0.2, 4.2], y: [-0.2, 4.2],
      presets: [{ label: 'cobweb', view: 'cobweb' }, { label: 'terms', view: 'terms', x: null, y: [-0.2, 4.2] }],
    },
    caption: t`Only finitely many terms are drawn; the induction proof covers all of them. Dashed: the diagonal $y = x$, where a fixed point would sit.`,
  },
  example: {
    prompt: t`Prove by contradiction that $\log_2 3$ is irrational.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 13.5], y: [0, 21.5], aspect: 'wide', xlabel: 'q', ylabel: 'p',
        curves: [{ fn: `${L2.toFixed(9)}*x`, color: 'accent', width: 2, label: 'p = (log₂3) q', labelAt: 9, labelDx: -150, labelDy: -8 }],
        points: [[2, 3, '3/2: 8 vs 9'], [5, 8, '8/5: 256 vs 243'], [12, 19, '19/12: 2¹⁹ vs 3¹²']].map(([q, p, label]) => ({ x: q, y: p, r: 5, color: 'gold', label, labelDx: q === 12 ? -130 : 10, labelDy: q === 12 ? -12 : 12 })),
      },
      caption: t`The line $p = (\log_2 3)\,q$ and the whole-number points closest to it. Each misses: $2^p$ and $3^q$ come close (the 19/12 near miss is why a piano has 12 notes to the octave) but are never equal.`,
    },
    steps: [
      { label: 'Assume the negation', text: t`Suppose $\log_2 3$ is rational. It is positive (since $3 > 1$), so $\log_2 3 = p/q$ with whole numbers $p, q \ge 1$.` },
      { label: 'Unwind the logarithm', text: t`$\log_2 3 = p/q$ means $2^{p/q} = 3$. Raise both sides to the power $q$: $2^p = 3^q$.` },
      { label: 'Find the falsehood', text: t`$2^p$ is even, because $p \ge 1$. $3^q$ is odd, a product of odd numbers. An even number cannot equal an odd one.` },
      { label: 'Conclude', text: t`The assumption led to a false statement, so it is false: $\log_2 3$ is irrational. Note what was *not* needed: no decimal expansion, no limit — a contradiction can prove an impossibility in three lines.` },
      { label: 'Sense check', text: t`$\log_2 3 = ${L2.toFixed(6)}\ldots$; the near misses in the picture ($2^{19} = 524{,}288$ against $3^{12} = 531{,}441$) are close, but parity says they can never meet.` },
    ],
    answer: t`If $\log_2 3 = p/q$, then $2^p = 3^q$: even equals odd, a contradiction. So $\log_2 3$ is irrational.`,
  },
  practice: [
    order({
      id: 'sum-cubes', difficulty: 2,
      prompt: t`Prove by induction that $1^3 + 2^3 + \dots + n^3 = \left(\dfrac{n(n + 1)}{2}\right)^2$ for every $n \ge 1$. Put the steps in order.`,
      visual: {
        type: 'graph',
        params: { x: [0, 8.5], y: [0, 1400], aspect: 'wide', xlabel: 'n', ylabel: 'sum of cubes', curves: [{ fn: '(x*(x + 1)/2)^2', color: 'accent', width: 1.6, dash: true, label: '(n(n+1)/2)²', labelAt: 6.2, labelDx: -96, labelDy: -6 }], points: Array.from({ length: 8 }, (_, i) => { const n = i + 1; return { x: n, y: (n * (n + 1) / 2) ** 2, r: 5, color: 'gold' }; }) },
        caption: t`The sums $1^3 + \dots + n^3$ (dots) lie on the claimed formula for the eight values drawn. Eight checks are evidence; the induction proof covers every $n$.`,
      },
      items: [
        t`Base case: for $n = 1$ both sides equal $1$.`,
        t`Inductive hypothesis: assume $1^3 + \dots + n^3 = \tfrac14 n^2(n + 1)^2$ for some $n \ge 1$.`,
        t`Add the next term: $1^3 + \dots + (n + 1)^3 = \tfrac14 n^2(n + 1)^2 + (n + 1)^3$.`,
        t`Factor: $= \tfrac14(n + 1)^2\,(n^2 + 4n + 4) = \tfrac14(n + 1)^2(n + 2)^2$.`,
        t`That is the formula for $n + 1$; by induction it holds for every $n \ge 1$.`,
      ],
      hints: ['Base case first, then the hypothesis, then use it on the sum up to n + 1.', t`$n^2 + 4(n + 1) = (n + 2)^2$.`],
      teach: 'An induction proof uses the inductive hypothesis inside the n + 1 case: split off the last term and replace the rest.',
      explain: t`The step rewrites the sum to $n + 1$ as (sum to $n$) $+ (n + 1)^3$, uses the hypothesis on the first part, and factors to the same formula with $n + 1$ in place of $n$.`,
    }),
    num({
      id: 'bernoulli', difficulty: 2,
      gen(r) {
        const h = r.pick([0.02, 0.05, 0.1, 0.2]), M = r.pick([5, 10, 50]);
        const ans = Math.ceil((M - 1) / h - 1e-9);
        return {
          prompt: t`Induction proves **Bernoulli’s inequality** $(1 + h)^n \ge 1 + nh$ for $h > -1$ and every whole $n$. Using only this bound, what is the **smallest** $n$ for which it guarantees $(1 + ${h})^n \ge ${M}$?`,
          visual: { type: 'graph', params: { x: [0, ans * 1.15], y: [0, M * 1.6], aspect: 'wide', xlabel: 'n', ylabel: '', curves: [{ fn: `(1 + ${h})^x`, color: 'accent', width: 2, label: `(1 + ${h})ⁿ`, labelAt: +(Math.log(1.25 * M) / Math.log(1 + h)).toFixed(3), labelDx: -76, labelDy: -4 }, { fn: `1 + ${h}*x`, color: 'gold', width: 2, dash: true, label: `1 + ${h}n`, labelAt: ans * 0.85, labelDx: 6, labelDy: 14 }], hlines: [{ y: M, color: 'ink3', label: String(M) }] }, caption: t`The power (blue) always lies above Bernoulli’s line (dashed). The line is a crude lower bound, but a proved one.` },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: Math.ceil(Math.log(M) / Math.log(1 + h) - 1e-9), feedback: t`That is the true crossing of $(1 + ${h})^n$, found with logarithms. The question asks what the *bound* $1 + nh$ guarantees.` }].filter((e) => e.value !== ans),
          hints: [t`If $1 + ${h}n \ge ${M}$, then $(1 + ${h})^n \ge ${M}$ too.`, t`Solve $1 + ${h}n \ge ${M}$: $n \ge ${nice((M - 1) / h)}$.`],
          teach: 'A bound proved by induction can be weak and still useful: it holds for every n, with no logarithms required.',
          explain: t`$1 + ${h}n \ge ${M}$ needs $n \ge ${nice((M - 1) / h)}$, so $n = ${ans}$. The true crossing is much earlier, $n = ${Math.ceil(Math.log(M) / Math.log(1 + h) - 1e-9)}$: Bernoulli trades sharpness for certainty. It is also why $(1 + h)^n \to \infty$ for any $h > 0$.`,
        };
      },
    }),
    mcq({
      id: 'horses', difficulty: 3, kind: 'error',
      prompt: t`A famous “proof” that all horses are the same colour. $P(n)$: any $n$ horses are the same colour. Base: one horse matches itself. Step: given $n + 1$ horses, the first $n$ match (hypothesis), the last $n$ match (hypothesis), and the groups overlap, so all $n + 1$ match. Where is the error?`,
      visual: {
        type: 'graph',
        params: {
          x: [0.3, 6.6], y: [-0.4, 2.6], aspect: 'wide', axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
          points: [...[1, 2, 3, 4, 5].map((x) => ({ x, y: 1.8, r: 6, color: 'accent' })), ...[1, 2].map((x) => ({ x: x + 1.5, y: 0.3, r: 6, color: 'accent' })), { x: 6.5, y: 1.8, r: 0, label: 'n + 1 = 5', labelAlign: 'right' }, { x: 6.5, y: 0.3, r: 0, label: 'n + 1 = 2', labelAlign: 'right' }],
          curves: [{ fn: '2.15', domain: [0.8, 4.2], color: 'gold', width: 3 }, { fn: '2.35', domain: [1.8, 5.2], color: 'good', width: 3 }, { fn: '0.65', domain: [2.3, 2.7], color: 'gold', width: 3 }, { fn: '0.85', domain: [3.3, 3.7], color: 'good', width: 3 }],
        },
        caption: t`Gold bar: the first $n$ horses; green bar: the last $n$. With five horses the groups share three. With two they share none.`,
      },
      choices: [t`The step fails from $n = 1$ to $n = 2$: the two groups of one horse do not overlap`, 'The base case is false', 'Induction cannot be used for statements about horses', t`The hypothesis may only be used once in a step`],
      answer: 0,
      why: {
        1: t`One horse is trivially the same colour as itself; the base case is fine.`,
        2: 'Induction applies to any statement indexed by whole numbers; the error is specific.',
        3: t`Using the hypothesis twice is legal — it holds for *any* $n$ horses.`,
      },
      hints: [t`The step must work for **every** $n \ge 1$, including $n = 1$.`, t`With $n + 1 = 2$ horses, what do “the first $n$” and “the last $n$” share?`],
      teach: t`An inductive step must hold for every $n$ from the base case on; one broken link breaks the whole chain.`,
      explain: t`For $n = 1$ the first horse and the last horse share nothing, so “the groups overlap” is false and $P(1) \Rightarrow P(2)$ fails. Every later link is fine, but the chain is broken at its first link.`,
    }),
    mcq({
      id: 'first-line', difficulty: 2,
      prompt: t`You want to prove by contradiction: **there is no smallest positive rational number.** What is the first line?`,
      visual: { type: 'graph', params: { x: [-0.05, 1.1], y: [-0.5, 0.5], aspect: 'wide', yticks: 0, ylabel: '', xlabel: '', points: [1, 0.5, 0.25, 0.125, 0.0625, 0.03125].map((v, i) => ({ x: v, y: 0, r: 5, color: 'gold', label: ['1', '1/2', '1/4', '1/8', '', ''][i], labelDx: -4, labelDy: -12 })) }, caption: t`Halving a positive rational gives a smaller positive rational, again and again.` },
      choices: [t`Suppose there is a smallest positive rational number $r$.`, t`Suppose every positive rational has a smaller positive rational.`, t`Suppose $r$ is a positive rational number.`, t`Suppose there is no smallest positive rational number.`],
      answer: 0,
      why: {
        1: t`That is (equivalent to) the statement to be proved; assuming it is circular.`,
        2: t`That is not the negation of anything; it sets up a direct proof, not a contradiction.`,
        3: t`That *is* the statement to be proved. A contradiction proof assumes its negation.`,
      },
      hints: [t`Write the claim as $\neg\exists r$ (no smallest one) and negate it.`],
      teach: t`A proof by contradiction begins by assuming the negation of the claim, stated precisely.`,
      explain: t`Assume a smallest positive rational $r$ exists. Then $r/2$ is rational, positive and smaller than $r$ — a contradiction. So none exists.`,
    }),
    num({
      id: 'recursion-limit', difficulty: 3,
      gen(r) {
        const s = r.pick([2, 3, 6, 12, 20]);
        const L = (1 + Math.sqrt(1 + 4 * s)) / 2;
        return {
          prompt: t`The sequence $a_1 = 0$, $a_{n+1} = \sqrt{${s} + a_n}$ is increasing, and induction shows it stays below the positive number $L$ that solves $L = \sqrt{${s} + L}$ (if $a_n < L$, then $a_{n+1} < \sqrt{${s} + L} = L$). Find $L$.`,
          visual: { type: 'calc-series', params: { view: 'cobweb', rec: `sqrt(${s} + a)`, a1: 0, N: 8, readout: false }, caption: t`The cobweb for $a_{n+1} = \sqrt{${s} + a_n}$ from $a_1 = 0$: it climbs toward the crossing of the curve and the diagonal. Eight terms are drawn.` },
          answer: L, tol: { rel: 0.003 },
          errors: [{ value: Math.sqrt(s), feedback: t`$\sqrt{${s}}$ is only $a_2$. The bound is the fixed point, where $L = \sqrt{${s} + L}$.` }, { value: (1 - Math.sqrt(1 + 4 * s)) / 2, feedback: 'That root is negative; the square root is never negative, so the bound is the positive root.' }],
          hints: [t`Square both sides: $L^2 = ${s} + L$, a quadratic.`, t`$L^2 - L - ${s} = 0$ gives $L = \tfrac{1 + \sqrt{1 + ${4 * s}}}{2}$.`],
          teach: t`For a recursion $a_{n+1} = f(a_n)$ with $f$ increasing, the fixed point $L = f(L)$ is the natural bound to prove by induction.`,
          explain: t`$L^2 = ${s} + L$ gives $L = \tfrac{1 + \sqrt{${1 + 4 * s}}}{2} = ${nice(L, 5)}$. Base: $a_1 = 0 < L$. Step: $a_n < L \Rightarrow a_{n+1} = \sqrt{${s} + a_n} < \sqrt{${s} + L} = L$. Bounded and increasing, the sequence converges — to $L$.`,
        };
      },
    }),
    mcq({
      id: 'no-base', difficulty: 3,
      prompt: t`Let $P(n)$ be “$n^2 + n$ is odd”. The step holds: if $n^2 + n$ is odd, then $(n + 1)^2 + (n + 1) = (n^2 + n) + 2(n + 1)$ is odd plus even, so odd. What follows?`,
      visual: { type: 'graph', params: { x: [0, 9], y: [0, 95], aspect: 'wide', xlabel: 'n', ylabel: 'n² + n', points: Array.from({ length: 8 }, (_, i) => { const n = i + 1; return { x: n, y: n * n + n, r: 5, color: 'accent', label: String(n * n + n), labelDx: -8, labelDy: -12 }; }) }, caption: t`The values of $n^2 + n$ for $n = 1, \dots, 8$.` },
      choices: [t`Nothing true: $P(1)$ is false, and in fact $P(n)$ is false for every $n$`, t`$P(n)$ holds for every $n \ge 1$`, t`$P(n)$ holds for every $n$ from some point on`, t`The step must contain an error, since $P(n)$ is false`],
      answer: 0,
      why: {
        1: t`Without a true base case the chain never starts: $1^2 + 1 = 2$ is even.`,
        2: t`The step only transfers truth; it cannot create it. Every value in the picture is even.`,
        3: t`The step is valid as an implication — “if odd then odd” — it just never gets a true start. ($n^2 + n = n(n + 1)$ is always even.)`,
      },
      hints: ['Check the base case.', t`$n^2 + n = n(n + 1)$: a product of consecutive numbers.`],
      teach: 'An inductive step without a base case proves nothing: it transfers truth along the chain but cannot create it.',
      explain: t`$P(1)$ says $2$ is odd — false. Indeed $n(n + 1)$ always has an even factor, so $P(n)$ is false for every $n$, even though $P(n) \Rightarrow P(n + 1)$ is true.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neumann', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([0.2, 0.3, 0.5, 0.6, 0.7]), m = r.pick([6, 8]);
        let N = 0;
        while (k ** (N + 1) / (1 - k) >= 10 ** -m) N++;
        return {
          prompt: t`A perturbation series in quantum scattering (the Born series) has the form $\psi = \sum_{n=0}^{\infty} K^n\psi_0$, where the operator $K$ shrinks every vector by at least a factor $\lVert K\rVert = ${k}$. Induction gives $\lVert K^n\psi_0\rVert \le ${k}^n\lVert\psi_0\rVert$, so the terms left out after order $N$ add up to at most $\dfrac{${k}^{N+1}}{1 - ${k}}\lVert\psi_0\rVert$. What is the **smallest** order $N$ that guarantees an error below $10^{-${m}}\lVert\psi_0\rVert$?`,
          visual: { type: 'graph', params: { x: [0, Math.max(20, N + 6)], y: [-(m + 3), 1], ylog: true, aspect: 'wide', xlabel: 'order N', ylabel: 'error bound', curves: [{ fn: `log10(${k}^(x + 1)/(1 - ${k}))`, color: 'accent', width: 2 }], hlines: [{ y: -m, color: 'gold', label: `10⁻${m === 6 ? '⁶' : '⁸'}` }] }, caption: t`The guaranteed error after order $N$, on a logarithmic scale: a straight line, because the bound is geometric. Real Born series converge only when the scattering potential is weak enough.` },
          answer: N, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: N - 1, feedback: t`At $N = ${N - 1}$ the bound is $${tex(k ** N / (1 - k), 3)}$, still not below $10^{-${m}}$.` }],
          hints: [t`You need $${k}^{N+1} < (1 - ${k})\times 10^{-${m}}$.`, t`Take logarithms: $N + 1 > \dfrac{\ln\bigl(${nice(1 - k)}\times10^{-${m}}\bigr)}{\ln ${k}}$, then round up.`],
          teach: 'Induction turns one estimate, ‖Kψ‖ ≤ k‖ψ‖, into a bound at every order — which is what makes a geometric perturbation series provably convergent.',
          explain: t`At $N = ${N}$ the bound is $${tex(k ** (N + 1) / (1 - k), 3)} < 10^{-${m}}$; at $N = ${N - 1}$ it is $${tex(k ** N / (1 - k), 3)}$. Each order multiplies the bound by $${k}$, a fact proved by induction from $\lVert K\psi\rVert \le ${k}\lVert\psi\rVert$.`,
        };
      },
    }),
    order({
      id: 'cp-pythagoras', difficulty: 3,
      prompt: t`Prove by contradiction: **if $a^2 + b^2 = c^2$ with whole numbers $a, b, c$, then $a$ or $b$ is even.** Put the steps in order.`,
      visual: pyth(t`Squares of whole numbers, divided by $4$, leave remainder $0$ (even $n$, blue) or $1$ (odd $n$, gold) — never $2$ or $3$. Checked here to $n = 12$; the steps below prove it for all $n$.`),
      items: [
        t`Suppose, for contradiction, that $a$ and $b$ are both odd.`,
        t`An odd square is $(2k + 1)^2 = 4(k^2 + k) + 1$: remainder $1$ on division by $4$.`,
        t`So $a^2 + b^2$ leaves remainder $2$ on division by $4$.`,
        t`But any square $c^2$ leaves remainder $0$ (if $c$ is even) or $1$ (if $c$ is odd).`,
        t`$c^2$ cannot leave remainder $2$: contradiction, so $a$ or $b$ is even.`,
      ],
      hints: ['First line: the negation of the conclusion.', 'Compare the remainders of both sides on division by 4.'],
      teach: 'A contradiction proof assumes the negation and pushes it until two facts collide — here two different remainders for the same number.',
      explain: t`Both odd forces $a^2 + b^2 \equiv 2 \pmod 4$, while squares are $\equiv 0$ or $1$. So in every Pythagorean triple ($3, 4, 5$; $5, 12, 13$; …) at least one leg is even.`,
    }),
    mcq({
      id: 'cp-penrose', difficulty: 3, transfer: true,
      prompt: t`Penrose’s 1965 theorem: a spacetime with **(i)** a non-compact initial slice (Cauchy surface), **(ii)** gravity that focuses light (the null energy condition) and **(iii)** a trapped surface cannot be complete for light rays. The proof assumes completeness and derives that a certain surface is both compact and not compact. Which assumption does the contradiction overturn?`,
      visual: focus(t`A teaching sketch of focusing: rays leaving a trapped surface converge, so their family ends at a focal point after a finite distance. In the proof, focusing is what forces the compactness.`),
      choices: ['That every light ray can be continued indefinitely (completeness)', 'That the spacetime contains a trapped surface', 'That gravity focuses light (the energy condition)', 'That the initial slice is non-compact'],
      answer: 0,
      why: {
        1: t`That is a hypothesis of the theorem, held fixed; it is how the theorem applies to collapsing stars.`,
        2: t`Also a hypothesis of the theorem. Dropping it would give a different, weaker statement.`,
        3: t`A hypothesis too — and the non-compactness is the very fact the derived “compact” surface collides with.`,
      },
      hints: [t`To prove “hypotheses $\Rightarrow$ not complete”, a contradiction proof assumes the hypotheses **and** the negation of the conclusion.`, 'Three of the choices are the theorem’s hypotheses (i)–(iii); the fourth is the extra assumption.'],
      teach: t`To prove $H \Rightarrow C$ by contradiction, assume $H$ and $\neg C$; the contradiction rejects $\neg C$, never the hypotheses.`,
      explain: t`The added assumption — completeness, the negation of the conclusion — is the one that falls. With (i)–(iii) kept, the theorem concludes that some light ray ends: spacetime is singular.`,
    }),
  ],
  sources: [
    { label: 'Hammack, Book of Proof, chs. 6 and 10 (contradiction, induction; free online)', url: 'https://www.people.vcu.edu/~rhammack/BookOfProof/' },
    { label: 'Velleman, How to Prove It, 3rd ed. (Cambridge, 2019), chs. 3 and 6', url: 'https://www.cambridge.org/9781108439534' },
    { label: 'Penrose, Gravitational collapse and space-time singularities, Phys. Rev. Lett. 14, 57 (1965)', url: 'https://doi.org/10.1103/PhysRevLett.14.57' },
  ],
});
