// Friction: static friction matches the need up to μs N; kinetic friction is μk N.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, t3, sin, cos } from './_forces.js';

const t = String.raw;
const G_MARS = 3.71;   // m/s²

// friction against a steady horizontal push, both in units of μs N: the static line, then the kinetic level
const frictionCurve = (ratio, caption) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [0, 1.75], y: [0, 1.3], xlabel: 'push ÷ μs N', ylabel: 'friction ÷ μs N', xticks: 7, yticks: 4,
    curves: [{ fn: 'x', domain: [0, 1], color: 'bad', label: 'static: f = push', labelAt: 0.45, labelDx: 10, labelDy: 12 }, { fn: String(ratio), domain: [1, 1.75], color: 'bad', label: 'kinetic: f = μk N', labelAt: 1.2, labelDy: -14 }],
    vlines: [{ x: 1, label: 'breaks free' }],
    points: [{ x: 1, y: 1, color: 'bad', label: 'μs N' }],
  },
  caption,
});

export default lesson({
  id: 'phys2210.M6.1',
  title: 'Friction',
  minutes: 10, difficulty: 2,
  intro: t`Friction is the part of a contact force that lies **along** the surfaces in contact. While nothing slips, **static friction** takes whatever value stops the slipping — up to a limit. Once the surfaces slide, **kinetic friction** has a fixed size:

$$f_s \le \mu_s N, \qquad f_k = \mu_k N$$

Both are proportional to the normal force $N$, roughly independent of the contact area and of the speed. Usually $\mu_k < \mu_s$, so it takes more force to start a crate moving than to keep it moving. And friction is not only a brake: static friction from the road is what pushes a car forward.`,
  symbols: [
    { tex: 'f_s', text: 'static friction, in N: **as large as needed** to prevent slipping, but never more than $\\mu_s N$; it opposes the slip that would otherwise happen' },
    { tex: 'f_k', text: 'kinetic friction, in N: opposes the sliding, with size $\\mu_k N$' },
    { tex: '\\mu_s', text: 'the coefficient of static friction (no units): roughly 1.0 for rubber on dry concrete, 0.1 for ice on ice' },
    { tex: '\\mu_k', text: 'the coefficient of kinetic friction (no units), usually smaller than $\\mu_s$: about 0.7 for rubber on dry concrete' },
    { tex: 'N', text: 'the normal force, in N — not always $mg$' },
  ],
  why: 'Friction decides how hard a car can brake or corner, how steep a slope a rover can climb, and whether a booster’s landing legs grip a drone ship’s deck.',
  visual: {
    type: 'mech-fbd',
    title: 'Breaking a crate loose',
    lead: t`Push a 20 kg crate with a steady horizontal force. The inset graphs the friction against your push for a crate that starts at rest; the gold dot is where you are now.`,
    tasks: [
      'Raise the push slowly: static friction grows with it, exactly cancelling it, and the crate stays put.',
      'Pass μs N: the crate breaks free, and friction drops to the smaller μk N.',
      'Double the mass: the breakaway force and the kinetic friction both double, because N doubles.',
    ],
    params: { scene: 'floor', m: 20, F: 60, phi: 0, mus: 0.6, muk: 0.4, plot: 'friction', values: true, sliders: ['F', 'm', 'mus', 'muk'], names: ['Forces on the crate'] },
    caption: t`Coulomb friction with constant coefficients — real surfaces are messier. Each push is applied to a crate starting from rest. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A 40 kg crate rests on a level warehouse floor, with $\mu_s = 0.60$ and $\mu_k = 0.45$. What horizontal push starts it moving? What push then keeps it sliding at constant velocity? And if, from rest, you push with only 200 N, what is the friction force?`,
    visual: scene('floor', { m: 40, F: 200, phi: 0, mus: 0.6, muk: 0.45, plot: 'friction', values: true, names: ['Forces on the crate'] }, 'The 200 N push: still below the breakaway force, so the crate stays put.'),
    steps: [
      { label: 'Normal force', text: t`Level floor, horizontal push: $N = mg = (40)(9.8) = 392$ N.` },
      { label: 'Breaking free', text: t`Static friction can reach $\mu_s N = (0.60)(392) = 235$ N, so the push must exceed **235 N**.` },
      { label: 'Keeping it moving', text: t`Sliding at constant velocity, the net force is zero: push $= f_k = \mu_k N = (0.45)(392) = 176$ N.` },
      { label: 'A 200 N push', text: t`200 N is less than 235 N, so the crate stays put and static friction is exactly **200 N** — not 235 N. Static friction only matches the need.` },
      { label: 'Sense check', text: t`235 N to break it loose but only 176 N to keep it going: the familiar lurch when a heavy crate suddenly gives.` },
    ],
    answer: t`It starts moving above 235 N; 176 N keeps it sliding steadily; a 200 N push leaves it at rest, held by 200 N of static friction.`,
  },
  practice: [
    mcq({
      id: 'static-match', difficulty: 1,
      prompt: t`A 20 kg crate sits on a floor with $\mu_s = 0.50$. You push it horizontally with 30 N, and it does not move. What is the friction force on it?`,
      visual: scene('floor', { m: 20, F: 30, phi: 0, mus: 0.5, muk: 0.4, ask: ['f'], labels: { f: 'f' }, accel: false, quiet: true, names: ['Forces on the crate'] }, 'The crate and its free-body diagram, to scale.'),
      choices: ['30 N, opposite to the push', t`98 N ($\mu_s mg$)`, '0 N, since the crate is not moving', '128 N, the push plus the maximum friction'],
      answer: 0,
      why: {
        1: t`$\mu_s N = 98$ N is only the most static friction can supply. It supplies just what is needed: here 30 N.`,
        2: 'If friction were zero, the 30 N push would accelerate the crate.',
        3: 'Friction does not add to the push; it opposes it.',
      },
      hints: ['The crate does not accelerate, so the horizontal forces must cancel.'],
      teach: 'Static friction is only as large as it needs to be, up to its maximum μs N.',
      explain: t`The crate stays at rest, so friction exactly cancels the push: 30 N. The limit, $\mu_s mg = 98$ N, would matter only for a push larger than that.`,
    }),
    num({
      id: 'breakaway', difficulty: 1,
      gen(r) {
        const m = r.pick([15, 25, 35, 50]), mus = r.pick([0.4, 0.5, 0.6, 0.7]), muk = +(mus - r.pick([0.1, 0.15, 0.2])).toFixed(2);
        return {
          prompt: t`A ${m} kg cabinet stands on a level floor with $\mu_s = ${mus}$ and $\mu_k = ${muk}$. What is the smallest horizontal push that will start it sliding?`,
          visual: frictionCurve(muk / mus, t`Friction against your push, scaled by the static limit: here $\mu_k/\mu_s = ${s3(muk / mus)}$.`),
          answer: mus * m * G, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: muk * m * G, feedback: t`That keeps it moving once it slides. To start it you must beat static friction, $\mu_s N$.` },
            { value: m * G, feedback: t`That is the weight. Only a fraction $\mu_s$ of the normal force is needed.` },
          ],
          hints: [t`Static friction can grow up to $\mu_s N$, with $N = mg$ here.`],
          teach: 'To start sliding, the push must exceed the maximum static friction μs N.',
          explain: t`$f_{s,\max} = \mu_s mg = (${mus})(${m})(9.8) = ${s3(mus * m * G)}$ N. Push harder than that and it breaks free.`,
        };
      },
    }),
    num({
      id: 'keep-moving', difficulty: 2,
      gen(r) {
        const m = r.pick([12, 18, 24, 30]), muk = r.pick([0.2, 0.25, 0.3, 0.35]);
        const F = muk * m * G;
        return {
          prompt: t`A ${m} kg box is already sliding across a floor where $\mu_k = ${muk}$. What horizontal push keeps it sliding at constant velocity?`,
          visual: scene('floor', { m, F, phi: 0, mus: muk + 0.15, muk, moving: true, ask: ['F'], names: ['Forces on the box'] }, 'The sliding box and its free-body diagram, to scale.'),
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'Constant velocity needs only enough push to cancel friction, a fraction of the weight.' },
            { value: 0, feedback: 'Friction would slow it down. To keep a constant velocity, something must cancel friction.' },
          ],
          hints: ['Constant velocity: zero net force.', t`Push $= f_k = \mu_k mg$.`],
          teach: 'At constant velocity, the push equals kinetic friction: μk N.',
          explain: t`$F = \mu_k mg = (${muk})(${m})(9.8) = ${s3(F)}$ N — no more is needed to keep it moving.`,
        };
      },
    }),
    num({
      id: 'decide', difficulty: 2,
      gen(r) {
        const m = r.pick([10, 15, 20, 25]), mus = r.pick([0.5, 0.6, 0.7]), muk = +(mus - r.pick([0.1, 0.15, 0.2])).toFixed(2);
        const fsMax = mus * m * G, slides = r.bool(0.5);
        const P = Math.round(fsMax * (slides ? r.pick([1.2, 1.4, 1.6]) : r.pick([0.35, 0.55, 0.75])));
        const ans = slides ? muk * m * G : P;
        const cand = slides
          ? [{ value: P, feedback: 'The push beats the static limit, so the box slides: friction is then kinetic, μk N, not equal to the push.' }, { value: fsMax, feedback: 'The box slides, so friction is kinetic: μk N, smaller than μs N.' }]
          : [{ value: fsMax, feedback: 'μs N is only the maximum. The push is below it, so static friction just matches the push.' }, { value: muk * m * G, feedback: 'The box does not slide (the push is below μs N), so the friction is static and equals the push.' }];
        return {
          prompt: t`A ${m} kg box rests on a floor with $\mu_s = ${mus}$ and $\mu_k = ${muk}$. Starting from rest, you push it horizontally with ${P} N. What is the size of the friction force on it?`,
          visual: bodyFBD([], { icon: 'block', m, show: 'picture', ground: true, agent: { dir: 0, kind: 'pole' }, caption: 'The box, pushed from the left by a pole.' }),
          answer: ans, units: 'N', tol: { rel: 0.01 },
          errors: cand.filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Compare the push with the static limit $\mu_s mg = ${s3(fsMax)}$ N.`, 'Below the limit: static friction equals the push. Above it: the box slides and friction is μk mg.'],
          teach: 'First decide whether it slips: compare the push with μs N.',
          explain: slides
            ? t`The push, ${P} N, exceeds $\mu_s mg = ${s3(fsMax)}$ N, so the box slides and friction is kinetic: $\mu_k mg = ${s3(ans)}$ N.`
            : t`The push, ${P} N, is below $\mu_s mg = ${s3(fsMax)}$ N, so the box stays put and static friction equals the push: ${P} N.`,
        };
      },
    }),
    num({
      id: 'sled-angle', difficulty: 3,
      gen(r) {
        const m = r.pick([15, 20, 25, 30]), phi = r.pick([20, 25, 30, 35]), muk = r.pick([0.1, 0.15, 0.2]);
        const T = (muk * m * G) / (cos(phi) + muk * sin(phi));
        return {
          prompt: t`You pull a ${m} kg sled across level snow at constant velocity with a rope at ${phi}° above the horizontal. The coefficient of kinetic friction is ${muk}. What tension must the rope have?`,
          visual: scene('floor', { m, F: T, phi, mus: muk + 0.1, muk, moving: true, ask: ['F'], labels: { F: 'T' }, names: ['Forces on the sled'] }, 'The sled sliding at constant velocity, and its free-body diagram to scale.'),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: (muk * m * G) / cos(phi), feedback: t`The rope also lifts the sled a little, so $N = mg - T\sin\varphi$ and the friction is smaller than $\mu_k mg$.` },
            { value: muk * m * G, feedback: 'Only the horizontal part of the rope’s pull fights friction, and the pull also reduces N.' },
          ].filter((e) => Math.abs(e.value - T) > 0.02 * T),     // near tan φ = μk the horizontal-pull value happens to come close
          hints: [t`Vertical: $N = mg - T\sin\varphi$. Horizontal: $T\cos\varphi = \mu_k N$.`, t`Substitute: $T\cos\varphi = \mu_k(mg - T\sin\varphi)$, so $T = \dfrac{\mu_k mg}{\cos\varphi + \mu_k\sin\varphi}$.`],
          teach: 'An angled pull both drags and lifts: it lowers N and so lowers the friction it has to beat.',
          explain: t`$T = \dfrac{\mu_k mg}{\cos\varphi + \mu_k\sin\varphi} = \dfrac{(${muk})(${m})(9.8)}{\cos ${phi}^\circ + ${muk}\sin ${phi}^\circ} = ${s3(T)}$ N, slightly less than $\mu_k mg/\cos\varphi = ${s3((muk * m * G) / cos(phi))}$ N.`,
        };
      },
    }),
    mcq({
      id: 'car-forward', difficulty: 2,
      prompt: 'A car speeds up from a traffic light without wheel spin. What external force pushes the car forward?',
      visual: bodyFBD([], { icon: 'car', show: 'picture', ground: true, v: [1, 0], caption: 'Speeding up to the right, tyres gripping the road.' }),
      choices: ['Static friction from the road on the tyres, pointing forward', 'Kinetic friction from the road, pointing backward', 'The engine’s force on the car', 'The normal force from the road'],
      answer: 0,
      why: {
        1: 'The tyres do not skid, so the friction is static — and it points forward, the way the car accelerates.',
        2: 'The engine is part of the car: its forces are internal. It turns the wheels, which push back on the road; the road pushes the car forward.',
        3: 'The normal force is vertical; it cannot speed the car up horizontally.',
      },
      hints: ['Only external forces accelerate the car. What outside the car pushes it forward?', 'The driven tyres push backward on the road. What does the road do in return?'],
      teach: 'A car is pushed forward by static friction from the road: the reaction to its tyres pushing back on the road.',
      explain: 'The driven tyres push back on the road without slipping; the road pushes forward on the tyres with static friction (third law). That is the only external forward force — on ice, with little friction available, the wheels just spin.',
    }),
    num({
      id: 'abs-stop', difficulty: 3,
      gen(r) {
        const v = r.pick([20, 25, 30]), mus = r.pick([0.7, 0.8, 0.9]), muk = +(mus - 0.2).toFixed(1);
        const d = (v * v) / (2 * mus * G);
        return {
          prompt: t`A car brakes from ${v} m/s on a dry road. Its anti-lock brakes keep the tyres rolling, so static friction with $\mu_s = ${mus}$ can act. What is the shortest stopping distance?`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 35], y: [0, 120], xlabel: 'speed (m/s)', ylabel: 'stopping distance (m)', xticks: 7, yticks: 6,
              curves: [
                { fn: `x^2/(2*${mus}*9.8)`, domain: [0, Math.min(35, Math.sqrt(2 * mus * G * 118))], color: 'good', label: `rolling (μs = ${mus})`, labelAt: 27, labelDx: 8, labelDy: 10 },
                { fn: `x^2/(2*${muk}*9.8)`, domain: [0, Math.min(35, Math.sqrt(2 * muk * G * 118))], color: 'bad', label: `skidding (μk = ${muk})`, labelAt: 23, labelDx: -150, labelDy: -6 },
              ],
              vlines: [{ x: v, label: `${v} m/s` }],
            },
            caption: 'Braking distance against speed, with friction as the only horizontal force; it grows as the square of the speed. Reaction time not included.',
          },
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (v * v) / (mus * G), feedback: t`From $v^2 = 2ad$, $d = v^2/(2a)$ — you dropped the 2.` },
            { value: v / (mus * G), feedback: 'That is the stopping time, in seconds, not the distance.' },
            { value: (v * v) / (2 * muk * G), feedback: t`That uses ${muk}, the kinetic coefficient for locked, skidding wheels. ABS keeps the static coefficient in play.` },
          ],
          hints: [t`The largest friction is $\mu_s mg$, so the largest deceleration is $a = \mu_s g$ — the mass cancels.`, t`Then $v^2 = 2ad$ gives $d = v^2/(2\mu_s g)$.`],
          teach: 'Maximum braking deceleration is μs g, so the stopping distance v²/(2μs g) does not depend on the car’s mass.',
          explain: t`$a = \mu_s g = ${s3(mus * G)}\ \text{m/s}^2$, so $d = \dfrac{v^2}{2a} = \dfrac{${v}^2}{2(${s3(mus * G)})} = ${s3(d)}$ m. Skidding (μk = ${muk}) would take ${s3((v * v) / (2 * muk * G))} m.`,
        };
      },
    }),
    mcq({
      id: 'no-push-error', difficulty: 3, kind: 'error',
      prompt: t`A 10 kg box sits on a level floor; nobody pushes it. The floor has $\mu_s = 0.6$. A student writes: “The friction force on the box is $\mu_s mg = 58.8$ N.” What is wrong?`,
      visual: scene('floor', { m: 10, F: 0, mus: 0.6, muk: 0.4, show: 'picture', quiet: true }, 'The box at rest on a level floor, with nothing pushing it.'),
      choices: ['Nothing tends to make the box slide, so static friction is zero', t`It should use $\mu_k$: the friction is $\mu_k mg$`, t`The friction should equal the weight, $mg$`, t`Nothing: static friction is always $\mu_s N$`],
      answer: 0,
      why: {
        1: 'The box is not sliding, so kinetic friction does not apply — and nothing needs opposing anyway.',
        2: 'Friction acts along the floor; the weight is vertical and is balanced by the normal force.',
        3: t`$\mu_s N$ is the ceiling, not the value. If friction were 58.8 N with nothing to balance it, the box would accelerate across the floor on its own.`,
      },
      hints: ['If friction were 58.8 N and nothing else acted horizontally, what would the box do?', 'Static friction supplies only what is needed to stop slipping.'],
      teach: 'μs N is a maximum: with nothing trying to make it slip, static friction is zero.',
      explain: 'No horizontal force tries to slide the box, so static friction has nothing to oppose: it is zero. It would rise to match a push, up to 58.8 N.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-rover', difficulty: 2, transfer: true,
      gen(r) {
        const mus = r.pick([0.4, 0.5, 0.6]);
        return {
          prompt: t`A Mars rover drives all six of its wheels. On level ground on Mars ($g = 3.71\ \text{m/s}^2$), its wheels grip the soil with $\mu_s = ${mus}$. What is the largest acceleration it can reach without its wheels slipping?`,
          visual: bodyFBD([force('f', mus * 899 * G_MARS, 0, 'friction'), force('N', 899 * G_MARS, 90, 'normal'), force('mg', 899 * G_MARS, 270, 'weight')], { icon: 'car', show: 'both', ground: true, v: [1, 0], ask: ['F0'], name: 'Forces on the rover, on Mars', caption: 'Friction from the ground drives the rover forward. To scale, for a 899 kg rover.' }),
          answer: mus * G_MARS, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: mus * G, feedback: 'That uses Earth’s gravity. On Mars the normal force, and so the grip, is much smaller.' },
            { value: G_MARS, feedback: t`Friction is at most $\mu_s N$, so the acceleration is at most $\mu_s g$.` },
          ],
          hints: [t`$f_{\max} = \mu_s N = \mu_s mg_\text{Mars}$, and it is the only horizontal force.`],
          teach: 'Traction-limited acceleration is μs g: weaker gravity means less grip.',
          explain: t`$a_{\max} = \dfrac{\mu_s m g_\text{Mars}}{m} = \mu_s g_\text{Mars} = (${mus})(3.71) = ${s3(mus * G_MARS)}\ \text{m/s}^2$ — the mass cancels. The same wheels on Earth could manage ${s3(mus * G)} m/s².`,
        };
      },
    }),
    mcq({
      id: 'cp-truck-box', difficulty: 2,
      prompt: 'A box sits in the back of a pickup truck. The truck speeds up and the box moves with it without slipping. Which way does the friction force on the box point?',
      visual: bodyFBD([], { icon: 'block', show: 'picture', ground: true, v: [1, 0], caption: 'The box on the truck’s bed; the truck (not drawn) is speeding up to the right.' }),
      choices: ['Forward, the same way as the acceleration', 'Backward, opposing the motion', 'Nowhere: friction is zero because the box does not slide', 'Downward, pressing the box onto the bed'],
      answer: 0,
      why: {
        1: 'Friction opposes slipping, not motion. Without friction the box would slide backward relative to the bed, so friction points forward.',
        2: 'The box speeds up, so some horizontal force must act on it — and friction is the only candidate.',
        3: 'Friction acts along the surfaces, never perpendicular to them.',
      },
      teach: 'Static friction opposes the slip that would happen without it, which can be the direction of motion.',
      hints: ['What else could speed the box up?'],
      explain: 'The box accelerates forward with the truck, so the net force on it points forward — and the only horizontal force is static friction from the bed. It opposes the backward slip that would otherwise happen.',
    }),
    num({
      id: 'cp-push-down', difficulty: 3,
      gen(r) {
        const m = r.pick([20, 30, 40]), mus = r.pick([0.4, 0.5, 0.6]), phi = r.pick([20, 25, 30]);
        const F = (mus * m * G) / (cos(phi) - mus * sin(phi));
        return {
          prompt: t`You push a ${m} kg crate with a force directed ${phi}° **below** the horizontal. With $\mu_s = ${mus}$, what is the smallest push that starts the crate sliding?`,
          visual: scene('floor', { m, F: 0.999 * F, phi: -phi, mus, muk: mus - 0.1, ask: ['F'], accel: false, quiet: true, names: ['Forces on the crate'] }, 'Pushing down and forward, just short of the breakaway point; to scale.'),
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: (mus * m * G) / cos(phi), feedback: t`Pushing downward also raises the normal force: $N = mg + F\sin\varphi$, so friction grows.` },
            { value: mus * m * G, feedback: 'The push is slanted: only its horizontal part fights friction, and its vertical part raises N.' },
          ],
          hints: [t`Vertical: $N = mg + F\sin\varphi$. At the breakaway point: $F\cos\varphi = \mu_s N$.`, t`$F\cos\varphi = \mu_s(mg + F\sin\varphi)$, so $F = \dfrac{\mu_s mg}{\cos\varphi - \mu_s\sin\varphi}$.`],
          teach: 'Pushing down at an angle adds to N, so it takes more push to break a crate free than pulling up would.',
          explain: t`$F = \dfrac{\mu_s mg}{\cos\varphi - \mu_s\sin\varphi} = \dfrac{(${mus})(${m})(9.8)}{\cos ${phi}^\circ - ${mus}\sin ${phi}^\circ} = ${s3(F)}$ N. Pulling up at the same angle would need less.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §6.2 Friction', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-2-friction' }],
});
