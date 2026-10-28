// Bayesian parameter estimation for gravitational waves. Gaussian noise makes
// the likelihood ln L(θ) = ⟨d, h(θ)⟩ − ½⟨h(θ), h(θ)⟩ (= −½‖d − h‖² + const);
// times a prior, a posterior over chirp mass whose width falls roughly as 1/ρ
// (sg2-matched posterior panel: 90% width 1.41 M☉ at peak = 1σ, 0.49 at 2σ for
// the default record; it collapses from the whole range to a peak as the
// signal crosses detectability). Worked: GW150914’s 36 + 29 M☉ → ℳ = 28.1
// (source) and (1 + z)ℳ = 30.6 (detector, z = 0.09) — the waveform only knows
// G𝓜/c³ as a time, which redshift stretches. Practice: chirp mass from
// component masses, detector frame, width scaling, a slider for a target
// precision, what “90% credible” means, the residual form of ln L, and a
// NumPy grid posterior from f and ḟ (ḟ = 3740 ± 370 Hz/s at 100 Hz →
// 𝓜 ≈ 30.5, 90% 27.4–33.4). Transfer: source frame from detector frame, the
// distance–inclination degeneracy (h₊ ∝ (1 + cos²ι)/2D), calibration of
// credible intervals over many events (binomial, 20 events at 90%).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const chirp = (a, b) => (a * b) ** 0.6 / (a + b) ** 0.2;
// constant-chirp-mass curves in the (m1, m2) plane, m1 ≥ m2, parametrized by q = m2/m1
const mcCurve = (Mc, color, label) => ({ param: [`${Mc}*(1 + t)^(1/5)*t^(-3/5)`, `${Mc}*(1 + t)^(1/5)*t^(2/5)`], t: [0.25, 1], color, width: 1.4, dash: true, label, labelAt: 0.3, labelDx: 4, labelDy: -8 });

