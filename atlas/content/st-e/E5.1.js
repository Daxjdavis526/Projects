// Self-adjoint operators: the Lagrange identity and its boundary term, which
// boundary conditions kill it (Dirichlet, Neumann, Robin, periodic) and which
// do not; real eigenvalues and orthogonal eigenfunctions in two lines each;
// d/dx versus i d/dx; weights; and why open (outgoing-wave) problems are not
// self-adjoint.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
// Robin roots: μ cos μ + h sin μ = 0, X = sin μx on [0, 1] with X(0) = 0, X′(1) + hX(1) = 0
const bis = (f, a, b) => { for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
const robin = (h, k) => bis((m) => m * Math.cos(m) + h * Math.sin(m), PI / 2 + 1e-9 + k * PI, PI + k * PI - 1e-9);
const M1 = robin(2, 0), M2 = robin(2, 1);
const overlap = (a, b) => { const n = 4000, d = 1 / n; let s = 0; for (let i = 0; i <= n; i++) s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * Math.sin(a * i * d) * Math.sin(b * i * d); return (s * d) / 3; };

export default lesson({
  id: 'st-e.E5.1',
  title: 'Self-adjoint operators',
  minutes: 15, difficulty: 3,
  intro: t`A real symmetric matrix has real eigenvalues and perpendicular eigenvectors because $\langle A\mathbf u, \mathbf v\rangle = \langle\mathbf u, A\mathbf v\rangle$. The differential operator $Lu = -(p\,u')' + q\,u$ (with $p > 0$ and $q$ real) almost has that property: integrate by parts twice and everything moves across **except a boundary term** — the Lagrange identity

$$\int_a^b\big(\bar v\,Lu - u\,\overline{Lv}\big)\,dx = \Big[\,p\,\big(u\,\bar v' - u'\,\bar v\big)\Big]_a^b .$$

$L$ is **self-adjoint** on a space of functions when that bracket vanishes for every pair in the space — and the space is fixed by the **boundary conditions**. Dirichlet ($u = 0$), Neumann ($u' = 0$), Robin ($u' + hu = 0$, $h$ real) at each end, or periodic ends, all kill it. Then two lines prove that every eigenvalue is real and that eigenfunctions of different eigenvalues are orthogonal — the theorem behind every Fourier-type expansion in physics. The operator is half the story; the boundary conditions are the other half.`,
  symbols: [
    { tex: 'L', text: 'the Sturm–Liouville operator $Lu = -(p\\,u\')\' + q\\,u$' },
    { tex: 'p(x),\\ q(x)', text: 'real coefficient functions on $[a, b]$, with $p > 0$ (for a string, the tension; for heat flow, the conductivity)' },
    { tex: 'u,\\ v', text: 'functions in the operator’s domain: twice differentiable and obeying the boundary conditions' },
    { tex: '\\bar v', text: 'the complex conjugate of $v$ (the inner product is $\\langle u, v\\rangle = \\int_a^b u\\,\\bar v\\,dx$)' },
    { tex: '[\\,\\cdot\\,]_a^b', text: 'the boundary term: the bracket at $b$ minus the bracket at $a$' },
  ],
  why: t`Quantum observables, the modes of a string or a drum, and the Regge–Wheeler problem of black-hole perturbations all hinge on it — and a black hole’s leaky boundary is exactly where it fails, giving complex (decaying) frequencies.`,
  visual: {
    type: 'graph',
    title: 'The boundary term decides',
    lead: t`Two candidates $u = \sin ax$ and $v = \sin bx$ on $[0, 1]$, both zero at $x = 0$. The Lagrange identity for $L = -d^2/dx^2$ reads $(a^2 - b^2)\int_0^1uv\,dx = \big[uv' - u'v\big]_{x=1}$. The readouts check it; the Robin condition $X'(1) + 2X(1) = 0$ is met when $\mu\cos\mu + 2\sin\mu = 0$.`,
    tasks: [
      'Pick any a and b: the overlap ∫uv is generally not zero, and the identity holds.',
      `Set a = ${r3(M1)} and b = ${r3(M2)}: both satisfy the Robin condition, the boundary term vanishes — and so does the overlap.`,
      'Now move only b: the boundary term reappears and orthogonality is lost.',
    ],
    params: {
      x: [0, 1], y: [-1.25, 1.25], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge',
      sliders: [
        { key: 'a', label: '$a$ in $u = \\sin ax$', min: 0.5, max: 9, step: 0.01, value: 2, unit: '', explain: '$u$ solves $-u\'\' = a^2u$ with $u(0) = 0$.' },
        { key: 'b', label: '$b$ in $v = \\sin bx$', min: 0.5, max: 9, step: 0.01, value: 4.5, unit: '', explain: '$v$ solves $-v\'\' = b^2v$ with $v(0) = 0$.' },
      ],
      curves: [{ fn: 'sin(a*x)', color: 'accent', width: 2.2, label: 'u', labelAt: 0.15, labelDy: -10 }, { fn: 'sin(b*x)', color: 'warn', width: 2, label: 'v', labelAt: 0.3, labelDy: -10 }],
      integral: { fn: 'sin(a*x)*sin(b*x)', from: 0, to: 1 },
      readouts: [
        { label: 'overlap $\\int_0^1uv\\,dx$', expr: 'integral', digits: 3, zero: 5e-4 },
        { label: 'boundary term $[uv\' - u\'v]_1$', expr: 'sin(a)*b*cos(b) - a*cos(a)*sin(b)', digits: 3, zero: 5e-3 },
        { label: '$(a^2 - b^2)\\int uv$', expr: '(a^2 - b^2)*integral', digits: 3, zero: 5e-3 },
        { label: 'Robin misfit of $u$, $v$', expr: 'abs(a*cos(a) + 2*sin(a)) + abs(b*cos(b) + 2*sin(b))', digits: 2, zero: 5e-3 },
      ],
    },
    caption: 'Numbers small enough to be round-off of the slider steps (0.01) are shown as 0. The overlap is computed by Simpson’s rule.',
  },
  example: {
    prompt: t`Show that $L = -\dfrac{d^2}{dx^2}$ on $[0, 1]$ with $u(0) = 0$ and $u'(1) + 2u(1) = 0$ is self-adjoint. Deduce that its eigenvalues are real and its eigenfunctions orthogonal, and check the first two numerically.`,
    visual: { type: 'graph', params: { x: [0, 1], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: `sin(${M1}*x)`, color: 'accent', width: 2.2, label: 'X₁', labelAt: 0.5, labelDy: -12 }, { fn: `sin(${M2}*x)`, color: 'warn', width: 2, label: 'X₂', labelAt: 0.18, labelDy: -12 }] }, caption: 'The first two eigenfunctions: each meets the end x = 1 with slope −2 times its height.' },
    steps: [
      { label: 'Boundary term at 0', text: t`$u(0) = v(0) = 0$, so $u\bar v' - u'\bar v = 0$ there.` },
      { label: 'Boundary term at 1', text: t`$u' = -2u$ and $\bar v' = -2\bar v$ (the $2$ is real), so $u\bar v' - u'\bar v = -2u\bar v + 2u\bar v = 0$. Self-adjoint: $\langle Lu, v\rangle = \langle u, Lv\rangle$.` },
      { label: 'Real eigenvalues', text: t`If $Lu = \lambda u$, then $\lambda\langle u, u\rangle = \langle Lu, u\rangle = \langle u, Lu\rangle = \bar\lambda\langle u, u\rangle$, and $\langle u, u\rangle > 0$, so $\lambda = \bar\lambda$.` },
      { label: 'Orthogonality', text: t`If $Lu_m = \lambda_mu_m$, $Lu_n = \lambda_nu_n$: $(\lambda_m - \lambda_n)\langle u_m, u_n\rangle = \langle Lu_m, u_n\rangle - \langle u_m, Lu_n\rangle = 0$, so $\langle u_m, u_n\rangle = 0$ when $\lambda_m \ne \lambda_n$.` },
      { label: 'Numbers', text: t`Eigenfunctions $\sin\mu x$ with $\mu\cos\mu + 2\sin\mu = 0$: $\mu_1 = ${r4(M1)}$, $\mu_2 = ${r4(M2)}$, so $\lambda_1 = ${r4(M1 * M1)}$, $\lambda_2 = ${r4(M2 * M2)}$ — real, as promised. Simpson’s rule gives $\int_0^1\sin\mu_1x\,\sin\mu_2x\,dx = ${Math.abs(overlap(M1, M2)) < 1e-10 ? '0' : r3(overlap(M1, M2))}$ to within $10^{-10}$, although the $\mu$ are not multiples of anything simple.` },
    ],
    answer: t`Both boundary terms vanish, so $L$ is self-adjoint; hence real eigenvalues ($${r4(M1 * M1)}$, $${r4(M2 * M2)}$, …) and orthogonal eigenfunctions $\sin\mu_nx$.`,
  },
  practice: [
    num({
      id: 'boundary', difficulty: 1,
      gen(r) {
        const m = r.int(1, 4), n = r.intExcept(1, 4, [m]);
        return {
          prompt: t`For $u = x^{${m}}$ and $v = x^{${n}}$ on $[0, 1]$ (real), evaluate the boundary term $\big[u v' - u' v\big]_0^1$ of $L = -d^2/dx^2$.`,
          visual: { type: 'graph', params: { x: [0, 1.05], y: [-0.1, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: `x^${m}`, color: 'accent', width: 2.2, label: 'u', labelAt: 0.7, labelDy: -10 }, { fn: `x^${n}`, color: 'warn', width: 2, label: 'v', labelAt: 0.85, labelDy: 14 }] }, caption: 'Neither function obeys a boundary condition at x = 1.' },
          answer: n - m, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: m - n, feedback: t`The bracket is $uv' - u'v$: at $x = 1$ that is $1\cdot${n} - ${m}\cdot1$.` }],
          hints: [t`At $x = 0$ every term has a factor $x$: it vanishes.`, t`At $x = 1$: $u = v = 1$, $u' = ${m}$, $v' = ${n}$.`],
          teach: 'Without boundary conditions the Lagrange boundary term survives, and L is not symmetric.',
          explain: t`$[uv' - u'v]_0^1 = ${n} - ${m} = ${n - m}$. So $\langle Lu, v\rangle - \langle u, Lv\rangle = ${n - m} \ne 0$: on functions free at $x = 1$, $-d^2/dx^2$ is not self-adjoint.`,
        };
      },
    }),
    mcq({
      id: 'which-bc', difficulty: 2,
      prompt: t`Which pair of conditions does **not** make $L = -d^2/dx^2$ self-adjoint on $[0, 1]$?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'x^2*(3 - 2x)', color: 'accent', width: 2.2 }], points: [{ x: 0, y: 0, label: 'u = 0, u′ = 0', color: 'gold', labelDy: -14 }, { x: 1, y: 1, label: 'free', color: 'bad', labelDx: -40 }] }, caption: 'A function pinned flat at one end and left free at the other.' },
      choices: [t`$u(0) = 0$ and $u'(0) = 0$`, t`$u(0) = 0$ and $u(1) = 0$`, t`$u(0) = u(1)$ and $u'(0) = u'(1)$`, t`$u'(0) = 0$ and $u'(1) = 0$`],
      answer: 0,
      why: {
        1: 'Dirichlet at both ends: each bracket has a factor u or v that vanishes.',
        2: 'Periodic: the brackets at 0 and 1 are equal, so their difference vanishes.',
        3: 'Neumann at both ends: each bracket has a factor u′ or v′ that vanishes.',
      },
      hints: ['Both conditions sit at x = 0. What constrains the bracket at x = 1?', 'Two conditions at one end make an initial-value problem, not a boundary-value problem.'],
      teach: 'Self-adjointness needs the boundary term to vanish at both ends (or cancel between them); two conditions at one end leave the other free.',
      explain: t`With $u(0) = u'(0) = 0$ the bracket vanishes at 0, but at 1 nothing constrains $u\bar v' - u'\bar v$. Such a problem has **no** eigenvalues at all: $-u'' = \lambda u$ with $u(0) = u'(0) = 0$ forces $u \equiv 0$.`,
    }),
    mcq({
      id: 'momentum', difficulty: 3,
      prompt: t`On $2\pi$-periodic functions with $\langle u, v\rangle = \int_0^{2\pi}u\bar v\,dx$, which operator is self-adjoint?`,
      visual: { type: 'graph', params: { x: [0, 6.2832], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'cos(3x)', color: 'accent', width: 2, label: 'Re e^(3ix)', labelAt: 0.4, labelDy: -10 }, { fn: 'sin(3x)', color: 'warn', width: 1.8, dash: [6, 4], label: 'Im', labelAt: 1.3, labelDy: -10 }] }, caption: 'e^(3ix), an eigenfunction of d/dx with eigenvalue 3i.' },
      choices: [t`$-i\dfrac{d}{dx}$`, t`$\dfrac{d}{dx}$`, t`$x\dfrac{d}{dx}$`, t`$\dfrac{d}{dx} + 1$`],
      answer: 0,
      why: {
        1: t`By parts, $\langle u', v\rangle = -\langle u, v'\rangle$: $d/dx$ is **anti**-self-adjoint, and its eigenvalues $in$ are imaginary.`,
        2: t`$x$ is not periodic, so $x\,u'$ leaves the space; and even locally the extra $-u$ from the product rule breaks the symmetry.`,
        3: 'Adding a real constant keeps d/dx anti-self-adjoint plus a multiple of the identity; it is not self-adjoint.',
      },
      hints: [t`Integrate $\langle u', v\rangle$ by parts; the periodic boundary term vanishes.`, t`A factor $-i$ turns the minus sign into a complex conjugate: $\langle -iu', v\rangle = \langle u, -iv'\rangle$.`],
      teach: 'd/dx is anti-self-adjoint; −i d/dx, the momentum operator (times ħ), is self-adjoint with real eigenvalues n.',
      explain: t`$\langle -iu', v\rangle = -i\langle u', v\rangle = i\langle u, v'\rangle = \langle u, -iv'\rangle$ (the $i$ is conjugated when it moves to the second slot). Its eigenfunctions $e^{inx}$ have real eigenvalues $n$ and are orthogonal: the **complex Fourier series is its eigenfunction expansion**.`,
    }),
    mcq({
      id: 'weight', difficulty: 3,
      prompt: t`The problem $u'' + 2u' + \lambda u = 0$, $u(0) = u(\pi) = 0$, has eigenfunctions $u_n = e^{-x}\sin nx$ (pictured). With which weight $w(x)$ are they orthogonal, $\int_0^\pi u_mu_n\,w\,dx = 0$ for $m \ne n$?`,
      visual: { type: 'graph', params: { x: [0, 3.1416], y: [-0.45, 0.6], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x)*sin(x)', color: 'accent', width: 2.2, label: 'u₁', labelAt: 0.8, labelDy: -10 }, { fn: 'e^(-x)*sin(2x)', color: 'warn', width: 2, label: 'u₂', labelAt: 0.4, labelDy: -12 }] }, caption: 'Two eigenfunctions: decaying sines. Without a weight their overlap is not zero.' },
      choices: [t`$w = e^{2x}$`, t`$w = 1$`, t`$w = e^{-2x}$`, t`$w = e^{x}$`],
      answer: 0,
      why: {
        1: t`$\int_0^\pi e^{-2x}\sin x\sin2x\,dx \ne 0$: the operator $u'' + 2u'$ is not symmetric in the plain inner product.`,
        2: t`That makes the decay worse: $e^{-4x}\sin mx\sin nx$ does not integrate to zero.`,
        3: t`Then the integrand is $e^{-x}\sin mx\sin nx$, still not orthogonal.`,
      },
      hints: [t`Multiply the equation by an integrating factor so that $u'' + 2u'$ becomes $\frac{1}{w}(wu')'$.`, t`$(e^{2x}u')' = e^{2x}(u'' + 2u')$: the Sturm–Liouville form has $p = w = e^{2x}$.`],
      teach: 'Every second-order eigenproblem becomes self-adjoint in a weighted inner product; the weight comes from the integrating factor.',
      explain: t`In Sturm–Liouville form $(e^{2x}u')' + \lambda e^{2x}u = 0$, so the eigenfunctions are orthogonal with $w = e^{2x}$: $\int_0^\pi e^{-x}\sin mx\,e^{-x}\sin nx\,e^{2x}dx = \int_0^\pi\sin mx\sin nx\,dx = 0$.`,
    }),
    order({
      id: 'real-proof', difficulty: 2,
      prompt: t`Put the proof that a self-adjoint $L$ has real eigenvalues in order.`,
      visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [-1.1, 1.1], aspect: 'wide', equal: true, xlabel: 'Re λ', ylabel: 'Im λ', axesAt: 'edge', points: [{ x: 0.6, y: 0, color: 'accent', label: 'λ = λ̄' }, { x: 0.6, y: 0.7, color: 'bad', label: 'not allowed', hollow: true }] }, caption: 'Eigenvalues of a self-adjoint operator lie on the real axis.' },
      items: [
        t`Let $Lu = \lambda u$ with $u \ne 0$`,
        t`$\langle Lu, u\rangle = \lambda\langle u, u\rangle$`,
        t`$\langle u, Lu\rangle = \bar\lambda\langle u, u\rangle$`,
        t`Self-adjointness makes the two equal`,
        t`$\langle u, u\rangle > 0$, so $\lambda = \bar\lambda$`,
      ],
      hints: ['Compute the same inner product two ways.', 'The conjugate appears when λ comes out of the second slot.'],
      teach: 'Real eigenvalues: evaluate ⟨Lu, u⟩ with L acting on either side.',
      explain: t`Pulling $\lambda$ out of the second slot conjugates it; self-adjointness equates the two expressions; dividing by the positive $\langle u, u\rangle$ leaves $\lambda = \bar\lambda$.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-qnm', difficulty: 3, transfer: true,
      prompt: t`Perturbations of a black hole obey $-\psi'' + V(x)\psi = \omega^2\psi$ on the whole line, with **outgoing-wave** conditions: $\psi \sim e^{+i\omega x}$ as $x \to +\infty$ and $\psi \sim e^{-i\omega x}$ as $x \to -\infty$ (into the horizon). Why are its eigenfrequencies $\omega$ complex?`,
      visual: { type: 'graph', params: { x: [-10, 10], y: [-0.05, 0.2], aspect: 'wide', xlabel: 'tortoise coordinate x (units of M)', ylabel: 'V', axesAt: 'edge', curves: [{ fn: '0.15/cosh(x/2.2)^2', color: 'accent', width: 2.2 }], arrows: [{ from: [3, 0.1], to: [8, 0.1], color: 'warn', label: 'to infinity' }, { from: [-3, 0.1], to: [-8, 0.1], color: 'warn', label: 'into the horizon', labelAlign: 'right', labelDx: -8 }] }, caption: 'A schematic potential barrier (Pöschl–Teller-like) with energy leaking out both ways. Not to scale.' },
      choices: ['The outgoing conditions make the boundary term nonzero — energy leaks out — so the problem is not self-adjoint and nothing forces ω² to be real', 'Because V(x) is complex', 'Because the whole line has no boundary, so every problem on it has complex eigenvalues', 'They are real; complex values are a numerical artefact'],
      answer: 0,
      why: {
        1: 'The potential is real; the complexity comes from the boundary conditions.',
        2: 'The harmonic oscillator lives on the whole line and has real eigenvalues: decaying (bound) boundary conditions keep it self-adjoint.',
        3: 'Quasinormal frequencies are measured: the ringdown of GW150914 decays, which a real ω cannot do.',
      },
      hints: ['Which ingredient of the reality proof uses the boundary conditions?', t`For outgoing waves the bracket $\psi\bar\psi' - \psi'\bar\psi$ at infinity is a flux of energy out, not zero.`],
      teach: 'Self-adjointness is a property of operator plus boundary conditions; open, leaky boundaries break it and give complex, decaying modes.',
      explain: t`With outgoing conditions the Lagrange boundary term is the energy flux carried away to infinity and into the horizon; it does not vanish, so the operator is not self-adjoint. The eigenvalues — the quasinormal modes — are complex, $\omega = \omega_R - i/\tau$, and the modes neither are orthogonal nor form a complete set in the usual sense ([quasinormal modes](#/lesson/st-d.D11.2)).`,
    }),
    mcq({
      id: 'cp-fin', difficulty: 3, transfer: true,
      prompt: t`Temperature modes of a rod $0 < x < 1$ solve $-u'' = \lambda u$ with $u(0) = 0$. Which second condition, from a hardware design, would make the modes **fail** to be orthogonal?`,
      visual: { type: 'graph', params: { x: [-0.1, 1.3], y: [-0.4, 0.6], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: '0.1', color: 'ink3', width: 6, domain: [0, 1] }], points: [{ x: 0, y: 0.1, color: 'accent', label: 'held at 0', labelDy: 20 }, { x: 1, y: 0.1, color: 'gold', label: 'tip', labelDy: -16 }] }, caption: 'A rod held at the surroundings’ temperature at x = 0; the tip at x = 1 is where designs differ.' },
      choices: [t`a controller that sets the tip’s heat flux from the base: $u'(1) = u'(0)$`, t`an insulated tip: $u'(1) = 0$`, t`a tip losing heat to the air: $u'(1) + 3u(1) = 0$`, t`a tip held at temperature 0: $u(1) = 0$`],
      answer: 0,
      why: {
        1: 'Insulated: Neumann, so the bracket at 1 vanishes.',
        2: 'Robin with a real coefficient: the bracket at 1 is −3uv̄ + 3uv̄ = 0.',
        3: 'Dirichlet: the bracket vanishes.',
      },
      hints: ['For each option, evaluate the bracket uv̄′ − u′v̄ at x = 1 (it already vanishes at 0).', t`With $u'(1) = u'(0)$ the bracket at 1 becomes $u(1)\bar v'(0) - u'(0)\bar v(1)$: nothing makes it zero.`],
      teach: 'Local conditions with real coefficients keep a Sturm–Liouville problem self-adjoint; a condition coupling the two ends generally does not.',
      explain: t`Dirichlet, Neumann and real Robin conditions each kill the bracket at $x = 1$. The feedback condition ties the tip to the base, and the bracket $u(1)\bar v'(0) - u'(0)\bar v(1)$ survives, so the operator is not self-adjoint — its modes need not be orthogonal, and its eigenvalues need not be real.`,
    }),
  ],
  sources: [SRC.boas, SRC.rhb],
});
