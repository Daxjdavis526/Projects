// Weight, normal force and apparent weight: N is whatever the surface must push; a scale reads N.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, t3, sin } from './_forces.js';

const t = String.raw;
const G_MOON = 1.62;           // m/s², at the Moon’s surface

export default lesson({
  id: 'phys2210.M5.5',
  title: 'Weight, normal force and apparent weight',
  minutes: 10, difficulty: 2,
  intro: t`Your **weight** is the gravitational force Earth exerts on you, $\vec w = m\vec g$: 9.8 N for every kilogram, pointing down, whether you stand, jump or orbit. The **normal force** is a surface’s push, perpendicular to it — whatever push is needed to stop you sinking in. It equals $mg$ only in special cases. A bathroom scale measures the normal force: your **apparent weight**. In an elevator with acceleration $a$ (up positive), Newton’s second law $N - mg = ma$ gives

$$N = m(g + a)$$

Speed up going up and you feel heavier. In free fall, $a = -g$ and the scale reads zero — “weightless”, though your weight has not changed at all.`,
  symbols: [
    { tex: '\\vec w = m\\vec g', text: 'weight: Earth’s gravitational pull on you, in newtons, pointing down' },
    { tex: 'm', text: 'mass, in kg: the same everywhere, on Earth, on the Moon or in orbit. It measures inertia, not weight' },
    { tex: 'g', text: 'the strength of gravity, 9.8 N/kg (= m/s²) at Earth’s surface; 1.62 on the Moon, 3.71 on Mars' },
    { tex: 'N', text: 'the normal force: the surface’s perpendicular push, in N — what a scale reads' },
    { tex: 'a', text: 'your acceleration (the elevator’s), in m/s², taken positive upward' },
  ],
  why: 'Apparent weight is what pilots and astronauts call g-load, and its vanishing in free fall is the observation general relativity is built on.',
  visual: {
    type: 'mech-fbd',
    title: 'A bathroom scale in an elevator',
    lead: t`A person stands on a bathroom scale in an elevator. On the right are the two forces on the person: their weight (from Earth) and the normal force (the scale’s push up). The scale shows that push.`,
    tasks: [
      'Set a = +3 m/s² (speeding up on the way up, or slowing on the way down): the scale reads more than mg.',
      'Set a = 0: still or moving steadily, the scale reads exactly mg — velocity does not matter, only acceleration.',
      'Drag a down to −9.8 m/s² — the cable has snapped: the scale reads zero, yet the weight arrow has not changed.',
    ],
    params: { scene: 'elevator', m: 70, a: 1.5, values: true, sliders: ['a', 'm'], names: ['Forces on the person'] },
    caption: t`Forces to scale. The scale is calibrated to show $N/g$ in “kilograms”, so it shows your mass only when $a = 0$. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A 60 kg person stands on a bathroom scale in an elevator that is moving up but slowing down, at 1.5 m/s². What force does the scale read, and what “mass” does it display?`,
    visual: scene('elevator', { m: 60, a: -1.5, v: 1, values: true, names: ['Forces on the person'] }, t`Moving up (green) but slowing down: the acceleration (gold) points down.`),
    steps: [
      { label: 'Direction of a', text: t`Moving up but slowing means the velocity is shrinking upward: the acceleration points **down**, $a = -1.5\ \text{m/s}^2$.` },
      { label: 'Free-body diagram', text: t`Two forces on the person: the scale’s push $N$ up and the weight $mg = (60)(9.8) = 588$ N down.` },
      { label: 'Second law', text: t`$N - mg = ma$, so $N = m(g + a) = 60\,(9.8 - 1.5) = 498$ N.` },
      { label: 'The display', text: t`The scale divides by $g$: $498/9.8 = 50.8$ “kg”.` },
      { label: 'Sense check', text: t`Less than her 60 kg: you feel lighter as an elevator slows near the top floor. Her weight is still 588 N throughout.` },
    ],
    answer: t`The scale pushes with $N = 498$ N and displays 50.8 kg; her weight is still 588 N.`,
  },
  practice: [
    num({
      id: 'moon-weight', difficulty: 1,
      gen(r) {
        const m = r.pick([110, 120, 135, 150, 165]);
        return {
          prompt: t`An astronaut and his spacesuit have a combined mass of ${m} kg. What do they weigh on the Moon, where $g = 1.62\ \text{m/s}^2$?`,
          visual: bodyFBD([force('N', m * G_MOON, 90, 'normal'), force('mg', m * G_MOON, 270, 'weight')], { icon: 'person', show: 'both', ground: true, name: 'Forces on the astronaut', caption: 'Standing still on the Moon: the ground’s push balances the weight.' }),
          answer: m * G_MOON, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'That is the weight on Earth. On the Moon, use the Moon’s g.' },
            { value: m, feedback: 'That is the mass, in kg, which is the same everywhere. Weight is a force: mg.' },
          ],
          hints: [t`Weight is $w = mg$, with the local $g$.`],
          teach: 'Mass is the same everywhere; weight is mg with the local g.',
          explain: t`$w = mg_\text{Moon} = (${m})(1.62) = ${s3(m * G_MOON)}$ N — about a sixth of the ${t3(m * G)} N he weighs on Earth, though his mass is still ${m} kg.`,
        };
      },
    }),
    num({
      id: 'push-down', difficulty: 2,
      gen(r) {
        const m = r.pick([4, 5, 6, 8, 10]), F = r.pick([15, 20, 25, 30, 40]);
        const N = m * G + F;
        return {
          prompt: t`A ${m} kg box rests on the floor. You press straight down on its lid with ${F} N. What is the normal force from the floor on the box?`,
          visual: bodyFBD([force('N', N, 90, 'normal'), force('mg', m * G, 270, 'weight'), force('F', F, 270, 'applied')], { icon: 'block', m, show: 'both', ground: true, agent: { dir: 270, kind: 'pole' }, ask: ['F0'], name: 'Forces on the box', caption: 'The box, pressed down from above, and its free-body diagram to scale.' }),
          answer: N, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'The normal force is not automatically mg: the floor must also hold up your push.' },
            { value: m * G - F, feedback: 'Your push is downward, like the weight: the floor must push up harder, not less.' },
          ],
          hints: ['The box does not accelerate, so the vertical forces cancel.', t`Up: $N$. Down: $mg$ and your ${F} N.`],
          teach: 'The normal force is whatever the surface must push to stop the object sinking in — not automatically mg.',
          explain: t`$N - mg - F = 0$, so $N = (${m})(9.8) + ${F} = ${s3(N)}$ N.`,
        };
      },
    }),
    mcq({
      id: 'constant-up', difficulty: 1,
      prompt: 'An elevator moves upward at a constant 3 m/s. Compared with your weight, the bathroom scale under you reads:',
      visual: scene('elevator', { m: 70, a: 0, v: 1, show: 'picture', reading: false, quiet: true }, 'Moving up (green arrow) at constant speed.'),
      choices: ['Exactly your weight', 'More than your weight, because the elevator is moving up', 'Less than your weight, because you are moving away from Earth', 'Zero, because the scale is moving with you'],
      answer: 0,
      why: {
        1: 'Moving up needs no extra force; only speeding up does. At constant velocity the forces balance.',
        2: 'A few metres of height make no noticeable difference to gravity.',
        3: 'The scale reads zero only in free fall. Here it must hold you up.',
      },
      hints: ['What is your acceleration? Use N = m(g + a).'],
      teach: 'A scale responds to acceleration, never to velocity.',
      explain: t`Constant velocity means $a = 0$, so $N = mg$: the scale reads your weight, exactly as it would at rest.`,
    }),
    num({
      id: 'elevator-read', difficulty: 2,
      gen(r) {
        const m = r.pick([55, 62, 70, 80, 90]), A = r.pick([1.2, 1.5, 2.0, 2.5]);
        const [desc, sgn, v] = r.pick([['moving up and speeding up', 1, 1], ['moving up and slowing down', -1, 1], ['moving down and speeding up', -1, -1], ['moving down and slowing down', 1, -1]]);
        const a = sgn * A, N = m * (G + a);
        return {
          prompt: t`A ${m} kg passenger stands on a bathroom scale in an elevator that is ${desc} at ${A} m/s². What force does the scale read?`,
          visual: scene('elevator', { m, a, v, reading: false, quiet: true, names: ['Forces on the passenger'] }, 'The elevator’s velocity (green) and acceleration (gold), and the passenger’s free-body diagram to scale.'),
          answer: N, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * (G - a), feedback: 'Check the direction of the acceleration: speeding up means a points along the velocity, slowing down means against it.' },
            { value: m * G, feedback: 'The elevator is accelerating, so the scale does not read mg.' },
          ],
          hints: ['Decide the direction of the acceleration first: along the velocity if speeding up, against it if slowing down.', t`$N = m(g + a)$ with $a = ${a > 0 ? '+' : '-'}${A}$ m/s² (up positive).`],
          teach: 'Find the direction of a from how the speed changes, then N = m(g + a).',
          explain: t`The acceleration points ${a > 0 ? 'up' : 'down'}: $a = ${a}$ m/s². $N = m(g + a) = ${m}(9.8 ${a > 0 ? '+' : '-'} ${A}) = ${s3(N)}$ N.`,
        };
      },
    }),
    num({
      id: 'scale-to-accel', difficulty: 3,
      gen(r) {
        const m = r.pick([60, 65, 75, 80]), a = r.pick([-2.4, -1.8, -1.2, 1.2, 1.8, 2.4]);
        const N = Math.round(m * (G + a));
        const ans = N / m - G;
        return {
          prompt: t`A ${m} kg passenger’s bathroom scale in an elevator reads ${N} N. What is the elevator’s acceleration? (Take up as positive.)`,
          visual: scene('elevator', { m, a: ans, show: 'fbd', values: true, accel: false, names: ['Forces on the passenger'] }, 'The passenger’s free-body diagram, to scale, with the scale reading as N.'),
          answer: ans, units: 'm/s^2', tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: N / m, feedback: t`That is $N/m$. The scale also has to support the weight: $a = N/m - g$.` }],
          hints: [t`Second law: $N - mg = ma$.`, t`$a = N/m - g = ${N}/${m} - 9.8$.`],
          teach: 'A scale reading gives the acceleration: a = N/m − g, negative meaning downward.',
          explain: t`$a = \dfrac{N}{m} - g = \dfrac{${N}}{${m}} - 9.8 = ${s3(ans)}\ \text{m/s}^2$: ${ans < 0 ? 'downward — the scale reads less than the weight' : 'upward — the scale reads more than the weight'} (${t3(m * G)} N). Whether the elevator is moving up or down cannot be told from the scale.`,
        };
      },
    }),
    mcq({
      id: 'iss-weightless', difficulty: 2,
      prompt: 'Astronauts aboard the International Space Station, about 400 km up, float freely. Why?',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 2000], y: [0, 11], xlabel: 'height above the surface (km)', ylabel: 'g (m/s²)', xticks: 5, yticks: 5,
          curves: [{ fn: '9.8*(6371/(6371 + x))^2', color: 'accent', label: 'g = 9.8 (R/(R+h))²', labelAt: 1300, labelDy: -14 }],
          points: [{ x: 400, y: 9.8 * (6371 / 6771) ** 2, color: 'warn', label: 'ISS: 8.7 m/s²' }],
          hlines: [{ y: 9.8, label: 'surface: 9.8' }],
        },
        caption: 'The strength of gravity above Earth (Newton’s inverse-square law, R = 6371 km): at the station’s height it is still about 89% of its surface value.',
      },
      choices: [
        'They and the station are in free fall together, while gravity there is still about 89% of its surface value',
        'There is no gravity in space',
        'At 400 km, gravity is too weak to notice',
        'The station’s motion creates an outward force that cancels gravity',
      ],
      answer: 0,
      why: {
        1: 'Gravity reaches the Moon and far beyond; at 400 km it is barely weaker than on the ground.',
        2: 'g is 8.7 m/s² up there — only 11% less than at the surface.',
        3: 'In the ground’s frame nothing pushes outward: gravity is the only force, and it keeps both falling around Earth together.',
      },
      hints: ['Read g at 400 km off the graph. Is gravity really missing?', 'If the floor falls exactly as fast as you do, how hard must it push on you?'],
      teach: 'Weightlessness means free fall — no normal force — not the absence of gravity.',
      explain: t`At 400 km, $g = 9.8\,(6371/6771)^2 = 8.7\ \text{m/s}^2$. The astronauts and the station both fall with that acceleration (sideways fast enough to keep missing Earth), so the floor never needs to push: $N = m(g + a) = 0$.`,
    }),
    mcq({
      id: 'angle-push-error', difficulty: 3, kind: 'error',
      prompt: t`A 5.0 kg box is pushed across a level floor with 40 N directed 30° **below** the horizontal. A student writes: “The normal force is $N = mg = 49$ N.” What is wrong?`,
      visual: scene('floor', { m: 5, F: 40, phi: -30, mus: 0.9, muk: 0.3, show: 'picture', quiet: true }, 'The box, pushed down and forward by a pole at 30° below the horizontal.'),
      choices: [
        t`The push has a downward component, so $N = mg + F\sin 30^\circ = 69$ N`,
        t`The push lifts the box, so $N = mg - F\sin 30^\circ = 29$ N`,
        t`All of the push presses on the floor, so $N = mg + F = 89$ N`,
        t`Nothing: on level ground the normal force always equals $mg$`,
      ],
      answer: 0,
      why: {
        1: 'A push directed below the horizontal presses the box down; it does not lift it.',
        2: t`Only the vertical component, $F\sin 30^\circ$, presses into the floor; the horizontal part pushes along it.`,
        3: 'N equals mg only when nothing else pushes or pulls vertically and the box does not accelerate vertically.',
      },
      hints: ['Split the push into horizontal and vertical components.', t`The vertical component is $F\sin 30^\circ = 20$ N, downward. Add it to the weight.`],
      teach: 'Any vertical component of an applied force changes the normal force.',
      explain: t`Vertically the box does not accelerate: $N = mg + F\sin 30^\circ = 49 + 20 = 69$ N. More normal force also means more friction.`,
    }),
    num({
      id: 'pull-angle', difficulty: 2,
      gen(r) {
        const m = r.pick([20, 25, 30]), T = r.pick([60, 80, 100]), phi = r.pick([20, 30, 40]);
        const N = m * G - T * sin(phi);
        return {
          prompt: t`You pull on a rope tied to a ${m} kg crate with ${T} N, at ${phi}° above the horizontal, but the crate does not budge. What is the normal force from the floor?`,
          visual: scene('floor', { m, F: T, phi, mus: 0.8, muk: 0.5, ask: ['N'], labels: { F: 'T' }, names: ['Forces on the crate'] }, 'The crate held by static friction, and its free-body diagram to scale.'),
          answer: N, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'The rope pulls partly upward, so the floor has less to hold up.' },
            { value: m * G + T * sin(phi), feedback: 'The rope’s vertical component points up: subtract it.' },
            { value: m * G - T * Math.cos((phi * Math.PI) / 180), feedback: t`The vertical component of the pull is $T\sin\varphi$, not $T\cos\varphi$.` },
          ],
          hints: ['Vertically, the crate does not accelerate.', t`$N + T\sin ${phi}^\circ - mg = 0$.`],
          teach: 'A pull with an upward component reduces the normal force below mg.',
          explain: t`$N = mg - T\sin\varphi = (${m})(9.8) - ${T}\sin ${phi}^\circ = ${s3(N)}$ N — less than the weight, ${t3(m * G)} N.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gload', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([1.5, 2, 2.5, 3]), a = k * G;
        return {
          prompt: t`During launch, a crewed rocket climbs straight up with an acceleration of ${s3(a)} m/s². What is an astronaut’s apparent weight — the push of the seat on her — as a multiple of her ordinary weight (the “g-load”)?`,
          visual: bodyFBD([force('N (seat)', 75 * (G + a), 90, 'normal'), force('mg', 75 * G, 270, 'weight')], { icon: 'person', show: 'fbd', a: [0, a], accel: true, name: 'Forces on the astronaut', caption: 'Her free-body diagram during the climb, to scale.' }),
          answer: (G + a) / G, tol: { rel: 0.01 },
          errors: [
            { value: a / G, feedback: 'The seat must also hold up her weight: N = m(g + a), not ma.' },
            { value: (a - G) / G, feedback: 'The seat pushes up against gravity as well as accelerating her: add g, do not subtract it.' },
          ],
          hints: [t`$N = m(g + a)$; divide by $mg$.`],
          teach: 'g-load is apparent weight over true weight: (g + a)/g for vertical acceleration a.',
          explain: t`$\dfrac{N}{mg} = \dfrac{g + a}{g} = \dfrac{9.8 + ${s3(a)}}{9.8} = ${s3((G + a) / G)}$. The Space Shuttle throttled its engines so its crews never felt more than about 3 g.`,
        };
      },
    }),
    mcq({
      id: 'cp-cable', difficulty: 2,
      prompt: 'An elevator’s cable snaps and the car falls freely (ignore air resistance and the safety brakes). During the fall, what does the bathroom scale under a passenger read, and what is the passenger’s weight?',
      visual: scene('elevator', { m: 70, a: -G, v: -1, show: 'picture', reading: false, quiet: true }, 'The car falling freely: velocity (green) and acceleration (gold) both point down.'),
      choices: ['The scale reads zero; the weight is still mg', 'Both are zero', 'The scale reads mg; the weight is zero', 'The scale reads more than mg, because the car is moving fast'],
      answer: 0,
      why: {
        1: 'Gravity still pulls the passenger — it is what makes everything fall. Only the scale’s push vanishes.',
        2: 'Weight is the pull of Earth, which has not changed. The scale reads the normal force, which has.',
        3: 'Speed does not change the reading; with a = −g, N = m(g − g) = 0.',
      },
      hints: ['Use N = m(g + a) with a = −g.'],
      teach: 'In free fall the normal force vanishes while the weight stays mg — that is what weightless means.',
      explain: t`With $a = -g$: $N = m(g - g) = 0$. The scale reads zero because it falls exactly as fast as the passenger; Earth still pulls with $mg$.`,
    }),
    num({
      id: 'cp-two-scales', difficulty: 3,
      gen(r) {
        const m = r.pick([60, 70, 80]), A = r.pick([1.2, 1.6, 2.0]);
        const each = (m * (G - A)) / 2;
        return {
          prompt: t`A ${m} kg person stands with one foot on each of two bathroom scales, weight shared evenly, in an elevator speeding up on its way **down** at ${A} m/s². What does each scale read?`,
          visual: bodyFBD([force('N₁', each, 90, 'normal'), force('N₂', each, 90, 'normal'), force('mg', m * G, 270, 'weight')], { icon: 'person', show: 'fbd', ask: ['F0', 'F1'], name: 'Forces on the person', caption: 'Two scales, two upward pushes, to scale.' }),
          answer: each, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: 2 * each, feedback: 'That is the total of both scales. Each foot carries half.' },
            { value: (m * G) / 2, feedback: 'The elevator accelerates downward, so together the scales push less than mg.' },
            { value: (m * (G + A)) / 2, feedback: 'Speeding up while going down means the acceleration points down: a = −A.' },
          ],
          hints: ['Speeding up while going down: which way does a point?', t`Together: $N_1 + N_2 = m(g + a)$ with $a = -${A}$ m/s²; each carries half.`],
          teach: 'With several supports, the normal forces together equal m(g + a).',
          explain: t`$N_1 + N_2 = m(g - ${A}) = ${m}(${s3(G - A)}) = ${s3(2 * each)}$ N, so each scale reads ${s3(each)} N.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §5.4 Mass and Weight', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-4-mass-and-weight' },
    { label: 'OpenStax University Physics Vol. 1, §5.6 Common Forces', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-6-common-forces' },
  ],
});
