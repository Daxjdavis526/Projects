// Proof by induction — a base case and a step that carries truth from each n to the next, like a row of falling dominoes.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { N, bars, areaModel } from './_m0kit.js';
import { dominoes } from './_m0reason.js';

const t = String.raw;

/** The odd numbers 1, 3, 5, … as L-shaped layers filling an n × n square; the last layer in gold. */
function layers(n, caption) {
  const rects = [];
  for (let k = 1; k <= n; k++) {
    const color = k === n ? 'gold' : 'accent';
    rects.push({ x: k - 1, y: 0, w: 1, h: k, color, alpha: k === n ? 0.5 : 0.25 });
    if (k > 1) rects.push({ x: 0, y: k - 1, w: k - 1, h: 1, color, alpha: k === n ? 0.5 : 0.25 });
  }
  return areaModel({ rects, sides: [{ x: (n - 1) / 2, y: (n - 1) / 2, label: `${n - 1} × ${n - 1}` }, { x: n - 0.5, y: n + 0.4, label: `+ ${2 * n - 1}`, color: 'gold' }], x: [-1, n + 1], y: [-0.4, n + 0.9], caption });
}

export default lesson({
  id: 'm0.M0-14.4',
  title: 'Proof by induction',
  minutes: 11, difficulty: 3,
  intro: t`How can a finite proof cover infinitely many cases $n = 1, 2, 3, \ldots$? Think of an endless row of dominoes. If the **first** one falls (the **base case**), and **each** one knocks over the next (the **inductive step**), then every domino falls. For a statement $P(n)$ about whole numbers:

$$P(1)\ \text{ and }\ \bigl(P(k) \Rightarrow P(k+1)\ \text{for every}\ k \ge 1\bigr) \;\Longrightarrow\; P(n)\ \text{for every}\ n \ge 1.$$

In the step you **assume** $P(k)$ for one arbitrary $k$ — the induction hypothesis — and show $P(k + 1)$ follows. That is not assuming what you want to prove: it is proving a link in the chain. Both parts are needed: a step with no base proves nothing, and so does a base with a broken link.`,
  symbols: [
    { tex: 'P(n)', text: 'a statement about the whole number $n$, such as “$1 + 3 + \\cdots + (2n - 1) = n^2$”' },
    { tex: 'P(1)', text: 'the **base case**: the statement for the first value' },
    { tex: 'k', text: 'an arbitrary whole number $\\ge 1$ in the inductive step' },
    { tex: 'P(k) \\Rightarrow P(k+1)', text: 'the **inductive step**: if the statement holds for $k$, it holds for $k + 1$' },
  ],
  why: t`Every formula for a sum, every claim about “the $n$-th step” of an algorithm or a recursion, and many results about matrices and series are proved this way. The [sums in M0-12.2](#/lesson/m0.M0-12.2) are its first customers; [Foundations G1](#/lesson/st-g.G1.3) uses it with full rigour.`,
  visual: {
    ...dominoes({ n: 10, fallen: 'm', sliders: [{ key: 'm', label: 'Dominoes fallen so far', min: 0, max: 10, step: 1, value: 3, explain: t`Each fallen domino is a case $P(n)$ known to be true.` }], caption: t`A teaching picture: the base case is the push on domino 1, the inductive step is the spacing that lets each one reach the next.` }),
    title: 'An endless row of dominoes',
    lead: t`Domino $n$ falling stands for “$P(n)$ is true”. Slide the number fallen forward and watch the chain reaction.`,
    tasks: [
      t`At $0$ nothing has happened: without a push on domino $1$ — the base case — no spacing, however perfect, topples anything.`,
      t`Each domino only needs to reach the next one. That one-step link is all the inductive step proves, and it is enough: the chain never needs a domino to reach two ahead.`,
      t`There are ten here, but the argument never used “ten”: it works for a row of any length, or an endless one.`,
    ],
  },
  example: {
    prompt: t`Prove that $1 + 2 + 4 + \cdots + 2^{\,n-1} = 2^{n} - 1$ for every whole number $n \ge 1$.`,
    visual: bars({ values: [1, 2, 4, 8, 16], labels: ['1', '+2 → 3', '+4 → 7', '+8 → 15', '+16 → 31'], xlabel: 'n', caption: t`The terms $2^{n-1}$, labelled with the running totals $1, 3, 7, 15, 31$: always one less than the next power of two.` }),
    steps: [
      { label: 'State P(n)', text: t`$P(n)$: “$1 + 2 + \cdots + 2^{n-1} = 2^n - 1$.”` },
      { label: 'Base case', text: t`$n = 1$: the left side is just $1$, and $2^1 - 1 = 1$. True.` },
      { label: 'Induction hypothesis', text: t`Assume $P(k)$ for some $k \ge 1$: $1 + 2 + \cdots + 2^{k-1} = 2^k - 1$.` },
      { label: 'Inductive step', text: t`Add the next term, $2^k$, to both sides: $$\begin{aligned} 1 + \cdots + 2^{k-1} + 2^k &= (2^k - 1) + 2^k \\ &= 2\cdot2^k - 1 = 2^{k+1} - 1. \end{aligned}$$ That is exactly $P(k + 1)$.` },
      { label: 'Conclude', text: t`$P(1)$ holds and $P(k) \Rightarrow P(k+1)$ for every $k \ge 1$, so $P(n)$ holds for every $n \ge 1$. (In binary it is plain to see: $111\ldots1 + 1 = 1000\ldots0$.)` },
    ],
    answer: t`Base: $1 = 2^1 - 1$. Step: $(2^k - 1) + 2^k = 2^{k+1} - 1$. So the formula holds for all $n \ge 1$. $\blacksquare$`,
  },
  practice: [
    order({
      id: 'odd-order', difficulty: 2,
      prompt: t`Put the induction proof that $1 + 3 + 5 + \cdots + (2n - 1) = n^2$ in order.`,
      items: [
        t`Let $P(n)$ be: $1 + 3 + \cdots + (2n - 1) = n^2$.`,
        t`Base case: for $n = 1$, $1 = 1^2$.`,
        t`Assume $1 + 3 + \cdots + (2k - 1) = k^2$ for some $k \ge 1$.`,
        t`Add the next odd number: $k^2 + (2k + 1) = (k + 1)^2$.`,
        t`So $P(k + 1)$ holds, and by induction $P(n)$ holds for every $n \ge 1$.`,
      ],
      hints: [t`State the claim, check the first case, assume the $k$ case, derive the $k + 1$ case, conclude.`],
      teach: t`Every induction proof has the same skeleton: statement, base case, hypothesis, step, conclusion.`,
      explain: t`The step adds the $(k + 1)$-th odd number, $2(k + 1) - 1 = 2k + 1$, which is exactly the L-shaped layer that grows a $k \times k$ square into a $(k + 1) \times (k + 1)$ one.`,
      visual: layers(5, t`The step in pictures: a $4 \times 4$ square plus the next odd number, $9$ (gold), makes a $5 \times 5$ square.`),
    }),
    mcq({
      id: 'what-assume', difficulty: 2,
      prompt: t`In the inductive step of a proof that $P(n)$ holds for all $n \ge 1$, what do you assume, and what do you show?`,
      choices: [
        t`Assume $P(k)$ for one arbitrary $k \ge 1$; show $P(k + 1)$.`,
        t`Assume $P(n)$ for every $n$; show $P(k + 1)$.`,
        t`Assume $P(k + 1)$; show $P(k)$.`,
        t`Assume $P(1)$; show $P(2)$.`,
      ],
      answer: 0,
      why: {
        1: t`Assuming $P(n)$ for every $n$ assumes the whole theorem — that is circular.`,
        2: t`That runs the chain backwards: knowing a domino fell because the next one did tells you nothing about the first push.`,
        3: t`That is only one link. The step must work for *every* $k$, not just the first.`,
      },
      hints: [t`The step is one link of the chain: from any domino to the next.`],
      teach: t`The induction hypothesis is $P(k)$ for a single, arbitrary $k$ — one link, proved for every link at once.`,
      explain: t`Because $k$ is arbitrary, proving $P(k) \Rightarrow P(k + 1)$ proves every link $P(1) \Rightarrow P(2)$, $P(2) \Rightarrow P(3)$, … at once. With the base case, the whole chain falls.`,
      visual: { ...dominoes({ n: 8, fallen: 4, caption: t`Domino $k$ (here the fourth) has fallen; the step must show it topples domino $k + 1$.` }) },
    }),
    expr({
      id: 'gauss-step', difficulty: 3,
      prompt: t`Proving $1 + 2 + \cdots + n = \dfrac{n(n + 1)}{2}$ by induction, the step assumes $1 + \cdots + k = \dfrac{k(k + 1)}{2}$ and adds $k + 1$. Simplify $\dfrac{k(k + 1)}{2} + (k + 1)$ to a fully factored form.`,
      answer: '(k + 1)(k + 2)/2', answerTeX: t`\frac{(k + 1)(k + 2)}{2}`,
      vars: { k: [1, 8] }, form: 'factored',
      errors: [{ answer: 'k(k + 1)/2 + k', feedback: t`The term added is $k + 1$, the next number after $k$.` }],
      hints: [t`Take out the common factor $(k + 1)$.`, t`$\dfrac{k(k + 1)}{2} + (k + 1) = (k + 1)\left(\dfrac{k}{2} + 1\right)$.`],
      teach: t`In the step, aim the algebra at the target: the formula with $n$ replaced by $k + 1$.`,
      explain: t`$(k + 1)\left(\dfrac{k}{2} + 1\right) = \dfrac{(k + 1)(k + 2)}{2}$ — exactly $\dfrac{n(n + 1)}{2}$ at $n = k + 1$, so $P(k) \Rightarrow P(k + 1)$.`,
      visual: bars({ values: [1, 2, 3, 4, 5, 6], colors: ['accent', 'accent', 'accent', 'accent', 'accent', 'gold'], xlabel: 'term', caption: t`$1 + 2 + \cdots + k$ (blue, drawn for $k = 5$) and the term the step adds, $k + 1$ (gold).` }),
    }),
    mcq({
      id: 'no-base', difficulty: 3, kind: 'error',
      prompt: t`Find the error. “Claim: every whole number $n$ equals $n + 1$. Step: assume $k = k + 1$; adding $1$ to both sides gives $k + 1 = k + 2$, which is the claim for $k + 1$. So by induction it holds for every $n$.”`,
      choices: ['There is no base case, and P(1), 1 = 2, is false', 'Adding 1 to both sides is not allowed', 'The step should assume P(k + 1), not P(k)', 'Induction cannot be used for equations'],
      answer: 0,
      why: {
        1: t`Adding the same number to both sides of an equation is always valid. The step really is correct.`,
        2: t`Assuming $P(k)$ and deriving $P(k + 1)$ is exactly the right shape for a step.`,
        3: t`Induction proves equations all the time (every sum formula in this lesson).`,
      },
      hints: [t`Check the two parts of an induction proof separately. Which one is missing?`, t`Try $n = 1$.`],
      teach: t`A perfect inductive step proves nothing without a true base case: the first domino must fall.`,
      explain: t`The step $P(k) \Rightarrow P(k + 1)$ is valid, but $P(1)$ says $1 = 2$, which is false — so the chain is never started. Every domino is spaced perfectly; none is pushed.`,
      visual: dominoes({ n: 8, fallen: 0, caption: t`Perfect spacing, but no push: nothing falls.` }),
    }),
    mcq({
      id: 'broken-link', difficulty: 3,
      prompt: t`Claim: $2^n \ge n^2$ for every $n \ge 1$. It holds for $n = 1$ and $n = 2$. Trying the step: from $2^k \ge k^2$ we get $2^{k+1} \ge 2k^2$, and $2k^2 \ge (k + 1)^2$ holds only when $k \ge 3$. Which link $P(k) \Rightarrow P(k + 1)$ fails?`,
      choices: [t`$P(2) \Rightarrow P(3)$`, t`$P(1) \Rightarrow P(2)$`, t`$P(3) \Rightarrow P(4)$`, t`none: the claim is true for every $n$`],
      answer: 0,
      why: {
        1: t`$P(2)$ is true ($4 \ge 4$), so this link holds; the trouble is the next one.`,
        2: t`For $k = 3$ the step works ($2\cdot9 = 18 \ge 16$), and in fact $P(4)$, $P(5)$, … are all true.`,
        3: t`$n = 3$ is a counterexample: $8 < 9$.`,
      },
      hints: [t`For which $k$ is $2k^2 \ge (k + 1)^2$ false?`, t`Check $n = 3$ directly.`],
      teach: t`One broken link stops the chain: the step must hold for every $k$ from the base case on.`,
      explain: t`At $k = 2$, $2k^2 = 8 < 9$: the link fails, and so does $P(3)$, since $2^3 = 8 < 9 = 3^2$. The fix is a later start: $P(4)$ ($16 \ge 16$) is true and the step works for every $k \ge 3$, so $2^n \ge n^2$ for every $n \ge 4$.`,
      visual: dominoes({ n: 8, fallen: 2, missing: [3], caption: t`The first two dominoes fall; with domino $3$ missing, the chain stops there.` }),
    }),
    num({
      id: 'hanoi', difficulty: 2,
      gen(r) {
        const n = r.int(5, 12), ans = 2 ** n - 1;
        return {
          prompt: t`In the Tower of Hanoi, moving $n$ discs takes $M(n) = 2M(n - 1) + 1$ moves (move $n - 1$ discs aside, move the largest, move them back), with $M(1) = 1$. Induction proves $M(n) = 2^n - 1$. How many moves for ${n} discs?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 ** n, feedback: t`One too many: $M(1) = 1 = 2^1 - 1$.` }, { value: 2 * n - 1, feedback: t`Each disc does not add a fixed number of moves: the count doubles each time.` }],
          hints: [t`$M(1) = 1$, $M(2) = 3$, $M(3) = 7$: one less than a power of two.`],
          teach: t`A recursion $M(n) = 2M(n - 1) + 1$ with $M(1) = 1$ solves to $2^n - 1$; induction proves it.`,
          explain: t`$M(${n}) = 2^{${n}} - 1 = ${ans}$. The step: if $M(k) = 2^k - 1$, then $M(k + 1) = 2(2^k - 1) + 1 = 2^{k+1} - 1$ — the same algebra as the worked example.`,
          visual: bars({ values: [1, 3, 7, 15], labels: ['1', '3', '7', '15'], xlabel: 'discs n', caption: t`Moves for $1$ to $4$ discs.` }),
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-geo-step', difficulty: 3,
      gen(r) {
        const b = r.pick([3, 5]), d = b - 1;
        return {
          prompt: t`To prove $1 + ${b} + ${b}^2 + \cdots + ${b}^{\,n-1} = \dfrac{${b}^n - 1}{${d}}$ by induction, the step assumes it for $n = k$ and adds the next term, $${b}^k$. Simplify $\dfrac{${b}^k - 1}{${d}} + ${b}^k$.`,
          answer: `(${b}^(k + 1) - 1)/${d}`, answerTeX: t`\frac{${b}^{k+1} - 1}{${d}}`,
          vars: { k: [1, 6] },
          errors: [{ answer: `(${b}^k - 1)/${d} + ${b}^(k+1)`, feedback: t`The term added to reach $n = k + 1$ is $${b}^k$, not $${b}^{k+1}$: the $n$-th term is $${b}^{n-1}$.` }],
          hints: [t`Put everything over $${d}$: $\dfrac{${b}^k - 1 + ${d}\cdot${b}^k}{${d}}$.`, t`$${b}^k + ${d}\cdot${b}^k = ${b}\cdot${b}^k = ${b}^{k+1}$.`],
          teach: t`The inductive step should land exactly on the formula with $n = k + 1$.`,
          explain: t`$\dfrac{${b}^k - 1 + ${d}\cdot${b}^k}{${d}} = \dfrac{${b}\cdot${b}^k - 1}{${d}} = \dfrac{${b}^{k+1} - 1}{${d}}$: the formula at $n = k + 1$. With the base case $1 = (${b} - 1)/${d}$, the proof is complete.`,
          visual: bars({ values: [1, b, b * b, b ** 3], colors: ['accent', 'accent', 'accent', 'gold'], xlabel: 'term', caption: t`The terms $1, ${b}, ${b}^2$ (blue) and the next term $${b}^3$ (gold) the step adds, drawn for $k = 3$.` }),
        };
      },
    }),
    mcq({
      id: 'cp-bounce', difficulty: 2, transfer: true,
      prompt: t`A lander’s test article rebounds each time to a fraction $f$ of the height it fell from. Claim: after $n$ bounces it reaches $h f^{n}$, where $h$ is the drop height. Which is a correct inductive step?`,
      choices: [
        t`If after $k$ bounces it reaches $hf^k$, the next bounce reaches $f$ times that: $hf^{k+1}$.`,
        t`After $1$, $2$ and $3$ bounces it reaches $hf$, $hf^2$, $hf^3$, so the pattern continues.`,
        t`Assume it reaches $hf^n$ after every $n$ bounces; then in particular after $k + 1$.`,
        t`If after $k + 1$ bounces it reaches $hf^{k+1}$, then after $k$ bounces it reached $hf^k$.`,
      ],
      answer: 0,
      why: {
        1: t`Checking three cases is evidence, not a proof: it never links each case to the next.`,
        2: t`That assumes the whole claim for every $n$ — circular reasoning.`,
        3: t`That goes backwards, from $k + 1$ to $k$; the chain must run forwards from the base case.`,
      },
      hints: [t`The step assumes the claim for one $k$ and uses the physics of one more bounce.`],
      teach: t`The inductive step uses the rule that takes you from one case to the next — here, one bounce.`,
      explain: t`With the base case ($0$ bounces: height $h = hf^0$), the step $hf^k \to f\cdot hf^k = hf^{k+1}$ proves the claim for every $n$. Real bounces are not exactly geometric — the rebound fraction changes with impact speed — but the model is what is being proved.`,
      visual: bars({ values: [1, 0.6, 0.36, 0.216, 0.13], k0: 0, xlabel: 'bounces n', ylabel: 'height ÷ h', caption: t`Rebound heights for $f = 0.6$, as a fraction of the drop height.` }),
    }),
    mcq({
      id: 'cp-two-step', difficulty: 3,
      prompt: t`A proof shows that $P(1)$ and $P(2)$ are true, and that $P(k) \Rightarrow P(k + 2)$ for every $k \ge 1$. For which $n$ has it proved $P(n)$?`,
      choices: [t`every $n \ge 1$`, t`only odd $n$`, t`only $n = 1$ and $n = 2$`, t`only even $n$`],
      answer: 0,
      why: {
        1: t`Odd $n$ follow from $P(1)$: $1 \to 3 \to 5 \to \cdots$. But $P(2)$ starts a second chain.`,
        2: t`The step carries each case two ahead, for ever, so far more than the base cases is proved.`,
        3: t`Even $n$ follow from $P(2)$, but $P(1)$ starts the odd chain too.`,
      },
      hints: [t`Follow the arrows from $1$, then from $2$.`, t`From $1$ the step reaches $3, 5, 7, \ldots$; from $2$ it reaches $4, 6, 8, \ldots$`],
      teach: t`Induction can step by $2$ (or more), as long as there is a base case for each starting point.`,
      explain: t`$P(1)$ with the step gives $P(3), P(5), \ldots$; $P(2)$ gives $P(4), P(6), \ldots$ Together they cover every $n \ge 1$: two interleaved rows of dominoes, each pushed.`,
      visual: { type: 'graph', params: { x: [0.3, 9.7], y: [-0.8, 1.6], aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', points: Array.from({ length: 9 }, (_, i) => ({ x: i + 1, y: 0, color: i < 2 ? 'gold' : 'accent', r: 6, label: String(i + 1), labelAlign: 'center', labelDx: 0, labelDy: 18 })), curves: Array.from({ length: 7 }, (_, i) => ({ param: [`${i + 1} + 2*t`, `${i % 2 ? 0.6 : 1.1}*sin(pi*t)`], t: [0.08, 0.92], color: i % 2 ? 'teal' : 'violet', width: 1.8 })) }, caption: t`Each arc is one use of the step, from $k$ to $k + 2$; the gold dots are the two base cases.` },
    }),
  ],
  sources: [
    { label: 'R. Hammack, Book of Proof (3rd ed.), ch. 10 Mathematical Induction', url: 'https://richardhammack.github.io/BookOfProof/' },
  ],
});
