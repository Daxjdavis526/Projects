// Conservation of mechanical energy: with only conservative forces doing work,
// K + U stays constant — speed and position trade off, and only the endpoints matter.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, s3, sci, thou, energyBars, springPic } from './_energy.js';

const t = String.raw;
const D2R = Math.PI / 180;

// the Explore track: two valleys either side of a middle hill (heights in m)
const TRACK = '0.5 + 4*exp(-((x + 1)/2)^2) + 1.8*exp(-((x - 6)/1.2)^2) + 4*exp(-((x - 13)/2)^2)';

// the worked example: a vertical spring launcher
const EX = { k: 900, x: 0.08, m: 0.05 };
EX.Us = 0.5 * EX.k * EX.x ** 2;                     // 2.88 J
EX.h = EX.Us / (EX.m * G);                          // 5.88 m above the release point
EX.Ug1 = EX.m * G * EX.x;                           // 0.0392 J when the spring is relaxed
EX.v1 = Math.sqrt((2 * (EX.Us - EX.Ug1)) / EX.m);   // 10.7 m/s leaving the spring

// the bar-matching track: release at A (x = 0), a second hill D three-quarters as high, C at half A's height
const BT = { A: 4 * Math.exp(-((0.5 / 1.6) ** 2)) };
BT.D = 0.75 * BT.A;
BT.xC = -0.5 + 1.6 * Math.sqrt(Math.log(4 / (BT.A / 2)));
BT.h = `4*exp(-((x + 0.5)/1.6)^2) + ${+BT.D.toFixed(4)}*exp(-((x - 8)/1.3)^2)`;

// a static track picture: the track, labelled points and the release level
const trackPic = (h, x, marks, caption, extra = {}) => ({
  type: 'mech-energy',
  params: { h, x, particle: false, equilibria: false, marks, xlabel: 'x (m)', ...extra },
  caption,
});

// a pendulum released at angle th (degrees), with the drop h marked
const pendulumPic = (th, caption) => {
  const s = Math.sin(th * D2R), c = Math.cos(th * D2R);
  return {
    type: 'graph',
    params: {
      x: [-1.5, 1.5], y: [-1.25, 0.25], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '',
      alt: 'A pendulum pulled aside, with the height it drops to the bottom of its swing',
      curves: [
        { param: [`${-s}*t`, `${-c}*t`], t: [0, 1], color: 'ink2', width: 2 },
        { param: ['0', '-t'], t: [0, 1.05], color: 'ink3', width: 1, dash: true },
        { param: ['sin(t)', '-cos(t)'], t: [-th * D2R - 0.15, 0.35], color: 'ink4', width: 1.2, dash: true },
        { param: ['0.25*sin(t)', '-0.25*cos(t)'], t: [-th * D2R, 0], color: 'gold', width: 1.6 },
        { param: ['t', String(+(-c).toFixed(4))], t: [+(-s).toFixed(4), 0.55], color: 'ink3', width: 1, dash: true },
        { param: ['t', '-1'], t: [-0.1, 0.55], color: 'ink3', width: 1, dash: true },
      ],
      arrows: [{ from: [0.5, +(-c).toFixed(4)], to: [0.5, -1], color: 'gold', label: 'h', labelDx: 8, labelDy: 10 }],
      points: [{ x: 0, y: 0, r: 4, color: 'ink' }, { x: +(-s).toFixed(4), y: +(-c).toFixed(4), r: 9, color: 'accent' }, { x: +(-0.32 * Math.sin(th * D2R / 2)).toFixed(4), y: +(-0.32 * Math.cos(th * D2R / 2)).toFixed(4), r: 0.01, color: 'gold', label: `${th}°`, labelDx: -30, labelDy: 8 }, { x: 0, y: -1, r: 4, color: 'ink3' }],
    },
    caption,
  };
};

