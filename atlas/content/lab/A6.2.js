// Residual analysis — what χ² cannot say: the residuals rᵢ = yᵢ − f(xᵢ), and
// the normalized residuals Rᵢ = rᵢ/σᵢ, plotted and read for pattern: smooth
// curvature (wrong model), uniform excess (underestimated σ), a lone big
// point (outlier), periodic structure, drift with the order the data were
// taken. Runs of one sign (the Wald–Wolfowitz count), the Durbin–Watson
// statistic, and why R² near 1 proves nothing. A pendulum on the bench, wind-
// tunnel drag, and a thrust stand that warms up.
// Every number is computed here from seeded synthetic data (_labf.js).
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, linfit, dataGraph, resGraph, r6, SIMNOTE, table, errbar, chi2sf } from './_labf.js';

const t = String.raw;

// ── the worked example: drag on a model in a wind tunnel, F = ½ρC_DA v² (synthetic: 0.024 N s²/m² × v², σ = 0.15 N) ──
const EX_v = Array.from({ length: 12 }, (_, i) => 20 + i);
const EX_F = (() => { const z = normals(2); return EX_v.map((x) => +(0.024 * x * x + 0.15 * z()).toFixed(2)); })();
const LIN = linfit(EX_v, EX_F, 0.15);
const QUAD = linfit(EX_v.map((x) => x * x), EX_F, 0.15);
const signs = (res) => res.map((r) => (r > 0 ? '+' : '−'));
const runsOf = (res) => { const s = signs(res); return 1 + s.slice(1).filter((c, i) => c !== s[i]).length; };
const runStats = (res) => {
  const np = res.filter((r) => r > 0).length, nm = res.length - np, N = res.length;
  const E = 1 + (2 * np * nm) / N, V = (2 * np * nm * (2 * np * nm - N)) / (N * N * (N - 1));
  return { np, nm, E, s: Math.sqrt(V), runs: runsOf(res) };
};
const RS = runStats(LIN.res), RQ = runStats(QUAD.res);

// four residual patterns stacked in one picture (rows P, Q, U, W)
const FOUR = (() => {
  const z = normals(17), n = 12, xs = Array.from({ length: n }, (_, i) => i + 1);
  const rows = {
    P: xs.map((x) => 0.032 * ((x - 6.5) ** 2 - 11.9) + 0.05 * z()),
    Q: xs.map(() => 0.3 * z()),
    U: xs.map((x) => (x === 8 ? 0.62 : 0.07 * z())),
    W: xs.map((x) => 0.4 * Math.sin(x * 2.1) + 0.04 * z()),
  };
  const bar = { P: 0.1, Q: 0.1, U: 0.1, W: 0.1 };
  const off = { P: 4.5, Q: 1.5, U: -1.5, W: -4.5 };
  const curves = [], points = [];
  for (const k of Object.keys(rows)) {
    curves.push({ fn: String(off[k]), color: 'ink3', width: 1, domain: [0.5, 12.5] });
    rows[k].forEach((r, i) => { curves.push(...errbar(xs[i], off[k] + r, bar[k], 0.12, { color: 'accent', width: 1.2 })); points.push({ x: xs[i], y: r6(off[k] + r), r: 3, color: 'accent' }); });
    points.push({ x: 13.2, y: off[k], r: 0, label: k, labelDy: 0, color: 'ink' });
  }
  return { type: 'graph', params: { aspect: 'wide', x: [0, 14], y: [-6, 6], xlabel: 'x (or the order the points were taken)', ylabel: '', yticks: 0, axesAt: 'edge', curves, points }, caption: 'Four fits’ residuals, each with ±1σ error bars about its own zero line (grey). Every row is drawn to the same scale.' };
})();

