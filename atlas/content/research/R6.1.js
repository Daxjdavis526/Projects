// Likelihoods and parameter estimation, from the researcher's side: write
// the likelihood that matches how the data were produced (Poisson counts,
// a truncated decay window), read intervals from Δ(−2 ln L) = 1 (often
// asymmetric), handle nuisance parameters and degeneracies, and keep
// estimation separate from goodness of fit. The muon-decay data are
// simulated (seeded, τ = 2.2 μs, window 5 μs) and the numbers quoted are
// computed from them. Links st-g.G4.2, lab.A5–A6 and prog.P14.1.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { SRC } from './_rs.js';

const t = String.raw;

// 40 simulated muon decay times (μs), drawn from τ = 2.2 μs and kept only below T = 5 μs
const TIMES = [0.59, 0.24, 1.11, 0.37, 0.15, 1.13, 3.55, 3.19, 0.55, 1.69, 0.71, 0.42, 0.25, 0.53, 3.88, 3.62, 3.55, 0.47, 0.82, 2.17, 2.9, 4.24, 4.67, 0.2, 2.05, 2.45, 1.55, 0.43, 1.41, 0.21, 4.41, 1.75, 0.79, 1.87, 4.71, 4.15, 1.56, 1.18, 2.01, 1.24];
const TW = 5, N = TIMES.length, S = +TIMES.reduce((a, b) => a + b, 0).toFixed(2);
const m2l = (tau) => 2 * (N * Math.log(tau) + S / tau + N * Math.log(1 - Math.exp(-TW / tau)));
function argmin(f, lo, hi) { for (let k = 0; k < 200; k++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (f(a) < f(b)) hi = b; else lo = a; } return (lo + hi) / 2; }
function root(f, a, b) { for (let k = 0; k < 200; k++) { const m = (a + b) / 2; if ((f(a) > 0) === (f(m) > 0)) a = m; else b = m; } return (a + b) / 2; }
const TAU = argmin(m2l, 0.5, 10), MIN = m2l(TAU);
const LO = root((x) => m2l(x) - MIN - 1, 0.5, TAU), HI = root((x) => m2l(x) - MIN - 1, TAU, 20);
const NAIVE = S / N;
const muonCurve = `2*(${N}*ln(x) + ${S}/x + ${N}*ln(1 - exp(-${TW}/x))) - ${MIN.toFixed(6)}`;
const muonPic = (caption, { marks = true } = {}) => ({
  type: 'graph',
  params: {
    x: [1, 7], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'lifetime τ (μs)', ylabel: 'Δ(−2 ln L)', xticks: 6, yticks: 6,
    curves: [{ fn: muonCurve, domain: [1.05, 7], color: 'accent' }],
    hlines: [{ y: 1, label: 'Δ = 1', color: 'ink3' }],
    ...(marks ? { vlines: [{ x: +NAIVE.toFixed(3), label: 'sample mean', color: 'gold' }] } : {}),
  },
  caption,
});

// a Poisson likelihood for k counting intervals with total n: Δ(−2 ln L) in the rate μ
const poissonPic = (k, n, xr, caption) => ({
  type: 'graph',
  params: {
    x: xr, y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'rate μ (counts per interval)', ylabel: 'Δ(−2 ln L)', xticks: 6, yticks: 6,
    curves: [{ fn: `2*(${k}*x - ${n} + ${n}*ln(${n}/(${k}*x)))`, domain: [xr[0] + 0.02, xr[1]], color: 'accent' }],
    hlines: [{ y: 1, label: 'Δ = 1', color: 'ink3' }],
  },
  caption,
});

// a parabola −2 ln L for a Gaussian measurement
const parabola = (th, s, caption, xlabel) => ({
  type: 'graph',
  params: {
    x: [+(th - 3 * s).toPrecision(4), +(th + 3 * s).toPrecision(4)], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel, ylabel: 'Δ(−2 ln L)', xticks: 6, yticks: 6,
    curves: [{ fn: `((x - ${th})/${s})^2`, color: 'accent' }],
    hlines: [{ y: 1, label: 'Δ = 1', color: 'ink3' }],
  },
  caption,
});

