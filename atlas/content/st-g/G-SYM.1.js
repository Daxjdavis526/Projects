// Rotations, boosts and the Poincaré group: x ↦ Λx + a, the ten isometries of
// Minkowski space (4 translations, 3 rotations, 3 boosts), composing as
// (Λ₁, a₁)(Λ₂, a₂) = (Λ₁Λ₂, Λ₁a₂ + a₁) — a semidirect product, made concrete
// with 3 × 3 matrices on (t, x, 1); [K, P_t] = P_x (a boost turns energy into
// momentum); the order of boost and translation matters; Noether's charges
// (energy, momentum, angular momentum, the boost charge); invariants and
// non-invariants; Killing vectors as the symmetries left in curved spacetime
// (n(n + 1)/2 at most; Schwarzschild 4, a generic spacetime none). Transfers:
// what a satellite in Earth's field conserves, and transforming an event.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const EV = { P: [1, 0.5], Q: [2.5, -0.6] };          // events (t, x)

// boost of rapidity w (an expression) applied to (t, x), then shifted
const bt = (w, tt, xx) => `(cosh(${w})*(${tt}) + sinh(${w})*(${xx}))`;
const bx = (w, tt, xx) => `(sinh(${w})*(${tt}) + cosh(${w})*(${xx}))`;
// o = 0: boost then translate (Λx + a); o = 1: translate then boost (Λ(x + a))
const mapT = (p) => `${bt('w', p[0], p[1])} + (1 - o)*at + o*${bt('w', 'at', 'ax')}`;
const mapX = (p) => `${bx('w', p[0], p[1])} + (1 - o)*ax + o*${bx('w', 'at', 'ax')}`;

// n axes as dots with a line for each pair: dots = translations, lines = rotations and boosts
const countPic = (n) => {
  const pts = Array.from({ length: n }, (_, i) => [r6(Math.cos(Math.PI / 2 + (2 * Math.PI * i) / n)), r6(Math.sin(Math.PI / 2 + (2 * Math.PI * i) / n))]);
  const curves = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) curves.push({ param: [`${pts[i][0]} + t*${r6(pts[j][0] - pts[i][0])}`, `${pts[i][1]} + t*${r6(pts[j][1] - pts[i][1])}`], t: [0, 1], color: 'teal', width: 1.4 });
  return { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.25, 1.25], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves, points: pts.map(([x, y], i) => ({ x, y, r: 7, color: 'gold', label: i === 0 ? 't' : `x${'₁₂₃₄₅₆'[i - 1]}`, labelDx: 8, labelDy: -8 })) }, caption: 'Each dot is an axis — and a translation along it. Each line is a coordinate plane — and a rotation or boost in it.' };
};

