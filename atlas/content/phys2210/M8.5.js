// Energy diagrams and equilibrium: plot U(x) and the total energy E. The
// particle can be only where U ≤ E; it turns round where U = E; it can rest
// where dU/dx = 0 — stably in a valley, unstably on a hilltop.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { s3 } from './_energy.js';
import * as ME from '../../src/viz/model/mech-energy.js';

const t = String.raw;

// the Explore landscape: a lopsided double well (J, with x in m)
const WELL = '0.25*x^4 - 0.2*x^3 - 1.5*x^2 + 3';
const W = (x) => 0.25 * x ** 4 - 0.2 * x ** 3 - 1.5 * x * x + 3;
const WEQ = ME.equilibria(W, [-3, 3.2]);             // stable −1.46 m (1.56 J), unstable 0 (3 J), stable 2.06 m (−0.61 J)

// the worked example: U = (x² − 4)² J, m = 0.50 kg, E = 9.0 J
const EX = { m: 0.5, E: 9 };
EX.tp = [1, Math.sqrt(7)];
EX.vmax = Math.sqrt((2 * EX.E) / EX.m);              // 6 m/s at x = 2 m

// the stability question’s landscape and its equilibria, found numerically
const HILLS = '3 - 2*exp(-(x - 2)^2) + 1.5*exp(-((x - 4.5)/0.8)^2) - 1.5*exp(-((x - 8)/0.9)^2)';
const H = (x) => 3 - 2 * Math.exp(-((x - 2) ** 2)) + 1.5 * Math.exp(-(((x - 4.5) / 0.8) ** 2)) - 1.5 * Math.exp(-(((x - 8) / 0.9) ** 2));
const HEQ = ME.equilibria(H, [0, 10]);              // stable ≈ 2.0, unstable ≈ 4.5, stable ≈ 8.0

// a static energy diagram: the curve, energy levels and labelled points
const diagram = ({ U, x, y, levels = [], marks = [], caption, unit = 'J', lunit = 'm', xlabel, ylabel, xticks, yticks }) => ({
  type: 'mech-energy',
  params: { U, x, y, particle: false, equilibria: false, levels, marks, unit, lunit, xlabel: xlabel ?? `x (${lunit})`, ylabel: ylabel ?? `U (${unit})`, ...(xticks ? { xticks } : {}), ...(yticks ? { yticks } : {}) },
  caption,
});

