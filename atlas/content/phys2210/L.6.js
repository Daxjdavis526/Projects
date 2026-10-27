// Lab 6 (virtual): coefficients of friction — peak and sliding forces against
// the normal force (two lines, two slopes), the tilting-board method as an
// independent check, and a systematic error that no fit diagnostic can see.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8, D2R = Math.PI / 180;
const muTan = (thDeg, sDeg) => ({ mu: Math.tan(thDeg * D2R), s: (1 + Math.tan(thDeg * D2R) ** 2) * sDeg * D2R });

// the worked example: six pulls made with the string tilted (seed 115), and twelve tilts (seed 20)
const EX = (() => {
  const rows = B.makeData('friction', { seed: 115, sys: 'angle' }).rows;
  const an = B.analyse('friction', rows, { sys: 'angle' });
  const tilts = B.makeData('tilt', { seed: 20, n: 12 }).rows;
  const st = B.stats(tilts.map((q) => q.R[0]));
  const tilt = muTan(st.mean, st.sem);
  const [s, k] = an.results;
  return { rows, an, s, k, tilts, st, tilt, z: Math.abs(s.value - tilt.mu) / Math.hypot(s.sigma, tilt.s) };
})();

const pulls = (r, sys = null) => {
  const rows = B.makeData('friction', { seed: r.int(1, 999999), sys }).rows;
  return { rows, an: B.analyse('friction', rows, { sys }) };
};
const tiltRows = (r, n = 12, sys = null) => B.makeData('tilt', { seed: r.int(1, 999999), n, sys }).rows;

