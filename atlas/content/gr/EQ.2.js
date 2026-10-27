// The geodesic equation, dissected symbol by symbol: general relativity's law
// of motion for anything in free fall (and, with an affine parameter, for
// light). Conventions: Carroll's, signature (−,+,+,+), x⁰ = ct so every
// coordinate is a length or an angle. Agrees with gr.S12.i (maximal aging)
// and gr.S11.i (the connection as Newton's g).
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, sci, round, table4, fallField } from './_eq.js';

const t = String.raw;

const GEO = t`\frac{d^2x^\mu}{d\tau^2} + \Gamma^\mu{}_{\alpha\beta}\,\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau} = 0`;

// the 16 (α, β) pairs of the sum: diagonal gold, mirror pairs share a colour
const pairs = table4({
  cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => `${i}${j}`)),
  colors: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 'gold' : i < j ? 'accent' : 'violet'))),
  rowName: 'α', colName: 'β', dx: -9,
  caption: t`The 16 index pairs $(\alpha, \beta)$ the sum runs over. Gold: the 4 diagonal pairs. Blue and violet: the 6 off-diagonal pairs and their mirror images, which carry equal Christoffel symbols, $\Gamma^\mu{}_{\alpha\beta} = \Gamma^\mu{}_{\beta\alpha}$.`,
});

// how big the space–space part of the velocity product is next to the time–time part, (v/c)²
const SPEEDS = [['GPS satellite', 3.87e3], ['ISS', 7.66e3], ['Earth around the Sun', 2.98e4], ['the star S2 at its closest to Sgr A*', 7.65e6]];
const speedChart = {
  type: 'graph',
  params: {
    x: [-11, 1.5], y: [0, 5.2], xlabel: 'log₁₀ (v/c)²', ylabel: '', yticks: 0,
    points: [
      ...SPEEDS.map(([name, v], k) => ({ x: round(Math.log10((v / C) ** 2), 4), y: 4.4 - k, color: 'accent', label: name })),
      { x: 0, y: 0.4, color: 'gold', label: 'light', labelDx: -40 },
    ],
    vlines: [{ x: 0, label: 'v = c' }],
  },
  caption: t`For a body moving at speed $v$, the space–space velocity products $u^iu^j$ are smaller than the time–time product $u^0u^0 \approx c^2$ by about $(v/c)^2$, shown here in powers of ten.`,
};

// a free body at rest at some height, and how its worldline compares with a hovering rocket's (schematic)
const thrustPicture = {
  type: 'graph',
  params: {
    x: [-0.3, 4.4], y: [-0.4, 3.3], axes: false, grid: false, xlabel: '', ylabel: '',
    arrows: [{ from: [0, 0], to: [4.2, 0], color: 'ink3', label: 'time', labelDx: -30, labelDy: 12 }, { from: [0, 0], to: [0, 3.1], color: 'ink3', label: 'height', labelDx: 8, labelDy: 0 }],
    curves: [
      { fn: '2.6 - 0.16*x^2', domain: [0, 4.03], color: 'gold', label: 'engine off: a geodesic', labelAt: 2, labelDx: 12, labelDy: -10 },
      { fn: '2.6', domain: [0, 4.1], color: 'accent', label: 'engine on, hovering', labelAt: 0.3 },
    ],
    points: [{ x: 0, y: 2.6, color: 'ink' }],
  },
  caption: 'Schematic. From the same moment and place, a probe with its engine off falls freely along a geodesic; one hovering on its engine departs from the geodesic, and the departure is exactly what its accelerometer reads.',
};

// light and a slower body leaving the same event, with c = 1 so that light runs at 45°
const lightCone = {
  type: 'graph',
  params: {
    x: [-0.1, 6.4], y: [0, 4.45], equal: true, xlabel: 'x (light-seconds)', ylabel: 't (s)',
    curves: [
      { fn: 'x', domain: [0, 4.3], color: 'gold', label: 'light', labelAt: 3.6, labelDx: 10, labelDy: 10 },
      { fn: '2*x', domain: [0, 2.15], color: 'accent', label: 'ball at c/2', labelAt: 2.15, labelDx: 8, labelDy: 0 },
    ],
    points: [
      { x: 0.5774, y: 1.1547, color: 'accent', label: 'τ = 1 s' },
      { x: 1.1547, y: 2.3094, color: 'accent', label: 'τ = 2 s' },
      { x: 1.7321, y: 3.4641, color: 'accent', label: 'τ = 3 s' },
    ],
  },
  caption: 'Two worldlines from the same event, with c = 1 so light runs at 45°. Dots mark each second of the ball’s proper time τ; along the light ray no proper time passes at all.',
};

