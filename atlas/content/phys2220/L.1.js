// Lab 1 of PHYS 2225 (virtual): mapping the electric field on conductive
// paper. A probe reads the potential between two electrodes; E = −ΔV/Δx from
// the slope of V against x between two bars (a uniform field); the field is
// strongest where the equipotentials crowd, next to two small dots, whose
// potential on the two-dimensional paper goes as ln r (a line charge's), so
// V against ln(r₂/r₁) is straight; contact resistance at the electrodes is
// found from the ends of the line; the field as −np.gradient.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';

const t = String.raw;
const V0 = 10.0, D = 0.100;
const E_CHARGE = 1.602176634e-19;     // C, exact

// the worked example: the bars with contact resistance (seed 9)
const EX = (() => {
  const rows = B.makeData('fieldmap', { seed: 9, sys: 'contact' }).rows;
  const an = B.analyse('fieldmap', rows, { sys: 'contact' });
  const f = an.series[0].fit, q = an.results[0];
  return { rows, f, q, Vd: f.a + f.b * D };
})();

// the dots: where an equipotential crosses the line between them (m from the + dot)
const DOTS = B.EXPERIMENTS['fieldmap-dots'].defaults;
const xAt = (V) => { const g = B.dotsGeom(DOTS), e = Math.exp((V - V0 / 2) / g.K); return (g.f2 + e * g.f1) / (1 + e); };

/** Fresh readings from the bench. */
const run = (r, id = 'fieldmap', sys = null) => {
  const rows = B.makeData(id, { seed: r.int(1, 999999), sys }).rows;
  return { rows, an: B.analyse(id, rows, { sys }) };
};

/** Two line charges seen end on (em-field): the 3D picture of two dots on paper. */
const lineCharges = (extra = {}, caption) => ({
  type: 'em-field',
  params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], lines: [{ x: -5, y: 0, lambda: 1 }, { x: 5, y: 0, lambda: -1 }], static: true, readouts: [], arrows: false, fieldLines: false, equip: true, equipLabels: false, ...extra },
  caption,
});

