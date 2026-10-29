// Weighted means — combining independent results by inverse-variance
// weights, the uncertainty of the combination, and the χ² / Birge-ratio test
// that must come first: are the results consistent at all? Five modern
// measurements of G (and CODATA's expansion factor of 3.9), and the Hubble
// constant, where the most precise results disagree by about 5σ and no
// average is honest.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { M, compare, SRC } from './_unc.js';

const t = String.raw;

// five measurements of G (×10⁻¹¹ m³ kg⁻¹ s⁻²), as listed in the CODATA 2018 and 2022 adjustments
const GDATA = [
  { lab: 'HUST, time of swing (2018)', v: 6.674184, s: 0.000078 },
  { lab: 'HUST, angular acceleration (2018)', v: 6.674484, s: 0.000078 },
  { lab: 'UC Irvine (2014)', v: 6.67435, s: 0.00013 },
  { lab: 'BIPM (2014)', v: 6.67554, s: 0.00016 },
  { lab: 'LENS, atom interferometry (2014)', v: 6.67191, s: 0.00099 },
];
const GW = M.weightedMean(GDATA.map((q) => q.v), GDATA.map((q) => q.s));
const H0 = [
  { lab: 'Planck 2018 (CMB + ΛCDM)', v: 67.4, s: 0.5 },
  { lab: 'SH0ES 2022 (Cepheids + SNe Ia)', v: 73.04, s: 1.04 },
  { lab: 'CCHP 2021 (TRGB + SNe Ia)', v: 69.8, s: 1.7 },
];
const zPS = M.zscore(H0[0].v, H0[0].s, H0[1].v, H0[1].s);

const SRC_G = { label: 'E. Tiesinga et al., CODATA recommended values of the fundamental physical constants: 2018, Rev. Mod. Phys. 93, 025010 (2021) — the G input data and the expansion factor 3.9', url: 'https://physics.nist.gov/cuu/pdf/RevModPhys.93.025010.pdf' };
const SRC_LI = { label: 'Q. Li et al., “Measurements of the gravitational constant using two independent methods”, Nature 560, 582 (2018)', url: 'https://www.nature.com/articles/s41586-018-0431-5' };
const SRC_PL = { label: 'Planck Collaboration, Planck 2018 results VI: Cosmological parameters, A&A 641, A6 (2020)', url: 'https://arxiv.org/abs/1807.06209' };
const SRC_SH = { label: 'A. G. Riess et al., “A Comprehensive Measurement of the Local Value of the Hubble Constant with 1 km/s/Mpc Uncertainty”, ApJL 934, L7 (2022)', url: 'https://arxiv.org/abs/2112.04510' };
const SRC_FR = { label: 'W. L. Freedman, “Measurements of the Hubble Constant: Tensions in Perspective”, ApJ 919, 16 (2021)', url: 'https://arxiv.org/abs/2106.15656' };

