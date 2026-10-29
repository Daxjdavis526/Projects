// Estimation and likelihood. The likelihood L(θ) = p(d | θ) read as a
// function of the parameter; the maximum-likelihood estimate and its error bar
// from the curvature of ln L (Fisher information), with the Δln L = ½ rule
// and its asymmetric intervals for few events (decay times: ln L(τ) =
// −N ln τ − Nt̄/τ, τ̂ = t̄, σ = τ̂/√N, exact interval [0.66, 1.62]τ̂ at N = 5);
// a Poisson rate from counting windows (worked: 46 counts in 50 s →
// 0.92 ± 0.136 /s); −2 ln L = χ² for Gaussian errors, so Δχ² = 1 is 1σ;
// the MLE of a variance is biased by (N − 1)/N; 1/√N scaling; likelihood is
// not a density in θ. A NumPy exercise scans ln L on a grid. Transfer:
// a merger rate limited by counting statistics, a fitted slope from a χ²
// parabola. Overlaps: lab A4–A6 (weighted means, χ², least squares), prog P14
// (curve_fit) are linked, not repeated.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;

// ln L(τ) − ln L(τ̂) for N decay times with mean tb, and its parabola
const lnL = (N, tb) => `-${N}*ln(x/${tb}) - ${N}*${tb}/x + ${N}`;
const parab = (N, tb) => `-(x - ${tb})^2*${N}/(2*${tb}^2)`;
const lnLGraph = (N, tb, extra = {}) => ({
  type: 'graph',
  params: {
    x: [0.2 * tb, 2.4 * tb], y: [-3, 0.4], aspect: 'wide', axesAt: 'edge', xlabel: 'τ (μs)', ylabel: 'ln L − ln L(max)',
    curves: [{ fn: lnL(N, tb), color: 'accent', width: 2.2, domain: [0.05 * tb, 3 * tb] }],
    hlines: [{ y: -0.5, color: 'gold', label: '−½' }],
    ...extra,
  },
});

