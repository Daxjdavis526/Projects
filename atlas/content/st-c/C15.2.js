// The Riemann tensor of the 2-sphere computed in full from its Christoffel
// symbols, lowered, and turned into K = R_θφθφ/det g; the 2D identity
// R_abcd = K(g_ac g_bd − g_ad g_bc). Practice on charts and surfaces the gr
// lessons do not use: the torus's R^v_uvu, the sphere in stereographic and
// in Archimedes' equal-area coordinates (where R_zφzφ = 1 everywhere), the
// Poincaré disk, a lunar polar-stereographic map, and the round spheres of
// Schwarzschild spacetime (intrinsic r² sin²θ against the spacetime's 2Mr sin²θ).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const DEG = Math.PI / 180;

const sphere3d = (levels, caption) => ({
  type: 'calc-vectors3d',
  params: {
    range: 1.4,
    spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
    curves: levels.map((z) => ({ param: [`${Math.sqrt(1 - z * z).toFixed(4)}*cos(t)`, `${Math.sqrt(1 - z * z).toFixed(4)}*sin(t)`, z], t: [0, 2 * Math.PI], color: 'teal' })),
  },
  caption,
});

export default lesson({
  id: 'st-c.C15.2',
  title: 'The Riemann tensor of the 2-sphere',
  minutes: 14, difficulty: 3,
  equation: t`R_{\theta\varphi\theta\varphi} = a^2\sin^2\theta`,
  intro: t`Feed the sphere’s two non-zero Christoffel symbols into the component formula of C15.1 and one number comes out: $R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta$, for **every** radius. Lowering the first index with the metric, $R_{\rho\sigma\mu\nu} = g_{\rho\lambda}R^\lambda{}_{\sigma\mu\nu}$, puts the size back in: the equation above. Every other component is either this one, minus this one, or zero — in two dimensions the symmetries leave a single independent component (C15.3), and dividing it by $\det g$ gives the Gaussian curvature:
$$K = \frac{R_{\theta\varphi\theta\varphi}}{\det g} = \frac{a^2\sin^2\theta}{a^4\sin^2\theta} = \frac{1}{a^2}.$$
The **components depend on the chart; $K$ does not.** In any chart of any surface, $R_{abcd} = K\,(g_{ac}g_{bd} - g_{ad}g_{bc})$.`,
  symbols: [
    { tex: t`R_{\theta\varphi\theta\varphi}`, text: t`the Riemann tensor with all indices lowered, $g_{\theta\lambda}R^\lambda{}_{\varphi\theta\varphi}$, in $\text{m}^2$ when $a$ is in metres (angles carry no units)` },
    { tex: 'a', text: 'the sphere’s radius, in m' },
    { tex: t`\theta,\ \varphi`, text: t`colatitude (from the north pole) and longitude; the metric is $ds^2 = a^2(d\theta^2 + \sin^2\theta\,d\varphi^2)$` },
    { tex: 'K', text: t`the Gaussian curvature, in $\text{m}^{-2}$` },
    { tex: t`\det g`, text: t`the determinant of the metric’s components, $g_{\theta\theta}g_{\varphi\varphi} - g_{\theta\varphi}^2 = a^4\sin^2\theta$` },
  ],
  why: t`The round sphere is the template for every space of constant curvature — the angular part of every spherically symmetric spacetime, and the closed universe of cosmology — so its Riemann tensor is one you will meet again in gr.S14.d and gr.S20.d.`,
  visual: {
    type: 'dg4-chart',
    title: 'Components change, curvature does not',
    lead: t`Drag $P$ over the chart. The readout gives the metric, the Christoffel symbols and $K$ at $P$. The $\Gamma$s change wildly from place to place and from chart to chart; $K$ stays fixed.`,
    tasks: [
      t`Drag $P$ toward the north pole: $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$ grows without limit, yet $K = 1/a^2$ does not move. The pole is a problem of the chart, not of the sphere.`,
      t`Slide the radius: $K = 1/a^2$, while $\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$ does not change at all. The size enters Riemann only through the metric used to lower its index.`,
      t`Switch to the stereographic chart of the same sphere: different $g$, different $\Gamma$s, the same $K$.`,
    ],
    params: { metric: 'sphere', metrics: ['sphere', 'stereo'], mode: 'chart', P: [1.2, 1.0], sliders: ['k'], readout: ['P', 'g', 'gamma', 'K'], field: true, cells: 8 },
    caption: t`The sphere on its own coordinate charts; ellipses mark steps of one fixed length. $K$ comes from finite differences of the $\Gamma$s, a check independent of the formula.`,
  },
  example: {
    prompt: t`For the sphere $ds^2 = a^2(d\theta^2 + \sin^2\theta\,d\varphi^2)$, with $\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$ and $\Gamma^\varphi{}_{\theta\varphi} = \Gamma^\varphi{}_{\varphi\theta} = \cot\theta$ (all others zero), compute $R^\theta{}_{\varphi\theta\varphi}$, lower it, and find $K$.`,
    visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'sphere', v: 0.9, controls: false, readout: false }, caption: 'A point on the sphere with its coordinate basis vectors and their copies a step away: the Christoffel symbols record how those copies differ.' },
    steps: [
      { label: 'The formula', text: t`$R^\theta{}_{\varphi\theta\varphi} = \partial_\theta\Gamma^\theta{}_{\varphi\varphi} - \partial_\varphi\Gamma^\theta{}_{\theta\varphi} + \Gamma^\theta{}_{\theta\lambda}\Gamma^\lambda{}_{\varphi\varphi} - \Gamma^\theta{}_{\varphi\lambda}\Gamma^\lambda{}_{\theta\varphi}$, with $\rho = \theta$, $\sigma = \varphi$, $\mu = \theta$, $\nu = \varphi$.` },
      { label: 'Derivatives', text: t`$\partial_\theta(-\sin\theta\cos\theta) = \sin^2\theta - \cos^2\theta$. The second term is zero: $\Gamma^\theta{}_{\theta\varphi} = 0$.` },
      { label: 'Products', text: t`$\Gamma^\theta{}_{\theta\lambda} = 0$ for both $\lambda$, so the third term vanishes. In the fourth only $\lambda = \varphi$ survives: $\Gamma^\theta{}_{\varphi\varphi}\Gamma^\varphi{}_{\theta\varphi} = (-\sin\theta\cos\theta)\cot\theta = -\cos^2\theta$.` },
      { label: 'Assemble', text: t`$R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta - \cos^2\theta - 0 + 0 - (-\cos^2\theta) = \sin^2\theta$. No $a$: the $\Gamma$s do not know the radius.` },
      { label: 'Lower', text: t`$R_{\theta\varphi\theta\varphi} = g_{\theta\theta}R^\theta{}_{\varphi\theta\varphi} = a^2\sin^2\theta$. By the symmetries, $R_{\varphi\theta\varphi\theta} = a^2\sin^2\theta$ and $R_{\theta\varphi\varphi\theta} = R_{\varphi\theta\theta\varphi} = -a^2\sin^2\theta$; the other twelve are zero.` },
      { label: 'Curvature', text: t`$K = R_{\theta\varphi\theta\varphi}/\det g = a^2\sin^2\theta/(a^4\sin^2\theta) = 1/a^2$. Sense check: units $\text{m}^2/\text{m}^4 = \text{m}^{-2}$, the $\sin^2\theta$ (a chart artefact) cancels, and $a\to\infty$ is flat.` },
    ],
    answer: t`$R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta$, $R_{\theta\varphi\theta\varphi} = a^2\sin^2\theta$, and $K = 1/a^2$ everywhere.`,
  },
  practice: [
    num({
      id: 'torus-component', difficulty: 3,
      gen(r) {
        const [R, rr] = r.pick([[2, 0.5], [3, 0.5], [3, 1.5], [2, 1.5], [4, 1.5]]), v = r.pick([30, 60, 135]);
        const c = Math.cos(v * DEG), s = Math.sin(v * DEG), w = R + rr * c;
        const key = (w * c) / rr;
        const dOnly = (w * c - rr * s * s) / rr;
        return {
          prompt: t`A torus with central radius $R = ${R}$ and tube radius $r = ${rr}$ has $ds^2 = (R + r\cos v)^2du^2 + r^2dv^2$ and non-zero Christoffel symbols $$\Gamma^v{}_{uu} = \frac{(R + r\cos v)\sin v}{r},\qquad \Gamma^u{}_{uv} = \Gamma^u{}_{vu} = -\frac{r\sin v}{R + r\cos v}.$$ Compute $R^v{}_{uvu}$ at $v = ${v}^\circ$.`,
          visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: +(v * DEG).toFixed(4), controls: false, readout: false }, caption: t`A point at $v = ${v}^\circ$ round the tube (drawn with $R = 2$, $r = 1$), with its basis vectors; colour shows $K$, gold positive and blue negative.` },
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: rr * w * c, feedback: t`That is the lowered $R_{vuvu} = g_{vv}R^v{}_{uvu}$. The question asks for $R^v{}_{uvu}$ itself.` },
            { value: dOnly, feedback: t`You kept only $\partial_v\Gamma^v{}_{uu}$. The term $-\Gamma^v{}_{u\lambda}\Gamma^\lambda{}_{vu}$ with $\lambda = u$ adds $+\sin^2 v$.` },
            { value: -key, feedback: t`Check the sign of $-\Gamma^v{}_{uu}\Gamma^u{}_{vu}$: two minus signs make it positive.` },
          ].filter((x) => Math.abs(x.value - key) > 0.02 * Math.abs(key)),
          hints: [
            t`$R^v{}_{uvu} = \partial_v\Gamma^v{}_{uu} - \partial_u\Gamma^v{}_{vu} + \Gamma^v{}_{v\lambda}\Gamma^\lambda{}_{uu} - \Gamma^v{}_{u\lambda}\Gamma^\lambda{}_{vu}$. Nothing depends on $u$, and $\Gamma^v{}_{v\lambda} = 0$.`,
            t`$\partial_v\Gamma^v{}_{uu} = \dfrac{(R + r\cos v)\cos v - r\sin^2 v}{r}$ and $-\Gamma^v{}_{uu}\Gamma^u{}_{vu} = +\sin^2 v$.`,
            t`They sum to $\dfrac{(R + r\cos v)\cos v}{r}$.`,
          ],
          teach: 'Riemann components come term by term from the formula: derivatives of Γ plus products of Γs, most of them zero.',
          explain: t`$R^v{}_{uvu} = \dfrac{(R + r\cos v)\cos v}{r} = \dfrac{(${R} + ${rr}\cos ${v}^\circ)\cos ${v}^\circ}{${rr}} = ${nice(key, 4)}$. Lowering, $R_{vuvu} = r(R + r\cos v)\cos v$, and $K = R_{vuvu}/\det g = \dfrac{\cos v}{r(R + r\cos v)}$ — C6.1’s result, now from the tensor. ${c < 0 ? 'On the inner half of the torus the component is negative, like K.' : 'On the outer half it is positive, like K.'}`,
        };
      },
    }),
    num({
      id: 'stereo-component', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 1.5, 2]), [X, Y] = r.pick([[0.5, 0.5], [1, 0], [0.4, -0.8], [-1, 0.5], [0.3, 0]]);
        const q = 1 + X * X + Y * Y, lam2 = (4 * a * a) / (q * q), key = (lam2 * lam2) / (a * a);
        return {
          prompt: t`The same sphere of radius $a = ${a}$ on its stereographic chart has $ds^2 = \lambda^2(dX^2 + dY^2)$ with $\lambda^2 = \dfrac{4a^2}{(1 + X^2 + Y^2)^2}$. Using $R_{abcd} = K(g_{ac}g_{bd} - g_{ad}g_{bc})$, find $R_{XYXY}$ at $(X, Y) = (${X}, ${Y})$.`,
          visual: { type: 'dg4-chart', params: { metric: 'stereo', k: a, mode: 'chart', P: [X, Y], drag: false, readout: false, field: true }, caption: 'The stereographic chart with the point P; ellipses (here circles: the chart is conformal) mark steps of one fixed length.' },
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: 1 / (a * a), feedback: t`That is $K$. The component is $K$ times $g_{XX}g_{YY} - g_{XY}^2 = \lambda^4$.` },
            { value: lam2 / (a * a), feedback: t`$g_{XX}g_{YY} = \lambda^2\cdot\lambda^2 = \lambda^4$, not $\lambda^2$.` },
            { value: a * a * Math.sin(2 * Math.atan(Math.hypot(X, Y))) ** 2, feedback: t`$a^2\sin^2\theta$ is the component on the $(\theta, \varphi)$ chart. Components belong to a chart: on this one, use $\lambda^4K$.` },
          ].filter((x) => Math.abs(x.value - key) > 0.02 * key),
          hints: [t`With $a = X$, $b = Y$, $c = X$, $d = Y$: $R_{XYXY} = K(g_{XX}g_{YY} - g_{XY}^2)$.`, t`$g_{XX} = g_{YY} = \lambda^2 = ${nice(lam2, 4)}$, $g_{XY} = 0$, $K = 1/a^2$.`],
          teach: 'The same surface has different Riemann components in different charts; K = R₁₂₁₂/det g is the chart-free number.',
          explain: t`$R_{XYXY} = \lambda^4/a^2 = \dfrac{16a^2}{(1 + X^2 + Y^2)^4} = ${nice(key, 4)}$. On the $(\theta, \varphi)$ chart the same point has $R_{\theta\varphi\theta\varphi} = a^2\sin^2\theta$ — a different number, because $\partial_X$ and $\partial_\theta$ are different vectors. Dividing either by its chart’s $\det g$ gives the same $K = ${nice(1 / (a * a), 4)}$.`,
        };
      },
    }),
    num({
      id: 'equal-area', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 5, 6371]), zf = r.pick([0.2, 0.5, 0.8]);
        const z = +(zf * a).toFixed(a > 100 ? 0 : 2);
        return {
          prompt: t`Archimedes’ hat-box theorem uses the height $z$ as a coordinate on a sphere of radius $a$: with $(z, \varphi)$, $$ds^2 = \frac{a^2}{a^2 - z^2}\,dz^2 + (a^2 - z^2)\,d\varphi^2.$$ For $a = ${a}$ m, find $R_{z\varphi z\varphi}$ at height $z = ${z}$ m. (On this chart it is a pure number: $z$ is a length and $\varphi$ an angle.)`,
          visual: sphere3d([-0.8, -0.4, 0, 0.4, 0.8], 'Circles of latitude equally spaced in height z: each band between neighbours has the same area (Archimedes), because det g = a² is the same everywhere on this chart.'),
          answer: 1, tol: { rel: 0, abs: 0.005 },
          errors: [
            { value: 1 / (a * a), feedback: t`That is $K$. Multiply by $\det g$.` },
            { value: a * a, feedback: t`That is $\det g = \dfrac{a^2}{a^2 - z^2}(a^2 - z^2) = a^2$. Now multiply by $K = 1/a^2$.` },
            { value: a * a - z * z, feedback: t`$g_{\varphi\varphi}$ alone is not the factor: $R_{z\varphi z\varphi} = K(g_{zz}g_{\varphi\varphi} - g_{z\varphi}^2)$.` },
          ].filter((x) => Math.abs(x.value - 1) > 0.02),
          hints: [t`$R_{z\varphi z\varphi} = K\det g$ with $K = 1/a^2$.`, t`$\det g = \dfrac{a^2}{a^2 - z^2}\cdot(a^2 - z^2)$.`],
          teach: 'On a chart with constant det g, the single Riemann component of a sphere is constant too.',
          explain: t`$\det g = a^2$ for every $z$, so $R_{z\varphi z\varphi} = a^2/a^2 = 1$ — the same at every point, for every radius. That constant $\det g$ is Archimedes’ theorem: the area element $\sqrt{\det g}\,dz\,d\varphi = a\,dz\,d\varphi$ makes equal heights cut equal areas. The chart, not the sphere, decides what a component looks like.`,
        };
      },
    }),
    mcq({
      id: 'which-minus', difficulty: 2,
      prompt: t`With $R_{\theta\varphi\theta\varphi} = a^2\sin^2\theta$ on the sphere, which component equals $-a^2\sin^2\theta$?`,
      visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'transport', P: [1.0, 0.9], Q: [2.2, 1.6], drag: false, readout: false, field: true, angle: 30, sliders: [] }, caption: 'Two routes round a rectangle: going round the loop the other way reverses the turn — the antisymmetry of R in its last two slots.' },
      choices: [t`$R_{\theta\varphi\varphi\theta}$`, t`$R_{\varphi\theta\varphi\theta}$`, t`$R_{\theta\theta\varphi\varphi}$`, t`$R^\theta{}_{\varphi\theta\varphi}$`],
      answer: 0,
      why: {
        1: t`Swapping both pairs’ entries is two sign changes: $R_{\varphi\theta\varphi\theta} = +a^2\sin^2\theta$.`,
        2: t`A repeated index inside an antisymmetric pair gives zero: $R_{\theta\theta\varphi\varphi} = 0$.`,
        3: t`Raising the first index divides by $g_{\theta\theta} = a^2$: $R^\theta{}_{\varphi\theta\varphi} = +\sin^2\theta$.`,
      },
      hints: ['Swapping the last two indices reverses the loop.'],
      teach: 'Riemann is antisymmetric in each index pair: one swap flips the sign, two swaps restore it.',
      explain: t`$R_{\theta\varphi\varphi\theta} = -R_{\theta\varphi\theta\varphi}$: the last pair names the loop, and swapping it runs the loop backwards, reversing the turn. $R_{\varphi\theta\theta\varphi}$ is the other negative one.`,
    }),
    order({
      id: 'k-formula', difficulty: 3,
      prompt: t`Show that on any surface $R_{abcd} = K(g_{ac}g_{bd} - g_{ad}g_{bc})$ with $K = R_{1212}/\det g$. Order the argument.`,
      visual: { type: 'dg4-chart', params: { metric: 'torus', mode: 'chart', P: [1.0, 0.8], drag: false, readout: ['g', 'K'], field: true }, caption: 'The torus chart: whatever g looks like at P, one number K fixes all sixteen Riemann components there.' },
      items: [
        t`In two dimensions an antisymmetric pair can only be $12$ or $21$, so every component is $\pm R_{1212}$ or zero.`,
        t`The tensor $T_{abcd} = g_{ac}g_{bd} - g_{ad}g_{bc}$ has the same symmetries, and $T_{1212} = g_{11}g_{22} - g_{12}^2 = \det g \ne 0$.`,
        t`Two tensors with these symmetries in 2D are each fixed by their $1212$ component, so $R_{abcd}$ is a multiple of $T_{abcd}$.`,
        t`Setting $abcd = 1212$ gives the multiple: $R_{1212} = K\det g$.`,
      ],
      hints: ['Start from what the symmetries leave in two dimensions.', 'Build a second tensor with the same symmetries out of the metric.'],
      teach: 'In 2D, Riemann has one independent component, so it is K times the only tensor with its symmetries built from g.',
      explain: t`This is why one number, $K$, is all the curvature a surface has, and why $K = R_{1212}/\det g$ is the same in every chart: both sides transform the same way. In three or more dimensions the argument breaks at the first step — there are several independent pairs.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lunar-map', difficulty: 3, transfer: true,
      gen(r) {
        const Rm = 1737.4, [x, y] = r.pick([[400, 150], [-450, 220], [600, 0], [-200, -500], [700, -300]]);
        const rho2 = x * x + y * y, f = 1 + rho2 / (4 * Rm * Rm), key = 1 / (Rm * Rm * f ** 4);
        return {
          prompt: t`Lunar south-pole maps (such as those made from the Lunar Orbiter Laser Altimeter) use a polar stereographic projection. In map coordinates $(x, y)$ in km, with the pole at the origin, the Moon (a sphere of radius $R = 1737.4$ km) has $$ds^2 = \frac{dx^2 + dy^2}{\big(1 + (x^2 + y^2)/4R^2\big)^2}.$$ Find $R_{xyxy}$ at the map point $(${x}, ${y})$ km, in $\text{km}^{-2}$.`,
          visual: { type: 'dg4-chart', params: { metric: 'stereo', mode: 'chart', P: [+(x / (2 * Rm)).toFixed(4), +(y / (2 * Rm)).toFixed(4)], drag: false, readout: false, field: true, view: { a: [-0.5, 0.5], b: [-0.32, 0.32] } }, caption: 'A polar stereographic chart near the pole (drawn in units of 2R); circles mark steps of one fixed length, slightly smaller away from the pole.' },
          answer: key, units: 'km^-2', tol: { rel: 0.005 },
          errors: [
            { value: 1 / (Rm * Rm), feedback: t`That is $K = 1/R^2$; multiply by $\det g$, which is a little less than 1 away from the pole.` },
            { value: 1 / (Rm * Rm * f ** 2), feedback: t`$\det g = g_{xx}g_{yy} = \big(1 + \rho^2/4R^2\big)^{-4}$: each $g$ carries the square.` },
          ].filter((e) => Math.abs(e.value - key) > 0.03 * key),
          hints: [t`$R_{xyxy} = K\det g$ with $K = 1/R^2$.`, t`$g_{xx} = g_{yy} = (1 + \rho^2/4R^2)^{-2}$ with $\rho^2 = x^2 + y^2 = ${rho2}\ \text{km}^2$, so $\det g = (1 + \rho^2/4R^2)^{-4}$.`],
          teach: 'A map’s Riemann component is K times its det g: the projection changes the component, not the Moon.',
          explain: t`$1 + \rho^2/4R^2 = ${nice(f, 5)}$, so $R_{xyxy} = \dfrac{1}{R^2}\times${nice(f, 5)}^{-4} = ${tex(key, 4)}\ \text{km}^{-2}$, against $K = ${tex(1 / (Rm * Rm), 4)}\ \text{km}^{-2}$. Near the pole the projection is almost true to scale, so the two nearly agree; farther out the map stretches distances and the component shrinks with it.`,
        };
      },
    }),
    mcq({
      id: 'cp-schwarzschild-sphere', difficulty: 3, transfer: true,
      prompt: t`Outside a star (Schwarzschild, $G = c = 1$), the sphere $t = \text{const}$, $r = \text{const}$ has induced metric $r^2(d\theta^2 + \sin^2\theta\,d\varphi^2)$, so its own $R_{\theta\varphi\theta\varphi} = r^2\sin^2\theta$. Yet the spacetime’s Riemann tensor has $R_{\theta\varphi\theta\varphi} = 2Mr\sin^2\theta$. Why do they differ?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, spheres: [{ centre: [0, 0, 0], radius: 0.6, color: 'warn' }, { centre: [0, 0, 0], radius: 1.1, color: 'teal' }], points: [{ at: [0, 0, 0], color: 'warn', label: '\\text{star}' }] }, caption: 'A round sphere of fixed r around a star (teal), drawn in ordinary space for orientation only; the geometry is curved in ways a 3D picture cannot show.' },
      choices: [
        t`The sphere is also bent inside the curved space around it; the spacetime’s component includes that bending (the Gauss equation), the sphere’s own does not`,
        t`They use different coordinates, so their components cannot be compared`,
        t`The spacetime’s component includes time dilation, which a sphere of fixed $t$ cannot feel`,
        t`One of them is wrong: a component is a component`,
      ],
      answer: 0,
      why: {
        1: t`Both use the same $\theta$ and $\varphi$ on the same sphere, so the comparison is fair.`,
        2: t`The $\theta\varphi$ components involve no time direction; the difference is how the sphere sits in space, not how clocks run.`,
        3: t`They are components of two different tensors: the sphere’s own Riemann tensor and the surrounding spacetime’s.`,
      },
      hints: [t`C5.4 separated a surface’s intrinsic curvature from how it bends inside its surroundings.`, t`For a surface in a curved space: its own curvature = the space’s sectional curvature in that plane + a term from its extrinsic bending.`],
      teach: 'A surface’s own Riemann tensor and the surrounding space’s Riemann tensor in the surface’s plane differ by its extrinsic bending (the Gauss equation).',
      explain: t`Divide each by its $\det g = r^4\sin^2\theta$: the sphere’s own curvature is $1/r^2$, the spacetime’s sectional curvature in the $\theta\varphi$ plane is $2M/r^3$. The Gauss equation links them: $1/r^2 = 2M/r^3 + (1 - 2M/r)/r^2$, the last term coming from the sphere’s bending inside space (its extrinsic curvature, $\sqrt{1 - 2M/r}/r$ in each direction). Far away $M/r \to 0$: space is flat and all the sphere’s curvature is bending.`,
    }),
    num({
      id: 'cp-disk', difficulty: 3,
      gen(r) {
        const [x, y] = r.pick([[0.3, 0.2], [0.5, 0], [0, -0.6], [-0.4, 0.4], [0.2, -0.3]]);
        const q = 1 - x * x - y * y, lam2 = 4 / (q * q), key = -(lam2 * lam2);
        return {
          prompt: t`The Poincaré disk is the hyperbolic plane on the unit disk: $ds^2 = \dfrac{4(dx^2 + dy^2)}{(1 - x^2 - y^2)^2}$, with $K = -1$ everywhere. Find $R_{xyxy}$ at $(x, y) = (${x}, ${y})$.`,
          visual: {
            type: 'graph',
            params: { x: [-1.3, 1.3], y: [-1.1, 1.1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 2 }, { param: ['0.5*cos(t)', '0.5*sin(t)'], t: [0, 2 * Math.PI], color: 'teal', width: 1, dash: [4, 4] }, { param: ['0.8*cos(t)', '0.8*sin(t)'], t: [0, 2 * Math.PI], color: 'teal', width: 1, dash: [4, 4] }],
              points: [{ x, y, label: 'P', color: 'accent', r: 5 }] },
            caption: 'The whole hyperbolic plane drawn inside the unit circle, which is infinitely far away. On the dashed circles (radius 0.5 and 0.8) the metric stretches a chart step 2.7 and 5.6 times.',
          },
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: -key, feedback: t`$K = -1$, so the component is negative: $R_{xyxy} = K\det g = -\lambda^4$.` },
            { value: -lam2, feedback: t`$\det g = \lambda^2\cdot\lambda^2 = \lambda^4$, with $\lambda^2 = 4/(1 - x^2 - y^2)^2$.` },
            { value: -1, feedback: t`$-1$ is $K$. Multiply by $\det g$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`$R_{xyxy} = K\det g$.`, t`$g_{xx} = g_{yy} = \lambda^2 = \dfrac{4}{(1 - x^2 - y^2)^2} = ${nice(lam2, 4)}$.`],
          teach: 'Constant negative curvature: the single Riemann component is −det g, growing without bound toward the disk’s edge.',
          explain: t`$R_{xyxy} = -\lambda^4 = -${nice(lam2, 4)}^2 = ${nice(key, 4)}$. The components blow up toward the rim, where the chart squeezes an infinite plane into a finite disk; $K = -1$ stays put. Compare the stereographic sphere, $+16a^2/(1 + X^2 + Y^2)^4$: the same shape of formula with the opposite sign of curvature.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6 and §3.9 (the 2-sphere)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-3 (Gauss formula for K)', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Smith et al. 2010, The Lunar Orbiter Laser Altimeter investigation, Space Sci. Rev. 150, 209 (polar stereographic products)', url: 'https://doi.org/10.1007/s11214-009-9512-y' },
  ],
});
