// Miniature project 6 — counting statistics with a cosmic-ray detector.
// A guided mini-paper on SYNTHETIC counts generated with the PDG sea-level
// muon values (vertical intensity ≈ 70 m⁻² s⁻¹ sr⁻¹ above 1 GeV, ∝ cos²θ):
// a flat 5 cm × 5 cm paddle counted for 600 one-minute intervals (rate
// I_v·A·π/2 = 16.5 per minute) and a two-paddle telescope tilted to seven
// zenith angles. Steps: is it Poisson (variance = mean; the dispersion
// statistic Σ(n − n̄)²/n̄ against χ² with N − 1 dof: 597 for 599)? the vertical
// intensity with √N errors (70.4 ± 0.7); the zenith law cosⁿθ by Poisson
// maximum likelihood (n = 2.01, 1.76–2.26), where least squares breaks on a
// zero count; waiting times e^(−Rt); non-paralysable dead time; over-
// dispersion as a diagnostic. Poisson basics (σ = √N, rates, background)
// are lab.A2.3. Numbers from the Explore were copied from Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { errorBars } from './_rs.js';
import { r6, sci, SRC2 } from './_rs2.js';

const t = String.raw;
const I_V = 70, A = 0.0025;
const RATE = I_V * A * Math.PI / 2 * 60;                 // per minute, flat paddle
const TEL = [73, 71, 43, 36, 16, 6, 0], ANG = [0, 15, 30, 45, 60, 75, 90];     // from the Explore
const OUT = { mean: 16.59, varc: 16.52, chi2: 597, I: 70.4, sI: 0.7, n: 2.01, nlo: 1.76, nhi: 2.26 };

const telPic = (caption, { model = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-5, 95], y: [-5, 95], aspect: 'wide', axesAt: 'edge', xlabel: 'zenith angle (degrees)', ylabel: 'counts in 60 minutes', xticks: 6, yticks: 4,
    curves: [...(model ? [{ fn: `72*cos(x*pi/180)^2`, domain: [0, 90], color: 'accent', width: 2, label: 'cos²θ', labelAt: 52, labelDy: -14 }] : []), ...errorBars(TEL.map((n, i) => [ANG[i], n, Math.sqrt(n)]), { color: 'gold', cap: 1.2 })],
    points: TEL.map((n, i) => ({ x: ANG[i], y: n, color: 'gold', r: 4 })),
  },
  caption,
});
const histPic = (caption, lam = 16.5) => ({ type: 'labx-stats', params: { mode: 'hist', dist: 'poisson', lam, n: 600, controls: false, gauss: false, seed: 8, stats: false, xlabel: 'counts in one minute' }, caption });
const skyPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-1.3, 1.3], y: [-0.25, 1.15], aspect: 'wide', equal: true, axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
    curves: [{ polar: '0.5 + 0.5*cos(2*theta - pi)', theta: [0, 3.1416], color: 'accent', width: 2 }, { fn: '0', domain: [-1.2, 1.2], color: 'ink3', width: 2 }],
    shade: [{ fn: '0', lower: '-0.08', from: -0.25, to: 0.25, color: 'gold', alpha: 0.9 }],
    arrows: [{ from: [0, 0], to: [0, 1.05], color: 'ink3', width: 1.2, dash: [4, 4], label: 'zenith', labelDx: 6, labelDy: 0 }],
    points: [{ x: 0.75, y: 0.75, r: 0, label: 'intensity ∝ cos²θ', color: 'accent', labelDx: 0, labelDy: 0 }],
  },
  caption,
});

