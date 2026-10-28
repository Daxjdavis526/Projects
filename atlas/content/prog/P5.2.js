// Derivatives, integrals and series with SymPy — diff, integrate, series,
// limit; the relativistic kinetic energy expanding to ½mv² + …, the radial
// equation of motion around a black hole, Maxwell's mean speed, the GPS
// clocks' gravitational gain, and the large-amplitude pendulum.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { ellipK } from './_numkit.js';

const t = String.raw;

// when is ½mv² 1% wrong? solve (γ − 1)/(β²/2) = 1.01 by bisection
const ratio = (b) => (1 / Math.sqrt(1 - b * b) - 1) / (b * b / 2);
const BETA_1PC = (() => { let lo = 0.01, hi = 0.5; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (ratio(m) > 1.01) hi = m; else lo = m; } return (lo + hi) / 2; })();
const BETA_EST = Math.sqrt(0.04 / 3);
const C = 299792458;

// GPS: gravitational part of the clock rate difference, per day
const GM_E = 3.986004418e14, R_E = 6.371e6, R_GPS = 26.5597e6;
const GPS_GAIN_US = (GM_E / C ** 2) * (1 / R_E - 1 / R_GPS) * 86400 * 1e6;
const GPS_SPEED_US = -(GM_E / R_GPS / (2 * C ** 2)) * 86400 * 1e6;    // −v²/2c² with v² = GM/r (Earth's rotation ignored)

// nitrogen at 300 K
const KB = 1.380649e-23, M_N2 = 28.0134 * 1.66053906660e-27;
const V_MEAN = Math.sqrt((8 * KB * 300) / (Math.PI * M_N2));

// the pendulum: exact T/T0 = (2/π) K(sin²(θ0/2))
const pend = (th) => (2 / Math.PI) * ellipK(Math.sin(th / 2) ** 2);
const pendSeries = (th) => 1 + th ** 2 / 16 + (11 * th ** 4) / 3072;

