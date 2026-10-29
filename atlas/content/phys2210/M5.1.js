// Forces and free-body diagrams: isolate one body, draw every force on it, add them as vectors.
import { lesson, mcq, multi, num, order, match } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, sin, cos } from './_forces.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M5.1',
  title: 'Forces and free-body diagrams',
  minutes: 10, difficulty: 2,
  intro: t`A **force** is a push or a pull that one object exerts on another — an interaction, always with an agent you can name. **Contact forces** need touching: the normal force, friction, tension, air drag, a rocket’s thrust. **Long-range forces** act across space: gravity, and electric and magnetic forces. Forces are vectors, and what changes an object’s motion is their vector sum, the **net force**:

$$\vec F_\text{net} = \sum_i \vec F_i = \vec F_1 + \vec F_2 + \cdots$$

A **free-body diagram** isolates one object, shrinks it to a dot and draws every force acting *on* it — and nothing else. It is the first step of nearly every mechanics problem, from a crate on a ramp to a rocket climbing through the atmosphere.`,
  symbols: [
    { tex: '\\vec F_i', text: 'one force acting on the object, in newtons (N); each has an agent — Earth, the floor, a rope, the air' },
    { tex: '\\sum_i', text: 'add over **every force acting on this one object** — never the forces it exerts on other things' },
    { tex: '\\vec F_\\text{net}', text: 'the net force: the vector sum of all of them, in N. Its direction need not match any single force' },
    { tex: 'F_{\\text{net},x} = \\sum_i F_{ix}', text: 'in components: add the $x$-parts and the $y$-parts separately, then combine' },
    { tex: '1\\,\\mathrm{N}', text: 'one newton = 1 kg·m/s², roughly the weight of a small apple' },
  ],
  why: 'Every mechanics problem from here to orbital mechanics starts the same way: isolate one body and account for every force on it. Get the diagram right and the algebra is routine.',
  visual: {
    type: 'mech-fbd',
    title: 'One crate, every force on it',
    lead: t`A crate on a floor, pulled by a rope. On the right is the crate alone, shrunk to a dot carrying **every force that acts on it**: its weight (from Earth), the normal force and friction (from the floor) and the pull (from the rope). Change the pull and watch each force respond.`,
    tasks: [
      'Raise the rope angle φ: the floor pushes up less (N drops below mg), because the rope now holds up part of the crate.',
      'Turn on “Add the forces tip to tail”. While the crate stays put, the arrows close into a loop: the net force is zero.',
      'Pull harder until it slides: the loop no longer closes, and the gold net-force arrow points the way the crate speeds up.',
    ],
    params: { scene: 'floor', m: 10, F: 40, phi: 25, mus: 0.5, muk: 0.3, values: true, names: ['Forces on the crate'], sliders: ['F', 'phi', 'm'], toggles: ['sum', 'values'] },
    caption: t`Every force is drawn to one scale. Friction is static — whatever is needed, up to $\mu_s N$ with $\mu_s = 0.5$ — until the crate slips, then kinetic, $\mu_k N$ with $\mu_k = 0.3$. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A 20 kg sled is pulled across level snow by a rope at 30° above the horizontal, with a tension of 80 N. Kinetic friction from the snow is 15 N. Draw the free-body diagram and find the net force on the sled.`,
    visual: scene('floor', { m: 20, F: 80, phi: 30, muk: 15 / (20 * G - 40), mus: 0.2, moving: true, values: true, labels: { F: 'T' }, names: ['Forces on the sled'] }, t`The sled and its free-body diagram, forces to scale. $g = 9.8\ \text{m/s}^2$.`),
    steps: [
      { label: 'Isolate the sled', text: t`Name every agent. Earth pulls down: the weight $mg = (20)(9.8) = 196$ N. The snow pushes up (normal force $N$) and back (friction, 15 N). The rope pulls along itself (80 N at 30°). Nothing else touches the sled — there is no “force of motion”.` },
      { label: 'Choose axes', text: t`$x$ along the snow in the direction of motion, $y$ straight up. Only the rope is slanted.` },
      { label: 'Split the slanted force', text: t`$T_x = 80\cos 30^\circ = 69.3$ N and $T_y = 80\sin 30^\circ = 40.0$ N.` },
      { label: 'Vertical', text: t`The sled stays on the snow, so the vertical forces must cancel (the next two lessons show why): $N + 40.0 - 196 = 0$, so $N = 156$ N — **less than its weight**, because the rope lifts part of it.` },
      { label: 'Horizontal', text: t`$F_{\text{net},x} = 69.3 - 15 = 54.3$ N, forward. The vertical parts sum to zero, so this is the whole net force.` },
      { label: 'Sense check', text: t`The net force is far smaller than any single big force on the sled: most forces cancel, and the diagram shows exactly which ones.` },
    ],
    answer: t`$\vec F_\text{net} = 54.3$ N forward, along the snow (and the snow pushes up with only $N = 156$ N).`,
  },
  practice: [
    mcq({
      id: 'book-forces', difficulty: 1,
      prompt: 'A book rests on a level table. Which forces act **on the book**?',
      visual: scene('floor', { m: 1.5, F: 0, show: 'picture', quiet: true }, 'A 1.5 kg book at rest on a table.'),
      choices: [
        'Its weight (Earth pulls it down) and the normal force (the table pushes it up)',
        'Its weight, the normal force, and the book’s own push down on the table',
        'Only its weight — the table just blocks the way',
        'Its weight and the force of the table’s legs on the floor',
      ],
      answer: 0,
      why: {
        1: 'The book’s push on the table acts on the *table*. A free-body diagram of the book holds only forces exerted *on* the book.',
        2: 'Blocking the way is a force: the table pushes up on the book. Without that push the book would fall through.',
        3: 'The legs push on the floor, not on the book. Only things touching the book — plus Earth’s gravity — act on it.',
      },
      hints: ['List what touches the book, then add the one force that acts without touching.'],
      teach: 'A free-body diagram holds only forces exerted on the chosen object: one for each thing touching it, plus its weight.',
      explain: t`Two agents act on the book: Earth (weight $mg$, down) and the table (normal force $N$, up). Here they cancel, so the net force is zero.`,
    }),
    multi({
      id: 'puck-forces', difficulty: 2,
      prompt: 'A hockey puck slides across rough ice, a moment after leaving the stick. Select **every** force acting on the puck.',
      visual: bodyFBD([], { icon: 'puck', show: 'picture', ground: true, v: [1, 0], caption: 'The puck, a moment after leaving the stick, sliding to the right.' }),
      choices: ['Its weight, downward', 'The normal force from the ice, upward', 'Kinetic friction from the ice, backward', 'The force of the stick, still pushing it forward', 'A “force of motion” that keeps it going'],
      answer: [0, 1, 2],
      why: {
        3: 'The stick stopped touching the puck when it left. A contact force needs contact.',
        4: 'Moving needs no force to keep it going — and no agent could exert a “force of motion”.',
      },
      hints: ['A contact force needs something touching the puck right now.', 'Only Earth and the ice act on it now: the ice pushes up and drags back.'],
      teach: 'Every real force has an agent acting now: once nothing touches an object, only long-range forces like gravity remain.',
      explain: 'Earth pulls it down (weight); the ice pushes it up (normal force) and resists the sliding (kinetic friction). The stick acted only while it touched the puck.',
    }),
    num({
      id: 'ring-net', difficulty: 2,
      gen(r) {
        const E = r.int(30, 60), W = r.int(8, 25), Nn = r.int(15, 50);
        const ans = Math.hypot(E - W, Nn);
        return {
          prompt: t`A metal ring lies on a frictionless table. Seen from above, three ropes pull on it: ${E} N east, ${Nn} N north and ${W} N west. What is the magnitude of the net force on the ring?`,
          visual: bodyFBD([force('F₁', E, 0, 'tension'), force('F₂', Nn, 90, 'tension'), force('F₃', W, 180, 'tension')], { name: 'Forces on the ring, seen from above', caption: 'Top view, to scale. The ring’s weight and the table’s upward push cancel, so they are left out.' }),
          answer: ans, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: E + Nn + W, feedback: 'Forces are vectors: you cannot add their sizes like numbers. Add the components.' },
            { value: E - W + Nn, feedback: 'The east–west and north–south parts are perpendicular; combine them with Pythagoras, not by adding.' },
            { value: Math.hypot(E, Nn, W), feedback: 'The east and west pulls oppose each other: subtract them before squaring.' },
          ],
          hints: ['Add the east–west parts first (east positive), then the north–south parts.', t`$F_{\text{net},x} = ${E} - ${W}$ N and $F_{\text{net},y} = ${Nn}$ N; combine them with Pythagoras.`],
          teach: 'Add forces as vectors: sum the x-components and the y-components separately, then combine.',
          explain: t`$F_x = ${E} - ${W} = ${E - W}$ N and $F_y = ${Nn}$ N, so $|\vec F_\text{net}| = \sqrt{${E - W}^2 + ${Nn}^2} = ${s3(ans)}$ N.`,
        };
      },
    }),
    num({
      id: 'sled-ropes', difficulty: 2,
      gen(r) {
        const T = r.pick([60, 75, 90, 120, 150]), th = r.pick([15, 20, 25, 30, 35, 40]);
        const ans = 2 * T * cos(th);
        return {
          prompt: t`Two huskies pull a sled with ropes that make ${th}° on either side of straight ahead, each rope under a tension of ${T} N. What is the size of the net force the two ropes exert on the sled?`,
          visual: bodyFBD([force('T', T, th, 'tension'), force('T', T, -th, 'tension')], { name: 'Rope forces on the sled, seen from above', caption: `Top view: two equal pulls, ${th}° either side of straight ahead (to the right). To scale.` }),
          answer: ans, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: 2 * T, feedback: 'The ropes are not straight ahead: only part of each pull points forward.' },
            { value: 2 * T * sin(th), feedback: t`The angle is measured from straight ahead, so the forward part is $T\cos\theta$, not $T\sin\theta$.` },
          ],
          hints: ['The sideways parts of the two pulls cancel; only the forward parts add.', t`Each rope’s forward part is $T\cos ${th}^\circ$.`],
          teach: 'Two symmetric pulls: the sideways components cancel and the forward components add.',
          explain: t`Forward: $2T\cos\theta = 2(${T})\cos ${th}^\circ = ${s3(ans)}$ N. Sideways: $T\sin\theta - T\sin\theta = 0$.`,
        };
      },
    }),
    match({
      id: 'agents', difficulty: 2,
      prompt: 'A box is dragged up a rough ramp by a rope parallel to the ramp. Match each force on the box to the object that exerts it.',
      visual: scene('incline', { m: 6, theta: 25, mus: 0.4, muk: 0.3, F: 50, moving: 1, labels: { F: 'T' }, accel: false, names: ['Forces on the box'] }, 'The box and its free-body diagram: weight, normal force, kinetic friction and the rope’s tension, to scale.'),
      left: [t`Weight $m\vec g$`, t`Normal force $\vec N$`, t`Kinetic friction $\vec f_k$`, t`Tension $\vec T$`],
      right: ['Earth', 'The ramp’s surface, pushing straight out of it', 'The ramp’s surface, resisting the sliding', 'The rope', 'The box itself'],
      answer: [0, 1, 2, 3],
      hints: ['Every force needs an agent: something touching the box, or Earth acting at a distance.', 'The ramp exerts two forces: one perpendicular to its surface and one along it.'],
      teach: 'Name the agent of every force: if you cannot name one, the force is not real.',
      explain: 'Earth pulls (weight); the ramp pushes straight out of its surface (normal force) and drags along it against the sliding (friction); the rope pulls along its length (tension). Nothing exerts a force on itself.',
    }),
    mcq({
      id: 'motion-force', difficulty: 3, kind: 'error',
      prompt: 'A student draws this free-body diagram for a box sliding to the right across a rough floor, just after a shove. What is wrong with it?',
      visual: scene('floor', { m: 10, F: 0, mus: 0.3, muk: 0.25, moving: true, show: 'fbd', accel: false, names: ['The student’s diagram for the box'], extra: [{ label: 'force of motion', mag: 30, dir: 0 }] }, 'The dashed arrow is the one in question.'),
      choices: [
        'The “force of motion” must go: once the shove ends, nothing pushes the box forward',
        'Friction should point to the right, the way the box moves',
        'The normal force should be left out while the box is moving',
        'The weight should tilt to the right because the box is moving',
      ],
      answer: 0,
      why: {
        1: 'Kinetic friction opposes the sliding, so it points left — backward — as drawn.',
        2: 'The floor holds the box up whether or not it slides.',
        3: 'Gravity points straight down whatever the box is doing.',
      },
      hints: ['For each arrow, name the object that exerts it.', 'Which arrow has no agent — no object pushing or pulling?'],
      teach: 'Motion does not need a force to sustain it, so a moving object’s diagram has no “force of motion”.',
      explain: 'Only Earth (weight) and the floor (normal force and friction) act on the sliding box. Friction points backward, so the box slows down. A force with no agent does not exist.',
    }),
    mcq({
      id: 'system', difficulty: 2,
      prompt: 'You push two touching blocks across a frictionless floor. Now treat **both blocks together** as one system. Which forces belong on the system’s free-body diagram?',
      visual: scene('pair', { m1: 4, m2: 2, F: 18, show: 'picture', quiet: true }, 'A pole pushes the rear block, which pushes the front one. The system: both blocks.'),
      choices: [
        'Your push, the two weights and the floor’s two normal forces — not the forces between the blocks',
        'Your push, the weights, the normal forces, and both contact forces between the blocks',
        'Your push and the force of the rear block on the front block',
        'Only your push, since the floor is frictionless',
      ],
      answer: 0,
      why: {
        1: 'The blocks push on each other with equal and opposite forces inside the system. Those forces are internal and cancel, so they are left out.',
        2: 'That contact force is internal to the two-block system, while the weights and the normal forces come from outside it and belong on the diagram.',
        3: 'A frictionless floor removes friction, not the weights or the floor’s upward push.',
      },
      hints: ['External forces come from outside the system; internal forces act between its parts.'],
      teach: 'The free-body diagram of a system shows only external forces; forces between its parts cancel in pairs.',
      explain: 'With both blocks as the system, the contact forces between them are internal: equal and opposite, they cancel. What remains is your push, the weights (from Earth) and the normal forces (from the floor).',
    }),
    order({
      id: 'fbd-steps', difficulty: 1,
      prompt: 'Put the steps for drawing a free-body diagram in order.',
      items: [
        'Choose the object (the system) you care about',
        'Imagine it cut free from its surroundings and draw it as a dot',
        'Draw its weight, which acts without contact',
        'Go around everything touching it and draw the force each one exerts',
        'Choose axes and split any slanted force into components',
      ],
      hints: ['You cannot draw forces until you know which object they act on.'],
      teach: 'Isolate first, then add the long-range force, then one contact force for each thing touching the object.',
      explain: 'Isolate the object, draw the long-range force (its weight), then one contact force for each thing touching it — and only then choose axes for the algebra.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-burnout', difficulty: 2, transfer: true,
      prompt: 'A sounding rocket’s motor burns out while the rocket is still climbing fast through the air. Which forces act on the rocket just after burnout?',
      visual: bodyFBD([], { icon: 'rocket', show: 'picture', v: [0, 1], caption: 'Just after burnout: engine off, still climbing.' }),
      choices: [
        'Its weight and air drag, both pointing down',
        'Its weight, air drag, and a dwindling upward thrust that keeps it climbing',
        'Only its weight: drag acts only on falling objects',
        'Its weight and an upward force from its momentum',
      ],
      answer: 0,
      why: {
        1: 'Thrust is the exhaust pushing on the rocket, and at burnout there is no exhaust. It keeps climbing because it is moving, not because something pushes it.',
        2: 'Drag opposes motion through the air in any direction. Moving up, the rocket feels drag pointing down.',
        3: 'Momentum is a property of the rocket, not a force on it: no agent exerts a “force of momentum”.',
      },
      hints: ['Which agents still act on the rocket once the exhaust stops?'],
      teach: 'After burnout only gravity and the air act on a rocket; it coasts upward while both slow it down.',
      explain: 'Earth pulls it down and the air resists its upward motion, so both forces point down and the rocket slows until it reaches its highest point.',
    }),
    num({
      id: 'cp-tug', difficulty: 3,
      gen(r) {
        const T = r.pick([8, 10, 12, 15]), th = r.pick([20, 25, 30, 35]), C = r.pick([3, 4, 5, 6]);
        const fx = T * cos(th), fy0 = T * sin(th) - C, fy = Math.abs(fy0) < 1e-9 ? 0 : fy0, ans = Math.hypot(fx, fy);
        return {
          prompt: t`A tugboat’s cable pulls a barge with ${T} kN at ${th}° north of east, while the river current pushes the barge with ${C} kN due south. What is the magnitude of the net horizontal force on the barge?`,
          visual: bodyFBD([force('cable', T * 1000, th, 'tension'), force('current', C * 1000, 270, 'drag')], { name: 'Horizontal forces on the barge, seen from above', caption: 'Top view, to scale; east is to the right, north is up.' }),
          answer: ans, units: 'kN', tol: { rel: 0.01 },
          errors: [
            { value: T + C, feedback: 'Forces are vectors: their sizes do not simply add. Resolve the cable force into components first.' },
            { value: Math.hypot(fx, T * sin(th) + C), feedback: 'The current pushes south, against the cable’s northward part: subtract it.' },
            { value: T - C, feedback: 'Only the cable’s northward component opposes the current; resolve the cable force first.' },
          ],
          hints: ['Take east as +x and north as +y; split the cable force into components.', t`$F_x = ${T}\cos ${th}^\circ$ and $F_y = ${T}\sin ${th}^\circ - ${C}$ (kN); then use Pythagoras.`],
          teach: 'Resolve every force along the same axes before adding.',
          explain: t`$F_x = ${T}\cos${th}^\circ = ${s3(fx)}$ kN and $F_y = ${T}\sin${th}^\circ - ${C} = ${s3(fy)}$ kN, so $F_\text{net} = \sqrt{F_x^2 + F_y^2} = ${s3(ans)}$ kN.`,
        };
      },
    }),
    mcq({
      id: 'cp-wall', difficulty: 2,
      prompt: 'You press a book flat against a wall with a horizontal push, hard enough that it does not slide. Which list gives every force on the book?',
      visual: bodyFBD([], { icon: 'block', show: 'picture', wall: 'left', agent: { dir: 180, kind: 'pole' }, caption: 'A book held against a wall by a horizontal push from the right.' }),
      choices: [
        'Weight (down), your push (toward the wall), the wall’s normal force (away from it), static friction from the wall (up)',
        'Weight, your push and the wall’s normal force — no friction is needed',
        'Weight, your push, the normal force, and static friction pointing down',
        'Your push and the wall’s normal force: the wall cancels the weight directly',
      ],
      answer: 0,
      why: {
        1: 'Then nothing would hold the book up: the push and the normal force are both horizontal.',
        2: 'Friction opposes the slipping the book would otherwise do — downward — so it points up.',
        3: 'The weight still acts on the book. It is balanced by friction from the wall, a separate force along the wall’s surface.',
      },
      hints: ['The push and the normal force are horizontal. Which force from the wall can act vertically?'],
      teach: 'A surface can push in two ways at once: straight out of it (the normal force) and along it (friction).',
      explain: 'Horizontally, your push is balanced by the wall’s normal force; vertically, the weight is balanced by static friction from the wall, pointing up.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §5.1 Forces', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-1-forces' },
    { label: 'OpenStax University Physics Vol. 1, §5.7 Drawing Free-Body Diagrams', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-7-drawing-free-body-diagrams' },
  ],
});
