// Rotational inertia and torsion — the lab view: a bar hung on a steel wire,
// two masses slid out along it, the period timed at each position. T²
// against r² is a straight line: the slope gives the wire's torsion constant
// (and through it the steel's shear modulus, where the wire's radius to the
// fourth power dominates the budget), the intercept the bar's own moment of
// inertia — once the masses' own inertia (the parallel-axis theorem's other
// term) is taken out. A thrust stand for an ion thruster as the transfer.
// Every number is computed from the seeded model the labg-classics
// simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';
import { budget } from './_unc.js';

const t = String.raw;
const PT = M.EXPERIMENTS.torsion.defaults;
const PI2 = Math.PI ** 2;
const I0acc = M.I0of(PT), Icm = M.Icm(PT);
const sDw = 0.01, Dw = 2 * PT.aw * 1000;        // wire diameter 0.80 ± 0.01 mm
const relA4 = 4 * (sDw / Dw), relL = 0.001 / PT.lw;

// the worked example: seed 5
const EX = M.run('torsion', { seed: 5 });
const EXk = EX.results[0], EXI = EX.results[1];
const Gof = (k) => (2 * k * PT.lw) / (Math.PI * PT.aw ** 4);
const EXG = Gof(EXk.value), relG = Math.hypot(EXk.sigma / EXk.value, relA4, relL);
const runT = (seed, flags = {}) => M.run('torsion', { seed, flags });

