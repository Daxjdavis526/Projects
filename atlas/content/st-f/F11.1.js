// Explicit and implicit schemes — stiffness and its cure. A stiff problem has
// a fast, decaying mode that dies out at once but still caps an explicit
// method's step: y′ = −1000(y − cos t) needs h < 0.002 for Euler, and an
// adaptive Dormand–Prince takes about 300 steps on [0, 1] whatever the
// tolerance. Backward Euler, R = 1/(1 − z), is A-stable and L-stable: ten
// steps of 0.1 give an error of 3 × 10⁻⁵. The trapezoidal rule is A-stable
// but R → −1 at −∞, so the transient rings (error 0.67 at h = 0.1). The cost:
// a solve with I − hJ every step. Transfers: a thermocouple in a re-entry
// flow, the Robertson chemical-kinetics problem.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import * as S from '../../src/viz/model/num3-stab.js';
import { dopri, n12 } from './_ode.js';

const t = String.raw;

// ── the worked example: y′ = −K(y − cos t), y(0) = 0, on [0, 1] ──
const K = 1000;
const ex = (tt) => (K * K * Math.cos(tt) + K * Math.sin(tt)) / (K * K + 1) - ((K * K) / (K * K + 1)) * Math.exp(-K * tt);
function run(kind, n, T = 1) {
  const h = T / n;
  let y = 0;
  const path = [[0, 0]];
  for (let i = 0; i < n; i++) {
    const t0 = i * h, t1 = t0 + h;
    if (kind === 'fe') y = y + h * -K * (y - Math.cos(t0));
    else if (kind === 'be') y = (y + K * h * Math.cos(t1)) / (1 + K * h);
    else y = (y * (1 - (K * h) / 2) + ((K * h) / 2) * (Math.cos(t0) + Math.cos(t1))) / (1 + (K * h) / 2);
    path.push([t1, y]);
  }
  return { y, err: y - ex(T), path };
}
const FE400 = run('fe', 400), FE1000 = run('fe', 1000), BE10 = run('be', 10), TR10 = run('tr', 10), BE100 = run('be', 100);
const DP = [1e-3, 1e-6].map((tol) => { const r = dopri((tt, y) => [-K * (y[0] - Math.cos(tt))], 0, [0], 1, { rtol: tol, atol: tol }); return { tol, steps: r.hs.length, nfev: r.nfev, err: r.ys[r.ys.length - 1][0] - ex(1) }; });
const RT = S.R('trap', [-100, 0])[0], RB = S.R('beuler', [-100, 0])[0];

