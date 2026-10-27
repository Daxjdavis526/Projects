// Uniform circular motion: constant speed, changing velocity, and the
// centripetal acceleration v²/r that points to the centre.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3 } from './_kinematics.js';

const t = String.raw;

// a circle of radius r centred on the origin, for graph.js
const circle = (r, color = 'ink3', extra = {}) => ({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color, width: 1.6, ...extra });

export default lesson({
  id: 'phys2210.M4.4',
  title: 'Uniform circular motion',
  minutes: 10, difficulty: 2,
  intro: t`An object going round a circle at constant speed is **accelerating**, because the direction of its velocity keeps changing. The acceleration points to the centre — it is called **centripetal** — and its size is

$$a_c = \frac{v^2}{r} = \omega^2 r, \qquad v = \frac{2\pi r}{T} = \omega r$$

The speed is constant but the velocity is not: the velocity is tangent to the circle, and the acceleration is perpendicular to it, pointing inward.`,
  symbols: [
    { tex: 'a_c', text: 'the centripetal acceleration, in m/s², pointing to the centre of the circle' },
    { tex: 'v', text: 'the speed, in m/s — constant in uniform circular motion' },
    { tex: 'r', text: 'the radius of the circle, in m' },
    { tex: 'T', text: 'the period: the time for one full turn, in s' },
    { tex: '\\omega = \\dfrac{2\\pi}{T}', text: 'the angular speed, in rad/s: the angle swept per second. One revolution per minute (rpm) is $2\\pi/60$ rad/s' },
    { tex: 'f = \\dfrac{1}{T}', text: 'the frequency: turns per second, in Hz' },
  ],
  why: 'Centripetal acceleration sets the g-load in a fighter’s turn and in a training centrifuge, and the speed of every circular orbit; with Newton’s laws it becomes the force needed to keep anything turning.',
  visual: {
    type: 'graph',
    title: 'Velocity along, acceleration inward',
    lead: t`An object moves counter-clockwise round a circle at constant speed. Move it with the **position** slider and change the speed and radius. Gold: the velocity. Red: the acceleration. Dashed: the straight path it would take if whatever holds it on the circle let go at that instant.`,
    tasks: [
      'Move the object round: the velocity is always tangent, the acceleration always points to the centre, and they stay perpendicular.',
      'Double v at a fixed radius: the acceleration arrow grows four times (a = v²/r).',
      'Double r at a fixed speed: the acceleration halves — a wide turn is gentler than a tight one.',
    ],
    params: {
      x: [-14, 14], y: [-11, 11], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      sliders: [
        { key: 'phi', label: 'Position on the circle', min: 0, max: 360, step: 1, value: 30, unit: '^\\circ', explain: 'The angle from the $+x$ axis, counter-clockwise.' },
        { key: 'v', label: 'Speed $v$', min: 1, max: 6, step: 0.5, value: 5, unit: '\\mathrm{m/s}', explain: 'Constant around the circle.' },
        { key: 'r', label: 'Radius $r$', min: 3, max: 10, step: 0.5, value: 5, unit: '\\mathrm{m}', explain: 'Distance from the centre.' },
      ],
      curves: [
        { param: ['r*cos(t)', 'r*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 },
        { param: ['r*cos(phi*pi/180) - t*sin(phi*pi/180)', 'r*sin(phi*pi/180) + t*cos(phi*pi/180)'], t: [0, 14], color: 'ink4', width: 1.4, dash: true },
      ],
      arrows: [
        { from: [0, 0], to: ['r*cos(phi*pi/180)', 'r*sin(phi*pi/180)'], color: 'ink4' },
        { from: ['r*cos(phi*pi/180)', 'r*sin(phi*pi/180)'], to: ['r*cos(phi*pi/180) - 0.5*v*sin(phi*pi/180)', 'r*sin(phi*pi/180) + 0.5*v*cos(phi*pi/180)'], color: 'gold', label: 'v' },
        { from: ['r*cos(phi*pi/180)', 'r*sin(phi*pi/180)'], to: ['(r - 0.25*v^2/r)*cos(phi*pi/180)', '(r - 0.25*v^2/r)*sin(phi*pi/180)'], color: 'bad', label: 'a' },
      ],
      points: [{ x: 'r*cos(phi*pi/180)', y: 'r*sin(phi*pi/180)', color: 'accent' }, { x: 0, y: 0, color: 'ink3' }],
      readouts: [
        { label: '$a_c = v^2/r$', expr: 'v^2/r', unit: '\\mathrm{m/s^2}', digits: 3 },
        { label: 'in units of $g$', expr: 'v^2/r/9.8', digits: 3 },
        { label: 'period $T = 2\\pi r/v$', expr: '2*pi*r/v', unit: '\\mathrm{s}', digits: 3 },
        { label: '$\\omega = v/r$', expr: 'v/r', unit: '\\mathrm{rad/s}', digits: 3 },
      ],
    },
    caption: 'Seen from above. The arrows use separate scales — velocity 0.5 m per m/s, acceleration 0.25 m per m/s² — so compare lengths only within each kind.',
  },
  example: {
    prompt: t`A centrifuge for training astronauts has an 8.0 m arm. How fast must the cabin move for a centripetal acceleration of 5.0g, and how many revolutions per minute is that?`,
    visual: {
      type: 'graph',
      params: {
        x: [-11, 11], y: [-10, 10], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
        curves: [circle(8)],
        arrows: [{ from: [0, 0], to: [6.93, 4], color: 'ink3', label: '8.0 m' }, { from: [6.93, 4], to: [3.93, 9.2], color: 'gold', label: 'v' }, { from: [6.93, 4], to: [4.33, 2.5], color: 'bad', label: 'a' }],
        points: [{ x: 0, y: 0, color: 'ink' }, { x: 6.93, y: 4, color: 'accent' }],
      },
      caption: 'Seen from above: the cabin’s velocity is tangent to its circle; its acceleration points along the arm to the axis. Arrows not to scale.',
    },
    steps: [
      { label: 'Target', text: t`$a_c = 5.0 \times 9.8 = 49\ \text{m/s}^2$.` },
      { label: 'Speed', text: t`$a_c = v^2/r \Rightarrow v = \sqrt{a_c r} = \sqrt{(49)(8.0)} = 19.8$ m/s.` },
      { label: 'Period', text: t`$T = \dfrac{2\pi r}{v} = \dfrac{2\pi(8.0)}{19.8} = 2.54$ s per turn.` },
      { label: 'rpm', text: t`$60/2.54 = 23.6$ revolutions per minute.` },
      { label: 'Sense check', text: t`About 70 km/h in a circle the size of a small room. The rider also feels Earth’s 1g downward, so the total load is $\sqrt{5^2 + 1^2} \approx 5.1g$ — real centrifuges tilt the cabin so it pushes the rider back into the seat.` },
    ],
    answer: t`$v = 19.8$ m/s, about 24 rpm.`,
  },
  practice: [
    mcq({
      id: 'direction', difficulty: 1,
      prompt: 'An object moves counter-clockwise round the circle at constant speed. Which describes its acceleration at the marked point?',
      choices: ['Toward the centre (arrow A)', 'Along its velocity (arrow B)', 'Away from the centre (arrow C)', 'There is none: the speed is constant'],
      answer: 0,
      why: {
        1: 'An acceleration along the velocity would change the speed. Here only the direction changes.',
        2: 'Nothing pushes the object outward. The “outward” feeling of a rider is the body’s tendency to keep going straight.',
        3: 'Constant speed, but the velocity’s direction is changing — that is an acceleration.',
      },
      hints: ['The velocity has a constant size but a changing direction.', 'Which way is the velocity being turned?'],
      teach: 'In uniform circular motion the acceleration points to the centre of the circle.',
      explain: t`The velocity is turned continually toward the inside of the circle, so $\vec a$ points to the centre (arrow A), with size $v^2/r$, perpendicular to $\vec v$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-9, 9], y: [-7.5, 7.5], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [circle(5)],
          arrows: [{ from: [3.54, 3.54], to: [1.77, 1.77], color: 'bad', label: 'A' }, { from: [3.54, 3.54], to: [1.77, 5.3], color: 'gold', label: 'B' }, { from: [3.54, 3.54], to: [5.3, 5.3], color: 'violet', label: 'C' }],
          points: [{ x: 3.54, y: 3.54, color: 'accent' }, { x: 0, y: 0, color: 'ink3' }],
        },
        caption: 'Seen from above; the object moves counter-clockwise.',
      },
    }),
    mcq({
      id: 'release', difficulty: 1,
      prompt: 'A ball on a string is whirled in a horizontal circle (counter-clockwise, seen from above). The string breaks when the ball is at the marked point. Which path does it follow, seen from above?',
      choices: ['Path A: straight along the tangent', 'Path B: straight outward, away from the centre', 'Path C: it keeps curving, spiralling slowly outward', 'It keeps going round the circle for a while'],
      answer: 0,
      why: {
        1: 'Nothing pushes the ball outward. It simply keeps the velocity it had, which was along the tangent.',
        2: 'Without the string’s pull nothing turns its velocity, so the path cannot keep curving: it is straight from the instant of release.',
        3: 'With no inward force, nothing keeps it on the circle even for an instant.',
      },
      hints: ['After the break, what acts on the ball horizontally?', 'With no horizontal force, the horizontal velocity cannot change.'],
      teach: 'Released from circular motion, an object continues along the tangent, not outward.',
      explain: t`Once the string breaks there is no horizontal force, so the ball keeps its velocity at the moment of release — tangent to the circle (path A). Seen from the side it also falls, of course.`,
      visual: {
        type: 'graph',
        params: {
          x: [-7, 12], y: [-6.5, 9], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [
            circle(5),
            { param: ['5 - 0*t', '0 + t'], t: [0, 8], color: 'gold', width: 1.6, dash: true },
            { param: ['5 + t', '0'], t: [0, 6], color: 'violet', width: 1.6, dash: true },
            { param: ['(5 + 0.3*t)*cos(t/5)', '(5 + 0.3*t)*sin(t/5)'], t: [0, 7], color: 'warn', width: 1.6, dash: true },
          ],
          points: [{ x: 5, y: 0, color: 'accent' }, { x: 0, y: 0, color: 'ink3' }, { x: 4.2, y: 7.8, r: 0.1, color: 'gold', label: 'A' }, { x: 10.6, y: 0.2, r: 0.1, color: 'violet', label: 'B' }, { x: 0.3, y: 7.6, r: 0.1, color: 'warn', label: 'C' }],
        },
        caption: 'Three candidate paths after the string breaks (seen from above).',
      },
    }),
    num({
      id: 'ac', difficulty: 1,
      gen(r) {
        const v = r.pick([4, 6, 8, 10, 12]), rad = r.pick([2, 3, 4, 5, 8]);
        const a = (v * v) / rad;
        return {
          prompt: t`A cart on a circular test track of radius ${rad} m moves at a steady ${v} m/s. What is its centripetal acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: v / rad, feedback: t`Square the speed: $a_c = v^2/r$. (What you found is $\omega$, in rad/s.)` }, { value: v * v * rad, feedback: 'Divide by the radius: a tighter circle means more acceleration.' }],
          hints: [t`$a_c = v^2/r$.`],
          teach: 'Centripetal acceleration is v²/r.',
          explain: t`$a_c = \dfrac{${v}^2}{${rad}} = ${s3(a)}\ \text{m/s}^2$, toward the centre.`,
          visual: {
            type: 'graph',
            params: {
              x: [-rad * 1.6, rad * 1.6], y: [-rad * 1.3, rad * 1.3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [circle(rad)],
              arrows: [{ from: [0, 0], to: [rad, 0], color: 'ink4', label: `${rad} m` }, { from: [rad, 0], to: [rad, rad * 0.55], color: 'gold', label: `${v} m/s` }],
              points: [{ x: rad, y: 0, color: 'accent' }],
            },
            caption: 'The track seen from above, with the cart’s velocity.',
          },
        };
      },
    }),
    num({
      id: 'station', difficulty: 2,
      gen(r) {
        const rad = r.pick([50, 100, 150, 250]), T = r.pick([15, 20, 25, 30]);
        const a = (4 * Math.PI * Math.PI * rad) / (T * T);
        return {
          prompt: t`A rotating space-station ring of radius ${rad} m turns once every ${T} s. What centripetal acceleration do people standing on the rim have? (This is the “artificial gravity” they feel.)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: (2 * Math.PI * rad) / T, feedback: t`That is the rim speed $v = 2\pi r/T$, in m/s. Now use $a_c = v^2/r$.` },
            { value: (rad / T) ** 2 / rad, feedback: t`The speed is $2\pi r/T$ — the distance round the rim per turn, not $r/T$.` },
          ],
          hints: [t`First the rim speed: $v = 2\pi r/T$.`, t`Then $a_c = v^2/r = 4\pi^2 r/T^2$.`],
          teach: 'From the period: v = 2πr/T, so a_c = 4π²r/T².',
          explain: t`$v = 2\pi(${rad})/${T} = ${s3((2 * Math.PI * rad) / T)}$ m/s, so $a_c = v^2/r = ${s3(a)}\ \text{m/s}^2$ — about ${s3(a / G)} g.`,
          visual: {
            type: 'graph',
            params: {
              x: [-rad * 1.5, rad * 1.5], y: [-rad * 1.25, rad * 1.25], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              curves: [circle(rad, 'accent', { width: 3 })],
              arrows: [{ from: [0, 0], to: [rad, 0], color: 'ink4', label: `r = ${rad} m` }],
              points: [{ x: 0, y: rad, color: 'gold', label: 'person on the rim' }, { x: 0, y: 0, color: 'ink3' }],
            },
            caption: 'The ring, seen along its axis (people stand on the inside of the rim).',
          },
        };
      },
    }),
    num({
      id: 'turn-radius', difficulty: 2,
      gen(r) {
        const v = r.pick([200, 250, 300]), n = r.pick([4, 5, 6, 7]);
        const R = (v * v) / (n * G);
        return {
          prompt: t`A fighter flies a horizontal circle at ${v} m/s with a centripetal acceleration of ${n}g. What is the radius of its turn?`,
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v * v) / n, feedback: t`Convert the acceleration to m/s² first: ${n}g = ${nice(n * G)} m/s².` }, { value: v / (n * G), feedback: t`Square the speed: $r = v^2/a_c$.` }],
          hints: [t`$a_c = v^2/r$, so $r = v^2/a_c$.`, t`$a_c = ${n} \times 9.8\ \text{m/s}^2$.`],
          teach: 'For a given speed, a tighter turn needs a larger centripetal acceleration: r = v²/a.',
          explain: t`$r = \dfrac{v^2}{a_c} = \dfrac{${v}^2}{${n}(9.8)} = ${s3(R)}$ m. (The pilot’s total load is a little more than ${n}g, since gravity still acts vertically.)`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 1.6], y: [-1.2, 1.25], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              curves: [circle(1)],
              arrows: [{ from: [0, -1], to: [0.6, -1], color: 'gold', label: `${v} m/s` }, { from: [0, -1], to: [0, -0.55], color: 'bad', label: `${n}g` }],
              points: [{ x: 0, y: -1, color: 'accent' }, { x: 0, y: 0, color: 'ink3', label: 'centre' }],
            },
            caption: 'The turn seen from above (a sketch, not to scale).',
          },
        };
      },
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: 'A car takes the same circular bend twice, the second time at twice the speed. Its centripetal acceleration the second time is:',
      choices: ['4 times as large', '2 times as large', 'The same, because the radius is the same', 'Half as large'],
      answer: 0,
      why: {
        1: 'The acceleration goes as v², so doubling v doubles it twice.',
        2: 'The radius is the same, but a depends on the speed too — on its square.',
        3: 'Faster round the same bend means turning the velocity faster, not slower.',
      },
      hints: [t`$a_c = v^2/r$ with $r$ fixed.`],
      teach: 'At a fixed radius, centripetal acceleration grows with the square of the speed.',
      explain: t`$a_c' = (2v)^2/r = 4v^2/r$. That is why entering a bend too fast is so dangerous: the grip needed grows four times.`,
      visual: {
        type: 'graph',
        params: {
          x: [-9, 9], y: [-7.5, 7.5], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [circle(5)],
          arrows: [{ from: [5, 0], to: [5, 2], color: 'gold', label: 'v' }, { from: [-5, 0], to: [-5, -4], color: 'warn', label: '2v' }],
          points: [{ x: 5, y: 0, color: 'accent' }, { x: -5, y: 0, color: 'accent' }, { x: 0, y: 0, color: 'ink3' }],
        },
        caption: 'Two passes round the same bend, seen from above: one at speed v, one at 2v.',
      },
    }),
    num({
      id: 'rpm', difficulty: 2,
      gen(r) {
        const N = r.pick([3000, 4500, 6000]), rad = r.pick([0.08, 0.1, 0.12]);
        const w = (2 * Math.PI * N) / 60, a = w * w * rad, ng = a / G;
        return {
          prompt: t`A laboratory centrifuge spins samples ${nice(rad * 100)} cm from its axis at ${N} rpm. Their centripetal acceleration is how many times $g$?`,
          answer: ng, tol: { rel: 0.01 },
          errors: [
            { value: ((2 * Math.PI * N) ** 2 * rad) / G, feedback: 'Convert revolutions per minute to per second: divide by 60.' },
            { value: ((N / 60) ** 2 * rad) / G, feedback: t`You need the angular speed in rad/s: $\omega = 2\pi \times$ (revolutions per second).` },
            { value: a, feedback: 'That is the acceleration in m/s². Divide by 9.8 m/s² to express it in g.' },
          ],
          hints: [t`$\omega = 2\pi N/60$ rad/s, then $a = \omega^2 r$.`, 'Divide by 9.8 m/s² at the end.'],
          teach: 'Convert rpm to rad/s (×2π/60), then a = ω²r.',
          explain: t`$\omega = 2\pi(${N})/60 = ${s3(w)}$ rad/s; $a = \omega^2 r = (${s3(w)})^2(${rad}) = ${s3(a)}\ \text{m/s}^2$, about $${s3(ng)}g$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.2, 0.2], y: [-0.16, 0.16], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [circle(rad)],
              arrows: [{ from: [0, 0], to: [rad, 0], color: 'ink4', label: `${nice(rad * 100)} cm` }],
              points: [{ x: rad, y: 0, color: 'accent', label: 'sample' }, { x: 0, y: 0, color: 'ink3' }],
            },
            caption: 'The sample’s circle, seen along the rotor axis, to scale.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-curve', difficulty: 2,
      gen(r) {
        const v = r.pick([15, 20, 25]), rad = r.pick([50, 80, 120]);
        const a = (v * v) / rad;
        return {
          prompt: t`A car rounds a bend of radius ${rad} m at a steady ${v} m/s. What is its centripetal acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: v / rad, feedback: t`Square the speed: $a = v^2/r$.` }],
          hints: [t`$a_c = v^2/r$.`],
          teach: 'Centripetal acceleration is v²/r, toward the centre of the bend.',
          explain: t`$a_c = ${v}^2/${rad} = ${s3(a)}\ \text{m/s}^2$ — about ${s3(a / G)} g.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 1.6], y: [-1.2, 1.25], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [-1.2, 1.2], color: 'ink3', width: 6 }],
              arrows: [{ from: [1, 0], to: [1, 0.55], color: 'gold', label: `${v} m/s` }],
              points: [{ x: 1, y: 0, color: 'accent' }, { x: 0, y: 0, color: 'ink3', label: `centre, ${rad} m away` }],
            },
            caption: 'The bend seen from above (a sketch, not to scale).',
          },
        };
      },
    }),
    num({
      id: 'cp-iss', difficulty: 3, transfer: true,
      prompt: t`The International Space Station circles Earth about 420 km up, at a radius of about 6790 km from Earth’s centre, once every 92.7 minutes. What is its centripetal acceleration?`,
      answer: (4 * Math.PI * Math.PI * 6.79e6) / (92.7 * 60) ** 2, units: 'm/s^2', tol: { rel: 0.01 },
      errors: [
        { value: (2 * Math.PI * 6.79e6) / (92.7 * 60), feedback: t`That is its speed in m/s. Now $a_c = v^2/r$.` },
        { value: (4 * Math.PI * Math.PI * 6.79e3) / (92.7 * 60) ** 2, feedback: 'Convert the radius to metres.' },
        { value: (4 * Math.PI * Math.PI * 6.79e6) / 92.7 ** 2, feedback: 'Convert the period to seconds.' },
      ],
      hints: [t`$v = 2\pi r/T$ with $r$ in metres and $T$ in seconds.`, t`$a_c = 4\pi^2 r/T^2$.`],
      teach: 'An orbit is uniform circular motion: a_c = 4π²r/T², with r from the planet’s centre.',
      explain: t`$a_c = \dfrac{4\pi^2(6.79\times10^6)}{(5562)^2} = 8.67\ \text{m/s}^2$ — essentially the strength of Earth’s gravity at that height ($9.8 \times (6371/6790)^2 \approx 8.6\ \text{m/s}^2$). The station is in free fall; its crew float because they fall with it.`,
      visual: {
        type: 'graph',
        params: {
          x: [-9e6, 9e6], y: [-7.6e6, 7.6e6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [circle(6.371e6, 'accent', { width: 2 }), circle(6.79e6, 'ink3', { dash: true })],
          points: [{ x: 0, y: 6.79e6, color: 'gold', label: 'ISS' }, { x: 0, y: 0, color: 'ink3' }],
        },
        caption: 'Earth and the station’s orbit, to scale: 420 km is a thin shell above the surface.',
      },
    }),
    mcq({
      id: 'cp-seat', difficulty: 2,
      prompt: 'In the training centrifuge, seen from the ground, what gives the astronaut her centripetal acceleration?',
      choices: ['The seat pushing her toward the axis', 'A centrifugal force pushing her outward', 'Nothing: at constant speed no force is needed', 'Her weight'],
      answer: 0,
      why: {
        1: 'In the ground frame there is no outward force. What she feels as being pressed outward is the seat pushing her inward, against her tendency to go straight.',
        2: 'Constant speed, but changing direction: a centripetal acceleration needs an inward force.',
        3: 'Her weight acts downward, not toward the axis of a horizontal circle.',
      },
      hints: ['Which way does her acceleration point?', 'Which object touching her could push her that way?'],
      teach: 'Something must pull or push an object toward the centre to keep it on a circle; in the ground frame there is no outward force.',
      explain: t`Her acceleration points to the axis, so the net horizontal force on her must too: the seat back presses on her, toward the axis. “Centrifugal force” only appears if you describe the motion from the rotating cabin (lesson M6 on non-inertial frames).`,
      visual: {
        type: 'graph',
        params: {
          x: [-11, 11], y: [-10, 10], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [circle(8)],
          arrows: [{ from: [0, 0], to: [6.93, 4], color: 'ink3' }, { from: [6.93, 4], to: [3.93, 9.2], color: 'gold', label: 'v' }],
          points: [{ x: 0, y: 0, color: 'ink' }, { x: 6.93, y: 4, color: 'accent', label: 'cabin' }],
        },
        caption: 'The centrifuge seen from above.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §4.4', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-4-uniform-circular-motion' }],
});
