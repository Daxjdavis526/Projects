// Dynamics of circular motion: real forces must supply a net inward force mv²/r.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, force, bodyFBD, scene, s3, t3, sin, cos, tan } from './_forces.js';

const t = String.raw;

// a top view of circular motion: the path (dashed), the centre, the body, and labelled arrows
function topView({ arc = [0, 2 * Math.PI], body = 0, arrows = [], points = [], lines = [], caption, r = 1 }) {
  const bx = +(r * Math.cos(body)).toFixed(4), by = +(r * Math.sin(body)).toFixed(4);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-1.9, 1.9], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: arc, color: 'ink3', width: 1.6, dash: true }, ...lines],
      points: [{ x: 0, y: 0, r: 3.5, color: 'ink3' }, { x: -0.2, y: -0.25, r: 0.01, color: 'ink3', label: 'centre' }, { x: bx, y: by, r: 8, color: 'accent' }, ...points],
      arrows: arrows.map((a) => ({ from: [bx, by], ...a })),
    },
    caption,
  };
}

export default lesson({
  id: 'phys2210.M6.4',
  title: 'Dynamics of circular motion',
  minutes: 11, difficulty: 3,
  intro: t`An object moving in a circle at constant speed is accelerating — toward the centre, with $a_c = v^2/r$ (module M4). So by Newton’s second law, the real forces on it must add up to a net force pointing at the centre:

$$\sum F_\text{in} = \frac{m v^2}{r}$$

“Centripetal force” is not a new kind of force: it is the name for this net inward force, and real forces must supply it — the tension in a whirled string, friction on a car’s tyres, part of the normal force on a banked curve, gravity on an orbiting satellite. Nothing pushes outward. In the ground’s frame, a passenger pressed against the door of a turning car is simply being pushed inward by the door.`,
  symbols: [
    { tex: '\\sum F_\\text{in}', text: 'the net force toward the centre of the circle, in N: add the inward components of all the real forces' },
    { tex: 'm', text: 'the mass going round, in kg' },
    { tex: 'v', text: 'its speed, in m/s' },
    { tex: 'r', text: 'the radius of the circle, in m' },
    { tex: 'v^2/r', text: 'the centripetal acceleration, in m/s², pointing at the centre' },
  ],
  why: 'Every orbit is this equation with gravity supplying the inward force — and so is an airliner’s banked turn, the g-load at the bottom of a loop, and the artificial gravity of a spinning space station.',
  visual: {
    type: 'mech-fbd',
    title: 'A car on a banked curve',
    lead: t`A car on a banked curve, seen from behind; the centre of the curve is to the left. Its diagram shows the weight, the normal force and whatever friction the car needs. Together they must make a net force pointing **horizontally at the centre**, of size $mv^2/R$.`,
    tasks: [
      'Find the no-friction speed in the readout and set v to it: friction vanishes, and the tilted normal force alone turns the car.',
      'Go faster: friction swings round to point down the slope; past the top of the safe range the car slides up and out.',
      'Flatten the road (θ = 0): only friction can turn the car, and the safe speed drops to √(μs g R).',
    ],
    params: { scene: 'banked', m: 1200, v: 20, R: 80, theta: 15, mus: 0.5, values: true, sliders: ['v', 'theta', 'R', 'mus'] },
    caption: t`A car treated as a point mass on a circle of radius $R$; static friction is whatever is needed, up to $\mu_s N$. The acceleration (gold) is $v^2/R$ toward the centre while the tyres grip. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A 1200 kg car rounds a flat (unbanked) curve of radius 50 m at 15 m/s. The coefficient of static friction between tyres and road is 0.60. Can the tyres hold the car on the curve, and what is the fastest it could go?`,
    visual: scene('banked', { m: 1200, v: 15, R: 50, theta: 0, mus: 0.6, values: true }, 'Rear view of the car on the flat curve, and its free-body diagram to scale.'),
    steps: [
      { label: 'What is needed', text: t`To go round, the car needs a net inward force $\dfrac{mv^2}{R} = \dfrac{(1200)(15^2)}{50} = 5400$ N.` },
      { label: 'Who supplies it', text: t`On a flat road the only horizontal force is static friction from the road, so friction must be 5400 N, pointing at the centre.` },
      { label: 'Can it?', text: t`Its maximum is $\mu_s N = \mu_s mg = (0.60)(1200)(9.8) = 7060$ N. Since $5400 < 7060$, the tyres hold.` },
      { label: 'Top speed', text: t`At the limit $\mu_s mg = mv^2/R$, so $v_{\max} = \sqrt{\mu_s g R} = \sqrt{(0.60)(9.8)(50)} = 17.1$ m/s. The mass cancels.` },
      { label: 'Sense check', text: t`About 62 km/h on a tight curve — on a wet road (smaller $\mu_s$) the limit is lower, which is why curves carry speed advisories.` },
    ],
    answer: t`Yes: it needs 5400 N of friction and can get up to 7060 N. The fastest safe speed is 17.1 m/s.`,
  },
  practice: [
    mcq({
      id: 'flat-curve-force', difficulty: 1,
      prompt: 'A car rounds a flat, unbanked curve at constant speed. Which force supplies the inward (centripetal) force?',
      visual: scene('banked', { m: 1200, v: 15, R: 50, theta: 0, mus: 0.6, show: 'picture', quiet: true }, 'Rear view of a car on a flat curve; the centre of the curve is to the left.'),
      choices: ['Static friction from the road, pointing toward the centre', 'A centrifugal force pointing away from the centre', 'The engine’s driving force', 'The normal force from the road'],
      answer: 0,
      why: {
        1: 'In the ground’s frame nothing pushes the car outward. The car needs an inward force, and friction provides it.',
        2: 'The engine keeps the speed up against drag; it is internal, and the driving force points along the road, not toward the centre.',
        3: 'On a flat road the normal force is vertical, so it has no inward part.',
      },
      hints: ['Which force on the car can point horizontally, toward the centre?'],
      teach: 'Centripetal force is a role, not a new force: on a flat curve, static friction plays it.',
      explain: 'Only friction from the road acts horizontally on the car, so static friction must point at the centre with size mv²/r. If it cannot, the car slides outward along a straighter path.',
    }),
    num({
      id: 'whirl', difficulty: 1,
      gen(r) {
        const m = r.pick([0.15, 0.2, 0.25, 0.3]), L = r.pick([0.6, 0.8, 1.0, 1.2]), v = r.pick([2, 3, 4, 5]);
        const T = (m * v * v) / L;
        return {
          prompt: t`A ${m} kg puck on a frictionless table is tied to a ${L} m string pinned at the centre, and slides round in a circle at ${v} m/s. What is the tension in the string?`,
          visual: topView({ arrows: [{ to: [0.45, 0], color: 'good', label: 'T' }, { to: [1, 0.55], color: 'accent2', label: 'v' }], lines: [{ param: ['t', '0'], t: [0, 1], color: 'ink4', width: 1.2 }], caption: 'Top view: the string’s pull points at the centre; the velocity is along the tangent. The weight and the table’s push are vertical and cancel.' }),
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: (m * v) / L, feedback: t`Square the speed: the inward force is $mv^2/r$.` },
            { value: m * G, feedback: 'That is the puck’s weight, which the table balances. The string must supply the inward force.' },
          ].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`The string is the only horizontal force, so it must supply $mv^2/r$.`],
          teach: 'For circular motion, the net inward force equals mv²/r.',
          explain: t`$T = \dfrac{mv^2}{r} = \dfrac{(${m})(${v})^2}{${L}} = ${s3(T)}$ N.`,
        };
      },
    }),
    num({
      id: 'flat-vmax', difficulty: 2,
      gen(r) {
        const R = r.pick([30, 40, 60, 80, 100]), mus = r.pick([0.4, 0.5, 0.6, 0.7, 0.8]);
        const v = Math.sqrt(mus * G * R);
        return {
          prompt: t`What is the highest speed at which a car can round a flat curve of radius ${R} m if the coefficient of static friction is ${mus}?`,
          visual: scene('banked', { m: 1200, v: 0.999 * v, R, theta: 0, mus, accel: false, quiet: true }, 'At the limit, friction supplies all it can, μs N, toward the centre. To scale.'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: mus * G * R, feedback: t`That is $v^2$. Take the square root.` },
            { value: Math.sqrt(G * R), feedback: 'Friction supplies only μs times the weight: include μs.' },
          ],
          hints: [t`At the limit, maximum friction equals the needed inward force: $\mu_s mg = mv^2/R$.`],
          teach: 'On a flat curve the speed limit is √(μs g R), the same for any mass.',
          explain: t`$v_{\max} = \sqrt{\mu_s g R} = \sqrt{(${mus})(9.8)(${R})} = ${s3(v)}$ m/s.`,
        };
      },
    }),
    num({
      id: 'design-speed', difficulty: 2,
      gen(r) {
        const R = r.pick([60, 100, 150, 200, 300]), th = r.pick([10, 12, 15, 18, 20]);
        const v = Math.sqrt(R * G * tan(th));
        return {
          prompt: t`A curve of radius ${R} m is banked at ${th}°. At what speed can a car take it with no friction at all?`,
          visual: scene('banked', { m: 1200, v, R, theta: th, mus: 0.5, accel: false, quiet: true }, 'At this speed the normal force alone turns the car. To scale.'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(R * G * sin(th)), feedback: t`Divide the two components: $N\sin\theta = mv^2/R$ and $N\cos\theta = mg$ give $\tan\theta$.` },
            { value: R * G * tan(th), feedback: t`That is $v^2$. Take the square root.` },
          ].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: [t`With no friction: $N\cos\theta = mg$ vertically and $N\sin\theta = mv^2/R$ inward.`, t`Divide: $\tan\theta = v^2/(gR)$.`],
          teach: 'A banked curve’s design speed is √(gR tan θ): there the tilted normal force alone supplies mv²/R.',
          explain: t`$v = \sqrt{gR\tan\theta} = \sqrt{(9.8)(${R})\tan ${th}^\circ} = ${s3(v)}$ m/s (${s3(v * 3.6)} km/h).`,
        };
      },
    }),
    num({
      id: 'hill-crest', difficulty: 2,
      gen(r) {
        const m = r.pick([900, 1100, 1300, 1500]), R = r.pick([20, 30, 40]), v = r.pick([8, 10, 12]);
        const N = m * (G - (v * v) / R);
        return {
          prompt: t`A ${m} kg car drives over the top of a hill whose crest is a circular arc of radius ${R} m, at ${v} m/s. What is the normal force from the road at the very top?`,
          visual: scene('crest', { m, v, R, where: 'hill', ask: ['N'], quiet: true }, 'At the crest the centre of the circle is below the car. To scale.'),
          answer: N, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: m * G, feedback: 'The car is accelerating toward the centre, below it, so the road pushes up with less than mg.' },
            { value: m * (G + (v * v) / R), feedback: 'At a crest the centre is below the car: the net force must point down, so N is less than mg.' },
          ],
          hints: ['The centre of the circle is straight below the car: the net force must point down.', t`$mg - N = mv^2/R$.`],
          teach: 'Over a crest, N = m(g − v²/R): you feel lighter, and at v = √(gR) the road stops pushing.',
          explain: t`$N = m\left(g - \dfrac{v^2}{R}\right) = ${m}\left(9.8 - \dfrac{${v}^2}{${R}}\right) = ${t3(N)}$ N, below the weight of $${t3(m * G)}$ N.`,
        };
      },
    }),
    num({
      id: 'pull-out', difficulty: 3,
      gen(r) {
        const v = r.pick([150, 180, 200, 220]), R = r.pick([800, 1000, 1200, 1500]);
        const n = 1 + (v * v) / (G * R);
        return {
          prompt: t`A jet pulls out of a dive along a vertical circle of radius ${t3(R)} m, at ${v} m/s. At the lowest point, what is the pilot’s apparent weight — the seat’s push on her — as a multiple of her ordinary weight (the g-load)?`,
          visual: bodyFBD([force('N (seat)', 70 * (G + (v * v) / R), 90, 'normal'), force('mg', 70 * G, 270, 'weight')], { icon: 'plane', show: 'both', v: [1, 0], name: 'Forces on the pilot', caption: 'At the bottom of the pull-out the centre of the circle is straight above her. To scale for a 70 kg pilot.' }),
          answer: n, tol: { rel: 0.01 },
          errors: [
            { value: (v * v) / (G * R), feedback: 'The seat must hold up her weight as well as supply the inward force: add 1.' },
            { value: 1 - (v * v) / (G * R), feedback: 'At the bottom the centre is above her: the seat pushes harder than her weight, not less.' },
          ],
          hints: ['At the bottom, the centre of the circle is straight up: the net force must point up.', t`$N - mg = mv^2/R$, so $N/mg = 1 + v^2/(gR)$.`],
          teach: 'At the bottom of a vertical circle the g-load is 1 + v²/(gR).',
          explain: t`$\dfrac{N}{mg} = 1 + \dfrac{v^2}{gR} = 1 + \dfrac{${v}^2}{(9.8)(${R})} = ${s3(n)}$: she feels ${s3(n)} times her weight, which is why fighter pilots wear g-suits.`,
        };
      },
    }),
    num({
      id: 'iss-orbit', difficulty: 2,
      gen(r) {
        const [h, v] = r.pick([[400, 7670], [410, 7660], [420, 7655]]);
        const rr = (6371 + h) * 1000, a = (v * v) / rr;
        return {
          prompt: t`The International Space Station orbits ${h} km above Earth’s surface (Earth’s radius is 6371 km) at ${v} m/s. What is its centripetal acceleration?`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-1.9, 1.9], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ polar: '1', theta: [0, 2 * Math.PI], color: 'teal', width: 2 }, { polar: String(+(1 + h / 6371).toFixed(4)), theta: [0, 2 * Math.PI], color: 'ink3', width: 1.4, dash: true }],
              points: [{ x: 0, y: 0, r: 3, color: 'teal', label: 'Earth' }, { x: +(1 + h / 6371).toFixed(4), y: 0, r: 7, color: 'accent', label: 'ISS' }],
              arrows: [{ from: [+(1 + h / 6371).toFixed(4), 0], to: [0.55, 0], color: 'ink2', label: 'gravity' }, { from: [+(1 + h / 6371).toFixed(4), 0], to: [+(1 + h / 6371).toFixed(4), 0.6], color: 'accent2', label: 'v' }],
            },
            caption: 'Earth and the station’s orbit to scale (the orbit hugs the planet); the arrows are not to scale.',
          },
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: (v * v) / (h * 1000), feedback: 'Use the radius of the circle, measured from Earth’s centre, not the height above the surface.' },
            { value: G, feedback: 'That is the surface value. Compute v²/r at the station’s orbit.' },
          ],
          hints: ['The radius of the orbit is measured from Earth’s centre.', t`$a = v^2/r$ with $r = (6371 + ${h})$ km.`],
          teach: 'An orbit is circular motion with gravity as the inward force: a = v²/r.',
          explain: t`$a = \dfrac{v^2}{r} = \dfrac{(${v})^2}{${t3(rr, 4)}\ \text{m}} = ${s3(a)}\ \text{m/s}^2$ — just what gravity provides at that height, about 89% of its surface value. The station falls toward Earth at that rate while moving sideways fast enough to keep missing it.`,
        };
      },
    }),
    mcq({
      id: 'release', difficulty: 2,
      prompt: 'A stone whirls in a horizontal circle on a string. At the moment shown, the string snaps. Seen from above, which path does the stone follow next (ignoring gravity’s downward pull)?',
      visual: topView({ body: Math.PI / 4, lines: [{ param: ['t*0.7071', 't*0.7071'], t: [0, 1], color: 'ink2', width: 1.6 }], points: [{ x: 0.78, y: 0.66, r: 0.01, color: 'bad', label: 'the string breaks now' }], caption: 'Top view of the circle, the stone and the string, at the moment the string breaks.' }),
      choices: ['A straight line along the tangent to the circle', 'A straight line radially outward, away from the centre', 'It keeps circling for a while, then drifts out', 'A spiral, gradually widening'],
      answer: 0,
      why: {
        1: 'Nothing pushes it outward; without the string there is no horizontal force, so it keeps the velocity it had — along the tangent.',
        2: 'Circling needs an inward force. Once the string snaps there is none, so the path straightens at once.',
        3: 'A spiral would still need a sideways force to bend the path; there is none.',
      },
      hints: ['After the snap, what horizontal force acts on the stone? What does the first law say?'],
      teach: 'Released from circular motion, a body flies off along the tangent, not outward.',
      explain: 'With no horizontal force, the stone keeps its velocity at the moment of release, which points along the tangent. It only seems to fly outward because the circle curves away from that straight line.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-airliner-turn', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([100, 120, 140, 160]), phi = r.pick([15, 20, 25, 30]);
        const R = (v * v) / (G * tan(phi));
        return {
          prompt: t`An airliner flying at ${v} m/s makes a level turn with its wings banked at ${phi}°. What is the radius of its turn?`,
          visual: scene('turn', { m: 70000, v, phi, accel: false, quiet: true }, 'Rear view: the lift tilts with the wings; the centre of the turn is to the left.'),
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (v * v) / (G * sin(phi)), feedback: t`Divide the two equations: $L\sin\varphi = mv^2/R$ and $L\cos\varphi = mg$ give $\tan\varphi$, not $\sin\varphi$.` },
            { value: (v * v) / G, feedback: 'The bank angle sets how much of the lift turns the plane: include tan φ.' },
          ],
          hints: [t`Vertical: $L\cos\varphi = mg$. Horizontal: $L\sin\varphi = mv^2/R$.`],
          teach: 'In a level banked turn, tan φ = v²/(gR): faster or shallower means a wider turn.',
          explain: t`$R = \dfrac{v^2}{g\tan\varphi} = \dfrac{${v}^2}{(9.8)\tan ${phi}^\circ} = ${t3(R)}$ m. The lift is $mg/\cos\varphi$, so passengers feel ${s3(1 / cos(phi))} times their weight.`,
        };
      },
    }),
    mcq({
      id: 'cp-centrifugal', difficulty: 2,
      prompt: 'A car turns sharply to the left, and a passenger finds herself pressed against the right-hand door. Seen from the ground (an inertial frame), what is happening?',
      visual: topView({ arc: [-0.6, 1.9], body: 0, lines: [{ param: ['1', 't'], t: [0, 1.15], color: 'warn', width: 1.6, dash: true }], points: [{ x: 1.02, y: 1.05, r: 0.01, color: 'warn', label: 'straight on' }, { x: -0.45, y: 0.95, r: 0.01, color: 'ink3', label: 'the car’s path' }], caption: 'Top view: the car turns left (anticlockwise) around the centre; the dashed gold line is the straight path a free body would follow.' }),
      choices: [
        'She tends to keep going straight; the door pushes her inward, toward the centre, so that she turns with the car',
        'A centrifugal force throws her outward against the door',
        'The car’s turning creates an outward force on everything inside it',
        'The seat’s friction pushes her outward',
      ],
      answer: 0,
      why: {
        1: 'No agent exerts such a force. In the ground’s frame, she just tends to continue straight while the car turns under her.',
        2: 'Turning creates no outward force; it requires an inward one.',
        3: 'Friction from the seat, if anything, helps pull her inward, toward the centre.',
      },
      hints: ['If nothing pushed her sideways, what path would she follow?'],
      teach: 'In the ground’s frame there is no centrifugal force: the door pushes passengers inward to make them turn.',
      explain: 'She keeps going straight (first law) until the door reaches her and pushes her inward, supplying the centripetal force that makes her turn. The “outward” push she feels is the door, pushing in.',
    }),
    num({
      id: 'cp-banked-max', difficulty: 3,
      gen(r) {
        const R = r.pick([80, 100, 150, 200]), th = r.pick([10, 15, 20]), mus = r.pick([0.3, 0.4, 0.5]);
        const v = Math.sqrt((R * G * (sin(th) + mus * cos(th))) / (cos(th) - mus * sin(th)));
        return {
          prompt: t`A curve of radius ${R} m is banked at ${th}°, and the coefficient of static friction is ${mus}. What is the fastest a car can take it without sliding?`,
          visual: scene('banked', { m: 1200, v: 0.999 * v, R, theta: th, mus, accel: false, quiet: true }, 'At the limit, friction points down the slope with its maximum size, μs N. To scale.'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(R * G * tan(th)), feedback: 'That is the no-friction speed. Friction pointing down the slope lets the car go faster.' },
            { value: Math.sqrt(mus * G * R), feedback: 'That is the limit for a flat curve; the banking helps too.' },
          ],
          hints: [t`At the limit, friction $\mu_s N$ points down the slope. Inward: $N\sin\theta + \mu_s N\cos\theta = mv^2/R$. Vertical: $N\cos\theta - \mu_s N\sin\theta = mg$.`, t`Divide: $v^2 = gR\,\dfrac{\sin\theta + \mu_s\cos\theta}{\cos\theta - \mu_s\sin\theta}$.`],
          teach: 'Banking and friction together raise a curve’s speed limit above both the flat and the no-friction values.',
          explain: t`$v_{\max} = \sqrt{gR\,\dfrac{\sin\theta + \mu_s\cos\theta}{\cos\theta - \mu_s\sin\theta}} = ${s3(v)}$ m/s, compared with ${s3(Math.sqrt(R * G * tan(th)))} m/s with no friction and ${s3(Math.sqrt(mus * G * R))} m/s on the flat.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §6.3 Centripetal Force', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-3-centripetal-force' }],
});
