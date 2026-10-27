// Coordinates are labels, not reality — Intuition Mode concept lesson.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { fromPolar } from '../../src/viz/model/gr-coords.js';

const t = String.raw;

const DEG = Math.PI / 180;
const C = 299792458;
const GM_SUN = 1.32712440018e20;
// tidal stretch across a 2 m body falling feet-first through the horizon of Sagittarius A*: for a
// radially falling observer GR gives exactly 2GML/r³, here at r = 2GM/c²
const GM_SGRA = 4.30e6 * GM_SUN;
const TIDE_SGRA = (2 * GM_SGRA * 2) / (2 * GM_SGRA / C ** 2) ** 3;

// radial free fall from rest far away (units r_s = 2GM/c² = 1, times in r_s/c): the faller’s own
// time τ(r) and Schwarzschild’s coordinate time t(r), both zero at r = 4 r_s. dτ/dr = −√r and
// dt/dr = −r^{3/2}/(r − 1); t grows without limit as r → 1 while τ stays finite.
const F_T = (r) => -(2 / 3) * r ** 1.5 - 2 * Math.sqrt(r) + Math.log((Math.sqrt(r) + 1) / Math.abs(Math.sqrt(r) - 1));
const T0 = F_T(4);
// a picture of a segment between two points on the polar grid, without a readout
const segmentPicture = (p, q, caption) => ({
  type: 'gr-coordinates',
  params: { mode: 'measure', grid: 'polar', gridChoice: false, shape: 'segment', shapeChoice: false, ends: [p, q], range: Math.max(5, Math.ceil(Math.max(...[...p, ...q].map(Math.abs)) + 1)), readout: false },
  caption,
});

