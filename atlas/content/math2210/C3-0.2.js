// Level curves and contour maps — slice a graph at height c and drop the cut
// to the floor; a stack of such cuts at even spacing is a contour map, where
// crowding means steepness. Equipotentials of Earth, a mountain pass, isobars.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { graphOf, pickExpr } from './_space.js';

const t = String.raw;

// a landscape of two hills (heights in hundreds of metres); its pass is at (−0.16, 0.27), height 1.10
const HILLS = '2*exp(-((x - 0.8)^2 + (y + 0.3)^2)) + 1.5*exp(-((x + 0.9)^2 + (y - 0.7)^2)/0.7)';
const hills = (x, y) => 2 * Math.exp(-((x - 0.8) ** 2 + (y + 0.3) ** 2)) + 1.5 * Math.exp(-((x + 0.9) ** 2 + (y - 0.7) ** 2) / 0.7);

// the Explore's five functions
const FUNCS = [
  HILLS,
  '(x^2 - y^2)/2',
  '-0.6/sqrt((x + 1)^2 + y^2 + 0.04) - 0.25/sqrt((x - 1.1)^2 + y^2 + 0.02)',
  '(x^2 + y^2)/2',
  'sqrt(x^2 + y^2)',
];

// Earth's gravitational potential in its equatorial plane, MJ/kg, with x and y in
// thousands of km; inside the planet, a uniform sphere: −GM(3R² − r²)/(2R³)
const R_E = 6.371, GMM = 398.6;   // GM = 3.986 × 10¹⁴ m³/s² = 398.6 (Mm)·(MJ/kg)
const EARTH_PHI = `-${GMM}*(step(sqrt(x^2 + y^2) - ${R_E})/sqrt(x^2 + y^2 + 1e-9) + step(${R_E} - sqrt(x^2 + y^2))*(3*${R_E}^2 - x^2 - y^2)/(2*${R_E}^3))`;
const earthOutline = { param: [`${R_E}*cos(t)`, `${R_E}*sin(t)`], t: [0, 2 * Math.PI], color: 'teal', width: 2 };

// the Earth–Moon potential along and around the line between them, in units where
// the Earth–Moon distance is 1 and GM_Earth = 1 (softened inside each body)
const MU = 0.0123;   // Moon/Earth mass ratio
// 384400 → 384\,400 for TeX
const thou = (n) => `${Math.floor(n / 1000)}\\,${String(n % 1000).padStart(3, '0')}`;
const EARTH_MOON = `-1/sqrt(x^2 + y^2 + 0.0004) - ${MU}/sqrt((x - 1)^2 + y^2 + 0.00005)`;

