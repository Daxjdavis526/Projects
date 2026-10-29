// Trapezoid and Simpson in code — the composite rules written as vectorized
// NumPy, the library versions (np.trapezoid, scipy.integrate.simpson),
// checking error order by halving h, Richardson's estimate, what breaks the
// orders; adiabatic work, rocket telemetry and a cosmological distance.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { lg, trap, simpson, trapData, gaussRef } from './_numkit.js';

const t = String.raw;

// the worked example: adiabatic expansion, p = p1 (V1/V)^γ in MPa with V in L (so work in kJ)
const P1 = 3, V1 = 0.5, V2 = 4, GAM = 1.4;
const pV = (V) => P1 * (V1 / V) ** GAM;
const W_EXACT = (P1 * V1) / (GAM - 1) * (1 - (V1 / V2) ** (GAM - 1));
const NS = [8, 16, 32, 64];
const ROWS = NS.map((n) => ({ n, eT: trap(pV, V1, V2, n) - W_EXACT, eS: simpson(pV, V1, V2, n) - W_EXACT }));

// errors for exp(cos x) over a full period: the trapezoid rule's surprise
const fper = (x) => Math.exp(Math.cos(x)), PER_EXACT = gaussRef(fper, 0, 2 * Math.PI, 2000);
const PER = [2, 4, 6, 8, 10, 12, 14, 16].map((n) => [n, Math.abs(trap(fper, 0, 2 * Math.PI, n) - PER_EXACT), Math.abs(simpson(fper, 0, 2 * Math.PI, n) - PER_EXACT)]);

// the checkpoint's cosmology (Planck 2018: H0 = 67.4 km/s/Mpc, Ωm = 0.315, ΩΛ = 0.685)
const C_KMS = 299792.458, H0 = 67.4, OM = 0.315, OL = 0.685;
const DC1 = (C_KMS / H0) * gaussRef((z) => 1 / Math.sqrt(OM * (1 + z) ** 3 + OL), 0, 1, 400);

