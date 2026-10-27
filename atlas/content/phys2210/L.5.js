// Lab 5 (virtual): Newton’s second law on a cart — a modified Atwood machine
// with the total accelerated mass held fixed, acceleration against the
// hanging weight, the slope as 1/M and friction as the intercept; why the
// fit must keep its intercept, and why to spread the forces wide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8;

// the worked example: six runs with friction present (seed 33)
const EX = (() => {
  const rows = B.makeData('cart', { seed: 33, sys: 'friction' }).rows;
  const an = B.analyse('cart', rows, { sys: 'friction' });
  const o = B.analyse('cart', rows, { sys: 'friction', origin: true });
  const f = an.series[0].fit, M = an.results[0];
  return { rows, f, M, f0: -f.a / f.b, Mo: o.results[0] };
})();

const runs = (r, sys = null) => {
  const rows = B.makeData('cart', { seed: r.int(1, 999999), sys }).rows;
  return { rows, an: B.analyse('cart', rows, { sys }) };
};

export default lesson({
  id: 'phys2210.L.5',
  title: 'Newton’s second law on a cart',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A cart on a level track is pulled by a string over a pulley to a hanging mass $m$; a motion sensor measures its acceleration. The bench computes each acceleration with realistic sensor scatter.

The weight of the hanger, $F = mg$, accelerates *everything that moves*: cart, slotted masses and hanger, total mass $M$. So the design keeps $M$ fixed — slotted masses are moved from the cart to the hanger, never added — and changes only $F$. Then Newton’s second law, with a steady friction force $f$, is a straight line:

$$a = \frac{1}{M}\,F \;-\; \frac{f}{M}$$

The slope gives $M$; the intercept gives the friction. (Lab skills trained: designing an experiment that varies one thing at a time, and modelling.)`,
  symbols: [
    { tex: 'a', text: 'the acceleration of cart and hanger together, in m/s², from the motion sensor’s velocity–time slope' },
    { tex: 'F = mg', text: 'the weight of the hanging mass $m$ (hanger included), in N: the force that drives the motion' },
    { tex: 'M', text: 'the total mass that accelerates — cart, slotted masses on it, hanger and slotted masses on that — here kept at 0.600 kg' },
    { tex: 'f', text: 'the friction force in the wheels and pulley, in N, taken as steady' },
    { tex: '1/M,\\ -f/M', text: 'the slope (in kg⁻¹, which is m/s² per N) and the intercept (in m/s²) of $a$ against $F$' },
  ],
  why: 'Thrust stands, drop towers and centrifuges all calibrate their force and acceleration sensors by just this kind of straight-line fit — slope for the physics, intercept for the offsets.',
  visual: {
    type: 'lab-bench',
    title: 'Move masses to the hanger, measure the acceleration',
    lead: t`Six runs are in the table, from 10 g to 60 g on the hanger. The plot shows $a$ against $F = mg$ with the least-squares line; the readout gives the slope, the intercept and the mass $M = 1/\text{slope}$.`,
    tasks: [
      'Turn on friction: the line drops by f/M = 0.05 m/s² and now crosses the F axis at about 0.03 N — but its slope, and M, do not change.',
      'With friction on, tick “Also fit a line forced through the origin”: the dashed line is too shallow, and its slope gives a mass that is too large.',
      'Clear the table and measure only at 50 g and 60 g, several times each: the slope’s uncertainty grows, because two close forces give little leverage.',
    ],
    params: { exp: 'cart', seed: 33, originToggle: true },
  },
  example: {
    prompt: t`With friction present, six runs give accelerations ${EX.rows.map((q) => q.R[0].toFixed(3)).join(', ')} m/s² for hanging masses 0.010, 0.020, … 0.060 kg (each $a$ uncertain by 0.006 m/s²). The balance says the moving mass is 0.600 kg. Fit, find $M$ and the friction, and compare.`,
    visual: plot('cart', EX.rows, { sys: true, origin: true, caption: 'a against F with the least-squares line (gold) and, dashed, the line forced through the origin.' }),
    steps: [
      { label: 'Tabulate', text: t`$F = mg$: 0.098, 0.196, 0.294, 0.392, 0.490, 0.588 N. The points lie on a straight line within their error bars — but one that does not pass through the origin.` },
      { label: 'Fit', text: t`Least squares gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{kg}^{-1}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{m/s}^2`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$: a good straight line.` },
      { label: 'Mass', text: t`$M = 1/\text{slope} = ${EX.M.value.toFixed(4)}$ kg. Its uncertainty: $\sigma_M = \sigma_b/b^2 = ${EX.f.sb.toPrecision(2)}/${EX.f.b.toFixed(3)}^2 = ${EX.M.sigma.toPrecision(2)}$ kg (a reciprocal keeps the same *relative* uncertainty). So $M = ${pmTeX(EX.M.value, EX.M.sigma, t`\text{kg}`)}$: just ${(Math.abs(EX.M.value - 0.6) / EX.M.sigma).toFixed(2)}$\sigma$ from the balance’s 0.600 kg.` },
      { label: 'Friction', text: t`The line crosses $a = 0$ at $F_0 = -\text{intercept}/\text{slope} = ${EX.f0.toFixed(4)}$ N: below that pull the cart would not accelerate. That is the friction, $f \approx ${(1000 * EX.f0).toFixed(0)}$ mN, uncertain by about $\sigma_a/b \approx ${(1000 * EX.f.sa / EX.f.b).toFixed(0)}$ mN.` },
      { label: 'Do not force it', text: t`A line forced through the origin has slope $${EX.Mo.value ? (1 / EX.Mo.value).toFixed(3) : ''}\ \text{kg}^{-1}$, giving $M = ${EX.Mo.value.toFixed(3)}$ kg — ${((EX.Mo.value - 0.6) / EX.M.sigma).toFixed(0)} standard errors too heavy. Physics does not promise an intercept of zero; friction is exactly the kind of offset an intercept is for.` },
    ],
    answer: t`$M = ${pmTeX(EX.M.value, EX.M.sigma, t`\text{kg}`)}$, agreeing with the balance; friction $f \approx ${(1000 * EX.f0).toFixed(0)}$ mN from the intercept.`,
  },
  practice: [
    num({
      id: 'M-from-slope', difficulty: 1,
      gen(r) {
        const { rows, an } = runs(r);
        const b = +an.series[0].fit.b.toFixed(3);
        return {
          prompt: t`The least-squares slope of $a$ against $F$ is $${b.toFixed(3)}\ \text{kg}^{-1}$. What total mass is being accelerated?`,
          answer: 1 / b, units: 'kg', tol: { rel: 0.003 },
          errors: [{ value: b, feedback: t`The slope is $1/M$, not $M$: $a = F/M$.` }, { value: b / G, feedback: t`The slope already has $F$ in newtons on the horizontal axis: $M = 1/\text{slope}$, with no $g$.` }],
          hints: [t`Match $a = \dfrac1M F$ with $a = bF$.`],
          teach: 'The slope of acceleration against force is one over the mass being accelerated.',
          explain: t`$M = 1/${b.toFixed(3)} = ${(1 / b).toFixed(3)}$ kg — cart, slotted masses and hanger together.`,
          visual: plot('cart', rows, { caption: 'a against F with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'friction', difficulty: 2,
      gen(r) {
        const { rows, an } = runs(r, 'friction');
        const f = an.series[0].fit;
        const b = +f.b.toFixed(3), a0 = +f.a.toFixed(4);
        const F0 = -a0 / b;
        return {
          prompt: t`With friction, the fit gives slope $${b.toFixed(3)}\ \text{kg}^{-1}$ and intercept $${a0.toFixed(4)}\ \text{m/s}^2$. How large is the friction force?`,
          answer: F0, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: -a0, feedback: t`The intercept is an acceleration, in m/s². Friction is a force: $f = -\text{intercept}\times M = -\text{intercept}/\text{slope}$.` }, { value: -a0 * b, feedback: t`Divide by the slope, do not multiply: $a = (F - f)/M$ reaches zero at $F = f$.` }],
          hints: [t`The line $a = (F - f)/M$ crosses $a = 0$ where $F = f$.`, t`$f = -\text{intercept}/\text{slope}$.`],
          teach: 'Where the line crosses the force axis, the pull just balances friction: the x-intercept is the friction force.',
          explain: t`$f = ${(-a0).toFixed(4)}/${b.toFixed(3)} = ${F0.toFixed(4)}$ N — about ${Math.round(1000 * F0)} mN, the weight of ${(F0 / G * 1000).toFixed(0)} g.`,
          visual: plot('cart', rows, { sys: true, caption: 'a against F with friction present, and the least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'keep-M', difficulty: 2,
      prompt: 'Why does the procedure move slotted masses from the cart to the hanger, instead of simply adding new masses to the hanger?',
      choices: [
        'To keep the total accelerated mass M fixed, so that a is exactly proportional to F and the slope is 1/M',
        'To reduce the friction on the cart',
        'To keep the hanging mass small',
        'It makes no difference: either way works',
      ],
      answer: 0,
      why: {
        1: 'Moving masses off the cart does lighten its wheels slightly, but that is a side effect, not the reason.',
        2: 'The hanging mass still grows from run to run — that is the point: it changes F.',
        3: t`Adding mass to the hanger also adds to $M$: $a = mg/(M_\text{cart} + m)$, a curve, with no single slope to read a mass from.`,
      },
      hints: ['The hanging mass accelerates too. What happens to the total moving mass when you add a new mass to the hanger?'],
      teach: 'A good design changes one variable at a time: here F changes while the total accelerated mass stays fixed.',
      explain: t`With $M$ fixed, $a = F/M$ is a straight line. Adding masses instead makes $a = mg/(M_\text{cart} + m)$, which bends over as $m$ grows — and the slope no longer stands for one mass.`,
      visual: apparatus('cart', { at: 0.03 }, 'Slotted masses ride on the cart until they are moved to the hanger: 0.100 kg in all, shared between the two. Not to scale.'),
    }),
    num({
      id: 'sigma-M', difficulty: 2,
      gen(r) {
        const { rows, an } = runs(r);
        const f = an.series[0].fit;
        const b = +f.b.toFixed(3), sb = +f.sb.toPrecision(2);
        const sM = sb / b ** 2;
        return {
          prompt: t`The slope is $${b.toFixed(3)} \pm ${sb}\ \text{kg}^{-1}$, so $M = 1/b = ${(1 / b).toFixed(4)}$ kg. What is the standard uncertainty of $M$?`,
          answer: +sM.toPrecision(3), units: 'kg', tol: { rel: 0.03 },
          errors: [{ value: sb, feedback: t`That is the slope’s uncertainty, in kg⁻¹. Propagate it: for $M = 1/b$, $\sigma_M = \sigma_b/b^2$.` }, { value: sb / b, feedback: 'That is the relative uncertainty, a pure number. Multiply by M to get kilograms.' }],
          hints: [t`For $M = b^{-1}$, the relative uncertainty carries over unchanged: $\sigma_M/M = \sigma_b/b$.`],
          teach: 'A reciprocal has the same relative uncertainty as the quantity it is the reciprocal of.',
          explain: t`$\sigma_M = M\,\sigma_b/b = ${(1 / b).toFixed(4)}\times${sb}/${b.toFixed(3)} = ${sM.toPrecision(2)}$ kg.`,
          visual: plot('cart', rows, { caption: 'a against F with the least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'forced', difficulty: 3,
      gen(r) {
        const { rows, an } = runs(r, 'friction');
        const o = B.analyse('cart', rows, { sys: 'friction', origin: true });
        return {
          prompt: t`With friction present, a classmate fits a line through the origin “because Newton’s law has no constant term” and gets $M = ${pmTeX(o.results[0].value, o.results[0].sigma, t`\text{kg}`)}$. The balance says 0.600 kg. What went wrong?`,
          choices: [
            'The data do not pass through the origin — friction shifts them down — so forcing the line through (0, 0) tilts it too shallow and makes M too large',
            'Nothing: a fit through the origin is always more accurate, since it has one fewer parameter',
            'The balance must be wrong',
            'The error bars are too small',
          ],
          answer: 0,
          why: {
            1: 'Fewer parameters only help if the dropped one really is zero. Here the intercept is −f/M, several standard errors from zero.',
            2: t`The free fit gives $M = ${pmTeX(an.results[0].value, an.results[0].sigma, t`\text{kg}`)}$, agreeing with the balance; only the forced fit disagrees.`,
            3: 'Larger error bars would not move the forced line’s slope; the problem is the model, not the error bars.',
          },
          hints: ['Where does the free fit cross the a axis?', 'If every point sits below a line through the origin by the same amount, how must a forced line tilt to get close to them?'],
          teach: 'Never force a fit through the origin unless you know the intercept is zero: an offset forced out of the intercept leaks into the slope.',
          explain: t`The free fit’s intercept is $${pmTeX(an.series[0].fit.a, an.series[0].fit.sa, t`\text{m/s}^2`)}$ — clearly not zero. The forced line must swing down to meet the low points at small $F$, so its slope falls and $1/\text{slope}$ rises.`,
          visual: plot('cart', rows, { sys: true, origin: true, caption: 'Free fit (gold) and the fit forced through the origin (dashed).' }),
        };
      },
    }),
    num({
      id: 'leverage', difficulty: 3,
      prompt: t`Two designs each use six runs with the same 0.006 m/s² scatter. Design A spreads the forces evenly from 0.098 to 0.588 N; design B crowds them evenly between 0.392 and 0.588 N. By what factor is the slope’s uncertainty larger in design B?`,
      answer: Math.sqrt(17.5 / (2 * (0.2 ** 2 + 0.6 ** 2 + 1))), tol: { rel: 0.02 },
      errors: [{ value: 17.5 / 2.8, feedback: t`That is the ratio of the sums of squares. The uncertainty goes as one over its *square root*.` }],
      hints: [t`For equal error bars, $\sigma_b = \sigma/\sqrt{\sum (F_i - \bar F)^2}$.`, t`In units of 0.098 N, A uses $F = 1, 2, \ldots, 6$ ($\sum (F_i - \bar F)^2 = 17.5$) and B uses $4, 4.4, 4.8, 5.2, 5.6, 6$ ($\sum = 2(1^2 + 0.6^2 + 0.2^2) = 2.8$).`],
      teach: t`Spreading the independent variable widely pins the slope down much better: $\sigma_b \propto 1/\sqrt{\sum (x - \bar x)^2}$.`,
      explain: t`$\sigma_b \propto 1/\sqrt{\sum (F_i - \bar F)^2}$, so the ratio is $\sqrt{17.5/2.8} = ${Math.sqrt(17.5 / 2.8).toFixed(2)}$ — for evenly spaced points, simply the ratio of the ranges, 0.49 N to 0.196 N. Design B would need about ${(17.5 / 2.8).toFixed(1)} times as many runs to pin the slope down as well.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 0.65], y: [0, 1.1], xlabel: 'F (N)', ylabel: 'a (m/s²)',
          curves: [{ fn: 'x/0.6', color: 'ink4', dash: true, domain: [0, 0.65] }],
          points: [...[1, 2, 3, 4, 5, 6].map((k) => ({ x: +(0.098 * k).toFixed(3), y: +(0.098 * k / 0.6 + 0.04).toFixed(3), r: 4, color: 'accent' })), ...[4, 4.4, 4.8, 5.2, 5.6, 6].map((k) => ({ x: +(0.098 * k).toFixed(3), y: +(0.098 * k / 0.6 - 0.06).toFixed(3), r: 4, color: 'violet' })), { x: 0.05, y: 1.0, r: 0.01, color: 'accent', label: 'A: spread out' }, { x: 0.05, y: 0.9, r: 0.01, color: 'violet', label: 'B: crowded' }],
        },
        caption: 'The forces each design uses (offset vertically so both show). Wider spread, firmer slope.',
      },
      solution: t`With all $\sigma_i$ equal to $\sigma$, $\sigma_b = \sigma/\sqrt{S}$ with $S = \sum (F_i - \bar F)^2$. In units of $u = 0.098$ N: A has $\bar F = 3.5u$ and $S_A = (2.5^2 + 1.5^2 + 0.5^2)\times 2\,u^2 = 17.5u^2$; B has $\bar F = 5u$ and $S_B = (1^2 + 0.6^2 + 0.2^2)\times 2\,u^2 = 2.8u^2$. Ratio $\sqrt{S_A/S_B} = \sqrt{6.25} = 2.5$.`,
    }),
    code({
      id: 'fit-code', difficulty: 2,
      gen(r) {
        const rows = B.makeData('cart', { seed: r.int(1, 999999), sys: 'friction' }).rows;
        const ms = rows.map((q) => q.s), as = rows.map((q) => q.R[0]);
        const f = B.fitLine(ms.map((m) => m * G), as);
        const data = t`import numpy as np

g = 9.80
m = np.array([${ms.map((v) => v.toFixed(3)).join(', ')}])   # kg, hanging mass
a = np.array([${as.map((v) => v.toFixed(3)).join(', ')}])   # m/s²
`;
        return {
          prompt: t`Fit $a$ against $F = mg$ with \`np.polyfit\`. Set \`M\` to the accelerated mass (kg) from the slope and \`f\` to the friction force (N) from where the line crosses $a = 0$.`,
          starter: t`${data}
F = m * g
# fit a against F, then set M and f
M = 0.0
f = 0.0
print(M, f)
`,
          answer: t`${data}
F = m * g
slope, intercept = np.polyfit(F, a, 1)
M = 1 / slope
f = -intercept / slope
print(f"M = {M:.4f} kg, friction = {f:.4f} N")
`,
          tests: [
            { name: `M is 1/slope (${(1 / f.b).toFixed(4)} kg)`, code: `abs(M - ${1 / f.b}) < 1e-6` },
            { name: `f is where the line crosses a = 0 (${(-f.a / f.b).toFixed(4)} N)`, code: `abs(f - ${-f.a / f.b}) < 1e-6` },
          ],
          hints: [t`\`slope, intercept = np.polyfit(F, a, 1)\`.`, t`\`M = 1 / slope\` and \`f = -intercept / slope\`.`],
          teach: 'The slope gives the inverse mass; the x-intercept, minus intercept over slope, gives the friction force.',
          explain: t`The fit gives $M = ${(1 / f.b).toFixed(4)}$ kg and $f = ${(-f.a / f.b).toFixed(4)}$ N — the bench’s friction is 0.030 N, recovered to within the scatter.`,
          visual: plot('cart', rows, { sys: true, fit: false, caption: 'The runs your program fits.' }),
        };
      },
    }),
    num({
      id: 'predict-a', difficulty: 2,
      gen(r) {
        const { rows, an } = runs(r, 'friction');
        const f = an.series[0].fit;
        const b = +f.b.toFixed(3), a0 = +f.a.toFixed(4), m = r.pick([0.035, 0.045, 0.055, 0.07]);
        const a = a0 + b * m * G;
        return {
          prompt: t`From the fit — slope $${b.toFixed(3)}\ \text{kg}^{-1}$, intercept $${a0.toFixed(4)}\ \text{m/s}^2$ — predict the acceleration with ${(1000 * m).toFixed(0)} g on the hanger.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: b * m * G, feedback: 'Keep the intercept: friction still takes its share at every force.' }, { value: a0 + b * m, feedback: t`The horizontal axis is the force $F = mg$, not the mass: multiply by $g$.` }],
          hints: [t`$a = \text{intercept} + \text{slope}\times mg$.`],
          teach: 'A fitted line predicts new points with both its parameters — slope and intercept.',
          explain: t`$a = ${a0.toFixed(4)} + ${b.toFixed(3)}\times(${m}\times9.8) = ${a.toFixed(3)}\ \text{m/s}^2$.`,
          visual: plot('cart', rows, { sys: true, caption: 'a against F with the least-squares line. Extend it to the new force, or compute.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sled', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([600, 750, 900, 1200]), mu = r.pick([0.02, 0.03, 0.04]);
        const b = 1 / M, f = mu * M * G, a0 = -f / M;
        const bs = +b.toPrecision(3), a0s = +a0.toFixed(3);
        return {
          prompt: t`A rocket sled on rails is fired with several motor settings. Plotting its measured acceleration against thrust gives slope $${(bs * 1000).toPrecision(3)}\times10^{-3}\ \text{kg}^{-1}$ and intercept $${a0s.toFixed(3)}\ \text{m/s}^2$. What is the resistive force (slipper friction) on the sled?`,
          answer: -a0s / bs, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: -a0s, feedback: t`The intercept is an acceleration. Friction is the thrust at which the line crosses $a = 0$: $-\text{intercept}/\text{slope}$.` }, { value: 1 / bs, feedback: 'That is the sled’s mass, from the slope. The friction comes from the intercept as well.' }],
          hints: [t`$a = \dfrac{T - f}{M}$: slope $1/M$, intercept $-f/M$.`, t`$f = -\text{intercept}/\text{slope}$.`],
          teach: 'For any driven body, acceleration against driving force has slope 1/M and an intercept of −(resistance)/M.',
          explain: t`$f = ${(-a0s).toFixed(3)}/(${(bs * 1000).toPrecision(3)}\times10^{-3}) = ${(-a0s / bs).toFixed(0)}$ N, on a sled of mass $1/\text{slope} = ${(1 / bs).toFixed(0)}$ kg.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [-1, Math.ceil(bs * 1000 * 6 + 0.5)], xlabel: 'thrust (kN)', ylabel: 'a (m/s²)', curves: [{ fn: `${+(bs * 1000).toFixed(5)}*x + ${a0s}`, color: 'gold', domain: [0, 6] }], points: [1.5, 2.5, 3.5, 4.5, 5.5].map((T, i) => ({ x: T, y: +(bs * 1000 * T + a0s + [0.06, -0.05, 0.04, -0.06, 0.03][i]).toFixed(3), r: 4, color: 'accent' })) }, caption: 'Sled acceleration against thrust, with the fitted line (illustrative data).' },
        };
      },
    }),
    mcq({
      id: 'cp-curved', difficulty: 2,
      prompt: t`Another group *added* masses to the hanger, leaving the cart’s masses in place, and plotted $a$ against $mg$. Their graph bends over at large $mg$. Why?`,
      choices: [
        t`The accelerated mass grows with the hanging mass, so $a = mg/(M_\text{cart} + m)$ rises more and more slowly`,
        'Friction grows with speed',
        'The string stretches',
        'The motion sensor saturates at large accelerations',
      ],
      answer: 0,
      why: {
        1: 'Friction in the wheels hardly changes with speed — and it would shift the line, not bend it.',
        2: 'A light string barely stretches; and it would not depend on the hanging mass this way.',
        3: 'These accelerations are well within a motion sensor’s range.',
      },
      hints: ['Which mass accelerates when the hanger falls?'],
      teach: 'If the total accelerated mass changes along with the force, a is no longer proportional to F.',
      explain: t`Adding mass to the hanger adds it to $M$ too: $a = mg/(M_\text{cart} + m)$ approaches $g$ only as $m \to \infty$. Keeping $M$ fixed is what makes the graph straight.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [0, 5.2], xlabel: 'mg (N)', ylabel: 'a (m/s²)', curves: [{ fn: 'x/0.6', color: 'ink4', dash: true, domain: [0, 3], label: 'moving mass held at 0.600 kg', labelAt: 1.2, labelDx: -150, labelDy: -12 }, { fn: 'x/(0.6 + x/9.8)', color: 'accent', domain: [0, 3], label: 'masses added to the hanger', labelAt: 2.2, labelDy: 16 }] }, caption: 'Adding new masses to the hanger (blue) bends the line over; holding the moving mass fixed (dashed) keeps it straight.' },
    }),
    num({
      id: 'cp-agree', difficulty: 2,
      gen(r) {
        const { an } = runs(r, r.bool(0.5) ? 'friction' : null);
        const q = an.results[0];
        const M = +q.value.toFixed(4), s = +q.sigma.toPrecision(2);
        const z = Math.abs(M - 0.6) / Math.hypot(s, 0.001);
        return {
          prompt: t`Your fit gives $M = ${M.toFixed(4)} \pm ${s}$ kg. The balance reads $0.600 \pm 0.001$ kg. How many combined standard uncertainties apart are they?`,
          answer: +z.toPrecision(3), tol: { rel: 0.03, abs: 0.04 },
          hints: [t`Combine both uncertainties in quadrature: $\sqrt{${s}^2 + 0.001^2}$.`],
          teach: 'When both results carry uncertainty, divide their difference by the quadrature sum of the two.',
          explain: t`$z = ${Math.abs(M - 0.6).toFixed(4)}/\sqrt{${s}^2 + 0.001^2} = ${z.toFixed(2)}$: ${z <= 2 ? 'the two agree.' : 'a real disagreement.'} The fit, not the balance, dominates the combined uncertainty.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0.57, 0.63], y: [0.3, 2.9], xlabel: 'M (kg)', ylabel: ' ', yticks: 0.001, xticks: 6, curves: [{ param: [`${+(M - s).toFixed(5)} + ${+(2 * s).toFixed(5)}*t`, '2'], t: [0, 1], color: 'accent', width: 3 }, { param: ['0.599 + 0.002*t', '1'], t: [0, 1], color: 'violet', width: 3 }], points: [{ x: M, y: 2, r: 4.5, color: 'accent', label: 'from the fit', labelDx: -30, labelDy: -16 }, { x: 0.6, y: 1, r: 4.5, color: 'violet', label: 'balance', labelDx: -20, labelDy: -16 }] }, caption: 'The two mass measurements with ±1σ bars.' },
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 8 (least squares) and ch. 3'),
    SOURCES.openstax('5.3', '5-3-newtons-second-law', 'Newton’s second law'),
    SOURCES.aapt,
  ],
});
