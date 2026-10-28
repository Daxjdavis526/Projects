// Type A and Type B uncertainty (the GUM) — every input of the measurement
// gets a standard uncertainty, evaluated statistically from repeats (Type A)
// or by other means (Type B: specifications as rectangular limits a/√3,
// triangular a/√6, certificates U/k); independent contributions combine in
// quadrature; a coverage factor turns u_c into an expanded uncertainty.
// Worked through a caliper measurement's budget; a resistor's tolerance, a
// balance certificate, a small-N coverage factor and a test-stand
// thermocouple as the transfer.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { M, sf, stat, budget, normalPic, SRC } from './_unc.js';

const t = String.raw;

// the worked example: six caliper readings of a rod (resolution 0.01 mm, maximum permissible error ±0.02 mm)
const EX = (() => {
  const xs = M.instrumentReadings({ truth: 75.432, sd: 0.012, res: 0.01, n: 6, seed: 8 });
  const st = M.stats(xs);
  const uA = st.sem, uMPE = 0.02 / Math.sqrt(3), uRes = 0.005 / Math.sqrt(3);
  const uc = Math.hypot(uA, uMPE, uRes);
  return { xs, st, uA, uMPE, uRes, uc, U: 2 * uc };
})();

const shapes = (a = 1) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [-1.4 * a, 1.4 * a], y: [0, +(1.15 / a).toFixed(3)], xlabel: 'error (in units of the half-width a)', ylabel: 'density', xticks: 8, yticks: 4, axesAt: 'edge',
    curves: [
      { fn: `step(${a} - abs(x))/(2*${a})`, color: 'accent', width: 2.2, label: 'rectangular: u = a/√3', labelAt: -0.95 * a, labelDy: -12 },
      { fn: `max(${a} - abs(x), 0)/${a * a}`, color: 'violet', width: 2.2, label: 'triangular: u = a/√6', labelAt: 0.15 * a, labelDy: -8 },
    ],
  },
});

