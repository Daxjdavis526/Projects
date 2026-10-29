// Sums, products and powers — the three propagation rules everyone uses:
// absolute uncertainties in quadrature for sums and differences, relative
// ones for products and quotients, a power multiplying the relative
// uncertainty. The density of a metal cylinder; the trap of a small
// difference, the trap of x·x against x², the dominant term, and a rocket
// engine's specific impulse as the transfer.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, stat, budget, compare, SRC } from './_unc.js';

const t = String.raw;

// the worked example: an aluminium cylinder (balance ±0.02 g; caliper ±0.02 mm, as standard uncertainties)
const EX = (() => {
  const m = 27.43, d = 1.270, h = 8.004, sm = 0.02, sd = 0.002, sh = 0.002;
  const rho = (4 * m) / (Math.PI * d * d * h);
  const rm = sm / m, rd = (2 * sd) / d, rh = sh / h, rel = Math.hypot(rm, rd, rh);
  return { m, d, h, sm, sd, sh, rho, rm, rd, rh, rel, s: rho * rel };
})();

export default lesson({
  id: 'lab.A3.1',
  title: 'Sums, products and powers',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`Most results are built from measured inputs with $+$, $-$, $\times$, $\div$ and powers. For **independent** errors, two rules cover all of it: for sums and differences, add the **absolute** uncertainties in quadrature; for products, quotients and powers, add the **relative** ones in quadrature, each multiplied by its power:

$$\begin{gathered} q = x \pm y: \quad \sigma_q = \sqrt{\sigma_x^2 + \sigma_y^2} \\ q = C\,x^{a} y^{b}: \quad \frac{\sigma_q}{|q|} = \sqrt{\left(a\,\frac{\sigma_x}{x}\right)^2 + \left(b\,\frac{\sigma_y}{y}\right)^2} \end{gathered}$$

Quadrature, because independent errors rarely push the same way at once. Two traps: a difference of nearly equal numbers can have a huge relative uncertainty, and the rules fail when the same measured quantity appears twice.`,
  symbols: [
    { tex: 'x, y', text: 'measured inputs with standard uncertainties $\\sigma_x$, $\\sigma_y$ and independent errors' },
    { tex: 'q', text: 'the computed result, with standard uncertainty $\\sigma_q$' },
    { tex: t`\sigma_x/x`, text: 'a relative (fractional) uncertainty — often quoted as a percentage' },
    { tex: 'a, b', text: 'the powers in the formula: $-1$ for a divisor, 2 for a square, ½ for a square root. Only their size matters: $|a|$' },
    { tex: 'C', text: 'an exact constant such as $\\pi$ or 4, which adds no uncertainty' },
  ],
  why: 'Nearly every lab result — a density, a power, a specific impulse — goes through these two rules, and the dominant term they reveal tells you which instrument to improve.',
  visual: {
    type: 'labx-stats',
    title: 'Kinetic energy: the speed counts twice',
    lead: t`$K = \tfrac12 m v^2$ for a cart of $m = 1.20$ kg moving at $v = 3.00$ m/s. Each dot above is one draw of the two inputs; below, the spread of $K$ against the Gaussian the power rule predicts.`,
    tasks: [
      'Raise the uncertainty of v: the spread of K grows twice as fast in relative terms, because v is squared.',
      'Shrink the uncertainty of m to its minimum: the spread barely changes — the speed term dominates.',
      'Compare the readouts: the Monte Carlo spread and the rule agree while the relative uncertainties stay small.',
    ],
    params: { mode: 'mc', f: '0.5*x*y^2', x: [1.2, 0.012], y: [3.0, 0.06], xname: 'mass m (kg)', yname: 'speed v (m/s)', fname: 'kinetic energy K (J)', controls: ['sx', 'sy'], seed: 3 },
  },
  example: {
    prompt: t`An aluminium cylinder has mass $m = ${EX.m.toFixed(2)} \pm ${EX.sm.toFixed(2)}$ g, diameter $d = ${(EX.d * 10).toFixed(2)} \pm ${(EX.sd * 10).toFixed(2)}$ mm and height $h = ${(EX.h * 10).toFixed(2)} \pm ${(EX.sh * 10).toFixed(2)}$ mm (standard uncertainties). Find its density $\rho = \dfrac{4m}{\pi d^2 h}$ with its uncertainty.`,
    visual: budget([{ label: 'mass: σm/m', u: 100 * EX.rm }, { label: 'diameter: 2 σd/d', u: 100 * EX.rd }, { label: 'height: σh/h', u: 100 * EX.rh }], { unit: '%', caption: 'Relative contributions to the density’s uncertainty, to scale. The squared diameter dominates.' }),
    steps: [
      { label: 'Value', text: t`In cm: $\rho = \dfrac{4 \times ${EX.m}}{\pi \times ${EX.d}^2 \times ${EX.h}} = ${EX.rho.toFixed(4)}\ \text{g/cm}^3$.` },
      { label: 'Relative uncertainties', text: t`$\sigma_m/m = ${(100 * EX.rm).toFixed(3)}\%$; $\sigma_d/d = ${(50 * EX.rd).toFixed(3)}\%$; $\sigma_h/h = ${(100 * EX.rh).toFixed(3)}\%$.` },
      { label: 'Powers', text: t`$\rho \propto m^{1} d^{-2} h^{-1}$, so the diameter’s relative uncertainty counts **twice**: $2 \times ${(50 * EX.rd).toFixed(3)}\% = ${(100 * EX.rd).toFixed(3)}\%$. The minus signs do not matter in quadrature.` },
      { label: 'Combine', text: t`$\sigma_\rho/\rho = \sqrt{${(100 * EX.rm).toFixed(3)}^2 + ${(100 * EX.rd).toFixed(3)}^2 + ${(100 * EX.rh).toFixed(3)}^2}\,\%$ $= ${(100 * EX.rel).toFixed(3)}\%$.` },
      { label: 'Absolute', text: t`$\sigma_\rho = ${(100 * EX.rel).toFixed(3)}\% \times ${EX.rho.toFixed(4)} = ${EX.s.toFixed(4)}\ \text{g/cm}^3$.` },
      { label: 'Sense check', text: t`Handbook aluminium alloys are near $2.70\ \text{g/cm}^3$. To do better, measure the diameter better: it supplies ${Math.round((100 * EX.rd ** 2) / EX.rel ** 2)}% of the variance.` },
    ],
    answer: t`$\rho = ${EX.rho.toFixed(3)} \pm ${EX.s.toFixed(3)}\ \text{g/cm}^3$.`,
  },
  practice: [
    num({
      id: 'difference', difficulty: 2,
      gen(r) {
        const L1 = r.int(5200, 5600) / 100, dL = r.int(40, 120) / 100, L2 = +(L1 - dL).toFixed(2), s = r.pick([0.03, 0.05]);
        const sq = Math.hypot(s, s);
        return {
          prompt: t`Two lengths are measured as $${L1.toFixed(2)} \pm ${s.toFixed(2)}$ mm and $${L2.toFixed(2)} \pm ${s.toFixed(2)}$ mm, with independent errors. What is the relative uncertainty of their difference, as a percentage?`,
          visual: compare([{ v: L1, s, label: 'first length' }, { v: L2, s, label: 'second length', color: 'violet' }], { xlabel: 'length (mm)', caption: 'Each length is known to about 0.1%. Their difference is another matter.' }),
          answer: (100 * sq) / dL, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * 2 * s) / dL, feedback: 'Independent uncertainties add in quadrature: √2 × σ, not 2σ.' }, { value: (100 * sq) / L1, feedback: 'Divide by the difference, not by one of the lengths.' }],
          hints: [t`$\sigma_{\Delta} = \sqrt{${s}^2 + ${s}^2}$ mm.`, t`Divide by the difference, $${dL.toFixed(2)}$ mm.`],
          teach: 'A difference of nearly equal quantities keeps their absolute uncertainty but loses most of its size — its relative uncertainty explodes.',
          explain: t`$\sigma_\Delta = ${sq.toFixed(3)}$ mm on a difference of $${dL.toFixed(2)}$ mm: ${((100 * sq) / dL).toFixed(1)}%, although each length was known to under 0.1%. Measure small differences directly when you can.`,
        };
      },
    }),
    num({
      id: 'power-VI', difficulty: 2,
      gen(r) {
        const V = r.int(110, 240) / 10, sV = r.pick([0.05, 0.1]), I = r.int(150, 450) / 100, sI = r.pick([0.02, 0.03]);
        const P = V * I, sP = P * Math.hypot(sV / V, sI / I);
        return {
          prompt: t`A heater runs at $V = ${V.toFixed(1)} \pm ${sV}$ V and $I = ${I.toFixed(2)} \pm ${sI}$ A. What is the standard uncertainty of its power $P = VI$, in watts?`,
          visual: budget([{ label: 'voltage: σV/V', u: (100 * sV) / V }, { label: 'current: σI/I', u: (100 * sI) / I }], { unit: '%', combined: false, caption: 'The two relative uncertainties to scale.' }),
          answer: sP, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(sV, sI), feedback: 'For a product, combine relative uncertainties, not absolute ones (volts and amps cannot even be added).' }, { value: P * (sV / V + sI / I), feedback: 'Combine the relative uncertainties in quadrature, not by adding them.' }],
          hints: [t`$\sigma_P/P = \sqrt{(\sigma_V/V)^2 + (\sigma_I/I)^2}$.`, t`Then $\sigma_P = P \times$ that, with $P = ${P.toFixed(2)}$ W.`],
          teach: 'For a product, relative uncertainties add in quadrature.',
          explain: t`$\sigma_P/P = \sqrt{${((100 * sV) / V).toFixed(2)}^2 + ${((100 * sI) / I).toFixed(2)}^2}\% = ${((100 * sP) / P).toFixed(2)}\%$, so $\sigma_P = ${sP.toFixed(2)}$ W on $P = ${P.toFixed(1)}$ W.`,
        };
      },
    }),
    num({
      id: 'sphere', difficulty: 2,
      gen(r) {
        const D = r.int(1800, 3200) / 100, s = r.pick([0.02, 0.03, 0.05]);
        const rel = (300 * s) / D;
        return {
          prompt: t`A steel ball’s diameter is $${D.toFixed(2)} \pm ${s}$ mm. What is the relative uncertainty of its volume $V = \tfrac{\pi}{6}D^3$, as a percentage?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [D * 0.9, D * 1.1], y: [0, +(1.4 * (Math.PI / 6) * (D * 1.1) ** 3).toPrecision(3)], xlabel: 'diameter D (mm)', ylabel: 'volume (mm³)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: 'pi/6*x^3', color: 'accent' }], vlines: [{ x: D, color: 'gold' }] }, caption: 'V against D: a cube steepens the curve, magnifying small changes in D.' },
          answer: rel, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * s) / D, feedback: 'The diameter is cubed, so its relative uncertainty counts three times.' }, { value: (100 * Math.sqrt(3) * s) / D, feedback: 'Multiplying by √3 treats D·D·D as three independent measurements. It is one measurement used three times: multiply by 3.' }],
          hints: [t`For $q = x^3$: $\sigma_q/q = 3\,\sigma_x/x$.`],
          teach: 'A power multiplies the relative uncertainty by the size of the power.',
          explain: t`$3 \times ${s}/${D.toFixed(2)} = ${(rel / 100).toFixed(5)}$, i.e. ${rel.toFixed(2)}%.`,
        };
      },
    }),
    num({
      id: 'kinetic', difficulty: 2,
      gen(r) {
        const m = r.int(40, 120) / 100, sm = 0.005, v = r.int(150, 450) / 100, sv = r.pick([0.03, 0.05]);
        const K = 0.5 * m * v * v, sK = K * Math.hypot(sm / m, (2 * sv) / v);
        return {
          prompt: t`A glider of mass $${m.toFixed(2)} \pm ${sm}$ kg moves at $${v.toFixed(2)} \pm ${sv}$ m/s. What is the standard uncertainty of its kinetic energy $\tfrac12 m v^2$, in joules?`,
          visual: stat('mc', { f: '0.5*x*y^2', x: [m, sm], y: [v, sv], xname: 'mass (kg)', yname: 'speed (m/s)', fname: 'kinetic energy (J)', lin: false, N: 20000, seed: 9 }, 'Draws of the two inputs (top) and the resulting kinetic energies (bottom).'),
          answer: sK, units: 'J', tol: { rel: 0.015 },
          errors: [{ value: K * Math.hypot(sm / m, sv / v), feedback: 'v is squared: its relative uncertainty counts twice.' }],
          hints: [t`$\sigma_K/K = \sqrt{(\sigma_m/m)^2 + (2\sigma_v/v)^2}$.`],
          teach: 'Square a quantity and you double its relative uncertainty.',
          explain: t`$K = ${K.toFixed(3)}$ J; $\sigma_K/K = \sqrt{${((100 * sm) / m).toFixed(2)}^2 + ${((200 * sv) / v).toFixed(2)}^2}\% = ${((100 * sK) / K).toFixed(2)}\%$; $\sigma_K = ${sK.toFixed(3)}$ J.`,
        };
      },
    }),
    mcq({
      id: 'linear-add', difficulty: 2, kind: 'error',
      prompt: t`A student finds the area of a plate from length (1.0% uncertainty) and width (2.0%), and writes: “relative uncertainty of the area $= 1.0\% + 2.0\% = 3.0\%$.” What is wrong?`,
      visual: stat('mc', { f: 'x*y', x: [1, 0.01], y: [1, 0.02], xname: 'length ÷ nominal', yname: 'width ÷ nominal', fname: 'area ÷ nominal', N: 20000, seed: 4 }, 'Independent errors: the cloud is an ellipse, not a line, and the area’s spread matches quadrature (dashed).'),
      choices: [
        'Independent errors rarely both push the same way: the standard uncertainty is √(1.0² + 2.0²)% = 2.2%, and 3.0% is only a worst case',
        'Nothing: relative uncertainties of a product simply add',
        'It should be 2.0%, the larger of the two',
        'It should be 1.0% × 2.0% = 0.02%',
      ],
      answer: 0,
      why: {
        1: 'Simple addition assumes both errors are at their extremes in the same direction at once — a worst case, not a standard deviation.',
        2: 'The smaller term still contributes: √(1² + 2²) = 2.24, not 2.',
        3: 'Multiplying relative uncertainties has no meaning here; it would claim the area is known better than either side.',
      },
      hints: ['Would the length and width errors usually be large in the same direction at the same time?'],
      teach: 'Independent uncertainties combine in quadrature; linear addition is a worst-case bound.',
      explain: 'Quadrature is the standard deviation of a sum of independent errors. Linear addition is only right when the errors are fully correlated — for instance, when the same miscalibrated rule measured both sides.',
    }),
    mcq({
      id: 'x-times-x', difficulty: 3,
      prompt: t`The side of a square is measured once: $L = 50.0 \pm 0.5$ mm (1%). Its area is $A = L \cdot L$. What is the relative uncertainty of $A$?`,
      visual: stat('mc', { f: 'x*x', x: [50, 0.5], xname: 'L (mm)', fname: 'area (mm²)', N: 20000, seed: 5 }, 'One measured L, used twice: draws of L (top) and of L·L (bottom), against linear propagation.'),
      choices: ['2%, by the power rule, since L·L is L²', '√2 % ≈ 1.4%, by the product rule for L times L', '1%, the same as L', '0%: errors in the two factors cancel'],
      answer: 0,
      why: {
        1: 'The product rule assumes the two factors have independent errors. Here both factors are the same number, so their errors are identical — fully correlated.',
        2: 'A 1% error in L becomes a 2% error in L² — squaring doubles relative changes.',
        3: 'Both factors err in the same direction, so their errors add, they never cancel.',
      },
      hints: ['Are the errors of the two factors independent, or the very same error?', 'If L is 1% too big, how wrong is L·L?'],
      teach: 'When the same measured quantity appears more than once, rewrite the formula (L·L = L²) or the independence assumption breaks.',
      explain: t`A 1% error in $L$ is shared by both factors, so $A$ is off by 2%: the power rule, not the product rule. In general, simplify the formula so each measured input appears once — or use the general formula with correlations ([next lesson](#/lesson/lab.A3.2)).`,
    }),
    code({
      id: 'density-code', difficulty: 2,
      prompt: t`Compute the density of a brass cylinder and its uncertainty. Set \`rho\` (g/cm³) and \`s_rho\` from the relative uncertainties, with $\rho = 4m/(\pi d^2 h)$, then print both.`,
      starter: t`import numpy as np

m, s_m = 85.62, 0.02     # g
d, s_d = 2.002, 0.002    # cm
h, s_h = 3.250, 0.002    # cm

rho = 0
s_rho = 0
print(rho, s_rho)
`,
      answer: t`import numpy as np

m, s_m = 85.62, 0.02     # g
d, s_d = 2.002, 0.002    # cm
h, s_h = 3.250, 0.002    # cm

rho = 4 * m / (np.pi * d**2 * h)
rel = np.sqrt((s_m / m)**2 + (2 * s_d / d)**2 + (s_h / h)**2)
s_rho = rho * rel
print(rho, s_rho)`,
      tests: [
        { name: '`rho` is 4m/(πd²h)', code: 'abs(rho - 4*85.62/(np.pi*2.002**2*3.25)) < 1e-9' },
        { name: '`s_rho` counts the diameter twice', code: 'abs(s_rho - rho*np.sqrt((0.02/85.62)**2 + (2*0.002/2.002)**2 + (0.002/3.25)**2)) < 1e-9' },
        { name: 'both are printed', code: 'len(_stdout.split()) >= 2' },
      ],
      hints: ['Relative uncertainties: `s_m / m`, `2 * s_d / d` (d is squared), `s_h / h`.', 'Combine them with `np.sqrt` of the sum of squares, then multiply by `rho`.'],
      teach: 'Propagation for a power law is one line: the square root of the sum of (power × relative uncertainty)².',
      explain: t`$\rho = 8.37\ \text{g/cm}^3$ (a typical brass) with $\sigma_\rho \approx 0.019\ \text{g/cm}^3$; the diameter supplies most of it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-isp', difficulty: 2, transfer: true,
      gen(r) {
        const F = r.int(1800, 2600), sF = r.pick([10, 15, 20]), md = r.int(780, 1050) / 1000, smd = r.pick([0.005, 0.008, 0.01]);
        const g0 = 9.80665, I = F / (md * g0), sI = I * Math.hypot(sF / F, smd / md);
        return {
          prompt: t`In a static fire, thrust $F = ${F} \pm ${sF}$ N and propellant mass flow $\dot m = ${md.toFixed(3)} \pm ${smd}$ kg/s. Specific impulse is $I_{sp} = F/(\dot m g_0)$ with the exact $g_0 = 9.80665\ \text{m/s}^2$. What is the standard uncertainty of $I_{sp}$, in seconds?`,
          visual: budget([{ label: 'thrust: σF/F', u: (100 * sF) / F }, { label: 'mass flow: σṁ/ṁ', u: (100 * smd) / md }], { unit: '%', combined: false, caption: 'The two relative uncertainties to scale; g₀ is exact and adds none.' }),
          answer: sI, units: 's', tol: { rel: 0.01 },
          errors: [{ value: I * ((sF / F) + (smd / md)), feedback: 'Combine the relative uncertainties in quadrature.' }, { value: Math.hypot(sF, smd), feedback: 'For a quotient, combine relative uncertainties.' }],
          hints: [t`$\sigma_I/I = \sqrt{(\sigma_F/F)^2 + (\sigma_{\dot m}/\dot m)^2}$.`, t`$I_{sp} = ${I.toFixed(1)}$ s.`],
          teach: 'For a quotient, relative uncertainties combine in quadrature; exact constants add nothing.',
          explain: t`$I_{sp} = ${I.toFixed(1)}$ s; $\sigma_I/I = \sqrt{${((100 * sF) / F).toFixed(2)}^2 + ${((100 * smd) / md).toFixed(2)}^2}\% = ${((100 * sI) / I).toFixed(2)}\%$, so $\sigma_I = ${sI.toFixed(1)}$ s.`,
        };
      },
    }),
    num({
      id: 'cp-kepler', difficulty: 2,
      gen(r) {
        const ra = r.pick([0.2, 0.4, 0.6, 1.0]);
        return {
          prompt: t`Kepler’s third law gives an orbital period $T \propto a^{3/2}$. If a planet’s semi-major axis $a$ is known to ${ra}%, what is the relative uncertainty of the predicted period, as a percentage?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2], y: [0, 3], xlabel: 'a (AU)', ylabel: 'T (years)', xticks: 4, yticks: 3, axesAt: 'edge', curves: [{ fn: 'x^1.5', color: 'accent' }] }, caption: '$T = a^{3/2}$ in years and AU, for orbits around the Sun.' },
          answer: 1.5 * ra, units: '%', tol: { rel: 0.01 },
          errors: [{ value: ra, feedback: 'The power multiplies the relative uncertainty: ×3/2.' }, { value: (2 / 3) * ra, feedback: 'The power is 3/2, not 2/3: T goes as a to the three-halves.' }],
          hints: [t`$\sigma_T/T = \tfrac32\,\sigma_a/a$.`],
          teach: 'For q ∝ xⁿ, the relative uncertainty is |n| times that of x.',
          explain: t`$\tfrac32 \times ${ra}\% = ${(1.5 * ra).toFixed(2)}\%$.`,
        };
      },
    }),
    mcq({
      id: 'cp-dominant', difficulty: 2,
      prompt: t`You want a pendulum’s $g = 4\pi^2 L/T^2$ to 0.1%. You know $L$ to 0.05% and $T$ to 0.08%. Which improvement matters most?`,
      visual: budget([{ label: 'length: σL/L', u: 0.05 }, { label: 'period: 2 σT/T', u: 0.16 }], { unit: '%', caption: 'Contributions to the relative uncertainty of g, to scale.' }),
      choices: ['Time more swings to cut the period’s uncertainty: it counts twice and dominates', 'Measure L more carefully', 'Use a more precise value of π', 'Nothing: 0.05% and 0.08% already give under 0.1%'],
      answer: 0,
      why: {
        1: 'The length term is 0.05%, against 0.16% from the period: even a perfect L leaves 0.16%.',
        2: 'π is exact to any precision you like.',
        3: 'T is squared, so its 0.08% becomes 0.16%: the total is √(0.05² + 0.16²) = 0.17%.',
      },
      hints: ['Which input carries a power, and what does that do to its contribution?'],
      teach: 'Multiply each relative uncertainty by its power before comparing — the squared input often dominates.',
      explain: t`$\sqrt{0.05^2 + (2 \times 0.08)^2} = 0.17\%$. To reach 0.1%, the period term must fall below about 0.087%, so $T$ must be known to about 0.04%: time twice as many swings.`,
    }),
  ],
  sources: [SRC.taylor('ch. 3'), SRC.gum],
});
