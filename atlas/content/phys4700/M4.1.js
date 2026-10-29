// Hilbert space (Griffiths & Schroeter §3.1; Byron & Fuller ch. 5). The
// space L²(a, b) of square-integrable functions with ⟨f|g⟩ = ∫ f*g dx; which
// functions belong (x^−p on (0, 1) needs p < ½); the Schwarz inequality and
// the angle between functions; Gram–Schmidt (Legendre); orthonormal bases,
// completeness and Parseval's ‖f‖² = Σ|cₙ|²; convergence in the mean, not
// pointwise (Gibbs). phys4700.M0.1 met inner products of vectors and a first
// function inner product; this lesson makes the function space the stage of
// quantum mechanics. Coefficients as in phys4700.M3.2.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { boxPic, r6 } from './_wells.js';

const t = String.raw;
const PI = Math.PI;
const D = 180 / PI;
const SHAPES = {
  parabola: { name: t`the parabola $\sqrt{30}\,x(1 - x)$`, fn: 'sqrt(30)*x*(1 - x)', c: (n) => (n % 2 ? (8 * Math.sqrt(15)) / (n * PI) ** 3 : 0) },
  tent: { name: t`the tent $\sqrt{12}\,\min(x, 1 - x)$`, fn: 'sqrt(12)*min(x, 1 - x)', c: (n) => (4 * Math.sqrt(6) * Math.sin((n * PI) / 2)) / (n * PI) ** 2 },
  half: { name: t`the half box ($\sqrt2$ on the left half, 0 on the right)`, fn: 'sqrt(2)*step(0.5 - x)', c: (n) => (2 * (1 - Math.cos((n * PI) / 2))) / (n * PI) },
};
const clean = (v) => (Math.abs(v) < 1e-12 ? 0 : v);
for (const k of Object.keys(SHAPES)) { const c = SHAPES[k].c; SHAPES[k].c = (n) => clean(c(n)); }
const captured = (s, N) => { let S = 0; for (let n = 1; n <= N; n++) S += SHAPES[s].c(n) ** 2; return S; };

