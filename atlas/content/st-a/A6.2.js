// Line elements: ds² = g_μν dx^μ dx^ν is the metric fed one small step twice;
// reading g off a line element (a cross term splits in half); arc length
// L = ∫ √(g_μν ẋ^μ ẋ^ν) dλ; a gallery of line elements, including one — the
// half-plane — that no change of coordinates on a flat sheet produces.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { form, chartPic, matTeX, fr, r6, AXES_NOTE } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
// Simpson's rule, for keys whose integrals have no closed form
const simpson = (f, a, b, n = 20000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return (s * h) / 3; };
const spiralLen = (a, th) => (a / 2) * (th * Math.sqrt(1 + th * th) + Math.asinh(th));

export default lesson({
  id: 'st-a.A6.2',
  title: 'Line elements ds²',
  minutes: 11, difficulty: 3,
  intro: t`Feed the metric the same tiny step $d\mathbf x$, with components $dx^\mu$, in both slots and you get the squared length of the step — the **line element**:

$$ds^2 = g(d\mathbf x, d\mathbf x) = g_{\mu\nu}\,dx^\mu dx^\nu, \qquad L = \int\sqrt{g_{\mu\nu}\,\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda}}\;d\lambda$$

The second formula adds up such steps along a curve $x^\mu(\lambda)$: it is the arc-length integral of Calculus II with the metric doing Pythagoras’s job. A line element is just the metric written compactly ($dx^\mu dx^\nu$ is short for the symmetric product $dx^\mu\otimes dx^\nu$), so you can **read the components off it** — with one trap: a cross term $C\,du\,dv$ collects $g_{uv}\,du\,dv + g_{vu}\,dv\,du$, so $g_{uv} = g_{vu} = C/2$. The gallery: Cartesian $dx^2 + dy^2 + dz^2$; polar $dr^2 + r^2d\theta^2$; spherical $dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$; the 2-sphere of radius $R$, $R^2(d\theta^2 + \sin^2\theta\,d\phi^2)$; Minkowski spacetime $-dt^2 + dx^2 + dy^2 + dz^2$ (with $c = 1$). The first three are flat space in different labels; the 2-sphere and the half-plane below are genuinely curved, and the last one has a minus sign (lesson A6.6). The Road’s step 8 used these for distances and times; here you take them apart.`,
  symbols: [
    { tex: t`ds^2`, text: t`the squared length of a small step $d\mathbf x$ — a number, not the square of a covector` },
    { tex: t`g_{\mu\nu}`, text: t`the metric’s components at the point where the step starts` },
    { tex: t`dx^\mu`, text: 'the coordinate changes of the step (the step’s components)' },
    { tex: t`x^\mu(\lambda)`, text: t`a curve, with parameter $\lambda$; $dx^\mu/d\lambda$ is its velocity` },
    { tex: t`L`, text: 'the length of the curve, the same whatever coordinates or parameter you use' },
  ],
  why: t`Every metric in general relativity — Schwarzschild’s black hole, the expanding universe, a gravitational wave — is given as a line element, so reading it fluently is the first step of every calculation.`,
  visual: {
    type: 'ten-metric',
    title: 'Ellipses that are really circles',
    lead: t`Each chart is drawn as a plain grid of its own coordinates. At grid points, the gold ellipses are all the small steps of one fixed true length $\varepsilon$, from the line element; the orange one sits on the probe P, whose metric components the readout gives. Drag P, and drag the ends of the blue segment to compare its true length with the naive one.`,
    tasks: [
      t`Polar: the ellipses flatten in the $\theta$ direction as $r$ grows — one radian of $\theta$ is $r$ long. The left panel shows the true plane, where every one of them is the same circle.`,
      t`The 2-sphere: near the poles the ellipses balloon sideways — a degree of longitude there is almost no distance. This is a flat map of a round globe, and the ellipses are its distortion.`,
      t`The half-plane: the ellipses are circles that shrink toward $y = 0$. Measured with $ds^2 = (dx^2 + dy^2)/y^2$, the edge is infinitely far away.`,
    ],
    params: { mode: 'chart', chart: 'polar', charts: ['polar', 'sphere', 'halfplane', 'minkowski', 'cartesian'], probe: [2, 1], space: true, segment: [[1, 0.5], [3, 1.5]], readout: ['P', 'g', 'seg'] },
    caption: t`Gold: the steps of true length $\varepsilon$ at each grid point (the metric’s unit circle, scaled); orange: the one at P. In Minkowski space the steps of interval $\pm\varepsilon^2$ form hyperbolae (gold spacelike, violet timelike) about the light cone (dashed). The segment’s true length is computed by the integral above.`,
  },
  example: {
    prompt: t`The **half-plane** $y > 0$ with $ds^2 = \dfrac{dx^2 + dy^2}{y^2}$ is a famous curved surface (the hyperbolic plane), not a relabelled flat sheet. Read off its metric, then find the lengths of the vertical segment from $(0, 1)$ to $(0, 4)$ and of the horizontal one from $(0, 1)$ to $(2, 1)$. How far is the edge $y = 0$?`,
    visual: chartPic({ chart: 'halfplane', probe: [0, 1], segment: [[0, 1], [0, 2.4]] }, t`The half-plane chart (part of it). Each gold circle is the set of steps of one fixed true length: the lower, the smaller the circle — a fixed distance takes ever less coordinate room near $y = 0$.`),
    steps: [
      { label: 'Read the metric', text: t`No cross term: $g_{xx} = g_{yy} = 1/y^2$, $g_{xy} = 0$. At height $y$ a coordinate step is $1/y$ times its coordinate size.` },
      { label: 'Vertical segment', text: t`Parametrise by $y$ itself: $x = 0$, so $L = \int_1^4 \sqrt{1/y^2}\,dy = \ln 4 = 1.386$.` },
      { label: 'Horizontal segment', text: t`At $y = 1$ the metric is the identity: $L = \int_0^2 1\,dx = 2$. The same segment at $y = 2$ would be only 1 long.` },
      { label: 'The edge', text: t`From $y = 1$ down to $y = \epsilon$: $\ln(1/\epsilon)$, which grows without bound as $\epsilon \to 0$. The edge is infinitely far: walkers never reach it.` },
      { label: 'Sense check', text: t`Halving $y$ always costs the same distance, $\ln 2$ — the space looks the same at every height, and the line element is unchanged by $x \to kx$, $y \to ky$.` },
    ],
    answer: t`$g_{\mu\nu} = \operatorname{diag}(1/y^2, 1/y^2)$; the lengths are $\ln 4 = 1.386$ and $2$; the edge $y = 0$ is infinitely far.`,
  },
  practice: [
    num({
      id: 'cross-term', difficulty: 1,
      gen(r) {
        const a = r.int(1, 4), d = r.int(1, 4);
        let C; do { C = r.intExcept(-4, 4, [0]); } while (C * C >= 4 * a * d);
        const which = r.pick(['uv', 'uu']);
        const ans = which === 'uv' ? C / 2 : a;
        return {
          prompt: t`A surface has line element $ds^2 = ${a === 1 ? '' : a}\,du^2 ${C < 0 ? '-' : '+'} ${Math.abs(C)}\,du\,dv + ${d === 1 ? '' : d}\,dv^2$. What is $g_{${which === 'uv' ? 'uv' : 'uu'}}$?`,
          visual: form({ T: [[a, C / 2], [C / 2, d]], U: [1, 0], V: [0, 1], uname: 'eᵤ', vname: 'eᵥ', tname: 'g', indicatrix: true, feed: false, view: 1.6 }, t`This metric’s unit circle on $(u, v)$ component axes, with the two basis steps. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: which === 'uv' ? [{ value: C, feedback: t`The term $${C}\,du\,dv$ is $g_{uv}\,du\,dv + g_{vu}\,dv\,du$: it is shared between two equal components.` }] : [{ value: Math.sqrt(a), feedback: t`$g_{uu}$ is the coefficient of $du^2$ itself, not its square root (that is the length of $\mathbf e_u$).` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Expand $g_{\mu\nu}dx^\mu dx^\nu = g_{uu}du^2 + (g_{uv} + g_{vu})\,du\,dv + g_{vv}dv^2$ and compare.`],
          teach: t`A cross term $C\,du\,dv$ in $ds^2$ means $g_{uv} = g_{vu} = C/2$.`,
          explain: t`$g_{\mu\nu} = ${matTeX([[a, C / 2], [C / 2, d]])}$, so $g_{${which}} = ${fr(ans)}$.`,
        };
      },
    }),
    num({
      id: 'spherical-step', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 5, 10]), th = r.pick([30, 60, 90, 120]);
        const dr = r.pick([0.02, 0.03, 0.05]), dth = r.pick([0.01, 0.02]), dph = r.pick([0.01, 0.02, 0.03]);
        const s2 = dr ** 2 + R * R * dth ** 2 + (R * Math.sin(th * DEG)) ** 2 * dph ** 2;
        return {
          prompt: t`In spherical coordinates, $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$. At $r = ${R}$ m and $\theta = ${th}^\circ$ a small step has $dr = ${dr}$ m, $d\theta = ${dth}$ rad and $d\phi = ${dph}$ rad. How long is it, in metres?`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, th, 40], sliders: false, element: true, edgeLabels: false, readouts: [], range: 3 }, caption: t`The coordinate box at a point (drawn at $r = 2$): edges along $\partial_r$, $\partial_\theta$ and $\partial_\phi$, which are perpendicular — so no cross terms.` },
          answer: Math.sqrt(s2), units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(dr ** 2 + dth ** 2 + dph ** 2), feedback: 'Angles are not lengths: each needs its metric factor, r² and r² sin²θ.' }, { value: Math.sqrt(dr ** 2 + R * R * dth ** 2 + R * R * dph ** 2), feedback: t`The $d\phi^2$ term carries $\sin^2\theta$ as well as $r^2$.` }].filter((e) => Math.abs(e.value - Math.sqrt(s2)) > 0.005 * Math.sqrt(s2)),
          hints: [t`Substitute into $ds^2$ term by term, then take the square root.`],
          teach: t`In $ds^2$ each coordinate change is weighted by its metric component; angles become lengths through $r$ and $r\sin\theta$.`,
          explain: t`$ds^2 = ${dr}^2 + ${R}^2(${dth})^2 + (${R}\sin${th}^\circ)^2(${dph})^2 = ${nice(s2, 4)}$ m², so $ds = ${nice(Math.sqrt(s2), 4)}$ m.`,
        };
      },
    }),
    num({
      id: 'spiral', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), turns = r.pick([1, 2]);
        const th = 2 * Math.PI * turns;
        const ans = spiralLen(a, th);
        return {
          prompt: t`Use the polar line element $ds^2 = dr^2 + r^2d\theta^2$ to find the length of the spiral $r = ${a === 1 ? '' : a}\theta$ from $\theta = 0$ to $\theta = ${turns === 1 ? '2' : '4'}\pi$ (${turns} turn${turns > 1 ? 's' : ''}). Give 4 significant figures.`,
          visual: { type: 'graph', params: { x: [-a * th * 1.1, a * th * 1.1], y: [-a * th * 0.75, a * th * 0.75], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ polar: `${a}*theta`, theta: [0, r6(th)], color: 'gold', width: 2.4 }] }, caption: t`The spiral $r = ${a}\theta$ over ${turns} turn${turns > 1 ? 's' : ''}.` },
          answer: ans, tol: { rel: 0.002 },
          integrand: `${a}*sqrt(1 + t^2)`, limits: [0, th], vars: { t: [0, th] },
          errors: [{ value: a * th * th / 2, feedback: t`That integrates $r\,d\theta$ only. The step also moves outward: $ds = \sqrt{(dr/d\theta)^2 + r^2}\,d\theta$.` }],
          hints: [t`With $\lambda = \theta$: $dr/d\theta = ${a}$, so $L = \int_0^{${turns === 1 ? '2' : '4'}\pi}\sqrt{${a * a} + ${a * a}\theta^2}\,d\theta = ${a}\int\sqrt{1 + \theta^2}\,d\theta$.`, t`$\int\sqrt{1 + \theta^2}\,d\theta = \tfrac12\left(\theta\sqrt{1 + \theta^2} + \sinh^{-1}\theta\right)$.`],
          teach: t`Arc length is $\int\sqrt{g_{\mu\nu}\dot x^\mu\dot x^\nu}\,d\lambda$; in polar coordinates with $\lambda = \theta$ that is $\int\sqrt{r'^2 + r^2}\,d\theta$.`,
          explain: t`$L = ${a}\cdot\tfrac12\left[\theta\sqrt{1 + \theta^2} + \sinh^{-1}\theta\right]_0^{${nice(th, 4)}} = ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'halfplane', difficulty: 2,
      gen(r) {
        const [y1, y2] = r.pick([[0.5, 2], [0.25, 1], [1, 3], [0.2, 2]]), x0 = r.pick([-1, 0, 1]);
        const ans = Math.log(y2 / y1);
        return {
          prompt: t`In the half-plane with $ds^2 = (dx^2 + dy^2)/y^2$, how long is the vertical segment from $(${x0}, ${y1})$ to $(${x0}, ${y2})$?`,
          visual: chartPic({ chart: 'halfplane', probe: [x0, y1], segment: [[x0, y1], [x0, y2]] }, t`The segment on the half-plane chart; the gold circles mark steps of one fixed true length.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: y2 - y1, feedback: t`That is the coordinate length. Each step $dy$ is worth $dy/y$.` }, { value: 1 / y1 - 1 / y2, feedback: t`$\sqrt{dy^2/y^2} = dy/y$, which integrates to a logarithm, not $-1/y$.` }],
          hints: [t`$L = \int_{${y1}}^{${y2}}\dfrac{dy}{y}$.`],
          teach: t`In the half-plane, vertical distance is the logarithm of the ratio of heights.`,
          explain: t`$L = \ln(${y2}/${y1}) = ${nice(ans, 4)}$ — the same for any segment with the same ratio of heights.`,
        };
      },
    }),
    mcq({
      id: 'what-is-ds2', difficulty: 2,
      prompt: t`In $ds^2 = g_{\mu\nu}\,dx^\mu dx^\nu$, what is $ds^2$?`,
      visual: form({ T: [[1, 0], [0, 4]], U: [0.6, 0.3], V: [0.6, 0.3], showV: false, uname: 'dx', tname: 'g', indicatrix: true, feed: false, view: 1.4 }, t`A small step $d\mathbf x$ and the unit circle of the metric $\operatorname{diag}(1, 4)$. ${AXES_NOTE}`),
      choices: [t`The metric evaluated on one small step twice, $g(d\mathbf x, d\mathbf x)$ — the step’s squared length, a number`, t`The square of a covector $ds$, which exists whenever $ds^2$ does`, t`The square of the coordinate change, $(dx^1)^2 + (dx^2)^2$`, 'A second derivative of the arc length'],
      answer: 0,
      why: {
        1: t`There is no covector $ds$ in general: $\sqrt{g_{\mu\nu}dx^\mu dx^\nu}$ is not linear in the step (and in spacetime $ds^2$ can be negative).`,
        2: 'That is true only for Cartesian coordinates; the metric’s components weight the coordinate changes.',
        3: t`The “2” is a square of a small length, not an order of derivative.`,
      },
      hints: [t`Read $dx^\mu dx^\nu$ as $dx^\mu\otimes dx^\nu$ and feed it the step.`],
      teach: t`$ds^2$ is notation for the metric itself, $g_{\mu\nu}\,dx^\mu\otimes dx^\nu$; fed a step, it gives the step’s squared length.`,
      explain: t`$g_{\mu\nu}\,dx^\mu\otimes dx^\nu$ is the metric written in the basis of products; evaluated on $d\mathbf x$, each $dx^\mu$ returns the step’s component, and the result is $g(d\mathbf x, d\mathbf x)$.`,
    }),
    num({
      id: 'sphere-path', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 2, 6371]), [a, b] = r.pick([[30, 90], [45, 135], [60, 120]]);
        const A = a * DEG, B = b * DEG;
        const ans = R * simpson((x) => Math.sqrt(1 + Math.sin(x) ** 2), A, B);
        const unit = R === 6371 ? ' km' : '';
        return {
          prompt: t`On a sphere of radius $R = ${R}$${unit}, $ds^2 = R^2(d\theta^2 + \sin^2\theta\,d\phi^2)$. A path keeps $\phi = \theta$ (in radians) while $\theta$ goes from $${a}^\circ$ to $${b}^\circ$ — a straight line on the $(\phi, \theta)$ chart. How long is it${unit ? ', in km' : ''}? (Give 4 significant figures; a numerical integral is fine.)`,
          visual: chartPic({ chart: 'sphere', probe: [r6(A), r6(A)], segment: [[r6(A), r6(A)], [r6(B), r6(B)]] }, t`The path on the sphere’s chart: longitude $\phi$ across, $\theta$ down from the North Pole, both in radians. The ellipses are steps of one true length.`),
          answer: ans, ...(unit ? { units: 'km' } : {}), tol: { rel: 0.002 },
          integrand: `${R}*sqrt(1 + sin(t)^2)`, limits: [r6(A), r6(B)], vars: { t: [r6(A), r6(B)] },
          errors: [{ value: R * Math.SQRT2 * (B - A), feedback: t`That treats the chart as flat: the $d\phi$ step is shortened by $\sin\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.002 * ans),
          hints: [t`With $\lambda = \theta$: $d\phi/d\theta = 1$, so $ds = R\sqrt{1 + \sin^2\theta}\,d\theta$.`, t`$L = R\int_{${nice(A, 4)}}^{${nice(B, 4)}}\sqrt{1 + \sin^2\theta}\,d\theta$; Simpson’s rule with a few strips is plenty.`],
          teach: 'A straight line on a chart is usually not a straight (or simple) line in the space: its length comes from the line element along it.',
          explain: t`$L = R\int\sqrt{1 + \sin^2\theta}\,d\theta = ${nice(ans, 4)}$${unit}. A flat reading of the chart would give $\sqrt2\,R\,\Delta\theta = ${nice(R * Math.SQRT2 * (B - A), 4)}$${unit}.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-read', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), d = r.int(2, 5); let C; do { C = r.intExcept(-3, 3, [0]); } while (C * C >= 4 * a * d);
        const u = r.pick([1, 2]), v = r.pick([1, -1, 2]);
        const s2 = a * u * u + C * u * v + d * v * v;
        return {
          prompt: t`With $ds^2 = ${a === 1 ? '' : a}\,du^2 ${C < 0 ? '-' : '+'} ${Math.abs(C)}\,du\,dv + ${d}\,dv^2$, what is $g(\mathbf U, \mathbf U)$ for the vector $\mathbf U = ${u === 1 ? '' : u}\,\partial_u ${v < 0 ? '-' : '+'} ${Math.abs(v) === 1 ? '' : Math.abs(v)}\,\partial_v$?`,
          visual: form({ T: [[a, C / 2], [C / 2, d]], U: [u * 0.5, v * 0.5], showV: false, uname: 'U', tname: 'g', indicatrix: true, feed: false, view: 1.6 }, t`This metric’s unit circle and $\mathbf U$ (at half scale). ${AXES_NOTE}`),
          answer: s2, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a * u * u + 2 * C * u * v + d * v * v, feedback: t`The coefficient $${C}$ already counts both $g_{uv}$ and $g_{vu}$; do not double it again.` }].filter((e) => e.value !== s2),
          hints: [t`Substitute $du = ${u}$, $dv = ${v}$ into the line element.`],
          teach: t`$g(\mathbf U, \mathbf U)$ is the line element with the step’s components put in: the cross term is used exactly as written.`,
          explain: t`$${a}(${u})^2 + (${C})(${u})(${v}) + ${d}(${v})^2 = ${s2}$.`,
        };
      },
    }),
    num({
      id: 'cp-rhumb', difficulty: 3, transfer: true,
      gen(r) {
        const [l1, l2] = r.pick([[10, 40], [0, 30], [20, 50]]), beta = r.pick([30, 45, 60]);
        const R = 6371, dlat = (l2 - l1) * DEG;
        const ans = (R * dlat) / Math.cos(beta * DEG);
        // the track on a latitude–longitude map: dφ/dλ = tan β / cos λ
        const lam = () => `${r6(l1 * DEG)} + ${r6(dlat)}*t`;
        return {
          prompt: t`A ship sails a **rhumb line** — a constant compass heading, $${beta}^\circ$ east of north — from latitude $${l1}^\circ$ N to $${l2}^\circ$ N. On a sphere of radius $6371$ km, $ds^2 = R^2(d\theta^2 + \sin^2\theta\,d\phi^2)$; a constant heading $\beta$ means the northward part of each step is $R\,|d\theta| = ds\cos\beta$. How far does the ship sail, in km?`,
          visual: { type: 'graph', params: { x: [-5, 80], y: [-5, 60], xlabel: 'longitude east (°)', ylabel: 'latitude (°)', curves: [{ param: [`(${r6(Math.tan(beta * DEG))}*(ln(tan(pi/4 + (${lam()})/2)) - ${r6(Math.log(Math.tan(Math.PI / 4 + (l1 * DEG) / 2)))}))*180/pi`, `(${lam()})*180/pi`], t: [0, 1], color: 'gold', width: 2.6 }], points: [{ x: 0, y: l1, color: 'gold', label: 'start' }] }, caption: t`The ship’s track on a plain longitude–latitude map (degrees): a gentle curve. On a Mercator chart it would be straight.` },
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: R * dlat, feedback: t`That is only the northward distance. The ship sails at $${beta}^\circ$ to north, so the track is longer by $1/\cos${beta}^\circ$.` }, { value: R * dlat * Math.cos(beta * DEG), feedback: t`Upside down: $R\,d\theta = ds\cos\beta$, so $ds = R\,d\theta/\cos\beta$.` }],
          hints: [t`$ds = R\,|d\theta|/\cos\beta$ at every step, and $\beta$ is constant.`, t`So $L = R\,\Delta\theta/\cos\beta$ with $\Delta\theta$ the change of latitude in radians.`],
          teach: 'Along a constant-heading track the line element reduces to ds = R dθ / cos β, so the length is easy even though the path is not a great circle.',
          explain: t`$L = 6371\times${nice(dlat, 4)}/\cos${beta}^\circ = ${nice(ans, 4)}$ km. (A great circle between the same points would be a little shorter.)`,
        };
      },
    }),
    mcq({
      id: 'cp-edge', difficulty: 2,
      prompt: t`In the half-plane, $ds^2 = (dx^2 + dy^2)/y^2$, a hiker starts at $y = 1$ and walks straight down toward $y = 0$. What happens?`,
      visual: chartPic({ chart: 'halfplane', probe: [0, 1], segment: [[0, 1], [0, 0.05]] }, t`The walk on the half-plane chart; each gold circle is a step of one fixed length.`),
      choices: [t`She never arrives: the distance to $y = \epsilon$ is $\ln(1/\epsilon)$, which grows without bound`, t`She arrives after a distance of 1, the coordinate distance`, t`She arrives after a distance $\pi/2$`, 'She falls off: the space ends at y = 0'],
      answer: 0,
      why: {
        1: 'Coordinate differences are not distances; here each dy costs dy/y.',
        2: 'No such finite value: the integral of dy/y diverges at 0.',
        3: 'There is no edge she can reach — y = 0 is not part of the space and is infinitely far.',
      },
      hints: [t`$\int_\epsilon^1 dy/y = ?$`],
      teach: 'A boundary of a chart can be infinitely far away once distances are measured with the metric.',
      explain: t`$\int_\epsilon^1 dy/y = \ln(1/\epsilon) \to \infty$. Each halving of $y$ costs the same distance $\ln 2 = 0.693$, forever.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (the line element; examples)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Poincaré half-plane model', url: 'https://en.wikipedia.org/wiki/Poincar%C3%A9_half-plane_model' },
    { label: 'Rhumb line', url: 'https://en.wikipedia.org/wiki/Rhumb_line' },
    { label: 'OpenStax Calculus Vol. 2, §6.4 and §7.4 (arc length; arc length in polar coordinates)', url: 'https://openstax.org/books/calculus-volume-2/pages/7-4-area-and-arc-length-in-polar-coordinates' },
  ],
});
