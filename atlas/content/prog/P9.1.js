// Bisection and Newton's method — one bit per step against digits doubling;
// Kepler's equation for Halley's comet by Newton, the innermost stable orbit
// of a spinning black hole by bisection, and the ways each method fails.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { seg } from './_numkit.js';

const t = String.raw;

// ── Kepler's equation E − e sin E = M for Halley's comet ──
const ECC = 0.967, PER = 75.3, A_AU = 17.83;
const kep = (e, M) => ({ f: (E) => E - e * Math.sin(E) - M, df: (E) => 1 - e * Math.cos(E) });
function newtonSeq(f, df, x0, n) { const xs = [x0]; for (let i = 0; i < n; i++) xs.push(xs[xs.length - 1] - f(xs[xs.length - 1]) / df(xs[xs.length - 1])); return xs; }
const M5 = (2 * Math.PI * 5) / PER;                       // 5 years after perihelion
const H5 = kep(ECC, M5);
const SEQ5 = newtonSeq(H5.f, H5.df, Math.PI, 8);
const E5 = SEQ5[SEQ5.length - 1];
const STEPS5 = SEQ5.slice(1).map((E, k) => ({ k: k + 1, E, dE: Math.abs(E - SEQ5[k]) })).filter((s, i, a) => i === 0 || a[i - 1].dE > 1e-15);
const R5 = A_AU * (1 - ECC * Math.cos(E5));
const NU5 = 2 * Math.atan(Math.sqrt((1 + ECC) / (1 - ECC)) * Math.tan(E5 / 2)) * 180 / Math.PI;
const fixedCount = (e, M, E) => { let x = M, k = 0; while (Math.abs(x - E) > 1e-12 && k < 1e5) { x = M + e * Math.sin(x); k++; } return k; };
const FIX5 = fixedCount(ECC, M5, E5);
const MH = (2 * Math.PI * 0.5) / PER, HH = kep(ECC, MH), EH = newtonSeq(HH.f, HH.df, Math.PI, 40).at(-1);
const FIXH = fixedCount(ECC, MH, EH);

// ── the Kerr ISCO, prograde: r² − 6r + 8a√r − 3a² = 0 (G = c = M = 1), and Bardeen–Press–Teukolsky's closed form ──
const iscoBPT = (a) => { const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a)), z2 = Math.sqrt(3 * a * a + z1 * z1); return 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2)); };
const ISCO69 = iscoBPT(0.69), ISCO9 = iscoBPT(0.9);

// ── a Newton error sequence and a bisection bound, for the checkpoint table ──
const KQ = kep(0.5, 1), SEQQ = newtonSeq(KQ.f, KQ.df, 1, 6), EQ = SEQQ.at(-1);
const NERR = SEQQ.slice(1, 5).map((x) => Math.abs(x - EQ));
const BERR = [1, 2, 3, 4].map((n) => Math.PI / 2 ** (n + 1));
const e2 = (x) => x.toExponential(1).replace(/e([+-])(\d)$/, (_, s, d) => `e${s}0${d}`);

