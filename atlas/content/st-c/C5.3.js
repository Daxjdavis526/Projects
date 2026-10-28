// Gaussian and mean curvature: K = κ1κ2 = (LN − M²)/(EG − F²) and
// H = (κ1 + κ2)/2; elliptic, hyperbolic, parabolic and planar points; K as
// the area ratio of the Gauss map; minimal surfaces (H = 0); Laplace pressure.
import { lesson, mcq, multi, num, expr, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, mesh } from './_dg.js';
import { torus, forms } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);

// Explore surfaces on the unit square of sliders (a, b): X, K and H as expression builders.
const EX = [
  { U: [0, TAU], V: [0, TAU], cu: true, cv: true, nu: 16, nv: 10, // torus R = 2, r = 0.8
    X: (u, v) => [`(2 + 0.8*cos(${v}))*cos(${u})`, `(2 + 0.8*cos(${v}))*sin(${u})`, `0.8*sin(${v})`],
    K: (u, v) => `cos(${v})/(0.8*(2 + 0.8*cos(${v})))`, H: (u, v) => `-(2 + 1.6*cos(${v}))/(1.6*(2 + 0.8*cos(${v})))` },
  { U: [0, TAU], V: [-1.4, 1.4], cu: true, nu: 16, nv: 8, // catenoid c = 1
    X: (u, v) => [`cosh(${v})*cos(${u})`, `cosh(${v})*sin(${u})`, `${v}`],
    K: (u, v) => `-1/cosh(${v})^4`, H: () => '0' },
  { U: [-2, 2], V: [-3.1416, 3.1416], nu: 8, nv: 14, // helicoid (u cos v, u sin v, 0.4v)
    X: (u, v) => [`${u}*cos(${v})`, `${u}*sin(${v})`, `0.4*${v}`],
    K: (u) => `-0.16/(${u}^2 + 0.16)^2`, H: () => '0' },
  { U: [-2, 2], V: [-2, 2], nu: 8, nv: 8, // saddle z = uv/2
    X: (u, v) => [`${u}`, `${v}`, `0.5*${u}*${v}`],
    K: (u, v) => `-0.25/(1 + 0.25*(${u}^2 + ${v}^2))^2`, H: (u, v) => `-0.125*${u}*${v}/(1 + 0.25*(${u}^2 + ${v}^2))^1.5` },
];
const W = (k) => `step(0.5 - abs(s - ${k}))`;
const UA = (S) => `(${S.U[0]} + ${r6(S.U[1] - S.U[0])}*a)`, VB = (S) => `(${S.V[0]} + ${r6(S.V[1] - S.V[0])}*b)`;
const sumOf = (f) => EX.map((S, k) => `${W(k)}*(${S[f](UA(S), VB(S))})`).join(' + ');
const Kx = sumOf('K'), Hx = sumOf('H');

const TOR = (R, r) => [`(${R} + ${r}*cos(v))*cos(u)`, `(${R} + ${r}*cos(v))*sin(u)`, `${r}*sin(v)`];

