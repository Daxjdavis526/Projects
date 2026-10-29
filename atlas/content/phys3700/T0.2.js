// Combinatorics for physicists: permutations N!, combinations C(N, n), the
// stars-and-bars count C(q + N − 1, q), and why identical particles divide
// out — the counting every multiplicity in T2 is built from.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { bars, binomBars, starsPic, choose, lnFact, r4, thouTeX, thou, apart } from './_count.js';

const t = String.raw;
const C = (n, k) => Number(choose(n, k));

// a row of C(N, n) as bars (linear), with one bar hidden behind a "?"
function rowBars(N, ask, caption) {
  const vals = Array.from({ length: N + 1 }, (_, k) => C(N, k)), top = Math.max(...vals);
  const data = vals.map((v, k) => (k === ask ? { x: k, y: 0 } : { x: k, y: v, label: N <= 12 ? thou(v) : undefined }));
  return bars(data, {
    x: [-0.8, N + 0.8], y: [0, r4(top * 1.2)], xlabel: 'n (spins up)', ylabel: 'ways',
    points: [{ x: ask, y: r4(top * 0.12), r: 0.01, color: 'gold', label: '?', labelDx: -3, labelDy: 0 }],
    caption, alt: `The binomial coefficients C(${N}, n)`,
  });
}

// the worked example: 10 spins, 4 up
const EX = { N: 10, n: 4 };
EX.ways = C(EX.N, EX.n); EX.all = 2 ** EX.N; EX.fact = Math.round(Math.exp(lnFact(EX.N)));

