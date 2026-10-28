// Tangent vectors as derivations: on a manifold with no surrounding space, a
// tangent vector at p is a linear map on functions obeying the Leibniz rule.
// In a chart it is V^μ ∂_μ; the ∂_μ depend on the whole chart (what is held
// fixed), and components change with the Jacobian. Polar grids, ∂_x written
// in polar form, ∂_θ growing with r, the "second fundamental confusion", and
// the β-effect of meteorology as a vector acting on a function.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const DEG = Math.PI / 180;

// a polar grid (circles and rays) for graph pictures
const polarGrid = (rmax = 4, { rays = 12, color = 'ink4' } = {}) => [
  ...Array.from({ length: rmax }, (_, i) => ({ param: [`${i + 1}*cos(t)`, `${i + 1}*sin(t)`], t: [0, TAU], color, width: 1 })),
  ...Array.from({ length: rays }, (_, k) => ({ param: [`t*${r6(Math.cos((k * TAU) / rays))}`, `t*${r6(Math.sin((k * TAU) / rays))}`], t: [0, rmax], color, width: 1 })),
];
const polarPic = (r, thd, { arrows = [], caption, extra = [], points = [] } = {}) => {
  const th = thd * DEG, x = r6(r * Math.cos(th)), y = r6(r * Math.sin(th));
  return {
    type: 'graph',
    params: { x: [-1, 4.2], y: [-0.6, 3.6], equal: true, aspect: 'wide', grid: false, xticks: 6, yticks: 5, curves: [...polarGrid(4), { param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, r6(Math.PI / 2)], color: 'violet', width: 1.6, dash: [5, 4] }, { param: [`t*${r6(Math.cos(th))}`, `t*${r6(Math.sin(th))}`], t: [0, 4.2], color: 'accent', width: 1.6, dash: [5, 4] }, ...extra], arrows, points: [{ x, y, color: 'ink', label: 'P', labelDx: -16, labelDy: 14 }, ...points] },
    caption,
  };
};

// functions for 'apply V': f, ∂x f, ∂y f (JS) and the Atlas expression for the contour map
const FUNCS = [
  { tex: t`x^2 y`, ex: 'x^2*y', f: (x, y) => x * x * y, fx: (x, y) => 2 * x * y, fy: (x) => x * x },
  { tex: t`x y + y^2`, ex: 'x*y + y^2', f: (x, y) => x * y + y * y, fx: (x, y) => y, fy: (x, y) => x + 2 * y },
  { tex: t`x^2 - 3y`, ex: 'x^2 - 3*y', f: (x, y) => x * x - 3 * y, fx: (x) => 2 * x, fy: () => -3 },
  { tex: t`x^2 + y^2`, ex: 'x^2 + y^2', f: (x, y) => x * x + y * y, fx: (x) => 2 * x, fy: (x, y) => 2 * y },
];

// the explore: P at (r, θ) with the polar and Cartesian coordinate vectors
const PX = 'r0*cos(th*pi/180)', PY = 'r0*sin(th*pi/180)';