export default lesson({
  id: 'st-f.F11.1',
  title: 'Explicit and implicit schemes',
  minutes: 15, difficulty: 3,
  intro: t`A problem is **stiff** when it contains a fast mode that decays almost at once and slow modes you actually want to follow. The fast mode is gone after a moment, but it still sits on the negative real axis at $z = h\lambda_{\text{fast}}$, and an explicit method’s bounded stability region forces $h < 2/\lvert\lambda_{\text{fast}}\rvert$ for ever after. An **implicit** method evaluates the slope at the end of the step, so the new value appears on both sides:

$$y_{n+1} = y_n + h\,f(t_{n+1}, y_{n+1}), \qquad R(z) = \frac{1}{1 - z}$$

That is backward Euler. $\lvert R(z)\rvert \le 1$ on the whole left half-plane (**A-stable**), and $R \to 0$ as $z \to -\infty$ (**L-stable**): a fast mode is simply crushed, whatever the step. The price is an equation to solve every step — a linear system with the matrix $I - hJ$, or a few Newton iterations.`,
  symbols: [
    { tex: 'y_{n+1}', text: 'the new value, unknown on both sides: the step is an equation to solve, not a formula to evaluate' },
    { tex: 'f(t_{n+1}, y_{n+1})', text: 'the slope at the **end** of the step (explicit Euler uses the start)' },
    { tex: 'z = h\\lambda', text: 'step times eigenvalue; for a decaying mode it lies on the negative real axis, far out when the mode is fast' },
    { tex: 'R(z)', text: 'the stability function: one step multiplies the mode by $R$. Here $1/(1 - z)$, below 1 in size for every $z$ with negative real part' },
    { tex: 'J', text: 'the Jacobian $\\partial f/\\partial y$, whose eigenvalues are the $\\lambda$s; Newton’s method for the step solves systems with $I - hJ$' },
  ],
  why: 'Chemical kinetics, combustion, re-entry heating, circuits and semi-discretised heat equations (next lesson) are all stiff; an explicit solver crawls through them at a step set by a mode nobody cares about, while an implicit one strides at the step the physics needs.',
  visual: {
    type: 'num3-stability',
    title: 'One slow mode, one fast mode',
    lead: t`A linear system with eigenvalues $\lambda = -1\ \text{s}^{-1}$ (slow: the behaviour you want) and $\lambda = -1000\ \text{s}^{-1}$ (fast: a transient that dies in milliseconds). Slide the step $h$: both points move out along the negative real axis. An explicit method is stable only while **both** sit in its region.`,
    tasks: [
      'Euler at h = 1 ms: both inside. Push h past 2 ms: the fast mode leaves the disc and the run panel explodes — although that mode was negligible after the first few milliseconds.',
      `RK4 buys only a little: its region reaches ${S.realLimit('rk4').toFixed(3)}, so h < 2.8 ms.`,
      'Switch to backward Euler: its region is everything outside the circle about 1, so any h works. The trapezoid rule is stable too, but watch its |R| for the fast mode creep towards 1 as h grows.',
    ],
    params: { methods: ['euler', 'rk4', 'beuler', 'trap'], method: 'euler', compare: false, z: null, eigs: [[-1, 0], [-1000, 0]], eigLabels: ['slow', 'fast'], h: 0.001, hmin: 0.0001, hmax: 0.5, hunit: 's', x: [-4, 1.5], y: [-2.6, 2.6], n: 40 },
    caption: 'Shaded: the chosen method’s stability region. A point off the left edge is drawn at the edge. The run panel follows the worse of the two modes; the test equation stands in for each eigen-direction of the linear system.',
  },
  example: {
    prompt: t`Integrate $y' = -${K}\,(y - \cos t)$, $y(0) = 0$, to $t = 1$. After a transient of a few milliseconds the solution simply follows $\cos t$. Compare explicit Euler, adaptive Dormand–Prince, backward Euler and the trapezoidal rule.`,
    visual: {
      type: 'graph',
      params: { x: [-0.02, 1.02], y: [-0.9, 1.9], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'y',
        curves: [{ fn: `(${K * K}*cos(x) + ${K}*sin(x))/${K * K + 1} - ${n12((K * K) / (K * K + 1))}*exp(-${K}*x)`, color: 'ink3', width: 3, samples: 2000 }],
        points: [...BE10.path.map(([tt, y]) => ({ x: n12(tt), y: n12(y), r: 5, color: 'accent' })), ...TR10.path.map(([tt, y]) => ({ x: n12(tt), y: n12(y), r: 4, color: 'bad' }))],
        legend: [{ label: 'exact', color: 'ink3' }, { label: 'backward Euler, h = 0.1', color: 'accent', point: true }, { label: 'trapezoid, h = 0.1', color: 'bad', point: true }], legendAt: 'tr' },
      caption: 'Exact solution (grey: a jump from 0 to the cos t curve within milliseconds) and two implicit methods with ten steps. Explicit Euler with ten steps would leave the page after one.',
    },
    steps: [
      { label: 'The two time scales', text: t`$\partial f/\partial y = -${K}$: a mode decaying like $e^{-${K}t}$, gone by $t = 5$ ms. The rest of the solution, $\approx\cos t$, varies on a scale of a second. The ratio of the two, 1000, is the **stiffness**.` },
      { label: 'Explicit Euler', text: t`Stability needs $\lvert1 - ${K}h\rvert \le 1$, so $h \le 0.002$ s — at least 500 steps. With 400 steps ($h = 0.0025$, $\lvert R\rvert = 1.5$) the result at $t = 1$ is $${tex(FE400.y, 2)}$; with 1000 steps the error is $${tex(Math.abs(FE1000.err), 2)}$. The accuracy the slow part needs would allow steps a hundred times longer.` },
      { label: 'Adaptive explicit', text: t`Dormand–Prince takes $${DP[0].steps}$ steps at rtol $10^{-3}$ and $${DP[1].steps}$ at $10^{-6}$: almost the same. **Steps that do not respond to the tolerance are the signature of stiffness** — the controller is pinned at the stability limit (its region reaches $${S.realLimit('dp5').toFixed(2)}$ on the real axis, so $h \lesssim 3.3$ ms).` },
      { label: 'Backward Euler', text: t`Here $f$ is linear in $y$, so the implicit step solves in one line: $y_{n+1} = \dfrac{y_n + ${K}h\cos t_{n+1}}{1 + ${K}h}$. With $h = 0.1$ — ten steps — $R(-100) = ${RB.toFixed(4)}$: the transient is crushed in the first step, and the error at $t = 1$ is $${tex(Math.abs(BE10.err), 2)}$.` },
      { label: 'Trapezoid', text: t`The trapezoidal rule is A-stable and second order, but $R(-100) = \frac{1 - 50}{1 + 50} = ${RT.toFixed(3)}$: the transient flips sign each step and shrinks only 4% per step. The red dots zig-zag about the true curve; at $t = 1$ the error is still $${tex(Math.abs(TR10.err), 2)}$. A-stability is not enough for stiff transients; you want $R(-\infty) = 0$, **L-stability**.` },
      { label: 'The bill', text: t`Each implicit step solves an equation. For a system $y' = f(y)$ of $N$ unknowns that means Newton’s method with the matrix $I - hJ$ — work per step, but hundreds of times fewer steps. Stiff solvers (Radau, BDF, \`solve_ivp(method='Radau')\`) automate exactly this.` },
    ],
    answer: t`Explicit methods are stability-limited to $h \lesssim 2$–$3$ ms ($\gtrsim 300$ steps at any tolerance); backward Euler gets $${tex(Math.abs(BE10.err), 2)}$ with 10 steps; the trapezoid rule rings ($R \approx ${RT.toFixed(2)}$) and errs by $${tex(Math.abs(TR10.err), 2)}$.`,
  },
  practice: [
    num({
      id: 'be-step', difficulty: 2,
      gen(r) {
        const k = r.pick([50, 200, 500]), h = r.pick([0.01, 0.05, 0.1]), y0 = r.pick([0, 20, 80]), g1 = r.pick([300, 350, 400]);
        const ans = (y0 + k * h * g1) / (1 + k * h);
        return {
          prompt: t`A thermocouple’s reading obeys $y' = -${k}\,(y - g)$, relaxing towards the gas temperature $g$ with rate $${k}\ \text{s}^{-1}$. From $y_n = ${y0}$ °C, take one backward Euler step of $h = ${h}$ s, with $g(t_{n+1}) = ${g1}$ °C.`,
          visual: {
            type: 'graph',
            params: { x: [-0.1 * h, 1.15 * h], y: [Math.min(y0, g1) - 30, Math.max(y0, g1) + 40], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'y (°C)',
              curves: [{ fn: `${g1} + ${y0 - g1}*exp(-${k}x)`, color: 'ink3', width: 2.4, domain: [0, 1.15 * h] }],
              hlines: [{ y: g1, color: 'gold', label: 'gas temperature' }], vlines: [{ x: h, color: 'ink4', label: 'h' }], points: [{ x: 0, y: y0, r: 5, color: 'accent' }] },
            caption: 'The exact relaxation (grey) towards the gas temperature, assumed constant over the step.',
          },
          answer: ans, units: '°C', tol: { rel: 0.002 },
          errors: [{ value: y0 + h * -k * (y0 - g1), feedback: 'That is the explicit Euler step, using the slope at the start. Backward Euler uses the slope at the end: solve y₁ = y₀ − kh(y₁ − g).' }],
          hints: [t`Write $y_{n+1} = y_n - ${k}h\,(y_{n+1} - ${g1})$ and solve for $y_{n+1}$.`, t`$y_{n+1} = \dfrac{y_n + ${k}h\cdot${g1}}{1 + ${k}h}$.`],
          teach: 'A backward Euler step is an equation for the new value; for a linear right-hand side it solves in closed form.',
          explain: t`$y_{n+1} = (${y0} + ${k * h}\times${g1})/(1 + ${k * h}) = ${ans.toFixed(2)}$ °C — on the right side of the gas temperature, never past it, for any $h$. Explicit Euler with $kh = ${k * h}$ would give $${(y0 + h * -k * (y0 - g1)).toFixed(1)}$ °C${k * h > 2 ? ', overshooting wildly — unstable' : k * h > 1 ? ', overshooting the gas temperature' : ''}.`,
        };
      },
    }),
    num({
      id: 'explicit-steps', difficulty: 2,
      gen(r) {
        const k = r.pick([2e3, 5e3, 1e4, 4e4]), T = r.pick([10, 60, 300]);
        const ans = (k * T) / 2;
        return {
          prompt: t`A combustion model contains a radical species that relaxes at rate $${tex(k)}\ \text{s}^{-1}$; the burn it describes lasts $${T}$ s. At least how many explicit Euler steps does a stable run need?`,
          visual: { type: 'num3-stability', params: { methods: ['euler'], method: 'euler', z: [-1, 0], drag: false, panels: ['plane'], x: [-3, 1], y: [-1.6, 1.6], controls: false, readout: false },
            caption: 'Euler’s stability region: the disc |1 + z| ≤ 1, meeting the negative real axis at −2.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: k * T, feedback: 'Euler’s disc reaches z = −2, so h may be 2/k, not 1/k.' }],
          hints: [t`Stability: $h \le 2/k$.`, t`Steps $= T/h_{\max} = kT/2$.`],
          teach: 'For an explicit method the fastest decay rate, not the physics you want, sets the minimum number of steps.',
          explain: t`$h \le 2/${tex(k)} = ${tex(2 / k, 2)}$ s, so at least $${tex(ans)}$ steps. The species reaches equilibrium within milliseconds; an implicit method can then take steps set by the slow chemistry.`,
        };
      },
    }),
    mcq({
      id: 'l-stable', difficulty: 3,
      prompt: t`Both backward Euler and the trapezoidal rule are A-stable. On a very stiff transient ($h\lambda = -500$), the trapezoidal solution zig-zags for many steps while backward Euler’s settles at once. Why?`,
      visual: { type: 'num3-stability', params: { methods: ['trap', 'beuler'], method: 'trap', compare: true, z: [-3, 0], drag: true, panels: ['plane', 'run'], x: [-4, 2], y: [-2.4, 2.4], n: 30, controls: false },
        caption: 'Trapezoid region (shaded: the whole left half-plane) and backward Euler’s (outline). Drag z far left and watch the run panel.' },
      choices: [
        t`$R_{\text{trap}}(z) = \frac{1 + z/2}{1 - z/2} \to -1$ as $z \to -\infty$, so a fast mode flips sign each step and barely shrinks; $R_{\text{BE}} = \frac{1}{1 - z} \to 0$`,
        'The trapezoidal rule is only first order',
        'The trapezoidal rule is unstable for real negative z',
        'Backward Euler is more accurate for every problem',
      ],
      answer: 0,
      why: {
        1: 'It is second order — more accurate than backward Euler on smooth parts. The trouble is its behaviour far out on the axis.',
        2: '|R| < 1 there, so it is stable; but |R| → 1, so the decay is slow.',
        3: 'It is first order; on the smooth part of a solution the trapezoid rule is more accurate.',
      },
      hints: ['Evaluate both stability functions at z = −500.', 'Which one tends to zero, and which to −1?'],
      teach: 'L-stability — R(z) → 0 as z → −∞ — is what damps stiff transients in one step; A-stability alone only stops them growing.',
      explain: t`$R_{\text{trap}}(-500) = -249/251 = ${(-249 / 251).toFixed(4)}$: the transient survives as a sign-flipping oscillation for hundreds of steps. $R_{\text{BE}}(-500) = 1/501$. Practical stiff solvers (BDF, Radau IIA) are L-stable or nearly so; Crank–Nicolson’s similar ringing returns in [the next lesson](#/lesson/st-f.F11.2).`,
    }),
    num({
      id: 'trap-R', difficulty: 2,
      gen(r) {
        const hk = r.pick([10, 40, 100, 400]), ans = (1 - hk / 2) / (1 + hk / 2);
        return {
          prompt: t`For the trapezoidal rule, what is $R(z)$ at $z = -${hk}$ (a fast decaying mode with $h\lvert\lambda\rvert = ${hk}$)?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3], y: [-1.1, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'log₁₀(h|λ|)', ylabel: 'R',
              curves: [{ fn: '(1 - 10^x/2)/(1 + 10^x/2)', color: 'bad', width: 2.2, label: 'trapezoid', labelAt: 2.4, labelDy: 14 }, { fn: '1/(1 + 10^x)', color: 'accent', width: 2.2, label: 'backward Euler', labelAt: 2.2, labelDy: -12 }],
              hlines: [{ y: 0, color: 'ink4' }] },
            caption: 'R on the negative real axis against h|λ| (log scale): one tends to −1, the other to 0.',
          },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: 1 / (1 + hk), feedback: 'That is backward Euler’s R. The trapezoid rule has R = (1 + z/2)/(1 − z/2).' }],
          hints: [t`$R = \dfrac{1 + z/2}{1 - z/2}$.`, t`$= \dfrac{1 - ${hk / 2}}{1 + ${hk / 2}}$.`],
          teach: 'The trapezoid rule’s R tends to −1 for very stiff modes: stable, but barely damped.',
          explain: t`$R = ${(1 - hk / 2)}/${1 + hk / 2} = ${ans.toFixed(4)}$. The mode is multiplied by this each step: it alternates in sign and loses only $${((1 - Math.abs(ans)) * 100).toFixed(1)}\%$ per step.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-h', difficulty: 3,
      prompt: t`The system has a slow mode ($\lambda = -1\ \text{s}^{-1}$) and a fast one ($\lambda = -1000\ \text{s}^{-1}$). Set the step to the **largest** value for which RK4 is stable on both.`,
      visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: null, eigs: [[-1, 0], [-1000, 0]], eigLabels: ['slow', 'fast'], h: 0.0005, hmin: 0.0001, hmax: 0.01, hunit: 's', x: [-4, 1.5], y: [-2.6, 2.6], n: 40, controls: ['h'], hide: ['verdict'] } },
      param: 'h', answer: [0.00262, 0.00279],
      instruction: 'Move the step slider to the stability limit, then check.',
      hints: ['The fast mode is the one that leaves the region first.', t`RK4 meets the real axis at $z = -2.785$, so $h_{\max} = 2.785/1000$ s.`],
      teach: 'An explicit method’s step limit is set by the eigenvalue that reaches the region’s edge first — the fastest one.',
      explain: t`$h_{\max} = ${S.realLimit('rk4').toFixed(4)}/1000 = ${(S.realLimit('rk4') / 1000).toFixed(5)}$ s. The slow mode would allow nearly 3 s.`,
    },
    code({
      id: 'stiff-be', difficulty: 3,
      prompt: t`Write \`backward_euler(k, n)\` and \`forward_euler(k, n)\` for $y' = -k\,(y - \cos t)$, $y(0) = 0$, each taking $n$ equal steps to $t = 1$ and returning $y(1)$. The program compares them with the exact solution for $k = 1000$ and $n = 10$ and $n = 100$.`,
      starter: t`import numpy as np

def exact(k, t):
    return (k * k * np.cos(t) + k * np.sin(t)) / (k * k + 1) - k * k / (k * k + 1) * np.exp(-k * t)

def forward_euler(k, n):
    h, y = 1.0 / n, 0.0
    for i in range(n):
        pass   # slope at the start of the step
    return y

def backward_euler(k, n):
    h, y = 1.0 / n, 0.0
    for i in range(n):
        pass   # solve y_new = y + h * (-k) * (y_new - cos(t_new)) for y_new
    return y

for n in (10, 100):
    print(n, abs(backward_euler(1000, n) - exact(1000, 1)), abs(forward_euler(1000, n) - exact(1000, 1)))
`,
      answer: t`import numpy as np

def exact(k, t):
    return (k * k * np.cos(t) + k * np.sin(t)) / (k * k + 1) - k * k / (k * k + 1) * np.exp(-k * t)

def forward_euler(k, n):
    h, y = 1.0 / n, 0.0
    for i in range(n):
        y = y + h * (-k) * (y - np.cos(i * h))
    return y

def backward_euler(k, n):
    h, y = 1.0 / n, 0.0
    for i in range(n):
        t1 = (i + 1) * h
        y = (y + k * h * np.cos(t1)) / (1 + k * h)
    return y

for n in (10, 100):
    print(n, abs(backward_euler(1000, n) - exact(1000, 1)), abs(forward_euler(1000, n) - exact(1000, 1)))`,
      tests: [
        { name: t`backward Euler with 10 steps is within $10^{-4}$ of the exact $y(1)$`, code: 'abs(backward_euler(1000, 10) - exact(1000, 1)) < 1e-4' },
        { name: 'forward Euler with 100 steps has blown up (error above 10¹⁰)', code: 'abs(forward_euler(1000, 100) - exact(1000, 1)) > 1e10' },
        { name: 'on a non-stiff problem (k = 1) both agree to within 0.01 with 100 steps', code: 'abs(backward_euler(1, 100) - forward_euler(1, 100)) < 0.01' },
      ],
      hints: ['Forward: y = y + h·(−k)·(y − cos(i·h)).', 'Backward: with t₁ = (i + 1)h, y = (y + k·h·cos t₁)/(1 + k·h).'],
      teach: 'For a stiff linear problem the implicit step is one division — and it is stable at any step.',
      explain: t`Backward Euler errs by $${tex(Math.abs(BE10.err), 2)}$ with 10 steps and $${tex(Math.abs(BE100.err), 2)}$ with 100 (first order). Forward Euler with 100 steps has $\lvert R\rvert = 9$ per step and overflows towards $10^{95}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thermocouple', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([2, 5, 10]) * 1e-3, T = r.pick([200, 400, 600]), hacc = r.pick([0.5, 1, 2]);
        const nexp = T / (2 * tau), nimp = T / hacc, ans = nexp / nimp;
        return {
          prompt: t`A re-entry simulation models a thermocouple bead with time constant $\tau = ${tau * 1e3}$ ms (rate $1/\tau$) over a $${T}$ s trajectory. The slow trajectory physics needs steps of about $${hacc}$ s for accuracy. How many times more steps does explicit Euler need than backward Euler?`,
          visual: {
            type: 'graph',
            params: { x: [0, 0.08], y: [-0.05, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'reading (normalised)',
              curves: [{ fn: `1 - exp(-x/${tau})`, color: 'accent', width: 2.2 }] },
            caption: 'The bead’s response to a step in gas temperature: settled within a few τ — milliseconds, against a trajectory of minutes.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (T / tau) / nimp, feedback: 'Euler’s stability limit is h = 2τ (the disc reaches −2), not τ.' }],
          hints: [t`Explicit: $h \le 2\tau$, so $T/(2\tau)$ steps.`, t`Implicit: $T/${hacc}$ steps. Take the ratio.`],
          teach: 'The cost of an explicit method on a stiff problem is the stiffness ratio: slow time scale over fast.',
          explain: t`Explicit: $${tex(nexp)}$ steps; implicit: $${tex(nimp)}$; ratio $${tex(ans)}$ — the implicit method pays for one small solve per step and still wins by orders of magnitude.`,
        };
      },
    }),
    mcq({
      id: 'cp-robertson', difficulty: 2, transfer: true,
      prompt: t`Robertson’s classic chemical-kinetics test has rate constants $0.04$, $3\times10^{7}$ and $10^{4}$ (in consistent units) and is integrated to $t = 10^{5}$. An explicit adaptive solver grinds through millions of steps. Why, and what should be used?`,
      visual: {
        type: 'graph',
        params: { x: [-2, 8], y: [-0.5, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'log₁₀(rate constant)', ylabel: '', yticks: 0,
          points: [[0.04, 'k₁'], [3e7, 'k₂'], [1e4, 'k₃']].map(([k, l]) => ({ x: n12(Math.log10(k)), y: 0.5, r: 6, color: 'gold', label: l, labelDy: -14 })) },
        caption: 'The three rate constants on a log scale: nine decades apart.',
      },
      choices: [
        'The Jacobian has eigenvalues spread over many decades; the fastest caps an explicit step even after its species equilibrates, so an L-stable implicit method (BDF, Radau) is needed',
        'The equations are chaotic, so no method can integrate them',
        'The tolerance is too tight; loosening it would fix the step count',
        'Explicit methods cannot handle three equations at once',
      ],
      answer: 0,
      why: {
        1: 'Its solutions are smooth and monotone; the difficulty is stability, not sensitivity.',
        2: 'A stiff problem’s step count barely responds to the tolerance — the step is pinned at the stability limit.',
        3: 'Explicit methods handle any number of equations; the trouble is the spread of time scales.',
      },
      hints: ['How far apart are the rate constants?', 'What sets an explicit method’s step after the fast transient has died?'],
      teach: 'Widely separated rate constants make a kinetics problem stiff; the cure is an implicit, L-stable method with a Jacobian.',
      explain: t`Rates spanning nine decades put Jacobian eigenvalues of size up to about $10^{4}$ on the negative axis for the whole run, so an explicit method needs steps below about $10^{-4}$ over $t = 10^5$: around a billion. BDF or Radau, via \`solve_ivp(method='BDF')\` with the Jacobian supplied, does it in a few hundred steps.`,
    }),
    num({
      id: 'cp-damp', difficulty: 2,
      gen(r) {
        const z = r.pick([5, 20, 100]), target = r.pick([6, 9]);
        const ans = Math.ceil(target / Math.log10(1 + z));
        return {
          prompt: t`Backward Euler multiplies a fast mode by $R = 1/(1 - z)$ each step. With $z = h\lambda = -${z}$, how many steps until a transient has shrunk by a factor $10^{${target}}$?`,
          visual: { type: 'num3-stability', params: { methods: ['beuler'], method: 'beuler', z: [-z, 0], drag: false, panels: ['run'], n: 12, controls: false, readout: false },
            caption: 'The transient’s size step by step (log scale): dots, backward Euler; line, the exact decay.' },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.ceil(target / Math.log10(z)), feedback: 'Use |R| = 1/(1 + z), not 1/z.' }].filter((e) => e.value !== ans),
          hints: [t`$\lvert R\rvert = 1/${1 + z}$ per step.`, t`Need $${1 + z}^n \ge 10^{${target}}$: $n = \lceil ${target}/\log_{10}${1 + z}\rceil$.`],
          teach: 'An L-stable method damps a stiff transient geometrically, more strongly the larger the step.',
          explain: t`$\log_{10}${1 + z} = ${Math.log10(1 + z).toFixed(3)}$, so $n = \lceil ${(target / Math.log10(1 + z)).toFixed(2)}\rceil = ${ans}$ steps. (The exact transient decays far faster, like $e^{-${z}}$ per step; what matters is that the numerical one decays at all.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hairer & Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed. (Springer 1996), ch. IV', url: 'https://doi.org/10.1007/978-3-642-05221-7' },
    { label: 'LeVeque, Finite Difference Methods for ODEs and PDEs (SIAM 2007), ch. 8: stiff ODEs', url: 'https://faculty.washington.edu/rjl/fdmbook/' },
    { label: 'Robertson (1966), The solution of a set of reaction rate equations, in Numerical Analysis: An Introduction (Academic Press)', url: 'https://www.worldcat.org/title/numerical-analysis-an-introduction/oclc/1171306' },
  ],
});