export default lesson({
  id: 'st-g.G-SYM.1',
  title: 'Rotations, boosts and the Poincaré group',
  minutes: 13, difficulty: 3,
  intro: t`The symmetries of Minkowski spacetime — the maps that preserve every interval — are the Lorentz transformations together with translations. They form the **Poincaré group**:

$$\begin{gathered} x^\mu \mapsto \Lambda^\mu{}_\nu x^\nu + a^\mu \\ (\Lambda_1, a_1)\circ(\Lambda_2, a_2) = (\Lambda_1\Lambda_2,\ \Lambda_1a_2 + a_1)\end{gathered}$$

Ten parameters: four translations $a^\mu$, three rotations, three boosts. The composition law makes it a **semidirect product**: translations form a normal subgroup that the Lorentz part acts on, so the order of a boost and a translation matters. Each of the ten generators gives a conserved quantity (Noether): energy, momentum, angular momentum, and the boost charge. In curved spacetime the Poincaré group is gone; what survives is the set of **Killing vectors** — usually none.`,
  symbols: [
    { tex: '\\Lambda^\\mu{}_\\nu', text: t`a Lorentz transformation (rotation, boost, or product of them), $c = 1$` },
    { tex: 'a^\\mu', text: 'a translation: a shift of the origin in time and space' },
    { tex: 'x^\\mu', text: t`the coordinates $(t, x, y, z)$ of an event` },
    { tex: '(\\Lambda, a)', text: t`one Poincaré transformation, acting as $x \mapsto \Lambda x + a$` },
    { tex: 'P_\\mu, J_i, K_i', text: 'the ten generators: translations (energy and momentum), rotations, boosts' },
  ],
  why: 'Special relativity is the statement that physics is Poincaré invariant; particles are classified by its representations (mass and spin); and general relativity begins by giving it up, keeping only the Killing symmetries a particular spacetime happens to have.',
  visual: {
    type: 'graph',
    title: 'Boost and shift a pair of events',
    lead: t`Two events $P$ and $Q$ (grey) joined by a worldline, and their images (gold) under a boost of rapidity $w$ and a translation $(a_t, a_x)$, applied in the order you choose. The light cone of the origin is dashed.`,
    tasks: [
      t`Move any slider: the images’ coordinates change, the interval between them does not. Every Poincaré transformation is an isometry of spacetime.`,
      t`Switch the order with a boost and a translation both on: “translate, then boost” shifts by $\Lambda a$, not $a$. The two orders differ — boosts and translations do not commute, $[K, P_t] = P_x$.`,
      t`With $w = 0$ the order no longer matters: translations commute with each other.`,
    ],
    params: {
      x: [-4, 4], y: [-1, 4], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't',
      sliders: [
        { key: 'w', label: t`Boost rapidity $w$`, min: -1, max: 1, step: 0.05, value: 0.4, explain: t`Speed $\tanh w$ along $x$.` },
        { key: 'at', label: t`Shift in time $a_t$`, min: -1, max: 1.5, step: 0.1, value: 0.5, explain: 'Moves every event later by this much.' },
        { key: 'ax', label: t`Shift in space $a_x$`, min: -2, max: 2, step: 0.1, value: 1, explain: 'Moves every event along x by this much.' },
      ],
      choices: [{ key: 'o', label: 'Order', options: [[0, 'boost, then translate'], [1, 'translate, then boost']], value: 0, explain: t`$\Lambda x + a$ or $\Lambda(x + a)$.` }],
      curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }, { param: [`${EV.P[1]} + t*${r6(EV.Q[1] - EV.P[1])}`, `${EV.P[0]} + t*${r6(EV.Q[0] - EV.P[0])}`], t: [0, 1], color: 'ink4', width: 2 }, { param: [`${mapX(EV.P)} + t*(${mapX(EV.Q)} - (${mapX(EV.P)}))`, `${mapT(EV.P)} + t*(${mapT(EV.Q)} - (${mapT(EV.P)}))`], t: [0, 1], color: 'gold', width: 2.4 }],
      points: [{ x: EV.P[1], y: EV.P[0], r: 5, color: 'ink4', label: 'P' }, { x: EV.Q[1], y: EV.Q[0], r: 5, color: 'ink4', label: 'Q' }, { x: mapX(EV.P), y: mapT(EV.P), r: 6, color: 'gold', label: 'P′' }, { x: mapX(EV.Q), y: mapT(EV.Q), r: 6, color: 'gold', label: 'Q′' }],
      readouts: [
        { label: t`$\Delta s^2(P, Q)$`, expr: `-(${EV.Q[0] - EV.P[0]})^2 + (${r6(EV.Q[1] - EV.P[1])})^2`, digits: 4 },
        { label: t`$\Delta s^2(P', Q')$`, expr: `-(${mapT(EV.Q)} - (${mapT(EV.P)}))^2 + (${mapX(EV.Q)} - (${mapX(EV.P)}))^2`, digits: 4 },
        { label: t`$t$ of $P'$`, expr: mapT(EV.P), digits: 4 },
      ],
    },
    caption: t`Exact transformations in 1+1 ($c = 1$), $\Delta s^2 = -\Delta t^2 + \Delta x^2$. The drawing’s Euclidean lengths are not intervals.`,
  },
  example: {
    prompt: t`Write 1+1 Poincaré transformations as $3\times3$ matrices $\begin{pmatrix}\Lambda & a \\ 0 & 1\end{pmatrix}$ acting on $(t, x, 1)$. Derive the composition law, and compute the commutator of the boost generator $K$ with the time-translation generator $P_t$.`,
    visual: countPic(2),
    steps: [
      { label: 'One matrix', text: t`$\begin{pmatrix}\Lambda & a \\ 0 & 1\end{pmatrix}\begin{pmatrix}x \\ 1\end{pmatrix} = \begin{pmatrix}\Lambda x + a \\ 1\end{pmatrix}$: a linear map in one dimension more does the affine map $x \mapsto \Lambda x + a$.` },
      { label: 'Compose', text: t`$\begin{pmatrix}\Lambda_1 & a_1 \\ 0 & 1\end{pmatrix}\begin{pmatrix}\Lambda_2 & a_2 \\ 0 & 1\end{pmatrix} = \begin{pmatrix}\Lambda_1\Lambda_2 & \Lambda_1a_2 + a_1 \\ 0 & 1\end{pmatrix}$ — the law above. The Lorentz part acts on the translation part: that is what “semidirect” means.` },
      { label: 'Generators', text: t`Differentiate one-parameter families at the identity: $\hat K$ has the boost generator $\begin{pmatrix}0 & 1 \\ 1 & 0\end{pmatrix}$ in its top-left block; $\hat P_t$ has a single $1$ in row $t$ of the last column, $\hat P_x$ in row $x$.` },
      { label: 'Commute', text: t`$\hat K\hat P_t$: the last column of $\hat P_t$ is $e_t$, and $K e_t = e_x$, so $\hat K\hat P_t = \hat P_x$. $\hat P_t\hat K = 0$ (the bottom row of $\hat K$ is zero). So $[\hat K, \hat P_t] = \hat P_x$, and similarly $[\hat K, \hat P_x] = \hat P_t$.` },
      { label: 'Read it', text: t`A boost turns time translations into space translations: energy and momentum mix, $E' = \gamma(E - vp)$. In 1+1 there are $3$ generators, $P_t, P_x, K$; in 3+1, $4 + 6 = 10$.` },
    ],
    answer: t`$(\Lambda_1, a_1)(\Lambda_2, a_2) = (\Lambda_1\Lambda_2, \Lambda_1a_2 + a_1)$, and $[K, P_t] = P_x$, $[K, P_x] = P_t$: boosts mix energy and momentum, while translations commute with each other.`,
  },
  practice: [
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        const ans = (n * (n + 1)) / 2;
        return {
          prompt: t`How many independent generators does the Poincaré group of an $n = ${n}$-dimensional Minkowski spacetime (one time, $${n - 1}$ space) have?`,
          visual: countPic(n),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (n * (n - 1)) / 2, feedback: 'That is the Lorentz part alone; add the translations.' }, { value: n, feedback: 'That is the translations alone; add the rotations and boosts.' }].filter((e) => e.value !== ans),
          hints: [t`Translations: $n$. Lorentz transformations: $n(n - 1)/2$.`],
          teach: t`Minkowski space in $n$ dimensions has $n(n + 1)/2$ independent symmetries — the most any $n$-dimensional spacetime can have.`,
          explain: t`$${n} + ${(n * (n - 1)) / 2} = ${ans}$. ${n === 4 ? 'Ten for our spacetime: 4 translations, 3 rotations, 3 boosts.' : 'For 3+1 the same count gives 10.'}`,
        };
      },
    }),
    num({
      id: 'compose', difficulty: 3,
      gen(r) {
        const w1 = r.pick([0.3, 0.5, -0.4]), a1 = [r.pick([1, 2, -1]), r.pick([0, 1, -2])], a2 = [r.pick([1, 3]), r.pick([2, -1, 1])];
        const L1 = [[Math.cosh(w1), Math.sinh(w1)], [Math.sinh(w1), Math.cosh(w1)]];
        const ans = L1[0][0] * a2[0] + L1[0][1] * a2[1] + a1[0];
        const wrong = a2[0] + a1[0];
        return {
          prompt: t`In 1+1, apply first $(\Lambda_2, a_2)$ with $\Lambda_2$ any boost and $a_2 = (a_t, a_x) = (${a2[0]}, ${a2[1]})$, then $(\Lambda_1, a_1)$ with $\Lambda_1$ the boost of rapidity $${w1}$ and $a_1 = (${a1[0]}, ${a1[1]})$. The result is a single Poincaré transformation $(\Lambda, a)$. Find the time component of its translation $a$.`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-2.5, 4.5], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }], arrows: [{ from: [0, 0], to: [a2[1], a2[0]], color: 'accent', width: 2.4, label: 'a₂' }, { from: [0, 0], to: [a1[1], a1[0]], color: 'gold', width: 2.4, label: 'a₁' }] }, caption: 'The two translation vectors on a spacetime diagram (x across, t up).' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: wrong, feedback: t`Translations do not simply add here: $a_2$ is carried through $\Lambda_1$ first. The translation is $\Lambda_1a_2 + a_1$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * Math.abs(ans)),
          hints: [t`$(\Lambda_1, a_1)(\Lambda_2, a_2) = (\Lambda_1\Lambda_2, \Lambda_1a_2 + a_1)$.`, t`$(\Lambda_1a_2)^t = \cosh(${w1})\cdot${a2[0]} + \sinh(${w1})\cdot${a2[1]}$.`],
          teach: 'In a semidirect product the first translation is acted on by the later Lorentz transformation: a = Λ₁a₂ + a₁.',
          explain: t`$\cosh(${w1})\cdot${a2[0]} + \sinh(${w1})\cdot(${a2[1]}) + ${a1[0]} = ${nice(ans, 4)}$. The boost has tilted $a_2$ before $a_1$ is added.`,
        };
      },
    }),
    match({
      id: 'noether', difficulty: 2,
      prompt: 'Noether’s theorem pairs each symmetry with a conserved quantity. Match them.',
      visual: { type: 'cm2-noether', params: { kind: 'rotation', kinds: true, eps: 0.2 }, caption: 'A puck in three potentials, each with one symmetry that the slider breaks: only the matching quantity stops being conserved.' },
      left: ['Time translation', 'Space translation', 'Rotation', 'Boost'],
      right: ['energy', 'momentum', 'angular momentum', 'the centre of energy moves uniformly', 'mass'],
      answer: [0, 1, 2, 3],
      hints: ['Physics the same tomorrow as today: what is conserved?', 'The boost charge is K = tP − (centre of energy) × E; its conservation says the centre of energy drifts at constant velocity.'],
      teach: 'Each of the ten Poincaré generators protects a conserved quantity: E, p, L and the boost charge.',
      explain: 'Time → energy, space → momentum, rotation → angular momentum, and boost → the relativistic centre-of-energy theorem. Mass is not a Noether charge but a Casimir: the same in every frame, labelling the representation.',
    }),
    multi({
      id: 'invariants', difficulty: 2,
      prompt: 'Which of these are unchanged by every Poincaré transformation?',
      visual: { type: 'graph', params: { x: [-4, 4], y: [-1, 3.5], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }], points: [{ x: -1.5, y: 1, r: 5, color: 'gold', label: 'R' }, { x: 1.5, y: 1.6, r: 5, color: 'gold', label: 'S' }] }, caption: 'Two spacelike-separated events R and S: outside each other’s light cones.' },
      choices: ['The interval between two events', 'The proper time along a worldline between two events', 'The rest mass of a particle', 'The coordinates of an event', 'The energy of a particle', 'Which of two spacelike-separated events happens first'],
      answer: [0, 1, 2],
      why: {
        3: 'Translations alone change coordinates.',
        4: 'Energy is one component of the four-momentum; a boost mixes it with momentum.',
        5: 'For spacelike separations, boosts can reverse the time order; only for timelike or null separations is it fixed (by orthochronous transformations).',
      },
      hints: ['Invariants are built from the metric: intervals and lengths of four-vectors.', 'Components and coordinates are frame-dependent.'],
      teach: 'Poincaré transformations preserve intervals, proper times and invariant masses — everything built from η — but not coordinates, energies or the order of spacelike events.',
      explain: t`Intervals, proper times and $m^2 = -\mathbf p\cdot\mathbf p$ are invariant. $E = p^0$ is a component; the time order of $R$ and $S$ depends on the frame.`,
    }),
    num({
      id: 'killing', difficulty: 3,
      gen(r) {
        const [what, ans, n, note] = r.pick([
          ['the 2-sphere (a round surface)', 3, 2, 'the three rotations of SO(3)'],
          ['flat 3D Euclidean space', 6, 3, '3 translations and 3 rotations'],
          ['the Schwarzschild spacetime outside a black hole', 4, 4, 'time translation plus 3 rotations'],
          ['a spatially flat FLRW universe (an expanding cosmos)', 6, 4, '3 spatial translations and 3 rotations, but no time translation'],
          ['de Sitter spacetime', 10, 4, 'as many as Minkowski: it is maximally symmetric too'],
        ]);
        return {
          prompt: t`A **Killing vector** generates a symmetry (an isometry) of a curved space or spacetime. How many independent Killing vectors does ${what} have? (The maximum in $n$ dimensions is $n(n+1)/2$; here $n = ${n}$.)`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (n * (n + 1)) / 2, feedback: 'That is the maximum, reached only by maximally symmetric spaces. Which symmetries does this one actually have?' }].filter((e) => e.value !== ans),
          hints: ['List the symmetries one by one: time translation? spatial translations? rotations? boosts?', `Here: ${note.split(',')[0]}.`],
          teach: 'Killing vectors are what remains of Poincaré symmetry in curved spacetime: maximally n(n + 1)/2, often far fewer, and for a generic spacetime none.',
          explain: t`$${ans}$: ${note}. Each Killing vector $\xi$ gives a conserved quantity $\mathbf p\cdot\xi$ along geodesics — the Schwarzschild energy and angular momentum come from exactly this.`,
        };
      },
    }),
    mcq({
      id: 'order', difficulty: 3,
      prompt: t`Let $B$ be a boost (rapidity $w \ne 0$) and $T_a$ a translation by $a \ne 0$. How do $B\circ T_a$ (translate, then boost) and $T_a\circ B$ (boost, then translate) compare?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-1, 4], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }], arrows: [{ from: [0, 0], to: [1, 1], color: 'accent', width: 2.4, label: 'a', labelDx: -14 }, { from: [0, 0], to: [r6(Math.sinh(0.6) + Math.cosh(0.6)), r6(Math.cosh(0.6) + Math.sinh(0.6))], color: 'gold', width: 2.4, label: 'Λa (w = 0.6)' }] }, caption: t`A translation vector $a$ (here along the light cone) and its boosted image $\Lambda a$.` },
      choices: [t`$B\circ T_a = T_{\Lambda a}\circ B$: both are “boost, then shift”, but by $\Lambda a$ instead of $a$`, 'They are equal: translations commute with everything', t`$B\circ T_a = B$: a boost absorbs translations`, t`$B\circ T_a = T_a\circ B^{-1}$`],
      answer: 0,
      why: {
        1: t`Translations commute with each other, not with boosts: $[K, P_t] = P_x \ne 0$.`,
        2: t`$B\circ T_a$ moves the origin to $\Lambda a$; it is not $B$.`,
        3: t`Nothing reverses the boost; compare $\Lambda(x + a)$ with $\Lambda x + a$.`,
      },
      hints: [t`Apply both to an event $x$: $T_a\circ B$ gives $\Lambda x + a$.`, t`$B\circ T_a$ sends $x$ to $\Lambda(x + a) = \Lambda x + \Lambda a$.`],
      teach: t`Boosts and translations do not commute: $\Lambda(x + a) = \Lambda x + \Lambda a$, a different shift — the content of $[K, P_\mu] \ne 0$.`,
      explain: t`$\Lambda(x + a) = \Lambda x + \Lambda a$: the same boost followed by the boosted shift. Here $a$ lies on the light cone and $\Lambda a = e^{0.6}a$, stretched by the Doppler factor.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-satellite', difficulty: 3, transfer: true,
      prompt: t`Outside the Earth, spacetime is close to Schwarzschild, whose Killing vectors are one time translation and three rotations. Which quantities does a freely falling GPS satellite conserve exactly in that model?`,
      visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-1.7, 1.7], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['0.4*cos(t)', '0.4*sin(t)'], t: [0, 6.2832], color: 'teal', width: 2 }, { param: ['1.65*cos(t)', '1.65*sin(t)'], t: [0, 6.2832], color: 'ink3', dash: true, width: 1.4 }], points: [{ x: 0, y: 0, r: 0, label: 'Earth', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1.17, y: 1.17, r: 6, color: 'gold', label: 'GPS', labelDx: 8 }] }, caption: 'A GPS orbit (radius about 26 600 km, 4.2 Earth radii) drawn to scale with the Earth.' },
      choices: ['Its energy per unit mass and its angular momentum — but not its linear momentum', 'Its energy, momentum and angular momentum — all ten Poincaré charges', 'Only its angular momentum: energy is not defined in curved spacetime', 'Nothing: curved spacetime has no conservation laws'],
      answer: 0,
      why: {
        1: 'Without spatial translation symmetry there is no conserved momentum: the satellite’s momentum turns round every orbit.',
        2: t`The time-translation Killing vector $\xi_t$ gives the conserved energy $E = -\mathbf p\cdot\xi_t$.`,
        3: 'Every Killing vector gives a conserved quantity along geodesics; Schwarzschild has four.',
      },
      hints: ['Each Killing vector gives one conserved quantity along a geodesic.', 'Which symmetries does a static, spherical spacetime have?'],
      teach: 'In curved spacetime only the Killing symmetries survive, and each gives one conserved quantity: Schwarzschild conserves energy and angular momentum, not momentum.',
      explain: t`$E = -\mathbf p\cdot\xi_t$ and $\vec L$ (from the three rotations) are conserved; momentum is not. Real orbits feel the Moon, Sun and Earth’s oblateness, which break these symmetries slightly.`,
    }),
    num({
      id: 'cp-event', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([0.3, 0.5, 0.6]), tt = r.pick([4, 6, 10]), xx = r.pick([2, -3, 5]), at = r.pick([1, -2, 3]);
        const g = 1 / Math.sqrt(1 - v * v), ans = g * (tt - v * xx) + at;
        return {
          prompt: t`A probe’s navigation frame is the station frame boosted to $v = ${v}$ along $x$ and with its clock zero shifted by $a_t = ${at}$ (units with $c = 1$, times in seconds, distances in light-seconds): $t' = \gamma(t - vx) + a_t$. A beacon flashes at $t = ${tt}\ \text{s}$, $x = ${xx}$ light-seconds in the station frame. When does it flash in the probe’s frame?`,
          visual: { type: 'graph', params: { x: [-12, 12], y: [-1, 12], equal: true, aspect: 'wide', xlabel: 'x (light-seconds)', ylabel: 't (s)', curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }, { fn: `x/${v}`, domain: [0, 12 * v], color: 'gold', width: 2, label: 'probe’s t′ axis', labelAt: 10 * v, labelDx: 6 }, { fn: `${v}*x`, domain: [-12, 12], color: 'gold', width: 2, label: 'probe’s x′ axis', labelAt: 9, labelDy: 14 }], points: [{ x: xx, y: tt, r: 6, color: 'accent', label: 'beacon' }] }, caption: t`The station’s axes and the probe’s (gold), $c = 1$, at a common origin; the clock shift $a_t$ is not drawn.` },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: g * (tt - v * xx), feedback: t`You left out the clock offset $a_t$: a Poincaré map is a Lorentz transformation plus a translation.` }, { value: tt - v * xx + at, feedback: t`You dropped $\gamma$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * Math.abs(ans)),
          hints: [t`$\gamma = 1/\sqrt{1 - ${v}^2} = ${nice(g, 4)}$.`],
          teach: 'A change of inertial frame with a reset clock is one Poincaré transformation: boost, then shift.',
          explain: t`$t' = ${nice(g, 4)}(${tt} - ${v}\cdot${xx}) + (${at}) = ${nice(ans, 4)}\ \text{s}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §§1.6, 3.8 (Lorentz and Poincaré; Killing vectors)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Weinberg, The Quantum Theory of Fields I (CUP, 1995), §§2.2–2.5', url: 'https://doi.org/10.1017/CBO9781139644167' },
  ],
});
