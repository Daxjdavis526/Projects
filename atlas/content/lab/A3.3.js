// Monte Carlo error propagation — the GUM Supplement 1 method: draw the
// inputs from their distributions, push every draw through the formula, and
// read the result's mean, standard deviation and percentile interval. Where
// it agrees with linear propagation and where it does not: a photogate speed
// with a 20% timing uncertainty (skewed), x² at zero, the exponential's
// shifted mean, correlated draws, how many draws are enough, and a star's
// distance from its parallax as the transfer. (prog.P13.2 covers the rocket
// equation and correlated masses; this lesson does not repeat them.)
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, stat, SRC } from './_unc.js';

const t = String.raw;

// the worked example: v = d/t with d = 50.0 ± 0.5 mm and t = 20.0 ± 4.0 ms
const EX = (() => {
  const f = ([d, tt]) => d / tt;
  const mc = M.monteCarlo(f, [0.05, 0.02], [0.0005, 0.004], { N: 200000, seed: 5 });
  const lin = M.linear(f, [0.05, 0.02], [0.0005, 0.004]);
  return { mc, lin };
})();

export default lesson({
  id: 'lab.A3.3',
  title: 'Monte Carlo error propagation',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`Linear propagation replaces the formula by its tangent. When an input’s uncertainty is large, or the formula curves, the result’s distribution is skewed and its mean shifts — and the tangent cannot see it. **Monte Carlo propagation** does no approximating: draw every input from its distribution $M$ times, compute the result for every draw, and describe the pile of results directly:

$$f^{(k)} = f\bigl(x_1^{(k)}, \ldots, x_N^{(k)}\bigr), \qquad k = 1, \ldots, M$$

Their mean is the estimate, their standard deviation the standard uncertainty, and their 2.5th and 97.5th percentiles a 95% coverage interval. This is the GUM’s **Supplement 1** (JCGM 101:2008) method, the reference when linearization is in doubt. The [programming course](#/lesson/prog.P13.2) builds the same tool from NumPy’s generator.`,
  symbols: [
    { tex: 'x_i^{(k)}', text: 'the $k$-th random draw of input $i$, from its distribution (normal, rectangular, …, correlated with the others if they are)' },
    { tex: 'f^{(k)}', text: 'the result computed from the $k$-th set of draws' },
    { tex: 'M', text: 'the number of draws. Monte Carlo’s own error shrinks as $1/\\sqrt M$; $10^5$ to $10^6$ is typical' },
  ],
  why: 'Large relative uncertainties, ratios of noisy quantities, exponentials and thresholds are everywhere in real experiments, and only Monte Carlo propagates them honestly.',
  visual: {
    type: 'labx-stats',
    title: 'A photogate speed with a poorly known time',
    lead: t`A 5.0 cm flag passes a photogate in $t = 20$ ms, so $v = d/t = 2.5$ m/s. Increase the timing uncertainty and watch the Monte Carlo histogram of $v$ part company with the Gaussian that linear propagation predicts (dashed).`,
    tasks: [
      'At 2 ms (10%) the two agree: the tangent is a good stand-in for 1/t over that spread.',
      'At 6 ms (30%) the histogram is visibly skewed: a long tail to high speeds, and its mean above 2.5 m/s.',
      'Compare the readouts: the 68% interval is no longer symmetric about the median.',
    ],
    params: { mode: 'mc', f: '0.05/x', x: [0.02, 0.002], xname: 'transit time t (s)', fname: 'speed v (m/s)', controls: ['sx'], seed: 8 },
  },
  example: {
    prompt: t`A photogate times a 50.0 ± 0.5 mm flag at $t = 20.0 \pm 4.0$ ms (a jittery trigger). Propagate the uncertainty to $v = d/t$ both ways and decide what to report.`,
    visual: stat('mc', { f: 'x/y', x: [0.05, 0.0005], y: [0.02, 0.004], xname: 'flag width d (m)', yname: 'time t (s)', fname: 'speed v (m/s)', N: 200000, seed: 5, fr: [0.5, 6] }, 'Two hundred thousand draws of d and t (top) and the speeds they give (bottom), with the linear Gaussian dashed. The violet bar is the Monte Carlo 68% interval.'),
    steps: [
      { label: 'Linear', text: t`$\sigma_v/v = \sqrt{(0.5/50)^2 + (4/20)^2} = ${(100 * EX.lin.sigma / EX.lin.value).toFixed(1)}\%$, so $v = ${EX.lin.value.toFixed(2)} \pm ${EX.lin.sigma.toFixed(2)}$ m/s — symmetric by construction.` },
      { label: 'Draw', text: t`Draw $M = 200\,000$ pairs: $d$ from $N(50.0, 0.5)$ mm, $t$ from $N(20.0, 4.0)$ ms. Compute $v = d/t$ for each.` },
      { label: 'Describe', text: t`Mean $${EX.mc.mean.toFixed(2)}$ m/s, standard deviation $${EX.mc.sd.toFixed(2)}$ m/s, median $${EX.mc.median.toFixed(2)}$ m/s; 68% of the draws lie in $[${EX.mc.lo.toFixed(2)}, ${EX.mc.hi.toFixed(2)}]$ and 95% in $[${EX.mc.lo95.toFixed(2)}, ${EX.mc.hi95.toFixed(2)}]$ m/s.` },
      { label: 'Why they differ', text: t`$1/t$ curves upward: a short time raises $v$ more than a long time lowers it. The distribution of $v$ has a tail to high speeds, so its mean sits above $d/\bar t$ and its spread is larger than the tangent says.` },
      { label: 'Report', text: t`Following Supplement 1: estimate $${EX.mc.mean.toFixed(2)}$ m/s, standard uncertainty $${EX.mc.sd.toFixed(2)}$ m/s, and the asymmetric 95% interval $[${EX.mc.lo95.toFixed(2)}, ${EX.mc.hi95.toFixed(2)}]$ m/s. Better still: fix the trigger.` },
    ],
    answer: t`Linear: $${EX.lin.value.toFixed(2)} \pm ${EX.lin.sigma.toFixed(2)}$ m/s. Monte Carlo: $${EX.mc.mean.toFixed(2)} \pm ${EX.mc.sd.toFixed(2)}$ m/s with a skewed 95% interval $[${EX.mc.lo95.toFixed(2)}, ${EX.mc.hi95.toFixed(2)}]$ m/s — the one to trust at a 20% input uncertainty.`,
  },
  practice: [
    code({
      id: 'mc-speed', difficulty: 2,
      prompt: t`Write the Monte Carlo yourself. With \`rng = np.random.default_rng(42)\` draw $M = 200\,000$ values of $d \sim N(0.0500, 0.0005)$ m and $t \sim N(0.0200, 0.0040)$ s, compute \`v = d / t\`, and set \`v_mean\`, \`v_sd\` (\`ddof=1\`) and \`lo\`, \`hi\` (the 2.5th and 97.5th percentiles). Print them.`,
      starter: t`import numpy as np

rng = np.random.default_rng(42)
M = 200_000
d = None
t = None
v = None
v_mean = v_sd = lo = hi = None
print(v_mean, v_sd, lo, hi)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(42)
M = 200_000
d = rng.normal(0.0500, 0.0005, M)
t = rng.normal(0.0200, 0.0040, M)
v = d / t
v_mean, v_sd = np.mean(v), np.std(v, ddof=1)
lo, hi = np.percentile(v, [2.5, 97.5])
print(v_mean, v_sd, lo, hi)`,
      tests: [
        { name: '`v` holds 200 000 speeds', code: 'len(v) == 200000' },
        { name: 'the mean is above d/t = 2.5 m/s (about 2.61)', code: 'abs(v_mean - 2.615) < 0.02' },
        { name: 'the standard deviation is about 0.62 m/s, not the linear 0.50', code: 'abs(v_sd - 0.62) < 0.03' },
        { name: 'the 95% interval runs from about 1.79 to 4.1 m/s', code: 'abs(lo - 1.79) < 0.03 and abs(hi - 4.11) < 0.08' },
      ],
      hints: ['`rng.normal(mean, sd, M)` draws M values.', '`np.percentile(v, [2.5, 97.5])` gives both ends of the interval at once.'],
      teach: 'Monte Carlo propagation is three steps: draw the inputs, apply the formula to every draw, summarize the results.',
      explain: 'The mean comes out near 2.61 m/s, the SD near 0.62 m/s and the interval near [1.79, 4.1] m/s — the same as the worked example, with a different seed. Linear propagation’s ±0.50 m/s understates the spread and misses the skew.',
    }),
    num({
      id: 'x-squared', difficulty: 3,
      gen(r) {
        const s = r.pick([0.2, 0.3, 0.5, 0.8]);
        return {
          prompt: t`A small offset is measured as $x = 0.00 \pm ${s}$ mV, and the analysis needs $f = x^2$. Linear propagation gives $f = 0 \pm 0$ (the derivative $2x$ is zero there). What is the true **mean** of $f$, in mV²?`,
          visual: stat('mc', { f: 'x^2', x: [0, s], xname: 'x (mV)', fname: 'x² (mV²)', N: 50000, seed: 3, lin: false }, 'Draws of x (top) and of x² (bottom): every draw gives a positive square.'),
          answer: s * s, tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'That is what the tangent says. But every draw of x² is positive, so its mean cannot be zero.' }, { value: s, feedback: 'That is σ, in mV. The mean of x² is σ² (in mV²).' }],
          hints: ['Every draw of x, positive or negative, gives a positive x².', t`The mean of $x^2$ for a distribution centred on 0 is its variance, $\sigma^2$.`],
          teach: 'Where the first derivative vanishes, linear propagation says “no uncertainty” — Monte Carlo shows a biased, skewed result.',
          explain: t`$\langle x^2\rangle = \bar x^2 + \sigma^2 = ${sf(s * s, 3)}$ mV², and $f$ scatters with standard deviation $\sqrt2\,\sigma^2 = ${sf(Math.SQRT2 * s * s, 3)}$ mV². A power computed from a noisy amplitude near zero is biased upward in exactly this way.`,
        };
      },
    }),
    num({
      id: 'exp-mean', difficulty: 3,
      gen(r) {
        const mu = r.pick([0.5, 1.0, 1.5]), s = r.pick([0.4, 0.5, 0.6]);
        const mean = Math.exp(mu + (s * s) / 2);
        return {
          prompt: t`A result is computed as $f = e^{x}$ from a measured exponent $x = ${mu} \pm ${s}$ (normal errors) — a Boltzmann or Arrhenius factor, say. A Monte Carlo run’s mean will approach the exact value $e^{\bar x + \sigma^2/2}$. What is it, to three significant figures? (Compare $e^{\bar x}$.)`,
          visual: stat('mc', { f: 'e^x', x: [mu, s], xname: 'x', fname: 'eˣ', N: 50000, seed: 6 }, 'Draws of x and of eˣ: a long tail to the right, against the linear Gaussian (dashed).'),
          answer: mean, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(mu), feedback: t`$e^{\bar x}$ is the median of $f$, not its mean: the long upper tail pulls the mean higher.` }],
          hints: [t`For normal $x$, $e^x$ is log-normal, and its mean is $e^{\bar x + \sigma^2/2}$.`, t`The exponent is $${mu} + ${s}^2/2 = ${(mu + s * s / 2).toFixed(3)}$.`],
          teach: 'For a convex function, the mean of f exceeds f of the mean — Monte Carlo captures the shift that linearization misses.',
          explain: t`$e^{${mu} + ${(s * s / 2).toFixed(3)}} = ${mean.toFixed(3)}$, against $e^{${mu}} = ${Math.exp(mu).toFixed(3)}$: a ${((mean / Math.exp(mu) - 1) * 100).toFixed(0)}% shift that $f(\bar x)$ never shows.`,
        };
      },
    }),
    mcq({
      id: 'report-skewed', difficulty: 2,
      prompt: t`A Monte Carlo run gives a skewed result: mean 2.61, median 2.50, standard deviation 0.62, 95% interval $[1.79, 4.11]$. Which report follows the GUM Supplement 1?`,
      visual: stat('mc', { f: 'x/y', x: [0.05, 0.0005], y: [0.02, 0.004], xname: 'd (m)', yname: 't (s)', fname: 'v (m/s)', N: 100000, seed: 5, fr: [0.5, 6] }, 'The skewed distribution of the result.'),
      choices: [
        'Estimate 2.61, standard uncertainty 0.62, and the asymmetric 95% coverage interval [1.79, 4.11]',
        '2.61 ± 1.24 (k = 2), as for a normal distribution',
        'The median 2.50 with ± 0.62, since the median is unaffected by the tail',
        'Drop the draws above 4.11 as outliers, then recompute a symmetric uncertainty',
      ],
      answer: 0,
      why: {
        1: '±2u gives [1.37, 3.85] — not where 95% of the draws lie. For a skewed result, report the interval from the percentiles.',
        2: 'The median is a fine description, but mixing it with a standard deviation describes no particular interval. State what each number is.',
        3: 'The tail is the physics of the formula, not a mistake. Removing it hides the asymmetry you computed the Monte Carlo to find.',
      },
      hints: ['What does a coverage interval from percentiles give that k × u does not, for a skewed distribution?'],
      teach: 'For a non-Gaussian result, give the estimate, the standard uncertainty and an explicit (possibly asymmetric) coverage interval from the percentiles.',
      explain: 'Supplement 1 takes the mean as the estimate and the standard deviation as the standard uncertainty, and gives a coverage interval from the distribution itself — here clearly asymmetric about the estimate.',
    }),
    code({
      id: 'mc-correlated', difficulty: 3,
      prompt: t`Correlated inputs: two thermometer readings $T_1 = 293.40$ K and $T_2 = 291.10$ K each have standard uncertainty 0.30 K, correlated with $\rho = 0.8$ (they share a calibration). With \`rng = np.random.default_rng(7)\` and \`rng.multivariate_normal\`, draw 100 000 pairs, set \`dT\` to the differences $T_1 - T_2$ and \`s_dT\` to their standard deviation. Print \`s_dT\`.`,
      starter: t`import numpy as np

rng = np.random.default_rng(7)
mean = [293.40, 291.10]
s, rho = 0.30, 0.8
cov = [[s**2, 0.0], [0.0, s**2]]    # fix the covariance
draws = rng.multivariate_normal(mean, cov, size=100_000)
dT = None
s_dT = None
print(s_dT)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(7)
mean = [293.40, 291.10]
s, rho = 0.30, 0.8
cov = [[s**2, rho*s*s], [rho*s*s, s**2]]
draws = rng.multivariate_normal(mean, cov, size=100_000)
dT = draws[:, 0] - draws[:, 1]
s_dT = np.std(dT, ddof=1)
print(s_dT)`,
      tests: [
        { name: 'the covariance has ρσ² off the diagonal', code: 'np.allclose(cov, [[0.09, 0.072], [0.072, 0.09]])' },
        { name: '`dT` holds 100 000 differences near 2.30 K', code: 'len(dT) == 100000 and abs(np.mean(dT) - 2.30) < 0.01' },
        { name: '`s_dT` matches √(2σ²(1 − ρ)) ≈ 0.19 K', code: 'abs(s_dT - (2*0.09*0.2)**0.5) < 0.004' },
      ],
      hints: ['The off-diagonal entries are `rho*s*s`.', '`draws[:, 0] - draws[:, 1]` is the difference of the two columns.'],
      teach: 'Correlated inputs are drawn together from a multivariate normal; the Monte Carlo then handles the correlation without any covariance algebra.',
      explain: t`$\sigma_{\Delta T} = \sqrt{2\sigma^2(1 - \rho)} = 0.19$ K, against 0.42 K if the readings were independent: the shared calibration error cancels in the difference.`,
    }),
    mcq({
      id: 'how-many-draws', difficulty: 2,
      prompt: t`The standard deviation from $M$ Monte Carlo draws is itself uncertain by about $1/\sqrt{2M}$ (relative). Roughly how many draws make that uncertainty 1%?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [1, 7], xlog: true, y: [0, 25], xlabel: 'draws M', ylabel: 'uncertainty of the SD (%)', xticks: 6, yticks: 5, axesAt: 'edge', curves: [{ fn: '100/sqrt(2*10^x)', domain: [1, 7], color: 'accent' }], hlines: [{ y: 1, color: 'gold', label: '1%' }] }, caption: 'Monte Carlo’s own uncertainty in the standard deviation, against the number of draws (log scale).' },
      choices: ['5 000', '50', '500', '5 000 000'],
      answer: 0,
      why: {
        1: '1/√100 = 10%: fifty draws leave the uncertainty itself uncertain by a tenth.',
        2: '1/√1000 ≈ 3%.',
        3: 'That works, but it is a thousand times more than 1% needs. Draws are cheap; still, know what you are buying.',
      },
      hints: [t`Solve $1/\sqrt{2M} = 0.01$.`],
      teach: 'Monte Carlo’s own precision improves as 1/√M; a few thousand draws pin a standard deviation to about 1%, and tail percentiles need more.',
      explain: t`$2M = 10^4$, so $M = 5000$. Percentiles far in the tails need more draws: Supplement 1 suggests about $10^6$ for a 95% interval.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-parallax', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([4.0, 5.0, 2.5, 8.0]), sp = +(r.pick([0.8, 1.0, 1.2]) * p / 4).toFixed(1);
        const hi = 1000 / (p - sp);
        return {
          prompt: t`A star’s parallax is measured as $\varpi = ${p.toFixed(1)} \pm ${sp.toFixed(1)}$ mas, and its distance is $d = 1000/\varpi$ (pc, with $\varpi$ in mas). Monte Carlo the distance: what is the **upper** end of its central 68% interval (the 84th percentile of $d$), in parsecs?`,
          visual: stat('mc', { f: '1000/x', x: [p, sp], xname: 'parallax ϖ (mas)', fname: 'distance d (pc)', N: 100000, seed: 12, hide: ['mc'], fr: [0, +(2.6 * 1000 / p).toFixed(0)] }, 'Draws of the parallax and the distances they imply. The distance’s tail reaches far: small parallaxes mean huge distances.'),
          answer: hi, units: 'pc', tol: { rel: 0.015 },
          errors: [{ value: 1000 / p + (1000 * sp) / (p * p), feedback: t`That is the linear estimate $d + \sigma_d$. The distribution of $d$ is skewed: map the parallax’s percentiles through $d = 1000/\varpi$ instead.` }, { value: 1000 / (p + sp), feedback: 'That is the lower end: the 16th percentile of ϖ gives the 84th percentile of d, because d falls as ϖ rises.' }],
          hints: ['d = 1000/ϖ decreases steadily as ϖ grows, so every percentile of ϖ maps to a percentile of d.', t`The 84th percentile of $d$ comes from the 16th percentile of $\varpi$: $\bar\varpi - \sigma$.`],
          teach: 'For a monotonic formula, Monte Carlo percentiles are the formula applied to the input’s percentiles — and they are asymmetric.',
          explain: t`$1000/(${p.toFixed(1)} - ${sp.toFixed(1)}) = ${hi.toFixed(0)}$ pc, while the lower end is $1000/${(p + sp).toFixed(1)} = ${(1000 / (p + sp)).toFixed(0)}$ pc about a median of ${(1000 / p).toFixed(0)} pc. Linear propagation would say $\pm${((1000 * sp) / (p * p)).toFixed(0)}$ pc both ways. At large fractional parallax errors astronomers go further and combine the likelihood with a prior on distances — see [Bayes’ theorem](#/lesson/st-g.G4.1).`,
        };
      },
    }),
    num({
      id: 'cp-exp', difficulty: 3,
      prompt: t`An absorber’s transmission is $\tau = e^{-\mu x}$ with $\mu x = 2.0 \pm 0.6$ (normal). By how many percent does the mean of $\tau$ (from Monte Carlo, or exactly $e^{-2.0 + 0.6^2/2}$) exceed $e^{-2.0}$?`,
      visual: stat('mc', { f: 'e^(-x)', x: [2, 0.6], xname: 'μx', fname: 'transmission τ', N: 50000, seed: 17 }, 'Draws of μx and the transmissions they give, against the linear Gaussian (dashed).'),
      answer: 100 * (Math.exp(0.18) - 1), units: '%', tol: { rel: 0.01 },
      errors: [{ value: 0, feedback: 'Linear propagation says no shift — but e⁻ˣ is curved, so the average transmission is higher.' }],
      hints: [t`For normal $y = \mu x$, the mean of $e^{-y}$ is $e^{-\bar y + \sigma^2/2}$.`, t`The ratio of the two is $e^{\sigma^2/2} = e^{0.18}$.`],
      teach: 'A convex formula shifts the mean of the result away from f(mean); Monte Carlo measures that shift.',
      explain: t`$e^{0.18} - 1 = ${(Math.exp(0.18) - 1).toFixed(4)}$, a ${(100 * (Math.exp(0.18) - 1)).toFixed(1)}% shift — invisible to linear propagation, which only knows the slope at $\mu x = 2$.`,
    }),
    mcq({
      id: 'cp-agree', difficulty: 2,
      prompt: 'You run Monte Carlo and linear propagation on the same formula, and they agree to 1%. What may you conclude?',
      visual: stat('mc', { f: 'x/y', x: [10, 0.1], y: [5, 0.05], xname: 'x', yname: 'y', fname: 'x/y', N: 50000, seed: 2 }, 'Small relative uncertainties: the histogram and the linear Gaussian coincide.'),
      choices: [
        'The formula is close to linear over the inputs’ spreads, so either method is fine — for these inputs',
        'Monte Carlo was unnecessary for this kind of formula at any uncertainty',
        'Both methods must be wrong in the same way',
        'The inputs must be independent',
      ],
      answer: 0,
      why: {
        1: 'Agreement is a property of the formula and the size of the uncertainties together. With larger input uncertainties the same formula can part company.',
        2: 'Two methods with different assumptions agreeing is evidence that the shared assumptions hold.',
        3: 'Both methods can handle correlated inputs; agreement says nothing about whether there were correlations.',
      },
      hints: ['What assumption does linear propagation make that Monte Carlo does not?'],
      teach: 'When linear and Monte Carlo propagation agree, the linearization holds for these uncertainties — a cheap and convincing check.',
      explain: 'Linearization is valid when f is nearly straight over each input’s spread. Their agreement confirms that here; the photogate example shows the same kind of formula failing at a 20% input uncertainty.',
    }),
  ],
  sources: [SRC.gumS1, SRC.gum, SRC.numpy],
});
