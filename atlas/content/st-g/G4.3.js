// Signals in noise: matched filtering. Correlate the record with the expected
// waveform and normalize so noise alone gives unit spread: ρ = ⟨d, h⟩/(σ‖h‖).
// Cauchy–Schwarz makes this the best linear filter for white Gaussian noise;
// the optimal SNR A‖h‖/σ grows as √(samples), so a chirp whose peak equals the
// noise σ reaches ρ_opt ≈ 7.7 (sim model/sg2-matched.js, 30 M☉, 30→250 Hz at
// 4096 Hz). Worked: a 0.5 s, 100 Hz burst at 0.2σ gives ρ = 6.4. Template
// mismatch (match 0.97 loses 8.7% of the event rate), network SNR in
// quadrature, the trials factor (max of noise over N times grows like
// √(2 ln N)), phase-maximized noise P(ρ > x) = e^(−x²/2), noise weighting by
// 1/S_n for coloured noise. Code: a filter with np.correlate. Transfer: how far
// GW150914 could have been seen (SNR 24 at 410 Mpc). Overlaps: G3.1 (overlap as
// a cosine), st-e E3.2 (convolution), prog P12.1 (FFT), gr S27 (the chirp).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'st-g.G4.3',
  title: 'Signals in noise: matched filtering',
  minutes: 18, difficulty: 3,
  intro: t`LIGO’s strain data are dominated by noise; a binary black-hole chirp is buried in it. If you know the **shape** of what you are looking for, slide that shape — the **template** — along the data and multiply-and-add at every position. Where the template lines up with a real signal, every cycle adds in step while the noise adds at random. Normalized so that noise alone gives an output of spread $1$, this is the signal-to-noise ratio:

$$\rho(t_0) = \frac{\langle d, h_{t_0}\rangle}{\sigma\,\lVert h\rVert}$$

It is an inner product in the sense of [normed and inner-product spaces](#/lesson/st-g.G3.1), computed for every arrival time at once by the [convolution theorem](#/lesson/st-e.E3.2) and an [FFT](#/lesson/prog.P12.1).`,
  symbols: [
    { tex: 'd', text: t`the data: the recorded samples $d_i$, signal plus noise` },
    { tex: 'h_{t_0}', text: t`the template — the expected waveform — placed so that it ends (merges) at time $t_0$` },
    { tex: '\\langle d, h\\rangle', text: t`the inner product $\sum_i d_i h_i$: multiply sample by sample and add. For real, coloured noise each frequency is weighted by $1/S_n(f)$ — see below.` },
    { tex: '\\sigma', text: 'the standard deviation of the noise in one sample (white noise: the same in every sample, uncorrelated between samples)' },
    { tex: '\\lVert h\\rVert', text: t`the template’s length, $\sqrt{\langle h, h\rangle}$` },
    { tex: '\\rho(t_0)', text: t`the signal-to-noise ratio (SNR) at arrival time $t_0$, in units of the noise-only spread` },
  ],
  why: 'Matched filtering found GW150914 and finds nearly every compact-binary merger since: the searches run banks of templates against the data and flag where ρ climbs far above what noise produces.',
  visual: {
    type: 'sg2-matched',
    title: 'Find the hidden chirp',
    lead: t`Top: one second of noise with a chirp hidden in it, its peak equal to the noise’s $\sigma$. Middle: the filter output $\rho(t)$ for the template you choose. Bottom: the loudest $\rho$ each template finds, across a bank of chirp masses.`,
    tasks: [
      t`Slide the template to $30\ M_\odot$: a spike near $\rho \approx 8$ stands out of a noise floor near $1$ — although you cannot see the signal in the top panel at all. Turn on “Reveal” to check.`,
      t`Set the signal to $0.3\sigma$: the spike sinks into the noise peaks. Then press “New noise” a few times: the noise peaks wander, the real spike stays put.`,
      t`Compare $15$ and $60\ M_\odot$ templates: the light chirp lasts $0.8\ \text{s}$ and $38$ cycles, the heavy one $0.08\ \text{s}$ and $4$. More cycles, more SNR from the same peak amplitude.`,
    ],
    params: { Mc: 30, tpl: 24, amp: 1, seed: 2, panels: ['data', 'snr', 'scan'] },
  },
  example: {
    prompt: t`A detector’s noise is white with standard deviation $\sigma$ per sample, at $4096$ samples per second. A sinusoidal burst at $100\ \text{Hz}$ lasting $0.5\ \text{s}$ has amplitude $0.2\sigma$. What SNR does a matched filter give it, and why is that the best any linear filter can do?`,
    visual: { type: 'graph', params: { x: [0, 0.05], y: [-3.5, 3.5], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'units of σ', curves: [{ fn: '0.2*sin(2*pi*100*x)', color: 'gold', width: 2.2, label: 'signal, 0.2σ', labelAt: 0.0075, labelDy: -12 }], hlines: [{ y: 1, color: 'ink3', label: '+σ' }, { y: -1, color: 'ink3', label: '−σ' }] }, caption: t`Five of the burst’s fifty cycles against the noise’s $\pm1\sigma$ band. Each sample of signal is a fifth of the typical noise sample.` },
    steps: [
      { label: 'Noise output', text: t`With noise only, $\langle n, h\rangle = \sum n_i h_i$ is a sum of independent terms with variance $\sigma^2h_i^2$, so its variance is $\sigma^2\lVert h\rVert^2$. Dividing by $\sigma\lVert h\rVert$ gives an output with mean $0$ and standard deviation exactly $1$.` },
      { label: 'Signal output', text: t`If the data hold $A\,\hat h$ (the template shape, amplitude $A$), the output at the right time is $A\langle \hat h, \hat h\rangle/(\sigma\lVert\hat h\rVert) = A\lVert\hat h\rVert/\sigma$. The signal adds **coherently**, as $\lVert h\rVert^2$; the noise only as $\lVert h\rVert$.` },
      { label: 'Count samples', text: t`$0.5\ \text{s}$ at $4096\ \text{Hz}$ is $L = 2048$ samples of $\sin$, whose square averages $\tfrac12$: $\lVert\hat h\rVert = \sqrt{L/2} = 32$ for unit amplitude.` },
      { label: 'The SNR', text: t`$\rho = 0.2 \times 32 = 6.4$. A signal one fifth of the noise per sample stands $6.4$ standard deviations clear once its $2048$ samples are added in step.` },
      { label: 'Why it is optimal', text: t`Any other linear filter $q$ gives $\rho_q = A\langle\hat h, q\rangle/(\sigma\lVert q\rVert)$. By Cauchy–Schwarz, $\langle\hat h, q\rangle \le \lVert\hat h\rVert\,\lVert q\rVert$, with equality only when $q \propto \hat h$. The filter that matches the signal wins.` },
    ],
    answer: t`$\rho = (A/\sigma)\sqrt{L/2} = 0.2\times\sqrt{1024} = 6.4$; by Cauchy–Schwarz no linear filter beats the template itself in white Gaussian noise.`,
  },
  practice: [
    num({
      id: 'snr-burst', difficulty: 2,
      gen(r) {
        const a = r.pick([0.05, 0.1, 0.15, 0.25]), T = r.pick([0.25, 1, 2]), fs = r.pick([2048, 4096]);
        const ans = a * Math.sqrt((fs * T) / 2);
        return {
          prompt: t`A sinusoidal signal of amplitude $${a}\sigma$ lasts $${T}\ \text{s}$ in white noise sampled at $${fs}\ \text{Hz}$. What SNR does the matched filter give it?`,
          visual: { type: 'graph', params: { x: [0, 0.05], y: [-1.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'units of σ', curves: [{ fn: `${a}*sin(2*pi*60*x)`, color: 'gold', width: 2.2 }], hlines: [{ y: 1, color: 'ink3', label: '+σ' }, { y: -1, color: 'ink3', label: '−σ' }] }, caption: t`A short stretch of the signal against the noise’s $\pm1\sigma$ band (the frequency does not affect the answer).` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: a, feedback: t`That is the per-sample ratio. The filter adds $${fs * T}$ samples: the signal coherently, the noise at random.` }, { value: a * Math.sqrt(fs * T), feedback: t`$\sin^2$ averages $\tfrac12$, so $\lVert\hat h\rVert = \sqrt{L/2}$, not $\sqrt L$.` }, { value: (a * fs * T) / 2, feedback: t`The noise grows too: $\rho = A\lVert\hat h\rVert/\sigma$ with $\lVert\hat h\rVert = \sqrt{L/2}$, not $L/2$.` }],
          hints: [t`The number of samples is $L = ${fs}\times${T} = ${fs * T}$.`, t`$\rho = (A/\sigma)\sqrt{L/2}$.`],
          teach: t`The optimal SNR is $(A/\sigma)$ times the template’s length: it grows as the square root of the number of samples (or cycles) the signal lasts.`,
          explain: t`$\rho = ${a}\sqrt{${fs * T}/2} = ${nice(ans, 3)}$. Four times longer doubles the SNR — the reason long, low-mass inspirals are easier to dig out than their peak amplitude suggests.`,
        };
      },
    }),
    mcq({
      id: 'why-normalize', difficulty: 2,
      prompt: t`Why is the correlation $\langle d, h\rangle$ divided by $\sigma\lVert h\rVert$ before anyone looks at it?`,
      visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 0, seed: 5, panels: ['snr'], controls: false, readout: false }, caption: t`The filter output on noise alone (no signal in this record): it hovers around $1$, the mean of a phase-maximized output whose spread is set by the normalization.` },
      choices: [
        t`So that noise alone gives an output of standard deviation $1$, whatever the template’s size or the noise level: $\rho$ is then counted in noise standard deviations`,
        t`To make the template a unit vector, which is needed for the signal to add coherently`,
        t`To remove the signal’s amplitude, so that every signal gives $\rho = 1$`,
        t`It is a convention with no effect on which candidates stand out`,
      ],
      answer: 0,
      why: {
        1: t`The signal adds coherently whatever the template’s scale; the normalization is about calibrating the noise.`,
        2: t`A signal of amplitude $A$ gives $\rho = A\lVert\hat h\rVert/\sigma$, which grows with $A$: louder signals give larger $\rho$.`,
        3: t`Within one template it changes nothing, but comparing templates of different lengths, or detectors with different noise, needs a common scale — that is what the normalization provides.`,
      },
      hints: [t`What is the variance of $\sum n_ih_i$ for independent noise samples of variance $\sigma^2$?`],
      teach: t`Dividing by $\sigma\lVert h\rVert$ makes the noise-only output a standard normal (per quadrature), so thresholds mean the same thing for every template and detector.`,
      explain: t`$\operatorname{Var}\langle n, h\rangle = \sigma^2\lVert h\rVert^2$, so the normalized output has unit spread. Then a template bank of very different chirps can share one threshold, and two detectors’ SNRs can be combined.`,
    }),
    {
      type: 'slider', id: 'find-template', difficulty: 2,
      gen(r) {
        const Mc = r.pick([22, 26, 30]);
        return {
          prompt: t`A one-second record holds a chirp whose peak is $1.5$ times the noise’s $\sigma$. Slide the template’s chirp mass until the filter rings loudest: that is the search’s best estimate of the chirp mass.`,
          visual: { type: 'sg2-matched', params: { Mc, tpl: 45, amp: 1.5, seed: 3, panels: ['snr'], controls: ['tpl'], hide: ['opt'] }, caption: t`The filter output for your template; the peak SNR is in the readout. White noise and a leading-order chirp from 30 to 250 Hz.` },
          param: 'tpl', answer: [Mc - 1, Mc + 1.5],
          instruction: 'Slide the template chirp mass to make the peak SNR as large as you can, then check.',
          hints: [t`Watch the “peak SNR” readout as you move the slider: it rises as the template’s sweep approaches the signal’s.`, t`Sweep slowly through $20$ to $35\ M_\odot$; the maximum is sharp.`],
          teach: 'A template bank turns detection into estimation: the template that rings loudest has nearly the true chirp mass.',
          explain: t`The true chirp mass is $${Mc}\ M_\odot$. Templates a solar mass or two away drift out of phase with the signal over its cycles and lose SNR. The next lesson turns this peak into a posterior with an error bar.`,
        };
      },
    },
    num({
      id: 'mismatch', difficulty: 3,
      gen(r) {
        const m = r.pick([0.97, 0.95, 0.9, 0.8]);
        const ans = 100 * (1 - m ** 3);
        return {
          prompt: t`A template bank is spaced so that every real signal matches some template to at least $${m}$ of the optimal SNR. Signals are spread uniformly in volume and $\rho \propto 1/\text{distance}$, so the number detected above a fixed threshold scales as $\rho^3$. In the worst case, what percentage of detectable signals does the bank’s spacing lose?`,
          visual: { type: 'graph', params: { x: [0.7, 1], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'match (fraction of optimal SNR)', ylabel: 'fraction detected', curves: [{ fn: 'x^3', color: 'accent', width: 2.2, label: 'match³', labelAt: 0.75, labelDy: -10 }], vlines: [{ x: m, color: 'gold', label: `${m}` }] }, caption: t`Reach in distance scales with SNR, the volume reached with its cube.` },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * (1 - m), feedback: t`SNR is lost in proportion, but the volume — and the number of sources — goes as the cube of the reach.` }, { value: 100 * (1 - m * m), feedback: t`Volume grows as distance cubed, not squared.` }],
          hints: [t`The reach in distance falls by the factor $${m}$.`, t`The fraction kept is $${m}^3$; the loss is $1 - ${m}^3$.`],
          teach: 'A small loss of SNR is a larger loss of events: detected numbers scale as SNR cubed, which is why template banks are packed densely.',
          explain: t`$1 - ${m}^3 = ${nice(ans / 100, 3)}$, about $${nice(ans, 3)}\%$. Compact-binary banks are commonly built for a minimal match of $0.97$: under $10\%$ loss in the worst place, less on average.`,
        };
      },
    }),
    num({
      id: 'network', difficulty: 2,
      gen(r) {
        const a = r.pick([6, 8, 12, 15]), b = r.pick([5, 7, 9]);
        const ans = Math.hypot(a, b);
        return {
          prompt: t`Two detectors with independent noise see the same signal with matched-filter SNRs $${a}$ and $${b}$. The optimal combination is a matched filter on both data streams at once. What is the network SNR?`,
          visual: { type: 'graph', params: { x: [0, 16], y: [0, 11], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'SNR in detector 1', ylabel: 'SNR in detector 2', arrows: [{ from: [0, 0], to: [a, 0], color: 'accent', label: 'ρ₁' }, { from: [a, 0], to: [a, b], color: 'violet', label: 'ρ₂' }] }, caption: t`Independent detectors are perpendicular directions in the combined data space.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a + b, feedback: t`Noise adds in quadrature between independent detectors, so the SNRs do too: $\sqrt{\rho_1^2 + \rho_2^2}$.` }, { value: (a + b) / 2, feedback: 'Averaging throws away information: a second detector can only help.' }],
          hints: [t`$\lVert h\rVert^2$ adds over the two data streams.`, t`$\rho_{\text{net}} = \sqrt{${a}^2 + ${b}^2}$.`],
          teach: 'Optimal SNRs from independent detectors add in quadrature, because squared template norms add.',
          explain: t`$\sqrt{${a * a} + ${b * b}} = ${nice(ans, 3)}$. A second detector also lets coincidence in time — within the light-travel time between sites — reject noise that strikes only one.`,
        };
      },
    }),
    num({
      id: 'trials', difficulty: 3,
      gen(r) {
        const N = r.pick([1e3, 1e4, 1e5, 1e6]);
        const ans = Math.sqrt(2 * Math.log(N / 0.01));
        const e = Math.round(Math.log10(N));
        return {
          prompt: t`With noise only, a phase-maximized filter output at one arrival time exceeds $x$ with probability $e^{-x^2/2}$. A search tries $10^{${e}}$ independent arrival times. What threshold $x$ keeps the chance of **any** noise output above it to $1\%$?`,
          visual: { type: 'graph', params: { x: [0, 7], y: [-9, 0], ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'threshold x', ylabel: 'P(ρ > x)', curves: [{ fn: `-x^2/(2*${Math.LN10})`, color: 'accent', width: 2.2, label: 'one trial', labelAt: 2, labelDx: 6 }], hlines: [{ y: -2 - e, color: 'gold', label: `1% ÷ 10${String(e).replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}` }] }, caption: t`The noise tail for one arrival time, on a logarithmic axis. Each trial must be held below $1\%$ divided by the number of trials.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(2 * Math.log(100)), feedback: t`That protects one trial. With $10^{${e}}$ trials each must be rarer by that factor: $e^{-x^2/2} = 0.01/10^{${e}}$.` }],
          hints: [t`For small probabilities, $P(\text{any}) \approx N e^{-x^2/2}$.`, t`Solve $N e^{-x^2/2} = 0.01$: $x = \sqrt{2\ln(N/0.01)}$.`],
          teach: 'The largest noise output over N trials grows like √(2 ln N): every template and every arrival time searched raises the bar a real signal must clear.',
          explain: t`$x = \sqrt{2\ln(10^{${e}}/0.01)} = ${nice(ans, 3)}$. The growth is only logarithmic, which is why searching millions of times is affordable. Real searches estimate the noise background directly (sliding one detector’s data in time against the other’s) because real noise has glitches no Gaussian formula captures.`,
        };
      },
    }),
    mcq({
      id: 'coloured', difficulty: 3,
      prompt: t`Real detector noise is coloured: its power spectral density $S_n(f)$ is huge at low frequency (seismic), lowest near $100$–$300\ \text{Hz}$, and rises again at high frequency (photon shot noise). The matched filter becomes $\langle d, h\rangle = 4\,\mathrm{Re}\displaystyle\int \frac{\tilde d(f)\,\tilde h^*(f)}{S_n(f)}\,df$. What does dividing by $S_n$ do?`,
      visual: { type: 'graph', params: { x: [1, 3.5], y: [-2.5, 1.5], xlog: true, ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'frequency (Hz)', ylabel: 'noise (relative)', curves: [{ fn: 'log10((10^x/40)^(-8) + 1 + (10^x/200)^2)/2', color: 'bad', width: 2.2, label: 'noise amplitude (schematic)', labelAt: 2.6, labelDx: 6, labelDy: -14 }] }, caption: t`A schematic noise curve, not a measured one: a seismic wall at low frequency, a bucket, and shot noise rising at high frequency.` },
      choices: [
        t`It weights each frequency by how quiet the detector is there, so the filter listens hardest where the noise is lowest — the matched filter for whitened data`,
        t`It removes the signal at frequencies where the noise is high, so the template must be redesigned`,
        t`It converts the strain into energy units`,
        t`It is only needed for loud signals; quiet ones use the white-noise formula`,
      ],
      answer: 0,
      why: {
        1: t`Nothing is removed; noisy frequencies are down-weighted, in proportion to how noisy they are. The template is unchanged.`,
        2: t`The units are those of an SNR squared — dimensionless. $S_n$ is a noise power per hertz, used as a weight.`,
        3: t`The weighting depends on the noise, not on the signal’s loudness; it is always applied.`,
      },
      hints: [t`Where $S_n$ is large, is a term in the integral counted more or less?`, t`Dividing the data by $\sqrt{S_n}$ makes the noise white; then the white-noise filter applies.`],
      teach: t`For coloured noise the optimal inner product weights each frequency by $1/S_n(f)$: equivalently, whiten the data and template, then filter as for white noise.`,
      explain: t`With white noise $S_n$ is constant and this reduces to $\sum d_ih_i/\sigma^2$ (up to normalization). LIGO’s sensitive band — where most of a stellar-mass binary’s SNR accumulates — is set by where $S_n$ is lowest.`,
    }),
    code({
      id: 'filter-code', difficulty: 3,
      prompt: t`The program builds a chirp template \`h\` (a quarter-second sweep from 40 to 240 Hz at 4096 samples per second) and hides it, at amplitude $0.5\sigma$, at sample $2500$ of a noisy record \`d\` ($\sigma = 1$). Write \`snr_series(d, h)\` returning $\langle d, h_k\rangle/\lVert h\rVert$ for every placement $k$ of the template that fits inside the record (start index $k = 0, 1, \dots$). Use \`np.correlate(d, h, mode="valid")\` and \`np.linalg.norm\`. (The template’s phase is known here, so one quadrature suffices.)`,
      starter: t`import numpy as np

fs = 4096
t = np.arange(0, 0.25, 1 / fs)
f = 40 + 800 * t
h = np.sin(2 * np.pi * (40 * t + 400 * t**2)) * (f / 240) ** (2 / 3)

rng = np.random.default_rng(3)
d = rng.normal(0, 1, 4096)
d[2500:2500 + len(h)] += 0.5 * h

def snr_series(d, h):
    pass

rho = snr_series(d, h)
print("peak SNR", round(rho.max(), 2), "at sample", rho.argmax())
print("optimal SNR", round(0.5 * np.linalg.norm(h), 2))
`,
      answer: t`import numpy as np

fs = 4096
t = np.arange(0, 0.25, 1 / fs)
f = 40 + 800 * t
h = np.sin(2 * np.pi * (40 * t + 400 * t**2)) * (f / 240) ** (2 / 3)

rng = np.random.default_rng(3)
d = rng.normal(0, 1, 4096)
d[2500:2500 + len(h)] += 0.5 * h

def snr_series(d, h):
    return np.correlate(d, h, mode="valid") / np.linalg.norm(h)

rho = snr_series(d, h)
print("peak SNR", round(rho.max(), 2), "at sample", rho.argmax())
print("optimal SNR", round(0.5 * np.linalg.norm(h), 2))
`,
      tests: [
        { name: 'one value for each placement that fits', code: 'len(snr_series(d, h)) == len(d) - len(h) + 1' },
        { name: 'the peak is within 3 samples of 2500', code: 'abs(int(np.argmax(snr_series(d, h))) - 2500) <= 3' },
        { name: 'the peak SNR is above 5', code: 'snr_series(d, h).max() > 5' },
        { name: 'on pure noise the output has standard deviation near 1', code: 'abs(snr_series(np.random.default_rng(11).normal(0, 1, 4096), h).std() - 1) < 0.15' },
      ],
      hints: [t`\`np.correlate(d, h, mode="valid")\` returns $\sum_i d_{k+i}h_i$ for every $k$ where $h$ fits.`, t`\`return np.correlate(d, h, mode="valid") / np.linalg.norm(h)\``],
      teach: 'A matched filter is one line of NumPy: correlate the data with the template and divide by the template’s norm (σ = 1).',
      explain: t`The output peaks at the hidden signal’s start with $\rho \approx 8$, near the optimal $0.5\lVert h\rVert = 8.05$, while noise alone gives spread $1$. On long records the same correlation is done by FFT — the convolution theorem — in $N\log N$ operations.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reach', difficulty: 2, transfer: true,
      gen(r) {
        const target = r.pick([8, 10, 12]);
        const ans = (410 * 24) / target;
        return {
          prompt: t`GW150914 was recorded with network SNR $24$ from about $410\ \text{Mpc}$. The SNR of a given binary falls as $1/\text{distance}$. Ignoring cosmological redshift, how far away could an identical binary have been and still reached $\rho = ${target}$?`,
          visual: { type: 'graph', params: { x: [0, 1400], y: [0, 30], aspect: 'wide', axesAt: 'edge', xlabel: 'distance (Mpc)', ylabel: 'SNR', curves: [{ fn: `24*410/x`, color: 'accent', width: 2.2, domain: [300, 1400] }], points: [{ x: 410, y: 24, color: 'gold', label: 'GW150914' }], hlines: [{ y: target, color: 'ink3', label: `ρ = ${target}` }] }, caption: t`SNR against distance for a GW150914-like binary, $\rho \propto 1/D$. At large distance redshift changes the observed signal; not included.` },
          answer: ans, units: 'Mpc', tol: { rel: 0.01 },
          errors: [{ value: 410 * Math.sqrt(24 / target), feedback: t`Strain amplitude, and so $\rho$, falls as $1/D$, not $1/\sqrt D$.` }, { value: (410 * target) / 24, feedback: t`Inverted: a lower SNR means a larger distance.` }],
          hints: [t`$\rho D$ is constant.`, t`$D = 410 \times 24/${target}$.`],
          teach: 'Strain falls as 1/distance, so SNR does too: halving the SNR you need doubles your reach and multiplies the volume searched by eight.',
          explain: t`$D = 410\times24/${target} \approx ${nice(ans, 3)}\ \text{Mpc}$. Volume grows as $D^3$, which is why each improvement in detector noise multiplies the detection rate.`,
        };
      },
    }),
    num({
      id: 'cp-noise-tail', difficulty: 3,
      gen(r) {
        const x = r.pick([3, 4, 5, 6]);
        const ans = Math.exp(-x * x / 2);
        return {
          prompt: t`At one arrival time, a phase-maximized filter output on pure Gaussian noise has $\rho^2 = X^2 + Y^2$ with $X, Y$ independent standard normals, so $P(\rho > x) = e^{-x^2/2}$. What is $P(\rho > ${x})$? Give two significant figures.`,
          visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 0, seed: 9, panels: ['snr'], controls: false, readout: false }, caption: t`The phase-maximized filter output on a record of pure noise. Its mean is $\sqrt{\pi/2} \approx 1.25$.` },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.exp(-x), feedback: t`The exponent is $-x^2/2$, not $-x$.` }],
          hints: [t`$\rho^2$ with two Gaussian components is exponentially distributed with mean $2$.`, t`$e^{-${x * x}/2}$.`],
          teach: 'Maximizing over phase makes noise-only ρ Rayleigh-distributed: $P(\\rho > x) = e^{-x^2/2}$, heavier than one Gaussian’s tail.',
          explain: t`$e^{-${x * x / 2}} = ${tex(ans, 2)}$. Compare one quadrature’s one-sided tail at $${x}$: smaller, because maximizing over phase gives the noise two chances.`,
        };
      },
    }),
    mcq({
      id: 'cp-heavy', difficulty: 3,
      prompt: t`Two binaries produce chirps with the same peak strain. One has chirp mass $15\ M_\odot$, the other $60\ M_\odot$. From $30$ to $250\ \text{Hz}$ the first lasts $0.81\ \text{s}$, the second $0.08\ \text{s}$. In white noise, which gives the larger optimal SNR, and roughly by how much?`,
      visual: { type: 'sg2-matched', params: { Mc: 15, tpl: 60, amp: 1, seed: 2, panels: ['data'], controls: ['reveal'], readout: false, reveal: true }, caption: t`A $15\ M_\odot$ chirp (gold, revealed) in one second of noise; a $60\ M_\odot$ chirp would occupy only the last tenth of it.` },
      choices: [
        t`The $15\ M_\odot$ chirp, by about $\sqrt{10} \approx 3$: SNR grows as the square root of the samples it lasts`,
        t`The $60\ M_\odot$ chirp: heavier binaries are louder`,
        t`They are equal: SNR depends on the peak amplitude only`,
        t`The $15\ M_\odot$ chirp, by about $10$: SNR grows in proportion to duration`,
      ],
      answer: 0,
      why: {
        1: t`At equal **peak** strain, as stated, mass does not make it louder. (In reality heavier binaries also have larger strain at a given frequency.)`,
        2: t`The filter adds every sample the signal occupies; peak amplitude alone ignores how long it lasts.`,
        3: t`Signal adds as $L$ but noise as $\sqrt L$, so the ratio grows as $\sqrt L$.`,
      },
      hints: [t`$\rho_{\text{opt}} = A\lVert\hat h\rVert/\sigma$, and $\lVert\hat h\rVert^2$ grows with the number of samples.`, t`The duration ratio is $0.81/0.08 \approx 10$; the SNR ratio is its square root.`],
      teach: 'At fixed amplitude, SNR grows as the square root of the signal’s duration in band — long inspirals accumulate SNR cycle by cycle.',
      explain: t`In the simulation’s model the unit-peak template norms are $13.6$ for $15\ M_\odot$ and $4.2$ for $60\ M_\odot$, a ratio of $3.2$ — close to $\sqrt{0.81/0.08} = 3.2$. Binary neutron stars sweep through LIGO’s band for about a minute, thousands of cycles: that is how GW170817 reached the highest SNR of its time.`,
    }),
  ],
  sources: [
    { label: 'Allen, Anderson, Brady, Brown & Creighton, FINDCHIRP: an algorithm for detection of gravitational waves from inspiraling compact binaries, PRD 85, 122006 (2012)', url: 'https://arxiv.org/abs/gr-qc/0509116' },
    { label: 'LIGO Scientific and Virgo Collaborations, A guide to LIGO–Virgo detector noise and extraction of transient gravitational-wave signals, CQG 37, 055002 (2020)', url: 'https://arxiv.org/abs/1908.11170' },
    { label: 'LIGO Scientific and Virgo Collaborations, Observation of gravitational waves from a binary black hole merger, PRL 116, 061102 (2016)', url: 'https://arxiv.org/abs/1602.03837' },
    { label: 'GWOSC tutorials: matched filtering on open data', url: 'https://gwosc.org/tutorials/' },
  ],
});
