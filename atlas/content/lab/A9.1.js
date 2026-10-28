// Sampling, Nyquist and aliasing — a sampled record sees only frequencies
// below the Nyquist frequency fs/2; anything above folds back to
// |f − k·fs| and is indistinguishable from a real low-frequency signal, so the
// anti-alias filter must come before the converter; why "2× the highest
// frequency" is the bare minimum, and how filter order sets the real sample
// rate. A stroboscope (labf-signal sim), an engine's combustion instability,
// and a turbopump's blade-pass tone on a telemetry channel. The FFT itself
// belongs to prog.P12.1 and phys3750.W6.
// Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6 } from './_labf.js';

const t = String.raw;
const alias = (f, fs) => Math.abs(f - fs * Math.round(f / fs));
const sampled = (f, fs, n, caption, { showAlias = true, T = null } = {}) => {
  const Tw = T || n / fs, fa = alias(f, fs);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r6(Tw)], y: [-1.35, 1.35], xlabel: 't (s)', ylabel: 'signal', yticks: 3, axesAt: 'edge',
      curves: [{ fn: `sin(2*pi*${f}*x)`, color: 'ink3', width: 1.1, samples: 4000 }, ...(showAlias ? [{ fn: `sin(2*pi*${r6(f - fs * Math.round(f / fs))}*x)`, color: 'warn', dash: [6, 4], width: 1.8 }] : [])],
      points: Array.from({ length: Math.floor(Tw * fs + 1e-9) + 1 }, (_, k) => ({ x: r6(k / fs), y: r6(Math.sin(2 * Math.PI * f * k / fs)), r: 3.8, color: 'gold' })),
    },
    caption: caption || `A ${f} Hz sine (grey) sampled at ${fs} Hz (gold dots).${showAlias ? ` The dashed orange sine at ${r6(fa)} Hz passes through the same dots.` : ''}`,
  };
};

// ── the worked example: chamber-pressure telemetry for an engine with a 1.2 kHz instability ──
const W = { fi: 1200, fs0: 1000, fmax: 1500, n: 4, att: 40 };
W.a0 = alias(W.fi, W.fs0);
W.ratio = 10 ** (W.att / (20 * W.n));                 // f/fc at which an n-pole Butterworth is att dB down: (f/fc)^(2n) = 10^(att/10)
W.fold = W.ratio * W.fmax;
W.fs = W.fold + W.fmax;