export default lesson({
  id: 'phys2210.L.6',
  title: 'Coefficients of friction',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A force sensor drags a wooden block, loaded with masses, across a board. Each pull’s force rises to a **peak** just before the block breaks loose, then settles to a lower **sliding** value. The bench computes both with realistic pull-to-pull scatter.

If friction is proportional to the normal force, as Amontons found, the two readings lie on two straight lines through the origin:

$$F_\text{peak} = \mu_s N, \qquad F_\text{slide} = \mu_k N, \qquad \text{and on a tilted board}\quad \mu_s = \tan\theta_c$$

The slopes are the coefficients. The tilting board — raise one end until the block slips — measures $\mu_s$ a completely different way, and that independence is what makes it a check. (Lab skills trained: testing a model, and troubleshooting an experiment with an independent method.)`,
  symbols: [
    { tex: 'N', text: 'the normal force, in N: on a level board with a horizontal pull, the weight of block and load, $(m_b + m)g$' },
    { tex: 'F_\\text{peak},\\ F_\\text{slide}', text: 'the largest force before the block moves, and the steady force while it slides, from the sensor, in N' },
    { tex: '\\mu_s', text: 'the coefficient of static friction (no units): the peak force per newton of normal force' },
    { tex: '\\mu_k', text: 'the coefficient of kinetic friction (no units), usually smaller than $\\mu_s$' },
    { tex: '\\theta_c', text: 'the critical angle: the tilt at which the block starts to slip. There the slope of the weight, $mg\\sin\\theta_c$, just equals $\\mu_s mg\\cos\\theta_c$' },
  ],
  why: 'How steep a slope a rover can climb, how hard a booster’s legs can brake on a drone ship, how much grip a tyre has — each is a friction coefficient someone measured, preferably two different ways.',
  visual: {
    type: 'lab-bench',
    title: 'Drag a loaded block',
    lead: t`Six pulls are in the table, from no load to 1.25 kg. Each gives a peak and a sliding force, plotted against the normal force $N$ with a least-squares line for each.`,
    tasks: [
      'Read the two slopes in the readout: μs ≈ 0.42 for the peaks (blue) and μk ≈ 0.30 for sliding (violet). Both lines pass close to the origin.',
      'Turn on the tilted pull: both slopes drop several percent — yet the lines still pass through the origin and χ²/dof barely changes. Nothing in the fit warns you.',
      'Take several pulls at one load: the peaks scatter more than the sliding forces, because static friction depends on how the surfaces happened to settle.',
    ],
    params: { exp: 'friction', seed: 115 },
  },
  example: {
    prompt: t`Six pulls give the peak and sliding forces in the table. Twelve tilting-board trials with the same block give a mean slipping angle of $${EX.st.mean.toFixed(2)}^\circ$ with a standard error of $${EX.st.sem.toFixed(2)}^\circ$. Find both coefficients from the pulls, and check $\mu_s$ against the tilting board.`,
    visual: plot('friction', EX.rows, { sys: true, table: true, caption: 'Peak (blue) and sliding (violet) forces against the normal force, each with its least-squares line.' }),
    steps: [
      { label: 'Fit', text: t`Two lines, both with intercepts within about one standard error of zero and $\chi^2/\text{dof}$ near 1 (${EX.an.series[0].fit.chi2r.toFixed(2)} and ${EX.an.series[1].fit.chi2r.toFixed(2)}): friction proportional to $N$, as expected.` },
      { label: 'Coefficients', text: t`The slopes: $\mu_s = ${pmTeX(EX.s.value, EX.s.sigma)}$ and $\mu_k = ${pmTeX(EX.k.value, EX.k.sigma)}$. Sliding takes less force than breaking loose, as usual.` },
      { label: 'The tilt method', text: t`$\mu_s = \tan\theta_c = \tan ${EX.st.mean.toFixed(2)}^\circ = ${EX.tilt.mu.toFixed(3)}$. Its uncertainty: $\dfrac{d}{d\theta}\tan\theta = \sec^2\theta$, so $\sigma_\mu = \sec^2\theta_c\,\sigma_\theta = (1 + ${EX.tilt.mu.toFixed(3)}^2)\times(${EX.st.sem.toFixed(2)}\times\pi/180) = ${EX.tilt.s.toFixed(4)}$.` },
      { label: 'Compare', text: t`$z = \dfrac{|${EX.s.value.toFixed(3)} - ${EX.tilt.mu.toFixed(3)}|}{\sqrt{${EX.s.sigma.toFixed(3)}^2 + ${EX.tilt.s.toFixed(3)}^2}} = ${EX.z.toFixed(1)}$. The two methods **disagree**: something is wrong with one of them.` },
      { label: 'Troubleshoot', text: t`The pull fits looked perfect, so look at the apparatus: the sensor was held high, and the string rose at 20°. A tilted pull lifts the block — less normal force than the weight you plotted — and only $\cos 20^\circ$ of it drags. Both slopes come out low by the factor $1/(\cos\alpha + \mu\sin\alpha)$: 7.7% for $\mu_s$. No residual or $\chi^2$ can show this; only an independent method could.` },
    ],
    answer: t`Pulls: $\mu_s = ${pmTeX(EX.s.value, EX.s.sigma)}$, $\mu_k = ${pmTeX(EX.k.value, EX.k.sigma)}$; tilting board: $\mu_s = ${pmTeX(EX.tilt.mu, EX.tilt.s)}$. The ${EX.z.toFixed(1)}σ disagreement exposes the tilted string; pulled horizontally, the board and the pulls agree.`,
  },
  practice: [
    num({
      id: 'normal-force', difficulty: 1,
      gen(r) {
        const m = r.pick([0.25, 0.5, 0.75, 1.0, 1.25]);
        const N = (0.25 + m) * G;
        return {
          prompt: t`The block has mass 0.250 kg and carries a ${m.toFixed(2)} kg load, pulled horizontally on a level board. What normal force goes on the horizontal axis of the plot?`,
          answer: N, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: m * G, feedback: 'The block presses on the board too: N = (block + load) × g.' }, { value: 0.25 + m, feedback: 'That is a mass in kilograms. Multiply by g to get the force.' }],
          hints: [t`With a horizontal pull and nothing else vertical, $N = (m_b + m)g$.`],
          teach: 'On a level surface with a horizontal pull, the normal force equals the total weight resting on the surface.',
          explain: t`$N = (0.250 + ${m.toFixed(2)})(9.8) = ${N.toFixed(2)}$ N.`,
          visual: apparatus('friction', { at: m }, `The block with its ${m.toFixed(2)} kg load. Not to scale.`),
        };
      },
    }),
    num({
      id: 'tan-theta', difficulty: 2,
      gen(r) {
        const rows = tiltRows(r);
        const st = B.stats(rows.map((q) => q.R[0]));
        const th = +st.mean.toFixed(1);
        return {
          prompt: t`Twelve tilting-board trials give a mean slipping angle of $${th.toFixed(1)}^\circ$. What static coefficient does that give?`,
          answer: Math.tan(th * D2R), tol: { rel: 0.003 },
          errors: [{ value: Math.sin(th * D2R), feedback: t`At the slipping point $mg\sin\theta_c = \mu_s mg\cos\theta_c$, so $\mu_s = \tan\theta_c$, not $\sin\theta_c$.` }, { value: th * D2R, feedback: 'That is the angle in radians. The coefficient is its tangent.' }],
          hints: [t`At the slipping point, the slope component of the weight equals the largest static friction: $mg\sin\theta_c = \mu_s\,mg\cos\theta_c$.`],
          teach: 'A block that just starts to slip on a tilted board has μs = tan θc.',
          explain: t`$\mu_s = \tan ${th.toFixed(1)}^\circ = ${Math.tan(th * D2R).toFixed(3)}$.`,
          visual: plot('tilt', rows, { repeat: true, caption: 'The twelve slipping angles, their mean with its ±1 SEM bar, and the ±1 SD band.' }),
        };
      },
    }),
    num({
      id: 'sigma-tan', difficulty: 3,
      gen(r) {
        const rows = tiltRows(r);
        const st = B.stats(rows.map((q) => q.R[0]));
        const th = +st.mean.toFixed(1), se = +st.sem.toFixed(2);
        const m = muTan(th, se);
        return {
          prompt: t`The mean slipping angle is $${th.toFixed(1)}^\circ \pm ${se.toFixed(2)}^\circ$ (mean ± SEM), so $\mu_s = \tan ${th.toFixed(1)}^\circ = ${m.mu.toFixed(3)}$. What is the standard uncertainty of $\mu_s$?`,
          answer: +m.s.toPrecision(3), tol: { rel: 0.03 },
          errors: [{ value: se * D2R, feedback: t`That is the angle’s uncertainty in radians. Multiply by the derivative of $\tan\theta$, which is $\sec^2\theta = 1 + \tan^2\theta$.` }, { value: Math.tan(se * D2R), feedback: t`Propagate through the derivative instead: $\sigma_\mu = \sec^2\theta\,\sigma_\theta$.` }],
          hints: [t`$\sigma_\mu = \left|\dfrac{d\mu}{d\theta}\right|\sigma_\theta$ with $\mu = \tan\theta$.`, t`$\dfrac{d}{d\theta}\tan\theta = \sec^2\theta = 1 + \tan^2\theta$, and $\sigma_\theta$ must be in radians: $${se}^\circ = ${(se * D2R).toFixed(5)}$ rad.`],
          teach: 'Propagate an angle’s uncertainty through the derivative of the function, with the angle in radians.',
          explain: t`$\sigma_\mu = (1 + ${m.mu.toFixed(3)}^2)(${(se * D2R).toFixed(5)}) = ${m.s.toFixed(4)}$, so $\mu_s = ${pmTeX(m.mu, m.s)}$.`,
          visual: apparatus('tilt', { data: [[th]] }, `The board tilted to the mean slipping angle, ${th.toFixed(1)}°. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'peak-scatter', difficulty: 2,
      prompt: 'Across repeated pulls at one load, the peak force scatters about 4% while the sliding force scatters about 2%. Which is the best explanation?',
      choices: [
        'Static friction depends on how the surfaces happened to settle into each other before the pull, which varies from pull to pull',
        'The force sensor is less accurate at larger forces',
        'The peak is a single instant, so it is a random error that more pulls would remove entirely',
        'Kinetic friction does not depend on the surfaces',
      ],
      answer: 0,
      why: {
        1: 'The peak is larger, but the sensor’s precision is about the same at both forces; the extra scatter is in the physics.',
        2: 'More pulls make the *mean* peak better known, but each pull will still scatter by 4%: the scatter is real variation, not a measuring mistake.',
        3: 'Kinetic friction depends on the surfaces too — that is why μk differs for wood, rubber and ice. It is just steadier while sliding.',
      },
      hints: ['Is the extra scatter in the instrument or in the friction itself?'],
      teach: 'Scatter can be a property of what you measure, not only of how you measure it — static friction varies from trial to trial.',
      explain: 'Before each pull the block settles into the board a little differently, so the force needed to break it loose varies. Once sliding, the contact is constantly renewed and averages out, so the sliding force is steadier.',
      visual: (() => {
        const rows = B.makeData('friction', { seed: 9, settings: Array(8).fill(0.5) }).rows;
        const mean = (k) => rows.reduce((s, q) => s + q.R[k], 0) / rows.length;
        return {
          type: 'graph',
          params: {
            aspect: 'wide', x: [0.3, 8.7], y: [1.6, 3.6], xlabel: 'pull number', ylabel: 'force (N)', xticks: 8,
            points: rows.flatMap((q, i) => [{ x: i + 1, y: q.R[0], r: 4, color: 'accent' }, { x: i + 1, y: q.R[1], r: 4, color: 'violet' }]),
            hlines: [{ y: +mean(0).toFixed(3), label: 'mean peak', color: 'accent' }, { y: +mean(1).toFixed(3), label: 'mean sliding', color: 'violet' }],
          },
          caption: 'Eight pulls at the same load (0.50 kg): peak forces (blue) and sliding forces (violet), each with its mean.',
        };
      })(),
    }),
    mcq({
      id: 'zero-offset', difficulty: 2,
      gen(r) {
        const { rows, an } = pulls(r, 'zero');
        const f = an.series[1].fit;
        return {
          prompt: t`A group’s sliding-force line has slope $${pmTeX(f.b, f.sb)}$ and intercept $${pmTeX(f.a, f.sa, t`\text{N}`)}$; the peak-force line has an intercept just as large. What is the most likely cause?`,
          choices: [
            'The force sensor was not zeroed: every reading carries the same extra 0.2 N. The slopes are still good',
            'Friction does not depend on the normal force',
            'μk is 0.2',
            'The block was too heavy for the board',
          ],
          answer: 0,
          why: {
            1: t`The slopes are clearly not zero: friction rises with $N$. Something adds a *constant* to every reading.`,
            2: 'The coefficient is the slope, a ratio of forces; the intercept is a force, in newtons.',
            3: 'A heavy block changes N, which only moves points along the line.',
          },
          hints: ['Both lines are shifted up by the same amount. What adds the same force to every reading?'],
          teach: 'An offset common to every reading shows up as the same intercept on every line, and leaves the slopes alone.',
          explain: t`Both intercepts, about $+0.2$ N, sit many standard errors above zero — the sensor read 0.2 N with nothing attached. Zero it before pulling; meanwhile the slopes, and so the coefficients, are unaffected.`,
          visual: plot('friction', rows, { sys: true, sysKind: 'zero', caption: 'Peak and sliding forces against N, each with its least-squares line.' }),
        };
      },
    }),
    num({
      id: 'methods-z', difficulty: 2,
      gen(r) {
        const { an } = pulls(r, r.bool(0.5) ? 'angle' : null);
        const s = an.results[0];
        const st = B.stats(tiltRows(r).map((q) => q.R[0]));
        const tm = muTan(st.mean, st.sem);
        const a = +s.value.toFixed(3), sa = +s.sigma.toPrecision(2), b = +tm.mu.toFixed(3), sb = +tm.s.toPrecision(2);
        const z = Math.abs(a - b) / Math.hypot(sa, sb);
        return {
          prompt: t`Pulling gives $\mu_s = ${a.toFixed(3)} \pm ${sa}$; the tilting board gives $\mu_s = ${b.toFixed(3)} \pm ${sb}$. How many combined standard uncertainties apart are they?`,
          answer: +z.toPrecision(3), tol: { rel: 0.03, abs: 0.03 },
          hints: [t`$z = |a - b|/\sqrt{\sigma_a^2 + \sigma_b^2}$.`],
          teach: 'Two independent measurements agree if their difference is within about two combined standard uncertainties.',
          explain: t`$z = ${Math.abs(a - b).toFixed(3)}/\sqrt{${sa}^2 + ${sb}^2} = ${z.toFixed(1)}$: ${z <= 2 ? 'the methods agree.' : 'they disagree — one method has a systematic error to find.'}`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0.33, 0.47], y: [0.3, 2.9], xlabel: 'μs', ylabel: ' ', yticks: 0.001, xticks: 7, curves: [{ param: [`${+(a - sa).toFixed(4)} + ${+(2 * sa).toFixed(4)}*t`, '2'], t: [0, 1], color: 'accent', width: 3 }, { param: [`${+(b - sb).toFixed(4)} + ${+(2 * sb).toFixed(4)}*t`, '1'], t: [0, 1], color: 'violet', width: 3 }], points: [{ x: a, y: 2, r: 4.5, color: 'accent', label: 'pulling', labelDx: -24, labelDy: -16 }, { x: b, y: 1, r: 4.5, color: 'violet', label: 'tilting board', labelDx: -36, labelDy: -16 }] }, caption: 'The two measurements of μs with ±1σ bars.' },
        };
      },
    }),
    code({
      id: 'fit-mu', difficulty: 2,
      gen(r) {
        const { rows } = pulls(r);
        const Ns = rows.map((q) => (0.25 + q.s) * G), Fp = rows.map((q) => q.R[0]), Fs = rows.map((q) => q.R[1]);
        const fp = B.fitLine(Ns, Fp), fs = B.fitLine(Ns, Fs);
        const data = t`import numpy as np

m = np.array([${rows.map((q) => q.s.toFixed(2)).join(', ')}])      # kg of load on the 0.250 kg block
F_peak = np.array([${Fp.map((v) => v.toFixed(2)).join(', ')}])    # N
F_slide = np.array([${Fs.map((v) => v.toFixed(2)).join(', ')}])   # N
`;
        return {
          prompt: t`Compute the normal force for each pull, fit \`F_peak\` and \`F_slide\` against it with \`np.polyfit\`, and set \`mu_s\` and \`mu_k\` to the two slopes.`,
          starter: t`${data}
g = 9.80
N = 0 * m          # the normal force on the board for each pull
mu_s = 0.0
mu_k = 0.0
print(mu_s, mu_k)
`,
          answer: t`${data}
g = 9.80
N = (0.250 + m) * g
mu_s = np.polyfit(N, F_peak, 1)[0]
mu_k = np.polyfit(N, F_slide, 1)[0]
print(f"mu_s = {mu_s:.3f}, mu_k = {mu_k:.3f}")
`,
          tests: [
            { name: 'N includes the 0.250 kg block', code: 'abs(N[0] - 0.25 * 9.8) < 1e-9' },
            { name: `the static coefficient is the slope of the peaks (${fp.b.toFixed(3)})`, code: `abs(mu_s - ${fp.b}) < 1e-6` },
            { name: `the kinetic coefficient is the slope of the sliding forces (${fs.b.toFixed(3)})`, code: `abs(mu_k - ${fs.b}) < 1e-6` },
          ],
          hints: [t`\`N = (0.250 + m) * g\` — the block’s own weight presses on the board too.`, t`\`np.polyfit(N, F_peak, 1)[0]\` is the slope of the peak forces.`],
          teach: 'Each friction coefficient is the slope of its force against the normal force.',
          explain: t`$\mu_s = ${fp.b.toFixed(3)}$ and $\mu_k = ${fs.b.toFixed(3)}$; the bench’s true values are 0.42 and 0.30.`,
          visual: plot('friction', rows, { fit: false, caption: 'The pulls your program fits.' }),
        };
      },
    }),
    num({
      id: 'apparent-mu', difficulty: 3,
      gen(r) {
        const mu = r.pick([0.25, 0.3, 0.35]), al = r.pick([10, 15, 20, 25]);
        const app = mu / (Math.cos(al * D2R) + mu * Math.sin(al * D2R));
        return {
          prompt: t`The true kinetic coefficient is ${mu}, but the string is pulled at ${al}° above the horizontal while you still divide the sensor’s force by the full weight. What coefficient do you report? (Find the pull $F$ that keeps the block sliding steadily, then compute $F/W$.)`,
          answer: app, tol: { rel: 0.004 },
          errors: [{ value: mu / Math.cos(al * D2R), feedback: t`The upward part of the pull, $F\sin\alpha$, also lightens the block: $N = W - F\sin\alpha$, not $W$.` }, { value: mu, feedback: 'The tilt changes the force needed: part of the pull lifts, and only part of it drags.' }],
          hints: [t`Horizontal: $F\cos\alpha = \mu N$. Vertical: $N + F\sin\alpha = W$.`, t`Eliminate $N$: $F = \dfrac{\mu W}{\cos\alpha + \mu\sin\alpha}$, so $F/W = \dfrac{\mu}{\cos\alpha + \mu\sin\alpha}$.`],
          teach: 'A tilted pull both lifts the block and drags it less, so dividing by the full weight gives too small a coefficient.',
          explain: t`$F/W = \dfrac{${mu}}{\cos ${al}^\circ + ${mu}\sin ${al}^\circ} = ${app.toFixed(4)}$ — ${(100 * (1 - app / mu)).toFixed(1)}% low, with the fit still passing through the origin.`,
          visual: apparatus('friction', { at: 0.5, sys: true, params: { angle: al } }, `The string rising at ${al}° to the force sensor. Not to scale.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rover', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([28.5, 30.0, 31.5, 33.0]), se = r.pick([0.4, 0.6, 0.8]);
        const m = muTan(th, se);
        return {
          prompt: t`To plan a Mars rover’s route, engineers tilt a test wheel on a bed of regolith simulant until it slips. Repeated trials give $\theta_c = ${th.toFixed(1)}^\circ \pm ${se.toFixed(1)}^\circ$ (mean ± SEM). What is the standard uncertainty of the static coefficient $\mu_s = \tan\theta_c$?`,
          answer: +m.s.toPrecision(3), tol: { rel: 0.03 },
          errors: [{ value: se * D2R, feedback: t`Multiply by the derivative of $\tan\theta$: $\sec^2\theta = 1 + \tan^2\theta$.` }],
          hints: [t`$\sigma_\mu = \sec^2\theta_c\,\sigma_\theta$, with $\sigma_\theta$ in radians.`, t`$\sec^2 ${th}^\circ = 1 + \tan^2 ${th}^\circ = ${(1 + Math.tan(th * D2R) ** 2).toFixed(4)}$.`],
          teach: 'An angle’s uncertainty reaches tan θ multiplied by sec²θ — which grows quickly at steep angles.',
          explain: t`$\mu_s = \tan ${th}^\circ = ${m.mu.toFixed(3)}$ and $\sigma_\mu = ${(1 + Math.tan(th * D2R) ** 2).toFixed(3)}\times${(se * D2R).toFixed(5)} = ${m.s.toFixed(4)}$. Steeper slopes amplify angle errors: at 45° the factor $\sec^2\theta$ is already 2.`,
          visual: apparatus('tilt', { params: { mus: m.mu }, labels: false }, `A board tilted to ${th.toFixed(1)}°, the angle at which the wheel slips. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'cp-why-two', difficulty: 2,
      prompt: 'Your pulling data give beautiful straight lines through the origin with χ²/dof ≈ 1. Why measure μs with the tilting board as well?',
      choices: [
        'A systematic error in the pulling method — a tilted string, a miscalibrated sensor — need not show in its own fit; an independent method would disagree',
        'To average the two results and halve the uncertainty',
        'Because the tilting board is always more accurate',
        'Because a good fit with χ²/dof ≈ 1 proves the result is right, so it is only a formality',
      ],
      answer: 0,
      why: {
        1: 'Combining helps a little, but only if both are free of systematic errors — which is exactly what the comparison tests.',
        2: 'Neither method is better by nature; each has its own hazards (the board’s protractor zero, its unevenness). Their agreement is the evidence.',
        3: t`$\chi^2/\text{dof} \approx 1$ says the scatter matches the error bars. It says nothing about an error that shifts or scales every reading the same way.`,
      },
      hints: ['What kind of error can a fit’s residuals never reveal?'],
      teach: 'Only an independent method can expose a systematic error that affects every reading of the first method in the same way.',
      explain: 'A good fit shows the random errors are understood. A systematic error that scales every reading — like a string pulled at an angle — leaves the fit perfect. Two different methods are unlikely to share the same systematic error, so agreement between them is strong evidence.',
      visual: apparatus('tilt', { labels: false }, 'The tilting board: a second, independent way to measure μs. Not to scale.'),
    }),
    num({
      id: 'cp-steady', difficulty: 2,
      gen(r) {
        const th = r.pick([14.0, 15.5, 16.7, 18.0]);
        return {
          prompt: t`Tapped to start it moving, the block then slides down the board **at constant speed** when the board is tilted at $${th.toFixed(1)}^\circ$. What is the kinetic coefficient?`,
          answer: Math.tan(th * D2R), tol: { rel: 0.004 },
          errors: [{ value: Math.sin(th * D2R), feedback: t`Constant speed means no net force along the slope: $mg\sin\theta = \mu_k mg\cos\theta$, so $\mu_k = \tan\theta$.` }],
          hints: [t`Constant speed: the forces along the slope balance.`, t`$mg\sin\theta = \mu_k\,mg\cos\theta$.`],
          teach: 'Sliding at constant speed down a slope means kinetic friction balances the slope component of gravity: μk = tan θ.',
          explain: t`$\mu_k = \tan ${th.toFixed(1)}^\circ = ${Math.tan(th * D2R).toFixed(3)}$ — lower than the static coefficient, which is why the block had to be tapped to start.`,
          visual: apparatus('tilt', { params: { mus: Math.tan(th * D2R) }, labels: false }, `The board at ${th.toFixed(1)}°. Not to scale.`),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (propagating through functions such as tan θ)'),
    SOURCES.openstax('6.2', '6-2-friction', 'Friction'),
    SOURCES.aapt,
  ],
});
