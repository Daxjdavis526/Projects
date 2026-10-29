// Constant coefficients at any order: try e^{rt}, get the characteristic
// polynomial, and read one basis solution from each root — real, repeated
// (with powers of t, and why they appear) or complex (in real form). The
// phase-plane picture of second order (a real root is a straight-line
// solution), and higher-order equations: an attitude loop with actuator lag,
// a vibrating beam.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6, um, co, sg, lead } from './_second.js';

const t = String.raw;
const G = 9.8;

/** Roots in the complex plane, as a still graph (no answer drawn). */
function rootPlane(pts, { x = [-4, 4], y = [-4, 4], caption }) {
  return {
    type: 'graph',
    params: {
      x, y, equal: true, aspect: 'wide', xlabel: 'Re r', ylabel: 'Im r',
      points: pts.map(([re, im, label]) => ({ x: re, y: im, color: 'accent', r: 5, label, labelDx: 8, labelDy: im < 0 ? 14 : -10 })),
    },
    caption,
  };
}

/** Cantilever first bending mode (βL = 1.8751), normalised so the tip moves 1. */
const BL = 1.875104068711961;
const SIGMA = (Math.cosh(BL) + Math.cos(BL)) / (Math.sinh(BL) + Math.sin(BL));
const MODE = `(cosh(${r6(BL)}*x) - cos(${r6(BL)}*x) - ${r6(SIGMA)}*(sinh(${r6(BL)}*x) - sin(${r6(BL)}*x)))/2`;

