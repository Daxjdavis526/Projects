// The Cavendish torsion balance — the lab view: a light spot recorded for
// 45 minutes after the large spheres are swung, fitted by a damped swing
// (Levenberg–Marquardt) rather than waited out; the fibre's period as its own
// calibration; G = π²b²dΔS/(MLT₀²) with the far-sphere correction 1/(1 − β);
// the drift of the fibre's zero as the systematic a fit term absorbs; an
// uncertainty budget dominated by the geometry; G's own troubled state.
// The Earth's mass from GM and G as the transfer. Every number is computed
// from the seeded model the labe-rig simulation draws with (_labe.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, SIMNOTE, SRC } from './_labe.js';
import { budget } from './_unc.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.cavendish.defaults;
const G = M.K.G, uG = M.K.uG;
const beta0 = M.farBeta(P0);
const TAU = 2 * Math.PI;

// ── the worked example: seed 3 ──
const EX = M.run('cavendish', { seed: 3 });
const [S1, S2, tauM, TdM, Dr] = EX.fit.p;
const sp = EX.fit.sp;
const EXG = EX.results[0], EXdS = EX.results[1], EXT0 = EX.results[2];
const ND = M.analyse('cavendish', EX.rows, { flags: { fitdrift: false } });
const thetaEq = (P, Gv = G) => (Gv * P.M * P.T0 ** 2) / (4 * Math.PI ** 2 * P.d * P.b ** 2);
// a Type B budget for the geometry (illustrative tolerances)
const BUD = [
  { label: 'fit (statistical)', u: 100 * EXG.sigma / EXG.value },
  { label: 'b: sphere centres ±0.5 mm (×2)', u: 100 * 2 * 0.5 / 46.5 },
  { label: 'd: beam half-length ±0.5 mm', u: 100 * 0.5 / 50 },
  { label: 'L: mirror to scale ±1 cm', u: 100 * 0.01 / 5 },
];

