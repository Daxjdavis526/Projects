// Newton's second law: net force causes acceleration.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { force, bodyFBD, scene } from './_forces.js';

const t = String.raw;
const G = 9.8;

export default lesson({
  id: 'phys2210.M5.3',
  title: 'Newton’s second law',
  minutes: 8, difficulty: 2,
  intro: t`Newton's second law says the **net force** on an object equals its mass times its acceleration:

$$\vec F_\text{net} = m\vec a$$

Force causes *acceleration* — a change in velocity — not velocity itself. Every free-body diagram you draw ends with this equation, and in rocketry it sets how fast a vehicle can change its speed.`,
  symbols: [
    { tex: '\\vec F_\\text{net}', text: 'the vector sum of every force on the object, in newtons (N)' },
    { tex: 'm', text: 'mass — how hard the object is to accelerate — in kilograms (kg)' },
    { tex: '\\vec a', text: 'acceleration, the rate of change of velocity, in m/s²; it points along the net force' },
    { tex: '1\\,\\mathrm{N}', text: 'the force that gives 1 kg an acceleration of 1 m/s², so 1 N = 1 kg·m/s²' },
  ],
  why: 'Only the net force matters: two equal and opposite pushes produce no acceleration, however hard they push.',
  visual: {
    type: 'force-cart',
    title: 'Push a cart and watch its velocity change',
    lead: t`Set a force and a mass, press **Play**, and read the slope of the velocity graph. That slope is the acceleration.`,
    tasks: ['Double the force: the slope doubles.', 'Double the mass: the slope halves.', 'Add friction until the cart will not move at all.'],
  },
  example: {
    prompt: t`A 1200 kg car speeds up from rest to 27 m/s in 9.0 s. What average net force acts on it?`,
    steps: [
      { label: 'Acceleration', text: t`$a = \dfrac{\Delta v}{\Delta t} = \dfrac{27\ \text{m/s} - 0}{9.0\ \text{s}} = 3.0\ \text{m/s}^2$` },
      { label: 'Second law', text: t`$F_\text{net} = ma = (1200\ \text{kg})(3.0\ \text{m/s}^2) = 3600\ \text{N}$` },
      { label: 'Sense check', text: t`About a third of the car's weight ($mg \approx 11\,800$ N) — a brisk but ordinary acceleration.` },
    ],
    answer: t`$F_\text{net} = 3.6\times10^{3}\ \text{N}$, in the direction of motion.`,
  },
  practice: [
    num({
      id: 'f-over-m', difficulty: 1,
      gen(r) {
        const m = r.int(2, 9), a = r.int(2, 8), F = m * a;
        return {
          prompt: t`What is the acceleration of a ${m} kg object experiencing a net force of ${F} N?`,
          answer: a, units: 'm/s^2', tol: { rel: 1e-3 },
          errors: [{ value: F * m, feedback: 'You multiplied force by mass. Solve F = ma for a: divide the force by the mass.' }, { value: m / F, feedback: 'That is m/F, upside down. a = F/m.' }],
          hints: ['Use Newton’s second law, F = ma, and solve for acceleration.'],
          teach: 'Newton’s second law relates the net force on an object to its mass and acceleration.',
          explain: t`$a = F/m = ${F}\ \text{N} / ${m}\ \text{kg} = ${a}\ \text{m/s}^2$.`,
          visual: { type: 'diagram', params: { kind: 'block', mass: m, forces: [{ dir: 0, label: `${F} N`, size: 1 }] } },
        };
      },
    }),
    num({
      id: 'with-friction', difficulty: 2,
      gen(r) {
        const m = r.int(3, 12), mu = r.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
        const F = Math.round(mu * m * G + r.int(4, 30));
        const a = (F - mu * m * G) / m;
        return {
          prompt: t`A ${m} kg crate is pulled across a level floor by a horizontal ${F} N force. The coefficient of kinetic friction is ${mu}. Find its acceleration. (Use $g = 9.8\ \text{m/s}^2$.)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: F / m, feedback: 'You left out friction. The net force is the pull minus the friction force.' }, { value: (F + mu * m * G) / m, feedback: 'Friction opposes the motion: subtract it from the pull, do not add it.' }],
          hints: [t`Friction is $f = \mu_k N$, and on a level floor $N = mg$.`, t`$F_\text{net} = F - \mu_k m g$; then divide by $m$.`],
          teach: 'Kinetic friction opposes sliding with magnitude μₖN; on a level floor with no other vertical forces, N = mg.',
          explain: t`$f = ${mu}\times${m}\times9.8 = ${fmt(mu * m * G)}$ N, so $a = (${F} - ${fmt(mu * m * G)})/${m} = ${fmt(a)}\ \text{m/s}^2$.`,
          visual: scene('floor', { m, F, phi: 0, mus: mu, muk: mu, moving: true, accel: false }, 'The crate sliding to the right and its free-body diagram, forces to scale.'),
        };
      },
    }),
    mcq({
      id: 'puck', difficulty: 1,
      prompt: 'A hockey puck slides across frictionless ice at a constant 8 m/s. Ignoring air, what is the net force on it?',
      choices: ['Zero', 'A forward force that keeps it moving', 'A backward force slowing it slightly', 'A force equal to its weight'],
      answer: 0,
      why: { 1: 'Motion does not need a force to sustain it — that was Aristotle’s idea, and Newton’s first law replaced it.', 2: 'With no friction there is nothing to slow it; its velocity is constant.', 3: 'Its weight is balanced by the normal force from the ice.' },
      hints: ['Is the velocity changing?', 'Zero acceleration means zero net force.'],
      teach: 'Constant velocity means zero acceleration, so the net force is zero.',
      explain: t`$a = 0$ because the velocity is constant, so $F_\text{net} = ma = 0$. Gravity and the ice’s normal force cancel.`,
      visual: bodyFBD([], { icon: 'puck', show: 'picture', ground: true, v: [1, 0], caption: 'The puck gliding to the right across frictionless ice at a steady 8 m/s.' }),
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: 'If the net force on an object doubles while its mass is halved, its acceleration becomes:',
      choices: ['4 times as large', '2 times as large', 'Unchanged', 'Half as large'],
      answer: 0,
      why: { 1: 'Each change doubles the acceleration on its own; together they multiply.', 2: 'The two changes do not cancel — both increase a.', 3: 'Less mass means more acceleration, not less.' },
      hints: ['Write a = F/m and change both.'],
      teach: 'Acceleration is proportional to net force and inversely proportional to mass.',
      explain: t`$a' = \dfrac{2F}{m/2} = 4\dfrac{F}{m} = 4a$.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-2.7, 2.7], y: [-0.95, 0.95], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          alt: 'Before: force F on mass m. After: force 2F on mass m/2.',
          points: [
            { x: -2.25, y: 0.72, r: 0.01, color: 'ink2', label: 'before', labelDx: 0, labelDy: 0 },
            { x: 0.2, y: 0.72, r: 0.01, color: 'ink2', label: 'after', labelDx: 0, labelDy: 0 },
            { x: -2.1, y: 0, r: 13, color: 'accent', label: 'm', labelDx: -28, labelDy: 0 },
            { x: 0.35, y: 0, r: 9, color: 'accent', label: 'm/2', labelDx: -40, labelDy: 0 },
            { x: 0.25, y: -0.55, r: 0.01, color: 'gold', label: 'a′ = ?', labelDx: 0, labelDy: 0 },
          ],
          arrows: [
            { from: [-1.85, 0], to: [-1.15, 0], color: 'accent', label: 'F', labelDx: 6, labelDy: 0 },
            { from: [0.55, 0], to: [1.95, 0], color: 'accent', label: '2F', labelDx: 6, labelDy: 0 },
            { from: [-2.1, -0.5], to: [-1.6, -0.5], color: 'gold', label: 'a', labelDx: 6, labelDy: 0 },
          ],
        },
        caption: 'Before: a force F gives mass m an acceleration a. After: twice the force acts on half the mass. Force arrows to scale.',
      },
    }),
    num({
      id: 'opposing', difficulty: 2,
      gen(r) {
        const m = r.int(2, 10), F1 = r.int(15, 40), F2 = r.int(3, 14);
        return {
          prompt: t`Two horizontal forces act on a ${m} kg block on a frictionless surface: ${F1} N to the right and ${F2} N to the left. What is the magnitude of its acceleration?`,
          answer: (F1 - F2) / m, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: (F1 + F2) / m, feedback: 'Forces in opposite directions subtract.' }],
          hints: ['Add the forces as vectors: right is positive, left negative.'],
          teach: 'The second law uses the net force: add forces as vectors before dividing by mass.',
          explain: t`$F_\text{net} = ${F1} - ${F2} = ${F1 - F2}$ N, so $a = ${F1 - F2}/${m} = ${nice((F1 - F2) / m)}\ \text{m/s}^2$ to the right.`,
          visual: { type: 'diagram', params: { kind: 'block', mass: m, forces: [{ dir: 0, label: `${F1} N`, size: 1 }, { dir: 180, label: `${F2} N`, size: F2 / F1 }] } },
        };
      },
    }),
    num({
      id: 'perpendicular', difficulty: 3,
      prompt: t`Two forces act on a 2.0 kg object: 3.0 N east and 4.0 N north. What is the magnitude of its acceleration?`,
      answer: 2.5, units: 'm/s^2', tol: { rel: 0.01 },
      errors: [{ value: 3.5, feedback: 'Perpendicular forces do not add like numbers: use the Pythagorean theorem.' }],
      hints: ['The forces are perpendicular — find the magnitude of their vector sum.', t`$|F_\text{net}| = \sqrt{3^2 + 4^2}$ N.`],
      teach: 'Newton’s second law is a vector equation: the acceleration points along the vector sum of the forces.',
      explain: t`$|F_\text{net}| = \sqrt{3.0^2 + 4.0^2} = 5.0$ N, so $a = 5.0/2.0 = 2.5\ \text{m/s}^2$, about 53° north of east.`,
      visual: bodyFBD([force('3.0 N east', 3, 0), force('4.0 N north', 4, 90)], { name: 'Forces on the object, seen from above', caption: 'Top view, forces to scale: east is to the right, north is up the page.' }),
    }),
    num({
      id: 'find-mass', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1.5, 2.5, 4]), m = r.int(3, 40), F = m * a;
        return {
          prompt: t`A net force of ${nice(F)} N gives an object an acceleration of ${a} m/s². What is its mass?`,
          answer: m, units: 'kg', tol: { rel: 0.005 },
          errors: [{ value: F * a, feedback: 'Solve F = ma for m: divide the force by the acceleration.' }],
          hints: ['Rearrange F = ma to isolate m.'],
          teach: 'Mass measures inertia: m = F_net / a.',
          explain: t`$m = F/a = ${nice(F)}/${a} = ${m}$ kg.`,
          visual: bodyFBD([force(`net force ${nice(F)} N`, F, 0)], { a: [a, 0], accel: true, name: 'The object', caption: 'The net force on the object and the acceleration it produces (gold). The mass is what you are finding.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([400, 500, 650, 800]), ratio = r.pick([1.4, 1.6, 1.8, 2.2]);
        const T = Math.round(m * G * ratio / 100) * 100;
        return {
          prompt: t`${m === 800 ? 'An' : 'A'} ${m} kg sounding rocket sits on the pad. Its motor produces ${T.toLocaleString('en-US')} N of thrust straight up. What is its acceleration just after ignition? ($g = 9.8\ \text{m/s}^2$; ignore the small mass of propellant burned so far.)`,
          answer: (T - m * G) / m, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: T / m, feedback: 'Gravity still acts: the net force is thrust minus weight.' }],
          hints: ['Draw two forces: thrust up and weight down.', t`$F_\text{net} = T - mg$; divide by $m$.`],
          teach: 'For a vertical launch, the net force is thrust minus weight.',
          explain: t`$a = (T - mg)/m = (${T} - ${fmt(m * G, 4)})/${m} = ${fmt((T - m * G) / m)}\ \text{m/s}^2$ upward.`,
          visual: bodyFBD([force('thrust', T, 90, 'thrust'), force('mg', m * G, 270, 'weight')], { icon: 'rocket', flame: true, ground: true, show: 'both', name: 'Forces on the rocket', caption: 'The rocket just after ignition and its free-body diagram, forces to scale. Once the thrust exceeds the weight, the pad no longer pushes on it.' }),
        };
      },
    }),
    mcq({
      id: 'cp-constant-v', difficulty: 2,
      prompt: 'A 2.0 kg box is pushed across a rough floor with a horizontal 10 N force and moves at constant velocity. What is the friction force on it?',
      choices: ['10 N, opposite the push', '0 N', '19.6 N', 'Less than 10 N, or it could not move'],
      answer: 0,
      why: { 1: 'If there were no friction, the 10 N push would accelerate the box.', 2: 'That is the box’s weight, not the friction force.', 3: 'Moving at constant velocity needs zero net force, not a surplus of force.' },
      hints: ['What does constant velocity tell you about the net force?'],
      teach: 'Constant velocity means the forces balance exactly.',
      explain: t`$a = 0$, so friction must equal the push: 10 N, opposite to it.`,
      visual: bodyFBD([], { icon: 'block', m: 2, show: 'picture', ground: true, v: [1, 0], agent: { dir: 0, kind: 'pole' }, caption: 'The 2.0 kg box pushed to the right with a steady 10 N, sliding at constant velocity across the rough floor.' }),
    }),
    num({
      id: 'cp-braking', difficulty: 2,
      gen(r) {
        const m = r.pick([1200, 1500, 1800]), v = r.pick([15, 20, 25]), tt = r.pick([3, 4, 5]);
        return {
          prompt: t`A ${m} kg car braking steadily goes from ${v} m/s to rest in ${tt} s. What is the magnitude of the net force on it?`,
          answer: m * v / tt, units: 'N', tol: { rel: 0.01 },
          hints: ['Find the acceleration first, then use F = ma.'],
          teach: 'Find the acceleration from the change in velocity, then multiply by mass.',
          explain: t`$a = ${v}/${tt} = ${nice(v / tt)}\ \text{m/s}^2$, so $F = ${m}\times${nice(v / tt)} = ${fmt(m * v / tt, 3)}$ N, opposite the motion.`,
          visual: bodyFBD([force('f (road)', (m * v) / tt, 180, 'friction'), force('N', m * G, 90, 'normal'), force('mg', m * G, 270, 'weight')], { icon: 'car', ground: true, v: [1, 0], show: 'both', name: 'Forces on the car', caption: 'The braking car (moving right) and its free-body diagram, forces to scale. The road’s friction on the tyres stops it; air drag is ignored.' }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §5.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law' }],
});
