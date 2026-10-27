// Newton's second law for rotation: net torque = moment of inertia × angular acceleration.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { G, RPM, wheel } from './_rotation.js';
import { seg } from './_momentum.js';
import { shapeAt } from './_spin.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (x) => +x.toFixed(4);

// a static drum with a hanging block, from the rotor simulation
const drum = (M, R, m, shape = 'disk', caption) => ({ type: 'mech-rotor', params: { shape, M, R, hang: m, values: false }, caption: caption ?? 'The drum seen along its axle (gold), with the block hanging from a light string wound round it.' });

export default lesson({
  id: 'phys2210.M10.5',
  title: 'Newton’s second law for rotation',
  minutes: 11, difficulty: 3,
  intro: t`For a body turning about a fixed axis, the net torque sets the angular acceleration:

$$\sum\tau = I\alpha$$

It is Newton’s second law dressed for rotation — **torque plays force, moment of inertia plays mass**. For one particle of mass $m$ pushed along its circle, $F = ma_t = mr\alpha$, so $\tau = rF = mr^2\alpha$; adding up the particles of a rigid body gives $I\alpha$. The same torque gives a body with more moment of inertia less angular acceleration. Many problems couple the two laws: a block hanging from a string wound round a drum obeys $mg - T = ma$, the drum obeys $TR = I\alpha$, and the string ties them together with $a = \alpha R$.`,
  symbols: [
    { tex: '\\textstyle\\sum\\tau', text: 'the net torque about the axis, in N·m: each torque with its sign (anticlockwise positive)' },
    { tex: 'I', text: 'the moment of inertia about that same axis, in kg·m²' },
    { tex: '\\alpha', text: 'the angular acceleration, in rad/s²' },
    { tex: 'T', text: 'in coupled problems, the tension in the string, in N' },
    { tex: 'a = \\alpha R', text: 'a string that does not slip on a drum of radius $R$ moves with the drum’s rim' },
  ],
  why: 'Torque and moment of inertia decide how fast anything spins up or down — engines, wheels, pulleys, and the reaction wheels that turn a space telescope toward its next target.',
  visual: {
    type: 'mech-rotor',
    title: 'A falling block spins a drum',
    lead: t`A block hangs from a light string wound round a drum that turns on a frictionless axle. Press **Play**: the string’s tension both slows the block’s fall and spins the drum. Change the drum’s mass, size and shape, and the block’s mass.`,
    tasks: [
      'Switch the drum from a solid disk to a ring of the same mass: its moment of inertia doubles and the block falls more slowly.',
      'Make the drum very light: the block falls almost freely (a → 9.8 m/s²) and the string tension drops toward zero.',
      'Compare the tension with the block’s weight in the readout: while the block accelerates downward, the string always pulls up less than mg.',
    ],
    params: { shape: 'disk', shapes: ['disk', 'ring'], M: 4, R: 0.2, hang: 2, plot: 'omega', sliders: ['M', { key: 'R', max: 0.4 }, 'hang'] },
  },
  example: {
    prompt: t`A 2.0 kg block hangs from a light string wound round a solid disk of mass 4.0 kg and radius 0.20 m, free to turn on a frictionless axle. Find the block’s acceleration, the disk’s angular acceleration and the string’s tension.`,
    visual: drum(4, 0.2, 2),
    steps: [
      { label: 'Block', text: t`Take down as positive: $mg - T = ma$.` },
      { label: 'Drum', text: t`The tension pulls tangentially at radius $R$: $TR = I\alpha$, with $I = \tfrac12 MR^2$.` },
      { label: 'Link them', text: t`The string does not slip, so $a = \alpha R$. Then $T = \dfrac{I\alpha}{R} = \dfrac{I}{R^2}a = \tfrac12 Ma$.` },
      { label: 'Solve', text: t`$mg - \tfrac12 Ma = ma \Rightarrow a = \dfrac{mg}{m + \tfrac12 M} = \dfrac{(2.0)(9.8)}{2.0 + 2.0} = 4.9\ \text{m/s}^2$. So $\alpha = a/R = 24.5\ \text{rad/s}^2$ and $T = \tfrac12 Ma = 9.8$ N.` },
      { label: 'Sense check', text: t`$a < g$ and $T < mg = 19.6$ N, as they must be. If the disk were massless, $a = g$ and $T = 0$: nothing would resist the fall. The drum’s moment of inertia acts like an extra mass $I/R^2$ to be dragged along.` },
    ],
    answer: t`$a = 4.9\ \text{m/s}^2$, $\alpha = 24.5\ \text{rad/s}^2$, $T = 9.8$ N.`,
  },
  practice: [
    num({
      id: 'alpha', difficulty: 1,
      gen(r) {
        const F = r.pick([10, 15, 20, 30]), M = r.pick([4, 5, 8]), R = r.pick([0.2, 0.25, 0.5]);
        const I = 0.5 * M * R * R, tau = F * R, a = tau / I;
        return {
          prompt: t`A tangential force of ${F} N is applied to the rim of a solid disk of mass ${M} kg and radius ${R} m, free to turn about its axle. What is the disk’s angular acceleration?`,
          answer: a, units: 'rad/s^2', tol: { rel: 0.01 },
          errors: [
            { value: tau / (M * R * R), feedback: 'A solid disk has I = ½MR², not MR².' },
            { value: F / M, feedback: 'That is a linear acceleration, F/m. For rotation, divide the torque by the moment of inertia.' },
          ],
          hints: [t`Torque: $\tau = FR$. Moment of inertia: $I = \tfrac12 MR^2$.`, t`$\alpha = \tau/I$.`],
          teach: 'Angular acceleration is net torque divided by moment of inertia.',
          explain: t`$\tau = (${F})(${R}) = ${nice(tau)}$ N·m, $I = \tfrac12(${M})(${R})^2 = ${s3(I)}\ \text{kg·m}^2$, so $\alpha = ${s3(a)}\ \text{rad/s}^2$.`,
          visual: { type: 'mech-rotor', params: { shape: 'disk', M, R, F, rF: R, phi: 90, values: true, lever: false }, caption: 'The disk seen along its axle, with the tangential force at its rim.' },
        };
      },
    }),
    num({
      id: 'spin-up', difficulty: 2,
      gen(r) {
        const I = r.pick([0.02, 0.05, 0.08]), tau = r.pick([0.05, 0.1, 0.2]), N = r.pick([1500, 3000, 6000]);
        const w = N * RPM, tt = (I * w) / tau;
        return {
          prompt: t`A satellite’s reaction wheel has a moment of inertia of ${I} kg·m². Its motor applies a steady torque of ${tau} N·m. How long does it take to spin the wheel up from rest to ${N.toLocaleString('en-US')} rpm? (Ignore friction.)`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: (I * N) / tau, feedback: 'Convert rpm to rad/s first (× 2π/60).' },
            { value: (tau * w) / I, feedback: 'The time is ω/α, with α = τ/I: t = Iω/τ.' },
          ],
          hints: [t`$\alpha = \tau/I$; then $\omega = \alpha t$.`, t`$t = \dfrac{I\omega}{\tau}$ with $\omega$ in rad/s.`],
          teach: 'Constant torque gives constant α = τ/I, so the spin-up time is Iω/τ.',
          explain: t`$\omega = ${s3(w)}$ rad/s, $\alpha = ${tau}/${I} = ${s3(tau / I)}\ \text{rad/s}^2$, so $t = \omega/\alpha = ${s3(tt)}$ s.`,
          visual: wheel({ R: 1, caption: 'The reaction wheel seen along its axle (a sketch).' }),
        };
      },
    }),
    num({
      id: 'hang', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), M = r.pick([2, 3, 4]), R = r.pick([0.1, 0.15, 0.2]);
        const a = (m * G) / (m + 0.5 * M);
        return {
          prompt: t`A ${m} kg block hangs from a light string wound round a ${M} kg solid-disk pulley of radius ${R} m on a frictionless axle. The block is released. What is its acceleration? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: G, feedback: 'That would be free fall: the drum’s moment of inertia resists, through the string’s tension.' },
            { value: (m * G) / (m + M), feedback: 'The drum is not dragged along like a mass M: its rotation counts as I/R² = ½M.' },
          ],
          hints: [t`Block: $mg - T = ma$. Drum: $TR = I\alpha = \tfrac12 MR^2\cdot\dfrac aR$.`, t`So $T = \tfrac12 Ma$; substitute into the block’s equation.`, t`$a = \dfrac{mg}{m + \tfrac12 M}$ — the radius cancels.`],
          teach: 'For a block on a drum, a = mg/(m + I/R²): the drum behaves like an extra mass I/R².',
          explain: t`$a = \dfrac{(${m})(9.8)}{${m} + \tfrac12(${M})} = ${s3(a)}\ \text{m/s}^2$. The radius cancels for a solid disk: a bigger drum has more $I$, but the string also pulls with a longer lever arm.`,
          visual: drum(M, R, m),
        };
      },
    }),
    mcq({
      id: 'tension', difficulty: 2,
      prompt: 'A block hangs from a string wound round a heavy drum. Released, the block accelerates downward while the drum spins up. Compared with the block’s weight mg, the string’s tension is…',
      choices: ['less than mg', 'equal to mg, because the string holds the block', 'greater than mg, because it must spin the drum as well', 'zero, because the block is falling'],
      answer: 0,
      why: {
        1: 'If T equalled mg the net force on the block would be zero and it could not accelerate.',
        2: 'The string pulls the block up; if T exceeded mg the block would accelerate upward.',
        3: 'A falling block on a massless drum would have T = 0, but a heavy drum resists being spun up, so the string stays taut.',
      },
      hints: ['Apply Newton’s second law to the block alone: which way is its acceleration?', 'mg − T = ma with a > 0 (down).'],
      teach: 'If a hanging mass accelerates downward, the string must pull up with less than its weight.',
      explain: t`$mg - T = ma > 0$, so $T < mg$. But $T > 0$: the drum resists spinning up ($TR = I\alpha$), so the string stays tight. Only a massless drum would let the block fall freely with $T = 0$.`,
      visual: drum(4, 0.2, 2),
    }),
    mcq({
      id: 'same-torque', difficulty: 1,
      prompt: 'The same torque is applied to a thin hoop and to a solid disk of equal mass and radius, both starting from rest. Which reaches 100 rpm first?',
      choices: ['The disk', 'The hoop', 'They arrive together: same torque, same mass', 'The hoop, because its mass is farther out where the torque acts'],
      answer: 0,
      why: {
        1: 'The hoop has twice the moment of inertia, so the same torque gives it half the angular acceleration.',
        2: 'Mass alone does not decide rotation: the moment of inertia does, and it depends on where the mass is.',
        3: 'Mass far out makes a body harder to spin, not easier.',
      },
      hints: [t`$\alpha = \tau/I$. Which has the smaller $I$?`],
      teach: 'For a given torque, the body with the smaller moment of inertia spins up faster.',
      explain: t`$I_\text{disk} = \tfrac12 MR^2$ is half of $I_\text{hoop} = MR^2$, so with the same torque the disk’s $\alpha$ is twice the hoop’s: it reaches 100 rpm in half the time.`,
      visual: (() => {
        const A = shapeAt('hoop', -1.5, 0, 1), B = shapeAt('disk', 1.5, 0, 1);
        return { type: 'graph', params: { x: [-2.9, 2.9], y: [-1.3, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [...A.curves, ...B.curves], shade: [...A.shade, ...B.shade], points: [...A.points, ...B.points, { x: -1.5, y: 1.3, r: 0.01, color: 'ink2', label: 'hoop', labelDx: -14 }, { x: 1.5, y: 1.3, r: 0.01, color: 'ink2', label: 'disk', labelDx: -12 }] }, caption: 'Equal mass and radius; the same torque on each.' };
      })(),
    }),
    num({
      id: 'brake', difficulty: 2,
      gen(r) {
        const M = r.pick([6, 8, 10]), R = r.pick([0.15, 0.2]), N = r.pick([600, 900, 1200]), f = r.pick([15, 20, 30]);
        const I = 0.5 * M * R * R, w = N * RPM, tt = (I * w) / (f * R);
        return {
          prompt: t`A ${M} kg solid disk of radius ${R} m spins at ${N} rpm. A brake pad presses on its rim, giving a friction force of ${f} N tangent to the rim. How long does it take to stop?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: (I * w) / f, feedback: 'The friction force acts at the rim: its torque is f R.' },
            { value: (I * N) / (f * R), feedback: 'Convert rpm to rad/s first.' },
          ],
          hints: [t`Braking torque $\tau = fR$; $I = \tfrac12 MR^2$; so $\alpha = \tau/I$.`, t`Time to stop: $t = \omega_0/\alpha$, with $\omega_0$ in rad/s.`],
          teach: 'A braking torque gives a constant deceleration α = τ/I; the stopping time is ω₀/α.',
          explain: t`$\tau = ${f}\times${R} = ${nice(f * R)}$ N·m; $I = ${s3(I)}\ \text{kg·m}^2$; $\alpha = ${s3((f * R) / I)}\ \text{rad/s}^2$; $\omega_0 = ${s3(w)}$ rad/s; $t = ${s3(tt)}$ s.`,
          visual: { type: 'mech-rotor', params: { shape: 'disk', M, R, omega0: 3, F: f, rF: R, phi: -90, values: true, lever: false, flabels: ['friction'] }, caption: 'The spinning disk (green arrow: its rotation) and the brake’s friction force on its rim, opposing the spin.' },
        };
      },
    }),
    num({
      id: 'thrusters', difficulty: 3,
      gen(r) {
        const M = r.pick([400, 600, 900]), R = r.pick([0.8, 1.0, 1.2]), F = r.pick([5, 10, 20]), N = r.pick([5, 10, 15]);
        const I = 0.5 * M * R * R, tau = 2 * F * R, w = N * RPM, tt = (I * w) / tau;
        return {
          prompt: t`A cylindrical satellite (a solid cylinder of mass ${M} kg and radius ${R} m) is spun up about its axis by two thrusters on opposite sides of its rim, each pushing ${F} N tangentially, in opposite directions. How long do they need to fire to spin it from rest to ${N} rpm?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: (I * w) / (F * R), feedback: 'Both thrusters turn it the same way: the torque is 2FR.' },
            { value: (M * R * R * w) / tau, feedback: 'A solid cylinder about its axis has I = ½MR².' },
          ],
          hints: [t`The thrusters form a couple: $\tau = 2FR$. A solid cylinder: $I = \tfrac12 MR^2$.`, t`$\alpha = \tau/I$, then $t = \omega/\alpha$ with $\omega$ in rad/s.`],
          teach: 'A couple of thrusters gives torque 2FR; the time to reach a spin rate is Iω/τ.',
          explain: t`$I = \tfrac12(${M})(${R})^2 = ${s3(I)}\ \text{kg·m}^2$; $\tau = 2(${F})(${R}) = ${nice(tau)}$ N·m; $\omega = ${s3(w)}$ rad/s; $t = I\omega/\tau = ${s3(tt)}$ s.`,
          visual: { type: 'mech-rotor', params: { shape: 'disk', M, R, F, rF: R, phi: 90, F2: F, rF2: -R, phi2: 90, values: true, lever: false, flabels: ['thruster', 'thruster'] }, caption: 'The satellite seen along its spin axis, with the two thruster forces.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-atwood', difficulty: 3,
      gen(r) {
        const m1 = r.pick([3, 4, 5]), m2 = r.pick([1, 2]), M = r.pick([2, 4]), R = 0.1;
        const a = ((m1 - m2) * G) / (m1 + m2 + 0.5 * M);
        return {
          prompt: t`An Atwood machine: blocks of ${m1} kg and ${m2} kg hang on either side of a string over a pulley, a solid disk of mass ${M} kg and radius 10 cm on a frictionless axle. The string does not slip. What is the blocks’ acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: ((m1 - m2) * G) / (m1 + m2), feedback: 'That ignores the pulley. Its rotation adds I/R² = ½M to the mass being accelerated.' },
            { value: ((m1 - m2) * G) / (m1 + m2 + M), feedback: 'A solid-disk pulley counts as I/R² = ½M, not its whole mass.' },
          ],
          hints: ['The two string tensions differ now: T₁ on the heavy side, T₂ on the light side.', t`Blocks: $m_1g - T_1 = m_1a$, $T_2 - m_2g = m_2a$. Pulley: $(T_1 - T_2)R = \tfrac12 MR^2\cdot\dfrac aR$.`, t`Add all three: $a = \dfrac{(m_1 - m_2)g}{m_1 + m_2 + \tfrac12 M}$.`],
          teach: 'A massive pulley needs a net torque, so the tensions on its two sides differ; it adds I/R² to the inertia.',
          explain: t`$a = \dfrac{(${m1} - ${m2})(9.8)}{${m1} + ${m2} + \tfrac12(${M})} = ${s3(a)}\ \text{m/s}^2$. With a massless pulley it would be ${s3(((m1 - m2) * G) / (m1 + m2))} m/s².`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.2, 1.2], y: [-2.2, 0.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: ['0.4*cos(t)', '0.4*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2 }, seg([-0.4, 0], [-0.4, -1.5], 'ink2', 1.4), seg([0.4, 0], [0.4, -1.0], 'ink2', 1.4), seg([0, 0], [0, 0.5], 'ink3', 2)],
              shade: [{ fn: '0.4*sqrt(max(0, 1 - (x/0.4)^2))', lower: '-0.4*sqrt(max(0, 1 - (x/0.4)^2))', from: -0.4, to: 0.4, color: 'accent', alpha: 0.25 }, { fn: '-1.5', lower: '-1.95', from: -0.62, to: -0.18, color: 'violet', alpha: 0.85 }, { fn: '-1.0', lower: '-1.3', from: 0.25, to: 0.55, color: 'good', alpha: 0.85 }],
              points: [{ x: 0, y: 0, r: 4, color: 'gold' }, { x: -0.62, y: -1.72, r: 0.01, color: 'violet', label: `${m1} kg`, labelDx: -46 }, { x: 0.55, y: -1.15, r: 0.01, color: 'good', label: `${m2} kg` }],
            },
            caption: 'The Atwood machine: a solid-disk pulley turning on a fixed axle (gold). A sketch.',
          },
        };
      },
    }),
    num({
      id: 'cp-wheel', difficulty: 3, transfer: true,
      gen(r) {
        const Iw = r.pick([0.05, 0.08, 0.1]), N = r.pick([1500, 2000, 3000]), T = r.pick([10, 20, 30]), Is = r.pick([200, 400, 800]);
        const tw = (Iw * N * RPM) / T, as = tw / Is;
        return {
          prompt: t`A space telescope turns using a reaction wheel. The wheel (moment of inertia ${Iw} kg·m²) is spun up steadily by its motor from rest to ${N.toLocaleString('en-US')} rpm in ${T} s. By Newton’s third law, the motor twists the telescope the other way with an equal torque. If the telescope’s moment of inertia about the same axis is ${Is} kg·m², what is its angular acceleration?`,
          answer: as, units: 'rad/s^2', tol: { rel: 0.01 },
          errors: [
            { value: (N * RPM) / T, feedback: 'That is the wheel’s angular acceleration. The telescope, far heavier to turn, gets I_w α_w / I_s.' },
            { value: (Iw * N) / T / Is, feedback: 'Convert rpm to rad/s first.' },
          ],
          hints: [t`The wheel’s angular acceleration: $\alpha_w = \omega/t$. The torque on it: $\tau = I_w\alpha_w$.`, t`The telescope feels $-\tau$: $\alpha_s = \tau/I_s$.`],
          teach: 'A reaction wheel turns a spacecraft by pushing back on it: the torque spinning the wheel up twists the craft the other way.',
          explain: t`$\alpha_w = ${s3(N * RPM)}/${T} = ${s3((N * RPM) / T)}\ \text{rad/s}^2$; $\tau = I_w\alpha_w = ${s3(tw)}$ N·m; $\alpha_s = \tau/I_s = ${s3(as)}\ \text{rad/s}^2$, opposite to the wheel. No propellant is spent: that is why telescopes like Hubble point with wheels, not thrusters.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 1.6], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              shade: [{ fn: '1', lower: '-1', from: -1, to: 1, color: 'ink3', alpha: 0.35 }, { fn: 'sqrt(max(0, 0.16 - x^2))', lower: '-sqrt(max(0, 0.16 - x^2))', from: -0.4, to: 0.4, color: 'accent', alpha: 0.6 }],
              curves: [
                seg([-1, -1], [1, -1], 'ink2', 1.6), seg([1, -1], [1, 1], 'ink2', 1.6), seg([1, 1], [-1, 1], 'ink2', 1.6), seg([-1, 1], [-1, -1], 'ink2', 1.6),
                { param: ['0.55*cos(t)', '0.55*sin(t)'], t: [0.3, 2.6], color: 'accent', width: 2 },
                { param: ['1.25*cos(t)', '1.25*sin(t)'], t: [-0.4, -2.2], color: 'violet', width: 2 },
              ],
              arrows: [{ from: [r4(0.55 * Math.cos(2.45)), r4(0.55 * Math.sin(2.45))], to: [r4(0.55 * Math.cos(2.65)), r4(0.55 * Math.sin(2.65))], color: 'accent', label: 'wheel', labelDx: -46 }, { from: [r4(1.25 * Math.cos(-2.05)), r4(1.25 * Math.sin(-2.05))], to: [r4(1.25 * Math.cos(-2.25)), r4(1.25 * Math.sin(-2.25))], color: 'violet', label: 'telescope', labelDx: -70, labelDy: 8 }],
            },
            caption: 'The telescope (grey) and its reaction wheel (blue), seen along the wheel’s axle: the wheel spins up one way, the telescope turns the other. A sketch.',
          },
        };
      },
    }),
    match({
      id: 'cp-analogy', difficulty: 2,
      prompt: t`Newton’s second law for rotation, $\sum\tau = I\alpha$, mirrors $\sum F = ma$. Match each linear quantity with its rotational partner.`,
      left: [t`force $F$`, t`mass $m$`, t`acceleration $a$`, t`velocity $v$`],
      right: ['torque τ', 'moment of inertia I', 'angular acceleration α', 'angular velocity ω', 'lever arm r⊥'],
      answer: [0, 1, 2, 3],
      hints: ['Line the two equations up term by term.', 'The lever arm is part of the torque, not a partner of its own.'],
      teach: 'Torque is to rotation what force is to translation, and moment of inertia what mass is.',
      explain: t`$\tau \leftrightarrow F$, $I \leftrightarrow m$, $\alpha \leftrightarrow a$, $\omega \leftrightarrow v$ — with the twist that $I$, unlike $m$, depends on the axis.`,
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §10.7 Newton’s second law for rotation', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-7-newtons-second-law-for-rotation' }],
});
