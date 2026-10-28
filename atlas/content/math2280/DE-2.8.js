// Improved Euler (Heun) and classical Runge–Kutta (RK4): several slopes per
// step, weighted; second and fourth order; RK4 as Simpson's rule; the cost
// of accuracy; and solve_ivp's adaptive steps — with Python exercises that
// build RK4, measure its order and compare it with scipy.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// the worked example: one step of y′ = t + y from (0, 1) with h = 0.2
const fx = (tt, y) => tt + y, H = 0.2;
const K1 = fx(0, 1), K2 = fx(0.1, 1 + 0.1 * K1), K3 = fx(0.1, 1 + 0.1 * K2), K4 = fx(0.2, 1 + 0.2 * K3);
const Y1 = 1 + (H / 6) * (K1 + 2 * K2 + 2 * K3 + K4), YX = 2 * Math.exp(0.2) - 1.2;
const HEUN = 1 + (H / 2) * (K1 + fx(0.2, 1 + H * K1));
let EU4 = 1; for (let i = 0; i < 4; i++) EU4 += 0.05 * fx(i * 0.05, EU4);
const r4 = (x) => +x.toPrecision(4);

// Bogacki–Shampine 3(2) with error control — the same idea as solve_ivp's RK45 — on Moler's
// "ball of flame" y′ = y² − y³, y(0) = δ: the step points it chooses, for the checkpoint's picture
function flameSteps(delta = 0.05, rtol = 1e-4) {
  const f = (y) => y * y - y * y * y, T = 2 / delta, pts = [[0, delta]];
  let tt = 0, y = delta, h = 1, k1 = f(y);
  while (tt < T && pts.length < 400) {
    if (tt + h > T) h = T - tt;
    const k2 = f(y + (h / 2) * k1), k3 = f(y + ((3 * h) / 4) * k2), y1 = y + h * ((2 / 9) * k1 + (1 / 3) * k2 + (4 / 9) * k3), k4 = f(y1);
    const err = Math.abs(h * ((-5 / 72) * k1 + (1 / 12) * k2 + (1 / 9) * k3 - (1 / 8) * k4)), tol = rtol * Math.max(Math.abs(y), Math.abs(y1)) + 1e-8;
    if (err <= tol) { tt += h; y = y1; k1 = k4; pts.push([tt, y]); }
    h *= Math.min(4, Math.max(0.2, 0.9 * (tol / Math.max(err, 1e-300)) ** (1 / 3)));
  }
  return pts;
}
const FLAME = flameSteps();