export default lesson({
  id: 'lab.A6.2',
  title: 'Residual analysis',
  minutes: 14, difficulty: 3,
  lab: true,
  intro: t`$\chi^2$ is one number; the **residuals** are the whole story. After a fit, plot each point's misfit, best as a **normalized residual**

$$R_i = \frac{y_i - f(x_i;\hat{\mathbf p})}{\sigma_i}$$

against $x$ — and against the order the data were taken. If the model is right and the $\sigma_i$ honest, the $R_i$ look like independent draws from a standard normal distribution: centred on zero, about two-thirds within $\pm 1$, about one in twenty beyond $\pm 2$, signs changing at random. **Structure means something is wrong.** A smooth curve means the model is missing a term; a uniform excess means the error bars are too small; one huge residual means one bad point; a trend with time means something drifted. A fit can have $R^2 = 0.999$ and still be the wrong model — the residuals show it.`,
  symbols: [
    { tex: 'R_i', text: 'the normalized residual of point $i$: its misfit in units of its own uncertainty (dimensionless)' },
    { tex: 'y_i', text: 'the measured value' },
    { tex: 'f(x_i;\\hat{\\mathbf p})', text: 'the fitted model’s prediction at $x_i$, with the best-fit parameters $\\hat{\\mathbf p}$' },
    { tex: '\\sigma_i', text: 'the standard uncertainty of $y_i$' },
  ],
  why: t`Every surprise in physics — a precessing perihelion, a flattening rotation curve, a new particle’s bump — first appeared as structure in somebody’s residuals.`,
  visual: {
    type: 'lab-bench',
    title: 'The bench: a pendulum on three kinds of axes',
    lead: t`Period against length for a simple pendulum. The panel below the plot shows the residuals. Use the **Plot** switch to change what is on the axes; the fitted line is always a straight one.`,
    tasks: [
      'Switch Plot to T against L: the line passes close to every point, yet the residuals form an arch — negative at both ends, positive in the middle. T grows as √L, and a line cannot follow a curve.',
      'Switch back to T² against L: the arch vanishes and the residuals scatter both sides of zero. That is what the right model looks like.',
      'Turn on the systematic error (lengths measured to the top of the bob): the residuals stay patternless. A constant offset in x changes the intercept, not the shape — residuals cannot catch every error.',
    ],
    params: { exp: 'pendulum', residuals: true, seed: 8 },
    caption: t`Simulated hand timings of ten swings, scattered by $\pm 0.05$ s; small swings and a point-like bob. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A model rocket nose cone sits on a drag balance in a wind tunnel. Twelve readings of the drag force, each $\pm 0.15$ N:

${table([[t`v\ (\text{m/s})`, ...EX_v.slice(0, 6).map(String)], [t`F\ (\text{N})`, ...EX_F.slice(0, 6).map((x) => x.toFixed(2))]])}
${table([[t`v\ (\text{m/s})`, ...EX_v.slice(6).map(String)], [t`F\ (\text{N})`, ...EX_F.slice(6).map((x) => x.toFixed(2))]])}

A straight line $F = a + bv$ fits with $R^2 = ${(1 - LIN.res.reduce((s, r) => s + r * r, 0) / EX_F.reduce((s, y) => s + (y - EX_F.reduce((a, b) => a + b, 0) / 12) ** 2, 0)).toFixed(4)}$. Is it the right model?`,
    visual: { type: 'graph', params: resGraph({ xs: EX_v, res: LIN.res.map((r) => r / 0.15), sy: 1, xlabel: 'v (m/s)', ylabel: 'R = residual / σ', connect: true }), caption: t`Normalized residuals of the straight-line fit, with their $\pm 1$ bars. Synthetic data from $F \propto v^2$ with Gaussian noise. ${SIMNOTE}` },
    steps: [
      { label: 'Chi squared first', text: t`$\chi^2 = ${LIN.chi2.toFixed(1)}$ for $\nu = 10$: $p = ${tex(chi2sf(LIN.chi2, 10), 2)}$. Something is wrong — but $\chi^2$ cannot say what.` },
      { label: 'Look at the signs', text: t`In order of speed the residuals run ${signs(LIN.res).join('')}: positive at both ends, negative in the middle. That is ${RS.runs} **runs** (unbroken stretches of one sign).` },
      { label: 'How many runs to expect', text: t`With $N_+ = ${RS.np}$ positive and $N_- = ${RS.nm}$ negative residuals in random order, the expected number of runs is $1 + 2N_+N_-/N = ${RS.E.toFixed(2)}$, with standard deviation $${RS.s.toFixed(2)}$. Seeing ${RS.runs} is $${((RS.runs - RS.E) / RS.s).toFixed(1)}\sigma$ — too few: the residuals are **correlated** along $x$.` },
      { label: 'Read the shape', text: t`A smooth U — high, low, high — is exactly what a straight line leaves behind when the truth curves upward. Drag grows as $v^2$.` },
      { label: 'Refit', text: t`Fit $F = a + c\,v^2$ instead (still linear in its parameters): $c = ${QUAD.b.toFixed(5)} \pm ${tex(QUAD.sb, 2)}\ \text{N s}^2/\text{m}^2$, $\chi^2 = ${QUAD.chi2.toFixed(1)}$ for $\nu = 10$, and ${RQ.runs} runs against ${RQ.E.toFixed(1)} expected. The pattern is gone.` },
      { label: 'Sense check', text: t`$c = \tfrac12\rho C_DA$; with $\rho = 1.20\ \text{kg/m}^3$ that gives $C_DA = ${(2 * QUAD.b / 1.2).toFixed(4)}\ \text{m}^2$, a sensible size for a model nose cone.` },
    ],
    answer: t`No. The residuals of the line form a U (${RS.runs} runs where ${RS.E.toFixed(1)} are expected) and $\chi^2 = ${LIN.chi2.toFixed(0)}$ for $\nu = 10$; $F = a + cv^2$ fits with $\chi^2 = ${QUAD.chi2.toFixed(1)}$ and patternless residuals.`,
  },
  practice: [
    match({
      id: 'four-patterns', difficulty: 2,
      prompt: 'Match each row of residuals to its most likely diagnosis.',
      visual: FOUR,
      left: ['Row P', 'Row Q', 'Row U', 'Row W'],
      right: ['The model is missing curvature', 'The error bars are too small', 'One bad point (an outlier)', 'A periodic disturbance (vibration, mains pickup)'],
      answer: [0, 1, 2, 3],
      hints: ['Look first for shape: smooth curves and repeating waves. Then compare the scatter with the size of the error bars.', 'Row Q has no shape at all, but its points stray several error bars from zero.'],
      teach: 'Residuals diagnose: smooth shape → model; uniform excess → σ; one point → outlier; repetition → a periodic effect.',
      explain: t`P curves smoothly (a missing $x^2$ term). Q is shapeless but scattered about three error bars wide: $\chi^2_\nu \approx 10$, error bars underestimated. U is fine except one point many $\sigma$ out — check the notebook for that reading before doing anything else. W oscillates: something periodic, unmodelled.`,
    }),
    num({
      id: 'norm-res', difficulty: 1,
      gen(r) {
        const y = r.float(10, 30, 0.01), f = y + r.sign() * r.float(0.05, 0.6, 0.01), s = r.pick([0.05, 0.08, 0.1, 0.2]);
        const ans = (y - f) / s;
        return {
          prompt: t`A point reads $y = ${y.toFixed(2)}$ with $\sigma = ${s}$; the fitted model predicts $${f.toFixed(2)}$ there. What is its normalized residual $R$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, 1], y: [r6(Math.min(y, f) - 3 * s - 0.1), r6(Math.max(y, f) + 3 * s + 0.1)], xlabel: '', xticks: 0, ylabel: 'y', axesAt: 'edge', curves: [...errbar(0, y, s, 0.05, { color: 'accent' })], points: [{ x: 0, y, r: 4, color: 'accent', label: 'measured' }, { x: 0.3, y: f, r: 4, color: 'gold', label: 'model' }] }, caption: 'The point with its ±1σ bar, and the model’s prediction beside it.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: y - f, feedback: 'That is the raw residual. Divide by σ to measure it in standard uncertainties.' }, { value: (f - y) / s, feedback: 'Sign: a residual is measured minus model.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`$R = (y - f)/\sigma$: measured minus model, in units of $\sigma$.`],
          teach: 'A normalized residual is the misfit counted in error bars.',
          explain: t`$R = (${y.toFixed(2)} - ${f.toFixed(2)})/${s} = ${ans.toFixed(2)}$. ${Math.abs(ans) > 3 ? 'Beyond 3: with honest errors that happens about 3 times in 1000 — check this point.' : Math.abs(ans) > 2 ? 'Between 2 and 3: expected about once in twenty points.' : 'Within 2: unremarkable.'}`,
        };
      },
    }),
    num({
      id: 'runs', difficulty: 3,
      gen(r) {
        const N = r.int(12, 18);
        const np = r.int(5, N - 5), nm = N - np;
        const runs = r.int(2, 4);
        // build a sign string with `runs` runs: alternate blocks
        const blocks = []; let pLeft = np, mLeft = nm; const startPlus = r.bool();
        const nP = Math.ceil(runs / 2) * (startPlus ? 1 : 0) + Math.floor(runs / 2) * (startPlus ? 0 : 1);
        const nM = runs - nP;
        const split = (total, k) => { const a = Array(k).fill(1); for (let i = 0; i < total - k; i++) a[i % k]++; return a; };
        const P = split(pLeft, nP), M = split(mLeft, nM);
        for (let i = 0, ip = 0, im = 0; i < runs; i++) { const plus = (i % 2 === 0) === startPlus; blocks.push((plus ? '+' : '−').repeat(plus ? P[ip++] : M[im++])); }
        const seq = blocks.join('');
        const E = 1 + (2 * np * nm) / N;
        void pLeft; void mLeft;
        return {
          prompt: t`The ${N} residuals of a fit, in order of $x$, have the signs ${seq} (${np} positive, ${nm} negative). If their signs were in random order, how many runs (unbroken stretches of one sign) would you expect on average?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, N + 1], y: [-1.5, 1.5], xlabel: 'point (in order of x)', ylabel: 'sign', yticks: 0, axesAt: 'edge', curves: [{ fn: '0', color: 'gold', width: 1.4 }], points: [...seq].map((c, i) => ({ x: i + 1, y: c === '+' ? 0.8 : -0.8, r: 4, color: c === '+' ? 'accent' : 'warn' })) }, caption: 'The sign of each residual: above the line positive, below negative.' },
          answer: E, tol: { rel: 0.01 },
          errors: [{ value: N / 2, feedback: t`That would be right only for $N_+ = N_-$ and very large $N$. Use $1 + 2N_+N_-/N$.` }, { value: runs, feedback: 'That is the number of runs observed. The question asks what random signs would give.' }, { value: (2 * np * nm) / N, feedback: 'Close: the formula has a 1 + in front.' }].filter((e) => Math.abs(e.value - E) > 0.02 * E),
          hints: [t`For $N_+$ positive and $N_-$ negative signs in random order, $E[\text{runs}] = 1 + \dfrac{2N_+N_-}{N}$.`, t`$N_+ = ${np}$, $N_- = ${nm}$, $N = ${N}$.`],
          teach: 'Random residuals change sign often; too few runs means neighbouring residuals are correlated — usually a wrong model.',
          explain: t`$E = 1 + 2(${np})(${nm})/${N} = ${E.toFixed(2)}$, against ${runs} observed. The standard deviation is $${Math.sqrt((2 * np * nm * (2 * np * nm - N)) / (N * N * (N - 1))).toFixed(2)}$, so this is about $${((runs - E) / Math.sqrt((2 * np * nm * (2 * np * nm - N)) / (N * N * (N - 1)))).toFixed(1)}\sigma$: too few runs. (This is the Wald–Wolfowitz runs test.)`,
        };
      },
    }),
    mcq({
      id: 'r-squared', difficulty: 2,
      prompt: t`A straight line fitted to the period of a pendulum against its length gives $R^2 = 0.998$. A student concludes that $T$ is proportional to $L$. What is wrong?`,
      visual: (() => { const xs = [0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5]; const ys = xs.map((L) => 2 * Math.PI * Math.sqrt(L / 9.8)); const f = linfit(xs, ys); return { type: 'graph', params: dataGraph({ xs, ys: ys.map(r6), fit: f, xlabel: 'L (m)', ylabel: 'T (s)' }), caption: 'Noise-free periods 2π√(L/g) and the best straight line. By eye, the line looks perfect.' }; })(),
      choices: [t`$R^2$ measures how much of the variation the line follows, not whether a line is the right shape; the residuals of $T = a + bL$ form an arch`, t`Nothing: $R^2 > 0.99$ confirms a linear law`, t`$R^2$ should be exactly 1 for a correct model`, t`$R^2$ can only be used with weighted fits`],
      answer: 0,
      why: { 1: t`Any smooth, monotonic curve over a modest range gives $R^2$ near 1 against a line. Here the truth is $T \propto \sqrt L$.`, 2: 'Real data have noise, so R² < 1 even for the right model.', 3: 'R² can be computed for any fit; it just does not test the model’s shape.' },
      hints: ['Would a gently curved function also give R² close to 1 over this range?'],
      teach: 'R² near 1 does not validate a model; patternless residuals and a sensible χ² do.',
      explain: t`$T = 2\pi\sqrt{L/g}$ is curved, but only gently between 0.3 and 1.5 m, so a line captures 99.8% of its variation. Plot the residuals and the arch appears — the same arch as on the bench above.`,
    }),
    mcq({
      id: 'order', difficulty: 3,
      prompt: t`You calibrate a pressure transducer at ten pressures taken in a **random order**. Residuals against pressure look patternless; residuals against the order of measurement climb steadily. What does that tell you?`,
      visual: (() => { const z = normals(23); const order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; const res = order.map((k) => 0.12 * (k - 5.5) + 0.12 * z()); return { type: 'graph', params: resGraph({ xs: order, res: res.map(r6), sy: 0.15, xlabel: 'order of measurement', ylabel: 'residual (kPa)' }), caption: 'Residuals plotted in the order the readings were taken.' }; })(),
      choices: ['Something drifted during the run (the transducer warming up, a slow leak); randomizing kept it from biasing the slope, and the order plot revealed it', 'Nothing: only the plot against pressure matters', 'The calibration model is missing a quadratic term', 'The random order caused the trend'],
      answer: 0,
      why: { 1: 'Plotting against x alone hides anything that depends on time.', 2: 'A missing term would show against pressure, not against time.', 3: 'The order only lets time-dependence show; it cannot create it.' },
      hints: ['What changes steadily with time in a lab?', 'Why does randomizing the order keep a drift out of the slope?'],
      teach: 'Plot residuals against time too: drift hides in the measurement order.',
      explain: t`A steady climb with time is drift — thermal warm-up is the usual culprit. Taken in random order, the drift adds scatter rather than tilting the slope (taken in increasing pressure, it would have tilted the calibration and stayed invisible). The fix is to warm up, re-zero, or model the drift.`,
    }),
    num({
      id: 'beyond-2', difficulty: 2,
      gen(r) {
        const N = r.pick([40, 60, 80, 100, 150, 200]);
        const ans = N * 0.0455;
        return {
          prompt: t`A fit has ${N} points and honest error bars. About how many normalized residuals should lie beyond $\pm 2$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-4, 4], y: [0, 0.45], xlabel: 'R', ylabel: 'density', yticks: 3, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)/sqrt(2*pi)', color: 'accent' }], shade: [{ fn: 'exp(-x^2/2)/sqrt(2*pi)', from: -4, to: -2, color: 'warn', alpha: 0.4 }, { fn: 'exp(-x^2/2)/sqrt(2*pi)', from: 2, to: 4, color: 'warn', alpha: 0.4 }] }, caption: 'The standard normal distribution; the shaded tails beyond ±2 hold 4.55% of it.' },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: N * 0.05, feedback: 'Close — 5% is the round figure; the exact two-tailed fraction beyond 2σ is 4.55%.' }, { value: N * 0.0228, feedback: 'That is one tail. Count both, below −2 and above +2.' }, { value: 0, feedback: 'Honest residuals do stray beyond 2σ sometimes — about 1 in 22.' }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: ['For a standard normal, P(|R| > 2) = 0.0455.'],
          teach: 'With honest errors, about 1 point in 22 lies beyond ±2σ — removing them is not “cleaning”.',
          explain: t`$${N} \times 0.0455 \approx ${ans.toFixed(1)}$. If you see that many, all is well. Deleting them because they “look bad” shrinks your error bars dishonestly; only a recorded reason (a misread scale, a glitch in the log) justifies dropping a point.`,
        };
      },
    }),
    code({
      id: 'residual-tools', difficulty: 3,
      prompt: t`Write \`diagnose(y, model, sigma)\` returning \`(R, runs, expected, dw)\`: the normalized residuals, the number of runs of one sign, the expected number $1 + 2N_+N_-/N$, and the Durbin–Watson statistic $d = \sum_{i\ge2}(R_i - R_{i-1})^2 / \sum R_i^2$ (about 2 for independent residuals, well below 2 when neighbours are alike). The program applies it to the wind-tunnel line fit.`,
      starter: t`import numpy as np

v = np.arange(20.0, 32.0)
F = np.array([${EX_F.join(', ')}])
a, b = ${LIN.a}, ${LIN.b}     # the straight-line fit

def diagnose(y, model, sigma):
    R = (y - model) / sigma
    # your code: runs, expected, dw
    return R, runs, expected, dw

R, runs, expected, dw = diagnose(F, a + b * v, 0.15)
print(f"runs {runs} (expected {expected:.2f}), Durbin–Watson {dw:.2f}")`,
      answer: t`import numpy as np

v = np.arange(20.0, 32.0)
F = np.array([${EX_F.join(', ')}])
a, b = ${LIN.a}, ${LIN.b}     # the straight-line fit

def diagnose(y, model, sigma):
    R = (y - model) / sigma
    s = np.sign(R)
    runs = 1 + int(np.sum(s[1:] != s[:-1]))
    Np, Nm = int(np.sum(s > 0)), int(np.sum(s < 0))
    expected = 1 + 2 * Np * Nm / R.size
    dw = np.sum(np.diff(R)**2) / np.sum(R**2)
    return R, runs, expected, dw

R, runs, expected, dw = diagnose(F, a + b * v, 0.15)
print(f"runs {runs} (expected {expected:.2f}), Durbin–Watson {dw:.2f}")`,
      tests: [
        { name: 'the normalized residuals are (y − model)/σ', code: `abs(diagnose(F, a + b * v, 0.15)[0][0] - ${LIN.res[0] / 0.15}) < 1e-6` },
        { name: `the line leaves ${RS.runs} runs, against ${RS.E.toFixed(2)} expected`, code: `diagnose(F, a + b * v, 0.15)[1] == ${RS.runs} and abs(diagnose(F, a + b * v, 0.15)[2] - ${RS.E}) < 1e-9` },
        { name: 'the Durbin–Watson statistic is computed from successive differences', code: `abs(diagnose(F, a + b * v, 0.15)[3] - ${(() => { const R = LIN.res.map((x) => x / 0.15); let n = 0, d = 0; for (let i = 0; i < R.length; i++) { d += R[i] ** 2; if (i) n += (R[i] - R[i - 1]) ** 2; } return n / d; })()}) < 1e-6` },
        { name: 'independent residuals give a Durbin–Watson value near 2', code: '1.7 < diagnose(np.random.default_rng(1).normal(size=4000), 0, 1)[3] < 2.3' },
      ],
      hints: [t`\`s = np.sign(R)\`; a run ends wherever \`s[1:] != s[:-1]\`, so \`runs = 1 + int(np.sum(s[1:] != s[:-1]))\`.`, t`\`dw = np.sum(np.diff(R)**2) / np.sum(R**2)\`.`],
      teach: 'Two lines each turn “the residuals look patterned” into a number: the runs count and the Durbin–Watson statistic.',
      explain: t`The line gives ${RS.runs} runs against ${RS.E.toFixed(1)} expected and a Durbin–Watson value well below 2 — neighbours alike, the signature of a missing term. Numbers like these back up what your eye sees; they do not replace the plot.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-stand', difficulty: 3, transfer: true,
      prompt: t`A rocket test stand’s load cell is checked with dead weights loaded in increasing order, 0 to 5 kN, then unloaded. The residuals of a straight-line fit are all positive on the way up and all negative on the way down. The most likely cause:`,
      visual: (() => { const up = [0, 1, 2, 3, 4, 5]; const xs = [...up, ...up.slice().reverse()]; const res = xs.map((x, i) => (i < 6 ? 1 : -1) * (0.6 * Math.sin(Math.PI * x / 5) + 0.15)); return { type: 'graph', params: { aspect: 'wide', x: [-0.4, 5.4], y: [-1.2, 1.2], xlabel: 'load (kN)', ylabel: 'residual (N)', axesAt: 'edge', curves: [{ fn: '0', color: 'gold', width: 1.4 }], points: xs.map((x, i) => ({ x, y: r6(res[i]), r: 4, color: i < 6 ? 'accent' : 'warn' })), legend: [{ label: 'loading', color: 'accent', point: true }, { label: 'unloading', color: 'warn', point: true }], legendAt: 'tr' }, caption: 'Residuals against load: blue on the way up, orange on the way down. Schematic, not to scale.' }; })(),
      choices: ['Hysteresis: the flexure or its mounting responds differently to rising and falling load', 'Underestimated error bars', 'An outlier at full load', 'Too few calibration points'],
      answer: 0,
      why: { 1: 'Too-small bars give large residuals of random sign, not a clean split by direction.', 2: 'One point cannot make every loading residual positive.', 3: 'More points would show the same split more clearly.' },
      hints: ['The residuals sort themselves by whether the load was rising or falling.', 'Which property of a material or a mounting depends on the direction the load is changing, not just its value?'],
      teach: 'Residuals split by history (up versus down) mean hysteresis — a property of the instrument the straight line leaves out.',
      explain: t`The residual depends on the load’s history, not just its value: hysteresis, from friction in the mounting or the flexure’s material. Calibration standards call for loading and unloading runs for exactly this reason; the hysteresis then becomes a stated uncertainty of the load cell ([calibration](#/lesson/lab.A7.1)).`,
    }),
    num({
      id: 'cp-dw', difficulty: 3,
      gen(r) {
        const R = Array.from({ length: 6 }, (_, i) => +((i < 3 ? 1 : -1) * r.float(0.3, 1.6, 0.1) * (i % 3 === 1 ? 1.2 : 1)).toFixed(1));
        const k = r.int(0, 5); R[k] = -R[k];
        let n = 0, d = 0; for (let i = 0; i < 6; i++) { d += R[i] ** 2; if (i) n += (R[i] - R[i - 1]) ** 2; }
        const ans = n / d;
        return {
          prompt: t`Six normalized residuals, in order, are ${R.map((x) => `$${x}$`).join(', ')}. Compute the Durbin–Watson statistic $d = \sum_{i=2}^{6}(R_i - R_{i-1})^2 \big/ \sum_{i=1}^{6} R_i^2$.`,
          visual: { type: 'graph', params: resGraph({ xs: [1, 2, 3, 4, 5, 6], res: R, xlabel: 'point (in order)', ylabel: 'R', connect: true }), caption: 'The six residuals, joined in order.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: n / d / 2, feedback: 'No factor of ½: d itself is about 2 for independent residuals.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The denominator is $\sum R_i^2 = ${r6(d)}$.`, t`Square the five successive differences $R_2 - R_1, \ldots, R_6 - R_5$ and add them.`],
          teach: 'Durbin–Watson compares successive differences with the residuals’ size: about 2 if independent, near 0 if neighbours are alike.',
          explain: t`$\sum (R_i - R_{i-1})^2 = ${r6(n)}$ and $\sum R_i^2 = ${r6(d)}$, so $d = ${ans.toFixed(2)}$. ${ans < 1.2 ? 'Well below 2: neighbouring residuals are alike, as a missing model term makes them.' : ans > 2.8 ? 'Well above 2: residuals alternate in sign more than chance would.' : 'With only six points, d this close to 2 is no evidence of correlation.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'I. G. Hughes & T. P. A. Hase, Measurements and their Uncertainties, ch. 8 (residuals and the runs test)', url: 'https://global.oup.com/academic/product/measurements-and-their-uncertainties-9780199566334' },
    { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §4.4.4 (how to tell whether a model fits: residual plots)', url: 'https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm' },
  ],
});