export default lesson({
  id: 'phys2220.L.1',
  title: 'Electric field mapping',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A sheet of conductive paper carries a small current between two silver-paint electrodes, one held at 10.0 V and the other at 0 V. Touch a voltmeter probe to the paper and it reads the potential at that spot, so you can map the **equipotentials** — and, from how fast the potential changes from place to place, the electric field. The bench computes each reading with realistic scatter.

The field points the way the potential falls, and its strength is the rate of that fall:

$$E = -\frac{\Delta V}{\Delta x}$$

Between two parallel bars the potential falls in a straight line, $V(x) = V(0) - E\,x$, so the slope of $V$ against $x$ is $-E$. (Lab skills trained: mapping a field from potential measurements, linearizing data, and finding a systematic error from where a fitted line ends.)`,
  symbols: [
    { tex: 'V', text: 'the potential the probe reads, in volts, measured from the 0 V electrode' },
    { tex: 'x', text: 'the probe’s position along the line from the + electrode toward the − one, in m (read off the paper’s grid in cm)' },
    { tex: 'E', text: 'the electric field strength along $x$, in V/m — the same unit as N/C, the force per coulomb' },
    { tex: '\\Delta V,\\ \\Delta x', text: 'the change in potential between two nearby probe positions, and their separation' },
    { tex: 'V(0)', text: 'the potential where the line meets the + electrode: the intercept of $V$ against $x$' },
    { tex: 'V_0,\\ d', text: 'the supply voltage across the electrodes (10.0 V) and the bars’ separation (0.100 m)' },
  ],
  why: 'Electrode design — from the grids of an ion thruster to particle detectors and the plates steering an electron beam — starts with a map of equipotentials, and E = −dV/dx turns any voltage map into a field.',
  visual: {
    type: 'lab-bench',
    title: 'Probe the paper, read the voltmeter',
    lead: t`Six readings along the line between the bars are in the table. The plot shows $V$ against $x$ with the least-squares line and its residuals; the readout turns the slope into the field $E$ and compares it with $V_0/d$. Slide the probe and press **Take a measurement** to add points.`,
    tasks: [
      'With the bars, V falls in a straight line: E = −slope is about 100 V/m, matching V₀/d = 10.0 V ÷ 0.100 m.',
      'Turn on the contact resistance: the line now starts at 9.7 V and ends at 0.3 V, and its slope gives 94 V/m — many σ from V₀/d, although the fit still looks perfect.',
      'Switch the Method to Dots: the equipotentials crowd round each dot, V against x is an S-shaped curve, but V against ln(r₂/r₁) is a straight line.',
    ],
    params: { exp: ['fieldmap', 'fieldmap-dots'], seed: 48, residuals: true },
  },
  example: {
    prompt: t`The bars are 10.0 cm apart with 10.0 V across them. Six readings along the centre line are in the table, each uncertain by about 0.05 V (mostly from placing the probe to ±0.5 mm). A fit of $V$ against $x$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{V/m}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{V}`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find the field, compare it with $V_0/d$, and explain any difference.`,
    visual: plot('fieldmap', EX.rows, { sys: true, table: true, residuals: true, expected: true, caption: 'V against x with ±1σ error bars, the least-squares line (gold) and, dashed, the line perfect contacts would give. Residuals below.' }),
    steps: [
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$ and the residuals scatter without a pattern: $V$ falls linearly with $x$, so the field between the bars is uniform.` },
      { label: 'Field from the slope', text: t`$E = -\Delta V/\Delta x = -\text{slope} = ${pmTeX(-EX.f.b, EX.f.sb, t`\text{V/m}`)}$. The minus sign says the field points the way $V$ falls: from the + bar toward the − bar.` },
      { label: 'Compare', text: t`$V_0/d = 10.0\ \text{V}/0.100\ \text{m} = 100\ \text{V/m}$, and $(100 - ${(-EX.f.b).toFixed(1)})/${EX.f.sb.toFixed(2)} = ${EX.q.z.toFixed(1)}$ standard uncertainties. Random scatter cannot do that: something systematic is going on.` },
      { label: 'Read the ends', text: t`At the + bar the line gives $V(0) = ${pmTeX(EX.f.a, EX.f.sa, t`\text{V}`)}$, not 10.00 V. At the − bar, $V(d) = ${EX.f.a.toFixed(2)} + (${EX.f.b.toFixed(1)})(0.100) = ${EX.Vd.toFixed(2)}$ V, not 0. About 0.3 V goes missing at **each** electrode before the current gets into the paper: contact resistance where the silver paint meets it.` },
      { label: 'Which is right?', text: t`The slope measures the field that is really in the paper: $(${EX.f.a.toFixed(2)} - ${EX.Vd.toFixed(2)})\ \text{V}/0.100\ \text{m} = ${(-EX.f.b).toFixed(1)}$ V/m. It is $V_0/d$ that is wrong, because it assumes perfect contacts. (A voltmeter reading 6% low would give $V(0) \approx 9.4$ V and $V(d) = 0$ instead: the two ends tell the faults apart.)` },
      { label: 'Sense check', text: t`94 V/m is 94 N/C: a proton on the paper would feel $eE = (1.6\times10^{-19}\ \text{C})(94\ \text{N/C}) \approx 1.5\times10^{-17}$ N. Whenever contacts or leads take a share of the voltage, the field in the paper is weaker than $V_0/d$.` },
    ],
    answer: t`$E = ${pmTeX(-EX.f.b, EX.f.sb, t`\text{V/m}`)}$, ${EX.q.z.toFixed(1)}σ below $V_0/d = 100$ V/m because about 0.3 V is lost at each contact; the line’s ends, $V(0) = ${EX.f.a.toFixed(2)}$ V and $V(d) = ${EX.Vd.toFixed(2)}$ V, show it.`,
  },
  practice: [
    num({
      id: 'E-from-slope', difficulty: 1,
      gen(r) {
        const { rows, an } = run(r, 'fieldmap', r.bool() ? 'contact' : null);
        const bcm = +(an.series[0].fit.b / 100).toFixed(3);
        const E = -bcm * 100;
        return {
          prompt: t`A fit of $V$ against $x$ between the bars, with $x$ in centimetres, has a slope of $${bcm.toFixed(3)}$ V/cm. What is the electric field strength between the bars, in V/m?`,
          answer: E, units: 'V/m', tol: { rel: 0.002 },
          errors: [{ value: -bcm, feedback: 'That is the fall in volts per centimetre. A metre is 100 cm, so the fall per metre is 100 times larger.' }],
          hints: [t`$E = -\Delta V/\Delta x$: the field is minus the slope.`, 'Convert: 1 V/cm = 100 V/m.'],
          teach: 'The field strength is minus the slope of V against x, in volts per metre.',
          explain: t`$E = -(${bcm.toFixed(3)}\ \text{V/cm}) \times 100\ \text{cm/m} = ${E.toFixed(1)}$ V/m, pointing toward lower potential — from the + bar to the − bar.`,
          visual: plot('fieldmap', rows, { caption: 'V against x between the bars, with the least-squares line (x plotted in metres).' }),
        };
      },
    }),
    num({
      id: 'two-readings', difficulty: 1,
      gen(r) {
        const { rows } = run(r, 'fieldmap');
        const i = r.int(0, 2), j = r.int(i + 2, 5);
        const [x1, V1, x2, V2] = [rows[i].s, rows[i].R[0], rows[j].s, rows[j].R[0]];
        const E = (V1 - V2) / ((x2 - x1) / 100);
        return {
          prompt: t`Two probe readings between the bars: ${V1.toFixed(2)} V at $x = ${x1.toFixed(1)}$ cm and ${V2.toFixed(2)} V at $x = ${x2.toFixed(1)}$ cm. Estimate the field strength from these two readings alone.`,
          answer: E, units: 'V/m', tol: { rel: 0.004 },
          errors: [{ value: (V1 - V2) / (x2 - x1), feedback: 'That is in volts per centimetre. Divide by the separation in metres.' }, { value: V1 / (x1 / 100), feedback: t`That divides one potential by one position. The field is the *change* in potential over the *change* in position: $(V_1 - V_2)/(x_2 - x_1)$.` }],
          hints: [t`$E = -\Delta V/\Delta x = (V_1 - V_2)/(x_2 - x_1)$.`, t`The separation is $${(x2 - x1).toFixed(1)}$ cm $= ${((x2 - x1) / 100).toFixed(3)}$ m.`],
          teach: 'Two readings give the average field between them: the potential difference divided by the distance.',
          explain: t`$E = \dfrac{${V1.toFixed(2)} - ${V2.toFixed(2)}}{${((x2 - x1) / 100).toFixed(3)}} = ${E.toFixed(0)}$ V/m. Two readings carry two probes’ worth of scatter; the fit through all six does better.`,
          visual: plot('fieldmap', [rows[i], rows[j]], { fit: false, caption: 'The two readings, with their error bars.' }),
        };
      },
    }),
    mcq({
      id: 'direction', difficulty: 2,
      prompt: t`The map shows the equipotentials (violet) round a + dot on the left and a − dot on the right. Which way does the electric field point at P?`,
      choices: [
        'Perpendicular to the equipotential through P, toward lower potential',
        'Along the equipotential through P',
        'Perpendicular to the equipotential through P, toward higher potential',
        'Straight away from the + dot, along the line from the dot to P',
      ],
      answer: 0,
      why: {
        1: 'Moving along an equipotential changes V by nothing, so the field has no component along it: E = −ΔV/Δs is zero in that direction.',
        2: t`The minus sign in $E = -\Delta V/\Delta x$: the field points the way the potential *falls*, as a ball rolls downhill.`,
        3: 'That is the field of the + dot alone. The − dot pulls too; their sum bends toward it, and stays perpendicular to the equipotentials of the pair.',
      },
      hints: ['How much does V change if you step along the equipotential?', 'The field points the way V decreases fastest.'],
      teach: 'The field is perpendicular to the equipotentials and points from high potential to low.',
      explain: 'Along an equipotential V does not change, so E has no component there; it points straight across the equipotentials, downhill in V — here away from the + dot side and curving toward the − dot.',
      visual: lineCharges({ probe: { x: -2.5, y: 3, label: 'P' }, probeArrow: false }, 'Equipotentials of two dots on conductive paper — the same pattern as two long line charges seen end on. Arrows hidden.'),
    }),
    mcq({
      id: 'strongest', difficulty: 1,
      prompt: 'Along the line joining the two dots, where is the electric field strongest?',
      choices: [
        'Right next to either dot, where the equipotentials crowd together',
        'Halfway between the dots, where the fields of both dots add',
        'Everywhere the same, as it is between the bars',
        'Only next to the + dot, where the potential is highest',
      ],
      answer: 0,
      why: {
        1: t`The two dots’ fields do point the same way there and add — but each is at its weakest, 5 cm from its dot. The midpoint field, about ${Math.round(B.dotsE(0.05, DOTS))} V/m, is the smallest anywhere on the line.`,
        2: 'Between bars the equipotentials are evenly spaced. Round small dots they are circles that bunch up next to each dot.',
        3: 'The field is how fast V changes, not how big V is. The − dot has crowded equipotentials too, at low potential.',
      },
      hints: ['Where are the dashed equipotentials closest together?', t`$E = \Delta V/\Delta x$: the same $\Delta V$ over a shorter $\Delta x$ is a stronger field.`],
      teach: 'The field is strongest where the equipotentials are closest together, whatever the potential is there.',
      explain: t`Equally spaced levels (1 V apart) bunch up next to each dot, so $\Delta V/\Delta x$ is largest there: about ${Math.round(B.dotsE(0.01, DOTS))} V/m 1 cm from a dot against ${Math.round(B.dotsE(0.05, DOTS))} V/m at the midpoint.`,
      visual: apparatus('fieldmap-dots', {}, 'The dots on the paper: field lines (blue) and equipotentials every 1 V (violet, dashed). Not to scale.'),
    }),
    num({
      id: 'local-field', difficulty: 2,
      gen(r) {
        const { rows } = run(r, 'fieldmap-dots');
        const near = r.bool(), [a, b] = near ? [0, 1] : [3, 5];
        const [xa, Va, xb, Vb] = [rows[a].s, rows[a].R[0], rows[b].s, rows[b].R[0]];
        const E = (Va - Vb) / ((xb - xa) / 100), mid = (xa + xb) / 2;
        return {
          prompt: t`Between the dots, the probe reads ${Va.toFixed(2)} V at $x = ${xa.toFixed(1)}$ cm and ${Vb.toFixed(2)} V at $x = ${xb.toFixed(1)}$ cm. Estimate the field strength at $x = ${mid.toFixed(1)}$ cm.`,
          answer: E, units: 'V/m', tol: { rel: 0.005 },
          errors: [{ value: (Va - Vb) / (xb - xa), feedback: 'That is in volts per centimetre: divide by the separation in metres.' }],
          hints: [t`The average field over a short step is $\Delta V/\Delta x$; it stands for the field at the step’s midpoint.`],
          teach: 'Over a short step the field is the potential difference divided by the step — a finite-difference derivative of V.',
          explain: t`$E \approx \dfrac{${Va.toFixed(2)} - ${Vb.toFixed(2)}}{${((xb - xa) / 100).toFixed(3)}\ \text{m}} = ${E.toFixed(0)}$ V/m at $x = ${mid.toFixed(1)}$ cm. Without scatter the field would be ${Math.round(B.dotsE(0.015, DOTS))} V/m at 1.5 cm and ${Math.round(B.dotsE(0.05, DOTS))} V/m at 5.0 cm: about twice as strong next to a dot as in the middle.`,
          visual: plot('fieldmap-dots', rows, { axes: 'raw', fit: false, caption: 'V against x along the line between the dots. Steep near the dots, gentle in the middle.' }),
        };
      },
    }),
    mcq({
      id: 'which-plot', difficulty: 3,
      ...(() => {
        const rows = B.makeData('fieldmap-dots', { seed: 21 }).rows;
        return {
          prompt: t`Your readings between the dots form an S-shaped curve. Which plot of them should be a straight line? ($r_1$ and $r_2$ are the probe’s distances from the + and − dots.)`,
          choices: [
            t`$V$ against $\ln(r_2/r_1)$`,
            t`$V$ against $1/r_1 - 1/r_2$`,
            t`$\ln V$ against $x$`,
            t`$V$ against $x^2$`,
          ],
          answer: 0,
          why: {
            1: t`That is the potential of two *point* charges in three dimensions. On the paper the current can spread out only in two dimensions, like the field of a long line charge, which falls as $1/r$ — and a $1/r$ field has a potential that goes as $\ln r$.`,
            2: t`Plotting $\ln V$ straightens an exponential decay, $V \propto e^{-x/\ell}$. Nothing here decays exponentially, and $V$ is not even zero at the − dot’s side of the line.`,
            3: t`$V$ falls as steeply toward the − dot as it rises toward the + dot: the curve is antisymmetric about the midpoint, which no function of $x^2$ can be.`,
          },
          hints: ['On the paper, current spreads out from a dot in a flat circle. How does a field that spreads in a circle fall off with r?', t`A field falling as $1/r$ (a line charge’s) has a potential $\propto \ln r$; two dots of opposite sign add to $K\ln r_2 - K\ln r_1$.`],
          teach: 'A dot on conductive paper is a two-dimensional source: like a line charge, its field falls as 1/r and its potential as ln r.',
          explain: t`Each dot sends its current out over circles of circumference $2\pi r$, so its field falls as $1/r$ — the field of a line charge. Then $V = V_{\text{mid}} + K\ln(r_2/r_1)$: a straight line against $\ln(r_2/r_1)$ with slope $K$ and intercept the midpoint’s 5.0 V.`,
          visual: plot('fieldmap-dots', rows, { axes: 'raw', fit: false, caption: 'V against x between the dots: an S-shaped curve.' }),
        };
      })(),
    }),
    mcq({
      id: 'which-fault', difficulty: 3,
      gen(r) {
        const { rows, an } = run(r, 'fieldmap', 'contact');
        const f = an.series[0].fit, q = an.results[0];
        const Vd = f.a + f.b * D;
        return {
          prompt: t`Your bars give $E = ${pmTeX(q.value, q.sigma, t`\text{V/m}`)}$, well below $V_0/d = 100$ V/m. The fitted line has $V(0) = ${f.a.toFixed(2)}$ V at the + bar and $V(d) = ${Vd.toFixed(2)}$ V at the − bar. Which fault explains both ends?`,
          choices: [
            'Contact resistance: part of the 10.0 V is lost at each electrode, so the paper runs from about 9.7 V to 0.3 V',
            'The voltmeter reads 6% low on every reading',
            'The probe positions were read from a grid whose zero is 3 mm off the + bar',
            'Random scatter: with more readings E will come back to 100 V/m',
          ],
          answer: 0,
          why: {
            1: t`A meter reading 6% low scales every reading, so the line would run from about 9.4 V down to exactly 0 at the − bar. Here the − end is ${Vd.toFixed(2)} V, not 0.`,
            2: t`A position offset slides the whole line sideways: its slope, and so $E$, would not change at all.`,
            3: t`$E$ is ${q.z.toFixed(0)} standard uncertainties from 100 V/m. Averaging shrinks the error bar on a biased answer; it does not remove the bias.`,
          },
          hints: ['What would each fault do to the line’s value at the + bar, and at the − bar?', 'Only one fault makes the paper miss 10.0 V at one end and miss 0 V at the other.'],
          teach: 'Different faults leave different fingerprints: compare where the fitted line meets each electrode with the voltage applied there.',
          explain: t`The paper misses the supply by about the same 0.3 V at both ends: $10.00 - ${f.a.toFixed(2)} = ${(V0 - f.a).toFixed(2)}$ V at the + bar and $${Vd.toFixed(2)} - 0 = ${Vd.toFixed(2)}$ V at the − bar. That is a voltage drop across each contact. The field in the paper really is $${q.value.toFixed(1)}$ V/m; $V_0/d$ assumed perfect contacts.`,
          visual: plot('fieldmap', rows, { sys: true, expected: true, caption: 'Your readings, the least-squares line (gold) and the line perfect contacts would give (dashed).' }),
        };
      },
    }),
    code({
      id: 'gradient', difficulty: 2,
      gen(r) {
        const rows = B.makeData('fieldmap-dots', { seed: r.int(1, 999999) }).rows;
        const xs = rows.map((q) => q.s), Vs = rows.map((q) => q.R[0]), xm = xs.map((x) => x / 100), n = xs.length;
        const g = Vs.map((_, i) => (i === 0 ? (Vs[1] - Vs[0]) / (xm[1] - xm[0]) : i === n - 1 ? (Vs[n - 1] - Vs[n - 2]) / (xm[n - 1] - xm[n - 2]) : (Vs[i + 1] - Vs[i - 1]) / (xm[i + 1] - xm[i - 1])));
        const E = g.map((v) => -v), Emid = E[4];
        const data = t`import numpy as np

x = np.array([${xs.map((v) => v.toFixed(1)).join(', ')}])   # cm from the + dot
V = np.array([${Vs.map((v) => v.toFixed(2)).join(', ')}])   # volts
`;
        return {
          prompt: t`These nine readings run along the line between the dots. Use \`np.gradient\` to find the field $E = -dV/dx$ at every point, **in V/m**, and set \`E_mid\` to its value halfway between the dots ($x = 5.0$ cm).`,
          starter: t`${data}
E = np.zeros_like(V)   # the field at each x, in V/m
E_mid = 0.0
print(E.round(1), E_mid)
`,
          answer: t`${data}
E = -np.gradient(V, x / 100)    # x in metres, so E comes out in V/m
E_mid = E[4]
print(E.round(1), E_mid)
`,
          tests: [
            { name: 'E is −dV/dx in V/m at every point', code: `bool(np.allclose(E, [${E.map((v) => v.toFixed(9)).join(', ')}], rtol=1e-6))` },
            { name: t`\`E_mid\` is the field at $x = 5.0$ cm (${Emid.toFixed(1)} V/m)`, code: `abs(E_mid - ${Emid}) < 1e-6 * ${Math.abs(Emid)}` },
          ],
          hints: [t`\`np.gradient(V, x)\` estimates $dV/dx$ at every point from its neighbours; give it $x$ in metres.`, t`\`E = -np.gradient(V, x / 100)\`, then \`E_mid = E[4]\` (the fifth point, $x = 5.0$ cm).`],
          teach: 'The field is minus the gradient of the potential; np.gradient takes that derivative numerically from neighbouring readings.',
          explain: t`Inside the list, \`np.gradient\` takes centred differences, $(V_{i+1} - V_{i-1})/(x_{i+1} - x_{i-1})$; at the two ends, one-sided ones. The field is largest next to the dots and about ${Emid.toFixed(0)} V/m halfway, where it is weakest. The end values are the roughest: a one-sided step averages the field over the whole first centimetre, so \`E[0]\` (${E[0].toFixed(0)} V/m) falls well short of the ${Math.round(B.dotsE(0.01, DOTS))} V/m really there at 1.0 cm.`,
          visual: plot('fieldmap-dots', rows, { axes: 'raw', fit: false, caption: 'The readings your program differentiates.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion-grids', difficulty: 3, transfer: true,
      gen(r) {
        const Vs = r.pick([1000, 1100, 1200]), Va = r.pick([150, 200, 250]), dmm = r.pick([0.6, 0.8, 1.0]);
        const E = (Vs + Va) / (dmm / 1000), F = E_CHARGE * E;
        return {
          prompt: t`In a gridded ion thruster, the screen grid sits at $+${Vs}$ V and the accelerator grid at $-${Va}$ V, ${dmm.toFixed(1)} mm downstream. A field map of the gap shows the potential falling in a straight line across it. Treating the field as uniform, what force does it exert on a singly charged xenon ion (charge $e = 1.602\times10^{-19}$ C)?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (E_CHARGE * Vs) / (dmm / 1000), feedback: t`The potential falls from $+${Vs}$ V to $-${Va}$ V: the difference is $${Vs} + ${Va} = ${Vs + Va}$ V, not ${Vs} V.` }, { value: (E_CHARGE * (Vs - Va)) / (dmm / 1000), feedback: t`Mind the sign of the accelerator grid: $\Delta V = ${Vs} - (-${Va}) = ${Vs + Va}$ V.` }],
          hints: [t`First the field: $E = \Delta V/d$, with $d$ in metres.`, t`Then the force: $F = eE$.`],
          teach: 'A uniform field is the potential difference over the gap; the force on a charge is qE.',
          explain: t`$E = \dfrac{${Vs} - (-${Va})}{${(dmm / 1000).toFixed(4)}\ \text{m}} = $ $${tex(E)}$ V/m, so $F = eE = $ $${tex(F)}$ N — tiny, but it acts on an ion of mass $2.2\times10^{-25}$ kg, giving it an acceleration near $10^{12}\ \text{m/s}^2$. Real grids are perforated, so the field bulges through the holes; a field map is how designers see that.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.2, +(dmm + 0.2).toFixed(2)], y: [-Va - 250, Vs + 250], xlabel: 'distance downstream (mm)', ylabel: 'V (V)', xticks: 6,
              curves: [{ fn: `${Vs} - ${(Vs + Va) / dmm}*x`, domain: [0, dmm], color: 'accent', width: 2.4 }],
              vlines: [{ x: 0, label: 'screen grid', color: 'ink3' }, { x: dmm, label: 'accelerator grid', color: 'ink3' }],
              hlines: [{ y: 0, color: 'ink4' }],
            },
            caption: 'The potential across the gap between the grids, taken as falling linearly (a uniform field). Real grids have holes, and the field bulges through them.',
          },
        };
      },
    }),
    num({
      id: 'cp-crowding', difficulty: 2,
      gen(r) {
        const [near, far] = r.pick([[[9, 8], [6, 5]], [[2, 1], [5, 4]], [[8, 7], [5, 4]], [[3, 2], [6, 5]]]);
        const sNear = Math.abs(xAt(near[1]) - xAt(near[0])) * 100, sFar = Math.abs(xAt(far[1]) - xAt(far[0])) * 100;
        const a = +sNear.toFixed(2), b = +sFar.toFixed(2);
        return {
          prompt: t`Along the line between the dots, the ${near[0]} V and ${near[1]} V equipotentials cross it ${a.toFixed(2)} cm apart, and the ${far[0]} V and ${far[1]} V equipotentials ${b.toFixed(2)} cm apart. How many times stronger is the average field between the first pair than between the second?`,
          answer: b / a, tol: { rel: 0.01 },
          errors: [{ value: a / b, feedback: 'Upside down: the same 1 V over a shorter distance is a stronger field. The closer pair has the stronger field.' }],
          hints: [t`Each pair is 1 V apart, so $E = 1\ \text{V}/\Delta x$ for each.`, 'The ratio of the fields is the inverse ratio of the spacings.'],
          teach: 'Equipotentials at equal voltage steps are closest where the field is strongest: E is inversely proportional to their spacing.',
          explain: t`$E_1/E_2 = (1\ \text{V}/${a.toFixed(2)}\ \text{cm})/(1\ \text{V}/${b.toFixed(2)}\ \text{cm}) = ${(b / a).toFixed(2)}$. The field nearer a dot is more than twice the field nearer the middle.`,
          visual: apparatus('fieldmap-dots', {}, 'The equipotentials, 1 V apart, between the dots. Not to scale.'),
        };
      },
    }),
    num({
      id: 'cp-K-midfield', difficulty: 3,
      gen(r) {
        const { rows, an } = run(r, 'fieldmap-dots', r.bool(0.3) ? 'contact' : null);
        const K = +an.series[0].fit.b.toFixed(3);
        const E = (4 * K) / D;
        return {
          prompt: t`For the dots, 10.0 cm apart, a fit of $V$ against $\ln(r_2/r_1)$ has slope $K = ${K.toFixed(3)}$ V. Along the line between them $r_1 = x$ and $r_2 = d - x$, so $V = V_{\text{mid}} + K\ln\!\big((d - x)/x\big)$. What is the field strength halfway between the dots?`,
          answer: E, units: 'V/m', tol: { rel: 0.005 },
          errors: [{ value: (2 * K) / D, feedback: t`Differentiate both logarithms: $\dfrac{d}{dx}\ln\dfrac{d - x}{x} = -\dfrac{1}{d - x} - \dfrac{1}{x}$, and at the midpoint each term is $2/d$.` }, { value: (4 * K) / 10, feedback: 'Use d in metres: 0.100 m, not 10 cm.' }],
          hints: [t`$E = -dV/dx = K\left(\dfrac1x + \dfrac{1}{d - x}\right)$.`, t`At the midpoint $x = d/2$, so $E = K(2/d + 2/d) = 4K/d$.`],
          teach: 'Differentiating the log potential gives the field of two line sources: E = K(1/r₁ + 1/r₂), one term from each dot.',
          explain: t`$E = K\left(\dfrac{1}{x} + \dfrac{1}{d - x}\right)$, and at $x = d/2 = 0.050$ m this is $4K/d = 4(${K.toFixed(3)})/0.100 = ${E.toFixed(1)}$ V/m — the weakest field on the line. Each term is one dot’s $1/r$ field.`,
          visual: plot('fieldmap-dots', rows, { caption: 'V against ln(r₂/r₁) between the dots, with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'cp-contact-drop', difficulty: 2,
      gen(r) {
        const { rows, an } = run(r, 'fieldmap', 'contact');
        const f = an.series[0].fit;
        const a = +f.a.toFixed(3), b = +f.b.toFixed(1), Vd = a + b * D;
        const errors = Math.abs(V0 - a - Vd) > 0.02 ? [{ value: V0 - a, feedback: t`That is the drop at the + contact, $10.00 - V(0)$. The question asks about the − bar: the paper next to it is at $V(d)$, not 0.` }] : [];
        return {
          prompt: t`The bars are 10.0 cm apart. Your fit gives $V(0) = ${a.toFixed(3)}$ V and slope $${b.toFixed(1)}$ V/m. The − bar is at 0 V. How large is the voltage drop across the contact at the − bar?`,
          answer: Vd, units: 'V', tol: { rel: 0.01, abs: 0.002 },
          errors,
          hints: [t`Extend the line to the − bar: $V(d) = V(0) + \text{slope}\times d$.`, 'The paper next to the − bar sits at V(d); the bar itself is at 0 V.'],
          teach: 'Extrapolate the fitted line to an electrode: the gap between it and the electrode’s voltage is the drop across the contact.',
          explain: t`$V(d) = ${a.toFixed(3)} + (${b.toFixed(1)})(0.100) = ${Vd.toFixed(2)}$ V, so ${Vd.toFixed(2)} V is lost across the − contact — about the same as the $${(V0 - a).toFixed(2)}$ V lost at the + contact.`,
          visual: plot('fieldmap', rows, { sys: true, expected: true, caption: 'Your readings, the least-squares line (gold) and the line perfect contacts would give (dashed).' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §7.4 Determining Field from Potential', url: 'https://openstax.org/books/university-physics-volume-2/pages/7-4-determining-field-from-potential' },
    { label: 'OpenStax University Physics Vol. 2, §7.5 Equipotential Surfaces and Conductors', url: 'https://openstax.org/books/university-physics-volume-2/pages/7-5-equipotential-surfaces-and-conductors' },
    SOURCES.taylor('ch. 8 (least squares)'),
    { label: 'NumPy documentation: numpy.gradient', url: 'https://numpy.org/doc/stable/reference/generated/numpy.gradient.html' },
    SOURCES.aapt,
  ],
});