export default lesson({
  id: 'math2280.DE-3.2',
  title: 'Constant coefficients: real, repeated and complex roots',
  minutes: 13, difficulty: 3,
  intro: t`When every coefficient is a constant, try $y = e^{rt}$: each derivative just multiplies it by $r$, so the differential equation turns into a polynomial equation,

$$a_ny^{(n)} + \cdots + a_1y' + a_0y = 0 \quad\longrightarrow\quad a_nr^n + \cdots + a_1r + a_0 = 0.$$

An equation of order $n$ has $n$ roots, counted with multiplicity, and each one supplies a solution: a real root $r$ gives $e^{rt}$; a root repeated $m$ times gives $e^{rt}, te^{rt}, \dots, t^{m-1}e^{rt}$; a complex pair $\alpha \pm i\beta$ gives $e^{\alpha t}\cos\beta t$ and $e^{\alpha t}\sin\beta t$. Together they form a fundamental set — the solution space has dimension $n$ — so the general solution is their combination with $n$ constants, which $n$ initial conditions fix.`,
  symbols: [
    { tex: 'a_0, \\dots, a_n', text: 'the constant coefficients, real numbers, with $a_n \\neq 0$' },
    { tex: 'y^{(n)}', text: 'the $n$th derivative of $y(t)$; $n$ is the order' },
    { tex: 'r', text: 'a root of the characteristic polynomial, in units of 1/time; it may be complex' },
    { tex: '\\alpha \\pm i\\beta', text: 'a complex pair of roots: the real part $\\alpha$ sets growth or decay, the imaginary part $\\beta$ is an angular frequency (rad/s)' },
    { tex: 'm', text: 'the multiplicity of a root — how many times it is repeated — which is how many powers of $t$ it brings' },
  ],
  why: t`Every linear system near equilibrium — a structure, a circuit, a control loop — reduces to this, and its stability is read off the roots: all in the left half of the complex plane and every disturbance dies.`,
  visual: {
    type: 'phase',
    title: 'The roots as straight lines in the phase plane',
    lead: t`The phase plane of $y'' + b\,y' + c\,y = 0$: across, the position $y$; up, the velocity $y'$. Each point is a state, and trajectories show how states evolve. A solution $y = e^{rt}$ has $y' = r\,y$ at every moment, so **a real root is a straight-line trajectory of slope $r$** through the origin. Find the roots of $r^2 + br + c = 0$ and look for them. Click to add trajectories.`,
    tasks: [
      t`At $b = 3$, $c = 2$ the roots are $-1$ and $-2$: two straight lines, $y' = -y$ and $y' = -2y$, carry $e^{-t}$ and $e^{-2t}$ into the origin. Every other trajectory bends in along the slower one, slope $-1$.`,
      t`Set $b = 2$, $c = 1$: the roots merge at $-1$ and only one straight line is left. The second solution, $te^{-t}$, is not a line in this picture.`,
      t`Set $b = 1$, $c = 4$: complex roots $-0.5 \pm 1.94i$, no straight lines at all, and every trajectory spirals in. At $b = 0$ the spirals close into loops; with $c < 0$ the roots have opposite signs and the origin becomes a saddle.`,
    ],
    params: {
      fx: 'y', fy: '-c*x - b*y', x: [-3, 3], y: [-3, 3], xlabel: 'y', ylabel: 'y′',
      sliders: [
        { key: 'b', label: 'Damping coefficient $b$', min: -1, max: 5, step: 0.1, value: 3, explain: 'The coefficient of $y\'$. Positive $b$ drains energy; negative $b$ feeds it in.' },
        { key: 'c', label: 'Stiffness coefficient $c$', min: -2, max: 6, step: 0.1, value: 2, explain: 'The coefficient of $y$: a restoring force when positive, a repelling one when negative.' },
      ],
      seeds: [[1.5, -1.5], [-1.5, 1.5], [1.2, -2.4], [-1.2, 2.4], [2.4, 0], [-2.4, 0], [0, 2.6]],
    },
    caption: t`Grey arrows: the direction a state moves (direction only). Coloured: trajectories traced forward and backward in time with RK4. Both axes in the same units, so a line’s slope on the screen is the root $r$.`,
  },
  example: {
    prompt: t`A spacecraft’s pointing loop whose thruster valves respond with a short lag is third order: $I\tau\,\theta''' + I\theta'' + K_d\theta' + K_p\theta = 0$, for the pointing error $\theta$. With $I = 3$ kg·m², lag $\tau = \tfrac13$ s, $K_d = 7$ N·m·s/rad and $K_p = 5$ N·m/rad this is

$$\theta''' + 3\theta'' + 7\theta' + 5\theta = 0.$$

At $t = 0$ the spacecraft is aligned and at rest, but the thrusters are delivering a torque that gives $\theta''(0) = 4$ mrad/s². Find $\theta(t)$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 6], y: [-0.3, 2.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'θ (mrad)',
        curves: [
          { fn: '2*exp(-x)', color: 'ink3', width: 1.3, dash: true, label: 'envelope 2e⁻ᵗ', labelAt: 0.75, labelDx: 8, labelDy: -6 },
          { fn: 'exp(-x)*(1 - cos(2x))', color: 'accent', width: 2.6, label: 'θ(t)', labelAt: 1.9, labelDx: 6, labelDy: -10 },
        ],
      },
      caption: t`The pointing error: it rises, falls back to zero at $t = \pi$ s, and rises again, smaller, inside a decaying envelope. A teaching model: a real loop has more lags, noise and limits on the torque.`,
    },
    steps: [
      { label: 'Characteristic equation', text: t`$\theta = e^{rt}$ gives $r^3 + 3r^2 + 7r + 5 = 0$ — a cubic, so three roots and three basis solutions.` },
      { label: 'Find one root', text: t`Any integer root divides 5. Try $r = -1$: $-1 + 3 - 7 + 5 = 0$ ✓. Dividing out $(r + 1)$ leaves $r^2 + 2r + 5$.` },
      { label: 'The other two', text: t`$r = \dfrac{-2 \pm \sqrt{4 - 20}}{2} = -1 \pm 2i$: a complex pair with real part $-1$ and frequency 2 rad/s.` },
      { label: 'General solution', text: t`$\theta = c_1e^{-t} + e^{-t}(c_2\cos 2t + c_3\sin 2t)$ — three independent solutions spanning the three-dimensional solution space.` },
      { label: 'Fit the start', text: t`$\theta(0) = c_1 + c_2 = 0$. $\theta'(0) = -c_1 - c_2 + 2c_3 = 0$, so $c_3 = 0$. $\theta''(0) = c_1 - 3c_2 - 4c_3 = 4$ (using $(e^{-t}\cos 2t)''|_0 = -3$ and $(e^{-t}\sin 2t)''|_0 = -4$), so $4c_1 = 4$: $c_1 = 1$, $c_2 = -1$.` },
      { label: 'Sense check', text: t`$\theta = e^{-t}(1 - \cos 2t)$ mrad: it starts at 0 with zero slope and curvature $4$ ✓, never goes negative, and every root has real part $-1$, so it dies like $e^{-t}$ — down to 2% of its envelope in about 4 s. A third root means a third condition: position, rate and the actuator’s state.` },
    ],
    answer: t`$\theta(t) = e^{-t}(1 - \cos 2t)$ mrad.`,
  },
  practice: [
    mcq({
      id: 'complex-form', difficulty: 2,
      gen(r) {
        const al = r.pick([-3, -2, -1, 1]), be = r.pick([2, 3, 4, 5]);
        const b = -2 * al, c = al * al + be * be, A = co(al), aa = Math.abs(al) === 1 ? '' : Math.abs(al);
        return {
          prompt: t`Which is the general solution of $y''${sg(b, "y'")} + ${c}y = 0$, written with real functions?`,
          choices: [
            t`$y = e^{${A}t}(c_1\cos ${be}t + c_2\sin ${be}t)$`,
            t`$y = e^{${be}t}(c_1\cos ${aa}t + c_2\sin ${aa}t)$`,
            t`$y = c_1e^{${A}t}\cos ${be}t$`,
            t`$y = c_1e^{${A}t} + c_2e^{${be}t}$`,
          ],
          answer: 0,
          why: {
            1: t`The real part of the roots goes in the exponential and the imaginary part in the sines and cosines — here they are swapped.`,
            2: t`A second-order equation needs two independent solutions: the sine is missing, so this cannot meet both $y(0)$ and $y'(0)$.`,
            3: t`The real and imaginary parts of one complex root are not two real roots: $e^{${be}t}$ does not solve the equation.`,
          },
          hints: [t`Solve $r^2${sg(b, 'r')} + ${c} = 0$ with the quadratic formula.`, t`$r = ${al} \pm ${be}i$, and $e^{(${al} + ${be}i)t} = e^{${A}t}(\cos ${be}t + i\sin ${be}t)$.`],
          teach: t`A complex pair $\alpha \pm i\beta$ gives the two real solutions $e^{\alpha t}\cos\beta t$ and $e^{\alpha t}\sin\beta t$ — the real and imaginary parts of $e^{(\alpha + i\beta)t}$.`,
          explain: t`$r = \dfrac{${-b} \pm \sqrt{${b * b} - ${4 * c}}}{2} = ${al} \pm ${be}i$. The real and imaginary parts of $e^{(${al} + ${be}i)t}$ are separately real solutions, because the coefficients are real: $y = e^{${A}t}(c_1\cos ${be}t + c_2\sin ${be}t)$, ${al < 0 ? 'a decaying' : 'a growing'} oscillation at ${be} rad/s.`,
          visual: rootPlane([[al, be, `${um(al)} + ${be}i`], [al, -be, `${um(al)} − ${be}i`]], { x: [-5, 3], y: [-6, 6], caption: 'The two characteristic roots in the complex plane: a conjugate pair, mirror images in the real axis.' }),
        };
      },
    }),
    num({
      id: 'balance', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), th0 = r.pick([0.02, 0.05, 0.1]);
        const lam = Math.sqrt(G / L), v = -lam * th0;
        const curves = [0.6, 0.85, 1.15, 1.4].map((f, k) => ({
          fn: `${th0}*cosh(${r6(lam)}*x) - ${r6(f * th0)}*sinh(${r6(lam)}*x)`, color: ['warn', 'gold', 'teal', 'violet'][k], width: 2,
          label: k === 0 ? 'too gentle' : k === 3 ? 'too hard' : undefined, labelAt: r6(1.9 / lam), labelDx: 8, labelDy: k === 0 ? 14 : -8,
        }));
        return {
          prompt: t`A small mass on a light ${L} m rod, pivoted at the bottom, is balanced upside down. For small tilts $\theta$ it obeys $\theta'' = \dfrac{g}{L}\,\theta$ — an inverted pendulum, the textbook model of a rocket balancing on its thrust. It starts tilted $\theta(0) = ${th0}$ rad. What starting angular velocity $\theta'(0)$ makes it coast back to upright instead of falling? ($g = 9.8$ m/s².)`,
          answer: v, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: -(G / L) * th0, feedback: t`The roots are $\pm\sqrt{g/L}$, not $\pm g/L$: take the square root.` }].filter((e) => Math.abs(e.value - v) > 0.01 * Math.abs(v)),
          hints: [t`The characteristic roots of $\theta'' - \tfrac{g}{L}\theta = 0$ are $\pm\lambda$ with $\lambda = \sqrt{g/L}$. The $e^{\lambda t}$ part grows; its coefficient must be zero.`, t`With only $e^{-\lambda t}$ left, $\theta = \theta_0e^{-\lambda t}$, so $\theta'(0) = -\lambda\theta_0$.`],
          teach: 'With roots of opposite sign, only initial data that cancel the growing exponential give a bounded solution — a single straight line in the phase plane.',
          explain: t`$\lambda = \sqrt{9.8/${L}} = ${fmt(lam, 3)}$ s⁻¹, so $\theta'(0) = -\lambda\theta_0 = ${fmt(v, 3)}$ rad/s, toward upright. Any other value leaves some $e^{\lambda t}$, which grows until the pendulum falls one way or the other. The balance is knife-edge: a real rocket needs active control to stay on that line.`,
          visual: {
            type: 'graph',
            params: { x: [0, r6(2.6 / lam)], y: [r6(-2 * th0), r6(2.2 * th0)], aspect: 'wide', xlabel: 't (s)', ylabel: 'θ (rad)', curves },
            caption: 'Tilts from the same start with four different starting speeds toward upright: too gentle and it falls forward, too hard and it overshoots and falls the other way. The one exact speed between them is not drawn.',
          },
        };
      },
    }),
    num({
      id: 'critical-kick', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 4, 5]), v0 = r.pick([1, 3, 6]);
        const peak = v0 / (k * Math.E);
        return {
          prompt: t`The needle of a critically damped meter obeys $x'' + ${2 * k}x' + ${k * k}x = 0$ ($x$ in mm, $t$ in s). It sits at $x = 0$ and is flicked with speed $x'(0) = ${v0}$ mm/s. How far does it swing before it returns?`,
          answer: peak, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: v0 / k, feedback: t`At $t = 1/${k}$ the factor $e^{-${k}t}$ is $e^{-1}$, not 1: the peak is $\dfrac{${v0}}{${k}e}$.` }, { value: v0 / (2 * k), feedback: t`Find the peak from $x'(t) = 0$: for $x = ${v0}te^{-${k}t}$ it is at $t = 1/${k}$.` }],
          hints: [t`$r^2 + ${2 * k}r + ${k * k} = (r + ${k})^2$: a repeated root, so $x = (c_1 + c_2t)e^{-${k}t}$. The data give $c_1 = 0$, $c_2 = ${v0}$.`, t`$x = ${v0}te^{-${k}t}$ peaks where $x' = ${v0}(1 - ${k}t)e^{-${k}t} = 0$.`],
          teach: t`A repeated root $r$ gives $(c_1 + c_2t)e^{rt}$; kicked from rest at zero, a critically damped system rises along $v_0te^{rt}$ and peaks at $t = -1/r$.`,
          explain: t`$x = ${v0}te^{-${k}t}$ peaks at $t = 1/${k}$ s, where $x = \dfrac{${v0}}{${k}}e^{-1} = ${fmt(peak, 3)}$ mm. It never crosses zero: a critically damped system kicked from rest overshoots nothing.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(5 / k)], y: [r6(-0.08 * v0 / k), r6(0.5 * v0 / k)], yticks: 0, aspect: 'wide', xlabel: 't (s)', ylabel: 'x (no scale)',
              curves: [{ fn: `${v0}*x*exp(-${k}*x)`, color: 'accent' }],
              arrows: [{ from: [0, 0], to: [r6(0.16 / k), r6(0.16 * v0 / k)], color: 'gold', width: 2.6, label: `${v0} mm/s`, labelDx: -62, labelDy: -6 }],
            },
            caption: 'The needle’s swing after the flick (deflection axis unnumbered): out, and back without crossing zero.',
          },
        };
      },
    }),
    multi({
      id: 'fundamental-higher', difficulty: 3,
      prompt: t`The characteristic polynomial of a fifth-order equation factors as $(r - 2)^3(r^2 + 9)$. Which of these belong to a fundamental set of solutions? Select all that do.`,
      choices: [t`$e^{2t}$`, t`$t^2e^{2t}$`, t`$\sin 3t$`, t`$t^3e^{2t}$`, t`$e^{3t}$`, t`$t\cos 3t$`],
      answer: [0, 1, 2],
      why: {
        3: t`A root of multiplicity 3 brings $e^{2t}$, $te^{2t}$ and $t^2e^{2t}$ — powers up to $m - 1 = 2$, not 3.`,
        4: t`$r^2 + 9 = 0$ has roots $\pm3i$, not $\pm3$: they give $\cos 3t$ and $\sin 3t$.`,
        5: t`The pair $\pm3i$ is not repeated, so no factor $t$ goes with it. $t\cos 3t$ would need $(r^2 + 9)^2$.`,
      },
      hints: [t`Five roots in all: $2$ three times, and $\pm3i$ once each.`, t`A root repeated $m$ times gives $e^{rt}$ times $1, t, \dots, t^{m-1}$.`],
      teach: t`Each root contributes as many solutions as its multiplicity — $e^{rt}$, $te^{rt}$, … — and the total is always the order of the equation.`,
      explain: t`The fundamental set is $e^{2t},\ te^{2t},\ t^2e^{2t},\ \cos 3t,\ \sin 3t$ — five functions for a fifth-order equation. Of the choices, $e^{2t}$, $t^2e^{2t}$ and $\sin 3t$ belong to it.`,
      visual: rootPlane([[2, 0, 'r = 2 (three times)'], [0, 3, '3i'], [0, -3, '−3i']], { x: [-3, 5], y: [-4.2, 4.2], caption: 'The five roots: 2, counted three times, and the pair ±3i on the imaginary axis.' }),
    }),
    expr({
      id: 'third-order', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2]), c1 = r.pick([1, 2, -1]), c2 = r.pick([1, 2]), c3 = r.pick([1, -1, 3]);
        const y0 = c1 + c2 + c3, v0 = k * (c2 - c3), a0 = k * k * (c2 + c3);
        const kt = k === 1 ? '' : k;
        return {
          prompt: t`Solve $y''' - ${k * k === 1 ? '' : k * k}y' = 0$ with $y(0) = ${y0}$, $y'(0) = ${v0}$ and $y''(0) = ${a0}$.`,
          answer: `${c1} + ${c2}*e^(${k}*t) + (${c3})*e^(-${k}*t)`,
          answerTeX: t`${c1}${sg(c2, `e^{${kt}t}`)}${sg(c3, `e^{-${kt}t}`)}`, lhs: 'y(t)',
          vars: { t: [-1, 1] },
          errors: [{ answer: `${c2}*e^(${k}*t) + (${c3})*e^(-${k}*t)`, feedback: t`The root $r = 0$ gives the constant solution $1$: $y = c_1 + c_2e^{${kt}t} + c_3e^{-${kt}t}$, and $y(0)$ fixes the constant.` }],
          hints: [t`$r^3 - ${k * k === 1 ? '' : k * k}r = r(r - ${k})(r + ${k})$: roots $0$ and $\pm${k}$.`, t`$y = c_1 + c_2e^{${kt}t} + c_3e^{-${kt}t}$: $y''(0) = ${k * k}(c_2 + c_3)$ and $y'(0) = ${k}(c_2 - c_3)$ give $c_2$ and $c_3$; then $y(0)$ gives $c_1$.`],
          teach: t`A root $r = 0$ contributes the constant solution $e^{0t} = 1$ — easy to forget.`,
          explain: t`From $c_2 + c_3 = ${c2 + c3}$ and $c_2 - c_3 = ${c2 - c3}$: $c_2 = ${c2}$, $c_3 = ${c3}$; then $c_1 = ${y0} - ${c2 + c3} = ${c1}$. So $y = ${c1}${sg(c2, `e^{${kt}t}`)}${sg(c3, `e^{-${kt}t}`)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.2, 1.2], y: [-1, 5], aspect: 'wide', xlabel: 't', ylabel: 'y',
              curves: [
                { fn: '1', color: 'ink3', width: 1.3, dash: true, label: '1', labelAt: -1.1, labelDx: 2, labelDy: -8 },
                { fn: `exp(${k}*x)`, color: 'ink3', width: 1.3, dash: true, label: k === 1 ? 'eᵗ' : 'e²ᵗ', labelAt: 0.75, labelDx: 8, labelDy: 0 },
                { fn: `exp(-${k}*x)`, color: 'ink3', width: 1.3, dash: true, label: k === 1 ? 'e⁻ᵗ' : 'e⁻²ᵗ', labelAt: -0.75, labelDx: -36, labelDy: 0 },
              ],
            },
            caption: `The three basis solutions, one for each root 0 and ±${k}. The answer is one combination of them, fixed by three numbers at t = 0.`,
          },
        };
      },
    }),
    num({
      id: 'why-t', difficulty: 3,
      gen(r) {
        const rr = r.pick([-1, -2, -0.5]), t1 = r.pick([1.5, 2]);
        const lim = t1 * Math.exp(rr * t1);
        const eps = [0.4, 0.2, 0.1], cols = ['warn', 'gold', 'teal'], xmax = 5 / Math.abs(rr);
        let ymax = 0;
        for (let k = 1; k <= 200; k++) { const x = (xmax * k) / 200; ymax = Math.max(ymax, (Math.exp((rr + 0.4) * x) - Math.exp(rr * x)) / 0.4); }
        ymax *= 1.25;
        return {
          prompt: t`When two roots $r$ and $r + \varepsilon$ are distinct, $u_\varepsilon = \dfrac{e^{(r + \varepsilon)t} - e^{rt}}{\varepsilon}$ is a solution — a difference of solutions, scaled. As $\varepsilon \to 0$ the roots merge into a repeated root and $u_\varepsilon$ tends to a limit. For $r = ${rr}$, what is that limit at $t = ${t1}$?`,
          answer: lim, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(rr * t1), feedback: t`That is $e^{rt}$ itself. The quotient is a difference quotient in $r$: its limit is $\dfrac{\partial}{\partial r}e^{rt} = t\,e^{rt}$.` }],
          hints: [t`$u_\varepsilon$ is a difference quotient — but in the variable $r$, with $t$ held fixed.`, t`$\lim_{\varepsilon\to0} u_\varepsilon = \dfrac{\partial}{\partial r}e^{rt} = t\,e^{rt}$.`],
          teach: t`The second solution $te^{rt}$ of a repeated root is the limit of solutions from two nearby roots: the derivative of $e^{rt}$ with respect to $r$.`,
          explain: t`The limit is $\dfrac{\partial}{\partial r}e^{rt} = t\,e^{rt}$, which at $t = ${t1}$ is $${t1}e^{${nice(rr * t1)}} = ${fmt(lim, 4)}$. As the two roots merge, the two exponentials become indistinguishable, but their scaled difference survives as $te^{rt}$ — that is where the factor $t$ comes from.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(xmax)], y: [r6(-0.06 * ymax), r6(ymax)], yticks: 0, aspect: 'wide', xlabel: 't', ylabel: '',
              curves: eps.map((e, k) => ({ fn: `(exp(${r6(rr + e)}*x) - exp(${rr}*x))/${e}`, color: cols[k], width: 2 })),
              points: eps.map((e, k) => ({ x: r6(0.72 * xmax), y: r6((0.9 - 0.1 * k) * ymax), r: 4, color: cols[k], label: `ε = ${e}`, labelDx: 8, labelDy: 4 })),
            },
            caption: t`$u_\varepsilon$ for $\varepsilon = 0.4$, $0.2$ and $0.1$ with $r = ${rr}$: as the roots close in, the curves settle onto one limiting shape (not drawn).`,
          },
        };
      },
    }),
    mcq({
      id: 'phase-lines', difficulty: 2,
      prompt: t`In the phase plane (position $y$ across, velocity $y'$ up) of $y'' + 5y' + 6y = 0$, two pairs of trajectories run straight into the origin. Along which lines?`,
      choices: [t`$y' = -2y$ and $y' = -3y$`, t`$y' = 2y$ and $y' = 3y$`, t`$y' = -\tfrac12 y$ and $y' = -\tfrac13 y$`, t`$y' = -5y$ and $y' = -6y$`],
      answer: 0,
      why: {
        1: t`The roots of $r^2 + 5r + 6$ are negative, $-2$ and $-3$; positive slopes would be the lines of growing solutions.`,
        2: t`Those are the reciprocals. A solution $e^{rt}$ has $y' = ry$, so the slope is $r$ itself.`,
        3: t`The coefficients are not the roots: $r^2 + 5r + 6 = (r + 2)(r + 3)$.`,
      },
      hints: [t`For $y = e^{rt}$, how are $y'$ and $y$ related at every moment?`, t`$y' = r\,y$: a straight line of slope $r$. Now find the roots of $r^2 + 5r + 6$.`],
      teach: t`A real characteristic root $r$ is a straight-line trajectory $y' = ry$ in the phase plane, because $e^{rt}$ has $y' = ry$ at every instant.`,
      explain: t`$r^2 + 5r + 6 = (r + 2)(r + 3)$, so $e^{-2t}$ and $e^{-3t}$ are solutions, and along them $y' = -2y$ and $y' = -3y$. Starting exactly on either line, a state slides straight into the origin; anywhere else it curves in, ending tangent to the slower line $y' = -2y$.`,
      visual: { type: 'phase', params: { fx: 'y', fy: '-6*x - 5*y', x: [-3, 3], y: [-3, 3], xlabel: 'y', ylabel: 'y′', seeds: [[2.5, 2.5], [-2.5, -2.5], [2.5, -0.5], [-2.5, 0.5], [0.5, 2.8], [-0.5, -2.8]] }, caption: 'The phase portrait of y″ + 5y′ + 6y = 0. Grey arrows show direction only.' },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-complex-ivp', difficulty: 2,
      gen(r) {
        const al = r.pick([1, 2]), be = r.pick([2, 3]), y0 = r.pick([1, 2, -1]), B = r.pick([1, -1, 2]);
        const v0 = be * B - al * y0;
        const alt = al === 1 ? '' : al;
        return {
          prompt: t`Solve $y'' + ${2 * al}y' + ${al * al + be * be}y = 0$ with $y(0) = ${y0}$ and $y'(0) = ${v0}$.`,
          answer: `e^(-${al}*t)*((${y0})*cos(${be}*t) + (${B})*sin(${be}*t))`,
          answerTeX: t`e^{-${alt}t}\left(${lead(y0, `\\cos ${be}t`)}${sg(B, `\\sin ${be}t`)}\right)`, lhs: 'y(t)',
          vars: { t: [0, 3] },
          hints: [t`The roots are $-${al} \pm ${be}i$.`],
          teach: t`Complex roots $\alpha \pm i\beta$ give $y = e^{\alpha t}(c_1\cos\beta t + c_2\sin\beta t)$, with $c_1 = y(0)$ and $\beta c_2 + \alpha c_1 = y'(0)$.`,
          explain: t`$r = -${al} \pm ${be}i$, so $y = e^{-${alt}t}(c_1\cos ${be}t + c_2\sin ${be}t)$. $y(0) = c_1 = ${y0}$; $y'(0) = -${al}c_1 + ${be}c_2 = ${v0}$ gives $c_2 = ${B}$.`,
          visual: { type: 'c3-roots', params: { mode: 'free', zeta: r6(al / Math.sqrt(al * al + be * be)), w0: r6(Math.sqrt(al * al + be * be)), x0: y0, v0, T: 4, sliders: false, readout: false, panels: 'motion', yname: 'y' }, caption: 'The solution with these initial data, and its decaying envelope (dashed).' },
        };
      },
    }),
    mcq({
      id: 'cp-repeated-pair', difficulty: 3,
      prompt: t`What is the general solution of $y'''' + 8y'' + 16y = 0$?`,
      choices: [
        t`$(c_1 + c_2t)\cos 2t + (c_3 + c_4t)\sin 2t$`,
        t`$c_1\cos 2t + c_2\sin 2t + c_3\cos 4t + c_4\sin 4t$`,
        t`$c_1\cos 2t + c_2\sin 2t$`,
        t`$(c_1 + c_2t)e^{2t} + (c_3 + c_4t)e^{-2t}$`,
      ],
      answer: 0,
      why: {
        1: t`$r^4 + 8r^2 + 16 = (r^2 + 4)^2$: the roots are $\pm2i$, each twice — there is no $\pm4i$.`,
        2: 'A fourth-order equation needs four independent solutions; two cannot fit four initial conditions.',
        3: t`$(r^2 + 4)^2 = 0$ gives $r^2 = -4$, so $r = \pm2i$ — imaginary, not $\pm2$.`,
      },
      hints: [t`Treat $r^4 + 8r^2 + 16$ as a quadratic in $r^2$.`, t`It is $(r^2 + 4)^2$: the pair $\pm2i$ is repeated, so each of $\cos 2t$, $\sin 2t$ also comes multiplied by $t$.`],
      teach: 'A repeated complex pair brings t cos βt and t sin βt alongside cos βt and sin βt.',
      explain: t`$(r^2 + 4)^2 = 0$: roots $\pm2i$, each of multiplicity 2, so the fundamental set is $\cos 2t,\ \sin 2t,\ t\cos 2t,\ t\sin 2t$. The last two grow without any forcing at all — this is the equation an undamped oscillator driven exactly at resonance satisfies, which is why resonance brings a factor $t$ (DE-3.3).`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 12], y: [-13, 13], aspect: 'wide', xlabel: 't', ylabel: 'y',
          curves: [{ fn: 'x*sin(2x)', color: 'accent', width: 2 }, { fn: 'x', color: 'ink3', width: 1.2, dash: true }, { fn: '-x', color: 'ink3', width: 1.2, dash: true }],
        },
        caption: 'One of the four basis solutions: an oscillation whose amplitude grows linearly, inside the dashed lines ±t — with no forcing at all.',
      },
    }),
    mcq({
      id: 'cp-beam', difficulty: 3, transfer: true,
      prompt: t`A satellite’s deployable boom vibrates in one of its modes at angular frequency $\omega$. Its sideways deflection $w(x)$ along the boom obeys the Euler–Bernoulli beam equation $EI\,w'''' = \mu\omega^2 w$ — with $E$ the material’s stiffness, $I$ the section’s second moment of area and $\mu$ the mass per metre — that is, $w'''' = \beta^4w$ with $\beta^4 = \mu\omega^2/EI$. Which functions span its solutions?`,
      choices: [
        t`$\cosh\beta x,\ \sinh\beta x,\ \cos\beta x,\ \sin\beta x$`,
        t`$e^{\beta x},\ e^{-\beta x}$`,
        t`$\cos\beta x,\ \sin\beta x,\ x\cos\beta x,\ x\sin\beta x$`,
        t`$\cos\beta x,\ \sin\beta x$ only, since a vibrating boom must oscillate`,
      ],
      answer: 0,
      why: {
        1: t`That is only half: $r^4 = \beta^4$ has four roots, $\pm\beta$ and $\pm i\beta$, and a fourth-order equation needs four solutions.`,
        2: t`No root is repeated: $r^4 - \beta^4 = (r - \beta)(r + \beta)(r^2 + \beta^2)$ has four distinct roots.`,
        3: t`The *time* dependence oscillates; the shape along the boom also needs $\cosh$ and $\sinh$ to meet the end conditions — the roots $\pm\beta$ are real.`,
      },
      hints: [t`Factor $r^4 - \beta^4$ as a difference of squares.`, t`$r = \pm\beta$ give $e^{\pm\beta x}$ — equivalently $\cosh\beta x$ and $\sinh\beta x$ — and $r = \pm i\beta$ give $\cos\beta x$ and $\sin\beta x$.`],
      teach: 'w⁗ = β⁴w has roots ±β and ±iβ, so beam mode shapes are built from cosh, sinh, cos and sin.',
      explain: t`$r^4 - \beta^4 = (r^2 - \beta^2)(r^2 + \beta^2)$: roots $\pm\beta$, $\pm i\beta$. In real form the solutions are $\cosh\beta x$, $\sinh\beta x$, $\cos\beta x$, $\sin\beta x$ ($e^{\pm\beta x}$ would do instead of $\cosh$ and $\sinh$). The four end conditions — clamped root, free tip — then allow only special values of $\beta$; for a cantilever the first is $\beta L = 1.875$, which sets the boom’s lowest natural frequency.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.15, 1.15], y: [-0.25, 0.55], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { fn: '0', domain: [0, 1], color: 'ink3', width: 1.4, dash: true },
            { fn: `0.4*${MODE}`, domain: [0, 1], color: 'accent', width: 4 },
            { param: ['0', 't'], t: [-0.22, 0.22], color: 'ink2', width: 6 },
          ],
          points: [{ x: 1, y: 0.4, r: 0.01, color: 'accent', label: 'free tip', labelDx: 6, labelDy: 2 }, { x: 0, y: -0.2, r: 0.01, color: 'ink2', label: 'clamped root', labelDx: 8, labelDy: 6 }],
        },
        caption: 'The boom’s first bending mode: clamped at the spacecraft (left), free at the tip. Deflection greatly exaggerated; the dashed line is the boom at rest.',
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.2 Constant coefficient second-order linear ODEs and §2.3 Higher-order linear ODEs', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax Calculus Vol. 3, §7.1 Second-order linear equations', url: 'https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations' },
  ],
});
