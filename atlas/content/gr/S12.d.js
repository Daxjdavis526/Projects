// The geodesic equation from the action — Derivation Mode. Stationary proper
// time τ = ∫√(−g_μν ẋ^μ ẋ^ν) dλ: its Euler–Lagrange equations, with λ = τ, are
// d²x^ρ/dτ² + Γ^ρ_μν u^μ u^ν = 0, and the Christoffel formula of step 11
// appears by itself. The shortcut L = ½g_μν ẋ^μ ẋ^ν; reading Γ off
// Euler–Lagrange (sphere, half-plane: the factor-2 trap); conserved quantities
// from cyclic coordinates (Clairaut on a sphere, E and L in Schwarzschild);
// the weak-field limit d²x/dt² = −∂Φ/∂x. Avoids gr.EQ.2's items (latitude
// circles, counting terms, Γ^r_00 at surfaces, MICROSCOPE, thrust, light).
// Every result verified with SymPy (scratch v12_13.py) or the gr-surface model.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { fallField } from './_eq.js';
import { rnd, polarGrid, surfacePic, halfPlane } from './_tensors.js';

const t = String.raw;
const DEG = Math.PI / 180;

const GEO = t`\frac{d^2x^\rho}{d\tau^2} + \Gamma^\rho{}_{\mu\nu}\,\frac{dx^\mu}{d\tau}\frac{dx^\nu}{d\tau} = 0`;

// a straight path y = 1.5 across a polar grid, with the radius to a point on it
const straightLine = {
  type: 'graph',
  params: {
    x: [-4.4, 4.4], y: [-2.6, 3.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [...polarGrid(5), { param: ['t', '1.5'], t: [-4.4, 4.4], color: 'gold', width: 2.6 }, { param: ['1.2*t', '1.5*t'], t: [0, 1], color: 'accent', width: 2 }],
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }, { x: 1.2, y: 1.5, color: 'gold', label: 'P' }, { x: 0.35, y: 0.95, r: 0.01, color: 'accent', label: 'r' }],
  },
  caption: t`A straight path (gold) across a polar grid. Along it $r$ first falls and then grows, and $\theta$ sweeps round, though nothing pushes the particle: the "centrifugal" $r\dot\theta^2$ is the grid's doing.`,
};

// a radar at the origin and an aircraft flying a straight line past it
const radarPicture = (b, v) => ({
  type: 'graph',
  params: {
    x: [-5, 5], y: [-0.8, 3.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['t', '2'], t: [-5, 5], color: 'ink3', width: 1.4, dash: true }, { param: ['0', '2*t'], t: [0, 1], color: 'accent', width: 1.6 }, { param: ['-2.6*t', '2*t'], t: [0, 1], color: 'ink4', width: 1.2 }],
    arrows: [{ from: [-2.6, 2], to: [-1.6, 2], color: 'gold', label: `${v} m/s`, labelDx: -10, labelDy: -14 }],
    points: [{ x: 0, y: 0, color: 'teal', r: 5, label: 'radar' }, { x: 0, y: 2, color: 'ink', label: 'closest approach' }, { x: 0.12, y: 1, r: 0.01, color: 'accent', label: `b = ${b} km` }, { x: -2.6, y: 2, color: 'gold' }],
  },
  caption: 'An aircraft (gold) flying straight and level at constant speed past a radar, seen from above; not to scale. The radar measures its range r and bearing θ.',
});

// one worldline, labelled evenly (affine) and unevenly (non-affine)
const labellings = {
  type: 'graph',
  params: {
    x: [-1.3, 1.6], y: [-0.2, 3.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['0.6*sin(t)', 't'], t: [0, 3.1], color: 'ink2', width: 2.4 }],
    points: [
      ...Array.from({ length: 11 }, (_, k) => { const s = 0.3 * k; return { x: rnd(0.6 * Math.sin(s) - 0.12, 4), y: rnd(s, 4), color: 'gold', r: 3.5 }; }),
      ...Array.from({ length: 11 }, (_, k) => { const s = 3 * (k / 10) ** 2; return { x: rnd(0.6 * Math.sin(s) + 0.12, 4), y: rnd(s, 4), color: 'violet', r: 3.5 }; }),
      { x: -0.9, y: 3.1, r: 0.01, color: 'gold', label: 'τ: even ticks' }, { x: 0.55, y: 3.1, r: 0.01, color: 'violet', label: 'λ: bunched' },
    ],
  },
  caption: 'One worldline, labelled two ways. Gold ticks advance evenly with the traveller’s clock (an affine parameter); violet ones bunch up at the start (a non-affine one). Same path; only the second labelling adds a term along the velocity to the equation.',
};

