// ADC resolution and quantization — an N-bit converter over a full-scale
// range has an LSB of V_FS/2^N; an ideal converter's error is uniform within
// ±½ LSB, so its rms is LSB/√12 and a full-scale sine reaches SNR = 6.02N +
// 1.76 dB; real converters lose bits to noise and nonlinearity (ENOB) and
// carry offset and gain errors that no number of bits fixes; dither and
// averaging resolve below one LSB. A star tracker's pixel ADC, a
// thermocouple on a 16-bit card, and quantization measured in NumPy.
// Every number is computed here; LSB/√12 is checked in test/labf-signal.test.mjs.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6 } from './_labf.js';

const t = String.raw;

// ── the worked example: a star tracker's pixel, 20 000 e⁻ full well, 8 e⁻ read noise ──
const ST = { full: 20000, read: 8 };
const stOf = (bits) => { const lsb = ST.full / 2 ** bits, q = lsb / Math.sqrt(12), tot = Math.hypot(ST.read, q); return { bits, lsb, q, tot, worse: tot / ST.read - 1 }; };
const S10 = stOf(10), S12 = stOf(12), S14 = stOf(14);

// a staircase picture: a sine of amplitude A (in units of the half range) through an N-bit converter over ±1
const stair = (bits, A, caption, { err = false } = {}) => {
  const lsb = r6(2 / 2 ** bits), lo = -(2 ** (bits - 1)), hi = 2 ** (bits - 1) - 1;
  const q = `${lsb}*max(${lo}, min(${hi}, round(${A}*sin(x)/${lsb})))`;
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [0, r6(2 * Math.PI)], y: err ? [-1.9, 1.2] : [-1.2, 1.2], xlabel: 'phase', ylabel: 'volts', xticks: 0, axesAt: 'edge',
      curves: [{ fn: `${A}*sin(x)`, color: 'ink3', width: 1.2 }, { fn: q, color: 'accent', width: 2, samples: 3000 }, ...(err ? [{ fn: `-1.55 + 0.25*(${q} - ${A}*sin(x))/${lsb}`, color: 'warn', width: 1.2, samples: 3000 }] : [])] },
    caption,
  };
};