// satellites in view on a sky plot (azimuth around, elevation inward)
function skyPic(k, caption) {
  const pts = [];
  for (let i = 0; i < k; i++) {
    const az = (2 * Math.PI * (i + 0.37 * (i % 3))) / k, rr = 0.35 + 0.55 * ((i * 7) % 5) / 4;
    pts.push({ x: r4(rr * Math.sin(az)), y: r4(rr * Math.cos(az)), r: 6, color: 'accent', label: `G${String(i + 3).padStart(2, '0')}`, labelDx: 8, labelDy: -8 });
  }
  const circ = (r, dash) => ({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1, dash });
  return {
    type: 'graph',
    params: { x: [-1.15, 1.15], y: [-1.1, 1.15], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [circ(1, false), circ(0.5, true)], points: [...pts, { x: 0, y: 1.05, r: 0.01, color: 'ink2', label: 'N', labelDx: -4, labelDy: -4 }], alt: 'A sky plot of GPS satellites in view' },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T0.2',
  title: 'Combinatorics for physicists',
  minutes: 12, difficulty: 2,
  intro: t`Entropy is counting. To count the microstates of $N$ two-state particles with $n$ of them “up”, line the particles up and choose which $n$ are up. The number of ways is the **binomial coefficient**

$$\binom{N}{n} = \frac{N!}{n!\,(N-n)!}.$$

The $N!$ counts every ordering as if all the particles were different; dividing by $n!$ and $(N-n)!$ removes the orderings that only swap identical ups among themselves, or identical downs. The same trick — **count as if distinguishable, then divide out what you cannot tell apart** — counts quanta among oscillators (lesson T2.2) and molecules in a gas (T2.5).`,
  symbols: [
    { tex: 'N!', text: '“$N$ factorial”, $N(N-1)\\cdots 2\\cdot 1$: the number of orders of $N$ different objects; $0! = 1$' },
    { tex: '\\binom{N}{n}', text: '“$N$ choose $n$”: the number of ways to pick $n$ of $N$ objects when the order of picking does not matter' },
    { tex: 'N', text: 'the number of particles (or slots, or trials)' },
    { tex: 'n', text: 'how many of them are in the chosen condition — spins up, coins heads' },
    { tex: '2^N', text: 'the total number of arrangements of $N$ two-state particles: two choices each, so $\\sum_n \\binom{N}{n} = 2^N$' },
  ],
  why: 'Every multiplicity in this course — spins, Einstein solids, ideal gases, black-hole microstates — is a count of this kind, and entropy is its logarithm.',
  visual: {
    type: 'graph',
    title: 'Ways to have n of N spins up',
    lead: t`Each bar is $\binom{N}{n}$ on a **logarithmic** scale (each gridline is ten times the one below). The dashed line is $2^N$, every microstate together.`,
    tasks: [
      'Raise N to 60: the middle bar is about 10¹⁷, within a factor of ten of the dashed total. Almost every microstate has close to half up.',
      'Look at the two ends: the bars have zero height on this log scale because there is exactly one way (10⁰ = 1) to have all spins up or all down, however large N is.',
      'Set N = 20 and read C(20, 10) from the readout: 184 756 of the 1 048 576 microstates.',
    ],
    params: {
      x: [-1, 61], y: [0, 19], aspect: 'wide', xlabel: 'n (spins up)', ylabel: 'number of microstates', ylog: true, axesAt: 'edge',
      sliders: [{ key: 'N', label: 'Spins $N$', min: 1, max: 60, step: 1, value: 20, explain: 'How many two-state particles: spin up or down, heads or tails.' }],
      riemann: { fn: 'log10(gamma(N+1)/(gamma(floor(x+0.5)+1)*gamma(N-floor(x+0.5)+1)))', from: -0.5, to: 'N+0.5', n: 'N+1', rule: 'mid' },
      hlines: [{ y: 'N*log10(2)', label: 'all microstates, 2ᴺ', color: 'gold' }],
      readouts: [
        { label: '$\\binom{N}{N/2}$ (or nearest)', expr: 'round(gamma(N+1)/(gamma(floor(N/2)+1)*gamma(N-floor(N/2)+1)))', digits: 6 },
        { label: '$2^N$', expr: '2^N', digits: 6 },
        { label: 'middle share', expr: 'gamma(N+1)/(gamma(floor(N/2)+1)*gamma(N-floor(N/2)+1))/2^N', digits: 3 },
      ],
    },
    caption: 'Exact binomial coefficients; the bar heights are on a log scale, so a bar one gridline lower stands for ten times fewer microstates.',
  },
  example: {
    prompt: t`A tiny paramagnet has $N = ${EX.N}$ spins. How many microstates have exactly $n = ${EX.n}$ spins up, and what fraction of all microstates is that?`,
    visual: rowBars(EX.N, EX.n, `The number of microstates with n spins up, for N = ${EX.N}; the bar asked about is hidden.`),
    steps: [
      { label: 'Pretend they differ', text: t`If the ${EX.N} spins were all distinguishable objects, there would be $${EX.N}! = ${thouTeX(EX.fact)}$ ways to order them.` },
      { label: 'Divide out the ups', text: t`Swapping two up spins changes nothing, so every arrangement has been counted $${EX.n}! = 24$ times by shuffling the ups…` },
      { label: 'And the downs', text: t`…and $${EX.N - EX.n}! = 720$ times by shuffling the downs. So $\binom{${EX.N}}{${EX.n}} = \dfrac{${thouTeX(EX.fact)}}{24\times720} = ${EX.ways}$.` },
      { label: 'Fraction', text: t`All microstates: $2^{${EX.N}} = ${thouTeX(EX.all)}$. The fraction is $${EX.ways}/${thouTeX(EX.all)} = ${fmt(EX.ways / EX.all, 3)}$.` },
      { label: 'Sense check', text: t`$\binom{${EX.N}}{${EX.n}} = \binom{${EX.N}}{${EX.N - EX.n}}$: choosing which ${EX.n} are up is the same as choosing which ${EX.N - EX.n} are down.` },
    ],
    answer: t`$${EX.ways}$ microstates — $${fmt((100 * EX.ways) / EX.all, 3)}\%$ of the $${thouTeX(EX.all)}$.`,
  },
  practice: [
    num({
      id: 'perm', difficulty: 1,
      gen(r) {
        const N = r.int(5, 8), v = Math.round(Math.exp(lnFact(N)));
        const data = Array.from({ length: 8 }, (_, i) => ({ x: i + 1, y: i + 1 === N ? 0 : Math.log10(Math.round(Math.exp(lnFact(i + 1)))) }));
        return {
          prompt: t`A test-stand sequence opens ${N} different valves, one at a time. In how many different orders can they be opened?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: N * N, feedback: t`Each later valve has fewer choices left: $${N}\times${N - 1}\times\cdots\times1$, not $${N}\times${N}$.` }, { value: 2 ** N, feedback: t`$2^{${N}}$ counts open-or-shut patterns, not orders.` }],
          hints: ['The first valve can be any of them; the second any of those left; and so on.'],
          teach: t`$N$ different objects can be ordered in $N!$ ways.`,
          explain: t`$${N}! = ${Array.from({ length: N }, (_, i) => N - i).join('\\times')} = ${thouTeX(v)}$.`,
          visual: bars(data, { x: [0.3, 8.7], y: [0, 5.2], ylog: true, xlabel: 'number of valves N', ylabel: 'orders, N!', points: [{ x: N, y: 0.3, r: 0.01, color: 'gold', label: '?', labelDx: -3, labelDy: 0 }], caption: 'The number of orders N! for 1 to 8 objects, on a log scale: it grows faster than any power of ten per step can keep up with.' }),
        };
      },
    }),
    num({
      id: 'choose', difficulty: 2,
      gen(r) {
        const N = r.int(8, 12), n = r.intExcept(2, N - 2, [N / 2]);
        const v = C(N, n), perm = Math.round(Math.exp(lnFact(N) - lnFact(N - n)));
        return {
          prompt: t`How many microstates of $${N}$ spins have exactly $${n}$ spins up?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: perm, feedback: t`That is $${N}!/${N - n}!$: you counted the ordered choices. Divide by $${n}!$ as well — the up spins are identical.` }],
          hints: [t`Use $\binom{N}{n} = \dfrac{N!}{n!(N-n)!}$.`],
          teach: t`Choosing which $n$ of $N$ are up: $\binom{N}{n}$.`,
          explain: t`$\binom{${N}}{${n}} = \dfrac{${N}!}{${n}!\,${N - n}!} = ${thouTeX(v)}$.`,
          visual: rowBars(N, n, `The number of microstates for each number of up spins, N = ${N}; the bar asked about is hidden.`),
        };
      },
    }),
    mcq({
      id: 'why-divide', difficulty: 2,
      prompt: t`In $\binom{N}{n} = \dfrac{N!}{n!(N-n)!}$, why divide by $n!$?`,
      choices: [
        'The up spins are identical, so the n! orderings of them are one microstate',
        'There are n! ways for the spins to point',
        'Probabilities must add to 1',
        'It converts an energy into a count',
      ],
      answer: 0,
      why: { 1: 'Each spin has 2 orientations; n! is the number of ways to order n things.', 2: 'Nothing here is a probability yet: this is a count of microstates.', 3: 'No energy appears; both sides are numbers of arrangements.' },
      hints: [t`$N!$ counts every ordering as if all $N$ spins were different.`],
      teach: 'Count as if every particle were different, then divide by the rearrangements you cannot tell apart.',
      explain: t`$N!$ treats every spin as different. Shuffling the $n$ identical up spins among their places gives $n!$ orderings that are all the same microstate — likewise $(N-n)!$ for the downs.`,
      visual: starsPic([2, 0, 1, 3], { title: 'n = 6 identical quanta in N = 4 boxes', caption: 'Identical objects cannot be told apart: swapping two dots changes nothing, which is why their orderings are divided out.' }),
    }),
    num({
      id: 'stars', difficulty: 3,
      gen(r) {
        const N = r.int(3, 5), q = r.int(3, 7), v = C(q + N - 1, q);
        const occ = Array.from({ length: N }, () => 0);
        for (let i = 0; i < q; i++) occ[(i * 2 + (i > 2 ? 1 : 0)) % N]++;
        return {
          prompt: t`$${q}$ identical energy quanta are shared among $${N}$ oscillators, any number per oscillator. In how many ways? (Write each arrangement as $${q}$ dots and $${N - 1}$ walls in a row.)`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: N ** q, feedback: t`$${N}^{${q}}$ would treat the quanta as distinguishable — each choosing its own oscillator.` }, { value: C(q + N, q), feedback: t`There are $${N - 1}$ walls between $${N}$ oscillators, not $${N}$.` }], v),
          hints: [t`A row of $${q}$ dots and $${N - 1}$ walls has $${q + N - 1}$ symbols.`, t`Choose which $${q}$ of the $${q + N - 1}$ positions hold dots: $\binom{${q + N - 1}}{${q}}$.`],
          teach: t`Stars and bars: $q$ identical quanta in $N$ boxes can be arranged in $\binom{q+N-1}{q}$ ways.`,
          explain: t`Every arrangement is a row of $${q}$ dots and $${N - 1}$ walls, and every such row is an arrangement: $\binom{${q + N - 1}}{${q}} = ${v}$.`,
          visual: starsPic(occ, { title: `one of the ways: ${q} quanta, ${N} oscillators` }),
        };
      },
    }),
    code({
      id: 'code-count', difficulty: 2,
      prompt: t`Count microstates by brute force. Complete \`count_up(N, n)\` so it loops over every sequence of $N$ spins (\`'u'\` or \`'d'\`) and counts those with exactly $n$ up. The last line compares your count with \`math.comb\`.`,
      starter: t`from itertools import product
from math import comb

def count_up(N, n):
    count = 0
    for spins in product('ud', repeat=N):
        pass   # add 1 when spins has exactly n 'u'
    return count

print(count_up(10, 4), comb(10, 4))
`,
      answer: t`from itertools import product
from math import comb

def count_up(N, n):
    count = 0
    for spins in product('ud', repeat=N):
        if spins.count('u') == n:
            count += 1
    return count

print(count_up(10, 4), comb(10, 4))`,
      tests: [
        { name: '10 spins, 4 up: 210 microstates', code: 'count_up(10, 4) == 210' },
        { name: 'all down is one microstate', code: 'count_up(6, 0) == 1' },
        { name: 'agrees with comb(8, n) for every n', code: 'all(count_up(8, k) == comb(8, k) for k in range(9))' },
        { name: 'the program prints 210', code: '"210" in _stdout' },
      ],
      hints: [t`\`spins\` is a tuple like \`('u', 'd', 'u', …)\`; \`spins.count('u')\` counts its ups.`, t`Replace \`pass\` with \`if spins.count('u') == n: count += 1\`.`],
      teach: 'Brute-force enumeration checks a counting formula — and shows why formulas matter: it takes 2ᴺ steps.',
      explain: t`\`product('ud', repeat=N)\` runs over all $2^N$ microstates; counting those with $n$ ups gives $\binom{N}{n}$. For $N = 10$ that is 1024 checks; for $N = 100$ it would be $10^{30}$, which is why physics needs the formula.`,
    }),
    num({
      id: 'prob-n', difficulty: 2,
      gen(r) {
        const N = r.pick([10, 12, 16, 20]), n = r.int(Math.round(N / 2) - 3, Math.round(N / 2) + 3);
        const P = C(N, n) / 2 ** N;
        return {
          prompt: t`Toss $${N}$ fair coins. What is the probability of exactly $${n}$ heads?`,
          answer: P, tol: { rel: 0.01 },
          errors: [{ value: C(N, n), feedback: 'That is the number of microstates; divide by the total number, 2ᴺ.' }, { value: 1 / (N + 1), feedback: `The ${N + 1} macrostates are not equally likely; the microstates are.` }],
          hints: ['Every one of the 2ᴺ microstates is equally likely.', t`$P = \binom{${N}}{${n}}/2^{${N}}$.`],
          teach: 'Microstates are equally likely; a macrostate’s probability is its number of microstates over the total.',
          explain: t`$P = \binom{${N}}{${n}}/2^{${N}} = ${thouTeX(C(N, n))}/${thouTeX(2 ** N)} = ${fmt(P, 3)}$.`,
          visual: binomBars(N, 0.5, { hi: n, xlabel: 'number of heads', caption: `The probability of each number of heads in ${N} fair tosses; the gold bar is the one asked about.` }),
        };
      },
    }),
    mcq({
      id: 'symmetric-error', difficulty: 3, kind: 'error',
      prompt: t`A student needs the number of ways to have 98 of 100 spins up and writes:

$$\binom{100}{98} = \frac{100!}{98!} = 100\times 99 = 9900.$$

What went wrong?`,
      choices: [t`They dropped the $2!$ for the two down spins; the answer is $4950$`, t`Nothing: $9900$ is right`, t`It should be $100!/2!$`, t`It should be $100 \times 98$`],
      answer: 0,
      why: { 1: t`$\binom{N}{n} = N!/(n!(N-n)!)$ has *two* factorials underneath.`, 2: t`$100!/2!$ is about $5\times10^{157}$ — far too big; the $98!$ belongs underneath too.`, 3: t`That is not any count of these arrangements.` },
      hints: [t`$\binom{100}{98} = \dfrac{100!}{98!\,2!}$.`, t`Equivalently, choose which 2 spins are *down*: $\binom{100}{2}$.`],
      teach: t`$\binom{N}{n} = \binom{N}{N-n}$: count whichever group is smaller.`,
      explain: t`$\binom{100}{98} = \binom{100}{2} = \dfrac{100\times99}{2} = 4950$. The student counted ordered pairs of down spins, each pair twice.`,
      visual: binomBars(100, 0.5, { ylog: true, hi: 98, xlabel: 'spins up', ylabel: 'probability (log scale)', caption: 'The probability of each number of up spins among 100, on a log scale; 98 up (gold) is out in the far tail.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.int(7, 11), v = C(k, 4);
        return {
          prompt: t`A GPS receiver sees ${k} satellites and computes a position fix from every possible set of 4 of them, to check for a faulty one. How many different 4-satellite sets are there?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.round(Math.exp(lnFact(k) - lnFact(k - 4))), feedback: 'Order does not matter in a set: divide by 4!.' }],
          hints: ['A set has no order: this is a combination.'],
          teach: t`Unordered choices of $n$ from $N$: $\binom{N}{n}$.`,
          explain: t`$\binom{${k}}{4} = \dfrac{${k}!}{4!\,${k - 4}!} = ${v}$.`,
          visual: skyPic(k, `A sky plot: the ${k} satellites in view (centre overhead, the rim at the horizon). Positions are illustrative.`),
        };
      },
    }),
    num({
      id: 'cp-quanta', difficulty: 3,
      gen(r) {
        const N = r.int(3, 4), q = r.int(4, 8), v = C(q + N - 1, q);
        const occ = Array.from({ length: N }, (_, i) => (i === 0 ? q : 0));
        return {
          prompt: t`How many ways can $${q}$ identical quanta be shared among $${N}$ oscillators?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: N ** q, feedback: 'The quanta are identical: they do not each pick an oscillator.' }],
          hints: ['Stars and bars.', t`$\binom{q+N-1}{q}$.`],
          teach: t`Stars and bars: $\binom{q+N-1}{q}$.`,
          explain: t`$\binom{${q + N - 1}}{${q}} = ${v}$.`,
          visual: starsPic(occ, { title: `one arrangement: all ${q} quanta in the first oscillator` }),
        };
      },
    }),
    mcq({
      id: 'cp-middle', difficulty: 3,
      prompt: t`As the number of coins $N$ grows, what happens to the probability of getting *exactly* half heads, $\binom{N}{N/2}/2^N$?`,
      choices: [t`It falls, like $1/\sqrt N$`, 'It rises toward 1, since half heads is the most likely outcome', 'It stays at ½', t`It falls like $2^{-N}$`],
      answer: 0,
      why: { 1: t`*Near* half becomes nearly certain, but *exactly* half is one of about $\sqrt N$ comparably likely outcomes.`, 2: 'Nothing fixes it at ½: for N = 2 it is ½, for N = 4 it is 3/8.', 3: t`$\binom{N}{N/2}$ is itself close to $2^N$ — only about $\sqrt N$ smaller.` },
      hints: [t`Try $N = 2$ and $N = 4$: $\tfrac{2}{4}$, then $\tfrac{6}{16}$.`, 'The peak has a width of about √N outcomes, and they share the probability.'],
      teach: t`$\binom{N}{N/2}/2^N \approx \sqrt{2/(\pi N)}$: the peak gets relatively sharper but each single outcome less likely.`,
      explain: t`For large $N$, $\binom{N}{N/2}/2^N \approx \sqrt{2/(\pi N)}$: $${fmt(C(100, 50) / 2 ** 100, 3)}$ for $N = 100$. Exactly half is never likely; *close to* half becomes certain.`,
      visual: binomBars(10, 0.5, { hi: 5, xlabel: 'number of heads', caption: 'Ten fair coins: the probability of each number of heads, exactly half in gold. What happens to the gold bar as N grows?' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.1–2.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'MIT OCW 8.044 Statistical Physics I (Spring 2013)', url: 'https://ocw.mit.edu/courses/8-044-statistical-physics-i-spring-2013/' },
  ],
});