export default lesson({
  id: 'st-c.C5.3',
  title: 'Gaussian and mean curvature',
  minutes: 13, difficulty: 3,
  equation: t`K = \kappa_1\kappa_2 = \frac{LN - M^2}{EG - F^2}`,
  intro: t`Two combinations of the principal curvatures summarize a surface’s bending at a point. The **Gaussian curvature** $K$ (above) is their product — the determinant of the shape operator, which is why it is the ratio of the determinants of $\mathrm{II}$ and $\mathrm I$. The **mean curvature** is their average — half its trace:

$$H = \frac{\kappa_1 + \kappa_2}{2} = \frac{EN - 2FM + GL}{2(EG - F^2)}.$$

The sign of $K$ sorts points: $K > 0$ **elliptic** (the surface lies on one side of its tangent plane, like a sphere), $K < 0$ **hyperbolic** (a saddle, cut by its tangent plane), $K = 0$ **parabolic** or planar (a cylinder, a plane). Gauss’s own picture: carry each unit normal to the centre of a unit sphere; a small patch of area $A$ sends its normals over an area $|K|\,A$ of that sphere. Flipping $\mathbf n$ flips both $\kappa$s, so **$K$ does not care which normal you chose, and $H$ does**.`,
  symbols: [
    { tex: 'K', text: t`the Gaussian curvature, in $\text{m}^{-2}$: $1/a^2$ on a sphere of radius $a$, 0 on a cylinder, negative on a saddle` },
    { tex: 'H', text: t`the mean curvature, in $\text{m}^{-1}$; its sign depends on the choice of $\mathbf n$ (some books omit the $\tfrac12$)` },
    { tex: t`\kappa_1,\ \kappa_2`, text: 'the principal curvatures (C5.2)' },
    { tex: 'L,\\ M,\\ N', text: 'the second fundamental form (C5.1)' },
    { tex: 'E,\\ F,\\ G', text: 'the first fundamental form (C4.1)' },
  ],
  why: t`$K$ is about to become the hero: C6.1 proves it can be computed from $E$, $F$, $G$ alone, so it is curvature an inhabitant can measure. $H$ is about how a surface sits in space: soap films, membranes and droplets are governed by it.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Curvature, point by point',
    lead: t`Pick a surface and move the point $p$. The readouts give the principal curvatures and their product $K$ and mean $H$ at $p$.`,
    tasks: [
      t`Torus: on the outer equator $K = 1/(0.8 \times 2.8) = 0.446 > 0$; on the inner one $K = -1/(0.8 \times 1.2) = -1.04$. On the top and bottom circles ($v = \pi/2$, slider $b = 0.25$) $K = 0$.`,
      t`Catenoid and helicoid: $H = 0$ everywhere — the two principal curvatures are always equal and opposite. They are **minimal surfaces**.`,
      t`Saddle: $K < 0$ everywhere, strongest at the centre; $H$ is zero only along the two axes.`,
    ],
    params: {
      range: 2.8, grid: false,
      choices: [{ key: 's', label: 'Surface', options: [[0, 'torus'], [1, 'catenoid'], [2, 'helicoid'], [3, 'saddle']], value: 0, explain: 'Each with the normal X_u × X_v of its own coordinates.' }],
      sliders: [
        { key: 'a', label: '$u$ (scaled to 0–1)', min: 0, max: 1, step: 0.005, value: 0.1, explain: 'Moves the point along a v-curve.' },
        { key: 'b', label: '$v$ (scaled to 0–1)', min: 0, max: 1, step: 0.005, value: 0, explain: 'Moves the point along a u-curve.' },
      ],
      curves: EX.flatMap((S, k) => mesh(S.X, S.U, S.V, { nu: S.nu, nv: S.nv, closedU: !!S.cu, closedV: !!S.cv, color: 'ink3', width: 1, when: W(k) })),
      points: EX.map((S, k) => ({ at: S.X(UA(S), VB(S)), color: 'gold', label: 'p', when: W(k) })),
      readouts: [
        { label: t`$\kappa_1$`, expr: `(${Hx}) + sqrt(max(0, (${Hx})^2 - (${Kx})))`, digits: 3 },
        { label: t`$\kappa_2$`, expr: `(${Hx}) - sqrt(max(0, (${Hx})^2 - (${Kx})))`, digits: 3 },
        { label: '$K$', expr: Kx, digits: 3 },
        { label: '$H$', expr: Hx, digits: 3 },
      ],
    },
    caption: t`Torus $R = 2$, $r = 0.8$; catenoid $(\cosh v\cos u,\ \cosh v\sin u,\ v)$; helicoid $(u\cos v,\ u\sin v,\ 0.4v)$; saddle $(u, v, uv/2)$. Curvatures in units of the drawing’s length$^{-1}$; the torus’s normal points out of the tube, so its $\kappa$s and $H$ are negative outside.`,
  },
  example: {
    prompt: t`Find $K$ and $H$ for the torus $\big((R + r\cos v)\cos u,\ (R + r\cos v)\sin u,\ r\sin v\big)$, and say where it is elliptic, hyperbolic and parabolic.`,
    visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: 0.6, controls: false, readout: false }, caption: 'A torus coloured by its Gaussian curvature: gold where K > 0, teal where K = 0, blue where K < 0. (Drawn with R = 2, r = 1.)' },
    steps: [
      { label: 'The two forms', text: t`From C4.1 and C5.1: $E = (R + r\cos v)^2$, $F = 0$, $G = r^2$; $L = -(R + r\cos v)\cos v$, $M = 0$, $N = -r$.` },
      { label: 'Gaussian curvature', text: t`$K = \dfrac{LN - M^2}{EG - F^2} = \dfrac{r(R + r\cos v)\cos v}{r^2(R + r\cos v)^2} = \dfrac{\cos v}{r(R + r\cos v)}$.` },
      { label: 'Mean curvature', text: t`$H = \dfrac{EN + GL}{2EG} = -\dfrac{R + 2r\cos v}{2r(R + r\cos v)}$ (with the outward normal).` },
      { label: 'Classify', text: t`$K > 0$ on the outer half ($\cos v > 0$): elliptic, sphere-like. $K < 0$ on the inner half: hyperbolic, saddle-like. $K = 0$ on the top and bottom circles ($v = \pm\pi/2$): parabolic, where the tangent plane touches along the whole circle (C3.3).` },
      { label: 'Numbers', text: t`For $R = 2$, $r = 1$: $K$ runs from $1/3$ on the outer equator to $-1$ on the inner one.` },
    ],
    answer: t`$K = \cos v/\big(r(R + r\cos v)\big)$ and $H = -(R + 2r\cos v)/\big(2r(R + r\cos v)\big)$; elliptic outside, hyperbolic inside, parabolic on the top and bottom circles.`,
  },
  practice: [
    match({
      id: 'types', difficulty: 1,
      prompt: 'Match each kind of point to an example.',
      left: [t`elliptic, $K > 0$`, t`hyperbolic, $K < 0$`, t`parabolic, $K = 0$ but $H \ne 0$`, t`planar, $\kappa_1 = \kappa_2 = 0$`],
      right: ['any point of a sphere', 'the centre of a saddle', 'any point of a cylinder', 'any point of a plane', 'the inner equator of a torus'],
      answer: [0, 1, 2, 3],
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', surfaces: ['sphere', 'torus', 'cylinder', 'catenoid'], v: 0.6, readout: false }, caption: 'Surfaces coloured by K: gold positive, teal zero, blue negative.' },
      hints: [t`$K = \kappa_1\kappa_2$: a product is positive when both factors have the same sign, negative when they differ, zero when one vanishes.`],
      teach: 'The sign of K classifies a point: same-sign principal curvatures (elliptic), opposite (hyperbolic), one zero (parabolic).',
      explain: t`Sphere: $\kappa_1 = \kappa_2 = \mp1/a$. Saddle centre: $\pm1$. Cylinder: $-1/a$ and $0$. Plane: both zero. The torus’s inner equator is hyperbolic too — but the saddle was the better match.`,
    }),
    num({
      id: 'K-numbers', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 2, 4]), F = r.pick([0.5, 1, -1]), G = r.pick([2, 3]), L = r.pick([1, 2, -2]), M = r.pick([0.5, 1]), N = r.pick([1, 3, -1]);
        const K = (L * N - M * M) / (E * G - F * F);
        return {
          prompt: t`At a point of a surface, $E = ${E}$, $F = ${F}$, $G = ${G}$ and $L = ${L}$, $M = ${M}$, $N = ${N}$. What is the Gaussian curvature $K$ there?`,
          visual: { type: 'surface3d', params: { z: `0.5*(${L}*x^2 + 2*${M}*x*y + ${N}*y^2)`, domain: [[-1, 1], [-1, 1]], zscale: 0.5, alpha: 0.65, pitch: 0.35, yaw: -0.6, dist: 5.5 }, caption: t`A sketch of the surface near the point: the paraboloid with second fundamental form $L$, $M$, $N$ (heights scaled by 0.5; the metric here is not drawn).` },
          answer: K, tol: { rel: 0.01, abs: 0.001 },
          errors: [{ value: (L * N) / (E * G), feedback: t`Keep the cross terms: $K = (LN - M^2)/(EG - F^2)$.` }, { value: L * N - M * M, feedback: t`Divide by $EG - F^2$: $K$ is the determinant of $\mathrm I^{-1}\mathrm{II}$, not of $\mathrm{II}$.` }].filter((e) => Math.abs(e.value - K) > 0.03 * Math.abs(K) + 0.005),
          hints: [t`$K = \det(\mathrm I^{-1}\mathrm{II}) = \det\mathrm{II}/\det\mathrm I$.`, t`$LN - M^2 = ${nice(L * N - M * M)}$ and $EG - F^2 = ${nice(E * G - F * F)}$.`],
          teach: t`$K = (LN - M^2)/(EG - F^2)$: the determinant of the shape operator.`,
          explain: t`$K = ${nice(L * N - M * M)}/${nice(E * G - F * F)} = ${nice(K, 4)}$: ${K > 0 ? 'an elliptic point.' : K < 0 ? 'a hyperbolic (saddle) point.' : 'a parabolic point.'}`,
        };
      },
    }),
    num({
      id: 'saddle-K', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2]), x = r.pick([0.5, 1, 1.5]), y = r.pick([0, 0.5, 1]);
        const K = -(k * k) / (1 + k * k * (x * x + y * y)) ** 2;
        return {
          prompt: t`The saddle $z = ${k === 1 ? '' : k}xy$ has $K = -\dfrac{${k * k}}{\big(1 + ${k * k === 1 ? '' : k * k}(x^2 + y^2)\big)^2}$. What is $K$ at $(x, y) = (${x}, ${y})$, and how does it compare with the centre?`,
          visual: { type: 'surface3d', params: { z: `${k}*x*y`, domain: [[-2, 2], [-2, 2]], zscale: r6(0.4 / k), alpha: 0.6, pitch: 0.4, yaw: -0.8, dist: 8.5, curves: [{ param: [`${x} + 0.15*cos(t)`, `${y} + 0.15*sin(t)`, `${k}*(${x} + 0.15*cos(t))*(${y} + 0.15*sin(t))`], t: [0, TAU], color: 'gold', width: 3 }] }, caption: 'The saddle (heights scaled), with a small gold ring around the point.' },
          answer: K, tol: { rel: 0.01 },
          errors: [{ value: -(k * k), feedback: t`That is the value at the centre. Away from it the denominator grows: the saddle flattens.` }, { value: -(k * k) / (1 + k * k * (x * x + y * y)), feedback: 'Square the denominator.' }].filter((e) => Math.abs(e.value - K) > 0.02 * Math.abs(K)),
          hints: [t`$x^2 + y^2 = ${nice(x * x + y * y)}$.`],
          teach: t`The saddle $z = kxy$ is most curved at its centre, $K = -k^2$, and flattens outward.`,
          explain: t`$K = -${k * k}/(1 + ${nice(k * k * (x * x + y * y))})^2 = ${nice(K, 4)}$, compared with $-${k * k}$ at the centre. Far out the saddle becomes almost flat — its normals hardly change direction there.`,
        };
      },
    }),
    num({
      id: 'catenoid-K', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2, 3]), v = r.pick([0, 0.5, 1]) * c;
        const K = -1 / (c * c * Math.cosh(v / c) ** 4);
        return {
          prompt: t`A soap-film catenoid has neck radius $c = ${c}$ cm: $\mathbf X = \big(${c}\cosh(v/${c})\cos u,\ ${c}\cosh(v/${c})\sin u,\ v\big)$, with $E = ${c * c}\cosh^2(v/${c})$, $G = \cosh^2(v/${c})$, $F = 0$ and $L = -${c}$, $M = 0$, $N = 1/${c}$. What is its Gaussian curvature at height $v = ${nice(v)}$ cm, in $\text{cm}^{-2}$?`,
          visual: { type: 'surface3d', params: { surface: [`${c}*cosh(v/${c})*cos(u)`, `${c}*cosh(v/${c})*sin(u)`, 'v'], domain: [[0, TAU], [-1.3 * c, 1.3 * c]], alpha: 0.65, pitch: 0.2, dist: r6(8 * c), axes: false, curves: [{ param: [`${r6(c * Math.cosh(v / c))}*cos(t)`, `${r6(c * Math.cosh(v / c))}*sin(t)`, `${nice(v)}`], t: [0, TAU], color: 'gold', width: 3 }] }, caption: t`The catenoid with the circle at height $v = ${nice(v)}$ cm (gold).` },
          answer: K, units: 'cm^-2', tol: { rel: 0.01 },
          errors: [{ value: -1 / (c * c * Math.cosh(v / c) ** 2), feedback: t`$EG = ${c * c}\cosh^4(v/${c})$: the fourth power, not the second.` }, { value: -1, feedback: t`$LN - M^2 = -1$, but you still divide by $EG$.` }].filter((e) => Math.abs(e.value - K) > 0.02 * Math.abs(K)),
          hints: [t`$LN - M^2 = -${c}\cdot\tfrac1{${c}} = -1$.`, t`$EG - F^2 = ${c * c}\cosh^4(v/${c})$.`],
          teach: 'K = (LN − M²)/(EG − F²) works in any coordinates; on the catenoid it is −1/(c² cosh⁴(v/c)).',
          explain: t`$K = -1/\big(${c * c}\cosh^4(${nice(v / c)})\big) = ${nice(K, 4)}\ \text{cm}^{-2}$, most negative at the neck. And $H = (EN + GL)/(2EG) = (${c}\cosh^2 - ${c}\cosh^2)/(\ldots) = 0$: a soap film has zero mean curvature, because the pressure is the same on both sides.`,
        };
      },
    }),
    mcq({
      id: 'flip', difficulty: 2,
      prompt: t`You flip the unit normal, $\mathbf n \to -\mathbf n$. What happens to $K$ and $H$?`,
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'cylinder', controls: false, readout: false }, caption: 'A cylinder: bent one way only, so K = 0 whichever normal you choose, while H = ±1/(2a).' },
      choices: [t`$K$ is unchanged; $H$ changes sign`, t`Both change sign`, t`$K$ changes sign; $H$ is unchanged`, 'Neither changes'],
      answer: 0,
      why: {
        1: t`$K = \kappa_1\kappa_2$: two sign changes cancel.`,
        2: t`The other way round: $K$ is a product of two flipped numbers, $H$ an average of them.`,
        3: t`$H$ is the average of two numbers that both change sign.`,
      },
      hints: [t`Both principal curvatures change sign. What happens to their product and their mean?`],
      teach: 'Reversing the normal flips both principal curvatures: K, their product, is unchanged and H, their mean, flips.',
      explain: t`$(-\kappa_1)(-\kappa_2) = \kappa_1\kappa_2$ and $\tfrac12(-\kappa_1 - \kappa_2) = -H$. That $K$ ignores the choice of normal is the first hint that it is not really about the normal at all (C6.1).`,
    }),
    expr({
      id: 'graph-K', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, -1, -2]);
        const ans = `${4 * k}/(1 + 4x^2 + ${4 * k * k}y^2)^2`;
        return {
          prompt: t`For a graph $z = f(x, y)$, $K = \dfrac{f_{xx}f_{yy} - f_{xy}^2}{(1 + f_x^2 + f_y^2)^2}$. Find $K(x, y)$ for $z = x^2 ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}y^2$.`,
          visual: { type: 'surface3d', params: { z: `x^2 + ${k}*y^2`, domain: [[-1.2, 1.2], [-1.2, 1.2]], zscale: r6(0.6 / Math.abs(k)), alpha: 0.65, pitch: 0.35, yaw: -0.6, dist: 6 }, caption: t`The surface $z = x^2 ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}y^2$, heights scaled.` },
          answer: ans, answerTeX: t`\dfrac{${4 * k}}{(1 + 4x^2 + ${4 * k * k}y^2)^2}`, vars: { x: [-1.5, 1.5], y: [-1.5, 1.5] }, lhs: 'K',
          errors: [{ answer: `${4 * k}`, feedback: 'That is K at the origin only, where the slopes vanish. Elsewhere divide by (1 + f_x² + f_y²)².'.replace('(1 + f_x² + f_y²)²', '$(1 + f_x^2 + f_y^2)^2$') }, { answer: `${4 * k}/(1 + 4x^2 + ${4 * k * k}y^2)`, feedback: 'Square the denominator.' }],
          hints: [t`$f_x = 2x$, $f_y = ${2 * k}y$, $f_{xx} = 2$, $f_{yy} = ${2 * k}$, $f_{xy} = 0$.`, t`Numerator $2\cdot${2 * k} = ${4 * k}$; denominator $(1 + 4x^2 + ${4 * k * k}y^2)^2$.`],
          teach: t`For a graph, $K = (f_{xx}f_{yy} - f_{xy}^2)/(1 + |\nabla f|^2)^2$: the Hessian determinant, damped by the slope.`,
          explain: t`$K = ${4 * k}/(1 + 4x^2 + ${4 * k * k}y^2)^2$. ${k > 0 ? 'Positive everywhere: an elliptic paraboloid.' : 'Negative everywhere: a hyperbolic paraboloid (saddle).'} The sign is the sign of the Hessian’s determinant — the second-derivative test again.`,
        };
      },
    }),
    multi({
      id: 'minimal', difficulty: 2,
      prompt: t`A **minimal surface** has $H = 0$ at every point — the shape a soap film takes. Which of these are minimal? Select every one.`,
      visual: { type: 'surface3d', params: { surface: ['sinh(v)*cos(u)', 'sinh(v)*sin(u)', 'u'], domain: [[-3.1416, 3.1416], [-1.2, 1.2]], alpha: 0.7, pitch: 0.3, dist: 9 }, caption: 'A helicoid: a soap film on a wire helix with a straight axis takes this shape.' },
      choices: ['A catenoid', 'A helicoid', 'A plane', 'A sphere', t`The saddle $z = xy$`],
      answer: [0, 1, 2],
      why: {
        3: t`Both principal curvatures of a sphere have the same sign: $H = \mp1/a \ne 0$.`,
        4: t`$H = -xy/(1 + x^2 + y^2)^{3/2}$, zero only on the axes. ($z = x^2 - y^2$ is not minimal either; Enneper’s and Scherk’s surfaces are the saddle-shaped minimal surfaces.)`,
      },
      hints: [t`$H = 0$ means $\kappa_1 = -\kappa_2$ everywhere: the surface bends equally up and down at every point.`, 'Use the Explore readouts: which surfaces show H = 0 wherever you put the point?'],
      teach: t`Minimal surfaces have $H = 0$: at every point they bend equally in opposite directions, so $K \le 0$.`,
      explain: t`Catenoid, helicoid and plane. A soap film has equal pressure on both sides, and surface tension pulls with force $\propto H$, so it must have $H = 0$. Since $\kappa_1 = -\kappa_2$, $K = -\kappa_1^2 \le 0$: no minimal surface can bulge like a sphere.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-droplet', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([10, 25, 50]), gam = 0.025;
        const Rd = 1.89 * a, dp = (2 * gam) / (Rd * 1e-6), jet = gam / (a * 1e-6);
        return {
          prompt: t`In a rocket injector a kerosene jet of radius $a = ${a}\ \mu\text{m}$ breaks up into drops of radius about $1.89a$. The pressure inside a liquid surface exceeds the outside by the Young–Laplace law, $\Delta p = \gamma(\kappa_1 + \kappa_2) = 2\gamma H$ (curvatures taken positive toward the liquid), with surface tension $\gamma \approx 0.025\ \text{N/m}$. What is $\Delta p$ inside a drop, in pascals?`,
          visual: { type: 'surface3d', params: { surface: [`${r6(1.89)}*sin(v)*cos(u) + 4`, `${r6(1.89)}*sin(v)*sin(u)`, `${r6(1.89)}*cos(v)`], domain: [[0, TAU], [0.01, 3.13]], alpha: 0.7, pitch: 0.25, dist: 15, axes: false, curves: [0, 1, 2, 3, 4].map((k) => ({ param: [`cos(t)`, `sin(t)`, `${k - 2}*0.9 - 0.6`], t: [0, TAU], color: 'accent', width: 2 })).concat([{ param: ['cos(t)', 'sin(t)', '-2.4'], t: [0, TAU], color: 'accent', width: 2 }]) }, caption: t`A stretch of jet (radius $a$, rings) beside a drop of radius $1.89a$, to scale. Real breakup also makes small satellite drops; 1.89 is Rayleigh’s fastest-growing mode for an inviscid jet.` },
          answer: dp, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: dp / 2, feedback: t`A sphere bends equally both ways: $\kappa_1 + \kappa_2 = 2/R$, not $1/R$.` }, { value: jet, feedback: t`That is the jet’s pressure: a cylinder has $\kappa_1 = 1/a$ and $\kappa_2 = 0$. The question asks about the drop.` }, { value: 2 * dp, feedback: t`$4\gamma/R$ is for a soap bubble, which has two surfaces. A drop has one.` }].filter((e) => Math.abs(e.value - dp) > 0.02 * dp),
          hints: [t`For a sphere of radius $R$: $\kappa_1 = \kappa_2 = 1/R$, so $\Delta p = 2\gamma/R$.`, t`$R = 1.89 \times ${a}\ \mu\text{m} = ${nice(Rd, 4)}\ \mu\text{m} = ${tex(Rd * 1e-6, 3)}$ m.`],
          teach: t`Surface tension pushes with pressure $\gamma(\kappa_1 + \kappa_2) = 2\gamma H$: mean curvature, not Gaussian, is what a liquid surface feels.`,
          explain: t`$\Delta p = 2\times0.025/${tex(Rd * 1e-6, 3)} = ${nice(dp, 3)}$ Pa, against $\gamma/a = ${nice(jet, 3)}$ Pa in the jet. A cylinder ($H = 1/(2a)$) is unstable: it lowers its surface energy by breaking into spheres (the Rayleigh–Plateau instability). Kerosene’s surface tension at room temperature is about 0.023–0.027 N/m.`,
        };
      },
    }),
    num({
      id: 'cp-torus-K', difficulty: 2,
      gen(r) {
        const R = r.pick([3, 4, 6]), rr = r.pick([1, 2]), vdeg = r.pick([0, 60, 120, 180]);
        const fm = forms(torus(R, rr), 0, vdeg * DEG);
        return {
          prompt: t`A toroidal tank has $R = ${R}$ m and $r = ${rr}$ m. Using $K = \cos v/\big(r(R + r\cos v)\big)$, what is its Gaussian curvature at $v = ${vdeg}^\circ$, in $\text{m}^{-2}$?`,
          visual: { type: 'surface3d', params: { surface: TOR(R, rr), domain: [[0, TAU], [0, TAU]], alpha: 0.6, pitch: 0.55, dist: r6(2.7 * (R + rr)), curves: [{ param: [`(${R} + ${rr}*cos(${r6(vdeg * DEG)}))*cos(t)`, `(${R} + ${rr}*cos(${r6(vdeg * DEG)}))*sin(t)`, `${r6(rr * Math.sin(vdeg * DEG))}`], t: [0, TAU], color: 'gold', width: 3 }] }, caption: t`The tank with the circle $v = ${vdeg}^\circ$ (gold).` },
          answer: fm.K, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: 1 / (rr * (R + rr)), feedback: t`That is the outer-equator value ($v = 0$). Put in $\cos ${vdeg}^\circ$.` }, { value: Math.cos(vdeg * DEG) / (rr * R), feedback: t`The denominator has $R + r\cos v$, not $R$.` }].filter((e) => Math.abs(e.value - fm.K) > 0.02 * Math.abs(fm.K)),
          hints: [t`$\cos ${vdeg}^\circ = ${nice(Math.cos(vdeg * DEG), 3)}$ and $R + r\cos v = ${nice(R + rr * Math.cos(vdeg * DEG), 4)}$ m.`],
          teach: 'On a torus K is positive on the outer half, negative on the inner half and zero on the top and bottom circles.',
          explain: t`$K = ${nice(Math.cos(vdeg * DEG), 3)}/(${rr}\times${nice(R + rr * Math.cos(vdeg * DEG), 4)}) = ${nice(fm.K, 4)}\ \text{m}^{-2}$: ${fm.K > 0 ? 'elliptic, on the outer half.' : 'hyperbolic, on the inner half.'} Added up over the whole torus, $\iint K\,dA = 0$ — C6.4 explains why that is forced.`,
        };
      },
    }),
    mcq({
      id: 'cp-gauss-map', difficulty: 3,
      prompt: t`Gauss’s definition: move every unit normal of a small patch to the centre of a unit sphere; $|K|$ is the area its tips cover divided by the patch’s area. Why does a cylinder have $K = 0$ in this picture?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, axes: false, pitch: 0.35, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }], vectors: [-0.6, -0.3, 0, 0.3, 0.6].map((a) => ({ from: [0, 0, 0], to: [r6(Math.cos(a)), r6(Math.sin(a)), 0], color: 'gold' })), curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [-0.6, 0.6], color: 'bad', width: 4 }] }, caption: 'The normals of a patch of a vertical cylinder, moved to the centre of the unit sphere: their tips (red) all lie on the equator.' },
      choices: [
        'Its normals are all horizontal, so their tips fill only an arc of the equator — zero area',
        'Its normals do not change at all across the patch',
        'A cylinder has no well-defined normal',
        'The tips cover an area, but it cancels between the two sides',
      ],
      answer: 0,
      why: {
        1: 'They do change — round the cylinder they sweep along the equator — which is why H ≠ 0. They just never leave it.',
        2: 'Every point of a cylinder has a unit normal, pointing straight out from the axis.',
        3: 'The cylinder’s normals cover an arc, which has no area to cancel. (Signed area does matter elsewhere: on a saddle the image is traversed backwards, and K is negative.)',
      },
      hints: ['Along a ruling the normal stays the same; round the cylinder it turns in a horizontal plane.', 'So where on the unit sphere can the tips of the normals be? What is the area of that set?'],
      teach: 'K is the area-stretch of the Gauss map; a cylinder’s normals sweep only a curve, so K = 0.',
      explain: t`The Gauss map squashes the patch onto a curve: one principal curvature is zero. A sphere of radius $a$ maps a patch of area $A$ onto area $A/a^2$, giving $K = 1/a^2$; a saddle maps it onto an area traced the opposite way round, giving $K < 0$.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §3-2 and §3-3', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §8.1 and ch. 12 (minimal surfaces)', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