export default lesson({
  id: 'gr.S07.i',
  kind: 'concept',
  title: 'Coordinates are labels, not reality',
  minutes: 4, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`A coordinate system is a way of putting labels on places and events, like house numbers on a street. The same point can be $(x, y) = (3, 4)$ in one system and $(r, \theta) = (5, ${fmt(Math.atan2(4, 3) / DEG, 3)}^\circ)$ in another; relabelling changes nothing physical. **What is physical is what every labelling agrees on**: the distance between two points (each system computing it with its own metric), the time a clock records, whether two worldlines meet, how a falling body is stretched.

A coordinate system can also break down somewhere with nothing wrong there. At the origin of polar coordinates $\theta$ has no value at all, yet the plane is perfectly smooth. General relativity is full of such places — the most famous is the radius $r = 2GM/c^2$ in Schwarzschild coordinates, the standard labels for a black hole.`,
  equation: t`x = r\cos\theta, \qquad y = r\sin\theta`,
  symbols: [
    { tex: 'x,\\ y', text: 'Cartesian labels: distances along two perpendicular axes, in metres' },
    { tex: 'r', text: 'polar label: the distance from the origin, in metres' },
    { tex: '\\theta', text: t`polar label: the angle from the $x$ axis, in degrees or radians — undefined at the origin itself` },
  ],
  why: 'Black holes, the expanding universe and gravitational waves are all described in cleverly chosen coordinates; knowing which features belong to the labels and which to the world is how you avoid seeing walls where there are none.',
  visual: {
    type: 'gr-coordinates',
    title: 'The same circle, two sets of labels',
    lead: t`The first panel is the plane with a polar grid drawn on it; the second draws the same circle in the polar labels, $\theta$ across and $r$ up. Drag the circle.`,
    tasks: [
      'Drag the circle until it surrounds the origin: in the chart it becomes a wave running across every θ — the plane did not change, only its picture in these labels.',
      'The red bottom edge of the chart, r = 0, is a single point of the plane stretched into a whole line: a feature of the labels, not of the plane.',
      'Read the lengths: Pythagoras in (x, y) and the polar metric always agree.',
    ],
    params: { mode: 'measure', grid: 'polar', gridChoice: false, shape: 'circle', shapeChoice: false, radiusSlider: true, centre: [1.8, 0.6], radius: 1.4 },
    caption: t`Two pictures of one circle on one flat plane. Lengths come from each system’s own metric: $ds^2 = dx^2 + dy^2$ or $ds^2 = dr^2 + r^2\,d\theta^2$.`,
  },
  practice: [
    num({
      id: 'relabel', difficulty: 1,
      gen(r) {
        const [x, y, rr] = r.pick([[3, 4, 5], [5, 12, 13], [-6, 8, 10], [8, -15, 17], [-7, -24, 25], [12, 5, 13]]);
        return {
          prompt: t`A point has Cartesian labels $(x, y) = (${x}, ${y})$, in metres. What is its polar label $r$, its distance from the origin?`,
          answer: rr, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.abs(x) + Math.abs(y), feedback: 'Distance from the origin is Pythagoras: r = √(x² + y²).' }],
          hints: [t`$r = \sqrt{x^2 + y^2}$.`],
          teach: 'The same point carries different labels in different coordinate systems; the conversion is x = r cos θ, y = r sin θ.',
          explain: t`$r = \sqrt{${x}^2 + ${y}^2} = ${rr}$ m, and $\theta = ${fmt(Math.atan2(y, x) / DEG, 4)}^\circ$. Same point, new labels.`,
          visual: segmentPicture([0, 0], [x, y], 'The segment from the origin to the point: its length is the label r.'),
        };
      },
    }),
    multi({
      id: 'physical', difficulty: 2,
      prompt: 'Which of these are physical — the same whatever coordinates you use? Select every one.',
      choices: [
        'The distance between two points, each system computing it with its own metric',
        'The time a clock records between two events on its worldline',
        'Whether two worldlines cross',
        t`The value of $\theta$ at a point`,
        t`The coordinate time $t$ assigned to an event`,
        t`The components of an arrow, such as $(1, 0)$`,
      ],
      answer: [0, 1, 2],
      why: { 3: 'Rotate the axes and θ changes; it is a label.', 4: 'Coordinate time is a label too; only clocks’ readings (proper times) are physical.', 5: 'Components depend on the grid you measure them against — step 10 makes much of this.' },
      hints: ['Ask: would rotating the axes, or switching to polar labels, change it?'],
      teach: 'Physical quantities are the ones every coordinate system agrees on; labels such as θ, t and components are not among them.',
      explain: 'Distances (via each metric), clock readings and meetings of worldlines are facts about the world. The numbers θ, t and arrow components are bookkeeping: they change when the labels do.',
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'circle', centre: [1.5, 1], radius: 1.6 }, caption: 'Switch between the coordinate systems: the circle’s labels change completely, its length does not.' },
    }),
    mcq({
      id: 'origin', difficulty: 2,
      prompt: t`At the origin of polar coordinates, $\theta$ has no value and every line of constant $\theta$ meets. What is wrong with the plane there?`,
      choices: [
        'Nothing: the labels fail there, not the plane — a coordinate singularity',
        'The plane has a sharp tip there, like the point of a cone',
        'Distances to the origin are infinite',
        'Anything placed at the origin is torn apart',
      ],
      answer: 0,
      why: { 1: 'A cone’s tip shows up in measurements (circles around it are too short). Circles around the origin of a plane have circumference exactly 2πr.', 2: 'The origin is a distance r away from every point — finite.', 3: 'The plane is smooth there; nothing physical happens.' },
      hints: ['Switch to Cartesian labels: is anything strange at (0, 0)?'],
      teach: 'A coordinate singularity is a place where the labels break down while the geometry stays smooth — another coordinate system shows nothing special there.',
      explain: t`In Cartesian labels the origin is the ordinary point $(0, 0)$. The polar labels fail there — $\theta$ is undefined and the whole line $r = 0$ of the chart is one point — but the plane is as flat there as anywhere.`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', gridChoice: false, shape: 'circle', shapeChoice: false, radiusSlider: false, centre: [0.2, 0.1], radius: 0.8, readout: false }, caption: 'A small circle around the origin: a perfectly ordinary circle on the plane, but in the chart it runs along the whole bottom, where r = 0 is a single point stretched into a line.' },
    }),
    num({
      id: 'two-ways', difficulty: 2,
      gen(r) {
        const [r1, r2, dth, d] = r.pick([[3, 5, 120, 7], [5, 8, 60, 7], [7, 8, 120, 13], [3, 8, 60, 7], [5, 3, 120, 7]]);
        const p = fromPolar(r1, 0), q = fromPolar(r2, dth * DEG);
        return {
          prompt: t`Two points have polar labels $(r, \theta) = (${r1}\ \text{m}, 0^\circ)$ and $(${r2}\ \text{m}, ${dth}^\circ)$. How far apart are they? (Convert to $x, y$ with $x = r\cos\theta$, $y = r\sin\theta$, then use Pythagoras.)`,
          answer: d, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.abs(r2 - r1), feedback: 'Subtracting r-labels only works for points on the same ray. Convert both points to x, y first.' }, { value: Math.hypot(r2 - r1, dth * DEG), feedback: 'Differences of labels are not distances: convert to x, y (or use the metric) first.' }],
          hints: [t`First point: $(x, y) = (${r1}, 0)$. Second: $(${r2}\cos ${dth}^\circ, ${r2}\sin ${dth}^\circ) = (${fmt(q[0], 3)}, ${fmt(q[1], 3)})$.`, t`Distance $= \sqrt{(\Delta x)^2 + (\Delta y)^2}$ — or, in one step, the law of cosines $\sqrt{r_1^2 + r_2^2 - 2r_1r_2\cos\Delta\theta}$.`],
          teach: 'A distance does not depend on the labels: convert to Cartesian, or use the polar metric, and you get the same number.',
          explain: t`$\Delta x = ${fmt(q[0] - p[0], 3)}$, $\Delta y = ${fmt(q[1] - p[1], 3)}$, so the distance is $\sqrt{${fmt((q[0] - p[0]) ** 2, 4)} + ${fmt((q[1] - p[1]) ** 2, 4)}} = ${d}$ m — the same as the law of cosines gives: $\sqrt{${r1}^2 + ${r2}^2 - 2\cdot${r1}\cdot${r2}\cos ${dth}^\circ} = ${d}$.`,
          visual: segmentPicture(p, q, 'The two points and the straight segment between them, on the polar grid and in the polar chart.'),
        };
      },
    }),
    mcq({
      id: 'horizon', difficulty: 3, transfer: true,
      prompt: t`In Schwarzschild coordinates, the standard labels for a black hole, one term of the metric becomes infinite at $r = 2GM/c^2$. Yet an astronaut falling through that radius of the giant black hole Sagittarius A* would feel almost nothing there — her body is stretched by a tidal acceleration of only about $${tex(TIDE_SGRA, 1)}\ \text{m/s}^2$. What does this tell you about $r = 2GM/c^2$?`,
      choices: [
        'Schwarzschild coordinates fail there, not spacetime: other coordinates are smooth across it — though it is still a real one-way surface',
        'Spacetime is torn there, and anything reaching it is destroyed',
        'She never reaches it, because time stops there',
        'Nothing at all is special about that radius',
      ],
      answer: 0,
      why: {
        1: 'Curvature, measured by tidal stretching, is small and finite there for a large black hole. The real singularity, where tides grow without limit, is at r = 0.',
        2: 'Schwarzschild’s time coordinate t does run off to infinity, but t is a label: her own clock reaches the horizon after a finite time and keeps ticking.',
        3: 'Locally nothing is special, but globally it is: once inside, no signal can ever get back out.',
      },
      hints: ['Compare it with the origin of polar coordinates: is the geometry bad there, or the labels?', 'Which number is physical: Schwarzschild’s t, or the reading on her own watch?'],
      teach: 'r = 2GM/c² is a coordinate singularity of Schwarzschild coordinates — smooth in other coordinates — and also a real horizon, a surface light cannot climb back out of.',
      explain: 'Eddington–Finkelstein and Kruskal coordinates (steps 20–22) describe the same spacetime with nothing infinite at r = 2GM/c². What stays true in every coordinate system is that the horizon is a one-way surface. The genuine singularity, where tidal curvature blows up in every coordinate system, is at r = 0.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 6], xlabel: 'r / (2GM/c²)', ylabel: '',
          curves: [
            { fn: '1/(1 - 1/x)', color: 'bad', domain: [1.19, 4], label: 'a Schwarzschild metric term, 1/(1 − 2GM/rc²)', labelAt: 1.6, labelDx: 8, labelDy: -6 },
            { fn: '1/x^3', color: 'good', domain: [0.55, 4], label: 'tidal stretching, ∝ 1/r³', labelAt: 2.1, labelDx: 6, labelDy: -14 },
          ],
          vlines: [{ x: 1, label: 'horizon', color: 'warn' }],
        },
        caption: 'Both drawn relative to their values far away (the metric term → 1) or at the horizon (the tide = 1). The metric term blows up at the horizon only because of the coordinates; the tidal stretching — real curvature — is finite there and grows without limit only at r = 0.',
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-pole', difficulty: 2, transfer: true,
      prompt: 'An airliner flies a straight line over the North Pole. Just before the pole its longitude is 0° and its heading is due north; just after, its longitude is 180° and its heading is due south — yet the pilot never turned. What happened?',
      choices: [
        'Only the labels changed: longitude and compass headings are coordinates that break down at the pole',
        'The airliner made a sudden 180° turn over the pole',
        'The airliner jumped halfway around the world',
        'The Earth’s surface has a sharp point at the pole',
      ],
      answer: 0,
      why: { 1: 'The flight path is straight: every passenger would feel a 180° turn, and none is felt.', 2: 'It moved a few metres. Only its longitude label jumped by 180°.', 3: 'The pole is as smooth as anywhere else on the globe; only latitude–longitude labels misbehave there.' },
      hints: ['Compare with the origin of polar coordinates.'],
      teach: 'Jumps in coordinates or in components can come from the labels alone; physics is what survives every relabelling.',
      explain: 'At the pole, longitude is undefined and “north” flips to “south” for any straight path across it — exactly like θ at the origin of polar coordinates. The airliner’s path is smooth and straight; the map labels are not.',
      visual: segmentPicture([-3, 0], [3, 0], 'Seen from above, the region around the pole is like the origin of polar coordinates. A straight path through the origin becomes two separate pieces in the chart: its angle label jumps from 180° to 0° though the path never bends.'),
    }),
    mcq({
      id: 'cp-clock', difficulty: 2,
      prompt: t`In Schwarzschild coordinates, a probe falling into a black hole takes an infinite coordinate time $t$ to reach the horizon, but the probe’s own clock reaches it after a finite time. Which statement is physical?`,
      choices: [
        'The reading on the probe’s clock — its proper time — is physical; t is a label (the time of clocks far away)',
        'The infinite t is physical: the probe really never arrives',
        'Both are equally physical, so the probe both arrives and does not',
        'Neither: times have no meaning near a black hole',
      ],
      answer: 0,
      why: { 1: 'Coordinate time is a label. The probe’s clock is a physical object, and it records a finite time to the horizon and beyond.', 2: 'There is no contradiction: one is a label, the other a measurement.', 3: 'Clocks work everywhere; their readings are the physical times.' },
      hints: ['Which of the two numbers could you read off an instrument carried by the probe?'],
      teach: 'Coordinate time is not what a clock reads; a clock reads its own proper time, which is physical.',
      explain: t`Schwarzschild time $t$ is the time of clocks far away, extended inward by a rule that breaks down at the horizon: the crossing gets no finite $t$ label at all. (Signals the probe sends near the horizon also reach distant observers later and later.) The probe’s own proper time is finite — it crosses the horizon and continues inward.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 12], xlabel: 'r / (2GM/c²)', ylabel: 'time since r = 4 (units of 2GM/c³)',
          curves: [
            { fn: `-(2/3)*x^1.5 - 2*sqrt(x) + ln((sqrt(x)+1)/abs(sqrt(x)-1)) - (${T0})`, color: 'bad', domain: [1.0004, 4], label: 'Schwarzschild time t', labelAt: 1.6, labelDx: 8, labelDy: -10 },
            { fn: '(2/3)*(8 - x^1.5)', color: 'good', domain: [0, 4], label: 'the probe’s own clock τ', labelAt: 0.4, labelDx: 8, labelDy: -12 },
          ],
          vlines: [{ x: 1, label: 'horizon', color: 'warn' }],
        },
        caption: 'A probe falling straight in from rest far away, from r = 4 (right) inward. Schwarzschild time t runs off to infinity at the horizon; the probe’s own clock reaches it, and r = 0, after a finite time.',
      },
    }),
    num({
      id: 'cp-convert', difficulty: 1,
      gen(r) {
        const [rr, th, x] = r.pick([[10, 60, 5], [8, 120, -4], [6, 180, -6], [12, 300, 6], [14, 240, -7]]);
        return {
          prompt: t`A point has polar labels $r = ${rr}$ m, $\theta = ${th}^\circ$. What is its Cartesian label $x$?`,
          answer: x, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: rr * Math.sin(th * DEG), feedback: 'x uses the cosine: x = r cos θ.' }],
          hints: [t`$x = r\cos\theta$.`],
          teach: 'Converting labels uses x = r cos θ and y = r sin θ; the point itself does not move.',
          explain: t`$x = ${rr}\cos ${th}^\circ = ${rr}\times${fmt(Math.cos(th * DEG), 3)} = ${x}$ m.`,
          visual: segmentPicture([0, 0], fromPolar(rr, th * DEG), t`The point at distance ${rr} m from the origin, at ${th}° from the $x$ axis.`),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 and §7 (coordinate singularities)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed.), ch. 3 and 7', url: 'https://www.eftaylor.com/exploringblackholes/' },
  ],
});
