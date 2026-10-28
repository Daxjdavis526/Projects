// Proof by contradiction — assume the opposite and reach the impossible: √2 is irrational, the primes never end.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { N, bars, areaModel } from './_m0kit.js';
import { isPrime } from './_m0reason.js';

const t = String.raw;
const S2 = Math.SQRT2;
const NEAR = Array.from({ length: 40 }, (_, i) => { const q = i + 1, p = Math.round(q * S2); return { q, p, d: p * p - 2 * q * q }; });

/** Tennenbaum's picture: two q × q squares in opposite corners of a p × p square. If p² = 2q², the overlap equals the two uncovered corners. */
function squaresPic(p, q, caption) {
  const o = 2 * q - p, g = p - q;
  return areaModel({
    rects: [
      { x: 0, y: 0, w: p, h: p, color: 'ink4', alpha: 0.12, edge: 'ink2' },
      { x: 0, y: 0, w: q, h: q, color: 'accent', alpha: 0.28 },
      { x: g, y: g, w: q, h: q, color: 'accent', alpha: 0.28 },
      { x: g, y: g, w: o, h: o, color: 'gold', alpha: 0.45, label: `${o}×${o}` },
      { x: q, y: 0, w: g, h: g, color: 'warn', alpha: 0.4, label: `${g}×${g}` },
      { x: 0, y: q, w: g, h: g, color: 'warn', alpha: 0.4, label: `${g}×${g}` },
    ],
    sides: [{ x: p / 2, y: -0.55, label: `p = ${p}` }, { x: q / 2, y: g / 2, label: `q = ${q}` }],
    x: [-1.2, p + 1.2], y: [-1, p + 0.4], caption,
  });
}

