// The Euler–Lagrange equation (Taylor §6.2–6.4): for F[y] = ∫ f(y, y′, x) dx,
// differentiate F(α) = F[y + αη], integrate the η′ term by parts (the
// boundary term dies because η = 0 at the ends), and the fundamental lemma
// turns "∫ (∂f/∂y − d/dx ∂f/∂y′) η dx = 0 for every η" into the EL equation.
// Explore: the EL residual of a wrong path (the curvature of a parabola, for
// the length) against a movable bump η. First integrals: no y → ∂f/∂y′ is
// constant; no x → Beltrami's f − y′∂f/∂y′ is constant. Transfer: Clairaut's
// constant on a sphere sets the highest latitude of a great circle (the ISS
// ground track), linking to the geodesic lessons.
import { lesson, mcq, multi, num, expr, order } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';

const t = String.raw;

// the EL residual of y = kx² + (1 − k)x for the length functional, and a bump that vanishes at both ends
const RES = 'g(x)';
const RESFN = '-2*k/(1 + (2*k*x + 1 - k)^2)^(3/2)';
const BUMP = '4*x*(1 - x)*exp(-((x - c)/w)^2)';

export default lesson({
  id: 'phys3550.M3.2',
  title: 'The Euler–Lagrange equation',
  minutes: 18, difficulty: 3,
  intro: t`[M3.1](#/lesson/phys3550.M3.1) found the shortest path by hand. Do it once for **every** functional $F[y] = \int f(y, y', x)\,dx$: differentiate $F(\alpha) = F[y + \alpha\eta]$, integrate the $\eta'$ term by parts so that only $\eta$ is left, and demand that the result vanish for every $\eta$. What survives is one differential equation for the path, the **Euler–Lagrange equation**. Two shortcuts follow from it: if $f$ has no $y$ in it, $\partial f/\partial y'$ is constant; if it has no $x$, the combination $f - y'\,\partial f/\partial y'$ is constant.`,
  equation: t`\frac{\partial f}{\partial y} - \frac{d}{dx}\!\left(\frac{\partial f}{\partial y'}\right) = 0`,
  symbols: [
    { tex: "f(y, y', x)", text: 'the integrand of the functional: a known function of three variables, the height $y$, the slope $y\'$ and the position $x$' },
    { tex: '\\partial f/\\partial y', text: 'its partial derivative with respect to $y$, holding $y\'$ and $x$ fixed' },
    { tex: "\\partial f/\\partial y'", text: 'its partial derivative with respect to the slope, treating $y\'$ as just another variable (holding $y$ and $x$ fixed)' },
    { tex: '\\frac{d}{dx}', text: 'the **total** derivative along the path: after putting $y(x)$ and $y\'(x)$ in, differentiate with respect to $x$ — it brings in $y\'$ and $y\'\'$' },
  ],
  why: t`This one equation, with $x$ renamed $t$ and $f$ renamed the Lagrangian, is the equation of motion of every mechanical system in M4 — and, with $f = \sqrt{-g_{\mu\nu}\dot x^\mu\dot x^\nu}$, the geodesic equation of general relativity.`,
  visual: {
    type: 'graph',
    title: 'Why the bracket must vanish everywhere',
    lead: t`For the length functional the bracket $g(x) = \partial f/\partial y - \frac{d}{dx}\partial f/\partial y'$ works out to minus the path's curvature. Violet: $g(x)$ for the parabola $y = x^2$. Gold: a bump $\eta(x)$ that vanishes at both ends. Shaded: their product, whose area is $dL/d\alpha$.`,
    tasks: [
      t`Slide the bump anywhere: the shaded area is never zero, because the parabola curves everywhere. Every bump shortens it (pushing it up toward the chord).`,
      t`Narrow the bump and slide it: it samples $g$ at one place. If $\int g\,\eta\,dx$ is to vanish for **every** bump, $g$ must be zero at every $x$.`,
      t`Switch the path to the straight line: $g \equiv 0$, and no bump changes the length at first order.`,
    ],
    params: {
      x: [0, 1], y: [-2.3, 1.3], xlabel: 'x (m)', ylabel: '',
      choices: [{ key: 'k', label: 'Path', options: [[1, 'parabola $y = x^2$'], [0, 'straight line $y = x$']], value: 1 }],
      sliders: [
        { key: 'c', label: 'Bump centre', min: 0.1, max: 0.9, step: 0.01, value: 0.35, unit: '\\mathrm{m}', explain: 'Where the variation $\\eta$ pushes the path.' },
        { key: 'w', label: 'Bump width', min: 0.04, max: 0.4, step: 0.01, value: 0.15, unit: '\\mathrm{m}', explain: 'How spread out the push is.' },
      ],
      shade: [{ fn: `(${RESFN})*(${BUMP})`, from: 0, to: 1, color: 'accent', alpha: 0.35 }],
      curves: [
        { fn: 'k*x^2 + (1 - k)*x', color: 'ink4', width: 1.4, dash: true, label: 'path y(x)', labelAt: 0.82, labelDx: -70, labelDy: -10 },
        { fn: RESFN, color: 'violet', width: 2.4, label: 'g(x)', labelAt: 0.12, labelDx: 8, labelDy: 6 },
        { fn: BUMP, color: 'gold', width: 2, dash: true, label: 'η(x)', labelAt: 'c', labelDx: 6, labelDy: -12 },
      ],
      integral: { fn: `(${RESFN})*(${BUMP})`, from: 0, to: 1 },
      readouts: [{ label: 'dL/dα = ∫ g η dx', expr: 'integral', digits: 3, unit: '\\mathrm{m}' }],
    },
    caption: t`The length functional, $f = \sqrt{1 + y'^2}$, for which $g = -y''/(1 + y'^2)^{3/2}$, minus the curvature. The bump is $\eta = 4x(1 - x)e^{-(x - c)^2/w^2}$. Heights of $g$ and $\eta$ are on different scales.`,
  },
  example: {
    prompt: t`Derive the Euler–Lagrange equation for $F[y] = \int_{x_1}^{x_2} f(y, y', x)\,dx$ with fixed ends, and use it to find the shortest path in a plane.`,
    steps: [
      { label: 'Vary', text: t`Put $y \to y + \alpha\eta$, so $y' \to y' + \alpha\eta'$, with $\eta(x_1) = \eta(x_2) = 0$. Then $F(\alpha) = \int f(y + \alpha\eta,\ y' + \alpha\eta',\ x)\,dx$.` },
      { label: 'Differentiate', text: t`By the chain rule, at $\alpha = 0$: $\dfrac{dF}{d\alpha} = \int\Big(\dfrac{\partial f}{\partial y}\,\eta + \dfrac{\partial f}{\partial y'}\,\eta'\Big)\,dx$.` },
      { label: 'Integrate by parts', text: t`Move the derivative off $\eta'$: $\displaystyle\int\frac{\partial f}{\partial y'}\eta'\,dx = \Big[\frac{\partial f}{\partial y'}\eta\Big]_{x_1}^{x_2} - \int\frac{d}{dx}\Big(\frac{\partial f}{\partial y'}\Big)\eta\,dx$.` },
      { label: 'Boundary term', text: t`The bracket vanishes, because $\eta = 0$ at both ends. That is where fixed end points earn their keep.` },
      { label: 'Fundamental lemma', text: t`So $\dfrac{dF}{d\alpha} = \displaystyle\int\Big[\frac{\partial f}{\partial y} - \frac{d}{dx}\frac{\partial f}{\partial y'}\Big]\eta\,dx$. If this is zero for **every** $\eta$, the bracket is zero at every $x$ — otherwise a narrow bump placed where it is not zero would give a nonzero integral (the Explore picture).` },
      { label: 'Apply', text: t`For length, $f = \sqrt{1 + y'^2}$: $\partial f/\partial y = 0$ and $\partial f/\partial y' = y'/\sqrt{1 + y'^2}$. The equation says $\frac{d}{dx}\big(y'/\sqrt{1 + y'^2}\big) = 0$, so $y'/\sqrt{1 + y'^2}$ is constant, so $y'$ is constant.` },
      { label: 'Solve', text: t`$y' = m$ gives $y = mx + b$: a straight line, with $m$ and $b$ fixed by the two end points. Sense check: it agrees with [M3.1](#/lesson/phys3550.M3.1), and the EL equation is second order, so two boundary conditions are exactly what it needs.` },
    ],
    answer: t`$\dfrac{\partial f}{\partial y} - \dfrac{d}{dx}\dfrac{\partial f}{\partial y'} = 0$; for $f = \sqrt{1 + y'^2}$ it gives $y'' = 0$, a straight line.`,
  },
  practice: [
    expr({
      id: 'partial-yprime', difficulty: 2,
      gen(r) {
        const [what, src, ftex, ans, tex, err] = r.pick([
          ['a soap film stretched between two rings (the area of a surface of revolution)', 'y*sqrt(1 + p^2)', t`y\sqrt{1 + y'^2}`, 'y*p/sqrt(1 + p^2)', t`\frac{y\,y'}{\sqrt{1 + y'^2}}`, 'p/sqrt(1 + p^2)'],
          ['light crossing a medium whose index rises with height, $n = 1 + y$', '(1 + y)*sqrt(1 + p^2)', t`(1 + y)\sqrt{1 + y'^2}`, '(1 + y)*p/sqrt(1 + p^2)', t`\frac{(1 + y)\,y'}{\sqrt{1 + y'^2}}`, 'p/sqrt(1 + p^2)'],
          ['a bead sliding from rest (the travel time, up to a constant)', 'sqrt(1 + p^2)/sqrt(y)', t`\sqrt{1 + y'^2}/\sqrt{y}`, 'p/(sqrt(y)*sqrt(1 + p^2))', t`\frac{y'}{\sqrt{y}\,\sqrt{1 + y'^2}}`, 'p/sqrt(1 + p^2)'],
        ]);
        return {
          prompt: t`The functional for ${what} has integrand $f = ${ftex}$. Find $\partial f/\partial y'$. Type $y'$ as $p$.`,
          answer: ans, answerTeX: tex, lhs: "\\partial f/\\partial y'", vars: { p: [-2, 2], y: [0.5, 3] }, derivativeOf: src, wrt: 'p',
          errors: [{ answer: err, feedback: t`The factor that depends on $y$ stays: a partial derivative with respect to $y'$ holds $y$ fixed, so it is a constant multiplier.` }, { answer: `0`, feedback: t`$y'$ appears inside the square root. Treat it as an ordinary variable $p$ and differentiate $\sqrt{1 + p^2}$.` }],
          hints: [t`Write $p$ for $y'$ and treat $y$ as a constant. What is $\frac{d}{dp}\sqrt{1 + p^2}$?`, t`$\dfrac{d}{dp}\sqrt{1 + p^2} = \dfrac{p}{\sqrt{1 + p^2}}$; multiply by whatever depends on $y$.`],
          teach: t`In the EL equation $y$, $y'$ and $x$ are independent variables of $f$; only afterwards does $\frac{d}{dx}$ tie them to one path.`,
          explain: t`$\partial f/\partial y' = ${tex}$. The slope variable sits only inside $\sqrt{1 + y'^2}$, whose derivative is $y'/\sqrt{1 + y'^2}$; the $y$-dependent factor rides along.`,
          visual: gpic({
            x: [-2, 2], y: [0, 2.6], xlabel: 'p = y′', ylabel: 'f at fixed y',
            curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.4 }],
            tangent: { fn: 'sqrt(1 + x^2)', at: 1 },
          }, t`$\sqrt{1 + p^2}$ against $p$ at one fixed $y$: $\partial f/\partial y'$ is the slope of this curve (gold tangent, drawn at $p = 1$).`, 'The curve root of one plus p squared with a tangent line'),
        };
      },
    }),
    mcq({
      id: 'el-yy', difficulty: 2,
      prompt: t`Find the Euler–Lagrange equation of $F[y] = \int_0^1\big(y'^2 + y^2\big)\,dx$.`,
      visual: gpic({ x: [-0.1, 1.15], y: [-0.2, 1.3], xlabel: 'x', ylabel: 'y', points: [{ x: 0, y: 0, color: 'ink', label: '(0, 0)', labelDx: 8, labelDy: -10 }, { x: 1, y: 1, color: 'ink', label: '(1, 1)', labelDx: -40, labelDy: -10 }], curves: [{ fn: 'x', domain: [0, 1], color: 'ink4', width: 1.2, dash: true }] }, t`Fixed ends for the extremal, say $(0, 0)$ and $(1, 1)$; the dashed chord is only for reference.`, 'Two end points for a path'),
      choices: [t`$y'' = y$`, t`$y'' = -y$`, t`$y' = y$`, t`$y'' = 2y$`],
      answer: 0,
      why: {
        1: t`Sign slip: the equation is $\partial f/\partial y$ **minus** $\frac{d}{dx}\partial f/\partial y'$: $2y - 2y'' = 0$.`,
        2: t`The EL equation is second order whenever $f$ depends on $y'^2$: $\frac{d}{dx}(2y')$ brings in $y''$.`,
        3: t`Both terms carry the same factor 2, from $\partial(y^2)/\partial y = 2y$ and $\partial(y'^2)/\partial y' = 2y'$; it cancels.`,
      },
      hints: [t`$\partial f/\partial y = 2y$ and $\partial f/\partial y' = 2y'$.`],
      teach: t`Compute the two partial derivatives, then take $\frac{d}{dx}$ of the second along the path.`,
      explain: t`$2y - \frac{d}{dx}(2y') = 2y - 2y'' = 0$, so $y'' = y$: exponentials, $y = \sinh x/\sinh 1$ through $(0, 0)$ and $(1, 1)$ — not the oscillating $\sin x$ that the sign slip would give.`,
    }),
    num({
      id: 'el-solve-mid', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 4, 6, 8]), L = r.pick([1, 2, 3]);
        const ans = (c * L * L) / 8;
        return {
          prompt: t`Find the path that makes $F[y] = \int_0^{${L}}\big(\tfrac12 y'^2 - ${c}\,y\big)\,dx$ stationary with $y(0) = y(${L}) = 0$, and give its value at the midpoint $x = ${L / 2}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans * 2, feedback: t`Check the integration: $y'' = -${c}$ gives $y = \tfrac{${c}}{2}x(${L} - x)$, with the $\tfrac12$.` }, { value: -ans, feedback: t`Sign: $\partial f/\partial y = -${c}$ and $\partial f/\partial y' = y'$, so $-${c} - y'' = 0$ and $y'' = -${c}$: the path bulges upward.` }],
          hints: [t`$\partial f/\partial y = -${c}$, $\partial f/\partial y' = y'$. The EL equation is $-${c} - y'' = 0$.`, t`$y'' = -${c}$ with $y(0) = y(${L}) = 0$ gives $y = \tfrac{${c}}{2}x(${L} - x)$.`],
          teach: t`Solve the EL equation like any ODE: integrate, then fix the constants with the boundary conditions.`,
          explain: t`$y'' = -${c}$, so $y = -\tfrac{${c}}{2}x^2 + Ax + B$; $y(0) = 0$ gives $B = 0$ and $y(${L}) = 0$ gives $A = ${c * L / 2}$. At $x = ${L / 2}$: $y = ${sci(ans, 3)}$. With $x$ as time and $c = g$ this is a thrown ball — the subject of [M4.2](#/lesson/phys3550.M4.2).`,
          visual: gpic({ x: [0, L], y: [-0.2 * ans, 1.6 * ans], xlabel: 'x', ylabel: 'y', curves: [0.4, 0.7, 1.35].map((f) => ({ fn: `${r6(4 * f * ans / (L * L))}*x*(${L} - x)`, color: 'ink4', width: 1.4 })), points: [{ x: 0, y: 0, color: 'ink' }, { x: L, y: 0, color: 'ink' }] }, t`Some trial paths with the right ends (grey). None of them is the answer.`, 'Trial arcs between two fixed end points'),
        };
      },
    }),
    expr({
      id: 'beltrami', difficulty: 3,
      gen(r) {
        const [what, src, ans, tex] = r.pick([
          ['a soap film between two coaxial rings', 'y*sqrt(1 + p^2)', 'y/sqrt(1 + p^2)', t`\frac{y}{\sqrt{1 + y'^2}}`],
          ['the travel time of a bead sliding from rest (up to a constant)', 'sqrt(1 + p^2)/sqrt(y)', '1/(sqrt(y)*sqrt(1 + p^2))', t`\frac{1}{\sqrt{y}\sqrt{1 + y'^2}}`],
        ]);
        return {
          prompt: t`The integrand for ${what}, $f = ${src === 'y*sqrt(1 + p^2)' ? t`y\sqrt{1 + y'^2}` : t`\sqrt{1 + y'^2}/\sqrt{y}`}$, does not contain $x$. Simplify the conserved quantity $f - y'\,\partial f/\partial y'$. Type $y'$ as $p$.`,
          answer: ans, answerTeX: tex, lhs: "f - y'\\,\\partial f/\\partial y'", vars: { p: [-2, 2], y: [0.5, 3] },
          errors: [{ answer: src, feedback: t`That is $f$ alone. Subtract $y'\,\partial f/\partial y'$ and put everything over $\sqrt{1 + y'^2}$.` }],
          hints: [t`First find $\partial f/\partial y'$: the $y$-factor times $p/\sqrt{1 + p^2}$.`, t`Over the common denominator: $\dfrac{(1 + p^2) - p^2}{\sqrt{1 + p^2}} = \dfrac{1}{\sqrt{1 + p^2}}$, times the $y$-factor.`],
          teach: t`When $f$ has no explicit $x$, Beltrami's identity gives a first integral, $f - y'\,\partial f/\partial y' = C$: one integration done for free.`,
          explain: t`$f - y'\partial f/\partial y' = ${tex} = C$. ${src === 'y*sqrt(1 + p^2)' ? t`Solving $y/\sqrt{1 + y'^2} = C$ gives $y = C\cosh\big((x - x_0)/C\big)$: the soap film is a **catenoid**.` : t`Solving $y(1 + y'^2) = 1/C^2$ gives the **cycloid** — the brachistochrone of [M3.3](#/lesson/phys3550.M3.3).`}`,
          visual: src === 'y*sqrt(1 + p^2)'
            ? gpic({ x: [-1.3, 1.3], y: [-2.2, 2.2], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ fn: 'cosh(x)', domain: [-1, 1], color: 'accent', width: 2.4 }, { fn: '-cosh(x)', domain: [-1, 1], color: 'accent', width: 2.4 }, seg([-1, -1.543], [-1, 1.543], 'ink2', 3), seg([1, -1.543], [1, 1.543], 'ink2', 3)] }, t`A soap film between two rings, seen side-on: its profile $y(x)$ is the curve that minimizes the area $2\pi\int y\sqrt{1 + y'^2}\,dx$.`, 'Side view of a soap film between two rings')
            : { type: 'cm2-race', params: { curves: ['cycloid'], play: false, times: false }, caption: t`The answer it leads to: the cycloid from A to B.` },
        };
      },
    }),
    multi({
      id: 'first-integrals', difficulty: 2,
      prompt: t`For which integrands is $\partial f/\partial y'$ **constant** along every extremal (a first integral with no work)?`,
      choices: [t`$f = \sqrt{1 + y'^2}$`, t`$f = x\sqrt{1 + y'^2}$`, t`$f = y\sqrt{1 + y'^2}$`, t`$f = \tfrac12y'^2 - y$`],
      answer: [0, 1],
      why: { 2: t`$f$ contains $y$, so $\partial f/\partial y \ne 0$ and $\partial f/\partial y'$ changes along the path. (It has no $x$, so Beltrami's $f - y'\partial f/\partial y'$ is conserved instead.)`, 3: t`$\partial f/\partial y = -1 \ne 0$, so $\frac{d}{dx}(y') = -1$: $y'$ steadily changes.` },
      hints: [t`The EL equation reads $\frac{d}{dx}\big(\partial f/\partial y'\big) = \partial f/\partial y$. When is the right side zero?`],
      teach: t`If $f$ does not depend on $y$, the EL equation says $\partial f/\partial y'$ is constant — in mechanics, a conserved momentum ([M4.4](#/lesson/phys3550.M4.4)).`,
      explain: t`Only the integrands with no $y$ in them qualify: for those, $\partial f/\partial y = 0$ and the EL equation is $\frac{d}{dx}(\partial f/\partial y') = 0$. An explicit $x$ does not spoil it.`,
    }),
    order({
      id: 'derivation', difficulty: 2,
      prompt: t`Put the steps of the derivation of the Euler–Lagrange equation in order.`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-2.3, 1.3], xlabel: 'x', ylabel: '', constants: { k: 1, c: 0.4, w: 0.12 }, shade: [{ fn: `(${RESFN})*(${BUMP})`, from: 0, to: 1, color: 'accent', alpha: 0.35 }], curves: [{ fn: RESFN, color: 'violet', width: 2.4, label: 'g(x)', labelAt: 0.12, labelDx: 8, labelDy: 6 }, { fn: BUMP, color: 'gold', width: 2, dash: true, label: 'η(x)', labelAt: 0.4, labelDx: 6, labelDy: -12 }] }, caption: t`The last step pictured: a narrow bump $\eta$ samples the bracket $g$ at one place.` },
      items: [
        t`Replace $y$ by $y + \alpha\eta$ with $\eta = 0$ at both ends.`,
        t`Differentiate $F(\alpha)$ under the integral with the chain rule.`,
        t`Integrate the $\frac{\partial f}{\partial y'}\eta'$ term by parts.`,
        t`Drop the boundary term, since $\eta(x_1) = \eta(x_2) = 0$.`,
        t`Require $\int[\ldots]\,\eta\,dx = 0$ for every $\eta$: the bracket vanishes.`,
      ],
      hints: [t`Integration by parts needs a $\eta'$ to act on, which appears only after differentiating.`, t`The fundamental lemma comes last: it needs the integral to contain $\eta$ alone.`],
      teach: t`Vary, differentiate, integrate by parts, kill the boundary term, invoke the fundamental lemma.`,
      explain: t`The integration by parts converts $\eta'$ into $\eta$, so the integrand is (bracket) × $\eta$; arbitrary $\eta$ then forces the bracket to zero.`,
    }),
    mcq({
      id: 'lemma', difficulty: 2,
      prompt: t`Suppose $\int_0^1 g(x)\,\eta(x)\,dx = 0$ for every smooth $\eta$ with $\eta(0) = \eta(1) = 0$, yet $g(0.3) = 0.5$ for some continuous $g$. Why is that impossible?`,
      visual: gpic({ x: [0, 1], y: [-0.4, 1.2], xlabel: 'x', ylabel: '', curves: [{ fn: '0.5 + 0.3*sin(6*x) - 0.4*x', color: 'violet', width: 2.4, label: 'g(x)', labelAt: 0.75, labelDx: 6, labelDy: -12 }, { fn: 'exp(-((x - 0.3)/0.05)^2)', color: 'gold', width: 2, dash: true, label: 'η(x)', labelAt: 0.3, labelDx: 8, labelDy: -10 }], shade: [{ fn: '(0.5 + 0.3*sin(6*x) - 0.4*x)*exp(-((x - 0.3)/0.05)^2)', from: 0, to: 1, color: 'accent', alpha: 0.35 }] }, t`A continuous $g$ that is positive near $x = 0.3$, and a narrow bump there; their product (shaded) has positive area.`, 'A function and a narrow bump with the shaded product'),
      choices: [
        t`$g$ is positive on a small interval around 0.3, so a bump $\eta \ge 0$ that is zero outside that interval gives $\int g\eta\,dx > 0$`,
        t`Because $\eta$ could be chosen equal to $g$, and $\int g^2\,dx > 0$`,
        t`Because the integral of any continuous function is zero only if it is constant`,
        t`It is not impossible: the positive part near 0.3 can be cancelled by negative parts elsewhere`,
      ],
      answer: 0,
      why: {
        1: t`Close, but $\eta = g$ is not allowed unless $g(0) = g(1) = 0$; the bump argument needs no such luck.`,
        2: t`False: $\int_0^1(x - \tfrac12)\,dx = 0$ for a non-constant function.`,
        3: t`It could for *one* $\eta$ — but the condition must hold for every $\eta$, including a bump that sees only the positive part.`,
      },
      hints: [t`You are free to choose $\eta$. Choose one that "looks" only near $x = 0.3$.`],
      teach: t`The fundamental lemma: a narrow bump samples the integrand at one point, so "zero for every $\eta$" means "zero everywhere".`,
      explain: t`Continuity makes $g > 0.25$ on some interval around 0.3; a bump inside that interval makes the integral positive, contradicting the assumption. So $g(0.3)$ must be 0 — and likewise at every $x$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ground-track', difficulty: 3, transfer: true,
      gen(r) {
        const psi = r.pick([38.4, 42.0, 61.5, 70.0]);
        const lat = 90 - psi;
        return {
          prompt: t`On a sphere, a geodesic written as $\phi(\theta)$ (colatitude $\theta$, longitude $\phi$) makes $\int\sqrt{1 + \sin^2\theta\,\phi'^2}\,d\theta$ stationary. The integrand has no $\phi$, so the EL equation gives **Clairaut's constant**: $\sin\theta\,\sin\psi$ is the same all along the path, where $\psi$ is the heading measured from north. A satellite's ground track (ignoring Earth's rotation) is a great circle; it crosses the equator heading $${psi}^\circ$ east of north. What is the highest latitude it reaches?`,
          answer: lat, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: psi, feedback: t`At the turning point $\psi = 90^\circ$, so $\sin\theta = \sin${psi}^\circ$: that is the **colatitude** (from the pole). Latitude is $90^\circ$ minus it.` }],
          hints: [t`At the equator $\theta = 90^\circ$, so the constant is $\sin${psi}^\circ$. At the most northerly point the track runs due east: $\psi = 90^\circ$.`, t`There $\sin\theta = \sin${psi}^\circ$, so the colatitude is $${psi}^\circ$ and the latitude $90^\circ - ${psi}^\circ$.`],
          teach: t`A coordinate missing from the integrand gives a conserved $\partial f/\partial y'$; on a sphere it is Clairaut's constant, and it fixes a great circle's highest latitude.`,
          explain: t`$\sin 90^\circ\sin${psi}^\circ = \sin\theta_{\min}\sin 90^\circ$, so $\theta_{\min} = ${psi}^\circ$ and the highest latitude is $${sci(lat, 3)}^\circ$ — the orbit's inclination. (The ISS crosses at about $38.4^\circ$ and reaches $51.6^\circ$.) The same "missing coordinate ⇒ conserved quantity" gives a planet's angular momentum around a black hole: see [the geodesic equation from the action](#/lesson/gr.S12.d) and [straight lines in polar coordinates](#/lesson/st-a.A9.2).`,
          visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'sphere', v: 1.5708, heading: r6(90 - psi), length: 6.28, controls: false, readout: false }, caption: t`A great circle launched from a point on the equator at the given heading, computed from the geodesic equation. Not Earth to scale.` },
        };
      },
    }),
    num({
      id: 'cp-sinh', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        const ans = Math.sinh(k / 2) / Math.sinh(k);
        return {
          prompt: t`Find the extremal of $F[y] = \int_0^1\big(y'^2 + ${k * k}y^2\big)\,dx$ with $y(0) = 0$, $y(1) = 1$, and give $y(\tfrac12)$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sin(k / 2) / Math.sin(k), feedback: t`That solves $y'' = -${k * k}y$ — a sign slip in the $\frac{d}{dx}$ term. The EL equation gives $2(${k * k})y - 2y'' = 0$.` }, { value: 0.5, feedback: t`A straight line ignores the $y^2$ term. Solve $y'' = ${k * k}y$.` }], ans),
          hints: [t`$\partial f/\partial y = ${2 * k * k}y$ and $\partial f/\partial y' = 2y'$, so $y'' = ${k * k}y$.`, t`$y = A\sinh ${k}x + B\cosh ${k}x$; $y(0) = 0$ kills $B$, $y(1) = 1$ gives $A = 1/\sinh ${k}$.`],
          teach: t`Get the signs right and $y'' = +k^2y$: exponential growth, not oscillation.`,
          explain: t`$y = \sinh(${k}x)/\sinh ${k}$, so $y(\tfrac12) = \sinh(${k / 2})/\sinh ${k} = ${sci(ans, 4)}$, below the straight line's 0.5: the $y^2$ term pays the path to stay low before climbing.`,
          visual: gpic({ x: [-0.05, 1.1], y: [-0.15, 1.2], xlabel: 'x', ylabel: 'y', points: [{ x: 0, y: 0, color: 'ink' }, { x: 1, y: 1, color: 'ink' }], curves: [{ fn: 'x', domain: [0, 1], color: 'ink4', width: 1.2, dash: true }], vlines: [{ x: 0.5, color: 'ink4' }] }, t`The two fixed ends, the chord (dashed) and the midpoint line.`, 'Two end points and a vertical line at the midpoint'),
        };
      },
    }),
    mcq({
      id: 'cp-find-error', difficulty: 3, kind: 'error',
      prompt: t`A student wants the extremals of $\int\big(y'^2 - y^2\big)\,dx$ and writes: (1) $\partial f/\partial y = -2y$; (2) $\partial f/\partial y' = 2y'$; (3) the EL equation $\frac{\partial f}{\partial y} + \frac{d}{dx}\frac{\partial f}{\partial y'} = 0$ gives $-2y + 2y'' = 0$; (4) so $y'' = y$ and the extremals are exponentials. Where is the error?`,
      visual: gpic({ x: [0, 3], y: [-1.3, 3], xlabel: 'x', ylabel: 'y', curves: [{ fn: 'sin(x)', color: 'accent', width: 2.4, label: 'sin x', labelAt: 1.6, labelDx: 4, labelDy: -12 }, { fn: 'sinh(x)/4', color: 'warn', width: 2.4, label: 'sinh x / 4', labelAt: 2.6, labelDx: -70, labelDy: -6 }] }, t`The two kinds of answer at stake: oscillating or exponential.`, 'A sine curve and a hyperbolic sine curve'),
      choices: [
        t`Step 3: the equation has a **minus** sign, $\frac{\partial f}{\partial y} - \frac{d}{dx}\frac{\partial f}{\partial y'} = 0$, giving $y'' = -y$ and oscillating extremals`,
        t`Step 1: $\partial f/\partial y$ should be $+2y$`,
        t`Step 2: $\partial f/\partial y'$ should be $y'$`,
        t`Step 4: $-2y + 2y'' = 0$ means $y'' = -y$`,
      ],
      answer: 0,
      why: {
        1: t`$\partial(y'^2 - y^2)/\partial y = -2y$ is right.`,
        2: t`$\partial(y'^2)/\partial y' = 2y'$ is right; the factor 2 cancels anyway.`,
        3: t`Step 4 is correct algebra from step 3's (wrong) equation.`,
      },
      hints: [t`Re-derive the sign: integrating $\frac{\partial f}{\partial y'}\eta'$ by parts produces $-\int\frac{d}{dx}\big(\frac{\partial f}{\partial y'}\big)\eta\,dx$.`, t`With the right sign: $-2y - 2y'' = 0$.`],
      teach: t`The minus sign in the EL equation comes from the integration by parts; flipping it turns oscillations into exponentials.`,
      explain: t`The EL equation is $-2y - \frac{d}{dx}(2y') = 0$, so $y'' = -y$: $y = A\sin x + B\cos x$. With $x$ read as time this is a mass on a spring, whose action is $\int(\tfrac12m\dot x^2 - \tfrac12kx^2)\,dt$ — exactly this functional, as [M4.2](#/lesson/phys3550.M4.2) will show.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §6.2–6.4: the Euler–Lagrange equation and applications', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 18.086 / 8.09 notes: the fundamental lemma of the calculus of variations', url: 'https://ocw.mit.edu/courses/8-09-classical-mechanics-iii-fall-2014/' },
  ],
});
