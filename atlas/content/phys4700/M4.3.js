// Eigenfunctions and the spectrum (Griffiths & Schroeter §3.3). Discrete
// spectra: real eigenvalues, orthogonal eigenfunctions for distinct
// eigenvalues (Gram–Schmidt within a degenerate set), completeness — the
// Sturm–Liouville structure of −(ħ²/2m)ψ″ + Vψ = Eψ. Continuous spectra:
// f_p = e^{ipx/ħ}/√(2πħ) with ⟨f_p|f_p′⟩ = δ(p − p′), seen as the L → ∞ limit
// of sin(ΔkL/2)/(πΔk); g_y = δ(x − y); expansion f = ∫Φ(p) f_p dp. A
// finite-difference Hamiltonian as a Hermitian matrix (code). Hydrogen's
// series limits from R_H (CODATA 2022, phys2710/_constants.js).
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE, ME, C } from './_qm.js';
import { RH } from '../phys2710/_constants.js';
import { r6 } from './_wells.js';

const t = String.raw;
const RY_EV = (H * C * RH) / QE;                 // hcR_H in eV: 13.598…
/** erf by its Taylor series (ample for |x| < 3). */
function erf(x) {
  let s = 0, term = x;
  for (let n = 0; n < 80; n++) { s += term / (2 * n + 1); term *= -x * x / (n + 1); }
  return (2 / Math.sqrt(Math.PI)) * s;
}
const PHI = (z) => 0.5 * (1 + erf(z / Math.SQRT2));       // the standard normal CDF