const wexplore = {
  type: 'graph',
  params: {
    aspect: 'wide', x: [7, 15], y: [0.2, 4.2], xlabel: 'result (any unit)', ylabel: ' ', yticks: 0, xticks: 8, axesAt: 'edge',
    sliders: [
      { key: 'x3', label: 'Third result $x_3$', min: 8, max: 14, step: 0.1, value: 10.4, unit: '', explain: 'Move the third measurement.' },
      { key: 's3', label: 'Its uncertainty $\\sigma_3$', min: 0.1, max: 2, step: 0.05, value: 0.6, unit: '', explain: 'A smaller uncertainty gives it a larger weight, $1/\\sigma_3^2$.' },
    ],
    curves: [
      { param: ['10 - 0.5 + t', '4'], t: [0, 1], color: 'accent', width: 3.5 },
      { param: ['10.8 - 0.4 + 0.8*t', '3'], t: [0, 1], color: 'accent', width: 3.5 },
      { param: ['x3 - s3 + 2*s3*t', '2'], t: [0, 1], color: 'violet', width: 3.5 },
      { param: ['(10/0.25 + 10.8/0.16 + x3/s3^2)/(4 + 6.25 + 1/s3^2) - 1/sqrt(4 + 6.25 + 1/s3^2) + 2*t/sqrt(4 + 6.25 + 1/s3^2)', '0.9'], t: [0, 1], color: 'gold', width: 5 },
    ],
    points: [
      { x: 10, y: 4, color: 'accent', label: '10.0 ± 0.5', labelDy: -14 },
      { x: 10.8, y: 3, color: 'accent', label: '10.8 ± 0.4', labelDy: -14 },
      { x: 'x3', y: 2, color: 'violet', label: 'result 3', labelDy: -14 },
      { x: '(10/0.25 + 10.8/0.16 + x3/s3^2)/(4 + 6.25 + 1/s3^2)', y: 0.9, color: 'gold', label: 'weighted mean', labelDy: -14 },
    ],
    readouts: [
      { label: t`$\bar x_w$`, expr: '(10/0.25 + 10.8/0.16 + x3/s3^2)/(4 + 6.25 + 1/s3^2)', digits: 4 },
      { label: t`$\sigma_w$`, expr: '1/sqrt(4 + 6.25 + 1/s3^2)', digits: 3 },
      { label: t`$\chi^2$ (2 dof)`, expr: '((10 - (10/0.25 + 10.8/0.16 + x3/s3^2)/(4 + 6.25 + 1/s3^2))/0.5)^2 + ((10.8 - (10/0.25 + 10.8/0.16 + x3/s3^2)/(4 + 6.25 + 1/s3^2))/0.4)^2 + ((x3 - (10/0.25 + 10.8/0.16 + x3/s3^2)/(4 + 6.25 + 1/s3^2))/s3)^2', digits: 3 },
    ],
  },
  caption: 'Three independent results with ±1σ bars and their inverse-variance weighted mean (gold, with its ±1σ). The χ² readout tests whether the three are consistent; with 2 degrees of freedom, values above about 6 have p < 0.05.',
};

