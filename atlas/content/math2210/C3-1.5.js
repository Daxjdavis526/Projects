// Cylindrical and spherical coordinates, in the physics convention used by
// relativity: (ρ, φ, z) and (r, θ, φ) with θ from +z and φ from +x. Coordinate
// surfaces, conversions, the calculus-text swap, unit vectors that turn with
// the point, and the scale factors r and r sin θ — the seed of a metric.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { QUADS, signed, pointTeX, norm, deg } from './_space.js';

const t = String.raw;
const D = Math.PI / 180;
const R_E = 6371;

// a still picture on c3-coords: no sliders, no readouts
const still = (system, point, extra = {}, caption) => ({
  type: 'c3-coords',
  params: { system, point, sliders: false, readouts: [], ...extra },
  caption: caption || 'Drag to rotate. Physics convention: θ down from +z, φ around from +x.',
});
// clamp a point into the picture's range (3) while keeping its direction
const fitSph = (r, th, ph) => [Math.min(r, 2.6), th, ph];

// bright stars: name, distance (pc), right ascension (°), declination (°), J2000
const STARS = [['Sirius', 2.64, 101.287, -16.7161], ['Vega', 7.68, 279.235, 38.7837], ['Altair', 5.13, 297.696, 8.8683], ['Procyon', 3.51, 114.825, 5.225], ['Alpha Centauri A', 1.34, 219.902, -60.834]];

