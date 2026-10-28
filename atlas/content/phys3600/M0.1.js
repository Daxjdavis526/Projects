// Gradient, divergence and curl revisited (Griffiths §1.2): ∇ as one vector
// operator acting three ways, the gradient's defining property dT = ∇T·dl,
// derivatives of the separation vector (∇𝓡 = 𝓡̂, ∇(1/𝓡) = −𝓡̂/𝓡², and the sign
// flip of ∇′), radial fields r^n r̂, product rules and second derivatives.
// Builds on math2210.C3-3.5 (gradient) and C3-5.5 (divergence and curl).
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { fieldPic, pickExpr, scene3, sub, norm, dot, scale, QUADS, sf, th, sphereSurface } from './_toolkit.js';

const t = String.raw;
const pt = (p) => `(${p.map((v) => nice(v)).join(', ')})`;
/** r^m as TeX, tidy for m = 0 and 1. */
const rpow = (m) => (m === 0 ? '' : m === 1 ? 'r' : `r^{${m}}`);

/** Source point, field point and the separation arrow between them. */
const sepScene = (rp, r, caption, extra = {}) => scene3({
  range: extra.range || 3.2,
  points: [{ at: rp, color: 'warn', label: "\\vec r\\,'" }, { at: r, color: 'gold', label: '\\vec r' }],
  vectors: [{ from: rp, to: r, color: 'accent', label: '\\vec{\\mathcal R}' }, ...(extra.vectors || [])],
  segments: [{ from: [0, 0, 0], to: rp, color: 'ink3', dash: true }, { from: [0, 0, 0], to: r, color: 'ink3', dash: true }],
}, caption);

/** A radial field f(r) r̂ on a sphere of radius R (c3-flux, no numbers). */
const radialPic = (g, caption, R = 1) => ({
  type: 'c3-flux',
  params: { F: [`x*${g}`, `y*${g}`, `z*${g}`], surfaces: [sphereSurface(R)], integrand: 'none', readouts: [], flipToggle: false, normals: false, range: 1.5, alpha: 0.25, arrowLen: 0.3, arrowColor: 'accent' },
  caption,
});