export default lesson({
  id: 'prog.P8.1',
  title: 'Trapezoid and Simpson in code',
  minutes: 11, difficulty: 3,
  intro: t`Most integrals in physics have no formula. The calculus course built the two workhorse rules ([Simpson’s rule and error bounds](#/lesson/math1220.C2-2.10)); here they become code. With $n$ subintervals of width $h$ and samples $f_k = f(a + kh)$,

$$T_n = h\Big[\tfrac12 f_0 + f_1 + \cdots + f_{n-1} + \tfrac12 f_n\Big], \qquad S_n = \frac h3\Big[f_0 + 4f_1 + 2f_2 + \cdots + 4f_{n-1} + f_n\Big]$$

In NumPy each is one line on an array of samples, and the libraries have them ready: \`np.trapezoid(y, x)\` and \`scipy.integrate.simpson(y, x=x)\`. The trapezoid error falls like $h^2$ and Simpson's like $h^4$, so **doubling $n$ divides the errors by 4 and 16** — which is how you check, in code, that an integration is converging.`,
  symbols: [
    { tex: 'T_n,\\ S_n', text: 'the trapezoid and Simpson estimates of $\\int_a^b f\\,dx$ with $n$ subintervals ($n$ even for Simpson)' },
    { tex: 'h = (b - a)/n', text: 'the width of each subinterval' },
    { tex: 'f_k = f(a + kh)', text: 'the samples, $k = 0, 1, \\ldots, n$ — from a formula, or straight from a data file' },
    { tex: '1,\\ 4,\\ 2,\\ \\ldots,\\ 4,\\ 1', text: 'Simpson’s weights: a parabola through each pair of subintervals (the `calc-quadrature` simulation draws them)' },
  ],
  why: 'Impulse from a thrust curve, work from a pressure trace, distances in an expanding universe and every orbit-averaged quantity are numerical integrals; knowing their error is knowing whether the result is a number or a guess.',
  visual: {
    type: 'code-runner',
    title: 'Two rules, two slopes',
    lead: t`Press **Run**. \`trap\` and \`simpson\` are written with NumPy slicing — \`y[1:-1:2]\` picks the odd-numbered samples, \`y[2:-1:2]\` the even interior ones. They integrate $x^4 - 2x + 1$ from 0 to 2 (exactly 4.4) for $n = 2, 4, \ldots, 1024$, and the log–log plot shows the error slopes.`,
    tasks: [
      'Read the table: each doubling of n divides the trapezoid error by 4 and Simpson’s by 16.',
      'Integrate `np.sqrt(x)` from 0 to 1 (exact 2/3): both slopes collapse to about 1.5, because √x has an infinite slope at 0.',
      'Integrate `np.exp(np.cos(x))` from 0 to 2π (exact 7.95492652101284…): the trapezoid rule converges absurdly fast — see the checkpoint.',
    ],
    params: {
      rows: 30,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import simpson as scipy_simpson

def trap(f, a, b, n):
    x = np.linspace(a, b, n + 1)
    y = f(x)
    h = (b - a) / n
    return h * (y.sum() - 0.5 * (y[0] + y[-1]))

def simpson(f, a, b, n):                 # n must be even
    x = np.linspace(a, b, n + 1)
    y = f(x)
    h = (b - a) / n
    return h / 3 * (y[0] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum() + y[-1])

f = lambda x: x**4 - 2*x + 1
a, b, exact = 0.0, 2.0, 4.4
ns = 2 ** np.arange(1, 11)               # 2, 4, ..., 1024
err_t = [abs(trap(f, a, b, n) - exact) for n in ns]
err_s = [abs(simpson(f, a, b, n) - exact) for n in ns]
for n, et, es in zip(ns[:5], err_t, err_s):
    print(f"n = {n:4d}   trapezoid error {et:.2e}   Simpson error {es:.2e}")
x = np.linspace(a, b, 11)
print("NumPy and SciPy agree:", np.trapezoid(f(x), x), scipy_simpson(f(x), x=x))

fig, ax = plt.subplots()
ax.loglog(ns, err_t, "o-", label="trapezoid (slope −2)")
ax.loglog(ns, err_s, "s-", label="Simpson (slope −4)")
ax.set_xlabel("number of subintervals n")
ax.set_ylabel("|error|")
ax.legend()
plt.show()`,
    },
    caption: 'The library functions take samples, not a function: np.trapezoid(y, x) and scipy.integrate.simpson(y, x=x). With 10 subintervals they give 4.50656 and 4.400427, the trapezoid 2.4% off and Simpson within 0.01%.',
  },
  example: {
    prompt: t`Hot gas in a cylinder expands adiabatically ($pV^\gamma$ constant, $\gamma = ${GAM}$) from $V_1 = ${V1}$ L at $p_1 = ${P1}$ MPa to $V_2 = ${V2}$ L. Compute the work $W = \int_{V_1}^{V_2} p\,dV$ with both rules, and check the error orders against the exact $W = \dfrac{p_1V_1}{\gamma - 1}\left[1 - (V_1/V_2)^{\gamma - 1}\right]$.`,
    visual: {
      type: 'calc-quadrature',
      params: { functions: [{ fn: `${P1}*(${V1}/x)^${GAM}`, a: V1, b: V2, exact: W_EXACT, label: 'p(V)' }], rules: ['trap', 'simpson'], rule: 'trap', n: 8, nSlider: false, errorPlot: false, readout: false, xlabel: 'V (L)', ylabel: 'p (MPa)' },
      caption: 'The pressure falling as the gas expands, with 8 trapezoids under it (switch to Simpson to see the parabolic arcs). MPa × L = kJ, so the area is the work in kilojoules. Ideal gas, no heat flow, no friction.',
    },
    steps: [
      { label: 'Code the integrand', text: t`Work in MPa and litres, so the area comes out in kJ, and reuse the vectorized rules from the Explore step:

\`\`\`python
p = lambda V: 3.0 * (0.5 / V)**1.4            # MPa, V in litres
exact = 3.0 * 0.5 / 0.4 * (1 - (0.5 / 4.0)**0.4)
for n in [8, 16, 32, 64]:
    print(n, trap(p, 0.5, 4.0, n) - exact, simpson(p, 0.5, 4.0, n) - exact)
\`\`\`` },
      { label: 'Read the errors', text: t`$W = ${W_EXACT.toFixed(5)}$ kJ. The errors and their ratios as $n$ doubles:

$$\begin{array}{c|cc|cc} n & T_n - W & \text{ratio} & S_n - W & \text{ratio} \\ \hline ${ROWS.map((r, i) => `${r.n} & ${tex(r.eT)} & ${i ? (ROWS[i - 1].eT / r.eT).toFixed(2) : ''} & ${tex(r.eS)} & ${i ? (ROWS[i - 1].eS / r.eS).toFixed(2) : ''}`).join(' \\\\ ')} \end{array}$$` },
      { label: 'Check the orders', text: t`The trapezoid ratios approach 4 and Simpson's approach 16 — but only once the subintervals are narrow compared with the region where $p$ bends most, near $V_1$. From 8 to 16 subintervals Simpson's ratio is only ${(ROWS[0].eS / ROWS[1].eS).toFixed(1)}: the error formulas describe the **asymptotic** regime, and the ratios tell you whether you have reached it.` },
      { label: 'Sense check', text: t`Both rules overestimate here: $p(V)$ is convex, so every trapezoid's top lies above the curve, and Simpson errs the same way because $p''''(V) > 0$. ${W_EXACT.toFixed(2)} kJ is a little over half of $p_1V_1/(\gamma - 1) = ${((P1 * V1) / (GAM - 1)).toFixed(2)}$ kJ, the most the gas could deliver expanding forever.` },
    ],
    answer: t`$W = ${W_EXACT.toFixed(4)}$ kJ; with 64 subintervals the trapezoid rule is off by $${tex(ROWS[3].eT, 2)}$ kJ and Simpson by $${tex(ROWS[3].eS, 2)}$ kJ, with error ratios approaching 4 and 16.`,
  },
  practice: [
    mcq({
      id: 'np-trapz', difficulty: 1,
      prompt: t`Code copied from a 2015 tutorial stops with an error in today's NumPy. What happened?

\`\`\`python
impulse = np.trapz(thrust, t)
# AttributeError: module 'numpy' has no attribute 'trapz'
\`\`\``,
      choices: ['`np.trapz` was renamed `np.trapezoid` (and removed in NumPy 2); the call is otherwise the same', 'NumPy no longer integrates; use SciPy', 'The arguments must be swapped: `np.trapz(t, thrust)`', '`thrust` must be a list, not an array'],
      answer: 0,
      why: {
        1: '`np.trapezoid` is right there; SciPy also has `scipy.integrate.trapezoid`.',
        2: 'Argument order does not cause an AttributeError: the name itself is missing.',
        3: 'NumPy functions take arrays and lists alike; the error is about the name.',
      },
      hints: ['An AttributeError means the name does not exist in the module.', 'Library APIs change: look the function up in the current documentation.'],
      teach: 'Textbook-era names are gone: np.trapz → np.trapezoid, scipy.integrate.simps → simpson, trapz → trapezoid, cumtrapz → cumulative_trapezoid.',
      explain: t`\`np.trapz\` was deprecated in NumPy 2.0 in favour of \`np.trapezoid\` and is gone from current versions; SciPy likewise renamed \`simps\` to \`simpson\`. Old tutorials rot: check the names against the current documentation.`,
    }),
    num({
      id: 'trap-data', difficulty: 2,
      gen(r) {
        const h = 0.5, v0 = r.int(40, 80), a = r.pick([18, 22, 26, 30]);
        const ys = Array.from({ length: 7 }, (_, k) => v0 + a * k * h + r.pick([0, 0, 0.5, -0.5, 1]) * (k % 3));
        const est = trapData(ys, h);
        return {
          prompt: t`A sounding rocket's speed is logged every ${h} s during its burn: ${ys.map((y) => y.toFixed(1)).join(', ')} m/s. How far does it rise over these 3 seconds, by the trapezoid rule?`,
          visual: {
            type: 'calc-quadrature',
            params: { data: { y: ys, x0: 0, h }, rules: ['trap'], readout: false, xlabel: 't (s)', ylabel: 'v (m/s)' },
            caption: 'The logged speeds and the trapezoids whose areas add up to the distance. Vertical flight assumed.',
          },
          answer: est, units: 'm', tol: { rel: 0.002 },
          errors: [{ value: h * ys.reduce((s, y) => s + y, 0), feedback: 'The first and last samples get weight ½ in the trapezoid rule.' }, { value: h * ys.slice(0, -1).reduce((s, y) => s + y, 0), feedback: 'That is a left Riemann sum. The trapezoid rule averages each pair of neighbouring samples.' }],
          hints: [t`$T = h\left[\tfrac12 v_0 + v_1 + \cdots + v_5 + \tfrac12 v_6\right]$ with $h = ${h}$ s.`, 'In NumPy: `np.trapezoid(v, dx=0.5)`.'],
          teach: '`np.trapezoid(y, dx=h)` (or with sample times, `np.trapezoid(y, x)`) integrates data directly — no function needed.',
          explain: t`$T = ${h}\,[\tfrac12(${ys[0].toFixed(1)}) + ${ys.slice(1, -1).map((y) => y.toFixed(1)).join(' + ')} + \tfrac12(${ys[6].toFixed(1)})] = ${est.toFixed(2)}$ m. For data the samples are all you have: the rule's error is set by how much $v$ curves between samples, which you can only judge from the samples themselves.`,
        };
      },
    }),
    mcq({
      id: 'arg-order', difficulty: 2,
      prompt: t`A student integrates a thruster's power over time to get energy, but swaps the arguments. What does the call compute?

\`\`\`python
t = np.array([0.0, 1.0, 2.0, 3.0])      # s
P = np.array([1.0, 3.0, 4.0, 2.0])      # kW
E = np.trapezoid(t, P)
\`\`\``,
      visual: {
        type: 'calc-quadrature',
        params: { data: { y: [1, 3, 4, 2], x0: 0, h: 1 }, rules: ['trap'], readout: false, xlabel: 't (s)', ylabel: 'P (kW)' },
        caption: 'The intended area: power against time, 8.5 kJ by the trapezoid rule.',
      },
      choices: ['∫ t dP — the times integrated against the powers as positions, here −2.5: a meaningless number', 'The same 8.5 kJ, because the trapezoid rule is symmetric in its arguments', 'An error, because P is not increasing', '−8.5 kJ: the energy with the wrong sign'],
      answer: 0,
      why: {
        1: '`np.trapezoid(y, x)` treats its first argument as the heights and the second as the positions; swapping them is a different integral.',
        2: 'Positions need not increase: NumPy just uses the differences, which may be negative — no error is raised.',
        3: 'By parts, ∫ t dP = [tP] − ∫ P dt. Only when tP is the same at both ends is it −E; here the boundary term is 3 × 2 = 6, giving −2.5.',
      },
      hints: ['The signature is `np.trapezoid(y, x)`: heights first, positions second.', 'With x = P, the steps are ΔP = 2, 1, −2. Weight each by the average t over the step.'],
      teach: '`np.trapezoid(y, x)` takes the integrand first and the sample positions second — the reverse of how we say “P against t”. Passing keywords, `np.trapezoid(y=P, x=t)`, removes the doubt.',
      explain: t`\`np.trapezoid(t, P)\` sums $\tfrac12(t_k + t_{k+1})(P_{k+1} - P_k) = 0.5(2) + 1.5(1) + 2.5(-2) = -2.5$. The intended \`np.trapezoid(P, t)\` gives $\tfrac12(1 + 3) + \tfrac12(3 + 4) + \tfrac12(4 + 2) = 8.5$ kJ. Both are seconds times kilowatts, so not even a units check catches the swap; passing keywords does.`,
    }),
    code({
      id: 'my-rules', difficulty: 2,
      prompt: t`Write vectorized \`trap(f, a, b, n)\` and \`simpson(f, a, b, n)\` (n even) for the composite rules. Sample with \`np.linspace(a, b, n + 1)\` and use array sums — no loops. The tests check values and the error order of each.`,
      starter: t`import numpy as np
import scipy.integrate            # the library version, for comparison

def trap(f, a, b, n):
    pass

def simpson(f, a, b, n):
    pass
`,
      answer: t`import numpy as np
import scipy.integrate            # the library version, for comparison

def trap(f, a, b, n):
    y = f(np.linspace(a, b, n + 1))
    h = (b - a) / n
    return h * (y.sum() - 0.5 * (y[0] + y[-1]))

def simpson(f, a, b, n):
    y = f(np.linspace(a, b, n + 1))
    h = (b - a) / n
    return h / 3 * (y[0] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum() + y[-1])

print(trap(np.sin, 0, np.pi, 10), simpson(np.sin, 0, np.pi, 10))`,
      tests: [
        { name: t`$\int_0^\pi \sin x\,dx$ with $n = 10$ matches NumPy and SciPy`, code: 'abs(trap(np.sin, 0, np.pi, 10) - np.trapezoid(np.sin(np.linspace(0, np.pi, 11)), np.linspace(0, np.pi, 11))) < 1e-12 and abs(simpson(np.sin, 0, np.pi, 10) - scipy.integrate.simpson(np.sin(np.linspace(0, np.pi, 11)), x=np.linspace(0, np.pi, 11))) < 1e-12' },
        { name: 'trapezoid: doubling n divides the error by about 4', code: 'abs((trap(np.sin, 0, np.pi, 20) - 2) / (trap(np.sin, 0, np.pi, 40) - 2) - 4) < 0.01' },
        { name: 'Simpson: doubling n divides the error by about 16', code: 'abs((simpson(np.sin, 0, np.pi, 20) - 2) / (simpson(np.sin, 0, np.pi, 40) - 2) - 16) < 0.1' },
        { name: 'Simpson is exact for a cubic', code: 'abs(simpson(lambda x: x**3 - x, 0.0, 2.0, 2) - 2.0) < 1e-12' },
      ],
      hints: ['Trapezoid: `h * (y.sum() - 0.5 * (y[0] + y[-1]))` — every sample once, minus half of each end.', 'Simpson: `y[1:-1:2]` are the samples weighted 4, `y[2:-1:2]` those weighted 2.'],
      teach: 'Slicing turns the rules into array sums: `y[1:-1:2]` (odd interior samples) and `y[2:-1:2]` (even interior samples).',
      explain: t`With $n = 10$, $T_{10} = 1.98352$ and $S_{10} = 2.00011$ for an exact 2. The order tests — ratios of 4 and 16 — are the strongest check that a rule is coded right: a wrong weight usually still gives a plausible number, but drops the method to first or second order.`,
    }),
    num({
      id: 'error-ratio', difficulty: 2,
      gen(r) {
        const rule = r.pick(['trapezoid', 'Simpson']), p = rule === 'Simpson' ? 4 : 2;
        const n = r.pick([10, 16, 20]), k = r.pick([2, 4, 5]), E = r.pick([3.2, 6.4, 1.5]) * 10 ** -r.int(4, 7);
        return {
          prompt: t`The ${rule} rule with $n = ${n}$ is off by $${tex(E)}$. About how large will the error be with $n = ${n * k}$?`,
          visual: {
            type: 'calc-quadrature',
            params: { functions: [{ fn: 'exp(-x^2)', a: 0, b: 2, label: 'e^(−x²)' }], rules: [rule === 'Simpson' ? 'simpson' : 'trap'], n: 8, nSlider: false, errorPlot: true, readout: false },
            caption: `A typical case: the ${rule} rule on $e^{-x^2}$, and its error against n on log–log axes.`,
          },
          answer: E / k ** p, tol: { rel: 0.01 },
          errors: [{ value: E / k ** (6 - p), feedback: rule === 'Simpson' ? 'Simpson’s error falls like 1/n⁴, not 1/n².' : 'The trapezoid error falls like 1/n², not 1/n⁴.' }, { value: E / k, feedback: `Neither rule is first order: the error falls like 1/n${p === 4 ? '⁴' : '²'}.` }],
          hints: [`The ${rule} error is proportional to h${p === 4 ? '⁴' : '²'}, that is to 1/n${p === 4 ? '⁴' : '²'}.`, `n grows by ${k}, so divide by ${k}${p === 4 ? '⁴' : '²'} = ${k ** p}.`],
          teach: 'Trapezoid error ∝ 1/n², Simpson ∝ 1/n⁴ (for smooth integrands, once h resolves the curve): multiply n by k, divide the error by k² or k⁴.',
          explain: t`$${tex(E)}/${k}^{${p}} = ${tex(E / k ** p)}$. On the log–log error plot the ${rule} line has slope $-${p}$, so a factor ${k} in $n$ moves the error down by $${p}\log_{10}${k} = ${(p * Math.log10(k)).toFixed(2)}$ decades.`,
        };
      },
    }),
    mcq({
      id: 'sqrt-order', difficulty: 3,
      prompt: t`Simpson's rule on $\int_0^1 \sqrt x\,dx = \tfrac23$ only divides the error by about 2.8 each time $n$ doubles, not 16. Why?`,
      visual: {
        type: 'calc-quadrature',
        params: { functions: [{ fn: 'sqrt(x)', a: 0, b: 1, exact: 2 / 3, label: '√x' }], rules: ['simpson', 'trap'], rule: 'simpson', n: 4, nSlider: false, errorPlot: true, readout: false },
        caption: 'Simpson’s rule on √x and its error against n: the lines are much shallower than slope −4.',
      },
      choices: [
        'Simpson’s error formula needs a bounded fourth derivative, but √x has an infinite slope at 0; the error near 0 dominates and falls only like $n^{-1.5}$',
        'The code is wrong: a correct Simpson implementation always gains a factor of 16',
        'Round-off error is swamping the result',
        '√x is not a polynomial, so Simpson’s rule does not apply',
      ],
      answer: 0,
      why: {
        1: 'A correct code gives exactly this: the order is a property of the method *and* the integrand’s smoothness.',
        2: 'The errors here are around 10⁻³ to 10⁻⁵, far above round-off.',
        3: 'Simpson works for any integrable function; it converges at full speed only for smooth ones.',
      },
      hints: ['Simpson’s error bound contains max|f⁗|. What is f⁗ for √x near 0?', t`An error ratio of $2.8 \approx 2^{1.5}$ means error $\propto h^{1.5}$.`],
      teach: 'Error orders assume smoothness: an integrable singularity (like √x or 1/√x at an endpoint) drags every rule down to the order the singularity allows.',
      explain: t`All derivatives of $\sqrt x$ blow up at $x = 0$, so the first subinterval, where no parabola fits, contributes an error $\propto h^{3/2}$ that dominates: ratio $2^{1.5} \approx 2.83$. Cures: substitute $x = u^2$ (making the integrand $2u^2$, smooth), split off the bad end, or use an adaptive integrator like \`quad\` — next lesson.`,
    }),
    num({
      id: 'richardson', difficulty: 3,
      gen(r) {
        const [fx, f, a, b, lab] = r.pick([['exp(-x^2)', (x) => Math.exp(-x * x), 0, 1, 'e^{-x^2}'], ['1/(1 + x^2)', (x) => 1 / (1 + x * x), 0, 1, '\\frac{1}{1 + x^2}'], ['sin(x)', Math.sin, 0, Math.PI / 2, '\\sin x']]);
        const n = r.pick([4, 5, 8]);
        const T1 = trap(f, a, b, n), T2 = trap(f, a, b, 2 * n), R = (4 * T2 - T1) / 3;
        return {
          prompt: t`Without knowing the exact value of $\int ${lab}\,dx$ over $[${a}, ${b === Math.PI / 2 ? '\\pi/2' : b}]$, a program prints two trapezoid estimates. The trapezoid error is about $Ch^2$, so halving $h$ cuts it to a quarter. Combine them to cancel the $h^2$ error: what is $(4T_{${2 * n}} - T_{${n}})/3$?

\`\`\`
T_${n}  = ${T1.toFixed(10)}
T_${2 * n} = ${T2.toFixed(10)}
\`\`\``,
          answer: R, tol: { rel: 1e-8, abs: 0 },
          errors: [{ value: T2, feedback: 'That is the better of the two estimates, unimproved. Extrapolate: (4T₂ₙ − Tₙ)/3.' }, { value: (T2 - T1) / 3, feedback: 'That is the error estimate of T₂ₙ, not the improved value. Add it to T₂ₙ.' }],
          hints: [t`If $T_n = I + Ch^2$ and $T_{2n} = I + Ch^2/4$, eliminate $C$.`, t`$I \approx T_{2n} + (T_{2n} - T_n)/3$.`],
          teach: 'Richardson extrapolation: from Tₙ and T₂ₙ, (T₂ₙ − Tₙ)/3 estimates T₂ₙ’s error and (4T₂ₙ − Tₙ)/3 cancels it — the result is exactly Simpson’s S₂ₙ.',
          explain: t`$(4 \times ${T2.toFixed(10)} - ${T1.toFixed(10)})/3 = ${R.toFixed(10)}$. The true value is ${gaussRef(f, a, b).toFixed(10)}: the extrapolation is far closer than either trapezoid estimate. Algebraically $(4T_{2n} - T_n)/3$ is Simpson's $S_{2n}$ — Simpson's rule *is* an extrapolated trapezoid rule, and repeating the trick gives Romberg integration.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-comoving', difficulty: 3, transfer: true,
      prompt: t`In a flat universe with matter and dark energy, the comoving distance to redshift $z$ is

$$D_C = \frac{c}{H_0}\int_0^{z}\frac{dz'}{\sqrt{\Omega_m(1 + z')^3 + \Omega_\Lambda}}$$

With Planck 2018's $H_0 = ${H0}$ km/s/Mpc, $\Omega_m = ${OM}$, $\Omega_\Lambda = ${OL}$ and $c = ${C_KMS}$ km/s, set \`D1\` to $D_C$ at $z = 1$ in megaparsecs, using \`scipy.integrate.simpson\` on 201 equally spaced samples of $z'$.`,
      starter: t`import numpy as np
from scipy.integrate import simpson

c, H0, Om, OL = 299792.458, ${H0}, ${OM}, ${OL}

D1 = None
`,
      answer: t`import numpy as np
from scipy.integrate import simpson

c, H0, Om, OL = 299792.458, ${H0}, ${OM}, ${OL}

z = np.linspace(0, 1, 201)
D1 = c / H0 * simpson(1 / np.sqrt(Om * (1 + z)**3 + OL), x=z)
print(f"{D1:.1f} Mpc")`,
      tests: [
        { name: t`$D_C(z = 1) = ${DC1.toFixed(1)}$ Mpc`, code: `abs(D1 - ${DC1}) < 0.01` },
      ],
      hints: ['`z = np.linspace(0, 1, 201)`; the integrand is an array expression in z.', '`D1 = c / H0 * simpson(1 / np.sqrt(Om * (1 + z)**3 + OL), x=z)`.'],
      teach: 'Integrals with no closed form — most of cosmology — are a sampled integrand and one library call.',
      explain: t`$D_C \approx ${DC1.toFixed(0)}$ Mpc, about ${(DC1 * 3.2616e-3).toFixed(1)} billion light-years: the present distance to galaxies whose light left when the universe was half its current size. The integrand is smooth, so Simpson with 200 intervals is good to far better than 0.01 Mpc. There is no elementary closed form with both matter and Λ.`,
    }),
    mcq({
      id: 'cp-periodic', difficulty: 3,
      prompt: t`Averaging a smooth quantity over one full orbit, $\int_0^{2\pi} e^{\cos x}\,dx$, a student finds the trapezoid rule beating Simpson's rule by many orders of magnitude. Why?`,
      visual: {
        type: 'graph',
        params: { x: [0, 17], y: [-16, 1], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'subintervals n', ylabel: '|error|',
          points: PER.flatMap(([n, et, es]) => [...(et > 1e-16 ? [{ x: n, y: lg(et), color: 'accent', r: 4 }] : []), { x: n, y: lg(es), color: 'gold', r: 4 }]),
          legend: [{ label: 'trapezoid', color: 'accent', point: true }, { label: 'Simpson', color: 'gold', point: true }], legendAt: 'tr' },
        caption: t`Errors of both rules on $\int_0^{2\pi} e^{\cos x}\,dx$, computed in double precision. From $n = 14$ on, the trapezoid error is at round-off level, $10^{-15}$.`,
      },
      choices: [
        'For a smooth periodic function over a whole period, the trapezoid rule’s end errors cancel and it converges exponentially fast; Simpson’s unequal weights spoil that',
        'Simpson’s rule needs an odd number of subintervals here',
        'The trapezoid rule is always more accurate than Simpson’s',
        'Round-off error affects Simpson’s rule more because it has more terms',
      ],
      answer: 0,
      why: {
        1: 'Both runs used even n, as Simpson requires.',
        2: 'For non-periodic smooth integrands Simpson wins easily (1/n⁴ against 1/n²).',
        3: 'Round-off is around 10⁻¹⁵ here; Simpson’s errors are millions of times larger.',
      },
      hints: ['Over a full period, the start and end of the interval are the same point of a smooth curve.', 'The trapezoid rule then weights every sample equally — just an average of samples around the circle.'],
      teach: 'For smooth periodic integrands over a full period, the plain trapezoid rule (equal weights) converges exponentially — the basis of the FFT and of orbit averaging.',
      explain: t`The Euler–Maclaurin formula writes the trapezoid error as a series of terms in $f'(b) - f'(a)$, $f'''(b) - f'''(a)$, …; for a periodic function over a period every one of them vanishes, leaving errors that fall faster than any power of $h$. Simpson's 4–2–4 weights break the symmetry and fall back to $1/n^4$. With 12 samples the trapezoid rule gives $2\pi I_0(1)$ to 11 digits.`,
    }),
    num({
      id: 'cp-n-needed', difficulty: 2,
      gen(r) {
        const E = r.pick([4.2e-5, 1.1e-4, 3.3e-6, 8e-5]), tol = r.pick([1e-8, 1e-9, 1e-10]);
        let n = 10 * (E / tol) ** 0.25; n = Math.ceil(n); if (n % 2) n += 1;
        return {
          prompt: t`Simpson's rule with $n = 10$ is off by $${tex(E)}$ on a smooth integral. Assuming the error falls like $1/n^4$, what is the smallest **even** $n$ that brings it below $${tex(tol)}$?`,
          visual: {
            type: 'graph',
            params: { x: [0.8, 3.5], y: [lg(tol) - 1, lg(E) + 0.6], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'subintervals n', ylabel: '|error|',
              curves: [{ fn: `${lg(E)} - 4*(x - 1)`, color: 'violet', dash: true }], points: [{ x: 1, y: lg(E), color: 'gold', r: 5 }], hlines: [{ y: lg(tol), label: 'tolerance', color: 'good' }] },
            caption: 'The measured error at n = 10 and the 1/n⁴ line through it, with the tolerance.',
          },
          answer: n, tol: { rel: 0, abs: 2.5 },
          errors: [{ value: Math.ceil(10 * Math.sqrt(E / tol)), feedback: 'That uses 1/n², the trapezoid law. Simpson’s error falls like 1/n⁴.' }],
          hints: [t`Need $${tex(E)}\,(10/n)^4 < ${tex(tol)}$.`, t`$n > 10\,(${tex(E)}/${tex(tol)})^{1/4}$, then round up to an even number.`],
          teach: 'An error law tells you the work needed in advance: n = n₀(E₀/tol)^(1/p) for an order-p rule.',
          explain: t`$10\,(${tex(E)}/${tex(tol)})^{1/4} = ${(10 * (E / tol) ** 0.25).toFixed(1)}$, so $n = ${n}$. A trapezoid rule would need about $10\sqrt{E/\text{tol}}$ — thousands — for the same accuracy: higher order pays off when you need many digits.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'NumPy: numpy.trapezoid', url: 'https://numpy.org/doc/stable/reference/generated/numpy.trapezoid.html' },
    { label: 'SciPy: scipy.integrate.simpson', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.simpson.html' },
    { label: 'Newman, Computational Physics, ch. 5: Integrals and derivatives', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Planck Collaboration (2020), Planck 2018 results VI: Cosmological parameters, A&A 641, A6', url: 'https://doi.org/10.1051/0004-6361/201833910' },
  ],
});
