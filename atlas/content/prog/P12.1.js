// The FFT and frequency spectra — rfft and rfftfreq, what a bin is
// (resolution 1/T, Nyquist fs/2), amplitude scaling, leakage and the Hann
// window, aliasing and why the filter must come before the sampler; a
// vibrating fin's bending modes (1 : 6.27 : 17.55) and a LIGO-like chirp
// tracked with short FFTs.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { polyline } from './_numkit.js';

const t = String.raw;

// ── the fin: cantilever bending modes ──
const F1 = 23.3, RATIOS = [1, 6.267, 17.547];
const MODES = RATIOS.map((r) => F1 * r);
const FS_LOW = 600, ALIAS3 = FS_LOW - MODES[2];
const bin = (f, df) => Math.round(f / df) * df;

// ── leakage picture: a sine with 10.5 cycles in 64 samples, rectangular and Hann ──
function spectrum(N, cycles, win) {
  const w = Array.from({ length: N }, (_, n) => (win ? 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1)) : 1));
  const W = w.reduce((a, b) => a + b, 0);
  return Array.from({ length: N / 2 + 1 }, (_, k) => {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) { const x = w[n] * Math.sin((2 * Math.PI * cycles * n) / N); re += x * Math.cos((2 * Math.PI * k * n) / N); im -= x * Math.sin((2 * Math.PI * k * n) / N); }
    return [k, Math.log10(Math.max(1e-6, (2 * Math.hypot(re, im)) / W))];
  });
}
const LEAK_RECT = spectrum(64, 10.5, false), LEAK_HANN = spectrum(64, 10.5, true);

// ── the chirp of the checkpoint: f = f0 (1 − t/τ)^(−3/8), 1 s at 4096 Hz, 512-sample Hann segments (peaks from running the reference) ──
const CHIRP = { f0: 35, tau: 1.05, fs: 4096, seg: 512, first: 32, last: 80 };
const fInst = (tt) => CHIRP.f0 * (1 - tt / CHIRP.tau) ** (-3 / 8);

