// Lab 5 of PHYS 2225 (virtual): Faraday induction, with a search coil inside
// a solenoid driven by an alternating current. The peak EMF against ωI₀ is a
// straight line whose slope is the mutual inductance M = μ₀nN₂A; the EMF is
// a quarter cycle out of step with the current (it follows dI/dt); Lenz's
// law sets its sign. The systematic: the current falls as the frequency rises (the
// solenoid's own reactance), so assuming it stays at its low-frequency value
// bends the line and drags M low; a tilted search coil lowers M silently.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart } from './_lab2225.js';

const t = String.raw;
const P0 = B.EXPERIMENTS.induction.defaults;
const MU0 = B.MU0, M0 = 1e6 * B.mutualM(P0);           // µH
const LS = B.solL(P0);

// the worked example: a clean run, current read at every frequency (seed 17)
const EX = (() => {
  const rows = B.makeData('induction', { seed: 17 }).rows;
  const an = B.analyse('induction', rows), f = an.series[0].fit, q = an.results[0];
  const last = rows[rows.length - 1], nominal = B.analyse('induction', rows, { sys: 'nominal' }).results[0];
  return { rows, f, q, last, nominal, Mlast: last.R[0] / (2 * Math.PI * 1000 * 0.5) * 1e3 };
})();

/** I(t) and the EMF −M dI/dt it induces, as a graph over two periods (time in units of the period). */
function traces({ emf = true, marks = [], caption, ampE = 0.8, names = ['current I', 'EMF'] } = {}) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, 2], y: [-1.35, 1.35], xlabel: 'time (periods)', ylabel: ' ', yticks: 0.001,
      curves: [
        { fn: 'sin(2*pi*x)', color: 'accent', width: 2.4, label: names[0], labelAt: 0.27, labelDy: -14 },
        ...(emf ? [{ fn: `${ampE}*cos(2*pi*x)`, color: 'violet', width: 2.4, dash: true, label: names[1], labelAt: 1.06, labelDy: -12 }] : []),
      ],
      hlines: [{ y: 0, color: 'ink4' }], points: marks,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.L.5',
  title: 'Induction',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A small search coil of $N_2$ turns sits at the centre of a long solenoid. An amplifier drives an alternating current $I = I_0\sin\omega t$ through the solenoid, so the field inside, $B = \mu_0 n I$, changes all the time — and so does the flux through the search coil. A scope shows the search coil’s EMF and the current. The bench computes each reading with realistic noise.

**Faraday’s law**: a changing flux induces an EMF, with a sign (Lenz’s law) that opposes the change:

$$\mathcal{E} = -N_2\,\frac{d\Phi_B}{dt} = -M\,\frac{dI}{dt}, \qquad M = \mu_0 n N_2 A$$

