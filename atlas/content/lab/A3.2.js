// The general formula with partial derivatives — linear propagation for any
// differentiable f: sensitivity coefficients ∂f/∂xᵢ (the GUM's cᵢ), angles
// in radians, and the covariance term for correlated inputs (shared
// calibrations cancel in ratios and differences, add in sums). Snell's law
// for a refractive index; a planet's mass from its moon as the transfer.
// prog.P13.2 builds Monte Carlo on top of this lesson.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { stat, budget, SRC } from './_unc.js';

const t = String.raw;
const D2R = Math.PI / 180;

// the worked example: n = sin θ₁ / sin θ₂ with both angles ±0.5°
const EX = (() => {
  const t1 = 45.0, t2 = 28.0, s = 0.5;
  const a = t1 * D2R, b = t2 * D2R, sr = s * D2R;
  const n = Math.sin(a) / Math.sin(b);
  const c1 = Math.cos(a) / Math.sin(b), c2 = (-Math.sin(a) * Math.cos(b)) / Math.sin(b) ** 2;
  return { t1, t2, s, sr, n, c1, c2, u1: c1 * sr, u2: c2 * sr, sn: Math.hypot(c1 * sr, c2 * sr) };
})();

export default lesson({
  id: 'lab.A3.2',
  title: 'The general formula with partial derivatives',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`For any result $f(x_1, \ldots, x_N)$ that is smooth over the inputs’ spreads, each input moves $f$ by its uncertainty times **how sensitive $f$ is to it** — the partial derivative. Independent contributions add in quadrature; correlated ones add a covariance term:

$$\sigma_f^2 = \sum_i \left(\frac{\partial f}{\partial x_i}\right)^{\!2} \sigma_i^2 \;+\; 2\sum_{i<j} \frac{\partial f}{\partial x_i}\frac{\partial f}{\partial x_j}\,\sigma_{ij}$$

This is the GUM’s **law of propagation of uncertainty**; the rules for sums, products and powers are special cases. It is a linearization — it treats $f$ as a straight line (a plane) over each input’s spread — and the [Monte Carlo lesson](#/lesson/lab.A3.3) shows when that fails. Angles go in **radians**.`,
  symbols: [
    { tex: 'f', text: 'the result, computed from the inputs' },
    { tex: 'x_i', text: 'the inputs, with standard uncertainties $\\sigma_i$' },
    { tex: t`\partial f/\partial x_i`, text: 'the **sensitivity coefficient** $c_i$: how much $f$ changes per unit change of $x_i$, the others held fixed — evaluated at the measured values' },
    { tex: t`\sigma_{ij}`, text: 'the covariance of inputs $i$ and $j$, $\\rho_{ij}\\sigma_i\\sigma_j$, where the correlation coefficient $\\rho_{ij}$ runs from −1 to +1. Zero for independent inputs' },
  ],
  why: 'Real results use trigonometric, exponential and logarithmic formulas and inputs that share calibrations; only the general formula handles them all.',
  visual: {
    type: 'labx-stats',
    title: 'A ratio of correlated inputs',
    lead: t`$f = x/y$ with each input uncertain by 2%. The correlation $\rho$ tilts the cloud of input draws. When both inputs err the same way ($\rho > 0$, say a shared calibration), the ratio barely changes.`,
    tasks: [
      'At ρ = 0 the ratio’s uncertainty is √2 × 2% ≈ 2.8% — the quotient rule.',
      'Slide ρ toward +0.95: the cloud lines up along the diagonal and the spread of x/y collapses.',
      'Slide ρ toward −0.95: errors now push the ratio both ways at once and its spread grows to nearly 4%.',
    ],
    params: { mode: 'mc', f: 'x/y', x: [10, 0.2], y: [5, 0.1], xname: 'x', yname: 'y', fname: 'f = x/y', controls: ['rho', 'sx'], rho: 0, seed: 21 },
  },
  example: {
    prompt: t`A ray enters a glass block at $\theta_1 = ${EX.t1.toFixed(1)}° \pm ${EX.s}°$ and refracts to $\theta_2 = ${EX.t2.toFixed(1)}° \pm ${EX.s}°$ (independent readings of a protractor). Find the refractive index $n = \sin\theta_1/\sin\theta_2$ and its uncertainty.`,
    visual: budget([{ label: 'from θ₁: c₁σ₁', u: EX.u1 }, { label: 'from θ₂: |c₂|σ₂', u: Math.abs(EX.u2) }], { caption: 'The two contributions to the uncertainty of n, to scale. The refracted angle matters more.' }),
    steps: [
      { label: 'Value', text: t`$n = \sin ${EX.t1}° / \sin ${EX.t2}° = ${EX.n.toFixed(4)}$.` },
      { label: 'Sensitivities', text: t`$\dfrac{\partial n}{\partial \theta_1} = \dfrac{\cos\theta_1}{\sin\theta_2} = ${EX.c1.toFixed(3)}$ and $\dfrac{\partial n}{\partial \theta_2} = -\dfrac{\sin\theta_1\cos\theta_2}{\sin^2\theta_2} = ${EX.c2.toFixed(3)}$, per radian.` },
      { label: 'Radians', text: t`The derivatives are per radian, so $\sigma_\theta = 0.5° = ${EX.sr.toFixed(5)}$ rad. Using 0.5 “degrees” directly would make $\sigma_n$ 57 times too big.` },
      { label: 'Contributions', text: t`$c_1\sigma_1 = ${EX.u1.toFixed(4)}$ and $c_2\sigma_2 = ${EX.u2.toFixed(4)}$ (the sign does not matter for independent inputs).` },
      { label: 'Combine', text: t`$\sigma_n = \sqrt{${EX.u1.toFixed(4)}^2 + (${EX.u2.toFixed(4)})^2} = ${EX.sn.toFixed(4)}$.` },
      { label: 'Sense check', text: t`$n \approx 1.5$ is typical of glass. The refracted angle dominates because $\sin\theta_2$ sits in the denominator and is the smaller sine: to improve, measure $\theta_2$ better or use larger angles.` },
    ],
    answer: t`$n = ${EX.n.toFixed(3)} \pm ${EX.sn.toFixed(3)}$.`,
  },
  practice: [
    expr({
      id: 'partial', difficulty: 2,
      gen(r) {
        const which = r.int(0, 2);
        const cases = [
          { f: 'V^2/R', name: t`P = V^2/R`, wrt: 'R', vars: { R: [5, 50], V: [1, 12] }, ans: '-V^2/R^2', ansTeX: t`-\frac{V^2}{R^2}`, wrong: 'V^2/R^2', ctx: 'the power dissipated in a resistor', curve: 'V² = 100: P against R', fn: '100/x', xr: [2, 40], yr: [0, 50], xl: 'R (Ω)', yl: 'P (W)' },
          { f: '2*pi*sqrt(L/g)', name: t`T = 2\pi\sqrt{L/g}`, wrt: 'g', vars: { g: [9, 10.5], L: [0.3, 2] }, ans: '-pi*sqrt(L)/g^(3/2)', ansTeX: t`-\frac{\pi\sqrt L}{g^{3/2}}`, wrong: 'pi*sqrt(L)/g^(3/2)', ctx: 'a pendulum’s period', curve: 'L = 1 m: T against g', fn: '2pi*sqrt(1/x)', xr: [1, 25], yr: [0, 7], xl: 'g (m/s²)', yl: 'T (s)' },
          { f: 'e^(-mu*x)', name: t`\tau = e^{-\mu x}`, wrt: 'mu', vars: { mu: [0.1, 2], x: [0.1, 3] }, ans: '-x*e^(-mu*x)', ansTeX: t`-x\,e^{-\mu x}`, wrong: 'e^(-mu*x)', ctx: 'the fraction of a beam transmitted through an absorber of thickness $x$', curve: 'τ against μ for x = 1', fn: 'e^(-x)', xr: [0, 4], yr: [0, 1.1], xl: 'μ (per unit length)', yl: 'transmitted fraction τ' },
        ][which];
        const label = cases.wrt === 'mu' ? t`\mu` : cases.wrt;
        return {
          prompt: t`For ${cases.ctx}, $${cases.name}$, find the sensitivity coefficient $\partial ${cases.name.split(' =')[0]}/\partial ${label}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: cases.xr, y: cases.yr, xlabel: cases.xl, ylabel: cases.yl, xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: cases.fn, color: 'accent', domain: [cases.xr[0] + 1e-3, cases.xr[1]] }] }, caption: `${cases.curve}: the slope is the sensitivity.` },
          answer: cases.ans, answerTeX: cases.ansTeX, vars: cases.vars, wrt: cases.wrt, derivativeOf: cases.f,
          keys: cases.wrt === 'mu' ? [['μ', 'mu']] : [],
          errors: [{ answer: cases.wrong, feedback: 'Check the sign: the result falls as this input grows.' }],
          hints: ['Differentiate with respect to that one variable, treating every other symbol as a constant.', 'Write the variable as a power ($1/R = R^{-1}$, $1/g^{1/2} = g^{-1/2}$) and use the power or chain rule.'],
          teach: 'A sensitivity coefficient is the partial derivative of the result with respect to one input, the others held fixed.',
          explain: t`$\partial f/\partial ${label} = ${cases.ansTeX}$. Its size times $\sigma_{${label}}$ is that input’s contribution to $\sigma_f$.`,
        };
      },
    }),
    num({
      id: 'vsin', difficulty: 2,
      gen(r) {
        const v = r.int(150, 300) / 10, sv = r.pick([0.2, 0.3]), th = r.pick([25, 30, 35, 40, 50]), st = r.pick([0.5, 1.0]);
        const a = th * D2R, f = v * Math.sin(a), c1 = Math.sin(a), c2 = v * Math.cos(a);
        const sf_ = Math.hypot(c1 * sv, c2 * st * D2R);
        return {
          prompt: t`A launch speed $v = ${v.toFixed(1)} \pm ${sv}$ m/s at an angle $\theta = ${th}° \pm ${st}°$ gives a vertical component $v_y = v\sin\theta$. What is the standard uncertainty of $v_y$, in m/s?`,
          visual: budget([{ label: 'from v: sin θ · σv', u: c1 * sv }, { label: 'from θ: v cos θ · σθ', u: c2 * st * D2R }], { combined: false, unit: 'm/s', caption: 'The two contributions, to scale (σθ in radians).' }),
          answer: sf_, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(c1 * sv, c2 * st), feedback: 'The derivative of sin θ is per radian: convert σθ to radians first.' }],
          hints: [t`$\partial v_y/\partial v = \sin\theta$, $\partial v_y/\partial\theta = v\cos\theta$.`, t`$\sigma_\theta = ${st}° = ${(st * D2R).toFixed(5)}$ rad.`],
          teach: 'Sensitivities to angles are per radian, so angle uncertainties must be in radians.',
          explain: t`$\sigma_{v_y} = \sqrt{(${c1.toFixed(3)} \times ${sv})^2 + (${c2.toFixed(2)} \times ${(st * D2R).toFixed(5)})^2} = ${sf_.toFixed(3)}$ m/s.`,
        };
      },
    }),
    num({
      id: 'correlated-diff', difficulty: 3,
      gen(r) {
        const s1 = r.pick([0.04, 0.05, 0.06]), s2 = s1, rho = r.pick([0.5, 0.7, 0.9]);
        const sd = Math.sqrt(s1 ** 2 + s2 ** 2 - 2 * rho * s1 * s2);
        return {
          prompt: t`Two masses are weighed on the same balance, each with standard uncertainty ${s1} g; because they share the balance’s calibration their errors are correlated with $\rho = ${rho}$. What is the standard uncertainty of their **difference**, in g?`,
          visual: stat('mc', { f: 'x - y', x: [52.3, s1], y: [48.9, s2], rho, xname: 'first mass (g)', yname: 'second mass (g)', fname: 'difference (g)', N: 20000, seed: 13, lin: false }, 'Correlated draws of the two masses: the cloud lies along the diagonal.'),
          answer: sd, units: 'g', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(s1, s2), feedback: 'That ignores the correlation. For a difference, the covariance term is subtracted: −2ρσ₁σ₂.' }, { value: Math.sqrt(s1 ** 2 + s2 ** 2 + 2 * rho * s1 * s2), feedback: t`For $f = x - y$ the two partial derivatives have opposite signs, so the covariance term is **subtracted**.` }],
          hints: [t`$\partial f/\partial x = 1$, $\partial f/\partial y = -1$.`, t`$\sigma_f^2 = \sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2$.`],
          teach: 'For a difference, positively correlated errors cancel: the covariance term is subtracted.',
          explain: t`$\sqrt{${s1}^2 + ${s2}^2 - 2(${rho})(${s1})(${s2})} = ${sd.toFixed(4)}$ g — smaller than the $${Math.hypot(s1, s2).toFixed(4)}$ g of independent errors. Weighing by difference is how precision balances beat their own calibration.`,
        };
      },
    }),
    mcq({
      id: 'which-sign', difficulty: 3,
      prompt: t`Two inputs share a calibration factor, so their errors are positively correlated. For which result does that correlation **increase** the uncertainty compared with independent errors?`,
      visual: stat('mc', { f: 'x + y', x: [10, 0.3], y: [10, 0.3], rho: 0.8, xname: 'x', yname: 'y', fname: 'x + y', N: 20000, seed: 15 }, 'Positively correlated draws (ρ = 0.8): high x comes with high y.'),
      choices: [t`The sum $x + y$ (and the product $xy$)`, t`The difference $x - y$`, t`The ratio $x/y$`, 'None: correlation never increases uncertainty'],
      answer: 0,
      why: {
        1: 'In a difference the shared error cancels: both partial derivatives have opposite signs, so the covariance term is subtracted.',
        2: 'In a ratio the shared factor cancels too (∂f/∂x > 0, ∂f/∂y < 0).',
        3: 'When both sensitivities have the same sign, a positive covariance adds to the variance.',
      },
      hints: [t`The covariance term is $2\,c_x c_y\,\sigma_{xy}$. When is $c_x c_y$ positive?`, t`For $x + y$ both $c$ are $+1$; for $x - y$ they are $+1$ and $-1$.`],
      teach: 'Positive correlation adds to the uncertainty when the sensitivities share a sign (sums, products) and cancels when they differ (differences, ratios).',
      explain: t`For $x + y$: $\sigma^2 = \sigma_x^2 + \sigma_y^2 + 2\rho\sigma_x\sigma_y$. A shared calibration error pushes both up together, and a sum carries both pushes. That is also why ratio measurements are favoured in metrology.`,
    }),
    num({
      id: 'shared-scale', difficulty: 3,
      gen(r) {
        const L1 = r.int(1500, 2500) / 1000, L2 = r.int(600, 1200) / 1000, sr = 0.0005, scale = 0.001;
        const R = L1 / L2;
        const sR = R * Math.hypot(sr / L1, sr / L2);
        return {
          prompt: t`Two lengths, $L_1 = ${L1.toFixed(3)}$ m and $L_2 = ${L2.toFixed(3)}$ m, are measured with the same steel tape. Each reading has an independent uncertainty of 0.5 mm, and the tape’s scale may be off by 0.1% (standard uncertainty) — the same factor for both. What is the standard uncertainty of the ratio $L_1/L_2$?`,
          visual: budget([{ label: 'reading of L₁', u: (sr / L1) * R }, { label: 'reading of L₂', u: (sr / L2) * R }, { label: 'tape scale (shared): cancels', u: 0 }], { combined: false, caption: 'Contributions to the ratio’s uncertainty if the shared scale error cancels — does it?' }),
          answer: sR, tol: { rel: 0.02 },
          errors: [{ value: R * Math.hypot(sr / L1, sr / L2, scale, scale), feedback: 'A scale error multiplies both lengths by the same factor, which cancels in the ratio: leave it out (it is fully correlated).' }],
          hints: ['If the tape reads 0.1% long, both lengths are 0.1% long. What happens to their ratio?', t`Only the independent reading errors remain: $\sigma_R/R = \sqrt{(\sigma/L_1)^2 + (\sigma/L_2)^2}$.`],
          teach: 'A fully correlated scale error cancels exactly in a ratio — one reason physicists measure ratios.',
          explain: t`$R = ${R.toFixed(4)}$; $\sigma_R/R = \sqrt{(0.0005/${L1.toFixed(3)})^2 + (0.0005/${L2.toFixed(3)})^2}$, so $\sigma_R = ${tex(sR, 2)}$. In the general formula the scale’s two contributions have opposite signs and $\rho = 1$, so they cancel exactly.`,
        };
      },
    }),
    code({
      id: 'jacobian', difficulty: 3,
      prompt: t`Propagate with a covariance matrix: for $f(x, y) = x\,e^{-y}$ with $x = 4.0 \pm 0.1$, $y = 0.50 \pm 0.02$ and correlation $\rho = 0.3$, build the gradient \`J\` (a length-2 array of the partial derivatives at the means) and the covariance matrix \`C\`, and set \`sigma_f = np.sqrt(J @ C @ J)\`. Print it.`,
      starter: t`import numpy as np

x, sx = 4.0, 0.1
y, sy = 0.50, 0.02
rho = 0.3

J = np.array([0.0, 0.0])                  # [∂f/∂x, ∂f/∂y]
C = np.array([[sx**2, 0.0], [0.0, sy**2]])  # add the covariance
sigma_f = np.sqrt(J @ C @ J)
print(sigma_f)
`,
      answer: t`import numpy as np

x, sx = 4.0, 0.1
y, sy = 0.50, 0.02
rho = 0.3

J = np.array([np.exp(-y), -x * np.exp(-y)])
C = np.array([[sx**2, rho*sx*sy], [rho*sx*sy, sy**2]])
sigma_f = np.sqrt(J @ C @ J)
print(sigma_f)`,
      tests: [
        { name: '`J` holds e⁻ʸ and −x e⁻ʸ', code: 'np.allclose(J, [np.exp(-0.5), -4*np.exp(-0.5)])' },
        { name: '`C` has the covariance ρσₓσᵧ off the diagonal', code: 'np.allclose(C, [[0.01, 0.0006], [0.0006, 0.0004]])' },
        { name: '`sigma_f` matches the general formula', code: 'abs(sigma_f - np.sqrt((np.exp(-0.5)*0.1)**2 + (4*np.exp(-0.5)*0.02)**2 - 2*np.exp(-0.5)*4*np.exp(-0.5)*0.0006)) < 1e-12' },
      ],
      hints: [t`$\partial f/\partial x = e^{-y}$ and $\partial f/\partial y = -x e^{-y}$.`, 'The off-diagonal entries of C are both `rho*sx*sy`.'],
      teach: t`In matrix form the general formula is $\sigma_f^2 = J C J^{\mathsf T}$: the gradient sandwiching the covariance matrix.`,
      explain: t`$J \approx (0.607, -2.43)$; the covariance term is negative here (the sensitivities have opposite signs), so $\sigma_f \approx 0.065$ is below the independent value 0.078. The same line handles any number of inputs.`,
    }),
    mcq({
      id: 'degrees', difficulty: 2, kind: 'error',
      prompt: t`A student propagates $f = \sin\theta$ for $\theta = 30° \pm 2°$ and writes $\sigma_f = \cos 30° \times 2 = 1.73$. What went wrong?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 90], y: [0, 1.1], xlabel: 'θ (degrees)', ylabel: 'sin θ', xticks: 9, yticks: 4, axesAt: 'edge', curves: [{ fn: 'sin(x*pi/180)', color: 'accent' }], shade: [{ fn: 'sin(x*pi/180)', from: 28, to: 32, color: 'gold', alpha: 0.4 }] }, caption: 'Between 28° and 32° (shaded), sin θ changes by only about 0.06.' },
      choices: [t`$\sigma_\theta$ must be in radians: $\sigma_f = \cos 30° \times 0.0349 = 0.030$`, 'They should have used tan instead of cos', t`$\sigma_f$ should be $\sin 2° = 0.035$`, 'Nothing: an uncertainty bigger than 1 is possible for a sine'],
      answer: 0,
      why: {
        1: t`The derivative of $\sin\theta$ is $\cos\theta$, per radian.`,
        2: t`Close in number here, but the rule is $|\cos\theta|\,\sigma_\theta$; $\sin\sigma_\theta$ is not a propagation formula.`,
        3: 'A sine never exceeds 1, so an uncertainty of 1.73 is absurd — a useful sense check.',
      },
      hints: ['Look at the picture: how much does sin θ actually change over ±2°?'],
      teach: 'Convert angle uncertainties to radians before multiplying by a derivative.',
      explain: t`$2° = 0.0349$ rad, so $\sigma_f = 0.866 \times 0.0349 = 0.030$ — consistent with the picture’s change of about 0.06 over ±2°.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-planet', difficulty: 3, transfer: true,
      gen(r) {
        const ra = r.pick([0.1, 0.2, 0.3]), rT = r.pick([0.01, 0.02]), rG = 0.0022;
        const rel = Math.hypot(3 * ra, 2 * rT, rG);
        return {
          prompt: t`A planet’s mass follows from its moon’s orbit: $M = \dfrac{4\pi^2 a^3}{G T^2}$. The orbit’s semi-major axis $a$ is known to ${ra}%, the period $T$ to ${rT}%, and $G$ to 0.0022% (CODATA 2022). What is the relative uncertainty of $M$, as a percentage?`,
          visual: budget([{ label: 'semi-major axis: 3σa/a', u: 3 * ra }, { label: 'period: 2σT/T', u: 2 * rT }, { label: 'G: σG/G', u: rG }], { unit: '%', combined: false, caption: 'The three relative contributions, to scale.' }),
          answer: rel, units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(ra, rT, rG), feedback: 'Multiply each relative uncertainty by its power: a is cubed, T squared.' }, { value: 3 * ra + 2 * rT + rG, feedback: 'Combine independent contributions in quadrature.' }],
          hints: [t`$\partial \ln M = 3\,\partial\ln a - 2\,\partial\ln T - \partial\ln G$.`, t`$\sigma_M/M = \sqrt{(3\sigma_a/a)^2 + (2\sigma_T/T)^2 + (\sigma_G/G)^2}$.`],
          teach: 'For a power law, take logarithmic derivatives: each relative uncertainty times its power, in quadrature.',
          explain: t`$\sqrt{(3 \times ${ra})^2 + (2 \times ${rT})^2 + 0.0022^2}\% = ${rel.toFixed(3)}\%$. The orbit dominates; $G$ is irrelevant here. (For planets the product $GM$ is known far better than either factor — which is why ephemerides use $GM$.)`,
        };
      },
    }),
    num({
      id: 'cp-ratio-rho', difficulty: 3,
      gen(r) {
        const rx = r.pick([1, 2, 3]), ry = r.pick([1, 2, 3]), rho = r.pick([0.4, 0.6, 0.8]);
        const rel = Math.sqrt(rx ** 2 + ry ** 2 - 2 * rho * rx * ry);
        return {
          prompt: t`$f = x/y$, with relative uncertainties ${rx}% in $x$ and ${ry}% in $y$, and correlation $\rho = ${rho}$ between their errors. What is the relative uncertainty of $f$, as a percentage?`,
          visual: stat('mc', { f: 'x/y', x: [1, rx / 100], y: [1, ry / 100], rho, xname: 'x', yname: 'y', fname: 'x/y', N: 20000, seed: 19, lin: false }, 'Correlated draws of x and y, and the ratio they give.'),
          answer: rel, units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(rx, ry), feedback: 'That ignores the correlation.' }, { value: Math.sqrt(rx ** 2 + ry ** 2 + 2 * rho * rx * ry), feedback: 'For a ratio the sensitivities have opposite signs, so the covariance term is subtracted.' }],
          hints: [t`In relative terms, $\partial \ln f/\partial \ln x = 1$ and $\partial \ln f/\partial \ln y = -1$.`, t`$(\sigma_f/f)^2 = r_x^2 + r_y^2 - 2\rho\,r_x r_y$.`],
          teach: 'For a ratio of positively correlated inputs, the covariance term reduces the uncertainty.',
          explain: t`$\sqrt{${rx}^2 + ${ry}^2 - 2(${rho})(${rx})(${ry})}\% = ${rel.toFixed(2)}\%$.`,
        };
      },
    }),
    mcq({
      id: 'cp-when-fail', difficulty: 2,
      prompt: 'When is the general (linearized) formula least trustworthy?',
      visual: { type: 'graph', params: { aspect: 'wide', x: [0.05, 3], y: [0, 12], xlabel: 'x', ylabel: 'f(x) = 1/x', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: '1/x', color: 'accent', domain: [0.08, 3] }, { fn: '1/0.5 - (x - 0.5)/0.25', color: 'gold', dash: [6, 4], domain: [0.2, 0.95] }], shade: [{ fn: '1/x', from: 0.25, to: 0.75, color: 'warn', alpha: 0.2 }] }, caption: 'f = 1/x near x = 0.5 with its tangent line (dashed). Over a wide spread of x (shaded) the tangent is a poor stand-in for the curve.' },
      choices: ['When an input’s uncertainty is large enough that f curves noticeably over its spread', 'When there are more than two inputs', 'When the inputs are correlated', 'When the result is a product'],
      answer: 0,
      why: {
        1: 'The formula handles any number of inputs.',
        2: 'Correlations are exactly what the covariance term is for.',
        3: 'Products are handled exactly to first order; the relative-error rule is a special case.',
      },
      hints: ['The formula replaces f by its tangent plane. When is a tangent a bad approximation?'],
      teach: 'Linear propagation fails when f is visibly curved over the inputs’ spread — then use Monte Carlo.',
      explain: t`Linearization keeps only first derivatives. For $1/x$ with $x = 0.5 \pm 0.25$ the tangent badly misses the curve, the true distribution of $f$ is skewed, and its mean is not $f(\bar x)$. The [Monte Carlo lesson](#/lesson/lab.A3.3) handles such cases.`,
    }),
  ],
  sources: [SRC.gum, SRC.nist, SRC.taylor('ch. 3, 9')],
});
