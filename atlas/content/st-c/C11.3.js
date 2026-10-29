// Two-dimensional spacetimes, each in a chart and each framed honestly: the
// Rindler wedge (flat: a quarter of Minkowski space seen by accelerating
// observers, with a horizon that is only theirs); 1+1 de Sitter (curved,
// K = H², a chart covering half of the whole space, an event horizon at
// comoving distance 1/H); the radial–time plane of Schwarzschild (K = 2M/r³,
// the radial tidal stretch; r = 2M a failure of the chart, repaired by
// Eddington–Finkelstein). Light cones, radar times, redshift, and the sign
// of K in Lorentzian 2D (positive K spreads geodesics apart).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const C = 299792458;
const GM_SUN_M = 1476.625;      // GM☉/c², m
const GM_SUN_S = 4.9255e-6;     // GM☉/c³, s

// coordinate time for light to climb from r1 to r2 in Schwarzschild (M = 1)
const climb = (r1, r2) => (r2 - r1) + 2 * Math.log((r2 - 2) / (r1 - 2));
const radarCurves = (r1, r2) => {
  const n = 60, up = [], down = [], T = climb(r1, r2);
  for (let i = 0; i <= n; i++) { const r = r1 + ((r2 - r1) * i) / n; up.push([r6(r), r6(climb(r1, r))]); down.push([r6(r), r6(T + climb(r, r2))]); }
  return [{ pts: up, color: 'violet', width: 2.4, label: 'out' }, { pts: down, color: 'violet', width: 2.4, label: 'back', labelDx: -36 }];
};

