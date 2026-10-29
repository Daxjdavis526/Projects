// Orthogonal eigenfunctions and completeness: eigenfunction expansions with a
// weight, completeness as Parseval's identity (checked numerically for a
// Robin family whose eigenvalues are not multiples of anything), the Rayleigh
// quotient as a variational upper bound for λ₁, Weyl-type asymptotics, and a
// finite-difference generalized eigenproblem.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
const bis = (f, a, b) => { for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
// Robin family of E5.1: sin μx on [0, 1], μ cos μ + 2 sin μ = 0; expansion of f = 1
const MU = [...Array(4000).keys()].map((k) => bis((m) => m * Math.cos(m) + 2 * Math.sin(m), PI / 2 + 1e-9 + k * PI, PI + k * PI - 1e-9));
const NRM = MU.map((m) => 0.5 - Math.sin(2 * m) / (4 * m));
const C = MU.map((m, i) => (1 - Math.cos(m)) / m / NRM[i]);
const bessel = (N) => C.slice(0, N).reduce((s, c, i) => s + c * c * NRM[i], 0);
const SUM8 = C.slice(0, 8).map((c, i) => `${c.toFixed(6)}*sin(${MU[i].toFixed(6)}*x)`).join(' + ');
const SUM2 = C.slice(0, 2).map((c, i) => `${c.toFixed(6)}*sin(${MU[i].toFixed(6)}*x)`).join(' + ');
const PI2 = PI * PI;

export default lesson({
  id: 'st-e.E5.2',
  title: 'Orthogonal eigenfunctions and completeness',
  minutes: 16, difficulty: 3,
  intro: t`For a **regular** Sturm–Liouville problem — $-(p\,u')' + q\,u = \lambda\,w\,u$ on $[a, b]$ with $p, w > 0$ and self-adjoint boundary conditions — the eigenvalues form a ladder $\lambda_1 < \lambda_2 < \cdots \to \infty$, the eigenfunctions $\phi_n$ are orthogonal with weight $w$, and they are **complete**: every $f$ with $\int|f|^2w\,dx < \infty$ is their sum,

$$f = \sum_{n=1}^{\infty}c_n\,\phi_n, \qquad c_n = \frac{\int_a^b f\,\phi_n\,w\,dx}{\int_a^b \phi_n^2\,w\,dx},$$

converging in the weighted mean square, with Parseval’s identity $\int|f|^2w = \sum|c_n|^2\int\phi_n^2w$ as the test. Fourier series are the case $p = w = 1$, $q = 0$; Legendre, Bessel and Hermite expansions are others ([MATH 2280](#/lesson/math2280.DE-9.1) meets the family). The mathematician’s companion tool is the **Rayleigh quotient** $R[u] = \frac{\int(p\,u'^2 + q\,u^2)}{\int w\,u^2}$: over trial functions obeying the boundary conditions its minimum is exactly $\lambda_1$, so any guess gives an **upper bound** on the lowest eigenvalue.`,
  symbols: [
    { tex: '\\phi_n', text: 'the $n$-th eigenfunction (it has $n - 1$ zeros inside the interval)' },
    { tex: '\\lambda_n', text: 'the $n$-th eigenvalue, real and increasing without bound' },
    { tex: 'w(x)', text: 'the weight, $w > 0$: it enters the inner product $\\langle f, g\\rangle_w = \\int f\\,\\bar g\\,w\\,dx$' },
    { tex: 'c_n', text: 'the generalized Fourier coefficient: the projection of $f$ onto $\\phi_n$ in the weighted inner product' },
    { tex: 'p(x),\\ q(x)', text: 'the coefficients of the operator $-(pu\')\' + qu$, with $p > 0$' },
  ],
  why: t`Completeness is the licence for every “expand in modes” step in physics — normal modes of a structure, spherical harmonics of a gravitational field, the quasinormal-mode question of whether a ringdown is a sum of modes (it is not, quite, because that problem is not self-adjoint).`,
  visual: {
    type: 'graph',
    title: 'The Rayleigh quotient can only overestimate',
    lead: t`For $-u'' = \lambda u$ on $[0, 1]$ with $u(0) = u(1) = 0$, the lowest eigenvalue is $\lambda_1 = \pi^2 \approx ${r4(PI2)}$, with $\phi_1 = \sin\pi x$ (dashed). The blue trial function $u = \big(x(1 - x)\big)^s$ obeys the boundary conditions for every $s$; the readout is its Rayleigh quotient $\int u'^2/\int u^2$.`,
    tasks: [
      's = 1, the parabola: R = 10, just 1.3% above π².',
      `Hunt for the smallest R: near s = 1.11 it reaches about ${r4(9.898980392)} — still above π².`,
      'Push s toward 0.6 or up to 3: the trial looks less like a sine and R climbs fast.',
    ],
    params: {
      x: [0, 1], y: [-0.05, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge',
      sliders: [{ key: 's', label: 'Trial exponent $s$', min: 0.6, max: 3, step: 0.01, value: 2, unit: '', explain: 'The trial $u = (x(1 - x))^s$, scaled to peak 1.' }],
      curves: [{ fn: 'sin(pi*x)', color: 'ink3', width: 1.5, dash: [6, 4] }, { fn: '(4*x*(1 - x))^s', color: 'accent', width: 2.3 }],
      readouts: [
        { label: '$R[u]$', expr: 's^2*(gamma(2s - 1)^2/gamma(4s - 2) - 4*gamma(2s)^2/gamma(4s))/(gamma(2s + 1)^2/gamma(4s + 2))', digits: 5 },
        { label: '$\\lambda_1 = \\pi^2$', expr: 'pi^2', digits: 5 },
      ],
    },
    caption: 'R[u] in closed form through Beta functions, R = s²[B(2s−1, 2s−1) − 4B(2s, 2s)] / B(2s+1, 2s+1), valid for s > ½.',
  },
  example: {
    prompt: t`Expand $f(x) = 1$ on $[0, 1]$ in the Robin eigenfunctions $\phi_n = \sin\mu_nx$ of [the previous lesson](#/lesson/st-e.E5.1) ($u(0) = 0$, $u'(1) + 2u(1) = 0$, so $\mu\cos\mu + 2\sin\mu = 0$, $w = 1$). Check completeness through Parseval.`,
    visual: { type: 'graph', params: { x: [0, 1], y: [-0.1, 1.35], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: '1', color: 'ink3', width: 1.5, dash: [6, 4] }, { fn: SUM2, color: 'violet', width: 1.6, label: '2 terms', labelAt: 0.82, labelDy: 16 }, { fn: SUM8, color: 'accent', width: 2.3, label: '8 terms', labelAt: 0.5, labelDy: -14 }] }, caption: 'f = 1 (dashed) and its Robin expansions with 2 and 8 terms. Every φₙ vanishes at x = 0, so the sums must dive there: mean-square, not uniform, convergence.' },
    steps: [
      { label: 'Coefficients', text: t`$c_n = \dfrac{\int_0^1\sin\mu_nx\,dx}{\int_0^1\sin^2\mu_nx\,dx} = \dfrac{(1 - \cos\mu_n)/\mu_n}{\frac12 - \frac{\sin2\mu_n}{4\mu_n}}$ — orthogonality makes each one a single quotient.` },
      { label: 'Numbers', text: t`$\mu_1 = ${r4(MU[0])}$, $\mu_2 = ${r4(MU[1])}$, $\mu_3 = ${r4(MU[2])}$ give $c_1 = ${r4(C[0])}$, $c_2 = ${r4(C[1])}$, $c_3 = ${r4(C[2])}$.` },
      { label: 'Bessel’s sum', text: t`$\sum_{n \le N}c_n^2\int\phi_n^2$ is $${r4(bessel(1))}$ for $N = 1$, $${r4(bessel(10))}$ for $N = 10$ and $${r4(bessel(1000))}$ for $N = 1000$ — always below $\int_0^1 1^2dx = 1$.` },
      { label: 'Parseval', text: t`The deficit after $N$ terms falls roughly like $1/N$ (it is $${r3(1 - bessel(1000))}$ at $N = 1000$ and $${r3(1 - bessel(4000))}$ at $N = 4000$) — consistent with equality in the limit, which is what completeness asserts.` },
      { label: 'Why slowly', text: t`$f = 1$ does not obey $f(0) = 0$, so the series must jump at $x = 0$: coefficients fall like $1/n$, as for a Fourier series with a jump.` },
    ],
    answer: t`$c_n = \dfrac{(1 - \cos\mu_n)/\mu_n}{\frac12 - \sin(2\mu_n)/4\mu_n}$, with $c_1 = ${r4(C[0])}$; Bessel’s sums $${r4(bessel(1))}, ${r4(bessel(10))}, ${r4(bessel(1000))}, \dots \to 1$, as Parseval and completeness require.`,
  },
  practice: [
    num({
      id: 'rayleigh-L', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 2, 3, 4]);
        const ans = 10 / (L * L);
        return {
          prompt: t`Estimate the lowest eigenvalue of $-u'' = \lambda u$ on $[0, ${L}]$ (in m, so $\lambda$ is in m⁻²) with $u = 0$ at both ends, using the Rayleigh quotient of the trial $u = x(${L} - x)$.`,
          visual: { type: 'graph', params: { x: [0, L], y: [-0.05, 1.15], aspect: 'wide', xlabel: 'x (m)', ylabel: '', axesAt: 'edge', curves: [{ fn: `sin(pi*x/${L})`, color: 'ink3', width: 1.5, dash: [6, 4] }, { fn: `4*x*(${L} - x)/${L * L}`, color: 'accent', width: 2.2 }] }, caption: 'The trial parabola (scaled to peak 1) against the true mode sin(πx/L), dashed.' },
          answer: ans, units: 'm^-2', tol: { rel: 0.005 },
          errors: [{ value: PI2 / (L * L), feedback: 'That is the exact eigenvalue. The question asks for the Rayleigh-quotient estimate from the parabola.' }, { value: 10, feedback: t`Scale with the length: $R \propto 1/L^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$R = \dfrac{\int_0^L u'^2dx}{\int_0^L u^2dx}$ with $u' = L - 2x$.`, t`$\int_0^L(L - 2x)^2dx = \frac{L^3}{3}$ and $\int_0^Lx^2(L - x)^2dx = \frac{L^5}{30}$.`],
          teach: 'Any trial function obeying the boundary conditions gives an upper bound on the lowest eigenvalue.',
          explain: t`$R = \dfrac{L^3/3}{L^5/30} = \dfrac{10}{L^2} = ${r4(ans)}$ m⁻², against the exact $\pi^2/L^2 = ${r4(PI2 / (L * L))}$ m⁻²: 1.3% high, and high it must be.`,
        };
      },
    }),
    mcq({
      id: 'below', difficulty: 2,
      prompt: t`For $-u'' = \lambda u$ on $[0, 1]$ with $u(0) = u(1) = 0$, a classmate reports a trial function with Rayleigh quotient $9.70$. What follows?`,
      visual: { type: 'graph', params: { x: [0, 3.2], y: [8.8, 12.4], aspect: 'wide', xlabel: 'trial exponent s', ylabel: 'R', axesAt: 'edge', curves: [{ fn: 'x^2*(gamma(2x - 1)^2/gamma(4x - 2) - 4*gamma(2x)^2/gamma(4x))/(gamma(2x + 1)^2/gamma(4x + 2))', color: 'accent', width: 2.2, domain: [0.62, 3.2] }], hlines: [{ y: PI2, label: 'π²', color: 'gold' }, { y: 9.7, label: '9.70?', color: 'bad' }] }, caption: t`$R$ for the trial family $\big(x(1 - x)\big)^s$: it never dips below $\pi^2$ (gold).` },
      choices: ['There is a mistake: either the trial violates a boundary condition or the integrals are wrong, because R[u] ≥ λ₁ = π² ≈ 9.87', 'π² is not the lowest eigenvalue after all', 'The trial function is a better eigenfunction than sin πx', 'Nothing: Rayleigh quotients can fall either side of λ₁'],
      answer: 0,
      why: {
        1: 'sin πx with eigenvalue π² is exact and is the lowest: λₙ = n²π².',
        2: 'sin πx is the exact eigenfunction, and its quotient is exactly π² — nothing can do better.',
        3: 'The minimum principle says R[u] ≥ λ₁ for every admissible trial, with equality only for the eigenfunction.',
      },
      hints: ['Expand the trial in eigenfunctions: R = Σλₙ|cₙ|²/Σ|cₙ|². What is the smallest such weighted average can be?'],
      teach: 'The Rayleigh quotient is a weighted average of eigenvalues, so it can never fall below λ₁.',
      explain: t`Writing $u = \sum c_n\phi_n$ (completeness), $R[u] = \dfrac{\sum\lambda_n|c_n|^2}{\sum|c_n|^2} \ge \lambda_1$. A value of 9.70 < π² means the trial does not satisfy the conditions (a trial that is not zero at an end can do “better” illegally) or there is an arithmetic slip.`,
    }),
    num({
      id: 'weighted-coef', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 3, 5]);
        const ans = 4 / (n * PI);
        return {
          prompt: t`The eigenfunctions $\phi_n = e^{-x}\sin nx$ of $u'' + 2u' + \lambda u = 0$, $u(0) = u(\pi) = 0$, are orthogonal with weight $w = e^{2x}$. Expand $f(x) = e^{-x}$ in them: what is $c_{${n}}$?`,
          visual: { type: 'graph', params: { x: [0, 3.1416], y: [-0.15, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x)', color: 'ink3', width: 1.5, dash: [6, 4] }, { fn: 'e^(-x)*(4/pi)*(sin(x) + sin(3x)/3 + sin(5x)/5 + sin(7x)/7)', color: 'accent', width: 2.2 }] }, caption: '$e^{-x}$ (dashed) and its expansion with four terms.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 / (n * PI), feedback: t`Divide by $\int_0^\pi\phi_n^2w\,dx = \int_0^\pi\sin^2nx\,dx = \pi/2$, not $\pi$.` }],
          hints: [t`$c_n = \dfrac{\int_0^\pi e^{-x}\,e^{-x}\sin nx\,e^{2x}dx}{\int_0^\pi e^{-2x}\sin^2nx\,e^{2x}dx}$ — the exponentials cancel.`, t`$= \dfrac{\int_0^\pi\sin nx\,dx}{\pi/2} = \dfrac{2(1 - \cos n\pi)}{n\pi}$.`],
          teach: 'With the right weight, generalized Fourier coefficients are single projections, just as for sines.',
          explain: t`$c_n = \dfrac{(1 - (-1)^n)/n}{\pi/2}$: $\dfrac{4}{n\pi}$ for odd $n$, so $c_{${n}} = ${r4(ans)}$. The expansion is $e^{-x}$ times the square wave’s sine series — the weight undoes the $e^{-x}$ exactly.`,
        };
      },
    }),
    mcq({
      id: 'complete-means', difficulty: 2,
      prompt: t`A set of orthogonal eigenfunctions $\{\phi_n\}$ is **complete**. Which statement says exactly that?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [1, 2, 3].map((n, i) => ({ fn: `sin(${n}*pi*x)`, color: ['accent', 'warn', 'violet'][i], width: 1.8 })) }, caption: 'The first three of an orthogonal family.' },
      choices: ['The only function orthogonal to every φₙ is zero — equivalently, Parseval’s identity holds for every finite-energy f', 'The φₙ are orthogonal to each other', 'Every f equals its expansion at every point', 'A finite number of φₙ suffices for any f'],
      answer: 0,
      why: {
        1: 'Orthogonality is a separate property; the cosines alone on (−π, π) are orthogonal and incomplete.',
        2: 'Completeness guarantees mean-square convergence; pointwise convergence can fail (jumps, Gibbs).',
        3: 'Infinitely many are needed in general; that is why it is a series.',
      },
      hints: ['If some nonzero g were orthogonal to all φₙ, what would its expansion be?', 'Bessel’s inequality becomes Parseval’s equality exactly when nothing is missing.'],
      teach: 'Complete means nothing is missing: no nonzero function is orthogonal to the whole set, and Parseval holds.',
      explain: t`If a nonzero $g$ were orthogonal to every $\phi_n$, all its coefficients would vanish and its expansion would be 0 ≠ $g$. Completeness rules that out; equivalently $\lVert f - S_Nf\rVert_w \to 0$ and Parseval holds for every $f$ with finite weighted energy.`,
    }),
    code({
      id: 'fd-sl', difficulty: 3,
      prompt: t`Solve a Sturm–Liouville problem numerically: $-u'' = \lambda(1 + x)u$ on $[0, 1]$, $u(0) = u(1) = 0$. On $N - 1$ interior points $x_j = jh$ ($h = 1/N$) the second difference gives $A\mathbf u = \lambda W\mathbf u$ with $A$ tridiagonal ($2/h^2$ on the diagonal, $-1/h^2$ beside it) and $W = \operatorname{diag}(1 + x_j)$. With $D = W^{-1/2}$, the eigenvalues are those of the **symmetric** matrix $DAD$.

Write \`sl_eigs(N)\` returning the sorted eigenvalues (use \`np.linalg.eigvalsh\`), and \`rayleigh_parabola()\` returning the Rayleigh quotient $\int_0^1u'^2/\int_0^1(1 + x)u^2$ for $u = x(1 - x)$.`,
      starter: t`import numpy as np

def sl_eigs(N):
    h = 1.0 / N
    x = np.arange(1, N) * h
    # build A (tridiagonal) and D = diag(1/sqrt(1 + x)), then eigvalsh(D A D)
    pass

def rayleigh_parabola():
    # ∫ u'² = 1/3 for u = x(1 − x); work out ∫ (1 + x) u² by hand or numerically
    pass

print("lowest two eigenvalues, N = 400:", sl_eigs(400)[:2])
print("Rayleigh quotient of x(1 − x):  ", rayleigh_parabola())
`,
      answer: t`import numpy as np

def sl_eigs(N):
    h = 1.0 / N
    x = np.arange(1, N) * h
    A = (np.diag(2 * np.ones(N - 1)) - np.diag(np.ones(N - 2), 1) - np.diag(np.ones(N - 2), -1)) / h**2
    d = 1 / np.sqrt(1 + x)
    return np.linalg.eigvalsh(A * d[:, None] * d[None, :])

def rayleigh_parabola():
    return (1/3) / (1/30 + 1/60)

print("lowest two eigenvalues, N = 400:", sl_eigs(400)[:2])
print("Rayleigh quotient of x(1 − x):  ", rayleigh_parabola())
`,
      tests: [
        { name: 'λ₁ ≈ 6.548 (N = 400)', code: 'abs(sl_eigs(400)[0] - 6.5484) < 2e-3' },
        { name: 'λ₂ ≈ 26.46', code: 'abs(sl_eigs(400)[1] - 26.464) < 0.01' },
        { name: 'the weight lowers λ₁ below the unweighted π²', code: 'sl_eigs(200)[0] < np.pi**2' },
        { name: 'Rayleigh quotient of x(1 − x) is 20/3, above λ₁', code: 'abs(rayleigh_parabola() - 20/3) < 1e-6 and rayleigh_parabola() > sl_eigs(400)[0]' },
        { name: 'eigenvalues come out sorted and real', code: 'np.all(np.diff(sl_eigs(50)) > 0)' },
      ],
      hints: ['`A * d[:, None] * d[None, :]` multiplies row i by dᵢ and column j by dⱼ: that is D A D.', t`$\int_0^1(1 + x)x^2(1 - x)^2dx = \frac1{30} + \frac1{60}$.`],
      teach: 'A weighted Sturm–Liouville problem discretizes to a symmetric generalized eigenproblem; symmetrizing with $W^{-1/2}$ keeps the eigenvalues real.',
      explain: t`$\lambda_1 \approx 6.548$, $\lambda_2 \approx 26.46$: the extra mass density $1 + x$ lowers them below $\pi^2$ and $4\pi^2$. The parabola’s quotient $20/3 \approx 6.667$ is 1.8% above $\lambda_1$, as the minimum principle demands. Symmetrizing reflects self-adjointness: the discrete operator is symmetric in the weighted inner product.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([50, 100, 200]), c0 = r.pick([20, 40, 60]);
        const R = (2 / 3) * PI2 * c0 * c0 / (L * L), ans = Math.sqrt(R) / (2 * PI);
        return {
          prompt: t`A tether of length $L = ${L}$ m under tension $T$ has a linear density that grows along it, $\rho(x) = \rho_0(1 + x/L)$, so its transverse modes solve $-Tu'' = \omega^2\rho u$ with $u = 0$ at both ends. With $c_0 = \sqrt{T/\rho_0} = ${c0}$ m/s, use the trial $u = \sin(\pi x/L)$ in the Rayleigh quotient $\omega^2 \le \dfrac{\int Tu'^2}{\int\rho u^2}$ to bound the fundamental frequency, in Hz. ($\int_0^L(1 + x/L)\sin^2\frac{\pi x}{L}dx = \frac{3L}{4}$.)`,
          visual: { type: 'graph', params: { x: [0, L], y: [-0.1, 2.2], aspect: 'wide', xlabel: 'x (m)', ylabel: '', axesAt: 'edge', curves: [{ fn: `1 + x/${L}`, color: 'warn', width: 1.8, label: 'ρ / ρ₀', labelAt: L * 0.8, labelDy: -10 }, { fn: `sin(pi*x/${L})`, color: 'accent', width: 2.2, label: 'trial', labelAt: L * 0.3, labelDy: -10 }] }, caption: 'The density profile and the uniform-tether mode used as the trial.' },
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: c0 / (2 * L), feedback: 'That is the uniform tether’s fundamental. The extra mass lowers ω²: divide by 3L/4, not L/2.' }, { value: R, feedback: t`That is the bound on $\omega^2$ in s⁻². Take the square root and divide by $2\pi$.` }],
          hints: [t`$\int_0^LT u'^2dx = T\frac{\pi^2}{L^2}\cdot\frac L2$.`, t`$\omega^2 \le \dfrac{T\pi^2/(2L)}{\rho_0\cdot3L/4} = \dfrac23\dfrac{\pi^2c_0^2}{L^2}$; then $f = \omega/2\pi$.`],
          teach: 'A good guess at the mode shape in the Rayleigh quotient gives a tight upper bound on the fundamental frequency.',
          explain: t`$\omega^2 \le \frac23\cdot\frac{\pi^2\times${c0}^2}{${L}^2} = ${r4(R)}$ s⁻², so $f_1 \le ${r4(ans)}$ Hz — about $\sqrt{2/3}$ of the uniform tether’s $${r4(c0 / (2 * L))}$ Hz. The true value is slightly lower; a better trial would tighten it.`,
        };
      },
    }),
    mcq({
      id: 'cp-weyl', difficulty: 3,
      prompt: t`For a regular Sturm–Liouville problem the eigenvalues grow like $\lambda_n \approx \Big(\dfrac{n\pi}{\int_a^b\sqrt{w/p}\,dx}\Big)^2$ for large $n$. For a string with tension $T$ ($p = T$) and density $\rho(x)$ ($w = \rho$), what does the denominator measure?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'sin(30*(x + 0.5*x^2))', color: 'accent', width: 1.4, samples: 1500 }] }, caption: 'A high mode on a string that gets heavier toward x = 1: its wavelength shortens where waves are slower.' },
      choices: ['the time a wave takes to travel the string, ∫ dx/c with c = √(T/ρ)', 'the string’s mass', 'its length', 'its average tension'],
      answer: 0,
      why: {
        1: 'The mass is ∫ρ dx, not ∫√(ρ/T) dx.',
        2: 'Only for a uniform string with c = 1 would the length appear alone.',
        3: 'Tension is p; it appears inside the square root, divided into ρ.',
      },
      hints: [t`$\sqrt{w/p} = \sqrt{\rho/T} = 1/c$, the local slowness.`, t`Integrating $dx/c$ adds up the time spent crossing each piece of string.`],
      teach: 'High eigenvalues depend only on the wave travel time across the interval: ωₙ ≈ nπ / (travel time).',
      explain: t`$\int\sqrt{\rho/T}\,dx = \int dx/c$, the one-way travel time $\tau$. So $\omega_n \approx n\pi/\tau$: high modes do not care about the details of $\rho(x)$, only about how long a wave takes to cross — the same idea as WKB, and as counting modes in a cavity (Weyl’s law).`,
    }),
  ],
  sources: [SRC.boas, SRC.rhb, SRC.stein],
});