/** The overlap of two plane waves cut off to a box of length L: sin(ΔkL/2)/(πΔk) against Δk. */
function sincPic(L, caption, { xr = 6, ymax } = {}) {
  return {
    type: 'graph',
    params: {
      x: [-xr, xr], y: [r6(-0.3 * L / (2 * Math.PI)), r6(ymax ?? 1.15 * L / (2 * Math.PI))], aspect: 'wide', xlabel: 'Δk = k′ − k (nm⁻¹)', ylabel: '⟨f(k)|f(k′)⟩ over the box (nm)', xticks: 6, yticks: 3, axesAt: 'edge',
      curves: [{ fn: `sin(${r6(L / 2)}*x)/(pi*x)`, color: 'accent', width: 2.4, samples: 3000 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M4.3',
  title: 'Eigenfunctions and the spectrum',
  minutes: 17, difficulty: 3,
  intro: t`The set of eigenvalues of an operator is its **spectrum**. When it is **discrete** — the energies of a well — the eigenfunctions are normalizable, those with different eigenvalues are orthogonal, and together they are complete, so any state is a sum $\sum c_nf_n$. The time-independent Schrödinger equation is a Sturm–Liouville problem, which is why every bound-state family you have met behaved this way. When the spectrum is **continuous** — momentum, position, a free particle’s energy — the eigenfunctions are not in Hilbert space at all, yet they still form a basis, with sums becoming integrals and $\delta_{mn}$ becoming a Dirac delta:

$$f_p(x) = \frac{e^{ipx/\hbar}}{\sqrt{2\pi\hbar}}, \qquad \langle f_p|f_{p'}\rangle = \delta(p - p'), \qquad \psi(x) = \int\Phi(p)\,f_p(x)\,dp$$`,
  symbols: [
    { tex: 'f_p(x)', text: t`the eigenfunction of $\hat p$ with eigenvalue $p$ (any real number), in $(\text{J s m})^{-1/2}$` },
    { tex: '\\delta(p - p\')', text: t`the Dirac delta: zero unless $p = p'$, with unit area — “Dirac orthonormality”` },
    { tex: '\\Phi(p) = \\langle f_p|\\psi\\rangle', text: t`the momentum-space wave function: $|\Phi(p)|^2dp$ is the probability of finding momentum in $[p, p + dp]$` },
    { tex: '\\hbar', text: 'the reduced Planck constant, in J s' },
    { tex: 'p', text: t`the momentum eigenvalue, in kg m/s; for a free particle $p = \hbar k$` },
  ],
  why: 'Every measurement probability is a squared component along an eigenbasis — discrete like atomic levels or continuous like a momentum spectrum — and real systems, from hydrogen to a finite well, have both.',
  visual: {
    type: 'graph',
    title: 'How a delta function is made',
    lead: t`Two plane waves $e^{ikx}/\sqrt{2\pi}$ and $e^{ik'x}/\sqrt{2\pi}$, overlapped not over all space but over a box of length $L$. The result depends only on $\Delta k = k' - k$. Make the box longer.`,
    tasks: [
      'At L = 5 nm the overlap is a broad bump: plane waves with nearby k are far from orthogonal over a short box.',
      'Raise L: the peak at Δk = 0 grows as L/2π while its first zeros close in at ±2π/L. The area under the curve stays 1.',
      'At L = 100 nm the curve is a spike: in the limit it becomes δ(k′ − k) — orthogonal for different k, infinite for equal k.',
    ],
    params: {
      x: [-6, 6], y: [-4, 17], aspect: 'wide', xlabel: 'Δk = k′ − k (nm⁻¹)', ylabel: 'overlap (nm)', xticks: 6, yticks: 4, axesAt: 'edge',
      sliders: [{ key: 'L', label: 'Box length $L$', min: 5, max: 100, step: 1, value: 40, unit: '\\text{nm}', explain: 'The length over which the two plane waves are compared.' }],
      curves: [{ fn: 'sin(L*x/2)/(pi*x)', color: 'accent', width: 2.4, samples: 4000 }],
      shade: [{ fn: 'sin(L*x/2)/(pi*x)', from: -6, to: 6, color: 'accent', alpha: 0.15 }],
      readouts: [
        { label: 'peak height $L/2\\pi$ (nm)', expr: 'L/(2*pi)', digits: 3 },
        { label: 'first zero $2\\pi/L$ (nm⁻¹)', expr: '2*pi/L', digits: 3 },
      ],
    },
    caption: t`Exact: $\tfrac{1}{2\pi}\int_{-L/2}^{L/2}e^{i\Delta k\,x}dx = \dfrac{\sin(\Delta k\,L/2)}{\pi\,\Delta k}$, whose area over all $\Delta k$ is 1 for every $L$. The tall peak runs off the top at large $L$.`,
  },
  example: {
    prompt: t`(a) Show that a Hermitian operator’s eigenvalues are real and that eigenfunctions with different eigenvalues are orthogonal. (b) Find the eigenfunctions of $\hat p$ and show $\langle f_p|f_{p'}\rangle = \delta(p - p')$. (c) What are the eigenfunctions of $\hat x$?`,
    visual: sincPic(30, 'The overlap of two plane waves over a 30 nm box: already a narrow spike of unit area.', { xr: 3 }),
    steps: [
      { label: 'Real eigenvalues', text: t`If $\hat Qf = qf$: $q\langle f|f\rangle = \langle f|\hat Qf\rangle = \langle\hat Qf|f\rangle = q^*\langle f|f\rangle$. Since $\langle f|f\rangle \ne 0$, $q = q^*$.` },
      { label: 'Orthogonality', text: t`If $\hat Qg = q'g$ too: $q'\langle f|g\rangle = \langle f|\hat Qg\rangle = \langle\hat Qf|g\rangle = q\langle f|g\rangle$ (with $q$ real). So $(q' - q)\langle f|g\rangle = 0$: different eigenvalues force $\langle f|g\rangle = 0$. Equal (degenerate) eigenvalues guarantee nothing — orthogonalize them by Gram–Schmidt.` },
      { label: 'Momentum eigenfunctions', text: t`$-i\hbar f' = pf$ gives $f_p = Ae^{ipx/\hbar}$. For complex $p$ it would blow up on one side, so the spectrum is every **real** $p$ — continuous, and real as promised. But $\int|f_p|^2dx = \infty$: no $f_p$ is in Hilbert space.` },
      { label: 'Dirac orthonormality', text: t`$\langle f_p|f_{p'}\rangle = |A|^2\int e^{i(p'-p)x/\hbar}dx = |A|^2\,2\pi\hbar\,\delta(p' - p)$, using $\int e^{iux}dx = 2\pi\delta(u)$ — the box limit in the Explore picture. Choosing $A = 1/\sqrt{2\pi\hbar}$ gives $\delta(p - p')$.` },
      { label: 'Completeness', text: t`Any $\psi$ in Hilbert space is $\int\Phi(p)f_p(x)\,dp$ with $\Phi(p) = \langle f_p|\psi\rangle$ — Fourier’s theorem — and $\int|\Phi|^2dp = \int|\psi|^2dx = 1$. $|\Phi(p)|^2$ is a probability **density** in momentum.` },
      { label: 'Position', text: t`$\hat xg_y = yg_y$ means $(x - y)g_y(x) = 0$ for all $x$: $g_y$ is zero except at $x = y$. The normalized choice is $g_y(x) = \delta(x - y)$, with $\langle g_y|g_{y'}\rangle = \delta(y - y')$ and $\langle g_y|\psi\rangle = \psi(y)$. The wave function is just the state’s components in the position basis.` },
    ],
    answer: t`Real eigenvalues and orthogonal eigenfunctions follow from $\langle f|\hat Qg\rangle = \langle\hat Qf|g\rangle$; $f_p = e^{ipx/\hbar}/\sqrt{2\pi\hbar}$ with $\langle f_p|f_{p'}\rangle = \delta(p - p')$; $g_y = \delta(x - y)$.`,
  },
  practice: [
    mcq({
      id: 'degenerate', difficulty: 2,
      prompt: t`Both $\cos kx$ and $e^{ikx}$ are eigenfunctions of $d^2/dx^2$, a Hermitian operator (on a ring of length $2\pi/k$), with the same eigenvalue $-k^2$. Their overlap $\int_0^{2\pi/k}\cos kx\,e^{ikx}dx = \pi/k$ is not zero. Is something wrong?`,
      visual: { type: 'graph', params: { x: [0, 6.2832], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'kx', ylabel: '', xticks: 4, yticks: 2, axesAt: 'edge', curves: [{ fn: 'cos(x)', color: 'accent', width: 2.4 }, { fn: 'sin(x)', color: 'warn', width: 2, dash: [6, 4] }], legend: [{ label: 'cos kx', color: 'accent' }, { label: 'sin kx', color: 'warn', dash: [6, 4] }], legendAt: 'tr' }, caption: t`$\cos kx$ and $\sin kx$, both with eigenvalue $-k^2$ of $d^2/dx^2$; $e^{ikx} = \cos kx + i\sin kx$.` },
      choices: [
        t`No: the eigenvalue is degenerate, and orthogonality is guaranteed only between different eigenvalues; Gram–Schmidt within the pair restores it`,
        t`Yes: $d^2/dx^2$ cannot be Hermitian`,
        t`Yes: the overlap integral must have been computed wrongly`,
        t`No: eigenfunctions of Hermitian operators are never orthogonal unless they are real`,
      ],
      answer: 0,
      why: {
        1: t`On a ring the boundary terms cancel, and two integrations by parts make $d^2/dx^2$ Hermitian.`,
        2: t`$\int_0^{2\pi/k}\cos kx\,(\cos kx + i\sin kx)\,dx = \pi/k + 0$: the overlap is right.`,
        3: t`$e^{ikx}$ and $e^{-ikx}$ are complex and orthogonal; reality has nothing to do with it.`,
      },
      hints: ['Look again at the proof: where did it divide by (q′ − q)?', 'Any combination of two eigenfunctions with the same eigenvalue is again an eigenfunction.'],
      teach: 'Eigenfunctions with distinct eigenvalues are orthogonal; within a degenerate eigenvalue you choose an orthogonal set yourself.',
      explain: t`The proof gives $(q' - q)\langle f|g\rangle = 0$, which says nothing when $q' = q$. The pair $\{\cos kx, \sin kx\}$, or $\{e^{ikx}, e^{-ikx}\}$, is an orthogonal choice for the same two-dimensional eigenspace.`,
    }),
    multi({
      id: 'spectra', difficulty: 2,
      prompt: t`Which of these operators have a **continuous** spectrum (at least in part)? Select all that do.`,
      visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'finite', V0: 2, L: 1, n: 1, show: 'psi', controls: false, readout: false, panels: ['energy'] }, caption: 'A finite well: a few discrete levels below the top. Above the top, every energy is allowed.' },
      choices: [t`$\hat H$ of a free particle`, t`$\hat p$ on the whole line`, t`$\hat x$`, t`$\hat H$ of a finite square well`, t`$\hat H$ of the infinite square well`, t`$\hat H$ of the harmonic oscillator`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`$E_n = n^2\pi^2\hbar^2/2mL^2$: purely discrete. The walls never let the particle escape.`,
        5: t`$E_n = (n + \tfrac12)\hbar\omega$: purely discrete. The potential rises without limit.`,
      },
      hints: ['A continuous spectrum belongs to states that are not normalizable: particles that can escape to infinity.', 'The finite well has bound states below its top and scattering states above it.'],
      teach: 'Bound states give discrete eigenvalues; states free to reach infinity give a continuum. Many Hamiltonians have both.',
      explain: t`Free particle: every $E \ge 0$. $\hat p$: every real $p$. $\hat x$: every real $x$. Finite well: discrete levels below $V_0$, a continuum above. The infinite well and the oscillator confine every state, so their spectra are discrete.`,
    }),
    num({
      id: 'ring-spacing', difficulty: 2,
      gen(r) {
        const L = r.pick([0.1, 1, 10]), E = r.pick([0.1, 1, 5]);     // μm, eV
        const v = Math.sqrt((2 * E * QE) / ME);
        const ans = ((H * v) / (L * 1e-6)) / QE * 1e3;              // meV
        return {
          prompt: t`An electron moves round a ring $${L}\ \mu\text{m}$ in circumference. Its momenta are $p_n = nh/L$, a discrete set. Near a kinetic energy of ${E} eV (speed $${tex(v, 3)}$ m/s), how far apart are neighbouring energy levels, in meV? (Use $\Delta E \approx v\,\Delta p$.)`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.1], aspect: 'wide', xlabel: 'energy (arbitrary units)', ylabel: '', xticks: 0, yticks: 0, axesAt: 'edge', curves: Array.from({ length: 40 }, (_, j) => { const e = 0.25 * j * j / 16; return { param: [`${r6(e)}`, 't'], t: [0, 1], color: 'accent', width: 1.4 }; }).filter((c) => +c.param[0] <= 10) }, caption: 'Levels pₙ²/2m for successive n: the spacing grows with energy, and shrinks as the ring grows. Schematic.' },
          answer: ans, units: 'meV', tol: { rel: 0.01 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`On a ring $\Delta p = h/L$, not $2\pi h/L$.` }, { value: ans / (2 * Math.PI), feedback: t`$\Delta p = h/L$ — use $h$, not $\hbar$.` }],
          hints: [t`$\Delta p = h/L$ between neighbours.`, t`$\Delta E \approx v\,\Delta p = vh/L$; convert J to meV.`],
          teach: 'A box or ring makes momentum discrete with spacing h/L; as L grows the spectrum crowds into a continuum.',
          explain: t`$\Delta E = vh/L = ${tex(v, 3)}\times${tex(H, 4)}/${tex(L * 1e-6, 2)} = ${fmt(ans, 3)}$ meV. For a ring a metre long it would be a million times smaller: the free-particle continuum is the limit of an ever-larger box, which is why “box normalization” is a common working trick.`,
        };
      },
    }),
    num({
      id: 'delta-zero', difficulty: 2,
      gen(r) {
        const L = r.pick([5, 10, 20, 50]);
        const ans = (2 * Math.PI) / L;
        return {
          prompt: t`Over a box of length $L = ${L}$ nm, two normalized plane waves $e^{ikx}/\sqrt{2\pi}$ and $e^{ik'x}/\sqrt{2\pi}$ have overlap $\dfrac{\sin(\Delta k\,L/2)}{\pi\,\Delta k}$. At what smallest $\Delta k > 0$, in nm⁻¹, are they exactly orthogonal over the box?`,
          visual: sincPic(L, t`The overlap over a ${L} nm box against $\Delta k$.`, { xr: Math.max(2, 12 / L * 2) }),
          answer: ans, units: 'nm^-1', tol: { rel: 0.005 },
          errors: [{ value: Math.PI / L, feedback: t`$\sin(\Delta k\,L/2) = 0$ first at $\Delta k\,L/2 = \pi$.` }, { value: L / (2 * Math.PI), feedback: t`That is the peak height (in nm). The zero is at $\Delta k = 2\pi/L$.` }],
          hints: [t`Set $\sin(\Delta k\,L/2) = 0$ with $\Delta k \ne 0$.`, t`$\Delta k\,L/2 = \pi$.`],
          teach: 'Over a box of length L, plane waves are orthogonal when their wavenumbers differ by a multiple of 2π/L — the box’s allowed momenta.',
          explain: t`$\Delta k = 2\pi/${L} = ${fmt(ans, 4)}\ \text{nm}^{-1}$. Those are exactly the spacings of the periodic box: the discrete basis it supports is orthonormal, and as $L \to \infty$ it merges into the delta-normalized continuum.`,
        };
      },
    }),
    code({
      id: 'fd-hamiltonian', difficulty: 3,
      prompt: t`A Hamiltonian as a matrix. On a grid $x_j$ with spacing $h$, $\psi''(x_j) \approx (\psi_{j+1} - 2\psi_j + \psi_{j-1})/h^2$, so $\hat H = -\tfrac12\,d^2/dx^2 + V(x)$ (units with $\hbar = m = 1$) becomes a real symmetric tridiagonal matrix: $1/h^2 + V_j$ on the diagonal and $-1/(2h^2)$ beside it, with $\psi = 0$ beyond the ends. Write \`hamiltonian(V)\` returning that matrix for the potential array \`V\` on the grid \`x\` given, and \`levels(V, n)\` returning the lowest \`n\` eigenvalues and eigenvectors from \`np.linalg.eigh\`. For the oscillator $V = \tfrac12x^2$ the exact energies are $n + \tfrac12$.`,
      starter: t`import numpy as np

x = np.linspace(-10, 10, 1201)[1:-1]     # interior points; psi = 0 at +-10
h = x[1] - x[0]

def hamiltonian(V):
    pass

def levels(V, n):
    pass

E, vecs = levels(0.5 * x**2, 5)
print(E)
`,
      answer: t`import numpy as np

x = np.linspace(-10, 10, 1201)[1:-1]     # interior points; psi = 0 at +-10
h = x[1] - x[0]

def hamiltonian(V):
    N = len(V)
    main = 1 / h**2 + V
    off = -0.5 / h**2 * np.ones(N - 1)
    return np.diag(main) + np.diag(off, 1) + np.diag(off, -1)

def levels(V, n):
    E, vecs = np.linalg.eigh(hamiltonian(V))
    return E[:n], vecs[:, :n]

E, vecs = levels(0.5 * x**2, 5)
print(E)`,
      tests: [
        { name: 'the matrix is symmetric (Hermitian)', code: 'np.allclose(hamiltonian(0.5 * x**2), hamiltonian(0.5 * x**2).T)' },
        { name: t`the oscillator’s lowest five levels are $0.5, 1.5, \dots, 4.5$ to $10^{-3}$`, code: 'np.allclose(levels(0.5 * x**2, 5)[0], np.arange(5) + 0.5, atol=1e-3)' },
        { name: 'the eigenvectors are orthonormal', code: 'np.allclose(levels(0.5 * x**2, 5)[1].T @ levels(0.5 * x**2, 5)[1], np.eye(5), atol=1e-10)' },
        { name: t`a box ($V = 0$, walls at $\pm10$) gives $n^2\pi^2/(2\cdot20^2)$`, code: 'np.allclose(levels(0 * x, 3)[0], (np.arange(1, 4) * np.pi)**2 / (2 * 20**2), rtol=1e-3)' },
        { name: 'the ground state of the oscillator has no node', code: 'np.all(levels(0.5 * x**2, 1)[1][:, 0] > -1e-12) or np.all(levels(0.5 * x**2, 1)[1][:, 0] < 1e-12)' },
      ],
      hints: ['`np.diag(v, 1)` puts v just above the diagonal and `np.diag(v, -1)` just below.', '`np.linalg.eigh` returns eigenvalues in ascending order and eigenvectors as columns; slice the first n of each.'],
      teach: 'Discretized, a Hamiltonian is a real symmetric matrix: its eigenvalues are real and its eigenvectors orthonormal, as the theorem promises.',
      explain: t`The matrix is Hermitian by construction, so \`eigh\` returns real energies and orthonormal vectors. The oscillator’s come out at $0.5000, 1.5000, 2.4999, \dots$; the error, from the finite grid, grows with $n$ as the states get wigglier. Any 1D potential can be dropped in — this is how the double well of [the mp-schrodinger explorer](#/explore/mp-schrodinger) is solved.`,
    }),
    mcq({
      id: 'no-eigen', difficulty: 2, kind: 'error',
      prompt: t`A student argues: “The eigenfunctions of $\hat p$, $e^{ipx/\hbar}$, are not in Hilbert space. So no physical state has a momentum eigenfunction, $\hat p$ has no eigenvalues, and momentum cannot really be measured.” What is the flaw?`,
      visual: sincPic(40, 'Plane waves are orthonormal only in the delta-function sense: the overlap becomes a spike, not a 1.', { xr: 2 }),
      choices: [
        t`$\hat p$ has a continuous spectrum: its eigenfunctions are a delta-normalized basis, and a measurement finds momentum in a range $dp$ with probability $|\Phi(p)|^2dp$`,
        t`Nothing; only discrete observables can be measured`,
        t`The plane waves are in Hilbert space if normalized with $1/\sqrt{2\pi\hbar}$`,
        t`Momentum is measured as $\langle p\rangle$, which needs no eigenfunctions`,
      ],
      answer: 0,
      why: {
        1: 'Time-of-flight spectrometers measure momentum distributions every day; they record |Φ(p)|² binned in ranges of p.',
        2: t`$1/\sqrt{2\pi\hbar}$ gives Dirac normalization, $\langle f_p|f_{p'}\rangle = \delta(p - p')$; $\int|f_p|^2dx$ is still infinite.`,
        3: t`A single measurement gives one value, not an average; its probabilities come from the components $\Phi(p) = \langle f_p|\psi\rangle$.`,
      },
      hints: [t`What does $\Phi(p) = \langle f_p|\psi\rangle$ mean for a normalizable $\psi$?`, 'Must an eigenfunction itself be a physical state for its eigenvalue to be a possible result?'],
      teach: 'For a continuous spectrum, the eigenfunctions are a basis but not states; probabilities become densities.',
      explain: t`Every real $p$ is in the spectrum. A physical state is a packet $\psi = \int\Phi(p)f_p\,dp$, and a measurement gives a value in $[p, p + dp]$ with probability $|\Phi(p)|^2dp$. Exact single values have zero probability — which no instrument could resolve anyway.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-x-eigen', difficulty: 2,
      prompt: t`What is the eigenfunction of the position operator $\hat x$ with eigenvalue $y$?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 4.5], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: '4*exp(-(x - 1)^2/(2*0.01))', color: 'accent', width: 2.4, samples: 3000 }, { fn: '1*exp(-(x - 1)^2/(2*0.09))', color: 'violet', width: 2, dash: [6, 4], samples: 2000 }], vlines: [{ x: 1, color: 'ink3', label: 'x = y' }] }, caption: 'Ever-narrower peaks of unit area at x = y. Schematic.' },
      choices: [t`$\delta(x - y)$`, t`$e^{iyx/\hbar}$`, t`A Gaussian centred on $y$`, t`The constant function`],
      answer: 0,
      why: {
        1: t`That is a momentum eigenfunction (with $p = y$); multiplying it by $x$ does not give $y$ times it.`,
        2: t`A Gaussian of any width has $\sigma_x > 0$: position is not determinate. Only the zero-width limit is.`,
        3: t`$x\cdot1 = y\cdot1$ fails everywhere except at $x = y$.`,
      },
      hints: [t`$\hat xg = yg$ means $(x - y)g(x) = 0$ for every $x$.`, 'A function that is zero everywhere except at one point, with unit area.'],
      teach: 'Position eigenfunctions are delta functions; the wave function ψ(y) is the state’s component along δ(x − y).',
      explain: t`$(x - y)\delta(x - y) = 0$ everywhere, so $\hat x\,\delta(x - y) = y\,\delta(x - y)$. Like the plane waves, these are not normalizable, but $\langle\delta_y|\psi\rangle = \psi(y)$.`,
    }),
    num({
      id: 'cp-negative-p', difficulty: 3,
      gen(r) {
        const k0s = r.pick([0.25, 0.5, 0.75, 1]);
        const ans = PHI(-2 * k0s);
        return {
          prompt: t`A Gaussian packet $\psi \propto e^{-x^2/4\sigma^2}e^{ik_0x}$ with $k_0\sigma = ${k0s}$ is moving to the right. Its momentum-space wave function is a Gaussian centred on $\hbar k_0$ with standard deviation $\hbar/2\sigma$. What is the probability that a momentum measurement gives a **negative** value?`,
          visual: { type: 'graph', params: { x: [-3, 5], y: [0, 0.45], aspect: 'wide', xlabel: 'p (units of ħ/2σ)', ylabel: '|Φ(p)|²', xticks: 8, yticks: 0, axesAt: 'edge', curves: [{ fn: `exp(-(x - ${2 * k0s})^2/2)/sqrt(2*pi)`, color: 'accent', width: 2.4 }], shade: [{ fn: `exp(-(x - ${2 * k0s})^2/2)/sqrt(2*pi)`, from: -3, to: 0, color: 'gold', alpha: 0.45 }] }, caption: 'The momentum distribution; the negative-momentum part is shaded.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: PHI(-k0s), feedback: t`The momentum spread is $\hbar/2\sigma$, so $\hbar k_0$ lies $2k_0\sigma$ standard deviations above zero.` }, { value: 1 - ans, feedback: 'That is the probability of a positive momentum.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`In units of the spread $\hbar/2\sigma$, the centre is at $2k_0\sigma = ${2 * k0s}$.`, t`$P(p < 0) = \Phi_{\text{normal}}(-${2 * k0s})$, the normal distribution’s tail below $-${2 * k0s}$ standard deviations.`],
          teach: t`Momentum probabilities are areas under $|\Phi(p)|^2$, the squared components along the continuous momentum basis.`,
          explain: t`$P(p < 0) = ${fmt(ans, 3)}$. A packet whose centre moves right still contains left-moving components; for a well-defined direction you need $k_0\sigma \gg 1$ — many wavelengths inside the packet.`,
        };
      },
    }),
    num({
      id: 'cp-series-limit', difficulty: 2, transfer: true,
      gen(r) {
        const [n, name, where] = r.pick([[1, 'Lyman', 'the far ultraviolet, where interstellar hydrogen absorbs everything shortward of it'], [2, 'Balmer', 'the near ultraviolet, where hot stars show the “Balmer jump”'], [3, 'Paschen', 'the near infrared']]);
        const ans = (n * n) / RH * 1e9;
        return {
          prompt: t`Hydrogen’s Hamiltonian has a discrete spectrum of bound states, $E_n = -hcR_H/n^2$, and a continuum of unbound ones above $E = 0$. Transitions from the continuum down to level $n = ${n}$ produce the continuous emission and absorption beyond the ${name} series limit, in ${where}. At what wavelength does that continuum begin? ($R_H = ${tex(RH, 9)}\ \text{m}^{-1}$.)`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-14, 3], aspect: 'wide', xlabel: '', ylabel: 'energy (eV)', xticks: 0, yticks: 4, axesAt: 'edge', curves: [...[1, 2, 3, 4, 5, 6].map((k) => ({ param: ['0.1 + 0.8*t', String(r6(-RY_EV / (k * k)))], t: [0, 1], color: k === n ? 'gold' : 'accent', width: k === n ? 3 : 1.8 })), { param: ['0.1 + 0.8*t', '0'], t: [0, 1], color: 'ink2', width: 1.5 }], shade: [{ fn: '3', lower: '0', from: 0.1, to: 0.9, color: 'violet', alpha: 0.25 }], points: [{ x: 0.5, y: 1.5, r: 0, color: 'violet', label: 'continuum: every E > 0', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: 'Hydrogen’s spectrum: discrete levels below zero (the one in question in gold) and a continuum above. Energies to scale; the levels crowd toward 0.' },
          answer: ans, units: 'nm', tol: { rel: 0.002 },
          errors: [{ value: ans / (n * n) / (1 / (n * n) - 1 / ((n + 1) * (n + 1))), feedback: t`That is the series’ first line, not its limit: the limit is the jump from $E = 0$, $\lambda = n^2/R_H$.` }, { value: 1e9 / RH / n, feedback: t`The energy gap is $hcR_H/n^2$, so $\lambda = n^2/R_H$ — the square of $n$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`The continuum begins at $E = 0$, a gap of $hcR_H/n^2$ above level $n$.`, t`$\lambda = n^2/R_H$.`],
          teach: 'An atom’s Hamiltonian has a discrete and a continuous spectrum; the boundary between them shows up as a series limit followed by a continuum.',
          explain: t`$\lambda = ${n * n}/(${tex(RH, 7)})\ \text{m}^{-1} = ${fmt(ans, 4)}$ nm (in vacuum). Shortward of it, absorption is continuous: ionization into the continuum of free-electron states. The discrete lines and the continuum are the two halves of one spectrum.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (Rydberg constant, proton–electron mass ratio)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
