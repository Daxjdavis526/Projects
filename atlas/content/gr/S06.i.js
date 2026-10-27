// Gravity as geometry — Intuition Mode. Near Earth, gravity is almost entirely
// the curvature of time: clocks higher up run fast by gh/c², and a free object
// takes the worldline on which its own clock ticks the most. Curved space
// matters only in proportion to (v/c)². Tides are the curvature no falling
// frame removes. Two teaching models, labelled as such: walkers on a sphere
// (useful) and the rubber sheet (misleading).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { C, g0, GM_EARTH, R_EARTH, M_SUN, G, DAY, YEAR, sci, round } from './_fasttrack.js';

const t = String.raw;

const v2 = (v) => (v / C) ** 2;
const WARP = GM_EARTH / (R_EARTH * C * C);           // Φ/c² at Earth's surface
const tidal = (M, L, r) => (2 * G * M * L) / r ** 3;  // head-to-foot difference in gravity
const M_EARTH_KG = GM_EARTH / G;
const SPEEDS = [['A ball thrown at 10 m/s', 10], ['The ISS (7.66 km/s)', 7660], ['Earth around the Sun (29.8 km/s)', 29780]];
const LOG_C = Math.log10(C);

export default lesson({
  id: 'gr.S06.i',
  title: 'Gravity is mostly time running at different rates',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der', 'model'],
  intro: t`Near Earth, gravity is mostly a difference in the **rate of time**. A clock one metre higher runs fast by about one part in $10^{16}$ — this has been measured — and that gradient alone makes a thrown ball come back down: a free object follows the worldline along which **its own clock records the most time**. Climbing buys faster-ticking height, but moving costs time; the ball's familiar arc is the best compromise. In weak gravity, a clock at height $h$ moving at speed $v$ ticks, compared with a clock resting on the ground, at the rate above.

> The rubber-sheet picture — a heavy ball denting a stretched sheet, marbles rolling toward it — is a teaching model, and a misleading one. Its marbles roll only because Earth's gravity pulls them down the dent, so it uses gravity to explain gravity; and it shows only curved space, while falling apples come almost entirely from curved time.`,
  equation: t`\frac{d\tau}{dt} \approx 1 + \frac{gh}{c^2} - \frac{v^2}{2c^2}`,
  symbols: [
    { tex: 'd\\tau', text: 'proper time: what the moving clock itself records during a short interval' },
    { tex: 'dt', text: 'the time a clock resting on the ground records during the same interval' },
    { tex: 'g', text: 'the strength of gravity, 9.81 m/s² at Earth’s surface' },
    { tex: 'h', text: 'the clock’s height above the ground clock, in m: higher clocks run **fast**' },
    { tex: 'v', text: 'the clock’s speed, in m/s: moving clocks run **slow** (special relativity)' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s; the $c^2$ makes both corrections tiny' },
  ],
  why: 'This is how general relativity describes gravity with no force at all: free fall is the most-aging path through a spacetime whose clock rates vary from place to place. Near a black hole those rates differ enormously.',
  visual: {
    type: 'gr-timewarp',
    title: 'Throw a clock',
    lead: t`Time runs left to right. The blue clock stays on the ground; the violet clock is thrown up at A and caught at B. Drag the violet apex: up high its clock ticks faster (a **height bonus**), but to get there and back in time it must move faster (a **speed penalty**). The aging meter on the right adds them up.`,
    tasks: ['Raise the apex from zero: at first the height bonus wins and the violet clock gains.', 'Find the top of the aging meter: the violet path lands exactly on the gold free-fall parabola.', 'Keep going higher: the speed penalty takes over, and the gain shrinks and even goes negative.'],
    params: { T: 2, H: 2.5, shape: 'arc', shapes: false },
  },
  example: {
    prompt: t`Weak gravity curves spacetime in two ways: clocks tick at different rates in different places (curved **time**), and rulers are very slightly stretched (curved **space**). Near Earth both distortions are about $GM/(Rc^2) = ${sci(WARP, 2)}$. Which one makes things fall? Compare their effects on a thrown ball, the International Space Station, Earth in its orbit, and light.`,
    steps: [
      { label: 'Who feels which', text: t`Curved time acts on everything, even an object at rest — it is what makes a dropped ball start to fall, and on its own it gives Newton's law of gravity. Curved space affects only an object that moves through space, and its effect on the path is smaller than curved time's by a factor of about $(v/c)^2$.` },
      ...SPEEDS.map(([what, v]) => ({ label: what.replace(/ \(.*\)$/, ''), text: t`${what}: $(v/c)^2 = (${v}/2.998\times10^{8})^2 = ${sci(v2(v), 2)}$.` })),
      { label: 'Light', text: t`For light $v = c$, so $(v/c)^2 = 1$: curved space bends light **as much as** curved time does. That is why full general relativity predicts twice the bending that the equivalence principle alone gives.` },
      { label: 'Conclusion', text: t`For apples, satellites and planets, gravity is the curvature of time, to better than a part in a hundred million. The “dent in space” of the rubber sheet is the part that hardly matters for them.` },
    ],
    answer: t`$(v/c)^2$ is $${sci(v2(10), 2)}$ for the ball, $${sci(v2(7660), 2)}$ for the ISS and $${sci(v2(29780), 2)}$ for Earth: all of them fall because of curved time. Only light feels curved space as strongly.`,
  },
  practice: [
    mcq({
      id: 'apple', difficulty: 1,
      prompt: 'According to general relativity, what mainly makes a dropped apple fall?',
      choices: [
        'Clocks tick at different rates at different heights, and the apple’s free worldline is the one along which its own clock records the most time',
        'Space around Earth is curved like a dip in a rubber sheet, and the apple rolls down into it',
        'A force from Earth pulls on the apple’s mass',
        'The tidal stretching between the apple’s top and bottom',
      ],
      answer: 0,
      why: {
        1: 'Curved space affects a slow apple only at the level of (v/c)² ≈ 10⁻¹⁵ — and the sheet’s marbles roll only because ordinary gravity pulls them, which explains nothing.',
        2: 'That is Newton’s picture, and it predicts the same fall here — but in general relativity there is no gravitational force: a falling apple feels nothing, as the equivalence principle says.',
        3: 'Tides are real curvature, but they only stretch the apple, by about a millionth of g; uniform gravity has no tide at all, and apples still fall.',
      },
      hints: ['Which part of spacetime’s geometry acts on an object even when it is at rest?'],
      teach: 'Near Earth, almost all of gravity is the curvature of time: free objects follow the path along which their clocks tick the most.',
      explain: 'Clocks run fast by gh/c² with height. Of all the worldlines from release to landing, the free-fall one gives the apple’s own clock the most time; that path is the falling one. Curved space contributes only at the level of (v/c)².',
    }),
    num({
      id: 'v-over-c', difficulty: 2,
      gen(r) {
        const [what, v] = r.pick([['the International Space Station, 7.66 km/s', 7660], ['Voyager 1 leaving the Solar System, 17.0 km/s', 17000], ['Mercury in its orbit, 47.4 km/s', 47360], ['the Parker Solar Probe at its fastest, 192 km/s', 191700]]);
        const x = v2(v);
        return {
          prompt: t`How much does curved space matter, compared with curved time, for the path of ${what}? Compute $(v/c)^2$.`,
          answer: x, tol: { rel: 0.01 },
          errors: [{ value: v / C, feedback: 'Square it: the space part matters in proportion to (v/c)².' }, { value: (v / 1000 / C) ** 2, feedback: 'Convert km/s to m/s before dividing by c = 2.998×10⁸ m/s.' }],
          hints: [t`Convert to m/s, divide by $c = 2.998\times10^{8}$ m/s, then square.`],
          teach: 'Curved space changes the path of an object moving at speed v by a fraction about (v/c)² of what curved time does.',
          explain: t`$(v/c)^2 = (${v}/2.998\times10^{8})^2 = ${sci(x)}$. Even for the Parker Solar Probe, the fastest spacecraft ever built, $(v/c)^2$ is only $${sci(v2(191700), 2)}$: its path is shaped almost entirely by curved time.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 9], y: [-18, 1.5], xlabel: 'log₁₀(speed in m/s)', ylabel: 'log₁₀((v/c)²)',
              curves: [{ fn: `2(x - ${round(LOG_C, 6)})`, color: 'accent' }],
              points: [
                { x: 1, y: round(Math.log10(v2(10)), 4), color: 'good', label: 'thrown ball' },
                { x: round(Math.log10(29780), 4), y: round(Math.log10(v2(29780)), 4), color: 'teal', label: 'Earth' },
                { x: round(LOG_C, 4), y: 0, color: 'gold', label: 'light' },
                { x: round(Math.log10(v), 4), y: round(Math.log10(x), 4), color: 'violet', label: 'this one' },
              ],
            },
            caption: 'Both axes count powers of ten. Only near the speed of light does curved space matter as much as curved time.',
          },
        };
      },
    }),
    num({
      id: 'lifetime', difficulty: 2,
      gen(r) {
        const h = r.pick([1.5, 1.6, 1.7, 1.8, 1.9]), yrs = r.pick([70, 80, 90]);
        const f = (g0 * h) / (C * C), ns = f * yrs * YEAR * 1e9;
        return {
          prompt: t`Your head is ${h} m above your feet. Over ${yrs} years, how many nanoseconds more does your head age than your feet? (A year is $3.156\times10^{7}$ s.)`,
          answer: ns, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: f * yrs * YEAR, feedback: 'That is in seconds. Convert to nanoseconds: multiply by 10⁹.' }, { value: f * DAY * 1e9, feedback: 'That is per day. Multiply by the number of days in the whole lifetime.' }],
          hints: [t`The head runs fast by the fraction $gh/c^2$.`, t`Multiply that fraction by ${yrs} years in seconds, $${yrs}\times3.156\times10^{7}$ s, then convert to ns.`],
          teach: 'A height difference h makes clocks differ in rate by gh/c², which adds up — slowly — over time.',
          explain: t`$gh/c^2 = ${sci(f)}$; over $${sci(yrs * YEAR)}$ s that is $${sci(ns)}$ ns — less than a microsecond in a lifetime, but real: optical clocks detect height differences of centimetres.`,
        };
      },
    }),
    num({
      id: 'walkers', difficulty: 2,
      gen(r) {
        const D = r.pick([1, 2, 5, 10]), lat = r.pick([30, 45, 60, 75]);
        const d = D * Math.cos((lat * Math.PI) / 180), L = round((lat * Math.PI) / 180, 5);
        return {
          prompt: t`**A teaching model.** Two walkers stand ${D} km apart on the equator and both walk due north, never turning. How far apart are they when they reach latitude ${lat}°N?`,
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [...(lat === 45 ? [] : [{ value: D * Math.sin((lat * Math.PI) / 180), feedback: 'Use the cosine: at the equator (0°) the separation must still be the full distance.' }]), { value: D, feedback: 'They do not stay parallel: lines of longitude converge toward the pole.' }],
          hints: ['Walking due north, each follows a line of longitude — a great circle, the straightest possible path on a sphere.', t`The distance between two lines of longitude shrinks with latitude as $\cos(\text{latitude})$.`],
          teach: 'On a curved surface, straight paths that start parallel converge with no force acting — a model of how curvature mimics a force.',
          explain: t`Separation $= ${D}\cos ${lat}^\circ = ${sci(d)}$ km. Neither walker turned and nothing pushed them together: the geometry did it. In spacetime the same happens to falling objects — but the real curvature is mostly in **time**, which no picture of a curved surface shows.`,
          visual: {
            type: 'surface3d',
            params: {
              surface: ['2cos(v)cos(u)', '2cos(v)sin(u)', '2sin(v)'], domain: [[0, 6.2832], [-1.5708, 1.5708]], n: 30, axes: false, alpha: 0.5,
              yaw: 0.2, pitch: 0.6, dist: 6.5,
              curves: [
                { param: ['2.02cos(t)', '0', '2.02sin(t)'], t: [L, 1.5708], color: 'ink3', width: 1.2 },
                { param: ['2.02cos(t)cos(0.4)', '2.02cos(t)sin(0.4)', '2.02sin(t)'], t: [L, 1.5708], color: 'ink3', width: 1.2 },
                { param: ['2.03cos(t)', '0', '2.03sin(t)'], t: [0, L], color: 'gold', width: 3.2 },
                { param: ['2.03cos(t)cos(0.4)', '2.03cos(t)sin(0.4)', '2.03sin(t)'], t: [0, L], color: 'accent', width: 3.2 },
                { param: ['2.03cos(0.4t)', '2.03sin(0.4t)', '0'], t: [0, 1], color: 'bad', width: 2.4 },
              ],
              caption: 'Teaching model, not to scale: two straight (great-circle) paths heading north converge. Drag to rotate.',
            },
          },
        };
      },
    }),
    multi({
      id: 'rubber-sheet', difficulty: 2,
      prompt: '**A teaching model under the microscope.** Which of these are real flaws of the rubber-sheet picture of gravity? Select every one that applies.',
      choices: [
        'It uses gravity to explain gravity: the marbles roll into the dent only because Earth pulls them down',
        'It shows only curved space and leaves out time, which carries almost all of everyday gravity',
        'Marbles on a real sheet follow the wrong orbit shapes and speeds',
        'It shows the distortion fading with distance from the mass',
        'It suggests gravity is passed on by the local shape of something, not by instant action at a distance',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'That part is right: the effects of a mass do fade with distance.',
        4: 'That part is right too: in general relativity gravity is local geometry, not instant action at a distance.',
      },
      hints: ['Ask what makes the marble move in the model — and what the model leaves out entirely.', 'Two options describe things the sheet gets right.'],
      teach: 'The rubber sheet gets the slogan right but the mechanism wrong: it relies on gravity to work, and it omits curved time.',
      explain: 'The sheet’s marbles need real gravity to roll, so the model is circular; it has no time in it at all, though curved time causes the fall of apples; and measured marble orbits on spandex sheets do not match planetary orbits. What it gets right: effects fade with distance and are carried locally by geometry.',
    }),
    num({
      id: 'tidal', difficulty: 3,
      gen(r) {
        const L = r.pick([1.6, 1.8, 2.0]);
        const [where, rr] = r.pick([['standing on the ground', R_EARTH], ['floating in the ISS, 400 km up', R_EARTH + 400e3], ['in a GPS-height orbit, 20 200 km up', R_EARTH + 20200e3]]);
        const a = tidal(M_EARTH_KG, L, rr);
        return {
          prompt: t`An astronaut ${L} m tall is ${where}. How much stronger is Earth's gravity at their feet than at their head? Use $\Delta g = 2GML/r^3$ with $GM_\oplus = ${sci(GM_EARTH, 4)}\ \text{m}^3/\text{s}^2$ and $r$ measured from Earth's centre ($R_\oplus = 6371$ km).`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'Keep the factor 2: along the line to Earth the stretch is 2GML/r³.' }, ...(rr > R_EARTH ? [{ value: (2 * GM_EARTH * L) / (rr - R_EARTH) ** 3, feedback: 'Measure r from Earth’s centre, not from the ground.' }] : [])],
          hints: [t`$r$ is the distance from Earth's centre: $6371$ km plus the altitude, in metres.`, t`$\Delta g = 2GML/r^3 = 2(${sci(GM_EARTH, 4)})(${L})/r^3$.`],
          teach: 'Tides — differences in gravity across a body — are the part of gravity that free fall cannot remove: they are spacetime curvature you can feel.',
          explain: t`$r = ${sci(rr, 4)}$ m, so $\Delta g = 2(${sci(GM_EARTH, 4)})(${L})/(${sci(rr, 4)})^3 = ${sci(a)}\ \text{m/s}^2$ — less than a millionth of $g$. Unlike $g$ itself, no falling frame removes it.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-tides-real', difficulty: 2,
      prompt: 'Which of these can no choice of freely falling frame remove?',
      choices: [
        'The stretching of a long rod falling toward Earth along its length',
        'The weight you feel standing on the ground',
        'The downward acceleration of a dropped ball',
        'The slight downward bending of a laser beam crossing a lift',
      ],
      answer: 0,
      why: {
        1: 'Fall freely and the weight vanishes — that is the equivalence principle.',
        2: 'Fall with the ball and it floats beside you.',
        3: 'Inside a freely falling lift the beam goes straight.',
      },
      hints: ['In a small falling box, uniform gravity disappears. What is left when gravity differs from place to place?'],
      teach: 'Uniform gravity can be removed by falling; tides — differences in gravity — cannot, and they are the signature of spacetime curvature.',
      explain: 'The rod’s near end is pulled harder than its far end, so even in free fall it is stretched. That tidal stretch is curvature; everything else in the list disappears in a falling frame.',
    }),
    num({
      id: 'cp-mountain', difficulty: 2,
      gen(r) {
        const [peak, h] = r.pick([['Mount Everest', 8849], ['K2', 8611], ['Denali', 6190], ['Kilimanjaro', 5895]]);
        const ns = ((g0 * h) / (C * C)) * DAY * 1e9;
        return {
          prompt: t`A clock is carried to the summit of ${peak}, ${h.toLocaleString('en-US')} m above sea level. How many nanoseconds per day does it gain over an identical clock at sea level? Use $g = 9.81\ \text{m/s}^2$.`,
          answer: ns, units: 'ns', tol: { rel: 0.01 },
          hints: [t`The rate difference is $gh/c^2$; multiply by 86 400 s and convert to ns.`],
          teach: 'A clock h higher gains gh/c² of time — about 9.4 ns per day per kilometre at Earth’s surface.',
          explain: t`$gh/c^2 = ${sci((g0 * h) / (C * C))}$; per day that is $${sci(ns)}$ ns. (Using $g = 9.81$ throughout ignores that gravity weakens slightly with height — a 0.3% effect here.)`,
        };
      },
    }),
    num({
      id: 'cp-bh-tides', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([10, 20, 30]), rk = r.pick([1000, 2000, 5000]);
        const a = tidal(M * M_SUN, 2, rk * 1e3);
        return {
          prompt: t`An astronaut 2 m tall falls feet first toward a black hole of ${M} solar masses ($M_\odot = 1.989\times10^{30}$ kg). At ${rk.toLocaleString('en-US')} km from its centre, how much stronger is the pull on their feet than on their head? Use $\Delta g = 2GML/r^3$ with $G = 6.674\times10^{-11}$ SI.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / 2, feedback: 'Keep the factor 2 for the stretch along the line to the mass.' }, { value: tidal(M * M_SUN, 2, rk), feedback: 'Convert the distance to metres before cubing.' }],
          hints: [t`$M = ${M}\times1.989\times10^{30}$ kg and $r = ${rk}\times10^{3}$ m.`, t`$\Delta g = 2(6.674\times10^{-11})(${sci(M * M_SUN)})(2)/(${sci(rk * 1e3)})^3$.`],
          teach: 'Tidal stretching grows as M/r³, so near a stellar-mass black hole it becomes deadly — the same curvature that only nudges you on Earth.',
          explain: t`$\Delta g = ${sci(a)}\ \text{m/s}^2$, about ${Math.round(a / g0).toLocaleString('en-US')} times $g$${a > 30 * g0 ? ' — enough to pull a body apart (“spaghettification”)' : ' — a dangerous stretch, and it grows fast closer in'}. For a feet-first fall toward a non-spinning black hole, general relativity gives exactly this $2GML/r^3$, all the way to the horizon.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Pössel, “Relatively complicated? Using models to teach general relativity at different levels” (2018)', url: 'https://arxiv.org/abs/1812.11589' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online): the principle of maximal aging', url: 'https://www.eftaylor.com/exploringblackholes' },
    { label: 'Chou et al., “Optical clocks and relativity”, Science 329, 1630 (2010)', url: 'https://doi.org/10.1126/science.1192720' },
  ],
});