export default lesson({
  id: 'phys3600.M0.1',
  title: 'Gradient, divergence and curl revisited',
  minutes: 14, difficulty: 3,
  intro: t`In [multivariable calculus](#/lesson/math2210.C3-5.5) the gradient, divergence and curl were three recipes. Here they are one object: the vector operator $\nabla$, whose components are derivatives, acting on a scalar ($\nabla T$), dotted into a vector ($\nabla\cdot\vec v$) or crossed with one ($\nabla\times\vec v$). The gradient is defined by what it does to a small step:

$$dT = \nabla T\cdot d\vec l$$

The change in $T$ along any step is the step’s component along $\nabla T$, so $\nabla T$ points **uphill** and its length is the steepest slope. Electrodynamics applies $\nabla$ above all to functions of the **separation vector** $\vec{\mathcal R} = \vec r - \vec r\,'$, the arrow from a source at $\vec r\,'$ to the point $\vec r$ where you want the field. This lesson gets those derivatives right once, so every later lesson can lean on them.`,
  symbols: [
    { tex: '\\nabla', text: t`“del”, the operator $\hat x\,\partial_x + \hat y\,\partial_y + \hat z\,\partial_z$; $\partial_x$ is short for $\partial/\partial x$. It carries units of $\text{m}^{-1}$` },
    { tex: 'T', text: 'a scalar field: a number at every point, such as a temperature in K or a potential in V' },
    { tex: 'd\\vec l', text: 'a small displacement, in m' },
    { tex: '\\nabla T', text: t`the gradient: a vector pointing the way $T$ rises fastest, with length equal to that rate (units of $T$ per metre)` },
    { tex: '\\vec{\\mathcal R} = \\vec r - \\vec r\\,\'', text: t`the separation vector from the source point $\vec r\,'$ to the field point $\vec r$ (Griffiths writes it as a script r); its length is $\mathcal R$ and its direction $\hat{\mathcal R} = \vec{\mathcal R}/\mathcal R$` },
    { tex: '\\nabla\\cdot\\vec v,\\ \\nabla\\times\\vec v', text: 'the divergence (a scalar: outflow per unit volume) and the curl (a vector: circulation per unit area, along the spin axis)' },
    { tex: '\\nabla^2 = \\nabla\\cdot\\nabla', text: 'the Laplacian, the divergence of the gradient' },
  ],
  why: t`Coulomb’s law is the gradient of $1/\mathcal R$, and the divergence of that gradient is where the delta function — and Gauss’s law — come from.`,
  visual: {
    type: 'field2d',
    title: 'Gradients, and fields that are not gradients',
    lead: t`The first three fields are gradients $\nabla T$ of the scalar whose level curves are drawn in violet; the last two are not gradients of anything. Drag the probe and read $\nabla\cdot\vec v$ and the curl’s $z$-component.`,
    tasks: [
      t`Bowl and saddle: the arrows cross the violet level curves at right angles. Along a level curve $dT = 0$, so $\nabla T\cdot d\vec l = 0$.`,
      t`On every gradient field the curl reads $0$. Whirl and shear have curl, so no $T$ has them as its gradient, and no level curves are drawn.`,
      t`Saddle: divergence and curl are both $0$ everywhere, yet the field is not zero. Hold that thought until Helmholtz’s theorem.`,
    ],
    params: {
      P: pickExpr('k', ['x', 'x', '-1.5*x*e^(-(x^2 + y^2)/4)', '-y', 'y']),
      Q: pickExpr('k', ['y', '-y', '-1.5*y*e^(-(x^2 + y^2)/4)', 'x', '0']),
      potential: pickExpr('k', ['(x^2 + y^2)/2', '(x^2 - y^2)/2', '3*e^(-(x^2 + y^2)/4)', '0', '0']),
      x: [-3, 3], y: [-3, 3], probe: [1.2, 0.8],
      choices: [{ key: 'k', label: 'Field', options: [[0, t`Bowl $\nabla\tfrac12(x^2 + y^2)$`], [1, t`Saddle $\nabla\tfrac12(x^2 - y^2)$`], [2, t`Hill $\nabla\,3e^{-r^2/4}$`], [3, t`Whirl $\langle -y, x\rangle$`], [4, t`Shear $\langle y, 0\rangle$`]], value: 1, explain: 'Three gradients of a scalar T and two fields that are not gradients.' }],
    },
    caption: t`A plane slice: every field here depends on $x$ and $y$ only. Arrow lengths are compressed so weak and strong regions both show; the probe’s divergence and curl are computed numerically.`,
  },
  example: {
    prompt: t`A source sits at $\vec r\,' = (1, 2, 0)$ m and the field point is $\vec r = (3, 1, 2)$ m. Find $\nabla(1/\mathcal R)$ at $\vec r$, where the derivatives act on the field point’s coordinates $x, y, z$.`,
    visual: sepScene([1, 2, 0], [3, 1, 2], t`The source $\vec r\,'$ (red), the field point $\vec r$ (gold) and the separation $\vec{\mathcal R}$ between them (blue). The violet arrow is $\nabla(1/\mathcal R)$ drawn 6 times longer than true. Drag to rotate.`, { vectors: [{ from: [3, 1, 2], to: [3 - 4 / 9, 1 + 2 / 9, 2 - 4 / 9], color: 'violet', label: '6\\,\\nabla(1/\\mathcal R)' }] }),
    steps: [
      { label: 'Separation', text: t`$\vec{\mathcal R} = \vec r - \vec r\,' = (2, -1, 2)$ m and $\mathcal R = \sqrt{4 + 1 + 4} = 3$ m.` },
      { label: 'Gradient of the distance', text: t`$\mathcal R = \sqrt{(x - x')^2 + (y - y')^2 + (z - z')^2}$, so $\partial_x\mathcal R = (x - x')/\mathcal R$, and likewise for $y$ and $z$. Together: $\nabla\mathcal R = \hat{\mathcal R}$. Distance grows fastest straight away from the source, at 1 metre per metre.` },
      { label: 'Chain rule', text: t`$\nabla(1/\mathcal R) = -\dfrac{1}{\mathcal R^2}\nabla\mathcal R = -\dfrac{\hat{\mathcal R}}{\mathcal R^2}$, the shape of Coulomb’s law.` },
      { label: 'Numbers', text: t`$\hat{\mathcal R} = (2, -1, 2)/3$, so $\nabla(1/\mathcal R) = -\dfrac{(2, -1, 2)}{27} \approx (-0.0741,\ 0.0370,\ -0.0741)\ \text{m}^{-2}$.` },
      { label: 'Sense check', text: t`It points from $\vec r$ back toward the source, because $1/\mathcal R$ grows as you approach it, and its length is $1/\mathcal R^2 = 1/9\ \text{m}^{-2}$ ✓. Differentiating with respect to the **source** coordinates instead flips the sign: $\nabla'(1/\mathcal R) = +\hat{\mathcal R}/\mathcal R^2$.` },
    ],
    answer: t`$\nabla(1/\mathcal R) = -\hat{\mathcal R}/\mathcal R^2 = -(2, -1, 2)/27\ \text{m}^{-2}$.`,
  },
  practice: [
    num({
      id: 'grad-inv-R', difficulty: 2,
      gen(r) {
        const q = r.pick(QUADS);
        const R = q.slice(0, 3).map((v) => v * r.sign()), L = q[3];
        const rp = [r.int(-1, 1), r.int(-1, 1), r.int(-1, 1)];
        const rr = rp.map((v, i) => v + R[i]);
        const c = r.int(0, 2), name = 'xyz'[c];
        const ans = -R[c] / L ** 3;
        return {
          prompt: t`A source sits at $\vec r\,' = ${pt(rp)}$ m and the field point is $\vec r = ${pt(rr)}$ m. Find the $${name}$-component of $\nabla(1/\mathcal R)$ at $\vec r$, differentiating with respect to the field point.`,
          visual: sepScene(rp, rr, t`The source $\vec r\,'$, the field point $\vec r$ and the separation $\vec{\mathcal R}$ (axes in metres). Drag to rotate.`, { range: Math.max(3, ...rr.map(Math.abs)) + 0.5 }),
          answer: ans, units: 'm^-2', tol: { rel: 0.005 },
          errors: [
            { value: -R[c] / L ** 2, feedback: t`That is $-\mathcal R_${name}/\mathcal R^2$: you used the vector $\vec{\mathcal R}$ where the unit vector $\hat{\mathcal R} = \vec{\mathcal R}/\mathcal R$ belongs. The result is $-\vec{\mathcal R}/\mathcal R^3$.` },
            { value: R[c] / L ** 3, feedback: t`Sign: $1/\mathcal R$ **decreases** as you move away from the source, so its gradient points back toward the source, $-\hat{\mathcal R}/\mathcal R^2$. The plus sign belongs to $\nabla'$, the derivative with respect to the source point.` },
          ],
          hints: [t`First find $\vec{\mathcal R} = \vec r - \vec r\,'$ and its length $\mathcal R$.`, t`$\nabla(1/\mathcal R) = -\hat{\mathcal R}/\mathcal R^2 = -\vec{\mathcal R}/\mathcal R^3$; take its $${name}$-component.`],
          teach: t`$\nabla(1/\mathcal R) = -\vec{\mathcal R}/\mathcal R^3$: it points from the field point back toward the source and falls off as $1/\mathcal R^2$.`,
          explain: t`$\vec{\mathcal R} = ${pt(R)}$ m, $\mathcal R = ${L}$ m, so the $${name}$-component is $-\mathcal R_${name}/\mathcal R^3 = -(${R[c]})/${L ** 3} \approx ${nice(sf(ans, 4))}\ \text{m}^{-2}$.`,
        };
      },
    }),
    mcq({
      id: 'grad-prime', difficulty: 2,
      prompt: t`Coulomb integrals mix two sets of coordinates: the field point $(x, y, z)$ and the source point $(x', y', z')$. Let $\nabla'$ be the gradient with respect to the **source** coordinates. What is $\nabla'(1/\mathcal R)$?`,
      visual: {
        type: 'graph',
        params: {
          x: [-1, 5], y: [-0.2, 3.2], aspect: 'wide', xlabel: 'source position x′ (m)', ylabel: '1/𝓡 (1/m)',
          curves: [{ fn: '1/abs(2 - x)', domain: [-1, 1.66], color: 'accent', label: '1/|x − x′| for x = 2', labelAt: 0.3, labelDy: -12 }, { fn: '1/abs(2 - x)', domain: [2.34, 5], color: 'accent' }],
          vlines: [{ x: 2, label: 'field point x = 2', color: 'gold' }],
        },
        caption: t`One dimension: $1/\mathcal R = 1/|x - x'|$ with the field point fixed at $x = 2$ m, plotted against the source position $x'$. Left of the field point $\hat{\mathcal R}$ points in $+x$.`,
      },
      choices: [t`$+\hat{\mathcal R}/\mathcal R^2$`, t`$-\hat{\mathcal R}/\mathcal R^2$, the same as $\nabla(1/\mathcal R)$`, t`$0$, because the source is held fixed`, t`$-\hat{\mathcal R}/\mathcal R$`],
      answer: 0,
      why: {
        1: t`$\mathcal R$ depends on $\vec r - \vec r\,'$, so moving the source by $d\vec r\,'$ is like moving the field point by $-d\vec r\,'$: the sign flips. In the graph, $1/\mathcal R$ rises as $x'$ moves toward $x$.`,
        2: t`Inside a Coulomb integral $\vec r\,'$ is the integration variable; $\nabla'$ asks how $1/\mathcal R$ changes as **it** moves, which is not zero.`,
        3: t`The power is wrong: $\nabla(1/\mathcal R)$ must have units of $\text{m}^{-2}$, and $\hat{\mathcal R}/\mathcal R$ has $\text{m}^{-1}$.`,
      },
      hints: [t`$\mathcal R$ depends on $x$ and $x'$ only through the difference $x - x'$.`, t`For any $f(x - x')$, $\partial f/\partial x' = -\partial f/\partial x$.`],
      teach: t`Because $\mathcal R$ depends only on $\vec r - \vec r\,'$, $\nabla' = -\nabla$ on any function of it: $\nabla'(1/\mathcal R) = +\hat{\mathcal R}/\mathcal R^2$.`,
      explain: t`$\nabla'(1/\mathcal R) = -\nabla(1/\mathcal R) = +\hat{\mathcal R}/\mathcal R^2$. Griffiths uses this flip to move derivatives between the field point and the source inside integrals, for example when proving Helmholtz’s theorem.`,
    }),
    expr({
      id: 'div-rn', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, 4, -1]);
        const nT = n === 1 ? '' : `^{${n}}`;
        const g = `(x^2 + y^2 + z^2)^(${(n - 1) / 2})`;
        return {
          prompt: t`Find the divergence of the radial field $\vec v = r${nT}\,\hat r$, where $r$ is the distance from the origin. (In Cartesian form $\vec v = ${rpow(n - 1)}\langle x, y, z\rangle$.) Give it in terms of $r$.`,
          visual: radialPic(g, t`The field $r${nT}\hat r$ on a sphere of radius 1: every arrow points straight out, and its length depends only on $r$. Drag to rotate.`),
          answer: `${n + 2} r^(${n - 1})`, answerTeX: t`${n + 2}${rpow(n - 1)}`,
          lhs: '\\nabla\\cdot\\vec v', vars: { r: [0.5, 2] },
          errors: [
            { answer: `${n} r^(${n - 1})`, feedback: t`That is $d(r${nT})/dr$, as if the divergence of a radial field were just the derivative of its size. Spreading out over a growing sphere adds $2r^{${n - 1}}$: compute $\nabla\cdot(r^{${n - 1}}\vec r)$ with the product rule.` },
            { answer: `${n + 3} r^(${n - 1})`, feedback: t`Check the product rule: $\nabla\cdot(f\vec r) = 3f + \vec r\cdot\nabla f$ with $f = r^{${n - 1}}$ (not $r${nT}$), and $\vec r\cdot\nabla f = r f'(r)$.` },
          ],
          hints: [t`Write $\vec v = f\,\vec r$ with $f = r^{${n - 1}}$ and $\vec r = \langle x, y, z\rangle$; use $\nabla\cdot(f\vec r) = f\,\nabla\cdot\vec r + \vec r\cdot\nabla f$.`, t`$\nabla\cdot\vec r = 3$ and $\nabla f = f'(r)\,\hat r$, so $\vec r\cdot\nabla f = r f'(r) = (${n - 1})r^{${n - 1}}$.`],
          teach: t`For a radial field, $\nabla\cdot(r^n\hat r) = (n + 2)r^{n-1}$: the extra 2 is the spreading of the arrows over spheres of area $4\pi r^2$.`,
          explain: t`$\nabla\cdot(r^{${n - 1}}\vec r) = 3r^{${n - 1}} + (${n - 1})r^{${n - 1}} = ${n + 2}r^{${n - 1}}$. Note the pattern $(n + 2)r^{n-1}$: it vanishes for $n = -2$, the inverse-square field — everywhere except at the origin, as lesson M0.4 shows.`,
        };
      },
    }),
    mcq({
      id: 'curl-radial', difficulty: 2,
      prompt: t`Take any field of the form $\vec v = f(r)\,\hat r$: radial, with a size that depends only on the distance from the origin. What is $\nabla\times\vec v$ away from the origin?`,
      visual: fieldPic('x*e^(-sqrt(x^2 + y^2))', 'y*e^(-sqrt(x^2 + y^2))', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.2, caption: t`A slice through one radial field, $f(r) = re^{-r}$: the arrows grow and then shrink with distance, but always point straight out. Lengths compressed.` }),
      choices: [t`$\vec 0$, for every $f$`, t`$f'(r)\,\hat\phi$, because the size changes with $r$`, t`$\vec 0$ only if $f$ is constant`, t`It depends on $f$: zero only for $f = 1/r^2$`],
      answer: 0,
      why: {
        1: t`A change of size **along** the arrows is stretching, not swirl. The curl comes from a field changing **across** its own direction, and a radial field has no sideways variation.`,
        2: t`Compute it: $\nabla\times(g\vec r) = g\,\nabla\times\vec r - \vec r\times\nabla g$ with $g = f/r$. Both terms vanish for any $g(r)$.`,
        3: t`You may be thinking of the divergence, which is zero away from the origin only for $f \propto 1/r^2$. The curl is zero for every $f(r)$.`,
      },
      hints: [t`Write $\vec v = g(r)\,\vec r$ with $g = f/r$, and use $\nabla\times(g\vec r) = g\,(\nabla\times\vec r) - \vec r\times\nabla g$.`, t`$\nabla\times\vec r = \vec 0$, and $\nabla g = g'(r)\,\hat r$ is parallel to $\vec r$.`],
      teach: t`Every central field $f(r)\hat r$ is curl-free: it is the gradient of $\int f\,dr$.`,
      explain: t`$\nabla\times(g\vec r) = g\cdot\vec 0 - \vec r\times g'(r)\hat r = \vec 0$, since a vector crossed with itself vanishes. So every central field is a gradient — the field of a point charge included — which is why electrostatics has a potential.`,
    }),
    match({
      id: 'product-rules', difficulty: 2,
      prompt: t`Match each derivative of a product to its expansion. Here $f$ and $g$ are scalar fields, $\vec A$ and $\vec B$ vector fields.`,
      left: [t`$\nabla(fg)$`, t`$\nabla\cdot(f\vec A)$`, t`$\nabla\times(f\vec A)$`, t`$\nabla\cdot(\vec A\times\vec B)$`],
      right: ['f ∇g + g ∇f', 'f (∇·A) + A·(∇f)', 'f (∇×A) − A×(∇f)', 'B·(∇×A) − A·(∇×B)', 'f (∇×A) + A×(∇f)', 'A·(∇×B) − B·(∇×A)'],
      answer: [0, 1, 2, 3],
      hints: ['Each rule has one term per factor that ∇ can hit.', t`Check a sign by a simple case: for $\vec A = \hat z$ and $f = x$, $\nabla\times(x\hat z) = -\hat y$.`],
      teach: 'Every product rule has one term for each factor the derivative hits; the signs come from reordering cross products.',
      explain: t`$\nabla(fg) = f\nabla g + g\nabla f$; $\nabla\cdot(f\vec A) = f(\nabla\cdot\vec A) + \vec A\cdot\nabla f$; $\nabla\times(f\vec A) = f(\nabla\times\vec A) - \vec A\times\nabla f$; $\nabla\cdot(\vec A\times\vec B) = \vec B\cdot(\nabla\times\vec A) - \vec A\cdot(\nabla\times\vec B)$. Check the third with $f = x$, $\vec A = \hat z$: directly, $\nabla\times(x\hat z) = (\partial_y x,\ -\partial_x x,\ 0) = -\hat y$, and the rule gives $0 - \hat z\times\nabla x = -\hat z\times\hat x = -\hat y$ ✓.`,
    }),
    num({
      id: 'rate-along', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 4]), B = r.pick([1, 2, 5]);
        const p = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])];
        const q = r.pick([[1, 2, 2], [2, 1, 2], [2, 2, 1]]).map((v) => v * r.sign());
        const u = q.map((v) => v / 3);
        const G = [A * p[1] * p[1], 2 * A * p[0] * p[1], 2 * B * p[2]];
        let ans = dot(G, u);
        for (let k = 0; k < 3 && Math.abs(ans) < 0.5; k++) { q[k] = -q[k]; u[k] = -u[k]; ans = dot(G, u); }
        const gm = norm(G);
        return {
          prompt: t`The potential near an electrode is $V = ${A}xy^2 + ${B}z^2$ (in volts, with $x, y, z$ in metres). At the point $${pt(p)}$, how fast does $V$ change, in V/m, as you move in the direction of $(${q.join(', ')})$?`,
          visual: scene3({ range: 3, points: [{ at: p, color: 'gold', label: 'P' }], vectors: [{ from: p, to: p.map((v, i) => v + 1.2 * u[i]), color: 'accent', label: '\\hat u' }, { from: p, to: p.map((v, i) => v + 1.2 * G[i] / gm), color: 'violet', label: '\\nabla V\\ (\\text{direction})' }] }, t`The point, the direction of travel $\hat u$ (blue, unit length) and the direction of $\nabla V$ there (violet, drawn at unit length). Drag to rotate.`),
          answer: ans, units: 'V/m', tol: { rel: 0.005 },
          errors: [
            { value: dot(G, q), feedback: t`You dotted $\nabla V$ with $(${q.join(', ')})$ itself, which has length 3. A rate per metre needs the **unit** vector $\hat u = (${q.join(', ')})/3$.` },
            ...(Math.abs(gm - Math.abs(ans)) > 0.05 ? [{ value: gm, feedback: t`That is $|\nabla V|$, the rate in the steepest direction. Along another direction the rate is $\nabla V\cdot\hat u$, which is smaller.` }] : []),
          ],
          hints: [t`$dV = \nabla V\cdot d\vec l$, so the rate along a unit vector $\hat u$ is $\nabla V\cdot\hat u$.`, t`$\nabla V = \langle ${A}y^2,\ ${2 * A}xy,\ ${2 * B}z\rangle$; normalize the direction first: $\hat u = (${q.join(', ')})/3$.`],
          teach: t`The rate of change of $T$ along a unit vector $\hat u$ is $\nabla T\cdot\hat u$ — the definition $dT = \nabla T\cdot d\vec l$ with $d\vec l = \hat u\,dl$.`,
          explain: t`$\nabla V = (${G.join(', ')})$ V/m at that point, so $\nabla V\cdot\hat u = \tfrac13\big[(${G[0]})(${q[0]}) + (${G[1]})(${q[1]}) + (${G[2]})(${q[2]})\big] = ${nice(sf(ans, 4))}$ V/m. The steepest rate would be $|\nabla V| = ${nice(sf(gm, 4))}$ V/m. (The electric field there is $\vec E = -\nabla V$.)`,
        };
      },
    }),
    mcq({
      id: 'error-div-rhat', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “The unit vector $\hat r$ always has length 1, so nothing about it changes from point to point, and $\nabla\cdot\hat r = 0$.” What is wrong?`,
      visual: fieldPic('x/sqrt(x^2 + y^2)', 'y/sqrt(x^2 + y^2)', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.2, toScale: 0.18, caption: t`A slice through the field $\hat r$, drawn to scale: every arrow has the same length but they fan out.` }),
      choices: [t`$\hat r$ changes **direction** from point to point; $\nabla\cdot\hat r = 2/r$`, 'Nothing: a field of unit vectors has zero divergence', t`$\nabla\cdot\hat r = 3/r$, since $\nabla\cdot\vec r = 3$`, t`$\nabla\cdot\hat r = -1/r^2$, the derivative of its size`],
      answer: 0,
      why: {
        1: t`Equal lengths are not enough: the arrows fan out, so a small box loses more through its outer face (larger area) than it gains through its inner one.`,
        2: t`Dividing $\nabla\cdot\vec r = 3$ by $r$ forgets that $1/r$ varies: $\nabla\cdot(\vec r/r) = 3/r + \vec r\cdot\nabla(1/r) = 3/r - 1/r$.`,
        3: t`$\hat r$ has constant size; the divergence of a radial field is not the derivative of its size (that is the Cartesian habit). Use $(1/r^2)\,\partial_r(r^2 v_r)$ or the product rule.`,
      },
      hints: [t`Write $\hat r = \vec r/r$ and use $\nabla\cdot(f\vec A) = f\,\nabla\cdot\vec A + \vec A\cdot\nabla f$.`, t`$\nabla(1/r) = -\hat r/r^2$, so $\vec r\cdot\nabla(1/r) = -1/r$.`],
      teach: t`Unit vectors like $\hat r$ are fields that change direction from place to place, so their derivatives are not zero: $\nabla\cdot\hat r = 2/r$.`,
      explain: t`$\nabla\cdot\hat r = \nabla\cdot(\vec r/r) = 3/r - 1/r = 2/r$ — the earlier result $(n + 2)r^{n-1}$ with $n = 0$. Treating $\hat r$, $\hat\theta$ or $\hat\phi$ as constants is the single most common slip in curvilinear calculations.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-lap-rn', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4, -2, -3]);
        const nT = `r^{${n}}`;
        return {
          prompt: t`Find the Laplacian $\nabla^2(${nT})$, for $r \ne 0$. Give it in terms of $r$.`,
          visual: radialPic(`${n}*(x^2 + y^2 + z^2)^(${(n - 2) / 2})`, t`The gradient $\nabla(${nT}) = ${n}r^{${n - 1}}\hat r$ on a sphere of radius 1${n < 0 ? ' (it points inward, since the function falls with r)' : ''}. The Laplacian is the divergence of this field. Drag to rotate.`),
          answer: `${n * (n + 1)} r^(${n - 2})`, answerTeX: t`${n * (n + 1)}${rpow(n - 2)}`,
          lhs: `\\nabla^2(${nT})`, vars: { r: [0.5, 2] },
          errors: [
            { answer: `${n * (n - 1)} r^(${n - 2})`, feedback: t`That is $d^2(${nT})/dr^2$, the one-dimensional second derivative. In three dimensions $\nabla^2 f(r) = \tfrac{1}{r^2}\tfrac{d}{dr}\big(r^2 f'\big) = f'' + \tfrac{2}{r}f'$.` },
            { answer: `${n * (n + 2)} r^(${n - 2})`, feedback: t`Use $\nabla\cdot(r^m\hat r) = (m + 2)r^{m-1}$ with $m = ${n - 1}$, the power of $r$ in the gradient, not ${n}.` },
          ],
          hints: [t`First $\nabla(${nT}) = ${n}r^{${n - 1}}\hat r$.`, t`Then $\nabla\cdot(r^m\hat r) = (m + 2)r^{m-1}$ with $m = ${n - 1}$.`],
          teach: t`$\nabla^2 r^n = n(n + 1)r^{n-2}$: it vanishes for $n = 0$ and $n = -1$, which is why $1/r$ is the potential of a point source.`,
          explain: t`$\nabla^2(${nT}) = \nabla\cdot(${n}r^{${n - 1}}\hat r) = ${n}(${n - 1} + 2)r^{${n - 2}} = ${n * (n + 1)}r^{${n - 2}}$. In general $\nabla^2 r^n = n(n + 1)r^{n-2}$, which is zero for $n = -1$: $1/r$ is harmonic everywhere except the origin.`,
        };
      },
    }),
    num({
      id: 'cp-orbit-g', difficulty: 2, transfer: true,
      gen(r) {
        const GM = 3.986004e14, RE = 6371;
        const [name, rk] = r.pick([['the International Space Station', RE + 420], ['the Hubble Space Telescope', RE + 540], ['a GPS satellite', 26560], ['a geostationary satellite', 42164]]);
        const R = rk * 1e3, ans = GM / R ** 2, h = R - RE * 1e3;
        return {
          prompt: t`Earth’s gravitational potential outside the planet is $\Phi = -GM/\mathcal R$, with $\mathcal R$ the distance from Earth’s centre and $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$. The gravitational field is $\vec g = -\nabla\Phi$. Find $|\vec g|$ at ${name}, ${th(rk)} km from Earth’s centre (${th(Math.round(h / 1e3))} km up).`,
          visual: scene3({ range: 3.2, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'teal' }], points: [{ at: [0, 0, 0], color: 'warn', label: "\\vec r\\,'" }, { at: [0.5, 2.6, 0.9], color: 'gold', label: '\\vec r' }], vectors: [{ from: [0, 0, 0], to: [0.5, 2.6, 0.9], color: 'accent', label: '\\vec{\\mathcal R}' }] }, t`Earth (the teal sphere, all its mass treated as sitting at the centre $\vec r\,'$, which is exact for a spherical Earth) and the spacecraft at $\vec r$. Not to scale.`),
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: GM / h ** 2, feedback: t`You used the altitude. $\mathcal R$ is measured from the source point — Earth’s centre — so add Earth’s radius, 6371 km.` },
            { value: GM / R, feedback: t`That is $|\Phi|$ itself. The field is its gradient: $|\nabla(1/\mathcal R)| = 1/\mathcal R^2$.` },
          ],
          hints: [t`$\nabla(1/\mathcal R) = -\hat{\mathcal R}/\mathcal R^2$, so $\vec g = -\nabla\Phi = GM\,\nabla(1/\mathcal R) = -GM\,\hat{\mathcal R}/\mathcal R^2$.`, t`Use $\mathcal R = ${nice(rk)}\times10^{3}$ m.`],
          teach: t`$\nabla(1/\mathcal R) = -\hat{\mathcal R}/\mathcal R^2$ turns a $1/\mathcal R$ potential into an inverse-square field pointing back at the source.`,
          explain: t`$|\vec g| = GM/\mathcal R^2 = 3.986\times10^{14}/(${nice(rk)}\times10^{3})^2 \approx ${nice(sf(ans, 3))}\ \text{m/s}^2$, pointing toward Earth’s centre. ${rk < 7000 ? 'Astronauts there are not weightless for lack of gravity — it is still about 90% of the surface value; they are in free fall.' : 'Gravity is weak this far out, but it is still exactly what keeps the satellite in orbit.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-grad-cross', difficulty: 3,
      prompt: t`For any two smooth scalar fields $f$ and $g$, what is $\nabla\cdot(\nabla f\times\nabla g)$?`,
      visual: scene3({ range: 2.5, points: [{ at: [1, 1, 1], color: 'gold', label: 'P' }], vectors: [{ from: [1, 1, 1], to: [2, 1.6, 1], color: 'accent', label: '\\nabla f' }, { from: [1, 1, 1], to: [1, 1, 2.1], color: 'teal', label: '\\nabla g' }, { from: [1, 1, 1], to: [1.6, 0, 1], color: 'violet', label: '\\nabla f\\times\\nabla g' }] }, t`At a point $P$: two gradients and their cross product, which is perpendicular to both (lengths illustrative). Drag to rotate.`),
      choices: [t`$0$, for every $f$ and $g$`, t`$\nabla^2 f\,\nabla^2 g$`, t`$\nabla f\cdot\nabla g$`, t`It depends on $f$ and $g$; zero only if they are harmonic`],
      answer: 0,
      why: {
        1: t`The product rule for $\nabla\cdot(\vec A\times\vec B)$ involves the **curls** of $\vec A$ and $\vec B$, not their divergences.`,
        2: 'The divergence of a cross product never gives a dot product of the two vectors themselves.',
        3: t`Expand with $\nabla\cdot(\vec A\times\vec B) = \vec B\cdot(\nabla\times\vec A) - \vec A\cdot(\nabla\times\vec B)$: both curls vanish for gradients whatever $f$ and $g$ are.`,
      },
      hints: [t`Use $\nabla\cdot(\vec A\times\vec B) = \vec B\cdot(\nabla\times\vec A) - \vec A\cdot(\nabla\times\vec B)$ with $\vec A = \nabla f$, $\vec B = \nabla g$.`, t`What is the curl of any gradient?`],
      teach: t`Curl of a gradient is always zero, so $\nabla f\times\nabla g$ is always divergence-free.`,
      explain: t`$\nabla\cdot(\nabla f\times\nabla g) = \nabla g\cdot(\nabla\times\nabla f) - \nabla f\cdot(\nabla\times\nabla g) = 0 - 0$. So $\nabla f\times\nabla g$ is divergence-free for every $f$ and $g$ — by Helmholtz’s theorem (lesson M0.5) it is itself the curl of something: $\nabla\times(f\nabla g)$, as the product rule confirms.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'OpenStax Calculus Vol. 3, §6.5 Divergence and curl', url: 'https://openstax.org/books/calculus-volume-3/pages/6-5-divergence-and-curl' },
  ],
});