const PRELUDE = t`import numpy as np

# SYNTHETIC cosmic-ray data, generated with the PDG sea-level values: vertical
# muon intensity 70 per m^2 per s per sr above 1 GeV, falling as cos^2 of the
# zenith angle.
rng = np.random.default_rng(1808)
I_V = 70.0                                  # m^-2 s^-1 sr^-1 (PDG; the truth here)
A = 0.05 * 0.05                             # m^2: a 5 cm x 5 cm scintillator, lying flat
rate_flat = I_V * A * np.pi / 2 * 60        # counts per minute: cos^2 law over the sky

# 1. a flat paddle counted for 600 one-minute intervals
counts = rng.poisson(rate_flat, size=600)

# 2. a two-paddle telescope tilted to 7 zenith angles, 60 minutes at each
theta = np.radians([0, 15, 30, 45, 60, 75, 90])
R_vert = 1.2                                # counts per minute when pointing straight up
N_tel = rng.poisson(R_vert * 60 * np.cos(theta) ** 2)
`;
const EXPLORE = PRELUDE + t`
# is it Poisson? For Poisson counts the variance equals the mean.
m, v = counts.mean(), counts.var(ddof=1)
chi2 = np.sum((counts - m) ** 2) / m        # ~ chi-squared with 599 dof if Poisson
print(f"mean {m:.2f} per minute, variance {v:.2f}, dispersion chi2 = {chi2:.0f} for 599 dof")

# the vertical intensity from the flat paddle, with its Poisson uncertainty
N, t = counts.sum(), counts.size * 60.0     # total counts, seconds
I_est = N / t / (A * np.pi / 2)
print(f"I_vertical = {I_est:.1f} +/- {np.sqrt(N) / t / (A * np.pi / 2):.1f} per m^2 s sr  (PDG: about 70)")

# the zenith-angle law cos^n: maximize the Poisson likelihood over n
ns = np.arange(0, 4.001, 0.01)
def logL(n):
    shape = 60 * np.cos(theta) ** n
    R = N_tel.sum() / shape.sum()           # best vertical rate for this n
    mu = np.maximum(R * shape, 1e-300)
    return np.sum(N_tel * np.log(mu) - mu)
L = np.array([logL(n) for n in ns])
best = ns[np.argmax(L)]
inside = ns[L >= L.max() - 0.5]
print(f"telescope counts: {N_tel.tolist()}")
print(f"cos^n law: n = {best:.2f}, 68% range {inside.min():.2f} to {inside.max():.2f}  (PDG: about 2)")

import atlas.plot as plt
from math import factorial
k = np.arange(counts.min(), counts.max() + 1)
pois = [counts.size * np.exp(-m) * m**int(j) / factorial(int(j)) for j in k]
plt.scatter(k, [np.sum(counts == j) for j in k], label="observed minutes")
plt.plot(k, pois, label="Poisson with the same mean")
plt.xlabel("counts in one minute"); plt.ylabel("number of minutes"); plt.legend(); plt.show()
`;
const LOGL = t`
ns = np.arange(0, 4.001, 0.01)
`;