// surface free-fall: Γ^r_00 ≈ GM/(c²R²)
const BODIES = [
  ['Earth', 3.986e14, 6.371e6], ['the Moon', 4.905e12, 1.737e6], ['Mars', 4.283e13, 3.390e6],
  ['Jupiter (at its cloud tops)', 1.267e17, 6.991e7], ['the Sun', 1.327e20, 6.957e8],
];

export default lesson({
  id: 'gr.EQ.2',
  kind: 'dissection',
  title: 'The geodesic equation',
  minutes: 8, difficulty: 3,
  badges: ['est-der', 'est-obs'],
  equation: t`\part{1}{\frac{d^2x^\mu}{d\tau^2}} + \part{2}{\Gamma^\mu{}_{\alpha\beta}}\,\part{3}{\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau}} = \part{4}{0}`,
  intro: t`This is general relativity's whole law of motion for anything in free fall — a planet, a spacecraft coasting with its engines off, a photon. It replaces Newton's $\vec F = m\vec a$ with gravity as a force: here gravity has moved to the left-hand side, into the geometry, and nothing is left on the right. Its solutions are **geodesics**, the straightest possible worldlines through curved spacetime, and for a massive body they are the worldlines of maximal aging.

Conventions are Carroll's, with signature $(-,+,+,+)$ and $x^0 = ct$, so every coordinate is a length (or an angle). An index that appears twice in one term, once up and once down, is **summed** over $0, 1, 2, 3$. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`\frac{d^2x^\mu}{d\tau^2}`, name: 'the coordinate acceleration', badge: 'est-der', units: t`$\text{m/s}^2$ for a length coordinate`,
      text: t`A worldline is four functions $x^\mu(\tau)$ — when and where the body is — labelled by $\tau$, the **proper time** read by a clock riding along. This term is their second derivative: how the body's coordinates speed up or slow down as its own clock ticks.

The index $\mu$ is **free**: it appears once in every term, so this line is really **four equations**, one for each $\mu = 0, 1, 2, 3$ — the time coordinate $x^0 = ct$ and three space coordinates (such as $x, y, z$ or $r, \theta, \phi$). Using proper time, which every observer agrees on, keeps the equation the same in every coordinate system.`,
      more: t`For light $d\tau = 0$, so proper time cannot label the path. An **affine parameter** $\lambda$ — any label that advances uniformly along the ray — takes its place and the equation keeps exactly this form. A non-uniform relabelling would add a term proportional to $dx^\mu/d\lambda$ on the right.`,
    },
    {
      tex: t`\Gamma^\mu{}_{\alpha\beta}`, name: 'the connection (Christoffel symbols)', badge: 'est-der', units: t`$\text{m}^{-1}$ for length coordinates`,
      text: t`Built from the metric's first derivatives (the next dissection), the Christoffel symbols record how the coordinate grid itself turns and stretches from place to place. They are what general relativity has **instead of a gravitational force**: for slow motion in weak gravity, $\Gamma^i{}_{00} = \partial_i\Phi/c^2$, where $\Phi$ is Newton's potential and the Latin index $i$ runs over the space directions 1, 2, 3 only.

They are **not a tensor**. In a freely falling lab they can all be made zero at your location — the equivalence principle in mathematical form — while polar coordinates on a flat sheet give non-zero ones.`,
      more: t`The upper index $\mu$ says which component of the acceleration a symbol feeds; the lower pair $\alpha\beta$ says which two velocity components it multiplies. Since $\Gamma^\mu{}_{\alpha\beta} = \Gamma^\mu{}_{\beta\alpha}$, each $\mu$ has 10 independent symbols — 40 in all, at every event.`,
    },
    {
      tex: t`\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau}`, name: 'the four-velocity, twice', badge: 'est-der', units: t`$\text{m}^2/\text{s}^2$`,
      text: t`$u^\alpha = dx^\alpha/d\tau$ is the **four-velocity**. The indices $\alpha$ and $\beta$ each appear twice in the term — up here, down in $\Gamma$ — so they are **dummy** indices, summed: $\Gamma^\mu{}_{\alpha\beta}u^\alpha u^\beta$ stands for all $4\times4 = 16$ terms. The term is quadratic in velocity, like the centrifugal and Coriolis terms of a rotating frame.

For anything slow, $u^0 = c\,dt/d\tau \approx c$ dwarfs the space components, so only $\Gamma^i{}_{00}\,c^2 = \partial_i\Phi$ survives. That is how Newton's gravity, which does not care about speed, comes out.`,
      more: t`The four-velocity always has the same length, $g_{\alpha\beta}u^\alpha u^\beta = -c^2$ for a massive body and $0$ for light. The geodesic equation preserves it, so it is imposed once, at the start.`,
    },
    {
      tex: t`0`, name: 'the zero: no force', badge: 'est-obs',
      text: t`Nothing on the right. In Newton's mechanics a falling body obeys $m\ddot{\vec x} = \vec F$ with gravity in $\vec F$; here the right-hand side is **zero for every freely falling body**, whatever its mass or composition, because neither appears anywhere in the equation.

That is the universality of free fall, built in — tested by the MICROSCOPE satellite to about one part in $10^{15}$. A rocket firing its engine replaces the zero by its four-acceleration: the thrust per unit mass its accelerometer reads.`,
      more: t`Setting the first-order change of $\int d\tau$ to zero (the Euler–Lagrange equations of the action) gives exactly this equation: geodesics are worldlines of stationary proper time. For a massive body the stationary value is a local **maximum** — the principle of maximal aging.`,
    },
  ],
  readAloud: t`A freely falling body's coordinates accelerate exactly as much as the turning and stretching of the coordinate grid (the connection) demands from its velocity — and there is no force on the right at all.`,
  why: t`Every orbit, plunge and light ray in the rest of the Road — Mercury's precession, the innermost stable orbit, the photon sphere, lensing — is a solution of this equation.`,
  visual: {
    type: 'orbit',
    title: 'Solutions of the geodesic equation',
    lead: t`For an orbit in the Schwarzschild spacetime the $t$ and $\phi$ parts of the geodesic equation give two conserved quantities, energy and angular momentum $L$; the $r$ part then becomes an orbit equation for $u = 1/r$. The gold curve is its solution, with $G = c = 1$ so radii are in units of $M = GM/c^2$.`,
    tasks: [
      'With L = 4.3, watch the closest approach swing round from one orbit to the next: precession, straight out of the geodesic equation.',
      'Switch on the Newtonian overlay: from the same start, Newton’s ellipse closes on itself.',
      'Lower L to 3.69: the solution crosses the horizon at r = 2M. Nothing pushed it — it is still a geodesic.',
    ],
    params: { mode: 'schwarzschild', r0: 20, L: 4.3, compare: false },
  },
  practice: [
    mcq({
      id: 'which-gravity', difficulty: 1,
      prompt: t`$$\frac{d^2x^\mu}{d\tau^2} + \underbrace{\Gamma^\mu{}_{\alpha\beta}\,\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau}}_{\text{?}} = 0$$ In Newton's language, what does the marked term do?`,
      choices: [
        'It plays the part of gravity: moved to the right-hand side it is the “gravitational acceleration” — but it comes from the geometry of the coordinates, not from a force',
        'It is the push of the engines, which is zero in free fall',
        'It is the body’s mass times its acceleration',
        'It is a drag from spacetime that slowly brakes the body',
      ],
      answer: 0,
      why: {
        1: 'Engines appear on the right-hand side, in place of the zero. The marked term is there even with every engine off.',
        2: 'No mass appears anywhere in the equation; the acceleration is the first term.',
        3: 'Free fall loses no energy to spacetime: the term speeds a body up as readily as it slows it down, as in any orbit.',
      },
      hints: ['Move the marked term to the right-hand side. What would Newton call an acceleration that every body shares, whatever its mass?'],
      teach: 'In the geodesic equation gravity is the Christoffel term: geometry that every body responds to identically, not a force.',
      explain: t`Written as $d^2x^\mu/d\tau^2 = -\Gamma^\mu{}_{\alpha\beta}u^\alpha u^\beta$, the term is the "gravitational acceleration" — for slow motion in weak gravity it is exactly $-\nabla\Phi$, Newton's $\vec g$. But it is built from the coordinate grid, and in a freely falling frame it vanishes at your location.`,
      visual: fallField({ label: 'Earth' }),
    }),
    mcq({
      id: 'count', difficulty: 2,
      prompt: t`$$\frac{d^2x^{\mu}}{d\tau^2} + \Gamma^{\mu}{}_{\alpha\beta}\,\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau} = 0$$ How many separate equations does this line stand for, and how many terms does the sum over $\alpha$ and $\beta$ contain in each?`,
      choices: [
        '4 equations, one for each value of μ; 16 terms in each sum (10 of them distinct)',
        '16 equations, one for each pair α, β; 4 terms in each',
        '1 equation; 64 terms in all',
        '4 equations; 4 terms in each, one for each value of α',
      ],
      answer: 0,
      why: {
        1: 'α and β are summed (each appears once up and once down), so they do not label separate equations; μ does.',
        2: 'μ is free — it is not summed — so each of its four values gives its own equation.',
        3: 'Both α and β are summed, so the sum runs over every pair: 4 × 4 of them.',
      },
      hints: ['A free index appears exactly once in every term and is not summed. Which index is that?', 'α and β each appear twice in one term, once up and once down: both are summed over 0–3.'],
      teach: 'A free index labels separate equations; a repeated (dummy) index is summed.',
      explain: t`$\mu$ is free, so there are four equations ($\mu = 0, 1, 2, 3$). In each, $\alpha$ and $\beta$ run over $0$–$3$: $16$ terms. Because $\Gamma^\mu{}_{\alpha\beta} = \Gamma^\mu{}_{\beta\alpha}$ and $u^\alpha u^\beta = u^\beta u^\alpha$, mirror pairs are equal, leaving $4 + 6 = 10$ distinct terms.`,
      visual: pairs,
    }),
    num({
      id: 'newton-gamma', difficulty: 2,
      gen(r) {
        const [name, GM, R] = r.pick(BODIES);
        const gam = GM / (C * C * R * R);
        return {
          prompt: t`Near a planet or star in nearly Cartesian coordinates, the Christoffel symbol that steers a slow body is $\Gamma^r{}_{00} \approx \dfrac{GM}{c^2 r^2}$ (with $x^0 = ct$; the exact Schwarzschild value has an extra factor $1 - r_s/r$, negligible here). Evaluate it at the surface of ${name}: $GM = ${sci(GM, 4)}\ \text{m}^3/\text{s}^2$, $r = ${sci(R, 4)}$ m, $c = 2.998\times10^{8}$ m/s. Give it in $\text{m}^{-1}$.`,
          answer: gam, units: 'm^-1', tol: { rel: 0.01 },
          errors: [{ value: GM / (C * R * R), feedback: 'Square c: the symbol is GM/(c²r²).' }, { value: GM / (R * R), feedback: 'That is Newton’s g in m/s². Divide by c² to get the Christoffel symbol, in m⁻¹.' }],
          hints: [t`$c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$ and $r^2 = ${sci(R * R, 4)}\ \text{m}^2$.`, t`$\Gamma^r{}_{00} = ${sci(GM, 4)}/(8.988\times10^{16}\times${sci(R * R, 4)})$.`],
          teach: t`For slow bodies only $\Gamma^r{}_{00}$ matters, and $c^2\Gamma^r{}_{00}$ is Newton's $g$: a tiny number per metre, multiplied by the huge $c^2$.`,
          explain: t`$\Gamma^r{}_{00} = ${sci(gam)}\ \text{m}^{-1}$. The geodesic equation multiplies it by $(u^0)^2 \approx c^2$: $c^2\Gamma^r{}_{00} = ${sci(gam * C * C)}\ \text{m/s}^2$ — the familiar surface gravity of ${name}, now as geometry.`,
          visual: fallField({ label: name.split(' ')[0] === 'the' ? name.split(' ')[1] : name.split(' ')[0] }),
        };
      },
    }),
    mcq({
      id: 'slow', difficulty: 2,
      prompt: t`Near Earth, in coordinates that are Cartesian far away, every Christoffel symbol is tiny — about $GM/(c^2r^2)$ — so each of the 16 terms of $\Gamma^i{}_{\alpha\beta}u^\alpha u^\beta$ is weighted by its velocity product. For the International Space Station ($v = 7.7$ km/s), which product dominates?`,
      choices: [
        t`$u^0u^0 \approx c^2$, because $u^0 = c\,dt/d\tau$ is about 39 000 times larger than the space components`,
        t`The space–space products $u^ju^k$, because the station moves so fast`,
        t`The mixed products $u^0u^j$`,
        'All 16 are about the same size',
      ],
      answer: 0,
      why: {
        1: t`7.7 km/s is fast for a vehicle but slow next to light: $u^ju^k/u^0u^0 \approx (v/c)^2 \approx 7\times10^{-10}$.`,
        2: t`They are smaller than $u^0u^0$ by one factor of $v/c$, about $2.6\times10^{-5}$.`,
        3: t`Only for light, with $v = c$, are the products comparable — and then the space–space terms add as much bending as the time–time one, which is why light bends twice the Newtonian amount.`,
      },
      hints: [t`Compare $u^0 \approx c = 3\times10^{8}$ m/s with $u^j \approx v = 7.7\times10^{3}$ m/s.`],
      teach: t`For slow bodies the time–time term $\Gamma^i{}_{00}c^2$ dominates the geodesic equation, and it is Newton's gravity.`,
      explain: t`$u^0/u^j \approx c/v \approx 3.9\times10^{4}$, so $\Gamma^i{}_{00}(u^0)^2$ beats the mixed terms by that factor and the space–space terms by its square. Keeping only it gives $d^2x^i/dt^2 = -\partial_i\Phi$: Newton. For light all the terms count, and the space–space ones double the deflection.`,
      visual: speedChart,
    }),
    mcq({
      id: 'latitude', difficulty: 3,
      prompt: t`On a sphere of radius $a$, with $\theta$ measured from the north pole and $\phi$ around it, the $\theta$ part of the geodesic equation is $$\ddot\theta - \sin\theta\cos\theta\,\dot\phi^{\,2} = 0,$$ because $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ (dots are derivatives along the path). A ship sails due east along a circle of latitude, $\theta = \theta_0$, never moving north or south. For which circles is its path a geodesic?`,
      choices: [
        t`Only the equator, $\theta_0 = 90^\circ$, where $\sin\theta_0\cos\theta_0 = 0$`,
        'Every circle of latitude: the ship never turns north or south',
        'None: no geodesic on a sphere is a circle',
        'Only small circles near the poles, where the curvature is largest',
      ],
      answer: 0,
      why: {
        1: t`Holding $\theta$ fixed takes a steady sideways push: the equation needs $\ddot\theta = \sin\theta_0\cos\theta_0\,\dot\phi^2 \neq 0$ to keep the path straight, but $\ddot\theta = 0$ on the circle.`,
        2: 'Great circles are geodesics, and the equator is one. A sphere’s geodesics are exactly its great circles.',
        3: t`Near the poles $\sin\theta_0\cos\theta_0$ is not zero, so the residual does not vanish: those small circles are the most curved paths of all.`,
      },
      hints: [t`On the circle, $\theta = \theta_0$ stays fixed, so $\ddot\theta = 0$, while $\dot\phi \neq 0$.`, t`The equation then demands $\sin\theta_0\cos\theta_0\,\dot\phi^2 = 0$. For which $\theta_0$ (other than the pole itself) does that hold?`],
      teach: 'To test whether a path is a geodesic, put it into the geodesic equation: a circle of latitude fails it except at the equator.',
      explain: t`With $\theta = \theta_0$ fixed, the equation reduces to $\sin\theta_0\cos\theta_0\,\dot\phi^2 = 0$, true only for $\theta_0 = 90^\circ$. Every other latitude needs a constant sideways steer — the Christoffel symbol $\Gamma^\theta{}_{\phi\phi}$ measures exactly how much.`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 50, transport: false, readout: false }, caption: 'Not to scale: the circle of latitude 50°N on a sphere. Sailing it means steering steadily toward the pole’s side.' },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-universal', difficulty: 2,
      prompt: 'In 1971 the Apollo 15 astronaut David Scott dropped a hammer and a falcon feather together on the Moon, and they landed together. Which feature of the geodesic equation predicts that?',
      choices: [
        'Neither the falling body’s mass nor its composition appears anywhere in it, so the same start gives the same worldline',
        'The Christoffel symbols are larger for heavier bodies, exactly cancelling their extra inertia',
        'The right-hand side is zero only for light bodies, and both were light',
        'The Moon has no Christoffel symbols, because it has no air',
      ],
      answer: 0,
      why: {
        1: 'The Christoffel symbols are built from the metric alone; they are the same for every body at the same place.',
        2: 'The zero holds for every freely falling body; a hammer is not light.',
        3: 'Air resistance is what spoils the experiment on Earth; the Christoffel symbols come from the Moon’s mass, which is there either way.',
      },
      hints: ['Look for the falling body’s mass in the equation.'],
      teach: 'The geodesic equation has no property of the falling body in it: every body falls the same way, as the universality of free fall demands.',
      explain: t`Everything in $\dfrac{d^2x^\mu}{d\tau^2} + \Gamma^\mu{}_{\alpha\beta}u^\alpha u^\beta = 0$ is geometry or initial velocity, so two bodies released together follow the same worldline. Laboratory and satellite tests (MICROSCOPE: about 1 part in $10^{15}$) find no difference between materials.`,
      visual: { type: 'gr-elevator', params: { mode: 'earth' }, caption: 'A closed box standing on the ground. Press Release: the two balls fall together — whatever they are made of.' },
    }),
    mcq({
      id: 'cp-thrust', difficulty: 3, transfer: true,
      prompt: 'A probe coasting toward Mars fires its engine; its accelerometer reads 0.5 m/s² along the thrust. How does the geodesic equation change while the engine runs?',
      choices: [
        'The zero on the right becomes the probe’s four-acceleration — 0.5 m/s² along the thrust, in its own frame — and the Christoffel term stays exactly as it was',
        'The Christoffel term switches off while the engine fires',
        'Nothing changes: every body obeys the geodesic equation, engine or not',
        'Proper time τ has to be replaced by Earth’s coordinate time',
      ],
      answer: 0,
      why: {
        1: 'The Christoffel symbols belong to spacetime, not to the probe; firing an engine does not change the Sun’s gravity.',
        2: 'Only freely falling bodies follow geodesics. A thrusting probe is pushed off its geodesic — that is why its accelerometer reads something.',
        3: 'Proper time still labels the probe’s worldline; it is still the reading of the probe’s own clock.',
      },
      hints: ['The left-hand side is the same for every body at that place and velocity. What does an accelerometer measure?', 'An accelerometer in free fall reads zero. Where in the equation is that zero?'],
      teach: 'Non-gravitational forces enter on the right of the geodesic equation, as the four-acceleration an accelerometer reads; gravity stays on the left.',
      explain: t`With a force, $\dfrac{d^2x^\mu}{d\tau^2} + \Gamma^\mu{}_{\alpha\beta}u^\alpha u^\beta = a^\mu$, where $a^\mu$ is the four-acceleration — in the probe's own frame, just the 0.5 m/s² its accelerometer reads. Gravity never shows on an accelerometer; only the engine does.`,
      visual: thrustPicture,
    }),
    mcq({
      id: 'cp-light', difficulty: 2,
      prompt: t`Light follows geodesics too. Why can't the proper time $\tau$ be the parameter in the geodesic equation for a light ray?`,
      choices: [
        t`Along a light ray $d\tau = 0$: no proper time passes, so $\tau$ never advances. An affine parameter $\lambda$ takes its place`,
        'Light has no mass, so the Christoffel term vanishes for it and no parameter is needed',
        'Light is not affected by gravity, so it needs no equation of motion',
        t`$\tau$ works perfectly well: light has $g_{\alpha\beta}u^\alpha u^\beta = -c^2$ like everything else`,
      ],
      answer: 0,
      why: {
        1: 'Light bends round the Sun — 1.75 arcseconds at its edge — so the Christoffel term certainly acts on it.',
        2: 'Starlight bent by the Sun, lensed galaxies and the black-hole shadows imaged by the EHT all say otherwise.',
        3: t`For light the four-velocity is null: $g_{\alpha\beta}\,\dfrac{dx^\alpha}{d\lambda}\dfrac{dx^\beta}{d\lambda} = 0$, which is exactly why $d\tau = 0$.`,
      },
      hints: [t`For light, $dx = c\,dt$. What is $d\tau^2 = dt^2 - dx^2/c^2$ then?`],
      teach: 'Light follows null geodesics, labelled by an affine parameter because no proper time passes along them.',
      explain: t`For light $c^2d\tau^2 = c^2dt^2 - dx^2 = 0$, so $\tau$ cannot label points on the ray. Any parameter $\lambda$ that advances uniformly along it keeps the equation in the same form, and the ray bends wherever the Christoffel symbols say.`,
      visual: lightCone,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.4 (geodesics)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 3', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Touboul et al., MICROSCOPE final results (2022)', url: 'https://arxiv.org/abs/2209.15487' },
  ],
});
