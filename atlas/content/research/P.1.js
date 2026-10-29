// Miniature project 1 — GW150914: find the chirp with a matched filter.
// A guided mini-paper on SYNTHETIC data: a leading-order (Newtonian)
// inspiral of chirp mass 30 M☉ (30 → 250 Hz) in white Gaussian noise in two
// detectors, Livingston 6.9 ms ahead of Hanford and inverted, as in the real
// event. Steps: phase-maximized matched filter by FFT → arrival times and
// SNRs → the inter-site lag against the ~10 ms light-travel bound → a
// template bank for the chirp mass → a noise-only background for the false-
// alarm probability → comparison with the published SNR 24, 𝓜 ≃ 30 M☉
// (detector frame), lag 6.9 ms. The PRL's chirp-mass formula from f and ḟ is
// the lesson's equation. Matched filtering itself is st-g.G4.3; the real
// coloured-noise analysis (whitening, band-pass) is the GWOSC tutorial.
// Every number quoted from the Explore code was copied from running it in
// this Atlas's Pyodide (NumPy 2.4).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { sci, SRC2 } from './_rs2.js';

const t = String.raw;
const TSUN = 4.925491e-6;                          // G M☉ / c³, s
const fdot = (Mc, f) => (96 / 5) * Math.PI ** (8 / 3) * (Mc * TSUN) ** (5 / 3) * f ** (11 / 3);
const mcFrom = (f, fd) => ((5 / 96) * Math.PI ** (-8 / 3) * f ** (-11 / 3) * fd) ** 0.6 / TSUN;
const tauOf = (Mc, f) => (5 / 256) * (Math.PI * f) ** (-8 / 3) * (Mc * TSUN) ** (-5 / 3);

// the Python shared by the Explore and the exercises
const PRELUDE = t`import numpy as np

fs = 4096                        # samples per second
t = np.arange(0, 4, 1 / fs)      # a 4-second record
TSUN = 4.925491e-6               # G M_sun / c^3, in seconds

def chirp(Mc, tc, f_lo=30.0, f_hi=250.0):
    """Leading-order inspiral ending at tc: the two polarizations, peak 1."""
    tM = Mc * TSUN
    tau = np.maximum(tc - t, 1e-6)                    # time to coalescence
    f = (5 / (256 * tau)) ** 0.375 / (np.pi * tM ** 0.625)
    phase = -2 * (tau / (5 * tM)) ** 0.625
    on = (f >= f_lo) & (f <= f_hi) & (t < tc)
    amp = np.where(on, (f / f_hi) ** (2 / 3), 0.0)
    return amp * np.cos(phase), amp * np.sin(phase)

def snr(d, Mc):
    """Matched-filter SNR (maximized over phase) for every end time t[i]."""
    hc, hs = chirp(Mc, tc=t[-1])
    D = np.fft.rfft(d)
    zc = np.fft.irfft(D * np.conj(np.fft.rfft(hc)), len(d))
    zs = np.fft.irfft(D * np.conj(np.fft.rfft(hs)), len(d))
    return np.roll(np.sqrt(zc**2 + zs**2) / np.sqrt(np.sum(hc**2)), -1)

# SYNTHETIC data: white noise (sigma = 1) plus a 30 M_sun chirp in each
# detector, L arriving 6.9 ms before H and inverted, as for GW150914
rng = np.random.default_rng(150914)
H = rng.normal(size=t.size) + 1.6 * chirp(30.0, 2.5)[0]
L = rng.normal(size=t.size) - 1.6 * chirp(30.0, 2.5 - 0.0069)[0]
`;

