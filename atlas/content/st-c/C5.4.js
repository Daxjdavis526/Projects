// Intrinsic versus extrinsic: what an inhabitant can measure. H and the κs
// change under bending; K shows up in measurements made entirely inside the
// surface — the circumference and area of small geodesic circles, and the
// angle excess of triangles (Gauss's survey). C6.1 proves it.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';
import { R_EARTH, R_MOON } from './_surf.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const ARCSEC = 180 * 3600 / Math.PI;
const thou = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');

const capPic = (lat, caption) => ({ type: 'gr-sphere-transport', params: { mode: 'cap', lat, measure: false, transport: false, readout: false }, caption });

export default lesson({
  id: 'st-c.C5.4',
  title: 'Intrinsic versus extrinsic curvature',
  minutes: 12, difficulty: 3,
  equation: t`C(\rho) = 2\pi\rho - \frac{\pi}{3}K\rho^3 + \cdots`,
  intro: t`Imagine an ant that lives *in* a surface: it can lay out strings and measure lengths and angles, but it cannot see out. Which curvatures can it detect? Not $H$, nor the principal curvatures: rolling a sheet into a cylinder changes $H$ from $0$ to $1/(2a)$ without changing a single measurement the ant can make. Those are **extrinsic** — properties of how the surface sits in space.

But the ant can do this: stake a point, walk out a distance $\rho$ in every direction (along the surface), and measure the circumference $C$ of the circle it has marked. On a plane $C = 2\pi\rho$. On a surface the shortfall, for small $\rho$, is given by the line above — and the coefficient is the Gaussian curvature. Rearranged, **$K = \lim_{\rho\to0}\frac{3}{\pi}\,\frac{2\pi\rho - C(\rho)}{\rho^3}$** (Bertrand–Diguet–Puiseux, 1848): an ant’s-eye measurement. The area inside does the same, $A = \pi\rho^2 - \frac{\pi}{12}K\rho^4 + \cdots$. So $K$, defined with the normal in C5.3, is **intrinsic** — Gauss’s great discovery, proved in C6.1.`,
  symbols: [
    { tex: t`\rho`, text: 'the radius of the circle, measured along the surface from its centre, in metres' },
    { tex: t`C(\rho)`, text: 'the circumference of that circle, measured along the surface' },
    { tex: 'K', text: t`the Gaussian curvature at the centre, in $\text{m}^{-2}$` },
    { tex: t`\cdots`, text: t`terms of order $\rho^4$ and higher, negligible as $\rho \to 0$` },
  ],
  why: t`Spacetime is not embedded in anything, so only intrinsic curvature can mean anything there. GR’s curvature is exactly this kind: measured from inside, by rulers, clocks and freely falling particles — never by looking from outside.`,
  visual: {
    type: 'gr-sphere-transport',
    title: 'The ant’s measurement',
    lead: t`A circle on a unit sphere, centred on the north pole. Its radius $\rho$ and circumference are both measured along the surface; compare the circumference with the flat plane’s $2\pi\rho$.`,
    tasks: [
      t`At latitude $80^\circ$ ($\rho \approx 0.17R$) the two circumferences agree to within half a percent: a small region of a sphere is nearly flat.`,
      t`Lower the circle to the equator ($\rho = \pi R/2$): the circumference is $2\pi R$, but the flat plane would give $\pi^2 R$, nearly 60% more.`,
      t`Check the formula: at latitude $60^\circ$, $\rho = 0.524R$; $2\pi\rho - C = 3.290 - 3.142 = 0.148R$, close to $\tfrac\pi3\rho^3 = 0.150R$ with $K = 1/R^2$.`,
    ],
    params: { mode: 'cap', lat: 60, measure: true, transport: false },
    caption: t`A sphere of radius $R = 1$. The circle is a circle of latitude, but the ant need not know that: it is the set of points at surface distance $\rho$ from the pole.`,
  },
  example: {
    prompt: t`Show that the circumference test gives $K = 1/a^2$ on a sphere of radius $a$, and find the shortfall $2\pi\rho - C$ for a circle of radius $\rho = 1000$ km on the Earth.`,
    visual: capPic(81, t`A circle of surface radius $\rho$ round the pole, shown on a unit sphere (here $\rho \approx 0.157R$, as for 1000 km on the Earth).`),
    steps: [
      { label: 'The circle', text: t`Points at surface distance $\rho$ from the pole have colatitude $\theta = \rho/a$; they form a circle of (space) radius $a\sin(\rho/a)$. So $C(\rho) = 2\pi a\sin(\rho/a)$.` },
      { label: 'Expand', text: t`$\sin x = x - x^3/6 + \cdots$ gives $C = 2\pi a\left(\frac\rho a - \frac{\rho^3}{6a^3}\right) + \cdots = 2\pi\rho - \frac{\pi\rho^3}{3a^2} + \cdots$.` },
      { label: 'Read off K', text: t`Comparing with $2\pi\rho - \frac\pi3K\rho^3$: $K = 1/a^2$, the same as $\kappa_1\kappa_2 = (-1/a)^2$ from C5.3 — though no normal was used.` },
      { label: 'The Earth', text: t`$\rho/R = 1000/6371 = 0.15696$. $C = 2\pi\times6371\times\sin(0.15696) = 6257.4$ km, against $2\pi\rho = 6283.2$ km: a shortfall of $25.8$ km.` },
      { label: 'Sense check', text: t`$\frac\pi3\rho^3/R^2 = \frac\pi3\times10^9/(6371^2) = 25.8$ km ✓. A surveyor walking a 1000 km circle would find it 26 km short — measurable, and it reveals the Earth’s curvature without looking up.` },
    ],
    answer: t`$C(\rho) = 2\pi a\sin(\rho/a) = 2\pi\rho - \pi\rho^3/(3a^2) + \cdots$, so $K = 1/a^2$; on the Earth the 1000 km circle is $25.8$ km short.`,
  },
  practice: [
    multi({
      id: 'which-intrinsic', difficulty: 1,
      prompt: 'Which of these can an ant living in the surface determine by measurements made within the surface? Select every one.',
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'cylinder', surfaces: ['cylinder', 'cone', 'sphere'], readout: false }, caption: 'Surfaces seen from outside. The ant sees none of this: only lengths and angles along the surface.' },
      choices: ['The length of a curve', 'The angle between two curves', t`The Gaussian curvature $K$`, t`The mean curvature $H$`, t`The principal curvature $\kappa_1$`, t`The direction of the normal $\mathbf n$`],
      answer: [0, 1, 2],
      why: {
        3: t`A flat sheet ($H = 0$) and the same sheet rolled up ($H = 1/(2a)$) give the ant identical measurements.`,
        4: t`Rolling changes $\kappa_1$ from $0$ to $-1/a$ and the ant notices nothing.`,
        5: 'The normal points out of the surface, into the space the ant cannot see.',
      },
      hints: ['Anything that changes when you bend paper without stretching it is invisible to the ant.', t`$K$ can be read off the circumference of small circles, which the ant can measure.`],
      teach: 'Intrinsic quantities survive bending without stretching; K is one of them, H and the principal curvatures are not.',
      explain: t`Lengths, angles and areas come from $E$, $F$, $G$ (C4.2), and so does $K$ (the circumference test, made precise in C6.1). $H$, $\kappa_1$, $\kappa_2$ and $\mathbf n$ all change when the surface is bent, so they are extrinsic.`,
    }),
    num({
      id: 'ant-K', difficulty: 2,
      gen(r) {
        const a = r.pick([200, 300, 500]), frac = r.pick([0.15, 0.2, 0.25]);
        const rho = r6(frac * a), C = Math.round(2 * Math.PI * a * Math.sin(rho / a) * 100) / 100;
        const K = (3 / Math.PI) * (2 * Math.PI * rho - C) / rho ** 3;
        return {
          prompt: t`A rover on a small, round asteroid drives a circle of radius $\rho = ${nice(rho)}$ m (measured along the ground) around its landing site, and its odometer gives the circumference as $C = ${nice(C, 7)}$ m. Estimate the Gaussian curvature from $K \approx \dfrac{3}{\pi}\,\dfrac{2\pi\rho - C}{\rho^3}$, in $\text{m}^{-2}$.`,
          visual: capPic(r6(90 - (frac * 180) / Math.PI), 'The circle round the landing site, drawn on a sphere. The rover cannot see this view.'),
          answer: K, units: 'm^-2', tol: { rel: 0.02 },
          errors: [{ value: (2 * Math.PI * rho - C) / rho ** 3, feedback: t`Multiply by $3/\pi$: the shortfall is $\frac\pi3K\rho^3$.` }],
          hints: [t`$2\pi\rho = ${nice(2 * Math.PI * rho, 7)}$ m, so the shortfall is $${nice(2 * Math.PI * rho - C, 4)}$ m.`, t`Divide by $\rho^3 = ${tex(rho ** 3, 5)}\ \text{m}^3$ and multiply by $3/\pi$.`],
          teach: 'The shortfall of a small circle’s circumference below 2πρ measures the Gaussian curvature.',
          explain: t`$K \approx \frac3\pi\times${nice(2 * Math.PI * rho - C, 4)}/${tex(rho ** 3, 5)} = ${tex(K, 3)}\ \text{m}^{-2}$, which corresponds to a radius $1/\sqrt K \approx ${nice(1 / Math.sqrt(K), 3)}$ m (the true radius is ${a} m; the small gap is the neglected $\rho^5$ term). The rover found the size of its world without looking at the horizon.`,
        };
      },
    }),
    mcq({
      id: 'cylinder-ant', difficulty: 2,
      prompt: t`An ant on a cylinder of radius $a$ marks the points at surface distance $\rho < \pi a$ from a point and measures the circumference: exactly $2\pi\rho$. What should it conclude?`,
      visual: { type: 'surface3d', params: { surface: ['cos(u)', 'sin(u)', 'v'], domain: [[0, TAU], [-1.6, 1.6]], alpha: 0.45, pitch: 0.25, dist: 6.2, axes: false, curves: [{ param: ['cos(0.8*cos(t))', 'sin(0.8*cos(t))', '0.8*sin(t)'], t: [0, TAU], color: 'gold', width: 3 }] }, caption: 'A geodesic circle of radius 0.8 on a cylinder of radius 1: unrolled, it is an ordinary circle.' },
      choices: [t`$K = 0$ where it stands — its world is intrinsically flat there`, t`$K = 1/a^2$, as on a sphere of the same radius`, t`$K = -1/a$, the curvature of the cylinder’s cross-section`, 'Nothing: circles are not a fair test on a cylinder'],
      answer: 0,
      why: {
        1: t`A sphere of radius $a$ would give $2\pi a\sin(\rho/a) < 2\pi\rho$. The cylinder gives no shortfall.`,
        2: t`$-1/a$ is a principal curvature — extrinsic, and the wrong units for $K$ ($\text{m}^{-2}$).`,
        3: 'The test is fair on any surface; on the cylinder it correctly reports what unrolling shows — the geometry is the plane’s.',
      },
      hints: ['Unroll the cylinder: what does the circle become?'],
      teach: 'A cylinder is intrinsically flat: small circles on it have circumference exactly 2πρ.',
      explain: t`Unrolled, the ant’s circle is a flat circle of radius $\rho$, so $K = 0$ — the cylinder is bent but not curved (C4.3). A flat sheet and a cylinder are indistinguishable from inside, at least until the ant walks all the way round.`,
    }),
    num({
      id: 'hyperbolic-C', difficulty: 3,
      gen(r) {
        const b = r.pick([5, 10, 20]), rho = r.pick([0.5, 1, 1.5]) * b;
        const C = 2 * Math.PI * b * Math.sinh(rho / b);
        return {
          prompt: t`A crocheted “hyperbolic plane” has constant curvature $K = -1/b^2$ with $b = ${b}$ cm. On it, a circle of radius $\rho$ has circumference $C = 2\pi b\sinh(\rho/b)$. What is the circumference of a circle of radius $\rho = ${nice(rho)}$ cm, in cm?`,
          visual: { type: 'graph', params: { x: [0, 1.6], y: [0, 16], xlabel: 'ρ / b', ylabel: 'C / b', curves: [{ fn: '2*pi*x', color: 'ink3', dash: true, label: 'flat: 2πρ' }, { fn: '2*pi*sinh(x)', color: 'accent', label: 'K < 0', labelAt: 1.1 }, { fn: '2*pi*sin(x)', color: 'gold', label: 'K > 0', labelAt: 1.3, labelDy: 14 }] }, caption: 'Circumference against radius on a surface of constant positive, zero and negative curvature (both axes in units of b).' },
          answer: C, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * rho, feedback: t`That is the flat value. With $K < 0$ circles are *longer* than $2\pi\rho$: use $2\pi b\sinh(\rho/b)$.` }, { value: 2 * Math.PI * b * Math.sin(rho / b), feedback: t`$\sin$ is for positive curvature. Negative curvature gives $\sinh$, which grows faster than its argument.` }].filter((e) => Math.abs(e.value - C) > 0.01 * C),
          hints: [t`Negative curvature: circles grow faster than $2\pi\rho$, and the formula uses $\sinh$.`, t`$\rho/b = ${nice(rho / b)}$, and $\sinh x = (e^x - e^{-x})/2$; then multiply by $2\pi b$.`],
          teach: 'On a negatively curved surface circles are longer than 2πρ; the excess, like the shortfall on a sphere, measures K.',
          explain: t`$C = 2\pi\times${b}\times\sinh(${nice(rho / b)}) = ${nice(C, 4)}$ cm, against $2\pi\rho = ${nice(2 * Math.PI * rho, 4)}$ cm. The excess grows exponentially, which is why crocheted models ruffle: each round needs many more stitches than the last.`,
        };
      },
    }),
    num({
      id: 'area-test', difficulty: 3,
      gen(r) {
        const rho = r.pick([200, 300, 400]);
        const R = R_MOON, A = 2 * Math.PI * R * R * (1 - Math.cos(rho / R));
        const Ar = Math.round(A / 10) * 10, K = (12 / (Math.PI * rho ** 4)) * (Math.PI * rho * rho - Ar);
        return {
          prompt: t`A lunar mapping team measures the area within surface distance $\rho = ${rho}$ km of a point as $A = ${thou(Ar)}\ \text{km}^2$. Using $A \approx \pi\rho^2 - \frac{\pi}{12}K\rho^4$, estimate the Moon’s Gaussian curvature, in $\text{km}^{-2}$.`,
          visual: capPic(r6(90 - (rho / R) * 180 / Math.PI), t`A disc of surface radius $\rho$ on the Moon (to scale with the Moon as a sphere of radius 1737 km).`),
          answer: K, units: 'km^-2', tol: { rel: 0.03 },
          errors: [{ value: (Math.PI * rho * rho - Ar) / rho ** 4, feedback: t`Multiply by $12/\pi$: the area shortfall is $\frac{\pi}{12}K\rho^4$.` }].filter((e) => Math.abs(e.value - K) > 0.05 * K),
          hints: [t`$\pi\rho^2 = ${thou(Math.PI * rho * rho)}\ \text{km}^2$, so the shortfall is $${nice(Math.PI * rho * rho - Ar, 4)}\ \text{km}^2$.`, t`$K \approx \dfrac{12}{\pi\rho^4}\times\text{shortfall}$.`],
          teach: 'The shortfall of a small disc’s area below πρ² also measures K: A = πρ² − πKρ⁴/12 + ….',
          explain: t`$K \approx ${tex(K, 3)}\ \text{km}^{-2}$, i.e. a radius $1/\sqrt K \approx ${nice(1 / Math.sqrt(K), 4)}$ km — the Moon’s mean radius is $1737.4$ km. (The measured area was rounded to the nearest 10 km²; the estimate is good to about a percent.)`,
        };
      },
    }),
    mcq({
      id: 'bend-H', difficulty: 2,
      prompt: t`A flat sheet ($\kappa_1 = \kappa_2 = 0$) is rolled into a cylinder of radius $a$. What happens to $H$ and $K$?`,
      visual: { type: 'surface3d', params: { surface: ['sin(0.6*u)/0.6', 'v', '(1 - cos(0.6*u))/0.6'], domain: [[-3.1416, 3.1416], [-1.2, 1.2]], alpha: 0.7, pitch: 0.35, yaw: -0.9, dist: 6.5, axes: false }, caption: 'A sheet partly rolled: bent, not stretched.' },
      choices: [t`$H$ changes from $0$ to $\pm1/(2a)$; $K$ stays $0$`, t`Both stay $0$`, t`$K$ changes to $1/a^2$; $H$ stays $0$`, t`Both change: $H$ to $1/(2a)$ and $K$ to $1/a^2$`],
      answer: 0,
      why: {
        1: t`The principal curvatures become $\mp1/a$ and $0$; their mean is $\mp1/(2a)$.`,
        2: t`$K = \kappa_1\kappa_2 = (\mp1/a)\times0 = 0$. A cylinder is not a sphere.`,
        3: t`$K$ cannot change under bending — the ant’s circles are unchanged. Only $H$ moves.`,
      },
      hints: [t`For the cylinder: $\kappa_1 = \mp1/a$ (round) and $\kappa_2 = 0$ (along).`],
      teach: 'Bending changes the mean curvature and leaves the Gaussian curvature alone.',
      explain: t`$H$ jumps from 0 to $\mp1/(2a)$ while $K$ stays 0. So $H$ is extrinsic, and $K$ passes this test of intrinsicness: it did not move when only the embedding changed.`,
    }),
    order({
      id: 'circ-derivation', difficulty: 3,
      prompt: t`On a surface with metric $ds^2 = d\rho^2 + f(\rho)^2\,d\varphi^2$ (geodesic polar coordinates), $f(0) = 0$ and $f'(0) = 1$, and $K = -f''/f$. Show that $C(\rho) = 2\pi\rho - \frac\pi3K\rho^3 + \cdots$ with $K$ its value at the centre. Order the steps.`,
      visual: capPic(55, t`Geodesic polar coordinates round a point: $\rho$ is distance from the centre, $\varphi$ the direction.`),
      items: [
        t`The circle $\rho = $ const has length $C(\rho) = \int_0^{2\pi} f(\rho)\,d\varphi = 2\pi f(\rho)$.`,
        t`Taylor: $f(\rho) = f(0) + f'(0)\rho + \tfrac12f''(0)\rho^2 + \tfrac16f'''(0)\rho^3 + \cdots$.`,
        t`$f(0) = 0$ and $f'(0) = 1$; and $f'' = -Kf$ gives $f''(0) = 0$ and $f'''(0) = -K(0)$.`,
        t`So $f(\rho) = \rho - \tfrac16K\rho^3 + \cdots$ and $C = 2\pi\rho - \tfrac\pi3K\rho^3 + \cdots$.`,
      ],
      hints: ['Start from what the metric says the circle’s length is.', t`Differentiate $f'' = -Kf$ once more to get $f'''(0)$, using $f(0) = 0$ and $f'(0) = 1$.`],
      teach: t`In geodesic polar coordinates $C = 2\pi f(\rho)$, and $f'' = -Kf$ fixes its Taylor series.`,
      explain: t`On the sphere $f = a\sin(\rho/a)$ and $K = 1/a^2$; on the hyperbolic plane $f = b\sinh(\rho/b)$, $K = -1/b^2$; on the plane $f = \rho$. The formula $K = -f''/f$ (PHYS 3710 R0.3) uses only the metric — a special case of C6.1.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gauss-survey', difficulty: 3, transfer: true,
      gen(r) {
        const [where, R, sides, note] = r.pick([
          ['the Earth', R_EARTH, [69.2, 84.9, 106.0], 'Gauss’s own triangle Hohenhagen–Brocken–Inselsberg (1821–23)'],
          ['the Earth', R_EARTH, [138.4, 169.8, 212.0], 'a triangle twice the size of Gauss’s'],
          ['the Moon', R_MOON, [50, 60, 70], 'a triangle of lunar survey stations'],
          ['Mars', 3389.5, [100, 120, 150], 'a triangle of Mars rover waypoints'],
        ]);
        const [a, b, c] = sides, s = (a + b + c) / 2, A = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        const eps = (A / (R * R)) * ARCSEC;
        return {
          prompt: t`On ${where} (radius $${nice(R, 5)}$ km), ${note} has sides $${a}$, $${b}$ and $${c}$ km. Its angles, measured with a theodolite, add up to more than $180^\circ$ by the **spherical excess** $\varepsilon = \iint K\,dA = A/R^2$. Using Heron’s formula for the area (accurate enough here), find $\varepsilon$ in arcseconds.`,
          visual: { type: 'graph', params: { x: [-5, 125], y: [-10, 80], equal: true, axes: false, grid: false, curves: [{ param: [`t*${r6(c / c * 110)}`, '0'], t: [0, 1], color: 'gold', width: 2.4 }], points: [{ x: 0, y: 0, label: 'P', labelDx: -14 }, { x: 110, y: 0, label: 'Q' }, { x: r6(((c * c + b * b - a * a) / (2 * c)) * (110 / c)), y: r6(Math.sqrt(b * b - ((c * c + b * b - a * a) / (2 * c)) ** 2) * (110 / c)), label: 'R' }], arrows: [{ from: [110, 0], to: [r6(((c * c + b * b - a * a) / (2 * c)) * (110 / c)), r6(Math.sqrt(b * b - ((c * c + b * b - a * a) / (2 * c)) ** 2) * (110 / c))], color: 'gold' }, { from: [r6(((c * c + b * b - a * a) / (2 * c)) * (110 / c)), r6(Math.sqrt(b * b - ((c * c + b * b - a * a) / (2 * c)) ** 2) * (110 / c))], to: [0, 0], color: 'gold' }] }, caption: 'The triangle’s shape, drawn flat and to scale (the curvature is far too small to see).' },
          answer: eps, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: A / (R * R), feedback: t`$A/R^2$ is in radians. Multiply by $180\times3600/\pi = 206\,265$ to get arcseconds.` }].filter((e) => Math.abs(e.value - eps) > 0.02 * eps),
          hints: [t`Heron: $s = (a + b + c)/2 = ${nice(s, 5)}$ km and $A = \sqrt{s(s - a)(s - b)(s - c)} = ${nice(A, 5)}\ \text{km}^2$.`, t`$\varepsilon = A/R^2$ radians; 1 radian $= 206\,265$ arcseconds.`],
          teach: 'A geodesic triangle’s angle excess is the integral of K over it — A/R² on a sphere — an intrinsic measurement of curvature.',
          explain: t`$\varepsilon = ${nice(A, 5)}/${nice(R, 5)}^2\ \text{rad} = ${nice(eps, 3)}''$. For Gauss’s triangle the excess is about $15''$, and his measured angles agreed with it within their errors of a fraction of an arcsecond. (Historians debate whether he meant this as a test of the geometry of space; it was certainly a test of the Earth’s shape.)`,
        };
      },
    }),
    mcq({
      id: 'cp-flat-ant', difficulty: 2,
      prompt: t`Everywhere it goes, an ant finds that small circles have circumference exactly $2\pi\rho$ and triangles have angle sum exactly $180^\circ$. What can it conclude about its surface?`,
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'cone', surfaces: ['cone', 'cylinder'], readout: false }, caption: 'Two surfaces coloured by K: teal means K = 0.' },
      choices: [t`$K = 0$ everywhere: it is locally isometric to a plane, but it may be a plane, a cylinder or a cone in space`, 'It is a plane', 'It is a cylinder', 'Nothing, without seeing the surface from outside'],
      answer: 0,
      why: {
        1: 'A cylinder or a cone gives exactly the same measurements; the ant cannot tell them apart from a plane locally.',
        2: 'Possible, but so is a plane or a cone. Its measurements cannot single out the cylinder.',
        3: t`It can conclude a lot: $K = 0$, and the geometry near every point is the plane’s.`,
      },
      hints: ['Which surfaces from C4.3 give exactly the plane’s measurements?'],
      teach: 'Intrinsic measurements determine K and the local geometry, not the shape in space.',
      explain: t`$K = 0$ everywhere. A theorem (Minding’s) says surfaces with the same constant $K$ are locally isometric, so the ant’s world is locally a plane. Globally it might discover more — walking straight and returning to its start would reveal a cylinder.`,
    }),
    num({
      id: 'cp-torus-circle', difficulty: 3,
      gen(r) {
        const R = r.pick([3, 4]), rr = r.pick([1, 1.5]), rho = r.pick([0.1, 0.2]);
        const K = -1 / (rr * (R - rr)), C = 2 * Math.PI * rho - (Math.PI / 3) * K * rho ** 3;
        return {
          prompt: t`An ant sits on the inner equator of a torus with $R = ${R}$ m and $r = ${rr}$ m, where $K = -1/\big(r(R - r)\big)$. To third order in $\rho$, what is the circumference of the circle of surface radius $\rho = ${rho}$ m around it, in metres? (Give 5 significant figures.)`,
          visual: { type: 'gr-surface', params: { mode: 'loop', surface: 'torus', v: 3.14, size: 0.15, controls: false, readout: false }, caption: 'A small loop on the inner equator of a torus (blue: K < 0). Drawn with R = 2, r = 1.' },
          answer: C, units: 'm', tol: { rel: 0.00002 }, sigfigs: 5,
          errors: [{ value: 2 * Math.PI * rho + (Math.PI / 3) * K * rho ** 3, feedback: t`On the inner equator $K < 0$, so the correction $-\frac\pi3K\rho^3$ is positive: the circle is *longer* than $2\pi\rho$.` }],
          hints: [t`$K = -1/(${rr}\times${R - rr}) = ${nice(K, 4)}\ \text{m}^{-2}$.`, t`$C \approx 2\pi\rho - \frac\pi3K\rho^3$ with $2\pi\rho = ${nice(2 * Math.PI * rho, 6)}$ m.`],
          teach: 'Where K < 0, small circles are longer than 2πρ by about π|K|ρ³/3.',
          explain: t`$C \approx ${nice(2 * Math.PI * rho, 6)} + ${tex(-(Math.PI / 3) * K * rho ** 3, 3)} = ${nice(C, 6)}$ m. The excess is tiny — a few millimetres or less — but it is there, and it has the opposite sign from the outer equator, where $K > 0$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Differential Geometry and Forms, ch. 2 and 4', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-3 and §4-6', url: 'https://store.doverpublications.com/products/9780486806990' },
  ],
});
