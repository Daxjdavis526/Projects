// Noise sources and signal-to-noise — Johnson noise √(4kTRB) computed, shot
// noise √(2qIB) and its counting form √N, 1/f (flicker) noise and its
// corner frequency, interference lines; noise densities in V/√Hz, adding
// independent noise in quadrature, bandwidth and √B, and SNR in decibels.
// A thermocouple read by a preamplifier, a star tracker's pixel, and a
// NumPy spectrum that recovers a resistor's value from its noise alone.
// Constants: k_B = 1.380649e-23 J/K and e = 1.602176634e-19 C (exact, SI 2019).
// Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6, SIMNOTE } from './_labf.js';

const t = String.raw;
const KB = 1.380649e-23, QE = 1.602176634e-19;
const johnson = (R, T, B) => Math.sqrt(4 * KB * T * R * B);          // V rms
const shot = (I, B) => Math.sqrt(2 * QE * I * B);                      // A rms

// ── the worked example: a type K thermocouple (20 Ω with its leads) into a preamplifier ──
const TC = { R: 20, T: 300, ea: 8e-9, fc: 10, f1: 0.1, f2: 10, S: 41e-6 };
TC.eJ = Math.sqrt(4 * KB * TC.T * TC.R);                                  // V/√Hz
TC.eW = Math.hypot(TC.eJ, TC.ea);                                         // white total density
TC.white = TC.eW ** 2 * (TC.f2 - TC.f1);
TC.flick = TC.ea ** 2 * TC.fc * Math.log(TC.f2 / TC.f1);
TC.vn = Math.sqrt(TC.white + TC.flick);
TC.dT = TC.vn / TC.S;

// a noise-density picture on log–log axes: white floor ea, 1/f corner fc, optional line at 60 Hz
function psdPic({ e = 5, fc = 0, line = false, caption, xr = [-1, 4] }) {
  const fn = `log10(${e}*sqrt(1 + ${fc}/10^x)${line ? ' + 60*exp(-((10^x - 60)/1.2)^2) + 25*exp(-((10^x - 180)/2.5)^2)' : ''})`;
  return { type: 'graph', params: { aspect: 'wide', x: xr, y: [r6(Math.log10(e) - 0.5), r6(Math.log10(e) + (fc ? 0.5 * Math.log10(fc / 10 ** xr[0] + 1) : 0) + (line ? 1.4 : 0.6))], xlog: true, ylog: true, xlabel: 'frequency (Hz)', ylabel: 'noise density (nV/√Hz)', axesAt: 'edge', curves: [{ fn, color: 'accent', samples: 3000 }] }, caption };
}