export default lesson({
  id: 'research.P.6',
  title: 'Counting statistics with a cosmic-ray detector',
  minutes: 22, difficulty: 3,
  intro: t`**The question.** A pocket-sized scintillator on a desk clicks about sixteen times a minute: muons made by cosmic rays high in the atmosphere. Are the clicks random in the Poisson sense? What muon intensity do they imply, and how does it fall away from the vertical? The Particle Data Group’s review gives about $70$ muons per square metre per second per steradian from overhead (above 1 GeV), falling as $\cos^2\theta$ with zenith angle $\theta$.

**The counts here are synthetic**, generated from exactly those values, so the project checks methods, not the sky. For a flat detector of area $A$ facing up, the intensity integrated over the sky gives the count rate

$$R = I_V\,A\int \cos^2\theta\,\cos\theta\;d\Omega = \frac{\pi}{2}\,I_V\,A$$

[Counting statistics](#/lesson/lab.A2.3) covered $\sigma = \sqrt N$, rates and backgrounds; this project tests whether data are Poisson, and fits a law to counts too small for least squares.`,
  symbols: [
    { tex: 'R', text: 'the count rate of the detector, in counts per second' },
    { tex: 'I_V', text: 'the vertical muon intensity: muons per square metre, per second, per steradian of sky, from straight overhead' },
    { tex: 'A', text: 'the detector’s area, in m²' },
    { tex: '\\theta', text: 'the zenith angle, measured from straight up' },
    { tex: 'd\\Omega', text: 'an element of solid angle on the sky, in steradians; the integral runs over the upper hemisphere' },
    { tex: '\\cos\\theta', text: 'the second one: a flat detector presents only $A\\cos\\theta$ to muons arriving at angle $\\theta$' },
  ],
  why: t`Every particle detector, photon-counting camera and Geiger counter produces Poisson counts — and testing that assumption is how instrumental problems are caught.`,
  visual: {
    type: 'code-runner',
    title: 'Is it Poisson, and what does it say?',
    lead: t`Run it: 600 one-minute counts from a flat paddle are tested against the Poisson rule variance = mean, turned into a vertical intensity, and a tilted telescope’s counts are fitted with $\cos^n\theta$ by Poisson likelihood. The plot compares the minute-by-minute counts with the Poisson distribution of the same mean.`,
    tasks: ['Read the dispersion line: 597 for 599 degrees of freedom is what Poisson counts give.', 'Make the rate drift: replace rng.poisson(rate_flat, size=600) by rng.poisson(rate_flat * (1 + 0.2 * np.sin(np.arange(600) / 50))) — the dispersion statistic jumps.', 'Count the telescope for 15 minutes instead of 60 (both 60s in its line): the range on n widens by about two.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'Synthetic counts from the PDG intensity and a pure cos²θ law. Real detectors add dead time, afterpulsing, accidental coincidences, and rates that follow atmospheric pressure.',
  },
  example: {
    prompt: t`Write the mini-paper’s results: the Poisson test, the vertical intensity, and the zenith-angle exponent, each compared with the PDG values.`,
    visual: telPic('The telescope’s counts in 60 minutes at each angle, with √N error bars, and a cos²θ curve. The zero at 90° is a real count.'),
    steps: [
      { label: 'Poisson?', text: t`Mean $${OUT.mean}$, variance $${OUT.varc}$ counts per minute. The dispersion statistic $\sum (n_i - \bar n)^2/\bar n = ${OUT.chi2}$ for 599 degrees of freedom; a Poisson process gives $599 \pm \sqrt{2\times599} = 599 \pm 35$. Consistent.` },
      { label: 'Intensity', text: t`$N$ counts in $t$ seconds: $I_V = (N/t)/(\tfrac{\pi}{2}A) = ${OUT.I} \pm ${OUT.sI}\ \text{m}^{-2}\,\text{s}^{-1}\,\text{sr}^{-1}$, against the PDG’s about 70.` },
      { label: 'Angle', text: t`Maximizing the Poisson likelihood of the seven counts over $n$ gives $n = ${OUT.n}$, with the 68% range ${OUT.nlo} to ${OUT.nhi} (where $\ln L$ drops by $\tfrac12$). The PDG’s $\cos^2\theta$: consistent.` },
      { label: 'Why likelihood', text: t`The count at $90^\circ$ is 0. Least squares with $\sigma = \sqrt N$ would give that point zero uncertainty and infinite weight; the Poisson likelihood treats it exactly — zero is simply an unlikely outcome when the expectation is large.` },
      { label: 'What it shows', text: t`All three agree with the values the data were made from: the pipeline works. On a real detector, the same pipeline would test dead time and afterpulsing (dispersion above 1) and the local altitude (intensity).` },
    ],
    answer: t`Poisson-consistent (dispersion ${OUT.chi2}/599); $I_V = ${OUT.I} \pm ${OUT.sI}$; $n = ${OUT.n}^{+0.25}_{-0.25}$ — each matching the PDG values used to make the data.`,
  },
  practice: [
    num({
      id: 'rate', difficulty: 2,
      gen(r) {
        const s = r.pick([3, 5, 10, 20]);
        const ans = I_V * (s / 100) ** 2 * Math.PI / 2 * 60;
        return {
          prompt: t`A flat ${s} cm × ${s} cm scintillator lies on a desk. With a vertical intensity of $70\ \text{m}^{-2}\text{s}^{-1}\text{sr}^{-1}$ and a $\cos^2\theta$ law, how many muons should it count per **minute**?`,
          visual: skyPic('The cos²θ intensity over the sky (blue, polar plot) above a flat detector (gold). Schematic.'),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: I_V * (s / 100) ** 2 * 60, feedback: t`Integrate over the sky: $\int\cos^3\theta\,d\Omega = \pi/2$ steradians.` }, { value: I_V * (s / 100) ** 2 * Math.PI * 60, feedback: t`With the $\cos^2\theta$ law the integral is $\int\cos^3\theta\,d\Omega = 2\pi/4 = \pi/2$, not $\pi$.` }, { value: I_V * (s / 100) ** 2 * Math.PI / 2, feedback: 'That is per second; the question asks per minute.' }],
          hints: [t`$R = \tfrac{\pi}{2} I_V A$ with $A$ in m².`, 'Multiply by 60 for a minute.'],
          teach: 'Size the expected rate before you switch the detector on: it decides how long to count.',
          explain: t`$A = ${sci((s / 100) ** 2, 3)}\ \text{m}^2$, so $R = \tfrac{\pi}{2}\times70\times${sci((s / 100) ** 2, 3)} = ${(ans / 60).toFixed(3)}$ per second, or $${ans.toFixed(1)}$ per minute. For a horizontal detector this is the PDG’s rule of thumb of about one muon per square centimetre per minute${s === 10 ? ' — here 100 cm² gives about 66' : ''}.`,
        };
      },
    }),
    code({
      id: 'dispersion', difficulty: 2,
      prompt: t`Test the flat paddle’s 600 counts: set \`ratio\` to the sample variance (\`ddof=1\`) divided by the mean, and \`D\` to the dispersion statistic $\sum_i (n_i - \bar n)^2/\bar n$. For Poisson counts, \`ratio\` is near 1 and \`D\` near 599, within about $\sqrt{2\times599} \approx 35$.`,
      starter: PRELUDE + t`
ratio = D = None
print(ratio, D)
`,
      answer: PRELUDE + t`
m = counts.mean()
ratio = counts.var(ddof=1) / m
D = np.sum((counts - m) ** 2) / m
print(ratio, D)
`,
      tests: [
        { name: 'variance ÷ mean is 0.996', code: 'ratio is not None and abs(ratio - 0.9958) < 0.001' },
        { name: 'the dispersion statistic is 597', code: 'D is not None and abs(D - 597) < 1' },
        { name: 'D = (N − 1) × ratio', code: 'D is not None and abs(D - 599 * ratio) < 1e-6' },
      ],
      hints: ['`m = counts.mean()`; `counts.var(ddof=1)` is the sample variance.', '`D = np.sum((counts - m) ** 2) / m`.'],
      teach: 'Poisson counts have variance equal to their mean: the dispersion test checks it with a χ² statistic.',
      explain: t`Ratio 0.996, $D = 597$ for 599 degrees of freedom: Poisson. A detector with afterpulsing (one muon making two counts) or a drifting rate gives $D$ well above $N - 1$.`,
    }),
    num({
      id: 'waiting', difficulty: 2,
      gen(r) {
        const R = r.pick([12, 16.5, 20, 30]), ts = r.pick([5, 10, 15]);
        const ans = Math.exp(-R / 60 * ts);
        return {
          prompt: t`A detector counts on average $${R}$ muons per minute, at random. What is the probability that ${ts} seconds pass with **no** count?`,
          visual: histPic('Counts per interval from a steady Poisson source: an empty interval is just the k = 0 bar.', R * ts / 60 < 3 ? R * ts / 60 + 0.001 : 16.5),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 - ans, feedback: 'That is the probability of at least one count.' }, { value: Math.exp(-R * ts), feedback: 'Convert the rate to counts per second first.' }],
          hints: [t`The expected count in ${ts} s is $\mu = ${R}/60 \times ${ts}$.`, t`$P(0) = e^{-\mu}$.`],
          teach: t`Random arrivals leave exponentially distributed gaps: $P(\text{no count in } t) = e^{-Rt}$.`,
          explain: t`$\mu = ${(R / 60 * ts).toFixed(3)}$, so $P(0) = e^{-${(R / 60 * ts).toFixed(3)}} = ${ans.toFixed(3)}$. A histogram of the times between counts should fall off exactly this way — a second Poisson test.`,
        };
      },
    }),
    mcq({
      id: 'zero-count', difficulty: 3,
      prompt: t`You fit $\cos^n\theta$ to the telescope counts $[73, 71, 43, 36, 16, 6, 0]$ by least squares with errors $\sigma = \sqrt N$. What goes wrong?`,
      visual: telPic('The seven counts with √N bars; the last bar has zero length.'),
      choices: [t`The point with 0 counts gets $\sigma = 0$ and infinite weight — the fit fails or is dragged to it; small counts are poorly described by $\sqrt N$ anyway. Maximize the Poisson likelihood instead.`, 'Nothing: least squares is always valid', 'The fit gives n = 0', 'You must drop the 0 because it is an outlier'],
      answer: 0,
      why: { 1: 'Least squares assumes Gaussian errors of known size; for counts of a few that fails, and for 0 it breaks outright.', 2: 'The result depends on how the zero is handled — it cannot be read off in advance.', 3: 'Zero counts is a legitimate measurement when about 0.01 are expected; dropping it biases the fit.' },
      hints: [t`What is $\sqrt N$ for $N = 0$?`, 'Which method uses the exact probability of each count?'],
      teach: t`At low counts, fit with the Poisson likelihood $\sum(N_i\ln\mu_i - \mu_i)$, not least squares with $\sqrt N$ errors.`,
      explain: t`The Poisson likelihood needs no error bars: each count’s probability is $\mu^N e^{-\mu}/N!$, which is perfectly defined for $N = 0$. With large counts both methods agree; with small ones only the likelihood is right.`,
    }),
    code({
      id: 'cos-n', difficulty: 3,
      prompt: t`Fit the zenith law: for each $n$ in \`ns\`, the expected telescope counts are $\mu_i = R\cdot 60\cos^n\theta_i$, with the best $R$ for that $n$ being $\sum N_i/\sum 60\cos^n\theta_i$. Compute $\ln L = \sum_i (N_i \ln\mu_i - \mu_i)$ (use \`np.maximum(mu, 1e-300)\` inside the log), and set \`n_best\` to the $n$ that maximizes it.`,
      starter: PRELUDE + LOGL + t`
n_best = None
print(n_best)
`,
      answer: PRELUDE + LOGL + t`
def logL(n):
    shape = 60 * np.cos(theta) ** n
    R = N_tel.sum() / shape.sum()
    mu = np.maximum(R * shape, 1e-300)
    return np.sum(N_tel * np.log(mu) - mu)

L = np.array([logL(n) for n in ns])
n_best = ns[np.argmax(L)]
print(n_best)
`,
      tests: [
        { name: 'the best exponent is n = 2.01', code: 'n_best is not None and abs(n_best - 2.01) < 0.015' },
        { name: 'it agrees with the PDG cos²θ within 0.3', code: 'n_best is not None and abs(n_best - 2) < 0.3' },
      ],
      hints: ['Write a function `logL(n)` that builds `shape = 60 * np.cos(theta) ** n`, the best `R`, then `mu`.', 'Evaluate it for every n in `ns` and take `ns[np.argmax(L)]`.'],
      teach: 'Maximum likelihood with the Poisson probability is the right fit for counts, however small.',
      explain: t`$n = 2.01$. The $\cos\theta_i$ at $90^\circ$ is a tiny number rather than exactly 0 in floating point, so the log stays finite; the guard \`np.maximum\` protects against an exact zero.`,
    }),
    num({
      id: 'deadtime', difficulty: 2,
      gen(r) {
        const tau = r.pick([2, 5, 10]), m = r.pick([2e4, 5e4, 8e4]);
        const ans = m / (1 - m * tau * 1e-6);
        return {
          prompt: t`Near a strong source the detector registers $m = ${sci(m, 2)}$ counts per second, and after each count it is blind for $\tau = ${tau}\ \mu\text{s}$ (non-paralysable dead time). What is the true rate, in counts per second?`,
          visual: histPic('Dead time removes counts that arrive while the detector recovers; the true distribution is wider than what is registered.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: m * (1 - m * tau * 1e-6), feedback: 'Dead time *loses* counts, so the true rate is higher than the measured one: divide by (1 − mτ).' }, { value: m * (1 + m * tau * 1e-6), feedback: 'That is only the first-order correction; use n = m/(1 − mτ).' }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`The detector is dead a fraction $m\tau$ of the time.`, t`$n = m/(1 - m\tau)$, with $\tau$ in seconds.`],
          teach: 'A counter that is blind after each count under-counts at high rates; the correction is n = m/(1 − mτ).',
          explain: t`$m\tau = ${(m * tau * 1e-6).toFixed(2)}$, so $n = ${sci(m, 2)}/(1 - ${(m * tau * 1e-6).toFixed(2)}) = ${ans.toFixed(0)}$ per second. At sixteen muons a minute the same detector loses one count in about $${Math.round(1 / (16.5 / 60 * tau * 1e-6) / 1e5) / 10}$ million: negligible.`,
        };
      },
    }),
    mcq({
      id: 'overdispersed', difficulty: 3,
      prompt: t`On a real detector, 600 one-minute counts give a dispersion statistic of 760 for 599 degrees of freedom. What is the most useful reading?`,
      visual: histPic('A steady Poisson source: variance equal to the mean. Extra variance means something else is going on.'),
      choices: ['The counts vary more than Poisson allows (about 4.7σ): look for a drifting rate (atmospheric pressure, temperature) or extra counts per muon (afterpulsing)', 'Cosmic rays are not random', 'The detector is perfect: more variance means more signal', 'Nothing: χ² is always about that size'],
      answer: 0,
      why: { 1: 'Arrival times of muons are random to a very good approximation; the excess usually comes from the instrument or the conditions.', 2: 'Extra variance is noise, not signal.', 3: t`For 599 dof, $\chi^2$ scatters by about $\sqrt{1198} \approx 35$; 760 is 161 above.` },
      hints: [t`How many standard deviations above 599 is 760, if the spread is $\sqrt{2\nu}$?`, 'What could make the count vary more than chance does?'],
      teach: 'Over-dispersion is a diagnostic: it points to drifts or correlated counts in the instrument or its environment.',
      explain: t`$(760 - 599)/\sqrt{1198} = 4.7\sigma$. The muon rate at the ground does follow atmospheric pressure (more air overhead, fewer muons), and afterpulsing makes one muon count twice: both inflate the variance. A time series of the counts tells them apart.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-intensity', difficulty: 2,
      prompt: t`From the flat paddle’s 600 one-minute counts, set \`I_est\` to the vertical intensity $I_V = (N/t)/(\tfrac{\pi}{2}A)$ with $N$ the total count and $t$ the total time in **seconds**, and \`sI\` to its Poisson uncertainty, using $\sigma_N = \sqrt N$.`,
      starter: PRELUDE + t`
I_est = sI = None
print(I_est, sI)
`,
      answer: PRELUDE + t`
N = counts.sum()
t = counts.size * 60.0
I_est = N / t / (A * np.pi / 2)
sI = np.sqrt(N) / t / (A * np.pi / 2)
print(I_est, sI)
`,
      tests: [
        { name: 'I = 70.4 m⁻² s⁻¹ sr⁻¹', code: 'I_est is not None and abs(I_est - 70.4) < 0.1' },
        { name: 'σ = 0.7 m⁻² s⁻¹ sr⁻¹', code: 'sI is not None and abs(sI - 0.70) < 0.02' },
        { name: 'within 2σ of the PDG’s 70', code: 'I_est is not None and abs(I_est - 70) < 2 * sI' },
      ],
      hints: ['`N = counts.sum()`, `t = counts.size * 60.0`.', 'The uncertainty uses √N in place of N in the same formula.'],
      teach: 'An intensity from counts carries √N/N relative uncertainty: 10 000 counts give 1%.',
      explain: t`$N \approx 9950$ counts, so the relative error is about 1%: $I_V = 70.4 \pm 0.7$. A real measurement would add systematic terms the synthetic data lack: the detector’s efficiency, the energy threshold, and the local altitude and pressure.`,
    }),
    num({
      id: 'cp-tracker', difficulty: 2, transfer: true,
      gen(r) {
        const rate = r.pick([0.5, 1, 2, 4]), frame = r.pick([0.1, 0.2, 0.5]);
        const mu = rate * frame, ans = 1 - Math.exp(-mu);
        return {
          prompt: t`A spacecraft star tracker’s detector registers false “stars” from radiation hits at random, ${rate} per second on average. Each image is exposed for ${frame} s. What fraction of images contain at least one hit?`,
          visual: histPic('Hits per exposure follow a Poisson distribution with mean rate × exposure.', mu + 0.001),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: mu, feedback: t`The mean number of hits is not the probability of at least one; use $1 - e^{-\mu}$.` }, { value: Math.exp(-mu), feedback: 'That is the fraction with no hits.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\mu = ${rate} \times ${frame}$ hits per image.`, t`$P(\ge 1) = 1 - e^{-\mu}$.`],
          teach: 'Poisson statistics set how often a radiation hit corrupts a frame — the reason trackers cross-check stars between frames.',
          explain: t`$\mu = ${mu.toFixed(2)}$, so $1 - e^{-${mu.toFixed(2)}} = ${ans.toFixed(3)}$: about ${(ans * 100).toFixed(0)}% of images. In the radiation belts the rate is far higher, which is why trackers reject any “star” not seen in consecutive frames.`,
        };
      },
    }),
    mcq({
      id: 'cp-conclusion', difficulty: 2,
      prompt: 'Which conclusion does this project support?',
      visual: telPic('The zenith-angle data and the cos²θ law they were generated from.'),
      choices: [
        'On synthetic counts generated from the PDG values, the pipeline confirms Poisson statistics, recovers the vertical intensity to 1%, and fits the zenith exponent by Poisson likelihood as 2.0 ± 0.25',
        'We have measured the muon flux at sea level',
        'Cosmic-ray muons follow cos²θ exactly',
        'Least squares and likelihood give the same answer, so either can be used',
      ],
      answer: 0,
      why: { 1: 'The counts were synthetic; no muon was detected.', 2: 'The data were built with cos²θ; real angular distributions deviate at large angles and depend on energy.', 3: 'They agree only when every count is large; this data set has a zero.' },
      hints: ['What did the data come from, and what was recovered?'],
      teach: 'Say what synthetic data can and cannot show: they validate the analysis, not the physics.',
      explain: 'The pipeline recovers what went in, with honest errors — ready for a real detector, where dead time, efficiency and atmospheric conditions join the budget.',
    }),
  ],
  lab: true,
  sources: [SRC2.pdgCR, SRC2.cosmicwatch, { label: 'G. F. Knoll, Radiation Detection and Measurement, 4th ed. (Wiley, 2010), ch. 3–4 (counting statistics, dead time)', url: 'https://www.wiley.com/en-us/Radiation+Detection+and+Measurement%2C+4th+Edition-p-9780470131480' }],
});
