// Connected objects and the Atwood machine: one equation per body, one shared acceleration.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, scene, s3, sin } from './_forces.js';

const t = String.raw;
const G_MARS = 3.71;   // m/s²

export default lesson({
  id: 'phys2210.M6.3',
  title: 'Connected objects and the Atwood machine',
  minutes: 11, difficulty: 3,
  intro: t`Bodies tied together by an ideal rope (or pushed together) move with the same size of acceleration. Write Newton’s second law for **each body** along its own direction of motion, add the constraint that the accelerations match, and solve. For an **Atwood machine** — two masses hanging over a pulley, the heavier $m_2$ descending — this gives

$$a = \frac{(m_2 - m_1)\,g}{m_1 + m_2}, \qquad T = \frac{2m_1 m_2\,g}{m_1 + m_2}$$

The tension lies between the two weights: the rope holds the heavier mass back and hauls the lighter one up.`,
  symbols: [
    { tex: 'm_1,\\ m_2', text: 'the two masses, in kg; $m_2$ is the heavier one, which descends' },
    { tex: 'a', text: 'the common size of their acceleration, in m/s² — the rope makes them share it' },
    { tex: 'T', text: 'the rope’s tension, in N: the same on both sides for an ideal rope and pulley' },
    { tex: 'g', text: '9.8 m/s² near Earth’s surface' },
    { tex: 'm_1 + m_2', text: 'the total mass that the net driving force, $(m_2 - m_1)g$, has to accelerate' },
  ],
  why: 'Connected bodies are everywhere — coupled train cars, a glider on its towrope, rocket stages before separation, an elevator and its counterweight. George Atwood built his machine in 1784 to slow free fall down enough to measure it.',
  visual: {
    type: 'mech-fbd',
    title: 'An Atwood machine',
    lead: t`Two masses on an ideal pulley. Press **Play** to release them from rest. On the right, each mass’s free-body diagram: the same tension $T$ pulls up on both.`,
    tasks: [
      'Make the masses equal: a = 0 and T = mg — the machine balances.',
      'Make m₂ much heavier than m₁: a creeps toward g and T toward 2m₁g, never past the heavier weight.',
      'Compare T with m₁g and m₂g in the readout: T always lies between them.',
    ],
    params: { scene: 'atwood', m1: 3, m2: 5, values: true, play: true, sliders: ['m1', 'm2'] },
    caption: t`Massless rope, massless frictionless pulley, released from rest. Forces to one scale on both diagrams. The motion in the picture is slowed down. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`An Atwood machine has $m_1 = 3.0$ kg on one side and $m_2 = 5.0$ kg on the other. Released from rest, what is the acceleration of the masses and the tension in the rope?`,
    visual: scene('atwood', { m1: 3, m2: 5, values: true }, 'The machine and both free-body diagrams, to scale.'),
    steps: [
      { label: 'Directions', text: t`The 5.0 kg side descends. Take each body’s positive direction along its own motion: up for $m_1$, down for $m_2$. Then both have acceleration $+a$.` },
      { label: 'Lighter mass', text: t`$T - m_1 g = m_1 a$` },
      { label: 'Heavier mass', text: t`$m_2 g - T = m_2 a$` },
      { label: 'Add them', text: t`$T$ cancels: $(m_2 - m_1)g = (m_1 + m_2)a$, so $a = \dfrac{(2.0)(9.8)}{8.0} = 2.45\ \text{m/s}^2$.` },
      { label: 'Tension', text: t`$T = m_1(g + a) = 3.0\,(9.8 + 2.45) = 36.8$ N.` },
      { label: 'Sense check', text: t`$T$ lies between $m_1 g = 29.4$ N and $m_2 g = 49.0$ N. Equal masses would give $a = 0$; a vanishing $m_1$ would give free fall, $a = g$.` },
    ],
    answer: t`$a = 2.45\ \text{m/s}^2$ (the 5.0 kg mass descending), and $T = 36.8$ N.`,
  },
  practice: [
    mcq({
      id: 'tension-between', difficulty: 1,
      prompt: 'An Atwood machine with unequal masses is released from rest. How does the tension in the rope compare with the two weights?',
      visual: scene('atwood', { m1: 2, m2: 4, show: 'picture', quiet: true }, 'Two unequal masses on an ideal pulley, just released.'),
      choices: ['It lies between the two weights', 'It equals the heavier weight', 'It equals the lighter weight', 'It equals the sum of the two weights'],
      answer: 0,
      why: {
        1: 'Then the heavier mass would feel no net force and could not accelerate downward.',
        2: 'Then the lighter mass would feel no net force and could not accelerate upward.',
        3: 'The rope is not holding both masses still; each mass accelerates, so neither weight is fully supported.',
      },
      hints: ['The lighter mass accelerates upward: is T more or less than its weight? The heavier one accelerates downward: is T more or less than its weight?'],
      teach: 'In an accelerating Atwood machine, the tension lies strictly between the two weights.',
      explain: 'The light mass speeds up going up, so T exceeds its weight; the heavy mass speeds up going down, so T is less than its weight.',
    }),
    num({
      id: 'atwood-a', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1, 1.5, 2, 2.5, 3]), m2 = m1 + r.pick([0.5, 1, 1.5, 2]);
        const a = ((m2 - m1) * G) / (m1 + m2);
        return {
          prompt: t`An Atwood machine holds ${m1} kg on one side and ${m2} kg on the other. Released from rest, what is the size of their acceleration?`,
          visual: scene('atwood', { m1, m2, accel: false }, 'The machine and both free-body diagrams, to scale.'),
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: ((m2 - m1) * G) / m2, feedback: 'The driving force must accelerate both masses: divide by m₁ + m₂.' },
            { value: ((m2 - m1) * G) / m1, feedback: 'The driving force accelerates both masses together: divide by the total mass.' },
          ],
          hints: [t`Net driving force along the rope: $(m_2 - m_1)g$. Total mass moved: $m_1 + m_2$.`, t`$a = \dfrac{(m_2 - m_1)g}{m_1 + m_2}$.`],
          teach: 'An Atwood machine’s acceleration is the weight difference divided by the total mass.',
          explain: t`$a = \dfrac{(${m2} - ${m1})(9.8)}{${m1} + ${m2}} = ${s3(a)}\ \text{m/s}^2$ — much gentler than free fall.`,
        };
      },
    }),
    num({
      id: 'atwood-T', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1, 2, 3, 4]), m2 = m1 + r.pick([1, 2, 3]);
        const T = (2 * m1 * m2 * G) / (m1 + m2);
        return {
          prompt: t`An Atwood machine holds ${m1} kg and ${m2} kg. While the masses accelerate, what is the tension in the rope?`,
          visual: scene('atwood', { m1, m2, ask: ['T'], accel: false }, 'The machine and both free-body diagrams; the tension is the same on both sides.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m2 * G, feedback: 'If the rope pulled with the heavy mass’s full weight, it could not accelerate downward.' },
            { value: m1 * G, feedback: 'If the rope pulled with only the light mass’s weight, it could not accelerate upward.' },
            { value: ((m1 + m2) * G) / 2, feedback: t`Close to the right range, but not the average of the weights: $T = 2m_1m_2g/(m_1 + m_2)$.` },
          ].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: ['Find a first, then apply F = ma to either mass alone.', t`$T = m_1(g + a)$, with $a = (m_2 - m_1)g/(m_1 + m_2)$.`],
          teach: 'Find the acceleration from the whole system, then the tension from one body.',
          explain: t`$a = ${s3(((m2 - m1) * G) / (m1 + m2))}\ \text{m/s}^2$ and $T = m_1(g + a) = ${s3(T)}$ N, between ${s3(m1 * G)} N and ${s3(m2 * G)} N.`,
        };
      },
    }),
    num({
      id: 'table-frictionless', difficulty: 2,
      gen(r) {
        const m1 = r.pick([2, 3, 4, 5, 6]), m2 = r.pick([0.5, 1, 1.5, 2]);
        const a = (m2 * G) / (m1 + m2);
        return {
          prompt: t`A ${m1} kg cart on a frictionless table is tied by a string over a pulley at the table’s edge to a hanging ${m2} kg mass. What is their acceleration?`,
          visual: scene('table', { m1, m2, accel: false }, 'The cart, the hanging mass and their free-body diagrams, to scale.'),
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: (m2 * G) / m1, feedback: 'The hanging mass has inertia too: the weight m₂g accelerates both masses.' },
            { value: G, feedback: 'The hanging mass does not fall freely: the string holds it back while it drags the cart.' },
          ],
          hints: [t`The only unbalanced force on the pair is the hanging weight, $m_2 g$.`, t`$a = \dfrac{m_2 g}{m_1 + m_2}$.`],
          teach: 'For a table-and-pulley system without friction, the hanging weight accelerates the total mass.',
          explain: t`$a = \dfrac{m_2 g}{m_1 + m_2} = \dfrac{(${m2})(9.8)}{${m1 + m2}} = ${s3(a)}\ \text{m/s}^2$.`,
        };
      },
    }),
    num({
      id: 'table-friction', difficulty: 3,
      gen(r) {
        const m1 = r.pick([4, 5, 6, 8]), m2 = r.pick([3, 4, 5]), muk = r.pick([0.15, 0.2, 0.25]);   // m₂ > μk m₁: it speeds up
        const a = ((m2 - muk * m1) * G) / (m1 + m2), T = m2 * (G - a);
        return {
          prompt: t`A ${m1} kg block slides across a table ($\mu_k = ${muk}$), pulled by a string that runs over a pulley to a hanging ${m2} kg mass. What is the tension in the string?`,
          visual: scene('table', { m1, m2, muk, mus: muk + 0.1, moving: true, ask: ['T'], accel: false }, 'The sliding block, the hanging mass and their free-body diagrams, to scale.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m2 * G, feedback: 'The hanging mass accelerates downward, so the string pulls up on it with less than its weight.' },
            { value: muk * m1 * G, feedback: 'That is the friction on the block. The string must also accelerate the block.' },
          ],
          hints: [t`System: $a = \dfrac{m_2 g - \mu_k m_1 g}{m_1 + m_2}$.`, t`Hanging mass alone: $m_2 g - T = m_2 a$.`],
          teach: 'Solve for the shared acceleration first, then read the tension off either body.',
          explain: t`$a = \dfrac{(${m2} - ${muk}\times${m1})(9.8)}{${m1 + m2}} = ${s3(a)}\ \text{m/s}^2$, so $T = m_2(g - a) = ${s3(T)}$ N — less than the hanging weight, ${s3(m2 * G)} N.`,
        };
      },
    }),
    num({
      id: 'coupling', difficulty: 2,
      gen(r) {
        const m1 = r.pick([400, 500, 600]), m2 = r.pick([300, 400, 500]), F = r.pick([900, 1200, 1500]);
        const T = (m1 * F) / (m1 + m2);
        return {
          prompt: t`A small electric tractor pulls two baggage carts in a line across a smooth floor. It pulls the front cart (${m2} kg) with ${F} N; a coupling links it to the rear cart (${m1} kg). Ignoring rolling resistance, what is the tension in the coupling?`,
          visual: scene('pair', { m1, m2, F, link: 'pull', ask: ['T'], accel: false, names: ['Forces on the rear cart', 'Forces on the front cart'] }, 'The two carts and their free-body diagrams, to scale.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: F, feedback: 'The coupling only accelerates the rear cart, so it needs just that cart’s share of the pull.' },
            { value: (m2 * F) / (m1 + m2), feedback: 'That is the share for the front cart. The coupling pulls the rear one.' },
          ].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: ['Both carts share one acceleration: a = F/(m₁ + m₂).', 'The coupling is the only horizontal force on the rear cart.'],
          teach: 'In a towed line, each link pulls with enough to accelerate everything behind it.',
          explain: t`$a = ${F}/${m1 + m2} = ${s3(F / (m1 + m2))}\ \text{m/s}^2$, and the coupling accelerates only the rear cart: $T = m_1 a = ${s3(T)}$ N.`,
        };
      },
    }),
    num({
      id: 'start-moving', difficulty: 3,
      gen(r) {
        const m1 = r.pick([5, 8, 10, 12]), mus = r.pick([0.3, 0.4, 0.5]), muk = +(mus - 0.1).toFixed(1);
        return {
          prompt: t`A ${m1} kg block rests on a table with $\mu_s = ${mus}$ and $\mu_k = ${muk}$, tied over a pulley to a hanging mass. What is the smallest hanging mass that will start the block moving?`,
          visual: scene('table', { m1, m2: mus * m1 * 0.999, mus, muk, accel: false, quiet: true }, 'Just before breakaway: static friction holds the block. To scale.'),
          answer: mus * m1, units: 'kg', tol: { rel: 0.01 },
          errors: [
            { value: muk * m1, feedback: 'That would keep the block sliding once it moves. To start it, the hanging weight must beat static friction.' },
            { value: m1, feedback: 'Friction is only a fraction, μs, of the block’s weight.' },
          ],
          hints: ['While nothing moves, the string’s tension equals the hanging weight.', t`The block breaks free when $m_2 g$ exceeds $\mu_s m_1 g$.`],
          teach: 'A hanging mass starts a block sliding once its weight exceeds μs times the block’s weight.',
          explain: t`At rest, $T = m_2 g$, and the block slips once $m_2 g > \mu_s m_1 g$: $m_2 > \mu_s m_1 = ${s3(mus * m1)}$ kg. Once moving, only $\mu_k m_1 = ${s3(muk * m1)}$ kg would keep it going steadily.`,
        };
      },
    }),
    mcq({
      id: 'system-view', difficulty: 2,
      prompt: 'Think of the two masses of an Atwood machine as one system moving along the rope. What is the net external force driving it?',
      visual: scene('atwood', { m1: 2, m2: 5, show: 'picture', quiet: true }, 'Both masses, and the rope between them, as one system.'),
      choices: [t`$(m_2 - m_1)g$`, t`$m_2 g$`, t`$(m_1 + m_2)g$`, t`$2T$`],
      answer: 0,
      why: {
        1: 'The light mass’s weight pulls back along the rope, so subtract it.',
        2: 'Along the rope the two weights pull in opposite senses: one drives, one resists.',
        3: 'Tension is internal to the system — the rope pulls both masses, and those pulls cancel in the system’s bookkeeping.',
      },
      hints: ['Measure “forward” along the rope: down on the heavy side, up on the light side.'],
      teach: 'Along the rope, an Atwood machine is driven by the weight difference, while the tension is internal.',
      explain: t`Along the rope, $m_2 g$ drives and $m_1 g$ resists; the tension is internal. So $(m_2 - m_1)g = (m_1 + m_2)a$ — the shortcut to the acceleration.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-atwood', difficulty: 3, transfer: true,
      gen(r) {
        const m1 = r.pick([1.0, 1.5, 2.0]), dm = r.pick([0.1, 0.2]), m2 = +(m1 + dm).toFixed(2);
        const a = +((dm * G_MARS) / (m1 + m2)).toPrecision(3);          // the measured value, as printed
        const g = (a * (m1 + m2)) / dm;
        return {
          prompt: t`An astronaut on Mars measures the local gravity with an Atwood machine: ${m1} kg on one side and ${m2} kg on the other. Timing the fall, she finds the masses accelerate at ${a} m/s². What value of g does that give?`,
          visual: scene('atwood', { m1, m2, g: G_MARS, accel: false }, 'Her Atwood machine; the forces on each mass are drawn to scale for Mars.'),
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: a, feedback: 'That is the measured acceleration. The machine slows free fall down; undo that factor.' },
            { value: (a * (m1 + m2)) / m2, feedback: t`Rearrange $a = \dfrac{(m_2 - m_1)g}{m_1 + m_2}$: divide by the mass difference, not by $m_2$.` },
          ],
          hints: [t`$a = \dfrac{(m_2 - m_1)g}{m_1 + m_2}$.`, t`So $g = a\,\dfrac{m_1 + m_2}{m_2 - m_1}$.`],
          teach: 'An Atwood machine slows free fall by the factor (m₂ − m₁)/(m₁ + m₂), so measuring a gives g.',
          explain: t`$g = a\,\dfrac{m_1 + m_2}{m_2 - m_1} = ${a}\times\dfrac{${s3(m1 + m2)}}{${dm}} = ${s3(g)}\ \text{m/s}^2$ — Mars’s surface gravity, 3.71 m/s², is about 38% of Earth’s.`,
        };
      },
    }),
    mcq({
      id: 'cp-equal', difficulty: 2,
      prompt: 'An Atwood machine holds two equal 2 kg masses. You give it a nudge, so that the left mass moves up at 0.5 m/s, and let go. What happens next? (Ideal rope and pulley.)',
      visual: scene('atwood', { m1: 2, m2: 2, show: 'picture', quiet: true }, 'Two equal masses on an ideal pulley.'),
      choices: ['They keep moving at 0.5 m/s', 'They slow down and stop, since nothing keeps pushing', 'They speed up, since the left mass gains height', 'They return to where they started'],
      answer: 0,
      why: {
        1: 'Nothing needs to keep pushing: the forces balance, so the velocity stays the same.',
        2: 'Height does not matter here: the two weights balance at every position.',
        3: 'With zero net force, nothing reverses the motion.',
      },
      hints: ['Compare the two weights. What is the net force along the rope?'],
      teach: 'Balanced forces mean constant velocity, even in a machine.',
      explain: t`Equal masses: $(m_2 - m_1)g = 0$, so the net force is zero and the masses keep their 0.5 m/s — the first law, on a pulley.`,
    }),
    num({
      id: 'cp-incline-pulley', difficulty: 2,
      gen(r) {
        const m1 = r.pick([3, 4, 5]), m2 = r.pick([4, 5, 6]), th = r.pick([20, 25, 30]);      // m₂ > m₁ sin θ: the hanging mass descends
        const a = ((m2 - m1 * sin(th)) * G) / (m1 + m2);
        return {
          prompt: t`A ${m1} kg block sits on a frictionless ramp inclined at ${th}°. A string runs from it up the ramp, over a pulley at the top, to a hanging ${m2} kg mass. What is the acceleration of the masses?`,
          visual: scene('table', { m1, m2, theta: th, accel: false }, 'The block on the ramp, the hanging mass and their free-body diagrams, to scale.'),
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: ((m2 - m1) * G) / (m1 + m2), feedback: t`On the ramp, only the along-slope part of the block’s weight, $m_1 g\sin\theta$, pulls back.` },
            { value: (m2 * G) / (m1 + m2), feedback: 'The block’s weight still pulls back along the ramp, even without friction.' },
          ],
          hints: [t`Along the string: $m_2 g$ drives, $m_1 g\sin\theta$ resists.`, t`$a = \dfrac{(m_2 - m_1\sin\theta)g}{m_1 + m_2}$.`],
          teach: 'On an incline, only the along-slope part of a body’s weight enters the string’s equation.',
          explain: t`$a = \dfrac{(${m2} - ${m1}\sin ${th}^\circ)(9.8)}{${m1 + m2}} = ${s3(a)}\ \text{m/s}^2$, the hanging mass descending.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §6.1 Solving Problems with Newton’s Laws', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws' }],
});