export default lesson({
  id: 'phys2210.M8.5',
  title: 'Energy diagrams and equilibrium',
  minutes: 12, difficulty: 3,
  intro: t`Plot the potential energy $U(x)$ and draw a horizontal line at the total energy $E$. Kinetic energy can never be negative, so the particle can be only where the curve lies **below** the line:

$$K(x) = E - U(x) \ge 0$$

Where $U = E$ the particle stops and turns back: a **turning point**. Where the curve is flat, $dU/dx = 0$, the force vanishes: an **equilibrium** — **stable** at the bottom of a valley, where a nudge brings the particle back, **unstable** on a hilltop, where a nudge sends it away, and neutral on a level stretch.`,
  symbols: [
    { tex: 'E', text: 'the total mechanical energy, in J: a horizontal line on the diagram, constant when no friction acts' },
    { tex: 'U(x)', text: 'the potential energy at position $x$, in J' },
    { tex: 'K(x) = E - U(x)', text: 'the kinetic energy at $x$: the gap between the energy line and the curve. Where $U > E$ it would be negative, so the particle cannot be there' },
    { tex: 'U(x) = E', text: 'a turning point: $K = 0$, the particle stops for an instant and reverses' },
    { tex: '\\dfrac{dU}{dx} = 0', text: 'an equilibrium: the force $F = -dU/dx$ is zero. Stable if $\\dfrac{d^2U}{dx^2} > 0$ (a valley), unstable if $\\dfrac{d^2U}{dx^2} < 0$ (a hilltop)' },
  ],
  why: 'Energy diagrams answer the big questions at a glance — trapped or free, where it turns, stable or not. With an effective potential, the same picture decides whether an orbit around a planet or a black hole is closed, open or plunging.',
  visual: {
    type: 'mech-energy',
    title: 'Drag the energy line',
    lead: t`A particle moves in a lopsided double well. Drag the gold energy line up and down (or use the slider), and drag the particle to a starting point. The green band shows where it may be; the gold rings mark its turning points; the violet arrow is the force. Press **Play** to watch it move.`,
    tasks: [
      'Lower E until the particle is trapped in the right-hand valley: it shuttles between two turning points, fastest where the curve is lowest.',
      'Set E between 1.6 J and 3 J: both valleys are allowed, but the particle stays in whichever one it starts in — the hilltop between them is forbidden. Drag it across to see.',
      'Raise E above the hilltop (3 J) and press Play: now it roams over both valleys, slowing as it crosses the top.',
    ],
    params: {
      U: WELL, x: [-3, 3.2], y: [-1.5, 7], x0: WEQ[2].x, m: 1,
      sliders: [{ key: 'E', label: 'Total energy $E$', min: -1, max: 6.5, step: 0.05, value: 2.2, unit: '\\mathrm{J}', explain: 'The height of the gold line. Kinetic energy is the gap down to the curve.' }],
      readouts: ['E', 'U', 'K', 'F', 'turning'],
    },
    caption: t`$U(x) = 0.25x^4 - 0.2x^3 - 1.5x^2 + 3$ (in J, with $x$ in m) for a 1.0 kg particle, with no friction, integrated numerically. Turning points and equilibria are found numerically. The bars share the diagram’s energy scale.`,
  },
  example: {
    prompt: t`A ${EX.m} kg particle has potential energy $U(x) = (1\ \text{J/m}^4)\,(x^2 - 4\ \text{m}^2)^2$. (a) Find its equilibrium positions and say whether each is stable. (b) With total energy $E = ${EX.E}$ J, released at rest at $x = 1$ m, where does it turn round? (c) What is its greatest speed? (d) What is the least energy it needs to reach the valley at negative $x$?`,
    visual: { type: 'mech-energy', params: { U: '(x^2 - 4)^2', x: [-3, 3], y: [-2, 20], E: EX.E, x0: 1, m: EX.m, play: false, readouts: [] }, caption: t`$U = (x^2 - 4)^2$ with the energy line at 9.0 J. Both valleys are allowed (green), but the particle, starting at $x = 1$ m, stays in the right-hand one, between its two turning points.` },
    steps: [
      { label: '(a) Equilibria', text: t`$dU/dx = 2(x^2 - 4)(2x) = 4x(x^2 - 4) = 0$ at $x = 0$ and $x = \pm 2$ m. Second derivative: $d^2U/dx^2 = 12x^2 - 16$: at $x = \pm 2$ m it is $+32$ J/m², valleys, **stable**; at $x = 0$ it is $-16$ J/m², a hilltop, **unstable**.` },
      { label: '(b) Turning points', text: t`$U = E$: $(x^2 - 4)^2 = 9$, so $x^2 - 4 = \pm 3$ and $x^2 = 1$ or $7$. Starting at $x = 1$ m it stays in the right-hand valley, between $x = 1$ m and $x = \sqrt7 = ${fmt(EX.tp[1], 3)}$ m.` },
      { label: '(c) Greatest speed', text: t`$K = E - U$ is largest where $U$ is smallest: at $x = 2$ m, $U = 0$, so $K = 9.0$ J and $v = \sqrt{2K/m} = \sqrt{2(9.0)/${EX.m}} = ${fmt(EX.vmax, 3)}$ m/s.` },
      { label: '(d) Over the hill', text: t`To cross $x = 0$ it needs $E > U(0) = 16$ J. With 9.0 J the hilltop is a forbidden region: the valley at negative $x$ is allowed but unreachable.` },
    ],
    answer: t`(a) Stable at $x = \pm 2$ m, unstable at $x = 0$; (b) between $x = 1$ m and $x = ${fmt(EX.tp[1], 3)}$ m; (c) ${fmt(EX.vmax, 3)} m/s at $x = 2$ m; (d) more than 16 J.`,
  },
  practice: [
    mcq({
      id: 'forbidden', difficulty: 1,
      prompt: t`The diagram shows a particle’s potential energy and its total energy $E$. Can the particle ever be at point P?`,
      choices: [t`No: at P, $U > E$, so its kinetic energy would have to be negative`, 'Yes, if it is moving fast enough when it gets there', 'Yes, for an instant, as a turning point', 'Only if its potential energy at P is negative'],
      answer: 0,
      why: {
        1: 'Its speed is fixed by E − U at every point. With no friction, E cannot change, so no speed is “fast enough”.',
        2: 'Turning points are where U = E exactly — on the line, not above it. P lies above the line.',
        3: 'The sign of U does not matter; only whether U is above or below E.',
      },
      hints: [t`At P, compare $U$ with $E$. What would $K = E - U$ be?`],
      teach: 'A particle can be only where U ≤ E: elsewhere its kinetic energy would be negative.',
      explain: t`At P the curve is above the energy line, so $K = E - U < 0$ — impossible. P is in a **forbidden region**.`,
      visual: diagram({ U: HILLS, x: [0, 10], y: [0, 5.5], levels: [{ E: 3.2, label: 'E', color: 'gold' }], marks: [{ x: 4.5, label: 'P', color: 'bad' }], caption: 'A potential-energy curve with the energy line E (gold, dashed).' }),
    }),
    num({
      id: 'amplitude', difficulty: 1,
      gen(r) {
        const k = r.pick([50, 80, 200, 400]), E = r.pick([1, 2, 4, 9]);
        const A = Math.sqrt((2 * E) / k);
        return {
          prompt: t`A block on a spring ($U = \tfrac12 kx^2$, $k = ${k}$ N/m, no friction) has total energy ${E} J. Where are its turning points? Give the positive one.`,
          answer: A, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (2 * E) / k, feedback: t`That is $x^2$: take the square root.` }, { value: Math.sqrt(E / k), feedback: t`$\tfrac12 kx^2 = E$ gives $x = \sqrt{2E/k}$: the 2 is missing.` }],
          hints: [t`At a turning point $K = 0$, so $\tfrac12 kx^2 = E$.`],
          teach: 'The turning points are where the energy line meets the curve: for a spring, x = ±√(2E/k), the amplitude.',
          explain: t`$x = \pm\sqrt{2E/k} = \pm\sqrt{2(${E})/${k}} = \pm${s3(A)}$ m: the amplitude of the oscillation.`,
          visual: diagram({ U: `${k / 2}*x^2`, x: [-A * 1.8, A * 1.8], y: [-E * 0.12, E * 1.6], levels: [{ E, label: `E = ${E} J`, color: 'gold' }], xticks: 0.001, caption: t`The spring’s potential energy $U = \tfrac12 kx^2$ and the energy line. The position scale is hidden: compute, don’t read off.` }),
        };
      },
    }),
    multi({
      id: 'which-stable', difficulty: 2,
      prompt: 'At which of the marked points could the particle rest in **stable** equilibrium? Select all that apply.',
      choices: ['A', 'B', 'C', 'D', 'E'],
      answer: [0, 3],
      why: {
        1: 'B is on a slope: the curve is not flat, so there is a force there. Not an equilibrium at all.',
        2: 'C is an equilibrium — the curve is flat — but on a hilltop: a nudge either way and the force pushes it further away. Unstable.',
        4: 'E is on a slope too: the force pushes it downhill toward D.',
      },
      hints: ['Equilibrium needs a flat curve (zero force). Stability needs a valley, not a hilltop.'],
      teach: 'Stable equilibria sit at the bottoms of valleys of U(x); hilltops are unstable; slopes are not equilibria at all.',
      explain: 'A and D are valley bottoms: displaced either way, the force (downhill) pushes the particle back. C is a hilltop (unstable). B and E are on slopes, where the force is not zero.',
      visual: diagram({ U: HILLS, x: [0, 10], y: [0, 5.5], marks: [HEQ[0].x, 3.3, HEQ[1].x, HEQ[2].x, 9.6].map((x, i) => ({ x: +x.toFixed(4), label: 'ABCDE'[i], dy: i === 2 ? -14 : 16 })), caption: 'A potential-energy curve with five marked points.' }),
    }),
    num({
      id: 'max-speed', difficulty: 2,
      gen(r) {
        const m = r.pick([0.2, 0.5, 2]), E = r.pick([3, 4, 5]), Umin = r.pick([-1, 0, 1]);
        const v = Math.sqrt((2 * (E - Umin)) / m);
        return {
          prompt: t`A ${m} kg particle with total energy ${E} J moves in the potential shown, whose lowest point is at $U = ${Umin}$ J. What is its greatest speed?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [...(Umin !== 0 ? [{ value: Math.sqrt((2 * E) / m), feedback: 'K = E − U, and at the bottom of the well U is not zero here.' }] : []), { value: Math.sqrt((E - Umin) / m), feedback: t`$K = \tfrac12 mv^2$: $v = \sqrt{2K/m}$.` }],
          hints: ['The speed is greatest where U is least.', t`$K_\text{max} = E - U_\text{min}$, then $v = \sqrt{2K_\text{max}/m}$.`],
          teach: t`The particle moves fastest at the bottom of the well, where $K = E - U_\text{min}$.`,
          explain: t`$K_\text{max} = ${E} - (${Umin}) = ${E - Umin}$ J, so $v = \sqrt{2(${E - Umin})/${m}} = ${s3(v)}$ m/s.`,
          visual: diagram({ U: `${Umin} + 0.6*(x - 2)^2`, x: [-1, 5], y: [Math.min(-1.5, Umin - 1), E + 2], levels: [{ E, label: `E = ${E} J`, color: 'gold' }], marks: [{ x: 2, label: 'lowest point', dy: 16 }], caption: 'The potential well and the energy line.' }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-turning', difficulty: 2,
      prompt: t`A particle has $U(x) = 2(x - 1)^2$ (in J, $x$ in m) and total energy $E = 8$ J. Drag the point to its **right-hand turning point**.`,
      instruction: 'Drag the point to where the particle turns round on the right, then check.',
      answer: { x: 3, y: 8 }, tol: { x: 0.15, y: 0.5 },
      visual: {
        type: 'graph',
        params: {
          x: [-2.5, 4.5], y: [-1, 12], aspect: 'wide', xlabel: 'x (m)', ylabel: 'energy (J)',
          curves: [{ fn: '2*(x - 1)^2', color: 'accent', width: 2.6 }],
          hlines: [{ y: 8, label: 'E = 8 J', color: 'gold' }],
          drag: [{ key: 'p', x: 0, y: 4, snap: 0.05 }],
        },
        caption: t`$U(x) = 2(x - 1)^2$ and the energy line $E = 8$ J.`,
      },
      hints: ['A turning point is where the energy line meets the curve: K = 0 there.', t`Solve $2(x - 1)^2 = 8$: $x - 1 = \pm 2$.`],
      teach: 'Turning points sit where the energy line crosses the potential-energy curve.',
      explain: t`$2(x - 1)^2 = 8$ gives $x = 1 \pm 2$: turning points at $x = -1$ m and $x = 3$ m, both on the line $E = 8$ J. The right-hand one is $(3\ \text{m}, 8\ \text{J})$.`,
    },
    {
      type: 'slider', id: 'escape-energy', difficulty: 3, param: 'E',
      prompt: t`The particle starts in the left-hand valley. Set the total energy to the **smallest** value that lets it get over into the right-hand valley.`,
      instruction: 'Set E with the slider (or drag the gold line); press Play to test it, then check.',
      answer: [3.0, 3.25],
      visual: {
        type: 'mech-energy',
        params: {
          U: WELL, x: [-3, 3.2], y: [-1.5, 7], x0: +WEQ[0].x.toFixed(3), m: 1, labels: false, equilibria: false, readouts: ['E'],
          sliders: [{ key: 'E', label: 'Total energy $E$', min: 1.6, max: 6, step: 0.05, value: 2, unit: '\\mathrm{J}', explain: 'The height of the gold line.' }],
        },
        caption: 'The particle in the left-hand valley of the double well, with no friction.',
      },
      hints: ['To get across, the particle must pass over the top of the hill between the valleys.', 'E must be at least as large as U at the hilltop — read it off the curve.'],
      teach: 'To leave a valley, the energy must exceed the top of the barrier around it.',
      explain: t`The hill between the valleys peaks at $U = 3$ J (at $x = 0$). Any $E$ just above 3 J lets the particle over; at exactly 3 J it would creep up to the top and balance there, in unstable equilibrium.`,
    },
    num({
      id: 'small-oscillations', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), b = r.pick([1, 1.5, 2]), m = r.pick([0.5, 1, 2]);
        const k = 8 * a * b * b, T = 2 * Math.PI * Math.sqrt(m / k);
        return {
          prompt: t`A ${m} kg particle sits near the bottom of a valley of $U(x) = (${a}\ \text{J/m}^4)\,(x^2 - ${b * b}\ \text{m}^2)^2$, at $x = ${b}$ m. Near a minimum, $U \approx U_\text{min} + \tfrac12 k_\text{eff}(x - x_0)^2$ with $k_\text{eff} = d^2U/dx^2$ there, so small oscillations are simple harmonic. What is their period?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * Math.sqrt(m / (4 * a * b * b)), feedback: t`$\dfrac{d^2U}{dx^2} = ${a}(12x^2 - ${4 * b * b})$, which at $x = ${b}$ is $8ab^2$, not $4ab^2$.` }, { value: Math.sqrt(m / k), feedback: t`That is $1/\omega$. The period is $T = 2\pi\sqrt{m/k}$.` }],
          hints: [t`$\dfrac{dU}{dx} = 4${a === 1 ? '' : `(${a})`}x(x^2 - ${b * b})$; differentiate again and evaluate at $x = ${b}$ m.`, t`$k_\text{eff} = 8ab^2 = ${k}$ J/m², then $T = 2\pi\sqrt{m/k_\text{eff}}$.`],
          teach: 'Near any stable equilibrium, U looks like a parabola, so small oscillations are SHM with k = d²U/dx².',
          explain: t`$\dfrac{d^2U}{dx^2} = ${a}(12x^2 - ${4 * b * b})$, so $k_\text{eff} = ${a}(12 \cdot ${b * b} - ${4 * b * b}) = ${k}$ J/m² at $x = ${b}$ m. $T = 2\pi\sqrt{${m}/${k}} = ${s3(T)}$ s. Larger swings feel the curve’s departure from a parabola, and the period changes.`,
          visual: {
            type: 'graph',
            params: {
              x: [-b * 1.6, b * 1.6], y: [-0.15 * a * b ** 4, a * b ** 4 * 1.4], aspect: 'wide', xlabel: 'x (m)', ylabel: 'U (J)',
              curves: [{ fn: `${a}*(x^2 - ${b * b})^2`, color: 'accent', width: 2.6 }, { fn: `${k / 2}*(x - ${b})^2`, domain: [b * 0.45, b * 1.55], color: 'gold', width: 1.6, dash: true }],
              points: [{ x: b, y: 0, color: 'gold', label: `x = ${b} m`, labelDy: 14 }],
            },
            caption: 'The double well (blue) and the parabola that matches it at the bottom of the right-hand valley (gold, dashed).',
          },
        };
      },
    }),
    mcq({
      id: 'beyond-barrier', difficulty: 2, kind: 'error',
      prompt: t`A particle with $E = 2$ J starts at $x = 0$ in the potential shown. A student says: “At $x = 5$ m the potential energy is only 1 J, less than $E$, so the particle can get there.” What is wrong?`,
      choices: [
        'To reach x = 5 m it must pass the hill near x = 2.5 m, where U > E: that forbidden region stops it',
        'Nothing: any point where U < E can be reached',
        'U = 1 J at x = 5 m is too low: the particle would need negative kinetic energy there',
        'It can get there, but only if it starts moving to the left',
      ],
      answer: 0,
      why: {
        1: 'A point is reachable only if the whole path to it is allowed. The hilltop in between is above the energy line.',
        2: 'Low U means large K, not negative K: K = E − U = 1 J there. The problem is getting there.',
        3: 'Going left only meets the wall on the left; there is no route around the hill in one dimension.',
      },
      hints: ['Trace the path from x = 0 to x = 5 m. Is U ≤ E all the way?'],
      teach: 'Classically, a particle stays in the allowed region where it starts; a barrier above the energy line cannot be crossed.',
      explain: t`The hill between $x \approx 1.9$ and $3.1$ m rises above $E = 2$ J, so the particle turns round at its foot. (In quantum mechanics a particle can sometimes *tunnel* through such a barrier — but that only matters on atomic scales, and is a story for later.)`,
      visual: diagram({ U: '1 + 3*exp(-((x - 2.5)/0.6)^2) + 0.8*exp(-(x + 0.6))', x: [-1.2, 7], y: [0, 5], levels: [{ E: 2, label: 'E = 2 J', color: 'gold' }], marks: [{ x: 0, label: 'start' }, { x: 5, label: 'x = 5 m' }], caption: 'The potential energy along x, with the energy line E = 2 J.' }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      prompt: t`For a spacecraft moving around a planet, the distance $r$ behaves like a particle in an **effective potential** $U_\text{eff}(r)$ (sketched): gravity’s $-GMm/r$ plus a term from the sideways motion that rises steeply at small $r$. Which energy level describes a spacecraft that will escape to infinity?`,
      choices: [t`$E_3$`, t`$E_1$`, t`$E_2$`, 'None of them: gravity always pulls it back eventually'],
      answer: 0,
      why: {
        1: t`At $E_1$ the line crosses the curve twice: the distance swings between two turning points. That is a bound, elliptical orbit.`,
        2: t`$E_2$ touches the bottom of the well: $r$ cannot change at all. That is a circular orbit — the stable equilibrium of the diagram.`,
        3: t`Far away $U_\text{eff} \to 0$. With $E_3 > 0$ the line never meets the curve on the right, so there is no outer turning point: $r$ grows without limit.`,
      },
      hints: ['Look for an energy level with no turning point at large r.', t`Far away, $U_\text{eff}$ creeps up toward zero. Which line stays above the curve all the way out?`],
      teach: 'An orbit escapes when the energy line never meets the effective-potential curve at large r: E ≥ 0.',
      explain: t`$E_3$ is above zero, the value $U_\text{eff}$ approaches far away, so the spacecraft has kinetic energy left at any distance and never turns back. Negative energies give bound orbits ($E_1$: an ellipse between two turning points; $E_2$: a circle at the bottom of the well).`,
      visual: diagram({ U: '-2/x + 1/x^2', x: [0.3, 8], y: [-1.4, 1.1], levels: [{ E: 0.45, label: 'E₃', color: 'good' }, { E: -0.55, label: 'E₁', color: 'gold' }, { E: -1, label: 'E₂', color: 'violet' }], xlabel: 'distance r', ylabel: 'energy', caption: t`A sketch of $U_\text{eff}(r) = -\dfrac{GMm}{r} + \dfrac{L^2}{2mr^2}$ in scaled units, with three energy levels. You will meet the second term, from angular momentum $L$, in the gravitation module.` }),
    }),
    num({
      id: 'cp-molecule', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([3.5, 4.0, 4.5]), E = r.pick([-2.5, -2.0, -1.5]);
        return {
          prompt: t`Treat a diatomic molecule classically: the separation $r$ of its two atoms moves in the potential shown, which has a well $${D}$ eV deep and rises to $U = 0$ when the atoms are far apart. The molecule vibrates with total energy $E = ${E}$ eV. What is the least energy you must add to break it apart?`,
          answer: -E, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: D, feedback: `That would be for a molecule at rest at the bottom of the well. This one is already vibrating, with E = ${E} eV.` }, { value: D + E, feedback: 'That is how far the energy line is above the bottom of the well — its kinetic energy at the bottom, not the energy needed to escape.' }].filter((x) => Math.abs(x.value + E) > 0.02),
          hints: ['Far apart, U → 0. The atoms separate once the energy line is above zero everywhere on the right.', 'The energy needed is the gap from E up to zero.'],
          teach: 'A bound system has negative total energy; breaking it apart takes enough energy to raise E to zero.',
          explain: t`The well flattens out at $U = 0$, so the atoms escape once $E \ge 0$. From $E = ${E}$ eV that takes $${-E}$ eV. (A real molecule is quantum: it can never sit still at the bottom of the well, and its vibrational energies come in steps.)`,
          visual: diagram({ U: `${D}*(1 - exp(-20*(x - 0.12)))^2 - ${D}`, x: [0.07, 0.45], y: [-D - 0.6, 2.2], levels: [{ E, label: `E = ${E} eV`, color: 'gold' }], unit: 'eV', lunit: 'nm', xlabel: 'separation r (nm)', caption: 'A model molecular potential (a Morse curve) with its well bottom at 0.12 nm; illustrative values, not a particular molecule.' }),
        };
      },
    }),
    mcq({
      id: 'cp-l2', difficulty: 2, transfer: true,
      prompt: 'Along the line from the Sun through Earth, the James Webb Space Telescope’s home near the Sun–Earth L2 point sits at the top of a hill of effective potential energy (in the frame that rotates with Earth). What does that mean for the telescope?',
      choices: ['L2 is an unstable equilibrium, so the telescope must fire its thrusters every few weeks to stay near it', 'L2 is a stable equilibrium, so the telescope stays there for ever without fuel', 'There is no force on the telescope at L2, so it can never drift away', 'The telescope must thrust continuously to hover at L2'],
      answer: 0,
      why: {
        1: 'A hilltop is unstable: any small push grows. Stable would need a valley.',
        2: 'Zero force means it can stay at the exact top — but every small disturbance grows, so it drifts off unless corrected.',
        3: 'At an equilibrium no continuous thrust is needed; only small, occasional corrections to fight the instability.',
      },
      hints: ['Is the top of a hill a stable or an unstable equilibrium?'],
      teach: 'At an unstable equilibrium small disturbances grow, so a spacecraft parked there needs occasional station-keeping burns.',
      explain: 'At the hilltop the net force is zero, so no steady thrust is needed — but the equilibrium is unstable, so small errors grow. JWST (on a looping halo orbit around L2) uses small station-keeping burns every few weeks to stay on it.',
      visual: diagram({ U: '2.5*exp(-(x/1.3)^2)', x: [-3, 3], y: [-0.4, 3.4], marks: [{ x: 0, label: 'L2' }], xlabel: 'position along the Sun–Earth line', ylabel: 'effective U', xticks: 0.001, yticks: 0.001, caption: 'Schematic only: along the Sun–Earth line, the effective potential energy (in the frame rotating with Earth) has a maximum at L2. The shape, not the numbers, is the point.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §8.4 Potential energy diagrams and stability', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-4-potential-energy-diagrams-and-stability' },
  ],
});