export default lesson({
  id: 'st-g.G4.2',
  title: 'Estimation and likelihood',
  minutes: 18, difficulty: 3,
  intro: t`Fix the data you recorded and ask how probable they were for each value of a parameter: that function of the parameter is the **likelihood**, $L(\theta) = p(d \mid \theta)$. The **maximum-likelihood estimate** $\hat\theta$ is where it peaks, and how sharply it peaks is the error bar:

$$\begin{gathered}\hat\theta = \operatorname*{arg\,max}_\theta\ \ln L(\theta) \\ \frac{1}{\sigma_{\hat\theta}^2} \approx -\frac{d^2\ln L}{d\theta^2}\bigg|_{\hat\theta}\end{gathered}$$

A sharp peak means the data pin $\theta$ down; a flat one means many values explain them equally well. For Gaussian errors, $-2\ln L$ is the familiar $\chi^2$, so least squares ([fitting a straight line](#/lesson/lab.A5.1), [curve_fit](#/lesson/prog.P14.1)) is maximum likelihood in disguise. In [the previous lesson](#/lesson/st-g.G4.1) the likelihood was one factor of Bayes’ theorem; here it does the work on its own.`,
  symbols: [
    { tex: '\\theta', text: 'the parameter being estimated: a lifetime, a rate, a mass' },
    { tex: 'L(\\theta)', text: t`the likelihood $p(d \mid \theta)$, read as a function of $\theta$ with the data $d$ held fixed. It is **not** a probability distribution for $\theta$.` },
    { tex: '\\ln L', text: t`its natural logarithm: products over independent data points become sums, and the peak is in the same place` },
    { tex: '\\hat\\theta', text: t`the maximum-likelihood estimate: the $\theta$ that makes the observed data most probable` },
    { tex: '\\operatorname{arg\\,max}', text: t`“the argument that maximizes”: the value of $\theta$ at the peak, not the peak height` },
    { tex: '\\sigma_{\\hat\\theta}', text: t`the standard error of the estimate, from the curvature of $\ln L$ at its peak (the Fisher information)` },
  ],
  why: 'Every measured parameter of a gravitational-wave source, a pulsar or a particle starts from a likelihood; its peak is the estimate and its curvature the error bar that the next lesson turns into a posterior.',
  visual: {
    type: 'graph',
    title: 'Error bars from a curve’s sharpness',
    lead: t`$N$ muons stop in a detector and decay at times $t_1, \dots, t_N$, with mean $\bar t$. Each time has density $e^{-t/\tau}/\tau$, so $\ln L(\tau) = -N\ln\tau - N\bar t/\tau$. Blue: $\ln L$ measured from its peak. Dashed: the parabola with the same curvature. Gold: the level $-\tfrac12$, which marks the $1\sigma$ interval.`,
    tasks: [
      t`At $N = 5$ the blue curve is lopsided: where it crosses $-\tfrac12$ gives an interval reaching much further up than down. The parabola’s symmetric $\pm\bar t/\sqrt N$ misplaces it.`,
      t`Raise $N$ to $200$: the curve narrows like $1/\sqrt N$ and becomes a parabola — the large-sample limit where $\hat\tau \pm \hat\tau/\sqrt N$ is the whole story.`,
      t`Change $\bar t$: the peak moves with it. The estimate is the sample mean, $\hat\tau = \bar t$.`,
    ],
    params: {
      x: [0, 6], y: [-3, 0.4], aspect: 'wide', axesAt: 'edge', xlabel: 'τ (μs)', ylabel: 'ln L − ln L(max)',
      sliders: [
        { key: 'N', label: 'Number of decays $N$', min: 3, max: 200, step: 1, value: 5, explain: 'More events, more information: the peak sharpens.' },
        { key: 'tb', label: t`Mean decay time $\bar t$`, min: 1.5, max: 3, step: 0.01, value: 2.2, unit: '\\mu\\text{s}', explain: t`The average of the recorded times — all the likelihood needs from them.` },
      ],
      curves: [
        { fn: '-N*ln(x/tb) - N*tb/x + N', color: 'accent', width: 2.4, domain: [0.15, 6] },
        { fn: '-(x - tb)^2*N/(2*tb^2)', color: 'ink2', width: 1.6, dash: true },
      ],
      hlines: [{ y: -0.5, color: 'gold', label: '−½' }],
      vlines: [{ x: 'tb', color: 'ink3' }],
      legend: [{ label: 'ln L', color: 'accent' }, { label: 'parabola', color: 'ink2', dash: true }], legendAt: 'br',
      readouts: [
        { label: t`$\hat\tau = \bar t$`, expr: 'tb', unit: '\\mu\\text{s}', digits: 3 },
        { label: t`curvature $\sigma = \hat\tau/\sqrt N$`, expr: 'tb/sqrt(N)', unit: '\\mu\\text{s}', digits: 3 },
      ],
    },
    caption: t`Exact log-likelihood for exponential decay times, shifted so its peak is $0$. No background events and perfect timing are assumed; a real muon-lifetime measurement fits a background term too.`,
  },
  example: {
    prompt: t`A gamma-ray detector records $7, 12, 9, 10, 8$ counts in five windows of $10\ \text{s}$ each. Counts are Poisson with mean $rT$ for an unknown rate $r$. Find the maximum-likelihood rate and its standard error from the curvature.`,
    visual: { type: 'graph', params: { x: [0.4, 1.5], y: [-3, 0.4], aspect: 'wide', axesAt: 'edge', xlabel: 'rate r (counts/s)', ylabel: 'ln L − ln L(max)', curves: [{ fn: '46*ln(x/0.92) - 50*(x - 0.92)', color: 'accent', width: 2.2 }, { fn: '-(x - 0.92)^2/(2*0.1356^2)', color: 'ink2', width: 1.5, dash: true }], hlines: [{ y: -0.5, color: 'gold', label: '−½' }], vlines: [{ x: 0.92, color: 'ink3', label: 'r̂ = 0.92' }] }, caption: t`The log-likelihood of the rate for these five windows (blue) and its parabola (dashed). With $46$ counts the two already agree closely.` },
    steps: [
      { label: 'Write the likelihood', text: t`Each window: $p(k_i \mid r) = \dfrac{(rT)^{k_i}e^{-rT}}{k_i!}$. Independent windows multiply, so logs add: $\ln L(r) = \sum_i\bigl(k_i\ln(rT) - rT\bigr) + \text{const}$.` },
      { label: 'Maximize', text: t`$\dfrac{d\ln L}{dr} = \dfrac{\sum k_i}{r} - nT = 0$, so $\hat r = \dfrac{\sum k_i}{nT} = \dfrac{46}{50\ \text{s}} = 0.92\ \text{s}^{-1}$: total counts over total time, as intuition says.` },
      { label: 'Curvature', text: t`$\dfrac{d^2\ln L}{dr^2} = -\dfrac{\sum k_i}{r^2}$. At $\hat r$ that is $-\dfrac{(nT)^2}{\sum k_i}$, so $\sigma_{\hat r} = \dfrac{\sqrt{\sum k_i}}{nT}$.` },
      { label: 'Numbers', text: t`$\sigma_{\hat r} = \sqrt{46}/50 = 0.136\ \text{s}^{-1}$: $r = 0.92 \pm 0.14$ counts per second, a $15\%$ measurement. It is $\sqrt N$ counting error, derived rather than assumed.` },
      { label: 'Sense check', text: t`The Poisson model predicts a scatter of $\sqrt{9.2} \approx 3.0$ counts per window; these five windows scatter by $1.9$ (sample standard deviation) — unremarkable for five numbers. The likelihood’s error bar comes from the model, not from that noisy scatter.` },
    ],
    answer: t`$\hat r = 46/50 = 0.92\ \text{s}^{-1}$ with $\sigma_{\hat r} = \sqrt{46}/50 = 0.14\ \text{s}^{-1}$.`,
  },
  practice: [
    num({
      id: 'mle-tau', difficulty: 1,
      gen(r) {
        const N = r.pick([8, 10, 12, 16, 20]), tb = r.float(1.9, 2.6, 0.01), S = +(N * tb).toFixed(2);
        const ans = S / N;
        return {
          prompt: t`$${N}$ muon decay times add up to $${S}\ \mu\text{s}$. For exponential decay, $\ln L(\tau) = -N\ln\tau - \tfrac{1}{\tau}\sum t_i$. What is the maximum-likelihood lifetime $\hat\tau$?`,
          visual: { ...lnLGraph(N, ans), caption: t`$\ln L(\tau)$ for these data, measured from its peak (the peak is what you are finding).` },
          answer: ans, units: 'us', tol: { rel: 0.005 },
          errors: [{ value: S, feedback: t`That is the total time. Set $d\ln L/d\tau = -N/\tau + \sum t_i/\tau^2 = 0$.` }, { value: N / S, feedback: t`That is the decay **rate** $1/\hat\tau$. The lifetime is its reciprocal.` }],
          hints: [t`Differentiate: $\dfrac{d\ln L}{d\tau} = -\dfrac{N}{\tau} + \dfrac{\sum t_i}{\tau^2}$.`, t`Setting it to zero gives $\hat\tau = \sum t_i/N$.`],
          teach: 'For exponential decay the maximum-likelihood lifetime is the sample mean of the decay times.',
          explain: t`$\hat\tau = ${S}/${N} = ${nice(ans, 4)}\ \mu\text{s}$. The muon’s accepted lifetime is $2.197\ \mu\text{s}$; with $${N}$ events the error bar is about $\hat\tau/\sqrt{${N}} \approx ${nice(ans / Math.sqrt(N), 2)}\ \mu\text{s}$.`,
        };
      },
    }),
    num({
      id: 'curvature-sigma', difficulty: 2,
      gen(r) {
        const N = r.pick([25, 50, 64, 100, 400]), tb = r.pick([2.1, 2.2, 2.25, 2.3]);
        const ans = tb / Math.sqrt(N);
        return {
          prompt: t`With $N = ${N}$ decay times of mean $\bar t = ${tb}\ \mu\text{s}$, the second derivative of $\ln L(\tau) = -N\ln\tau - N\bar t/\tau$ at its peak $\hat\tau = \bar t$ is $-N/\hat\tau^2$. What standard error does the curvature give for $\hat\tau$?`,
          visual: { ...lnLGraph(N, tb, { x: [tb * (1 - 4 / Math.sqrt(N)), tb * (1 + 4 / Math.sqrt(N))] }), caption: t`$\ln L$ near its peak. Where it falls by $\tfrac12$ marks about one standard error each side.` },
          answer: ans, units: 'us', tol: { rel: 0.005 },
          errors: [{ value: tb / N, feedback: t`$\sigma^2 = \hat\tau^2/N$, so $\sigma = \hat\tau/\sqrt N$, not $\hat\tau/N$.` }, { value: (tb * tb) / N, feedback: t`That is the variance $\sigma^2$. Take the square root.` }],
          hints: [t`$1/\sigma^2 = -d^2\ln L/d\tau^2 = N/\hat\tau^2$.`, t`$\sigma = \hat\tau/\sqrt N$.`],
          teach: t`The standard error is $1/\sqrt{\text{curvature}}$ of $-\ln L$ at the peak: more data, sharper peak, smaller error, falling as $1/\sqrt N$.`,
          explain: t`$\sigma = ${tb}/\sqrt{${N}} = ${nice(ans, 3)}\ \mu\text{s}$. Each event carries the same information, so the information adds up to $N/\tau^2$ and the error falls as $1/\sqrt N$.`,
        };
      },
    }),
    mcq({
      id: 'delta-half', difficulty: 2,
      prompt: t`With Gaussian measurement errors, $-2\ln L(\theta) = \chi^2(\theta) + \text{const}$. The $1\sigma$ interval is where $\chi^2$ rises by $1$ above its minimum. How far does $\ln L$ fall below its maximum there?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.3, 4.6], aspect: 'wide', axesAt: 'edge', xlabel: '(θ − θ̂)/σ', ylabel: 'Δχ²', curves: [{ fn: 'x^2', color: 'accent', width: 2.2, label: 'Δχ² = ((θ − θ̂)/σ)²', labelAt: 1.6, labelDx: 8, labelDy: 0 }], hlines: [{ y: 1, color: 'gold', label: 'Δχ² = 1' }], vlines: [{ x: -1, color: 'ink3' }, { x: 1, color: 'ink3' }] }, caption: t`For one Gaussian parameter, $\Delta\chi^2$ is an exact parabola; it reaches $1$ at $\pm1\sigma$.` },
      choices: [t`By $\tfrac12$: $\Delta\ln L = -\tfrac12\Delta\chi^2$`, t`By $1$, the same as $\chi^2$`, t`By $2$, since $\chi^2 = -2\ln L$ means $\ln L$ moves twice as far`, t`By $e^{-1/2}$, since the likelihood falls by that factor`],
      answer: 0,
      why: {
        1: t`$\ln L = -\tfrac12\chi^2 + \text{const}$: the log-likelihood moves half as far as $\chi^2$, not the same.`,
        2: t`The factor runs the other way: $\chi^2$ is $-2$ times $\ln L$, so $\ln L$ moves **half** as far.`,
        3: t`The likelihood itself falls by the factor $e^{-1/2} \approx 0.61$; its logarithm falls by $\tfrac12$. The question asked about $\ln L$.`,
      },
      hints: [t`Divide $-2\ln L = \chi^2 + c$ by $-2$.`],
      teach: t`For one parameter, the $1\sigma$ interval is where $\ln L$ is $\tfrac12$ below its peak, equivalently where $\chi^2$ is $1$ above its minimum.`,
      explain: t`$\Delta\ln L = -\tfrac12\Delta\chi^2 = -\tfrac12$. When $\ln L$ is not a parabola (few events), the $\Delta\ln L = \tfrac12$ crossings still give a sensible, asymmetric interval. For $\chi^2$ and its goodness of fit, see [χ² and reduced χ²](#/lesson/lab.A6.1).`,
    }),
    num({
      id: 'variance-bias', difficulty: 3,
      gen(r) {
        const N = r.pick([3, 4, 5, 8]), s = r.pick([2, 3, 0.5]);
        const ans = ((N - 1) / N) * s * s;
        return {
          prompt: t`The maximum-likelihood estimate of a Gaussian variance from $N$ points is $\hat\sigma^2 = \tfrac1N\sum(x_i - \bar x)^2$ — using the sample mean, not the true one. Averaged over many repeats, its expected value is $\tfrac{N - 1}{N}\sigma^2$. For $N = ${N}$ points drawn with true $\sigma = ${s}$, what does $\hat\sigma^2$ average to?`,
          visual: { type: 'graph', params: { x: [1, 20], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'N (points)', ylabel: 'mean of σ̂² ÷ σ²', curves: [{ fn: '(x - 1)/x', color: 'accent', width: 2.2, domain: [2, 20] }], hlines: [{ y: 1, color: 'ink3', label: 'unbiased' }] }, caption: t`The maximum-likelihood variance falls short by the factor $(N - 1)/N$: badly for a handful of points, negligibly for many.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: s * s, feedback: t`That would be an unbiased estimator. Measuring spread about $\bar x$, which sits among the data, makes it come out small on average.` }, { value: ((N - 1) / N) * s, feedback: t`The factor multiplies the variance $\sigma^2 = ${s * s}$, not $\sigma$.` }],
          hints: [t`$\sigma^2 = ${s * s}$.`, t`Multiply by $(N - 1)/N = ${N - 1}/${N}$.`],
          teach: 'Maximum likelihood is not always unbiased: the MLE of a variance divides by N and comes out small by (N − 1)/N; dividing by N − 1 (Bessel’s correction) fixes it.',
          explain: t`$\tfrac{${N - 1}}{${N}}\times${s * s} = ${nice(ans, 4)}$. The sample mean is fitted to the same data, using up one degree of freedom. Bias of order $1/N$ is typical of MLEs and vanishes for large samples.`,
        };
      },
    }),
    num({
      id: 'root-n', difficulty: 2,
      gen(r) {
        const N0 = r.pick([400, 1000, 2500]), p0 = r.pick([5, 4, 2]), p1 = r.pick([1, 0.5]);
        const ans = N0 * (p0 / p1) ** 2;
        return {
          prompt: t`A lifetime measured from $${N0}$ decays has a $${p0}\%$ statistical error. How many decays would bring it to $${p1}\%$, if nothing else changes?`,
          visual: { type: 'graph', params: { x: [Math.log10(N0) - 0.5, Math.log10(ans) + 0.5], y: [-1, 1.2], xlog: true, ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'number of decays', ylabel: 'error (%)', curves: [{ fn: `log10(${p0}) - 0.5*(x - log10(${N0}))`, color: 'accent', width: 2.2 }], points: [{ x: Math.log10(N0), y: Math.log10(p0), color: 'accent', label: `${p0}% at ${N0}` }], hlines: [{ y: Math.log10(p1), color: 'gold', label: `${p1}%` }] }, caption: t`Statistical error against sample size on log–log axes: a straight line of slope $-\tfrac12$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: N0 * (p0 / p1), feedback: t`The error falls as $1/\sqrt N$, not $1/N$: to divide it by $${p0 / p1}$ you need $${p0 / p1}^2$ times the data.` }],
          hints: [t`$\sigma \propto 1/\sqrt N$, so $N \propto 1/\sigma^2$.`, t`$N_1 = N_0\,(${p0}/${p1})^2$.`],
          teach: 'Statistical errors fall as 1/√N: each extra digit of precision costs a hundred times the data.',
          explain: t`$${N0}\times(${p0}/${p1})^2 = ${ans}$ decays. Past some point systematic errors — timing calibration, background — stop falling with $N$ and dominate.`,
        };
      },
    }),
    mcq({
      id: 'not-density', difficulty: 3,
      prompt: t`After $5$ decays with $\bar t = 2.2\ \mu\text{s}$, a student normalizes $L(\tau)$ so its area over $\tau$ is $1$ and calls the result “the probability distribution of $\tau$”. What is wrong with that?`,
      visual: { ...lnLGraph(5, 2.2), caption: t`$\ln L(\tau)$ for five decays. As a function of $\tau$ it has no reason to have unit area.` },
      choices: [
        t`Nothing is wrong in general, but it silently assumes a flat prior in $\tau$: in $1/\tau$ (the decay rate) the same recipe gives a different answer`,
        t`Likelihoods always have area $1$ in $\theta$ already, so normalizing changes nothing`,
        t`A likelihood can never be turned into anything about $\tau$; only frequentist intervals are allowed`,
        t`The likelihood must be squared first, as in quantum mechanics`,
      ],
      answer: 0,
      why: {
        1: t`$L(\theta) = p(d \mid \theta)$ is normalized over the **data**, not over $\theta$. Its area in $\theta$ is anything.`,
        2: t`Bayes’ theorem does exactly this turn — with a prior. The error is leaving the prior unstated, not making the turn.`,
        3: t`Probabilities are not squared amplitudes here; there is no wavefunction in classical inference.`,
      },
      hints: [t`Over which variable does $p(d \mid \tau)$ integrate to $1$?`, t`Normalizing in $\tau$ is Bayes with a prior. Which prior? Would it be the same in the variable $1/\tau$?`],
      teach: 'A likelihood is a probability of the data, not a density for the parameter; turning it into one means multiplying by a prior, which depends on the variable chosen.',
      explain: t`Normalizing $L(\tau)\,d\tau$ is the posterior for a prior flat in $\tau$. A prior flat in the rate $\lambda = 1/\tau$ is $\propto 1/\tau^2$ in $\tau$ (the Jacobian of the last lesson) and gives a different posterior. With many events the choice stops mattering; with five it does not.`,
    }),
    code({
      id: 'grid-likelihood', difficulty: 3,
      prompt: t`The program simulates $N = 50$ decay times with true lifetime $2.197\ \mu\text{s}$. Write \`log_like(tau, t)\` returning $\ln L(\tau) = -N\ln\tau - \sum t_i/\tau$ for an array of trial lifetimes \`tau\`. The program then finds $\hat\tau$ on a grid and the $1\sigma$ interval where $\ln L$ is within $\tfrac12$ of its peak, and compares it with $\hat\tau \pm \hat\tau/\sqrt N$.`,
      starter: t`import numpy as np

rng = np.random.default_rng(7)
t = rng.exponential(2.197, 50)

def log_like(tau, t):
    # ln L for every trial lifetime in the array tau
    pass

tau = np.linspace(1.0, 4.0, 30001)
ll = log_like(tau, t)
tau_hat = tau[np.argmax(ll)]
inside = tau[ll >= ll.max() - 0.5]
lo, hi = inside.min(), inside.max()
print(f"tau_hat = {tau_hat:.3f} us, interval {lo:.3f} to {hi:.3f}")
print(f"mean = {t.mean():.3f}, curvature error = {tau_hat/np.sqrt(len(t)):.3f}")
`,
      answer: t`import numpy as np

rng = np.random.default_rng(7)
t = rng.exponential(2.197, 50)

def log_like(tau, t):
    return -len(t) * np.log(tau) - t.sum() / tau

tau = np.linspace(1.0, 4.0, 30001)
ll = log_like(tau, t)
tau_hat = tau[np.argmax(ll)]
inside = tau[ll >= ll.max() - 0.5]
lo, hi = inside.min(), inside.max()
print(f"tau_hat = {tau_hat:.3f} us, interval {lo:.3f} to {hi:.3f}")
print(f"mean = {t.mean():.3f}, curvature error = {tau_hat/np.sqrt(len(t)):.3f}")
`,
      tests: [
        { name: 'log_like returns one value per trial lifetime', code: 'np.shape(log_like(np.array([1.0, 2.0, 3.0]), t)) == (3,)' },
        { name: 'the grid maximum is the sample mean', code: 'abs(tau_hat - t.mean()) < 2e-4' },
        { name: 'the interval is within 15% of 2τ̂/√N wide', code: 'abs((hi - lo) / (2 * tau_hat / np.sqrt(50)) - 1) < 0.15' },
        { name: 'the interval reaches further up than down', code: '(hi - tau_hat) > (tau_hat - lo)' },
      ],
      hints: [t`NumPy broadcasts: \`np.log(tau)\` works on the whole array, and \`t.sum()\` is one number.`, t`\`return -len(t) * np.log(tau) - t.sum() / tau\``],
      teach: 'Scanning ln L on a grid finds the estimate and its Δln L = ½ interval without any calculus — the brute-force method that still works when no formula exists.',
      explain: t`The peak lands on the sample mean, and the interval is close to $\hat\tau \pm \hat\tau/\sqrt{50}$ but tilted upward: $\ln L$ falls off more slowly toward long lifetimes. With a background term or detector dead time, the same grid scan still works where no closed form does.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-merger-rate', difficulty: 2, transfer: true,
      gen(r) {
        const n = r.pick([9, 16, 25, 49, 64, 100]);
        const ans = 100 / Math.sqrt(n);
        return {
          prompt: t`A gravitational-wave catalogue holds $n = ${n}$ binary black-hole detections, and a population study infers a merger rate proportional to $n$. Treating $n$ as a Poisson count (likelihood $\propto \lambda^n e^{-\lambda}$), what fractional statistical error, in percent, does counting alone put on the rate?`,
          visual: { type: 'graph', params: { x: [Math.max(0, n - 4 * Math.sqrt(n)), n + 4 * Math.sqrt(n)], y: [-3, 0.4], aspect: 'wide', axesAt: 'edge', xlabel: 'expected count λ', ylabel: 'ln L − ln L(max)', curves: [{ fn: `${n}*ln(x/${n}) - (x - ${n})`, color: 'accent', width: 2.2 }], hlines: [{ y: -0.5, color: 'gold', label: '−½' }] }, caption: t`The Poisson log-likelihood of the expected count, for $${n}$ detections. Selection effects and the population model add errors not shown.` },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 / n, feedback: t`The standard error of a count is $\sqrt n$, so the fractional error is $\sqrt n/n = 1/\sqrt n$, not $1/n$.` }],
          hints: [t`$\hat\lambda = n$ and $-d^2\ln L/d\lambda^2 = n/\lambda^2$ at the peak.`, t`$\sigma_\lambda = \sqrt n$, so the fractional error is $1/\sqrt{${n}}$.`],
          teach: 'A rate inferred from n events carries at least a 1/√n fractional counting error, however perfect the detector.',
          explain: t`$1/\sqrt{${n}} = ${nice(ans, 3)}\%$. Real rate estimates also fold in the uncertain sensitive volume and the assumed mass distribution, which widen them.`,
        };
      },
    }),
    num({
      id: 'cp-chi2-slope', difficulty: 3,
      gen(r) {
        const A = r.pick([25, 100, 400, 2500]), m0 = r.pick([3.1, 9.79, 0.52]), cmin = r.pick([8.4, 11.2]);
        const ans = 1 / Math.sqrt(A);
        return {
          prompt: t`A straight-line fit’s $\chi^2$, minimized over the intercept for each trial slope $m$, is $\chi^2(m) = ${cmin} + ${A}\,(m - ${m0})^2$. What is the $1\sigma$ uncertainty on the slope?`,
          visual: { type: 'graph', params: { x: [m0 - 3 / Math.sqrt(A), m0 + 3 / Math.sqrt(A)], y: [cmin - 1, cmin + 9], aspect: 'wide', axesAt: 'edge', xlabel: 'slope m', ylabel: 'χ²', curves: [{ fn: `${cmin} + ${A}*(x - ${m0})^2`, color: 'accent', width: 2.2 }], hlines: [{ y: cmin, color: 'ink3', label: 'χ² min' }] }, caption: t`The profile $\chi^2$ against the slope.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / A, feedback: t`Solve $${A}\,\Delta m^2 = 1$: $\Delta m = 1/\sqrt{${A}}$, not $1/${A}$.` }, { value: 1 / Math.sqrt(2 * A), feedback: t`That uses $\Delta\chi^2 = \tfrac12$. The $\tfrac12$ belongs to $\Delta\ln L$; for $\chi^2$ it is $1$.` }],
          hints: [t`The $1\sigma$ interval is where $\chi^2$ rises by $1$.`, t`$${A}(m - ${m0})^2 = 1$.`],
          teach: t`$\Delta\chi^2 = 1$ marks $1\sigma$ for one parameter, with the others re-minimized at each value (a profile).`,
          explain: t`$\Delta m = 1/\sqrt{${A}} = ${nice(ans, 3)}$, so $m = ${m0} \pm ${nice(ans, 3)}$. The value of $\chi^2_{\min}$ tests the fit’s quality; only the rise above it sets the error bar.`,
        };
      },
    }),
    mcq({
      id: 'cp-asymmetric', difficulty: 3,
      prompt: t`From only $4$ decays with $\bar t = 2.0\ \mu\text{s}$, the $\Delta\ln L = \tfrac12$ interval is about $1.3$ to $3.5\ \mu\text{s}$, while the curvature rule gives $2.0 \pm 1.0\ \mu\text{s}$. Which should you report, and why?`,
      visual: { ...lnLGraph(4, 2.0, { curves: [{ fn: lnL(4, 2.0), color: 'accent', width: 2.2, domain: [0.1, 6] }, { fn: parab(4, 2.0), color: 'ink2', width: 1.5, dash: true }] }), caption: t`Blue: $\ln L$ for four decays. Dashed: the parabola with the same curvature at the peak.` },
      choices: [
        t`The asymmetric interval: $\ln L$ is far from a parabola, and the crossings at $-\tfrac12$ follow its real shape`,
        t`The symmetric one: error bars must be symmetric by definition`,
        t`Neither: with four events no interval can be quoted`,
        t`The symmetric one, because it is exact while the crossing method is approximate`,
      ],
      answer: 0,
      why: {
        1: t`Error bars need not be symmetric; when $\ln L$ is lopsided, a symmetric bar misplaces the plausible region.`,
        2: t`Few events give wide intervals, not no intervals. The crossing method handles small samples sensibly.`,
        3: t`The curvature rule is the approximation: it replaces $\ln L$ by a parabola. With four events that is poor.`,
      },
      hints: [t`Compare the blue curve with the dashed parabola.`, 'Which method uses the real shape of ln L?'],
      teach: t`When $\ln L$ is not parabolic, quote the asymmetric $\Delta\ln L = \tfrac12$ interval, $\hat\tau\,{}^{+\sigma_+}_{-\sigma_-}$.`,
      explain: t`Report $2.0^{+1.5}_{-0.7}\ \mu\text{s}$. The lower edge cannot go near $0$ (four decays spread over microseconds rule out tiny lifetimes) while long lifetimes stay plausible. Gravitational-wave catalogues quote masses the same way, with asymmetric errors.`,
    }),
  ],
  sources: [
    { label: 'Cowan, Statistical Data Analysis (Oxford, 1998), chs. 6–7', url: 'https://openlibrary.org/search?q=Cowan+Statistical+Data+Analysis' },
    { label: 'Particle Data Group, Review of Particle Physics: Statistics (2024)', url: 'https://pdg.lbl.gov/2024/reviews/rpp2024-rev-statistics.pdf' },
    { label: 'Hogg, Bovy & Lang, Data analysis recipes: fitting a model to data (2010)', url: 'https://arxiv.org/abs/1008.4686' },
  ],
});