export default lesson({
  id: 'math2280.DE-2.8',
  title: 'Improved Euler and Runge–Kutta (RK4)',
  minutes: 15, difficulty: 3,
  intro: t`Euler’s method reads the slope once per step, at the start. Better methods sample it several times inside the step and average. **Improved Euler** (Heun’s method) takes a trial Euler step, reads the slope at its end, and averages the two slopes — second order. The classical **Runge–Kutta** method, **RK4**, samples four slopes, at the start, twice at the midpoint and at the end:

$$\begin{aligned} k_1 &= f(t_n, y_n), & k_2 &= f\!\left(t_n + \tfrac h2,\ y_n + \tfrac h2 k_1\right), \\ k_3 &= f\!\left(t_n + \tfrac h2,\ y_n + \tfrac h2 k_2\right), & k_4 &= f(t_n + h,\ y_n + hk_3), \end{aligned}$$
$$y_{n+1} = y_n + \tfrac h6\left(k_1 + 2k_2 + 2k_3 + k_4\right)$$

Its global error falls like $h^4$: halve the step and the error drops sixteen-fold. Four slope evaluations per step buy far more accuracy than four Euler steps would.`,
  symbols: [
    { tex: t`k_1, \ldots, k_4`, text: 'slopes of the equation, each read at a trial point inside the step' },
    { tex: t`\tfrac16(k_1 + 2k_2 + 2k_3 + k_4)`, text: 'the weighted average slope the step actually uses; the midpoint slopes count twice, as in Simpson’s rule' },
    { tex: t`h`, text: 'the step size' },
    { tex: t`h^p`, text: t`how the global error scales: $p = 1$ for Euler, $2$ for improved Euler, $4$ for RK4` },
  ],
  why: t`RK4 and its adaptive descendants, such as the Dormand–Prince pair inside SciPy’s \`solve_ivp\`, integrate trajectories, orbits and the paths of light around black holes; knowing what they do tells you when to trust their output.`,
  visual: {
    type: 'de-stepper',
    title: 'Inside one step: Euler, improved Euler and RK4',
    lead: t`The equation $y' = y\cos t$, whose exact solution is $y = e^{\sin t}$ (blue), solved from $y(0) = 1$. In **One step** each slope a method reads is drawn where it is read, and the gold arrow is the step it takes; in **Whole run** you see where the steps lead.`,
    tasks: [
      'One step with RK4: k₁ at the start, k₂ and k₃ at the midpoint, k₄ at the end, and a gold step that lands almost on the dashed exact curve.',
      'Switch to improved Euler: two slopes, one at the start and one at the end of a trial Euler step, averaged.',
      'Whole run, then halve h: RK4’s error falls about 16-fold, improved Euler’s 4-fold, Euler’s 2-fold — slopes 4, 2 and 1 on the log–log panel.',
    ],
    params: {
      f: 'y*cos(t)', exact: 'exp(sin(t))', t0: 0, y0: 1, T: 6, hs: [1.5, 0.75, 0.375, 0.1875],
      methods: ['euler', 'heun', 'rk4'], method: 'rk4', views: ['stage', 'run'], view: 'stage',
    },
    caption: t`Fixed step sizes. In One step the dashed blue curve is the exact solution through the start of that step — the curve the step is trying to follow — and the red bar is the error made in that single step.`,
  },
  example: {
    prompt: t`Take one RK4 step of size $h = 0.2$ for $y' = t + y$ from $y(0) = 1$, and compare it with the exact value $y(0.2) = 2e^{0.2} - 1.2$, with one improved-Euler step, and with four Euler steps of $0.05$ — the same number of slope evaluations as one RK4 step.`,
    visual: { type: 'de-stepper', params: { f: 't + y', exact: '2*exp(t) - t - 1', t0: 0, y0: 1, T: 0.2, hs: [0.2], methods: ['rk4', 'heun', 'euler'], method: 'rk4', views: ['stage'], errorPlot: false }, caption: 'The four RK4 slopes for this step, where they are read. Switch methods to compare.' },
    steps: [
      { label: 'First slope', text: t`$k_1 = f(0, 1) = 0 + 1 = ${K1}$.` },
      { label: 'Midpoint slopes', text: t`$k_2 = f(0.1,\ 1 + 0.1 \times ${K1}) = f(0.1, 1.1) = ${r4(K2)}$, then $k_3 = f(0.1,\ 1 + 0.1 \times ${r4(K2)}) = f(0.1, 1.12) = ${r4(K3)}$.` },
      { label: 'End slope', text: t`$k_4 = f(0.2,\ 1 + 0.2 \times ${r4(K3)}) = f(0.2, 1.244) = ${r4(K4)}$.` },
      { label: 'Combine', text: t`$y_1 = 1 + \dfrac{0.2}{6}\left(${K1} + 2(${r4(K2)}) + 2(${r4(K3)}) + ${r4(K4)}\right) = 1 + \dfrac{0.2}{6}(${r4(K1 + 2 * K2 + 2 * K3 + K4)}) = ${Y1.toFixed(4)}$.` },
      { label: 'Compare', text: t`Exact: $2e^{0.2} - 1.2 = ${YX.toFixed(6)}$, so RK4 is off by $${tex2(Math.abs(Y1 - YX))}$. One improved-Euler step gives $${nice(HEUN)}$ (off by $${fmt(Math.abs(HEUN - YX), 2)}$), and four Euler steps of 0.05 give $${EU4.toFixed(4)}$ (off by $${fmt(Math.abs(EU4 - YX), 2)}$).` },
      { label: 'Sense check', text: t`For the same four evaluations of $f$, RK4 is about ${Math.round(Math.abs(EU4 - YX) / Math.abs(Y1 - YX) / 100) * 100} times more accurate than Euler. That gap widens as $h$ shrinks, because $h^4$ falls so much faster than $h$.` },
    ],
    answer: t`$y_1 = ${Y1.toFixed(4)}$ against the exact $${YX.toFixed(6)}$: an error of a few millionths, where improved Euler errs by about 0.003 and four Euler steps by about 0.012.`,
  },
  practice: [
    num({
      id: 'heun-step', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1]), y0 = r.pick([1, 2]), h = r.pick([0.1, 0.2, 0.5]);
        const f = (tt, y) => a * tt * y + 1;
        const k1 = f(0, y0), yp = y0 + h * k1, k2 = f(h, yp), y1 = y0 + (h / 2) * (k1 + k2);
        return {
          prompt: t`Take one improved-Euler step of size $h = ${h}$ for $y' = ${a === 1 ? '' : a === -1 ? '-' : a}ty + 1$ from $y(0) = ${y0}$.`,
          answer: y1, tol: { rel: 1e-4, abs: 1e-9 },
          errors: [{ value: yp, feedback: 'That is only the trial (Euler) step. Read the slope at its end and average the two slopes.' }, { value: y0 + h * k2, feedback: 'Use the average of the two slopes, not just the one at the end.' }].filter((e) => Math.abs(e.value - y1) > 1e-6),
          hints: [t`$k_1 = f(0, ${y0})$; the trial point is $y_0 + hk_1$ at $t = ${h}$.`, t`$k_2 = f(${h},\ ${nice(yp)})$; then $y_1 = y_0 + \tfrac h2(k_1 + k_2)$.`],
          teach: 'Improved Euler averages the slope at the start with the slope at the end of a trial Euler step.',
          explain: t`$k_1 = ${nice(k1)}$, trial $y = ${nice(yp)}$, $k_2 = f(${h}, ${nice(yp)}) = ${nice(k2)}$, so $y_1 = ${y0} + ${h / 2}(${nice(k1)} ${pm(k2)}) = ${nice(y1, 6)}$.`,
          visual: { type: 'de-stepper', params: { f: `${a}*t*y + 1`, t0: 0, y0, T: h, hs: [h], methods: ['heun'], views: ['stage'], readout: false }, caption: 'The two slopes of the improved-Euler step, drawn where they are read. The numbers are yours to find.' },
        };
      },
    }),
    num({
      id: 'rk4-step', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]), y0 = r.pick([0, 1]), h = r.pick([0.2, 0.5]);
        const f = (tt, y) => y - c * tt;
        const k1 = f(0, y0), k2 = f(h / 2, y0 + (h / 2) * k1), k3 = f(h / 2, y0 + (h / 2) * k2), k4 = f(h, y0 + h * k3);
        const y1 = y0 + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        return {
          prompt: t`Take one RK4 step of size $h = ${h}$ for $y' = y - ${c === 1 ? '' : c}t$ from $y(0) = ${y0}$.`,
          answer: y1, tol: { rel: 1e-4, abs: 1e-9 },
          errors: [{ value: y0 + (h / 4) * (k1 + k2 + k3 + k4), feedback: t`The weights are $1, 2, 2, 1$ over 6, not equal quarters.` }, { value: y0 + h * k1, feedback: 'That is Euler’s step: RK4 needs all four slopes.' }].filter((e) => Math.abs(e.value - y1) > 1e-6),
          hints: [t`$k_1 = f(0, ${y0})$, $k_2 = f(${h / 2}, y_0 + ${h / 2}k_1)$, $k_3 = f(${h / 2}, y_0 + ${h / 2}k_2)$, $k_4 = f(${h}, y_0 + ${h}k_3)$.`, t`$k_1 = ${nice(k1)}$, $k_2 = ${nice(k2, 6)}$, $k_3 = ${nice(k3, 6)}$, $k_4 = ${nice(k4, 6)}$. Combine with weights 1, 2, 2, 1 over 6.`],
          teach: 'RK4 reads four slopes — start, midpoint twice, end — and weights them 1 : 2 : 2 : 1.',
          explain: t`$y_1 = ${y0} + \dfrac{${h}}{6}\left(${nice(k1)} + 2(${nice(k2, 6)}) + 2(${nice(k3, 6)}) ${pm(k4, 6)}\right) = ${nice(y1, 6)}$. The exact value is $${nice(c + c * h + (y0 - c) * Math.exp(h), 6)}$.`,
          visual: { type: 'de-stepper', params: { f: `y - ${c}*t`, exact: `${c}*t + ${c} + (${y0 - c})*exp(t)`, t0: 0, y0, T: h, hs: [h], methods: ['rk4'], views: ['stage'], readout: false }, caption: 'The four RK4 slopes, drawn where they are read; the dashed curve is the exact solution.' },
        };
      },
    }),
    mcq({
      id: 'rk4-simpson', difficulty: 2,
      prompt: t`For an equation $y' = f(t)$ whose right side does not involve $y$, one RK4 step from $t_n$ to $t_n + h$ adds $\tfrac h6\left(f(t_n) + 4f(t_n + \tfrac h2) + f(t_n + h)\right)$. Which integration rule is that?`,
      choices: ['Simpson’s rule on [tₙ, tₙ + h], with its midpoint', 'The trapezoid rule', 'The midpoint rule', 'A left Riemann sum'],
      answer: 0,
      why: {
        1: t`The trapezoid rule uses only the two ends, $\tfrac h2(f_0 + f_1)$ — that is improved Euler.`,
        2: t`The midpoint rule uses only $f(t_n + \tfrac h2)$ — the midpoint method, a second-order Runge–Kutta method.`,
        3: 'A left Riemann sum uses only the start of each interval — that is Euler’s method.',
      },
      hints: [t`With no $y$ in $f$, $k_2 = k_3 = f(t_n + \tfrac h2)$, so the weights are $1, 4, 1$ over 6.`],
      teach: 'On y′ = f(t), Euler is a left Riemann sum, improved Euler the trapezoid rule and RK4 Simpson’s rule — which is why their orders are 1, 2 and 4.',
      explain: t`Weights $\tfrac16, \tfrac46, \tfrac16$ on the two ends and the midpoint are Simpson’s rule for $\int_{t_n}^{t_n+h} f\,dt$, whose error is fourth order — the same as RK4’s. Compare the rules on the picture.`,
      visual: { type: 'calc-quadrature', params: { functions: [{ fn: 'exp(-x^2)', a: 0, b: 2, label: 'e^(−t²)' }], rule: 'trap', rules: ['mid', 'trap', 'simpson'], n: 4, nMax: 16, errorPlot: false, xlabel: 't', ylabel: 'f(t)' }, caption: 'Three quadrature rules on one integrand; switch between them. Each RK method reduces to one of these when f does not involve y.' },
    }),
    num({
      id: 'step-for-accuracy', difficulty: 3,
      gen(r) {
        const E0 = r.pick([1e-3, 4e-4]), target = r.pick([1e-7, 1e-8]);
        const h4 = 0.1 * (target / E0) ** 0.25, h1 = 0.1 * (target / E0);
        return {
          prompt: t`A method has error $${E0 === 1e-3 ? t`1\times10^{-3}` : t`4\times10^{-4}`}$ at the end of a run with $h = 0.1$. You need $${target === 1e-7 ? t`10^{-7}` : t`10^{-8}`}$. If the method is RK4 (error $\propto h^4$), what step size will do?`,
          answer: h4, tol: { rel: 0.01 },
          errors: [{ value: h1, feedback: t`That is the step Euler (error $\propto h$) would need. With error $\propto h^4$, take the fourth root of the error ratio.` }, { value: 0.1 * Math.sqrt(target / E0), feedback: t`Error $\propto h^2$ is improved Euler. RK4’s error goes like $h^4$.` }],
          hints: [t`$E \propto h^4$, so $\dfrac{h_\text{new}}{0.1} = \left(\dfrac{E_\text{new}}{E_\text{old}}\right)^{1/4}$.`, t`The error must fall by a factor $${nice(E0 / target)}$; take its fourth root.`],
          teach: 'With error ∝ hᵖ, cutting the error by a factor F needs a step smaller by the p-th root of F — a small change for p = 4, a huge one for p = 1.',
          explain: t`$h = 0.1\times(${nice(E0 / target)})^{-1/4} = ${fmt(h4, 3)}$ — about ${Math.round(0.1 / h4)} times more steps. Euler would need $h = ${tex2(h1)}$: about ${Math.round(0.1 / h1).toLocaleString('en-US')} times more steps, which is why nobody integrates orbits with Euler.`,
          visual: { type: 'graph', params: { x: [-4, -1], y: [-9, -2], xlog: true, ylog: true, axesAt: 'edge', xlabel: 'step size h', ylabel: '|error|', curves: [{ fn: `log10(${E0}) + 4*(x + 1)`, color: 'good', label: 'RK4, slope 4', labelAt: -1.5, labelDx: -86, labelDy: -6 }, { fn: `log10(${E0}) + (x + 1)`, color: 'warn', label: 'Euler, slope 1', labelAt: -2.5, labelDx: -40, labelDy: -20 }], hlines: [{ y: Math.log10(target), label: 'target', color: 'gold' }] }, caption: 'Two error lines through the same starting error, on logarithmic axes: the one with slope 4 reaches the target at a much larger h.' },
        };
      },
    }),
    code({
      id: 'rk4-code', difficulty: 2,
      prompt: t`Write \`rk4(f, t0, y0, h, n)\` that takes \`n\` RK4 steps of size \`h\` for $y' = f(t, y)$ from $(t_0, y_0)$ and returns the final value of $y$.`,
      starter: t`def rk4(f, t0, y0, h, n):
    t, y = t0, y0
    for i in range(n):
        k1 = f(t, y)
        # k2, k3, k4, then the weighted step
        t = t0 + (i + 1) * h
    return y
`,
      answer: t`def rk4(f, t0, y0, h, n):
    t, y = t0, y0
    for i in range(n):
        k1 = f(t, y)
        k2 = f(t + h / 2, y + h / 2 * k1)
        k3 = f(t + h / 2, y + h / 2 * k2)
        k4 = f(t + h, y + h * k3)
        y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        t = t0 + (i + 1) * h
    return y`,
      tests: [
        { name: 'y′ = y, h = 0.1, 10 steps matches the RK4 growth factor', code: 'abs(rk4(lambda t, y: y, 0, 1, 0.1, 10) - (1 + 0.1 + 0.1**2/2 + 0.1**3/6 + 0.1**4/24)**10) < 1e-12' },
        { name: 'exact for y′ = 4t³ (Simpson is exact for cubics): y(2) = 16', code: 'abs(rk4(lambda t, y: 4 * t**3, 0, 0, 0.5, 4) - 16) < 1e-12' },
        { name: 'y′ = −2ty from y(0) = 1 reaches e⁻¹ at t = 1 to within 10⁻⁶', code: 'abs(rk4(lambda t, y: -2 * t * y, 0, 1, 0.05, 20) - 0.36787944117144233) < 1e-6' },
      ],
      hints: [t`$k_2 = f(t + h/2,\ y + (h/2)k_1)$ and $k_3 = f(t + h/2,\ y + (h/2)k_2)$; $k_4 = f(t + h,\ y + hk_3)$.`, '`y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)` before moving t on.'],
      teach: 'RK4 is four slope evaluations and one weighted update per step.',
      explain: t`Each stage feeds the next: $k_2$ uses $k_1$ to reach the midpoint, $k_3$ re-reads the midpoint with $k_2$, $k_4$ goes to the end with $k_3$. For $y' = y$ one step multiplies by $1 + h + \tfrac{h^2}2 + \tfrac{h^3}6 + \tfrac{h^4}{24}$ — the Taylor series of $e^h$ to fourth order, which is RK4’s order in a nutshell.`,
    }),
    code({
      id: 'rk4-order', difficulty: 3,
      prompt: t`Measure RK4’s order. With the \`rk4\` function provided, compute the errors at $t = 1$ for $y' = y$, $y(0) = 1$ (exact $e$) with $h = 0.2, 0.1, 0.05, 0.025$ into the list \`errors\`, and set \`p\` to $\log_2\big(E(h)/E(h/2)\big)$ from the **last two**.`,
      starter: t`import math

def rk4(f, t0, y0, h, n):
    y = y0
    for i in range(n):
        t = t0 + i * h
        k1 = f(t, y); k2 = f(t + h/2, y + h/2*k1); k3 = f(t + h/2, y + h/2*k2); k4 = f(t + h, y + h*k3)
        y += h / 6 * (k1 + 2*k2 + 2*k3 + k4)
    return y

hs = [0.2, 0.1, 0.05, 0.025]
errors = []
p = 0
`,
      answer: t`import math

def rk4(f, t0, y0, h, n):
    y = y0
    for i in range(n):
        t = t0 + i * h
        k1 = f(t, y); k2 = f(t + h/2, y + h/2*k1); k3 = f(t + h/2, y + h/2*k2); k4 = f(t + h, y + h*k3)
        y += h / 6 * (k1 + 2*k2 + 2*k3 + k4)
    return y

hs = [0.2, 0.1, 0.05, 0.025]
errors = [abs(rk4(lambda t, y: y, 0, 1, h, round(1 / h)) - math.e) for h in hs]
p = math.log2(errors[-2] / errors[-1])
print(errors, p)`,
      tests: [
        { name: 'four errors', code: 'len(errors) == 4' },
        { name: 'the error with h = 0.2 is about 3.1 × 10⁻⁵', code: '2.9e-5 < errors[0] < 3.3e-5' },
        { name: 'each halving of h divides the error by about 16', code: 'all(13 < errors[i] / errors[i + 1] < 17 for i in range(3))' },
        { name: 'the observed order p is close to 4', code: 'abs(p - 4) < 0.1' },
      ],
      hints: ['The same pattern as for Euler: `round(1 / h)` steps, compare with `math.e`.', '`errors = [abs(rk4(lambda t, y: y, 0, 1, h, round(1 / h)) - math.e) for h in hs]` and `p = math.log2(errors[-2] / errors[-1])`.'],
      teach: 'Halving h divides RK4’s error by about 2⁴ = 16: fourth order, measured.',
      explain: t`The errors run from about $3.1\times10^{-5}$ down to $8.7\times10^{-9}$, each 15 to 16 times smaller than the last, so $p \approx 3.97$. Halve $h$ much further and rounding error ($\sim 10^{-16}$ per step) starts to show.`,
    }),
    code({
      id: 'vs-scipy', difficulty: 3,
      prompt: t`Compare with SciPy. Solve the skydiver’s equation $v' = 9.8\left(1 - (v/55.2)^2\right)$, $v(0) = 0$, up to $t = 6$ s with \`scipy.integrate.solve_ivp\` (\`rtol=1e-10\`, \`atol=1e-12\`), storing the result in \`sol\`, and set \`v_scipy\` to its final value. Then set \`v_rk4\` to your RK4 result with $h = 0.5$ (12 steps), using the \`rk4\` provided. The exact value is $55.2\tanh(9.8\times6/55.2)$.`,
      starter: t`import math
from scipy.integrate import solve_ivp

def rk4(f, t0, y0, h, n):
    y = y0
    for i in range(n):
        t = t0 + i * h
        k1 = f(t, y); k2 = f(t + h/2, y + h/2*k1); k3 = f(t + h/2, y + h/2*k2); k4 = f(t + h, y + h*k3)
        y += h / 6 * (k1 + 2*k2 + 2*k3 + k4)
    return y

f = lambda t, v: 9.8 * (1 - (v / 55.2)**2)
exact = 55.2 * math.tanh(9.8 * 6 / 55.2)

sol = None       # solve_ivp(...) — note that solve_ivp wants y as an array
v_scipy = 0.0
v_rk4 = 0.0
`,
      answer: t`import math
from scipy.integrate import solve_ivp

def rk4(f, t0, y0, h, n):
    y = y0
    for i in range(n):
        t = t0 + i * h
        k1 = f(t, y); k2 = f(t + h/2, y + h/2*k1); k3 = f(t + h/2, y + h/2*k2); k4 = f(t + h, y + h*k3)
        y += h / 6 * (k1 + 2*k2 + 2*k3 + k4)
    return y

f = lambda t, v: 9.8 * (1 - (v / 55.2)**2)
exact = 55.2 * math.tanh(9.8 * 6 / 55.2)

sol = solve_ivp(f, (0, 6), [0.0], rtol=1e-10, atol=1e-12)
v_scipy = sol.y[0, -1]
v_rk4 = rk4(f, 0, 0.0, 0.5, 12)
print(v_scipy - exact, v_rk4 - exact, len(sol.t), sol.nfev)`,
      tests: [
        { name: 'solve_ivp succeeded and ended at t = 6', code: 'sol is not None and sol.success and abs(sol.t[-1] - 6) < 1e-12' },
        { name: 'solve_ivp agrees with the exact value to 10⁻⁸ m/s', code: 'abs(v_scipy - exact) < 1e-8' },
        { name: 'RK4 with h = 0.5 is within 10⁻⁴ m/s of the exact value', code: 'abs(v_rk4 - exact) < 1e-4 and abs(v_rk4 - exact) > 1e-6' },
      ],
      hints: ['`solve_ivp(f, (0, 6), [0.0], rtol=1e-10, atol=1e-12)` — the initial value goes in a list.', 'The solution array is `sol.y` with one row per variable: the last value is `sol.y[0, -1]`. For RK4: `rk4(f, 0, 0.0, 0.5, 12)`.'],
      teach: 'solve_ivp adapts its steps to meet a tolerance you choose; a fixed-step RK4 gives you control and transparency, and the two should agree to within your RK4’s error.',
      explain: t`\`solve_ivp\` (Dormand–Prince 5(4) by default) reaches the exact value to about $10^{-10}$, choosing its own steps; fixed-step RK4 with $h = 0.5$ is off by about $5\times10^{-5}$ m/s, as its $h^4$ error predicts. Printing \`sol.nfev\` shows how many slope evaluations SciPy spent.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      prompt: t`RK4 on an orbit. With $GM = 1$, a body starting at $(1, 0)$ with velocity $(0, 1)$ moves on a circle of period $2\pi$. Write \`orbit_rk4(n)\` that takes \`n\` RK4 steps of size $h = 2\pi/n$ for the state $s = (x, y, v_x, v_y)$, with $s' = \left(v_x,\ v_y,\ -x/r^3,\ -y/r^3\right)$, and returns the final state as a list. The helper \`deriv(s)\` is provided.`,
      starter: t`import math

def deriv(s):
    x, y, vx, vy = s
    r3 = (x*x + y*y) ** 1.5
    return [vx, vy, -x / r3, -y / r3]

def orbit_rk4(n):
    h = 2 * math.pi / n
    s = [1.0, 0.0, 0.0, 1.0]
    # n RK4 steps on the four-component state
    return s

def energy(s):
    x, y, vx, vy = s
    return 0.5 * (vx*vx + vy*vy) - 1 / math.hypot(x, y)
`,
      answer: t`import math

def deriv(s):
    x, y, vx, vy = s
    r3 = (x*x + y*y) ** 1.5
    return [vx, vy, -x / r3, -y / r3]

def orbit_rk4(n):
    h = 2 * math.pi / n
    s = [1.0, 0.0, 0.0, 1.0]
    for _ in range(n):
        k1 = deriv(s)
        k2 = deriv([a + h / 2 * b for a, b in zip(s, k1)])
        k3 = deriv([a + h / 2 * b for a, b in zip(s, k2)])
        k4 = deriv([a + h * b for a, b in zip(s, k3)])
        s = [a + h / 6 * (p + 2 * q + 2 * r + w) for a, p, q, r, w in zip(s, k1, k2, k3, k4)]
    return s

def energy(s):
    x, y, vx, vy = s
    return 0.5 * (vx*vx + vy*vy) - 1 / math.hypot(x, y)

print(orbit_rk4(64), energy(orbit_rk4(64)) + 0.5)`,
      tests: [
        { name: 'after one period with 64 steps the body is back at (1, 0) to within 10⁻⁴', code: 'abs(orbit_rk4(64)[0] - 1) < 1e-4 and abs(orbit_rk4(64)[1]) < 1e-4' },
        { name: 'the energy stays −½ to within 10⁻⁵ (Euler with 628 steps was off by 0.05)', code: 'abs(energy(orbit_rk4(64)) + 0.5) < 1e-5' },
        { name: 'doubling n shrinks the position error at least 16-fold', code: 'math.hypot(orbit_rk4(64)[0] - 1, orbit_rk4(64)[1]) > 16 * math.hypot(orbit_rk4(128)[0] - 1, orbit_rk4(128)[1])' },
      ],
      hints: ['Treat the state as a list and build each trial state with a list comprehension: `[a + h / 2 * b for a, b in zip(s, k1)]`.', 'The update is `s = [a + h / 6 * (p + 2*q + 2*r + w) for a, p, q, r, w in zip(s, k1, k2, k3, k4)]`.'],
      teach: 'RK4 works on a whole state vector at once — every component takes its stages together — and on an orbit it holds the energy thousands of times better than Euler.',
      explain: t`With 64 steps RK4 returns to $(1, 0)$ to about $2\times10^{-5}$ and the energy is off by less than $10^{-6}$, against Euler’s 0.05 with ten times as many steps. Over thousands of orbits even RK4’s small drift adds up, which is why long orbit integrations use symplectic methods that conserve energy on average.`,
    }),
    num({
      id: 'cp-scale', difficulty: 2,
      gen(r) {
        const E = r.pick([3.2e-5, 6.4e-4, 1.6e-3]), m = r.pick([[4, 'RK4', 2, 'quartered'], [2, 'improved Euler', 2, 'quartered'], [4, 'RK4', 1, 'halved']]);
        const factor = 2 ** (m[0] * m[2]), val = E / factor;
        return {
          prompt: t`${m[1][0].toUpperCase() + m[1].slice(1)} has an error of $${tex2(E)}$ at the end of a run with $h = 0.2$. Estimate its error when $h$ is ${m[3]} (to $${m[2] === 2 ? '0.05' : '0.1'}$).`,
          answer: val, tol: { rel: 0.02 },
          errors: [{ value: E / 2 ** m[2], feedback: 'That is first-order scaling. Use the method’s order as the power.' }, { value: E / 2 ** (m[0] * m[2] - m[0]), feedback: t`$h$ shrinks by a factor of $${2 ** m[2]}$ in all, so the error shrinks by $${2 ** m[2]}^{${m[0]}}$.` }].filter((e) => Math.abs(e.value - val) > 0.05 * val),
          hints: [t`${m[1][0].toUpperCase() + m[1].slice(1)} is order ${m[0]}: error $\propto h^{${m[0]}}$.`, t`$h$ shrinks by $${2 ** m[2]}$, so the error shrinks by $${2 ** m[2]}^{${m[0]}} = ${factor}$.`],
          teach: 'Order p means the error scales as hᵖ: shrink h by a factor s and the error shrinks by sᵖ.',
          explain: t`$${tex2(E)}/${factor} = ${tex2(val)}$.`,
          visual: { type: 'graph', params: { x: [-1.5, -0.5], y: [Math.log10(val) - 1, Math.log10(E) + 0.6], xlog: true, ylog: true, axesAt: 'edge', xlabel: 'step size h', ylabel: '|error|', points: [{ x: Math.log10(0.2), y: Math.log10(E), color: 'gold', label: 'h = 0.2' }], curves: [{ fn: `log10(${E}) + ${m[0]}*(x - log10(0.2))`, color: 'ink3', dash: true, width: 1.4 }] }, caption: t`The measured error at $h = 0.2$ and a line of slope ${m[0]} through it, on logarithmic axes.` },
        };
      },
    }),
    mcq({
      id: 'cp-adaptive', difficulty: 2,
      prompt: t`An adaptive solver chose the steps marked in the picture for $y' = y^2 - y^3$, $y(0) = 0.05$ — a flame that smoulders, then flares. How does an adaptive solver, such as SciPy’s \`solve_ivp\` with its default method \`'RK45'\`, decide each step size?`,
      choices: [
        'Each step computes two estimates of different order from the same slopes; their difference estimates the error, and h shrinks or grows to keep it within the tolerance',
        'It compares each step with the exact solution and halves h when they disagree',
        'It uses a fixed h, chosen in advance from the length of the interval',
        'It runs the whole problem twice, at h and h/2, and keeps the more accurate run',
      ],
      answer: 0,
      why: {
        1: 'A solver never has the exact solution — if it did, it would not need to integrate.',
        2: 'The picture shows the step sizes changing along the run, so they were not fixed in advance.',
        3: 'Whole-run comparisons (Richardson) are useful by hand; adaptive solvers judge each step as they go, which is far cheaper.',
      },
      hints: ['Look at where the points crowd together: where is the solution changing fastest?', 'An embedded Runge–Kutta pair gets two answers per step almost for free.'],
      teach: 'Adaptive solvers estimate each step’s error from an embedded pair of methods and adjust h to meet rtol and atol.',
      explain: t`RK45 (Dormand–Prince) produces a 5th- and a 4th-order result from the same six slopes; their difference estimates the local error, and $h$ is rescaled so it stays below $\text{rtol}\,|y| + \text{atol}$. Steps are long while the flame smoulders and short during the flare, where the solution turns sharply.`,
      visual: { type: 'graph', params: { x: [0, 42], y: [0, 1.15], xlabel: 't', ylabel: 'y', points: FLAME.map(([a, b]) => ({ x: a, y: b, color: 'gold', r: 2.6 })) }, caption: t`Steps chosen by an adaptive Bogacki–Shampine 3(2) pair at a relative tolerance of $10^{-4}$, computed for this picture; SciPy’s RK45 uses a higher-order pair but chooses its steps by the same rule. Each dot is the end of one step.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.7 Numerical methods (improved Euler, RK4)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'SciPy documentation: scipy.integrate.solve_ivp', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html' },
    { label: 'C. Moler, “Stiff differential equations” (the flame example), MATLAB News & Notes, 2003', url: 'https://www.mathworks.com/company/technical-articles/stiff-differential-equations.html' },
  ],
});

// “+ x” or “− |x|” for a term inside a sum
function pm(x, d) { return x < 0 ? `- ${nice(-x, d)}` : `+ ${nice(x, d)}`; }

// a number as TeX with ×10ⁿ for small and large values
function tex2(x) {
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) { const [mm, e] = x.toExponential(2).split('e'); return `${+mm}\\times10^{${+e}}`; }
  return fmt(x, 3);
}
