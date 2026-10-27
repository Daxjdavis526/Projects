// Lab 9 (virtual): moment of inertia — a disc spun up by a falling mass on a
// rotary motion sensor. The string's torque m(g − αr)r against α is a line of
// slope I and intercept τ_f (bearing friction); compare I with ½MR² from a
// balance and calipers; add a ring and measure it by difference.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8, r0 = 0.024;
const DISC = 0.5 * 1.4 * 0.114 ** 2;                          // ½MR², kg·m²
const sDISC = DISC * Math.hypot(0.001 / 1.4, (2 * 0.00005) / 0.114);   // balance ±1 g, calipers ±0.05 mm on R
const RING = 0.5 * 0.47 * (0.054 ** 2 + 0.064 ** 2);
const torque = (m, al) => m * (G - al * r0) * r0;
const e3 = (x, d = 3) => (x * 1000).toFixed(d);          // kg·m² shown in units of 10⁻³

// the worked example: six spin-ups with a sticky bearing (seed 44)
const EX = (() => {
  const rows = B.makeData('rotary', { seed: 44, sys: 'friction' }).rows;
  const an = B.analyse('rotary', rows, { sys: 'friction' });
  const f = an.series[0].fit, q = an.results[0];
  const r1 = rows[0], I1 = torque(r1.s, r1.R[0]) / r1.R[0];
  return { rows, f, q, r1, I1, z: Math.abs(q.value - DISC) / Math.hypot(q.sigma, sDISC) };
})();

const spins = (r, sys = null, params = {}) => {
  const rows = B.makeData('rotary', { seed: r.int(1, 999999), sys, params }).rows;
  return { rows, an: B.analyse('rotary', rows, { sys, params }) };
};

