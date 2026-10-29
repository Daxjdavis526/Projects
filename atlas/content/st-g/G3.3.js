// Operators and their spectra. Bounded operators and the operator norm; d/dx
// as the standard unbounded one (‖e_n′‖ = nπ); the spectrum as the λ where
// A − λ has no bounded inverse, which for multiplication by x on L²[0, 1] is all
// of [0, 1] with no eigenvalues at all — boxes of width w are approximate
// eigenvectors with ‖(X − λ)f‖ = w/√12. A coding exercise sends the discrete
// Laplacian's spectrum toward n²π² while its top runs off to infinity. Ties:
// position and momentum in QM, and the positive Regge–Wheeler operator behind
// the mode stability of Schwarzschild black holes.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const C = 'min(max(lam, w/2), 1 - w/2)';      // the box centre, kept inside [0, 1]

const box = (lam, w, caption) => ({
  type: 'graph',
  params: {
    x: [0, 1], y: [-0.4, Math.max(1.3, 1.15 / Math.sqrt(w))], aspect: 'wide', xlabel: 'x', ylabel: '',
    curves: [{ fn: `step(${w / 2} - abs(x - ${lam}))/sqrt(${w})`, color: 'accent', width: 2.2, samples: 3000, label: 'f', labelAt: lam, labelDx: 8, labelDy: -8 }],
    vlines: [{ x: lam, color: 'gold', label: `λ = ${lam}` }],
  },
  caption,
});

