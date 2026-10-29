// Net change — integrate a rate and you get the change in the quantity: the
// area under an accelerometer trace is a change in velocity, the area under
// v–t a displacement. Distance needs |v|.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { curveFig } from './_c1kit.js';
import { areaFig, thou } from './_c1int.js';

const t = String.raw;
const G = 9.81;

export default lesson({
  id: 'math1210.C1-5.6',
  title: 'Net change and displacement from velocity',
  minutes: 10, difficulty: 2,
  intro: t`The Fundamental Theorem, read as a statement about measurements: integrate the rate of change of any quantity and you get its **net change**,

$$\int_a^b F'(t)\,dt = F(b) - F(a)$$

The area under an accelerometer trace is the change in velocity; the area under a velocity graph is the **displacement** — where you ended up relative to where you started. Areas below the axis subtract, so going out and coming back cancels. The **distance** travelled — what an odometer counts — is $\int_a^b |v(t)|\,dt$: every bit of motion counted as positive.`,
  symbols: [
    { tex: "F'(t)", text: 'a rate of change: a velocity, an acceleration, a flow rate' },
    { tex: 'F(b) - F(a)', text: 'the net change of the quantity between $t = a$ and $t = b$' },
    { tex: '\\int_a^b v\\,dt', text: 'displacement: change in position, with sign' },
    { tex: '\\int_a^b |v|\\,dt', text: 'distance travelled: never negative, never smaller than the size of the displacement' },
  ],
  why: t`Inertial navigation — in phones, aircraft, rockets and spacecraft — is exactly this: integrate the accelerometers once for velocity and again for position, and fight the errors that integration piles up.`,
  visual: {
    type: 'mech-graphlink',
    title: 'An elevator ride, from its accelerometer',
    lead: t`A lift accelerates upward at $a_0$ for $2$ s, cruises for a time $T_c$, then brakes at $-a_0$ for $2$ s. The bottom graph is what an accelerometer would record. Turn on **Areas up to the cursor** and press Play.`,
    tasks: [
      'The area under a–t up to the cursor equals the velocity on the graph above it.',
      'At the end the a–t areas cancel: the lift is at rest again. Yet the v–t area — the height gained — is not zero.',
      'Lengthen the cruise: the height grows, while the accelerometer trace has the same two blocks, just further apart.',
    ],
    params: {
      segments: [{ a: 'a0', dt: 2 }, { a: 0, dt: 'Tc' }, { a: '-a0', dt: 2 }],
      sliders: [
        { key: 'a0', label: t`Acceleration $a_0$`, min: 0.4, max: 1.6, step: 0.1, value: 1, unit: t`\mathrm{m/s^2}`, explain: 'How hard the lift speeds up and slows down; around 1 m/s² is comfortable.' },
        { key: 'Tc', label: t`Cruise time $T_c$`, min: 0, max: 10, step: 0.5, value: 6, unit: t`\mathrm{s}`, explain: 'How long the lift moves at constant speed between the two acceleration phases.' },
      ],
      track: 'vertical', pos: 'h', ground: true, area: true,
      readouts: ['t', 'x', 'v', 'a', 'dx'],
    },
    caption: 'Idealized step changes in acceleration; a real lift ramps them smoothly to limit jerk. A real accelerometer also reads gravity, which is subtracted here.',
  },
  example: {
    prompt: t`A cart moves along a track with velocity $v(t) = t^2 - 4$ m/s for $0 \le t \le 3$ s. Find its displacement and the distance it travels.`,
    visual: { type: 'mech-graphlink', params: { v: 't^2 - 4', T: 3, panels: ['x', 'v'], readouts: ['t', 'x', 'v', 'dx', 'dist'], time: 3, area: true, play: false }, caption: 'The cart backs up until t = 2 s, then drives forward. The v–t areas: below the axis while it reverses, above after.' },
    steps: [
      { label: 'Displacement', text: t`$\displaystyle\int_0^3 (t^2 - 4)\,dt = \left[\tfrac13t^3 - 4t\right]_0^3 = 9 - 12 = -3$ m: it ends $3$ m behind its start.` },
      { label: 'Where v changes sign', text: t`$t^2 - 4 = 0$ at $t = 2$ s: negative before (reversing), positive after.` },
      { label: 'Backward leg', text: t`$\displaystyle\int_0^2 (t^2 - 4)\,dt = \tfrac83 - 8 = -\tfrac{16}{3}$ m, so it reverses $\tfrac{16}{3} \approx 5.33$ m.` },
      { label: 'Forward leg', text: t`$\displaystyle\int_2^3 (t^2 - 4)\,dt = (9 - 12) - \left(\tfrac83 - 8\right) = \tfrac73$ m forward.` },
      { label: 'Distance', text: t`$\displaystyle\int_0^3 |v|\,dt = \tfrac{16}{3} + \tfrac{7}{3} = \tfrac{23}{3} \approx 7.67$ m. Check: $-\tfrac{16}{3} + \tfrac73 = -3$ ✓.` },
    ],
    answer: t`Displacement $-3$ m; distance $\tfrac{23}{3} \approx 7.67$ m.`,
  },
  practice: [
    num({
      id: 'airbag', difficulty: 2,
      gen(r) {
        const pk = r.pick([8, 12, 15]), T = r.pick([0.06, 0.08, 0.1]), dv = 0.5 * pk * G * T;
        return {
          prompt: t`A drop-test capsule lands on an airbag. Its accelerometer records a deceleration that rises linearly to a peak of $${pk}g$ at the midpoint and falls back to $0$, a pulse $${T}$ s long, after which the capsule is at rest. Using the area under the trace, how fast was it falling at impact? ($g = 9.81\ \text{m/s}^2$.)`,
          answer: dv, units: 'm/s', tol: { rel: 0.004 },
          errors: [{ value: pk * G * T, feedback: 'That is peak × duration, a rectangle. The trace is a triangle: half of that.' }, { value: 0.5 * pk * T, feedback: t`The trace is in units of $g$; multiply by $9.81\ \text{m/s}^2$.` }],
          hints: ['The capsule ends at rest, so the change in velocity is the whole impact speed.', t`Area of the triangle $= \tfrac12\times\text{base}\times\text{height} = \tfrac12\times ${T}\ \text{s}\times ${pk}\times 9.81\ \text{m/s}^2$.`],
          teach: 'The area under an acceleration–time trace is the change in velocity.',
          explain: t`$\Delta v = \tfrac12(${T})(${pk}\times9.81) = ${nice(dv, 3)}$ m/s — a drop from about $${nice(dv * dv / (2 * G), 2)}$ m. Real traces are noisier, and the area is found numerically.`,
          visual: areaFig({ fn: `${pk}*min(x, ${T} - x)/${T / 2}`, x: [-0.1 * T, 1.15 * T], y: [-0.08 * pk, 1.2 * pk], from: 0, to: T, signed: false, xlabel: 't (s)', ylabel: 'deceleration (g)', domain: [0, T], caption: 'An idealized triangular deceleration pulse.' }),
        };
      },
    }),
    num({
      id: 'disp-dist', difficulty: 3,
      gen(r) {
        const k = r.int(1, 2), T = k + r.int(2, 3), disp = T ** 3 / 3 - k * k * T, dist = 4 / 3 * k ** 3 + T ** 3 / 3 - k * k * T;
        return {
          prompt: t`A rover’s velocity along a straight test track is $v(t) = t^2 - ${k * k}$ m/s for $0 \le t \le ${T}$ s. What **distance** does it cover?`,
          answer: dist, units: 'm', tol: { rel: 0.003 },
          errors: [{ value: disp, feedback: 'That is the displacement. Split at the moment v changes sign and add the sizes of the pieces.' }, ...(disp < 0 ? [{ value: -disp, feedback: 'That is the size of the net displacement. The backward and forward legs both count.' }] : [])],
          hints: [t`$v = 0$ at $t = ${k}$ s; $v < 0$ before, $v > 0$ after.`, t`Distance $= -\displaystyle\int_0^{${k}} (t^2 - ${k * k})\,dt + \int_{${k}}^{${T}} (t^2 - ${k * k})\,dt$.`],
          teach: 'For distance, split the interval where v changes sign and add the absolute values of the pieces.',
          explain: t`Backward: $\tfrac{2}{3}\cdot${k ** 3} = ${nice(2 / 3 * k ** 3, 4)}$ m. Forward: $${nice(dist - 2 / 3 * k ** 3, 4)}$ m. Distance: $${nice(dist, 4)}$ m (displacement $${nice(disp, 4)}$ m).`,
          visual: areaFig({ fn: `x^2 - ${k * k}`, x: [-0.2, T + 0.3], y: [-k * k - 1, T * T - k * k + 1], from: 0, to: T, xlabel: 't (s)', ylabel: 'v (m/s)', caption: 'Velocity: red where the rover reverses, blue where it drives forward.' }),
        };
      },
    }),
    mcq({
      id: 'odometer-gps', difficulty: 1,
      prompt: t`After a drive, a rover’s wheel odometer (which adds up $|v|$) reads $340$ m, while GPS says it is $120$ m from where it started, along the same straight track. Which of these equals $\displaystyle\int_0^T v\,dt$, up to sign?`,
      visual: areaFig({ fn: '1.2*sin(x*pi/150) + 0.35', x: [-5, 310], y: [-1.1, 1.8], from: 0, to: 300, xlabel: 't (s)', ylabel: 'v (m/s)', domain: [0, 300], caption: 'A schematic velocity record: forward, then back for a while, then forward again.' }),
      choices: ['120 m', '340 m', '220 m', '460 m'],
      answer: 0,
      why: {
        1: 'That is the distance, ∫|v| dt: every metre counted as positive.',
        2: 'That is the difference of the two readings; it has no meaning on its own.',
        3: 'Adding the readings double-counts.',
      },
      hints: ['∫v dt is the net change in position; ∫|v| dt is the distance.'],
      teach: 'The integral of velocity is displacement, the GPS number; the integral of speed is distance, the odometer number.',
      explain: t`$\int v\,dt$ is the net change of position: $120$ m. The odometer’s $340$ m is $\int|v|\,dt$; the gap means it covered $110$ m backwards and $230$ m forwards.`,
    }),
    num({
      id: 'net-flow', difficulty: 2,
      gen(r) {
        const a = r.pick([40, 60, 80]), b = r.pick([4, 5, 8]), T = r.pick([12, 18, 25]), net = a * T - b * T * T / 2;
        const tz = a / b;
        return {
          prompt: t`A propellant depot’s tank gains mass at the rate $r(t) = ${a} - ${b}t$ kg/min (negative means it is giving propellant away). What is the net change in the tank’s mass over the first $${T}$ minutes, in kg?`,
          answer: net, units: 'kg', tol: { rel: 0.002, abs: 0.01 },
          integrand: `${a} - ${b}*x`, limits: [0, T],
          errors: [{ value: a * T, feedback: t`The rate is not constant: integrate $${a} - ${b}t$.` }].concat(T > tz ? [{ value: a * tz - b * tz * tz / 2, feedback: t`That is the gain up to $t = ${nice(tz)}$ min only. After that the tank loses mass, which counts negative.` }] : []),
          hints: [t`Net change $= \displaystyle\int_0^{${T}} (${a} - ${b}t)\,dt$.`, t`$= ${a}(${T}) - \tfrac{${b}}{2}(${T})^2$.`],
          teach: 'Net change = integral of the rate; periods of loss subtract automatically.',
          explain: t`$${a * T} - ${b * T * T / 2} = ${nice(net)}$ kg.${T > tz ? t` The rate turns negative at $t = ${nice(tz)}$ min; the red area is the propellant given away after that.` : ''}`,
          visual: areaFig({ fn: `${a} - ${b}*x`, x: [-0.5, T + 1], y: [Math.min(-5, (a - b * T) * 1.2), a * 1.2], from: 0, to: T, xlabel: 't (min)', ylabel: 'r (kg/min)', caption: 'Rate of change of the tank’s mass: blue adds, red subtracts.' }),
        };
      },
    }),
    num({
      id: 'v-from-accel', difficulty: 2,
      gen(r) {
        const v0 = r.pick([100, 150, 200]), a0 = r.pick([12, 15, 18]), k = r.pick([0.1, 0.15, 0.2]), T = r.pick([30, 40, 60]), vT = v0 + a0 * T + k * T * T / 2;
        return {
          prompt: t`A sounding rocket’s accelerometer (gravity already removed) records $a(t) = ${a0} + ${k}t\ \text{m/s}^2$ — rising as the propellant burns off. At $t = 0$ its speed is $${v0}$ m/s. What is its speed at $t = ${T}$ s?`,
          answer: vT, units: 'm/s', tol: { rel: 0.002 },
          errors: [{ value: a0 * T + k * T * T / 2, feedback: t`That is the change in speed. Add the starting $${v0}$ m/s.` }, { value: v0 + (a0 + k * T) * T, feedback: 'That uses the final acceleration for the whole burn. Integrate the changing acceleration.' }],
          hints: [t`$v(${T}) = v(0) + \displaystyle\int_0^{${T}} a(t)\,dt$.`, t`$\displaystyle\int_0^{${T}} (${a0} + ${k}t)\,dt = ${a0}(${T}) + \tfrac{${k}}{2}(${T})^2$.`],
          teach: 'Final value = initial value + integral of the rate.',
          explain: t`$v = ${v0} + ${a0 * T} + ${nice(k * T * T / 2)} = ${nice(vT)}$ m/s.`,
          visual: areaFig({ fn: `${a0} + ${k}*x`, x: [-0.03 * T, 1.08 * T], y: [0, 1.15 * (a0 + k * T)], from: 0, to: T, signed: false, xlabel: 't (s)', ylabel: 'a (m/s²)', domain: [0, T], caption: 'The accelerometer record, idealized as a straight line; the shaded area is the speed gained.' }),
        };
      },
    }),
    mcq({
      id: 'zero-net-accel', difficulty: 2,
      prompt: t`Over a whole lift ride the accelerometer trace has zero net area: $\displaystyle\int_0^T a\,dt = 0$. What does that tell you?`,
      visual: areaFig({ fn: 'step(x)*step(2 - x)*1 - step(x - 8)*step(10 - x)*1', x: [-0.5, 10.5], y: [-1.6, 1.6], from: 0, to: 10, xlabel: 't (s)', ylabel: 'a (m/s²)', caption: 'An idealized lift trace: a block of upward acceleration, a cruise, an equal block of braking.' }),
      choices: [
        'The lift ends with the same velocity it started with — but its position may have changed',
        'The lift ends where it started',
        'The lift never moved',
        'The lift travelled zero distance',
      ],
      answer: 0,
      why: {
        1: 'Zero net acceleration-area fixes the velocity, not the position. The lift in the picture rose 16 m.',
        2: 'It moved at constant speed during the cruise. Only the velocity change is zero.',
        3: 'Distance comes from integrating |v|, which is positive during the ride.',
      },
      hints: ['The area under a–t is the change in what?'],
      teach: '∫a dt is the change in velocity; you need ∫v dt for the change in position.',
      explain: t`$\int_0^T a\,dt = v(T) - v(0) = 0$: the lift starts and ends at rest. Its height changed by $\int_0^T v\,dt$, which is positive here.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-distance-cos', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 4]), T = r.pick([4, 6, 10]), D = 2 * A * T / Math.PI;
        return {
          prompt: t`A shaker table moves with velocity $v(t) = ${A}\cos(\pi t/${T})$ m/s for $0 \le t \le ${T}$ s. What distance does it travel? Give 3 significant figures.`,
          answer: D, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: D / 2, feedback: 'That is only the forward leg. It comes back the same distance, which also counts.' }],
          hints: [t`$v$ changes sign at $t = ${T / 2}$ s. The displacement is $0$; the distance is not.`, t`Distance $= 2\displaystyle\int_0^{${T / 2}} ${A}\cos(\pi t/${T})\,dt$.`],
          teach: 'A displacement of zero can hide a large distance: split where v changes sign.',
          explain: t`Each half covers $${A}\cdot\dfrac{${T}}{\pi}\sin\dfrac{\pi}{2} = ${nice(A * T / Math.PI, 4)}$ m, so the distance is $${nice(D, 4)}$ m while the displacement is $0$.`,
          visual: areaFig({ fn: `${A}*cos(pi*x/${T})`, x: [-0.05 * T, 1.08 * T], y: [-1.2 * A, 1.2 * A], from: 0, to: T, xlabel: 't (s)', ylabel: 'v (m/s)', domain: [0, T], caption: 'Equal areas above and below: zero displacement.' }),
        };
      },
    }),
    num({
      id: 'cp-imu-bias', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick([0.002, 0.005, 0.01]), mins = r.pick([5, 10, 30]), s = mins * 60, err = 0.5 * b * s * s;
        return {
          prompt: t`An inertial navigation unit’s accelerometer has an uncorrected bias: it reads $${b}\ \text{m/s}^2$ too high (about $${nice(b / G * 1000, 2)}$ milli-$g$). Integrating twice, how large a position error does that build up after $${mins}$ minutes, in metres?`,
          answer: err, units: 'm', tol: { rel: 0.003 },
          errors: [{ value: b * s, feedback: t`That is the velocity error, $b\,t$, in m/s. Integrate again for position.` }, { value: b * s * s, feedback: t`$\int_0^t b\,t'\,dt' = \tfrac12bt^2$: keep the $\tfrac12$.` }, { value: 0.5 * b * mins * mins, feedback: 'Convert minutes to seconds first.' }],
          hints: [t`Velocity error: $\displaystyle\int_0^t b\,dt' = bt$.`, t`Position error: $\displaystyle\int_0^t bt'\,dt' = \tfrac12bt^2$, with $t = ${s}$ s.`],
          teach: 'A constant accelerometer bias grows into a velocity error ∝ t and a position error ∝ t²: integration amplifies small errors.',
          explain: t`$\tfrac12(${b})(${s})^2 = ${thou(err)}$ m. That quadratic growth is why aircraft and rockets correct their inertial navigation with GPS or star trackers.`,
          visual: curveFig({ fn: `0.5*${b}*x^2`, x: [0, s * 1.05], y: [0, err * 1.15], xlabel: 't (s)', ylabel: 'position error (m)', extra: { yticks: 0 }, caption: 'Position error growing as the square of the time (error axis unnumbered). The bias is assumed constant; real biases drift.' }),
        };
      },
    }),
    mcq({
      id: 'cp-net-change', difficulty: 2,
      prompt: t`An engine burns propellant at the rate $\dot m(t)$ kg/s during a burn from $t = 0$ to $t = T$. Which expression gives the total propellant burned?`,
      visual: areaFig({ fn: '200 - 0.8*x', x: [-3, 130], y: [-10, 230], from: 0, to: 120, signed: false, xlabel: 't (s)', ylabel: 'ṁ (kg/s)', domain: [0, 120], caption: 'A burn rate that falls over the burn.' }),
      choices: [t`$\displaystyle\int_0^T \dot m(t)\,dt$`, t`$\dot m(T)\cdot T$`, t`$\dot m(T) - \dot m(0)$`, t`$\displaystyle\int_0^T \dot m'(t)\,dt$`],
      answer: 0,
      why: {
        1: 'That treats the rate as constant at its final value.',
        2: 'That is the change in the burn rate, not an amount of propellant.',
        3: t`By the FTC that equals $\dot m(T) - \dot m(0)$, the change in the rate.`,
      },
      hints: ['Which quantity has ṁ as its rate of change?'],
      teach: 'Total amount = integral of the rate over the time interval.',
      explain: t`$\dot m$ is the rate at which burned propellant accumulates, so the total burned is $\int_0^T \dot m\,dt$ — the shaded area. For this burn it is $200(120) - 0.4(120)^2 = ${thou(200 * 120 - 0.4 * 14400)}$ kg.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §5.4 Integration formulas and the net change theorem', url: 'https://openstax.org/books/calculus-volume-1/pages/5-4-integration-formulas-and-the-net-change-theorem' }],
});
