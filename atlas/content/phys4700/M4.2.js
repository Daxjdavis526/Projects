// Observables and Hermitian operators (Griffiths & Schroeter §3.2). Real
// expectation values for every state ⇔ ⟨f|Q̂g⟩ = ⟨Q̂f|g⟩; checking it for
// differential operators by integration by parts, where the boundary term
// −iħ[f*g] decides (vanishing tails, periodic rings — but not a half-line
// with ψ(0) ≠ 0); x̂p̂ is not Hermitian ((x̂p̂)† = p̂x̂ = x̂p̂ − iħ); determinate
// states σ_Q = 0 ⇔ Q̂Ψ = qΨ. phys4700.M0.2 did the same for matrices.
// Constants: μ_B and g from CODATA 2022 (_qm.js).
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { MU_B, GE, QE } from './_qm.js';
import { En, energyBars, r6 } from './_wells.js';

const t = String.raw;

/** A state on a ring of circumference L: √(1−w) e^{2πi a x/L} + √w e^{2πi b x/L}, drawn over one circumference. */
function ringPic(a, b, w, caption, { legend = true } = {}) {
  const p = r6(Math.sqrt(1 - w)), q = r6(Math.sqrt(w));
  return {
    type: 'graph',
    params: {
      x: [0, 1], y: [-2.2, 4.2], aspect: 'wide', xlabel: 'position round the ring, x / L', ylabel: 'ψ and |ψ|² (units of L⁻½, L⁻¹)', axesAt: 'edge', xticks: 4, yticks: 4,
      curves: [
        { fn: `(${p}*cos(${2 * a}*pi*x) + ${q}*cos(${2 * b}*pi*x))^2 + (${p}*sin(${2 * a}*pi*x) + ${q}*sin(${2 * b}*pi*x))^2`, color: 'gold', width: 2.8 },
        { fn: `${p}*cos(${2 * a}*pi*x) + ${q}*cos(${2 * b}*pi*x)`, color: 'accent', width: 2 },
        { fn: `${p}*sin(${2 * a}*pi*x) + ${q}*sin(${2 * b}*pi*x)`, color: 'warn', width: 2, dash: [6, 4] },
      ],
      ...(legend ? { legend: [{ label: '|ψ|²', color: 'gold' }, { label: 'Re ψ', color: 'accent' }, { label: 'Im ψ', color: 'warn', dash: [6, 4] }], legendAt: 'tr' } : {}),
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M4.2',
  title: 'Observables and Hermitian operators',
  minutes: 16, difficulty: 3,
  intro: t`Every measurable quantity $Q$ has an operator $\hat Q$, and its average over many identical systems is $\langle Q\rangle = \langle\Psi|\hat Q\Psi\rangle$. A measured average must be a real number for **every** state, and that single demand forces the operator to be **Hermitian**:

$$\langle f|\hat Q g\rangle = \langle\hat Q f|g\rangle \quad\text{for all } f, g$$

For [matrices](#/lesson/phys4700.M0.2) this meant equal to its conjugate transpose. For operators that differentiate, it is checked by integrating by parts — and the **boundary terms** decide: $\hat p = -i\hbar\,d/dx$ is Hermitian for wave functions that vanish at infinity or repeat round a ring, but not on every interval. A state in which $Q$ has no spread at all, a **determinate state**, is exactly an eigenfunction: $\hat Q\Psi = q\Psi$.`,
  symbols: [
    { tex: '\\hat Q', text: t`the operator of an observable $Q$: $\hat x = x$, $\hat p = -i\hbar\,d/dx$, $\hat H = \hat p^2/2m + V$` },
    { tex: 'f,\\ g', text: 'any two functions in the space the operator acts on (wave functions with its boundary conditions)' },
    { tex: '\\langle f|\\hat Q g\\rangle', text: t`the inner product of $f$ with $\hat Q$ applied to $g$: $\int f^*\,(\hat Qg)\,dx$` },
    { tex: '\\langle Q\\rangle', text: t`the expectation value $\langle\Psi|\hat Q\Psi\rangle$, real for a Hermitian $\hat Q$` },
    { tex: '\\sigma_Q', text: t`the standard deviation of results of measuring $Q$; zero exactly in an eigenstate of $\hat Q$` },
  ],
  why: 'Hermiticity is what guarantees real measured values and orthogonal eigenstates — the basis of every probability in the rest of the course.',
  visual: {
    type: 'graph',
    title: 'Determinate and indeterminate momentum',
    lead: t`A particle on a ring of circumference $L$, so that $x$ and $x + L$ are the same place. Its state mixes two momentum eigenfunctions, $e^{2\pi ix/L}$ (momentum $h/L$) and $e^{6\pi ix/L}$ (momentum $3h/L$), with weight $w$ on the second.`,
    tasks: [
      'At w = 0 the density is perfectly flat and σₚ = 0: a determinate state of momentum, an eigenfunction of p̂.',
      'Raise w: the density ripples (the two waves interfere), ⟨p⟩ slides from h/L toward 3h/L, and σₚ grows — largest at w = ½.',
      'At w = 1 the state is again determinate, with momentum 3h/L. Only eigenfunctions have σ = 0.',
    ],
    params: {
      x: [0, 1], y: [-2.2, 4.2], aspect: 'wide', xlabel: 'position round the ring, x / L', ylabel: 'ψ and |ψ|² (units of L⁻½, L⁻¹)', axesAt: 'edge', xticks: 4, yticks: 4,
      sliders: [{ key: 'w', label: 'Weight $w$ of the $3h/L$ wave', min: 0, max: 1, step: 0.05, value: 0, explain: 'The probability that a momentum measurement gives 3h/L; the rest gives h/L.' }],
      curves: [
        { fn: '1 + 2*sqrt(w*(1 - w))*cos(4*pi*x)', color: 'gold', width: 2.8 },
        { fn: 'sqrt(1 - w)*cos(2*pi*x) + sqrt(w)*cos(6*pi*x)', color: 'accent', width: 2 },
        { fn: 'sqrt(1 - w)*sin(2*pi*x) + sqrt(w)*sin(6*pi*x)', color: 'warn', width: 2, dash: [6, 4] },
      ],
      legend: [{ label: '|ψ|²', color: 'gold' }, { label: 'Re ψ', color: 'accent' }, { label: 'Im ψ', color: 'warn', dash: [6, 4] }], legendAt: 'tr',
      readouts: [
        { label: '$\\langle p\\rangle$ (units of $h/L$)', expr: '1 + 2*w', digits: 3 },
        { label: '$\\sigma_p$ (units of $h/L$)', expr: '2*sqrt(w*(1 - w))', digits: 3, zero: 1e-9 },
      ],
    },
    caption: t`Exact. On a ring $\hat p$ is Hermitian because the boundary term $[f^*g]$ cancels between $x = 0$ and $x = L$; its eigenvalues are $nh/L$ for whole numbers $n$.`,
  },
  example: {
    prompt: t`Show that $\hat p = -i\hbar\,d/dx$ is Hermitian on wave functions that vanish at $\pm\infty$, that $d/dx$ alone is not, and that $\hat x\hat p$ is not but $\tfrac12(\hat x\hat p + \hat p\hat x)$ is. Then show that $\sigma_Q = 0$ only in an eigenstate of $\hat Q$.`,
    visual: { type: 'graph', params: { x: [-4, 4], y: [-0.3, 1.1], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)', color: 'accent', width: 2.4, label: 'f', labelAt: -1.4, labelDy: -12 }, { fn: 'x*exp(-(x - 0.5)^2/2)', color: 'warn', width: 2.2, label: 'g', labelAt: 1.6, labelDy: -12 }] }, caption: 'Two wave functions that die away at both ends: the product f*g in the boundary term is zero there.' },
    steps: [
      { label: 'Integrate by parts', text: t`$\langle f|\hat pg\rangle = \int f^*(-i\hbar g')\,dx = -i\hbar\big[f^*g\big]_{-\infty}^{\infty} + i\hbar\int f^{*\prime}g\,dx$.` },
      { label: 'Kill the boundary term', text: t`Normalizable $f$ and $g$ go to zero at $\pm\infty$, so $[f^*g] = 0$. The rest is $\int(-i\hbar f')^*g\,dx = \langle\hat pf|g\rangle$, since $(-i\hbar f')^* = i\hbar f^{*\prime}$. So $\hat p$ is Hermitian.` },
      { label: 'Without the i', text: t`The same steps give $\langle f|g'\rangle = -\langle f'|g\rangle$: $d/dx$ is **anti**-Hermitian. Its expectation value $\int\psi^*\psi'dx$ is imaginary; the $-i$ in $\hat p$ is exactly what makes momentum real.` },
      { label: 'Products', text: t`$(\hat A\hat B)^\dagger = \hat B^\dagger\hat A^\dagger$, so $(\hat x\hat p)^\dagger = \hat p\hat x = \hat x\hat p - i\hbar$: not equal to $\hat x\hat p$. The average $\tfrac12(\hat x\hat p + \hat p\hat x)$ equals its own adjoint, so it is Hermitian.` },
      { label: 'Determinate states', text: t`$\sigma_Q^2 = \langle\Psi|(\hat Q - q)^2\Psi\rangle = \langle(\hat Q - q)\Psi|(\hat Q - q)\Psi\rangle = \|(\hat Q - q)\Psi\|^2$, using Hermiticity to move one factor across. A vector has zero length only if it is zero: $\sigma_Q = 0 \iff \hat Q\Psi = q\Psi$.` },
      { label: 'Sense check', text: t`A plane wave $e^{ikx}$ is an eigenfunction of $\hat p$ with eigenvalue $\hbar k$ — determinate momentum — and, as [the free particle](#/lesson/phys4700.M3.4) showed, it is not normalizable. Determinate momentum on a line is an idealization; on a ring it is a real state.` },
    ],
    answer: t`$\langle f|\hat pg\rangle = \langle\hat pf|g\rangle$ once $[f^*g]$ vanishes; $d/dx$ is anti-Hermitian; $(\hat x\hat p)^\dagger = \hat x\hat p - i\hbar$; $\sigma_Q = \|(\hat Q - q)\Psi\|$, zero only for eigenstates.`,
  },
  practice: [
    multi({
      id: 'which-hermitian', difficulty: 2,
      prompt: t`Acting on wave functions that vanish at $\pm\infty$, which of these operators are Hermitian? Select all that are.`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-0.6, 1.1], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)', color: 'accent', width: 2.4 }, { fn: '-x*exp(-x^2/2)', color: 'warn', width: 2, dash: [6, 4] }], legend: [{ label: 'a wave function f', color: 'accent' }, { label: 'its slope f′', color: 'warn', dash: [6, 4] }], legendAt: 'tr' }, caption: 'A test function and its derivative. Each integration by parts moves one d/dx from g onto f and flips a sign.' },
      choices: [t`$-i\hbar\,\dfrac{d}{dx}$`, t`$\dfrac{d^2}{dx^2}$`, t`$i\,\dfrac{d}{dx}$`, t`$\hat x^2$`, t`$\dfrac{d}{dx}$`, t`$\hat x\hat p$`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`One integration by parts gives $\langle f|g'\rangle = -\langle f'|g\rangle$: a minus sign, so $d/dx$ is anti-Hermitian.`,
        5: t`$(\hat x\hat p)^\dagger = \hat p\hat x = \hat x\hat p - i\hbar \ne \hat x\hat p$.`,
      },
      hints: [t`Each $d/dx$ moved across the inner product brings a factor $-1$; each $i$ moved across brings a complex conjugate, another $-1$.`, t`$d^2/dx^2$: two moves, two minus signs. $i\,d/dx$: the $i$ and the derivative each flip a sign.`],
      teach: 'Moving d/dx across an inner product costs a sign, and so does moving i: an operator is Hermitian when those signs cancel.',
      explain: t`$-i\hbar\,d/dx$ and $i\,d/dx$ (which is $-\hat p/\hbar$) each have one $i$ and one derivative: two sign flips. $d^2/dx^2$ has two derivatives. $\hat x^2$ is multiplication by a real function. $d/dx$ has one flip; $\hat x\hat p$ fails because $\hat x$ and $\hat p$ do not commute.`,
    }),
    num({
      id: 'boundary-term', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, -0.5, 3]), b = r.pick([1, 2, -0.5, 0.5]);
        const ans = (1 + a) * (1 + b) - 1;
        return {
          prompt: t`On the interval $0 \le x \le 1$ take the real functions $f = 1 ${a < 0 ? '-' : '+'} ${Math.abs(a)}x$ and $g = 1 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x$, which do **not** vanish at the ends. Integration by parts gives $\langle f|\hat pg\rangle - \langle\hat pf|g\rangle = -i\hbar\big[f^*g\big]_0^1$. Writing this as $-i\hbar K$, find $K$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 4.2], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 5, yticks: 4, axesAt: 'edge', curves: [{ fn: `1 + (${a})*x`, color: 'accent', width: 2.4, label: 'f', labelAt: 0.85, labelDy: -12 }, { fn: `1 + (${b})*x`, color: 'warn', width: 2.4, label: 'g', labelAt: 0.6, labelDy: 14 }], points: [{ x: 0, y: 1, color: 'gold', r: 5 }, { x: 1, y: r6(1 + a), color: 'accent', r: 5 }, { x: 1, y: r6(1 + b), color: 'warn', r: 5 }] }, caption: 'The two functions, with their values at the ends of the interval marked.' },
          answer: ans, tol: { rel: 0.001, abs: 1e-6 },
          errors: [{ value: (1 + a) * (1 + b), feedback: t`Subtract the value at the lower end: $[f g]_0^1 = f(1)g(1) - f(0)g(0)$, and $f(0)g(0) = 1$.` }],
          hints: [t`$[f^*g]_0^1 = f(1)g(1) - f(0)g(0)$.`, t`$f(1) = ${1 + a}$, $g(1) = ${1 + b}$, $f(0) = g(0) = 1$.`],
          teach: t`Hermiticity of $\hat p$ depends on the space: the boundary term $-i\hbar[f^*g]$ must vanish for every pair of allowed functions.`,
          explain: t`$K = (${1 + a})(${1 + b}) - 1 = ${fmt(ans, 4)}$, not zero. On functions with arbitrary end values $\hat p$ is not Hermitian. Impose $\psi(0) = \psi(1) = 0$ (a box) or $\psi(0) = \psi(1)$ (a ring) and the term vanishes.`,
        };
      },
    }),
    mcq({
      id: 'xp-expect', difficulty: 2,
      prompt: t`For any real, normalized wave function $\psi(x)$ that vanishes at $\pm\infty$, $\langle\psi|\hat x\hat p\,\psi\rangle = -i\hbar\int x\psi\psi'\,dx = \tfrac{i\hbar}{2}$. What does this say about $\hat x\hat p$?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-0.7, 0.7], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: '-x^2*exp(-x^2)', color: 'accent', width: 2.4 }], shade: [{ fn: '-x^2*exp(-x^2)', from: -4, to: 4, color: 'accent', alpha: 0.25 }] }, caption: 'The integrand xψψ′ for a Gaussian ψ: one-signed, with area −½ for every normalized real ψ.' },
      choices: [
        t`It is not an observable: an operator with an imaginary expectation value cannot be Hermitian`,
        t`Position times momentum is always $\hbar/2$, a new uncertainty relation`,
        t`The result is wrong; any product of observables has real expectation values`,
        t`It is Hermitian, but only for complex wave functions`,
      ],
      answer: 0,
      why: {
        1: t`The value is imaginary; it cannot be the average of real measurement results. (It is related to the commutator: $\langle\hat x\hat p - \hat p\hat x\rangle = i\hbar$.)`,
        2: t`Only commuting Hermitian operators have Hermitian products; $\hat x$ and $\hat p$ do not commute.`,
        3: 'Hermiticity is a property of the operator, not of the state: it must give real averages in every state.',
      },
      hints: ['Can the average of real measured values be imaginary?', t`$\int x\psi\psi'dx = \tfrac12\int x\,(\psi^2)'dx = -\tfrac12$ after integrating by parts.`],
      teach: 'An observable must have real expectation values in every state; a non-commuting product of observables generally does not.',
      explain: t`$-i\hbar\cdot(-\tfrac12) = \tfrac{i\hbar}{2}$: imaginary, so $\hat x\hat p$ is not Hermitian. The symmetric combination $\tfrac12(\hat x\hat p + \hat p\hat x)$ has expectation value $\tfrac12(\tfrac{i\hbar}{2} - \tfrac{i\hbar}{2}) = 0$ here: real, as it must be.`,
    }),
    num({
      id: 'sigma-E', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3]]);
        const [p, q] = r.pick([[1, 1], [3, 4], [4, 3], [1, 2], [2, 1]]);
        const L = r.pick([0.5, 1, 2]);
        const P1 = (p * p) / (p * p + q * q), P2 = 1 - P1, Ea = En(a, L), Eb = En(b, L);
        const ans = (Eb - Ea) * Math.sqrt(P1 * P2);
        return {
          prompt: t`An electron in an infinite well $L = ${L}$ nm wide is in $\tfrac{1}{\sqrt{${p * p + q * q}}}\big(${p === 1 ? '' : p}\,\psi_{${a}} + ${q === 1 ? '' : q}\,\psi_{${b}}\big)$, with $E_{${a}} = ${fmt(Ea, 4)}$ eV and $E_{${b}} = ${fmt(Eb, 4)}$ eV. What is the spread $\sigma_H$ of its energy, in eV?`,
          visual: energyBars([{ E: Ea, p: P1, label: `E${'₀₁₂₃'[a]}` }, { E: Eb, p: P2, label: `E${'₀₁₂₃'[b]}`, color: 'violet' }], { xmax: Eb * 1.2, caption: 'The two possible results with their probabilities. The spread measures how far apart they scatter.' }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: ans * ans, feedback: t`That is the variance; take its square root.` }, { value: (Eb - Ea) / 2, feedback: t`That is the spread only for equal weights. In general $\sigma = |E_${b} - E_${a}|\sqrt{P_${a}P_${b}}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\sigma_H^2 = \langle H^2\rangle - \langle H\rangle^2 = \sum P_nE_n^2 - \big(\sum P_nE_n\big)^2$.`, t`For two outcomes this simplifies to $\sigma_H = |E_${b} - E_${a}|\sqrt{P_${a}P_${b}}$.`],
          teach: 'Energy is indeterminate in a superposition of different energies; its spread is zero only in a stationary state.',
          explain: t`$P_${a} = ${fmt(P1, 3)}$, $P_${b} = ${fmt(P2, 3)}$, so $\sigma_H = ${fmt(Eb - Ea, 4)}\times\sqrt{${fmt(P1 * P2, 4)}} = ${fmt(ans, 4)}$ eV. The same mixture sloshes with period $h/(E_${b} - E_${a})$: a nonzero $\sigma_H$ is what lets anything change.`,
        };
      },
    }),
    mcq({
      id: 'determinate', difficulty: 2,
      prompt: t`In which of these states does a measurement of the energy give one value with certainty ($\sigma_H = 0$)?`,
      visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'harmonic', hw: 0.5, n: 2, show: 'psi', controls: false, readout: false, panels: ['energy', 'wave'] }, caption: 'One oscillator eigenstate, ψ₂. Ideal oscillator.' },
      choices: [
        t`$\psi_2(x)e^{-iE_2t/\hbar}$ of the oscillator`,
        t`$\tfrac{1}{\sqrt2}(\psi_0 + \psi_2)$ of the oscillator`,
        t`A Gaussian packet of a free particle`,
        t`Any state whose $\langle H\rangle$ equals an allowed level $E_n$`,
      ],
      answer: 0,
      why: {
        1: t`$\hat H$ acting on it gives $E_0\psi_0 + E_2\psi_2$, not a multiple of the state: it can give either value.`,
        2: t`A packet contains a spread of momenta, so a spread of kinetic energies.`,
        3: t`$\tfrac12(\psi_1 + \psi_3)$ of the oscillator has $\langle H\rangle = E_2$, yet never gives $E_2$ at all.`,
      },
      hints: [t`$\sigma_H = 0$ exactly when $\hat H\Psi = E\Psi$.`],
      teach: 'A determinate state of an observable is an eigenstate of its operator; for energy, a stationary state.',
      explain: t`$\hat H\psi_2 = E_2\psi_2$, so $\sigma_H = \|(\hat H - E_2)\psi_2\| = 0$: every measurement gives $E_2 = 2.5\hbar\omega$.`,
    }),
    order({
      id: 'p-proof', difficulty: 2,
      prompt: t`Put the steps showing that $\hat p$ is Hermitian in order.`,
      items: [
        t`Write $\langle f|\hat pg\rangle = \int f^*(-i\hbar g')\,dx$.`,
        t`Integrate by parts: $-i\hbar[f^*g] + i\hbar\int f^{*\prime}g\,dx$.`,
        t`Drop $[f^*g]$: normalizable functions vanish at $\pm\infty$.`,
        t`Recognise $i\hbar f^{*\prime} = (-i\hbar f')^*$.`,
        t`Conclude $\langle f|\hat pg\rangle = \langle\hat pf|g\rangle$.`,
      ],
      visual: { type: 'graph', params: { x: [-4, 4], y: [-0.3, 1.1], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)*exp(-(x - 1)^2/2)', color: 'gold', width: 2.4, label: 'f*g', labelAt: 1.2, labelDy: -12 }] }, caption: 'The product f*g for two normalizable functions: zero at both ends, so the boundary term vanishes.' },
      hints: ['The boundary term appears only after integrating by parts.', 'Recognising the conjugate is the last step before the conclusion.'],
      teach: 'Integrate by parts, kill the boundary term, and read the remaining integral as an inner product with p̂ acting on the left.',
      explain: t`Write out → integrate by parts → boundary term vanishes → recognise $(\hat pf)^*$ → Hermitian. Every step but the third works on any interval; the third is where the space’s boundary conditions enter.`,
    }),
    mcq({
      id: 'H-any', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “The particle is in $\Psi = \tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$ with $\langle H\rangle = \bar E$, so $\hat H\Psi = \bar E\,\Psi$.” What is wrong?`,
      visual: energyBars([{ E: 1, p: 0.5, label: 'E₁' }, { E: 4, p: 0.5, label: 'E₂', color: 'violet' }], { xmax: 5, xlabel: 'energy (units of E₁)', caption: 'The two results this state can give. The mean, 2.5 E₁, is not one of them.' }),
      choices: [
        t`$\hat H\Psi = \tfrac{1}{\sqrt2}(E_1\psi_1 + E_2\psi_2)$, which is not a multiple of $\Psi$: only eigenstates satisfy $\hat H\Psi = E\Psi$`,
        t`It should read $\hat H\Psi = \bar E^2\Psi$`,
        t`Nothing; $\hat H\Psi = \langle H\rangle\Psi$ holds for every state`,
        t`$\hat H\Psi$ is the state after an energy measurement, which is $\psi_1$ or $\psi_2$`,
      ],
      answer: 0,
      why: {
        1: t`Squaring changes nothing: no number multiplies $\Psi$ to give $\hat H\Psi$ here.`,
        2: t`If it held for every state, every state would have $\sigma_H = 0$ — but this one gives $E_1$ or $E_2$ at random.`,
        3: t`$\hat H\Psi$ is not a state after anything; it is not even normalized. Measurement replaces $\Psi$ by an eigenstate; applying $\hat H$ does not.`,
      },
      hints: [t`Apply $\hat H$ term by term using $\hat H\psi_n = E_n\psi_n$.`],
      teach: 'Applying an operator to a state is not measuring; Q̂Ψ = qΨ holds only for eigenstates.',
      explain: t`$\hat H\Psi = \tfrac{1}{\sqrt2}(E_1\psi_1 + E_2\psi_2)$ points in a different direction from $\Psi$ in Hilbert space. Its inner product with $\Psi$, $\tfrac12(E_1 + E_2)$, is $\langle H\rangle$ — that is all the expectation value captures.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ring-spread', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [0, 2], [2, 5]]);
        const w = r.pick([0.2, 0.25, 0.5, 0.36]);
        const ans = (b - a) * Math.sqrt(w * (1 - w));
        return {
          prompt: t`A particle on a ring of circumference $L$ is in $\sqrt{${fmt(1 - w, 3)}}${a === 0 ? '' : t`\,e^{2\pi i${a === 1 ? '' : a}x/L}`} + \sqrt{${w}}\,e^{2\pi i${b}x/L}$ (in units with $L = 1$, normalized). The momentum eigenvalues are $nh/L$. What is $\sigma_p$, in units of $h/L$?`,
          visual: ringPic(a, b, w, 'The state round the ring: the density ripples because the two momentum components interfere.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans * ans, feedback: 'That is the variance; take its square root.' }, { value: (b - a) * w * (1 - w), feedback: t`$\sigma = |p_2 - p_1|\sqrt{P_1P_2}$: the square root of the product of the probabilities.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The results are ${a} and ${b} (units of $h/L$) with probabilities $${fmt(1 - w, 3)}$ and $${w}$.`, t`$\sigma_p = |${b} - ${a}|\sqrt{${fmt(1 - w, 3)}\times${w}}$.`],
          teach: 'A mixture of two momentum eigenstates has an indeterminate momentum, with spread |p₂ − p₁|√(P₁P₂).',
          explain: t`$\sigma_p = ${b - a}\sqrt{${fmt(w * (1 - w), 4)}} = ${fmt(ans, 4)}\,h/L$. Only a single $e^{2\pi inx/L}$ would give $\sigma_p = 0$ — and then the density would be flat.`,
        };
      },
    }),
    mcq({
      id: 'cp-half-line', difficulty: 3,
      prompt: t`On the half-line $x \ge 0$, with wave functions that vanish at $\infty$ but not necessarily at $x = 0$, is $\hat p = -i\hbar\,d/dx$ Hermitian?`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.1], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 5, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x)', color: 'accent', width: 2.4, label: 'f', labelAt: 0.9, labelDy: -12 }, { fn: 'exp(-x^2/4)', color: 'warn', width: 2.4, label: 'g', labelAt: 2.2, labelDy: -12 }], points: [{ x: 0, y: 1, color: 'gold', r: 5, label: 'f(0)g(0) = 1', labelDx: 12, labelDy: 22 }] }, caption: 'Two functions on the half-line that vanish at infinity but not at the wall.' },
      choices: [
        t`No: the boundary term $i\hbar f^*(0)g(0)$ survives, so $\langle f|\hat pg\rangle \ne \langle\hat pf|g\rangle$ in general`,
        t`Yes: $\hat p$ is Hermitian on every interval`,
        t`Yes, because both functions vanish at infinity`,
        t`Only if the functions are real`,
      ],
      answer: 0,
      why: {
        1: t`Hermiticity depends on the boundary conditions; the derivative alone does not settle it.`,
        2: 'One end is not enough: the term at x = 0 remains.',
        3: t`For real $f = g$, $\langle f|\hat pf\rangle = -i\hbar\int ff' = \tfrac{i\hbar}{2}f(0)^2$: imaginary, which shows the failure plainly.`,
      },
      hints: [t`Integrate $\int_0^\infty f^*(-i\hbar g')\,dx$ by parts and keep the boundary term.`, t`$-i\hbar\big[f^*g\big]_0^\infty = i\hbar f^*(0)g(0)$: is it zero for these functions?`],
      teach: 'The same differential operator can be Hermitian on one space of functions and not on another; the boundary terms decide.',
      explain: t`$-i\hbar[f^*g]_0^\infty = i\hbar f^*(0)g(0) \ne 0$. This is why the radial momentum $-i\hbar\,\partial_r$ in three dimensions needs care, and why hydrogen is solved with $\hat H$, whose boundary terms do vanish, rather than with a radial momentum.`,
    }),
    num({
      id: 'cp-magnetometer', difficulty: 2, transfer: true,
      gen(r) {
        const B = r.pick([25, 40, 50, 65]);       // μT
        const ans = (GE * MU_B * B * 1e-6 / 2) / QE * 1e9;   // neV
        return {
          prompt: t`An optically pumped magnetometer, of the kind flown on satellites to map Earth’s field, measures the energy splitting of electron spins. In a field $B = ${B}\ \mu\text{T}$ along $z$, the spin Hamiltonian $\hat H = (g\mu_B B/\hbar)\,\hat S_z$ has the determinate states $|\pm z\rangle$, with energies $\pm\tfrac12g\mu_BB$. A spin prepared along $+x$ is not determinate in energy. What is its $\sigma_H$, in neV? ($g = ${fmt(GE, 6)}$, $\mu_B = ${tex(MU_B, 6)}$ J/T.)`,
          visual: energyBars([{ E: 1, p: 0.5, label: '−½gμB·B' }, { E: 3, p: 0.5, label: '+½gμB·B', color: 'violet' }], { xmax: 4, xlabel: 'energy (schematic)', hideP: false, caption: 'A +x spin gives either energy with probability ½. Schematic energy axis.' }),
          answer: ans, units: 'neV', tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`The two energies are $\pm\tfrac12g\mu_BB$, a gap of $g\mu_BB$; $\sigma = \text{gap}\times\sqrt{\tfrac12\cdot\tfrac12}$ is half the gap.` }, { value: ans * 1e3, feedback: 'Check the conversion: 1 neV = 10⁻⁹ eV.' }],
          hints: [t`With $P_\pm = \tfrac12$, $\sigma_H = |E_+ - E_-|\sqrt{P_+P_-} = \tfrac12g\mu_BB$.`, t`Convert joules to eV with $1\ \text{eV} = ${tex(QE, 10)}$ J.`],
          teach: t`A state that is not an eigenstate of $\hat H$ has an energy spread, here $\tfrac12g\mu_BB$ — and that spread is what makes the spin precess.`,
          explain: t`$\sigma_H = \tfrac12(${fmt(GE, 5)})(${tex(MU_B, 4)})(${tex(B * 1e-6, 2)})\ \text{J} = ${fmt(ans, 3)}$ neV. The +x spin precesses about $B$ at $g\mu_BB/h = ${fmt(GE * MU_B * B * 1e-6 / 6.62607015e-34 / 1e6, 4)}$ MHz — the frequency the magnetometer actually measures.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Bonneau, Faraut & Valent, “Self-adjoint extensions of operators and the teaching of quantum mechanics”, Am. J. Phys. 69, 322 (2001)', url: 'https://doi.org/10.1119/1.1328351' },
  ],
});
