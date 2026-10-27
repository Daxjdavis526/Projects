// The Einstein tensor, dissected: G_μν = R_μν − ½R g_μν and the contracted
// Bianchi identity ∇^μ G_μν = 0 that makes it the left side of Einstein's
// equations. Verified with sympy: 2-sphere G_ab = 0; flat FLRW (x⁰ = ct,
// convention a₀ = 1, k in m⁻²) G_00 = 3(ȧ²/c² + k)/a² (here k = 0); trace
// g^μν G_μν = R(1 − n/2). Avoids repeating gr.EQ.1 (why the ½) and gr.S17.i
// (Ricci versus Weyl).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { G, C, sci, round, table4, hubble, H0, MPC, M_P } from './_eq.js';

const t = String.raw;

// the density (in protons per m³) that Einstein's equation demands of a flat universe expanding at H (km/s/Mpc)
const PROTONS = (3 * (1e3 / MPC) ** 2) / (8 * Math.PI * G * M_P);
const G00 = (h) => (3 * hubble(h) ** 2) / (C * C);
const G00_PER_H2 = G00(1);                                       // m⁻² per (km/s/Mpc)²
const demand = (slider) => ({
  type: 'graph',
  params: {
    x: [0, 100], y: [0, 12], xlabel: 'expansion rate H (km/s/Mpc)', ylabel: 'protons per m³',
    ...(slider ? {
      sliders: [{ key: 'H', label: 'Expansion rate $H$', min: 30, max: 100, step: 0.1, value: H0, unit: '\\text{km/s/Mpc}', explain: 'How fast the universe expands: galaxies 1 Mpc apart separate at $H$ km/s.' }],
      points: [{ x: 'H', y: `${round(PROTONS, 6)}*H^2`, color: 'gold' }],
      readouts: [
        { label: '$G_{00} = 3H^2/c^2$', expr: `${G00_PER_H2.toPrecision(6)}*H^2`, unit: '\\mathrm{m^{-2}}', digits: 3 },
        { label: 'density demanded, $\\rho = 3H^2/(8\\pi G)$', expr: `${(PROTONS * M_P).toPrecision(6)}*H^2`, unit: '\\mathrm{kg/m^3}', digits: 3 },
        { label: '… in protons per m³', expr: `${round(PROTONS, 6)}*H^2`, digits: 3 },
      ],
    } : {}),
    curves: [{ fn: `${round(PROTONS, 6)}*x^2`, color: 'gold' }],
  },
  caption: t`The total density — everything, dark energy included as a fluid — that Einstein's equation $G_{00} = \tfrac{8\pi G}{c^4}T_{00}$ demands of a flat universe expanding at rate $H$, in proton masses per cubic metre.`,
});

// the trace of the metric is the number of dimensions
const deltaTable = table4({
  cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? '1' : '0'))),
  colors: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 'gold' : 'ink4'))),
  rowName: 'μ', colName: 'ν', dx: -4,
  caption: t`$g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu{}_\nu$, the identity: 1 on the diagonal, 0 elsewhere, whatever the metric. Its trace, $\delta^\mu{}_\mu$, counts the dimensions — 4 in spacetime.`,
});

// dust in an expanding universe: ρ ∝ 1/a³, a consequence of ∇·T = 0
const dilution = {
  type: 'graph',
  params: {
    x: [0, 3.2], y: [0, 8.5], xlabel: 'scale factor a (1 = today)', ylabel: 'ρ / ρ today',
    curves: [{ fn: '1/x^3', domain: [0.49, 3.2], color: 'accent' }],
    points: [{ x: 1, y: 1, color: 'accent', label: 'today' }],
  },
  caption: t`Pressure-free matter in an expanding universe thins out as $1/a^3$: the same particles in a volume that grows as $a^3$. Energy conservation, $\nabla^\mu T_{\mu\nu} = 0$, says so — and the Bianchi identity makes Einstein's equations enforce it.`,
};

