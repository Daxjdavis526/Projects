// Sturm–Liouville problems: the pattern behind Fourier, Legendre and Bessel.
// Any equation (p y′)′ − q y + λ w y = 0 with separated boundary conditions
// has real eigenvalues marching to infinity, eigenfunctions with n − 1 zeros,
// orthogonal with the weight w — so any reasonable function expands in them.
// Legendre in Sturm–Liouville form, the proof of orthogonality, a rod cooling
// at one end (eigenvalues from tan μ = −μ/h), Bessel's weight x checked in
// Python, and — as a preview — the Schrödinger equation as a Sturm–Liouville
// problem, with a particle in a box.
import { lesson, mcq, num, expr, match, order, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { besselZero, jExpr } from './_second.js';
import { fpic, n } from './_laplace.js';

const t = String.raw;

// ── the Explore: three families on [0, 1] ─────────────────────────────────
// 0 Fourier sines sin(kπx); 1 Robin sines sin(μₖx) with tan μ = −μ (y′(1) + y(1) = 0); 2 Bessel J₀(j₀ₖx), weight x
function robinRoots(h, count = 4) {
  const f = (m) => Math.sin(m) + (m * Math.cos(m)) / h, out = [];
  for (let k = 0; k < count; k++) {
    let lo = Math.PI / 2 + k * Math.PI + 1e-12, hi = Math.PI * (k + 1) - 1e-12;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; }
    out.push((lo + hi) / 2);
  }
  return out;
}
const MU = robinRoots(1), J0Z = [1, 2, 3, 4].map((k) => besselZero(0, k));
const sel = (a, b) => `step(0.5 - abs(${a} - ${b}))`;
const FAM = [
  (k) => `sin(${k}*pi*x)`,
  (k) => `sin(${MU[k - 1].toFixed(12)}*x)`,
  (k) => jExpr(0, `${J0Z[k - 1].toFixed(12)}*x`, J0Z[k - 1] + 0.01),
];
const LAM = [(k) => (k * Math.PI) ** 2, (k) => MU[k - 1] ** 2, (k) => J0Z[k - 1] ** 2];
const Y = (idx) => '(' + [0, 1, 2].flatMap((f) => [1, 2, 3, 4].map((k) => `${sel('F', f)}*${sel(idx, k)}*${FAM[f](k)}`)).join(' + ') + ')';
const LAMBDA = (idx) => [0, 1, 2].flatMap((f) => [1, 2, 3, 4].map((k) => `${sel('F', f)}*${sel(idx, k)}*${LAM[f](k).toFixed(6)}`)).join(' + ');
const W = `(1 + ${sel('F', 2)}*wt*(x - 1))`;
const PROD = `${Y('m')}*${Y('n')}*${W}`;

/** Legendre polynomials P₀ … P₅ as Atlas expressions. */
const P = ['1', 'x', '(3x^2 - 1)/2', '(5x^3 - 3x)/2', '(35x^4 - 30x^2 + 3)/8', '(63x^5 - 70x^3 + 15x)/8'];
const PT = ['1', 'x', t`\tfrac12(3x^2 - 1)`, t`\tfrac12(5x^3 - 3x)`, t`\tfrac18(35x^4 - 30x^2 + 3)`, t`\tfrac18(63x^5 - 70x^3 + 15x)`];

