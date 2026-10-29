// Lab 8 (virtual): momentum in collisions — two carts that stick together,
// measured by photogates before and after. The ratio p_after/p_before and its
// uncertainty, run to run and as the slope of a fit; kinetic energy lost
// while momentum is kept; and a mass left off the table that fakes a
// "violation" of momentum conservation.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;

// the worked example: eight pushes of about 0.5 m/s (seed 4)
const EX = (() => {
  const rows = B.makeData('collision', { seed: 4, n: 8, at: 0.5 }).rows;
  const ratios = rows.map((q) => (1.0 * q.R[1]) / (0.5 * q.R[0]));
  const st = B.stats(ratios);
  const [u, v] = rows[0].R;
  return { rows, ratios, st, u, v, pb: 0.5 * u, pa: 1.0 * v, K: (1.0 * v * v) / (0.5 * u * u) };
})();

const runs = (r, sys = null) => {
  const rows = B.makeData('collision', { seed: r.int(1, 999999), sys }).rows;
  return { rows, an: B.analyse('collision', rows, { sys }) };
};

export default lesson({
  id: 'phys2210.L.8',
  title: 'Momentum in collisions',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** Cart 1 is pushed along a level track through photogate A and runs into cart 2, at rest; Velcro makes them stick, and they leave together through photogate B. The bench computes both speeds with realistic photogate scatter; it leaves out friction between the gates.

With no outside push along the track during the collision, momentum is conserved:

$$m_1 u_1 = (m_1 + m_2)\,v \qquad\Longleftrightarrow\qquad \frac{p_\text{after}}{p_\text{before}} = \frac{(m_1 + m_2)\,v}{m_1 u_1} = 1$$

Kinetic energy is not: sticking carts keep only the fraction $m_1/(m_1 + m_2)$ of it. A lab tests the momentum ratio run by run, with its uncertainty, and as the slope of $p_\text{after}$ against $p_\text{before}$. (Lab skills trained: uncertainty of a ratio, and judging whether a conservation law holds.)`,
  symbols: [
    { tex: 'm_1,\\ m_2', text: 'the carts’ masses from a balance, in kg: here 0.500 kg each' },
    { tex: 'u_1', text: 'cart 1’s speed before the collision, from photogate A, in m/s' },
    { tex: 'v', text: 'the speed of the two carts together afterwards, from photogate B, in m/s' },
    { tex: 'p = mv', text: 'momentum, in kg·m/s: before, $m_1u_1$; after, $(m_1 + m_2)v$' },
    { tex: 'p_\\text{after}/p_\\text{before}', text: 'the momentum ratio — 1 if momentum is conserved and every mass is in the table' },
  ],
  why: 'Spacecraft docking, the recoil of a rocket stage, and every particle-physics collision are momentum bookkeeping; when a total seems not to balance, the missing momentum is a clue — sometimes to new physics, usually to a mass left out.',
  visual: {
    type: 'lab-bench',
    title: 'Crash two carts, time them before and after',
    lead: t`Six runs, pushed harder each time, are in the table. The plot shows momentum after against momentum before — both measured, so both have error bars — with the least-squares line.`,
    tasks: [
      'The slope is 1 within its uncertainty: momentum after equals momentum before, however hard the push.',
      'Turn on the unweighed bar: the slope drops to about 0.91. The carts did not lose momentum; your table has cart 2’s mass wrong.',
      'Push harder and softer: every run lands on the same line through the origin — momentum is conserved at every speed.',
    ],
    params: { exp: 'collision', seed: 15 },
  },
  example: {
    prompt: t`Eight pushes of about 0.5 m/s give the speeds in the table ($m_1 = m_2 = 0.500$ kg; each photogate speed uncertain by 0.5%). Test momentum conservation, run by run and overall, and find what fraction of the kinetic energy survives.`,
    visual: plot('collision', EX.rows, { repeat: true, table: true, caption: 'The momentum ratio of each run (dots), their mean with its ±1 SEM bar, and 1 (green, dashed).' }),
    steps: [
      { label: 'One run', text: t`Run 1: $p_\text{before} = (0.500)(${EX.u.toFixed(3)}) = ${EX.pb.toFixed(4)}$ kg·m/s and $p_\text{after} = (1.000)(${EX.v.toFixed(3)}) = ${EX.pa.toFixed(4)}$ kg·m/s: ratio $${(EX.pa / EX.pb).toFixed(3)}$.` },
      { label: 'Its uncertainty', text: t`A ratio of two independent measurements carries their relative uncertainties in quadrature: $\sqrt{0.5^2 + 0.5^2}\% = 0.71\%$ (the balance’s masses add far less). So one run gives $${(EX.pa / EX.pb).toFixed(3)} \pm ${(0.0071 * EX.pa / EX.pb).toFixed(3)}$ — consistent with 1 on its own.` },
      { label: 'All eight', text: t`The eight ratios average $${EX.st.mean.toFixed(4)}$ with $s = ${EX.st.sd.toFixed(4)}$ — close to the predicted 0.0071, a sign the error budget is right — so $\sigma_{\bar R} = ${EX.st.sem.toFixed(4)}$.` },
      { label: 'Test', text: t`$|${EX.st.mean.toFixed(4)} - 1|/${EX.st.sem.toFixed(4)} = ${(Math.abs(EX.st.mean - 1) / EX.st.sem).toFixed(1)}$: momentum is conserved to within about 0.3%.` },
      { label: 'Kinetic energy', text: t`For run 1, $\dfrac{K_\text{after}}{K_\text{before}} = \dfrac{(1.000)(${EX.v.toFixed(3)})^2}{(0.500)(${EX.u.toFixed(3)})^2} = ${EX.K.toFixed(3)}$ — about half, as $m_1/(m_1 + m_2) = 0.5$ predicts. Half the kinetic energy went into the Velcro, heat and sound, while every bit of the momentum survived.` },
    ],
    answer: t`Mean momentum ratio $${pmTeX(EX.st.mean, EX.st.sem)}$: conserved. Kinetic energy ratio about ${EX.K.toFixed(2)}, as a perfectly inelastic collision of equal masses predicts.`,
  },
  practice: [
    num({
      id: 'p-before', difficulty: 1,
      gen(r) {
        const m1 = r.pick([0.25, 0.5, 0.75]), u = r.pick([0.312, 0.455, 0.487, 0.538, 0.603]);
        return {
          prompt: t`Cart 1, of mass ${m1.toFixed(3)} kg, passes photogate A at $${u.toFixed(3)}$ m/s. What is its momentum?`,
          answer: m1 * u, units: 'kg m/s', tol: { rel: 0.004 },
          errors: [{ value: 0.5 * m1 * u * u, feedback: t`That is the kinetic energy, $\tfrac12 mv^2$, in joules. Momentum is $mv$.` }],
          hints: [t`$p = mv$.`],
          teach: 'Momentum is mass times velocity.',
          explain: t`$p = ${m1.toFixed(3)}\times${u.toFixed(3)} = ${(m1 * u).toFixed(4)}$ kg·m/s.`,
          visual: apparatus('collision', { params: { m1 } }, 'Cart 1 approaching cart 2, at rest, between the two photogates. Not to scale.'),
        };
      },
    }),
    num({
      id: 'ratio', difficulty: 2,
      gen(r) {
        const row = B.makeData('collision', { seed: r.int(1, 999999), n: 1, at: r.pick([0.4, 0.5, 0.6]) }).rows[0];
        const [u, v] = row.R, R = (1.0 * v) / (0.5 * u);
        return {
          prompt: t`Equal 0.500 kg carts: gate A reads $u_1 = ${u.toFixed(3)}$ m/s, and the stuck pair passes gate B at $v = ${v.toFixed(3)}$ m/s. What is $p_\text{after}/p_\text{before}$?`,
          answer: R, tol: { rel: 0.002 },
          errors: [{ value: v / u, feedback: t`The pair after the collision has twice the mass: $p_\text{after} = (m_1 + m_2)v$.` }],
          hints: [t`$p_\text{after} = (m_1 + m_2)v$, $p_\text{before} = m_1 u_1$.`],
          teach: 'The momentum ratio compares the moving pair’s momentum after the collision with cart 1’s before.',
          explain: t`$\dfrac{(1.000)(${v.toFixed(3)})}{(0.500)(${u.toFixed(3)})} = ${R.toFixed(4)}$ — within the 0.7% uncertainty of 1.`,
          visual: apparatus('collision', { data: [[0.5, u, v]] }, 'The collision, with both photogate readings. Not to scale.'),
        };
      },
    }),
    num({
      id: 'ratio-uncertainty', difficulty: 3,
      gen(r) {
        const su = r.pick([0.4, 0.5, 0.8]), sv = r.pick([0.5, 0.6, 1.0]);
        const s = Math.hypot(su, sv);
        return {
          prompt: t`Photogate A gives $u_1$ to ${su.toFixed(1)}% and photogate B gives $v$ to ${sv.toFixed(1)}%; the masses are known far better. What is the relative uncertainty of $p_\text{after}/p_\text{before}$, in percent?`,
          answer: s, units: '%', tol: { rel: 0.02 },
          errors: [{ value: su + sv, feedback: 'Independent errors add in quadrature, √(a² + b²), not linearly.' }, { value: Math.abs(sv - su), feedback: 'Uncertainties never cancel in a ratio: either error can push the ratio either way.' }],
          hints: ['For a product or ratio, combine the relative uncertainties.', t`$\dfrac{\sigma_R}{R} = \sqrt{\left(\dfrac{\sigma_u}{u}\right)^2 + \left(\dfrac{\sigma_v}{v}\right)^2}$.`],
          teach: 'The relative uncertainty of a ratio of independent measurements is the quadrature sum of their relative uncertainties.',
          explain: t`$\sqrt{${su.toFixed(1)}^2 + ${sv.toFixed(1)}^2}\% = ${s.toFixed(2)}\%$.`,
          visual: apparatus('collision', { labels: false }, 'Two photogates, two independent speed measurements. Not to scale.'),
        };
      },
    }),
    num({
      id: 'ke-ratio', difficulty: 2,
      gen(r) {
        const m1 = r.pick([0.25, 0.5, 0.75]), m2 = r.pick([0.25, 0.5, 0.75, 1.0]);
        const k = m1 / (m1 + m2);
        return {
          prompt: t`A ${m1.toFixed(2)} kg cart sticks to a ${m2.toFixed(2)} kg cart at rest. What fraction of the kinetic energy is left after the collision?`,
          answer: k, tol: { rel: 0.003 },
          errors: [{ value: 1, feedback: 'Kinetic energy is not conserved when the carts stick: only momentum is.' }, { value: (m1 / (m1 + m2)) ** 2, feedback: t`Use momentum: $v = \dfrac{m_1}{m_1 + m_2}u$, then $K_\text{after}/K_\text{before} = \dfrac{(m_1 + m_2)v^2}{m_1u^2}$ — one factor cancels.` }],
          hints: [t`From momentum, $v = \dfrac{m_1 u}{m_1 + m_2}$.`, t`$\dfrac{K_\text{after}}{K_\text{before}} = \dfrac{\tfrac12(m_1 + m_2)v^2}{\tfrac12 m_1u^2}$; substitute $v$.`],
          teach: 'In a perfectly inelastic collision with the target at rest, the kinetic energy kept is m₁/(m₁ + m₂).',
          explain: t`$\dfrac{(m_1 + m_2)}{m_1}\left(\dfrac{m_1}{m_1 + m_2}\right)^2 = \dfrac{m_1}{m_1 + m_2} = ${k.toFixed(3)}$.`,
          visual: apparatus('collision', { params: { m1, m2 }, labels: false }, `A ${m1.toFixed(2)} kg cart about to hit a ${m2.toFixed(2)} kg cart at rest. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'missing-momentum', difficulty: 2,
      gen(r) {
        const { rows, an } = runs(r, 'mass');
        const q = an.results[0];
        return {
          prompt: t`A group’s fit of $p_\text{after}$ against $p_\text{before}$ gives slope $${pmTeX(q.value, q.sigma)}$ — many standard errors below 1. What is the most likely explanation?`,
          choices: [
            'A mass is wrong in their table: if cart 2 really carries extra mass, the pair moves slower than the recorded masses predict, and the ratio falls',
            'Momentum is not conserved in collisions where the carts stick',
            'The lost momentum went into heat and sound in the Velcro',
            'Random error: more runs will bring the slope back to 1',
          ],
          answer: 0,
          why: {
            1: 'Momentum is conserved in every collision with no outside force along the track — sticky ones included. It is kinetic energy that sticky collisions lose.',
            2: 'Heat and sound carry away kinetic energy, not momentum: the Velcro pushes the carts on each other equally and oppositely.',
            3: 'The slope is many standard errors from 1; more runs would only shrink the error bar on the same wrong value.',
          },
          hints: ['A conservation law that fails by 9% in a simple cart experiment is more likely bookkeeping than physics.', 'Which measured quantity could be wrong by 10% without the photogates noticing?'],
          teach: 'When a well-tested conservation law appears to fail, check the inputs — masses, calibrations — before doubting the law.',
          explain: t`With an unrecorded 0.100 kg on cart 2, the pair is really 1.100 kg, so it moves at $1/1.1$ of the speed the table expects: the computed ratio is $1/1.1 = 0.909$. Weigh everything that moves.`,
          visual: plot('collision', rows, { sys: true, expected: true, caption: 'p after against p before (gold) and the line of conservation, slope 1 (dashed).' }),
        };
      },
    }),
    mcq({
      id: 'ke-not-p', difficulty: 2,
      prompt: t`Half the kinetic energy disappears when the carts stick. Doesn’t that mean some momentum must disappear too?`,
      choices: [
        'No: the carts push on each other with equal and opposite forces for the same time, so their momentum changes cancel; nothing requires the kinetic energy to survive',
        'Yes: momentum and kinetic energy are always lost together',
        'Yes, but the loss is too small to measure',
        'No, because momentum is a scalar and cannot be lost',
      ],
      answer: 0,
      why: {
        1: 'They are different quantities: momentum is protected by Newton’s third law, kinetic energy is not.',
        2: 'Measurements give a momentum ratio of 1.000 ± 0.003 — an energy loss of 50% with no momentum loss within 0.3%.',
        3: 'Momentum is a vector; that is why it can cancel in collisions where the bodies move toward each other.',
      },
      hints: ['What does Newton’s third law say about the forces the carts exert on each other?'],
      teach: 'Momentum is conserved in every collision (equal and opposite impulses); kinetic energy only in elastic ones.',
      explain: 'During the collision each cart gets an impulse equal and opposite to the other’s, so the total momentum cannot change. The kinetic energy can: work done crushing the Velcro turns into heat and sound.',
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [0, 1.2], xlabel: ' ', ylabel: 'after ÷ before', xticks: 0.001, shade: [{ fn: '1', from: 0.4, to: 1.2, color: 'accent', alpha: 0.75 }, { fn: '0.5', from: 1.8, to: 2.6, color: 'violet', alpha: 0.75 }], points: [{ x: 0.45, y: 1.08, r: 0.01, color: 'accent', label: 'momentum: 1.00' }, { x: 1.85, y: 0.58, r: 0.01, color: 'violet', label: 'kinetic energy: 0.50' }] }, caption: 'What survives a sticky collision of equal carts: all of the momentum, half of the kinetic energy.' },
    }),
    code({
      id: 'ratio-code', difficulty: 2,
      gen(r) {
        const rows = B.makeData('collision', { seed: r.int(1, 999999), n: 10, at: 0.5 }).rows;
        const us = rows.map((q) => q.R[0]), vs = rows.map((q) => q.R[1]);
        const R = rows.map((q) => (1.0 * q.R[1]) / (0.5 * q.R[0]));
        const st = B.stats(R);
        const data = t`import numpy as np

m1, m2 = 0.500, 0.500                                   # kg
u1 = np.array([${us.map((v) => v.toFixed(3)).join(', ')}])   # m/s, gate A
v = np.array([${vs.map((x) => x.toFixed(3)).join(', ')}])    # m/s, gate B
`;
        return {
          prompt: t`For ten runs, compute the momentum ratio of each run, then set \`R_mean\` to their mean and \`R_sem\` to its standard error (use \`ddof=1\` for the standard deviation).`,
          starter: t`${data}
R = 0 * v            # the momentum ratio of each run
R_mean = 0.0
R_sem = 0.0
print(R_mean, R_sem)
`,
          answer: t`${data}
R = (m1 + m2) * v / (m1 * u1)
R_mean = R.mean()
R_sem = R.std(ddof=1) / np.sqrt(len(R))
print(f"p_after/p_before = {R_mean:.4f} ± {R_sem:.4f}")
`,
          tests: [
            { name: 'each ratio is (m₁ + m₂)v / (m₁u₁)', code: 'abs(R[0] - (m1 + m2) * v[0] / (m1 * u1[0])) < 1e-12' },
            { name: `the mean ratio is ${st.mean.toFixed(4)}`, code: `abs(R_mean - ${st.mean}) < 1e-9` },
            { name: `the standard error is ${st.sem.toFixed(4)} (sample SD, ddof=1, over √10)`, code: `abs(R_sem - ${st.sem}) < 1e-9` },
          ],
          hints: [t`\`R = (m1 + m2) * v / (m1 * u1)\` works on whole arrays.`, t`\`R.std(ddof=1) / np.sqrt(len(R))\` — NumPy’s default \`ddof=0\` would divide by $N$.`],
          teach: 'NumPy computes a whole column of derived values at once; the standard error is the sample SD (ddof=1) over √N.',
          explain: t`The ratios average $${st.mean.toFixed(4)} \pm ${st.sem.toFixed(4)}$. Note \`ddof=1\`: NumPy’s \`std\` divides by $N$ unless told otherwise, which would underestimate the scatter.`,
          visual: plot('collision', rows, { repeat: true, stats: false, caption: 'The ten runs’ momentum ratios.' }),
        };
      },
    }),
    num({
      id: 'how-many', difficulty: 3,
      gen(r) {
        const s = r.pick([0.7, 0.8, 0.9]), target = r.pick([0.2, 0.25]);
        const N = Math.ceil((s / target) ** 2);
        return {
          prompt: t`One run’s momentum ratio scatters by $s = ${s.toFixed(1)}\%$. How many runs must you average to know the mean ratio to $\pm${target}\%$ (one standard error)?`,
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.ceil(s / target), feedback: t`The standard error falls as $1/\sqrt N$, so $N = (s/\sigma)^2$ — square the ratio.` }],
          hints: [t`$\sigma_{\bar R} = s/\sqrt N$. Solve for $N$.`, t`$N = (s/\sigma_{\bar R})^2 = (${s}/${target})^2$, rounded up.`],
          teach: 'To shrink a standard error by a factor k you need k² times as many readings.',
          explain: t`$N = (${s}/${target})^2 = ${((s / target) ** 2).toFixed(2)}$, so ${N} runs. Halving the target would need four times as many.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 40], y: [0, 1], xlabel: 'number of runs N', ylabel: 'standard error (%)', curves: [{ fn: `${s}/sqrt(x)`, color: 'accent', domain: [1, 40] }], hlines: [{ y: target, label: `target ±${target}%`, color: 'gold' }] }, caption: `The standard error of the mean ratio, ${s}%/√N, against the number of runs.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-docking', difficulty: 3, transfer: true,
      gen(r) {
        const m1 = r.pick([100, 120, 150]), m2 = r.pick([400, 480, 600]), u = r.pick([0.200, 0.250, 0.300]);
        const vTrue = (m1 * u) / (m1 + m2);
        const v = +(vTrue * (1 + r.pick([-0.006, -0.004, 0.003, 0.005]))).toFixed(4);
        const R = ((m1 + m2) * v) / (m1 * u);
        return {
          prompt: t`On an air-bearing floor, a ${m1} kg docking-test vehicle glides at $${u.toFixed(3)}$ m/s into a ${m2} kg target at rest and latches on. Afterwards the pair moves at $${v.toFixed(4)}$ m/s. What is $p_\text{after}/p_\text{before}$?`,
          answer: R, tol: { rel: 0.002 },
          errors: [{ value: v / u, feedback: 'Include the masses: after the latch the moving mass is the sum of both.' }],
          hints: [t`$p_\text{before} = m_1u$; $p_\text{after} = (m_1 + m_2)v$.`, t`$\dfrac{(${m1 + m2})(${v.toFixed(4)})}{(${m1})(${u.toFixed(3)})}$.`],
          teach: 'Docking is a perfectly inelastic collision: the latched pair carries the approaching vehicle’s momentum.',
          explain: t`$\dfrac{${m1 + m2}\times${v.toFixed(4)}}{${m1}\times${u.toFixed(3)}} = ${R.toFixed(4)}$ — within the half-percent precision of typical speed measurements, momentum is conserved. Air-bearing floors exist to make the horizontal forces negligible, just as a cart track does.`,
          visual: apparatus('collision', { params: { m1: m1 / 1000, m2: m2 / 1000 }, labels: false }, 'A chaser and a target on a frictionless floor — the cart experiment, scaled up. Not to scale.'),
        };
      },
    }),
    num({
      id: 'cp-mass-from-ke', difficulty: 2,
      gen(r) {
        const m1 = r.pick([0.25, 0.5]), m2 = r.pick([0.5, 0.75, 1.0]);
        const k = +(m1 / (m1 + m2)).toFixed(3);
        const m2c = m1 * (1 / k - 1);
        return {
          prompt: t`A ${m1.toFixed(3)} kg cart sticks to a cart of unknown mass at rest, and keeps a fraction $K_\text{after}/K_\text{before} = ${k.toFixed(3)}$ of its kinetic energy. What is the unknown mass?`,
          answer: m2c, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: m1 * k, feedback: t`Invert the relation: $K_\text{after}/K_\text{before} = m_1/(m_1 + m_2)$, so $m_2 = m_1(1/k - 1)$.` }, { value: m1 / k, feedback: t`That is $m_1 + m_2$, the total. Subtract $m_1$.` }],
          hints: [t`$k = \dfrac{m_1}{m_1 + m_2}$.`, t`$m_1 + m_2 = m_1/k$, so $m_2 = m_1/k - m_1$.`],
          teach: 'The kinetic energy kept in a sticky collision depends only on the mass ratio — so it can measure an unknown mass.',
          explain: t`$m_2 = ${m1}\,(1/${k.toFixed(3)} - 1) = ${m2c.toFixed(3)}$ kg.`,
          visual: apparatus('collision', { params: { m1, m2: m2c }, labels: false }, 'A cart of known mass about to hit one of unknown mass. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-coast-test', difficulty: 2,
      prompt: t`Thirty runs give a momentum ratio of $0.982 \pm 0.002$: 9σ below 1, though every mass checks out on the balance. You suspect friction slows the carts between the two gates. Which test checks that best?`,
      choices: [
        'Send cart 1 alone through both gates, with no collision, and compare its two speeds',
        'Take thirty more collision runs',
        'Fit the data through the origin',
        'Use heavier carts so the collision is harder',
      ],
      answer: 0,
      why: {
        1: 'More of the same data shrinks the error bar on the same 1.8% gap; it cannot say where the gap comes from.',
        2: 'The ratio is the slope either way; forcing the intercept changes nothing about friction.',
        3: 'Heavier carts change the collision, not the friction test; the question is how much speed a cart loses coasting between the gates.',
      },
      hints: ['Isolate the suspected cause: measure it on its own, without the collision.'],
      teach: 'Test a suspected systematic error directly with a control measurement that isolates it.',
      explain: 'A coast test measures the speed lost between the gates with no collision at all. If cart 1 alone loses about 1.8%, friction explains the gap — and you can correct for it.',
      visual: apparatus('collision', { labels: false }, 'Gate A and gate B: a cart coasting through both, with no collision, measures the friction loss between them. Not to scale.'),
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (relative uncertainties of products and ratios)'),
    SOURCES.openstax('9.4', '9-4-types-of-collisions', 'Types of collisions'),
    SOURCES.aapt,
  ],
});