export default lesson({
  id: 'lab.E.7',
  title: 'The Cavendish torsion balance',
  minutes: 20, difficulty: 4,
  lab: true,
  intro: t`In 1798 Henry Cavendish hung a beam with two small lead spheres from a thin wire and brought two large spheres close to them. The gravitational pull — in a teaching balance less than a billionth of a newton — twisted the beam until the wire’s torque balanced it. From the twist and the wire’s stiffness, which the beam’s own swing measures, he “weighed the Earth”; we read the same experiment as a measurement of $G$. A mirror on the beam throws a light spot onto a scale metres away; swinging the large spheres to the other side moves the spot’s equilibrium by $\Delta S$. **The swing takes hours to settle, so you fit it instead of waiting** — and the fit must allow for the wire’s slow drift.`,
  equation: t`G = \frac{\pi^2 b^2 d\,\Delta S}{M L T_0^2}\cdot\frac{1}{1 - \beta}, \qquad \beta = \frac{b^3}{\bigl(b^2 + 4d^2\bigr)^{3/2}}`,
  symbols: [
    { tex: 'G', text: 'the gravitational constant, CODATA 2022: $(6.674\\,30 \\pm 0.000\\,15)\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\,\\text{s}^{-2}$ — the least precisely known fundamental constant' },
    { tex: 'b', text: 'the centre-to-centre distance from each large sphere to the small sphere beside it, in m' },
    { tex: 'd', text: 'half the beam’s length: the lever arm of each small sphere about the wire, in m' },
    { tex: '\\Delta S', text: 'the shift of the spot’s equilibrium on the scale between the two positions of the large spheres, in m' },
    { tex: 'M', text: 'the mass of each large sphere, in kg' },
    { tex: 'L', text: 'the distance from the mirror to the scale, in m; the reflection doubles the turn, and the two positions double it again, so $\\Delta S = 4L\\theta$' },
    { tex: 'T_0', text: 'the beam’s undamped period of oscillation, in s: it measures the wire’s stiffness against the beam’s moment of inertia' },
    { tex: '\\beta', text: 'the far-sphere factor: each large sphere also pulls, weakly and the other way, on the farther small sphere' },
  ],
  why: t`Fitting a transient instead of waiting for equilibrium — with a model that includes the drift — is how slow experiments from torsion pendulums to thermal measurements get done in a day.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: the light spot after the spheres are swung',
    lead: t`At $t = 0$ the large spheres were swung across; the spot, at rest at $S_1$, swings toward its new equilibrium $S_2$. The record is a reading every 30 s for 45 minutes; the gold curve is a damped-oscillation fit, and the readout turns it into $G$. The top view shows the beam’s turn, exaggerated.`,
    tasks: [
      'Switch off “Fit a drift term”: the fit can no longer absorb the creeping zero — χ²/ν rises toward 8, the residuals show a slow trend, and G falls by about 3σ.',
      'Switch off “Correct for the far sphere”: G drops by 7.5%, β = 0.075, with the fit unchanged — a geometry correction no statistic can reveal.',
      'Clear the table and record only the first 15 minutes (30 readings): G is still found, with a larger σ — no need to wait for the swing to die out.',
    ],
    params: { exp: 'cavendish', seed: 1, residuals: true },
    caption: t`Simulated spot readings ($\sigma = 0.2$ cm): $M = 1.5$ kg, $d = 50$ mm, $b = 46.5$ mm, $T_0 = 10$ min, damping time 25 min, $L = 5.0$ m, drift 0.04 cm/min (illustrative values, typical of teaching balances). The model treats the beam as massless and the spheres as points. ${SIMNOTE}`,
  },
  example: {
    prompt: t`The spheres are swung at $t = 0$ and the spot is read every 30 s for 45 min ($\sigma = 0.2$ cm). Fit $S(t) = S_2 + (S_1 - S_2)\,e^{-t/\tau}\bigl[\cos\omega_d t + \sin(\omega_d t)/(\omega_d\tau)\bigr] + Dt$ — a damped swing released from rest at $S_1$, plus a drift $D$ — and find $G$. Geometry: $M = 1.5$ kg, $d = 50.0$ mm, $b = 46.5$ mm, $L = 5.00$ m.`,
    visual: rigPlot('cavendish', { seed: 3 }, t`The 91 readings, the five-parameter fit, and its residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Fit', text: t`Starting from guesses read off the plot (the first and last readings, a period of about 10 min), Levenberg–Marquardt ([nonlinear fits](#/lesson/lab.A5.3)) converges to $S_1 = ${pmT(S1, sp[0])}$ cm, $S_2 = ${pmT(S2, sp[1])}$ cm, $\tau = ${pmT(tauM, sp[2])}$ min, $T_d = 2\pi/\omega_d = ${pmT(TdM, sp[3])}$ min and $D = ${pmT(Dr, sp[4])}$ cm/min, with $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ ($\nu = ${EX.fit.dof}$).` },
      { label: 'Shift', text: t`$\Delta S = S_1 - S_2 = ${resT(EXdS)}$ cm — its σ from the fit’s covariance, since $S_1$ and $S_2$ are correlated.` },
      { label: 'Undamped period', text: t`The wire’s stiffness is $\kappa = I\omega_0^2$ with $\omega_0^2 = \omega_d^2 + 1/\tau^2$: $T_0 = ${resT(EXT0)}$ min — only slightly shorter than $T_d$, but it enters squared.` },
      { label: 'Twist', text: t`Torque balance, $2d \cdot GMm/b^2 = \kappa\theta$ with $\kappa = 2md^2\omega_0^2$, gives $\theta = GMT_0^2/(4\pi^2 db^2)$; the light lever turns it into $\Delta S = 4L\theta$. The small mass $m$ cancels.` },
      { label: 'G', text: t`$G = \pi^2b^2d\,\Delta S/(MLT_0^2) = ${tex(EXG.value * (1 - beta0), 4)}$, then divide by $1 - \beta$ with $\beta = b^3/(b^2 + 4d^2)^{3/2} = ${beta0.toFixed(4)}$: $G = (${resT(EXG)})\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$.` },
      { label: 'Without the drift term', text: t`Fitting the same data with $D = 0$ gives $\chi^2/\nu = ${ND.fit.chi2r.toFixed(1)}$ and $G = ${tex(ND.results[0].value, 4)}$ — biased by $${((ND.results[0].value - EXG.value) / EXG.sigma).toFixed(1)}\sigma$. The creeping zero pulls $S_2$, and with it $\Delta S$.` },
      { label: 'Budget', text: t`The fit’s $${(100 * EXG.sigma / EXG.value).toFixed(2)}\%$ is not the whole story: $b$ enters squared, so a 0.5 mm uncertainty in where the spheres’ centres are adds $2.2\%$. In quadrature with $d$ and $L$, about $${Math.sqrt(BUD.reduce((s, x) => s + x.u ** 2, 0)).toFixed(1)}\%$. Against CODATA, $z = ${((EXG.value - G) / (EXG.value * Math.sqrt(BUD.reduce((s, x) => s + x.u ** 2, 0)) / 100)).toFixed(2)}$ with the full budget.` },
    ],
    answer: t`$G = (${pmT(EXG.value / 1e-11, (EXG.value * Math.sqrt(BUD.reduce((s, x) => s + x.u ** 2, 0)) / 100) / 1e-11)})\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$ with the geometry’s Type B terms (fit alone: $\pm ${(EXG.sigma / 1e-11).toFixed(3)}$).`,
  },
  practice: [
    num({
      id: 'theta', difficulty: 2,
      gen(r) {
        const Mv = r.pick([1.0, 1.5, 2.0]), T0 = r.pick([480, 600, 720]), d = r.pick([0.045, 0.050]), b = r.pick([0.045, 0.0465, 0.050]);
        const ans = thetaEq({ M: Mv, T0, d, b }) * 1000;
        return {
          prompt: t`A torsion balance has large spheres of $${Mv}$ kg at $b = ${(b * 1000).toFixed(1)}$ mm from small spheres on a beam of half-length $d = ${(d * 1000).toFixed(0)}$ mm; its period is $T_0 = ${T0}$ s. Ignoring the far sphere, what is the equilibrium twist $\theta = GMT_0^2/(4\pi^2db^2)$? Answer in mrad.`,
          visual: rigRaw('cavendish', { seed: 1, settings: [0] }, 'Top view of the balance, the beam’s turn exaggerated ×10.'),
          answer: ans, units: 'mrad', tol: { rel: 0.005 },
          errors: [{ value: ans * 1e3, feedback: 'That is in microradians: 1 mrad = 10⁻³ rad.' }],
          hints: [t`$\theta = GMT_0^2/(4\pi^2 d b^2)$ with $G = 6.674\times10^{-11}$ in SI.`, 'Keep everything in metres, kilograms and seconds; then convert radians to milliradians.'],
          teach: 'The small spheres’ mass cancels: the wire’s stiffness is measured by the same beam’s period.',
          explain: t`$\theta = (6.674\times10^{-11})(${Mv})(${T0})^2/(4\pi^2 \times ${d} \times ${b}^2) = ${tex(ans / 1000, 3)}$ rad $= ${ans.toFixed(2)}$ mrad — about half a degree.`,
        };
      },
    }),
    num({
      id: 'spot', difficulty: 1,
      gen(r) {
        const th = r.float(6, 11, 0.1), L = r.pick([3.0, 4.0, 5.0, 6.0]);
        const ans = 4 * L * th * 1e-3 * 100;
        return {
          prompt: t`The beam turns $\theta = ${th.toFixed(1)}$ mrad from its centre position each way. With the scale $L = ${L.toFixed(1)}$ m from the mirror, how far does the spot’s equilibrium move between the two positions of the large spheres? Answer in cm.`,
          visual: rigRaw('cavendish', { seed: 2, settings: [2] }, 'Top view: the mirror sits on the fibre, at the beam’s centre (turn exaggerated).'),
          answer: ans, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: 'A mirror turned by θ turns the reflected beam by 2θ — and the spheres swing from +θ to −θ, doubling it again: 4Lθ.' }, { value: ans / 4, feedback: 'Two doublings: the reflection (2θ) and the two positions (+θ to −θ). ΔS = 4Lθ.' }],
          hints: ['Turning a mirror by θ turns its reflection by 2θ.', 'The equilibrium goes from +θ to −θ: a change of 2θ in the mirror, 4θ in the beam of light.'],
          teach: t`The light lever multiplies: $\Delta S = 4L\theta$.`,
          explain: t`$\Delta S = 4 \times ${L.toFixed(1)}\ \text{m} \times ${tex(th * 1e-3, 3)} = ${ans.toFixed(1)}$ cm — big enough to read by eye with millimetre marks.`,
        };
      },
    }),
    num({
      id: 'beta', difficulty: 2,
      gen(r) {
        const b = r.pick([0.040, 0.0465, 0.050, 0.060]), d = r.pick([0.050, 0.060, 0.080]);
        const ans = 100 * (b ** 3 / (b * b + 4 * d * d) ** 1.5);
        return {
          prompt: t`With sphere centres $b = ${(b * 1000).toFixed(1)}$ mm apart and a beam of half-length $d = ${(d * 1000).toFixed(0)}$ mm, by what percentage does the far large sphere’s pull reduce the torque, $\beta = b^3/(b^2 + 4d^2)^{3/2}$?`,
          visual: rigRaw('cavendish', { seed: 3, settings: [5] }, 'Top view: each large sphere sits beside one small sphere and diagonally across from the other.'),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * (b ** 2 / (b * b + 4 * d * d)), feedback: t`Two pieces: the far sphere is $\sqrt{b^2 + 4d^2}$ away, so its force is weaker by $b^2/(b^2 + 4d^2)$, and only the component $b/\sqrt{b^2 + 4d^2}$ is perpendicular to the beam.` }],
          hints: [t`The far sphere is a distance $\sqrt{b^2 + (2d)^2}$ away.`, 'Its force is weaker by the inverse square, and only its perpendicular component makes torque.'],
          teach: 'A geometry correction no fit can find: each large sphere pulls back, weakly, on the far small sphere.',
          explain: t`$\beta = ${(b * 1000).toFixed(1)}^3/(${(b * 1000).toFixed(1)}^2 + 4 \times ${(d * 1000).toFixed(0)}^2)^{3/2} = ${ans.toFixed(2)}\%$. Leaving it out makes $G$ low by that much.`,
        };
      },
    }),
    num({
      id: 'G', difficulty: 3,
      gen(r) {
        const dS = r.float(14, 18, 0.01), T0 = r.float(9.5, 10.5, 0.01);
        const ans = (Math.PI ** 2 * P0.b ** 2 * P0.d * dS / 100) / (P0.M * P0.L * (T0 * 60) ** 2) / (1 - beta0);
        return {
          prompt: t`A fit gives $\Delta S = ${dS.toFixed(2)}$ cm and an undamped period $T_0 = ${T0.toFixed(2)}$ min, with $M = 1.5$ kg, $b = 46.5$ mm, $d = 50.0$ mm, $L = 5.00$ m and $\beta = ${beta0.toFixed(4)}$. What is $G$? Answer in m³ kg⁻¹ s⁻².`,
          visual: rigPlot('cavendish', { seed: r.int(1, 999) }, t`A run of this kind with its fit. ${SIMNOTE}`),
          answer: ans, units: 'm^3 kg^-1 s^-2', tol: { rel: 0.005 },
          errors: [{ value: ans * (1 - beta0), feedback: t`Divide by $1 - \beta$: the far sphere weakened the torque, so the uncorrected $G$ is low.` }, { value: ans * 3600, feedback: 'The period must be in seconds: 1 min = 60 s, and it is squared.' }],
          hints: [t`$G = \pi^2b^2d\,\Delta S/(MLT_0^2)$, all in SI units, then $\div (1 - \beta)$.`, t`$T_0 = ${T0.toFixed(2)} \times 60$ s; $\Delta S = ${(dS / 100).toFixed(4)}$ m.`],
          teach: 'G comes from a shift, a period and four lengths and a mass — every one of them in SI units.',
          explain: t`$\pi^2(0.0465)^2(0.050)(${(dS / 100).toFixed(4)})$ $/\,(1.5 \times 5.00 \times ${(T0 * 60).toFixed(1)}^2)$ $= ${tex(ans * (1 - beta0), 4)}$; divided by $${(1 - beta0).toFixed(4)}$, $G = ${tex(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'wait', difficulty: 2,
      prompt: 'Why fit the swing rather than wait for the spot to come to rest at its new equilibrium?',
      visual: rigPlot('cavendish', { seed: 4, residuals: false }, t`The first 45 minutes after the swing, with the damped-oscillation fit. ${SIMNOTE}`),
      choices: [
        'With a 25-minute damping time, settling to 0.2 cm from a 15 cm swing takes nearly two hours, during which drift and disturbances accumulate; the fit uses every reading and finds the period too',
        'The equilibrium position cannot be measured directly at all',
        'Waiting would let the small spheres fall onto the large ones',
        'A fit always gives a smaller uncertainty than a direct reading, whatever the data',
      ],
      answer: 0,
      why: {
        1: 'It can — eventually. The point is how long it takes and what happens meanwhile.',
        2: 'The wire’s torque holds the beam at a twist of a few milliradians; nothing falls.',
        3: 'A fit with the wrong model can be precise and wrong; fitting pays here because the model is right and the data are many.',
      },
      hints: ['How many damping times does it take for an amplitude to fall by a factor of 100?', 'What else does the swing tell you besides where it ends up?'],
      teach: 'A transient fitted with the right model gives the equilibrium, the period and the drift at once — long before the system settles.',
      explain: t`$e^{-t/\tau} = 0.2/15$ needs $t = \tau\ln 75 \approx 4.3\tau \approx 110$ min, and the period $T_0$ is needed anyway. Fitting the swing gets both from 45 minutes of data and lets the model include the drift.`,
    }),
    mcq({
      id: 'drift', difficulty: 3,
      prompt: t`A four-parameter fit (no drift term) leaves residuals that drift steadily from negative to positive across the run, and $\chi^2/\nu \approx 8$. What should you do?`,
      visual: rigPlot('cavendish', { seed: 3, flags: { fitdrift: false } }, t`The fit with no drift term, and its residuals. ${SIMNOTE}`),
      choices: [
        'Add a drift term (a straight line in time) to the model, refit, and check that the residuals become structureless',
        'Inflate every error bar by √8 and keep the fit',
        'Discard the first ten minutes, where the residuals are largest',
        'Average the readings in the last ten minutes and call that S₂',
      ],
      answer: 0,
      why: {
        1: 'The residuals have a pattern: the model is wrong, so larger error bars would hide a bias, not fix it.',
        2: 'The structure runs through the whole record; cutting part of it leaves the bias.',
        3: 'The swing has not died out at 45 min, and the drift moves the mean anyway.',
      },
      hints: ['Is the misfit random from point to point, or does it have a shape?', 'What physical process makes the zero creep steadily?'],
      teach: 'Patterned residuals mean a missing term in the model: find the physics, add it, refit.',
      explain: 'A torsion fibre relaxes after a load change, and the room’s temperature drifts: the equilibrium creeps. A term D·t absorbs it; χ²/ν drops near 1 and G moves by about 3σ. Checking the residuals is what tells you the model is complete ([residual analysis](#/lesson/lab.A6.2)).',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-budget', difficulty: 3,
      gen(r) {
        const db = r.pick([0.3, 0.5, 1.0]), stat = r.float(0.4, 0.8, 0.05);
        const parts = [stat, 100 * 2 * db / 46.5, 100 * 0.5 / 50, 100 * 0.01 / 5];
        const ans = Math.hypot(...parts);
        return {
          prompt: t`A Cavendish result’s budget: the fit $${stat.toFixed(2)}\%$; the sphere-centre distance $b = 46.5$ mm known to $\pm ${db}$ mm; the beam half-length $d = 50.0 \pm 0.5$ mm; the scale distance $L = 5.00 \pm 0.01$ m. What is the combined relative uncertainty of $G$, in per cent?`,
          visual: budget([{ label: 'fit', u: stat }, { label: `b (±${db} mm, enters squared)`, u: parts[1] }, { label: 'd (±0.5 mm)', u: parts[2] }, { label: 'L (±1 cm)', u: parts[3] }], { unit: '%', caption: 'The contributions to scale, and their quadrature sum.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(stat, 100 * db / 46.5, parts[2], parts[3]), feedback: t`$G \propto b^2$: the relative uncertainty of $b$ counts twice.` }, { value: parts.reduce((s, x) => s + x, 0), feedback: 'Independent contributions add in quadrature, not linearly.' }],
          hints: [t`$G \propto b^2 d/L$: relative contributions $2\sigma_b/b$, $\sigma_d/d$, $\sigma_L/L$.`, 'Add them and the fit’s in quadrature.'],
          teach: 'In a Cavendish experiment the geometry, not the statistics, usually limits G.',
          explain: t`$2 \times ${db}/46.5 = ${parts[1].toFixed(2)}\%$, $0.5/50 = 1.00\%$, $0.01/5 = 0.20\%$; with the fit, $\sqrt{\cdots} = ${ans.toFixed(2)}\%$. Precision G experiments go to great lengths to know where the masses’ centres are — and still disagree with each other ([weighted means](#/lesson/lab.A4.3)).`,
        };
      },
    }),
    mcq({
      id: 'cp-trouble', difficulty: 3,
      prompt: 'Modern measurements of G, each quoting uncertainties of tens of parts per million, disagree with one another by several hundred parts per million. What is the most defensible reading of that?',
      visual: rigPlot('cavendish', { seed: 5, flags: { far: false } }, t`A run analysed without the far-sphere correction: a perfect fit, and G 7.5% low — a reminder that a systematic can hide behind a good χ². ${SIMNOTE}`),
      choices: [
        'Some experiments have systematic errors their budgets do not include; averaging them as if the quoted σ’s were complete would understate the uncertainty',
        'G varies with time or place, which the scatter proves',
        'The most precise measurement must be right, and the others should be discarded',
        'The statistical scatter is simply larger than expected, by chance',
      ],
      answer: 0,
      why: {
        1: 'That would be new physics; nothing independent supports it, and unrecognized systematics explain the pattern with far fewer assumptions.',
        2: 'Precision is not accuracy: the most precise result is only right if its budget is complete — exactly what is in doubt.',
        3: 'Discrepancies of many σ between several groups are far beyond chance.',
      },
      hints: ['If every quoted σ were complete, how often would results differ by ten σ?', 'Which kind of error does not show up in a single experiment’s scatter?'],
      teach: 'When precise results disagree beyond their errors, some budget is missing a systematic; CODATA widens the uncertainty rather than pick a winner.',
      explain: t`Scatter far beyond the quoted σ’s means unrecognized systematics — the same kind as the far sphere or the drift here, but subtler (fibre anelasticity, mass distribution, metrology). CODATA applies an expansion factor so that its recommended value, $(6.674\,30 \pm 0.000\,15)\times10^{-11}$, covers the spread ([weighted means](#/lesson/lab.A4.3)).`,
    }),
    num({
      id: 'cp-earth', difficulty: 3, transfer: true,
      prompt: t`Satellite tracking gives Earth’s $GM = 3.986\,004\,418\times10^{14}\ \text{m}^3/\text{s}^2$ to about 2 parts per billion, but its mass needs $G$: $M = GM/G$. With $G = (6.674\,30 \pm 0.000\,15)\times10^{-11}$ in SI units, what is the standard uncertainty of the Earth’s mass? Answer in kg.`,
      visual: rigRaw('cavendish', { seed: 6, settings: [3] }, 'The torsion balance that weighs the Earth: G is the weak link between orbits and mass.'),
      answer: (3.986004418e14 / G) * (uG / G), units: 'kg', tol: { rel: 0.01 },
      errors: [{ value: 3.986004418e14 / G, feedback: 'That is the mass itself. The question asks for its uncertainty.' }, { value: (3.986004418e14 / G) * 2e-9, feedback: t`GM is known to 2 ppb, but $G$ only to 22 ppm, and the ratio inherits the larger relative uncertainty.` }],
      hints: ['For a ratio, relative uncertainties add in quadrature.', t`$\sigma_M/M \approx \sigma_G/G = 0.000\,15/6.674\,30$.`],
      teach: 'An orbit measures GM, never M: every planetary mass inherits the uncertainty of G.',
      explain: t`$M = 3.986\,004\,418\times10^{14}/6.674\,30\times10^{-11} = ${tex(3.986004418e14 / G, 5)}$ kg, and $\sigma_M = M \times 22\ \text{ppm} = ${tex((3.986004418e14 / G) * (uG / G), 2)}$ kg. Spacecraft navigation uses GM directly for exactly this reason.`,
    }),
  ],
  sources: [
    { label: 'H. Cavendish, Experiments to determine the density of the Earth, Philosophical Transactions of the Royal Society 88, 469 (1798)', url: 'https://doi.org/10.1098/rstl.1798.0022' },
    SRC.codata,
    SRC.usu,
  ],
});
