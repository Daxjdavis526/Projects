// Lab 4 (virtual): projectile range — predict where the ball lands, with an
// uncertainty propagated from the launch speed and angle (by calculus and by
// Monte Carlo), then test the prediction against shots; and the range
// against sin 2θ as a straight line whose slope gives the launch speed.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, compare, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8, D2R = Math.PI / 180;
const range = (v, th, g = G) => (v * v * Math.sin(2 * th * D2R)) / g;
/** σ_R from σ_v (speed) and σ_θ (degrees), by first-order propagation. */
const sigR = (v, sv, th, sth, g = G) => {
  const fromV = 2 * range(v, th, g) * (sv / v);
  const fromTh = ((2 * v * v * Math.cos(2 * th * D2R)) / g) * (sth * D2R);
  return { fromV, fromTh, total: Math.hypot(fromV, fromTh) };
};

// the worked example: predict the 30° range, then ten shots (seed 14)
const EX = (() => {
  const v = 4.2, sv = 0.03, th = 30, sth = 0.5;
  const R = range(v, th), s = sigR(v, sv, th, sth);
  const rows = B.makeData('launcher', { seed: 14, n: 10, at: th }).rows;
  const st = B.stats(rows.map((q) => q.R[0]));
  return { v, sv, th, sth, R, s, rows, st, z: Math.abs(st.mean - R) / Math.hypot(s.total, st.sem) };
})();

/** The R(θ) arch for a launch speed, with optional marked angles. */
const arch = (v, marks = [], caption, extra = {}) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [0, 90], y: [0, +(1.2 * (v * v) / G).toFixed(3)], xlabel: 'launch angle θ (°)', ylabel: 'range R (m)', xticks: 9,
    curves: [{ fn: `${+(v * v / G).toFixed(5)}*sin(2*x*pi/180)`, color: 'accent', domain: [0, 90] }],
    points: marks.map(([th, label]) => ({ x: th, y: +range(v, th).toFixed(4), r: 4.5, color: 'gold', label, labelDx: 8, labelDy: -10 })),
    ...extra,
  },
  caption: caption ?? 'Range against launch angle on level ground, no air drag: an arch, highest at 45°.',
});