export default lesson({
  id: 'm0.M0-14.3',
  title: 'Proof by contradiction',
  minutes: 11, difficulty: 3,
  intro: t`To prove a statement $P$ **by contradiction**, assume it is false and reason until you reach something impossible — a number that is both even and odd, a fraction in lowest terms that is not. Since valid reasoning from a true assumption cannot reach a falsehood, the assumption $\neg P$ must have been false, so $P$ is true. The classic example is that $\sqrt2$ cannot be a fraction:

$$\sqrt2 = \frac{p}{q}\ \text{in lowest terms} \;\Rightarrow\; p^2 = 2q^2 \;\Rightarrow\; p \text{ and } q \text{ both even} \;\Rightarrow\; \text{not in lowest terms.}$$

Contradiction is the natural tool for claims of *impossibility* or *non-existence* — “there is no fraction”, “there is no largest prime” — where there is nothing to construct directly.`,
  symbols: [
    { tex: 'P', text: 'the statement to be proved' },
    { tex: '\\neg P', text: 'its negation, assumed for the sake of argument' },
    { tex: 'p,\\ q', text: 'whole numbers with no common factor (a fraction in **lowest terms**), $q \\ne 0$' },
  ],
  why: t`Impossibility results run through physics: no finite set of fractions measures the diagonal of a square, no engine beats the Carnot efficiency, no signal outruns light. Each is argued by assuming the opposite and finding a contradiction. [Foundations G1](#/lesson/st-g.G1.3) takes the method further.`,
  visual: {
    type: 'graph',
    title: 'Near misses, never a hit',
    lead: t`For each denominator $q$, take the whole number $p$ nearest to $q\sqrt2$ and plot $p^2 - 2q^2$. If $\sqrt2$ were a fraction $p/q$, some dot would sit on the zero line. Slide $N$ to try more denominators.`,
    tasks: [
      t`The best fractions, $\tfrac32$, $\tfrac75$, $\tfrac{17}{12}$, $\tfrac{41}{29}$, miss by exactly $\pm1$ — as close as whole numbers can get without hitting.`,
      t`Slide to $N = 40$: forty denominators, no zero. The proof says that a billion, or any number, would still give none.`,
      t`Notice the gold dots alternate above and below: the best fractions are alternately a little too big and a little too small.`,
    ],
    params: {
      x: [0, 41], y: [-60, 60], aspect: 'wide', xlabel: 'denominator q', ylabel: 'p² − 2q²',
      sliders: [{ key: 'N', label: t`Denominators tried, up to $N$`, min: 1, max: 40, step: 1, value: 12, explain: t`Each $q$ from $1$ to $N$ is paired with the nearest whole $p$.` }],
      hlines: [{ y: 0, color: 'bad', label: 'p/q = √2 exactly' }],
      points: NEAR.map(({ q, d }) => ({ x: q, y: d, r: Math.abs(d) === 1 ? 5.5 : 4, color: Math.abs(d) === 1 ? 'gold' : 'accent', when: `step(N - ${q} + 0.5)` })),
    },
    caption: t`Exact integer arithmetic for each $q$. Gold dots miss by exactly $1$: they are the fractions $p/q$ nearest to $\sqrt2$ for their size.`,
  },
  example: {
    prompt: t`Prove that $\sqrt2$ is irrational: it is not equal to any fraction $p/q$ of whole numbers.`,
    visual: squaresPic(7, 5, t`A geometric version (Tennenbaum’s). Two $q \times q$ squares sit in opposite corners of a $p \times p$ square. If $p^2 = 2q^2$, the two blue squares would exactly cover the big one’s area, so the gold overlap would equal the two red corners: a *smaller* square equal to two copies of another — a smaller solution, forever. Drawn for the near miss $p = 7$, $q = 5$, where $9 \ne 8$.`),
    steps: [
      { label: 'Assume the opposite', text: t`Suppose $\sqrt2 = p/q$ with whole numbers $p$, $q$. Cancel any common factor first, so the fraction is in **lowest terms**: $p$ and $q$ are not both even.` },
      { label: 'Square', text: t`$2 = p^2/q^2$, so $p^2 = 2q^2$. So $p^2$ is even.` },
      { label: 'So p is even', text: t`If $p$ were odd, $p^2$ would be odd ([M0-14.2](#/lesson/m0.M0-14.2)). So $p$ is even: $p = 2k$.` },
      { label: 'So q is even', text: t`Then $4k^2 = 2q^2$, so $q^2 = 2k^2$: $q^2$ is even, and by the same fact $q$ is even.` },
      { label: 'Contradiction', text: t`Both $p$ and $q$ are even — but we chose them in lowest terms. The assumption led to the impossible, so it is false: $\sqrt2$ is not a fraction.` },
    ],
    answer: t`Assuming $\sqrt2 = p/q$ in lowest terms forces $p$ and $q$ both to be even, which contradicts lowest terms. So $\sqrt2$ is irrational. $\blacksquare$`,
  },
  practice: [
    order({
      id: 'root2-order', difficulty: 2,
      prompt: t`Put the proof that $\sqrt2$ is irrational in order.`,
      items: [
        t`Suppose $\sqrt2 = p/q$ with $p/q$ in lowest terms.`,
        t`Then $p^2 = 2q^2$, so $p^2$ is even.`,
        t`So $p$ is even: write $p = 2k$.`,
        t`Then $q^2 = 2k^2$, so $q$ is even too.`,
        t`Both even contradicts lowest terms, so $\sqrt2$ is irrational.`,
      ],
      hints: [t`A proof by contradiction starts by assuming the opposite of what it wants, and ends by naming the contradiction.`],
      teach: t`Contradiction: assume the negation, reason validly, reach the impossible, conclude the original.`,
      explain: t`Each step uses the one before; the key fact, used twice, is that an even square has an even root.`,
      visual: squaresPic(17, 12, t`The near miss $17/12$: the gold overlap ($7\times7 = 49$) almost equals the two red corners ($2\times5\times5 = 50$). Equality would give a smaller solution — and so on for ever, which is impossible for whole numbers.`),
    }),
    mcq({
      id: 'euclid-start', difficulty: 1,
      prompt: t`Euclid proved by contradiction that there are infinitely many prime numbers. What is the first line of his proof?`,
      choices: ['Suppose there are only finitely many primes, p₁, p₂, …, pₙ.', 'Suppose there are infinitely many primes.', 'Suppose some number is not prime.', 'Suppose every number is prime.'],
      answer: 0,
      why: {
        1: t`That assumes what is to be proved. A proof by contradiction assumes the *negation*.`,
        2: t`That is true and leads nowhere; the assumption must be the negation of “there are infinitely many primes”.`,
        3: t`That is not the negation of the claim, and it is obviously false ($4$ is not prime).`,
      },
      hints: [t`Negate “there are infinitely many primes”.`],
      teach: t`A proof by contradiction begins by assuming the exact negation of the claim.`,
      explain: t`The negation of “infinitely many” is “finitely many”, so Euclid lists them all, $p_1, \ldots, p_n$, and then builds a number that none of them divides.`,
      visual: { type: 'graph', params: { x: [0, 51], y: [-1, 1], aspect: 'wide', xlabel: 'n', ylabel: '', yticks: 0, grid: false, points: Array.from({ length: 50 }, (_, i) => i + 1).filter(isPrime).map((n) => ({ x: n, y: 0, color: 'gold', r: 4.5 })) }, caption: t`The primes up to $50$. They thin out, but never stop.` },
    }),
    mcq({
      id: 'euclid-30031', difficulty: 3,
      prompt: t`In Euclid’s proof, suppose the only primes were $2, 3, 5, 7, 11, 13$. Then $N = 2\cdot3\cdot5\cdot7\cdot11\cdot13 + 1 = 30031$. But $30031 = 59 \times 509$ is not prime. Does the proof fail?`,
      choices: [
        'No: N leaves remainder 1 when divided by each listed prime, so its prime factors (59 and 509) are primes missing from the list',
        'Yes: the proof needs N to be prime',
        'No, because N is prime after all',
        'Yes: N is divisible by 13',
      ],
      answer: 0,
      why: {
        1: t`The proof never needs $N$ itself to be prime — only that every prime factor of $N$ is missing from the list.`,
        2: t`$30031 = 59\times509$, as stated; it is not prime.`,
        3: t`$30030$ is divisible by $13$, so $30031$ leaves remainder $1$.`,
      },
      hints: [t`What does the proof actually claim about $N$? Divide $N$ by $2$, $3$, $5$, … and look at the remainders.`, t`Any number above $1$ has at least one prime factor. Can that factor be on the list?`],
      teach: t`Euclid’s $N$ need not be prime: it just has a prime factor that is not on the list.`,
      explain: t`Every listed prime divides $N - 1$, so it leaves remainder $1$ in $N$. But $N > 1$ has some prime factor — here $59$ and $509$ — which therefore is not on the list. So no finite list holds all the primes.`,
      visual: bars({ values: [2, 3, 5, 7, 11, 13].map((p) => 30031 % p), labels: ['÷2', '÷3', '÷5', '÷7', '÷11', '÷13'], xlabel: '', ylabel: 'remainder', y: [0, 1.6], caption: t`The remainder when $30031$ is divided by each listed prime: always $1$.` }),
    }),
    multi({
      id: 'which-irrational', difficulty: 2,
      prompt: t`Select every irrational number.`,
      choices: [t`$\sqrt8$`, t`$\sqrt{9/4}$`, t`$0.333\ldots$ (threes for ever)`, t`$1 + \sqrt2$`, t`$\sqrt2 \times \sqrt8$`, t`$\sqrt{2}/2$`],
      answer: [0, 3, 5],
      why: {
        1: t`$\sqrt{9/4} = 3/2$, a fraction.`,
        2: t`A repeating decimal is a fraction: $0.333\ldots = 1/3$.`,
        4: t`$\sqrt2\times\sqrt8 = \sqrt{16} = 4$. Two irrationals can multiply to a whole number.`,
      },
      hints: [t`Simplify each first. If $1 + \sqrt2 = p/q$, what would $\sqrt2$ be?`],
      teach: t`A rational number plus or times (nonzero) an irrational stays irrational; but two irrationals can combine to a rational.`,
      explain: t`$\sqrt8 = 2\sqrt2$, $1 + \sqrt2$ and $\sqrt2/2$ are irrational: if any equalled a fraction, solving for $\sqrt2$ would make $\sqrt2$ a fraction — a contradiction. The others simplify to $3/2$, $1/3$ and $4$.`,
      visual: { type: 'graph', params: { x: [0, 4.4], y: [-1, 1], aspect: 'wide', xlabel: '', ylabel: '', yticks: 0, grid: false, points: [[1 / 3, '1/3'], [S2 / 2, '√2/2'], [1.5, '3/2'], [1 + S2, '1+√2'], [2 * S2, '√8'], [4, '4']].map(([x, l], i) => ({ x: N(x), y: 0, color: 'gold', r: 4.5, label: l, labelAlign: 'center', labelDx: 0, labelDy: i % 2 ? 18 : -14 })) }, caption: t`The six numbers on the number line (simplified). Position alone cannot tell rational from irrational.` },
    }),
    mcq({
      id: 'root4', difficulty: 3,
      prompt: t`Copying the $\sqrt2$ proof for $\sqrt4$: suppose $\sqrt4 = p/q$ in lowest terms, so $p^2 = 4q^2$. Which step of the copied argument breaks — as it must, since $\sqrt4 = 2$?`,
      choices: [t`“$p^2$ is divisible by $4$, so $p$ is divisible by $4$” — false, for example $p = 2$`, t`Squaring both sides of $\sqrt4 = p/q$`, t`Choosing $p/q$ in lowest terms`, t`Nothing breaks: $\sqrt4$ is irrational`],
      answer: 0,
      why: {
        1: t`Squaring is always valid here; it introduces no error.`,
        2: t`Every fraction can be written in lowest terms; that step is fine.`,
        3: t`$\sqrt4 = 2 = 2/1$, a fraction. A “proof” that it is irrational must contain a false step.`,
      },
      hints: [t`For $\sqrt2$ the key fact was “$p^2$ even $\Rightarrow p$ even”. What is the analogous fact for $4$, and is it true?`, t`Try $p = 2$: is $p^2$ divisible by $4$? Is $p$?`],
      teach: t`A proof pattern is only as good as the facts it uses: “$p^2$ divisible by $d$ ⇒ $p$ divisible by $d$” holds for primes $d$, not for $d = 4$.`,
      explain: t`$2^2 = 4$ is divisible by $4$, but $2$ is not. The $\sqrt2$ proof works because $2$ is prime: if a prime divides $p^2$, it divides $p$. The same proof works for $\sqrt3$, $\sqrt5$, … but not for $\sqrt4$.`,
      visual: bars({ values: [1, 4, 9, 16, 25, 36], labels: ['1²', '2²', '3²', '4²', '5²', '6²'], colors: ['accent', 'gold', 'accent', 'gold', 'accent', 'gold'], xlabel: 'p', caption: t`Squares of $1$ to $6$. The gold ones are divisible by $4$ — including $2^2$, though $2$ is not.` }),
    }),
    num({
      id: 'descent', difficulty: 3,
      gen(r) {
        const [p, q] = r.pick([[17, 12], [41, 29], [99, 70], [239, 169]]), np = 2 * q - p, nq = p - q;
        return {
          prompt: t`In the square picture, a solution $p^2 = 2q^2$ would give a smaller one, $p' = 2q - p$, $q' = p - q$. Apply this step to the near miss $p/q = ${p}/${q}$. What is the new denominator $q'$?`,
          answer: nq, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: np, feedback: t`That is $p' = 2q - p$, the new numerator. The denominator is $q' = p - q$.` }],
          hints: [t`$q' = p - q$.`, t`$q' = ${p} - ${q}$.`],
          teach: t`Infinite descent: from any solution build a smaller one — impossible for whole numbers, which cannot shrink for ever.`,
          explain: t`$p' = ${np}$, $q' = ${nq}$: the fraction $${np}/${nq}$, the next-best approximation to $\sqrt2$ below it, with $${np}^2 - 2(${nq})^2 = ${np * np - 2 * nq * nq}$ (against $${p * p - 2 * q * q}$ before). For an exact solution the step would never stop, giving ever smaller positive whole numbers — impossible. That is a second proof that $\sqrt2$ is irrational.`,
          visual: squaresPic(p <= 41 ? p : 17, p <= 41 ? q : 12, t`The square picture for ${p <= 41 ? `$${p}/${q}$` : t`$17/12$ (larger cases look the same)`}: the overlap (gold) and the uncovered corners (red) are the next, smaller near miss.`),
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-galileo', difficulty: 3, transfer: true,
      prompt: t`Galileo attacked the old idea that **heavier bodies fall faster** by contradiction. Assume it, and tie a light stone to a heavy one with a string. What contradiction follows?`,
      choices: [
        'The pair must fall slower than the heavy stone (the light one holds it back) and also faster (the pair is heavier)',
        'The string must break, because the stones fall at different speeds',
        'The light stone must fall faster than the heavy one',
        'There is no contradiction; the heavy stone simply drags the light one',
      ],
      answer: 0,
      why: {
        1: t`Nothing in the assumption says anything about strings breaking; the contradiction is about the pair’s speed.`,
        2: t`That is the opposite claim, not a consequence of the assumption.`,
        3: t`Under the assumption the pair is a heavier body and should fall faster than the heavy stone alone — yet the slower light stone should hold it back. Both cannot hold.`,
      },
      hints: [t`Under the assumption, how fast should the tied pair fall compared with the heavy stone: as one heavier body? As a fast stone dragged by a slow one?`, t`Get two different answers to the same question: that is the contradiction.`],
      teach: t`A thought experiment can refute a theory by contradiction: derive two incompatible predictions from it.`,
      explain: t`Treated as one body, the pair is heavier and must fall faster than the heavy stone; treated as two, the slow light stone must retard the fast one, so the pair falls slower. Both follow from the assumption, so the assumption is false: in the absence of air resistance, all bodies fall alike. Experiment agrees, from Galileo’s inclined planes to the Apollo 15 hammer-and-feather drop on the Moon.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', shade: [{ fn: '-0.2 + sqrt(max(0, 0.36 - x^2))', lower: '-0.2 - sqrt(max(0, 0.36 - x^2))', from: -0.6, to: 0.6, color: 'ink3', alpha: 0.6 }, { fn: '1.1 + sqrt(max(0, 0.04 - x^2))', lower: '1.1 - sqrt(max(0, 0.04 - x^2))', from: -0.2, to: 0.2, color: 'gold', alpha: 0.8 }], curves: [{ param: ['0', 't'], t: [0.4, 0.9], color: 'ink2', width: 1.4 }], points: [{ x: 0.75, y: -0.2, r: 0, label: 'heavy', labelAlign: 'left', labelDx: 0, labelDy: 0, color: 'ink2' }, { x: 0.35, y: 1.1, r: 0, label: 'light', labelAlign: 'left', labelDx: 0, labelDy: 0, color: 'gold' }], arrows: [{ from: [-1.6, 1], to: [-1.6, -1], color: 'accent', label: 'falling', labelDx: -60, labelDy: 0 }] }, caption: t`A heavy stone and a light one tied together, about to be dropped. Not to scale.` },
    }),
    mcq({
      id: 'cp-why-works', difficulty: 2,
      prompt: t`In a proof by contradiction of $P$, you assume $\neg P$ and validly derive a false statement, such as $0 = 1$. Why does that prove $P$?`,
      choices: [
        'Valid reasoning from a true assumption cannot reach a false statement, so ¬P must be false',
        'Because a false statement can prove anything, including P',
        'Because any assumption leads to some false statement eventually',
        'It does not: it only shows that P might be true',
      ],
      answer: 0,
      why: {
        1: t`The direction matters: we are not using the falsehood to prove $P$, but using it to rule out $\neg P$.`,
        2: t`Not so: valid reasoning from true assumptions only ever reaches true statements.`,
        3: t`Since $\neg P$ is false, $P$ is true — not merely possible. (This uses the fact that a statement is either true or false.)`,
      },
      hints: [t`The implication $\neg P \Rightarrow \text{(false)}$ is true. Which row of the truth table allows that?`],
      teach: t`$\neg P \Rightarrow$ (something false) can only be true if $\neg P$ is false.`,
      explain: t`An implication with a false conclusion is true only when its hypothesis is false. So $\neg P$ is false, and $P$ is true. That is all a proof by contradiction is.`,
    }),
    multi({
      id: 'cp-irrational', difficulty: 3,
      prompt: t`Select every irrational number.`,
      choices: [t`$\sqrt{12}$`, t`$\sqrt{16/9}$`, t`$2 + \sqrt3$`, t`$0.142857142857\ldots$ (the block 142857 repeating)`, t`$\sqrt3 \times \sqrt{12}$`, t`$\sqrt{3} - 1$`],
      answer: [0, 2, 5],
      why: {
        1: t`$\sqrt{16/9} = 4/3$.`,
        3: t`A repeating decimal is rational: this one is $1/7$.`,
        4: t`$\sqrt3\times\sqrt{12} = \sqrt{36} = 6$.`,
      },
      hints: [t`Simplify each. $\sqrt3$ is irrational by the same proof as $\sqrt2$, since $3$ is prime.`, t`If $2 + \sqrt3$ were a fraction, so would $\sqrt3$ be.`],
      teach: t`Rational plus or times an irrational is irrational; simplify first to spot hidden rationals.`,
      explain: t`$\sqrt{12} = 2\sqrt3$, $2 + \sqrt3$ and $\sqrt3 - 1$ are irrational (each would make $\sqrt3$ a fraction). The others are $4/3$, $1/7$ and $6$.`,
      visual: { type: 'graph', params: { x: [0, 7], y: [-1, 1], aspect: 'wide', xlabel: '', ylabel: '', yticks: 0, grid: false, points: [[1 / 7, '1/7'], [Math.sqrt(3) - 1, '√3−1'], [4 / 3, '4/3'], [2 * Math.sqrt(3), '√12'], [2 + Math.sqrt(3), '2+√3'], [6, '6']].map(([x, l], i) => ({ x: N(x), y: 0, color: 'gold', r: 4.5, label: l, labelAlign: 'center', labelDx: 0, labelDy: i % 2 ? 18 : -14 })) }, caption: t`The six numbers on the number line (simplified).` },
    }),
  ],
  sources: [
    { label: 'R. Hammack, Book of Proof (3rd ed.), ch. 6 Proof by Contradiction', url: 'https://richardhammack.github.io/BookOfProof/' },
    { label: 'Euclid, Elements, Book IX, Proposition 20 (infinitely many primes)', url: 'https://mathcs.clarku.edu/~djoyce/java/elements/bookIX/propIX20.html' },
    { label: 'Galileo Galilei, Two New Sciences (1638), the first day (falling bodies)', url: 'https://oll.libertyfund.org/titles/galilei-dialogues-concerning-two-new-sciences' },
  ],
});
