// Hadamard's criteria: a problem is well-posed if a solution exists, is
// unique, and depends continuously on the data — ‖u(t)‖ ≤ C e^(αt)‖u(0)‖ with
// C and α the same for all data. Growth is allowed; growth that gets worse
// without bound as the wavenumber rises is not. Hadamard's example (Laplace's
// Cauchy problem: data sin(nx)/n² → 0, solution sinh(ny)/n³ → ∞), the backward
// heat equation (B4.3, B6.2) named and computed, the Kuramoto–Sivashinsky
// counterpoint, regularization by truncation, and inverse heat conduction.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { LI900, SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const HAD = { n: 20 };
HAD.data = 1 / HAD.n ** 2;
HAD.amp = Math.sinh(HAD.n) / HAD.n ** 3;
// the noise amplifier: sin x plus fixed pseudo-random ripples of size 10^(−E) in modes 2…40
const coef = 'step(1.5 - k) + step(k - 1.5)*10^(-E)*sin(1.7*k^2 + 3.1*k)';
const amplifier = {
  type: 'graph',
  title: 'A noise amplifier',
  lead: t`Smooth data, $\sin x$, with a little noise: ripples of size $\varepsilon$ in the modes $\sin 2x$ to $\sin 40x$. Run the forward heat equation, the backward heat equation, or Laplace’s equation marched upward from the data — and watch what happens to the noise.`,
  tasks: [
    t`Forward heat: the ripples vanish almost at once and $\sin x$ barely changes. Small errors in, smaller errors out.`,
    t`Backward heat: by $t = 0.01$ the finest ripple has grown $e^{16}$-fold ($9\times10^{6}$) and buries $\sin x$. Lower the noise a hundredfold: the blow-up is only delayed, never prevented.`,
    t`Laplace upward: with data $u$ and $u_y = 0$ on $y = 0$, every mode grows as $\cosh ny$ — Hadamard’s example. The readout shows the finest ripple’s growth factor.`,
  ],
  params: {
    x: [0, 3.1416], y: [-2.5, 2.5], aspect: 'wide', xlabel: 'x', ylabel: 'u', axesAt: 'edge',
    choices: [{ key: 'eq', label: 'Equation', options: [[0, 'forward heat, $u_t = u_{xx}$'], [1, 'backward heat, $u_t = -u_{xx}$'], [2, 'Laplace, marched in $y$']], value: 1, explain: 'The same noisy data, three different questions.' }],
    sliders: [
      { key: 'tm', label: 'Time $t$ (heat)', min: 0, max: 20, step: 0.5, value: 9, unit: '\\times10^{-3}', explain: 'How long the heat equation runs, forward or backward, in thousandths of a time unit.' },
      { key: 'hy', label: 'Height $y$ (Laplace)', min: 0, max: 1, step: 0.02, value: 0.3, explain: 'How far above the data line Laplace’s equation is marched.' },
      { key: 'E', label: 'Noise exponent $E$', min: 2, max: 10, step: 1, value: 6, explain: 'Each ripple in the data has size $\\varepsilon = 10^{-E}$: $E = 6$ is a part per million.' },
    ],
    curves: [
      { fn: 'sin(x)', color: 'ink3', width: 1.4, dash: [5, 4] },
      { sum: `(${coef})*sin(k*x)*e^(-k^2*tm/1000)`, k: [1, 40], color: 'accent', width: 2.2, when: 'step(0.5 - abs(eq))' },
      { sum: `(${coef})*sin(k*x)*e^(k^2*tm/1000)`, k: [1, 40], color: 'warn', width: 2.2, when: 'step(0.5 - abs(eq - 1))' },
      { sum: `(${coef})*sin(k*x)*cosh(k*hy)`, k: [1, 40], color: 'violet', width: 2.2, when: 'step(0.5 - abs(eq - 2))' },
    ],
    readouts: [
      { label: 'growth of the finest ripple (n = 40)', expr: 'step(0.5 - abs(eq))*e^(-1.6*tm) + step(0.5 - abs(eq - 1))*e^(1.6*tm) + step(0.5 - abs(eq - 2))*cosh(40*hy)', digits: 3, zero: 0 },
      { label: 'its size now', expr: '10^(-E)*(step(0.5 - abs(eq))*e^(-1.6*tm) + step(0.5 - abs(eq - 1))*e^(1.6*tm) + step(0.5 - abs(eq - 2))*cosh(40*hy))', digits: 3, zero: 0 },
    ],
  },
  caption: t`Exact mode-by-mode solutions on $0 \le x \le \pi$ with $u = 0$ at the ends; dashed: the clean $\sin x$. The noise has fixed pseudo-random signs and equal sizes. Curves leaving the frame are clipped; their true size is in the readout.`,
};