export default lesson({
  id: 'phys2210.M8.3',
  title: 'Conservation of mechanical energy',
  minutes: 12, difficulty: 2,
  intro: t`When only conservative forces — gravity, springs — do work, energy lost from one form shows up in another, and the total **mechanical energy** $E = K + U$ stays fixed:

$$K_i + U_i = K_f + U_f$$

Height and compression trade for speed and back again. Because energy is a scalar, you need only the start and the end: not the path, the angles or the time. That is what makes it the fastest way to answer “how fast?” and “how high?”.`,
  symbols: [
    { tex: 'K = \\tfrac12 mv^2', text: 'kinetic energy, in J' },
    { tex: 'U', text: 'the total potential energy, in J: the sum of every kind present, such as $U_g = mgy$ and $U_s = \\tfrac12 kx^2$' },
    { tex: 'E = K + U', text: 'the mechanical energy, constant when only conservative forces do work' },
    { tex: '_i,\\ _f', text: 'subscripts for the initial and final moments you choose to compare' },
  ],
  why: 'Conservation of energy is the most powerful idea in mechanics and the template for every conservation law that follows — including the energy that fixes the size of an orbit.',
  visual: {
    type: 'mech-energy',
    title: 'Energy on a frictionless track',
    lead: t`A puck slides on a frictionless track. Drag it to a starting point and press **Play**. The bars on the right show its kinetic energy $K$, its gravitational potential energy $U_g$ and their total. The dashed gold line is the release level; the green band shows where the puck can go.`,
    tasks: [
      t`Release it high on the left and press Play: $K$ and $U_g$ trade back and forth, but the total bar never changes.`,
      'Release it lower, below the top of the middle hill: it is trapped in the left valley, turning round wherever the track reaches the release level.',
      'Compare the speed at the bottoms of the two valleys: equal, because both are the same depth below the release level — the slopes’ shapes do not matter.',
    ],
    params: { h: TRACK, x: [0, 12], y: [0, 4.8], m: 1, x0: 0.3, rate: 1, readouts: ['h', 'v', 'K', 'U'] },
    caption: t`A 1.0 kg puck treated as a bead on a frictionless wire: no rolling, no air resistance. Its energy diagram $U = mgh$ has the shape of the track, so the release level is the highest it can ever reach. Integrated numerically; the bars share the track’s height scale (1 m of height is 9.8 J).`,
  },
  example: {
    prompt: t`A spring-loaded launcher with $k = ${EX.k}$ N/m is compressed ${EX.x * 100} cm and fires a ${EX.m * 1000} g ball straight up. Ignoring air resistance, (a) how high above its starting point does the ball rise, and (b) how fast is it moving when it leaves the spring, which happens when the spring reaches its natural length, ${EX.x * 100} cm above the start?`,
    visual: energyBars([
      { title: 'A: compressed', K: 0, Ug: 0, Us: EX.Us },
      { title: 'B: leaves the spring', K: EX.Us - EX.Ug1, Ug: EX.Ug1, Us: 0 },
      { title: 'C: at the top', K: 0, Ug: EX.Us, Us: 0 },
    ], { keys: ['K', 'Ug', 'Us'], values: true, caption: 'Energy bar charts at the three moments, with y = 0 at the starting point A. Every chart has the same total: 2.88 J.' }),
    steps: [
      { label: 'Choose the zero and the moments', text: t`Put $y = 0$ at the ball’s starting point A. Compare A (compressed, at rest), B (spring relaxed, ${EX.x * 100} cm up) and C (the top, momentarily at rest).` },
      { label: 'Energy stored at A', text: t`$U_s = \tfrac12 kx^2 = \tfrac12(${EX.k})(${EX.x})^2 = ${fmt(EX.Us, 3)}$ J, with $K = 0$ and $U_g = 0$.` },
      { label: '(a) A to C', text: t`At C, all of it is gravitational: $mgh = ${fmt(EX.Us, 3)}$ J, so $h = \dfrac{${fmt(EX.Us, 3)}}{(${EX.m})(9.8)} = ${fmt(EX.h, 3)}$ m.` },
      { label: '(b) A to B', text: t`$\tfrac12 mv^2 + mg(${EX.x}) = ${fmt(EX.Us, 3)}$ J, so $\tfrac12 mv^2 = ${fmt(EX.Us, 3)} - ${fmt(EX.Ug1, 3)} = ${fmt(EX.Us - EX.Ug1, 4)}$ J and $v = \sqrt{2(${fmt(EX.Us - EX.Ug1, 4)})/${EX.m}} = ${fmt(EX.v1, 3)}$ m/s.` },
      { label: 'Sense check', text: t`From B the ball should rise $v^2/2g = ${fmt(EX.v1 ** 2 / (2 * G), 3)}$ m more, and $${fmt(EX.v1 ** 2 / (2 * G), 3)} + ${EX.x} = ${fmt(EX.h, 3)}$ m. ✓ Air drag on a light ball would cut this noticeably.` },
    ],
    answer: t`(a) ${fmt(EX.h, 3)} m above the start; (b) ${fmt(EX.v1, 3)} m/s.`,
  },
  practice: [
    num({
      id: 'slide-bottom', difficulty: 1,
      gen(r) {
        const h = r.pick([1.8, 2.5, 3.2, 4.5, 6, 8]);
        const v = Math.sqrt(2 * G * h);
        return {
          prompt: t`A child starts from rest at the top of a frictionless slide ${h} m high. How fast is she moving at the bottom?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: 2 * G * h, feedback: t`That is $v^2$: take the square root.` }, { value: Math.sqrt(G * h), feedback: t`$mgh = \tfrac12 mv^2$ gives $v = \sqrt{2gh}$ — the 2 is missing.` }],
          hints: [t`$mgh = \tfrac12 mv^2$: the mass cancels.`],
          teach: 'Dropping a height h from rest with no friction gives v = √(2gh), whatever the shape of the slope.',
          explain: t`$v = \sqrt{2gh} = \sqrt{2(9.8)(${h})} = ${s3(v)}$ m/s. A real slide has friction, so she arrives a little slower.`,
          visual: trackPic(`${h}*(1 - min(max(x/4, 0), 1))^2*(1 + 2*min(max(x/4, 0), 1))`, [-1, 6], [{ x: 0, label: 'start' }, { x: 5, label: 'bottom' }], t`The slide in profile: ${h} m from top to bottom. Frictionless.`, { y: [-0.4, h * 1.3] }),
        };
      },
    }),
    num({
      id: 'coaster-speed', difficulty: 2,
      gen(r) {
        const h0 = r.pick([20, 25, 30]), v0 = r.pick([2, 3, 4, 5]), h1 = r.pick([5, 8, 12, 15]);
        const v = Math.sqrt(v0 * v0 + 2 * G * (h0 - h1));
        const prof = `${h0}*exp(-((x - 2)/2.2)^2) + ${h1}*exp(-((x - 10)/1.8)^2)`;
        return {
          prompt: t`A roller-coaster car passes over the top of a ${h0} m hill at ${v0} m/s. Ignoring friction and air resistance, how fast is it moving at the top of the next hill, ${h1} m high?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(2 * G * (h0 - h1)), feedback: 'The car already had kinetic energy at the first top. Include ½mv₀².' },
            { value: v0 + Math.sqrt(2 * G * (h0 - h1)), feedback: 'Energies add, speeds do not. Add ½mv₀² to mg(h₀ − h₁), then take the square root.' },
          ].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: [t`$\tfrac12 mv_0^2 + mgh_0 = \tfrac12 mv^2 + mgh_1$.`, t`$v = \sqrt{v_0^2 + 2g(h_0 - h_1)}$.`],
          teach: 'Mechanical energy is the same at both tops: ½mv² + mgh is conserved.',
          explain: t`$v = \sqrt{${v0}^2 + 2(9.8)(${h0} - ${h1})} = ${s3(v)}$ m/s.`,
          visual: trackPic(prof, [-2, 14], [{ x: 2, label: `${h0} m` }, { x: 10, label: `${h1} m` }], 'The two hills in profile; heights in metres above the ground.', { y: [0, h0 * 1.3] }),
        };
      },
    }),
    match({
      id: 'bars', difficulty: 2,
      prompt: t`A puck is released from rest at A on this frictionless track. Taking $U = 0$ at the lowest point B, match each position to its energies ($E$ is the total).`,
      left: ['A (released from rest)', 'B (the lowest point)', 'C (half as high as A)', 'D (three-quarters as high as A)'],
      right: [t`$K = 0,\ U = E$`, t`$K = E,\ U = 0$`, t`$K = U = E/2$`, t`$K = E/4,\ U = 3E/4$`, t`$K = 3E/4,\ U = E/4$`],
      answer: [0, 1, 2, 3],
      hints: ['U is proportional to height above B; K is whatever is left of E.', 'At D the height is 3/4 of A’s, so U = 3E/4.'],
      teach: 'With U proportional to height, the kinetic energy at any point is E minus mgh: the gap below the release level.',
      explain: t`$U = mgh$ with $h$ measured from B, and $K = E - U$. A: all potential. B: all kinetic. C: half and half. D: $U = \tfrac34E$, so $K = \tfrac14E$.`,
      visual: trackPic(BT.h, [0, 10], [{ x: 0.05, label: 'A' }, { x: 4.6, label: 'B' }, { x: +BT.xC.toFixed(4), label: 'C', dx: 10 }, { x: 8, label: 'D' }], 'The track in profile, with the release level dashed. C sits at half A’s height and D at three-quarters of it.', { y: [-0.3, 4.6], levels: [{ E: +(BT.A * G).toFixed(4), label: 'release level' }] }),
    }),
    num({
      id: 'spring-launch', difficulty: 2,
      gen(r) {
        const k = r.pick([200, 400, 600, 800]), x = r.pick([0.05, 0.08, 0.1, 0.12]), m = r.pick([0.2, 0.25, 0.5, 1]);
        const v = x * Math.sqrt(k / m);
        return {
          prompt: t`A ${m} kg block is pushed against a horizontal spring ($k = ${k}$ N/m), compressing it ${Math.round(x * 100)} cm, and released on a frictionless surface. How fast is the block moving when it leaves the spring?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: x * x * k / m, feedback: t`That is $v^2$: take the square root.` }, { value: x * Math.sqrt(k / (2 * m)), feedback: t`$\tfrac12 kx^2 = \tfrac12 mv^2$: the halves cancel, so $v = x\sqrt{k/m}$.` }],
          hints: [t`All the spring energy becomes kinetic: $\tfrac12 kx^2 = \tfrac12 mv^2$.`],
          teach: 'A spring launch turns ½kx² into ½mv², so v = x√(k/m).',
          explain: t`$v = x\sqrt{k/m} = (${x})\sqrt{${k}/${m}} = ${s3(v)}$ m/s.`,
          visual: springPic({ c: -0.3, label: `${Math.round(x * 100)} cm`, caption: 'The block pressed against the compressed spring, before release. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'pendulum', difficulty: 2,
      gen(r) {
        const L = r.pick([0.8, 1.2, 1.5, 2]), th = r.pick([20, 30, 40, 50, 60]);
        const h = L * (1 - Math.cos(th * D2R)), v = Math.sqrt(2 * G * h);
        return {
          prompt: t`A pendulum ${L} m long is pulled aside to ${th}° from the vertical and released. How fast is the bob moving at the bottom of its swing?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(2 * G * L), feedback: 'The bob does not drop the whole length L: it drops L(1 − cos θ).' },
            { value: Math.sqrt(2 * G * L * Math.cos(th * D2R)), feedback: 'L cos θ is how far the bob is below the pivot; the drop is L − L cos θ.' },
          ].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: ['The string does no work (it is perpendicular to the motion); only gravity does.', t`The bob drops $h = L(1 - \cos\theta)$; then $v = \sqrt{2gh}$.`],
          teach: 'The tension in a pendulum string does no work, so the speed at the bottom is √(2gL(1 − cos θ)).',
          explain: t`$h = L(1 - \cos ${th}°) = ${s3(h)}$ m, so $v = \sqrt{2(9.8)(${s3(h)})} = ${s3(v)}$ m/s. The answer does not depend on the bob’s mass.`,
          visual: pendulumPic(th, t`The pendulum released at ${th}°. The bob drops $h = L(1 - \cos\theta)$ to the bottom of its swing. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'same-speed', difficulty: 2,
      prompt: 'From the top of a cliff, three identical stones are thrown with the same speed: one straight up, one horizontally, one straight down. Ignoring air resistance, which hits the sea below fastest?',
      choices: ['All three hit at the same speed', 'The one thrown straight down', 'The one thrown straight up, because it falls from higher', 'The one thrown horizontally'],
      answer: 0,
      why: {
        1: 'It arrives first, but not fastest: each stone starts with the same K and U and ends at the same height, so each ends with the same K.',
        2: 'It does reach a greater height, but it comes back down past the cliff top with its original speed — it has no extra energy.',
        3: 'Direction does not enter: kinetic energy is a scalar, and the same drop adds the same energy.',
      },
      hints: ['Compare each stone’s K + U at the start and at the sea.'],
      teach: 'Energy is a scalar: the same starting speed and the same drop give the same final speed, whatever the direction.',
      explain: t`Each stone starts with $\tfrac12 mv_0^2 + mgh$ and ends with $\tfrac12 mv^2$, so $v = \sqrt{v_0^2 + 2gh}$ for all three. They land at different times and places, at the same speed.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4, 23], y: [0, 28], aspect: 'wide', xlabel: 'x (m)', ylabel: 'height (m)',
          alt: 'Three stones thrown from a cliff in different directions',
          shade: [{ fn: '20', lower: '0', from: -4, to: 0, color: 'ink4', alpha: 0.5 }],
          curves: [
            { param: ['0.7', '20 + 10*t - 4.9*t^2'], t: [0, 3.284], color: 'accent', width: 2 },
            { param: ['10*t', '20 - 4.9*t^2'], t: [0, 2.02], color: 'warn', width: 2 },
            { param: ['1.6', '20 - 10*t - 4.9*t^2'], t: [0, 1.24], color: 'good', width: 2, dash: true },
          ],
          points: [{ x: 0, y: 20, r: 5, color: 'ink' }, { x: 0.9, y: 25.6, r: 0.01, color: 'accent', label: 'up', labelDy: -6 }, { x: 11, y: 15.5, r: 0.01, color: 'warn', label: 'sideways' }, { x: 1.8, y: 6, r: 0.01, color: 'good', label: 'down' }],
        },
        caption: 'The three paths from a 20 m cliff, thrown at 10 m/s; the vertical paths are drawn side by side for clarity, and the axes have different scales. No air resistance.',
      },
    }),
    num({
      id: 'max-compression', difficulty: 3,
      gen(r) {
        const m = r.pick([0.5, 1, 2, 4]), v = r.pick([1.5, 2, 3, 4]), k = r.pick([200, 500, 800, 1200]);
        const x = v * Math.sqrt(m / k);
        return {
          prompt: t`A ${m} kg block slides at ${v} m/s along a frictionless floor into a horizontal spring with $k = ${thou(k)}$ N/m. What is the spring’s maximum compression, in cm?`,
          answer: x * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: (m * v * v) / k * 100, feedback: t`That is $x^2$ (in some unit): take the square root.` }, { value: v * Math.sqrt(m / (2 * k)) * 100, feedback: t`$\tfrac12 mv^2 = \tfrac12 kx^2$: the halves cancel.` }],
          hints: ['At maximum compression the block is momentarily at rest.', t`$\tfrac12 mv^2 = \tfrac12 kx^2$, so $x = v\sqrt{m/k}$.`],
          teach: 'At maximum compression all the kinetic energy has become spring energy: x = v√(m/k).',
          explain: t`$x = v\sqrt{m/k} = (${v})\sqrt{${m}/${thou(k)}} = ${s3(x)}$ m $= ${fmt(x * 100, 3)}$ cm.`,
          visual: springPic({ c: 0, label: '', v: `${v} m/s`, vDir: -1, caption: 'The block sliding toward the relaxed spring, just before contact. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'loop', difficulty: 3, kind: 'error',
      prompt: t`A cart is released from rest at height $h$ on a frictionless track that leads into a vertical loop of radius $R$. A student reasons: “The top of the loop is at height $2R$, so releasing the cart from $h = 2R$ is enough — it reaches the top with $K \ge 0$.” What is wrong?`,
      choices: [
        t`At the top the cart is moving in a circle, so it needs $v^2 \ge gR$ there; that requires $h \ge 2.5R$`,
        t`Nothing: $h = 2R$ is exactly enough`,
        t`It needs $h \ge 4R$, because the loop’s length is $2\pi R$`,
        t`Energy cannot be used inside a loop, because the normal force does work`,
      ],
      answer: 0,
      why: {
        1: t`With $h = 2R$ the cart would arrive at the top with zero speed — but long before that, gravity would pull it off the track, because it would be moving too slowly to follow the circle.`,
        2: 'The length of the track does not matter for energy; what matters is the speed the circle demands at the top.',
        3: 'The normal force is perpendicular to the motion, so it does no work: energy conservation still holds.',
      },
      hints: ['Energy is not the only condition: at the top, the cart must be fast enough to stay on a circle.', t`At the top, gravity alone can supply $mv^2/R$ when $v^2 = gR$. Then $mgh = mg(2R) + \tfrac12 m(gR)$.`],
      teach: 'Energy tells you the speed; Newton’s second law tells you whether that speed is enough to stay on a curved track.',
      explain: t`At the top, the net downward force $mg + N$ must equal $mv^2/R$ with $N \ge 0$, so $v^2 \ge gR$. Energy: $mgh = mg(2R) + \tfrac12 mv^2 \ge 2.5\,mgR$, so $h \ge 2.5R$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-7, 4], y: [-0.3, 5.3], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '',
          alt: 'A track running down a slope into a vertical loop',
          curves: [
            { fn: '0.16*(x + 1)^2', domain: [-6.6, -1], color: 'ink2', width: 3 },
            { fn: '0', domain: [-1, 3], color: 'ink2', width: 3 },
            { param: ['1 + 1.5*sin(t)', '1.5 - 1.5*cos(t)'], t: [0, 6.2832], color: 'ink2', width: 3 },
            { param: ['t', '3'], t: [-1.2, 1], color: 'ink3', width: 1, dash: true },
          ],
          points: [{ x: -6.1, y: 4.162, r: 7, color: 'accent', label: 'release, height h', labelDx: 10 }, { x: 1, y: 3, r: 4, color: 'gold', label: 'top: height 2R', labelDy: -14 }],
        },
        caption: 'The release slope and the loop (radius R), not to scale.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const mu = 3.986004418e14;
        const rp = r.pick([6700, 6800, 7000]), vp = r.pick([9.5, 10.0]), rr = r.pick([12000, 15000, 18000]);
        const v = Math.sqrt((vp * 1000) ** 2 + 2 * mu * (1 / (rr * 1000) - 1 / (rp * 1000)));
        return {
          prompt: t`A spacecraft passes its closest point to Earth, $${thou(rp)}$ km from Earth’s centre, at ${vp.toFixed(1)} km/s. Far from Earth’s surface, gravity’s potential energy is $U = -GMm/r$, so with no thrust and no drag the **specific orbital energy** $\varepsilon = \tfrac12 v^2 - \dfrac{GM}{r}$ (energy per kilogram) stays constant. How fast is the spacecraft moving when it is $${thou(rr)}$ km from Earth’s centre? Use $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and give the answer in km/s.`,
          answer: v / 1000, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((vp * 1000) ** 2 - 2 * mu * (1 / (rr * 1000) - 1 / (rp * 1000))) / 1000, feedback: t`Moving outward, $-GM/r$ rises toward zero, so the kinetic energy must fall: check the sign of $\tfrac{1}{r} - \tfrac{1}{r_p}$.` }, { value: (vp * rp) / rr, feedback: 'That uses v ∝ 1/r, which holds only for the sideways part of the velocity (angular momentum), not for the speed. Use energy.' }],
          hints: [t`$\tfrac12 v^2 - \dfrac{GM}{r} = \tfrac12 v_p^2 - \dfrac{GM}{r_p}$, with distances in metres.`, t`$v = \sqrt{v_p^2 + 2GM\left(\dfrac{1}{r} - \dfrac{1}{r_p}\right)}$.`],
          teach: 'An orbit trades kinetic for potential energy exactly as a roller coaster does: ½v² − GM/r stays constant.',
          explain: t`$v^2 = (${vp * 1000})^2 + 2(3.986\times10^{14})\left(\dfrac{1}{${thou(rr * 1000)}} - \dfrac{1}{${thou(rp * 1000)}}\right)$ m²/s², so $v = ${fmt(v / 1000, 3)}$ km/s. Its specific orbital energy, $${fmt(((vp * 1000) ** 2 / 2 - mu / (rp * 1000)) / 1e6, 3)}$ MJ/kg, is negative: the orbit is bound.`,
          visual: { type: 'graph', params: { x: [-1.5, 4.5], y: [-1.6, 1.6], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '', curves: [{ param: ['1.766 + 2.35*cos(t)', '1.55*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.5, dash: true }], points: [{ x: 0, y: 0, r: 12, color: 'accent', label: 'Earth', labelDy: 20 }, { x: -0.584, y: 0, r: 5, color: 'gold', label: 'closest point', labelDx: -86, labelDy: -12 }, { x: 3.036, y: 1.304, r: 5, color: 'violet', label: 'later', labelDx: 8 }] }, caption: 'The spacecraft’s elliptical orbit around Earth, not to scale.' },
        };
      },
    }),
    num({
      id: 'cp-coaster', difficulty: 2,
      gen(r) {
        const h0 = r.pick([30, 40, 50]), h1 = r.pick([10, 15, 20]);
        const v = Math.sqrt(2 * G * (h0 - h1));
        return {
          prompt: t`A coaster car starts from rest at the top of a ${h0} m drop. Ignoring friction, how fast is it moving when it is ${h1} m above the lowest point of the ride?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(2 * G * h0), feedback: `That is the speed at the very bottom. At ${h1} m up it has dropped only ${h0 - h1} m.` }],
          hints: [t`It has dropped $${h0} - ${h1}$ m.`],
          teach: 'Speed depends on how far below the release level you are: v = √(2g·drop).',
          explain: t`$v = \sqrt{2g(${h0} - ${h1})} = ${s3(v)}$ m/s.`,
          visual: trackPic(`${h0}*exp(-((x - 1)/2)^2) + ${h1}*exp(-((x - 9)/1.6)^2)`, [0, 12], [{ x: 1, label: 'start' }, { x: 9, label: `${h1} m` }], 'The ride in profile; heights above its lowest point.', { y: [-1, h0 * 1.3] }),
        };
      },
    }),
    mcq({
      id: 'cp-two-slides', difficulty: 2,
      prompt: 'Two frictionless water slides start at the same height and end at the same height. One is steep and straight; the other is gentle and winding. Riders start from rest. Which rider is faster at the bottom?',
      choices: ['Neither: they arrive at the same speed', 'The rider on the steep slide', 'The rider on the gentle, winding slide, because she travels farther', 'It depends on the riders’ masses'],
      answer: 0,
      why: {
        1: 'The steep rider gets there sooner, but not faster: both lose the same potential energy.',
        2: 'A longer path does not add energy when there is no friction: gravity’s work depends only on the drop.',
        3: t`Mass cancels: $mgh = \tfrac12 mv^2$ gives $v = \sqrt{2gh}$ for anyone.`,
      },
      hints: ['What does conservation of energy say depends on the path?'],
      teach: 'Without friction, the speed gained depends only on the height dropped — never on the shape of the path.',
      explain: t`Both convert the same $mgh$ into $\tfrac12 mv^2$, so both reach $v = \sqrt{2gh}$. The steep slide gets its rider there first; the winding one takes longer at lower average speed.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 10.5], y: [-0.4, 4.4], aspect: 'wide', xlabel: 'horizontal (m)', ylabel: 'height (m)',
          alt: 'Two slides from the same height: a steep straight one and a gentle winding one',
          curves: [
            { fn: '3.5*(1 - min(max(x/3, 0), 1))', domain: [0, 10], color: 'accent', width: 2.6 },
            { fn: '3.5*(1 - x/10) + 0.4*sin(pi*x/2.5)*x*(10 - x)/25', domain: [0, 10], color: 'warn', width: 2.6, dash: true },
          ],
          points: [{ x: 0, y: 3.5, r: 6, color: 'ink', label: 'start' }, { x: 1.6, y: 1.6, r: 0.01, color: 'accent', label: 'steep' }, { x: 6.2, y: 2.15, r: 0.01, color: 'warn', label: 'winding' }],
        },
        caption: 'The two slides in profile, both dropping 3.5 m from the same start to the same end height. Frictionless.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §8.3 Conservation of energy', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy' },
  ],
});