// Newton's potential of a uniform ball (GM = 1, radius 1)
const ballPotential = {
  type: 'graph',
  params: {
    x: [0, 4], y: [-1.95, 0.15], xlabel: 'r / R', ylabel: 'Φ (units of GM/R)',
    curves: [
      { fn: '-(3 - x^2)/2', domain: [0, 1], color: 'teal', label: 'inside: ∇²Φ = 4πGρ', labelAt: 0.05, labelDx: 4, labelDy: 18 },
      { fn: '-1/x', domain: [1, 4], color: 'accent', label: 'outside: ∇²Φ = 0', labelAt: 2.2, labelDy: 14 },
    ],
    vlines: [{ x: 1, label: 'surface' }],
  },
  caption: 'Newton’s potential of a uniform ball. Inside, its curvature ∇²Φ is the same everywhere, set by the density; outside it is zero. Einstein’s G₀₀ reproduces exactly this in weak gravity.',
};

// matter-only universes (Λ = 0) through the same point today with the same expansion rate — schematic
const fates = {
  type: 'graph',
  params: {
    x: [-1, 5.9], y: [0, 2.9], xlabel: 'time from today (units of 1/H₀)', ylabel: 'scale factor a',
    curves: [
      { param: ['t - sin(t) - 0.5708', '1 - cos(t)'], t: [0, 6.2832], color: 'bad' },
      { param: ['(2/3)*t^1.5 - 0.6667', 't'], t: [0, 2.9], color: 'gold' },
      { param: ['0.70711*(sinh(t) - t) - 0.7536', '0.5*(cosh(t) - 1)'], t: [0, 2.55], color: 'accent' },
    ],
    points: [{ x: 0, y: 1, color: 'ink', label: 'today' }],
  },
  caption: 'Three universes containing only matter (Λ = 0), all expanding at the same rate today. Red: twice the critical density (closed, k > 0) — it stops and recollapses. Gold: exactly critical (flat). Blue: half of it (open, k < 0). Exact solutions, drawn with today at the marked point; not our universe, which also has Λ.',
};

