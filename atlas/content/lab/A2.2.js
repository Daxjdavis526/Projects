// The normal distribution — the shape most measurement errors take and why
// (the central limit theorem), its 68–95–99.7 coverages, z-scores, coverage
// factors from its quantiles, FWHM = 2.355σ for a spectral line, the
// expected number of "3σ outliers" in a large data set, and a combustion
// chamber's pressure redline as the transfer.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, stat, normalPic, SRC } from './_unc.js';

const t = String.raw;

const EX = { mu: 101.30, sigma: 0.40, lim: 102.30 };
EX.z = (EX.lim - EX.mu) / EX.sigma;
EX.p = M.normalSf(EX.z);

const gaussX = (mu, sigma, { x, label, xlabel = '', extra = {} } = {}) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [+(mu - 4.2 * sigma).toPrecision(6), +(mu + 4.2 * sigma).toPrecision(6)], y: [0, +(0.48 / sigma).toPrecision(3)], xlabel, ylabel: 'density', xticks: 8, yticks: 4, axesAt: 'edge',
    curves: [{ fn: `e^(-(x - ${mu})^2/(2*${sigma}^2))/(${sigma}*sqrt(2pi))`, color: 'accent' }],
    ...(x !== undefined ? { vlines: [{ x, color: 'gold', label }] } : {}),
    ...extra,
  },
});