export default lesson({
  id: 'math2210.C3-0.2',
  title: 'Level curves and contour maps',
  minutes: 10, difficulty: 2,
  intro: t`Slice the graph of $f$ with the horizontal plane $z = c$ and drop the cut straight down to the $xy$-plane. What you get is a **level curve**: every point where the function takes the value $c$,

$$f(x, y) = c.$$

Draw level curves for evenly spaced values of $c$ and you have a **contour map** — a hiking map, a weather chart of isobars, a map of gravitational equipotentials. It turns a 3D surface into a flat picture you can read: **where the curves crowd together the function changes fast; where they spread out it is nearly level.** For a function of three variables the same idea gives **level surfaces** $f(x, y, z) = c$.`,
  symbols: [
    { tex: 'f(x, y)', text: 'the function: a height, a pressure, a temperature, a potential' },
    { tex: 'c', text: 'the **level**: a fixed value of $f$, in the units of $f$ (metres, hectopascals, joules per kilogram)' },
    { tex: 'f(x, y) = c', text: 'the level curve: an equation in $x$ and $y$ alone, so a curve in the plane — the cut of the graph by the plane $z = c$' },
    { tex: '\\Delta c', text: 'the **contour interval**: the step between neighbouring levels on a map. With equal steps, the spacing of the curves shows the steepness' },
  ],
  why: t`Equipotentials in gravity and electrostatics, isobars and isotherms, and later the gradient (which crosses level curves at right angles) and Lagrange multipliers (a level curve just touching a constraint) all start from this picture.`,
  visual: {
    type: 'c3-contour',
    title: 'From a landscape to a map',
    lead: t`The map shows the level curves of $f$ at evenly spaced values, each labelled; the gold curve is the level $f = c$. Switch to **Surface** to see where it comes from: the gold plane $z = c$ cuts the landscape, and the cut drops to the floor. The ring is a probe you can drag on the map.`,
    tasks: [
      t`**Two hills**, Surface view: slide $c$ from $0.5$ up to $1.8$. The cut is one loop around both hills, then — above the height of the pass, $1.10$ — two loops, then one, then nothing.`,
      t`Compare **Bowl** and **Cone**: both maps are circles, but the bowl’s crowd together as you go out (it gets steeper), while the cone’s stay evenly spaced (its slope never changes).`,
      t`**Two masses**: find the level whose curve makes a figure-eight. Its crossing point is the saddle between the masses, where their pulls cancel.`,
    ],
    params: {
      f: pickExpr('q', FUNCS), x: [-2.4, 2.4], y: [-2, 2], levels: 12, toggle3d: true, probe: [0.6, -1.3],
      highlight: 'c',
      choices: [{ key: 'q', label: 'Function', options: [[0, 'Two hills'], [1, 'Saddle'], [2, 'Two masses'], [3, 'Bowl'], [4, 'Cone']], value: 0, explain: 'Two hills (hundreds of metres), the saddle $(x^2 - y^2)/2$, the potential of two masses, the bowl $(x^2 + y^2)/2$ and the cone $\\sqrt{x^2 + y^2}$.' }],
      sliders: [{ key: 'c', label: 'Level $c$', min: -3, max: 3, step: 0.05, value: 1.25, explain: 'The height of the cutting plane $z = c$; its level curve is drawn in gold.' }],
      readouts: [{ label: '$f$ at the probe', expr: 'fp', digits: 3 }],
    },
    caption: t`Drag the ring on the map; in the surface view, drag to turn. The masses’ potential is softened at their centres so it stays finite.`,
  },
  example: {
    prompt: t`In Earth’s equatorial plane the gravitational potential (energy per kilogram) is $\Phi = -GM/r$, with $GM = 3.986\times10^{14}$ m³/s² and $r = \sqrt{x^2 + y^2}$ the distance from Earth’s centre. Describe its level curves for $\Phi = -60, -50, -40, -30$ and $-20$ MJ/kg, and how far apart they are.`,
    visual: {
      type: 'c3-contour',
      params: { f: EARTH_PHI, x: [-22, 22], y: [-21, 21], levels: [-60, -50, -40, -30, -20], curves: [earthOutline], xlabel: 'x (1000 km)', ylabel: 'y' },
      caption: t`The equipotentials, labelled in MJ/kg; axes in thousands of km; Earth in teal. Inside Earth the potential is drawn for a uniform sphere, $-GM(3R^2 - r^2)/(2R^3)$, which joins $-GM/r$ smoothly at the surface.`,
    },
    steps: [
      { label: 'Set the function equal to a level', text: t`$-\dfrac{GM}{r} = c$ gives $r = \dfrac{GM}{|c|}$: one fixed distance from the centre. **Every level curve is a circle centred on Earth.**` },
      { label: 'Compute the radii', text: t`With $c$ in J/kg: $r = \dfrac{3.986\times10^{14}}{6\times10^{7}} = 6.643\times10^{6}$ m for $c = -60$ MJ/kg. Likewise $7972$, $9965$, $13\,287$ and $19\,930$ km for $-50$, $-40$, $-30$ and $-20$ MJ/kg.` },
      { label: 'Compare the spacings', text: t`Successive gaps are $1329$, $1993$, $3322$ and $6643$ km: the circles crowd together toward Earth. Each gap is the same 10 MJ/kg climb, so **the potential changes fastest where the circles are closest** — near Earth, where gravity is strongest.` },
      { label: 'What the map says', text: t`Lifting 1 kg from $6643$ to $7972$ km out costs as much energy as lifting it from $13\,287$ to $19\,930$ km. Gravity’s pull points straight across the circles, toward lower potential.` },
      { label: 'Sense check', text: t`At the surface, $\Phi = -GM/R_\oplus = -3.986\times10^{14}/6.371\times10^{6} = -62.6$ MJ/kg, just below $-60$: the first circle should sit just outside the planet, and it does (6643 km against 6371 km).` },
    ],
    answer: t`Circles $r = GM/|c|$ of radius $6643$, $7972$, $9965$, $13\,287$ and $19\,930$ km, whose spacing grows outward: equal steps of potential crowd together where gravity is strong.`,
  },
  practice: [
    mcq({
      id: 'plane-levels', difficulty: 1,
      prompt: t`What are the level curves of $f(x, y) = 2x - y$?`,
      choices: [t`Parallel lines of slope $2$: $y = 2x - c$`, t`Lines through the origin, one for each $c$`, t`Circles centred on the origin`, t`Parabolas $y = 2x^2 - c$`],
      answer: 0,
      why: {
        1: t`Only the level $c = 0$ passes through the origin; changing $c$ shifts the line, it does not turn it.`,
        2: t`Circles come from $x^2 + y^2$; here $x$ and $y$ appear only to the first power.`,
        3: t`Nothing is squared in $2x - y = c$.`,
      },
      hints: [t`Set $2x - y = c$ and solve for $y$.`, 'What changes from one level to the next: the slope or the intercept?'],
      teach: 'Set f(x, y) = c and read the equation as a curve in the plane.',
      explain: t`$2x - y = c$ means $y = 2x - c$: lines of slope $2$, shifted down as $c$ grows. The graph is a tilted plane, and slicing a plane horizontally always gives parallel straight lines.`,
      visual: graphOf((x, y) => `(2*${x} - ${y})/2`, { caption: 'The graph of f, a tilted plane (heights halved). Drag to rotate.' }),
    }),
    num({
      id: 'circle-radius', difficulty: 2,
      gen(r) {
        const A = r.pick([16, 25]), R = A === 16 ? r.pick([2, 3]) : r.pick([2, 3, 4]), c = A - R * R, L = Math.sqrt(A);
        return {
          prompt: t`The level curve $f(x, y) = ${c}$ of $f(x, y) = ${A} - x^2 - y^2$ is a circle. What is its radius?`,
          answer: R, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: Math.sqrt(c), feedback: t`Solve $${A} - x^2 - y^2 = ${c}$ for $x^2 + y^2$ first: it is $${A} - ${c}$, not $${c}$.` }, { value: R * R, feedback: 'That is r²; take the square root.' }].filter((e) => Math.abs(e.value - R) > 1e-6),
          hints: [t`Rearrange $${A} - x^2 - y^2 = ${c}$ into $x^2 + y^2 = \ldots$`],
          teach: 'A level curve is an equation in x and y alone: rearrange it until you recognise the curve.',
          explain: t`$x^2 + y^2 = ${A} - ${c} = ${R * R}$: a circle of radius $${R}$ — where the plane $z = ${c}$ cuts the dome.`,
          visual: { type: 'c3-contour', params: { f: `${A} - x^2 - y^2`, x: [-L, L], y: [-L, L], levels: [], highlight: c, view: '3d', zscale: +(2.6 / A).toFixed(3), dist: 2.2 * L + 3 }, caption: t`The graph of $f$ (heights shrunk to fit), the plane $z = ${c}$ in gold, and their cut dropped to the floor. Drag to rotate.` },
        };
      },
    }),
    mcq({
      id: 'match-map', difficulty: 2,
      prompt: 'Which function has this contour map? The labels give the value on each curve.',
      choices: [t`$f = xy$`, t`$f = x^2 - y^2$`, t`$f = x^2 + 4y^2$`, t`$f = y - x^2$`],
      answer: 0,
      why: {
        1: t`$x^2 - y^2 = c$ gives hyperbolas too, but they open along the axes and approach the diagonals $y = \pm x$. These approach the axes.`,
        2: t`$x^2 + 4y^2 = c$ gives ellipses, closed curves around the origin.`,
        3: t`$y - x^2 = c$ gives parabolas $y = x^2 + c$, all opening upward.`,
      },
      hints: ['Which lines do the curves approach far from the origin?', t`On the axes, which function is $0$ everywhere?`],
      teach: 'Read a contour map by its shapes and asymptotes, then check a value or two against the labels.',
      explain: t`The curves are hyperbolas $y = c/x$ hugging the axes, positive in the first and third quadrants and negative in the others: $f = xy$, whose zero level is the two axes themselves.`,
      visual: { type: 'c3-contour', params: { f: 'x*y', x: [-3, 3], y: [-3, 3], levels: { from: -4, to: 4, step: 1 }, aspect: 'square' }, caption: 'Level curves at −4, −3, …, 4.' },
    }),
    mcq({
      id: 'steepest', difficulty: 2,
      prompt: t`This hiking map has contours every 25 m (labels in hundreds of metres; $x$ and $y$ in km). At which point is the ground steepest?`,
      choices: ['Q, on the flank of the larger hill', 'P, the summit of the larger hill', 'S, on the far side of the smaller hill', 'R, out on the plain'],
      answer: 0,
      why: {
        1: t`The summit is the **highest** point, but it is flat on top: no contour passes close to it.`,
        2: t`The contours there are farther apart than at Q: steep, but not the steepest.`,
        3: 'The plain is nearly level: the nearest contours are far away.',
      },
      hints: ['Contours are drawn at equal height steps. Where is the next step closest?', 'Steepness is height change per distance walked: look for the tightest packing.'],
      teach: 'On a contour map with an even interval, the slope is steepest where the curves are closest together.',
      explain: t`At Q the contours are packed tightest: the 25 m steps come one after another over the shortest distance. (Its slope works out to about 170 m of climb per km walked, against 120 m per km at S and almost nothing at P and R.)`,
      visual: { type: 'c3-contour', params: { f: HILLS, x: [-2.8, 2.8], y: [-2.1, 2.1], levels: { from: 0.25, to: 2, step: 0.25 }, points: [{ x: 0.79, y: -0.3, label: 'P' }, { x: 1.45, y: -0.62, label: 'Q' }, { x: 2.3, y: 1.5, label: 'R' }, { x: -1.6, y: 1.3, label: 'S' }] }, caption: 'A landscape of two hills; contour labels in hundreds of metres.' },
    }),
    mcq({
      id: 'level-surfaces', difficulty: 2,
      prompt: t`The gravitational potential of a point mass in space, $\Phi(x, y, z) = -\dfrac{GM}{\sqrt{x^2 + y^2 + z^2}}$, is a function of three variables. What are its level surfaces (equipotential surfaces)?`,
      choices: ['Spheres centred on the mass', 'Circles centred on the mass', 'Planes through the mass', 'Cylinders around an axis through the mass'],
      answer: 0,
      why: {
        1: t`Circles are what you see in one slice, such as the plane $z = 0$ in the picture. In space, $\Phi = c$ is one equation in three variables: a surface.`,
        2: t`$\Phi$ depends only on the distance from the mass, and planes contain points at every distance.`,
        3: t`A cylinder ignores one coordinate; $\Phi$ depends on all three, through $x^2 + y^2 + z^2$.`,
      },
      hints: [t`Set $\Phi = c$ and rearrange: what does it say about $x^2 + y^2 + z^2$?`],
      teach: 'For a function of three variables, f(x, y, z) = c is one equation in three unknowns: a surface, not a curve.',
      explain: t`$\Phi = c$ means $\sqrt{x^2 + y^2 + z^2} = GM/|c|$: every point at one distance from the mass — a sphere. A satellite in a circular orbit stays on one of these equipotential spheres.`,
      visual: { type: 'c3-contour', params: { f: '-1/sqrt(x^2 + y^2 + 0.002)', x: [-2, 2], y: [-2, 2], levels: [-6, -4, -3, -2, -1.5, -1, -0.75], aspect: 'square', labels: false }, caption: t`The slice $z = 0$: the potential in one plane through the mass (units with $GM = 1$).` },
    }),
    mcq({
      id: 'cone-or-bowl', difficulty: 2,
      prompt: t`Both maps show level curves at $z = 1, 2, 3, 4$, drawn to the same scale. One is the cone $z = \sqrt{x^2 + y^2}$, the other the bowl $z = x^2 + y^2$. Which map is the cone?`,
      choices: ['Map Q: its circles are evenly spaced', 'Map P: its circles crowd together toward the outside', 'Either: both are circles centred on the origin', 'Neither: the level curves of a cone are lines'],
      answer: 0,
      why: {
        1: t`Crowding outward means the surface steepens as you go out: that is the bowl. Its circles have radii $1, \sqrt2, \sqrt3, 2$.`,
        2: 'Both are circles, but the spacing differs — and the spacing is what tells a cone from a bowl.',
        3: t`Lines run up a cone from its tip, but they are not level: a horizontal slice of a cone is a circle.`,
      },
      hints: [t`For the cone, the level curve $z = c$ is $\sqrt{x^2 + y^2} = c$: what radius?`, t`For the bowl, $x^2 + y^2 = c$ has radius $\sqrt c$.`],
      teach: 'The spacing of the level curves, not just their shape, carries the information about the surface.',
      explain: t`The cone’s circles have radii $1, 2, 3, 4$: evenly spaced, because a cone rises at a constant slope. The bowl’s radii $1, 1.41, 1.73, 2$ crowd together outward, because a bowl gets steeper.`,
      visual: {
        type: 'graph',
        params: {
          x: [-9.5, 9.5], y: [-4.6, 5.2], equal: true, axes: false, grid: false, aspect: 'wide',
          curves: [1, Math.SQRT2, Math.sqrt(3), 2].map((rr) => ({ param: [`-5 + ${rr}*cos(t)`, `${rr}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent' }))
            .concat([1, 2, 3, 4].map((rr) => ({ param: [`5 + ${rr}*cos(t)`, `${rr}*sin(t)`], t: [0, 2 * Math.PI], color: 'warn' }))),
          points: [{ x: -5, y: 0, r: 3, color: 'accent' }, { x: 5, y: 0, r: 3, color: 'warn' }, { x: -5, y: 2.6, r: 0.01, color: 'accent', label: 'P', labelDx: -4, labelDy: 0 }, { x: 5, y: 4.6, r: 0.01, color: 'warn', label: 'Q', labelDx: -4, labelDy: 0 }],
        },
        caption: 'Two contour maps, at z = 1, 2, 3, 4, to the same scale. P: blue. Q: orange.',
      },
    }),
    expr({
      id: 'level-equation', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), c = r.pick([-2, -1, 1, 2, 3]);
        const aT = a === 0.5 ? t`\tfrac12` : a === 1 ? '' : '2';
        return {
          prompt: t`Write the level curve $f(x, y) = ${c}$ of $f(x, y) = y - ${aT}x^2$ as an equation for $y$.`,
          answer: `${a}*x^2 + (${c})`, answerTeX: t`${aT}x^2 ${c < 0 ? '-' : '+'} ${Math.abs(c)}`, lhs: 'y',
          vars: { x: [-2, 2] },
          errors: [{ answer: `${a}*x^2 - (${c})`, feedback: t`Moving $${aT}x^2$ across is fine, but the level stays as it is: $y = ${aT}x^2 + c$ with $c = ${c}$.` }],
          hints: [t`Set $y - ${aT}x^2 = ${c}$.`, t`Add $${aT}x^2$ to both sides.`],
          teach: 'To find a level curve, set the function equal to the level and solve for one variable.',
          explain: t`$y - ${aT}x^2 = ${c}$ gives $y = ${aT}x^2 ${c < 0 ? '-' : '+'} ${Math.abs(c)}$: a parabola. Every level of this $f$ is the same parabola, shifted up or down.`,
          visual: { type: 'c3-contour', params: { f: `y - ${a}*x^2`, x: [-2.5, 2.5], y: [-3, 4], levels: { from: -3, to: 4, step: 1 }, aspect: 'square' }, caption: t`Level curves of $f$ at $-3, -2, \ldots, 4$.` },
        };
      },
    }),
    {
      type: 'point', id: 'find-pass', difficulty: 3,
      prompt: 'Hikers crossing from one hill to the other want the lowest route: through the pass, the saddle point of the landscape. Find it on the map.',
      visual: { type: 'c3-contour', params: { f: HILLS, x: [-2.8, 2.8], y: [-2.1, 2.1], levels: { from: 0.25, to: 2, step: 0.25 }, probe: [1.9, -1.6] }, caption: 'Contours every 25 m; labels in hundreds of metres.' },
      answer: { x: -0.16, y: 0.27 }, tol: { x: 0.3, y: 0.3 },
      instruction: 'Drag the ring to the pass between the hills, then check.',
      hints: ['At a pass, the contours of the two hills come closest to each other; between them the ground rises toward both summits.', 'Look between the summits for where the 1.00 contour pinches into a waist while the 1.25 contours split into two loops.'],
      teach: 'A saddle point is where a contour pinches into an X or a waist: uphill two ways, downhill the other two.',
      explain: t`The pass is at about $(-0.16, 0.27)$, height $1.10$ (110 m): the 1.00 contour wraps both hills with a waist there, while 1.25 is already two separate loops. Walking from summit to summit, the pass is your lowest point; walking across the ridge, it is your highest.`,
    },
  ],
  checkpoint: [
    expr({
      id: 'cp-level-curve', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, -1, -2, 0.5]);
        const cT = c === 0.5 ? t`\tfrac12` : String(c);
        return {
          prompt: t`Write the level curve $f(x, y) = ${cT}$ of $f(x, y) = y\,e^{-x}$ as an equation for $y$.`,
          answer: `${c}*e^x`, answerTeX: t`${c === 0.5 ? t`\tfrac12 ` : c === -1 ? '-' : c}e^{x}`, lhs: 'y',
          vars: { x: [-1.5, 1.5] },
          errors: [{ answer: `${c}*e^(-x)`, feedback: t`Divide by $e^{-x}$, which is the same as multiplying by $e^{x}$.` }],
          hints: [t`$y\,e^{-x} = ${cT}$: isolate $y$.`],
          teach: 'Set f = c and solve for y.',
          explain: t`$y = ${cT}\,e^{x}$: each level curve is an exponential, scaled by the level.`,
          visual: { type: 'c3-contour', params: { f: 'y*exp(-x)', x: [-1.5, 1.5], y: [-3, 3], levels: [-2, -1, 0.5, 1, 2, 3], aspect: 'square' }, caption: t`Level curves of $y\,e^{-x}$.` },
        };
      },
    }),
    num({
      id: 'cp-balance', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([363300, 384400, 405500]), s = Math.sqrt(MU), x = d / (1 + s);
        const where = d === 363300 ? 'at perigee, ' : d === 405500 ? 'at apogee, ' : 'at its mean distance, ';
        return {
          prompt: t`The contour map shows the gravitational potential of the Earth and Moon. Between them the equipotentials pinch: there is a saddle on the line joining them, where the two pulls cancel. With the Moon ${where}$${thou(d)}$ km from Earth, and $m_\text{Moon}/M_\text{Earth} = ${MU}$, how far from Earth’s centre is the saddle point? (Treat both as point masses.)`,
          answer: x, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: d * (1 - MU), feedback: 'The pulls fall off as 1/distance², so the mass ratio enters through its square root.' }, { value: d / 2, feedback: 'Halfway would need equal masses; the Moon is 81 times lighter, so the balance point lies close to it.' }],
          hints: [t`Along the line, the pulls cancel where $\dfrac{GM}{x^2} = \dfrac{Gm}{(d - x)^2}$, with $x$ the distance from Earth.`, t`Take square roots: $\dfrac{d - x}{x} = \sqrt{m/M} = ${nice(s, 4)}$.`],
          teach: 'A saddle of a potential, where the contours pinch into an X, is a point where the force — the downhill direction — vanishes.',
          explain: t`$\dfrac{d - x}{x} = \sqrt{${MU}} = ${nice(s, 4)}$, so $x = \dfrac{d}{1 + ${nice(s, 4)}} = ${thou(Math.round(x / 10) * 10)}$ km, about $${thou(Math.round((d - x) / 100) * 100)}$ km from the Moon. (The Lagrange point L1, where a spacecraft can co-orbit with the Moon, is farther from it, about $60\,000$ km: co-orbiting needs a net pull toward Earth.)`,
          visual: { type: 'c3-contour', params: { f: EARTH_MOON, x: [-0.3, 1.25], y: [-0.42, 0.42], axes: false, labels: false, aspect: 'wide', levels: [-4, -2.5, -1.8, -1.5, -1.35, -1.28, -1.25, -1.22, -1.18, -1.12, -1.06, -1.0], points: [{ x: 0, y: 0, color: 'teal', label: 'Earth' }, { x: 1, y: 0, color: 'ink2', label: 'Moon', r: 3 }] }, caption: 'Equipotentials of the Earth–Moon pair (not the rotating frame). Levels are uneven, chosen to show the pinch.' },
        };
      },
    }),
    mcq({
      id: 'cp-isobars', difficulty: 2, transfer: true,
      prompt: t`On this weather chart the isobars (curves of equal pressure) are drawn every 4 hPa around a low. At which point is the wind strongest?`,
      choices: ['Q, where the isobars are packed tightest', 'P, at the centre of the low, where the pressure is lowest', 'S, on the long side of the low', 'R, far from the low'],
      answer: 0,
      why: {
        1: 'The centre has the lowest pressure, but the wind follows the pressure gradient — the change per distance — and the centre is where that change is smallest.',
        2: 'The isobars there are farther apart than at Q, so the pressure changes more slowly.',
        3: 'Far away the pressure is nearly uniform: the isobars are widely spaced or absent.',
      },
      hints: ['Wind is driven by the change of pressure with distance, not by the pressure itself.', 'Where do the equally spaced pressure steps come closest together?'],
      teach: 'A contour map shows the rate of change by its spacing: the force behind the wind is largest where the isobars crowd.',
      explain: t`The isobars are tightest at Q, so the pressure falls fastest there and the wind is strongest. (Above the ground the wind actually blows along the isobars — Earth’s rotation turns it — at a speed proportional to their packing.)`,
      visual: { type: 'c3-contour', params: { f: '1012 - 20*exp(-((x - 0.4)^2/1.6 + (y + 0.1)^2/0.6))', x: [-3, 3], y: [-2.2, 2.2], levels: { from: 994, to: 1010, step: 4 }, points: [{ x: 0.4, y: -0.1, label: 'P' }, { x: 0.4, y: 0.45, label: 'Q' }, { x: -2.3, y: 1.6, label: 'R' }, { x: 1.7, y: -0.4, label: 'S' }] }, caption: 'Isobars in hPa around a low-pressure centre (axes in units of 500 km).' },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §4.1 Functions of Several Variables (level curves)', url: 'https://openstax.org/books/calculus-volume-3/pages/4-1-functions-of-several-variables' },
    { label: 'NASA Space Science Data Coordinated Archive: Moon fact sheet (mass ratio, distance)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
  ],
});
