// Round-off and catastrophic cancellation — subtracting nearly equal floats
// amplifies their tiny relative errors; rearrange the formula instead:
// (1 − cos x)/x², the quadratic formula, expm1/log1p, compensated sums,
// γ − 1 at orbital speed, and the Pound–Rebka shift.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';

const t = String.raw;
const EPS = 2 ** -52, C = 299792458;

// the worked example: x² + bx + 1 = 0, naive and stable small roots, as Python computes them
const naiveSmall = (b) => (-b + Math.sqrt(b * b - 4)) / 2;
const stableSmall = (b) => 1 / (-(b + Math.sqrt(b * b - 4)) / 2);
const QUAD = Array.from({ length: 33 }, (_, k) => 1 + k / 4).map((L) => { const b = 10 ** L, e = Math.abs(naiveSmall(b) / stableSmall(b) - 1); return [L, e]; }).filter(([, e]) => e > 0);
const NAIVE_1E8 = naiveSmall(1e8), STABLE_1E8 = stableSmall(1e8);
const py = (x) => String(x).replace(/e([+-])(\d)$/, 'e$10$2');   // Python's repr of a float

// √(x² + 1) − x for large x, naive (JS doubles = Python floats)
const SQ = Array.from({ length: 41 }, (_, k) => 2 + k / 5).map((L) => { const x = 10 ** L; return [L, Math.sqrt(x * x + 1) - x, 1 / (Math.sqrt(x * x + 1) + x)]; });

// Pound–Rebka (1960): 22.5 m tower
const PR_SHIFT = (9.81 * 22.5) / C ** 2;

