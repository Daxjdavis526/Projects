// Lab 3 (virtual): measuring g in free fall — a steel ball released by an
// electromagnet and timed to a trapdoor. Linearizing as t against √h puts a
// release delay in the intercept, so g from the slope stays honest; t²
// against h hides the same delay inside the slope.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8;

// the worked example: seven drops with the release delay present (seed 9)
const EX = (() => {
  const rows = B.makeData('freefall', { seed: 9, sys: 'delay' }).rows;
  const an = B.analyse('freefall', rows, { sys: 'delay' });
  const f = an.series[0].fit, g = an.results[0];
  return { rows, f, g };
})();

/** Fresh drops from the bench. */
const drops = (r, sys = null, params = {}) => {
  const rows = B.makeData('freefall', { seed: r.int(1, 999999), sys, params }).rows;
  return { rows, an: B.analyse('freefall', rows, { sys, params }) };
};
const ms = (x) => (1000 * x).toFixed(1);

export default lesson({
  id: 'phys2210.L.3',
  title: 'Measuring g in free fall',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A steel ball hangs from an electromagnet; cutting the current starts a millisecond timer and drops the ball, which stops the timer when it hits a trapdoor a height $h$ below. The bench computes each fall time with realistic timer scatter and height errors.

From $h = \tfrac12 g t^2$, the fall time is $t = \sqrt{2h/g}$. Real release mechanisms add a delay $\delta$: the fading magnetic field holds the ball a few milliseconds after the timer starts. So plot $t$ against $\sqrt h$:

$$t = \underbrace{\sqrt{\tfrac{2}{g}}}_{\text{slope } b}\,\sqrt h \;+\; \underbrace{\delta}_{\text{intercept}}$$

The slope gives $g = 2/b^2$; the intercept measures the delay instead of spoiling $g$. (Lab skills trained: designing an experiment so that a systematic error separates from the result, and analysing data.)`,
  symbols: [
    { tex: 't', text: 'the fall time the timer shows, in s' },
    { tex: 'h', text: 'the drop height, from the bottom of the ball to the trapdoor, in m' },
    { tex: 'g', text: 'the free-fall acceleration, in m/s²; the accepted local value at this bench is 9.80 m/s²' },
    { tex: '\\delta', text: 'the release delay: the time between the timer starting and the ball actually falling, in s — a systematic error, the same in every drop' },
    { tex: 'b = \\sqrt{2/g}', text: 'the slope of $t$ against $\\sqrt h$, in $\\text{s}/\\sqrt{\\text{m}}$' },
  ],
  why: 'Separating a constant offset from the physics by the choice of axes is how precision experiments — from free-fall gravimeters to LIGO’s calibration — keep systematic errors from masquerading as results.',
  visual: {
    type: 'lab-bench',
    title: 'Drop a ball, time its fall',
    lead: t`Seven drops are in the table, one per height. The upper plot shows $t$ against $\sqrt h$ with the least-squares line; the strip below shows each point’s residual. Move the height and press **Take a measurement** to add drops.`,
    tasks: [
      'Turn on the release delay: every time grows by 12 ms, the line rises — the intercept becomes about 0.012 s — but its slope, and so g, does not change.',
      'With the delay still on, switch the plot to t² against h: g drops to about 9.5 m/s², and χ²/dof still looks innocent. The delay now hides inside the slope.',
      'Press Run the series a few times: the uncertainty of g shrinks roughly as one over the square root of the number of drops.',
    ],
    params: { exp: 'freefall', seed: 44, residuals: true },
  },
  example: {
    prompt: t`Seven drops, from $h = 0.10$ to $1.30$ m in steps of 0.20 m, give the times in the table (each uncertain by about 1.5 ms; heights by ±1 mm). A least-squares fit of $t$ against $\sqrt h$ gives slope $b = ${pmTeX(EX.f.b, EX.f.sb, t`\text{s}/\sqrt{\text{m}}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{s}`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find $g$ with its uncertainty, compare it with 9.80 m/s², and say what the intercept means.`,
    visual: plot('freefall', EX.rows, { sys: true, table: true, residuals: true, caption: 'The seven drops: t against √h with ±1σ error bars, the least-squares line, and residuals.' }),
    steps: [
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$ and the residuals scatter without a pattern: a straight line in $\sqrt h$ describes the data, and the error bars are about right.` },
      { label: 'From the slope', text: t`$b = \sqrt{2/g}$, so $g = \dfrac{2}{b^2} = \dfrac{2}{${EX.f.b.toFixed(5)}^2} = ${EX.g.value.toFixed(3)}\ \text{m/s}^2$.` },
      { label: 'Propagate', text: t`$g \propto b^{-2}$, so its relative uncertainty is twice the slope’s: $\dfrac{\sigma_g}{g} = 2\dfrac{\sigma_b}{b} = 2\times\dfrac{${EX.f.sb.toPrecision(2)}}{${EX.f.b.toFixed(4)}} = ${(200 * EX.f.sb / EX.f.b).toFixed(2)}\%$, so $\sigma_g = ${EX.g.sigma.toPrecision(2)}\ \text{m/s}^2$.` },
      { label: 'Compare', text: t`$g = ${pmTeX(EX.g.value, EX.g.sigma, t`\text{m/s}^2`)}$ is $${(Math.abs(EX.g.value - G) / EX.g.sigma).toFixed(1)}\sigma$ from 9.80 m/s²: agreement.` },
      { label: 'The intercept', text: t`At $\sqrt h = 0$ the ball would still take $${ms(EX.f.a)} \pm ${ms(EX.f.sa)}$ ms: the timer starts before the ball falls. That is the release delay — about ${Math.round(EX.f.a / EX.f.sa)} standard errors from zero, so it is real. Because it sits in the intercept, it costs $g$ nothing.` },
      { label: 'Sense check', text: t`A single drop from 1.30 m would have given $g = 2h/t^2 = 2(1.30)/${EX.rows[6].R[0].toFixed(3)}^2 = ${(2.6 / EX.rows[6].R[0] ** 2).toFixed(2)}\ \text{m/s}^2$ — about ${(100 * (1 - 2.6 / EX.rows[6].R[0] ** 2 / G)).toFixed(0)}% low, because the delay is buried in $t$. The fit is what rescues the measurement.` },
    ],
    answer: t`$g = ${pmTeX(EX.g.value, EX.g.sigma, t`\text{m/s}^2`)}$, consistent with 9.80 m/s²; the intercept is a release delay of $${ms(EX.f.a)} \pm ${ms(EX.f.sa)}$ ms.`,
  },
  practice: [
    num({
      id: 'g-from-slope', difficulty: 2,
      gen(r) {
        const { rows, an } = drops(r, r.bool() ? 'delay' : null);
        const b = +an.series[0].fit.b.toFixed(4);
        return {
          prompt: t`A fit of $t$ against $\sqrt h$ gives a slope of $${b.toFixed(4)}\ \text{s}/\sqrt{\text{m}}$. What value of $g$ does it give?`,
          answer: 2 / b ** 2, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: 2 / b, feedback: t`Square the slope: $b = \sqrt{2/g}$, so $b^2 = 2/g$.` }, { value: 1 / b ** 2, feedback: t`You dropped the 2: $t = \sqrt{2h/g}$, so $b^2 = 2/g$ and $g = 2/b^2$.` }, { value: b ** 2 / 2, feedback: t`Upside down: $b^2 = 2/g$ gives $g = 2/b^2$.` }],
          hints: [t`Match $t = \sqrt{2/g}\,\sqrt h$ to $t = b\sqrt h$.`, t`$b^2 = 2/g$, so $g = 2/b^2$.`],
          teach: 'Solve the slope’s meaning for the physical constant: here b = √(2/g), so g = 2/b².',
          explain: t`$g = 2/b^2 = 2/${b.toFixed(4)}^2 = ${(2 / b ** 2).toFixed(3)}\ \text{m/s}^2$.`,
          visual: plot('freefall', rows, { caption: 't against √h with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'sigma-g', difficulty: 2,
      gen(r) {
        const { rows, an } = drops(r);
        const f = an.series[0].fit;
        const b = +f.b.toFixed(4), sb = +f.sb.toPrecision(2), g = 2 / b ** 2;
        const sg = (2 * g * sb) / b;
        return {
          prompt: t`The slope is $b = ${b.toFixed(4)} \pm ${sb}\ \text{s}/\sqrt{\text{m}}$, so $g = 2/b^2 = ${g.toFixed(2)}\ \text{m/s}^2$. What is the standard uncertainty of $g$?`,
          answer: +sg.toPrecision(3), units: 'm/s^2', tol: { rel: 0.03 },
          errors: [{ value: (g * sb) / b, feedback: t`$g \propto b^{-2}$: a power of $-2$ doubles the relative uncertainty. $\sigma_g/g = 2\sigma_b/b$.` }, { value: sb / b, feedback: 'That is the slope’s relative uncertainty, a pure number. Multiply by 2 and by g.' }],
          hints: [t`For $g = k\,b^{n}$, the relative uncertainties obey $\sigma_g/g = |n|\,\sigma_b/b$.`, t`Here $n = -2$: $\sigma_g = 2g\,\sigma_b/b$.`],
          teach: 'A quantity proportional to a power n of a measured value has |n| times its relative uncertainty.',
          explain: t`$\sigma_g = 2g\,\sigma_b/b = 2(${g.toFixed(2)})(${sb})/${b.toFixed(4)} = ${sg.toPrecision(2)}\ \text{m/s}^2$ — a ${(200 * sb / b).toFixed(1)}% measurement of $g$.`,
          visual: plot('freefall', rows, { caption: 't against √h with the least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'what-intercept', difficulty: 2,
      gen(r) {
        const { rows, an } = drops(r, 'delay');
        const f = an.series[0].fit;
        return {
          prompt: t`Your fit of $t$ against $\sqrt h$ has intercept $${ms(f.a)} \pm ${ms(f.sa)}$ ms. What does it mean?`,
          choices: [
            'The timer starts about that long before the ball begins to fall: a release delay. The slope, and so g, is unaffected',
            'The experiment failed: a ball dropped from no height must take no time',
            'g must be corrected by subtracting the intercept from the slope',
            'Air resistance slows the ball by that much',
          ],
          answer: 0,
          why: {
            1: 'A constant extra time in every reading is exactly what an intercept on these axes measures. It is a property of the release mechanism, not a failure.',
            2: 'The intercept is a time and the slope is in s/√m — they cannot be combined. The slope needs no correction: the delay is all in the intercept.',
            3: 'Air drag on a steel ball adds well under a millisecond, and it grows with the drop height — it would bend the line, not shift it.',
          },
          hints: [t`What would $t$ be if $h = 0$ but the timer still started early?`],
          teach: 'On t-against-√h axes a constant time offset shows up as the intercept and leaves the slope alone.',
          explain: t`$${ms(f.a)}$ ms, about ${Math.round(f.a / f.sa)} standard errors from zero: every drop includes the time the fading magnet holds the ball. Report it — it is a measured property of your apparatus.`,
          visual: plot('freefall', rows, { sys: true, caption: 't against √h. Where does the line cross the t axis?' }),
        };
      },
    }),
    mcq({
      id: 'square-hides', difficulty: 3,
      gen(r) {
        const { rows } = drops(r, 'delay');
        const sq = B.analyse('freefall', rows, { sys: 'delay', axes: 'square' });
        const q = sq.results[0], f = sq.series[0].fit;
        return {
          prompt: t`A classmate plots the same delayed drops as $t^2$ against $h$ and reports $g = ${pmTeX(q.value, q.sigma, t`\text{m/s}^2`)}$ with $\chi^2/\text{dof} = ${f.chi2r.toFixed(2)}$. Why is $g$ several standard errors low when the fit looks fine?`,
          choices: [
            t`The delay makes $t^2 = 2h/g + 2\delta\sqrt{2h/g} + \delta^2$: the middle term grows with $h$, so the fit absorbs it into a steeper slope — too gently curved to show in $\chi^2$`,
            'Bad luck: random error alone; more drops will bring g back to 9.80',
            t`The law is wrong: $t^2$ is not proportional to $h$ in free fall`,
            'The error bars are too small, so χ² should be ignored',
          ],
          answer: 0,
          why: {
            1: 'A systematic error does not average away: more drops shrink the error bar on the wrong answer.',
            2: t`Without a delay, $t^2 = 2h/g$ exactly. The trouble is the delay, which these axes cannot separate from the slope.`,
            3: t`$\chi^2/\text{dof}$ near 1 says the error bars are about right. A good-looking fit does not prove there is no systematic error.`,
          },
          hints: [t`Write $t = \sqrt{2h/g} + \delta$ and square it.`, t`Which term of $t^2$ is proportional to $h$, which to $\sqrt h$, and which is constant?`],
          teach: 'A systematic error can hide inside a slope while χ² looks fine; choose axes on which it appears separately, as an intercept.',
          explain: t`Squaring gives a cross term $2\delta\sqrt{2h/g}$ that rises with $h$. Over 0.1–1.3 m it is nearly straight, so the fit simply steepens: $g$ comes out about 3% low with no warning from $\chi^2$. On $t$ against $\sqrt h$ the same delay is just an intercept.`,
          visual: plot('freefall', rows, { sys: true, axes: 'square', residuals: true, caption: 't² against h for the delayed drops, with the least-squares line and residuals.' }),
        };
      },
    }),
    num({
      id: 'height-error', difficulty: 3,
      gen(r) {
        const h = r.pick([0.1, 0.15, 0.2, 0.3]), sh = r.pick([0.001, 0.002]);
        const v = Math.sqrt(2 * G * h), dt = sh / v;
        return {
          prompt: t`At the shortest drop, $h = ${h.toFixed(2)}$ m, read to $\pm${1000 * sh}$ mm. How large a timing error, in milliseconds, is equivalent to that height uncertainty? (Compare it with the timer’s 1.5 ms scatter.)`,
          answer: +(1000 * dt).toPrecision(3), units: 'ms', tol: { rel: 0.03 },
          errors: [{ value: 2000 * dt, feedback: t`That uses the *average* speed, $v/2$. A small change in $h$ moves the landing time by $\delta h$ divided by the speed *at landing*, $v = \sqrt{2gh}$.` }],
          hints: [t`$t = \sqrt{2h/g}$, so $\dfrac{dt}{dh} = \dfrac{1}{\sqrt{2gh}}$ — one over the landing speed.`, t`$\delta t = \dfrac{\delta h}{\sqrt{2gh}} = \dfrac{${sh}\ \text{m}}{\sqrt{2(9.8)(${h})}\ \text{m/s}}$.`],
          teach: 'To compare error sources, convert each into the same quantity — here, the timing error a height error would cause.',
          explain: t`The ball lands at $v = \sqrt{2gh} = ${v.toFixed(2)}$ m/s, so ${1000 * sh} mm more height takes $${(1000 * dt).toFixed(2)}$ ms longer — ${dt * 1000 < 1.5 ? 'less than' : 'more than'} the 1.5 ms timer scatter. At larger heights the ball lands faster, so a 1 mm error matters even less: the timer dominates.`,
          visual: apparatus('freefall', { at: h }, `The ball at the shortest drop, ${h.toFixed(2)} m above the trapdoor. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'air-drag', difficulty: 2,
      prompt: t`Should you correct for air resistance on the 2.0 cm steel ball? A careful calculation shows that drag lengthens a 1.3 m fall by about 0.3 ms.`,
      choices: [
        'No: 0.3 ms is a fifth of the timer’s 1.5 ms scatter and biases g by only about 0.1%, far inside its ±1% uncertainty',
        'Yes: air resistance always dominates a free-fall experiment',
        'No, because air resistance does not act on heavy objects',
        'Yes: drag makes g come out higher than the true value',
      ],
      answer: 0,
      why: {
        1: 'For a dense ball over a metre, drag is under 1% of the weight even at the bottom. Light objects — a feather, a coffee filter — are a different story.',
        2: 'Drag acts on everything moving through air; it is just tiny compared with the weight of a dense steel ball.',
        3: t`Drag makes the fall *slower*, so $t$ is a little longer and $g = 2h/t^2$ a little *lower*.`,
      },
      hints: ['Compare 0.3 ms with the scatter of the timer and with the uncertainty of the result.'],
      teach: 'A correction is only worth making when it is comparable with your uncertainty; estimate it, then decide.',
      explain: t`0.3 ms in 515 ms is 0.06% of $t$, so 0.12% of $g$ (since $g \propto t^{-2}$) — about a tenth of the ±1% the fit achieves. Say in the report that it was estimated and neglected.`,
      visual: apparatus('freefall', { at: 1.3 }, 'The 1.3 m drop. Strobe images every 50 ms show the ball speeding up. Not to scale.'),
    }),
    num({
      id: 'single-drop', difficulty: 2,
      gen(r) {
        const h = r.pick([0.9, 1.1, 1.3]);
        const row = B.makeData('freefall', { seed: r.int(1, 999999), settings: [h], sys: 'delay' }).rows[0];
        const tt = row.R[0], g1 = (2 * h) / tt ** 2;
        return {
          prompt: t`One drop, with the release delay present, from $h = ${h.toFixed(2)}$ m gives $t = ${tt.toFixed(3)}$ s. What value of $g$ does $g = 2h/t^2$ give from this drop alone?`,
          answer: g1, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: (2 * h) / tt, feedback: t`Square the time: $g = 2h/t^2$.` }, { value: h / tt ** 2, feedback: t`From $h = \tfrac12 g t^2$, $g = 2h/t^2$ — keep the 2.` }],
          hints: [t`Rearrange $h = \tfrac12 g t^2$.`],
          teach: 'A single-point calculation folds any constant offset into the answer; a fit with an intercept can separate it.',
          explain: t`$g = 2(${h.toFixed(2)})/${tt.toFixed(3)}^2 = ${g1.toFixed(2)}\ \text{m/s}^2$ — ${(100 * (1 - g1 / G)).toFixed(1)}% below 9.80, because the 12 ms delay is inside $t$. Fitting $t$ against $\sqrt h$ over many heights moves the delay into the intercept and recovers $g$.`,
          visual: apparatus('freefall', { at: h, sys: true, data: [[h, row.R[0]]] }, 'The drop and the timer’s reading. Not to scale.'),
        };
      },
    }),
    num({
      id: 'how-many-sigma', difficulty: 2,
      gen(r) {
        const { rows, an } = drops(r, r.bool(0.3) ? 'delay' : null);
        const q = an.results[0];
        const g = +q.value.toFixed(2), s = +q.sigma.toPrecision(1) || 0.1;
        let z = Math.abs(g - G) / s;
        if (z < 0.05) z = 0;
        return {
          prompt: t`Your drops give $g = ${g.toFixed(2)} \pm ${s}\ \text{m/s}^2$. How many standard uncertainties is that from the accepted 9.80 m/s²?`,
          answer: z, tol: { rel: 0.03, abs: 0.06 },
          errors: z > 0.6 ? [{ value: Math.abs(g - G), feedback: 'That is the difference in m/s². Divide it by the standard uncertainty to express it in σ.' }] : [],
          hints: [t`$z = |g - 9.80|/\sigma_g$.`],
          teach: 'Express a discrepancy in units of its standard uncertainty: within about 2 is agreement.',
          explain: t`$z = |${g.toFixed(2)} - 9.80|/${s} = ${z.toFixed(1)}$: ${z <= 2 ? 'agreement — within the uncertainty.' : 'too far for chance; look for a systematic error.'}`,
          visual: plot('freefall', rows, { caption: 't against √h with the least-squares line.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const rows = B.makeData('freefall', { seed: r.int(1, 999999), params: { g: 1.62 } }).rows;
        const f = B.analyse('freefall', rows, { params: { g: 1.62 } }).series[0].fit;
        const b = +f.b.toFixed(3);
        return {
          prompt: t`An astronaut repeats the drop-timer experiment on the Moon. The fit of $t$ against $\sqrt h$ has slope $${b.toFixed(3)}\ \text{s}/\sqrt{\text{m}}$. What is the Moon’s surface gravity?`,
          answer: 2 / b ** 2, units: 'm/s^2', tol: { rel: 0.003 },
          errors: [{ value: 2 / b, feedback: t`$b = \sqrt{2/g}$: square the slope before inverting.` }, { value: 1 / b ** 2, feedback: t`$g = 2/b^2$ — keep the 2 from $h = \tfrac12 gt^2$.` }],
          hints: [t`The same law holds on the Moon: $t = \sqrt{2/g}\,\sqrt h$.`, t`$g = 2/b^2$.`],
          teach: 'The analysis does not care which world you are on: the slope of t against √h is √(2/g) anywhere.',
          explain: t`$g = 2/${b.toFixed(3)}^2 = ${(2 / b ** 2).toFixed(2)}\ \text{m/s}^2$ — about a sixth of Earth’s, as Apollo 15’s David Scott showed by dropping a hammer and a feather together on the airless Moon.`,
          visual: plot('freefall', rows, { params: { g: 1.62 }, caption: 'Fall times on the Moon against √h, with the least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'cp-which-plot', difficulty: 2,
      prompt: 'You suspect the timer adds the same unknown delay to every drop. Which plot shows the delay as a separate number while still giving an unbiased g?',
      choices: [t`$t$ against $\sqrt h$`, t`$t^2$ against $h$`, t`$h$ against $t^2$`, t`$t$ against $h$`],
      answer: 0,
      why: {
        1: t`Squaring $t$ mixes the delay into a term that grows with $\sqrt h$; the fit absorbs it into the slope and biases $g$.`,
        2: t`Same problem: $t^2$ contains $2\delta\sqrt{2h/g}$, which these axes cannot separate from the slope.`,
        3: t`$t$ is not proportional to $h$ at all ($t \propto \sqrt h$): the plot is curved.`,
      },
      hints: [t`Which plot is a straight line with the delay as its only extra term, $t = b\sqrt h + \delta$?`],
      teach: 'Linearize so that each suspected systematic error becomes its own fit parameter.',
      explain: t`$t = \sqrt{2/g}\,\sqrt h + \delta$ is exactly a straight line in $\sqrt h$: the delay is the intercept and $g$ comes from the slope alone.`,
      visual: apparatus('freefall', { at: 0.7, sys: true }, 'The drop timer, with its release delay. Not to scale.'),
    }),
    code({
      id: 'cp-fit-code', difficulty: 3,
      gen(r) {
        const rows = B.makeData('freefall', { seed: r.int(1, 999999), sys: 'delay' }).rows;
        const hs = rows.map((q) => q.s), ts = rows.map((q) => q.R[0]);
        const f = B.fitLine(hs.map(Math.sqrt), ts);            // unweighted: numpy.polyfit
        const g = 2 / f.b ** 2;
        const data = t`import numpy as np

h = np.array([${hs.map((v) => v.toFixed(2)).join(', ')}])          # m
t = np.array([${ts.map((v) => v.toFixed(3)).join(', ')}])   # s
`;
        return {
          prompt: t`These drops include a release delay. Fit $t$ against $\sqrt h$ with \`np.polyfit\`, then set \`g\` to the free-fall acceleration from the slope (in m/s²) and \`delay_ms\` to the intercept in milliseconds.`,
          starter: t`${data}
# fit t against sqrt(h): the slope gives g, the intercept the delay
g = 0.0
delay_ms = 0.0
print(g, delay_ms)
`,
          answer: t`${data}
b, a = np.polyfit(np.sqrt(h), t, 1)
g = 2 / b**2
delay_ms = 1000 * a
print(f"g = {g:.3f} m/s², delay = {delay_ms:.1f} ms")
`,
          tests: [
            { name: `g is 2/slope² (${g.toFixed(3)} m/s²)`, code: `abs(g - ${g}) < 1e-6` },
            { name: `delay_ms is the intercept in ms (${(1000 * f.a).toFixed(1)} ms)`, code: `abs(delay_ms - ${1000 * f.a}) < 1e-6` },
          ],
          hints: [t`\`b, a = np.polyfit(np.sqrt(h), t, 1)\` returns the slope first, then the intercept.`, t`\`g = 2 / b**2\` and \`delay_ms = 1000 * a\`.`],
          teach: 'One straight-line fit, two results: the slope gives the physics, the intercept the systematic offset.',
          explain: t`The fit gives $g = ${g.toFixed(3)}\ \text{m/s}^2$ and a delay of $${(1000 * f.a).toFixed(1)}$ ms — close to the 12 ms the bench builds in, without the delay spoiling $g$.`,
          visual: plot('freefall', rows, { sys: true, fit: false, caption: 'The drops your program fits.' }),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (propagation of uncertainty) and ch. 8 (least squares)'),
    SOURCES.openstax('3.5', '3-5-free-fall', 'Free fall'),
    { label: 'NASA, The Apollo 15 Hammer–Feather Drop', url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html' },
    SOURCES.aapt,
  ],
});
