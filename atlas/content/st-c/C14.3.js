// Geodesics on the sphere, the cylinder and the torus, computed. Sphere:
// Clairaut's ρ cos ψ = cos i fixes a great circle's top latitude and its
// heading everywhere (satellite ground tracks, non-rotating Earth).
// Cylinder: Γ = 0, helices, infinitely many geodesics between two points
// (winding number), none conjugate. Torus: the Christoffels, Clairaut, the
// critical angle cos ψ* = (R − r)/(R + r) between trapped and winding
// geodesics, the turning latitude, √((R + r)/r) oscillations per circuit
// about the stable outer equator, the unstable inner equator.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;

const torusChart = (heading, length, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric: 'torus', mode: 'geodesic', P: [0.3, 0], drag: false, heading, length, readout: false, field: false, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C14.3',
  title: 'Geodesics on the sphere, cylinder and torus',
  minutes: 16, difficulty: 3,
  equation: t`\rho(v)^2\,\frac{du}{ds} = \rho\cos\psi = C`,
  intro: t`On a surface of revolution $ds^2 = \rho(v)^2du^2 + h(v)\,dv^2$, the metric does not contain the angle $u$, so every geodesic keeps the momentum above (C14.1): **Clairaut’s constant** $C$, with $\psi$ the angle between the geodesic and the circle of latitude it crosses. A geodesic can only visit circles with $\rho \ge |C|$, and it turns back ($\psi = 0$) where $\rho = |C|$. With that one fact you can sort every geodesic of the three classic surfaces:

- **sphere** ($\rho = \sin\theta$): great circles; $C = \cos i$ sets how far north one reaches;
- **cylinder** ($\rho = a$): $\Gamma = 0$, so $\psi$ never changes — helices — and two points are joined by infinitely many geodesics, one per number of turns;
- **torus** ($\rho = R + r\cos v$): geodesics either **wind** through the hole or are **trapped** on the outside, weaving about the outer equator — which one is decided by comparing $|C|$ with the inner radius $R - r$.

C6.2 met Clairaut’s relation on the catenoid; here it organizes whole families.`,
  symbols: [
    { tex: t`\rho(v)`, text: 'the distance from the axis of the circle of latitude through the point' },
    { tex: 'u', text: 'the angle round the axis (φ on the sphere and the cylinder)' },
    { tex: 's', text: 'arc length along the geodesic' },
    { tex: t`\psi`, text: 'the angle between the geodesic and the circle of latitude it is crossing' },
    { tex: 'C', text: 'Clairaut’s constant, fixed for each geodesic' },
  ],
  why: t`The same bookkeeping — a conserved momentum from a symmetry, then a turning point where it runs out — is how orbits around black holes are classified (bound, plunging, escaping), with $E$ and $L$ in place of $C$.`,
  visual: {
    type: 'dg4-chart',
    title: 'Trapped or winding?',
    lead: t`Each surface on its $(u, v)$ chart (the torus: $R = 2$, $r = 1$, outer equator at $v = 0$, inner at $\pm\pi$; edges glued). Launch a geodesic from P and follow it a long way. The readout keeps Clairaut’s constant $p_u = \rho^2\dot u$.`,
    tasks: [
      t`Torus, P on the outer equator: at $45^\circ$ the path weaves between two latitudes for ever. Raise the angle: past $70.5^\circ$ it suddenly breaks free and winds through the hole ($\cos\psi^* = 1/3$).`,
      t`Torus at $5^\circ$: count the wiggles per trip round — about 1.73, which is $\sqrt3 = \sqrt{(R + r)/r}$.`,
      t`Sphere: every geodesic is a great circle, a wave on this chart touching latitude $\pm i$. Cylinder: straight lines on the chart, wrapping round — the chart is the cylinder unrolled.`,
    ],
    params: { metric: 'torus', metrics: ['torus', 'sphere', 'cylinder'], mode: 'geodesic', P: [0.3, 0], sliders: ['heading', 'length'], heading: 45, length: 30, lengthMax: 80, field: false, readout: ['conserved', 'length'] },
    caption: t`Geodesics integrated by RK4 from each metric’s Christoffel symbols; the chart’s edges are glued ($u$ and, on the torus, $v$ periodic), so a path leaving one side re-enters on the other.`,
  },
  example: {
    prompt: t`On the torus $ds^2 = (R + r\cos v)^2du^2 + r^2dv^2$ with $R = 2$, $r = 1$, a geodesic leaves the outer equator at angle $\psi$ to it. Find the Christoffel symbols, the critical angle separating trapped from winding geodesics, and the latitudes between which the geodesic launched at $45^\circ$ is confined.`,
    visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'torus', v: 0, heading: 45, length: 30, controls: false, readout: false }, caption: 'The torus (R = 2, r = 1) and the geodesic launched at 45° from the outer equator: trapped on the outside. Colour: Gaussian curvature.' },
    steps: [
      { label: 'Christoffels', text: t`Diagonal, depending on $v$ only: $\Gamma^u{}_{uv} = \partial_v\ln\rho = -\dfrac{r\sin v}{R + r\cos v}$ and $\Gamma^v{}_{uu} = -\dfrac{\partial_v g_{uu}}{2g_{vv}} = \dfrac{(R + r\cos v)\sin v}{r}$; the rest vanish.` },
      { label: 'Clairaut', text: t`$u$ is absent, so $C = \rho^2\dot u = \rho\cos\psi$. On the outer equator $\rho = R + r = 3$: $C = 3\cos\psi$.` },
      { label: 'Critical angle', text: t`To wind through the hole a geodesic must pass the inner equator, $\rho = R - r = 1$, so it needs $|C| < 1$. Trapped if $3\cos\psi > 1$: $\psi < \arccos\tfrac13 = 70.53^\circ$.` },
      { label: 'Turning latitude', text: t`At $45^\circ$, $C = 3/\sqrt2 = 2.121$. It turns where $\rho = 2 + \cos v = 2.121$: $\cos v = 0.121$, $v = \pm83.0^\circ$ — nearly over the top of the tube, and never further.` },
      { label: 'Check', text: t`The picture’s path stays on the outer half, as $C$ demands; the model test confirms the turning point to $10^{-3}$ rad.` },
    ],
    answer: t`$\Gamma^u{}_{uv} = -\dfrac{\sin v}{2 + \cos v}$, $\Gamma^v{}_{uu} = (2 + \cos v)\sin v$; trapped for $\psi < 70.53^\circ$; at $45^\circ$ the geodesic stays between $v = \pm83.0^\circ$.`,
  },
  practice: [
    num({
      id: 'critical-angle', difficulty: 2,
      gen(r) {
        const [R, rr] = r.pick([[2, 1], [3, 1], [5, 1], [3, 2]]);
        const ans = Math.acos((R - rr) / (R + rr)) / DEG;
        return {
          prompt: t`On a torus with central radius $R = ${R}$ and tube radius $r = ${rr}$, what is the largest angle to the outer equator at which a geodesic launched from it stays trapped on the outside, in degrees?`,
          visual: torusChart(Math.round(ans) - 4, 40, t`The $R = 2$, $r = 1$ torus’s chart: a geodesic launched just below its critical angle, still trapped.`),
          answer: ans, units: 'deg', tol: { rel: 0.004 },
          errors: [{ value: Math.acos(rr / (R + rr)) / DEG, feedback: t`The barrier is the inner equator, $\rho = R - r$, not the tube radius.` }, { value: Math.asin((R - rr) / (R + rr)) / DEG, feedback: t`$\psi$ is measured from the equator: Clairaut’s constant is $\rho\cos\psi$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Trapped means it never reaches $\rho = R - r$: $|C| = (R + r)\cos\psi > R - r$.`],
          teach: t`On a torus a geodesic from the outer equator is trapped exactly when $(R + r)\cos\psi > R - r$.`,
          explain: t`$\cos\psi^* = \dfrac{${R - rr}}{${R + rr}}$, $\psi^* = ${nice(ans, 4)}^\circ$. A fat torus (small $R/r$) traps less; a thin ring traps almost everything.`,
        };
      },
    }),
    num({
      id: 'turning', difficulty: 3,
      gen(r) {
        const [R, rr] = r.pick([[2, 1], [3, 1]]), psi = r.pick(R === 3 ? [20, 30, 45] : [20, 30, 45, 60]);   // 60° on R = 3 is the critical angle: no turning point
        const c = ((R + rr) * Math.cos(psi * DEG) - R) / rr;
        const ans = Math.acos(c) / DEG;
        return {
          prompt: t`On the torus with $R = ${R}$, $r = ${rr}$, a geodesic leaves the outer equator at $${psi}^\circ$ to it. At what angle $v$ round the tube (degrees from the outer equator) does it turn back?`,
          visual: R === 2 ? torusChart(psi, 25, t`The geodesic launched at $${psi}^\circ$ on the chart; it turns at the same $\pm v$ every time.`, { lines: [] }) : { type: 'gr-surface', params: { mode: 'geodesic', surface: 'torus', v: 0, heading: psi, length: 25, controls: false, readout: false }, caption: t`A torus geodesic launched at $${psi}^\circ$ (drawn with $R = 2$, $r = 1$).` },
          answer: ans, units: 'deg', tol: { rel: 0.004 },
          errors: [{ value: psi, feedback: 'The turning latitude is set by Clairaut’s constant, not equal to the launch angle.' }, { value: Math.acos(((R + rr) * Math.sin(psi * DEG) - R) / rr) / DEG, feedback: t`$C = \rho\cos\psi$ with $\psi$ from the equator.` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$C = ${R + rr}\cos ${psi}^\circ = ${nice((R + rr) * Math.cos(psi * DEG), 4)}$.`, t`Turn where $\rho = ${R} + ${rr === 1 ? '' : rr}\cos v = C$.`],
          teach: 'A geodesic turns back at the latitude where ρ equals Clairaut’s constant: there it runs parallel to the circle.',
          explain: t`$\cos v = (${nice((R + rr) * Math.cos(psi * DEG), 4)} - ${R})/${rr} = ${nice(c, 4)}$, so $v = \pm${nice(ans, 4)}^\circ$. Shallower launches stay nearer the outer equator.`,
        };
      },
    }),
    num({
      id: 'wiggles', difficulty: 3,
      gen(r) {
        const [R, rr] = r.pick([[2, 1], [3, 1], [8, 1], [3, 2]]);
        const ans = Math.sqrt((R + rr) / rr);
        return {
          prompt: t`Linearize the $v$ geodesic equation of the torus ($R = ${R}$, $r = ${rr}$) about the outer equator: with $v$ small and unit speed, $\ddot v + \dfrac{v}{r(R + r)} = 0$. How many oscillations in $v$ does a nearly-equatorial geodesic make per trip round the axis?`,
          visual: torusChart(4, 37.7, t`A geodesic launched at $4^\circ$ from the outer equator of the $R = 2$, $r = 1$ torus, followed for two trips round.`, { view: { a: [0, 12.6], b: [-0.6, 0.6] }, equal: false }),
          answer: ans, tol: { rel: 0.004 },
          errors: [{ value: 1 / ans, feedback: 'Upside down: compare one circuit’s length with one oscillation’s wavelength.' }, { value: (R + rr) / rr, feedback: 'The angular frequency is a square root: √(1/(r(R + r))).' }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Oscillation wavelength in arc length: $2\pi\sqrt{r(R + r)}$. One circuit: $2\pi(R + r)$.`, t`Ratio: $\sqrt{(R + r)/r}$.`],
          teach: 'Near a stable closed geodesic, neighbours oscillate about it; on the torus’s outer equator √((R + r)/r) times per circuit.',
          explain: t`$\sqrt{${R + rr}/${rr}} = ${nice(ans, 4)}$ — not a whole number in general, so the path never closes and fills its band densely. (For $R = 2$, $r = 1$: $\sqrt3 = 1.732$; the model measures $1.7317$ at a $2^\circ$ launch.) The coefficient $1/(r(R + r))$ is the curvature $K$ there: positive $K$ focuses.`,
        };
      },
    }),
    num({
      id: 'cylinder-second', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 0.5]), dphi = r.pick([60, 90, 120]), dz = r.pick([1, 2, 3]);
        const L = (n) => Math.hypot(a * (dphi * DEG + 2 * Math.PI * n), dz);
        const ans = Math.min(L(-1), L(1));
        return {
          prompt: t`On a cylinder of radius $a = ${a}$ m, two points are $${dphi}^\circ$ apart round the axis and $${dz}$ m apart along it. The shortest geodesic joining them has length $${nice(L(0), 4)}$ m. How long is the second-shortest geodesic joining them?`,
          visual: { type: 'dg4-chart', params: { metric: 'plane', mode: 'chart', aspect: 'wide', probe: false, drag: false, readout: false, field: false, view: { a: [-8, 10], b: [-0.5, dz + 0.5] }, curves: [0, -1, 1].map((n) => ({ pts: [[0, 0], [r6(a * (dphi * DEG + 2 * Math.PI * n)), dz]], color: n === 0 ? 'gold' : 'violet', width: 2.2 })), lines: [-1, 0, 1].map((n) => ({ a: r6(a * (2 * Math.PI * n)), color: 'ink3' })), points: [-1, 0, 1].map((n) => ({ a: r6(a * (dphi * DEG + 2 * Math.PI * n)), b: dz, color: 'ink' })) }, caption: t`The cylinder unrolled into a plane (arc length $a\varphi$ across, $z$ up; grey lines one circumference apart): the end point repeats every $2\pi a$, and each copy gives another straight line — another geodesic (gold: the shortest).` },
          answer: ans, units: 'm', tol: { rel: 0.004 },
          errors: [{ value: L(0), feedback: 'That is the shortest. The next goes round the other way (or once more round).' }, { value: L(1), feedback: t`Going once more round the same way is longer than going round the other way: compare $|\Delta\varphi - 2\pi|$ and $\Delta\varphi + 2\pi$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Unroll: the end point appears at $\Delta\varphi + 2\pi n$ for every whole $n$; each straight line is a geodesic.`, t`$L_n = \sqrt{a^2(\Delta\varphi + 2\pi n)^2 + \Delta z^2}$; try $n = -1$.`],
          teach: 'On a cylinder two points are joined by infinitely many geodesics, one for each number of turns — none of them conjugate.',
          explain: t`$n = -1$: $\sqrt{(${a}\times${nice(2 * Math.PI - dphi * DEG, 4)})^2 + ${dz}^2} = ${nice(ans, 4)}$ m. Several geodesics between two points does not need curvature — the cylinder is flat — only topology. On a sphere, by contrast, they multiply because of conjugate points.`,
        };
      },
    }),
    mcq({
      id: 'equators', difficulty: 2,
      prompt: 'On a doughnut torus, which circles of latitude are geodesics, and how do nearby geodesics behave about them?',
      visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'torus', v: 3.14, heading: 3, length: 12, controls: false, readout: false }, caption: 'A geodesic launched almost along the inner equator: it peels away.' },
      choices: ['Only the two equators: neighbours oscillate about the outer one and run away from the inner one', 'Every circle of latitude', 'Only the outer equator', 'The top and bottom circles, where the tube is level'],
      answer: 0,
      why: { 1: t`Off the equators $\Gamma^v{}_{uu} = (R + r\cos v)\sin v/r \ne 0$: a circle there must be pushed sideways.`, 2: 'The inner equator is a geodesic too (sin v = 0 there) — an unstable one.', 3: t`There $\sin v = \pm1$, the largest $\Gamma^v{}_{uu}$: the circle must be pushed toward the outside.` },
      hints: [t`A circle $v = v_0$ traversed at unit speed is a geodesic iff $\ddot v = -\Gamma^v{}_{uu}\dot u^2 = 0$.`, 'Stability: positive curvature focuses neighbours, negative curvature spreads them.'],
      teach: 'On a surface of revolution, a parallel is a geodesic where ρ is extremal; it is stable where K > 0.',
      explain: t`$\Gamma^v{}_{uu} \propto \sin v$ vanishes only at $v = 0$ and $\pi$. At the outer equator $K = 1/(r(R + r)) > 0$ and neighbours weave about it; at the inner one $K = -1/(r(R - r)) < 0$ and they diverge — like a ball on top of a hill.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ground-track', difficulty: 3, transfer: true,
      gen(r) {
        const i = 51.64, lat = r.pick([20, 30, 40, 50]);
        const ans = Math.acos(Math.cos(i * DEG) / Math.cos(lat * DEG)) / DEG;
        return {
          prompt: t`The ISS orbits at inclination $51.64^\circ$, so (ignoring the Earth’s rotation) its ground track is a great circle crossing the equator at $51.64^\circ$. Using Clairaut’s relation $\cos\lambda\cos\psi = $ const ($\lambda$ latitude, $\psi$ the angle to the parallel), at what angle to the parallel does the track cross latitude $${lat}^\circ$N?`,
          visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'geodesic', P: [0.2, r6(Math.PI / 2)], drag: false, heading: -51.64, length: 6.28, readout: false, field: false, lines: [{ b: r6((90 - lat) * DEG), color: 'violet', label: `${lat}°N` }, { b: r6((90 - 51.64) * DEG), color: 'ink3' }] }, caption: t`A great circle inclined at $51.64^\circ$ on the sphere’s chart (north up); violet: latitude $${lat}^\circ$N, grey: the track’s highest latitude.` },
          answer: ans, units: 'deg', tol: { rel: 0.004 },
          errors: [{ value: 51.64, feedback: 'The angle to the parallel shrinks as the track climbs, reaching 0 at 51.64°N.' }, { value: Math.acos(Math.cos(i * DEG) * Math.cos(lat * DEG)) / DEG, feedback: t`Constant product: $\cos\psi = \cos i/\cos\lambda$, dividing.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`At the equator $\cos\lambda = 1$ and $\psi = i$, so the constant is $\cos 51.64^\circ = 0.6206$.`, t`$\cos\psi = 0.6206/\cos ${lat}^\circ$.`],
          teach: 'Clairaut on the sphere: cos(latitude) × cos(heading from the parallel) is constant along a great circle.',
          explain: t`$\cos\psi = 0.6206/${nice(Math.cos(lat * DEG), 4)} = ${nice(Math.cos(ans * DEG), 4)}$, $\psi = ${nice(ans, 4)}^\circ$. At $51.64^\circ$N the track runs due east, and it never goes further north. (On the real, rotating Earth the track drifts west each orbit and the angles shift slightly.)`,
        };
      },
    }),
    num({
      id: 'cp-habitat', difficulty: 3, transfer: true,
      gen(r) {
        const [name, R, rr] = r.pick([['a Stanford-torus habitat (R = 830 m, r = 65 m)', 830, 65], ['a smaller ring station (R = 250 m, r = 40 m)', 250, 40], ['a fat test torus (R = 60 m, r = 30 m)', 60, 30]]);
        const ans = Math.acos((R - rr) / (R + rr)) / DEG;
        return {
          prompt: t`An inspection rover drives "straight ahead" — along a geodesic — on the outer hull of ${name}, starting on the outer equator. Up to what angle with the equator will it stay on the outer half and never pass round under the inner rim?`,
          visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'torus', v: 0, heading: 40, length: 30, controls: false, readout: false }, caption: 'A trapped geodesic on a torus (drawn with R = 2, r = 1; the habitat is far thinner).' },
          answer: ans, units: 'deg', tol: { rel: 0.004 },
          errors: [{ value: 90 - ans, feedback: t`$\psi$ is measured from the equator; the condition is $(R + r)\cos\psi > R - r$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Clairaut: $\rho\cos\psi$ is constant, and the rover can only reach circles with $\rho \ge |C|$. The inner rim has $\rho = R - r$.`, t`Trapped iff $(R + r)\cos\psi > R - r$.`],
          teach: 'Clairaut’s constant decides at launch whether a torus geodesic is trapped on the outside.',
          explain: t`$\cos\psi^* = ${R - rr}/${R + rr}$: $\psi^* = ${nice(ans, 4)}^\circ$. A thin ring traps only shallow paths; anything steeper winds round the tube — the rover would end up driving on the ceiling side.`,
        };
      },
    }),
    mcq({
      id: 'cp-closed', difficulty: 2,
      prompt: 'Which torus geodesics are closed curves?',
      visual: torusChart(30, 60, 'A long geodesic on the torus’s chart: it never closes, and fills its band.'),
      choices: ['The meridians (u = const) and the two equators — and only special others', 'All of them, since the torus is compact', 'None: geodesics on a torus never close', 'Only the outer equator'],
      answer: 0,
      why: { 1: 'Compactness keeps a geodesic on the torus, not on a closed curve; most fill a band densely.', 2: t`Meridians are circles and are geodesics ($\Gamma^u{}_{vv} = 0$ and $\rho^2\dot u = 0$).`, 3: 'The meridians and the inner equator close too.' },
      hints: [t`A meridian has $\dot u = 0$, so $C = 0$. Check it solves both geodesic equations.`],
      teach: 'Most geodesics on a torus never close; meridians and equators do.',
      explain: t`Meridians and equators are closed; a trapped geodesic closes only if its oscillation and circuit periods are commensurate, which happens for special angles only. The rest wander densely through their band — as most orbits in GR do (Mercury’s precesses).`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-4 (Clairaut) and §4-7', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry, ch. 9 (geodesics on surfaces of revolution)', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
    { label: 'NASA, International Space Station orbit (inclination 51.64°)', url: 'https://www.nasa.gov/international-space-station/' },
  ],
});