export default lesson({
  id: 'prog.P6.2',
  title: 'Round-off and catastrophic cancellation',
  minutes: 11, difficulty: 3,
  intro: t`Every float carries a relative error of up to about $\varepsilon \approx 2.2\times10^{-16}$, and for one number that hardly matters. Subtracting two **nearly equal** numbers is different: their leading digits cancel, the result is small, but the absolute errors they carried are not — so the *relative* error of the difference is magnified:

$$\frac{\lvert\text{error in } a - b\rvert}{\lvert a - b\rvert} \;\lesssim\; \varepsilon\,\frac{\lvert a\rvert}{\lvert a - b\rvert}$$

Lose a factor of $10^{8}$ in the subtraction and only 8 of the 16 digits survive. This is **catastrophic cancellation**. More digits will not fix it; rearranging the formula so that it never subtracts nearly equal numbers will.`,
  symbols: [
    { tex: 'a,\\ b', text: 'two computed numbers, each already rounded, so each wrong by a relative amount up to about ε' },
    { tex: 'a - b', text: 'their difference — small when $a \\approx b$, which is exactly when trouble starts' },
    { tex: t`\varepsilon`, text: 'machine epsilon, $2^{-52} \\approx 2.2\\times10^{-16}$ for Python floats' },
    { tex: t`\frac{\lvert a\rvert}{\lvert a - b\rvert}`, text: 'the amplification factor: about $10^k$ when $a$ and $b$ agree in their first $k$ digits, which then cancel' },
  ],
  why: 'Velocities from nearby positions, small energy differences, relativistic corrections and every numerical derivative are differences of nearly equal numbers; knowing when cancellation bites is the difference between a result and noise.',
  visual: {
    type: 'code-runner',
    title: 'One function, two formulas',
    lead: t`Press **Run**. Both lines compute $(1 - \cos x)/x^2$, whose true value tends to 0.5. The first subtracts $\cos x$ from 1; the second uses the identity $1 - \cos x = 2\sin^2(x/2)$. Read the plot from right to left.`,
    tasks: [
      'Find where the dots start to scatter visibly: near x = 3 × 10⁻⁷, where cos x agrees with 1 in about 13 digits, so the difference keeps only about 3.',
      'Below x ≈ 1.05 × 10⁻⁸, cos x rounds to exactly 1.0 and the naive formula returns 0. Check that `np.cos(1e-8) == 1.0` is `True`.',
      'Use `np.float32` values for x: single precision fails at an x some 20 000 times larger (the threshold scales as √ε).',
    ],
    params: {
      rows: 21,
      code: t`import numpy as np
import matplotlib.pyplot as plt

x = np.logspace(-10, 0, 800)
naive = (1 - np.cos(x)) / x**2            # subtracts two nearly equal numbers
stable = 2 * np.sin(x / 2)**2 / x**2      # the same function, rearranged

fig, ax = plt.subplots()
ax.semilogx(x, naive, ".", ms=3, label="(1 − cos x) / x²")
ax.semilogx(x, stable, label="2 sin²(x/2) / x²")
ax.set_xlabel("x")
ax.set_ylabel("computed value (true limit: 0.5)")
ax.set_ylim(-0.1, 1.1)
ax.legend()
plt.show()

for xi in [1e-4, 1e-6, 1e-8]:
    print(f"x = {xi:.0e}:  naive {(1 - np.cos(xi)) / xi**2:.12f}   stable {2 * np.sin(xi / 2)**2 / xi**2:.12f}")`,
    },
    caption: 'Real double-precision arithmetic. The two formulas are identical in exact arithmetic; only the order of operations differs.',
  },
  example: {
    prompt: t`Find the small root of $x^2 + 10^8 x + 1 = 0$ to full precision. The textbook formula, $x = \dfrac{-b + \sqrt{b^2 - 4ac}}{2a}$, prints \`${py(NAIVE_1E8)}\`. What went wrong, and what is the right answer?`,
    visual: {
      type: 'graph',
      params: { x: [0.8, 9.3], y: [-16.5, 1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'b in x² + bx + 1 = 0', ylabel: 'relative error of the small root',
        curves: [{ fn: `${Math.log10(EPS / 2)} + 2x`, color: 'ink3', dash: true, domain: [1, 8.4], label: 'ε b²/2', labelAt: 3, labelDx: -40, labelDy: -14 }],
        points: QUAD.map(([L, e]) => ({ x: L, y: Math.log10(e), color: 'bad', r: 3.5 })) },
      caption: 'The textbook formula’s error, computed in double precision, against the stable formula. It grows like ε b²/2: every factor of 10 in b costs two digits. The error is 0 for small b, where no dot appears.',
    },
    steps: [
      { label: 'Find the subtraction', text: t`Here $b^2 = 10^{16}$ dwarfs $4ac = 4$, so $\sqrt{b^2 - 4ac} = 10^8 - 2\times10^{-8} + \ldots$. Near $10^8$ floats are $1.5\times10^{-8}$ apart, so the square root is known only to that grain — and $-b + \sqrt{\cdots}$ subtracts two numbers that agree in all but their last digit. The difference is pure round-off: 25% wrong.` },
      { label: 'Avoid it', text: t`Compute the root that involves no cancellation first — the one where $b$ and the square root *add* — and get the other from the product of the roots, $x_1x_2 = c/a$:

$$q = -\tfrac12\left(b + \operatorname{sign}(b)\sqrt{b^2 - 4ac}\right), \qquad x_1 = \frac{q}{a}, \qquad x_2 = \frac{c}{q}$$` },
      { label: 'Code it', text: t`\`math.copysign(s, b)\` gives $s$ with the sign of $b$:

\`\`\`python
import math
a, b, c = 1.0, 1e8, 1.0
s = math.sqrt(b*b - 4*a*c)
q = -0.5 * (b + math.copysign(s, b))
print(q / a, c / q)        # -100000000.0  -1e-08
\`\`\`` },
      { label: 'Sense check', text: t`The product of the roots is $(-10^8)(-10^{-8}) = 1 = c/a$, as it must be; the textbook root gives $${(NAIVE_1E8 * -1e8).toFixed(3)}$ instead. The true small root is $-10^{-8} - 10^{-24} - \ldots$, so the stable value \`${py(STABLE_1E8)}\` is correct to every printed digit.` },
    ],
    answer: t`$x \approx -1.0000000000000000\times10^{-8}$; the textbook formula's $-7.45\times10^{-9}$ is 25% off, all of it cancellation.`,
  },
  practice: [
    num({
      id: 'gamma-digits', difficulty: 2,
      gen(r) {
        const [what, v] = r.pick([['the International Space Station', 7660], ['a GPS satellite', 3874], ['Voyager 1, leaving the Solar System', 17000], ['Parker Solar Probe at its fastest', 191700]]);
        const beta = v / C, small = (beta * beta) / 2, digits = Math.log10(small / EPS);
        return {
          prompt: t`For ${what}, moving at ${v.toLocaleString('en-US')} m/s, a program computes $\gamma - 1$ as below. The answer is about $\beta^2/2 = ${tex(small)}$, while $\gamma$ itself is a float near 1 with relative error up to about $\varepsilon = 2.2\times10^{-16}$. Roughly how many significant digits of the result can be trusted?

\`\`\`python
gamma_minus_1 = 1 / math.sqrt(1 - (v / c)**2) - 1
\`\`\``,
          answer: digits, tol: { rel: 0, abs: 1 },
          errors: [{ value: 16 - digits, feedback: 'That counts the digits lost, not the digits kept.' }],
          hints: [t`The subtraction amplifies the relative error by $\lvert a\rvert/\lvert a - b\rvert = 1/${tex(small)}$.`, t`Relative error $\approx \varepsilon/${tex(small)}$; the trustworthy digits are about $-\log_{10}$ of that.`],
          teach: 'Subtracting 1 from a number that is 1 + δ leaves a relative error of about ε/δ: you keep about log₁₀(δ/ε) digits.',
          explain: t`$\varepsilon/${tex(small)} = ${tex(EPS / small)}$, so about ${Math.round(digits)} digits survive of 16. Rewrite instead: $\gamma - 1 = \dfrac{\beta^2}{\sqrt{1 - \beta^2}\,\left(1 + \sqrt{1 - \beta^2}\right)}$, which subtracts nothing and keeps all 16.`,
        };
      },
    }),
    mcq({
      id: 'rewrite-sqrt', difficulty: 2,
      prompt: t`For large $x$ the quantity $\sqrt{x^2 + 1} - x \approx 1/(2x)$ comes out as exactly 0 beyond $x \approx 10^8$, where the red dots stop. Which rewrite fixes it?

\`\`\`python
d = math.sqrt(x**2 + 1) - x
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [1.8, 10.2], y: [-11, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '√(x² + 1) − x',
          curves: [{ fn: `-x - ${Math.log10(2)}`, color: 'accent', width: 2 }],
          points: SQ.filter(([, d]) => d > 0).map(([L, d]) => ({ x: L, y: Math.log10(d), color: 'bad', r: 3 })),
          legend: [{ label: 'true value, ≈ 1/(2x)', color: 'accent' }, { label: 'math.sqrt(x**2 + 1) - x', color: 'bad', point: true }], legendAt: 'bl' },
        caption: 'Computed in double precision. Past x ≈ 10⁸ the computed difference is exactly 0, so no red dots appear. Before that the dots look right at this scale, but they carry fewer correct digits as x grows: about 16 − 2 log₁₀ x.',
      },
      choices: [
        '`d = 1 / (math.sqrt(x**2 + 1) + x)`: multiply and divide by the sum, so nothing nearly equal is subtracted',
        '`d = np.sqrt(x**2 + 1) - x`: NumPy is more accurate than `math`',
        '`d = math.sqrt(x*x + 1.0) - x`: write the square as a product',
        '`d = math.sqrt(x**2 + 1) - x` with x stored as `np.float64`',
      ],
      answer: 0,
      why: {
        1: 'Both libraries give the correctly rounded square root; the cancellation happens afterwards, in the subtraction.',
        2: 'x*x and x**2 give the same float; the trouble is subtracting two nearly equal numbers.',
        3: 'Python floats already are float64; there is nothing more to gain.',
      },
      hints: ['Multiply by (√(x² + 1) + x)/(√(x² + 1) + x), which is 1.', '(√(x²+1) − x)(√(x²+1) + x) = x² + 1 − x² = 1.'],
      teach: 'When a difference of nearly equal terms is the problem, transform it algebraically — conjugates, trigonometric identities, series — into a form with no subtraction.',
      explain: t`$\sqrt{x^2+1} - x = \dfrac{1}{\sqrt{x^2+1} + x}$ exactly, and the right-hand side only adds positive numbers, so it is accurate to the last digit at any $x$. At $x = 10^8$ the naive form gives 0.0; the rewrite gives $5\times10^{-9}$. The same trick fixes the escape-velocity margin $\sqrt{v^2 + v_e^2} - v$ and many relativistic formulas.`,
    }),
    code({
      id: 'stable-roots', difficulty: 3,
      prompt: t`Write \`roots(a, b, c)\` returning the two real roots of $ax^2 + bx + c = 0$ (assume $b^2 > 4ac$ and $b \ne 0$) as a tuple, computed **without cancellation**: $q = -\tfrac12\left(b + \operatorname{sign}(b)\sqrt{b^2 - 4ac}\right)$, then $q/a$ and $c/q$.`,
      starter: t`import math

def roots(a, b, c):
    s = math.sqrt(b*b - 4*a*c)
    return (-b + s) / (2*a), (-b - s) / (2*a)
`,
      answer: t`import math

def roots(a, b, c):
    s = math.sqrt(b*b - 4*a*c)
    q = -0.5 * (b + math.copysign(s, b))
    return q / a, c / q

print(roots(1.0, 1e8, 1.0))`,
      tests: [
        { name: t`$x^2 - 3x + 2$: the roots 1 and 2`, code: 'sorted(roots(1.0, -3.0, 2.0)) == [1.0, 2.0]' },
        { name: t`$x^2 + 10^8x + 1$: the small root is $-10^{-8}$ to 14 digits`, code: 'abs(max(roots(1.0, 1e8, 1.0)) / -1e-8 - 1) < 1e-14' },
        { name: t`$x^2 - 10^8x + 1$ (negative $b$): the small root is $+10^{-8}$`, code: 'abs(min(roots(1.0, -1e8, 1.0)) / 1e-8 - 1) < 1e-14' },
        { name: t`$2x^2 + 4\times10^{6}x + 3$ ($a \ne 1$)`, code: 'abs(max(roots(2.0, 4e6, 3.0)) / (-0.75e-6) - 1) < 1e-9' },
      ],
      hints: ['`math.copysign(s, b)` is s carrying the sign of b, so b and it always add, never cancel.', '`q = -0.5 * (b + math.copysign(s, b))`, then `return q / a, c / q`.'],
      teach: 'Compute the large root without cancellation and get the small one from the product of the roots, c/a.',
      explain: t`Taking $\operatorname{sign}(b)\sqrt{\cdots}$ makes $b$ and the square root have the same sign, so $q$ is a sum, never a near-cancelling difference. The second root then comes from Vieta's $x_1x_2 = c/a$, a division, which is always accurate. The starter's textbook formula fails the two tests with a huge $\lvert b\rvert$.`,
    }),
    mcq({
      id: 'expm1', difficulty: 2,
      prompt: t`Uranium-238 has a decay constant $\lambda = 4.92\times10^{-18}\ \text{s}^{-1}$. What is printed for the probability that a given nucleus decays within one second?

\`\`\`python
import math
lam = math.log(2) / (4.468e9 * 3.15576e7)      # per second
print(1 - math.exp(-lam), -math.expm1(-lam))
\`\`\``,
      choices: ['`0.0 4.915959875924379e-18`', '`4.915959875924379e-18 4.915959875924379e-18`', '`0.0 0.0`', '`1.0 4.915959875924379e-18`'],
      answer: 0,
      why: {
        1: 'exp(−4.9 × 10⁻¹⁸) is 1 − 4.9 × 10⁻¹⁸, which rounds to exactly 1.0; then 1 − 1.0 is 0.',
        2: '`expm1(x)` computes eˣ − 1 directly, without ever forming eˣ, so it keeps every digit for tiny x.',
        3: 'exp of a tiny negative number is just below 1, not near 0.',
      },
      hints: ['How close to 1 is exp(−5 × 10⁻¹⁸)? Compare with the spacing of floats near 1.', '`math.expm1(x)` is designed to return eˣ − 1 for small x without cancellation.'],
      teach: 'Use `expm1(x)` for eˣ − 1 and `log1p(x)` for ln(1 + x) when x is small: they never form the nearly-1 intermediate that cancels.',
      explain: t`\`math.exp(-lam)\` is within $5\times10^{-18}$ of 1, closer than the float spacing near 1, so it is exactly 1.0 and the difference is 0. \`-math.expm1(-lam)\` returns $4.92\times10^{-18}$, correct to all digits. NumPy has \`np.expm1\` and \`np.log1p\` for arrays.`,
    }),
    mcq({
      id: 'absorb', difficulty: 2,
      prompt: t`A million tiny contributions, $10^{-16}$ each, are added to 1. What does this print?

\`\`\`python
import math
s = 1.0
for _ in range(10**6):
    s += 1e-16
print(s, math.fsum([1.0] + [1e-16] * 10**6))
\`\`\``,
      choices: ['`1.0 1.0000000001`', '`1.0000000001 1.0000000001`', '`1.0 1.0`', '`1.0000000002 1.0000000001`'],
      answer: 0,
      why: {
        1: 'Each `s += 1e-16` is rounded on its own: 1 + 10⁻¹⁶ is less than half a float spacing above 1, so it rounds back to 1.0 every time.',
        2: '`math.fsum` tracks the parts each addition loses and adds them back; it returns the correctly rounded sum.',
        3: 'Rounding never adds error in one direction here: every step rounds back down to exactly 1.0.',
      },
      hints: ['What is 1.0 + 10⁻¹⁶ in floats? The spacing just above 1 is 2.2 × 10⁻¹⁶.', 'If every single addition rounds back to 1.0, how much do a million of them add?'],
      teach: 'Adding many small numbers to a large one can lose them all (absorption); add small terms first, or use `math.fsum`.',
      explain: t`$1 + 10^{-16}$ rounds to 1.0, so the loop's total never moves: $10^{-10}$ is lost entirely. \`math.fsum\` keeps the rounding errors and returns $1 + 10^{-10}$ exactly rounded. Since Python 3.12 the built-in \`sum()\` of floats also compensates; an explicit loop like this one does not — and neither does a running total in a simulation.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-relativistic-ke', difficulty: 3, transfer: true,
      prompt: t`Write \`ke(m, v)\` returning the relativistic kinetic energy $(\gamma - 1)mc^2$ in joules, accurate to near machine precision **even at orbital speeds**. Use $\gamma - 1 = \dfrac{\beta^2}{\sqrt{1 - \beta^2}\,\left(1 + \sqrt{1 - \beta^2}\right)}$ with $\beta = v/c$, which subtracts nothing.`,
      starter: t`import math

c = 299792458.0

def ke(m, v):
    gamma = 1 / math.sqrt(1 - (v / c)**2)
    return (gamma - 1) * m * c**2
`,
      answer: t`import math

c = 299792458.0

def ke(m, v):
    b2 = (v / c)**2
    s = math.sqrt(1 - b2)
    return b2 / (s * (1 + s)) * m * c**2

print(ke(420e3, 7660))`,
      tests: [
        { name: t`the ISS (420 t at 7.66 km/s) to 12 digits: ½mv²(1 + ¾β² + ⅝β⁴)`, code: 'abs(ke(420e3, 7660) / (0.5 * 420e3 * 7660**2 * (1 + 0.75 * (7660 / c)**2 + 0.625 * (7660 / c)**4)) - 1) < 1e-12' },
        { name: t`at $\beta = 0.6$, $\gamma = 1.25$ and $K = \tfrac14 mc^2$`, code: 'abs(ke(1.0, 0.6 * c) / (0.25 * c**2) - 1) < 1e-14' },
        { name: 'a slow electron (1 m/s) matches ½mv²', code: 'abs(ke(9.109e-31, 1.0) / (0.5 * 9.109e-31) - 1) < 1e-12' },
      ],
      hints: ['Set `b2 = (v / c)**2` and `s = math.sqrt(1 - b2)` — neither subtracts nearly equal numbers that matter.', '`return b2 / (s * (1 + s)) * m * c**2`.'],
      teach: 'Rewrite γ − 1 so it never subtracts 1 from a number near 1; the identity uses (1 − s)(1 + s) = 1 − s² = β².',
      explain: t`For the ISS, $\beta^2 \approx 6.5\times10^{-10}$; the starter's $\gamma - 1$ subtracts 1 from $1 + 3.3\times10^{-10}$ and keeps about 6 digits, failing the 12-digit test. The identity $1 - s = \beta^2/(1 + s)$ removes the subtraction. ($1 - \beta^2$ does subtract, but from 1 a number much smaller than 1: no cancellation.) Kinetic energy: $${((0.5 * 420e3 * 7660 ** 2) / 1e12).toFixed(1)}$ TJ.`,
    }),
    mcq({
      id: 'cp-variance', difficulty: 2,
      prompt: t`A timing system logs event times in seconds since 1 January 1970 — about $10^9$ — with a jitter of 1 ms. What goes wrong?

\`\`\`python
rng = np.random.default_rng(1)
t = 1e9 + rng.normal(0, 1e-3, 1000)
print(np.mean(t**2) - np.mean(t)**2, np.var(t))
\`\`\``,
      choices: [
        'The one-pass formula prints 128.0 instead of about 10⁻⁶: t² ≈ 10¹⁸ is stored to the nearest 128, then two such numbers are subtracted',
        'Both print about 10⁻⁶; they are the same formula',
        'Both are garbage; floats cannot handle times this large',
        '`np.var` fails because the times are too close together',
      ],
      answer: 0,
      why: {
        1: 'Algebraically yes; numerically, ⟨t²⟩ − ⟨t⟩² subtracts two numbers near 10¹⁸ to get one near 10⁻⁶.',
        2: '`np.var` subtracts the mean first, t − ⟨t⟩, then squares small numbers: the cancellation happens on numbers near 10⁹, which keep the jitter to about 10⁻⁷ s.',
        3: '`np.var` is fine — it never squares the large numbers.',
      },
      hints: ['How big is t²? What is the float spacing there?', 'The variance is 10⁻⁶ s². Can a difference of two numbers near 10¹⁸ resolve that?'],
      teach: 'Never compute a variance as ⟨x²⟩ − ⟨x⟩² for data with a large offset; subtract the mean first (np.var does), or subtract a reference value from the data.',
      explain: t`Near $10^{18}$ floats are 128 apart, so $\langle t^2\rangle$ and $\langle t\rangle^2$ agree to within a few spacings and their difference is 0, 128, −256 … depending on the data — this seed gives 128.0, even a *negative* variance is possible. \`np.var\` computes $\langle(t - \bar t)^2\rangle$ and gets $1.0\times10^{-6}\ \text{s}^2$. Better still, store times relative to a nearby epoch.`,
    }),
    num({
      id: 'cp-pound-rebka', difficulty: 3, transfer: true,
      gen(r) {
        const [what, h] = r.pick([['the 22.5 m tower at Harvard used by Pound and Rebka in 1960', 22.5], ['a 100 m drop tower', 100], ['a 1 m height difference, as in an optical-clock comparison', 1]]);
        const shift = (9.81 * h) / C ** 2, bound = EPS / shift;
        return {
          prompt: t`Light climbing ${what} is redshifted by a fraction $gh/c^2 = ${tex(shift)}$. A student computes it as the ratio of two clock rates, each a float near 1, minus 1. Using the bound $\varepsilon\lvert a\rvert/\lvert a - b\rvert$ with $\varepsilon = 2.2\times10^{-16}$, how large could the **relative** error of the computed shift be? (Give it as a fraction, not a percentage.)

\`\`\`python
shift = rate_top / rate_bottom - 1
\`\`\``,
          answer: bound, tol: { rel: 0.03 },
          errors: [{ value: EPS, feedback: 'That is the error of each rate. The subtraction divides the result by a tiny number, amplifying the relative error by 1/shift.' }, { value: 100 * bound, feedback: 'Give the fraction, not a percentage.' }],
          hints: [t`Here $a \approx 1$ and $a - b$ is the shift itself, $${tex(shift)}$.`, t`Bound $= \varepsilon/(gh/c^2) = 2.2\times10^{-16}/${tex(shift)}$.`],
          teach: 'A relativistic shift computed as a ratio of nearly equal rates minus 1 keeps only log₁₀(shift/ε) digits; compute the small quantity directly (gh/c²) instead.',
          explain: t`$${tex(EPS)}/${tex(shift)} = ${tex(bound, 2)}$: ${bound > 0.5 ? 'the result could be entirely round-off' : bound > 0.01 ? `the computed shift could be off by ${(100 * bound).toFixed(0)}%` : `about ${Math.floor(-Math.log10(bound))} digits survive`}. Computing the small quantity directly — $gh/c^2$, or a series in it — keeps all 16 digits. Pound and Rebka measured this shift with gamma rays to about 10% in 1960; optical clocks now see the shift over centimetres.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Goldberg (1991), What every computer scientist should know about floating-point arithmetic (cancellation, the quadratic formula)', url: 'https://doi.org/10.1145/103162.103163' },
    { label: 'Press et al., Numerical Recipes, §5.6: Quadratic and cubic equations', url: 'https://numerical.recipes/' },
    { label: 'Python documentation: math.fsum, math.expm1, math.log1p', url: 'https://docs.python.org/3/library/math.html' },
    { label: 'Pound & Rebka (1960), Apparent weight of photons, Physical Review Letters 4, 337', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
  ],
});
