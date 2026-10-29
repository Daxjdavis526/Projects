// Random numbers and estimating π — NumPy's Generator and seeds, the
// hit-or-miss estimate of π, its 1/√N error and what that costs, why Monte
// Carlo still wins in many dimensions, and a detector's geometric acceptance
// (with the classic slip of sampling directions uniformly in angle).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { uniforms } from './_solvers.js';

const t = String.raw;

const P = Math.PI / 4, SIG1 = 4 * Math.sqrt(P * (1 - P));     // σ = SIG1/√N
const PI_SEED42 = 3.142436;      // 4·mean(x² + y² < 1) with x, y = default_rng(42).random((2, 10**6)) — checked in Pyodide
const lg = Math.log10;
// a deterministic picture: 400 points in the unit square
const U = uniforms(2024);
const DOTS = Array.from({ length: 400 }, () => [U(), U()]);
// errors of hit-or-miss estimates for growing N (seeded, for the checkpoint's picture)
const ERRS = [1e2, 1e3, 1e4, 1e5, 1e6].map((N) => { const u = uniforms(N + 7); let n = 0; for (let i = 0; i < N; i++) { const x = u(), y = u(); if (x * x + y * y < 1) n++; } return [N, Math.abs((4 * n) / N - Math.PI)]; });

// the detector: a disc of radius a at distance d, on axis
const DET_A = 0.05, DET_D = 0.2, DET_COS = DET_D / Math.hypot(DET_D, DET_A), DET_EXACT = (1 - DET_COS) / 2;