export default lesson({
  id: 'lab.A4.3',
  title: 'Weighted means',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`When several independent results measure the same quantity, combine them by weighting each with the inverse of its variance — a result twice as precise counts four times as much:

$$\bar x_w = \frac{\sum_i x_i/\sigma_i^2}{\sum_i 1/\sigma_i^2}, \qquad \sigma_{\bar x_w} = \Bigl(\sum_i \frac{1}{\sigma_i^2}\Bigr)^{-1/2}$$

But first ask whether they **can** be combined. If the results scatter more than their uncertainties allow, $\chi^2 = \sum_i \bigl((x_i - \bar x_w)/\sigma_i\bigr)^2$ comes out far above $N - 1$ and the formula’s small $\sigma_{\bar x_w}$ is a fiction. The **Birge ratio** $R_B = \sqrt{\chi^2/(N-1)}$ measures by how much. An average of inconsistent results describes none of them.`,
  symbols: [
    { tex: 'x_i', text: 'the $i$-th of $N$ independent results' },
    { tex: t`\sigma_i`, text: 'its standard uncertainty; its weight is $1/\\sigma_i^2$' },
    { tex: t`\bar x_w`, text: 'the inverse-variance weighted mean: the best combination if the results are consistent and their errors Gaussian' },
    { tex: t`\sigma_{\bar x_w}`, text: 'its standard uncertainty — always smaller than the smallest $\\sigma_i$' },
    { tex: 'R_B', text: 'the Birge ratio $\\sqrt{\\chi^2/(N-1)}$: about 1 for consistent results; well above 1 means the uncertainties do not explain the scatter' },
  ],
  why: 'Every recommended value of a fundamental constant, every world average in particle physics, and every “combined” cosmological parameter is a weighted mean — or a decision that the inputs are too inconsistent for one.',
  visual: {
    ...wexplore,
    title: 'Weights, and the consistency check',
    lead: t`Two fixed results and a third you can move. The gold bar is the weighted mean with its uncertainty. Notice how strongly a precise result pulls the mean — and what $\chi^2$ says when it pulls the mean somewhere the others disagree with.`,
    tasks: [
      'Set σ₃ to 0.1: the third result takes almost all the weight and the mean jumps to it.',
      'With σ₃ = 0.1, move x₃ to 12: the mean follows it, its ±σ stays tiny — and χ² explodes. The small σ is a fiction.',
      'Set σ₃ to 2: the third result barely matters wherever it sits.',
    ],
  },
  example: {
    prompt: t`Five modern measurements of Newton’s constant $G$, in units of $10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$: ${GDATA.map((q) => `${q.v} ± ${q.s} (${q.lab})`).join('; ')}. Combine them, and say whether you should.`,
    visual: compare(GDATA.map((q, i) => ({ v: q.v, s: q.s, label: q.lab.replace(/ \(.*\)/, ''), color: ['accent', 'accent', 'violet', 'warn', 'teal'][i] })), { xlabel: 'G (×10⁻¹¹ m³ kg⁻¹ s⁻²)', xr: [6.6715, 6.6762], caption: 'Each result with ±1σ (solid) and ±2σ (dashed) bars. Several bars do not come near each other.' }),
    steps: [
      { label: 'Weights', text: t`$w_i = 1/\sigma_i^2$. The two HUST results carry ${(100 * GW.weights[0]).toFixed(0)}% of the weight each; the atom-interferometry result only ${(100 * GW.weights[4]).toFixed(1)}%.` },
      { label: 'Weighted mean', text: t`$\bar G_w = ${GW.mean.toFixed(6)}$, with $\sigma_w = (\sum w_i)^{-1/2} = ${GW.sigma.toFixed(6)}$ — a relative uncertainty of ${(1e6 * GW.sigma / GW.mean).toFixed(1)} ppm.` },
      { label: 'Consistency', text: t`$\chi^2 = ${GW.chi2.toFixed(1)}$ for $N - 1 = 4$ degrees of freedom: $p \approx ${tex(M.chi2Sf(GW.chi2, 4), 1)}$. The two HUST results alone differ by $${M.zscore(GDATA[0].v, GDATA[0].s, GDATA[1].v, GDATA[1].s).toFixed(1)}\sigma$, and the BIPM result sits $${M.zscore(GDATA[3].v, GDATA[3].s, GW.mean, 0).toFixed(1)}\sigma$ above the mean.` },
      { label: 'Birge ratio', text: t`$R_B = \sqrt{${GW.chi2.toFixed(1)}/4} = ${GW.birge.toFixed(1)}$: the results scatter about four times more than their uncertainties allow. Some experiments have unrecognized systematic errors — nobody yet knows which.` },
      { label: 'What CODATA does', text: t`For the 2018 recommended value, CODATA combined all 16 measurements and multiplied every input uncertainty by an **expansion factor of 3.9**, giving $G = 6.674\,30(15)$ — an honest 22 ppm instead of a falsely precise 7 ppm. Scaling our five by $R_B$ gives $\pm ${(GW.sigma * GW.birge).toFixed(5)}$, the same idea.` },
    ],
    answer: t`$\bar G_w = ${GW.mean.toFixed(6)} \pm ${GW.sigma.toFixed(6)}$ formally, but $R_B = ${GW.birge.toFixed(1)}$: the inputs are inconsistent, and an honest combination must inflate the uncertainty (to about $\pm ${(GW.sigma * GW.birge).toFixed(5)}$) or find the systematics.`,
  },
  practice: [
    num({
      id: 'wm-two', difficulty: 1,
      gen(r) {
        const a = r.int(950, 1000) / 100, sa = r.pick([0.1, 0.2]), b = +(a + r.int(5, 30) / 100).toFixed(2), sb = r.pick([0.2, 0.3, 0.4]);
        const w = M.weightedMean([a, b], [sa, sb]);
        return {
          prompt: t`Combine $${a.toFixed(2)} \pm ${sa}$ and $${b.toFixed(2)} \pm ${sb}$ (independent, consistent) into a weighted mean.`,
          visual: compare([{ v: a, s: sa, label: 'first' }, { v: b, s: sb, label: 'second', color: 'violet' }], { xlabel: 'result' }),
          answer: w.mean, tol: { rel: 0, abs: 0.003 },
          errors: [{ value: (a + b) / 2, feedback: 'That is the plain average. The more precise result should count more: weight each by 1/σ².' }, { value: (a / sa + b / sb) / (1 / sa + 1 / sb), feedback: 'Weights are 1/σ², not 1/σ.' }].filter((e) => Math.abs(e.value - w.mean) > 0.004),
          hints: [t`$w_1 = 1/${sa}^2 = ${(1 / sa ** 2).toFixed(1)}$, $w_2 = 1/${sb}^2 = ${(1 / sb ** 2).toFixed(2)}$.`, t`$\bar x_w = (w_1 x_1 + w_2 x_2)/(w_1 + w_2)$.`],
          teach: 'Weight each result by 1/σ²: the combination leans toward the more precise one.',
          explain: t`$\bar x_w = ${w.mean.toFixed(3)}$, with $\sigma_w = ${w.sigma.toFixed(3)}$ — closer to $${a.toFixed(2)}$, the more precise result.`,
        };
      },
    }),
    num({
      id: 'wm-sigma', difficulty: 2,
      gen(r) {
        const s = [r.pick([0.2, 0.3]), r.pick([0.4, 0.5]), r.pick([0.6, 0.8])];
        const sw = 1 / Math.sqrt(s.reduce((q, x) => q + 1 / x ** 2, 0));
        return {
          prompt: t`Three consistent results have uncertainties ${s.join(', ')}. What is the uncertainty of their weighted mean?`,
          visual: compare([{ v: 5.0, s: s[0], label: 'first' }, { v: 5.1, s: s[1], label: 'second', color: 'violet' }, { v: 4.85, s: s[2], label: 'third', color: 'teal' }], { xlabel: 'result' }),
          answer: sw, tol: { rel: 0.01 },
          errors: [{ value: s.reduce((a, b) => a + b) / 3 / Math.sqrt(3), feedback: 'σ/√N applies to equal uncertainties. In general, add the weights 1/σᵢ² and take the inverse square root.' }, { value: Math.min(...s), feedback: 'The combination is more precise than its best input, not equal to it.' }],
          hints: [t`$\sum 1/\sigma_i^2 = ${s.map((x) => (1 / x ** 2).toFixed(2)).join(' + ')}$.`, t`$\sigma_w = 1/\sqrt{\sum 1/\sigma_i^2}$.`],
          teach: t`The weights add: $\sigma_w = \bigl(\sum 1/\sigma_i^2\bigr)^{-1/2}$, always below the smallest $\sigma_i$.`,
          explain: t`$\sum 1/\sigma_i^2 = ${s.reduce((q, x) => q + 1 / x ** 2, 0).toFixed(2)}$, so $\sigma_w = ${sw.toFixed(3)}$.`,
        };
      },
    }),
    num({
      id: 'weight-share', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]);
        const share = (100 * k * k) / (k * k + 1);
        return {
          prompt: t`Two consistent results are combined; the first is ${k} times more precise than the second ($\sigma_2 = ${k}\sigma_1$). What percentage of the total weight does the first carry?`,
          visual: compare([{ v: 3.0, s: 0.1, label: 'first' }, { v: 3.1, s: 0.1 * k, label: 'second', color: 'violet' }], { xlabel: 'result' }),
          answer: share, units: '%', tol: { rel: 0.005 },
          errors: [{ value: (100 * k) / (k + 1), feedback: 'Weights go as 1/σ², so a factor of k in σ is a factor of k² in weight.' }],
          hints: [t`$w_1/w_2 = (\sigma_2/\sigma_1)^2 = ${k * k}$.`],
          teach: 'Weight scales as 1/σ²: a result k times more precise counts k² times as much.',
          explain: t`$w_1 : w_2 = ${k * k} : 1$, so the first carries $${k * k}/${k * k + 1} = ${share.toFixed(1)}\%$.`,
        };
      },
    }),
    num({
      id: 'birge', difficulty: 2,
      gen(r) {
        const N = r.pick([4, 5, 6, 8]), chi = r.pick([2.1, 3.5, 5.2]) * (N - 1);
        const R = Math.sqrt(chi / (N - 1));
        return {
          prompt: t`${N} results combine with $\chi^2 = ${chi.toFixed(1)}$ about their weighted mean. What is the Birge ratio?`,
          visual: { ...stat_tail(chi, N - 1), caption: `The χ² distribution for ${N - 1} degrees of freedom and the observed value.` },
          answer: R, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(chi / N), feedback: 'Divide by N − 1: fitting the mean used up one degree of freedom.' }, { value: chi / (N - 1), feedback: 'That is χ²/ν. The Birge ratio is its square root, so it scales the uncertainties.' }],
          hints: [t`$R_B = \sqrt{\chi^2/(N - 1)}$.`],
          teach: 'The Birge ratio √(χ²/(N−1)) says how much more the results scatter than their uncertainties allow.',
          explain: t`$R_B = \sqrt{${chi.toFixed(1)}/${N - 1}} = ${R.toFixed(2)}$. ${R > 1.5 ? 'Well above 1: the inputs are inconsistent; find the cause, or at least inflate the uncertainty by this factor.' : t`Somewhat above 1, with $p = ${M.chi2Sf(chi, N - 1).toFixed(2)}$ for ${N - 1} degrees of freedom: ${M.chi2Sf(chi, N - 1) < 0.05 ? 'a borderline inconsistency worth investigating before combining' : 'within what chance allows, though worth a look'}.`}`,
        };
      },
    }),
    code({
      id: 'wm-code', difficulty: 2,
      prompt: t`Write the combination for any set of results. Given arrays \`x\` and \`s\` (the five G measurements), set \`mean\`, \`sigma\`, \`chi2\` and \`birge\`, and print them.`,
      starter: t`import numpy as np

x = np.array([6.674184, 6.674484, 6.67435, 6.67554, 6.67191])   # ×1e-11
s = np.array([0.000078, 0.000078, 0.00013, 0.00016, 0.00099])

w = None
mean = sigma = chi2 = birge = None
print(mean, sigma, chi2, birge)
`,
      answer: t`import numpy as np

x = np.array([6.674184, 6.674484, 6.67435, 6.67554, 6.67191])   # ×1e-11
s = np.array([0.000078, 0.000078, 0.00013, 0.00016, 0.00099])

w = 1 / s**2
mean = np.sum(w * x) / np.sum(w)
sigma = 1 / np.sqrt(np.sum(w))
chi2 = np.sum(((x - mean) / s)**2)
birge = np.sqrt(chi2 / (len(x) - 1))
print(mean, sigma, chi2, birge)`,
      tests: [
        { name: '`mean` is the inverse-variance weighted mean', code: `abs(mean - ${GW.mean}) < 1e-9` },
        { name: '`sigma` is (Σ 1/s²)^(−½)', code: `abs(sigma - ${GW.sigma}) < 1e-12` },
        { name: '`chi2` is about 65', code: `abs(chi2 - ${GW.chi2}) < 1e-6` },
        { name: '`birge` is √(χ²/(N − 1)), about 4', code: `abs(birge - ${GW.birge}) < 1e-8` },
      ],
      hints: ['`w = 1 / s**2`; then `np.sum(w * x) / np.sum(w)`.', '`chi2` sums the squared normalized deviations from the weighted mean; divide by N − 1 = 4 before the square root.'],
      teach: 'A weighted mean is not finished until its χ² has been checked.',
      explain: t`The mean is $${GW.mean.toFixed(6)}$, $\sigma = ${GW.sigma.toFixed(6)}$, $\chi^2 = ${GW.chi2.toFixed(1)}$, $R_B = ${GW.birge.toFixed(2)}$: inconsistent inputs — the state of the art for $G$.`,
    }),
    mcq({
      id: 'inflate', difficulty: 3,
      prompt: t`Results combine with a Birge ratio of 2.5, and no one can find the cause. The Particle Data Group’s practice is to multiply the uncertainty of the average by such a scale factor. What does that fix, and what not?`,
      visual: compare([{ v: 1.0, s: 0.1, label: 'A' }, { v: 1.6, s: 0.12, label: 'B', color: 'violet' }, { v: 1.2, s: 0.1, label: 'C', color: 'teal' }], { xlabel: 'result', caption: 'Three results that scatter far more than their error bars.' }),
      choices: [
        'It makes the stated uncertainty match the observed scatter, but it cannot correct a bias if one of the experiments is simply wrong',
        'It finds and removes the systematic error',
        'It makes the average more precise',
        'It is never acceptable: inconsistent results must be discarded',
      ],
      answer: 0,
      why: {
        1: 'Scaling changes only the error bar, not the central value or its cause.',
        2: 'It makes the average less precise — honestly so.',
        3: 'Discarding results because they disagree with the others biases the average toward whatever the majority did. Scaling is a stated, conservative compromise.',
      },
      hints: ['Does multiplying the error bar move the central value?', 'Suppose result B alone has an unknown error of +0.5. Does scaling every error bar by 2.5 remove B’s pull on the average?'],
      teach: 'Inflating by the Birge ratio restores an honest uncertainty but cannot repair a biased input.',
      explain: 'Scaling assumes every input’s uncertainty is underestimated by the same factor. If instead one experiment has a large unknown error, the average is pulled by it either way. That is why discrepancies are reported and investigated, not only absorbed.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hubble-z', difficulty: 2, transfer: true,
      prompt: t`The Hubble constant from the cosmic microwave background (Planck 2018, assuming ΛCDM) is $67.4 \pm 0.5$ km/s/Mpc; from Cepheids and type Ia supernovae (SH0ES 2022) it is $73.04 \pm 1.04$ km/s/Mpc. How many standard uncertainties apart are they?`,
      visual: compare(H0.slice(0, 2).map((q, i) => ({ v: q.v, s: q.s, label: q.lab, color: i ? 'violet' : 'accent' })), { xlabel: 'H₀ (km/s/Mpc)', caption: 'The two most precise determinations, with ±1σ and ±2σ bars.' }),
      answer: zPS, tol: { rel: 0.01 },
      errors: [{ value: (73.04 - 67.4) / (0.5 + 1.04), feedback: 'Combine the uncertainties in quadrature.' }],
      hints: [t`$\sigma_\Delta = \sqrt{0.5^2 + 1.04^2}$.`],
      teach: 'A discrepancy near 5σ between independent methods is a “tension”: one of the methods, or the model behind it, is missing something.',
      explain: t`$z = 5.64/${Math.hypot(0.5, 1.04).toFixed(2)} = ${zPS.toFixed(1)}$. Chance cannot explain it; either an unrecognized systematic error in one method or physics beyond ΛCDM. As of this writing it is unresolved.`,
    }),
    mcq({
      id: 'cp-hubble-mean', difficulty: 3,
      prompt: t`A third method, the tip of the red giant branch (CCHP 2021), gives $69.8 \pm 1.7$ km/s/Mpc. The inverse-variance weighted mean of all three is ${(+M.weightedMean(H0.map((q) => q.v), H0.map((q) => q.s)).mean.toFixed(1))} ± ${M.weightedMean(H0.map((q) => q.v), H0.map((q) => q.s)).sigma.toFixed(1)} km/s/Mpc, with $\chi^2 = ${M.weightedMean(H0.map((q) => q.v), H0.map((q) => q.s)).chi2.toFixed(1)}$ for 2 degrees of freedom. What is the honest summary?`,
      visual: compare(H0.map((q, i) => ({ v: q.v, s: q.s, label: q.lab, color: ['accent', 'violet', 'teal'][i] })), { xlabel: 'H₀ (km/s/Mpc)', caption: 'Three determinations of H₀ with ±1σ and ±2σ bars.' }),
      choices: [
        'The inputs are inconsistent (p ≈ 5 × 10⁻⁶), so the weighted mean and its ±0.4 describe none of them; report the tension, and note TRGB sits between, within about 1.5σ of each',
        `H₀ = ${(+M.weightedMean(H0.map((q) => q.v), H0.map((q) => q.s)).mean.toFixed(1))} ± 0.4 km/s/Mpc, the best current value`,
        'Discard SH0ES, since two of the three methods agree better with Planck',
        'Average the three without weights: 70.1 km/s/Mpc settles the question',
      ],
      answer: 0,
      why: {
        1: 'That number is dominated by Planck (76% of the weight) and its ±0.4 assumes the inputs agree — which χ² = 24 for 2 degrees of freedom flatly denies.',
        2: 'Agreement is not decided by vote. TRGB is consistent with both; it does not adjudicate between them.',
        3: 'An unweighted mean ignores the uncertainties and still hides the tension.',
      },
      hints: ['What does χ² = 24.5 for 2 degrees of freedom say about the premise of the weighted mean?', 'Compute TRGB’s z against each of the other two.'],
      teach: 'A weighted mean is only meaningful for consistent inputs; with a real tension, report the disagreement itself.',
      explain: t`$R_B = ${M.weightedMean(H0.map((q) => q.v), H0.map((q) => q.s)).birge.toFixed(1)}$. TRGB differs from Planck by ${M.zscore(67.4, 0.5, 69.8, 1.7).toFixed(1)}σ and from SH0ES by ${M.zscore(73.04, 1.04, 69.8, 1.7).toFixed(1)}σ. The values here are the published ones; newer analyses continue to move, and whether the tension is new physics or a systematic error is one of cosmology’s open questions.`,
    }),
    num({
      id: 'cp-altitude', difficulty: 2,
      gen(r) {
        const base = r.int(4080, 4180) / 10;
        const vals = [+(base + 0.05).toFixed(2), +(base - 0.1).toFixed(2), +(base + 0.2).toFixed(2)], sig = [0.15, 0.3, 0.5];
        const w = M.weightedMean(vals, sig);
        return {
          prompt: t`A satellite’s altitude is determined three ways: laser ranging $${vals[0].toFixed(2)} \pm 0.15$ km, radar $${vals[1].toFixed(2)} \pm 0.30$ km, onboard GPS $${vals[2].toFixed(2)} \pm 0.50$ km (consistent, independent). What is the weighted mean, in km?`,
          visual: compare(vals.map((v, i) => ({ v, s: sig[i], label: ['laser', 'radar', 'GPS'][i], color: ['accent', 'violet', 'teal'][i] })), { xlabel: 'altitude (km)' }),
          answer: w.mean, units: 'km', tol: { rel: 0, abs: 0.005 },
          errors: [{ value: vals.reduce((a, b) => a + b) / 3, feedback: 'Weight by 1/σ²: the laser result should count most.' }].filter((e) => Math.abs(e.value - w.mean) > 0.006),
          hints: [t`Weights $1/0.15^2 = 44.4$, $1/0.3^2 = 11.1$, $1/0.5^2 = 4$.`, t`$\bar h = \sum w_i h_i / \sum w_i$.`],
          teach: 'Inverse-variance weighting combines independent, consistent determinations.',
          explain: t`$\bar h = ${w.mean.toFixed(3)}$ km, $\sigma = ${w.sigma.toFixed(3)}$ km, with $\chi^2 = ${w.chi2.toFixed(2)}$ for 2 degrees of freedom — consistent, so the combination is meaningful.`,
        };
      },
    }),
  ],
  sources: [SRC_G, SRC_LI, SRC_PL, SRC_SH, SRC_FR, SRC.taylor('ch. 7')],
});

function stat_tail(chi, nu) {
  return { type: 'labx-stats', params: { mode: 'tail', test: 'chi2', nu, stat: chi, controls: false, readout: false } };
}