// a body dropped from rest far away, passing a radius r = kM, outside a horizon (schematic)
const infall = (k) => ({
  type: 'graph',
  params: {
    x: [-4.2, 4.2], y: [-2.4, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink', width: 2.6 }, { param: [`${rnd(k / 2, 4)}*cos(t)`, `${rnd(k / 2, 4)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.4, dash: true }],
    arrows: [{ from: [3.9, 0.6], to: [rnd(k / 2 + 0.25, 4), 0.6], color: 'gold' }],
    points: [{ x: rnd(k / 2, 4), y: 0.6, color: 'gold', label: `r = ${k}M` }, { x: -0.45, y: -0.1, r: 0.01, color: 'ink2', label: 'r = 2M' }],
  },
  caption: t`Schematic, not to scale: a body released from rest far away (so $E = 1$) falls straight in; the dashed circle is $r = ${k}M$, the solid one the horizon, $r = 2M$ ($G = c = 1$).`,
});

export default lesson({
  id: 'gr.S12.d',
  title: 'The geodesic equation from the action',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der', 'est-obs'],
  intro: t`In Intuition Mode, free fall was the path of maximal aging. Make that a calculation. The proper time along any path is $\tau = \int\sqrt{-g_{\mu\nu}\,\dot x^\mu\dot x^\nu}\,d\lambda$ (with $c = 1$; dots are derivatives with respect to the path's label $\lambda$). Demand that no small change of path changes $\tau$ to first order, and the **Euler–Lagrange equations** of that integral are the geodesic equation above — with the Christoffel symbols of step 11 appearing by themselves.

Two practical gifts come with it. The shortcut $L = \tfrac12 g_{\mu\nu}\dot x^\mu\dot x^\nu$ gives the same equations with no square root, so you can **read the Christoffel symbols off** them. And every coordinate the metric does not contain hands you a **conserved quantity** — energy and angular momentum around a black hole, Clairaut's rule for great circles on the Earth.`,
  equation: GEO,
  symbols: [
    { tex: 'x^\\rho(\\tau)', text: t`the worldline: four functions saying where and when the body is, labelled by $\tau$` },
    { tex: '\\tau', text: t`proper time, the reading of a clock carried along (with $c = 1$, in metres or seconds alike). For light, where $d\tau = 0$, an affine parameter $\lambda$ takes its place` },
    { tex: '\\frac{dx^\\mu}{d\\tau}', text: t`the four-velocity $u^\mu$, with $g_{\mu\nu}u^\mu u^\nu = -1$ for a massive body` },
    { tex: '\\Gamma^\\rho{}_{\\mu\\nu}', text: t`the Christoffel symbols of the metric (step 11): the geometry's whole contribution to the motion` },
    { tex: '\\rho,\\ \\mu,\\ \\nu', text: t`$\rho$ is free — four equations, one per coordinate; $\mu$ and $\nu$ are summed over $0$–$3$` },
  ],
  why: t`This is the equation every orbit, plunge and light ray of the Road obeys; deriving it from a stationary-proper-time principle is also what hands you their conserved energy and angular momentum.`,
  visual: {
    type: 'gr-surface',
    title: 'Geodesics computed from the geodesic equation',
    lead: t`The gold path is found by stepping $\ddot x^a + \Gamma^a{}_{bc}\dot x^b\dot x^c = 0$ forward from P with the surface's own Christoffel symbols. Watch the readout: $\rho^2\dot u$ — the Euler–Lagrange momentum of the angle $u$, with $\rho$ the distance from the axis — never changes, because the metric does not contain $u$.`,
    tasks: [
      t`Sphere: put P away from the equator and launch at 0°, along the dashed circle of latitude. The geodesic leaves it — it is a great circle — while $\rho^2\dot u$ stays fixed all the way round.`,
      t`Torus: follow a long geodesic on the outer half. It swings between two circles where $\rho = |\rho^2\dot u|$: turning points read straight from the conserved quantity.`,
      t`Catenoid: put P on the narrow waist (slider at 0.50) and launch at 0° — the waist circle is a geodesic. Tilt the launch by a degree and the path spirals away: an unstable circular orbit, like light's photon sphere around a black hole (step 21).`,
    ],
    params: { mode: 'geodesic', surface: 'torus', surfaces: ['sphere', 'torus', 'catenoid', 'cylinder'], pos: 0.55, heading: 40, length: 18 },
  },
  example: {
    prompt: t`Show that the paths of stationary proper time obey the geodesic equation, and find which connection appears in it.`,
    steps: [
      { label: 'What is varied', text: t`$\tau[x] = \int\sqrt{-g_{\mu\nu}(x)\,\dot x^\mu\dot x^\nu}\,d\lambda$, for paths $x^\mu(\lambda)$ between two fixed events. Stationary means $\delta\tau = 0$ to first order for every small change $\delta x^\mu$ that vanishes at the ends — exactly the setting of the Euler–Lagrange equations, $\dfrac{d}{d\lambda}\dfrac{\partial L}{\partial\dot x^\sigma} - \dfrac{\partial L}{\partial x^\sigma} = 0$, with $L = \sqrt{-g_{\mu\nu}\dot x^\mu\dot x^\nu}$.` },
      { label: 'The two derivatives', text: t`$$\frac{\partial L}{\partial\dot x^\sigma} = -\frac{g_{\sigma\nu}\dot x^\nu}{L}, \qquad \frac{\partial L}{\partial x^\sigma} = -\frac{\partial_\sigma g_{\mu\nu}\,\dot x^\mu\dot x^\nu}{2L}$$ In the first, the two $\dot x$'s of $g_{\mu\nu}\dot x^\mu\dot x^\nu$ contribute equally because the metric is symmetric.` },
      { label: 'Label by proper time', text: t`The path doesn't care how it is labelled, so choose $\lambda = \tau$. Then $L = \sqrt{-g_{\mu\nu}u^\mu u^\nu} = 1$ all along it, its derivative vanishes, and the equation becomes $\dfrac{d}{d\tau}\big(g_{\sigma\nu}u^\nu\big) - \tfrac12\,\partial_\sigma g_{\mu\nu}\,u^\mu u^\nu = 0$.` },
      { label: 'Expand', text: t`$\dfrac{d}{d\tau}(g_{\sigma\nu}u^\nu) = g_{\sigma\nu}\dfrac{du^\nu}{d\tau} + \partial_\mu g_{\sigma\nu}\,u^\mu u^\nu$, by the chain rule. Since $u^\mu u^\nu$ is symmetric, write $\partial_\mu g_{\sigma\nu}u^\mu u^\nu = \tfrac12(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma})u^\mu u^\nu$. So $g_{\sigma\nu}\dfrac{du^\nu}{d\tau} + \tfrac12\big(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\big)u^\mu u^\nu = 0$.` },
      { label: 'Raise the index', text: t`Multiply by $g^{\rho\sigma}$: $\dfrac{du^\rho}{d\tau} + \tfrac12 g^{\rho\sigma}\big(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\big)u^\mu u^\nu = 0$. The bracket times $\tfrac12 g^{\rho\sigma}$ is exactly $\Gamma^\rho{}_{\mu\nu}$ of step 11.` },
      { label: 'Shortcut, and a check', text: t`The same equations come from $L = \tfrac12 g_{\mu\nu}\dot x^\mu\dot x^\nu$ with an affine label, and with no square root. A timelike geodesic's stationary $\tau$ is a local **maximum** — every wiggle costs proper time, the twin paradox. For light $d\tau = 0$, so only the shortcut form, with an affine $\lambda$, works.` },
    ],
    answer: t`Stationary proper time $\iff \dfrac{d^2x^\rho}{d\tau^2} + \Gamma^\rho{}_{\mu\nu}u^\mu u^\nu = 0$, where $\Gamma$ is the Christoffel connection of the metric: free fall knows no other.`,
  },
  practice: [
    expr({
      id: 'dLdr', difficulty: 2,
      prompt: t`In a flat plane in polar coordinates, $L = \tfrac12\left(\dot r^2 + r^2\dot\theta^2\right)$. Writing $\dot r$ as $v$ and $\dot\theta$ as $w$, find $\partial L/\partial r$ — the term that becomes the "centrifugal" part of the radial equation.`,
      answer: 'r*w^2', answerTeX: t`r\,w^2`, lhs: t`\partial L/\partial r`,
      vars: { r: [0.5, 3], v: [-2, 2], w: [-2, 2] }, derivativeOf: '(v^2 + r^2*w^2)/2',
      errors: [{ answer: '2r*w^2', feedback: t`Keep the $\tfrac12$: $\partial_r(\tfrac12 r^2w^2) = rw^2$.` }, { answer: 'r^2*w^2/2', feedback: 'Differentiate with respect to r: the partial derivative, not the term itself.' }, { answer: 'v', feedback: t`That is $\partial L/\partial\dot r$, the radial momentum. Here $r$ itself varies, with $v$ and $w$ held fixed.` }],
      hints: [t`Hold $v$ and $w$ fixed: only $\tfrac12 r^2 w^2$ depends on $r$.`, t`$\partial_r(\tfrac12 r^2w^2) = r\,w^2$.`],
      teach: t`In the Euler–Lagrange equation $\tfrac{d}{d\lambda}\tfrac{\partial L}{\partial\dot r} = \tfrac{\partial L}{\partial r}$, the metric's dependence on $r$ produces the terms that look like forces.`,
      explain: t`$\partial L/\partial r = r\dot\theta^2$, and $\partial L/\partial\dot r = \dot r$, so the radial equation is $\ddot r - r\dot\theta^2 = 0$: comparing with $\ddot r + \Gamma^r{}_{\theta\theta}\dot\theta^2 = 0$ gives $\Gamma^r{}_{\theta\theta} = -r$, as step 11 found from the formula.`,
      visual: straightLine,
    }),
    num({
      id: 'radar', difficulty: 2,
      gen(r) {
        const v = r.pick([180, 250, 300]), b = r.pick([2, 4, 5]);
        const acc = (v * v) / (b * 1e3);
        return {
          prompt: t`An aircraft flies straight and level at ${v} m/s past a radar, its closest approach $b = ${b}$ km. Nothing accelerates it, so in the radar's polar coordinates it obeys the geodesic equations of the plane, $\ddot r - r\dot\theta^2 = 0$ and $\ddot\theta + \tfrac2r\dot r\dot\theta = 0$. What rate of change of the range rate, $\ddot r$, does the radar record at closest approach?`,
          answer: acc, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: t`No force does not mean $\ddot r = 0$ in polar coordinates: the radial equation says $\ddot r = r\dot\theta^2$.` }, { value: v / (b * 1e3), feedback: t`That is $\dot\theta$, in rad/s. Square it and multiply by $r$.` }],
          hints: [t`At closest approach $r = b$ and the whole velocity is sideways: $\dot\theta = v/b$.`, t`$\ddot r = r\dot\theta^2 = b\,(v/b)^2 = v^2/b$; put $b$ in metres.`],
          teach: t`A straight, unaccelerated path has $\ddot r \neq 0$ in polar coordinates: the Christoffel term $\Gamma^r{}_{\theta\theta}\dot\theta^2$ is the grid, not a force.`,
          explain: t`$\ddot r = r\dot\theta^2 = v^2/b = ${v}^2/${b * 1000} = ${fmt(acc, 3)}$ m/s² — what the radar's range data show, though no force acts. A tracking filter that forgot the $-r\dot\theta^2$ term would invent a force where there is none.`,
          visual: radarPicture(b, v),
        };
      },
    }),
    expr({
      id: 'read-off', difficulty: 3,
      prompt: t`On a unit sphere, $L = \tfrac12\big(\dot\theta^2 + \sin^2\theta\,\dot\phi^2\big)$. Its $\phi$ Euler–Lagrange equation, $\tfrac{d}{d\lambda}\big(\sin^2\theta\,\dot\phi\big) = 0$, expands to $$\ddot\phi + 2\cot\theta\,\dot\theta\,\dot\phi = 0.$$ Comparing with $\ddot\phi + \Gamma^\phi{}_{\mu\nu}\dot x^\mu\dot x^\nu = 0$, find $\Gamma^\phi{}_{\theta\phi}$.`,
      answer: 'cot(theta)', answerTeX: t`\cot\theta`, lhs: t`\Gamma^\phi{}_{\theta\phi}`,
      vars: { theta: [0.3, 2.8] },
      errors: [{ answer: '2cot(theta)', feedback: t`The sum over $\mu, \nu$ contains both $\Gamma^\phi{}_{\theta\phi}\dot\theta\dot\phi$ and $\Gamma^\phi{}_{\phi\theta}\dot\phi\dot\theta$, which are equal. The 2 is shared between them.` }, { answer: '-cot(theta)', feedback: t`Check the sign: the equation reads $\ddot\phi + 2\cot\theta\,\dot\theta\dot\phi = 0$, already in the form $\ddot\phi + \Gamma\dot x\dot x = 0$.` }],
      hints: [t`Write out the sum: $\Gamma^\phi{}_{\mu\nu}\dot x^\mu\dot x^\nu$ contains the two terms $\Gamma^\phi{}_{\theta\phi}\dot\theta\dot\phi + \Gamma^\phi{}_{\phi\theta}\dot\phi\dot\theta$.`, t`Those two are equal, so together they make $2\Gamma^\phi{}_{\theta\phi}\dot\theta\dot\phi$. Match it with $2\cot\theta\,\dot\theta\dot\phi$.`],
      teach: 'Reading Christoffel symbols off an Euler–Lagrange equation: a mixed term comes with a factor 2, shared by the two symmetric symbols.',
      explain: t`$2\Gamma^\phi{}_{\theta\phi} = 2\cot\theta$, so $\Gamma^\phi{}_{\theta\phi} = \Gamma^\phi{}_{\phi\theta} = \cot\theta$; the $\theta$ equation, $\ddot\theta - \sin\theta\cos\theta\,\dot\phi^2 = 0$, gives $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ with no factor 2. The same symbols the formula gave in step 11, in a fraction of the work.`,
      visual: surfacePic({ mode: 'geodesic', surface: 'sphere', v: 0.9, heading: 20, length: 6.2 }, t`A geodesic of the sphere (gold) launched from P (red arrow): a great circle, not the dashed circle of latitude.`),
    }),
    expr({
      id: 'weak-field', difficulty: 3,
      prompt: t`Near a star, slowly moving bodies feel the weak-field metric $ds^2 = -(1 + 2\Phi)\,dt^2 + dx^2$ along one line (with $c = 1$; the spatial part's small correction does not matter for slow motion). Take $\Phi = -k/x$, with $k = GM$. With $L = \tfrac12\big[-(1 + 2\Phi)\dot t^2 + \dot x^2\big]$, write $\dot t$ as $w$ and $\dot x$ as $v$, and find $\partial L/\partial x$.`,
      answer: '-k*w^2/x^2', answerTeX: t`-\frac{k\,w^2}{x^2}`, lhs: t`\partial L/\partial x`,
      vars: { x: [1, 4], k: [0.1, 0.5], w: [0.8, 1.3], v: [-0.3, 0.3] }, derivativeOf: '(-(1 - 2k/x)*w^2 + v^2)/2',
      errors: [{ answer: 'k*w^2/x^2', feedback: t`Sign: $-(1 + 2\Phi) = -1 + 2k/x$, whose derivative is $-2k/x^2$. With the opposite sign, gravity would repel.` }, { answer: '-2k*w^2/x^2', feedback: t`Keep the $\tfrac12$ in front of $L$.` }],
      hints: [t`With $\Phi = -k/x$, the coefficient of $\dot t^2$ is $-(1 - 2k/x) = -1 + 2k/x$.`, t`$\partial_x\big[\tfrac12(-1 + 2k/x)w^2\big] = \tfrac12\cdot(-2k/x^2)\,w^2$.`],
      teach: t`In the weak-field metric, the Euler–Lagrange equation for $x$ is Newton's law: $\ddot x = \partial L/\partial x = -\partial_x\Phi\,\dot t^2 \approx -\partial_x\Phi$.`,
      explain: t`$\partial L/\partial x = -kw^2/x^2$ and $\partial L/\partial\dot x = \dot x$, so $\ddot x = -k\dot t^2/x^2$. For slow motion $\dot t = dt/d\tau \approx 1$: $\ddot x = -GM/x^2$, Newton's inverse-square law — gravity coming entirely from how clocks run, $g_{00} = -(1 + 2\Phi)$.`,
      visual: fallField({ label: 'star' }),
    }),
    num({
      id: 'rope', difficulty: 2,
      gen(r) {
        const k = r.pick([1.5, 2, 3, 4, 10]);
        const E = Math.sqrt(1 - 1 / k);
        return {
          prompt: t`The Schwarzschild metric ($G = c = 1$) does not contain $t$, so its Euler–Lagrange equation makes $E = (1 - 2M/r)\,\dfrac{dt}{d\tau}$ constant: the energy per unit rest mass, as measured far away. A mass held at rest at $r$ has $\dfrac{dt}{d\tau} = 1/\sqrt{1 - 2M/r}$, so $E = \sqrt{1 - 2M/r}$. In a thought experiment, a mass lowered on an ideal rope from far away to $r = ${k}\,r_s$ (with $r_s = 2M$) delivers the difference, $1 - E$ of its rest energy, to the winch at the top. What percentage is that?`,
          answer: 100 * (1 - E), units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * E, feedback: t`That is $E$ itself, the energy the mass still has. The winch receives $1 - E$.` }, { value: 100 / (2 * k), feedback: t`That is the Newtonian estimate, $GM/(rc^2) = r_s/(2r)$. Use $1 - \sqrt{1 - r_s/r}$.` }],
          hints: [t`$2M/r = r_s/r = 1/${k}$.`, t`$1 - E = 1 - \sqrt{1 - 1/${k}}$.`],
          teach: 'A coordinate the metric does not contain gives a conserved momentum: t gives the energy E, which for a static mass is √(1 − r_s/r).',
          explain: t`$E = \sqrt{1 - 1/${k}} = ${fmt(E, 4)}$, so $1 - E = ${fmt(100 * (1 - E), 3)}\%$ of the rest energy. Lowered all the way to the horizon it would approach 100% — though no real rope could survive the tension; it is a thought experiment that shows what $E$ means.`,
          visual: {
            type: 'graph',
            params: { x: [0, 12], y: [0, 1.05], xlabel: 'r / r_s', ylabel: 'E (per unit rest energy)', curves: [{ fn: 'sqrt(1 - 1/x)', domain: [1, 12], color: 'accent' }], vlines: [{ x: 1, label: 'horizon', color: 'ink' }, { x: k, color: 'gold' }] },
            caption: t`The conserved energy of a mass held at rest, against its distance in horizon radii; the gold line marks $r = ${k}\,r_s$.`,
          },
        };
      },
    }),
    mcq({
      id: 'affine', difficulty: 2,
      prompt: t`The derivation labels the path by proper time $\tau$. What goes wrong with an arbitrary label $\lambda$?`,
      choices: [
        t`Nothing changes the path, but unless $\lambda = a\tau + b$ the equation picks up an extra term along the velocity, $\propto dx^\rho/d\lambda$`,
        'There are no geodesics unless the path is labelled by proper time',
        t`Coordinate time $t$ cannot be defined in curved spacetime, so $\tau$ is the only option`,
        t`Labelling by $\tau$ makes the Christoffel symbols vanish`,
      ],
      answer: 0,
      why: {
        1: 'A geodesic is a set of events; any smooth labelling traces the same set. Only the form of the equation depends on the labelling.',
        2: t`Coordinate time is a fine label for many purposes (step 19 uses it); it is just not affine in general.`,
        3: t`The Christoffel symbols belong to the metric and coordinates; relabelling the path does nothing to them.`,
      },
      hints: [t`With $\lambda = \tau$, what is $L = \sqrt{-g_{\mu\nu}u^\mu u^\nu}$ along the path?`, t`If $L$ is not constant, $\tfrac{d}{d\lambda}(g_{\sigma\nu}\dot x^\nu/L)$ produces an extra term with $dL/d\lambda$.`],
      teach: 'The geodesic equation in its standard form holds for affine parameters — τ or any aτ + b — and for light only such a λ can be used.',
      explain: t`With a general $\lambda$, $L$ varies along the path and the Euler–Lagrange equation becomes $\ddot x^\rho + \Gamma^\rho{}_{\mu\nu}\dot x^\mu\dot x^\nu = (\dot L/L)\,\dot x^\rho$. Affine parameters make the right side zero. For light $L = 0$, so the square-root action fails and the shortcut $\tfrac12 g_{\mu\nu}\dot x^\mu\dot x^\nu$ with an affine $\lambda$ is the only way.`,
      visual: labellings,
    }),
    mcq({
      id: 'cyclic', difficulty: 2,
      prompt: t`In the equatorial plane of the Schwarzschild spacetime ($G = c = 1$), $L = \tfrac12\big[-(1 - 2M/r)\dot t^2 + (1 - 2M/r)^{-1}\dot r^2 + r^2\dot\phi^2\big]$. No metric component depends on $t$ or $\phi$. What do their Euler–Lagrange equations give?`,
      choices: [
        t`Two conserved quantities along every geodesic: $E = (1 - 2M/r)\,\dot t$ and $\ell = r^2\dot\phi$, the energy and angular momentum per unit mass`,
        t`That $t$ and $\phi$ themselves stay constant along the path`,
        t`$E = \dot t$ and $\ell = \dot\phi$, the same as in flat space`,
        'Nothing: only the radial equation carries information',
      ],
      answer: 0,
      why: {
        1: t`The conjugate momenta $\partial L/\partial\dot t$ and $\partial L/\partial\dot\phi$ are constant, not the coordinates: an orbiting planet's $\phi$ certainly changes.`,
        2: t`The momenta carry the metric factors: $\partial L/\partial\dot t = -(1 - 2M/r)\dot t$ and $\partial L/\partial\dot\phi = r^2\dot\phi$.`,
        3: t`They are the most useful two: with $E$ and $\ell$ fixed, the radial motion reduces to one equation for $r$ — the effective potentials of step 21.`,
      },
      hints: [t`If $\partial L/\partial x = 0$, Euler–Lagrange says $\tfrac{d}{d\lambda}(\partial L/\partial\dot x) = 0$.`, t`Compute $\partial L/\partial\dot t$ and $\partial L/\partial\dot\phi$.`],
      teach: 'Every coordinate the metric does not contain gives a conserved momentum: in Schwarzschild, energy from t and angular momentum from φ.',
      explain: t`$\tfrac{d}{d\tau}\big[(1 - 2M/r)\dot t\big] = 0$ and $\tfrac{d}{d\tau}\big[r^2\dot\phi\big] = 0$. These are what make black-hole orbits solvable — and what the orbit below conserves at every step.`,
      visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 20, L: 4.3, compare: false }, caption: 'An orbit around a non-spinning black hole (G = c = 1, distances in units of M), integrated with E and ℓ held fixed: its closest approach swings round from one orbit to the next.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-clairaut', difficulty: 3, transfer: true,
      gen(r) {
        const [city, lat0] = r.pick([['Madrid', 40.4], ['New York', 40.6], ['Tokyo', 35.7], ['Seattle', 47.6]]);
        const az = r.pick([45, 50, 60]);
        const latMax = Math.acos(Math.cos(lat0 * DEG) * Math.sin(az * DEG)) / DEG;
        return {
          prompt: t`An airliner leaves ${city} (latitude ${lat0}°N) on a great-circle route, setting off on a course ${az}° east of north. On a sphere the longitude $\phi$ is absent from $L = \tfrac12(\dot\theta^2 + \sin^2\theta\,\dot\phi^2)$, so $\sin^2\theta\,\dot\phi$ is conserved; for a path at unit speed that is $\cos(\text{latitude})\times\sin(\text{course from north})$. What is the highest latitude the route reaches, where it heads due east?`,
          answer: latMax, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 90 - az, feedback: 'The course angle alone does not fix the vertex; the starting latitude enters through cos(latitude).' }, { value: Math.acos(Math.sin(lat0 * DEG) * Math.sin(az * DEG)) / DEG, feedback: 'Use the cosine of the latitude — the distance from the axis, ρ = cos(latitude) on a unit sphere.' }],
          hints: [t`At the highest point the course is due east, $\sin 90^\circ = 1$, so $\cos(\text{lat}_{\max}) = \cos ${lat0}^\circ\times\sin ${az}^\circ$.`, t`$\text{lat}_{\max} = \arccos\!\big(\cos ${lat0}^\circ\,\sin ${az}^\circ\big)$.`],
          teach: 'A conserved momentum from a missing coordinate fixes a geodesic’s turning points: on a sphere, the vertex of a great circle.',
          explain: t`$\cos(\text{lat}_{\max}) = \cos ${lat0}^\circ\times\sin ${az}^\circ = ${fmt(Math.cos(lat0 * DEG) * Math.sin(az * DEG), 4)}$, so $\text{lat}_{\max} = ${fmt(latMax, 3)}^\circ$N. This is Clairaut's relation; flight planners use it to find how far north a great-circle route climbs — the same conserved angular momentum that bounds a planet's orbit. (A spherical Earth; the real one is slightly flattened.)`,
          visual: surfacePic({ mode: 'geodesic', surface: 'sphere', v: rnd((90 - lat0) * DEG, 4), heading: -(90 - az), length: 3.1416 }, t`A great circle on a sphere, launched north-eastward (red) from the starting latitude; dashed: the circle of latitude through the start. Not to scale with any map.`),
        };
      },
    }),
    num({
      id: 'cp-infall', difficulty: 2,
      gen(r) {
        const k = r.pick([3, 4, 6, 10]);
        const val = 1 / (1 - 2 / k);
        return {
          prompt: t`A body falls straight into a non-spinning black hole from rest far away, so its conserved energy is $E = (1 - 2M/r)\,\dfrac{dt}{d\tau} = 1$ ($G = c = 1$). At $r = ${k}M$, how many seconds of the far-away time $t$ pass per second of the body's own clock?`,
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: 1 - 2 / k, feedback: t`Upside down: $dt/d\tau = E/(1 - 2M/r)$.` }, { value: 1 / Math.sqrt(1 - 2 / k), feedback: t`That is $dt/d\tau$ for a body held at rest. A falling body with $E = 1$ has $dt/d\tau = 1/(1 - 2M/r)$.` }],
          hints: [t`Solve $E = (1 - 2M/r)\,dt/d\tau$ for $dt/d\tau$ with $E = 1$.`, t`$2M/r = 2/${k}$.`],
          teach: 'With E conserved, dt/dτ = E/(1 − 2M/r): the far-away clock races ahead of a falling one, without limit at the horizon.',
          explain: t`$\dfrac{dt}{d\tau} = \dfrac{1}{1 - 2/${k}} = ${fmt(val, 4)}$. As $r \to 2M$ it grows without bound: seen from far away the body never quite crosses the horizon, while its own clock reaches it in finite time.`,
          visual: infall(k),
        };
      },
    }),
    expr({
      id: 'cp-half-plane', difficulty: 3,
      prompt: t`For the upper half-plane, $L = \dfrac{\dot x^2 + \dot y^2}{2y^2}$. The $x$ Euler–Lagrange equation, $\dfrac{d}{d\lambda}\!\left(\dfrac{\dot x}{y^2}\right) = 0$, expands to $\ddot x - \dfrac{2}{y}\,\dot x\,\dot y = 0$. Read off $\Gamma^x{}_{xy}$.`,
      answer: '-1/y', answerTeX: t`-\frac1y`, lhs: t`\Gamma^x{}_{xy}`,
      vars: { y: [0.4, 3] },
      errors: [{ answer: '-2/y', feedback: t`The $\dot x\dot y$ term collects $\Gamma^x{}_{xy}$ and $\Gamma^x{}_{yx}$: halve the coefficient.` }, { answer: '1/y', feedback: t`Match signs with $\ddot x + \Gamma^x{}_{\mu\nu}\dot x^\mu\dot x^\nu = 0$: the coefficient is $-2/y$.` }],
      hints: [t`Write out the sum: $\Gamma^x{}_{\mu\nu}\dot x^\mu\dot x^\nu$ contains $\Gamma^x{}_{xy}\dot x\dot y + \Gamma^x{}_{yx}\dot y\dot x = 2\Gamma^x{}_{xy}\dot x\dot y$.`, t`Match $2\Gamma^x{}_{xy}$ with the coefficient $-2/y$.`],
      teach: 'A mixed velocity term in an Euler–Lagrange equation carries twice the Christoffel symbol.',
      explain: t`$2\Gamma^x{}_{xy} = -2/y$, so $\Gamma^x{}_{xy} = -1/y$ — what the formula gives in step 11. With $\Gamma^y{}_{xx} = 1/y$ and $\Gamma^y{}_{yy} = -1/y$ from the $y$ equation, these equations bend straight lines into the semicircles drawn below.`,
      visual: halfPlane(),
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §3.3 (geodesics from the action) and §7.4', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 8–9', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
