// Legendre polynomials, the mathematician's way: Legendre's equation as a
// singular Sturm–Liouville problem (boundedness, not a boundary value, makes l
// an integer), Rodrigues' formula, Bonnet's recurrence, the generating function
// 1/√(1 − 2xh + h²) and the norm 2/(2l + 1) proved from it, Legendre series as
// least-squares best approximations, and why Pₗ has l zeros inside (−1, 1).
// Overlaps: phys3600 M4.4 solves the sphere in a uniform field by recurrence
// (linked, not repeated); st-f F5.2 owns Gauss–Legendre quadrature.
import { lesson, mcq, num } from '../../src/core/content.js';
import { SF, SRC, gpic, legendreExpr, legendreTeX, r3, r4, quad } from './_sf.js';

const t = String.raw;
const P = SF.legendre;
const fact = SF.fact;
const lead = (l) => fact(2 * l) / (2 ** l * fact(l) ** 2);          // leading coefficient of Pₗ
// the generating function's partial sum Σ_{l ≤ N} hˡPₗ(x), each term switched on by a step in N
const GEN_SUM = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((l) => `step(N + 0.5 - ${l})*h^${l}*(${legendreExpr(l)})`).join(' + ');
const NORM3 = quad((x) => P(3, x) ** 2, -1, 1);
const LOGH = (h) => Math.log((1 + h) / (1 - h)) / h;
// the Legendre coefficients of max(0, μ): absorbed sunlight on a sphere
const SUN = [0, 1, 2].map((l) => ((2 * l + 1) / 2) * quad((m) => m * P(l, m), 0, 1));