export default lesson({
  id: 'st-g.G4.4',
  title: 'Bayesian parameter estimation for gravitational waves',
  minutes: 18, difficulty: 4,
  intro: t`Detection asks whether a signal is there; **parameter estimation** asks what made it. Gaussian detector noise gives a likelihood for any proposed source parameters $\theta$ — masses, spins, distance, sky position — through the noise-weighted inner product of [matched filtering](#/lesson/st-g.G4.3). Bayes’ theorem then gives the posterior:

$$p(\theta \mid d) \propto \pi(\theta)\,\exp\Bigl(\langle d, h(\theta)\rangle - \tfrac12\langle h(\theta), h(\theta)\rangle\Bigr)$$

The exponent is $-\tfrac12\lVert d - h(\theta)\rVert^2$ up to a constant: parameters whose waveform leaves noise-like **residuals** are favoured. Samplers such as Markov-chain Monte Carlo or nested sampling (the Bilby library) explore this posterior in fifteen dimensions; here you meet it in one, the **chirp mass**, which the frequency sweep measures best.`,
  symbols: [
    { tex: '\\theta', text: t`the source parameters; here mostly the chirp mass $\mathcal M = (m_1m_2)^{3/5}/(m_1 + m_2)^{1/5}$, in solar masses` },
    { tex: 'h(\\theta)', text: t`the waveform model: the strain the detector would record from a source with parameters $\theta$` },
    { tex: 'd', text: 'the recorded data, signal plus noise' },
    { tex: '\\langle a, b\\rangle', text: t`the noise-weighted inner product, $\sum a_ib_i/\sigma^2$ for white noise (each frequency weighted by $1/S_n$ for real noise)` },
    { tex: '\\pi(\\theta)', text: t`the prior: what is assumed before the data — for example uniform in component masses and uniform in volume for distance` },
    { tex: 'p(\\theta \\mid d)', text: t`the posterior: the probability density of the parameters given the data, summarized by a median and a credible interval` },
  ],
  why: 'Every mass, spin and distance in a gravitational-wave catalogue — and every test of general relativity made with those events — is a posterior computed this way.',
  visual: {
    type: 'sg2-matched',
    title: 'A posterior sharpening',
    lead: t`Top: the loudest SNR each chirp-mass template finds in the record. Bottom: the posterior on chirp mass, $\propto e^{\rho^2/2}$ with a flat prior, and its $90\%$ credible interval (shaded).`,
    tasks: [
      t`Lower the signal to $0.5\sigma$: the posterior spreads over the whole range — nothing has been measured. Raise it past about $0.7\sigma$: it collapses onto a peak. Detection and measurement switch on together.`,
      t`Double the signal from $1$ to $2$: the interval shrinks roughly in proportion to $1/\rho$.`,
      t`Set the true chirp mass to $50\ M_\odot$: with fewer cycles in band, the same SNR buys a much wider interval. Then press “New noise” a few times with “Reveal” on: the interval wanders around the truth and occasionally misses it.`,
    ],
    params: { Mc: 30, tpl: 30, amp: 1, seed: 2, panels: ['scan', 'post'], controls: ['amp', 'Mc', 'noise', 'reveal'] },
    caption: t`A toy: white noise, one detector, a leading-order chirp from 30 to 250 Hz. The likelihood is maximized over amplitude, phase and arrival time instead of marginalized, and only the chirp mass is varied — real analyses sample about fifteen parameters at once.`,
  },
  example: {
    prompt: t`GW150914’s component masses were about $36$ and $29\ M_\odot$ in the source’s rest frame, at redshift $z = 0.09$. What chirp mass does the detector measure, and why is it not the source’s?`,
    visual: { type: 'graph', params: { x: [0, 0.3], y: [20, 260], aspect: 'wide', axesAt: 'edge', xlabel: 'time before cut-off τ (s)', ylabel: 'frequency (Hz)', curves: [{ fn: '(1/pi)*(5/(256*x))^(3/8)*(28.1*4.926e-6)^(-5/8)', color: 'ink2', width: 1.8, dash: true, domain: [0.002, 0.3], label: 'ℳ = 28.1 (source)', labelAt: 0.2, labelDy: -10 }, { fn: '(1/pi)*(5/(256*x))^(3/8)*(30.6*4.926e-6)^(-5/8)', color: 'accent', width: 2.2, domain: [0.002, 0.3], label: 'ℳ = 30.6 (as received)', labelAt: 0.09, labelDx: 8 }] }, caption: t`Leading-order frequency against time to coalescence for the two chirp masses. A heavier chirp mass sweeps more slowly at a given time before merger; redshift does the same to the received signal.` },
    steps: [
      { label: 'Chirp mass', text: t`$\mathcal M = \dfrac{(36\times29)^{3/5}}{65^{1/5}} = 28.1\ M_\odot$ in the source frame.` },
      { label: 'Masses are times', text: t`With $G = c = 1$ a mass is a time: the waveform depends on $\mathcal M$ only through $G\mathcal M/c^3$ ($4.93\ \mu\text{s}$ per solar mass). Every time scale of the signal is set by it.` },
      { label: 'Redshift stretches time', text: t`The expanding universe stretches every interval of the received signal by $1 + z$. A stretched chirp is exactly the chirp of a source $1 + z$ times heavier: $\mathcal M_{\text{det}} = (1 + z)\,\mathcal M = 1.09 \times 28.1 = 30.6\ M_\odot$.` },
      { label: 'Going back', text: t`The data measure $\mathcal M_{\text{det}}$ directly and tightly. To quote source-frame masses you need $z$, which comes from the luminosity distance (read from the amplitude, poorly) and a cosmology — so source-frame masses carry larger errors.` },
      { label: 'Sense check', text: t`At $f = 100\ \text{Hz}$ the leading-order chirp gives $\dot f = 3.7\times10^3\ \text{Hz/s}$ for $30.6\ M_\odot$, consistent with the observed sweep from $35$ to $250\ \text{Hz}$ in about $0.2\ \text{s}$.` },
    ],
    answer: t`The detector measures $\mathcal M_{\text{det}} = (1 + z)\mathcal M = 1.09\times28.1 \approx 30.6\ M_\odot$; the source-frame $28.1\ M_\odot$ needs the redshift, which brings the distance’s uncertainty with it.`,
  },
  practice: [
    num({
      id: 'chirp-from-masses', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[10, 8], [20, 15], [30, 25], [50, 30], [85, 66]]);
        const ans = chirp(a, b);
        return {
          prompt: t`A binary has component masses $m_1 = ${a}\ M_\odot$ and $m_2 = ${b}\ M_\odot$. What is its chirp mass $\mathcal M = (m_1m_2)^{3/5}/(m_1 + m_2)^{1/5}$?`,
          visual: { type: 'graph', params: { x: [0, 100], y: [0, 80], aspect: 'wide', axesAt: 'edge', xlabel: 'm₁ (M☉)', ylabel: 'm₂ (M☉)', curves: [mcCurve(10, 'ink3', 'ℳ = 10'), mcCurve(30, 'ink3', 'ℳ = 30'), mcCurve(60, 'ink3', 'ℳ = 60'), { fn: 'x', color: 'ink4', width: 1, domain: [0, 80] }], points: [{ x: a, y: b, color: 'gold', label: 'this binary' }] }, caption: t`Lines of constant chirp mass in the plane of component masses. The data pin the binary near one such line; where along it is much less certain.` },
          answer: ans, units: 'Msun', tol: { rel: 0.005 },
          errors: [{ value: (a * b) / (a + b), feedback: t`That is the reduced mass $m_1m_2/(m_1 + m_2)$. The chirp mass uses the powers $3/5$ and $1/5$.` }, { value: (a + b) / 2, feedback: 'The average mass is not the chirp mass, though for equal masses they are related: ℳ = m/2^(1/5).' }],
          hints: [t`$m_1m_2 = ${a * b}$, $m_1 + m_2 = ${a + b}$.`, t`$\mathcal M = ${a * b}^{0.6}/${a + b}^{0.2}$.`],
          teach: 'The chirp mass is the combination of the two masses that sets the inspiral’s frequency sweep, and so it is what the data measure best.',
          explain: t`$\mathcal M = ${nice(ans, 4)}\ M_\odot$. Many pairs share it — the dashed curves — which is why the mass ratio, and the individual masses, come out far less certain than $\mathcal M$.`,
        };
      },
    }),
    num({
      id: 'detector-frame', difficulty: 2,
      gen(r) {
        const M = r.pick([8.3, 15.0, 23.8, 33.5]), z = r.pick([0.1, 0.2, 0.35, 0.5]);
        const ans = (1 + z) * M;
        return {
          prompt: t`A binary with source-frame chirp mass $${M}\ M_\odot$ merges at redshift $z = ${z}$. What chirp mass does a waveform fit to the detector data find?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 80], aspect: 'wide', axesAt: 'edge', xlabel: 'redshift z', ylabel: 'detector-frame ℳ (M☉)', curves: [{ fn: `${M}*(1 + x)`, color: 'accent', width: 2.2 }], vlines: [{ x: z, color: 'gold', label: `z = ${z}` }] }, caption: t`The detector-frame chirp mass grows linearly with redshift. Not to scale beyond $z \approx 1$ for this binary’s detectability.` },
          answer: ans, units: 'Msun', tol: { rel: 0.005 },
          errors: [{ value: M / (1 + z), feedback: t`Redshift makes the source look **heavier**: its signal is stretched in time, like a heavier binary’s.` }, { value: M, feedback: 'The detector sees the redshifted, time-stretched waveform; the fitted mass absorbs the factor 1 + z.' }],
          hints: [t`The waveform depends on $G\mathcal M/c^3$, a time, and every received time is stretched by $1 + z$.`, t`$\mathcal M_{\text{det}} = (1 + z)\mathcal M$.`],
          teach: 'Gravitational-wave data measure redshifted masses (1 + z)M; source-frame masses need the redshift from somewhere else.',
          explain: t`$(1 + ${z})\times${M} = ${nice(ans, 4)}\ M_\odot$. Without an electromagnetic counterpart the redshift comes from the measured distance and an assumed cosmology.`,
        };
      },
    }),
    num({
      id: 'width-scaling', difficulty: 2,
      gen(r) {
        const r1 = r.pick([8, 10, 12]), w1 = r.pick([2.4, 3.0, 1.8]), r2 = r.pick([24, 30, 40]);
        const ans = (w1 * r1) / r2;
        return {
          prompt: t`For a fixed binary, a $90\%$ credible interval on chirp mass is $${w1}\ M_\odot$ wide when the SNR is $${r1}$. Roughly how wide is it for an identical binary detected at SNR $${r2}$?`,
          visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 1, seed: 2, panels: ['post'], controls: false, readout: false }, caption: t`The chirp-mass posterior in the simulation’s toy record at SNR near $8$. A louder signal makes it narrower.` },
          answer: ans, units: 'Msun', tol: { rel: 0.01 },
          errors: [{ value: w1 * Math.sqrt(r1 / r2), feedback: t`The width scales as $1/\rho$, not $1/\sqrt\rho$: $\ln L$ is $\rho^2$ times a fixed shape.` }, { value: w1 * (r1 / r2) ** 2, feedback: t`Squared once too often: the curvature of $\ln L$ grows as $\rho^2$, so the width falls as $1/\rho$.` }],
          hints: [t`Near its peak, $\ln L \approx -\tfrac12\rho^2\,k\,(\mathcal M - \hat{\mathcal M})^2$ for some fixed $k$.`, t`The width is $\propto 1/\rho$: multiply by $${r1}/${r2}$.`],
          teach: 'At high SNR the posterior width falls as 1/ρ, because the log-likelihood’s curvature grows as ρ².',
          explain: t`$${w1}\times${r1}/${r2} = ${nice(ans, 3)}\ M_\odot$. This scaling holds only once the posterior is a single Gaussian-like peak; near the detection threshold it is broad and lumpy.`,
        };
      },
    }),
    {
      type: 'slider', id: 'target-precision', difficulty: 2,
      prompt: t`The record below holds a $30\ M_\odot$ chirp. How loud must it be for the $90\%$ credible interval on chirp mass to be narrower than $1\ M_\odot$? Set the signal strength to the smallest value that achieves it.`,
      visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 0.6, seed: 2, panels: ['post'], controls: ['amp'], hide: ['opt'] }, caption: t`The chirp-mass posterior for this record; the interval is in the readout. Toy model: white noise, maximized likelihood, flat prior.` },
      param: 'amp', answer: [1.35, 1.5],
      instruction: 'Raise the signal until the 90% interval is just under 1 M☉ wide, then check.',
      hints: ['Read the interval from the readout as you move the slider.', t`It is near $2\ M_\odot$ wide at a signal of $0.7\sigma$ and shrinks steadily after that.`],
      teach: 'Measurement precision is bought with SNR: halving an error bar needs roughly twice the signal-to-noise.',
      explain: t`The interval first drops below $1\ M_\odot$ at a signal of about $1.35\sigma$ (SNR near $10$). Below about $0.7\sigma$ the posterior spreads over the whole range: no measurement at all.`,
    },
    mcq({
      id: 'credible-meaning', difficulty: 2,
      prompt: t`A catalogue reports a chirp mass of $30.2^{+2.5}_{-1.9}\ M_\odot$ ($90\%$ credible interval). What does that interval mean?`,
      visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 1, seed: 4, panels: ['post'], controls: false, readout: false }, caption: t`A posterior with its central $90\%$ interval shaded: $5\%$ of the probability lies on each side.` },
      choices: [
        t`Given these data, the model and the prior, there is a $90\%$ probability that the chirp mass lies in $28.3$–$32.7\ M_\odot$`,
        t`If the detection were repeated many times, $90\%$ of the measured values would fall in $28.3$–$32.7\ M_\odot$`,
        t`The chirp mass is $30.2\ M_\odot$ with $90\%$ certainty and the rest is noise`,
        t`$90\%$ of binary black holes have chirp masses in that range`,
      ],
      answer: 0,
      why: {
        1: t`That describes a frequentist procedure’s long-run coverage, not a statement about this event’s parameter. In well-calibrated analyses the two nearly agree, but they answer different questions.`,
        2: t`The interval is a range of plausible values, not a point estimate with a confidence attached.`,
        3: t`This is one event’s parameter, not the population’s distribution.`,
      },
      hints: [t`A credible interval is a statement about $p(\theta \mid d)$.`, 'It conditions on the data you actually have.'],
      teach: 'A credible interval is a range holding a stated fraction of the posterior probability, for this event, given the model and the prior.',
      explain: t`$30.2^{+2.5}_{-1.9}$ means the posterior’s median is $30.2$ and $5\%$ of its probability lies below $28.3$ and $5\%$ above $32.7$. It inherits every assumption — the waveform model, the noise model, the prior.`,
    }),
    mcq({
      id: 'residual', difficulty: 3,
      prompt: t`For Gaussian noise, $p(d \mid \theta) \propto \exp\bigl(-\tfrac12\langle d - h(\theta), d - h(\theta)\rangle\bigr)$. Expanding gives $\ln L = \langle d, h\rangle - \tfrac12\langle h, h\rangle + \text{const}$. What does each term reward?`,
      visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 1.5, seed: 2, panels: ['data'], controls: false, readout: false, reveal: true }, caption: t`The record with the true signal drawn over it. Subtract the right waveform and what is left looks like pure noise.` },
      choices: [
        t`$\langle d, h\rangle$ rewards a waveform that correlates with the data; $-\tfrac12\langle h, h\rangle$ penalizes a loud waveform the data do not contain`,
        t`$\langle d, h\rangle$ is the noise and $\langle h, h\rangle$ the signal, so their ratio is the SNR`,
        t`Both reward loud waveforms, so the likelihood always prefers the nearest, heaviest source`,
        t`The constant $\langle d, d\rangle$ carries all the information about $\theta$`,
      ],
      answer: 0,
      why: {
        1: t`Both terms involve the model waveform; neither is “the noise”. Their balance, not their ratio, sets the likelihood.`,
        2: t`The second term enters with a minus sign: a waveform louder than anything in the data is penalized.`,
        3: t`$\langle d, d\rangle$ does not depend on $\theta$, so it drops out of every posterior.`,
      },
      hints: [t`Expand $\langle d - h, d - h\rangle = \langle d, d\rangle - 2\langle d, h\rangle + \langle h, h\rangle$.`, t`Which terms depend on $\theta$, and with which sign?`],
      teach: 'The Gaussian-noise likelihood rewards waveforms that leave noise-like residuals: high correlation with the data, but no more loudness than the data hold.',
      explain: t`Maximizing over an overall amplitude $A$ in $h = A\hat h$ gives $A = \langle d, \hat h\rangle/\langle\hat h, \hat h\rangle$ and $\ln L = \tfrac12\rho^2$ — the matched-filter SNR again, which is why the simulation’s posterior is $\propto e^{\rho^2/2}$.`,
    }),
    code({
      id: 'grid-posterior', difficulty: 3,
      prompt: t`At leading order, $\dot f = \tfrac{96}{5}\pi^{8/3}(G\mathcal M/c^3)^{5/3}f^{11/3}$. Suppose a track in the data gives $\dot f = 3740 \pm 370\ \text{Hz/s}$ (Gaussian) at exactly $f = 100\ \text{Hz}$. Write \`posterior(Mc)\` returning the normalized posterior density on a grid of chirp masses (in $M_\odot$), with a flat prior on $20$–$40\ M_\odot$: evaluate the Gaussian likelihood of the measured $\dot f$ at each grid value, then divide by its integral (\`np.trapezoid\`). The program prints the median and the central $90\%$ interval.`,
      starter: t`import numpy as np

G, c, Msun = 6.674e-11, 2.998e8, 1.989e30
T_sun = G * Msun / c**3          # the Sun's mass as a time, in seconds

def fdot(f, Mc):
    return 96 / 5 * np.pi**(8 / 3) * (Mc * T_sun)**(5 / 3) * f**(11 / 3)

def posterior(Mc):
    # likelihood of the measured 3740 +/- 370 Hz/s at 100 Hz, times a flat prior; normalize
    pass

Mc = np.linspace(20, 40, 4001)
p = posterior(Mc)
cdf = np.cumsum(p) * (Mc[1] - Mc[0])
lo, med, hi = np.interp([0.05, 0.5, 0.95], cdf, Mc)
print(f"chirp mass {med:.1f}, 90% interval {lo:.1f} to {hi:.1f} Msun")
`,
      answer: t`import numpy as np

G, c, Msun = 6.674e-11, 2.998e8, 1.989e30
T_sun = G * Msun / c**3          # the Sun's mass as a time, in seconds

def fdot(f, Mc):
    return 96 / 5 * np.pi**(8 / 3) * (Mc * T_sun)**(5 / 3) * f**(11 / 3)

def posterior(Mc):
    like = np.exp(-0.5 * ((fdot(100, Mc) - 3740) / 370)**2)
    return like / np.trapezoid(like, Mc)

Mc = np.linspace(20, 40, 4001)
p = posterior(Mc)
cdf = np.cumsum(p) * (Mc[1] - Mc[0])
lo, med, hi = np.interp([0.05, 0.5, 0.95], cdf, Mc)
print(f"chirp mass {med:.1f}, 90% interval {lo:.1f} to {hi:.1f} Msun")
`,
      tests: [
        { name: 'the posterior has unit area', code: 'abs(np.trapezoid(posterior(Mc), Mc) - 1) < 1e-6' },
        { name: 'it is never negative', code: 'posterior(Mc).min() >= 0' },
        { name: 'the median is near 30.5 solar masses', code: 'abs(med - 30.53) < 0.1' },
        { name: 'the 90% interval runs about 27.4 to 33.4', code: 'abs(lo - 27.42) < 0.1 and abs(hi - 33.44) < 0.1' },
      ],
      hints: [t`The likelihood is \`np.exp(-0.5 * ((fdot(100, Mc) - 3740) / 370)**2)\` — an array over the grid.`, t`Divide it by \`np.trapezoid(like, Mc)\` so it integrates to $1$.`],
      teach: 'A one-parameter posterior is a likelihood evaluated on a grid, times a prior, divided by its integral — the evidence.',
      explain: t`The median is $30.5\ M_\odot$ with $90\%$ in $27.4$–$33.4$. A $10\%$ error on $\dot f$ becomes about $6\%$ on $\mathcal M$, because $\dot f \propto \mathcal M^{5/3}$. Real analyses fit the whole waveform, not one $\dot f$, and with many parameters replace the grid by a sampler.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-source-frame', difficulty: 2, transfer: true,
      gen(r) {
        const Md = r.pick([12.6, 18.9, 26.4, 41.0]), z = r.pick([0.15, 0.26, 0.4, 0.62]);
        const ans = Md / (1 + z);
        return {
          prompt: t`A waveform fit gives a detector-frame chirp mass of $${Md}\ M_\odot$, and the measured distance, with standard cosmology, implies $z = ${z}$. What is the source-frame chirp mass?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 50], aspect: 'wide', axesAt: 'edge', xlabel: 'redshift z', ylabel: 'source-frame ℳ (M☉)', curves: [{ fn: `${Md}/(1 + x)`, color: 'accent', width: 2.2 }], vlines: [{ x: z, color: 'gold', label: `z = ${z}` }] }, caption: t`Source-frame chirp mass implied by the fixed detector-frame value, for each assumed redshift. An error in $z$ becomes an error in the source mass.` },
          answer: ans, units: 'Msun', tol: { rel: 0.005 },
          errors: [{ value: Md * (1 + z), feedback: t`Going from detector to source frame you **divide** by $1 + z$.` }, { value: Md * (1 - z), feedback: t`Divide by $1 + z$; multiplying by $1 - z$ is only its first-order approximation.` }],
          hints: [t`$\mathcal M_{\text{det}} = (1 + z)\mathcal M_{\text{src}}$.`, t`$\mathcal M_{\text{src}} = ${Md}/${1 + z}$.`],
          teach: 'Source-frame mass = detector-frame mass ÷ (1 + z), so its error budget includes the distance’s.',
          explain: t`$${Md}/(1 + ${z}) = ${nice(ans, 4)}\ M_\odot$. For distant events this division matters more than the measurement error on the detector-frame mass itself.`,
        };
      },
    }),
    num({
      id: 'cp-inclination', difficulty: 3,
      gen(r) {
        const D0 = r.pick([300, 400, 600]), deg = r.pick([45, 60, 70, 90]);
        const c = Math.cos((deg * Math.PI) / 180), ans = (D0 * (1 + c * c)) / 2;
        return {
          prompt: t`The plus-polarization amplitude of an inspiral scales as $\dfrac{1 + \cos^2\iota}{2D}$, where $\iota$ is the angle between the orbit’s axis and the line of sight. A face-on binary ($\iota = 0$) at $${D0}\ \text{Mpc}$ gives a certain $h_+$ amplitude. At what distance would an otherwise identical binary inclined at $\iota = ${deg}^\circ$ give the same?`,
          visual: { type: 'graph', params: { x: [0, 90], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'inclination ι (degrees)', ylabel: '(1 + cos²ι)/2', curves: [{ fn: '(1 + cos(x*pi/180)^2)/2', color: 'accent', width: 2.2 }], vlines: [{ x: deg, color: 'gold', label: `${deg}°` }] }, caption: t`The plus polarization’s inclination factor: an inclined binary is fainter, so it must be closer to look the same.` },
          answer: ans, units: 'Mpc', tol: { rel: 0.005 },
          errors: [{ value: (2 * D0) / (1 + c * c), feedback: t`An inclined binary is fainter, so to match it must be **closer**: multiply by the factor, do not divide.` }, { value: D0 * c, feedback: t`The factor is $(1 + \cos^2\iota)/2$, not $\cos\iota$ (that one belongs to the cross polarization).` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Set $\dfrac{1}{D_0} = \dfrac{1 + \cos^2\iota}{2D}$.`, t`$D = ${D0}\times(1 + \cos^2 ${deg}^\circ)/2$.`],
          teach: 'Distance and inclination trade off in the amplitude, so their posteriors are correlated — the distance–inclination degeneracy.',
          explain: t`$D = ${D0}\times${nice((1 + c * c) / 2, 3)} = ${nice(ans, 3)}\ \text{Mpc}$. A two-detector network that measures both polarizations partly breaks the degeneracy; one detector cannot. Since redshift comes from distance, this uncertainty feeds the source-frame masses.`,
        };
      },
    }),
    mcq({
      id: 'cp-calibration', difficulty: 3,
      prompt: t`An analysis is applied to $20$ simulated signals injected into real noise, each with its own $90\%$ credible interval for chirp mass. If the analysis is well calibrated, how many intervals should miss the injected value?`,
      visual: { type: 'graph', params: { x: [-0.5, 7.5], y: [0, 0.32], aspect: 'wide', axesAt: 'edge', xlabel: 'number of misses out of 20', ylabel: 'probability', xticks: 8, shade: [0.1216, 0.2702, 0.2852, 0.1901, 0.0898, 0.0319, 0.0089, 0.0020].map((p, k) => ({ fn: String(p), lower: 0, from: k - 0.35, to: k + 0.35, color: 'accent', alpha: 0.5 })) }, caption: t`The binomial distribution of misses when each interval independently has a $10\%$ chance to miss.` },
      choices: [
        t`About $2$, though anywhere from $0$ to $4$ is unremarkable`,
        t`None: a correct analysis never misses`,
        t`About $18$, since $90\%$ of $20$ is $18$`,
        t`Exactly $2$; any other number shows a bug`,
      ],
      answer: 0,
      why: {
        1: t`A $90\%$ interval that never missed would be too wide — badly calibrated in the other direction.`,
        2: t`$18$ is how many should **contain** the truth; the question asks how many miss.`,
        3: t`Misses are random: the number follows a binomial distribution with mean $2$ and spread about $1.3$.`,
      },
      hints: [t`Each interval misses with probability $0.1$.`, t`The expected number of misses is $20\times0.1$; the spread is $\sqrt{20\times0.1\times0.9}$.`],
      teach: 'A credible interval is calibrated if, over many injections, it contains the truth the stated fraction of the time — the standard test of a parameter-estimation pipeline.',
      explain: t`Expected misses: $2$, standard deviation $\sqrt{1.8} \approx 1.3$. Plotting the fraction of injections inside each credible level against the level (a P–P plot) is how gravitational-wave pipelines are checked; the simulation’s toy covers the truth $37$ times in $40$ noise draws at $90\%$.`,
    }),
  ],
  sources: [
    { label: 'Thrane & Talbot, An introduction to Bayesian inference in gravitational-wave astronomy, PASA 36, e010 (2019)', url: 'https://arxiv.org/abs/1809.02293' },
    { label: 'Ashton et al., Bilby: a user-friendly Bayesian inference library for gravitational-wave astronomy, ApJS 241, 27 (2019)', url: 'https://arxiv.org/abs/1811.02042' },
    { label: 'LIGO Scientific and Virgo Collaborations, Properties of the binary black hole merger GW150914, PRL 116, 241102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.241102' },
    { label: 'Cutler & Flanagan, Gravitational waves from merging compact binaries: how accurately can one extract the binary’s parameters from the inspiral waveform? PRD 49, 2658 (1994)', url: 'https://doi.org/10.1103/PhysRevD.49.2658' },
  ],
});