const EXPLORE = PRELUDE + t`
import atlas.plot as plt
zH, zL = snr(H, 30.0), snr(L, 30.0)
iH, iL = np.argmax(zH), np.argmax(zL)
print(f"H: peak SNR {zH[iH]:.1f} at t = {t[iH]:.4f} s")
print(f"L: peak SNR {zL[iL]:.1f} at t = {t[iL]:.4f} s")
print(f"L leads H by {(t[iH] - t[iL]) * 1e3:.1f} ms")
print(f"network SNR {np.hypot(zH[iH], zL[iL]):.1f}")

bank = np.arange(20, 40.5, 0.5)
best = bank[np.argmax([snr(H, m).max() for m in bank])]
print(f"best template chirp mass (H): {best} M_sun")

plt.plot(t, zH, label="Hanford")
plt.plot(t, zL, label="Livingston")
plt.xlabel("chirp end time (s)"); plt.ylabel("SNR"); plt.legend(); plt.show()
`;
// copied from running EXPLORE in Pyodide
const OUT = { sH: 12.8, tH: 2.5, sL: 11.1, tL: 2.4929, lag: 7.1, net: 16.9, best: 30.0 };

// the chirp's frequency against time before coalescence
const chirpPic = (Mc, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [-0.3, 0], y: [0, 280], aspect: 'wide', axesAt: 'edge', xlabel: 'time before coalescence (s)', ylabel: 'GW frequency (Hz)', xticks: 6, yticks: 4,
    curves: [{ fn: `(5/(256*max(-x, 0.0001)))^0.375/(pi*${(Mc * TSUN).toExponential(5)}^0.625)`, domain: [-0.3, -0.0005], color: 'accent', width: 2.2 }],
    hlines: [{ y: 250, label: '250 Hz cut', color: 'ink4' }],
    ...extra,
  },
  caption,
});
const lagPic = (caption, { show = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-14, 14], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'arrival time at H minus arrival at L (ms)', ylabel: '', yticks: 0, xticks: 7,
    shade: [{ fn: '1', lower: '0', from: -10, to: 10, color: 'good', alpha: 0.12 }],
    vlines: [{ x: -10, label: '−10 ms', color: 'good' }, { x: 10, label: '+10 ms', color: 'good' }, ...(show ? [{ x: OUT.lag, label: 'this analysis', color: 'gold' }] : [])],
  },
  caption,
});
const filterPic = (caption, panels = ['data', 'snr']) => ({ type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 1, seed: 3, panels, controls: false, readout: false }, caption });

