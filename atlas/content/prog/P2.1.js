// Thinking in steps: algorithms and complexity — counting steps, big-O, and
// measuring the exponent from a log–log plot of real timings.
import { lesson, mcq, num, code, match } from '../../src/core/content.js';

const t = String.raw;
const lg = Math.log10;

// measured once in this Atlas's Python (Pyodide 3.14 under Node 22): the
// pairwise loop of the Explore at n = 800, and sorted() at n = 10⁶
const T_PAIR = 0.13, N_PAIR = 800, T_SORT = 0.4, N_SORT = 1e6;
const N_BIG = 1e5, N_HUGE = 1e8;
const extPair = T_PAIR * (N_BIG / N_PAIR) ** 2;
const extSort = T_SORT * (N_HUGE / N_SORT) * (Math.log(N_HUGE) / Math.log(N_SORT));

// growth curves on log–log axes (x = log₁₀ n), each scaled to 1 at n = 1
const growth = {
  type: 'graph',
  params: { x: [0, 6], y: [-0.5, 12.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'n', ylabel: 'steps',
    curves: [
      { fn: '0', color: 'good', label: '1', labelAt: 5.6, labelDy: -10 },
      { fn: 'log10(1 + x*ln(10)/ln(2))', color: 'teal', label: 'log n', labelAt: 5.3, labelDy: -12 },
      { fn: 'x', color: 'accent', label: 'n', labelAt: 5.5, labelDy: 14 },
      { fn: 'x + log10(1 + x*ln(10)/ln(2))', color: 'warn', label: 'n log n', labelAt: 4.6, labelDy: -14 },
      { fn: '2x', color: 'bad', label: 'n²', labelAt: 5.4, labelDx: -26 }] },
  caption: 'How the number of steps grows with n, on log–log axes where a power law nᵖ is a straight line of slope p. Constant factors only shift a line up or down; here each curve is 1 at n = 1 (log n is drawn as 1 + log₂ n).',
};

export default lesson({
  id: 'prog.P2.1',
  title: 'Thinking in steps: algorithms and complexity',
  minutes: 10, difficulty: 2,
  intro: t`An **algorithm** is a recipe of steps, and its cost is how the number of steps grows with the size $n$ of the input. Summing $n$ readings takes about $n$ steps, written $O(n)$; comparing every pair of $n$ bodies takes $n(n-1)/2$ steps, $O(n^2)$; a good sort takes $O(n \log n)$. Run time follows a power law, so a **log–log plot** of measured times turns it into a straight line whose slope is the exponent:

$$t(n) \approx C\,n^{p} \quad\Longleftrightarrow\quad \log t = \log C + p\,\log n$$

The constant $C$ depends on your computer; the exponent $p$ depends only on the algorithm, and for large $n$ it decides everything.`,
  symbols: [
    { tex: 't(n)', text: 'the running time for an input of size $n$, in seconds' },
    { tex: 'n', text: 'the size of the input: readings in a list, bodies in a simulation, rows in a table' },
    { tex: 'C', text: 'a constant set by the machine and the language — how long one step takes' },
    { tex: 'p', text: 'the growth exponent: 1 for one loop over the data, 2 for a loop over all pairs, 3 for three nested loops' },
    { tex: 'O(n^p)', text: '“order $n^p$”: grows like $n^p$ for large $n$, ignoring constant factors and slower-growing terms' },
  ],
  why: 'Doubling n doubles an O(n) program but quadruples an O(n²) one: complexity, not processor speed, decides whether a simulation of a million stars finishes this week.',
  visual: {
    type: 'code-runner',
    title: 'Time an O(n²) loop against an O(n log n) sort',
    lead: t`Press **Run** (Matplotlib loads the first time, which takes a few seconds). The program times a pairwise-gravity loop and Python's \`sorted\` at growing sizes and plots both on log–log axes. Compare the slopes.`,
    tasks: ['Read the printed slopes: which is near 2, and which near 1?', 'Add n = 3200 to the pairwise sizes and predict the time before you run it (about 4 × the n = 1600 time).', 'Replace `sorted` by `sum` and see a slope of 1 with a much smaller constant.'],
    params: {
      rows: 28,
      code: t`import math, random, time
import matplotlib.pyplot as plt

def potential_energy(xs, ys, zs):
    """Gravitational energy of n unit masses (G = 1): each pair once."""
    n = len(xs)
    U = 0.0
    for i in range(n):
        for j in range(i + 1, n):
            dx, dy, dz = xs[i] - xs[j], ys[i] - ys[j], zs[i] - zs[j]
            U -= 1.0 / math.sqrt(dx*dx + dy*dy + dz*dz)
    return U

def timed(f, *args):
    t0 = time.perf_counter()
    f(*args)
    return time.perf_counter() - t0

random.seed(1)
n_pair = [100, 200, 400, 800, 1600]
t_pair = []
for n in n_pair:
    xs, ys, zs = ([random.random() for _ in range(n)] for _ in range(3))
    t_pair.append(timed(potential_energy, xs, ys, zs))
n_sort = [10_000, 30_000, 100_000, 300_000, 1_000_000]
t_sort = [timed(sorted, [random.random() for _ in range(n)]) for n in n_sort]

for name, ns, ts in [("pairs", n_pair, t_pair), ("sort", n_sort, t_sort)]:
    p = math.log(ts[-1] / ts[-2]) / math.log(ns[-1] / ns[-2])
    print(f"{name:5s}: {ts[-1]:.3f} s at n = {ns[-1]:,}; log-log slope {p:.2f}")

plt.loglog(n_pair, t_pair, "o-", label="pairwise gravity, O(n²)")
plt.loglog(n_sort, t_sort, "s-", label="sorted(), O(n log n)")
plt.xlabel("n")
plt.ylabel("time (s)")
plt.legend()
plt.show()`,
    },
    caption: 'Real timings in your browser, so they vary from run to run and machine to machine; the slopes do not. At small n, fixed overheads make the slopes shallower than the asymptotic exponent.',
  },
  example: {
    prompt: t`In this Atlas's Python the pairwise loop took ${T_PAIR} s for $n = ${N_PAIR}$ bodies, and \`sorted\` took ${T_SORT} s for $10^6$ numbers. Estimate the time of one pairwise evaluation for a star cluster of $10^5$ stars, and of a sort of $10^8$ numbers.`,
    visual: {
      type: 'graph',
      params: { x: [2, 8.6], y: [-2.5, 4.2], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'n', ylabel: 'time (s)',
        curves: [
          { fn: `${lg(T_PAIR)} + 2*(x - ${lg(N_PAIR)})`, color: 'bad', label: 'pairs: slope 2', labelAt: 3.3, labelDx: 12, labelDy: 6 },
          { fn: `${lg(T_SORT)} + (x - 6) + log10(x/6)`, color: 'accent', label: 'sort: slope ≈ 1', labelAt: 6.8, labelDx: 10, labelDy: 10 }],
        points: [
          { x: lg(N_PAIR), y: lg(T_PAIR), color: 'bad', label: 'measured', labelDx: 8, labelDy: 12 },
          { x: lg(N_BIG), y: lg(extPair), color: 'gold', label: `${Math.round(extPair / 60)} min`, labelDx: -52 },
          { x: 6, y: lg(T_SORT), color: 'accent', label: 'measured', labelDx: 8, labelDy: 12 },
          { x: lg(N_HUGE), y: lg(extSort), color: 'gold', label: `${Math.round(extSort)} s`, labelDx: -40 }] },
      caption: 'Extrapolating along each line from one measurement. A straight-line extrapolation over two or three decades is a rough estimate: memory and cache effects change the constant at large n.',
    },
    steps: [
      { label: 'Pick the scaling law', text: t`The pairwise loop is $O(n^2)$, so the time scales as the square of the size: $t_2 = t_1\,(n_2/n_1)^2$.` },
      { label: 'Scale the pairs', text: t`$t = ${T_PAIR}\ \text{s} \times (10^5/${N_PAIR})^2 = ${T_PAIR} \times ${((N_BIG / N_PAIR) ** 2).toFixed(0)} \approx ${extPair.toFixed(0)}\ \text{s}$, about ${Math.round(extPair / 60)} minutes — for **one** evaluation of the forces. A simulation needs thousands of time steps: months.` },
      { label: 'Scale the sort', text: t`$O(n\log n)$: $t_2 = t_1\,\dfrac{n_2 \ln n_2}{n_1 \ln n_1} = ${T_SORT} \times 100 \times \dfrac{\ln 10^8}{\ln 10^6} \approx ${extSort.toFixed(0)}\ \text{s}$. A hundred times the data costs ${(extSort / T_SORT).toFixed(0)} times the time, barely worse than linear.` },
      { label: 'Sense check', text: t`A computer ten times faster cuts ${Math.round(extPair / 60)} minutes to ${Math.round(extPair / 600)} — still hopeless for a long run. Astrophysical N-body codes use tree or mesh algorithms that need about $n\log n$ steps; on $10^5$ stars that is thousands of times less work. Algorithms beat hardware.` },
    ],
    answer: t`About ${Math.round(extPair / 60)} minutes per pairwise evaluation at $n = 10^5$, against about ${extSort.toFixed(0)} s to sort $10^8$ numbers.`,
  },
  practice: [
    num({
      id: 'scale-n', difficulty: 1,
      gen(r) {
        const T = r.pick([0.4, 0.8, 1.2, 2.5]), k = r.pick([2, 3, 5, 10]);
        return {
          prompt: t`This loop takes ${T} s for $n = 1000$ bodies. How long for ${k * 1000} bodies?

\`\`\`python
for i in range(n):
    for j in range(i + 1, n):
        F[i][j] = pull(bodies[i], bodies[j])
\`\`\``,
          answer: T * k * k, units: 's', tol: { rel: 0.01 },
          errors: [{ value: T * k, feedback: t`That assumes the time grows like $n$. Two nested loops over the bodies make it grow like $n^2$.` }],
          hints: ['How many times does the inner line run, in terms of n?', t`$n(n-1)/2 \approx n^2/2$: multiplying $n$ by ${k} multiplies the work by $${k}^2$.`],
          teach: 'For an O(n²) algorithm, multiplying n by k multiplies the time by k².',
          explain: t`The inner line runs $n(n-1)/2$ times, so the time grows as $n^2$: $${T} \times ${k}^2 = ${+(T * k * k).toFixed(2)}$ s.`,
        };
      },
    }),
    mcq({
      id: 'which-big-o', difficulty: 2,
      prompt: t`A detector flags any two hits closer together than \`eps\` in time. How does its worst-case running time grow with the number of hits $n$?

\`\`\`python
def has_close_pair(times, eps):
    for i in range(len(times)):
        for j in range(i + 1, len(times)):
            if abs(times[i] - times[j]) < eps:
                return True
    return False
\`\`\``,
      visual: growth,
      choices: [t`$O(n^2)$`, t`$O(n)$`, t`$O(n \log n)$`, t`$O(1)$`],
      answer: 0,
      why: {
        1: 'The early `return True` helps only when a close pair exists. With none, every one of the n(n − 1)/2 pairs is checked.',
        2: 'Nothing here sorts or halves; that would need a different algorithm (sort first, then compare neighbours).',
        3: 'The loops run over all of the data, so the work grows with n.',
      },
      hints: ['Big-O describes the worst case: assume no close pair exists.', 'How many times does the `if` run then?'],
      teach: 'Two nested loops over the same data, the inner starting after the outer, check n(n − 1)/2 pairs: O(n²).',
      explain: t`With no close pair, the \`if\` runs $n(n-1)/2$ times: $O(n^2)$. Sorting the times first and comparing only neighbours does the same job in $O(n\log n)$ — the exercise that follows.`,
    }),
    num({
      id: 'slope-read', difficulty: 2,
      gen(r) {
        const cases = [
          { p: 1, what: 'summing a list of thrust readings in a loop', n1: 100000, n2: 800000, t1: 0.0052 },
          { p: 2, what: 'building the table of distances between every pair of n stars', n1: 500, n2: 2000, t1: 0.031 },
          { p: 3, what: 'multiplying two n × n matrices with three nested loops', n1: 60, n2: 240, t1: 0.045 },
        ];
        const c = r.pick(cases);
        const t2 = +(c.t1 * (c.n2 / c.n1) ** c.p * r.pick([0.97, 1.0, 1.04])).toPrecision(3);
        const p = Math.log(t2 / c.t1) / Math.log(c.n2 / c.n1);
        const fmtN = (n) => n.toLocaleString('en-US');
        return {
          prompt: t`You time a program ${c.what} at two sizes: ${c.t1} s for $n = ${fmtN(c.n1).replace(/,/g, '{,}')}$ and ${t2} s for $n = ${fmtN(c.n2).replace(/,/g, '{,}')}$. What is the growth exponent $p$ in $t \approx C n^p$? Give one decimal place.`,
          visual: {
            type: 'graph',
            params: { x: [lg(c.n1) - 0.4, lg(c.n2) + 0.4], y: [lg(c.t1) - 0.6, lg(t2) + 0.6], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'n', ylabel: 'time (s)',
              points: [{ x: lg(c.n1), y: lg(c.t1), color: 'gold', label: `${fmtN(c.n1)}: ${c.t1} s` }, { x: lg(c.n2), y: lg(t2), color: 'gold', label: `${fmtN(c.n2)}: ${t2} s`, labelDx: -10, labelAlign: 'right' }] },
            caption: 'The two measurements on log–log axes. The slope of the line through them is the exponent.',
          },
          answer: p, tol: { rel: 0, abs: 0.08 },
          errors: [{ value: t2 / c.t1, feedback: t`That is the ratio of the times. The exponent is $\ln(t_2/t_1)$ divided by $\ln(n_2/n_1)$.` }],
          hints: [t`Take logs of $t = Cn^p$: the slope between the two points is $p = \dfrac{\ln(t_2/t_1)}{\ln(n_2/n_1)}$.`, t`$p = \ln(${+(t2 / c.t1).toFixed(2)})/\ln(${c.n2 / c.n1})$.`],
          teach: 'Two timings at different sizes give the exponent as the ratio of logs: p = ln(t₂/t₁) / ln(n₂/n₁).',
          explain: t`$p = \ln(${t2}/${c.t1}) / \ln(${c.n2 / c.n1}) = ${p.toFixed(2)}$, close to ${c.p} — as expected for ${c.p === 1 ? 'one pass over the data' : c.p === 2 ? 'a loop over all pairs' : 'three nested loops'}. Real timings scatter by a few per cent, so round to the nearest sensible exponent and confirm with more sizes.`,
        };
      },
    }),
    code({
      id: 'closest-gap', difficulty: 3,
      prompt: t`The function below finds the smallest gap between any two detector hit times, but it compares every pair: $O(n^2)$. Rewrite \`closest_gap\` to run in $O(n\log n)$: **sort** a copy of the times, and then only neighbours in the sorted list can be closest. The last test times your function on 8000 hits.`,
      visual: growth,
      starter: t`def closest_gap(times):
    best = float("inf")
    for i in range(len(times)):
        for j in range(i + 1, len(times)):
            best = min(best, abs(times[i] - times[j]))
    return best
`,
      answer: t`def closest_gap(times):
    s = sorted(times)
    return min(b - a for a, b in zip(s, s[1:]))

print(closest_gap([5.0, 1.0, 3.2, 9.0, 3.0]))`,
      tests: [
        { name: 'the smallest gap in [5.0, 1.0, 3.2, 9.0, 3.0] is 0.2', code: 'abs(closest_gap([5.0, 1.0, 3.2, 9.0, 3.0]) - 0.2) < 1e-12' },
        { name: 'it agrees with checking every pair, on 300 random times', code: '(lambda xs: abs(closest_gap(list(xs)) - min(abs(a - b) for i, a in enumerate(xs) for b in xs[i + 1:])) < 1e-15)((lambda r: [r.random() for _ in range(300)])(__import__("random").Random(7)))' },
        { name: 'it handles 8000 hits in under a second', code: '(lambda xs, t0: (closest_gap(xs), __import__("time").perf_counter() - t0)[1] < 1.0)((lambda r: [r.random() for _ in range(8000)])(__import__("random").Random(8)), __import__("time").perf_counter())' },
      ],
      hints: ['`s = sorted(times)` makes a sorted copy.', 'In sorted order the closest pair must be adjacent, so compare `s[k + 1] - s[k]` for each k.', '`return min(b - a for a, b in zip(s, s[1:]))`'],
      teach: 'Sorting first turns an all-pairs search into one pass over neighbours: O(n log n) instead of O(n²).',
      explain: t`If $a < b < c$ then $c - a > b - a$, so the closest pair in sorted order is adjacent. The sort costs $O(n\log n)$ and the pass $O(n)$. On 8000 hits that is about 32 million pair checks against a sort of 8000 numbers — seconds against milliseconds.`,
    }),
    mcq({
      id: 'hidden-scan', difficulty: 3,
      prompt: t`A pipeline removes duplicate star IDs from a catalogue of $n$ entries, most of them distinct. How does its running time grow?

\`\`\`python
seen = []
for star_id in catalogue:
    if star_id not in seen:
        seen.append(star_id)
\`\`\``,
      choices: [t`$O(n^2)$: \`not in\` scans the whole list \`seen\` every time`, t`$O(n)$: there is only one loop`, t`$O(n \log n)$: \`in\` uses a binary search`, t`$O(1)$ per item, because \`append\` is fast`],
      answer: 0,
      why: {
        1: 'The loop is hidden inside `not in`: on a list it compares against every element until it finds a match.',
        2: 'A list is not sorted, and `in` on a list never binary-searches.',
        3: '`append` is fast, but the `not in` test before it is not.',
      },
      hints: ['How does Python decide whether an item is `in` a list?', 'The k-th pass compares against up to k items already in `seen`.'],
      teach: '`x in some_list` is a hidden O(n) loop; `x in some_set` takes about constant time, so a set turns this into O(n).',
      explain: t`The k-th pass scans up to k items, so the total is about $n^2/2$ comparisons. Make \`seen\` a set (\`seen = set()\`, \`seen.add(star_id)\`) and each test takes about constant time: $O(n)$. For a million-star catalogue that is the difference between hours and a second.`,
    }),
    match({
      id: 'complexity-match', difficulty: 2,
      prompt: t`Match each operation on a list \`xs\` of $n$ readings to how its running time grows.`,
      visual: growth,
      left: [t`\`xs[k]\`, reading one item by its index`, t`\`sum(xs)\``, t`\`sorted(xs)\``, t`\`bisect.bisect_left(xs, x)\` on a sorted list`, t`a loop over \`i\` with an inner loop over every \`j > i\``],
      right: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Ask how many items each operation must touch.', 'Indexing jumps straight to one item; a binary search halves the range each step; a sort compares about n log n times.'],
      teach: 'Count the items touched: one (O(1)), a halving search (O(log n)), each once (O(n)), a comparison sort (O(n log n)), every pair (O(n²)).',
      explain: t`\`xs[k]\` jumps straight to the item; \`sum\` touches each item once; Python's sort makes about $n\log_2 n$ comparisons; binary search halves the range at each step; the double loop visits $n(n-1)/2$ pairs.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cluster', difficulty: 2, transfer: true,
      gen(r) {
        const [n0, t0] = r.pick([[2000, 0.5], [5000, 3.1], [1000, 0.13]]);
        const N = r.pick([1e5, 2e5, 5e5]);
        const hours = (t0 * (N / n0) ** 2) / 3600;
        return {
          prompt: t`A direct-summation N-body code computes the pull of every star on every other: one force evaluation takes ${t0} s for ${n0.toLocaleString('en-US')} stars. How many **hours** would one evaluation take for a globular cluster of ${N.toLocaleString('en-US')} stars?`,
          visual: {
            type: 'graph',
            params: { x: [2.6, 6], y: [-1.5, 5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'number of stars n', ylabel: 'time (s)',
              curves: [{ fn: `${lg(t0)} + 2*(x - ${lg(n0)})`, color: 'bad', dash: true }],
              points: [{ x: lg(n0), y: lg(t0), color: 'gold', label: `${n0} stars: ${t0} s` }],
              vlines: [{ x: lg(N), label: `${N / 1000}k stars` }] },
            caption: 'The measured point and a slope-2 line through it. Real codes also lose time to memory traffic at large n, so this is a lower bound.',
          },
          answer: hours, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: (t0 * (N / n0)) / 3600, feedback: 'That scales the time in proportion to n. Every star pulls on every other: the work grows as n².' }, { value: hours * 3600, feedback: 'That is in seconds; divide by 3600 for hours.' }],
          hints: ['Direct summation is O(n²).', t`$t = ${t0}\ \text{s} \times (${N}/${n0})^2$, then divide by 3600.`],
          teach: 'Scale an O(n²) timing by the square of the size ratio — and convert units only at the end.',
          explain: t`$t = ${t0} \times (${N / n0})^2 = ${(t0 * (N / n0) ** 2).toFixed(0)}$ s $= ${hours.toFixed(1)}$ h per evaluation. A simulation needs tens of thousands of steps, which is why cluster codes use special hardware (GPUs) and tree or mesh approximations that cost about $n\log n$.`,
        };
      },
    }),
    code({
      id: 'cp-energy', difficulty: 2,
      prompt: t`Write \`potential_energy(pos, m, G=1.0)\` that returns the gravitational potential energy of a set of point masses, $U = -G\sum_{i<j} \dfrac{m_i m_j}{r_{ij}}$, counting **each pair once**. \`pos\` is a list of \`(x, y, z)\` tuples and \`m\` a list of masses.`,
      visual: {
        type: 'graph',
        params: { x: [-0.4, 1.4], y: [-0.4, 1.4], aspect: 'square', equal: true, axes: false, grid: false,
          curves: [[0, 0, 1, 0], [1, 0, 1, 1], [1, 1, 0, 1], [0, 1, 0, 0], [0, 0, 1, 1], [1, 0, 0, 1]].map(([a, b, c, d]) => ({ param: [`${a} + ${c - a}*t`, `${b} + ${d - b}*t`], t: [0, 1], color: 'ink3', width: 1.4, dash: true })),
          points: [{ x: 0, y: 0, label: '1' }, { x: 1, y: 0, label: '2' }, { x: 1, y: 1, label: '3' }, { x: 0, y: 1, label: '4' }] },
        caption: 'One test case: four unit masses at the corners of a unit square have six pairs — four sides and two diagonals — each counted once.',
      },
      starter: t`import math

def potential_energy(pos, m, G=1.0):
    pass
`,
      answer: t`import math

def potential_energy(pos, m, G=1.0):
    U = 0.0
    for i in range(len(m)):
        for j in range(i + 1, len(m)):
            r = math.dist(pos[i], pos[j])
            U -= G * m[i] * m[j] / r
    return U

square = [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)]
print(potential_energy(square, [1, 1, 1, 1]))`,
      tests: [
        { name: t`two masses 3 and 5, 2 apart: $U = -7.5$`, code: 'abs(potential_energy([(0, 0, 0), (2, 0, 0)], [3, 5]) + 7.5) < 1e-12' },
        { name: t`four unit masses on a unit square: $U = -(4 + \sqrt2) = -5.414$`, code: `abs(potential_energy([(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)], [1, 1, 1, 1]) + ${4 + Math.SQRT2}) < 1e-12` },
        { name: t`Earth and Moon in SI units: $U = -7.61\times10^{28}$ J`, code: `abs(potential_energy([(0, 0, 0), (3.844e8, 0, 0)], [5.972e24, 7.342e22], G=6.674e-11) / ${(-6.674e-11 * 5.972e24 * 7.342e22) / 3.844e8} - 1) < 1e-12` },
      ],
      hints: ['Loop `i` over the bodies and `j` from `i + 1`, so each pair appears once.', '`math.dist(p, q)` is the distance between two points; subtract `G * m[i] * m[j] / r` for each pair.'],
      teach: 'Starting the inner loop at i + 1 visits each unordered pair once — no double counting and no self-interaction.',
      explain: t`With \`j\` from \`i + 1\` the square's six pairs are each counted once: four sides at distance 1 and two diagonals at $\sqrt2$, so $U = -(4 + 2/\sqrt2) = -(4 + \sqrt2)$. Looping \`j\` over everything would double $U$ and divide by $r = 0$ when \`j == i\`.`,
    }),
    mcq({
      id: 'cp-doubling', difficulty: 2,
      prompt: t`A simulation prints its timings at two sizes:

\`\`\`
n =  200   time = 0.041 s
n =  400   time = 0.330 s
\`\`\`

What is the most likely complexity of its core loop?`,
      choices: [t`$O(n^3)$`, t`$O(n^2)$`, t`$O(2^n)$`, t`$O(8n)$`],
      answer: 0,
      why: {
        1: 'Doubling n would multiply an O(n²) time by 4. Here it grew by about 8.',
        2: 'For 2ⁿ, adding 200 to n would multiply the time by 2²⁰⁰ — astronomically more than 8.',
        3: 'A constant factor does not change how the time scales: O(8n) is just O(n), which would double.',
      },
      hints: ['By what factor did the time grow when n doubled?', t`If $t \propto n^p$, doubling $n$ multiplies $t$ by $2^p$.`],
      teach: 'Doubling n multiplies the time by 2ᵖ, so the growth factor names the exponent: ×2 linear, ×4 quadratic, ×8 cubic.',
      explain: t`$0.330/0.041 \approx 8 = 2^3$, so $p \approx 3$: three nested loops over the data, such as a naive matrix product or a triple sum over all particle triplets.`,
    }),
  ],
  sources: [
    { label: 'Python wiki: TimeComplexity of list, set and dict operations', url: 'https://wiki.python.org/moin/TimeComplexity' },
    { label: 'Newman, Computational Physics, ch. 4: Accuracy and speed', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Barnes & Hut (1986), A hierarchical O(N log N) force-calculation algorithm, Nature 324, 446', url: 'https://doi.org/10.1038/324446a0' },
  ],
});
