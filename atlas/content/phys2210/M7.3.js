// The work–energy theorem: the net work done on an object equals the change in
// its kinetic energy, W_net = ½mv_f² − ½mv_i².
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, s3, sci, thou, fxGraph, energyBars } from './_energy.js';

const t = String.raw;

// the worked example: an airliner's landing roll
const EX = { m: 62000, v: 68, F: 1.6e5 };
EX.K = 0.5 * EX.m * EX.v ** 2;                  // 1.433e8 J
EX.d = EX.K / EX.F;                             // 896 m
EX.a = EX.F / EX.m;                             // 2.58 m/s²

// kinetic energy against speed, K = ½mv², with two speeds marked
// (numbers: false hides the energy scale, so the picture cannot be read for the answer)
const kvPic = (m, speeds, caption, { numbers = true, top = 30 } = {}) => {
  const vmax = speeds.length ? Math.max(...speeds) * 1.25 : top;
  return {
    type: 'graph',
    params: {
      x: [0, vmax], y: [0, 0.5 * m * vmax ** 2 * 1.02], xlabel: 'speed v (m/s)', ylabel: numbers ? 'K (J)' : 'K', aspect: 'wide',
      ...(numbers ? {} : { yticks: 0.001 }),
      curves: [{ fn: `${0.5 * m}*x^2`, color: 'accent', width: 2.4 }],
      points: speeds.map((v, i) => ({ x: v, y: 0.5 * m * v * v, color: 'gold', label: `${v} m/s`, labelDx: i === speeds.length - 1 && speeds.length > 1 ? -62 : 9 })),
      vlines: speeds.map((v) => ({ x: v })),
    },
    caption,
  };
};

// the burnout speed of a hydrogen–oxygen exhaust, from its energy per kilogram
const H2O = { dH: 241.8e3, M: 0.018015 };      // J/mol (lower heating value), kg/mol
H2O.e = H2O.dH / H2O.M;                         // 13.4 MJ/kg
H2O.v = Math.sqrt(2 * H2O.e);                   // 5.18 km/s

