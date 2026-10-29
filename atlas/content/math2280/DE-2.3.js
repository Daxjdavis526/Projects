// Exact equations: M dx + N dy = 0 as dF = 0, the test M_y = N_x, finding
// the potential F, and integrating factors that depend on one variable.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const co = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k));

export default lesson({
  id: 'math2280.DE-2.3',
  title: 'Exact equations',
  minutes: 12, difficulty: 3,
  intro: t`Write a first-order equation as $M(x, y)\,dx + N(x, y)\,dy = 0$. If the left side is the total differential of one function $F$ — that is, $F_x = M$ and $F_y = N$ — the equation says $dF = 0$: $F$ stays constant along every solution, and the solutions are the **level curves** $F(x, y) = C$. Such an equation is called **exact**, and because mixed partial derivatives of $F$ are equal, there is a one-line test:

$$\frac{\partial M}{\partial y} = \frac{\partial N}{\partial x}$$

$F$ is a **potential**, exactly as for a conservative force. When the test fails, multiplying by an **integrating factor** that depends on $x$ alone or on $y$ alone can sometimes make it pass.`,
  symbols: [
    { tex: t`M(x, y),\ N(x, y)`, text: t`the coefficients of $dx$ and $dy$; together $(M, N)$ is a vector field, and the equation is exact when that field is a gradient` },
    { tex: t`F(x, y)`, text: t`the potential: a function with $F_x = M$ and $F_y = N$, constant along every solution` },
    { tex: t`C`, text: t`the level of $F$ on a particular solution curve, fixed by the initial point: $C = F(x_0, y_0)$` },
    { tex: t`\mu`, text: t`an integrating factor: a function that makes $\mu M\,dx + \mu N\,dy = 0$ exact` },
  ],
  why: t`Exactness is energy conservation for first-order equations: the potential is the conserved quantity, its level curves are the trajectories, and the test is the condition for a force to be conservative.`,
  visual: {
    type: 'c3-contour',
    title: 'A pendulum’s energy, as level curves',
    lead: t`A pendulum’s angle $\theta$ and angular speed $\omega$ obey $\dfrac{d\omega}{d\theta} = -\dfrac{g\sin\theta}{L\,\omega}$, that is $\dfrac{g}{L}\sin\theta\,d\theta + \omega\,d\omega = 0$. Here $M = \frac{g}{L}\sin\theta$ and $N = \omega$, so $M_\omega = 0 = N_\theta$: exact, with potential $F = \tfrac12\omega^2 - \frac{g}{L}\cos\theta$ — the energy. Across is $\theta$ in radians, up is $\omega$, in units where $g/L = 1$.`,
    tasks: [
      'Slide c below 1: the gold level curve is a closed loop — the pendulum swings back and forth.',
      'Set c = 1: the curve runs through θ = ±π, the pendulum balanced upside down. This separatrix divides the two kinds of motion.',
      'Raise c above 1: the curves never close; the pendulum whirls over the top. Switch to the surface: every solution is a contour of one landscape.',
    ],
    params: {
      f: 'y^2/2 - cos(x)', x: [-7, 7], y: [-3.5, 3.5], levels: [-0.8, -0.5, 0, 0.5, 1, 1.6, 2.4, 3.4], labels: false, fill: true,
      highlight: 'c', toggle3d: true, xlabel: 'θ (rad)', ylabel: 'ω', aspect: 'wide',
      sliders: [{ key: 'c', label: 'Energy level $c$', min: -0.98, max: 4, step: 0.02, value: 0.4, unit: '', explain: t`The value of $F = \tfrac12\omega^2 - \cos\theta$ on the gold curve: the energy divided by $mgL$.` }],
    },
    caption: t`Time is measured in units of $\sqrt{L/g}$, so $\omega$ is in units of $\sqrt{g/L}$ (about 3.1 rad/s for a 1 m pendulum). No friction. Shading shows the height of $F$; the pattern repeats every $2\pi$ in $\theta$, because $\theta$ and $\theta + 2\pi$ are the same position.`,
  },
  example: {
    prompt: t`Solve $(2xy + 3)\,dx + (x^2 - 1)\,dy = 0$ with $y(0) = 2$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-2.5, 2.5], y: [-6, 6], xlabel: 'x', ylabel: 'y',
        curves: [
          ...[-8, -5, 1, 4].map((C) => ({ fn: `(${C} - 3x)/(x^2 - 1)`, color: 'ink3', dash: true, width: 1.4 })),
          { fn: '(-2 - 3x)/(x^2 - 1)', color: 'gold', width: 1.4, dash: true },
          { fn: '(3x + 2)/(1 - x^2)', domain: [-0.999, 0.999], color: 'gold', width: 3, label: 'the solution', labelAt: 0.35, labelDx: 10, labelDy: 6 },
        ],
        vlines: [{ x: -1, label: 'x = −1' }, { x: 1, label: 'x = 1' }],
        points: [{ x: 0, y: 2, label: '(0, 2)', color: 'gold', labelDx: -46, labelDy: -12 }],
      },
      caption: t`Level curves $F = C$ of $F = x^2y + 3x - y$, each solved for $y$: grey dashed for $C = -8, -5, 1, 4$; gold for $C = -2$. The solution is the solid piece through $(0, 2)$, which blows up at $x = \pm 1$.`,
    },
    steps: [
      { label: 'Test', text: t`$M = 2xy + 3$, $N = x^2 - 1$: $\;M_y = 2x$ and $N_x = 2x$. Equal, so the equation is exact.` },
      { label: 'Integrate M in x', text: t`$F = \displaystyle\int (2xy + 3)\,dx = x^2y + 3x + g(y)$. The “constant” of integration may depend on $y$, because $y$ was held fixed.` },
      { label: 'Match N', text: t`$F_y = x^2 + g'(y)$ must equal $N = x^2 - 1$, so $g'(y) = -1$ and $g = -y$. Hence $F = x^2y + 3x - y$.` },
      { label: 'Use the initial point', text: t`$F(0, 2) = 0 + 0 - 2 = -2$, so the solution is the level curve $x^2y + 3x - y = -2$.` },
      { label: 'Solve for y when you can', text: t`$y(x^2 - 1) = -2 - 3x$, so $y = \dfrac{3x + 2}{1 - x^2}$. It blows up at $x = \pm 1$: the interval of validity is $-1 < x < 1$.` },
      { label: 'Check', text: t`$dF = F_x\,dx + F_y\,dy = (2xy + 3)\,dx + (x^2 - 1)\,dy$ ✓ — the original equation, so $F$ is constant along every solution.` },
    ],
    answer: t`$x^2y + 3x - y = -2$, that is $y = \dfrac{3x + 2}{1 - x^2}$ for $-1 < x < 1$.`,
  },
  practice: [
    multi({
      id: 'which-exact', difficulty: 1,
      prompt: 'Which of these equations are exact? Select all that are.',
      choices: [
        t`$(3x^2 + y)\,dx + (x + 2y)\,dy = 0$`,
        t`$(y\cos x + 2x)\,dx + (\sin x + 1)\,dy = 0$`,
        t`$(x + y)\,dx + (y - x)\,dy = 0$`,
        t`$2y\,dx + x\,dy = 0$`,
        t`$e^{y}\,dx + (xe^{y} + 2y)\,dy = 0$`,
      ],
      answer: [0, 1, 4],
      why: {
        2: t`$M_y = 1$ but $N_x = -1$: the field $(M, N)$ circulates (its curl is $-2$), so it is no gradient.`,
        3: t`$M_y = 2$ but $N_x = 1$. (Multiplying by $x$ would fix it — an integrating factor.)`,
      },
      hints: [t`For each, compute $\partial M/\partial y$ and $\partial N/\partial x$ and compare.`],
      teach: 'An equation M dx + N dy = 0 is exact exactly when ∂M/∂y = ∂N/∂x (on a region without holes).',
      explain: t`(1): $M_y = 1 = N_x$. (2): $M_y = \cos x = N_x$. (5): $M_y = e^y = N_x$. The other two fail. The picture is the field $(M, N)$ of the third equation: it swirls, and no potential has swirling gradient arrows.`,
      visual: { type: 'field2d', params: { P: 'x + y', Q: 'y - x', x: [-3, 3], y: [-3, 3], particles: false }, caption: t`The vector field $(M, N) = (x + y,\ y - x)$ from the third equation, with a probe that reads its curl.` },
    }),
    expr({
      id: 'potential', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-4, 4, [0]), b = r.pick([2, 4, 6, -2]);
        const ans = `x^2*y + ${a}x + ${b / 2}y^2`;
        return {
          prompt: t`The equation $(2xy ${a < 0 ? '-' : '+'} ${Math.abs(a)})\,dx + (x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}y)\,dy = 0$ is exact. Find its potential $F(x, y)$, choosing the one with $F(0, 0) = 0$.`,
          answer: ans, answerTeX: t`F = x^2y ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x ${b < 0 ? '-' : '+'} ${Math.abs(b / 2) === 1 ? '' : Math.abs(b / 2)}y^2`, lhs: 'F',
          vars: { x: [-2, 2], y: [-2, 2] },
          errors: [
            { answer: `2x^2*y + ${a}x + ${b / 2}y^2`, feedback: t`You added $\int M\,dx$ and $\int N\,dy$, so the shared term $x^2y$ is counted twice. Integrate $M$, then add only what $N$ still needs.` },
            { answer: `x^2*y + ${a}x`, feedback: t`Check $F_y$: it must equal $N = x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}y$, so $g'(y) = ${b}y$ and $g(y) = ${b / 2}y^2$.` },
          ],
          hints: [t`Integrate $M$ in $x$: $F = x^2y ${a < 0 ? '-' : '+'} ${Math.abs(a)}x + g(y)$.`, t`Then $F_y = x^2 + g'(y)$ must equal $N$: find $g'(y)$ and integrate.`],
          teach: t`Integrate $M$ in $x$, with a function of $y$ as the constant; then choose that function so that $F_y = N$.`,
          explain: t`$F = x^2y ${a < 0 ? '-' : '+'} ${Math.abs(a)}x + g(y)$ and $F_y = x^2 + g'(y) = x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}y$, so $g = ${b / 2}y^2$ (plus a constant, set to 0 by $F(0,0) = 0$). Solutions are the curves $F = C$.`,
          visual: { type: 'field2d', params: { P: `2*x*y + ${a}`, Q: `x^2 + ${b}*y`, x: [-2.5, 2.5], y: [-2.5, 2.5], particles: false }, caption: t`The field $(M, N)$: if it is the gradient of $F$, its arrows cross the level curves of $F$ at right angles — and the solutions run along those level curves.` },
        };
      },
    }),
    num({
      id: 'make-exact', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3, -1, 0.5]);
        const k = 4 * c;
        return {
          prompt: t`For what value of $k$ is $\left(k\,x^3y + \cos x\right)dx + \left(${c === 0.5 ? t`\tfrac12` : co(c)}x^4 + e^{y}\right)dy = 0$ exact?`,
          answer: k, tol: { rel: 1e-9, abs: 1e-9 },
          errors: [{ value: c, feedback: t`Differentiate $N$ with respect to $x$: $\partial(${c === 0.5 ? t`\tfrac12` : co(c)}x^4)/\partial x = ${nice(4 * c)}x^3$, which brings down the power 4.` }, { value: c / 4, feedback: 'The power multiplies when you differentiate; it does not divide.' }].filter((e) => e.value !== k),
          hints: [t`$M_y = k\,x^3$. Compute $N_x$.`, t`$N_x = ${nice(4 * c)}x^3$; set $M_y = N_x$.`],
          teach: t`Exactness is one equation, $M_y = N_x$; an unknown coefficient is whatever makes it hold.`,
          explain: t`$M_y = kx^3$ and $N_x = ${nice(4 * c)}x^3$, so $k = ${nice(k)}$. Then $F = ${c === 0.5 ? t`\tfrac12` : co(c)}x^4y + \sin x + e^y$.`,
          visual: { type: 'field2d', params: { P: `${k}*x^3*y + cos(x)`, Q: `${c}*x^4 + exp(y)`, x: [-1.5, 1.5], y: [-1.5, 1.5], particles: false }, caption: t`The field $(M, N)$ with the exact value of $k$; drag the probe — its curl reads zero everywhere.` },
        };
      },
    }),
    expr({
      id: 'exp-ivp', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, -1, -2]);
        return {
          prompt: t`Show that $\left(ye^{xy} + 2x\right)dx + \left(xe^{xy} - 1\right)dy = 0$ is exact, and find the solution with $y(0) = ${k}$ as an equation in $x$ and $y$.`,
          answer: `exp(x*y) + x^2 - y = ${1 - k}`, answerTeX: t`e^{xy} + x^2 - y = ${1 - k}`,
          vars: { x: [-1, 1], y: [-2, 2] }, mode: 'equation',
          errors: [{ answer: 'exp(x*y) + x^2 - y = 0', feedback: t`Use the initial point: $F(0, ${k}) = e^0 + 0 - ${k} = ${1 - k}$.` }, { answer: `exp(x*y) + x^2 = ${1}`, feedback: t`$F_y$ must equal $xe^{xy} - 1$: the $-1$ needs a $-y$ in $F$.` }],
          hints: [t`$M_y = e^{xy} + xye^{xy}$ and $N_x = e^{xy} + xye^{xy}$: exact.`, t`$\int (ye^{xy} + 2x)\,dx = e^{xy} + x^2 + g(y)$; matching $N$ gives $g = -y$. Evaluate $F$ at $(0, ${k})$.`],
          teach: 'For an exact initial-value problem the answer is the level curve F(x, y) = F(x₀, y₀).',
          explain: t`$F = e^{xy} + x^2 - y$ and $F(0, ${k}) = 1 - ${k} = ${1 - k}$, so $e^{xy} + x^2 - y = ${1 - k}$. No formula gives $y$ explicitly here: the level curve is the answer.`,
          visual: { type: 'c3-contour', params: { f: 'exp(x*y) + x^2 - y', x: [-3.2, 3.2], y: [-4, 4], levels: [-4, -3, -2, -1, 0, 1, 2, 3, 4], highlight: 1 - k, labels: false, fill: false, points: [{ x: 0, y: k, label: 'start', color: 'gold' }] }, caption: t`Level curves of the potential, one per unit of $F$; gold is the one through the initial point. The solution is the piece of it that passes through that point.` },
        };
      },
    }),
    mcq({
      id: 'which-mu', difficulty: 3,
      prompt: t`$(3xy + y^2)\,dx + (x^2 + xy)\,dy = 0$ is not exact: $M_y = 3x + 2y$ but $N_x = 2x + y$. Since $\dfrac{M_y - N_x}{N} = \dfrac{x + y}{x(x + y)} = \dfrac1x$ depends on $x$ alone, an integrating factor $\mu(x) = e^{\int (1/x)\,dx}$ exists. Which is it?`,
      choices: [t`$\mu = x$`, t`$\mu = \dfrac1x$`, t`$\mu = \ln x$`, t`$\mu = e^{x}$`],
      answer: 0,
      why: {
        1: t`$e^{\int dx/x} = e^{\ln x} = x$, not $1/x$. (Check: with $\mu = 1/x$ the new $M_y$ and $N_x$ still differ.)`,
        2: t`$\ln x$ is $\int dx/x$ itself; the factor is $e$ raised to it.`,
        3: t`That would come from $\int 1\,dx$, but the ratio is $1/x$.`,
      },
      hints: [t`$\mu = e^{\int (1/x)\,dx} = e^{\ln x}$.`, t`Check: $\mu M = 3x^2y + xy^2$ and $\mu N = x^3 + x^2y$; compare $\partial_y(\mu M)$ with $\partial_x(\mu N)$.`],
      teach: t`If $(M_y - N_x)/N$ depends on $x$ alone, $\mu(x) = e^{\int (M_y - N_x)/N\,dx}$ makes the equation exact.`,
      explain: t`$\mu = e^{\ln x} = x$. Then $(3x^2y + xy^2)\,dx + (x^3 + x^2y)\,dy = 0$ has $\partial_y = 3x^2 + 2xy = \partial_x$ ✓, with potential $F = x^3y + \tfrac12x^2y^2$.`,
      visual: { type: 'c3-contour', params: { f: 'x^3*y + x^2*y^2/2', x: [-2.4, 2.4], y: [-3, 3], levels: [-6, -3, -1, 1, 3, 6], labels: false, fill: false }, caption: t`The solution curves of the equation — level curves of the potential the integrating factor reveals.` },
    }),
    mcq({
      id: 'double-count', difficulty: 2, kind: 'error',
      prompt: t`For the exact equation $(2xy + 3)\,dx + (x^2 + 4y)\,dy = 0$, a student integrates each part separately and adds: “$\int M\,dx + \int N\,dy = (x^2y + 3x) + (x^2y + 2y^2)$, so $F = 2x^2y + 3x + 2y^2$.” What is wrong?`,
      choices: [
        t`The term $x^2y$ appears in both integrals and is counted twice; $F = x^2y + 3x + 2y^2$`,
        'Nothing: adding the two integrals is the standard method',
        t`The equation is not exact, so no $F$ exists`,
        t`$\int N\,dy$ should be $x^2 + 4$`,
      ],
      answer: 0,
      why: {
        1: t`Test the result: $\partial_x(2x^2y + 3x + 2y^2) = 4xy + 3 \neq M$. The method double-counts.`,
        2: t`$M_y = 2x = N_x$: it is exact.`,
        3: t`$\int (x^2 + 4y)\,dy = x^2y + 2y^2$; integrating in $y$ multiplies $x^2$ by $y$.`,
      },
      hints: [t`Check the student’s $F$: does $F_x$ equal $M$?`, t`Integrate $M$ in $x$, then add only the terms of $\int N\,dy$ that are not already there.`],
      teach: 'Find F by integrating M in x and fixing the leftover function of y from N — never by adding the two integrals blindly.',
      explain: t`$F = x^2y + 3x + 2y^2$: then $F_x = 2xy + 3 = M$ and $F_y = x^2 + 4y = N$ ✓. The student’s version has $F_x = 4xy + 3$.`,
      visual: { type: 'field2d', params: { P: '2*x*y + 3', Q: 'x^2 + 4*y', potential: 'x^2*y + 3*x + 2*y^2', x: [-2.5, 2.5], y: [-2.5, 2.5], particles: false }, caption: t`The field $(M, N)$ with the level curves of the correct potential: the arrows cross them at right angles.` },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      prompt: t`In an orbit, the radial speed $v = dr/dt$ and the distance $r$ obey $v\,dv + \left(\dfrac{GM}{r^2} - \dfrac{h^2}{r^3}\right)dr = 0$, where $h$ is the angular momentum per unit mass. This is exact. Which function stays constant along the motion?`,
      choices: [
        t`$F = \tfrac12 v^2 - \dfrac{GM}{r} + \dfrac{h^2}{2r^2}$`,
        t`$F = \tfrac12 v^2 + \dfrac{GM}{r} - \dfrac{h^2}{2r^2}$`,
        t`$F = \tfrac12 v^2 + \dfrac{GM}{r^2} - \dfrac{h^2}{r^3}$`,
        t`$F = \tfrac12 v^2 - \dfrac{GM}{r} - \dfrac{h^2}{2r^2}$`,
      ],
      answer: 0,
      why: {
        1: t`Check $F_r$: it must equal $+\dfrac{GM}{r^2} - \dfrac{h^2}{r^3}$, and $\dfrac{d}{dr}\dfrac{GM}{r} = -\dfrac{GM}{r^2}$. Both signs are flipped.`,
        2: t`That is $M$ itself, not its antiderivative in $r$.`,
        3: t`$\dfrac{d}{dr}\left(-\dfrac{h^2}{2r^2}\right) = +\dfrac{h^2}{r^3}$, the wrong sign for $F_r$.`,
      },
      hints: [t`$F_v = v$ gives $\tfrac12v^2$; $F_r$ must equal $\dfrac{GM}{r^2} - \dfrac{h^2}{r^3}$. Integrate that in $r$.`, t`$\int \dfrac{GM}{r^2}dr = -\dfrac{GM}{r}$ and $\int -\dfrac{h^2}{r^3}dr = +\dfrac{h^2}{2r^2}$.`],
      teach: 'The potential of an exact equation from mechanics is a conserved energy; here, the radial kinetic energy plus the effective potential.',
      explain: t`$F = \tfrac12v^2 + V_\text{eff}(r)$ with $V_\text{eff} = -\dfrac{GM}{r} + \dfrac{h^2}{2r^2}$: the energy per unit mass, which is conserved. Its level curves in the $(r, v)$ plane are the radial motions — closed for bound orbits. In general relativity the same picture gains a $-GMh^2/(c^2r^3)$ term, which is what makes the innermost stable orbit.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [-0.6, 0.3], xlabel: 'r (units of h²/GM)', ylabel: 'energy per unit mass', curves: [{ fn: '-1/x + 1/(2x^2)', domain: [0.55, 5], color: 'accent', label: 'effective potential', labelAt: 1.5, labelDx: 12, labelDy: 18 }], hlines: [{ y: -0.3, label: 'a bound orbit’s energy', color: 'gold' }] }, caption: 'The effective potential energy per unit mass against r: gravity’s pull plus the centrifugal barrier. A bound orbit moves between the two radii where its energy line meets the curve.' },
    }),
    expr({
      id: 'cp-level', difficulty: 3,
      gen(r) {
        const [x0, y0] = r.pick([[1, 1], [1, 2], [2, 1], [0, 3]]);
        const C = x0 ** 3 + x0 * y0 + y0 ** 2;
        return {
          prompt: t`Solve $(3x^2 + y)\,dx + (x + 2y)\,dy = 0$ with $y(${x0}) = ${y0}$, as an equation in $x$ and $y$.`,
          answer: `x^3 + x*y + y^2 = ${C}`, answerTeX: t`x^3 + xy + y^2 = ${C}`,
          vars: { x: [-1.5, 1.5], y: [-2, 2] }, mode: 'equation',
          errors: [{ answer: `x^3 + 2x*y + y^2 = ${C + x0 * y0}`, feedback: t`The $xy$ term appears once: $\int (3x^2 + y)\,dx = x^3 + xy$, and $N = x + 2y$ adds only $y^2$.` }],
          hints: [t`$M_y = 1 = N_x$. Integrate $M$ in $x$: $x^3 + xy + g(y)$.`, t`Matching $N = x + 2y$ gives $g = y^2$. Evaluate $F$ at $(${x0}, ${y0})$.`],
          teach: 'Solve an exact IVP by finding F and setting it equal to its value at the initial point.',
          explain: t`$F = x^3 + xy + y^2$ and $F(${x0}, ${y0}) = ${C}$, so $x^3 + xy + y^2 = ${C}$.`,
          visual: { type: 'c3-contour', params: { f: 'x^3 + x*y + y^2', x: [-2.8, 2.8], y: [-3.5, 3.5], levels: [-4, -2, 0, 2, 4, 6, 9, 12], labels: false, fill: false, points: [{ x: x0, y: y0, label: 'start', color: 'gold' }] }, caption: 'Level curves of the potential, with the initial point.' },
        };
      },
    }),
    num({
      id: 'cp-power', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 1], [4, 2], [6, 2], [6, 3], [9, 3]]);
        const m = a / b - 1;
        return {
          prompt: t`The equation $${a}y\,dx + ${b}x\,dy = 0$ is not exact. For what power $m$ is $\mu = x^m$ an integrating factor?`,
          answer: m, tol: { rel: 1e-9, abs: 1e-9 },
          errors: [{ value: a / b, feedback: t`After multiplying, $\partial_x(${b}x^{m + 1}) = ${b}(m + 1)x^m$: the power rises by one before you differentiate.` }, { value: b / a - 1, feedback: t`Set $\partial_y(${a}x^my) = \partial_x(${b}x^{m+1})$: $${a} = ${b}(m + 1)$.` }].filter((e) => e.value !== m),
          hints: [t`Multiply through: $${a}x^my\,dx + ${b}x^{m+1}\,dy = 0$.`, t`Exact when $\partial_y(${a}x^m y) = \partial_x(${b}x^{m+1})$, that is $${a}x^m = ${b}(m + 1)x^m$.`],
          teach: 'To find an integrating factor of a given form, multiply through and impose the exactness test.',
          explain: t`$${a} = ${b}(m + 1)$ gives $m = ${nice(m)}$. Then $F = ${b}x^{${m + 1}}y$, and the solutions are the curves $x^{${nice(a / b)}}y = C$.`,
          visual: { type: 'c3-contour', params: { f: `x^${a / b}*y`, x: [0, 4.8], y: [-3, 3], levels: [-3, -1.5, -0.5, 0.5, 1.5, 3], labels: false, fill: false }, caption: t`The solution curves for $x > 0$: level curves of the potential the integrating factor produces.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.8 Exact equations', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax Calculus Vol. 3, §6.3 Conservative vector fields', url: 'https://openstax.org/books/calculus-volume-3/pages/6-3-conservative-vector-fields' },
  ],
});
