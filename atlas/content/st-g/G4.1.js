// Distributions and Bayes’ theorem. A density is probability per unit, so
// probabilities are areas and a density can exceed 1; Bayes’ theorem in odds
// form (posterior odds = likelihood ratio × prior odds) on a kaon tagger with
// natural frequencies; the base-rate trap (gamma/hadron separation); the
// prosecutor’s fallacy p(d|noise) ≠ p(noise|d); Gaussian tails on a log axis
// (one-sided 5σ = 2.87×10⁻⁷); a Gaussian prior times a Gaussian likelihood as
// a precision-weighted mean (the Kalman update of a star tracker); densities
// change with a Jacobian (y = x²), so “uniform” depends on the variable — a
// source distance uniform in volume has p(D) ∝ D² and only 1/8 of sources
// within half the horizon. Transfer: look-elsewhere (1 − (1 − p)^N).
// Overlaps: lab A2 (mean, normal, Poisson) and A4.2 (p-values), prog P13
// (Monte Carlo) are linked, not repeated. Numbers from _sg2.js (erfc).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { normalSf } from './_sg2.js';

const t = String.raw;
const LN10 = Math.LN10;
// log₁₀ of the standard normal density, as a graph expression
const LOGPHI = `-x^2/(2*${LN10}) - ${Math.log10(Math.sqrt(2 * Math.PI))}`;

// Three bars: the population, the tagged part of it (same scale), and the tagged part rescaled to 1.
const bars = (q, eff, mis, extra = {}, rescaled = true) => ({
  type: 'graph',
  params: {
    x: [0, rescaled ? 7.3 : 5], y: [0, 1.2], aspect: 'wide', xlabel: '', ylabel: 'fraction', xticks: 0, yticks: 4,
    constants: { q, eff, mis },
    shade: [
      { fn: 'q', lower: 0, from: 0.5, to: 1.5, color: 'good', alpha: 0.65 },
      { fn: '1', lower: 'q', from: 0.5, to: 1.5, color: 'bad', alpha: 0.35 },
      { fn: 'q*eff', lower: 0, from: 2.5, to: 3.5, color: 'good', alpha: 0.65 },
      { fn: 'q*eff + (1 - q)*mis', lower: 'q*eff', from: 2.5, to: 3.5, color: 'bad', alpha: 0.35 },
      ...(rescaled ? [
        { fn: 'q*eff/(q*eff + (1 - q)*mis)', lower: 0, from: 4.5, to: 5.5, color: 'good', alpha: 0.65 },
        { fn: '1', lower: 'q*eff/(q*eff + (1 - q)*mis)', from: 4.5, to: 5.5, color: 'bad', alpha: 0.35 },
      ] : []),
    ],
    points: [
      { x: 1, y: 1.1, r: 0, label: 'everything', labelAlign: 'center', labelDx: 0, labelDy: 0 },
      { x: 3, y: 1.1, r: 0, label: 'flagged', labelAlign: 'center', labelDx: 0, labelDy: 0 },
      ...(rescaled ? [{ x: 5, y: 1.1, r: 0, label: 'flagged, rescaled', labelAlign: 'center', labelDx: 0, labelDy: 0 }] : []),
    ],
    legend: [{ label: 'real', color: 'good' }, { label: 'impostor', color: 'bad' }], legendAt: 'tr',
    ...extra,
  },
});

// Counts on a log axis: the two populations and the two passing pieces, per million (no ratio shown).
const logBars = (q, eff, mis, names, verb) => {
  const N = 1e6, c = [q * N, (1 - q) * N, q * eff * N, (1 - q) * mis * N].map((v) => Math.log10(v));
  const xs = [0.5, 1.6, 3.2, 4.3];
  return {
    type: 'graph',
    params: {
      x: [0, 5.2], y: [0, 6.8], ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: '', ylabel: 'count per million', xticks: 0,
      shade: c.map((h, i) => ({ fn: String(h), lower: 0, from: xs[i] - 0.4, to: xs[i] + 0.4, color: i % 2 ? 'bad' : 'good', alpha: 0.55 })),
      points: [
        ...c.map((h, i) => ({ x: xs[i], y: h, r: 0, label: i % 2 ? names[1] : names[0], labelAlign: 'center', labelDx: 0, labelDy: -10 })),
        { x: 1.05, y: 6.55, r: 0, label: 'before', labelAlign: 'center', labelDx: 0, labelDy: 0 },
        { x: 3.75, y: 6.55, r: 0, label: verb, labelAlign: 'center', labelDx: 0, labelDy: 0 },
      ],
    },
  };
};