// a spacetime sliced into moments: constraints on each slice, evolution between them
const slices = {
  type: 'graph',
  params: {
    x: [0, 10], y: [-0.6, 4.2], axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [0, 1, 2, 3].map((k) => ({ param: ['0.5 + 9*t', `${k} + 0.25*sin(6.2832*t + ${k})`], t: [0, 1], color: k === 0 ? 'gold' : 'accent', width: 2.2 })),
    arrows: [{ from: [5, 0.3], to: [5, 0.75], color: 'ink2' }, { from: [5, 1.3], to: [5, 1.75], color: 'ink2' }, { from: [5, 2.3], to: [5, 2.75], color: 'ink2' }],
    points: [
      { x: 0.5, y: -0.45, r: 0.01, color: 'gold', label: 'starting moment: the data must obey 4 constraint equations', labelDx: 0, labelDy: 0 },
      { x: 5.4, y: 1.5, r: 0.01, color: 'ink2', label: '6 evolution equations step it forward', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'Schematic: a numerical-relativity code slices spacetime into moments of time. Four of the ten field equations only constrain each slice; the other six move it forward; the Bianchi identity keeps the constraints true as it goes.',
};

export default lesson({
  id: 'gr.EQ.6',
  kind: 'dissection',
  title: 'The Einstein tensor',
  minutes: 8, difficulty: 3,
  badges: ['est-der'],
  equation: t`\part{1}{G_{\mu\nu}} \equiv \part{2}{R_{\mu\nu}} - \part{3}{\tfrac12 R}\,\part{4}{g_{\mu\nu}} \qquad\quad \part{5}{\nabla^\mu G_{\mu\nu} = 0}`,
  intro: t`The Einstein tensor is the geometry side of Einstein's equations, $G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$. It is the Ricci tensor with its trace reversed — and the right-hand statement is why that matters: its divergence vanishes for **every** metric, so it can be set equal to a source of energy and momentum that is itself conserved. (The "G" is for Einstein, not Newton's constant.)

Conventions are Carroll's: signature $(-,+,+,+)$, $x^0 = ct$, indices $0$–$3$, repeated up–down pairs summed; $\equiv$ means "is defined as". Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`G_{\mu\nu}`, name: 'the Einstein tensor', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`A symmetric $4\times4$ array built from the metric and its first and second derivatives: 10 components, $\mu$ and $\nu$ both free. It is the part of curvature Einstein's equations hand to matter, component by component.

Its time–time component is set by the energy density: $G_{00} = \frac{8\pi G}{c^4}T_{00} = 8\pi G\rho/c^2$. In weak, static gravity $G_{00} \approx 2\nabla^2\Phi/c^2$, so that equation is Newton's $\nabla^2\Phi = 4\pi G\rho$. For a flat expanding universe $G_{00} = 3H^2/c^2$, set by the expansion rate $H$.`,
      more: t`Lovelock's theorem (1971): in four dimensions the only symmetric, divergence-free tensors built from the metric and its first two derivatives are combinations of $G_{\mu\nu}$ and $g_{\mu\nu}$. That is why the field equations can only be $G_{\mu\nu} + \Lambda g_{\mu\nu} = \kappa T_{\mu\nu}$.`,
    },
    {
      tex: t`R_{\mu\nu}`, name: 'the Ricci tensor', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`The volume-changing part of curvature (the previous dissection). On its own it cannot be the left-hand side: the contracted Bianchi identity gives its divergence as $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$, which is not zero in general. Setting it proportional to $T_{\mu\nu}$ would force the trace of $T_{\mu\nu}$ to be the same everywhere — false for any real star.`,
    },
    {
      tex: t`\tfrac12 R`, name: 'half the Ricci scalar', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`$R = g^{\mu\nu}R_{\mu\nu}$, one number per event. The $\tfrac12$ is forced: it is the only coefficient whose divergence, $\tfrac12\nabla_\nu R$, cancels the Ricci tensor's.

It also **reverses the trace**: $g^{\mu\nu}G_{\mu\nu} = R - \tfrac12R\cdot4 = -R$. So in four dimensions the trace of $G$ is minus the trace of $R_{\mu\nu}$, and the field equations can be rewritten as $R_{\mu\nu} = \kappa\left(T_{\mu\nu} - \tfrac12 T g_{\mu\nu}\right) + \Lambda g_{\mu\nu}$.`,
    },
    {
      tex: t`g_{\mu\nu}`, name: 'the metric', badge: 'est-der',
      text: t`The metric turns the single number $R$ into a $4\times4$ array of the same shape as $R_{\mu\nu}$, so the two can be subtracted. Its own trace is $g^{\mu\nu}g_{\mu\nu} = \delta^\mu{}_\mu = 4$: the number of dimensions.

That number decides everything about the trace: in $n$ dimensions $g^{\mu\nu}G_{\mu\nu} = R\,(1 - n/2)$. On a two-dimensional surface the Einstein tensor vanishes identically — there is no general relativity in two dimensions.`,
    },
    {
      tex: t`\nabla^\mu G_{\mu\nu} = 0`, name: 'the contracted Bianchi identity', badge: 'est-der', units: t`$\text{m}^{-3}$`,
      text: t`$\nabla^\mu = g^{\mu\alpha}\nabla_\alpha$ is the covariant derivative with its index raised, summed against the first index of $G$: a **divergence**, one equation for each $\nu$. It vanishes for **every metric whatsoever** — an identity of geometry, not a law of physics.

So Einstein's equations force $\nabla^\mu T_{\mu\nu} = 0$: energy and momentum are conserved, and how matter moves follows from the field equations themselves (dust, for example, must move on geodesics). It also means only 6 of the 10 equations are independent; 4 of them are constraints on each moment of time, like Gauss's law in electromagnetism.`,
    },
  ],
  readAloud: t`The Einstein tensor is the Ricci tensor minus half the Ricci scalar times the metric — the one combination of curvature whose divergence vanishes for every geometry, so it can equal a conserved source of energy and momentum.`,
  why: t`It is the geometry side of Einstein's equations; its built-in conservation law is why matter must move consistently with the curvature it causes.`,
  visual: {
    type: 'graph',
    title: 'The Einstein tensor demands a density',
    lead: t`For a flat expanding universe the Einstein tensor's time–time component is $G_{00} = 3H^2/c^2$, set by the expansion rate $H$ alone. Einstein's equation then demands a total density $\rho = c^2G_{00}/(8\pi G) = 3H^2/(8\pi G)$. Slide $H$ and read both sides of the balance.`,
    tasks: [
      'At the Planck value, H = 67.4 km/s/Mpc, the demand is about 5 proton masses per cubic metre: the critical density.',
      'Double H: the density demanded quadruples, because G₀₀ grows as H².',
      'The distance-ladder value, about 73 km/s/Mpc, would demand 17% more. Which is right is an open question — the Hubble tension.',
    ],
    ...demand(true),
  },
  practice: [
    expr({
      id: 'trace', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 5, 6]);
        const k = 1 - n / 2;
        return {
          prompt: t`Take the trace of $G_{\mu\nu} = R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}$ in a spacetime of $n = ${n}$ dimensions, where $g^{\mu\nu}g_{\mu\nu} = ${n}$. Write $g^{\mu\nu}G_{\mu\nu}$ in terms of $R$. (In four dimensions it is $-R$.)`,
          answer: `${k}*R`, answerTeX: k === -0.5 ? t`-\tfrac12 R` : `${k}R`, lhs: t`g^{\mu\nu}G_{\mu\nu}`,
          vars: { R: [0.5, 3] },
          errors: [{ answer: '-R', feedback: `That is the four-dimensional result. Here the metric’s trace is ${n}, so the second term is ½R × ${n}.` }, { answer: `${1 + n / 2}*R`, feedback: 'Subtract: the trace of −½R g_μν is −½R × n.' }],
          hints: [t`$g^{\mu\nu}R_{\mu\nu} = R$ and $g^{\mu\nu}g_{\mu\nu} = n$.`, t`So $g^{\mu\nu}G_{\mu\nu} = R - \tfrac12 R\cdot ${n}$.`],
          teach: t`The trace of the Einstein tensor is $R(1 - n/2)$: $-R$ in spacetime, and zero on a two-dimensional surface.`,
          explain: t`$g^{\mu\nu}G_{\mu\nu} = R - \tfrac{${n}}{2}R = ${k === -0.5 ? '-\\tfrac12' : k}\,R$. The trace of the metric counts dimensions, so the answer depends on $n$; for $n = 2$ it is exactly zero.`,
          visual: deltaTable,
        };
      },
    }),
    mcq({
      id: 'two-d', difficulty: 2,
      prompt: t`On any two-dimensional surface the Ricci tensor is $R_{ab} = \tfrac12 R\,g_{ab}$ (for a sphere of radius $a$: $g_{ab}/a^2$, with $R = 2/a^2$). What is the Einstein tensor of a surface, and what does that say about general relativity in two dimensions?`,
      choices: [
        t`$G_{ab} = 0$ identically, so the field equations would demand $T_{ab} = 0$: two-dimensional gravity has no content`,
        t`$G_{ab} = R_{ab}$, because the correction vanishes in two dimensions`,
        t`$G_{ab} = -\tfrac12 R\,g_{ab}$, a negative curvature`,
        t`$G_{ab} = 2/a^2$ on a sphere, the same as the Ricci scalar`,
      ],
      answer: 0,
      why: {
        1: t`The correction $\tfrac12 R g_{ab}$ is exactly $R_{ab}$ here, so it cancels it rather than vanishing.`,
        2: t`Subtract carefully: $\tfrac12 R g_{ab} - \tfrac12 R g_{ab} = 0$.`,
        3: t`$G_{ab}$ is a tensor with two indices, not a number; and it is zero.`,
      },
      hints: [t`Substitute $R_{ab} = \tfrac12 R\,g_{ab}$ into $G_{ab} = R_{ab} - \tfrac12 R\,g_{ab}$.`],
      teach: 'In two dimensions the Einstein tensor vanishes for every surface, so a two-dimensional general relativity would be empty.',
      explain: t`$G_{ab} = \tfrac12 R g_{ab} - \tfrac12 R g_{ab} = 0$ for every surface, curved or not. Einstein's equations in two dimensions would read $0 = \kappa T_{ab}$: no matter allowed. Gravity needs at least three dimensions — and tides and waves need four.`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 40, transport: false, readout: false }, caption: t`A sphere: curved ($R = 2/a^2$), yet its Einstein tensor is zero, as it is for every surface.` },
    }),
    mcq({
      id: 'identity', difficulty: 2,
      prompt: t`For which metrics does $\nabla^\mu G_{\mu\nu} = 0$ hold?`,
      choices: [
        'For every metric whatsoever: it is an identity of geometry, true whether or not Einstein’s equations hold',
        'Only for solutions of Einstein’s equations',
        t`Only in empty space, where $T_{\mu\nu} = 0$`,
        t`Only when the cosmological constant $\Lambda$ is zero`,
      ],
      answer: 0,
      why: {
        1: t`It is the other way round: because the identity always holds, Einstein's equations force $\nabla^\mu T_{\mu\nu} = 0$ on the source.`,
        2: t`It holds inside matter too, and there it is what makes $\nabla^\mu T_{\mu\nu} = 0$.`,
        3: t`$\nabla^\mu g_{\mu\nu} = 0$ as well (the metric is covariantly constant), so adding $\Lambda g_{\mu\nu}$ changes nothing.`,
      },
      hints: ['Does the identity need to know anything about matter?'],
      teach: 'The contracted Bianchi identity ∇^μG_μν = 0 is pure geometry; through the field equations it becomes the conservation of energy and momentum.',
      explain: t`It follows from the symmetries of the Riemann tensor alone. Through $G_{\mu\nu} + \Lambda g_{\mu\nu} = \kappa T_{\mu\nu}$ it becomes $\nabla^\mu T_{\mu\nu} = 0$ — in an expanding universe, for example, it makes dust thin out exactly as $1/a^3$.`,
      visual: dilution,
    }),
    num({
      id: 'flrw-g00', difficulty: 2,
      gen(r) {
        const h = r.pick([67.4, 70.0, 73.0]);
        const H = hubble(h), g = G00(h);
        return {
          prompt: t`For a flat expanding universe, $G_{00} = 3H^2/c^2$ (with $x^0 = ct$). Take $H = ${h}$ km/s/Mpc $= ${sci(H, 4)}\ \text{s}^{-1}$. What is $G_{00}$, in $\text{m}^{-2}$?`,
          answer: g, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: 3 * H * H, feedback: 'Divide by c²: with x⁰ = ct, curvature is in m⁻².' }, { value: (3 * H) / (C * C), feedback: 'Square H.' }],
          hints: [t`$H^2 = ${sci(H * H, 4)}\ \text{s}^{-2}$; $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'The Einstein tensor of the expanding universe is tiny — about 10⁻⁵² m⁻² — and it demands a density of about five protons per cubic metre.',
          explain: t`$G_{00} = 3(${sci(H, 4)})^2/(2.998\times10^{8})^2 = ${sci(g)}\ \text{m}^{-2}$. Setting it equal to $8\pi G\rho/c^2$ gives $\rho = ${sci((g * C * C) / (8 * Math.PI * G))}$ kg/m³ — the critical density.`,
          visual: demand(false),
        };
      },
    }),
    mcq({
      id: 'weak-field', difficulty: 3,
      prompt: t`In weak, static gravity the Einstein tensor's time–time component is $G_{00} \approx \dfrac{2\nabla^2\Phi}{c^2}$, where $\Phi$ is Newton's potential. The field equation sets $G_{00} = \dfrac{8\pi G}{c^4}T_{00}$ with $T_{00} = \rho c^2$. Which equation results?`,
      choices: [t`$\nabla^2\Phi = 4\pi G\rho$ — Newton's law of gravity, in Poisson's form`, t`$\nabla^2\Phi = 8\pi G\rho$`, t`$\nabla^2\Phi = 2\pi G\rho$`, t`$\nabla^2\Phi = 4\pi G\rho\,c^2$`],
      answer: 0,
      why: {
        1: t`You dropped the 2 in $G_{00} \approx 2\nabla^2\Phi/c^2$: $2\nabla^2\Phi/c^2 = 8\pi G\rho/c^2$ gives $4\pi G\rho$.`,
        2: t`Check the algebra: $8\pi G\rho/2 = 4\pi G\rho$, not $2\pi G\rho$.`,
        3: t`Track the $c$'s: $\frac{8\pi G}{c^4}\cdot\rho c^2 = \frac{8\pi G\rho}{c^2}$, and the $c^2$ cancels the one in $G_{00}$.`,
      },
      hints: [t`Set $\dfrac{2\nabla^2\Phi}{c^2} = \dfrac{8\pi G}{c^4}\,\rho c^2$ and solve for $\nabla^2\Phi$.`, t`The right side is $8\pi G\rho/c^2$. Multiply both sides by $c^2/2$.`],
      teach: 'The time–time part of Einstein’s equations becomes Poisson’s equation in weak gravity — which is how the 8π in the coupling is fixed.',
      explain: t`$\dfrac{2\nabla^2\Phi}{c^2} = \dfrac{8\pi G\rho}{c^2}$, so $\nabla^2\Phi = 4\pi G\rho$: Newton's gravity. Run backwards, demanding this limit is exactly what fixes the coupling at $8\pi G/c^4$.`,
      visual: ballPotential,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-closed', difficulty: 2,
      prompt: t`With spatial curvature $k$ (in $\text{m}^{-2}$, scale factor $a = 1$ today) the Einstein tensor of an expanding universe is $G_{00} = 3\left(\dfrac{H^2}{c^2} + \dfrac{k}{a^2}\right)$. Compared with a flat universe expanding at the same rate, how much density does a closed universe ($k > 0$) need?`,
      choices: [
        'More: G₀₀ is larger, so Einstein’s equation demands more than the critical density',
        'Less: positive curvature adds its own gravity, so less matter is needed',
        'The same: curvature does not enter the time–time component',
        'None at all: a closed universe can expand with no matter',
      ],
      answer: 0,
      why: {
        1: t`The curvature term adds to $G_{00}$ with a plus sign for $k > 0$, and $G_{00}$ is what the matter must supply.`,
        2: t`It does: $3k/a^2$ is part of $G_{00}$.`,
        3: t`With $k > 0$, $G_{00} > 3H^2/c^2 > 0$, so $\rho$ must be positive and above critical.`,
      },
      hints: [t`Einstein's equation (with $\Lambda$ counted as part of the fluid) reads $G_{00} = 8\pi G\rho/c^2$. What happens to $G_{00}$ when $k > 0$?`],
      teach: 'Spatial curvature is part of the Einstein tensor: a closed universe needs more than the critical density to expand at a given rate, an open one less.',
      explain: t`$\rho = \dfrac{c^2 G_{00}}{8\pi G} = \dfrac{3}{8\pi G}\left(H^2 + \dfrac{kc^2}{a^2}\right)$ exceeds the critical $3H^2/(8\pi G)$ when $k > 0$. That is the Friedmann equation; measurements find our universe flat to within a few tenths of a percent.`,
      visual: fates,
    }),
    mcq({
      id: 'cp-nr', difficulty: 3, transfer: true,
      prompt: t`To make the waveform templates LIGO compares its signals with, numerical-relativity codes solve Einstein's equations for two merging black holes. Four of the ten equations, the components $G^{0\nu}$, contain no second time derivatives. What does a code do with them?`,
      choices: [
        'They are constraints, like Gauss’s law: the starting data must satisfy them, and the Bianchi identity keeps them satisfied as the other six evolve the data — codes monitor their violation as a test of accuracy',
        'They are evolution equations like the others, stepped forward in time',
        'They can be ignored: the Bianchi identity makes them automatically true for any starting data',
        'They fix the coordinates, so they have no physical content',
      ],
      answer: 0,
      why: {
        1: 'Without second time derivatives they cannot step anything forward in time: they restrict what each moment may look like.',
        2: 'The identity preserves them only if they hold at the start; arbitrary starting data violate them, and so does numerical error.',
        3: t`Coordinate freedom is a separate matter (4 free functions); these four equations carry real physics — they include the energy-density equation that became Poisson's law.`,
      },
      hints: ['In electromagnetism, Gauss’s law ∇·E = ρ/ε₀ has no time derivative. What role does it play when you evolve fields in time?', 'The Bianchi identity says the divergence of G vanishes. What does it then say about the time derivative of the constraints?'],
      teach: 'Of Einstein’s ten equations, four are constraints on each moment and six evolve it; the Bianchi identity keeps the constraints true over time.',
      explain: t`The $G^{0\nu}$ equations constrain each time slice; the six others evolve it. Because $\nabla^\mu G_{\mu\nu} = 0$ identically, constraints satisfied at the start stay satisfied in exact arithmetic. Codes such as those that simulated GW150914's merger check the constraint violation to judge their accuracy.`,
      visual: slices,
    }),
    expr({
      id: 'cp-three-sphere', difficulty: 3,
      prompt: t`For the space of a closed universe — a three-dimensional sphere of radius $a$ — the Ricci tensor is $R_{ij} = \dfrac{2}{a^2}\,g_{ij}$ and the Ricci scalar is $R = \dfrac{6}{a^2}$ (indices $i, j$ run over the three space directions). Write its Einstein tensor as $G_{ij} = C\,g_{ij}$: what is $C$?`,
      answer: '-1/a^2', answerTeX: t`-\frac{1}{a^2}`, lhs: 'C',
      vars: { a: [0.5, 3] },
      errors: [{ answer: '-4/a^2', feedback: 'Keep the ½: subtract ½R = 3/a², not 6/a².' }, { answer: '1/a^2', feedback: 'Check the sign: 2/a² − 3/a² is negative.' }, { answer: '5/a^2', feedback: 'Subtract ½R; do not add it.' }],
      hints: [t`$G_{ij} = R_{ij} - \tfrac12 R\,g_{ij} = \dfrac{2}{a^2}g_{ij} - \tfrac12\cdot\dfrac{6}{a^2}\,g_{ij}$.`, t`$\dfrac{2}{a^2} - \dfrac{3}{a^2} = ?$`],
      teach: 'Applying the definition is mechanical: subtract half the scalar times the metric from the Ricci tensor, component by component.',
      explain: t`$G_{ij} = \left(\dfrac{2}{a^2} - \dfrac{3}{a^2}\right)g_{ij} = -\dfrac{1}{a^2}\,g_{ij}$. Unlike a two-dimensional sphere, a three-dimensional one has a non-zero Einstein tensor: in three or more dimensions the definition has content.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.7 and §4.2 (Bianchi identity, Einstein’s equation)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 3–4', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
