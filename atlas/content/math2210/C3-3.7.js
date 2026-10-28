// Maxima, minima and saddle points: critical points where ∇f = 0, the
// Hessian and its determinant D, absolute extrema on closed regions — and the
// five Lagrange points of a rotating two-body system as critical points of an
// effective potential, with the honest twist that L4 and L5 are maxima.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { surf, r6 } from './_partials.js';

const t = String.raw;

// the restricted three-body effective potential, G(M₁ + M₂) = 1, separation 1, Ω = 1,
// softened very close to each mass; mass ratio μ = M₂/(M₁ + M₂) = 0.1 for a readable picture
const MU = 0.1;
const PHI = `-(1 - ${MU})/sqrt((x + ${MU})^2 + y^2 + 0.0004) - ${MU}/sqrt((x - 1 + ${MU})^2 + y^2 + 0.00005) - 0.5*(x^2 + y^2)`;
const LPTS = [[0.60904, 0, 'L1'], [1.2597, 0, 'L2'], [-1.04161, 0, 'L3'], [0.4, 0.86603, 'L4'], [0.4, -0.86603, 'L5']];
const lagrangeMap = (caption, { labels = true } = {}) => ({
  type: 'c3-contour',
  params: {
    f: PHI, x: [-1.6, 1.6], y: [-1.3, 1.3], levels: [-2.3, -1.95, -1.79848, -1.73334, -1.62, -1.54979, -1.48, -1.462], labels: false, fillAlpha: 0.35,
    points: [
      { x: -MU, y: 0, color: 'accent', label: 'M₁' }, { x: 1 - MU, y: 0, color: 'ink2', label: 'M₂' },
      ...(labels ? LPTS.map(([x, y, l]) => ({ x, y, color: 'gold', label: l })) : []),
    ],
  },
  caption,
});

/** Graphs of f along lines through a point, as functions of the distance s along each. */
const traces = (curves, { x = [-1.6, 1.6], y, caption }) => ({
  type: 'graph', params: { x, y, aspect: 'wide', xlabel: 's (along the line)', ylabel: 'f', curves: curves.map((c) => ({ width: 2.4, labelDx: 6, labelDy: -12, ...c })) }, caption,
});