export default lesson({
  id: 'prog.P9.1',
  title: 'Bisection and Newton’s method',
  minutes: 13, difficulty: 3,
  intro: t`Most equations in physics cannot be solved for the unknown with algebra: Kepler's equation, the innermost orbit of a spinning black hole, a nozzle's exit Mach number. Write the problem as $f(x) = 0$ and hunt the root. **Bisection** keeps a bracket $[a, b]$ where $f$ changes sign and halves it each step — slow (one binary digit per step) but guaranteed for a continuous $f$. **Newton's method** follows the tangent line down to the axis:

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$

Near a simple root its error is squared each step, so the number of correct digits roughly **doubles** — but from a bad start it can wander off or cycle for ever.`,
  symbols: [
    { tex: 'x_n', text: 'the current estimate of the root after $n$ steps' },
    { tex: 'x_{n+1}', text: 'the next estimate: where the tangent line at $x_n$ crosses zero' },
    { tex: 'f(x_n)', text: 'the function at the estimate (the residual): zero exactly at the root' },
    { tex: t`f'(x_n)`, text: 'its derivative there, the slope of the tangent line; Newton fails when it is near zero' },
  ],
  why: 'Every implicit equation in a simulation — an orbit’s position at a given time, an equilibrium, a shock’s Mach number, an implicit ODE step — is a root-finding call, usually Newton inside a safety net.',
  visual: {
    type: 'code-runner',
    title: 'Three ways to solve Kepler’s equation',
    lead: t`Press **Run**. Halley's comet half a year after perihelion: the eccentric anomaly $E$ solves $E - e\sin E = M$. The plot shows each method's error per iteration on a logarithmic axis. Bisection is a straight line (one bit per step), Newton plunges like a cliff, and the fixed-point loop of lesson P1.2 crawls.`,
    tasks: [
      'Count the iterations each method needs for 10⁻¹² (printed).',
      'Change years to 5.0: the fixed-point loop speeds up a lot (its rate is e cos E, now far from 1), Newton barely changes.',
      'Start Newton at E = M instead of π and watch its first step overshoot before the plunge.',
    ],
    params: {
      rows: 26,
      code: t`import numpy as np
import matplotlib.pyplot as plt

e, period = 0.967, 75.3               # Halley's comet: eccentricity, period in years
years = 0.5                           # time since perihelion
M = 2 * np.pi * years / period        # mean anomaly, rad
f  = lambda E: E - e * np.sin(E) - M  # Kepler's equation as f(E) = 0
df = lambda E: 1 - e * np.cos(E)

def bisection(a, b, n):
    xs = []
    for _ in range(n):
        m = 0.5 * (a + b)
        if f(a) * f(m) <= 0: b = m    # the sign change is in [a, m]
        else:                a = m
        xs.append(0.5 * (a + b))
    return xs

def newton(x, n):
    xs = []
    for _ in range(n):
        x = x - f(x) / df(x)
        xs.append(x)
    return xs

def fixed_point(x, n):                # lesson P1.2: E ← M + e sin E
    xs = []
    for _ in range(n):
        x = M + e * np.sin(x)
        xs.append(x)
    return xs

E_true = newton(np.pi, 60)[-1]        # a reference answer
n = 160
fig, ax = plt.subplots()
for name, xs in [("bisection on [0, π]", bisection(0, np.pi, n)),
                 ("Newton from E = π", newton(np.pi, n)),
                 ("fixed point from E = M", fixed_point(M, n))]:
    err = np.abs(np.array(xs) - E_true)
    hit = np.argmax(err < 1e-12) + 1 if (err < 1e-12).any() else None
    print(f"{name:24s} reaches 1e-12 after {hit} iterations")
    stop = np.argmax(err < 1e-15) + 1 if (err < 1e-15).any() else n   # plot until round-off level
    ax.semilogy(range(1, stop + 1), np.maximum(err[:stop], 1e-16), ".-", ms=4, label=name)
print(f"E = {E_true:.12f} rad, r = {17.83 * (1 - e * np.cos(E_true)):.3f} AU")
ax.set_ylim(1e-16, 10)
ax.set_xlabel("iteration")
ax.set_ylabel("|E − E_true| (rad)")
ax.legend()
plt.show()`,
    },
    caption: 'Errors are measured against a converged Newton answer; each line stops at round-off level (points on the floor at 10⁻¹⁶ are exact to the last bit). The orbit is a pure two-body ellipse: planetary perturbations, which shift Halley’s real period by years, are ignored.',
  },
  example: {
    prompt: t`In February 1991, five years after perihelion, Halley's comet surprised astronomers with an outburst. How far from the Sun was it? Its orbit has $e = ${ECC}$, semi-major axis $a = ${A_AU}$ AU and period ${PER} years. Solve Kepler's equation $E - e\sin E = M$ by Newton's method, then use $r = a(1 - e\cos E)$.`,
    visual: {
      type: 'graph',
      params: { x: [0, 3.3], y: [-0.6, 2.9], aspect: 'wide', axesAt: 'edge', xlabel: 'E (rad)', ylabel: 'f(E)',
        curves: [
          { fn: `x - ${ECC}*sin(x) - ${M5}`, color: 'accent', label: 'f(E) = E − e sin E − M', labelAt: 2.3, labelDx: -150, labelDy: -8 },
          { fn: `${H5.f(Math.PI)} + ${H5.df(Math.PI)}*(x - ${Math.PI})`, color: 'gold', dash: true, domain: [SEQ5[1] - 0.05, Math.PI] },
          { fn: `${H5.f(SEQ5[1])} + ${H5.df(SEQ5[1])}*(x - ${SEQ5[1]})`, color: 'gold', dash: true, domain: [SEQ5[2] - 0.05, SEQ5[1]] },
        ],
        points: [{ x: Math.PI, y: H5.f(Math.PI), color: 'gold', label: 'E₀ = π', labelDx: -40, labelDy: -6 }, { x: SEQ5[1], y: 0, color: 'gold', label: 'E₁', labelDx: 2, labelDy: 18 }, { x: SEQ5[2], y: 0, color: 'gold', label: 'E₂', labelDx: -14, labelDy: 18 }] },
      caption: 'The first two Newton steps: each tangent (dashed) is followed down to the axis. Computed for M = 0.417 rad.',
    },
    steps: [
      { label: 'Set up f and its slope', text: t`The mean anomaly grows uniformly with time: $M = 2\pi t/P = 2\pi\times5/${PER} = ${M5.toFixed(4)}$ rad. The root of $f(E) = E - e\sin E - M$ is the eccentric anomaly, and $f'(E) = 1 - e\cos E$ is known exactly — Newton needs both.` },
      { label: 'Choose a start', text: t`Start at $E_0 = \pi$. For an ellipse, Newton started there has been proved to converge for every $e$ and $M$ (Charles & Tatum 1998); the obvious start $E_0 = M$ works here too, but for $e$ near 1 its first step can be thrown far away, because $f'$ is tiny near $E = 0$.` },
      { label: 'Iterate', text: t`\`\`\`python
import math
e, M = ${ECC}, 2 * math.pi * 5 / ${PER}
E = math.pi
for k in range(1, 20):
    dE = (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
    E -= dE
    print(k, E, abs(dE))
    if abs(dE) < 1e-14:
        break
\`\`\`

$$\begin{array}{c|c|c} n & E_n\ (\text{rad}) & \lvert\Delta E\rvert \\ \hline ${STEPS5.map((s) => `${s.k} & ${s.E.toFixed(13)} & ${s.dE === 0 ? '0' : tex(s.dE, 2)}`).join(t` \\ `)} \end{array}$$

Look at the last column: once close, the step size goes $${tex(STEPS5[2].dE, 1)} \to ${tex(STEPS5[3].dE, 1)} \to ${tex(STEPS5[4].dE, 1)}$: each is about the square of the one before. Stopping on the size of the step is the usual test; a step below $10^{-14}$ means the previous estimate was already that close.` },
      { label: 'Use the root', text: t`$r = a(1 - e\cos E) = ${A_AU}\times(1 - ${ECC}\cos ${E5.toFixed(4)}) = ${R5.toFixed(2)}$ AU, at a true anomaly of ${NU5.toFixed(1)}° from perihelion.` },
      { label: 'Sense check', text: t`The outburst was reported at 14.3 AU, between the orbits of Saturn and Uranus (West, Hainaut & Smette 1991) — a matching distance. Perihelion is at $a(1 - e) = ${(A_AU * (1 - ECC)).toFixed(2)}$ AU, so after only 5 of its 75 years the comet has already covered ${Math.round(100 * (R5 - A_AU * (1 - ECC)) / (2 * A_AU * ECC))}% of the climb to its farthest point, ${(A_AU * (1 + ECC)).toFixed(1)} AU: it moves fast near the Sun and slowly far from it. Here the fixed-point loop also works (${FIX5} iterations), but half a year after perihelion it needs ${FIXH}.` },
    ],
    answer: t`$E = ${E5.toFixed(10)}$ rad after ${STEPS5.length - 1} Newton steps from $\pi$, so $r \approx ${R5.toFixed(1)}$ AU.`,
  },
  practice: [
    num({
      id: 'bisect-count', difficulty: 1,
      gen(r) {
        const [what, a, b, unit, tol, tolTeX] = r.pick([
          ['the eccentric anomaly of a comet', 0, Math.PI, 'rad', 1e-12, '10^{-12}'],
          ['the innermost stable orbit of a black hole, in units of its mass', 1, 6, '', 1e-10, '10^{-10}'],
          ['the exit Mach number of a nozzle', 1, 5, '', 1e-8, '10^{-8}'],
          ['the temperature at which a propellant’s vapour pressure reaches 1 MPa', 200, 300, 'K', 1e-6, '10^{-6}'],
        ]);
        const n = Math.ceil(Math.log2((b - a) / tol));
        const lo = a + 0.62 * (b - a);
        const brackets = []; let L = a, R = b;
        for (let k = 0; k < 5; k++) { brackets.push(seg(L, 5 - k, R, 5 - k, { color: k ? 'accent' : 'ink3', width: 3 })); const m = (L + R) / 2; if (lo < m) R = m; else L = m; }
        return {
          prompt: t`Bisection starts from the bracket $[${a === 0 ? 0 : a},\ ${b === Math.PI ? t`\pi` : b}]$${unit ? ` (${unit})` : ''} for ${what}. How many halvings does it need before the bracket is narrower than $${tolTeX}$${unit === 'rad' ? ' rad' : unit === 'K' ? ' K' : ''}?`,
          visual: {
            type: 'graph',
            params: { x: [a - 0.05 * (b - a), b + 0.05 * (b - a)], y: [0.3, 5.7], aspect: 'wide', axesAt: 'edge', xlabel: unit ? `${unit === 'rad' ? 'E' : 'value'} (${unit})` : 'value', ylabel: '', yticks: 0, grid: false, curves: brackets },
            caption: 'Schematic: the first five brackets, each half the last. The root’s position is illustrative.',
          },
          answer: n, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: n - 1, feedback: t`After ${n - 1} halvings the width is $${tex((b - a) / 2 ** (n - 1), 2)}$, still above the tolerance: round $\log_2$ **up**.` },
            { value: Math.ceil(Math.log10((b - a) / tol)), feedback: 'That is how many factors of 10 the bracket must shrink by. Each step halves it, so use log base 2.' },
          ],
          hints: [t`After $n$ halvings the width is $(b - a)/2^n$.`, t`Solve $(b - a)/2^n < ${tolTeX}$: $n > \log_2\!\big((b - a)/${tolTeX}\big)$, then round up.`],
          teach: 'Bisection gains exactly one binary digit per step, so its cost is known in advance: ⌈log₂((b − a)/tol)⌉ steps.',
          explain: t`$\log_2\!\big(${b === Math.PI ? t`\pi` : b - a}/${tolTeX}\big) = ${Math.log2((b - a) / tol).toFixed(2)}$, so $n = ${n}$. About 3.3 halvings buy one decimal digit, whatever $f$ is — which is both bisection's weakness (slow) and its strength (predictable).`,
        };
      },
    }),
    num({
      id: 'newton-step', difficulty: 2,
      gen(r) {
        const e = r.pick([0.2, 0.3, 0.5, 0.6]), M = r.pick([0.5, 1, 2, 2.5]);
        const { f, df } = kep(e, M);
        const E1 = M - f(M) / df(M);
        return {
          prompt: t`One Newton step for Kepler's equation $E - e\sin E = M$ with $e = ${e}$ and $M = ${M}$ rad, starting from $E_0 = M$. What is $E_1$ (to 4 significant figures)?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3.5], y: [-1.2, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'E (rad)', ylabel: 'f(E)',
              curves: [{ fn: `x - ${e}*sin(x) - ${M}`, color: 'accent', label: 'f(E)', labelAt: 3.2, labelDx: -8, labelDy: -14 }, { fn: `${f(M)} + ${df(M)}*(x - ${M})`, color: 'gold', dash: true, domain: [Math.max(0, M - 0.8), Math.min(3.5, M + 0.9)] }],
              points: [{ x: M, y: f(M), color: 'gold', label: 'E₀', labelDx: 8, labelDy: 10 }] },
            caption: 'f(E) and its tangent line at E₀ (dashed). The step goes to where the tangent crosses zero.',
          },
          answer: E1, units: 'rad', tol: { rel: 0.001 },
          errors: [
            { value: M + f(M) / df(M), feedback: t`Sign slip: $E_1 = E_0 - f/f'$, and here $f(E_0) = -e\sin M$ is negative, so $E_1$ moves *up* from $M$.` },
            { value: M + (e * Math.sin(M)) / (1 + e * Math.cos(M)), feedback: t`The derivative of $-e\sin E$ is $-e\cos E$, so $f'(E) = 1 - e\cos E$.` },
          ],
          hints: [t`At $E_0 = M$: $f(E_0) = M - e\sin M - M = -e\sin M$, and $f'(E_0) = 1 - e\cos M$.`, t`$E_1 = M + \dfrac{e\sin M}{1 - e\cos M}$ — use radians.`],
          teach: 'A Newton step replaces f by its tangent line and jumps to that line’s zero: x₁ = x₀ − f(x₀)/f′(x₀).',
          explain: t`$f(E_0) = -${e}\sin ${M} = ${f(M).toFixed(5)}$ and $f'(E_0) = 1 - ${e}\cos ${M} = ${df(M).toFixed(5)}$, so $E_1 = ${M} - (${f(M).toFixed(5)})/${df(M).toFixed(5)} = ${E1.toFixed(4)}$ rad. The true root is ${newtonSeq(f, df, M, 30).at(-1).toFixed(6)} rad — one step already has ${Math.max(1, Math.floor(-Math.log10(Math.abs(E1 - newtonSeq(f, df, M, 30).at(-1)) / E1)))} correct digits.`,
        };
      },
    }),
    num({
      id: 'quadratic', difficulty: 2,
      gen(r) {
        const e1 = r.pick([0.02, 0.03, 0.05]), C = r.pick([0.4, 0.8, 1.5, 2.5]);
        const er2 = C * e1 * e1, er3 = C * er2 * er2;
        const L = Math.log10;
        return {
          prompt: t`Newton's method is converging to a simple root. The errors after steps 1 and 2 are $${tex(e1, 2)}$ and $${tex(er2, 2)}$. Assuming $e_{n+1} \approx C e_n^2$, estimate the error after step 3.`,
          visual: {
            type: 'graph',
            params: { x: [0.5, 4.5], y: [-16, 0], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step n', ylabel: 'error', xticks: 4,
              curves: [{ fn: `${L(e1)} - 0.30103*(x - 1)`, color: 'ink3', dash: true, domain: [1, 4.3], label: 'halving each step', labelAt: 3.6, labelDx: -40, labelDy: -12 }],
              points: [{ x: 1, y: L(e1), color: 'gold', r: 5 }, { x: 2, y: L(er2), color: 'gold', r: 5 }] },
            caption: 'The two Newton errors so far (gold), against a method that halves its error each step (dashed). Logarithmic vertical axis.',
          },
          answer: er3, tol: { rel: 0.05 },
          errors: [
            { value: (er2 * er2) / e1, feedback: 'That assumes the error shrinks by the same *factor* each step (linear convergence). Newton squares it: find C first.' },
            { value: er2 * er2, feedback: `You squared e₂ but forgot the constant C = e₂/e₁² = ${C}.` },
          ],
          hints: [t`Find the constant from the two errors: $C = e_2/e_1^2$.`, t`$C = ${tex(er2, 2)}/(${tex(e1, 2)})^2 = ${C}$; then $e_3 = C e_2^2$.`],
          teach: 'Quadratic convergence means each error is about a constant times the square of the last: the number of correct digits roughly doubles per step.',
          explain: t`$C = ${C}$ and $e_3 \approx ${C}\times(${tex(er2, 2)})^2 = ${tex(er3, 2)}$. One more step would give about $${tex(C * er3 * er3, 1)}$ — below double-precision round-off, which is why Newton loops rarely need more than 5 or 6 steps once close. The constant is $C = \lvert f''/2f'\rvert$ at the root.`,
        };
      },
    }),
    mcq({
      id: 'newton-cycle', difficulty: 2,
      prompt: t`This Newton loop never settles. What is going on?

\`\`\`python
f  = lambda x: x**3 - 2*x + 2
df = lambda x: 3*x**2 - 2
x = 0.0
for k in range(6):
    x = x - f(x) / df(x)
    print(x)          # 1.0  0.0  1.0  0.0  1.0  0.0
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-2.4, 1.8], y: [-2.5, 4], aspect: 'wide', axesAt: 'edge',
          curves: [{ fn: 'x^3 - 2x + 2', color: 'accent', label: 'f(x) = x³ − 2x + 2', labelAt: -1.1, labelDx: 10, labelDy: -14 }, { fn: '2 - 2x', color: 'gold', dash: true, domain: [-0.3, 1.3] }, { fn: 'x', color: 'violet', dash: true, domain: [-0.3, 1.3] }],
          points: [{ x: 0, y: 2, color: 'gold' }, { x: 1, y: 1, color: 'violet' }] },
        caption: 'The tangent at x = 0 (gold) crosses zero at x = 1; the tangent at x = 1 (violet) crosses zero at x = 0.',
      },
      choices: [
        'It is trapped in a 2-cycle: each tangent points exactly to the other start, so it never approaches the real root near x = −1.77',
        'f has roots at 0 and 1, and Newton alternates between them',
        'Round-off error makes the iterates jump back and forth',
        'It needs more iterations: run it for 100 steps and it will converge',
      ],
      answer: 0,
      why: {
        1: 'f(0) = 2 and f(1) = 1: neither is a root. Check the residual, not just whether the iterates repeat.',
        2: 'The cycle is exact in floating point (1.0 and 0.0 are computed without rounding). Round-off is not involved.',
        3: 'An exact cycle repeats for ever; more iterations change nothing.',
      },
      hints: ['Compute f(0) and f(1). Are either of them roots?', 'Follow the tangent at x = 0 down to the axis, then the tangent at x = 1.'],
      teach: 'Newton has no guarantee far from a root: it can cycle or diverge, so a robust solver caps the iterations and checks the residual.',
      explain: t`At $x = 0$: $f = 2$, $f' = -2$, so $x \to 0 - 2/(-2) = 1$. At $x = 1$: $f = 1$, $f' = 1$, so $x \to 0$. The only real root is near $-1.77$, and Newton started anywhere left of about $-0.8$ finds it in a few steps. The cure is a better start — from a bracket, or a few bisection steps first — and a loop that gives up after \`maxiter\` steps.`,
    }),
    code({
      id: 'newton-func', difficulty: 3,
      prompt: t`Write a reusable \`newton(f, df, x0, tol=1e-12, maxiter=50)\` that returns the pair \`(root, iterations)\`. Stop when the size of the Newton step drops below \`tol\`, and **raise** \`RuntimeError\` if that has not happened after \`maxiter\` steps. The tests solve Kepler's equation for Halley's comet five years after perihelion, and feed it the 2-cycle of the last problem.`,
      starter: t`import math

def newton(f, df, x0, tol=1e-12, maxiter=50):
    pass

def _raises(call):            # used by the tests: True if call() raises RuntimeError
    try:
        call()
    except RuntimeError:
        return True
    return False
`,
      answer: t`import math

def newton(f, df, x0, tol=1e-12, maxiter=50):
    x = x0
    for k in range(1, maxiter + 1):
        dx = f(x) / df(x)
        x -= dx
        if abs(dx) < tol:
            return x, k
    raise RuntimeError(f"no convergence after {maxiter} steps (last x = {x})")

def _raises(call):            # used by the tests: True if call() raises RuntimeError
    try:
        call()
    except RuntimeError:
        return True
    return False

e, M = ${ECC}, 2 * math.pi * 5 / ${PER}
E, k = newton(lambda E: E - e * math.sin(E) - M, lambda E: 1 - e * math.cos(E), math.pi)
print(E, k)`,
      tests: [
        { name: t`Halley: $E = ${E5.toFixed(10)}$ rad`, code: `abs(newton(lambda E: E - ${ECC} * math.sin(E) - ${M5}, lambda E: 1 - ${ECC} * math.cos(E), math.pi)[0] - ${E5}) < 1e-11` },
        { name: 'it reports a small number of iterations (at most 10)', code: `newton(lambda E: E - ${ECC} * math.sin(E) - ${M5}, lambda E: 1 - ${ECC} * math.cos(E), math.pi)[1] <= 10` },
        { name: t`it finds $\sqrt2$ from $x_0 = 1$`, code: 'abs(newton(lambda x: x * x - 2, lambda x: 2 * x, 1.0)[0] - 2 ** 0.5) < 1e-12' },
        { name: 'it raises RuntimeError on the 2-cycle instead of looping for ever', code: '_raises(lambda: newton(lambda x: x**3 - 2*x + 2, lambda x: 3*x**2 - 2, 0.0))' },
      ],
      hints: ['Loop `for k in range(1, maxiter + 1):`, compute the step `dx = f(x) / df(x)` and update `x -= dx`.', 'Inside the loop: `if abs(dx) < tol: return x, k`.', 'If the loop finishes without returning, the last line of the function is `raise RuntimeError("…")`.'],
      teach: 'A production Newton loop has three exits: converged (step below tol), and a capped iteration count that raises instead of returning a wrong answer silently.',
      explain: t`The loop returns as soon as a step is below \`tol\`, after ${STEPS5.length} iterations for Halley. On the 2-cycle the steps stay at size 1 for ever, so the 50-step cap trips and the error message carries the last \`x\` for debugging. Returning \`None\` or the last iterate instead would let a caller carry on with garbage.`,
    }),
    mcq({
      id: 'tan-pole', difficulty: 3,
      prompt: t`A student runs bisection on $f(x) = \tan x - 1$ over $[1, 2]$, where $f(1) = 0.56$ and $f(2) = -3.19$ have opposite signs. It returns \`1.5707963267948966\` and $f$ there is about $1.6\times10^{16}$. What went wrong?`,
      visual: {
        type: 'graph',
        params: { x: [0.6, 2.4], y: [-6, 6], aspect: 'wide', axesAt: 'edge',
          curves: [{ fn: 'tan(x) - 1', color: 'accent', domain: [0.6, 1.555] }, { fn: 'tan(x) - 1', color: 'accent', domain: [1.587, 2.4] }],
          vlines: [{ x: 1, color: 'gold', label: 'a' }, { x: 2, color: 'gold', label: 'b' }] },
        caption: 'f(x) = tan x − 1 between the bracket ends a and b.',
      },
      choices: [
        'f is not continuous on [1, 2]: the sign change comes from the pole at π/2, not from a root, so bisection homes in on the pole',
        'Nothing: π/2 is the root of tan x − 1',
        'Round-off: tan x is inaccurate near π/2, so the bracket drifted',
        'The bracket was too wide; a narrower bracket around π/2 would give the root',
      ],
      answer: 0,
      why: {
        1: 'tan x = 1 at π/4 ≈ 0.785 (and π/4 + π), not at π/2, where tan x is infinite.',
        2: 'The bracket shrank correctly; it shrank onto the pole because that is where the sign changes.',
        3: 'Any bracket around π/2 has a sign change and no root. There is no root in [1, 2] at all.',
      },
      hints: ['The guarantee of bisection is the intermediate value theorem. What does it assume about f?', 'Where between 1 and 2 does tan x change sign without passing through zero?'],
      teach: 'Bisection finds a sign change, which is a root only if f is continuous: always check that the residual f(x) is small at the answer.',
      explain: t`$\tan x$ jumps from $+\infty$ to $-\infty$ at $\pi/2$, and bisection cannot tell a jump from a crossing. The giveaway is the residual, $\lvert f\rvert \approx 10^{16}$. A robust root finder returns $x$ *and* checks $\lvert f(x)\rvert$. Physics has such poles too: $1/(r - 3M)$-type terms at a black hole's photon sphere, or resonances in a driven system.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-isco', difficulty: 3, transfer: true,
      prompt: t`Around a black hole spinning with spin parameter $a$ ($0 \le a < 1$; units with $G = c = 1$ and lengths in units of the mass $M$), prograde circular orbits are stable only outside the radius $r$ that solves

$$r^2 - 6r + 8a\sqrt r - 3a^2 = 0$$

with $1 < r \le 6$. Write \`isco(a)\` that finds this root by **bisection** on $[1, 6]$ until the bracket is narrower than $10^{-12}$, and set \`r_gw\` to the radius for $a = 0.69$, the spin of the black hole formed in the first gravitational-wave detection, GW150914.`,
      visual: {
        type: 'graph',
        params: { x: [0.8, 6.4], y: [-10, 14], aspect: 'wide', axesAt: 'edge', xlabel: 'r (units of M)', ylabel: 'f(r)',
          curves: [{ fn: 'x^2 - 6x', color: 'ink3', label: 'a = 0', labelAt: 4.4, labelDx: 6, labelDy: 14 }, { fn: 'x^2 - 6x + 8*0.69*sqrt(x) - 3*0.69^2', color: 'accent', label: 'a = 0.69', labelAt: 5.2, labelDx: -50, labelDy: -12 }],
          vlines: [{ x: 1, color: 'gold', label: '1' }, { x: 6, color: 'gold', label: '6' }] },
        caption: 'The left side of the equation for a non-spinning and a spinning hole, with the bracket [1, 6]. The equation holds for equatorial orbits only.',
      },
      starter: t`import math

def isco(a):
    f = lambda r: r * r - 6 * r + 8 * a * math.sqrt(r) - 3 * a * a
    lo, hi = 1.0, 6.0
    # bisect here
    return None

r_gw = isco(0.69)
`,
      answer: t`import math

def isco(a):
    f = lambda r: r * r - 6 * r + 8 * a * math.sqrt(r) - 3 * a * a
    lo, hi = 1.0, 6.0
    while hi - lo > 1e-12:
        mid = 0.5 * (lo + hi)
        if f(lo) * f(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)

r_gw = isco(0.69)
print(r_gw)`,
      tests: [
        { name: 'no spin: the Schwarzschild value r = 6', code: 'abs(isco(0.0) - 6) < 1e-9' },
        { name: t`$a = 0.69$: $r = ${ISCO69.toFixed(6)}$, Bardeen, Press and Teukolsky's closed form`, code: `abs(r_gw - ${ISCO69}) < 1e-9` },
        { name: t`$a = 0.9$: $r = ${ISCO9.toFixed(6)}$`, code: `abs(isco(0.9) - ${ISCO9}) < 1e-9` },
      ],
      hints: ['Loop `while hi - lo > 1e-12:` and look at the midpoint.', 'If `f(lo) * f(mid) <= 0` the sign change is in the left half: `hi = mid`; otherwise `lo = mid`.', 'Return the midpoint `0.5 * (lo + hi)` after the loop.'],
      teach: 'When a bracket is known from the physics, bisection is the safe first tool: about 43 halvings take [1, 6] down to 10⁻¹².',
      explain: t`For $a = 0.69$ the innermost stable orbit is at $r = ${ISCO69.toFixed(4)}\,M$, much closer than the $6M$ of a non-spinning hole; at $a = 0.9$ it is $${ISCO9.toFixed(3)}\,M$. Gas orbiting closer to the hole can radiate more of its rest energy before it plunges, which is why spin measurements come from the inner edges of accretion discs. The bracket works because $f(1) = -(3a - 5)(a - 1) < 0$ and $f(6) = a(8\sqrt6 - 3a) \ge 0$ for every $0 \le a < 1$.`,
    }),
    num({
      id: 'cp-residual', difficulty: 3, transfer: true,
      gen(r) {
        const e = r.pick([0.99, 0.995, 0.999]), E = r.pick([0.04, 0.06, 0.08]);
        const fp = 1 - e * Math.cos(E), res = r.pick([1e-10, 1e-12]);
        const err = res / fp;
        return {
          prompt: t`A comet-tracking code stops its Newton loop when the **residual** $\lvert f(E)\rvert = \lvert E - e\sin E - M\rvert$ falls below $${tex(res)}$. Near perihelion of a sun-grazing comet ($e = ${e}$, $E \approx ${E}$ rad), how large can the error in $E$ still be? Use $\Delta E \approx \lvert f\rvert/\lvert f'\rvert$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 0.2], y: [-0.004, 0.006], aspect: 'wide', axesAt: 'edge', xlabel: 'E (rad)', ylabel: 'f(E)',
              curves: [{ fn: `x - ${e}*sin(x) - (${E} - ${e}*sin(${E}))`, color: 'accent' }] },
            caption: 'Kepler’s f(E) near perihelion: it is nearly flat, so a small residual allows a sizeable error in E.',
          },
          answer: err, units: 'rad', tol: { rel: 0.03 },
          errors: [{ value: res, feedback: 'The residual is not the error in E: divide by the slope f′(E) = 1 − e cos E, which is small here.' }, { value: res * fp, feedback: 'Divide by the slope, do not multiply: a flat function lets E move a lot for a small change in f.' }],
          hints: [t`$f'(E) = 1 - e\cos E$. Evaluate it at $E = ${E}$.`, t`$f' = 1 - ${e}\cos ${E} = ${fp.toPrecision(3)}$; divide the residual by it.`],
          teach: 'A residual test |f| < tol bounds the error in x only after dividing by |f′|; where f is flat, stop on the step size instead (or as well).',
          explain: t`$f'(E) = ${fp.toPrecision(3)}$, so $\Delta E \approx ${tex(res)}/${fp.toPrecision(3)} = ${tex(err, 2)}$ rad — ${Math.round(err / res)} times the residual. Stopping on the Newton step $\lvert f/f'\rvert$, as in the worked example, measures the error in $E$ directly.`,
        };
      },
    }),
    mcq({
      id: 'cp-which', difficulty: 2,
      prompt: t`Two root finders report their errors step by step:

\`\`\`
step   method P    method Q
1      ${e2(NERR[0])}     ${e2(BERR[0])}
2      ${e2(NERR[1])}     ${e2(BERR[1])}
3      ${e2(NERR[2])}     ${e2(BERR[2])}
4      ${e2(NERR[3])}     ${e2(BERR[3])}
\`\`\`

Which reading is right?`,
      choices: [
        'P is Newton’s method (the exponent roughly doubles each step); Q is bisection (the error halves each step)',
        'P is bisection and Q is Newton’s method',
        'Both converge linearly; P just has a smaller constant',
        'Q will overtake P because its error is shrinking more steadily',
      ],
      answer: 0,
      why: {
        1: `Halving each step is bisection’s signature, and that is Q. P’s exponents go ${NERR.map((x) => `−${-Math.floor(Math.log10(x))}`).join(', ')}.`,
        2: 'Linear convergence shrinks the error by a fixed factor. P’s factor grows from step to step — that is quadratic convergence.',
        3: 'Q needs about 50 halvings to reach 10⁻¹⁵; P is already there after 4 steps.',
      },
      hints: ['Divide each error by the one before it, for both columns.', 'A constant ratio is linear convergence; a ratio that keeps shrinking means the error is being squared.'],
      teach: 'Read convergence from the exponents: linear methods subtract a fixed amount from log₁₀(error) each step; quadratic methods double it.',
      explain: t`Q's ratio is exactly ½ each step — a bisection bracket. P's errors are each roughly the square of the one before (times a constant near ${(NERR[2] / NERR[1] ** 2).toFixed(1)}), so its exponent doubles — Newton, here on Kepler's equation with $e = 0.5$, $M = 1$.`,
    }),
  ],
  sources: [
    { label: 'Newman, Computational Physics, §6.3: Nonlinear equations (bisection, Newton)', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Charles & Tatum (1998), The convergence of Newton–Raphson iteration with Kepler’s equation, Celest. Mech. Dyn. Astron. 69, 357', url: 'https://doi.org/10.1023/A:1008200607490' },
    { label: 'Bardeen, Press & Teukolsky (1972), Rotating black holes, ApJ 178, 347 (the ISCO)', url: 'https://doi.org/10.1086/151796' },
    { label: 'West, Hainaut & Smette (1991), Post-perihelion observations of P/Halley III: an outburst at r = 14.3 AU, A&A 246, L77', url: 'https://ui.adsabs.harvard.edu/abs/1991A%26A...246L..77W' },
  ],
});
