// Secant and safeguarded methods — the analyst's view: the secant method's
// error recursion e₍ₙ₊₁₎ ≈ C eₙ e₍ₙ₋₁₎ and its golden-ratio order, efficiency
// per function evaluation, why false position stalls, and how Brent-style
// safeguards marry bisection's guarantee to superlinear speed. The cooling
// eigenvalue λ tan λ = Bi of a slab (a heat-shield tile), shooting problems.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg, seg, secant, bisection } from './_num.js';

const t = String.raw;
const PHI = (1 + Math.sqrt(5)) / 2;

// ── the slab-cooling eigenvalue: λ tan λ = Bi, first root in (0, π/2) ──
const slab = (Bi) => (x) => x * Math.tan(x) - Bi;
const lam1 = (Bi) => { const S = bisection(slab(Bi), 1e-9, Math.PI / 2 - 1e-9, 80); return S[S.length - 1].m; };
const F1 = slab(1);
const R1 = lam1(1);
const SEC = secant(F1, 0.5, 1.2, 8);
const SEC_E = SEC.map((x) => Math.abs(x - R1));
// false position on the same bracket
const RF = [];
{ let a = 0.5, b = 1.2; for (let k = 0; k < 10; k++) { const c = b - (F1(b) * (b - a)) / (F1(b) - F1(a)); RF.push([a, b, c]); if (Math.sign(F1(c)) === Math.sign(F1(a))) a = c; else b = c; } }
const RF_E = RF.map(([, , c]) => Math.abs(c - R1));

// the order of a method that interpolates the last k iterates: the positive root of pᵏ = pᵏ⁻¹ + … + 1
const orderK = (k) => { let p = 2; for (let i = 0; i < 100; i++) { let f = p ** k, d = k * p ** (k - 1); for (let j = 0; j < k; j++) { f -= p ** j; d -= j ? j * p ** (j - 1) : 0; } p -= f / d; } return p; };