export default lesson({
  id: 'prog.P5.2',
  title: 'Derivatives, integrals and series with SymPy',
  minutes: 11, difficulty: 3,
  intro: t`The calculus of a derivation can be handed to SymPy whole: \`sp.diff(f, x)\` differentiates, \`sp.integrate(f, (x, a, b))\` integrates, \`sp.limit\` takes limits, and \`sp.series(f, x, 0, n)\` expands $f$ in powers of $x$ up to (not including) $x^n$. Series are how physicists see which terms matter. Einstein's kinetic energy, expanded in the speed $v$, starts with Newton's:

$$K = (\gamma - 1)mc^2 = \tfrac12 mv^2 + \tfrac38\,\frac{mv^4}{c^2} + \tfrac{5}{16}\,\frac{mv^6}{c^4} + \cdots$$

Each term is smaller than the last by about $v^2/c^2$, so Newton's $\tfrac12 mv^2$ is excellent for spacecraft and fails for particle beams.`,
  symbols: [
    { tex: 'K', text: 'kinetic energy, in J' },
    { tex: t`\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}`, text: 'the Lorentz factor: 1 at rest, growing without bound as $v \\to c$' },
    { tex: 'm', text: 'the rest mass, in kg' },
    { tex: 'v', text: 'the speed, in m/s; SymPy expands in $\\beta = v/c$' },
    { tex: 'c', text: 'the speed of light, 299 792 458 m/s' },
    { tex: t`\cdots`, text: 'the remaining terms, which SymPy writes as $O(\\beta^8)$: “of order $\\beta^8$ or smaller”' },
  ],
  why: 'Series tell you when an approximation is good enough, and exact derivatives and integrals are the reference every numerical method in the next three modules is tested against.',
  visual: {
    type: 'code-runner',
    title: 'Newton as the first term of Einstein',
    lead: t`Press **Run**. SymPy expands $\gamma - 1$ in $\beta = v/c$, and \`lambdify\` turns each truncated series into a NumPy function. Left: the energies. Right: each approximation's relative error on log–log axes — straight lines whose slopes are 2, 4 and 6.`,
    tasks: [
      'Read off where ½β² is 1% wrong: the blue line crosses 10⁻² near v/c ≈ 0.11.',
      'Look at the far left of the right panel: the lowest line bends up. That is not the series failing — it is round-off in computing the “exact” γ − 1 with floats, the subject of module P6.',
      'Expand something else: `print(sp.series(sp.sqrt(1 + beta), beta, 0, 4))`.',
    ],
    params: {
      rows: 22,
      code: t`import numpy as np
import sympy as sp
import matplotlib.pyplot as plt

beta = sp.symbols("beta", positive=True)      # v / c
K = 1/sp.sqrt(1 - beta**2) - 1                 # kinetic energy in units of m c²
print("K / mc² =", sp.series(K, beta, 0, 8))

b = np.linspace(0.01, 0.9, 400)
K_exact = sp.lambdify(beta, K, "numpy")(b)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.8), layout="constrained")
ax1.plot(b, K_exact, lw=3, color="C4", label="exact: γ − 1")
for n, name in [(3, "½β² (Newton)"), (5, "+ 3β⁴/8"), (7, "+ 5β⁶/16")]:
    approx = sp.lambdify(beta, sp.series(K, beta, 0, n).removeO(), "numpy")(b)
    ax1.plot(b, approx, "--", label=name)
    ax2.loglog(b, np.abs(approx - K_exact) / K_exact, label=name)
ax1.set_xlabel("v / c"); ax1.set_ylabel("K / (m c²)"); ax1.legend()
ax2.set_xlabel("v / c"); ax2.set_ylabel("relative error"); ax2.legend()
plt.show()`,
    },
    caption: 'Exact special relativity against its first one, two and three series terms. The relative error of the n-term series grows like β²ⁿ, a straight line on log–log axes.',
  },
  example: {
    prompt: t`How fast must a particle move before Newton's $\tfrac12 mv^2$ underestimates its kinetic energy by 1%? Use SymPy for the series estimate, then for the exact answer.`,
    visual: {
      type: 'graph',
      params: { x: [0, 0.3], y: [1, 1.08], aspect: 'wide', axesAt: 'edge', xlabel: 'v / c', ylabel: 'K / (½mv²)',
        curves: [{ fn: '(1/sqrt(1 - x^2) - 1)/(x^2/2)', color: 'accent', domain: [0.004, 0.3], label: 'exact', labelAt: 0.24, labelDx: -40, labelDy: -12 },
          { fn: '1 + 3x^2/4', color: 'gold', dash: true, domain: [0, 0.3], label: '1 + 3β²/4', labelAt: 0.27, labelDx: -10, labelDy: 18 }],
        hlines: [{ y: 1.01, label: '1% high', color: 'ink3' }],
        points: [{ x: BETA_1PC, y: 1.01, color: 'good', r: 4.5 }] },
      caption: 'The ratio of the true kinetic energy to Newton’s, and its first-order series. Both cross the 1% line near v = 0.115c.',
    },
    steps: [
      { label: 'Form the ratio', text: t`Work in $\beta = v/c$ so the expression has no units. The ratio of true to Newtonian energy is $(\gamma - 1)/(\beta^2/2)$:

\`\`\`python
import sympy as sp
beta = sp.symbols("beta", positive=True)
ratio = (1/sp.sqrt(1 - beta**2) - 1) / (beta**2 / 2)
print(sp.limit(ratio, beta, 0))         # 1: Newton is exact as v -> 0
\`\`\`` },
      { label: 'Expand it', text: t`\`sp.series(ratio, beta, 0, 4)\` gives \`1 + 3*beta**2/4 + O(beta**4)\`. The first correction is $\tfrac34\beta^2$; set it to 0.01: $\beta \approx \sqrt{0.04/3} = ${BETA_EST.toFixed(4)}$.` },
      { label: 'Solve exactly', text: t`The full equation has no tidy closed form to read off, so solve it numerically, starting from the series estimate:

\`\`\`python
print(sp.nsolve(ratio - sp.Rational(101, 100), beta, 0.1))
\`\`\`

which prints ${BETA_1PC.toFixed(9)}…: the estimate was good to ${(100 * Math.abs(BETA_EST / BETA_1PC - 1)).toFixed(1)}%, because the next term, $\tfrac58\beta^4$, is tiny here.` },
      { label: 'Sense check', text: t`$v = ${BETA_1PC.toFixed(3)}c \approx ${(BETA_1PC * C / 1e3).toFixed(0)}$ km/s. The fastest spacecraft, Parker Solar Probe, peaks near 190 km/s, $\beta \approx 6\times10^{-4}$, where Newton is off by $\tfrac34\beta^2 \approx 3\times10^{-7}$. Electrons in an old television tube (about 25 kV) reach $\beta \approx 0.3$ and need relativity.` },
    ],
    answer: t`$v \approx ${BETA_1PC.toFixed(3)}c$ (about ${(BETA_1PC * C / 1e3).toFixed(0)} km/s); the one-term series estimate, ${BETA_EST.toFixed(3)}c, is within 1% of it.`,
  },
  practice: [
    code({
      id: 'radial-eom', difficulty: 2,
      prompt: t`Around a black hole (with $G = c = 1$), a body's radial motion obeys $\ddot r = -\,dV/dr$ with $V(r) = -\dfrac{M}{r} + \dfrac{L^2}{2r^2} - \dfrac{ML^2}{r^3}$. Set \`accel\` to $-dV/dr$ with \`sp.diff\`, and \`extra\` to what general relativity adds to Newton's radial acceleration $-\dfrac{M}{r^2} + \dfrac{L^2}{r^3}$ (gravity plus the centrifugal term), simplified.`,
      starter: t`import sympy as sp

r, M, L = sp.symbols("r M L", positive=True)
V = -M/r + L**2/(2*r**2) - M*L**2/r**3

accel = None
extra = None
`,
      answer: t`import sympy as sp

r, M, L = sp.symbols("r M L", positive=True)
V = -M/r + L**2/(2*r**2) - M*L**2/r**3

accel = -sp.diff(V, r)
extra = sp.simplify(accel - (-M/r**2 + L**2/r**3))
print(accel, "|", extra)`,
      tests: [
        { name: t`\`accel\` is $-M/r^2 + L^2/r^3 - 3ML^2/r^4$`, code: 'sp.simplify(accel - (-M/r**2 + L**2/r**3 - 3*M*L**2/r**4)) == 0' },
        { name: t`\`extra\` is $-3ML^2/r^4$`, code: 'sp.simplify(extra + 3*M*L**2/r**4) == 0' },
      ],
      hints: ['`sp.diff(V, r)` differentiates with respect to r; put a minus sign in front.', '`extra = sp.simplify(accel - (-M/r**2 + L**2/r**3))`.'],
      teach: '`sp.diff(expr, x)` differentiates exactly, and subtracting a known part then simplifying isolates what is new.',
      explain: t`$\ddot r = -\dfrac{M}{r^2} + \dfrac{L^2}{r^3} - \dfrac{3ML^2}{r^4}$. The extra $-3ML^2/r^4$ is an attraction that grows faster than the centrifugal $+L^2/r^3$ as $r$ shrinks, so close in it overwhelms the centrifugal barrier: that is why there are no stable circular orbits inside $6M$. It is also the term behind the precession of Mercury's perihelion.`,
    }),
    mcq({
      id: 'integrate-log', difficulty: 2,
      prompt: t`What does this print, and what does it mean?

\`\`\`python
x = sp.symbols("x")
print(sp.integrate(1/x, x))
\`\`\``,
      choices: [
        '`log(x)`: the natural logarithm, with no constant of integration and no absolute value',
        '`log(x)`, meaning the base-10 logarithm',
        '`log(Abs(x)) + C`',
        'An error: 1/x has no antiderivative at x = 0',
      ],
      answer: 0,
      why: {
        1: 'In SymPy (as in NumPy and the `math` module) `log` is the natural logarithm; base 10 is `log(x, 10)`.',
        2: 'SymPy never adds a constant, and it returns `log(x)`, which is correct as it stands for positive x (or as a complex logarithm).',
        3: 'An indefinite integral is a formula, not an evaluation at 0; SymPy returns it without complaint.',
      },
      hints: ['Which logarithm do Python libraries mean by `log`?', 'Does SymPy write “+ C”?'],
      teach: 'SymPy’s `integrate` returns one antiderivative — no + C — and its `log` is the natural log; definite integrals `integrate(f, (x, a, b))` need no constant.',
      explain: t`SymPy prints \`log(x)\`: the natural log, with the constant left to you. For negative $x$ it is the complex logarithm, which differs from $\ln\lvert x\rvert$ by a constant, $i\pi$. Declaring \`x = sp.symbols("x", positive=True)\` removes the question.`,
    }),
    num({
      id: 'series-coeff', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [-1, 2], [3, 2], [-2, 1], [1, 3], [-3, 2]]);
        const p = a / b, c2 = (p * (p - 1)) / 2;
        const pTeX = b === 1 ? `${a}` : t`${a < 0 ? '-' : ''}\tfrac{${Math.abs(a)}}{${b}}`, pPy = b === 1 ? `${a}` : `sp.Rational(${a}, ${b})`;
        return {
          prompt: t`What is the coefficient of $x^2$ in the result?

\`\`\`python
x = sp.symbols("x")
print(sp.series((1 + x)**${pPy}, x, 0, 3))
\`\`\``,
          visual: {
            type: 'graph',
            params: { x: [-0.9, 1.5], y: [-0.5, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
              curves: [{ fn: `(1 + x)^(${p})`, color: 'accent', domain: [-0.85, 1.5], label: `(1 + x)^(${b === 1 ? a : `${a}/${b}`})`, labelAt: 1.2, labelDy: -14 },
                { fn: `1 + ${p}*x`, color: 'ink3', dash: true, label: 'first two terms', labelAt: -0.6, labelDy: 14 }] },
            caption: 'The function and its tangent line, 1 + px. The x² term measures how the curve bends away from that line.',
          },
          answer: c2, tol: { rel: 0.001, abs: 1e-9 },
          errors: [{ value: p / 2, feedback: 'The second-order term of (1 + x)ᵖ is p(p − 1)/2 · x², not p/2 · x².' }, { value: p * (p - 1), feedback: 'Taylor’s x² term divides f″(0) = p(p − 1) by 2! = 2.' }],
          hints: [t`Taylor: the $x^2$ coefficient is $f''(0)/2$.`, t`For $f = (1 + x)^p$, $f''(0) = p(p - 1)$.`],
          teach: 'The binomial series: (1 + x)ᵖ = 1 + px + p(p − 1)x²/2 + …, which SymPy writes out for any p.',
          explain: t`With $p = ${pTeX}$: $\frac{p(p - 1)}{2} = ${+c2.toFixed(6)}$. The same expansion gives $\gamma = (1 - \beta^2)^{-1/2} \approx 1 + \tfrac12\beta^2 + \tfrac38\beta^4$ (put $x = -\beta^2$, $p = -\tfrac12$) — the kinetic-energy series of this lesson.`,
        };
      },
    }),
    code({
      id: 'maxwell-mean', difficulty: 3,
      prompt: t`The Maxwell–Boltzmann distribution of molecular speeds is

$$f(v) = 4\pi\left(\frac{m}{2\pi k_B T}\right)^{3/2} v^2\, e^{-mv^2/(2k_B T)}$$

With SymPy, set \`norm\` to $\int_0^\infty f\,dv$ (it should be 1), \`v_mean\` to the mean speed $\int_0^\infty v f\,dv$ as an exact expression, and \`v_N2\` to its value (a float, in m/s) for nitrogen molecules, $m = 4.652\times10^{-26}$ kg, at $T = 300$ K.`,
      starter: t`import sympy as sp

v, m, kB, T = sp.symbols("v m k_B T", positive=True)
f = 4*sp.pi*(m/(2*sp.pi*kB*T))**sp.Rational(3, 2) * v**2 * sp.exp(-m*v**2/(2*kB*T))

norm = None
v_mean = None
v_N2 = None
`,
      answer: t`import sympy as sp

v, m, kB, T = sp.symbols("v m k_B T", positive=True)
f = 4*sp.pi*(m/(2*sp.pi*kB*T))**sp.Rational(3, 2) * v**2 * sp.exp(-m*v**2/(2*kB*T))

norm = sp.simplify(sp.integrate(f, (v, 0, sp.oo)))
v_mean = sp.simplify(sp.integrate(v*f, (v, 0, sp.oo)))
v_N2 = float(v_mean.subs({m: ${M_N2}, kB: ${KB}, T: 300}))
print(norm, v_mean, v_N2)`,
      tests: [
        { name: 'the distribution is normalized', code: 'sp.simplify(norm - 1) == 0' },
        { name: t`$\langle v\rangle = \sqrt{8k_BT/(\pi m)}$`, code: 'sp.simplify(v_mean - sp.sqrt(8*kB*T/(sp.pi*m))) == 0' },
        { name: t`nitrogen at 300 K: ${V_MEAN.toFixed(0)} m/s`, code: `isinstance(v_N2, float) and abs(v_N2 - ${V_MEAN}) < 0.01` },
      ],
      hints: ['A definite integral to infinity: `sp.integrate(f, (v, 0, sp.oo))`. Wrap it in `sp.simplify`.', 'Multiply by v for the mean; substitute with `.subs({m: …, kB: …, T: 300})` and convert with `float(...)`.'],
      teach: '`sp.integrate(f, (x, a, b))` does definite integrals, infinite limits included; positive symbols let it settle convergence questions.',
      explain: t`SymPy returns $\int_0^\infty f\,dv = 1$ and $\langle v\rangle = \dfrac{2\sqrt2\sqrt{k_BT}}{\sqrt\pi\sqrt m} = \sqrt{8k_BT/\pi m}$: ${V_MEAN.toFixed(0)} m/s for nitrogen at room temperature — faster than sound in air (347 m/s at 300 K), as it must be, since sound is carried by the molecules' motion. Without \`positive=True\` SymPy cannot tell whether the integral converges and returns a case-by-case \`Piecewise\` answer.`,
    }),
    mcq({
      id: 'series-order', difficulty: 2,
      prompt: t`What does this print?

\`\`\`python
x = sp.symbols("x")
print(sp.series(sp.cos(x), x, 0, 4))
\`\`\``,
      choices: ['`1 - x**2/2 + O(x**4)`', '`1 - x**2/2 + x**4/24 - x**6/720`', '`1 - x**2/2 + x**4/24 + O(x**5)`', '`1 - x**2/2 + O(x**3)`'],
      answer: 0,
      why: {
        1: 'The 4 is not a number of terms: it is the power at which the expansion stops, and the result carries an O(...) term.',
        2: 'The error term starts at x⁴ — the n you pass — so x⁴/24 is not included.',
        3: 'The order term is the n you pass, O(x⁴), not O(x³); cos x has no x³ term anyway.',
      },
      hints: ['`sp.series(f, x, x0, n)` keeps the powers below n.', 'cos x = 1 − x²/2 + x⁴/24 − …: which powers are below 4?'],
      teach: '`sp.series(f, x, 0, n)` keeps powers up to xⁿ⁻¹ and appends O(xⁿ); call `.removeO()` to get a plain polynomial to evaluate.',
      explain: t`Powers below $x^4$ are kept: $1 - x^2/2$, and $O(x^4)$ records that the first omitted term is of order $x^4$. To use the polynomial in a calculation, call \`.removeO()\` — \`O\` terms refuse to be evaluated, which protects you from mistaking a truncated series for the exact function.`,
    }),
    mcq({
      id: 'limit-vs-float', difficulty: 2,
      prompt: t`SymPy says the limit is $\tfrac12$. What does the floating-point version print at $x = 10^{-8}$?

\`\`\`python
print(sp.limit((1 - sp.cos(x))/x**2, x, 0))      # 1/2
import math
x_num = 1e-8
print((1 - math.cos(x_num)) / x_num**2)
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-3, 3], y: [0, 0.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '(1 − cos x)/x²',
          curves: [{ fn: '2*sin(x/2)^2/x^2', color: 'accent', domain: [-3, 3] }], hlines: [{ y: 0.5, label: '½', color: 'ink3' }] },
        caption: 'The function near 0, rising to its limit ½. Drawn here from the rearranged form 2 sin²(x/2)/x², which floats handle well.',
      },
      choices: [
        '`0.0`: in floats, cos(10⁻⁸) rounds to exactly 1, so the numerator cancels to 0',
        '`0.5`, matching the limit',
        '`0.49999999999999994`, off in the last digit',
        'A `ZeroDivisionError`',
      ],
      answer: 0,
      why: {
        1: 'The true value at x = 10⁻⁸ is 0.5 to 16 digits — but the float computation never sees it.',
        2: 'The loss is not in the last digit: all digits are lost when two nearly equal numbers are subtracted.',
        3: 'x² = 10⁻¹⁶ is small but not zero; dividing by it is fine.',
      },
      hints: ['cos(10⁻⁸) = 1 − 5 × 10⁻¹⁷. A float near 1 has a spacing of about 2 × 10⁻¹⁶.', 'What is 1 − 1?'],
      teach: 'An exact limit and a float evaluation can disagree completely near the limit point: subtracting nearly equal floats destroys digits (catastrophic cancellation, module P6).',
      explain: t`$\cos(10^{-8}) = 1 - 5\times10^{-17}$, closer to 1 than to the next float below it, $1 - 1.1\times10^{-16}$, so it rounds to exactly 1.0 and the numerator is 0. SymPy works exactly and is right; the cure in floating point is to rewrite the formula, here as $2\sin^2(x/2)/x^2$ — lesson P6.2 does exactly this.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-gps', difficulty: 3, transfer: true,
      prompt: t`A clock at rest at distance $r$ from Earth's centre ticks at the rate $\sqrt{1 - 2u}$ relative to a distant clock, with $u = GM/(rc^2)$. Use \`sp.series\` to set \`first_order\` to the expansion of $\sqrt{1 - 2u}$ through first order in $u$, as a polynomial (no $O$ term). Then use it to set \`gain_us\` to the number of microseconds per day a GPS satellite's clock ($r = 26\,560$ km) gains on a ground clock ($r = 6371$ km) from gravity alone, with $GM = 3.986004418\times10^{14}\ \text{m}^3/\text{s}^2$.`,
      starter: t`import sympy as sp

u = sp.symbols("u", positive=True)
GM, c = 3.986004418e14, 299792458.0
r_ground, r_gps = 6.371e6, 26.5597e6        # m

first_order = None
gain_us = None
`,
      answer: t`import sympy as sp

u = sp.symbols("u", positive=True)
GM, c = 3.986004418e14, 299792458.0
r_ground, r_gps = 6.371e6, 26.5597e6        # m

first_order = sp.series(sp.sqrt(1 - 2*u), u, 0, 2).removeO()
rate = sp.lambdify(u, first_order)
gain_us = (rate(GM / (r_gps * c**2)) - rate(GM / (r_ground * c**2))) * 86400 * 1e6
print(first_order, gain_us)`,
      tests: [
        { name: t`\`first_order\` is $1 - u$`, code: 'sp.simplify(first_order - (1 - u)) == 0' },
        { name: t`the gain is ${GPS_GAIN_US.toFixed(1)} μs per day`, code: `abs(gain_us - ${GPS_GAIN_US}) < 0.05` },
      ],
      hints: ['`sp.series(sp.sqrt(1 - 2*u), u, 0, 2).removeO()` keeps terms up to u¹.', 'The rates differ by u(ground) − u(GPS) = (GM/c²)(1/r_ground − 1/r_gps); multiply by 86 400 s and by 10⁶.'],
      teach: 'For weak gravity, √(1 − 2GM/rc²) ≈ 1 − GM/rc²: clocks higher up run fast by the difference in GM/rc².',
      explain: t`$\sqrt{1 - 2u} \approx 1 - u$, and the next term, $-u^2/2$, is about $10^{-19}$ here — utterly negligible. The rates differ by $\frac{GM}{c^2}\left(\frac{1}{r_\oplus} - \frac{1}{r_{\text{GPS}}}\right) = ${(GPS_GAIN_US / 86400e6).toExponential(2).replace(/e(-\d+)/, '\\times10^{$1}')}$, or ${GPS_GAIN_US.toFixed(1)} μs a day. The satellites' orbital speed slows them by about ${Math.abs(GPS_SPEED_US).toFixed(1)} μs a day (special relativity), so the net is about +38 μs a day — corrected in every GPS clock, or positions would drift by kilometres a day.`,
    }),
    num({
      id: 'cp-pendulum', difficulty: 2, transfer: true,
      gen(r) {
        const deg = r.pick([20, 30, 40, 50, 60]);
        const th = (deg * Math.PI) / 180, pct = 100 * (pendSeries(th) - 1), exact = 100 * (pend(th) - 1);
        return {
          prompt: t`SymPy expands the period of a pendulum swinging to amplitude $\theta_0$ (in radians) as

$$\frac{T}{T_0} = 1 + \frac{\theta_0^2}{16} + \frac{11\,\theta_0^4}{3072} + O(\theta_0^6), \qquad T_0 = 2\pi\sqrt{L/g}$$

By how many percent is the period of a pendulum released at ${deg}° longer than the small-angle $T_0$, according to these terms?`,
          visual: {
            type: 'graph',
            params: { x: [0, 95], y: [0.99, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'amplitude θ₀ (degrees)', ylabel: 'T / T₀',
              curves: [{ fn: `1 + (x*pi/180)^2/16 + 11*(x*pi/180)^4/3072`, color: 'gold', dash: true, domain: [0, 92], label: 'series', labelAt: 85, labelDx: -10, labelDy: 18 }],
              points: [10, 20, 30, 40, 50, 60, 70, 80, 90].map((d) => ({ x: d, y: pend((d * Math.PI) / 180), color: 'accent', r: 3.5 })),
              legend: [{ label: 'exact period', color: 'accent', point: true }, { label: 'series to θ₀⁴', color: 'gold', dash: [6, 5] }], legendAt: 'tl' },
            caption: 'Exact periods (dots, from the complete elliptic integral) and the two-term series. Rigid, massless rod and no friction.',
          },
          answer: pct, tol: { rel: 0.005 },
          errors: [{ value: 100 * (1 + ((deg * deg) / 16) + (11 * deg ** 4) / 3072 - 1), feedback: 'θ₀ must be in radians, not degrees.' }, { value: (100 * th * th) / 16, feedback: 'That keeps only the θ₀² term; add 11θ₀⁴/3072.' }],
          hints: [t`Convert: $\theta_0 = ${deg}° = ${th.toFixed(4)}$ rad.`, t`Compute $\theta_0^2/16 + 11\theta_0^4/3072$ and multiply by 100.`],
          teach: 'A series in the amplitude turns “the small-angle formula” into a quantified approximation: at 20° the period is already 0.8% longer.',
          explain: t`$\theta_0 = ${th.toFixed(4)}$ rad: $\theta_0^2/16 = ${(th * th / 16).toFixed(5)}$ and $11\theta_0^4/3072 = ${((11 * th ** 4) / 3072).toFixed(5)}$, so the period is ${pct.toFixed(3)}% longer. The exact value (elliptic integral, lesson P8.2) is ${exact.toFixed(3)}%: the two terms are good to ${Math.abs(exact - pct) < 0.01 ? 'better than 0.01 percentage points' : `${Math.abs(exact - pct).toFixed(2)} percentage points`} at ${deg}°.`,
        };
      },
    }),
    mcq({
      id: 'cp-unevaluated', difficulty: 2,
      prompt: t`The total power a blackbody radiates needs $\int_0^\infty \frac{x^3}{e^x - 1}\,dx$. What does SymPy's answer mean?

\`\`\`python
>>> sp.integrate(x**3/(sp.exp(x) - 1), (x, 0, sp.oo))
Integral(x**3/(exp(x) - 1), (x, 0, oo))
\`\`\``,
      choices: [
        'SymPy found no closed form and handed the integral back unevaluated; compute it numerically (it is π⁴/15 ≈ 6.494)',
        'The integral diverges',
        'The integral is zero',
        'SymPy needs `x` declared positive and will then always succeed',
      ],
      answer: 0,
      why: {
        1: 'A divergent integral comes back as `oo`, not as an unevaluated `Integral`.',
        2: 'SymPy writes a zero result as 0; an `Integral` object means “not done”.',
        3: 'Assumptions help in many cases, but no setting guarantees a closed form — here the answer needs the Riemann zeta function, and SymPy does not find that route.',
      },
      hints: ['An `Integral(...)` object is SymPy’s way of saying the same thing back to you.', 'Unevaluated is not the same as divergent or zero.'],
      teach: 'When `integrate` returns an `Integral(...)`, it failed to find a closed form — not that none exists; switch to a numerical integrator.',
      explain: t`The value is $\Gamma(4)\zeta(4) = \pi^4/15 = 6.4939\ldots$, which gives the Stefan–Boltzmann constant — but SymPy hands the integral back unevaluated. That is honest: it never guesses. Lesson P8.2 computes it with \`scipy.integrate.quad\` in one line.`,
    }),
  ],
  sources: [
    { label: 'SymPy tutorial: Calculus (diff, integrate, limit, series)', url: 'https://docs.sympy.org/latest/tutorials/intro-tutorial/calculus.html' },
    { label: 'Ashby (2003), Relativity in the Global Positioning System, Living Reviews in Relativity 6, 1', url: 'https://doi.org/10.12942/lrr-2003-1' },
    { label: 'OpenStax University Physics Vol. 3, §5.9: Relativistic energy', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-9-relativistic-energy' },
  ],
});
