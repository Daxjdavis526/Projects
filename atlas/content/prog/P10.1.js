// Solving systems and eigenproblems numerically — assembling a matrix from
// a structure in a loop, np.linalg.solve on a truss, the generalized
// eigenproblem K v = ω² M v with scipy.linalg.eigh for normal modes (a launch
// vehicle's axial modes, a satellite on its adapter), the rigid-body zero
// mode, finite-difference eigenvalues, and banded solvers for big systems.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { seg } from './_numkit.js';
import { eigSym, eigGen, solve, chainK } from './_solvers.js';

const t = String.raw;

// ── the worked example's Warren truss: joints (m), members, 20 kN down at joint 1 ──
const NODES = [[0, 0], [4, 0], [8, 0], [2, 3], [6, 3]];
const MEMBERS = [[0, 1], [1, 2], [0, 3], [3, 1], [1, 4], [4, 2], [3, 4]];
const LOAD = 20e3;
const TRUSS = (() => {
  const A = Array.from({ length: 10 }, () => Array(10).fill(0)), b = Array(10).fill(0);
  MEMBERS.forEach(([p, q], j) => {
    const dx = NODES[q][0] - NODES[p][0], dy = NODES[q][1] - NODES[p][1], L = Math.hypot(dx, dy);
    A[2 * p][j] += dx / L; A[2 * p + 1][j] += dy / L; A[2 * q][j] -= dx / L; A[2 * q + 1][j] -= dy / L;
  });
  A[0][7] = 1; A[1][8] = 1; A[5][9] = 1; b[3] = LOAD;
  return solve(A, b);
})();
const kN = (x) => (x / 1e3).toFixed(2).replace(/^-/, '−').replace(/^−0\.00$/, '0.00');
const trussPic = (extra = []) => [
  ...MEMBERS.map(([p, q]) => seg(NODES[p][0], NODES[p][1], NODES[q][0], NODES[q][1], { color: 'ink2', width: 3 })),
  ...extra,
];

// ── the checkpoint's satellite on its adapter: fixed base, three masses ──
const SAT_M = [80, 900, 350], SAT_K = [3e8, 6e7, 2.5e7];
const SAT_KM = chainK(3, SAT_K.slice(1), { left: SAT_K[0] });
const SAT_F = eigGen(SAT_KM, SAT_M).w.map((w) => Math.sqrt(w) / (2 * Math.PI));
// the slip: eigvalsh on inv(M) @ K, which is not symmetric — LAPACK reads its lower triangle only
const INVMK = SAT_KM.map((r, i) => r.map((x) => x / SAT_M[i]));
const WRONG_F = eigSym(INVMK.map((r, i) => r.map((x, j) => (i >= j ? x : INVMK[j][i])))).w.map((w) => Math.sqrt(Math.abs(w)) / (2 * Math.PI));

// ── three equal masses between walls ──
const CM = 2, CK = 800;
const CHAIN_F = [2 - Math.SQRT2, 2, 2 + Math.SQRT2].map((x) => Math.sqrt((x * CK) / CM) / (2 * Math.PI));

// ── the particle in a box by finite differences (ħ = m = L = 1) ──
const NBOX = 1000, HBOX = 1 / (NBOX + 1);
const EFD = [1, 2, 3].map((k) => (1 - Math.cos(k * Math.PI * HBOX)) / (HBOX * HBOX));
const EEX = [1, 2, 3].map((k) => (k * k * Math.PI ** 2) / 2);

