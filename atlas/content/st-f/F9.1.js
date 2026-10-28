// Euler's method and its order — the numerical analyst's view (the algorithm
// itself is math2280 DE-2.7, the code prog P11.1): the local truncation error
// h²y″/2 from Taylor's theorem; the global error as the sum of local errors
// carried to the end by the equation itself (Lady Windermere's fan, exact for
// a linear equation), hence the bound hM/(2L)(e^{LT} − 1) and first order;
// measured orders; and the round-off floor that appears when the step gets
// small — measured here in float32, where it arrives at h ≈ 10⁻⁴ s.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { TABLEAU, runScalar, pathScalar, loglog, slopeGuide, n12, lg } from './_ode.js';
import { seg } from './_num.js';

const t = String.raw;
const E = TABLEAU.euler;

// ── the Explore: y′ = λ(y − sin t) + cos t, y(0) = 0, whose solution is sin t ──
const LAMS = [[1, -3, 'λ = −3: neighbours converge'], [2, 0, 'λ = 0: neutral'], [3, 1, 'λ = +1: neighbours diverge']];
const HS = [[1, 0.5, '0.5'], [2, 0.25, '0.25'], [3, 0.125, '0.125']];
const T4 = 4;
const FAN = LAMS.map(([, lam]) => HS.map(([, h]) => {
  const f = (tt, y) => lam * (y - Math.sin(tt)) + Math.cos(tt);
  const p = pathScalar(E, f, 0, 0, T4, Math.round(T4 / h));
  return { lam, h, p, err: p[p.length - 1][1] - Math.sin(T4) };
}));
const whenFan = (a, b) => `step(0.5 - abs(lm - ${a}))*step(0.5 - abs(hh - ${b}))`;

// ── the worked example: a drogue-stabilised capsule falling with quadratic drag ──
const G = 9.81, VT = 50, KD = G / VT ** 2, TD = 10;
const drag = (tt, v) => G - KD * v * v, vex = (tt) => VT * Math.tanh((G * tt) / VT);
const DN = [10, 20, 40, 80], DERR = DN.map((n) => runScalar(E, drag, 0, 0, TD, n) - vex(TD));
const DC = DERR[3] / (TD / 80);                               // error per unit h
const NEED = Math.ceil((DC * TD) / 1e-3);
// the same runs in float32, every operation rounded (as on a GPU)
const f32 = Math.fround;
function euler32(h) {
  const n = Math.round(TD / h), H = f32(h), Gf = f32(G), Kf = f32(KD);
  let v = 0;
  for (let i = 0; i < n; i++) v = f32(v + f32(H * f32(Gf - f32(Kf * f32(v * v)))));
  return v;
}
const PS = Array.from({ length: 17 }, (_, p) => p);           // h = 2⁻ᵖ s
const E64 = PS.map((p) => [2 ** -p, runScalar(E, drag, 0, 0, TD, Math.round(TD * 2 ** p)) - vex(TD)]);
const E32 = PS.map((p) => [2 ** -p, euler32(2 ** -p) - vex(TD)]);
const BEST32 = E32.reduce((b, q) => (Math.abs(q[1]) < Math.abs(b[1]) ? q : b));
const V1 = vex(1);

// ── problem data ──
const ODES = [
  { tex: t`y' = -2y + t,\ y(0) = 1`, f: (tt, y) => -2 * y + tt, ex: (tt) => tt / 2 - 0.25 + 1.25 * Math.exp(-2 * tt), fn: 'x/2 - 0.25 + 1.25*exp(-2x)', T: 2 },
  { tex: t`y' = y\cos t,\ y(0) = 1`, f: (tt, y) => y * Math.cos(tt), ex: (tt) => Math.exp(Math.sin(tt)), fn: 'exp(sin(x))', T: 3 },
  { tex: t`y' = y(1 - y),\ y(0) = 0.2`, f: (tt, y) => y * (1 - y), ex: (tt) => 1 / (1 + 4 * Math.exp(-tt)), fn: '1/(1 + 4exp(-x))', T: 4 },
  { tex: t`y' = -ty^2,\ y(0) = 2`, f: (tt, y) => -tt * y * y, ex: (tt) => 2 / (1 + tt * tt), fn: '2/(1 + x^2)', T: 2 },
];