export default lesson({
  id: 'lab.A9.2',
  title: 'ADC resolution and quantization',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`An analogue-to-digital converter (ADC) turns a voltage into one of $2^N$ whole-number codes spread over its full-scale range $V_{FS}$. The step between codes is the **least significant bit**, $\text{LSB} = V_{FS}/2^N$. Rounding to the nearest code makes an error anywhere between $-\tfrac12$ and $+\tfrac12$ LSB; for a busy signal it is spread evenly over that range, so its rms is

$$\sigma_q = \frac{\text{LSB}}{\sqrt{12}}$$

A full-scale sine then reaches at best $\text{SNR} = 6.02N + 1.76$ dB: each bit is worth 6 dB. Two cautions. **Bits are not accuracy**: a 16-bit converter with an offset or gain error reads 16 bits of the wrong number. And quantization only matters when it is not swamped by the signal's own noise: the art is to make one LSB a little smaller than the noise you cannot avoid — by choosing the bits, the range, and the gain in front of the ADC.`,
  symbols: [
    { tex: 'N', text: 'the number of bits: the converter has $2^N$ codes' },
    { tex: 'V_{FS}', text: 'the full-scale range the codes span, in V (for example $\\pm 10$ V is $V_{FS} = 20$ V)' },
    { tex: '\\text{LSB}', text: 'one code step, $V_{FS}/2^N$, in V: the resolution' },
    { tex: '\\sigma_q', text: 'the rms quantization error, $\\text{LSB}/\\sqrt{12}$ — the standard deviation of a uniform distribution one LSB wide' },
  ],
  why: t`Every digital measurement — a star tracker’s pixel, a test stand’s data card, a spacecraft’s telemetry — passes through an ADC, and a wrong range or gain throws away precision the sensor had.`,
  visual: {
    type: 'graph',
    title: 'A sine through an N-bit converter',
    lead: t`A sine (grey) and what an $N$-bit converter spanning $\pm 1$ V makes of it (blue staircase). The orange trace at the bottom is the error, magnified so that the band it fills is exactly $\pm\tfrac12$ LSB at every setting.`,
    tasks: [
      'At 3 bits the staircase is crude, and the error is a sawtooth filling the ±½ LSB band.',
      'Each extra bit halves the LSB: by 8 bits the staircase hugs the sine, and the ideal SNR has climbed by 30 dB.',
      'Turn the amplitude down to 0.1 V at 4 bits: the signal uses only a couple of codes. Using a fraction of the range wastes bits — this is why a gain stage goes in front of an ADC.',
    ],
    params: {
      aspect: 'wide', x: [0, 6.2832], y: [-1.9, 1.2], xlabel: 'phase', ylabel: 'volts', xticks: 0, axesAt: 'edge',
      sliders: [
        { key: 'N', label: 'Bits $N$', min: 2, max: 10, step: 1, value: 3, unit: '', explain: 'The converter has 2ᴺ codes spread over −1 to +1 V.' },
        { key: 'A', label: 'Signal amplitude', min: 0.05, max: 1, step: 0.01, value: 0.85, unit: '\\mathrm{V}', explain: 'How much of the ±1 V range the sine uses.' },
      ],
      curves: [
        { fn: 'A*sin(x)', color: 'ink3', width: 1.2 },
        { fn: '(2/2^N)*max(-(2^(N-1)), min(2^(N-1) - 1, round(A*sin(x)/(2/2^N))))', color: 'accent', width: 2, samples: 4000 },
        { fn: '-1.55 + 0.5*((2/2^N)*max(-(2^(N-1)), min(2^(N-1) - 1, round(A*sin(x)/(2/2^N)))) - A*sin(x))/(2/2^N)', color: 'warn', width: 1.2, samples: 4000 },
      ],
      hlines: [{ y: -1.3, color: 'ink4' }, { y: -1.8, color: 'ink4' }],
      readouts: [
        { label: 'LSB', expr: '2000/2^N', unit: '\\,\\text{mV}', digits: 3 },
        { label: '$\\text{LSB}/\\sqrt{12}$', expr: '2000/(2^N*sqrt(12))', unit: '\\,\\text{mV}', digits: 3 },
        { label: 'ideal SNR (full-scale sine)', expr: '6.02*N + 1.76', unit: '\\,\\text{dB}', digits: 3 },
      ],
    },
    caption: t`An ideal converter: equal steps, no noise, no offset or gain error. Its top code is one LSB short of +1 V, so a sine near full scale clips there and the error leaves the band. The SNR readout assumes a sine filling the whole range; a smaller one loses 20 dB for every factor of 10 in amplitude.`,
  },
  example: {
    prompt: t`A star tracker’s detector pixel holds up to $20\,000$ electrons (its full well), and its readout adds $8$ electrons rms of noise. The ADC spans the full well. How many bits does it need so that quantization adds no more than a few percent to the read noise? Compare 10, 12 and 14 bits.`,
    visual: stair(4, 0.9, 'The idea in miniature: a 4-bit converter’s staircase over a smooth signal, and the quantization error (orange, magnified) that it adds.', { err: true }),
    steps: [
      { label: 'LSB in electrons', text: t`$\text{LSB} = 20\,000/2^N$: ${[S10, S12, S14].map((s) => `$${s.lsb.toFixed(2)}$`).join(', ')} electrons for 10, 12 and 14 bits.` },
      { label: 'Quantization noise', text: t`$\sigma_q = \text{LSB}/\sqrt{12}$: ${[S10, S12, S14].map((s) => `$${s.q.toFixed(2)}$`).join(', ')} electrons.` },
      { label: 'Combine with read noise', text: t`Independent, so in quadrature with 8 e⁻: ${[S10, S12, S14].map((s) => `$${s.tot.toFixed(2)}$`).join(', ')} electrons — $${(100 * S10.worse).toFixed(0)}\%$, $${(100 * S12.worse).toFixed(1)}\%$ and $${(100 * S14.worse).toFixed(2)}\%$ worse than the read noise alone.` },
      { label: 'Choose', text: t`12 bits: the LSB ($${S12.lsb.toFixed(1)}$ e⁻) is a little below the read noise, and the penalty is $${(100 * S12.worse).toFixed(1)}\%$. 14 bits buys almost nothing more: the read noise already dithers the converter. 10 bits throws away a fifth of the precision on faint stars.` },
      { label: 'Sense check', text: t`A useful rule: make one LSB about the size of the noise floor (or a bit smaller). Then $\sigma_q \approx 0.3$ of it, adding only about 4% in quadrature.` },
    ],
    answer: t`12 bits (LSB $\approx ${S12.lsb.toFixed(1)}$ e⁻, adding $${(100 * S12.worse).toFixed(1)}\%$ to the noise); 10 bits would add $${(100 * S10.worse).toFixed(0)}\%$.`,
  },
  practice: [
    num({
      id: 'lsb', difficulty: 1,
      gen(r) {
        const N = r.pick([8, 10, 12, 14, 16]), V = r.pick([[5, '0 to 5 V'], [10, '±5 V'], [20, '±10 V'], [3.3, '0 to 3.3 V']]);
        const ans = (V[0] / 2 ** N) * 1000;
        return {
          prompt: t`What is the LSB of a ${N}-bit ADC with a range of ${V[1]}, in mV?`,
          visual: stair(Math.min(N, 5), 0.95, `The staircase of a ${Math.min(N, 5)}-bit converter, for scale (a ${N}-bit one has ${2 ** N} steps across its range).`),
          answer: ans, units: 'mV', tol: { rel: 0.005 },
          errors: [{ value: (V[0] / (2 ** N - 1)) * 1000, feedback: t`Close: some data sheets divide by $2^N - 1$, but the usual convention is $V_{FS}/2^N$.` }, ...(V[1].startsWith('±') ? [{ value: (V[0] / 2 / 2 ** N) * 1000, feedback: `The range ${V[1]} spans ${V[0]} V, not ${V[0] / 2} V.` }] : []), { value: (V[0] / N) * 1000, feedback: 'N bits give 2ᴺ codes, not N.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$\text{LSB} = V_{FS}/2^N$, with $V_{FS}$ the whole span.`],
          teach: 'One LSB is the full span divided by 2ᴺ.',
          explain: t`$${V[0]}\ \text{V}/2^{${N}} = ${V[0]}/${2 ** N} = ${tex(ans, 4)}$ mV.`,
        };
      },
    }),
    num({
      id: 'qnoise', difficulty: 2,
      gen(r) {
        const N = r.pick([8, 10, 12, 16]), V = r.pick([2, 10, 20]);
        const lsb = V / 2 ** N, ans = (lsb / Math.sqrt(12)) * 1e3;
        return {
          prompt: t`An ideal ${N}-bit ADC spans ${V} V. What is the rms quantization noise, in mV?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, 1], y: [0, 1.4], xlabel: 'error (LSB)', ylabel: 'probability density', yticks: 0, axesAt: 'edge', curves: [{ fn: 'step(x + 0.5)*step(0.5 - x)', color: 'accent', width: 2, samples: 2000 }], vlines: [{ x: -0.2887, color: 'gold' }, { x: 0.2887, color: 'gold', label: '±1/√12' }] }, caption: 'The quantization error is spread evenly over ±½ LSB; its standard deviation is 1/√12 ≈ 0.29 LSB.' },
          answer: ans, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: (lsb / 2) * 1e3, feedback: '½ LSB is the largest error, not its rms.' }, { value: (lsb / Math.sqrt(3)) * 1e3, feedback: 'a/√3 is for a uniform distribution of half-width a — here a = ½ LSB, giving LSB/√12.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`First the LSB: $${V}/2^{${N}}$ V.`, t`Then $\sigma_q = \text{LSB}/\sqrt{12}$.`],
          teach: 'A uniform error of full width one LSB has standard deviation LSB/√12 (the GUM’s rectangular distribution).',
          explain: t`LSB $= ${tex(lsb * 1e3, 4)}$ mV, $\sigma_q = ${tex(ans, 3)}$ mV. This is the same rectangular-distribution rule as a Type B resolution uncertainty ([Type A and B](#/lesson/lab.A1.2)).`,
        };
      },
    }),
    num({
      id: 'bits-for-snr', difficulty: 2,
      gen(r) {
        const snr = r.pick([60, 72, 80, 90, 100]);
        const ans = Math.ceil((snr - 1.76) / 6.02);
        return {
          prompt: t`An audio-band vibration channel needs an ideal signal-to-noise ratio of at least ${snr} dB for a full-scale sine. What is the smallest number of bits that delivers it?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [4, 24], y: [0, 160], xlabel: 'bits N', ylabel: 'ideal SNR (dB)', axesAt: 'edge', curves: [{ fn: '6.02*x + 1.76', color: 'accent' }] }, caption: 'The ideal SNR of an N-bit converter for a full-scale sine: 6 dB per bit.' },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: Math.floor((snr - 1.76) / 6.02), feedback: 'That falls just short: round up, since a fraction of a bit is not available.' }, { value: Math.ceil(snr / 6.02), feedback: 'Remember the +1.76 dB.' }].filter((e) => e.value !== ans),
          hints: [t`Solve $6.02N + 1.76 \ge ${snr}$ for $N$, then round up.`],
          teach: 'Each bit adds 6.02 dB of ideal SNR: N ≥ (SNR − 1.76)/6.02.',
          explain: t`$N \ge (${snr} - 1.76)/6.02 = ${((snr - 1.76) / 6.02).toFixed(2)}$, so ${ans} bits. Real converters fall a couple of bits short of the ideal: their effective number of bits (ENOB) is what counts.`,
        };
      },
    }),
    mcq({
      id: 'bits-accuracy', difficulty: 2,
      prompt: t`A data card advertises 24 bits. Its data sheet also lists an offset error of $\pm 0.5$ mV and a gain error of $\pm 0.05\%$ on a $\pm 10$ V range. What does a reading of 5.000000 V mean?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 10], xlabel: 'true voltage (V)', ylabel: 'reading (V)', axesAt: 'edge', curves: [{ fn: 'x', color: 'ink3', dash: [6, 4], label: 'ideal', labelAt: 8, labelDy: -12 }, { fn: '0.3 + 1.04*x', color: 'warn', label: 'offset and gain error (exaggerated)', labelAt: 2, labelDy: -16 }] }, caption: 'Offset and gain errors shift and tilt the whole transfer curve. Exaggerated a hundredfold.' },
      choices: ['The true voltage is 5 V to within about ±3 mV (offset plus gain error), despite the 1 µV resolution', 'The true voltage is 5.000000 V to within ±1 µV', 'The reading is useless', 'Gain and offset errors cancel at mid-range'],
      answer: 0,
      why: { 1: 'The LSB of 24 bits over 20 V is about 1.2 µV — that is resolution, not accuracy.', 2: 'It is precise and stable; it just needs calibrating to be accurate.', 3: 'They add to each other at any point that is not zero; neither vanishes at mid-range.' },
      hints: ['Resolution is how finely it can tell two voltages apart; accuracy is how close it is to the truth.', t`Gain error at 5 V: $0.05\% \times 5$ V; offset: 0.5 mV.`],
      teach: 'Bits set resolution; calibration sets accuracy. A converter’s offset and gain errors are systematic.',
      explain: t`$0.0005 \times 5\ \text{V} = 2.5$ mV of gain error plus 0.5 mV of offset: about 3 mV, some 2500 LSBs. Calibrating the card against a reference ([calibration](#/lesson/lab.A7.1)) removes most of it; more bits never would.`,
    }),
    mcq({
      id: 'dither', difficulty: 3,
      prompt: t`A slowly varying signal changes by only 0.3 LSB, and the converter’s input is almost noise-free. The output code never changes. What will reveal the signal?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [-0.5, 1.5], xlabel: 't', ylabel: 'LSB', axesAt: 'edge', curves: [{ fn: '0.2 + 0.025*x', color: 'ink3', label: 'true signal', labelAt: 6, labelDy: -12 }, { fn: 'round(0.2 + 0.025*x)', color: 'accent', width: 2, label: 'ADC output', labelAt: 2, labelDy: 14 }] }, caption: 'A signal smaller than one LSB: the code stays at 0 throughout.' },
      choices: ['Add random noise of about 1 LSB (dither) before the converter and average many readings', 'Average many readings as they are', 'Use a digital filter on the output', 'Nothing: below one LSB is invisible by definition'],
      answer: 0,
      why: { 1: 'Without noise every reading is the same code: averaging identical numbers gives the same number.', 2: 'The output is a constant: there is nothing for a filter to work on.', 3: 'With dither, the fraction of readings that round up encodes the sub-LSB value.' },
      hints: ['Averaging needs readings that differ. What would make them differ?', 'With noise of about 1 LSB, how often does a reading at 0.3 LSB round up to 1?'],
      teach: 'Noise of about an LSB (dither) lets averaging resolve below one LSB — quantization error becomes random and averages away.',
      explain: t`With random noise of about an LSB added, the codes scatter over neighbouring values whose average recovers 0.3 — with rectangular dither exactly one LSB wide, precisely 30% of readings round up to 1. Counter-intuitively, a little noise improves the measurement — which is why noisy sensors such as the star tracker’s pixel need no extra dither.`,
    }),
    code({
      id: 'quant-np', difficulty: 2,
      prompt: t`Quantize a full-scale sine with an ideal converter and check the two rules. Write \`quantize(v, bits, vmax)\` for a converter spanning $\pm$\`vmax\` (round to the nearest code, clip to the $2^N$ codes), then compute \`err_rms\` (the rms of \`q - v\`) and \`snr_db\` ($20\log_{10}$ of the signal’s rms over \`err_rms\`) for 10 bits.`,
      starter: t`import numpy as np

def quantize(v, bits, vmax):
    lsb = 2 * vmax / 2**bits
    # your code: nearest code, clipped to -2**(bits-1) ... 2**(bits-1) - 1, back to volts
    return v

bits, vmax = 10, 1.0
t = np.arange(200000)
v = 0.999 * vmax * np.sin(2 * np.pi * t * 0.0012345)
q = quantize(v, bits, vmax)
err_rms = 0.0
snr_db = 0.0
print(f"err_rms = {err_rms * 1e3:.4f} mV vs LSB/sqrt(12) = {2 * vmax / 2**bits / np.sqrt(12) * 1e3:.4f} mV")
print(f"SNR = {snr_db:.2f} dB vs 6.02N + 1.76 = {6.02 * bits + 1.76:.2f} dB")`,
      answer: t`import numpy as np

def quantize(v, bits, vmax):
    lsb = 2 * vmax / 2**bits
    k = np.clip(np.round(v / lsb), -2**(bits - 1), 2**(bits - 1) - 1)
    return k * lsb

bits, vmax = 10, 1.0
t = np.arange(200000)
v = 0.999 * vmax * np.sin(2 * np.pi * t * 0.0012345)
q = quantize(v, bits, vmax)
err_rms = np.sqrt(np.mean((q - v)**2))
snr_db = 20 * np.log10(np.sqrt(np.mean(v**2)) / err_rms)
print(f"err_rms = {err_rms * 1e3:.4f} mV vs LSB/sqrt(12) = {2 * vmax / 2**bits / np.sqrt(12) * 1e3:.4f} mV")
print(f"SNR = {snr_db:.2f} dB vs 6.02N + 1.76 = {6.02 * bits + 1.76:.2f} dB")`,
      tests: [
        { name: 'quantize rounds to the nearest code and clips at full scale', code: 'abs(quantize(0.3, 3, 1.0) - 0.25) < 1e-12 and abs(quantize(5.0, 3, 1.0) - 0.75) < 1e-12' },
        { name: t`the rms error matches $\text{LSB}/\sqrt{12}$ to 3%`, code: 'abs(err_rms / (2 / 2**10 / np.sqrt(12)) - 1) < 0.03' },
        { name: t`the SNR is within 0.5 dB of $6.02N + 1.76$`, code: 'abs(snr_db - (6.02 * 10 + 1.76)) < 0.5' },
      ],
      hints: [t`\`k = np.clip(np.round(v / lsb), -2**(bits-1), 2**(bits-1) - 1)\`, then \`k * lsb\`.`, t`\`err_rms = np.sqrt(np.mean((q - v)**2))\`; the SNR uses \`np.sqrt(np.mean(v**2))\` over it.`],
      teach: 'Simulating a converter confirms the textbook: LSB/√12 rms error and about 6 dB per bit.',
      explain: t`For 10 bits over $\pm 1$ V, the LSB is 1.953 mV and $\sigma_q = 0.564$ mV; the SNR comes out near $6.02 \times 10 + 1.76 = 61.96$ dB. The rule assumes the error is uniform and uncorrelated with the signal, which a busy signal crossing many codes ensures.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thermo-gain', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([12, 16]), V = 20, S = 41e-6, target = r.pick([0.05, 0.1, 0.25]);   // ±10 V, V/K, K
        const lsbV = V / 2 ** N, lsbK = lsbV / S, G = lsbK / target;
        return {
          prompt: t`A type K thermocouple ($41\ \mu\text{V/K}$) on an engine test stand is read by a ${N}-bit data card spanning $\pm 10$ V. One LSB is worth how many kelvin with no amplifier — and what amplifier gain makes one LSB equal to $${target}$ K? Enter the gain.`,
          visual: stair(4, 0.08, 'A thermocouple’s tiny voltage on a converter built for ±10 V: it uses barely any of the codes (shown with 4 bits for visibility).'),
          answer: G, tol: { rel: 0.01 },
          errors: [{ value: (V / 2 / 2 ** N) / S / target, feedback: 'The ±10 V range spans 20 V.' }, { value: lsbK, feedback: 'That is one LSB in kelvin without a gain. Now find the gain that shrinks it to the target.' }].filter((e) => Math.abs(e.value - G) > 0.02 * G),
          hints: [t`LSB $= 20\ \text{V}/2^{${N}} = ${tex(lsbV * 1e6, 4)}\ \mu\text{V}$, i.e. $${tex(lsbK, 3)}$ K of thermocouple signal.`, t`A gain $G$ divides that by $G$: $G = ${tex(lsbK, 3)}/${target}$.`],
          teach: 'Match the signal to the converter: a gain stage shrinks the LSB in the measured quantity’s units.',
          explain: t`Unamplified, one LSB is $${tex(lsbK, 3)}$ K — useless for a thermocouple. A gain of about $${G.toFixed(0)}$ brings it to $${target}$ K, and the full $\pm 10$ V then spans $\pm ${(10 / G / S).toFixed(0)}$ K of signal${10 / G / S > 1300 ? ', enough for a type K’s whole range' : ': if the engine runs hotter than that above the reference junction, the card clips, and you trade resolution for range'}.`,
        };
      },
    }),
    num({
      id: 'cp-enob', difficulty: 2,
      gen(r) {
        const snr = r.float(60, 95, 0.1);
        const ans = (snr - 1.76) / 6.02;
        return {
          prompt: t`A 16-bit converter, tested with a full-scale sine, delivers a measured signal-to-noise-and-distortion ratio of $${snr}$ dB. What is its effective number of bits (ENOB)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [8, 18], y: [40, 112], xlabel: 'bits', ylabel: 'SNR (dB)', axesAt: 'edge', curves: [{ fn: '6.02*x + 1.76', color: 'accent' }], hlines: [{ y: snr, label: 'measured', color: 'warn' }], vlines: [{ x: 16, label: 'nominal 16 bits', color: 'ink3' }] }, caption: 'The ideal SNR line and the converter’s measured value.' },
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: snr / 6.02, feedback: 'Subtract the 1.76 dB first.' }, { value: 16, feedback: 'The nominal bits are 16; noise and distortion cost some — that is what ENOB measures.' }].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`Invert $\text{SNR} = 6.02N + 1.76$: $\text{ENOB} = (\text{SNR} - 1.76)/6.02$.`],
          teach: 'ENOB = (SINAD − 1.76)/6.02: the bits a real converter actually delivers.',
          explain: t`$(${snr} - 1.76)/6.02 = ${ans.toFixed(2)}$ effective bits, ${(16 - ans).toFixed(1)} bits lost to noise and distortion — normal for a fast 16-bit converter.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'W. Kester (ed.), The Data Conversion Handbook, Analog Devices (2005), ch. 2: SNR = 6.02N + 1.76 dB and ENOB', url: 'https://www.analog.com/en/resources/technical-books/data-conversion-handbook.html' },
    { label: 'JCGM 100:2008 (GUM), F.2.2.1: the resolution of a digital indication as a rectangular distribution', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
  ],
});
