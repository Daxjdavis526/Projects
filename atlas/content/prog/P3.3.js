// Linear algebra with numpy.linalg — solve (not inv), eigh on an inertia
// tensor, and the condition number that says how many digits survive.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

// ── small exact helpers, so every number printed here is computed ──
function jacobi3(A0) {   // eigenvalues (ascending) and unit eigenvectors of a symmetric 3 × 3 matrix
  const A = A0.map((r) => [...r]), V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(A[p][q]) < 1e-15) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
      for (let k = 0; k < 3; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
      for (let k = 0; k < 3; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
      for (let k = 0; k < 3; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  const idx = [0, 1, 2].sort((i, j) => A[i][i] - A[j][j]);
  return { w: idx.map((i) => A[i][i]), V: idx.map((i) => [V[0][i], V[1][i], V[2][i]]) };
}
const inertia = (pts) => {
  const I = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const [m, r] of pts) { const r2 = r[0] ** 2 + r[1] ** 2 + r[2] ** 2; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) I[a][b] += m * ((a === b ? r2 : 0) - r[a] * r[b]); }
  return I;
};
function gauss(A0, b0) {  // Gaussian elimination with partial pivoting
  const n = b0.length, A = A0.map((r, i) => [...r, b0[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
    [A[k], A[p]] = [A[p], A[k]];
    for (let i = k + 1; i < n; i++) { const f = A[i][k] / A[k][k]; for (let j = k; j <= n; j++) A[i][j] -= f * A[k][j]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}
const f3 = (v) => v.map((x) => x.toFixed(3)).join(', ');

// the worked example's slender satellite: (mass in kg, position in m)
const SAT = [[6, [0, 0, 0.9]], [6, [0, 0, -0.9]], [2, [0.35, 0.1, 0.2]], [2, [-0.3, 0.2, -0.25]], [1, [0.1, -0.4, 0.5]]];
const I_SAT = inertia(SAT), E_SAT = jacobi3(I_SAT);
const minorAxis = E_SAT.V[0].map((x) => x * Math.sign(E_SAT.V[0][2]));

// the checkpoint's satellite with solar panels
const PANEL = [[8, [1.5, 0.2, 0.0]], [8, [-1.5, 0.2, 0.0]], [3, [0.0, 0.1, 1.2]], [10, [0.1, -0.3, -0.2]]];
const E_PANEL = jacobi3(inertia(PANEL));

// the practice inertia tensor (kg m²)
const JP = [[1520, 12, -35], [12, 1180, 64], [-35, 64, 640]];
const E_JP = jacobi3(JP);

// a three-mesh ladder circuit
const R = [5, 10, 15, 20, 25], V1 = 9, V2 = 3;
const A_C = [[R[0] + R[1], -R[1], 0], [-R[1], R[1] + R[2] + R[3], -R[3]], [0, -R[3], R[3] + R[4]]], B_C = [V1, 0, -V2];
const I_C = gauss(A_C, B_C);

const satPoints = (pts, labels = true) => pts.map(([m, r]) => ({ at: r, color: 'gold', label: labels ? t`${m}\,\text{kg}` : undefined }));

export default lesson({
  id: 'prog.P3.3',
  title: 'Linear algebra with numpy.linalg',
  minutes: 12, difficulty: 3,
  intro: t`Circuits, trusses, least-squares fits and finite-difference equations all end as a linear system $A\vec x = \vec b$, and rigid-body spin, vibration modes and quantum energy levels end as an eigenvalue problem. NumPy hands both to LAPACK: \`np.linalg.solve(A, b)\` (never \`inv(A) @ b\`) and \`np.linalg.eigh(A)\` for symmetric matrices. One number says how far to trust the answer, the **condition number** $\kappa(A)$:

$$\frac{\lVert\delta\vec x\rVert}{\lVert\vec x\rVert} \;\le\; \kappa(A)\,\frac{\lVert\delta\vec b\rVert}{\lVert\vec b\rVert}$$

With 16-digit floats, expect to lose about $\log_{10}\kappa$ of them.`,
  symbols: [
    { tex: 'A', text: 'the matrix of coefficients — resistances, stiffnesses, an inertia tensor' },
    { tex: t`\vec x`, text: 'the unknowns: currents, forces, displacements' },
    { tex: t`\vec b`, text: 'the known right-hand side: source voltages, applied loads' },
    { tex: t`\delta\vec b,\ \delta\vec x`, text: 'a small error in the data (measurement or round-off, at least $10^{-16}$ relative) and the error it causes in the answer' },
    { tex: t`\kappa(A)`, text: 'the condition number, $\\lVert A\\rVert\\,\\lVert A^{-1}\\rVert \\ge 1$ (`np.linalg.cond`): the worst-case amplification of relative error' },
    { tex: t`\lVert\ \rVert`, text: 'a norm: the size of a vector (here the usual length) or the largest stretch a matrix applies' },
  ],
  why: 'Most of computational physics reduces to linear algebra; knowing which routine to call, and how much of its answer to believe, is the difference between a result and a random number.',
  visual: {
    type: 'code-runner',
    title: 'Solve, diagonalize, and count the digits you lose',
    lead: t`Press **Run**. Part 1 solves a 400 × 400 system two ways. Part 2 finds a satellite's principal moments with \`eigh\`. Part 3 solves Hilbert-matrix systems whose exact answer is all ones, and plots how the error grows with the condition number.`,
    tasks: ['In part 3, compare each printed error with 10⁻¹⁶ × cond: the bound holds, roughly.', 'In part 2, swap `eigh` for `eig` and compare what comes back.', 'In part 1, make n = 800: how do the two times scale?'],
    params: {
      rows: 28,
      code: t`import time
import numpy as np
import atlas.plot as plt

rng = np.random.default_rng(0)

# 1. solve, don't invert
n = 400
A = rng.standard_normal((n, n))
b = rng.standard_normal(n)
np.linalg.solve(A[:5, :5], b[:5])                         # warm up
t0 = time.perf_counter(); x1 = np.linalg.solve(A, b)
t1 = time.perf_counter(); x2 = np.linalg.inv(A) @ b
t2 = time.perf_counter()
print(f"solve: {t1 - t0:.4f} s, residual {np.abs(A @ x1 - b).max():.1e}")
print(f"inv:   {t2 - t1:.4f} s, residual {np.abs(A @ x2 - b).max():.1e}")

# 2. principal moments of a satellite's inertia tensor (kg m²)
J = np.array([[ 900.,  -45.,  -20.],
              [ -45., 1200.,   30.],
              [ -20.,   30., 1500.]])
w, V = np.linalg.eigh(J)                 # ascending; the columns of V are the axes
print("principal moments:", np.round(w, 1))
print("major axis:", np.round(V[:, -1], 3))

# 3. conditioning: Hilbert matrices H[i, j] = 1/(i + j + 1)
ns = list(range(2, 14))
logk, logerr = [], []
for m in ns:
    H = 1.0 / (np.arange(m)[:, None] + np.arange(m) + 1)
    x = np.linalg.solve(H, H @ np.ones(m))              # exact answer: all ones
    logk.append(np.log10(np.linalg.cond(H)))
    logerr.append(np.log10(np.abs(x - 1).max() + 1e-17))
    print(f"n = {m:2d}   cond = {10**logk[-1]:.1e}   error = {10**logerr[-1]:.1e}")
plt.plot(ns, logk, label="log10 cond(H)")
plt.plot(ns, logerr, label="log10 worst error in x")
plt.xlabel("n")
plt.legend()
plt.show()`,
    },
    caption: 'Real LAPACK in your browser. The error bound is a worst case: actual errors are usually smaller than 10⁻¹⁶ × κ, but they grow at the same rate. By n = 13 the answer has no correct digits at all.',
  },
  example: {
    prompt: t`A slender satellite is modelled as five point masses (positions in m, body axes). Find its principal moments of inertia and the axis of the smallest one, from $I = \sum_k m_k\left(r_k^2\,\mathbb 1 - \vec r_k\,\vec r_k^{\,T}\right)$. Then use the major-axis rule: a spinning body that dissipates energy ends up spinning about its axis of **largest** moment.`,
    visual: {
      type: 'calc-vectors3d',
      params: { range: 1.1, points: satPoints(SAT),
        vectors: [{ to: minorAxis.map((x) => +(1.05 * x).toFixed(4)), color: 'accent', label: t`\hat e_{\min}` }],
        segments: [{ from: [0, 0, -0.9], to: [0, 0, 0.9], color: 'ink3', dash: true }] },
      caption: 'The five masses (drag to turn) and the computed axis of smallest moment, nearly along the body’s length. Point masses are a teaching model of a real structure.',
    },
    steps: [
      { label: 'Build the tensor', text: t`Each mass adds $m(r^2\mathbb 1 - \vec r\vec r^{\,T})$: \`np.eye(3)\` is $\mathbb 1$ and \`np.outer(r, r)\` is $\vec r\vec r^{\,T}$.

\`\`\`python
import numpy as np
m = np.array([6, 6, 2, 2, 1.0])                        # kg
pos = np.array([[0, 0, 0.9], [0, 0, -0.9], [0.35, 0.1, 0.2],
                [-0.3, 0.2, -0.25], [0.1, -0.4, 0.5]])  # m
I = sum(mk * (r @ r * np.eye(3) - np.outer(r, r)) for mk, r in zip(m, pos))
\`\`\`` },
      { label: 'Diagonalize with eigh', text: t`An inertia tensor is symmetric, so use \`eigh\`: real eigenvalues in ascending order and orthonormal eigenvectors as the **columns** of \`V\`.

\`\`\`python
w, V = np.linalg.eigh(I)
print(w)            # principal moments, kg m²
print(V[:, 0])      # axis of the smallest
\`\`\`

It prints moments of ${E_SAT.w.map((x) => x.toFixed(3)).join(', ')} kg m², and the smallest moment's axis $(${f3(minorAxis)})$ — almost the long $z$ axis, tilted slightly by the off-axis masses.` },
      { label: 'Read the physics', text: t`A spin about the long axis (moment ${E_SAT.w[0].toFixed(2)}) is stable only for a perfectly rigid body. Flexing parts dissipate energy at fixed angular momentum $L$, and since $E = L^2/2I$ the spin drifts to the axis of largest $I$ — a tumble end over end. That is what happened to **Explorer 1** in 1958: spinning about its long axis, it was in a flat spin within hours, a motion traced to energy lost in its four whip antennas.` },
      { label: 'Sense check', text: t`The trace of $I$ equals the sum of the moments (both ${E_SAT.w.reduce((a, b) => a + b, 0).toFixed(3)}), the moments obey $I_1 + I_2 \ge I_3$ as every real body's must, and \`V.T @ I @ V\` is diagonal to round-off.` },
    ],
    answer: t`Principal moments ${E_SAT.w.map((x) => x.toFixed(2)).join(', ')} kg m²; smallest about $(${f3(minorAxis)})$, nearly the long axis — an unstable spin axis for a body that dissipates energy.`,
  },
  practice: [
    mcq({
      id: 'solve-vs-inv', difficulty: 2,
      prompt: t`Both lines give the currents in a circuit model. Why is the first preferred?

\`\`\`python
x = np.linalg.solve(A, b)        # 1
x = np.linalg.inv(A) @ b         # 2
\`\`\``,
      choices: [
        '`solve` factorizes A once and back-substitutes: less work and less round-off than forming the whole inverse',
        'They give different exact answers; only `solve` is mathematically correct',
        '`inv` works only for 2 × 2 matrices',
        '`solve` checks the units of the answer, `inv` does not',
      ],
      answer: 0,
      why: {
        1: 'In exact arithmetic they agree. The difference is cost and floating-point error.',
        2: '`inv` handles any square, non-singular matrix — it is just wasteful for solving one system.',
        3: 'NumPy knows nothing about units; arrays hold bare numbers.',
      },
      hints: ['Count the work: an inverse is n systems’ worth of solving.', 'Every extra operation adds round-off.'],
      teach: 'Solve linear systems with `np.linalg.solve` (an LU factorization); compute an explicit inverse only when you need the inverse itself.',
      explain: t`\`solve\` does one LU factorization and two triangular solves. Forming $A^{-1}$ costs about three times as much for a large matrix and then needs a matrix–vector product, with more round-off along the way. To solve for many right-hand sides, pass them all at once: \`solve(A, B)\` with \`B\` an \`(n, k)\` array.`,
    }),
    code({
      id: 'ladder-circuit', difficulty: 2,
      prompt: t`Kirchhoff's voltage law around the three meshes of a ladder circuit ($R = 5, 10, 15, 20, 25\ \Omega$; sources of ${V1} V and ${V2} V) gives, for the mesh currents in amperes,

$$\begin{aligned} ${A_C[0][0]}I_1 - ${-A_C[0][1]}I_2 &= ${V1} \\ -${-A_C[1][0]}I_1 + ${A_C[1][1]}I_2 - ${-A_C[1][2]}I_3 &= 0 \\ -${-A_C[2][1]}I_2 + ${A_C[2][2]}I_3 &= -${V2} \end{aligned}$$

Build the matrix \`A\` and vector \`b\`, then set \`I\` to the three currents with \`np.linalg.solve\`.`,
      starter: t`import numpy as np

A = None
b = None
I = None
`,
      answer: t`import numpy as np

A = np.array([[${A_C[0].join(', ')}],
              [${A_C[1].join(', ')}],
              [${A_C[2].join(', ')}]], dtype=float)
b = np.array([${B_C.join(', ')}], dtype=float)
I = np.linalg.solve(A, b)
print(I)`,
      tests: [
        { name: 'the coefficient matrix matches the equations', code: `np.allclose(A, [[${A_C[0].join(', ')}], [${A_C[1].join(', ')}], [${A_C[2].join(', ')}]])` },
        { name: t`$I_1 = ${(I_C[0] * 1000).toFixed(2)}$ mA, $I_2 = ${(I_C[1] * 1000).toFixed(2)}$ mA, $I_3 = ${(I_C[2] * 1000).toFixed(2)}$ mA`, code: `np.allclose(I, [${I_C.join(', ')}], rtol=1e-10, atol=0)` },
        { name: 'the residual A I − b is at round-off level', code: 'np.abs(A @ I - b).max() < 1e-12' },
      ],
      hints: ['Row k of `A` holds the coefficients of I₁, I₂, I₃ in equation k — zeros where a current is absent.', '`A = np.array([[15, -10, 0], …])`, `b = np.array([9, 0, -3])`, then `I = np.linalg.solve(A, b)`.'],
      teach: 'Writing a linear system for NumPy is bookkeeping: one row per equation, one column per unknown, the constants in b.',
      explain: t`The currents are ${I_C.map((x) => (x * 1000).toFixed(2)).join(', ')} mA. The negative $I_3$ means that mesh current flows opposite to the direction assumed — the second source wins there. The matrix is symmetric with a dominant diagonal, typical of resistor networks and well conditioned ($\kappa \approx ${(() => { const e = jacobi3(A_C).w; return (e[2] / e[0]).toFixed(1); })()}$).`,
    }),
    num({
      id: 'cond-digits', difficulty: 2,
      gen(r) {
        const k = r.pick([3, 5, 7, 9, 11, 13]);
        return {
          prompt: t`A stiffness matrix from a finite-element model reports

\`\`\`python
>>> np.linalg.cond(K)
${(10 ** k * r.pick([1.2, 2.5, 4.1, 7.3])).toExponential(1).replace('e+', 'e+').replace(/e\+(\d)$/, 'e+0$1')}
\`\`\`

Using 64-bit floats (about 16 significant digits), roughly how many significant digits of the computed displacements can you trust?`,
          answer: 16 - k, tol: { rel: 0, abs: 1.01 },
          errors: [{ value: k, feedback: t`$\log_{10}\kappa \approx ${k}$ is the number of digits *lost*, not kept.` }, { value: 16 + k, feedback: 'Conditioning never adds digits: the condition number amplifies errors.' }],
          hints: [t`Relative error in the answer $\lesssim \kappa \times 10^{-16}$.`, t`$\kappa \approx 10^{${k}}$ turns $10^{-16}$ into about $10^{${k - 16}}$.`],
          teach: 'With double precision you keep about 16 − log₁₀ κ significant digits — and fewer if the input data are less accurate than that.',
          explain: t`The relative error can be as large as $10^{${k}}\times10^{-16} = 10^{${k - 16}}$, leaving about ${16 - k} trustworthy digits. If the inputs (say, measured stiffnesses) carry only 4 digits, the bound becomes $10^{${k}}\times10^{-4}$ — and ${k >= 4 ? 'nothing can be trusted at all' : `only about ${4 - k} digit${4 - k === 1 ? '' : 's'} survive`}.`,
        };
      },
    }),
    code({
      id: 'principal', difficulty: 3,
      prompt: t`A spacecraft's inertia tensor (kg m², body axes) is given as \`J\`. Set \`moments\` to its principal moments in ascending order, and \`axis_max\` to the **unit vector** of the axis with the largest moment.`,
      starter: t`import numpy as np

J = np.array([[${JP[0].join('., ')}.],
              [${JP[1].join('., ')}.],
              [${JP[2].join('., ')}.]])

moments = None
axis_max = None
`,
      answer: t`import numpy as np

J = np.array([[${JP[0].join('., ')}.],
              [${JP[1].join('., ')}.],
              [${JP[2].join('., ')}.]])

moments, V = np.linalg.eigh(J)
axis_max = V[:, -1]
print(moments, axis_max)`,
      tests: [
        { name: t`the principal moments, ascending: ${E_JP.w.map((x) => x.toFixed(1)).join(', ')} kg m²`, code: 'np.allclose(moments, np.linalg.eigvalsh(J))' },
        { name: 'the axis has length 1', code: 'abs(np.linalg.norm(axis_max) - 1) < 1e-9' },
        { name: t`it is the axis of the largest moment: $J\hat e = I_{\max}\hat e$`, code: 'np.allclose(J @ axis_max, np.linalg.eigvalsh(J)[-1] * axis_max)' },
      ],
      hints: ['`moments, V = np.linalg.eigh(J)` returns the eigenvalues in ascending order.', 'The eigenvectors are the **columns** of `V`: the largest moment’s axis is `V[:, -1]`, not `V[-1]`.'],
      teach: '`eigh` returns sorted eigenvalues and an array whose columns are the matching unit eigenvectors.',
      explain: t`The largest moment, ${E_JP.w[2].toFixed(1)} kg m², is about the axis $(${f3(E_JP.V[2].map((x) => x * Math.sign(E_JP.V[2][0])))})$, close to the body $x$ axis; the sign of an eigenvector is arbitrary. \`V[-1]\` — the last *row* — is not an eigenvector at all, and the last test catches exactly that slip.`,
    }),
    mcq({
      id: 'eig-vs-eigh', difficulty: 2,
      prompt: t`For a symmetric matrix such as an inertia tensor, what does \`eigh\` give that \`eig\` does not guarantee?

\`\`\`python
w1, V1 = np.linalg.eig(J)
w2, V2 = np.linalg.eigh(J)
\`\`\``,
      choices: ['Real eigenvalues sorted in ascending order, with orthonormal eigenvectors, by a faster and more accurate symmetric algorithm', 'Different eigenvalues: `eigh` is an approximation of `eig`', 'Complex eigenvalues, which `eig` discards', 'Eigenvectors as rows instead of columns'],
      answer: 0,
      why: {
        1: 'Both compute the same eigenvalues (to round-off); `eigh` exploits the symmetry.',
        2: 'A real symmetric matrix has only real eigenvalues. It is `eig` that may return a complex array.',
        3: 'Both return eigenvectors as the columns of `V`.',
      },
      hints: ['A real symmetric matrix always has real eigenvalues and orthogonal eigenvectors.', 'Which routine is told about that symmetry?'],
      teach: 'Use `eigh` for symmetric (or Hermitian) matrices: sorted real eigenvalues and orthonormal eigenvectors, faster and more robustly than `eig`.',
      explain: t`\`eig\` treats $J$ as a general matrix: its eigenvalues come in no particular order and may be returned as a complex array with zero imaginary parts. \`eigh\` uses the symmetry — quantum Hamiltonians, inertia and stiffness matrices are all symmetric, so \`eigh\` is the default in physics.`,
    }),
    mcq({
      id: 'eigvec-columns', difficulty: 3,
      prompt: t`After \`w, V = np.linalg.eigh(J)\`, which expression is the eigenvector belonging to the smallest eigenvalue \`w[0]\`?

\`\`\`python
w, V = np.linalg.eigh(J)       # w ascending
\`\`\``,
      choices: ['`V[:, 0]`', '`V[0]`', '`V[0, 0]`', '`w[0] * V`'],
      answer: 0,
      why: {
        1: '`V[0]` is the first *row*. NumPy stores the eigenvectors as columns, so a row mixes components of all three.',
        2: 'That is a single number, one component of one eigenvector.',
        3: 'That scales the whole matrix; it is not a vector.',
      },
      hints: ['NumPy’s documentation: “the column `v[:, i]` is the eigenvector corresponding to the eigenvalue `w[i]`”.'],
      teach: 'Eigenvectors are the columns of `V`: pair `w[i]` with `V[:, i]`, and check with `J @ V[:, i] ≈ w[i] * V[:, i]`.',
      explain: t`\`V[:, 0]\` is the first column. A quick check that you have the right one: \`np.allclose(J @ V[:, 0], w[0] * V[:, 0])\` must be \`True\`. Rows and columns differ unless $V$ happens to be symmetric, so this slip often passes unnoticed on a nearly diagonal tensor.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-spin', difficulty: 3, transfer: true,
      prompt: t`A spacecraft is modelled as point masses \`m\` (kg) at positions \`pos\` (m): two solar panels, an antenna and a propellant tank. Build its inertia tensor \`J\` $= \sum_k m_k\left(r_k^2\,\mathbb 1 - \vec r_k\vec r_k^{\,T}\right)$, then set \`major\` to the unit vector of its axis of **largest** moment — the axis it will end up spinning about once flexible parts have dissipated energy.`,
      visual: {
        type: 'calc-vectors3d',
        params: { range: 1.7, points: satPoints(PANEL), segments: [{ from: [-1.5, 0.2, 0], to: [1.5, 0.2, 0], color: 'ink3', dash: true }] },
        caption: 'The four masses (drag to turn). The central bus sits at the origin, where it adds nothing to the tensor.',
      },
      starter: t`import numpy as np

m = np.array([${PANEL.map(([mm]) => mm).join(', ')}], dtype=float)                       # kg
pos = np.array([${PANEL.map(([, r]) => `[${r.join(', ')}]`).join(', ')}])   # m

J = None
major = None
`,
      answer: t`import numpy as np

m = np.array([${PANEL.map(([mm]) => mm).join(', ')}], dtype=float)                       # kg
pos = np.array([${PANEL.map(([, r]) => `[${r.join(', ')}]`).join(', ')}])   # m

J = sum(mk * (r @ r * np.eye(3) - np.outer(r, r)) for mk, r in zip(m, pos))
w, V = np.linalg.eigh(J)
major = V[:, -1]
print(w, major)`,
      tests: [
        { name: 'the inertia tensor', code: 'np.allclose(J, sum(mk * (np.dot(r, r) * np.eye(3) - np.outer(r, r)) for mk, r in zip(m, pos)))' },
        { name: 'a unit vector', code: 'abs(np.linalg.norm(major) - 1) < 1e-9' },
        { name: t`along the axis of the largest moment, ${E_PANEL.w[2].toFixed(2)} kg m²`, code: 'abs(abs(major @ np.linalg.eigh(J)[1][:, -1]) - 1) < 1e-9' },
      ],
      hints: ['For each mass: `mk * (r @ r * np.eye(3) - np.outer(r, r))`; add them up with `sum(...)`.', '`w, V = np.linalg.eigh(J)`; the largest eigenvalue is last, so its axis is the column `V[:, -1]`.'],
      teach: 'An inertia tensor is a sum of outer products; its eigenvectors are the principal axes and the largest eigenvalue marks the stable spin axis for a dissipating body.',
      explain: t`The moments are ${E_PANEL.w.map((x) => x.toFixed(2)).join(', ')} kg m², and the largest is about an axis close to $z$ — perpendicular to the plane of the panels and the tank's offset, as the long panel span suggests. The antenna and tank tilt it slightly. Spacecraft designers keep the intended spin axis the major axis for exactly the reason Explorer 1 taught.`,
    }),
    mcq({
      id: 'cp-cond', difficulty: 2,
      prompt: t`A fit to 12 polynomial terms builds a matrix that behaves like the 12 × 12 Hilbert matrix:

\`\`\`python
>>> np.linalg.cond(H)
1.8e+16
\`\`\`

What can you trust in the coefficients \`np.linalg.solve(H, y)\` returns?`,
      choices: ['Essentially none of their digits: 10⁻¹⁶ × 10¹⁶ is a relative error of order 1', 'All 16 digits, because `solve` is backward stable', 'About 12 digits, one lost per row', 'Everything, as long as no warning was printed'],
      answer: 0,
      why: {
        1: 'Backward stability means the answer exactly solves a *nearby* problem; with κ ≈ 10¹⁶, nearby problems have wildly different answers.',
        2: 'The loss is about log₁₀ κ ≈ 16 digits, not one per row.',
        3: 'NumPy warns only when a matrix is exactly singular to working precision; a silent answer can still be garbage.',
      },
      hints: [t`Relative error $\lesssim \kappa\times10^{-16}$.`],
      teach: 'When κ approaches 1/ε ≈ 10¹⁶ the computed answer carries no information — change the formulation (orthogonal polynomials, `lstsq`, scaling) rather than the solver.',
      explain: t`$\kappa\times\varepsilon \approx 10^{16}\times10^{-16} = 1$: the error can be as large as the answer. In the Explore run the $n = 12$ error was about 0.4 on coefficients of 1. Fitting with an orthogonal basis (\`np.polynomial.Polynomial.fit\` rescales the domain) keeps κ small.`,
    }),
    mcq({
      id: 'cp-singular', difficulty: 2,
      prompt: t`Two of the three equations describing a statics problem turn out to be the same equation written twice. What does \`solve\` do?

\`\`\`python
A = np.array([[1.0, 2.0, 1.0],
              [2.0, 4.0, 2.0],      # twice the first row
              [0.0, 1.0, 3.0]])
x = np.linalg.solve(A, np.array([1.0, 2.0, 0.5]))
\`\`\``,
      choices: ['It raises `LinAlgError: Singular matrix`: the equations do not pin down a unique answer', 'It returns the least-squares answer', 'It returns an answer with some entries set to `nan`', 'It quietly picks one of the infinitely many answers'],
      answer: 0,
      why: {
        1: 'That is `np.linalg.lstsq`, which you must call deliberately.',
        2: '`solve` never fills in `nan`; it refuses.',
        3: 'With an exactly singular matrix the factorization meets a zero pivot and stops. (A *nearly* singular one does return quietly — with a huge κ.)',
      },
      hints: ['Row 2 is twice row 1: there are only two independent equations for three unknowns.'],
      teach: 'An exactly singular matrix makes `solve` raise `LinAlgError`; a nearly singular one returns an untrustworthy answer silently, which is why you check κ.',
      explain: t`The second row adds no information, so there is a line of solutions and \`solve\` raises \`LinAlgError: Singular matrix\`. Physically it signals a missing constraint (a mechanism, a floating structure) — fix the model. If you perturb row 2 by $10^{-12}$ the error disappears and a meaningless answer comes back instead.`,
    }),
  ],
  sources: [
    { label: 'numpy.linalg (solve, inv, eigh, cond)', url: 'https://numpy.org/doc/stable/reference/routines.linalg.html' },
    { label: 'Newman, Computational Physics, ch. 6: Solution of linear and nonlinear equations', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Efroimsky (2001), Relaxation of wobbling asteroids and comets (the major-axis rule; Explorer 1)', url: 'https://arxiv.org/abs/astro-ph/0007325' },
  ],
});