export default lesson({
  id: 'st-f.F9.1',
  title: 'Euler’s method and its order',
  minutes: 14, difficulty: 2,
  intro: t`Euler’s method follows the tangent: from $(t_n, y_n)$ it steps to $y_{n+1} = y_n + h f(t_n, y_n)$. Taylor’s theorem, $y(t+h) = y(t) + hy'(t) + \tfrac12h^2y''(\xi)$, says one step from the exact curve misses by the **local error** $\tfrac12h^2y''$. Reaching a fixed time $T$ takes $T/h$ steps, and each step’s error is then carried forward by the equation itself — damped where neighbouring solutions converge, amplified where they spread. Adding them up gives the classical bound:

$$\lvert y(t_n) - y_n\rvert \le \frac{hM}{2L}\left(e^{L(t_n - t_0)} - 1\right)$$

$h^2$ per step times $1/h$ steps is **one power of $h$**: Euler is a first-order method. The bound is pessimistic, but its two factors are real: the $h$ says what refinement buys, the exponential says that an unstable equation punishes every method.`,
  symbols: [
    { tex: 'y_n', text: 'the numerical value at step $n$, an approximation to the exact $y(t_n)$' },
    { tex: 'h', text: 'the step size, so $t_n = t_0 + nh$' },
    { tex: 'f(t, y)', text: 'the right-hand side of the equation $y\' = f(t, y)$: the slope field' },
    { tex: 'M', text: 'a bound on $\\lvert y\'\'\\rvert$ along the exact solution: how fast the slope turns' },
    { tex: 'L', text: 'a **Lipschitz constant**: $\\lvert f(t, y) - f(t, z)\\rvert \\le L\\lvert y - z\\rvert$, so at most $\\lvert\\partial f/\\partial y\\rvert$. It sets how fast neighbouring solutions can separate' },
    { tex: 't_n - t_0', text: 'the time integrated so far' },
  ],
  why: 'Every ODE solver is judged the way Euler is here — local error from a Taylor series, global error from how the equation propagates it, and an order you can measure — and the measured order is the first test any orbit, trajectory or relativity code must pass.',
  visual: {
    type: 'graph',
    title: 'Where the global error comes from',
    lead: t`Euler’s method on $y' = \lambda(y - \sin t) + \cos t$ with $y(0) = 0$, whose exact solution is $\sin t$ (grey) whatever $\lambda$ is. Blue: Euler’s polygon. Gold: the **exact** solution through each Euler point — the curve the method is on after that step. Each gold curve starts one local error away from the last; the gap between successive curves at $t = 4$ is that error, carried forward.`,
    tasks: [
      `With λ = −3 the gold curves bunch together: old errors die out, and the final error is ${Math.abs(FAN[0][0].err).toFixed(3)} at h = 0.5.`,
      `Switch to λ = +1: the same kind of local errors fan apart, and at h = 0.5 the final error is ${FAN[2][0].err.toFixed(2)} — the $e^{LT}$ factor of the bound.`,
      'Halve h, then halve it again: in every case the final error roughly halves. First order.',
    ],
    params: {
      x: [-0.05, 4.15], y: [-1.6, 3.4], aspect: 'wide', axesAt: 'edge', xlabel: 't', ylabel: 'y',
      choices: [
        { key: 'lm', label: 'Equation', options: LAMS.map(([k, , l]) => [k, l]), value: 3, explain: 'λ is ∂f/∂y: negative pulls neighbouring solutions together, positive pushes them apart.' },
        { key: 'hh', label: 'Step $h$', options: HS.map(([k, , l]) => [k, l]), value: 1, explain: 'Each choice is half the last.' },
      ],
      curves: [
        { fn: 'sin(x)', color: 'ink3', width: 3, domain: [0, 4] },
        ...LAMS.flatMap(([a], i) => HS.flatMap(([b], j) => {
          const { lam, h, p } = FAN[i][j];
          const fan = p.slice(1, -1).map(([tn, yn]) => ({ fn: `sin(x) + (${n12(yn - Math.sin(tn))})*exp(${lam}*(x - ${n12(tn)}))`, color: 'gold', width: 1.1, domain: [tn, 4], when: whenFan(a, b) }));
          const poly = p.slice(1).map(([tn, yn], k) => seg(p[k][0], p[k][1], tn, yn, { color: 'accent', width: 2.2, samples: 10, when: whenFan(a, b) }));
          return [...fan, ...poly];
        })),
      ],
      points: LAMS.flatMap(([a], i) => HS.flatMap(([b], j) => FAN[i][j].p.map(([tn, yn]) => ({ x: n12(tn), y: n12(yn), r: 3, color: 'accent', when: whenFan(a, b) })))),
      readouts: [{ label: 'global error at $t = 4$', expr: LAMS.flatMap(([a], i) => HS.map(([b], j) => `${whenFan(a, b)}*(${n12(FAN[i][j].err)})`)).join(' + '), digits: 3 }],
    },
    caption: 'Exact Euler runs in float64; the gold curves are exact solutions of the same equation (for a linear equation the final error is exactly the sum of the local errors, each carried to t = 4 by $e^{\\lambda(4 - t)}$). Gold curves that leave the window are clipped.',
  },
  example: {
    prompt: t`A capsule under its drogue falls with $v' = g - kv^2$, $g = 9.81\ \text{m/s}^2$, terminal speed $v_t = ${VT}$ m/s (so $k = g/v_t^2$), from rest. The exact speed is $v_t\tanh(gt/v_t)$. Run Euler to $t = ${TD}$ s with $h = 1, \tfrac12, \tfrac14, \tfrac18$ s, measure the order, and find the step for an error of 1 mm/s. Then ask what happens in single precision.`,
    visual: {
      type: 'graph',
      params: { x: [-5.1, 0.25], y: [-5.6, 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (s)', ylabel: '|error| at 10 s (m/s)',
        points: [...loglog(E32, { color: 'gold', r: 5 }), ...loglog(E64, { color: 'accent', r: 3.5 })],
        curves: [slopeGuide(1, 0, lg(DERR[0]) + 0.35, -5, 0.1, { label: 'slope 1', labelAt: -1.2, labelDx: 4, labelDy: -10 })],
        legend: [{ label: 'float64', color: 'accent', point: true }, { label: 'float32', color: 'gold', point: true }], legendAt: 'br' },
      caption: 'Every dot is a complete Euler run to t = 10 s (h = 1 down to 2⁻¹⁶ s), its error against the exact tanh solution. Float32 rounds every operation to 24 bits, as a GPU shader would.',
    },
    steps: [
      { label: 'One step', text: t`With $h = 1$ s: $v_1 = 0 + 1\times9.81 = 9.81$ m/s. The exact $v(1) = 50\tanh(0.1962) = ${V1.toFixed(4)}$ m/s, so Euler overshoots by $${(9.81 - V1).toFixed(4)}$ m/s. That is the remainder $\tfrac12h^2v''(\xi)$ at some $\xi$ inside the step: $v'' = -2kvv'$ is zero at rest but negative once the capsule moves, so the speed curve bends below its starting tangent.` },
      { label: 'Whole runs', text: t`At $t = 10$ s the errors are $${DERR.map((e) => e.toFixed(4)).join(',\\ ')}$ m/s for $h = 1, \tfrac12, \tfrac14, \tfrac18$ s. Each halving divides the error by $${DERR.slice(1).map((e, i) => (DERR[i] / e).toFixed(3)).join(',\\ ')}$.` },
      { label: 'Measure the order', text: t`$p = \log_2(E_h/E_{h/2}) = ${DERR.slice(1).map((e, i) => Math.log2(DERR[i] / e).toFixed(3)).join(',\\ ')}$ — heading to 1 as $h$ shrinks: first order, as promised.` },
      { label: 'Predict', text: t`In the first-order regime $E \approx Ch$ with $C = ${DC.toFixed(3)}$ m/s per second of step, so 1 mm/s needs $h \approx ${tex(1e-3 / DC, 3)}$ s — about $${Math.round(NEED / 100) * 100}$ steps. **Each extra digit costs ten times the work**; that is what first order means.` },
      { label: 'Single precision', text: t`The float32 dots follow the line down to $h \approx 2^{-12}$ s, reach their smallest error $${tex(Math.abs(BEST32[1]), 2)}$ m/s near $h = ${tex(BEST32[0], 2)}$ s, and then **rise**: every step rounds $v + h\,v'$ to about 7 digits, and more steps means more roundings. In float64 each rounding is $2^{29} \approx 5\times10^{8}$ times smaller, and the floor sits far below and to the left of this plot.` },
    ],
    answer: t`Errors $${DERR.map((e) => e.toFixed(3)).join(',\\ ')}$ m/s, observed order $\to 1$; 1 mm/s needs $h \approx ${tex(1e-3 / DC, 2)}$ s. In float32 the error stops improving near $h \approx 10^{-4}$ s.`,
  },
  practice: [
    num({
      id: 'local-error', difficulty: 2,
      gen(r) {
        const k = r.pick([0.4, 0.5, 0.8, 1.2]), h = r.pick([0.05, 0.1]), y0 = r.pick([60, 80, 100, 120]);
        const ans = (y0 * (k * h) ** 2) / 2, exact = y0 * (Math.exp(-k * h) - 1 + k * h);
        return {
          prompt: t`A heated probe cools towards its surroundings: its temperature excess obeys $y' = -ky$ with $k = ${k}\ \text{s}^{-1}$ and $y(0) = ${y0}$ K. Use the Taylor term $\tfrac12h^2y''(0)$ to estimate the local error of one Euler step with $h = ${h}$ s.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.6 * h], y: [0, 1.15 * y0 * (Math.exp(-1.6 * k * h) - 1 + 1.6 * k * h)], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'gap (K)', yticks: 0,
              curves: [{ fn: `${y0}*(exp(-${k}x) - 1 + ${k}x)`, color: 'ink3', width: 2.6, domain: [0, 1.6 * h], label: 'exact curve − tangent', labelAt: 0.55 * h, labelDy: -14, labelDx: -40 },
                { fn: `${n12(y0 * k * k / 2)}*x^2`, color: 'accent', width: 2, dash: true, domain: [0, 1.6 * h], label: 'parabola ∝ t²', labelAt: 1.3 * h, labelDx: -96, labelDy: -12 }],
              vlines: [{ x: h, color: 'gold', label: 't = h' }] },
            caption: 'How far the exact solution has bent away from Euler’s tangent line, against time since the step began (no numbers on the vertical axis: reading off the gap at t = h is the question). The gap starts flat and grows like a parabola.',
          },
          answer: ans, units: 'K', tol: { rel: 0.02 },
          errors: [{ value: y0 * k * h, feedback: 'That is the change Euler makes in one step, hy′(0), not the error in it.' }, { value: y0 * k * k * h * h, feedback: 'Taylor’s remainder carries a factor ½: the error is ½h²y″.' }],
          hints: [t`Differentiate the equation: $y'' = -ky' = k^2y$.`, t`So $\tfrac12h^2y''(0) = \tfrac12h^2k^2y_0$.`],
          teach: 'One Euler step misses the exact curve by about ½h²y″: the first Taylor term it leaves out.',
          explain: t`$\tfrac12(${h})^2(${k})^2(${y0}) = ${tex(ans, 3)}$ K. The exact local error is $y_0(e^{-kh} - 1 + kh) = ${tex(exact, 3)}$ K: the Taylor term is the leading part, and the next term, $-\tfrac16h^3k^3y_0$, accounts for the rest. Euler undershoots, because the exact curve bends up (convex) away from its tangent.`,
        };
      },
    }),
    mcq({
      id: 'local-global', difficulty: 2,
      prompt: t`Each Euler step commits a local error of order $h^2$, yet the global error at a fixed time $T$ is only of order $h$. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-2.6, -0.2], y: [-5.8, -0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: 'error',
          curves: [{ fn: '2*x - 0.6', color: 'violet', width: 2, domain: [-2.6, -0.2], label: 'one step: ∝ h²', labelAt: -2.2, labelDx: 6, labelDy: 14 }, { fn: 'x - 0.3', color: 'accent', width: 2, domain: [-2.6, -0.2], label: 'at time T: ∝ h', labelAt: -1.3, labelDy: -14 }] },
        caption: 'Schematic slopes on log–log axes: the error of one step against the error at a fixed time.',
      },
      choices: [
        t`Reaching $T$ takes $T/h$ steps, and adding up $T/h$ errors of size $h^2$ (each carried forward by the equation) leaves $h$`,
        'Round-off error adds a term of order h that dominates the truncation error',
        'The local errors cancel in pairs, losing one power of h',
        t`The global error is the square root of the sum of squared local errors`,
      ],
      answer: 0,
      why: {
        1: 'Round-off grows as h shrinks (like 1/h), and in float64 it is negligible at ordinary steps; the h is truncation error.',
        2: 'For a smooth solution the local errors mostly have the same sign (they come from the same y″), so they add rather than cancel.',
        3: 'That would be the rule for independent random errors; truncation errors are systematic and add linearly.',
      },
      hints: ['How many steps does it take to reach T?', 'Multiply the number of steps by the size of each step’s error.'],
      teach: 'A method whose local error is O(hᵖ⁺¹) has global error O(hᵖ): the order is one less than the local power, because 1/h steps are needed.',
      explain: t`$\tfrac{T}{h}\times O(h^2) = O(h)$, with the constant set by how the equation propagates each error — the $(e^{LT} - 1)/L$ of the bound, which is $\approx T$ for a neutral equation. The same bookkeeping makes a method with local error $O(h^5)$, such as [RK4](#/lesson/st-f.F9.2), fourth order.`,
    }),
    num({
      id: 'observed-order', difficulty: 2,
      gen(r) {
        const O = r.pick(ODES), n = r.pick([20, 40, 80]);
        const e1 = Math.abs(runScalar(E, O.f, 0, O.ex(0), O.T, n) - O.ex(O.T));
        const e2 = Math.abs(runScalar(E, O.f, 0, O.ex(0), O.T, 2 * n) - O.ex(O.T));
        const E1 = +e1.toPrecision(3), E2 = +e2.toPrecision(3), ans = Math.log2(E1 / E2);
        return {
          prompt: t`Euler’s method on $${O.tex}$ to $t = ${O.T}$ gives an error of $${tex(E1, 3)}$ with $${n}$ steps and $${tex(E2, 3)}$ with $${2 * n}$ steps. What is the observed order $p$?`,
          visual: {
            type: 'graph',
            params: { x: [lg(O.T / n) - 0.6, lg(O.T / n) + 0.3], y: [lg(E2) - 0.6, lg(E1) + 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|error|',
              points: loglog([[O.T / n, E1], [O.T / (2 * n), E2]], { color: 'accent', r: 5 }) },
            caption: 'The two runs on log–log axes. The slope of the line through them is the observed order.',
          },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: E1 / E2, feedback: 'That is the ratio itself. The order is the power of 2 it represents: log₂ of the ratio.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`If $E \approx Ch^p$, halving $h$ divides $E$ by $2^p$.`, t`$p = \log_2(E_h/E_{h/2}) = \ln(E_h/E_{h/2})/\ln 2$.`],
          teach: 'Halve the step and compare: the error ratio is 2ᵖ, so p = log₂(E(h)/E(h/2)).',
          explain: t`$E_h/E_{h/2} = ${(E1 / E2).toFixed(4)}$, so $p = \log_2 ${(E1 / E2).toFixed(4)} = ${ans.toFixed(3)}$ — Euler’s order 1, plus a small pre-asymptotic correction (the next term in $E = C_1h + C_2h^2 + \cdots$) that fades as $h$ shrinks.`,
        };
      },
    }),
    num({
      id: 'predict-steps', difficulty: 2,
      gen(r) {
        const n = r.pick([200, 500, 1000]), Ev = r.pick([4.2, 6.8, 12.5, 25]), target = r.pick([0.1, 0.2, 0.5]);
        const ans = (n * Ev) / target;
        return {
          prompt: t`A first-order (Euler) model of a satellite’s battery temperature, run over one orbit with $${n}$ steps, is off by $${Ev}$ K from a high-accuracy reference. About how many steps would bring the error down to $${target}$ K?`,
          visual: {
            type: 'graph',
            params: { x: [lg(n) - 0.3, lg(ans) + 0.3], y: [lg(target) - 0.4, lg(Ev) + 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'steps per orbit', ylabel: '|error| (K)',
              curves: [{ fn: `${n12(lg(Ev))} - (x - ${n12(lg(n))})`, color: 'accent', width: 2, dash: true, domain: [lg(n), lg(ans) + 0.3] }],
              points: [{ x: n12(lg(n)), y: n12(lg(Ev)), r: 5, color: 'accent' }], hlines: [{ y: n12(lg(target)), color: 'gold', label: 'target' }] },
            caption: 'Error against the number of steps on log–log axes: first order means a line of slope −1.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: n * Math.sqrt(Ev / target), feedback: 'That assumes second order. Euler’s error is proportional to h, so to the reciprocal of the number of steps.' }, { value: n * (Ev / target) ** 2, feedback: 'Error ∝ h ∝ 1/n, so n scales with the error ratio itself, not its square.' }],
          hints: [t`First order: error $\propto h \propto 1/n$.`, t`Multiply $n$ by $${Ev}/${target}$.`],
          teach: 'For a first-order method, the number of steps grows in proportion to the accuracy demanded.',
          explain: t`$n = ${n}\times${Ev}/${target} = ${Math.round(ans)}$ steps. A fourth-order method would need only $(${Ev}/${target})^{1/4} = ${((Ev / target) ** 0.25).toFixed(2)}$ times as many — the argument for [Runge–Kutta](#/lesson/st-f.F9.2).`,
        };
      },
    }),
    mcq({
      id: 'fan', difficulty: 3,
      prompt: t`Euler’s method, with the same step $h = 0.05$, is run to $t = 2$ on four equations that all have smooth solutions of similar size. On which will the global error be largest?`,
      visual: {
        type: 'graph',
        params: { x: [-0.05, 4.15], y: [-1.6, 3.4], aspect: 'wide', axesAt: 'edge', xlabel: 't', ylabel: 'y',
          curves: [{ fn: 'sin(x)', color: 'ink3', width: 3, domain: [0, 4] },
            ...FAN[2][0].p.slice(1, -1).map(([tn, yn]) => ({ fn: `sin(x) + (${n12(yn - Math.sin(tn))})*exp(x - ${n12(tn)})`, color: 'gold', width: 1.1, domain: [tn, 4] })),
            ...FAN[2][0].p.slice(1).map(([tn, yn], k) => seg(FAN[2][0].p[k][0], FAN[2][0].p[k][1], tn, yn, { color: 'accent', width: 2.2, samples: 10 }))] },
        caption: 'For comparison: Euler (blue) with h = 0.5 on an equation whose neighbouring solutions spread apart (gold: the exact solutions through each Euler point).',
      },
      choices: [t`$y' = 2y$`, t`$y' = -2y$`, t`$y' = \cos t$`, t`$y' = -20y$`],
      answer: 0,
      why: {
        1: 'Here ∂f/∂y = −2 < 0: neighbouring solutions converge, so old local errors are damped on the way to t = 2.',
        2: 'The slope does not depend on y, so local errors are simply added up, neither damped nor amplified.',
        3: 'With hλ = −1, Euler is still stable here, and the strong damping wipes out old errors quickly.',
      },
      hints: ['Each local error is carried to t = 2 by the equation itself, multiplied by about $e^{(\\partial f/\\partial y)(2 - t)}$.', 'Which equation has ∂f/∂y positive?'],
      teach: 'The global error is the sum of the local errors, each multiplied by how much the equation amplifies a perturbation from then to the end: $e^{L(T - t)}$ at worst.',
      explain: t`For $y' = 2y$, a perturbation made at time $t$ grows by $e^{2(2 - t)}$, up to $e^4 \approx 55$, before $t = 2$. That is the $e^{L(t_n - t_0)}$ in the bound. No method escapes it: on an unstable equation the error of every method is amplified, which is why chaotic orbits are only ever computed for a limited time.`,
    }),
    num({
      id: 'bound', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2]), Tt = r.pick([0.5, 1]), h = r.pick([0.1, 0.05, 0.02]);
        const n = Math.round(Tt / h), eT = Math.exp(a * Tt), ans = ((h * a) / 2) * eT * (eT - 1);
        const actual = eT - (1 + a * h) ** n;
        return {
          prompt: t`For $y' = ${a === 1 ? '' : a}y$, $y(0) = 1$ on $[0, ${Tt}]$, take $L = ${a}$ and $M = \max\lvert y''\rvert = ${a === 1 ? '' : a * a}e^{${a * Tt}}$. Evaluate the error bound $\frac{hM}{2L}\left(e^{LT} - 1\right)$ for Euler with $h = ${h}$.`,
          visual: {
            type: 'graph',
            params: { x: [-0.02, Tt * 1.05], y: [0.9, eT * 1.08], aspect: 'wide', axesAt: 'edge', xlabel: 't', ylabel: 'y',
              curves: [{ fn: `exp(${a}x)`, color: 'ink3', width: 2.4, domain: [0, Tt] }, ...Array.from({ length: n }, (_, k) => seg(k * h, (1 + a * h) ** k, (k + 1) * h, (1 + a * h) ** (k + 1), { color: 'accent', width: 2, samples: 10 }))] },
            caption: 'The exact solution (grey) and Euler’s polygon (blue) with this step.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: actual, feedback: 'That is the actual error at the end. The question asks for the bound, which is larger.' }, { value: (h * a * a * eT) / 2, feedback: 'That is the largest local error, ½hM — per unit h. The bound multiplies by $(e^{LT} - 1)/L$ for the propagation.' }],
          hints: [t`$M/L = ${a}e^{${a * Tt}}$ here.`, t`Bound $= \tfrac{h}{2}\cdot${a}e^{${a * Tt}}\cdot(e^{${a * Tt}} - 1)$.`],
          teach: 'The bound is the largest local error per unit step, hM/2, times the worst-case amplification $(e^{LT} - 1)/L$.',
          explain: t`Bound $= ${tex(ans, 3)}$. The actual error, $e^{${a * Tt}} - (1 + ${a * h})^{${n}} = ${tex(actual, 3)}$, is a little over half of it: the bound assumes every local error is the largest one and is amplified for the whole interval. It is a guarantee, not an estimate — measure, as in the worked example, for the real number.`,
        };
      },
    }),
    num({
      id: 'roundoff-floor', difficulty: 3,
      gen(r) {
        const A = r.pick([0.4, 0.9, 1.6]), B = r.pick([2e-6, 5e-6, 2e-5]);
        const ans = Math.sqrt(B / A);
        return {
          prompt: t`A float32 run of Euler’s method has total error modelled as $E(h) \approx Ah + B/h$, with truncation constant $A = ${A}$ and round-off constant $B = ${tex(B, 1)}$ (both in units that make $E$ in m/s). Which step size minimises the model’s error?`,
          visual: {
            type: 'graph',
            params: { x: [-5.1, 0.25], y: [-5.6, 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (s)', ylabel: '|error| (m/s)',
              points: loglog(E32, { color: 'gold', r: 4 }) },
            caption: 'For illustration: a real float32 Euler run (the worked example’s capsule) — truncation falls with h, round-off then rises. Not the model in the question.',
          },
          answer: ans, units: 's', tol: { rel: 0.02 },
          errors: [{ value: B / A, feedback: 'Set the derivative A − B/h² to zero: h² = B/A, so take the square root.' }, { value: 2 * Math.sqrt(A * B), feedback: 'That is the smallest error itself, E(h*) = 2√(AB). The question asks for h*.' }],
          hints: ['Differentiate E(h) with respect to h and set it to zero.', t`$A - B/h^2 = 0 \Rightarrow h^* = \sqrt{B/A}$.`],
          teach: 'Truncation error falls with h and round-off rises as 1/h, so there is a best step — and below it, refining only adds noise.',
          explain: t`$h^* = \sqrt{${tex(B, 1)}/${A}} = ${tex(ans, 3)}$ s, where the two errors are equal and the total is $2\sqrt{AB} = ${tex(2 * Math.sqrt(A * B), 2)}$ m/s. The model is a worst case: real rounding errors partly cancel, and the measured float32 curve above bottoms out near $10^{-4}$ s. In float64, $B$ is about $10^{9}$ times smaller and the best step is far below any you would use — the same trade-off as for [difference quotients](#/lesson/st-f.F2.1).`,
        };
      },
    }),
    code({
      id: 'euler-order', difficulty: 3,
      prompt: t`Write \`euler(f, t0, y0, T, n)\` that takes $n$ Euler steps of size $h = T/n$ from \`(t0, y0)\` (a NumPy array) and returns the final state. The program then runs the capsule $v' = g - kv^2$ to $t = 10$ s with $n = 100, 200, 400$ and computes the observed orders \`p\`.`,
      starter: t`import numpy as np

def euler(f, t0, y0, T, n):
    # h = T / n; repeat n times: y = y + h * f(t, y), advancing t
    pass

g, vt = 9.81, 50.0
k = g / vt**2
def drag(t, v):
    return g - k * v**2

exact = vt * np.tanh(g * 10 / vt)
errs = [abs(euler(drag, 0.0, np.array([0.0]), 10.0, n)[0] - exact) for n in (100, 200, 400)]
p = [np.log2(errs[i] / errs[i + 1]) for i in range(2)]
print(errs, p)
`,
      answer: t`import numpy as np

def euler(f, t0, y0, T, n):
    h = T / n
    y = np.array(y0, dtype=float)
    for i in range(n):
        t = t0 + i * h
        y = y + h * f(t, y)
    return y

g, vt = 9.81, 50.0
k = g / vt**2
def drag(t, v):
    return g - k * v**2

exact = vt * np.tanh(g * 10 / vt)
errs = [abs(euler(drag, 0.0, np.array([0.0]), 10.0, n)[0] - exact) for n in (100, 200, 400)]
p = [np.log2(errs[i] / errs[i + 1]) for i in range(2)]
print(errs, p)`,
      tests: [
        { name: t`$y' = y$ with 10 steps to $t = 1$ gives $1.1^{10}$`, code: 'abs(euler(lambda t, y: y, 0.0, np.array([1.0]), 1.0, 10)[0] - 1.1**10) < 1e-12' },
        { name: t`it uses the time argument: $y' = 2t$ from 0 with 4 steps to $t = 1$ gives $0.75$`, code: 'abs(euler(lambda t, y: 2 * t + 0 * y, 0.0, np.array([0.0]), 1.0, 4)[0] - 0.75) < 1e-12' },
        { name: 'both observed orders lie within 0.02 of 1', code: 'all(abs(q - 1) < 0.02 for q in p)' },
      ],
      hints: ['h = T / n; start from y = np.array(y0, dtype=float).', 'In a loop over i: t = t0 + i*h, then y = y + h*f(t, y). Return y.'],
      teach: 'Measuring the order needs only runs at h, h/2, h/4 and the logarithm of the error ratios.',
      explain: t`The errors are about $${tex(Math.abs(runScalar(E, drag, 0, 0, 10, 100) - vex(10)), 3)}$, $${tex(Math.abs(runScalar(E, drag, 0, 0, 10, 200) - vex(10)), 3)}$ and $${tex(Math.abs(runScalar(E, drag, 0, 0, 10, 400) - vex(10)), 3)}$ m/s, halving each time: $p \approx 1$. Computing $t$ as \`t0 + i*h\`, not by adding \`h\` repeatedly, keeps round-off out of the time grid.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-burnout', difficulty: 3, transfer: true,
      gen(r) {
        const Eb = r.pick([42, 65, 85, 120]), target = r.pick([1, 2, 5]), h0 = 0.1;
        const ans = (h0 * target) / Eb;
        return {
          prompt: t`A sounding-rocket ascent code integrates with Euler’s method at $h = ${h0}$ s. Its burnout altitude differs by $${Eb}$ m from a reference computed with a tiny step. What step brings the difference under $${target}$ m (assume the first-order regime)?`,
          visual: {
            type: 'graph',
            params: { x: [lg(ans) - 0.3, lg(h0) + 0.3], y: [lg(target) - 0.4, lg(Eb) + 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (s)', ylabel: '|error| (m)',
              curves: [{ fn: `${n12(lg(Eb))} + (x - ${n12(lg(h0))})`, color: 'accent', width: 2, dash: true, domain: [lg(ans) - 0.3, lg(h0)] }],
              points: [{ x: n12(lg(h0)), y: n12(lg(Eb)), r: 5, color: 'accent' }], hlines: [{ y: n12(lg(target)), color: 'gold', label: 'target' }] },
            caption: 'One measured run and the slope-1 line a first-order method follows.',
          },
          answer: ans, units: 's', tol: { rel: 0.02 },
          errors: [{ value: h0 * Math.sqrt(target / Eb), feedback: 'That would be right for a second-order method. Euler’s error is proportional to h.' }],
          hints: ['Error ∝ h for Euler.', t`$h = ${h0}\times${target}/${Eb}$.`],
          teach: 'For a first-order method the step must shrink in proportion to the accuracy demanded.',
          explain: t`$h = ${h0}\times${target}/${Eb} = ${tex(ans, 3)}$ s — $${Math.round(Eb / target)}$ times as many steps. A fourth-order method would need only $(${Eb}/${target})^{1/4} \approx ${((Eb / target) ** 0.25).toFixed(1)}$ times as many.`,
        };
      },
    }),
    mcq({
      id: 'cp-gpu', difficulty: 2, transfer: true,
      prompt: t`A student moves a trajectory integrator onto a GPU that computes in single precision (float32). Refining the Euler step from $10^{-3}$ s to $10^{-5}$ s makes the final position **worse**. What is happening?`,
      visual: {
        type: 'graph',
        params: { x: [-5.1, 0.25], y: [-5.6, 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (s)', ylabel: '|error|',
          points: [...loglog(E64, { color: 'accent', r: 3.5 }), ...loglog(E32, { color: 'gold', r: 3.5 })],
          legend: [{ label: 'float64', color: 'accent', point: true }, { label: 'float32', color: 'gold', point: true }], legendAt: 'br' },
        caption: 'The capsule of the worked example: the same Euler runs in double and single precision.',
      },
      choices: [
        'Each step rounds the state to about 7 significant digits; a hundred times more steps adds a hundred times more roundings, and below the best step they outweigh the truncation error',
        'Euler’s method becomes unstable when h is very small',
        'The truncation error of Euler grows as 1/h',
        'Small steps make the problem stiff',
      ],
      answer: 0,
      why: {
        1: 'Stability needs h small enough, never large enough: |1 + hλ| → 1 from inside as h → 0.',
        2: 'Truncation error falls in proportion to h; it is the round-off part that grows as 1/h.',
        3: 'Stiffness is a property of the equation (widely separated time scales), not of the step.',
      },
      hints: ['How many significant digits does float32 keep?', 'What happens to the number of roundings when the number of steps grows a hundredfold?'],
      teach: 'Below an optimal step, more steps only accumulate more round-off — and in float32 that optimum arrives at ordinary step sizes.',
      explain: t`Float32 has unit round-off $2^{-24} \approx 6\times10^{-8}$; a hundred thousand roundings of a quantity near 50 m/s can amount to $10^{-2}$ m/s or more, just as the worked example measured. Remedies: keep the state (or at least the running sums) in double precision, or use a higher-order method so fewer steps are needed.`,
    }),
    num({
      id: 'cp-amplify', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 0.8, 1.5]), T = r.pick([2, 3, 5]), ans = Math.exp(L * T);
        return {
          prompt: t`For $y' = ${L}y$, a local error committed by the first Euler step is carried to $t = ${T}$ by the equation itself. By what factor is it multiplied by then?`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, T * 1.05], y: [0, Math.exp(L * T) * 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 't', ylabel: 'y',
              curves: [{ fn: `exp(${L}x)`, color: 'ink3', width: 2.4, domain: [0, T] }, { fn: `1.15*exp(${L}x)`, color: 'gold', width: 1.6, domain: [0, T], label: 'a neighbour', labelAt: T * 0.55, labelDx: -10, labelDy: -14, labelAlign: 'right' }] },
            caption: 'Two exact solutions that start close: their gap grows at the same exponential rate as the solutions themselves.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: L * T, feedback: 'That is the exponent. The perturbation grows like $e^{LT}$.' }, { value: 1 + L * T, feedback: 'That is the linear approximation; over a long interval the growth is exponential.' }],
          hints: ['A perturbation δ of the solution obeys δ′ = (∂f/∂y)δ.', t`So $\delta(${T}) = \delta(0)e^{${L}\cdot${T}}$.`],
          teach: 'An unstable equation multiplies early errors by $e^{LT}$: that factor, not the method, limits how far it can be integrated accurately.',
          explain: t`$e^{${L}\times${T}} = ${tex(ans, 3)}$. The relative error stays the same here (the solution grows by the same factor), but for chaotic systems neighbouring solutions separate while the solution itself stays bounded — then this growth sets a hard horizon.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hairer, Nørsett & Wanner, Solving Ordinary Differential Equations I, 2nd ed. (Springer 1993), §I.7 and §II.3', url: 'https://doi.org/10.1007/978-3-540-78862-1' },
    { label: 'LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM 2007), ch. 5–6', url: 'https://faculty.washington.edu/rjl/fdmbook/' },
    { label: 'Goldberg (1991), What every computer scientist should know about floating-point arithmetic, ACM Comput. Surv. 23, 5', url: 'https://doi.org/10.1145/103162.103163' },
  ],
});
