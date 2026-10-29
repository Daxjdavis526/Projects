// Calibration curves and systematic error — an instrument's response measured
// against known standards, fitted, and then run backwards (inverse
// prediction) with the fit's covariance; systematic errors (shared by every
// reading, untouched by averaging) against statistical ones; offsets found
// by reversal and by an intercept; extrapolation beyond the calibrated range;
// uncertainty budgets that add the standards' own uncertainty. A rocket test
// stand's load cell, a Hall probe on the bench, and a thermocouple.
// Every number is computed here (seeded synthetic data, _labf.js).
import { lesson, mcq, multi, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { B, normals, linfit, dataGraph, resGraph, r6, SIMNOTE, table } from './_labf.js';

const t = String.raw;

// ── the worked example: a 5 kN load cell (2 mV/V at 10 V excitation) calibrated with dead weights, σ = 0.010 mV ──
const LC_F = [0, 1, 2, 3, 4, 5];
const LC_y = (() => { const z = normals(7); return LC_F.map((x) => +(0.120 + 4.000 * x + 0.010 * z()).toFixed(3)); })();
const LC = linfit(LC_F, LC_y, 0.010);
const Y0 = 14.620, SY0 = 0.010;
const XH = (Y0 - LC.a) / LC.b;
const VX = (SY0 ** 2 + LC.sa ** 2 + XH * XH * LC.sb ** 2 + 2 * XH * LC.cov) / LC.b ** 2;
const SX = Math.sqrt(VX);
const SX_noCov = Math.sqrt((SY0 ** 2 + LC.sa ** 2 + XH * XH * LC.sb ** 2) / LC.b ** 2);
const REL_W = 0.0002, REL_T = 0.00064 / Math.sqrt(3);          // dead weights (k = 1); span temperature effect, rectangular ±0.064 %
const U_W = REL_W * XH, U_T = REL_T * XH;
const U_TOT = Math.sqrt(VX + U_W ** 2 + U_T ** 2);

export default lesson({
  id: 'lab.A7.1',
  title: 'Calibration curves and systematic error',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`An instrument never reads the quantity you want: a load cell gives millivolts, a thermocouple microvolts, a star tracker pixel counts. **Calibration** measures its response $y$ to known standards $x$, fits a curve — often a line $y = a + bx$ — and then runs it backwards: a reading $y_0$ means

$$\hat x = \frac{y_0 - a}{b}, \qquad \sigma_{\hat x}^2 = \frac{\sigma_{y_0}^2 + \sigma_a^2 + \hat x^2\sigma_b^2 + 2\hat x\operatorname{cov}(a,b)}{b^2}$$

Whatever the calibration gets wrong, every later reading inherits: that is a **systematic error** — the same in every reading, so averaging cannot remove it. **Statistical** (random) errors differ from reading to reading and average down as $1/\sqrt N$. A measurement’s uncertainty must include both, and the uncertainty of the standards themselves (JCGM 100:2008, the GUM, treats a correction for a known systematic effect as an input with its own uncertainty).`,
  symbols: [
    { tex: 'x', text: 'the quantity being measured — here the known value of each standard during calibration (force, temperature …)' },
    { tex: 'y', text: 'the instrument’s output (mV, counts …)' },
    { tex: 'a,\\ b', text: 'the calibration’s offset (output at $x = 0$) and sensitivity (output per unit $x$)' },
    { tex: 'y_0', text: 'a new reading taken in use, with standard uncertainty $\\sigma_{y_0}$' },
    { tex: '\\hat x', text: 'the measured value inferred from $y_0$ — inverse prediction' },
    { tex: '\\sigma_a,\\ \\sigma_b,\\ \\operatorname{cov}(a,b)', text: 'the calibration fit’s uncertainties and covariance ([covariance](#/lesson/lab.A6.3))' },
  ],
  why: t`Thrust, chamber pressure and temperature on a test stand are all calibration curves run backwards — and a test article qualified with a load cell that reads 1% high is 1% wrong in every number it produced.`,
  visual: {
    type: 'lab-bench',
    title: 'The bench: a Hall probe zeroed in the wrong place',
    lead: t`The field at the centre of a flat coil against the current through it, positive and reversed. The dashed green line is what the coil alone should give. Watch the intercept in the readout.`,
    tasks: [
      'Run the series: the fitted line goes through (0, 0) within its uncertainty, and the slope matches the coil’s μ₀NI/2R.',
      'Turn on the systematic error (the probe was zeroed in the stockroom, so it adds the bench’s background field): every point rises by 0.040 mT. The slope is unchanged; the intercept moves many σ from zero.',
      'Take more readings with the fault on: the intercept’s ± shrinks, but it gets no closer to zero. Averaging beats random error, never systematic error. Reversing the current — flipping the coil’s field but not the background — is what exposed it.',
    ],
    params: { exp: 'coil', expected: true, residuals: false, seed: 12 },
    caption: t`Simulated Hall-probe readings scattered by $0.003$ mT; the background is a steady $0.040$ mT along the coil’s axis. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A 5 kN load cell on a rocket test stand (excited at 10 V) is calibrated with dead weights, each output read with $\sigma = 0.010$ mV:

${table([[t`F\ (\text{kN})`, ...LC_F.map(String)], [t`y\ (\text{mV})`, ...LC_y.map((v) => v.toFixed(3))]])}

During a hot fire the steady-state output reads $y_0 = ${Y0.toFixed(3)} \pm ${SY0.toFixed(3)}$ mV. What is the thrust, with its uncertainty? The dead weights are certified to $0.02\%$, and the stand warms during the run; the cell's span changes by up to $\pm 0.064\%$ over that range.`,
    visual: { type: 'graph', params: resGraph({ xs: LC_F, res: LC.res.map((r) => 1000 * r), sy: 10, xlabel: 'F (kN)', ylabel: 'residual (µV)' }), caption: t`The calibration’s residuals (µV) with $\pm 10$ µV error bars: no pattern, $\chi^2 = ${LC.chi2.toFixed(1)}$ for $\nu = 4$. A straight line is adequate over 0–5 kN. Synthetic data. ${SIMNOTE}` },
    steps: [
      { label: 'Fit the calibration', text: t`Weighted fit with known $\sigma$: $a = ${LC.a.toFixed(4)} \pm ${LC.sa.toFixed(4)}$ mV, $b = ${LC.b.toFixed(4)} \pm ${LC.sb.toFixed(4)}$ mV/kN, $\operatorname{cov}(a, b) = ${tex(LC.cov, 3)}\ \text{mV}^2/\text{kN}$.` },
      { label: 'Invert', text: t`$\hat F = (${Y0.toFixed(3)} - ${LC.a.toFixed(4)})/${LC.b.toFixed(4)} = ${XH.toFixed(4)}$ kN.` },
      { label: 'Statistical uncertainty', text: t`$\sigma_{\hat F}^2 = [${SY0}^2 + ${LC.sa.toFixed(4)}^2 + ${XH.toFixed(3)}^2 \times ${LC.sb.toFixed(4)}^2 + 2 \times ${XH.toFixed(3)} \times (${tex(LC.cov, 3)})]/${LC.b.toFixed(4)}^2$, so $\sigma_{\hat F} = ${(1000 * SX).toFixed(2)}$ N. (Dropping the covariance would give ${(1000 * SX_noCov).toFixed(2)} N.)` },
      { label: 'The standards', text: t`The fit knows nothing about the weights’ own error: if they are $0.02\%$ heavy, so is every calibrated force. That is a Type B, fully systematic term: $0.0002 \times ${(1000 * XH).toFixed(0)}\ \text{N} = ${(1000 * U_W).toFixed(2)}$ N.` },
      { label: 'Temperature', text: t`A span change of up to $\pm 0.064\%$, with nothing known about where in that range it lies, is a rectangular distribution: $u = 0.064\%/\sqrt3 = ${(100 * REL_T).toFixed(3)}\%$, or $${(1000 * U_T).toFixed(2)}$ N.` },
      { label: 'Combine', text: t`In quadrature: $u = \sqrt{${(1000 * SX).toFixed(2)}^2 + ${(1000 * U_W).toFixed(2)}^2 + ${(1000 * U_T).toFixed(2)}^2} = ${(1000 * U_TOT).toFixed(1)}$ N. ${SX > U_T ? `The reading and the fit dominate, but the two systematic terms still add $${(1000 * (U_TOT - SX)).toFixed(1)}$ N — and unlike the first, more readings would never shrink them.` : 'The temperature effect, not the fit, is the largest term.'}` },
      { label: 'Sense check', text: t`$${(1000 * XH).toFixed(0)}$ N is $${(XH / 5 * 100).toFixed(0)}\%$ of full scale, inside the calibrated range — no extrapolation. A zero check before and after the run would catch a drifting offset, which this budget assumes away.` },
    ],
    answer: t`$F = ${(1000 * XH).toFixed(0)} \pm ${(1000 * U_TOT).toFixed(0)}$ N (standard uncertainty), of which $${(1000 * SX).toFixed(1)}$ N is statistical.`,
  },
  practice: [
    num({
      id: 'invert', difficulty: 1,
      gen(r) {
        const a = r.float(-0.5, 0.5, 0.01), b = r.float(38, 42, 0.1), y0 = r.float(800, 3500, 1);   // µV, µV/K
        const ans = (y0 - a) / b;
        return {
          prompt: t`A thermocouple’s calibration is $V = ${a} + ${b}\,T$ (µV, with $T$ in °C above the reference junction). It reads $${y0}$ µV. What temperature difference does that mean?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 100], y: [0, 4200], xlabel: 'T (°C)', ylabel: 'V (µV)', axesAt: 'edge', curves: [{ fn: `${a} + ${b}*x`, color: 'gold' }], hlines: [{ y: y0, label: 'reading', color: 'accent' }] }, caption: 'The calibration line and the reading: inverse prediction reads across, then down.' },
          answer: ans, units: 'K', difference: true, tol: { rel: 0.002 },
          errors: [{ value: a + b * y0, feedback: 'You put the reading into the calibration forwards. Solve V = a + bT for T.' }, { value: y0 / b, feedback: 'Close, but subtract the offset a first.' }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$T = (V - a)/b$.`],
          teach: 'Inverse prediction: subtract the offset, divide by the sensitivity.',
          explain: t`$T = (${y0} - (${a}))/${b} = ${ans.toFixed(2)}$ K above the reference junction.`,
        };
      },
    }),
    num({
      id: 'sigma-x', difficulty: 3,
      gen(r) {
        const b = r.float(1.8, 2.2, 0.01), sa = r.float(0.010, 0.030, 0.001), sb = r.float(0.002, 0.006, 0.0001), rho = -r.float(0.7, 0.9, 0.01);
        const cov = rho * sa * sb, a = r.float(0.05, 0.2, 0.01), y0 = r.float(6, 9, 0.01), sy0 = r.pick([0.01, 0.02]);
        const xh = (y0 - a) / b;
        const ans = Math.sqrt(sy0 ** 2 + sa ** 2 + xh * xh * sb ** 2 + 2 * xh * cov) / b;
        const only = sy0 / b;
        return {
          prompt: t`A calibration gives $a = ${a}$ V, $b = ${b}$ V/MPa with $\sigma_a = ${sa}$ V, $\sigma_b = ${sb}$ V/MPa and $\operatorname{cov}(a, b) = ${tex(cov, 3)}\ \text{V}^2/\text{MPa}$. A pressure transducer then reads $y_0 = ${y0} \pm ${sy0}$ V. What is the standard uncertainty of the inferred pressure?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 5], y: [0, 11], xlabel: 'p (MPa)', ylabel: 'output (V)', axesAt: 'edge', curves: [{ fn: `${a} + ${b}*x`, color: 'gold' }], hlines: [{ y: y0, color: 'accent' }], vlines: [{ x: r6(xh), label: 'p̂', color: 'accent' }] }, caption: 'The calibration line, the reading and the inferred pressure. The uncertainty band is far too thin to see at this scale.' },
          answer: ans, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: only, feedback: t`That is only the reading’s share, $\sigma_{y_0}/b$. The calibration’s own uncertainty ($\sigma_a$, $\sigma_b$, cov) belongs in every inferred value.` }, { value: Math.sqrt(sy0 ** 2 + sa ** 2 + xh * xh * sb ** 2) / b, feedback: t`You left out $2\hat x\operatorname{cov}(a, b)$.` }, { value: Math.sqrt(sy0 ** 2 + sa ** 2 + xh * xh * sb ** 2 + 2 * xh * cov), feedback: t`Divide by $b$: the numerator is an uncertainty in volts; dividing converts it to MPa.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`First $\hat x = (y_0 - a)/b = ${xh.toFixed(4)}$ MPa.`, t`$\sigma_{\hat x}^2 = [\sigma_{y_0}^2 + \sigma_a^2 + \hat x^2\sigma_b^2 + 2\hat x\operatorname{cov}]/b^2$.`],
          teach: 'An inferred value carries the reading’s noise and the calibration’s uncertainty, covariance included.',
          explain: t`Numerator: $${r6(sy0 ** 2)} + ${r6(sa ** 2)} + ${r6(xh * xh * sb ** 2)} ${2 * xh * cov < 0 ? '-' : '+'} ${r6(Math.abs(2 * xh * cov))} = ${r6(sy0 ** 2 + sa ** 2 + xh * xh * sb ** 2 + 2 * xh * cov)}\ \text{V}^2$; so $\sigma_{\hat x} = ${ans.toFixed(4)}$ MPa, against $${only.toFixed(4)}$ MPa from the reading alone.`,
        };
      },
    }),
    multi({
      id: 'classify', difficulty: 2,
      prompt: 'Which of these are systematic errors — the same in every reading of a session? Select all that apply.',
      visual: (() => { const z = normals(33); const pts = []; for (let k = 0; k < 12; k++) { pts.push({ x: r6(0.3 * z()), y: 2, r: 3.5, color: 'accent' }); pts.push({ x: r6(0.8 + 0.3 * z()), y: 1, r: 3.5, color: 'warn' }); } return { type: 'graph', params: { aspect: 'wide', x: [-1.5, 2.5], y: [0.3, 2.7], xlabel: 'reading − true value (arbitrary units)', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: 0, label: 'true value', color: 'good' }], points: [...pts, { x: 1.55, y: 2.25, r: 0, label: 'random error only' }, { x: 1.55, y: 1.25, r: 0, label: 'random + systematic' }] } , caption: 'Twelve readings of the same quantity, twice. Random error scatters them about the truth; a systematic error moves the whole cloud.' }; })(),
      choices: ['A balance’s reference masses are all 0.05% heavy', 'A thermocouple’s reference junction sits at 23 °C but is assumed to be at 0 °C', 'Electronic noise on a voltmeter', 'Your reaction time scattering each stopwatch timing', 'A Hall probe zeroed away from the bench’s magnetized steel', 'Air currents jostling a balance pan'],
      answer: [0, 1, 4],
      why: { 2: 'Noise differs from reading to reading: random, and it averages down.', 3: 'Scatter of reaction time is random. (A consistent late stop would be systematic.)', 5: 'Air currents push this way and that: random scatter.' },
      hints: ['Ask of each: would it be the same in the next reading, and the one after?', 'Errors fixed by how the instrument was set up or calibrated repeat exactly; disturbances that come and go do not.'],
      teach: 'Systematic errors repeat in every reading; random ones change each time — and only the random ones average away.',
      explain: t`Heavy reference masses, a wrong reference-junction temperature and an unzeroed probe shift every reading identically. Noise, reaction scatter and air currents change each time. The same physical cause can be either: a stopwatch habitually stopped late is systematic; its scatter is random.`,
    }),
    mcq({
      id: 'extrapolate', difficulty: 2,
      prompt: t`A pressure transducer was calibrated from 0 to 10 MPa. During a test it reads an output corresponding to 14 MPa on the calibration line. What should you say about that value?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 16], y: [0, 16], xlabel: 'true pressure (MPa)', ylabel: 'indicated (MPa)', axesAt: 'edge', curves: [{ fn: 'x', color: 'gold', domain: [0, 10], label: 'calibrated', labelAt: 5 }, { fn: 'x', color: 'gold', dash: [5, 5], domain: [10, 16] }, { fn: 'x - 0.03*(x - 10)^2*step(x - 10)', color: 'warn', domain: [0, 16], width: 1.5 }], vlines: [{ x: 10, label: 'end of calibration', color: 'ink3' }] }, caption: 'A transducer that is linear up to 10 MPa and then starts to saturate (orange). Nothing in the calibration data could reveal the bend. Schematic.' },
      choices: ['It is an extrapolation: the calibration says nothing about the response above 10 MPa, so the value has an unknown systematic error', 'It is as good as any other reading, since the line is straight', t`Its uncertainty is $\sigma_a$ and $\sigma_b$ propagated to 14 MPa, so it is just slightly larger`, 'It is more accurate, because it is far from zero'],
      answer: 0,
      why: { 1: 'Straight where you looked, not necessarily beyond.', 2: 'That formula assumes the line holds at 14 MPa — exactly what is unknown. Nonlinearity or saturation would not show in it.', 3: 'Relative noise may be smaller there, but the response itself is unverified.' },
      hints: ['What did the calibration actually test?'],
      teach: 'A calibration holds only over the range it covered: beyond it, the error is unknown, not just bigger.',
      explain: t`The fit’s $\sigma$’s only describe uncertainty *if the model holds*. Above 10 MPa the transducer may saturate or bend, and no calibration point tests it. Calibrate over the full range you will use — with margin — or flag the reading as outside the calibration.`,
    }),
    num({
      id: 'combine', difficulty: 2,
      gen(r) {
        const N = r.pick([10, 25, 50, 100]), s = r.float(0.4, 1.2, 0.1), rel = r.pick([0.1, 0.2, 0.3]), T = r.int(300, 900);
        const ustat = s / Math.sqrt(N), usys = (rel / 100) * T, ans = Math.hypot(ustat, usys);
        return {
          prompt: t`${N} readings of an exhaust-gas thermocouple average $${T}$ °C with a standard deviation of $${s}$ K. Its calibration certificate gives a standard uncertainty of $${rel}\%$ of reading, the same for every reading. What is the combined standard uncertainty of the mean?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1], y: [0, 4], xlabel: '', xticks: 0, ylabel: '', yticks: 0, axes: false, grid: false, curves: [{ param: [`0.1 + ${r6(0.8 * ustat / Math.max(ustat, usys))}*t`, '3'], t: [0, 1], color: 'accent', width: 10 }, { param: [`0.1 + ${r6(0.8 * usys / Math.max(ustat, usys))}*t`, '1.6'], t: [0, 1], color: 'warn', width: 10 }], points: [{ x: 0.1, y: 3.6, r: 0, label: 'statistical: s/√N', labelDy: 0 }, { x: 0.1, y: 2.2, r: 0, label: 'calibration (systematic)', labelDy: 0 }] }, caption: 'The two contributions to scale (bar lengths).' },
          answer: ans, units: 'K', difference: true, tol: { rel: 0.01 },
          errors: [{ value: ustat, feedback: 'That is only the statistical part. The calibration uncertainty does not shrink with N, and it must be included.' }, { value: ustat + usys, feedback: 'Independent uncertainties add in quadrature, not linearly.' }, { value: Math.hypot(s, usys), feedback: t`The statistical part of a mean is $s/\sqrt N$, not $s$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Statistical: $s/\sqrt N$. Systematic: $${rel}\% \times ${T}$ °C.`, 'Add the two in quadrature.'],
          teach: 'Combine the statistical uncertainty of a mean with the systematic one in quadrature; only the first shrinks with N.',
          explain: t`$s/\sqrt N = ${ustat.toFixed(3)}$ K and $${rel}\% \times ${T} = ${usys.toFixed(2)}$ K, so $u = ${ans.toFixed(2)}$ K. ${usys > 3 * ustat ? 'The calibration dominates: more readings would be wasted effort.' : 'Both matter here.'}`,
        };
      },
    }),
    order({
      id: 'procedure', difficulty: 2,
      prompt: 'Put the steps of calibrating a test-stand load cell in order.',
      visual: { type: 'graph', params: resGraph({ xs: LC_F, res: LC.res.map((x) => 1000 * x), sy: 10, xlabel: 'F (kN)', ylabel: 'residual (µV)' }), caption: 'One step’s output: the residuals of the calibration fit.' },
      items: [
        'Power the bridge and let the load cell and amplifier warm up',
        'Record the zero reading with the stand unloaded',
        'Apply certified dead weights in steps up the full range, then back down',
        'Fit the calibration line and inspect the residuals (and the up/down difference)',
        'Invert the line for test readings, adding the standards’ uncertainty to the budget',
        'Re-check the zero after the test to catch drift',
      ],
      hints: ['Things that change with time (warm-up) come first.', 'Fitting needs the data; inverting needs the fit; a final zero check closes the session.'],
      teach: 'A calibration session: stabilize, zero, load up and down across the range, fit and check, invert with a full budget, re-zero.',
      explain: 'Warm-up first, because the zero drifts as the electronics settle. Loading and unloading reveals hysteresis. The fit is checked by its residuals before it is trusted, and a zero check after the test shows whether the offset held.',
    }),
    code({
      id: 'mc-inverse', difficulty: 3,
      prompt: t`Check the inverse-prediction formula by Monte Carlo. Write \`sigma_x_formula(y0, sy0, a, b, C)\` (where \`C\` is the 2×2 covariance matrix of $(a, b)$), and \`sigma_x_mc(y0, sy0, a, b, C, n)\`: draw \`n\` pairs $(a, b)$ from a multivariate normal with that covariance, \`n\` readings from $N(y_0, \sigma_{y_0})$, compute $(y - a)/b$ for each, and return the standard deviation.`,
      starter: t`import numpy as np

a, b = ${LC.a}, ${LC.b}                                  # mV, mV/kN
C = np.array([[${LC.sa ** 2}, ${LC.cov}], [${LC.cov}, ${LC.sb ** 2}]])
y0, sy0 = ${Y0}, ${SY0}                                   # mV

def sigma_x_formula(y0, sy0, a, b, C):
    return 0.0

def sigma_x_mc(y0, sy0, a, b, C, n):
    rng = np.random.default_rng(1)
    return 0.0

print(f"formula: {1000 * sigma_x_formula(y0, sy0, a, b, C):.3f} N")
print(f"Monte Carlo: {1000 * sigma_x_mc(y0, sy0, a, b, C, 200000):.3f} N")`,
      answer: t`import numpy as np

a, b = ${LC.a}, ${LC.b}                                  # mV, mV/kN
C = np.array([[${LC.sa ** 2}, ${LC.cov}], [${LC.cov}, ${LC.sb ** 2}]])
y0, sy0 = ${Y0}, ${SY0}                                   # mV

def sigma_x_formula(y0, sy0, a, b, C):
    x = (y0 - a) / b
    return np.sqrt(sy0**2 + C[0, 0] + x**2 * C[1, 1] + 2 * x * C[0, 1]) / b

def sigma_x_mc(y0, sy0, a, b, C, n):
    rng = np.random.default_rng(1)
    ab = rng.multivariate_normal([a, b], C, size=n)
    y = rng.normal(y0, sy0, size=n)
    return np.std((y - ab[:, 0]) / ab[:, 1])

print(f"formula: {1000 * sigma_x_formula(y0, sy0, a, b, C):.3f} N")
print(f"Monte Carlo: {1000 * sigma_x_mc(y0, sy0, a, b, C, 200000):.3f} N")`,
      tests: [
        { name: t`the formula gives $${(1000 * SX).toFixed(3)}$ N for the load cell`, code: `abs(sigma_x_formula(y0, sy0, a, b, C) - ${SX}) < 1e-9` },
        { name: 'the Monte Carlo agrees with the formula to about 1%', code: 'abs(sigma_x_mc(y0, sy0, a, b, C, 200000) / sigma_x_formula(y0, sy0, a, b, C) - 1) < 0.02' },
        { name: 'the covariance matters: setting it to zero changes the formula', code: 'abs(sigma_x_formula(y0, sy0, a, b, np.diag(np.diag(C))) - sigma_x_formula(y0, sy0, a, b, C)) > 1e-5' },
      ],
      hints: [t`Formula: \`x = (y0 - a) / b\`, then \`np.sqrt(sy0**2 + C[0,0] + x**2 * C[1,1] + 2 * x * C[0,1]) / b\`.`, t`Monte Carlo: \`ab = rng.multivariate_normal([a, b], C, size=n)\`, \`y = rng.normal(y0, sy0, size=n)\`, then \`np.std((y - ab[:, 0]) / ab[:, 1])\`.`],
      teach: 'Monte Carlo propagation (JCGM 101:2008) checks a linearized formula by brute force — and needs the covariance too, as a correlated draw.',
      explain: t`Both give about $${(1000 * SX).toFixed(2)}$ N. The formula linearizes $(y - a)/b$; with a 0.06% uncertainty in $b$ that is excellent. Monte Carlo earns its keep when uncertainties are large or the function strongly curved ([Monte Carlo propagation](#/lesson/lab.A3.3)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thermo', difficulty: 3, transfer: true,
      gen(r) {
        const z = normals(r.int(1, 999999));
        const Ts = [0, 25, 50, 75, 100], S = 41.0 + r.float(-0.8, 0.8, 0.1), off = r.float(-3, 3, 0.1), sv = 1.0;
        const V = Ts.map((T) => +(off + S * T + sv * z()).toFixed(1));
        const f = linfit(Ts, V, sv);
        const y0 = r.int(1200, 3800), xh = (y0 - f.a) / f.b;
        const ans = Math.sqrt(sv ** 2 + f.sa ** 2 + xh * xh * f.sb ** 2 + 2 * xh * f.cov) / f.b;
        return {
          prompt: t`A type K thermocouple for a liquid-oxygen line’s purge-gas heater is calibrated against a reference thermometer, each voltage read to $\pm 1.0$ µV:

${table([[t`T\ (^\circ\text{C})`, ...Ts.map(String)], [t`V\ (\mu\text{V})`, ...V.map((v) => v.toFixed(1))]])}

In use it reads $${y0}$ µV ($\pm 1.0$ µV). Fit the calibration (known $\sigma$) and give the standard uncertainty of the inferred temperature, from the reading and the fit.`,
          visual: { type: 'graph', params: dataGraph({ xs: Ts, ys: V, sy: sv, fit: f, xlabel: 'T (°C)', ylabel: 'V (µV)', hlines: [{ y: y0, label: 'reading', color: 'accent' }] }), caption: 'The five calibration points (error bars far smaller than the dots) and the in-use reading. Synthetic data; a real type K thermocouple is only approximately linear over 0–100 °C.' },
          answer: ans, units: 'K', difference: true, tol: { rel: 0.02 },
          errors: [{ value: sv / f.b, feedback: 'That is only the reading’s share. Add the fit’s σa, σb and their covariance.' }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`Fit with $\sigma = 1.0$ µV: $\sigma_a^2 = S_{xx}/\Delta$, $\sigma_b^2 = S/\Delta$, $\operatorname{cov} = -S_x/\Delta$.`, t`$\hat T = (y_0 - a)/b$, then $\sigma_{\hat T}^2 = [\sigma_{y_0}^2 + \sigma_a^2 + \hat T^2\sigma_b^2 + 2\hat T\operatorname{cov}]/b^2$.`],
          teach: 'Inverse prediction with the fit’s covariance, end to end.',
          explain: t`$a = ${f.a.toFixed(2)}$ µV, $b = ${f.b.toFixed(3)}$ µV/K, $\hat T = ${xh.toFixed(2)}$ °C, $\sigma_{\hat T} = ${ans.toFixed(4)}$ K. The reference thermometer’s own uncertainty and the thermocouple’s nonlinearity are systematic terms you would add next.`,
        };
      },
    }),
    mcq({
      id: 'cp-detect', difficulty: 2,
      prompt: 'Which procedure can reveal a systematic error that repeating the same measurement never will?',
      visual: (() => { const d = B.makeData('coil', { seed: 9, sys: 'background' }); const { E, P } = B.experiment('coil'); const bx = E.axes.BI.expect(P).b; const xs = d.rows.map((q) => q.s), dev = d.rows.map((q) => r6(q.R[0] - bx * q.s)); return { type: 'graph', params: resGraph({ xs, res: dev, sy: 0.003, xlabel: 'coil current I (A)', ylabel: 'B − coil’s field (mT)', y: [-0.06, 0.06] }), caption: t`Hall-probe readings minus the coil’s calculated field, at forward and reversed currents: the same $+0.04$ mT either way. A field that does not reverse with the coil’s cannot be the coil’s. ${SIMNOTE}` }; })(),
      choices: ['Changing something that should not matter — reverse the current, swap instruments, measure a known standard — and seeing whether the result changes', 'Taking ten times as many readings', 'Reporting more significant figures', 'Rejecting the readings furthest from the mean'],
      answer: 0,
      why: { 1: 'More readings shrink random error only; the mean converges confidently to the wrong value.', 2: 'Digits are not accuracy.', 3: 'A systematic error moves every reading together; trimming the extremes cannot find it.' },
      hints: ['A systematic error is identical in every repeat. What must you change for it to show itself?'],
      teach: 'Systematic errors are found by varying the method — reversal, swaps, standards, independent techniques — never by repetition.',
      explain: t`Repetition samples only the random part. To expose a systematic one, change something the true value should not depend on: reverse a current or a field, swap two sensors, re-zero in place, measure a certified standard, or compare with an independent method.`,
    }),
  ],
  sources: [
    { label: 'JCGM 100:2008 (GUM), §3.2.3–3.2.4 (systematic effects and corrections) and Annex H.3 (thermometer calibration)', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
    { label: 'JCGM 101:2008 (GUM Supplement 1): propagation of distributions by Monte Carlo', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf' },
    { label: 'NIST/SEMATECH e-Handbook of Statistical Methods, §2.3 (calibration)', url: 'https://www.itl.nist.gov/div898/handbook/mpc/section3/mpc3.htm' },
  ],
});