export default lesson({
  id: 'math2280.DE-9.1',
  title: 'Sturm–Liouville problems and orthogonal eigenfunctions',
  minutes: 15, difficulty: 3,
  intro: t`The string’s sines are one case of a general pattern. A **Sturm–Liouville problem** is an equation of the form

$$\big(p(x)\,y'\big)' - q(x)\,y + \lambda\,w(x)\,y = 0, \qquad a < x < b,$$

with one condition at each end of the form $\alpha_1y + \alpha_2y' = 0$. When $p$ and $w$ are positive on $[a, b]$ (a **regular** problem), the theorem says: the eigenvalues are real and form a ladder $\lambda_1 < \lambda_2 < \cdots \to \infty$; the $n$-th eigenfunction has exactly $n - 1$ zeros inside the interval; eigenfunctions of different eigenvalues are **orthogonal with weight $w$**, $\int_a^b y_m\,y_n\,w\,dx = 0$; and any reasonable function can be expanded in them, just as in a Fourier series. Fourier sines are the case $p = w = 1$, $q = 0$. **Legendre** polynomials (spherical problems) and **Bessel** functions (drumheads, circular waveguides) are others. *Preview:* the Schrödinger equation $-\frac{\hbar^2}{2m}\psi'' + V\psi = E\psi$ is a Sturm–Liouville problem with $\lambda = E$ — which is why energy levels are real and discrete and stationary states are orthogonal.`,
  symbols: [
    { tex: t`p(x)`, text: t`multiplies the derivative: a stiffness or tension that may vary along $[a, b]$ (positive inside)` },
    { tex: t`q(x)`, text: 'a potential-like term: a restoring force or, in quantum mechanics, the potential energy V' },
    { tex: t`w(x)`, text: t`the **weight**: a mass density, or the circumference $2\pi x$ of a ring at radius $x$ — it decides which integral is orthogonality` },
    { tex: t`\lambda`, text: t`the eigenvalue: only a discrete ladder of values allows a nonzero solution` },
    { tex: t`y(x)`, text: t`the eigenfunction belonging to $\lambda$, defined up to a constant multiple` },
    { tex: t`[a, b]`, text: 'the interval, with one boundary condition at each end' },
  ],
  why: t`Every separation of variables — in a rod, a drum, a sphere or an atom — ends in a Sturm–Liouville problem, so this one theorem guarantees that the eigenfunction expansion exists and that its coefficients come from simple integrals.`,
  visual: {
    type: 'graph',
    title: 'Orthogonal — with the right weight',
    lead: t`Choose a family of eigenfunctions and two of them, $y_m$ (violet) and $y_n$ (teal). The shaded area is $y_m\,y_n\,w$, and the readout is its integral $\int_0^1 y_m y_n w\,dx$. Different eigenfunctions give zero; the weight has to be the right one.`,
    tasks: [
      'Pick any m ≠ n in any family: the areas above and below the axis cancel and the integral is 0 — to rounding.',
      'Robin family (one end held at zero, the other cooling: y′(1) + y(1) = 0): the eigenvalues are not evenly spaced, yet orthogonality still holds. It comes from the Sturm–Liouville form, not from sines being special.',
      'Bessel family: switch the weight off. The integral is no longer zero — for a drumhead, w = x is the circumference of each ring, and orthogonality needs it.',
      'Set m = n: the integral is positive, the eigenfunction’s squared norm.',
    ],
    params: {
      x: [0, 1], y: [-1.15, 1.15], xlabel: 'x', ylabel: '',
      choices: [
        { key: 'F', label: 'Family', options: [[0, 'Fourier: $\\sin k\\pi x$'], [1, 'Robin: $\\sin\\mu_k x$'], [2, 'Bessel: $J_0(j_{0,k}x)$']], value: 0 },
        { key: 'wt', label: 'Weight $w = x$ (Bessel)', options: [[1, 'On'], [0, 'Off']], value: 1, explain: t`For the Bessel family only: switch the weight to $w = 1$ and see orthogonality fail. The other two families have $w = 1$ anyway.` },
      ],
      sliders: [
        { key: 'm', label: 'Eigenfunction $y_m$', min: 1, max: 4, step: 1, value: 1, explain: t`The $m$-th eigenfunction of the family: it has $m - 1$ zeros inside.` },
        { key: 'n', label: 'Eigenfunction $y_n$', min: 1, max: 4, step: 1, value: 2, explain: 'A second eigenfunction to test against the first.' },
      ],
      shade: [{ fn: `max(${PROD}, 0)`, from: 0, to: 1, color: 'accent', alpha: 0.3 }, { fn: `min(${PROD}, 0)`, from: 0, to: 1, color: 'bad', alpha: 0.3 }],
      curves: [{ fn: Y('m'), color: 'violet', width: 2.2 }, { fn: Y('n'), color: 'teal', width: 2.2, dash: true }],
      integral: { fn: PROD, from: 0, to: 1 },
      readouts: [
        { label: '$\\int_0^1 y_m\\,y_n\\,w\\,dx$', expr: 'integral', digits: 3 },
        { label: '$\\lambda_m$', expr: LAMBDA('m'), digits: 4 },
        { label: '$\\lambda_n$', expr: LAMBDA('n'), digits: 4 },
      ],
    },
    caption: t`Fourier: $y'' + \lambda y = 0$, $y(0) = y(1) = 0$. Robin: the same equation with $y'(1) + y(1) = 0$, so $\tan\mu = -\mu$ and $\lambda = \mu^2$. Bessel: $(xy')' + \lambda xy = 0$, $y(1) = 0$, bounded at 0 — a drumhead’s radially symmetric modes, $\lambda = j_{0,k}^2$. Integrals by Simpson’s rule; readouts below $10^{-3}$ are rounding.`,
  },
  example: {
    prompt: t`Write Legendre’s equation $(1 - x^2)y'' - 2xy' + \lambda y = 0$ on $[-1, 1]$ in Sturm–Liouville form, check that $P_2 = \tfrac12(3x^2 - 1)$ is an eigenfunction, and show that it is orthogonal to $P_0 = 1$ and $P_1 = x$.`,
    visual: fpic(null, [-1, 1], [-1.15, 1.15], t`The first four Legendre polynomials, $P_0$ to $P_3$: $P_n$ has $n$ zeros inside $(-1, 1)$. They are the angular shapes of fields around a sphere.`, {
      xlabel: 'x', ylabel: 'Pₙ',
      curves: [0, 1, 2, 3].map((k) => ({ fn: P[k], color: ['ink3', 'violet', 'accent', 'teal'][k], width: 2.2, label: `P${'₀₁₂₃'[k]}`, labelAt: [-0.55, 0.55, 0.85, 0.5][k], labelDx: 6, labelDy: [12, -12, 12, 14][k] })),
    }),
    steps: [
      { label: 'Sturm–Liouville form', text: t`$\big((1 - x^2)y'\big)' = (1 - x^2)y'' - 2xy'$, so the equation is $\big((1 - x^2)y'\big)' + \lambda y = 0$: $\;p = 1 - x^2$, $q = 0$, $w = 1$.` },
      { label: 'A singular problem', text: t`$p$ vanishes at $x = \pm 1$, so no boundary values are imposed there; the condition is that $y$ stays **bounded**. The series solutions of DE-7 blow up at $\pm 1$ unless they terminate, which happens only for $\lambda = n(n + 1)$: the eigenvalues, with the polynomials $P_n$.` },
      { label: 'Check the eigenpair', text: t`$P_2' = 3x$, $P_2'' = 3$: $\;(1 - x^2)\cdot 3 - 2x\cdot 3x + \lambda\cdot\tfrac12(3x^2 - 1) = 3 - 9x^2 + \tfrac{\lambda}{2}(3x^2 - 1)$, which vanishes for $\lambda = 6 = 2\cdot 3$ ✓.` },
      { label: 'Orthogonality', text: t`$\int_{-1}^1 P_1P_2\,dx = \int_{-1}^1\tfrac12(3x^3 - x)\,dx = 0$ (an odd integrand), and $\int_{-1}^1 P_0P_2\,dx = \tfrac12\big[x^3 - x\big]_{-1}^{1} = 0$ — not by symmetry this time, but exactly as the theorem promises.` },
      { label: 'Why it works', text: t`For two eigenpairs, $(\lambda_m - \lambda_n)\int_a^b y_my_nw\,dx = \Big[p\,(y_m'y_n - y_n'y_m)\Big]_a^b$ (Lagrange’s identity, integrated). The boundary conditions — or here $p(\pm1) = 0$ — make the right side zero, so different eigenvalues force a zero integral.` },
      { label: 'Sense check', text: t`The norm is positive: $\int_{-1}^1 P_2^2\,dx = \tfrac25$. Orthogonal does not mean small; it means the overlap of two **different** eigenfunctions cancels.` },
    ],
    answer: t`$\big((1 - x^2)y'\big)' + \lambda y = 0$ with $p = 1 - x^2$, $w = 1$; $P_2$ has $\lambda = 6$, and $\int_{-1}^1 P_0P_2\,dx = \int_{-1}^1 P_1P_2\,dx = 0$.`,
  },
  practice: [
    match({
      id: 'sl-form', difficulty: 2,
      prompt: t`Put each equation in the form $(p\,y')' - q\,y + \lambda w\,y = 0$ and match it with its $p$ and $w$.`,
      left: [
        t`$y'' + \lambda y = 0$ (Fourier)`,
        t`$(1 - x^2)y'' - 2xy' + \lambda y = 0$ (Legendre)`,
        t`$xy'' + y' + \lambda xy = 0$ (Bessel, order 0)`,
        t`$y'' - 2xy' + \lambda y = 0$ (Hermite, multiplied by $e^{-x^2}$)`,
      ],
      right: ['p = 1, w = 1', 'p = 1 − x², w = 1', 'p = x, w = x', 'p = w = exp(−x²)', 'p = x², w = 1/x'],
      answer: [0, 1, 2, 3],
      hints: [t`Look for $p\,y'' + p'\,y'$: the first two terms must be the derivative of $p\,y'$.`, t`$xy'' + y' = (xy')'$, and $e^{-x^2}(y'' - 2xy') = (e^{-x^2}y')'$.`],
      teach: t`An equation is in Sturm–Liouville form when its derivative terms are exactly $(p\,y')'$; then $w$ is whatever multiplies $\lambda y$.`,
      explain: t`Fourier: $p = w = 1$. Legendre: $(1 - x^2)y'' - 2xy' = \big((1 - x^2)y'\big)'$, $w = 1$. Bessel: $(xy')' + \lambda xy = 0$, so $w = x$. Hermite: after multiplying by $e^{-x^2}$, $(e^{-x^2}y')' + \lambda e^{-x^2}y = 0$ — Hermite polynomials are orthogonal with weight $e^{-x^2}$, the quantum oscillator’s states.`,
    }),
    expr({
      id: 'integrating-factor', difficulty: 3,
      prompt: t`Hermite’s equation $y'' - 2xy' + \lambda y = 0$ is not in Sturm–Liouville form. Find the factor $p(x)$, with $p(0) = 1$, such that multiplying by it gives $\big(p\,y'\big)' + \lambda\,p\,y = 0$.`,
      answer: 'e^(-x^2)', answerTeX: t`e^{-x^2}`, lhs: 'p(x)',
      vars: { x: [-2, 2] },
      errors: [{ answer: 'e^(x^2)', feedback: t`Check: $(p\,y')' = p\,y'' + p'\,y'$ must equal $p\,(y'' - 2xy')$, so $p' = -2xp$ — a decaying Gaussian.` }, { answer: '-2x', feedback: t`$-2x$ is the coefficient of $y'$. You need $p$ with $p'/p = -2x$.` }],
      hints: [t`Multiplying by $p$: $p\,y'' - 2xp\,y'$ must be $(p\,y')' = p\,y'' + p'\,y'$.`, t`So $p' = -2x\,p$: a separable equation for $p$.`],
      teach: t`Any $y'' + P(x)y' + \ldots$ becomes Sturm–Liouville after multiplying by $p = e^{\int P\,dx}$ — the same integrating factor as in DE-2.2.`,
      explain: t`$p'/p = -2x$ gives $p = e^{-x^2}$, so $(e^{-x^2}y')' + \lambda e^{-x^2}y = 0$ with $w = e^{-x^2}$. The eigenvalues are $\lambda = 2n$ and the eigenfunctions the Hermite polynomials $H_n$, orthogonal with weight $e^{-x^2}$ on the whole real line.`,
      integrand: '-2x*e^(-x^2)',
      visual: fpic(null, [-3.5, 3.5], [-1.2, 1.2], t`*Preview:* the quantum harmonic oscillator’s first three states, $H_n(x)e^{-x^2/2}$, scaled to comparable heights. Their orthogonality is the Hermite weight at work.`, { xlabel: 'x', ylabel: 'ψ', curves: [{ fn: 'exp(-x^2/2)', color: 'accent', width: 2.2 }, { fn: '1.1658*x*exp(-x^2/2)', color: 'violet', width: 2.2 }, { fn: '(2x^2 - 1)*exp(-x^2/2)', color: 'teal', width: 2.2 }] }),
    }),
    num({
      id: 'legendre-norm', difficulty: 2,
      gen(r) {
        const k = r.int(1, 4);
        return {
          prompt: t`Compute $\displaystyle\int_{-1}^{1} P_${k}(x)^2\,dx$ for $P_${k} = ${PT[k]}$.`,
          answer: 2 / (2 * k + 1), tol: { rel: 0.005 },
          integrand: `(${P[k]})^2`, limits: [-1, 1],
          errors: [{ value: 0, feedback: t`Orthogonality makes $\int P_mP_n = 0$ only for $m \ne n$. A function’s overlap with itself is positive.` }, { value: 1 / (2 * k + 1), feedback: t`Integrate over the whole of $[-1, 1]$, both halves.` }],
          hints: [t`Expand the square and integrate term by term; only even powers survive over $[-1, 1]$, each giving $\int_{-1}^1 x^{2j}dx = \frac{2}{2j + 1}$.`],
          teach: t`Orthogonal eigenfunctions have positive norms $\int y_n^2w\,dx$; for Legendre polynomials it is $\frac{2}{2n + 1}$.`,
          explain: t`$\int_{-1}^1 P_${k}^2\,dx = \dfrac{2}{2\cdot${k} + 1} = ${fmt(2 / (2 * k + 1), 4)}$. These norms are the denominators when a function is expanded in Legendre polynomials: $c_n = \frac{2n + 1}{2}\int_{-1}^1 fP_n\,dx$.`,
          visual: fpic(`(${P[k]})^2`, [-1, 1], [-0.1, 1.15], t`$P_${k}(x)^2$ on $[-1, 1]$; the shaded area is the answer.`, { xlabel: 'x', ylabel: '', shade: [{ fn: `(${P[k]})^2`, from: -1, to: 1, color: 'accent', alpha: 0.22 }], domain: [-1, 1] }),
        };
      },
    }),
    mcq({
      id: 'zeros', difficulty: 2,
      prompt: t`A regular Sturm–Liouville problem on $[a, b]$ has eigenvalues $\lambda_1 < \lambda_2 < \lambda_3 < \cdots$. How many zeros does the eigenfunction of $\lambda_4$ have strictly inside $(a, b)$?`,
      choices: ['3', '4', '2', 'It depends on p, q and w'],
      answer: 0,
      why: {
        1: t`$n$ counts eigenvalues from 1: the first eigenfunction has **no** interior zeros, so the fourth has three.`,
        2: 'Each step up the ladder adds exactly one zero.',
        3: 'The count is the same for every regular Sturm–Liouville problem — that is the content of the oscillation theorem.',
      },
      hints: ['Count the zeros of the Fourier sines: sin(πx) has none inside (0, 1), sin(2πx) one, …'],
      teach: t`The $n$-th eigenfunction of a regular Sturm–Liouville problem has exactly $n - 1$ zeros inside the interval.`,
      explain: t`Three. The first eigenfunction never changes sign — for a string, the fundamental is one loop — and each higher one adds a node. The same rule counts the nodes of a quantum particle’s wave function: the ground state has none.`,
      visual: fpic(null, [0, 1], [-1.15, 1.15], t`The first two eigenfunctions of the Robin problem ($y'' + \lambda y = 0$, $y(0) = 0$, $y'(1) + y(1) = 0$): no interior zero, then one.`, { xlabel: 'x', ylabel: 'y', curves: [{ fn: `sin(${MU[0]}*x)`, color: 'accent', width: 2.2 }, { fn: `sin(${MU[1]}*x)`, color: 'violet', width: 2.2 }] }),
    }),
    order({
      id: 'proof', difficulty: 3,
      prompt: t`Put the steps of the proof that eigenfunctions of different eigenvalues are orthogonal in order.`,
      items: [
        t`Write the equation for two eigenpairs: $(py_m')' - qy_m + \lambda_mwy_m = 0$ and $(py_n')' - qy_n + \lambda_nwy_n = 0$.`,
        t`Multiply the first by $y_n$ and the second by $y_m$, and subtract: the $q$ terms cancel.`,
        t`Recognise $y_n(py_m')' - y_m(py_n')' = \big[p(y_m'y_n - y_n'y_m)\big]'$, an exact derivative.`,
        t`Integrate over $[a, b]$: $\big[p(y_m'y_n - y_n'y_m)\big]_a^b + (\lambda_m - \lambda_n)\int_a^b wy_my_n\,dx = 0$.`,
        t`The boundary conditions make the bracket vanish at both ends.`,
        t`Since $\lambda_m \ne \lambda_n$, conclude $\int_a^b w\,y_m\,y_n\,dx = 0$.`,
      ],
      hints: ['Start from the two equations and end with the conclusion; the integration comes after the exact derivative is found.', 'The boundary terms can only be discarded after integrating.'],
      teach: t`Orthogonality follows from the Sturm–Liouville form by one integration by parts: the boundary terms vanish and leave $(\lambda_m - \lambda_n)\int wy_my_n = 0$.`,
      explain: t`Each step needs the one before: the subtraction cancels $q$, the exact derivative lets you integrate, the boundary conditions kill the boundary term, and distinct eigenvalues force the integral to zero. With $m = n$ the same identity shows eigenvalues are real.`,
    }),
    num({
      id: 'robin', difficulty: 3,
      gen(r) {
        const h = r.pick([1, 2, 5]), L = r.pick([1, 0.5]);
        const mu = robinRoots(h * L, 1)[0], lam = (mu / L) ** 2, HT = String(h), MH = h === 1 ? '-\\mu' : `-\\mu/${h}`, FH = h === 1 ? '\\mu' : `\\frac{\\mu}{${h}}`;
        return {
          prompt: t`A rod of length $L = ${L}$ m has one end held at the surroundings’ temperature and the other losing heat to the air: its spatial modes solve $X'' + \lambda X = 0$, $X(0) = 0$, $X'(${L}) + ${h === 1 ? '' : h}X(${L}) = 0$ (a regular Sturm–Liouville problem). With $X = \sin\mu x$, the second condition becomes $\tan(\mu L) = ${MH}$. Find the lowest eigenvalue $\lambda_1 = \mu_1^2$.`,
          answer: lam, units: 'm^-2', tol: { rel: 0.005 },
          errors: [{ value: (Math.PI / L) ** 2, feedback: t`That is the fixed–fixed value. Losing heat at the end makes $\mu_1L$ fall between $\pi/2$ and $\pi$.` }, { value: (Math.PI / (2 * L)) ** 2, feedback: t`That is the insulated-end value ($X'(L) = 0$). Heat loss pushes $\mu_1L$ above $\pi/2$.` }],
          hints: [t`$\tan(\mu L) = ${MH}$ is negative, so $\mu L$ lies between $\pi/2$ and $\pi$ for the first root.`, t`Solve $\sin(\mu L) + ${FH}\cos(\mu L) = 0$ numerically in that range (bisection, or a calculator’s solver), then square.`],
          teach: 'A Robin end condition gives eigenvalues from a transcendental equation — unevenly spaced, but still a Sturm–Liouville ladder with orthogonal eigenfunctions.',
          explain: t`$\mu_1 = ${fmt(mu / L, 5)}$ m⁻¹ ($\mu_1L = ${fmt(mu, 5)}$), so $\lambda_1 = ${fmt(lam, 4)}\ \text{m}^{-2}$ — between the insulated value $(\pi/2L)^2$ and the fixed value $(\pi/L)^2$, approaching the fixed one as $h \to \infty$. The slowest temperature mode decays like $e^{-\alpha\lambda_1t}$ for diffusivity $\alpha$.`,
          visual: fpic(`tan(${L}x)`, [0, Math.PI / L], [-6, 6], t`$\tan(\mu L)$ (blue) and $${MH}$ (dashed) against $\mu$: the eigenvalues sit where they cross.`, { xlabel: 'μ', ylabel: '', xticks: 0, curves: [{ fn: `-x/${h}`, color: 'gold', dash: true, width: 1.8 }], vlines: [{ x: Math.PI / (2 * L), label: 'μL = π/2', color: 'ink3' }, { x: Math.PI / L, label: 'μL = π', color: 'ink3' }] }),
        };
      },
    }),
    code({
      id: 'bessel-weight', difficulty: 3,
      prompt: t`Check the Bessel weight numerically. The drumhead modes $y_k(x) = J_0(j_{0,k}\,x)$ on $[0, 1]$ ($j_{0,k}$ the zeros of $J_0$) solve $(xy')' + \lambda xy = 0$ with weight $w = x$. Write \`inner(m, n, weighted=True)\` returning $\int_0^1 y_m y_n\,w\,dx$ with $w = x$ (or $w = 1$ if \`weighted\` is false), using \`scipy.special.jv\`, \`jn_zeros\` and \`quad\`. Then fill the $3\times3$ array \`G\` with the weighted inner products for $m, n = 1, 2, 3$.`,
      starter: t`import numpy as np
from scipy.special import jv, jn_zeros
from scipy.integrate import quad

z = jn_zeros(0, 3)          # j01, j02, j03

def inner(m, n, weighted=True):
    pass

G = None
print(G)
print(inner(1, 2, weighted=False))
`,
      answer: t`import numpy as np
from scipy.special import jv, jn_zeros
from scipy.integrate import quad

z = jn_zeros(0, 3)          # j01, j02, j03

def inner(m, n, weighted=True):
    w = (lambda x: x) if weighted else (lambda x: 1.0)
    f = lambda x: jv(0, z[m - 1] * x) * jv(0, z[n - 1] * x) * w(x)
    return quad(f, 0, 1, limit=200)[0]

G = np.array([[inner(m, n) for n in (1, 2, 3)] for m in (1, 2, 3)])
print(G)
print(inner(1, 2, weighted=False))`,
      tests: [
        { name: t`with the weight, $y_1$ and $y_2$ are orthogonal`, code: 'abs(inner(1, 2)) < 1e-10' },
        { name: t`without it they are not: $\int_0^1 y_1y_2\,dx \approx 0.1961$`, code: 'abs(inner(1, 2, weighted=False) - 0.196082295) < 1e-6' },
        { name: t`\`G\` is diagonal, with $G_{kk} = J_1(j_{0,k})^2/2$`, code: 'G.shape == (3, 3) and np.max(np.abs(G - np.diag(np.diag(G)))) < 1e-10 and np.allclose(np.diag(G), jv(1, z)**2 / 2, atol=1e-12)' },
      ],
      hints: [t`Build the integrand as a \`lambda x: jv(0, z[m-1]*x) * jv(0, z[n-1]*x) * w(x)\`, and \`quad(f, 0, 1)[0]\` integrates it.`, t`\`G = np.array([[inner(m, n) for n in (1, 2, 3)] for m in (1, 2, 3)])\`.`],
      teach: 'Orthogonality is with respect to the weight the Sturm–Liouville form names: use the wrong weight and it fails.',
      explain: t`The weighted Gram matrix is diagonal, $\mathrm{diag}(0.1348, 0.0579, 0.0368) = J_1(j_{0,k})^2/2$, while the unweighted $\int_0^1 y_1y_2\,dx \approx 0.196$. For a drumhead the weight is geometry: a ring at radius $x$ has circumference $2\pi x$, so the membrane’s area element carries the factor $x$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-legendre', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5);
        return {
          prompt: t`$P_${k}(x) = ${PT[k]}$ is an eigenfunction of Legendre’s equation $\big((1 - x^2)y'\big)' + \lambda y = 0$. What is its eigenvalue?`,
          answer: k * (k + 1), tol: { rel: 0, abs: 0.01 },
          errors: [{ value: k * k, feedback: t`That would be a Fourier-type eigenvalue. For Legendre, $\lambda = n(n + 1)$.` }, { value: k, feedback: t`Substitute $P_${k}$ and match the leading power: $-n(n - 1) - 2n + \lambda = 0$.` }],
          hints: [t`Substitute and look only at the highest power, $x^${k}$: $(1 - x^2)y''$ gives $-${k}\cdot${k - 1}$, $-2xy'$ gives $-2\cdot${k}$.`],
          teach: t`Legendre’s eigenvalues are $n(n + 1)$: matching the leading power of $P_n$ gives $\lambda = n(n - 1) + 2n$.`,
          explain: t`The $x^${k}$ terms: $-${k}(${k - 1}) - 2(${k}) + \lambda = 0$, so $\lambda = ${k}\cdot${k + 1} = ${k * (k + 1)}$. In quantum mechanics this becomes the angular-momentum rule $L^2 = \ell(\ell + 1)\hbar^2$.`,
          visual: fpic(P[k], [-1, 1], [-1.15, 1.15], t`$P_${k}$ on $[-1, 1]$, with its ${k} zeros inside.`, { xlabel: 'x', ylabel: `P${'₀₁₂₃₄₅'[k]}`, domain: [-1, 1] }),
        };
      },
    }),
    num({
      id: 'cp-box', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), k = r.int(1, 3);
        const hbar = 1.054571817e-34, me = 9.1093837015e-31, eV = 1.602176634e-19;
        const E = (k * k * Math.PI ** 2 * hbar * hbar) / (2 * me * (L * 1e-9) ** 2) / eV;
        return {
          prompt: t`*Preview of quantum mechanics.* An electron confined to a 1D box of width $L = ${L}$ nm obeys $-\dfrac{\hbar^2}{2m}\psi'' = E\psi$ with $\psi(0) = \psi(L) = 0$ — a Sturm–Liouville problem with $p = \hbar^2/2m$, $q = 0$, $w = 1$ and eigenvalue $\lambda = E$. Using the string’s eigenvalues, find $E_${k}$ in eV. ($\hbar = 1.0546\times10^{-34}$ J·s, $m_e = 9.109\times10^{-31}$ kg, $1\ \text{eV} = 1.602\times10^{-19}$ J.)`,
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: E * 4, feedback: t`The eigenvalues of $\psi'' + k^2\psi = 0$ on $[0, L]$ have $k = n\pi/L$, not $2n\pi/L$.` }, ...(k > 1 ? [{ value: E / (k * k), feedback: t`That is $E_1$. Energies grow like $n^2$.` }] : [])],
          hints: [t`$\psi'' + \frac{2mE}{\hbar^2}\psi = 0$ with fixed ends needs $\frac{2mE}{\hbar^2} = \left(\frac{n\pi}{L}\right)^2$.`, t`$E_n = \dfrac{n^2\pi^2\hbar^2}{2mL^2}$; convert joules to eV at the end.`],
          teach: 'The Schrödinger equation in a box is the string’s eigenvalue problem: allowed energies are its eigenvalues, n²π²ħ²/2mL².',
          explain: t`$E_${k} = \dfrac{${k * k}\pi^2\hbar^2}{2m_e(${L}\times10^{-9})^2} = ${fmt(E, 3)}$ eV. Real, discrete and growing like $n^2$, as the Sturm–Liouville theorem promises; the wave functions $\sin(n\pi x/L)$ are orthogonal. The full story is in [the infinite square well](#/lesson/phys2710.MP7.2).`,
          visual: fpic(null, [0, 1], [-1.6, 1.6], t`The first three states in the box, $\sin(n\pi x/L)$, on $x/L$ from 0 to 1 — the string’s modes again.`, { xlabel: 'x / L', ylabel: 'ψ', curves: [1, 2, 3].map((j, i) => ({ fn: `sin(${j}*pi*x)`, color: ['accent', 'violet', 'teal'][i], width: 2.2 })) }),
        };
      },
    }),
    mcq({
      id: 'cp-weight', difficulty: 2,
      prompt: t`The radially symmetric modes of a circular drumhead, $J_0(j_{0,k}r)$ on $0 \le r \le 1$, satisfy $\int_0^1 J_0(j_{0,1}r)\,J_0(j_{0,2}r)\,r\,dr = 0$. Why is the factor $r$ there?`,
      choices: [
        t`It is the weight $w$ of the Sturm–Liouville form $(r\,y')' + \lambda\,r\,y = 0$ — physically, a ring at radius $r$ has area $2\pi r\,dr$`,
        t`It makes the integral easier to evaluate`,
        t`Any weight would do: orthogonality holds for every positive $w$`,
        t`It cancels the singular point at $r = 0$, where Bessel functions are infinite`,
      ],
      answer: 0,
      why: {
        1: 'The factor is what makes the integral zero at all; without it the integral is about 0.196.',
        2: 'Orthogonality holds only with the weight the equation itself carries.',
        3: t`$J_0$ is finite at $r = 0$, where it equals 1.`,
      },
      hints: [t`Write Bessel’s equation of order 0 as $(r\,y')' + \lambda r\,y = 0$: what multiplies $\lambda y$?`],
      teach: t`Orthogonality is $\int y_my_n\,w = 0$ with the specific weight $w$ of the Sturm–Liouville form.`,
      explain: t`In Sturm–Liouville form $p = r$ and $w = r$. Physically the drumhead’s mass at radius $r$ sits in a ring of area $2\pi r\,dr$, so overlaps of mode shapes must count each ring by its area. The same happens in spherical problems with $r^2$ and $\sin\theta$.`,
      visual: fpic(null, [0, 1], [-0.5, 1.1], t`The first two radially symmetric drumhead modes, $J_0(2.405r)$ (blue) and $J_0(5.520r)$ (violet), from the centre to the rim.`, { xlabel: 'r', ylabel: '', curves: [{ fn: FAM[2](1), color: 'accent', width: 2.2 }, { fn: FAM[2](2), color: 'violet', width: 2.2 }] }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §5.1 Sturm–Liouville problems', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Eigenvalues and eigenfunctions (Robin conditions)', url: 'https://tutorial.math.lamar.edu/Classes/DE/BVPEvals.aspx' },
    { label: 'NIST Digital Library of Mathematical Functions, §10.21 (zeros of Bessel functions) and §18.3 (Legendre polynomials)', url: 'https://dlmf.nist.gov/' },
  ],
});
