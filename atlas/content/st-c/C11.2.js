// Pseudo-Riemannian (Lorentzian) metrics: drop positivity, keep
// non-degeneracy; signature (−, +, …); each tangent space a copy of
// Minkowski space with its light cone; timelike, null and spacelike vectors
// and curves; proper time. In 2D, det g < 0 is the whole test and the two
// null directions come from a quadratic. Worked on the rotating ring (a
// flat metric with tilted cones): Sagnac's effect for GPS and a spinning
// station.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const C = 299792458;          // m/s
const OMEGA_E = 7.292115e-5;  // rad/s, Earth's sidereal rotation rate (IERS)
const R_EQ = 6378137;         // m, WGS 84 equatorial radius

// a 2D metric in (t, x), drawn on component axes (x across, t up) by ten-metric's form mode
const formPic = (gtt, gtx, gxx, caption, extra = {}) => ({
  type: 'ten-metric',
  params: { mode: 'form', T: [[gxx, gtx], [gtx, gtt]], tname: 'g', axes: ['x', 't'], showU: false, showV: false, feed: false, indicatrix: true, readout: false, view: 2, ...extra },
  caption,
});
const ringPic = (w, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric: 'ring', k: w, mode: 'chart', probe: false, drag: false, readout: false, cells: 8, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C11.2',
  title: 'Pseudo-Riemannian (Lorentzian) metrics',
  minutes: 14, difficulty: 3,
  equation: t`\tau[\gamma] = \int_{\lambda_0}^{\lambda_1}\sqrt{-g_{\mu\nu}\,\dot x^\mu\dot x^\nu}\;d\lambda`,
  intro: t`Keep everything about a metric except positivity: $g$ is still symmetric, smooth and **non-degenerate** ($\det g \ne 0$, so no nonzero vector is orthogonal to every vector), but $g(V, V)$ may be negative. The numbers of negative and positive eigenvalues — the **signature** — cannot change on a connected manifold, since an eigenvalue would have to pass through 0. A **Lorentzian** metric has exactly one minus: $(-, +, +, +)$ in Carroll’s convention.

Then every tangent space is a copy of Minkowski space. A vector is **timelike** if $g(V, V) < 0$, **null** if $g(V, V) = 0$ (and $V \ne 0$), **spacelike** if $g(V, V) > 0$; the null vectors at $p$ form its **light cone**. A curve is timelike if its velocity is timelike everywhere — a possible history of a massive body — and its **proper time** is the integral above. Unlike Minkowski space, the cones may tilt, narrow and widen from point to point: that is how a metric steers what can reach what.`,
  symbols: [
    { tex: t`\tau[\gamma]`, text: t`the proper time along a timelike curve $\gamma$: the time a clock carried along it shows (with $c = 1$; in SI, divide $\sqrt{\cdots}$ by $c$)` },
    { tex: t`g_{\mu\nu}`, text: t`the metric’s components in a chart: symmetric, $\det g \ne 0$, signature $(-, +, \dots)$` },
    { tex: t`\dot x^\mu`, text: t`$dx^\mu/d\lambda$, the curve’s velocity; timelike means $g_{\mu\nu}\dot x^\mu\dot x^\nu < 0$` },
    { tex: t`\lambda`, text: 'any parameter along the curve; τ does not depend on which' },
  ],
  why: t`Spacetime is a manifold with a Lorentzian metric; gravity is how its light cones are arranged. Everything causal in GR — horizons, the speed limit, which events can influence which — is a statement about these cones.`,
  visual: {
    type: 'ten-metric',
    title: 'One tangent space, one light cone',
    lead: t`A metric $g_{\mu\nu}$ on one tangent space, drawn on component axes ($V^x$ across, $V^t$ up). The dashed lines are the null directions, $g(V, V) = 0$; the hyperbolae are $g(V, V) = \pm1$. Drag $V$ and change the components.`,
    tasks: [
      t`Start at Minkowski, $g = \mathrm{diag}(1, -1)$ in the order $(x, t)$. Drag $V$ across a dashed line: the readout changes from timelike to spacelike, and $g(V, V)$ passes through 0.`,
      t`Make $g_{12}$ nonzero: the cone tilts but stays a cone, and $\det g$ stays negative. Light now goes faster one way than the other in these coordinates.`,
      t`Raise $g_{22}$ through 0 to positive values: when $\det g$ reaches 0 the cone collapses, and beyond it the metric is Riemannian — an ellipse, no cone. A smooth Lorentzian metric can never do this anywhere.`,
    ],
    params: { mode: 'form', T: [[1, 0], [0, -1]], tname: 'g', uname: 'V', vname: 'W', axes: ['x', 't'], sliders: 'sym', range: 2, U: [0.5, 1.2], showV: false, feed: false, indicatrix: true, readout: ['UU', 'kind', 'det', 'sig'], view: 2.2 },
    caption: t`Axes are components ($V^x$ across, $V^t$ up); paper angles mean nothing, only $g$ does. Sliders: $g_{11} = g_{xx}$, $g_{12} = g_{xt}$, $g_{22} = g_{tt}$.`,
  },
  example: {
    prompt: t`A thin ring of radius $R$ turns at angular speed $\omega$ in flat spacetime ($c = 1$). Label events on it by the ring’s own angle $\varphi$ (fixed to the ring) and the lab time $t$. Find the metric, check that it is Lorentzian, and find how fast light goes round each way in these coordinates. Then find the difference in lab time between light sent once round the ring with and against the rotation.`,
    visual: ringPic(0.4, t`The ring’s chart ($\varphi$ across, $t$ up) for $\omega R = 0.4$: every light cone is tilted the same way. The metric is flat — Minkowski space in moving labels.`),
    steps: [
      { label: 'Change labels', text: t`The lab angle is $\Phi = \varphi + \omega t$, and on the ring Minkowski space gives $ds^2 = -dt^2 + R^2d\Phi^2$. With $d\Phi = d\varphi + \omega\,dt$: $$ds^2 = -(1 - \omega^2R^2)\,dt^2 + 2\omega R^2\,d\varphi\,dt + R^2\,d\varphi^2.$$` },
      { label: 'Signature', text: t`$g = \begin{pmatrix} -(1 - \omega^2R^2) & \omega R^2 \\ \omega R^2 & R^2\end{pmatrix}$ in the order $(t, \varphi)$, with $\det g = -(1 - \omega^2R^2)R^2 - \omega^2R^4 = -R^2 < 0$. A $2\times2$ symmetric matrix with negative determinant has one negative and one positive eigenvalue: Lorentzian, for every $\omega$.` },
      { label: 'Null directions', text: t`Set $ds^2 = 0$ and divide by $dt^2$: $R^2\dot\varphi^2 + 2\omega R^2\dot\varphi - (1 - \omega^2R^2) = 0$, so $R\dot\varphi = -\omega R \pm 1$. Light goes round at $1 - \omega R$ with the rotation and $1 + \omega R$ against it, in ring angle per lab time — the tilted cones.` },
      { label: 'Two trips', text: t`Once round is $\Delta\varphi = 2\pi$: $t_+ = \dfrac{2\pi R}{1 - \omega R}$ and $t_- = \dfrac{2\pi R}{1 + \omega R}$.` },
      { label: 'Difference', text: t`$t_+ - t_- = \dfrac{4\pi\omega R^2}{1 - \omega^2R^2} \approx 4\omega A$ for $\omega R \ll 1$, with $A = \pi R^2$; in SI, $\Delta t = 4\omega A/c^2$. This is the **Sagnac effect**: a ring laser or fibre gyroscope measures $\omega$ from it.` },
    ],
    answer: t`$ds^2 = -(1 - \omega^2R^2)dt^2 + 2\omega R^2d\varphi\,dt + R^2d\varphi^2$, $\det g = -R^2 < 0$; light circulates at $1 \mp \omega R$; the round-trip difference is $4\pi\omega R^2/(1 - \omega^2R^2) \approx 4\omega A/c^2$.`,
  },
  practice: [
    num({
      id: 'gvv', difficulty: 1,
      gen(r) {
        const gtt = r.pick([-1, -0.75, -2]), gtx = r.pick([0.5, -0.5, 1]), gxx = r.pick([1, 2]);
        const Vt = r.pick([1, 2]), Vx = r.pick([1, -1, 0.5, 2]);
        const val = gtt * Vt * Vt + 2 * gtx * Vt * Vx + gxx * Vx * Vx;
        return {
          prompt: t`At a point, a metric has $g_{tt} = ${gtt}$, $g_{tx} = g_{xt} = ${gtx}$, $g_{xx} = ${gxx}$. Find $g(V, V)$ for $V = (V^t, V^x) = (${Vt}, ${Vx})$, and say whether $V$ is timelike, null or spacelike.`,
          visual: formPic(gtt, gtx, gxx, t`This metric’s null directions (dashed) and $g(X, X) = \pm1$ (gold $+1$, violet $-1$), on component axes ($V^x$ across, $V^t$ up). $V$ is not drawn.`),
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: gtt * Vt * Vt + gtx * Vt * Vx + gxx * Vx * Vx, feedback: t`The sum has two cross terms, $g_{tx}V^tV^x + g_{xt}V^xV^t$.` }, { value: -gtt * Vt * Vt + 2 * gtx * Vt * Vx + gxx * Vx * Vx, feedback: t`Keep the sign of $g_{tt}$: it is already negative.` }].filter((e) => Math.abs(e.value - val) > 0.02),
          hints: [t`$g(V, V) = g_{tt}(V^t)^2 + 2g_{tx}V^tV^x + g_{xx}(V^x)^2$.`],
          teach: t`The sign of $g(V, V)$ is the causal character: negative timelike, zero null, positive spacelike.`,
          explain: t`$g(V, V) = ${gtt}(${Vt})^2 + 2(${gtx})(${Vt})(${Vx}) + ${gxx}(${Vx})^2 = ${nice(val)}$: **${val < -1e-9 ? 'timelike' : val > 1e-9 ? 'spacelike' : 'null'}**. ${val < 0 ? 'It lies inside the cone.' : val > 0 ? 'It lies outside the cone.' : 'It lies on the cone.'}`,
        };
      },
    }),
    mcq({
      id: 'det-test', difficulty: 2,
      prompt: t`A smooth metric on a 2D manifold has components $g_{\mu\nu}(x)$ in a chart. Which condition, holding at every point, says exactly that it is Lorentzian?`,
      visual: ringPic(0.95, t`The rotating ring’s chart with $\omega R = 0.95$ (rim near light speed): the cones are tipped far over, though $\det g = -R^2$ stays negative.`),
      choices: [t`$\det g_{\mu\nu} < 0$`, t`$g_{tt} < 0$`, t`One diagonal component is negative and one positive`, t`$g_{\mu\nu}$ has a negative trace`],
      answer: 0,
      why: {
        1: t`Not needed: on the rotating ring with $\omega R > 1$, $g_{tt} = -(1 - \omega^2R^2) > 0$, yet the metric is Lorentzian. And not enough: $g_{tt} < 0$ with $g_{xx} < 0$ is not.`,
        2: t`Off-diagonal terms matter: $\begin{pmatrix}-1 & 0\\0 & 1\end{pmatrix}$ qualifies, but so does $\begin{pmatrix}0 & 1\\1 & 0\end{pmatrix}$ ($ds^2 = 2\,du\,dv$) with no diagonal at all.`,
        3: t`$\mathrm{diag}(-1, -1)$ has negative trace and is not Lorentzian; $\mathrm{diag}(-1, 5)$ is Lorentzian with positive trace.`,
      },
      hints: [t`The determinant is the product of the eigenvalues.`, t`In 2D, one negative and one positive eigenvalue is the same as a negative product.`],
      teach: t`In 2D a metric is Lorentzian exactly when $\det g < 0$: the eigenvalues then have opposite signs.`,
      explain: t`$\det g = \lambda_1\lambda_2$, negative exactly when the eigenvalues have opposite signs. Diagonal entries depend on the chart — null coordinates $ds^2 = -du\,dv$ have none — but the sign of $\det g$ does not, since $\det g' = (\det J)^2\det g$.`,
    }),
    num({
      id: 'null-slope', difficulty: 2,
      gen(r) {
        const w = r.pick([0.2, 0.3, 0.5, 0.6]);
        const s = 1 - w;
        return {
          prompt: t`A 2D metric has, in coordinates $(t, x)$ with $c = 1$, $ds^2 = -${nice(1 - w * w)}\,dt^2 + ${nice(2 * w)}\,dt\,dx + dx^2$. Find the two null directions as slopes $dx/dt$. What is the positive one?`,
          visual: formPic(-(1 - w * w), w, 1, t`The metric’s indicatrix on component axes ($V^x$ across, $V^t$ up): the dashed lines are the null directions asked for.`),
          answer: s, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`That is Minkowski’s light speed. The $dt\,dx$ term tilts the cone.` }, { value: 1 + w, feedback: t`That is the size of the other root, $-1 - ${w}$; the positive root is $-${w} + 1$.` }, { value: Math.sqrt(1 - w * w), feedback: t`Setting $g_{tx} = 0$ and solving $g_{tt} + g_{xx}s^2 = 0$ ignores the cross term.` }].filter((e) => Math.abs(e.value - s) > 0.01),
          hints: [t`Divide $ds^2 = 0$ by $dt^2$ and write $s = dx/dt$: $s^2 + ${nice(2 * w)}s - ${nice(1 - w * w)} = 0$.`, t`$s = -${w} \pm \sqrt{${nice(w * w)} + ${nice(1 - w * w)}} = -${w} \pm 1$.`],
          teach: 'In 2D the null directions are the two roots of g(V, V) = 0 as a quadratic in the slope.',
          explain: t`$s = -${w} \pm 1$: light moves at $+${nice(s)}$ one way and $-${nice(1 + w)}$ the other. This is the rotating ring of the worked example with $\omega R = ${w}$ (and $R = 1$): flat spacetime, tilted labels.`,
        };
      },
    }),
    num({
      id: 'bead', difficulty: 3,
      gen(r) {
        const w = r.pick([0.2, 0.3, 0.4]), u = r.pick([0.1, 0.2, -0.3, 0.3]), T = r.pick([10, 20, 50]);
        const tau = T * Math.sqrt(1 - (w + u) ** 2);
        return {
          prompt: t`On the rotating ring of the worked example ($R = 1$, $c = 1$, $\omega = ${w}$), a bead slides round at $d\varphi/dt = ${u}$ relative to the ring. Using the metric $ds^2 = -(1 - \omega^2)dt^2 + 2\omega\,d\varphi\,dt + d\varphi^2$, how much proper time does the bead’s clock record while the lab clock advances by $t = ${T}$?`,
          visual: ringPic(w, t`The ring’s chart with its tilted light cones, $\omega R = ${w}$; the bead’s worldline is a straight line of slope $d\varphi/dt = ${u}$ here.`, { curves: [{ pts: [[1, 0], [r6(1 + 3.2 * u), 3.2]], color: 'violet', width: 2.6, label: 'bead' }] }),
          answer: tau, tol: { rel: 0.003 },
          errors: [{ value: T * Math.sqrt(1 - u * u), feedback: t`That is special relativity with the ring at rest. In the ring’s coordinates the metric’s $\omega$ terms carry the ring’s own motion.` }, { value: T * Math.sqrt(1 - w * w - u * u), feedback: t`Keep the cross term: $2\omega\,\dot\varphi$ contributes too.` }].filter((e) => Math.abs(e.value - tau) > 0.005 * tau),
          hints: [t`With $\lambda = t$, $\dot x = (1, ${u})$: $-g_{\mu\nu}\dot x^\mu\dot x^\nu = (1 - \omega^2) - 2\omega\dot\varphi - \dot\varphi^2$.`, t`That is $1 - (\omega + \dot\varphi)^2$; integrate the constant square root over $t$.`],
          teach: t`Proper time is the integral of $\sqrt{-g_{\mu\nu}\dot x^\mu\dot x^\nu}$; the metric already knows how the coordinates move.`,
          explain: t`$-g(\dot x, \dot x) = 1 - (${w} + ${u})^2 = ${nice(1 - (w + u) ** 2, 4)}$, so $\tau = ${T}\sqrt{${nice(1 - (w + u) ** 2, 4)}} = ${nice(tau, 4)}$. The metric has done the velocity addition for you: in the lab the bead goes round at $\omega + \dot\varphi = ${nice(w + u)}$, and $\tau = t\sqrt{1 - v^2}$ there.`,
        };
      },
    }),
    mcq({
      id: 'causal-curve', difficulty: 2,
      prompt: t`In Minkowski space ($c = 1$), which of these curves $\lambda \mapsto (t, x)$ could be the worldline of a particle?`,
      visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [0, 3.2], equal: true, xlabel: 'x', ylabel: 't', xticks: 5, yticks: 4, curves: [{ param: ['0.5*sin(t)', 't'], t: [0, 3.2], color: 'gold', width: 2.4, label: 'x = 0.5 sin t' }, { param: ['1.5*sin(t)', 't'], t: [0, 3.2], color: 'violet', width: 2.4, label: 'x = 1.5 sin t', labelAt: 2.4 }, { param: ['t', 't'], t: [0, 2.2], color: 'ink3', width: 1, dash: [4, 4] }, { param: ['-t', 't'], t: [0, 2.2], color: 'ink3', width: 1, dash: [4, 4] }] }, caption: 'Two of the candidate curves with the light cone of the origin (dashed). Equal scales: light moves at 45°.' },
      choices: [t`$x = 0.5\sin t$`, t`$x = 1.5\sin t$`, t`$x = t^2$ for all $t \ge 0$`, t`$t = 0$, $x = \lambda$`],
      answer: 0,
      why: {
        1: t`Its speed $|1.5\cos t|$ exceeds 1 near $t = 0$: the velocity is spacelike there, outside the cone.`,
        2: t`$dx/dt = 2t$ passes 1 at $t = \tfrac12$: after that the curve is spacelike.`,
        3: t`Its velocity $(0, 1)$ has $g(V, V) = +1$: a spacelike line, a slice of "now", not a history.`,
      },
      hints: [t`A worldline must be timelike at every point: $-1 + (dx/dt)^2 < 0$.`],
      teach: 'A worldline must be timelike everywhere: inside the light cone at every one of its points.',
      explain: t`$dx/dt = 0.5\cos t$ never reaches 1, so the velocity is timelike everywhere. Being timelike is a pointwise condition, checked against the cone at each point — in curved spacetime those cones differ from place to place.`,
    }),
    order({
      id: 'two-null', difficulty: 3,
      prompt: t`Show that a 2D Lorentzian metric has, at each point, exactly two null directions, which separate the timelike vectors from the spacelike ones. Order the steps.`,
      visual: formPic(-1, 0.4, 1.2, t`A Lorentzian $g$ on one tangent space: two null lines (dashed); $g(X, X) = -1$ (violet) between them, $+1$ (gold) outside.`),
      items: [
        t`Every direction other than $\partial_x$ is $V = (1, s)$ in components $(V^t, V^x)$, so $g(V, V) = g_{tt} + 2g_{tx}s + g_{xx}s^2 =: q(s)$.`,
        t`The discriminant of $q$ is $4(g_{tx}^2 - g_{tt}g_{xx}) = -4\det g$, positive because the metric is Lorentzian.`,
        t`So $q$ has exactly two real roots $s_1 < s_2$ (or one, with the direction $\partial_x$ null, if $g_{xx} = 0$): the null directions.`,
        t`A quadratic has one sign between its roots and the opposite sign outside them.`,
        t`So the null lines divide the directions into two double wedges, one timelike ($q < 0$) and one spacelike ($q > 0$): the light cone.`,
      ],
      hints: [t`Write $g(V, V)$ for $V$ of slope $s$ and look at it as a quadratic in $s$.`, t`What does $\det g < 0$ say about its discriminant?`],
      teach: 'In 2D, det g < 0 makes g(V, V) a quadratic in the slope with two real roots — the two edges of the light cone.',
      explain: t`The determinant is the whole story: $\det g < 0$ is equivalent to two real null directions. In 4D the same algebra gives a full cone of null directions round each timelike axis.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sagnac-gps', difficulty: 3, transfer: true,
      gen(r) {
        const lat = r.pick([0, 30, 45, 60]);
        const rr = R_EQ * Math.cos(lat * DEG), dt = (4 * Math.PI * rr * rr * OMEGA_E) / (C * C);
        return {
          prompt: t`GPS clocks are synchronized in a frame that does not rotate with the Earth. A light signal relayed once round the circle of latitude $${lat}^\circ$ (radius $R_\oplus\cos\lambda$, with $R_\oplus = 6378.137$ km), eastward and then westward, comes back at different times because the ground turns under it ($\omega = 7.292\,115\times10^{-5}$ rad/s). Using the rotating-ring result, what is the difference, in nanoseconds?`,
          visual: ringPic(0.5, t`The rotating ring’s chart, its cones tilted (drawn for $\omega R/c = 0.5$; for the Earth $\omega R/c \approx 1.6\times10^{-6}$, far too small to see).`),
          answer: dt * 1e9, units: 'ns', tol: { rel: 0.003 },
          errors: [{ value: dt * 0.5e9, feedback: t`That is one direction against a non-rotating clock, $2\omega A/c^2$. East minus west is twice it.` }, { value: (4 * Math.PI * R_EQ * R_EQ * OMEGA_E) / (C * C) * 1e9, feedback: t`Use the radius of the circle of latitude, $R_\oplus\cos\lambda$.` }].filter((e) => Math.abs(e.value - dt * 1e9) > 0.003 * dt * 1e9),
          hints: [t`$\Delta t = 4\omega A/c^2$ with $A = \pi(R_\oplus\cos\lambda)^2$ the area enclosed (projected on the equator).`, t`$\omega R/c \sim 10^{-6}$, so $1/(1 - \omega^2R^2/c^2) = 1$ to far better than needed.`],
          teach: 'Light sent round a rotating loop with and against the rotation returns 4ωA/c² apart: the Sagnac effect, from the tilt of the light cones in a rotating chart.',
          explain: t`$\Delta t = 4\pi(${nice(rr / 1000, 6)}\ \text{km})^2\,\omega/c^2 = ${nice(dt * 1e9, 4)}$ ns. Allan, Weiss and Ashby measured the equatorial value, 207 ns each way relative to a non-rotating clock, with GPS time transfers round the world in 1985; GPS receivers correct for it every day. (Gravity and height change it by parts per billion, ignored here.)`,
        };
      },
    }),
    mcq({
      id: 'cp-light-cylinder', difficulty: 3,
      prompt: t`On the rotating chart of the worked example, take a ring with $\omega R > 1$ (say $\omega R = 1.5$). Which statement is correct?`,
      visual: ringPic(0.95, t`The chart with $\omega R = 0.95$: as $\omega R \to 1$ the right edge of every cone swings up to the vertical, so $\partial_t$ itself is about to become null.`),
      choices: [
        t`The metric is still Lorentzian, but $\partial_t$ is spacelike there: no observer can stay at fixed $\varphi$`,
        t`The metric turns Riemannian beyond $\omega R = 1$`,
        t`The metric becomes degenerate, so spacetime is singular there`,
        t`Nothing changes: $\partial_t$ is still timelike, only slower`,
      ],
      answer: 0,
      why: {
        1: t`$\det g = -R^2$ for every $\omega$: it never changes sign, so the signature cannot change.`,
        2: t`$\det g = -R^2 \ne 0$: nothing is degenerate. It is flat spacetime, merely labelled by a frame that cannot be realized.`,
        3: t`$g_{tt} = -(1 - \omega^2R^2) = +1.25 > 0$: $\partial_t$ is outside the cone.`,
      },
      hints: [t`Compute $\det g$ and $g_{tt} = g(\partial_t, \partial_t)$ for $\omega R = 1.5$.`, t`A curve of fixed $\varphi$ has velocity $\partial_t$: what kind of vector is it?`],
      teach: 'Whether a coordinate direction is timelike depends on the chart; the signature does not.',
      explain: t`The signature is fixed by $\det g < 0$, but $g_{tt} > 0$: a point riding the ring would move faster than light. The surface $\omega R = 1$ is the **light cylinder** of a rotating frame (the same idea as a pulsar’s light cylinder). A coordinate time that stops being timelike reappears at the Schwarzschild horizon in C11.3.`,
    }),
    num({
      id: 'cp-station', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([50, 100, 225, 500]);
        const w = Math.sqrt(9.81 / R), dt = (4 * Math.PI * R * R * w) / (C * C);
        return {
          prompt: t`A ring-shaped space station of radius $R = ${R}$ m spins to give $1g$ ($9.81\ \text{m/s}^2$) at the rim. A fibre-optic gyroscope sends light once round the rim in each direction. By how many femtoseconds ($10^{-15}$ s) do the two arrivals differ?`,
          visual: ringPic(0.6, t`The rotating ring’s chart with its tilted cones (drawn for $\omega R/c = 0.6$; for the station, $\omega R/c \sim 10^{-7}$).`),
          answer: dt * 1e15, units: 'fs', tol: { rel: 0.005 },
          errors: [{ value: (4 * Math.PI * R * R * (9.81 / R)) / (C * C) * 1e15, feedback: t`For $1g$ at the rim, $\omega^2R = g$: $\omega = \sqrt{g/R}$, not $g/R$.` }, { value: dt * 0.5e15, feedback: 'That is one beam against a non-rotating clock. The difference between the beams is twice it.' }].filter((e) => Math.abs(e.value - dt * 1e15) > 0.01 * dt * 1e15),
          hints: [t`Centripetal acceleration: $\omega^2R = 9.81\ \text{m/s}^2$, so $\omega = ${nice(w, 4)}$ rad/s.`, t`$\Delta t = 4\omega A/c^2$, $A = \pi R^2$.`],
          teach: 'The Sagnac difference 4ωA/c² is how ring gyroscopes measure rotation without looking outside.',
          explain: t`$\omega = \sqrt{9.81/${R}} = ${nice(w, 4)}$ rad/s and $\Delta t = 4\pi(${R})^2(${nice(w, 4)})/c^2 = ${tex(dt, 3)}$ s $= ${nice(dt * 1e15, 4)}$ fs. Real gyroscopes use many turns of fibre (multiplying $A$) and measure the phase shift of the light, not the time directly.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §2.5 and §1.4 (causal structure)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Ashby, Relativity in the Global Positioning System, Living Reviews in Relativity 6 (2003)', url: 'https://link.springer.com/article/10.12942/lrr-2003-1' },
    { label: 'Allan, Weiss & Ashby, Around-the-world relativistic Sagnac experiment, Science 228 (1985) 69', url: 'https://www.science.org/doi/10.1126/science.228.4695.69' },
  ],
});
