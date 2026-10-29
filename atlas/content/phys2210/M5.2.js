// Newton's first law and inertial frames: zero net force means constant velocity — in the right frame.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, t3, sin, cos } from './_forces.js';

const t = String.raw;
const frames = (params, caption) => ({ type: 'mech-frames', params: { sliders: false, ...params }, caption });

export default lesson({
  id: 'phys2210.M5.2',
  title: 'Newton’s first law and inertial frames',
  minutes: 9, difficulty: 2,
  intro: t`**Newton’s first law**: an object with zero net force on it keeps its velocity. At rest, it stays at rest; moving, it keeps moving in a straight line at constant speed. Motion needs no force to sustain it — only a *change* of motion does. This tendency to keep the same velocity is called **inertia**.

$$\vec F_\text{net} = 0 \;\Longleftrightarrow\; \vec v = \text{constant} \qquad (\text{in an inertial frame})$$

The law holds only in an **inertial frame of reference**: one that is not itself accelerating. The first law is in fact the test for one — if objects with no net force keep a constant velocity, your frame is inertial. The ground is very nearly inertial; a braking bus is not. And every inertial frame is as good as any other: no experiment inside a smoothly cruising train can tell how fast it is going.`,
  symbols: [
    { tex: '\\vec F_\\text{net}', text: 'the vector sum of every force on the object, in newtons (N)' },
    { tex: '\\vec v', text: 'velocity, in m/s: speed **and** direction. Constant velocity means neither changes — a straight line at steady speed, or rest' },
    { tex: '\\Longleftrightarrow', text: 'each implies the other: zero net force gives constant velocity, and constant velocity tells you the net force is zero' },
    { tex: '\\text{inertial frame}', text: 'a set of rulers and clocks that is not accelerating; the ground, to a good approximation, or anything moving steadily relative to it' },
  ],
  why: 'Asking which frames are inertial led Einstein to special relativity, and the freely falling elevator — where loose objects float as if no force acted — to general relativity.',
  visual: {
    type: 'mech-frames',
    title: 'The same ball, seen from two frames',
    lead: t`A train car speeds up, cruises or brakes. A ball rests on its frictionless floor and a pendulum hangs from its ceiling. Press **Play**, then watch the same events again from the other frame.`,
    tasks: [
      'Speeds up, seen from the ground: the ball stays where it was — nothing horizontal acts on it — while the car slides forward beneath it.',
      'Switch to “Inside the car”: now the ball accelerates backward with no force on it. The first law fails, so the car is not an inertial frame.',
      'Choose “Cruises”: in both views the ball keeps its place in the car. Nothing inside reveals the steady speed.',
    ],
    params: { motion: 'speed-up', A: 2, view: 'ground', time: 0 },
  },
  example: {
    prompt: t`An airliner of mass 65 000 kg cruises straight and level at a constant 230 m/s. Its lift-to-drag ratio — lift divided by drag — is 17. How much thrust must its engines provide, and how large is the lift?`,
    visual: bodyFBD([force('lift', 65000 * G, 90, 'lift'), force('weight', 65000 * G, 270, 'weight'), force('thrust', (65000 * G) / 17, 0, 'thrust'), force('drag', (65000 * G) / 17, 180, 'drag')], { icon: 'plane', show: 'both', values: true, v: [1, 0], name: 'Forces on the airliner', caption: 'Forces to scale: thrust and drag are short because each is only 1/17 of the weight.' }),
    steps: [
      { label: 'Constant velocity', text: t`Straight, level and steady means $\vec v$ is constant, so (in the ground’s nearly inertial frame) the net force is **zero**. The 230 m/s does not matter — only that it does not change.` },
      { label: 'Vertical', text: t`Lift balances weight: $L = mg = (65\,000)(9.8) = 6.37\times10^5$ N.` },
      { label: 'Drag', text: t`$D = L/17 = 6.37\times10^5/17 = 3.75\times10^4$ N.` },
      { label: 'Horizontal', text: t`Thrust balances drag: $T = D = 3.75\times10^4$ N, about 37 kN.` },
      { label: 'Sense check', text: t`The engines push with only about 6% of the weight. They are not holding the aircraft up — the wing does that — they only replace what drag takes away.` },
    ],
    answer: t`Thrust $= 3.75\times10^4$ N (37.5 kN), equal to the drag; lift $= 6.37\times10^5$ N, equal to the weight.`,
  },
  practice: [
    num({
      id: 'elevator-cable', difficulty: 1,
      gen(r) {
        const M = r.pick([800, 950, 1100, 1250, 1400]), v = r.pick([1.5, 2, 2.5, 3]);
        return {
          prompt: t`An elevator car of mass ${M} kg rises at a constant ${v} m/s. What is the tension in its cable? (Ignore friction; $g = 9.8\ \text{m/s}^2$.)`,
          visual: scene('hang', { ropes: 1, m: M, a: 0, show: 'both', names: ['Forces on the elevator car'] }, 'The car hanging from its cable, and its free-body diagram to scale.'),
          answer: M * G, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: M * (G + v), feedback: 'Speed does not add to g. Rising at constant speed means zero acceleration, so the cable just balances the weight.' }],
          hints: ['Constant velocity: what is the net force on the car?'],
          teach: 'At constant velocity — even moving up — the forces balance, so the tension equals the weight.',
          explain: t`Constant velocity, so $T - mg = 0$: $T = (${M})(9.8) = ${t3(M * G)}$ N. Moving up does not require more than the weight — only *speeding up* would.`,
        };
      },
    }),
    mcq({
      id: 'cruise-car', difficulty: 2,
      prompt: 'A car cruises at a steady 25 m/s along a straight, level road. How does the forward force of the road on its drive wheels compare with the backward forces of air drag and rolling resistance?',
      visual: bodyFBD([], { icon: 'car', show: 'picture', ground: true, v: [1, 0], caption: 'Steady speed, straight road.' }),
      choices: ['They are equal in size', 'The forward force is larger — otherwise the car could not keep moving', 'The backward forces are larger, because the car is moving', 'The forward force is zero at constant speed'],
      answer: 0,
      why: {
        1: 'A surplus of forward force would speed the car up. At constant velocity the forces balance exactly.',
        2: 'Then the net force would point backward and the car would slow down.',
        3: 'Drag and rolling resistance still act, so something must balance them, or the car would slow.',
      },
      hints: ['Is the car’s velocity changing? What does that say about the net force?'],
      teach: 'Constant velocity means zero net force: the forward and backward forces are equal.',
      explain: 'The velocity is constant, so the net force is zero: the road’s forward push equals drag plus rolling resistance. The engine keeps working only to replace what those forces take away.',
    }),
    multi({
      id: 'inertial-frames', difficulty: 2,
      prompt: 'Which of these frames are inertial, or very nearly so? Select all that are.',
      visual: frames({ motion: 'speed-up', A: 2, view: 'car', time: 1.2 }, 'The test for an inertial frame: does a body with no net force keep its velocity? Inside a car that is speeding up, it does not.'),
      choices: ['A car moving at constant speed along a straight, level road', 'A train cruising at steady speed on straight track', 'The ground under your feet (to a good approximation)', 'A car rounding a bend at constant speed', 'A rocket during its engine burn', 'A merry-go-round turning steadily'],
      answer: [0, 1, 2],
      why: {
        3: 'Its velocity changes direction, so it accelerates: a ball on its floor would drift outward with no force on it.',
        4: 'It accelerates, so loose objects inside drift toward its tail with no force on them.',
        5: 'Every point on it accelerates toward the centre, so it is not inertial.',
      },
      hints: ['A frame is inertial if it does not accelerate — and turning counts as accelerating.'],
      teach: 'Inertial frames move at constant velocity relative to one another; any frame that speeds up, slows down or turns is not inertial.',
      explain: 'The cruising car, the cruising train and the ground all move at (very nearly) constant velocity, so the first law holds in them. Turning, burning or spinning frames accelerate, and loose objects in them drift with no force acting.',
    }),
    num({
      id: 'ball-in-car', difficulty: 2,
      gen(r) {
        const [A, tt] = r.pick([[1, 1.8], [1.5, 1.5], [2, 1.5], [1, 1.5], [2.5, 1.2], [1.5, 1.8]]);
        const d = 0.5 * A * tt * tt;
        return {
          prompt: t`A train car starts from rest and speeds up at ${A} m/s². A ball sits on its frictionless floor. Seen from inside the car, how far does the ball slide toward the back of the car in the first ${tt} s?`,
          visual: frames({ motion: 'speed-up', A, view: 'car', time: 0 }, 'The moment the car starts to speed up, seen from inside it.'),
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: A * tt * tt, feedback: t`Distance from rest under constant acceleration is $\tfrac12 at^2$ — you dropped the ½.` },
            { value: A * tt, feedback: 'That is a speed (m/s), not a distance.' },
          ],
          hints: ['From the ground, no horizontal force acts on the ball, so it stays put. What does the car do meanwhile?', t`The car moves $\tfrac12 A t^2$ forward under the ball.`],
          teach: 'In an accelerating frame, a body with no force on it appears to accelerate the opposite way.',
          explain: t`From the ground the ball stays put while the car moves $\tfrac12 A t^2 = \tfrac12(${A})(${tt})^2 = ${s3(d)}$ m forward. Seen from the car, the ball slides ${s3(d)} m backward — with no force on it.`,
        };
      },
    }),
    mcq({
      id: 'bus-brakes', difficulty: 2,
      prompt: 'A bus brakes hard and its standing passengers lurch forward. What is the best explanation?',
      visual: frames({ motion: 'brake', A: 2, view: 'ground', time: 1.0 }, 'Seen from the ground: as the car brakes, the ball keeps its speed and moves toward the front.'),
      choices: [
        'Their bodies keep moving forward while the bus slows down beneath them; no forward force is needed',
        'The braking creates a forward force that pushes the passengers ahead',
        'The bus’s momentum is transferred into the passengers as a forward force',
        'Gravity pulls them forward as the bus tips onto its front wheels',
      ],
      answer: 0,
      why: {
        1: 'Nothing pushes the passengers forward. Seen from the street, they simply keep going while the bus slows.',
        2: 'Momentum is not a force. The passengers already had their own forward velocity, and keep it until something stops them.',
        3: 'The small tilt does not drive the lurch; even on a perfectly level bus, passengers would carry on forward.',
      },
      hints: ['Describe it from the street, which is (nearly) an inertial frame. What happens to a passenger’s velocity?'],
      teach: 'In a braking vehicle, people keep their velocity until a force — a handrail, the floor’s friction — changes it.',
      explain: 'From the ground, the passengers keep their velocity (first law) while the bus slows. Inside the bus, they seem to be thrown forward, but no forward force acts: the bus’s frame is not inertial while it brakes.',
    }),
    mcq({
      id: 'coin-drop', difficulty: 2,
      prompt: 'In a windowless train car moving at a steady 30 m/s on smooth, straight track, you drop a coin. Where does it land?',
      visual: frames({ motion: 'steady', view: 'car', time: 1.5 }, 'Inside a car cruising steadily, a loose ball stays exactly where it was.'),
      choices: ['Directly below where you let go, just as if the train were at rest', 'Behind that spot, because the train moves forward while the coin falls', 'Ahead of that spot, carried forward by the air in the car', 'It depends on how fast the train is going'],
      answer: 0,
      why: {
        1: 'The coin already moves forward at 30 m/s along with you and the train, and nothing horizontal changes that, so it keeps pace with the spot beneath it.',
        2: 'The air has nothing to do with it: the coin already shares the car’s velocity.',
        3: 'At constant velocity the speed makes no difference at all — this is Galilean relativity.',
      },
      hints: ['Before you let go, how fast is the coin moving forward, as seen from the ground?'],
      teach: 'Inside any inertial frame, the laws of motion work exactly as they do at rest.',
      explain: 'The coin starts with the train’s 30 m/s and no horizontal force acts, so it stays above the same spot as it falls. No experiment inside a steadily moving car can reveal its speed.',
    }),
    num({
      id: 'drone-hover', difficulty: 3,
      gen(r) {
        const m = r.pick([1.2, 1.5, 2.0, 2.5, 3.0]), W = m * G;
        const D = Math.round(r.pick([0.25, 0.3, 0.35, 0.4, 0.5]) * W * 2) / 2;      // drag big enough to matter
        const R = Math.hypot(W, D), ang = Math.atan(D / W) / (Math.PI / 180);
        return {
          prompt: t`A ${m} kg delivery drone flies horizontally in a straight line at constant speed. Air drag on it is ${D} N, straight backward. How large is the total force its rotors must provide?`,
          visual: bodyFBD([force('mg', W, 270, 'weight'), force('drag', D, 180, 'drag'), force('R', R, 90 - ang, 'thrust')], { icon: 'drone', show: 'both', v: [1, 0], ask: ['F2'], name: 'Forces on the drone', caption: 'R is the rotors’ total force; its tilt is drawn to scale.' }),
          answer: R, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: W + D, feedback: 'The weight and the drag are perpendicular; the rotor force must balance their vector sum, found with Pythagoras.' },
            { value: W, feedback: 'The rotors must also cancel the drag, so they tilt forward and push harder than the weight alone.' },
            { value: W - D, feedback: 'Drag acts horizontally and does not reduce the weight; combine them with Pythagoras.' },
          ],
          hints: ['Constant velocity: the rotor force must cancel the weight and the drag together.', t`The rotors must supply $${s3(W)}$ N up and ${D} N forward: $R = \sqrt{(mg)^2 + D^2}$.`],
          teach: 'At constant velocity one force can balance several others: it must equal their vector sum, reversed.',
          explain: t`Zero net force: the rotors push ${s3(W)} N up (to cancel $mg$) and ${D} N forward (to cancel drag), so $R = \sqrt{${s3(W)}^2 + ${D}^2} = ${s3(R)}$ N, tilted ${s3(ang)}° forward of vertical.`,
        };
      },
    }),
    mcq({
      id: 'falling-lab', difficulty: 3,
      prompt: 'A sealed laboratory falls freely after its cable snaps. Inside, a scientist lets go of a ball and it floats beside her hand. Using the falling lab as her frame of reference, what does this show?',
      visual: { type: 'gr-elevator', params: { mode: 'falling' }, caption: 'Press Release: inside the falling box (left), released objects float; from the ground (right), box and balls fall together.' },
      choices: [
        'Inside a small, freely falling lab, a body with no other force on it keeps its velocity, as in an inertial frame — Einstein’s starting point for general relativity',
        'Gravity switches off inside a freely falling lab',
        'The ball is weightless because the lab is far from Earth',
        'The lab is accelerating, so the ball must drift toward its floor',
      ],
      answer: 0,
      why: {
        1: 'Gravity still pulls the ball and the lab, with the same acceleration: seen from the ground both fall at 9.8 m/s², which is why the ball keeps pace with the lab.',
        2: 'The lab is right next to Earth, where gravity is as strong as ever.',
        3: 'Loose objects drift to the floor in an accelerating rocket. In free fall, the floor falls away exactly as fast as they do.',
      },
      hints: ['Seen from the ground, what is the acceleration of the lab, and of the ball?', 'If the ball and the lab accelerate together, what does the ball do relative to the lab?'],
      teach: 'Gravity gives everything the same acceleration, so inside a small freely falling frame loose objects keep their velocity, as they would in an inertial frame.',
      explain: 'Seen from the ground, ball and lab both fall at g, so relative to the lab the ball keeps its velocity — the first law holds in the falling lab. Einstein took this seriously: locally, free fall is indistinguishable from floating in space. (Only locally: across a large lab, tidal effects make loose objects drift apart slightly.)',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-voyager', difficulty: 2, transfer: true,
      prompt: 'Voyager 1 left the planets behind decades ago and now coasts away from the Sun at about 17 km/s, with no engine firing. What keeps it moving?',
      visual: bodyFBD([], { icon: 'probe', show: 'picture', v: [1, 0], caption: 'Voyager 1, coasting far beyond the planets.' }),
      choices: [
        'Nothing needs to: with almost no force on it, its velocity stays nearly constant (the Sun’s weak pull slows it very slightly)',
        'The push from its last engine burn, slowly wearing off',
        'The solar wind, which keeps pushing it outward',
        'Its momentum, acting as a forward force',
      ],
      answer: 0,
      why: {
        1: 'A push does not linger after it stops; once the burn ended, the force ended. Voyager keeps the velocity it had.',
        2: 'The solar wind is far too thin to matter, and even with no wind at all Voyager would keep going.',
        3: 'Momentum is a property of the probe, not a force acting on it.',
      },
      hints: ['What does the first law say about an object with (almost) no net force?'],
      teach: 'No force is needed to keep moving; a force is needed only to change a velocity.',
      explain: 'Out there, the only real force is the Sun’s gravity, now very weak. It slows Voyager slightly; nothing is needed to keep it going.',
    }),
    num({
      id: 'cp-orbiter', difficulty: 2,
      gen(r) {
        const m = r.pick([90, 95, 100, 105]), gam = r.pick([18, 19, 20]);
        const W = m * 1000 * G;
        return {
          prompt: t`On its final approach, the Space Shuttle orbiter glided toward the runway along a steep straight path about ${gam}° below the horizontal, at nearly constant speed. Take its mass as ${m} t. While its speed and direction are constant, what is the magnitude of the total force the air exerts on it?`,
          visual: bodyFBD([force('lift', W * cos(gam), 90 - gam, 'lift'), force('drag', W * sin(gam), 180 - gam, 'drag'), force('mg', W, 270, 'weight')], { name: 'Forces on the orbiter', caption: `Lift is perpendicular to the path and drag points back along it; the path slopes down to the right at ${gam}°. To scale.` }),
          answer: W, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: W * cos(gam), feedback: 'That is the lift alone. The air also pushes back with drag; the total air force is lift and drag together.' },
            { value: W * sin(gam), feedback: 'That is the drag alone. Add the lift as a vector.' },
          ],
          hints: ['Constant velocity in a straight line: what is the net force?'],
          teach: 'For any body at constant velocity, the other forces add up to cancel the weight exactly.',
          explain: t`Constant velocity means zero net force, so the air’s total force — lift plus drag — exactly cancels the weight: $mg = (${m}\times10^3)(9.8) = ${s3(W / 1e6)}\times10^6$ N, straight up, whatever the glide angle.`,
        };
      },
    }),
    num({
      id: 'cp-toy-car', difficulty: 2,
      gen(r) {
        const A = r.pick([1.2, 1.5, 2, 2.5]), tt = r.pick([1.2, 1.5, 1.8]);
        const d = 0.5 * A * tt * tt;
        return {
          prompt: t`A train starts from rest and speeds up steadily. A passenger watches a toy car on the smooth floor: in the first ${tt} s it rolls ${s3(d)} m toward the back of the train, though nothing pushes it. What is the train’s acceleration? (Treat the toy as frictionless.)`,
          visual: frames({ motion: 'speed-up', A, view: 'car', time: 0 }, 'Seen from inside the train as it starts to speed up; the ball stands in for the toy car.'),
          answer: A, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: d / (tt * tt), feedback: t`From rest, $d = \tfrac12 a t^2$, so $a = 2d/t^2$ — you dropped the 2.` },
            { value: (2 * d) / tt, feedback: t`Divide by $t^2$, not $t$: $a = 2d/t^2$.` },
          ],
          hints: ['From the ground, the toy stays put while the train moves forward beneath it.'],
          teach: 'In an accelerating frame, a free body appears to accelerate backward at the frame’s own acceleration.',
          explain: t`The toy stays put in the ground frame, so the train moves $d = \tfrac12 a t^2$ forward under it: $a = 2d/t^2 = 2(${s3(d)})/${tt}^2 = ${A}\ \text{m/s}^2$.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §5.2 Newton’s First Law', url: 'https://openstax.org/books/university-physics-volume-1/pages/5-2-newtons-first-law' }],
});