export default lesson({
  id: 'phys2210.M7.3',
  title: 'The work–energy theorem',
  minutes: 11, difficulty: 2,
  intro: t`Add up the work done by **every** force on an object and you get the change in its **kinetic energy**, the energy it has because it moves:

$$W_\text{net} = \Delta K = \tfrac12 m v_f^2 - \tfrac12 m v_i^2$$

Positive net work speeds an object up, negative net work slows it down, and zero net work leaves its speed unchanged. The theorem is Newton’s second law added up over a distance, and it answers “how fast?” and “how far?” without ever asking “how long?”.`,
  symbols: [
    { tex: 'W_\\text{net}', text: 'the net work: the sum of the works done by all the forces on the object (equivalently, the work of the net force), in joules (J)' },
    { tex: 'K = \\tfrac12 mv^2', text: 'kinetic energy, in J. Never negative, and a scalar: it does not care which way the object moves' },
    { tex: 'm', text: 'the object’s mass, in kg' },
    { tex: 'v_i,\\ v_f', text: 'its speed at the start and at the end, in m/s' },
    { tex: '\\Delta K', text: 'the change in kinetic energy, $K_f - K_i$ (final minus initial), in J' },
  ],
  why: 'It is the first of the energy shortcuts: braking distances, catapult launches and the energy a rocket stage must deliver all come out of one line — and the same bookkeeping, extended, becomes conservation of energy.',
  visual: {
    type: 'graph',
    title: 'The area under the force curve becomes kinetic energy',
    lead: t`A cart starts at $x = 0$ with speed $v_0$. The net force on it is $F = 10\,(1 - x/6)$ N: strong at first, fading, and pushing backwards after 6 m. The work done up to position $b$ is the signed area, and the cart’s kinetic energy there is $K = K_0 + W$.`,
    tasks: [
      'Slide b from 0 to 6 m: the green area — the work — keeps growing, and so do K and the speed.',
      'Go past 6 m: the force is negative (red), the area shrinks and the cart slows down. K follows the net area exactly.',
      'Double the mass: the same work gives the same kinetic energy, but the speed is only 1/√2 as large.',
    ],
    params: {
      x: [0, 12], y: [-11, 12], xlabel: 'position x (m)', ylabel: 'net force F (N)', aspect: 'wide',
      sliders: [
        { key: 'b', label: 'Position $b$', min: 0, max: 12, step: 0.1, value: 4, unit: '\\mathrm{m}', explain: 'How far the cart has gone.' },
        { key: 'm', label: 'Mass $m$', min: 0.5, max: 4, step: 0.1, value: 1, unit: '\\mathrm{kg}', explain: 'The cart’s mass. It does not change the work — only the speed that work buys.' },
        { key: 'v0', label: 'Starting speed $v_0$', min: 0, max: 6, step: 0.1, value: 0, unit: '\\mathrm{m/s}', explain: 'Its speed at $x = 0$.' },
      ],
      curves: [{ fn: '10*(1 - x/6)', color: 'accent', width: 2.6 }],
      shade: [{ fn: 'max(10*(1 - x/6), 0)', from: 0, to: 'b', color: 'good', alpha: 0.3 }, { fn: 'min(10*(1 - x/6), 0)', from: 0, to: 'b', color: 'bad', alpha: 0.3 }],
      readouts: [
        { label: 'work so far $W$ (area)', expr: '10*(b - b^2/12)', unit: '\\mathrm{J}', digits: 3 },
        { label: '$K = K_0 + W$', expr: '0.5*m*v0^2 + 10*(b - b^2/12)', unit: '\\mathrm{J}', digits: 3 },
        { label: 'speed $v$', expr: 'sqrt(2*(0.5*m*v0^2 + 10*(b - b^2/12))/m)', unit: '\\mathrm{m/s}', digits: 3 },
      ],
    },
    caption: 'One dimension, no friction beyond what is already in the net force. If K would be negative, the speed reads “—”: the cart stopped and turned back before reaching b.',
  },
  example: {
    prompt: t`A $${thou(EX.m)}$ kg airliner touches down at ${EX.v} m/s. Wheel brakes, spoilers and reverse thrust together give an average retarding force of $${sci(EX.F, 2)}$ N. How long is its landing roll?`,
    visual: energyBars([{ title: 'Ki + W = Kf', Ki: EX.K, W: -EX.K, Kf: 0 }], { keys: ['Ki', 'W', 'Kf'], numbers: false, caption: 'The work–energy theorem as a bar chart: kinetic energy at touchdown (Ki), plus the negative work of the braking forces (W), leaves nothing at the end (Kf = 0).' }),
    steps: [
      { label: 'Kinetic energy at touchdown', text: t`$K_i = \tfrac12 mv_i^2 = \tfrac12(${thou(EX.m)})(${EX.v})^2 = ${sci(EX.K, 3)}$ J. At the end, $K_f = 0$.` },
      { label: 'Net work', text: t`The retarding force points backwards along the whole roll $d$, so $W_\text{net} = -Fd$. (Gravity and the runway’s normal force are vertical: no work.)` },
      { label: 'Apply the theorem', text: t`$-Fd = 0 - K_i$, so $d = \dfrac{K_i}{F} = \dfrac{${sci(EX.K, 3)}\ \text{J}}{${sci(EX.F, 2)}\ \text{N}} = ${fmt(EX.d, 3)}$ m.` },
      { label: 'Sense check', text: t`The deceleration is $F/m = ${fmt(EX.a, 3)}\ \text{m/s}^2$, about a quarter of $g$ — firm but comfortable braking, and a roll of about 0.9 km is typical. Because $d \propto v^2$, touching down 10% faster makes the roll 21% longer.` },
    ],
    answer: t`About ${fmt(EX.d, 2)} m (${fmt(EX.d, 3)} m).`,
  },
  practice: [
    num({
      id: 'kinetic-energy', difficulty: 1,
      gen(r) {
        const [what, m, v] = r.pick([['a 1400 kg car', 1400, r.pick([15, 20, 25, 30])], ['a 0.145 kg baseball', 0.145, r.pick([35, 40, 45])], ['a 70 kg sprinter', 70, r.pick([8, 9, 10])], ['a 9.0 kg bowling-alley pin-setter arm', 9, r.pick([2, 3, 4])]]);
        const K = 0.5 * m * v * v;
        return {
          prompt: t`What is the kinetic energy of ${what} moving at ${v} m/s?`,
          answer: K, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: m * v * v, feedback: t`Kinetic energy is $\tfrac12 mv^2$ — you dropped the ½.` }, { value: 0.5 * m * v, feedback: 'The speed is squared.' }],
          hints: [t`$K = \tfrac12 mv^2$, with $m$ in kg and $v$ in m/s.`],
          teach: 'Kinetic energy is ½mv²: it grows with the square of the speed.',
          explain: t`$K = \tfrac12(${m})(${v})^2 = ${sci(K, 3)}$ J.`,
          visual: kvPic(m, [v], t`The kinetic energy of ${what.replace(/^a /, 'the ')} against its speed, $K = \tfrac12 mv^2$, with this speed marked. The energy scale is hidden: compute, don’t read off.`, { numbers: false }),
        };
      },
    }),
    mcq({
      id: 'double-speed', difficulty: 1,
      prompt: 'A car’s speed doubles. What happens to its kinetic energy?',
      choices: ['It becomes 4 times as large', 'It doubles', 'It becomes 8 times as large', 'It stays the same, because the mass has not changed'],
      answer: 0,
      why: { 1: t`$K$ depends on $v^2$, not on $v$: doubling $v$ multiplies $v^2$ by 4.`, 2: 'That would be for K ∝ v³. Kinetic energy goes as the square of the speed.', 3: 'Kinetic energy depends on speed as well as mass.' },
      hints: [t`$K = \tfrac12 mv^2$: what is $(2v)^2$?`],
      teach: 'Kinetic energy grows as the square of the speed: twice as fast, four times the energy.',
      explain: t`$\tfrac12 m(2v)^2 = 4\cdot\tfrac12 mv^2$. That is why a car at 100 km/h needs four times the braking distance it needs at 50 km/h.`,
      visual: kvPic(1000, [], 'Kinetic energy of a car against its speed: a parabola, K = ½mv². Energy scale hidden.', { numbers: false }),
    }),
    num({
      id: 'speed-from-work', difficulty: 2,
      gen(r) {
        const m = r.pick([0.16, 0.2, 0.5, 2, 5]), v = r.pick([3, 4, 5, 6, 8, 10]);
        const W = 0.5 * m * v * v;
        return {
          prompt: t`A ${m} kg puck starts at rest on frictionless ice. The net work done on it is ${fmt(W, 3)} J. How fast is it moving now?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (2 * W) / m, feedback: t`That is $v^2$: take the square root.` }, { value: Math.sqrt(W / m), feedback: t`$W = \tfrac12 mv^2$, so $v = \sqrt{2W/m}$ — the 2 is missing.` }],
          hints: [t`From rest, $W_\text{net} = \tfrac12 mv^2 - 0$. Solve for $v$.`],
          teach: 'From rest, all the net work becomes kinetic energy: v = √(2W/m).',
          explain: t`$v = \sqrt{2W/m} = \sqrt{2(${fmt(W, 3)})/${m}} = ${v}$ m/s.`,
          visual: energyBars([{ title: 'Ki + W = Kf', Ki: 0, W, Kf: W }], { keys: ['Ki', 'W', 'Kf'], numbers: false, caption: 'From rest (Ki = 0), the net work done on the puck (gold) becomes its kinetic energy (Kf).' }),
        };
      },
    }),
    num({
      id: 'skid-distance', difficulty: 2,
      gen(r) {
        const v = r.pick([12, 15, 18, 20, 25]), mu = r.pick([0.5, 0.6, 0.7, 0.8]);
        const d = (v * v) / (2 * mu * G);
        return {
          prompt: t`A car moving at ${v} m/s locks its wheels and skids to a stop on a level road. The coefficient of kinetic friction between the tyres and the road is ${mu}. How far does it skid? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v * v) / (mu * G), feedback: t`$K = \tfrac12 mv^2$: you lost the ½ (or a factor of 2).` }, { value: v / (2 * mu * G), feedback: 'The speed must be squared.' }],
          hints: [t`Friction $\mu_k mg$ does work $-\mu_k mg\,d$, and that must equal $\Delta K = 0 - \tfrac12 mv^2$.`, t`The mass cancels: $d = \dfrac{v^2}{2\mu_k g}$.`],
          teach: t`Skid distance comes straight from $W_\text{net} = \Delta K$: friction’s work $-\mu_k mgd$ removes all of $\tfrac12 mv^2$, so $d = v^2/(2\mu_k g)$.`,
          explain: t`$-\mu_k mg\,d = -\tfrac12 mv^2 \Rightarrow d = \dfrac{v^2}{2\mu_k g} = \dfrac{${v}^2}{2(${mu})(9.8)} = ${s3(d)}$ m. The mass cancels: a heavy truck and a light car with the same tyres skid the same distance.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'car', ground: true, v: [1, 0], forces: [{ label: 'friction', mag: mu * 1200 * G, dir: 180, kind: 'friction' }, { label: 'N', mag: 1200 * G, dir: 90, kind: 'normal' }, { label: 'mg', mag: 1200 * G, dir: 270, kind: 'weight' }] }, caption: 'The skidding car and its free-body diagram, forces to scale (drawn for a 1200 kg car).' },
        };
      },
    }),
    num({
      id: 'area-to-speed', difficulty: 3,
      gen(r) {
        const m = r.pick([2, 4, 5]), v0 = r.pick([0, 1, 2, 3]), F0 = r.pick([6, 8, 10, 12]), a = r.pick([2, 3, 4]), b = a + r.pick([2, 3]);
        const W = (F0 * a) / 2 + F0 * (b - a) / 2;            // a triangle up to x = a, then a triangle back down to zero at x = b
        const vf = Math.sqrt(v0 * v0 + (2 * W) / m);
        const fe = `min(${F0}*x/${a}, ${F0}*(${b} - x)/${b - a})`;
        return {
          prompt: t`A ${m} kg cart moving at ${v0} m/s at $x = 0$ feels the net force shown. How fast is it moving at $x = ${b}$ m?`,
          answer: vf, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            ...(v0 > 0 ? [{ value: Math.sqrt((2 * W) / m), feedback: 'The cart already had kinetic energy at the start: add the work to K₀, not to zero.' }] : []),
            { value: v0 + Math.sqrt((2 * W) / m), feedback: t`Energies add, speeds do not: find $K_f = K_i + W$ first, then the speed.` },
          ].filter((e) => Math.abs(e.value - vf) > 0.02 * vf),
          hints: ['The area under the net-force graph is the net work.', t`$W = \tfrac12(${b})(${F0})$ J. Then $\tfrac12 mv_f^2 = \tfrac12 mv_0^2 + W$.`],
          teach: 'The area under the net-force graph is the change in kinetic energy; find the speed from the final kinetic energy.',
          explain: t`$W = \tfrac12(${b})(${F0}) = ${fmt(W, 3)}$ J. $K_f = \tfrac12(${m})(${v0})^2 + ${fmt(W, 3)} = ${fmt(0.5 * m * v0 * v0 + W, 3)}$ J, so $v_f = \sqrt{2K_f/m} = ${s3(vf)}$ m/s.`,
          visual: fxGraph({ F: fe, from: 0, to: b, x: [0, b + 0.5], y: [0, F0 * 1.3], ylabel: 'net force F (N)', caption: 'The net force on the cart against its position; the shaded area is the net work.', extra: { curves: [{ fn: fe, domain: [0, b], color: 'accent', width: 2.6 }] } }),
        };
      },
    }),
    mcq({
      id: 'same-push', difficulty: 2,
      prompt: 'Two carts start from rest on a frictionless track. Cart A has mass m and cart B has mass 4m. Each is pushed by the same constant force over the same 2 m. Afterwards:',
      choices: ['They have the same kinetic energy, and A is twice as fast as B', 'B has 4 times the kinetic energy of A', 'They have the same speed', 'A has 4 times the kinetic energy of B'],
      answer: 0,
      why: {
        1: 'The same force over the same distance does the same work on each cart, whatever its mass — so each gains the same kinetic energy.',
        2: t`Equal kinetic energies with a 4× mass means a smaller speed: $v \propto 1/\sqrt m$, so A is twice as fast.`,
        3: 'A is faster, but its kinetic energy is the same as B’s: both received the same work.',
      },
      hints: ['Compare the work done on each cart.', t`Equal $K = \tfrac12 mv^2$: if $m$ is 4 times larger, what must $v^2$ be?`],
      teach: 'Equal work means equal kinetic energy; the lighter object turns it into more speed.',
      explain: t`$W = Fd$ is the same for both, so $K_A = K_B$. Then $\tfrac12 m v_A^2 = \tfrac12(4m)v_B^2$ gives $v_A = 2v_B$.`,
      visual: fxGraph({ F: '5', from: 0, to: 2, x: [0, 2.6], y: [0, 6.5], ylabel: 'force on each cart (N)', caption: 'The same force against position for both carts, so the same area — the same work — for each. (Drawn for a 5 N push.)' }),
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: 'Put the steps of the derivation of the work–energy theorem (in one dimension) in order.',
      items: [
        t`Start from the definition: $W_\text{net} = \int F_\text{net}\,dx$`,
        t`Use Newton’s second law: $F_\text{net} = m\,\dfrac{dv}{dt}$`,
        t`Use the chain rule: $\dfrac{dv}{dt}\,dx = \dfrac{dx}{dt}\,dv = v\,dv$`,
        t`So $W_\text{net} = \int_{v_i}^{v_f} m v\,dv$`,
        t`Integrate: $W_\text{net} = \tfrac12 mv_f^2 - \tfrac12 mv_i^2$`,
      ],
      hints: ['Begin with what work is, and end with kinetic energy.', 'Newton’s law brings in dv/dt; the chain rule turns dv/dt · dx into v dv.'],
      teach: 'The work–energy theorem is Newton’s second law integrated over distance instead of time.',
      explain: t`Work is $\int F\,dx$; Newton swaps $F$ for $m\,dv/dt$; the chain rule turns $(dv/dt)\,dx$ into $v\,dv$; and $\int mv\,dv = \tfrac12 mv^2$ evaluated between the speeds.`,
    }),
    mcq({
      id: 'diff-squared', difficulty: 3, kind: 'error',
      prompt: t`A student finds the net work needed to speed a 1000 kg car up from 10 m/s to 20 m/s:

$$W = \tfrac12 m (v_f - v_i)^2 = \tfrac12(1000)(10)^2 = 50\ \text{kJ}$$

What is wrong?`,
      choices: [
        t`$\Delta K = \tfrac12 m(v_f^2 - v_i^2)$, not $\tfrac12 m(v_f - v_i)^2$: the work is 150 kJ`,
        'They should use the average speed, 15 m/s: the work is 112.5 kJ',
        'Nothing: a 10 m/s change in speed always needs 50 kJ for this car',
        'Work also depends on how long the car takes to speed up, which is not given',
      ],
      answer: 0,
      why: {
        1: t`Kinetic energy is not linear in speed, so neither an average speed nor a difference of speeds can be squared: compute $K_f$ and $K_i$ separately.`,
        2: t`Going from 20 to 30 m/s would need $\tfrac12(1000)(900 - 400) = 250$ kJ — more than from 10 to 20. The same change in speed costs more at higher speed.`,
        3: 'The work–energy theorem involves only the start and end speeds; time matters for power, not for work.',
      },
      hints: [t`Compute $K_i$ and $K_f$ separately.`, t`$(v_f - v_i)^2 \ne v_f^2 - v_i^2$.`],
      teach: t`Square the speeds first, then subtract: $\Delta K = \tfrac12 m(v_f^2 - v_i^2)$.`,
      explain: t`$K_i = \tfrac12(1000)(10)^2 = 50$ kJ and $K_f = \tfrac12(1000)(20)^2 = 200$ kJ, so $W = \Delta K = 150$ kJ — three times the student’s answer.`,
      visual: kvPic(1000, [10, 20], 'Kinetic energy of the 1000 kg car against its speed (energy scale hidden). The change in K is the vertical gap between the two marked points.', { numbers: false }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-catapult', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([20000, 25000, 30000]), v = r.pick([65, 70, 75, 80]), d = r.pick([80, 90, 100]);
        const F = (0.5 * m * v * v) / d;
        return {
          prompt: t`An aircraft-carrier catapult, helped by the jet’s own engines, takes a $${thou(m)}$ kg fighter from rest to ${v} m/s over ${d} m. What average net force acts on the jet during the launch?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (m * v * v) / d, feedback: t`$K = \tfrac12 mv^2$: you dropped the ½.` }, { value: (m * v) / d, feedback: 'The speed must be squared: W = ΔK = ½mv².' }],
          hints: ['The net work over the stroke equals the jet’s final kinetic energy.', t`$F_\text{avg}\,d = \tfrac12 mv^2$.`],
          teach: 'The average net force over a distance is ΔK divided by that distance.',
          explain: t`$F = \dfrac{\tfrac12 mv^2}{d} = \dfrac{\tfrac12(${thou(m)})(${v})^2}{${d}} = ${sci(F, 3)}$ N — about ${fmt(F / (m * G), 2)} times the jet’s weight.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'plane', ground: true, v: [1, 0], forces: [{ label: 'catapult + thrust', mag: Math.round(F), dir: 0, kind: 'thrust' }, { label: 'mg', mag: Math.round(m * G), dir: 270, kind: 'weight' }, { label: 'N', mag: Math.round(m * G), dir: 90, kind: 'normal' }] }, caption: 'The jet on the deck during the stroke, forces to scale. Drag and rolling friction ignored.' },
        };
      },
    }),
    num({
      id: 'cp-exhaust', difficulty: 3, transfer: true,
      prompt: t`Burning hydrogen with oxygen releases about ${fmt(H2O.e / 1e6, 3)} MJ of energy per kilogram of propellant. If **all** of it became kinetic energy of the exhaust gas, how fast would the exhaust leave the engine? Give the answer in km/s.`,
      answer: H2O.v / 1000, units: 'km/s', tol: { rel: 0.01 },
      errors: [{ value: (2 * H2O.e) / 1e6, feedback: t`That is $v^2$ in some unit: take the square root, with the energy in J/kg.` }, { value: Math.sqrt(H2O.e) / 1000, feedback: t`Per kilogram, $\tfrac12 v^2 = e$, so $v = \sqrt{2e}$ — the 2 is missing.` }],
      hints: [t`For each kilogram of exhaust, $\tfrac12(1\ \text{kg})v^2 = ${fmt(H2O.e / 1e6, 3)}\times10^{6}$ J.`, t`$v = \sqrt{2e}$ with $e$ in J/kg.`],
      teach: 'Energy per kilogram converts to speed through ½v² — the work–energy theorem per unit mass.',
      explain: t`$v = \sqrt{2(${fmt(H2O.e / 1e6, 3)}\times10^6\ \text{J/kg})} = ${fmt(H2O.v, 3)}$ m/s $\approx ${fmt(H2O.v / 1000, 3)}$ km/s. Real engines run hydrogen-rich and cannot turn all the heat into directed motion — the exhaust leaves hot — so the best reach about 4.4–4.6 km/s (specific impulses of 450–465 s).`,
      solution: t`$e$ comes from the heat of formation of water vapour, 241.8 kJ/mol, divided by its molar mass, 18.0 g/mol.`,
      visual: energyBars([{ title: 'in the tank (per kg)', E: H2O.e / 1e6, K: 0 }, { title: 'in the exhaust (ideal)', E: 0, K: H2O.e / 1e6 }], { keys: ['E', 'K'], unit: 'MJ', numbers: true, caption: 'Per kilogram of propellant: chemical energy (violet) becomes the kinetic energy of the exhaust (blue), in the ideal case where nothing is lost.' }),
    }),
    mcq({
      id: 'cp-double-stop', difficulty: 2,
      prompt: 'A truck brakes to a stop with a constant braking force. If it had been going twice as fast, with the same braking force, its stopping distance would be:',
      choices: ['4 times as long', '2 times as long', 'the same', '√2 times as long'],
      answer: 0,
      why: { 1: 'Stopping distance is proportional to the kinetic energy that must be removed, and that goes as v².', 2: 'Twice the speed means four times the kinetic energy for the same force to remove.', 3: 'The distance grows faster than the speed, not slower.' },
      hints: [t`$F d = \tfrac12 mv^2$, so $d \propto v^2$.`],
      teach: 'With a fixed braking force, stopping distance grows as the square of the speed.',
      explain: t`$d = \dfrac{\tfrac12 mv^2}{F}$: doubling $v$ quadruples $d$.`,
      visual: kvPic(8000, [], 'Kinetic energy of a truck against its speed (energy scale hidden): the braking force must remove all of it, so the stopping distance follows the same curve.', { numbers: false }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §7.2–7.3 Kinetic energy and the work–energy theorem', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-3-work-energy-theorem' },
    { label: 'NIST Chemistry WebBook: water, enthalpy of formation of the gas', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Mask=1' },
  ],
});
