// Averaging and filtering — N independent readings average down as 1/√N;
// averaging is a filter (a moving average, an RC low-pass with equivalent
// noise bandwidth 1/(4τ)) and costs response time; noise that is correlated
// in time (1/f, drift) does not average away, and the Allan deviation shows
// where averaging stops paying: σ_A²(τ) = σ²/(f_s τ) + Dτ/3 for white noise
// plus a random walk, minimized where the two terms are equal. A tank
// pressure transducer, the labf-signal Allan simulation, a MEMS gyro.
// Every number is computed here; the Allan formulas are checked against the
// simulation's model in test/labf-signal.test.mjs.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6 } from './_labf.js';

const t = String.raw;

// ── the worked example: a tank pressure transducer, white σ_w = 2 kPa per reading at 100 Hz, random-walk diffusion D = 0.0025 kPa²/s ──
const PT = { sw: 2, fs: 100, D: 0.0025 };
PT.tauStar = Math.sqrt((3 * PT.sw ** 2) / (PT.fs * PT.D));
PT.sigMin = Math.sqrt(PT.sw ** 2 / (PT.fs * PT.tauStar) + (PT.D * PT.tauStar) / 3);
const adevExpr = (sw, fs, D, floor = 0) => `log10(sqrt(${r6(sw * sw)}/(${fs}*10^x) + ${r6(D)}*10^x/3 + ${r6(floor * floor)}))`;