export default lesson({
  id: 'prog.P10.1',
  title: 'Solving systems and eigenproblems numerically',
  minutes: 13, difficulty: 3,
  intro: t`Lesson P3.3 met \`solve\` and \`eigh\` on small matrices typed by hand. Real models are **assembled**: a loop over the members of a truss or the springs of a structure adds each one's contribution to a big matrix, and then one call solves it. Two problems cover most of structural and vibration analysis:

$$K\vec u = \vec f \qquad\text{and}\qquad K\vec v = \omega^2 M\vec v$$

The first is statics: loads in, displacements or forces out (\`np.linalg.solve\`). The second, the **generalized eigenproblem**, gives the normal modes: each eigenvalue is a squared natural frequency, each eigenvector the shape the structure vibrates in. \`scipy.linalg.eigh(K, M)\` solves it directly, keeping both matrices symmetric.`,
  symbols: [
    { tex: 'K', text: 'the stiffness matrix (N/m): symmetric, assembled from every spring, member or finite element' },
    { tex: t`\vec u`, text: 'the unknowns of a static problem: displacements (m), or member forces and reactions (N)' },
    { tex: t`\vec f`, text: 'the applied loads (N)' },
    { tex: 'M', text: 'the mass matrix (kg): diagonal for lumped point masses, symmetric and positive definite in general' },
    { tex: t`\omega`, text: 'a natural angular frequency (rad/s); the frequency in hertz is $f = \\omega/2\\pi$' },
    { tex: t`\vec v`, text: 'a mode shape: the relative amplitudes with which the masses move in that mode' },
  ],
  why: 'Before a satellite flies, its finite-element model — often a million unknowns — is put through exactly these two calls: static loads at liftoff, and natural frequencies that must stay clear of the launcher’s.',
  visual: {
    type: 'code-runner',
    title: 'A launch vehicle’s axial modes',
    lead: t`Press **Run**. A rocket in flight is modelled as 11 masses in a column joined by springs (the tank walls and interstages), free at both ends. \`eigh(K, M)\` returns the squared frequencies and the mode shapes; the plot shows the first three elastic modes, each a standing wave of compression along the vehicle.`,
    tasks: [
      'Read the first frequency printed: it is essentially zero. That is the whole rocket moving as one — no spring stretched.',
      'Count the nodes (zero crossings) of each mode shape: one, two, three.',
      'Burn off propellant: halve the first six masses and run again. Every frequency rises — one reason pogo oscillations change during a burn.',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.linalg import eigh

m = np.array([45, 45, 45, 45, 45, 35, 12, 10, 8, 5, 3.0]) * 1e3   # kg, base to tip
k = np.full(len(m) - 1, 2e9)              # N/m: spring i joins masses i and i + 1
n = len(m)

K = np.zeros((n, n))                      # assemble: each spring adds a 2 × 2 block
for i, ki in enumerate(k):
    K[i:i+2, i:i+2] += ki * np.array([[1, -1], [-1, 1]])
M = np.diag(m)

w2, V = eigh(K, M)                        # K v = ω² M v, ω² ascending
f = np.sqrt(np.abs(w2)) / (2 * np.pi)     # abs(): the zero mode can come out as −1e-12
print("frequencies (Hz):", np.round(f[:5], 2))
print("is V M-orthonormal?", np.allclose(V.T @ M @ V, np.eye(n)))

fig, ax = plt.subplots()
for j in [1, 2, 3]:                        # skip mode 0, the rigid-body motion
    v = V[:, j] / np.abs(V[:, j]).max()
    ax.plot(v, np.arange(n), "o-", label=f"mode {j}: {f[j]:.1f} Hz")
ax.axvline(0, color="gray", lw=0.8)
ax.set_xlabel("axial displacement (normalized)")
ax.set_ylabel("mass number, base (0) to tip")
ax.legend()
plt.show()`,
    },
    caption: 'A lumped spring–mass column with invented but plausible masses and stiffnesses; real launch-vehicle models have thousands of elements, liquid propellant that sloshes, and modes that change as tanks empty.',
  },
  example: {
    prompt: t`A small Warren truss — say, a gantry walkway — has five pinned joints (numbered 0–4, positions in metres) and seven members. Joint 0 is pinned to the ground, joint 2 sits on a roller, and a ${LOAD / 1e3} kN load hangs from joint 1. Find every member force and the reactions by assembling the equilibrium equations and solving them.`,
    visual: {
      type: 'graph',
      params: { x: [-1, 9], y: [-2.6, 3.8], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'y (m)',
        curves: trussPic(),
        points: NODES.map(([x, y], i) => ({ x, y, color: 'gold', r: 5, label: String(i), labelDx: i === 3 || i === 0 ? -14 : 6, labelDy: y > 0 ? -6 : 16 })),
        arrows: [{ from: [4, 0], to: [4, -2.2], color: 'bad', label: '20 kN', labelDx: 6 }, { from: [0, -1.6], to: [0, -0.15], color: 'good' }, { from: [8, -1.6], to: [8, -0.15], color: 'good' }] },
      caption: 'The truss, its load (red) and the support reactions (green). Pin joints and weightless members are the usual idealization.',
    },
    steps: [
      { label: 'Choose the unknowns', text: t`Seven member tensions (positive = tension, negative = compression) and three reactions: horizontal and vertical at the pin, vertical at the roller. Ten unknowns; each of the 5 joints gives 2 equilibrium equations ($\sum F_x = 0$, $\sum F_y = 0$). Ten equations — a statically determinate truss.` },
      { label: 'Assemble in a loop', text: t`A member from joint $p$ to joint $q$ with tension $T$ pulls joint $p$ toward $q$ along the unit vector $\hat e$, and joint $q$ back along $-\hat e$. That is two entries per joint per member:

\`\`\`python
import numpy as np
nodes = np.array([[0, 0], [4, 0], [8, 0], [2, 3], [6, 3]], float)
members = [(0, 1), (1, 2), (0, 3), (3, 1), (1, 4), (4, 2), (3, 4)]
A = np.zeros((10, 10)); b = np.zeros(10)
for j, (p, q) in enumerate(members):
    e = (nodes[q] - nodes[p]) / np.linalg.norm(nodes[q] - nodes[p])
    A[2*p:2*p+2, j] += e
    A[2*q:2*q+2, j] -= e
A[0, 7] = A[1, 8] = A[5, 9] = 1     # reactions: pin x, pin y, roller y
b[3] = 20e3                          # joint 1, y: balances the 20 kN load
x = np.linalg.solve(A, b)
\`\`\`

Row $2p$ is joint $p$'s $x$ equation and row $2p + 1$ its $y$ equation; the load moves to the right-hand side with its sign flipped.` },
      { label: 'Read the answer', text: t`In kN: bottom chord members (0–1, 1–2) ${kN(TRUSS[0])} (tension); diagonals ${kN(TRUSS[2])}, ${kN(TRUSS[3])}, ${kN(TRUSS[4])}, ${kN(TRUSS[5])}; top chord (3–4) ${kN(TRUSS[6])} (compression); reactions ${kN(TRUSS[7])} horizontal, ${kN(TRUSS[8])} and ${kN(TRUSS[9])} vertical.` },
      { label: 'Sense check', text: t`By symmetry each support carries half the load, 10 kN. Each diagonal is $\sqrt{13}$ m long with a 3 m rise, so its vertical share is $${kN(Math.abs(TRUSS[2]))}\times3/\sqrt{13} = 10$ kN — it carries exactly the support's reaction up to the top. Moments about joint 1: the top chord, 3 m above, balances $10\ \text{kN}\times4\ \text{m}$, so it carries $40/3 = 13.33$ kN of compression. And \`np.abs(A @ x - b).max()\` is at round-off level.` },
    ],
    answer: t`Bottom chord ${kN(TRUSS[0])} kN tension, diagonals $\pm${kN(Math.abs(TRUSS[2]))}$ kN, top chord ${kN(-TRUSS[6])} kN compression, reactions 10 kN at each support.`,
  },
  practice: [
    num({
      id: 'hz', difficulty: 1,
      gen(r) {
        const lam = r.pick([2.5e3, 8.1e3, 3.6e4, 1.2e5, 4.4e5]);
        const f = Math.sqrt(lam) / (2 * Math.PI);
        const amp = r.pick([[1, 0.7, 0.3], [1, -0.4, -0.9], [0.5, 1, 0.6]]);
        return {
          prompt: t`\`w2, V = eigh(K, M)\` returns a smallest eigenvalue of $${tex(lam, 2)}$ (K in N/m, M in kg). What is the corresponding natural frequency in hertz?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 3.6], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'mass number', ylabel: 'mode amplitude', xticks: 3,
              curves: amp.map((a, i) => seg(i + 1, 0, i + 1, a, { color: 'accent', width: 3 })),
              points: amp.map((a, i) => ({ x: i + 1, y: a, color: 'gold', r: 6 })) },
            caption: 'An illustrative mode shape: how far each mass moves, relative to the others, in this mode.',
          },
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(lam), feedback: t`$\sqrt\lambda$ is the angular frequency $\omega$ in rad/s. Divide by $2\pi$ for hertz.` }, { value: lam / (2 * Math.PI), feedback: t`The eigenvalue is $\omega^2$: take the square root first.` }],
          hints: [t`The eigenvalues of $K\vec v = \omega^2 M\vec v$ are $\omega^2$, in $(\text{rad/s})^2$.`, t`$f = \sqrt{\lambda}/(2\pi)$.`],
          teach: 'eigh(K, M) returns ω²: take the square root for ω in rad/s, then divide by 2π for hertz.',
          explain: t`$\omega = \sqrt{${tex(lam, 2)}} = ${Math.sqrt(lam).toFixed(1)}$ rad/s, so $f = \omega/2\pi = ${f.toFixed(2)}$ Hz. Mixing up $\omega$, $\omega^2$ and $f$ shifts a frequency by a factor of $2\pi$ or more — enough to call a structure safe that is resonating with its launcher.`,
        };
      },
    }),
    code({
      id: 'chain3', difficulty: 2,
      prompt: t`Three equal masses $m = ${CM}$ kg sit in a line between two walls, joined to each other and to the walls by four springs of stiffness $k = ${CK}$ N/m. Build \`K\` and \`M\`, solve $K\vec v = \omega^2 M\vec v$ with \`scipy.linalg.eigh\`, and set \`freqs\` to the three natural frequencies in **hertz**, ascending.`,
      starter: t`import numpy as np
from scipy.linalg import eigh

m, k = ${CM}.0, ${CK}.0
K = None
M = None
freqs = None
`,
      answer: t`import numpy as np
from scipy.linalg import eigh

m, k = ${CM}.0, ${CK}.0
K = k * np.array([[2, -1, 0],
                  [-1, 2, -1],
                  [0, -1, 2]])
M = m * np.eye(3)
w2, V = eigh(K, M)
freqs = np.sqrt(w2) / (2 * np.pi)
print(freqs)`,
      tests: [
        { name: 'K is the 3 × 3 chain stiffness matrix', code: `np.allclose(K, ${CK} * np.array([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]))` },
        { name: t`frequencies ${CHAIN_F.map((f) => f.toFixed(3)).join(', ')} Hz`, code: `np.allclose(freqs, [${CHAIN_F.join(', ')}], rtol=1e-9)` },
      ],
      hints: ['Each mass has two springs attached, so the diagonal of K is 2k; neighbours are coupled by −k.', '`w2, V = eigh(K, M)`; then `freqs = np.sqrt(w2) / (2 * np.pi)`.'],
      teach: 'A chain’s stiffness matrix is tridiagonal: 2k on the diagonal for a mass held by two springs, −k between neighbours.',
      explain: t`The squared frequencies are $(2 - \sqrt2)k/m$, $2k/m$ and $(2 + \sqrt2)k/m$, giving ${CHAIN_F.map((f) => f.toFixed(3)).join(', ')} Hz. The slowest mode moves all three masses the same way, the middle one leaves the centre mass still, and the fastest swings neighbours against each other.`,
    }),
    mcq({
      id: 'zero-mode', difficulty: 2,
      prompt: t`A model of a rocket in flight (nothing holds it) prints

\`\`\`python
>>> w2, V = eigh(K, M); print(w2[:3])
[-3.4e-12  1.1e+04  3.5e+04]
\`\`\`

What is the first eigenvalue?`,
      choices: [
        'A rigid-body mode: the whole vehicle translating together, which stretches no spring, so ω = 0 exactly; −3.4 × 10⁻¹² is round-off',
        'A negative stiffness: the model is unstable and will buckle',
        'A bug: eigenvalues of a physical structure can never be zero',
        'The lowest vibration mode, at a very low but real frequency of about 10⁻⁶ Hz',
      ],
      answer: 0,
      why: {
        1: 'A real negative eigenvalue would be of the size of the others. At 10⁻¹² against 10⁴ it is zero to round-off.',
        2: 'A free structure must have a zero mode: nothing resists moving it as a whole.',
        3: 'Its square root is round-off noise, not a frequency; the exact value is 0.',
      },
      hints: ['What motion of a free rocket stretches none of its springs?', 'Compare the size of the first eigenvalue with the others.'],
      teach: 'A structure free in space has one zero eigenvalue per rigid-body motion (one for an axial column, six for a body in 3D); round-off makes them tiny and possibly negative.',
      explain: t`Moving every mass by the same amount leaves every spring unstretched: $K\vec v = 0$, so $\omega^2 = 0$. Round-off turns 0 into $\pm10^{-12}$, which is why the Explore code takes \`np.abs\` before the square root. A *clamped* structure (a satellite bolted to its adapter) has no such mode.`,
    }),
    mcq({
      id: 'eigh-inv', difficulty: 3,
      prompt: t`To get the satellite's frequencies a student turns the generalized problem into an ordinary one:

\`\`\`python
w_good = eigh(K, M, eigvals_only=True)
w_bad  = np.linalg.eigvalsh(np.linalg.inv(M) @ K)
\`\`\`

With masses ${SAT_M.join(', ')} kg, \`w_good\` gives a lowest frequency of ${SAT_F[0].toFixed(1)} Hz and \`w_bad\` ${WRONG_F[0].toFixed(1)} Hz, with no warning. Why?`,
      choices: [
        '$M^{-1}K$ is not symmetric when the masses differ, but `eigvalsh` assumes symmetry and reads only one triangle of the matrix',
        '`inv(M)` loses precision because the masses are large',
        'Both are right: they are two eigenvalue conventions differing by a factor',
        '`eigh(K, M)` is wrong because it ignores the mass matrix’s units',
      ],
      answer: 0,
      why: {
        1: 'Inverting a diagonal matrix of 80–900 kg is exact to round-off.',
        2: 'Kv = ω²Mv and M⁻¹Kv = ω²v have the same eigenvalues — when solved correctly. The ratio here is not a constant factor.',
        3: '`eigh(K, M)` is exactly the generalized problem; units are consistent if K is in N/m and M in kg.',
      },
      hints: ['Row i of M⁻¹K is row i of K divided by mᵢ. Is the result symmetric?', '`eigvalsh` and `eigh` never check symmetry: they read the lower triangle and assume the upper matches.'],
      teach: 'Hand eigh only symmetric matrices; for K v = ω² M v pass both to scipy.linalg.eigh(K, M) rather than forming M⁻¹K.',
      explain: t`Dividing row $i$ by $m_i$ destroys the symmetry, and \`eigvalsh\` silently symmetrizes from the lower triangle — a different matrix with different eigenvalues. Here the slip moves the first mode from ${SAT_F[0].toFixed(1)} Hz to ${WRONG_F[0].toFixed(1)} Hz: a design that passes a launcher's frequency requirement would wrongly fail it (or the reverse). \`eigh(K, M)\` keeps everything symmetric; \`np.linalg.eigvals(inv(M) @ K)\` would also be right, but slower and complex-typed.`,
    }),
    code({
      id: 'box', difficulty: 3,
      prompt: t`Finite differences turn a differential eigenproblem into a matrix one. For a particle in a box of width 1 (units with $\hbar = m = 1$), $-\tfrac12\psi'' = E\psi$ with $\psi = 0$ at the walls becomes, on $N = ${NBOX}$ interior points spaced $h = 1/(N + 1)$, a tridiagonal matrix with $1/h^2$ on the diagonal and $-1/(2h^2)$ beside it. Set \`E\` to its three lowest eigenvalues using \`scipy.linalg.eigh_tridiagonal\`, which takes just the diagonal and the off-diagonal.`,
      starter: t`import numpy as np
from scipy.linalg import eigh_tridiagonal

N = ${NBOX}
h = 1 / (N + 1)
E = None
`,
      answer: t`import numpy as np
from scipy.linalg import eigh_tridiagonal

N = ${NBOX}
h = 1 / (N + 1)
d = np.full(N, 1 / h**2)
e = np.full(N - 1, -1 / (2 * h**2))
E = eigh_tridiagonal(d, e, eigvals_only=True, select="i", select_range=(0, 2))
print(E, E / (np.pi**2 / 2))`,
      tests: [
        { name: t`three eigenvalues, ascending: ${EFD.map((x) => x.toFixed(4)).join(', ')}`, code: `len(E) == 3 and np.allclose(E, [${EFD.join(', ')}], rtol=1e-8)` },
        { name: t`within $10^{-5}$ of the exact $n^2\pi^2/2$`, code: 'np.allclose(E, np.array([1, 4, 9]) * np.pi**2 / 2, rtol=1e-5)' },
      ],
      hints: ['`d = np.full(N, 1 / h**2)` and `e = np.full(N - 1, -1 / (2 * h**2))`.', '`eigh_tridiagonal(d, e, eigvals_only=True)` returns all N eigenvalues, ascending; take the first three, or ask only for them with `select="i", select_range=(0, 2)`.'],
      teach: 'A finite-difference second derivative is a tridiagonal matrix, and tridiagonal eigenproblems have their own fast routine.',
      explain: t`The lowest three are ${EFD.map((x) => x.toFixed(5)).join(', ')}, against the exact ${EEX.map((x) => x.toFixed(5)).join(', ')}: errors of order $h^2$, growing like $n^4$ for higher levels as the wave gets too wiggly for the grid. A dense \`eigh\` of the full ${NBOX} × ${NBOX} matrix gives the same numbers, but stores a million entries to describe three thousand.`,
    }),
    mcq({
      id: 'banded', difficulty: 2,
      prompt: t`An implicit heat-conduction step through a heat shield needs $A\vec x = \vec b$ with $10^6$ unknowns, where $A$ is tridiagonal. Why not build $A$ with \`np.zeros((n, n))\` and call \`np.linalg.solve\`?

\`\`\`python
n = 1_000_000
A = np.zeros((n, n))      # ?
\`\`\``,
      choices: [
        'The dense matrix would need 8 TB of memory and the solve about $n^3 \\approx 10^{18}$ operations; `scipy.linalg.solve_banded` does it in $O(n)$ with three arrays',
        '`np.linalg.solve` refuses matrices larger than 1000 × 1000',
        'Tridiagonal matrices are always singular',
        'Dense solves are inaccurate for tridiagonal systems',
      ],
      answer: 0,
      why: {
        1: 'There is no size limit — only memory and time.',
        2: 'A diffusion matrix is diagonally dominant and comfortably non-singular.',
        3: 'The answer would be just as accurate; it would merely never finish.',
      },
      hints: ['How many bytes does a float64 take? How many entries has an n × n matrix?', 'How many of those entries are non-zero?'],
      teach: 'Store and solve structured matrices in a structured way: banded (solve_banded, eigh_tridiagonal) or sparse (scipy.sparse) — cost then grows like n, not n³.',
      explain: t`$10^{12}$ entries × 8 bytes = 8 TB, of which all but $3\times10^{6}$ are zero. \`solve_banded((1, 1), ab, b)\` takes the three diagonals as a $3\times n$ array and runs the Thomas algorithm in $O(n)$: milliseconds. For general sparse patterns (2D and 3D grids) use \`scipy.sparse\` and \`scipy.sparse.linalg.spsolve\`.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-sat', difficulty: 3, transfer: true,
      prompt: t`A launcher's user's guide asks that a satellite's first axial natural frequency, mounted on its adapter, be above **25 Hz**. Model the stack as three masses in a column — adapter ring ${SAT_M[0]} kg, bus ${SAT_M[1]} kg, instrument deck ${SAT_M[2]} kg — with the adapter bolted to a rigid launcher by a spring of $${tex(SAT_K[0], 2)}$ N/m, and springs of $${tex(SAT_K[1], 2)}$ and $${tex(SAT_K[2], 2)}$ N/m between adapter and bus and between bus and deck. Set \`f1\` to the first frequency in Hz and \`ok\` to whether it meets the requirement.`,
      visual: {
        type: 'graph',
        params: { x: [-2, 2], y: [-0.4, 3.6], equal: true, aspect: 'wide', axes: false, grid: false,
          curves: [seg(-1.2, 0, 1.2, 0, { color: 'ink3', width: 5 }), seg(0, 0, 0, 0.6, { color: 'accent2', width: 2, dash: true }), seg(0, 0.8, 0, 1.5, { color: 'accent2', width: 2, dash: true }), seg(0, 2.1, 0, 2.6, { color: 'accent2', width: 2, dash: true })],
          shade: [{ fn: '0.8', lower: '0.6', from: -0.5, to: 0.5, color: 'gold', alpha: 0.6 }, { fn: '2.1', lower: '1.5', from: -0.9, to: 0.9, color: 'gold', alpha: 0.6 }, { fn: '3.0', lower: '2.6', from: -0.6, to: 0.6, color: 'gold', alpha: 0.6 }],
          points: [{ x: 0.55, y: 0.7, r: 0, label: 'adapter', labelDx: 4 }, { x: 0.95, y: 1.8, r: 0, label: 'bus', labelDx: 4 }, { x: 0.65, y: 2.8, r: 0, label: 'instrument deck', labelDx: 4 }, { x: 1.25, y: 0, r: 0, label: 'launcher (rigid)', labelDx: 4 }] },
        caption: 'The three-mass model: blocks are masses, dashed lines springs. Lateral modes, which have their own requirement, are not modelled.',
      },
      starter: t`import numpy as np
from scipy.linalg import eigh

m = np.array([${SAT_M.join(', ')}.0])    # kg: adapter, bus, deck
k0, k1, k2 = ${SAT_K.map((x) => x.toExponential(1).replace('+', '')).join(', ')}   # N/m: base, adapter–bus, bus–deck

f1 = None
ok = None
`,
      answer: t`import numpy as np
from scipy.linalg import eigh

m = np.array([${SAT_M.join(', ')}.0])    # kg: adapter, bus, deck
k0, k1, k2 = ${SAT_K.map((x) => x.toExponential(1).replace('+', '')).join(', ')}   # N/m: base, adapter–bus, bus–deck

K = np.array([[k0 + k1, -k1, 0],
              [-k1, k1 + k2, -k2],
              [0, -k2, k2]])
w2, V = eigh(K, np.diag(m))
f1 = np.sqrt(w2[0]) / (2 * np.pi)
ok = f1 > 25
print(f"{f1:.2f} Hz", ok)`,
      tests: [
        { name: t`first axial frequency ${SAT_F[0].toFixed(2)} Hz`, code: `abs(f1 - ${SAT_F[0]}) < 1e-6` },
        { name: 'it meets the 25 Hz requirement', code: 'ok == True' },
      ],
      hints: ['The adapter is held by two springs (k0 below, k1 above); the bus by k1 and k2; the deck only by k2.', 'K = [[k0 + k1, −k1, 0], [−k1, k1 + k2, −k2], [0, −k2, k2]], M = np.diag(m).', '`w2, V = eigh(K, np.diag(m))`; `f1 = np.sqrt(w2[0]) / (2 * np.pi)`.'],
      teach: 'A clamped structure’s first eigenvalue of K v = ω² M v is its fundamental frequency — the number a launcher’s requirements are written against.',
      explain: t`The frequencies are ${SAT_F.map((f) => f.toFixed(1)).join(', ')} Hz; the first, ${SAT_F[0].toFixed(1)} Hz, passes with a margin of ${(SAT_F[0] - 25).toFixed(1)} Hz. In that mode the heavy bus and deck bounce together on the soft bus–deck and adapter springs. Requirements like this keep a spacecraft's modes away from the launcher's, so the two do not resonate.`,
    }),
    mcq({
      id: 'cp-orth', difficulty: 2,
      prompt: t`After \`w2, V = eigh(K, M)\`, which identity holds for the mode shapes (the columns of \`V\`)?

\`\`\`python
w2, V = eigh(K, M)
print(np.allclose(V.T @ V, np.eye(n)))        # ?
print(np.allclose(V.T @ M @ V, np.eye(n)))    # ?
\`\`\``,
      choices: ['$V^TMV = \\mathbf 1$: the modes are orthonormal with the mass matrix as the weight', '$V^TV = \\mathbf 1$, as for every call to eigh', 'Both, always', 'Neither: eigenvectors of a generalized problem are not orthogonal in any sense'],
      answer: 0,
      why: {
        1: 'That holds for the standard problem eigh(A). With a mass matrix the natural inner product is vᵀMv.',
        2: 'Only if M is a multiple of the identity (all masses equal).',
        3: 'They are orthogonal — weighted by M. That is what makes modal analysis work.',
      },
      hints: ['SciPy normalizes generalized eigenvectors so that vᵀ M v = 1.', 'Kinetic energy is ½ v̇ᵀ M v̇: the mass matrix is the natural weight.'],
      teach: 'Generalized eigenvectors are M-orthonormal (VᵀMV = 1, VᵀKV = diag(ω²)), which is what lets a structure’s motion be split into independent modes.',
      explain: t`\`eigh(K, M)\` returns $V$ with $V^TMV = \mathbf 1$ and $V^TKV = \operatorname{diag}(\omega^2)$. In the coordinates $\vec q = V^{-1}\vec u$, every mode is an independent oscillator — modal analysis. $V^TV$ is diagonal only when all masses are equal.`,
    }),
    num({
      id: 'cp-scale', difficulty: 2,
      gen(r) {
        const f0 = r.pick([28.6, 34.2, 41.5]), [ks, ms] = r.pick([[1.5, 1.2], [2, 0.8], [1.3, 1.5], [2, 1.5], [1.2, 0.9]]);
        const f = f0 * Math.sqrt(ks / ms);
        return {
          prompt: t`A redesign multiplies **every** stiffness in a satellite model by ${ks} (a thicker adapter and bus walls) and every mass by ${ms}. The old first frequency was ${f0} Hz. What is the new one?

\`\`\`python
w2_new = eigh(${ks} * K, ${ms} * M, eigvals_only=True)
\`\`\``,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: (f0 * ks) / ms, feedback: 'The eigenvalues are ω², so they scale by k/m; frequencies scale by its square root.' }, { value: f0 * Math.sqrt(ms / ks), feedback: 'Stiffer raises the frequency, heavier lowers it: √(k-factor / m-factor), not the other way round.' }],
          hints: [t`If $K\vec v = \omega^2 M\vec v$, then $(aK)\vec v = \tfrac{a}{b}\omega^2\,(bM)\vec v$.`, t`So $\omega$ scales by $\sqrt{a/b}$.`],
          teach: 'Scaling all stiffness by a and all mass by b scales every ω² by a/b and every frequency by √(a/b); the mode shapes do not change.',
          explain: t`$f = ${f0}\times\sqrt{${ks}/${ms}} = ${f.toFixed(1)}$ Hz. A check like this costs nothing and catches many bugs: if a program's frequencies do not scale this way, its $K$ or $M$ is assembled wrongly.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'SciPy reference: scipy.linalg.eigh (generalized problems), eigh_tridiagonal, solve_banded', url: 'https://docs.scipy.org/doc/scipy/reference/linalg.html' },
    { label: 'Hibbeler, Structural Analysis, ch. 3: the method of joints', url: 'https://www.pearson.com/en-us/subject-catalog/p/structural-analysis/P200000003429' },
    { label: 'Wijker, Spacecraft Structures (Springer 2008), ch. 4: natural frequencies and launcher requirements', url: 'https://doi.org/10.1007/978-3-540-75553-1' },
    { label: 'Newman, Computational Physics, §6.1–6.2: linear equations and eigenvalue problems', url: 'http://www-personal.umich.edu/~mejn/cp/' },
  ],
});
