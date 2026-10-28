// Lock-in detection — modulate the quantity at a reference frequency, multiply
// the input by the reference (and by its 90° copy), low-pass: X = A cos(φ − θ),
// Y = A sin(φ − θ), R = √(X² + Y²). Everything not at the reference frequency
// — hum, drift, 1/f noise — is shifted away from zero frequency and filtered
// out; white noise survives only within the equivalent noise bandwidth.
// A signal buried a thousand times in noise (labf-signal sim and a NumPy
// exercise), a chopped infrared detector, and a laser absorption sensor.
// Every number is computed here; the lock-in model is checked in
// test/labf-signal.test.mjs.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6 } from './_labf.js';

const t = String.raw;
const D2R = Math.PI / 180;

// ── the worked example: a chopped infrared detector ──
const IR = { A: 2e-6, en: 40e-9, target: 0.01, hum: 5e-3 };       // V amplitude, V/√Hz, fractional, V
IR.sig = IR.target * IR.A;                                          // 20 nV
IR.enbw = IR.sig ** 2 / (2 * IR.en ** 2);                           // amplitude units: σ_X = e √(2 ENBW)
IR.tau = 1 / (8 * IR.enbw);                                         // 12 dB/oct: ENBW = 1/(8τ)
IR.settle = (() => { let x = 0; while (1 - (1 + x) * Math.exp(-x) < 0.99) x += 1e-4; return x; })();   // 2-stage step response to 99%