export default lesson({
  id: 'research.P.1',
  title: 'GW150914: find the chirp with a matched filter',
  minutes: 25, difficulty: 3,
  intro: t`**The question.** On 14 September 2015 both LIGO detectors recorded a chirp: a signal sweeping up from 35 to 250 Hz in about 0.2 s, which the discovery paper read as two black holes merging. This project asks what that claim rests on: can a matched filter find such a chirp in noise, at what time in each detector, with what chirp mass — and could noise alone have done it?

**The data are synthetic**, and say so: a leading-order (Newtonian) inspiral of chirp mass $30\,M_\odot$ in white Gaussian noise, in two detectors, with Livingston’s copy arriving 6.9 ms earlier and inverted, as in the real event. Real LIGO noise is coloured and must be whitened first ([the GWOSC tutorial](https://github.com/losc-tutorial/LOSC_Event_tutorial) does it). The discovery paper estimated the **chirp mass** from the frequency $f$ and its rate of change $\dot f$:

$$\mathcal{M} = \frac{c^3}{G}\left[\frac{5}{96}\,\pi^{-8/3} f^{-11/3}\,\dot f\,\right]^{3/5}$$`,
  symbols: [
    { tex: '\\mathcal{M}', text: t`the chirp mass $(m_1 m_2)^{3/5}/(m_1 + m_2)^{1/5}$, in kg (quoted in solar masses): the combination of the two masses that sets how fast the frequency rises` },
    { tex: 'f', text: 'the gravitational-wave frequency, in Hz (twice the orbital frequency)' },
    { tex: '\\dot f', text: 'how fast that frequency rises, in Hz per second' },
    { tex: 'c^3/G', text: t`converts a time to a mass: $GM_\odot/c^3 = 4.925\times10^{-6}$ s` },
  ],
  why: t`Matched filtering is how every compact-binary merger since GW150914 has been found — and a search is only a discovery once you know how often noise alone would fake it.`,
  visual: {
    type: 'code-runner',
    title: 'The whole analysis, in fifty lines',
    lead: t`Run it. The program builds the synthetic two-detector record, filters each detector with a $30\,M_\odot$ template, reports the peaks and the time lag, and scans a bank of templates for the chirp mass. The plot is the filter’s output: SNR against the time the chirp ends.`,
    tasks: ['Change the noise seed (150914) and run again: the peak SNRs move by about one.', 'Lower both signal amplitudes from 1.6 to 0.6: the peaks sink to 4 or 5, as high as the loudest noise, and the lag goes astray.', 'Filter with the wrong template, snr(H, 20.0): the peak drops, which is how the bank finds the mass.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'Synthetic data from a leading-order inspiral waveform in white Gaussian noise. No merger or ringdown is modelled, and the 30 → 250 Hz band is a hard cut.',
  },
  example: {
    prompt: t`Write the mini-paper’s results: arrival times and SNRs in each detector, the inter-site lag, and the chirp mass, each compared with the discovery paper (network SNR 24; $\mathcal{M} \simeq 30\,M_\odot$ in the detector frame; Livingston first, Hanford $6.9^{+0.5}_{-0.4}$ ms later).`,
    visual: filterPic('A chirp hidden in a noisy record (top) and the filter’s output (bottom): the peak marks where the template lines up. A one-second synthetic record from the matched-filter simulation, not the project’s data.'),
    steps: [
      { label: 'Detection', text: t`Hanford: peak SNR ${OUT.sH} at $t = ${OUT.tH.toFixed(4)}$ s. Livingston: ${OUT.sL} at $${OUT.tL.toFixed(4)}$ s. In noise alone the filter’s output averages $\sqrt{\pi/2} \approx 1.25$ and rarely passes 5, so both are clear.` },
      { label: 'The lag', text: t`Livingston leads by $${OUT.lag}$ ms (the injected value was 6.9 ms; one sample is 0.24 ms). A real wave crosses the 3000 km between the sites in at most about 10 ms, so the lag is **physical** — a lag of 30 ms would have meant two unrelated noise events.` },
      { label: 'Network SNR', text: t`In quadrature, $\sqrt{${OUT.sH}^2 + ${OUT.sL}^2} = ${OUT.net}$. The paper’s 24 came from real data and a full waveform — our number measures our injection, not the event.` },
      { label: 'Chirp mass', text: t`The template bank (20 to $40\,M_\odot$ in steps of 0.5) peaks at $${OUT.best}\,M_\odot$ — the injected value, and the paper’s $\simeq 30\,M_\odot$. At leading order the waveform depends on the masses only through $\mathcal{M}$, so the two masses separately are out of reach.` },
      { label: 'What is reproduced', text: t`The **method** is reproduced: a matched filter finds a 30-solar-mass chirp, at the right lag, with the right chirp mass. The **measurement** is not: that needs the real strain data, whitened against LIGO’s coloured noise.` },
    ],
    answer: t`SNRs ${OUT.sH} (H) and ${OUT.sL} (L), network ${OUT.net}; Livingston first by ${OUT.lag} ms, inside the 10 ms light-travel bound; best template $${OUT.best}\,M_\odot$. A synthetic reproduction of the paper’s method, not of its measurement.`,
  },
  practice: [
    num({
      id: 'mc-from-fdot', difficulty: 2,
      gen(r) {
        const Mc = r.pick([22, 26, 30, 34, 38]), f = r.pick([50, 75, 100, 120]);
        const fd = fdot(Mc, f), fdR = +fd.toPrecision(3), ans = mcFrom(f, fdR);
        return {
          prompt: t`At one moment of a chirp the frequency is $f = ${f}$ Hz and it is rising at $\dot f = ${sci(fdR, 3)}$ Hz/s. What is the chirp mass, in solar masses? ($GM_\odot/c^3 = 4.925\times10^{-6}$ s.)`,
          visual: chirpPic(Mc, 'The frequency of a chirp against time before coalescence: the slope at any point is ḟ.', { points: [{ x: -tauOf(Mc, f), y: f, color: 'gold', r: 5 }] }),
          answer: ans, units: 'Msun', tol: { rel: 0.01 },
          errors: [{ value: ((5 / 96) * Math.PI ** (-8 / 3) * f ** (-11 / 3) * fdR) / TSUN, feedback: 'You left out the 3/5 power.' }, { value: ((5 / 96) * Math.PI ** (-8 / 3) * f ** (-11 / 3) * fdR) ** 0.6, feedback: t`That is the chirp mass in seconds. Divide by $4.925\times10^{-6}$ s per solar mass.` }],
          hints: [t`Compute the bracket $\tfrac{5}{96}\pi^{-8/3} f^{-11/3}\dot f$ first: it has units of $\text{s}^{5/3}$.`, t`Raise it to the 3/5 power to get seconds, then divide by $4.925\times10^{-6}$ s.`],
          teach: 'A chirp’s frequency and its rate of rise together fix the chirp mass — the paper’s first mass estimate.',
          explain: t`$\left[\tfrac{5}{96}\pi^{-8/3}(${f})^{-11/3}(${sci(fdR, 3)})\right]^{3/5} = ${sci(ans * TSUN, 4)}$ s, which is $${ans.toFixed(1)}\,M_\odot$.`,
        };
      },
    }),
    num({
      id: 'time-in-band', difficulty: 2,
      gen(r) {
        const Mc = r.pick([25, 30, 35]), f = r.pick([30, 35, 40]);
        const ans = tauOf(Mc, f);
        return {
          prompt: t`At leading order a chirp of chirp mass $\mathcal{M}$ reaches coalescence a time $\tau = \tfrac{5}{256}(\pi f)^{-8/3}\,(G\mathcal{M}/c^3)^{-5/3}$ after its frequency passes $f$. For $\mathcal{M} = ${Mc}\,M_\odot$, how long, in seconds, does the signal take from $${f}$ Hz to coalescence?`,
          visual: chirpPic(Mc, `The ${Mc} M☉ chirp: frequency against time before coalescence.`),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (5 / 256) * (Math.PI * f) ** (-8 / 3) * (Mc * TSUN) ** (-3 / 5), feedback: t`The exponent on $G\mathcal{M}/c^3$ is $-5/3$.` }],
          hints: [t`$G\mathcal{M}/c^3 = ${Mc} \times 4.925\times10^{-6}$ s.`, 'Work in seconds and hertz throughout.'],
          teach: 'Heavier binaries sweep through the band faster, in fewer cycles.',
          explain: t`$\tau = ${ans.toFixed(3)}$ s. For GW150914 the paper describes about 0.2 s from 35 Hz to the peak — this simple formula gets the scale right; merger effects change the last few milliseconds.`,
        };
      },
    }),
    mcq({
      id: 'lag', difficulty: 2,
      prompt: t`Suppose the filter had found the peak in Hanford 31 ms after the peak in Livingston. What would that mean?`,
      visual: lagPic('A gravitational wave travelling at c reaches the two sites within about ±10 ms of each other (green); the gold line is this analysis.'),
      choices: ['The two peaks cannot be one wave: at most about 10 ms separate the sites, so at least one peak is noise', 'The source is very far away', 'The wave travelled slower than light', 'The source is directly overhead'],
      answer: 0,
      why: { 1: 'Distance changes the amplitude, not the delay between sites.', 2: 'A slower-than-light wave would be a revolutionary claim; two unrelated noise peaks is the ordinary one.', 3: 'Overhead, the wave reaches both sites at once: zero lag.' },
      hints: ['How long does light take to cross from one site to the other?'],
      teach: 'Coincidence within the light-travel time is a physical test that noise usually fails.',
      explain: 'The sites are about 3000 km apart, 10 ms for light. A delay longer than that cannot come from a single wave crossing both, so the coincidence fails. LIGO’s searches demand exactly this.',
    }),
    code({
      id: 'bank', difficulty: 3,
      prompt: t`Write \`best_chirp_mass(d, masses)\` that filters the record \`d\` with a template of each chirp mass in \`masses\` and returns the mass whose **peak** SNR is largest. The synthetic record and the helpers \`chirp\` and \`snr\` are given.`,
      starter: PRELUDE + t`
def best_chirp_mass(d, masses):
    """The template chirp mass whose peak SNR in d is largest."""
    pass

print(best_chirp_mass(H, np.arange(20, 40.5, 0.5)))
`,
      answer: PRELUDE + t`
def best_chirp_mass(d, masses):
    """The template chirp mass whose peak SNR in d is largest."""
    peaks = [snr(d, m).max() for m in masses]
    return masses[int(np.argmax(peaks))]

print(best_chirp_mass(H, np.arange(20, 40.5, 0.5)))
`,
      tests: [
        { name: 'it picks 30 from 22, 30 and 38 in Hanford', code: 'best_chirp_mass(H, np.array([22.0, 30.0, 38.0])) == 30.0' },
        { name: 'a fine bank finds the injected 30 within 1.5 in Hanford', code: 'abs(best_chirp_mass(H, np.arange(20, 40.5, 0.5)) - 30) <= 1.5' },
        { name: 'and in Livingston', code: 'abs(best_chirp_mass(L, np.arange(20, 40.5, 0.5)) - 30) <= 1.5' },
      ],
      hints: ['For each mass, `snr(d, m).max()` is that template’s peak.', '`masses[int(np.argmax(peaks))]` picks the mass with the largest peak.'],
      teach: 'A template bank turns the filter into a measurement: the template that rings loudest estimates the source.',
      explain: t`A list comprehension builds the peaks; \`np.argmax\` finds the loudest. The peak against mass is broad at this SNR — try plotting it — so the bank’s answer has an uncertainty of about a solar mass, which a fuller analysis turns into a posterior ([Bayesian estimation for gravitational waves](#/lesson/st-g.G4.4)).`,
    }),
    mcq({
      id: 'only-mc', difficulty: 3,
      prompt: t`Your bank finds $\mathcal{M} = 30\,M_\odot$. Why can it not tell you the two black holes’ masses separately?`,
      visual: chirpPic(30, 'At leading order this curve depends only on the chirp mass: many pairs (m₁, m₂) draw it identically.'),
      choices: [t`At leading order the waveform depends on the masses only through $\mathcal{M}$; separating them needs higher-order effects, mostly near merger`, 'The noise is too large', 'The template bank is too coarse', t`Because $m_1 = m_2$ always for black holes`],
      answer: 0,
      why: { 1: 'Even with no noise at all, the leading-order waveform would be identical for every pair with the same chirp mass.', 2: 'A finer bank would still only resolve chirp mass.', 3: 'GW150914’s masses were about 36 and 29 solar masses — unequal.' },
      hints: [t`Look at the waveform formula: which combination of $m_1$ and $m_2$ appears in it?`, 'Two pairs of masses with the same chirp mass make the same leading-order chirp.'],
      teach: 'What a model can measure is what its signal depends on: the leading-order chirp depends only on the chirp mass.',
      explain: t`The frequency evolution at leading order involves only $\mathcal{M}$. The discovery team’s full waveforms (with higher post-Newtonian orders, merger and ringdown) gave source-frame masses of $36^{+5}_{-4}$ and $29^{+4}_{-4}\,M_\odot$.`,
    }),
    code({
      id: 'lag-code', difficulty: 2,
      prompt: t`Write \`lag_ms(dH, dL, Mc)\` returning the arrival time in Hanford **minus** the arrival time in Livingston, in milliseconds, using the times of the two peak SNRs for a template of chirp mass \`Mc\`.`,
      starter: PRELUDE + t`
def lag_ms(dH, dL, Mc):
    pass

print(lag_ms(H, L, 30.0))
`,
      answer: PRELUDE + t`
def lag_ms(dH, dL, Mc):
    tH = t[np.argmax(snr(dH, Mc))]
    tL = t[np.argmax(snr(dL, Mc))]
    return (tH - tL) * 1e3

print(lag_ms(H, L, 30.0))
`,
      tests: [
        { name: 'Livingston leads by about 6.9 ms', code: 'abs(lag_ms(H, L, 30.0) - 6.9) < 0.8' },
        { name: 'the lag is inside the 10 ms light-travel bound', code: 'abs(lag_ms(H, L, 30.0)) < 10' },
        { name: 'the sign flips when the detectors are swapped', code: 'abs(lag_ms(L, H, 30.0) + lag_ms(H, L, 30.0)) < 1e-9' },
      ],
      hints: ['`t[np.argmax(snr(dH, Mc))]` is the time of Hanford’s peak.', 'Subtract, and multiply by 1000.'],
      teach: 'Arrival times come from where each detector’s filter output peaks.',
      explain: t`The peaks sit ${OUT.lag} ms apart. The timing is good to a fraction of a millisecond because the SNR peak is sharp: about one cycle at the highest frequencies.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-background', difficulty: 3,
      prompt: t`How often does noise alone reach a given SNR? Write \`false_alarm_fraction(threshold, n_trials)\`: make \`n_trials\` records of pure noise (\`np.random.default_rng(1)\`, same length as \`t\`), filter each with the $30\,M_\odot$ template, and return the fraction whose **peak** SNR is at least \`threshold\`.`,
      starter: PRELUDE + t`
def false_alarm_fraction(threshold, n_trials):
    pass

print(false_alarm_fraction(4.5, 100), false_alarm_fraction(12.0, 100))
`,
      answer: PRELUDE + t`
def false_alarm_fraction(threshold, n_trials):
    r = np.random.default_rng(1)
    hits = 0
    for _ in range(n_trials):
        if snr(r.normal(size=t.size), 30.0).max() >= threshold:
            hits += 1
    return hits / n_trials

print(false_alarm_fraction(4.5, 100), false_alarm_fraction(12.0, 100))
`,
      tests: [
        { name: 'every noise record passes a threshold of 1', code: 'false_alarm_fraction(1.0, 20) == 1.0' },
        { name: 'noise alone never reaches the Hanford peak of 12 in 100 tries', code: 'false_alarm_fraction(12.0, 100) == 0.0' },
        { name: 'a threshold of 4.5 is passed sometimes, but rarely', code: '0 < false_alarm_fraction(4.5, 100) < 0.5' },
      ],
      hints: ['Loop `n_trials` times; each time make `r.normal(size=t.size)` and take `snr(…, 30.0).max()`.', 'Count the records whose peak is `>= threshold`, then divide by `n_trials`.'],
      teach: 'A detection’s significance is measured against the noise background: how often noise alone does as well.',
      explain: t`A threshold of 4.5 is passed by a few per cent of 4-second noise records — a false alarm every couple of minutes. None of 100 reach 12. LIGO built its background the same way, from data time-shifted between the detectors, and put GW150914’s false-alarm rate below one per 203 000 years.`,
    }),
    num({
      id: 'cp-lisa', difficulty: 3, transfer: true,
      gen(r) {
        const Mc = r.pick([0.3, 0.4, 0.5, 0.6]), f = r.pick([0.003, 0.005, 0.008]);
        const fd = fdot(Mc, f), fdR = +fd.toPrecision(3), ans = mcFrom(f, fdR);
        return {
          prompt: t`A space-based detector such as LISA would see white-dwarf binaries in our Galaxy at millihertz frequencies. Suppose one is found at $f = ${f * 1000}$ mHz with $\dot f = ${sci(fdR, 3)}$ Hz/s (illustrative numbers). Using the same formula, what is its chirp mass, in solar masses?`,
          visual: { type: 'graph', params: { x: [-4, 3], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'log₁₀ of frequency (Hz)', ylabel: '', yticks: 0, xticks: 7, shade: [{ fn: '0.8', lower: '-0.8', from: -4, to: -1, color: 'violet', alpha: 0.18 }, { fn: '0.8', lower: '-0.8', from: 1.2, to: 3, color: 'accent', alpha: 0.18 }], points: [{ x: -3.6, y: 0, r: 0, label: 'space: millihertz', color: 'ink', labelDx: 0, labelDy: 0 }, { x: 1.4, y: 0, r: 0, label: 'ground: 10 Hz – 1 kHz', color: 'ink', labelDx: 0, labelDy: 0 }, { x: +Math.log10(f).toFixed(3), y: -0.4, color: 'gold', r: 5 }] }, caption: 'Rough frequency bands of space-based and ground-based detectors, on a log scale; the gold dot is this binary.' },
          answer: ans, units: 'Msun', tol: { rel: 0.01 },
          errors: [{ value: ((5 / 96) * Math.PI ** (-8 / 3) * f ** (-11 / 3) * fdR) ** 0.6, feedback: t`That is in seconds; divide by $4.925\times10^{-6}$ s per solar mass.` }],
          hints: [t`Use $f$ in hertz: $${f}$ Hz.`, t`$\mathcal{M} = \left[\tfrac{5}{96}\pi^{-8/3} f^{-11/3}\dot f\right]^{3/5} / (4.925\times10^{-6}\ \text{s})$.`],
          teach: 'The same chirp physics weighs binaries from black holes at 100 Hz to white dwarfs at millihertz.',
          explain: t`$\mathcal{M} = ${ans.toFixed(2)}\,M_\odot$ — typical of a pair of white dwarfs. Its $\dot f$ is about $10^{${Math.round(Math.log10(fd / fdot(30, 100)))}}$ times GW150914’s: such binaries chirp over millions of years.`,
        };
      },
    }),
    mcq({
      id: 'cp-claim', difficulty: 2,
      prompt: 'Which sentence belongs in this project’s conclusion?',
      visual: lagPic('This analysis’s lag (gold) inside the light-travel window (green).'),
      choices: [
        t`“On synthetic data built to resemble GW150914, a matched filter recovers the injected chirp mass and the 6.9 ms lag, with network SNR 17; the published SNR of 24 depends on the real data and full waveforms, which we did not use.”`,
        '“We have confirmed the detection of GW150914.”',
        '“Our SNR of 17 shows that LIGO overestimated the significance of GW150914.”',
        '“The method works perfectly.”',
      ],
      answer: 0,
      why: { 1: 'Synthetic data cannot confirm a real event; they test the method.', 2: 'Our SNR measures the amplitude we injected, not the event — the two numbers cannot be compared that way.', 3: 'An adjective, not a result — and the method’s limits (white noise, leading order) belong in the conclusion.' },
      hints: ['What did the data in this project come from?'],
      teach: 'A synthetic-data project reproduces a method, and its conclusion must say so.',
      explain: 'The honest claim names the data (synthetic), what was recovered (chirp mass, lag), and what was not tested (real noise, full waveforms). That is a result someone can build on.',
    }),
  ],
  sources: [SRC2.gw150914, SRC2.gwprops, SRC2.losc, { label: 'GWOSC event page for GW150914 (data release and figure captions)', url: 'https://gwosc.org/events/GW150914/' }],
});