export default lesson({
  id: 'lab.A8.2',
  title: 'Averaging and filtering',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`Average $N$ readings whose errors are independent and the random error of the mean falls as $\sigma/\sqrt N$. Averaging is a **filter**: it narrows the bandwidth, and so it costs response time — a moving average of $N$ samples lags by about $N/2$ of them, and an RC low-pass with time constant $\tau$ passes an equivalent noise bandwidth of $1/(4\tau)$ and needs about $5\tau$ to settle. The catch is the word *independent*. Noise correlated in time — 1/f flicker, thermal drift — does not average away; past some averaging time, averaging longer makes things **worse**. The **Allan deviation** finds that time. Split the record into blocks of length $\tau$, average each block to get $\bar y_k$, and look at how much neighbouring averages differ:

$$\sigma_A^2(\tau) = \tfrac12\left\langle(\bar y_{k+1} - \bar y_k)^2\right\rangle$$

For white noise it falls as $1/\sqrt\tau$, exactly like $\sigma/\sqrt N$; for flicker noise it is flat; for a random-walk drift it rises as $\sqrt\tau$. Its minimum is the best you can do by averaging.`,
  symbols: [
    { tex: '\\sigma_A(\\tau)', text: 'the Allan deviation at averaging time $\\tau$, in the units of the reading: the typical change between successive $\\tau$-long averages' },
    { tex: '\\tau', text: 'the averaging time, in s: $N$ samples at rate $f_s$ make $\\tau = N/f_s$' },
    { tex: '\\bar y_k', text: 'the average of the readings in the $k$-th block of length $\\tau$' },
    { tex: '\\langle\\ldots\\rangle', text: 'the mean over all pairs of neighbouring blocks' },
  ],
  why: t`Every precision sensor — a gyro, an atomic clock, a thrust stand, a thermometer — is characterized by its Allan deviation, because it answers the practical question: how long should I average?`,
  visual: {
    type: 'labf-signal',
    title: 'How long should you average?',
    lead: t`About 55 minutes of thermocouple readings at 10 Hz. Above: the raw readings (blue) and their one-minute running mean (gold), which shows the slow wander. Below: the Allan deviation against averaging time, with the dashed line that white noise alone would give, $\sigma/\sqrt N$. The gold dot marks the best averaging time.`,
    tasks: [
      'Set the flicker to zero: the Allan deviation follows the dashed √N line all the way down. With pure white noise, averaging always pays.',
      'Watch where the curve leaves the dashed line and flattens: that is the flicker (1/f) noise. Raise it to 0.1 K and the floor rises; beyond it, averaging longer buys nothing.',
      'Add some random-walk drift: the curve turns up at long times, and the gold dot (the optimum) moves to shorter averages.',
    ],
    params: { mode: 'allan', sw: 0.3, flick: 0.08, walk: 0, fs: 10, n: 32768, unit: 'K', seed: 4 },
    caption: t`Simulated readings: white noise of the chosen size per reading, a teaching model of 1/f noise (a sum of slow random processes) and a random walk. At the longest averaging times the curve rests on only a few averages and is itself noisy. Simulated data: a browser cannot replace bench work.`,
  },
  example: {
    prompt: t`A pressure transducer on a propellant tank at rest is read at 100 Hz. Its white noise is $2$ kPa per reading, and its output also wanders as a random walk whose variance grows by $D = 0.0025\ \text{kPa}^2$ every second. For how long should you average, and how small does the noise get?`,
    visual: { type: 'graph', params: { aspect: 'wide', x: [-2, 4], y: [-1.5, 0.6], xlog: true, ylog: true, xlabel: 'averaging time τ (s)', ylabel: 'Allan deviation (kPa)', axesAt: 'edge', curves: [{ fn: adevExpr(2, 100, 0.0025), color: 'accent', width: 2.4 }, { fn: `log10(2/sqrt(100*10^x))`, color: 'ink3', dash: [6, 4], label: 'white: σ/√N', labelAt: -1.4, labelDy: 18 }, { fn: 'log10(sqrt(0.0025*10^x/3))', color: 'warn', dash: [3, 4], label: 'random walk: √(Dτ/3)', labelAt: 2.6, labelDy: 18 }], points: [{ x: r6(Math.log10(PT.tauStar)), y: r6(Math.log10(PT.sigMin)), r: 5, color: 'gold' }] }, caption: 'The Allan deviation (blue) and its two parts. The gold dot is the minimum.' },
    steps: [
      { label: 'White part', text: t`Averaging $N = f_s\tau$ readings: $\sigma_{\text{white}}^2 = \sigma_w^2/(f_s\tau) = 4/(100\,\tau)\ \text{kPa}^2$.` },
      { label: 'Drift part', text: t`For a random walk with diffusion $D$, the Allan variance is $D\tau/3 = 0.0025\,\tau/3\ \text{kPa}^2$ — it grows with $\tau$.` },
      { label: 'Minimize', text: t`$\sigma_A^2 = \dfrac{\sigma_w^2}{f_s\tau} + \dfrac{D\tau}{3}$. Setting $d\sigma_A^2/d\tau = 0$: $\tau^* = \sqrt{3\sigma_w^2/(f_sD)} = \sqrt{3 \times 4/(100 \times 0.0025)} = ${PT.tauStar.toFixed(2)}$ s.` },
      { label: 'The floor', text: t`At $\tau^*$ the two terms are equal: $\sigma_A = \sqrt{2 \times 4/(100 \times ${PT.tauStar.toFixed(2)})} = ${PT.sigMin.toFixed(3)}$ kPa — about $${(2 / PT.sigMin).toFixed(0)}$ times better than a single reading.` },
      { label: 'Sense check', text: t`That is $N = ${Math.round(PT.fs * PT.tauStar)}$ readings; white noise alone would have given $2/\sqrt{${Math.round(PT.fs * PT.tauStar)}} = ${(2 / Math.sqrt(PT.fs * PT.tauStar)).toFixed(3)}$ kPa. Averaging for a minute would be *worse*: $${Math.sqrt(4 / 6000 + 0.0025 * 60 / 3).toFixed(3)}$ kPa.` },
    ],
    answer: t`Average for about $${PT.tauStar.toFixed(0)}$ s, for $\sigma_A \approx ${PT.sigMin.toFixed(2)}$ kPa; longer averages let the drift in.`,
  },
  practice: [
    num({
      id: 'how-many', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 3, 4, 5, 10, 20]);
        return {
          prompt: t`Readings with independent random errors are averaged. How many must you average to cut the random error of the mean by a factor of ${k}?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2.7], y: [-1.5, 0.1], xlog: true, ylog: true, xlabel: 'readings averaged N', ylabel: 'σ of the mean ÷ σ', axesAt: 'edge', curves: [{ fn: 'log10(1/sqrt(10^x))', color: 'accent' }] }, caption: 'The error of a mean falls as 1/√N: a straight line of slope −½ on log–log axes.' },
          answer: k * k, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: k, feedback: `The error falls as 1/√N, not 1/N: to divide it by ${k} you need ${k}² readings.` }, { value: 2 * k, feedback: 'The error scales as 1/√N: square the factor.' }].filter((e) => e.value !== k * k),
          hints: [t`$\sigma/\sqrt N$: what $N$ makes $\sqrt N = ${k}$?`],
          teach: 'Averaging gains only √N: each extra factor of 10 in precision costs 100 times the readings.',
          explain: t`$N = ${k}^2 = ${k * k}$. The square root is why averaging gets expensive fast — and why reducing the noise at its source usually pays better.`,
        };
      },
    }),
    num({
      id: 'enbw', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.01, 0.03, 0.1, 0.3, 1]), e = r.pick([10, 20, 50, 100]);
        const B = 1 / (4 * tau), ans = e * Math.sqrt(B);
        return {
          prompt: t`White noise of density $${e}\ \text{nV}/\sqrt{\text{Hz}}$ passes through a single RC low-pass filter with $\tau = ${tau}$ s. What is the rms noise at its output, in nV? (The equivalent noise bandwidth of one RC stage is $1/(4\tau)$.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [r6(Math.log10(0.01 / tau)), r6(Math.log10(30 / tau))], y: [-2.2, 0.3], xlog: true, ylog: true, xlabel: 'frequency (Hz)', ylabel: '|H|²', axesAt: 'edge', curves: [{ fn: `log10(1/(1 + (2*pi*10^x*${tau})^2))`, color: 'accent' }], vlines: [{ x: r6(Math.log10(1 / (2 * Math.PI * tau))), label: '1/(2πτ)', color: 'ink3' }] }, caption: 'The RC filter’s power response. Its equivalent noise bandwidth is the width of a brick-wall filter passing the same noise power.' },
          answer: ans, units: 'nV', tol: { rel: 0.01 },
          errors: [{ value: e * Math.sqrt(1 / (2 * Math.PI * tau)), feedback: t`$1/(2\pi\tau)$ is the −3 dB corner, not the noise bandwidth. The filter’s gentle roll-off lets more noise through: ENBW $= \pi/2$ times the corner, $1/(4\tau)$.` }, { value: e * B, feedback: 'A density in V/√Hz is multiplied by the square root of the bandwidth.' }].filter((e2) => Math.abs(e2.value - ans) > 0.02 * ans),
          hints: [t`ENBW $= 1/(4\tau) = ${r6(B)}$ Hz.`, t`$v_n = e\sqrt{\text{ENBW}}$.`],
          teach: 'An RC filter’s equivalent noise bandwidth is 1/(4τ) — π/2 times its −3 dB frequency.',
          explain: t`ENBW $= ${r6(B)}$ Hz, so $v_n = ${e}\sqrt{${r6(B)}} = ${ans.toPrecision(3)}$ nV.`,
        };
      },
    }),
    num({
      id: 'lag', difficulty: 2,
      gen(r) {
        const fs = r.pick([10, 50, 100, 1000]), N = r.pick([11, 21, 51, 101]);
        const ans = (N - 1) / (2 * fs);
        return {
          prompt: t`A data logger at $${fs}$ Hz smooths a sensor with a moving average of the last ${N} samples. By how much does the smoothed signal lag a slowly rising input, in seconds?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 10], xlabel: 't', ylabel: 'signal', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'x', color: 'ink3', dash: [6, 4], label: 'input', labelAt: 7.5 }, { fn: 'max(0, x - 1.5)', color: 'accent', label: 'moving average', labelAt: 8, labelDy: 16 }] }, caption: 'A ramp and its moving average: the same shape, shifted later. Schematic.' },
          answer: ans, units: 's', tol: { rel: 0.02 },
          errors: [{ value: N / fs, feedback: 'The average of the last N samples is centred on the middle one, (N − 1)/2 samples back — not N.' }, { value: (N - 1) / 2, feedback: 'That is in samples. Divide by the sample rate.' }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: ['A trailing average’s value belongs, in effect, to the middle of its window.', t`That is $(N - 1)/2$ samples ago.`],
          teach: 'A trailing moving average delays the signal by half its window: smoothing costs time.',
          explain: t`$(${N} - 1)/2 = ${(N - 1) / 2}$ samples, $= ${ans}$ s. On a test stand, that lag would shift the apparent ignition or shutdown time — filter offline with a centred (zero-phase) filter if timing matters.`,
        };
      },
    }),
    num({
      id: 'read-allan', difficulty: 2,
      gen(r) {
        const sw = r.pick([0.5, 1, 2]), fs = r.pick([10, 100]), D = r.pick([1e-4, 4e-4, 1e-3]);
        const ts = Math.sqrt((3 * sw * sw) / (fs * D));
        const lo = Math.floor(Math.log10(ts)) - 2, hi = lo + 5;
        const ymin = Math.log10(Math.sqrt(2 * sw * sw / (fs * ts)));
        return {
          prompt: t`From this Allan deviation plot of a sensor, at roughly what averaging time is the noise of an average smallest, in seconds?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [lo, hi], y: [r6(ymin - 0.4), r6(ymin + 2)], xlog: true, ylog: true, xlabel: 'averaging time τ (s)', ylabel: 'Allan deviation', axesAt: 'edge', curves: [{ fn: adevExpr(sw, fs, D), color: 'accent', width: 2.4 }] }, caption: 'A measured Allan deviation (white noise plus drift).' },
          answer: ts, units: 's', tol: { rel: 0.35 },
          hints: ['Find the bottom of the curve and read its τ off the logarithmic axis.', 'Each labelled tick is a factor of 10; halfway between two is a factor of about 3.'],
          teach: 'The minimum of the Allan deviation is the optimal averaging time.',
          explain: t`The minimum sits near $\tau \approx ${tex(ts, 2)}$ s. Shorter averages are dominated by white noise (the falling side), longer ones by drift (the rising side).`,
        };
      },
    }),
    num({
      id: 'tau-star', difficulty: 3,
      gen(r) {
        const sw = r.pick([0.2, 0.5, 1.0]), fs = r.pick([10, 50, 100]), D = r.pick([1e-5, 1e-4, 5e-4]);
        const ans = Math.sqrt((3 * sw * sw) / (fs * D));
        return {
          prompt: t`A thermocouple read at $${fs}$ Hz has white noise $\sigma_w = ${sw}$ K per reading and a random-walk drift with diffusion $D = ${tex(D)}\ \text{K}^2/\text{s}$, so $\sigma_A^2(\tau) = \sigma_w^2/(f_s\tau) + D\tau/3$. What averaging time minimizes the Allan deviation?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 60], y: [-1.6, 1.6], xlabel: 't (min)', ylabel: 'reading − mean (K)', yticks: 0, axesAt: 'edge', curves: [{ fn: '0.5*sin(0.21*x + 1) + 0.3*sin(0.083*x) + 0.25*sin(37*x)*sin(11*x + 2) + 0.15*sin(73*x + 0.5)', color: 'accent', width: 1, samples: 4000 }] }, caption: 'Schematic readings: fast jitter (white noise) on top of a slow wander (drift).' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((sw * sw) / (fs * D)), feedback: t`Differentiate carefully: $-\sigma_w^2/(f_s\tau^2) + D/3 = 0$ gives $\tau^2 = 3\sigma_w^2/(f_sD)$ — keep the 3.` }, { value: (3 * sw * sw) / (fs * D), feedback: 'That is τ². Take the square root.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Differentiate $\sigma_A^2$ with respect to $\tau$ and set it to zero.`, t`$\tau^* = \sqrt{3\sigma_w^2/(f_sD)}$.`],
          teach: 'The optimal averaging time balances white noise falling as 1/τ against drift growing as τ (in variance).',
          explain: t`$\tau^* = \sqrt{3 \times ${sw}^2/(${fs} \times ${tex(D)})} = ${ans.toPrecision(3)}$ s, where the white and drift terms of $\sigma_A^2$ are equal. There $\sigma_A = ${Math.sqrt(2 * sw * sw / (fs * ans)).toPrecision(2)}$ K.`,
        };
      },
    }),
    mcq({
      id: 'filter-helps', difficulty: 2,
      prompt: t`A thrust stand logs at 1 kHz. To “clean up” the noisy trace you apply a heavy RC low-pass with $\tau = 0.5$ s. What is the cost?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4], y: [-0.1, 1.2], xlabel: 't (s)', ylabel: 'thrust (normalized)', axesAt: 'edge', curves: [{ fn: 'step(x - 0.5)*step(3 - x)', color: 'ink3', dash: [6, 4], label: 'true thrust', labelAt: 1.6, labelDy: -12 }, { fn: 'step(x - 0.5)*(1 - exp(-(x - 0.5)/0.5)) - step(x - 3)*(1 - exp(-(x - 3)/0.5))*(1 - exp(-2.5/0.5))', color: 'accent', label: 'after the filter', labelAt: 1.0, labelDy: 18 }] }, caption: 'A 2.5 s burn and the same trace after an RC filter with τ = 0.5 s (noise left out for clarity).' },
      choices: ['The rise and tail-off are smeared over seconds (about 5τ to settle) and the peak and burn time come out wrong', 'None: filtering only removes noise', 'It adds noise at high frequency', 'It changes the total impulse a lot'],
      answer: 0,
      why: { 1: 'A filter cannot tell noise from fast real changes: it removes both.', 2: 'A low-pass removes high-frequency content, signal and noise alike.', 3: 'A linear filter with unit DC gain preserves the area under the curve (total impulse); it is the timing and the shape that suffer.' },
      hints: ['How long does an RC filter take to respond to a sudden change?'],
      teach: 'Filtering trades response time for noise: it is right only when the signal is slower than the filter.',
      explain: t`Ignition and shutdown are sharper than 0.5 s, so the filter rounds them off over about $5\tau = 2.5$ s. The impulse (area) survives, but the thrust rise rate, peak and burn time do not. Choose the bandwidth from the fastest feature you need to see.`,
    }),
    code({
      id: 'allan-np', difficulty: 3,
      prompt: t`Write \`adev(x, m)\`: the overlapping Allan deviation of samples \`x\` at averaging length \`m\` samples (average every window of \`m\` consecutive samples, take differences of windows \`m\` apart, $\sigma_A^2 = \tfrac12\,\text{mean}(\text{diff}^2)$). Hint: a cumulative sum gives all window averages at once. The program applies it to simulated readings with white noise and drift and finds the best \`m\` among powers of two.`,
      starter: t`import numpy as np

rng = np.random.default_rng(7)
fs, n = 10.0, 2**16
x = rng.normal(0, 0.5, n) + np.cumsum(rng.normal(0, 0.003, n))   # white + random walk

def adev(x, m):
    # your code
    return 0.0

ms = 2 ** np.arange(0, 13)
devs = np.array([adev(x, m) for m in ms])
m_best = ms[np.argmin(devs)]
print("best averaging time:", m_best / fs, "s")`,
      answer: t`import numpy as np

rng = np.random.default_rng(7)
fs, n = 10.0, 2**16
x = rng.normal(0, 0.5, n) + np.cumsum(rng.normal(0, 0.003, n))   # white + random walk

def adev(x, m):
    c = np.concatenate([[0.0], np.cumsum(x)])
    avg = (c[m:] - c[:-m]) / m          # every window of m samples
    d = avg[m:] - avg[:-m]              # windows m apart
    return np.sqrt(0.5 * np.mean(d**2))

ms = 2 ** np.arange(0, 13)
devs = np.array([adev(x, m) for m in ms])
m_best = ms[np.argmin(devs)]
print("best averaging time:", m_best / fs, "s")`,
      tests: [
        { name: 'white noise alone: adev at m = 1 is σ and falls as 1/√m', code: '(lambda w: abs(adev(w, 1) - 1) < 0.03 and abs(adev(w, 16) * 4 - 1) < 0.08)(np.random.default_rng(1).normal(size=2**15))' },
        { name: t`the best averaging time is near $\tau^* = \sqrt{3\sigma_w^2/(f_sD)} \approx 29$ s (a power of two of samples)`, code: 'm_best in (128, 256, 512)' },
        { name: 'adev of a constant is zero', code: 'adev(np.ones(1000), 10) == 0' },
      ],
      hints: [t`\`c = np.concatenate([[0.0], np.cumsum(x)])\`; then \`(c[m:] - c[:-m]) / m\` is the average of every window of length \`m\`.`, t`\`d = avg[m:] - avg[:-m]\`; return \`np.sqrt(0.5 * np.mean(d**2))\`.`],
      teach: 'An Allan deviation is three lines with a cumulative sum — and it tells you exactly how long to average.',
      explain: t`Here $\sigma_w = 0.5$, $D = 0.003^2 \times 10 = 9\times10^{-5}$ per second, so $\tau^* = \sqrt{3 \times 0.25/(10 \times 9\times10^{-5})} \approx 29$ s — about 290 samples, between $m = 256$ and $512$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gyro', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([0.05, 0.1, 0.2, 0.3, 0.5]), tau = r.pick([10, 36, 100, 360, 900]);
        const ans = N / Math.sqrt(tau / 3600);
        return {
          prompt: t`A spacecraft’s rate gyro has an angle random walk of $${N}^\circ/\sqrt{\text{h}}$: on short averaging times its Allan deviation is $\sigma_A(\tau) = N/\sqrt\tau$. What is the Allan deviation of its rate reading averaged over $\tau = ${tau}$ s, in degrees per hour?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4.5], y: [-2.5, 1.5], xlog: true, ylog: true, xlabel: 'τ (s)', ylabel: 'σA (°/h)', axesAt: 'edge', curves: [{ fn: `log10(sqrt(${r6(N * N)}*3600/10^x + 0.0009))`, color: 'accent' }], vlines: [{ x: r6(Math.log10(tau)), color: 'gold' }] }, caption: 'A gyro’s Allan deviation: the falling white (angle-random-walk) part and a bias-instability floor. Model curve, not a specific gyro.' },
          answer: ans, units: 'deg/h', tol: { rel: 0.03 },
          errors: [{ value: N / Math.sqrt(tau), feedback: 'Units: N is in °/√h, so τ must be in hours before dividing.' }, { value: N * Math.sqrt(tau / 3600), feedback: 'White-type noise falls with averaging: divide by √τ.' }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`Convert $\tau$ to hours: $${tau}\ \text{s} = ${r6(tau / 3600)}$ h.`, t`$\sigma_A = ${N}/\sqrt{${r6(tau / 3600)}}$ in $^\circ$/h.`],
          teach: t`Angle random walk $N$ gives $\sigma_A(\tau) = N/\sqrt\tau$ — with $\tau$ in the units $N$ is quoted in.`,
          explain: t`$${N}/\sqrt{${r6(tau / 3600)}} = ${ans.toPrecision(3)}^\circ/\text{h}$. Integrated over a manoeuvre, angle random walk makes the attitude error grow as $N\sqrt t$ — why attitude estimators correct gyros with star-tracker fixes.`,
        };
      },
    }),
    mcq({
      id: 'cp-floor', difficulty: 2,
      prompt: t`A thermocouple’s Allan deviation falls as $1/\sqrt\tau$ up to about 30 s and is flat beyond. You need 3 times less noise than a 30 s average gives. What will work?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1, 4], y: [-2.6, -0.2], xlog: true, ylog: true, xlabel: 'τ (s)', ylabel: 'σA (K)', axesAt: 'edge', curves: [{ fn: 'log10(sqrt(0.09/(10*10^x) + 0.017^2))', color: 'accent' }] }, caption: 'White noise at short times, a 1/f floor from about 30 s on.' },
      choices: ['Not averaging longer: reduce the 1/f noise itself (a better amplifier, chopping or modulation, a quieter reference junction)', 'Average for 270 s (nine times longer)', 'Average for 900 s', 'Take readings 10 times faster'],
      answer: 0,
      why: { 1: t`That would work only for white noise. On the flat floor, $\sigma_A$ does not fall at all with $\tau$.`, 2: 'Still on the flat floor: no gain.', 3: 'Faster sampling lowers the white part, which is already below the floor at 30 s.' },
      hints: ['What does a flat Allan deviation say about the benefit of averaging longer?'],
      teach: 'On a 1/f floor, averaging has stopped working: change the noise, not the averaging time.',
      explain: t`The flat region is 1/f noise: correlated over long times, so longer averages of it are no quieter. Lower the floor by changing the measurement — modulating the signal to a frequency above the 1/f corner and detecting it with a [lock-in](#/lesson/lab.A8.3) is the classic cure.`,
    }),
  ],
  sources: [
    { label: 'IEEE Std 952-1997 (R2008), Annex C: Allan variance method for gyro noise', url: 'https://standards.ieee.org/ieee/952/1660/' },
    { label: 'D. W. Allan, “Statistics of atomic frequency standards”, Proc. IEEE 54, 221 (1966)', url: 'https://doi.org/10.1109/PROC.1966.4634' },
    { label: 'NIST Special Publication 1065, Handbook of Frequency Stability Analysis (W. J. Riley)', url: 'https://www.nist.gov/publications/handbook-frequency-stability-analysis' },
  ],
});