export default lesson({
  id: 'st-c.C11.3',
  title: 'Two-dimensional spacetimes',
  minutes: 16, difficulty: 3,
  intro: t`One space dimension and one time: the smallest arena with light cones and curvature, and the best place to learn to read a metric. Three examples, each in one chart ($c = 1$, Carroll’s signs):

$$\begin{gathered} \text{Rindler: } ds^2 = -\rho^2d\eta^2 + d\rho^2 \\ \text{de Sitter: } ds^2 = -dt^2 + e^{2Ht}dx^2 \\ \text{Schwarzschild: } ds^2 = -\Big(1 - \tfrac{2M}{r}\Big)dt^2 + \Big(1 - \tfrac{2M}{r}\Big)^{-1}dr^2 \end{gathered}$$

**Be honest about each.** Rindler is *flat* — the wedge $X > |T|$ of Minkowski space labelled by observers who accelerate forever; its edge $\rho = 0$ is their horizon, not a place. De Sitter is curved, $K = H^2$: the 2D picture of a universe expanding exponentially, and this chart covers only half of it. The Schwarzschild plane is the radial–time slice ($\theta$, $\varphi$ fixed) of the 4D black hole, curved with $K = 2M/r^3$; at $r = 2M$ the *chart* fails while the curvature stays finite.`,
  symbols: [
    { tex: t`\rho,\ \eta`, text: t`Rindler’s distance from the horizon and its dimensionless time; the observer at fixed $\rho$ has proper acceleration $1/\rho$` },
    { tex: t`t,\ x,\ H`, text: t`de Sitter’s cosmic time, comoving position and constant expansion rate; the scale factor is $a = e^{Ht}$` },
    { tex: t`t,\ r,\ M`, text: t`Schwarzschild’s far-away time, areal radius and mass, all in geometric units ($G = c = 1$: $M$ means $GM/c^2$, 1.48 km for the Sun)` },
    { tex: 'K', text: t`the Gaussian curvature of the 2D metric, half its Ricci scalar $R$` },
  ],
  why: t`Most of what is strange about black holes and cosmology is already in these 2D slices: horizons, redshift, the coordinate singularity at $r = 2M$, and why the expansion of the universe hides distant galaxies for ever.`,
  visual: {
    type: 'dg4-chart',
    title: 'Light cones and free fall in three spacetimes',
    lead: t`Each spacetime on its own chart (space across, time up), with its light cones. The gold curve is a free particle (a timelike geodesic) launched from P at speed $v$ relative to the observer at rest there; at $v = \pm1$ it is a light ray. Drag P, change $v$, and follow the path.`,
    tasks: [
      t`Schwarzschild, $v = 0$: dropped from rest at $r = 6M$, the body falls — but on this chart it never reaches $r = 2M$: $t$ runs off the top while its own clock stops at a finite $14.8M$ (readout), where the path leaves the chart. Switch to Eddington–Finkelstein and the same fall carries straight on inside.`,
      t`Eddington–Finkelstein: across $r = 2M$ the cones tip over smoothly. Inside, both edges point toward smaller $r$: every future leads inward.`,
      t`De Sitter, $v = 0.9$: the particle coasts to a stop in comoving $x$. Rindler, $v = 0$: a free particle, seen by accelerating observers, "falls" to $\rho = 0$ in finite proper time — yet $K = 0$: no gravity at all, only accelerated labels.`,
    ],
    params: { metric: 'schwarzschild', metrics: ['rindler', 'desitter', 'schwarzschild', 'ef'], mode: 'geodesic', sliders: ['speed', 'length'], speed: 0, length: 16, lengthMax: 24, readout: ['K', 'length', 'conserved'], cells: 8 },
    caption: t`Each chart drawn as plain coordinates with $c = 1$; cones: future half shaded. Geodesics integrated (RK4) from the Christoffel symbols. Schwarzschild in units of $M$ (the shaded strip $r < 2M$ is outside that chart).`,
  },
  example: {
    prompt: t`A probe hovers at $r_1 = 4M$ outside a black hole and sends a radar pulse straight out to a mirror hovering at $r_2 = 10M$. How long does the round trip take by the probe’s own clock? Compare with flat space, and check that nothing is infinite at $r = 2M$ except the chart.`,
    visual: { type: 'dg4-chart', params: { metric: 'schwarzschild', mode: 'chart', probe: false, drag: false, readout: false, equal: false, view: { a: [0, 12], b: [-1, 19] }, cells: 9, curves: radarCurves(4, 10), lines: [{ a: 4, label: 'probe', color: 'accent', dash: [] }, { a: 10, label: 'mirror', color: 'accent', dash: [] }] }, caption: t`The radar pulse (violet) on the $(r, t)$ chart, in units of $M$; the probe and mirror hover at fixed $r$ (blue). Time axis compressed. Near $r = 2M$ the cones close up: light crawls, in coordinate time.` },
    steps: [
      { label: 'Light rays', text: t`Radial light has $ds^2 = 0$: $\dfrac{dt}{dr} = \pm\dfrac{1}{1 - 2M/r}$. Integrating, $t = \pm\Big(r + 2M\ln\Big|\dfrac{r}{2M} - 1\Big|\Big) + \text{const}$ — the "tortoise" coordinate $r_*$.` },
      { label: 'Out and back', text: t`Out: $\Delta t = (r_2 - r_1) + 2M\ln\dfrac{r_2 - 2M}{r_1 - 2M} = 6M + 2M\ln 4 = 8.773M$. The return is the mirror image, so the round trip is $\Delta t = 17.545M$.` },
      { label: 'Probe clock', text: t`The probe sits at fixed $r$, so $d\tau = \sqrt{1 - 2M/r_1}\,dt = \sqrt{1/2}\,dt$: $\Delta\tau = 12.406M$.` },
      { label: 'Compare', text: t`In flat space the trip is $2(r_2 - r_1) = 12M$. Here $t$ grows by an extra $5.5M$ — light spends long stretches low down where, in far-away time, it is slow (the Shapiro delay) — while the probe’s deep clock runs slow. With $r_1 = 4M$ the two nearly cancel; the radar distance $\Delta\tau/2 = 6.2M$ also differs from the proper distance between them, $\int_{4M}^{10M} dr/\sqrt{1 - 2M/r} = 7.24M$.` },
      { label: 'Only the chart', text: t`As $r_1 \to 2M$, $\Delta t \to \infty$ — the log blows up — but $K = 2M/r^3 = 1/(4M^2)$ there, perfectly finite. Coordinate time $t$, not spacetime, is what fails.` },
    ],
    answer: t`$\Delta t = 12M + 4M\ln 4 = 17.545M$ of far-away time, $\Delta\tau = 12.406M$ by the probe’s clock (flat space: $12M$); the infinity at $r = 2M$ belongs to $t$, while $K = 1/(4M^2)$ is finite.`,
  },
  practice: [
    mcq({
      id: 'which-flat', difficulty: 1,
      prompt: 'Which of the three spacetimes is flat?',
      visual: { type: 'dg4-chart', params: { metric: 'rindler', mode: 'chart', probe: false, drag: false, readout: false, cells: 8 }, caption: t`The Rindler chart ($\rho$ across, $\eta$ up): the cones narrow toward $\rho = 0$, and its Christoffel symbols are not zero.` },
      choices: ['The Rindler wedge', '1+1 de Sitter', 'The Schwarzschild radial–time plane', 'None: all three have nonzero Christoffel symbols'],
      answer: 0,
      why: {
        1: t`De Sitter has $K = H^2 \ne 0$: comoving observers separate exponentially, which no relabelling of flat space can do.`,
        2: t`$K = 2M/r^3 \ne 0$: the radial tidal stretch of a black hole.`,
        3: t`Christoffel symbols say what the chart does, not what spacetime does; polar coordinates on a flat plane have them too. Curvature is what decides.`,
      },
      hints: ['Christoffel symbols can be non-zero in flat space (think polar coordinates). Look for a curvature.', t`Rindler is Minkowski space in the coordinates $T = \rho\sinh\eta$, $X = \rho\cosh\eta$.`],
      teach: 'Flatness is decided by curvature, not by how the cones or Christoffel symbols look in one chart.',
      explain: t`Rindler is Minkowski space relabelled: $K = 0$ everywhere. The narrowing cones and the "fall" toward $\rho = 0$ are what uniformly accelerating observers see in an empty, flat world — Einstein’s equivalence principle in one picture.`,
    }),
    num({
      id: 'rindler-redshift', difficulty: 2,
      gen(r) {
        const r1 = r.pick([1, 2, 3]), r2 = r1 + r.pick([0.5, 1, 2, 4]);
        const ratio = r1 / r2;
        return {
          prompt: t`In the Rindler wedge, observers hover at $\rho_1 = ${r1}$ and $\rho_2 = ${r2}$ ($c = 1$). The lower one sends light pulses up at a steady rate. The metric does not depend on $\eta$, so successive pulses take the same $\Delta\eta$ to arrive. What is $f_2/f_1$, the received frequency over the emitted one?`,
          visual: { type: 'dg4-chart', params: { metric: 'rindler', mode: 'chart', probe: false, drag: false, readout: false, cells: 8, lines: [{ a: r1, label: 'emitter', color: 'accent', dash: [] }, { a: r2, label: 'receiver', color: 'violet', dash: [] }] }, caption: 'The two hovering observers on the Rindler chart, with the light cones between them.' },
          answer: ratio, tol: { rel: 0.003 },
          errors: [{ value: 1 / ratio, feedback: 'Light climbing away from the horizon is redshifted: the received frequency is lower.' }, { value: Math.sqrt(ratio), feedback: t`A static observer’s clock gives $d\tau = \sqrt{-g_{\eta\eta}}\,d\eta = \rho\,d\eta$, with no square root left.` }].filter((e) => Math.abs(e.value - ratio) > 0.01),
          hints: [t`Each observer’s proper time is $d\tau = \rho\,d\eta$.`, t`The same $\Delta\eta$ between pulses at both ends: $f \propto 1/\Delta\tau$.`],
          teach: t`In a static metric, pulses keep their coordinate-time spacing; each clock converts it with its own factor $\sqrt{-g_{tt}}$.`,
          explain: t`$f_2/f_1 = \Delta\tau_1/\Delta\tau_2 = \rho_1/\rho_2 = ${nice(ratio, 4)}$. With $\rho = c^2/a$ this is the rocket version of gravitational redshift: in a rocket accelerating at $a$, light climbing a height $h$ arrives with $f_2/f_1 = 1/(1 + ah/c^2)$ — the equivalence principle’s prediction, confirmed by Pound and Rebka on Earth.`,
        };
      },
    }),
    num({
      id: 'tortoise', difficulty: 2,
      gen(r) {
        const r1 = r.pick([3, 4, 5]), r2 = r1 + r.pick([2, 5, 10]);
        const T = climb(r1, r2);
        return {
          prompt: t`In the Schwarzschild plane ($G = c = 1$), radial light obeys $dt/dr = 1/(1 - 2M/r)$ going out. How much far-away time $t$ does light take to climb from $r = ${r1}M$ to $r = ${r2}M$, in units of $M$?`,
          visual: { type: 'dg4-chart', params: { metric: 'schwarzschild', mode: 'geodesic', P: [r1, 0], drag: false, speed: 1, length: 4 * (r2 - r1), readout: false, cells: 8, view: { a: [0, Math.max(12, r2 + 1)], b: [-2, Math.max(10, T + 2)] }, lines: [{ a: r2, color: 'accent', dash: [4, 4] }] }, caption: t`The outgoing light ray from $r = ${r1}M$ (gold), integrated as a null geodesic; the dashed line is $r = ${r2}M$.` },
          answer: T, tol: { rel: 0.003 },
          errors: [{ value: r2 - r1, feedback: 'That is flat space. Near the hole, outgoing light is slow in far-away time: integrate 1/(1 − 2M/r).' }, { value: (r2 - r1) + Math.log((r2 - 2) / (r1 - 2)), feedback: t`The logarithm carries a factor $2M$: $\int \frac{dr}{1 - 2M/r} = r + 2M\ln(r - 2M)$.` }].filter((e) => Math.abs(e.value - T) > 0.005 * T),
          hints: [t`$\dfrac{1}{1 - 2M/r} = 1 + \dfrac{2M}{r - 2M}$.`, t`$\Delta t = (r_2 - r_1) + 2M\ln\dfrac{r_2 - 2M}{r_1 - 2M}$.`],
          teach: 'Radial light in Schwarzschild follows dt = ±dr/(1 − 2M/r): the tortoise coordinate.',
          explain: t`$\Delta t = ${r2 - r1}M + 2M\ln\frac{${r2 - 2}}{${r1 - 2}} = ${nice(T, 4)}M$. The extra $${nice(T - (r2 - r1), 3)}M$ is spent low down, where outgoing light makes little progress per unit of $t$ — the cones in the picture are narrow there.`,
        };
      },
    }),
    num({
      id: 'desitter-light', difficulty: 2,
      gen(r) {
        const d = r.pick([0.3, 0.5, 0.8, 0.9, 0.95]);
        const T = -Math.log(1 - d);
        return {
          prompt: t`In 1+1 de Sitter, $ds^2 = -dt^2 + e^{2Ht}dx^2$, light leaves $x = 0$ at $t = 0$ toward a comoving galaxy at $x = ${d}/H$. When does it arrive? Give $Ht$.`,
          visual: { type: 'dg4-chart', params: { metric: 'desitter', mode: 'geodesic', P: [0, 0], drag: false, speed: 1, length: 3, readout: false, cells: 8, view: { a: [-0.5, 1.5], b: [-0.5, 3.5] }, lines: [{ a: d, color: 'accent', label: 'galaxy', dash: [] }, { a: 1, color: 'bad', label: 'x = 1/H' }] }, caption: t`The light ray (gold) on the comoving chart ($H = 1$): it never passes $x = 1/H$ (red, dashed). Blue: the galaxy’s worldline.` },
          answer: T, tol: { rel: 0.003 },
          errors: [{ value: d, feedback: 'That is how long light takes in a static universe. Here the distance it still has to cover grows as it goes.' }, { value: Math.log(1 + d), feedback: t`Light obeys $dx/dt = e^{-Ht}$, so $x = (1 - e^{-Ht})/H$; solve that for $t$.` }].filter((e) => Math.abs(e.value - T) > 0.005 * T),
          hints: [t`Null: $dt = e^{Ht}dx$, so $dx/dt = e^{-Ht}$.`, t`$x(t) = (1 - e^{-Ht})/H$; set it equal to $${d}/H$.`],
          teach: 'In de Sitter, light from the origin only ever reaches comoving distance 1/H: an event horizon.',
          explain: t`$1 - e^{-Ht} = ${d}$ gives $Ht = -\ln(1 - ${d}) = ${nice(T, 4)}$. As $x \to 1/H$ the time diverges: galaxies beyond comoving distance $1/H$ can never receive a signal sent now. That is de Sitter’s **event horizon** — real for this spacetime, and a fair model of our accelerating future.`,
        };
      },
    }),
    order({
      id: 'rindler-derive', difficulty: 3,
      prompt: t`Show that Rindler’s metric is flat Minkowski space relabelled, using $T = \rho\sinh\eta$, $X = \rho\cosh\eta$ on the wedge $X > |T|$. Order the steps.`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-1.5, 1.5], equal: true, xlabel: 'X', ylabel: 'T', xticks: 4, yticks: 4, curves: [{ param: ['t', 't'], t: [0, 1.5], color: 'gold', dash: [5, 4] }, { param: ['t', '-t'], t: [0, 1.5], color: 'gold', dash: [5, 4] }, ...[0.5, 1, 1.5, 2].map((rho) => ({ param: [`${rho}*cosh(t)`, `${rho}*sinh(t)`], t: [-1.2, 1.2], color: 'accent', width: 1.6 })), ...[-0.6, -0.3, 0.3, 0.6].map((e) => ({ param: [`t*${r6(Math.cosh(e))}`, `t*${r6(Math.sinh(e))}`], t: [0, 2.6], color: 'ink3', width: 1, dash: [3, 3] }))] }, caption: t`The wedge in Minkowski coordinates: blue hyperbolae are $\rho = $ const (the accelerating observers), grey rays are $\eta = $ const, gold the horizon.` },
      items: [
        t`Differentiate: $dT = \sinh\eta\,d\rho + \rho\cosh\eta\,d\eta$ and $dX = \cosh\eta\,d\rho + \rho\sinh\eta\,d\eta$.`,
        t`Square and subtract: $-dT^2 + dX^2 = (\cosh^2\eta - \sinh^2\eta)\,d\rho^2 + \rho^2(\sinh^2\eta - \cosh^2\eta)\,d\eta^2$.`,
        t`The cross terms $\pm2\rho\sinh\eta\cosh\eta\,d\rho\,d\eta$ cancel.`,
        t`With $\cosh^2 - \sinh^2 = 1$: $ds^2 = -\rho^2d\eta^2 + d\rho^2$.`,
        t`The map is smooth with smooth inverse on $\rho > 0$, so the two metrics are the same geometry: Rindler is flat.`,
      ],
      hints: [t`Write $dT$ and $dX$ in terms of $d\rho$ and $d\eta$.`, t`The identity $\cosh^2 - \sinh^2 = 1$ does all the work.`],
      teach: 'A metric that becomes Minkowski under a change of coordinates is flat, however its own chart looks.',
      explain: t`Rindler’s horizon $\rho = 0$ is the light cone $X = \pm T$ of Minkowski space — a perfectly ordinary pair of null lines, which the accelerating observers can never see past. The same thing happens at a black hole’s horizon, where the curvature is not zero but just as finite.`,
    }),
    mcq({
      id: 'ef-inside', difficulty: 3,
      prompt: t`In ingoing Eddington–Finkelstein coordinates the Schwarzschild plane reads $ds^2 = -\big(1 - \tfrac{2M}{r}\big)d\tilde t^{\,2} + \tfrac{4M}{r}\,d\tilde t\,dr + \big(1 + \tfrac{2M}{r}\big)dr^2$, and its two radial light rays have $dr/d\tilde t = -1$ and $dr/d\tilde t = \dfrac{r - 2M}{r + 2M}$. What happens at and inside $r = 2M$?`,
      visual: { type: 'dg4-chart', params: { metric: 'ef', mode: 'chart', probe: false, drag: false, readout: false, cells: 9 }, caption: t`The same spacetime on the Eddington–Finkelstein chart ($r$ across, $\tilde t$ up, units of $M$): the cones tip over smoothly as they cross $r = 2M$ (dashed).` },
      choices: [
        t`At $r = 2M$ outgoing light stands still; inside, both rays move to smaller $r$, so every future-directed path does too`,
        t`The metric is singular at $r = 2M$, so nothing can be said about the inside`,
        t`Inside, outgoing light moves out again, only more slowly`,
        t`The cones close up into lines at $r = 2M$, as in Schwarzschild’s chart`,
      ],
      answer: 0,
      why: {
        1: t`Every component here is finite at $r = 2M$ and $\det g = -1$ everywhere: nothing is singular there.`,
        2: t`For $r < 2M$, $(r - 2M)/(r + 2M) < 0$: the "outgoing" ray falls inward too.`,
        3: t`That closing up belongs to the $(t, r)$ chart. Here the cones keep their opening and only tilt.`,
      },
      hints: [t`Evaluate the outgoing slope at $r = 2M$ and at, say, $r = M$.`, t`A future-directed timelike path lies between the two rays.`],
      teach: 'At a horizon the light cones tip over: inside, the future points toward smaller r.',
      explain: t`At $r = 2M$ the outgoing slope is 0: light trying to leave hovers. At $r = M$ it is $-\tfrac13$. With both edges of the cone pointing inward, $r$ itself has become a time that runs only one way. The horizon is a null surface, ordinary locally, special globally — exactly like Rindler’s.`,
    }),
    mcq({
      id: 'k-sign', difficulty: 3,
      prompt: t`On a sphere ($K > 0$), neighbouring geodesics that start parallel converge. In 1+1 de Sitter, $K = H^2 > 0$ as well. What do two neighbouring comoving galaxies (timelike geodesics at fixed $x$) do?`,
      visual: { type: 'dg4-chart', params: { metric: 'desitter', mode: 'chart', probe: false, drag: false, readout: false, cells: 8, curves: [0, 0.3].map((x) => ({ pts: [[x, -1], [x, 2]], color: 'violet', width: 2.4 })) }, caption: t`Two comoving worldlines (violet) on de Sitter’s chart. The chart hides their separation: it is $e^{Ht}\Delta x$.` },
      choices: [
        t`They separate, $\xi \propto e^{Ht}$: in Lorentzian 2D, positive $K$ drives timelike geodesics apart`,
        t`They converge, as on a sphere`,
        t`They stay the same distance apart, since their coordinate $x$ is fixed`,
        t`They separate, but only because the chart says so; their proper separation is constant`,
      ],
      answer: 0,
      why: {
        1: t`Along a timelike geodesic the separation obeys $\ddot\xi = +K\xi$ in 2D Lorentzian geometry — the sign flips because $g(u, u) = -1$.`,
        2: t`Fixed $x$ is not fixed distance: the proper separation is $e^{Ht}\Delta x$.`,
        3: t`$e^{Ht}\Delta x$ is the proper separation, measured with the metric along a slice of constant $t$; it really grows.`,
      },
      hints: [t`Measure the separation with the metric: $\xi = \sqrt{g_{xx}}\,\Delta x$.`, t`Compute $\ddot\xi$ and compare with $K\xi$.`],
      teach: 'For timelike geodesics in 2D, separations obey ξ″ = +Kξ: positive curvature spreads them apart.',
      explain: t`$\xi = e^{Ht}\Delta x$ gives $\ddot\xi = H^2\xi = K\xi$. For a Riemannian surface the Jacobi equation is $\xi'' = -K\xi$; the timelike version picks up the sign of $g(u, u) = -1$. The same law with $K = 2M/r^3$ is the radial tidal stretch of a black hole (C17).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sgr-radar', difficulty: 3, transfer: true,
      gen(r) {
        const [r1, r2] = r.pick([[4, 10], [3, 8], [6, 20], [5, 12]]);
        const M = 4.30e6 * GM_SUN_S, T = 2 * climb(r1, r2), tau = T * Math.sqrt(1 - 2 / r1) * M;
        return {
          prompt: t`A (hypothetical) probe hovers at $r = ${r1}M$ above Sagittarius A*, the Milky Way’s central black hole, $M = 4.30\times10^6\,M_\odot$ ($GM_\odot/c^3 = 4.9255\ \mu\text{s}$). It radars a mirror hovering at $r = ${r2}M$. How long is the round trip by the probe’s own clock, in seconds?`,
          visual: { type: 'dg4-chart', params: { metric: 'schwarzschild', mode: 'chart', probe: false, drag: false, readout: false, equal: false, view: { a: [0, r2 + 2], b: [-1, T + 2] }, cells: 9, curves: radarCurves(r1, r2), lines: [{ a: r1, color: 'accent', dash: [] }, { a: r2, color: 'accent', dash: [] }] }, caption: t`The radar pulse on the $(r, t)$ chart, in units of $M$; time axis compressed.` },
          answer: tau, units: 's', tol: { rel: 0.004 },
          errors: [{ value: T * M, feedback: t`That is far-away time $t$. The probe’s clock runs slow by $\sqrt{1 - 2M/r_1}$.` }, { value: 2 * (r2 - r1) * M * Math.sqrt(1 - 2 / r1), feedback: t`Light is slow near the hole in coordinate time: integrate $dt = dr/(1 - 2M/r)$ rather than $dt = dr$.` }].filter((e) => Math.abs(e.value - tau) > 0.005 * tau),
          hints: [t`$\Delta t = 2\big[(r_2 - r_1) + 2M\ln\frac{r_2 - 2M}{r_1 - 2M}\big]$, then $\Delta\tau = \sqrt{1 - 2M/r_1}\,\Delta t$.`, t`$M = 4.30\times10^6\times4.9255\ \mu\text{s} = ${nice(M, 4)}$ s.`],
          teach: 'Radar times near a black hole: integrate the light cones for coordinate time, then convert with the emitter’s own clock rate.',
          explain: t`$\Delta t = ${nice(T, 4)}M$, $\Delta\tau = \sqrt{1 - 2/${r1}}\times${nice(T, 4)}M = ${nice(T * Math.sqrt(1 - 2 / r1), 4)}M = ${nice(tau, 4)}$ s, with $M = ${nice(M, 4)}$ s. (Mass from the GRAVITY and Keck orbits of the star S2; the probe is imaginary, the geometry is not.)`,
        };
      },
    }),
    num({
      id: 'cp-horizon-tide', difficulty: 3, transfer: true,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass black hole', 10], ['GW150914’s final black hole, 62 solar masses', 62], ['Sagittarius A*, 4.30 million solar masses', 4.30e6]]);
        const L = m * GM_SUN_M, val = (C * C) / (4 * L * L);
        return {
          prompt: t`The radial–time plane of Schwarzschild has $K = 2M/r^3$, which is also the radial tidal stretch: two nearby free-falling bodies a distance $\xi$ apart along the radius separate at $\ddot\xi = c^2K\xi$. Evaluate $c^2K$ at the horizon $r = 2M$ for ${name} ($GM_\odot/c^2 = 1476.6$ m), in $\text{s}^{-2}$ — the relative acceleration per metre of separation.`,
          visual: { type: 'dg4-chart', params: { metric: 'ef', mode: 'chart', probe: false, drag: false, readout: false, cells: 9 }, caption: t`The Eddington–Finkelstein chart: nothing marks $r = 2M$ (dashed) except the tilt of the cones.` },
          answer: val, units: 's^-2', tol: { rel: 0.005 },
          errors: [{ value: val * 4, feedback: t`At $r = 2M$: $K = 2M/(2M)^3 = 1/(4M^2)$, not $1/M^2$.` }, { value: 1 / (4 * L * L), feedback: t`Multiply by $c^2$ to turn $\text{m}^{-2}$ into $\text{s}^{-2}$.` }].filter((e) => Math.abs(e.value - val) > 0.01 * val),
          hints: [t`$K(2M) = 1/(4M^2)$ with $M = GM/c^2$ in metres.`, t`$M = ${m}\times1476.6$ m $= ${tex(L, 4)}$ m.`],
          teach: 'The curvature at a horizon is finite, 1/(4M²), and smaller for bigger black holes.',
          explain: t`$c^2/(4M^2) = ${tex(val, 3)}\ \text{s}^{-2}$. ${m > 1e5 ? t`That is about $${tex(2 * val / 9.81, 2)}\,g$ across a 2 m astronaut: they would cross the horizon without feeling it.` : t`That is about $${tex(val / 9.81, 2)}\,g$ per metre of body: lethal long before the horizon (spaghettification).`} Either way it is finite: $r = 2M$ is a property of the chart, not a singularity.`,
        };
      },
    }),
    mcq({
      id: 'cp-chart-half', difficulty: 2,
      prompt: t`The chart $ds^2 = -dt^2 + e^{2Ht}dx^2$ with $-\infty < t < \infty$ covers only half of the full 1+1 de Sitter spacetime. Which observation from this lesson points to an edge of the chart rather than of spacetime?`,
      visual: { type: 'dg4-chart', params: { metric: 'desitter', mode: 'chart', probe: false, drag: false, readout: false, cells: 8, view: { a: [-2.5, 2.5], b: [-2.5, 1.5] }, curves: [1, -1].map((sgn) => ({ pts: Array.from({ length: 81 }, (_, i) => { const tt = -2.5 + (4 * i) / 80; return [r6(sgn * (1 - Math.exp(-tt))), r6(tt)]; }), color: 'gold', width: 2.4 })) }, caption: t`The two light rays through the origin ($H = 1$): $x = \pm(1 - e^{-Ht})/H$. Followed into the past they run off to infinite comoving $x$ as $t \to -\infty$.` },
      choices: [
        t`Followed into the past, light rays reach $t \to -\infty$ within a finite affine parameter: they run off the chart`,
        t`The curvature $K = H^2$ grows without bound as $t \to -\infty$`,
        t`The metric component $e^{2Ht}$ is never zero`,
        t`Geodesics at fixed $x$ last for ever`,
      ],
      answer: 0,
      why: {
        1: t`$K = H^2$ is constant: de Sitter is as uniform as a sphere.`,
        2: 'Being nonzero is what makes the chart valid where it applies; it says nothing about where it ends.',
        3: 'Comoving observers are complete geodesics: they do not leave the chart.',
      },
      hints: [t`A null ray has affine parameter $\lambda$ with $dt/d\lambda \propto e^{-Ht}$. What happens to $\lambda$ as $t \to -\infty$?`],
      teach: 'A geodesic that leaves a chart in finite affine parameter while curvature stays finite marks the edge of the chart, not of spacetime.',
      explain: t`For a null ray $p_x = e^{2Ht}\dot x$ is conserved, so $\dot t = e^{Ht}\dot x \propto e^{-Ht}$ and $d\lambda \propto e^{Ht}dt$: $t \to -\infty$ is reached at finite $\lambda$. A free photon cannot simply stop existing, so the ray runs off the chart and continues into the other half of the hyperboloid. The test is the same one that unmasks $r = 2M$: finite curvature, incomplete coordinates.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §5.6–5.7 (Schwarzschild, Eddington–Finkelstein) and §8.3 (de Sitter)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'GRAVITY Collaboration, Mass distribution in the Galactic Centre, A&A 657 (2022) L12', url: 'https://www.aanda.org/articles/aa/full_html/2022/01/aa42465-21/aa42465-21.html' },
    { label: 'Rindler, Relativity: Special, General, and Cosmological, ch. 3 and 12', url: 'https://global.oup.com/academic/product/relativity-9780198567325' },
  ],
});
