// Tension, ropes and pulleys: a rope pulls along itself, the same all along; pulleys redirect it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, t3, sin, cos, tan } from './_forces.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M5.6',
  title: 'Tension, ropes and pulleys',
  minutes: 10, difficulty: 2,
  intro: t`A rope can only **pull**, and only along its own length. Its pull is the **tension** $T$. In an ideal rope — massless and unstretchable — the tension is the same all along it, and an ideal pulley (massless, frictionless) turns the rope without changing its tension. Ropes at an angle share a load unevenly and wastefully: a mass hanging from the middle of a rope whose two halves each rise at θ above the horizontal needs, in each half,

$$T = \frac{mg}{2\sin\theta}$$

which grows without limit as the rope flattens. That is why a washing line can never be pulled perfectly straight — and why a block and tackle, with $n$ rope segments holding the load, lifts it with a pull of only $mg/n$.`,
  symbols: [
    { tex: 'T', text: 'tension: the pull of a rope along its length, in newtons; the same everywhere in an ideal rope' },
    { tex: 'm', text: 'the hanging mass, in kg; $mg$ is its weight, in N' },
    { tex: '\\theta', text: 'the angle each half of the rope makes **above the horizontal** (measured from the vertical, sin would become cos)' },
    { tex: '2\\sin\\theta', text: 'each half pulls up with $T\\sin\\theta$; together the two must supply $mg$' },
    { tex: 'g', text: '9.8 m/s² near Earth’s surface' },
  ],
  why: 'Tension carries forces around corners and across distances: in elevators and cranes, in parachute rigging, and in the tethers and cables of spacecraft.',
  visual: {
    type: 'mech-fbd',
    title: 'Two ropes sharing a load',
    lead: t`A mass hangs from two ropes. The diagram shows the three forces on it. Switch on **Add the forces tip to tail**: they close into a triangle, because the mass is in equilibrium.`,
    tasks: [
      'Make the two angles equal and lower them toward 5°: the tensions soar past the weight — about 5.7 mg each at 5°.',
      'Set rope 2 to 0°, a sideways pull: rope 1 must now hold up all the weight and balance the pull as well.',
      'Make rope 1 vertical (90°): rope 2 goes slack, whatever its angle.',
    ],
    params: { scene: 'hang', m: 10, th1: 40, th2: 40, values: true, sliders: ['th1', 'th2', 'm'], toggles: ['sum', 'values'], names: ['Forces on the mass'] },
    caption: t`Ideal ropes, forces to one scale. Angles are measured up from the horizontal. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A 15 kg sign hangs from two cables: the left one rises at 30° above the horizontal, the right one at 60°. Find the tension in each cable.`,
    visual: scene('hang', { m: 15, th1: 30, th2: 60, values: true, names: ['Forces on the sign'] }, 'The sign, its two cables and its free-body diagram, to scale.'),
    steps: [
      { label: 'Free-body diagram', text: t`Three forces on the sign: $T_1$ up and to the left at 30°, $T_2$ up and to the right at 60°, and the weight $mg = (15)(9.8) = 147$ N. It hangs still, so they add to zero.` },
      { label: 'Horizontal', text: t`$T_1\cos 30^\circ = T_2\cos 60^\circ$, so $T_2 = T_1\,\dfrac{\cos 30^\circ}{\cos 60^\circ} = 1.732\,T_1$.` },
      { label: 'Vertical', text: t`$T_1\sin 30^\circ + T_2\sin 60^\circ = 147$ N, so $T_1(0.500 + 1.732\times0.866) = 2.00\,T_1 = 147$ N.` },
      { label: 'Solve', text: t`$T_1 = 73.5$ N and $T_2 = 1.732\times73.5 = 127$ N.` },
      { label: 'Sense check', text: t`The steeper cable carries more. Together they pull with $73.5 + 127 = 201$ N to hold up 147 N — their sideways parts cancel and are wasted.` },
    ],
    answer: t`$T_1 = 73.5$ N (the 30° cable) and $T_2 = 127$ N (the 60° cable).`,
  },
  practice: [
    mcq({
      id: 'tug-scale', difficulty: 1,
      prompt: 'Two people pull on opposite ends of a rope, with a spring scale tied into the middle. Each pulls with 200 N, and nothing moves. What does the scale read?',
      visual: bodyFBD([force('T', 200, 180, 'tension'), force('T', 200, 0, 'tension')], { values: true, name: 'Forces on the spring scale', caption: 'The scale is pulled from both ends. To scale.' }),
      choices: ['200 N', '400 N', '0 N', '100 N'],
      answer: 0,
      why: {
        1: 'The two pulls do not add: one end simply holds the scale still, as a hook in a wall would. The rope’s tension is 200 N.',
        2: 'The forces on the scale cancel, so it does not accelerate — but it is still stretched by a 200 N pull.',
        3: 'Nothing halves the pull: each end of the scale is pulled with the full 200 N.',
      },
      hints: ['What would the scale read if one end were tied to a wall instead of a person?'],
      teach: 'A scale in a rope reads the rope’s tension: the pull at either end, not the sum of both.',
      explain: 'The tension in the rope is 200 N everywhere. A scale hooked to a wall and pulled with 200 N reads 200 N; the second person just plays the part of the wall.',
    }),
    num({
      id: 'crane-lift', difficulty: 1,
      gen(r) {
        const m = r.pick([300, 450, 600, 800]), a = r.pick([0.5, 0.8, 1.2, 1.5]);
        const T = m * (G + a);
        return {
          prompt: t`A crane’s single vertical cable lifts a ${m} kg pallet, speeding it up at ${a} m/s². What is the tension in the cable?`,
          visual: scene('hang', { ropes: 1, m, a, ask: ['T'], names: ['Forces on the pallet'] }, 'The pallet on its cable, accelerating upward (gold), and its free-body diagram.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'That would hold the pallet still or lift it at constant speed. Speeding up needs more.' },
            { value: m * (G - a), feedback: 'The acceleration is upward, so the cable must pull harder than the weight, not less.' },
            { value: m * a, feedback: 'That is only the net force. The cable must also hold up the weight.' },
          ],
          hints: [t`Second law, up positive: $T - mg = ma$.`],
          teach: 'A rope accelerating its load upward pulls with more than the weight: T = m(g + a).',
          explain: t`$T = m(g + a) = ${m}(9.8 + ${a}) = ${t3(T)}$ N.`,
        };
      },
    }),
    num({
      id: 'symmetric', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 4, 5, 6]), th = r.pick([10, 15, 20, 25, 30]);
        const T = (m * G) / (2 * sin(th));
        return {
          prompt: t`A ${m} kg lamp hangs from the middle of a wire. Each half of the wire rises at ${th}° above the horizontal. What is the tension in the wire?`,
          visual: scene('hang', { m, th1: th, th2: th, ask: ['T1', 'T2'], names: ['Forces on the lamp'] }, 'The lamp, the wire and its free-body diagram, to scale.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: (m * G) / 2, feedback: 'Only the vertical part of each tension holds the lamp up: divide by 2 sin θ, not 2.' },
            { value: (m * G) / (2 * cos(th)), feedback: t`θ is measured from the horizontal, so the upward part of each tension is $T\sin\theta$.` },
            { value: (m * G) / sin(th), feedback: 'There are two halves of the wire, each pulling up.' },
          ],
          hints: ['The lamp hangs still: the two upward components must add up to the weight.', t`$2T\sin ${th}^\circ = mg$.`],
          teach: 'For a symmetric hang, 2T sin θ = mg: the shallower the wire, the larger the tension.',
          explain: t`$T = \dfrac{mg}{2\sin\theta} = \dfrac{(${m})(9.8)}{2\sin ${th}^\circ} = ${s3(T)}$ N — ${s3(T / (m * G))} times the lamp’s weight.`,
        };
      },
    }),
    num({
      id: 'two-angles', difficulty: 2,
      gen(r) {
        const m = r.pick([8, 10, 12, 20]), a1 = r.pick([25, 30, 35, 40]), a2 = r.pick([50, 55, 60, 65]);
        const W = m * G, s = sin(a1 + a2), T1 = (W * cos(a2)) / s, T2 = (W * cos(a1)) / s;
        return {
          prompt: t`A ${m} kg bird feeder hangs from two cords. The left cord rises at ${a1}° above the horizontal and the right one at ${a2}°. What is the tension in the right cord?`,
          visual: scene('hang', { m, th1: a1, th2: a2, ask: ['T2'], names: ['Forces on the feeder'] }, 'The feeder and its free-body diagram, to scale.'),
          answer: T2, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: T1, feedback: 'That is the tension in the left cord. The steeper cord carries more.' },
            { value: W / 2, feedback: 'The cords are not symmetric and not vertical: solve the two component equations.' },
          ],
          hints: [t`Horizontal: $T_1\cos ${a1}^\circ = T_2\cos ${a2}^\circ$. Vertical: $T_1\sin ${a1}^\circ + T_2\sin ${a2}^\circ = mg$.`, t`Eliminate $T_1$: $T_2 = \dfrac{mg\cos ${a1}^\circ}{\sin(${a1}^\circ + ${a2}^\circ)}$.`],
          teach: 'Two ropes at different angles: write one equation per direction and solve them together.',
          explain: t`$T_2 = \dfrac{mg\cos ${a1}^\circ}{\sin ${a1 + a2}^\circ} = ${s3(T2)}$ N and $T_1 = \dfrac{mg\cos ${a2}^\circ}{\sin ${a1 + a2}^\circ} = ${s3(T1)}$ N; the weight is ${s3(W)} N.`,
        };
      },
    }),
    mcq({
      id: 'fixed-pulley', difficulty: 2,
      prompt: 'You lift a 20 kg bucket at constant speed with a rope that runs from the bucket up over a single fixed pulley at the ceiling and down to your hands. How hard must you pull?',
      visual: scene('pulley', { n: 1, m: 20, show: 'picture', quiet: true }, 'A single fixed pulley: the rope runs from the load, over the pulley, down to your hand.'),
      choices: [t`$mg = 196$ N`, t`$mg/2 = 98$ N — the pulley halves the load`, t`$2mg = 392$ N — the pulley doubles it`, t`Less than $mg$, if you pull at an angle`],
      answer: 0,
      why: {
        1: 'A fixed pulley only turns the rope. Halving the pull needs a movable pulley, with two rope segments holding the load.',
        2: 'The pulley’s axle does carry 2mg, but the rope’s tension — your pull — is just mg.',
        3: 'An ideal pulley passes the same tension whatever the angle you pull at.',
      },
      hints: ['One rope segment holds the bucket. What tension does it need at constant speed?'],
      teach: 'A fixed pulley changes the direction of a pull, never its size.',
      explain: 'One rope segment supports the bucket, so at constant speed its tension is mg = 196 N, and an ideal pulley passes that same tension to your hands. The convenience is pulling down instead of up.',
    }),
    num({
      id: 'tackle', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]), m = r.pick([40, 60, 80, 100]);
        const T = (m * G) / n;
        return {
          prompt: t`A block and tackle has ${n} rope segments holding the lower pulley block, which carries a ${m} kg load. Ignoring friction and the pulleys’ mass, how hard must you pull to raise the load at constant speed?`,
          visual: scene('pulley', { n, m, names: ['Forces on the load'] }, `${n} segments of one rope hold the load; each pulls up with the same tension T.`),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: `${n} segments share the load, and each carries the same tension as the end you pull.` },
            { value: m * G * n, feedback: 'The segments help you: they share the weight, so each carries less, not more.' },
          ],
          hints: [`Draw the load and its pulley block as one body: ${n} rope segments pull up on it.`, t`$${n}T = mg$ at constant speed.`],
          teach: 'With n rope segments holding a load, an ideal tackle needs only mg/n.',
          explain: t`$${n}T = mg$, so $T = (${m})(9.8)/${n} = ${s3(T)}$ N — the pull at your hand.`,
        };
      },
    }),
    num({
      id: 'pulled-aside', difficulty: 3,
      gen(r) {
        const m = r.pick([4, 5, 6, 8]), th = r.pick([15, 20, 25, 30, 35]);
        const F = m * G * tan(th);
        return {
          prompt: t`A ${m} kg lantern hangs from a rope. A horizontal pull holds it aside so that the rope makes ${th}° with the **vertical**. How large is the horizontal pull?`,
          visual: scene('hang', { m, th1: 90 - th, th2: 0, labels: { T2: 'F' }, ask: ['T2'], names: ['Forces on the lantern'] }, `The rope at ${th}° from the vertical (${90 - th}° above the horizontal), held aside by a horizontal pull.`),
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G * sin(th), feedback: t`Divide the two component equations: $F/mg = \tan\theta$, not $\sin\theta$.` },
            { value: (m * G) / tan(th), feedback: 'Check which angle you used: θ is measured from the vertical here.' },
            { value: m * G * cos(th), feedback: t`$F = T\sin\theta$ and $mg = T\cos\theta$, so $F = mg\tan\theta$.` },
          ],
          hints: ['Three forces: rope tension (tilted θ from the vertical), the horizontal pull F, and the weight.', t`Vertical: $T\cos\theta = mg$. Horizontal: $T\sin\theta = F$. Divide.`],
          teach: 'Holding a hanging mass aside: F = mg tan θ, with θ the rope’s angle from the vertical.',
          explain: t`$T\cos\theta = mg$ and $T\sin\theta = F$ give $F = mg\tan\theta = (${m})(9.8)\tan ${th}^\circ = ${s3(F)}$ N; the rope pulls with $T = mg/\cos\theta = ${s3((m * G) / cos(th))}$ N.`,
        };
      },
    }),
    mcq({
      id: 'clothesline', difficulty: 2,
      prompt: 'A sock hangs from the middle of a washing line. Could you pull the line hard enough to make it perfectly straight?',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 90], y: [0, 7], xlabel: 'angle above the horizontal, θ (°)', ylabel: 'T / mg', xticks: 9, yticks: 7,
          curves: [{ fn: '1/(2*sin(x*pi/180))', domain: [4.1, 90], color: 'accent', label: 'T = mg / (2 sin θ)', labelAt: 40, labelDy: -16 }],
          points: [{ x: 5, y: 1 / (2 * Math.sin((5 * Math.PI) / 180)), color: 'warn', label: '5°: 5.7 mg' }, { x: 30, y: 1, color: 'warn', label: '30°: mg' }, { x: 60, y: 1 / (2 * Math.sin(Math.PI / 3)), color: 'warn', label: '60°: 0.58 mg' }],
        },
        caption: 'Tension in each half of the line, in units of the sock’s weight, against the angle each half makes with the horizontal.',
      },
      choices: ['No: a straight line has no upward component to hold the sock, so the tension would have to be infinite', 'Yes, if you pull hard enough', 'Yes, because a sock is so light', 'No, because a rope always stretches a little'],
      answer: 0,
      why: {
        1: 'Pulling harder flattens the line, but never completely: at θ = 0 the two halves pull only sideways.',
        2: 'Even a light sock needs some upward force, and a flat line provides none.',
        3: 'Stretch is real but not the reason: even an unstretchable line could not be straight.',
      },
      hints: [t`Each half supplies $T\sin\theta$ upward. What happens as $\theta \to 0$?`],
      teach: 'As a supporting rope flattens, the tension needed grows without bound: T = mg/(2 sin θ).',
      explain: t`$T = mg/(2\sin\theta)$ grows without limit as $\theta \to 0$. In practice the line sags just enough that the tension you apply balances the weight.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stage-lift', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([3500, 4000, 4500]), th = r.pick([50, 55, 60, 65]), a = r.pick([0.3, 0.5, 0.8]);
        const T = (M * (G + a)) / (2 * sin(th));
        return {
          prompt: t`A crane lifts a ${t3(M)} kg rocket upper stage with a two-leg sling. Each leg rises at ${th}° above the horizontal, and the crane speeds the stage up at ${a} m/s². What is the tension in each leg?`,
          visual: scene('hang', { m: M, th1: th, th2: th, a, ask: ['T1', 'T2'], names: ['Forces on the stage'] }, 'The stage on its sling, accelerating upward (gold), and its free-body diagram.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: (M * (G + a)) / 2, feedback: 'Each leg is slanted: only its vertical part, T sin θ, helps lift.' },
            { value: (M * G) / (2 * sin(th)), feedback: 'The stage is accelerating upward, so the legs must supply m(g + a), not just mg.' },
            { value: (M * (G + a)) / (2 * cos(th)), feedback: t`θ is measured from the horizontal, so each leg’s upward part is $T\sin\theta$.` },
          ],
          hints: ['Vertical second law for the stage: the two legs’ upward components minus the weight equals ma.', t`$2T\sin\theta - mg = ma$.`],
          teach: 'For an accelerating, symmetric sling: 2T sin θ = m(g + a).',
          explain: t`$T = \dfrac{m(g + a)}{2\sin\theta} = \dfrac{${M}\,(9.8 + ${a})}{2\sin ${th}^\circ} = ${t3(T)}$ N in each leg.`,
        };
      },
    }),
    mcq({
      id: 'cp-redirect', difficulty: 2,
      prompt: 'A rope passes over an ideal (massless, frictionless) pulley. On one side it holds a 10 kg mass still; you hold the other end, pulling at an angle of 40° from the vertical. What is the tension in your end of the rope?',
      visual: scene('pulley', { n: 1, m: 10, show: 'picture', quiet: true }, 'A single fixed pulley (your end of the rope drawn vertical here).'),
      choices: ['98 N, the same as on the mass’s side', '98 N × cos 40°, because you pull at an angle', '49 N, because the pulley shares the load', '196 N, because the pulley doubles the force'],
      answer: 0,
      why: {
        1: 'An ideal pulley turns the rope without changing its tension, whatever the angle. The angle changes only the force on the pulley’s axle.',
        2: 'Sharing needs a movable pulley with two segments holding the load; this pulley is fixed.',
        3: 'The axle may carry up to 2mg, but the rope’s tension is the same as the weight it holds.',
      },
      hints: ['What does the mass’s side need in order to hold the mass still?'],
      teach: 'An ideal pulley passes the same tension around it at any angle.',
      explain: 'The mass hangs still, so its rope pulls up with mg = 98 N. An ideal pulley keeps the tension the same all along the rope, so your end also carries 98 N, at whatever angle you hold it.',
    }),
    num({
      id: 'cp-rope-pulled', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]), h = r.pick([1.2, 1.5, 2, 2.5]);
        return {
          prompt: t`With a block and tackle in which ${n} rope segments hold the load, how much rope must you pull through your hands to raise the load ${h} m?`,
          visual: scene('pulley', { n, m: 60, show: 'picture', quiet: true }, `${n} segments hold the load.`),
          answer: n * h, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: h, feedback: `Each of the ${n} segments must shorten by ${h} m, and all that rope comes out through your hands.` },
            { value: h / n, feedback: 'You pull less hard but further, not less far.' },
          ],
          hints: [`To raise the load ${h} m, every one of the ${n} supporting segments must get ${h} m shorter.`],
          teach: 'A block and tackle trades force for distance: n segments mean 1/n of the force over n times the length.',
          explain: t`Each of the ${n} segments shortens by ${h} m, so you pull ${n} × ${h} = ${s3(n * h)} m of rope. Force × distance is unchanged: $\tfrac{mg}{${n}}\times ${n}h = mgh$ — a preview of work and energy.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §5.6 Common Forces', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-6-common-forces' },
    { label: 'OpenStax University Physics Vol. 1, §6.1 Solving Problems with Newton’s Laws', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws' },
  ],
});
