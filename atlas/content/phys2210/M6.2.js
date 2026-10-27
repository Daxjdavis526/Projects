// Inclined planes: tilt the axes, split the weight, and compare tan θ with μs.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, sin, cos, tan } from './_forces.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M6.2',
  title: 'Inclined planes',
  minutes: 11, difficulty: 2,
  intro: t`On a slope, tilt your axes: $x$ along the slope and $y$ perpendicular to it. Then the normal force and friction each lie along one axis, and only the weight has to be split — $mg\sin\theta$ down the slope and $mg\cos\theta$ into it. So $N = mg\cos\theta$, and a block sliding down with kinetic friction accelerates at

$$a = g\,(\sin\theta - \mu_k\cos\theta)$$

The mass cancels. A block at rest stays put as long as $\tan\theta \le \mu_s$; the steepest slope it can rest on is the **angle of repose**, $\tan\theta = \mu_s$.`,
  symbols: [
    { tex: '\\theta', text: 'the slope’s angle above the horizontal' },
    { tex: 'g\\sin\\theta', text: 'the part of gravity’s pull (per kilogram) that points down the slope, in m/s²; $mg\\sin\\theta$ is that part of the weight, in N' },
    { tex: 'g\\cos\\theta', text: 'the part pressing into the slope; $N = mg\\cos\\theta$ when nothing else pushes across the slope' },
    { tex: '\\mu_k', text: 'the coefficient of kinetic friction (no units); friction $\\mu_k mg\\cos\\theta$ points up the slope while the block slides down' },
    { tex: 'a', text: 'the acceleration along the slope, down-slope positive, in m/s²' },
  ],
  why: 'Ramps, ski runs, launch rails and landslides are all this problem — and tilting the axes to fit the situation is a habit that pays off all the way to orbital mechanics.',
  visual: {
    type: 'mech-fbd',
    title: 'Tilt the slope until it slides',
    lead: t`A block on an adjustable slope. In the diagram, the dashed grey arrows split the weight into a part along the slope ($mg\sin\theta$) and a part into it ($mg\cos\theta$), along tilted axes.`,
    tasks: [
      'Raise θ slowly: mg sin θ grows, N = mg cos θ shrinks, and static friction keeps pace — until tan θ passes μs and the block slides.',
      'With μs = 0.5, find the angle of repose: the block should start to slide just past 26.6°, where tan θ = 0.5.',
      'Set μs and μk to 0: now it slides at any angle, with a = g sin θ — exactly g/2 at 30°.',
    ],
    params: { scene: 'incline', m: 5, theta: 20, mus: 0.5, muk: 0.35, components: true, values: true, sliders: ['theta', 'mus', 'muk', 'm'], toggles: ['components', 'values'] },
    caption: t`Tilted axes: $x$ along the slope, $y$ out of it. Friction is static (up to $\mu_s N$) while the block rests, then kinetic. Forces to one scale; $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A 70 kg skier glides straight down a 25° slope on waxed skis, with $\mu_k = 0.10$. Find the normal force on her and her acceleration.`,
    visual: scene('incline', { m: 70, theta: 25, mus: 0.15, muk: 0.1, moving: -1, components: true, values: true, names: ['Forces on the skier'] }, 'The skier as a block on the slope, and her free-body diagram with the weight split along tilted axes.'),
    steps: [
      { label: 'Tilted axes', text: t`$x$ down the slope, $y$ out of it. Only the weight, $mg = 686$ N, needs splitting.` },
      { label: 'Into the slope', text: t`Nothing accelerates across the slope: $N = mg\cos 25^\circ = 686 \times 0.906 = 622$ N — less than her weight.` },
      { label: 'Friction', text: t`She slides, so $f_k = \mu_k N = 0.10 \times 622 = 62.2$ N, pointing **up** the slope.` },
      { label: 'Along the slope', text: t`$ma = mg\sin 25^\circ - f_k = 290 - 62.2 = 228$ N, so $a = 228/70 = 3.25\ \text{m/s}^2$.` },
      { label: 'Sense check', text: t`The formula $a = g(\sin\theta - \mu_k\cos\theta) = 9.8(0.423 - 0.091) = 3.25\ \text{m/s}^2$ agrees, and the mass cancels: a heavier skier accelerates the same (until air drag matters).` },
    ],
    answer: t`$N = 622$ N and $a = 3.25\ \text{m/s}^2$ down the slope.`,
  },
  practice: [
    mcq({
      id: 'components', difficulty: 1,
      prompt: 'A block rests on a slope at angle θ above the horizontal. Which part of its weight pulls it down along the slope?',
      visual: scene('incline', { m: 4, theta: 30, mus: 0.8, muk: 0.6, show: 'picture', quiet: true }, 'A block on a 30° slope.'),
      choices: [t`$mg\sin\theta$`, t`$mg\cos\theta$`, t`$mg\tan\theta$`, t`$mg$`],
      answer: 0,
      why: {
        1: t`$mg\cos\theta$ presses into the slope. Check with a limit: on level ground ($\theta = 0$) nothing pulls along the surface, and $\sin 0 = 0$.`,
        2: t`$\tan\theta$ grows without limit near 90°, but no component of a force can exceed the force itself.`,
        3: 'The whole weight points straight down, not along the slope; only part of it lies along the slope.',
      },
      hints: ['Check the limits: on flat ground the along-slope part must be zero; on a vertical wall it must be all of mg.'],
      teach: 'Along a slope of angle θ the weight’s component is mg sin θ; into the slope, mg cos θ.',
      explain: t`The along-slope part is $mg\sin\theta$: zero on the flat, all of $mg$ on a vertical face. The part into the slope is $mg\cos\theta$.`,
    }),
    num({
      id: 'frictionless', difficulty: 1,
      gen(r) {
        const th = r.pick([15, 20, 25, 30, 35, 40]);
        return {
          prompt: t`A cart rolls freely (no friction) down a ${th}° ramp. What is the size of its acceleration?`,
          visual: scene('incline', { m: 2, theta: th, mus: 0, muk: 0, names: ['Forces on the cart'] }, 'Frictionless: only the weight and the normal force act. To scale.'),
          answer: G * sin(th), units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: G * cos(th), feedback: t`That is the component into the slope. Along the slope it is $g\sin\theta$.` },
            { value: G, feedback: 'The ramp holds up part of the weight: only the along-slope part accelerates the cart.' },
          ],
          hints: [t`Along the slope only $mg\sin\theta$ acts.`],
          teach: 'Without friction, a ramp of angle θ gives a = g sin θ, whatever the mass.',
          explain: t`$a = g\sin\theta = 9.8\sin ${th}^\circ = ${s3(G * sin(th))}\ \text{m/s}^2$.`,
        };
      },
    }),
    num({
      id: 'normal', difficulty: 2,
      gen(r) {
        const m = r.pick([3, 5, 8, 12]), th = r.pick([20, 25, 30, 35, 40]);
        return {
          prompt: t`A ${m} kg box rests on a ramp inclined at ${th}°. What is the normal force from the ramp on the box?`,
          visual: scene('incline', { m, theta: th, mus: 0.9, muk: 0.6, ask: ['N'], names: ['Forces on the box'] }, 'The box on the ramp and its free-body diagram, to scale.'),
          answer: m * G * cos(th), units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'On a slope the normal force is less than mg: the ramp only has to cancel the part of the weight pressing into it.' },
            { value: m * G * sin(th), feedback: t`That is the along-slope part. Perpendicular to the slope it is $mg\cos\theta$.` },
          ],
          hints: ['Nothing accelerates perpendicular to the slope.', t`$N = mg\cos\theta$.`],
          teach: 'On a slope with nothing else pushing across it, N = mg cos θ — less than mg.',
          explain: t`$N = mg\cos\theta = (${m})(9.8)\cos ${th}^\circ = ${s3(m * G * cos(th))}$ N, below the weight of ${s3(m * G)} N.`,
        };
      },
    }),
    num({
      id: 'slide-friction', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 35, 40, 45]), muk = r.pick([0.15, 0.2, 0.25, 0.3]);
        const a = G * (sin(th) - muk * cos(th));
        return {
          prompt: t`A crate slides down a ${th}° chute with $\mu_k = ${muk}$. What is its acceleration?`,
          visual: scene('incline', { m: 6, theta: th, mus: muk + 0.1, muk, moving: -1, names: ['Forces on the crate'] }, 'Sliding down: kinetic friction points up the slope. To scale.'),
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: G * sin(th), feedback: 'That ignores friction, which points up the slope and slows the crate.' },
            { value: G * (sin(th) + muk * cos(th)), feedback: 'Sliding down, friction points up the slope: subtract it.' },
            { value: G * (sin(th) - muk), feedback: t`Friction is $\mu_k N$ with $N = mg\cos\theta$, not $mg$.` },
          ],
          hints: [t`Along the slope: $mg\sin\theta$ down, $\mu_k mg\cos\theta$ up.`, t`$a = g(\sin\theta - \mu_k\cos\theta)$.`],
          teach: 'Sliding down a slope: a = g(sin θ − μk cos θ).',
          explain: t`$a = 9.8(\sin ${th}^\circ - ${muk}\cos ${th}^\circ) = ${s3(a)}\ \text{m/s}^2$ down the chute.`,
        };
      },
    }),
    {
      type: 'slider', id: 'repose', difficulty: 2,
      prompt: t`A block sits on an adjustable slope with $\mu_s = 0.60$. Find the steepest angle at which it still stays put.`,
      visual: { type: 'mech-fbd', params: { scene: 'incline', m: 4, theta: 10, mus: 0.6, muk: 0.45, sliders: ['theta'], readout: false, names: ['Forces on the block'] }, caption: 'Drag the slope angle; the line above the picture says whether the block holds or slides.' },
      param: 'theta',
      answer: [30, 31],
      instruction: 'Set the slope to the steepest angle at which the block stays put, then check.',
      hints: ['Watch static friction grow as the slope steepens. It can never exceed μs N.', t`At the limit, $mg\sin\theta = \mu_s mg\cos\theta$, so $\tan\theta = \mu_s$.`],
      teach: 'A block holds on a slope while tan θ ≤ μs: the angle of repose is arctan μs.',
      explain: t`At the limit $mg\sin\theta = \mu_s mg\cos\theta$, so $\tan\theta = 0.60$ and $\theta = 31.0^\circ$. On this slider (half-degree steps) 30.5° holds and 31° slides.`,
    },
    num({
      id: 'push-up', difficulty: 3,
      gen(r) {
        const m = r.pick([20, 30, 40, 50]), th = r.pick([15, 20, 25, 30]), muk = r.pick([0.2, 0.3, 0.4]);
        const F = m * G * (sin(th) + muk * cos(th));
        return {
          prompt: t`You push a ${m} kg crate up a ${th}° ramp at constant velocity, with a force parallel to the ramp. The coefficient of kinetic friction is ${muk}. How hard must you push?`,
          visual: scene('incline', { m, theta: th, mus: muk + 0.1, muk, F, moving: 1, ask: ['F'], names: ['Forces on the crate'] }, 'Moving up the ramp: friction now points down the slope. To scale.'),
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G * sin(th), feedback: 'That only balances gravity along the slope; friction also resists the motion.' },
            { value: m * G * (sin(th) - muk * cos(th)), feedback: 'Moving up the slope, friction points down it — it adds to what you must push against.' },
          ],
          hints: ['Constant velocity: the forces along the slope cancel.', t`Up: your push. Down: $mg\sin\theta$ and $\mu_k mg\cos\theta$.`],
          teach: 'Friction always opposes the sliding: pushing up a slope you fight both gravity’s pull and friction.',
          explain: t`$F = mg(\sin\theta + \mu_k\cos\theta) = (${m})(9.8)(\sin ${th}^\circ + ${muk}\cos ${th}^\circ) = ${s3(F)}$ N.`,
        };
      },
    }),
    num({
      id: 'launched-up', difficulty: 3,
      gen(r) {
        const th = r.pick([20, 25, 30]), muk = r.pick([0.1, 0.2, 0.3]), v0 = r.pick([4, 5, 6, 8]);
        const a = G * (sin(th) + muk * cos(th)), d = (v0 * v0) / (2 * a);
        return {
          prompt: t`A puck is flicked up a ${th}° ramp at ${v0} m/s. The coefficient of kinetic friction is ${muk}. How far along the ramp does it slide before it stops?`,
          visual: scene('incline', { m: 0.5, theta: th, mus: muk + 0.05, muk, moving: 1, names: ['Forces on the puck'] }, 'Sliding up and slowing down: gravity’s pull and friction both point down the slope.'),
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (v0 * v0) / (2 * G * sin(th)), feedback: 'Friction also slows it on the way up, so it stops sooner.' },
            { value: (v0 * v0) / (2 * G * (sin(th) - muk * cos(th))), feedback: 'Going up, friction points down the slope — it adds to gravity’s pull rather than opposing it.' },
          ],
          hints: [t`Going up, both $mg\sin\theta$ and the friction $\mu_k mg\cos\theta$ point down the slope.`, t`Deceleration $a = g(\sin\theta + \mu_k\cos\theta)$; then $v_0^2 = 2ad$.`],
          teach: 'Sliding up, friction joins gravity: the deceleration is g(sin θ + μk cos θ).',
          explain: t`$a = 9.8(\sin ${th}^\circ + ${muk}\cos ${th}^\circ) = ${s3(a)}\ \text{m/s}^2$, so $d = \dfrac{v_0^2}{2a} = \dfrac{${v0}^2}{2(${s3(a)})} = ${s3(d)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'rest-friction', difficulty: 2,
      prompt: t`A 10 kg box rests on a 20° ramp. The coefficient of static friction is 0.80. How large is the friction force on the box?`,
      visual: scene('incline', { m: 10, theta: 20, mus: 0.8, muk: 0.6, ask: ['f'], labels: { f: 'f' }, quiet: true, accel: false, names: ['Forces on the box'] }, 'The box at rest on the ramp, and its free-body diagram to scale.'),
      choices: [t`$mg\sin 20^\circ = 33.5$ N, just enough to hold it`, t`$\mu_s mg\cos 20^\circ = 73.7$ N`, t`$\mu_s mg = 78.4$ N`, '0 N, since the box is not moving'],
      answer: 0,
      why: {
        1: t`That is the most static friction could supply. It only supplies what is needed: $mg\sin 20^\circ$.`,
        2: t`The normal force on a slope is $mg\cos\theta$, and anyway the friction is not at its maximum.`,
        3: 'Without friction the box would slide down: something must hold it.',
      },
      hints: ['The box is at rest: the forces along the slope cancel.'],
      teach: 'At rest on a slope, static friction equals mg sin θ — not μs N.',
      explain: t`Along the slope, friction balances $mg\sin 20^\circ = (10)(9.8)(0.342) = 33.5$ N. The maximum, $\mu_s mg\cos 20^\circ = 73.7$ N, is never reached.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rail', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([20, 25, 30]), T = r.pick([1200, 1500, 1800]), th = r.pick([80, 84, 87]);
        const a = T / m - G * sin(th);
        return {
          prompt: t`An amateur rocket of mass ${m} kg slides up a launch rail tilted ${th}° above the horizontal; its motor’s thrust of ${T} N points along the rail. Ignoring rail friction, air drag and the propellant burned so far, what is its acceleration along the rail?`,
          visual: bodyFBD([force('thrust', T, th, 'thrust'), force('N', m * G * cos(th), 90 + th, 'normal'), force('mg', m * G, 270, 'weight')], { name: 'Forces on the rocket, on its rail', caption: `Thrust along the rail (${th}° above the horizontal), the rail’s small normal force and the weight. To scale.` }),
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: T / m - G, feedback: t`Close, but the rail is not quite vertical: along it, gravity contributes $g\sin\theta$.` },
            { value: T / m, feedback: 'Gravity still pulls back along the rail.' },
            { value: T / m - G * cos(th), feedback: t`θ is measured from the horizontal, so gravity’s part along the rail is $g\sin\theta$.` },
          ].filter((e) => Math.abs(e.value - a) > 0.02 * Math.abs(a)),
          hints: ['Tilt the axes along the rail: thrust forward, gravity’s along-rail part backward.', t`$a = T/m - g\sin\theta$.`],
          teach: 'Along any incline, gravity’s share is g sin θ — a launch rail is just a very steep ramp.',
          explain: t`$a = \dfrac{T}{m} - g\sin\theta = \dfrac{${T}}{${m}} - 9.8\sin ${th}^\circ = ${s3(a)}\ \text{m/s}^2$ — about ${s3(a / G)} g. The rail’s normal force, $mg\cos\theta$, is small this close to vertical.`,
        };
      },
    }),
    mcq({
      id: 'cp-parked', difficulty: 2,
      prompt: 'A car is parked, brakes on, on a hill. Which statement about the friction from the road on the car is right?',
      visual: scene('incline', { m: 1200, theta: 12, mus: 0.8, muk: 0.6, show: 'picture', quiet: true }, 'A parked car (drawn as a block) on a 12° hill.'),
      choices: [t`It points up the hill and equals $mg\sin\theta$`, 'It points down the hill, opposing the car’s tendency to roll', t`It equals $\mu_s mg\cos\theta$, its maximum`, 'It is zero, since the car is not moving'],
      answer: 0,
      why: {
        1: 'Without friction the car would roll down the hill; friction opposes that, so it points up the hill.',
        2: 'That is only the ceiling. A parked car on a gentle hill needs much less.',
        3: 'At rest does not mean no friction: something has to cancel gravity’s pull along the slope.',
      },
      hints: ['Which way would the car go without friction?'],
      teach: 'On a hill, static friction points up the slope and is exactly mg sin θ while nothing slips.',
      explain: t`The car is at rest, so the forces along the slope cancel: friction points up the hill and equals $mg\sin\theta$, well below its maximum $\mu_s mg\cos\theta$.`,
    }),
    num({
      id: 'cp-icy-slope', difficulty: 2,
      gen(r) {
        const L = r.pick([30, 40, 50, 60]), th = r.pick([15, 20, 25]), muk = r.pick([0.04, 0.05, 0.08]);
        const a = G * (sin(th) - muk * cos(th)), v = Math.sqrt(2 * a * L);
        return {
          prompt: t`A sled starts from rest at the top of an icy ${L} m slope inclined at ${th}°, with $\mu_k = ${muk}$. How fast is it moving at the bottom?`,
          visual: scene('incline', { m: 15, theta: th, mus: muk + 0.05, muk, moving: -1, names: ['Forces on the sled'] }, 'Sliding down the icy slope. To scale.'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(2 * G * sin(th) * L), feedback: 'That ignores friction; even ice slows the sled a little.' },
            { value: Math.sqrt(2 * G * L), feedback: 'That is a free fall through the slope’s length. Only the along-slope part of gravity acts.' },
            { value: 2 * a * L, feedback: t`That is $v^2$; take the square root.` },
          ].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: [t`$a = g(\sin\theta - \mu_k\cos\theta)$, then $v^2 = 2aL$.`],
          teach: 'Find the acceleration along the slope, then use constant-acceleration kinematics.',
          explain: t`$a = 9.8(\sin ${th}^\circ - ${muk}\cos ${th}^\circ) = ${s3(a)}\ \text{m/s}^2$, so $v = \sqrt{2aL} = \sqrt{2(${s3(a)})(${L})} = ${s3(v)}$ m/s.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §6.2 Friction', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-2-friction' }],
});
