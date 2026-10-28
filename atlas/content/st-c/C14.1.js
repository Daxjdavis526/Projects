// The geodesic equation: the curve that transports its own velocity, and the
// Euler–Lagrange equations of L = ½ g_μν ẋ^μ ẋ^ν. Consequences: g(ẋ, ẋ)
// constant for an affine parameter, a conserved momentum for each coordinate
// the metric lacks, only λ → aλ + b keeps the form. Worked on 1+1 de Sitter
// (Hubble drag, γv ∝ 1/a); the free two-link arm; radial fall from rest in
// Schwarzschild; a Λ-dominated far future.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const MPC_KM = 3.0857e19, GYR_S = 3.15576e16;

const shoot = (metric, P, launch, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'geodesic', P, drag: false, readout: false, cells: 8, length: 4, ...launch, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C14.1',
  title: 'The geodesic equation',
  minutes: 15, difficulty: 3,
  equation: t`\frac{d^2x^\mu}{d\lambda^2} + \Gamma^\mu{}_{\nu\rho}\,\frac{dx^\nu}{d\lambda}\frac{dx^\rho}{d\lambda} = 0`,
  intro: t`A **geodesic** is a curve that parallel-transports its own velocity, $\nabla_{\dot x}\dot x = 0$ (C12.2): it never turns, by the connection’s standard. In components that is the equation above — second order, so a starting point and a starting velocity fix the whole curve. For the Levi-Civita connection the same equation is the **Euler–Lagrange equation** of $L = \tfrac12 g_{\mu\nu}\dot x^\mu\dot x^\nu$ ([phys3550 M4](#/lesson/phys3550.M4.3)): free motion is motion with kinetic energy only, in whatever geometry $g$ describes. ([st-a A9.2](#/lesson/st-a.A9.2) did the flat plane; here, curved spaces and spacetimes.)

Three consequences come free. $g(\dot x, \dot x)$ is **constant** along a geodesic. If $g$ does not depend on a coordinate $x^c$, the **momentum** $p_c = g_{c\nu}\dot x^\nu$ is conserved. And the parameter is special: only **affine** changes $\lambda \to a\lambda + b$ keep the equation’s form — proper time for a massive body, arc length on a surface.`,
  symbols: [
    { tex: t`x^\mu(\lambda)`, text: 'the curve in a chart' },
    { tex: t`\lambda`, text: 'an affine parameter: proper time τ along a timelike geodesic, arc length s on a surface, or any aλ + b' },
    { tex: t`\Gamma^\mu{}_{\nu\rho}`, text: 'the Christoffel symbols along the curve: in GR, the gravitational field strengths' },
    { tex: t`\frac{dx^\nu}{d\lambda}`, text: t`the velocity $\dot x^\nu$; the equation is quadratic in it` },
  ],
  why: t`In GR this is the equation of motion of every freely falling body and every light ray: planets, GPS satellites, photons grazing the Sun, gas spiralling into a black hole. No force appears in it — only the metric, through $\Gamma$.`,
  visual: {
    type: 'dg4-chart',
    title: 'Shoot a geodesic',
    lead: t`Pick a space, drag P and set the launch: a heading on a curved surface, a speed $v$ in a spacetime ($\pm1$ is light). The gold curve is the geodesic integrated from the equation above; the faint ones start a little to either side. The readout follows the conserved momentum and $g(\dot x, \dot x)$.`,
    tasks: [
      t`Half-plane: every geodesic is a semicircle standing on $y = 0$ (or a vertical line). Neighbours launched a few degrees apart spread ever wider: negative curvature.`,
      t`Torus, P on the outer equator: launch at $30^\circ$ and the path weaves about the equator for ever; launch steeply and it winds through the hole. $p_u$ stays fixed to the last digit.`,
      t`De Sitter, $v = 0.9$: the particle slows against the comoving grid and stops in comoving $x$ — though $p_x = e^{2Ht}\dot x$ never changes. Two-link arm: the free arm’s joints trade motion, but $p_{\theta_1}$ (its angular momentum) is fixed.`,
    ],
    params: { metric: 'halfplane', metrics: ['halfplane', 'torus', 'desitter', 'arm'], mode: 'geodesic', sliders: ['heading', 'speed', 'length'], heading: 40, speed: 0.9, length: 5, lengthMax: 25, fan: 4, spread: 6, readout: ['conserved', 'norm', 'length'], cells: 8 },
    caption: t`Each space on its own coordinate chart. Geodesics integrated by RK4 with an affine parameter (arc length or proper time); faint neighbours launched $6^\circ$ (or 0.06 in speed) apart.`,
  },
  example: {
    prompt: t`In 1+1 de Sitter spacetime, $ds^2 = -dt^2 + e^{2Ht}dx^2$ ($c = 1$), derive the geodesic equations from $L = \tfrac12(-\dot t^2 + e^{2Ht}\dot x^2)$, read off the Christoffel symbols, and find how a free particle’s speed relative to the comoving observers changes. A probe passes a comoving observer at $v = 0.6$; what is its speed when the universe has doubled in size?`,
    visual: shoot('desitter', [-1.5, 0], { speed: 0.6, length: 3.5 }, t`The probe’s worldline from P with $v = 0.6$ ($H = 1$): it covers less and less comoving $x$ per unit time and settles toward a fixed comoving position.`, { view: { a: [-2, 1.5], b: [-0.3, 2.5] } }),
    steps: [
      { label: 'x equation', text: t`$L$ has no $x$: $\dfrac{d}{d\tau}\dfrac{\partial L}{\partial\dot x} = 0$, so $p_x = e^{2Ht}\dot x$ is constant. Expanded: $\ddot x + 2H\dot t\dot x = 0$, so $\Gamma^x{}_{xt} = \Gamma^x{}_{tx} = H$ (the mixed term carries $2\Gamma$).` },
      { label: 't equation', text: t`$\dfrac{d}{d\tau}(-\dot t) - He^{2Ht}\dot x^2 = 0$, i.e. $\ddot t + He^{2Ht}\dot x^2 = 0$: $\Gamma^t{}_{xx} = He^{2Ht}$.` },
      { label: 'Normalization', text: t`With $\lambda = \tau$, $-\dot t^2 + e^{2Ht}\dot x^2 = -1$ along the whole path — a first integral that replaces the $t$ equation.` },
      { label: 'Measured speed', text: t`A comoving observer measures the probe’s $\gamma v$ as its 4-velocity’s spatial component in an orthonormal frame: $\gamma v = e^{Ht}\dot x = p_x/a$ with $a = e^{Ht}$. So **$\gamma v \propto 1/a$**: free motion decays against the Hubble flow.` },
      { label: 'Numbers', text: t`At first $\gamma v = 0.6/0.8 = 0.75$; when $a$ has doubled, $\gamma v = 0.375$, so $v = 0.375/\sqrt{1 + 0.375^2} = 0.351$. Momenta of free particles redshift exactly as photons do.` },
    ],
    answer: t`$\Gamma^x{}_{xt} = H$, $\Gamma^t{}_{xx} = He^{2Ht}$; $p_x = e^{2Ht}\dot x$ is conserved, so $\gamma v = p_x/a$ falls as $1/a$: from $v = 0.6$ to $v = 0.351$ when $a$ doubles.`,
  },
  practice: [
    order({
      id: 'euler-lagrange', difficulty: 2,
      prompt: t`Derive the geodesic equation from $L = \tfrac12 g_{\mu\nu}(x)\dot x^\mu\dot x^\nu$. Order the steps.`,
      visual: shoot('halfplane', [0, 1], { heading: 30, length: 3, fan: 2, spread: 10 }, 'Geodesics of the half-plane: solutions of the Euler–Lagrange equations of its kinetic energy.'),
      items: [
        t`$\dfrac{\partial L}{\partial\dot x^\sigma} = g_{\sigma\nu}\dot x^\nu$ and $\dfrac{\partial L}{\partial x^\sigma} = \tfrac12\partial_\sigma g_{\mu\nu}\dot x^\mu\dot x^\nu$.`,
        t`$\dfrac{d}{d\lambda}(g_{\sigma\nu}\dot x^\nu) = g_{\sigma\nu}\ddot x^\nu + \partial_\mu g_{\sigma\nu}\dot x^\mu\dot x^\nu$.`,
        t`Symmetrize the last term: $\partial_\mu g_{\sigma\nu}\dot x^\mu\dot x^\nu = \tfrac12(\partial_\mu g_{\sigma\nu} + \partial_\nu g_{\sigma\mu})\dot x^\mu\dot x^\nu$.`,
        t`Euler–Lagrange: $g_{\sigma\nu}\ddot x^\nu + \tfrac12(\partial_\mu g_{\sigma\nu} + \partial_\nu g_{\sigma\mu} - \partial_\sigma g_{\mu\nu})\dot x^\mu\dot x^\nu = 0$.`,
        t`Multiply by $g^{\rho\sigma}$: $\ddot x^\rho + \Gamma^\rho{}_{\mu\nu}\dot x^\mu\dot x^\nu = 0$, with exactly the Christoffel symbols.`,
      ],
      hints: ['Compute both partial derivatives of L, then the total derivative of the first.', 'Raising the free index with the inverse metric turns the bracket into Γ.'],
      teach: t`The Euler–Lagrange equations of $L = \tfrac12 g_{\mu\nu}\dot x^\mu\dot x^\nu$ are the geodesic equations, with the Levi-Civita Christoffel symbols.`,
      explain: t`The Christoffel formula appears by itself — which is why the Lagrangian is the fastest way to compute $\Gamma$’s (C13.1) and why free motion is "motion along the geometry".`,
    }),
    num({
      id: 'hubble-drag', difficulty: 2,
      gen(r) {
        const v0 = r.pick([0.3, 0.6, 0.8, 0.9]), f = r.pick([2, 3, 10]);
        const gv = v0 / Math.sqrt(1 - v0 * v0) / f, v = gv / Math.sqrt(1 + gv * gv);
        return {
          prompt: t`In de Sitter spacetime a free particle passes a comoving observer at $v = ${v0}$ ($c = 1$). What speed does a comoving observer measure when the scale factor has grown by a factor ${f}?`,
          visual: shoot('desitter', [-1.5, 0], { speed: v0, length: 3 }, t`The particle’s worldline on the comoving chart ($H = 1$).`, { view: { a: [-2, 1.5], b: [-0.3, 2.5] } }),
          answer: v, tol: { rel: 0.004 },
          errors: [{ value: v0 / f, feedback: t`It is $\gamma v$, not $v$, that falls as $1/a$ (the momentum per unit mass).` }, { value: v0, feedback: t`Free motion is not constant speed relative to the comoving observers: $p_x$ is conserved, not $v$.` }].filter((e) => Math.abs(e.value - v) > 0.005),
          hints: [t`$\gamma v = p_x/a$ with $p_x$ conserved: $\gamma v$ falls by the factor ${f}.`, t`Start: $\gamma v = ${nice(v0 / Math.sqrt(1 - v0 * v0), 4)}$. Then convert back with $v = \gamma v/\sqrt{1 + (\gamma v)^2}$.`],
          teach: 'In an expanding universe a free particle’s momentum relative to the comoving observers falls as 1/a.',
          explain: t`$\gamma v = ${nice(v0 / Math.sqrt(1 - v0 * v0), 4)}/${f} = ${nice(gv, 4)}$, so $v = ${nice(v, 4)}$. Fast particles become slow ones: why dark-matter particles that were relativistic early are cold today.`,
        };
      },
    }),
    num({
      id: 'arm-momentum', difficulty: 2,
      gen(r) {
        const d2 = r.pick([0, 60, 90, 120]), w1 = r.pick([0.5, 1, 2]), w2 = r.pick([-1, 1, 0.5]);
        const c = Math.cos(d2 * DEG), p = (3 + 2 * c) * w1 + (1 + c) * w2;
        return {
          prompt: t`The two-link arm of C11.1 (1 kg masses on 1 m links) hangs from a pivot fixed to a space station, joints unpowered, no gravity: its motion is a geodesic of $g = \begin{pmatrix}3 + 2\cos\theta_2 & 1 + \cos\theta_2\\ 1 + \cos\theta_2 & 1\end{pmatrix}$ kg m². The metric does not contain $\theta_1$. Find the conserved $p_{\theta_1} = g_{1\nu}\dot\theta^\nu$ when $\theta_2 = ${d2}^\circ$, $\dot\theta_1 = ${w1}$ rad/s, $\dot\theta_2 = ${w2}$ rad/s, in kg m²/s.`,
          visual: shoot('arm', [0, r6(d2 * DEG)], { heading: 30, length: 6 }, t`A free motion of the arm on its configuration chart, launched from $\theta_2 = ${d2}^\circ$.`),
          answer: p, units: 'kg m^2/s', tol: { rel: 0.004 },
          errors: [{ value: (3 + 2 * c) * w1, feedback: t`Include $g_{12}\dot\theta_2$: moving joint 2 also moves the second mass round the pivot.` }, { value: (3 + 2 * c) * w1 + 2 * (1 + c) * w2, feedback: t`$p_1 = g_{11}\dot\theta^1 + g_{12}\dot\theta^2$: one cross term, not two.` }].filter((e) => Math.abs(e.value - p) > 0.005 * Math.max(1, Math.abs(p))),
          hints: [t`$p_{\theta_1} = g_{11}\dot\theta_1 + g_{12}\dot\theta_2$.`, t`At $${d2}^\circ$: $g_{11} = ${nice(3 + 2 * c, 4)}$, $g_{12} = ${nice(1 + c, 4)}$.`],
          teach: t`A coordinate the metric does not contain gives a conserved momentum $p_c = g_{c\nu}\dot x^\nu$ along every geodesic.`,
          explain: t`$p_{\theta_1} = ${nice(3 + 2 * c, 4)}(${w1}) + ${nice(1 + c, 4)}(${w2}) = ${nice(p, 4)}$ kg m²/s — the arm’s angular momentum about the pivot. As the elbow folds and unfolds, $\dot\theta_1$ changes so that this stays fixed: a space robot can reorient itself just by moving its joints.`,
        };
      },
    }),
    mcq({
      id: 'half-plane-geodesics', difficulty: 1,
      prompt: t`Which curves are geodesics of the hyperbolic half-plane $ds^2 = (dx^2 + dy^2)/y^2$?`,
      visual: shoot('halfplane', [0, 1], { heading: 20, length: 3, fan: 6, spread: 20 }, 'A fan of geodesics from one point of the half-plane.'),
      choices: ['Semicircles centred on y = 0, and vertical lines', 'Horizontal lines y = const', 'Every circle', 'Straight lines of the chart'],
      answer: 0,
      why: { 1: t`Along $y = y_0$ the velocity is not transported: it turns relative to transported vectors at rate $1/y_0$ (C12.2).`, 2: 'Only circles meeting the edge at right angles — centred on y = 0 — qualify.', 3: 'Only the vertical ones; a slanted chart line is not a geodesic.' },
      hints: ['Look at the picture’s fan: where are the centres of the arcs?'],
      teach: 'Geodesics of the half-plane are semicircles orthogonal to the edge (and vertical lines).',
      explain: t`The geodesic equations $\ddot x - \tfrac2y\dot x\dot y = 0$, $\ddot y + \tfrac1y(\dot x^2 - \dot y^2) = 0$ are solved by $x = c + R\tanh s$, $y = R\,\mathrm{sech}\,s$: a semicircle of radius $R$ about $(c, 0)$, run at unit hyperbolic speed.`,
    }),
    mcq({
      id: 'affine', difficulty: 3,
      prompt: t`A geodesic $x^\mu(\lambda)$ is re-parameterized by $\sigma$ with $\lambda = \sigma^3$. What happens to the geodesic equation in terms of $\sigma$?`,
      visual: shoot('torus', [1, 0], { heading: 30, length: 12 }, 'A torus geodesic: the same curve whatever the parameter, but the equation’s form needs an affine one.'),
      choices: [
        t`It picks up a term proportional to the velocity: $x'' + \Gamma x'x' = -\tfrac{2}{\sigma}x'$`,
        'It is unchanged: any parameter works',
        'The curve stops being a geodesic',
        t`The Christoffel symbols are multiplied by $3\sigma^2$`,
      ],
      answer: 0,
      why: { 1: t`Only affine changes $\lambda = a\sigma + b$ leave it unchanged; here $d^2\lambda/d\sigma^2 \ne 0$.`, 2: 'The set of points is the same geodesic; only its equation’s form changes.', 3: t`$\Gamma$ depends on position only; the extra piece comes from $d^2\lambda/d\sigma^2$.` },
      hints: [t`$x' = \dot x\,\lambda'$ and $x'' = \ddot x\,\lambda'^2 + \dot x\,\lambda''$ with $\lambda' = 3\sigma^2$, $\lambda'' = 6\sigma$.`, t`$x'' + \Gamma x'x' = \lambda'^2(\ddot x + \Gamma\dot x\dot x) + \lambda''\dot x = (\lambda''/\lambda')\,x'$.`],
      teach: 'The geodesic equation holds in its standard form only for an affine parameter; other parameters add a term along the velocity.',
      explain: t`$x'' + \Gamma x'x' = \dfrac{\lambda''}{\lambda'}x' = \dfrac{2}{\sigma}x'$. The term points along the velocity, so it changes the pace, not the path — which is why affine parameters such as proper time are singled out.`,
    }),
    num({
      id: 'dt-dtau', difficulty: 2,
      gen(r) {
        const r0 = r.pick([6, 8, 10, 20]), rr = r.pick([3, 4, 5]);
        const E = Math.sqrt(1 - 2 / r0), ans = E / (1 - 2 / rr);
        return {
          prompt: t`A body is dropped from rest at $r_0 = ${r0}M$ outside a black hole ($G = c = 1$). The metric does not contain $t$, so $E = (1 - 2M/r)\,\dot t$ is conserved, and at rest $E = \sqrt{1 - 2M/r_0}$. How many seconds of far-away time pass per second of the body’s own time as it passes $r = ${rr}M$?`,
          visual: shoot('schwarzschild', [r0, 0], { speed: 0, length: 30 }, t`The fall from $r_0 = ${r0}M$ on the $(r, t)$ chart, followed until it leaves the chart near $r = 2M$.`, { view: { a: [0, Math.max(12, r0 + 2)], b: [-2, 40] }, equal: false }),
          answer: ans, tol: { rel: 0.004 },
          errors: [{ value: 1 / (1 - 2 / rr), feedback: t`That is for a body falling from rest at infinity ($E = 1$). Dropped from $r_0$, $E = \sqrt{1 - 2M/r_0} < 1$.` }, { value: 1 / Math.sqrt(1 - 2 / rr), feedback: t`That is a hovering clock’s rate. The falling body also moves, so $\dot t = E/(1 - 2M/r)$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\dot t = dt/d\tau = E/(1 - 2M/r)$.`, t`$E = \sqrt{1 - 2/${r0}} = ${nice(E, 4)}$.`],
          teach: 'A conserved momentum turns a second-order geodesic equation into a first-order one: here, energy gives dt/dτ directly.',
          explain: t`$\dot t = ${nice(E, 4)}/(1 - 2/${rr}) = ${nice(ans, 4)}$. Combined with $g(\dot x, \dot x) = -1$, it gives the radial speed too: $\dot r^2 = E^2 - (1 - 2M/r)$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lambda-future', difficulty: 3, transfer: true,
      gen(r) {
        const v0 = r.pick([300, 1000, 3000]), frac = r.pick([2, 10]);
        const H = 67.4 * Math.sqrt(0.6847), invH = MPC_KM / H / GYR_S;
        const T = Math.log(frac) * invH;
        return {
          prompt: t`In the far future the cosmological constant dominates and the universe approaches de Sitter with $H = H_0\sqrt{\Omega_\Lambda} = 67.4\sqrt{0.685}$ km/s/Mpc (Planck 2018). A probe is launched at ${v0} km/s relative to the local galaxies. How many billion years until its speed relative to the galaxies it is passing has fallen by a factor ${frac}? (At these speeds $\gamma = 1$.)`,
          visual: shoot('desitter', [-1.5, 0], { speed: 0.6, length: 3 }, 'A free worldline in de Sitter on the comoving chart (drawn with H = 1 and a relativistic launch).', { view: { a: [-2, 1.5], b: [-0.3, 2.5] } }),
          answer: T, units: 'Gyr', tol: { rel: 0.01 },
          errors: [{ value: invH * (frac - 1), feedback: t`$a = e^{Ht}$ grows exponentially: the time is $\ln(${frac})/H$.` }, { value: T / Math.log(frac), feedback: t`That is the Hubble time $1/H$ itself. Multiply by $\ln ${frac}$.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: [t`$v \propto 1/a$ and $a \propto e^{Ht}$, so the speed falls by ${frac} after $t = \ln(${frac})/H$.`, t`$H = ${nice(H, 4)}$ km/s/Mpc; $1/H = ${nice(invH, 4)}$ Gyr (1 Mpc $= 3.0857\times10^{19}$ km).`],
          teach: 'Free motion in an expanding universe: peculiar momentum falls as 1/a — in de Sitter, exponentially in time.',
          explain: t`$t = \ln ${frac}\times${nice(invH, 4)}$ Gyr $= ${nice(T, 4)}$ Gyr, whatever the launch speed. No force acts; the geodesic simply keeps $p_x = a^2\dot x$ fixed while $a$ grows.`,
        };
      },
    }),
    num({
      id: 'cp-fall-speed', difficulty: 3,
      gen(r) {
        const r0 = r.pick([10, 20, 50]), rr = r.pick([3, 4, 6]);
        const ans = Math.sqrt(2 / rr - 2 / r0);
        return {
          prompt: t`Dropped from rest at $r_0 = ${r0}M$, a body has $E = \sqrt{1 - 2M/r_0}$. Using $g(\dot x, \dot x) = -1$, i.e. $-\dfrac{E^2}{1 - 2M/r} + \dfrac{\dot r^2}{1 - 2M/r} = -1$, find $|dr/d\tau|$ at $r = ${rr}M$ (in units of $c$).`,
          visual: shoot('schwarzschild', [r0 > 11 ? 11 : r0, 0], { speed: 0, length: 30 }, 'Radial free fall on the Schwarzschild chart.', { view: { a: [0, 12], b: [-2, 40] }, equal: false }),
          answer: ans, tol: { rel: 0.004 },
          errors: [{ value: Math.sqrt(2 / rr), feedback: t`That is the fall from rest at infinity. From $r_0$, subtract $2M/r_0$.` }, { value: 2 / rr - 2 / r0, feedback: t`That is $\dot r^2$; take the square root.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Multiply through by $1 - 2M/r$: $\dot r^2 = E^2 - (1 - 2M/r)$.`, t`$= \dfrac{2M}{r} - \dfrac{2M}{r_0}$.`],
          teach: t`The normalization $g(\dot x, \dot x) = -1$ is a first integral of the geodesic equation.`,
          explain: t`$|\dot r| = \sqrt{2/${rr} - 2/${r0}} = ${nice(ans, 4)}$ — exactly Newton’s energy equation $\tfrac12v^2 = GM/r - GM/r_0$, but with $r$ the areal radius and $\tau$ the faller’s own time. Hovering observers measure the speed $v = \sqrt{1 - (1 - 2M/r)/E^2}$, which reaches $c$ at $r = 2M$ whatever the starting height — one more sign that nothing can hover there.`,
        };
      },
    }),
    mcq({
      id: 'cp-cyclic', difficulty: 2,
      prompt: t`For the torus $ds^2 = (2 + \cos v)^2du^2 + dv^2$, which quantity is conserved along every geodesic (affine parameter $s$)?`,
      visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'torus', v: 0, heading: 35, length: 20, controls: false, readout: false }, caption: 'A torus geodesic weaving about the outer equator.' },
      choices: [t`$(2 + \cos v)^2\,\dfrac{du}{ds}$`, t`$\dfrac{dv}{ds}$`, t`$(2 + \cos v)\,\dfrac{dv}{ds}$`, t`$\dfrac{du}{ds}$`],
      answer: 0,
      why: { 1: t`$v$ appears in the metric, so $p_v = \dot v$ is not conserved: the path speeds up and slows down in $v$.`, 2: 'That mixes components; nothing in the Lagrangian conserves it.', 3: t`$\dot u$ alone changes as $v$ changes; the conserved quantity carries $g_{uu}$.` },
      hints: [t`Which coordinate is missing from $g$? Its momentum $g_{c\nu}\dot x^\nu$ is conserved.`],
      teach: 'A coordinate missing from the metric gives a conserved momentum: Clairaut’s relation on a surface of revolution.',
      explain: t`$u$ is absent, so $p_u = g_{uu}\dot u = \rho^2\dot u$ is conserved — Clairaut’s relation, $\rho\cos\psi = $ const (C14.3 uses it to sort the torus’s geodesics).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.3 and §8.3', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Hartle, Gravity, ch. 8–9', url: 'https://www.cambridge.org/highereducation/books/gravity/' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});
