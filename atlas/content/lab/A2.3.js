// Counting statistics: the Poisson distribution — counts of independent
// random events (decays, photons) scatter with σ = √N; rates and their
// uncertainties (√N/t, never √rate); background subtraction in quadrature;
// the Gaussian approximation and where it fails; the counts a target
// precision costs. A radiation detector with a background; a star's photons
// on a CCD as the transfer.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, stat, compare, SRC } from './_unc.js';

const t = String.raw;

const EX = { Ns: 400, Nb: 100, t: 100 };
EX.Rs = EX.Ns / EX.t; EX.Rb = EX.Nb / EX.t; EX.sRs = Math.sqrt(EX.Ns) / EX.t; EX.sRb = Math.sqrt(EX.Nb) / EX.t;
EX.R = EX.Rs - EX.Rb; EX.sR = Math.hypot(EX.sRs, EX.sRb);

const pois = (lam, extra = {}, caption) => stat('hist', { dist: 'poisson', lam, n: 2000, seed: Math.round(lam * 7) + 1, stats: false, xlabel: 'counts in the interval', ...extra }, caption);

export default lesson({
  id: 'lab.A2.3',
  title: 'Counting statistics: the Poisson distribution',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`A Geiger counter’s clicks, photons arriving at a detector, cosmic-ray muons: when events happen independently at a steady average rate, the number counted in a fixed time follows the **Poisson distribution**. If $\lambda$ counts are expected, the probability of counting exactly $k$ is

$$P(k) = \frac{\lambda^k e^{-\lambda}}{k!}, \qquad \sigma = \sqrt{\lambda}$$

So a single count $N$ carries its own uncertainty, $\sqrt N$ — no repeat measurements needed. Its **relative** uncertainty is $1/\sqrt N$: 100 counts are good to 10%, 10 000 to 1%. The $\sqrt{\ }$ belongs to the **count**, not to a rate computed from it.`,
  symbols: [
    { tex: 'k', text: 'a possible number of counts: 0, 1, 2, …' },
    { tex: t`\lambda`, text: 'the expected (mean) number of counts in the counting time — rate × time' },
    { tex: 'P(k)', text: 'the probability of exactly $k$ counts' },
    { tex: t`\sigma`, text: 'the standard deviation of the count, $\\sqrt\\lambda$, estimated as $\\sqrt N$ from an observed count $N$' },
  ],
  why: 'Nuclear and particle physics, X-ray and gamma spectroscopy, photon-counting astronomy and every particle detector live on √N — it sets how long you must count.',
  visual: {
    type: 'labx-stats',
    title: 'Counts from a steady source',
    lead: t`Two thousand counting intervals, each with $\lambda$ counts expected: the histogram of counts, the exact Poisson probabilities (violet dots) and, dashed, a Gaussian with the same mean and $\sigma = \sqrt\lambda$.`,
    tasks: [
      'At λ = 2 the distribution is lopsided and zero counts is common: the Gaussian is a poor fit.',
      'Raise λ to 30 and then 100: the shape turns symmetric and the Gaussian fits — but the width grows only as √λ.',
      'Compare the width with the mean: at λ = 100 the spread is ±10, a 10% uncertainty.',
    ],
    params: { mode: 'hist', dist: 'poisson', lam: 2, n: 2000, controls: ['lam'], gauss: true, seed: 14, stats: false, xlabel: 'counts in the interval' },
  },
  example: {
    prompt: t`A detector counts ${EX.Ns} counts in ${EX.t} s with a radioactive source in place, and ${EX.Nb} counts in ${EX.t} s with it removed (background). What is the source’s net count rate, with its uncertainty?`,
    visual: compare([{ v: EX.Rs, s: EX.sRs, label: 'source + background' }, { v: EX.Rb, s: EX.sRb, label: 'background', color: 'warn' }, { v: EX.R, s: EX.sR, label: 'net', color: 'good' }], { xlabel: 'count rate (counts per second)', caption: 'The three rates with ±1σ (solid) and ±2σ (dashed) bars. The net rate’s bar is wider than either count’s alone.' }),
    steps: [
      { label: 'Uncertainty of each count', text: t`$\sigma = \sqrt N$: $\sqrt{${EX.Ns}} = ${Math.sqrt(EX.Ns)}$ counts and $\sqrt{${EX.Nb}} = ${Math.sqrt(EX.Nb)}$ counts.` },
      { label: 'Convert to rates', text: t`Divide each count **and its uncertainty** by the time: $R_s = ${EX.Rs.toFixed(2)} \pm ${EX.sRs.toFixed(2)}\ \text{s}^{-1}$ and $R_b = ${EX.Rb.toFixed(2)} \pm ${EX.sRb.toFixed(2)}\ \text{s}^{-1}$.` },
      { label: 'Subtract', text: t`Net rate: $${EX.Rs.toFixed(2)} - ${EX.Rb.toFixed(2)} = ${EX.R.toFixed(2)}\ \text{s}^{-1}$.` },
      { label: 'Combine', text: t`The two counts are independent, so their uncertainties add in quadrature — even though the rates are subtracted: $\sqrt{${EX.sRs.toFixed(2)}^2 + ${EX.sRb.toFixed(2)}^2} = ${EX.sR.toFixed(3)}\ \text{s}^{-1}$.` },
      { label: 'Sense check', text: t`The background’s fluctuations make the net rate less certain than the gross one (${EX.sR.toFixed(3)} against ${EX.sRs.toFixed(2)}): subtracting a background never removes its noise.` },
    ],
    answer: t`$R = ${EX.R.toFixed(2)} \pm ${EX.sR.toFixed(2)}\ \text{s}^{-1}$ (a ${(100 * EX.sR / EX.R).toFixed(1)}% uncertainty).`,
  },
  practice: [
    num({
      id: 'rel-unc', difficulty: 1,
      gen(r) {
        const N = r.pick([25, 64, 400, 900, 2500]);
        return {
          prompt: t`A counter records ${N} counts. What is the relative uncertainty of this count, as a percentage?`,
          visual: pois(N, {}, `Counts in many repeats of the same interval, with ${N} expected: this is the scatter a single count carries.`),
          answer: 100 / Math.sqrt(N), units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(N), feedback: t`That is the absolute uncertainty, $\sqrt N$ counts. Divide by $N$ for the relative one.` }],
          hints: [t`$\sigma = \sqrt{N}$; relative $= \sqrt N/N = 1/\sqrt N$.`],
          teach: 'A count of N has relative uncertainty 1/√N.',
          explain: t`$1/\sqrt{${N}} = ${(1 / Math.sqrt(N)).toFixed(3)}$, or ${(100 / Math.sqrt(N)).toFixed(1)}%.`,
        };
      },
    }),
    num({
      id: 'p-zero', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.5, 1.2, 2.3, 3.0]), k = r.pick([0, 1, 2]);
        const p = M.poissonPmf(k, lam);
        return {
          prompt: t`A weak source gives on average ${lam} counts per second. What is the probability of exactly ${k} count${k === 1 ? '' : 's'} in a given second?`,
          visual: pois(lam, { xr: [-0.5, 9.5] }, `Counts per second when ${lam} are expected.`),
          answer: p, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(-lam), feedback: t`That is $P(0)$. For $k = ${k}$ include $\lambda^k/k!$.` }].filter((e) => Math.abs(e.value - p) > 0.01 * p),
          hints: [t`$P(${k}) = \lambda^{${k}}e^{-\lambda}/${k}!$ with $\lambda = ${lam}$.`, t`$e^{-${lam}} = ${Math.exp(-lam).toFixed(4)}$.`],
          teach: 'P(k) = λᵏe^(−λ)/k! gives the probability of exactly k counts when λ are expected.',
          explain: t`$P(${k}) = ${lam}^{${k}} e^{-${lam}}/${k}! = ${p.toFixed(4)}$.`,
        };
      },
    }),
    num({
      id: 'rate-unc', difficulty: 2,
      gen(r) {
        const N = r.pick([144, 225, 400, 900]), T = r.pick([30, 60, 120, 300]);
        const s = Math.sqrt(N) / T, R = N / T;
        return {
          prompt: t`${N} counts are recorded in ${T} s. What is the standard uncertainty of the count rate, in counts per second?`,
          visual: pois(N, {}, `Repeats of the ${T} s count would scatter like this, by about ${Math.sqrt(N)} counts.`),
          answer: s, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(R), feedback: t`$\sqrt{\text{rate}}$ has no meaning: the rate’s value depends on the time unit, but the counts do not. Take $\sqrt N$ of the count, then divide by the time.` }, { value: Math.sqrt(N), feedback: 'That is the uncertainty of the count. Divide it by the counting time.' }].filter((e) => Math.abs(e.value - s) > 0.02 * s),
          hints: [t`First the count’s uncertainty: $\sqrt{${N}} = ${Math.sqrt(N)}$.`, 'Then divide by the counting time, as you did for the rate itself.'],
          teach: 'The uncertainty of a rate N/t is √N/t: the square root belongs to the count.',
          explain: t`$\sigma_R = \sqrt{${N}}/${T} = ${s.toFixed(3)}\ \text{s}^{-1}$, on a rate of $${R.toFixed(2)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    num({
      id: 'net', difficulty: 2,
      gen(r) {
        const Ns = r.int(300, 900), Nb = r.int(60, 250), T = r.pick([100, 200]);
        const sR = Math.hypot(Math.sqrt(Ns), Math.sqrt(Nb)) / T;
        return {
          prompt: t`In ${T} s each, a detector counts ${Ns} with a sample in place and ${Nb} without it. What is the standard uncertainty of the sample’s net count rate, in counts per second?`,
          visual: compare([{ v: Ns / T, s: Math.sqrt(Ns) / T, label: 'sample + background' }, { v: Nb / T, s: Math.sqrt(Nb) / T, label: 'background', color: 'warn' }], { xlabel: 'count rate (s⁻¹)', caption: 'The two measured rates, each with its ±1σ and ±2σ bars.' }),
          answer: sR, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(Ns - Nb) / T, feedback: t`$\sqrt{N_s - N_b}$ ignores that both counts fluctuate. Combine $\sqrt{N_s}$ and $\sqrt{N_b}$ in quadrature.` }, { value: (Math.sqrt(Ns) - Math.sqrt(Nb)) / T, feedback: 'Uncertainties never subtract: independent ones add in quadrature, even for a difference.' }],
          hints: [t`$\sigma_{\text{net}} = \sqrt{N_s + N_b}/t$ when both are counted for the same time.`],
          teach: t`For a background-subtracted rate, the counts’ variances add: $\sigma = \sqrt{N_s + N_b}/t$.`,
          explain: t`$\sqrt{${Ns} + ${Nb}}/${T} = ${sR.toFixed(3)}\ \text{s}^{-1}$, on a net rate of $${((Ns - Nb) / T).toFixed(2)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    mcq({
      id: 'gauss-approx', difficulty: 2,
      prompt: t`You expect $\lambda = 3$ counts per interval and want the probability of 7 or more. A classmate uses the normal distribution with $\mu = 3$, $\sigma = \sqrt3$. What is wrong?`,
      visual: pois(3, { gauss: true, xr: [-0.5, 11.5], n: 5000 }, 'Poisson probabilities at λ = 3 (violet dots) against the Gaussian with the same mean and σ (dashed).'),
      choices: [
        'At small λ the Poisson distribution is skewed, with a longer upper tail than the Gaussian, so the normal approximation underestimates P(≥ 7)',
        'Nothing: counts are always Gaussian',
        'σ should be 3, not √3',
        'The Gaussian overestimates the tail because counts cannot be negative',
      ],
      answer: 0,
      why: {
        1: 'Only for large λ (tens or more) does the Poisson shape approach a Gaussian.',
        2: 'For a Poisson count the variance equals the mean, so σ = √λ = √3.',
        3: 'The Gaussian puts probability below zero, but that is the lower tail; at 7 it is the upper tail the Gaussian underestimates.',
      },
      hints: ['Look at the picture’s right-hand side: which curve is higher at 7?'],
      teach: 'At small λ use the exact Poisson probabilities: the Gaussian approximation fails in the tails.',
      explain: t`Exactly, $P(\ge 7) = 1 - P(\le 6) = ${(1 - M.poissonCdf(6, 3)).toFixed(4)}$. The Gaussian (with a continuity correction, $z = (6.5 - 3)/\sqrt3 = 2.02$) gives ${M.normalSf(3.5 / Math.sqrt(3)).toFixed(4)} — about ${((1 - M.poissonCdf(6, 3)) / M.normalSf(3.5 / Math.sqrt(3))).toFixed(1)} times too small.`,
    }),
    num({
      id: 'count-time', difficulty: 2,
      gen(r) {
        const eps = r.pick([0.5, 1, 2]), R = r.pick([12, 25, 40, 80]);
        const N = 1 / (eps / 100) ** 2, T = N / R;
        return {
          prompt: t`A source gives about ${R} counts per second (negligible background). How long must you count for a ${eps}% uncertainty, in seconds?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 6], xlog: true, y: [0, 35], xlabel: 'counts N', ylabel: 'relative uncertainty (%)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: '100/sqrt(10^x)', domain: [1, 6], color: 'accent' }], hlines: [{ y: eps, color: 'gold', label: `${eps}%` }] }, caption: 'Relative uncertainty 1/√N against the number of counts (log scale).' },
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: N, feedback: 'That is the number of counts needed. Divide by the rate to get the time.' }, { value: 100 / eps / R, feedback: t`The uncertainty is $1/\sqrt N$, so $N = 1/\varepsilon^2$, not $1/\varepsilon$.` }],
          hints: [t`$1/\sqrt N = ${eps / 100}$ gives $N = ${N}$.`, t`$t = N/R$.`],
          teach: 'A relative precision ε needs N = 1/ε² counts — and counting time grows as 1/ε².',
          explain: t`$N = 1/${eps / 100}^2 = ${N}$ counts, so $t = ${N}/${R} = ${sf(T, 3)}$ s.`,
        };
      },
    }),
    code({
      id: 'variance', difficulty: 2,
      prompt: t`Simulate 50 000 one-second counts from a source with $\lambda = 6.5$ using \`rng = np.random.default_rng(3)\` and \`rng.poisson\`. Set \`ratio\` to the sample variance (\`ddof=1\`) divided by the sample mean, and print it.`,
      starter: t`import numpy as np

rng = np.random.default_rng(3)
counts = None
ratio = None
print(ratio)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(3)
counts = rng.poisson(6.5, size=50_000)
ratio = np.var(counts, ddof=1) / np.mean(counts)
print(ratio)`,
      tests: [
        { name: '`counts` holds 50 000 integers with mean near 6.5', code: 'len(counts) == 50000 and abs(np.mean(counts) - 6.5) < 0.05' },
        { name: 'variance ÷ mean is near 1', code: 'abs(ratio - 1) < 0.03' },
        { name: 'the program prints ratio', code: 'str(ratio)[:4] in _stdout' },
      ],
      hints: ['`rng.poisson(6.5, size=50_000)` draws the counts.', '`np.var(counts, ddof=1) / np.mean(counts)`.'],
      teach: 'For Poisson counts the variance equals the mean — the source of √N.',
      explain: 'The ratio comes out within about 1% of 1. A ratio well above 1 in real data means extra fluctuations (a drifting source, electronic noise); well below 1, dead time or counting losses.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-star', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([150, 250, 400, 800]), snr = r.pick([50, 100, 200]);
        const N = snr * snr, T = N / R;
        return {
          prompt: t`A star delivers ${R} photons per second to a CCD pixel group. Counting only the star’s photon noise (no sky, dark current or read noise), how long an exposure gives a signal-to-noise ratio of ${snr}, in seconds?`,
          visual: pois(Math.min(N / 50, 400), {}, 'Photon counts scatter as a Poisson distribution: the signal is N, the noise √N.'),
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: snr / R, feedback: t`Signal-to-noise is $N/\sqrt N = \sqrt N$, so it needs $N = ${snr}^2$ photons.` }],
          hints: [t`$\text{SNR} = N/\sqrt N = \sqrt N$.`, t`$N = ${snr}^2$, then $t = N/R$.`],
          teach: 'For photon-noise-limited counting, SNR = √N: doubling the SNR costs four times the exposure.',
          explain: t`$N = ${N}$ photons; $t = ${N}/${R} = ${sf(T, 3)}$ s. Real observations add sky background, dark current and read noise, so they need longer — this is the ideal limit.`,
        };
      },
    }),
    num({
      id: 'cp-excess', difficulty: 3,
      gen(r) {
        const B = r.pick([1.0, 2.0, 0.5]), T = r.pick([100, 200]), mu = B * T, ex = r.pick([2, 3, 4]);
        const N = Math.round(mu + ex * Math.sqrt(mu));
        const z = (N - mu) / Math.sqrt(mu);
        return {
          prompt: t`The background rate is well known: $${B.toFixed(1)}\ \text{s}^{-1}$. Counting a suspect sample for ${T} s gives ${N} counts. By how many standard deviations does this exceed the background expectation?`,
          visual: pois(mu, {}, `Counts expected in ${T} s from background alone.`),
          answer: z, tol: { rel: 0.01 },
          errors: [{ value: (N - mu) / Math.sqrt(N), feedback: 'Under the hypothesis “background only”, the spread is √(expected) = √(rate × time), not √(observed).' }].filter((e) => Math.abs(e.value - z) > 0.02 * z),
          hints: [t`Expected from background: $${B.toFixed(1)} \times ${T} = ${mu}$ counts, with $\sigma = \sqrt{${mu}}$.`, t`$z = (${N} - ${mu})/\sqrt{${mu}}$.`],
          teach: 'An excess over a known background is judged by (N − λ)/√λ.',
          explain: t`$z = (${N} - ${mu})/${Math.sqrt(mu).toFixed(2)} = ${z.toFixed(2)}$. Whether that counts as evidence is the question of [the p-value lesson](#/lesson/lab.A4.2).`,
        };
      },
    }),
    mcq({
      id: 'cp-sqrt-rate', difficulty: 2, kind: 'error',
      prompt: t`A report reads: “Count rate $4.0\ \text{s}^{-1}$, so by Poisson statistics the uncertainty is $\sqrt{4.0} = 2.0\ \text{s}^{-1}$.” The rate came from 1200 counts in 300 s. What is the correct uncertainty?`,
      visual: pois(1200, {}, 'The scatter of 1200-count measurements: about ±35 counts.'),
      choices: [t`$\sqrt{1200}/300 = 0.12\ \text{s}^{-1}$`, t`$2.0\ \text{s}^{-1}$, as reported`, t`$\sqrt{4.0/300} = 0.12\ \text{s}^{-1}$ by a different route, so the method does not matter`, t`$\sqrt{1200} = 35\ \text{s}^{-1}$`],
      answer: 0,
      why: {
        1: 'In counts per minute the same rate is 240 min⁻¹ and “√rate” would give 15.5 min⁻¹ = 0.26 s⁻¹: an answer that changes with the unit is meaningless.',
        2: 'It gives the same number here only because √(R/t) = √N/t. Write it from the count, so the logic is visible and the units come out.',
        3: '√1200 ≈ 35 is the uncertainty of the count, in counts, not of the rate.',
      },
      hints: ['Which quantity is Poisson distributed: the count or the rate?'],
      teach: 'Apply √N to the number of counts, then convert to a rate.',
      explain: t`$\sigma_N = \sqrt{1200} = 34.6$ counts, so $\sigma_R = 34.6/300 = 0.12\ \text{s}^{-1}$ — a 2.9% uncertainty, not 50%.`,
    }),
  ],
  sources: [SRC.taylor('ch. 11'), SRC.gum, SRC.numpy],
});