export default lesson({
  id: 'math2210.C3-1.5',
  title: 'Cylindrical and spherical coordinates',
  minutes: 12, difficulty: 3,
  intro: t`Some shapes are awkward in $x$, $y$, $z$ and trivial in the right coordinates. **Cylindrical coordinates** keep the height $z$ and describe the floor in polar form; **spherical coordinates** give a distance from the origin and two angles — the way GPS, astronomers and general relativity locate things:

$$x = \rho\cos\phi,\ \ y = \rho\sin\phi,\ \ z = z \qquad\qquad x = r\sin\theta\cos\phi,\ \ y = r\sin\theta\sin\phi,\ \ z = r\cos\theta$$

In them a cylinder is $\rho = 3$, a sphere is $r = 6371$ km, a cone is $\theta = 30^\circ$. **This course uses the physics convention** (ISO 80000-2, and every relativity text): $\theta$ is the **polar angle**, measured down from $+z$, and $\phi$ the **azimuth**, measured around from $+x$. Many calculus texts, OpenStax and Stewart among them, swap the Greek letters and write the distance $\rho$: **their $(\rho, \theta, \phi)$ is our $(r, \phi, \theta)$.** Check the convention of every source you read.`,
  symbols: [
    { tex: '\\rho', text: t`distance from the $z$-axis, $\rho = \sqrt{x^2 + y^2} = r\sin\theta \ge 0$: the radius of the cylinder through the point` },
    { tex: '\\phi', text: t`the **azimuth**: the angle around the $z$-axis from $+x$ toward $+y$, $0 \le \phi < 2\pi$ — the same angle in both systems, and on Earth the longitude (east positive)` },
    { tex: 'r', text: t`distance from the origin, $r = \sqrt{x^2 + y^2 + z^2} \ge 0$: the radius of the sphere through the point` },
    { tex: '\\theta', text: t`the **polar angle**, measured down from $+z$: $0$ at the north pole, $\pi/2$ on the equator, $\pi$ at the south pole. On Earth it is the colatitude, $90^\circ$ minus the latitude` },
    { tex: 'z', text: t`height above the $xy$-plane, as in Cartesian coordinates; $z = r\cos\theta$` },
  ],
  why: t`Triple integrals over cylinders and balls (C3-4.5), the fields of a wire and of a point charge, the orbitals of hydrogen and the Schwarzschild metric are all written in these coordinates. Nudging each spherical coordinate moves you $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$, so the distance element of flat space is $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$ — the part of spacetime that Schwarzschild’s solution bends.`,
  visual: {
    type: 'c3-coords',
    title: 'Three surfaces through a point',
    lead: t`Choose a system and move the point with the sliders. Holding one coordinate fixed gives a surface — in spherical coordinates the sphere $r = \text{const}$ (teal), the cone $\theta = \text{const}$ (violet) and the half-plane $\phi = \text{const}$ (gold) — and the point sits where all three meet. Each coloured curve lets one coordinate vary, and the arrows are the unit vectors along those curves.`,
    tasks: [
      t`Spherical: set $\theta = 90^\circ$ — the cone flattens into the $xy$-plane and the point is on the equator. Set $\theta = 0$ — the point jumps onto the $+z$-axis, whatever $\phi$ is.`,
      t`Change $\phi$ and watch $\hat r$, $\hat\theta$, $\hat\phi$ turn with the point: unlike $\hat\imath$, $\hat\jmath$, $\hat k$, these unit vectors are different at every point.`,
      t`Show the small coordinate box: its edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$. Bring $\theta$ toward $0$ and the $\phi$-edge shrinks to nothing — circles of latitude are small near the pole.`,
    ],
    params: { system: 'spherical', choose: true, point: [2.4, 55, 40], elementToggle: true, readouts: ['x', 'y', 'z'] },
    caption: t`Drag to rotate; scroll or pinch to zoom. Physics convention: $\theta$ down from $+z$, $\phi$ around from $+x$. Surfaces are drawn to a finite size; the readouts give the same point in Cartesian coordinates.`,
  },
  example: {
    prompt: t`Kennedy Space Center is at latitude $28.573^\circ$ N, longitude $80.649^\circ$ W. Treat Earth as a sphere of radius $6371$ km, with $+z$ toward the North Pole and $+x$ toward longitude $0^\circ$ on the equator. Find the site’s spherical angles $\theta$ and $\phi$, and its Cartesian coordinates.`,
    visual: still('spherical', [2.6, 61.427, 279.351], { surfaces: ['r'], basis: false }, 'Drag to rotate. The launch site on a sphere of radius 6371 km (drawn at radius 2.6). Physics convention: θ down from +z, φ around from +x.'),
    steps: [
      { label: 'Latitude is not theta', text: t`Latitude is measured up from the equator; $\theta$ is measured down from the pole. So $\theta = 90^\circ - 28.573^\circ = 61.427^\circ$.` },
      { label: 'Longitude is phi', text: t`Longitude is the azimuth, with east positive. $80.649^\circ$ W is $\phi = -80.649^\circ$, or equivalently $\phi = 360^\circ - 80.649^\circ = 279.351^\circ$.` },
      { label: 'Distance from the axis', text: t`$\rho = r\sin\theta = 6371\times\sin 61.427^\circ = 6371\times0.8782 = 5595$ km: the radius of the circle the site rides round on each day.` },
      { label: 'Cartesian coordinates', text: t`$x = \rho\cos\phi = 5595\times0.1625 = 909$ km, $\ y = \rho\sin\phi = 5595\times(-0.9867) = -5521$ km, $\ z = r\cos\theta = 6371\times0.4783 = 3047$ km.` },
      { label: 'Sense check', text: t`$909^2 + 5521^2 + 3047^2 = 6371^2$ ✓. $z > 0$ for the northern hemisphere and $y < 0$ for western longitudes ✓. (Real navigation uses an ellipsoidal Earth, which shifts these numbers by up to about 20 km.)` },
    ],
    answer: t`$\theta = 61.43^\circ$, $\phi = 279.35^\circ$ (or $-80.65^\circ$), and $(x, y, z) \approx (909, -5521, 3047)$ km.`,
  },
  practice: [
    num({
      id: 'cyl-to-cart', difficulty: 1,
      gen(r) {
        const rho = r.pick([2, 4, 6]), ph = r.pick([30, 60, 120, 150, 210, 240, 300, 330]), z = r.int(-3, 3), which = r.pick(['x', 'y']);
        const val = which === 'x' ? rho * Math.cos(ph * D) : rho * Math.sin(ph * D), other = which === 'x' ? rho * Math.sin(ph * D) : rho * Math.cos(ph * D);
        return {
          prompt: t`A point has cylindrical coordinates $(\rho, \phi, z) = (${rho},\ ${ph}^\circ,\ ${z})$. What is its $${which}$-coordinate? Give 3 significant figures.`,
          answer: val, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: other, feedback: t`$x = \rho\cos\phi$ and $y = \rho\sin\phi$: you used the other one.` }].filter((e) => Math.abs(e.value - val) > 0.01),
          hints: [t`$${which} = \rho${which === 'x' ? '\\cos' : '\\sin'}\phi$.`],
          teach: 'Cylindrical coordinates are polar coordinates in the floor, plus the height z.',
          explain: t`$${which} = ${rho}${which === 'x' ? '\\cos' : '\\sin'}${ph}^\circ = ${nice(val, 3)}$.`,
          visual: still('cylindrical', [Math.min(rho / 2, 2.6), ph, z / 2], { basis: false }, 'Drag to rotate. The point where its three coordinate surfaces meet (drawn at half scale).'),
        };
      },
    }),
    num({
      id: 'sph-to-z', difficulty: 2,
      gen(r) {
        const rr = r.pick([2, 4, 5, 8]), th = r.pick([30, 45, 60, 120, 135, 150]), ph = r.pick([30, 45, 60, 200]);
        const z = rr * Math.cos(th * D);
        const errors = [{ value: rr * Math.sin(th * D), feedback: t`$r\sin\theta$ is the distance from the $z$-axis. Height is $z = r\cos\theta$, since $\theta$ is measured from $+z$.` }, { value: rr * Math.cos(ph * D), feedback: t`In this course $\theta$ is the polar angle and $\phi$ the azimuth; calculus texts that swap them would write this as $\rho\cos\phi$.` }];
        return {
          prompt: t`A point has spherical coordinates $(r, \theta, \phi) = (${rr},\ ${th}^\circ,\ ${ph}^\circ)$ (physics convention). How high is it above the $xy$-plane — what is $z$? Give 3 significant figures.`,
          answer: z, tol: { rel: 0.005, abs: 0.005 },
          errors: errors.filter((e) => Math.abs(e.value - z) > 0.01),
          hints: [t`$\theta$ is measured down from the $+z$-axis.`, t`$z = r\cos\theta$.`],
          teach: 'With θ measured from +z, the height is z = r cos θ and the distance from the axis is ρ = r sin θ.',
          explain: t`$z = ${rr}\cos${th}^\circ = ${nice(z, 3)}$${th > 90 ? ' — negative, because θ > 90° puts the point below the xy-plane' : ''}.`,
          visual: still('spherical', fitSph(rr / 2, th, ph), { basis: false, surfaces: ['theta'] }, 'Drag to rotate. The cone θ = const through the point (distances at half scale).'),
        };
      },
    }),
    num({
      id: 'cart-to-theta', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), p = signed(r, [a, b, c]);
        const th = deg(Math.acos(p[2] / L));
        const lat = 90 - th;
        const [rr, , ph] = [L, 0, (deg(Math.atan2(p[1], p[0])) + 360) % 360];
        return {
          prompt: t`Find the polar angle $\theta$ (physics convention, measured from $+z$) of the point $${pointTeX(p)}$, in degrees to one decimal place.`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: lat, feedback: t`That is measured from the $xy$-plane, like a latitude. $\theta$ is measured from the $+z$-axis: $\cos\theta = z/r$.` }, { value: deg(Math.atan2(p[1], p[0])), feedback: t`That is the azimuth $\phi$, the angle around the $z$-axis.` }].filter((e) => Math.abs(e.value - th) > 0.2),
          hints: [t`$r = \sqrt{x^2 + y^2 + z^2} = ${L}$.`, t`$\cos\theta = z/r = ${p[2]}/${L}$.`],
          teach: 'The polar angle comes from the height: cos θ = z / r.',
          explain: t`$r = ${L}$ and $\cos\theta = \frac{${p[2]}}{${L}}$, so $\theta = ${nice(th, 4)}^\circ$${th > 90 ? ' (more than 90°: the point is below the xy-plane)' : ''}.`,
          visual: still('spherical', [Math.min(rr / 3.5, 2.6), +th.toFixed(2), +ph.toFixed(2)], { basis: false, surfaces: ['r'], angles: false }, 'Drag to rotate. The point on its sphere r = const (scaled to fit).'),
        };
      },
    }),
    mcq({
      id: 'theta-surface', difficulty: 2,
      prompt: t`In spherical coordinates (physics convention), what surface is $\theta = \pi/4$?`,
      choices: [t`A cone about the $z$-axis, opening upward, with half-angle $45^\circ$`, t`A half-plane through the $z$-axis, $45^\circ$ round from $+x$`, t`A sphere of radius $\pi/4$`, t`A plane through the origin tilted $45^\circ$ from the $xy$-plane`],
      answer: 0,
      why: {
        1: t`A half-plane through the $z$-axis is $\phi = \text{const}$; fixing the azimuth is a different condition.`,
        2: t`$r = \text{const}$ is a sphere. $\theta$ is an angle, not a distance.`,
        3: t`A tilted plane does not keep a fixed angle with the $z$-axis: its points are at many different angles from $+z$.`,
      },
      hints: ['Every point with θ = 45° is at 45° from the +z-axis. Where are all such points?', 'Sweep the one point shown in the picture around the z-axis and out along its ray.'],
      teach: 'Fixing the polar angle θ gives a cone about the z-axis; fixing φ gives a half-plane; fixing r gives a sphere.',
      explain: t`All points at $45^\circ$ from $+z$ form a cone about the $z$-axis with half-angle $45^\circ$: in Cartesian form $z = \sqrt{x^2 + y^2}$. (For $\theta > 90^\circ$ the cone opens downward, and $\theta = 90^\circ$ is the $xy$-plane.)`,
      visual: still('spherical', [2.2, 45, 30], { basis: false, surfaces: [], curves: false }, 'Drag to rotate. One point with θ = 45°, and the angle θ measured from the +z-axis.'),
    }),
    expr({
      id: 'to-cartesian', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 4, 6]);
        const eq = `x^2 + y^2 + z^2 = ${k}z`;
        return {
          prompt: t`Write the surface $r = ${k}\cos\theta$ (spherical, physics convention) in Cartesian coordinates.`,
          answer: eq, answerTeX: eq,
          vars: { x: [-1, 1], y: [-1, 1], z: [0.5, 2] }, mode: 'equation', keys: [['=', '=']],
          errors: [{ answer: `x^2 + y^2 + z^2 = ${k}*x`, feedback: t`$r\cos\theta$ is $z$, not $x$: $\theta$ is measured from the $z$-axis.` }, { answer: `sqrt(x^2 + y^2 + z^2) = ${k}*z`, feedback: t`Multiply both sides by $r$ first: $r^2 = ${k}\,r\cos\theta$ becomes $x^2 + y^2 + z^2 = ${k}z$.` }],
          hints: [t`Multiply both sides by $r$: $r^2 = ${k}\,r\cos\theta$.`, t`Use $r^2 = x^2 + y^2 + z^2$ and $r\cos\theta = z$.`],
          teach: 'To convert, make the combinations r², r cos θ and r sin θ cos φ appear, then replace them by Cartesian expressions.',
          explain: t`$r^2 = ${k}\,r\cos\theta$ gives $x^2 + y^2 + z^2 = ${k}z$, and completing the square, $x^2 + y^2 + (z - ${k / 2})^2 = ${(k * k) / 4}$: a sphere of radius $${k / 2}$ centred at $(0, 0, ${k / 2})$, resting on the origin.`,
          visual: { type: 'graph', params: { x: [-k * 0.8, k * 0.8], y: [-0.3 * k, 1.15 * k], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'z', curves: [{ param: [`${k}*cos(t)*sin(t)`, `${k}*cos(t)^2`], t: [0, Math.PI], color: 'accent' }], points: [{ x: 0, y: 0, color: 'gold', label: 'origin' }] }, caption: t`The surface’s cross-section in the plane $y = 0$ ($x$ across, $z$ up), traced as $\theta$ runs from $0$ to $\pi$.` },
        };
      },
    }),
    mcq({
      id: 'convention', difficulty: 2,
      prompt: t`A calculus textbook writes spherical coordinates as $(\rho, \theta, \phi)$, with $\rho$ the distance from the origin, $\theta$ the azimuth and $\phi$ the angle from $+z$. It gives a point as $(\rho, \theta, \phi) = (5,\ 60^\circ,\ 30^\circ)$. What are its coordinates $(r, \theta, \phi)$ in this course’s physics convention?`,
      choices: [t`$(5,\ 30^\circ,\ 60^\circ)$`, t`$(5,\ 60^\circ,\ 30^\circ)$`, t`$(4.33,\ 30^\circ,\ 60^\circ)$`, t`$(5,\ 60^\circ,\ 60^\circ)$`],
      answer: 0,
      why: {
        1: t`Same symbols, different meanings: the textbook’s $\theta$ is the azimuth, which this course calls $\phi$. The two angles must swap places.`,
        2: t`The distance from the origin is the same in both conventions: $r = \rho_\text{text} = 5$. ($4.33 = 5\sin 60^\circ$ would be a distance from an axis.)`,
        3: t`Neither convention measures this angle from the $xy$-plane; the textbook’s $\phi = 30^\circ$ is already the angle from $+z$, our $\theta$.`,
      },
      hints: ['Match each number to its meaning, not to its letter.', t`Angle from $+z$: $30^\circ$. Azimuth: $60^\circ$.`],
      teach: 'Convert between conventions by meaning: distance from the origin, angle from +z, angle around z.',
      explain: t`Distance $5$; angle from $+z$ is $30^\circ$ — our $\theta$; azimuth $60^\circ$ — our $\phi$. So $(r, \theta, \phi) = (5, 30^\circ, 60^\circ)$, and both conventions give the same point, $(x, y, z) = (1.25, 2.17, 4.33)$.`,
    }),
    mcq({
      id: 'theta-hat', difficulty: 3,
      prompt: t`At the point on the positive $x$-axis — $\theta = 90^\circ$, $\phi = 0$ — which way does the unit vector $\hat\theta$ point?`,
      choices: [t`Straight down, along $-\hat k$`, t`Straight up, along $+\hat k$`, t`Along $+\hat\imath$, away from the origin`, t`Along $+\hat\jmath$`],
      answer: 0,
      why: {
        1: t`$\theta$ is measured **down** from the north pole, so increasing it moves you south — at the equator, straight down.`,
        2: t`That is $\hat r$, the direction in which $r$ grows.`,
        3: t`That is $\hat\phi$, the direction in which $\phi$ grows (east, on a globe).`,
      },
      hints: [t`$\hat\theta$ points the way the point moves when $\theta$ increases a little, with $r$ and $\phi$ fixed.`, t`From the equator, increasing $\theta$ moves toward the south pole.`],
      teach: 'Each unit vector points where the point moves when only its coordinate increases — so they change direction from place to place.',
      explain: t`$\hat\theta = \langle\cos\theta\cos\phi,\ \cos\theta\sin\phi,\ -\sin\theta\rangle = \langle 0, 0, -1\rangle$ at $\theta = 90^\circ$, $\phi = 0$: straight down. At the north pole the same symbol points along the floor. That basis vectors turn from point to point is exactly what Christoffel symbols track in general relativity.`,
      visual: still('spherical', [2, 90, 0], { basis: false, surfaces: ['r'] }, 'Drag to rotate. The point on the positive x-axis, with the sphere through it.'),
    }),
    num({
      id: 'degree-longitude', difficulty: 3,
      gen(r) {
        const [place, lat] = r.pick([['Quito', 0.2], ['Cairo', 30.0], ['Minneapolis', 45.0], ['London', 51.5], ['Oslo', 59.9], ['Reykjavik', 64.1], ['Longyearbyen, Svalbard', 78.2]]);
        const L = R_E * Math.cos(lat * D) * D;
        return {
          prompt: t`How far east do you travel when your longitude increases by $1^\circ$ at ${place}, latitude $${lat}^\circ$? Take Earth as a sphere of radius $6371$ km.`,
          answer: L, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: R_E * D, feedback: t`That is a degree along the equator (or along a meridian). Along a circle of latitude the distance is $r\sin\theta\,d\phi$, smaller toward the poles.` }, { value: R_E * Math.sin(lat * D) * D, feedback: t`$\sin\theta$ uses the polar angle $\theta = 90^\circ - \text{latitude}$, so $\sin\theta = \cos(\text{latitude})$.` }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`Changing $\phi$ by $d\phi$ moves you $r\sin\theta\,d\phi$ — along a circle of radius $r\sin\theta$.`, t`$\theta = 90^\circ - ${lat}^\circ$, and $d\phi = 1^\circ = \pi/180$ rad.`],
          teach: 'A change dφ in azimuth covers r sin θ dφ: the scale factor r sin θ is the radius of the circle you move along.',
          explain: t`$r\sin\theta\,d\phi = 6371\times\sin(${nice(90 - lat, 4)}^\circ)\times\frac{\pi}{180} = ${fmt(L, 3)}$ km, against $111.2$ km on the equator. Scale factors like this $r\sin\theta$ are the components of the metric, $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$.`,
          visual: still('spherical', [2.4, +(90 - lat).toFixed(1), 30], { surfaces: ['r'], basis: false, element: true }, 'Drag to rotate. A small coordinate box on the sphere at this latitude: its φ-edge is r sin θ dφ long.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sph-to-x', difficulty: 2,
      gen(r) {
        const rr = r.pick([2, 3, 4, 6]), th = r.pick([30, 60, 120, 150]), ph = r.pick([45, 135, 225, 315]);
        const x = rr * Math.sin(th * D) * Math.cos(ph * D);
        return {
          prompt: t`Convert $(r, \theta, \phi) = (${rr},\ ${th}^\circ,\ ${ph}^\circ)$ (physics convention) to Cartesian coordinates. What is $x$? Give 3 significant figures.`,
          answer: x, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: rr * Math.cos(th * D) * Math.cos(ph * D), feedback: t`$x = r\sin\theta\cos\phi$: the distance from the axis, $r\sin\theta$, times $\cos\phi$.` }, { value: rr * Math.sin(ph * D) * Math.cos(th * D), feedback: t`The angles have been swapped — that is the calculus-text convention. Here $\theta$ is the polar angle.` }].filter((e) => Math.abs(e.value - x) > 0.01),
          hints: [t`$x = r\sin\theta\cos\phi$.`],
          teach: 'x = r sin θ cos φ: first the distance from the z-axis, then its share along x.',
          explain: t`$x = ${rr}\sin${th}^\circ\cos${ph}^\circ = ${nice(x, 3)}$.`,
          visual: still('spherical', [rr / 2.4, th, ph], { basis: false }, 'Drag to rotate. The point and its three coordinate surfaces (distances scaled to fit).'),
        };
      },
    }),
    expr({
      id: 'cp-cylinder', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 4, 6]), axis = r.pick(['x', 'y']);
        const fn = axis === 'x' ? 'cos' : 'sin', fnT = axis === 'x' ? '\\cos' : '\\sin';
        return {
          prompt: t`Write the surface $x^2 + y^2 = ${k}${axis}$ in cylindrical coordinates, as $\rho$ in terms of $\phi$.`,
          answer: `${k}*${fn}(phi)`, answerTeX: t`${k}${fnT}\phi`, lhs: '\\rho',
          vars: { phi: axis === 'x' ? [-1.2, 1.2] : [0.3, 2.8] }, keys: [['φ', 'phi']],
          errors: [{ answer: `${k}*${fn === 'cos' ? 'sin' : 'cos'}(phi)`, feedback: t`$${axis} = \rho${fnT}\phi$.` }, { answer: `sqrt(${k}*${fn}(phi))`, feedback: t`$x^2 + y^2 = \rho^2$, and $\rho^2 = ${k}\rho${fnT}\phi$ divides by $\rho$ to give $\rho$, not $\rho^2$.` }],
          hints: [t`$x^2 + y^2 = \rho^2$ and $${axis} = \rho${fnT}\phi$.`, t`$\rho^2 = ${k}\rho${fnT}\phi$; divide by $\rho$.`],
          teach: 'Replace x² + y² by ρ² and x, y by ρ cos φ, ρ sin φ, then simplify.',
          explain: t`$\rho^2 = ${k}\rho${fnT}\phi$, so $\rho = ${k}${fnT}\phi$: a circular cylinder of radius $${k / 2}$ standing on the circle through the origin centred at $${axis === 'x' ? `(${k / 2}, 0)` : `(0, ${k / 2})`}$.`,
          visual: { type: 'graph', params: { x: [-k * 0.9, k * 1.1], y: [-k * 0.9, k * 1.1], equal: true, aspect: 'square', curves: [{ param: [axis === 'x' ? `${k / 2} + ${k / 2}*cos(t)` : `${k / 2}*cos(t)`, axis === 'x' ? `${k / 2}*sin(t)` : `${k / 2} + ${k / 2}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent' }] }, caption: 'The surface seen from above: every horizontal slice is this circle, so it is a vertical cylinder.' },
        };
      },
    }),
    num({
      id: 'cp-star', difficulty: 3, transfer: true,
      gen(r) {
        const [name, dist, ra, dec] = r.pick(STARS), z = dist * Math.sin(dec * D);
        return {
          prompt: t`Astronomers locate stars by spherical coordinates centred on the Sun: right ascension (an azimuth), declination (an angle above the celestial equator, like a latitude) and distance. ${name} has declination $${dec}^\circ$ and is $${dist}$ pc away. How far is it from the plane of the celestial equator — what is its $z$-coordinate, with $+z$ toward the north celestial pole? Give 3 significant figures, with a sign.`,
          answer: z, units: 'pc', tol: { rel: 0.005 },
          errors: [{ value: dist * Math.cos(dec * D), feedback: t`That is the distance from the polar axis, $r\sin\theta$. With $\theta = 90^\circ - \delta$, the height is $z = r\cos\theta = r\sin\delta$.` }],
          hints: [t`Declination $\delta$ is measured up from the equator, so $\theta = 90^\circ - \delta$.`, t`$z = r\cos\theta = r\sin\delta$.`],
          teach: 'Declination, like latitude, is 90° minus the polar angle θ.',
          explain: t`$\theta = 90^\circ - (${dec}^\circ) = ${nice(90 - dec, 5)}^\circ$, so $z = ${dist}\cos(${nice(90 - dec, 5)}^\circ) = ${nice(z, 3)}$ pc${z < 0 ? ', south of the celestial equator' : ''}. Its right ascension, $${nice(ra, 5)}^\circ$, would fix $x$ and $y$.`,
          visual: still('spherical', [2.5, +(90 - dec).toFixed(2), ra], { basis: false, surfaces: ['theta'] }, 'Drag to rotate. The star’s direction from the Sun on the cone of fixed polar angle (distance not to scale).'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.7 Cylindrical and Spherical Coordinates (note: uses the swapped, mathematics convention)', url: 'https://openstax.org/books/calculus-volume-3/pages/2-7-cylindrical-and-spherical-coordinates' },
    { label: 'ISO 80000-2:2019, item 2-17.3 (spherical coordinates r, ϑ, φ)', url: 'https://www.iso.org/standard/64973.html' },
    { label: 'SIMBAD astronomical database (star positions, J2000)', url: 'https://simbad.cds.unistra.fr/simbad/' },
  ],
});
