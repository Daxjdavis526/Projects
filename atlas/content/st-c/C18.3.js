// Capstone: the whole pipeline — metric → Christoffels → Riemann → Ricci →
// scalar → geodesic deviation — for the two-dimensional spacetime
// ds² = −dt² + a(t)² dx² (c = 1): Γ^t_xx = aȧ, Γ^x_tx = ȧ/a, R^t_xtx = aä,
// R_tt = −ä/a, R_xx = aä, R = 2ä/a, K = ä/a, comoving neighbours obey
// ξ̈ = (ä/a)ξ. De Sitter (a = e^{Ht}) has R = 2H²; Milne (a = t) and Rindler
// are flat spacetime in disguise; power laws t^n give 2n(n − 1)/t²; the
// signature flip changes the sign of R only. Transfer: the far-future
// cosmological tide on the Solar System.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const MPC = 3.0857e22, AU = 1.495978707e11, LY = 9.4607e15;

const dsChart = (P, caption, extra = {}) => ({ type: 'dg4-chart', params: { metric: 'desitter', mode: 'chart', P, drag: false, readout: false, field: true, ...extra }, caption });

export default lesson({
  id: 'st-c.C18.3',
  title: 'Capstone: the curvature of a two-dimensional spacetime',
  minutes: 18, difficulty: 4,
  equation: t`ds^2 = -dt^2 + a(t)^2\,dx^2 \;\Longrightarrow\; R = \frac{2\ddot a}{a}`,
  intro: t`Everything in this course, in one calculation. Take a one-dimensional universe whose size is $a(t)$ (with $c = 1$): galaxies sit at fixed $x$ and their proper separation is $a(t)\,\Delta x$. From the metric alone you can now compute the Christoffel symbols (C13), the Riemann tensor (C15), the Ricci tensor and scalar (C16), and what two neighbouring galaxies feel (C17). The answer is the equation above: **the curvature is the acceleration of the expansion**, and in two dimensions it is everything there is — $R_{\mu\nu} = \tfrac12 Rg_{\mu\nu}$, $K = R/2 = \ddot a/a$.

Three special cases make the point that coordinates can hide or fake curvature:

- **de Sitter**, $a = e^{Ht}$: $R = 2H^2$, constant — a curved spacetime, the far future of a universe with a cosmological constant.
- **Milne**, $a = t$: expanding, yet $\ddot a = 0$ and $R = 0$ — flat Minkowski spacetime in disguise.
- **Rindler**, $-\rho^2d\eta^2 + d\rho^2$: accelerating observers, $R = 0$ again (C11.3).`,
  symbols: [
    { tex: 't', text: 'cosmic time: proper time of the galaxies at fixed x' },
    { tex: 'x', text: 'the comoving coordinate: each galaxy keeps its own x' },
    { tex: 'a(t)', text: t`the scale factor: proper distance $= a\,\Delta x$` },
    { tex: t`\dot a,\ \ddot a`, text: t`its first and second time derivatives (expansion rate and acceleration)` },
    { tex: 'R', text: t`the Ricci scalar, in $1/\text{time}^2$ (or $\text{m}^{-2}$ with $c$ restored)` },
  ],
  why: t`This is the Friedmann universe of gr.S30 with two of its three space directions removed: the same pipeline, run on four dimensions, gives the Friedmann equations (gr.S31.d), and its $\ddot a/a$ is the acceleration that dark energy is invoked to explain.`,
  visual: {
    type: 'dg4-chart',
    title: 'Curved, or only looking curved?',
    lead: t`Light cones on four 1+1 spacetimes and a fan of free-fall worldlines from $P$. The readout gives $g$, the Christoffels and $K = R/2$ at $P$. Which spacetimes are really curved?`,
    tasks: [
      t`de Sitter: the cones narrow upward on the chart (distances grow as $e^{Ht}$), and worldlines launched with a speed bend toward fixed $x$ — a galaxy’s own motion dies away as space grows. $K = H^2$: drag $P$ and it stays the same everywhere.`,
      t`Rindler: the cones tilt and the worldlines curve on the chart, yet $K = 0$ — flat Minkowski spacetime seen by accelerating observers.`,
      t`Schwarzschild’s radial–time plane: $K = 2M/r^3$, larger closer in. Compare with C16.2: positive $K$ in a timelike plane means stretching.`,
    ],
    params: { metric: 'desitter', metrics: ['desitter', 'rindler', 'minkowski', 'schwarzschild'], mode: 'geodesic', P: [0, 0], speed: 0, fan: 4, spread: 25, length: 1.8, readout: ['g', 'gamma', 'K'], sliders: ['speed', 'length'] },
    caption: t`Each chart drawn flat with its own coordinates; cones mark light’s directions at grid points. $K$ from finite differences of the Christoffels; the worldlines by RK4. Units $c = 1$, $H = 1$, $M = 1$.`,
  },
  example: {
    prompt: t`For $ds^2 = -dt^2 + a(t)^2dx^2$, compute the Christoffel symbols, $R^t{}_{xtx}$, the Ricci tensor and scalar, and the relative acceleration of two comoving galaxies. Then evaluate for de Sitter and for Milne.`,
    visual: dsChart([0.5, 0.6], t`The 1+1 de Sitter chart ($a = e^t$): light cones narrow toward the future as comoving distances grow.`),
    steps: [
      { label: 'Christoffels', text: t`$g_{tt} = -1$, $g_{xx} = a^2$. Only $\partial_tg_{xx} = 2a\dot a$ is non-zero, so $\Gamma^t{}_{xx} = -\tfrac12g^{tt}\partial_tg_{xx} = a\dot a$ and $\Gamma^x{}_{tx} = \Gamma^x{}_{xt} = \tfrac12g^{xx}\partial_tg_{xx} = \dot a/a$.` },
      { label: 'Riemann', text: t`$R^t{}_{xtx} = \partial_t\Gamma^t{}_{xx} - \partial_x\Gamma^t{}_{tx} + \Gamma^t{}_{t\lambda}\Gamma^\lambda{}_{xx} - \Gamma^t{}_{x\lambda}\Gamma^\lambda{}_{tx} = (\dot a^2 + a\ddot a) - 0 + 0 - a\dot a\cdot\dfrac{\dot a}{a} = a\ddot a$.` },
      { label: 'Ricci', text: t`$R_{xx} = R^t{}_{xtx} = a\ddot a$ and $R_{tt} = R^x{}_{txt} = g^{xx}R_{xtxt} = -\ddot a/a$ (using $R_{xtxt} = R_{txtx} = g_{tt}R^t{}_{xtx} = -a\ddot a$).` },
      { label: 'Scalar', text: t`$R = g^{tt}R_{tt} + g^{xx}R_{xx} = \dfrac{\ddot a}{a} + \dfrac{\ddot a}{a} = \dfrac{2\ddot a}{a}$, and $K = R/2 = \ddot a/a$.` },
      { label: 'Deviation', text: t`For comoving galaxies $\xi = a\,\Delta x$, so $\ddot\xi = \dfrac{\ddot a}{a}\xi = K\xi$: positive $K$ in this timelike plane pushes them apart faster and faster (C16.2’s sign).` },
      { label: 'Cases', text: t`de Sitter, $a = e^{Ht}$: $\ddot a/a = H^2$, so $R = 2H^2$ everywhere. Milne, $a = t$: $\ddot a = 0$, $R = 0$ — every Riemann component vanishes, and indeed $T = t\cosh x$, $X = t\sinh x$ turns it into $-dT^2 + dX^2$ inside the light cone of $T = X = 0$.` },
    ],
    answer: t`$\Gamma^t{}_{xx} = a\dot a$, $\Gamma^x{}_{tx} = \dot a/a$; $R^t{}_{xtx} = a\ddot a$; $R_{tt} = -\ddot a/a$, $R_{xx} = a\ddot a$; $R = 2\ddot a/a$; $\ddot\xi = (\ddot a/a)\xi$. De Sitter: $R = 2H^2$. Milne: flat.`,
  },
  practice: [
    num({
      id: 'christoffel', difficulty: 2,
      gen(r) {
        const H = r.pick([0.5, 1, 1.5, 2]), t0 = r.pick([0.3, 0.5, 1]);
        const key = H * Math.exp(2 * H * t0);
        return {
          prompt: t`In 1+1 de Sitter with $a = e^{Ht}$, $H = ${H}$ (units with $c = 1$), find $\Gamma^t{}_{xx}$ at $t = ${t0}$.`,
          visual: dsChart([0, t0], t`The de Sitter chart with the point P at t = ${t0}.`, { k: H }),
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: H, feedback: t`That is $\Gamma^x{}_{tx} = \dot a/a = H$. The other symbol is $\Gamma^t{}_{xx} = a\dot a$.` },
            { value: -key, feedback: t`$\Gamma^t{}_{xx} = -\tfrac12g^{tt}\partial_tg_{xx}$ and $g^{tt} = -1$: two minus signs make it positive.` },
            { value: H * Math.exp(H * t0), feedback: t`$a\dot a = e^{Ht}\cdot He^{Ht} = He^{2Ht}$: both factors carry $e^{Ht}$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * key),
          hints: [t`$\Gamma^t{}_{xx} = a\dot a$ for any $a(t)$.`, t`$a = e^{${H}t}$, $\dot a = ${H}e^{${H}t}$.`],
          teach: 'For −dt² + a²dx², the two Christoffel symbols are aȧ and ȧ/a.',
          explain: t`$\Gamma^t{}_{xx} = a\dot a = He^{2Ht} = ${nice(key, 4)}$. It grows with time because $g_{xx}$ does — a fact about the chart, not the curvature, which stays $K = H^2 = ${nice(H * H, 3)}$.`,
        };
      },
    }),
    order({
      id: 'pipeline', difficulty: 3,
      prompt: t`Order the pipeline that takes the metric $-dt^2 + a(t)^2dx^2$ to the relative acceleration of comoving galaxies.`,
      visual: dsChart([0, 0.4], 'The de Sitter chart: the metric is all the input the pipeline needs.'),
      items: [
        t`Christoffels from the metric’s derivatives: $\Gamma^t{}_{xx} = a\dot a$, $\Gamma^x{}_{tx} = \dot a/a$.`,
        t`Riemann from the Christoffels: $R^t{}_{xtx} = \partial_t(a\dot a) - (a\dot a)(\dot a/a) = a\ddot a$.`,
        t`Contract to Ricci: $R_{tt} = -\ddot a/a$, $R_{xx} = a\ddot a$.`,
        t`Trace with the inverse metric: $R = 2\ddot a/a$, so $K = \ddot a/a$.`,
        t`Geodesic deviation for $\xi = a\,\Delta x$: $\ddot\xi = (\ddot a/a)\,\xi$.`,
      ],
      hints: ['Each step uses only the result of the one before.', 'Riemann needs derivatives of the Christoffels; Ricci needs Riemann.'],
      teach: 'Metric → Γ → Riemann → Ricci → R → deviation: each object is built from the one before.',
      explain: t`The same five steps, with four coordinates and pages more algebra, give the Friedmann equations. A useful check at the end: the deviation equation must agree with differentiating $\xi = a\,\Delta x$ twice directly, and it does.`,
    }),
    num({
      id: 'power-law', difficulty: 3,
      gen(r) {
        const [n, nTeX, what] = r.pick([[0.5, '1/2', 'like radiation'], [2, '2', 'accelerating'], [1 / 3, '1/3', 'like a stiff fluid']]);
        const t0 = r.pick([0.5, 1, 2, 4]);
        const key = (2 * n * (n - 1)) / (t0 * t0);
        return {
          prompt: t`A 1+1 toy universe expands as $a = t^{${nTeX}}$ (${what}), with $t$ in billions of years and $c = 1$. Find its Ricci scalar $R = 2\ddot a/a$ at $t = ${t0}$, in $\text{Gyr}^{-2}$.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [0, n > 1 ? 6 : 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 't (Gyr)', ylabel: 'a(t)', curves: [{ fn: `x^${n}`, domain: [0, 5], color: 'accent', width: 2.4, label: 'scale factor', labelAt: 3.5, labelDy: n > 1 ? 14 : -12 }], vlines: [{ x: t0, color: 'gold' }] }, caption: 'The scale factor; the gold line marks the time asked about. Its curvature on this graph is not the spacetime curvature — but its sign is.' },
          answer: key, units: 'Gyr^-2', tol: { rel: 0.005 },
          errors: [
            { value: key / 2, feedback: t`That is $K = \ddot a/a$. The Ricci scalar is twice it.` },
            { value: (2 * n) / t0, feedback: t`$\ddot a/a$ needs the second derivative: $n(n-1)t^{n-2}/t^n = n(n-1)/t^2$.` },
            { value: -key, feedback: t`In Carroll’s signature $(-, +)$, $R = +2\ddot a/a$: positive when the expansion speeds up.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`$\ddot a = n(n-1)t^{n-2}$, so $\ddot a/a = n(n-1)/t^2$.`, t`$R = 2n(n-1)/t^2$ with $n = ${nTeX}$.`],
          teach: 'For a = tⁿ, R = 2n(n − 1)/t²: positive for accelerating expansion (n > 1), negative for decelerating, zero for Milne (n = 1).',
          explain: t`$R = \dfrac{2\cdot${nice(n, 3)}\cdot(${nice(n - 1, 3)})}{${t0}^2} = ${nice(key, 4)}\ \text{Gyr}^{-2}$. ${n > 1 ? 'Accelerating, so positive: comoving neighbours separate ever faster.' : 'Decelerating, so negative: the expansion is being braked, and the curvature fades as 1/t².'}`,
        };
      },
    }),
    mcq({
      id: 'milne', difficulty: 3,
      prompt: t`The Milne universe, $ds^2 = -dt^2 + t^2dx^2$ for $t > 0$, expands: comoving galaxies separate at speed $\Delta x$. Yet $R = 2\ddot a/a = 0$. What is it?`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-0.2, 2.6], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'X', ylabel: 'T', curves: [{ fn: 'abs(x)', color: 'gold', width: 2, dash: [5, 4] }, ...[0.6, 1.2, 1.8].map((tt) => ({ param: [`${tt}*sinh(t)`, `${tt}*cosh(t)`], t: [-1.6, 1.6], color: 'teal', width: 1.6 })), ...[-1, -0.5, 0, 0.5, 1].map((xx) => ({ param: [`t*sinh(${xx})`, `t*cosh(${xx})`], t: [0, 2.4], color: 'accent', width: 1.4 }))] }, caption: 'A Minkowski diagram (T, X): the light cone of the origin (gold), hyperbolae of constant t (teal) and straight worldlines of constant x (blue).' },
      choices: [
        t`The inside of the future light cone of one event in flat Minkowski spacetime, sliced by hyperbolae $T^2 - X^2 = t^2$`,
        'A curved spacetime whose curvature happens to vanish only in two dimensions',
        'A spacetime with negative curvature, since its expansion does not accelerate',
        'Not a valid spacetime: a universe cannot expand without matter',
      ],
      answer: 0,
      why: {
        1: t`All of Riemann vanishes, not just $R$: in 2D one number is all there is, and it is zero. Milne’s 3+1 version is flat too.`,
        2: t`$\ddot a = 0$ exactly, so $K = 0$; negative curvature needs deceleration.`,
        3: 'An empty universe can "expand": particles flying apart from one event in flat spacetime, described in comoving coordinates.',
      },
      hints: [t`Try $T = t\cosh x$, $X = t\sinh x$ and compute $-dT^2 + dX^2$.`, 'What do worldlines of constant x look like in (T, X)?'],
      teach: 'Expansion is not curvature: the Milne universe is flat spacetime in expanding coordinates, as Rindler is flat spacetime in accelerating ones.',
      explain: t`$dT = \cosh x\,dt + t\sinh x\,dx$, $dX = \sinh x\,dt + t\cosh x\,dx$, so $-dT^2 + dX^2 = -dt^2 + t^2dx^2$. The galaxies are particles flung from one event at all speeds $\tanh x$; their "expansion" is plain motion. Curvature appears only when the expansion accelerates or decelerates.`,
    }),
    num({
      id: 'flip', difficulty: 3,
      gen(r) {
        const H = r.pick([0.5, 1.5, 2, 3]);
        const key = -2 * H * H;
        return {
          prompt: t`A textbook using the signature $(+, -)$ writes 1+1 de Sitter as $ds^2 = dt^2 - e^{2Ht}dx^2$, i.e. $g \to -g$, keeping the same definitions of $\Gamma$, $R^\rho{}_{\sigma\mu\nu}$ and $R_{\mu\nu}$. With $H = ${H}$, what Ricci scalar does it find?`,
          visual: dsChart([0, 0.3], 'The de Sitter chart: the spacetime does not care which overall sign its metric is written with.', { k: Math.min(2, H) }),
          answer: key, tol: { rel: 0.005 },
          errors: [{ value: -key, feedback: t`That is the $(-, +)$ value. Flipping $g$ leaves $\Gamma$, $R^\rho{}_{\sigma\mu\nu}$ and $R_{\mu\nu}$ alone but flips $g^{\mu\nu}$, so $R = g^{\mu\nu}R_{\mu\nu}$ changes sign.` }, { value: -H * H, feedback: t`That is $-K$; the scalar is $R = \pm 2K$.` }],
          hints: [t`$\Gamma$ contains $g^{-1}\partial g$: unchanged when $g \to -g$. So are Riemann (with its index up) and Ricci.`, t`$R = g^{\mu\nu}R_{\mu\nu}$, and $g^{\mu\nu} \to -g^{\mu\nu}$.`],
          teach: t`Under $g \to -g$, $\Gamma$, $R^\rho{}_{\sigma\mu\nu}$ and $R_{\mu\nu}$ are unchanged, and the Ricci scalar changes sign: check a book’s signature before comparing its $R$.`,
          explain: t`$R = -2H^2 = ${nice(key, 4)}$. Nothing about the spacetime changed; only the bookkeeping. This is why Carroll’s $R = 2H^2$ and a particle physicist’s $R = -2H^2$ describe the same de Sitter space — and why Misner, Thorne and Wheeler tabulate every author’s sign choices.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lambda-tide', difficulty: 3, transfer: true,
      gen(r) {
        const [what, d] = r.pick([['the Earth and the Sun (1 AU apart)', AU], ['the Sun and a comet in the Oort cloud, 50 000 AU away', 5e4 * AU], ['two stars 5 light-years apart', 5 * LY]]);
        const Hinf = (67.4 * Math.sqrt(0.685) * 1e3) / MPC, acc = Hinf * Hinf * d;
        return {
          prompt: t`In the far future a universe with a cosmological constant approaches de Sitter, with $H_\infty = H_0\sqrt{\Omega_\Lambda} = 67.4\sqrt{0.685}$ km/s/Mpc ($1\ \text{Mpc} = 3.086\times10^{22}$ m). Two free bodies at proper separation $\xi$ then feel a relative acceleration $\ddot\xi = H_\infty^2\xi$, the geodesic-deviation tide of $K = H^2$. How large is it for ${what}, in $\text{m/s}^2$?`,
          visual: { type: 'dg4-chart', params: { metric: 'desitter', mode: 'geodesic', P: [0, 0], speed: 0, fan: 4, spread: 20, length: 1.5, drag: false, readout: false, cells: 8 }, caption: 'Free-fall worldlines in 1+1 de Sitter (H = 1 here): neighbours separate ever faster.' },
          answer: acc, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: Hinf * d, feedback: t`$H\xi$ is a speed. The acceleration is $H^2\xi$.` },
            { value: ((67.4 * 1e3) / MPC) ** 2 * d, feedback: t`Use $H_\infty = H_0\sqrt{\Omega_\Lambda}$, not $H_0$: only the cosmological constant survives in the far future.` },
          ].filter((e) => Math.abs(e.value - acc) > 0.02 * acc),
          hints: [t`$H_\infty = ${nice(67.4 * Math.sqrt(0.685), 3)}\ \text{km/s/Mpc} = ${tex(Hinf, 4)}\ \text{s}^{-1}$.`, t`$\ddot\xi = H_\infty^2\xi$ with $\xi = ${tex(d, 4)}$ m.`],
          teach: 'A cosmological constant is a positive spacetime curvature K = H², a uniform tide H²ξ that pulls everything apart — utterly negligible inside bound systems.',
          explain: t`$\ddot\xi = (${tex(Hinf, 4)})^2\times${tex(d, 4)} = ${tex(acc, 3)}\ \text{m/s}^2$. ${d === AU ? t`The Sun pulls the Earth with $5.9\times10^{-3}\ \text{m/s}^2$, about $10^{22}$ times more: bound systems do not expand.` : d < 1e16 ? t`Even at the edge of the Oort cloud the Sun’s pull, $2.4\times10^{-12}\ \text{m/s}^2$, wins by a factor of about $10^{8}$.` : 'Galaxies and their stars stay bound for ever; only unbound groups drift apart, as in the picture.'} In Newtonian language this is the repulsion $\Lambda c^2\xi/3$, since $H_\infty^2 = \Lambda c^2/3$.`,
        };
      },
    }),
    mcq({
      id: 'cp-rindler', difficulty: 2,
      prompt: t`The Rindler metric $ds^2 = -\rho^2d\eta^2 + d\rho^2$ has non-zero Christoffels, $\Gamma^\rho{}_{\eta\eta} = \rho$ and $\Gamma^\eta{}_{\eta\rho} = 1/\rho$. Running the pipeline, what is its Ricci scalar?`,
      visual: { type: 'dg4-chart', params: { metric: 'rindler', mode: 'geodesic', P: [1.2, 0], speed: 0, fan: 4, spread: 20, length: 1.6, drag: false, readout: false, cells: 8 }, caption: 'Free-fall worldlines on the Rindler chart: they curve on the chart, and the cones tilt, near the horizon ρ = 0.' },
      choices: ['0: flat Minkowski spacetime in accelerating coordinates', t`$2/\rho^2$`, t`$-2/\rho^2$`, 'It cannot be defined at ρ = 0, so it is undefined everywhere'],
      answer: 0,
      why: {
        1: t`$R^\rho{}_{\eta\rho\eta} = \partial_\rho\Gamma^\rho{}_{\eta\eta} - \Gamma^\rho{}_{\eta\eta}\Gamma^\eta{}_{\rho\eta} = 1 - \rho\cdot\tfrac1\rho = 0$. The two terms cancel exactly.`,
        2: t`The terms cancel; there is no $1/\rho^2$ left over.`,
        3: t`$\rho = 0$ is where the chart ends (a horizon for the accelerating observers), not a singularity; everywhere the chart covers, $R = 0$.`,
      },
      hints: [t`$R^\rho{}_{\eta\rho\eta} = \partial_\rho\Gamma^\rho{}_{\eta\eta} - \Gamma^\rho{}_{\eta\lambda}\Gamma^\lambda{}_{\rho\eta}$ (the other terms vanish).`],
      teach: 'Non-zero Christoffels are not curvature: Rindler’s Riemann tensor vanishes, so its spacetime is flat.',
      explain: t`$R^\rho{}_{\eta\rho\eta} = 1 - 1 = 0$, so all of Riemann, Ricci and $R$ vanish. The observers at fixed $\rho$ accelerate with $1/\rho$; free particles move on straight lines of Minkowski spacetime, which look curved on this chart. Compare de Sitter, where no change of coordinates can remove $K = H^2$.`,
    }),
    num({
      id: 'cp-matter', difficulty: 3,
      gen(r) {
        const t0 = r.pick([0.5, 1, 2, 5]);
        const key = -4 / (9 * t0 * t0);
        return {
          prompt: t`A 1+1 toy model of a matter-dominated universe has $a \propto t^{2/3}$. With $t$ in billions of years and $c = 1$, what is its Ricci scalar at $t = ${t0}$, in $\text{Gyr}^{-2}$? And what does its sign say about two comoving galaxies?`,
          visual: { type: 'graph', params: { x: [0, 6], y: [0, 3.5], aspect: 'wide', axesAt: 'edge', xlabel: 't (Gyr)', ylabel: 'a(t)', curves: [{ fn: 'x^(2/3)', domain: [0, 6], color: 'accent', width: 2.4 }], vlines: [{ x: t0, color: 'gold' }] }, caption: 'The scale factor of a matter-dominated universe, with the time asked about marked.' },
          answer: key, units: 'Gyr^-2', tol: { rel: 0.005 },
          errors: [
            { value: -key, feedback: t`$\ddot a < 0$ for $t^{2/3}$: the expansion decelerates, so $R = 2\ddot a/a$ is negative.` },
            { value: key / 2, feedback: t`That is $K = \ddot a/a$; $R = 2K$.` },
          ],
          hints: [t`For $a = t^n$, $R = 2n(n - 1)/t^2$.`, t`$n = \tfrac23$: $2\cdot\tfrac23\cdot(-\tfrac13) = -\tfrac49$.`],
          teach: 'Decelerating expansion is negative curvature of the time–space plane: comoving neighbours’ separation grows ever more slowly.',
          explain: t`$R = -\dfrac{4}{9t^2} = ${nice(key, 4)}\ \text{Gyr}^{-2}$. Negative $K$ in this timelike plane means $\ddot\xi < 0$: gravity braking the expansion. (In the real 3+1 universe this is the deceleration that a cosmological constant overturned about five billion years ago.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.9 and §8.3 (1+1 examples; Robertson–Walker curvature)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, sign-convention table (inside front cover)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Planck Collaboration 2020, Planck 2018 results VI, A&A 641, A6 (H₀ = 67.4, Ω_Λ = 0.685)', url: 'https://doi.org/10.1051/0004-6361/201833910' },
  ],
});
