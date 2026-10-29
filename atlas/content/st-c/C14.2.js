// Geodesics are stationary points of length and of proper time. The second
// variation: on a Riemannian space a minimum only up to the first conjugate
// point (a great circle beyond the antipode); along a timelike geodesic a
// maximum of proper time (the twin paradox, the reverse triangle
// inequality) — again only up to conjugate points (orbiting versus hovering
// clocks); null geodesics, Fermat's principle; why the energy functional.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import * as D from '../../src/viz/model/dg4-metric2d.js';

const t = String.raw;
const C = 299792458, GM_E = 3.986004418e14;

// a clock thrown radially upward at speed v from r0 (M = 1) and caught at r0: its proper time against a hovering clock's
function thrown(r0, v) {
  const M = D.METRICS.schwarzschild;
  const g = D.geodesic(M, { a: r0, b: 0, u: D.launch(M, r0, 0, 1, { speed: v }), length: 300, steps: 30000 });
  let i = 6;
  while (i < g.pts.length - 1 && !(g.pts[i][0] < r0 && g.pts[i - 1][0] >= r0)) i++;
  const p0 = g.pts[i - 1], p1 = g.pts[i], f = (p0[0] - r0) / (p0[0] - p1[0]);
  const tau = p0[2] + f * (p1[2] - p0[2]), T = p0[1] + f * (p1[1] - p0[1]);
  return { tau, T, hover: Math.sqrt(1 - 2 / r0) * T };
}

