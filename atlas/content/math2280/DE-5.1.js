// Equilibria and linearization of a nonlinear planar system: nullclines and
// their intersections, the Jacobian, the linear system it gives near each
// equilibrium, the Hartman–Grobman theorem (by name) for hyperbolic
// equilibria, and the trouble with centres, where linearization decides
// nothing. Worked example: a buckled beam (a damped double well).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, n, r6, plane } from './_systems.js';

const t = String.raw;

export default lesson({
  id: 'math2280.DE-5.1',
  title: 'Equilibria and linearization',
  minutes: 14, difficulty: 3,
  intro: t`Most real systems are nonlinear: $x' = f(x, y)$, $y' = g(x, y)$. They are rarely solvable in formulas, but their **equilibria** — the points where $f = g = 0$, where the curves $f = 0$ and $g = 0$ (the **nullclines**) cross — organize the whole picture. Near an equilibrium $(x^*, y^*)$, write $u = x - x^*$, $v = y - y^*$ and keep the first-order terms of the Taylor series:

$$\begin{bmatrix} u \\ v \end{bmatrix}' \approx J\begin{bmatrix} u \\ v \end{bmatrix}, \qquad J = \begin{bmatrix} f_x & f_y \\ g_x & g_y \end{bmatrix}_{(x^*,\,y^*)}.$$

If no eigenvalue of the **Jacobian** $J$ has zero real part (the equilibrium is **hyperbolic**), the **Hartman–Grobman theorem** guarantees that close to it the nonlinear portrait looks like the linear one: saddles stay saddles, spirals stay spirals, stable stays stable. If an eigenvalue has zero real part — a centre, say — the linearization cannot decide.`,
  symbols: [
    { tex: 'f,\\ g', text: 'the right-hand sides: the velocity of the state, $(x\', y\') = (f, g)$, at each point of the plane' },
    { tex: '(x^*, y^*)', text: 'an equilibrium: $f(x^*, y^*) = g(x^*, y^*) = 0$, a constant solution' },
    { tex: 'u,\\ v', text: 'the small displacement from the equilibrium, $u = x - x^*$ and $v = y - y^*$' },
    { tex: 'J', text: 'the **Jacobian**: the four partial derivatives of $f$ and $g$, evaluated at the equilibrium — the best linear approximation of the system there' },
    { tex: 'f_x', text: 'the partial derivative $\\partial f/\\partial x$ (and likewise $f_y$, $g_x$, $g_y$)' },
  ],
  why: t`Linearizing about an equilibrium is how engineers decide whether an aircraft trims stably, whether a circular orbit is stable, and whether a rocket engine’s combustion settles or roars — and in general relativity it finds the innermost stable circular orbit of a black hole.`,
  visual: {
    type: 'de-plane',
    title: 'Zoom in on an equilibrium',
    lead: t`A steel strip buckled sideways can rest bent to the left or to the right; its sideways deflection obeys roughly $x'' = x - x^3 - d\,x'$ (a damped double well), here as $x' = y$, $y' = x - x^3 - d\,y$. The dashed curves are the nullclines ($x' = 0$ violet, $y' = 0$ teal); where they cross are the equilibria, labelled with their type.`,
    tasks: [
      t`Three equilibria: the straight strip, $(0, 0)$, is a saddle; the two buckled shapes, $(\pm1, 0)$, are stable spirals. Click to see trajectories fall into one or the other.`,
      t`Drag the magnification up toward 30: near the origin the curved nullclines straighten, the trajectories become hyperbolas, and the picture is a linear saddle — the linearization.`,
      t`Set $d = 0$: no damping, and the spirals become centres. Linearization alone could not have told you that (energy conservation does — DE-5.5).`,
    ],
    params: {
      fx: 'y', fy: 'x - x^3 - d*y', x: [-2, 2], y: [-1.6, 1.6], aspect: 'square', xlabel: 'x', ylabel: 'y = x′',
      sliders: [{ key: 'd', label: 'Damping $d$', min: 0, max: 1, step: 0.05, value: 0.25, explain: 'Friction in the strip’s motion. Zero means no energy is lost.' }],
      nullclines: true, equilibria: 'label', zoom: { at: [0, 0], max: 30 },
      seeds: [[0.05, 0.05], [-0.05, -0.05], [1.9, 1.2], [-1.9, -1.2], [-1.6, 1.4], [1.6, -1.4]], T: 40,
    },
    caption: 'The model x″ = x − x³ − dx′ is the standard caricature of a buckled beam between two stable shapes (dimensionless units). Arrows show direction only; trajectories are traced numerically, arrowheads forward in time.',
  },
  example: {
    prompt: t`For the buckled strip with $d = 0.25$, $x' = y$, $y' = x - x^3 - 0.25\,y$: find every equilibrium, linearize at each, and say what the strip does.`,
    visual: { type: 'de-plane', params: { fx: 'y', fy: 'x - x^3 - 0.25*y', x: [-2, 2], y: [-1.5, 1.5], aspect: 'wide', nullclines: true, equilibria: 'label', seeds: [[0.02, 0.05], [-0.02, -0.05], [1.95, 0], [-1.95, 0]], T: 40, readout: false, click: false, xlabel: 'x', ylabel: 'y' }, caption: 'Two trajectories leave the saddle and spiral into the two buckled states; the stable trajectories of the saddle divide the plane between them. Nullclines dashed.' },
    steps: [
      { label: 'Nullclines', text: t`$x' = 0$ on the line $y = 0$; $y' = 0$ on the curve $y = 4(x - x^3)$. They cross where $y = 0$ and $x - x^3 = x(1 - x)(1 + x) = 0$: at $(0, 0)$, $(1, 0)$ and $(-1, 0)$.` },
      { label: 'Jacobian', text: t`$f = y$ and $g = x - x^3 - 0.25y$, so $J = ${M([['f_x', 'f_y'], ['g_x', 'g_y']])} = ${M([['0', '1'], ['1 - 3x^2', '-0.25']])}$.` },
      { label: 'At the origin', text: t`$J = ${M([[0, 1], [1, -0.25]])}$: $\Delta = -1 < 0$, a **saddle**, with $\lambda = \tfrac{-0.25 \pm\sqrt{0.0625 + 4}}{2} = 0.883$ and $-1.133$. The straight strip is unstable: the smallest nudge grows like $e^{0.883t}$.` },
      { label: 'At (±1, 0)', text: t`$1 - 3x^2 = -2$, so $J = ${M([[0, 1], [-2, -0.25]])}$: $\tau = -0.25$, $\Delta = 2$, $\tau^2 - 4\Delta = -7.94 < 0$. A **stable spiral**, $\lambda = -0.125 \pm 1.409i$.` },
      { label: 'Trust it?', text: t`All three are hyperbolic (no eigenvalue on the imaginary axis), so Hartman–Grobman applies: near each equilibrium the real system behaves like its linearization.` },
      { label: 'Physically', text: t`The strip snaps to one side and rings about the buckled shape with period $2\pi/1.409 = 4.46$ time units, the ringing dying like $e^{-0.125t}$ — halving every $\ln 2/0.125 = 5.5$ units. Which side it ends on depends on which side of the saddle’s stable trajectories it starts.` },
    ],
    answer: t`A saddle at $(0, 0)$ and stable spirals at $(\pm1, 0)$ with $\lambda = -0.125 \pm 1.409i$: the strip settles, ringing, into one of its two buckled shapes.`,
  },
  practice: [
    num({
      id: 'find-eq', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 3, -2]);
        return {
          prompt: t`The system $x' = y - x^2$, $y' = y - ${k}x$ has two equilibria. One is the origin. What is the $y$-coordinate of the other?`,
          answer: k * k, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: k, feedback: t`That is its $x$-coordinate. On the first nullcline $y = x^2$.` }],
          hints: ['At an equilibrium both right-hand sides vanish.', t`$y = x^2$ and $y = ${k}x$, so $x^2 = ${k}x$: $x = 0$ or $x = ${k}$.`],
          teach: 'Equilibria are the points where every right-hand side vanishes at once — where the nullclines cross.',
          explain: t`$x^2 = ${k}x$ gives $x = 0$ or $x = ${k}$, and then $y = x^2 = ${k * k}$. So the equilibria are $(0, 0)$ and $(${k}, ${k * k})$.`,
          visual: plane('y - x^2', `y - (${k})*x`, { x: k > 0 ? [-1.5, k + 2] : [k - 2, 1.5], y: [-2, k * k + 3], equal: false, seeds: [], caption: 'The direction field of the system. Equilibria sit where the arrows shrink to nothing — find them by algebra.' }),
        };
      },
    }),
    mcq({
      id: 'jacobian', difficulty: 2,
      gen(r) {
        const a = r.pick([3, 4, 5]);
        const ch = (A) => t`$${M(A)}$`;
        return {
          prompt: t`For $x' = x(${a} - x - y)$, $y' = y(x - 1)$, the equilibrium with both coordinates positive is $(1, ${a - 1})$. What is the Jacobian there?`,
          choices: [ch([[-1, -1], [a - 1, 0]]), ch([[0, -1], [a - 1, 0]]), ch([[-1, a - 1], [-1, 0]]), ch([[a, 0], [0, -1]])],
          answer: 0,
          why: {
            1: t`$f = ${a}x - x^2 - xy$, so $f_x = ${a} - 2x - y$ — the product rule (or expanding first) gives the $-2x$. At $(1, ${a - 1})$ that is $-1$, not $0$.`,
            2: t`That is the transpose. The first **row** holds the derivatives of $f$: $(f_x, f_y)$.`,
            3: t`That is $J$ at the origin. Evaluate the partial derivatives at $(1, ${a - 1})$.`,
          },
          hints: [t`Expand: $f = ${a}x - x^2 - xy$ and $g = xy - y$.`, t`$f_x = ${a} - 2x - y$, $f_y = -x$, $g_x = y$, $g_y = x - 1$. Now put in $x = 1$, $y = ${a - 1}$.`],
          teach: 'The Jacobian’s first row is ∂f/∂x, ∂f/∂y and its second row ∂g/∂x, ∂g/∂y, all evaluated at the equilibrium.',
          explain: t`$J = ${M([[`${a} - 2x - y`, '-x'], ['y', 'x - 1']])}$ at $(1, ${a - 1})$ is $${M([[-1, -1], [a - 1, 0]])}$: $\tau = -1$, $\Delta = ${a - 1}$, so $\tau^2 - 4\Delta < 0$ — a stable spiral, and hyperbolic, so the real system spirals in too.`,
          visual: plane(`x*(${a} - x - y)`, 'y*(x - 1)', { x: [-0.3, a + 0.5], y: [-0.3, a + 0.5], nullclines: true, seeds: [], caption: 'The direction field with its nullclines: x′ = 0 (violet dashed: the axis x = 0 and the line x + y = constant) and y′ = 0 (teal dashed: the axis y = 0 and the line x = 1).' }),
        };
      },
    }),
    mcq({
      id: 'classify', difficulty: 2,
      gen(r) {
        const [fx, fy, eq, J] = r.pick([
          ['x - y', '1 - x*y', [1, 1], [[1, -1], [-1, -1]]],
          ['y', '-x - x^2 - 0.5*y', [-1, 0], [[0, 1], [1, -0.5]]],
          ['y', '-x - x^2 - 0.5*y', [0, 0], [[0, 1], [-1, -0.5]]],
          ['x*(2 - x) - x*y', 'y*(x - 1)', [1, 1], [[-1, -1], [1, 0]]],
          ['y - x', 'x^2 - 3*y + 2', [1, 1], [[-1, 1], [2, -3]]],
        ]);
        const tr = J[0][0] + J[1][1], det = J[0][0] * J[1][1] - J[0][1] * J[1][0], disc = tr * tr - 4 * det;
        const kind = det < 0 ? 0 : disc < 0 ? (tr < 0 ? 1 : 3) : (tr < 0 ? 2 : 3);
        const choices = ['A saddle', 'A stable spiral', 'A stable node', 'Unstable (a source)'];
        const whyAll = { 0: t`A saddle needs $\Delta = \det J < 0$.`, 1: t`A stable spiral needs $\Delta > 0$, $\tau < 0$ and $\tau^2 < 4\Delta$.`, 2: t`A stable node needs $\Delta > 0$, $\tau < 0$ and $\tau^2 > 4\Delta$.`, 3: t`A source needs $\Delta > 0$ and $\tau > 0$.` };
        const why = {}; for (const k of [0, 1, 2, 3]) if (k !== kind) why[k] = whyAll[k];
        return {
          prompt: t`$x' = ${fx.replace(/\*/g, '')}$, $y' = ${fy.replace(/\*/g, '')}$ has an equilibrium at $(${eq[0]}, ${eq[1]})$. What type is it?`,
          choices, answer: kind, why,
          hints: ['Compute the Jacobian and evaluate it at the equilibrium.', t`$J = ${M(J)}$, with $\tau = ${n(tr)}$ and $\Delta = ${n(det)}$.`],
          teach: 'Classify an equilibrium by the trace and determinant of its Jacobian; for hyperbolic equilibria the nonlinear system has the same type nearby.',
          explain: t`$J = ${M(J)}$: $\tau = ${n(tr)}$, $\Delta = ${n(det)}$, $\tau^2 - 4\Delta = ${n(disc)}$. ${kind === 0 ? 'Δ < 0: a saddle.' : kind === 1 ? 'Δ > 0, τ < 0 and τ² < 4Δ: a stable spiral.' : kind === 2 ? 'Δ > 0, τ < 0 and τ² > 4Δ: a stable node.' : 'Δ > 0 and τ > 0: unstable.'} No eigenvalue has zero real part, so the nonlinear system agrees near $(${eq[0]}, ${eq[1]})$.`,
          visual: plane(fx, fy, { x: [eq[0] - 2, eq[0] + 2], y: [eq[1] - 1.5, eq[1] + 1.5], nullclines: true, field: false, seeds: [], points: [{ x: eq[0], y: eq[1], label: 'equilibrium', color: 'gold' }], caption: 'The nullclines near the equilibrium (gold): they cross there. The type is for you to compute.' }),
        };
      },
    }),
    mcq({
      id: 'trouble-centre', difficulty: 3, kind: 'error',
      prompt: t`A student linearizes $x' = y$, $y' = -x + y^3$ at the origin, finds $J = ${M([[0, 1], [-1, 0]])}$ with eigenvalues $\pm i$, and concludes: “The origin is a centre, so nearby trajectories are closed orbits.” What is wrong?`,
      choices: [
        t`Eigenvalues on the imaginary axis are not hyperbolic: the neglected $y^3$ decides, and here it makes $\tfrac12(x^2 + y^2)$ grow — trajectories spiral slowly out`,
        'Nothing: a linearized centre is always a centre',
        t`The Jacobian is wrong: the $y^3$ term contributes $3y^2$, which must be kept`,
        'The origin is not an equilibrium of this system',
      ],
      answer: 0,
      why: {
        1: 'Hartman–Grobman covers only hyperbolic equilibria. A centre is a borderline case: the tiniest nonlinear term can tip it into a spiral either way.',
        2: t`$\partial(y^3)/\partial y = 3y^2$ is $0$ at the origin, so the Jacobian is right. The trouble is that it leaves out exactly the term that matters.`,
        3: t`At $(0, 0)$ both $y$ and $-x + y^3$ vanish: it is an equilibrium.`,
      },
      hints: ['Which equilibria does the Hartman–Grobman theorem cover?', t`Compute $\tfrac{d}{dt}\tfrac12(x^2 + y^2) = xx' + yy'$ for the full system.`],
      teach: 'A linearization with purely imaginary eigenvalues decides nothing: the nonlinear terms can turn the centre into a slow spiral, in or out.',
      explain: t`$\tfrac{d}{dt}\tfrac12(x^2 + y^2) = xy + y(-x + y^3) = y^4 \ge 0$: the distance from the origin creeps up, so trajectories spiral slowly outward — an unstable spiral, not a centre. (With $-y^3$ instead it would spiral in.) This is the classic “trouble with centres”.`,
      visual: plane('y', '-x + y^3', { x: [-1.2, 1.2], y: [-1, 1], seeds: [{ x: 0.3, y: 0, dir: 'forward', color: 'accent2', T: 60 }], caption: 'The full nonlinear system from (0.3, 0), traced forward: each turn ends a little farther out.' }),
    }),
    num({
      id: 'halve', difficulty: 2,
      gen(r) {
        const d = r.pick([0.1, 0.2, 0.4, 0.5]);
        const al = -d / 2, th = Math.log(2) / (-al);
        return {
          prompt: t`The buckled strip with damping $d = ${d}$: $x' = y$, $y' = x - x^3 - ${d}\,y$. Using the linearization at the buckled state $(1, 0)$, how long does it take the ringing about that state to halve in amplitude?`,
          answer: th, tol: { rel: 0.005 },
          errors: [{ value: Math.log(2) / d, feedback: t`The decay rate is the real part of the eigenvalues, $\alpha = \tau/2 = -${d}/2$, not $\tau$ itself.` }],
          hints: [t`$J(1, 0) = ${M([[0, 1], [-2, -d]])}$.`, t`The eigenvalues are $\alpha \pm i\beta$ with $\alpha = \tau/2 = ${n(al)}$; the amplitude goes like $e^{\alpha t}$, so it halves when $e^{\alpha t} = \tfrac12$.`],
          teach: t`Near a stable spiral the amplitude decays like $e^{\alpha t}$, with $\alpha = \tau/2$ from the Jacobian.`,
          explain: t`$\alpha = ${n(al)}$, so $t = \ln2/${n(-al)} = ${fmt(th, 3)}$ time units. Because $(1, 0)$ is hyperbolic, the real strip’s small oscillations decay at this rate.`,
          visual: plane('y', `x - x^3 - ${d}*y`, { x: [0.2, 1.8], y: [-0.6, 0.6], seeds: [{ x: 1.4, y: 0, dir: 'forward', color: 'accent2', T: 60 }], caption: 'Near (1, 0): a small ringing, traced forward, spirals into the buckled state.' }),
        };
      },
    }),
    multi({
      id: 'hyperbolic', difficulty: 2,
      prompt: t`Four equilibria of different systems have Jacobians with these eigenvalues. At which ones does the linearization **reliably** predict the local portrait? Select all.`,
      choices: [t`$\lambda = -1,\ 2$`, t`$\lambda = \pm 2i$`, t`$\lambda = -0.5 \pm i$`, t`$\lambda = 0,\ -3$`, t`$\lambda = 0.1 \pm 2i$`],
      answer: [0, 2, 4],
      why: {
        1: 'Purely imaginary eigenvalues (a linear centre) are not hyperbolic: the nonlinear terms decide whether trajectories close, spiral in or spiral out.',
        3: 'A zero eigenvalue is not hyperbolic: along its direction the linearization says “no motion”, and the nonlinear terms take over.',
      },
      hints: ['Hartman–Grobman needs every eigenvalue to have a nonzero real part.', 'Check the real part of each listed eigenvalue.'],
      teach: 'An equilibrium is hyperbolic when no eigenvalue of its Jacobian has zero real part; only then does the linearization reliably fix the local picture.',
      explain: t`$-1, 2$ (saddle), $-0.5 \pm i$ (stable spiral) and $0.1 \pm 2i$ (unstable spiral, however slowly) are hyperbolic. $\pm2i$ and $0, -3$ have an eigenvalue with zero real part, so the nonlinear terms decide.`,
      visual: { type: 'de-tracedet', params: { drag: false, marker: false, labels: false, readout: false, panels: 'map', points: [{ tau: 1, Delta: -2, label: '1' }, { tau: 0, Delta: 4, label: '2' }, { tau: -1, Delta: 1.25, label: '3' }, { tau: -3, Delta: 0, label: '4' }, { tau: 0.2, Delta: 4.01, label: '5' }], map: { tau: [-4, 4], Delta: [-2.5, 5] } }, caption: 'The five equilibria as points (τ, Δ) on the trace–determinant map, numbered in the order listed. Gold line: τ = 0, Δ > 0; grey line: Δ = 0; grey curve: τ² = 4Δ.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const [name, r0] = r.pick([['the ISS (radius 6 771 km)', 6.771e6], ['a GPS satellite (radius 26 560 km)', 2.656e7], ['a geostationary satellite (radius 42 164 km)', 4.2164e7]]);
        const GM = 3.986e14, T = (2 * Math.PI * Math.sqrt(r0 ** 3 / GM)) / 60;
        return {
          prompt: t`For a satellite of angular momentum per unit mass $h$, the distance from Earth’s centre obeys $r'' = \dfrac{h^2}{r^3} - \dfrac{GM}{r^2}$. A circular orbit is the equilibrium $r_0 = h^2/GM$. Linearize about it: if the orbit of ${name} is nudged, with what period (in minutes) does $r$ oscillate? ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$.)`,
          answer: T, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: T * 60, feedback: 'That is in seconds; the question asks for minutes.' }, { value: T / Math.sqrt(3), feedback: t`Check the derivative: $\tfrac{d}{dr}\left(\tfrac{h^2}{r^3} - \tfrac{GM}{r^2}\right) = -\tfrac{3h^2}{r^4} + \tfrac{2GM}{r^3}$, which at $r_0$ is $-GM/r_0^3$, not $-3GM/r_0^3$.` }],
          hints: [t`With $\delta = r - r_0$, $\delta'' \approx F'(r_0)\,\delta$ where $F(r) = h^2/r^3 - GM/r^2$.`, t`$F'(r_0) = -\dfrac{3h^2}{r_0^4} + \dfrac{2GM}{r_0^3} = -\dfrac{GM}{r_0^3}$ (use $h^2 = GMr_0$). So $\omega = \sqrt{GM/r_0^3}$.`],
          teach: 'Linearizing r″ = F(r) about an equilibrium r₀ gives δ″ = F′(r₀)δ: oscillation with ω² = −F′(r₀) if F′(r₀) < 0, runaway if F′(r₀) > 0.',
          explain: t`$\omega = \sqrt{GM/r_0^3}$, the same as the orbital angular velocity, so the radial period is the orbital period: $${fmt(T, 4)}$ min. The nudged orbit is an ellipse that closes after one turn. The linearization is a centre, which on its own decides nothing — here energy and angular momentum conservation confirm the orbit stays closed. In Schwarzschild’s geometry the radial and orbital periods differ (the orbit precesses), and inside $r = 6GM/c^2$ this equilibrium turns into a saddle: the innermost stable circular orbit.`,
          visual: {
            type: 'graph',
            params: {
              x: [0.55, 2.6], y: [-1.2, 0.6], aspect: 'wide', xlabel: 'r / r₀', ylabel: 'effective potential',
              curves: [{ fn: '1/(2*x^2) - 1/x', color: 'accent', width: 2.4 }],
              points: [{ x: 1, y: -0.5, label: 'circular orbit', color: 'gold', labelDx: 8, labelDy: 12 }],
            },
            caption: 'The effective potential h²/2r² − GM/r (scaled): the circular orbit sits at its minimum. A small nudge oscillates in the well.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-classify', difficulty: 3,
      gen(r) {
        const b = r.pick([0.5, 1, 2]);
        return {
          prompt: t`For $x' = y$, $y' = -\sin x - ${b}\,y$ (a pendulum with friction), what type is the equilibrium $(\pi, 0)$, the pendulum balanced upside down?`,
          choices: ['A saddle', 'An unstable spiral', 'A centre', 'A stable node'],
          answer: 0,
          why: {
            1: t`$\cos\pi = -1$ makes $J = ${M([[0, 1], [1, -b]])}$, with $\Delta = -1 < 0$: a saddle, whatever the friction.`,
            2: 'A centre needs Δ > 0 and τ = 0. Here Δ < 0.',
            3: 'Friction cannot stabilize the inverted position: Δ = −1 < 0 for every amount of friction.',
          },
          hints: [t`$J = ${M([[0, 1], ['-\\cos x', `-${b}`]])}$ evaluated at $x = \pi$.`, t`$\cos\pi = -1$, so $\Delta = 0\cdot(-${b}) - 1\cdot1$.`],
          teach: 'A negative Jacobian determinant always means a saddle — hyperbolic, so the nonlinear system has a saddle there too.',
          explain: t`$J(\pi, 0) = ${M([[0, 1], [1, -b]])}$ has $\Delta = -1 < 0$: a saddle. The inverted pendulum balances only on the saddle’s stable trajectories — one exact speed toward the top.`,
          visual: plane('y', `-sin(x) - ${b}*y`, { x: [0.6, 5.7], y: [-2, 2], nullclines: true, seeds: [], points: [{ x: r6(Math.PI), y: 0, label: '(π, 0)', color: 'gold' }], caption: 'The field near the inverted position (gold), with the nullclines.' }),
        };
      },
    }),
    num({
      id: 'cp-hoop', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([0.1, 0.2, 0.4]), g = 9.8, w = Math.sqrt(g / R), rpm = (w * 60) / (2 * Math.PI);
        return {
          prompt: t`A bead slides on a vertical hoop of radius ${R} m that spins about its vertical diameter at angular speed $\Omega$. Its angle $\theta$ from the bottom obeys $\theta'' = \sin\theta\,(\Omega^2\cos\theta - g/R) - b\,\theta'$. Above what spin rate, in revolutions per minute, does the bottom of the hoop stop being a stable equilibrium? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: rpm, units: 'rpm', tol: { rel: 0.005 },
          errors: [{ value: w, feedback: 'That is the angular speed in rad/s. Convert to revolutions per minute: multiply by 60/2π.' }],
          hints: [t`At $\theta = 0$ the Jacobian is $${M([[0, 1], ['\\Omega^2 - g/R', '-b']])}$.`, t`It is a saddle when $\Delta = -(\Omega^2 - g/R) < 0$, that is $\Omega^2 > g/R$.`],
          teach: 'An equilibrium loses stability when a parameter pushes the Jacobian’s determinant through zero — here the spin rate turns the bottom of the hoop into a saddle.',
          explain: t`$\Omega_c = \sqrt{g/R} = ${fmt(w, 3)}$ rad/s $= ${fmt(rpm, 3)}$ rpm. Faster than that, the bottom becomes a saddle and two new stable equilibria appear at $\cos\theta = g/(R\Omega^2)$ — the bead rides up the side. (A pitchfork bifurcation; centrifuge governors on steam engines worked this way.)`,
          visual: plane('y', 'sin(x)*(1.5*cos(x) - 1) - 0.3*y', { x: [-2.2, 2.2], y: [-1.2, 1.2], equal: false, nullclines: false, equilibria: true, seeds: [[0.02, 0], [-0.02, 0]], T: 60, xlabel: 'θ', ylabel: 'θ′', caption: 'The bead’s phase plane for a spin rate above the critical one (Ω² = 1.5 g/R), with time in units of √(R/g) and some friction: the bottom, θ = 0, has become a saddle between two new stable states.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §8.1 Linearization, critical points and equilibria', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'F. C. Moon and P. J. Holmes, A magnetoelastic strange attractor, J. Sound Vib. 65 (1979) 275', url: 'https://doi.org/10.1016/0022-460X(79)90520-0' },
  ],
});