export default lesson({
  id: 'lab.A8.3',
  title: 'Lock-in detection',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`When a signal is tiny and the noise is mostly at low frequencies — drift, 1/f noise, mains hum — **move the signal** to a quiet frequency: chop a light beam, modulate a current, vibrate a sample at a reference frequency $f_r$. A **lock-in amplifier** then multiplies the input by the reference and low-passes the product:

$$X = \overline{2\,v(t)\sin(2\pi f_rt + \theta)} = A\cos(\varphi - \theta)$$

The product of two sines is $\cos(\varphi - \theta) - \cos(4\pi f_rt + \varphi + \theta)$: a steady part plus a part at $2f_r$ that the filter removes. Anything at another frequency $f$ ends up at $|f - f_r|$ and is filtered away too. Multiplying by the cosine as well gives $Y = A\sin(\varphi - \theta)$, so $R = \sqrt{X^2 + Y^2} = A$ whatever the phase. The output keeps only the noise within the filter's **equivalent noise bandwidth** of $f_r$ — with amplitude-calibrated outputs, $\sigma_X = e_n\sqrt{2\,\text{ENBW}}$ — so a long time constant digs a signal out from under noise thousands of times larger.`,
  symbols: [
    { tex: 'v(t)', text: 'the input: signal plus everything else, in V' },
    { tex: 'A,\\ \\varphi', text: 'the signal’s amplitude (V) and phase relative to the reference (rad or °)' },
    { tex: 'f_r', text: 'the reference (modulation) frequency, in Hz' },
    { tex: '\\theta', text: 'the reference phase you set on the lock-in' },
    { tex: 'X,\\ Y', text: 'the in-phase and quadrature outputs; $\\overline{\\cdots}$ is the low-pass filter (time constant $\\tau$)' },
    { tex: 'e_n', text: 'the white-noise density at the input near $f_r$, in V/√Hz' },
    { tex: '\\text{ENBW}', text: 'the filter’s equivalent noise bandwidth: $1/(4\\tau)$ for one RC stage, $1/(8\\tau)$ for two' },
  ],
  why: t`Lock-ins measure the faintest signals in experimental physics — photocurrents of femtoamps, Hall voltages of nanovolts, the absorption lines laser sensors read in rocket exhaust — wherever the signal can be switched on and off at will.`,
  visual: {
    type: 'labf-signal',
    title: 'A signal a thousand times smaller than the noise',
    lead: t`A 1 kHz signal of amplitude 1 sits under 60 Hz hum of amplitude 1400 and white noise: the input’s rms is about 1000 times the signal’s amplitude (top; the gold trace is the signal **magnified a hundred times**). Below, the lock-in outputs $X$ and $Y$ over 12 seconds, with the true values dashed and the predicted $\pm 1\sigma$ band of $X$ shaded. The signal’s phase is $35^\circ$.`,
    tasks: [
      'Read X and Y at the end: about 0.82 and 0.57, i.e. cos 35° and sin 35°, and R ≈ 1 — the signal recovered from an input whose rms is 990.',
      'Shorten τ to 0.01 s: the outputs settle fast but jitter by about ±0.5, as the wider bandwidth lets in more noise and the hum leaks through. Switch to one filter stage: far worse — 6 dB/oct barely touches the hum.',
      'Set the reference phase θ to 35°: X → 1 and Y → 0. At θ = 125°, X → 0 although the signal is still there: R does not care about phase.',
    ],
    params: { mode: 'lockin', white: 10, hum: 1400, tau: 0.3, poles: 2, theta: 0, phi: 35, T: 12, seed: 22 },
  },
  example: {
    prompt: t`An infrared detector watches a hot source through a chopper wheel at 1.1 kHz. The chopped signal is a sine of amplitude $2.0\ \mu\text{V}$; the detector and preamplifier contribute white noise of $40\ \text{nV}/\sqrt{\text{Hz}}$ near 1.1 kHz, and the cable picks up 5 mV of 60 Hz hum. With a 12 dB/oct lock-in, what time constant gives $X$ to 1%, and how long must you wait after a change?`,
    visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [-0.1, 1.15], xlabel: 't / τ (time after a step, in time constants)', ylabel: 'output (fraction of the step)', axesAt: 'edge', curves: [{ fn: '1 - exp(-x)', color: 'ink3', dash: [6, 4], label: 'one stage', labelAt: 1.2, labelDy: -12 }, { fn: '1 - (1 + x)*exp(-x)', color: 'accent', label: 'two stages', labelAt: 1.7, labelDy: 16 }], hlines: [{ y: 0.99, label: '99%', color: 'gold' }] }, caption: 'Step response of one and two RC stages, against time in units of τ (the x-axis stops at 3τ; both reach 99% later).' },
    steps: [
      { label: 'What precision means', text: t`1% of $2.0\ \mu\text{V}$ is $\sigma_X = 20$ nV.` },
      { label: 'Required bandwidth', text: t`$\sigma_X = e_n\sqrt{2\,\text{ENBW}}$, so $\text{ENBW} = \sigma_X^2/(2e_n^2) = (20)^2/(2 \times 40^2) = ${IR.enbw.toFixed(3)}$ Hz.` },
      { label: 'Time constant', text: t`For two RC stages, $\text{ENBW} = 1/(8\tau)$: $\tau = 1/(8 \times ${IR.enbw.toFixed(3)}) = ${IR.tau.toFixed(1)}$ s.` },
      { label: 'Settling', text: t`Two stages reach 99% of a step after $t$ with $1 - (1 + t/\tau)e^{-t/\tau} = 0.99$: $t = ${IR.settle.toFixed(2)}\tau \approx ${(IR.settle * IR.tau).toFixed(0)}$ s. Wait that long after moving anything before you read.` },
      { label: 'The hum', text: t`The hum is 2500 times the signal, but after mixing it sits at $1100 \pm 60$ Hz, where two stages with $\tau = 1$ s attenuate it by about $(2\pi \times 1040 \times 1)^2 \approx ${tex((2 * Math.PI * 1040) ** 2, 2)}$: it contributes well under a nanovolt. Choosing $f_r$ away from 60 Hz harmonics matters more than the filter.` },
      { label: 'Sense check', text: t`The input's noise in a 10 kHz bandwidth alone is $40\ \text{nV}\times\sqrt{10^4} = 4\ \mu\text{V}$ rms — twice the signal — before the hum. The lock-in wins by listening only to a 0.125 Hz slice around 1.1 kHz.` },
    ],
    answer: t`$\tau \approx ${IR.tau.toFixed(0)}$ s at 12 dB/oct (ENBW $${IR.enbw.toFixed(3)}$ Hz), and about $${(IR.settle * IR.tau).toFixed(0)}$ s of waiting after each change.`,
  },
  practice: [
    num({
      id: 'x-out', difficulty: 2,
      gen(r) {
        const A = r.pick([0.5, 1.2, 2.5, 4.0, 7.5]), phi = r.int(10, 80), th = r.int(0, 90);
        const ans = A * Math.cos((phi - th) * D2R);
        return {
          prompt: t`A signal of amplitude $${A}\ \mu\text{V}$ has phase $\varphi = ${phi}^\circ$ relative to the reference. The lock-in’s reference phase is set to $\theta = ${th}^\circ$. What does $X$ read (amplitude units), in µV?`,
          visual: { type: 'graph', params: { aspect: 'square', x: [-1.3 * A, 1.3 * A].map(r6), y: [-1.3 * A, 1.3 * A].map(r6), equal: true, xlabel: 'X', ylabel: 'Y', arrows: [{ from: [0, 0], to: [r6(A * Math.cos(phi * D2R)), r6(A * Math.sin(phi * D2R))], color: 'gold', label: 'signal' }, { from: [0, 0], to: [r6(1.2 * A * Math.cos(th * D2R)), r6(1.2 * A * Math.sin(th * D2R))], color: 'ink3', dash: [5, 4], label: 'reference' }] }, caption: 'The signal as a phasor and the direction of the reference. X is the signal’s projection on the reference.' },
          answer: ans, units: 'uV', tol: { rel: 0.01, abs: 0.01 },
          errors: [{ value: A * Math.sin((phi - th) * D2R), feedback: 'That is Y, the quadrature output. X goes with the cosine of the phase difference.' }, { value: A, feedback: 'That is R. X is only the part in phase with the reference.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(A)),
          hints: [t`$X = A\cos(\varphi - \theta)$.`],
          teach: 'X is the projection of the signal on the reference phase; Y the projection on the reference shifted by 90°.',
          explain: t`$X = ${A}\cos(${phi - th}^\circ) = ${ans.toFixed(3)}\ \mu\text{V}$.`,
        };
      },
    }),
    num({
      id: 'r-out', difficulty: 1,
      gen(r) {
        const X = r.float(-3, 3, 0.01), Y = r.float(0.2, 3, 0.01);
        const ans = Math.hypot(X, Y);
        return {
          prompt: t`A lock-in reads $X = ${X}$ mV and $Y = ${Y}$ mV. What is the signal’s amplitude $R$?`,
          visual: { type: 'graph', params: { aspect: 'square', x: [-3.5, 3.5], y: [-3.5, 3.5], equal: true, xlabel: 'X (mV)', ylabel: 'Y (mV)', arrows: [{ from: [0, 0], to: [X, Y], color: 'gold' }], points: [{ x: X, y: Y, r: 0, label: '(X, Y)' }] }, caption: 'The output as a point in the X–Y plane.' },
          answer: ans, units: 'mV', tol: { rel: 0.005 },
          errors: [{ value: Math.abs(X) + Y, feedback: 'X and Y are perpendicular components: combine them with Pythagoras.' }, { value: X, feedback: 'X alone depends on the reference phase; R does not.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$R = \sqrt{X^2 + Y^2}$.`],
          teach: 'R = √(X² + Y²) is the amplitude, independent of the reference phase.',
          explain: t`$R = \sqrt{${X}^2 + ${Y}^2} = ${ans.toFixed(3)}$ mV, at phase $\varphi - \theta = ${(Math.atan2(Y, X) / D2R).toFixed(1)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'noise-out', difficulty: 3,
      gen(r) {
        const en = r.pick([5, 10, 20, 50]), tau = r.pick([0.1, 0.3, 1, 3]), poles = r.pick([1, 2]);
        const B = poles === 1 ? 1 / (4 * tau) : 1 / (8 * tau), ans = en * Math.sqrt(B);
        return {
          prompt: t`A lock-in with rms-calibrated outputs (as real instruments display them) has input noise $${en}\ \text{nV}/\sqrt{\text{Hz}}$ near its reference frequency. Its output filter has $\tau = ${tau}$ s and ${poles === 1 ? 'one RC stage (6 dB/oct)' : 'two RC stages (12 dB/oct)'}. What is the rms noise on $X$, in nV? (For rms outputs, $\sigma_X = e_n\sqrt{\text{ENBW}}$.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-2, 2], y: [0, 1.15], xlabel: 'offset from the reference frequency (Hz)', ylabel: 'filter power response', axesAt: 'edge', curves: [{ fn: `1/(1 + (2*pi*x*${tau})^2)^${poles}`, color: 'accent', samples: 2000 }] }, caption: 'The band of input frequencies around the reference that reaches the output.' },
          answer: ans, units: 'nV', tol: { rel: 0.01 },
          errors: [{ value: en * Math.sqrt(poles === 1 ? 1 / (8 * tau) : 1 / (4 * tau)), feedback: 'Check the ENBW: 1/(4τ) for one stage, 1/(8τ) for two.' }, { value: en * Math.sqrt(1 / (2 * Math.PI * tau)), feedback: 'The −3 dB frequency is not the noise bandwidth: use 1/(4τ) or 1/(8τ).' }, { value: en / Math.sqrt(B), feedback: 'Noise grows with bandwidth: multiply the density by √ENBW.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`ENBW $= ${poles === 1 ? t`1/(4\tau)` : t`1/(8\tau)`} = ${r6(B)}$ Hz.`, t`$\sigma_X = e_n\sqrt{\text{ENBW}}$.`],
          teach: t`A lock-in’s output noise is the input noise density near $f_r$ times the square root of the filter’s ENBW.`,
          explain: t`ENBW $= ${r6(B)}$ Hz, $\sigma_X = ${en}\sqrt{${r6(B)}} = ${ans.toPrecision(3)}$ nV. Ten times longer τ cuts it by √10.`,
        };
      },
    }),
    mcq({
      id: 'hum', difficulty: 2,
      prompt: t`A lock-in runs at $f_r = 1.000$ kHz. How does it reject 60 Hz hum a thousand times larger than the signal?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2200], y: [0, 1.3], xlabel: 'frequency after mixing (Hz)', ylabel: 'amplitude', yticks: 0, axesAt: 'edge', curves: [{ fn: '1.15/(1 + (x/12)^2)', color: 'gold', dash: [5, 4], label: 'low-pass passband', labelAt: 60, labelDy: -10 }], points: [{ x: 0, y: 0.5, r: 5, color: 'accent', label: 'signal → 0 Hz' }, { x: 940, y: 1.1, r: 5, color: 'warn', label: 'hum → 940 Hz' }, { x: 1060, y: 1.1, r: 5, color: 'warn', label: '1060 Hz', labelDy: 14 }, { x: 2000, y: 0.5, r: 5, color: 'accent', label: '2f', labelDx: -24 }] }, caption: 'After multiplying by the 1 kHz reference: the signal lands at zero frequency, the hum at 1000 ± 60 Hz. Schematic heights.' },
      choices: ['Mixing moves the hum to 940 Hz and 1060 Hz, far outside the low-pass filter, while the signal lands at 0 Hz', 'It subtracts a stored copy of the hum', 'It cannot: hum must be removed before the lock-in', 'The reference phase is set to cancel the hum'],
      answer: 0,
      why: { 1: 'No subtraction is involved: frequency selection does it all.', 2: 'A lock-in tolerates enormous interference as long as its input does not overload — its “dynamic reserve”.', 3: 'Phase acts only on components at the reference frequency.' },
      hints: [t`Multiply $\sin(2\pi \cdot 60\,t)$ by $\sin(2\pi \cdot 1000\,t)$: what frequencies come out?`],
      teach: t`Mixing shifts every input frequency $f$ to $|f - f_r|$ and $f + f_r$; only what lands near zero passes the filter.`,
      explain: t`$2\sin a\sin b = \cos(a - b) - \cos(a + b)$: the hum appears at 940 and 1060 Hz, which a filter with a sub-hertz bandwidth removes. Avoid reference frequencies near 60 Hz harmonics, where the hum *would* land near zero.`,
    }),
    num({
      id: 'settle', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.1, 0.3, 1, 3, 10]), p = r.pick([99, 99.9]);
        const ans = tau * Math.log(1 / (1 - p / 100));
        return {
          prompt: t`A single-stage RC output filter has $\tau = ${tau}$ s. After the signal changes, how long until the output is within $${(100 - p).toFixed(1)}\%$ of its new value?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, r6(8 * tau)], y: [0, 1.1], xlabel: 't (s)', ylabel: 'output', axesAt: 'edge', curves: [{ fn: `1 - exp(-x/${tau})`, color: 'accent' }], hlines: [{ y: p / 100, label: `${p}%`, color: 'gold' }] }, caption: 'The output after a step change of the signal.' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tau, feedback: 'After one τ the output has covered only 63% of the change.' }, { value: 5 * tau, feedback: `5τ is the rule of thumb for 99.3%. For ${p}%, solve e^(−t/τ) = ${(1 - p / 100).toFixed(3)}.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The remaining error is $e^{-t/\tau}$.`, t`Solve $e^{-t/\tau} = ${(1 - p / 100).toFixed(3)}$: $t = \tau\ln(${(1 / (1 - p / 100)).toFixed(0)})$.`],
          teach: 'Settling to 1% takes about 4.6τ (one stage), to 0.1% about 6.9τ — the price of a long time constant.',
          explain: t`$t = ${tau}\ln ${(1 / (1 - p / 100)).toFixed(0)} = ${ans.toPrecision(3)}$ s. Sweeping a parameter faster than this distorts every point of the sweep.`,
        };
      },
    }),
    mcq({
      id: 'phase-zero', difficulty: 2,
      prompt: t`You scan a sample and $X$ stays near zero, yet $Y$ is large and changes as you scan. What is going on?`,
      visual: { type: 'graph', params: { aspect: 'square', x: [-1.3, 1.3], y: [-1.3, 1.3], equal: true, xlabel: 'X', ylabel: 'Y', arrows: [{ from: [0, 0], to: [0.05, 1], color: 'gold', label: 'signal' }] }, caption: 'The output phasor sits almost on the Y axis.' },
      choices: ['The reference phase is about 90° away from the signal’s; rotate θ by 90° (or read R)', 'There is no signal', 'The lock-in is overloaded', 'The time constant is too long'],
      answer: 0,
      why: { 1: t`A large, changing $Y$ is the signal — in quadrature with the reference.`, 2: 'An overload makes everything unreliable, not just X.', 3: 'A long τ smooths both outputs equally.' },
      hints: [t`$X = A\cos(\varphi - \theta)$ and $Y = A\sin(\varphi - \theta)$: when is the first zero and the second not?`],
      teach: 'Set the reference phase so the signal is all in X — or work with R, which ignores phase.',
      explain: t`$\varphi - \theta \approx 90^\circ$: the signal is all in $Y$. Use the lock-in’s auto-phase (or add 90° to $\theta$) and it moves into $X$. $R$ is phase-blind but always positive, so it rectifies noise: at very low SNR, a phased $X$ is better.`,
    }),
    code({
      id: 'lockin-np', difficulty: 3,
      prompt: t`Recover a buried signal yourself. The program builds 10 s of input at 20 kHz: a 1 kHz sine of amplitude 1 and phase 35°, 60 Hz hum of amplitude 1400, and white noise of σ = 10 per sample — an input about 1000 times the signal by rms. Multiply by $2\sin(2\pi f_r t)$ and $2\cos(2\pi f_r t)$ and **average over the whole record** (the simplest low-pass), then set \`X\`, \`Y\`, \`R\` and \`phase\` (degrees).`,
      starter: t`import numpy as np

fs, T, fr = 20000, 10.0, 1000.0
t = np.arange(int(fs * T)) / fs
rng = np.random.default_rng(42)
v = (np.sin(2*np.pi*fr*t + np.radians(35))      # the signal, amplitude 1
     + 1400 * np.sin(2*np.pi*60*t)                # mains hum
     + rng.normal(0, 10, t.size))                 # white noise
print(f"input rms / signal amplitude = {np.sqrt(np.mean(v**2)):.0f}")

# your code: X, Y, R, phase
print(f"X = {X:.3f}, Y = {Y:.3f}, R = {R:.3f}, phase = {phase:.1f} deg")`,
      answer: t`import numpy as np

fs, T, fr = 20000, 10.0, 1000.0
t = np.arange(int(fs * T)) / fs
rng = np.random.default_rng(42)
v = (np.sin(2*np.pi*fr*t + np.radians(35))      # the signal, amplitude 1
     + 1400 * np.sin(2*np.pi*60*t)                # mains hum
     + rng.normal(0, 10, t.size))                 # white noise
print(f"input rms / signal amplitude = {np.sqrt(np.mean(v**2)):.0f}")

X = np.mean(2 * v * np.sin(2*np.pi*fr*t))
Y = np.mean(2 * v * np.cos(2*np.pi*fr*t))
R = np.hypot(X, Y)
phase = np.degrees(np.arctan2(Y, X))
print(f"X = {X:.3f}, Y = {Y:.3f}, R = {R:.3f}, phase = {phase:.1f} deg")`,
      tests: [
        { name: 'the input really is buried: rms about 1000 times the signal', code: '900 < np.sqrt(np.mean(v**2)) < 1100' },
        { name: 'R recovers the amplitude 1 to within 0.1', code: 'abs(R - 1) < 0.1' },
        { name: 'the phase comes out near 35°', code: 'abs(phase - 35) < 6' },
        { name: 'X and Y are the in-phase and quadrature parts', code: 'abs(X - np.mean(2 * v * np.sin(2*np.pi*fr*t))) < 1e-9 and abs(Y - np.mean(2 * v * np.cos(2*np.pi*fr*t))) < 1e-9' },
      ],
      hints: [t`\`X = np.mean(2 * v * np.sin(2*np.pi*fr*t))\`, and the same with \`np.cos\` for \`Y\`.`, t`\`R = np.hypot(X, Y)\`; \`phase = np.degrees(np.arctan2(Y, X))\`.`],
      teach: 'A lock-in is a multiplication and an average: two lines of NumPy pull a signal out from under noise a thousand times larger.',
      explain: t`Averaging $N = 2\times10^5$ samples leaves white noise of $\sigma\sqrt{2/N} = 10 \times ${Math.sqrt(2 / 2e5).toFixed(4)} = ${(10 * Math.sqrt(2 / 2e5)).toFixed(3)}$ on $X$, and the hum, now at 940 and 1060 Hz, averages to essentially zero over a whole number of its cycles. The 35° phase comes back too. A real lock-in does the same with an RC filter instead of a block average, so it can follow a changing signal.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tdlas', difficulty: 3, transfer: true,
      gen(r) {
        const en = r.pick([20, 50, 100]), target = r.pick([2, 5, 10]);   // nV/√Hz, nV rms
        const B = (target / en) ** 2, tau = 1 / (8 * B);
        return {
          prompt: t`A laser absorption sensor measures water vapour in a rocket combustor’s exhaust by modulating the laser’s wavelength at 50 kHz and detecting the photodiode signal with a lock-in (rms-calibrated outputs, 12 dB/oct filter). The photodiode chain’s noise near 50 kHz is $${en}\ \text{nV}/\sqrt{\text{Hz}}$. What time constant gives an output noise of $${target}$ nV rms?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [49.9, 50.1], y: [0, r6(1.6 * en)], xlabel: 'frequency (kHz)', ylabel: 'noise density (nV/√Hz)', axesAt: 'edge', curves: [{ fn: String(en), color: 'accent' }], shade: [{ fn: String(en), from: 49.995, to: 50.005, color: 'gold', alpha: 0.5 }], points: [{ x: 50, y: r6(1.25 * en), r: 0, label: 'the lock-in listens only here', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'gold' }] }, caption: 'The photodiode chain’s white noise around 50 kHz and, shaded, the narrow band the lock-in passes (width not to scale).' },
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 1 / (4 * B), feedback: 'That uses the one-stage ENBW 1/(4τ). A 12 dB/oct filter has two stages: ENBW = 1/(8τ).' }, { value: Math.sqrt(1 / (8 * B)), feedback: 'Noise scales as √ENBW, so ENBW = (σ/e)²: square the ratio before inverting.' }].filter((e) => Math.abs(e.value - tau) > 0.02 * tau),
          hints: [t`$\sigma = e_n\sqrt{\text{ENBW}}$, so $\text{ENBW} = (\sigma/e_n)^2 = ${r6(B)}$ Hz.`, t`For 12 dB/oct, $\tau = 1/(8\,\text{ENBW})$.`],
          teach: 'Choose τ from the noise you can accept: ENBW = (σ/eₙ)², τ = 1/(8·ENBW) for two stages.',
          explain: t`ENBW $= (${target}/${en})^2 = ${r6(B)}$ Hz, so $\tau = 1/(8 \times ${r6(B)}) = ${tau.toPrecision(3)}$ s. ${tau > 0.5 ? 'That is too slow to follow a combustor’s fluctuations: real sensors accept more noise or average many scans instead.' : 'Fast enough to follow slow changes in the combustor.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-longer', difficulty: 2,
      prompt: 'Is a longer lock-in time constant always better?',
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 30], y: [-0.2, 1.4], xlabel: 't (s)', ylabel: 'X', axesAt: 'edge', curves: [{ fn: '0.5 + 0.5*step(x - 10) - 0.4*step(x - 20)', color: 'ink3', dash: [6, 4], label: 'true signal', labelAt: 14, labelDy: -12 }, { fn: '0.5 + 0.5*step(x - 10)*(1 - exp(-(x - 10)/4)) - 0.4*step(x - 20)*(1 - exp(-(x - 20)/4))', color: 'accent', label: 'τ = 4 s', labelAt: 24, labelDy: 18 }] }, caption: 'A signal that changes twice, and a lock-in output with a long time constant. Noise left out.' },
      choices: ['No: noise falls only as 1/√τ while the response slows as τ, so a changing signal or a drifting set-up is blurred; choose τ from how fast the signal changes', 'Yes: less noise is always better', 'Yes, as long as you use two filter stages', 'No: a longer τ adds noise'],
      answer: 0,
      why: { 1: 'Less noise at the cost of not seeing what the signal does is not better.', 2: 'More stages sharpen the filter but make settling slower still.', 3: 'A longer τ reduces noise; the price is speed.' },
      hints: ['What happens to the output when the signal changes faster than about 5τ?'],
      teach: 'τ trades noise (∝ 1/√τ) against response time (∝ τ): match it to the signal’s fastest change.',
      explain: t`Ten times longer τ buys only √10 less noise but makes every change take ten times longer to show, and gives slow drifts of the set-up time to creep in. Pick the shortest τ that meets the noise target, and wait 5–7τ after each change.`,
    }),
  ],
  sources: [
    { label: 'Stanford Research Systems, “About Lock-In Amplifiers”, Application Note 3', url: 'https://www.thinksrs.com/downloads/pdfs/applicationnotes/AboutLIAs.pdf' },
    { label: 'J. H. Scofield, “Frequency-domain description of a lock-in amplifier”, Am. J. Phys. 62, 129 (1994)', url: 'https://doi.org/10.1119/1.17629' },
  ],
});
