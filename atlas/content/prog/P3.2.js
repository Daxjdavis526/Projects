// Indexing, slicing and broadcasting — views versus copies, boolean masks on
// data, and the broadcasting rules, ending with every pairwise separation of a
// star cluster computed without a loop.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;
const G = 'Global frame';

// five bodies for the worked example's picture (drawn in 2-D)
const BODIES = [[0.2, 0.3], [1.5, 0.7], [0.8, 1.7], [1.9, 1.9], [0.25, 1.25]];
const PAIRS = [];
for (let i = 0; i < BODIES.length; i++) for (let j = i + 1; j < BODIES.length; j++) PAIRS.push([BODIES[i], BODIES[j]]);

const viewCode = ['a = np.arange(6)', 'b = a[1:4]', 'b[:] = 0', 'print(a)'];

export default lesson({
  id: 'prog.P3.2',
  title: 'Indexing, slicing and broadcasting',
  minutes: 11, difficulty: 3,
  intro: t`Three tools let NumPy work on whole arrays. **Slicing** (\`a[2:8:2]\`) picks regular pieces — and returns a *view* that shares memory with the original. **Boolean masks** (\`F[F > 300]\`) pick the elements that pass a test, which is how data get cleaned. **Broadcasting** lets arrays of different shapes combine: shapes are compared from the right, and two sizes fit if they are equal or one of them is 1. Together they compute every pairwise separation of $n$ bodies in one line:

$$r_{ij} = \lVert \vec x_i - \vec x_j \rVert \quad\longleftrightarrow\quad \texttt{x[:, None, :] - x[None, :, :]}$$`,
  symbols: [
    { tex: 'r_{ij}', text: 'the distance between body $i$ and body $j$ — an $n\\times n$ table, zero on its diagonal' },
    { tex: t`\vec x_i`, text: 'the position of body $i$: row $i$ of an array `x` of shape `(n, 3)`' },
    { tex: t`\lVert\ \rVert`, text: 'the length of a vector: the square root of the sum of its squared components' },
    { tex: t`\texttt{None}`, text: 'inserts an axis of length 1 (also spelled `np.newaxis`), so `(n, 3)` becomes `(n, 1, 3)` or `(1, n, 3)`' },
  ],
  why: 'Cleaning data with masks, subtracting baselines and evaluating fields on grids are all broadcasting; a shape error is the most common NumPy bug, so reading shapes is a core skill.',
  visual: {
    type: 'code-runner',
    title: 'Views, masks and broadcasting',
    lead: t`Press **Run**. Part 1 changes a slice and the original changes too. Part 2 cleans a thrust log with a boolean mask (plotted below). Part 3 builds every pairwise separation by broadcasting. Part 4 shows the error you get when shapes do not fit.`,
    tasks: ['In part 1, write `v = a[2:5].copy()` and run again: the original is safe.', 'In part 2, tighten the mask to 450–550 N: what gets rejected now, and is that honest?', 'In part 3, print `d[1, 2]` and `x[1] - x[2]`: the same vector.'],
    params: {
      rows: 27,
      code: t`import numpy as np
import atlas.plot as plt

# 1. a slice is a view: it shares memory with the original
a = np.arange(8)
v = a[2:5]
v[0] = 99
print(a)
print(a[::2], a[-3:], a[[0, 3, 5]])      # a step, the end, a list of indices

# 2. a boolean mask cleans a thrust log of dropouts and spikes
rng = np.random.default_rng(1)
t = np.linspace(0, 2, 201)                              # s
F = 500 + 20 * rng.standard_normal(201)                 # N
F[[37, 120, 121]] = [0.0, 2500.0, 2600.0]
good = (F > 300) & (F < 700)
print(f"kept {good.sum()} of {F.size}: mean {F[good].mean():.1f} N (raw {F.mean():.1f} N)")

# 3. broadcasting: every pairwise separation of 4 bodies, no loop
x = rng.uniform(-1, 1, size=(4, 3))                     # positions, (4, 3)
d = x[:, None, :] - x[None, :, :]                       # (4,1,3) - (1,4,3) -> (4,4,3)
r = np.sqrt((d**2).sum(axis=2))                         # (4, 4)
print(d.shape, r.shape)
print(np.round(r, 3))

# 4. shapes that cannot broadcast
try:
    np.ones(3) + np.ones(4)
except ValueError as err:
    print("ValueError:", err)

plt.scatter(t[good], F[good], label="kept")
plt.scatter(t[~good], F[~good], label="rejected")
plt.xlabel("t (s)")
plt.ylabel("thrust (N)")
plt.legend()
plt.show()`,
    },
    caption: 'Synthetic thrust data with three injected faults. A mask is only as honest as its limits: write down why each limit is there, and report how many points it removed.',
  },
  example: {
    prompt: t`Compute the gravitational potential energy $U = -G\sum_{i<j} m_i m_j / r_{ij}$ of $n$ bodies with positions \`x\` (shape \`(n, 3)\`) and masses \`m\` (shape \`(n,)\`), without a Python loop. Track the shape of every array.`,
    visual: {
      type: 'graph',
      params: { x: [-0.1, 2.2], y: [0, 2.15], aspect: 'wide', equal: true, axes: false, grid: false,
        curves: PAIRS.map(([[x0, y0], [x1, y1]]) => ({ param: [`${x0} + ${+(x1 - x0).toFixed(3)}*t`, `${y0} + ${+(y1 - y0).toFixed(3)}*t`], t: [0, 1], color: 'ink3', width: 1.2, dash: true })),
        points: BODIES.map(([x, y], i) => ({ x, y, label: String(i), color: 'gold', r: 5 })) },
      caption: 'Five bodies have 5 × 4 / 2 = 10 pairs (dashed). Drawn in 2-D; the code works the same in 3-D.',
    },
    steps: [
      { label: 'Line the axes up', text: t`Give the two copies of \`x\` different spare axes, so one varies along rows and the other along columns:

\`\`\`python
xi = x[:, None, :]      # (n, 1, 3): body i down the rows
xj = x[None, :, :]      # (1, n, 3): body j across the columns
\`\`\`` },
      { label: 'Apply the rule', text: t`Compare shapes from the right: 3 and 3 match; $n$ and 1 broadcast to $n$; 1 and $n$ broadcast to $n$. So \`d = xi - xj\` has shape \`(n, n, 3)\`, and \`d[i, j]\` is $\vec x_i - \vec x_j$.

\`\`\`python
d = xi - xj                              # (n, n, 3)
r = np.sqrt((d**2).sum(axis=-1))         # (n, n), zeros on the diagonal
\`\`\`` },
      { label: 'Count each pair once', text: t`The diagonal ($r_{ii} = 0$) must be left out, and $r_{ij} = r_{ji}$ counted once. \`np.triu_indices(n, k=1)\` gives the row and column indices above the diagonal — fancy indexing then picks those pairs:

\`\`\`python
ii, jj = np.triu_indices(len(m), k=1)    # all pairs with i < j
U = -G * np.sum(m[ii] * m[jj] / r[ii, jj])
\`\`\`` },
      { label: 'Sense check', text: t`For 3 unit masses at the corners of a unit triangle (with $G = 1$), $U = -3$ — the same as the double loop of lesson P2.1, which this replaces. The cost is memory: \`d\` holds $3n^2$ numbers, 2.4 GB for $n = 10^4$, so very large $n$ needs chunks or a tree code.` },
    ],
    answer: t`\`d = x[:, None, :] - x[None, :, :]\`, \`r = np.sqrt((d**2).sum(-1))\`, then sum $m_i m_j/r_{ij}$ over \`np.triu_indices(n, 1)\`: $O(n^2)$ work, but in compiled code.`,
  },
  practice: [
    mcq({
      id: 'view-copy', difficulty: 2,
      prompt: t`What does the last line print?

\`\`\`python
${viewCode.join('\n')}
\`\`\``,
      visual: {
        type: 'py-memory',
        params: { steps: [{ frames: [{ name: G, vars: [['a', '@A'], ['b', '@V']] }], objects: { A: { type: 'array', dtype: 'int64', items: [0, 1, 2, 3, 4, 5] }, V: { type: 'view', of: 'A', start: 1, stop: 4, label: 'ndarray view, shape (3,)' } } }] },
        caption: 'Memory after `b = a[1:4]`: b has no numbers of its own; it points into the buffer of a (gold cells).',
      },
      choices: ['`[0 0 0 0 4 5]`', '`[0 1 2 3 4 5]`', '`[0 0 0]`', '`[0 0 0 0 0 0]`'],
      answer: 0,
      why: {
        1: 'That would be true for a list slice, which copies. A NumPy slice is a view into the same memory.',
        2: 'That is `b`. The question prints `a` — which shares the three cells.',
        3: 'Only the three shared cells, indices 1 to 3, are set to zero; `a[0]` was already 0.',
      },
      hints: ['Does a NumPy slice copy the numbers, or point at them?', 'Writing through `b` writes into cells 1, 2 and 3 of `a`.'],
      teach: 'A NumPy slice is a view sharing memory with its array — unlike a list slice — so call `.copy()` when you need independent data.',
      explain: t`\`b\` is a view of cells 1–3 of \`a\`, so \`b[:] = 0\` zeroes them in \`a\`: \`[0 0 0 0 4 5]\`. Views make slicing fast and memory-cheap (no copying a gigabyte image to look at a corner), at the price of this aliasing.`,
    }),
    num({
      id: 'slice-count', difficulty: 1,
      gen(r) {
        const n = r.pick([20, 50, 100, 60]), s = r.int(1, 3), e = r.int(1, 2), k = r.pick([2, 3, 4]);
        const len = Math.ceil((n - e - s) / k);
        return {
          prompt: t`How many elements does this slice hold?

\`\`\`python
a = np.arange(${n})
b = a[${s}:-${e}:${k}]
print(b.size)
\`\`\``,
          answer: len, tol: { rel: 0, abs: 0.4 },
          errors: (n - e - s) % k ? [{ value: Math.floor((n - e - s) / k), feedback: t`The slice starts at index ${s} itself, so round *up*: indices ${s}, ${s + k}, … while below ${n - e}.` }] : [{ value: len + 1, feedback: t`\`-${e}\` means index ${n - e}, and the stop is never included.` }],
          hints: [t`\`-${e}\` counts from the end: it is index ${n - e}, and the slice stops before it.`, t`The indices are ${s}, ${s + k}, ${s + 2 * k}, … up to the last one below ${n - e}.`],
          teach: 'A slice start:stop:step keeps start, start + step, … while below stop, and a negative stop counts back from the end.',
          explain: t`Indices from ${s} up to (not including) ${n - e}, in steps of ${k}: $\lceil (${n - e} - ${s})/${k} \rceil = ${len}$ elements.`,
        };
      },
    }),
    mcq({
      id: 'shape-rule', difficulty: 2,
      gen(r) {
        const a = r.int(2, 9), b = r.intExcept(2, 9, [a]);
        return {
          prompt: t`What shape does \`C\` have?

\`\`\`python
A = np.zeros((${a}, 1))
B = np.zeros(${b})
C = A + B
\`\`\``,
          choices: [`\`(${a}, ${b})\``, `\`(${b}, ${a})\``, 'A `ValueError`: the shapes do not match', `\`(${a},)\``],
          answer: 0,
          why: {
            1: t`Line the shapes up **from the right**: \`(${a}, 1)\` over \`(${b},)\`. The 1 stretches to ${b}; the missing axis of \`B\` counts as 1 and stretches to ${a}.`,
            2: 'Sizes fit when they are equal or one of them is 1. Here every pair of sizes fits.',
            3: 'Broadcasting never drops an axis; the result has as many axes as the larger input.',
          },
          hints: ['Write the shapes right-aligned: `(a, 1)` above `( , b)`.', 'A size of 1 stretches to match; a missing axis counts as size 1.'],
          teach: 'Broadcasting compares shapes from the right; sizes match if equal or if one is 1, and missing leading axes count as 1.',
          explain: t`\`A + B\` has shape \`(${a}, ${b})\`: element \`[i, j]\` is \`A[i, 0] + B[j]\`. This is how an outer table is built — every \`A\` against every \`B\` — with no loop.`,
        };
      },
    }),
    mcq({
      id: 'why-broke', difficulty: 3,
      prompt: t`A year of hourly temperatures \`T\` has shape \`(365, 24)\`: one row per day. To remove each day's mean you write:

\`\`\`python
daily_mean = T.mean(axis=1)          # shape (365,)
anomaly = T - daily_mean
\`\`\`

It stops with \`ValueError: operands could not be broadcast together with shapes (365,24) (365,)\`. Why, and what is the fix?`,
      visual: {
        type: 'graph',
        params: { x: [0, 10], y: [0.3, 3.9], aspect: 'wide', axes: false, grid: false,
          shade: [
            { fn: '3.4', lower: '2.6', from: 2.4, to: 5.4, color: 'accent', alpha: 0.3 }, { fn: '3.4', lower: '2.6', from: 5.7, to: 8.7, color: 'accent', alpha: 0.3 },
            { fn: '1.6', lower: '0.8', from: 5.7, to: 8.7, color: 'bad', alpha: 0.3 }],
          points: [
            { x: 3.9, y: 3, r: 0.1, label: '365', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'ink' }, { x: 7.2, y: 3, r: 0.1, label: '24', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'ink' },
            { x: 7.2, y: 1.2, r: 0.1, label: '365', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'ink' },
            { x: 2.2, y: 3, r: 0.1, label: 'T', labelDx: 0, labelDy: 0, labelAlign: 'right', color: 'accent' }, { x: 5.5, y: 1.2, r: 0.1, label: 'daily_mean', labelDx: 0, labelDy: 0, labelAlign: 'right', color: 'bad' },
            { x: 7.2, y: 2.1, r: 0.1, label: '24 ≠ 365: no fit', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'bad' }] },
        caption: 'The two shapes lined up from the right, as broadcasting compares them: the last axes, 24 and 365, clash.',
      },
      choices: [
        'Shapes are compared from the right, so 24 meets 365. Give the mean a trailing axis: `T - daily_mean[:, None]` (or `mean(axis=1, keepdims=True)`)',
        'Arrays of different sizes can never be subtracted; loop over the days instead',
        'The mean should be taken with `axis=0`, which fixes the error',
        '`mean` returns a Python list, which cannot be subtracted from an array',
      ],
      answer: 0,
      why: {
        1: 'They can, when the shapes are compatible — that is broadcasting. A loop works but throws away the point of NumPy.',
        2: 'That runs without error, but it subtracts each *hour’s* mean over the year, not each day’s mean: a different calculation that happens to fit.',
        3: '`mean` returns a NumPy array (or a NumPy scalar); the problem is its shape.',
      },
      hints: ['Write the shapes right-aligned: `(365, 24)` over `(365,)`.', 'Which sizes meet in the last position? To pair 365 with 365, the mean needs shape `(365, 1)`.'],
      teach: 'When a reduction removes an axis, put it back (`[:, None]` or `keepdims=True`) so the result lines up with the rows it came from.',
      explain: t`Right-aligned, \`(365, 24)\` meets \`(365,)\` at the last axis: 24 against 365, an error. \`daily_mean[:, None]\` has shape \`(365, 1)\`, which stretches across the 24 hours. The \`axis=0\` “fix” is the dangerous one: it runs, and silently computes something else.`,
    }),
    code({
      id: 'fix-broadcast', difficulty: 3,
      prompt: t`Five pressure sensors each logged 1000 samples into \`readings\`, shape \`(5, 1000)\`. Each sensor has its own offset. Set \`centered\` to the readings with **each sensor's own mean** subtracted. The line in the starter fails with a shape error — fix it.`,
      starter: t`import numpy as np

rng = np.random.default_rng(3)
offsets = np.array([101.2, 99.8, 100.5, 102.0, 98.9])            # kPa
readings = offsets[:, None] + 0.3 * rng.standard_normal((5, 1000))

centered = readings - readings.mean(axis=1)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(3)
offsets = np.array([101.2, 99.8, 100.5, 102.0, 98.9])            # kPa
readings = offsets[:, None] + 0.3 * rng.standard_normal((5, 1000))

centered = readings - readings.mean(axis=1, keepdims=True)
print(centered.shape, centered.mean(axis=1))`,
      tests: [
        { name: 'the result keeps the shape (5, 1000)', code: 'centered.shape == (5, 1000)' },
        { name: 'every sensor now averages zero', code: 'abs(centered.mean(axis=1)).max() < 1e-12' },
        { name: 'each row lost its own mean, not another sensor’s', code: 'np.allclose(centered[3], readings[3] - readings[3].mean())' },
      ],
      hints: ['`readings.mean(axis=1)` has shape `(5,)`; against `(5, 1000)` the 5 meets the 1000.', 'Give the means shape `(5, 1)`: `readings.mean(axis=1, keepdims=True)` or `readings.mean(axis=1)[:, None]`.'],
      teach: '`keepdims=True` keeps the reduced axis with length 1, so the result broadcasts straight back against the original.',
      explain: t`\`readings.mean(axis=1, keepdims=True)\` has shape \`(5, 1)\`, which stretches along each row's 1000 samples. Subtracting \`readings.mean(axis=0)\` would also run — shape \`(1000,)\` — but would remove the average across sensors at each instant, which is not what was asked.`,
    }),
    code({
      id: 'mask-data', difficulty: 2,
      prompt: t`A thrust log \`F\` (N) from a steady 500 N burn contains dropouts (zeros) and electrical spikes. Set \`good\` to a boolean mask that is \`True\` for readings strictly between 300 N and 700 N, \`n_bad\` to the number of readings it rejects, and \`F_mean\` to the mean of the good readings.`,
      visual: {
        type: 'graph',
        params: { x: [-20, 1020], y: [-150, 2800], aspect: 'wide', axesAt: 'edge', xlabel: 'sample', ylabel: 'thrust (N)',
          curves: [{ fn: '500', color: 'accent', width: 6 }],
          points: [[110, 0], [111, 0], [430, 2450], [700, 0], [701, 0], [950, 1800]].map(([x, y]) => ({ x, y, color: 'bad', r: 4 })),
          hlines: [{ y: 300, label: '300 N', color: 'good' }, { y: 700, label: '700 N', color: 'good' }] },
        caption: 'Sketch of the log: a band of good readings near 500 N and a handful of faults (red). The positions of the faults are illustrative.',
      },
      starter: t`import numpy as np

rng = np.random.default_rng(11)
F = 500 + 15 * rng.standard_normal(1000)              # N
F[[110, 111, 700, 701]] = 0.0                          # dropouts
F[[430, 950]] = [2450.0, 1800.0]                       # spikes

good = None
n_bad = None
F_mean = None
`,
      answer: t`import numpy as np

rng = np.random.default_rng(11)
F = 500 + 15 * rng.standard_normal(1000)              # N
F[[110, 111, 700, 701]] = 0.0                          # dropouts
F[[430, 950]] = [2450.0, 1800.0]                       # spikes

good = (F > 300) & (F < 700)
n_bad = int((~good).sum())
F_mean = F[good].mean()
print(n_bad, F_mean, F.mean())`,
      tests: [
        { name: 'a boolean mask, one entry per reading', code: 'isinstance(good, np.ndarray) and good.dtype == bool and good.shape == F.shape' },
        { name: 'it rejects the 6 faulty readings', code: 'n_bad == 6' },
        { name: 'the mean of the good readings, close to 500 N', code: 'abs(F_mean - F[(F > 300) & (F < 700)].mean()) < 1e-9 and abs(F_mean - 500) < 2' },
      ],
      hints: ['Combine two comparisons with `&`, and bracket each: `(F > 300) & (F < 700)`.', '`~good` flips the mask; `.sum()` counts the `True` values. `F[good]` keeps only the good readings.'],
      teach: 'A comparison on an array gives a boolean array; combine masks with `&`, `|` and `~`, and index with them to select.',
      explain: t`\`(F > 300) & (F < 700)\` is \`True\` for 994 readings. Here the dropouts and spikes happen nearly to cancel in the raw mean, but the raw standard deviation balloons from about 15 N to about 80 N — and a different set of faults would bias the mean badly. Always report how many points a mask removed, and why.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-cluster', difficulty: 3, transfer: true,
      prompt: t`Write \`potential_energy(pos, m, G=1.0)\` returning $U = -G\sum_{i<j} m_i m_j / r_{ij}$ for positions \`pos\` of shape \`(n, 3)\` and masses \`m\` of shape \`(n,)\` — **with no Python loop**: broadcast the separations, and leave out the diagonal. It is then used on a 300-star cluster.`,
      visual: {
        type: 'graph',
        params: { x: [-2.6, 2.6], y: [-2.1, 2.1], aspect: 'wide', equal: true, axes: false, grid: false,
          points: Array.from({ length: 60 }, (_, k) => { const a = 2.39996 * k, rr = 1.9 * Math.sqrt((k + 0.5) / 60); return { x: rr * Math.cos(a), y: rr * Math.sin(a), color: 'gold', r: 2.5 }; }) },
        caption: 'A sketch of a star cluster (60 of its stars, in projection). With 300 stars there are 44 850 pairs.',
      },
      starter: t`import numpy as np

def potential_energy(pos, m, G=1.0):
    pass

rng = np.random.default_rng(7)
pos = rng.normal(size=(300, 3))
m = rng.uniform(0.5, 2.0, size=300)
U = potential_energy(pos, m)
`,
      answer: t`import numpy as np

def potential_energy(pos, m, G=1.0):
    d = pos[:, None, :] - pos[None, :, :]
    r = np.sqrt((d**2).sum(axis=-1))
    i, j = np.triu_indices(len(m), k=1)
    return -G * np.sum(m[i] * m[j] / r[i, j])

rng = np.random.default_rng(7)
pos = rng.normal(size=(300, 3))
m = rng.uniform(0.5, 2.0, size=300)
U = potential_energy(pos, m)
print(U)`,
      tests: [
        { name: 'it agrees with a double loop over 30 stars', code: '(lambda p, w: abs(potential_energy(p, w) - (-sum(w[i] * w[j] / np.sqrt(((p[i] - p[j])**2).sum()) for i in range(30) for j in range(i + 1, 30)))) < 1e-9)(pos[:30], m[:30])' },
        { name: t`2 kg and 5 kg, 5 m apart, in SI units: $U = -Gm_1m_2/r = -1.335\times10^{-10}$ J`, code: 'abs(potential_energy(np.array([[0.0, 0, 0], [3, 4, 0]]), np.array([2.0, 5.0]), G=6.674e-11) / (-6.674e-11 * 10 / 5) - 1) < 1e-12' },
        { name: 'the 300-star energy is finite: the diagonal was left out', code: 'np.isfinite(U) and U < 0' },
      ],
      hints: ['`d = pos[:, None, :] - pos[None, :, :]` has shape `(n, n, 3)`; sum the squares over the last axis for `r`.', 'The diagonal is `r[i, i] = 0`: dividing by it gives `inf`. Select the pairs above the diagonal with `i, j = np.triu_indices(n, k=1)`.', '`return -G * np.sum(m[i] * m[j] / r[i, j])`.'],
      teach: 'Broadcasting turns a double loop over pairs into array operations; the pairs i < j are `np.triu_indices(n, k=1)`.',
      explain: t`Broadcasting builds all $n^2$ separations at once and \`triu_indices\` keeps the $n(n-1)/2$ distinct pairs, skipping the zero diagonal. (An alternative: \`np.fill_diagonal(r, np.inf)\` and halve the full sum.) For 300 stars that is 44 850 pairs in a few milliseconds; for $10^5$ stars the separation array alone would need 240 GB — where tree codes take over.`,
    }),
    mcq({
      id: 'cp-fancy-copy', difficulty: 3,
      prompt: t`What does the last line print?

\`\`\`python
a = np.arange(6)
b = a[[0, 2]]        # a list of indices
b[0] = 99
print(a)
\`\`\``,
      choices: ['`[0 1 2 3 4 5]`', '`[99  1  2  3  4  5]`', '`[99  1 99  3  4  5]`', '`[99  2]`'],
      answer: 0,
      why: {
        1: 'That is what a *slice* would do. Indexing with a list of indices (fancy indexing) always makes a copy.',
        2: '`b[0] = 99` sets one element — and in a copy, not in `a`.',
        3: 'That is `b` after the assignment; the question prints `a`.',
      },
      hints: ['Slices are views. Is a list of indices a slice?', 'Fancy indexing (a list or a boolean mask) gathers elements into a new array.'],
      teach: 'Slicing returns a view; indexing with a list or a mask returns a copy — so `a[mask] = 0` changes `a`, but `b = a[mask]; b[:] = 0` does not.',
      explain: t`\`a[[0, 2]]\` gathers elements 0 and 2 into a **new** array, so changing \`b\` leaves \`a\` as \`[0 1 2 3 4 5]\`. Assigning *through* the index, \`a[[0, 2]] = 99\`, does change \`a\`.`,
    }),
    mcq({
      id: 'cp-and-mask', difficulty: 2, transfer: true,
      prompt: t`A test engineer filters chamber-pressure readings (MPa) with this line. What happens?

\`\`\`python
p = np.array([2.1, 6.8, 7.0, 7.1, 0.2])
ok = (p > 6.5) and (p < 7.5)
\`\`\``,
      choices: ['A `ValueError`: an array has no single truth value, so `and` cannot use it — write `&`', '`ok` is `[False, True, True, True, False]`', '`ok` is `True`, because some readings are in range', '`ok` is the array `p < 7.5`, because `and` returns its second operand'],
      answer: 0,
      why: {
        1: 'That is what `(p > 6.5) & (p < 7.5)` gives. Python’s `and` needs one True or False, and an array of five booleans is not one.',
        2: 'NumPy refuses to guess between “any” and “all”; it raises instead.',
        3: 'That is how `and` works on ordinary objects, but it first asks for the truth value of `p > 6.5` — which raises.',
      },
      hints: ['`and` must decide whether its left side is true. What is the truth value of a five-element array?'],
      teach: 'Combine boolean arrays with `&`, `|` and `~` (bracketing each comparison); Python’s `and`, `or` and `not` need a single truth value.',
      explain: t`\`ValueError: The truth value of an array with more than one element is ambiguous\`. Write \`ok = (p > 6.5) & (p < 7.5)\`; the brackets matter, because \`&\` binds more tightly than \`>\`.`,
    }),
  ],
  sources: [
    { label: 'NumPy: Indexing on ndarrays (views and copies)', url: 'https://numpy.org/doc/stable/user/basics.indexing.html' },
    { label: 'NumPy: Broadcasting', url: 'https://numpy.org/doc/stable/user/basics.broadcasting.html' },
    { label: 'numpy.triu_indices', url: 'https://numpy.org/doc/stable/reference/generated/numpy.triu_indices.html' },
  ],
});
