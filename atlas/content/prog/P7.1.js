// Finite differences and their error — forward and central differences from
// Taylor series, first- and second-order error, slopes 1 and 2 on log–log
// axes, np.gradient on data; g from Earth's potential, telemetry velocities.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { lg, forward, central } from './_numkit.js';

const t = String.raw;

// the worked example: g = dΦ/dr at Earth's surface, Φ = −GM/r
const GM = 3.986004418e14, R = 6.371e6;
const phi = (r) => -GM / r, G_EXACT = GM / R ** 2;
const EX = [1000, 100].map((h) => ({ h, f: forward(phi, R, h), c: central(phi, R, h) }));
const e6 = (x) => x.toFixed(6);

// errors of the Explore's sin example, for a picture
const H_GRID = Array.from({ length: 21 }, (_, k) => -5 + k / 4);
const errF = (L) => Math.abs(forward(Math.sin, 1, 10 ** L) - Math.cos(1));
const errC = (L) => Math.abs(central(Math.sin, 1, 10 ** L) - Math.cos(1));

export default lesson({
  id: 'prog.P7.1',
  title: 'Finite differences and their error',
  minutes: 11, difficulty: 3,
  intro: t`A computer cannot take a limit, so it estimates a derivative from a few values of the function: a **finite difference**. Taylor's theorem says exactly how wrong each estimate is. The **forward** difference uses $x$ and $x + h$; the **central** difference uses the two points either side:

$$\frac{f(x+h) - f(x)}{h} = f'(x) + \frac{h}{2}f''(x) + \cdots, \qquad \frac{f(x+h) - f(x-h)}{2h} = f'(x) + \frac{h^2}{6}f'''(x) + \cdots$$

The forward error is proportional to $h$ (**first order**): halve $h$ and the error halves. In the central difference the $h^2 f''$ terms of the two Taylor series cancel by symmetry, so its error is proportional to $h^2$ (**second order**): halve $h$ and the error falls fourfold. On log–log axes the errors are straight lines of slope 1 and 2.`,
  symbols: [
    { tex: 'f(x)', text: 'the function being differentiated — a formula, or a quantity a program can evaluate' },
    { tex: 'h', text: 'the step: how far apart the sample points are, in the units of $x$' },
    { tex: "f'(x)", text: 'the derivative we want' },
    { tex: "f''(x),\\ f'''(x)", text: 'the second and third derivatives: they set the size of each method’s error (its curvature and how fast that changes)' },
    { tex: t`\cdots`, text: 'higher-order terms, smaller still when $h$ is small' },
  ],
  why: 'Velocities from positions, forces from potentials and every step of an ODE or PDE solver are finite differences; their error order decides how small a step you need.',
  visual: {
    type: 'code-runner',
    title: 'Two error laws on one plot',
    lead: t`Press **Run**. The program differentiates $\sin x$ at $x = 1$ with both formulas for 26 step sizes and plots the errors on log–log axes, over the predictions $(h/2)\lvert f''\rvert$ and $(h^2/6)\lvert f'''\rvert$. Read the slopes: one decade of $h$ buys one decade of accuracy for forward differences, two for central.`,
    tasks: [
      'Read the table: each factor of 10 in h moves the forward error 10× and the central error 100×.',
      'Change the function to `np.exp` (and `df` to `np.exp`): the lines move, but their slopes stay 1 and 2.',
      'Extend h down to 10⁻¹² with `np.logspace(-12, 0, 49)`: below about 10⁻⁵ the central line turns up again. That is round-off — the next lesson.',
    ],
    params: {
      rows: 25,
      code: t`import numpy as np
import matplotlib.pyplot as plt

f, df = np.sin, np.cos            # the function and its exact derivative
x = 1.0
h = np.logspace(-5, 0, 26)        # step sizes from 1e-5 to 1

forward = (f(x + h) - f(x)) / h
central = (f(x + h) - f(x - h)) / (2 * h)
err_f = np.abs(forward - df(x))
err_c = np.abs(central - df(x))

for hk, ef, ec in list(zip(h, err_f, err_c))[::5]:
    print(f"h = {hk:.0e}   forward error {ef:.2e}   central error {ec:.2e}")

fig, ax = plt.subplots()
ax.loglog(h, err_f, "o-", ms=4, label="forward difference")
ax.loglog(h, err_c, "s-", ms=4, label="central difference")
ax.loglog(h, 0.5 * np.abs(np.sin(x)) * h, ":", color="0.6", label="(h/2)|f″|  (slope 1)")
ax.loglog(h, np.abs(np.cos(x)) / 6 * h**2, "--", color="0.6", label="(h²/6)|f‴|  (slope 2)")
ax.set_xlabel("step h")
ax.set_ylabel("|error| in f′(1)")
ax.legend()
plt.show()`,
    },
    caption: 'The predictions (grey) lie under the measured errors almost exactly: Taylor’s leading term is the whole story until h is large (top right) or tiny (round-off, next lesson).',
  },
  example: {
    prompt: t`The gravitational acceleration at Earth's surface is the slope of the potential, $g = d\Phi/dr$ with $\Phi(r) = -GM/r$. Estimate it at $R = 6371$ km by forward and central differences with $h = 1$ km and $h = 100$ m ($GM = 3.986004418\times10^{14}\ \text{m}^3/\text{s}^2$), and check the errors against Taylor's predictions.`,
    visual: {
      type: 'graph',
      params: { x: [6000, 7000], y: [-66.5, -56.5], aspect: 'wide', axesAt: 'edge', xlabel: 'r (km)', ylabel: 'Φ (km²/s²)',
        curves: [{ fn: `-${GM / 1e9}/x`, color: 'accent', domain: [6050, 6950] },
          { fn: `-${GM / 1e9}/${R / 1e3} + ${G_EXACT / 1e3}*(x - ${R / 1e3})`, color: 'gold', dash: true, domain: [6050, 6950] }],
        points: [{ x: R / 1e3, y: -GM / 1e9 / (R / 1e3), color: 'gold', r: 4.5, label: 'R', labelDx: -16, labelDy: -10 }] },
      caption: 'Earth’s potential outside the planet (spherical Earth, no rotation) and its tangent at the surface: the slope is g. Over 1 km the curve and the tangent differ by far less than the line width.',
    },
    steps: [
      { label: 'Code both formulas', text: t`\`\`\`python
GM, R = 3.986004418e14, 6.371e6
phi = lambda r: -GM / r
for h in [1000.0, 100.0]:
    fwd = (phi(R + h) - phi(R)) / h
    cen = (phi(R + h) - phi(R - h)) / (2 * h)
    print(h, fwd, cen)
\`\`\`

It prints, to six decimals, ${e6(EX[0].f)} and ${e6(EX[0].c)} for 1 km, ${e6(EX[1].f)} and ${e6(EX[1].c)} for 100 m. The exact value is $GM/R^2 = ${e6(G_EXACT)}$ m/s².` },
      { label: 'Predict the forward error', text: t`$\Phi'' = -2GM/r^3$, so $\tfrac h2\Phi'' = -gh/R$: $${tex(-G_EXACT * 1000 / R)}$ m/s² for 1 km. The actual error is $${tex(EX[0].f - G_EXACT)}$. With $h = 100$ m it is ten times smaller, $${tex(EX[1].f - G_EXACT)}$: first order.` },
      { label: 'Predict the central error', text: t`$\Phi''' = 6GM/r^4$, so $\tfrac{h^2}{6}\Phi''' = gh^2/R^2$: $${tex(G_EXACT * 1e6 / R ** 2)}$ m/s² for 1 km, and the actual error is $${tex(EX[0].c - G_EXACT)}$. At 100 m it is $${tex(EX[1].c - G_EXACT)}$, a hundred times smaller: second order.` },
      { label: 'Sense check', text: t`The forward difference with 1 km is still good to 0.02%, because $h/R$ is tiny; the central difference, for the same two evaluations of $\Phi$, is good to 2 parts in $10^8$. The step only has to be small compared with the distance over which the function curves — here Earth's radius.` },
    ],
    answer: t`Forward: ${e6(EX[0].f)} and ${e6(EX[1].f)} m/s² (errors $\approx -gh/R$); central: ${e6(EX[0].c)} and ${e6(EX[1].c)} m/s² (errors $\approx gh^2/R^2$), against the exact ${e6(G_EXACT)} m/s².`,
  },
  practice: [
    mcq({
      id: 'halve-h', difficulty: 1,
      prompt: t`A forward difference has an error of $4.2\times10^{-3}$ with $h = 0.01$. About what error do you expect with $h = 0.005$?`,
      visual: {
        type: 'graph',
        params: { x: [-3.2, -0.8], y: [-5, -1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|error|',
          points: [{ x: -2, y: lg(4.2e-3), color: 'gold', r: 5, label: 'h = 0.01', labelDx: 8, labelDy: -6 }] },
        caption: 'The measured error at one step size, on log–log axes.',
      },
      choices: ['$2.1\\times10^{-3}$', '$1.05\\times10^{-3}$', '$4.2\\times10^{-3}$', '$8.4\\times10^{-3}$'],
      answer: 0,
      why: {
        1: 'A quarter is what a second-order method (central difference) gives. The forward difference is first order.',
        2: 'The error does depend on h: it is (h/2)f″ to leading order.',
        3: 'A smaller step makes the truncation error smaller, not larger (until round-off takes over at tiny h).',
      },
      hints: ['The forward-difference error is about (h/2)f″(x).', 'Proportional to h: halve h, halve the error.'],
      teach: 'First-order error ∝ h; second-order error ∝ h²: halving h halves the first and quarters the second.',
      explain: t`The leading error $\tfrac h2 f''$ is proportional to $h$, so halving $h$ halves it: $2.1\times10^{-3}$. (These are the numbers for $\sin x$ at $x = 1$, where $\tfrac12\sin 1 = 0.42$.)`,
    }),
    num({
      id: 'predict-error', difficulty: 2,
      gen(r) {
        const method = r.pick(['forward', 'central']), p = method === 'forward' ? 1 : 2;
        const k = r.pick([2, 4, 5, 10]), E = r.pick([3.6, 2.4, 8.1, 5.5]) * 10 ** -r.int(3, 6), h0 = r.pick([0.01, 0.02, 0.05, 0.1]);
        const E2 = E / k ** p;
        return {
          prompt: t`A ${method} difference has an error of $${tex(E)}$ with $h = ${h0}$. Predict its error with $h = ${+(h0 / k).toPrecision(6)}$.`,
          visual: {
            type: 'graph',
            params: { x: [lg(h0) - 1.6, lg(h0) + 0.5], y: [lg(E) - 3.5, lg(E) + 0.8], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|error|',
              curves: [{ fn: `${lg(E)} + (x - ${lg(h0)})`, color: 'ink3', dash: true, label: 'slope 1', labelAt: lg(h0) - 1.4, labelDx: 6, labelDy: -10 },
                { fn: `${lg(E)} + 2*(x - ${lg(h0)})`, color: 'ink3', label: 'slope 2', labelAt: lg(h0) - 1.4, labelDx: 6, labelDy: 14 }],
              points: [{ x: lg(h0), y: lg(E), color: 'gold', r: 5 }] },
            caption: 'The measured error (gold) with lines of slope 1 and 2 through it. Which one does this method follow?',
          },
          answer: E2, tol: { rel: 0.01 },
          errors: [{ value: E / k ** (3 - p), feedback: method === 'forward' ? 'That is the second-order (central) law. The forward difference is first order.' : 'That is the first-order (forward) law. The central difference is second order.' }],
          hints: [`The ${method} difference is ${p === 1 ? 'first' : 'second'} order: error ∝ h${p === 1 ? '' : '²'}.`, `h shrinks by a factor ${k}, so the error shrinks by ${k}${p === 2 ? `² = ${k * k}` : ''}.`],
          teach: 'An order-p method’s error scales as hᵖ, so shrinking h by k divides the error by kᵖ — a straight line of slope p on log–log axes.',
          explain: t`Error $\propto h^{${p}}$: dividing $h$ by ${k} divides the error by ${k ** p}, giving $${tex(E2)}$. On the log–log plot that is a step of $\log_{10}${k}$ to the left along the line of slope ${p}.`,
        };
      },
    }),
    num({
      id: 'by-hand', difficulty: 2,
      gen(r) {
        const x0 = r.pick([1, 2, 3]), h = r.pick([0.1, 0.2, 0.05]), method = r.pick(['forward', 'central']);
        const f = (x) => x ** 3, est = method === 'forward' ? (f(x0 + h) - f(x0)) / h : (f(x0 + h) - f(x0 - h)) / (2 * h);
        const pred = method === 'forward' ? 3 * x0 * h + h * h : h * h;
        return {
          prompt: t`Estimate the derivative of $f(x) = x^3$ at $x = ${x0}$ with the ${method} difference and $h = ${h}$, to four decimal places. (The exact value is $3x^2 = ${3 * x0 * x0}$.)`,
          visual: {
            type: 'graph',
            params: { x: [x0 - 0.6, x0 + 0.6], y: [(x0 - 0.6) ** 3, (x0 + 0.6) ** 3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x) = x³',
              curves: [{ fn: 'x^3', color: 'accent' }],
              tangent: { fn: 'x^3', at: method === 'forward' ? x0 : x0 - h, secant: method === 'forward' ? h : 2 * h } },
            caption: method === 'forward' ? 'The secant through x and x + h (violet) whose slope the formula computes, beside the tangent at its left end (gold).' : 'The secant through x − h and x + h (violet): its slope is the central difference. The gold tangent here is at x − h, the secant’s left end.',
          },
          answer: est, tol: { rel: 0, abs: 6e-5 },
          errors: [{ value: 3 * x0 * x0, feedback: 'That is the exact derivative; the question asks for the finite-difference estimate.' }, ...(method === 'central' ? [{ value: (f(x0 + h) - f(x0 - h)) / h, feedback: 'The two points are 2h apart: divide by 2h.' }] : [])],
          hints: [method === 'forward' ? t`$\dfrac{(${x0} + ${h})^3 - ${x0}^3}{${h}}$.` : t`$\dfrac{(${x0} + ${h})^3 - (${x0} - ${h})^3}{2 \times ${h}}$.`, t`$(${x0} + ${h})^3 = ${+((x0 + h) ** 3).toFixed(6)}$${method === 'central' ? t` and $(${x0} - ${h})^3 = ${+((x0 - h) ** 3).toFixed(6)}$` : ''}.`],
          teach: 'A finite difference is the slope of a secant; its distance from the tangent’s slope is the truncation error.',
          explain: t`The estimate is $${+est.toFixed(6)}$, an error of $${+(est - 3 * x0 * x0).toFixed(6)}$. Taylor predicts ${method === 'forward' ? t`$\tfrac h2 f'' + \tfrac{h^2}{6}f''' = 3x h + h^2 = ${+pred.toFixed(6)}$ — exact here, because a cubic's Taylor series stops` : t`$\tfrac{h^2}{6}f''' = h^2 = ${+pred.toFixed(6)}$, exactly, because $f''' = 6$ is constant`}.`,
        };
      },
    }),
    code({
      id: 'fd-functions', difficulty: 2,
      prompt: t`Write \`forward(f, x, h)\` and \`central(f, x, h)\` returning the forward and central difference estimates of $f'(x)$. The tests check the values and the **order** of each method: the error ratio when $h$ is halved.`,
      starter: t`import math

def forward(f, x, h):
    pass

def central(f, x, h):
    pass
`,
      answer: t`import math

def forward(f, x, h):
    return (f(x + h) - f(x)) / h

def central(f, x, h):
    return (f(x + h) - f(x - h)) / (2 * h)

e1 = abs(central(math.sin, 1.0, 0.01) - math.cos(1.0))
e2 = abs(central(math.sin, 1.0, 0.005) - math.cos(1.0))
print("central error ratio:", e1 / e2)`,
      tests: [
        { name: t`$\frac{d}{dx}e^x$ at 0 with $h = 10^{-3}$`, code: 'abs(forward(math.exp, 0.0, 1e-3) - (math.exp(1e-3) - 1) / 1e-3) < 1e-12 and abs(central(math.exp, 0.0, 1e-3) - math.sinh(1e-3) / 1e-3) < 1e-12' },
        { name: 'forward: halving h halves the error (ratio near 2)', code: 'abs(abs(forward(math.sin, 1.0, 0.01) - math.cos(1.0)) / abs(forward(math.sin, 1.0, 0.005) - math.cos(1.0)) - 2) < 0.02' },
        { name: 'central: halving h quarters the error (ratio near 4)', code: 'abs(abs(central(math.sin, 1.0, 0.01) - math.cos(1.0)) / abs(central(math.sin, 1.0, 0.005) - math.cos(1.0)) - 4) < 0.01' },
      ],
      hints: ['Each function is one `return` line.', '`return (f(x + h) - f(x - h)) / (2 * h)` for the central difference: the points are 2h apart.'],
      teach: 'Measure a method’s order by halving h: an error ratio near 2 means first order, near 4 second order, near 16 fourth order.',
      explain: t`The ratios come out 2.00 and 4.00 — the empirical test of order, which works without knowing the exact error formula. It is how you check any numerical method you write: run it at $h$, $h/2$, $h/4$ and watch the ratios.`,
    }),
    mcq({
      id: 'np-gradient', difficulty: 2,
      prompt: t`Samples of $y = x^2$ at $x = 0, 1, 2, 3, 4$ go into NumPy's derivative. What does it print?

\`\`\`python
y = np.array([0.0, 1.0, 4.0, 9.0, 16.0])
print(np.gradient(y, 1.0))
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-0.3, 4.3], y: [-1, 17], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
          curves: [{ fn: 'x^2', color: 'ink3', dash: true }], points: [0, 1, 2, 3, 4].map((x) => ({ x, y: x * x, color: 'accent', r: 4 })) },
        caption: 'The five samples of y = x² (the dashed curve is not given to NumPy).',
      },
      choices: ['`[1. 2. 4. 6. 7.]`', '`[0. 2. 4. 6. 8.]`', '`[1. 3. 5. 7.]`', '`[1. 3. 5. 7. 7.]`'],
      answer: 0,
      why: {
        1: 'Those are the exact derivatives 2x. Inside, the central differences are exact for a quadratic; at the two ends NumPy uses one-sided first-order differences, which are not.',
        2: 'Those are `np.diff(y)`: forward differences between neighbours, one fewer than the samples. `np.gradient` returns one value per sample.',
        3: 'Inside the array `np.gradient` uses central differences, (y[k+1] − y[k−1])/2, not forward ones.',
      },
      hints: ['Inside: (y[k+1] − y[k−1])/2. At the ends: a one-sided difference.', 'At x = 0: (1 − 0)/1. At x = 4: (16 − 9)/1.'],
      teach: '`np.gradient(y, h)` uses central differences inside and one-sided ones at the ends; pass `edge_order=2` for second-order ends.',
      explain: t`Interior: $(4 - 0)/2 = 2$, $(9 - 1)/2 = 4$, $(16 - 4)/2 = 6$, exact for a parabola. Ends: $(1 - 0)/1 = 1$ and $(16 - 9)/1 = 7$, first-order and off by $h = 1$. \`np.gradient(y, 1.0, edge_order=2)\` gives \`[0. 2. 4. 6. 8.]\`.`,
    }),
    num({
      id: 'second-diff', difficulty: 2,
      gen(r) {
        const dt = r.pick([0.5, 0.25, 0.2]), a = r.pick([18, 21.5, 24, 27.5, 31]), v0 = r.int(250, 320), h0 = r.int(1200, 2400);
        const hs = [-1, 0, 1].map((k) => h0 + v0 * k * dt + 0.5 * a * (k * dt) ** 2).map((x) => +x.toFixed(3));
        const est = (hs[2] - 2 * hs[1] + hs[0]) / dt ** 2;
        return {
          prompt: t`A radar tracks a sounding rocket during its burn. Three altitudes ${dt} s apart are $${hs[0]}$, $${hs[1]}$ and $${hs[2]}$ m. Estimate its acceleration with the central second difference $\dfrac{h_+ - 2h_0 + h_-}{\Delta t^2}$.`,
          visual: {
            type: 'graph',
            params: { x: [-1.4 * dt, 1.4 * dt], y: [hs[0] - 0.15 * (hs[2] - hs[0]), hs[2] + 0.15 * (hs[2] - hs[0])], aspect: 'wide', axesAt: 'edge', xlabel: 'time from the middle reading (s)', ylabel: 'altitude (m)',
              points: hs.map((y, k) => ({ x: (k - 1) * dt, y, color: 'accent', r: 4.5 })) },
            caption: 'The three radar fixes. Their tiny bend is the acceleration.',
          },
          answer: est, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: (hs[2] - 2 * hs[1] + hs[0]) / dt, feedback: 'Divide by Δt squared.' }, { value: (hs[2] - hs[0]) / (2 * dt), feedback: 'That is the velocity (central first difference). The acceleration needs the second difference.' }],
          hints: [t`Numerator: $${hs[2]} - 2(${hs[1]}) + ${hs[0]}$.`, t`Divide by $\Delta t^2 = ${+(dt * dt).toFixed(4)}$ s².`],
          teach: 'The central second difference (f₊ − 2f₀ + f₋)/h² estimates f″ with an error of order h²; it is how accelerations are taken from position data.',
          explain: t`$(${hs[2]} - ${2 * hs[1]} + ${hs[0]})/${+(dt * dt).toFixed(4)} = ${est.toFixed(2)}$ m/s², about ${(est / 9.81).toFixed(1)} g of acceleration relative to the ground. A second difference divides tiny differences by $\Delta t^2$, so it amplifies measurement noise even more than a first difference: real radar data are smoothed or fitted first.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-telemetry', difficulty: 2, transfer: true,
      prompt: t`A sounding rocket's altitude \`h\` (m) is logged every 0.1 s. Set \`v\` to its vertical velocity at every sample using \`np.gradient\` with second-order edges, then \`t_max\` and \`v_max\` to the time (s) and value (m/s) of the largest velocity in your array.`,
      starter: t`import numpy as np

t = np.arange(0, 8.01, 0.1)              # s
h = 2.5 * t**3 - 0.25 * t**4             # m (the logged altitudes)

v = None
t_max = None
v_max = None
`,
      answer: t`import numpy as np

t = np.arange(0, 8.01, 0.1)              # s
h = 2.5 * t**3 - 0.25 * t**4             # m (the logged altitudes)

v = np.gradient(h, t, edge_order=2)
k = np.argmax(v)
t_max, v_max = t[k], v[k]
print(t_max, v_max)`,
      tests: [
        { name: 'one velocity per sample, second-order accurate', code: 'v.shape == t.shape and np.max(np.abs(v - (7.5 * t**2 - t**3))) < 0.12' },
        { name: 'the fastest moment is at t = 5 s', code: 'abs(t_max - 5.0) < 0.051' },
        { name: 'the top speed is 62.5 m/s', code: 'abs(v_max - 62.5) < 0.05' },
      ],
      hints: ['`np.gradient(h, t, edge_order=2)` takes the sample times (or the spacing 0.1) as its second argument.', '`k = np.argmax(v)`, then `t[k]` and `v[k]`.'],
      teach: 'For sampled data, `np.gradient(y, t)` gives central-difference derivatives at every sample; `argmax` then finds where a quantity peaks.',
      explain: t`The exact velocity is $v = 7.5t^2 - t^3$, which peaks at $t = 5$ s with 62.5 m/s; central differences with $\Delta t = 0.1$ s are off by $\tfrac{\Delta t^2}{6}\lvert h'''\rvert$: 0.025 m/s at the peak and at most 0.06 m/s inside the record, a little more at the two ends. Real telemetry is noisy, and then the step cannot be made small at will — the next lesson's subject.`,
    }),
    mcq({
      id: 'cp-which-slope', difficulty: 2,
      prompt: t`Two numerical derivative methods, P and Q, were run at many step sizes. Which statement is right?`,
      visual: {
        type: 'graph',
        params: { x: [-5.2, 0.2], y: [-11.5, 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|error|',
          curves: [{ fn: '-0.38 + x', color: 'accent', domain: [-5, 0], label: 'P', labelAt: -4.2, labelDx: 0, labelDy: -14 }, { fn: '-1.05 + 2x', color: 'gold', domain: [-5, 0], label: 'Q', labelAt: -4.4, labelDx: 10, labelDy: 6 }],
          points: H_GRID.filter((_, k) => k % 2 === 0).flatMap((L) => [{ x: L, y: lg(errF(L)), color: 'accent', r: 3 }, { x: L, y: lg(errC(L)), color: 'gold', r: 3 }]) },
        caption: 'Errors of two methods on log–log axes, measured in double precision (dots) with straight lines through them.',
      },
      choices: [
        'Q is second order (slope 2), like a central difference; P is first order (slope 1), like a forward difference',
        'P is more accurate, because its line is higher',
        'Q is first order, because its line is lower',
        'Both are the same order: the lines only differ by a constant',
      ],
      answer: 0,
      why: {
        1: 'Higher on the plot means a larger error, not a better method.',
        2: 'Order is read from the slope, not the height: Q falls two decades per decade of h.',
        3: 'A constant factor would shift a line up or down; these two have different slopes.',
      },
      hints: ['Read each slope: decades of error per decade of h.', 'Slope p means error ∝ hᵖ.'],
      teach: 'On log–log axes the slope of an error curve is the method’s order; the height is its constant.',
      explain: t`Q falls 10 decades over 5 decades of $h$: slope 2, second order. P falls 5: slope 1. These are the forward and central differences of $\sin x$ at $x = 1$, computed in double precision.`,
    }),
    num({
      id: 'cp-gps-velocity', difficulty: 2, transfer: true,
      gen(r) {
        const h = r.pick([1, 0.5, 2]), a = r.pick([2, 3, 4.5, 6]);
        return {
          prompt: t`A car's GPS receiver reports position once every ${h} s, and its software estimates the speed by a forward difference of the last two fixes. While the car accelerates steadily at ${a} m/s², by about how much does the estimate differ from the true speed at the earlier fix?`,
          visual: {
            type: 'graph',
            params: { x: [-0.5, 3.5], y: [0, 40], aspect: 'wide', axesAt: 'edge', xlabel: 'time (s)', ylabel: 'position (m)',
              curves: [{ fn: `5x + ${a / 2}x^2`, color: 'accent' }], tangent: { fn: `5x + ${a / 2}x^2`, at: 1, secant: h } },
            caption: 'Position against time under constant acceleration. The violet secant joins two fixes; the gold tangent is the true speed at the earlier one.',
          },
          answer: (a * h) / 2, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: a * h, feedback: 'The leading error is (h/2)f″, with f″ = a: half of a·h.' }, ...(h !== 1 ? [{ value: (a * h * h) / 2, feedback: 'The forward difference’s error is first order in h: (h/2)·a, not (h²/2)·a.' }] : [])],
          hints: [t`The forward-difference error is $\tfrac h2 f''$, and here $f'' = a$.`, t`$\tfrac{${h}}{2}\times${a}$.`],
          teach: 'A forward difference reports the average speed over the step, which lags the instantaneous speed by (h/2)·a — or, read the other way, it is exact at the middle of the interval.',
          explain: t`$\tfrac h2 a = ${(a * h) / 2}$ m/s (${((a * h) / 2 * 3.6).toFixed(1)} km/h). For constant acceleration this is exact: the forward difference is the true speed at the *midpoint* of the interval, $t + h/2$ — which is why the central difference, centred on the time it reports, has no first-order error.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Newman, Computational Physics, §5.10: Derivatives', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'NumPy: numpy.gradient', url: 'https://numpy.org/doc/stable/reference/generated/numpy.gradient.html' },
    { label: 'OpenStax Calculus Vol. 1, §3.1: Defining the derivative', url: 'https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative' },
  ],
});
