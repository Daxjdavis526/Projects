// Work done by a variable force: W = ∫ F dx, the area under the F–x graph —
// with the spring, ½kx², as the first case.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { s3, fxGraph, thou } from './_energy.js';

const t = String.raw;

// the worked example: a stiffening launch cord, F = a x + b x³, stretched 0.50 m
const EX = { a: 200, b: 1600, L: 0.5 };
EX.W1 = (EX.a * EX.L ** 2) / 2;                         // 25 J
EX.W2 = (EX.b * EX.L ** 4) / 4;                         // 25 J
EX.W = EX.W1 + EX.W2;                                   // 50 J
EX.FL = EX.a * EX.L + EX.b * EX.L ** 3;                 // 300 N at full stretch

// a spring's force-against-stretch line with the work shaded from x1 to x2
const springPic = (k, x1, x2, xmax, caption) => fxGraph({
  F: `${k}*x`, from: x1, to: x2, x: [0, xmax], y: [0, k * xmax * 1.12], xlabel: 'stretch x (m)', ylabel: 'force you apply (N)', caption,
});

export default lesson({
  id: 'phys2210.M7.2',
  title: 'Work done by a variable force',
  minutes: 11, difficulty: 3,
  intro: t`When a force changes as the object moves — a spring that pulls harder the further you stretch it, gas pushing a piston — there is no single force to multiply by the distance. Cut the path into small steps $dx$, on each of which the force is nearly constant, and add up the pieces $F\,dx$. In the limit that sum is an integral, the **area under the force–position graph**:

$$W = \int_{x_1}^{x_2} F_x(x)\,dx$$

For an ideal spring the force you need grows in proportion to the stretch, $F = kx$, so the area is a triangle: stretching a spring by $x$ from its natural length takes $W = \tfrac12 kx^2$.`,
  symbols: [
    { tex: 'W', text: 'the work done by the force while the object moves from $x_1$ to $x_2$, in joules (J)' },
    { tex: 'F_x(x)', text: 'the component of the force along the motion, as a function of position, in newtons (N). Where it is negative (pointing towards $-x$), the area counts as negative work' },
    { tex: 'x_1,\\ x_2', text: 'the start and end positions, in metres (m)' },
    { tex: 'dx', text: 'a small step along the path, in m. $F_x\\,dx$ is the work done on that step: one thin strip of the area' },
    { tex: 'k', text: 'a spring’s stiffness (spring constant), in N/m: the force needed per metre of stretch. Hooke’s law: the spring pulls back with $F_s = -kx$, where $x$ is measured from its natural length' },
  ],
  why: 'Real forces vary — springs, gas pressure, gravity far from Earth, aerodynamic loads — and this one integral handles every one of them. The area picture lets you read work straight off a measured force curve.',
  visual: {
    type: 'graph',
    title: 'Work is the area under the force curve',
    lead: t`The curve is the force needed to stretch a cord by $x$: $F = kx + cx^3$. With $c = 0$ it is an ideal spring. The orange strips are $F\,\Delta x$ — the work on each small step — and their total approaches the exact area as the strips get thinner.`,
    tasks: [
      'Set the number of strips to 1, then 4, then 40: the sum of F Δx closes in on the exact work.',
      'With c = 0 (an ideal spring) the area is a triangle. Double the stretch b: the work quadruples, because W = ½kb².',
      'Turn up c: the cord stiffens, the curve bends upward, and the last part of the stretch costs most of the work.',
    ],
    params: {
      x: [0, 0.55], y: [0, 300], xlabel: 'stretch x (m)', ylabel: 'force F (N)', aspect: 'wide',
      sliders: [
        { key: 'b', label: 'Stretch $b$', min: 0.05, max: 0.5, step: 0.01, value: 0.45, unit: '\\mathrm{m}', explain: 'How far the cord is stretched from its natural length.' },
        { key: 'k', label: 'Stiffness $k$', min: 100, max: 300, step: 10, value: 250, unit: '\\mathrm{N/m}', explain: 'The linear (Hooke’s-law) part of the force.' },
        { key: 'c', label: 'Stiffening $c$', min: 0, max: 1000, step: 25, value: 0, unit: '\\mathrm{N/m^3}', explain: 'The cubic part: zero for an ideal spring, larger for a cord that stiffens as it stretches.' },
        { key: 'n', label: 'Strips $n$', min: 1, max: 40, step: 1, value: 4, explain: 'How many small steps the stretch is cut into.' },
      ],
      curves: [{ fn: 'k*x + c*x^3', color: 'accent', width: 2.6 }],
      riemann: { fn: 'k*x + c*x^3', from: 0, to: 'b', n: 'n', rule: 'mid' },
      readouts: [
        { label: 'sum of $F\\,\\Delta x$', expr: 'riemann', unit: '\\mathrm{J}', digits: 4 },
        { label: 'exact work $\\int_0^b F\\,dx$', expr: 'integral', unit: '\\mathrm{J}', digits: 4 },
      ],
    },
    caption: 'Each strip uses the force at its midpoint. A real cord also loses some energy to internal friction (hysteresis); this model has none.',
  },
  example: {
    prompt: t`A launch cord for a model glider stiffens as it stretches: the force needed to stretch it by $x$ is $F(x) = (${EX.a}\ \text{N/m})\,x + (${EX.b}\ \text{N/m}^3)\,x^3$. How much work does it take to stretch it ${EX.L.toFixed(2)} m from its natural length?`,
    visual: fxGraph({ F: `${EX.a}*x + ${EX.b}*x^3`, from: 0, to: EX.L, x: [0, 0.6], y: [0, 340], xlabel: 'stretch x (m)', ylabel: 'force F (N)',
      extra: { curves: [{ fn: `${EX.a}*x + ${EX.b}*x^3`, color: 'accent', width: 2.6 }, { fn: `${EX.FL / EX.L}*x`, domain: [0, EX.L], color: 'ink3', width: 1.4, dash: true }] },
      caption: t`The cord’s force curve, with the work shaded. Dashed: a straight line to the same final force (${EX.FL} N), whose triangle would be 75 J.` }),
    steps: [
      { label: 'Set up the integral', text: t`The force changes with $x$, so $W = \displaystyle\int_0^{${EX.L.toFixed(2)}} \left(${EX.a}x + ${EX.b}x^3\right)dx$.` },
      { label: 'Integrate term by term', text: t`$\displaystyle\int ${EX.a}x\,dx = ${EX.a / 2}x^2$ and $\displaystyle\int ${EX.b}x^3\,dx = ${EX.b / 4}x^4$.` },
      { label: 'Evaluate', text: t`$W = ${EX.a / 2}(${EX.L.toFixed(2)})^2 + ${EX.b / 4}(${EX.L.toFixed(2)})^4 = ${EX.W1} + ${EX.W2} = ${EX.W}\ \text{J}$.` },
      { label: 'Read it as an area', text: t`At full stretch the force is $F(${EX.L.toFixed(2)}) = ${EX.FL}$ N. A straight line to that point would enclose a triangle of $\tfrac12(${EX.FL})(${EX.L.toFixed(2)}) = 75$ J; the real curve sags below the line, so the area — the work — is less: ${EX.W} J.` },
      { label: 'Units check', text: t`(N/m)·m² = N·m = J, and (N/m³)·m⁴ = N·m = J. ✓` },
    ],
    answer: t`$W = ${EX.W}$ J.`,
  },
  practice: [
    num({
      id: 'spring-stretch', difficulty: 1,
      gen(r) {
        const k = r.pick([150, 200, 250, 400, 500, 800]), x = r.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25]);
        const W = 0.5 * k * x * x;
        return {
          prompt: t`How much work does it take to stretch a spring with $k = ${k}$ N/m by ${x} m from its natural length?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: k * x * x, feedback: t`The force grows from 0 to $kx$, so the area is a triangle: include the ½.` },
            { value: k * x, feedback: t`That is the final force, $kx$, in newtons — not the work.` },
          ],
          hints: [t`The force grows from 0 to $kx$: the area under the graph is a triangle, $W = \tfrac12 kx^2$.`],
          teach: 'Stretching an ideal spring by x from its natural length takes W = ½kx² — the triangle under F = kx.',
          explain: t`$W = \tfrac12(${k})(${x})^2 = ${s3(W)}$ J — the area of a triangle of base ${x} m and height ${s3(k * x)} N.`,
          visual: springPic(k, 0, x, x * 1.5, 'The force you apply against the stretch; the shaded triangle is the work.'),
        };
      },
    }),
    num({
      id: 'trapezoid-area', difficulty: 2,
      gen(r) {
        const F0 = r.pick([40, 60, 80, 120]), a = r.pick([1, 2]), b = a + r.pick([2, 3, 4]), c = b + r.pick([1, 2, 3]);
        const W = F0 * (a / 2 + (b - a) + (c - b) / 2);
        const fexpr = `min(${F0}*x/${a}, ${F0}, ${F0}*(${c} - x)/${c - b})`;
        return {
          prompt: t`The graph shows the force on a cart as it moves along a track from $x = 0$ to $x = ${c}$ m. How much work does the force do?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: F0 * c, feedback: 'That treats the force as its peak value the whole way. The ramps up and down are triangles, not rectangles.' },
            { value: F0 * (b - a), feedback: 'You counted only the flat part. The sloping parts enclose area too.' },
          ],
          hints: ['Work is the area under the F–x graph. Split it into a triangle, a rectangle and a triangle.', t`Triangles: $\tfrac12(\text{base})(\text{height})$; rectangle: base × height.`],
          teach: 'For a force that varies with position, the work is the area under the F–x graph.',
          explain: t`$\tfrac12(${a})(${F0}) + (${b - a})(${F0}) + \tfrac12(${c - b})(${F0}) = ${F0 * a / 2} + ${F0 * (b - a)} + ${F0 * (c - b) / 2} = ${W}$ J.`,
          visual: fxGraph({ F: fexpr, from: 0, to: c, x: [0, c + 0.6], y: [0, F0 * 1.25], caption: 'Force along the track against position; the shaded area is the work.', extra: { curves: [{ fn: fexpr, domain: [0, c], color: 'accent', width: 2.6 }] } }),
        };
      },
    }),
    num({
      id: 'spring-x1-x2', difficulty: 2,
      gen(r) {
        const k = r.pick([200, 300, 400, 500]), x1 = r.pick([0.05, 0.1, 0.15]), x2 = x1 + r.pick([0.1, 0.15, 0.2]);
        const W = 0.5 * k * (x2 * x2 - x1 * x1);
        return {
          prompt: t`A spring with $k = ${k}$ N/m is already stretched ${x1} m. How much more work does it take to stretch it to ${fmt(x2, 2)} m?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: 0.5 * k * (x2 - x1) ** 2, feedback: t`$\tfrac12 k(\Delta x)^2$ would be right only from the natural length. Here the force starts at $kx_1$, not zero: use $\tfrac12 k(x_2^2 - x_1^2)$.` },
            { value: 0.5 * k * x2 * x2, feedback: t`That is the work from the natural length all the way to $x_2$. Subtract the part already done, up to $x_1$.` },
          ],
          hints: ['The area under F = kx from x₁ to x₂ is a trapezoid, not a triangle.', t`$W = \tfrac12 k x_2^2 - \tfrac12 k x_1^2$ — or the average force times the distance.`],
          teach: 'Spring work depends on the start and end stretches: W = ½k(x₂² − x₁²), not ½k(x₂ − x₁)².',
          explain: t`$W = \tfrac12(${k})\left(${fmt(x2, 2)}^2 - ${x1}^2\right) = ${s3(W)}$ J. As a trapezoid: the average force $\tfrac12(${s3(k * x1)} + ${s3(k * x2)})$ N times ${fmt(x2 - x1, 2)} m gives the same.`,
          visual: springPic(k, x1, x2, x2 * 1.35, 'The force you apply against the stretch; the shaded trapezoid is the extra work.'),
        };
      },
    }),
    mcq({
      id: 'spring-sign', difficulty: 2,
      prompt: t`You stretch a spring (stiffness $k$) slowly from its natural length to a stretch $x$. How much work does **the spring** do on your hand?`,
      choices: [t`$-\tfrac12 kx^2$`, t`$+\tfrac12 kx^2$`, t`$-kx^2$`, '0, because the spring gives the energy back later'],
      answer: 0,
      why: {
        1: 'That is the work *you* do on the spring. The spring pulls back towards its natural length while your hand moves away, so its work is negative.',
        2: 'The spring’s force grows from 0 to kx; the area is a triangle, so the ½ belongs.',
        3: 'The energy can come back later, but during the stretch the spring’s force opposes the motion and its work is negative.',
      },
      hints: ['Which way does the spring’s force point while your hand moves outward?', t`The spring’s force is $F_s = -kx$: integrate it from 0 to $x$.`],
      teach: 'A spring being stretched pulls back against the motion, so the work it does is negative: −½kx².',
      explain: t`$W_s = \int_0^x (-kx')\,dx' = -\tfrac12 kx^2$: the shaded area lies below the axis. You do $+\tfrac12 kx^2$, and the energy is stored in the spring.`,
      visual: fxGraph({ F: '-200*x', from: 0, to: 0.3, x: [0, 0.4], y: [-75, 15], xlabel: 'stretch x (m)', ylabel: 'spring’s force (N)', caption: t`The spring’s own force, $F_s = -kx$ (here $k = 200$ N/m), while it is stretched to 0.30 m. Area below the axis counts as negative work.` }),
    }),
    num({
      id: 'integrate-x2', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4, 6]), x1 = r.pick([0, 1]), x2 = r.pick([2, 3, 4]);
        const W = (a * (x2 ** 3 - x1 ** 3)) / 3;
        return {
          prompt: t`A force along the $x$-axis has $F(x) = (${a}\ \text{N/m}^2)\,x^2$. How much work does it do on an object that moves from $x = ${x1}$ m to $x = ${x2}$ m?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [
            { value: a * (x2 ** 3 - x1 ** 3), feedback: t`$\int x^2\,dx = \tfrac{x^3}{3}$: you lost the ⅓.` },
            { value: a * x2 * x2 * (x2 - x1), feedback: 'That uses the final force for the whole path. The force is smaller earlier on: integrate.' },
          ],
          hints: [t`$W = \int_{${x1}}^{${x2}} ${a}x^2\,dx$.`, t`An antiderivative of $${a}x^2$ is $\tfrac{${a}}{3}x^3$; evaluate it at both limits and subtract.`],
          teach: 'For a force given as a function of position, integrate it over the path: W = ∫F dx.',
          explain: t`$W = \left[\tfrac{${a}}{3}x^3\right]_{${x1}}^{${x2}} = \tfrac{${a}}{3}(${x2 ** 3} - ${x1 ** 3}) = ${s3(W)}$ J.`,
          visual: fxGraph({ F: `${a}*x^2`, from: x1, to: x2, x: [0, x2 + 0.5], y: [0, a * (x2 + 0.5) ** 2 * 0.95], caption: t`$F = ${a}x^2$; the shaded area from $x = ${x1}$ m to ${x2} m is the work.` }),
        };
      },
    }),
    num({
      id: 'sign-change', difficulty: 3,
      gen(r) {
        const F0 = r.pick([30, 40, 50, 60]), F1 = r.pick([10, 20]), L = r.pick([4, 5, 6, 8]);
        const W = (L * (F0 - F1)) / 2, x0 = (F0 * L) / (F0 + F1);
        const fe = `${F0} - ${(F0 + F1) / L}*x`;
        return {
          prompt: t`The force on a cart falls steadily from ${F0} N at $x = 0$ to $-${F1}$ N at $x = ${L}$ m, as shown. What is the total work done by the force over the ${L} m?`,
          answer: W, units: 'J', tol: { rel: 0.01, abs: 0.01 },
          errors: [
            { value: (L * (F0 + F1)) / 2, feedback: 'The part below the axis is negative work: subtract it, do not add it.' },
            { value: (F0 * x0) / 2, feedback: 'That is only the positive part. After the graph crosses the axis the force opposes the motion and takes some of that work back.' },
          ],
          hints: [
            'Above the axis the force pushes along +x (positive work); below it, it pushes back (negative work).',
            t`The line crosses zero at $x = ${s3(x0)}$ m. Area above: $\tfrac12(${s3(x0)})(${F0})$; area below: $\tfrac12(${s3(L - x0)})(${F1})$. Subtract.`,
          ],
          teach: 'Area below the x-axis on an F–x graph is negative work: the force opposes the motion there.',
          explain: t`Positive: $\tfrac12(${s3(x0)})(${F0}) = ${s3(F0 * x0 / 2)}$ J. Negative: $\tfrac12(${s3(L - x0)})(${F1}) = ${s3(F1 * (L - x0) / 2)}$ J. Net: ${s3(W)} J — the same as the trapezoid rule, $\tfrac12(${F0} + (-${F1}))(${L})$.`,
          visual: fxGraph({ F: fe, from: 0, to: L, x: [0, L + 0.5], y: [-F1 * 1.5, F0 * 1.25], caption: 'Force on the cart against position. Green area: positive work; red area: negative work.' }),
        };
      },
    }),
    {
      type: 'slider', id: 'set-stretch', difficulty: 2, param: 'b',
      instruction: 'Drag the stretch slider to the right value, then check.',
      gen(r) {
        const k = r.pick([200, 400, 500, 800]), x = r.pick([0.15, 0.2, 0.25, 0.3, 0.35, 0.4]);
        const W = 0.5 * k * x * x;
        return {
          prompt: t`A spring has $k = ${k}$ N/m. Set the stretch $b$ at which the work done stretching it from its natural length is ${fmt(W, 3)} J.`,
          answer: [x - 0.006, x + 0.006],
          hints: [t`$W = \tfrac12 kb^2$, so $b = \sqrt{2W/k}$.`],
          teach: 'Spring work grows as the square of the stretch, so the stretch grows only as the square root of the work.',
          explain: t`$b = \sqrt{2W/k} = \sqrt{2(${fmt(W, 3)})/${k}} = ${x}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 0.5], y: [0, k * 0.5 * 1.08], xlabel: 'stretch x (m)', ylabel: 'force (N)', aspect: 'wide',
              sliders: [{ key: 'b', label: 'Stretch $b$', min: 0.05, max: 0.5, step: 0.01, value: 0.05, unit: '\\mathrm{m}', explain: 'The spring is stretched from 0 to b.' }],
              curves: [{ fn: `${k}*x`, color: 'accent', width: 2.6 }],
              shade: [{ fn: `${k}*x`, from: 0, to: 'b', color: 'good', alpha: 0.28 }],
            },
            caption: t`The force needed against the stretch, $F = ${k}x$. The shaded triangle is the work done so far.`,
          },
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-pneumatic', difficulty: 3, transfer: true,
      gen(r) {
        const F0 = r.pick([1500, 2000, 2500, 3000]), x0 = r.pick([0.05, 0.1]), x1 = r.pick([0.4, 0.5, 0.6, 0.8]);
        const W = F0 * x0 * Math.log(x1 / x0);
        return {
          prompt: t`A pneumatic catapult launches a small surveillance drone. Compressed air pushes the launch piston with $${thou(F0)}$ N when the piston is ${x0} m along the barrel, and the air expands as the piston moves, so the force falls as $F(x) = F_0 x_0/x$ (an isothermal expansion). How much work does the air do as the piston travels from ${x0} m to ${x1} m?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: F0 * (x1 - x0), feedback: 'That keeps the force at its starting value. It falls as the air expands: integrate.' },
            { value: F0 * x0 * (1 / x0 - 1 / x1), feedback: t`$\int dx/x = \ln x$, not $-1/x$.` },
          ],
          hints: [t`$W = \int_{x_0}^{x_1} \dfrac{F_0 x_0}{x}\,dx$.`, t`$\int \dfrac{dx}{x} = \ln x$, so $W = F_0x_0\ln(x_1/x_0)$.`],
          teach: 'A force that falls as 1/x does work F₀x₀ ln(x₁/x₀): integrate, do not multiply.',
          explain: t`$W = F_0 x_0 \ln\dfrac{x_1}{x_0} = (${thou(F0)})(${x0})\ln\dfrac{${x1}}{${x0}} = ${s3(W)}$ J. (A fast real expansion is closer to adiabatic, with the force falling even faster.)`,
          visual: fxGraph({ F: `${F0 * x0}/x`, from: x0, to: x1, x: [0, x1 + 0.1], y: [0, F0 * 1.15], xlabel: 'piston position x (m)', caption: 'The air’s force on the piston against its position. The shaded area is the work.', extra: { curves: [{ fn: `${F0 * x0}/x`, domain: [x0 * 0.9, x1 + 0.1], color: 'accent', width: 2.6 }] } }),
        };
      },
    }),
    num({
      id: 'cp-area', difficulty: 2,
      gen(r) {
        const F0 = r.pick([20, 30, 50, 80]), a = r.pick([2, 3, 4]), b = a + r.pick([2, 3]);
        const W = (F0 * a) / 2 + F0 * (b - a);
        const fe = `min(${F0}*x/${a}, ${F0})`;
        return {
          prompt: t`A robot arm pushes a part along a guide. Its force rises steadily from 0 to ${F0} N over the first ${a} m, then stays at ${F0} N until $x = ${b}$ m. How much work does it do?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: F0 * b, feedback: 'The force was not at full strength from the start: the first part is a triangle.' }],
          hints: ['Work is the area under the F–x graph: a triangle plus a rectangle.'],
          teach: 'Read work as the area under the force–position graph.',
          explain: t`$\tfrac12(${a})(${F0}) + (${b - a})(${F0}) = ${(F0 * a) / 2} + ${F0 * (b - a)} = ${W}$ J.`,
          visual: fxGraph({ F: fe, from: 0, to: b, x: [0, b + 0.5], y: [0, F0 * 1.3], caption: 'The arm’s force against position; the shaded area is the work.', extra: { curves: [{ fn: fe, domain: [0, b], color: 'accent', width: 2.6 }] } }),
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: 'Stretching a spring 2 cm from its natural length takes 0.4 J of work. How much work does it take to stretch it 4 cm from its natural length?',
      choices: ['1.6 J', '0.8 J', '1.2 J', '0.4 J'],
      answer: 0,
      why: {
        1: t`The force doubles too, so the triangle under $F = kx$ doubles in both base and height: four times the area.`,
        2: t`1.2 J is the work for the *second* 2 cm alone (1.6 − 0.4). The question asks for the whole 4 cm.`,
        3: 'Each extra centimetre needs more force than the last, so the work grows faster than the stretch.',
      },
      hints: [t`$W = \tfrac12 kx^2$: what happens to $x^2$ when $x$ doubles?`],
      teach: 'Spring work grows as the square of the stretch: double the stretch, four times the work.',
      explain: t`$W \propto x^2$, so doubling $x$ multiplies $W$ by 4: $4 \times 0.4 = 1.6$ J.`,
      visual: fxGraph({ F: '2000*x', from: 0, to: 0.04, x: [0, 0.05], y: [0, 105], xlabel: 'stretch x (m)', ylabel: 'force (N)', caption: t`$F = kx$ with the 4 cm triangle shaded. (This spring has $k = 2000$ N/m.)`, vlines: [{ x: 0.02, label: '2 cm' }] }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §7.1 Work (variable forces and springs)', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-1-work' },
  ],
});