export default lesson({
  id: 'st-e.E6.1',
  title: 'Legendre polynomials',
  minutes: 16, difficulty: 3,
  intro: t`**Legendre’s equation** $\big((1 - x^2)\,y'\big)' + \lambda y = 0$ on $[-1, 1]$ is a Sturm–Liouville problem with $p = 1 - x^2$, $q = 0$, weight $w = 1$ — but $p$ vanishes at both ends, so it is **singular**: no boundary values are imposed, only that $y$ stay **bounded**. That alone quantizes it. Every solution blows up logarithmically at $x = \pm1$ unless $\lambda = l(l + 1)$ with $l = 0, 1, 2, \dots$, and then one solution is a polynomial of degree $l$, given by Rodrigues’ formula:

$$P_l(x) = \frac{1}{2^l\,l!}\,\frac{d^l}{dx^l}\big(x^2 - 1\big)^l, \qquad \int_{-1}^{1}P_lP_k\,dx = \frac{2}{2l + 1}\,\delta_{lk}.$$

They are orthogonal because the operator is self-adjoint ([E5.1](#/lesson/st-e.E5.1)), complete by [E5.2](#/lesson/st-e.E5.2), normalized so $P_l(1) = 1$, and all packed into one **generating function**, $\dfrac{1}{\sqrt{1 - 2xh + h^2}} = \sum_{l}P_l(x)\,h^l$ — which is why they appear whenever $1/|\vec r - \vec r\,'|$ does. With $x = \cos\theta$ they are the axisymmetric angular modes of Laplace’s equation; [PHYS 3600](#/lesson/phys3600.M4.4) uses them to put a sphere in a uniform field.`,
  symbols: [
    { tex: 'P_l(x)', text: 'the Legendre polynomial of degree $l$: even or odd as $l$ is, with $P_l(1) = 1$' },
    { tex: 'l', text: 'the degree, $0, 1, 2, \\dots$; the eigenvalue is $\\lambda = l(l + 1)$' },
    { tex: 'x', text: 'the variable on $[-1, 1]$ — in physics $x = \\cos\\theta$, the cosine of the polar angle' },
    { tex: '(x^2 - 1)^l', text: 'a polynomial of degree $2l$ with $l$-fold roots at $\\pm1$; differentiating it $l$ times leaves degree $l$' },
    { tex: '\\delta_{lk}', text: 'the Kronecker delta: 1 if $l = k$, 0 otherwise' },
  ],
  why: t`Gravity fields of planets, the angular pattern of radiation, the partial waves of scattering and the first step of every spherical-harmonic expansion of a black hole’s perturbations are Legendre series.`,
  visual: {
    type: 'graph',
    title: 'One function holds them all',
    lead: t`The dashed curve is the generating function $1/\sqrt{1 - 2xh + h^2}$ for a fixed $h$; the blue curve is its Legendre series cut after $P_N$, $\sum_{l \le N}P_l(x)\,h^l$. The readouts compare them at $x = 1$, where every $P_l = 1$.`,
    tasks: [
      'h = 0.3: by N = 3 the two curves are indistinguishable — the l-th term carries a factor 0.3ˡ.',
      'Push h to 0.8: the series lags worst at x = 1, where it is the geometric series 1 + h + h² + ….',
      'Set N = 0, 1, 2 in turn: the blue curve gains P₁ (a tilt), then P₂ (a bow) — each Pₗ is the coefficient of hˡ.',
    ],
    params: {
      x: [-1, 1], y: [0, 5.4], xlabel: 'x', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [
        { key: 'h', label: 'Expansion variable $h$', min: 0, max: 0.8, step: 0.05, value: 0.5, unit: '', explain: 'In $1/|\\vec r - \\vec r\\,\'|$ it is the ratio of the smaller distance to the larger one.' },
        { key: 'N', label: 'Last degree $N$', min: 0, max: 8, step: 1, value: 2, unit: '', explain: 'Keep $P_0$ … $P_N$ in the series.' },
      ],
      curves: [
        { fn: '1/sqrt(1 - 2*x*h + h^2)', color: 'ink3', width: 1.6, dash: [6, 4] },
        { fn: GEN_SUM, color: 'accent', width: 2.3 },
      ],
      readouts: [
        { label: 'exact at $x = 1$: $1/(1 - h) =$', expr: '1/(1 - h)', digits: 4 },
        { label: 'series at $x = 1$: $\\sum_{l \\le N}h^l =$', expr: '(1 - h^(N + 1))/(1 - h)', digits: 4 },
      ],
    },
    caption: t`Exact polynomials from Bonnet’s recurrence. The series converges for $|h| < 1$ at every $x$ in $[-1, 1]$: the generating function’s singularities sit at $h = e^{\pm i\theta}$, on the unit circle.`,
  },
  example: {
    prompt: t`Prove $\int_{-1}^{1}P_l^2\,dx = \dfrac{2}{2l + 1}$ from the generating function alone, taking orthogonality as known from Sturm–Liouville theory.`,
    visual: gpic({ x: [-1, 1], y: [0, 4.2], xlabel: 'x', curves: [{ fn: '1/(1 - x + 0.25)', color: 'accent', width: 2.3 }], shade: [{ fn: '1/(1 - x + 0.25)', from: -1, to: 1, color: 'accent', alpha: 0.15 }] }, t`The square of the generating function at h = ½, 1/(1 − 2xh + h²); its area is (1/h) ln((1 + h)/(1 − h)) = ${r4(LOGH(0.5))}.`),
    steps: [
      { label: 'Square it', text: t`$\dfrac{1}{1 - 2xh + h^2} = \Big(\sum_l P_l h^l\Big)\Big(\sum_k P_k h^k\Big) = \sum_{l,k}P_lP_k\,h^{l + k}$.` },
      { label: 'Integrate', text: t`Over $[-1, 1]$, orthogonality kills every $l \ne k$ term: $\displaystyle\int_{-1}^{1}\frac{dx}{1 - 2xh + h^2} = \sum_l h^{2l}\int_{-1}^{1}P_l^2\,dx$.` },
      { label: 'Left side', text: t`$\displaystyle\int_{-1}^{1}\frac{dx}{1 - 2xh + h^2} = \Big[-\frac{\ln(1 - 2xh + h^2)}{2h}\Big]_{-1}^{1} = \frac{1}{h}\ln\frac{1 + h}{1 - h}$, since $1 \mp 2h + h^2 = (1 \mp h)^2$.` },
      { label: 'Expand', text: t`$\ln\dfrac{1 + h}{1 - h} = 2\Big(h + \dfrac{h^3}{3} + \dfrac{h^5}{5} + \cdots\Big)$, so the left side is $\displaystyle\sum_l\frac{2}{2l + 1}h^{2l}$.` },
      { label: 'Match powers', text: t`Two power series in $h$ that agree for $|h| < 1$ agree term by term: $\int_{-1}^{1}P_l^2\,dx = \dfrac{2}{2l + 1}$.` },
      { label: 'Check', text: t`For $l = 3$, $P_3 = ${legendreTeX(3)}$ and quadrature gives $\int P_3^2 = ${r4(NORM3)}$ $= 2/7$. The norm shrinks with $l$ because $|P_l| < 1$ inside the interval and $P_l$ spends ever more of it near zero.` },
    ],
    answer: t`$\displaystyle\int_{-1}^{1}P_l^2\,dx = \frac{2}{2l + 1}$, read off from $\frac1h\ln\frac{1 + h}{1 - h} = \sum_l\frac{2h^{2l}}{2l + 1}$. So the Legendre coefficient of $f$ is $a_l = \frac{2l + 1}{2}\int_{-1}^{1}f\,P_l\,dx$.`,
  },
  practice: [
    num({
      id: 'rodrigues-lead', difficulty: 2,
      gen(r) {
        const l = r.int(2, 7), ans = lead(l);
        return {
          prompt: t`Use Rodrigues’ formula to find the coefficient of $x^{${l}}$ in $P_{${l}}(x)$. (Only the top term $x^{${2 * l}}$ of $(x^2 - 1)^{${l}}$ survives into it.)`,
          visual: gpic({ x: [-1, 1], y: [-1.15, 1.15], xlabel: 'x', curves: [{ fn: legendreExpr(l), color: 'accent', width: 2.3, label: `P${'₀₁₂₃₄₅₆₇'[l]}`, labelAt: 0.93, labelDx: -30, labelDy: 4 }] }, t`$P_{${l}}$ on $[-1, 1]$: it reaches 1 at $x = 1$ and has ${l} zeros inside.`),
          answer: ans, tol: { rel: 0.002 },
          errors: [
            { value: fact(2 * l) / fact(l), feedback: t`That is $\frac{d^l}{dx^l}x^{2l}$ alone. Rodrigues divides by $2^l\,l!$.` },
            { value: fact(2 * l) / (fact(l) * fact(l)), feedback: t`You divided by $l!$ only; the prefactor is $1/(2^l\,l!)$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$\dfrac{d^{${l}}}{dx^{${l}}}x^{${2 * l}} = \dfrac{${2 * l}!}{${l}!}\,x^{${l}}$.`, t`Multiply by $\dfrac{1}{2^{${l}}\,${l}!}$: the coefficient is $\dfrac{(2l)!}{2^l(l!)^2}$.`],
          teach: 'Rodrigues’ formula fixes the leading coefficient of Pₗ as (2l)!/(2ˡ(l!)²).',
          explain: t`$\dfrac{(${2 * l})!}{2^{${l}}(${l}!)^2} = ${r4(ans)}$. Compare $P_2 = \tfrac12(3x^2 - 1)$, whose top coefficient is $3/2$. These coefficients grow like $2^l/\sqrt{\pi l}$ even though $|P_l| \le 1$ — heavy cancellation between terms.`,
        };
      },
    }),
    num({
      id: 'fl-coef', difficulty: 2,
      gen(r) {
        const c0 = r.intExcept(-3, 3, [0]), c1 = r.intExcept(-4, 4, [0]), c2 = r.intExcept(-3, 3, [0]), c3 = r.intExcept(-5, 5, [0]);
        const ans = c1 + (3 / 5) * c3;
        const f = `${c0} + ${c1}*x + ${c2}*x^2 + ${c3}*x^3`;
        const fTeX = t`${c0} ${c1 < 0 ? '-' : '+'} ${Math.abs(c1)}x ${c2 < 0 ? '-' : '+'} ${Math.abs(c2)}x^2 ${c3 < 0 ? '-' : '+'} ${Math.abs(c3)}x^3`;
        return {
          prompt: t`Expand $f(x) = ${fTeX}$ in Legendre polynomials, $f = \sum a_lP_l$. What is $a_1$?`,
          visual: gpic({ x: [-1, 1], y: [-14, 14], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.3 }, { fn: 'x', color: 'ink3', width: 1.4, dash: [5, 4], label: 'P₁ = x', labelAt: 0.55, labelDy: 14 }] }, 'The cubic f and the shape P₁ = x whose share of f is asked for.'),
          answer: ans, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [
            { value: c1, feedback: t`The $x^3$ term also projects onto $P_1$: $x^3 = \tfrac35P_1 + \tfrac25P_3$.` },
            { value: (2 / 3) * ans, feedback: t`That is $\int fP_1\,dx$. Multiply by $\frac{2l + 1}{2} = \frac32$ to get the coefficient.` },
          ].filter((e) => Math.abs(e.value - ans) > 1e-3),
          hints: [t`$a_1 = \dfrac32\displaystyle\int_{-1}^{1}f(x)\,x\,dx$; only the odd terms of $f$ survive.`, t`$\int_{-1}^1 x^2\,dx = \frac23$ and $\int_{-1}^1 x^4\,dx = \frac25$.`],
          teach: 'A Legendre coefficient is a projection: aₗ = (2l + 1)/2 · ∫ f Pₗ dx, and higher powers of x feed lower-degree Pₗ of the same parity.',
          explain: t`$a_1 = \frac32\big(${c1}\cdot\frac23 + ${c3}\cdot\frac25\big) = ${c1} + \frac35(${c3}) = ${r4(ans)}$. Equivalently, $x^3 = \frac35P_1 + \frac25P_3$ hands $\frac35$ of the cubic’s coefficient to $P_1$.`,
        };
      },
    }),
    num({
      id: 'bonnet', difficulty: 2,
      gen(r) {
        const x0 = r.pick([0.2, 0.35, 0.45, 0.6, 0.7, 0.85, -0.3, -0.55]);
        const p2 = P(2, x0), p3 = P(3, x0), ans = P(4, x0);
        return {
          prompt: t`At $x = ${x0}$, $P_2 = ${r4(p2)}$ and $P_3 = ${r4(p3)}$. Use Bonnet’s recurrence $(l + 1)P_{l + 1} = (2l + 1)\,x\,P_l - l\,P_{l - 1}$ to find $P_4(${x0})$.`,
          visual: gpic({ x: [-1, 1], y: [-1.1, 1.1], xlabel: 'x', curves: [{ fn: legendreExpr(2), color: 'violet', width: 1.8, label: 'P₂', labelAt: 0.97, labelDx: -26, labelDy: 2 }, { fn: legendreExpr(3), color: 'accent', width: 2, label: 'P₃', labelAt: -0.97, labelDx: 2, labelDy: 14 }], vlines: [{ x: x0, color: 'gold' }] }, t`$P_2$ and $P_3$, with the point $x = ${x0}$ marked.`),
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [
            { value: ((2 * 4 + 1) * x0 * p3 - 4 * p2) / 5, feedback: t`You used $l = 4$. To reach $P_4$ take $l = 3$: $4P_4 = 7xP_3 - 3P_2$.` },
            { value: 7 * x0 * p3 - 3 * p2, feedback: 'Divide by l + 1 = 4.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.max(Math.abs(ans), 0.1)),
          hints: [t`Put $l = 3$: $4P_4 = 7x\,P_3 - 3P_2$.`],
          teach: 'Bonnet’s recurrence builds every Pₗ from the two before it — the stable way to compute them.',
          explain: t`$P_4 = \frac14\big(7\times${x0}\times${r4(p3)} - 3\times${r4(p2)}\big) = ${r4(ans)}$, matching $\frac18(35x^4 - 30x^2 + 3)$ at $x = ${x0}$. Recurrences, not Rodrigues, are how software evaluates $P_l$.`,
        };
      },
    }),
    mcq({
      id: 'bounded', difficulty: 3,
      prompt: t`Legendre’s equation has two independent solutions for **every** $\lambda$. Why do only $\lambda = l(l + 1)$, with $l$ a whole number, count as eigenvalues?`,
      visual: gpic({ x: [-1, 1], y: [-2.5, 2.5], xlabel: 'x', curves: [{ fn: '1', color: 'accent', width: 2.2, label: 'P₀', labelAt: -0.9, labelDy: -12 }, { fn: '0.5*ln((1 + x)/(1 - x))', color: 'warn', width: 2.2, domain: [-0.9999, 0.9999], label: 'Q₀', labelAt: 0.55, labelDy: 14 }] }, 'For l = 0 the second solution is Q₀ = ½ ln((1 + x)/(1 − x)): it diverges at both ends.'),
      choices: [
        'Otherwise both series solutions diverge (logarithmically) at x = 1 or x = −1; only a terminating series — a polynomial — stays bounded at both ends',
        'The boundary conditions y(1) = y(−1) = 0 allow only those values',
        'Periodicity in the angle φ forces l to be an integer',
        'For other λ the equation has no solutions at all',
      ],
      answer: 0,
      why: {
        1: 'Pₗ(1) = 1, not 0. A singular problem imposes boundedness, not zero values, at the ends.',
        2: t`Periodicity in $\varphi$ quantizes $m$ in $e^{im\varphi}$; $l$ is quantized by boundedness at the poles $\theta = 0, \pi$.`,
        3: 'Frobenius series about x = 0 solve it for any λ, with radius of convergence 1 — they simply blow up at the ends.',
      },
      hints: ['p = 1 − x² vanishes at x = ±1. What condition replaces a boundary value at such an endpoint?', t`The series about 0 has $a_{k+2}/a_k = \frac{k(k + 1) - \lambda}{(k + 1)(k + 2)} \to 1$: unless it stops, it behaves like $\sum x^{2k}/k$ near $x = 1$.`],
      teach: 'In a singular Sturm–Liouville problem, boundedness at the singular endpoints does the quantizing.',
      explain: t`The recurrence $a_{k+2} = \dfrac{k(k + 1) - \lambda}{(k + 1)(k + 2)}a_k$ makes the series behave like $\sum x^{2k}/k \sim -\tfrac12\ln(1 - x^2)$ near the ends — unless $\lambda = l(l + 1)$, when it terminates at degree $l$. Physically $x = \pm1$ are the poles of a sphere, where a potential must be finite.`,
    }),
    num({
      id: 'best-approx', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 4, 5, 6]), k = lead(n), ans = 2 / ((2 * n + 1) * k * k);
        const best = `x^${n} - (${legendreExpr(n)})/${k}`;
        return {
          prompt: t`Among all polynomials $q$ of degree at most $${n - 1}$, the one that minimizes $E = \int_{-1}^{1}\big(x^{${n}} - q\big)^2dx$ is the Legendre series of $x^{${n}}$ cut before $P_{${n}}$. What is the smallest possible $E$?`,
          visual: gpic({ x: [-1, 1], y: [-1.1, 1.1], xlabel: 'x', curves: [{ fn: `x^${n}`, color: 'ink3', width: 1.6, dash: [6, 4], label: `x${'⁰¹²³⁴⁵⁶'[n]}`, labelAt: 0.9, labelDx: -32, labelDy: 4 }, { fn: best, color: 'accent', width: 2.3 }] }, `x${'⁰¹²³⁴⁵⁶'[n]} (dashed) and its best approximation of degree ${n - 1} in the mean-square sense.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / (k * k), feedback: t`You have $a_{${n}}^2$; multiply by the norm $\int P_{${n}}^2 = \frac{2}{${2 * n + 1}}$.` }],
          hints: [t`$x^{${n}} = a_{${n}}P_{${n}} + (\text{lower degrees})$ with $a_{${n}} = 1/(\text{leading coefficient of } P_{${n}}) = ${r4(1 / k)}$.`, t`The best $q$ keeps all the lower terms, so the error is $a_{${n}}P_{${n}}$ and $E = a_{${n}}^2\cdot\frac{2}{2n + 1}$.`],
          teach: 'A truncated orthogonal expansion is the best mean-square approximation, and the error is the sum of the discarded coefficients squared times the norms.',
          explain: t`$a_{${n}} = 1/${r4(k)}$, so $E = \dfrac{2}{${2 * n + 1}}\times${r4(1 / k)}^2 = ${r4(ans)}$. The residual $x^{${n}} - q$ is a multiple of $P_{${n}}$: it is orthogonal to every lower-degree polynomial, which is exactly the condition for a least-squares minimum.`,
        };
      },
    }),
    num({
      id: 'p-at-zero', difficulty: 3,
      gen(r) {
        const l = r.pick([2, 4, 6, 8, 10]), kk = l / 2, ans = P(l, 0);
        return {
          prompt: t`Set $x = 0$ in the generating function: $\dfrac{1}{\sqrt{1 + h^2}} = \sum_lP_l(0)\,h^l$. Expand the left side by the binomial series and read off $P_{${l}}(0)$.`,
          visual: gpic({ x: [0, 1], y: [0.55, 1.05], xlabel: 'h', curves: [{ fn: '1/sqrt(1 + x^2)', color: 'ink3', width: 1.6, dash: [6, 4] }, { fn: '1 - x^2/2', color: 'violet', width: 1.6, label: '2 terms', labelAt: 0.7, labelDy: 14 }, { fn: '1 - x^2/2 + 3*x^4/8', color: 'accent', width: 2, label: '3 terms', labelAt: 0.82, labelDy: -10 }] }, '1/√(1 + h²) (dashed) and its first binomial partial sums.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`Track the sign: the coefficient of $h^{2k}$ in $(1 + h^2)^{-1/2}$ is $\binom{-1/2}{k}$, of sign $(-1)^k$.` }],
          hints: [t`$(1 + u)^{-1/2} = \sum_k\binom{-1/2}{k}u^k$ with $u = h^2$; you need $k = ${kk}$.`, t`$\binom{-1/2}{k} = (-1)^k\dfrac{(2k)!}{4^k(k!)^2}$.`],
          teach: 'Special values of Pₗ fall out of the generating function at a special x.',
          explain: t`$P_{${l}}(0) = (-1)^{${kk}}\dfrac{${2 * kk}!}{4^{${kk}}(${kk}!)^2} = ${r4(ans)}$. Odd $P_l$ vanish at 0 (they are odd functions); the even ones shrink like $1/\sqrt{\pi l/2}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sunlit', difficulty: 3, transfer: true,
      gen(r) {
        const [body, S] = r.pick([['Earth', 1361], ['Mars', 586], ['Venus', 2601]]);
        const ans = SUN[2] * S;
        return {
          prompt: t`Sunlight of flux $S = ${S}$ W/m² falls on a spherical satellite near ${body}. At a point whose normal makes angle $\theta$ with the Sun direction, the incident flux is $S\max(0, \cos\theta)$. Expand it in Legendre polynomials of $\mu = \cos\theta$: what is the $P_2$ coefficient, in W/m²?`,
          visual: gpic({ x: [-1, 1], y: [-0.25 * S, 1.15 * S], xlabel: 'μ = cos θ', curves: [{ fn: `${S}*max(0, x)`, color: 'gold', width: 2.4, label: 'S max(0, μ)', labelAt: -0.75, labelDx: 0, labelDy: -14 }, { fn: `${S}*(${SUN[0]} + ${SUN[1]}*x + ${SUN[2]}*(1.5*x^2 - 0.5))`, color: 'accent', width: 1.8, dash: [6, 4] }] }, 'The incident flux over the sphere (gold) and its Legendre series through P₂ (dashed).'),
          answer: ans, units: 'W/m^2', tol: { rel: 0.005 },
          errors: [{ value: SUN[0] * S, feedback: t`That is $a_0 = S/4$, the mean over the whole sphere — the famous factor of 4. The question asks for the $P_2$ coefficient.` }, { value: SUN[1] * S, feedback: t`That is $a_1 = S/2$, the dipole part.` }, { value: S * quad((m) => m * P(2, m), 0, 1), feedback: t`Multiply the projection by $\frac{2l + 1}{2} = \frac52$.` }],
          hints: [t`$a_2 = \dfrac52\displaystyle\int_0^1 S\,\mu\,P_2(\mu)\,d\mu$ — the flux vanishes for $\mu < 0$.`, t`$\int_0^1\mu\cdot\tfrac12(3\mu^2 - 1)\,d\mu = \tfrac12\big(\tfrac34 - \tfrac12\big) = \tfrac18$.`],
          teach: 'Orthogonality turns a heating pattern into a mean (a₀), a hot-side/cold-side part (a₁) and a pole-versus-equator part (a₂).',
          explain: t`$a_2 = \frac52\cdot\frac18S = \frac{5}{16}S = ${r4(ans)}$ W/m². The series runs $\frac S4 + \frac S2P_1 + \frac{5S}{16}P_2 + \cdots$ (odd terms beyond $P_1$ vanish); its slow decay comes from the kink at the terminator, $\mu = 0$.`,
        };
      },
    }),
    num({
      id: 'cp-norm', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-4, 4, [0]), b = r.intExcept(-4, 4, [0]);
        const ans = (2 * a * a) / 5 + (2 * b * b) / 7;
        return {
          prompt: t`Compute $\displaystyle\int_{-1}^{1}\big(${a}P_2(x) ${b < 0 ? '-' : '+'} ${Math.abs(b)}P_3(x)\big)^2dx$.`,
          visual: gpic({ x: [-1, 1], y: [-0.5, (Math.abs(a) + Math.abs(b)) ** 2 + 0.5], xlabel: 'x', curves: [{ fn: `(${a}*(${legendreExpr(2)}) + ${b}*(${legendreExpr(3)}))^2`, color: 'accent', width: 2.2 }], shade: [{ fn: `(${a}*(${legendreExpr(2)}) + ${b}*(${legendreExpr(3)}))^2`, from: -1, to: 1, color: 'accent', alpha: 0.15 }] }, 'The integrand; the shaded area is asked for.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: a * a + b * b, feedback: 'The Pₗ are orthogonal but not normalized: ∫Pₗ² = 2/(2l + 1).' }, { value: a * a / 5 + b * b / 7, feedback: t`The norm is $\frac{2}{2l + 1}$, not $\frac{1}{2l + 1}$.` }],
          hints: ['Expand the square: the cross term integrates to zero.', t`$\int P_2^2 = \frac25$ and $\int P_3^2 = \frac27$.`],
          teach: 'Orthogonality is Pythagoras for functions: the squared norm of a sum of orthogonal pieces is the sum of their squared norms.',
          explain: t`$${a}^2\cdot\frac25 + ${b}^2\cdot\frac27 = ${r4(ans)}$; the cross term $2\cdot${a}\cdot${b}\int P_2P_3$ vanishes (here also by parity).`,
        };
      },
    }),
    mcq({
      id: 'cp-zeros', difficulty: 3,
      prompt: t`Which argument proves that $P_l$ has $l$ distinct zeros inside $(-1, 1)$?`,
      visual: gpic({ x: [-1, 1], y: [-1.1, 1.1], xlabel: 'x', curves: [{ fn: legendreExpr(5), color: 'accent', width: 2.3, label: 'P₅', labelAt: 0.95, labelDx: -28, labelDy: 4 }] }, 'P₅ on [−1, 1].'),
      choices: [
        'If Pₗ changed sign at only k < l points xᵢ inside, q = Π(x − xᵢ) would make q·Pₗ one-signed, yet ∫q·Pₗ = 0 because deg q < l',
        'Pₗ is even or odd, so its zeros come in pairs',
        'Pₗ(1) = 1 and Pₗ(−1) = ±1, so it must cross zero l times',
        'A polynomial of degree l has l roots by the fundamental theorem of algebra',
      ],
      answer: 0,
      why: {
        1: 'Parity pairs zeros ±x but says nothing about how many there are.',
        2: 'End values fix the parity of the number of crossings, not the number itself.',
        3: 'The fundamental theorem gives l complex roots, counted with multiplicity — not l real, simple ones inside (−1, 1).',
      },
      hints: ['Pₗ is orthogonal to every polynomial of lower degree.', 'Build a lower-degree polynomial that changes sign exactly where Pₗ does.'],
      teach: 'Orthogonality to all lower degrees forces an orthogonal polynomial to have all its zeros real, simple and inside the interval.',
      explain: t`With $q = \prod(x - x_i)$, $qP_l \ge 0$ (or $\le 0$) and is not identically zero, so $\int qP_l \ne 0$ — contradicting orthogonality unless $k \ge l$. The same argument works for every family of this lesson and the next, and it is why the zeros of $P_n$ make good quadrature nodes ([ST-F](#/lesson/st-f.F5.2)).`,
    }),
  ],
  sources: [SRC.dlmf18, SRC.arfken, SRC.boas],
});