export default lesson({
  id: 'lab.A2.2',
  title: 'The normal distribution',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`When an error is the sum of many small, independent disturbances — thermal noise, vibration, a dozen tiny effects — its distribution approaches the **normal** (Gaussian) curve, whatever the shapes of the pieces. That is the **central limit theorem**, and it is why the normal distribution is the default model of random error:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\;e^{-(x-\mu)^2/2\sigma^2}$$

Everything about it is set by how many standard deviations you are from the centre, $z = (x - \mu)/\sigma$: about **68%** of readings fall within $\pm1\sigma$, **95%** within $\pm2\sigma$ and **99.7%** within $\pm3\sigma$. The tails fall off fast — but never reach zero.`,
  symbols: [
    { tex: 'f(x)', text: 'the probability density: the chance of a reading between $x$ and $x + dx$ is $f(x)\\,dx$' },
    { tex: t`\mu`, text: 'the mean: the centre of the distribution (the true value plus any bias)' },
    { tex: t`\sigma`, text: 'the standard deviation: the width. The inflection points sit at $\\mu \\pm \\sigma$' },
    { tex: 'z', text: 'the z-score $(x - \\mu)/\\sigma$: distance from the centre in standard deviations' },
  ],
  why: 'Coverage factors, p-values, “5σ discoveries” and redline logic all read probabilities off this one curve.',
  visual: {
    type: 'labx-stats',
    title: 'Coverage of ±kσ, and where the bell comes from',
    lead: t`Draws from a normal distribution with $\pm k\sigma$ shaded; the readout compares the exact coverage with the fraction of the sample inside. Then switch the distribution to rectangular and average draws: the bell appears on its own.`,
    tasks: [
      'Set k to 1, 2 and 3: about 68%, 95% and 99.7% — the sample agrees to within its own scatter.',
      'Set k = 1.96: exactly 95%, the coverage factor behind “95% confidence”.',
      'Choose rectangular, then each sample the mean of 2, 4, 16: flat becomes triangular becomes Gaussian.',
    ],
    params: { mode: 'hist', dist: 'normal', mu: 0, sigma: 1, a: 1.7, n: 10000, band: 1, controls: ['band', 'dist', 'm'], seed: 12, stats: false },
  },
  example: {
    prompt: t`A pressure sensor’s readings scatter normally about ${EX.mu.toFixed(2)} kPa with $\sigma = ${EX.sigma.toFixed(2)}$ kPa. An alarm trips above ${EX.lim.toFixed(2)} kPa. What fraction of readings trip it, and how many false alarms in 10 000 readings?`,
    visual: { ...normalPic({ tail: EX.z, two: false }), caption: t`The standard normal curve; the shaded tail beyond $z = ${EX.z}$ is the fraction of readings above the alarm level.` },
    steps: [
      { label: 'Standardize', text: t`$z = (${EX.lim.toFixed(2)} - ${EX.mu.toFixed(2)})/${EX.sigma.toFixed(2)} = ${EX.z.toFixed(1)}$: the alarm is ${EX.z} standard deviations above the mean.` },
      { label: 'One tail', text: t`Only readings **above** trip it, so you want one tail: $P(Z > ${EX.z}) = \tfrac12\,\text{erfc}(${EX.z}/\sqrt2) = ${EX.p.toFixed(5)}$, or ${(100 * EX.p).toFixed(2)}%.` },
      { label: 'Count', text: t`In 10 000 independent readings: $10\,000 \times ${EX.p.toFixed(5)} \approx ${Math.round(1e4 * EX.p)}$ false alarms.` },
      { label: 'Sense check', text: t`Within $\pm 2.5\sigma$ lies 98.76% of the distribution; half the remaining 1.24% is above, half below — 0.62%. ✓` },
    ],
    answer: t`About ${(100 * EX.p).toFixed(2)}% of readings — some ${Math.round(1e4 * EX.p)} false alarms per 10 000. A real alarm would require several consecutive readings above the limit.`,
  },
  practice: [
    num({
      id: 'within-k', difficulty: 1,
      gen(r) {
        const k = r.pick([0.5, 1.5, 2.5, 1.645, 0.674]);
        const p = 100 * M.within(k);
        return {
          prompt: t`What percentage of a normal distribution lies within $\pm${k}\sigma$ of its mean?`,
          visual: { ...normalPic({ k }), caption: t`The region within $\pm${k}\sigma$, shaded.` },
          answer: p, units: '%', tol: { rel: 0.003 },
          errors: [{ value: 100 * (1 - M.normalSf(k)), feedback: 'That is everything below +kσ, including the whole lower tail. Remove the lower tail too.' }],
          hints: [t`The coverage is $\text{erf}(k/\sqrt2)$.`, t`Or: one minus both tails, $1 - 2P(Z > ${k})$.`],
          teach: 'The fraction within ±kσ of a normal distribution is erf(k/√2).',
          explain: t`$\text{erf}(${k}/\sqrt2) = ${(p / 100).toFixed(4)}$, i.e. ${p.toFixed(1)}%.`,
        };
      },
    }),
    num({
      id: 'z-score', difficulty: 1,
      gen(r) {
        const mu = r.int(4800, 5200) / 10, sigma = r.int(8, 25) / 10, z = r.pick([-2.6, -1.8, 1.4, 2.2, 3.1]);
        const x = +(mu + z * sigma).toFixed(1);
        const zz = (x - mu) / sigma;
        return {
          prompt: t`Readings of a tuning fork’s frequency scatter normally about ${mu.toFixed(1)} Hz with $\sigma = ${sigma.toFixed(1)}$ Hz. One reading is ${x.toFixed(1)} Hz. What is its z-score (with its sign)?`,
          visual: { ...gaussX(mu, sigma, { x, label: `${x.toFixed(1)} Hz`, xlabel: 'frequency (Hz)' }), caption: 'The distribution of readings, and the one in question.' },
          answer: zz, tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: x - mu, feedback: 'That is the deviation in hertz. Divide by σ to express it in standard deviations.' }].filter((e) => Math.abs(e.value - zz) > 0.05 * Math.abs(zz)),
          hints: [t`$z = (x - \mu)/\sigma$.`],
          teach: 'A z-score measures a reading’s distance from the mean in standard deviations.',
          explain: t`$z = (${x.toFixed(1)} - ${mu.toFixed(1)})/${sigma.toFixed(1)} = ${zz.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'coverage-k', difficulty: 2,
      gen(r) {
        const p = r.pick([90, 99, 99.9, 80]);
        const k = M.normalQuantile(0.5 + p / 200);
        return {
          prompt: t`What coverage factor $k$ makes $\pm k\sigma$ contain ${p}% of a normal distribution?`,
          visual: { ...normalPic({}), caption: `The standard normal curve. Where must the two cuts go to enclose ${p}% of its area?` },
          answer: k, tol: { rel: 0.003 },
          errors: [{ value: M.normalQuantile(p / 100), feedback: `That leaves ${(100 - p).toFixed(1)}% in one tail. Split the excluded ${(100 - p).toFixed(1)}% between both tails.` }],
          hints: [t`Each tail holds $(100 - ${p})/2 = ${((100 - p) / 2).toFixed(2)}\%$.`, t`$k$ is the z with $\Phi(z) = ${(0.5 + p / 200).toFixed(4)}$.`],
          teach: 'A two-sided coverage p needs k = Φ⁻¹(½ + p/2), with half the excluded probability in each tail.',
          explain: t`$k = \Phi^{-1}(${(0.5 + p / 200).toFixed(4)}) = ${k.toFixed(3)}$.`,
        };
      },
    }),
    num({
      id: 'fwhm', difficulty: 2,
      gen(r) {
        const lam = r.pick([486.13, 656.28, 589.0, 632.8]), fw = r.int(8, 40) / 100;
        const sigma = fw / (2 * Math.sqrt(2 * Math.LN2));
        return {
          prompt: t`A spectral line centred at ${lam} nm has a Gaussian profile with full width at half maximum ${fw.toFixed(2)} nm. What is its standard deviation $\sigma$, in nm?`,
          visual: { ...gaussX(lam, sigma, { xlabel: 'wavelength (nm)', extra: { hlines: [{ y: +(0.5 / (sigma * Math.sqrt(2 * Math.PI))).toPrecision(4), color: 'gold', label: 'half maximum' }] } }), caption: 'A Gaussian line profile and its half-maximum level.' },
          answer: sigma, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: fw / 2, feedback: 'Half the FWHM is the half width at half maximum, 1.177σ, not σ.' }, { value: fw, feedback: 'The full width at half maximum is 2.355σ.' }],
          hints: [t`At $x = \mu \pm w$ the curve falls to half: $e^{-w^2/2\sigma^2} = \tfrac12$.`, t`So $w = \sigma\sqrt{2\ln 2}$ and FWHM $= 2\sqrt{2\ln2}\,\sigma \approx 2.355\sigma$.`],
          teach: 'For a Gaussian, FWHM = 2√(2 ln 2) σ ≈ 2.355σ.',
          explain: t`$\sigma = ${fw.toFixed(2)}/2.355 = ${sigma.toFixed(4)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'clt', difficulty: 2,
      prompt: 'Each reading of a voltage is disturbed by many small, independent effects, none of them Gaussian. Why is the total error usually close to normal?',
      visual: stat('hist', { dist: 'uniform', a: 1, m: 4, n: 5000, seed: 8, stats: false }, 'Each value is the mean of four draws from a flat distribution — already nearly Gaussian (violet).'),
      choices: [
        'A sum of many independent contributions tends to a normal distribution whatever their individual shapes (the central limit theorem)',
        'Instruments are designed to make their errors Gaussian',
        'Errors are normal only when there are more than 30 readings',
        'Each small effect is itself normal, so their sum must be',
      ],
      answer: 0,
      why: {
        1: 'No design does that; it is a mathematical consequence of adding many independent pieces.',
        2: 'The number of readings does not change the distribution each reading comes from.',
        3: 'The pieces need not be normal at all — that is the remarkable part.',
      },
      hints: ['Think of what happened to the flat distribution when draws were averaged.'],
      teach: 'Sums of many independent small errors are close to normal, whatever their individual shapes — the central limit theorem.',
      explain: 'The theorem needs many contributions, none dominating, and independence. When one source dominates (a coarse display, a single loose connection) the total takes that source’s shape instead.',
    }),
    num({
      id: 'outliers', difficulty: 3,
      gen(r) {
        const N = r.pick([500, 1000, 2000, 5000]), k = r.pick([3, 3.5]);
        const exp = N * (1 - M.within(k));
        return {
          prompt: t`A data set holds ${N} readings with normal errors. How many readings would you **expect** to lie more than ${k}σ from the mean, purely by chance?`,
          visual: { ...normalPic({ tail: k }), caption: t`Both tails beyond $\pm${k}\sigma$, shaded (tiny, but not zero).` },
          answer: exp, tol: { rel: 0.02 },
          errors: [{ value: exp / 2, feedback: 'That counts only one tail; readings can be far out on either side.' }],
          hints: [t`The fraction outside $\pm${k}\sigma$ is $1 - \text{erf}(${k}/\sqrt2)$.`, t`Multiply by $N = ${N}$.`],
          teach: 'In a large normal data set, a few readings beyond 3σ are expected; they are not evidence of a mistake by themselves.',
          explain: t`$${N} \times ${(1 - M.within(k)).toExponential(2).replace('e', '\\times 10^{') + '}'} = ${exp.toFixed(1)}$. Rejecting every point beyond ${k}σ would throw away honest data and shrink the apparent scatter.`,
        };
      },
    }),
    code({
      id: 'simulate', difficulty: 2,
      prompt: t`Check the 95% rule by simulation. With \`rng = np.random.default_rng(1)\`, draw 200 000 normal readings with mean 10 and standard deviation 2, set \`frac\` to the fraction within $\pm 2\sigma$ of 10, and print it.`,
      starter: t`import numpy as np

rng = np.random.default_rng(1)
x = None      # 200 000 readings, mean 10, sd 2
frac = None   # fraction with |x − 10| < 2 × 2
print(frac)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(1)
x = rng.normal(10, 2, size=200_000)
frac = np.mean(np.abs(x - 10) < 4)
print(frac)`,
      tests: [
        { name: '`x` holds 200 000 readings with sd near 2', code: 'len(x) == 200000 and abs(np.std(x) - 2) < 0.02' },
        { name: '`frac` is near 0.9545', code: 'abs(frac - 0.9545) < 0.003' },
        { name: 'the program prints frac', code: 'str(frac)[:5] in _stdout' },
      ],
      hints: ['`rng.normal(mean, sd, size=n)` draws the readings.', 'A boolean array’s mean is the fraction of True values: `np.mean(np.abs(x - 10) < 4)`.'],
      teach: 'A seeded simulation checks a probability statement: draw, count, compare.',
      explain: t`About 0.9545, matching $\text{erf}(2/\sqrt2) = 0.95450$. The simulation’s own error is about $\sqrt{0.95 \times 0.05/200\,000} \approx 0.0005$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-redline', difficulty: 3, transfer: true,
      gen(r) {
        const mu = r.pick([6.8, 6.9, 7.0]), sigma = r.pick([0.04, 0.05]), z = r.pick([3.5, 4]), lim = +(mu + z * sigma).toFixed(2);
        const zz = (lim - mu) / sigma, p = M.normalSf(zz), N = 100000;
        return {
          prompt: t`A combustion chamber’s pressure fluctuates normally about ${mu.toFixed(2)} MPa with $\sigma = ${sigma.toFixed(2)}$ MPa. The redline is ${lim.toFixed(2)} MPa. If a 100 s firing is sampled at 1 kHz and the samples were independent, how many samples would you expect above the redline from noise alone?`,
          visual: { ...gaussX(mu, sigma, { x: lim, label: 'redline', xlabel: 'chamber pressure (MPa)' }), caption: 'The distribution of pressure samples and the redline.' },
          answer: N * p, tol: { rel: 0.02 },
          errors: [{ value: N * 2 * p, feedback: 'Only the upper tail trips a redline.' }],
          hints: [t`$z = (${lim.toFixed(2)} - ${mu.toFixed(2)})/${sigma.toFixed(2)} = ${zz.toFixed(1)}$.`, t`Expected count $= 10^5 \times P(Z > ${zz.toFixed(1)})$.`],
          teach: 'With enough samples, even a several-σ tail is visited: expected count = N × tail probability.',
          explain: t`$P(Z > ${zz.toFixed(1)}) = ${sf(p, 3)}$; times $10^5$ gives ${(N * p).toFixed(1)}. That is why abort logic demands several consecutive samples over the line. Real samples 1 ms apart are correlated, which changes the count but not the lesson.`,
        };
      },
    }),
    num({
      id: 'cp-99', difficulty: 2,
      prompt: t`A calibration lab wants an interval that covers 99% of a normally distributed result. What coverage factor $k$ should it quote?`,
      visual: { ...normalPic({}), caption: 'The standard normal curve: 1% of its area is to be left outside, split between the tails.' },
      answer: M.normalQuantile(0.995), tol: { rel: 0.003 },
      errors: [{ value: M.normalQuantile(0.99), feedback: 'That puts all 1% in one tail. Two-sided coverage leaves 0.5% in each.' }, { value: 3, feedback: '±3σ covers 99.73%, a little more than asked.' }],
      hints: ['0.5% in each tail.', t`$k = \Phi^{-1}(0.995)$.`],
      teach: 'k = 2.576 gives 99% two-sided coverage for a normal distribution.',
      explain: t`$\Phi^{-1}(0.995) = 2.576$.`,
    }),
    num({
      id: 'cp-tolerance', difficulty: 2,
      gen(r) {
        const R = r.pick([100, 220, 470]), sigma = +(r.pick([0.4, 0.5, 0.6]) * R / 100).toPrecision(2), tol = R / 100;
        const k = tol / sigma, out = 100 * (1 - M.within(k));
        return {
          prompt: t`A batch of ${R} Ω resistors has values distributed normally about ${R} Ω with $\sigma = ${sf(sigma, 2)}\ \Omega$. What percentage fall outside the ±1% tolerance?`,
          visual: { ...gaussX(R, sigma, { xlabel: 'resistance (Ω)', extra: { vlines: [{ x: R - tol, color: 'warn' }, { x: R + tol, color: 'warn' }] } }), caption: 'The batch’s distribution and the ±1% tolerance limits.' },
          answer: out, units: '%', tol: { rel: 0.01 },
          errors: [{ value: out / 2, feedback: 'Count both tails: too high and too low are both out of tolerance.' }],
          hints: [t`±1% is $\pm ${tol}\ \Omega = \pm ${k.toFixed(2)}\sigma$.`, t`Outside fraction $= 1 - \text{erf}(${k.toFixed(2)}/\sqrt2)$.`],
          teach: 'Convert a tolerance to z, then the fraction outside is both tails beyond it.',
          explain: t`$k = ${tol}/${sf(sigma, 2)} = ${k.toFixed(2)}$; $1 - \text{erf}(${k.toFixed(2)}/\sqrt2) = ${(out / 100).toFixed(4)}$, about ${out.toFixed(1)}%.`,
        };
      },
    }),
  ],
  sources: [SRC.gum, SRC.taylor('ch. 5, 10'), SRC.numpy],
});
