// Conservative forces and potential-energy functions: work independent of the
// path, ΔU = −∫F dx, and F = −dU/dx — the force points downhill on U(x).
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { fmt, frac } from '../../src/core/format.js';
import { G, s3 } from './_energy.js';
import { co } from './_kinematics.js';

const t = String.raw;

// the Explore landscape and its slope
const UX = 'x^4/4 - 2*x^2 + x', DU = 'x^3 - 4*x + 1';
const U0 = (x) => x ** 4 / 4 - 2 * x * x + x;

// the worked example: U(x) = 3x² − 2x³ (J, x in m)
const EX = { x: 1.5 };
EX.F = -6 * EX.x + 6 * EX.x * EX.x;            // 4.5 N

// a static U(x) graph with optional marked points and arrows
const uGraph = ({ U, x, y, points = [], arrows = [], curves = [], caption, xlabel = 'x (m)', ylabel = 'U (J)', numbers = true }) => ({
  type: 'graph',
  params: {
    x, y, xlabel, ylabel, aspect: 'wide', ...(numbers ? {} : { yticks: 0.001 }),
    curves: [{ fn: U, color: 'accent', width: 2.6 }, ...curves], points, arrows,
  },
  caption,
});

// two routes from P to Q
const routes = (h, caption) => ({
  type: 'graph',
  params: {
    x: [-1, 8], y: [-0.6, h + 2.4], equal: true, aspect: 'wide', xlabel: 'horizontal (m)', ylabel: 'height (m)',
    alt: 'Two routes between the same two points',
    curves: [
      { param: ['7*t', `${h}*t`], t: [0, 1], color: 'accent', width: 2.4, label: 'route 1' },
      { param: ['7*t', `${h}*t + 1.6*sin(2*pi*t)`], t: [0, 1], color: 'warn', width: 2.4 },
    ],
    points: [{ x: 0, y: 0, color: 'ink', label: 'P', labelDx: -14 }, { x: 7, y: h, color: 'ink', label: 'Q' }, { x: 1.6, y: 1.45 + h * 0.23, r: 0.01, color: 'warn', label: 'route 2' }, { x: 3.6, y: h * 0.51 - 0.35, r: 0.01, color: 'accent', label: 'route 1' }],
  },
  caption,
});