The current’s rate of change peaks at $\omega I_0$, so the peak EMF is $\mathcal{E}_0 = M\,\omega I_0$: plot $\mathcal{E}_0$ against $\omega I_0$ and the slope is the **mutual inductance** $M$. (Lab skills trained: measuring what a formula assumes, rather than assuming it, and reading curvature in residuals.)`,
  symbols: [
    { tex: '\\mathcal{E}', text: 'the EMF induced in the search coil, in volts; $\\mathcal{E}_0$ is its peak value' },
    { tex: '\\Phi_B', text: 'the magnetic flux through one turn of the search coil, $BA$, in webers (T·m²)' },
    { tex: 'N_2', text: 'the search coil’s number of turns: 100' },
    { tex: 'M', text: 'the mutual inductance, in henries (V·s/A): the EMF per unit rate of change of current' },
    { tex: 'I,\\ I_0', text: 'the solenoid’s current and its peak value, in A' },
    { tex: '\\omega', text: 'the angular frequency $2\\pi f$, in rad/s; $f$ is the drive frequency in Hz' },
    { tex: 'n', text: 'the solenoid’s turns per metre: 1000' },
    { tex: 'A', text: 'the search coil’s area, $\\pi d^2/4$ with $d = 2.00$ cm' },
  ],
  why: 'Transformers, electric generators, wireless chargers and the search-coil magnetometers that spacecraft fly to measure waves in space all run on ℰ = −N dΦ/dt.',
  visual: {
    type: 'lab-bench',
    title: 'Drive the solenoid, watch the search coil',
    lead: t`Seven frequencies from 100 Hz to 1 kHz are in the table, with the peak EMF $\mathcal{E}_0$ and the peak current $I_0$ read off the scope. The plot shows $\mathcal{E}_0$ against $\omega I_0$ with the least-squares line; the readout gives $M$ = slope and compares it with $\mu_0 n N_2 A$.`,
    tasks: [
      'ℰ₀ against ωI₀ is a straight line through the origin: its slope, about 39.5 µH, is the mutual inductance — the prediction μ₀nN₂A.',
      'Read the current column: it falls from about 500 mA to 437 mA as the frequency rises, because the solenoid’s own inductance resists faster changes. Turn on the systematic (assume 500 mA throughout): the points bend over, the residuals arch and M drops by 10%.',
      'Watch the scope as you change the frequency: the EMF (violet) peaks when the current crosses zero — where it changes fastest — and it grows with f.',
    ],
    params: { exp: 'induction', seed: 20, residuals: true },
  },
  example: {
    prompt: t`Seven frequencies give the peak EMFs and currents in the table. A weighted fit of $\mathcal{E}_0$ against $\omega I_0$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\mu\text{H}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{mV}`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. The scope’s calibration is good to 1%. Find $M$ with its uncertainty and compare it with $\mu_0 n N_2 A$.`,
    visual: plot('induction', EX.rows, { table: true, residuals: true, expected: true, caption: 'ℰ₀ against ωI₀ with ±1σ error bars, the least-squares line (gold) and, dashed, μ₀nN₂A. Residuals below.' }),
    steps: [
      { label: 'The x values', text: t`For each row $\omega I_0 = 2\pi f I_0$ with the current **measured at that frequency**: at 1000 Hz, $2\pi(1000)(${(EX.last.R[1] / 1000).toFixed(3)}\ \text{A}) = ${(2 * Math.PI * EX.last.R[1] / 1000).toFixed(2)}$ kA/s. A kilo-ampere per second is a fast change, but it lasts only a fraction of a millisecond.` },
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$, residuals without a pattern, intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{mV}`)}$ — consistent with zero: no EMF without a changing current.` },
      { label: 'Mutual inductance', text: t`The slope is $M$: mV per kA/s is µH. $M = ${pmTeX(EX.f.b, EX.f.sb, t`\mu\text{H}`)}$ from the fit; adding the scope’s 1% calibration in quadrature, $M = ${pmTeX(EX.q.value, EX.q.sigma, t`\mu\text{H}`)}$.` },
      { label: 'Predict', text: t`$M = \mu_0 n N_2 A = (1.2566\times10^{-6})(1000\ \text{m}^{-1})(100)\,\pi(0.0100\ \text{m})^2 = ${M0.toFixed(2)}\ \mu\text{H}$. The measurement is ${EX.q.z.toFixed(1)}σ away: agreement.` },
      { label: 'The trap', text: t`The current fell from 500 mA to ${EX.last.R[1]} mA across the range — the solenoid’s inductance, $${(LS * 1e3).toFixed(2)}$ mH, adds a reactance $2\pi fL$ that grows with frequency. Taking $I_0 = 500$ mA at every frequency would give $M = ${EX.nominal.value.toFixed(1)}$ µH, ${(100 * (1 - EX.nominal.value / M0)).toFixed(0)}% low, with a strongly arched residual plot.` },
      { label: 'Sense check', text: t`At 1 kHz the EMF is about 0.1 V from a 0.44 A current: $\mathcal{E}_0 = M\omega I_0 = (39.5\times10^{-6})(6283)(0.437) = 0.108$ V. Faster changes induce more — which is why transformers work at 50–60 Hz but switch-mode supplies at 100 kHz can be tiny.` },
    ],
    answer: t`$M = ${pmTeX(EX.q.value, EX.q.sigma, t`\mu\text{H}`)}$, agreeing with $\mu_0 n N_2 A = ${M0.toFixed(2)}$ µH — as long as the current is measured at every frequency.`,
  },
  practice: [
    num({
      id: 'predict-emf', difficulty: 1,
      gen(r) {
        const f = r.pick([200, 300, 600, 800]), I0 = r.pick([0.25, 0.40, 0.48]);
        const e0 = M0 * 1e-6 * 2 * Math.PI * f * I0 * 1e3;
        return {
          prompt: t`The mutual inductance is $${M0.toFixed(1)}\ \mu\text{H}$. Predict the peak EMF when the solenoid carries a ${f} Hz current of peak ${(I0 * 1000).toFixed(0)} mA.`,
          answer: e0, units: 'mV', tol: { rel: 0.005 },
          errors: apart([{ value: e0 / (2 * Math.PI), feedback: t`$\omega = 2\pi f$: the peak rate of change of $I_0\sin\omega t$ is $\omega I_0 = 2\pi f I_0$, not $fI_0$.` }], e0),
          hints: [t`$\mathcal{E}_0 = M\omega I_0$ with $\omega = 2\pi f$.`],
          teach: 'The peak EMF is M times the peak rate of change of the current, ωI₀.',
          explain: t`$\mathcal{E}_0 = (${M0.toFixed(1)}\times10^{-6})(2\pi\times${f})(${I0}) = ${e0.toFixed(1)}$ mV.`,
          visual: apparatus('induction', { at: f }, 'The solenoid, the search coil at its centre and the scope. Not to scale.'),
        };
      },
    }),
    num({
      id: 'M-predict', difficulty: 2,
      gen(r) {
        const N2 = r.pick([50, 150, 200]), dcm = r.pick([1.50, 2.50, 3.00]), n = r.pick([800, 1200, 1500]);
        const M = MU0 * n * N2 * Math.PI * (dcm / 100) ** 2 / 4 * 1e6;
        return {
          prompt: t`A solenoid has ${n} turns per metre. A search coil of ${N2} turns and diameter ${dcm.toFixed(2)} cm sits at its centre, square to the axis. What is their mutual inductance, in µH?`,
          answer: M, units: 'uH', tol: { rel: 0.005 },
          errors: apart([
            { value: M / N2, feedback: t`Each of the ${N2} turns links the same flux: multiply by $N_2$.` },
            { value: M * 4, feedback: t`That uses the diameter as the radius. $A = \pi d^2/4$.` },
          ], M),
          hints: [t`Inside the solenoid $B = \mu_0 n I$, so the flux linkage is $N_2 B A = (\mu_0 n N_2 A)\,I$.`, t`$M = \mu_0 n N_2 \pi d^2/4$.`],
          teach: 'The mutual inductance is the flux linkage per ampere: M = μ₀nN₂A for a coil inside a long solenoid.',
          explain: t`$M = (1.2566\times10^{-6})(${n})(${N2})\,\pi(${(dcm / 200).toFixed(4)})^2 = ${M.toFixed(1)}\ \mu\text{H}$. Only the search coil’s area counts: the field outside it does not thread it.`,
          visual: apparatus('induction', { params: { n, N2, d2: dcm / 100 } }, `A ${N2}-turn search coil inside the solenoid (${n} turns per metre, 0.500 m long). Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'double-f', difficulty: 2,
      prompt: 'You double the drive frequency and adjust the amplifier so that the current’s peak value stays the same. What happens to the peak EMF in the search coil?',
      choices: ['It doubles', 'It stays the same: the peak flux is the same', 'It halves', 'It quadruples'],
      answer: 0,
      why: {
        1: 'The EMF depends on how fast the flux changes, not on how large it is. The same peak flux reached in half the time means twice the rate.',
        2: 'Faster changes induce more EMF, not less.',
        3: t`$\mathcal{E}_0 = M\omega I_0$ is linear in $\omega$, not quadratic.`,
      },
      hints: [t`Faraday’s law involves $d\Phi/dt$. For $I = I_0\sin\omega t$, what is the peak of $dI/dt$?`],
      teach: 'Induced EMF follows the rate of change of flux: at the same amplitude, double the frequency, double the EMF.',
      explain: t`$dI/dt$ peaks at $\omega I_0$; doubling $\omega$ at fixed $I_0$ doubles it, and with it $\mathcal{E}_0 = M\omega I_0$. In the lab the current would also fall unless you turn the amplifier up — which is why it must be measured.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2], y: [-1.35, 1.35], xlabel: 'time (periods of the original drive)', ylabel: ' ', yticks: 0.001, curves: [{ fn: 'sin(2*pi*x)', color: 'accent', width: 2.4, label: 'f', labelAt: 0.22, labelDy: -12 }, { fn: 'sin(4*pi*x)', color: 'violet', width: 2.2, dash: true, label: '2f', labelAt: 0.62, labelDy: 14 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'The solenoid’s current at f (solid) and at 2f (dashed), with the same peak value.' },
    }),
    mcq({
      id: 'phase', difficulty: 2,
      prompt: t`The graph shows the solenoid’s current through two cycles. At which marked moment is the EMF in the search coil largest in size?`,
      choices: ['Q, where the current crosses zero', 'P, where the current is at its peak', 'R, halfway between a peak and a zero crossing', 'At none of them: the EMF is the same at all times'],
      answer: 0,
      why: {
        1: t`At a peak the flux is largest but momentarily not changing: $dI/dt = 0$, so the EMF is zero there.`,
        2: t`There the rate of change is $\cos 45^\circ \approx 0.71$ of its maximum: large, but not the largest.`,
        3: 'The EMF follows the rate of change of the current, which varies through the cycle.',
      },
      hints: [t`$\mathcal{E} = -M\,dI/dt$: where is the current’s graph steepest?`],
      teach: 'The induced EMF tracks the slope of the current, not its value: it peaks at the zero crossings, a quarter cycle from the current’s peaks.',
      explain: 'The current’s graph is steepest where it crosses zero, so dI/dt — and the EMF — is largest there; at the current’s peaks the EMF is zero. On the scope the two traces are a quarter of a cycle out of step (which one comes first depends on how the search coil’s leads are connected).',
      visual: traces({ emf: false, marks: [{ x: 0.25, y: 1, r: 4.5, color: 'gold', label: 'P', labelDy: 12 }, { x: 0.5, y: 0, r: 4.5, color: 'gold', label: 'Q' }, { x: 0.375, y: Math.SQRT1_2, r: 4.5, color: 'gold', label: 'R' }], caption: 'The solenoid’s current through two cycles, with three marked moments.' }),
    }),
    mcq({
      id: 'lenz', difficulty: 2,
      prompt: 'Seen from the right-hand end, the solenoid’s current circulates counterclockwise and is increasing. A closed search coil sits inside, square to the axis. Seen from the same end, which way does the current induced in the search coil circulate?',
      choices: [
        'Clockwise: its own field opposes the increase in the solenoid’s field',
        'Counterclockwise, the same way as the solenoid’s current',
        'Neither way: the solenoid’s field is uniform, so no current is induced',
        'Clockwise while the current increases, and still clockwise when it decreases',
      ],
      answer: 0,
      why: {
        1: 'The induced current does not copy the current that causes it; it opposes the change in flux. Copying would add flux, the change would grow, and energy would come from nowhere.',
        2: 'Uniform is not the same as steady. The field changes in time, so the flux through the coil changes, and that is what induces the EMF.',
        3: 'When the solenoid’s current decreases, the induced current reverses: it now tries to keep the flux from falling.',
      },
      hints: ['Lenz’s law: the induced current makes a field that opposes the change in flux.', 'The solenoid’s field (counterclockwise current, seen from the right) points toward you and is growing.'],
      teach: 'Lenz’s law: the induced current flows so that its own field opposes the change in the flux that causes it.',
      explain: 'Counterclockwise current seen from the right makes a field pointing toward you, out of that end. As it grows, the search coil’s induced current must make a field pointing away from you — clockwise, seen from the same end. The minus sign in Faraday’s law is this opposition.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'square', equal: true, x: [-4, 4], y: [-4, 4], axes: false, grid: false,
          curves: [{ param: ['3*cos(t)', '3*sin(t)'], t: [0, 6.2832], color: 'gold', width: 3 }, { param: ['1.2*cos(t)', '1.2*sin(t)'], t: [0, 6.2832], color: 'violet', width: 2.6 }],
          arrows: [{ from: [0.9, 3], to: [-0.9, 3], label: 'I, increasing', labelDx: -40, labelDy: -14 }, { from: [-0.9, -3], to: [0.9, -3] }],
          points: [{ x: 0, y: 0, r: 0.01, color: 'violet', label: 'search coil: ?', labelDx: -36, labelDy: 0 }],
        },
        caption: 'Looking along the axis from the right-hand end: the solenoid’s winding (gold) with its counterclockwise current, and the search coil inside (violet).',
      },
    }),
    mcq({
      id: 'nominal', difficulty: 3,
      gen(r) {
        const { rows, f, q } = run(r, 'induction', { sys: 'nominal' });
        return {
          prompt: t`A classmate never read the current: they used 500 mA, its value at 100 Hz, at every frequency. Their fit gives $M = ${pmTeX(q.value, q.sigma, t`\mu\text{H}`)}$ with $\chi^2/\text{dof} = ${f.chi2r.toFixed(0)}$, and the residuals arch. What went wrong?`,
          choices: [
            'The current falls as the frequency rises — the solenoid’s inductive reactance 2πfL grows — so 500 mA overstates ωI₀ at high frequency, bending the line and lowering M',
            'Faraday’s law stops holding at high frequencies',
            'The search coil’s resistance grows with frequency, lowering the EMF',
            'The error bars are too small: χ²/dof should simply be rescaled to 1',
          ],
          answer: 0,
          why: {
            1: 'Faraday’s law holds at any frequency; at these frequencies nothing about it changes.',
            2: 'The scope measures the EMF with almost no current flowing in the search coil, so its resistance drops no voltage.',
            3: t`$\chi^2/\text{dof}$ of ${f.chi2r.toFixed(0)}, with a smooth arch, is a wrong model, not a wrong error bar. Rescaling would hide it.`,
          },
          hints: ['Which number in the analysis was assumed rather than measured?', t`A coil’s impedance is $\sqrt{R^2 + (2\pi fL)^2}$: what does that do to the current from a fixed drive voltage?`],
          teach: 'Measure what the formula needs, at every point: an assumed constant that really drifts bends the plot and biases the slope.',
          explain: t`The drive voltage is fixed, but the solenoid’s impedance $\sqrt{R^2 + (2\pi fL)^2}$ rises with frequency, so the current falls about 13% by 1 kHz. Plotting against $2\pi f\times500$ mA stretches the high-frequency points to the right; the line through them is too shallow — $M$ about 10% low — and the residuals arch.`,
          visual: plot('induction', rows, { sys: true, residuals: true, caption: 'ℰ₀ against 2πf × 500 mA (the current assumed, not read), the least-squares line and the residuals.' }),
        };
      },
    }),
    num({
      id: 'tilt', difficulty: 3,
      gen(r) {
        const { rows, q } = run(r, 'induction', { sys: 'tilt' });
        const M = +q.value.toFixed(2), th = (Math.acos(M / M0) * 180) / Math.PI;
        return {
          prompt: t`A careful run, with the current read at every frequency, gives $M = ${M.toFixed(2)}\ \mu\text{H}$ — a clean straight line, $\chi^2/\text{dof}$ near 1 — against the predicted ${M0.toFixed(2)} µH. If the search coil is tilted, so that its axis is not along the solenoid’s, what tilt angle explains the shortfall?`,
          answer: th, units: '°', tol: { rel: 0.02, abs: 0.4 },
          errors: [{ value: (Math.asin(M / M0) * 180) / Math.PI, feedback: t`The flux through a tilted loop is $BA\cos\theta$, with $\theta$ between the field and the loop’s *axis*: use the arccosine.` }],
          hints: [t`Only the field component along the coil’s axis threads it: $\Phi = BA\cos\theta$, so $M_{\text{measured}} = M\cos\theta$.`, t`$\cos\theta = ${M.toFixed(2)}/${M0.toFixed(2)}$.`],
          teach: 'A tilted coil links only BA cos θ of the flux: every EMF, and the measured M, shrinks by cos θ.',
          explain: t`$\cos\theta = ${M.toFixed(2)}/${M0.toFixed(2)} = ${(M / M0).toFixed(3)}$, so $\theta = ${th.toFixed(0)}^\circ$. A tilt changes no shape in the data — the line stays straight — so only the comparison with the prediction can reveal it.`,
          visual: apparatus('induction', { sys: true, sysKind: 'tilt', at: 550 }, 'The search coil, tilted inside the solenoid (amber). Not to scale.'),
        };
      },
    }),
    code({
      id: 'fit-M', difficulty: 2,
      gen(r) {
        const rows = B.makeData('induction', { seed: r.int(1, 999999) }).rows;
        const fs = rows.map((q) => q.s), es = rows.map((q) => q.R[0]), Is = rows.map((q) => q.R[1]);
        const x = fs.map((f, i) => 2 * Math.PI * f * Is[i] / 1000), xn = fs.map((f) => 2 * Math.PI * f * 0.5);
        const g = B.fitLine(x, es), gn = B.fitLine(xn, es);
        const data = t`import numpy as np

f = np.array([${fs.join(', ')}])           # Hz
emf = np.array([${es.map((v) => v.toFixed(1)).join(', ')}])   # peak EMF, mV
I = np.array([${Is.join(', ')}])          # peak current, mA
`;
        return {
          prompt: t`Fit the peak EMF (mV) against $\omega I_0$ (in A/s, with the measured current) using \`np.polyfit\`, and set \`M\` to the mutual inductance in µH. Then set \`M_assumed\` to what you would get by assuming $I_0 = 500$ mA at every frequency.`,
          starter: t`${data}
M = 0.0
M_assumed = 0.0
print(M, M_assumed)
`,
          answer: t`${data}
w = 2 * np.pi * f
M = np.polyfit(w * I / 1000, emf, 1)[0] * 1000      # mV per (A/s) is mH; × 1000 gives µH
M_assumed = np.polyfit(w * 0.500, emf, 1)[0] * 1000
print(f"M = {M:.2f} uH; assuming 500 mA: {M_assumed:.2f} uH")
`,
          tests: [
            { name: t`\`M\` uses the measured current (${(1000 * g.b).toFixed(2)} µH)`, code: `abs(M - ${1000 * g.b}) < 1e-6 * ${1000 * g.b}` },
            { name: t`\`M_assumed\` uses 500 mA throughout (${(1000 * gn.b).toFixed(2)} µH)`, code: `abs(M_assumed - ${1000 * gn.b}) < 1e-6 * ${1000 * gn.b}` },
          ],
          hints: [t`\`x = 2 * np.pi * f * I / 1000\` is $\omega I_0$ in A/s; the slope of mV against A/s is in mH.`, t`\`np.polyfit(x, emf, 1)[0] * 1000\` gives µH; for \`M_assumed\` use \`x = 2 * np.pi * f * 0.500\`.`],
          teach: 'The slope of peak EMF against ωI₀ is M — provided the current in ωI₀ is the one actually flowing.',
          explain: t`With the measured current $M = ${(1000 * g.b).toFixed(2)}$ µH (predicted ${M0.toFixed(2)}); assuming 500 mA gives ${(1000 * gn.b).toFixed(2)} µH, about ${(100 * (1 - gn.b / g.b)).toFixed(0)}% low. (This fit is unweighted; the bench weights each point by its error bar, which changes $M$ only slightly.)`,
          visual: plot('induction', rows, { fit: false, caption: 'The readings your program fits.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-searchcoil', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([10000, 20000, 40000]), dcm = r.pick([4, 6, 8]), f = r.pick([5, 10, 20]), BnT = r.pick([0.5, 1, 2]);
        const A = Math.PI * (dcm / 100) ** 2 / 4, e0 = N * A * 2 * Math.PI * f * BnT * 1e-9;
        const euV = +(e0 * 1e6).toPrecision(3);
        const Bans = (euV * 1e-6) / (N * A * 2 * Math.PI * f) * 1e9;
        return {
          prompt: t`Satellites measure magnetic waves in space with search-coil magnetometers. An air-core coil of ${N.toLocaleString('en-US').replace(/,/g, ' ')} turns and diameter ${dcm} cm sees a wave field $B = B_0\sin(2\pi f t)$ along its axis with $f = ${f}$ Hz, and its peak EMF is $${euV}\ \mu\text{V}$. What is the wave’s amplitude $B_0$, in nanotesla?`,
          answer: Bans, units: 'nT', tol: { rel: 0.01 },
          errors: apart([
            { value: Bans * 2 * Math.PI, feedback: t`$\omega = 2\pi f$: the peak of $d(B_0\sin\omega t)/dt$ is $\omega B_0$, not $fB_0$.` },
            { value: Bans * N, feedback: t`Every one of the ${N} turns links the flux: $\mathcal{E}_0 = NA\omega B_0$.` },
          ], Bans),
          hints: [t`$\mathcal{E}_0 = N A\,\omega B_0$, from $\mathcal{E} = -N\,d(BA)/dt$.`, t`$B_0 = \mathcal{E}_0/(NA\omega)$, with $A = \pi d^2/4$ and $\omega = 2\pi f$.`],
          teach: 'A search coil turns a changing field into an EMF NAωB₀: invert it to measure B₀.',
          explain: t`$A = \pi(${(dcm / 100).toFixed(2)})^2/4 = $ $${tex(A, 3)}\ \text{m}^2$, so $B_0 = \dfrac{${euV}\times10^{-6}}{(${N})(${tex(A, 3)})(2\pi\times${f})} = ${Bans.toFixed(2)}$ nT — tens of thousands of times weaker than Earth’s field. Real instruments wind the coil on a high-permeability core, which multiplies the signal many times.`,
          visual: traces({ names: ['wave field B', 'EMF'], caption: 'The wave field B₀ sin 2πft along the coil’s axis (solid) and the EMF it induces, of size NAωB₀ and a quarter cycle out of step (dashed). Heights not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-current-drop', difficulty: 2,
      gen(r) {
        const Rc = r.pick([10, 15, 20]), Lm = r.pick([1.5, 2.0, 2.5]), f = r.pick([800, 1000, 1500]);
        const ratio = Rc / Math.hypot(Rc, 2 * Math.PI * f * Lm * 1e-3);
        return {
          prompt: t`A solenoid of inductance ${Lm.toFixed(1)} mH is driven by a fixed-amplitude voltage through a total resistance of ${Rc} Ω. At very low frequency the peak current is 500 mA. What is it at ${f} Hz?`,
          answer: 500 * ratio, units: 'mA', tol: { rel: 0.005 },
          errors: apart([{ value: (500 * Rc) / (Rc + 2 * Math.PI * f * Lm * 1e-3), feedback: t`Resistance and reactance add like the sides of a right triangle: $|Z| = \sqrt{R^2 + X_L^2}$, not $R + X_L$.` }], 500 * ratio),
          hints: [t`$X_L = 2\pi fL$; the impedance is $|Z| = \sqrt{R^2 + X_L^2}$.`, t`The current scales as $R/|Z|$ compared with its low-frequency value.`],
          teach: 'A coil’s reactance 2πfL grows with frequency, so at a fixed drive voltage its current falls — which is why it must be measured, not assumed.',
          explain: t`$X_L = 2\pi(${f})(${(Lm * 1e-3).toFixed(4)}) = ${(2 * Math.PI * f * Lm * 1e-3).toFixed(1)}$ Ω, $|Z| = ${Math.hypot(Rc, 2 * Math.PI * f * Lm * 1e-3).toFixed(1)}$ Ω, so $I_0 = 500\times${Rc}/${Math.hypot(Rc, 2 * Math.PI * f * Lm * 1e-3).toFixed(1)} = ${(500 * ratio).toFixed(0)}$ mA.`,
          visual: (() => {
            const X = 2 * Math.PI * f * Lm * 1e-3, r2 = (v) => +v.toFixed(2);
            return {
              type: 'graph',
              params: {
                aspect: 'wide', equal: true, x: [-2, r2(Rc + 14)], y: [-2, r2(Math.max(X, 8) + 3)], axes: false, grid: false,
                arrows: [{ from: [0, 0], to: [Rc, 0] }, { from: [Rc, 0], to: [Rc, r2(X)] }, { from: [0, 0], to: [Rc, r2(X)] }],
                points: [
                  { x: r2(Rc / 2), y: 0, r: 0.01, color: 'ink2', label: `R = ${Rc} Ω`, labelDx: -24, labelDy: 16 },
                  { x: Rc, y: r2(X / 2), r: 0.01, color: 'ink2', label: 'X = 2πfL', labelDx: 8, labelDy: 0 },
                  { x: r2(Rc / 2), y: r2(X / 2), r: 0.01, color: 'ink2', label: '|Z|', labelDx: -30, labelDy: -12 },
                ],
              },
              caption: 'The impedance triangle: resistance and reactance add at right angles. Lengths to scale for this problem, but no numbers for X or |Z|.',
            };
          })(),
        };
      },
    }),
    num({
      id: 'cp-pulse-area', difficulty: 2,
      gen(r) {
        const N = r.pick([200, 400, 800]), area = r.pick([2.4, 3.6, 4.8]);      // mV·s
        const dPhi = (area * 1e-3) / N;
        return {
          prompt: t`A bar magnet is pulled quickly out of a coil of ${N} turns. The scope trace of the EMF is a single pulse whose area — the integral of the EMF over time — is ${area.toFixed(1)} mV·s. By how much did the flux through each turn change, in µWb?`,
          answer: dPhi * 1e6, units: 'uWb', tol: { rel: 0.005 },
          errors: [{ value: area * 1e-3 * 1e6, feedback: t`That is the change in flux *linkage*, $N\Delta\Phi$. Divide by the ${N} turns for the flux through each one.` }],
          hints: [t`Integrate Faraday’s law: $\int\mathcal{E}\,dt = -N\,\Delta\Phi$.`, 'So the size of the change per turn is the area divided by N (1 mV·s = 10⁻³ Wb).'],
          teach: 'The area under an EMF pulse is NΔΦ, however fast or slowly the magnet moved.',
          explain: t`$|\Delta\Phi| = \dfrac{${area.toFixed(1)}\times10^{-3}\ \text{V·s}}{${N}} = ${(dPhi * 1e6).toFixed(2)}\ \mu\text{Wb}$. Pull the magnet out twice as fast and the pulse is twice as tall and half as long — same area.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 0.4], y: [-2, 60], xlabel: 't (s)', ylabel: 'ℰ (mV)',
              curves: [{ fn: `${(area / 0.06 / Math.sqrt(2 * Math.PI)).toFixed(4)}*exp(-((x - 0.2)/0.06)^2/2)`, color: 'violet', width: 2.4 }],
              shade: [{ fn: `${(area / 0.06 / Math.sqrt(2 * Math.PI)).toFixed(4)}*exp(-((x - 0.2)/0.06)^2/2)`, from: 0, to: 0.4, color: 'violet', alpha: 0.25 }],
            },
            caption: 'The EMF pulse as the magnet leaves the coil; the shaded area is ∫ℰ dt. Pulse shape illustrative.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §13.1 Faraday’s Law, §13.2 Lenz’s Law', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law' },
    { label: 'OpenStax University Physics Vol. 2, §14.1 Mutual Inductance', url: 'https://openstax.org/books/university-physics-volume-2/pages/14-1-mutual-inductance' },
    { label: 'NIST CODATA 2022: vacuum magnetic permeability μ₀', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?mu0' },
    SOURCES.taylor('ch. 8 (least squares)'),
    SOURCES.aapt,
  ],
});