export default lesson({
  id: 'prog.P12.1',
  title: 'The FFT and frequency spectra',
  minutes: 13, difficulty: 3,
  intro: t`A sampled signal — an accelerometer, a microphone, a gravitational-wave detector — is a list of numbers $x_n$ taken every $1/f_s$ seconds. The discrete Fourier transform rewrites it as a sum of sinusoids, one per **frequency bin**:

$$X_k = \sum_{n=0}^{N-1} x_n\, e^{-2\pi i kn/N}, \qquad f_k = k\,\frac{f_s}{N}$$

The FFT computes all $N$ of them in $O(N\log N)$ operations instead of $O(N^2)$. For real data, \`np.fft.rfft(x)\` returns the bins from 0 up to the **Nyquist frequency** $f_s/2$, and \`np.fft.rfftfreq(N, d=1/fs)\` their frequencies. Two numbers set what you can see: the bin spacing $f_s/N = 1/T$ (a longer record resolves finer detail) and $f_s/2$ (anything faster masquerades as something slower — **aliasing**).`,
  symbols: [
    { tex: 'x_n', text: 'the $n$th sample of the signal, taken at time $t_n = n/f_s$' },
    { tex: 'N', text: 'the number of samples; the record lasts $T = N/f_s$' },
    { tex: 'X_k', text: 'the complex Fourier coefficient of bin $k$: its size is the amplitude there (times $N/2$), its angle the phase' },
    { tex: 'k', text: 'the bin number, $0 \\le k \\le N/2$ for `rfft`' },
    { tex: 'f_k', text: 'the frequency of bin $k$, in Hz' },
    { tex: 'f_s', text: 'the sampling rate, in samples per second (Hz)' },
  ],
  why: 'Vibration testing, instrument noise, radio and radar, and the search for gravitational waves all start by turning a time series into a spectrum.',
  visual: {
    type: 'code-runner',
    title: 'The modes of a vibrating fin',
    lead: t`Press **Run**. An accelerometer on a rocket's fin samples at 2000 Hz for 2 s while the fin rings in its first three bending modes. The spectrum finds them, and their ratios match a cantilever's 1 : 6.27 : 17.55. Compare the spectrum with no window (blue skirts spreading from each peak — leakage) and with a Hann window.`,
    tasks: [
      'Change fs to 600: the third mode, above the new Nyquist frequency of 300 Hz, reappears at an alias near 191 Hz.',
      'Change T to 0.25 s: the bins are 4 Hz wide and the peaks blur.',
      'The first peak reads 0.90 g, not 1: the true 23.3 Hz falls between bins. Try f1 = 23.5, exactly on a bin.',
    ],
    params: {
      rows: 26,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import find_peaks

fs = 2000.0                       # sampling rate, samples per second
T = 2.0                           # record length, s
t = np.arange(int(fs * T)) / fs
rng = np.random.default_rng(1)

# a fin buffeted in flight rings at its bending modes, in the ratio 1 : 6.267 : 17.55
f1 = 23.3                                                    # first mode, Hz
modes = [(f1, 1.0), (6.267 * f1, 0.3), (17.547 * f1, 0.1)]   # (frequency Hz, amplitude g)
x = sum(A * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) for f, A in modes)
x += 0.01 * rng.standard_normal(len(t))                      # sensor noise

f = np.fft.rfftfreq(len(x), d=1 / fs)                    # the frequency of each bin, Hz
amp_rect = 2 * np.abs(np.fft.rfft(x)) / len(x)           # amplitude spectrum, no window
w = np.hanning(len(x))
amp_hann = 2 * np.abs(np.fft.rfft(x * w)) / w.sum()      # Hann window, amplitude-corrected

peaks, _ = find_peaks(amp_hann, height=0.05)
print(f"resolution {f[1]:.2f} Hz, Nyquist {f[-1]:.0f} Hz")
print("peaks (Hz):", np.round(f[peaks], 1), " amplitudes (g):", np.round(amp_hann[peaks], 2))
print("ratios to the first:", np.round(f[peaks] / f[peaks[0]], 2))

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7, 5.5))
ax1.plot(t[:400] * 1000, x[:400], lw=0.8)
ax1.set_xlabel("time (ms)"); ax1.set_ylabel("acceleration (g)")
ax2.semilogy(f, amp_rect, lw=0.7, label="no window")
ax2.semilogy(f, amp_hann, lw=0.7, label="Hann window")
ax2.plot(f[peaks], amp_hann[peaks], "o")
ax2.set_ylim(1e-5, 2); ax2.set_xlim(0, fs / 2)
ax2.set_xlabel("frequency (Hz)"); ax2.set_ylabel("amplitude (g)")
ax2.legend()
plt.tight_layout()
plt.show()`,
    },
    caption: 'A synthetic signal: three steady sinusoids at a cantilever’s mode ratios plus white noise. Real flight data add broadband buffet, mode damping (broader peaks) and frequencies that shift as propellant burns off.',
  },
  example: {
    prompt: t`The same fin is recorded by a telemetry channel sampling at only $f_s = ${FS_LOW}$ Hz for 2 s. The spectrum shows peaks at ${bin(MODES[0], 0.5).toFixed(1)}, ${bin(MODES[1], 0.5).toFixed(1)} and ${bin(ALIAS3, 0.5).toFixed(1)} Hz. Beam theory says the modes should be in the ratio 1 : 6.27 : 17.55. What is going on, and where is the third mode really?`,
    visual: {
      type: 'graph',
      params: { x: [0, 900], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency (Hz)', ylabel: 'amplitude (g)', yticks: 3,
        curves: [...MODES.map((fm, i) => polyline([[fm, 0], [fm, [1, 0.3, 0.1][i]]], { color: 'ink3', dash: true })), ...[MODES[0], MODES[1], ALIAS3].map((fm, i) => polyline([[fm, 0], [fm, [0.9, 0.3, 0.094][i]]], { color: 'accent', width: 3 })).flat()].flat(),
        vlines: [{ x: FS_LOW / 2, color: 'bad', label: 'Nyquist, 300 Hz' }, { x: FS_LOW, color: 'ink3', label: 'fₛ' }],
        arrows: [{ from: [MODES[2], 0.16], to: [ALIAS3 + 8, 0.16], color: 'gold', label: 'folds back', labelDx: -10, labelDy: -12, labelAlign: 'right' }] },
      caption: 'Measured peaks (blue) and the true modes (dashed). A frequency above the Nyquist frequency is reflected about it: 408.8 Hz appears at 600 − 408.8 = 191.2 Hz.',
    },
    steps: [
      { label: 'The bins', text: t`$N = ${FS_LOW}\times2 = ${FS_LOW * 2}$ samples, so the bins are $f_s/N = 1/T = 0.5$ Hz apart and run from 0 to the Nyquist frequency $f_s/2 = ${FS_LOW / 2}$ Hz:

\`\`\`python
X = np.fft.rfft(x * np.hanning(len(x)))     # ${FS_LOW + 1} complex numbers
f = np.fft.rfftfreq(len(x), d=1 / 600)      # 0, 0.5, 1.0, …, 300 Hz
\`\`\`` },
      { label: 'Test the pattern', text: t`$${bin(MODES[1], 0.5).toFixed(1)}/${bin(MODES[0], 0.5).toFixed(1)} = ${(bin(MODES[1], 0.5) / bin(MODES[0], 0.5)).toFixed(2)}$ — close to 6.27, so the second mode is real. But $${bin(ALIAS3, 0.5).toFixed(1)}/${bin(MODES[0], 0.5).toFixed(1)} = ${(bin(ALIAS3, 0.5) / bin(MODES[0], 0.5)).toFixed(2)}$ matches nothing; theory expects $17.55\times${F1} = ${MODES[2].toFixed(1)}$ Hz, beyond the Nyquist frequency.` },
      { label: 'Unfold the alias', text: t`Sampled at $f_s$, a frequency $f$ is indistinguishable from $\lvert f - mf_s\rvert$ for any integer $m$: the samples are identical. $${MODES[2].toFixed(1)}$ Hz is indistinguishable from $${FS_LOW} - ${MODES[2].toFixed(1)} = ${ALIAS3.toFixed(1)}$ Hz, which lands in the bin at ${bin(ALIAS3, 0.5).toFixed(1)} Hz. Candidates for the true frequency are $${bin(ALIAS3, 0.5).toFixed(1)}$, $${FS_LOW} \pm ${bin(ALIAS3, 0.5).toFixed(1)}$ Hz…; only $${(FS_LOW - bin(ALIAS3, 0.5)).toFixed(1)}$ Hz fits the beam.` },
      { label: 'Sense check', text: t`The data alone cannot tell which candidate is real — that took the physics. The cure is in the hardware: an analogue **anti-alias filter** before the sampler, removing everything above about $0.4f_s$, or a faster sampler ($f_s > 2\times${MODES[2].toFixed(0)}$ Hz, in practice 2.5 times or more).` },
    ],
    answer: t`The ${bin(ALIAS3, 0.5).toFixed(0)} Hz peak is the third mode, ${MODES[2].toFixed(0)} Hz, aliased about the 300 Hz Nyquist frequency; sample faster behind an anti-alias filter.`,
  },
  practice: [
    num({
      id: 'resolution', difficulty: 1,
      gen(r) {
        const fs = r.pick([1000, 2048, 4096, 44100]), T = r.pick([0.5, 2, 4]);
        const N = Math.round(fs * T);
        return {
          prompt: t`A record of $N = ${thouN(N)}$ samples is taken at $f_s = ${thouN(fs)}$ Hz. How far apart are the frequency bins of its FFT?

\`\`\`python
f = np.fft.rfftfreq(${N}, d=1/${fs})
print(f[1] - f[0])
\`\`\``,
          answer: fs / N, units: 'Hz', tol: { rel: 0.001 },
          errors: [{ value: fs / 2, feedback: 'That is the Nyquist frequency, the highest bin. The spacing is fs/N.' }, ...(N !== fs ? [{ value: N / fs, feedback: 'That is the record length T in seconds. The spacing is its reciprocal, 1/T.' }] : [])],
          hints: [t`$\Delta f = f_s/N$.`, t`Equivalently $1/T$, with $T = N/f_s = ${T}$ s.`],
          teach: 'The bin spacing is fs/N = 1/T: only a longer record — not a faster sampler — gives finer frequency resolution.',
          explain: t`$\Delta f = ${fs}/${N} = ${fs / N}$ Hz $= 1/T$ with $T = ${T}$ s. Sampling faster for the same duration adds bins at the top (raising the Nyquist frequency) but leaves the spacing alone.`,
        };
      },
    }),
    num({
      id: 'alias', difficulty: 2,
      gen(r) {
        const [what, f, fs] = r.pick([['a 60 Hz mains hum', 60, 100], ['a 50 Hz mains hum', 50, 80], ['a turbopump’s 410 Hz vibration', 410, 500], ['a 1 kHz calibration tone', 1000, 1200]]);
        const m = Math.round(f / fs), fa = Math.abs(f - m * fs);
        const span = 3 / fa, ns = Math.floor(span * fs);
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} is sampled at $f_s = ${fs}$ Hz with no anti-alias filter. At what frequency does it appear in the spectrum?`,
          visual: {
            type: 'graph',
            params: { x: [0, span * 1000], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'time (ms)', ylabel: 'signal', yticks: 2,
              curves: [{ fn: `sin(2*pi*${f}*x/1000)`, color: 'ink3', width: 1.2 }],
              points: Array.from({ length: ns + 1 }, (_, n) => ({ x: (n / fs) * 1000, y: Math.sin((2 * Math.PI * f * n) / fs), color: 'gold', r: 5 })) },
            caption: 'The true signal (thin) and the samples (gold). The samples alone trace a slower sine.',
          },
          answer: fa, units: 'Hz', tol: { rel: 0.001 },
          errors: [{ value: f, feedback: `${f} Hz is above the Nyquist frequency, ${fs / 2} Hz, so it cannot appear as itself.` }, ...(fs + f !== fa ? [{ value: fs + f, feedback: 'Aliases fold down into 0 … fs/2, not up.' }] : [])],
          hints: [t`The Nyquist frequency is $f_s/2 = ${fs / 2}$ Hz; ${f} Hz is above it.`, t`The alias is $\lvert f - mf_s\rvert$ for the integer $m$ that brings it into $[0, f_s/2]$: here $\lvert ${f} - ${m}\times${fs}\rvert$.`],
          teach: 'A frequency above fs/2 folds back to |f − m·fs|, inside 0 … fs/2; once sampled, it is indistinguishable from a real signal there.',
          explain: t`$\lvert ${f} - ${m * fs}\rvert = ${fa}$ Hz. The samples of a ${f} Hz sine and a ${fa} Hz sine are identical, so no processing after the sampler can tell them apart.`,
        };
      },
    }),
    num({
      id: 'amplitude', difficulty: 2,
      gen(r) {
        const N = r.pick([1000, 2000, 4096]), A = r.pick([0.25, 0.8, 1.5, 3.2]);
        const peak = (A * N) / 2;
        return {
          prompt: t`A sine whose frequency falls exactly on a bin is transformed with \`np.fft.rfft\` (no window). The largest $\lvert X_k\rvert$ is ${peak}. With $N = ${N}$ samples, what is the sine's amplitude?

\`\`\`python
X = np.fft.rfft(x)          # len(x) = ${N}
print(np.abs(X).max())      # ${peak.toFixed(1)}
\`\`\``,
          answer: A, tol: { rel: 0.005 },
          errors: [{ value: peak / N, feedback: 'A real sine splits its strength between +f and −f; rfft keeps only +f, so multiply by 2.' }, { value: peak, feedback: 'NumPy’s FFT is not normalized: divide by N/2.' }],
          hints: [t`For a sine of amplitude $A$ on a bin, $\lvert X_k\rvert = AN/2$.`, t`$A = 2\lvert X_k\rvert/N$.`],
          teach: t`\`np.fft\` is unnormalized: the amplitude of a sinusoid is $2\lvert X_k\rvert/N$ (or $2\lvert X_k\rvert/\sum w$ with a window $w$).`,
          explain: t`$A = 2\times${peak}/${N} = ${A}$. NumPy follows the convention with no $1/N$ in the forward transform; the factor 2 restores the half of the power that sits at negative frequencies, which \`rfft\` omits. With a window, divide by the window's sum instead of $N$, as the Explore code does.`,
        };
      },
    }),
    code({
      id: 'dominant', difficulty: 2,
      prompt: t`Write \`dominant_frequency(x, fs)\` that returns the frequency (Hz) of the **strongest** spectral peak of the real signal \`x\` sampled at \`fs\`, ignoring the constant (zero-frequency) part — accelerometers often carry an offset. Use \`np.fft.rfft\` and \`np.fft.rfftfreq\`.`,
      starter: t`import numpy as np

def dominant_frequency(x, fs):
    pass
`,
      answer: t`import numpy as np

def dominant_frequency(x, fs):
    X = np.abs(np.fft.rfft(x - np.mean(x)))
    f = np.fft.rfftfreq(len(x), d=1 / fs)
    return f[np.argmax(X)]`,
      tests: [
        { name: 'a 50 Hz tone sampled at 1000 Hz for 1 s', code: '(lambda t: abs(dominant_frequency(np.sin(2*np.pi*50*t), 1000) - 50) < 1e-9)(np.arange(1000) / 1000)' },
        { name: 'with a 5 g offset, the 23.5 Hz mode still wins', code: '(lambda t: abs(dominant_frequency(5 + 0.3*np.sin(2*np.pi*23.5*t), 2000) - 23.5) < 1e-9)(np.arange(4000) / 2000)' },
        { name: 'the stronger of two tones (120 Hz) at 4096 Hz', code: '(lambda t: abs(dominant_frequency(0.4*np.sin(2*np.pi*60*t) + np.cos(2*np.pi*120*t), 4096) - 120) < 1e-9)(np.arange(4096) / 4096)' },
      ],
      hints: ['Subtract the mean first, or skip bin 0, so an offset does not win.', '`X = np.abs(np.fft.rfft(x - np.mean(x)))` and `f = np.fft.rfftfreq(len(x), d=1 / fs)`.', 'Return `f[np.argmax(X)]`.'],
      teach: 'rfft gives the amplitudes, rfftfreq the matching frequencies — index both with the same k; remove the mean so the DC bin does not dominate.',
      explain: t`\`argmax\` of the magnitudes picks the bin; \`rfftfreq\` translates it to hertz, so the answer is only as precise as the bin spacing $f_s/N$. Without removing the mean, the 5 g offset puts $5N$ into bin 0 and the function would return 0 Hz.`,
    }),
    mcq({
      id: 'leakage', difficulty: 3,
      prompt: t`A pure sine completing 10.5 cycles in a 64-sample record is transformed with and without a Hann window. What does the window trade?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 32.5], y: [-4.2, 0.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'bin k', ylabel: 'amplitude',
          curves: [...polyline(LEAK_RECT, { color: 'accent', width: 2 }), ...polyline(LEAK_HANN, { color: 'gold', width: 2 })],
          legend: [{ label: 'no window', color: 'accent' }, { label: 'Hann window', color: 'gold' }], legendAt: 'tr' },
        caption: 'Amplitude spectra (logarithmic axis) of the same sine, computed exactly. The true frequency lies halfway between bins 10 and 11.',
      },
      choices: [
        'Far less leakage into distant bins, at the price of a wider central peak (coarser effective resolution)',
        'Better resolution and less leakage, at no cost',
        'It moves the peak onto the correct frequency between bins',
        'It removes noise from the signal',
      ],
      answer: 0,
      why: {
        1: 'The Hann peak is visibly wider: two close lines are harder to separate.',
        2: 'The peak still sits in bins 10 and 11; a window does not change where the bins are.',
        3: 'Noise in each bin is unchanged in kind; the window only shapes how a tone spreads across bins.',
      },
      hints: ['Compare the two curves far from bin 10, then near it.', 'A record that does not hold a whole number of cycles has a jump where its end meets its start.'],
      teach: 'Windowing tapers the record’s ends: leakage falls by orders of magnitude, but the main peak widens — choose by what you need to see.',
      explain: t`Without a window the FFT treats the record as periodic, and the half cycle left over makes a jump — whose spectrum spreads energy into every bin, falling off only slowly. Tapering the ends to zero removes the jump: distant bins drop by several orders of magnitude, which is what lets a weak mode be seen next to a strong one. The cost is a main peak about twice as wide.`,
    }),
    mcq({
      id: 'filter-first', difficulty: 2,
      prompt: t`A student proposes to remove aliases from a vibration record by applying a digital low-pass filter to the samples **after** acquisition. Why does this fail?`,
      visual: {
        type: 'graph',
        params: { x: [0, 30], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'time (ms)', ylabel: 'signal', yticks: 2,
          curves: [{ fn: 'sin(2*pi*0.9*x)', color: 'ink3', width: 1.2 }, { fn: '-sin(2*pi*0.1*x)', color: 'gold', dash: true }],
          points: Array.from({ length: 31 }, (_, n) => ({ x: n, y: Math.sin(2 * Math.PI * 0.9 * n), color: 'gold', r: 4 })) },
        caption: 'A 900 Hz signal sampled at 1000 Hz (thin) and the 100 Hz sine through the very same samples (dashed).',
      },
      choices: [
        'Once sampled, the alias is identical to a genuine low-frequency signal — the samples match exactly — so no later filter can tell them apart',
        'Digital filters cannot be applied to sampled data',
        'Low-pass filters remove low frequencies, not high ones',
        'It works, but only if the filter is applied twice',
      ],
      answer: 0,
      why: {
        1: 'Digital filtering of samples is routine — it just cannot undo aliasing.',
        2: 'A low-pass filter passes low frequencies and removes high ones; the aliased energy is already at a low frequency.',
        3: 'Repeating the filter changes nothing about the information already lost.',
      },
      hints: ['Look at the picture: which curve do the samples belong to?'],
      teach: 'The anti-alias filter must be analogue and sit before the sampler: after sampling, aliased energy is genuinely at the low frequency.',
      explain: t`The gold dots lie on both curves. After sampling, the 900 Hz vibration *is* a 100 Hz signal as far as any computation can tell, and a low-pass filter keeps it. That is why data-acquisition systems put an analogue low-pass filter before the analogue-to-digital converter, cutting off below $f_s/2$.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-chirp', difficulty: 3, transfer: true,
      prompt: t`A gravitational wave from two merging black holes is a **chirp**: its frequency sweeps up as the orbit shrinks. The simulated strain \`h\` below (a slowed-down, LIGO-like chirp: $f = f_0(1 - t/\tau)^{-3/8}$) is sampled at 4096 Hz for 1 s. Cut it into 8 segments of 512 samples, multiply each by \`np.hanning(512)\`, find each segment's strongest frequency with \`rfft\`/\`rfftfreq\`, and set \`peaks\` to the list of 8 frequencies.`,
      visual: {
        type: 'gr-chirp',
        params: { m1: 36, m2: 29, D: 410, sliders: false, play: false, readout: false, ring: false },
        caption: 'For comparison: the waveform of a real-scale binary black-hole chirp (GW150914-like masses) at leading order. The exercise uses a slower sweep so that several FFT segments fit inside it.',
      },
      starter: t`import numpy as np

fs = 4096
t = np.arange(fs) / fs                      # 1 s
f0, tau = 35.0, 1.05
phase = 2 * np.pi * f0 * tau * 8 / 5 * (1 - (1 - t / tau) ** (5 / 8))
h = (1 - t / tau) ** (-1 / 4) * np.sin(phase)

peaks = []
`,
      answer: t`import numpy as np

fs = 4096
t = np.arange(fs) / fs                      # 1 s
f0, tau = 35.0, 1.05
phase = 2 * np.pi * f0 * tau * 8 / 5 * (1 - (1 - t / tau) ** (5 / 8))
h = (1 - t / tau) ** (-1 / 4) * np.sin(phase)

seg = 512
w = np.hanning(seg)
f = np.fft.rfftfreq(seg, d=1 / fs)
peaks = []
for i in range(0, len(h), seg):
    X = np.abs(np.fft.rfft(h[i:i + seg] * w))
    peaks.append(f[np.argmax(X)])
print(peaks)`,
      tests: [
        { name: '8 segment frequencies', code: 'len(peaks) == 8' },
        { name: t`the first segment peaks at ${CHIRP.first} Hz, the last at ${CHIRP.last} Hz (bins 8 Hz wide)`, code: `abs(peaks[0] - ${CHIRP.first}) < 1e-9 and abs(peaks[-1] - ${CHIRP.last}) < 1e-9` },
        { name: 'the frequency never decreases from one segment to the next', code: 'all(b >= a for a, b in zip(peaks, peaks[1:]))' },
      ],
      hints: ['512 samples at 4096 Hz is 0.125 s: the bins are 8 Hz apart (`np.fft.rfftfreq(512, d=1/fs)`).', 'Loop `for i in range(0, len(h), 512):` and take `h[i:i + 512] * np.hanning(512)`.', 'For each, append `f[np.argmax(np.abs(np.fft.rfft(segment)))]`.'],
      teach: 'A spectrogram is FFTs of short, windowed segments: it trades frequency resolution (1/segment length) for time resolution.',
      explain: t`The peaks climb from ${CHIRP.first} to ${CHIRP.last} Hz, tracking $f(t)$ (${fInst(0.0625).toFixed(0)} Hz at the middle of the first segment, ${fInst(0.9375).toFixed(0)} Hz at the middle of the last), in 8 Hz steps because 0.125 s segments cannot resolve finer. Longer segments sharpen the frequency but smear the sweep — the time–frequency trade-off. \`scipy.signal.spectrogram\` does this with overlapping segments; LIGO's searches use matched filters, which use the whole predicted waveform at once.`,
    }),
    num({
      id: 'cp-record', difficulty: 2, transfer: true,
      gen(r) {
        const [what, df] = r.pick([['a deployable solar array whose two lowest modes are expected', 0.08], ['a satellite boom whose torsion and bending modes are expected', 0.25], ['a telescope’s secondary-mirror support whose two rocking modes are expected', 1.6]]);
        return {
          prompt: t`During a ground test, ${what} only $${df}$ Hz apart. With no window, the FFT bins of a record of length $T$ are $1/T$ apart. What is the **shortest record** whose bins are as fine as the modes' separation?`,
          visual: {
            type: 'graph',
            params: { x: [-3, 3], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency offset (bins of the needed size)', ylabel: 'amplitude', yticks: 0,
              curves: [{ fn: 'abs(sin(pi*(x+0.5))/(pi*(x+0.5)))', color: 'accent' }, { fn: 'abs(sin(pi*(x-0.5))/(pi*(x-0.5)))', color: 'gold' }] },
            caption: 'Two modes one bin apart, each spread by the record’s finite length (illustrative).',
          },
          answer: 1 / df, units: 's', tol: { rel: 0.01 },
          errors: [{ value: df, feedback: 'That is the frequency spacing itself; the record length is its reciprocal.' }, { value: 2 / df, feedback: 'That is a sensible length with a Hann window, whose peaks are twice as wide — but the question asks for the bare minimum, 1/Δf.' }],
          hints: [t`Bin spacing $= 1/T$.`, t`Set $1/T = ${df}$ Hz.`],
          teach: 'Resolving two lines Δf apart needs a record at least 1/Δf long — about twice that with a window; slow, closely spaced modes need long tests.',
          explain: t`$T = 1/${df} = ${(1 / df).toFixed(2)}$ s. In practice you record several times longer, both to separate the peaks cleanly with a window (whose peaks are about two bins wide) and to average down noise. Sampling faster does not help at all.`,
        };
      },
    }),
    mcq({
      id: 'cp-fft-vs-rfft', difficulty: 2,
      prompt: t`For a real signal of $N = 8$ samples, \`np.fft.fft\` returns 8 values and \`np.fft.rfft\` returns 5. Why the difference?

\`\`\`python
x = np.array([0.0, 0.7, 1.0, 0.7, 0.0, -0.7, -1.0, -0.7])
np.fft.fft(x).shape, np.fft.rfft(x).shape     # (8,), (5,)
\`\`\``,
      choices: [
        'For real input the negative-frequency coefficients are complex conjugates of the positive ones, so rfft keeps only bins 0 to N/2',
        '`rfft` throws away the highest-frequency part of the signal',
        '`rfft` rounds the signal before transforming it',
        '`fft` pads the signal to a power of two',
      ],
      answer: 0,
      why: {
        1: 'It keeps everything up to the Nyquist bin, N/2 — nothing is lost.',
        2: 'No rounding: both are exact to floating-point precision.',
        3: '8 is already a power of two, and NumPy’s FFT does not pad unless you pass n.',
      },
      hints: ['For real x, how is X at bin N − k related to X at bin k?'],
      teach: 'Real signals have Hermitian-symmetric spectra (X₋ₖ = Xₖ*), so rfft returns the N/2 + 1 non-redundant bins — about half the work and memory.',
      explain: t`For real $x_n$, $X_{N-k} = \overline{X_k}$: bins 5, 6, 7 of \`fft\` mirror bins 3, 2, 1, the negative frequencies. \`rfft\` returns bins 0 to $N/2$, and \`rfftfreq\` labels them $0, f_s/N, \ldots, f_s/2$. Use \`fft\` and \`fftfreq\` for complex signals, where positive and negative frequencies differ.`,
    }),
  ],
  sources: [
    { label: 'NumPy reference: numpy.fft (rfft, rfftfreq, normalization)', url: 'https://numpy.org/doc/stable/reference/routines.fft.html' },
    { label: 'Harris (1978), On the use of windows for harmonic analysis with the DFT, Proc. IEEE 66, 51', url: 'https://doi.org/10.1109/PROC.1978.10837' },
    { label: 'Blevins, Formulas for Dynamics, Acoustics and Vibration (Wiley 2016), ch. 8: cantilever beam frequencies', url: 'https://www.wiley.com/en-us/Formulas+for+Dynamics%2C+Acoustics+and+Vibration-p-9781119038115' },
    { label: 'LIGO Scientific Collaboration (2016), Observation of gravitational waves from a binary black hole merger, PRL 116, 061102', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  ],
});

function thouN(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
