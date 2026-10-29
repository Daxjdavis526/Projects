// What a connection does, without the indices — Intuition Mode concept lesson.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { fromPolar } from '../../src/viz/model/gr-coords.js';

const t = String.raw;
const DEG = Math.PI / 180;
const GM_EARTH = 3.986004418e14;      // m³/s²
const R_EARTH = 6.371e6;              // m
const G_ISS = GM_EARTH / (R_EARTH + 400e3) ** 2;    // ≈ 8.7 m/s² at 400 km
const TIDE_ISS = (2 * GM_EARTH * 100) / (R_EARTH + 400e3) ** 3;   // tidal difference over ~100 m, m/s²

const basisPicture = (p, extra = {}, caption) => ({
  type: 'gr-coordinates',
  params: { mode: 'basis', p, readout: false, ...extra },
  caption,
});

export default lesson({
  id: 'gr.S11.i',
  kind: 'concept',
  title: 'What a connection does, without the indices',
  minutes: 4, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`A **connection** is the rule for carrying an arrow from one point to a neighbouring one without turning it. In practice it keeps the books on your grid: at each point it records how much the grid’s own arrows **turn** and **stretch** when you take a small step. In polar coordinates, a step $\Delta\theta$ around the origin turns both grid arrows through exactly that angle — the equation above — while a step outward stretches the distance that one radian of $\theta$ covers, which is $r$. Those turn and stretch rates are the connection’s numbers; the Derivation lessons call them Christoffel symbols.

Three facts make it physics. **The metric fixes it**: once you can measure lengths and angles there is only one way to carry arrows that keeps them unchanged. **It can be made zero at any one point** by choosing coordinates — in a freely falling frame it is, which is the equivalence principle. And for someone standing on the Earth, its main number is Newton’s $g = GM/r^2$: the “gravitational field” is a connection.`,
  equation: t`\Delta\hat r = \Delta\theta\;\hat\theta, \qquad \Delta\hat\theta = -\Delta\theta\;\hat r`,
  symbols: [
    { tex: '\\hat r', text: 'the grid’s unit arrow pointing straight out from the origin' },
    { tex: '\\hat\\theta', text: 'the grid’s unit arrow pointing around the origin, anticlockwise' },
    { tex: '\\Delta\\theta', text: 'a small step around the origin, as an angle in radians' },
    { tex: '\\Delta\\hat r,\\ \\Delta\\hat\\theta', text: t`how much each grid arrow changes over that step: $\hat r$ swings toward $\hat\theta$, and $\hat\theta$ toward $-\hat r$ — both turn through the angle $\Delta\theta$` },
  ],
  why: 'Free fall (step 12) is motion that carries its own velocity arrow forward without turning it — “without turning” as the connection defines it — and curvature (step 13 onward) is what the connection does around a loop.',
  visual: {
    type: 'gr-coordinates',
    title: 'The grid’s own arrows turn and stretch',
    lead: t`At P, blue is the outward arrow $\hat r$ and violet is the step you take when $\theta$ grows by 0.25 rad. The faint copies show the same two arrows elsewhere along P’s ray and around P’s circle. Drag P.`,
    tasks: [
      'Drag P outward: the violet step grows in proportion to r — one radian of θ covers a distance r.',
      'Follow P’s circle: each blue r̂ is turned by exactly the angle between the points.',
      'Read “stretch per unit step outward”, 1/r: a connection number, and not zero — on a perfectly flat plane.',
    ],
    params: { mode: 'basis', p: [2.5, 1.5] },
  },
  practice: [
    num({
      id: 'stretch', difficulty: 1,
      gen(r) {
        const rr = r.pick([2, 3, 4]), dr = r.pick([0.1, 0.2, 0.3]);
        const pct = (100 * dr) / rr;
        return {
          prompt: t`At $r = ${rr}$ m, turning through $\Delta\theta = 0.1$ rad moves you $r\,\Delta\theta = ${nice(0.1 * rr)}$ m. You step outward to $r = ${nice(rr + dr)}$ m. By what percentage has the distance covered by that same $0.1$ rad grown?`,
          answer: pct, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * dr, feedback: 'Compare the growth with the starting length: the fractional stretch is Δr/r.' }],
          hints: [t`At the new radius the step is $${nice(rr + dr)}\times0.1 = ${nice((rr + dr) * 0.1)}$ m.`, t`Fractional growth $= \Delta r/r = ${dr}/${rr}$.`],
          teach: 'Moving outward by Δr stretches the around-step by the fraction Δr/r — a stretch rate of 1/r, one of the polar grid’s connection numbers.',
          explain: t`From ${nice(0.1 * rr)} m to ${nice(0.1 * (rr + dr))} m: a growth of $${dr}/${rr} = ${fmt(pct, 3)}\%$. The rate, $1/r = ${nice(1 / rr)}$ per metre, is the connection coefficient that records it.`,
          visual: basisPicture(fromPolar(rr, 25 * DEG), { ring: false }, 'Along P’s ray the violet steps (each for 0.25 rad of θ) grow in proportion to r.'),
        };
      },
    }),
    num({
      id: 'turn', difficulty: 1,
      gen(r) {
        const d = r.pick([15, 25, 40, 60]), rr = r.pick([2, 3, 7]);
        return {
          prompt: t`You walk ${d}° around the origin along the circle $r = ${rr}$ m. Through what angle does the grid’s outward arrow $\hat r$ turn between your start and your finish?`,
          answer: d, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: d * rr, feedback: 'The turn does not depend on the radius: r̂ always points straight away from the origin.' }, { value: 0, feedback: 'r̂ points away from the origin, so at a different angle it points a different way.' }],
          hints: [t`$\hat r$ at polar angle $\theta$ points at angle $\theta$.`],
          teach: 'Stepping around by Δθ turns the polar grid’s arrows by Δθ, at any radius.',
          explain: t`$\hat r$ points along the angle $\theta$ itself, so it turns through ${d}°, whatever the radius. In the equation, $\Delta\hat r = \Delta\theta\,\hat\theta$.`,
          visual: basisPicture(fromPolar(rr > 4.5 ? 4 : rr, 20 * DEG), { ray: false }, 'Around P’s circle every outward arrow is turned by exactly the angle between the points.'),
        };
      },
    }),
    mcq({
      id: 'flat', difficulty: 2,
      prompt: 'Polar coordinates on a flat plane have connection numbers that are not zero (such as the stretch rate 1/r). Does that mean the plane is curved?',
      choices: [
        'No — curved grid lines alone produce them; curvature is when carrying an arrow around a loop changes it',
        'Yes — any non-zero connection number means curvature',
        'Yes, but only near the origin, where 1/r is large',
        'No — connection numbers are always zero on a flat plane',
      ],
      answer: 0,
      why: { 1: 'Switch to Cartesian coordinates and every connection number on the plane is zero. Curvature cannot be removed that way.', 2: 'The plane is just as flat near the origin; 1/r is large because the polar grid’s lines crowd together there.', 3: 'They are zero only in Cartesian coordinates; the polar grid gives non-zero ones on the same flat plane.' },
      hints: ['What are the connection numbers of the same plane in Cartesian coordinates?'],
      teach: 'Non-zero connection numbers can come from the coordinates alone; curvature is what survives every change of coordinates.',
      explain: 'On a flat plane, Cartesian coordinates have all connection numbers zero and polar ones do not — same plane. Curvature is different: it shows up as arrows turning when carried around loops, in every coordinate system.',
      visual: basisPicture([2.5, 1.5], {}, 'A flat plane, a curved grid: the grid arrows turn and stretch from point to point, though nothing about the plane changes.'),
    }),
    mcq({
      id: 'free-fall', difficulty: 2,
      prompt: 'You use coordinates that fall freely with you — a freely falling laboratory. What happens to the connection at your location?',
      choices: [
        'It is zero there — no gravitational field in your lab — though over a larger region tides remain',
        'It doubles, because you are accelerating',
        'Nothing: gravity is real, so the connection cannot change',
        'It becomes zero everywhere, so spacetime is flat',
      ],
      answer: 0,
      why: { 1: 'A freely falling observer feels no acceleration; their lab has no “gravity” at their location.', 2: 'The connection is not a tensor: it depends on the coordinates, and can be made zero at any point.', 3: 'Only at one point (or along one path). If spacetime is curved, tides show up across the lab and cannot be removed.' },
      hints: ['Astronauts in orbit float: in their own frame, what is the gravitational field?'],
      teach: 'The connection can be made zero at any single point by falling freely — the equivalence principle in mathematical form — but curvature (tides) cannot.',
      explain: 'In freely falling coordinates the connection vanishes at your location: locally, gravity disappears, as Einstein’s equivalence principle says. What cannot be removed is how the connection varies from place to place — the tidal stretching that is curvature.',
      visual: { type: 'gr-elevator', params: { mode: 'falling', tides: true }, caption: 'A box falling freely near the Earth: inside it, released balls float — no gravitational field there. Over a larger box the balls drift into a stretched diamond: tides, the curvature no choice of frame removes (drift exaggerated).' },
    }),
    num({
      id: 'sphere-drift', difficulty: 3,
      gen(r) {
        const lat = r.pick([30, 50, 60]), dphi = r.pick([20, 40, 90]);
        const drift = dphi * Math.sin(lat * DEG);
        return {
          prompt: t`On a sphere, the connection says how a never-turned arrow drifts relative to the local north as you travel. Travelling due east along latitude $\lambda$, it drifts clockwise by $\sin\lambda$ degrees for every degree of longitude. You carry an arrow that starts pointing north ${dphi}° east along the ${lat}°N circle. How many degrees clockwise of north does it point at the end?`,
          answer: drift, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: dphi * Math.cos(lat * DEG), feedback: 'The drift rate is sin λ, not cos λ: zero at the equator, where the circle is a straight (great-circle) path.' }, { value: 0, feedback: 'A circle of latitude away from the equator is not a straight path on the sphere, so the arrow drifts relative to north.' }],
          hints: [t`Drift $= \Delta\phi\times\sin\lambda = ${dphi}^\circ\times\sin ${lat}^\circ$.`, t`$\sin ${lat}^\circ = ${fmt(Math.sin(lat * DEG), 4)}$.`],
          teach: 'The sphere’s connection makes a carried arrow drift relative to north at sin λ degrees per degree of longitude — the Foucault pendulum’s rate.',
          explain: t`$${dphi}^\circ\times\sin ${lat}^\circ = ${fmt(drift, 3)}^\circ$ clockwise from north. Once around (360°) that is $360^\circ\sin\lambda$: a Foucault pendulum at latitude ${lat}° turns by ${fmt(360 * Math.sin(lat * DEG), 3)}° per sidereal day for exactly this reason.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat, progress: dphi / 360, readout: false }, caption: 'Red: the never-turned arrow, carried east along the circle of latitude from the black arrow, which points north.' },
        };
      },
    }),
    mcq({
      id: 'fixed-by-metric', difficulty: 2,
      prompt: 'Once you know the metric — how to measure lengths and angles everywhere — how much freedom is left in choosing the connection?',
      choices: [
        'None: insisting that carried arrows keep their lengths and mutual angles, without twisting, fixes it completely',
        'Complete freedom: any rule for carrying arrows will do',
        'It has to be measured separately, by experiment',
        'None, because the connection and the metric are the same thing',
      ],
      answer: 0,
      why: { 1: 'Other rules exist mathematically, but they would change arrows’ lengths or twist them as they are carried. General relativity uses the one built from the metric.', 2: 'Experiments test general relativity, and its connection is computed from the metric, not measured separately.', 3: 'They are different objects: the metric measures; the connection carries. The second is built from the first and its rates of change.' },
      hints: ['What would a “fair” rule for carrying a ruler-length arrow have to preserve?'],
      teach: 'General relativity’s connection is built entirely from the metric: the unique rule that keeps lengths and angles and does not twist.',
      explain: 'Requiring that a carried arrow keep its length (and its angles with other carried arrows), and that the rule not twist, leaves exactly one connection — the Levi-Civita connection, whose numbers are the Christoffel symbols computed from the metric’s rates of change.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-iss', difficulty: 2, transfer: true,
      prompt: t`At the International Space Station’s height, Newton’s $g = GM/r^2$ is still about ${fmt(G_ISS, 2)} m/s², yet the astronauts float. In the language of connections, which statement is right?`,
      choices: [
        t`In coordinates that fall with the station the connection is zero where they are; the ${fmt(G_ISS, 2)} m/s² is the connection in coordinates fixed to the ground`,
        'The connection is zero at the ISS because Earth’s gravity does not reach that high',
        t`The connection is ${fmt(G_ISS, 2)} m/s² in every coordinate system, so the astronauts only feel weightless`,
        'The connection is negative in orbit, cancelling gravity',
      ],
      answer: 0,
      why: { 1: 'Gravity at that height is about 89% of its value at the ground. What changes is the coordinates, not the reach of gravity.', 2: 'The connection depends on the coordinates; in the station’s falling frame it really is zero at their location.', 3: 'No sign flip: falling freely makes it zero, not negative.' },
      hints: ['Which coordinates would the astronauts naturally use, and do they fall?'],
      teach: 'The gravitational field g is a connection: it depends on the coordinates, and vanishes in a freely falling frame.',
      explain: t`For coordinates fixed to the ground, the connection’s main number at the ISS’s height is $GM/r^2 \approx ${fmt(G_ISS, 2)}$ m/s². The station and everything in it fall freely, and in coordinates falling with them the connection vanishes at their location — they feel no gravity. What remains are tides: over the station’s roughly 100 m length, differences of about $${fmt(TIDE_ISS * 1e4, 2)}\times10^{-4}$ m/s².`,
      visual: {
        type: 'graph',
        params: { x: [0, 1000], y: [0, 10.5], xlabel: 'height above the ground (km)', ylabel: 'GM/r² (m/s²)', constants: { gm: GM_EARTH, re: R_EARTH }, curves: [{ fn: 'gm/(re + 1000*x)^2', color: 'accent' }], points: [{ x: 400, y: G_ISS, color: 'gold', label: 'ISS' }] },
        caption: 'Newton’s g = GM/r² against height: in orbit it is still most of its value at the ground.',
      },
    }),
    num({
      id: 'cp-step', difficulty: 2,
      gen(r) {
        const [r1, r2] = r.pick([[3, 4.5], [2, 5], [4, 6], [5, 2.5]]);
        return {
          prompt: t`At $r = ${r1}$ m, turning through a small angle $\Delta\theta$ covers 0.6 m. How far does the same $\Delta\theta$ cover at $r = ${r2}$ m?`,
          answer: (0.6 * r2) / r1, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 0.6, feedback: 'The around-step is r Δθ: it grows in proportion to r.' }, { value: (0.6 * r1) / r2, feedback: 'Upside down: a larger radius gives a longer step.' }],
          hints: [t`$\Delta\theta = 0.6/${r1}$ rad.`, t`New step $= ${r2}\times\Delta\theta$.`],
          teach: 'The distance covered by a fixed turn Δθ is r Δθ: the polar grid stretches outward.',
          explain: t`$\Delta\theta = 0.6/${r1} = ${fmt(0.6 / r1, 3)}$ rad, so at $r = ${r2}$ m it covers $${r2}\times${fmt(0.6 / r1, 3)} = ${fmt((0.6 * r2) / r1, 3)}$ m.`,
          visual: basisPicture(fromPolar(Math.min(r1, 4.4), 30 * DEG), { ring: false }, 'Along a ray, the step for a fixed turn grows in proportion to r.'),
        };
      },
    }),
    mcq({
      id: 'cp-curvature', difficulty: 2,
      prompt: 'Which of these shows that a surface is curved, rather than just covered by a curved grid?',
      choices: [
        'An arrow carried around a small loop without turning comes back turned',
        'Some connection numbers are not zero',
        'A constant arrow has components that change from point to point',
        'The grid lines are curves',
      ],
      answer: 0,
      why: { 1: 'Polar coordinates on a flat plane have non-zero connection numbers.', 2: 'That happens on a flat plane with a curved grid (step 10).', 3: 'Curved grid lines can be drawn on a flat sheet.' },
      hints: ['Which of these would still be true after switching to a different grid?'],
      teach: 'Curvature is what no change of grid can remove: arrows carried around loops come back turned.',
      explain: 'Connection numbers, components and grid shapes all change with the grid. The turning of an arrow carried around a closed loop does not — that is curvature, the subject of step 13 and of the Riemann tensor beyond it.',
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, colatSlider: false, progress: 1, readout: false }, caption: 'On a sphere, an arrow carried around a loop without turning comes back turned.' },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, §3.2 (connections, Christoffel symbols)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 20–21', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
