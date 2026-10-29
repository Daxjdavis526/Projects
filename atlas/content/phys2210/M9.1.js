// Momentum and impulse: p = mv, and the impulse ∫F dt that changes it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { G, forceCurve, areaUnder, momentumBoxes, lineArrows, rocketSide } from './_momentum.js';
import { vectorPicture } from './_vectors.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);

// two idealised crash pulses with the same area: a 70 kg occupant stopped from 15 m/s in 10 ms and in 100 ms
const PULSE = (dt) => `(pi/2)*(70*15/${dt})*sin(pi*x/${dt})`;

export default lesson({
  id: 'phys2210.M9.1',
  title: 'Momentum and impulse',
  minutes: 10, difficulty: 2,
  intro: t`Every moving object carries **momentum**, its mass times its velocity, $\vec p = m\vec v$. Newton first wrote his second law in terms of it — the net force is the rate at which momentum changes, $\vec F_\text{net} = d\vec p/dt$ — and adding that force up over the time it acts gives the **impulse**:

$$\vec J = \int_{t_i}^{t_f} \vec F\,dt = \Delta\vec p = m\vec v_f - m\vec v_i$$

The same change of momentum can come from **a big force for a short time or a small force for a long time**. That is why airbags, crumple zones and bent knees save lives — and why a rocket motor is rated by its total impulse.`,
  symbols: [
    { tex: '\\vec p = m\\vec v', text: 'momentum: mass (kg) times velocity (m/s), in kg·m/s — a vector pointing along the velocity' },
    { tex: '\\vec F', text: 'the net force on the object, in newtons (N); it may change during the interval' },
    { tex: 't_i,\\ t_f', text: 'the start and end of the interval the force acts over, in seconds' },
    { tex: '\\vec J', text: 'the impulse: the force added up over time, $\\int \\vec F\\,dt$, in newton-seconds. $1\\ \\text{N·s} = 1\\ \\text{kg·m/s}$' },
    { tex: '\\Delta\\vec p', text: 'the change in momentum, final minus initial — subtracted as vectors, so a reversal counts double' },
    { tex: 'F_\\text{avg} = J/\\Delta t', text: 'the average force: the steady force that would deliver the same impulse in the same time $\\Delta t$' },
  ],
  why: 'Impulse is how engineers design for a collision — stretch the stopping time and the force falls — and the same bookkeeping, applied to a stream of exhaust, gives rocket thrust.',
  visual: {
    type: 'graph',
    title: 'Same impulse, gentler force',
    lead: t`A 70 kg crash-test dummy moving at speed $v$ is brought to rest in a time $\Delta t$. The blue curve is the force on it; the **shaded area under it is the impulse**, which must equal its momentum $mv$. The dashed gold curve delivers the same impulse in 10 ms — roughly a rigid dashboard.`,
    tasks: [
      'Stretch the stopping time from 10 ms to 100 ms: the area stays the same, but the peak force falls tenfold.',
      'Double the speed: the impulse doubles, so the area under the curve must double too.',
      'At 15 m/s, find the stopping time that keeps the average force below 20 body weights (it is about 77 ms).',
    ],
    params: {
      aspect: 'wide', x: [0, 210], y: [0, 180], xlabel: 't (ms)', ylabel: 'F (kN)',
      constants: { m: 70 },
      sliders: [
        { key: 'v', label: 'Speed before the crash $v$', min: 5, max: 25, step: 0.5, value: 15, unit: '\\mathrm{m/s}', explain: '15 m/s is 54 km/h.' },
        { key: 'dt', label: 'Stopping time $\\Delta t$', min: 10, max: 200, step: 1, value: 60, unit: '\\mathrm{ms}', explain: 'Belts and airbags stretch a crash stop to roughly 50–150 ms; a rigid dashboard gives only a few ms.' },
      ],
      curves: [
        { fn: '(pi/2)*(m*v/10)*sin(pi*x/10)', domain: [0, 10], color: 'gold', width: 2, dash: true, label: 'same impulse in 10 ms', labelAt: 9.2, labelDx: 8, labelDy: -2 },
        { fn: '(pi/2)*(m*v/dt)*sin(pi*x/dt)', domain: [0, 'dt'], color: 'accent' },
      ],
      shade: [{ fn: '(pi/2)*(m*v/dt)*sin(pi*x/dt)', from: 0, to: 'dt', color: 'accent', alpha: 0.25 }],
      readouts: [
        { label: 'impulse $J = mv$', expr: 'm*v', unit: '\\mathrm{N\\,s}', digits: 3 },
        { label: 'average force $J/\\Delta t$', expr: 'm*v/dt', unit: '\\mathrm{kN}', digits: 3 },
        { label: 'peak force', expr: '(pi/2)*m*v/dt', unit: '\\mathrm{kN}', digits: 3 },
        { label: 'average, in body weights', expr: '1000*v/(9.8*dt)', digits: 3 },
      ],
    },
    caption: t`The pulse is drawn as half a sine wave; real crash pulses are messier, but whatever its shape the area is fixed at $\Delta p = mv$. Its peak is $\pi/2$ times the average force $J/\Delta t$. Units: 1 kN × 1 ms = 1 N·s.`,
  },
  example: {
    prompt: t`A 0.145 kg baseball is pitched at 40 m/s. The bat sends it straight back toward the pitcher at 50 m/s, and the contact lasts 1.2 ms. What impulse does the bat give the ball, and what is the average force?`,
    visual: lineArrows([
      { to: -5.8, label: 'before: −5.80 kg·m/s', color: 'accent' },
      { to: 7.25, label: 'after: +7.25 kg·m/s', color: 'violet' },
      { from: -5.8, to: 7.25, label: 'change Δp = +13.05 kg·m/s', color: 'gold' },
    ], { caption: 'Momentum along the line of the pitch, positive toward the pitcher. The change runs from the tip of the first arrow to the tip of the second.' }),
    steps: [
      { label: 'Choose a direction', text: t`Momentum is a vector, so pick a positive direction: **toward the pitcher**. Then $v_i = -40$ m/s and $v_f = +50$ m/s.` },
      { label: 'Momenta', text: t`$p_i = (0.145)(-40) = -5.80$ kg·m/s and $p_f = (0.145)(+50) = +7.25$ kg·m/s.` },
      { label: 'Impulse', text: t`$J = \Delta p = p_f - p_i = 7.25 - (-5.80) = 13.05$ kg·m/s $\approx 13.1$ N·s, toward the pitcher. The reversal counts in full: first the bat stops the ball, then it sends it back.` },
      { label: 'Average force', text: t`$F_\text{avg} = \dfrac{J}{\Delta t} = \dfrac{13.05\ \text{N·s}}{0.0012\ \text{s}} = 1.09\times10^{4}$ N — about 11 kN.` },
      { label: 'Sense check', text: t`That is about 7,700 times the ball’s weight ($mg = 1.42$ N), which is why gravity can be ignored during the hit. Subtracting speeds instead ($50 - 40$) would give 1.45 N·s — nine times too small.` },
    ],
    answer: t`$J \approx 13.1$ N·s toward the pitcher; $F_\text{avg} \approx 1.1\times10^{4}$ N.`,
  },
  practice: [
    num({
      id: 'p-of', difficulty: 1,
      gen(r) {
        const C = r.pick([
          { what: 'a car', m: r.pick([1200, 1500, 1800]), kmh: r.pick([54, 72, 90]) },
          { what: 'a sprinter', m: r.pick([60, 70, 80]), kmh: r.pick([32.4, 36]) },
          { what: 'a light aircraft at lift-off', m: r.pick([900, 1100]), kmh: r.pick([100, 110, 120]) },
        ]);
        const v = C.kmh / 3.6, p = C.m * v;
        return {
          prompt: t`What is the momentum of ${C.what} of mass ${C.m.toLocaleString('en-US')} kg moving at ${C.kmh} km/h?`,
          answer: p, units: 'kg m/s', tol: { rel: 0.01 },
          errors: [
            { value: C.m * C.kmh, feedback: 'Convert the speed to m/s first: divide km/h by 3.6.' },
            { value: 0.5 * C.m * v * v, feedback: 'That is the kinetic energy ½mv², in joules. Momentum is mv.' },
          ],
          hints: ['Momentum is mass times velocity: p = mv.', 'Convert the speed: 1 m/s = 3.6 km/h, so divide by 3.6.'],
          teach: 'Momentum is mass times velocity, p = mv, measured in kg·m/s and pointing along the velocity.',
          explain: t`$v = ${C.kmh}/3.6 = ${s3(v)}$ m/s, so $p = mv = ${C.m}\times${s3(v)} = ${s3(p)}$ kg·m/s, in the direction of motion.`,
          visual: momentumBoxes([{ m: C.m, v: C.kmh, label: C.what.replace(/^a /, '') }], { ylabel: 'speed (km/h)', caption: 'The rectangle is m wide and v tall, so its area is the momentum — once the speed is in m/s.' }),
        };
      },
    }),
    num({
      id: 'impulse-area', difficulty: 2,
      gen(r) {
        const Fp = r.pick([6000, 7000, 8000, 9000]), t1 = r.pick([0.1, 0.15]), hold = r.pick([0.2, 0.25, 0.3]), fall = r.pick([0.1, 0.15]);
        const t2 = +(t1 + hold).toFixed(2), t3 = +(t2 + fall).toFixed(2);
        const pts = [[0, 0], [t1, Fp], [t2, Fp], [t3, 0]];
        const J = areaUnder(pts) / 1000;                  // N·ms → N·s
        return {
          prompt: t`A golf club strikes a 46 g ball. The graph shows the club’s force on the ball: it rises steadily to ${Fp.toLocaleString('en-US')} N in ${t1} ms, holds there until ${t2} ms, and falls back to zero at ${t3} ms. What impulse does the club give the ball?`,
          answer: J, units: 'N s', tol: { rel: 0.01 },
          errors: [
            { value: (Fp * t3) / 1000, feedback: 'That is a rectangle, peak force × the whole contact time. During the two ramps the force is below its peak: they count as triangles.' },
            { value: (Fp * hold) / 1000, feedback: 'That is only the flat part. The rising and falling ramps add area too.' },
          ],
          hints: ['The impulse is the area under the force–time graph.', 'Split the area into a triangle, a rectangle and a triangle — and convert milliseconds to seconds.'],
          teach: 'Impulse is the area under the force–time graph, however the force varies.',
          explain: t`Area $= \tfrac12(${t1})(${Fp}) + (${hold})(${Fp}) + \tfrac12(${fall})(${Fp}) = ${nice(J * 1000)}$ N·ms $= ${s3(J)}$ N·s. That launches the 46 g ball at $J/m \approx ${Math.round(J / 0.046)}$ m/s.`,
          visual: forceCurve({ pts, x: [0, +(t3 * 1.15).toFixed(3)], y: [0, Fp * 1.18], ylabel: 'F (N)', caption: 'The club’s force on the ball. The shaded area is the impulse — in N·ms as drawn; 1 N·ms = 0.001 N·s.' }),
        };
      },
    }),
    mcq({
      id: 'bounce', difficulty: 2,
      prompt: 'A 0.50 kg ball hits a wall at 6.0 m/s and bounces straight back at 6.0 m/s. What is the size of its change in momentum?',
      choices: ['6.0 kg·m/s', '0 — its speed did not change', '3.0 kg·m/s', '9.0 kg·m/s'],
      answer: 0,
      why: {
        1: 'Momentum is a vector. Its size is the same before and after, but its direction reversed — and that is a change.',
        2: 'mv = 3.0 kg·m/s is what it takes just to stop the ball. Sending it back at the same speed takes another 3.0.',
        3: '9.0 is ½mv², the kinetic energy in joules — which indeed did not change. Momentum is mv, and it changed sign.',
      },
      hints: ['Take the direction toward the wall as positive. What are the momenta before and after?', t`$\Delta p = p_\text{after} - p_\text{before} = (-3.0) - (+3.0)$.`],
      teach: 'Momentum is a vector: a reversal at the same speed changes it by 2mv.',
      explain: t`$\Delta p = m(v_f - v_i) = 0.50\times(-6.0 - 6.0) = -6.0$ kg·m/s: size 6.0 kg·m/s, pointing away from the wall — the direction of the wall’s push.`,
      visual: lineArrows([{ to: 3, label: 'before: +3.0 kg·m/s', color: 'accent' }, { to: -3, label: 'after: −3.0 kg·m/s', color: 'violet' }], { caption: 'The ball’s momentum before and after, positive toward the wall.' }),
    }),
    num({
      id: 'landing', difficulty: 3,
      gen(r) {
        const m = r.pick([70, 80, 90]), v = r.pick([4, 5, 6]), dt = r.pick([0.15, 0.2, 0.25, 0.3]);
        const net = (m * v) / dt, N = net + m * G;
        return {
          prompt: t`A parachutist of mass ${m} kg (with gear) lands at ${v} m/s and, bending her knees, comes to rest in ${dt} s. What average force does the ground exert on her? Take $g = 9.8\ \text{m/s}^2$.`,
          answer: N, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: net, feedback: 'That is the net force. The ground must also hold up her weight while it stops her: N − mg = mv/Δt.' },
            { value: net - m * G, feedback: 'The ground pushes up and gravity pulls down, so N = mv/Δt + mg, not minus.' },
          ],
          hints: ['Two forces act during the landing: the ground’s push N upward and her weight mg downward.', 'The net force supplies the impulse: (N − mg)Δt = Δp = mv.', 'So N = mv/Δt + mg.'],
          teach: 'The ground must both stop you and hold up your weight: the impulse comes from the net force, N − mg.',
          explain: t`$(N - mg)\Delta t = mv \Rightarrow N = \dfrac{${m}\times${v}}{${dt}} + ${m}\times9.8 = ${s3(net)} + ${s3(m * G)} = ${s3(N)}$ N — about ${fmt(N / (m * G), 2)} times her weight. Landing stiff-legged, in a fiftieth of a second, would multiply the first term by about ${Math.round(dt / 0.02)}.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'person', ground: true, v: [0, -1], forces: [{ label: 'N (ground)', mag: +N.toFixed(1), dir: 90, kind: 'normal' }, { label: 'mg', mag: +(m * G).toFixed(1), dir: 270, kind: 'weight' }] }, caption: 'The parachutist during the landing (still moving down) and her free-body diagram, to scale.' },
        };
      },
    }),
    mcq({
      id: 'same-p', difficulty: 2,
      prompt: 'A 2,000 kg truck and a 1,000 kg car have the same momentum. Which has more kinetic energy?',
      choices: ['The car, with twice as much', 'The truck, with twice as much', 'They have the same kinetic energy', 'The car, with four times as much'],
      answer: 0,
      why: {
        1: 'Same momentum means the lighter car moves twice as fast, and kinetic energy goes with the square of speed.',
        2: 'Equal momentum does not mean equal energy: K = p²/2m, so for a fixed p, less mass means more energy.',
        3: 'The car does go twice as fast, which alone would give four times the energy — but it has half the mass: 4 × ½ = 2.',
      },
      hints: [t`Same momentum: $m_\text{truck} v_\text{truck} = m_\text{car} v_\text{car}$. How do their speeds compare?`, 'Write K = ½mv² as K = p²/(2m).'],
      teach: 'For a given momentum, kinetic energy is p²/2m: the lighter body carries more energy.',
      explain: t`$K = \dfrac{p^2}{2m}$. With $p$ the same, halving $m$ doubles $K$: the car has twice the truck’s kinetic energy, because it moves twice as fast.`,
      visual: momentumBoxes([{ m: 2000, v: 10, label: 'truck', color: 'violet' }, { m: 1000, v: 20, label: 'car' }], { caption: 'Same momentum: equal areas, different shapes. (Speeds chosen for illustration.)' }),
    }),
    mcq({
      id: 'airbag', difficulty: 1,
      prompt: 'An airbag protects a driver in a crash because it…',
      choices: ['makes the stop last longer, so the same change in momentum needs a smaller force', 'makes the driver’s change in momentum smaller', 'absorbs the driver’s momentum, so momentum is not conserved', 'shortens the time the force acts, so less impulse is delivered'],
      answer: 0,
      why: {
        1: 'The driver goes from the car’s speed to rest either way: Δp = mv is fixed by the crash, not by the airbag.',
        2: 'Momentum is conserved for the whole system; the airbag passes the driver’s momentum on to the car and the road — it does not destroy it.',
        3: 'It does the opposite: it lengthens the time. And the impulse is fixed at mv, whatever the time.',
      },
      hints: ['What is the driver’s change in momentum, with or without the airbag?', 'Impulse = average force × time. If the impulse is fixed, what happens to the force when the time grows?'],
      teach: t`For a fixed change in momentum, a longer stopping time means a smaller average force: $F_\text{avg} = \Delta p/\Delta t$.`,
      explain: t`The driver’s $\Delta p = mv$ is set by the crash. Spreading it over ten times longer (about 100 ms instead of 10 ms) cuts the average force tenfold: $F_\text{avg} = \Delta p/\Delta t$.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 112], y: [0, 180], xlabel: 't (ms)', ylabel: 'F (kN)',
          curves: [
            { fn: PULSE(10), domain: [0, 10], color: 'bad', label: 'rigid dashboard', labelAt: 7, labelDx: 8 },
            { fn: PULSE(100), domain: [0, 100], color: 'accent', label: 'belt and airbag', labelAt: 50, labelDy: -14 },
          ],
          shade: [{ fn: PULSE(10), from: 0, to: 10, color: 'bad', alpha: 0.25 }, { fn: PULSE(100), from: 0, to: 100, color: 'accent', alpha: 0.2 }],
        },
        caption: 'Force on a 70 kg occupant stopped from 15 m/s, without and with an airbag (idealised pulses).',
      },
    }),
    num({
      id: 'exhaust-force', difficulty: 2,
      gen(r) {
        const mdot = r.pick([1.5, 2.4, 3.2, 4.0]), ve = r.pick([2200, 2600, 3000, 4400]);
        const F = mdot * ve;
        return {
          prompt: t`A small rocket engine ejects ${mdot} kg of exhaust every second, at ${ve.toLocaleString('en-US')} m/s relative to the engine. What force does the engine exert on the exhaust — and so, by Newton’s third law, the exhaust on the engine?`,
          answer: F / 1000, units: 'kN', tol: { rel: 0.01 },
          errors: [
            { value: ve / mdot / 1000, feedback: 'Multiply, don’t divide: the momentum given per second is (mass per second) × (speed).' },
            { value: (0.5 * mdot * ve * ve) / 1000, feedback: 'That is ½ṁv², the kinetic energy given to the exhaust each second — a power in watts, not a force.' },
          ],
          hints: ['In one second the engine takes ṁ kilograms of gas and gives it the speed vₑ (relative to the engine).', 'Force is momentum delivered per second: F = Δp/Δt = ṁvₑ.'],
          teach: 'A stream that gains momentum at a steady rate needs a steady force F = ṁv — the idea behind rocket thrust.',
          explain: t`Each second, ${mdot} kg of gas gains $${mdot}\times${ve} = ${nice(F)}$ kg·m/s of momentum, so $F = \Delta p/\Delta t = ${nice(F)}$ N $= ${nice(F / 1000)}$ kN. The exhaust pushes back on the engine just as hard: that is the thrust, the subject of lesson M9.6.`,
          visual: rocketSide(),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turn', difficulty: 3,
      gen(r) {
        const [what, m] = r.pick([['a 0.17 kg ice-hockey puck', 0.17], ['a 0.43 kg football', 0.43], ['a 0.50 kg ball', 0.5]]);
        const v = r.pick([3, 4, 5, 6, 8]), p = m * v, dp = Math.SQRT2 * p;
        return {
          prompt: t`The velocity of ${what} changes from ${v} m/s east to ${v} m/s north — same speed, new direction. What is the size of its change in momentum?`,
          answer: dp, units: 'kg m/s', tol: { rel: 0.01 },
          errors: [
            { value: 0, feedback: 'The speed is unchanged, but the velocity is not: momentum is a vector, and its direction turned.' },
            { value: 2 * p, feedback: 'That would be a full reversal. A right-angle turn changes the momentum by √2 mv.' },
            { value: p, feedback: t`Subtract the vectors: $\Delta\vec p = \vec p_\text{after} - \vec p_\text{before}$ has two components, each of size $mv$.` },
          ],
          hints: [t`$\Delta\vec p = \vec p_\text{after} - \vec p_\text{before}$, as vectors.`, t`In components (east, north): $\Delta\vec p = (0 - mv,\ mv - 0)$. Use Pythagoras.`],
          teach: 'A change of direction at constant speed still changes momentum: subtract the vectors.',
          explain: t`$\Delta\vec p = (-${s3(p)},\ +${s3(p)})$ kg·m/s, so $|\Delta\vec p| = \sqrt2\times${s3(p)} = ${s3(dp)}$ kg·m/s, pointing north-west — the direction of the average force that turned it.`,
          visual: vectorPicture({ arrows: [{ to: [p, 0], label: 'p before', color: 'accent' }, { to: [0, p], label: 'p after', color: 'violet' }], numbers: false, xlabel: 'east', ylabel: 'north', caption: 'Momentum before and after, tails together, drawn to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-motor', difficulty: 3, transfer: true,
      gen(r) {
        const Fp = r.pick([12, 13, 14]), t1 = r.pick([0.2, 0.25]), Fs = r.pick([4, 4.5, 5]), t3 = r.pick([1.6, 1.7, 1.8]);
        const t2 = +(t1 + 0.2).toFixed(2), t4 = +(t3 + 0.1).toFixed(2);
        const pts = [[0, 0], [t1, Fp], [t2, Fs], [t3, Fs], [t4, 0]];
        const J = areaUnder(pts), cls = J <= 5 ? 'B' : J <= 10 ? 'C' : 'D';
        return {
          prompt: t`The graph is the thrust curve of a hobby rocket motor, drawn as straight pieces: a spike to ${Fp} N at ${t1} s, a fall to ${Fs} N by ${t2} s, a steady ${Fs} N until ${t3} s, and burnout at ${t4} s. Motors are lettered by **total impulse** — B up to 5 N·s, C up to 10 N·s, D up to 20 N·s. What total impulse does this one deliver?`,
          answer: J, units: 'N s', tol: { rel: 0.01 },
          errors: [
            { value: Fp * t4, feedback: 'Peak thrust × burn time is far too much: the thrust is near its peak only briefly.' },
            { value: Fs * t4, feedback: 'Sustain thrust × burn time misses the extra area of the lift-off spike (and overcounts the tail-off).' },
          ],
          hints: ['Total impulse is the area under the thrust curve.', 'Split it into pieces: the triangle up to the spike, the trapezoid down to the sustain level, the sustain rectangle, the tail-off triangle.'],
          teach: 'Total impulse — the area under a thrust curve — is how rocket motors are rated.',
          explain: t`$\tfrac12(${t1})(${Fp}) + \tfrac12(0.2)(${Fp} + ${Fs}) + (${nice(+(t3 - t2).toFixed(2))})(${Fs}) + \tfrac12(0.1)(${Fs}) = ${s3(J)}$ N·s: a ${cls} motor. The spike lifts the rocket off its launch rod quickly; the long sustain does most of the work.`,
          visual: forceCurve({ pts, x: [0, 2.1], y: [0, 16], xlabel: 't (s)', ylabel: 'thrust (N)', caption: 'Thrust against time, approximated by straight pieces. The shaded area is the total impulse.' }),
        };
      },
    }),
    num({
      id: 'cp-catch', difficulty: 2,
      gen(r) {
        const m = r.pick([30, 40, 60]), v = r.pick([0.3, 0.5, 0.8]), dt = r.pick([1.5, 2, 2.5]);
        const p = m * v, F = p / dt;
        return {
          prompt: t`On the International Space Station, a ${m} kg cargo bag drifts toward an astronaut at ${v} m/s. She stops it with a steady push lasting ${dt} s. What average force does she exert on it?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: p * dt, feedback: 'Divide by the time: the average force is the momentum change per unit time, F = Δp/Δt.' },
            { value: p, feedback: 'That is the impulse, in N·s. Divide by the time to get the average force.' },
          ],
          hints: ['The bag’s momentum goes from mv to zero.', t`$F_\text{avg} = \Delta p/\Delta t$.`],
          teach: 'Average force is the change in momentum divided by the time it takes: weightless or not, mass still resists.',
          explain: t`$\Delta p = ${m}\times${v} = ${nice(p)}$ kg·m/s, so $F = \Delta p/\Delta t = ${nice(p)}/${dt} = ${s3(F)}$ N. Weightless is not massless: the bag still has its full ${m} kg of inertia.`,
          visual: lineArrows([{ to: p, label: `before: ${nice(p)} kg·m/s`, color: 'accent' }, { to: 0, label: 'after: at rest', color: 'violet' }], { caption: 'The bag’s momentum, positive in its direction of drift.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §9.1 Linear momentum', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-1-linear-momentum' },
    { label: 'OpenStax University Physics Vol. 1, §9.2 Impulse and collisions', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-2-impulse-and-collisions' },
    { label: 'Model rocket motor classification (letters by total impulse)', url: 'https://en.wikipedia.org/wiki/Model_rocket_motor_classification' },
  ],
});