export default lesson({
  id: 'phys2210.M8.2',
  title: 'Conservative forces and potential-energy functions',
  minutes: 11, difficulty: 3,
  intro: t`A force is **conservative** if the work it does on an object moving between two points does not depend on the path taken — equivalently, if it does no net work around any closed loop. Gravity and ideal springs are conservative; friction and air drag are not. Only a conservative force has a potential energy, and each determines the other:

$$\Delta U = -\int_{x_1}^{x_2} F_x\,dx, \qquad F_x = -\frac{dU}{dx}$$

So the force points **downhill** on the graph of $U(x)$, and it is strongest where the graph is steepest.`,
  symbols: [
    { tex: 'U(x)', text: 'the potential-energy function, in joules (J). Only differences matter, so you may add any constant' },
    { tex: 'F_x', text: 'the component along $x$ of the conservative force, in newtons (N): positive pushes toward $+x$' },
    { tex: '\\dfrac{dU}{dx}', text: 'the slope of the $U(x)$ graph, in J/m — which is the same as newtons' },
    { tex: '-', text: 'the minus sign: the force pushes the object toward lower potential energy, downhill on the graph' },
    { tex: '\\Delta U = -\\int F_x\\,dx', text: 'the change in $U$ from $x_1$ to $x_2$ is minus the work the force does on the way' },
  ],
  why: 'Potential-energy functions are how physics describes interactions from atoms to galaxies: give U, and the force follows by differentiation. Energy diagrams, orbits and the Lagrangian mechanics behind general relativity all start here.',
  visual: {
    type: 'graph',
    title: 'The force is the downhill slope',
    lead: t`The curve is a potential-energy function $U(x)$. Drag the gold point along it: the gold line is the tangent, whose slope is $dU/dx$, and the violet arrow is the force $F_x = -dU/dx$ on a particle at that position.`,
    tasks: [
      'Drag the point down a slope: the force arrow points downhill — toward lower U — and is longest where the curve is steepest.',
      'At the bottom of a valley or the top of a hill the tangent is flat and F = 0. These are the equilibrium points of the next lessons.',
      'Read the slope in J/m and the force in N: they are the same number with opposite signs.',
    ],
    params: {
      x: [-3, 3], y: [-7, 6], xlabel: 'x (m)', ylabel: 'U (J)', aspect: 'wide',
      curves: [{ fn: UX, color: 'accent', width: 2.6 }],
      tangent: { fn: UX, at: 1 },
      arrows: [{ from: ['x0', `x0^4/4 - 2*x0^2 + x0`], to: [`x0 - max(-1.6, min(1.6, 0.25*(x0^3 - 4*x0 + 1)))`, `x0^4/4 - 2*x0^2 + x0`], color: 'violet', label: 'F' }],
      readouts: [{ label: '$x$', expr: 'x0', unit: '\\mathrm{m}', digits: 3 }, { label: 'slope $dU/dx$', expr: 'slope', unit: '\\mathrm{J/m}', digits: 3 }, { label: 'force $F_x = -dU/dx$', expr: '-slope', unit: '\\mathrm{N}', digits: 3 }],
    },
    caption: t`$U(x) = x^4/4 - 2x^2 + x$, in joules with $x$ in metres — an invented landscape with two valleys. The arrow’s length is proportional to the force, capped on the steepest stretches.`,
  },
  example: {
    prompt: t`A particle moving along the $x$-axis has potential energy $U(x) = (3\ \text{J/m}^2)\,x^2 - (2\ \text{J/m}^3)\,x^3$. Find the force on it as a function of $x$, where that force is zero, and the force at $x = ${EX.x}$ m.`,
    visual: uGraph({
      U: '3*x^2 - 2*x^3', x: [-0.8, 1.8], y: [-2.2, 3.2],
      points: [{ x: EX.x, y: 3 * EX.x ** 2 - 2 * EX.x ** 3, color: 'gold', label: `x = ${EX.x} m`, labelDx: -70, labelDy: 14 }],
      arrows: [{ from: [EX.x, 0.5], to: [EX.x + 0.25, 0.5], color: 'violet', label: 'F', labelDx: -4, labelDy: -12 }],
      caption: t`$U(x) = 3x^2 - 2x^3$. At $x = ${EX.x}$ m the curve slopes down to the right, so the force (violet) points to $+x$.`,
    }),
    steps: [
      { label: 'Differentiate', text: t`$\dfrac{dU}{dx} = 6x - 6x^2$, so $F_x = -\dfrac{dU}{dx} = 6x^2 - 6x = 6x(x - 1)$, in N.` },
      { label: 'Where is the force zero?', text: t`$F_x = 0$ at $x = 0$ and $x = 1$ m — where the tangent to $U$ is flat: a valley at $x = 0$ ($U = 0$) and a hilltop at $x = 1$ m ($U = 1$ J).` },
      { label: 'The force at 1.5 m', text: t`$F_x = 6(${EX.x})(${EX.x} - 1) = ${fmt(EX.F, 3)}$ N. Positive: the force pushes the particle toward $+x$.` },
      { label: 'Sense check with the picture', text: t`At $x = ${EX.x}$ m the graph falls to the right, so downhill is $+x$ — the direction of the force. Near $x = 0$ the force points back toward the valley from both sides; near $x = 1$ it points away from the hilltop. That difference is stability, two lessons on.` },
    ],
    answer: t`$F_x = 6x^2 - 6x$ N; zero at $x = 0$ and $x = 1$ m; $F_x(${EX.x}\ \text{m}) = +${fmt(EX.F, 3)}$ N.`,
  },
  practice: [
    multi({
      id: 'which-conservative', difficulty: 1,
      prompt: 'Which of these forces are conservative? Select all that apply.',
      choices: ['Gravity', 'The force of an ideal spring', 'Kinetic friction', 'Air drag', 'The electric force between two fixed charges'],
      answer: [0, 1, 4],
      why: {
        2: 'Friction always opposes the motion, so it does negative work on every leg of a trip: the longer the path, the more work. No potential energy can describe that.',
        3: 'Drag also opposes the motion on every leg, and depends on speed too. Its work around a closed loop is never zero.',
      },
      hints: ['Ask: does the work between two points depend on the route?', 'Forces that always oppose the motion do negative work on every leg, so a longer route means more work.'],
      teach: 'A force is conservative if its work between two points is the same for every path — so it has a potential energy.',
      explain: 'Gravity, ideal springs and the electrostatic force all do path-independent work and have potential energies (mgy, ½kx², and kq₁q₂/r in Physics II). Friction and drag always oppose the motion, so their work grows with the length of the path.',
      visual: routes(3, 'Two routes from P to Q. Gravity does the same work along both; friction would do more along the longer, wavy route 2.'),
    }),
    num({
      id: 'two-routes', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 5, 8, 12]), h = r.pick([2, 3, 4]);
        const W = -m * G * h;
        return {
          prompt: t`A ${m} kg box is carried from P to Q along the wavy route 2, which rises and dips but ends ${h} m higher than it started. How much work does gravity do on the box over the whole trip?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: -W, feedback: t`The box ends up higher, so gravity (pointing down) did negative work: $W_g = -mgh$.` }],
          hints: ['Gravity is conservative: its work depends only on the start and the end.', t`$W_g = -\Delta U_g = -mg\,\Delta y$.`],
          teach: 'Gravity’s work depends only on the change in height, never on the route.',
          explain: t`$W_g = -mg\,\Delta y = -(${m})(9.8)(${h}) = ${s3(W)}$ J — the same as along the straight route 1. On the wavy route, the work done on the rises and the dips cancels except for the net ${h} m.`,
          visual: routes(h, 'The two routes from P to Q (horizontal and vertical scales equal).'),
        };
      },
    }),
    num({
      id: 'friction-loop', difficulty: 2,
      gen(r) {
        const m = r.pick([20, 30, 40]), mu = r.pick([0.2, 0.3, 0.4]), L = r.pick([4, 5, 6, 8]);
        const W = -2 * mu * m * G * L;
        return {
          prompt: t`A ${m} kg crate is pushed ${L} m east across a level floor and then ${L} m back west to where it started. The coefficient of kinetic friction is ${mu}. How much work does friction do on the crate over the round trip?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'Zero would be right for a conservative force. Friction opposes the motion on both legs, so its work is negative both ways and adds up.' }, { value: -mu * m * G * L, feedback: 'That is only one leg. Friction does the same negative work on the way back.' }],
          hints: ['On each leg, which way does friction point compared with the motion?', t`Each leg: $W = -\mu_k mg L$. Add the two legs.`],
          teach: 'Friction does negative work on every leg of a trip, so its work around a closed loop is not zero: it is not conservative.',
          explain: t`Each leg: $-\mu_k mgL = -(${mu})(${m})(9.8)(${L}) = ${s3(-mu * m * G * L)}$ J. Round trip: ${s3(W)} J. Gravity, by contrast, would do zero work over any closed loop.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, L + 1.5], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: 'east (m)', ylabel: '', yticks: 0.001,
              alt: 'Top view of a crate pushed east and then back west',
              arrows: [{ from: [0, 0.45], to: [L, 0.45], color: 'good', label: 'out' }, { from: [L, -0.45], to: [0, -0.45], color: 'warn', label: 'back', labelDx: -36 }],
              shade: [{ fn: '0.3', lower: '-0.3', from: -0.3, to: 0.3, color: 'accent', alpha: 0.7 }],
              points: [{ x: 0, y: 1.0, r: 0.01, color: 'ink2', label: 'start and end' }],
            },
            caption: 'Top view of the floor: out along the upper arrow, back along the lower one (drawn apart for clarity).',
          },
        };
      },
    }),
    expr({
      id: 'force-from-U', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4, 5]), b = r.pick([1, 2, 3, 6]);
        const xm = Math.sqrt(b / (3 * a)), ext = Math.max(Math.abs(a * 1.6 ** 3 - b * 1.6), xm < 1.6 ? (2 * b / 3) * xm : 0);
        return {
          prompt: t`A particle’s potential energy is $U(x) = ${a}x^3 - ${co(b)}x$ (in joules, with $x$ in metres). Find the force $F_x(x)$ on it.`,
          answer: `-${3 * a}x^2 + ${b}`, answerTeX: t`-${3 * a}x^2 + ${b}`,
          vars: { x: [-2, 2] }, lhs: 'F_x(x)',
          errors: [
            { answer: `${3 * a}x^2 - ${b}`, feedback: t`That is $+dU/dx$. The force is $-dU/dx$: it points downhill.` },
            { answer: `${a / 4}x^4 - ${b / 2}x^2`, feedback: 'That integrates U. The force is minus the derivative of U.' },
          ],
          hints: [t`$F_x = -\dfrac{dU}{dx}$.`, t`$\dfrac{d}{dx}(${a}x^3 - ${co(b)}x) = ${3 * a}x^2 - ${b}$; now change the sign.`],
          teach: 'The force is minus the slope of the potential-energy function: F = −dU/dx.',
          explain: t`$\dfrac{dU}{dx} = ${3 * a}x^2 - ${b}$, so $F_x = -${3 * a}x^2 + ${b}$ N.`,
          visual: uGraph({ U: `${a}*x^3 - ${b}*x`, x: [-1.6, 1.6], y: [-ext * 1.15, ext * 1.15], caption: t`$U(x) = ${a}x^3 - ${co(b)}x$. Where it slopes up, the force points to $-x$.` }),
        };
      },
    }),
    mcq({
      id: 'steepest', difficulty: 2,
      prompt: t`The graph shows a particle’s potential energy $U(x)$. At which marked point is the force on the particle largest **and** pointing toward $-x$?`,
      choices: ['S', 'P', 'Q', 'R'],
      answer: 0,
      why: {
        1: 'P is on a steep slope too, but there U falls toward +x, so the force points toward +x — and the slope at S is steeper still.',
        2: 'Q is near the top of a hill, where the curve is almost flat: the force there is almost zero. The size of U is not the size of the force.',
        3: 'R is near the bottom of a valley: almost flat, so almost no force. A low U does not mean a large force.',
      },
      hints: ['The force is minus the slope: look for the steepest place where U rises toward +x.'],
      teach: 'The force depends on the slope of U, not on its height: it is largest where the graph is steepest and points downhill.',
      explain: t`$F_x = -dU/dx$. At S the graph rises steeply to the right ($dU/dx \approx +8$ J/m), so $F_x \approx -8$ N: large and toward $-x$. At Q and R the tangent is nearly flat.`,
      visual: uGraph({
        U: UX, x: [-3, 3], y: [-7, 6], numbers: false,
        points: [-2.5, 0.25, 1.9, 2.6].map((x, i) => ({ x, y: +U0(x).toFixed(4), color: 'gold', label: 'PQRS'[i], labelDy: i === 1 ? -14 : 14 })),
        caption: 'A potential-energy curve with four marked points. Energy scale hidden.',
      }),
    }),
    num({
      id: 'force-at', difficulty: 2,
      gen(r) {
        let a, b, x0, F;
        do { a = r.pick([2, 3, 4]); b = r.pick([1, 2]); x0 = r.pick([0.5, 1.5, 2, 2.5]); F = -(2 * a * x0 - 3 * b * x0 * x0); } while (Math.abs(F) < 0.5);
        return {
          prompt: t`A particle’s potential energy is $U(x) = (${a}\ \text{J/m}^2)\,x^2 - (${b}\ \text{J/m}^3)\,x^3$. What is the force on it at $x = ${x0}$ m? (Positive means toward $+x$.)`,
          answer: F, units: 'N', tol: { rel: 0.01, abs: 0.01 },
          errors: [
            { value: -F, feedback: t`That is $dU/dx$. The force is $-dU/dx$.` },
            { value: a * x0 * x0 - b * x0 ** 3, feedback: 'That is the potential energy U at that point, not the force. Differentiate.' },
          ].filter((e) => Math.abs(e.value - F) > 0.02 * Math.abs(F) + 0.01),
          hints: [t`$F_x = -dU/dx = -(${2 * a}x - ${3 * b}x^2)$.`, t`Substitute $x = ${x0}$.`],
          teach: 'Find the force at a point by differentiating U and changing the sign.',
          explain: t`$\dfrac{dU}{dx} = ${2 * a}x - ${3 * b}x^2 = ${fmt(2 * a * x0 - 3 * b * x0 * x0, 3)}$ J/m at $x = ${x0}$ m, so $F_x = ${fmt(F, 3)}$ N${F > 0 ? ': it pushes toward +x, downhill' : F < 0 ? ': it pushes toward −x, downhill' : ''}.`,
          visual: uGraph({ U: `${a}*x^2 - ${b}*x^3`, x: [-0.6, 2.9], y: [Math.min(-1, a * 2.9 ** 2 - b * 2.9 ** 3) * 1.1, Math.max(4, (4 * a ** 3) / (27 * b * b)) * 1.4], points: [{ x: x0, y: +(a * x0 * x0 - b * x0 ** 3).toFixed(4), color: 'gold', label: `x = ${x0} m` }], caption: t`$U(x) = ${a}x^2 - ${co(b)}x^3$ with the point marked.` }),
        };
      },
    }),
    expr({
      id: 'U-from-F', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 4, 6, 8]), c = r.pick([1, 2, 4]);
        return {
          prompt: t`A stiffening spring pulls back with $F_x = -${k}x - ${co(c)}x^3$ (in newtons, $x$ in metres). Find its potential energy $U(x)$, taking $U(0) = 0$.`,
          answer: `${k / 2}x^2 + ${c / 4}x^4`, answerTeX: t`${k === 2 ? '' : k / 2}x^2 + ${c === 4 ? '' : frac(c / 4)}x^4`,
          vars: { x: [-2, 2] }, lhs: 'U(x)',
          errors: [
            { answer: `-${k / 2}x^2 - ${c / 4}x^4`, feedback: t`$U = -\int F\,dx$: the minus sign makes $U$ positive for a restoring force.` },
            { answer: `-${k} - ${3 * c}x^2`, feedback: 'That differentiates F. Integrate instead: U = −∫F dx.' },
          ],
          hints: [t`$U(x) = -\int_0^x F_x\,dx'$.`, t`$-\int_0^x(-${k}x' - ${co(c)}x'^3)\,dx' = \tfrac{${k}}{2}x^2 + \tfrac{${c}}{4}x^4$.`],
          teach: 'U is minus the integral of the force: U(x) = −∫₀ˣ F dx.',
          explain: t`$U(x) = -\int_0^x\left(-${k}x' - ${co(c)}x'^3\right)dx' = ${k === 2 ? '' : k / 2}x^2 + ${c === 4 ? '' : frac(c / 4)}x^4$ J. Check: $-dU/dx = -${k}x - ${co(c)}x^3 = F_x$. ✓`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-(k * 1.6 + c * 4.1) * 1.05, (k * 1.6 + c * 4.1) * 1.05], xlabel: 'x (m)', ylabel: 'F (N)', aspect: 'wide', curves: [{ fn: `-${k}*x - ${c}*x^3`, color: 'violet', width: 2.6 }] }, caption: t`The force $F_x = -${k}x - ${co(c)}x^3$: it always points back toward $x = 0$, and grows faster than a linear spring’s.` },
        };
      },
    }),
    mcq({
      id: 'sign-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “$U(x) = (5\ \text{J/m}^2)\,x^2$ has slope $10x$, so at $x = 2$ m the force on the particle is $+20$ N — it pushes the particle further out.” What is wrong?`,
      choices: [
        t`The force is $-dU/dx = -20$ N: it pushes the particle back toward $x = 0$`,
        t`The slope of $5x^2$ is $5x$, so the force is $+10$ N`,
        t`The force is $U/x = 10$ N`,
        t`Nothing: the force is $+20$ N`,
      ],
      answer: 0,
      why: {
        1: t`$\dfrac{d}{dx}(5x^2) = 10x$ is right; the error is the missing minus sign.`,
        2: 'Force is the slope of U (with a minus sign), not U divided by x.',
        3: 'A force pushing the particle further out would raise U without limit — the opposite of what a valley-shaped U does.',
      },
      hints: [t`Which way is downhill on the graph at $x = 2$ m?`, t`$F_x = -dU/dx$.`],
      teach: 'Forget the minus sign in F = −dU/dx and every force points uphill — the wrong way.',
      explain: t`$F_x = -dU/dx = -10x = -20$ N at $x = 2$ m: toward $x = 0$, downhill. This $U$ is a spring with $k = 10$ N/m, and a spring pulls back.`,
      visual: uGraph({ U: '5*x^2', x: [-3, 3], y: [-3, 45], points: [{ x: 2, y: 20, color: 'gold', label: 'x = 2 m', labelDx: -64 }], curves: [{ fn: '20*(x - 2) + 20', domain: [1, 3], color: 'gold', width: 1.6, dash: true }], caption: t`$U = 5x^2$ with the tangent at $x = 2$ m (dashed).` }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-gravity', difficulty: 3, transfer: true,
      prompt: t`Far from Earth, the gravitational potential energy of a spacecraft of mass $m$ at distance $r$ from Earth’s centre is $U(r) = -\dfrac{GMm}{r}$, where $G$ is the gravitational constant and $M$ is Earth’s mass. Find the radial force $F_r(r)$ on the spacecraft (positive means away from Earth).`,
      answer: '-G*M*m/r^2', answerTeX: t`-\frac{GMm}{r^2}`,
      vars: { G: [1, 2], M: [1, 2], m: [1, 2], r: [1, 3] }, lhs: 'F_r(r)',
      errors: [{ answer: 'G*M*m/r^2', feedback: t`$\dfrac{d}{dr}\left(-\dfrac{GMm}{r}\right) = +\dfrac{GMm}{r^2}$, and the force is minus that: negative, pointing toward Earth.` }, { answer: '-G*M*m/r', feedback: 'That is U itself. Differentiate with respect to r.' }],
      hints: [t`$F_r = -\dfrac{dU}{dr}$.`, t`$\dfrac{d}{dr}\left(\dfrac{1}{r}\right) = -\dfrac{1}{r^2}$.`],
      teach: 'F = −dU/dr turns the potential −GMm/r into the inverse-square pull of gravity.',
      explain: t`$\dfrac{dU}{dr} = +\dfrac{GMm}{r^2}$, so $F_r = -\dfrac{GMm}{r^2}$: an attraction toward Earth that falls as $1/r^2$ — Newton’s law of gravitation, recovered from the potential energy.`,
      visual: uGraph({ U: '-1/x', x: [0.15, 6], y: [-4.5, 0.8], xlabel: 'r (Earth radii)', ylabel: 'U (scaled)', numbers: false, caption: t`$U(r) = -GMm/r$, in arbitrary units: it rises toward zero far away, so downhill — the direction of the force — is toward Earth.` }),
    }),
    num({
      id: 'cp-segments', difficulty: 2,
      gen(r) {
        const rise = r.pick([6, 9, 12, 15]), run = r.pick([2, 3]);
        const F = -rise / run;
        return {
          prompt: t`The graph shows a particle’s potential energy. Between $x = 2$ m and $x = ${2 + run}$ m it rises steadily by ${rise} J. What is the force on the particle in that region?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: -F, feedback: 'The force points downhill, toward lower U: here that is −x, so it is negative.' }, { value: rise, feedback: 'That is the change in U. The force is minus the change in U per metre.' }],
          hints: [t`On a straight segment, $dU/dx$ is the rise over the run.`],
          teach: 'On a straight stretch of the U graph, the force is constant: minus the rise over the run.',
          explain: t`$\dfrac{dU}{dx} = \dfrac{${rise}\ \text{J}}{${run}\ \text{m}} = ${fmt(rise / run, 3)}$ N, so $F_x = ${fmt(F, 3)}$ N: a constant push toward $-x$.`,
          visual: uGraph({ U: `min(max(${rise / run}*(x - 2), 0), ${rise})`, x: [0, 2 + run + 2], y: [-1, rise * 1.3], caption: 'A potential-energy graph made of straight segments.' }),
        };
      },
    }),
    mcq({
      id: 'cp-comet', difficulty: 2, transfer: true,
      prompt: 'A comet completes one full orbit of the Sun and returns to the same point. How much work has the Sun’s gravity done on it over the whole orbit?',
      choices: ['Zero', 'Positive: gravity pulled on it the whole time', 'Negative, because the comet slowed down on the way out', 'It depends on how elongated the orbit is'],
      answer: 0,
      why: {
        1: 'Gravity did positive work on the way in and negative work on the way out; over a closed loop, a conservative force’s work adds to zero.',
        2: 'It did slow on the way out — but it sped up by exactly as much on the way in.',
        3: 'The shape changes how the work is shared between the two halves, not the total around the loop.',
      },
      hints: ['Gravity is conservative. What is its work around any closed path?'],
      teach: 'A conservative force does zero net work around any closed path.',
      explain: t`$W = -\Delta U$, and after a full orbit the comet is back where it started, so $\Delta U = 0$ and $W = 0$. Its speed at that point is the same as last time round.`,
      visual: { type: 'graph', params: { x: [-2.4, 7.5], y: [-2.6, 2.6], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '', curves: [{ param: ['3 + 3.8*cos(t)', '2.33*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6, dash: true }], points: [{ x: 0, y: 0, r: 10, color: 'gold', label: 'Sun', labelDy: 18 }, { x: 5.362, y: 1.825, r: 5, color: 'accent', label: 'comet', labelDx: 8 }] }, caption: 'The comet’s elliptical orbit (not to scale). It returns to the same point once per orbit.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §8.2 Conservative and non-conservative forces', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-2-conservative-and-non-conservative-forces' },
  ],
});