export default lesson({
  id: 'st-f.F3.3',
  title: 'Secant and safeguarded methods',
  minutes: 13, difficulty: 3,
  intro: t`Newton’s method needs $f'$. When the derivative is unavailable or costly — $f$ is a whole simulation, or a table — replace the tangent by the **secant** through the last two iterates:

$$x_{n+1} = x_n - f(x_n)\,\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}, \qquad \lvert e_{n+1}\rvert \approx C\,\lvert e_n\rvert\,\lvert e_{n-1}\rvert$$

with the same $C = \lvert f''(r)/(2f'(r))\rvert$ as Newton. Because the new error is the product of the last *two*, the order is the golden ratio $\varphi = \tfrac{1 + \sqrt5}{2} \approx 1.618$ — less than Newton’s 2, but with **one** function evaluation per step instead of two. Neither method is safe far from the root, so robust codes (such as SciPy’s \`brentq\`, used in [Scientific Programming](#/lesson/prog.P9.2)) **safeguard** them: keep a bracket, take the fast step when it stays inside, and bisect when it does not.`,
  symbols: [
    { tex: t`x_{n-1},\ x_n`, text: 'the last two iterates; the secant method needs two starting values' },
    { tex: t`\frac{f(x_n) - f(x_{n-1})}{x_n - x_{n-1}}`, text: 'the slope of the secant: a difference quotient standing in for $f\'(x_n)$' },
    { tex: t`e_n = x_n - r`, text: 'the error of iterate $n$' },
    { tex: 'C', text: 'the same constant as Newton’s, $\\lvert f\'\'(r)/(2f\'(r))\\rvert$' },
    { tex: t`\varphi \approx 1.618`, text: 'the secant method’s order: the positive root of $p^2 = p + 1$' },
  ],
  why: 'In shooting methods, orbit design and parameter searches each evaluation of f is an entire integration with no derivative available; the secant method and its safeguarded cousins are what such codes actually use.',
  visual: {
    type: 'code-runner',
    title: 'Five root finders, one budget',
    lead: t`Press **Run**. Each method solves $\lambda\tan\lambda = 1$ (the cooling eigenvalue of a slab, below) from the bracket $[0.5, 1.2]$, counting **function evaluations**. The plot shows error against evaluations: bisection’s straight line, false position stalling, and the superlinear curves of secant, Newton (two evaluations per step: $f$ and $f'$) and \`brentq\`.`,
    tasks: [
      'Read the table: which method reaches 10⁻¹² in the fewest evaluations?',
      'Change the bracket to [0.1, 1.5]: false position gets even slower; bisection’s count barely moves.',
      'Start Newton at x = 0.2 instead of b: its first step jumps past π/2 onto another branch of tan — which is why codes safeguard it.',
    ],
    params: {
      rows: 24,
      code: t`import math
import matplotlib.pyplot as plt
from scipy.optimize import brentq

f  = lambda x: x * math.tan(x) - 1
df = lambda x: math.tan(x) + x / math.cos(x)**2
a, b = 0.5, 1.2
root = brentq(f, a, b, xtol=1e-15)
hist = {}

def record(name, xs_per_eval):          # list of (evaluations used, estimate)
    hist[name] = [(n, abs(x - root)) for n, x in xs_per_eval]

# bisection: one evaluation per step
lo, hi, out = a, b, []
for n in range(1, 45):
    m = (lo + hi) / 2
    if (f(m) < 0) == (f(lo) < 0): lo = m
    else: hi = m
    out.append((n + 2, m))
record("bisection", out)

# false position: the secant through the bracket ends
lo, hi, out = a, b, []
for n in range(1, 45):
    c = hi - f(hi) * (hi - lo) / (f(hi) - f(lo))
    if (f(c) < 0) == (f(lo) < 0): lo = c
    else: hi = c
    out.append((n + 2, c))
record("false position", out)

# secant: the last two iterates, one new evaluation per step
x0, x1, out = a, b, []
for n in range(1, 12):
    if f(x1) == f(x0): break
    x0, x1 = x1, x1 - f(x1) * (x1 - x0) / (f(x1) - f(x0))
    out.append((n + 2, x1))
record("secant", out)

# Newton from the right end: f and f' each cost one evaluation
x, out = b, []
for n in range(1, 8):
    x = x - f(x) / df(x)
    out.append((2 * n, x))
record("Newton", out)

for name, h in hist.items():
    hit = next((n for n, e in h if e < 1e-12), None)
    print(f"{name:15s} reaches 1e-12 after {hit} evaluations")
r, info = brentq(f, a, b, xtol=1e-14, full_output=True)
print(f"{'brentq':15s} converged with {info.function_calls} evaluations")

fig, ax = plt.subplots()
for name, h in hist.items():
    ax.semilogy([n for n, e in h], [max(e, 1e-17) for n, e in h], "o-", label=name)
ax.set_xlabel("function evaluations")
ax.set_ylabel("error")
ax.set_ylim(1e-17, 1)
ax.legend()
plt.show()`,
    },
    caption: 'Evaluation counts include the two bracket ends for the bracketing methods. The Newton count charges f′ as one evaluation; for a real simulation a derivative can cost far more, or be unavailable.',
  },
  example: {
    prompt: t`Show that $\lvert e_{n+1}\rvert \approx C\lvert e_n\rvert\lvert e_{n-1}\rvert$ gives order $\varphi$, check it on $\lambda\tan\lambda = 1$ from $x_0 = 0.5$, $x_1 = 1.2$, and decide whether secant beats Newton per function evaluation.`,
    visual: {
      type: 'graph',
      params: { x: [-0.4, 9.4], y: [-16.5, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'iterate n', ylabel: 'error |xₙ − r|',
        points: SEC_E.map((e, n) => ({ x: n, y: n12(lg(Math.max(e, 1e-16))), r: 4.5, color: e > 0 ? 'accent' : 'ink3' })) },
      caption: 'Errors of the secant iterates on a logarithmic axis (the last, exact to double precision, is drawn at 10⁻¹⁶). Each drop is about φ times the previous one.',
    },
    steps: [
      { label: 'Assume a power law', text: t`Suppose $\lvert e_{n+1}\rvert \approx A\lvert e_n\rvert^p$ for large $n$. Then also $\lvert e_n\rvert \approx A\lvert e_{n-1}\rvert^p$, so $\lvert e_{n-1}\rvert \approx (\lvert e_n\rvert/A)^{1/p}$.` },
      { label: 'Match the powers', text: t`Substitute into $\lvert e_{n+1}\rvert \approx C\lvert e_n\rvert\lvert e_{n-1}\rvert$: $A\lvert e_n\rvert^p \approx C A^{-1/p}\lvert e_n\rvert^{1 + 1/p}$. For this to hold as $e_n \to 0$ the exponents must agree: $p = 1 + 1/p$, i.e. $p^2 = p + 1$, so $p = \tfrac{1 + \sqrt5}{2} = ${PHI.toFixed(4)}$.` },
      { label: 'Measure it', text: t`The errors are $${SEC_E.slice(4, 8).map((e) => tex(e, 2)).join(',\\ ')}$. From the last three, $p \approx \ln(e_7/e_6)/\ln(e_6/e_5) = ${(Math.log(SEC_E[7] / SEC_E[6]) / Math.log(SEC_E[6] / SEC_E[5])).toFixed(2)}$, close to $\varphi$ (the first iterates are pre-asymptotic). The root is $\lambda_1 = ${R1.toFixed(10)}$.` },
      { label: 'Count the cost', text: t`Per evaluation, a method of order $p$ costing $k$ evaluations per step multiplies the digits by $p^{1/k}$ — its **efficiency index**. Newton: $2^{1/2} = 1.414$. Secant: $\varphi^{1/1} = 1.618$. If $f'$ costs as much as $f$, the secant method is faster.` },
      { label: 'Sense check', text: t`Newton wins when $f'$ comes almost free (a polynomial, or an analytic derivative computed alongside $f$); the secant method wins when $f'$ would need a second simulation or a finite difference.` },
    ],
    answer: t`$p = \varphi \approx 1.618$; measured $\approx ${(Math.log(SEC_E[7] / SEC_E[6]) / Math.log(SEC_E[6] / SEC_E[5])).toFixed(2)}$. Per evaluation the secant method (1.618) beats Newton (1.414).`,
  },
  practice: [
    num({
      id: 'secant-step', difficulty: 1,
      gen(r) {
        const Bi = r.pick([0.5, 1, 2, 4]);
        const f = slab(Bi);
        const R = lam1(Bi), w = r.pick([0.2, 0.3]);
        const x0 = Math.round((R - w) * 20) / 20, x1 = Math.round(Math.min(R + 0.2, 1.5) * 20) / 20;
        const ans = x1 - (f(x1) * (x1 - x0)) / (f(x1) - f(x0));
        return {
          prompt: t`Take one secant step for $f(\lambda) = \lambda\tan\lambda - ${Bi}$ from $\lambda_0 = ${x0}$ and $\lambda_1 = ${x1}$ (radians). What is $\lambda_2$, to 4 significant figures?`,
          visual: {
            type: 'graph',
            params: { x: [0.1, 1.55], y: [-Bi - 0.5, Math.max(4.5, f(x1) + 1)], aspect: 'wide', axesAt: 'edge', xlabel: 'λ', ylabel: 'f(λ)',
              curves: [{ fn: `x*tan(x) - ${Bi}`, color: 'accent', width: 2.2, domain: [0.1, 1.52] }, { fn: '0', color: 'ink4', width: 1 }, seg(x0, f(x0), x1, f(x1), { color: 'gold', width: 1.8 })],
              points: [{ x: x0, y: n12(f(x0)), r: 4.5, color: 'gold', label: 'λ₀', labelDx: -16, labelDy: -10 }, { x: x1, y: n12(f(x1)), r: 4.5, color: 'gold', label: 'λ₁', labelDx: 8, labelDy: -6 }] },
            caption: 'The function and the secant through the two starting points; where the gold chord, extended, meets the axis is λ₂.',
          },
          answer: ans, tol: { rel: 0.0005 },
          hints: [t`$f(${x0}) = ${f(x0).toFixed(4)}$ and $f(${x1}) = ${f(x1).toFixed(4)}$.`, t`$\lambda_2 = \lambda_1 - f(\lambda_1)\dfrac{\lambda_1 - \lambda_0}{f(\lambda_1) - f(\lambda_0)}$.`],
          teach: 'A secant step is a Newton step with the derivative replaced by the slope through the last two points.',
          explain: t`$\lambda_2 = ${x1} - ${f(x1).toFixed(4)} \times \dfrac{${(x1 - x0).toFixed(2)}}{${(f(x1) - f(x0)).toFixed(4)}} = ${ans.toFixed(4)}$. The root is $${lam1(Bi).toFixed(4)}$: one step has already gone a good part of the way.`,
        };
      },
    }),
    num({
      id: 'efficiency', difficulty: 2,
      gen(r) {
        const [p, k, name, pTeX] = r.pick([
          [3, 3, 'Halley’s method (order 3; needs f, f′ and f″ each step)', '3'],
          [2, 2, 'Steffensen’s method (order 2; two evaluations of f per step, no derivative)', '2'],
          [2, 1.5, 'Newton’s method when f′ costs only half as much as f (order 2; 1.5 evaluations per step)', '2'],
          [orderK(3), 1, 'inverse quadratic interpolation (order 1.839; one new evaluation per step)', '1.839'],
        ]);
        const ans = p ** (1 / k);
        return {
          prompt: t`The **efficiency index** of a method of order $p$ that costs $k$ function evaluations per step is $p^{1/k}$. What is it for ${name}?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 3.6], y: [0, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'evaluations per step', ylabel: 'order',
              points: [{ x: 1, y: n12(PHI), r: 5, color: 'accent', label: 'secant: 1.618 per evaluation', labelDx: 10, labelDy: -10 }, { x: 2, y: 2, r: 5, color: 'gold', label: 'Newton: √2 = 1.414 per evaluation', labelDx: 10, labelDy: -10 }, { x: 1, y: 1, r: 5, color: 'ink3', label: 'bisection: order 1', labelDx: 10, labelDy: 12 }] },
            caption: 'Order against cost per step for three methods you know, with their efficiency indices.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: p / k, feedback: 'Orders compound multiplicatively: k evaluations give one step of order p, so one evaluation is worth the k-th root of p, not p/k.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['Per step the number of correct digits is multiplied by p.', t`Spread that over $k$ evaluations: each one multiplies the digits by $p^{1/k}$.`],
          teach: 'Order per step is not speed: dividing the order’s logarithm by the cost per step (the efficiency index p^(1/k)) is the fair comparison.',
          explain: t`$${pTeX}^{1/${k}} = ${ans.toFixed(3)}$, against the secant method’s $1.618$ and Newton’s $1.414$. ${ans > PHI ? 'This one beats the secant method per evaluation.' : 'The plain secant method is still the more efficient.'}`,
        };
      },
    }),
    mcq({
      id: 'false-position', difficulty: 2,
      prompt: t`**False position** (regula falsi) keeps a bracket like bisection but takes the secant point through the bracket’s ends instead of the midpoint. On $\lambda\tan\lambda = 1$ over $[0.5, 1.2]$ its estimates are $${RF.slice(0, 5).map(([, , c]) => c.toFixed(4)).join(',\\ ')}, \ldots$ and the right end stays at $1.2$ for ever. Why is it so slow?`,
      visual: {
        type: 'graph',
        params: { x: [0.45, 1.25], y: [-0.9, 2.3], aspect: 'wide', axesAt: 'edge', xlabel: 'λ', ylabel: 'f(λ)',
          curves: [{ fn: 'x*tan(x) - 1', color: 'accent', width: 2.2 }, { fn: '0', color: 'ink4', width: 1 }, ...RF.slice(0, 5).map(([a, b]) => seg(a, F1(a), b, F1(b), { color: 'gold', width: 1.3 }))],
          points: [{ x: 1.2, y: n12(F1(1.2)), r: 5, color: 'bad', label: 'stuck end', labelDx: -64, labelDy: -6 }] },
        caption: 'The first five false-position chords: all pivot on the same right end, because the function is convex and every new point lands left of the root.',
      },
      choices: [
        'f is convex here, so every chord crosses the axis on the same side of the root; one end never moves and convergence is only linear',
        'False position is a form of bisection, so it is linear with rate ½',
        'The chord slope is computed with cancellation, so round-off dominates',
        'The bracket is too wide for any method',
      ],
      answer: 0,
      why: {
        1: 'Its rate here is about 0.5 only by coincidence of this example; in general it depends on f and can be far worse than bisection’s.',
        2: 'The errors are far above round-off; the stall is geometric.',
        3: 'Bisection on the same bracket gains a binary digit per step without trouble.',
      },
      hints: ['Look at the picture: which end of the bracket do the chords keep using?', 'With one end fixed, each step is a secant step that keeps using an old, distant point — so the error no longer multiplies by a shrinking eₙ₋₁.'],
      teach: 'False position keeps the bracket but loses the secant method’s speed when one end stops moving; the cure (Illinois, Brent) is to stop reusing a stale end.',
      explain: t`With $e_{n-1}$ frozen at $1.2 - r \approx 0.34$, the secant recursion $e_{n+1} \approx Ce_ne_{n-1}$ becomes $e_{n+1} \approx (C \times 0.34)\,e_n$: linear. The *Illinois* fix halves the stored $f$ value at an end that has been kept twice, which tilts the next chord and gets that end moving again.`,
    }),
    num({
      id: 'order-k', difficulty: 3,
      gen(r) {
        const [k, name] = r.pick([[2, 'the secant method (a line through 2 points)'], [3, 'inverse quadratic interpolation, used inside Brent’s method (a parabola through 3 points)'], [4, 'a cubic through the last 4 points']]);
        const ans = orderK(k);
        return {
          prompt: t`For ${name}, the error obeys $\lvert e_{n+1}\rvert \approx C${Array.from({ length: k }, (_, j) => (j ? t`\lvert e_{n-${j}}\rvert` : t`\lvert e_n\rvert`)).join('')}$. Its order $p$ is the positive root of $p^{${k}} = ${Array.from({ length: k }, (_, j) => (k - 1 - j === 0 ? '1' : k - 1 - j === 1 ? 'p' : `p^{${k - 1 - j}}`)).join(' + ')}$. Find $p$ to 3 decimal places.`,
          visual: {
            type: 'graph',
            params: { x: [1, 2.2], y: [-3, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'p', ylabel: 'g(p)',
              curves: [{ fn: `x^${k} - (${Array.from({ length: k }, (_, j) => `x^${j}`).join(' + ')})`, color: 'accent', width: 2.2 }, { fn: '0', color: 'ink4', width: 1 }] },
            caption: t`$g(p) = p^{${k}} - (${Array.from({ length: k }, (_, j) => (k - 1 - j === 0 ? '1' : k - 1 - j === 1 ? 'p' : `p^{${k - 1 - j}}`)).join(' + ')})$ on $1 \le p \le 2.2$: the order is where it crosses zero.`,
          },
          answer: ans, tol: { rel: 0, abs: 0.002 },
          errors: [{ value: 2, feedback: 'Order 2 would need the full derivative information of Newton; interpolating past points always falls short of 2.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Repeat the power-law argument: $\lvert e_{n-j}\rvert \approx \lvert e_n\rvert^{p^{-j}}$, so the exponents give $p = ${Array.from({ length: k }, (_, j) => (j === 0 ? '1' : j === 1 ? '1/p' : `1/p^{${j}}`)).join(' + ')}$.`, 'Solve the polynomial numerically — bisection on [1, 2] works.'],
          teach: 'Using more past points raises the order, but only towards 2: memory of old iterates never beats a true derivative.',
          explain: t`$p = ${ans.toFixed(4)}$. The sequence for $k = 2, 3, 4, \ldots$ is $1.618, 1.839, 1.928, \ldots \to 2$, so beyond three points the extra bookkeeping buys little — which is why Brent’s method stops at a parabola.`,
        };
      },
    }),
    code({
      id: 'safe-newton', difficulty: 3,
      prompt: t`Write \`safe_newton(f, df, a, b, tol=1e-14)\` for a bracket with $f(a)$, $f(b)$ of opposite signs. Start at the midpoint. At each step try the Newton point; **if it falls outside the current bracket, or $f'(x) = 0$, take the bisection midpoint instead**. Evaluate $f$ at the new point and shrink the bracket to the half that keeps the sign change. Stop when the step is below \`tol\` (or $f$ is exactly 0) and return \`(x, steps)\`. Plain Newton on $\arctan x$ from $x_0 = 3$ diverges; yours must not.`,
      starter: t`import math

def safe_newton(f, df, a, b, tol=1e-14):
    fa = f(a)
    x = (a + b) / 2
    steps = 0
    # loop: Newton step or bisection, then update the bracket
    return x, steps

x, n = safe_newton(math.atan, lambda x: 1 / (1 + x * x), -1.0, 3.0)
print(x, n)
`,
      answer: t`import math

def safe_newton(f, df, a, b, tol=1e-14):
    fa = f(a)
    x = (a + b) / 2
    steps = 0
    while steps < 200:
        fx, d = f(x), df(x)
        if fx == 0:
            return x, steps
        # keep the half of the bracket where the sign changes
        if (fx < 0) == (fa < 0):
            a, fa = x, fx
        else:
            b = x
        new = x - fx / d if d != 0 else None
        if new is None or not (a < new < b):
            new = (a + b) / 2
        steps += 1
        if abs(new - x) < tol:
            return new, steps
        x = new
    return x, steps

x, n = safe_newton(math.atan, lambda x: 1 / (1 + x * x), -1.0, 3.0)
print(x, n)`,
      tests: [
        { name: t`it finds the root of $\arctan$ from the bracket $[-1, 3]$`, code: 'abs(safe_newton(math.atan, lambda x: 1 / (1 + x * x), -1.0, 3.0)[0]) < 1e-12' },
        { name: 'and quickly: fewer than 15 steps', code: 'safe_newton(math.atan, lambda x: 1 / (1 + x * x), -1.0, 3.0)[1] < 15' },
        { name: t`it finds the slab eigenvalue $\lambda\tan\lambda = 1$ on $[0.5, 1.5]$`, code: 'abs(safe_newton(lambda x: x * math.tan(x) - 1, lambda x: math.tan(x) + x / math.cos(x)**2, 0.5, 1.5)[0] - 0.8603335890193798) < 1e-12' },
        { name: t`a flat start ($f'(0) = 0$ for $x^3 - 0.001$ on $[-1, 1]$) falls back to bisection and still converges`, code: 'abs(safe_newton(lambda x: x**3 - 0.001, lambda x: 3 * x * x, -1.0, 1.0)[0] - 0.1) < 1e-12' },
      ],
      hints: ['Inside a loop: evaluate f and f′ at x, update the bracket by the sign of f(x), then compute the Newton point.', 'If the Newton point is not strictly between a and b (or f′ is 0), replace it by (a + b)/2. Stop when |new − x| < tol.'],
      teach: 'A safeguard keeps a bracket and accepts the fast step only when it stays inside: the method can never do worse than bisection, and near the root it is pure Newton.',
      explain: t`From the midpoint 1, the first Newton point for $\arctan$ is $-0.57$, inside $[-1, 1]$ after the bracket update, so it is accepted — and from there Newton converges in a few steps. When a tangent would shoot out (as from 3, or at a flat point), the bisection step keeps the guarantee. This is the idea behind Numerical Recipes’ \`rtsafe\` and, with secant and inverse-quadratic steps instead of Newton, Brent’s method.`,
    }),
    mcq({
      id: 'brent', difficulty: 2,
      prompt: t`What does Brent’s method (SciPy’s \`brentq\`) guarantee, given a bracket $[a, b]$ with $f(a)f(b) < 0$ and a continuous $f$?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 40.5], y: [-16, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'function evaluations', ylabel: 'error bound',
          curves: [{ fn: `-x*${n12(lg(2))}`, color: 'ink3', dash: true, label: 'bisection', labelAt: 30, labelDx: 6, labelDy: -12 }],
          points: SEC_E.slice(0, 9).map((e, n) => ({ x: n + 2, y: n12(lg(Math.max(e, 1e-16))), r: 4, color: 'accent' })) },
        caption: 'The bisection bound (dashed) and the secant-like errors that Brent’s method achieves near a simple root (blue), against evaluations, logarithmic axis.',
      },
      choices: [
        'It always converges to a root in the bracket, needs at most about the square of bisection’s evaluation count, and near a simple root converges superlinearly',
        'It converges quadratically from any bracket',
        'It finds every root in the bracket',
        'It needs the derivative f′ to be supplied',
      ],
      answer: 0,
      why: {
        1: 'Its fast steps are secant and inverse-quadratic ones (order up to about 1.84), and far from the root it falls back on bisection.',
        2: 'Like bisection it converges to one root; which one depends on the iteration.',
        3: 'It uses only values of f.',
      },
      hints: ['Brent’s method combines bisection, secant and inverse quadratic interpolation steps.', 'Its worst case is bounded in terms of bisection’s; its best case is the fast steps’.'],
      teach: 'Brent’s method keeps bisection’s guarantee (a root, always, with a bounded worst case) and gets superlinear speed whenever the fast steps behave.',
      explain: 'Brent (1973) proved the method needs at most about N² evaluations, where N is the number bisection would need — and in practice it is usually much faster than bisection, because near a simple root it takes secant or inverse-quadratic steps. That combination of guarantee and speed is why it is the default bracketing root finder in SciPy, MATLAB (fzero) and Boost.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-shooting', difficulty: 2, transfer: true,
      prompt: t`A trajectory designer needs the burn $\Delta v$ that makes a lunar probe’s closest approach exactly 100 km. Each evaluation of “closest approach minus 100 km” is a full numerical integration taking a minute; no derivative is available, and from a rough survey the miss is negative at $\Delta v = 3.10$ km/s and positive at $3.20$ km/s. Which root finder fits best?`,
      visual: {
        type: 'graph',
        params: { x: [3.08, 3.22], y: [-900, 900], aspect: 'wide', axesAt: 'edge', xlabel: 'Δv (km/s)', ylabel: 'miss distance (km)',
          points: [{ x: 3.1, y: -640, r: 5, color: 'bad', label: 'survey: −', labelDx: 8, labelDy: -10 }, { x: 3.2, y: 520, r: 5, color: 'good', label: 'survey: +', labelDx: -60, labelDy: -10 }],
          hlines: [{ y: 0, color: 'ink3' }] },
        caption: 'Schematic: two survey runs bracket the target; the miss distance between them is unknown until each new run finishes.',
      },
      choices: [
        'A safeguarded secant method such as Brent’s: no derivative needed, superlinear speed, and the bracket guarantees it cannot wander',
        'Newton’s method, because it has the highest order',
        'Plain bisection, because it is the most reliable',
        'The secant method started far outside the bracket, to explore the space',
      ],
      answer: 0,
      why: {
        1: 'Newton needs dmiss/dΔv: a finite difference would double the cost of every step, wiping out its advantage.',
        2: 'It would work, but needs about 3.3 one-minute runs per digit where Brent’s method needs far fewer.',
        3: 'Unsafeguarded steps can leave the region where the integration even makes sense (an impact, an escape).',
      },
      hints: ['Count the cost per digit for each option, remembering there is no derivative.', 'Which method gives superlinear convergence with one evaluation per step and still keeps the bracket?'],
      teach: 'When each f is an expensive simulation with no derivative, a safeguarded secant-type method (Brent) gives the most digits per run without risk.',
      explain: 'Brent’s method needs only values of the miss, typically converges in under ten runs to a metre-level target, and can never leave [3.10, 3.20] km/s. This is the shooting method in its simplest form, a root finder wrapped round an integrator.',
    }),
    num({
      id: 'cp-biot', difficulty: 2, transfer: true,
      gen(r) {
        const Bi = r.pick([0.2, 0.5, 2, 5, 10]);
        const ans = lam1(Bi);
        return {
          prompt: t`A heat-shield tile of thickness $2L$ cools by convection from both faces. Its temperature decays as $e^{-\lambda_1^2 \alpha t/L^2}$, where $\lambda_1$ is the first positive root of $\lambda\tan\lambda = \text{Bi}$ in $(0, \pi/2)$ and the Biot number is $\text{Bi} = ${Bi}$. Find $\lambda_1$ to 4 significant figures (secant, bisection, \`brentq\` — your choice).`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.65], y: [-1, 12], aspect: 'wide', axesAt: 'edge', xlabel: 'λ', ylabel: 'λ tan λ',
              curves: [{ fn: 'x*tan(x)', color: 'accent', width: 2.2, domain: [0, 1.55] }],
              hlines: [{ y: Bi, label: `Bi = ${Bi}`, color: 'gold' }], vlines: [{ x: n12(Math.PI / 2), label: 'π/2', color: 'ink3' }] },
            caption: 'λ tan λ rises from 0 to infinity on (0, π/2), so it meets the level Bi exactly once there: a guaranteed bracket.',
          },
          answer: ans, tol: { rel: 0.0005 },
          errors: [{ value: Math.atan(Bi), feedback: 'That solves tan λ = Bi. The condition is λ tan λ = Bi.' }].filter((e) => Math.abs(e.value - ans) > 0.002 * ans),
          hints: [t`$f(\lambda) = \lambda\tan\lambda - ${Bi}$ is negative near 0 and positive just below $\pi/2$: bracket $[0.01, 1.57]$.`, t`A few secant steps from two points inside the bracket, or \`brentq(f, 0.01, 1.57)\`.`],
          teach: 'An eigenvalue condition from a boundary-value problem is a root-finding problem; knowing the function’s shape gives a bracket for free.',
          explain: t`$\lambda_1 = ${ans.toFixed(5)}$, so the tile’s temperature decays with time constant $L^2/(${(ans * ans).toFixed(4)}\,\alpha)$. ${Bi < 1 ? 'For small Bi, λ₁² ≈ Bi: the surface, not the interior, limits the cooling.' : 'For large Bi, λ₁ approaches π/2: conduction inside the tile limits the cooling.'}`,
        };
      },
    }),
    num({
      id: 'cp-secant-predict', difficulty: 3,
      gen(r) {
        const C = r.pick([0.5, 1.2, 2.5]), a = r.int(2, 4), b = r.int(a + 1, a + 3);
        const e1 = 10 ** -a, e2 = 10 ** -b;
        const ans = C * e1 * e2;
        return {
          prompt: t`The secant method is converging to a simple root with $C = \lvert f''(r)/(2f'(r))\rvert = ${C}$. Two successive errors are $e_{n-1} = 10^{-${a}}$ and $e_n = 10^{-${b}}$. Predict $\lvert e_{n+1}\rvert$.`,
          visual: {
            type: 'graph',
            params: { x: [0.5, 3.5], y: [-a - b - 2, 0], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step', ylabel: 'error', xticks: 3,
              points: [{ x: 1, y: -a, r: 5, color: 'accent', label: 'eₙ₋₁', labelDx: 8, labelDy: -10 }, { x: 2, y: -b, r: 5, color: 'accent', label: 'eₙ', labelDx: 8, labelDy: -10 }, { x: 3, y: -a - b - 1, r: 6, color: 'gold', hollow: true, label: '?', labelDx: 10, labelDy: -10 }] },
            caption: 'Schematic: the two known errors and the one to predict, logarithmic axis.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: C * e2 * e2, feedback: 'That is Newton’s rule, C eₙ². The secant method multiplies the last two errors.' }],
          hints: ['The secant error recursion is e₍ₙ₊₁₎ ≈ C eₙ e₍ₙ₋₁₎.', t`$${C} \times 10^{-${b}} \times 10^{-${a}}$.`],
          teach: 'The secant method’s next error is C times the product of the last two: the exponents of the errors grow like Fibonacci numbers, at rate φ.',
          explain: t`$${C} \times 10^{-${a}} \times 10^{-${b}} = ${tex(ans, 2)}$. The exponents add, $${a} + ${b} = ${a + b}$, as in the Fibonacci sequence — whose ratio of successive terms tends to $\varphi$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brent (1973), Algorithms for Minimization without Derivatives, Prentice-Hall, ch. 4', url: 'https://openlibrary.org/search?q=Algorithms+for+Minimization+without+Derivatives+Brent' },
    { label: 'Süli & Mayers (2003), An Introduction to Numerical Analysis, Cambridge, §1.5 (the secant method)', url: 'https://doi.org/10.1017/CBO9780511801181' },
    { label: 'Press et al., Numerical Recipes, 3rd ed., §9.2–9.4 (secant, false position, Brent, safeguarded Newton)', url: 'https://numerical.recipes/' },
    { label: 'Incropera et al., Fundamentals of Heat and Mass Transfer, §5.5 (transient conduction in a plane wall)', url: 'https://openlibrary.org/search?q=Fundamentals+of+Heat+and+Mass+Transfer+Incropera' },
  ],
});