export default lesson({
  id: 'lab.A1.2',
  title: 'Type A and Type B uncertainty (the GUM)',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`The *Guide to the Expression of Uncertainty in Measurement* (JCGM 100:2008, the GUM) gives every input of a measurement a **standard uncertainty** $u$ — a standard deviation — however it was found. A **Type A** evaluation finds it statistically, from repeated readings: $u = s/\sqrt N$. A **Type B** evaluation finds it by any other means: a specification, a certificate, a resolution, a handbook value. Independent contributions then combine in quadrature, and a coverage factor stretches the result to a wider interval:

$$u_c = \sqrt{u_1^2 + u_2^2 + \cdots}, \qquad U = k\,u_c$$

The labels say how a number was **evaluated**, not what caused it: “Type A” is not “random” and “Type B” is not “systematic”.`,
  symbols: [
    { tex: 'u_i', text: 'the standard uncertainty of one contribution, in the measurand’s unit: $s/\\sqrt N$ for Type A; for Type B, $a/\\sqrt 3$ for limits $\\pm a$ with every value equally likely (rectangular), $a/\\sqrt 6$ for a triangular distribution, or $U/k$ from a certificate' },
    { tex: 'u_c', text: 'the **combined standard uncertainty**: all the $u_i$ added in quadrature, which assumes they are independent' },
    { tex: 'k', text: 'the coverage factor: $k = 2$ gives an interval of about 95% for a roughly normal result with many degrees of freedom' },
    { tex: 'U', text: 'the **expanded uncertainty** $k u_c$, quoted with its $k$: “$U = 0.026$ mm ($k = 2$)”' },
  ],
  why: 'An uncertainty budget — every contribution evaluated, typed and combined — is how every calibration lab, test stand and precision experiment states what its numbers are worth.',
  visual: {
    type: 'labx-stats',
    title: 'What “one standard uncertainty” covers',
    lead: t`Ten thousand draws from a rectangular, triangular or normal distribution, with $\pm k\sigma$ shaded. For limits $\pm a$ with no reason to prefer any value, the GUM takes a **rectangular** distribution, whose standard deviation is $a/\sqrt3$.`,
    tasks: [
      'With the rectangular shape and k = 1, read the coverage: about 58%, not the 68% of a normal distribution.',
      'Switch to triangular: values near the centre are likelier, so the same half-width gives a smaller σ, a/√6.',
      'Set k to √3 ≈ 1.73 with the rectangular shape: the band reaches the limits ±a and covers 100%.',
    ],
    params: { mode: 'hist', dist: 'uniform', a: 1, n: 10000, band: 1, controls: ['dist', 'a', 'band'], seed: 4 },
  },
  example: {
    prompt: t`A rod is measured six times with a digital caliper (resolution 0.01 mm; maximum permissible error ±0.02 mm): ${EX.xs.map((x) => x.toFixed(2)).join(', ')} mm. Build the uncertainty budget and report the length with an expanded uncertainty at $k = 2$.`,
    visual: budget([{ label: 'Type A: scatter of the six readings', u: EX.uA }, { label: 'Type B: caliper error limits ±0.02 mm', u: EX.uMPE }, { label: 'Type B: resolution, ±0.005 mm', u: EX.uRes }], { unit: 'mm', caption: 'The budget drawn to scale. The caliper’s error limits, not the scatter, dominate.' }),
    steps: [
      { label: 'Type A', text: t`The mean is $${EX.st.mean.toFixed(4)}$ mm and $s = ${EX.st.sd.toFixed(4)}$ mm, so $u_A = s/\sqrt 6 = ${EX.uA.toFixed(4)}$ mm.` },
      { label: 'Type B: the specification', text: t`The maker promises the error is within $\pm 0.02$ mm and says nothing about where. Every value in that range equally likely is a rectangular distribution: $u = 0.02/\sqrt 3 = ${EX.uMPE.toFixed(4)}$ mm.` },
      { label: 'Type B: resolution', text: t`Rounding to 0.01 mm leaves an error within $\pm 0.005$ mm: $u = 0.005/\sqrt 3 = ${EX.uRes.toFixed(4)}$ mm. It is small, and partly covered by the specification already — including it is the cautious choice.` },
      { label: 'Combine', text: t`The three are independent: $u_c = \sqrt{${EX.uA.toFixed(4)}^2 + ${EX.uMPE.toFixed(4)}^2 + ${EX.uRes.toFixed(4)}^2} = ${EX.uc.toFixed(4)}$ mm.` },
      { label: 'Expand', text: t`$U = 2 u_c = ${EX.U.toFixed(3)}$ mm. Round $U$ to two figures and the value to the same decimal place.` },
      { label: 'Sense check', text: t`The specification term is ${(EX.uMPE / EX.uA).toFixed(1)} times the Type A term, so measuring the rod a hundred times would barely help: $u_c$ could never fall below $${EX.uMPE.toFixed(4)}$ mm with this caliper.` },
    ],
    answer: t`$L = ${EX.st.mean.toFixed(3)}$ mm, $U = ${EX.U.toFixed(3)}$ mm ($k = 2$, about 95% coverage).`,
  },
  practice: [
    multi({
      id: 'which-B', difficulty: 1,
      prompt: 'Which of these standard uncertainties come from a Type B evaluation? Choose all that apply.',
      visual: budget([{ label: 'scatter of 10 repeat readings', u: 0.8 }, { label: 'calibration certificate', u: 1.1 }, { label: 'display resolution', u: 0.3 }, { label: 'handbook value of α', u: 0.5 }], { combined: false, caption: 'A typical budget: some terms from repeated readings, most from other information.' }),
      choices: [
        'A calibration certificate’s stated uncertainty',
        'A manufacturer’s accuracy specification',
        'The display’s resolution',
        'A thermal expansion coefficient taken from a handbook',
        'The standard error of the mean of ten repeat readings',
        'The scatter of a fit’s residuals',
      ],
      answer: [0, 1, 2, 3],
      why: {
        4: 'Ten repeat readings analysed statistically: that is exactly what Type A means.',
        5: 'Residual scatter is a statistical analysis of a series of observations, so it is Type A too.',
      },
      hints: ['Type A: from the statistics of your own repeated observations. Type B: from anything else.'],
      teach: 'Type A is evaluated from the statistics of repeated observations; everything else — specifications, certificates, resolution, handbooks — is Type B.',
      explain: 'The type names the method of evaluation. A certificate’s uncertainty was Type A for the calibration lab that measured it, but for you it is information taken on trust: Type B.',
    }),
    num({
      id: 'resistor-tol', difficulty: 2,
      gen(r) {
        const [R, tol] = r.pick([[4700, 1], [1000, 5], [2200, 1], [10000, 0.1], [330, 5], [15000, 1]]);
        const a = (R * tol) / 100, u = a / Math.sqrt(3);
        return {
          prompt: t`A resistor is marked ${R >= 1000 ? `${R / 1000} kΩ` : `${R} Ω`} ±${tol}%. With no other information, what standard uncertainty does the GUM assign its value, in ohms?`,
          visual: { ...shapes(1), caption: t`Limits $\pm a$: rectangular (every value equally likely) or triangular (values near the centre likelier).` },
          answer: u, units: 'Ω', tol: { rel: 0.01 },
          errors: [
            { value: a, feedback: t`That is the half-width $a$ of the tolerance — the largest error, not its standard deviation. Divide by $\sqrt 3$.` },
            { value: a / Math.sqrt(6), feedback: t`$a/\sqrt 6$ is for a triangular distribution. With only limits and no reason to prefer the centre, use the rectangular $a/\sqrt 3$.` },
            { value: a / 2, feedback: t`Treating the limits as $\pm 2\sigma$ assumes a normal distribution the marking does not claim. Use $a/\sqrt 3$.` },
          ],
          hints: [t`The half-width is $a = ${tol}\% \times ${R}\ \Omega$.`, t`Rectangular distribution: $u = a/\sqrt 3$.`],
          teach: 'Limits ±a with no further information become a rectangular distribution with standard uncertainty a/√3.',
          explain: t`$a = ${sf(a, 3)}\ \Omega$, so $u = ${sf(a, 3)}/\sqrt3 = ${sf(u, 3)}\ \Omega$.`,
        };
      },
    }),
    num({
      id: 'certificate', difficulty: 2,
      gen(r) {
        const [what, U, unit, k] = r.pick([['a 100 g mass standard', 0.16, 'mg', 2], ['a 10 V reference', 1.2, 'μV', 2], ['a gauge block', 0.06, 'μm', 2], ['a platinum thermometer', 0.03, 'K', 2.5]]);
        const u = U / k;
        return {
          prompt: t`The calibration certificate of ${what} states an expanded uncertainty $U = ${U}$ ${unit} with coverage factor $k = ${k}$. What standard uncertainty goes into your budget, in ${unit}?`,
          visual: normalPic({ k, caption: t`A certificate’s $U$ spans $\pm k$ standard uncertainties of a normal distribution (shaded).` }),
          answer: u, units: unit, tol: { rel: 0.01 },
          errors: [
            { value: U, feedback: t`$U$ is already expanded. Divide by the stated $k$ to get back to one standard uncertainty.` },
            { value: U / Math.sqrt(3), feedback: t`A certificate states a coverage factor, so its distribution is not rectangular: divide by $k = ${k}$.` },
          ],
          hints: [t`$u = U/k$.`],
          teach: 'A certificate’s expanded uncertainty is divided by its stated coverage factor to give a standard uncertainty.',
          explain: t`$u = ${U}/${k} = ${sf(u, 3)}$ ${unit}. Mixing an expanded $U$ into a budget of standard uncertainties would count that term ${k} times too heavily.`,
        };
      },
    }),
    num({
      id: 'combine', difficulty: 2,
      gen(r) {
        const n = r.pick([5, 8, 10]), s = r.int(12, 40) / 10, a = r.int(10, 40) / 10;
        const uA = s / Math.sqrt(n), uB = a / Math.sqrt(3), uc = Math.hypot(uA, uB);
        return {
          prompt: t`${n} repeat readings of a flow rate scatter with $s = ${s.toFixed(1)}$ g/s. The flowmeter’s specification limits its error to $\pm ${a.toFixed(1)}$ g/s. What is the combined standard uncertainty of the mean, in g/s?`,
          visual: budget([{ label: 'Type A: s/√N', u: uA }, { label: 'Type B: a/√3', u: uB }], { combined: false, unit: 'g/s', caption: 'The two contributions to scale; combine them.' }),
          answer: uc, units: 'g/s', tol: { rel: 0.01 },
          errors: [
            { value: uA + uB, feedback: 'Independent uncertainties add in quadrature, not linearly.' },
            { value: Math.hypot(s, uB), feedback: t`The mean is uncertain by $s/\sqrt N$, not by $s$.` },
            { value: Math.hypot(uA, a), feedback: t`Convert the limit to a standard uncertainty first: $a/\sqrt 3$.` },
          ],
          hints: [t`$u_A = ${s.toFixed(1)}/\sqrt{${n}}$ and $u_B = ${a.toFixed(1)}/\sqrt3$.`, t`$u_c = \sqrt{u_A^2 + u_B^2}$.`],
          teach: 'Turn every contribution into a standard uncertainty first, then add them in quadrature.',
          explain: t`$u_A = ${uA.toFixed(3)}$, $u_B = ${uB.toFixed(3)}$, so $u_c = \sqrt{${uA.toFixed(3)}^2 + ${uB.toFixed(3)}^2} = ${uc.toFixed(3)}$ g/s.`,
        };
      },
    }),
    mcq({
      id: 'triangular', difficulty: 2,
      prompt: t`You read a needle that sits between two marks 0.2 V apart. You are confident it is within $\pm 0.1$ V of where you judge it, and much more likely near your judgement than at the edges. Which standard uncertainty fits best?`,
      visual: { ...shapes(0.1), caption: 'Rectangular and triangular distributions with the same limits ±0.1 V.' },
      choices: [t`$0.1/\sqrt 6 \approx 0.041$ V (triangular)`, t`$0.1/\sqrt 3 \approx 0.058$ V (rectangular)`, '0.1 V (the half-width)', '0.2 V (the mark spacing)'],
      answer: 0,
      why: {
        1: 'Rectangular says every value up to the limits is equally likely — but you said values near your judgement are likelier.',
        2: 'The half-width is the largest plausible error, not the standard deviation.',
        3: 'The mark spacing is twice the half-width, and still a limit rather than a standard deviation.',
      },
      hints: ['Which shape puts more probability near the centre than at the limits?'],
      teach: 'When values near the centre of the limits are likelier, the GUM’s triangular distribution gives u = a/√6.',
      explain: t`A triangular distribution of half-width $a$ has standard deviation $a/\sqrt6$: $0.1/2.449 = 0.041$ V. It is smaller than the rectangular $a/\sqrt3$ because it weights the centre.`,
    }),
    code({
      id: 'budget-code', difficulty: 2,
      prompt: t`Write the budget in NumPy. Given the readings and the meter’s limits \`a\`, set \`u_A\` ($s/\sqrt N$ with \`ddof=1\`), \`u_B\` ($a/\sqrt3$), \`u_c\` (quadrature) and \`U\` ($k = 2$), and print \`U\`.`,
      starter: t`import numpy as np

x = np.array([12.47, 12.52, 12.44, 12.50, 12.49, 12.53, 12.46, 12.51])   # readings, V
a = 0.06                                                                  # meter limits ±a, V

u_A = 0
u_B = 0
u_c = 0
U = 0
print(U)
`,
      answer: t`import numpy as np

x = np.array([12.47, 12.52, 12.44, 12.50, 12.49, 12.53, 12.46, 12.51])   # readings, V
a = 0.06                                                                  # meter limits ±a, V

u_A = np.std(x, ddof=1) / np.sqrt(len(x))
u_B = a / np.sqrt(3)
u_c = np.sqrt(u_A**2 + u_B**2)
U = 2 * u_c
print(U)`,
      tests: [
        { name: '`u_A` uses the sample standard deviation (`ddof=1`)', code: 'abs(u_A - np.std(x, ddof=1)/np.sqrt(8)) < 1e-12' },
        { name: '`u_B` is a/√3', code: 'abs(u_B - 0.06/np.sqrt(3)) < 1e-12' },
        { name: '`u_c` adds them in quadrature', code: 'abs(u_c - np.hypot(np.std(x, ddof=1)/np.sqrt(8), 0.06/np.sqrt(3))) < 1e-12' },
        { name: '`U` is 2 × `u_c`', code: 'abs(U - 2*u_c) < 1e-12 and U > 0' },
        { name: 'the program prints U', code: 'abs(float(_stdout.split()[-1]) - U) < 1e-9' },
      ],
      hints: ['`np.std(x, ddof=1)` is the sample standard deviation; plain `np.std(x)` divides by N.', 'Then `u_c = np.sqrt(u_A**2 + u_B**2)` and `U = 2 * u_c`.'],
      teach: 'A budget in code is four lines: Type A from the data, Type B from the limits, quadrature, coverage factor.',
      explain: t`\`u_A\` ≈ 0.011 V and \`u_B\` ≈ 0.035 V, so \`u_c\` ≈ 0.036 V and \`U\` ≈ 0.073 V. Forgetting \`ddof=1\` would shrink \`u_A\` by $\sqrt{7/8}$ — small here, large for three readings.`,
    }),
    num({
      id: 'small-n-k', difficulty: 3,
      gen(r) {
        const n = r.pick([4, 5, 6]), uc = r.int(20, 60) / 1000;
        const kt = M.tQuantile(0.95, n - 1);
        return {
          prompt: t`A result’s uncertainty comes almost entirely from the scatter of just ${n} readings: $u_c = ${uc.toFixed(3)}$ mm, with $\nu = ${n - 1}$ degrees of freedom. Following the GUM (Annex G), use Student’s $t$ for 95% coverage instead of $k = 2$. What is $U$, in mm?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-5, 5], y: [0, 0.45], xlabel: 't', ylabel: 'density', xticks: 10, yticks: 4, axesAt: 'edge', curves: [{ fn: 'e^(-x^2/2)/sqrt(2pi)', color: 'ink3', dash: [5, 4], label: 'normal', labelAt: 0.4, labelDy: -6 }, { fn: `gamma(${n / 2})/(sqrt(${n - 1}*pi)*gamma(${(n - 1) / 2}))*(1 + x^2/${n - 1})^(-${n / 2})`, color: 'accent', label: `Student t, ν = ${n - 1}`, labelAt: 2.2, labelDy: -10 }] }, caption: 'With few readings, s itself is uncertain, and the t distribution’s heavier tails need a wider interval for the same coverage.' },
          answer: kt * uc, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: 2 * uc, feedback: t`$k = 2$ assumes many degrees of freedom. With $\nu = ${n - 1}$ the 95% point of Student’s $t$ is $${kt.toFixed(2)}$.` }],
          hints: [t`The two-sided 95% point of Student’s $t$ with $\nu = ${n - 1}$ is $t = ${kt.toFixed(3)}$.`, t`$U = t\,u_c$.`],
          teach: t`When $u_c$ rests on only a few readings, the coverage factor for 95% comes from Student’s $t$, not 2.`,
          explain: t`$U = ${kt.toFixed(3)} \times ${uc.toFixed(3)} = ${(kt * uc).toFixed(4)}$ mm, ${((kt / 2 - 1) * 100).toFixed(0)}% wider than with $k = 2$. The few readings leave $s$ itself poorly known.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thermocouple', difficulty: 2, transfer: true,
      gen(r) {
        const n = r.pick([8, 10, 12]), s = r.int(20, 50) / 100, tol = r.pick([1.0, 1.5, 2.2]);
        const uA = s / Math.sqrt(n), uB = tol / Math.sqrt(3), uc = Math.hypot(uA, uB);
        return {
          prompt: t`On a rocket-engine test stand, a thermocouple at the turbopump inlet gives ${n} readings during a steady run with standard deviation ${s.toFixed(2)} K. Its manufacturer’s tolerance is $\pm${tol}$ K. What is the expanded uncertainty ($k = 2$) of the mean temperature, in K?`,
          visual: budget([{ label: 'Type A: run scatter', u: uA }, { label: 'Type B: tolerance', u: uB }], { combined: false, unit: 'K', caption: 'The two contributions to scale.' }),
          answer: 2 * uc, units: 'K', difference: true, tol: { rel: 0.015 },
          errors: [
            { value: uc, feedback: 'That is the combined standard uncertainty; the expanded one is k = 2 times it.' },
            { value: 2 * Math.hypot(uA, tol), feedback: t`Turn the tolerance into a standard uncertainty first: $${tol}/\sqrt3$.` },
            { value: 2 * (uA + uB), feedback: 'Add the two in quadrature, not linearly.' },
          ],
          hints: [t`$u_A = ${s.toFixed(2)}/\sqrt{${n}}$; $u_B = ${tol}/\sqrt3$.`, t`$U = 2\sqrt{u_A^2 + u_B^2}$.`],
          teach: 'Evaluate each contribution as a standard uncertainty, combine in quadrature, then expand.',
          explain: t`$u_A = ${uA.toFixed(3)}$ K, $u_B = ${uB.toFixed(3)}$ K, $u_c = ${uc.toFixed(3)}$ K, $U = ${(2 * uc).toFixed(2)}$ K. The tolerance dominates: a better-calibrated sensor, not a longer run, would shrink it.`,
        };
      },
    }),
    mcq({
      id: 'cp-dominant', difficulty: 2,
      prompt: 'Your budget is drawn below. Which change would shrink the combined uncertainty most?',
      visual: budget([{ label: 'Type A: 6 repeat readings', u: 0.9 }, { label: 'Type B: meter specification', u: 3.1 }, { label: 'Type B: cable resistance', u: 0.7 }], { caption: 'An uncertainty budget to scale, with the combined value last.' }),
      choices: ['A meter with a tighter specification (or a calibration of this one)', 'Taking 60 readings instead of 6', 'Shorter cables', 'Quoting more digits of the mean'],
      answer: 0,
      why: {
        1: 'That cuts the Type A term from 0.9 to about 0.28 — but the total barely moves, from 3.3 to 3.2, because 3.1 dominates.',
        2: 'Removing the 0.7 term entirely changes the total from 3.3 to 3.2.',
        3: 'Digits change the report, not the measurement.',
      },
      hints: ['In quadrature, which term does the total follow?'],
      teach: 'In a quadrature sum the largest term dominates, so effort belongs on the biggest contribution.',
      explain: t`$\sqrt{0.9^2 + 3.1^2 + 0.7^2} = 3.3$; without the specification term it would be $\sqrt{0.9^2 + 0.7^2} = 1.1$. Halving the largest term does more than eliminating the others.`,
    }),
    num({
      id: 'cp-coverage', difficulty: 3,
      prompt: t`A quantity is known only to lie within $\pm a$, every value equally likely. What fraction of the possible values lies within one standard uncertainty $u = a/\sqrt3$ of the centre? Give a percentage.`,
      visual: stat('hist', { dist: 'uniform', a: 1, n: 10000, seed: 2, stats: false }, 'Ten thousand draws from a rectangular distribution of half-width a = 1.'),
      answer: 100 / Math.sqrt(3), units: '%', tol: { rel: 0.005 },
      errors: [{ value: 68.27, feedback: 'That is the normal distribution’s ±1σ coverage. A rectangular one is flat, so the fraction is simply the band’s width over the whole width.' }],
      hints: ['The band ±u has width 2a/√3; the whole distribution has width 2a.', 'For a flat distribution, coverage = (band width)/(total width).'],
      teach: 'Coverage of ±1 standard uncertainty depends on the distribution: 68% for normal, 58% for rectangular.',
      explain: t`$\dfrac{2a/\sqrt3}{2a} = \dfrac{1}{\sqrt3} = 57.7\%$. This is why $k$ only means a definite confidence level once the shape of the distribution is known.`,
    }),
  ],
  sources: [SRC.gum, SRC.nist, SRC.taylor('ch. 3–4')],
});