export default lesson({
  id: 'lab.A9.1',
  title: 'Sampling, Nyquist and aliasing',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`A data-acquisition system does not record a signal; it records **samples** of it, $f_s$ times a second. Two sine waves whose frequencies differ by a whole multiple of $f_s$ give exactly the same samples, so the record can only distinguish frequencies up to the **Nyquist frequency** $f_s/2$. A component above it is not lost — it reappears, **aliased**, at

$$f_a = \left|\,f - k f_s\right|, \qquad k = \text{the whole number that makes } f_a \le f_s/2$$

indistinguishable from a real signal at $f_a$. No processing after sampling can undo this. The cure must come first: an analogue **anti-alias filter** before the converter, and a sample rate comfortably above twice the highest frequency the filter lets through. A stroboscope does the same thing to a spinning wheel — which is why wheels in films turn backwards.`,
  symbols: [
    { tex: 'f', text: 'the true frequency of a component of the signal, in Hz' },
    { tex: 'f_s', text: 'the sampling rate, in samples per second (Hz)' },
    { tex: 'f_s/2', text: 'the Nyquist frequency: the highest frequency a record at $f_s$ represents unambiguously' },
    { tex: 'f_a', text: 'the alias: the frequency at which the component appears in the samples' },
    { tex: 'k', text: 'a whole number: the multiple of $f_s$ nearest to $f$' },
  ],
  why: t`Every telemetry channel, oscilloscope and digital sensor samples; choosing the rate and the filter is a design decision, and getting it wrong produces signals that look real and are not.`,
  visual: {
    type: 'labf-signal',
    title: 'A wheel under a strobe',
    lead: t`A wheel with one marked spoke turns at $f$ revolutions per second, lit only by flashes at $f_s$ per second. Above: where the spoke is at each of the first six flashes (or press **Play the flashes** to watch them in turn). Below: the spoke’s height against time — its true motion (grey), the flashes (gold) and the slowest sine through them (dashed orange).`,
    tasks: [
      'At f = 24 rev/s and 25 flashes a second, the wheel seems to turn slowly backwards at 1 rev/s: each flash catches the spoke 1/25 of a turn short of where it was.',
      'Set f = 25: the wheel stands still. Set f = 50: still. Any multiple of the flash rate looks frozen.',
      'Set f below 12.5 (half the flash rate): now the apparent speed is the true one. Above 12.5 rev/s, the strobe lies.',
    ],
    params: { mode: 'strobe', f: 24, fsamp: 25 },
    caption: t`A one-spoke wheel sampled by an ideal, instantaneous strobe. Play shows the flashes slowed to six a second; the apparent motion between them is your eye and brain joining the dots — exactly what a fit or a plot does with samples.`,
  },
  example: {
    prompt: t`A rocket engine’s chamber pressure is logged by a telemetry channel at $1000$ samples per second. The engine develops a combustion instability at $1.2$ kHz. What does the channel show? Then design a better channel: keep everything up to $1.5$ kHz, and make anything that could alias into that band at least 40 dB weaker, using a 4-pole Butterworth anti-alias filter with its corner at 1.5 kHz.`,
    visual: sampled(1200, 1000, 12, t`A 1200 Hz oscillation (grey) sampled at 1000 Hz (gold): the dots trace a 200 Hz sine (dashed). Nothing in the samples says which is real.`),
    steps: [
      { label: 'Alias', text: t`The nearest multiple of 1000 Hz to 1200 Hz is 1000 Hz: $f_a = |1200 - 1000| = ${W.a0}$ Hz. The telemetry shows a clean, convincing 200 Hz oscillation that does not exist, and no hint of the 1.2 kHz instability that does.` },
      { label: 'What must not fold', text: t`A component at $f$ folds to $f_s - f$. For the folded image to land below 1.5 kHz, $f > f_s - 1.5$ kHz. So every frequency above $f_s - 1.5$ kHz must be cut by 40 dB before sampling.` },
      { label: 'Filter roll off', text: t`An $n$-pole Butterworth has $|H| = 1/\sqrt{1 + (f/f_c)^{2n}}$. Forty dB (a factor of 100 in amplitude) needs $(f/f_c)^{8} = 10^{4}$: $f = 10^{0.5} f_c = ${W.ratio.toFixed(2)} \times 1.5 = ${(W.fold / 1000).toFixed(2)}$ kHz.` },
      { label: 'Sample rate', text: t`Require $f_s - 1.5\ \text{kHz} \ge ${(W.fold / 1000).toFixed(2)}$ kHz: $f_s \ge ${(W.fs / 1000).toFixed(2)}$ kHz — over four times the highest frequency kept, not two.` },
      { label: 'Sense check', text: t`Nyquist’s $2 \times 1.5 = 3$ kHz would need a brick-wall filter, which does not exist. Steeper filters (8 poles) allow rates nearer 3 kHz; most telemetry designers settle for 2.5–5 times the bandwidth.` },
    ],
    answer: t`At 1000 samples/s the 1.2 kHz instability appears as a false 200 Hz oscillation. With a 4-pole filter at 1.5 kHz, sample at about $${(W.fs / 1000).toFixed(1)}$ kHz or faster.`,
  },
  practice: [
    num({
      id: 'alias-f', difficulty: 2,
      gen(r) {
        const fs = r.pick([100, 250, 500, 1000, 2000]);
        const f = r.int(Math.round(0.55 * fs), Math.round(2.8 * fs));
        const ans = alias(f, fs);
        return {
          prompt: t`A ${f} Hz vibration is sampled at ${fs} samples per second. At what frequency does it appear in the record?`,
          visual: sampled(f, fs, 16, `A ${f} Hz sine (grey) and its samples at ${fs} per second (gold).`, { showAlias: false }),
          answer: ans, units: 'Hz', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: f - fs, feedback: 'Subtract the *nearest* multiple of the sampling rate, so the result lands between 0 and fs/2.' }, { value: f % fs, feedback: 'The remainder is not always the alias: if it is above fs/2, the alias is fs minus it.' }, { value: fs / 2, feedback: 'The Nyquist frequency is the upper limit, not where everything lands.' }].filter((e) => Math.abs(e.value - ans) > 0.5 && e.value >= 0),
          hints: [t`Find the multiple of ${fs} Hz nearest to ${f} Hz.`, t`$f_a = |f - kf_s|$, which must come out between 0 and $f_s/2 = ${fs / 2}$ Hz.`],
          teach: t`An alias is the distance from $f$ to the nearest multiple of $f_s$ — always between 0 and $f_s/2$.`,
          explain: t`The nearest multiple is $${Math.round(f / fs)} \times ${fs} = ${Math.round(f / fs) * fs}$ Hz, so $f_a = |${f} - ${Math.round(f / fs) * fs}| = ${ans}$ Hz. The gold dots trace that slower sine.`,
        };
      },
    }),
    num({
      id: 'nyquist', difficulty: 1,
      gen(r) {
        const B = r.pick([20, 100, 440, 5000, 22050]);
        return {
          prompt: t`What is the lowest sampling rate that can, in principle, represent signals up to ${B} Hz without aliasing?`,
          visual: sampled(3, 6, 12, 'A 3 Hz sine sampled at exactly 6 Hz: right at the limit, the samples can fall anywhere on the wave — here they land exactly on its zero crossings.', { showAlias: false, T: 2 }),
          answer: 2 * B, units: 'Hz', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: B, feedback: 'Sampling at the signal’s own frequency catches it at the same phase every time: it looks constant. You need more than two samples per cycle.' }],
          hints: ['The Nyquist frequency is half the sampling rate.'],
          teach: t`In principle $f_s > 2f_{\max}$; in practice several times more, because filters are not brick walls.`,
          explain: t`$f_s = 2 \times ${B} = ${2 * B}$ Hz, strictly a bit more. At exactly twice, a sine sampled at its zero crossings vanishes, as the picture shows. Real systems sample faster: CD audio uses 44.1 kHz for a 20 kHz band.`,
        };
      },
    }),
    num({
      id: 'strobe-rpm', difficulty: 2,
      gen(r) {
        const fl = r.pick([1500, 2000, 3000, 3600]);           // flashes per minute
        const rpm = fl + r.pick([-60, -30, 20, 45, 90]) * r.pick([1, 2]);
        const ans = rpm - fl;                                     // apparent rpm, signed
        return {
          prompt: t`A shaft turns at ${rpm} rpm. You light it with a strobe at ${fl} flashes per minute. What rotation rate do you see, in rpm? (Use a negative number if it appears to turn backwards.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1.6, 1.6], y: [-1.15, 1.15], equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, grid: false, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.5 }], arrows: [0, 1, 2, 3].map((k) => { const th = Math.PI / 2 + 2 * Math.PI * (rpm / fl) * k; return { from: [0, 0], to: [r6(0.95 * Math.cos(th)), r6(0.95 * Math.sin(th))], color: k === 0 ? 'gold' : 'accent', label: String(k + 1) }; }) }, caption: 'Where a mark on the shaft is at four successive flashes (1 to 4).' },
          answer: ans, units: 'rpm', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: -ans, feedback: 'Direction: if the shaft is a little faster than the strobe, each flash catches it slightly further round — forwards.' }, { value: rpm, feedback: 'That is the true speed. Under the strobe you see only the difference from the flash rate.' }],
          hints: ['Between flashes the shaft turns rpm/flash-rate revolutions; only the fraction beyond a whole turn is visible.', 'For speeds near the flash rate, the apparent speed is rpm − flashes per minute.'],
          teach: 'A strobe near the shaft speed shows the difference frequency: positive forwards, negative backwards.',
          explain: t`The shaft gains $${rpm} - ${fl} = ${ans}$ revolutions a minute on the strobe, so it appears to turn at ${Math.abs(ans)} rpm ${ans > 0 ? 'forwards' : 'backwards'}. This is how a stroboscopic tachometer is used: adjust the flash rate until the mark stands still — but check at half the rate too, because a multiple also freezes it.`,
        };
      },
    }),
    mcq({
      id: 'filter-first', difficulty: 2,
      prompt: 'Where must the anti-alias low-pass filter go?',
      visual: sampled(9, 10, 20, 'A 9 Hz tone sampled at 10 Hz becomes a 1 Hz alias (dashed). After sampling, the 1 Hz sine is all the data contain.'),
      choices: ['Before the analogue-to-digital converter, as an analogue filter', 'After the converter, as a digital filter', 'Anywhere in the chain: filters commute', 'It is unnecessary if the sampling rate is above the signal’s main frequency'],
      answer: 0,
      why: { 1: 'Once sampled, the aliased component sits at a legitimate low frequency: a digital filter cannot tell it from real signal.', 2: 'Sampling is not a linear time-invariant filter: it does not commute with filtering.', 3: 'Noise and harmonics above fs/2 alias even when the main signal is below it.' },
      hints: ['After sampling, at what frequency does a 9 Hz component sit in a 10 Hz record?'],
      teach: 'Aliasing is irreversible: remove high frequencies before sampling, in analogue.',
      explain: t`Sampling maps 9 Hz onto 1 Hz for good. Only an analogue filter, acting on the continuous signal, can remove the 9 Hz before it is folded. (Oversampling followed by digital filtering and decimation is a refinement of the same rule: the first, fast sampling still needs its own analogue filter.)`,
    }),
    num({
      id: 'butterworth', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 4, 6, 8]), fc = r.pick([1, 2, 5]), ratio = r.pick([2, 3, 4]);
        const f = fc * ratio;
        const ans = 10 * Math.log10(1 + ratio ** (2 * n));
        return {
          prompt: t`An ${n}-pole Butterworth anti-alias filter has its corner at $${fc}$ kHz. By how many decibels does it attenuate a component at $${f}$ kHz? ($|H| = 1/\sqrt{1 + (f/f_c)^{2n}}$.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, 1], y: [-100, 5], xlog: true, xlabel: 'f / fc', ylabel: 'gain (dB)', axesAt: 'edge', curves: [{ fn: `-10*log10(1 + (10^x)^(${2 * n}))`, color: 'accent' }], vlines: [{ x: r6(Math.log10(ratio)), color: 'warn' }] }, caption: `The filter’s gain against frequency (relative to its corner).` },
          answer: ans, units: 'dB', tol: { rel: 0.01 },
          errors: [{ value: 10 * Math.log10(1 + ratio ** n), feedback: t`The power response has $(f/f_c)^{2n}$, not $(f/f_c)^n$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Attenuation in dB $= 10\log_{10}\left(1 + (f/f_c)^{2n}\right)$.`, t`$(f/f_c)^{2n} = ${ratio}^{${2 * n}}$.`],
          teach: 'An n-pole filter falls at 20n dB per decade (6n dB per octave) beyond its corner.',
          explain: t`$10\log_{10}(1 + ${ratio}^{${2 * n}}) = ${ans.toFixed(1)}$ dB — about $20n\log_{10}(f/f_c)$ once well past the corner.`,
        };
      },
    }),
    code({
      id: 'alias-fft', difficulty: 2,
      prompt: t`Write \`apparent(f, fs)\` returning the alias frequency, folded into $[0, f_s/2]$. Then check it the experimental way: sample a sine at frequency \`f_true\` for 2 s at \`fs\`, take \`np.fft.rfft\`, and set \`f_peak\` to the frequency of the largest peak (\`np.fft.rfftfreq\`).`,
      starter: t`import numpy as np

def apparent(f, fs):
    return 0.0

f_true, fs = 1730.0, 1000.0
t = np.arange(0, 2.0, 1 / fs)
x = np.sin(2 * np.pi * f_true * t)
# your code: f_peak from the spectrum
print(apparent(f_true, fs), f_peak)`,
      answer: t`import numpy as np

def apparent(f, fs):
    return abs(f - fs * round(f / fs))

f_true, fs = 1730.0, 1000.0
t = np.arange(0, 2.0, 1 / fs)
x = np.sin(2 * np.pi * f_true * t)
spec = np.abs(np.fft.rfft(x))
freqs = np.fft.rfftfreq(x.size, 1 / fs)
f_peak = freqs[np.argmax(spec)]
print(apparent(f_true, fs), f_peak)`,
      tests: [
        { name: '1730 Hz sampled at 1 kHz appears at 270 Hz', code: 'abs(apparent(1730, 1000) - 270) < 1e-9' },
        { name: 'the spectrum’s peak is at the predicted alias', code: 'abs(f_peak - 270) < 1' },
        { name: 'a tone below Nyquist is unchanged, and 60 Hz at 100 Hz appears at 40 Hz', code: 'apparent(30, 100) == 30 and abs(apparent(60, 100) - 40) < 1e-9' },
      ],
      hints: [t`\`abs(f - fs * round(f / fs))\`.`, t`\`spec = np.abs(np.fft.rfft(x))\`, \`freqs = np.fft.rfftfreq(x.size, 1 / fs)\`, then \`freqs[np.argmax(spec)]\`.`],
      teach: 'The FFT of a sampled record cannot show anything above fs/2: an out-of-band tone appears at its alias, exactly where the folding formula puts it.',
      explain: t`Both give 270 Hz: $1730 - 2 \times 1000 = -270$, folded to 270. The spectrum shows a perfectly clean peak there — nothing marks it as an alias. (More on spectra in [the FFT](#/lesson/prog.P12.1).)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turbopump', difficulty: 3, transfer: true,
      gen(r) {
        const rpm = r.pick([24000, 30000, 36000, 42000]), blades = r.pick([11, 13, 15]), fs = r.pick([2000, 2500, 4000]);
        const shaft = rpm / 60, bp = shaft * blades;
        const ans = alias(bp, fs);
        return {
          prompt: t`A turbopump spins at ${rpm} rpm with ${blades} impeller blades, so it makes a blade-pass pressure tone at ${blades} times the shaft frequency. A telemetry channel samples the pump’s discharge pressure at ${fs} samples per second with no anti-alias filter. At what frequency does the blade-pass tone appear?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, r6(1.15 * bp)], y: [0, fs / 2 * 1.2], xlabel: 'true frequency (Hz)', ylabel: 'apparent (Hz)', axesAt: 'edge', curves: [{ fn: `abs(x - ${fs}*round(x/${fs}))`, color: 'accent', samples: 4000 }], vlines: [{ x: fs / 2, label: 'Nyquist', color: 'ink3' }] }, caption: `The folding diagram for ${fs} samples per second.` },
          answer: ans, units: 'Hz', tol: { rel: 0, abs: 0.6 },
          errors: [{ value: bp, feedback: `That is the true blade-pass frequency, ${bp} Hz — far above the Nyquist frequency of ${fs / 2} Hz. Fold it.` }, { value: shaft, feedback: 'That is the shaft frequency. Find the blade-pass frequency first, then its alias.' }].filter((e) => Math.abs(e.value - ans) > 0.6),
          hints: [t`Shaft: ${rpm}/60 = ${shaft} Hz. Blade pass: ${blades} × ${shaft} = ${bp} Hz.`, t`Subtract the nearest multiple of ${fs} Hz.`],
          teach: 'Fold the true frequency: subtract the nearest multiple of the sampling rate.',
          explain: t`Blade pass is $${bp}$ Hz; the nearest multiple of ${fs} is ${Math.round(bp / fs) * fs}, so it appears at $${ans}$ Hz${Math.abs(ans - shaft) < 1 ? ' — exactly on the shaft frequency, where it would masquerade as an imbalance' : ''}. An engineer reading this record without knowing the sampling story could chase a vibration that does not exist.`,
        };
      },
    }),
    mcq({
      id: 'cp-design', difficulty: 2,
      prompt: t`A new telemetry channel must capture structural vibration up to 2 kHz. Which design is sound?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [2.5, 4.5], y: [-80, 5], xlog: true, xlabel: 'frequency (Hz)', ylabel: 'filter gain (dB)', axesAt: 'edge', curves: [{ fn: '-10*log10(1 + (10^x/2000)^8)', color: 'accent' }], vlines: [{ x: r6(Math.log10(2000)), label: '2 kHz', color: 'ink3' }] }, caption: 'A 4-pole anti-alias filter with its corner at 2 kHz.' },
      choices: ['An analogue 4-pole filter at 2 kHz and sampling at about 8–10 kHz', 'Sampling at 4 kHz with no filter', 'Sampling at 2 kHz and filtering digitally afterwards', 'Sampling at 4.0 kHz with the 4-pole filter'],
      answer: 0,
      why: { 1: 'Exactly twice the band with no filter: everything above 2 kHz — harmonics, pump tones, noise — folds into the band.', 2: 'At 2 kHz the Nyquist frequency is 1 kHz: half the band is lost, and the rest is contaminated by aliases no digital filter can remove.', 3: 'The filter is only about 3 dB down at 2 kHz: components just above 2 kHz fold to just below it almost unattenuated.' },
      hints: ['The folded images must land where the filter has already cut them hard.'],
      teach: 'Real sample rates are set by the anti-alias filter’s roll-off: several times the bandwidth.',
      explain: t`With $f_s \approx 9$ kHz, anything that could fold into 0–2 kHz lies above 7 kHz, where the 4-pole filter is down by about $10\log_{10}(1 + 3.5^8) \approx ${(10 * Math.log10(1 + 3.5 ** 8)).toFixed(0)}$ dB.`,
    }),
  ],
  sources: [
    { label: 'C. E. Shannon, “Communication in the presence of noise”, Proc. IRE 37, 10 (1949)', url: 'https://doi.org/10.1109/JRPROC.1949.232969' },
    { label: 'P. Horowitz & W. Hill, The Art of Electronics, 3rd ed., §13.5 (sampling and aliasing)', url: 'https://artofelectronics.net/' },
  ],
});