export default lesson({
  id: 'phys2210.L.9',
  title: 'Moment of inertia',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`**This is a virtual experiment.** A disc turns on the axle of a rotary motion sensor. A string wound round a 2.40 cm pulley on the axle runs to a falling mass $m$, which spins the disc up; the sensor reports its angular acceleration $\alpha$. The bench computes each $\alpha$ with realistic sensor scatter.

The falling mass accelerates at $\alpha r$, so the string’s tension is not quite its weight: $T = m(g - \alpha r)$. Its torque drives the disc against any friction torque $\tau_f$ in the bearing:

$$\tau = m(g - \alpha r)\,r = I\alpha + \tau_f$$

Plot $\tau$ against $\alpha$: the slope is the moment of inertia $I$, the intercept the friction — measured, not ignored. (Lab skills trained: modelling an apparatus honestly, and comparing two independent ways of finding $I$.)`,
  symbols: [
    { tex: '\\tau', text: 'the torque the string applies to the axle, in N·m' },
    { tex: 'm', text: 'the hanging mass, in kg' },
    { tex: 'r', text: 'the radius of the pulley step the string is wound on: 0.0240 m' },
    { tex: '\\alpha', text: 'the angular acceleration from the rotary sensor, in rad/s²; the falling mass accelerates at $a = \\alpha r$' },
    { tex: 'I', text: 'the moment of inertia of everything that turns, in kg·m²: for a uniform disc, $\\tfrac12 MR^2$' },
    { tex: '\\tau_f', text: 'the friction torque in the bearing, in N·m, taken as steady' },
  ],
  why: 'Flywheels, turbines, reaction wheels and spinning rocket stages are all designed around a moment of inertia — and the best ones are measured, not just calculated.',
  visual: {
    type: 'lab-bench',
    title: 'Spin a disc with a falling mass',
    lead: t`Six spin-ups are in the table, from 20 g to 120 g on the string. The plot shows the string’s torque against the measured angular acceleration (both have small error bars) with the least-squares line.`,
    tasks: [
      'Read I from the slope: about 9.1 × 10⁻³ kg·m², matching ½MR² for the 1.400 kg, 11.40 cm disc.',
      t`Turn on the sticky bearing: the line rises by $\tau_f = 0.0015$ N·m, but its slope — $I$ — does not move.`,
      'Switch to disc + ring: the slope grows by the ring’s own moment of inertia, about 1.6 × 10⁻³ kg·m².',
    ],
    params: { exp: 'rotary', seed: 29 },
  },
  example: {
    prompt: t`Six spin-ups with masses from 20 to 120 g give the angular accelerations in the table (each to 1%). The disc has $M = 1.400 \pm 0.001$ kg and diameter $228.00 \pm 0.10$ mm. Find $I$ from the data, compare it with $\tfrac12 MR^2$, and explain the intercept.`,
    visual: plot('rotary', EX.rows, { sys: true, table: true, caption: 'Torque against angular acceleration, with the least-squares line.' }),
    steps: [
      { label: 'Torque', text: t`For the 60 g run, $\alpha = ${EX.rows[2].R[0].toFixed(3)}$ rad/s², so $a = \alpha r = ${(EX.rows[2].R[0] * r0).toFixed(4)}$ m/s² and $\tau = 0.060\,(9.80 - ${(EX.rows[2].R[0] * r0).toFixed(4)})(0.0240) = ${torque(0.06, EX.rows[2].R[0]).toFixed(5)}$ N·m. Using $mg$ instead of the true tension would overstate it by ${(100 * (EX.rows[2].R[0] * r0) / (G - EX.rows[2].R[0] * r0)).toFixed(2)}%.` },
      { label: 'Fit', text: t`The least-squares line of $\tau$ against $\alpha$ has slope $I = (${e3(EX.f.b, 3)} \pm ${e3(EX.f.sb, 3)})\times10^{-3}\ \text{kg·m}^2$ and intercept $\tau_f = (${e3(EX.f.a, 2)} \pm ${e3(EX.f.sa, 2)})\times10^{-3}$ N·m, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$.` },
      { label: 'Calculate', text: t`$\tfrac12 MR^2 = \tfrac12(1.400)(0.11400)^2 = ${e3(DISC, 3)}\times10^{-3}\ \text{kg·m}^2$. Its uncertainty: $\sqrt{(0.001/1.400)^2 + (2\times0.05/114.00)^2} = ${(100 * sDISC / DISC).toFixed(2)}\%$ — $R$ counts twice because it is squared — so $\pm${e3(sDISC, 3)}\times10^{-3}$.` },
      { label: 'Compare', text: t`$z = \dfrac{|${e3(EX.q.value, 3)} - ${e3(DISC, 3)}|}{\sqrt{${e3(EX.q.sigma, 3)}^2 + ${e3(sDISC, 3)}^2}} = ${EX.z.toFixed(2)}$: the dynamic and the calculated moment of inertia agree.` },
      { label: 'The intercept', text: t`The torque at $\alpha = 0$, ${e3(EX.f.a, 2)} × 10⁻³ N·m, is the bearing friction: the string must supply that much before the disc accelerates at all. One run alone would have been fooled: the 20 g run gives $\tau/\alpha = ${e3(EX.I1, 2)}\times10^{-3}\ \text{kg·m}^2$, ${(100 * (EX.I1 / DISC - 1)).toFixed(0)}% too large.` },
    ],
    answer: t`$I = (${e3(EX.q.value, 3)} \pm ${e3(EX.q.sigma, 3)})\times10^{-3}\ \text{kg·m}^2$, agreeing with $\tfrac12 MR^2 = (${e3(DISC, 3)} \pm ${e3(sDISC, 3)})\times10^{-3}$; bearing friction $\tau_f \approx ${e3(EX.f.a, 2)}\times10^{-3}$ N·m.`,
  },
  practice: [
    num({
      id: 'torque', difficulty: 2,
      gen(r) {
        const m = r.pick([0.06, 0.08, 0.10, 0.12]), al = +(r.float(1.6, 2.9, 0.001)).toFixed(3);
        const tau = torque(m, al);
        return {
          prompt: t`A ${(1000 * m).toFixed(0)} g mass on a string round the 2.40 cm pulley spins the disc up at $\alpha = ${al.toFixed(3)}\ \text{rad/s}^2$. What torque does the string apply? (Give four significant figures: the correction you need is under 1%.)`,
          answer: tau, units: 'N m', tol: { rel: 0.001 },
          errors: [{ value: m * G * r0, feedback: t`The mass is accelerating, so the tension is less than its weight: $T = m(g - \alpha r)$.` }, { value: m * (G - al * r0), feedback: t`That is the tension, a force. The torque is the tension times the pulley radius.` }],
          hints: [t`Newton’s second law for the falling mass: $mg - T = ma$ with $a = \alpha r$.`, t`$\tau = Tr = m(g - \alpha r)\,r$.`],
          teach: 'A falling mass on a string pulls with less than its weight, T = m(g − a), because it is accelerating.',
          explain: t`$\tau = ${m}\,(9.80 - ${al.toFixed(3)}\times0.0240)(0.0240) = ${tau.toFixed(5)}$ N·m — ${(100 * (al * r0) / (G - al * r0)).toFixed(2)}% less than $mgr$.`,
          visual: apparatus('rotary', { at: m }, 'The disc, the pulley on its axle, and the hanging mass. Not to scale.'),
        };
      },
    }),
    num({
      id: 'half-MR2', difficulty: 1,
      gen(r) {
        const M = r.pick([1.2, 1.4, 1.6]), D = r.pick([0.200, 0.228, 0.250]);
        const I = 0.5 * M * (D / 2) ** 2;
        return {
          prompt: t`A uniform disc has mass ${M.toFixed(3)} kg and a measured **diameter** of ${(1000 * D).toFixed(1)} mm. What is its moment of inertia about its axis?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.003 },
          errors: [{ value: 0.5 * M * D * D, feedback: t`The formula uses the radius: $R = D/2$.` }, { value: M * (D / 2) ** 2, feedback: t`A disc is $\tfrac12 MR^2$; $MR^2$ is a thin hoop, with all its mass at the rim.` }],
          hints: [t`$I = \tfrac12 MR^2$ with $R = D/2$.`],
          teach: 'A uniform disc about its axis has I = ½MR² — mind that calipers measure the diameter.',
          explain: t`$I = \tfrac12(${M.toFixed(3)})(${(D / 2).toFixed(4)})^2 = ${e3(I, 3)}\times10^{-3}\ \text{kg·m}^2$.`,
          visual: apparatus('rotary', { params: { M, R: D / 2 }, labels: false }, 'The disc on the rotary sensor. Not to scale.'),
        };
      },
    }),
    num({
      id: 'sigma-calc', difficulty: 3,
      gen(r) {
        let M, sM, D, sD;
        do {
          M = r.pick([1.2, 1.4, 1.6]); sM = r.pick([0.001, 0.002, 0.005]); D = r.pick([0.200, 0.228, 0.250]); sD = r.pick([0.0001, 0.0002, 0.0005]);
        } while (Math.max(sM / M, (2 * sD) / D) / Math.min(sM / M, (2 * sD) / D) > 2.2);
        const I = 0.5 * M * (D / 2) ** 2, rel = Math.hypot(sM / M, (2 * sD) / D);
        return {
          prompt: t`The disc’s mass is $${M.toFixed(3)} \pm ${sM}$ kg and its diameter $${(1000 * D).toFixed(1)} \pm ${(1000 * sD).toFixed(1)}$ mm, so $I = \tfrac12 MR^2 = ${(I * 1000).toFixed(4)}\times10^{-3}\ \text{kg·m}^2$. What is the relative uncertainty of $I$, in percent?`,
          answer: 100 * rel, units: '%', tol: { rel: 0.03 },
          errors: [{ value: 100 * Math.hypot(sM / M, sD / D), feedback: t`$I \propto R^2$, so the radius’s relative uncertainty counts twice.` }, { value: 100 * (sM / M + (2 * sD) / D), feedback: 'Independent uncertainties combine in quadrature, not by simple addition.' }],
          hints: [t`For $I \propto MD^2$: $\dfrac{\sigma_I}{I} = \sqrt{\left(\dfrac{\sigma_M}{M}\right)^2 + \left(2\dfrac{\sigma_D}{D}\right)^2}$.`, t`$\sigma_M/M = ${(100 * sM / M).toFixed(3)}\%$ and $2\sigma_D/D = ${(200 * sD / D).toFixed(3)}\%$.`],
          teach: 'Relative uncertainties combine in quadrature, each multiplied by its power in the formula.',
          explain: t`$\sqrt{${(100 * sM / M).toFixed(3)}^2 + ${(200 * sD / D).toFixed(3)}^2}\% = ${(100 * rel).toFixed(3)}\%$ — ${sM / M > (2 * sD) / D ? 'the mass dominates.' : 'the diameter dominates, because it is squared.'}`,
          visual: apparatus('rotary', { labels: false }, 'The disc on the rotary sensor. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'one-run', difficulty: 2,
      gen(r) {
        const { rows, an } = spins(r, 'friction');
        const r1 = rows[0], I1 = torque(r1.s, r1.R[0]) / r1.R[0];
        return {
          prompt: t`With the sticky bearing, a student divides torque by angular acceleration for the 20 g run alone and gets $I = ${e3(I1, 2)}\times10^{-3}\ \text{kg·m}^2$ — far above the fit’s slope, $${e3(an.results[0].value, 2)}\times10^{-3}$. Why?`,
          choices: [
            t`Part of the torque only overcomes friction: $\tau/\alpha = I + \tau_f/\alpha$, which is largest at small $\alpha$; the fit separates the two`,
            'The 20 g run is a random outlier',
            t`Small masses give larger moments of inertia`,
            t`The tension is not $mg$, and that error dominates`,
          ],
          answer: 0,
          why: {
            1: 'Every small-mass run shows the same excess, growing as α shrinks — a pattern, not chance.',
            2: 'I is a property of the disc; it cannot depend on what hangs from the string.',
            3: t`Using $m(g - \alpha r)$ already accounts for that, and it is under 1% here — far too small to explain a large excess.`,
          },
          hints: [t`Divide $\tau = I\alpha + \tau_f$ by $\alpha$.`],
          teach: 'A constant offset (here friction) spoils single-point ratios but not the slope of a fit.',
          explain: t`$\tau/\alpha = I + \tau_f/\alpha$: with $\tau_f \approx 0.0015$ N·m and $\alpha \approx ${r1.R[0].toFixed(2)}\ \text{rad/s}^2$, the friction term adds about $${e3(0.0015 / r1.R[0], 1)}\times10^{-3}$. The fit’s slope is free of it, and its intercept measures $\tau_f$.`,
          visual: plot('rotary', rows, { sys: true, caption: 'Torque against angular acceleration with the least-squares line: note where it meets α = 0.' }),
        };
      },
    }),
    num({
      id: 'ring', difficulty: 2,
      gen(r) {
        const a = spins(r).an.results[0], b = spins(r, null, { ring: true }).an.results[0];
        const Ia = +(a.value * 1000).toFixed(3), sa = +(a.sigma * 1000).toPrecision(2), Ib = +(b.value * 1000).toFixed(3), sb = +(b.sigma * 1000).toPrecision(2);
        const d = Ib - Ia;
        return {
          prompt: t`The bare disc gives $I = (${Ia} \pm ${sa})\times10^{-3}\ \text{kg·m}^2$; with a ring added, $(${Ib} \pm ${sb})\times10^{-3}$. What is the ring’s moment of inertia, in units of $10^{-3}\ \text{kg·m}^2$?`,
          answer: d, tol: { rel: 0.003, abs: 0.0006 },
          errors: [{ value: Ib + Ia, feedback: 'Moments of inertia about the same axis add, so the ring’s is the difference, not the sum.' }],
          hints: ['Moments of inertia about the same axis add: I(disc + ring) = I(disc) + I(ring).'],
          teach: 'Moments of inertia about one axis add, so a part can be measured by difference.',
          explain: t`$I_\text{ring} = ${Ib} - ${Ia} = ${d.toFixed(3)}\times10^{-3}\ \text{kg·m}^2$, uncertain by $\sqrt{${sa}^2 + ${sb}^2} = ${Math.hypot(sa, sb).toFixed(3)}\times10^{-3}$ — a difference of two measurements keeps both their uncertainties. Calculated: $\tfrac12 M(R_1^2 + R_2^2) = ${e3(RING, 3)}\times10^{-3}$.`,
          visual: apparatus('rotary', { params: { ring: true }, labels: false }, 'The disc with the ring on top, on the same axle. Not to scale.'),
        };
      },
    }),
    code({
      id: 'fit-I', difficulty: 2,
      gen(r) {
        const { rows } = spins(r, 'friction');
        const ms = rows.map((q) => q.s), als = rows.map((q) => q.R[0]);
        const taus = ms.map((m, i) => torque(m, als[i]));
        const f = B.fitLine(als, taus);
        const data = t`import numpy as np

g, r = 9.80, 0.0240                                       # m/s², m (pulley radius)
m = np.array([${ms.map((v) => v.toFixed(3)).join(', ')}])          # kg
alpha = np.array([${als.map((v) => v.toFixed(3)).join(', ')}])     # rad/s²
`;
        return {
          prompt: t`Compute the string’s torque $\tau = m(g - \alpha r)\,r$ for each run, fit $\tau$ against $\alpha$ with \`np.polyfit\`, and set \`I\` to the slope and \`tau_f\` to the intercept.`,
          starter: t`${data}
tau = 0 * m        # the torque on the axle for each run
I = 0.0
tau_f = 0.0
print(I, tau_f)
`,
          answer: t`${data}
tau = m * (g - alpha * r) * r
I, tau_f = np.polyfit(alpha, tau, 1)
print(f"I = {I:.5f} kg·m², friction torque = {tau_f:.5f} N·m")
`,
          tests: [
            { name: 'tau is m(g − αr)r for each run', code: 'abs(tau[0] - m[0] * (g - alpha[0] * r) * r) < 1e-12' },
            { name: `I is the slope (${e3(f.b, 3)} × 10⁻³ kg·m²)`, code: `abs(I - ${f.b}) < 1e-9` },
            { name: `the friction torque is the intercept (${e3(f.a, 2)} × 10⁻³ N·m)`, code: `abs(tau_f - ${f.a}) < 1e-9` },
          ],
          hints: [t`\`tau = m * (g - alpha * r) * r\` works element by element.`, t`\`I, tau_f = np.polyfit(alpha, tau, 1)\` — slope first, then intercept.`],
          teach: 'Turn raw readings into the physical quantity first (torque), then fit: slope and intercept each mean something.',
          explain: t`$I = ${e3(f.b, 3)}\times10^{-3}\ \text{kg·m}^2$ and $\tau_f = ${e3(f.a, 2)}\times10^{-3}$ N·m. (The errors here are mostly in $\alpha$, on the horizontal axis; a plain fit is still fine because they are small.)`,
          visual: plot('rotary', rows, { sys: true, fit: false, caption: 'The runs your program fits.' }),
        };
      },
    }),
    num({
      id: 'offset-axis', difficulty: 3,
      gen(r) {
        const d = r.pick([0.02, 0.03, 0.04, 0.05]);
        const I = DISC + 1.4 * d * d;
        return {
          prompt: t`The disc (1.400 kg, radius 11.40 cm) is remounted on the axle through a hole ${(100 * d).toFixed(1)} cm from its centre. What slope should the $\tau$–$\alpha$ plot now have, in units of $10^{-3}\ \text{kg·m}^2$?`,
          answer: I * 1000, tol: { rel: 0.003 },
          errors: [{ value: DISC * 1000, feedback: 'Moving the axis away from the centre of mass always increases I: add Md².' }, { value: (DISC + 1.4 * d) * 1000, feedback: t`The distance is squared: $Md^2$.` }],
          hints: [t`Parallel-axis theorem: $I = I_\text{cm} + Md^2$.`, t`$I = ${e3(DISC, 3)}\times10^{-3} + 1.400\times(${d})^2$.`],
          teach: t`The parallel-axis theorem: about an axis a distance $d$ from the centre of mass, $I = I_\text{cm} + Md^2$.`,
          explain: t`$I = ${e3(DISC, 3)}\times10^{-3} + 1.400(${d})^2 = ${e3(I, 3)}\times10^{-3}\ \text{kg·m}^2$ — measuring this slope tests the parallel-axis theorem directly.`,
          visual: apparatus('rotary', { labels: false }, 'The disc on the rotary sensor’s axle (shown centred). Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'forced', difficulty: 2,
      prompt: t`With the sticky bearing, a student fits $\tau = I\alpha$ through the origin “because no torque means no acceleration”. How does the $I$ from that fit compare with the true value?`,
      choices: ['Too large: the friction offset has to be absorbed by a steeper line', 'Too small: the forced line is shallower', 'The same: forcing the origin only changes the intercept', 'It depends on the hanging masses, randomly'],
      answer: 0,
      why: {
        1: t`The data sit *above* $I\alpha$ by $\tau_f$, so a line pinned at the origin must tilt *up* to reach them.`,
        2: 'Without an intercept, the slope is the only freedom the line has; any offset is forced into it.',
        3: 'The bias is systematic, not random: it has the sign of the friction torque every time.',
      },
      hints: [t`The data follow $\tau = I\alpha + \tau_f$ with $\tau_f > 0$. Where do they sit relative to $\tau = I\alpha$?`],
      teach: 'Forcing a fit through the origin moves any real offset into the slope.',
      explain: t`A line through the origin that best matches points lying $\tau_f$ above $I\alpha$ must be steeper than $I$. Here “no torque, no acceleration” is false anyway: below $\tau_f$ there is torque and no acceleration.`,
      visual: plot('rotary', EX.rows, { sys: true, origin: true, caption: 'The free fit (gold) and the fit forced through the origin (dashed).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reaction-wheel', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([0.0060, 0.0075, 0.0090]), tf = r.pick([0.001, 0.0015, 0.002]);
        const t1 = r.pick([0.020, 0.025]), t2 = t1 + r.pick([0.020, 0.030]);
        const a1 = +((t1 - tf) / I).toFixed(2), a2 = +((t2 - tf) / I).toFixed(2);
        const Ifit = (t2 - t1) / (a2 - a1);
        return {
          prompt: t`A satellite’s reaction wheel is spun up on a test stand. A motor torque of ${t1.toFixed(3)} N·m gives $\alpha = ${a1}\ \text{rad/s}^2$; ${t2.toFixed(3)} N·m gives $${a2}\ \text{rad/s}^2$. The bearing has some friction. What is the wheel’s moment of inertia?`,
          answer: Ifit, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [{ value: t2 / a2, feedback: t`A single ratio $\tau/\alpha$ includes the friction: $\tau/\alpha = I + \tau_f/\alpha$. Use the slope between the two points.` }, { value: t1 / a1, feedback: t`A single ratio $\tau/\alpha$ includes the friction. Use the change in torque over the change in $\alpha$.` }],
          hints: [t`$\tau = I\alpha + \tau_f$: two points fix both the slope and the intercept.`, t`$I = \dfrac{\Delta\tau}{\Delta\alpha} = \dfrac{${t2.toFixed(3)} - ${t1.toFixed(3)}}{${a2} - ${a1}}$.`],
          teach: 'With friction present, the moment of inertia is the slope of torque against angular acceleration, not a single ratio.',
          explain: t`$I = ${(t2 - t1).toFixed(3)}/${(a2 - a1).toFixed(2)} = ${Ifit.toFixed(5)}\ \text{kg·m}^2$, and the friction torque is $\tau_1 - I\alpha_1 = ${(t1 - Ifit * a1).toFixed(4)}$ N·m. Attitude-control engineers need $I$ to know how fast the wheel can turn the spacecraft.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, Math.ceil(a2 * 1.25)], y: [0, +(t2 * 1.3).toFixed(3)], xlabel: 'α (rad/s²)', ylabel: 'τ (N·m)', points: [{ x: a1, y: t1, r: 4.5, color: 'accent' }, { x: a2, y: t2, r: 4.5, color: 'accent' }], curves: [{ fn: `${+Ifit.toFixed(6)}*x + ${+(t1 - Ifit * a1).toFixed(5)}`, color: 'gold', dash: true, domain: [0, Math.ceil(a2 * 1.25)] }] }, caption: 'The two spin-up tests and the line through them. Where it meets α = 0 is the bearing friction.' },
        };
      },
    }),
    num({
      id: 'cp-agree', difficulty: 2,
      gen(r) {
        const { an } = spins(r, r.bool(0.5) ? 'friction' : null);
        const q = an.results[0];
        const I = +(q.value * 1000).toFixed(3), s = +(q.sigma * 1000).toPrecision(2), c = +(DISC * 1000).toFixed(3), sc = +(sDISC * 1000).toPrecision(2);
        const z = Math.abs(I - c) / Math.hypot(s, sc);
        return {
          prompt: t`The fit gives $I = (${I} \pm ${s})\times10^{-3}\ \text{kg·m}^2$; the balance and calipers give $\tfrac12 MR^2 = (${c} \pm ${sc})\times10^{-3}$. How many combined standard uncertainties apart are they?`,
          answer: +z.toPrecision(3), tol: { rel: 0.03, abs: 0.05 },
          hints: [t`$z = |I_1 - I_2|/\sqrt{\sigma_1^2 + \sigma_2^2}$.`],
          teach: 'Two independent determinations agree when their difference is within about two combined standard uncertainties.',
          explain: t`$z = ${Math.abs(I - c).toFixed(3)}/\sqrt{${s}^2 + ${sc}^2} = ${z.toFixed(2)}$: ${z <= 2 ? 'agreement — the spinning disc behaves like a uniform disc.' : 'a disagreement worth investigating.'}`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [8.8, 9.4], y: [0.3, 2.9], xlabel: 'I (10⁻³ kg·m²)', ylabel: ' ', yticks: 0.001, xticks: 6, curves: [{ param: [`${+(I - s).toFixed(4)} + ${+(2 * s).toFixed(4)}*t`, '2'], t: [0, 1], color: 'accent', width: 3 }, { param: [`${+(c - sc).toFixed(4)} + ${+(2 * sc).toFixed(4)}*t`, '1'], t: [0, 1], color: 'violet', width: 3 }], points: [{ x: I, y: 2, r: 4.5, color: 'accent', label: 'dynamic (fit)', labelDx: -36, labelDy: -16 }, { x: c, y: 1, r: 4.5, color: 'violet', label: '½MR² (balance, calipers)', labelDx: -60, labelDy: -16 }] }, caption: 'The two determinations of I with ±1σ bars.' },
        };
      },
    }),
    mcq({
      id: 'cp-tension', difficulty: 2,
      prompt: t`Why does the analysis use $T = m(g - \alpha r)$ rather than simply $T = mg$ for the string’s tension?`,
      choices: [
        t`The hanging mass accelerates downward, so the string pulls on it with less than its weight: $mg - T = m\alpha r$`,
        'Because the string stretches',
        'Because g is smaller near the floor',
        'It makes no difference at all to the result',
      ],
      answer: 0,
      why: {
        1: 'A light, stiff string barely stretches; and stretching would not change the force balance on the mass.',
        2: 'g barely changes over a metre.',
        3: t`Here the correction is under 1% — small, but systematic: ignoring it biases every torque, and so $I$, the same way.`,
      },
      hints: ['Apply Newton’s second law to the falling mass alone.'],
      teach: 'An accelerating hanging mass is not in equilibrium: the string’s tension is less than its weight by ma.',
      explain: t`For the mass, $mg - T = ma$ with $a = \alpha r$, so $T = m(g - \alpha r)$. The difference is $\alpha r/g$, under 1% here — a small systematic error a careful analysis removes rather than ignores.`,
      visual: apparatus('rotary', { at: 0.08, labels: false }, 'The falling mass accelerates, so its string carries less than its weight. Not to scale.'),
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (propagation) and ch. 8'),
    SOURCES.openstax('10.4', '10-4-moment-of-inertia-and-rotational-kinetic-energy', 'Moment of inertia and rotational kinetic energy'),
    SOURCES.openstax('10.7', '10-7-newtons-second-law-for-rotation', 'Newton’s second law for rotation'),
    SOURCES.aapt,
  ],
});
