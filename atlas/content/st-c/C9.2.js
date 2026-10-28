// Cotangent vectors and differentials: T*_pM is the dual of T_pM; the
// differential df is defined by df(V) = V(f) and drawn as the stack of f's
// level lines near p; dx^μ(∂_ν) = δ^μ_ν. The stacks of dr, dθ and d(xy) on
// the plane, counted by an arrow; components in two charts; df is not an
// arrow (raising needs a metric); a 1-form that is not any df; and the rocket
// equation linearized as a covector.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const SEL = (k) => `step(0.5 - abs(m - ${k}))`;
const PX = 'r0*cos(th*pi/180)', PY = 'r0*sin(th*pi/180)';
const TH = 'th*pi/180';

// static pictures of a stack: rays of θ (spacing d radians) or circles of r about a point
const rayStack = (r0, thd, d, { V, caption, extra = [] } = {}) => {
  const th = thd * DEG, x = r6(r0 * Math.cos(th)), y = r6(r0 * Math.sin(th));
  return {
    type: 'graph',
    params: {
      x: [-0.4, 4.2], y: [-0.3, 3.4], equal: true, aspect: 'wide', grid: false, xticks: 6, yticks: 5,
      curves: [...Array.from({ length: 15 }, (_, k) => k - 7).map((j) => ({ param: [`t*${r6(Math.cos(th + j * d))}`, `t*${r6(Math.sin(th + j * d))}`], t: [0.25, 4.6], color: 'teal', width: j === 0 ? 2.2 : 1.2 })), ...extra],
      points: [{ x, y, color: 'ink', label: 'P', labelDx: -16, labelDy: 14 }, { x: 0, y: 0, r: 4, hollow: true, color: 'ink2' }],
      arrows: V ? [{ from: [x, y], to: [r6(x + V[0]), r6(y + V[1])], color: 'gold', width: 2.6, label: 'V' }] : [],
    },
    caption,
  };
};