const vary = (metric, P, launch, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'vary', P, drag: false, readout: false, field: false, alpha: 0.15, alphaMax: 0.3, ...launch, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C14.2',
  title: 'Geodesics extremize length — and proper time',
  minutes: 15, difficulty: 4,
  equation: t`\delta\!\int\!\sqrt{\big|g_{\mu\nu}\dot x^\mu\dot x^\nu\big|}\;d\lambda = 0 \iff \ddot x^\mu + \Gamma^\mu{}_{\nu\rho}\dot x^\nu\dot x^\rho = 0\ \ (\text{affine }\lambda)`,
  intro: t`Push a curve sideways a little, keeping its ends fixed. Its length (or proper time) changes at first order unless the curve is a geodesic: **geodesics are exactly the stationary curves**. Which kind of stationary point is settled at second order, and the two signatures disagree:

- **Riemannian:** a short geodesic is the *shortest* curve between its ends — but only until it reaches a **conjugate point**, where neighbouring geodesics from the start meet it again. A great circle past the antipode is no longer shortest.
- **Lorentzian:** a timelike geodesic has the *longest* proper time of all nearby timelike curves — a free clock ages most. That is the twin paradox read geometrically ([phys3710 R1.3](#/lesson/phys3710.R1.3)), and again it holds only up to conjugate points.

Light rays have $\tau = 0$ and extremize something else: arrival time (Fermat).`,
  symbols: [
    { tex: t`\delta`, text: 'the change caused by a small variation of the curve with its end points held fixed' },
    { tex: t`\sqrt{|g_{\mu\nu}\dot x^\mu\dot x^\nu|}`, text: t`the length element ($ds/d\lambda$) on a Riemannian space or a spacelike curve, the proper-time element ($d\tau/d\lambda$) on a timelike curve` },
    { tex: t`\lambda`, text: 'any parameter for the variation; an affine one to write the result as the geodesic equation' },
  ],
  why: t`"Free fall maximizes your own time" is the whole of GR’s law of motion in one sentence — gr.S12.i’s principle of maximal aging, here with its fine print: which nearby curves, and for how long.`,
  visual: {
    type: 'dg4-chart',
    title: 'Push a geodesic sideways',
    lead: t`Gold: a geodesic from P to Q. Orange: the same curve pushed sideways by $\alpha\sin(\pi\lambda/\Lambda)$, ends fixed; grey: others of the family. The lower panel plots the length (or proper time) against $\alpha$ — flat at $\alpha = 0$ every time. Is it a minimum or a maximum?`,
    tasks: [
      t`Sphere: with length below $\pi$ the curve has a **minimum** at $\alpha = 0$. Lengthen it past $\pi = 3.14$ (the antipode, a conjugate point): the minimum turns into a **maximum** — a longer great circle is not the shortest route.`,
      t`Schwarzschild ($M = 1$), a clock thrown up from $r = 6M$ at $v = 0.3$: proper time has a **maximum** at $\alpha = 0$. Every nearby worldline between the same two events ages less.`,
      t`Minkowski: the straight worldline (the twin who stays home) is the maximum; bent ones (the traveller) age less.`,
    ],
    params: { metric: 'sphere', metrics: ['sphere', 'schwarzschild', 'minkowski'], mode: 'vary', panel: true, sliders: ['alpha', 'length', 'heading', 'speed'], P: [1.0, 1.5708], heading: 0, speed: 0.3, length: 2.5, lengthMax: 6, alpha: 0.15, alphaMax: 0.3, field: false, readout: ['F'] },
    caption: t`Variations along the unit normal of the geodesic, computed from the metric; lengths and proper times summed over 400–4000 chords. On switching, P moves to a default point (Schwarzschild: $r = 6M$).`,
  },
  example: {
    prompt: t`Two clocks start together at $r = 7M$ outside a black hole. Clock A orbits on a circular geodesic; clock B hovers at $r = 7M$ with its rocket, and they meet again once per orbit. Which records more proper time between meetings? Since A is a geodesic and B is not, explain the result.`,
    visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 7, L: Math.sqrt(49 / 4), turns: 1, compare: false }, caption: 'A circular orbit at 7M in Schwarzschild spacetime (units of M) beside its effective potential.' },
    steps: [
      { label: 'Orbiting clock', text: t`On a circular geodesic $\dfrac{d\tau}{dt} = \sqrt{1 - \dfrac{3M}{r}}$ (the time-dilation factor combines height and orbital speed): $\sqrt{4/7} = 0.756$.` },
      { label: 'Hovering clock', text: t`At fixed $r$, $\dfrac{d\tau}{dt} = \sqrt{1 - \dfrac{2M}{r}} = \sqrt{5/7} = 0.845$.` },
      { label: 'Compare', text: t`Between the same two meetings, B ages $\sqrt{5/4} = 1.118$ times as much as A. **The non-geodesic wins.**` },
      { label: 'Fine print', text: t`A timelike geodesic maximizes $\tau$ only among nearby curves, and only until its first conjugate point. Tilt A’s orbit slightly: the tilted circle through the same starting event crosses A again half an orbit later — a conjugate point. Over a full orbit A is a saddle, not a maximum.` },
      { label: 'The real winner', text: t`Among all curves joining the two meetings, the most proper time goes to another geodesic: a clock thrown straight up that falls back just in time.` },
    ],
    answer: t`The hovering clock, by a factor $\sqrt{5/4} = 1.118$: the circular orbit passes conjugate points (half an orbit apart), so it is not a local maximum of proper time over a whole orbit.`,
  },
  practice: [
    mcq({
      id: 'conjugate', difficulty: 2,
      prompt: 'On the unit sphere, a great-circle arc from P is the shortest path to its end point when its length is…',
      visual: vary('sphere', [1.0, 1.5708], { heading: 0, length: 4 }, 'A great-circle arc of length 4 (longer than π) and a nearby variation, which is shorter.', { panel: false }),
      choices: [t`less than $\pi$ (it has not reached the antipode)`, t`less than $2\pi$`, 'any length: geodesics always minimize', t`exactly $\pi/2$`],
      answer: 0,
      why: { 1: t`Past $\pi$ the other way round the circle is shorter, and nearby variations are shorter too (the picture).`, 2: 'Geodesics are only stationary; beyond a conjugate point they are saddles.', 3: t`$\pi/2$ is an example, not the limit.` },
      hints: ['Where do all the great circles from P meet again?'],
      teach: 'A geodesic stops being locally shortest at its first conjugate point — on a sphere, the antipode.',
      explain: t`All great circles from P refocus at the antipode, distance $\pi$: the first conjugate point. Before it the arc is a strict local (and global) minimum; after it, pushing sideways shortens it: $L(\alpha) - L(0) \approx \tfrac{\alpha^2}{4}L\big((\pi/L)^2 - 1\big)$, negative for $L > \pi$.`,
    }),
    num({
      id: 'triangle', difficulty: 2,
      gen(r) {
        const T = r.pick([10, 20, 40]), X = r.pick([0.2, 0.3, 0.4]) * T;
        const tau = 2 * Math.sqrt((T / 2) ** 2 - X ** 2);
        return {
          prompt: t`In Minkowski space ($c = 1$, years and light-years), one clock stays at $x = 0$ from $t = 0$ to $t = ${T}$. Another travels in straight lines to the event $(t, x) = (${T / 2}, ${nice(X)})$ and back. How much proper time does the traveller record, in years?`,
          visual: { type: 'worldlines', params: { T, tx: X, tt: T / 2 }, caption: 'The two worldlines between the same events; tick marks show each clock’s own time.' },
          answer: tau, units: 'yr', tol: { rel: 0.004 },
          errors: [{ value: T, feedback: 'That is the clock that stayed home — the straight worldline, which ages most.' }, { value: 2 * Math.sqrt((T / 2) ** 2 + X ** 2), feedback: t`Lorentzian: $\Delta\tau^2 = \Delta t^2 - \Delta x^2$, a minus sign.` }].filter((e) => Math.abs(e.value - tau) > 0.005 * tau),
          hints: [t`Each leg: $\Delta\tau = \sqrt{\Delta t^2 - \Delta x^2}$.`],
          teach: 'Reverse triangle inequality: the bent timelike path between two events has less proper time than the straight one.',
          explain: t`$2\sqrt{${T / 2}^2 - ${nice(X)}^2} = ${nice(tau, 4)}$ yr $< ${T}$ yr. In Euclidean geometry two sides of a triangle beat the third; in Lorentzian geometry they lose to it.`,
        };
      },
    }),
    num({
      id: 'thrown', difficulty: 3,
      gen(r) {
        const [r0, v] = r.pick([[4, 0.2], [4, 0.3], [6, 0.2], [6, 0.3], [10, 0.2]]);
        const o = thrown(r0, v), ratio = o.tau / o.hover;
        return {
          prompt: t`At $r = ${r0}M$ above a black hole, a clock is thrown straight up at $v = ${v}$ (relative to a hovering observer) and falls back to $r = ${r0}M$. Integrating the geodesic gives far-away time $\Delta t = ${nice(o.T, 4)}M$ and proper time $\Delta\tau = ${nice(o.tau, 4)}M$ for the trip. A second clock hovers at $r = ${r0}M$ throughout. What is the ratio of the thrown clock’s reading to the hovering clock’s?`,
          visual: vary('schwarzschild', [r0, 0], { speed: v, length: o.tau }, 'The thrown clock’s worldline (gold) on the (r, t) chart, and varied worldlines with the same ends: all age less.', { panel: false, equal: false, view: { a: [0, r0 * 1.8 + 2], b: [-2, o.T + 3] } }),
          answer: ratio, tol: { rel: 0.002 },
          errors: [{ value: 1 / ratio, feedback: 'Upside down: the free (geodesic) clock records more.' }, { value: o.tau / o.T, feedback: t`That compares with far-away time. The hovering clock records $\sqrt{1 - 2M/r}\,\Delta t$.` }].filter((e) => Math.abs(e.value - ratio) > 0.002 * ratio),
          hints: [t`Hovering clock: $\Delta\tau_{\text{hover}} = \sqrt{1 - 2M/r_0}\,\Delta t$.`, t`$\sqrt{1 - 2/${r0}} = ${nice(Math.sqrt(1 - 2 / r0), 4)}$.`],
          teach: 'A clock in free fall between two events ages more than one held at rest between the same events.',
          explain: t`$\Delta\tau_{\text{hover}} = ${nice(Math.sqrt(1 - 2 / r0), 4)}\times${nice(o.T, 4)} = ${nice(o.hover, 4)}M$, so the ratio is $${nice(ratio, 5)}$. Climbing to where clocks run faster more than pays for the motion — and the free path is the best possible trade, as the variation in the picture shows.`,
        };
      },
    }),
    mcq({
      id: 'fermat', difficulty: 2,
      prompt: t`Along a null geodesic the proper time is zero, so it cannot be "the longest". What does a light ray extremize in a static spacetime such as Schwarzschild?`,
      visual: { type: 'dg4-chart', params: { metric: 'schwarzschild', mode: 'geodesic', P: [4, 0], drag: false, speed: 1, length: 12, readout: false, cells: 8 }, caption: 'An outgoing light ray on the Schwarzschild chart.' },
      choices: ['The arrival time t at a fixed receiver (Fermat’s principle)', 'Its proper time, which is maximal', 'Its spatial length', 'Nothing: null geodesics are not stationary for anything'],
      answer: 0,
      why: { 1: 'Every null curve has τ = 0, so τ cannot single one out.', 2: 'Not in general: light bends toward a mass, where the spatial path is longer but the coordinate speed works out.', 3: 'They are stationary for the arrival time (and for the energy functional with an affine parameter).' },
      hints: ['In a static spacetime, think of the metric as an optical medium with a varying refractive index.'],
      teach: 'Null geodesics are stationary for arrival time: Fermat’s principle, with the metric as a refractive index.',
      explain: t`For $ds^2 = -f\,dt^2 + h_{ij}dx^idx^j$, null curves have $dt = \sqrt{h_{ij}dx^idx^j/f}$, and the light ray makes $t$ stationary — Fermat’s principle with refractive index $1/\sqrt f$ in the "optical" metric $h/f$. Gravitational lensing and the Shapiro delay both follow.`,
    }),
    order({
      id: 'energy-functional', difficulty: 3,
      prompt: t`Why use the energy $E[\gamma] = \tfrac12\int_0^\Lambda g(\dot x, \dot x)\,d\lambda$ instead of the length $L[\gamma]$ (Riemannian case)? Order the argument.`,
      visual: vary('halfplane', [-1, 1], { heading: 60, length: 2 }, 'A half-plane geodesic and nearby curves with the same ends.', { panel: false }),
      items: [
        t`Cauchy–Schwarz: $L^2 = \Big(\int|\dot x|\,d\lambda\Big)^2 \le \Lambda\int|\dot x|^2d\lambda = 2\Lambda E$.`,
        t`Equality holds exactly when the speed $|\dot x|$ is constant — an affine parameter.`,
        t`So among parameterized curves, minimizing $E$ minimizes $L$ and picks a constant-speed parameter at the same time.`,
        t`$E$ has no square root, so its Euler–Lagrange equations are the geodesic equation directly (C14.1), with no reparameterization freedom left over.`,
      ],
      hints: ['Compare L² with E using Cauchy–Schwarz.', 'When does Cauchy–Schwarz become an equality?'],
      teach: 'Minimizing the energy functional gives the same curves as minimizing length, already at constant speed.',
      explain: t`$L$ is unchanged by reparameterization, so its Euler–Lagrange equations are degenerate; $E$ is not, which makes it the working tool. The Lorentzian version uses $\tfrac12\int g(\dot x, \dot x)\,d\lambda$ the same way.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps-hover', difficulty: 3, transfer: true,
      gen(r) {
        const [name, alt] = r.pick([['a GPS satellite (orbit radius 26 560 km)', 26560e3], ['a geostationary satellite (orbit radius 42 164 km)', 42164e3], ['the ISS (orbit radius 6791 km)', 6791e3]]);
        const m = GM_E / (C * C), T = 2 * Math.PI * Math.sqrt(alt ** 3 / GM_E);
        const d = T * (Math.sqrt(1 - 2 * m / alt) - Math.sqrt(1 - 3 * m / alt)) * 1e6;
        return {
          prompt: t`Compare ${name} with an imaginary clock hovering at the same radius (no rotation of the Earth), meeting it once per orbit. Per orbit, how many microseconds more does the hovering clock record? Use $d\tau/dt = \sqrt{1 - 3M/r}$ for the orbit, $\sqrt{1 - 2M/r}$ for hovering, $M = GM_\oplus/c^2$, and the period $2\pi\sqrt{r^3/GM_\oplus}$.`,
          visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 20, L: Math.sqrt(400 / 17), turns: 1, compare: false }, caption: 'A circular orbit (drawn in units of M for a black hole; the Earth’s is at r ≈ 10¹⁰ M).' },
          answer: d, units: 'us', tol: { rel: 0.01 },
          errors: [{ value: -d, feedback: 'The hovering clock ages more, so the difference is positive.' }, { value: 2 * d, feedback: t`For $M/r \ll 1$ the difference of the square roots is $\tfrac12 M/r$, not $M/r$.` }].filter((e) => Math.abs(e.value - d) > 0.01 * Math.abs(d)),
          hints: [t`For small $x = M/r$: $\sqrt{1 - 2x} - \sqrt{1 - 3x} \approx x/2$.`, t`$M = 4.435$ mm; period $= ${nice(T, 5)}$ s.`],
          teach: 'Over a whole orbit a circular geodesic is not a maximum of proper time: a hovering clock between the same meetings ages more.',
          explain: t`$\Delta\tau \approx T\,\dfrac{GM}{2c^2r} = ${nice(d, 3)}\ \mu\text{s}$ per orbit. Not a contradiction: orbits through the same event with slightly different tilts cross again after half an orbit (conjugate points), so the orbit is a saddle of proper time over a full revolution.`,
        };
      },
    }),
    num({
      id: 'cp-antipode', difficulty: 2, transfer: true,
      gen(r) {
        const [body, R] = r.pick([['the Earth', 6371.0], ['the Moon', 1737.4], ['Mars', 3389.5]]);
        return {
          prompt: t`A rover on ${body} (mean radius $${R}$ km, treated as a sphere) drives along a great circle. Beyond what distance, in km, does its route stop being the shortest path between its start and its current position?`,
          visual: vary('sphere', [1.0, 1.5708], { heading: 0, length: 3.6 }, 'A great circle followed past the antipode: a sideways push now shortens it.', { panel: false }),
          answer: Math.PI * R, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: 2 * Math.PI * R, feedback: 'That is the full circle. The route stops being shortest at the antipode, halfway round.' }, { value: (Math.PI / 2) * R, feedback: 'A quarter circle is still shortest; the limit is the antipode.' }],
          hints: ['Where do all great circles from the start meet again?'],
          teach: 'On a sphere of radius R, great-circle routes are shortest only up to the antipode, a distance πR.',
          explain: t`The antipode is the first conjugate point, at $\pi R = ${nice(Math.PI * R, 5)}$ km. Past it, going the other way round is shorter — and so is any slight sideways detour.`,
        };
      },
    }),
    mcq({
      id: 'cp-which-max', difficulty: 2,
      prompt: 'Two events lie on a free-falling worldline, close enough that no conjugate point lies between them. Among all timelike worldlines joining them, the free-falling one has…',
      visual: vary('minkowski', [0, -1], { speed: 0, length: 2 }, 'A free worldline in flat spacetime and nearby worldlines with the same end events.', { panel: false }),
      choices: ['the most proper time of all nearby worldlines', 'the least proper time', 'the same proper time as all the others', 'zero proper time'],
      answer: 0,
      why: { 1: 'There is no least: worldlines close to light rays have proper time near zero.', 2: 'Proper time depends on the path — that is the twin paradox.', 3: 'Only null curves have zero proper time.' },
      hints: ['Think of the twin who stays home.'],
      teach: 'Timelike geodesics locally maximize proper time.',
      explain: t`The principle of maximal aging. There is no minimum at all: zig-zags near the light cone make $\tau$ as small as you like.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.3 and §7.4 (maximal proper time)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes, ch. 1 and 8', url: 'https://www.eftaylor.com/exploringblackholes/' },
    { label: 'do Carmo, Riemannian Geometry, ch. 5 (Jacobi fields, conjugate points)', url: 'https://link.springer.com/book/9780817634902' },
  ],
});
