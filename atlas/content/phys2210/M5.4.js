// Newton's third law: forces come in equal and opposite pairs, acting on two different bodies.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, pairPicture, s3, sf } from './_forces.js';

const t = String.raw;
const M_EARTH = 5.97e24;   // kg

export default lesson({
  id: 'phys2210.M5.4',
  title: 'Newton’s third law',
  minutes: 9, difficulty: 2,
  intro: t`Forces come in pairs. Whenever object A exerts a force on object B, B exerts a force on A that is **equal in size and opposite in direction**:

$$\vec F_{\text{A on B}} = -\vec F_{\text{B on A}}$$

The two forces of a pair act on **different** objects, so they never cancel each other: any one free-body diagram shows only one of them. They are the same kind of force — contact with contact, gravity with gravity — and they exist at the same instant. A rocket is the third law at work: it pushes its exhaust backward, the exhaust pushes the rocket forward, and no air or ground is needed.`,
  symbols: [
    { tex: '\\vec F_{\\text{A on B}}', text: 'the force object A exerts on object B, in newtons (N)' },
    { tex: '\\vec F_{\\text{B on A}}', text: 'the force B exerts back on A: the partner of the first' },
    { tex: '-', text: 'the minus sign: the partner points the opposite way, with exactly the same size' },
    { tex: '\\text{A},\\ \\text{B}', text: 'any two interacting objects — you and Earth, a rocket and its exhaust, two colliding cars' },
  ],
  why: 'The third law is why a rocket can accelerate in empty space, and it is the root of momentum conservation (module M9): in every interaction, what one body gains the other loses.',
  visual: {
    type: 'mech-fbd',
    title: 'Two blocks, one pair of forces',
    lead: t`A pole pushes the rear block, which pushes the front one, across a frictionless floor. On the right is each block’s free-body diagram. The violet arrows are a **third-law pair**: the rear block pushes the front one forward, and the front one pushes the rear one back.`,
    tasks: [
      'Make the front block much heavier: the contact force P grows, but the two violet arrows stay exactly equal.',
      'Make the front block very light: P shrinks toward zero — yet the pair is still equal and opposite.',
      'Notice that each violet arrow sits on a different diagram: a third-law pair never cancels on one body.',
    ],
    params: { scene: 'pair', m1: 4, m2: 2, F: 18, link: 'push', values: true, sliders: ['F', 'm1', 'm2'] },
    caption: t`Forces to one scale on both diagrams; the floor is frictionless. Each block’s weight is balanced by the floor’s push. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`You push a 4.0 kg block with a horizontal 18 N force, and it pushes a 2.0 kg block ahead of it across a frictionless floor. Find their acceleration and the force each block exerts on the other.`,
    visual: scene('pair', { m1: 4, m2: 2, F: 18, values: true }, t`Both blocks and their free-body diagrams, to scale; the violet arrows are the third-law pair.`),
    steps: [
      { label: 'Both blocks as one system', text: t`The forces between the blocks are internal and cancel, so only your push accelerates the pair: $a = \dfrac{F}{m_1 + m_2} = \dfrac{18}{6.0} = 3.0\ \text{m/s}^2$.` },
      { label: 'The front block alone', text: t`Horizontally, only the rear block pushes it: $P = m_2 a = (2.0)(3.0) = 6.0$ N, forward.` },
      { label: 'Third law', text: t`So the front block pushes back on the rear block with 6.0 N, backward — the same size, on the other body.` },
      { label: 'Check on the rear block', text: t`$F - P = 18 - 6.0 = 12$ N $= m_1 a = (4.0)(3.0)$. ✓` },
      { label: 'Sense check', text: t`$P$ is smaller than your 18 N: the front block needs only its own share, $\dfrac{m_2}{m_1 + m_2}F$.` },
    ],
    answer: t`$a = 3.0\ \text{m/s}^2$; the blocks push on each other with 6.0 N — forward on the front block, backward on the rear one.`,
  },
  practice: [
    mcq({
      id: 'truck-car', difficulty: 1,
      prompt: 'A heavy truck collides head-on with a small car. During the collision, how does the force of the truck on the car compare with the force of the car on the truck?',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.01, 0.13], y: [-380, 380], xlabel: 't (s)', ylabel: 'force (kN)', yticks: 6,
          curves: [
            { fn: '300*sin(pi*x/0.1)^2', domain: [0, 0.1], color: 'accent', label: 'truck on car', labelAt: 0.068, labelDx: 8, labelDy: -4 },
            { fn: '-300*sin(pi*x/0.1)^2', domain: [0, 0.1], color: 'warn', label: 'car on truck', labelAt: 0.068, labelDx: 8, labelDy: 4 },
          ],
        },
        caption: 'Force sensors on the two vehicles would record mirror images at every instant (an illustrative pulse; positive is toward the truck’s direction of travel).',
      },
      choices: ['Equal in size and opposite in direction', 'The truck’s force is larger, because the truck has more mass', 'The car’s force is smaller, which is why the car is damaged more', 'They are equal only if the two were going at the same speed'],
      answer: 0,
      why: {
        1: 'Mass does not set the size of an interaction force. The two forces are one interaction, seen from each side: always equal.',
        2: 'The car is damaged more because the same force gives its smaller mass a much larger acceleration, not because it feels a larger force.',
        3: 'Speeds do not matter: the third law holds at every instant of every interaction.',
      },
      hints: ['The two forces are the two halves of one interaction.'],
      teach: 'In any interaction the two forces are equal and opposite; the lighter body simply accelerates more.',
      explain: 'Third law: the truck pushes the car exactly as hard as the car pushes the truck, at every instant. The car suffers more because $a = F/m$ is much larger for its smaller mass.',
    }),
    mcq({
      id: 'book-pair', difficulty: 2,
      prompt: 'A book rests on a table. Its weight is Earth pulling down on the book. What is the third-law partner of the book’s weight?',
      visual: scene('floor', { m: 1.5, F: 0, accel: false, quiet: true, names: ['Forces on the book'] }, 'The book on the table, and the two forces that act on it.'),
      choices: ['The book’s gravitational pull on Earth, upward', 'The table’s normal force pushing up on the book', 'The book’s push down on the table', 'None: the book is not moving, so there is no partner'],
      answer: 0,
      why: {
        1: 'Both of those act on the book, and they are different kinds of force (gravity and contact). They balance here because the book does not accelerate — the first law, not the third.',
        2: 'That is the partner of the normal force: the book and the table pushing on each other.',
        3: 'Every force has a partner, whether or not anything moves.',
      },
      hints: ['A pair involves the same two objects, swapped: Earth on book ↔ book on ___.'],
      teach: 'A third-law pair swaps the two objects: Earth pulls the book, so the book pulls Earth.',
      explain: 'Earth pulls the book down; the partner is the book pulling Earth up, with the same size. The table’s normal force also acts on the book, so it cannot be the partner — its partner is the book pushing down on the table.',
    }),
    num({
      id: 'contact-force', difficulty: 2,
      gen(r) {
        const m1 = r.pick([3, 4, 5, 6]), m2 = r.pick([1, 1.5, 2, 2.5]), F = r.pick([12, 15, 18, 24, 30]);
        const M = m1 + m2, P = (m2 * F) / M;
        return {
          prompt: t`You push a ${m1} kg block with a horizontal ${F} N force; it pushes a ${m2} kg block ahead of it across a frictionless floor. How hard does the rear block push on the front block?`,
          visual: scene('pair', { m1, m2, F, ask: ['P'] }, 'The two blocks and their free-body diagrams, to scale; P is the pair of contact forces.'),
          answer: P, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: F, feedback: 'The front block does not feel your whole push: it only needs enough force for its own mass to keep up.' },
            { value: (m1 * F) / M, feedback: 'That is the net force on the rear block. The front block’s share is m₂F/(m₁ + m₂).' },
          ],
          hints: ['Find the shared acceleration first, treating both blocks as one system.', t`Then apply $F = ma$ to the front block alone: only $P$ pushes it.`],
          teach: 'Find the acceleration from the whole system, then the contact force from the body it acts on.',
          explain: t`$a = ${F}/${M} = ${s3(F / M)}\ \text{m/s}^2$, so $P = m_2 a = ${m2}\times${s3(F / M)} = ${s3(P)}$ N. By the third law the front block pushes back on the rear one with ${s3(P)} N.`,
        };
      },
    }),
    mcq({
      id: 'horse-cart', difficulty: 2,
      prompt: 'A horse pulls a cart. By the third law, the cart pulls back on the horse exactly as hard. So how can the horse and cart speed up?',
      visual: bodyFBD([force('ground', 1400, 0, 'friction'), force('cart', 1000, 180, 'tension')], { show: 'fbd', values: true, name: 'Horizontal forces on the horse', caption: 'The horse speeding up: the ground pushes its hooves forward, the cart pulls it back. Illustrative sizes; the vertical forces (weight, ground’s upward push) cancel and are left out.' }),
      choices: [
        'The pair acts on different bodies; the horse speeds up because the ground pushes it forward harder than the cart pulls it back',
        'The horse pulls on the cart slightly harder than the cart pulls on the horse',
        'The forces cancel, so they can only move at constant speed',
        'The cart’s pull is delayed, so the horse gets ahead before it arrives',
      ],
      answer: 0,
      why: {
        1: 'The third law has no exceptions: the two pulls are always equal, even while speeding up.',
        2: 'They cannot cancel: one acts on the cart and the other on the horse.',
        3: 'The pair exists at the same instant; there is no delay.',
      },
      hints: ['To decide whether the horse accelerates, draw the forces on the horse only.', 'Which force on the horse points forward? Who exerts it?'],
      teach: 'Whether a body accelerates depends only on the forces on that body, never on the forces it exerts.',
      explain: 'On the horse: the ground pushes forward (friction on the hooves), the cart pulls back. The horse speeds up when the ground’s push wins. On the cart: the horse’s pull forward beats the cart’s friction. The equal pull and pull-back act on different bodies.',
    }),
    num({
      id: 'astronaut', difficulty: 2,
      gen(r) {
        const ma = r.pick([90, 100, 110, 120]), ms = r.pick([300, 400, 450, 600]), F = r.pick([40, 50, 60, 75]);
        return {
          prompt: t`Floating outside the station, a ${ma} kg astronaut (suit included) pushes a ${ms} kg satellite away with a steady ${F} N. What is the size of the satellite’s acceleration?`,
          visual: pairPicture({ names: ['astronaut', 'satellite'], masses: [ma, ms], F, caption: 'One interaction, two bodies: equal and opposite pushes (violet) and accelerations F/m (gold), each to its own scale.' }),
          answer: F / ms, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: F / ma, feedback: 'That is the astronaut’s acceleration. The satellite feels the same force but has more mass.' },
            { value: F / (ma + ms), feedback: 'Each body accelerates under the one force on it: divide by the satellite’s mass alone.' },
          ],
          hints: [t`By the third law the satellite feels the same ${F} N; then use $a = F/m$.`],
          teach: 'Equal and opposite forces give accelerations in inverse proportion to the masses.',
          explain: t`The satellite: $a = ${F}/${ms} = ${sf(F / ms, 3)}\ \text{m/s}^2$. The astronaut feels ${F} N backward: $a = ${F}/${ma} = ${sf(F / ma, 3)}\ \text{m/s}^2$, ${sf(ms / ma, 3)} times larger.`,
        };
      },
    }),
    multi({
      id: 'which-pairs', difficulty: 2,
      prompt: 'Which of these are third-law pairs? Select all that are.',
      choices: [
        'Earth pulls the Moon; the Moon pulls Earth',
        'A table pushes up on a book; the book pushes down on the table',
        'A book’s weight; the table’s upward push on the same book',
        'A rope pulls a crate forward; friction from the floor pulls the crate back',
        'A rocket pushes its exhaust backward; the exhaust pushes the rocket forward',
      ],
      answer: [0, 1, 4],
      why: {
        2: 'Both act on the book — the two forces of a pair act on two different objects.',
        3: 'Both act on the crate, and they are different kinds of force; they need not even be equal.',
      },
      hints: ['A pair swaps the roles: A on B, then B on A. Both forces on one body cannot be a pair.'],
      teach: 'A third-law pair always involves the same two objects, with their roles swapped.',
      explain: 'Earth–Moon, table–book and rocket–exhaust each swap the roles of the same two objects. The weight and the normal force both act on the book; the rope’s pull and friction both act on the crate.',
    }),
    num({
      id: 'earth-recoil', difficulty: 3,
      gen(r) {
        const m = r.pick([55, 60, 70, 80, 90]);
        const aE = (m * G) / M_EARTH;
        return {
          prompt: t`A ${m} kg diver steps off a high board. While she falls, Earth pulls her down with her weight — and she pulls Earth up just as hard. What is the size of Earth’s acceleration toward her? (Earth’s mass is $5.97\times10^{24}$ kg.)`,
          visual: pairPicture({ names: ['diver', 'Earth'], masses: [m, M_EARTH], F: m * G, attract: true, labels: ['mg', 'mg'], caption: 'Equal pulls (violet), wildly unequal accelerations (gold); not to scale.' }),
          answer: aE, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: G, feedback: 'That is the diver’s acceleration. Earth feels the same force, but its mass is enormous.' }],
          hints: [t`The force on Earth equals her weight, $mg$.`, t`Earth’s acceleration is $mg/M_\text{Earth}$.`],
          teach: 'Third-law partners are equal in size, but the accelerations they cause scale as one over the mass.',
          explain: t`The pull on Earth is $mg = ${sf(m * G, 3)}$ N, so $a_\text{Earth} = ${sf(m * G, 3)}/(5.97\times10^{24}) = ${aE.toExponential(2).replace(/e([+-]\d+)/, (q, e) => `\\times10^{${+e}}`)}\ \text{m/s}^2$ — far too small to notice.`,
        };
      },
    }),
    num({
      id: 'swap-push', difficulty: 3,
      gen(r) {
        const big = r.pick([4, 5, 6]), small = r.pick([1, 1.5, 2]), F = r.pick([12, 15, 18, 21]);
        const M = big + small, P1 = (small * F) / M, P2 = (big * F) / M;
        return {
          prompt: t`Pushing a ${big} kg block into a ${small} kg block across a frictionless floor with ${F} N, the blocks press on each other with ${s3(P1)} N. Now you push the same pair from the other side, on the ${small} kg block, with the same ${F} N. How hard do the blocks press on each other now?`,
          visual: scene('pair', { m1: small, m2: big, F, ask: ['P'] }, `The second arrangement: now the ${small} kg block is at the rear.`),
          answer: P2, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: P1, feedback: 'The contact force changes: now the heavy block is in front, and it needs a bigger push to keep up.' },
            { value: F, feedback: 'Only part of your push passes to the front block — the part its own mass needs.' },
          ],
          hints: ['The acceleration is the same as before. Which block does the contact force now have to accelerate?', t`$P = m_\text{front}\,a$, with $a = F/(m_1 + m_2)$.`],
          teach: 'The contact force between pushed blocks is whatever the front block needs: its own mass times the shared acceleration.',
          explain: t`Same acceleration, $a = ${F}/${M} = ${s3(F / M)}\ \text{m/s}^2$, but now the front block has ${big} kg: $P = ${big}\times${s3(F / M)} = ${s3(P2)}$ N. Either way the two blocks push on each other equally.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion', difficulty: 3, transfer: true,
      gen(r) {
        const F = r.pick([0.05, 0.07, 0.09]), m = r.pick([1100, 1200, 1300]), days = r.pick([1, 2, 3]);
        const dv = (F * days * 86400) / m;
        return {
          prompt: t`NASA’s Dawn spacecraft used ion engines: electric fields shove xenon ions out of the back. Suppose the thruster pushes the ions backward with ${F} N, and the spacecraft’s mass is ${m} kg. Far from any planet, how much does Dawn’s speed increase in ${days} day${days > 1 ? 's' : ''} of steady thrust?`,
          visual: bodyFBD([force('push of the ions', F, 0, 'thrust')], { icon: 'probe', show: 'both', v: [1, 0], name: 'Forces on the spacecraft', caption: 'The only force on the spacecraft: the push of the ions it expels. (Gravity far from planets is ignored.)' }),
          answer: dv, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: F / m, feedback: 'That is the acceleration, in m/s². Multiply by the time, in seconds.' },
            { value: (F * days * 24) / m, feedback: 'Convert days to seconds: one day is 86 400 s.' },
          ],
          hints: [t`By the third law the ions push the spacecraft forward with ${F} N.`, t`$a = F/m$; then $\Delta v = a\,t$ with $t$ in seconds.`],
          teach: 'A rocket accelerates because the exhaust it pushes back pushes it forward — no surroundings needed.',
          explain: t`$a = ${F}/${m} = ${sf(F / m, 3)}\ \text{m/s}^2$, and $t = ${days}\times86\,400$ s, so $\Delta v = ${s3(dv)}$ m/s. Tiny thrust, but kept up for months it built up kilometres per second.`,
        };
      },
    }),
    mcq({
      id: 'cp-elevator', difficulty: 2,
      prompt: 'In an elevator accelerating upward, the floor pushes up on you harder than Earth pulls you down. Does this break Newton’s third law?',
      visual: scene('elevator', { m: 70, a: 2, values: true, names: ['Forces on you'] }, 'You in an elevator accelerating upward at 2 m/s², and your free-body diagram.'),
      choices: [
        'No: the floor’s push and your weight both act on you, so they are not a pair; the floor’s partner is your push down on the floor, which is just as large',
        'Yes: the third law fails in accelerating elevators',
        'No, but only because the third law applies only when nothing accelerates',
        'Yes, unless the elevator is moving at constant velocity',
      ],
      answer: 0,
      why: {
        1: 'The third law holds in every interaction, accelerating or not.',
        2: 'Nothing restricts the third law to bodies at rest: partners are equal even in collisions and launches.',
        3: 'The law is not broken here at all, because the two forces in question are not partners.',
      },
      hints: ['Which forces act on you? Which body does each one’s partner act on?'],
      teach: 'Unequal forces on one body are no puzzle: third-law partners always act on different bodies.',
      explain: 'Both forces on your diagram act on you: they differ because you accelerate (second law). The normal force’s partner is your push on the floor, equally large; your weight’s partner is your pull on Earth.',
    }),
    num({
      id: 'cp-tow', difficulty: 2,
      gen(r) {
        const mt = r.pick([400, 500, 600, 750]), a = r.pick([0.8, 1.0, 1.2, 1.5]), R = r.pick([150, 200, 250, 300]);
        const T = mt * a + R;
        return {
          prompt: t`A car tows a ${mt} kg trailer with a rigid bar, speeding up at ${a} m/s². Rolling resistance on the trailer is ${R} N. How hard does the trailer pull back on the car?`,
          visual: bodyFBD([force('T', T, 0, 'tension'), force('R', R, 180, 'friction'), force('N', mt * G, 90, 'normal'), force('mg', mt * G, 270, 'weight')], { show: 'fbd', ask: ['F0'], name: 'Forces on the trailer', caption: 'The trailer’s free-body diagram, to scale; T is the bar’s pull.' }),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: mt * a, feedback: 'The bar must also overcome the rolling resistance on the trailer.' },
            { value: R, feedback: 'That would only hold the trailer at constant speed; it is speeding up.' },
          ],
          hints: ['Find the bar’s pull on the trailer from the trailer’s own diagram; the third law gives the pull on the car.'],
          teach: 'Find a force from the body it acts on, then use the third law to get its partner.',
          explain: t`On the trailer: $T - R = m_t a$, so $T = (${mt})(${a}) + ${R} = ${s3(T)}$ N. The trailer pulls back on the car with the same ${s3(T)} N.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §5.5 Newton’s Third Law', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-5-newtons-third-law' }],
});
