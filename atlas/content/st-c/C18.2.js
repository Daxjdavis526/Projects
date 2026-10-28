// Killing vectors: flows that leave the metric unchanged, L_ξ g = 0, i.e.
// ∇_(μ ξ_ν) = 0. Along every geodesic ξ_μ u^μ is constant — Noether's theorem
// in geometric form. Schwarzschild's ∂_t and ∂_φ give the conserved energy
// E = (1 − 2M/r) dt/dτ and angular momentum L = r² dφ/dτ; for circular orbits
// E = (1 − 2M/r)/√(1 − 3M/r), so a disc spiralling to the innermost stable
// orbit (6M) releases 1 − √(8/9) = 5.7% of the rest energy. Also: the sphere's
// three rotations, the n(n+1)/2 maximum, gravitational redshift as Killing
// energy, and what is lost when the metric depends on time.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { GM_SUN, MSUN_LEN, C } from './_curv.js';

const t = String.raw;
const E_circ = (x) => (1 - 2 / x) / Math.sqrt(1 - 3 / x);        // x = r/M
const L_circ = (x) => Math.sqrt(x) / Math.sqrt(1 - 3 / x);         // L/M
const YR = 3.156e7, MSUN = GM_SUN / 6.6743e-11;

const orbitPic = (x, caption) => ({ type: 'orbit', params: { mode: 'schwarzschild', r0: x, L: +L_circ(x).toFixed(5), turns: 1, compare: false }, caption });
const sphereFlows = (caption) => ({
  type: 'calc-vectors3d',
  params: {
    range: 1.4, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }],
    curves: [-0.7, -0.35, 0, 0.35, 0.7].map((x) => ({ param: [`${x}`, `${Math.sqrt(1 - x * x).toFixed(4)}*cos(t)`, `${Math.sqrt(1 - x * x).toFixed(4)}*sin(t)`], t: [0, 2 * Math.PI], color: 'violet' }))
      .concat([-0.7, 0, 0.7].map((z) => ({ param: [`${Math.sqrt(1 - z * z).toFixed(4)}*cos(t)`, `${Math.sqrt(1 - z * z).toFixed(4)}*sin(t)`, `${z}`], t: [0, 2 * Math.PI], color: 'gold' }))),
  },
  caption,
});