export default lesson({
  id: 'st-c.C9.1',
  title: 'Tangent vectors as derivations',
  minutes: 13, difficulty: 3,
  equation: t`V(fg) = f(p)\,V(g) + g(p)\,V(f), \qquad V = V^\mu\,\partial_\mu\big|_p`,
  intro: t`On a surface in $\mathbb R^3$ a tangent vector was an arrow in the tangent plane. A manifold has no surrounding space for arrows to live in, so we keep only what an arrow *does*: it differentiates functions along itself, as in [st-a A2.3](#/lesson/st-a.A2.3). A **tangent vector at $p$** is a map $V$ from smooth functions to numbers that is linear and obeys the **Leibniz rule** above — the product rule, which is what makes it a derivative and not some other operation. The set of them is the **tangent space** $T_pM$, a vector space of the manifold’s dimension.

In a chart $x^\mu$ the partial derivatives $\partial_\mu|_p$ are such derivations, they form a basis, and every $V$ is $V^\mu\partial_\mu$ with components $V^\mu = V(x^\mu)$. Two warnings come with the convenience. $\partial_\mu$ depends on the **whole chart** — it means “change $x^\mu$, holding the other coordinates fixed” — and it is a different vector at every point of a curved grid.`,
  symbols: [
    { tex: 'V', text: t`a tangent vector at the point $p$: it eats a smooth function and returns a number, the rate of change of that function along $V$` },
    { tex: 'f,\\ g', text: 'smooth functions on the manifold (temperatures, potentials, coordinates…)' },
    { tex: 'f(p)', text: t`the value of $f$ at $p$ — just a number` },
    { tex: t`\partial_\mu\big|_p`, text: t`the coordinate basis vectors at $p$: $\partial_\mu f = \partial(f\circ\varphi^{-1})/\partial x^\mu$, differentiation along the $x^\mu$ coordinate line with the other coordinates fixed` },
    { tex: t`V^\mu`, text: t`the components of $V$ in this chart; $V^\mu = V(x^\mu)$, and a sum over $\mu$ is implied` },
  ],
  why: t`Every vector in GR — four-velocities, Killing vectors, the separation between neighbouring geodesics — is a derivation at a point. Defining them this way is what lets $T_pM$ exist without any space around the manifold, and it is why vectors at different points cannot be compared until C12 supplies a connection.`,
  visual: {
    type: 'graph',
    title: 'Coordinate vectors on a changing grid',
    lead: t`A polar grid on the plane. At the point P, blue is $\partial_r$ (step along the ray, $\theta$ fixed) and violet is $\partial_\theta$ (step round the circle, $r$ fixed, drawn per radian). Faint grey arrows are $\partial_x$ and $\partial_y$.`,
    tasks: [
      t`Move P round a circle: $\partial_r$ and $\partial_\theta$ turn with it. In the Cartesian chart $\partial_x$, $\partial_y$ never change. “The same components” mean different vectors at different points of a curved grid.`,
      t`Move P outward: $\partial_\theta$ grows in proportion to $r$, because one radian of $\theta$ is a longer step far out. Its components in the Cartesian basis, $(-r\sin\theta,\ r\cos\theta)$, are read out.`,
      t`Bring P toward the origin: $\partial_\theta$ shrinks to nothing and $\partial_r$ points every which way. The polar chart fails at $r = 0$ — the plane does not.`,
    ],
    params: {
      x: [-1, 4.4], y: [-0.4, 3.6], equal: true, aspect: 'wide', grid: false, xticks: 6, yticks: 5,
      sliders: [
        { key: 'r0', label: t`$r$ at P`, min: 0.1, max: 3, step: 0.05, value: 1.8, explain: 'Distance of P from the origin.' },
        { key: 'th', label: t`$\theta$ at P`, min: 0, max: 90, step: 1, value: 35, unit: t`^\circ`, explain: 'Angle of P from the x-axis.' },
      ],
      curves: [
        ...polarGrid(4),
        { param: ['r0*cos(t)', 'r0*sin(t)'], t: [0, r6(Math.PI / 2)], color: 'violet', width: 1.6, dash: [5, 4] },
        { param: ['t*cos(th*pi/180)', 't*sin(th*pi/180)'], t: [0, 4.4], color: 'accent', width: 1.6, dash: [5, 4] },
      ],
      arrows: [
        { from: [PX, PY], to: [`${PX} + 0.6`, PY], color: 'ink3', width: 1.4, label: '∂x' },
        { from: [PX, PY], to: [PX, `${PY} + 0.6`], color: 'ink3', width: 1.4, label: '∂y' },
        { from: [PX, PY], to: [`${PX} + cos(th*pi/180)`, `${PY} + sin(th*pi/180)`], color: 'accent', width: 2.6, label: '∂r' },
        { from: [PX, PY], to: [`${PX} - r0*sin(th*pi/180)`, `${PY} + r0*cos(th*pi/180)`], color: 'violet', width: 2.6, label: '∂θ' },
      ],
      points: [{ x: PX, y: PY, color: 'ink', label: 'P', labelDx: -16, labelDy: 14 }],
      readouts: [
        { label: t`$\partial_r = (\cos\theta,\ \sin\theta)$: first`, expr: 'cos(th*pi/180)', digits: 3 },
        { label: 'second', expr: 'sin(th*pi/180)', digits: 3 },
        { label: t`$\partial_\theta = (-r\sin\theta,\ r\cos\theta)$: first`, expr: '-r0*sin(th*pi/180)', digits: 3 },
        { label: 'second', expr: 'r0*cos(th*pi/180)', digits: 3 },
      ],
    },
    caption: t`Arrows are drawn to scale in Cartesian units: $\partial_r$ has length 1, $\partial_\theta$ length $r$, and $\partial_x$, $\partial_y$ are drawn at length 0.6. Components are in the basis $\partial_x$, $\partial_y$. Dashed: the two coordinate lines through P.`,
  },
  example: {
    prompt: t`At the point P with polar coordinates $(r, \theta) = (2, 60^\circ)$, write the derivation $V = \partial_x$ in the polar basis, then check it by applying both forms to $f = x^2 + y^2$ and to $g = \theta$.`,
    visual: polarPic(2, 60, { arrows: [{ from: [1, r6(Math.sqrt(3))], to: [2, r6(Math.sqrt(3))], color: 'gold', width: 2.6, label: '∂x' }, { from: [1, r6(Math.sqrt(3))], to: [1.5, r6(Math.sqrt(3) + Math.sqrt(3) / 2)], color: 'accent', width: 1.6, label: '½∂r' }, { from: [1, r6(Math.sqrt(3))], to: [r6(1 + 2 * Math.sin(Math.PI / 3) * 0.433), r6(Math.sqrt(3) - 2 * Math.cos(Math.PI / 3) * 0.433)], color: 'violet', width: 1.6, label: '−0.433∂θ' }], caption: t`$\partial_x$ at P (gold) as the sum of $\tfrac12\partial_r$ (blue) and $-0.433\,\partial_\theta$ (violet).` }),
    steps: [
      { label: 'Components are values', text: t`The polar components of $V$ are what $V$ does to the polar coordinates: $V^r = V(r)$ and $V^\theta = V(\theta)$.` },
      { label: 'Apply to r', text: t`$r = \sqrt{x^2 + y^2}$, so $V(r) = \partial_x r = x/r = \cos\theta = \tfrac12$.` },
      { label: 'Apply to θ', text: t`$\theta = \operatorname{atan2}(y, x)$, so $V(\theta) = \partial_x\theta = -y/r^2 = -\sin\theta/r = -\tfrac{\sqrt3}{4} \approx -0.433$.` },
      { label: 'Assemble', text: t`$\partial_x = \cos\theta\,\partial_r - \dfrac{\sin\theta}{r}\,\partial_\theta = \tfrac12\,\partial_r - 0.433\,\partial_\theta$ at P.` },
      { label: 'Check on f', text: t`Cartesian: $\partial_x(x^2 + y^2) = 2x = 2r\cos\theta = 2$. Polar: $f = r^2$, so $\tfrac12\cdot 2r - 0.433\cdot 0 = r = 2$ ✓.` },
      { label: 'Check on g', text: t`$\partial_x\theta$ in polar form: $\tfrac12\cdot 0 - 0.433\cdot 1 = -0.433$, matching the step above. The derivation is one object; the two charts merely write it differently.` },
    ],
    answer: t`$\partial_x = \tfrac12\,\partial_r - \tfrac{\sqrt3}{4}\,\partial_\theta$ at P; both forms give $\partial_x f = 2$ and $\partial_x\theta = -0.433$.`,
  },
  practice: [
    num({
      id: 'apply-V', difficulty: 1,
      gen(r) {
        const F = r.pick(FUNCS);
        const x0 = r.pick([1, 2, -1]), y0 = r.pick([1, -1, 0.5]), a = r.pick([1, 2, 3, -1]), b = r.pick([1, -2, 0.5, 2]);
        const ans = a * F.fx(x0, y0) + b * F.fy(x0, y0);
        return {
          prompt: t`At $p = (${x0}, ${y0})$ the tangent vector $V = ${a === 1 ? '' : a === -1 ? '-' : a}\partial_x ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\partial_y$ acts on $f = ${F.tex}$. What is $V(f)$?`,
          visual: { type: 'c3-contour', params: { f: F.ex, x: [-4, 4], y: [-2.5, 2.5], levels: 13, labels: false, points: [{ x: x0, y: y0, color: 'ink', label: 'p' }], arrows: [{ from: [x0, y0], to: [r6(x0 + 0.5 * a), r6(y0 + 0.5 * b)], color: 'gold', label: '½V' }] }, caption: t`Level curves of $f$ and the vector $V$ at $p$, drawn at half length.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: F.fx(x0, y0) + F.fy(x0, y0), feedback: t`Weight each partial derivative by its component: $V(f) = V^x\partial_xf + V^y\partial_yf$.` }, { value: a * F.fy(x0, y0) + b * F.fx(x0, y0), feedback: 'Pair the x-component with ∂f/∂x and the y-component with ∂f/∂y.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$V(f) = ${a}\,\partial_xf + (${b})\,\partial_yf$ at $p$.`, t`$\partial_xf = ${nice(F.fx(x0, y0))}$ and $\partial_yf = ${nice(F.fy(x0, y0))}$ at $p$.`],
          teach: t`A tangent vector acts on a function by $V(f) = V^\mu\partial_\mu f$: the rate of change of $f$ along $V$.`,
          explain: t`$V(f) = ${a}\times${nice(F.fx(x0, y0))} + (${b})\times${nice(F.fy(x0, y0))} = ${nice(ans)}$. It is the derivative of $f$ along the curve $p + tV$ at $t = 0$.`,
        };
      },
    }),
    mcq({
      id: 'which-derivation', difficulty: 2,
      prompt: t`Which of these maps, from smooth functions $f$ on the real line to numbers, is a tangent vector at $p = 0$ — linear and obeying $V(fg) = f(0)V(g) + g(0)V(f)$?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-1.2, 2.6], aspect: 'wide', xticks: 5, yticks: 4, curves: [{ fn: '1 + sin(x) + 0.3*x^2', color: 'accent', width: 2.4, label: 'f', labelAt: 1.6 }], tangent: { fn: '1 + sin(x) + 0.3*x^2', at: 0 }, points: [{ x: 0, y: 1, color: 'gold', label: 'f(0)' }] }, caption: 'A function and its tangent line at 0: a derivation at 0 may only use the slope there.' },
      choices: [t`$f \mapsto 3f'(0)$`, t`$f \mapsto f(0)$`, t`$f \mapsto f''(0)$`, t`$f \mapsto f'(0)^2$`],
      answer: 0,
      why: {
        1: t`Evaluation fails Leibniz: $(fg)(0) = f(0)g(0)$, not $f(0)g(0) + g(0)f(0)$. Also a derivation must send constants to 0, and this sends 1 to 1.`,
        2: t`$(fg)'' = f''g + 2f'g' + fg''$: the middle term breaks the Leibniz rule.`,
        3: t`Not linear: doubling $f$ quadruples the output.`,
      },
      hints: ['Test each with f = g = x, or with the constant 1.', 'The product rule is the Leibniz rule.'],
      teach: 'The Leibniz rule picks out first derivatives: every derivation at a point is a multiple of a directional derivative.',
      explain: t`$3f'(0)$ is linear and $(fg)'(0) = f(0)g'(0) + g(0)f'(0)$, scaled by 3: it is the vector $3\,\partial_x|_0$. On $\mathbb R^n$ the derivations at a point are exactly the directional derivatives — a theorem that lets this abstract definition reproduce the arrows you know.`,
    }),
    order({
      id: 'constants', difficulty: 2,
      prompt: t`Show that any derivation $V$ at $p$ gives zero on every constant function $c$. Order the steps.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-0.5, 2], aspect: 'wide', xticks: 5, yticks: 3, curves: [{ fn: '1.4', color: 'accent', width: 2.4, label: 'f = c', labelAt: 1.2 }], points: [{ x: 0, y: 1.4, color: 'gold', label: 'p' }] }, caption: 'A constant function: flat in every direction.' },
      items: [
        t`Leibniz with $f = g = 1$: $V(1\cdot 1) = 1\cdot V(1) + 1\cdot V(1) = 2V(1)$.`,
        t`But $1\cdot 1 = 1$, so the left side is $V(1)$; hence $V(1) = 2V(1)$.`,
        t`Therefore $V(1) = 0$.`,
        t`By linearity $V(c) = V(c\cdot 1) = c\,V(1) = 0$ for every constant $c$.`,
      ],
      hints: ['Feed the Leibniz rule the product 1 · 1.', 'Then use linearity to reach any constant.'],
      teach: 'The Leibniz rule alone forces every derivation to vanish on constants — a derivative of something flat is zero.',
      explain: t`A small result with a big use: it is the first step in proving that $\partial_1, \dots, \partial_n$ span $T_pM$, so that the tangent space has exactly the manifold’s dimension.`,
    }),
    num({
      id: 'polar-comp', difficulty: 2,
      gen(r) {
        const rr = r.pick([1, 2, 3, 1.5]), thd = r.pick([30, 45, 60, 20]);
        const which = r.pick(['x', 'y']), th = thd * DEG;
        const ans = which === 'x' ? -Math.sin(th) / rr : Math.cos(th) / rr;
        return {
          prompt: t`At the point with polar coordinates $r = ${rr}$, $\theta = ${thd}^\circ$, the vector $\partial_${which}$ is written $V^r\partial_r + V^\theta\partial_\theta$. Find $V^\theta$.`,
          visual: polarPic(rr, thd, { arrows: [{ from: [r6(rr * Math.cos(th)), r6(rr * Math.sin(th))], to: which === 'x' ? [r6(rr * Math.cos(th) + 0.8), r6(rr * Math.sin(th))] : [r6(rr * Math.cos(th)), r6(rr * Math.sin(th) + 0.8)], color: 'gold', width: 2.6, label: which === 'x' ? '∂x' : '∂y' }], caption: t`The polar grid, the coordinate lines through P (dashed) and $\partial_${which}$ (gold, drawn at length 0.8).` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: which === 'x' ? -Math.sin(th) : Math.cos(th), feedback: t`$\partial_\theta$ has length $r$, so the $\theta$-component carries a factor $1/r$: $V^\theta = \partial_${which}\theta = ${which === 'x' ? '-y/r^2' : 'x/r^2'}$.` }, { value: which === 'x' ? Math.cos(th) : Math.sin(th), feedback: t`That is $V^r = \partial_${which} r$. The question asks for $V^\theta = \partial_${which}\theta$.` }, { value: which === 'x' ? -rr * Math.sin(th) : rr * Math.cos(th), feedback: t`That is the Cartesian component of $\partial_\theta$; you need the reverse, the $\partial_\theta$-component of $\partial_${which}$, which divides by $r$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$V^\theta = V(\theta) = \partial_${which}\,\theta$, with $\theta = \operatorname{atan2}(y, x)$.`, t`$\partial_x\theta = -y/r^2 = -\sin\theta/r$ and $\partial_y\theta = x/r^2 = \cos\theta/r$.`],
          teach: t`A vector’s component along a coordinate is the vector applied to that coordinate: $V^\theta = V(\theta)$.`,
          explain: t`$V^\theta = ${which === 'x' ? t`-\sin ${thd}^\circ/${rr}` : t`\cos ${thd}^\circ/${rr}`} = ${nice(ans, 4)}$. Because $\partial_\theta$ is $r$ long, a unit-length $\partial_${which}$ needs only about $1/r$ of it.`,
        };
      },
    }),
    num({
      id: 'longitude-length', difficulty: 2,
      gen(r) {
        const lat = r.pick([0, 30, 45, 51.5, 60, 78.2]);
        const R = 6371, km = (Math.PI / 180) * R * Math.cos(lat * DEG);
        return {
          prompt: t`On the Earth (a sphere of radius $6371$ km) in colatitude–longitude coordinates, the vector $\partial_\varphi$ at a point has length $R\sin\theta$ per radian of longitude. How many kilometres east is one degree of longitude at latitude $${lat}^\circ$?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, grid: false, yaw: 0.5, pitch: 0.4, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'teal' }], curves: [{ param: [`${r6(Math.cos(lat * DEG))}*cos(t)`, `${r6(Math.cos(lat * DEG))}*sin(t)`, String(r6(Math.sin(lat * DEG)))], t: [0, TAU], color: 'gold', width: 2 }], vectors: [{ from: [1, 0, 0], to: [1, 0.5, 0], color: 'ink3', label: t`\tfrac12\partial_\varphi` }, { from: [r6(Math.cos(lat * DEG)), 0, r6(Math.sin(lat * DEG))], to: [r6(Math.cos(lat * DEG)), r6(0.5 * Math.cos(lat * DEG)), r6(Math.sin(lat * DEG))], color: 'gold', label: t`\tfrac12\partial_\varphi` }] }, caption: 'Half of ∂φ at the equator (grey) and on the chosen parallel (gold), for a unit sphere: the same coordinate step, a shorter arrow.' },
          answer: km, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: R * Math.cos(lat * DEG), feedback: 'That is the length per radian. One degree is π/180 of a radian.' }, { value: (Math.PI / 180) * R * Math.sin(lat * DEG), feedback: t`$\sin\theta$ uses colatitude: $\sin\theta = \cos(\text{latitude})$.` }, { value: (Math.PI / 180) * R, feedback: 'That is the length at the equator. Away from it the circles of latitude shrink.' }].filter((e) => Math.abs(e.value - km) > 0.005 * km),
          hints: [t`Colatitude $\theta = 90^\circ - ${lat}^\circ$, so $\sin\theta = \cos ${lat}^\circ$.`, t`One degree of longitude is $\Delta\varphi = \pi/180$ rad, a displacement $(\pi/180)\,\partial_\varphi$.`],
          teach: t`Coordinate basis vectors need not have unit length: $\partial_\varphi$ on a sphere has length $R\sin\theta$, shrinking toward the poles.`,
          explain: t`$(\pi/180)\times 6371 \times \cos ${lat}^\circ = ${nice(km, 4)}$ km. The coordinate step is the same everywhere; the vector it stands for is not — which is why a metric (C11) is needed to turn components into lengths.`,
        };
      },
    }),
    num({
      id: 'held-fixed', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, -1, 0.5]), x0 = r.pick([1, 2, -1]), y0 = r.pick([1, 3, -2]);
        const ans = 2 * x0 + 2 * k * y0;
        const kx = (sgn) => (k * sgn > 0 ? `+ ${Math.abs(k) === 1 ? '' : Math.abs(k)}x` : `- ${Math.abs(k) === 1 ? '' : Math.abs(k)}x`);
        return {
          prompt: t`The plane carries two charts, $(x, y)$ and $(x, u)$ with $u = y ${kx(-1)}$. Both have a coordinate called $x$. Apply the vector $\partial_x$ **of the second chart** (moving $x$ with $u$ held fixed) to $f = x^2 + y^2$ at $(x, y) = (${x0}, ${y0})$.`,
          visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-3, 4], equal: true, aspect: 'wide', grid: false, xticks: 7, yticks: 7, curves: [...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((c) => ({ fn: String(c), color: 'ink4', width: 1 })), ...[-6, -4, -2, 0, 2, 4, 6].map((c) => ({ fn: `${k}*x + ${c}`, color: 'violet', width: 1, dash: [5, 4] }))], arrows: [{ from: [x0, y0], to: [x0 + 1, y0], color: 'ink2', width: 2, label: '∂x, y fixed' }, { from: [x0, y0], to: [x0 + 1, y0 + k], color: 'gold', width: 2.6, label: '∂x, u fixed', labelDy: k > 0 ? -6 : 16 }], points: [{ x: x0, y: y0, color: 'ink', label: 'P', labelDx: -16, labelDy: 14 }] }, caption: t`Grey: lines of constant $y$. Violet dashed: lines of constant $u$. The two charts’ $\partial_x$ at P differ because they hold different things fixed.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * x0, feedback: t`That is $\partial_x$ of the first chart, with $y$ fixed. With $u$ fixed, moving $x$ also moves $y$: $\partial y/\partial x|_u = ${k}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`With $u$ fixed, $y = u ${kx(1)}$, so a unit step in $x$ also moves $y$ by $${k}$.`, t`So $\partial_x|_u = \partial_x|_y + ${k === 1 ? '' : k === -1 ? '(-1)' : k}\,\partial_y|_x$ — apply that to $f$.`],
          teach: t`A coordinate vector $\partial_\mu$ depends on the whole chart: changing what is held fixed changes the vector, even when $x^\mu$ itself is unchanged.`,
          explain: t`$\partial_x|_u f = \partial_xf + ${k}\,\partial_yf = 2(${x0}) + ${k}\cdot 2(${y0}) = ${nice(ans)}$, not $2x = ${2 * x0}$. This trap — sometimes called the second fundamental confusion of calculus — bites in thermodynamics ($\partial U/\partial T$ at fixed $V$ or fixed $p$) and in GR whenever one coordinate is kept and the others are swapped.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-beta', difficulty: 3, transfer: true,
      gen(r) {
        const lat = r.pick([20, 30, 45, 60]), v = r.pick([5, 10, 20]);
        const Om = 7.2921e-5, R = 6.371e6;
        const ans = (2 * Om * Math.cos(lat * DEG) * v) / R;
        return {
          prompt: t`The Coriolis parameter $f = 2\Omega\sin\lambda$ is a function on the Earth ($\Omega = 7.292\times10^{-5}$ rad/s, latitude $\lambda$). A weather balloon at latitude $${lat}^\circ$ drifts due north at $${v}$ m/s, so its velocity is the tangent vector $V = (v/R)\,\partial_\lambda$ with $R = 6371$ km. What is $V(f)$, the rate at which the balloon sees $f$ change, in $\text{s}^{-2}$?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, grid: false, yaw: 0.5, pitch: 0.35, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'teal' }], curves: [{ param: [`${r6(Math.cos(lat * DEG))}*cos(t)`, `${r6(Math.cos(lat * DEG))}*sin(t)`, String(r6(Math.sin(lat * DEG)))], t: [0, TAU], color: 'ink3', width: 1.4 }], vectors: [{ from: [r6(Math.cos(lat * DEG)), 0, r6(Math.sin(lat * DEG))], to: [r6(Math.cos(lat * DEG) - 0.4 * Math.sin(lat * DEG)), 0, r6(Math.sin(lat * DEG) + 0.4 * Math.cos(lat * DEG))], color: 'gold', label: 'V' }] }, caption: 'The balloon’s velocity on its parallel, pointing north (direction only; not to scale).' },
          answer: ans, units: 's^-2', tol: { rel: 0.005 },
          errors: [{ value: (2 * Om * Math.sin(lat * DEG) * v) / R, feedback: t`Differentiate: $\partial_\lambda(2\Omega\sin\lambda) = 2\Omega\cos\lambda$.` }, { value: 2 * Om * Math.cos(lat * DEG) * v, feedback: t`$\partial_\lambda$ is per radian of latitude, which is $R$ metres: divide by $R$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$V(f) = \dfrac vR\,\partial_\lambda f = \dfrac vR\,2\Omega\cos\lambda$.`, t`$2\Omega\cos ${lat}^\circ/R = ${tex((2 * Om * Math.cos(lat * DEG)) / R, 4)}\ \text{m}^{-1}\text{s}^{-1}$.`],
          teach: 'A velocity acts on a field as a derivation: V(f) is the rate of change of the field seen by the moving observer.',
          explain: t`$V(f) = \dfrac{${v}}{6.371\times10^{6}}\times 2\times 7.292\times10^{-5}\times\cos ${lat}^\circ = ${tex(ans, 3)}\ \text{s}^{-2}$. The factor $\beta = 2\Omega\cos\lambda/R$ is the meteorologists’ “beta effect” that steers Rossby waves — a tangent vector applied to a function on the sphere.`,
        };
      },
    }),
    num({
      id: 'cp-dtheta', difficulty: 2,
      gen(r) {
        const rr = r.pick([1, 2, 1.5]), thd = r.pick([30, 60, 45, 120]);
        const which = r.pick(['x', 'y', 'xy']);
        const th = thd * DEG, x = rr * Math.cos(th), y = rr * Math.sin(th);
        const ans = which === 'x' ? -y : which === 'y' ? x : x * x - y * y;
        const ftex = which === 'xy' ? 'xy' : which;
        return {
          prompt: t`At the point with polar coordinates $(r, \theta) = (${rr}, ${thd}^\circ)$, apply the vector $\partial_\theta$ to the function $f = ${ftex}$.`,
          visual: polarPic(rr, thd, { arrows: [{ from: [r6(x), r6(y)], to: [r6(x - y), r6(y + x)], color: 'violet', width: 2.6, label: '∂θ' }], caption: t`$\partial_\theta$ at P, tangent to the circle $r = ${rr}$, drawn to scale (length $r$).` }),
          answer: ans, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: which === 'x' ? -Math.sin(th) : which === 'y' ? Math.cos(th) : Math.cos(2 * th), feedback: t`$\partial_\theta$ has length $r$: with $x = r\cos\theta$, $\partial_\theta x = -r\sin\theta$, not $-\sin\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Write $f$ in polar form (${which === 'xy' ? t`$xy = r^2\sin\theta\cos\theta$` : which === 'x' ? t`$x = r\cos\theta$` : t`$y = r\sin\theta$`}), then differentiate in $\theta$ with $r$ fixed.`, which === 'xy' ? t`$\partial_\theta(r^2\sin\theta\cos\theta) = r^2\cos 2\theta = x^2 - y^2$.` : t`Or use $\partial_\theta = -y\,\partial_x + x\,\partial_y$.`],
          teach: t`The rotation vector $\partial_\theta$ equals $-y\,\partial_x + x\,\partial_y$: it measures how a function changes as you go round the origin.`,
          explain: t`$\partial_\theta = -y\,\partial_x + x\,\partial_y$, so $\partial_\theta(${ftex}) = ${which === 'x' ? '-y' : which === 'y' ? 'x' : 'x^2 - y^2'} = ${nice(ans, 4)}$ here. Functions with $\partial_\theta f = 0$ are exactly those unchanged by rotation — the seed of Killing vectors (C18).`,
        };
      },
    }),
    mcq({
      id: 'cp-velocity', difficulty: 2,
      prompt: t`A curve $\gamma(t)$ on a manifold passes through $p$ at $t = 0$. Which derivation is its velocity $\gamma'(0)$?`,
      visual: polarPic(2, 40, { extra: [{ param: ['1.53 + 0.9*t - 0.25*t^2', '1.29 + 0.5*t + 0.3*t^2'], t: [-1.2, 1.4], color: 'gold', width: 2.4 }], caption: 'A curve (gold) through P drawn over a polar chart; its velocity at P does not depend on the chart.' }),
      choices: [
        t`$f \mapsto \dfrac{d}{dt}f(\gamma(t))\Big|_{t = 0}$`,
        t`$f \mapsto f(\gamma(1)) - f(\gamma(0))$`,
        t`$f \mapsto \dfrac{d}{dt}\gamma(t)$, the derivative of the curve’s coordinates, ignoring $f$`,
        t`$f \mapsto f'(\gamma(0))$`,
      ],
      answer: 0,
      why: {
        1: 'A difference over a finite step is not a derivation (it fails Leibniz) and depends on more than the curve near p.',
        2: 'Coordinates of the curve give its components in one chart; the derivation itself must act on functions.',
        3: t`$f$ is a function on the manifold; “$f'$” means nothing until you say along which direction — which is what the curve supplies.`,
      },
      hints: ['A derivation takes a function and returns the rate of change of that function — along what?'],
      teach: t`The velocity of a curve is the derivation $f \mapsto (f\circ\gamma)'(0)$; in a chart its components are $dx^\mu/dt$.`,
      explain: t`By the chain rule, $\frac{d}{dt}f(\gamma(t)) = \dfrac{dx^\mu}{dt}\partial_\mu f$, so $\gamma'(0) = \dot x^\mu\partial_\mu$: the two pictures of a tangent vector — velocity and derivation — are one. A particle’s four-velocity $u^\mu = dx^\mu/d\tau$ is exactly this.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §2.3', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Lee, Introduction to Smooth Manifolds (2nd ed.), ch. 3', url: 'https://link.springer.com/book/10.1007/978-1-4419-9982-5' },
  ],
});