export default lesson({
  id: 'st-g.G4.1',
  title: 'Distributions and Bayes’ theorem',
  minutes: 16, difficulty: 3,
  intro: t`A **probability density** $p(x)$ is probability per unit of $x$: the chance that $x$ lands in $[a, b]$ is the **area** $\int_a^b p(x)\,dx$, and the total area is $1$. Inference runs on one rule, **Bayes’ theorem**, which turns what the data say about a hypothesis into what you should believe after seeing them:

$$p(\theta \mid d) = \frac{p(d \mid \theta)\,p(\theta)}{p(d)}$$

The trap it guards against is everywhere in physics: a test that is rarely fooled can still be wrong most of the time, if what it looks for is rare. For mean, spread and the normal and Poisson laws in the lab, see [the normal distribution](#/lesson/lab.A2.2) and [counting statistics](#/lesson/lab.A2.3); this lesson is the inference that gravitational-wave astronomy is built on.`,
  symbols: [
    { tex: '\\theta', text: 'what you want to learn: a hypothesis (signal or noise) or a parameter (a mass, a distance)' },
    { tex: 'd', text: 'the data you actually recorded' },
    { tex: 'p(d \\mid \\theta)', text: t`the **likelihood**: how probable these data would be if $\theta$ were true. Read the bar “$\mid$” as “given”.` },
    { tex: 'p(\\theta)', text: t`the **prior**: what you believed about $\theta$ before the data (for a hypothesis, how common it is)` },
    { tex: 'p(\\theta \\mid d)', text: t`the **posterior**: what you should believe about $\theta$ after the data` },
    { tex: 'p(d)', text: t`the **evidence**: the probability of the data averaged over every $\theta$, $\sum_\theta p(d \mid \theta)\,p(\theta)$ (an integral for a parameter). It makes the posterior add up to $1$.` },
  ],
  why: 'Every gravitational-wave detection claim is a statement that a posterior probability is overwhelming, and every mass, spin and distance in a catalogue is a posterior distribution.',
  visual: {
    type: 'graph',
    title: 'Where a tagger’s mistakes come from',
    lead: t`A particle detector flags kaons in a beam that is mostly pions. Left: the beam (green kaons, red pions). Middle: what the tagger flags, on the same scale — most of the beam is thrown away. Right: the flagged sample rescaled to $1$. The green share on the right is the posterior $p(\text{kaon} \mid \text{flag})$.`,
    tasks: [
      t`Start at a kaon fraction of $3\%$: even with a $95\%$ efficient tagger and a $4\%$ mistag rate, more than half of what it flags is pions.`,
      t`Drag the mistag rate down to $0.5\%$: the posterior climbs toward $85\%$. The rare false alarm on the common thing is what matters.`,
      t`Raise the kaon fraction to $50\%$: now the same tagger is right about $96\%$ of the time. The tagger did not change; the prior did.`,
    ],
    params: {
      x: [0, 7.3], y: [0, 1.2], aspect: 'wide', xlabel: '', ylabel: 'fraction', xticks: 0, yticks: 4,
      sliders: [
        { key: 'q', label: 'Kaon fraction of the beam (prior)', min: 0.005, max: 0.5, step: 0.005, value: 0.03, explain: t`$p(\text{kaon})$ before any measurement: how common kaons are.` },
        { key: 'eff', label: 'Efficiency (kaons flagged)', min: 0.5, max: 1, step: 0.01, value: 0.95, explain: t`$p(\text{flag} \mid \text{kaon})$: the likelihood of a flag if the particle is a kaon.` },
        { key: 'mis', label: 'Mistag rate (pions flagged)', min: 0.005, max: 0.2, step: 0.005, value: 0.04, explain: t`$p(\text{flag} \mid \text{pion})$: how often a pion fools the tagger.` },
      ],
      shade: bars(0, 0, 0).params.shade,
      points: bars(0, 0, 0).params.points,
      legend: [{ label: 'kaon', color: 'good' }, { label: 'pion', color: 'bad' }], legendAt: 'tr',
      readouts: [
        { label: t`$p(\text{flag})$`, expr: 'q*eff + (1 - q)*mis', digits: 3 },
        { label: t`posterior $p(\text{kaon} \mid \text{flag})$`, expr: 'q*eff/(q*eff + (1 - q)*mis)', digits: 3 },
      ],
    },
    caption: t`Illustrative numbers for a Cherenkov-ring kaon tagger; real taggers’ efficiencies and mistag rates depend on momentum. The middle bar is drawn to the same scale as the left one.`,
  },
  example: {
    prompt: t`A beam is $3\%$ kaons and $97\%$ pions. A tagger flags $95\%$ of kaons and, by mistake, $4\%$ of pions. A particle is flagged. What is the probability it is a kaon?`,
    visual: { ...bars(0.03, 0.95, 0.04, { legend: [{ label: 'kaon', color: 'good' }, { label: 'pion', color: 'bad' }] }), caption: t`The beam, what is flagged (same scale), and the flagged pile rescaled to $1$. Illustrative numbers.` },
    steps: [
      { label: 'Count, do not divide', text: t`Imagine $10\,000$ particles: $300$ kaons and $9\,700$ pions. Natural frequencies make Bayes’ theorem a head count.` },
      { label: 'Who gets flagged', text: t`Kaons flagged: $0.95 \times 300 = 285$. Pions flagged: $0.04 \times 9\,700 = 388$. The flagged pile holds $673$ particles.` },
      { label: 'The posterior', text: t`$p(\text{kaon} \mid \text{flag}) = 285/673 = 0.423$. The flag raised the probability from $3\%$ to $42\%$ — a big step, but still a coin toss.` },
      { label: 'Odds form', text: t`Bayes’ theorem divided by itself for the two hypotheses: $\dfrac{p(K \mid d)}{p(\pi \mid d)} = \dfrac{p(d \mid K)}{p(d \mid \pi)} \cdot \dfrac{p(K)}{p(\pi)}$. Here the **likelihood ratio** is $0.95/0.04 = 23.75$ and the prior odds $3/97$, so the posterior odds are $0.735$: probability $0.735/1.735 = 0.423$ again.` },
      { label: 'Sense check', text: t`The likelihood ratio says how much the data favour one hypothesis; the prior odds say where you started. A gravitational-wave **Bayes factor** is exactly this ratio, for “signal” against “noise”.` },
    ],
    answer: t`$p(\text{kaon} \mid \text{flag}) = 285/673 \approx 0.42$: posterior odds $=$ likelihood ratio $23.75$ $\times$ prior odds $3/97$.`,
  },
  practice: [
    num({
      id: 'wait-area', difficulty: 1,
      gen(r) {
        const rate = r.pick([1.5, 2, 2.5, 3]), b = r.pick([0.2, 0.3, 0.5, 0.8]);
        const ans = 1 - Math.exp(-rate * b);
        return {
          prompt: t`Cosmic-ray muons cross a scintillator paddle at random, $${rate}$ per second on average, so the wait $x$ for the next one has density $p(x) = ${rate}\,e^{-${rate}x}$ (seconds). What is the probability the next muon arrives within $${b}\ \text{s}$?`,
          visual: { type: 'graph', params: { x: [0, 2.5], y: [0, rate * 1.15], aspect: 'wide', xlabel: 'wait x (s)', ylabel: 'p(x) (1/s)', curves: [{ fn: `${rate}*e^(-${rate}*x)`, color: 'accent', width: 2.2 }], shade: [{ fn: `${rate}*e^(-${rate}*x)`, from: 0, to: b, color: 'accent', alpha: 0.3 }] }, caption: t`The density of waiting times. The shaded area is the probability asked for; the whole area under the curve is $1$.` },
          answer: ans, tol: { rel: 0.005 }, integrand: `${rate}*e^(-${rate}x)`, limits: [0, b], vars: { x: [0, 1] },
          errors: [{ value: rate * Math.exp(-rate * b), feedback: t`That is the density $p(${b})$, a height — probability per second. The probability is the area under $p$ from $0$ to $${b}$.` }, { value: Math.exp(-rate * b), feedback: t`That is the probability of waiting **longer** than $${b}$ s. Subtract it from $1$.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`Probability is area: $\int_0^{${b}} ${rate}\,e^{-${rate}x}\,dx$.`, t`The antiderivative of $${rate}e^{-${rate}x}$ is $-e^{-${rate}x}$, so the area is $1 - e^{-${nice(rate * b)}}$.`],
          teach: 'A density is probability per unit; the probability of a range is the area under the density over that range.',
          explain: t`$1 - e^{-${rate}\times${b}} = ${nice(ans, 4)}$. The density at $x = 0$ is $${rate}\ \text{s}^{-1}$ — more than $1$, which is fine: a density is not a probability.`,
        };
      },
    }),
    mcq({
      id: 'density-above-one', difficulty: 2,
      prompt: t`A star tracker’s pointing error is Gaussian with standard deviation $\sigma = 0.1$ arcsec. Its density at zero error is $\dfrac{1}{\sqrt{2\pi}\,\sigma} \approx 4.0\ \text{arcsec}^{-1}$. What does that number mean?`,
      visual: { type: 'graph', params: { x: [-0.4, 0.4], y: [0, 4.6], aspect: 'wide', xlabel: 'error (arcsec)', ylabel: 'p (1/arcsec)', curves: [{ fn: 'e^(-x^2/(2*0.01))/(sqrt(2*pi)*0.1)', color: 'accent', width: 2.2 }], shade: [{ fn: 'e^(-x^2/(2*0.01))/(sqrt(2*pi)*0.1)', from: -0.005, to: 0.005, color: 'gold', alpha: 0.7 }], hlines: [{ y: 1, color: 'ink3', label: 'p = 1' }], axesAt: 'edge' }, caption: t`A narrow Gaussian rises well above $1$; its area is still $1$. The gold sliver is the strip from $-0.005$ to $0.005$ arcsec.` },
      choices: [
        t`About $4\%$ of errors fall within $\pm 0.005$ arcsec of zero: probability $\approx$ density $\times$ width $= 4.0 \times 0.01$`,
        t`The tracker is wrong with probability $4.0$, so the distribution is not normalized`,
        t`An error of exactly zero has probability $4.0/100 = 4\%$`,
        t`It is impossible: a probability density can never exceed $1$`,
      ],
      answer: 0,
      why: {
        1: t`A density is not a probability. Its **area** is $1$; its height can be anything, and grows as $\sigma$ shrinks.`,
        2: t`For a continuous variable, any single exact value has probability $0$. Only ranges have probability.`,
        3: t`Densities carry units of $1/x$: in arcsec$^{-1}$ a narrow peak easily exceeds $1$. Change units to milliarcseconds and the same peak becomes $0.004$.`,
      },
      hints: ['A density has units: here, per arcsecond.', t`Multiply the density by a small width to get a probability.`],
      teach: 'A probability density is probability per unit of the variable; it may exceed 1, and only areas under it are probabilities.',
      explain: t`For a narrow strip, area $\approx$ height $\times$ width: $4.0\ \text{arcsec}^{-1} \times 0.01\ \text{arcsec} = 0.04$. In milliarcseconds the same curve peaks at $0.004\ \text{mas}^{-1}$ — the number depends on units; the probability does not.`,
    }),
    num({
      id: 'tail-log', difficulty: 2,
      gen(r) {
        const z = r.pick([3, 3.5, 4, 4.5, 5]);
        const ans = normalSf(z);
        return {
          prompt: t`Particle physics and gravitational-wave astronomy quote significance in standard deviations. If the background statistic is standard normal, what is the one-sided probability $P(Z > ${z})$ that noise alone fluctuates at least $${z}\sigma$ high? Give two significant figures.`,
          visual: { type: 'graph', params: { x: [-1, 6.5], y: [-9, 0], ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'z (standard deviations)', ylabel: 'density', curves: [{ fn: LOGPHI, color: 'accent', width: 2.2 }], shade: [{ fn: LOGPHI, lower: -9, from: z, to: 6.5, color: 'bad', alpha: 0.35 }], vlines: [{ x: z, color: 'bad', label: `${z}σ` }] }, caption: t`The standard normal density on a logarithmic axis: on a linear one, the tail beyond $3\sigma$ is too thin to see. Shading marks the tail whose probability is asked for; on a log axis its area is not to scale.` },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: 2 * ans, feedback: t`That is the **two-sided** probability $P(|Z| > ${z})$. A signal excess only counts in one direction.` }, { value: 1 - ans, feedback: t`That is $P(Z < ${z})$. You want the tail beyond $${z}$.` }],
          hints: [t`$P(Z > z) = \tfrac12\operatorname{erfc}(z/\sqrt2)$.`, t`A calculator or \`scipy.stats.norm.sf(${z})\` gives it; for $z = 5$ the answer is about $3\times10^{-7}$.`],
          teach: 'Gaussian tails fall off like e^(−z²/2): each extra standard deviation buys a large factor in rarity.',
          explain: t`$P(Z > ${z}) = ${tex(ans, 2)}$. The famous $5\sigma$ is $2.87\times10^{-7}$, one-sided. It is the probability of noise doing this — not the probability that the result is noise (see the next problems). The lab version: [hypothesis tests and p-values](#/lesson/lab.A4.2).`,
        };
      },
    }),
    num({
      id: 'gamma-hadron', difficulty: 2,
      gen(r) {
        const q = r.pick([0.001, 0.002, 0.005]), eff = r.pick([0.6, 0.7, 0.8]), mis = r.pick([0.005, 0.01, 0.02]);
        const ans = (q * eff) / (q * eff + (1 - q) * mis);
        return {
          prompt: t`A ground array sees air showers; only a fraction $${q}$ are started by gamma rays, the rest by cosmic-ray protons and nuclei. A shape cut keeps $${eff * 100}\%$ of gamma showers and $${mis * 100}\%$ of hadronic ones. A shower passes the cut. What is the probability it was a gamma ray?`,
          visual: { ...logBars(q, eff, mis, ['gamma', 'hadron'], 'after the cut'), caption: t`Showers per million on a logarithmic axis, before and after the cut. The cut shrinks the hadrons far more than the gammas — but they started far ahead.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: eff, feedback: t`That is $p(\text{pass} \mid \gamma)$, the efficiency. You were asked for $p(\gamma \mid \text{pass})$ — Bayes turns one into the other with the prior.` }, { value: 1 - mis, feedback: t`$1 - $ the hadron pass rate is how often hadrons are rejected; it ignores how rare gammas are.` }],
          hints: [t`Imagine $10^6$ showers: how many are gammas that pass, and how many hadrons that pass?`, t`$p(\gamma \mid \text{pass}) = \dfrac{${q}\times${eff}}{${q}\times${eff} + ${1 - q}\times${mis}}$.`],
          teach: 'When the thing you look for is rare, the false alarms from the common thing can outnumber the true hits: always weigh the likelihood by the prior.',
          explain: t`$p(\gamma \mid \text{pass}) = ${nice(ans, 3)}$. The cut multiplied the gamma odds by $${eff}/${mis} = ${nice(eff / mis, 3)}$, but they started at $${q}/${nice(1 - q, 4)}$. Real gamma-ray observatories stack cuts and look toward a source, where the prior is far higher.`,
        };
      },
    }),
    mcq({
      id: 'prosecutor', difficulty: 2,
      prompt: t`A search reports: “The probability that detector noise produces a candidate at least this loud in a year is $10^{-6}$.” Which statement follows from that alone?`,
      visual: { type: 'graph', params: { x: [0, 12], y: [-8, 0], ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'loudness statistic', ylabel: 'P(noise ≥ x) per year', curves: [{ fn: `-0.5*x + 0`, color: 'ink2', width: 2, label: 'noise background', labelAt: 3, labelDy: -10 }], points: [{ x: 12, y: -6, color: 'bad', label: 'candidate', labelDx: -70, labelDy: -10 }] }, caption: t`A schematic background: how often noise alone exceeds each loudness, from data with the detectors shifted in time so no real signal can line up. Not real search data.` },
      choices: [
        t`$p(\text{this loud} \mid \text{noise}) = 10^{-6}$ per year: the noise rarely does this. Turning it into $p(\text{noise} \mid \text{data})$ needs the rate of real signals too.`,
        t`The probability that the candidate is noise is $10^{-6}$`,
        t`The probability that the candidate is a real signal is $1 - 10^{-6}$`,
        t`The candidate is real with $5\sigma$ confidence, so no prior is needed`,
      ],
      answer: 0,
      why: {
        1: t`This swaps $p(d \mid \text{noise})$ for $p(\text{noise} \mid d)$ — the “prosecutor’s fallacy”. They differ by the prior odds and the signal likelihood.`,
        2: t`The same swap. If real signals that loud were even rarer than noise flukes, the candidate would still most likely be noise.`,
        3: t`A significance is a statement about noise only. A posterior probability of being real needs both the signal and noise rates — which is why gravitational-wave catalogues quote $p_{\text{astro}}$ separately.`,
      },
      hints: [t`Write the given number with a bar: is it $p(\text{data} \mid \text{noise})$ or $p(\text{noise} \mid \text{data})$?`, 'Bayes needs a prior to turn one into the other.'],
      teach: t`$p(d \mid H)$ and $p(H \mid d)$ are different numbers; the prior and the alternative hypothesis connect them.`,
      explain: t`A false-alarm rate is a likelihood under the noise hypothesis. GW150914’s false-alarm rate was below 1 per $203\,000$ years, and real binary black holes turned out to be common enough that its probability of being astrophysical was essentially $1$ — but that second step used the signal rate as well.`,
    }),
    num({
      id: 'kalman', difficulty: 3,
      gen(r) {
        const mu0 = r.pick([1.8, 2.0, 2.2]), tau = r.pick([0.3, 0.4]), x = r.pick([2.4, 2.5, 2.6]), s = r.pick([0.1, 0.15, 0.2]);
        const w0 = 1 / tau ** 2, w1 = 1 / s ** 2, ans = (mu0 * w0 + x * w1) / (w0 + w1), sd = 1 / Math.sqrt(w0 + w1);
        const G = (m, sg) => `e^(-(x - ${m})^2/(2*${sg * sg}))/(sqrt(2*pi)*${sg})`;
        return {
          prompt: t`A spacecraft’s gyros predict its roll angle as $${mu0}^\circ \pm ${tau}^\circ$ (Gaussian prior). A star tracker then measures $${x}^\circ \pm ${s}^\circ$ (Gaussian likelihood). The posterior is Gaussian with mean $\mu = \dfrac{\mu_0/\tau^2 + x/s^2}{1/\tau^2 + 1/s^2}$. What is $\mu$, in degrees?`,
          visual: { type: 'graph', params: { x: [0.8, 3.4], y: [0, 1.15 / Math.min(tau, s, sd) / Math.sqrt(2 * Math.PI)], aspect: 'wide', xlabel: 'roll angle (°)', ylabel: '', yticks: 0, curves: [{ fn: G(mu0, tau), color: 'ink2', width: 1.8, dash: true, label: 'prior (gyros)', labelAt: mu0 - tau * 1.4, labelDx: -80, labelDy: 0 }, { fn: G(x, s), color: 'accent', width: 1.8, label: 'likelihood (tracker)', labelAt: x + s, labelDx: 6 }] }, caption: t`Prior and likelihood. Multiply them and normalize: the posterior lies between, nearer the narrower one.` },
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: (mu0 + x) / 2, feedback: t`A plain average treats both sources as equally good. Weight each by $1/\text{variance}$: the tracker is more precise.` }, { value: (mu0 / tau + x / s) / (1 / tau + 1 / s), feedback: t`Weight by $1/\sigma^2$, not $1/\sigma$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`The weights are $1/\tau^2 = ${nice(w0, 4)}$ and $1/s^2 = ${nice(w1, 4)}$.`, t`$\mu = \dfrac{${mu0}\times${nice(w0, 4)} + ${x}\times${nice(w1, 4)}}{${nice(w0 + w1, 4)}}$.`],
          teach: 'A Gaussian prior times a Gaussian likelihood is a Gaussian posterior whose mean weights each source by its precision 1/σ² — one step of a Kalman filter.',
          explain: t`$\mu = ${nice(ans, 4)}^\circ$, with spread $1/\sqrt{1/\tau^2 + 1/s^2} = ${nice(sd, 3)}^\circ$ — narrower than either input. Spacecraft attitude filters make this Bayesian update many times a second.`,
        };
      },
    }),
    num({
      id: 'jacobian', difficulty: 3,
      gen(r) {
        const y0 = r.pick([0.04, 0.09, 0.16, 0.36, 0.49, 0.64]);
        const ans = 1 / (2 * Math.sqrt(y0));
        return {
          prompt: t`$x$ is uniform on $[0, 1]$, so $p_x(x) = 1$. What is the density of $y = x^2$ at $y = ${y0}$?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ fn: 'x^2', color: 'accent', width: 2.2, label: 'y = x²', labelAt: 0.85, labelDx: -40, labelDy: -6 }], shade: [{ fn: '1', lower: 0, from: Math.sqrt(y0) - 0.05, to: Math.sqrt(y0) + 0.05, color: 'gold', alpha: 0.25 }, { fn: String((Math.sqrt(y0) + 0.05) ** 2), lower: String((Math.sqrt(y0) - 0.05) ** 2), from: 0, to: 1, color: 'accent', alpha: 0.2 }], points: [{ x: Math.sqrt(y0), y: y0, color: 'gold', r: 4 }] }, caption: t`A strip of $x$ of width $0.1$ (gold) holds probability $0.1$; squaring maps it onto a band of $y$ (blue) whose width depends on where it is. The same probability spread over a different width means a different density.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`A density does not carry over unchanged: probability $p_x\,dx$ is conserved, so $p_y = p_x\,|dx/dy|$.` }, { value: 2 * Math.sqrt(y0), feedback: t`That is $|dy/dx|$. You need $|dx/dy| = 1/(2\sqrt y)$.` }],
          hints: [t`Probability is conserved: $p_y(y)\,|dy| = p_x(x)\,|dx|$.`, t`$x = \sqrt y$, so $dx/dy = 1/(2\sqrt y)$.`],
          teach: t`Densities change with the Jacobian, $p_y = p_x\,|dx/dy|$: “uniform” in one variable is not uniform in another.`,
          explain: t`$p_y(${y0}) = 1/(2\sqrt{${y0}}) = ${nice(ans, 4)}$. So a prior is never “uninformative” in every variable at once: flat in the component masses is not flat in the chirp mass.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-volume', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.25, 0.4, 0.5, 0.6, 0.75]);
        const ans = f ** 3;
        return {
          prompt: t`Gravitational-wave sources are spread evenly through space, so out to the detectors’ horizon $D_{\max}$ the prior on distance is uniform in **volume**: $p(D) = 3D^2/D_{\max}^3$. What fraction of sources lie closer than $${f}\,D_{\max}$?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 3.3], aspect: 'wide', xlabel: 'D / Dmax', ylabel: 'p(D) × Dmax', curves: [{ fn: '3*x^2', color: 'accent', width: 2.2 }, { fn: '1', color: 'ink3', width: 1.4, dash: true, label: 'uniform in D (wrong)', labelAt: 0.05, labelDy: -10 }], shade: [{ fn: '3*x^2', from: 0, to: f, color: 'accent', alpha: 0.3 }] }, caption: t`The volume prior rises as $D^2$: there is more space far away. Static picture; real searches also lose distant sources they cannot hear.` },
          answer: ans, tol: { rel: 0.005 }, integrand: '3*x^2', limits: [0, f], vars: { x: [0, 1] },
          errors: [{ value: f, feedback: t`That would be true for a prior uniform in $D$. Uniform in volume puts more sources far away.` }, { value: f * f, feedback: t`Area grows as $D^2$, volume as $D^3$.` }],
          hints: [t`Integrate $3D^2/D_{\max}^3$ from $0$ to $${f}\,D_{\max}$.`, t`The answer is $(${f})^3$.`],
          teach: 'A prior uniform in volume gives p(D) ∝ D², so most detectable sources are far away — the reason distance and inclination posteriors are hard.',
          explain: t`$(${f})^3 = ${nice(ans, 4)}$. Half the horizon distance holds only $1/8$ of the volume. This is the default distance prior in gravitational-wave parameter estimation.`,
        };
      },
    }),
    num({
      id: 'cp-look-elsewhere', difficulty: 3,
      gen(r) {
        const zs = r.pick([3, 3.5, 4]), Nt = r.pick([100, 300, 1000, 3000]);
        const p = normalSf(zs), ans = 1 - (1 - p) ** Nt;
        return {
          prompt: t`A search scans $${Nt}$ independent frequency bins and the strongest bin is $${zs}\sigma$ high (one-sided, Gaussian noise). What is the probability that noise alone puts **at least one** of the $${Nt}$ bins this high? Give two significant figures.`,
          visual: { type: 'graph', params: { x: [-1, 6.5], y: [-9, 0], ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'z (standard deviations)', ylabel: 'density', curves: [{ fn: LOGPHI, color: 'accent', width: 2.2 }], shade: [{ fn: LOGPHI, lower: -9, from: zs, to: 6.5, color: 'bad', alpha: 0.35 }], vlines: [{ x: zs, color: 'bad', label: `${zs}σ` }] }, caption: t`One bin’s tail, on a logarithmic axis (its area is not to scale). With many bins, each gets its own chance to fluctuate.` },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: p, feedback: t`That is the chance for one bin. With $${Nt}$ bins, noise has $${Nt}$ tries.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`One bin: $p = P(Z > ${zs}) = ${tex(p, 3)}$.`, t`No bin that high: $(1 - p)^{${Nt}}$. At least one: $1 - (1 - p)^{${Nt}}$ (about $${Nt}\,p$ when that is small).`],
          teach: 'Searching many places multiplies the chance of a fluke (the look-elsewhere effect); significance must count every place you looked.',
          explain: t`$1 - (1 - ${tex(p, 3)})^{${Nt}} = ${nice(ans, 3)}$. A “${zs}σ” bin is unremarkable after $${Nt}$ tries. Gravitational-wave searches face the same: every template and every arrival time is a try, which is why they measure their background directly.`,
        };
      },
    }),
    mcq({
      id: 'cp-glitch', difficulty: 2,
      prompt: t`A classifier labels short noise transients (“glitches”) in a detector. It flags $99\%$ of glitches and wrongly flags $1\%$ of real signals. A real signal arrives once for every $10\,000$ glitches. A transient is **not** flagged. Roughly how likely is it to be a real signal?`,
      visual: { ...logBars(1 / 10001, 0.99, 0.01, ['signal', 'glitch'], 'not flagged'), caption: t`Transients per million on a logarithmic axis: all of them, and the ones the classifier does not flag. Illustrative numbers.` },
      choices: [t`About $1\%$: the unflagged pile holds $100$ glitches per $0.99$ signals`, t`About $99\%$: the classifier is $99\%$ accurate`, t`About $0.01\%$: signals are $1$ in $10\,000$`, t`About $50\%$: either it is a signal or it is not`],
      answer: 0,
      why: {
        1: t`$99\%$ is $p(\text{not flagged} \mid \text{signal})$; the rarity of signals pulls the posterior far below it.`,
        2: t`That is the prior. Not being flagged multiplies the odds of “signal” by $0.99/0.01 = 99$.`,
        3: t`Two outcomes do not make them equally likely; probabilities come from the counts.`,
      },
      hints: [t`Per $10\,001$ transients: $10\,000$ glitches, $1$ signal. How many of each are not flagged?`, t`Unflagged: $1\%$ of the glitches ($100$) and $99\%$ of the signal ($0.99$).`],
      teach: 'The odds form of Bayes: posterior odds = likelihood ratio × prior odds; a rare hypothesis needs a large likelihood ratio.',
      explain: t`Odds $= 99 \times \tfrac{1}{10\,000} \approx 0.0099$, so $p \approx 1\%$. Ninety-nine in a hundred unflagged transients are still glitches. Illustrative numbers; real glitch classifiers such as Gravity Spy sort many glitch families.`,
    }),
  ],
  sources: [
    { label: 'Blitzstein & Hwang, Introduction to Probability, 2nd ed. (CRC, 2019), chs. 2, 5, 8', url: 'http://probabilitybook.net' },
    { label: 'Thrane & Talbot, An introduction to Bayesian inference in gravitational-wave astronomy, PASA 36, e010 (2019)', url: 'https://arxiv.org/abs/1809.02293' },
    { label: 'LIGO Scientific and Virgo Collaborations, Observation of gravitational waves from a binary black hole merger, PRL 116, 061102 (2016)', url: 'https://arxiv.org/abs/1602.03837' },
    { label: 'Wasserstein & Lazar, The ASA statement on p-values, Am. Stat. 70, 129 (2016)', url: 'https://doi.org/10.1080/00031305.2016.1154108' },
  ],
});