export default lesson({
  id: 'st-c.C18.2',
  title: 'Killing vectors and conserved quantities',
  minutes: 15, difficulty: 3,
  equation: t`\nabla_\mu\xi_\nu + \nabla_\nu\xi_\mu = 0 \;\Longrightarrow\; \frac{d}{d\tau}\big(\xi_\mu u^\mu\big) = 0`,
  intro: t`A **Killing vector** $\xi$ is a direction in which the geometry does not change: dragging the metric along its flow leaves it as it was, $\mathcal L_\xi g = 0$ (C18.1), which with the Levi-Civita connection is **Killing’s equation** above. The easy case: if no metric component depends on a coordinate $x^\sigma$, then $\partial_\sigma$ is a Killing vector. The payoff is the conservation law on the right: along any geodesic with four-velocity $u^\mu$, the number $\xi_\mu u^\mu$ never changes. That is [Noether’s theorem](#/lesson/phys3550.M4.5) — one conserved quantity per symmetry — in geometric form.

Outside a non-spinning star (Schwarzschild, $G = c = 1$), $\partial_t$ and $\partial_\varphi$ are Killing vectors, and in the equatorial plane they give
$$E = \Big(1 - \frac{2M}{r}\Big)\frac{dt}{d\tau},\qquad L = r^2\frac{d\varphi}{d\tau},$$
the energy and angular momentum per unit mass that every orbit keeps. A space of dimension $n$ has at most $n(n+1)/2$ independent Killing vectors: 3 for a sphere, 10 for Minkowski spacetime.`,
  symbols: [
    { tex: t`\xi^\mu`, text: t`a Killing vector field; $\xi_\mu = g_{\mu\nu}\xi^\nu$ its lowered components` },
    { tex: t`\nabla_\mu\xi_\nu`, text: 'the covariant derivative of the 1-form ξ (C13.2)' },
    { tex: t`u^\mu`, text: t`the four-velocity $dx^\mu/d\tau$ of a geodesic (any affine parameter will do; for light, $dx^\mu/d\lambda$)` },
    { tex: 'E', text: t`the conserved energy per unit rest mass, from $-\xi_{(t)\mu}u^\mu$: equal to 1 for a particle at rest far away` },
    { tex: 'L', text: t`the conserved angular momentum per unit rest mass, from $\xi_{(\varphi)\mu}u^\mu$, in units of length (with $c = 1$)` },
    { tex: 'M', text: t`the mass in geometric units, $GM/c^2$ (1.477 km per solar mass)` },
  ],
  why: t`Every orbit calculation around a black hole (gr.S21) runs on $E$ and $L$; the efficiency of accretion discs, the photon sphere and the innermost stable orbit all come from these two Killing constants.`,
  visual: {
    type: 'dg4-chart',
    title: 'What a symmetry keeps',
    lead: t`A geodesic launched from $P$. The readout follows $p_\mu = g_{\mu\nu}\dot x^\nu$ for each coordinate the metric does not contain — the Killing vector $\partial_\mu$ — from the start of the path to its end.`,
    tasks: [
      t`Schwarzschild $(r, t)$: a clock thrown upward slows, stops and falls back, but $p_t = -E$ is the same at both ends. Change the speed: a different constant.`,
      t`Sphere: $p_\varphi$ is conserved (Clairaut’s relation, C14.3). Torus: so is $p_u$; but no $p_v$ appears — the torus is not symmetric round its tube.`,
      t`Half-plane: $p_x$ is conserved. The half-plane actually has three Killing vectors; only one is a coordinate field on this chart.`,
    ],
    params: { metric: 'schwarzschild', metrics: ['schwarzschild', 'sphere', 'torus', 'halfplane'], mode: 'geodesic', P: [6, 0], speed: 0.2, heading: 40, length: 14, lengthMax: 40, view: { a: [0, 12], b: [-1, 18] }, readout: ['conserved', 'norm'] },
    caption: t`Geodesics by RK4 from the Christoffel symbols; the conserved momenta are evaluated from the numerical solution, so their small changes measure the integration error. Schwarzschild is drawn on its $(r, t)$ chart with $M = 1$.`,
  },
  example: {
    prompt: t`For a circular geodesic orbit of radius $r$ in Schwarzschild spacetime, $E = \dfrac{1 - 2M/r}{\sqrt{1 - 3M/r}}$ and $L = \dfrac{\sqrt{Mr}}{\sqrt{1 - 3M/r}}$. Gas in a thin accretion disc spirals inward through nearly circular orbits, radiating away energy, until the innermost stable orbit at $r = 6M$, where it plunges. What fraction of its rest energy has it radiated by then?`,
    visual: orbitPic(6, 'The innermost stable circular orbit, r = 6M, beside its effective potential (units of M).'),
    steps: [
      { label: 'Conserved per orbit', text: t`Between nudges, each parcel of gas follows a geodesic, so its $E$ is fixed; it changes only as the gas radiates. Far away and at rest, $E = 1$: all rest energy, none released.` },
      { label: 'At 6M', text: t`$E = \dfrac{1 - 2/6}{\sqrt{1 - 3/6}} = \dfrac{2/3}{\sqrt{1/2}} = \sqrt{8/9} = 0.9428$.` },
      { label: 'Radiated', text: t`The difference, $1 - E = 0.0572$, has left as light: **5.7% of the rest energy** — eight times the 0.7% that hydrogen fusion releases.` },
      { label: 'Sense check', text: t`Far out, $E \approx 1 - \dfrac{M}{2r}$: Newton’s kinetic plus potential energy of a circular orbit, $-\tfrac{GMm}{2r}$. At $6M$ that would give $1/12 = 8.3\%$; relativity takes some back.` },
      { label: 'Why it stops at 6M', text: t`Inside $6M$ no stable circular orbit exists ($E$ and $L$ of circular orbits have their minimum there), so the gas falls in without radiating much more. A spinning black hole lets the disc reach closer: up to 42% for an extreme Kerr hole (gr.S26.d).` },
    ],
    answer: t`$1 - \sqrt{8/9} = 5.72\%$ of the rest energy.`,
  },
  practice: [
    num({
      id: 'circular-E', difficulty: 2,
      gen(r) {
        const x = r.pick([7, 8, 10, 15, 20, 50]);
        const key = E_circ(x);
        return {
          prompt: t`A satellite follows a circular geodesic of radius $r = ${x}M$ around a black hole. What is its conserved energy per unit rest mass, $E = -\xi_{(t)\mu}u^\mu$?`,
          visual: orbitPic(x, t`A circular orbit at r = ${x}M (units of M) beside its effective potential.`),
          answer: key, tol: { rel: 0, abs: 0.0002 },
          errors: [
            { value: 1 - 1 / (2 * x), feedback: t`That is the Newtonian approximation $1 - M/2r$. Use the exact $E = (1 - 2M/r)/\sqrt{1 - 3M/r}$.` },
            { value: Math.sqrt(1 - 2 / x), feedback: t`$\sqrt{1 - 2M/r}$ is the clock rate of an observer *hovering* at $r$. An orbiting body has kinetic energy too.` },
          ].filter((e) => Math.abs(e.value - key) > 0.0005),
          hints: [t`$E = \dfrac{1 - 2/${x}}{\sqrt{1 - 3/${x}}}$.`],
          teach: 'Each circular orbit has its own Killing energy E < 1; the deficit 1 − E is the binding energy per unit mass.',
          explain: t`$E = \dfrac{${nice(1 - 2 / x, 5)}}{${nice(Math.sqrt(1 - 3 / x), 5)}} = ${nice(key, 5)}$: bound by $${nice(100 * (1 - key), 3)}\%$ of its rest energy (Newton would say $${nice(100 / (2 * x), 3)}\%$).`,
        };
      },
    }),
    num({
      id: 'circular-L', difficulty: 2,
      gen(r) {
        const x = r.pick([6, 8, 12, 20]);
        const key = L_circ(x);
        return {
          prompt: t`What is the conserved angular momentum per unit mass, $L/M$, of a circular geodesic orbit at $r = ${x}M$ around a black hole? ($L = \sqrt{Mr}/\sqrt{1 - 3M/r}$.)`,
          visual: orbitPic(x, t`A circular orbit at r = ${x}M beside its effective potential.`),
          answer: key, tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(x), feedback: t`$\sqrt{Mr}$ is Newton’s value; relativity divides by $\sqrt{1 - 3M/r}$.` }].filter((e) => Math.abs(e.value - key) > 0.005 * key),
          hints: [t`$L/M = \sqrt{r/M}\,\big/\sqrt{1 - 3M/r}$ with $r/M = ${x}$.`],
          teach: 'The rotational Killing vector ∂φ gives the conserved L = r² dφ/dτ; circular orbits need more of it than Newton says.',
          explain: t`$L/M = \sqrt{${x}}/\sqrt{1 - 3/${x}} = ${nice(key, 4)}$. ${x === 6 ? 'At the innermost stable orbit this is the smallest L any circular orbit has, 2√3 = 3.464.' : 'Moving inward, L reaches its minimum, 2√3 M, at the innermost stable orbit (6M).'}`,
        };
      },
    }),
    order({
      id: 'proof', difficulty: 3,
      prompt: t`Show that $\xi_\mu u^\mu$ is constant along a geodesic when $\xi$ satisfies Killing’s equation. Order the steps.`,
      visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'geodesic', P: [0.6, 1.0], heading: 25, length: 9, drag: false, readout: ['conserved'], field: true, sliders: [] }, caption: t`A great circle on the sphere’s chart, with $p_\varphi = g_{\varphi\mu}\dot x^\mu$ at its start and end.` },
      items: [
        t`Along the curve, $\dfrac{d}{d\tau}(\xi_\mu u^\mu) = u^\nu\nabla_\nu(\xi_\mu u^\mu)$, since it is a scalar.`,
        t`By the product rule, this is $u^\nu u^\mu\nabla_\nu\xi_\mu + \xi_\mu u^\nu\nabla_\nu u^\mu$.`,
        t`The second term vanishes: the curve is a geodesic, $u^\nu\nabla_\nu u^\mu = 0$.`,
        t`The first vanishes too: $u^\nu u^\mu$ is symmetric in $\mu\nu$, and Killing’s equation says the symmetric part of $\nabla_\nu\xi_\mu$ is zero.`,
      ],
      hints: [t`Differentiate the scalar along the curve with $u^\nu\nabla_\nu$.`, 'Which part of ∇ξ survives contraction with a symmetric tensor?'],
      teach: 'Geodesic equation plus Killing’s equation: each kills one of the two terms in the derivative of ξ·u.',
      explain: t`No coordinates needed — which is why $\xi_\mu u^\mu$ is conserved even when $\xi$ is not a coordinate field on your chart (the half-plane’s other two symmetries, or the sphere’s tilted rotations).`,
    }),
    multi({
      id: 'sphere-killing', difficulty: 3,
      prompt: t`On the unit sphere, $g = d\theta^2 + \sin^2\theta\,d\varphi^2$. Which of these are Killing vectors? Select all that are.`,
      visual: sphereFlows('Flow lines of two rotations of the sphere: about the z axis (gold, the circles of latitude) and about the x axis (violet).'),
      choices: [
        t`$\partial_\varphi$`,
        t`$\partial_\theta$`,
        t`$-\sin\varphi\,\partial_\theta - \cot\theta\cos\varphi\,\partial_\varphi$`,
        t`$\sin\theta\,\partial_\varphi$`,
      ],
      answer: [0, 2],
      why: {
        1: t`$(\mathcal L_{\partial_\theta}g)_{\varphi\varphi} = \partial_\theta\sin^2\theta \ne 0$ (C18.1): sliding down meridians stretches the circles of latitude.`,
        3: t`Its flow turns circles of latitude at different rates — fastest at the equator — shearing the sphere. Only a constant multiple of $\partial_\varphi$ is a rigid rotation.`,
      },
      hints: [t`$\partial_\varphi$: does any metric component depend on $\varphi$?`, t`The third field is the rotation about the $x$ axis, written in these coordinates. Rotations of a round sphere preserve every distance.`],
      teach: 'The sphere’s Killing vectors are its three rotations: n(n+1)/2 = 3, the most a 2D space can have.',
      explain: t`$\partial_\varphi$ is the rotation about $z$; the third field is the rotation about $x$ (and swapping $\sin\varphi \to -\cos\varphi$, $\cos\varphi \to \sin\varphi$ gives the one about $y$). Each conserves its own angular-momentum component along great circles. Their brackets close: $[\xi_x, \xi_y] = -\xi_z$ — the rotation algebra (with the sign that vector fields carry).`,
    }),
    num({
      id: 'max-count', difficulty: 2,
      gen(r) {
        const [what, n, sym] = r.pick([['ordinary flat 3D space', 3, 'three translations and three rotations'], ['Minkowski spacetime', 4, 'four translations, three rotations and three boosts — the Poincaré group'], ['a five-dimensional flat spacetime', 5, 'five translations and ten rotations or boosts'], ['the 3-sphere (a closed universe’s space)', 3, 'six rotations in four-dimensional space']]);
        const key = (n * (n + 1)) / 2;
        return {
          prompt: t`A space with as many symmetries as possible in its dimension is called maximally symmetric. How many independent Killing vectors does ${what} have?`,
          visual: { type: 'spacetime', params: { beta: 0.4, events: [[0, 0]], range: 3, signature: '-+++' }, caption: 'Two of Minkowski spacetime’s symmetries in one picture: a boost tilts the axes, and the light cone is unchanged.' },
          answer: key, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n, feedback: 'Translations alone give n; rotations (and boosts) add n(n−1)/2 more.' }, { value: n * n, feedback: t`The count is $n(n+1)/2$: $n$ translations plus $n(n-1)/2$ rotations.` }].filter((e) => e.value !== key),
          hints: [t`$n$ translations plus $n(n-1)/2$ rotations (or boosts): $n(n+1)/2$.`],
          teach: 'A space of dimension n has at most n(n+1)/2 Killing vectors; flat spaces, spheres and de Sitter reach it.',
          explain: t`$${n}\cdot${n + 1}/2 = ${key}$: ${sym}. Each Killing vector brings a conserved quantity — for Minkowski spacetime, energy, momentum, angular momentum and the steady motion of the centre of energy.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-quasar', difficulty: 3, transfer: true,
      gen(r) {
        const Lq = r.pick([1, 3, 5]) * 10 ** r.pick([38, 39, 40]);
        const eta = 1 - Math.sqrt(8 / 9), mdot = Lq / (eta * C * C), key = (mdot * YR) / MSUN;
        return {
          prompt: t`A quasar shines with luminosity $${tex(Lq, 2)}$ W. Suppose its light comes from a thin disc around a non-spinning black hole, releasing $1 - E_{\text{ISCO}} = 1 - \sqrt{8/9}$ of the rest energy of the gas that reaches the innermost stable orbit. How much mass must it swallow per year, in solar masses ($M_\odot = 1.989\times10^{30}$ kg)?`,
          visual: orbitPic(6, 'The innermost stable circular orbit (6M): where the disc’s gas stops radiating and plunges.'),
          answer: key, units: 'Msun', tol: { rel: 0.01 },
          errors: [
            { value: (Lq / (C * C) * YR) / MSUN, feedback: t`That assumes all the rest energy becomes light. The disc releases only $1 - E = 5.72\%$.` },
            { value: (Lq / ((1 / 12) * C * C) * YR) / MSUN, feedback: t`$1/12$ is the Newtonian estimate of the binding at $6M$. Use the relativistic $1 - \sqrt{8/9}$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * key),
          hints: [t`$L = \eta\,\dot M c^2$ with $\eta = 1 - \sqrt{8/9} = 0.0572$.`, t`$\dot M = L/(0.0572\,c^2)$ in kg/s; multiply by $3.156\times10^7$ s per year and divide by $M_\odot$.`],
          teach: 'Killing energy sets the efficiency of accretion: 5.7% of rest energy for a non-spinning hole.',
          explain: t`$\dot M = \dfrac{${tex(Lq, 2)}}{0.0572\times(${tex(C, 4)})^2} = ${tex(mdot, 3)}$ kg/s $= ${nice(key, 3)}\,M_\odot$ per year. A real quasar’s hole probably spins, raising $\eta$ toward 0.3 and lowering this rate; and part of the energy is carried off by jets and winds rather than light.`,
        };
      },
    }),
    num({
      id: 'cp-redshift', difficulty: 3, transfer: true,
      gen(r) {
        const [m, R] = r.pick([[1.4, 12], [1.4, 10], [2.0, 12], [1.8, 11]]);
        const c2 = (2 * m * MSUN_LEN) / (R * 1e3), key = 1 / Math.sqrt(1 - c2) - 1;
        return {
          prompt: t`A spectral line is emitted at the surface of a ${m}-solar-mass neutron star of radius ${R} km and received far away. The photon’s Killing energy $-\xi_{(t)\mu}p^\mu$ is conserved, while a static observer at radius $r$ measures $\dfrac{-\xi_{(t)\mu}p^\mu}{\sqrt{1 - 2GM/rc^2}}$. What redshift $z = \lambda_{\text{received}}/\lambda_{\text{emitted}} - 1$ is observed? ($GM_\odot/c^2 = 1.477$ km.)`,
          visual: { type: 'dg4-chart', params: { metric: 'schwarzschild', mode: 'geodesic', P: [3, 0], speed: 1, length: 9, drag: false, readout: false, cells: 8, view: { a: [0, 12], b: [-1, 11] } }, caption: 'An outgoing light ray on the Schwarzschild (r, t) chart (units of M): its Killing energy is the same all the way out.' },
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: c2 / 2, feedback: t`$GM/Rc^2$ is the weak-field approximation. At a neutron star’s surface it is not small: use $1/\sqrt{1 - 2GM/Rc^2} - 1$.` },
            { value: 1 / (1 - c2) - 1, feedback: t`The factor is the square root: the static observer’s rate is $\sqrt{1 - 2GM/rc^2}$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * key),
          hints: [t`$2GM/Rc^2 = 2\times${m}\times1.477/${R} = ${nice(c2, 4)}$.`, t`Energy measured at the surface $= E_\infty/\sqrt{1 - 2GM/Rc^2}$, so $1 + z = 1/\sqrt{1 - 2GM/Rc^2}$.`],
          teach: 'Gravitational redshift is conservation of a photon’s Killing energy, read by observers whose clocks run at different rates.',
          explain: t`$1 + z = 1/\sqrt{1 - ${nice(c2, 4)}} = ${nice(1 + key, 4)}$, so $z = ${nice(key, 3)}$. Measuring such a line would weigh the star’s compactness directly, which is why X-ray astronomers hunt for surface absorption lines on neutron stars.`,
        };
      },
    }),
    mcq({
      id: 'cp-expanding', difficulty: 2,
      prompt: t`In an expanding universe, $ds^2 = -dt^2 + a(t)^2(dx^2 + dy^2 + dz^2)$ with $c = 1$, the metric depends on $t$ but not on $x$, $y$ or $z$. What follows for a photon crossing it?`,
      visual: { type: 'dg4-chart', params: { metric: 'desitter', mode: 'geodesic', P: [-1.5, 0], speed: 1, length: 2.5, drag: false, readout: false, cells: 8 }, caption: t`A light ray in a 1+1 expanding universe (de Sitter, $a = e^{Ht}$), drawn on its $(x, t)$ chart.` },
      choices: [
        t`$p_x = a^2\,dx/d\lambda$ is conserved, so the momentum a comoving observer measures, $p_x/a$, falls as $1/a$: the cosmological redshift`,
        'Its energy is conserved, because energy is always conserved',
        'Nothing is conserved, because the metric depends on time',
        'Its frequency rises as space expands',
      ],
      answer: 0,
      why: {
        1: t`Energy conservation of this kind needs a timelike Killing vector; $\partial_t$ is not one here.`,
        2: t`$\partial_x$, $\partial_y$, $\partial_z$ are still Killing vectors: the spatial momenta are conserved.`,
        3: 'Expansion stretches wavelengths: it lowers the frequency.',
      },
      hints: [t`Which coordinate fields are Killing vectors here? What does each conserve?`],
      teach: 'No time symmetry, no conserved energy: in an expanding universe a photon keeps its comoving momentum, and its measured energy falls as 1/a.',
      explain: t`With $\partial_x$ Killing, $p_x$ is constant. A comoving observer’s unit vector along $x$ is $\tfrac1a\partial_x$, so they measure momentum (and, for light, energy) $p_x/a \propto 1/a$: wavelengths stretch with the universe, $1 + z = a_{\text{now}}/a_{\text{then}}$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.8 (symmetries and Killing vectors) and §5.4 (Schwarzschild geodesics)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Hartle, Gravity, ch. 8–9 (conserved quantities and orbits; the ISCO and accretion efficiency)', url: 'https://www.pearson.com/en-us/subject-catalog/p/gravity-an-introduction-to-einsteins-general-relativity/P200000003301' },
    { label: 'Novikov & Thorne 1973, Astrophysics of black holes (thin-disc efficiency)', url: 'https://ui.adsabs.harvard.edu/abs/1973blho.conf..343N' },
  ],
});