export default lesson({
  id: 'math2210.C3-3.7',
  title: 'Maxima, minima and saddle points',
  minutes: 12, difficulty: 3,
  intro: t`At a peak, a pit or a mountain pass the tangent plane is level: $\nabla f = \vec 0$, a **critical point**. Which kind it is depends on how the surface curves there, and the second partial derivatives record that in the **Hessian** matrix $H = \begin{pmatrix} f_{xx} & f_{xy} \\ f_{xy} & f_{yy}\end{pmatrix}$. Its determinant decides:

$$D = f_{xx}\,f_{yy} - f_{xy}^2$$

$D > 0$ with $f_{xx} > 0$: a **local minimum**. $D > 0$ with $f_{xx} < 0$: a **local maximum**. $D < 0$: a **saddle point**, rising one way and falling another. $D = 0$: the test cannot tell. Equilibria in physics are critical points of a potential energy — and the five Lagrange points of the Earth–Moon system turn out to be three saddles and two maxima.`,
  symbols: [
    { tex: 'f_{xx},\\ f_{yy}', text: 'the curvature of the graph along $x$ and along $y$: second partials, in units of $f$ per unit length squared' },
    { tex: 'f_{xy}', text: 'the **twist**: how the $x$-slope changes as you move in $y$ (equal to $f_{yx}$ for smooth $f$)' },
    { tex: 'H', text: 'the Hessian, the matrix of second partials; its two eigenvalues are the largest and smallest curvatures at the point' },
    { tex: 'D', text: 'the determinant of $H$, the product of those two curvatures: positive when they agree in sign, negative when they disagree' },
  ],
  why: t`The Hessian of the gravitational potential, $\partial^2\Phi/\partial x^i\partial x^j$, is the Newtonian **tidal tensor** — the very quantity general relativity reinterprets as the curvature of spacetime.`,
  visual: {
    type: 'surface3d',
    title: 'Bowl, dome or saddle?',
    lead: t`The surface is $z = ax^2 + bxy + cy^2$, the simplest function with a critical point at the origin. Its Hessian is $\begin{pmatrix} 2a & b \\ b & 2c\end{pmatrix}$, so $D = 4ac - b^2$. The gold and violet curves run along the two **principal directions**, where the surface curves most and least; the readouts give those curvatures, the eigenvalues of $H$.`,
    tasks: [
      t`Start from the bowl ($D > 0$). Increase the twist $b$: at $b^2 = 4ac$ the bowl flattens into a trough, and beyond it becomes a saddle — although $a$ and $c$ never changed sign.`,
      t`Set $b = 0$ and give $a$ and $c$ opposite signs: a saddle, with the gold curve rising and the violet one falling. The floor’s level curves cross like an X.`,
      t`Compare the eigenvalues with $D$: both positive means a minimum, both negative a maximum, one of each a saddle — and $D$ is their product.`,
    ],
    params: {
      z: 'a*x^2 + b*x*y + c*y^2', domain: [[-1.2, 1.2], [-1.2, 1.2]], zscale: 0.6, n: 36, levels: 12, dist: 8, pitch: 0.5,
      sliders: [
        { key: 'a', label: '$a$', min: -1.5, max: 1.5, step: 0.1, value: 1, explain: t`Half the curvature along $x$: $f_{xx} = 2a$.` },
        { key: 'b', label: '$b$ (twist)', min: -3, max: 3, step: 0.1, value: 0.6, explain: t`The mixed partial $f_{xy} = b$: how the $x$-slope changes as you move in $y$.` },
        { key: 'c', label: '$c$', min: -1.5, max: 1.5, step: 0.1, value: 0.5, explain: t`Half the curvature along $y$: $f_{yy} = 2c$.` },
      ],
      curves: [
        { param: ['t*cos(atan2(b, a - c)/2)', 't*sin(atan2(b, a - c)/2)', '0.6*(a*cos(atan2(b, a - c)/2)^2 + b*cos(atan2(b, a - c)/2)*sin(atan2(b, a - c)/2) + c*sin(atan2(b, a - c)/2)^2)*t^2'], t: [-1.2, 1.2], color: 'gold', width: 3 },
        { param: ['-t*sin(atan2(b, a - c)/2)', 't*cos(atan2(b, a - c)/2)', '0.6*(a*sin(atan2(b, a - c)/2)^2 - b*cos(atan2(b, a - c)/2)*sin(atan2(b, a - c)/2) + c*cos(atan2(b, a - c)/2)^2)*t^2'], t: [-1.2, 1.2], color: 'violet', width: 3 },
      ],
      readouts: [
        { label: '$D = 4ac - b^2$', expr: '4*a*c - b^2', digits: 3 },
        { label: '$f_{xx} = 2a$', expr: '2*a', digits: 3 },
        { label: 'eigenvalues of $H$', expr: 'a + c + sqrt((a - c)^2 + b^2)', digits: 3 },
        { label: 'and', expr: 'a + c - sqrt((a - c)^2 + b^2)', digits: 3 },
      ],
    },
    caption: t`Heights scaled by 0.6. Level curves on the floor: ellipses around an extremum, a crossing X of hyperbolas through a saddle, parallel lines when $D = 0$. Drag to rotate.`,
  },
  example: {
    prompt: t`In a frame rotating with the Earth and the Moon, a spacecraft feels the effective potential $\Phi(x, y) = -\dfrac{1 - \mu}{r_1} - \dfrac{\mu}{r_2} - \tfrac12(x^2 + y^2)$, in units where the Earth–Moon distance, $G(M_1 + M_2)$ and the rotation rate are all 1; $\mu = 0.0122$ is the Moon’s share of the mass. Its critical points are the five Lagrange points, where the spacecraft can sit still in this frame. Classify L1 and L4.`,
    visual: lagrangeMap(t`Level curves of an effective potential $\Phi$ through its five critical points, drawn for a mass ratio of 1 : 9 ($\mu = 0.1$) so the shape is readable; for Earth and Moon ($\mu = 0.012$) the pattern is the same, with L1 and L2 crowded in near the Moon. Gold bands are high $\Phi$.`),
    steps: [
      { label: 'Why critical points', text: t`$-\nabla\Phi$ is the gravitational pull of both bodies plus the centrifugal push of the rotating frame. Where $\nabla\Phi = \vec 0$ they balance, and a body at rest stays at rest — a Lagrange point.` },
      { label: 'L1, on the line', text: t`L1 lies between the bodies, $0.151$ of the way from the Moon (58 000 km). Computed there: $\Phi_{xx} = -11.3$, $\Phi_{yy} = 4.15$, and $\Phi_{xy} = 0$ by the mirror symmetry about the line.` },
      { label: 'Test L1', text: t`$D = (-11.3)(4.15) - 0^2 = -46.9 < 0$: a **saddle**. Along the Earth–Moon line, L1 is the top of a ridge (falling toward either body); across the line it is the bottom of a valley.` },
      { label: 'L4, the triangle point', text: t`L4 makes an equilateral triangle with the two bodies. There $\Phi_{xx} = -\tfrac34$, $\Phi_{yy} = -\tfrac94$ and $\Phi_{xy} = -\tfrac{3\sqrt3}{4}(1 - 2\mu)$, so $D = \tfrac{27}{16}\left[1 - (1 - 2\mu)^2\right] = \tfrac{27}{4}\mu(1 - \mu) = 0.081$.` },
      { label: 'Test L4', text: t`$D > 0$ and $\Phi_{xx} < 0$: L4 is a **local maximum** of $\Phi$ — the top of the gold “tadpole” hills in the picture. L5 is its mirror image.` },
      { label: 'The twist', text: t`A ball at the top of a hill rolls off, yet spacecraft and the Trojan asteroids at Jupiter’s L4 and L5 stay put. The reason is a force the potential leaves out: the **Coriolis force**, which depends on velocity and turns any drift into a loop around the point. It wins when $\mu < 0.0385$, true for Earth–Moon and Sun–Jupiter. The Hessian classifies the potential, not the whole motion.` },
    ],
    answer: t`L1: $D = -46.9 < 0$, a saddle. L4: $D = \tfrac{27}{4}\mu(1 - \mu) > 0$ with $\Phi_{xx} < 0$, a local maximum of $\Phi$ — kept stable by the Coriolis force.`,
  },
  practice: [
    num({
      id: 'D-value', difficulty: 1,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4, 5]), c = r.pick([-1, 1, 2]);
        const D = 4 * a * c - b * b;
        return {
          prompt: t`The function $f(x, y) = ${a === 1 ? '' : a}x^2 + ${b}xy ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}y^2$ has a critical point at the origin. Find $D = f_{xx}f_{yy} - f_{xy}^2$ there.`,
          visual: surf((x, y) => `${a}*${x}^2 + ${b}*${x}*${y} + ${c}*${y}^2`, { domain: [[-1.2, 1.2], [-1.2, 1.2]], zscale: r6(1.6 / (a + b + Math.abs(c))), levels: 10, dist: 8, caption: t`The graph near the origin (heights scaled), with level curves on the floor. Drag to rotate.` }),
          answer: D, tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: a * c - b * b, feedback: t`$f_{xx} = 2\cdot${a}$ and $f_{yy} = 2\cdot${c}$: differentiating $x^2$ twice gives 2, not 1.` },
            ...(4 * a * c - (b * b) / 4 !== D ? [{ value: 4 * a * c - (b * b) / 4, feedback: t`$f_{xy} = ${b}$, the whole coefficient of $xy$ — not half of it.` }] : []),
          ],
          hints: [t`$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$ and $f_{xy} = ${b}$.`],
          teach: 'For f = ax² + bxy + cy², the second partials are 2a, 2c and b, so D = 4ac − b².',
          explain: t`$D = (${2 * a})(${2 * c}) - ${b}^2 = ${4 * a * c} - ${b * b} = ${D}$${D < 0 ? ': negative, so the origin is a saddle' : D > 0 ? `: positive with $f_{xx} > 0$, a local minimum` : ': zero, so the test is inconclusive'}.`,
        };
      },
    }),
    mcq({
      id: 'classify-cubic', difficulty: 2,
      prompt: t`$f(x, y) = x^3 - 3xy + y^3$ has critical points at $(0, 0)$ and $(1, 1)$. How do they classify?`,
      visual: traces([{ fn: '2x^3 - 3x^2', color: 'gold', label: 'f along the diagonal y = x', labelAt: -0.6, labelDy: 18 }], { x: [-0.8, 1.6], y: [-1.6, 0.6], caption: t`$f$ along the diagonal $y = x$ only, where it is $2s^3 - 3s^2$: a maximum at $s = 0$ and a minimum at $s = 1$ along this one line.` }),
      choices: [
        t`$(0, 0)$ is a saddle and $(1, 1)$ a local minimum`,
        t`$(0, 0)$ is a local maximum and $(1, 1)$ a local minimum`,
        t`Both are saddles`,
        t`$(0, 0)$ is a local minimum and $(1, 1)$ a saddle`,
      ],
      answer: 0,
      why: {
        1: t`Along the diagonal $(0, 0)$ looks like a maximum, but along the $x$-axis $f = x^3$, which rises on one side: at the origin $D = 0\cdot0 - (-3)^2 = -9 < 0$.`,
        2: t`At $(1, 1)$, $D = 6\cdot6 - 9 = 27 > 0$: not a saddle.`,
        3: t`At the origin $f_{xx} = f_{yy} = 0$ and the twist $f_{xy} = -3$ makes $D = -9$, a saddle; $(1, 1)$ has $D = 27 > 0$.`,
      },
      hints: [t`$f_{xx} = 6x$, $f_{yy} = 6y$ and $f_{xy} = -3$.`, t`At $(0, 0)$: $D = 0 - 9$. At $(1, 1)$: $D = 36 - 9$, with $f_{xx} = 6$.`],
      teach: t`Classify each critical point separately, with $D = f_{xx}f_{yy} - f_{xy}^2$ evaluated there.`,
      explain: t`At $(0, 0)$: $D = -9 < 0$, a saddle. At $(1, 1)$: $D = 27 > 0$ and $f_{xx} = 6 > 0$, a local minimum with $f(1, 1) = -1$. One line through a point can never settle what it is: the diagonal makes the saddle look like a maximum.`,
    }),
    mcq({
      id: 'twist', difficulty: 3,
      prompt: t`For $f(x, y) = x^2 + 3xy + y^2$, the graph curves **upward** along the $x$-axis ($f = x^2$) and along the $y$-axis ($f = y^2$). Is the origin a local minimum?`,
      visual: traces([{ fn: 'x^2', color: 'accent', label: 'along the x-axis (and the y-axis): s²', labelAt: 0.25, labelDx: 10, labelDy: -10 }], { x: [-1.6, 1.6], y: [-1.2, 2.8], caption: t`$f$ along the two axes, where it is $s^2$ either way: both curve upward. These are the only lines drawn.` }),
      choices: [
        t`No: $D = 2\cdot2 - 3^2 = -5 < 0$, a saddle; along $y = -x$, $f = -x^2$`,
        t`Yes: it curves upward in both coordinate directions`,
        t`Yes: $f_{xx} = 2 > 0$, so the test says minimum`,
        t`The test is inconclusive, because the twist is not zero`,
      ],
      answer: 0,
      why: {
        1: t`Two directions are not all directions. The twist term $3xy$ is negative whenever $x$ and $y$ have opposite signs, and there it wins.`,
        2: t`The sign of $f_{xx}$ matters only once $D > 0$. Here $D < 0$, so it is a saddle whatever $f_{xx}$ is.`,
        3: t`A nonzero twist is no problem: the test is inconclusive only when $D = 0$.`,
      },
      hints: ['Compute D, not just the two curvatures along the axes.', t`Try the diagonal $y = -x$.`],
      teach: t`A big enough twist $f_{xy}$ turns a would-be bowl into a saddle: always check the full $D$.`,
      explain: t`$D = f_{xx}f_{yy} - f_{xy}^2 = 4 - 9 = -5 < 0$: a saddle. Along $y = -x$, $f = x^2 - 3x^2 + x^2 = -x^2$, so the surface falls that way. The twist matters as much as the curvatures along the axes.`,
    }),
    num({
      id: 'find-critical', difficulty: 2,
      gen(r) {
        const a = r.pick([3, 4, 5, 6]), b = r.pick([2, 3, -3, 6]);
        // f = x^2 + xy + y^2 - a x - b y: f_x = 2x + y - a = 0, f_y = x + 2y - b = 0
        const x0 = (2 * a - b) / 3, y0 = (2 * b - a) / 3;
        return {
          prompt: t`Find the $x$-coordinate of the critical point of $f(x, y) = x^2 + xy + y^2 - ${a}x ${b < 0 ? '+' : '-'} ${Math.abs(b)}y$. (It turns out to be a minimum.)`,
          visual: { type: 'c3-contour', params: { f: `x^2 + x*y + y^2 - ${a}*x - ${b}*y`, x: [-3, 5], y: [-3.5, 3.5], levels: 10, labels: false }, caption: t`Level curves of $f$ (unlabelled): nested tilted ellipses around one point.` },
          answer: x0, tol: { rel: 1e-3, abs: 1e-6 },
          errors: x0 === y0 ? [] : [{ value: y0, feedback: t`That is the $y$-coordinate. Solve $2x + y = ${a}$ and $x + 2y = ${b}$ for $x$.` }],
          hints: [t`Set both partials to zero: $f_x = 2x + y - ${a} = 0$ and $f_y = x + 2y ${b < 0 ? '+' : '-'} ${Math.abs(b)} = 0$.`, t`Double the first equation and subtract the second: $3x = ${2 * a - b}$.`],
          teach: 'Critical points solve ∇f = 0: one equation per variable.',
          explain: t`From $2x + y = ${a}$ and $x + 2y = ${b}$: $x = \tfrac{2(${a}) - (${b})}{3} = ${nice(x0)}$ and $y = \tfrac{2(${b}) - ${a}}{3} = ${nice(y0)}$. With $f_{xx} = f_{yy} = 2$ and $f_{xy} = 1$, $D = 3 > 0$: a minimum.`,
        };
      },
    }),
    num({
      id: 'boundary', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3]), k = r.pick([2, 4]);
        // f = x^2 + y^2 - k x on x^2 + y^2 <= R^2: interior min at (k/2, 0); on the boundary f = R^2 - k x, max at x = -R
        const max = R * R + k * R;
        return {
          prompt: t`Find the absolute maximum of $f(x, y) = x^2 + y^2 - ${k}x$ on the closed disc $x^2 + y^2 \le ${R * R}$.`,
          visual: { type: 'c3-contour', params: { f: `x^2 + y^2 - ${k}*x`, x: [-R - 0.6, R + 0.6], y: [-R - 0.4, R + 0.4], levels: 9, curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.6 }] }, caption: t`Level curves of $f$ and the edge of the disc (gold), radius ${R}.` },
          answer: max, tol: { rel: 1e-6, abs: 1e-9 },
          errors: [{ value: -(k * k) / 4, feedback: t`That is the value at the only critical point, $(${k / 2}, 0)$ — the minimum. The maximum hides on the boundary.` }, { value: R * R - k * R, feedback: t`On the boundary $f = ${R * R} - ${k}x$, which is largest where $x$ is **smallest**, at $x = -${R}$.` }],
          hints: ['Check the critical points inside, then the boundary, then compare.', t`On the circle $x^2 + y^2 = ${R * R}$, $f = ${R * R} - ${k}x$, with $-${R} \le x \le ${R}$.`],
          teach: 'On a closed, bounded region the absolute extrema occur at interior critical points or on the boundary — check both.',
          explain: t`Inside: $\nabla f = (2x - ${k},\ 2y) = \vec 0$ at $(${k / 2}, 0)$, where $f = ${nice(-(k * k) / 4)}$ (the minimum). On the boundary $f = ${R * R} - ${k}x$, largest at $(-${R}, 0)$: $f = ${R * R} + ${k * R} = ${max}$. So the absolute maximum is ${max}.`,
        };
      },
    }),
    mcq({
      id: 'error-D', difficulty: 2, kind: 'error',
      prompt: t`At a critical point a student finds $f_{xx} = 4$, $f_{yy} = 1$ and $f_{xy} = 3$. They write: “$f_{xx} > 0$, so it is a local minimum.” What is wrong?`,
      visual: traces([{ fn: '2x^2', color: 'accent', label: 'f along the x-axis', labelAt: 0.5, labelDx: 10, labelDy: -8 }], { x: [-1.4, 1.4], y: [-1, 3.6], caption: t`The graph along the $x$-direction through the point: it does curve upward ($f_{xx} = 4$). That is what the student looked at.` }),
      choices: [
        t`They skipped $D$: $D = 4\cdot1 - 3^2 = -5 < 0$, so it is a saddle whatever the sign of $f_{xx}$`,
        t`Nothing: $f_{xx} > 0$ means a minimum`,
        t`With $f_{xy} = 3$ the point cannot be critical`,
        t`$D = 4\cdot1 + 9 = 13 > 0$, so the conclusion is right but the reason is wrong`,
      ],
      answer: 0,
      why: {
        1: t`$f_{xx}$ describes one direction only. Its sign decides between minimum and maximum only after $D > 0$ has ruled out a saddle.`,
        2: t`Critical means $\nabla f = \vec 0$ — first derivatives. The second derivatives, $f_{xy}$ included, can be anything.`,
        3: t`$D = f_{xx}f_{yy} - f_{xy}^2$: the twist is subtracted.`,
      },
      hints: ['Which number does the second-derivative test look at first?', t`Compute $D = f_{xx}f_{yy} - f_{xy}^2$.`],
      teach: t`Check the sign of $D$ first: if $D < 0$ it is a saddle, and $f_{xx}$ is not consulted.`,
      explain: t`$D = 4 - 9 = -5 < 0$, so the point is a saddle: upward along $x$, but downward along some other direction. Only when $D > 0$ does the sign of $f_{xx}$ pick minimum or maximum.`,
    }),
    mcq({
      id: 'D-zero', difficulty: 3,
      prompt: t`At the origin both $f = x^4 + y^4$ and $g = x^4 - y^4$ have $\nabla = \vec 0$ and every second partial equal to zero, so $D = 0$ for both. What can you conclude?`,
      visual: traces([{ fn: 'x^4', color: 'accent', label: 's⁴', labelAt: 1.2, labelDx: 8 }, { fn: '-x^4', color: 'violet', label: '−s⁴', labelAt: 1.2, labelDx: 8, labelDy: 12 }, { fn: 'x^2', color: 'ink3', width: 1.4, label: 's² for comparison', labelAt: 0.75, labelDx: -100, labelDy: -12 }], { x: [-1.4, 1.4], y: [-2, 2], caption: t`Fourth powers are so flat at $0$ that their second derivative vanishes: $s^4$ and $-s^4$, with $s^2$ for comparison.` }),
      choices: [
        t`The test is silent: $f$ has a minimum at the origin and $g$ a saddle, which only a closer look reveals`,
        t`Both have a minimum, since $D = 0$ means a flat bottom`,
        t`Both are saddles, since $D$ is not positive`,
        t`Neither point is really critical`,
      ],
      answer: 0,
      why: {
        1: t`$g = x^4 - y^4$ falls along the $y$-axis, so the origin is not a minimum of $g$.`,
        2: t`$f = x^4 + y^4 \ge 0 = f(0, 0)$ everywhere: the origin is a minimum of $f$.`,
        3: t`Both gradients vanish there: $\nabla f = (4x^3, 4y^3) = \vec 0$ at the origin.`,
      },
      hints: [t`Look at $f$ and $g$ along the axes directly.`, t`$x^4 + y^4 \ge 0$ always; $x^4 - y^4$ is negative on the $y$-axis.`],
      teach: 'When D = 0 the second-derivative test gives no verdict; look at the function itself.',
      explain: t`$f \ge 0$ with equality only at the origin: a minimum. $g$ rises along $x$ and falls along $y$: a saddle. Both have $D = 0$, so the test cannot tell them apart — as $x^4$ and $-x^4$ both have zero second derivative in one variable.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-classify', difficulty: 2,
      prompt: t`$f(x, y) = x^3 - 12x + y^2 - 2y$ has critical points $(2, 1)$ and $(-2, 1)$. Which statement is right?`,
      visual: traces([{ fn: 'x^3 - 12x', color: 'gold', label: 'the x-part, x³ − 12x', labelAt: -3.4, labelDx: 4, labelDy: 14 }], { x: [-4, 4], y: [-20, 20], caption: t`The $x$-part of $f$ alone, $x^3 - 12x$: a peak at $x = -2$ and a dip at $x = 2$. The $y$-part, $y^2 - 2y$, is a parabola opening upward.` }),
      choices: [
        t`$(2, 1)$ is a local minimum and $(-2, 1)$ a saddle`,
        t`$(2, 1)$ is a local minimum and $(-2, 1)$ a local maximum`,
        t`Both are local minima`,
        t`$(2, 1)$ is a saddle and $(-2, 1)$ a local maximum`,
      ],
      answer: 0,
      why: {
        1: t`At $(-2, 1)$ the $x$-part peaks but the $y$-part has a minimum: $D = (-12)(2) - 0 = -24 < 0$, a saddle.`,
        2: t`At $(-2, 1)$, $f_{xx} = -12 < 0$ while $f_{yy} = 2 > 0$: the curvatures disagree.`,
        3: t`At $(2, 1)$, $D = (12)(2) = 24 > 0$ and $f_{xx} = 12 > 0$: a minimum, not a saddle.`,
      },
      hints: [t`$f_{xx} = 6x$, $f_{yy} = 2$, $f_{xy} = 0$.`],
      teach: 'Evaluate D at each critical point: agreeing curvatures give an extremum, disagreeing ones a saddle.',
      explain: t`$(2, 1)$: $D = 12\cdot2 = 24 > 0$, $f_{xx} > 0$, a local minimum. $(-2, 1)$: $D = -12\cdot2 = -24 < 0$, a saddle — a peak in $x$ meeting a valley in $y$.`,
    }),
    mcq({
      id: 'cp-jwst', difficulty: 3, transfer: true,
      prompt: t`The James Webb Space Telescope orbits near the Sun–Earth L2 point, 1.5 million km beyond Earth. There the effective potential $\Phi$ has $\Phi_{xx} < 0$ along the Sun–Earth line, $\Phi_{yy} > 0$ across it, and $\Phi_{xy} = 0$. What does this say about the telescope’s position?`,
      visual: lagrangeMap(t`Level curves of an effective potential near a rotating pair of bodies (mass ratio exaggerated to 1 : 9). L2 lies on the line, beyond the smaller body.`),
      choices: [
        t`L2 is a saddle ($D < 0$): any drift along the line grows, so the telescope must fire thrusters every few weeks to stay near it`,
        t`L2 is a minimum, so the telescope rests there indefinitely with no corrections`,
        t`L2 is a maximum, like L4, and equally stable`,
        t`$D = 0$, so nothing can be said without more terms`,
      ],
      answer: 0,
      why: {
        1: t`$\Phi_{xx} < 0$ means $\Phi$ falls on both sides along the line: not a minimum.`,
        2: t`$D = \Phi_{xx}\Phi_{yy} - 0 < 0$ (opposite signs): a saddle, not a maximum. L4 and L5 are the maxima.`,
        3: t`$D$ is the product of two nonzero numbers of opposite sign: negative, not zero.`,
      },
      hints: [t`Multiply $\Phi_{xx}$ and $\Phi_{yy}$: what sign does $D$ have?`, 'Along which direction does a small displacement run downhill?'],
      teach: 'A saddle of the effective potential is an unstable equilibrium along its falling direction: L1, L2 and L3 need station-keeping.',
      explain: t`$D < 0$: L2 is a saddle. Along the Sun–Earth line $\Phi$ falls away on both sides, so a small drift grows over a few weeks; Webb follows a looping halo orbit around L2 and makes small station-keeping burns every few weeks. The same is true at Sun–Earth L1, where the solar observatory SOHO works.`,
    }),
    mcq({
      id: 'cp-trojans', difficulty: 3, transfer: true,
      prompt: t`At Jupiter’s L4 point the Sun–Jupiter effective potential has $D = \tfrac{27}{4}\mu(1 - \mu) > 0$ (with $\mu \approx 0.001$) and $\Phi_{xx} = -\tfrac34 < 0$. Yet thousands of Trojan asteroids have orbited there for billions of years. How can both be true?`,
      visual: lagrangeMap(t`Level curves of an effective potential (mass ratio exaggerated to 1 : 9): L4 and L5 sit on top of the gold “tadpole” hills.`),
      choices: [
        t`L4 is a maximum of the potential, but the velocity-dependent Coriolis force, which the potential leaves out, turns drifts into loops around L4`,
        t`The test is wrong: $D > 0$ actually means a minimum`,
        t`The Trojans are not really near L4; they orbit the Sun independently`,
        t`$D$ is so small that L4 counts as flat, so nothing pushes the asteroids away`,
      ],
      answer: 0,
      why: {
        1: t`$D > 0$ says the curvatures agree; $\Phi_{xx} < 0$ says both are downward. A maximum.`,
        2: t`They do orbit the Sun, but in lockstep with Jupiter, librating around L4 and L5 — the Trojan clouds lead and trail the planet by 60°.`,
        3: t`Small or not, a positive $D$ with $\Phi_{xx} < 0$ means the potential falls away in every direction from L4.`,
      },
      hints: ['Does a rotating frame have any force that the potential energy does not include?', 'A force that depends on velocity cannot be the gradient of a potential.'],
      teach: 'The Hessian classifies the potential; velocity-dependent forces such as Coriolis can stabilise a potential maximum.',
      explain: t`The second-derivative test is right — L4 and L5 are maxima of $\Phi$. But in the rotating frame a moving body also feels the Coriolis force $-2\vec\Omega\times\vec v$, which is perpendicular to its velocity and not part of $-\nabla\Phi$. It deflects a body sliding off the hill into a slow loop around L4. This works when $\mu < 0.0385$; Sun–Jupiter ($\mu \approx 0.001$) and Earth–Moon ($\mu \approx 0.012$) qualify.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §4.7 Maxima/minima problems', url: 'https://openstax.org/books/calculus-volume-3/pages/4-7-maxima-minima-problems' },
    { label: 'Lagrange point (overview, with the stability of L4 and L5)', url: 'https://en.wikipedia.org/wiki/Lagrange_point' },
  ],
});