export default lesson({
  id: 'phys4700.M4.1',
  title: 'Hilbert space',
  minutes: 15, difficulty: 3,
  intro: t`Wave functions are vectors. They add, they can be multiplied by complex numbers, and two of them have an **inner product**

$$\langle f|g\rangle = \int_a^b f(x)^*\,g(x)\,dx$$

which gives every function a length $\|f\| = \sqrt{\langle f|f\rangle}$ and every pair an angle. The functions of finite length — the **square-integrable** ones — form **Hilbert space**, $L^2(a, b)$, the stage on which quantum mechanics plays. It is infinite-dimensional, but the geometry of [complex vector spaces](#/lesson/phys4700.M0.1) carries over: the Schwarz inequality, orthonormal bases, and components $c_n = \langle e_n|f\rangle$ with $\|f\|^2 = \sum|c_n|^2$. One thing is new: a series of basis functions converges **in the mean** — the length of the error shrinks to zero — which is not the same as converging at every point.`,
  symbols: [
    { tex: '\\langle f|g\\rangle', text: t`the inner product of two functions: a complex number, $\langle g|f\rangle = \langle f|g\rangle^*$` },
    { tex: 'f(x)^*', text: 'the complex conjugate of f, which makes ⟨f|f⟩ real and non-negative' },
    { tex: '[a, b]', text: t`the interval the functions live on (possibly all of $-\infty < x < \infty$)` },
    { tex: 'L^2(a, b)', text: t`the space of functions with $\int_a^b|f|^2dx$ finite: every normalizable wave function lives here` },
    { tex: 'c_n = \\langle e_n|f\\rangle', text: t`the $n$-th component of $f$ along an orthonormal basis $\{e_n\}$ — for a box, Fourier’s trick` },
  ],
  why: 'Every statement of the formalism — observables, probabilities, the uncertainty principle, Dirac notation — is a statement of geometry in this space.',
  visual: {
    type: 'fa-series',
    title: 'Three ways to converge',
    lead: t`A function expanded in an orthonormal basis of sines and cosines. Top: the function and its partial sum $S_N$. Middle: three errors against $N$ — the length of the error $\|f - S_N\|$ (blue), the error at one point (gold) and the largest error anywhere (red). Bottom: each basis component’s share of $\|f\|^2$.`,
    tasks: [
      'Square wave: raise N. The blue error, the length of f minus the partial sum, falls steadily to zero — convergence in Hilbert space.',
      'Still on the square wave, watch the red error: the largest error never falls, and beside each jump the partial sum overshoots the gold Gibbs lines’ level, about 9% of the jump, however large N gets. Pointwise and in-the-mean convergence are different things.',
      'Switch to the smooth function: all three errors plunge together, and nearly all of ‖f‖² sits in the first few components.',
    ],
    params: { wave: 'square', waves: ['square', 'triangle', 'smooth'], N: 5, Nmax: 60, panels: ['x', 'err', 'spec'], gibbs: true },
    caption: 'Exact Fourier coefficients on one period, −π to π (Parseval’s theorem gives the blue curve without integrating). The basis here is sines and cosines; any complete orthonormal set behaves the same way.',
  },
  example: {
    prompt: t`(a) Are $x^{-1/4}$ and $x^{-1/2}$ in $L^2(0, 1)$? (b) Find the angle between $f = 1$ and $g = x$ on $[0, 1]$ and check the Schwarz inequality. (c) Expand $f = 1$ on $(0, 1)$ in the box states $e_n = \sqrt2\sin(n\pi x)$ and check Parseval’s theorem.`,
    visual: boxPic({ L: 1, y: [-0.3, 1.5], ylabel: 'f and its partial sum', curves: [{ fn: '1', color: 'ink2', dash: [6, 4], label: 'f = 1', labelAt: 0.42, labelDy: -12 }, { sum: '4/(pi*(2*k - 1))*sin((2*k - 1)*pi*x)', k: [1, 6], color: 'gold', width: 2.4, samples: 2000 }], extra: { xlabel: 'x' }, caption: 'f = 1 on (0, 1) and the sum of its first six nonzero box components. At the walls every eᵢ vanishes, so the sum is 0 there for every N.' }),
    steps: [
      { label: 'Which functions belong', text: t`$\int_0^1(x^{-1/4})^2dx = \int_0^1x^{-1/2}dx = 2$: finite, so $x^{-1/4}$ is in $L^2$ even though it is unbounded at 0. $\int_0^1(x^{-1/2})^2dx = \int_0^1\tfrac{dx}{x}$ diverges: $x^{-1/2}$ is not. In general $x^{-p}$ belongs exactly when $p < \tfrac12$.` },
      { label: 'Lengths and overlap', text: t`$\|f\|^2 = \int_0^1 1\,dx = 1$, $\|g\|^2 = \int_0^1x^2dx = \tfrac13$, $\langle f|g\rangle = \int_0^1x\,dx = \tfrac12$.` },
      { label: 'Schwarz and the angle', text: t`$|\langle f|g\rangle|^2 = \tfrac14 \le \|f\|^2\|g\|^2 = \tfrac13$ ✓. The angle: $\cos\theta = \dfrac{1/2}{1\cdot\sqrt{1/3}} = \tfrac{\sqrt3}{2}$, so $\theta = 30^\circ$. Two functions that look nothing alike are fairly close in Hilbert space.` },
      { label: 'Components', text: t`$c_n = \langle e_n|1\rangle = \sqrt2\int_0^1\sin(n\pi x)\,dx = \dfrac{\sqrt2\,(1 - \cos n\pi)}{n\pi}$: $\dfrac{2\sqrt2}{n\pi}$ for odd $n$, $0$ for even.` },
      { label: 'Parseval', text: t`$\sum|c_n|^2 = \dfrac{8}{\pi^2}\Big(1 + \tfrac19 + \tfrac1{25} + \dots\Big) = \dfrac{8}{\pi^2}\cdot\dfrac{\pi^2}{8} = 1 = \|f\|^2$ ✓. The basis is complete: no part of $f$ is missed.` },
      { label: 'In the mean, not everywhere', text: t`Every partial sum is 0 at $x = 0$, where $f = 1$: pointwise, the series fails at the walls. But the length of the error, $\|f - S_N\|^2 = 1 - \sum_{n\le N}|c_n|^2$, goes to 0. In $L^2$ two functions that differ only at isolated points are the same vector.` },
    ],
    answer: t`(a) $x^{-1/4}$ yes ($\|f\|^2 = 2$), $x^{-1/2}$ no. (b) $\theta = 30^\circ$; $\tfrac14 \le \tfrac13$. (c) $c_n = 2\sqrt2/n\pi$ for odd $n$, and $\sum|c_n|^2 = 1 = \|f\|^2$.`,
  },
  practice: [
    multi({
      id: 'in-L2', difficulty: 2,
      prompt: t`Which of these functions are in Hilbert space on the interval given? Select all that are.`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 12], aspect: 'wide', xlabel: 'x', ylabel: '|f|²', xticks: 5, yticks: 4, axesAt: 'edge', curves: [{ fn: 'x^(-2/3)', color: 'accent', width: 2.4, domain: [0.002, 1], label: 'square of x to the −1/3', labelAt: 0.3, labelDy: 16 }, { fn: '1/x', color: 'warn', width: 2.4, dash: [6, 4], domain: [0.08, 1], label: 'square of x to the −1/2', labelAt: 0.5, labelDy: -12 }], shade: [{ fn: 'x^(-2/3)', from: 0.002, to: 1, color: 'accent', alpha: 0.15 }] }, caption: 'Two squared functions on (0, 1). Both blow up at 0; only one has a finite area.' },
      choices: [t`$e^{-x^2}$ on $-\infty < x < \infty$`, t`$x^{-1/3}$ on $(0, 1)$`, t`$1/\sqrt{1 + x^2}$ on $-\infty < x < \infty$`, t`$\sin x$ on $-\infty < x < \infty$`, t`$x^{-1/2}$ on $(0, 1)$`, t`$e^{ikx}$ on $-\infty < x < \infty$`],
      answer: [0, 1, 2],
      why: {
        3: t`$\int\sin^2x\,dx$ over the whole line grows without limit: a wave that never dies away has infinite length.`,
        4: t`$\int_0^1 dx/x$ diverges logarithmically at 0.`,
        5: t`$|e^{ikx}|^2 = 1$ everywhere: the plane waves of [the free particle](#/lesson/phys4700.M3.4) are not in Hilbert space.`,
      },
      hints: ['Square each function and ask whether the area under it is finite.', t`$\int\tfrac{dx}{1 + x^2} = \pi$ over the whole line; $\int_0^1x^{-2/3}dx = 3$.`],
      teach: 'A function is in Hilbert space when its squared modulus has a finite integral — it may even be unbounded.',
      explain: t`$e^{-x^2}$: $\sqrt{\pi/2}$. $x^{-1/3}$: $\int_0^1x^{-2/3} = 3$ (unbounded, but square-integrable). $1/\sqrt{1 + x^2}$: $\pi$. The other three have infinite length, so none can be normalized.`,
    }),
    num({
      id: 'normalize-power', difficulty: 2,
      gen(r) {
        const q = r.pick([-0.4, -0.25, 0.5, 1, 2, 3]);
        const ans = Math.sqrt(2 * q + 1);
        return {
          prompt: t`Find the positive constant $A$ that makes $f(x) = A\,x^{${q}}$ a unit vector in $L^2(0, 1)$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, q < 0 ? 6 : 1.2], aspect: 'wide', xlabel: 'x', ylabel: '|f|² without A', xticks: 5, yticks: 3, axesAt: 'edge', curves: [{ fn: `x^(${2 * q})`, color: 'accent', width: 2.4, domain: [0.001, 1] }], shade: [{ fn: `x^(${2 * q})`, from: 0.001, to: 1, color: 'accent', alpha: 0.18 }] }, caption: t`The squared function $x^{${2 * q}}$. Its area is $\|x^{${q}}\|^2$; $A$ rescales it to 1.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * q + 1, feedback: t`$A^2 = 2q + 1$; take the square root.` }, { value: Math.sqrt(q + 1), feedback: t`Square the function first: $\int_0^1x^{2q}dx = 1/(2q + 1)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\|x^q\|^2 = \int_0^1x^{2q}dx = \dfrac{1}{2q + 1}$ (finite for $q > -\tfrac12$).`, t`$A^2/(2q + 1) = 1$.`],
          teach: t`Normalizing means dividing by the length: $A = 1/\|f\|$.`,
          explain: t`$\|x^{${q}}\|^2 = 1/${fmt(2 * q + 1, 3)}$, so $A = \sqrt{${fmt(2 * q + 1, 3)}} = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'angle', difficulty: 2,
      gen(r) {
        const [m, n] = r.pick([[0, 1], [0, 2], [1, 2], [1, 3], [0, 3], [2, 3]]);
        const c = (1 / (m + n + 1)) / Math.sqrt(1 / ((2 * m + 1) * (2 * n + 1)));
        const ans = Math.acos(c) * D;
        return {
          prompt: t`What is the angle, in degrees, between the functions $x^{${m}}$ and $x^{${n}}$ in $L^2(0, 1)$, defined by $\cos\theta = \dfrac{\langle f|g\rangle}{\|f\|\,\|g\|}$?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 5, yticks: 2, axesAt: 'edge', curves: [{ fn: m === 0 ? '1' : `x^${m}`, color: 'accent', width: 2.4, label: m === 0 ? '1' : `x${'⁰¹²³'[m]}`, labelAt: 0.15, labelDy: -12 }, { fn: `x^${n}`, color: 'warn', width: 2.4, label: `x${'⁰¹²³'[n]}`, labelAt: 0.8, labelDy: 14 }] }, caption: 'The two functions. Their angle measures how much of one lies along the other.' },
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: Math.acos(1 / (m + n + 1)) * D, feedback: 'Divide the inner product by both lengths before taking the arccosine.' }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`$\langle x^m|x^n\rangle = \int_0^1x^{m+n}dx = \dfrac{1}{m + n + 1}$, and $\|x^m\|^2 = \dfrac{1}{2m + 1}$.`, t`$\cos\theta = \dfrac{1/${m + n + 1}}{\sqrt{1/${2 * m + 1}}\sqrt{1/${2 * n + 1}}} = ${fmt(c, 4)}$.`],
          teach: 'The inner product gives functions angles, exactly as for arrows: cos θ = ⟨f|g⟩/(‖f‖‖g‖).',
          explain: t`$\cos\theta = \dfrac{\sqrt{${(2 * m + 1) * (2 * n + 1)}}}{${m + n + 1}} = ${fmt(c, 4)}$, so $\theta = ${fmt(ans, 3)}^\circ$. Powers of $x$ point in nearly the same direction — which is why they make a poor basis, and why the orthogonal polynomials are used instead.`,
        };
      },
    }),
    expr({
      id: 'gram', difficulty: 3,
      prompt: t`On $[-1, 1]$, the functions $1$ and $x$ are orthogonal. Gram–Schmidt the next power: find the constant $c$ that makes $x^2 - c$ orthogonal to $1$ (it is automatically orthogonal to $x$), and enter $x^2 - c$.`,
      visual: { type: 'graph', params: { x: [-1, 1], y: [-0.5, 1.1], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 4, yticks: 3, axesAt: 'edge', curves: [{ fn: '1', color: 'ink3', width: 2, label: '1', labelAt: 0.85, labelDy: -10 }, { fn: 'x^2', color: 'accent', width: 2.4, label: 'x²', labelAt: -0.85, labelDy: -10 }] }, caption: 'x² has a positive overlap with 1 (it is never negative). Subtract the right constant and the areas above and below the axis cancel.' },
      answer: 'x^2 - 1/3', answerTeX: t`x^2 - \tfrac13`,
      vars: { x: [-1, 1] },
      errors: [{ answer: 'x^2 - 1/2', feedback: t`$\langle 1|x^2\rangle = \int_{-1}^1x^2dx = \tfrac23$ and $\langle 1|1\rangle = 2$: $c = \tfrac{2/3}{2} = \tfrac13$.` }, { answer: 'x^2 - 2/3', feedback: t`Divide by $\langle 1|1\rangle = 2$: the projection of $x^2$ on $1$ is $\tfrac{\langle1|x^2\rangle}{\langle1|1\rangle}\cdot1$.` }],
      hints: [t`Require $\int_{-1}^1(x^2 - c)\,dx = 0$.`, t`$\tfrac23 - 2c = 0$.`],
      teach: 'Gram–Schmidt subtracts from each new function its projections on the ones before, leaving an orthogonal set.',
      explain: t`$\int_{-1}^1(x^2 - c)\,dx = \tfrac23 - 2c = 0$ gives $c = \tfrac13$. Scaled to equal 1 at $x = 1$, $\tfrac32(x^2 - \tfrac13) = \tfrac12(3x^2 - 1)$ is the Legendre polynomial $P_2$ — the same function that shapes $d$ orbitals and the quadrupole field.`,
    }),
    num({
      id: 'parseval-shape', difficulty: 2,
      gen(r) {
        const s = r.pick(['parabola', 'tent', 'half']), N = r.pick([1, 3]);
        const ans = captured(s, N), S = SHAPES[s];
        return {
          prompt: t`In the box basis $e_n = \sqrt2\sin(n\pi x)$ on $(0, 1)$, ${S.name} has components $c_1 = ${fmt(S.c(1), 5)}$, $c_2 = ${fmt(S.c(2), 5)}$, $c_3 = ${fmt(S.c(3), 5)}$. It has length 1. What fraction of $\|f\|^2$ lies in the components with $n \le ${N}$?`,
          visual: boxPic({ L: 1, y: [-0.3, 1.9], ylabel: 'f and its partial sum', curves: [{ fn: S.fn, color: 'ink2', dash: [6, 4], label: 'f', labelAt: 0.1, labelDy: -10, samples: 2000 }, { fn: Array.from({ length: N }, (_, j) => `(${r6(S.c(j + 1))})*sqrt(2)*sin(${j + 1}*pi*x)`).join(' + '), color: 'gold', width: 2.4 }], extra: { xlabel: 'x' }, caption: t`The function (dashed) and its components up to $n = ${N}$ (gold).` }),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: Math.abs(S.c(1)) + (N === 3 ? Math.abs(S.c(3)) : 0), feedback: t`Add the squares $|c_n|^2$, not the components: Parseval’s theorem is Pythagoras.` }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`Parseval: $\|f\|^2 = \sum|c_n|^2$, so the share in $n \le N$ is $\sum_{n\le N}|c_n|^2$.`, t`Square each listed component and add.`],
          teach: 'In an orthonormal basis, the squared length is the sum of the squared components (Parseval), so each component’s share is |cₙ|².',
          explain: t`$\sum_{n\le${N}}|c_n|^2 = ${fmt(ans, 5)}$: the remaining $${fmt(100 * (1 - ans), 2)}$% of $\|f\|^2$ is spread over all the higher components. That share is exactly the probability that an energy measurement finds the particle above level ${N}.`,
        };
      },
    }),
    mcq({
      id: 'pointwise', difficulty: 3, kind: 'error',
      prompt: t`A student expands $f = 1$ on $(0, 1)$ in $e_n = \sqrt2\sin(n\pi x)$ and notices that every partial sum is 0 at $x = 0$ and at $x = 1$. They conclude: “the basis cannot represent $f$, so it is not complete.” What is wrong?`,
      visual: { type: 'fa-series', params: { wave: 'square', N: 15, panels: ['x'], controls: false, readouts: [], probe: false, gibbs: true }, caption: 'The same expansion, seen as a square wave on −π to π: the partial sum (blue) misses the jumps by a finite amount however many terms are used.' },
      choices: [
        t`Completeness means $\|f - S_N\| \to 0$, which holds: $\sum|c_n|^2 = 1 = \|f\|^2$. Disagreement at isolated points has zero length`,
        'Nothing: a complete basis must reproduce f at every point',
        t`The basis needs cosines too; sines alone are never complete on $(0, 1)$`,
        'The partial sums are wrong; correctly computed ones equal 1 at x = 0',
      ],
      answer: 0,
      why: {
        1: t`Pointwise agreement is too strong a demand for $L^2$: even the error at the Gibbs overshoot does not go to zero, yet the length of the error does.`,
        2: t`On $(0, 1)$ the sines alone are complete (they are the odd extension’s Fourier series); on $(-1, 1)$ you would need cosines too.`,
        3: t`Every $\sin(n\pi\cdot0) = 0$: no finite sum can be 1 there.`,
      },
      hints: ['Compute Σ|cₙ|² for this f and compare with ‖f‖².', 'In what sense does a series “converge” in Hilbert space?'],
      teach: 'Completeness in Hilbert space means the error’s length goes to zero, not that the series matches at every point.',
      explain: t`$\|f - S_N\|^2 = 1 - \sum_{n\le N}|c_n|^2 \to 0$. Functions that differ on a set of zero length are the same element of $L^2$; physically, no measurement can tell them apart, because every probability is an integral.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-angle-ground', difficulty: 3,
      gen(r) {
        const s = r.pick(['parabola', 'tent', 'half']), S = SHAPES[s];
        const ans = Math.acos(Math.abs(S.c(1))) * D;
        return {
          prompt: t`In Hilbert space, what is the angle, in degrees, between ${S.name} (length 1) and the ground state $e_1 = \sqrt2\sin(\pi x)$ of a unit box? Its component along $e_1$ is $c_1 = ${fmt(S.c(1), 6)}$.`,
          visual: boxPic({ L: 1, y: [-0.3, 1.9], ylabel: 'f and e₁', curves: [{ fn: S.fn, color: 'gold', width: 2.6, label: 'f', labelAt: 0.12, labelDy: -10, samples: 2000 }, { n: 1, color: 'accent', dash: [6, 4], label: 'e₁', labelAt: 0.8, labelDy: 16 }], extra: { xlabel: 'x' }, caption: 'The two unit vectors, drawn as functions.' }),
          answer: ans, units: 'deg', tol: { rel: 0.01, abs: 0.05 },
          errors: [{ value: Math.acos(S.c(1) ** 2) * D, feedback: t`$\cos\theta = \langle e_1|f\rangle$ itself, not its square (the square is the probability).` }].filter((e) => Math.abs(e.value - ans) > 0.1),
          hints: [t`Both have length 1, so $\cos\theta = \langle e_1|f\rangle = c_1$.`, t`$\theta = \arccos(${fmt(S.c(1), 6)})$.`],
          teach: 'For unit vectors, the component along a basis vector is the cosine of the angle to it, and its square is the probability.',
          explain: t`$\theta = \arccos ${fmt(S.c(1), 5)} = ${fmt(ans, 3)}^\circ$. $P(E_1) = \cos^2\theta = ${fmt(S.c(1) ** 2, 4)}$: the closer the state is to $e_1$ in angle, the likelier the ground-state energy.`,
        };
      },
    }),
    mcq({
      id: 'cp-basis', difficulty: 2,
      prompt: t`Which set is a complete orthonormal basis of $L^2(-1, 1)$?`,
      visual: { type: 'graph', params: { x: [-1, 1], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 4, yticks: 2, axesAt: 'edge', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2 }, { fn: 'cos(pi*x)', color: 'warn', width: 2, dash: [6, 4] }, { fn: '0.7', color: 'teal', width: 2 }], legend: [{ label: 'an odd function', color: 'accent' }, { label: 'an even one', color: 'warn', dash: [6, 4] }, { label: 'a constant', color: 'teal' }], legendAt: 'br' }, caption: 'Functions any basis of L²(−1, 1) must be able to build.' },
      choices: [
        t`$\big\{e^{in\pi x}/\sqrt2\big\}$ for all integers $n$`,
        t`$\{\sin(n\pi x)\}$, $n = 1, 2, 3, \dots$`,
        t`$\{\cos(n\pi x)\}$, $n = 1, 2, 3, \dots$`,
        t`$\{1, x, x^2, x^3\}$, normalized`,
      ],
      answer: 0,
      why: {
        1: t`Every $\sin(n\pi x)$ is odd on $(-1, 1)$, so every even function — a constant, $\cos\pi x$ — is orthogonal to all of them and can never be built.`,
        2: 'Without n = 0 the constant function is missing, and the odd functions are missing entirely.',
        3: t`Four functions span only a four-dimensional subspace; $L^2$ is infinite-dimensional. (And they are not orthogonal: $\langle 1|x^2\rangle \neq 0$.)`,
      },
      hints: ['A complete set must leave no nonzero function orthogonal to all its members.', 'Can the set build both odd and even functions?'],
      teach: 'A basis is complete when no nonzero function is orthogonal to all of it; parity is a quick test.',
      explain: t`$\langle e^{im\pi x}/\sqrt2|e^{in\pi x}/\sqrt2\rangle = \tfrac12\int_{-1}^1e^{i(n-m)\pi x}dx = \delta_{mn}$, and the full Fourier series builds any $L^2$ function. The sines alone are complete only on $(0, 1)$.`,
    }),
    num({
      id: 'cp-telemetry', difficulty: 2, transfer: true,
      gen(r) {
        const N = r.pick([1, 3, 5, 7]);
        let S = 0; for (let n = 1; n <= N; n += 2) S += 8 / (n * n * PI * PI);
        const ans = 100 * (1 - S);
        return {
          prompt: t`A spacecraft’s telemetry clock is a square wave switching between $\pm V$. Its Fourier components are $b_n = 4V/n\pi$ for odd $n$, and by Parseval the share of its mean power in harmonic $n$ is $b_n^2/2V^2 = 8/(n\pi)^2$. If the downlink filter passes only harmonics up to $n = ${N}$, what percentage of the power is lost?`,
          visual: { type: 'fa-series', params: { wave: 'square', N, panels: ['x', 'spec'], controls: false, readouts: ['N'], probe: false }, caption: 'The square wave, the filtered signal (harmonics up to N), and each harmonic’s share of the power: kept (blue) and removed (grey).' },
          answer: ans, units: '%', tol: { rel: 0.005, abs: 0.02 },
          errors: [{ value: 100 * S, feedback: 'That is the share that gets through. The question asks for the share lost.' }],
          hints: [t`The total is $\sum_{\text{odd}}8/(n\pi)^2 = 1$ (Parseval).`, t`Lost $= 1 - \tfrac{8}{\pi^2}\big(1${N >= 3 ? ' + \\tfrac19' : ''}${N >= 5 ? ' + \\tfrac1{25}' : ''}${N >= 7 ? ' + \\tfrac1{49}' : ''}\big)$.`],
          teach: 'Parseval’s theorem turns a power budget into a sum of squared components — the same sum that adds probabilities in quantum mechanics.',
          explain: t`Kept: $${fmt(100 * S, 4)}$%, so $${fmt(ans, 3)}$% is lost — power that sat in the sharp edges. The fundamental alone carries $8/\pi^2 = 81.1$%. The arithmetic is identical to adding $|c_n|^2$ over energy levels.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.1 and Appendix A', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Byron & Fuller, Mathematics of Classical and Quantum Physics (Dover), ch. 5', url: 'https://store.doverpublications.com/products/9780486671642' },
  ],
});