// a degeneracy: a long thin likelihood contour (schematic)
const degeneracy = (caption) => ({
  type: 'graph',
  params: {
    x: [-19.75, -18.75], y: [58, 88], aspect: 'wide', axesAt: 'edge', xlabel: 'absolute magnitude M (nuisance)', ylabel: 'H₀ (km/s/Mpc)', xticks: 5, yticks: 6,
    curves: [{ param: ['-19.25 + 0.3*cos(t)', '73 + 9.66*cos(t) + 0.9*sin(t)'], t: [0, 6.2832], color: 'accent' }, { fn: '73*10^((x + 19.25)/5)', color: 'ink3', dash: [5, 5] }],
  },
  caption,
});

export default lesson({
  id: 'research.R6.1',
  title: 'Likelihoods and parameter estimation',
  minutes: 15, difficulty: 3,
  intro: t`To measure a parameter $\theta$ from data, write down how probable your actual data would be for each value of $\theta$: the **likelihood**. For independent data points it is a product, and the best estimate is where it peaks. Working with $-2\ln\mathcal L$ turns the product into a sum (for Gaussian errors it is $\chi^2$), and the 68% interval is where it rises by 1 from its minimum:

$$\mathcal L(\theta) = \prod_{i=1}^{N} p(d_i \mid \theta), \qquad \Delta(-2\ln\mathcal L) = 1 \ \text{at the 68\% limits}$$

The research skill is choosing $p(d \mid \theta)$ to match **how the data were really produced** — counts, a finite observing window, a selection — because a convenient but wrong likelihood gives a precise, wrong answer.`,
  symbols: [
    { tex: '\\theta', text: 'the parameter being measured (a lifetime, a rate, $H_0$ …)' },
    { tex: 'd_i', text: 'the $i$-th data point; $N$ of them, assumed independent' },
    { tex: 'p(d_i \\mid \\theta)', text: 'the probability (density) of getting $d_i$ if the parameter is $\\theta$: the model of how the data arise, noise and selection included' },
    { tex: '\\mathcal L(\\theta)', text: 'the likelihood: a function of $\\theta$ for fixed data — **not** a probability distribution for $\\theta$' },
    { tex: '\\Delta(-2\\ln\\mathcal L)', text: 'the rise of $-2\\ln\\mathcal L$ above its minimum; 1 marks the 68% interval for one parameter (when the curve is roughly parabolic; 4 marks about 95%)' },
  ],
  why: t`Every measured number in a paper — a mass, a lifetime, $H_0$ — comes out of a likelihood someone chose; reading and writing them is the core of quantitative research.`,
  visual: {
    type: 'graph',
    title: 'Counting: when the Gaussian shortcut fails',
    lead: t`You observe $n$ counts in one interval and want the mean rate $\mu$. Blue: the exact Poisson likelihood. Gold: the common shortcut, a Gaussian with $\sigma = \sqrt{n}$ (the $\chi^2$ you would get from error bars of $\sqrt n$). Where each crosses the grey line is its 68% interval.`,
    tasks: ['At n = 25 the two curves nearly agree: the shortcut is fine for large counts.', 'At n = 2 the Poisson curve is lopsided: the interval runs much further up than down, and the Gaussian’s lower limit is nearly zero.', 'At n = 1, the Gaussian says μ could be 0 — impossible, since you saw a count. The Poisson curve never allows it.'],
    params: {
      x: [0, 40], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'rate μ (counts per interval)', ylabel: 'Δ(−2 ln L)', xticks: 8, yticks: 6,
      sliders: [{ key: 'n', label: t`observed counts $n$`, min: 1, max: 30, step: 1, value: 2, explain: 'The number of counts recorded in the interval.' }],
      curves: [
        { fn: '2*(x - n + n*ln(n/x))', domain: [0.05, 40], color: 'accent' },
        { fn: '(x - n)^2/n', color: 'gold', dash: [6, 4] },
      ],
      hlines: [{ y: 1, label: 'Δ = 1', color: 'ink3' }],
      legend: [{ label: 'Poisson (exact)', color: 'accent' }, { label: 'Gaussian, σ = √n', color: 'gold', dash: [6, 4] }], legendAt: 'tr',
      readouts: [{ label: t`Gaussian half-width $\sqrt{n}$`, expr: 'sqrt(n)', digits: 3 }],
    },
    caption: 'Δ(−2 ln L) for a single Poisson count against its Gaussian approximation. The readout is the Gaussian half-width √n.',
  },
  example: {
    prompt: t`A muon-decay experiment records ${N} decay times (in μs), but the electronics only register decays within $T = ${TW}\ \mu\text{s}$ of the muon’s arrival (simulated data). Their sum is $${S}\ \mu\text{s}$. Estimate the lifetime $\tau$.`,
    visual: muonPic(t`$\Delta(-2\ln\mathcal L)$ for the truncated-exponential likelihood. Simulated data: 40 decays drawn from $\tau = 2.2\ \mu\text{s}$, kept only below $5\ \mu\text{s}$.`),
    steps: [
      { label: 'The tempting answer', text: t`For an exponential, the estimate of $\tau$ is the mean time: $${S}/${N} = ${NAIVE.toFixed(2)}\ \mu\text{s}$, with uncertainty $\tau/\sqrt N = ${(NAIVE / Math.sqrt(N)).toFixed(2)}\ \mu\text{s}$. But long decays were never recorded, so the mean is biased **low**.` },
      { label: 'Model the selection', text: t`A decay at $t$ is recorded only if $t < T$. The probability density, given that it was recorded, is the exponential renormalized to the window:

$$p(t \mid \tau) = \frac{e^{-t/\tau}/\tau}{1 - e^{-T/\tau}}$$` },
      { label: 'The likelihood', text: t`$-2\ln\mathcal L = 2\left[N\ln\tau + \dfrac{\sum t_i}{\tau} + N\ln\bigl(1 - e^{-T/\tau}\bigr)\right]$ — only $N$ and $\sum t_i$ enter.` },
      { label: 'Maximize', text: t`Numerically, the minimum is at $\hat\tau = ${TAU.toFixed(2)}\ \mu\text{s}$.` },
      { label: 'Interval', text: t`$\Delta(-2\ln\mathcal L) = 1$ at $${LO.toFixed(2)}$ and $${HI.toFixed(2)}\ \mu\text{s}$: $\tau = ${TAU.toFixed(1)}^{+${(HI - TAU).toFixed(1)}}_{-${(TAU - LO).toFixed(1)}}\ \mu\text{s}$. Asymmetric, and much wider than the naive $\pm ${(NAIVE / Math.sqrt(N)).toFixed(2)}$: a short window carries little information about long lifetimes.` },
      { label: 'Sense check', text: t`The true value used to simulate the data, $2.2\ \mu\text{s}$, lies inside the interval; the naive $${NAIVE.toFixed(2)} \pm ${(NAIVE / Math.sqrt(N)).toFixed(2)}$ misses it by more than $1\sigma$. (The real muon lifetime is $2.197\ \mu\text{s}$.)` },
    ],
    answer: t`$\hat\tau = ${TAU.toFixed(1)}^{+${(HI - TAU).toFixed(1)}}_{-${(TAU - LO).toFixed(1)}}\ \mu\text{s}$ from the truncated likelihood, against a biased and overconfident $${NAIVE.toFixed(2)} \pm ${(NAIVE / Math.sqrt(N)).toFixed(2)}\ \mu\text{s}$ from the plain mean.`,
  },
  practice: [
    mcq({
      id: 'not-prob', difficulty: 2,
      prompt: t`A classmate integrates $\mathcal L(\tau)$ over $\tau$, finds it is not 1, and concludes the likelihood was computed wrongly. What is the right response?`,
      visual: muonPic('The muon-decay likelihood (as Δ(−2 ln L)). It is a function of τ for fixed data.', { marks: false }),
      choices: [
        t`Nothing is wrong: $\mathcal L(\tau)$ is the probability of the fixed data as a function of $\tau$, not a probability distribution over $\tau$`,
        t`They should divide by $\sqrt N$`,
        t`The likelihood must always integrate to 1 over $\tau$, so there is a bug`,
        t`They should take the logarithm first`,
      ],
      answer: 0,
      why: { 1: 'Normalization has nothing to do with √N.', 2: 'That is the most common misreading of a likelihood.', 3: 'The logarithm changes the shape, not the normalization question.' },
      hints: ['What is held fixed in a likelihood, and what varies?', t`$p(d \mid \theta)$ integrates to 1 over $d$, not over $\theta$.`],
      teach: 'A likelihood is the probability of the observed data as a function of the parameter; turning it into a probability for the parameter needs a prior (Bayes).',
      explain: t`$p(d \mid \theta)$ is normalized over possible **data**. As a function of $\theta$ it can integrate to anything. To speak of a probability for $\theta$ you need Bayes’ theorem and a prior — see [estimation and likelihood](#/lesson/st-g.G4.2).`,
    }),
    num({
      id: 'poisson-mle', difficulty: 2,
      gen(r) {
        const k = r.int(4, 7), counts = Array.from({ length: k }, () => r.int(0, 6));
        if (counts.every((c) => c === 0)) counts[0] = 2;
        const n = counts.reduce((a, b) => a + b, 0), ans = n / k;
        return {
          prompt: t`A small cosmic-ray detector counts muons in ${k} one-minute intervals: ${counts.join(', ')}. Assuming Poisson counts with a constant mean rate $\mu$ per minute, what is the maximum-likelihood estimate of $\mu$?`,
          visual: poissonPic(k, n, [0.02, Math.max(6, 2.5 * ans)], t`$\Delta(-2\ln\mathcal L)$ for the ${k} intervals together, as a function of $\mu$.`),
          answer: ans, units: '1/min', tol: { rel: 0.01 },
          errors: [{ value: n, feedback: 'That is the total count. The rate per minute divides by the number of intervals.' }],
          hints: [t`For Poisson counts, $-2\ln\mathcal L = 2\sum_i(\mu - n_i\ln\mu) + \text{const}$.`, t`Setting its derivative to zero gives $\hat\mu = \frac{1}{k}\sum n_i$.`],
          teach: 'For Poisson counts with a constant rate, the maximum-likelihood rate is the mean count — even when some intervals are zero.',
          explain: t`$\hat\mu = ${n}/${k} = ${ans.toFixed(3)}$ per minute. A $\chi^2$ fit with error bars $\sqrt{n_i}$ would be biased${counts.includes(0) ? ', and would break on the zero counts (an error bar of 0)' : ' low, since low counts get small error bars and too much weight'}.`,
        };
      },
    }),
    num({
      id: 'read-sigma', difficulty: 2,
      gen(r) {
        const th = r.pick([1.38, 1.44, 1.52]), s = r.pick([0.02, 0.03, 0.04]);
        return {
          prompt: t`The curve below is $\Delta(-2\ln\mathcal L)$ for a pulsar’s mass from timing data (constructed), with its minimum at $${th}\,M_\odot$. Read off the 68% (1σ) uncertainty, in solar masses.`,
          visual: parabola(th, s, 'Δ(−2 ln L) against the mass. Read where the curve crosses Δ = 1.', 'pulsar mass (solar masses)'),
          answer: s, units: 'Msun', tol: { rel: 0.12 },
          errors: [{ value: 2 * s, feedback: 'That is where Δ = 4: the 2σ (95%) half-width. Use Δ = 1.' }],
          hints: ['Find the two masses where the curve crosses the grey line at 1.', 'σ is half the distance between them.'],
          teach: 'For a single parameter, the 68% interval is where Δ(−2 ln L) = 1; Δ = 4 marks about 95%.',
          explain: t`The curve crosses 1 at $${th} \pm ${s}$, so $\sigma = ${s}\,M_\odot$. For a parabola $\Delta = ((\theta - \hat\theta)/\sigma)^2$, so $\Delta = 1$ is exactly $\pm\sigma$.`,
        };
      },
    }),
    mcq({
      id: 'which-likelihood', difficulty: 3,
      prompt: t`A transient search records 0, 1, 0, 2, 0, 0, 1 events per night. A student fits a constant rate by minimizing $\chi^2 = \sum (n_i - \mu)^2/n_i$, with error bars $\sqrt{n_i}$. What goes wrong?`,
      visual: poissonPic(7, 4, [0.02, 2.5], 'The correct Poisson likelihood for these seven nights (4 events in all).'),
      choices: [
        t`The zero counts get zero error bars (division by zero), and low counts get too much weight, biasing $\mu$ low: use the Poisson likelihood`,
        'Nothing: χ² is always right',
        'The nights must first be averaged in pairs',
        'Only the zero-count nights should be dropped',
      ],
      answer: 0,
      why: { 1: 'χ² is the likelihood only for Gaussian errors with known σ; few counts are not Gaussian.', 2: 'Rebinning helps a little but throws away information and does not fix the weighting.', 3: 'Dropping zeros throws away real information and biases the rate high.' },
      hints: [t`What is $\sqrt{n_i}$ when $n_i = 0$?`, 'Should the error bar depend on the fluctuation that happened, or on the true rate?'],
      teach: 'Use the likelihood of the real noise process: for small counts, Poisson — not a χ² with √n error bars.',
      explain: t`The Poisson MLE is the mean, $4/7 = 0.57$ per night. Error bars of $\sqrt{n_i}$ use the observed counts, which makes downward fluctuations look precise and pulls the fit low — and fails outright at zero.`,
    }),
    mcq({
      id: 'nuisance', difficulty: 3,
      prompt: t`Type Ia supernovae give apparent magnitudes. Fitting $H_0$ needs their absolute magnitude $M$ too, which you do not care about but cannot ignore. The likelihood in $(M, H_0)$ is a long thin ellipse. What is the right way to quote $H_0$?`,
      visual: degeneracy('Schematic: the 68% contour in (M, H₀). Along the dashed line, a fainter M (less negative) and a larger H₀ give the same apparent magnitudes.'),
      choices: [
        t`Treat $M$ as a nuisance parameter — profile (minimize over it) or marginalize (integrate over it) — and note that the result is only as good as the calibration of $M$`,
        t`Fix $M$ at a convenient value and quote the narrow width of $H_0$ along that slice`,
        t`Quote $H_0$ from the centre of the ellipse with no uncertainty`,
        t`Ignore $M$ since it is not the parameter of interest`,
      ],
      answer: 0,
      why: { 1: 'A slice at fixed M ignores how far M can move: the width is falsely small.', 2: 'The ellipse’s length is the uncertainty.', 3: 'Ignoring M means fixing it silently — the same mistake.' },
      hints: ['Along the ellipse, M and H₀ trade off against each other.', 'What has to break the degeneracy?'],
      teach: 'Nuisance parameters must be profiled or marginalized, and degeneracies are broken only by independent information.',
      explain: t`Supernovae alone fix only a combination of $M$ and $H_0$. Cepheid-calibrated distances to nearby supernovae pin $M$ and break the degeneracy — exactly the SH0ES method you will reproduce in [the Pantheon+ project](#/lesson/research.P.2).`,
    }),
    code({
      id: 'truncated', difficulty: 3,
      prompt: t`Find the maximum-likelihood muon lifetime from the decay times in the starter, which were recorded only below $T = 5\ \mu\text{s}$. Write \`nll(tau)\`, the negative log-likelihood of the truncated exponential

$$p(t \mid \tau) = \frac{e^{-t/\tau}/\tau}{1 - e^{-T/\tau}},$$

then set \`tau_hat\` to its minimizer (for example with \`scipy.optimize.minimize_scalar\` and \`bounds=(0.5, 10)\`, \`method="bounded"\`).`,
      starter: t`import numpy as np
from scipy.optimize import minimize_scalar

t = np.array([${TIMES.join(', ')}])
T = 5.0

def nll(tau):
    # minus the sum over decays of log p(t | tau)
    pass

tau_hat = None
print("naive mean:", t.mean(), " MLE:", tau_hat)
`,
      answer: t`import numpy as np
from scipy.optimize import minimize_scalar

t = np.array([${TIMES.join(', ')}])
T = 5.0

def nll(tau):
    return np.sum(np.log(tau) + t / tau + np.log(1 - np.exp(-T / tau)))

tau_hat = minimize_scalar(nll, bounds=(0.5, 10), method="bounded").x
print("naive mean:", t.mean(), " MLE:", tau_hat)
`,
      tests: [
        { name: 'nll grows as tau moves away from the minimum', code: 'nll(2.0) > nll(3.0) and nll(6.0) > nll(3.0)' },
        { name: `tau_hat ≈ ${TAU.toFixed(2)} μs`, code: `abs(tau_hat - ${TAU.toFixed(4)}) < 0.01` },
        { name: 'the MLE lies above the biased sample mean', code: 'tau_hat > t.mean() + 0.5' },
      ],
      hints: [t`Each decay contributes $-\ln p = \ln\tau + t/\tau + \ln(1 - e^{-T/\tau})$.`, t`\`return np.sum(np.log(tau) + t/tau + np.log(1 - np.exp(-T/tau)))\`, then \`minimize_scalar(nll, bounds=(0.5, 10), method="bounded").x\`.`],
      teach: 'Put the selection into the likelihood, and the estimate corrects itself.',
      explain: t`The minimizer is $${TAU.toFixed(2)}\ \mu\text{s}$, well above the sample mean $${NAIVE.toFixed(2)}$: the window removed the long decays, and the normalization term $\ln(1 - e^{-T/\tau})$ puts them back statistically.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rate', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.int(5, 8), counts = Array.from({ length: k }, () => r.int(0, 4));
        if (counts.every((c) => c === 0)) counts[1] = 1;
        const n = counts.reduce((a, b) => a + b, 0), ans = n / (k * 10);
        return {
          prompt: t`A star tracker on a satellite registers radiation hits on its sensor in ${k} ten-second windows: ${counts.join(', ')}. Assuming a constant Poisson rate, what is the maximum-likelihood hit rate, in hits per second?`,
          visual: poissonPic(k, n, [0.02, Math.max(4, 2.5 * n / k)], 'Δ(−2 ln L) for the windows together, against the mean count per window.'),
          answer: ans, units: '1/s', tol: { rel: 0.01 },
          errors: [{ value: n / k, feedback: 'That is per ten-second window; convert to per second.' }],
          hints: ['The Poisson MLE of the mean is the average count.', 'Then divide by the window length.'],
          teach: 'For Poisson counts, the maximum-likelihood rate is total counts over total time.',
          explain: t`$${n}$ hits in $${k * 10}$ s: $\hat r = ${ans.toFixed(4)}\ \text{s}^{-1}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-gw', difficulty: 3,
      prompt: t`For a gravitational-wave source, a distant binary seen face-on and a nearer one seen edge-on produce signals of similar amplitude. What does this do to the likelihood for the distance?`,
      visual: degeneracy('The same shape of problem: a long, thin contour along a degeneracy (schematic, drawn here for supernovae).'),
      choices: [
        'It is stretched along a degeneracy between distance and inclination, so the distance uncertainty is large unless something else constrains the inclination',
        'It becomes two separate sharp peaks',
        'It makes the distance exact, since two configurations agree',
        'It has no effect, since distance and inclination are independent parameters',
      ],
      answer: 0,
      why: { 1: 'The degeneracy is continuous, not two isolated solutions.', 2: 'Agreement between configurations is exactly what makes the data unable to choose.', 3: 'They are independent as parameters but not in their effect on the data.' },
      hints: ['A face-on binary radiates more strongly toward us than an edge-on one.', 'If two different parameter sets predict the same data, can the data tell them apart?'],
      teach: 'When parameters trade off in their effect on the data, the likelihood stretches along the trade-off and the marginal uncertainties grow.',
      explain: 'GW150914’s distance, 410 (+160, −180) Mpc, is wide for exactly this reason. An electromagnetic counterpart, as for the neutron-star merger GW170817, can pin the inclination or the distance and break the degeneracy.',
    }),
    mcq({
      id: 'cp-gof', difficulty: 2,
      prompt: t`You find the maximum-likelihood parameters of a model. Does that tell you the model fits the data well?`,
      visual: muonPic('A likelihood curve always has a minimum — whether or not the model is right.', { marks: false }),
      choices: [
        'No: estimation finds the best parameters within the model; whether the model fits needs a separate goodness-of-fit check (residuals, χ² per degree of freedom, a posterior predictive test)',
        'Yes: the maximum likelihood is by definition a good fit',
        'Yes, if the uncertainty is small',
        'No, and nothing can tell you',
      ],
      answer: 0,
      why: { 1: 'The best of a bad family of models is still bad.', 2: 'A wrong model can give a sharply peaked, very wrong answer.', 3: 'Goodness-of-fit tests exist and should be run.' },
      hints: ['Would a wrong model still have a best-fitting parameter?'],
      teach: 'Estimation and goodness of fit are different questions; answer both.',
      explain: t`Check residuals and $\chi^2$ per degree of freedom — see [χ² and reduced χ²](#/lesson/lab.A6.1) and [curve_fit with honest uncertainties](#/lesson/prog.P14.1) — and, for a selection effect like the muon window, check that simulated data under the fitted model look like the real data.`,
    }),
  ],
  sources: [SRC.hogg, SRC.pdgStats, SRC.trotta],
});
