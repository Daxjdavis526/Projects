// General coordinate transformations and the Jacobian — Derivation Mode.
// Vector components transform with ∂x′/∂x (the chain rule on dx^μ/dλ),
// covector components with the inverse ∂x/∂x′, so contractions ω_μ V^μ are
// the same in every chart. Worked in the flat plane, Cartesian ↔ polar, where
// every answer can be checked by drawing; the determinant gives the area and
// volume elements; and the hyperbolic worldline of a rocket at constant
// proper acceleration (the start of Rindler coordinates) is derived.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { C, YEAR, g0, sci, matrix } from './_deriv.js';

const t = String.raw;

const DEG = Math.PI / 180;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const CT = C / g0 / YEAR;                     // c/α in years for α = g (and c²/α in light-years) ≈ 0.968

// the polar grid on the plane: circles r = 1…4 and rays every 30°
function polarGrid(rmax = 4) {
  const curves = [];
  for (let k = 1; k <= rmax; k++) curves.push({ param: [`${k}*cos(t)`, `${k}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 });
  for (let j = 0; j < 12; j++) curves.push({ param: [`${r4(Math.cos(j * 30 * DEG))}*t`, `${r4(Math.sin(j * 30 * DEG))}*t`], t: [0, rmax + 0.6], color: 'ink4', width: 1 });
  return curves;
}
// a unit arrow V (direction α) at P, with the polar basis vectors e_r and ½e_θ there
const sceneArrows = [
  { from: ['px', 'py'], to: ['px + cos(al*pi/180)', 'py + sin(al*pi/180)'], color: 'gold', label: 'V' },
  { from: ['px', 'py'], to: ['px + px/sqrt(px^2 + py^2)', 'py + py/sqrt(px^2 + py^2)'], color: 'accent', label: 'eᵣ' },
  { from: ['px', 'py'], to: ['px - 0.5*py', 'py + 0.5*px'], color: 'violet', label: '½ eθ' },
];
const polarScene = (px, py, al, caption, extra = {}) => ({
  type: 'graph',
  params: { x: [-4.6, 4.6], y: [-3.3, 3.3], equal: true, xlabel: 'x', ylabel: 'y', constants: { px: r4(px), py: r4(py), al }, curves: polarGrid(), arrows: sceneArrows, points: [{ x: 'px', y: 'py', color: 'ink', r: 3.5, label: 'P', labelDx: -16, labelDy: 12 }], ...extra },
  caption: caption ?? t`The polar grid on a flat plane, the arrow $\vec V$ (gold) at the point P, and the polar basis vectors there: $\mathbf e_r$ (blue, length 1) and $\mathbf e_\theta$ (violet, drawn at half its length $r$).`,
});
// the worldline of a rocket at constant proper acceleration, in units of c/α (time) and c²/α (distance)
const rocketWorldline = (extra = {}, caption) => ({
  type: 'graph',
  params: {
    x: [-0.4, 3.4], y: [0, 3.6], equal: true, xlabel: 'x  (units of c²/α ≈ 0.97 ly)', ylabel: 'ct  (units of c²/α)',
    curves: [
      { param: ['cosh(t) - 1', 'sinh(t)'], t: [0, 2.05], color: 'accent', width: 2.6, label: 'the rocket', labelAt: 1.2, labelDx: 8, labelDy: 8 },
      { fn: 'x', color: 'warn', dash: true, width: 1.3, domain: [0, 3.4] },
      { fn: 'x + 1', color: 'ink3', dash: true, width: 1.3, domain: [-0.4, 2.6], label: 'light it never sees', labelAt: 1.4, labelDx: -132, labelDy: -4 },
    ],
    ...extra,
  },
  caption: caption ?? t`The rocket’s worldline, a hyperbola, in units where $c = 1$ and $c^2/\alpha = 1$ (for $\alpha = g$, about 0.97 light-years and 0.97 years). Gold dashed: light from its launch. Grey dashed: a light ray that started a distance $c^2/\alpha$ behind the rocket — it never catches up, however long the rocket burns.`,
});

export default lesson({
  id: 'gr.S07.d',
  title: 'General coordinate transformations and the Jacobian',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`A coordinate transformation $x^\mu \to x'^\mu(x)$ relabels every event; nothing physical moves. Near any point it is nearly linear, and its linear part is the **Jacobian matrix** $\partial x'^\mu/\partial x^\nu$. A vector’s components transform with it — the velocity $dx^\mu/d\lambda$ is the model, since by the chain rule $dx'^\mu/d\lambda = (\partial x'^\mu/\partial x^\nu)\,dx^\nu/d\lambda$ — while a gradient’s components transform with the **inverse** Jacobian. That is exactly what makes the pairing $\omega_\mu V^\mu$ the same in every coordinate system, and it is how general relativity writes physics once and reads it in any chart: Cartesian, polar, or one adapted to a rocket or a black hole.`,
  equation: t`V'^\mu = \frac{\partial x'^\mu}{\partial x^\nu}\,V^\nu, \qquad \omega'_\mu = \frac{\partial x^\nu}{\partial x'^\mu}\,\omega_\nu`,
  symbols: [
    { tex: "x^\\mu \\to x'^\\mu", text: t`old and new coordinates of the same point. In this lesson mostly $(x, y) \to (r, \theta)$ on a flat plane, where $\mu$ runs over two values` },
    { tex: "\\partial x'^\\mu/\\partial x^\\nu", text: t`the Jacobian: row $\mu$, column $\nu$ — how much new coordinate $\mu$ changes per unit change of old coordinate $\nu$` },
    { tex: "\\partial x^\\nu/\\partial x'^\\mu", text: t`its inverse matrix: old coordinates differentiated with respect to new ones` },
    { tex: 'V^\\mu', text: t`components of a vector — an arrow such as a velocity, $dx^\mu/d\lambda$ — written with an upper index` },
    { tex: '\\omega_\\mu', text: t`components of a covector — such as a gradient, $\partial f/\partial x^\mu$ — written with a lower index` },
    { tex: '\\omega_\\mu V^\\mu', text: t`their pairing (summed over $\mu$): one number, the same in every coordinate system — for a gradient, the rate of change of $f$ along $V$` },
  ],
  why: t`General relativity allows any coordinates, so every equation must survive a change of them. Tensors are exactly the objects whose components change by these rules; the metric (step 8) and every curvature tensor after it are built that way.`,
  visual: {
    type: 'graph',
    title: 'One arrow, two sets of components',
    lead: t`The gold arrow $\vec V$ is the same arrow wherever you drag P; the slider sets its direction. The blue and violet arrows are the polar grid’s own basis vectors at P. The readout turns $V$’s Cartesian components into polar ones with the Jacobian.`,
    tasks: [
      t`With $\vec V$ pointing east, drag P around the origin: $V^r$ and $V^\theta$ change from place to place though $\vec V$ never does — the basis turns under it.`,
      t`Drag P outward along a ray: $V^\theta$ shrinks like $1/r$ (a radian of $\theta$ is more ground farther out), yet $(V^r)^2 + r^2(V^\theta)^2$ stays 1.`,
      t`Turn $\vec V$ to point along $\mathbf e_r$: then $V^\theta = 0$ and $V^r = 1$.`,
    ],
    params: {
      x: [-4.6, 4.6], y: [-3.3, 3.3], equal: true, xlabel: 'x', ylabel: 'y',
      sliders: [{ key: 'al', label: t`Direction of $\vec V$, from the $x$ axis`, min: -180, max: 180, step: 5, value: 0, unit: '^\\circ', explain: t`$\vec V$ is a unit arrow, the same at every point: $V^x = \cos\alpha$, $V^y = \sin\alpha$.` }],
      curves: polarGrid(),
      drag: [{ key: 'p', x: 1.73, y: 1 }],
      arrows: sceneArrows,
      points: [{ x: 'px', y: 'py', color: 'ink', r: 0.01, label: 'P', labelDx: -18, labelDy: 14 }],
      readouts: [
        { label: t`$r$`, expr: 'sqrt(px^2 + py^2)', digits: 3 },
        { label: t`$\theta$ (degrees)`, expr: 'atan2(py, px)*180/pi', digits: 3 },
        { label: t`$V^r = \cos\theta\,V^x + \sin\theta\,V^y$`, expr: '(px*cos(al*pi/180) + py*sin(al*pi/180))/sqrt(px^2 + py^2)', digits: 3 },
        { label: t`$V^\theta = (-\sin\theta\,V^x + \cos\theta\,V^y)/r$`, expr: '(-py*cos(al*pi/180) + px*sin(al*pi/180))/(px^2 + py^2)', digits: 3 },
        { label: t`$(V^r)^2 + r^2(V^\theta)^2$`, expr: '((px*cos(al*pi/180) + py*sin(al*pi/180))^2 + (-py*cos(al*pi/180) + px*sin(al*pi/180))^2)/(px^2 + py^2)', digits: 4 },
      ],
    },
    caption: t`A flat plane with its polar grid. $\mathbf e_r$ (blue) has length 1; $\mathbf e_\theta$ (violet) has length $r$ and is drawn at half length. $V^\theta$ is in radians per unit time — which is why the length check needs the factor $r^2$, the polar metric of step 8.`,
  },
  example: {
    prompt: t`A drone flies due east at 1 m/s. As it passes the point $(r, \theta) = (2\ \text{m}, 30^\circ)$, how fast are its polar coordinates changing? Then take the gradient of its east coordinate, $f = x$, into polar components and check that the pairing $\omega_\mu V^\mu$ is unchanged.`,
    visual: polarScene(2 * Math.cos(30 * DEG), 2 * Math.sin(30 * DEG), 0, t`The drone’s velocity $\vec V$ (gold, due east) at $(r, \theta) = (2, 30^\circ)$, with the polar basis vectors there: $\mathbf e_r$ (blue) and $\mathbf e_\theta$ (violet, at half length).`),
    steps: [
      { label: 'The Jacobian', text: t`With $r = \sqrt{x^2 + y^2}$ and $\theta = \arctan(y/x)$: $\dfrac{\partial r}{\partial x} = \dfrac{x}{r} = \cos\theta$, $\dfrac{\partial r}{\partial y} = \sin\theta$, $\dfrac{\partial \theta}{\partial x} = -\dfrac{y}{r^2} = -\dfrac{\sin\theta}{r}$, $\dfrac{\partial \theta}{\partial y} = \dfrac{\cos\theta}{r}$.` },
      { label: 'Transform the velocity', text: t`$V^x = 1$ m/s, $V^y = 0$. So $V^r = \dfrac{\partial r}{\partial x}V^x + \dfrac{\partial r}{\partial y}V^y = \cos 30^\circ = 0.866$ m/s and $V^\theta = \dfrac{\partial\theta}{\partial x}V^x + \dfrac{\partial\theta}{\partial y}V^y = -\dfrac{\sin 30^\circ}{2} = -0.25$ rad/s: the drone moves outward and clockwise.` },
      { label: 'Nothing physical changed', text: t`Its speed from the polar components: $\sqrt{(V^r)^2 + r^2(V^\theta)^2} = \sqrt{0.75 + 4(0.0625)} = 1$ m/s ✓. The $r^2$ turns radians into metres — the polar metric, step 8’s subject.` },
      { label: 'A covector goes the other way', text: t`The gradient of $f = x$ has Cartesian components $\omega_\mu = (1, 0)$. Its polar components use the *inverse* Jacobian: $\omega_r = \dfrac{\partial x}{\partial r}\omega_x = \cos\theta = 0.866$ and $\omega_\theta = \dfrac{\partial x}{\partial\theta}\omega_x = -r\sin\theta = -1$ (per radian).` },
      { label: 'The pairing is invariant', text: t`$\omega_\mu V^\mu$: Cartesian, $1\times1 + 0\times0 = 1$; polar, $(0.866)(0.866) + (-1)(-0.25) = 0.75 + 0.25 = 1$ ✓. Both say the drone’s $x$ grows at 1 m/s.` },
      { label: 'Why it always works', text: t`The two matrices are inverses: $\dfrac{\partial x'^\mu}{\partial x^\nu}\dfrac{\partial x^\nu}{\partial x'^\lambda} = \delta^\mu{}_\lambda$ (the chain rule). In $\omega'_\mu V'^\mu$ they meet and cancel, leaving $\omega_\nu V^\nu$. Upper and lower indices transform oppositely precisely so that contractions survive.` },
    ],
    answer: t`$V^r = 0.866$ m/s, $V^\theta = -0.25$ rad/s; $\omega_r = 0.866$, $\omega_\theta = -1$; and $\omega_\mu V^\mu = 1$ in both coordinate systems.`,
  },
  practice: [
    expr({
      id: 'dtheta-dx', difficulty: 2,
      prompt: t`For $x > 0$, $\theta = \arctan(y/x)$. Find the Jacobian entry $\dfrac{\partial\theta}{\partial x}$ in terms of $x$ and $y$.`,
      answer: '-y/(x^2 + y^2)', answerTeX: t`-\frac{y}{x^2 + y^2}`,
      lhs: '\\dfrac{\\partial\\theta}{\\partial x}',
      vars: { x: [0.5, 2], y: [-2, 2] },
      derivativeOf: 'atan(y/x)',
      errors: [
        { answer: 'y/(x^2 + y^2)', feedback: t`Check the sign: $\dfrac{\partial}{\partial x}\dfrac{y}{x} = -\dfrac{y}{x^2}$.` },
        { answer: '1/(1 + (y/x)^2)', feedback: t`That is only the outer derivative of $\arctan$; multiply by the derivative of the inside, $-y/x^2$.` },
        { answer: 'x/(x^2 + y^2)', feedback: t`That is $\partial\theta/\partial y$. Differentiate with respect to $x$.` },
      ],
      hints: [t`Chain rule: $\dfrac{d}{du}\arctan u = \dfrac{1}{1 + u^2}$ with $u = y/x$, and $\dfrac{\partial u}{\partial x} = -\dfrac{y}{x^2}$.`, t`$\dfrac{1}{1 + y^2/x^2}\cdot\left(-\dfrac{y}{x^2}\right) = -\dfrac{y}{x^2 + y^2}$.`],
      teach: 'Each Jacobian entry is a partial derivative of a new coordinate with respect to an old one; for polar angle, ∂θ/∂x = −y/r² = −sin θ / r.',
      explain: t`$\dfrac{\partial\theta}{\partial x} = -\dfrac{y}{x^2 + y^2} = -\dfrac{\sin\theta}{r}$. Moving east raises $x$; above the $x$ axis that turns the point clockwise — $\theta$ falls — and the effect weakens as $1/r$.`,
      visual: polarScene(1.6, 1.6, 0, t`Moving east from a point above the $x$ axis (gold) crosses the rays of the polar grid toward smaller $\theta$ — and crosses them more slowly the farther out you are.`),
    }),
    num({
      id: 'polar-velocity', difficulty: 2,
      gen(r) {
        const [R, thd] = r.pick([[2, 60], [3, 30], [4, 45], [2.5, 120], [3, 150], [2, -45]]);
        const [Vx, Vy] = r.pick([[2, 0], [0, 3], [1, 2], [-2, 1], [3, -1]]);
        const th = thd * DEG;
        const askTheta = r.bool(0.5);
        const Vr = Math.cos(th) * Vx + Math.sin(th) * Vy, Vt = (-Math.sin(th) * Vx + Math.cos(th) * Vy) / R;
        const ans = askTheta ? Vt : Vr;
        if (Math.abs(ans) < 0.05) return this.gen(r);
        return {
          prompt: t`A particle at $(r, \theta) = (${R}\ \text{m}, ${thd}^\circ)$ moves with Cartesian velocity $(V^x, V^y) = (${Vx}, ${Vy})$ m/s. Use the Jacobian to find ${askTheta ? t`$V^\theta = d\theta/dt$, in rad/s` : t`$V^r = dr/dt$, in m/s`}.`,
          answer: ans, units: askTheta ? 'rad/s' : 'm/s', tol: { rel: 0.01, abs: 0.002 },
          errors: askTheta
            ? [{ value: Vt * R, feedback: t`That is $rV^\theta$, the speed around in m/s. The component $V^\theta$ is in radians per second: divide by $r$.` }, { value: -Vt, feedback: t`Check the signs: $\partial\theta/\partial x = -\sin\theta/r$, $\partial\theta/\partial y = +\cos\theta/r$.` }].filter((e) => Math.abs(e.value - ans) > 0.02)
            : [{ value: -Math.sin(th) * Vx + Math.cos(th) * Vy, feedback: t`That is the component around ($rV^\theta$). Outward is $V^r = \cos\theta\,V^x + \sin\theta\,V^y$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [askTheta ? t`$V^\theta = \dfrac{\partial\theta}{\partial x}V^x + \dfrac{\partial\theta}{\partial y}V^y = \dfrac{-\sin\theta\,V^x + \cos\theta\,V^y}{r}$.` : t`$V^r = \dfrac{\partial r}{\partial x}V^x + \dfrac{\partial r}{\partial y}V^y = \cos\theta\,V^x + \sin\theta\,V^y$.`, t`$\cos ${thd}^\circ = ${fmt(Math.cos(th), 4)}$, $\sin ${thd}^\circ = ${fmt(Math.sin(th), 4)}$.`],
          teach: 'Upper-index components transform with the Jacobian ∂x′/∂x: V^r = cos θ V^x + sin θ V^y, V^θ = (−sin θ V^x + cos θ V^y)/r.',
          explain: t`$V^r = ${fmt(Vr, 4)}$ m/s and $V^\theta = ${fmt(Vt, 4)}$ rad/s. Check: $(V^r)^2 + r^2(V^\theta)^2 = ${fmt(Vr * Vr + R * R * Vt * Vt, 4)} = (V^x)^2 + (V^y)^2 = ${Vx * Vx + Vy * Vy}$ ✓.`,
          visual: polarScene(R * Math.cos(th), R * Math.sin(th), Math.atan2(Vy, Vx) / DEG, t`The particle at P with its velocity direction (gold, length not to scale) and the polar basis vectors there.`),
        };
      },
    }),
    num({
      id: 'gradient-polar', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 0], [0, 1], [2, 1], [1, -1], [3, 2]]);
        const [R, thd] = r.pick([[2, 30], [3, 60], [2, 135], [4, 90]]);
        const th = thd * DEG, ans = -a * R * Math.sin(th) + b * R * Math.cos(th);
        if (Math.abs(ans) < 0.05) return this.gen(r);
        return {
          prompt: t`The function $f = ${a === 1 ? '' : a}${a ? 'x' : ''}${b ? (b > 0 ? (a ? ' + ' : '') : ' - ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y' : ''}$ has Cartesian gradient components $\omega_\mu = (${a}, ${b})$. Find its polar component $\omega_\theta = \partial f/\partial\theta$ at $(r, \theta) = (${R}, ${thd}^\circ)$ using $\omega_\theta = \dfrac{\partial x}{\partial\theta}\omega_x + \dfrac{\partial y}{\partial\theta}\omega_y$.`,
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [
            { value: (-a * Math.sin(th) + b * Math.cos(th)) / R, feedback: t`That used the forward Jacobian ($\partial\theta/\partial x$, …). A covector needs $\partial x/\partial\theta = -r\sin\theta$ and $\partial y/\partial\theta = r\cos\theta$.` },
            { value: -a * Math.sin(th) + b * Math.cos(th), feedback: t`$\partial x/\partial\theta = -r\sin\theta$: you dropped the factor $r$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`With $x = r\cos\theta$, $y = r\sin\theta$: $\dfrac{\partial x}{\partial\theta} = -r\sin\theta$ and $\dfrac{\partial y}{\partial\theta} = r\cos\theta$.`, t`$\omega_\theta = -${R}\sin ${thd}^\circ\times(${a}) + ${R}\cos ${thd}^\circ\times(${b})$.`],
          teach: 'Lower-index components transform with the inverse Jacobian ∂x/∂x′ — the chain rule for a gradient.',
          explain: t`$\omega_\theta = ${fmt(ans, 4)}$: the change in $f$ per radian of $\theta$ at that point, which grows with $r$ because a radian is more ground farther out.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4.6, 4.6], y: [-3.3, 3.3], equal: true, xlabel: 'x', ylabel: 'y',
              curves: [...polarGrid(), ...[-6, -4, -2, 0, 2, 4, 6].map((k) => (b !== 0 ? { fn: `(${k} - ${a}*x)/${b}`, color: 'teal', width: 1.3 } : { param: [`${k}/${a}`, 't'], t: [-4, 4], color: 'teal', width: 1.3 }))],
              points: [{ x: r4(R * Math.cos(th)), y: r4(R * Math.sin(th)), color: 'gold', r: 5, label: 'P' }],
            },
            caption: t`Level lines of $f$ (teal, every 2 units) over the polar grid. $\omega_\theta$ counts how many of them you cross per radian going around through P.`,
          },
        };
      },
    }),
    mcq({
      id: 'which-law', difficulty: 2,
      prompt: t`Which pairing of objects and transformation laws is right?`,
      choices: [
        t`Velocity $dx^\mu/d\lambda$ transforms with $\partial x'^\mu/\partial x^\nu$; gradient $\partial f/\partial x^\mu$ with $\partial x^\nu/\partial x'^\mu$`,
        t`Both transform with $\partial x'^\mu/\partial x^\nu$`,
        t`Velocity with $\partial x^\nu/\partial x'^\mu$; gradient with $\partial x'^\mu/\partial x^\nu$`,
        'Neither: only Cartesian components have any meaning',
      ],
      answer: 0,
      why: {
        1: t`Then $\omega'_\mu V'^\mu$ would pick up two Jacobians instead of a Jacobian and its inverse, and would change from chart to chart.`,
        2: t`Reversed. Differentiate $x'^\mu(x(\lambda))$ with the chain rule: the velocity gets $\partial x'^\mu/\partial x^\nu$. Differentiate $f(x(x'))$: the gradient gets $\partial x^\nu/\partial x'^\mu$.`,
        3: 'Polar components are perfectly good — the drone’s V^θ = −0.25 rad/s is exactly how fast its angle changes.',
      },
      hints: [t`Apply the chain rule to $\dfrac{d}{d\lambda}x'^\mu(x(\lambda))$.`, t`Apply it to $\dfrac{\partial}{\partial x'^\mu}f(x(x'))$.`],
      teach: 'Vectors (upper index) transform with ∂x′/∂x, covectors (lower index) with ∂x/∂x′: both are just the chain rule.',
      explain: t`$\dfrac{dx'^\mu}{d\lambda} = \dfrac{\partial x'^\mu}{\partial x^\nu}\dfrac{dx^\nu}{d\lambda}$ and $\dfrac{\partial f}{\partial x'^\mu} = \dfrac{\partial x^\nu}{\partial x'^\mu}\dfrac{\partial f}{\partial x^\nu}$. The two matrices are inverses, so the contraction is unchanged.`,
      visual: matrix([['cos θ', '−r sin θ'], ['sin θ', 'r cos θ']], { colors: [['accent', 'violet'], ['accent', 'violet']], rowLabels: ['x', 'y'], colLabels: ['∂/∂r', '∂/∂θ'], left: '∂x/∂x′ =', w: 1.5, h: 0.7, caption: t`The inverse Jacobian $\partial x^\nu/\partial x'^\mu$ for polar coordinates: the old coordinates $x, y$ differentiated with respect to the new $r, \theta$. Its columns are the components of $\mathbf e_r$ and $\mathbf e_\theta$.` }),
    }),
    expr({
      id: 'spherical-det', difficulty: 3,
      prompt: t`Spherical coordinates: $x = r\sin\theta\cos\phi$, $y = r\sin\theta\sin\phi$, $z = r\cos\theta$ ($\theta$ measured from the $z$ axis). Compute the determinant of the Jacobian $\partial(x, y, z)/\partial(r, \theta, \phi)$ — the volume of the little box swept out by $dr$, $d\theta$, $d\phi$, per unit $dr\,d\theta\,d\phi$.`,
      answer: 'r^2 sin(theta)', answerTeX: t`r^2\sin\theta`,
      lhs: '\\det J',
      vars: { r: [0.5, 2], theta: [0.2, 2.9], phi: [0, 6] },
      errors: [
        { answer: 'r sin(theta)', feedback: t`Two of the columns scale with $r$ ($\partial/\partial\theta$ and $\partial/\partial\phi$), so the determinant has $r^2$.` },
        { answer: 'r^2 cos(theta)', feedback: t`Check which angle is measured from the axis: the circle of constant $\theta$ has radius $r\sin\theta$, so the $\phi$ column carries $\sin\theta$.` },
        { answer: 'r^2', feedback: t`The $\phi$-step shrinks near the poles: it has length $r\sin\theta\,d\phi$.` },
      ],
      hints: [t`Columns: $\partial_r = (\sin\theta\cos\phi, \sin\theta\sin\phi, \cos\theta)$, $\partial_\theta = r(\cos\theta\cos\phi, \cos\theta\sin\phi, -\sin\theta)$, $\partial_\phi = r\sin\theta(-\sin\phi, \cos\phi, 0)$.`, t`They are mutually perpendicular with lengths $1$, $r$ and $r\sin\theta$, so the determinant is their product.`],
      teach: 'The Jacobian determinant is the volume factor between coordinate boxes and real volumes: r² sin θ for spherical coordinates.',
      explain: t`$\det J = r^2\sin\theta$: the box has edges $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$, at right angles. So $dV = r^2\sin\theta\,dr\,d\theta\,d\phi$, and integrating over a ball of radius $R$ gives $\tfrac43\pi R^3$. In step 8 this becomes $\sqrt{|g|}$, the volume element read off the metric.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 3,
          spheres: [{ centre: [0, 0, 0], radius: 2, color: 'teal' }],
          segments: [{ from: [0, 0, 0], to: [1.389, 0.9503, 1.0806], color: 'ink3', dash: true }],
          points: [{ at: [1.389, 0.9503, 1.0806], color: 'ink', label: 'P' }],
          vectors: [
            { from: [1.389, 0.9503, 1.0806], to: [2.0835, 1.4254, 1.6209], color: 'accent', label: '\\mathbf e_r' },
            { from: [1.389, 0.9503, 1.0806], to: [1.8349, 1.2554, 0.2391], color: 'violet', label: '\\tfrac12\\mathbf e_\\theta' },
            { from: [1.389, 0.9503, 1.0806], to: [0.9139, 1.6448, 1.0806], color: 'gold', label: '\\tfrac12\\mathbf e_\\phi' },
          ],
        },
        caption: t`The coordinate basis vectors at a point P on a sphere of radius $r = 2$ (θ = 57°, φ = 34°): $\mathbf e_r$ has length 1, $\mathbf e_\theta$ length $r$ and $\mathbf e_\phi$ length $r\sin\theta$ (the last two drawn at half length). Drag to rotate.`,
      },
    }),
    num({
      id: 'rocket-1g', difficulty: 2,
      gen(r) {
        const tau = r.pick([1, 2, 3]);
        const s = tau / CT, ask = r.pick(['t', 'x', 'v']);
        const ans = ask === 't' ? CT * Math.sinh(s) : ask === 'x' ? CT * (Math.cosh(s) - 1) : Math.tanh(s);
        return {
          prompt: t`A rocket accelerates at a steady $\alpha = 9.81\ \text{m/s}^2$, as felt on board, starting from rest. Its worldline is $ct = \dfrac{c^2}{\alpha}\sinh\dfrac{\alpha\tau}{c}$, $x = \dfrac{c^2}{\alpha}\left(\cosh\dfrac{\alpha\tau}{c} - 1\right)$, where $\tau$ is the crew’s time; $c/\alpha = ${fmt(CT, 4)}$ years. After ${tau} year${tau > 1 ? 's' : ''} of crew time, ${ask === 't' ? 'how many years have passed on Earth' : ask === 'x' ? 'how far has it gone, in light-years' : 'how fast is it moving, as a fraction of c'}?`,
          answer: ans, units: ask === 't' ? 'yr' : ask === 'x' ? 'ly' : undefined, tol: { rel: 0.005 },
          errors: ask === 'v' ? [{ value: Math.min(0.999, tau / CT), feedback: t`That is Newton’s $\alpha\tau/c$. The rapidity grows linearly, $\phi = \alpha\tau/c$; the speed is $\tanh\phi$.` }].filter((e) => Math.abs(e.value - ans) > 0.01) : ask === 't' ? [{ value: tau, feedback: 'That is the crew’s own time. Earth’s time is (c/α) sinh(ατ/c), longer.' }] : [{ value: 0.5 * tau * tau / CT, feedback: t`That is Newton’s $\tfrac12\alpha\tau^2$; at these speeds use the hyperbolic worldline.` }],
          hints: [t`$\alpha\tau/c = ${tau}/${fmt(CT, 4)} = ${fmt(s, 4)}$.`, ask === 't' ? t`$t = ${fmt(CT, 4)}\sinh(${fmt(s, 4)})$ years.` : ask === 'x' ? t`$x = ${fmt(CT, 4)}\,[\cosh(${fmt(s, 4)}) - 1]$ light-years (with $c^2/\alpha = ${fmt(CT, 4)}$ ly).` : t`$v/c = \dfrac{dx/d\tau}{c\,dt/d\tau} = \tanh(${fmt(s, 4)})$.`],
          teach: 'At constant proper acceleration α the worldline is a hyperbola: t and x grow like sinh and cosh of ατ/c, and v = c tanh(ατ/c).',
          explain: t`$\alpha\tau/c = ${fmt(s, 4)}$, so Earth time $= ${fmt(CT * Math.sinh(s), 4)}$ yr, distance $= ${fmt(CT * (Math.cosh(s) - 1), 4)}$ ly, speed $= ${fmt(Math.tanh(s), 4)}c$. The rapidity $\phi = \alpha\tau/c$ grows steadily — each second of crew time adds the same boost, as in step 3 — while the speed creeps toward $c$.`,
          visual: rocketWorldline(),
        };
      },
    }),
    expr({
      id: 'dt-dtau', difficulty: 2,
      prompt: t`For the accelerating rocket, $t(\tau) = \dfrac{c}{\alpha}\sinh\dfrac{\alpha\tau}{c}$. Find $\dfrac{dt}{d\tau}$ — Earth time per unit of crew time, which is the rocket’s $\gamma$.`,
      answer: 'cosh(alpha tau/c)', answerTeX: t`\cosh\frac{\alpha\tau}{c}`,
      lhs: '\\dfrac{dt}{d\\tau}',
      vars: { tau: [0.2, 2], alpha: [0.5, 2], c: [1, 3] },
      derivativeOf: '(c/alpha)*sinh(alpha*tau/c)',
      errors: [
        { answer: 'sinh(alpha tau/c)', feedback: t`$\dfrac{d}{du}\sinh u = \cosh u$, not $\sinh u$.` },
        { answer: '(c/alpha) cosh(alpha tau/c)', feedback: t`The chain rule brings down $\alpha/c$, which cancels the $c/\alpha$ in front.` },
      ],
      hints: [t`Chain rule with $u = \alpha\tau/c$: $\dfrac{dt}{d\tau} = \dfrac{c}{\alpha}\cosh u\cdot\dfrac{\alpha}{c}$.`],
      teach: 'Along the hyperbolic worldline dt/dτ = cosh(ατ/c) = γ: the rocket’s rapidity is ατ/c.',
      explain: t`$\dfrac{dt}{d\tau} = \cosh\dfrac{\alpha\tau}{c} = \gamma$. With $\dfrac{dx}{d\tau} = c\sinh\dfrac{\alpha\tau}{c}$, the four-velocity is $u^\mu = c\,(\cosh\phi, \sinh\phi)$ with $\phi = \alpha\tau/c$: it has length $c$ (step 4) and its rapidity grows in step with the crew’s clock.`,
      visual: rocketWorldline({
        arrows: [0.5, 1, 1.5].map((s) => ({ from: [r4(Math.cosh(s) - 1), r4(Math.sinh(s))], to: [r4(Math.cosh(s) - 1 + 0.45 * Math.tanh(s)), r4(Math.sinh(s) + 0.45)], color: 'gold' })),
      }, t`The rocket’s worldline with its direction of motion through spacetime (gold) at three moments: it tips toward the light cone as $\phi = \alpha\tau/c$ grows. Units where $c = 1$ and $c^2/\alpha = 1$.`),
    }),
    mcq({
      id: 'constant-field', difficulty: 2,
      prompt: t`A field of identical arrows covers the plane — the same direction and length everywhere. Its polar components $(V^r, V^\theta)$ are different at A and at B. What does that show?`,
      choices: [
        'Only that the polar basis vectors point differently at A and B; the field itself is constant',
        'The field is not really constant: its components prove it varies',
        'Polar coordinates are wrong at one of the two points',
        'The field must have a source between A and B',
      ],
      answer: 0,
      why: {
        1: 'Components describe an arrow relative to the local basis. If the basis turns, the components change while the arrow does not.',
        2: 'Polar coordinates are fine everywhere except the origin; they simply use a basis that varies from point to point.',
        3: 'A constant field has no divergence and no source; only its description changes.',
      },
      hints: ['What are components measured against?', t`Look at the blue “out” arrow $\mathbf e_r$ at A and at B in the picture.`],
      teach: 'Components change with the basis; a constant field has varying components in curvilinear coordinates — which is why plain derivatives of components mislead (step 10).',
      explain: t`At each point $\vec V = V^r\mathbf e_r + V^\theta\mathbf e_\theta$, and $\mathbf e_r$, $\mathbf e_\theta$ turn and stretch from place to place, so the numbers $V^r, V^\theta$ must change to describe the same arrow. Comparing components at two different points is therefore not the same as comparing the arrows — the problem the covariant derivative solves in step 10.`,
      visual: { type: 'gr-coordinates', params: { mode: 'field', alpha: 0, a: [3, 0.5], b: [-1, 3], naive: false, readout: false }, caption: 'A constant field of arrows (grey and gold) on a polar grid. At A and B the grid’s own unit arrows (blue “out”, violet “around”) point different ways, so the same gold arrow has different components there. Drag A and B.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-flip-burn', difficulty: 3, transfer: true,
      gen(r) {
        const [name, d] = r.pick([['Alpha Centauri, 4.37 light-years away', 4.37], ['Barnard’s Star, 5.96 light-years away', 5.96], ['Sirius, 8.6 light-years away', 8.6]]);
        const sh = Math.acosh(1 + d / 2 / CT), ans = 2 * CT * sh;
        return {
          prompt: t`A crewed ship flies to ${name}: it accelerates at $\alpha = 9.81\ \text{m/s}^2$ for the first half of the distance, then flips and decelerates at the same rate, arriving at rest. Using $x = \dfrac{c^2}{\alpha}\left(\cosh\dfrac{\alpha\tau}{c} - 1\right)$ for each half, with $c^2/\alpha = ${fmt(CT, 4)}$ light-years and $c/\alpha = ${fmt(CT, 4)}$ years, how many years pass on the crew’s clocks for the whole trip?`,
          answer: ans, units: 'yr', tol: { rel: 0.005 },
          errors: [
            { value: CT * sh, feedback: 'That is only the first half. The deceleration half takes the same crew time.' },
            { value: 2 * CT * Math.sinh(sh), feedback: 'That is Earth’s time for the trip. The crew’s clocks record τ, which is less.' },
          ],
          hints: [t`Each half covers $d/2$: solve $\cosh(\alpha\tau_\text{half}/c) = 1 + \dfrac{d/2}{c^2/\alpha}$.`, t`$\tau_\text{half} = \dfrac{c}{\alpha}\operatorname{arcosh}\left(1 + \dfrac{${d / 2}}{${fmt(CT, 4)}}\right)$; double it.`],
          teach: 'For flip-and-burn at constant proper acceleration, each half takes τ = (c/α) arcosh(1 + (d/2)α/c²) of crew time.',
          explain: t`$\cosh(\alpha\tau_\text{half}/c) = ${fmt(1 + d / 2 / CT, 4)}$, so $\alpha\tau_\text{half}/c = ${fmt(sh, 4)}$ and the crew records $2\times${fmt(CT, 4)}\times${fmt(sh, 4)} = ${fmt(ans, 3)}$ years. Earth records $2\,(c/\alpha)\sinh(${fmt(sh, 4)}) = ${fmt(2 * CT * Math.sinh(sh), 3)}$ years, and the peak speed is $\tanh(${fmt(sh, 4)}) = ${fmt(Math.tanh(sh), 3)}c$. (The fuel such a burn needs is another matter entirely.)`,
          visual: (() => {
            const D = d / CT, th = Math.sinh(sh);
            return {
              type: 'graph',
              params: {
                x: [-0.5, r4(D + 0.6)], y: [0, r4(2 * th + 0.4)], equal: true, xlabel: 'x  (units of c²/α)', ylabel: 'ct  (units of c²/α)',
                curves: [
                  { param: ['cosh(t) - 1', 'sinh(t)'], t: [0, r4(sh)], color: 'accent', width: 2.6 },
                  { param: [`${r4(D)} - (cosh(t) - 1)`, `${r4(2 * th)} - sinh(t)`], t: [0, r4(sh)], color: 'violet', width: 2.6 },
                  { param: [`${r4(D)}`, 't'], t: [0, r4(2 * th + 0.4)], color: 'ink3', dash: true, width: 1.3 },
                  { fn: 'x', color: 'warn', dash: true, width: 1.3, domain: [0, r4(D + 0.6)] },
                ],
                points: [{ x: 0, y: 0, color: 'ink', label: 'launch' }, { x: r4(D), y: r4(2 * th), color: 'ink', label: 'arrival', labelDx: -60 }],
              },
              caption: 'The flight on a spacetime diagram: accelerating (blue), then decelerating (violet); the grey line is the destination star. Units where c = 1 and c²/α = 1.',
            };
          })(),
        };
      },
    }),
    mcq({
      id: 'cp-invariant', difficulty: 2,
      prompt: t`For a vector $V$ and the gradient $\omega$ of a function, which of these is the same number in Cartesian and in polar coordinates?`,
      choices: [t`$\omega_\mu V^\mu$, summed over $\mu$`, t`The component $V^\theta$`, t`The component $\omega_\theta$`, t`$V^1 + V^2$, the sum of the components`],
      answer: 0,
      why: {
        1: t`A single component depends on the basis: $V^\theta$ does not even exist in Cartesian coordinates, and its value changes from point to point for a constant field.`,
        2: t`$\omega_\theta = \partial f/\partial\theta$ is a component too; it is the per-radian rate of change, which has no Cartesian counterpart.`,
        3: 'Adding components of different kinds (m/s and rad/s, say) is not even meaningful, let alone invariant.',
      },
      hints: ['Which expression has no free index left?', 'Upper and lower components transform with inverse matrices.'],
      teach: 'A full contraction of an upper index with a lower index is a scalar: the Jacobians cancel.',
      explain: t`$\omega'_\mu V'^\mu = \dfrac{\partial x^\nu}{\partial x'^\mu}\dfrac{\partial x'^\mu}{\partial x^\lambda}\,\omega_\nu V^\lambda = \delta^\nu{}_\lambda\,\omega_\nu V^\lambda = \omega_\nu V^\nu$. The drone gave 1 m/s both ways.`,
      visual: polarScene(2 * Math.cos(30 * DEG), 2 * Math.sin(30 * DEG), 0, t`The drone’s velocity (gold) at $(2, 30^\circ)$ with the polar basis there. Its components differ from chart to chart; the rate at which it crosses the level lines of a function does not.`),
    }),
    num({
      id: 'cp-radar', difficulty: 3, transfer: true,
      gen(r) {
        const [xk, yk, v] = r.pick([[10, 10, 250], [20, 10, 250], [5, 8, 200], [15, 12, 240]]);
        const vth = (-(yk * 1e3) * v) / ((xk * 1e3) ** 2 + (yk * 1e3) ** 2), ans = Math.abs(vth) / DEG;
        return {
          prompt: t`An air-traffic radar at the origin tracks an aircraft flying due east at ${v} m/s along the line ${yk} km north of the radar. At the moment it is ${xk} km east of the radar, how fast is its bearing angle $\theta$ changing, in degrees per second? (Use $V^\theta = \dfrac{-\sin\theta\,V^x + \cos\theta\,V^y}{r}$; give the size of the rate.)`,
          answer: ans, units: 'deg/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.abs(vth), feedback: 'That is in radians per second; convert: 1 rad = 57.3°.' },
            { value: (v / Math.hypot(xk * 1e3, yk * 1e3)) / DEG, feedback: t`That treats the whole speed as sideways ($v/r$). Only the part across the line of sight turns the bearing: $v\sin\theta/r$.` },
          ],
          hints: [t`$r = \sqrt{${xk}^2 + ${yk}^2}$ km and $\sin\theta = ${yk}/r$; with $V^x = ${v}$ m/s and $V^y = 0$, $V^\theta = -\dfrac{\sin\theta\,V^x}{r} = -\dfrac{y\,V^x}{r^2}$.`, t`$|V^\theta| = \dfrac{${yk * 1e3}\times${v}}{${(xk * 1e3) ** 2 + (yk * 1e3) ** 2}}$ rad/s; multiply by $180/\pi$.`],
          teach: 'A radar’s bearing rate is the θ-component of the target’s velocity, V^θ = (−sin θ V^x + cos θ V^y)/r — falling off as the target recedes.',
          explain: t`$|V^\theta| = \dfrac{y\,V^x}{r^2} = ${sci(Math.abs(vth))}$ rad/s $= ${fmt(ans, 3)}^\circ$/s (negative: the bearing swings clockwise, from north-east toward east). Radar antennas and missile seekers track exactly this angular rate.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4, 26], y: [-3, 16], equal: true, xlabel: 'east (km)', ylabel: 'north (km)',
              curves: [{ param: ['-2 + 28*t', `${yk}`], t: [0, 1], color: 'ink3', dash: true, width: 1.3 }, { param: [`${xk}*t`, `${yk}*t`], t: [0, 1], color: 'ink3', width: 1.2 }, { param: ['3*cos(t)', '3*sin(t)'], t: [0, r4(Math.atan2(yk, xk))], color: 'violet', width: 1.6 }],
              arrows: [{ from: [xk, yk], to: [xk + 4, yk], color: 'gold', label: `${v} m/s`, labelDx: 6, labelDy: -10 }],
              points: [{ x: 0, y: 0, color: 'accent', r: 5, label: 'radar' }, { x: xk, y: yk, color: 'gold', r: 5, label: 'aircraft', labelDx: -20, labelDy: 14 }, { x: 3.4, y: 1.1, r: 0.01, color: 'violet', label: 'θ' }],
            },
            caption: 'The radar, the aircraft’s straight track (dashed) and its line of sight. The arrow shows the velocity’s direction, not its scale.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §2.3–2.4 (vectors, dual vectors and their transformation laws)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 5: polar coordinates in the flat plane', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.): the uniformly accelerated rocket', url: 'https://www.eftaylor.com/spacetimephysics/' },
  ],
});
