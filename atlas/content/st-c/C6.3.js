// Parallel transport and holonomy on the sphere: the transported vector has
// no tangential derivative; its angle to a curve changes at the rate −κg;
// round a loop it returns turned by ∬K dA. Latitude loops, geodesic
// triangles, small loops on a torus, the Foucault pendulum, a cosmic-string
// cone (hypothetical).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const ARCSEC = 180 * 3600 / Math.PI;
const SIDEREAL_H = 23.9345;   // sidereal day, hours

export default lesson({
  id: 'st-c.C6.3',
  title: 'Parallel transport and holonomy on the sphere',
  minutes: 14, difficulty: 3,
  equation: t`\Delta\alpha = \iint_R K\,dA`,
  intro: t`To carry a tangent vector $\mathbf V$ along a curve on a surface **without turning it**, insist that its rate of change has no part in the tangent plane: $\mathbf V'$ points along $\mathbf n$, only as much as is needed to keep $\mathbf V$ tangent. That is **parallel transport** (the Levi-Civita connection of C12, seen from outside). Two facts follow. Along a geodesic, $\mathbf V$ keeps a constant angle with the path. Along any curve, the angle $\alpha$ from the path’s direction to $\mathbf V$ changes at the rate $d\alpha/ds = -\kappa_g$ — the vector does not steer, so it falls behind a curve that does.

Carry $\mathbf V$ once round a loop that bounds a region $R$ (anticlockwise, seen from outside) and it comes back rotated by the **holonomy angle** $\Delta\alpha$ above — on a sphere of radius $a$, by the enclosed area divided by $a^2$. On a flat surface $\Delta\alpha = 0$ for every loop. You met this in gr.S13.i; here you compute it from $\kappa_g$, prove it for triangles, and use it on other surfaces.`,
  symbols: [
    { tex: t`\Delta\alpha`, text: 'the holonomy angle: how far the transported vector has turned, anticlockwise, after one circuit (defined up to whole turns)' },
    { tex: 'R', text: 'the region the loop encloses, on its left' },
    { tex: 'K', text: t`the Gaussian curvature, in $\text{m}^{-2}$` },
    { tex: 'dA', text: t`the area element $\sqrt{EG - F^2}\,du\,dv$` },
  ],
  why: t`Holonomy is how curvature is *measured*: the Riemann tensor (C15) is defined as the rotation per unit area of a tiny loop, and Gravity Probe B’s gyroscopes measured the holonomy of Earth’s spacetime, 6.6 arcseconds a year (gr.S13.d).`,
  visual: {
    type: 'gr-sphere-transport',
    title: 'A vector carried round a circle of latitude',
    lead: t`The arrow is carried eastward round the circle of latitude $\lambda$, never turned. Press Play, then compare the arrow’s final direction with its start.`,
    tasks: [
      t`At $\lambda = 60^\circ$ the arrow comes back turned by $2\pi(1 - \sin 60^\circ) = 48.2^\circ$ — the cap’s area divided by $R^2$.`,
      t`Lower the circle toward the equator: the turn grows to $360^\circ$ at the equator itself, which is the same as no turn at all — the equator is a geodesic.`,
      t`Watch the arrow against local north as it goes: it drifts steadily clockwise. That drift, $360^\circ\sin\lambda$ per circuit, is what a Foucault pendulum shows.`,
    ],
    params: { mode: 'cap', lat: 60, progress: 0 },
    caption: t`A sphere of radius $R = 1$. The circle at latitude $\lambda$ has colatitude $\theta_0 = 90^\circ - \lambda$; the cap above it has area $2\pi R^2(1 - \sin\lambda)$.`,
  },
  example: {
    prompt: t`Using $d\alpha/ds = -\kappa_g$, find the holonomy of the circle of latitude at colatitude $\theta_0$ on a sphere of radius $a$, and check it against the cap’s area. Evaluate it for Paris ($\lambda = 48.85^\circ$N).`,
    visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 49, progress: 1, readout: false }, caption: 'The arrow carried once round the parallel at 49°N, shown back at its start.' },
    steps: [
      { label: 'Geodesic curvature', text: t`From C6.2, the parallel has $\kappa_g = \cot\theta_0/a$ (turning toward the pole, i.e. to the left going east) and length $L = 2\pi a\sin\theta_0$.` },
      { label: 'Angle to the path', text: t`$\alpha$ changes by $-\kappa_g L = -\dfrac{\cot\theta_0}{a}\cdot 2\pi a\sin\theta_0 = -2\pi\cos\theta_0$ over one circuit.` },
      { label: 'Back at the start', text: t`The path’s direction is the same as when it set out, so $\mathbf V$ has turned by $\Delta\alpha = -2\pi\cos\theta_0$, i.e. by $2\pi(1 - \cos\theta_0)$ once a whole turn is added.` },
      { label: 'Check with area', text: t`The cap has area $2\pi a^2(1 - \cos\theta_0)$ and $K = 1/a^2$: $\iint K\,dA = 2\pi(1 - \cos\theta_0)$ ✓.` },
      { label: 'Paris', text: t`$\theta_0 = 41.15^\circ$: $\Delta\alpha = 360^\circ(1 - \cos 41.15^\circ) = 88.9^\circ$ — equivalently $-271.1^\circ$: relative to the ground the vector drifts $360^\circ\sin\lambda = 271.1^\circ$ clockwise per circuit.` },
    ],
    answer: t`$\Delta\alpha = 2\pi(1 - \cos\theta_0)$ (mod $2\pi$), equal to the cap’s area over $a^2$; for Paris, $88.9^\circ$, i.e. $271.1^\circ$ clockwise.`,
  },
  practice: [
    mcq({
      id: 'along-geodesic', difficulty: 1,
      prompt: 'A vector is parallel-transported along a great circle on a sphere. What happens to the angle between the vector and the direction of travel?',
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, progress: 0.25, readout: false }, caption: 'The arrow part of the way down a meridian (a great circle) from the pole.' },
      choices: ['It stays constant', 'It increases steadily, by the area swept out', 'It decreases steadily', 'It depends on the vector’s length'],
      answer: 0,
      why: {
        1: t`Area only enters for a closed loop. Along a single geodesic $\kappa_g = 0$, so $d\alpha/ds = 0$.`,
        2: t`That would happen on a path that turns to the left ($\kappa_g > 0$), not a geodesic.`,
        3: 'Parallel transport is linear: lengths are kept and do not affect angles.',
      },
      hints: [t`$d\alpha/ds = -\kappa_g$, and a great circle is a geodesic.`],
      teach: 'Along a geodesic, a parallel-transported vector keeps a constant angle with the path.',
      explain: t`With $\kappa_g = 0$ the angle is constant. That is how holonomy round a geodesic triangle is computed: constant angles along each side, and all the change happens at the corners.`,
    }),
    num({
      id: 'pole-triangle', difficulty: 2,
      gen(r) {
        const dphi = r.pick([30, 45, 60, 90, 120]);
        return {
          prompt: t`An arrow is carried from the North Pole down a meridian to the equator, along the equator through $${dphi}^\circ$ of longitude, and back up to the pole. By how many degrees has it turned?`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi, colat: 90, colatSlider: false, transport: false, readout: false }, caption: 'The geodesic triangle (gold) the arrow is carried round.' },
          answer: dphi, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 180 + dphi, feedback: t`The angle sum is $180^\circ + ${dphi}^\circ$; the holonomy is the *excess* over $180^\circ$.` }, { value: 360 - dphi, feedback: 'Check the orientation: the triangle is travelled anticlockwise seen from outside, so the arrow turns anticlockwise by the enclosed area.' }].filter((e) => Math.abs(e.value - dphi) > 0.02 * dphi),
          hints: [t`The triangle has angles $90^\circ$, $90^\circ$ and $${dphi}^\circ$; its area on a unit sphere is the angle excess.`, t`Holonomy $= \iint K\,dA = $ area $/a^2$.`],
          teach: 'Round a geodesic triangle the holonomy equals the angle excess, which equals the area over a².',
          explain: t`The triangle covers $${dphi}/360$ of the northern hemisphere, area $2\pi a^2\cdot\tfrac{${dphi}}{360}$, so $\Delta\alpha = 2\pi\cdot\tfrac{${dphi}}{360}$ rad $= ${dphi}^\circ$ — equal to the excess $90 + 90 + ${dphi} - 180$.`,
        };
      },
    }),
    num({
      id: 'cap-holonomy', difficulty: 2,
      gen(r) {
        const colat = r.pick([20, 30, 45, 60, 75]);
        const h = 360 * (1 - Math.cos(colat * DEG));
        return {
          prompt: t`An arrow is carried once round the circle of latitude at colatitude $\theta_0 = ${colat}^\circ$ (that is, $${90 - colat}^\circ$N), eastward. By how many degrees has it turned, anticlockwise, when it returns? Give a value between $0$ and $360^\circ$.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 90 - colat, transport: false, readout: false }, caption: 'The loop the arrow is carried round.' },
          answer: h, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 360 * Math.cos(colat * DEG), feedback: t`$2\pi\cos\theta_0$ is how much the arrow fell behind the path’s direction; add the path’s own full turn: $\Delta\alpha = 2\pi - 2\pi\cos\theta_0$.` }, { value: 360 * Math.sin(colat * DEG), feedback: t`Use colatitude with cosine: the cap’s area is $2\pi a^2(1 - \cos\theta_0)$.` }].filter((e) => Math.abs(e.value - h) > 0.02 * h),
          hints: [t`The cap above the circle has area $2\pi a^2(1 - \cos\theta_0)$ and $K = 1/a^2$.`],
          teach: t`Round a circle of colatitude $\theta_0$ the holonomy is $2\pi(1 - \cos\theta_0)$, the cap’s area over $a^2$.`,
          explain: t`$\Delta\alpha = 360^\circ(1 - \cos ${colat}^\circ) = ${nice(h, 4)}^\circ$. As $\theta_0 \to 0$ the loop shrinks and the turn vanishes — at a rate of $K$ per unit area.`,
        };
      },
    }),
    num({
      id: 'foucault-period', difficulty: 3,
      gen(r) {
        const [city, lat] = r.pick([['Paris (the Panthéon, 1851)', 48.85], ['Oslo', 59.91], ['Boston', 42.36], ['Houston', 29.76], ['Reykjavík', 64.15]]);
        const T = SIDEREAL_H / Math.sin(lat * DEG);
        return {
          prompt: t`A Foucault pendulum’s swing plane is carried round the latitude circle by the Earth’s rotation once per sidereal day ($23.93$ h). Relative to the ground it turns by $360^\circ\sin\lambda$ per day. How long does it take to turn a full $360^\circ$ in ${city}, latitude $${lat}^\circ$N, in hours?`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: Math.round(lat), progress: 0.4, readout: false }, caption: 'The pendulum’s site carried round its latitude circle by the Earth’s rotation; the arrow is its swing plane.' },
          answer: T, units: 'h', tol: { rel: 0.003 },
          errors: [{ value: SIDEREAL_H / Math.cos(lat * DEG), feedback: t`At the pole the period is one day and at the equator it is infinite: the factor is $\sin\lambda$, with latitude.` }, { value: SIDEREAL_H * Math.sin(lat * DEG), feedback: t`The turn per day is $360^\circ\sin\lambda$, so a full turn takes $1/\sin\lambda$ days — divide, don’t multiply.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: [t`A full turn needs $1/\sin\lambda$ sidereal days.`, t`$\sin ${lat}^\circ = ${nice(Math.sin(lat * DEG), 4)}$.`],
          teach: 'A Foucault pendulum’s plane precesses by the holonomy of its latitude circle, 360° sin λ per sidereal day.',
          explain: t`$T = 23.93/\sin ${lat}^\circ = ${nice(T, 4)}$ h. The pendulum’s plane is (very nearly) parallel-transported, so it shows the holonomy $2\pi(1 - \sin\lambda) \equiv -2\pi\sin\lambda$: clockwise in the north. The usual derivation uses the Coriolis force; the two agree because both describe a frame turning with the Earth.`,
        };
      },
    }),
    num({
      id: 'small-loop', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3]), rr = 1, side = r.pick([0.1, 0.2]), where = r.pick(['outer', 'inner']);
        const K = where === 'outer' ? 1 / (rr * (R + rr)) : -1 / (rr * (R - rr));
        const A = side * side, ang = (K * A) / DEG;
        return {
          prompt: t`On a torus with $R = ${R}$ m and $r = ${rr}$ m, a small square loop of side $${side}$ m sits on the ${where} equator, where $K = ${where === 'outer' ? t`1/\big(r(R + r)\big)` : t`-1/\big(r(R - r)\big)`}$. A vector carried once round it anticlockwise turns by about how many degrees? (Give the sign.)`,
          visual: { type: 'gr-surface', params: { mode: 'loop', surface: 'torus', v: where === 'outer' ? 0 : 3.14, size: 0.2, controls: false, readout: false }, caption: t`A small loop on the ${where} equator of a torus (drawn with $R = 2$, $r = 1$); colour shows $K$.` },
          answer: ang, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: -ang, feedback: where === 'outer' ? t`Outside, $K > 0$: the turn is anticlockwise, positive.` : t`Inside, $K < 0$: the vector turns *clockwise*, so the angle is negative.` }, { value: K * A, feedback: 'That is in radians. Convert to degrees.' }].filter((e) => Math.abs(e.value - ang) > 0.02 * Math.abs(ang)),
          hints: [t`For a small loop, $\Delta\alpha \approx K\times\text{area}$, with $K$ at the loop.`, t`$K = ${nice(K, 4)}\ \text{m}^{-2}$ and the area is $${nice(A)}\ \text{m}^2$.`],
          teach: 'For a small loop, the holonomy is K times the enclosed area: rotation ÷ area measures K.',
          explain: t`$\Delta\alpha \approx ${nice(K, 4)}\times${nice(A)} = ${tex(K * A, 3)}$ rad $= ${nice(ang, 3)}^\circ$. ${where === 'outer' ? 'Anticlockwise, as on a sphere.' : 'Clockwise: on a saddle-like region the vector turns the opposite way.'} This is the definition of curvature C15 generalizes: the Riemann tensor is holonomy per unit area, for loops in every plane.`,
        };
      },
    }),
    mcq({
      id: 'either-region', difficulty: 2,
      prompt: t`A loop on a sphere of radius $a$ divides it into two regions, of areas $A$ and $4\pi a^2 - A$. Which gives the holonomy?`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 40, transport: false, readout: false }, caption: 'A loop on a sphere bounds a small cap and the large region on the other side.' },
      choices: [
        t`Either: going round with the large region on the left reverses the direction of travel, giving $-(4\pi - A/a^2) \equiv A/a^2$ mod $2\pi$`,
        t`Only the smaller region, $A/a^2$`,
        t`Only the larger region, $4\pi - A/a^2$`,
        t`Their sum, $4\pi$, which is the same as $0$`,
      ],
      answer: 0,
      why: {
        1: 'The larger region gives the same answer once the orientation is accounted for; neither is privileged.',
        2: t`$4\pi - A/a^2$ alone has the wrong sign: with the large region on the left you travel the loop the other way.`,
        3: t`The holonomy is one loop’s turn, not the total curvature of the sphere.`,
      },
      hints: [t`The region counted is the one on your left. To have the other region on your left, which way must you go round?`, t`$-4\pi$ is a whole number of turns.`],
      teach: 'Holonomy is defined up to whole turns, and either side of a loop gives the same answer once orientation is respected.',
      explain: t`Reversing the loop negates the holonomy, and $-(4\pi - A/a^2) = A/a^2 - 4\pi \equiv A/a^2$ (mod $2\pi$). The total curvature $4\pi$ of the sphere being a whole number of turns is no accident — it is Gauss–Bonnet (C6.4).`,
    }),
    order({
      id: 'triangle-proof', difficulty: 3,
      prompt: t`Show that a vector carried round a geodesic triangle with interior angles $\alpha_1$, $\alpha_2$, $\alpha_3$ turns by $\alpha_1 + \alpha_2 + \alpha_3 - \pi$. Order the steps.`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 70, colat: 70, progress: 0.6, readout: false }, caption: 'A geodesic triangle, the arrow part of the way round.' },
      items: [
        t`Along each side (a geodesic) the vector keeps a fixed angle with the side.`,
        t`At a corner with interior angle $\alpha_i$, the direction of travel turns left by the exterior angle $\pi - \alpha_i$; the vector does not turn.`,
        t`So the angle from the direction of travel to the vector drops by $\pi - \alpha_i$ at each corner, $3\pi - \sum\alpha_i$ in all.`,
        t`Back at the start the direction of travel is what it was, so the vector itself has turned by $-(3\pi - \sum\alpha_i) = \sum\alpha_i - 3\pi$.`,
        t`Up to a whole turn $2\pi$, that is $\sum\alpha_i - \pi$ — the angle excess.`,
      ],
      hints: ['Track the angle between the vector and the direction of travel, side by side and corner by corner.', 'Holonomy angles are only defined up to whole turns: adding 2π changes nothing.'],
      teach: 'Round a geodesic triangle, the holonomy equals the angle excess Σα − π.',
      explain: t`Combined with the latitude-loop result, this gives $\sum\alpha_i - \pi = \iint K\,dA$ for geodesic triangles — Girard’s theorem on a sphere, and the heart of Gauss–Bonnet (C6.4). On a plane the excess is 0, recovering $180^\circ$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-foucault-rate', difficulty: 2, transfer: true,
      gen(r) {
        const [site, lat] = r.pick([['the Amundsen–Scott South Pole Station', 90], ['McMurdo Station, Antarctica', 77.85], ['the Panthéon in Paris', 48.85], ['Kennedy Space Center, Florida', 28.52]]);
        const rate = (360 / SIDEREAL_H) * Math.sin(lat * DEG);
        return {
          prompt: t`A Foucault pendulum is set swinging at ${site}, latitude $${lat}^\circ$. At what rate does its swing plane turn relative to the floor, in degrees per hour? (The sidereal day is $23.93$ h.)`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: Math.min(85, Math.max(5, Math.round(lat))), progress: 0.2, readout: false }, caption: 'The site carried round its latitude circle by the Earth’s rotation (latitudes beyond 85° drawn at 85°).' },
          answer: rate, units: 'deg/h', tol: { rel: 0.005 },
          errors: [{ value: (360 / 24) * Math.sin(lat * DEG), feedback: 'The Earth turns once relative to the stars in a sidereal day, 23.93 h, not 24 h.' }, { value: (360 / SIDEREAL_H) * Math.cos(lat * DEG), feedback: t`The rate is greatest at the poles: the factor is $\sin\lambda$.` }].filter((e) => Math.abs(e.value - rate) > 0.004 * rate),
          hints: [t`Per sidereal day the plane turns $360^\circ\sin\lambda$; per hour, $(360^\circ/23.93)\sin\lambda$.`],
          teach: 'The Foucault rate is 15.04° sin λ per hour: the holonomy of the latitude circle, spread over a sidereal day.',
          explain: t`$15.04^\circ\times\sin ${lat}^\circ = ${nice(rate, 4)}^\circ$/h${lat === 90 ? ' — at the pole the floor simply turns under a plane fixed relative to the stars; a pendulum run there in 2001 showed it' : ''}. (Real pendulums also precess slightly from elliptical swinging, which careful designs suppress.)`,
        };
      },
    }),
    num({
      id: 'cp-cosmic-string', difficulty: 3, transfer: true,
      gen(r) {
        const mu = r.pick([1e-6, 3e-7, 1e-7]);
        const delta = 8 * Math.PI * mu, arcsec = delta * ARCSEC;
        const muTeX = mu === 1e-6 ? '10^{-6}' : mu === 3e-7 ? t`3\times10^{-7}` : '10^{-7}';
        return {
          prompt: t`**Hypothetical:** a straight cosmic string — a defect some early-universe theories predict, never observed — would leave space around it flat except along the string, but cone-shaped: a plane across it is a disc with a wedge of angle $\delta = 8\pi G\mu/c^2$ removed, where $\mu$ is its mass per length. For $G\mu/c^2 = ${muTeX}$, by how many arcseconds would a vector parallel-transported once round the string turn?`,
          visual: { type: 'graph', params: { x: [-1.3, 1.3], y: [-1.3, 1.3], equal: true, axes: false, grid: false, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0.35, r6(2 * Math.PI - 0.35)], color: 'ink3' }, { param: ['t*cos(0.35)', 't*sin(0.35)'], t: [0, 1], color: 'gold', width: 2.4 }, { param: ['t*cos(0.35)', '-t*sin(0.35)'], t: [0, 1], color: 'gold', width: 2.4 }], points: [{ x: 0, y: 0, label: 'string', r: 3 }] }, caption: 'A plane across the string: cut out the wedge (here hugely exaggerated) and glue the gold edges. Everywhere except the string itself, K = 0.' },
          answer: arcsec, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: delta, feedback: t`That is in radians; convert ($1\ \text{rad} = 206\,265''$).` }, { value: (360 * 3600) - arcsec, feedback: 'That is the angle remaining in the cut disc; the holonomy is the missing wedge.' }].filter((e) => Math.abs(e.value - arcsec) > 0.02 * arcsec),
          hints: [t`A loop round the tip of a cone encloses all the curvature, which sits at the tip: $\iint K\,dA = \delta$.`, t`$\delta = 8\pi\times${muTeX}$ rad.`],
          teach: 'All the curvature of a cone sits at its tip; a loop round it shows a holonomy equal to the deficit angle.',
          explain: t`$\delta = ${tex(delta, 3)}$ rad $= ${nice(arcsec, 3)}''$. The holonomy is the same for every loop round the string, however large — a purely global effect, since $K = 0$ wherever the loop goes. Such a string would make double images of quasars behind it, about $\delta$ apart. Searches have found none, and cosmic-microwave-background data limit $G\mu/c^2$ to below about $10^{-7}$ (gr.S34.d).`,
        };
      },
    }),
    num({
      id: 'cp-planet', difficulty: 3, transfer: true,
      gen(r) {
        const [body, R] = r.pick([['Mars', 3389.5], ['the Moon', 1737.4], ['Mercury', 2439.7]]);
        const A = r.pick([2e5, 4e5, 8e5]);
        const epsDeg = Math.round(((A / (R * R)) / DEG) * 1000) / 1000;
        const Rest = Math.sqrt(A / (epsDeg * DEG));
        return {
          prompt: t`Rovers on ${body} survey a large geodesic triangle of area $${tex(A, 2)}\ \text{km}^2$ and find its angles sum to $180^\circ + ${epsDeg}^\circ$ — equivalently, a vector carried round it returns turned by $${epsDeg}^\circ$. Treating the planet as a sphere, what is its radius, in km?`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 50, colat: 40, colatSlider: false, progress: 1, readout: false }, caption: 'A geodesic triangle and the turned arrow (not to scale).' },
          answer: Rest, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(A / epsDeg), feedback: 'Convert the excess to radians before using A/R² = ε.' }, { value: A / (epsDeg * DEG), feedback: 'That is R², not R: take the square root.' }].filter((e) => Math.abs(e.value - Rest) > 0.01 * Rest),
          hints: [t`$\varepsilon = A/R^2$ with $\varepsilon$ in radians, so $R = \sqrt{A/\varepsilon}$.`, t`$\varepsilon = ${epsDeg}^\circ = ${nice(epsDeg * DEG, 4)}$ rad.`],
          teach: 'Angle excess (or holonomy) over area gives the curvature, and so the radius, from measurements made on the ground.',
          explain: t`$R = \sqrt{${tex(A, 2)}/${nice(epsDeg * DEG, 4)}} = ${nice(Rest, 4)}$ km (${body}’s mean radius is $${R}$ km; the excess was quoted to 0.001°). No look at the horizon, no orbiter: just angles and areas measured on the surface.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Differential Geometry and Forms, ch. 18–19 (parallel transport, holonomy)', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-4', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Planck 2013 results. XXV. Searches for cosmic strings and other topological defects', url: 'https://arxiv.org/abs/1303.5085' },
  ],
});