export default lesson({
  id: 'prog.P13.1',
  title: 'Random numbers and estimating π',
  minutes: 11, difficulty: 2,
  intro: t`Monte Carlo methods answer questions by sampling at random. The classic example: scatter $N$ points uniformly over the unit square; the fraction landing inside the quarter circle $x^2 + y^2 < 1$ estimates its area $\pi/4$, so

$$\pi \approx 4\,\frac{n_{\text{in}}}{N}, \qquad \sigma \approx 4\sqrt{\frac{p(1-p)}{N}} = \frac{${SIG1.toFixed(3)}}{\sqrt N}$$

The error falls only as $1/\sqrt N$ — a hundred times more points for one more digit — but it does not care how many dimensions the problem has, which is why Monte Carlo rules in high dimensions, particle transport, and uncertainty analysis. The random numbers come from \`rng = np.random.default_rng(seed)\`: a deterministic generator that **looks** random and replays exactly from the same seed.`,
  symbols: [
    { tex: 'N', text: 'the number of random points (samples)' },
    { tex: t`n_{\text{in}}`, text: 'how many landed inside the quarter circle' },
    { tex: 'p', text: 'the probability of landing inside, $\\pi/4 \\approx 0.785$' },
    { tex: t`\sigma`, text: 'the standard deviation of the estimate: about 68% of runs land within $\\pm\\sigma$ of $\\pi$' },
  ],
  why: 'Particle detectors, radiation shielding, uncertainty budgets, statistical mechanics and Bayesian fits all run on random sampling, and all inherit its 1/√N error.',
  visual: {
    type: 'code-runner',
    title: 'Throwing darts at π',
    lead: t`Press **Run**. Left: the first 2000 points, inside the quarter circle or not. Right: the error of the estimate against $N$ for ten runs with different seeds, with the predicted $\sigma = ${SIG1.toFixed(2)}/\sqrt N$ as a line. The cloud of runs follows the line's slope of $-\tfrac12$.`,
    tasks: [
      'Change seed: the left picture and every estimate change; run again with the same seed and nothing changes.',
      'Read the last estimate: with a million points, about three digits are right.',
      'Count: to go from 10⁴ to 10⁶ points (100 times the work), the error fell by about 10.',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt

seed = 42
rng = np.random.default_rng(seed)
N = 10**6
x, y = rng.random((2, N))                 # uniform on [0, 1)
inside = x**2 + y**2 < 1
print(f"π ≈ {4 * inside.mean():.6f} from {N} points; σ ≈ {1.642 / np.sqrt(N):.6f}")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4))
m = 2000
ax1.scatter(x[:m], y[:m], s=2, c=np.where(inside[:m], "C2", "C4"))
ax1.set_aspect("equal"); ax1.set_xlabel("x"); ax1.set_ylabel("y")

Ns = np.unique(np.logspace(1, 6, 40).astype(int))
for s in range(10):                       # ten independent runs
    r = np.random.default_rng(seed + s)
    hits = np.cumsum(r.random(Ns[-1])**2 + r.random(Ns[-1])**2 < 1)
    ax2.loglog(Ns, np.abs(4 * hits[Ns - 1] / Ns - np.pi), ".", ms=3, color="C0", alpha=0.5)
ax2.loglog(Ns, 1.642 / np.sqrt(Ns), color="C1", label="σ = 1.64/√N")
ax2.set_xlabel("N"); ax2.set_ylabel("|estimate − π|"); ax2.legend()
plt.tight_layout()
plt.show()`,
    },
    caption: 'Pseudo-random numbers from NumPy’s default PCG64 generator. Individual errors scatter widely below the σ line (an error can be lucky); it is their spread, not any single run, that falls as 1/√N.',
  },
  example: {
    prompt: t`Estimate $\pi$ with $N = 10^6$ points from \`np.random.default_rng(42)\`, give its uncertainty, and decide whether the estimate is consistent with the true value. How many points would six correct digits take?`,
    visual: {
      type: 'graph',
      params: { x: [0, 1], y: [0, 1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
        curves: [{ fn: 'sqrt(1 - x^2)', color: 'gold', domain: [0, 1] }],
        points: DOTS.map(([x, y]) => ({ x, y, r: 2.2, color: x * x + y * y < 1 ? 'good' : 'bad' })) },
      caption: 'Four hundred random points (illustrative): green inside the quarter circle, red outside.',
    },
    steps: [
      { label: 'Sample, vectorized', text: t`One call draws all the numbers; a boolean array marks the hits, and its mean is the fraction inside:

\`\`\`python
rng = np.random.default_rng(42)
x, y = rng.random((2, 10**6))
pi_est = 4 * np.mean(x**2 + y**2 < 1)     # ${PI_SEED42}
\`\`\`

No Python loop: a million points take a few milliseconds.` },
      { label: 'Attach the error', text: t`Each point is a yes/no trial with $p = \pi/4$, so $n_{\text{in}}$ is binomial with standard deviation $\sqrt{Np(1-p)}$, and the estimate's is $4\sqrt{p(1-p)/N} = ${SIG1.toFixed(3)}/\sqrt{10^6} = ${tex(SIG1 / 1000, 3)}$. Report $\pi \approx ${PI_SEED42.toFixed(4)} \pm ${(SIG1 / 1000).toFixed(4)}$.` },
      { label: 'Compare', text: t`The estimate is off by $${tex(PI_SEED42 - Math.PI, 2)}$, which is $${((PI_SEED42 - Math.PI) / (SIG1 / 1000)).toFixed(2)}\sigma$: entirely consistent. A deviation beyond about $3\sigma$ would point to a bug — a wrong region, a biased sampler, or a forgotten factor of 4.` },
      { label: 'Price six digits', text: t`Six correct digits need $\sigma \approx 10^{-6}$: $N = (${SIG1.toFixed(3)}/10^{-6})^2 \approx ${tex((SIG1 / 1e-6) ** 2, 2)}$ points. Monte Carlo is a poor way to compute $\pi$ — and a superb way to integrate in 50 dimensions, where its error is still $\propto 1/\sqrt N$.` },
    ],
    answer: t`$\pi \approx ${PI_SEED42.toFixed(4)} \pm ${(SIG1 / 1000).toFixed(4)}$, consistent with $\pi$; six digits would take about $${tex((SIG1 / 1e-6) ** 2, 1)}$ points.`,
  },
  practice: [
    mcq({
      id: 'seed', difficulty: 1,
      prompt: t`What do these two lines print?

\`\`\`python
print(np.random.default_rng(7).random(3))
print(np.random.default_rng(7).random(3))
\`\`\``,
      choices: ['The same three numbers twice: a seeded generator replays the same sequence', 'Two different sets of three numbers, because they are random', 'An error: a seed may be used only once', 'Three numbers, then three zeros'],
      answer: 0,
      why: {
        1: 'Pseudo-random numbers come from a deterministic algorithm; the seed fixes its starting state.',
        2: 'Seeds can be reused freely; that is how runs are reproduced.',
        3: 'Each new generator starts fresh from its seed.',
      },
      hints: ['Both lines build a new generator from the same seed.'],
      teach: 'A seeded generator is deterministic: the same seed gives the same numbers, which makes Monte Carlo runs reproducible and debuggable.',
      explain: t`\`default_rng(7)\` starts the PCG64 algorithm from a state set by 7, so both lines produce identical numbers. Seed your runs to make results reproducible; use different seeds (or \`rng.spawn\`) for independent runs; omit the seed only when you truly want fresh numbers each time.`,
    }),
    num({
      id: 'sigma', difficulty: 2,
      gen(r) {
        const N = r.pick([1e4, 4e4, 2.5e5, 1e6, 1e8]);
        const s = SIG1 / Math.sqrt(N);
        return {
          prompt: t`What is the standard deviation of the hit-or-miss estimate of $\pi$ from $N = ${tex(N, 2)}$ points? Use $p = \pi/4$.`,
          visual: {
            type: 'graph',
            params: { x: [3, 9], y: [-5, -1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: 'σ',
              curves: [{ fn: `${lg(SIG1)} - x/2`, color: 'accent' }], vlines: [{ x: lg(N), color: 'gold', label: 'this N' }] },
            caption: 'σ against N on log–log axes: a straight line of slope −½.',
          },
          answer: s, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(P * (1 - P) / N), feedback: 'That is the uncertainty of the fraction n/N. The estimate is 4 times the fraction, so multiply by 4.' }, { value: SIG1 / N, feedback: 'The error falls as 1/√N, not 1/N.' }],
          hints: [t`$\sigma = 4\sqrt{p(1-p)/N}$ with $p(1-p) = ${(P * (1 - P)).toFixed(4)}$.`, t`$4\sqrt{${(P * (1 - P)).toFixed(4)}} = ${SIG1.toFixed(3)}$; divide by $\sqrt N$.`],
          teach: 'A hit-or-miss estimate is a scaled binomial fraction: σ = (scale)·√(p(1 − p)/N).',
          explain: t`$\sigma = ${SIG1.toFixed(3)}/\sqrt{${tex(N, 2)}} = ${tex(s, 3)}$. About two runs in three land within this of $\pi$, and about 95% within twice it.`,
        };
      },
    }),
    num({
      id: 'more-points', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 10]), N = r.pick([1e4, 1e5]);
        return {
          prompt: t`A Monte Carlo run with $N = ${tex(N, 1)}$ samples gives an uncertainty you want to make **${k} times smaller**. How many samples do you need in total?

\`\`\`python
estimate(N=${N})      # ± σ
estimate(N=?)        # ± σ/${k}
\`\`\``,
          answer: N * k * k, tol: { rel: 0.001 },
          errors: [{ value: N * k, feedback: 'σ ∝ 1/√N: shrinking σ by k needs k² times as many samples.' }, { value: N * Math.sqrt(k), feedback: 'Square the factor, do not take its root: N ∝ 1/σ².' }],
          hints: [t`$\sigma \propto 1/\sqrt N$, so $N \propto 1/\sigma^2$.`, t`Multiply $N$ by $${k}^2 = ${k * k}$.`],
          teach: 'Monte Carlo cost grows as the inverse square of the accuracy: each extra decimal digit costs 100 times the samples.',
          explain: t`$N = ${tex(N, 1)}\times${k * k} = ${tex(N * k * k, 2)}$. That steep price is why Monte Carlo codes work hard on *variance reduction* — importance sampling, stratification — which shrink the constant in front of $1/\sqrt N$ instead.`,
        };
      },
    }),
    code({
      id: 'mc-pi', difficulty: 2,
      prompt: t`Estimate $\pi$ by hit-or-miss with $N = 10^5$ points from \`np.random.default_rng(2024)\`, **without a Python loop**. Set \`pi_est\` to the estimate and \`sigma\` to its standard deviation, $4\sqrt{p(1-p)/N}$ with $p$ taken from your own estimate.`,
      starter: t`import numpy as np

rng = np.random.default_rng(2024)
N = 10**5
pi_est = None
sigma = None
`,
      answer: t`import numpy as np

rng = np.random.default_rng(2024)
N = 10**5
x, y = rng.random((2, N))
pi_est = 4 * np.mean(x**2 + y**2 < 1)
p = pi_est / 4
sigma = 4 * np.sqrt(p * (1 - p) / N)
print(pi_est, sigma)`,
      tests: [
        { name: t`$\sigma \approx 0.0052$`, code: 'abs(sigma - 1.642 / np.sqrt(1e5)) < 1e-4' },
        { name: t`the estimate lies within $4\sigma$ of $\pi$`, code: 'abs(pi_est - np.pi) < 4 * 1.642 / np.sqrt(1e5)' },
        { name: 'it uses all N points: the estimate is a multiple of 4/N', code: 'abs(pi_est * N / 4 - round(pi_est * N / 4)) < 1e-6' },
      ],
      hints: ['Draw both coordinates at once: `x, y = rng.random((2, N))`.', '`np.mean(x**2 + y**2 < 1)` is the fraction inside — True counts as 1.', 'Then `pi_est = 4 * fraction` and `sigma = 4 * np.sqrt(p * (1 - p) / N)` with `p = pi_est / 4`.'],
      teach: 'Vectorized sampling plus a boolean mask turns a Monte Carlo loop into two lines — and the error bar is one more.',
      explain: t`With $10^5$ points $\sigma \approx 0.0052$, so expect two or three correct digits. Using the estimate's own $p$ for $\sigma$ is standard: you rarely know the true $p$ — if you did, you would not need Monte Carlo.`,
    }),
    mcq({
      id: 'same-seed', difficulty: 3,
      prompt: t`To reduce the error, a student runs the same estimate 10 times and averages:

\`\`\`python
runs = []
for k in range(10):
    rng = np.random.default_rng(42)
    x, y = rng.random((2, 10**5))
    runs.append(4 * np.mean(x**2 + y**2 < 1))
print(np.mean(runs), np.std(runs))
\`\`\`

What is wrong?`,
      choices: [
        'Every run uses seed 42, so all ten are identical: the average is no better than one run, and the spread of 0 is not an error bar',
        'Nothing: averaging 10 runs divides the error by √10',
        'np.std should have ddof=1, which would fix the error bar',
        'The runs should be summed, not averaged',
      ],
      answer: 0,
      why: {
        1: 'Only if the runs are independent — and identical runs are perfectly correlated.',
        2: 'ddof matters for small samples, but the real problem is that the ten numbers are the same.',
        3: 'The average is the right combination; it is the identical inputs that ruin it.',
      },
      hints: ['What does a generator seeded with 42 produce, every time it is created?', 'Where is the generator created — inside the loop or before it?'],
      teach: 'Averaging only helps for independent samples: give each run its own seed (or draw from one generator), or the “repeats” are copies.',
      explain: t`Re-creating the generator with seed 42 inside the loop replays the same million numbers each time. Create one generator before the loop (or use seeds 42, 43, …, or \`rng.spawn(10)\`), and the ten runs become independent: their mean then has error $\sigma/\sqrt{10}$ and their spread estimates $\sigma$.`,
    }),
    num({
      id: 'dimensions', difficulty: 3,
      gen(r) {
        const d = r.pick([6, 8, 10, 12]);
        const gridFactor = 10 ** (d / 2), mcFactor = 100;
        return {
          prompt: t`To integrate a smooth function over a ${d}-dimensional cube, a trapezoid grid with $N$ points in total has error $\propto N^{-2/d}$ (it has only $N^{1/d}$ points per axis); Monte Carlo has error $\propto N^{-1/2}$ in any dimension. To make the error **10 times smaller**, by what factor must the **grid** method multiply its number of points?`,
          visual: {
            type: 'graph',
            params: { x: [0, 8], y: [-4, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'points N', ylabel: 'error (relative)',
              curves: [{ fn: `-x*2/${d}`, color: 'accent', label: `grid, d = ${d}`, labelAt: 5, labelDx: 6, labelDy: -10 }, { fn: '-x/2', color: 'gold', label: 'Monte Carlo', labelAt: 5.5, labelDx: 6, labelDy: 14 }] },
            caption: 'Error against points for the two methods in this dimension (constants set to 1).',
          },
          answer: gridFactor, tol: { rel: 0.01 },
          errors: [{ value: mcFactor, feedback: 'That is the Monte Carlo factor (10²). The grid’s error falls as $N^{-2/d}$.' }, { value: 10 ** (2 / d), feedback: 'Invert the relation: $\\text{error} \\propto N^{-2/d}$ means $N \\propto \\text{error}^{-d/2}$.' }],
          hints: [t`$\text{error} \propto N^{-2/${d}}$, so $N \propto \text{error}^{-${d}/2}$.`, t`Reducing the error by 10 needs $N$ multiplied by $10^{${d}/2}$.`],
          teach: 'Grid methods pay N ∝ error^(−d/p) — exponentially worse with dimension — while Monte Carlo pays error⁻² in every dimension.',
          explain: t`$10^{${d}/2} = ${tex(gridFactor, 2)}$ times the points, against $10^2 = 100$ for Monte Carlo. ${d > 4 ? `In ${d} dimensions Monte Carlo wins` : 'At d = 4 the two tie'} — and in the hundreds of dimensions of statistical mechanics or a path integral, grids are hopeless.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-detector', difficulty: 3, transfer: true,
      prompt: t`A radioactive source emits gamma rays **isotropically** (equally in every direction). A disc-shaped detector of radius $a = ${DET_A * 100}$ cm faces it, centred on the axis, $d = ${DET_D * 100}$ cm away. A ray hits if it leaves at an angle $\theta$ from the axis with $\cos\theta > d/\sqrt{d^2 + a^2}$. Estimate the fraction of rays that hit, \`frac\`, with $10^6$ random directions from \`np.random.default_rng(7)\`, and its standard deviation \`sigma\`. For isotropic directions, $\cos\theta$ is **uniform** on $[-1, 1]$.`,
      visual: {
        type: 'graph',
        params: { x: [-0.05, 0.3], y: [-0.11, 0.11], equal: true, aspect: 'wide', axes: false, grid: false,
          curves: [{ param: [`${DET_D}`, `${DET_A}*(2t - 1)`], t: [0, 1], color: 'accent', width: 6 }, { param: ['0.28*t', `0.28*t*${DET_A / DET_D}`], t: [0, 1], color: 'ink3', dash: true, width: 1.2 }, { param: ['0.28*t', `-0.28*t*${DET_A / DET_D}`], t: [0, 1], color: 'ink3', dash: true, width: 1.2 }],
          points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'source', labelDx: -20, labelDy: 18 }, { x: DET_D, y: DET_A, r: 0, label: 'detector', labelDx: 8, labelDy: -6 }] },
        caption: 'Side view: the source, the detector disc, and the edge of the cone of rays that hit it (dashed). Drawn to scale; a real detector adds a housing and dead edges.',
      },
      starter: t`import numpy as np

a, d = ${DET_A}, ${DET_D}            # detector radius and distance, m
rng = np.random.default_rng(7)
N = 10**6

frac = None
sigma = None
`,
      answer: t`import numpy as np

a, d = ${DET_A}, ${DET_D}            # detector radius and distance, m
rng = np.random.default_rng(7)
N = 10**6

cos_theta = rng.uniform(-1, 1, N)     # isotropic: cos θ uniform
hit = cos_theta > d / np.hypot(d, a)
frac = hit.mean()
sigma = np.sqrt(frac * (1 - frac) / N)
print(frac, sigma, (1 - d / np.hypot(d, a)) / 2)`,
      tests: [
        { name: t`within $4\sigma$ of the exact $(1 - \cos\theta_{\max})/2 = ${DET_EXACT.toFixed(5)}$`, code: `abs(frac - ${DET_EXACT}) < 4 * np.sqrt(${DET_EXACT} * (1 - ${DET_EXACT}) / 1e6)` },
        { name: t`$\sigma \approx ${tex(Math.sqrt((DET_EXACT * (1 - DET_EXACT)) / 1e6), 2)}$`, code: `abs(sigma - ${Math.sqrt((DET_EXACT * (1 - DET_EXACT)) / 1e6)}) < 1e-5` },
      ],
      hints: ['Draw `cos_theta = rng.uniform(-1, 1, N)` — not θ itself.', 'A hit is `cos_theta > d / np.hypot(d, a)`; the fraction is its mean.', '`sigma = np.sqrt(frac * (1 - frac) / N)`: a binomial fraction’s standard deviation.'],
      teach: 'Sample isotropic directions with cos θ uniform (and φ uniform); drawing θ uniformly piles directions up at the poles.',
      explain: t`The fraction is about ${DET_EXACT.toFixed(4)}: the detector sees ${(100 * DET_EXACT).toFixed(2)}% of the gammas, its **geometric acceptance**, against an exact $(1 - \cos\theta_{\max})/2 = ${DET_EXACT.toFixed(5)}$. Drawing $\theta$ uniformly in $[0, \pi]$ instead would give about 0.078, five times too much, because equal steps in $\theta$ cover much less solid angle near the poles than near the equator. Real detectors need Monte Carlo for what has no formula: off-axis sources, shields, and the chance a gamma that enters is actually absorbed.`,
    }),
    mcq({
      id: 'cp-slope', difficulty: 2,
      prompt: t`The errors of hit-or-miss estimates of $\pi$ at $N = 10^2 \ldots 10^6$ are plotted on log–log axes. What slope should a line through them have, and why are the points not exactly on it?`,
      visual: {
        type: 'graph',
        params: { x: [1.7, 6.3], y: [-5, -0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: '|estimate − π|',
          points: ERRS.map(([N, e]) => ({ x: lg(N), y: lg(Math.max(e, 1e-5)), color: 'gold', r: 5 })) },
        caption: 'One seeded run at each N, computed in double precision.',
      },
      choices: ['−½: the expected error is $\\sigma \\propto N^{-1/2}$; each single error is a random draw around it, sometimes much smaller', '−1, since doubling N halves the error', '−2, the convergence order of the trapezoid rule', '0: Monte Carlo errors do not depend on N'],
      answer: 0,
      why: {
        1: 'Doubling N shrinks σ by √2, not 2.',
        2: 'That is a grid rule in one dimension; Monte Carlo has no smoothness-based order.',
        3: 'They clearly fall with N; only their spread is random.',
      },
      hints: ['σ ∝ 1/√N. On log–log axes a power law becomes a straight line whose slope is the power.'],
      teach: 'Monte Carlo errors scatter around $\\sigma \\propto N^{-1/2}$: judge convergence from many runs or from the predicted σ, never from one lucky point.',
      explain: t`A power law $\sigma = cN^{-1/2}$ becomes $\log\sigma = \log c - \tfrac12\log N$. Each plotted point is one random outcome, so it can sit well below the line (a lucky run) but rarely more than about $3\sigma$ above. The Explore plot's ten runs per $N$ show the full scatter.`,
    }),
    num({
      id: 'cp-budget', difficulty: 2,
      gen(r) {
        const target = r.pick([1e-3, 5e-4, 1e-4]);
        const N = (SIG1 / target) ** 2;
        return {
          prompt: t`How many points does the hit-or-miss method need for a standard deviation of $${tex(target, 1)}$ in $\pi$?

\`\`\`python
sigma = 1.642 / np.sqrt(N)      # solve for N
\`\`\``,
          answer: N, tol: { rel: 0.02 },
          errors: [{ value: SIG1 / target, feedback: 'σ ∝ 1/√N: solve N = (1.642/σ)², so square it.' }],
          hints: [t`$N = (${SIG1.toFixed(3)}/\sigma)^2$.`],
          teach: 'Invert σ = c/√N to budget a run: N = (c/σ)².',
          explain: t`$N = (${SIG1.toFixed(3)}/${tex(target, 1)})^2 = ${tex(N, 2)}$. At about 10 ns per point in NumPy that is ${N * 1e-8 < 1 ? 'well under a second' : `${(N * 1e-8).toFixed(0)} s`} — fine for $\pi$, but in a simulation where each “point” is a full particle history, a budget like this decides the computing time.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'NumPy reference: random Generator and seeding (default_rng, PCG64, spawn)', url: 'https://numpy.org/doc/stable/reference/random/generator.html' },
    { label: 'Newman, Computational Physics, ch. 10: Random processes and Monte Carlo methods', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Knoll, Radiation Detection and Measurement, §4.VI: geometric efficiency and solid angle', url: 'https://www.wiley.com/en-us/Radiation+Detection+and+Measurement%2C+4th+Edition-p-9780470131480' },
  ],
});