export default lesson({
  id: 'st-g.G3.3',
  title: 'Operators and their spectra',
  minutes: 16, difficulty: 4,
  intro: t`An **operator** is a linear map $A$ on a Hilbert space. It is **bounded** if it stretches no vector by more than a fixed factor, the operator norm; bounded operators are exactly the continuous ones. Its **spectrum** generalizes the eigenvalues of a matrix:

$$\begin{gathered}\lVert A\rVert = \sup_{f \ne 0}\frac{\lVert Af\rVert}{\lVert f\rVert} \\ \sigma(A) = \{\lambda:\ A - \lambda I\ \text{has} \\ \text{no bounded inverse}\}\end{gathered}$$

For a matrix, $\sigma(A)$ is just the set of eigenvalues. In infinite dimensions $A - \lambda I$ can fail to have a bounded inverse **without** $\lambda$ being an eigenvalue: multiplication by $x$ has a whole interval of spectrum and no eigenvectors at all. And the operators physics cares most about — momentum, the Hamiltonian, $d^2/dx^2$ — are **unbounded**, defined only on a domain of smooth enough functions. The physicist’s side of this is [observables and Hermitian operators](#/lesson/phys4700.M4.2) and [self-adjoint operators](#/lesson/st-e.E5.1).`,
  symbols: [
    { tex: 'A', text: t`a linear operator: $A(af + bg) = aAf + bAg$` },
    { tex: '\\lVert A\\rVert', text: t`the operator norm: the largest stretch factor, $\sup\lVert Af\rVert/\lVert f\rVert$ over nonzero $f$; finite exactly when $A$ is bounded` },
    { tex: '\\sup', text: 'the supremum, the least upper bound — it may be approached without being attained' },
    { tex: '\\sigma(A)', text: t`the spectrum: the numbers $\lambda$ for which $A - \lambda I$ cannot be undone by a bounded operator` },
    { tex: 'I', text: t`the identity operator, $If = f$` },
  ],
  why: 'Measured values in quantum mechanics are points of a spectrum, continuous for position and momentum; and the stability of a black hole is a statement about the spectrum of the operator that governs its perturbations.',
  visual: {
    type: 'graph',
    title: 'An eigenvalue that is not there',
    lead: t`On $L^2[0, 1]$ let $X$ multiply by $x$: $(Xf)(x) = x\,f(x)$. An eigenvector for $\lambda$ would have to vanish everywhere except at $x = \lambda$ — the zero vector of $L^2$. But the box $f$ (blue), of width $w$ around $\lambda$ and normalized to length $1$, comes close: $(X - \lambda)f$ (red) is tiny.`,
    tasks: [
      t`Shrink $w$: $\lVert(X - \lambda)f\rVert = w/\sqrt{12}$ goes to $0$ while $\lVert f\rVert$ stays $1$. No bounded inverse of $X - \lambda$ could map these small outputs back to unit inputs, so $\lambda$ is in the spectrum.`,
      t`Move $\lambda$ anywhere in $[0, 1]$: the same happens. The spectrum of $X$ is the whole interval — and contains no eigenvalue.`,
      t`The boxes are trying to become $\delta(x - \lambda)$, the position “eigenstate” of quantum mechanics — whose $L^2$ norm, $1/\sqrt w$ before normalizing, blows up. It is not a state.`,
    ],
    params: {
      x: [0, 1], y: [-0.6, 7.5], aspect: 'wide', xlabel: 'x', ylabel: '',
      sliders: [
        { key: 'lam', label: t`Target $\lambda$`, min: 0, max: 1, step: 0.01, value: 0.4, explain: t`The candidate eigenvalue; the box is centred on it (kept inside $[0, 1]$).` },
        { key: 'w', label: t`Box width $w$`, min: 0.02, max: 0.5, step: 0.01, value: 0.2, explain: t`The box is $1/\sqrt w$ high, so its $L^2$ norm is $1$.` },
      ],
      curves: [
        { fn: `step(w/2 - abs(x - ${C}))/sqrt(w)`, color: 'accent', width: 2.2, samples: 3000, label: 'f', labelAt: C, labelDx: 8, labelDy: -10 },
        { fn: `(x - lam)*step(w/2 - abs(x - ${C}))/sqrt(w)`, color: 'bad', width: 2.2, samples: 3000, label: '(X − λ)f', labelAt: `${C} + w/2`, labelDx: 8, labelDy: 0 },
      ],
      vlines: [{ x: 'lam', color: 'gold', label: 'λ' }],
      readouts: [
        { label: t`$\lVert f\rVert$`, expr: '1', digits: 2 },
        { label: t`$\lVert(X - \lambda)f\rVert$`, expr: `sqrt(((${C} + w/2 - lam)^3 - (${C} - w/2 - lam)^3)/(3*w))`, digits: 3 },
        { label: t`$w/\sqrt{12}$`, expr: 'w/sqrt(12)', digits: 3 },
      ],
    },
    caption: t`$\lVert(X - \lambda)f\rVert$ is computed exactly from $\int(x - \lambda)^2f^2dx$; it equals $w/\sqrt{12}$ when the box is centred on $\lambda$, and is a little larger when the box is pushed in from an end.`,
  },
  example: {
    prompt: t`Find $\lVert X\rVert$ and the spectrum of $(Xf)(x) = x f(x)$ on $L^2[0, 1]$, and show that $X$ has no eigenvalues.`,
    visual: box(0.6, 0.08, t`A unit box of width $0.08$ at $\lambda = 0.6$: an approximate eigenvector, with $\lVert(X - 0.6)f\rVert = 0.08/\sqrt{12} \approx 0.023$.`),
    steps: [
      { label: 'The norm', text: t`$\lVert Xf\rVert^2 = \int_0^1 x^2|f|^2dx \le \int_0^1 |f|^2dx$, so $\lVert X\rVert \le 1$. Unit boxes near $x = 1$ give $\lVert Xf\rVert$ as close to $1$ as you like, so $\lVert X\rVert = 1$ — a supremum that no vector attains.` },
      { label: 'No eigenvalues', text: t`If $x f(x) = \lambda f(x)$, then $(x - \lambda)f(x) = 0$, so $f(x) = 0$ for every $x \ne \lambda$. A function that is zero except at one point is the zero vector of $L^2$. So no $\lambda$ has an eigenvector.` },
      { label: 'Outside the interval', text: t`For $\lambda \notin [0, 1]$, $(X - \lambda)^{-1}$ is multiplication by $1/(x - \lambda)$, which is bounded on $[0, 1]$: its norm is $1/\operatorname{dist}(\lambda, [0, 1])$. These $\lambda$ are not in the spectrum.` },
      { label: 'Inside the interval', text: t`For $\lambda \in [0, 1]$, the unit boxes $f_w$ give $\lVert(X - \lambda)f_w\rVert = w/\sqrt{12} \to 0$. If a bounded inverse $R$ existed, $1 = \lVert f_w\rVert = \lVert R(X - \lambda)f_w\rVert \le \lVert R\rVert\,w/\sqrt{12} \to 0$ — a contradiction. So $\lambda \in \sigma(X)$.` },
      { label: 'Read it physically', text: t`$\sigma(X) = [0, 1]$, all of it **continuous spectrum**: the possible positions of a particle confined to $[0, 1]$. The would-be eigenvectors are delta functions, outside the Hilbert space; the boxes are the honest states that approach them.` },
    ],
    answer: t`$\lVert X\rVert = 1$ (not attained) and $\sigma(X) = [0, 1]$, with no eigenvalues: every $\lambda$ in the interval has approximate eigenvectors (unit boxes, residual $w/\sqrt{12}$) but no true one.`,
  },
  practice: [
    num({
      id: 'matrix-norm', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[2, 1, 2], [3, 1, 1], [1, 2, 1], [2, -1, 0], [0, 2, 3]]);
        const tr = a + c, det = a * c - b * b, disc = Math.sqrt(tr * tr / 4 - det);
        const l1 = tr / 2 + disc, l2 = tr / 2 - disc, ans = Math.max(Math.abs(l1), Math.abs(l2));
        const s = ans + 0.5;
        return {
          prompt: t`For the symmetric matrix $A = \begin{pmatrix} ${a} & ${b} \\ ${b} & ${c}\end{pmatrix}$, find the operator norm $\lVert A\rVert = \max_{\lVert v\rVert = 1}\lVert Av\rVert$ (Euclidean length). Give three significant figures.`,
          visual: { type: 'graph', params: { x: [-1.6 * s, 1.6 * s], y: [-s, s], equal: true, aspect: 'wide', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true, label: 'unit circle', labelAt: 2.4, labelDx: -70, labelDy: -6 }, { param: [`${a}*cos(t) + ${b}*sin(t)`, `${b}*cos(t) + ${c}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.2, label: 'image under A', labelAt: 0.4, labelDx: 8 }] }, caption: t`The unit circle and its image under $A$, an ellipse. The operator norm is the ellipse’s longest radius.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(det), feedback: t`$|\det A|$ is the factor by which areas scale, not the largest stretch of a vector.` }, { value: Math.min(Math.abs(l1), Math.abs(l2)), feedback: t`That is the *smallest* stretch. The norm is the largest $|\lambda|$.` }, { value: Math.abs(a) + Math.abs(b), feedback: 'That is the absolute sum of the first row. The largest absolute row sum bounds the norm of a symmetric matrix, but is not equal to it in general: find the eigenvalues.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`For a symmetric matrix, $\lVert A\rVert$ is the largest $|\lambda|$ over its eigenvalues.`, t`$\lambda = \tfrac{${tr}}{2} \pm \sqrt{\tfrac{${tr * tr}}{4} - (${det})}$.`],
          teach: t`The operator norm is the largest stretch factor; for a symmetric (self-adjoint) matrix it is the largest absolute eigenvalue.`,
          explain: t`The eigenvalues are $${nice(l1, 4)}$ and $${nice(l2, 4)}$, so $\lVert A\rVert = ${nice(ans, 4)}$: the unit eigenvector of the larger one is stretched most. Here the norm is attained; for $X$ on $L^2$ it is not.`,
        };
      },
    }),
    num({
      id: 'derivative-unbounded', difficulty: 2,
      gen(r) {
        const n = r.int(2, 9);
        const ans = n * Math.PI;
        return {
          prompt: t`$e_n(x) = \sqrt2\,\sin(n\pi x)$ has length $1$ in $L^2[0, 1]$. Find $\lVert e_n'\rVert$, the length of its derivative, for $n = ${n}$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.6, 1.6], aspect: 'wide', curves: [{ fn: `sqrt(2)*sin(${n}*pi*x)`, color: 'accent', width: 2.2, label: `e${'₀₁₂₃₄₅₆₇₈₉'[n]}`, labelAt: 0.5 / n, labelDx: 6, labelDy: -8 }] }, caption: t`$e_{${n}}$: a unit vector in $L^2[0, 1]$. The more it wiggles, the steeper it is.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: n * n * Math.PI * Math.PI, feedback: t`That is $\lVert e_n'\rVert^2$, or the eigenvalue of $-d^2/dx^2$. Take the square root.` }, { value: Math.SQRT2 * n * Math.PI, feedback: t`That is the *amplitude* of $e_n'$. The $L^2$ norm averages the square: $\cos^2$ averages to $\tfrac12$.` }],
          hints: [t`$e_n' = \sqrt2\,n\pi\cos(n\pi x)$.`, t`$\int_0^1 2n^2\pi^2\cos^2(n\pi x)\,dx = n^2\pi^2$.`],
          teach: t`$\lVert e_n'\rVert/\lVert e_n\rVert = n\pi$ grows without bound, so $d/dx$ has no finite operator norm: it is unbounded.`,
          explain: t`$\lVert e_{${n}}'\rVert = ${n}\pi = ${nice(ans, 4)}$. No constant $K$ gives $\lVert f'\rVert \le K\lVert f\rVert$ for all $f$: momentum ($-i\hbar\,d/dx$) is an unbounded operator, defined only on differentiable enough functions.`,
        };
      },
    }),
    num({
      id: 'approx-eigen', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.3, 0.5, 0.7]), w = r.pick([0.2, 0.1, 0.05, 0.02]);
        const ans = w / Math.sqrt(12);
        return {
          prompt: t`$f$ is a box of width $w = ${w}$ centred at $\lambda = ${lam}$, of height $1/\sqrt{${w}}$ so that $\lVert f\rVert = 1$ in $L^2[0, 1]$. Compute $\lVert(X - \lambda)f\rVert$, where $X$ multiplies by $x$.`,
          visual: box(lam, w, t`The unit box at $\lambda = ${lam}$ with width $${w}$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: w / 2, feedback: t`$w/2$ is the largest value of $|x - \lambda|$ on the box. The norm averages $(x - \lambda)^2$ over the box.` }, { value: w * w / 12, feedback: t`That is the squared norm. Take the square root.` }],
          hints: [t`$\lVert(X - \lambda)f\rVert^2 = \dfrac{1}{w}\int_{-w/2}^{w/2}u^2\,du$.`, t`$\int_{-w/2}^{w/2}u^2du = \dfrac{w^3}{12}$.`],
          teach: t`Unit boxes are approximate eigenvectors of $X$: the residual $w/\sqrt{12}$ shrinks to $0$ although no true eigenvector exists.`,
          explain: t`$\tfrac1w\cdot\tfrac{w^3}{12} = \tfrac{w^2}{12}$, so $\lVert(X - \lambda)f\rVert = ${w}/\sqrt{12} = ${nice(ans, 4)}$. Halving the box halves the residual — forever approaching an eigenvalue equation, never satisfying it.`,
        };
      },
    }),
    num({
      id: 'resolvent', difficulty: 3,
      gen(r) {
        const lam = r.pick([-0.5, 1.25, 2, -2, 1.1, 3]);
        const d = lam < 0 ? -lam : lam - 1, ans = 1 / d;
        return {
          prompt: t`$\lambda = ${lam}$ is not in the spectrum $[0, 1]$ of $X$ on $L^2[0, 1]$, so $(X - \lambda)^{-1}$ — multiplication by $1/(x - \lambda)$ — is bounded. What is its norm?`,
          visual: { type: 'graph', params: { x: [Math.min(lam, 0) - 0.3, Math.max(lam, 1) + 0.3], y: [0, Math.min(1 / d * 1.6, 12)], aspect: 'wide', curves: [{ fn: `1/abs(x - ${lam})`, color: 'accent', width: 2, domain: [0, 1], label: '1/|x − λ| on [0, 1]', labelAt: 0.5, labelDx: -20, labelDy: -10 }], vlines: [{ x: lam, color: 'gold', label: `λ = ${lam}` }], shade: [{ fn: `1/abs(x - ${lam})`, from: 0, to: 1, color: 'accent', alpha: 0.12 }] }, caption: t`The multiplier $1/|x - \lambda|$ over $[0, 1]$. A multiplication operator’s norm is the supremum of its multiplier.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / Math.max(Math.abs(lam), Math.abs(lam - 1)), feedback: t`That is the *smallest* value of $1/|x - \lambda|$ on $[0, 1]$. The norm is the largest, at the end of the interval nearest $\lambda$.` }, { value: d, feedback: t`That is the distance from $\lambda$ to the interval. The norm is its reciprocal.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\lVert(X - \lambda)^{-1}f\rVert^2 = \int_0^1 \dfrac{|f|^2}{(x - \lambda)^2}dx \le \Bigl(\sup_{[0,1]}\dfrac{1}{|x - \lambda|}\Bigr)^2\lVert f\rVert^2$.`, t`The supremum is at the point of $[0, 1]$ closest to $${lam}$.`],
          teach: t`Off the spectrum the resolvent is bounded, with norm $1/\operatorname{dist}(\lambda, \sigma)$ for a multiplication operator — it blows up as $\lambda$ approaches the spectrum.`,
          explain: t`The closest point of $[0, 1]$ is $${lam < 0 ? 0 : 1}$, at distance $${nice(d)}$, so $\lVert(X - ${lam})^{-1}\rVert = ${nice(ans, 4)}$ — attained in the limit by boxes squeezed against that end.`,
        };
      },
    }),
    mcq({
      id: 'no-matrices', difficulty: 3,
      prompt: t`Quantum mechanics needs $XP - PX = i\hbar I$. Why can no pair of $n\times n$ matrices $X, P$ satisfy it, for any finite $n$?`,
      choices: [t`$\operatorname{tr}(XP - PX) = 0$ for any matrices, while $\operatorname{tr}(i\hbar I) = i\hbar n \ne 0$`, t`Because $\hbar$ is too small to appear in a matrix`, t`Because $X$ and $P$ would have to commute`, t`They can, if $n$ is large enough`],
      answer: 0,
      why: {
        1: t`Scale has nothing to do with it: the obstruction holds for any nonzero constant in place of $\hbar$.`,
        2: t`The relation says they do **not** commute; matrices can fail to commute. The obstruction is the trace.`,
        3: t`The trace argument works for every finite $n$. Only infinite-dimensional spaces — with at least one of $X$, $P$ unbounded — allow the relation.`,
      },
      hints: [t`Take the trace of both sides.`, t`$\operatorname{tr}(XP) = \operatorname{tr}(PX)$ for any square matrices.`],
      teach: t`The canonical commutation relation has no finite-dimensional solution, and (by a theorem of Wintner and Wielandt) no solution with both operators bounded: unbounded operators are forced on quantum mechanics.`,
      explain: t`$\operatorname{tr}(XP) = \operatorname{tr}(PX)$, so the left side has trace $0$, the right side $i\hbar n$. Even in infinite dimensions, $X$ and $P$ cannot both be bounded — and the Hellinger–Toeplitz theorem then says they cannot be defined on all of $L^2$: domains matter.`,
    }),
    code({
      id: 'laplacian-spectrum', difficulty: 3,
      prompt: t`Discretize $-d^2/dx^2$ on $[0, 1]$ with $f(0) = f(1) = 0$: on $N$ interior points with spacing $h = 1/(N + 1)$, it is the tridiagonal matrix with $2/h^2$ on the diagonal and $-1/h^2$ beside it. Write \`laplacian(N)\` returning this $N\times N$ NumPy array. The program then prints the lowest three eigenvalues divided by $\pi^2$ (they should approach $1, 4, 9$, that is $n^2$) and the **largest** eigenvalue, which grows like $4/h^2$ — the footprint, in a matrix, of an unbounded operator.`,
      starter: t`import numpy as np

def laplacian(N):
    h = 1 / (N + 1)
    # build the N x N matrix here
    pass

for N in (10, 100):
    ev = np.sort(np.linalg.eigvalsh(laplacian(N)))
    print(N, np.round(ev[:3] / np.pi**2, 4), round(ev[-1]))
`,
      answer: t`import numpy as np

def laplacian(N):
    h = 1 / (N + 1)
    main = 2 * np.ones(N) / h**2
    off = -np.ones(N - 1) / h**2
    return np.diag(main) + np.diag(off, 1) + np.diag(off, -1)

for N in (10, 100):
    ev = np.sort(np.linalg.eigvalsh(laplacian(N)))
    print(N, np.round(ev[:3] / np.pi**2, 4), round(ev[-1]))
`,
      tests: [
        { name: 'laplacian(5) is a 5 × 5 array', code: 'np.shape(laplacian(5)) == (5, 5)' },
        { name: 'it is symmetric', code: 'np.allclose(laplacian(7), laplacian(7).T)' },
        { name: 'for N = 100 the lowest eigenvalue is within 0.1% of π²', code: 'abs(np.sort(np.linalg.eigvalsh(laplacian(100)))[0] / np.pi**2 - 1) < 1e-3' },
        { name: 'the second eigenvalue approaches 4π²', code: 'abs(np.sort(np.linalg.eigvalsh(laplacian(100)))[1] / np.pi**2 - 4) < 0.01' },
        { name: 'the largest eigenvalue for N = 100 exceeds 0.99 × 4/h²', code: 'np.linalg.eigvalsh(laplacian(100)).max() > 0.99 * 4 * 101**2' },
      ],
      hints: [t`\`np.diag(v, k)\` puts the vector \`v\` on the $k$-th diagonal ($k = 1$ above, $-1$ below the main one).`, t`Main diagonal: \`2 * np.ones(N) / h**2\`; the two off-diagonals: \`-np.ones(N - 1) / h**2\`.`],
      teach: t`The discrete Laplacian’s low eigenvalues converge to the continuum ones, $n^2\pi^2$, while its largest grows like $4/h^2$: refine the grid and the spectrum runs off to infinity — the signature of an unbounded operator.`,
      explain: t`The exact eigenvalues are $\tfrac{4}{h^2}\sin^2\tfrac{k\pi h}{2}$: for small $k$ that is $k^2\pi^2$, for $k = N$ nearly $4/h^2 \approx 4(N + 1)^2$. The continuum operator has eigenvalues $n^2\pi^2$ for every $n$ — no largest one — so it cannot be bounded.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-mode-stability', difficulty: 3, transfer: true,
      prompt: t`Small gravitational perturbations of a Schwarzschild black hole obey, mode by mode, $-\dfrac{d^2\psi}{dr_*^2} + V(r)\,\psi = \omega^2\psi$, with $\psi \propto e^{-i\omega t}$ and the Regge–Wheeler potential $V$, which is **positive** outside the horizon. Why does positivity of the operator $L = -d^2/dr_*^2 + V$ rule out exponentially growing modes?`,
      visual: { type: 'graph', params: { x: [2, 20], y: [0, 0.18], aspect: 'wide', xlabel: 'r (units of GM/c²)', ylabel: 'V (units of M⁻²)', curves: [{ fn: '(1 - 2/x)*(6/x^2 - 6/x^3)', color: 'accent', width: 2.2, label: 'Regge–Wheeler, l = 2', labelAt: 6, labelDx: 8, labelDy: -6 }], points: [{ x: 3.281, y: 0.1513, r: 4, color: 'gold', label: 'peak near r = 3.3M', labelDx: 8, labelDy: -8 }] }, caption: t`The axial gravitational potential for $l = 2$ ($G = c = 1$), $V = (1 - \tfrac{2M}{r})\bigl(\tfrac{6}{r^2} - \tfrac{6M}{r^3}\bigr)$: positive everywhere outside the horizon at $r = 2M$.` },
      choices: [t`For a normalizable $\psi$, $\omega^2 = \dfrac{\langle\psi, L\psi\rangle}{\langle\psi, \psi\rangle} > 0$, so $\omega$ is real and $e^{-i\omega t}$ cannot grow`, t`A positive potential makes every $\omega$ imaginary, so all modes decay`, t`Positivity makes $L$ bounded, and bounded operators have no growing modes`, t`It does not: the spectrum of $L$ is continuous, so growth is always possible`],
      answer: 0,
      why: {
        1: t`Imaginary $\omega$ would mean $\omega^2 < 0$, exactly what positivity forbids. (Decay of the ringdown comes from outgoing boundary conditions, not from the eigenvalue problem.)`,
        2: t`$L$ contains $-d^2/dr_*^2$, which is unbounded however positive $V$ is.`,
        3: t`A continuous spectrum on the positive real line still means real $\omega$: oscillation, not growth.`,
      },
      hints: [t`Growth needs $\omega$ with a positive imaginary part, which needs $\omega^2$ not real-and-positive.`, t`Integrate by parts: $\langle\psi, L\psi\rangle = \int\bigl(|\psi'|^2 + V|\psi|^2\bigr)dr_*$.`],
      teach: t`A positive self-adjoint operator has spectrum in $[0, \infty)$; for a wave equation that means real frequencies — no exponentially growing modes, the content of Schwarzschild mode stability.`,
      explain: t`$\langle\psi, L\psi\rangle = \int(|\psi'|^2 + V|\psi|^2)\,dr_* > 0$, so $\omega^2 > 0$ (Regge–Wheeler 1957, Vishveshwara 1970). This is mode stability only; full nonlinear stability of Schwarzschild was proved much later. The ringing quasinormal modes have complex $\omega$ because their outgoing boundary conditions make the problem non-self-adjoint.`,
    }),
    num({
      id: 'cp-strip', difficulty: 2, transfer: true,
      gen(r) {
        const p = r.pick([25, 50, 55, 80, 100]);
        const ans = p / Math.sqrt(12);
        return {
          prompt: t`A silicon strip detector records only **which** strip a particle crossed; the strips have pitch $p = ${p}\ \mu\text{m}$. The particle’s position is then known only to be somewhere in a strip — a box of width $p$, like the approximate eigenvectors of $X$. What is the rms position uncertainty, $\lVert(X - \lambda)f\rVert$ for the unit box, in micrometres?`,
          visual: box(0.5, 0.25, t`A unit box of width $p$ (drawn in units where the pitch is $0.25$): the state of knowledge “somewhere in this strip”, uniformly.`),
          answer: ans, units: 'μm', tol: { rel: 0.005 },
          errors: [{ value: p / 2, feedback: t`$p/2$ is the largest possible error. The rms error averages $(x - \lambda)^2$ over the strip: $p/\sqrt{12}$.` }, { value: p * p / 12, feedback: t`That is the variance; take the square root.` }],
          hints: [t`This is the box residual $w/\sqrt{12}$ with $w = p$.`],
          teach: t`The binary-readout resolution of a strip detector, pitch/√12, is the residual of the box approximate eigenvector — the standard deviation of a uniform distribution.`,
          explain: t`$${p}/\sqrt{12} = ${nice(ans, 3)}\ \mu\text{m}$. Detectors that also record how much charge each strip saw can interpolate between strips and do better.`,
        };
      },
    }),
    mcq({
      id: 'cp-discontinuous', difficulty: 3,
      prompt: t`Bounded operators are exactly the continuous ones: $f_k \to 0$ implies $Af_k \to 0$. Which sequence in $L^2[0, 1]$ shows that $d/dx$ is **not** continuous?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.5, 0.5], aspect: 'wide', curves: [[2, 'gold'], [3, 'accent2'], [5, 'accent']].map(([k, c]) => ({ fn: `sqrt(2)*sin(${k * k}*pi*x)/${k}`, color: c, width: 1.6, samples: 2000 })) }, caption: t`$\sqrt2\sin(k^2\pi x)/k$ for $k = 2, 3, 5$: smaller and smaller, but wigglier and wigglier.` },
      choices: [t`$f_k = \sqrt2\,\sin(k^2\pi x)/k$: $\lVert f_k\rVert = 1/k \to 0$ but $\lVert f_k'\rVert = k\pi \to \infty$`, t`$f_k = x/k$: $\lVert f_k\rVert \to 0$ and $\lVert f_k'\rVert = 1/k \to 0$`, t`$f_k = \sqrt2\,\sin(k\pi x)$: $\lVert f_k'\rVert = k\pi \to \infty$`, t`$f_k = 1/k$, constant: $\lVert f_k\rVert \to 0$ and $f_k' = 0$`],
      answer: 0,
      why: {
        1: t`Here the derivatives also go to $0$, consistent with continuity: it proves nothing.`,
        2: t`These do not tend to $0$ — each has length $1$ — so the test of continuity at $0$ does not apply.`,
        3: t`The derivatives are all $0$, so $Af_k \to 0$: consistent with continuity, not a counterexample.`,
      },
      hints: [t`You need $f_k \to 0$ in $L^2$ while $\lVert f_k'\rVert$ does not tend to $0$.`, t`Shrink the amplitude like $1/k$ and raise the frequency like $k^2$.`],
      teach: t`$d/dx$ fails continuity at $0$: functions can shrink in $L^2$ while their derivatives grow — the hallmark of an unbounded operator.`,
      explain: t`$\lVert f_k\rVert = 1/k$ but $f_k' = \sqrt2\,k\pi\cos(k^2\pi x)$ has norm $k\pi$. Small inputs, huge outputs: no bound $\lVert f'\rVert \le K\lVert f\rVert$ can hold.`,
    }),
  ],
  sources: [
    { label: 'Kreyszig, Introductory Functional Analysis with Applications (Wiley, 1978), chs. 2.7, 7, 10–11 (bounded and unbounded operators, spectra)', url: 'https://openlibrary.org/isbn/9780471504597' },
    { label: 'Bonneau, Faraut & Valent, Self-adjoint extensions of operators and the teaching of quantum mechanics, Am. J. Phys. 69, 322 (2001)', url: 'https://arxiv.org/abs/quant-ph/0103153' },
    { label: 'Vishveshwara, Stability of the Schwarzschild metric, Phys. Rev. D 1, 2870 (1970)', url: 'https://doi.org/10.1103/PhysRevD.1.2870' },
  ],
});
