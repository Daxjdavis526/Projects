// The gradient df is a covector: df(V) = V(f), its stack is the zoomed-in
// level curves of f, and df = ∂_μ f dx^μ is a covector expanded in the
// covector basis dx^μ, with dx^μ(∂_ν) = δ^μ_ν.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_ten.js';

const t = String.raw;

// a contour map of f with the point P (and optionally an arrow V) and the tangent stack of df at P
function dfPic(f, [px, py], [gx, gy], { V, caption, step = 0.5, x = [-3, 3], y = [-2.4, 2.4], levels, span = 1.4, k = 4 } = {}) {
  const g2 = gx * gx + gy * gy, g = Math.sqrt(g2);
  const lines = [];
  for (let j = -k; j <= k; j++) lines.push({ param: [`${r6(px + (j * step * gx) / g2)} - ${r6(gy / g)}*t`, `${r6(py + (j * step * gy) / g2)} + ${r6(gx / g)}*t`], t: [-span, span], color: 'teal', width: j === 0 ? 2.4 : 1.6 });
  return {
    type: 'c3-contour',
    params: {
      f, x, y, levels: levels || { from: -20, to: 20, step }, labels: false, fillAlpha: 0.18,
      curves: lines,
      points: [{ x: r6(px), y: r6(py), color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }],
      arrows: V ? [{ from: [r6(px), r6(py)], to: [r6(px + V[0]), r6(py + V[1])], color: 'gold', label: 'V' }] : [],
    },
    caption,
  };
}