export default lesson({
  id: 'phys2210.L.4',
  title: 'Projectile range',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`**This is a virtual experiment.** A spring launcher fires a plastic ball onto a table level with its muzzle, where the ball marks carbon paper. The bench computes each landing point with realistic shot-to-shot variation; it does not include air resistance.

On level ground the range is

$$R = \frac{v_0^2}{g}\,\sin 2\theta$$

A real lab uses this twice. First it **predicts**: measure $v_0$ with photogates, propagate its uncertainty and the angle’s into the prediction, then fire and see whether the landing points agree. Then it **tests the model**: $R$ against $\sin 2\theta$ should be a straight line through the origin whose slope, $v_0^2/g$, gives the launch speed. (Lab skills trained: modelling, and comparing a model with data using uncertainties.)`,
  symbols: [
    { tex: 'R', text: 'the range: horizontal distance from the launch point to the landing mark, in m' },
    { tex: 'v_0', text: 'the launch speed, in m/s, measured by two photogates at the muzzle: here $4.20 \\pm 0.03$ m/s' },
    { tex: '\\theta', text: 'the launch angle above the horizontal, read from the launcher’s protractor to about ±0.5°' },
    { tex: 'g', text: 'the free-fall acceleration, 9.80 m/s² at this bench' },
    { tex: '\\sin 2\\theta', text: 'largest (1) at 45°; complementary angles such as 30° and 60° share the same value, so they land together' },
  ],
  why: 'Predicting an impact point with an honest error ellipse — a sounding-rocket recovery zone, a lunar sample’s landing, an artillery table — is this lab, scaled up.',
  visual: {
    type: 'lab-bench',
    title: 'Fire at eight angles',
    lead: t`One shot at each angle from 10° to 80° is in the table, plotted as $R$ against $\sin 2\theta$ with the least-squares line. Pick an angle and **Take a measurement** to fire again.`,
    tasks: [
      'Switch the plot to R against θ: an arch, symmetric about 45° — 30° and 60° land together.',
      'Back on R against sin 2θ, read v₀ from the readout: it comes from the slope, v₀ = √(g × slope).',
      'Turn on the tape-zero error: every range reads 6 cm short, so the intercept drops to about −0.06 m — but the slope, and v₀, stay put.',
    ],
    params: { exp: 'launcher', seed: 1 },
  },
  example: {
    prompt: t`The photogates give $v_0 = 4.20 \pm 0.03$ m/s and the protractor reads $\theta = 30.0 \pm 0.5^\circ$. Predict the range with its uncertainty, then test the prediction against ten shots: ${EX.rows.map((q) => q.R[0].toFixed(3)).join(', ')} m.`,
    visual: plot('launcher', EX.rows, { repeat: true, caption: 'The ten landing points (dots), their mean with its ±1 SEM bar, and the prediction (green, dashed).' }),
    steps: [
      { label: 'Predict', text: t`$R = \dfrac{(4.20)^2\sin 60^\circ}{9.80} = ${EX.R.toFixed(4)}$ m.` },
      { label: 'Speed’s share', text: t`$R \propto v_0^2$, so $\dfrac{\sigma_R}{R} = 2\dfrac{\sigma_v}{v_0} = 2\times\dfrac{0.03}{4.20} = ${(200 * 0.03 / 4.2).toFixed(2)}\%$: $\pm${EX.s.fromV.toFixed(4)}$ m.` },
      { label: 'Angle’s share', text: t`$\dfrac{\partial R}{\partial\theta} = \dfrac{2v_0^2\cos 2\theta}{g} = ${(2 * 17.64 * 0.5 / G).toFixed(3)}$ m per radian, and $0.5^\circ = ${(0.5 * D2R).toFixed(5)}$ rad: $\pm${EX.s.fromTh.toFixed(4)}$ m. (Always convert the angle’s uncertainty to radians.)` },
      { label: 'Combine', text: t`The two are independent, so they add in quadrature: $\sigma_R = \sqrt{${EX.s.fromV.toFixed(4)}^2 + ${EX.s.fromTh.toFixed(4)}^2} = ${EX.s.total.toFixed(3)}$ m. Prediction: $R = ${pmTeX(EX.R, EX.s.total, t`\text{m}`)}$. The launch speed dominates.` },
      { label: 'Measure', text: t`The ten shots average $\bar R = ${EX.st.mean.toFixed(4)}$ m with $s = ${EX.st.sd.toFixed(4)}$ m, so the standard error is $${EX.st.sem.toFixed(4)}$ m.` },
      { label: 'Compare', text: t`$z = \dfrac{|${EX.st.mean.toFixed(4)} - ${EX.R.toFixed(4)}|}{\sqrt{${EX.s.total.toFixed(3)}^2 + ${EX.st.sem.toFixed(4)}^2}} = ${EX.z.toFixed(2)}$. Well under 2: the shots agree with the prediction. Notice that the *prediction’s* uncertainty, not the measurement’s, sets the size of the test.` },
    ],
    answer: t`Predicted $R = ${pmTeX(EX.R, EX.s.total, t`\text{m}`)}$; measured $${pmTeX(EX.st.mean, EX.st.sem, t`\text{m}`)}$ — in agreement ($z = ${EX.z.toFixed(2)}$).`,
  },
  practice: [
    num({
      id: 'predict', difficulty: 1,
      gen(r) {
        const v = r.pick([3.6, 3.9, 4.2, 4.5, 4.8]), th = r.pick([20, 25, 35, 40, 50, 55, 65, 70]);
        const R = range(v, th);
        return {
          prompt: t`A launcher fires at $v_0 = ${v.toFixed(2)}$ m/s and $\theta = ${th}^\circ$ onto a table level with its muzzle. Ignoring air resistance, where does the ball land?`,
          answer: R, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (v * v * Math.sin(th * D2R)) / G, feedback: t`The range has $\sin 2\theta$, not $\sin\theta$: it comes from $2\sin\theta\cos\theta$, the time of flight times the horizontal speed.` }, { value: (v * Math.sin(2 * th * D2R)) / G, feedback: t`Square the speed: $R = v_0^2\sin 2\theta/g$.` }],
          hints: [t`$R = \dfrac{v_0^2}{g}\sin 2\theta$, with $2\theta = ${2 * th}^\circ$.`],
          teach: 'On level ground with no drag, R = v₀² sin 2θ / g.',
          explain: t`$R = \dfrac{${v.toFixed(2)}^2 \sin ${2 * th}^\circ}{9.80} = ${R.toFixed(3)}$ m.`,
          visual: apparatus('launcher', { at: th, params: { v0: v } }, `The launcher at ${th}°. Not to scale.`),
        };
      },
    }),
    num({
      id: 'speed-share', difficulty: 2,
      gen(r) {
        const v = r.pick([3.8, 4.2, 4.6]), sv = r.pick([0.02, 0.03, 0.05]), th = r.pick([25, 30, 35, 55, 60]);
        const R = range(v, th), s = 2 * R * (sv / v);
        return {
          prompt: t`The photogates give $v_0 = ${v.toFixed(2)} \pm ${sv}$ m/s. At $\theta = ${th}^\circ$ the predicted range is $${R.toFixed(3)}$ m. How much uncertainty does the speed alone contribute to the prediction?`,
          answer: +s.toPrecision(3), units: 'm', tol: { rel: 0.03 },
          errors: [{ value: R * (sv / v), feedback: t`$R \propto v_0^2$: squaring doubles the relative uncertainty, $\sigma_R/R = 2\,\sigma_v/v_0$.` }, { value: 2 * sv, feedback: 'Relative uncertainties carry through a product or power; absolute ones do not. Work with σᵥ/v₀.' }],
          hints: [t`For $R \propto v_0^2$: $\sigma_R/R = 2\,\sigma_v/v_0$.`],
          teach: 'A squared input doubles its relative uncertainty in the result.',
          explain: t`$\sigma_R = 2R\,\sigma_v/v_0 = 2(${R.toFixed(3)})(${sv}/${v.toFixed(2)}) = ${s.toFixed(4)}$ m — a ${(200 * sv / v).toFixed(1)}% uncertainty from a ${(100 * sv / v).toFixed(1)}% one in the speed.`,
          visual: apparatus('launcher', { at: th, params: { v0: v } }, `The launcher at ${th}°. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'flat-at-45', difficulty: 3,
      prompt: t`Set at 30°, a ±1° error in the launch angle moves the landing point by about 3 cm. Set at 45°, the same ±1° error moves it by only about a millimetre. Why?`,
      choices: [
        t`At 45° the range is at its maximum, so $\partial R/\partial\theta \propto \cos 2\theta = 0$: small angle errors barely change it, to first order`,
        t`At 45° the protractor is easier to read accurately`,
        t`Because $\sin 90^\circ = 1$ is an exact number, it has no uncertainty`,
        'The angle never matters in projectile motion; only the speed does',
      ],
      answer: 0,
      why: {
        1: 'The protractor is no better at 45°; the physics is. The question gives the same ±1° error at both angles.',
        2: t`The angle still has its ±1° uncertainty; what changes is how strongly $R$ responds to it — the slope of the arch.`,
        3: t`At 30° a 1° error moves the ball by 3 cm: the angle matters wherever $\cos 2\theta \neq 0$.`,
      },
      hints: [t`Uncertainty propagates through the derivative: $\sigma_R = |\partial R/\partial\theta|\,\sigma_\theta$.`, t`$\partial R/\partial\theta = \dfrac{2v_0^2}{g}\cos 2\theta$. What is $\cos 90^\circ$?`],
      teach: 'An input’s uncertainty matters in proportion to the derivative of the result with respect to it — zero at a maximum.',
      explain: t`$\partial R/\partial\theta = (2v_0^2/g)\cos 2\theta$: about 1.8 m per radian at 30°, so 1° (0.0175 rad) gives 3 cm; zero at 45°, where the range is flat at its peak. What is left there is second order: $\tfrac12|R''|\sigma_\theta^2 \approx 2R\,(0.0175)^2 \approx 1$ mm, and always a *shortening*.`,
      visual: arch(4.2, [[30, '30°: steep'], [45, '45°: flat']], 'Range against angle for v₀ = 4.20 m/s: steep at 30°, flat at the top.'),
    }),
    num({
      id: 'v0-from-slope', difficulty: 2,
      gen(r) {
        const rows = B.makeData('launcher', { seed: r.int(1, 999999) }).rows;
        const f = B.analyse('launcher', rows, {}).series[0].fit;
        const s = +f.b.toFixed(3);
        return {
          prompt: t`The least-squares line of $R$ against $\sin 2\theta$ has slope $${s.toFixed(3)}$ m. What launch speed does it give?`,
          answer: Math.sqrt(G * s), units: 'm/s', tol: { rel: 0.003 },
          errors: [{ value: G * s, feedback: t`The slope is $v_0^2/g$: take the square root of $g\times$slope.` }, { value: Math.sqrt(s / G), feedback: t`Slope $= v_0^2/g$, so $v_0^2 = g\times$slope — multiply by $g$, do not divide.` }],
          hints: [t`$R = \dfrac{v_0^2}{g}\sin 2\theta$: the slope is $v_0^2/g$.`],
          teach: 'The slope of R against sin 2θ is v₀²/g, so v₀ = √(g × slope).',
          explain: t`$v_0 = \sqrt{9.80\times${s.toFixed(3)}} = ${Math.sqrt(G * s).toFixed(3)}$ m/s — compare with the photogates’ $4.20 \pm 0.03$ m/s.`,
          visual: plot('launcher', rows, { caption: 'R against sin 2θ with the least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'complementary', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[25, 65], [20, 70], [30, 60], [35, 55]]);
        const rows = B.makeData('launcher', { seed: r.int(1, 999999), settings: [a, b] }).rows;
        return {
          prompt: t`Your shots at ${a}° and ${b}° land within a few centimetres of each other, near ${rows[0].R[0].toFixed(2)} m. A classmate says the launcher’s angle scale must be broken. Is it?`,
          choices: [
            t`No: $\sin(2\times${a}^\circ) = \sin(2\times${b}^\circ)$, so complementary angles have the same range on level ground`,
            'Yes: a steeper launch always goes further',
            'Yes: a shallower launch always goes further',
            'No: every angle gives the same range',
          ],
          answer: 0,
          why: {
            1: t`The steeper shot is faster upward and stays up longer, but it moves forward more slowly; on level ground the two effects exactly balance for angles adding to 90°.`,
            2: 'Shallower shots move forward faster but come down sooner. Range peaks at 45°, between the two.',
            3: t`The range varies from zero (0° and 90°) to $v_0^2/g$ (45°).`,
          },
          hints: [t`$R \propto \sin 2\theta$. Compare $\sin ${2 * a}^\circ$ and $\sin ${2 * b}^\circ$.`],
          teach: 'On level ground θ and 90° − θ give the same range, because sin 2θ = sin(180° − 2θ).',
          explain: t`$\sin ${2 * a}^\circ = \sin ${2 * b}^\circ = ${Math.sin(2 * a * D2R).toFixed(3)}$. The ${b}° shot flies higher and longer; both land at the same spot (within the shot-to-shot scatter).`,
          visual: plot('launcher', B.makeData('launcher', { seed: 1 }).rows, { axes: 'raw', fit: false, caption: 'Ranges against launch angle for one shot at each of eight angles.' }),
        };
      },
    }),
    num({
      id: 'combined-z', difficulty: 3,
      gen(r) {
        const th = r.pick([25, 30, 35, 55, 60]);
        const R = range(4.2, th), s = sigR(4.2, 0.03, th, 0.5).total;
        const sys = r.bool(0.4) ? 'zero' : null;
        let rows, st, m, sem;
        do {
          rows = B.makeData('launcher', { seed: r.int(1, 999999), n: 10, at: th, sys }).rows;
          st = B.stats(rows.map((q) => q.R[0])); m = +st.mean.toFixed(3); sem = +st.sem.toPrecision(2);
        } while (Math.abs(m - R) < 0.006);
        const sp = +s.toPrecision(2);
        const z = Math.abs(m - R) / Math.hypot(sp, sem), zSem = Math.abs(m - R) / sem, zLin = Math.abs(m - R) / (sp + sem);
        const apart = (w) => Math.abs(w - z) > 0.05 + 0.05 * z;
        return {
          prompt: t`At ${th}°, the prediction is $R = ${R.toFixed(3)} \pm ${sp}$ m. Ten shots average $${m.toFixed(3)} \pm ${sem}$ m (mean ± SEM). How many combined standard uncertainties apart are they?`,
          answer: +z.toPrecision(3), tol: { rel: 0.03, abs: 0.03 },
          errors: [
            apart(zSem) && { value: zSem, feedback: 'The prediction is uncertain too. Combine both uncertainties in quadrature before dividing.' },
            apart(zLin) && { value: zLin, feedback: 'Independent uncertainties combine in quadrature, √(a² + b²), not by adding.' },
          ].filter(Boolean),
          hints: ['Both numbers are uncertain: the prediction through v₀ and θ, the measurement through the shot-to-shot scatter.', t`$z = |\bar R - R_\text{pred}|/\sqrt{\sigma_\text{pred}^2 + \sigma_{\bar R}^2}$.`],
          teach: 'Testing a prediction against a measurement uses both uncertainties, combined in quadrature.',
          explain: t`$z = |${m.toFixed(3)} - ${R.toFixed(3)}|/\sqrt{${sp}^2 + ${sem}^2} = ${z.toFixed(2)}$: ${z <= 2 ? 'agreement.' : 'a real discrepancy — look for a systematic error (here, where the tape measure starts).'}`,
          visual: compare([{ v: R, s: sp, label: 'predicted' }, { v: m, s: sem, label: 'measured (mean ± SEM)' }], { xlabel: 'R (m)', caption: 'Prediction and measurement with ±1σ (solid) and ±2σ (dashed) bars.' }),
        };
      },
    }),
    code({
      id: 'monte-carlo', difficulty: 3,
      gen(r) {
        const th = r.pick([25, 30, 35, 40]);
        const R = range(4.2, th), s = sigR(4.2, 0.03, th, 0.5).total;
        const head = t`import numpy as np

rng = np.random.default_rng(1)
N = 200_000
g = 9.80
v0 = rng.normal(4.20, 0.03, N)                          # m/s: 200 000 plausible launch speeds
theta = np.radians(rng.normal(${th}.0, 0.5, N))           # and launch angles (±0.5°)
`;
        return {
          prompt: t`**Monte Carlo propagation.** Instead of differentiating, draw 200 000 plausible launch speeds and angles from their uncertainties, compute the range of every one, and look at the spread. Complete the program so that \`R\` holds every simulated range, \`R_mean\` their mean and \`sigma_R\` their standard deviation.`,
          starter: t`${head}
# the range of every simulated shot, then its mean and spread
R = 0 * v0
R_mean = 0.0
sigma_R = 0.0
print(R_mean, sigma_R)
`,
          answer: t`${head}
R = v0**2 * np.sin(2 * theta) / g
R_mean = R.mean()
sigma_R = R.std(ddof=1)
print(f"R = {R_mean:.4f} ± {sigma_R:.4f} m")
`,
          tests: [
            { name: 'R holds the range of every simulated shot', code: 'len(R) == N and abs(R[7] - v0[7]**2 * np.sin(2 * theta[7]) / g) < 1e-12' },
            { name: `the mean simulated range is near the predicted ${R.toFixed(3)} m`, code: `abs(R_mean - ${R}) < 0.002` },
            { name: `the spread of the simulated ranges matches first-order propagation (${s.toFixed(4)} m) to 3%`, code: `abs(sigma_R - ${s}) < 0.03 * ${s}` },
          ],
          hints: [t`NumPy works on whole arrays: \`v0**2 * np.sin(2 * theta) / g\` computes all 200 000 ranges at once.`, t`\`R.mean()\` and \`R.std(ddof=1)\`.`],
          teach: 'Monte Carlo propagation pushes many random draws of the inputs through the formula and reads the uncertainty off the spread of the results.',
          explain: t`The spread of the simulated ranges, about $${s.toFixed(3)}$ m, matches the calculus result — as it should when the uncertainties are small. Monte Carlo earns its keep where calculus fails: large uncertainties, or a maximum such as 45°, where it shows the range only ever gets *shorter*.`,
          visual: arch(4.2, [[th, `${th}°`]], 'Every simulated shot lands somewhere near this point on the arch.'),
        };
      },
    }),
    mcq({
      id: 'mc-at-45', difficulty: 3,
      prompt: t`At $\theta = 45.0 \pm 2.0^\circ$, first-order propagation says the angle contributes **nothing** to the range’s uncertainty. A Monte Carlo run says the angle makes the average range about 4 mm *shorter* than $v_0^2/g$. Which is right?`,
      choices: [
        t`The Monte Carlo: 45° is the top of the arch, so any angle error, either way, shortens the range — a second-order effect that first-order propagation cannot see`,
        'First-order propagation: random numbers are not reliable enough to trust',
        'Neither: the angle cannot affect the range at 45°',
        'The Monte Carlo, because the angle error makes the ball go further on average',
      ],
      answer: 0,
      why: {
        1: 'With enough draws a Monte Carlo is exact for the model you give it. First-order propagation is the approximation here.',
        2: t`The derivative is zero at 45°, but the curvature is not: $R(45^\circ \pm \delta) < R(45^\circ)$ for any $\delta$.`,
        3: 'Every angle other than 45° gives a *shorter* range, so the average can only fall.',
      },
      hints: ['What shape is R(θ) near 45°?', t`Expand to second order: $R \approx R_\text{max}\left(1 - 2\,\delta\theta^2\right)$ with $\delta\theta$ in radians.`],
      teach: 'Near a maximum or minimum, first-order propagation fails; Monte Carlo (or a second-order expansion) captures the one-sided effect.',
      explain: t`$\sin 2\theta \approx 1 - 2\,\delta\theta^2$, so the mean shortening is $2R\langle\delta\theta^2\rangle = 2(1.80)(0.0349)^2 \approx 4$ mm for a 2° spread. Linear propagation, built from the slope alone, sees zero.`,
      visual: arch(4.2, [[45, 'peak']], 'Near the top, the arch is flat: both sides lie below the peak.', { shade: [{ fn: `${+(4.2 * 4.2 / G).toFixed(5)}*sin(2*x*pi/180)`, from: 41, to: 49, color: 'gold', alpha: 0.3 }] }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const rows = B.makeData('launcher', { seed: r.int(1, 999999), params: { g: 3.71 } }).rows;
        const f = B.analyse('launcher', rows, { params: { g: 3.71 } }).series[0].fit;
        const s = +f.b.toFixed(2);
        return {
          prompt: t`A Mars lander carries the same launcher ($v_0 = 4.20$ m/s, from its photogates) and fires a test ball at eight angles. The least-squares slope of $R$ against $\sin 2\theta$ is $${s.toFixed(2)}$ m. What is $g$ on Mars?`,
          answer: (4.2 * 4.2) / s, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: s / (4.2 * 4.2), feedback: t`Slope $= v_0^2/g$, so $g = v_0^2/\text{slope}$ — speed squared on top.` }, { value: 4.2 / s, feedback: t`Square the launch speed: slope $= v_0^2/g$.` }],
          hints: [t`The slope of $R$ against $\sin 2\theta$ is $v_0^2/g$.`, t`$g = v_0^2/\text{slope} = 4.20^2/${s.toFixed(2)}$.`],
          teach: 'The same linearization works in reverse: knowing v₀, the slope measures g.',
          explain: t`$g = 4.20^2/${s.toFixed(2)} = ${((4.2 * 4.2) / s).toFixed(2)}\ \text{m/s}^2$ — Mars’s surface gravity is about 3.71 m/s², 38% of Earth’s, so the same launcher throws 2.6 times as far.`,
          visual: plot('launcher', rows, { params: { g: 3.71 }, caption: 'R against sin 2θ on Mars, with the least-squares line (illustrative).' }),
        };
      },
    }),
    mcq({
      id: 'cp-dominant', difficulty: 2,
      prompt: t`Your 30° prediction’s uncertainty budget: launch speed ±2.2 cm, launch angle ±1.6 cm, tape measure ±0.2 cm, the local $g$ ±0.08 cm. What would most improve the prediction?`,
      choices: ['Measuring the launch speed more precisely', 'A better tape measure', 'Using a more precise value of g', 'Firing more shots'],
      answer: 0,
      why: {
        1: 'The tape contributes ±0.2 cm, ten times less than the speed: improving it changes the total by almost nothing.',
        2: 'g contributes ±0.08 cm — negligible already.',
        3: 'More shots shrink the *measured* mean’s uncertainty, not the *prediction’s*; the prediction depends on v₀ and θ.',
      },
      hints: ['Independent contributions add in quadrature, so the largest dominates the total.'],
      teach: 'In a quadrature sum the largest term dominates, so improve the biggest contribution first.',
      explain: t`$\sqrt{2.2^2 + 1.6^2 + 0.2^2 + 0.08^2} = 2.7$ cm; halving the speed’s term gives $\sqrt{1.1^2 + 1.6^2 + 0.2^2 + 0.08^2} = 2.0$ cm, while a perfect tape would leave 2.7 cm.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4.4], y: [0, 2.6], xlabel: ' ', ylabel: 'contribution (cm)', xticks: 0.001, shade: [[0.3, 2.2, 'accent'], [1.3, 1.6, 'violet'], [2.3, 0.2, 'teal'], [3.3, 0.08, 'gold']].map(([x, h, c]) => ({ fn: String(h), from: x, to: x + 0.7, color: c, alpha: 0.8 })), points: [[0.3, 2.2, 'speed'], [1.3, 1.6, 'angle'], [2.3, 0.2, 'tape'], [3.3, 0.08, 'g']].map(([x, h, l]) => ({ x, y: +(h + 0.15).toFixed(2), r: 0.01, color: 'ink2', label: l })) }, caption: 'The uncertainty budget of the prediction, to scale.' },
    }),
    num({
      id: 'cp-propagate', difficulty: 3,
      gen(r) {
        let v, sv, th, sth, s;
        do {
          v = r.pick([3.8, 4.2, 4.6]); sv = r.pick([0.02, 0.03, 0.04]); th = r.pick([20, 25, 30, 60, 65, 70]); sth = r.pick([0.5, 1.0]);
          s = sigR(v, sv, th, sth);
        } while (Math.min(s.fromV, s.fromTh) / Math.max(s.fromV, s.fromTh) < 0.45);
        const R = range(v, th);
        return {
          prompt: t`Predict the uncertainty of the range for $v_0 = ${v.toFixed(2)} \pm ${sv}$ m/s and $\theta = ${th} \pm ${sth.toFixed(1)}^\circ$ on level ground (predicted $R = ${R.toFixed(3)}$ m).`,
          answer: +s.total.toPrecision(3), units: 'm', tol: { rel: 0.03 },
          errors: [
            { value: s.fromV + s.fromTh, feedback: 'The two contributions are independent: add them in quadrature, not linearly.' },
            { value: s.fromV, feedback: 'That is the speed’s share only. The angle contributes too: ∂R/∂θ = (2v₀²/g) cos 2θ.' },
            { value: Math.hypot(s.fromV, s.fromTh / D2R), feedback: 'The angle’s uncertainty must be in radians when it multiplies a derivative per radian.' },
          ],
          hints: [t`Speed: $\sigma_R = 2R\,\sigma_v/v_0$. Angle: $\sigma_R = \left|\dfrac{2v_0^2\cos 2\theta}{g}\right|\sigma_\theta$, with $\sigma_\theta$ in radians.`, t`Combine: $\sigma_R = \sqrt{(\text{speed’s share})^2 + (\text{angle’s share})^2}$.`],
          teach: 'Propagate each independent input through its partial derivative, then add the contributions in quadrature.',
          explain: t`Speed: $${s.fromV.toFixed(4)}$ m. Angle: $(2v_0^2|\cos ${2 * th}^\circ|/g)(${sth}\times\pi/180) = ${s.fromTh.toFixed(4)}$ m. Together: $\sqrt{${s.fromV.toFixed(4)}^2 + ${s.fromTh.toFixed(4)}^2} = ${s.total.toFixed(4)}$ m.`,
          visual: arch(v, [[th, `${th}°`]], `Range against angle for v₀ = ${v.toFixed(2)} m/s: the slope at ${th}° sets how much the angle’s uncertainty matters.`),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (propagation, including the general formula)'),
    { label: 'JCGM 101:2008 — Propagation of distributions using a Monte Carlo method (GUM Supplement 1)', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf' },
    SOURCES.openstax('4.3', '4-3-projectile-motion', 'Projectile motion'),
    { label: 'NASA, Mars Fact Sheet (surface gravity 3.71 m/s²)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html' },
    SOURCES.aapt,
  ],
});