export default lesson({
  id: 'st-c.C9.2',
  title: 'Cotangent vectors and differentials',
  minutes: 13, difficulty: 3,
  equation: t`df(V) = V(f) = \partial_\mu f\;V^\mu, \qquad dx^\mu(\partial_\nu) = \delta^\mu{}_\nu`,
  intro: t`A **cotangent vector** (covector, 1-form) at $p$ is a linear map from $T_pM$ to the numbers; together they form the **cotangent space** $T^*_pM$, the dual of $T_pM$. Every smooth function hands you one: its **differential** $df$, defined by $df(V) = V(f)$ — feed it a vector, get the rate of change of $f$ along that vector. No metric is involved.

Draw $df$ as you did in [st-a A3.1](#/lesson/st-a.A3.1) and [A3.2](#/lesson/st-a.A3.2): the level lines of $f$ near $p$, so closely zoomed that they are straight and evenly spaced. **$df(V)$ is the number of lines $V$ pierces** (per unit of $f$). The coordinate differentials $dx^\mu$ are the stacks of the coordinate lines, and they are the basis dual to $\partial_\nu$: $\partial_\nu$ crosses exactly one unit of its own coordinate and none of the others. So $df = \partial_\mu f\,dx^\mu$, and the lower index is earned, as [A3.5](#/lesson/st-a.A3.5) explained.`,
  symbols: [
    { tex: 'f', text: 'a smooth function on the manifold' },
    { tex: 'df', text: t`its differential, a covector at each point: the stack of $f$’s level lines there` },
    { tex: 'V', text: t`a tangent vector at the same point, with components $V^\mu$` },
    { tex: t`\partial_\mu f`, text: t`the components of $df$: the partial derivatives of $f$ in the chart` },
    { tex: t`dx^\mu`, text: t`the differentials of the coordinates — the dual basis of $T^*_pM$` },
    { tex: t`\delta^\mu{}_\nu`, text: t`the Kronecker delta: 1 when $\mu = \nu$, 0 otherwise` },
  ],
  why: t`Gradients, momenta and wave vectors are covectors: $p_\mu = \partial_\mu S$ for a particle’s action, $k_\mu = \partial_\mu(\text{phase})$ for a wave. Keeping them separate from vectors is what makes GR’s index notation honest — turning one into the other needs the metric, which in GR is the very field being solved for.`,
  visual: {
    type: 'graph',
    title: 'Count the lines',
    lead: t`Three functions on the plane, each drawn as its level lines through and near P: $r$ (circles, every 0.25), $\theta$ (rays, every 0.1 rad) and $xy$ (hyperbolae, every 0.5). The gold arrow $V$ pierces some of them; $df(V)$ is that count times the spacing.`,
    tasks: [
      t`Stack $d\theta$: turn $V$ to point straight along the ray through P. It crosses no rays — $d\theta(V) = 0$ — although $V$ is not zero. A covector can kill a nonzero vector.`,
      t`Still on $d\theta$, slide P outward: the rays spread, so the same arrow crosses fewer of them. $d\theta$ at P has components $(-y, x)/r^2$ — weaker far out.`,
      t`Stack $dr$: point $V$ along the circle and the count drops to about 0; point it outward and it crosses $|V|/0.25$ circles. Compare the readout of $df(V)$ with the true change of $f$ along $V$ — close for short arrows.`,
    ],
    params: {
      x: [-0.4, 4.4], y: [-0.3, 3.3], equal: true, aspect: 'wide', grid: false, xticks: 6, yticks: 5,
      choices: [{ key: 'm', label: 'Stack', options: [[1, t`$dr$`], [2, t`$d\theta$`], [3, t`$d(xy)$`]], value: 2, explain: 'Which function’s differential is drawn at P.' }],
      sliders: [
        { key: 'r0', label: t`$r$ at P`, min: 0.6, max: 3, step: 0.05, value: 1.6, explain: 'Distance of P from the origin.' },
        { key: 'th', label: t`$\theta$ at P`, min: 10, max: 75, step: 1, value: 35, unit: t`^\circ`, explain: 'Angle of P from the x-axis.' },
        { key: 'a', label: t`$V^x$`, min: -1.5, max: 1.5, step: 0.05, value: -0.6, explain: 'The arrow’s x-component.' },
        { key: 'b', label: t`$V^y$`, min: -1.5, max: 1.5, step: 0.05, value: 0.7, explain: 'The arrow’s y-component.' },
      ],
      curves: [
        ...Array.from({ length: 13 }, (_, k) => k - 6).map((j) => ({ param: [`(r0 + ${0.25 * j})*cos(t)`, `(r0 + ${0.25 * j})*sin(t)`], t: [0, r6(Math.PI / 2)], color: 'teal', width: j === 0 ? 2.2 : 1.2, when: `${SEL(1)}*step(r0 + ${0.25 * j} - 0.05)` })),
        ...Array.from({ length: 17 }, (_, k) => k - 8).map((j) => ({ param: [`t*cos(${TH} + ${r6(0.1 * j)})`, `t*sin(${TH} + ${r6(0.1 * j)})`], t: [0.2, 5], color: 'teal', width: j === 0 ? 2.2 : 1.2, when: SEL(2) })),
        ...Array.from({ length: 13 }, (_, k) => k - 6).map((j) => ({ param: ['t', `(${PX}*${PY} + ${0.5 * j})/t`], t: [0.05, 4.6], color: 'teal', width: j === 0 ? 2.2 : 1.2, when: `${SEL(3)}*step(${PX}*${PY} + ${0.5 * j} - 0.01)` })),
      ],
      points: [{ x: PX, y: PY, color: 'ink', label: 'P', labelDx: -16, labelDy: 14 }, { x: 0, y: 0, r: 4, hollow: true, color: 'ink2' }],
      arrows: [{ from: [PX, PY], to: [`${PX} + a`, `${PY} + b`], color: 'gold', width: 2.6, label: 'V' }],
      readouts: [
        { label: t`$dr(V) = (xV^x + yV^y)/r$`, expr: `(${PX}*a + ${PY}*b)/r0`, digits: 3, when: SEL(1) },
        { label: 'true change of r', expr: `sqrt((${PX} + a)^2 + (${PY} + b)^2) - r0`, digits: 3, when: SEL(1) },
        { label: t`$d\theta(V) = (xV^y - yV^x)/r^2$`, expr: `(${PX}*b - ${PY}*a)/r0^2`, digits: 3, when: SEL(2) },
        { label: t`true change of $\theta$`, expr: `atan2(${PY} + b, ${PX} + a) - ${TH}`, digits: 3, when: SEL(2) },
        { label: t`$d(xy)(V) = yV^x + xV^y$`, expr: `${PY}*a + ${PX}*b`, digits: 3, when: SEL(3) },
        { label: t`true change of $xy$`, expr: `(${PX} + a)*(${PY} + b) - ${PX}*${PY}`, digits: 3, when: SEL(3) },
      ],
    },
    caption: t`Exact level curves, spaced 0.25 in $r$, 0.1 rad in $\theta$ and 0.5 in $xy$; the bold one passes through P. $df(V)$ is the first-order count; the true change differs at second order, as the curved lines show. The origin (open dot) is outside the polar chart.`,
  },
  example: {
    prompt: t`For $f = x^2y$ at $p = (1, 2)$ and $V = 3\,\partial_x - 2\,\partial_y$, compute $df$ and $df(V)$. Then redo it in polar coordinates — $df = \partial_rf\,dr + \partial_\theta f\,d\theta$ and $V = V^r\partial_r + V^\theta\partial_\theta$ — and check that the number is the same.`,
    visual: { type: 'c3-contour', params: { f: 'x^2*y', x: [-1.2, 3.6], y: [0.5, 3.5], levels: { from: -6, to: 12, step: 1 }, labels: true, points: [{ x: 1, y: 2, color: 'ink', label: 'p' }], arrows: [{ from: [1, 2], to: [2.5, 1], color: 'gold', label: '½V' }] }, caption: t`Level curves of $x^2y$ every 1, and $V$ at $p$ drawn at half length. Along the full $V$ the value of $f$ rises by about 10.` },
    steps: [
      { label: 'Cartesian components', text: t`$\partial_xf = 2xy = 4$ and $\partial_yf = x^2 = 1$ at $p$, so $df = 4\,dx + dy$.` },
      { label: 'Pair', text: t`$df(V) = 4\cdot 3 + 1\cdot(-2) = 10$.` },
      { label: 'Polar point', text: t`$r = \sqrt5$, $\cos\theta = 1/\sqrt5$, $\sin\theta = 2/\sqrt5$; in polar form $f = r^3\cos^2\theta\sin\theta$.` },
      { label: 'Polar covector', text: t`$\partial_rf = 3r^2\cos^2\theta\sin\theta = 6/\sqrt5 \approx 2.683$ and $\partial_\theta f = r^3(\cos^3\theta - 2\cos\theta\sin^2\theta) = 1 - 8 = -7$.` },
      { label: 'Polar vector', text: t`$V^r = V(r) = (xV^x + yV^y)/r = -1/\sqrt5 \approx -0.447$ and $V^\theta = V(\theta) = (xV^y - yV^x)/r^2 = -8/5 = -1.6$.` },
      { label: 'Pair again', text: t`$df(V) = 2.683\times(-0.447) + (-7)\times(-1.6) = -1.2 + 11.2 = 10$ ✓. The components changed — one set with the Jacobian, the other with its inverse — and the pairing did not.` },
    ],
    answer: t`$df = 4\,dx + dy$ and $df(V) = 10$; in polar form $df \approx 2.683\,dr - 7\,d\theta$, $V \approx -0.447\,\partial_r - 1.6\,\partial_\theta$, and the pairing is again 10.`,
  },
  practice: [
    num({
      id: 'df-V', difficulty: 1,
      gen(r) {
        const [ftex, fex, fx, fy] = r.pick([[t`x^2 + 3y`, 'x^2 + 3*y', (x) => 2 * x, () => 3], [t`xy^2`, 'x*y^2', (x, y) => y * y, (x, y) => 2 * x * y], [t`x^2 - y^2`, 'x^2 - y^2', (x) => 2 * x, (x, y) => -2 * y]]);
        const x0 = r.pick([1, 2, -1]), y0 = r.pick([1, -1, 0.5]), a = r.pick([1, 2, -1]), b = r.pick([1, -1, 2]);
        const ans = fx(x0, y0) * a + fy(x0, y0) * b;
        return {
          prompt: t`For $f = ${ftex}$, find $df$ at $p = (${x0}, ${y0})$ and evaluate it on $V = (${a}, ${b})$ (that is, $V = ${a}\,\partial_x + (${b})\,\partial_y$).`,
          visual: { type: 'c3-contour', params: { f: fex, x: [-4, 4], y: [-2.5, 2.5], levels: 13, labels: false, points: [{ x: x0, y: y0, color: 'ink', label: 'p' }], arrows: [{ from: [x0, y0], to: [r6(x0 + 0.5 * a), r6(y0 + 0.5 * b)], color: 'gold', label: '½V' }] }, caption: t`Level curves of $f$ (equally spaced values) and $V$ at $p$, at half length.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: fx(x0, y0) * b + fy(x0, y0) * a, feedback: t`Pair matching indices: $df(V) = \partial_xf\,V^x + \partial_yf\,V^y$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$df = \partial_xf\,dx + \partial_yf\,dy$; at $p$ the components are $(${nice(fx(x0, y0))}, ${nice(fy(x0, y0))})$.`, t`$dx(V) = ${a}$ and $dy(V) = ${b}$.`],
          teach: t`A covector eats a vector: $df(V) = \partial_\mu f\,V^\mu$, the rate of change of $f$ along $V$.`,
          explain: t`$df = ${nice(fx(x0, y0))}\,dx + ${nice(fy(x0, y0))}\,dy$ at $p$, so $df(V) = ${nice(fx(x0, y0))}\cdot${a} + ${nice(fy(x0, y0))}\cdot(${b}) = ${nice(ans)}$ — the number of unit-spaced level lines $V$ would pierce if they were straight.`,
        };
      },
    }),
    num({
      id: 'dtheta-V', difficulty: 2,
      gen(r) {
        const r0 = r.pick([1, 2, 2.5]), thd = r.pick([30, 45, 60]);
        const [a, b] = r.pick([[0, 1], [-1, 0], [-0.5, 1], [1, 0.5]]);
        const th = thd * DEG, x = r0 * Math.cos(th), y = r0 * Math.sin(th);
        const ans = (x * b - y * a) / (r0 * r0);
        return {
          prompt: t`At the point $P$ with $r = ${r0}$, $\theta = ${thd}^\circ$, evaluate the covector $d\theta$ on $V = ${a}\,\partial_x + ${b}\,\partial_y$.`,
          visual: rayStack(r0, thd, 0.1, { V: [a, b], caption: t`The stack of $d\theta$ at P: rays every 0.1 rad (bold: through P), and $V$.` }),
          answer: ans, tol: { rel: 0.003, abs: 1e-6 },
          errors: [{ value: x * b - y * a, feedback: t`Divide by $r^2$: $d\theta = (-y\,dx + x\,dy)/r^2$. The rays spread out with distance.` }, { value: (x * a + y * b) / r0, feedback: t`That is $dr(V)$, the radial count. $d\theta$ counts rays.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans) + 1e-6),
          hints: [t`$\theta = \operatorname{atan2}(y, x)$, so $d\theta = \dfrac{-y\,dx + x\,dy}{x^2 + y^2}$.`, t`At P, $(x, y) = (${nice(x, 4)}, ${nice(y, 4)})$ and $r^2 = ${nice(r0 * r0)}$.`],
          teach: t`$d\theta = (-y\,dx + x\,dy)/r^2$: its stack is the fan of rays, which thins out as $1/r$.`,
          explain: t`$d\theta(V) = (${nice(x, 4)}\cdot ${b} - ${nice(y, 4)}\cdot(${a}))/${nice(r0 * r0)} = ${nice(ans, 4)}$ rad — about $${nice(ans / 0.1, 3)}$ of the drawn rays. In the polar chart this is just $V^\theta$: $d\theta$ picks out the $\theta$-component.`,
        };
      },
    }),
    mcq({
      id: 'not-arrow', difficulty: 2,
      prompt: t`A student draws $df$ at a point as the arrow $(\partial_xf,\ \partial_yf)$, “the gradient”. What is wrong with treating that arrow as $df$ itself?`,
      visual: { type: 'ten-metric', params: { mode: 'form', T: [[1, 0], [0, 1]], covector: [1, 0.6], covSliders: false, presets: [{ label: 'g = dx² + dy²', T: [[1, 0], [0, 1]] }, { label: 'g = dx² + 4dy²', T: [[1, 0], [0, 4]] }, { label: 'skewed g', T: [[1, 0.6], [0.6, 1]] }], showU: false, showV: false, readout: false, view: 2 }, caption: 'One covector’s stack (fixed) and the arrow it becomes under three different metrics: the stack never changes, the arrow does.' },
      choices: [
        'Turning a covector into an arrow needs a metric, and different metrics give different arrows; df itself — the stack — needs none',
        'Nothing: the gradient arrow and df are the same object',
        'The arrow should point along the level lines, not across them',
        'The arrow should have length 1',
      ],
      answer: 0,
      why: {
        1: t`Only once a metric is chosen: $\nabla f^\mu = g^{\mu\nu}\partial_\nu f$. Change $g$ and the arrow moves while $df$ stays put.`,
        2: t`Along the level lines $f$ does not change: $df$ gives 0 there. The gradient, when it exists, points across.`,
        3: 'Its length is |∇f| (measured by the metric); normalizing would throw away how steep f is.',
      },
      hints: ['Which ingredient does “perpendicular to the level lines” secretly use?', 'Switch the metric in the picture and watch what moves.'],
      teach: 'A differential is a stack of level lines, defined without a metric; the gradient arrow is that stack raised with a metric.',
      explain: t`$df(V) = V(f)$ uses no metric. The arrow $\nabla f$ with components $g^{\mu\nu}\partial_\nu f$ depends on $g$ — in GR, on the gravitational field. Even “perpendicular to the level lines” is a metric statement.`,
    }),
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const w1 = r.pick([1, 2, 3]), w2 = r.pick([1, -1, 2]), d = r.pick([0.5, 0.25]);
        const a = r.pick([1, 2, 1.5]), b = r.pick([1, 0.5, -0.5]);
        const ans = (w1 * a + w2 * b) / d;
        const lines = Array.from({ length: 41 }, (_, k) => k - 20).map((j) => ({ fn: `(${j * d} - ${w1}*x)/(${w2})`, color: 'teal', width: j === 0 ? 2 : 1.1 }));
        return {
          prompt: t`The function $f = ${w1 === 1 ? '' : w1}x ${w2 < 0 ? '-' : '+'} ${Math.abs(w2) === 1 ? '' : Math.abs(w2)}y$ is drawn as its level lines, one every $${d}$ in $f$. The arrow $V = (${a}, ${b})$ starts on one of them. How many gaps between lines does it cross — that is, what is $df(V)/${d}$?`,
          visual: { type: 'graph', params: { x: [-1, 3], y: [-1, 1.6], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 4, curves: lines, arrows: [{ from: [0, 0], to: [a, b], color: 'gold', width: 2.6, label: 'V' }] }, caption: t`Level lines of $f$, every $${d}$, and the arrow from the origin.` },
          answer: ans, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: w1 * a + w2 * b, feedback: t`That is $df(V)$ itself. Each gap is worth $${d}$ of $f$, so divide by $${d}$.` }].filter((e) => Math.abs(e.value - ans) > 0.1),
          hints: [t`$df = ${w1}\,dx + (${w2})\,dy$ everywhere: $f$ is linear, so its stack is the same at every point.`, t`$df(V) = ${w1}\cdot${a} + (${w2})\cdot(${b})$.`],
          teach: 'df(V) counts the level lines V crosses, in units of the spacing.',
          explain: t`$df(V) = ${nice(w1 * a + w2 * b)}$, i.e. $${nice(ans)}$ gaps of $${d}$${ans < 0 ? ' — negative, because V runs toward lower values of f' : ''}.`,
        };
      },
    }),
    num({
      id: 'polar-dx', difficulty: 2,
      gen(r) {
        const r0 = r.pick([1, 2, 3]), thd = r.pick([30, 45, 60, 120]);
        const which = r.pick(['x', 'y']), th = thd * DEG;
        const ans = which === 'x' ? -r0 * Math.sin(th) : r0 * Math.cos(th);
        return {
          prompt: t`In polar coordinates, the covector $d${which}$ is $d${which} = A\,dr + B\,d\theta$. Find $B$ at $r = ${r0}$, $\theta = ${thd}^\circ$.`,
          visual: rayStack(r0, thd, 0.1, { caption: t`The stack of $d\theta$ near the point (rays every 0.1 rad). $d${which}$’s stack would be ${which === 'x' ? 'vertical' : 'horizontal'} lines.`, extra: [{ param: [`${r0}*cos(t)`, `${r0}*sin(t)`], t: [0, r6(Math.PI)], color: 'violet', width: 1.4, dash: [5, 4] }] }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: which === 'x' ? -Math.sin(th) / r0 : Math.cos(th) / r0, feedback: t`That is the $\partial_\theta$-component of $\partial_${which}$, which uses the inverse Jacobian. Covector components use $\partial ${which}/\partial\theta$ directly.` }, { value: which === 'x' ? Math.cos(th) : Math.sin(th), feedback: t`That is $A = \partial ${which}/\partial r$. $B = \partial ${which}/\partial\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$${which} = r${which === 'x' ? t`\cos` : t`\sin`}\theta$, so $d${which} = \dfrac{\partial ${which}}{\partial r}dr + \dfrac{\partial ${which}}{\partial\theta}d\theta$.`, t`$B = \partial ${which}/\partial\theta = ${which === 'x' ? t`-r\sin\theta` : t`r\cos\theta`}$.`],
          teach: t`A function’s differential in any chart is $\partial_\mu f\,dx^\mu$; for $f = x$ in polar coordinates, $dx = \cos\theta\,dr - r\sin\theta\,d\theta$.`,
          explain: t`$d${which} = ${which === 'x' ? t`\cos\theta\,dr - r\sin\theta\,d\theta` : t`\sin\theta\,dr + r\cos\theta\,d\theta`}$, so $B = ${nice(ans, 4)}$. Compare C9.1: the vector $\partial_${which}$ had $\theta$-component with $1/r$; the covector $d${which}$ has one with $r$ — inverse Jacobians, so that $d${which}(\partial_${which}) = 1$ in any chart.`,
        };
      },
    }),
    order({
      id: 'transform', difficulty: 3,
      prompt: t`Show that covector components change with the inverse Jacobian, and that this keeps $df(V)$ the same in every chart. Order the steps.`,
      visual: rayStack(2, 40, 0.1, { V: [-0.6, 0.9], caption: 'One stack (dθ), one arrow: the count of rays crossed is a fact about the picture, not about any chart.' }),
      items: [
        t`In new coordinates $x'^\nu$, the chain rule gives $\dfrac{\partial f}{\partial x'^\nu} = \dfrac{\partial x^\mu}{\partial x'^\nu}\dfrac{\partial f}{\partial x^\mu}$: covector components use $\partial x/\partial x'$.`,
        t`Vector components are $V'^\nu = V(x'^\nu) = \dfrac{\partial x'^\nu}{\partial x^\mu}V^\mu$: they use the Jacobian $\partial x'/\partial x$.`,
        t`So $\dfrac{\partial f}{\partial x'^\nu}V'^\nu = \dfrac{\partial x^\mu}{\partial x'^\nu}\dfrac{\partial x'^\nu}{\partial x^\lambda}\,\partial_\mu f\,V^\lambda$.`,
        t`The two Jacobians are inverse matrices: their product is $\delta^\mu{}_\lambda$.`,
        t`Hence $\partial'_\nu f\,V'^\nu = \partial_\mu f\,V^\mu$ — the same number in both charts.`,
      ],
      hints: ['Start from the chain rule for each kind of component.', 'Multiply them and look for a matrix times its inverse.'],
      teach: 'Covector components transform with the inverse of the matrix that transforms vector components, so their pairing is chart-independent.',
      explain: t`This is the whole reason for upper and lower indices: a sum over one up and one down index is invariant. The worked example checked it numerically — 10 in both charts.`,
    }),
    mcq({
      id: 'not-exact', difficulty: 3,
      prompt: t`Is the covector field $\omega = x\,dy$ on the plane the differential $df$ of some function $f$?`,
      visual: { type: 'graph', params: { x: [0, 3.2], y: [-0.2, 1.8], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 3, curves: [0.5, 1, 1.5, 2, 2.5, 3].flatMap((xi) => [0.4, 1.2].flatMap((yj) => [-1, 0, 1].map((s) => ({ param: [`${xi} + 0.18*t`, String(r6(yj + (s * 0.12) / xi))], t: [-1, 1], color: 'teal', width: 1.4 })))) }, caption: t`Little local stacks of $\omega = x\,dy$ at sample points: always horizontal, but packed tighter to the right (spacing $\propto 1/x$).` },
      choices: [
        t`No: if $\omega = df$ then $\partial_xf = 0$ and $\partial_yf = x$, but then $\partial_x\partial_yf = 1 \ne 0 = \partial_y\partial_xf$`,
        t`Yes: $f = xy$`,
        t`Yes: every covector field is the differential of something`,
        t`No, because $\omega$ vanishes on the $y$-axis`,
      ],
      answer: 0,
      why: {
        1: t`$d(xy) = y\,dx + x\,dy$, which has an extra $y\,dx$.`,
        2: t`Exact forms are special: their mixed partials must agree. Most covector fields fail.`,
        3: t`Vanishing somewhere is allowed — $d(x^2)$ vanishes on the $y$-axis too. The test is the mixed partials.`,
      },
      hints: [t`Suppose $df = x\,dy$. What are $\partial_xf$ and $\partial_yf$?`, 'Mixed partial derivatives of a smooth function are equal.'],
      teach: t`A covector field $\omega_\mu\,dx^\mu$ can only be a differential if $\partial_\mu\omega_\nu = \partial_\nu\omega_\mu$; local stacks that cannot join into level curves fail this.`,
      explain: t`The local stacks would have to be pieces of one family of level curves. They are all horizontal, so the curves would be the lines $y = $ const — but then the spacing could not change along a line, and here it does. C10.2 packages this test as $d\omega = dx\wedge dy \ne 0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const ve = r.pick([3000, 3400, 4400]), m0 = r.pick([20000, 40000]), mf = r.pick([5000, 8000]), dm = r.pick([50, 100, 200]);
        const lin = ve * dm * (1 / m0 - 1 / mf);
        const curve = `${ve}*ln((${m0} + x)/(${mf} + x))`;
        return {
          prompt: t`A stage’s $\Delta v = v_e\ln(m_0/m_f)$, with exhaust speed $v_e = ${ve}$ m/s, liftoff mass $m_0 = ${m0}$ kg and burnout mass $m_f = ${mf}$ kg. Late in design, ${dm} kg of extra dry mass is added, raising both $m_0$ and $m_f$ by ${dm} kg. Treating $d(\Delta v)$ as a covector on the $(m_0, m_f)$ plane, estimate the change in $\Delta v$, in m/s.`,
          visual: { type: 'graph', params: { x: [0, 1000], y: [ve * Math.log((m0 + 1000) / (mf + 1000)) - 50, ve * Math.log(m0 / mf) + 30], aspect: 'wide', xticks: 6, yticks: 5, xlabel: 'added dry mass (kg)', ylabel: 'Δv (m/s)', curves: [{ fn: curve, color: 'accent', width: 2.4 }], tangent: { fn: curve, at: 0 }, vlines: [{ x: dm, color: 'gold' }] }, caption: 'Δv against added dry mass (blue) and its tangent line at zero: the differential’s prediction. Gold: the added mass.' },
          answer: lin, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: ve * dm / m0, feedback: t`The added mass raises $m_f$ too: $d(\Delta v) = v_e\left(\dfrac{dm_0}{m_0} - \dfrac{dm_f}{m_f}\right)$ with both $dm_0$ and $dm_f$ equal to ${dm} kg.` }, { value: -ve * dm / mf, feedback: 'Include the liftoff mass term: it partly offsets the burnout term.' }, { value: -lin, feedback: 'Extra dry mass costs Δv: the change is negative.' }],
          hints: [t`$d(\Delta v) = \dfrac{v_e}{m_0}\,dm_0 - \dfrac{v_e}{m_f}\,dm_f$ — a covector with components $(v_e/m_0,\ -v_e/m_f)$.`, t`Feed it the vector $(dm_0, dm_f) = (${dm}, ${dm})$ kg.`],
          teach: 'The differential of a function, fed a small change of its inputs, gives the first-order change of its output — the engineer’s sensitivity estimate.',
          explain: t`$d(\Delta v) = ${ve}\times${dm}\times\left(\tfrac{1}{${m0}} - \tfrac{1}{${mf}}\right) = ${nice(lin, 4)}$ m/s. The exact change is $${nice(ve * Math.log((m0 + dm) / (mf + dm)) - ve * Math.log(m0 / mf), 4)}$ m/s — the covector is the tangent line, and it is excellent for small changes.`,
        };
      },
    }),
    num({
      id: 'cp-pair', difficulty: 2,
      gen(r) {
        const A = r.pick([2, -1, 3]), B = r.pick([0.5, -2, 4]), Vr = r.pick([1, -0.5, 2]), Vt = r.pick([0.25, -1, 0.5]);
        const ans = A * Vr + B * Vt;
        return {
          prompt: t`At a point, a covector is $\omega = ${A}\,dr ${B < 0 ? '-' : '+'} ${Math.abs(B)}\,d\theta$ and a vector is $V = ${Vr}\,\partial_r ${Vt < 0 ? '-' : '+'} ${Math.abs(Vt)}\,\partial_\theta$. What is $\omega(V)$?`,
          visual: rayStack(2, 35, 0.1, { V: [r6(Vr * Math.cos(35 * DEG) - 2 * Vt * Math.sin(35 * DEG)), r6(Vr * Math.sin(35 * DEG) + 2 * Vt * Math.cos(35 * DEG))], caption: t`The polar coordinate lines’ stack $d\theta$ at a point with $r = 2$, and $V$ drawn to scale.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: A * Vt + B * Vr, feedback: t`Pair $dr$ with $\partial_r$ and $d\theta$ with $\partial_\theta$: $dr(\partial_\theta) = 0$.` }, { value: A * Vr + B * Vt * 4, feedback: t`No metric factor enters a pairing: $d\theta(\partial_\theta) = 1$ exactly, whatever $r$ is.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$dr(\partial_r) = 1$, $dr(\partial_\theta) = 0$, $d\theta(\partial_r) = 0$, $d\theta(\partial_\theta) = 1$.`],
          teach: t`With dual bases the pairing is just $\omega_\mu V^\mu$ — no metric, no factors of $r$.`,
          explain: t`$\omega(V) = ${A}\cdot${Vr} + (${B})(${Vt}) = ${nice(ans)}$. That $r$ never appears is the point: $dx^\mu(\partial_\nu) = \delta^\mu{}_\nu$ in every chart, however curved its grid.`,
        };
      },
    }),
    mcq({
      id: 'cp-kill', difficulty: 2,
      prompt: t`At a point of a 2-manifold, $df \ne 0$. Which vectors $V$ there have $df(V) = 0$?`,
      visual: rayStack(1.8, 40, 0.1, { V: [r6(0.9 * Math.cos(40 * DEG)), r6(0.9 * Math.sin(40 * DEG))], caption: 'The stack of dθ and an arrow along the bold line through P: it crosses no lines.' }),
      choices: [
        t`Exactly the multiples of one nonzero vector: the direction along the level line of $f$ through the point`,
        t`Only $V = 0$`,
        t`The vectors perpendicular to the gradient arrow, which needs a metric to find`,
        t`Every vector, since $df$ is small`,
      ],
      answer: 0,
      why: {
        1: t`A nonzero covector on a 2D space has a 1D kernel: the vectors that slide along its lines.`,
        2: 'True in the end, but the direction along the level line is defined with no metric — “perpendicular” is the wrong way to find it.',
        3: t`$df \ne 0$ means some vector gives a nonzero count.`,
      },
      hints: ['Which arrows cross none of the lines of the stack?'],
      teach: 'The vectors a covector sends to zero are those lying along its lines: the tangent directions of the level set.',
      explain: t`Those vectors are tangent to the level curve $f = f(p)$. In $n$ dimensions they form an $(n-1)$-dimensional subspace — the tangent space of the level set (C8.3’s regular value theorem, seen from $T_pM$).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §2.3', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, §2.5–2.7 (1-forms as stacks of surfaces)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
  ],
});