export default lesson({
  id: 'st-a.A3.2',
  title: 'The gradient df is a covector',
  minutes: 10, difficulty: 2,
  intro: t`The commonest covector is the **differential** of a function. At a point, $df$ is defined by what it does to a vector: it gives the vector’s directional derivative of $f$, $df(V) = V(f)$ (lesson A2.3). Its stack is the level curves of $f$ zoomed in until they look straight and evenly spaced. And in coordinates it is the formula you met in calculus, now read as a covector written in a basis:

$$df = \frac{\partial f}{\partial x^\mu}\,dx^\mu, \qquad df(V) = V^\mu\,\partial_\mu f$$

The basis covectors $dx^\mu$ are themselves differentials — of the coordinate functions — and they pair with the basis vectors to give the Kronecker delta, $dx^\mu(\partial_\nu) = \partial_\nu x^\mu = \delta^\mu_\nu$. Calculus III (lesson C3-3.6) showed $df(\vec v)$ needs no metric; here $df$ takes its place among the tensors.`,
  symbols: [
    { tex: 'f', text: 'a smooth function: a temperature, a potential, a phase' },
    { tex: 'df', text: t`its differential at a point: the covector with $df(V) = V(f)$. Picture: the level curves of $f$ near the point, straightened` },
    { tex: t`\partial_\mu f = \dfrac{\partial f}{\partial x^\mu}`, text: t`the components of $df$: units of $f$ per unit of the coordinate $x^\mu$. Lower index` },
    { tex: t`dx^\mu`, text: t`the basis covectors: the differentials of the coordinates. $dx$ is the stack of lines $x = $ const` },
    { tex: 'V^\\mu', text: 'the components of a vector at the point' },
  ],
  why: t`In relativity the wave covector $k_\mu = \partial_\mu(\text{phase})$, the four-momentum $p_\mu$ and the gradient of the gravitational potential in the Newtonian limit are all differentials, with lower indices for exactly this reason.`,
  visual: {
    type: 'c3-contour',
    title: 'Zoom in on the level curves',
    lead: t`Level curves of $f = \tfrac12x^2 + y^2$, every 0.5. At the point P the teal lines are the stack of $df$: the level curves’ straight-line approximation, spaced so that each gap is a change of 0.5 in $f$. The readout compares $df(V)$ with the true change $f(P + V) - f(P)$.`,
    tasks: [
      'Shrink the arrow: df(V) and the true change agree better and better. df is the first-order part of the change.',
      t`Move P: the stack tilts and packs tighter where the level curves crowd. $df$ is a different covector at every point — a covector field.`,
      t`Move P to the origin, the bottom of the bowl: $df = 0$ there and the stack disappears.`,
    ],
    params: {
      f: '0.5*x^2 + y^2', x: [-3, 3], y: [-2.2, 2.2], levels: { from: 0, to: 10, step: 0.5 }, labels: false, fillAlpha: 0.18,
      sliders: [
        { key: 'px', label: 'P: $x$', min: -2.4, max: 2.4, step: 0.1, value: 1.2, explain: 'Where df is taken.' },
        { key: 'py', label: 'P: $y$', min: -1.6, max: 1.6, step: 0.1, value: 0.8, explain: 'Each point has its own differential.' },
        { key: 'vx', label: '$V^x$', min: -1.5, max: 1.5, step: 0.05, value: 0.6, explain: 'A step away from P.' },
        { key: 'vy', label: '$V^y$', min: -1.5, max: 1.5, step: 0.05, value: 0.3, explain: 'Its other component.' },
      ],
      curves: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((j) => ({
        param: [`px + ${j}*0.5*px/(px^2 + 4*py^2) - 2*py/sqrt(px^2 + 4*py^2)*t`, `py + ${j}*0.5*2*py/(px^2 + 4*py^2) + px/sqrt(px^2 + 4*py^2)*t`],
        t: [-1.3, 1.3], color: 'teal', width: j === 0 ? 2.4 : 1.6,
      })),
      points: [{ x: 'px', y: 'py', color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }],
      arrows: [{ from: ['px', 'py'], to: ['px + vx', 'py + vy'], color: 'gold', label: 'V' }],
      readouts: [
        { label: t`$df = (\partial_xf,\ \partial_yf)$ at P: $\partial_xf$`, expr: 'px', digits: 3 },
        { label: t`$\partial_yf$`, expr: '2*py', digits: 3 },
        { label: t`$df(V) = V^x\partial_xf + V^y\partial_yf$`, expr: 'vx*px + vy*2*py', digits: 3 },
        { label: t`true change $f(P + V) - f(P)$`, expr: '0.5*(px + vx)^2 + (py + vy)^2 - 0.5*px^2 - py^2', digits: 3 },
      ],
    },
    caption: t`Level curves of $f$ (every 0.5) and, at P, the stack of $df$ in teal: straight lines on which the linear approximation of $f$ takes the same values. Near P the two agree; far from P they part.`,
  },
  example: {
    prompt: t`For $f = x^2y$ at the point $(1, 2)$: find $df$ in the basis $dx, dy$, evaluate it on $V = 3\,\partial_x - \partial_y$, and check against the actual change of $f$ along a short step $\varepsilon V$.`,
    visual: dfPic('x^2*y', [1, 2], [4, 1], { V: [0.6, -0.2], step: 1, x: [-0.5, 2.6], y: [0.6, 3.3], span: 1, k: 3, caption: t`Level curves of $x^2y$ (every 1) and the stack of $df$ at $(1, 2)$, with $V$ drawn at a fifth of its length.` }),
    steps: [
      { label: 'Components', text: t`$\partial_xf = 2xy = 4$ and $\partial_yf = x^2 = 1$ at $(1, 2)$, so $df = 4\,dx + 1\,dy$.` },
      { label: 'Pair with the vector', text: t`$df(V) = 4\,dx(V) + dy(V) = 4V^x + V^y = 4(3) + (-1) = 11$, using $dx(V) = V^x$ and $dy(V) = V^y$.` },
      { label: 'Check numerically', text: t`With $\varepsilon = 0.001$: $f(1.003,\ 1.999) - f(1, 2) = 1.003^2\times1.999 - 2 = 0.011\,012$, which is $11.012\,\varepsilon$. ✓ The extra $0.012\,\varepsilon$ (that is, $12\varepsilon^2$) is second order and vanishes as $\varepsilon \to 0$.` },
      { label: 'Why the basis works', text: t`$dx(\partial_x) = 1$, $dx(\partial_y) = 0$, $dy(\partial_x) = 0$, $dy(\partial_y) = 1$: the covectors $dx^\mu$ pick out components, which is exactly why $df(V) = \partial_\mu f\,V^\mu$.` },
    ],
    answer: t`$df = 4\,dx + dy$ at $(1, 2)$, and $df(V) = 11$.`,
  },
  practice: [
    num({
      id: 'component', difficulty: 1,
      gen(r) {
        const [fs, ftex, fx, fy] = r.pick([
          ['x*y^2', t`xy^2`, (x, y) => y * y, (x, y) => 2 * x * y],
          ['x^2 + 3*x*y', t`x^2 + 3xy`, (x, y) => 2 * x + 3 * y, (x, y) => 3 * x],
          ['y^3 - x*y', t`y^3 - xy`, (x, y) => -y, (x, y) => 3 * y * y - x],
        ]);
        let P, which, val;
        for (let k = 0; k < 30; k++) { P = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])]; which = r.pick(['x', 'y']); val = which === 'x' ? fx(...P) : fy(...P); if (val !== 0) break; }
        return {
          prompt: t`For $f = ${ftex}$, what is the $d${which}$ component of $df$ at $(${P.join(', ')})$ — that is, $\partial_${which}f$ there?`,
          visual: dfPic(fs, P, [fx(...P), fy(...P)], { step: 1, x: [P[0] - 1.6, P[0] + 1.6], y: [P[1] - 1.1, P[1] + 1.1], levels: 14, span: 0.9, k: 3, caption: t`Level curves of $${ftex}$ near the point, and the stack of $df$ there (teal).` }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: which === 'x' ? fy(...P) : fx(...P), feedback: t`That is the other component. The $d${which}$ component is $\partial f/\partial ${which}$.` }].filter((e) => e.value !== val),
          hints: [t`$df = \partial_xf\,dx + \partial_yf\,dy$.`],
          teach: 'The components of df are the partial derivatives of f.',
          explain: t`$\partial_${which}f = ${val}$ at $(${P.join(', ')})$, so $df = ${fx(...P)}\,dx ${fy(...P) < 0 ? '-' : '+'} ${Math.abs(fy(...P))}\,dy$ there.`,
        };
      },
    }),
    num({
      id: 'df-of-v', difficulty: 2,
      gen(r) {
        const fx = (x, y) => 2 * x - y, fy = (x, y) => -x + 2 * y;
        let P, V, val;
        for (let k = 0; k < 30; k++) { P = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])]; V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])]; val = V[0] * fx(...P) + V[1] * fy(...P); if (val !== 0) break; }
        return {
          prompt: t`For $f = x^2 - xy + y^2$, evaluate $df(V)$ at $(${P.join(', ')})$ with $V = ${V[0]}\,\partial_x ${V[1] < 0 ? '-' : '+'} ${Math.abs(V[1])}\,\partial_y$.`,
          visual: dfPic('x^2 - x*y + y^2', P, [fx(...P), fy(...P)], { V: V.map((v) => v * 0.25), step: 1, x: [P[0] - 2, P[0] + 2], y: [P[1] - 1.4, P[1] + 1.4], levels: 16, span: 1.1, k: 3, caption: t`The stack of $df$ (teal) and $V$ at a quarter of its length: $df(V)$ is four times the number of teal gaps the drawn arrow crosses.` }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          hints: [t`$df = (2x - y)\,dx + (2y - x)\,dy$.`, t`At the point, $df = ${fx(...P)}\,dx + (${fy(...P)})\,dy$; pair it with $V^\mu = (${V.join(', ')})$.`],
          teach: t`$df(V) = \partial_\mu f\,V^\mu$: the partial derivatives at the point times the vector’s components.`,
          explain: t`$df(V) = (${fx(...P)})(${V[0]}) + (${fy(...P)})(${V[1]}) = ${val}$.`,
        };
      },
    }),
    mcq({
      id: 'dx-dy', difficulty: 1,
      prompt: t`What is $dx(\partial_y)$ — the covector $dx$ applied to the basis vector $\partial_y$?`,
      visual: dfPic('x', [0.5, 0.2], [1, 0], { V: [0, 1], step: 0.5, x: [-1.4, 2.4], y: [-1, 1.6], levels: { from: -3, to: 3, step: 0.5 }, span: 1.4, k: 3, caption: t`The stack of $dx$: the lines $x = $ const. The arrow is $\partial_y$, which runs along them.` }),
      choices: ['0', '1', t`$\partial x/\partial x = 1$, because $dx$ is always 1`, t`It depends on the point`],
      answer: 0,
      why: {
        1: t`$dx(\partial_x) = 1$; $\partial_y$ moves along a line of constant $x$, so it crosses none of $dx$’s lines.`,
        2: t`$dx$ is a covector, not a number: its value depends on the vector you feed it.`,
        3: t`$dx^\mu(\partial_\nu) = \delta^\mu_\nu$ at every point.`,
      },
      hints: [t`$dx(\partial_y) = \partial_y(x)$: how fast does $x$ change as you move along $y$?`],
      teach: t`The coordinate covectors and vectors pair to the Kronecker delta: $dx^\mu(\partial_\nu) = \delta^\mu_\nu$.`,
      explain: t`$dx(\partial_y) = \partial_y x = 0$. In the picture, $\partial_y$ lies along the lines of the $dx$ stack and crosses none.`,
    }),
    num({
      id: 'range', difficulty: 2,
      gen(r) {
        const [X, Y, R] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]);
        const V = [r.pick([0.1, -0.2, 0.3]), r.pick([0.2, -0.1, -0.3])];
        const val = (X * V[0] + Y * V[1]) / R;
        const exact = Math.hypot(X + V[0], Y + V[1]) - R;
        return {
          prompt: t`A radar at the origin measures range $f = \sqrt{x^2 + y^2}$ (km). A target at $(${X}, ${Y})$ km moves by $V = (${V[0]}, ${V[1]})$ km. Use $df$ to estimate the change in range.`,
          visual: dfPic('sqrt(x^2 + y^2)', [X, Y], [X / R, Y / R], { V: V.map((v) => v * 4), step: 0.2, x: [Math.min(X, X + 4 * V[0]) - 0.8, Math.max(X, X + 4 * V[0]) + 0.8], y: [Math.min(Y, Y + 4 * V[1]) - 0.4, Math.max(Y, Y + 4 * V[1]) + 0.4], levels: { from: 0, to: 30, step: 0.2 }, span: 0.9, k: 4, caption: t`Range circles every 0.2 km near the target, the stack of $df$ (teal) and the step $V$, drawn 4 times longer than it is.` }),
          answer: val, units: 'km', tol: { rel: 0.01, abs: 0.0005 },
          errors: [{ value: Math.hypot(...V), feedback: 'That is the length of the step. Only its component across the range circles changes the range.' }].filter((e) => Math.abs(e.value - val) > 0.01 * Math.abs(val) + 0.0005),
          hints: [t`$\partial_xf = x/f$ and $\partial_yf = y/f$: at the target, $df = \tfrac{${X}}{${R}}\,dx + \tfrac{${Y}}{${R}}\,dy$.`],
          teach: 'df(V) is the first-order change of f along a small step V.',
          explain: t`$df(V) = \tfrac{${X}}{${R}}(${V[0]}) + \tfrac{${Y}}{${R}}(${V[1]}) = ${nice(val, 4)}$ km. The exact change is $${nice(exact, 4)}$ km; the difference is second order in the step.`,
        };
      },
    }),
    num({
      id: 'along-level', difficulty: 2,
      gen(r) {
        const P = r.pick([[1, 1], [2, 1], [1, -1], [-1, 2]]);
        const fx = 2 * P[0], fy = 6 * P[1];               // f = x² + 3y²
        const ans = -fx / fy;
        return {
          prompt: t`For $f = x^2 + 3y^2$ at $(${P.join(', ')})$, find $V^y$ so that $V = \partial_x + V^y\,\partial_y$ points along the level curve, $df(V) = 0$.`,
          visual: dfPic('x^2 + 3*y^2', P, [fx, fy], { step: 1, x: [P[0] - 1.8, P[0] + 1.8], y: [P[1] - 1.2, P[1] + 1.2], levels: 16, span: 1, k: 3, caption: t`Level curves of $x^2 + 3y^2$ and the stack of $df$ at the point. A vector along the zero line of the stack crosses none.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: fy / fx, feedback: t`Solve $\partial_xf + V^y\partial_yf = 0$: $V^y = -\partial_xf/\partial_yf$.` }, { value: -ans, feedback: 'Check the sign.' }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`$df(V) = \partial_xf\cdot1 + \partial_yf\cdot V^y$.`, t`$\partial_xf = ${fx}$, $\partial_yf = ${fy}$.`],
          teach: 'Vectors with df(V) = 0 are tangent to the level curve: they cross none of the stack’s lines.',
          explain: t`$${fx} + ${fy}V^y = 0$ gives $V^y = ${nice(ans, 4)}$.`,
        };
      },
    }),
    order({
      id: 'derive-components', difficulty: 2,
      prompt: t`Put in order the argument that the components of $df$ in the basis $dx^\mu$ are the partial derivatives.`,
      items: [
        t`Write $df$ in the basis of covectors: $df = \omega_\mu\,dx^\mu$ for some numbers $\omega_\mu$.`,
        t`Feed both sides the basis vector $\partial_\nu$: $df(\partial_\nu) = \omega_\mu\,dx^\mu(\partial_\nu)$.`,
        t`Use $dx^\mu(\partial_\nu) = \delta^\mu_\nu$: the right side collapses to $\omega_\nu$.`,
        t`The left side is $\partial_\nu(f) = \partial f/\partial x^\nu$, by the definition $df(V) = V(f)$. So $\omega_\nu = \partial_\nu f$.`,
      ],
      hints: ['Start by assuming the expansion, then test it on one basis vector.', 'The delta does the work in the middle step.'],
      teach: t`Feeding a basis vector to a covector reads off one component: $\omega_\nu = \omega(\partial_\nu)$.`,
      explain: t`Expand, test on $\partial_\nu$, let the delta pick out $\omega_\nu$, and compare with $\partial_\nu f$. The same two lines work for any covector: its components are its values on the basis vectors.`,
    }),
    multi({
      id: 'rules', difficulty: 2,
      prompt: 'Which of these hold for differentials at a point? Select every one.',
      visual: dfPic('0.5*x^2 + y^2', [1.2, 0.8], [1.2, 1.6], { step: 0.5, levels: { from: 0, to: 10, step: 0.5 }, span: 1.2, k: 4, caption: t`Level curves of a function and the stack of its differential at P.` }),
      choices: [t`$d(f + g) = df + dg$`, t`$d(fg) = f\,dg + g\,df$`, t`$dc = 0$ for a constant $c$`, t`$df(V) = V(f)$ needs no metric`, t`$df$ is the same covector at every point`],
      answer: [0, 1, 2, 3],
      why: { 4: t`$df$ has components $\partial_\mu f$, which change from point to point: it is a covector field.` },
      hints: [t`$df(V) = V(f)$, and $V$ is a derivative: linear, Leibniz, kills constants.`],
      teach: t`$d$ obeys the rules of derivatives, and $df(V)$ is defined with no metric at all.`,
      explain: t`All the derivative rules carry over because $df(V) = V(f)$. But $df$ varies with the point — only for a linear function is it the same everywhere.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-df', difficulty: 2,
      gen(r) {
        let P, V, val;
        for (let k = 0; k < 30; k++) { P = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])]; V = [r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0])]; val = V[0] * (2 * P[0] + P[1]) + V[1] * P[0]; if (val !== 0) break; }
        return {
          prompt: t`For $f = x^2 + xy$, find $df(V)$ at $(${P.join(', ')})$ for $V^\mu = (${V.join(', ')})$.`,
          visual: dfPic('x^2 + x*y', P, [2 * P[0] + P[1], P[0]], { V: V.map((v) => v * 0.3), step: 1, x: [P[0] - 2, P[0] + 2], y: [P[1] - 1.4, P[1] + 1.4], levels: 16, span: 1.1, k: 3, caption: 'The stack of df at the point and V at 0.3 of its length.' }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          hints: [t`$df = (2x + y)\,dx + x\,dy$.`],
          teach: t`$df(V) = \partial_\mu f\,V^\mu$.`,
          explain: t`$df = ${2 * P[0] + P[1]}\,dx + (${P[0]})\,dy$ there, so $df(V) = (${2 * P[0] + P[1]})(${V[0]}) + (${P[0]})(${V[1]}) = ${val}$.`,
        };
      },
    }),
    num({
      id: 'cp-potential', difficulty: 3, transfer: true,
      gen(r) {
        const GM = 3.986004418e14;
        const [pos, name] = r.pick([[[4000, 5000, 2000], 'a satellite'], [[-3200, 5600, 1500], 'a crewed capsule'], [[6100, -1800, 2400], 'a space telescope']]);
        const V = r.pick([[0.6, 0.8, 0.2], [1.0, -0.3, 0.5], [0.4, 0.4, -0.6]]);
        const rr = Math.hypot(...pos) * 1000;
        const grad = pos.map((x) => (GM * x * 1000) / rr ** 3);            // ∂_i Φ, J/kg per m
        const val = grad.reduce((s, g, i) => s + g * V[i] * 1000, 0);       // J/kg
        return {
          prompt: t`Earth’s gravitational potential is $\Phi = -GM/r$, with $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and $r = \sqrt{x^2 + y^2 + z^2}$. Its differential has components $\partial_i\Phi = GM\,x^i/r^3$. ${name[0].toUpperCase() + name.slice(1)} at $(${pos.join(',\\ ')})$ km is moved by $V = (${V.join(',\\ ')})$ km. To first order, how much does its potential energy per kilogram change, $d\Phi(V)$, in J/kg?`,
          visual: dfPic('-1/sqrt(x^2 + y^2)', [1.2, 1.5], [1.2 / 1.921 ** 3, 1.5 / 1.921 ** 3], { V: [0.25, 0.33], step: 0.02, x: [0.2, 2.6], y: [0.6, 2.4], levels: { from: -2, to: 0, step: 0.02 }, span: 0.7, k: 3, caption: 'Schematic, in a plane through Earth’s centre: equipotential circles of −1/r and the stack of dΦ at the spacecraft. The potential and the step are not to scale.' }),
          answer: val, units: 'J/kg', tol: { rel: 0.005 },
          errors: [{ value: val / 1000, feedback: 'Units: put the step in metres (or the gradient per km) — the components of dΦ are per metre.' }, { value: -val, feedback: 'Sign: Φ = −GM/r rises (toward 0) as r grows, so moving outward raises it.' }],
          hints: [t`$r = ${nice(rr / 1000, 5)}$ km; $d\Phi(V) = \partial_i\Phi\,V^i = \dfrac{GM}{r^3}\,x^iV^i$.`, t`$x^iV^i = ${nice(pos.reduce((s, x, i) => s + x * V[i], 0), 5)}$ km² $= ${tex(pos.reduce((s, x, i) => s + x * V[i], 0) * 1e6, 4)}$ m², and $GM/r^3 = ${tex(GM / rr ** 3, 4)}\ \text{s}^{-2}$.`],
          teach: 'The work per kilogram to move through a potential is its differential paired with the displacement — no metric needed.',
          explain: t`$d\Phi(V) = \dfrac{GM}{r^3}\,x^iV^i = ${tex(GM / rr ** 3, 4)}\ \text{s}^{-2}\times${tex(pos.reduce((s, x, i) => s + x * V[i], 0) * 1e6, 4)}\ \text{m}^2 = ${nice(val, 4)}$ J/kg. Only the part of the step that crosses the equipotentials counts; a step along them costs nothing to first order.`,
        };
      },
    }),
    mcq({
      id: 'cp-read', difficulty: 2,
      prompt: t`Which expression gives the $dy$ component of $df$?`,
      visual: dfPic('x*y + 0.3*y^2', [1, 0.8], [0.8, 1.48], { V: [0, 0.9], step: 0.4, x: [-0.6, 2.6], y: [-0.4, 2], levels: { from: -5, to: 5, step: 0.4 }, span: 1, k: 3, caption: t`The stack of $df$ at P and the basis vector $\partial_y$ there.` }),
      choices: [t`$df(\partial_y)$`, t`$dy(\partial_f)$`, t`$df(dy)$`, t`$\partial_y(dy)$`],
      answer: 0,
      why: {
        1: t`There is no vector $\partial_f$: $f$ is a function, not a coordinate.`,
        2: t`A covector eats vectors, not other covectors: $df(dy)$ means nothing (without a metric).`,
        3: t`$\partial_y$ acts on functions, and $dy$ is a covector, not a function.`,
      },
      hints: ['A covector’s components are its values on the basis vectors.'],
      teach: t`Components of a covector come from feeding it the basis vectors: $\omega_\mu = \omega(\partial_\mu)$.`,
      explain: t`$df(\partial_y) = \partial_y(f) = \partial f/\partial y$: the number of $df$’s lines that $\partial_y$ crosses.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (the gradient df as a dual vector; dx^μ(∂_ν) = δ^μ_ν)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.3 (the gradient one-form)', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