export default lesson({
  id: 'st-b.B12.1',
  title: 'Hadamard’s criteria',
  minutes: 15, difficulty: 3,
  intro: t`In 1902 Jacques Hadamard asked what makes a PDE problem a sensible model of the world. His answer: it is **well-posed** if

1. a solution **exists**,
2. it is **unique**, and
3. it **depends continuously on the data** — small changes in the data make small changes in the solution.

The third is the one that bites. Every measurement has errors, and every computer rounds; if errors of $10^{-16}$ can grow without limit, the model predicts nothing. For an evolution equation the condition reads

$$\|u(t)\| \le C\,e^{\alpha t}\,\|u(0)\| ,$$

with constants $C$ and $\alpha$ that are the **same for all data**. Growth is allowed — a rocket’s instabilities grow — but it must not get worse without limit for finer and finer detail.`,
  symbols: [
    { tex: t`\|u(t)\|`, text: 'the size of the solution at time $t$: for instance $\\sqrt{\\int u^2\\,dx}$ (the energy-like norm of lesson B6.2)' },
    { tex: 'C', text: 'a fixed constant (no units): how much the solution can exceed its data at the start' },
    { tex: t`\alpha`, text: 'a fixed growth rate (1/s), allowed to be positive — but the same for every initial profile' },
    { tex: 'u(0)', text: 'the data: the initial profile (or, for a Cauchy problem in space, the values on the starting line)' },
  ],
  why: t`Numerical relativity hit this wall for decades: some ways of writing Einstein’s equations, though correct, are not well-posed as evolution systems, and simulations of them crashed however fine the grid. The next lesson shows the subtler way that happens.`,
  visual: amplifier,
  example: {
    prompt: t`**Hadamard’s example.** Solve Laplace’s equation $u_{xx} + u_{yy} = 0$ for $y > 0$ as an initial-value problem in $y$: $u(x, 0) = 0$, $u_y(x, 0) = \sin(nx)/n^2$. How big is the data, and how big is $u$ at $y = 1$, for $n = ${HAD.n}$?`,
    visual: { type: 'graph', params: { x: [0, 1], y: [-6, 5.5], ylog: true, aspect: 'wide', xlabel: 'height y', ylabel: 'amplitude', axesAt: 'edge', curves: [{ fn: `log10(max(1e-12, sinh(${HAD.n}*x)/${HAD.n ** 3}))`, color: 'warn', width: 2.4, domain: [0.002, 1], label: 'amplitude of u at height y', labelAt: 0.45, labelDy: -12 }], hlines: [{ y: Math.log10(HAD.data), label: 'size of the data', color: 'accent' }], points: [{ x: 1, y: Math.log10(HAD.amp), color: 'gold', label: `${r3(HAD.amp)}`, labelDx: -46 }] }, caption: t`The amplitude $\sinh(${HAD.n}y)/${HAD.n ** 3}$ of the solution against height, on a logarithmic scale, with the size of the data (blue) for comparison.` },
    steps: [
      { label: 'Separate', text: t`Try $u = \sin(nx)\,Y(y)$: $-n^2Y + Y'' = 0$, so $Y = a\cosh ny + b\sinh ny$. The data $Y(0) = 0$, $Y'(0) = 1/n^2$ give $Y = \sinh(ny)/n^3$.` },
      { label: 'The solution', text: t`$u = \dfrac{\sin(nx)\,\sinh(ny)}{n^3}$ — it exists, and it is the only one (the Cauchy–Kovalevskaya and Holmgren theorems guarantee both for data like these).` },
      { label: 'The data shrink', text: t`The data are of size $1/n^2 = ${tex(HAD.data)}$ for $n = ${HAD.n}$ (and even their slope, $\cos(nx)/n$, is small). As $n \to \infty$ they tend to zero, the data of the solution $u = 0$.` },
      { label: 'The solution explodes', text: t`At $y = 1$ the amplitude is $\sinh(${HAD.n})/${HAD.n}^3 = ${tex(HAD.amp)}$ — and $\sinh(n)/n^3 \to \infty$. Data that approach those of $u = 0$ give solutions that run away from it.` },
      { label: 'Verdict', text: t`Existence ✓, uniqueness ✓, continuous dependence ✗: **ill-posed**. Elliptic equations want boundary data all round (lesson B10.2); asked to march, they amplify each mode by $e^{ny}$, the finest most. The backward heat equation fails the same way, with $e^{n^2t}$ (lessons B4.3, B6.2).` },
    ],
    answer: t`$u = \sin(nx)\sinh(ny)/n^3$. For $n = ${HAD.n}$ the data have size $${tex(HAD.data)}$ but the solution at $y = 1$ has amplitude $${tex(HAD.amp)}$: no continuous dependence, so the problem is ill-posed.`,
  },
  practice: [
    multi({
      id: 'criteria', difficulty: 1,
      prompt: t`Which of these are among Hadamard’s three conditions for a well-posed problem? (Select all that apply.)`,
      visual: { type: 'graph', params: { x: [0, 3.1416], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x', ylabel: 'u', axesAt: 'edge', curves: [{ fn: 'sin(x)', color: 'accent', width: 2.2 }, { fn: 'sin(x) + 0.08*sin(23*x)', color: 'warn', width: 1.2 }] }, caption: 'Two nearly equal sets of data. In a well-posed problem their solutions stay nearly equal, at least for a while.' },
      choices: ['a solution exists', 'the solution is unique', 'the solution depends continuously on the data', 'the solution is smooth', 'the solution stays bounded for all time'],
      answer: [0, 1, 2],
      why: {
        3: 'Shocks (module B11) and waves with corners are fine: a well-posed problem may have rough solutions.',
        4: t`Growth is allowed: $\|u(t)\| \le Ce^{\alpha t}\|u(0)\|$ with $\alpha > 0$ still counts — unstable physics can be well-posed.`,
      },
      hints: ['Two of them are about whether there is an answer at all; the third is about how it reacts to errors.'],
      teach: 'Well-posed: existence, uniqueness and continuous dependence on the data — nothing about smoothness or boundedness.',
      explain: t`Existence, uniqueness, continuous dependence. Smoothness is not required, and growth is allowed as long as its rate does not depend on how fine the data’s detail is.`,
    }),
    num({
      id: 'hadamard-amp', difficulty: 2,
      gen(r) {
        const n = r.pick([10, 15, 30]), y = r.pick([0.5, 1, 2]);
        const A = Math.sinh(n * y) / n ** 3;
        return {
          prompt: t`In Hadamard’s example the data $u(x, 0) = 0$, $u_y(x, 0) = \sin(nx)/n^2$ give $u = \sin(nx)\sinh(ny)/n^3$. For $n = ${n}$, what is the amplitude of $u$ at height $y = ${y}$, compared with the data’s amplitude $1/n^2$? Give the ratio.`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-6, 25], ylog: true, aspect: 'wide', xlabel: 'height y', ylabel: 'amplitude', axesAt: 'edge', curves: [{ fn: `log10(max(1e-12, sinh(${n}*x)/${n ** 3}))`, color: 'warn', width: 2.4, domain: [0.002, 2] }], hlines: [{ y: Math.log10(1 / n ** 2), label: 'data', color: 'accent' }], vlines: [{ x: y, color: 'gold' }] }, caption: 'The solution’s amplitude against height (log scale) and the data’s size.' },
          answer: (A * n * n), tol: { rel: 0.01 },
          errors: [{ value: A, feedback: t`That is the amplitude itself; divide by the data’s size $1/n^2$.` }, { value: Math.exp(n * y) / n, feedback: t`Close for large $ny$, but $\sinh(ny) = \tfrac12(e^{ny} - e^{-ny})$: keep the ½.` }].filter((e) => Math.abs(e.value - A * n * n) > 0.02 * A * n * n),
          hints: [t`Ratio $= \dfrac{\sinh(ny)/n^3}{1/n^2} = \dfrac{\sinh(ny)}{n}$.`],
          teach: 'Marching an elliptic equation multiplies a mode of wavenumber n by about e^(ny)/2: finer data, faster explosion.',
          explain: t`$\sinh(${n * y})/${n} = ${tex(A * n * n)}$. Double $n$ and the ratio roughly squares: no single constant bounds it for all data.`,
        };
      },
    }),
    num({
      id: 'ks-growth', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4]);
        const smax = (a * a) / (4 * b), kstar = Math.sqrt(a / (2 * b));
        const ca = a === 1 ? '' : a, cb = b === 1 ? '' : b;
        return {
          prompt: t`The linear part of the Kuramoto–Sivashinsky equation, a model of wrinkling flame fronts, is $u_t = -${a === 1 ? '' : a}u_{xx} - ${b === 1 ? '' : b}u_{xxxx}$. A mode $e^{ikx}$ grows as $e^{\sigma(k)t}$. Find the **largest** growth rate $\sigma$ over all $k$, in 1/s.`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1.6, 2.4], aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'growth rate σ', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: `${a}*x^2 - ${b}*x^4`, color: 'accent', width: 2.4, label: 'this equation', labelAt: 0.25, labelDy: -14 }, { fn: 'x^2', color: 'warn', width: 1.6, dash: [5, 4], label: 'backward heat: k²', labelAt: 1.3, labelDy: -10 }], hlines: [{ y: 0, color: 'ink3' }] }, caption: 'Growth rate against wavenumber: one curve turns down and stays bounded; the other climbs for ever.' },
          answer: smax, units: '1/s', tol: { rel: 0.005 },
          errors: [{ value: a * kstar * kstar, feedback: t`That is the $ak^2$ term alone at the peak; subtract $bk^4$ too.` }, { value: kstar, feedback: 'That is the wavenumber of fastest growth, not the rate.' }].filter((e) => Math.abs(e.value - smax) > 0.01 * smax),
          hints: [t`Substitute $e^{ikx}$: $u_{xx} \to -k^2u$, $u_{xxxx} \to k^4u$, so $\sigma = ${ca}k^2 - ${cb}k^4$.`, t`Maximize over $k^2$: $d\sigma/d(k^2) = ${a} - ${2 * b}k^2 = 0$.`, t`$\sigma_{\max} = a^2/(4b)$.`],
          teach: 'Growth that is bounded over all wavenumbers is allowed: an unstable equation can still be well-posed.',
          explain: t`$\sigma(k) = ${ca}k^2 - ${cb}k^4$ peaks at $k^2 = ${r3(a / (2 * b))}$ with $\sigma_{\max} = ${a}^2/(4\times${b}) = ${r3(smax)}$ s⁻¹. Long waves grow — the flame wrinkles — but short ones are damped by the fourth derivative, so $\|u(t)\| \le e^{${r3(smax)}t}\|u(0)\|$ for **all** data: **well-posed**. The backward heat equation has $\sigma = k^2$, with no ceiling: ill-posed.`,
        };
      },
    }),
    mcq({
      id: 'growth-allowed', difficulty: 2,
      prompt: t`A reacting mixture obeys $u_t = u_{xx} + 5u$: diffusion plus a reaction that multiplies $u$ by $e^{5t}$. Is the initial-value problem well-posed?`,
      visual: { type: 'graph', params: { x: [0, 6], y: [-30, 8], aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'growth rate', axesAt: 'edge', curves: [{ fn: '5 - x^2', color: 'accent', width: 2.4 }], hlines: [{ y: 5, label: 'never above 5', color: 'gold' }, { y: 0, color: 'ink3' }] }, caption: 'The growth rate 5 − k² of each Fourier mode.' },
      choices: [t`Yes: every mode grows at most like $e^{5t}$, the same bound for all data`, 'No: any growing solution violates continuous dependence', 'No: the reaction term makes the equation nonlinear', 'Only if the initial data are smooth'],
      answer: 0,
      why: {
        1: t`Hadamard allows growth: $\|u(t)\| \le e^{5t}\|u(0)\|$ — errors grow, but by a factor you can name in advance.`,
        2: t`$5u$ is linear in $u$; the equation is linear.`,
        3: 'The bound holds for all square-integrable data; smoothness is not needed.',
      },
      hints: [t`For $e^{ikx}$, $\sigma = 5 - k^2$. Is it bounded above?`],
      teach: 'Well-posedness forbids growth that depends on the fineness of the data, not growth itself.',
      explain: t`$\sigma(k) = 5 - k^2 \le 5$ for all $k$, so errors grow at most like $e^{5t}$: well-posed. Physics is full of genuine instabilities (combustion, buckling, Rayleigh–Taylor), and their models are well-posed as long as the growth rate is bounded.`,
    }),
    mcq({
      id: 'exists-unique', difficulty: 2, kind: 'error',
      prompt: t`An engineer argues: “Laplace’s equation with $u$ and $u_y$ given on the line $y = 0$ has a solution and it is unique, so we can march it upward numerically from measured data.” What is the flaw?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-6, 5.5], ylog: true, aspect: 'wide', xlabel: 'height y', ylabel: 'amplitude', axesAt: 'edge', curves: [{ fn: 'log10(max(1e-12, sinh(10*x)/1000))', color: 'accent', width: 2, label: 'n = 10', labelAt: 0.9, labelDy: 14 }, { fn: 'log10(max(1e-12, sinh(20*x)/8000))', color: 'warn', width: 2, label: 'n = 20', labelAt: 0.75, labelDy: -12 }, { fn: 'log10(max(1e-12, sinh(30*x)/27000))', color: 'bad', width: 2, label: 'n = 30', labelAt: 0.55, labelDy: -12 }] }, caption: 'Amplitude against height in Hadamard’s example for three wavenumbers (log scale): the finer the data, the faster the growth.' },
      choices: ['Continuous dependence fails: measurement errors in fine detail grow like e^(ny), so the computed answer is noise', 'The solution does not really exist', 'The solution is not unique after all', 'Nothing: marching works for any equation with a unique solution'],
      answer: 0,
      why: {
        1: 'For analytic data it exists (Cauchy–Kovalevskaya); existence is not the problem.',
        2: 'It is unique too. That is exactly what makes the argument tempting.',
        3: 'Existence and uniqueness are two of three conditions; the third decides whether data with errors give a usable answer.',
      },
      hints: ['Measured data always contain small errors at every wavenumber. What does the equation do to them?'],
      teach: 'Existence and uniqueness are not enough: without continuous dependence, small errors in the data destroy the answer.',
      explain: t`Any error of wavenumber $n$ grows like $\sinh(ny)/n$. Real data contain errors at every $n$ (and a computer adds round-off), so the marched solution is dominated by amplified noise. “Exists and unique, therefore fine” is the classic trap; continuous dependence is the hard part.`,
    }),
    code({
      id: 'backward-recover', difficulty: 3,
      prompt: t`Try to recover the past by running the heat equation backward. On $0 \le x \le \pi$ (ends at 0) the true initial profile is $f = \sin x + 0.5\sin 3x$. At $T = 0.1$ the temperature is measured at 200 points with noise of size $10^{-6}$. Its sine coefficients $c_n$ come from \`c = 2/(M+1) * S.T @ data\`, where \`S[i, n-1]\` $= \sin(nx_i)$. Undo the decay mode by mode, $c_n e^{n^2T}$, keeping only the first \`N\` modes. Write \`recover(N)\`, and fill \`errs\` with the largest error against $f$ for $N = 3, 5, 10, 15, 20$.`,
      starter: t`import numpy as np

M, T = 200, 0.1
x = np.arange(1, M + 1) * np.pi / (M + 1)
f = np.sin(x) + 0.5 * np.sin(3 * x)
rng = np.random.default_rng(1)
data = np.exp(-T) * np.sin(x) + 0.5 * np.exp(-9 * T) * np.sin(3 * x) + 1e-6 * rng.standard_normal(M)

n = np.arange(1, M + 1)
S = np.sin(np.outer(x, n))
c = 2 / (M + 1) * S.T @ data

def recover(N):
    pass

errs = {}
print(errs)
`,
      answer: t`import numpy as np

M, T = 200, 0.1
x = np.arange(1, M + 1) * np.pi / (M + 1)
f = np.sin(x) + 0.5 * np.sin(3 * x)
rng = np.random.default_rng(1)
data = np.exp(-T) * np.sin(x) + 0.5 * np.exp(-9 * T) * np.sin(3 * x) + 1e-6 * rng.standard_normal(M)

n = np.arange(1, M + 1)
S = np.sin(np.outer(x, n))
c = 2 / (M + 1) * S.T @ data

def recover(N):
    return S[:, :N] @ (c[:N] * np.exp(n[:N]**2 * T))

errs = {N: np.max(np.abs(recover(N) - f)) for N in [3, 5, 10, 15, 20]}
print(errs)`,
      tests: [
        { name: t`with 5 modes the past is recovered to better than $10^{-5}$`, code: 'len(errs) == 5 and errs[5] < 1e-5' },
        { name: 'with 15 modes the error exceeds 100: the amplified noise has taken over', code: 'errs[15] > 100' },
        { name: 'from N = 5 on, every extra mode makes things worse', code: 'errs[5] < errs[10] < errs[15] < errs[20]' },
      ],
      hints: ['`recover(N)` multiplies the first N coefficients by `np.exp(n[:N]**2 * T)` and adds the sines back up with `S[:, :N] @ (…)`.', 'Then `errs = {N: np.max(np.abs(recover(N) - f)) for N in [3, 5, 10, 15, 20]}`.'],
      teach: 'Backward heat amplifies a noise of size ε in mode n to ε e^(n²T): keeping only the modes the noise cannot swamp — truncation — is the simplest regularization.',
      explain: t`The errors come out near $1.5\times10^{-7}$, $1.1\times10^{-6}$, $9\times10^{-4}$, $3\times10^{2}$ and $1.5\times10^{10}$. Mode 15 multiplies its $10^{-7}$-sized noise coefficient by $e^{22.5} \approx 6\times10^{9}$. The cure is not a better computer but a better question: give up the fine detail (truncate, or smooth — Tikhonov regularization) and recover what the data can actually support.`,
    }),
    code({
      id: 'march-laplace', difficulty: 3,
      prompt: t`March a second-order equation upward in $y$ from almost-zero data, on a periodic grid of $N = 64$ points in $x \in [0, 2\pi)$ with $\Delta y = 0.5\,\Delta x$:

$$u^{j+1}_i = 2u^j_i - u^{j-1}_i + \sigma\Big(\frac{\Delta y}{\Delta x}\Big)^2\big(u^j_{i+1} - 2u^j_i + u^j_{i-1}\big).$$

With $\sigma = +1$ this is the wave equation $u_{yy} = u_{xx}$; with $\sigma = -1$ it is Laplace’s equation $u_{yy} = -u_{xx}$. Start from $u^0 = 0$ and $u^1 = \Delta y\,g$, where $g$ is noise of size $10^{-10}$, and take 40 steps. Write \`march(sigma)\` returning the largest $|u|$ at the end; store \`wave\` and \`laplace\`.`,
      starter: t`import numpy as np

N = 64
dx = 2 * np.pi / N
dy = 0.5 * dx
g = 1e-10 * np.random.default_rng(2).standard_normal(N)

def march(sigma):
    prev, cur = np.zeros(N), dy * g
    # 40 steps of the update; np.roll(cur, -1) and np.roll(cur, 1) are the neighbours
    return np.max(np.abs(cur))

wave = None
laplace = None
print(wave, laplace)
`,
      answer: t`import numpy as np

N = 64
dx = 2 * np.pi / N
dy = 0.5 * dx
g = 1e-10 * np.random.default_rng(2).standard_normal(N)

def march(sigma):
    prev, cur = np.zeros(N), dy * g
    for step in range(40):
        lap = np.roll(cur, -1) - 2 * cur + np.roll(cur, 1)
        prev, cur = cur, 2 * cur - prev + sigma * (dy / dx)**2 * lap
    return np.max(np.abs(cur))

wave = march(+1)
laplace = march(-1)
print(wave, laplace)`,
      tests: [
        { name: t`the wave equation keeps the noise below $10^{-9}$`, code: 'wave is not None and wave < 1e-9' },
        { name: 'Laplace’s equation amplifies the same noise more than ten-trillion-fold', code: 'laplace is not None and laplace > 1e3' },
      ],
      hints: ['Inside the loop: `lap = np.roll(cur, -1) - 2*cur + np.roll(cur, 1)`.', 'Then `prev, cur = cur, 2*cur - prev + sigma*(dy/dx)**2*lap` — the tuple assignment uses the old `cur` on the right.', '`wave = march(+1)` and `laplace = march(-1)`.'],
      teach: 'The same marching code is stable for the hyperbolic equation and explosive for the elliptic one: the sign decides the type, and the type decides the question.',
      explain: t`The wave equation ends near $3.5\times10^{-11}$ — the noise just travels about. Laplace’s equation ends near $1.8\times10^{5}$ from noise of $10^{-10}$: the grid’s finest mode grows by up to $(3 + \sqrt5)/2 \approx 2.6$ every step, some $5\times10^{16}$ over 40 steps. Refining the grid makes it worse, not better: finer grids carry higher wavenumbers, which grow faster — Hadamard’s $e^{ny}$, on a computer.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-heat-shield', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([10, 30, 60]), xcm = r.pick([0.5, 1]);
        const delta = Math.sqrt((LI900.alpha * P) / Math.PI), x = xcm / 100, amp = Math.exp(x / delta);
        return {
          prompt: t`A thermocouple sits ${xcm} cm deep in a silica heat-shield tile ($\alpha = ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$). A surface temperature that oscillates with period $P = ${P}$ s reaches it damped by $e^{-x/\delta}$, with $\delta = \sqrt{2\alpha/\omega} = \sqrt{\alpha P/\pi}$. Reconstructing the surface history from the thermocouple undoes that damping. By what factor does it amplify the thermocouple’s noise at that period?`,
          visual: { type: 'graph', params: { x: [0, 1.2], y: [-0.05, 1.1], aspect: 'wide', xlabel: 'depth (cm)', ylabel: 'relative amplitude', axesAt: 'edge', curves: [{ fn: `e^(-x/${(delta * 100).toFixed(5)})`, color: 'accent', width: 2.4 }], vlines: [{ x: xcm, label: 'thermocouple', color: 'gold' }] }, caption: t`How a surface oscillation of period ${P} s fades with depth in the tile (constant properties assumed; real tile conductivity rises when hot).` },
          answer: amp, tol: { rel: 0.01 },
          errors: [{ value: x / delta, feedback: t`That is the exponent $x/\delta$; the factor is $e^{x/\delta}$.` }, { value: Math.exp(x / Math.sqrt(LI900.alpha * P)), feedback: t`$\delta = \sqrt{\alpha P/\pi}$: keep the $\pi$.` }].filter((e) => Math.abs(e.value - amp) > 0.02 * amp),
          hints: [t`$\delta = \sqrt{\alpha P/\pi}$ — work it out in metres.`, t`The amplification is $e^{x/\delta}$ with $x = ${x}$ m.`],
          teach: 'Inverse heat conduction amplifies noise at period P by e^(x/δ), δ = √(αP/π): fast surface changes cannot be recovered from deep sensors.',
          explain: t`$\delta = \sqrt{${tex(LI900.alpha)}\times${P}/\pi} = ${tex(delta)}$ m, so $x/\delta = ${r3(x / delta)}$ and the factor is $e^{${r3(x / delta)}} \approx ${r3(amp)}$. Shorter periods are amplified enormously more — Hadamard’s ill-posedness, with the period playing the wavenumber. Flight reconstructions therefore smooth the surface history over many seconds.`,
        };
      },
    }),
    mcq({
      id: 'cp-which-ill', difficulty: 2,
      prompt: t`Which of these problems is ill-posed?`,
      visual: { type: 'graph', params: { x: [0, 6], y: [-30, 30], aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'growth rate', axesAt: 'edge', curves: [{ fn: 'x^2', color: 'warn', width: 2 }, { fn: '-x^2', color: 'accent', width: 2 }, { fn: '0*x', color: 'violet', width: 2 }] }, caption: 'Growth rates of Fourier modes for three evolution equations, unlabelled: one grows without bound, one decays, one neither.' },
      choices: ['the heat equation run backward in time from a measured final temperature', 'the heat equation run forward from an initial temperature, with fixed end temperatures', 'the wave equation with initial displacement and velocity', 'Laplace’s equation in a disk with the temperature given all round the rim'],
      answer: 0,
      why: {
        1: t`Forward diffusion damps every mode by $e^{-Dk^2t}$: errors shrink. Well-posed.`,
        2: t`Every mode of the wave equation keeps its size (rate 0): energy is conserved, errors neither grow nor shrink. Well-posed.`,
        3: 'Dirichlet data all round a closed boundary is exactly the right question for an elliptic equation. Well-posed (lessons B5.1, B6.2).',
      },
      hints: ['Which one amplifies fine detail without bound?'],
      teach: 'The backward heat equation is the standard example of an ill-posed problem: growth rate k², no ceiling.',
      explain: t`Running heat backward multiplies mode $k$ by $e^{Dk^2t}$: unbounded in $k$, so continuous dependence fails (and for most final data no solution exists at all). The other three are the well-posed questions of lesson B10.2.`,
    }),
    num({
      id: 'cp-truncate', difficulty: 3,
      gen(r) {
        const eps = r.pick([1e-6, 1e-8]), tolE = r.pick([1e-2, 1e-3]), T = r.pick([0.05, 0.1]);
        const nmax = Math.floor(Math.sqrt(Math.log(tolE / eps) / T));
        return {
          prompt: t`You run $u_t = u_{xx}$ backward by $T = ${T}$ to recover a past profile. Each mode $\sin nx$ of the measured data carries an error of about $${tex(eps)}$, and you can accept an error of at most $${tex(tolE)}$ in each recovered mode. What is the highest mode $n$ you can keep?`,
          visual: { type: 'graph', params: { x: [0, 16], y: [-9, 4], ylog: true, aspect: 'wide', xticks: 0, xlabel: 'mode number n', ylabel: 'error in mode n', axesAt: 'edge', curves: [{ fn: `log10(${eps}) + x^2*${T}/ln(10)`, color: 'warn', width: 2.4 }], hlines: [{ y: Math.log10(tolE), label: 'acceptable', color: 'good' }] }, caption: 'The recovered error ε·e^(n²T) against mode number (log scale), and the acceptable level.' },
          answer: nmax, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: nmax + 1, feedback: 'Round down: the next mode already exceeds the limit.' }, { value: Math.floor(Math.log(tolE / eps) / T), feedback: t`The growth is $e^{n^2T}$, so solve $n^2T \le \ln(\text{limit}/\varepsilon)$ — take a square root.` }].filter((e) => e.value !== nmax),
          hints: [t`Need $\varepsilon\,e^{n^2T} \le ${tex(tolE)}$, i.e. $n^2 \le \ln(${tex(tolE)}/${tex(eps)})/T$.`, t`$\ln(${tex(tolE / eps)}) = ${r3(Math.log(tolE / eps))}$.`],
          teach: 'Regularization by truncation: keep only the modes whose amplified noise stays acceptable — a few, because the growth is e^(n²T).',
          explain: t`$n^2 \le ${r3(Math.log(tolE / eps))}/${T} = ${r3(Math.log(tolE / eps) / T)}$, so $n \le ${r3(Math.sqrt(Math.log(tolE / eps) / T))}$: keep modes up to $n = ${nmax}$. A hundredfold better instrument adds only $\ln 100 \approx 4.6$ to the bound on $n^2T$ — buying a mode or two. Precision cannot rescue an ill-posed question.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'J. Hadamard, Lectures on Cauchy’s Problem in Linear Partial Differential Equations (Yale University Press, 1923; Dover reprint)', url: 'https://openlibrary.org/search?q=lectures+on+cauchy%27s+problem+hadamard' }, { label: 'J. V. Beck, B. Blackwell & C. R. St. Clair, Inverse Heat Conduction: Ill-Posed Problems (Wiley, 1985)', url: 'https://openlibrary.org/search?q=inverse+heat+conduction+ill-posed+problems+beck' }, SRC.tpsx],
});
