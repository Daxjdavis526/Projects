// Direct proof and counterexamples — proving "for every" claims from definitions, and killing false ones with a single example.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { N, bars, areaModel } from './_m0kit.js';
import { isPrime } from './_m0reason.js';

const t = String.raw;
const EULER = Array.from({ length: 46 }, (_, n) => n * n + n + 41);

/** (2a + 1)(2b + 1) as an area: a 2a × 2b block, two strips and a unit square. */
function oddArea(a, b, labels, caption) {
  const W = 2 * a + 1, Hh = 2 * b + 1;
  return areaModel({
    rects: [
      { x: 0, y: 0, w: 2 * a, h: 2 * b, color: 'accent', alpha: 0.3, label: labels[0] },
      { x: 2 * a, y: 0, w: 1, h: 2 * b, color: 'gold', alpha: 0.35, label: labels[1] },
      { x: 0, y: 2 * b, w: 2 * a, h: 1, color: 'gold', alpha: 0.35, label: labels[2] },
      { x: 2 * a, y: 2 * b, w: 1, h: 1, color: 'warn', alpha: 0.5, label: '1' },
    ],
    x: [-1, W + 1], y: [-0.6, Hh + 0.6], caption,
  });
}

export default lesson({
  id: 'm0.M0-14.2',
  title: 'Direct proof and counterexamples',
  minutes: 11, difficulty: 2,
  intro: t`A claim about **every** case — every odd number, every triangle — cannot be proved by checking cases: there are infinitely many. A **direct proof** takes an *arbitrary* case, assumes the hypothesis, and reasons step by step to the conclusion, using only definitions and facts already known. The definitions do the work: an integer $n$ is **even** if $n = 2k$ for some integer $k$, and **odd** if $n = 2k + 1$. For example, every odd square is odd:

$$n = 2k + 1 \;\Rightarrow\; n^2 = 4k^2 + 4k + 1 = 2\,(2k^2 + 2k) + 1.$$

The other direction is cheaper: to show a “for every” claim is **false**, one **counterexample** is enough. Checking a million cases proves nothing; one failure disproves it.`,
  symbols: [
    { tex: 'n', text: 'an arbitrary integer: nothing is assumed about it except the hypothesis' },
    { tex: 'k', text: 'an integer that the definition of even or odd says exists' },
    { tex: '2k,\\ 2k + 1', text: 'the forms of an even and of an odd integer' },
  ],
  why: t`Physics leans on theorems — conservation laws, uniqueness of solutions, the properties of vectors — and a direct proof is how you check that one really applies. Hunting for counterexamples is how you find a theorem’s limits before nature does. [Foundations G1](#/lesson/st-g.G1.2) continues with proof by contrapositive.`,
  visual: {
    type: 'graph',
    title: 'Hunting a counterexample',
    lead: t`Euler noticed in 1772 that $n^2 + n + 41$ gives a prime for $n = 0, 1, 2, \ldots$ — for a long time. Slide $N$ to reveal the values up to $n = N$: green dots are prime, red ones are not.`,
    tasks: [
      t`Slide to $N = 39$: forty primes in a row. Tempting to call it a theorem.`,
      t`Now $N = 40$: $40^2 + 40 + 41 = 1681 = 41 \times 41$. One red dot, and the claim “always prime” is dead.`,
      t`Can you see why $n = 40$ had to fail? $40^2 + 40 = 40 \times 41$, so the whole thing is $41 \times 41$. A counterexample is often found by thinking, not by searching.`,
    ],
    params: {
      x: [-1, 46], y: [0, 2300], aspect: 'wide', xlabel: 'n', ylabel: 'n² + n + 41',
      sliders: [{ key: 'N', label: t`Show values up to $n = N$`, min: 0, max: 45, step: 1, value: 20, explain: t`How many cases have been checked so far.` }],
      curves: [{ fn: 'x^2 + x + 41', color: 'ink4', width: 1.2, dash: true }],
      points: EULER.map((v, n) => ({ x: n, y: v, r: 4, color: isPrime(v) ? 'good' : 'bad', when: `step(N - ${n} + 0.5)` })),
      readouts: [{ label: t`$N^2 + N + 41$`, expr: 'N^2 + N + 41', digits: 4 }],
    },
    caption: t`Exact values. Primes are green, composite numbers red. Forty successes did not make the claim true.`,
  },
  example: {
    prompt: t`Prove that the square of every odd integer is odd.`,
    visual: oddArea(3, 3, ['4k²', '2k', '2k'], t`$(2k + 1)^2$ as an area, drawn for $k = 3$: a $2k$ by $2k$ block ($4k^2$), two $2k$ strips and one unit square left over. Everything but the unit square comes in pairs.`),
    steps: [
      { label: 'Take an arbitrary case', text: t`Let $n$ be any odd integer. Nothing else is assumed: the proof must work for all of them at once.` },
      { label: 'Use the definition', text: t`Odd means $n = 2k + 1$ for some integer $k$.` },
      { label: 'Compute', text: t`$n^2 = (2k + 1)^2 = 4k^2 + 4k + 1$.` },
      { label: 'Reach the definition again', text: t`$4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$, and $m = 2k^2 + 2k$ is an integer. So $n^2 = 2m + 1$: odd, by definition.` },
      { label: 'What it buys', text: t`Its contrapositive is just as true: if $n^2$ is even, then $n$ is even. That fact is the key step in [proving that $\sqrt2$ is irrational](#/lesson/m0.M0-14.3).` },
    ],
    answer: t`$n = 2k + 1 \Rightarrow n^2 = 2(2k^2 + 2k) + 1$, which is odd. $\blacksquare$`,
  },
  practice: [
    order({
      id: 'even-sum', difficulty: 1,
      prompt: t`Put the steps of a direct proof that **the sum of two even integers is even** in order.`,
      items: [t`Let $m$ and $n$ be any two even integers.`, t`Then $m = 2a$ and $n = 2b$ for some integers $a$ and $b$.`, t`So $m + n = 2a + 2b = 2(a + b)$.`, t`Since $a + b$ is an integer, $m + n$ is even.`],
      hints: [t`Start with the hypothesis about arbitrary numbers, then use the definition, compute, and finish by matching the definition again.`],
      teach: t`A direct proof: assume the hypothesis for an arbitrary case, unpack the definitions, compute, and repack into the conclusion’s definition.`,
      explain: t`Each line follows from the one before. The last line checks the result against the definition of even — the step that is most often skipped.`,
      visual: { type: 'graph', params: { x: [-0.5, 10.5], y: [-0.6, 2.2], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', points: [...Array.from({ length: 6 }, (_, i) => ({ x: Math.floor(i / 2), y: i % 2 ? 1.4 : 0.6, color: 'accent', r: 6 })), ...Array.from({ length: 4 }, (_, i) => ({ x: 3.6 + Math.floor(i / 2), y: i % 2 ? 1.4 : 0.6, color: 'gold', r: 6 })), { x: 2.3, y: 0, r: 0, label: '6 + 4 = 10, still in pairs', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }] }, caption: t`Even numbers as dots in pairs: put two such rows together and every dot still has a partner.` },
    }),
    mcq({
      id: 'square-order', difficulty: 2,
      prompt: t`Which pair is a counterexample to the claim “for all real numbers $a$ and $b$, if $a > b$ then $a^2 > b^2$”?`,
      choices: [t`$a = 1$, $b = -2$`, t`$a = 3$, $b = 2$`, t`$a = -2$, $b = 1$`, t`$a = 2$, $b = 2$`],
      answer: 0,
      why: {
        1: t`Here $a > b$ and $9 > 4$: the claim holds, so this is an example, not a counterexample.`,
        2: t`A counterexample must satisfy the hypothesis; here $a < b$, so it tests nothing.`,
        3: t`$a > b$ is false here ($2 = 2$), so the claim makes no promise about it.`,
      },
      hints: [t`You need $a > b$ to be **true** and $a^2 > b^2$ to be **false**. Try a negative $b$.`],
      teach: t`A counterexample makes the hypothesis true and the conclusion false.`,
      explain: t`$1 > -2$, but $1^2 = 1$ is not greater than $(-2)^2 = 4$. The claim does hold when both numbers are positive — counterexamples show exactly which extra condition a theorem needs.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.5, 6], aspect: 'wide', xlabel: 'x', ylabel: 'x²', curves: [{ fn: 'x^2', color: 'accent' }] }, caption: t`$y = x^2$: it falls on the left of $0$ and rises on the right, so a bigger $x$ need not have a bigger square.` },
    }),
    num({
      id: 'euler-small', difficulty: 2,
      gen(r) {
        const p = r.pick([5, 11, 17]);
        let n = 0; while (isPrime(n * n + n + p)) n++;
        return {
          prompt: t`Claim: $n^2 + n + ${p}$ is prime for every whole number $n \ge 0$. What is the smallest counterexample $n$?`,
          answer: n, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: p, feedback: t`At $n = ${p}$ the value is $${p * p + 2 * p} = ${p}\times${p + 2}$, composite — but a smaller $n$ fails first.` }].filter((e) => e.value !== n),
          hints: [t`Look for an $n$ that makes $n^2 + n$ a multiple of ${p}: then the whole sum is too.`, t`Try $n = ${p - 1}$: $n^2 + n = n(n + 1)$.`],
          teach: t`A clever choice beats a long search: make every term share a factor.`,
          explain: t`At $n = ${n}$, $n^2 + n = ${n}\times${n + 1}$, so $n^2 + n + ${p} = ${p}(${n} + 1) = ${p}^2 = ${p * p}$ — not prime. Every smaller $n$ gives a prime (check: ${Array.from({ length: n }, (_, k) => k * k + k + p).join(', ')}).`,
          visual: { type: 'graph', params: { x: [-0.6, p + 1.6], y: [0, (p + 1) ** 2 + p + 2], aspect: 'wide', xlabel: 'n', ylabel: `n² + n + ${p}`, xticks: Math.min(p + 2, 12), points: Array.from({ length: p + 2 }, (_, k) => ({ x: k, y: k * k + k + p, color: 'accent', r: 4 })) }, caption: t`The values for small $n$, all uncoloured: which is the first that is not prime?` },
        };
      },
    }),
    mcq({
      id: 'not-a-proof', difficulty: 2,
      prompt: t`Which of these proves that $n(n + 1)$ is even for every integer $n$?`,
      choices: [
        t`Of two consecutive integers one is even, and an even number times any integer is even.`,
        t`A computer checked every $n$ from $1$ to $10^{9}$ and found no exception.`,
        t`For $n = 2$ it is $6$, which is even, and the same pattern clearly continues.`,
        t`If $n(n + 1)$ is even, then one of $n$ and $n + 1$ is even.`,
      ],
      answer: 0,
      why: {
        1: t`Checking cases — even a billion — leaves infinitely many unchecked. (Euler’s $n^2 + n + 41$ passes forty checks and then fails.)`,
        2: t`One example shows nothing about the others; “clearly continues” is the claim itself, not a reason.`,
        3: t`That is the converse: it assumes the conclusion and deduces something else.`,
      },
      hints: [t`A proof must cover *every* $n$ at once, using only definitions and known facts.`],
      teach: t`Examples can disprove a “for every” claim, but never prove one.`,
      explain: t`Write $n$ as even ($2k$) or odd ($2k + 1$): in the first case $n(n+1) = 2k(n + 1)$, in the second $n + 1 = 2k + 2 = 2(k + 1)$. Either way there is a factor $2$, for every integer at once.`,
      visual: bars({ values: [1, 2, 3, 4, 5, 6, 7].map((n) => n * (n + 1)), labels: [1, 2, 3, 4, 5, 6, 7].map((n) => String(n * (n + 1))), xlabel: 'n', caption: t`$n(n + 1)$ for $n = 1$ to $7$: all even so far — but seven cases prove nothing on their own.` }),
    }),
    mcq({
      id: 'pythag', difficulty: 1,
      prompt: t`True or false: $\sqrt{a^2 + b^2} = a + b$ for all positive numbers $a$ and $b$?`,
      choices: [t`False: $a = 3$, $b = 4$ gives $5$, not $7$`, t`True: square both sides and the squares match`, t`True, since the square root undoes the squares`, t`False, but only when $a$ or $b$ is negative`],
      answer: 0,
      why: {
        1: t`Squaring $a + b$ gives $a^2 + 2ab + b^2$, not $a^2 + b^2$: the sides differ by $2ab$.`,
        2: t`A square root undoes a square only of the whole sum: $\sqrt{(a + b)^2} = a + b$, but $\sqrt{a^2 + b^2}$ is something else.`,
        3: t`It fails for positive numbers too — the $3$, $4$ case is one.`,
      },
      hints: [t`Try a right triangle whose sides you know.`],
      teach: t`One counterexample settles a “for all” claim: test simple numbers before believing an algebra rule.`,
      explain: t`$\sqrt{3^2 + 4^2} = \sqrt{25} = 5$, but $3 + 4 = 7$. Geometrically: the hypotenuse is shorter than the two legs together.`,
      visual: { type: 'graph', params: { x: [-0.5, 7], y: [-0.5, 4.5], equal: true, aspect: 'wide', xlabel: '', ylabel: '', grid: true, curves: [{ param: ['4*t', '0'], t: [0, 1], color: 'accent', width: 2.6 }, { param: ['4', '3*t'], t: [0, 1], color: 'accent', width: 2.6 }, { param: ['4*t', '3*t'], t: [0, 1], color: 'gold', width: 2.6 }], points: [{ x: 2, y: 0, r: 0, label: '4', labelAlign: 'center', labelDx: 0, labelDy: 14, color: 'accent' }, { x: 4, y: 1.5, r: 0, label: '3', labelAlign: 'left', labelDx: 8, labelDy: 0, color: 'accent' }, { x: 2, y: 1.5, r: 0, label: '?', labelAlign: 'center', labelDx: -10, labelDy: -10, color: 'gold' }] }, caption: t`A right triangle with legs $3$ and $4$: its hypotenuse is $\sqrt{3^2 + 4^2}$.` },
    }),
    expr({
      id: 'three-consec', difficulty: 2,
      prompt: t`To prove that the sum of any three consecutive integers is divisible by $3$, write $n + (n + 1) + (n + 2)$ as $3$ times an integer — that is, in factored form.`,
      answer: '3(n + 1)', answerTeX: t`3(n + 1)`,
      vars: { n: [-5, 5] }, form: 'factored',
      errors: [{ answer: '3n + 3', feedback: t`That is the right value, but the proof needs it as $3 \times$ (an integer): factor out the $3$.` }],
      hints: [t`Add up: $n + (n + 1) + (n + 2) = 3n + 3$.`, t`Take out the common factor $3$.`],
      teach: t`“Divisible by $3$” means “equal to $3 \times$ an integer”: the proof must produce that form.`,
      explain: t`$n + (n + 1) + (n + 2) = 3n + 3 = 3(n + 1)$, and $n + 1$ is an integer, so the sum is divisible by $3$. In fact it is $3$ times the middle number.`,
      visual: bars({ values: [4, 5, 6], k0: 1, labels: ['n', 'n + 1', 'n + 2'], xlabel: '', colors: ['accent', 'gold', 'accent'], extra: { hlines: [{ y: 5, color: 'gold' }] }, caption: t`Three consecutive integers (drawn for $n = 4$): move one unit from the tallest to the shortest and all three equal the middle one.` }),
    }),
    mcq({
      id: 'one-equals-two', difficulty: 3, kind: 'error',
      prompt: t`Find the error. “Let $a = b$. Then (1) $a^2 = ab$, so (2) $a^2 - b^2 = ab - b^2$, so (3) $(a + b)(a - b) = b(a - b)$, so (4) $a + b = b$, so (5) $2b = b$, and (6) $2 = 1$.”`,
      choices: ['Step 4: it divides both sides by a − b, which is zero', 'Step 1: you cannot multiply both sides by a', 'Step 3: the factorisation is wrong', 'Step 6: dividing by b is not allowed'],
      answer: 0,
      why: {
        1: t`Multiplying both sides of a true equation by the same number keeps it true.`,
        2: t`$a^2 - b^2 = (a + b)(a - b)$ is a correct factorisation.`,
        3: t`Step 6 divides by $b$, which is fine as long as $b \ne 0$; the real damage was done earlier.`,
      },
      hints: [t`Since $a = b$, what is $a - b$?`, t`Which step divides by $a - b$?`],
      teach: t`Dividing by an expression is valid only when it cannot be zero — a classic hidden error in “proofs”.`,
      explain: t`Step 3 is true ($0 = 0$). Step 4 cancels the factor $a - b = 0$, and from $x\cdot0 = y\cdot0$ nothing follows about $x$ and $y$. Every step of a proof must be valid for every case it covers.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-3, 3], equal: true, aspect: 'wide', xlabel: 'a', ylabel: 'b', curves: [{ fn: 'x', color: 'warn', width: 2.4 }], points: [{ x: 1.6, y: 1.6, r: 0, label: 'a − b = 0 here', labelAlign: 'left', labelDx: 10, labelDy: 6, color: 'warn' }] }, caption: t`The hypothesis $a = b$ puts every case on this line, where $a - b = 0$ — exactly where division by $a - b$ is not allowed.` },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-orbit', difficulty: 2, transfer: true,
      prompt: t`Claim: “If an object’s speed is constant, its acceleration is zero.” Which of these is a counterexample?`,
      choices: ['A satellite in a circular orbit', 'A rocket speeding up along a straight line', 'A car parked in a garage', 'A ball thrown straight up, at the top of its flight'],
      answer: 0,
      why: {
        1: t`Its speed is changing, so the hypothesis is false: it cannot be a counterexample.`,
        2: t`Constant speed (zero) and zero acceleration: it agrees with the claim.`,
        3: t`At the top its speed is momentarily zero but *changing*; the hypothesis “speed is constant” fails.`,
      },
      hints: [t`You need constant speed **and** nonzero acceleration. Acceleration is a change in velocity — in its direction too.`],
      teach: t`Acceleration measures any change of velocity, including a change of direction at constant speed.`,
      explain: t`A satellite in a circular orbit keeps the same speed, but its velocity turns constantly, so it accelerates towards the Earth’s centre at $v^2/r$. The claim needs “velocity”, not “speed”.`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['1.2*cos(t)', '1.2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6, dash: true }], points: [{ x: 0, y: 0, color: 'teal', r: 8 }, { x: N(1.2 * Math.cos(0.7)), y: N(1.2 * Math.sin(0.7)), color: 'gold', r: 5 }], arrows: [{ from: [N(1.2 * Math.cos(0.7)), N(1.2 * Math.sin(0.7))], to: [N(1.2 * Math.cos(0.7) - 0.9 * Math.sin(0.7)), N(1.2 * Math.sin(0.7) + 0.9 * Math.cos(0.7))], color: 'accent', label: 'v' }, { from: [N(1.2 * Math.cos(0.7)), N(1.2 * Math.sin(0.7))], to: [N(0.55 * Math.cos(0.7)), N(0.55 * Math.sin(0.7))], color: 'warn', label: 'a', labelDx: -16 }] }, caption: t`A satellite on a circular orbit: velocity along the path, acceleration towards the centre. Arrows show directions only.` },
    }),
    expr({
      id: 'cp-odd-product', difficulty: 3,
      prompt: t`To prove that the product of two odd integers is odd, write them as $2a + 1$ and $2b + 1$. Then $(2a + 1)(2b + 1) = 2m + 1$ for which integer $m$? Give $m$ in terms of $a$ and $b$.`,
      answer: '2ab + a + b', answerTeX: t`2ab + a + b`,
      vars: { a: [-4, 4], b: [-4, 4] },
      errors: [{ answer: '4ab + 2a + 2b', feedback: t`That is $(2a + 1)(2b + 1) - 1$; you want half of it, since the product is $2m + 1$.` }, { answer: 'ab + a + b', feedback: t`Expand carefully: $(2a + 1)(2b + 1) = 4ab + 2a + 2b + 1$.` }],
      hints: [t`Expand: $(2a + 1)(2b + 1) = 4ab + 2a + 2b + 1$.`, t`Take a factor $2$ out of everything but the $1$.`],
      teach: t`To show a number is odd, write it as $2 \times$ (an integer) $+ 1$.`,
      explain: t`$(2a + 1)(2b + 1) = 4ab + 2a + 2b + 1 = 2(2ab + a + b) + 1$, and $2ab + a + b$ is an integer, so the product is odd.`,
      visual: oddArea(2, 3, ['4ab', '2b', '2a'], t`$(2a + 1)(2b + 1)$ as an area, drawn for $a = 2$, $b = 3$: everything except the corner square comes in pairs.`),
    }),
    num({
      id: 'cp-counter', difficulty: 3,
      gen(r) {
        const p = r.pick([11, 17, 41]);
        let n = 0; while (isPrime(n * n - n + p)) n++;
        return {
          prompt: t`Claim: $n^2 - n + ${p}$ is prime for every whole number $n \ge 0$. Find the smallest counterexample $n$.`,
          answer: n, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n - 1, feedback: t`At $n = ${n - 1}$ the value is $${(n - 1) ** 2 - (n - 1) + p}$, which is prime. Make $n^2 - n = n(n - 1)$ a multiple of $${p}$.` }],
          hints: [t`$n^2 - n = n(n - 1)$. When is that a multiple of $${p}$?`, t`The smallest positive choice is $n = ${p}$; check that smaller $n$ all give primes.`],
          teach: t`Choose the case that makes every term share a factor.`,
          explain: t`At $n = ${n}$: $n(n - 1) + ${p} = ${p}\times${p - 1} + ${p} = ${p}^2 = ${p * p}$, not prime. For $n = 1, \ldots, ${p - 1}$ the values are the same primes Euler’s $m^2 + m + ${p}$ gives (with $m = n - 1$), and $n = 0$ gives ${p}.`,
          visual: { type: 'graph', params: { x: [-0.6, 7.6], y: [0, 49 - 7 + p + 4], aspect: 'wide', xlabel: 'n', ylabel: `n² − n + ${p}`, xticks: 8, points: Array.from({ length: 8 }, (_, k) => ({ x: k, y: k * k - k + p, color: 'accent', r: 4 })) }, caption: t`The first few values: all primes, so far.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'R. Hammack, Book of Proof (3rd ed.), ch. 4 Direct Proof', url: 'https://richardhammack.github.io/BookOfProof/' },
  ],
});