export default lesson({
  id: 'lab.A8.1',
  title: 'Noise sources and signal-to-noise',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`Every measurement sits on a floor of noise, and some of it is fundamental. Any resistor at temperature $T$ produces **Johnson (thermal) noise**, the random motion of its electrons:

$$v_n = \sqrt{4k_BTRB}$$

Any current made of discrete charges carries **shot noise**, $i_n = \sqrt{2eIB}$ — for counted particles simply $\sqrt N$. Both are *white*: the same power in every hertz. Real electronics add **1/f (flicker) noise**, which grows toward low frequencies below a *corner frequency* $f_c$, and **interference** — mains pickup at 60 Hz and its harmonics. Independent noise sources add in **quadrature**, and white noise’s rms grows as $\sqrt B$, so narrowing the bandwidth is the first weapon. The figure of merit is the signal-to-noise ratio, often in decibels: $\text{SNR} = 20\log_{10}(V_s/V_n)$ dB for amplitudes.`,
  symbols: [
    { tex: 'v_n', text: 'the rms noise voltage, in V' },
    { tex: 'k_B', text: 'Boltzmann’s constant, $1.380649\\times10^{-23}$ J/K (exact)' },
    { tex: 'T', text: 'the resistor’s absolute temperature, in K' },
    { tex: 'R', text: 'its resistance, in Ω' },
    { tex: 'B', text: 'the measurement bandwidth, in Hz: the range of frequencies the instrument passes' },
    { tex: 'e,\\ I', text: 'the elementary charge, $1.602176634\\times10^{-19}$ C (exact), and the mean current, in A' },
  ],
  why: t`Knowing which noise dominates tells you what to fix: cool the resistor, narrow the bandwidth, chop the signal above the 1/f corner, or shield the cable — four different cures for four different diseases.`,
  visual: {
    type: 'graph',
    title: 'A noise spectrum, piece by piece',
    lead: t`The noise **density** (rms volts per $\sqrt{\text{Hz}}$) of a resistor feeding an amplifier, against frequency, on log–log axes. The flat part is white: Johnson noise of the resistor plus the amplifier’s own. Below the corner frequency the amplifier’s 1/f noise takes over.`,
    tasks: [
      'Raise R from 1 kΩ to 100 kΩ: the Johnson density rises tenfold (√100) and swamps the amplifier.',
      'Cool the resistor from 300 K to 77 K (liquid nitrogen): its Johnson noise falls by √(300/77) ≈ 2.',
      'Slide the corner frequency up to 1 kHz: below it, the spectrum climbs as 1/√f in density (1/f in power). A measurement at 1 Hz would now be far noisier than one at 10 kHz.',
    ],
    params: {
      aspect: 'wide', x: [-1, 5], y: [0, 3], xlog: true, ylog: true, xlabel: 'frequency (Hz)', ylabel: 'noise density (nV/√Hz)', axesAt: 'edge',
      sliders: [
        { key: 'R', label: 'Resistance $R$', min: 10, max: 1e6, value: 1000, logScale: true, unit: '\\Omega', explain: 'The source resistance feeding the amplifier.' },
        { key: 'T', label: 'Temperature $T$', min: 4, max: 400, step: 1, value: 300, unit: '\\mathrm{K}', explain: '300 K is room temperature; 77 K liquid nitrogen; 4 K liquid helium.' },
        { key: 'fc', label: '1/f corner $f_c$', min: 0.1, max: 3000, value: 10, logScale: true, unit: '\\mathrm{Hz}', explain: 'Below this frequency the amplifier’s flicker noise exceeds its white noise.' },
      ],
      constants: { ea: 4 },
      curves: [
        { fn: 'log10(sqrt(4*1.380649e-23*T*R)*1e9)', color: 'gold', dash: [6, 5], width: 1.6, label: 'Johnson noise of R', labelAt: 3.4, labelDy: 18 },
        { fn: 'log10(ea*sqrt(1 + fc/10^x))', color: 'violet', dash: [3, 4], width: 1.6, label: 'amplifier', labelAt: -0.5, labelDx: 10, labelDy: 22 },
        { fn: 'log10(sqrt(4*1.380649e-23*T*R*1e18 + ea^2*(1 + fc/10^x)))', color: 'accent', width: 2.4 },
      ],
      readouts: [
        { label: 'Johnson density $\\sqrt{4k_BTR}$', expr: 'sqrt(4*1.380649e-23*T*R)*1e9', unit: '\\,\\text{nV}/\\sqrt{\\text{Hz}}', digits: 3 },
        { label: 'Johnson rms in 10 kHz', expr: 'sqrt(4*1.380649e-23*T*R*1e4)*1e6', unit: '\\,\\mu\\text{V}', digits: 3 },
      ],
    },
    caption: t`Total density (blue) = the Johnson noise (gold, dashed) and the amplifier’s noise (violet: 4 nV/√Hz white, rising below its corner) added in quadrature. A model amplifier: real ones also have current noise that grows with the source resistance.`,
  },
  example: {
    prompt: t`A type K thermocouple (sensitivity $41\ \mu\text{V/K}$) and its leads have $R = 20\ \Omega$ at 300 K. They feed a preamplifier with $8\ \text{nV}/\sqrt{\text{Hz}}$ of white input noise and a 1/f corner at 10 Hz. You read it from 0.1 Hz to 10 Hz. What is the rms noise, and what temperature does it correspond to?`,
    visual: psdPic({ e: 8, fc: 10, xr: [-1, 2], caption: t`The amplifier’s input noise density over the band of interest: in this whole band the 1/f part is at least as big as the white part.` }),
    steps: [
      { label: 'Johnson noise', text: t`$\sqrt{4k_BTR} = \sqrt{4 \times 1.381\times10^{-23} \times 300 \times 20} = ${(TC.eJ * 1e9).toFixed(3)}\ \text{nV}/\sqrt{\text{Hz}}$ — tiny next to the amplifier’s 8.` },
      { label: 'White part', text: t`In quadrature, $\sqrt{${(TC.eJ * 1e9).toFixed(3)}^2 + 8^2} = ${(TC.eW * 1e9).toFixed(3)}\ \text{nV}/\sqrt{\text{Hz}}$. Over $9.9$ Hz of bandwidth: $v^2 = (${(TC.eW * 1e9).toFixed(2)}\ \text{nV})^2 \times 9.9 = ${tex(TC.white * 1e18, 3)}\ \text{nV}^2$.` },
      { label: 'Flicker part', text: t`A density $e_a^2 f_c/f$ integrates to $e_a^2 f_c \ln(f_2/f_1) = 64 \times 10 \times \ln 100 = ${tex(TC.flick * 1e18, 3)}\ \text{nV}^2$: the 1/f noise is larger than the white noise in this band.` },
      { label: 'Total', text: t`$v_n = \sqrt{${tex(TC.white * 1e18, 3)} + ${tex(TC.flick * 1e18, 3)}}\ \text{nV} = ${(TC.vn * 1e9).toFixed(1)}$ nV rms.` },
      { label: 'In kelvin', text: t`Divide by the sensitivity: $${(TC.vn * 1e9).toFixed(1)}\ \text{nV} / 41\ \mu\text{V/K} = ${(TC.dT * 1e3).toFixed(2)}$ mK rms.` },
      { label: 'Sense check', text: t`Millikelvin noise is far below a type K thermocouple’s calibration uncertainty (about 1 K): electrical noise will not limit this measurement — the reference junction and the calibration will ([calibration](#/lesson/lab.A7.1)). In a real engine bay, 60 Hz pickup on long leads is the usual enemy, not these fundamental terms.` },
    ],
    answer: t`$v_n \approx ${(TC.vn * 1e9).toFixed(0)}$ nV rms, about $${(TC.dT * 1e3).toFixed(1)}$ mK — dominated by the amplifier, and most of it (in power) 1/f noise.`,
  },
  practice: [
    num({
      id: 'johnson', difficulty: 2,
      gen(r) {
        const R = r.pick([1e3, 4.7e3, 10e3, 50e3, 100e3, 1e6]), T = r.pick([77, 300, 350]), B = r.pick([1e3, 1e4, 1e5]);
        const ans = johnson(R, T, B) * 1e6;
        const Rt = R >= 1e6 ? `${R / 1e6}\\ \\text{M}\\Omega` : `${R / 1e3}\\ \\text{k}\\Omega`;
        return {
          prompt: t`What is the rms Johnson noise voltage of a $${Rt}$ resistor at $${T}$ K, measured over a bandwidth of $${tex(B)}$ Hz?`,
          visual: psdPic({ e: r6(Math.sqrt(4 * KB * T * R) * 1e9), caption: t`The resistor’s noise density: flat (white) at $\sqrt{4k_BTR}$.` }),
          answer: ans, units: 'uV', tol: { rel: 0.01 },
          errors: [{ value: 4 * KB * T * R * B * 1e6, feedback: 'You forgot the square root: 4kTRB is the mean-square voltage, in V².' }, { value: Math.sqrt(KB * T * R * B) * 1e6, feedback: 'The formula has a factor 4: v = √(4 k T R B).' }, { value: Math.sqrt(4 * KB * (T + 273.15) * R * B) * 1e6, feedback: 'T is already in kelvin.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$v_n = \sqrt{4k_BTRB}$ with $k_B = 1.381\times10^{-23}$ J/K.`, t`$4k_BTR = ${tex(4 * KB * T * R, 3)}\ \text{V}^2/\text{Hz}$; multiply by $B$ and take the root.`],
          teach: 'Johnson noise: √(4kTRB) — grows with resistance, temperature and bandwidth, each as a square root.',
          explain: t`$\sqrt{4 \times 1.381\times10^{-23} \times ${T} \times ${tex(R)} \times ${tex(B)}} = ${ans.toPrecision(3)}\ \mu\text{V}$. A handy anchor: 1 kΩ at room temperature gives about $4\ \text{nV}/\sqrt{\text{Hz}}$.`,
        };
      },
    }),
    num({
      id: 'shot', difficulty: 2,
      gen(r) {
        const I = r.pick([1e-9, 10e-9, 1e-6, 100e-6, 1e-3]), B = r.pick([1, 100, 1e4]);
        const ans = shot(I, B);
        return {
          prompt: t`A photodiode delivers a steady $${tex(I)}$ A. What is its rms shot-noise current in a bandwidth of $${tex(B)}$ Hz? Give the answer in amperes.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 3], xlabel: 'time (arbitrary)', ylabel: 'current', yticks: 0, axesAt: 'edge', curves: [{ fn: '1.5 + 0.35*sin(7.3*x)*sin(2.1*x + 1) + 0.2*sin(23*x)', color: 'accent', width: 1.4 }], hlines: [{ y: 1.5, label: 'mean current I', color: 'gold' }] }, caption: 'A current made of discrete electrons fluctuates about its mean. Schematic, not real noise.' },
          answer: ans, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(QE * I * B), feedback: 'Shot noise has a factor 2: i = √(2 e I B).' }, { value: 2 * QE * I * B, feedback: 'That is the mean-square current. Take the square root.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$i_n = \sqrt{2eIB}$, $e = 1.602\times10^{-19}$ C.`],
          teach: 'Shot noise √(2eIB) grows only as the square root of the current, so the signal-to-noise ratio of a current improves as √I.',
          explain: t`$\sqrt{2 \times 1.602\times10^{-19} \times ${tex(I)} \times ${tex(B)}} = ${tex(ans, 3)}$ A. Relative to the current itself that is $${tex(ans / I, 2)}$: the more charge you collect, the smaller the fractional noise.`,
        };
      },
    }),
    num({
      id: 'db', difficulty: 1,
      gen(r) {
        const Vs = r.pick([1, 2, 5, 10, 50]), Vn = r.pick([0.001, 0.01, 0.05, 0.2]);
        const ans = 20 * Math.log10(Vs / Vn);
        return {
          prompt: t`A signal of $${Vs}$ mV rms sits on $${Vn}$ mV rms of noise. What is the signal-to-noise ratio in decibels?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6.3], y: [-1.6, 1.6], xlabel: 't', ylabel: '', yticks: 0, xticks: 0, axesAt: 'edge', curves: [{ fn: 'sin(3*x) + 0.08*sin(41*x) + 0.06*sin(67*x + 1)', color: 'accent', width: 1.4 }] }, caption: 'A signal with a little noise on it (schematic).' },
          answer: ans, units: 'dB', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 10 * Math.log10(Vs / Vn), feedback: 'For amplitudes (volts) use 20 log₁₀: power goes as amplitude squared.' }, { value: Vs / Vn, feedback: 'That is the plain ratio. Convert to decibels: 20 log₁₀ of it.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: [t`$\text{SNR} = 20\log_{10}(V_s/V_n)$ for rms amplitudes.`],
          teach: 'Decibels: 10 log₁₀ of a power ratio, 20 log₁₀ of an amplitude ratio.',
          explain: t`$20\log_{10}(${Vs}/${Vn}) = 20\log_{10}${r6(Vs / Vn)} = ${ans.toFixed(1)}$ dB. Every factor of 10 in amplitude is 20 dB.`,
        };
      },
    }),
    num({
      id: 'quadrature', difficulty: 2,
      gen(r) {
        const eJ = r.float(1, 15, 0.1), ea = r.float(1, 15, 0.1), B = r.pick([100, 1000, 1e4]);
        const ans = Math.hypot(eJ, ea) * Math.sqrt(B);
        return {
          prompt: t`A sensor’s Johnson noise is $${eJ}\ \text{nV}/\sqrt{\text{Hz}}$ and its amplifier adds $${ea}\ \text{nV}/\sqrt{\text{Hz}}$, both white and independent. What is the total rms noise in a $${tex(B)}$ Hz bandwidth, in nV?`,
          visual: { type: 'graph', params: { aspect: 'square', x: [-1, 16], y: [-1, 16], xlabel: 'sensor (nV/√Hz)', ylabel: 'amplifier (nV/√Hz)', axesAt: 'edge', arrows: [{ from: [0, 0], to: [eJ, 0], color: 'gold' }, { from: [eJ, 0], to: [eJ, ea], color: 'violet' }, { from: [0, 0], to: [eJ, ea], color: 'accent' }], points: [{ x: r6(eJ / 2), y: 0, r: 0, label: 'sensor', labelAlign: 'center', labelDx: 0, labelDy: 14, color: 'gold' }, { x: eJ, y: r6(ea / 2), r: 0, label: 'amplifier', labelDx: 8, labelDy: 0, color: 'violet' }, { x: r6(eJ / 2), y: r6(ea / 2), r: 0, label: 'total', labelAlign: 'right', labelDx: -8, labelDy: -8, color: 'accent' }] }, caption: 'Independent noise densities add like perpendicular vectors.' },
          answer: ans, units: 'nV', tol: { rel: 0.01 },
          errors: [{ value: (eJ + ea) * Math.sqrt(B), feedback: 'Independent noises add in quadrature, not linearly: their peaks rarely line up.' }, { value: Math.hypot(eJ, ea) * B, feedback: 'A density in V/√Hz is multiplied by √B, not B.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['Combine the densities in quadrature first.', t`Then multiply by $\sqrt B$.`],
          teach: 'Independent noise adds in quadrature; white noise’s rms grows as √B.',
          explain: t`$\sqrt{${eJ}^2 + ${ea}^2} = ${Math.hypot(eJ, ea).toFixed(2)}\ \text{nV}/\sqrt{\text{Hz}}$, times $\sqrt{${tex(B)}}$: $${ans.toFixed(0)}$ nV rms. ${Math.max(eJ, ea) > 3 * Math.min(eJ, ea) ? 'The larger term dominates almost completely — improving the smaller one would be wasted effort.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'which-noise', difficulty: 2,
      prompt: t`An amplifier’s output noise spectrum is shown. You want to measure a small, slowly varying voltage. What limits you, and what is the cure?`,
      visual: psdPic({ e: 5, fc: 300, line: true, xr: [-1, 4], caption: 'A measured noise density: a floor at high frequency, a rise toward low frequency, and two sharp lines.' }),
      choices: ['1/f noise below a few hundred hertz: move the measurement to a higher frequency (modulate or chop the signal and use a lock-in)', 'Johnson noise: cool the amplifier', 'The 60 Hz line: averaging longer will remove 1/f noise', 'Shot noise: use a larger current'],
      answer: 0,
      why: { 1: 'The white floor at high frequency is the smallest noise here; a slowly varying signal sits where the 1/f rise is far above it.', 2: '1/f noise does not average away the way white noise does — and mains lines are a separate problem (shielding, a notch filter, or a measurement frequency away from them).', 3: 'Nothing in the spectrum says which mechanism makes the floor; the problem is the low-frequency rise.' },
      hints: ['Where on the frequency axis does a slowly varying signal live?', 'Which part of the spectrum is highest there?'],
      teach: 'Low-frequency measurements fight 1/f noise; the cure is to modulate the signal to a quiet frequency above the corner.',
      explain: t`A slow signal lives at the left of this plot, where the 1/f rise dominates. Chopping or modulating it at, say, 1 kHz — above the corner and away from 60 Hz and its harmonics — and demodulating with a [lock-in](#/lesson/lab.A8.3) moves the measurement onto the white floor.`,
    }),
    code({
      id: 'noise-r', difficulty: 3,
      prompt: t`Simulate Johnson noise and measure it back. White noise sampled at rate $f_s$ with one-sided density $e^2$ (V²/Hz) has per-sample standard deviation $\sigma = e\sqrt{f_s/2}$. Generate 64 blocks of 4096 samples for a $R = 47\ \text{k}\Omega$ resistor at 300 K and $f_s = 100$ kHz, estimate the density by averaging periodograms ($2|X_k|^2/(f_s N)$ for each block), take the mean over all frequencies, and set \`R_est\` from $e^2 = 4k_BTR$.`,
      starter: t`import numpy as np

kB, T, R, fs, N = 1.380649e-23, 300.0, 47e3, 100e3, 4096
rng = np.random.default_rng(3)
sigma = np.sqrt(4 * kB * T * R) * np.sqrt(fs / 2)    # V per sample
v = rng.normal(0, sigma, size=(64, N))

# your code: the one-sided density from the averaged periodograms, then R_est
print(f"R_est = {R_est / 1e3:.1f} kOhm")`,
      answer: t`import numpy as np

kB, T, R, fs, N = 1.380649e-23, 300.0, 47e3, 100e3, 4096
rng = np.random.default_rng(3)
sigma = np.sqrt(4 * kB * T * R) * np.sqrt(fs / 2)    # V per sample
v = rng.normal(0, sigma, size=(64, N))

X = np.fft.rfft(v, axis=1)
psd = 2 * np.abs(X)**2 / (fs * N)        # one-sided density, V²/Hz
density = psd[:, 1:-1].mean()             # drop the DC and Nyquist bins
R_est = density / (4 * kB * T)
print(f"R_est = {R_est / 1e3:.1f} kOhm")`,
      tests: [
        { name: t`\`R_est\` is within 3% of 47 kΩ`, code: 'abs(R_est / 47e3 - 1) < 0.03' },
        { name: 'the density is in V²/Hz, about 7.8 × 10⁻¹⁶', code: 'abs(4 * kB * T * R_est / 7.78e-16 - 1) < 0.04' },
      ],
      hints: [t`\`X = np.fft.rfft(v, axis=1)\`; the one-sided density is \`2 * np.abs(X)**2 / (fs * N)\`.`, t`Average it over blocks and frequencies (skip bin 0 and the last bin), then \`R_est = density / (4 * kB * T)\`.`],
      teach: 'A noise density is measured by averaging periodograms; its white level gives back the resistance through 4kTR.',
      explain: t`The averaged density is about $7.8\times10^{-16}\ \text{V}^2/\text{Hz}$ ($28\ \text{nV}/\sqrt{\text{Hz}}$), giving $R \approx 47$ kΩ. This is how Johnson noise measures temperature in noise thermometry — and Boltzmann’s constant, given a known temperature. (Spectra and the FFT themselves: [the FFT](#/lesson/prog.P12.1).)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tracker', difficulty: 3, transfer: true,
      gen(r) {
        const S = r.pick([400, 1000, 2500, 10000, 40000]), rn = r.pick([5, 10, 20]);
        const ans = S / Math.sqrt(S + rn * rn);
        return {
          prompt: t`A star tracker’s detector collects $${S}$ photoelectrons from a guide star in one exposure. The photoelectrons arrive at random (shot noise, $\sqrt{N}$), and the readout adds $${rn}$ electrons rms of read noise. What is the signal-to-noise ratio (as a plain ratio)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 5], y: [-0.5, 3], xlog: true, ylog: true, xlabel: 'photoelectrons N', ylabel: 'signal-to-noise ratio', axesAt: 'edge', curves: [{ fn: `log10(10^x/sqrt(10^x + ${rn * rn}))`, color: 'accent' }, { fn: 'log10(sqrt(10^x))', color: 'ink3', dash: [6, 4], label: '√N (no read noise)', labelAt: 2.6, labelDx: -30, labelDy: -26 }] }, caption: t`SNR against signal for ${rn} e⁻ of read noise: read-noise limited at the left, shot-noise limited (√N) at the right.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(S), feedback: 'That ignores the read noise; add it in quadrature to the shot noise.' }, { value: S / (Math.sqrt(S) + rn), feedback: 'Independent noise sources add in quadrature, not linearly.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Shot noise: $\sqrt{${S}}$ electrons. Read noise: $${rn}$.`, t`Total noise $\sqrt{N + r^2}$; SNR $= N/\sqrt{N + r^2}$.`],
          teach: 'Counting noise √N and read noise add in quadrature; bright stars are shot-noise limited, faint ones read-noise limited.',
          explain: t`$${S}/\sqrt{${S} + ${rn * rn}} = ${ans.toFixed(1)}$. ${rn * rn > S ? 'Read noise dominates: a faint star.' : 'Shot noise dominates: only a longer exposure or a bigger aperture helps.'} A tracker centroids a star to a fraction of a pixel roughly in proportion to 1/SNR.`,
        };
      },
    }),
    mcq({
      id: 'cp-bandwidth', difficulty: 2,
      prompt: t`A measurement is limited by white noise. You cut the bandwidth from 10 kHz to 100 Hz (the signal changes slowly enough to pass). The rms noise…`,
      visual: psdPic({ e: 6, xr: [0, 4.5], caption: 'A white noise density: the same in every hertz.' }),
      choices: ['falls tenfold (√100)', 'falls a hundredfold', 'is unchanged: the density is the same', 'falls by half'],
      answer: 0,
      why: { 1: 'The mean-square noise falls a hundredfold; the rms falls as its square root.', 2: 'The density is unchanged, but you integrate it over a hundred times less bandwidth.', 3: 'Noise power is proportional to bandwidth, not halved by any cut.' },
      hints: [t`For white noise, $v_n^2 \propto B$.`],
      teach: 'White-noise rms scales as √B: a hundredfold narrower band means tenfold less noise.',
      explain: t`$v_n \propto \sqrt B$, so $\sqrt{10^4/10^2} = 10$. Filtering and averaging are both ways of narrowing the bandwidth — [the next lesson](#/lesson/lab.A8.2).`,
    }),
  ],
  sources: [
    { label: 'P. Horowitz & W. Hill, The Art of Electronics, 3rd ed., ch. 8 (low-noise techniques)', url: 'https://artofelectronics.net/' },
    { label: 'H. Nyquist, “Thermal agitation of electric charge in conductors”, Phys. Rev. 32, 110 (1928)', url: 'https://doi.org/10.1103/PhysRev.32.110' },
    { label: 'BIPM, The International System of Units (SI), 9th ed. (2019): exact values of k and e', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
});
