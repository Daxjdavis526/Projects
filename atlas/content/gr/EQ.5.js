// The Ricci tensor and the Ricci scalar, dissected: the contraction of the
// Riemann tensor (Carroll's slot, R_μν = R^λ_μλν), its trace with the inverse
// metric, and the meaning of R_μν for a ball of freely falling particles,
// V̈/V = −R_μν u^μ u^ν (Baez & Bunn). Verified with sympy: 2-sphere R_μν =
// g_μν/a², R = 2/a²; Schwarzschild R_μν = 0; flat FLRW R = 6(ä/a + ȧ²/a²)/c².
// Avoids repeating gr.S15.i (volume rates) and gr.S17.i (Weyl counting).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { G, C, sci, round, table4, dustBall, hubble, lcdm, OM, OL, GYR } from './_eq.js';

const t = String.raw;

// the Ricci tensor as a 4 × 4 symmetric array
const ricciTable = table4({
  cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => `R${'₀₁₂₃'[i]}${'₀₁₂₃'[j]}`)),
  colors: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 'gold' : i < j ? 'accent' : 'ink4'))),
  rowName: 'μ', colName: 'ν', dx: -12,
  caption: t`The Ricci tensor $R_{\mu\nu}$ as an array: one row and one column per value of its two free indices. It is symmetric, $R_{\mu\nu} = R_{\nu\mu}$, so the faint entries repeat the blue ones.`,
});

// one slice of space around a black hole, embedded (Flamm's paraboloid), r_s = 1
const sliceOfSpace = {
  type: 'surface3d',
  params: {
    surface: ['u*cos(v)', 'u*sin(v)', '2*sqrt(u - 1) - 4'], domain: [[1, 5], [0, 6.2832]], n: 30, axes: false, alpha: 0.4, colorBy: false,
    yaw: 0.5, pitch: 0.42, dist: 15, target: [0, 0, -2.2],
    caption: 'Not a rubber sheet — nothing rolls on it. One slice of space around a black hole at one moment, drawn in an imaginary extra dimension so that lengths along the surface are true lengths. Space here is genuinely curved, though the Ricci tensor of the spacetime is zero. Drag to rotate.',
  },
};

// a saddle: curving up one way and down the other
const saddle = {
  type: 'surface3d',
  params: {
    z: '(x^2 - y^2)/2', domain: [[-1.6, 1.6], [-1.6, 1.6]], n: 28, axes: false, colorBy: false, yaw: 0.7, pitch: 0.5, dist: 9,
    caption: 'A saddle, z = (x² − y²)/2, drawn in three dimensions: along one direction it curves up, along the other down. Drag to rotate.',
  },
};

// the scale factor of a flat ΛCDM universe, with today marked
const T0 = lcdm.age() / GYR;
const aPlot = {
  type: 'graph',
  params: {
    x: [0, 20], y: [0, 1.75], xlabel: 'time since the Big Bang (Gyr)', ylabel: 'scale factor a',
    curves: [{ fn: lcdm.expr(), domain: [0, 20], color: 'accent' }],
    vlines: [{ x: round(T0, 4), label: 'today' }],
    hlines: [{ y: 1 }],
  },
  caption: t`The scale factor $a(t)$ of a flat universe of matter ($\Omega_m = ${OM}$) and a cosmological constant ($\Omega_\Lambda = ${OL}$), radiation neglected. The curve bends upward today: the expansion is accelerating.`,
};

const sphereCap = (lat, caption) => ({ type: 'gr-sphere-transport', params: { mode: 'cap', lat, transport: false, readout: false }, caption });