export default lesson({
  id: 'lab.E.26',
  title: 'Rotational inertia and torsion',
  minutes: 17, difficulty: 2,
  lab: true,
  intro: t`Twist a wire and it twists back with a torque proportional to the angle, $\tau = -\kappa\theta$. Hang a bar from it and the bar oscillates with period $T = 2\pi\sqrt{I/\kappa}$, **whatever the amplitude** — a torsion pendulum is a perfect clock where a gravity pendulum is not. Slide two masses $m$ out to a distance $r$ on each side: by the parallel-axis theorem each adds $mr^2$ plus its own moment of inertia about its centre. So $T^2$ is a straight line in $r^2$: its slope measures the wire, its intercept the bar.`,
  equation: t`T^2 = \frac{4\pi^2}{\kappa}\bigl(I_0 + 2I_{cm}\bigr) + \frac{8\pi^2 m}{\kappa}\,r^2`,
  symbols: [
    { tex: 'T', text: 'the period of the twisting oscillation, in s (timed over ten swings)' },
    { tex: '\\kappa', text: 'the wire’s torsion constant, in N m/rad: the restoring torque per radian of twist' },
    { tex: 'I_0', text: 'the moment of inertia of the bar and its clamp about the wire, in kg m²' },
    { tex: 'I_{cm}', text: 'each mass’s own moment of inertia about its centre (for an upright cylinder of radius $R$: $mR^2/2$), in kg m²' },
    { tex: 'm', text: 'each of the two added masses, in kg (100 g here)' },
    { tex: 'r', text: 'the distance of each mass’s centre from the wire, in m' },
  ],
  why: t`Torsion balances weighed gravity (Cavendish) and test the equivalence principle to parts in $10^{13}$; torsion stands measure the micronewton thrust of ion engines; and the parallel-axis theorem runs every spacecraft’s attitude budget.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: a torsion pendulum',
    lead: t`Slide the masses to a position and take a reading (ten swings timed, divided by ten). The plot shows $T^2$ against $r^2$ with the weighted fit; the readout gives the torsion constant from the slope and the bar’s moment of inertia from the intercept, each compared with what the wire’s and bar’s dimensions predict.`,
    tasks: [
      'Switch off “Subtract the masses’ own inertia”: κ does not move at all, but I₀ jumps by 4 × 10⁻⁵ kg m² — about 8σ.',
      'Take readings only at r = 0.03 and 0.04 m and fit: the slope’s σ balloons. Spread the settings to measure a slope.',
      'Note the residuals’ size — milliseconds on seconds: timing ten swings is precise.',
    ],
    params: { exp: 'torsion', seed: 2, expected: true },
    caption: t`Simulated: a steel wire 0.80 mm across and 0.600 m long ($G = 80$ GPa), an aluminium bar of 120 g and 30 cm, two 100 g cylinders 2 cm in radius, ten swings timed to $\sigma = 0.05$ s. A linear spring, no damping. Dashed green: the line the dimensions predict. ${SIMNOTE}`,
  },
  example: {
    prompt: t`With two 100 g cylinders (radius 20.0 mm) at six positions, ten swings timed to $\sigma = 0.05$ s give the periods:

${colTable([[t`r\ (\text{m})`, ...EX.R.map((q) => q.r.toFixed(2))], [t`T\ (\text{s})`, ...EX.R.map((q) => q.T.toFixed(3))]])}

Find $\kappa$ and $I_0$. Then, with the wire $0.80 \pm 0.01$ mm in diameter and $600 \pm 1$ mm long, find the steel’s shear modulus $G = 2\kappa\ell/(\pi a^4)$ with its uncertainty.`,
    visual: rigPlot('torsion', { seed: 5, expected: true }, t`$T^2$ against $r^2$ with the weighted fit (gold), the predicted line (dashed) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Linearize', text: t`$T^2 = 4\pi^2 I/\kappa$ with $I = I_0 + 2I_{cm} + 2mr^2$: a line in $r^2$ with slope $b = 8\pi^2m/\kappa$ and intercept $a = 4\pi^2(I_0 + 2I_{cm})/\kappa$. Bars: $\sigma_{T^2} = 2T\sigma_T$, with $\sigma_T = 0.005$ s.` },
      { label: 'Fit', text: t`$b = ${pmT(EX.fit.b, EX.fit.sb)}\ \text{s}^2/\text{m}^2$, $a = ${pmT(EX.fit.a, EX.fit.sa)}\ \text{s}^2$, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ ($\nu = 4$).` },
      { label: 'Torsion constant', text: t`$\kappa = 8\pi^2m/b = 8\pi^2(0.100)/${EX.fit.b.toFixed(1)} = ${pmT(EXk.value * 1e3, EXk.sigma * 1e3)}\times10^{-3}$ N m/rad.` },
      { label: 'Bar', text: t`$I_0 + 2I_{cm} = 2ma/b$; each cylinder has $I_{cm} = mR^2/2 = 2.0\times10^{-5}$ kg m². So $I_0 = ${pmT(EXI.value * 1e4, EXI.sigma * 1e4)}\times10^{-4}$ kg m², against $ML^2/12 + I_\text{clamp} = 9.10\times10^{-4}$ kg m² from the bar’s mass and length: $z = ${EXI.z.toFixed(2)}$.` },
      { label: 'Shear modulus', text: t`$G = 2\kappa\ell/(\pi a^4) = 2(${tex(EXk.value, 4)})(0.600)/(\pi\,(4.0\times10^{-4})^4)$ $= ${(EXG / 1e9).toFixed(1)}$ GPa.` },
      { label: 'Budget', text: t`$a^4$ quadruples the diameter’s $0.01/0.80 = 1.25\%$: $5.0\%$. The length gives 0.17% and the fit $${(100 * EXk.sigma / EXk.value).toFixed(2)}\%$. Total $${(100 * relG).toFixed(1)}\%$: $G = ${pmT(EXG / 1e9, (relG * EXG) / 1e9)}$ GPa, consistent with handbook values near 80 GPa for steel. **The micrometer reading of the wire is the whole uncertainty.**` },
    ],
    answer: t`$\kappa = ${pmT(EXk.value * 1e3, EXk.sigma * 1e3)}\times10^{-3}$ N m/rad, $I_0 = ${pmT(EXI.value * 1e4, EXI.sigma * 1e4)}\times10^{-4}$ kg m², $G = ${pmT(EXG / 1e9, (relG * EXG) / 1e9)}$ GPa (dominated by the wire’s diameter to the fourth power).`,
  },
  practice: [
    num({
      id: 'period', difficulty: 1,
      gen(r) {
        const I = r.pick([4, 9, 16, 25]) * 1e-4, k = r.pick([2, 4, 5, 8]) * 1e-3;
        const ans = 2 * Math.PI * Math.sqrt(I / k);
        return {
          prompt: t`A body of moment of inertia $${tex(I, 2)}$ kg m² hangs on a wire of torsion constant $${tex(k, 2)}$ N m/rad. What is its period? Answer in s.`,
          visual: rigRaw('torsion', { seed: 1, settings: [0.1] }, 'A torsion pendulum seen from above (to scale): the bar, the wire at its centre, two masses.'),
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(I / k), feedback: t`That is $1/\omega$: the period is $2\pi\sqrt{I/\kappa}$.` }, { value: 2 * Math.PI * Math.sqrt(k / I), feedback: t`Upside down: more inertia, slower swing — $T = 2\pi\sqrt{I/\kappa}$.` }],
          hints: [t`$\kappa\theta = -I\ddot\theta$ gives $\omega = \sqrt{\kappa/I}$.`],
          teach: t`A torsion pendulum swings with $T = 2\pi\sqrt{I/\kappa}$, the rotational twin of $2\pi\sqrt{m/k}$.`,
          explain: t`$T = 2\pi\sqrt{${tex(I, 2)}/${tex(k, 2)}} = ${ans.toFixed(3)}$ s.`,
        };
      },
    }),
    num({
      id: 'kappa', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runT(seed);
        const b = +A.fit.b.toFixed(1);
        const ans = (8 * PI2 * PT.m) / b;
        return {
          prompt: t`A fit of $T^2$ against $r^2$ for two 100 g masses gives slope $${b.toFixed(1)}\ \text{s}^2/\text{m}^2$. What is the wire’s torsion constant? Answer in N m/rad.`,
          visual: rigPlot('torsion', { seed }, t`The run: $T^2$ against $r^2$, the fit and residuals. ${SIMNOTE}`),
          answer: ans, units: 'N m', tol: { rel: 0.003 },
          errors: [{ value: (4 * PI2 * PT.m) / b, feedback: t`There are *two* masses, each adding $mr^2$: the slope is $8\pi^2m/\kappa$.` }, { value: b / (8 * PI2 * PT.m), feedback: t`Solve for $\kappa$: $\kappa = 8\pi^2m/b$.` }],
          hints: [t`Slope $b = 4\pi^2(2m)/\kappa$.`, t`$\kappa = 8\pi^2m/b$.`],
          teach: t`The slope of $T^2$ against $r^2$ is $8\pi^2m/\kappa$ for two masses $m$.`,
          explain: t`$\kappa = 8\pi^2(0.100)/${b.toFixed(1)} = ${tex(ans, 4)}$ N m/rad.`,
        };
      },
    }),
    num({
      id: 'I0', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runT(seed);
        const a = +A.fit.a.toFixed(3), b = +A.fit.b.toFixed(1);
        const ans = ((2 * PT.m * a) / b - 2 * Icm) * 1e4;
        return {
          prompt: t`The same kind of fit gives intercept $a = ${a.toFixed(3)}\ \text{s}^2$ and slope $b = ${b.toFixed(1)}\ \text{s}^2/\text{m}^2$, with $m = 0.100$ kg. Each mass is a cylinder of radius 20 mm standing upright, with $I_{cm} = mR^2/2$. What is the bar’s own moment of inertia $I_0$? Answer in units of $10^{-4}$ kg m².`,
          visual: rigPlot('torsion', { seed, residuals: false }, t`The fit extended to $r^2 = 0$: the intercept is the inertia that does not move with the masses. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ((2 * PT.m * a) / b) * 1e4, feedback: t`The intercept also holds the two masses’ own inertia, $2I_{cm} = 4.0\times10^{-5}$ kg m²: subtract it.` }, { value: ((PT.m * a) / b - 2 * Icm) * 1e4, feedback: t`$a/b = (I_0 + 2I_{cm})/(2m)$: multiply by $2m$, not $m$.` }],
          hints: [t`$a/b = (I_0 + 2I_{cm})/(2m)$.`, t`$I_{cm} = 0.100 \times 0.020^2/2 = 2.0\times10^{-5}$ kg m².`],
          teach: 'The ratio of intercept to slope gives the inertia that stays put; take out the masses’ own part.',
          explain: t`$I_0 = 2(0.100)(${a.toFixed(3)})/${b.toFixed(1)} - 4.0\times10^{-5} = ${(ans).toFixed(3)}\times10^{-4}$ kg m² (the bar’s $ML^2/12$ plus its clamp: $9.10\times10^{-4}$).`,
        };
      },
    }),
    num({
      id: 'parallel', difficulty: 2,
      gen(r) {
        const m = r.pick([0.05, 0.1, 0.2]), R = r.pick([0.015, 0.02, 0.025]), d = r.pick([0.06, 0.1, 0.12]);
        const ans = (m * R * R / 2 + m * d * d) * 1e4;
        return {
          prompt: t`A solid cylinder of mass $${m}$ kg and radius $${R * 1000}$ mm stands upright with its axis $${d}$ m from the wire (parallel to it). What is its moment of inertia about the wire? Answer in units of $10^{-4}$ kg m².`,
          visual: rigRaw('torsion', { seed: 1, settings: [d] }, t`Cylinders standing on the bar a distance $d$ from the wire (top view, to scale for 20 mm cylinders). Each turns about the wire *and* about its own axis: $I = I_{cm} + md^2$.`),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: m * d * d * 1e4, feedback: t`Add the cylinder’s own $I_{cm} = mR^2/2$: the parallel-axis theorem is $I = I_{cm} + md^2$.` }, { value: (m * R * R + m * d * d) * 1e4, feedback: t`A solid cylinder about its own axis has $I_{cm} = mR^2/2$, not $mR^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$I = I_{cm} + md^2$.`, t`$I_{cm} = mR^2/2$ for a solid cylinder about its axis.`],
          teach: t`Parallel-axis theorem: $I = I_{cm} + md^2$.`,
          explain: t`$I = ${m}(${R})^2/2 + ${m}(${d})^2 = ${tex(ans * 1e-4, 4)}$ kg m²; the own term is $${((100 * (m * R * R / 2)) / (m * R * R / 2 + m * d * d)).toFixed(1)}\%$ of it.`,
        };
      },
    }),
    num({
      id: 'G-budget', difficulty: 3,
      gen(r) {
        const D = r.pick([0.5, 0.8, 1.0]), sD = r.pick([0.005, 0.01]), fit = r.pick([0.2, 0.5]);
        const ans = Math.hypot(4 * (100 * sD) / D, fit, 0.17);
        return {
          prompt: t`$G = 2\kappa\ell/(\pi a^4)$. The fit gives $\kappa$ to $${fit}\%$, the length is known to 0.17%, and a micrometer gives the wire’s diameter as $${D.toFixed(2)} \pm ${sD}$ mm. What is the relative uncertainty of $G$, in percent?`,
          visual: budget([{ label: 'κ (the fit)', u: fit }, { label: 'length ℓ', u: 0.17 }, { label: `diameter, to the 4th power (4 × ${((100 * sD) / D).toFixed(2)}%)`, u: (4 * 100 * sD) / D }], { unit: '%', caption: 'The contributions to scale: a fourth power quadruples a small relative uncertainty.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot((100 * sD) / D, fit, 0.17), feedback: t`$G \propto a^{-4}$: the diameter’s relative uncertainty counts four times.` }, { value: Math.hypot((2 * 100 * sD) / D, fit, 0.17), feedback: 'The power is 4, not 2.' }],
          hints: [t`For $y \propto x^n$, $\sigma_y/y = |n|\,\sigma_x/x$.`, t`$\sqrt{(4\sigma_D/D)^2 + (\sigma_\kappa/\kappa)^2 + (\sigma_\ell/\ell)^2}$.`],
          teach: 'High powers magnify uncertainty: measure the quantity raised to the fourth power best of all.',
          explain: t`$4 \times ${sD}/${D.toFixed(2)} = ${((4 * 100 * sD) / D).toFixed(2)}\%$; combined with $${fit}\%$ and $0.17\%$: $${ans.toFixed(2)}\%$.`,
        };
      },
    }),
    mcq({
      id: 'amplitude', difficulty: 2,
      prompt: 'You time the torsion pendulum at a 10° twist and again at a 60° twist. How do the two periods compare (the wire stays elastic)?',
      visual: rigRaw('torsion', { seed: 2, settings: [0.08] }, 'The torsion pendulum from above (to scale).'),
      choices: [
        t`The same: the restoring torque is exactly proportional to the twist, so the motion is simple harmonic at any amplitude`,
        'Longer at 60°, as for a gravity pendulum',
        'Shorter at 60°, because the wire stiffens',
        'Longer at 60°, because the masses move faster',
      ],
      answer: 0,
      why: {
        1: t`A gravity pendulum’s torque goes as $\sin\theta$, weaker than linear at large angles — that is what slows it. A wire’s torque is $\kappa\theta$.`,
        2: 'An elastic wire’s torque stays proportional to the twist; it neither stiffens nor softens.',
        3: 'Faster motion over a longer arc takes the same time: that is what simple harmonic means.',
      },
      hints: [t`Compare the restoring torques: $-\kappa\theta$ against $-mgL\sin\theta$.`],
      teach: 'A linear restoring torque gives an amplitude-independent period: torsion pendulums need no small-angle correction.',
      explain: t`$I\ddot\theta = -\kappa\theta$ for any $\theta$ within the elastic range, so $T = 2\pi\sqrt{I/\kappa}$ at every amplitude — unlike the gravity pendulum, whose period at 60° is 7% longer.`,
    }),
    mcq({
      id: 'own', difficulty: 3,
      prompt: t`A student ignores the masses’ own moment of inertia and reports $I_0 = 2ma/b$. What happens to $\kappa$ and to $I_0$?`,
      visual: rigPlot('torsion', { seed: 6, flags: { own: false } }, t`The same data; only the analysis of the intercept differs. ${SIMNOTE}`),
      choices: [
        t`$\kappa$ is unaffected (it comes from the slope); $I_0$ comes out high by $2I_{cm} = 4\times10^{-5}$ kg m², about 4%`,
        t`Both $\kappa$ and $I_0$ come out 4% high`,
        t`$\kappa$ comes out low; $I_0$ is unaffected`,
        t`$I_0$ comes out low, since the masses were left out`,
      ],
      answer: 0,
      why: {
        1: t`The own inertia does not depend on $r$: it sits in the intercept and leaves the slope, hence $\kappa$, alone.`,
        2: t`The slope is set by how $T^2$ changes with $r^2$, which the masses’ own inertia does not affect.`,
        3: t`The intercept *includes* the masses’ own inertia; not subtracting it leaves it in $I_0$, making it high.`,
      },
      hints: [t`Does $I_{cm}$ depend on $r$?`, t`The intercept is $4\pi^2(I_0 + 2I_{cm})/\kappa$.`],
      teach: 'A constant extra inertia lands in the intercept: it biases I₀ and spares κ.',
      explain: t`$2ma/b = I_0 + 2I_{cm}$: reporting it as $I_0$ adds $2 \times 0.100 \times 0.020^2/2 = 4.0\times10^{-5}$ kg m² — 4.4% of the bar’s $9.1\times10^{-4}$, about 8σ.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-G', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runT(seed);
        const k = +(A.results[0].value * 1e3).toFixed(3);
        const ans = Gof(k * 1e-3) / 1e9;
        return {
          prompt: t`A run gives $\kappa = ${k.toFixed(3)}\times10^{-3}$ N m/rad for a steel wire $0.80$ mm in diameter and $0.600$ m long. What shear modulus does that imply? Answer in GPa.`,
          visual: rigPlot('torsion', { seed }, t`The run behind $\kappa$. ${SIMNOTE}`),
          answer: ans, units: 'GPa', tol: { rel: 0.005 },
          errors: [{ value: Gof(k * 1e-3) / 16 / 1e9, feedback: t`Use the radius, $a = 0.40$ mm, not the diameter.` }, { value: (k * 1e-3 * PT.lw) / (Math.PI * PT.aw ** 4) / 1e9, feedback: t`$\kappa = \pi Ga^4/(2\ell)$, so $G = 2\kappa\ell/(\pi a^4)$ — keep the 2.` }],
          hints: [t`$\kappa = \pi Ga^4/(2\ell)$ for a wire of radius $a$.`, t`$G = 2\kappa\ell/(\pi a^4)$ with $a = 4.0\times10^{-4}$ m.`],
          teach: t`A wire’s torsion constant is $\pi Ga^4/2\ell$: thin wires twist easily, as the fourth power.`,
          explain: t`$G = 2(${tex(k * 1e-3, 4)})(0.600)/(\pi(4.0\times10^{-4})^4) = ${ans.toFixed(1)}$ GPa — with the diameter’s 5% budget, consistent with steel’s handbook value near 80 GPa.`,
        };
      },
    }),
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runT(seed);
        const v = +(A.results[1].value * 1e4).toFixed(3), s = +(A.results[1].sigma * 1e4).toFixed(3);
        const ans = (v - I0acc * 1e4) / s;
        return {
          prompt: t`A run gives $I_0 = (${v.toFixed(3)} \pm ${s.toFixed(3)})\times10^{-4}$ kg m². The bar (120.0 g, 300.0 mm) and clamp predict $ML^2/12 + 1.0\times10^{-5} = 9.100\times10^{-4}$ kg m². Give $z$, with its sign.`,
          visual: rigPlot('torsion', { seed, expected: true }, t`The run with the line the dimensions predict (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (v - 9.0) / s, feedback: t`Include the clamp: $ML^2/12 = 9.00\times10^{-4}$, plus $0.10\times10^{-4}$.` }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract the prediction.', t`$z = \Delta/\sigma$.`],
          teach: t`$z$ = difference ÷ uncertainty.`,
          explain: t`$z = (${v.toFixed(3)} - 9.100)/${s.toFixed(3)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'cp-thrust', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([0.8, 1.2, 2.0]), T = r.pick([20, 30, 40]), R = r.pick([0.3, 0.5]), th = r.pick([0.5, 1.0, 2.0]);
        const k = (4 * PI2 * I) / T ** 2;
        const ans = ((k * th * Math.PI / 180) / R) * 1e3;
        return {
          prompt: t`An ion thruster is mounted on a torsion thrust stand, its thrust line $${R}$ m from the pivot. The stand’s moment of inertia is $${I}$ kg m² and it oscillates freely with period $${T}$ s. Switched on, the thruster holds the stand at a steady deflection of $${th}^\circ$. What is the thrust? Answer in mN.`,
          visual: rigRaw('torsion', { seed: 3, settings: [0.12] }, t`A torsion pendulum from above. A thrust stand is the same physics: the thruster’s torque $FR$ twists the arm until the flexure’s $\kappa\theta$ balances it.`),
          answer: ans, units: 'mN', tol: { rel: 0.005 },
          errors: [{ value: (k * th) / R * 1e3, feedback: 'Put the angle in radians.' }, { value: (((I / T ** 2) * th * Math.PI) / 180 / R) * 1e3, feedback: t`From $T = 2\pi\sqrt{I/\kappa}$, $\kappa = 4\pi^2I/T^2$ — keep the $4\pi^2$.` }],
          hints: [t`Calibrate the stand: $\kappa = 4\pi^2I/T^2$.`, t`At rest the torques balance: $FR = \kappa\theta$, with $\theta$ in radians.`],
          teach: 'A torsion stand turns a tiny thrust into a measurable angle: calibrate κ from the period, then F = κθ/R.',
          explain: t`$\kappa = 4\pi^2(${I})/${T}^2 = ${tex(k, 3)}$ N m/rad; $F = \kappa\theta/R = ${tex(k, 3)} \times ${(th * Math.PI / 180).toFixed(4)}/${R} = ${ans.toFixed(2)}$ mN — the scale of a gridded ion engine’s thrust, which no bathroom scale could weigh.`,
        };
      },
    }),
  ],
  sources: [
    SRC.os1('15.4', '15-4-pendulums'),
    SRC.os1('12.3', '12-3-stress-strain-and-elastic-modulus'),
    SRC.os1('10.5', '10-5-calculating-moments-of-inertia'),
    SRC.taylor('ch. 3 (propagation of powers)'),
  ],
});
