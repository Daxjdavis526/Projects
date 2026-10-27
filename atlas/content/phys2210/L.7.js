// Lab 7 (virtual): energy conservation on a track — a cart released at
// height h passes a photogate; v² against h has slope 2g if mechanical energy
// is conserved. The data fall measurably short: rolling friction, a loss the
// fit can measure. And a mis-measured flag can fake the same shortfall —
// changing the track angle tells them apart.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8, D2R = Math.PI / 180;

// the worked example: six releases on the 10° track (seed 62)
const EX = (() => {
  const rows = B.makeData('energy', { seed: 62 }).rows;
  const an = B.analyse('energy', rows, {});
  const f = an.series[0].fit, q = an.results[0];
  const mu = (1 - q.value) * Math.tan(10 * D2R);
  return { rows, f, q, mu, row: rows[3] };
})();

const releases = (r, sys = null, params = {}) => {
  const rows = B.makeData('energy', { seed: r.int(1, 999999), sys, params }).rows;
  return { rows, an: B.analyse('energy', rows, { sys, params }) };
};

export default lesson({
  id: 'phys2210.L.7',
  title: 'Energy conservation on a track',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A cart is released from rest on a track tilted at 10° and rolls down through a photogate, which times how long a 2.50 cm flag on the cart blocks its beam. The bench computes each blocking time with realistic timer and release scatter.

The cart’s speed at the gate is $v = w/\Delta t$. If the potential energy it gives up, $mgh$, all became kinetic energy $\tfrac12 mv^2$, then $v^2 = 2gh$. Rolling friction turns a little of it into heat instead, so the line is a little shallower:

$$v^2 = 2g\,\frac{K}{U}\,h, \qquad \frac{K}{U} = 1 - \frac{\mu}{\tan\theta}$$

The slope of $v^2$ against $h$, divided by $2g$, is the fraction of the energy that arrives as motion. (Lab skills trained: testing a model against data, and telling a real physical effect from an instrument error.)`,
  symbols: [
    { tex: 'v', text: 'the cart’s speed at the photogate, in m/s' },
    { tex: 'w,\\ \\Delta t', text: 'the flag’s width (2.50 cm) and the time it blocks the beam (in ms): $v = w/\\Delta t$' },
    { tex: 'h', text: 'the height of the release point above the gate, in m — the drop in height along the track' },
    { tex: 'g', text: 'the free-fall acceleration, 9.80 m/s²' },
    { tex: 'K/U', text: 'the share of the potential energy given up that arrives as kinetic energy: 1 if mechanical energy were conserved' },
    { tex: '\\mu,\\ \\theta', text: 'the rolling-friction coefficient of the wheels (a few thousandths) and the track’s tilt; friction’s share, $\\mu/\\tan\\theta$, grows on a shallower track' },
  ],
  why: 'Every energy budget — a re-entry capsule shedding heat, a satellite’s orbit decaying in thin air — is measured this way: compare what should arrive with what does, and account for the difference.',
  visual: {
    type: 'lab-bench',
    title: 'Release the cart, time it through the gate',
    lead: t`Six releases are in the table. The plot shows $v^2$ against $h$ with the least-squares line (gold) and, dashed green, the line $v^2 = 2gh$ that perfect conservation would give.`,
    tasks: [
      'Compare the gold line with the dashed one: the data fall short — K/U is about 0.98, a couple of standard errors below 1.',
      'Turn on the flag-width error: the shortfall jumps to about 0.90. Nothing extra is lost now — the speeds are simply worked out with the wrong flag width.',
      'Change the track angle to 6° and to 15°: friction’s share changes with the angle; the flag error’s does not. That is how to tell them apart.',
    ],
    params: { exp: 'energy', seed: 62, expected: true },
  },
  example: {
    prompt: t`The table gives six releases on the 10° track. At $h = ${EX.row.s.toFixed(2)}$ m the flag blocked the gate for $${(1000 * EX.row.R[0]).toFixed(1)}$ ms. The least-squares fit of $v^2$ against $h$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{m/s}^2`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{m}^2/\text{s}^2`)}$. Is mechanical energy conserved? If not, how large is the loss, and what friction does it imply?`,
    visual: plot('energy', EX.rows, { table: true, expected: true, caption: 'v² against h with ±1σ error bars, the least-squares line (gold) and perfect conservation (dashed).' }),
    steps: [
      { label: 'One point by hand', text: t`$v = w/\Delta t = 0.0250\ \text{m}/${EX.row.R[0].toFixed(4)}\ \text{s} = ${(0.025 / EX.row.R[0]).toFixed(3)}$ m/s, so $v^2 = ${((0.025 / EX.row.R[0]) ** 2).toFixed(3)}\ \text{m}^2/\text{s}^2$ — one point of the plot.` },
      { label: 'Read the fit', text: t`The intercept is zero within its uncertainty, as it should be (no height, no speed), and $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$: a straight line through the origin describes the data.` },
      { label: 'Energy share', text: t`$K/U = \text{slope}/2g = ${EX.f.b.toFixed(2)}/19.60 = ${pmTeX(EX.q.value, EX.q.sigma)}$.` },
      { label: 'Test conservation', text: t`$z = (1 - ${EX.q.value.toFixed(3)})/${EX.q.sigma.toFixed(4)} = ${EX.q.z.toFixed(1)}$: a shortfall unlikely to be chance (about 1 time in 60). About ${(100 * (1 - EX.q.value)).toFixed(1)}% of the energy did not arrive as motion.` },
      { label: 'What it implies', text: t`If rolling friction is the cause, $1 - K/U = \mu/\tan\theta$, so $\mu = (1 - ${EX.q.value.toFixed(3)})\tan 10^\circ = ${EX.mu.toFixed(4)}$ — about 0.004, typical of a low-friction cart’s bearings.` },
      { label: 'Sense check', text: t`Energy is not destroyed: friction turns a couple of percent into heat in the bearings. (A real cart also keeps a little as the spin of its wheels, which $\tfrac12 mv^2$ leaves out; this bench ignores that.)` },
    ],
    answer: t`$K/U = ${pmTeX(EX.q.value, EX.q.sigma)}$: ${EX.q.z.toFixed(1)}σ below 1 — a real loss of about ${(100 * (1 - EX.q.value)).toFixed(0)}%, consistent with rolling friction $\mu \approx ${EX.mu.toFixed(3)}$.`,
  },
  practice: [
    num({
      id: 'gate-speed', difficulty: 1,
      gen(r) {
        const h = r.pick([0.06, 0.09, 0.12, 0.15]);
        const row = B.makeData('energy', { seed: r.int(1, 999999), settings: [h] }).rows[0];
        const dt = row.R[0], v = 0.025 / dt;
        return {
          prompt: t`The 2.50 cm flag blocks the photogate for $${(1000 * dt).toFixed(1)}$ ms. How fast is the cart moving?`,
          answer: v, units: 'm/s', tol: { rel: 0.004 },
          errors: [{ value: dt / 0.025, feedback: t`Upside down: speed is distance over time, $v = w/\Delta t$.` }, { value: 2.5 / (1000 * dt), feedback: 'Convert to SI before dividing: 2.50 cm = 0.0250 m and the time to seconds.' }],
          hints: [t`$v = w/\Delta t$ with $w = 0.0250$ m and $\Delta t$ in seconds.`],
          teach: 'A photogate measures speed as the flag’s width divided by the time it blocks the beam.',
          explain: t`$v = 0.0250\ \text{m}/${dt.toFixed(4)}\ \text{s} = ${v.toFixed(3)}$ m/s. Strictly it is the *average* speed while the flag passes — very close to the speed at the gate for a short flag.`,
          visual: apparatus('energy', { at: h, data: [[h, dt]] }, 'The cart passing the photogate; the timer shows the blocking time. Not to scale.'),
        };
      },
    }),
    num({
      id: 'height', difficulty: 1,
      gen(r) {
        const d = r.pick([0.40, 0.55, 0.70, 0.85, 1.00]), th = r.pick([6, 10, 15]);
        const h = d * Math.sin(th * D2R);
        return {
          prompt: t`You release the cart ${d.toFixed(2)} m up the track from the photogate. The track is tilted at ${th}°. What height $h$ goes on the plot?`,
          answer: h, units: 'm', tol: { rel: 0.004 },
          errors: [{ value: d * Math.cos(th * D2R), feedback: t`That is the horizontal distance. The height is the side *opposite* the angle: $h = d\sin\theta$.` }, { value: d * Math.tan(th * D2R), feedback: t`Along the track the distance is the hypotenuse: $h = d\sin\theta$.` }],
          hints: [t`The track is the hypotenuse of a right triangle whose vertical side is $h$.`],
          teach: 'The drop in height for a distance d along a track tilted at θ is d sin θ.',
          explain: t`$h = ${d.toFixed(2)}\sin ${th}^\circ = ${h.toFixed(4)}$ m.`,
          visual: apparatus('energy', { at: +h.toFixed(3), params: { theta: th }, labels: false }, `The cart released ${d.toFixed(2)} m up a ${th}° track, above the photogate. Not to scale.`),
        };
      },
    }),
    num({
      id: 'share', difficulty: 2,
      gen(r) {
        const { rows, an } = releases(r);
        const b = +an.series[0].fit.b.toFixed(2);
        return {
          prompt: t`The least-squares slope of $v^2$ against $h$ is $${b.toFixed(2)}\ \text{m/s}^2$. What fraction $K/U$ of the potential energy arrived at the gate as kinetic energy?`,
          answer: b / (2 * G), tol: { rel: 0.002 },
          errors: [{ value: b / G, feedback: t`Perfect conservation gives $v^2 = 2gh$: compare the slope with $2g$, not $g$.` }, { value: b / 2, feedback: t`Divide by $2g$, a pure number results: $K/U = \text{slope}/(2g)$.` }],
          hints: [t`With $K = \tfrac12 mv^2$ and $U = mgh$: $K/U = v^2/(2gh)$, the slope divided by $2g$.`],
          teach: 'The slope of v² against h, divided by 2g, is the fraction of the potential energy that became kinetic energy.',
          explain: t`$K/U = ${b.toFixed(2)}/19.60 = ${(b / (2 * G)).toFixed(4)}$ — ${(100 * (1 - b / (2 * G))).toFixed(1)}% short of perfect conservation.`,
          visual: plot('energy', rows, { expected: true, caption: 'v² against h with the least-squares line (gold) and v² = 2gh (dashed).' }),
        };
      },
    }),
    num({
      id: 'implied-mu', difficulty: 3,
      gen(r) {
        const th = r.pick([6, 10, 15]);
        let ku;
        do { ku = +releases(r, null, { theta: th }).an.results[0].value.toFixed(3); } while (ku > 0.994);
        const mu = (1 - ku) * Math.tan(th * D2R);
        return {
          prompt: t`On a ${th}° track you measure $K/U = ${ku.toFixed(3)}$. If rolling friction is the only loss, what rolling-friction coefficient $\mu$ does that imply?`,
          answer: mu, tol: { rel: 0.01 },
          errors: [{ value: (1 - ku) / Math.tan(th * D2R), feedback: t`Friction’s share is $\mu/\tan\theta$, so $\mu = (1 - K/U)\tan\theta$ — multiply by $\tan\theta$.` }, { value: 1 - ku, feedback: t`That is friction’s share of the energy. The coefficient also depends on the angle: $\mu = (1 - K/U)\tan\theta$.` }],
          hints: [t`Friction does work $\mu mg\cos\theta\,d$ over the distance $d = h/\sin\theta$; compare with $mgh$.`, t`$1 - K/U = \dfrac{\mu mg\cos\theta\,(h/\sin\theta)}{mgh} = \dfrac{\mu}{\tan\theta}$.`],
          teach: 'Rolling friction’s share of the energy is μ/tan θ: a ratio of the friction’s work to the potential energy released.',
          explain: t`$\mu = (1 - ${ku.toFixed(3)})\tan ${th}^\circ = ${mu.toFixed(4)}$. Measurements on two different tracks should give the same μ — a strong check that friction, not an instrument error, is the cause.`,
          visual: apparatus('energy', { at: 0.12, params: { theta: th } }, `The ${th}° track. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'friction-or-flag', difficulty: 3,
      prompt: t`Your $K/U$ comes out 0.90. It could be a large friction loss, or a flag that is really wider than the 2.50 cm you assumed. Which test tells the two apart?`,
      choices: [
        'Repeat at a different track angle: friction’s share, μ/tan θ, changes with the angle; a wrong flag width scales every v² by the same factor at any angle',
        'Take more releases at the same angle to shrink the uncertainty',
        'Force the fit through the origin',
        'Check whether χ²/dof is near 1',
      ],
      answer: 0,
      why: {
        1: 'More data shrink the error bar on the same shortfall; they cannot tell you what caused it.',
        2: 'Both causes leave the line passing through the origin; forcing it there changes nothing.',
        3: 'Both causes scale the line evenly, so both fits look equally good.',
      },
      hints: ['Write the slope for each cause. Which one depends on θ?', t`Friction: $K/U = 1 - \mu/\tan\theta$. Flag: $K/U = (w_\text{assumed}/w_\text{true})^2$, the same at every angle.`],
      teach: 'To separate two possible causes of the same effect, change a condition that affects one and not the other.',
      explain: t`Friction gives $K/U = 1 - \mu/\tan\theta$: shallower track, bigger loss. A flag error gives $K/U = (w_\text{assumed}/w_\text{true})^2$ at every angle. Measure at two angles: if the shortfall stays put, measure the flag.`,
      visual: plot('energy', B.makeData('energy', { seed: 18, sys: 'flag' }).rows, { expected: true, caption: 'v² against h with a shortfall of about 10% (gold) below v² = 2gh (dashed).' }),
    }),
    mcq({
      id: 'where-it-went', difficulty: 2,
      prompt: t`About 2% of the potential energy did not arrive as kinetic energy of the cart. Where did it go?`,
      choices: [
        'Mostly into thermal energy, through rolling friction in the wheels and track — and in a real cart a little stays as the spin of its wheels',
        'It was destroyed by friction',
        'Into the photogate’s beam',
        'Nowhere: a 2% gap is always just random error',
      ],
      answer: 0,
      why: {
        1: 'Energy is never destroyed: friction converts mechanical energy into thermal energy, which warms the bearings and track slightly.',
        2: 'Light passing the cart exerts no measurable force on it; the gate only times the flag.',
        3: t`Here the gap is about 2.4 standard errors — unlikely to be chance. Whether a gap is “random” is decided by its size in σ, not in percent.`,
      },
      hints: ['Which conversion of energy does friction always make?'],
      teach: 'Friction converts mechanical energy into thermal energy; total energy is conserved even when mechanical energy is not.',
      explain: t`The fit measured a shortfall of about 2%, 2.4σ below 1. Rolling friction converts it to heat. (A real cart’s wheels also spin, holding kinetic energy that $\tfrac12 mv^2$ misses — how much depends on the wheels; this bench leaves that out, a simplification its caption admits.)`,
      visual: plot('energy', EX.rows, { expected: true, caption: 'The data (gold line) fall just short of perfect conservation (dashed).' }),
    }),
    code({
      id: 'fit-energy', difficulty: 2,
      gen(r) {
        const { rows } = releases(r);
        const hs = rows.map((q) => q.s), dts = rows.map((q) => q.R[0]);
        const v2 = dts.map((dt) => (0.025 / dt) ** 2);
        const f = B.fitLine(hs, v2);
        const data = t`import numpy as np

g, w = 9.80, 0.0250                                     # m/s², m (flag width)
h = np.array([${hs.map((v) => v.toFixed(2)).join(', ')}])          # m
dt = np.array([${dts.map((v) => v.toFixed(4)).join(', ')}])   # s
`;
        return {
          prompt: t`Turn the blocking times into $v^2$, fit $v^2$ against $h$ with \`np.polyfit\`, and set \`K_over_U\` to the slope divided by $2g$.`,
          starter: t`${data}
v2 = 0 * dt      # the squared speed at the gate for each release
K_over_U = 0.0
print(K_over_U)
`,
          answer: t`${data}
v2 = (w / dt)**2
slope, intercept = np.polyfit(h, v2, 1)
K_over_U = slope / (2 * g)
print(f"K/U = {K_over_U:.4f}")
`,
          tests: [
            { name: 'v2 is (w/Δt)² for each release', code: `abs(v2[0] - (0.025 / dt[0])**2) < 1e-12` },
            { name: `K/U is the slope over 2g (${(f.b / (2 * G)).toFixed(4)})`, code: `abs(K_over_U - ${f.b / (2 * G)}) < 1e-6` },
          ],
          hints: [t`\`v2 = (w / dt)**2\` — NumPy squares every element.`, t`\`slope = np.polyfit(h, v2, 1)[0]\`, then divide by \`2 * g\`.`],
          teach: 'Linearize first (here, square the speeds), then fit: the slope carries the physics.',
          explain: t`$K/U = ${(f.b / (2 * G)).toFixed(4)}$ — a couple of percent below 1, the rolling-friction loss.`,
          visual: plot('energy', rows, { fit: false, caption: 'The releases your program fits.' }),
        };
      },
    }),
    num({
      id: 'sigma-v2', difficulty: 3,
      gen(r) {
        const dt = r.pick([12.6, 14.2, 16.9, 20.4]) / 1000, sdt = 0.0001;
        const v2 = (0.025 / dt) ** 2, s = (2 * v2 * sdt) / dt;
        return {
          prompt: t`The flag blocks the gate for $${(1000 * dt).toFixed(1)} \pm 0.1$ ms. Taking the flag width as exact, what is the uncertainty in $v^2 = (w/\Delta t)^2$?`,
          answer: +s.toPrecision(3), units: 'm^2/s^2', tol: { rel: 0.03 },
          errors: [{ value: (v2 * sdt) / dt, feedback: t`$v^2 \propto \Delta t^{-2}$: the power $-2$ doubles the relative uncertainty.` }],
          hints: [t`First $v^2 = (w/\Delta t)^2 = (0.0250/${dt.toFixed(4)})^2$.`, t`For $v^2 = w^2\Delta t^{-2}$: $\sigma_{v^2}/v^2 = 2\,\sigma_{\Delta t}/\Delta t$.`],
          teach: 'A quantity proportional to a power n of a measurement carries |n| times its relative uncertainty.',
          explain: t`$v^2 = ${v2.toFixed(3)}\ \text{m}^2/\text{s}^2$ and $\sigma_{v^2} = 2v^2\sigma_{\Delta t}/\Delta t = 2(${v2.toFixed(3)})(0.1/${(1000 * dt).toFixed(1)}) = ${s.toFixed(4)}\ \text{m}^2/\text{s}^2$ — ${(200 * sdt / dt).toFixed(1)}%. Short blocking times (fast carts) give the largest relative error.`,
          visual: apparatus('energy', { at: 0.12 }, 'The cart passing the photogate. Not to scale.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-drop-tower', difficulty: 3, transfer: true,
      gen(r) {
        const s = r.pick([18.4, 18.7, 19.0, 19.2]);
        const loss = 100 * (1 - s / (2 * G));
        return {
          prompt: t`A drop-tower test capsule falls through light gates at several heights, with air left in the tube. Its $v^2$ against drop height has slope $${s.toFixed(1)}\ \text{m/s}^2$. What percentage of its potential energy went into air drag rather than motion?`,
          answer: loss, units: '%', tol: { rel: 0.02, abs: 0.05 },
          errors: [{ value: 100 * (1 - s / G), feedback: t`In free fall $v^2 = 2gh$: compare the slope with $2g = 19.6\ \text{m/s}^2$.` }],
          hints: [t`$K/U = \text{slope}/2g$.`, t`The loss is $1 - K/U$, as a percentage.`],
          teach: 'Comparing the measured slope of v² against height with 2g gives the share of energy lost — in any vertical or inclined drop.',
          explain: t`$K/U = ${s.toFixed(1)}/19.6 = ${(s / (2 * G)).toFixed(3)}$, so ${loss.toFixed(1)}% went into the air as heat and turbulence. Evacuating the tube — as real drop towers do — removes this loss.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 50], y: [0, 1000], xlabel: 'drop height (m)', ylabel: 'v² (m²/s²)', curves: [{ fn: '19.6*x', color: 'good', dash: true, domain: [0, 50] }, { fn: `${s}*x`, color: 'gold', domain: [0, 50] }], points: [10, 20, 30, 40].map((h, i) => ({ x: h, y: +(s * h * (1 + [0.004, -0.003, 0.002, -0.002][i])).toFixed(1), r: 4, color: 'accent' })) }, caption: 'v² against drop height for the capsule (illustrative data): fitted line (gold) and free fall in vacuum (dashed).' },
        };
      },
    }),
    mcq({
      id: 'cp-disproved', difficulty: 2,
      prompt: t`Your result is $K/U = 0.977 \pm 0.010$. A classmate says: “Then energy is not conserved — we have disproved the law.” What is the right conclusion?`,
      choices: [
        'Total energy is conserved; the model that counts only kinetic and potential energy is incomplete, and the 2.3σ shortfall measures the energy friction turned into heat',
        'The classmate is right: the experiment disproves energy conservation',
        'The shortfall is meaningless: anything within 5% counts as agreement',
        'The photogate must be broken, since the law cannot fail',
      ],
      answer: 0,
      why: {
        1: 'One mechanical measurement cannot overturn a law tested everywhere; it can show that a model left something out.',
        2: '“Within 5%” is not a test. A difference is judged in units of its uncertainty: 2.3σ is unlikely to be chance.',
        3: 'Perhaps the gate is fine and the physics is richer than the model. Check the instrument, but do not assume the conclusion.',
      },
      hints: ['Which kind of energy does the v² = 2gh model leave out?'],
      teach: 'A significant disagreement with a model is information about what the model leaves out, not a reason to throw out a well-tested law.',
      explain: 'The test compares mechanical energy before and after. Friction moves some energy into heat, which the simple model ignores. The shortfall is a measurement of that loss.',
      visual: plot('energy', EX.rows, { expected: true, caption: 'Your data (gold line) and perfect conservation of mechanical energy (dashed).' }),
    }),
    num({
      id: 'cp-predict', difficulty: 2,
      gen(r) {
        const ku = r.pick([0.970, 0.975, 0.980]), h = r.pick([0.25, 0.30, 0.35]);
        const v = Math.sqrt(2 * G * h * ku);
        return {
          prompt: t`With $K/U = ${ku.toFixed(3)}$ measured on this track, predict the cart’s speed at the gate when released from $h = ${h.toFixed(2)}$ m.`,
          answer: v, units: 'm/s', tol: { rel: 0.004 },
          errors: [{ value: Math.sqrt(2 * G * h), feedback: t`That assumes no loss. Include the measured share: $v^2 = 2gh\,(K/U)$.` }, { value: 2 * G * h * ku, feedback: t`That is $v^2$, in m²/s². Take the square root.` }],
          hints: [t`$\tfrac12 v^2 = (K/U)\,gh$.`],
          teach: 'A measured energy share turns into a prediction: v = √(2gh · K/U).',
          explain: t`$v = \sqrt{2(9.8)(${h.toFixed(2)})(${ku.toFixed(3)})} = ${v.toFixed(3)}$ m/s — about ${(100 * (1 - Math.sqrt(ku))).toFixed(1)}% slower than with no friction.`,
          visual: apparatus('energy', { at: 0.18, labels: false }, 'The cart on the track above the photogate. Not to scale.'),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (propagation) and ch. 8 (least squares)'),
    SOURCES.openstax('8.3', '8-3-conservation-of-energy', 'Conservation of energy'),
    SOURCES.aapt,
  ],
});