export default lesson({
  id: 'gr.EQ.5',
  kind: 'dissection',
  title: 'The Ricci tensor and scalar',
  minutes: 8, difficulty: 3,
  badges: ['est-der'],
  equation: t`\begin{gathered}\part{1}{R_{\mu\nu}} = \part{2}{R^\lambda{}_{\mu\lambda\nu}} \qquad\quad \part{3}{R} = \part{4}{g^{\mu\nu}}\,\part{1}{R_{\mu\nu}} \\[6pt] \part{5}{\left.\frac{\ddot V}{V}\right|_{0} = -R_{\mu\nu}\,u^\mu u^\nu}\end{gathered}`,
  intro: t`The Riemann tensor holds all of curvature — 20 numbers at every event. Summing over one pair of its slots keeps the part that **changes volumes**: the Ricci tensor, 10 numbers. Summing once more gives a single number, the Ricci scalar. The last line says what the Ricci tensor means: how a small ball of freely falling particles, released at rest, starts to shrink or grow.

This is the part of curvature that matter controls directly — Einstein's equations set it, event by event, from the energy, momentum and stress there. Conventions are Carroll's: signature $(-,+,+,+)$, $x^0 = ct$, indices $0$–$3$, repeated up–down pairs summed. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`R_{\mu\nu}`, name: 'the Ricci tensor', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`A symmetric $4\times4$ array — $R_{\mu\nu} = R_{\nu\mu}$, so **10 independent components** — built from the metric's first and second derivatives. Both indices are free and down; each pair $(\mu, \nu)$ is one component.

Of Riemann's 20 numbers it keeps the 10 that change **volumes**; the other 10 (the Weyl tensor) change only shapes — tides in empty space and gravitational waves. "Vacuum" in general relativity means $R_{\mu\nu} = 0$, while the Riemann tensor can still be large.`,
    },
    {
      tex: t`R^\lambda{}_{\mu\lambda\nu}`, name: 'the contraction', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`The output index of the Riemann tensor is set equal to its first loop index and **summed**: $\lambda$ appears once up and once down, so $R_{\mu\nu} = R^0{}_{\mu0\nu} + R^1{}_{\mu1\nu} + R^2{}_{\mu2\nu} + R^3{}_{\mu3\nu}$. Physically it adds up, direction by direction, how each separation of a falling ball accelerates along itself — the stretch along one axis plus the squeezes along the others.

Which slot is contracted is a **convention**. Contracting the last slot instead gives $R^\lambda{}_{\mu\nu\lambda} = -R_{\mu\nu}$ and flips the sign of everything downstream; contracting the first two gives zero. Carroll and Misner–Thorne–Wheeler use this one.`,
    },
    {
      tex: t`R`, name: 'the Ricci scalar', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`One number per event: the **trace** of the Ricci tensor. Every observer computes the same value. On a sphere of radius $a$, $R = 2/a^2$ — twice the Gaussian curvature $1/a^2$; on a three-dimensional sphere, $6/a^2$. Positive $R$ means that, on average, straight lines that start parallel converge, as on a sphere; negative means they spread, as on a saddle.

One number cannot hold all of curvature: outside a star or black hole $R = 0$, yet the tides there can tear things apart.`,
    },
    {
      tex: t`g^{\mu\nu}`, name: 'the inverse metric (taking the trace)', badge: 'est-der',
      text: t`To turn $R_{\mu\nu}$ into a number, both indices are paired with the **inverse metric** and summed: $R = \sum_{\mu,\nu} g^{\mu\nu}R_{\mu\nu}$. For a diagonal metric this is $R = \sum_\mu R_{\mu\mu}/g_{\mu\mu}$ — and with $g_{00} < 0$, the time–time entry enters with a minus sign.

Simply adding the diagonal entries would give a coordinate-dependent number; dividing by the metric is what makes $R$ a scalar. It is also where the size of a sphere lives: $R_{\theta\theta} = 1$ for every sphere, but $g^{\theta\theta} = 1/a^2$.`,
    },
    {
      tex: t`\left.\frac{\ddot V}{V}\right|_{0} = -R_{\mu\nu}\,u^\mu u^\nu`, name: 'what Ricci means: a falling ball’s volume', badge: 'est-der', units: t`$\text{s}^{-2}$`,
      text: t`Release a small ball of test particles at rest relative to each other, all falling freely with four-velocity $u^\mu$ ($u^0 = c$ in the ball's own frame). At that moment its volume $V$ starts to change at this rate (dots are proper-time derivatives). With Einstein's equations it becomes $-4\pi G(\rho + 3p/c^2) + \Lambda c^2$ in the ball's rest frame: matter makes the ball **shrink** — gravity attracts — and pressure counts as well as mass.

In empty space with $\Lambda = 0$, $R_{\mu\nu} = 0$: the volume starts out unchanged, while the tides still change the ball's shape.`,
      more: t`This is Baez and Bunn's statement of Einstein's equation: for every small ball, in every frame, $\ddot V/V = -4\pi G\,(\rho + p_x/c^2 + p_y/c^2 + p_z/c^2) + \Lambda c^2$ at the moment of release. Taken over all frames, it contains all ten field equations.`,
    },
  ],
  readAloud: t`The Ricci tensor is the trace of the Riemann tensor — the part of curvature that makes a small ball of freely falling particles shrink or grow — and the Ricci scalar is its trace once more, a single number at each event.`,
  why: t`Ricci curvature is exactly the part that Einstein's equations tie to matter: $R_{\mu\nu}$ and $R$ make up their left-hand side, and "empty space" means $R_{\mu\nu} = 0$.`,
  visual: {
    type: 'gr-dustball',
    title: 'Ricci curvature changes volumes',
    lead: t`Choose where the ball falls. **Inside matter** it shrinks equally in every direction: that is Ricci curvature, $\ddot V/V = -R_{\mu\nu}u^\mu u^\nu$. **In empty space near a mass** it is stretched and squeezed but keeps its volume at first: Ricci is zero there and only the Weyl part acts.`,
    tasks: [
      'Inside matter, raise the density: the volume graph turns down sooner — more Ricci curvature.',
      'Set the pressure to ⅓ (light): the ball shrinks faster than dust of the same density, because pressure is part of the source.',
      'Switch to empty space near a mass: the volume graph starts flat while the shape distorts.',
    ],
    params: { mode: 'matter', modes: ['tides', 'matter', 'both'], body: 'earth', bodies: true, rho: 1000, wSlider: true, lambdaSlider: true, t: 0.6 },
  },
  practice: [
    mcq({
      id: 'rank', difficulty: 1,
      prompt: t`$$\underbrace{R_{\mu\nu}}_{\text{2 slots}} = \underbrace{R^\lambda{}_{\mu\lambda\nu}}_{\text{4 slots}}$$ The right side has four index slots, the left only two. Where did the other two go?`,
      choices: [
        t`$\lambda$ appears once up and once down, so it is summed over $0$–$3$: summing a pair of slots removes both`,
        t`$\lambda$ is set to zero, so only one component of the Riemann tensor is used`,
        t`$R_{\mu\nu}$ is the single Riemann component with $\lambda$ equal to $\mu$`,
        t`The two $\lambda$'s cancel, as in a fraction`,
      ],
      answer: 0,
      why: {
        1: t`No value is singled out: all four values of $\lambda$ are added, $R^0{}_{\mu0\nu} + R^1{}_{\mu1\nu} + R^2{}_{\mu2\nu} + R^3{}_{\mu3\nu}$.`,
        2: t`$\mu$ is still free on both sides; it is the summed $\lambda$ that disappears.`,
        3: 'Indices are labels for components, not numbers to divide. Repeated up–down pairs are summed, which is why they leave the result.',
      },
      hints: ['An index that appears once up and once down in the same term is summed.'],
      teach: 'Contracting a tensor — summing a repeated up–down pair of indices — removes those two slots.',
      explain: t`The repeated $\lambda$ is a dummy index: $R_{\mu\nu} = \sum_\lambda R^\lambda{}_{\mu\lambda\nu}$. The free indices $\mu$ and $\nu$ remain, so the result is a $4\times4$ array — symmetric, with 10 independent entries.`,
      visual: ricciTable,
    }),
    mcq({
      id: 'contract', difficulty: 2,
      prompt: t`The Riemann tensor $R^\rho{}_{\sigma\mu\nu}$ can be contracted on different pairs of slots. In Carroll's and Misner–Thorne–Wheeler's convention $R_{\sigma\nu} = R^\rho{}_{\sigma\rho\nu}$. What do the other choices give?`,
      choices: [
        t`$R^\rho{}_{\sigma\nu\rho} = -R_{\sigma\nu}$ (the loop indices are antisymmetric), and $R^\rho{}_{\rho\mu\nu} = 0$`,
        t`All three contractions give the same $R_{\sigma\nu}$`,
        t`$R^\rho{}_{\sigma\nu\rho} = R_{\sigma\nu}$, and $R^\rho{}_{\rho\mu\nu} = R\,g_{\mu\nu}$`,
        t`Each gives a different tensor, unrelated to the others`,
      ],
      answer: 0,
      why: {
        1: t`Swapping the last two slots flips the sign, so contracting the last slot gives minus the Ricci tensor — a classic source of sign errors between textbooks.`,
        2: t`Antisymmetry in the last two slots makes the last-slot contraction exactly $-R_{\sigma\nu}$; and with the first index lowered, $R_{\rho\sigma\mu\nu}$ is antisymmetric in its first pair, so tracing them gives zero.`,
        3: 'The symmetries tie them together: only one independent contraction exists, up to sign.',
      },
      hints: [t`Use $R^\rho{}_{\sigma\mu\nu} = -R^\rho{}_{\sigma\nu\mu}$.`, t`For the first pair, lower $\rho$: $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu}$. What is the trace of an antisymmetric matrix?`],
      teach: t`Up to sign there is only one way to contract the Riemann tensor; books that contract a different slot get $-R_{\mu\nu}$, so check the convention before comparing signs.`,
      explain: t`Contracting the last slot: $R^\rho{}_{\sigma\nu\rho} = -R^\rho{}_{\sigma\rho\nu} = -R_{\sigma\nu}$. Contracting the first two: $g^{\rho\sigma}R_{\rho\sigma\mu\nu} = 0$ because $R_{\rho\sigma\mu\nu}$ is antisymmetric in $\rho\sigma$. Physically the contraction adds, over the three axes of a falling ball, each axis's own relative acceleration — near a mass $+2 - 1 - 1 = 0$.`,
      visual: dustBall({ mode: 'tides', body: 'earth', r: 1, t: 0.5, arrows: true }, t`Near a mass a falling ball's three axes accelerate apart at $+2$, $-1$, $-1$ (times $GM/r^3$). The Ricci contraction $R^\lambda{}_{0\lambda0}$ adds them: zero in empty space, so the volume starts out unchanged.`),
    }),
    num({
      id: 'sphere-R', difficulty: 2,
      gen(r) {
        const [what, a] = r.pick([['Earth (mean radius $6.371\\times10^{6}$ m)', 6.371e6], ['the Moon (radius $1.737\\times10^{6}$ m)', 1.737e6], ['Mars (radius $3.390\\times10^{6}$ m)', 3.390e6], ['a ball of radius 0.5 m', 0.5]]);
        return {
          prompt: t`The surface of a sphere of radius $a$ has Ricci scalar $R = 2/a^2$. What is $R$ for the surface of ${what}, in $\text{m}^{-2}$?`,
          answer: 2 / (a * a), units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: 1 / (a * a), feedback: 'That is the Gaussian curvature K = 1/a². On a surface the Ricci scalar is twice it.' }, { value: 6 / (a * a), feedback: 'That is the three-dimensional sphere’s value, 6/a². A surface is two-dimensional: 2/a².' }],
          hints: [t`$R = 2/a^2$ with $a$ in metres.`],
          teach: 'A sphere’s Ricci scalar is 2/a²: twice its Gaussian curvature, and tiny for anything planet-sized.',
          explain: t`$R = 2/a^2 = ${sci(2 / (a * a))}\ \text{m}^{-2}$. Curvature in $\text{m}^{-2}$ is "one over a length squared": the length here is the radius itself.`,
          visual: sphereCap(45, 'A sphere, the simplest curved surface: equally curved at every point.'),
        };
      },
    }),
    mcq({
      id: 'sphere-ricci', difficulty: 3,
      prompt: t`For a sphere of radius $a$ in angles $(\theta, \phi)$, the Ricci tensor comes out as $R_{\theta\theta} = 1$ and $R_{\phi\phi} = \sin^2\theta$ — the same for **every** radius, though a small sphere is far more curved than a large one. Where does the size go?`,
      choices: [
        t`Into the metric: $R_{\mu\nu} = g_{\mu\nu}/a^2$, and taking the trace with $g^{\mu\nu}$ (which carries $1/a^2$) gives $R = 2/a^2$`,
        'Nowhere: Ricci curvature does not depend on size',
        t`It is a mistake: it should be $R_{\theta\theta} = 1/a^2$`,
        'Into the Weyl part of the curvature',
      ],
      answer: 0,
      why: {
        1: t`The scalar $R = 2/a^2$ certainly depends on size. The components do not, because the coordinates are angles, which do not scale with the sphere.`,
        2: t`$R_{\theta\theta} = 1$ is right: in angle coordinates the metric $g_{\theta\theta} = a^2$ carries the size, and $R_{\theta\theta} = g_{\theta\theta}/a^2 = 1$.`,
        3: 'On a two-dimensional surface the Weyl tensor is identically zero; all curvature is Ricci.',
      },
      hints: [t`Compare $R_{\mu\nu}$ with the metric $g_{\theta\theta} = a^2$, $g_{\phi\phi} = a^2\sin^2\theta$.`, t`$R = g^{\theta\theta}R_{\theta\theta} + g^{\phi\phi}R_{\phi\phi}$ with $g^{\theta\theta} = 1/a^2$ and $g^{\phi\phi} = 1/(a^2\sin^2\theta)$.`],
      teach: t`Tensor components depend on the coordinates; the size of a sphere shows up only when the inverse metric turns $R_{\mu\nu}$ into the scalar $R$.`,
      explain: t`$R_{\mu\nu} = g_{\mu\nu}/a^2$ — proportional to the metric. Then $R = g^{\theta\theta}\cdot1 + g^{\phi\phi}\sin^2\theta = 1/a^2 + 1/a^2 = 2/a^2$. The inverse metric is where the radius enters.`,
      visual: sphereCap(30, 'A sphere of any radius: in angle coordinates its Ricci components are the same numbers; only the metric knows how big it is.'),
    }),
    mcq({
      id: 'saddle', difficulty: 2,
      prompt: t`At the centre of a saddle-shaped surface, two straight lines (geodesics) that start out parallel slowly spread apart. What is the sign of the Ricci scalar there?`,
      choices: [
        'Negative: geodesics diverging is negative curvature',
        'Positive, because the surface is curved',
        'Zero, because the upward and downward curving cancel',
        'It has no sign: the Ricci scalar is always positive',
      ],
      answer: 0,
      why: {
        1: 'Positive curvature makes parallel geodesics converge, as meridians do toward a pole. Spreading is the opposite.',
        2: 'They add rather than cancel: curving up one way and down the other gives a negative product of the two curvatures, the Gaussian curvature.',
        3: 'The Ricci scalar can be either sign; a sphere’s is positive, a saddle’s negative.',
      },
      hints: ['On a sphere, lines that start parallel (meridians at the equator) meet at the pole. What does the opposite behaviour mean?'],
      teach: 'Positive Ricci scalar focuses geodesics (sphere); negative spreads them (saddle).',
      explain: t`At the centre of $z = (x^2 - y^2)/2$ the Gaussian curvature is $K = -1$, so $R = 2K = -2$ (in units of the surface's size): nearby geodesics diverge. In spacetime, ordinary matter gives $R_{\mu\nu}u^\mu u^\nu > 0$ and makes falling particles converge — gravity attracts.`,
      visual: saddle,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-schw', difficulty: 2,
      prompt: t`Outside a non-spinning black hole, $R_{\mu\nu} = 0$ everywhere. What follows?`,
      choices: [
        t`$R = 0$ there too, yet the Riemann tensor is not zero: the curvature that remains is tidal`,
        t`$R = 0$ and the Riemann tensor is zero: space around the hole is flat`,
        t`$R$ is not zero, because the hole's mass curves spacetime`,
        t`$R_{\mu\nu} = 0$ only far from the hole; near the horizon it grows`,
      ],
      answer: 0,
      why: {
        1: t`Ricci-flat is not flat. The curvature invariant $R_{\rho\sigma\mu\nu}R^{\rho\sigma\mu\nu} = 48G^2M^2/(c^4r^6)$ is not zero, and tides near a small black hole are lethal.`,
        2: t`$R = g^{\mu\nu}R_{\mu\nu}$, and the trace of a zero tensor is zero.`,
        3: t`The vacuum field equations hold right down to the horizon and inside it: $R_{\mu\nu} = 0$ wherever there is no matter.`,
      },
      hints: [t`$R$ is built from $R_{\mu\nu}$. The Riemann tensor has 10 more components than $R_{\mu\nu}$.`],
      teach: t`Vacuum means Ricci-flat, not flat: $R_{\mu\nu} = 0$ and $R = 0$, while the Weyl part of the Riemann tensor carries the tides.`,
      explain: t`With $R_{\mu\nu} = 0$, its trace $R$ vanishes too. The other ten curvature components — the Weyl tensor — are not fixed by local matter and are large near a black hole: they are its tides.`,
      visual: sliceOfSpace,
    }),
    num({
      id: 'cp-cosmos', difficulty: 3, transfer: true,
      gen(r) {
        const h0 = r.pick([67.4, 70.0, 73.0]);
        const H = hubble(h0), acc = OL - OM / 2;
        const R = (6 * (acc + 1) * H * H) / (C * C);
        return {
          prompt: t`For a flat expanding universe the Ricci scalar is $R = \dfrac{6}{c^2}\left(\dfrac{\ddot a}{a} + \dfrac{\dot a^2}{a^2}\right)$. Today $\dot a/a = H_0 = ${h0}$ km/s/Mpc $= ${sci(H, 4)}\ \text{s}^{-1}$, and with $\Omega_m = ${OM}$, $\Omega_\Lambda = ${OL}$ the expansion is accelerating at $\ddot a/a = ${round(acc, 4)}\,H_0^2$. What is the Ricci scalar of the universe today, in $\text{m}^{-2}$?`,
          answer: R, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: (6 * H * H) / (C * C), feedback: 'You left out the acceleration term ä/a = 0.5275 H₀².' }, { value: 6 * (acc + 1) * H * H, feedback: 'Divide by c² to turn s⁻² into m⁻².' }, { value: (6 * (1 - acc) * H * H) / (C * C), feedback: 'ä/a is positive today: the expansion is speeding up, so add it.' }],
          hints: [t`$\ddot a/a + \dot a^2/a^2 = (${round(acc, 4)} + 1)\,H_0^2$.`, t`$R = 6\times${round(acc + 1, 4)}\times(${sci(H, 4)})^2/(2.998\times10^{8})^2$.`],
          teach: 'The whole universe has a Ricci scalar too — about 5 × 10⁻⁵² m⁻², almost all of it from the cosmological constant.',
          explain: t`$R = 6\times${round(acc + 1, 4)}\times${sci(H * H, 4)}/${sci(C * C, 4)} = ${sci(R)}\ \text{m}^{-2}$. The trace of Einstein's equations gives the same number as $8\pi G\rho_m/c^2 + 4\Lambda$: matter supplies about a tenth, the cosmological constant the rest.`,
          visual: aPlot,
        };
      },
    }),
    num({
      id: 'cp-dust', difficulty: 2,
      gen(r) {
        const [what, rho] = r.pick([['water', 1000], ['rock of density 2700 kg/m³', 2700], ['the Earth’s mean density, 5514 kg/m³', 5514], ['lead (11 340 kg/m³)', 11340]]);
        const R = (8 * Math.PI * G * rho) / (C * C);
        return {
          prompt: t`Taking the trace of Einstein's equations for pressure-free matter (dust) of density $\rho$, with $\Lambda = 0$, gives $R = \dfrac{8\pi G\rho}{c^2}$. What is the Ricci scalar inside ${what}${rho === 1000 ? ' (1000 kg/m³)' : ''}, in $\text{m}^{-2}$?`,
          answer: R, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: (4 * Math.PI * G * rho) / (C * C), feedback: 'That is R₀₀ = 4πGρ/c², the time–time component. The scalar is twice it for dust.' }, { value: 8 * Math.PI * G * rho, feedback: 'Divide by c²: curvature is in m⁻².' }],
          hints: [t`$8\pi G = 1.677\times10^{-9}$ in SI; $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'Inside ordinary matter the Ricci scalar is about 10⁻²³ m⁻²: a curvature radius of a few hundred million kilometres.',
          explain: t`$R = 8\pi G\rho/c^2 = ${sci(R)}\ \text{m}^{-2}$, a curvature radius $1/\sqrt{R} = ${sci(1 / Math.sqrt(R))}$ m — about $${sci(1 / Math.sqrt(R) / 1.496e11, 2)}$ AU. That is why general relativity's corrections inside a planet are so small.`,
          visual: dustBall({ mode: 'matter', rho, t: 0.6 }, 'A small ball of test grains — ones that feel only gravity — released at rest inside uniform matter: it shrinks equally in every direction.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6 (Ricci tensor and scalar)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation” (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
  ],
});
